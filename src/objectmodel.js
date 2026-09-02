/* ===================================================================
   OBJECT MODEL — the one entity/data layer every CelestialObjectDetail
   screen (planet, house, rashi, nakshatra) reads from.

   Pure functions. No DOM, no globals, no caches that outlive a call.
   Everything here is DERIVED from a longitude, a date and the classical
   Parashari tables named in the comments. Nothing is generated, nothing
   is invented, and no AI writes into this file's outputs.

   Why this module exists (docs/UNIVERSE_OBJECT_SYSTEM_AUDIT.md §3, §4):
   the prototype currently carries four dignity implementations, three
   combustion orb tables that disagree, three drishti tables, three
   benefic/malefic schemes and no single "this graha at this date"
   record. Every screen re-derives the same facts slightly differently.
   This module is the single source for:

     identity   pointIdentity()        longitude -> sign/nak/pada/lords
     dignity    dignityOf()            one enum, exalt..enemy
     combustion combustion()           ONE orb table (supersedes all)
     motion     speeds() stationInfo() degrees/day, stations
     nature     naturalNature()        natural benefic/malefic
                functionalNature()     lagna-derived lordship verdict
     record     placementRecord()      the shape natal AND now both use
     relation   aspectsFrom()          Parashari drishti, by sign
                transitToNatal()       today's graha against the chart
     compare    comparePlacement()     birth vs now, with changes[]
     timing     timingContext()        dasha / sade sati / ingress / station
     strength   bindu() houseClass()   ashtakavarga + house sets

   Editorial rules this file obeys (locked):
   - deterministic engine facts only; every string names its reason
   - dignity is by SIGN (plus the classical degree spans), never by house
   - NO "benefic in houses X/Y/Z" tables. Natural nature, functional
     nature, dignity, lordship, placement, aspect, conjunction and timing
     are DISTINCT concepts and are returned as distinct fields with
     distinct reasons, so a screen can teach them one at a time
   - language is hedged: "traditionally", "in the classical scheme",
     "is read as" — never "will", never "causes"
   =================================================================== */

import {
  pointGrid, nakLord, fmtDMS,
  SIGN_NAMES, SIGN_LORDS, NAK_NAMES, NAK_META, norm
} from './zodiac.js';
import { positions } from './ephemeris.js';
import { houseFrom } from './panchang.js';
import { AV_GRAHAS } from './ashtakavarga.js';

/* ------------------------------------------------------------------ */
/* small shared arithmetic                                             */
/* ------------------------------------------------------------------ */

export const GRAHAS = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"];
export const SEVEN  = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"];
export const NODES  = ["Rahu","Ketu"];
export const isNode = g => g === "Rahu" || g === "Ketu";

/* shortest signed difference a->b, -180..+180 */
export const wrapDelta = x => ((x % 360) + 540) % 360 - 180;
/* shortest unsigned angular distance, 0..180 */
export const sepDeg = (a, b) => Math.abs(wrapDelta(norm(b) - norm(a)));
/* the n-th sign counted from s, n >= 1 (s itself is n = 1) */
export const advSign = (s, n) => ((s - 1 + n - 1) % 12 + 12) % 12 + 1;
export const signLordOf = sign => SIGN_LORDS[(sign - 1 + 12) % 12];
/* the signs a graha owns, 1..12 */
export const signsOwnedBy = g => SIGN_LORDS
  .map((lord, i) => (lord === g ? i + 1 : 0)).filter(Boolean);

export const ordinal = n => {
  const a = Math.abs(n) % 100, b = a % 10;
  const suf = (a > 3 && a < 21) ? "th" : b === 1 ? "st" : b === 2 ? "nd" : b === 3 ? "rd" : "th";
  return `${n}${suf}`;
};

/* ==================================================================
   1. IDENTITY — everything a point is, from its longitude alone
   ================================================================== */

/* Thin, named wrapper over zodiac.js pointGrid(): same float-safe
   nakshatra/pada arithmetic, plus the two lords a detail screen always
   needs (sign lord for dispositor/lordship, nakshatra lord for the
   Vimshottari link) and a formatted degree for display. */
export function pointIdentity(L) {
  const g = pointGrid(L);
  return {
    L: g.longitude,
    sign: g.sign,
    signName: g.signName,
    degInSign: g.degInSign,
    degText: fmtDMS(g.degInSign),
    nak: g.nak,
    nakName: g.nakName,
    pada: g.pada,
    degInNak: g.degInNak,
    nakLord: g.lord,
    signLord: signLordOf(g.sign)
  };
}

/* ==================================================================
   2. DIGNITY — one enum for natal, transit, varga and yoga screens
   ==================================================================

   Precedence: exalted > moolatrikona > own > debilitated >
   friend / neutral / enemy (by the lord of the occupied sign).

   Exaltation and debilitation are read by SIGN. The one exception is
   Mercury, whose exaltation sign IS its own sign: the classical texts
   segment Virgo explicitly — 0°-15° exaltation, 15°-20° moolatrikona,
   20°-30° own — so the exaltation test for Mercury carries that 15°
   limit. No other graha's exaltation sign is also its own sign.

   Moolatrikona spans used here (degrees within the sign):
     Sun     Leo        0°-20°
     Moon    Taurus     3°-30°
     Mars    Aries      0°-12°
     Mercury Virgo     15°-20°
     Jupiter Sagittarius 0°-10°
     Venus   Libra      0°-15°
     Saturn  Aquarius   0°-20°
   Choice noted: the Moon's span is given as Taurus 3°-30° in one
   widespread reading and as 4°-20° in another. We take 3°-30°. It is
   moot for the verdict — Taurus is also the Moon's sign of exaltation
   and exaltation ranks first — so the overlap is named in `why`
   instead of being silently resolved, because the two ideas are
   different ideas and the UI should be able to teach both.

   Natural friendship is the Parashari table (identical to the one held
   privately in shadbala.js, audit gap 4b — export it from here now).
   Compound/temporal friendship is deliberately NOT modelled: it needs
   the whole chart and is a separate teaching step.
   ================================================================== */

