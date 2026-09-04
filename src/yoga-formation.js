/* ===================================================================
   YOGA FORMATION (src/yoga-formation.js)
   -------------------------------------------------------------------
   The vocabulary a yoga uses to describe ITSELF to the chart.

   Sangram's correction, 5 Sep 2026, is the whole reason this file
   exists:

     "Do not design Yoga selection around highlighting the one house
      where the Yoga happens. Many involve multiple planets, multiple
      houses, lordships, aspects, exchanges, or conditions across the
      chart. The interaction needs to highlight the entire formation,
      whatever that formation happens to be. Use a formation graph."

   He is right, and the failure was already in the data: every
   detector in yogas.js computes the houses, lordships, dignities and
   aspects its rule turns on, spends them on an English sentence, and
   returns {name, because, strength, planets}. The structure was
   never missing — it was discarded. This file is where it survives.

   THE ONE IDEA: the Fact is the atom.

   A detector authors ONE list of typed claims. Each fact carries, in
   one object: the typed payload a professional inspects, one
   sentence, the marks it puts on the chart, whether it is
   load-bearing, and whether it held.

   Everything else is DERIVED by a pure function, never authored
   twice — because two hand-written descriptions of one yoga drift,
   and the one that drifts is always the one nobody is looking at:

     still highlight   collapse(f)
     formation story   story(f)          (spec §74)
     y.planets         cast.map(r=>r.g)
     y.strength        scoreOf(...).band
     "See why" rows    story(f)
     VoiceOver         story(f).map(s=>s.says)

   Two consequences worth stating plainly:

     A mark cannot exist without a sentence. Marks live inside facts,
     and a fact without `says` is rejected — so the chart can never
     light something up that VoiceOver cannot name (§67, §87).

     Formation and strength are separate (§62). `formed()` is a pure
     boolean over the REQUIRED facts. Strength is a different object
     with its own weighted terms. A yoga is formed or it is not;
     how strongly it expresses is a second question.

   No DOM, no imports from app.js — so the engine, the renderer, the
   report and the tests all read the same code.
   =================================================================== */

/* What the engine actually knows. Stamped on every formation so that a
   practitioner reading the facts cannot mistake them for more precision
   than buildYogaChart() supplies. Surface this wherever facts are shown
   to someone checking the work (§49, §95). */
export const MODEL = {
  houses: "whole-sign, counted from the lagna",
  drishti: "full aspects only — no orbs, no partial (1/4, 3/4) drishti",
  dignity: "exalted / own / debilitated only — no moolatrikona, no friendships",
  motion: "none — buildYogaChart keeps longitude only, so no retrogradation",
  charts: "D1 rashi only",
  tradition: "Parashari/Phaladeepika mainstream; per-rule choices are noted in yogas.js",
};

/* The structural shapes, not a taxonomy of yogas. These drive copy and
   grouping ONLY — the renderer never reads them (§59: categories are
   organisational aids, not universal standards). */
export const SHAPES = ["conjunction", "relative-to-moon", "relative-geometry",
  "exchange", "lordship-web", "dignity-kendra", "cancellation"];

/* ---- MARKS -------------------------------------------------------
   The renderer's ENTIRE vocabulary. Closed, three kinds. The renderer
   switches on `m`, on a link's `style`, and on nothing else — never on
   a yoga's name, never on its shape. That is what makes a nineteenth
   yoga zero renderer code.

   graha tones
     lit   full brightness      the yoga is made OF this graha
     ref   half-lit, cool       what the rule counts FROM
     flaw  full but desaturated the damaged or subject graha

   house tones — TWO INDEPENDENT CHANNELS, because a cell can carry two
   different claims at once and an exchange is exactly that:
     FILL  seat  a graha sits here      ref  the count starts here
           path  the count passes here
     EDGE  rule  this house is LORDED by a participant standing
                 elsewhere — the claim that has no seat
           alt   a cell the rule would ALSO have accepted

   Fill-versus-outline is a different CHANNEL, not a different
   brightness, so the seat/lordship distinction survives greyscale and
   does not rely on colour (§87).                                     */

