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
import { SIGN_LORDS, SIGN_ELEMENT, SIGN_MODALITY, NAK_META, nakLord, nakIndex, padaIndex, nakshatraRange, signNakshatras, fmtDMS } from "./zodiac.js?v=20260902";
import { taraBala } from "./panchang.js";

const esc = s => String(s ?? "").replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
const clean = s => String(s ?? "").replace(/&#8212;/g, "—").replace(/&#8217;/g, "’").replace(/&#8211;/g, "–");
const GRAHA_SK = { Sun: "Surya", Moon: "Chandra", Mars: "Mangal", Mercury: "Budh", Jupiter: "Guru", Venus: "Shukra", Saturn: "Shani", Rahu: "Rahu", Ketu: "Ketu" };
const GRAHA_DEV = { Sun: "सूर्य", Moon: "चंद्र", Mars: "मंगल", Mercury: "बुध", Jupiter: "गुरु", Venus: "शुक्र", Saturn: "शनि", Rahu: "राहु", Ketu: "केतु" };
const HOUSE_DEV = ["", "प्रथम", "द्वितीय", "तृतीय", "चतुर्थ", "पंचम", "षष्ठ", "सप्तम", "अष्टम", "नवम", "दशम", "एकादश", "द्वादश"];

/* the same glyphs the app uses elsewhere: the kundali diamond for the chart, the AR cube
   for the sky, the Moon for Astra */
const ACT_ICON = {
  chart: `<svg class="acti" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.6" y="3.6" width="16.8" height="16.8" rx="1.4"/><path d="M3.6 3.6l16.8 16.8M20.4 3.6L3.6 20.4M12 3.6l8.4 8.4-8.4 8.4-8.4-8.4z"/></svg>`,
  sky: `<svg class="acti" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 7V5.4a2 2 0 012-2H7M17 3.4h1.5a2 2 0 012 2V7M20.5 17v1.6a2 2 0 01-2 2H17M7 20.6H5.5a2 2 0 01-2-2V17"/><path d="M12 7.4l3.6 2v5.2l-3.6 2-3.6-2V9.4z"/><path d="M12 12.2l3.6-2.1M12 12.2l-3.6-2.1M12 12.2v4.4"/></svg>`,
  guide: `<img class="acti moonimg" src="assets/moon/phase_15_full_moon.png" alt="" aria-hidden="true">`,
};

let open = null;   /* the one mounted page */

export function openObjectDetail(spec, ctx) {
  const replacing = open ? open.ov._navToken : null;   /* a detail over a detail replaces it - one history entry */
  if (open) { closeNow(); }
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const model = spec.kind === "house" ? houseModel(spec, ctx)
    : spec.kind === "rashi" ? rashiModel(spec, ctx)
    : spec.kind === "nakshatra" ? nakshatraModel(spec, ctx)
    : planetModel(spec, ctx);
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
        <div class="codactrow">
          ${model.actions.filter(a => a.id !== "guide").map(a => `<button class="codact" data-act="${a.id}">${ACT_ICON[a.id] || ""}<span>${esc(a.label)}</span></button>`).join("")}
        </div>
        ${model.actions.filter(a => a.id === "guide").map(a => `<button class="codact wide primary" data-act="${a.id}">${ACT_ICON.guide}<span>${esc(a.label)}</span></button>`).join("")}
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
  /* the hero does not dissolve — it travels up to the title and shrinks into the slot beside
     the name, so the object you lifted stays the object you are reading about. The trip is
     measured ONCE, at rest, and then driven by scroll progress alone: measuring a moving,
     transformed element every frame feeds back on itself. */
  const measureHero = () => {
    const slot = ov.querySelector(".codheroslot"), bar = ov.querySelector(".codbar");
    if (!slot || !bar) return;
    const prev = ov.style.getPropertyValue("--p");
    ov.style.setProperty("--p", "0");
    const s0 = slot.getBoundingClientRect(), b = bar.getBoundingClientRect();
    if (s0.width > 60) {
      ov.style.setProperty("--hx", ((b.left + 66) - (s0.left + s0.width / 2)).toFixed(1) + "px");
      ov.style.setProperty("--hy", ((b.top + b.height / 2) - (s0.top + s0.height / 2)).toFixed(1) + "px");
      ov.style.setProperty("--hsT", (30 / s0.width).toFixed(4));
    }
    ov.style.setProperty("--p", prev || "0");
  };
  const onScroll = () => {
    const p = Math.max(0, Math.min(1, sc.scrollTop / 170));
    ov.style.setProperty("--p", p.toFixed(3));
    ov.classList.toggle("collapsed", p > 0.98);
  };
  requestAnimationFrame(measureHero);
  addEventListener("resize", measureHero);
  /* the hero's art arrives after first layout, so measure again whenever it resizes —
     a trip measured against a 38px placeholder lands nowhere near the title */
  try { new ResizeObserver(measureHero).observe(ov.querySelector(".codheroslot")); } catch (_) {}
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
  if (ctx.nav && ctx.nav.push) ov._navToken = (replacing && ctx.nav.replace) ? ctx.nav.replace(ov, closeFn) : ctx.nav.push(ov, closeFn);
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
    /* frame the cell itself, not the whole chart square */
    const svg = el.querySelector("svg"), cell = el.querySelector(".codcell");
    if (svg && cell && cell.getBBox) {
      try { const b = cell.getBBox();
        const m = Math.max(b.width, b.height) * 0.10;
        svg.setAttribute("viewBox", `${(b.x - m).toFixed(2)} ${(b.y - m).toFixed(2)} ${(b.width + 2 * m).toFixed(2)} ${(b.height + 2 * m).toFixed(2)}`);
      } catch (_) {}
    }
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
    /* the cell the finger touched, curves and all — the chart's own geometry, so the
       object that lifts into the hero is the object that was on screen. mountHero fits
       the viewBox to the path's real bounds, which the ogee edges bulge past. */
    heroSVG: px => {
      const a = ctx.houseAnchor ? ctx.houseAnchor(h) : [50, 50];
      const d = ctx.housePath ? ctx.housePath(h) : "M50 4 L96 50 L50 96 L4 50 Z";
      return `<svg class="codhouse" viewBox="0 0 100 100" width="${px}" height="${px}" aria-hidden="true">
        <defs><linearGradient id="codhg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F7EFDA"/><stop offset="1" stop-color="#D9C79A"/></linearGradient></defs>
        <path class="codcell" d="${d}" fill="url(#codhg)" stroke="#8F6B24" stroke-width="1.1" stroke-linejoin="round"/>
        <text x="${a[0].toFixed(1)}" y="${a[1].toFixed(1)}" text-anchor="middle" dominant-baseline="central"
          font-size="17" font-weight="700" fill="#14162B">${h}</text>
      </svg>`;
    },
    foot: "A house is read through its sign, its lord and its occupants — never in isolation. Traditional associations, not predictions.",
  };
}