export const DIGNITY = {
  EXALTED:      'exalted',
  MOOLATRIKONA: 'moolatrikona',
  OWN:          'own',
  DEBILITATED:  'debilitated',
  FRIEND:       'friend',
  NEUTRAL:      'neutral',
  ENEMY:        'enemy'
};

const DIGNITY_LABEL = {
  exalted:      'Exalted',
  moolatrikona: 'Moolatrikona',
  own:          'Own sign',
  debilitated:  'Debilitated',
  friend:       "Friend's sign",
  neutral:      'Neutral sign',
  enemy:        "Enemy's sign"
};

/* sign of exaltation; maxDeg limits the exaltation portion where the
   classical texts segment the sign (Mercury only) */
export const EXALTATION = {
  Sun:     { sign: 1  },              /* Aries       */
  Moon:    { sign: 2  },              /* Taurus      */
  Mars:    { sign: 10 },              /* Capricorn   */
  Mercury: { sign: 6, maxDeg: 15 },   /* Virgo 0-15  */
  Jupiter: { sign: 4  },              /* Cancer      */
  Venus:   { sign: 12 },              /* Pisces      */
  Saturn:  { sign: 7  }               /* Libra       */
};
/* debilitation is the seventh sign from exaltation, by definition */
export const DEBILITATION = Object.fromEntries(
  Object.entries(EXALTATION).map(([g, e]) => [g, advSign(e.sign, 7)]));

export const MOOLATRIKONA = {
  Sun:     { sign: 5,  from: 0,  to: 20 },
  Moon:    { sign: 2,  from: 3,  to: 30 },
  Mars:    { sign: 1,  from: 0,  to: 12 },
  Mercury: { sign: 6,  from: 15, to: 20 },
  Jupiter: { sign: 9,  from: 0,  to: 10 },
  Venus:   { sign: 7,  from: 0,  to: 15 },
  Saturn:  { sign: 11, from: 0,  to: 20 }
};

/* Parashari natural friendship: 1 friend, 0 neutral, -1 enemy.
   The Moon has no natural enemy in this scheme. */
export const NATURAL_FRIENDSHIP = {
  Sun:     { Moon: 1, Mars: 1, Jupiter: 1, Mercury: 0, Venus: -1, Saturn: -1 },
  Moon:    { Sun: 1, Mercury: 1, Mars: 0, Jupiter: 0, Venus: 0, Saturn: 0 },
  Mars:    { Sun: 1, Moon: 1, Jupiter: 1, Venus: 0, Saturn: 0, Mercury: -1 },
  Mercury: { Sun: 1, Venus: 1, Mars: 0, Jupiter: 0, Saturn: 0, Moon: -1 },
  Jupiter: { Sun: 1, Moon: 1, Mars: 1, Saturn: 0, Mercury: -1, Venus: -1 },
  Venus:   { Mercury: 1, Saturn: 1, Mars: 0, Jupiter: 0, Sun: -1, Moon: -1 },
  Saturn:  { Mercury: 1, Venus: 1, Jupiter: 0, Sun: -1, Moon: -1, Mars: -1 }
};

export function dignityOf(g, L) {
  if (isNode(g)) {
    return { id: null, label: null,
      why: 'Nodes have no rulership in this model, so no dignity is read for Rahu or Ketu. They are traditionally read through the lord of the sign they occupy and through whichever graha shares that sign.' };
  }
  const id0 = pointIdentity(L);
  const s = id0.sign, d = id0.degInSign, sName = id0.signName;
  const lord = id0.signLord;
  const ex = EXALTATION[g], deb = DEBILITATION[g], mt = MOOLATRIKONA[g];
  if (!ex) return { id: null, label: null, why: `No dignity table for ${g} in this model.` };

  const owns = signsOwnedBy(g);
  const inMT = mt && mt.sign === s && d >= mt.from && d < mt.to;

  /* 1. exalted */
  if (ex.sign === s && (ex.maxDeg === undefined || d < ex.maxDeg)) {
    let why = `${g} in ${sName} — its sign of exaltation in the classical scheme`;
    if (ex.maxDeg !== undefined) why += `, whose exaltation portion is the first ${ex.maxDeg}° of the sign`;
    why += '.';
    if (mt && mt.sign === s)
      why += ` ${g}'s moolatrikona span (${sName} ${mt.from}°–${mt.to}°) lies in the same sign; exaltation is read first here, but the two are different ideas.`;
    return { id: DIGNITY.EXALTED, label: DIGNITY_LABEL.exalted, why };
  }
  /* 2. moolatrikona */
  if (inMT) {
    return { id: DIGNITY.MOOLATRIKONA, label: DIGNITY_LABEL.moolatrikona,
      why: `${g} at ${fmtDMS(d)} of ${sName} — inside its moolatrikona span, ${sName} ${mt.from}°–${mt.to}°. Moolatrikona is a degree band inside a sign, not the sign itself.` };
  }
  /* 3. own sign */
  if (owns.includes(s)) {
    let why = `${g} in ${sName} — a sign it rules.`;
    if (mt && mt.sign === s)
      why += ` Its moolatrikona portion of ${sName} is ${mt.from}°–${mt.to}°; this degree falls outside that band, so it is read as own sign.`;
    return { id: DIGNITY.OWN, label: DIGNITY_LABEL.own, why };
  }
  /* 4. debilitated */
  if (deb === s) {
    return { id: DIGNITY.DEBILITATED, label: DIGNITY_LABEL.debilitated,
      why: `${g} in ${sName} — the seventh sign from its exaltation in ${SIGN_NAMES[ex.sign - 1]}, which is what debilitation means in the classical scheme.` };
  }
  /* 5. friend / neutral / enemy, read from the lord of the occupied sign */
  const rel = NATURAL_FRIENDSHIP[g]?.[lord];
  const id = rel === 1 ? DIGNITY.FRIEND : rel === -1 ? DIGNITY.ENEMY : DIGNITY.NEUTRAL;
  const word = rel === 1 ? 'a natural friend' : rel === -1 ? 'a natural enemy' : 'naturally neutral';
  return { id, label: DIGNITY_LABEL[id],
    why: `${g} in ${sName}, a sign ruled by ${lord}. In the Parashari table of natural friendship ${lord} is ${word} of ${g}, so the placement is read as ${DIGNITY_LABEL[id].toLowerCase()}. This is natural friendship only — temporal and compound friendship depend on the rest of the chart.` };
}