/** @typedef {{m:"graha", g:string, tone:"lit"|"ref"|"flaw", badge?:string}} GrahaMark */
/** @typedef {{m:"house", h:number, tone:"seat"|"ref"|"path"|"rule"|"alt", badge?:string}} HouseMark */

/** @typedef {{g?:string, h:number}} Ref
 *  `h` is ALWAYS present — the graha's own seat — so a link can never be
 *  silently dropped because the planet layer has not been positioned yet. */

/** @typedef {Object} LinkMark
 *  @prop {"link"} m
 *  @prop {Ref} from
 *  @prop {Ref} to
 *  @prop {"pair"|"arrow"|"swap"|"step"} style
 *    pair   symmetric chord, no head    a conjunction, a mutual aspect
 *    arrow  chord with a head at `to`   lordship, dispositor, rescue
 *    swap   two opposite arcs, a head   a reciprocal exchange, drawn as
 *           at each far end             reciprocal rather than asserted
 *    step   an arc walking the ring     "the 2nd FROM the Moon" — the
 *           through `via`               reader watches the count happen
 *  @prop {"lit"|"ref"|"flaw"} tone
 *  @prop {string} [label]
 *  @prop {number[]} [via]   step only: the houses walked, in order
 */

/** @typedef {GrahaMark|HouseMark|LinkMark} Mark */

/* ---- FACTS -------------------------------------------------------
   Eleven types. A twelfth needs a written justification, because the
   value here is that a practitioner can learn the vocabulary once.

   A FAILED clause is the SAME SHAPE as a passed one — {ok:false, why}.
   That is what finally delivers what saraswati() and kahala() promise
   in their own comments and have never been able to show.            */

/** @typedef {"seat"|"conjunction"|"count"|"lordship"|"dignity"|"combustion"
 *          |"drishti"|"exchange"|"dispositor"|"company"|"cancels"} FactType */

/** @typedef {Object} Fact
 *  @prop {string}   id    stable within the formation ("count:Moon>Saturn").
 *                         Steps and strength terms cite THIS, never an
 *                         array index — an index silently points at the
 *                         wrong thing the first time someone inserts a line.
 *  @prop {FactType} t
 *  @prop {boolean}  ok    did this clause hold on this chart
 *  @prop {boolean}  req   load-bearing for FORMATION (not for strength)
 *  @prop {string}   says  ONE sentence, present tense, <= 100 chars
 *  @prop {string}   [why] ok:false only — why it failed, in plain words
 *  @prop {Mark[]}   draw  [] is legal and common (eligibility clauses)
 *  @prop {string}   [group] clause id; multi-clause yogas chapter by it
 *  @prop {boolean}  [cancelled] dignity only; set by detectYogas' post-pass
 *
 *  typed payload, one shape per `t`:
 *    seat        {g, sign, house, deg, cls}
 *    conjunction {grahas[], sign, house, maxSep}
 *    count       {from, fromSign, toSign, n, cls, via[]}
 *    lordship    {g, houses[] ASCENDING, signs[], yogakaraka}
 *    dignity     {g, value, sign}
 *    combustion  {g, sep, orb, deep}
 *    drishti     {from, toSign, toHouse, n, special, mutual}
 *    exchange    {grahas:[a,b], houses:[ha,hb], signs:[sa,sb], variant}
 *    dispositor  {g, of, sign}
 *    company     {sign, house, grahas[], malefic[]}
 *    cancels     {clause, of:factId, by[]}
 */

/** @typedef {{from:"lagna"}|{from:"graha", graha:string, sign:number, house:number}} Frame
 *  What the rule counts FROM. Gajakesari's kendra and Sasa's kendra are
 *  the same four cells on a North Indian chart and differ ONLY here —
 *  which is why the frame has to be data and not a sentence. */

/** @typedef {Object} Role
 *  The practitioner's placement table (§95). Inspection, never the rule:
 *  a detector emits only the facts its rule reads, while `cast` carries
 *  the full placement of everyone involved so the work can be checked
 *  without re-deriving it. */