/* ---- RASHI --------------------------------------------------------- */
/* one line per sign — the same twelve lines Learn teaches (learn.js "The twelve, in one line each") */
const SIGN_LINE = ["fire, initiating: the spark that starts things", "earth, fixed: the garden that holds its ground",
  "air, adaptable: the conversation that never quite ends", "water, initiating: the tide that pulls toward home",
  "fire, fixed: the hearth that wants to be seen burning", "earth, adaptable: the workshop where details matter",
  "air, initiating: the scales weighing every side", "water, fixed: the deep well, still on the surface",
  "fire, adaptable: the arrow aimed at the horizon", "earth, initiating: the mountain path, climbed slowly",
  "air, fixed: the long view held for everyone", "water, adaptable: the ocean where boundaries blur"];
const SIGN_GLYPH = ["\u2648", "\u2649", "\u264A", "\u264B", "\u264C", "\u264D", "\u264E", "\u264F", "\u2650", "\u2651", "\u2652", "\u2653"];
const NAK_TONE = { Janma: "your birth star — the tone is personal, read it gently", Sampat: "wealth, gain", Vipat: "friction, obstacles", Kshema: "well-being, safety", Pratyak: "setbacks, delays", Sadhana: "achievement", Naidhana: "hazard — the tradition's caution star", Mitra: "friendship, support", "Parama Mitra": "close friendship, ease" };