/* ==================================================================
   3. COMBUSTION — ONE table
   ==================================================================

   Audit §3: the prototype holds three conflicting tables —
   app.js:1159 and app.js:1421 (Venus 8°), yogas.js:52 (Venus 10°),
   and a flat 12° at app.js:2609 / PERSONAL 3416. THIS TABLE
   SUPERSEDES ALL THREE. Migrate those call sites to combustion().

   Orbs are the widely used Parashari set, with the retrograde
   reduction for Mercury and Venus (a retrograde inferior planet is
   between us and the Sun, so it burns at a tighter separation).
   Values are degrees of longitude separation from the Sun.
   ================================================================== */

export const COMBUST_ORB = {
  Moon:    { direct: 12, retro: 12 },
  Mars:    { direct: 17, retro: 17 },
  Mercury: { direct: 14, retro: 12 },
  Jupiter: { direct: 11, retro: 11 },
  Venus:   { direct: 10, retro:  8 },
  Saturn:  { direct: 15, retro: 15 }
};

export function combustion(g, L, sunL, retro = false) {
  const entry = COMBUST_ORB[g];
  const sep = (sunL === undefined || sunL === null || L === undefined || L === null)
    ? null : sepDeg(L, sunL);
  if (g === 'Sun') {
    return { graha: g, combust: false, orb: null, sep: 0, applicable: false,
      why: 'The Sun cannot be combust by itself — combustion is measured from the Sun.' };
  }
  if (!entry) {
    return { graha: g, combust: false, orb: null, sep, applicable: false,
      why: isNode(g)
        ? 'Rahu and Ketu are points, not bodies, so combustion is not read for them in this model.'
        : `No combustion orb for ${g} in this model.` };
  }
  const orb = retro ? entry.retro : entry.direct;
  const combust = sep !== null && sep <= orb;
  const motion = retro ? 'retrograde' : 'direct';
  const why = sep === null
    ? `Combustion for ${g} is read within ${orb}° of the Sun while ${motion}; the Sun's longitude was not supplied.`
    : combust
      ? `${g} is ${fmtDMS(sep)} from the Sun, inside the ${orb}° orb used for a ${motion} ${g}. Traditionally a graha this close to the Sun is described as combust — its significations are read as harder to see rather than as absent.`
      : `${g} is ${fmtDMS(sep)} from the Sun, outside the ${orb}° orb used for a ${motion} ${g}, so it is not read as combust.`;
  return { graha: g, combust, orb, sep, applicable: true, retro: !!retro, why };
}

/* ==================================================================
   4. MOTION — speed, stationary, next station
   ==================================================================
   ephemeris.js exports a boolean retrograde() from a 1-day forward
   delta and no speed at all (audit gap 4a). speeds() is the centred
   ±12h difference of positions(), which is symmetric about the instant
   asked for and therefore does not lag near a station.
   ================================================================== */

/* mean daily motion in sidereal longitude, degrees/day */
export const MEAN_DAILY_MOTION = {
  Sun: 0.9856, Moon: 13.176, Mars: 0.524, Mercury: 1.383,
  Jupiter: 0.083, Venus: 1.2, Saturn: 0.033, Rahu: -0.053, Ketu: -0.053
};

/* per-graha degrees/day at `date`, centred ±12h by default */
export function speeds(date, hours = 12) {
  const ms = hours * 3600e3;
  const a = positions(new Date(date.getTime() - ms));
  const b = positions(new Date(date.getTime() + ms));
  const days = (2 * hours) / 24;
  const out = {};
  for (const g in a) out[g] = wrapDelta(b[g] - a[g]) / days;
  return out;
}

const speedOfAt = (g, t) => {
  const a = positions(new Date(t - 12 * 3600e3));
  const b = positions(new Date(t + 12 * 3600e3));
  return wrapDelta(b[g] - a[g]);          /* interval is exactly one day */
};

/* {speed, stationary, nextStation}. Stationary is |speed| under 1% of
   the graha's mean daily motion — the practical definition, since a
   true instantaneous zero lasts no time at all.
   The forward scan costs ~2 ephemeris evaluations per day scanned, so
   it is OPT-IN: pass {scan:true} (or a days count) when a detail screen
   actually wants the date. Default is scan-free. */