/** @typedef {{code:string, from?:string, delta:number, says:string}} Term */

/** @typedef {Object} Strength
 *  @prop {"benefit"|"affliction"|"grade"} polarity
 *  @prop {number} base
 *  @prop {number} score  0..100 — INTERNAL. Never shown (§40).
 *  @prop {"weak"|"moderate"|"strong"} band
 *  @prop {Term[]} terms */

/** @typedef {Object} Formation
 *  @prop {string} key        stable identity, survives a recompute and a
 *                            profile switch — replaces the array index
 *  @prop {string} shape
 *  @prop {"D1"}   chart      the frame these house numbers belong to
 *  @prop {string} [variant]
 *  @prop {Frame}  frame
 *  @prop {Role[]} cast
 *  @prop {Fact[]} facts
 *  @prop {(string|string[])[]} [story]  fact ids to OVERRIDE the default
 *                            order. Omit it and the steps are derived —
 *                            which is what lets a yoga support the
 *                            formation story WITHOUT being authored as
 *                            one (the hard requirement in §74).
 *  @prop {Strength} strength
 *  @prop {{key:string, rel:string}[]} [related] */

/* ---- builders: a detector writes four lines, not forty ------------ */
export const P = (g, tone = "lit", badge) => ({ m: "graha", g, tone, ...(badge && { badge }) });
export const H = (h, tone = "seat", badge) => ({ m: "house", h, tone, ...(badge && { badge }) });
export const L = (from, to, style, tone = "lit", o = {}) =>
  ({ m: "link", from, to, style, tone, ...o });
export const F = o => ({ ok: true, req: false, draw: [], group: null, ...o });

/* ---- derivations: the only things the app ever reads -------------- */

/** A yoga is formed when every REQUIRED fact held. Nothing else. */
export const formed = f => f.facts.every(x => !x.req || x.ok);

const FILL = { seat: 3, ref: 2, path: 1 }, EDGE = { rule: 2, alt: 1 };

/** The still frame: the union of every mark on every fact that held.
 *
 *  `alt` is deliberately EXCLUDED. Those are the cells the rule would
 *  also have accepted, and they belong inside their own step, where the
 *  sentence "a kendra from the Moon is the whole rule" is on screen to
 *  explain them. Left in the static picture they read as "you nearly
 *  had it four more ways", which is both wrong and the kind of
 *  fortune-teller flourish this app does not do. */
export function collapse(f) {
  const grahas = new Map(), fill = new Map(), edge = new Map(),
    links = [], badges = [];
  for (const x of f.facts) {
    if (!x.ok) continue;
    for (const m of x.draw) {
      if (m.m === "graha") {
        if (!grahas.has(m.g) || m.tone === "lit") grahas.set(m.g, m.tone);
        if (m.badge) badges.push({ on: { g: m.g }, text: m.badge });
      } else if (m.m === "house") {
        if (m.tone === "alt") continue;
        const isFill = FILL[m.tone] !== undefined;
        const c = isFill ? fill : edge, rank = isFill ? FILL : EDGE;
        if (!c.has(m.h) || rank[m.tone] > rank[c.get(m.h)]) c.set(m.h, m.tone);
        if (m.badge) badges.push({ on: { h: m.h }, text: m.badge });
      } else links.push(m);
    }
  }
  return { grahas, fill, edge, links, badges };
}

/** Bucket an arbitrary mark list the same way collapse() buckets a
 *  formation, so one step of the story draws through the identical path
 *  as the still frame. `alt` IS kept here — a step is where it belongs. */
export function bucket(marks) {
  return collapse({ facts: [{ ok: true, draw: marks.filter(m => m.m !== "house" || m.tone !== "alt") }] });
}
export function bucketWithAlt(marks) {
  const c = collapse({ facts: [{ ok: true, draw: marks.filter(m => !(m.m === "house" && m.tone === "alt")) }] });
  for (const m of marks) if (m.m === "house" && m.tone === "alt" && !c.fill.has(m.h) && !c.edge.has(m.h)) c.edge.set(m.h, "alt");
  return c;
}

