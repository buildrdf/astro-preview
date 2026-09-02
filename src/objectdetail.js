/* ===================================================================
   CELESTIAL OBJECT DETAIL (src/objectdetail.js)
   -------------------------------------------------------------------
   ONE detail architecture for planet and house (rashi and nakshatra
   route here next). Sangram's page, in his order (2 Sep 2026):

     full screen, no tab bar, Back at the top
     → the object large in the centre (a living hero that collapses
       beside the title as you scroll)
     → a two-column table of what matters: AT BIRTH vs NOW, side by
       side, never a toggle (the column you arrived from is emphasised)
     → a short write-up of what the object is and does
     → a pill with two sub-tabs: At birth | Now — the implications of
       each position, guidance first (.tellme), the technical chain
       beneath (.because), and "See why" on every claim
     → contextual actions (See on chart · Show in sky · Ask Guide)

   Surface: frosted glass, almost white, near-black text — the sky or
   chart stays underneath, blurred. Nothing here calculates: every
   fact comes from objectmodel.js records and the app's chart; the
   prose comes from the interpretation tables the engine already uses.

   The module is DOM-only and takes an app context so it stays testable:
     openObjectDetail(spec, ctx)
       spec {kind:'planet'|'house', id, mode:'birth'|'now', at:Date,
             from:'sky'|'chart'|'today'|'timeline'|'guide'|'dashboard',
             emphasis:'birth'|'now', origin:{x,y,r}|null}
       ctx  {CHART, pairFor, dayFacts, engine, T:{...tables}, ordinal,
             fmtDeg, nav:{push(ov,closeFn)}, actions:{seeOnChart,
             showInSky, askGuide, openHouse, openPlanet}}
   =================================================================== */
import { grahaSprite, preloadGrahaArt, GRAHA_BASE } from "./celestial-art.js";