export function stationInfo(g, date, opts = {}) {
  const mean = MEAN_DAILY_MOTION[g];
  const speed = opts.speeds && g in opts.speeds ? opts.speeds[g] : speeds(date)[g];
  const stationary = (mean != null && speed != null)
    && Math.abs(speed) < 0.01 * Math.abs(mean);
  const out = {
    graha: g,
    speed,
    meanDailyMotion: mean ?? null,
    ratio: (mean && speed != null) ? speed / mean : null,
    direction: speed == null ? null : speed < 0 ? 'retrograde' : 'direct',
    stationary,
    nextStation: null,
    scanDays: 0,
    why: speed == null ? null
      : `${g} is moving ${fmtDMS(Math.abs(speed))} a day${mean ? ` against a mean of ${fmtDMS(Math.abs(mean))}` : ''}, ${speed < 0 ? 'backwards through the zodiac (retrograde)' : 'forwards through the zodiac (direct)'}${stationary ? ' and slow enough to be read as stationary' : ''}.`
  };
  const days = opts.scan === true ? 120 : (typeof opts.scan === 'number' ? opts.scan : 0);
  if (!days || speed == null) return out;
  out.scanDays = days;
  let t0 = date.getTime(), s0 = speed;
  for (let d = 1; d <= days; d++) {
    const t1 = date.getTime() + d * 864e5;
    const s1 = speedOfAt(g, t1);
    if (s1 !== 0 && s0 !== 0 && Math.sign(s1) !== Math.sign(s0)) {
      /* bisect the sign change down to the minute */
      let a = t0, b = t1, sa = s0;
      while (b - a > 60e3) {
        const m = (a + b) / 2, sm = speedOfAt(g, m);
        if (Math.sign(sm) === Math.sign(sa)) { a = m; sa = sm; } else b = m;
      }
      out.nextStation = new Date(Math.round(b));
      out.nextStationTurnsTo = s1 < 0 ? 'retrograde' : 'direct';
      break;
    }
    t0 = t1; s0 = s1;
  }
  return out;
}

/* ==================================================================
   5. NATURAL BENEFIC / MALEFIC — a graha's own character
   ==================================================================
   This is NOT functional nature (§6) and NOT dignity (§2). It is the
   graha considered on its own, before any chart. Two of the nine are
   conditional, and the condition is the teaching point.
   ================================================================== */

export const NATURAL_NATURE = {
  Jupiter: 'benefic', Venus: 'benefic',
  Sun: 'malefic', Mars: 'malefic', Saturn: 'malefic',
  Rahu: 'malefic', Ketu: 'malefic',
  Moon: 'conditional', Mercury: 'conditional'
};

const NATURAL_WHY = {
  Jupiter: 'Jupiter is counted a natural benefic in every classical list — it is read as enlarging and protecting whatever it touches.',
  Venus:   'Venus is counted a natural benefic — it is read as harmonising, softening and drawing things together.',
  Sun:     'The Sun is counted a natural malefic. The word carries no moral judgement: it means the Sun is read as burning, separating and demanding, not as bad.',
  Mars:    'Mars is counted a natural malefic — read as cutting, forcing and hurrying. Not "bad"; sharp.',
  Saturn:  'Saturn is counted a natural malefic — read as slowing, withholding and testing before it consolidates.',
  Rahu:    'Rahu is counted a natural malefic — read as amplifying appetite without a natural limit.',
  Ketu:    'Ketu is counted a natural malefic — read as separating and detaching from what it touches.'
};

/* ctx: {moonPhaseIllum, waxing, conjunct:[graha names sharing the sign]} */
export function naturalNature(g, ctx = {}) {
  const base = NATURAL_NATURE[g];
  if (!base) return { id: null, label: null, why: `No natural-nature entry for ${g}.` };

  if (g === 'Moon') {
    const waxing = ctx.waxing !== undefined ? !!ctx.waxing
      : (ctx.moonPhaseIllum !== undefined ? null : null);
    if (waxing === null) {
      return { id: 'conditional', label: 'Conditional', conditional: true, resolved: null,
        why: 'The Moon is the one graha whose natural character is read from its phase: waxing (bright, growing) it is counted a benefic, waning (dark, shrinking) a malefic. The phase for this moment was not supplied.' };
    }
    const id = waxing ? 'benefic' : 'malefic';
    const pct = ctx.moonPhaseIllum != null ? ` (about ${Math.round(ctx.moonPhaseIllum * 100)}% lit)` : '';
    return { id, label: id === 'benefic' ? 'Benefic' : 'Malefic', conditional: true, resolved: id, waxing,
      why: `The Moon's natural character is read from its phase. It is ${waxing ? 'waxing' : 'waning'}${pct}, so in the classical scheme it is counted a natural ${id} at this moment. The same Moon is read the other way half of every month.` };
  }

  if (g === 'Mercury') {
    const co = Array.isArray(ctx.conjunct) ? ctx.conjunct : null;
    if (!co) {
      return { id: 'conditional', label: 'Conditional', conditional: true, resolved: null,
        why: 'Mercury is read as taking the character of the company it keeps: benefic on its own, malefic when it shares a sign with a natural malefic. The grahas sharing its sign were not supplied.' };
    }
    const bad = co.filter(x => NATURAL_NATURE[x] === 'malefic');
    const id = bad.length ? 'malefic' : 'benefic';
    return { id, label: id === 'benefic' ? 'Benefic' : 'Malefic', conditional: true, resolved: id, with: bad,
      why: bad.length
        ? `Mercury is read as taking the character of its company. It shares a sign with ${listWords(bad)}, counted natural malefic${bad.length > 1 ? 's' : ''}, so here it is read as malefic.`
        : 'Mercury is read as taking the character of its company. No natural malefic shares its sign, so here it is read as benefic.' };
  }

  return { id: base, label: base === 'benefic' ? 'Benefic' : 'Malefic',
    conditional: false, resolved: base, why: NATURAL_WHY[g] };
}

const listWords = a => a.length <= 1 ? (a[0] || '')
  : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];