/* ---- PARTS -------------------------------------------------------
   A yoga is not always one relationship. Kendra-Trikona Raja Yoga is a
   CLASS: on a Taurus chart it can be three separate qualifying
   relationships, and reporting them as one five-planet yoga is simply
   wrong — the founder caught this, and the engine had the structure all
   along in `group`.

   parts() surfaces those groups as first-class formations the UI can
   list and focus one at a time. A yoga with no groups returns a single
   part covering everything, so the caller never branches. */
export function parts(f) {
  const order = [], byGroup = new Map();
  for (const x of f.facts) {
    if (!x.ok) continue;
    const g = x.group;
    if (g == null) continue;
    if (!byGroup.has(g)) { byGroup.set(g, []); order.push(g); }
    byGroup.get(g).push(x);
  }
  if (!order.length) return [{ id: "all", facts: f.facts.filter(x => x.ok), whole: true,
    grahas: [...new Set(f.cast.map(r => r.g))], marks: f.facts.flatMap(x => x.ok ? x.draw : []) }];
  return order.map(id => {
    const facts = byGroup.get(id);
    const grahas = [...new Set(facts.flatMap(x => x.draw)
      .filter(m => m.m === "graha" && m.tone !== "ref").map(m => m.g))];
    return { id, facts, grahas, marks: facts.flatMap(x => x.draw),
      /* the clause that says WHERE or HOW they meet, for the row's second line */
      how: (facts.find(x => ["conjunction", "exchange", "drishti", "count"].includes(x.t))
        || facts[facts.length - 1]).says,
      /* the lordship clauses, for the row's first line */
      lords: facts.filter(x => x.t === "lordship").map(x => ({ g: x.g, houses: x.houses })) };
  });
}

/** @typedef {{i:number, says:string, marks:Mark[], facts:Fact[], group:string|null}} Step */

/** The formation story (§74). Free for every yoga; `f.story` only
 *  reorders and groups. No detector is obliged to author a sequence,
 *  and no sentence is ever written twice. */
export function story(f) {
  const byId = new Map(f.facts.map(x => [x.id, x]));
  const groups = f.story
    ? f.story.map(s => (Array.isArray(s) ? s : [s]).map(id => byId.get(id)).filter(Boolean))
    : f.facts.filter(x => x.ok && x.draw.length).map(x => [x]);
  return groups.filter(g => g.length).map((g, i) => ({
    i, group: g[0].group, facts: g,
    says: g.map(x => x.says).join(" "),
    marks: g.flatMap(x => x.draw),
  }));
}

/* ---- strength ----------------------------------------------------
   Deterministic, cited, and the SAME arithmetic for every rule — one
   table instead of eighteen hand-written ternaries, each of which
   grades on whichever factor its author happened to be thinking about.
   (Gajakesari's, for one, weighs combustion and ignores debilitation.)

   The 0-100 score is INTERNAL and must never reach the interface
   (§40 — "do not invent a universal 0-100 yoga score"). It exists so
   the band is reproducible and the factors are additive; what the
   reader sees is the band and the reasons.                            */
export const WEIGHT = {
  "dignity.exalted": 14, "dignity.own": 12,
  "dignity.debilitated": -16, "dignity.debilitated.cancelled": -6,
  "combustion": -14, "combustion.deep": -22,
  "company.malefic": -10, "cancels": 14,
  "exchange.Maha": 14, "exchange.Khala": 0, "exchange.Dainya": -22,
};

/** Terms derived from the facts the rule actually emitted. Deduped by
 *  code+target, which makes a double-count structurally impossible. */