const esc = s => String(s ?? "").replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
const clean = s => String(s ?? "").replace(/&#8212;/g, "—").replace(/&#8217;/g, "’").replace(/&#8211;/g, "–");
const GRAHA_SK = { Sun: "Surya", Moon: "Chandra", Mars: "Mangal", Mercury: "Budh", Jupiter: "Guru", Venus: "Shukra", Saturn: "Shani", Rahu: "Rahu", Ketu: "Ketu" };
const GRAHA_DEV = { Sun: "सूर्य", Moon: "चंद्र", Mars: "मंगल", Mercury: "बुध", Jupiter: "गुरु", Venus: "शुक्र", Saturn: "शनि", Rahu: "राहु", Ketu: "केतु" };
const HOUSE_DEV = ["", "प्रथम", "द्वितीय", "तृतीय", "चतुर्थ", "पंचम", "षष्ठ", "सप्तम", "अष्टम", "नवम", "दशम", "एकादश", "द्वादश"];

let open = null;   /* the one mounted page */

export function openObjectDetail(spec, ctx) {
  if (open) { closeNow(); }
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const model = spec.kind === "house" ? houseModel(spec, ctx) : planetModel(spec, ctx);
  if (!model) return null;
  const emphasis = spec.emphasis || (spec.mode === "now" ? "now" : "birth");
  const ov = document.createElement("div");
  ov.className = "cod"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
  ov.innerHTML = `
    <header class="codbar">
      <button class="codback" aria-label="Back">‹</button>
      <div class="codmini" aria-hidden="true"><span class="codminihero"></span><b>${esc(model.title)}</b></div>
    </header>
    <div class="codscroll">
      <div class="codhero" aria-hidden="true"><div class="codheroslot"></div></div>
      <div class="codtitle">
        <div class="codeyebrow">${esc(model.eyebrow)}</div>
        <h1>${esc(model.title)} <small>${esc(model.dev)}</small></h1>
        <p class="codsub">${model.sub}</p>
      </div>
      <section class="codglance" aria-label="At birth and now">
        <div class="codgrid">
          <div class="codhead"></div>
          <div class="codhead${emphasis === "birth" ? " emph" : ""}">At birth</div>
          <div class="codhead${emphasis === "now" ? " emph" : ""}">Now</div>
          ${model.rows.map(r => `<div class="codk">${esc(r.label)}</div>
            <div class="codv${emphasis === "birth" ? " emph" : ""}">${r.birth}</div>
            <div class="codv${emphasis === "now" ? " emph" : ""}${r.changed ? " chg" : ""}">${r.now}</div>`).join("")}
        </div>
        ${model.changes.length ? `<p class="codchanges">${esc(model.changes.join(" · "))}</p>` : `<p class="codchanges quiet">Nothing has moved since birth on these counts.</p>`}
      </section>
      <section class="codabout">
        <h2>${esc(model.aboutTitle)}</h2>
        <p>${model.about}</p>
      </section>
      <section class="codread">
        <div class="codpill" role="tablist" aria-label="Which position">
          <button role="tab" data-tab="birth" aria-selected="${emphasis === "birth"}" class="${emphasis === "birth" ? "on" : ""}">At birth</button>
          <button role="tab" data-tab="now" aria-selected="${emphasis === "now"}" class="${emphasis === "now" ? "on" : ""}">Now</button>
        </div>
        <div class="codpanel" data-panel="birth" ${emphasis === "birth" ? "" : "hidden"}>${panelHTML(model.birth)}</div>
        <div class="codpanel" data-panel="now" ${emphasis === "now" ? "" : "hidden"}>${panelHTML(model.now)}</div>
      </section>
      <section class="codacts">
        ${model.actions.map(a => `<button class="codact${a.primary ? " primary" : ""}" data-act="${a.id}">${esc(a.label)}</button>`).join("")}
      </section>
      <p class="codfoot">${esc(model.foot)}</p>
    </div>`;
  document.body.appendChild(ov);
  document.body.classList.add("indetail");
  open = { ov, spec, model, ctx };

  /* hero: a living object, drawn by the same renderer the chart and sky use */
  const slot = ov.querySelector(".codheroslot"), mini = ov.querySelector(".codminihero");
  const heroPx = Math.round(Math.min(innerWidth * 0.6, 260));
  mountHero(slot, model, heroPx); mountHero(mini, model, 30);
  if (model.kind === "planet") preloadGrahaArt().then(() => { if (open && open.ov === ov) { mountHero(slot, model, heroPx); mountHero(mini, model, 30); } });

  /* the collapse: scroll 0→160px takes the hero from cinematic to a small object beside the title */
  const sc = ov.querySelector(".codscroll");
  const onScroll = () => { const p = Math.max(0, Math.min(1, sc.scrollTop / 160)); ov.style.setProperty("--p", p.toFixed(3)); ov.classList.toggle("collapsed", p > 0.6); };
  sc.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* tabs, actions, see-why */
  ov.querySelector(".codpill").onclick = e => {
    const b = e.target.closest("[data-tab]"); if (!b) return;
    ov.querySelectorAll(".codpill [data-tab]").forEach(x => { const on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-selected", on); });
    ov.querySelectorAll(".codpanel").forEach(p => p.hidden = p.dataset.panel !== b.dataset.tab);
    ctx.buzz && ctx.buzz(5);
  };
  ov.addEventListener("click", e => {
    const w = e.target.closest(".codwhy"); if (w) { const box = w.nextElementSibling; box.hidden = !box.hidden; w.setAttribute("aria-expanded", !box.hidden); return; }
    const s = e.target.closest("[data-show]"); if (s) { const [k, id] = s.dataset.show.split(":"); ctx.actions.show && ctx.actions.show(k, id, spec); return; }
    const a = e.target.closest("[data-act]"); if (a) { const act = model.actions.find(x => x.id === a.dataset.act); if (act) act.run(); return; }
  });

  /* history: Back gesture, Escape and the back arrow converge */
  const closeFn = () => closeDetail(true);
  if (ctx.nav && ctx.nav.push) ov._navToken = ctx.nav.push(ov, closeFn);
  ov.querySelector(".codback").onclick = () => closeDetail(false);

  /* the entry: the object lifts from where it was into the hero; the surface frosts in */
  if (spec.origin && !reduced) {
    const r = slot.getBoundingClientRect();
    const sx = spec.origin.r * 2 / heroPx;
    slot.style.transition = "none";
    slot.style.transform = `translate(${spec.origin.x - (r.left + r.width / 2)}px, ${spec.origin.y - (r.top + r.height / 2)}px) scale(${sx})`;
    void slot.offsetHeight;
    slot.style.transition = "";
    requestAnimationFrame(() => { slot.style.transform = ""; });
  }
  requestAnimationFrame(() => ov.classList.add("in"));
  ov.querySelector(".codback").focus({ preventScroll: true });
  return ov;
}

function mountHero(el, model, px) {
  if (!el) return;
  el.innerHTML = "";
  if (model.kind === "planet") {
    const c = grahaSprite(model.id, px, { ground: "light", quality: px > 60 ? "high" : "low", phase: model.phase, tilt: 22 });
    el.appendChild(c);
  } else {
    el.innerHTML = model.heroSVG(px);
  }
}

function panelHTML(p) {
  return `
    <p class="tellme">${p.lead}</p>
    ${p.more ? `<p class="codmore">${p.more}</p>` : ""}
    <p class="because">${p.tech}</p>
    <button class="codwhy" aria-expanded="false">See why</button>
    <ol class="codchain" hidden>
      ${p.chain.map(c => `<li><b>${esc(c.fact)}</b>${c.note ? `<span>${esc(c.note)}</span>` : ""}${c.show ? `<button class="codshow" data-show="${c.show}">${esc(c.showLabel || "Show")}</button>` : ""}</li>`).join("")}
    </ol>`;
}

function closeDetail(fromHistory) {
  if (!open) return;
  const { ov, spec, ctx } = open;
  if (!fromHistory && ov._navToken && history.state && history.state.astra === ov._navToken) { history.back(); return; }
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const slot = ov.querySelector(".codheroslot");
  if (spec.origin && !reduced && slot) {
    const r = slot.getBoundingClientRect();
    const heroPx = r.width || 1;
    slot.style.transform = `translate(${spec.origin.x - (r.left + r.width / 2)}px, ${spec.origin.y - (r.top + r.height / 2)}px) scale(${spec.origin.r * 2 / heroPx})`;
  }
  ov.classList.remove("in"); ov.classList.add("out");
  const done = () => { ov.remove(); document.body.classList.remove("indetail"); if (open && open.ov === ov) open = null; ctx.buzz && ctx.buzz(5); };
  setTimeout(done, reduced ? 160 : 360);
}
function closeNow() { if (open) { open.ov.remove(); document.body.classList.remove("indetail"); open = null; } }
export function isDetailOpen() { return !!open; }

/* ---- PLANET ------------------------------------------------------- */
function planetModel(spec, ctx) {
  const g = spec.id, at = spec.at || new Date();
  const pair = ctx.pairFor(g, at); if (!pair || !pair.birth) return null;
  const { birth, now, compare, toNatal } = pair;
  const T = ctx.T, C = ctx.CHART, ord = ctx.ordinal;
  const rows = compare.firstGlance.map(r => ({ label: r.label, birth: esc(r.birth ?? "—"), now: esc(r.now ?? "—"), changed: !!r.changed }));
  const dignRow = compare.advanced.find(a => a.key === "dignity");
  if (dignRow) rows.push({ label: "Dignity", birth: esc(dignRow.birth ?? "—"), now: esc(dignRow.now ?? "—"), changed: !!dignRow.changed });
  const day = safe(() => ctx.dayFacts(at)); const skyRow = day && day.sky.find(x => x.graha === g);
  const timing = safe(() => ctx.timingContext(g, at)) || {};
  const phase = g === "Moon" && day && day.tr && day.tr.phase ? { illum: day.tr.phase.illum, waxing: !!day.tr.phase.waxing } : undefined;

  /* --- at birth --- */
  const h = birth.house, sName = birth.signName;
  const story = T.PLANET_STORY[g] || {};
  const lead = clean(story.inHouse ? story.inHouse[h] : "") || `${g} sits in your ${ord(h)} house.`;
  const more = clean((T.GRAHA_IN_SIGN[g] || {})[sName] || "");
  const rules = C.housesRuled ? C.housesRuled(g) : [];
  const fn = birth.functional || {};
  const conj = C.conjunct ? C.conjunct(g) : [];
  const asp = C.aspectedBy ? C.aspectedBy(g) : [];
  const techBits = [
    `${g} at ${sName} ${birth.degText}`,
    `${birth.nakName} pada ${birth.pada} (lord ${birth.nakLord})`,
    `${ord(h)} house from your ${T.SIGNS[C.lagna - 1]} lagna`,
    birth.dignity && birth.dignity.id ? birth.dignity.label.toLowerCase() : null,
    rules.length ? `rules your ${rules.map(ord).join(" and ")}${fn.verdict === "yogakaraka" ? " — a yogakaraka for this lagna" : fn.verdict ? ` — functionally ${fn.verdict}` : ""}` : null,
    conj.length ? `with ${conj.join(", ")}` : null,
    asp.length ? `aspects your ${asp.map(ord).join(", ")}` : null,
    birth.combust && birth.combust.combust ? "combust" : null,
    birth.retro ? "retrograde at birth" : null,
  ].filter(Boolean);
  const chainB = [
    { fact: `Placement · ${sName} ${birth.degText}`, note: "sidereal, Lahiri", show: `chart:${g}`, showLabel: "See on chart" },
    { fact: `Sign · ${sName}, ruled by ${birth.signLord}`, note: (T.SIGNS_DEV || [])[birth.sign - 1] || "", show: `sign:${birth.sign}` },
    { fact: `House · ${ord(h)} — ${clean((T.BHAVA[h] || {}).head || T.BHAVA[h] || "")}`.trim(), show: `house:${h}` },
    rules.length ? { fact: `Lordship · rules the ${rules.map(ord).join(" and ")}`, note: (fn.rules || []).map(r => r.effect || r.rule).filter(Boolean).slice(0, 2).join(" ") } : null,
    { fact: `Nakshatra · ${birth.nakName} pada ${birth.pada}`, note: `lord ${birth.nakLord}`, show: `nak:${birth.nak}` },
    birth.dignity ? { fact: `Dignity · ${birth.dignity.label}`, note: birth.dignity.why || "" } : null,
    conj.length ? { fact: `Conjunction · ${conj.join(", ")} in the same sign` } : null,
    asp.length ? { fact: `Aspects · casts drishti on your ${asp.map(ord).join(", ")}` } : null,
    timing.dasha && timing.dasha.roleOf && timing.dasha.roleOf.levels && timing.dasha.roleOf.levels.length ? { fact: `Dasha · ${g} rules the running ${timing.dasha.roleOf.levels.join(" and ")}`, show: "timeline:" + g } : null,
  ].filter(Boolean);

  /* --- now: the transit read against the natal chart, never in the abstract --- */
  const hh = now.house;
  const sense = clean((T.HOUSE_TRANSIT_SENSE || {})[hh] || "");
  const feel = skyRow ? clean(((T.GOCHARA_FEEL || {})[g] || {})[skyRow.favourable ? "fav" : "unfav"] || "") : "";
  const leadN = `${g === "Moon" ? "Today" : "Right now"} ${g} moves through your ${ord(hh)} house${sense ? ` — ${sense}` : "."}`;
  const dashaLine = timing.dasha && timing.dasha.roleOf && timing.dasha.roleOf.levels && timing.dasha.roleOf.levels.length
    ? `${g} also rules the running ${timing.dasha.roleOf.levels.join(" and ")}, so this transit speaks with the period's voice.` : "";
  const sati = timing.sadeSati ? `Saturn's sade sati is in its ${String(timing.sadeSati.phase || timing.sadeSati.ph?.phase || "").toLowerCase()} phase for you.` : "";
  const techN = [
    `${g} transiting ${now.signName} ${now.degText}`,
    `${now.nakName} pada ${now.pada}`,
    `${ord(hh)} from your lagna`,
    skyRow ? `${ord(skyRow.houseFromMoon)} from your natal Moon — ${skyRow.favourable ? "a classically supportive seat" : "a classically testing seat"}` : null,
    now.retro ? "retrograde" : "direct",
    now.dignity && now.dignity.id ? now.dignity.label.toLowerCase() : null,
    now.combust && now.combust.combust ? "combust" : null,
    toNatal && toNatal.returnToNatal ? "back in its natal sign" : null,
    toNatal && toNatal.conjunctNatal && toNatal.conjunctNatal.length ? `within ${toNatal.orb || 3}° of your natal ${toNatal.conjunctNatal.map(x => x.graha).join(", ")}` : null,
    toNatal && toNatal.aspectsNatal && toNatal.aspectsNatal.length ? `aspecting your natal ${toNatal.aspectsNatal.map(x => x.graha).join(", ")}` : null,
    timing.nextIngress && timing.nextIngress.date ? `enters ${timing.nextIngress.signName || T.SIGNS[(timing.nextIngress.sign || 1) - 1]} ${fmtShort(timing.nextIngress.date)}` : null,
  ].filter(Boolean);
  const chainN = [
    { fact: `Transit · ${now.signName} ${now.degText}`, show: `sky:${g}`, showLabel: "Show in sky" },
    { fact: `House · ${ord(hh)} from your lagna — ${clean((T.BHAVA[hh] || {}).head || T.BHAVA[hh] || "")}`.trim(), show: `house:${hh}` },
    skyRow ? { fact: `From your Moon · ${ord(skyRow.houseFromMoon)}`, note: skyRow.favourable ? "listed among this graha's supportive transit seats" : "not among this graha's supportive transit seats" } : null,
    { fact: `Nakshatra · ${now.nakName} pada ${now.pada}`, show: `nak:${now.nak}` },
    toNatal && toNatal.conjunctNatal && toNatal.conjunctNatal.length ? { fact: `Conjunct natal · ${toNatal.conjunctNatal.map(x => `${x.graha} (${x.sep.toFixed(1)}°)`).join(", ")}` } : null,
    toNatal && toNatal.aspectsNatal && toNatal.aspectsNatal.length ? { fact: `Aspects natal · ${toNatal.aspectsNatal.map(x => `${x.graha} (${x.kind})`).join(", ")}` } : null,
    dashaLine ? { fact: `Dasha · ${timing.dasha.roleOf.levels.join(" and ")}`, show: "timeline:" + g, showLabel: "See on timeline" } : null,
    sati ? { fact: `Sade sati · ${sati}`, show: "sati:" } : null,
    timing.nextIngress && timing.nextIngress.date ? { fact: `Next sign change · ${fmtShort(timing.nextIngress.date)}` } : null,
  ].filter(Boolean);

  const meaning = T.GRAHA_MEANING[g] || {};
  const modeWord = spec.mode === "now" ? "now" : "at birth";
  return {
    kind: "planet", id: g, phase,
    title: g, dev: GRAHA_DEV[g] || "", eyebrow: `Graha · ${GRAHA_SK[g]}`,
    sub: `${esc(birth.signName)} ${esc(birth.degText)} at birth · ${esc(now.signName)} ${esc(now.degText)} now`,
    rows, changes: compare.changes || [],
    aboutTitle: `About ${g}`, about: clean(meaning.body || ""),
    birth: { lead, more, tech: techBits.join(" · ") + ".", chain: chainB },
    now: { lead: leadN, more: [feel, dashaLine, sati].filter(Boolean).join(" "), tech: techN.join(" · ") + ".", chain: chainN },
    actions: [
      { id: "chart", label: "See on chart", primary: true, run: () => ctx.actions.seeOnChart(g, spec.mode) },
      { id: "sky", label: "Show in sky", run: () => ctx.actions.showInSky(g, spec.mode, at) },
      { id: "guide", label: "Ask Guide", run: () => ctx.actions.askGuide(`What does ${g} mean for me ${modeWord}?`, { source: "detail", graha: g, mode: spec.mode }) },
    ],
    foot: "Within Vedic astrology these positions are traditionally associated with the themes above — a compass for reflection, not a prediction.",
  };
}

/* ---- HOUSE -------------------------------------------------------- */
function houseModel(spec, ctx) {
  const h = +spec.id, at = spec.at || new Date();
  const C = ctx.CHART, T = ctx.T, ord = ctx.ordinal;
  const sign = C.signOfHouse(h), sName = T.SIGNS[sign - 1], lord = T.SIGN_LORD[sign - 1];
  const lordRec = C.rec(lord), lordHouse = lordRec ? lordRec.house : null;
  const occ = C.occupants(h).map(p => p.graha);
  const asp = C.aspecting(h);
  const day = safe(() => ctx.dayFacts(at)); const transiting = day ? day.sky.filter(x => x.house === h).map(x => x.graha) : [];
  const dashaNow = C.dasha && C.dasha.at ? C.dasha.at(at) : null;
  const active = dashaNow ? [dashaNow.maha && dashaNow.maha.lord, dashaNow.antar && dashaNow.antar.lord].filter(Boolean).filter(l => l === lord || occ.includes(l)) : [];
  const bh = T.BHAVA[h] || {};
  const head = clean(bh.head || (typeof bh === "string" ? bh : "")), body = clean(bh.body || "");
  const cls = ctx.houseClass ? ctx.houseClass(h) : {};
  const klass = [cls.kendra && "kendra", cls.trikona && "trikona", cls.dusthana && "dusthana", cls.upachaya && "upachaya"].filter(Boolean).join(" · ") || "—";
  const rows = [
    { label: "Sign", birth: esc(sName), now: esc(sName), changed: false },
    { label: "Lord", birth: esc(lord), now: esc(lord), changed: false },
    { label: "Lord placed", birth: esc(lordHouse ? `${ord(lordHouse)} house` : "—"), now: esc(lordRec && day ? `${ord((day.sky.find(x => x.graha === lord) || {}).house || lordHouse)} house` : "—"), changed: !!(day && (day.sky.find(x => x.graha === lord) || {}).house !== lordHouse) },
    { label: "Occupants", birth: esc(occ.join(", ") || "none"), now: esc(transiting.join(", ") || "none passing"), changed: occ.join() !== transiting.join() },
    { label: "Aspected by", birth: esc(asp.join(", ") || "none"), now: esc(day ? day.sky.filter(x => x.aspects && x.aspects.includes(h)).map(x => x.graha).join(", ") || "none" : "—"), changed: false },
    { label: "Class", birth: esc(klass), now: esc(klass), changed: false },
  ];
  const leadB = clean((T.HOUSE_STORY || {})[h] || head);
  const moreB = clean(((T.LORD_IN_HOUSE || {})[h] || {})[lordHouse] || "");
  const occStories = occ.map(g => clean(((T.PLANET_STORY[g] || {}).inHouse || {})[h] || "")).filter(Boolean).join(" ");
  const techB = [`${sName} on the ${ord(h)} cusp (whole-sign)`, `lord ${lord} in your ${ord(lordHouse)}`, occ.length ? `occupied by ${occ.join(", ")}` : "empty at birth", asp.length ? `aspected by ${asp.join(", ")}` : null, `class: ${klass}`].filter(Boolean);
  const chainB = [
    { fact: `Sign · ${sName}`, show: `sign:${sign}` },
    { fact: `Lord · ${lord} in your ${ord(lordHouse)}`, show: `planet:${lord}` },
    ...occ.map(g => ({ fact: `Occupant · ${g}`, show: `planet:${g}` })),
    asp.length ? { fact: `Drishti · ${asp.join(", ")} aspect this house` } : null,
    { fact: `Class · ${klass}`, note: "kendra = pillar, trikona = fortune, dusthana = strain, upachaya = growth by effort" },
  ].filter(Boolean);
  const leadN = transiting.length ? `Right now ${transiting.join(" and ")} ${transiting.length > 1 ? "move" : "moves"} through this house${(T.HOUSE_TRANSIT_SENSE || {})[h] ? ` — ${clean(T.HOUSE_TRANSIT_SENSE[h])}` : "."}` : `No graha is passing through this house right now; its lord ${lord} carries it from your ${ord(lordHouse)}.`;
  const moreN = active.length ? `The running period is ruled by ${active.join(" and ")}, which ${active.length > 1 ? "belong" : "belongs"} to this house — so its themes are live.` : "";
  const techN = [transiting.length ? `transiting: ${transiting.join(", ")}` : "no transiting graha", active.length ? `dasha lords touching it: ${active.join(", ")}` : "no dasha lord of this house running"];
  const chainN = [
    ...transiting.map(g => ({ fact: `Transit · ${g} in the ${ord(h)}`, show: `sky:${g}`, showLabel: "Show in sky" })),
    active.length ? { fact: `Dasha · ${active.join(", ")}`, show: "timeline:" } : null,
  ].filter(Boolean);
  return {
    kind: "house", id: h,
    title: `${ord(h)} house`, dev: HOUSE_DEV[h] || "", eyebrow: `Bhava · ${sName}`,
    sub: `${esc(head)}`,
    rows, changes: transiting.length ? [`${transiting.join(", ")} passing through now`] : [],
    aboutTitle: `What the ${ord(h)} house governs`, about: body || head,
    birth: { lead: leadB, more: [moreB, occStories].filter(Boolean).join(" "), tech: techB.join(" · ") + ".", chain: chainB },
    now: { lead: leadN, more: moreN, tech: techN.join(" · ") + ".", chain: chainN },
    actions: [
      { id: "chart", label: "See on chart", primary: true, run: () => ctx.actions.openHouse(h, spec.mode) },
      { id: "guide", label: "Ask Guide", run: () => ctx.actions.askGuide(`What does my ${ord(h)} house say?`, { source: "detail", house: h, mode: spec.mode }) },
    ],
    heroSVG: px => `<svg class="codhouse" viewBox="0 0 100 100" width="${px}" height="${px}" aria-hidden="true">
        <defs><linearGradient id="codhg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F7EFDA"/><stop offset="1" stop-color="#D9C79A"/></linearGradient></defs>
        <path d="M50 4 L96 50 L50 96 L4 50 Z" fill="url(#codhg)" stroke="#8F6B24" stroke-width="1.2"/>
        <path d="M50 4 L50 96 M4 50 L96 50" stroke="rgba(143,107,36,.35)" stroke-width="0.8"/>
        <text x="50" y="58" text-anchor="middle" font-size="26" font-weight="700" fill="#14162B">${h}</text>
      </svg>`,
    foot: "A house is read through its sign, its lord and its occupants — never in isolation. Traditional associations, not predictions.",
  };
}

function safe(f) { try { return f(); } catch (_) { return null; } }
function fmtShort(d) { try { return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" }); } catch (_) { return ""; } }