/* ==================================================================
   6. FUNCTIONAL NATURE — what a graha becomes for ONE lagna
   ==================================================================
   Derived, per lagna, from the classical lagna-adhipati rules of the
   Brihat Parashara Hora Shastra. Every rule is returned as text so the
   UI can teach the rule alongside the verdict, rather than shipping an
   opaque "benefic in houses 1/5/9" lookup table.

   The rules, as applied here:
   (a) lords of the trikonas — 1, 5, 9 — are read as benefic
   (b) lords of 3, 6 and 11 are read as malefic; the 11th is held the
       strongest of the three, then the 6th, then the 3rd
   (c) the lord of the 8th is read as malefic, UNLESS it is also the
       lagna lord, in which case the lagna lordship prevails
   (d) lords of the 2nd and 12th are neutral in themselves and take the
       character of the planet's OTHER house, when it owns one
   (e) kendradhipati dosha: for lords of 4, 7 and 10 a natural benefic
       loses some of its beneficence and a natural malefic loses some of
       its maleficence — the net reading is neutral-leaning
   (f) a graha owning one kendra (4, 7, 10) AND one trikona (5, 9)
       becomes a yogakaraka for that lagna
   (g) lords of the 2nd and 7th carry maraka lordship. This is a
       classical lordship label about timing, NOT a prediction and NOT
       a warning; it is returned as a flag with that wording
   (h) the lagna lord is treated as benefic whatever else it owns

   The lagna (1st) is both a kendra and a trikona. A graha that owns
   only the lagna therefore owns one house that is both, which is not
   the yogakaraka combination — the test in (f) uses kendras 4/7/10 and
   trikonas 5/9. That is what makes the classical answer come out:
   Saturn for Taurus and Libra, Mars for Cancer and Leo, Venus for
   Capricorn and Aquarius, and no yogakaraka for the other six lagnas.
   ================================================================== */

export const KENDRA  = [1, 4, 7, 10];
export const TRIKONA = [1, 5, 9];
export const DUSTHANA = [6, 8, 12];
export const UPACHAYA = [3, 6, 10, 11];
export const MARAKA_HOUSES = [2, 7];

const MALEFIC_HOUSE_RANK = { 11: 'strongest of the three', 6: 'next', 3: 'mildest of the three' };

export function functionalNature(lagnaSign) {
  const lagna = ((lagnaSign - 1) % 12 + 12) % 12 + 1;
  const lagnaName = SIGN_NAMES[lagna - 1];
  const out = {};

  for (const g of SEVEN) {
    const houses = signsOwnedBy(g)
      .map(s => houseFrom(lagna, s)).sort((a, b) => a - b);
    const rules = [];
    const natural = NATURAL_NATURE[g];

    /* per-house lordship rules, in house order */
    for (const h of houses) {
      const signName = SIGN_NAMES[advSign(lagna, h) - 1];
      const seat = `${g} rules ${signName}, your ${ordinal(h)}.`;
      if (h === 1) {
        rules.push({ code: 'lagna', house: h, effect: 'benefic',
          rule: 'The lagna lord is treated as a benefic for its own chart, whatever else it owns — it carries the body and the life itself.',
          why: seat });
      } else if (h === 5 || h === 9) {
        rules.push({ code: 'trikona', house: h, effect: 'benefic',
          rule: 'Lords of the trikonas — the 1st, 5th and 9th — are read as benefic in the Parashari scheme.',
          why: seat });
      } else if (h === 3 || h === 6 || h === 11) {
        rules.push({ code: 'trishadaya', house: h, effect: 'malefic', strength: MALEFIC_HOUSE_RANK[h],
          rule: `Lords of the 3rd, 6th and 11th are read as malefic. Of the three the 11th is held the strongest, then the 6th, then the 3rd — so this lordship is the ${MALEFIC_HOUSE_RANK[h]}.`,
          why: seat });
      } else if (h === 8) {
        const excused = houses.includes(1);
        rules.push({ code: 'eighth', house: h, effect: excused ? 'benefic' : 'malefic',
          rule: 'The lord of the 8th is read as malefic, unless it also rules the lagna — then the lagna lordship prevails.',
          why: excused ? `${seat} Because ${g} also rules your lagna, the lagna lordship is taken as the stronger reading.` : seat });
      } else if (h === 2 || h === 12) {
        const other = houses.filter(x => x !== h);
        rules.push({ code: 'neutralhouse', house: h, effect: 'neutral',
          rule: 'Lords of the 2nd and 12th are neutral in themselves; they are read through the planet\'s other house, when it owns one.',
          why: other.length ? `${seat} Its other lordship is the ${ordinal(other[0])}, and that is what colours this one.`
                            : `${seat} It owns no second house, so nothing colours this lordship either way.` });
      } else if (h === 4 || h === 7 || h === 10) {
        rules.push({ code: 'kendradhipati', house: h, effect: 'neutral',
          rule: 'Kendra lordship (4th, 7th, 10th) mutes a graha\'s own character: a natural benefic loses some of its beneficence, a natural malefic loses some of its maleficence. The net reading leans neutral.',
          why: natural === 'conditional'
            ? `${seat} ${g} is a conditional benefic, so how much the kendra mutes it depends on ${g === 'Moon' ? 'its phase' : 'the company it keeps'}.`
            : `${seat} ${g} is a natural ${natural}, so the kendra lordship ${natural === 'benefic' ? 'takes some of its beneficence away' : 'takes some of its maleficence away'}.` });
      }
      if (MARAKA_HOUSES.includes(h)) {
        rules.push({ code: 'maraka', house: h, effect: 'maraka',
          rule: 'Lords of the 2nd and 7th carry what the texts call maraka lordship — a lordship associated with endings and with the timing of transitions. It is a classical lordship label, not a prediction and not a warning.',
          why: seat });
      }
    }

    /* resolution */
    const kendraOwned  = houses.filter(h => h === 4 || h === 7 || h === 10);
    const trikonaOwned = houses.filter(h => h === 5 || h === 9);
    const yogakaraka = kendraOwned.length > 0 && trikonaOwned.length > 0;
    const isLagnaLord = houses.includes(1);
    const effects = rules.filter(r => r.effect !== 'maraka').map(r => r.effect);
    const hasBenefic = effects.includes('benefic');
    const hasMalefic = effects.includes('malefic');

    let verdict;
    if (yogakaraka) {
      verdict = 'yogakaraka';
      rules.push({ code: 'yogakaraka', effect: 'yogakaraka',
        rule: 'A graha that rules both a kendra (4th, 7th or 10th) and a trikona (5th or 9th) becomes a yogakaraka for that lagna — one graha holding both the pillar and the blessing.',
        why: `${g} rules your ${ordinal(trikonaOwned[0])} and your ${ordinal(kendraOwned[0])}, so for a ${lagnaName} lagna it is the yogakaraka.` });
    } else if (isLagnaLord) {
      verdict = 'benefic';
    } else if (hasBenefic && hasMalefic) {
      verdict = 'neutral';
      rules.push({ code: 'mixed', effect: 'neutral',
        rule: 'Mixed lordship: this graha rules both an auspicious and an inauspicious house. Classical opinion generally holds the trikona lordship the stronger, but the schools differ and the resolution depends on where the graha actually sits, its dignity and the period running.',
        why: `${g} rules your ${houses.map(ordinal).join(' and your ')}. This model reports the mix rather than resolving it for you.` });
    } else if (hasBenefic) {
      verdict = 'benefic';
    } else if (hasMalefic) {
      verdict = 'malefic';
    } else {
      verdict = 'neutral';
    }

    out[g] = {
      graha: g,
      lagna, lagnaName,
      houses,
      signs: signsOwnedBy(g),
      verdict,
      yogakaraka,
      lagnaLord: isLagnaLord,
      kendraLord: kendraOwned.length > 0,
      trikonaLord: trikonaOwned.length > 0,
      maraka: houses.some(h => MARAKA_HOUSES.includes(h)),
      naturalNature: natural,
      rules
    };
  }

  for (const g of NODES) {
    out[g] = {
      graha: g, lagna, lagnaName,
      houses: [], signs: [], verdict: null, yogakaraka: false,
      lagnaLord: false, kendraLord: false, trikonaLord: false, maraka: false,
      naturalNature: NATURAL_NATURE[g],
      rules: [{ code: 'nodes', effect: null,
        rule: 'Rahu and Ketu own no sign, so they hold no functional lordship. In this model they are read as giving the results of their dispositor — the lord of the sign they occupy — and of whichever graha shares their sign.',
        why: `${g} takes its functional colour from the chart around it, not from a house it rules.` }]
    };
  }
  return out;
}