function rashiModel(spec, ctx) {
  const s = +spec.id, at = spec.at || new Date();               /* 1..12 */
  const C = ctx.CHART, T = ctx.T, ord = ctx.ordinal;
  const sName = T.SIGNS[s - 1], sk = (T.SIGNS_SK || [])[s - 1] || "", dev = (T.SIGNS_DEV || [])[s - 1] || "";
  const h = C.houseOfSign(s), lord = SIGN_LORDS[s - 1];
  const lordRec = C.rec(lord), lordHouse = lordRec ? lordRec.house : null;
  const occ = C.placements.filter(p => p.sign === s).map(p => p.graha);
  const ascHere = C.lagna === s;
  const day = safe(() => ctx.dayFacts(at));
  const transiting = day ? day.sky.filter(x => x.sign === s).map(x => x.graha) : [];
  const lordNow = day ? (day.sky.find(x => x.graha === lord) || {}).house : null;
  const aspB = C.aspecting(h), aspN = day ? day.sky.filter(x => x.aspects && x.aspects.includes(h)).map(x => x.graha) : [];
  const parts = signNakshatras(s);
  const el = SIGN_ELEMENT[s - 1], mo = SIGN_MODALITY[s - 1];
  const bh = T.BHAVA[h] || {}; const head = clean(bh.head || (typeof bh === "string" ? bh : ""));
  const moonRow = day ? day.sky.find(x => x.graha === "Moon") : null;
  const rows = [
    { label: "Your house", birth: esc(`${ord(h)} house`), now: esc(`${ord(h)} house`), changed: false },
    { label: "Lord", birth: esc(lord), now: esc(lord), changed: false },
    { label: "Lord placed", birth: esc(lordHouse ? `${ord(lordHouse)} house` : "—"), now: esc(lordNow ? `${ord(lordNow)} house` : "—"), changed: !!(lordNow && lordNow !== lordHouse) },
    { label: "Points here", birth: esc([ascHere ? "Lagna" : null, ...occ].filter(Boolean).join(", ") || "none"), now: esc(transiting.join(", ") || "none passing"), changed: occ.join() !== transiting.join() },
    { label: "Aspected by", birth: esc(aspB.join(", ") || "none"), now: esc(aspN.join(", ") || "none"), changed: aspB.join() !== aspN.join() },
    { label: "Nature", birth: esc(`${el} · ${mo}`), now: esc(`${el} · ${mo}`), changed: false },
  ];
  const leadB = `${sName} is your ${ord(h)} house${head ? ` — ${head}` : "."}${ascHere ? " It is the sign that was rising when you were born." : ""}`;
  const moreB = [clean(((T.LORD_IN_HOUSE || {})[h] || {})[lordHouse] || ""), ...occ.map(g => clean(((T.PLANET_STORY[g] || {}).inHouse || {})[h] || ""))].filter(Boolean).join(" ");
  const techB = [`${sName} ${(s - 1) * 30}°–${s * 30}° sidereal`, `${ord(h)} house from your ${T.SIGNS[C.lagna - 1]} lagna`, `lord ${lord} in your ${ord(lordHouse)}`, occ.length ? `holds ${occ.join(", ")}` : "empty at birth", aspB.length ? `aspected by ${aspB.join(", ")}` : null, `${el.toLowerCase()}, ${mo.toLowerCase()}`].filter(Boolean);
  const chainB = [
    { fact: `House · ${ord(h)} — ${head}`.trim(), show: `house:${h}` },
    { fact: `Lord · ${lord} in your ${ord(lordHouse)}`, show: `planet:${lord}` },
    ...occ.map(g => ({ fact: `Occupant · ${g}`, show: `planet:${g}` })),
    ...parts.map(p => ({ fact: `Nakshatra portion · ${p.name}${p.padas.length < 4 ? ` (padas ${p.padas[0]}–${p.padas[p.padas.length - 1]})` : ""}`, show: `nak:${p.index}` })),
    { fact: `Nature · ${el}, ${mo}`, note: SIGN_LINE[s - 1] },
  ];
  const sense = clean((T.HOUSE_TRANSIT_SENSE || {})[h] || "");
  const leadN = transiting.length ? `Right now ${transiting.join(" and ")} ${transiting.length > 1 ? "move" : "moves"} through ${sName} — your ${ord(h)} house${sense ? `, ${sense}` : "."}` : `No graha is passing through ${sName} right now; its lord ${lord} carries it from your ${ord(lordNow || lordHouse)}.`;
  const moonNote = moonRow && moonRow.sign === s ? (moonRow.houseFromMoon === 8 ? "The Moon is here today — the 8th from your natal Moon, the day the tradition names Chandrashtama: a low, inward day, not a catastrophe." : `The Moon is here today, ${ord(moonRow.houseFromMoon)} from your natal Moon.`) : "";
  const techN = [transiting.length ? `transiting: ${transiting.join(", ")}` : "no transiting graha", `lord ${lord} now in your ${ord(lordNow || lordHouse)}`, aspN.length ? `aspected now by ${aspN.join(", ")}` : null].filter(Boolean);
  const chainN = [
    ...transiting.map(g => ({ fact: `Transit · ${g} in ${sName}`, show: `sky:${g}`, showLabel: "Show in sky" })),
    { fact: `Lord now · ${lord} in your ${ord(lordNow || lordHouse)}`, show: `planet:${lord}` },
  ];
  return {
    kind: "rashi", id: s,
    title: sName, dev, eyebrow: `Rashi · ${sk}`,
    sub: `${(s - 1) * 30}°–${s * 30}° of the sidereal zodiac · ruled by ${esc(lord)}`,
    rows, changes: [lordNow && lordNow !== lordHouse ? `${lord} now in your ${ord(lordNow)}` : null, transiting.length ? `${transiting.join(", ")} passing through now` : null, aspB.join() !== aspN.join() ? `aspected now by ${aspN.join(", ") || "none"}` : null].filter(Boolean),
    aboutTitle: `About ${sName}`, about: `${sName} — ${SIGN_LINE[s - 1]}. Its lord is ${lord}; its nakshatras are ${parts.map(p => p.name).join(", ")}.`,
    birth: { lead: leadB, more: moreB, tech: techB.join(" · ") + ".", chain: chainB },
    now: { lead: leadN, more: moonNote, tech: techN.join(" · ") + ".", chain: chainN },
    actions: [
      { id: "chart", label: `See your ${ord(h)} house`, primary: true, run: () => ctx.actions.openHouse(h, spec.mode) },
      { id: "sky", label: "Show in sky", run: () => ctx.actions.showInSky(`rashi:${s - 1}`, spec.mode, at) },
      { id: "guide", label: "Ask Guide", run: () => ctx.actions.askGuide(`What does ${sName} mean in my chart?`, { source: "detail", sign: s, mode: spec.mode }) },
    ],
    heroSVG: px => `<svg class="codrashi" viewBox="0 0 100 100" width="${px}" height="${px}" aria-hidden="true">
        <defs><radialGradient id="codrg" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#FFFDF6"/><stop offset="1" stop-color="#E8DEC2"/></radialGradient></defs>
        <circle cx="50" cy="50" r="46" fill="url(#codrg)" stroke="#8F6B24" stroke-width="1.2"/>
        ${parts.map((p, i) => { const a0 = (p.from - (s - 1) * 30) / 30, a1 = (p.to - (s - 1) * 30) / 30; const R = 46, r = 41; const A = a => (-90 + a * 360) * Math.PI / 180;
          const x0 = 50 + R * Math.cos(A(a0)), y0 = 50 + R * Math.sin(A(a0)), x1 = 50 + R * Math.cos(A(a1)), y1 = 50 + R * Math.sin(A(a1));
          const xi = 50 + r * Math.cos(A(a1)), yi = 50 + r * Math.sin(A(a1)), xj = 50 + r * Math.cos(A(a0)), yj = 50 + r * Math.sin(A(a0));
          return `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A${R} ${R} 0 ${a1 - a0 > 0.5 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L${xi.toFixed(1)} ${yi.toFixed(1)} A${r} ${r} 0 ${a1 - a0 > 0.5 ? 1 : 0} 0 ${xj.toFixed(1)} ${yj.toFixed(1)}Z" fill="${["#C29B4E", "#8F6B24", "#D9C79A"][i % 3]}" opacity=".85"/>`; }).join("")}
        <text x="50" y="50" text-anchor="middle" font-size="24" font-weight="700" fill="#14162B" font-family="Devanagari Sangam MN, Kohinoor Devanagari, Noto Sans Devanagari, sans-serif">${esc(dev)}</text>
        <text x="50" y="70" text-anchor="middle" font-size="13" fill="#8F6B24">${SIGN_GLYPH[s - 1]}\uFE0E</text>
      </svg>`,
    foot: "A rashi is read as the house it makes in your chart, through its lord and whatever stands in it. Traditional associations, not predictions.",
  };
}

/* ---- NAKSHATRA ----------------------------------------------------- */
function nakshatraModel(spec, ctx) {
  const i = +spec.id, at = spec.at || new Date();                 /* 0..26 */
  const C = ctx.CHART, T = ctx.T, ord = ctx.ordinal;
  const r = nakshatraRange(i), m = NAK_META[i], lord = nakLord(i);
  const pts = [{ graha: "Lagna", L: C.ascendant }, ...C.placements.map(p => ({ graha: p.graha, L: p.L }))].filter(p => nakIndex(p.L) === i).map(p => ({ graha: p.graha, pada: padaIndex(p.L) }));
  const day = safe(() => ctx.dayFacts(at));
  const transiting = day ? day.sky.filter(x => x.nak === i || x.nak === r.name).map(x => x.graha) : [];
  const moonNat = C.get("Moon"); const moonNak = moonNat ? nakIndex(moonNat.L) : null;
  const tara = moonNak != null ? taraBala(moonNak, i) : null;
  const moonRow = day ? day.sky.find(x => x.graha === "Moon") : null; const moonHere = moonRow && (moonRow.nak === i || moonRow.nak === r.name);
  const signs = r.signs.map(x => T.SIGNS[x - 1]);
  const lordRec = C.rec(lord), lordHouse = lordRec ? lordRec.house : null;
  const rows = [
    { label: "Lord", birth: esc(lord), now: esc(lord), changed: false },
    { label: "Padas", birth: esc(`4 · in ${signs.join(" and ")}`), now: esc(`4 · in ${signs.join(" and ")}`), changed: false },
    { label: "Deity", birth: esc(m.deity), now: esc(m.deity), changed: false },
    { label: "Points here", birth: esc(pts.map(p => `${p.graha} (pada ${p.pada})`).join(", ") || "none"), now: esc(transiting.join(", ") || "none passing"), changed: pts.map(p => p.graha).join() !== transiting.join() },
    tara ? { label: "From your Moon", birth: esc(`${ord(tara.count)} · ${tara.name}`), now: esc(`${ord(tara.count)} · ${tara.name}`), changed: false } : null,
  ].filter(Boolean);
  const leadB = pts.length
    ? `At birth your ${pts.map(p => `${p.graha} (pada ${p.pada})`).join(" and ")} stood in ${r.name} — traditionally associated with ${m.means}.`
    : `No natal point stands in ${r.name}; it reaches you through its lord ${lord}, in your ${ord(lordHouse)}, and through ${signs.join(" and ")}.`;
  const moreB = tara ? `Counted from your natal Moon this is the ${ord(tara.count)} star — ${tara.name}, ${NAK_TONE[tara.name] || tara.note || ""}.` : "";
  const techB = [`${fmtDMS(r.start)}–${fmtDMS(r.end)}`, `lord ${lord} (Vimshottari)`, `padas in ${signs.join(" / ")}`, `deity ${m.deity}`, `symbol ${m.symbol}`].filter(Boolean);
  const chainB = [
    { fact: `Lord · ${lord}`, note: `${lord} rules its dasha years for anyone born with the Moon here`, show: `planet:${lord}` },
    ...r.signs.map(x => ({ fact: `Rashi · ${T.SIGNS[x - 1]}`, show: `sign:${x}` })),
    { fact: `Deity · ${m.deity}`, note: `symbol: ${m.symbol}` },
    ...pts.filter(p => p.graha !== "Lagna").map(p => ({ fact: `Natal · ${p.graha}, pada ${p.pada}`, show: `planet:${p.graha}` })),
  ];
  const leadN = transiting.length ? `Right now ${transiting.join(" and ")} ${transiting.length > 1 ? "pass" : "passes"} through ${r.name}.` : `No graha is passing through ${r.name} right now.`;
  const moreN = moonHere && tara ? `The Moon is here today — your ${tara.name} star (${ord(tara.count)} from your natal Moon): ${NAK_TONE[tara.name] || ""}.` : "";
  const techN = [transiting.length ? `transiting: ${transiting.join(", ")}` : "no transiting graha", moonHere ? "today's Moon nakshatra" : null].filter(Boolean);
  const chainN = [
    ...transiting.map(g => ({ fact: `Transit · ${g} in ${r.name}`, show: `sky:${g}`, showLabel: "Show in sky" })),
    moonHere && tara ? { fact: `Tara bala · ${tara.name}`, note: "counted from your natal Moon to today's Moon" } : null,
  ].filter(Boolean);
  return {
    kind: "nakshatra", id: i,
    title: r.name, dev: "", eyebrow: `Nakshatra · ${ord(i + 1)} of 27`,
    sub: `${esc(fmtDMS(r.start))} – ${esc(fmtDMS(r.end))} · ${esc(signs.join(" and "))} · ruled by ${esc(lord)}`,
    rows, changes: transiting.length ? [`${transiting.join(", ")} passing through now`] : [],
    aboutTitle: `About ${r.name}`, about: `Traditionally associated with ${m.means}. Its deity is ${m.deity}; its symbol ${m.symbol}. ${r.straddles ? `It straddles two signs — its padas fall in ${signs.join(" and ")}.` : `All four padas sit inside ${signs[0]}.`}`,
    birth: { lead: leadB, more: moreB, tech: techB.join(" · ") + ".", chain: chainB },
    now: { lead: leadN, more: moreN, tech: techN.join(" · ") + ".", chain: chainN },
    actions: [
      { id: "sky", label: "Show in sky", primary: true, run: () => ctx.actions.showInSky(`nak:${i}`, spec.mode, at) },
      { id: "guide", label: "Ask Guide", run: () => ctx.actions.askGuide(`What does ${r.name} mean for me?`, { source: "detail", nakshatra: i, mode: spec.mode }) },
    ],
    heroSVG: px => `<svg class="codnak" viewBox="0 0 100 100" width="${px}" height="${px}" aria-hidden="true">
        <defs><radialGradient id="codng" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#FFFDF6"/><stop offset="1" stop-color="#E8DEC2"/></radialGradient></defs>
        <circle cx="50" cy="50" r="46" fill="url(#codng)" stroke="#8F6B24" stroke-width="1.2"/>
        ${r.padas.map((p, k) => { const A = a => (-90 + a * 90) * Math.PI / 180; const R = 46, rr = 40; const x0 = 50 + R * Math.cos(A(k)), y0 = 50 + R * Math.sin(A(k)), x1 = 50 + R * Math.cos(A(k + 1)), y1 = 50 + R * Math.sin(A(k + 1)); const xi = 50 + rr * Math.cos(A(k + 1)), yi = 50 + rr * Math.sin(A(k + 1)), xj = 50 + rr * Math.cos(A(k)), yj = 50 + rr * Math.sin(A(k));
          const mine = pts.some(q => q.pada === p.pada);
          return `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A${R} ${R} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L${xi.toFixed(1)} ${yi.toFixed(1)} A${rr} ${rr} 0 0 0 ${xj.toFixed(1)} ${yj.toFixed(1)}Z" fill="${mine ? "#8F6B24" : (p.sign === r.signs[0] ? "#D9C79A" : "#C29B4E")}" opacity=".9"/>`; }).join("")}
        <text x="50" y="47" text-anchor="middle" font-size="22" font-weight="700" fill="#14162B">${i + 1}</text>
        <text x="50" y="64" text-anchor="middle" font-size="9" letter-spacing="1" fill="#8F6B24">${esc(lord.toUpperCase())}</text>
      </svg>`,
    foot: "A nakshatra is read through its lord, its deity and the points that stand in it. Traditional associations, not predictions.",
  };
}

function safe(f) { try { return f(); } catch (_) { return null; } }
function fmtShort(d) { try { return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" }); } catch (_) { return ""; } }