export function termsFrom(facts) {
  const out = new Map();
  for (const x of facts) {
    if (!x.ok) continue;
    let code = null, target = x.g || "";
    if (x.t === "dignity") code = `dignity.${x.value}` + (x.cancelled ? ".cancelled" : "");
    else if (x.t === "combustion") code = x.deep ? "combustion.deep" : "combustion";
    else if (x.t === "company" && x.malefic && x.malefic.length) { code = "company.malefic"; target = String(x.house); }
    else if (x.t === "exchange") { code = `exchange.${x.variant}`; target = (x.grahas || []).join("+"); }
    else if (x.t === "cancels") { code = "cancels"; target = x.clause || x.of || ""; }
    if (!code || WEIGHT[code] === undefined) continue;
    const k = code + ":" + target;
    if (!out.has(k)) out.set(k, { code, from: x.id, delta: WEIGHT[code], says: x.says });
  }
  return [...out.values()];
}

const clamp = n => Math.max(0, Math.min(100, n));

/** @returns {Strength} */
export function scoreOf(base, facts, polarity = "benefit", extra = []) {
  const terms = [...termsFrom(facts), ...extra];
  const score = clamp(base + terms.reduce((n, t) => n + t.delta, 0));
  return {
    polarity, base, score, terms,
    band: score >= 70 ? "strong" : score >= 40 ? "moderate" : "weak",
  };
}

/* ---- dev validator -----------------------------------------------
   Plain JS has no type check and this file is a vocabulary, so this is
   the substitute: it is what stops a typo shipping as a half-drawn
   chart or a mark nobody can hear. Called from detectYogas behind
   globalThis.ASTRA_DEV, and unconditionally from the validators.      */
const TONES = { graha: ["lit", "ref", "flaw"], house: ["seat", "ref", "path", "rule", "alt"] };
const STYLES = ["pair", "arrow", "swap", "step"];

export function assertFormation(f, GRAHAS) {
  const where = f && f.key ? f.key : "(no key)";
  const fail = m => { throw new Error(`${where}: ${m}`); };
  if (!f.key) fail("formation has no key");
  if (!SHAPES.includes(f.shape)) fail(`unknown shape ${f.shape}`);
  if (f.chart !== "D1") fail("only D1 formations are drawable");
  if (!f.frame || (f.frame.from !== "lagna" && !f.frame.graha)) fail("frame is not stated");

  const ids = new Set();
  for (const x of f.facts) {
    if (ids.has(x.id)) fail(`duplicate fact id ${x.id}`);
    ids.add(x.id);
    if (x.req && !x.ok) fail(`required fact ${x.id} did not hold — the yoga should not have been emitted`);
    if (!x.ok && !x.why) fail(`unmet fact ${x.id} has no why`);
    if (!x.says) fail(`fact ${x.id} has no sentence — a mark VoiceOver cannot name`);
    if (x.says.length > 100) fail(`fact ${x.id} says ${x.says.length} chars, max 100`);
    for (const m of x.draw) {
      if (m.m === "graha") {
        if (!GRAHAS.includes(m.g)) fail(`unknown graha ${m.g}`);
        if (!TONES.graha.includes(m.tone)) fail(`bad graha tone ${m.tone}`);
      } else if (m.m === "house") {
        if (!(m.h >= 1 && m.h <= 12)) fail(`house ${m.h} out of range`);
        if (!TONES.house.includes(m.tone)) fail(`bad house tone ${m.tone}`);
      } else if (m.m === "link") {
        if (!STYLES.includes(m.style)) fail(`bad link style ${m.style}`);
        for (const r of [m.from, m.to]) if (!(r && r.h >= 1 && r.h <= 12)) fail("link endpoint has no house");
        if (m.style === "step" && (m.via || []).length > 5) fail("step link walks more than 5 cells");
      } else fail(`unknown mark kind ${JSON.stringify(m)}`);
    }
  }
  const s = f.strength;
  if (!s || !["weak", "moderate", "strong"].includes(s.band)) fail("no strength band");
  if (!Number.isFinite(s.score)) fail("strength score is not a number");
  for (const t of s.terms) if (t.from && !ids.has(t.from)) fail(`term ${t.code} cites missing fact ${t.from}`);
  for (const id of (f.story || []).flat()) if (!ids.has(id)) fail(`story cites missing fact ${id}`);
  /* the invariant the whole separation rests on */
  if (!formed(f)) fail("emitted a formation that is not formed");
  return true;
}