/* ==================================================================
   7. PLACEMENT RECORD — the ONE shape natal and current both use
   ==================================================================
   opts: {retro, lagna, sunL, date, moon:{waxing,illum,L}, conjunct:[…],
          speeds (a speeds() map, to avoid recomputing per graha),
          functional (a functionalNature() map, likewise),
          scan (pass true/number to also resolve nextStation)}
   Everything is optional: the record degrades field by field and never
   throws on a missing input.
   ================================================================== */

export function placementRecord(g, L, opts = {}) {
  const { retro = false, lagna = null, sunL = null, date = null, moon = null } = opts;
  const id = pointIdentity(L);

  const house = lagna ? houseFrom(lagna, id.sign) : null;

  let waxing = moon && moon.waxing !== undefined ? moon.waxing : undefined;
  if (waxing === undefined && moon && moon.L != null && sunL != null)
    waxing = norm(moon.L - sunL) < 180;

  const nat = naturalNature(g, {
    waxing,
    moonPhaseIllum: moon ? moon.illum : undefined,
    conjunct: opts.conjunct
  });

  let station = { speed: null, stationary: false, nextStation: null, direction: null, why: null };
  if (date) station = stationInfo(g, date, { speeds: opts.speeds, scan: opts.scan });

  const fn = opts.functional
    ? opts.functional
    : (lagna ? functionalNature(lagna) : null);

  return {
    graha: g,
    ...id,
    house,
    houseClass: house ? houseClass(house) : null,
    retro: !!retro,
    motion: retro ? 'Retrograde' : 'Direct',
    dignity: dignityOf(g, L),
    combust: combustion(g, L, sunL, retro),
    speed: station.speed,
    stationary: station.stationary,
    nextStation: station.nextStation,
    motionWhy: station.why,
    natural: nat,
    functional: fn ? fn[g] : null,
    lagna: lagna || null,
    date: date || null
  };
}

/* ==================================================================
   8. RELATIONSHIP — drishti, and today's graha against the chart
   ==================================================================
   Parashari graha drishti: every graha sees the 7th from itself; Mars
   also the 4th and 8th, Jupiter the 5th and 9th, Saturn the 3rd and
   10th. Rahu and Ketu are given no drishti here unless opts.nodal is
   set, because the schools disagree — the app's own PREFS().nodal
   already carries that choice and should be passed through.
   ================================================================== */

export const DRISHTI = { Mars: [4, 7, 8], Jupiter: [5, 7, 9], Saturn: [3, 7, 10] };
export const NODAL_DRISHTI = [5, 7, 9];

export function aspectOffsets(g, opts = {}) {
  if (DRISHTI[g]) return DRISHTI[g].slice();
  if (isNode(g)) return opts.nodal ? NODAL_DRISHTI.slice() : [];
  return [7];
}

/* the signs a graha placed in `sign` aspects, 1..12, sorted */
export function aspectsFrom(g, sign, opts = {}) {
  return aspectOffsets(g, opts).map(o => advSign(sign, o)).sort((a, b) => a - b);
}

/* nowRec: a placementRecord for the transiting graha
   natalRecords: placementRecords (or any {graha, L, sign}) of the chart
   natalLagna: 1..12 */
export function transitToNatal(nowRec, natalRecords = [], natalLagna = null, opts = {}) {
  const orb = opts.orb ?? 3;
  const conjunctNatal = [], sameSignNatal = [];
  for (const r of natalRecords) {
    if (r.L == null) continue;
    const s = sepDeg(nowRec.L, r.L);
    const sameSign = r.sign === nowRec.sign;
    if (sameSign) sameSignNatal.push({ graha: r.graha, sep: s });
    if (s <= orb) conjunctNatal.push({ graha: r.graha, sep: s, sameSign, orb });
  }
  conjunctNatal.sort((a, b) => a.sep - b.sep);
  sameSignNatal.sort((a, b) => a.sep - b.sep);

  const offsets = aspectOffsets(nowRec.graha, opts);
  const signs = aspectsFrom(nowRec.graha, nowRec.sign, opts);
  const aspectsNatal = [];
  for (const r of natalRecords) {
    if (r.sign == null || r.graha === nowRec.graha) continue;
    const off = houseFrom(nowRec.sign, r.sign);
    if (offsets.includes(off))
      aspectsNatal.push({ graha: r.graha, kind: ordinal(off), offset: off });
  }
  aspectsNatal.sort((a, b) => a.offset - b.offset);

  const aspectsHouses = natalLagna
    ? [...new Set(signs.map(s => houseFrom(natalLagna, s)))].sort((a, b) => a - b)
    : [];

  const natalSelf = natalRecords.find(r => r.graha === nowRec.graha) || null;
  const returnToNatal = !!natalSelf && natalSelf.sign === nowRec.sign;

  return {
    graha: nowRec.graha,
    houseTransited: natalLagna ? houseFrom(natalLagna, nowRec.sign) : null,
    conjunctNatal,
    sameSignNatal,
    aspectsNatal,
    aspectsSigns: signs,
    aspectsHouses,
    returnToNatal,
    natalSign: natalSelf ? natalSelf.sign : null,
    natalSep: natalSelf && natalSelf.L != null ? sepDeg(nowRec.L, natalSelf.L) : null,
    orb,
    why: {
      conjunction: `Two grahas within ${orb}° of each other are treated here as a degree conjunction. A shared sign without a close degree is the older, wider reading and is kept separate in sameSignNatal — they are two different claims.`,
      aspect: offsets.length
        ? `${nowRec.graha} casts its glance on the ${offsets.map(ordinal).join(', ')} sign${offsets.length > 1 ? 's' : ''} from where it stands.`
        : `${nowRec.graha} is given no drishti in this model; the schools differ on the nodes, and that preference is the app's to set.`
    }
  };
}

/* ==================================================================
   9. COMPARE — the same object at birth and now
   ==================================================================
   Returns first-glance rows (what a reader sees without knowing any
   astrology), advanced rows (what changes the reading), and plain
   sentences for a headline. Functional nature is deliberately in the
   advanced list with a note: it comes from the birth lagna and does not
   move, which is itself the lesson about what a transit can and cannot
   change.
   ================================================================== */

export function comparePlacement(birthRec, nowRec, opts = {}) {
  const b = birthRec, n = nowRec;
  const row = (key, label, bv, nv, extra = {}) =>
    ({ key, label, birth: bv, now: nv, changed: String(bv) !== String(nv), ...extra });

  const firstGlance = [
    row('rashi', 'Rashi', b.signName, n.signName),
    row('house', 'House', b.house ? ordinal(b.house) : null, n.house ? ordinal(n.house) : null),
    row('degree', 'Degree', b.degText, n.degText),
    row('nakshatra', 'Nakshatra · pada', `${b.nakName} · ${b.pada}`, `${n.nakName} · ${n.pada}`),
    row('motion', 'Motion', b.motion || (b.retro ? 'Retrograde' : 'Direct'),
                            n.motion || (n.retro ? 'Retrograde' : 'Direct'))
  ];

  const bConj = opts.birthConjunct || b.conjunct || null;
  const nConj = opts.nowConjunct   || n.conjunct || null;
  const fmtConj = c => !c ? null : c.length ? listWords(c.map(x => typeof x === 'string' ? x : x.graha)) : 'None';
  const fmtDeg = v => v == null ? null : `${v < 0 ? '−' : ''}${fmtDMS(Math.abs(v))}/day`;

  const advanced = [
    row('dignity', 'Dignity', b.dignity?.label ?? '—', n.dignity?.label ?? '—',
      { birthWhy: b.dignity?.why ?? null, nowWhy: n.dignity?.why ?? null }),
    row('combust', 'Combustion',
      b.combust?.applicable ? (b.combust.combust ? 'Combust' : 'Not combust') : '—',
      n.combust?.applicable ? (n.combust.combust ? 'Combust' : 'Not combust') : '—',
      { birthWhy: b.combust?.why ?? null, nowWhy: n.combust?.why ?? null }),
    row('speed', 'Speed', fmtDeg(b.speed), fmtDeg(n.speed)),
    row('conjunctions', 'Shares its sign with', fmtConj(bConj), fmtConj(nConj)),
    row('aspects', 'Casts its glance on',
      b.sign ? aspectsFrom(b.graha, b.sign, opts).map(s => SIGN_NAMES[s - 1]).join(', ') : null,
      n.sign ? aspectsFrom(n.graha, n.sign, opts).map(s => SIGN_NAMES[s - 1]).join(', ') : null),
    { key: 'functional', label: 'Functional nature',
      birth: b.functional?.verdict ?? '—', now: n.functional?.verdict ?? b.functional?.verdict ?? '—',
      changed: false,
      note: 'Functional nature is read from your birth lagna, so it is the same in both columns. A transit moves the graha; it does not change what that graha rules for you.' }
  ];

  const changes = [];
  if (b.signName !== n.signName) changes.push(`moved from ${b.signName} to ${n.signName}`);
  if (b.house && n.house && b.house !== n.house) changes.push(`now in your ${ordinal(n.house)} house`);
  if (b.nakName !== n.nakName) changes.push(`now in ${n.nakName}`);
  else if (b.pada !== n.pada) changes.push(`now in ${n.nakName} pada ${n.pada}`);
  if (!!b.retro !== !!n.retro) changes.push(n.retro ? 'now retrograde' : 'now direct');
  if (b.dignity?.id !== n.dignity?.id && n.dignity?.label)
    changes.push(`dignity reads ${n.dignity.label.toLowerCase()} now, ${b.dignity?.label ? b.dignity.label.toLowerCase() : 'unread'} at birth`);
  if (b.combust?.applicable && n.combust?.applicable && b.combust.combust !== n.combust.combust)
    changes.push(n.combust.combust ? 'now combust' : 'no longer combust');
  if (n.stationary && !b.stationary) changes.push('close to stationary now');

  return { graha: n.graha || b.graha, birth: b, now: n, firstGlance, advanced, changes };
}

/* ==================================================================
   10. TIMING CONTEXT — one accessor for "when" (audit gap 4b)
   ==================================================================
   The app's timing facts live in four places. Rather than import them
   (which would drag the DOM in), this takes them as parameters:

     chart       an object with .dasha.at(date) -> {maha, antar} | null
     d3          an object with .at(date) -> {maha, antar, pratyantar}
     satiAt      the app's satiAt function, or its result {win, ph}
     nextIngress nextIngressMap(from)[g], or the whole map
   Any of them may be absent; the matching field comes back null.
   ================================================================== */

export function timingContext(g, date, ctx = {}) {
  const { chart = null, d3 = null, nextIngress = null } = ctx;

  let d = null;
  if (d3 && typeof d3.at === 'function') d = d3.at(date);
  else if (chart && chart.dasha && typeof chart.dasha.at === 'function') d = chart.dasha.at(date);

  let dasha = null;
  if (d) {
    const levels = [];
    if (d.maha && d.maha.lord === g) levels.push('maha');
    if (d.antar && d.antar.lord === g) levels.push('antar');
    if (d.pratyantar && d.pratyantar.lord === g) levels.push('pratyantar');
    dasha = {
      maha: d.maha || null,
      antar: d.antar || null,
      pratyantar: d.pratyantar || null,
      roleOf: {
        graha: g,
        levels,
        maha: levels.includes('maha'),
        antar: levels.includes('antar'),
        pratyantar: levels.includes('pratyantar'),
        active: levels.length > 0
      },
      why: levels.length
        ? `${g} rules the running ${levels.map(l => l === 'maha' ? 'mahadasha' : l === 'antar' ? 'antardasha' : 'pratyantardasha').join(' and ')}, so this graha's significations are the ones the period is asking about.`
        : `${g} does not rule any level of the period running on this date. It still transits; it is simply not the graha the clock is on.`
    };
  }

  let sadeSati = null;
  if (g === 'Saturn') {
    let s = ctx.satiAt;
    if (typeof s === 'function') s = s(date);
    if (s && s.ph) {
      sadeSati = {
        phase: s.ph.phase, fromMoon: s.ph.fromMoon, sign: s.ph.sign,
        phaseStart: s.ph.start, phaseEnd: s.ph.end,
        windowStart: s.win ? s.win.start : null, windowEnd: s.win ? s.win.end : null,
        years: s.win ? s.win.years : null,
        why: `Saturn is transiting the ${ordinal(s.ph.fromMoon)} sign from your natal Moon, which is the ${String(s.ph.phase).toLowerCase()} phase of the seven-and-a-half-year cycle the tradition calls Sade Sati. It is a period the texts describe as demanding and consolidating, not a verdict about outcomes.`
      };
    }
  }

  let ing = nextIngress;
  if (ing && !('sign' in ing)) ing = ing[g] || null;
  const ingress = ing ? {
    sign: ing.sign, signName: SIGN_NAMES[ing.sign - 1] || null,
    date: ing.date, days: ing.days,
    why: `${g} next changes sign into ${SIGN_NAMES[ing.sign - 1]}${ing.days != null ? ` in about ${ing.days} day${ing.days === 1 ? '' : 's'}` : ''}.`
  } : null;

  const station = ctx.station
    ? ctx.station
    : (ctx.stations ? stationInfo(g, date, { scan: ctx.stations === true ? 120 : ctx.stations, speeds: ctx.speeds }) : null);

  return { graha: g, date, dasha, sadeSati, nextIngress: ingress, station };
}

/* ==================================================================
   11. STRENGTH AND HOUSE SETS
   ================================================================== */

/* bindus a graha's own ashtakavarga gives to a sign, 0..8, or null.
   bav is a bhinnashtakavarga() result: {Sun:[12], …, Lagna:[12]}. */
export function bindu(bav, g, sign) {
  if (!bav || (!AV_GRAHAS.includes(g) && g !== 'Lagna')) return null;
  const row = bav[g];
  if (!Array.isArray(row) || row.length !== 12) return null;
  const s = Math.trunc(sign);
  if (!(s >= 1 && s <= 12)) return null;
  const v = row[s - 1];
  return Number.isFinite(v) ? v : null;
}

/* the classical house sets. A house can belong to several — the 10th is
   a kendra and an upachaya, the 1st is a kendra and a trikona — and
   that overlap is the point, so all five flags come back together. */
export function houseClass(h) {
  const n = Math.trunc(h);
  return {
    house: n,
    kendra:   KENDRA.includes(n),
    trikona:  TRIKONA.includes(n),
    dusthana: DUSTHANA.includes(n),
    upachaya: UPACHAYA.includes(n),
    maraka:   MARAKA_HOUSES.includes(n)
  };
}

/* re-exported so callers need only this module for entity work */
export { SIGN_NAMES, SIGN_LORDS, NAK_NAMES, NAK_META, nakLord, fmtDMS, norm, houseFrom };
