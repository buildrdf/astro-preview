/* ===================================================================
   REPORT ENGINE (src/report.js) - Astra's full kundali + relationship
   reports, computed end-to-end by the engine and rendered as
   structured markdown in OUR voice:

     - every verdict shows the calculation that produced it
     - traditional-association language throughout, zero fear
     - no health claims, no invented Sanskrit (the only Sanskrit
       printed comes from the engine's own validated tables)

   Ported 31 Aug 2026 out of tools/generate_report.mjs (now a thin
   file-writing runner around this module) so the same generator runs
   in the browser (report.html) for ANY birth, not just the two
   reference charts. Environment-neutral: no fs, no process.env.TZ -
   all wall-clock display goes through the subject's own IANA zone
   (setReportZone below; defaults to IST so the reference outputs
   stay byte-identical).

   Regression rule: after ANY edit here run
     node tools/generate_report.mjs
   and `git diff docs/reports/generated` must be clean apart from
   NOW-dependent gochara rows (or the change must be explained).
   =================================================================== */

import { positions, retrograde, moonSidereal, sunSidereal, jd, ayanamsa } from "./ephemeris.js";
import { shadbala, bhavabala, SHADBALA_GRAHAS } from "./shadbala.js";
import { yoginiDasha } from "./yogini.js";
import { placidusCusps, chalitHouseOf } from "./cusps.js";
import { ascendant, altAz, gmst } from "./sky.js";
import { limbs, GOCHARA_GOOD } from "./panchang.js";
import { vimshottari, DASHA_ORDER } from "./dasha3.js";
import { vargaChart, SUPPORTED } from "./vargas.js";
import { bhinnashtakavarga, sarvashtakavarga, AV_GRAHAS } from "./ashtakavarga.js";
import { detectYogas, detectDoshas, buildYogaChart } from "./yogas.js";
import { ashtakoota, manglik } from "./match.js";
import { ASTERISMS } from "./asterisms.js";
import { DASHA_THEME, ANTAR_FLAVOR } from "./narrative.js";
import { PLANET_STORY, GRAHA_MEANING } from "./interpret.js";
import { HOUSE_STORY, GRAHA_IN_SIGN, LORD_IN_HOUSE, CONJUNCTION_BLEND, conjKey } from "./lore.js";

/* "now" for the gochara/dasha-at-present sections - injectable */
let NOW = new Date();
export function setNow(d) { NOW = d; }

/* ------------------------------------------------ vocabulary ------ */

const SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra",
  "Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const SIGN_AB = ["Ari","Tau","Gem","Can","Leo","Vir","Lib","Sco","Sag","Cap","Aqu","Pis"];
const SIGN_LORD = ["Mars","Venus","Mercury","Moon","Sun","Mercury",
  "Venus","Mars","Jupiter","Saturn","Saturn","Jupiter"];       /* Aries.. */
const GRAHAS = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"];
const SEVEN = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"];
const EXALT = { Sun:1, Moon:2, Mars:10, Mercury:6, Jupiter:4, Venus:12, Saturn:7 };
const DEBIL = { Sun:7, Moon:8, Mars:4, Mercury:12, Jupiter:10, Venus:6, Saturn:1 };

const NAK_NAMES = ASTERISMS.map(a => a.nak);          /* validated catalog order */

/* Avakhada tables - these mirror the module-private tables inside
   src/match.js (the same standard Parashari tables the koota scoring
   was validated against); duplicated here only because match.js keeps
   them private. Order: Aries.. / Ashwini.. */
const VARNA_OF_SIGN = ["Kshatriya","Vaishya","Shudra","Brahmin","Kshatriya","Vaishya",
  "Shudra","Brahmin","Kshatriya","Vaishya","Shudra","Brahmin"];
const VASHYA_OF_SIGN = ["Chatushpada","Chatushpada","Manava","Jalachara","Vanachara","Manava",
  "Manava","Keeta","Manava","Jalachara","Manava","Jalachara"];
const YONI_OF = ["horse","elephant","sheep","serpent","serpent","dog","cat","sheep","cat",
  "rat","rat","cow","buffalo","tiger","buffalo","tiger","deer","deer","dog",
  "monkey","mongoose","monkey","lion","horse","lion","cow","elephant"];
const GANA_OF = ["Deva","Manushya","Rakshasa","Manushya","Deva","Manushya","Deva","Deva","Rakshasa",
  "Rakshasa","Manushya","Manushya","Deva","Rakshasa","Deva","Rakshasa","Deva","Rakshasa","Rakshasa",
  "Manushya","Manushya","Deva","Rakshasa","Rakshasa","Manushya","Manushya","Deva"];
const NADI_OF = ["Adi","Madhya","Antya","Antya","Madhya","Adi","Adi","Madhya","Antya",
  "Antya","Madhya","Adi","Adi","Madhya","Antya","Antya","Madhya","Adi","Adi",
  "Madhya","Antya","Antya","Madhya","Adi","Adi","Madhya","Antya"];

/* Extended Avakhada - only attributes whose rule we can validate against
   the printed benchmark charts are added (COMPARISON.md §1 item 12):
     Tatva      - element of the Moon sign (Fire/Earth/Air/Water cycle from
                  Aries). Validated: Sagittarius->Fire (Astrotalk, and AAP's
                  "Hansak Agni"), Libra->Air (Astrotalk partner).
     Namakshara - the naming syllable of the Moon's nakshatra-pada, from the
                  standard 108-syllable avakahada chakra. Validated: Mula 4
                  -> Bhi ("Bhee"/"Bi" in both vendors), Swati 2 -> Re.
     Yunja      - the nakshatra's third of the 27 (1-9 Adi, 10-18 Madhya,
                  19-27 Antya). Validated against both Astrotalk charts
                  (Mula #19 -> Antya, Swati #15 -> Madhya); AAP prints a
                  different scheme ("Sheeta") that contradicts Astrotalk.
   Paya is deliberately NOT added: the two vendors print different schemes
   (Astrotalk "Copper", AAP "Iron - Copper") and no single rule reproduces
   both, so we do not guess (same discipline as the D5 varga skip). */
const TATVA_OF_SIGN = ["Fire","Earth","Air","Water"];        /* index sign-1 mod 4 */
const NAME_SYL = [
  ["Chu","Che","Cho","La"],["Li","Lu","Le","Lo"],["A","I","U","E"],
  ["O","Va","Vi","Vu"],["Ve","Vo","Ka","Ki"],["Ku","Gha","Nga","Chha"],
  ["Ke","Ko","Ha","Hi"],["Hu","He","Ho","Da"],["Di","Du","De","Do"],
  ["Ma","Mi","Mu","Me"],["Mo","Ta","Ti","Tu"],["Te","To","Pa","Pi"],
  ["Pu","Sha","Na","Tha"],["Pe","Po","Ra","Ri"],["Ru","Re","Ro","Ta"],
  ["Ti","Tu","Te","To"],["Na","Ni","Nu","Ne"],["No","Ya","Yi","Yu"],
  ["Ye","Yo","Bha","Bhi"],["Bhu","Dha","Pha","Dha"],["Bhe","Bho","Ja","Ji"],
  ["Khi","Khu","Khe","Kho"],["Ga","Gi","Gu","Ge"],["Go","Sa","Si","Su"],
  ["Se","So","Da","Di"],["Du","Tha","Jha","Na"],["De","Do","Cha","Chi"],
];
const YUNJA_OF_NAK = i => i < 9 ? "Adi" : i < 18 ? "Madhya" : "Antya";

/* The Avakhada identity block for a (sidereal) Moon longitude -
   exported for the app's Birth-details sheet, which used to carry
   these values transcribed from a vendor PDF (those constants died in
   a refactor and the sheet crashed on a live tap, 31 Aug). Same
   validated tables the printed reports use. */
export function avakhadaOf(moonL) {
  const s = signOf(moonL), n = nakOf(moonL), p = padaOf(moonL);
  return {
    "Rashi (Moon sign)": SIGNS[s - 1],
    "Rashi lord": SIGN_LORD[s - 1],
    "Nakshatra": `${NAK_NAMES[n]} · pada ${p}`,
    "Nakshatra lord": nakLord(n),
    "Varna": VARNA_OF_SIGN[s - 1],
    "Vashya": VASHYA_OF_SIGN[s - 1],
    "Yoni": YONI_OF[n],
    "Gana": GANA_OF[n],
    "Nadi": NADI_OF[n],
    "Tatva": TATVA_OF_SIGN[(s - 1) % 4],
    "Namakshara": NAME_SYL[n][p - 1],
    "Yunja": YUNJA_OF_NAK(n),
  };
}

const VARA_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const VARA_LORD  = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"];

const HOUSE_SENSE = {           /* one-line traditional field per house */
  1:"self, body and bearing", 2:"speech, family and stored wealth",
  3:"courage, siblings and skill of hand", 4:"home, mother and inner ground",
  5:"creativity, children and learning", 6:"work, service and obstacles met",
  7:"partnership and the other", 8:"depth, change and what is shared",
  9:"fortune, teachers and belief", 10:"career, standing and visible work",
  11:"gains, friends and networks", 12:"retreat, expense and release",
};

/* ------------------------------------------------ helpers --------- */

const norm = d => ((d % 360) + 360) % 360;
const signOf = L => Math.floor(norm(L) / 30) + 1;
const degIn = L => norm(L) % 30;
const nakOf = L => Math.floor(norm(L) / (360 / 27));
const padaOf = L => Math.floor((norm(L) % (360 / 27)) / (360 / 108)) + 1;
const houseFrom = (refSign, s) => ((s - refSign) % 12 + 12) % 12 + 1;
const nakLord = i => DASHA_ORDER[i % 9];
const ord = h => h + (h === 1 ? "st" : h === 2 ? "nd" : h === 3 ? "rd" : "th");
const dash = s => String(s).replace(/&#8212;/g, "—");

/* Arc-minute display TRUNCATES (12°05'55" shows as 12°05') - the same
   convention the app and both benchmark vendors use. Rounding here
   made the report's lagna read 12°06' against the app's 12°05' for
   the same longitude - caught by Sangram as a "mismatch", 31 Aug. */
const dm = L => {
  const d = Math.floor(degIn(L)), m = Math.floor((degIn(L) - d) * 60);
  return `${d}°${String(m).padStart(2, "0")}'`;
};
/* degrees-in-sign to d°mm'ss" - the display convention both benchmark
   vendors use. Seconds are display resolution, not a precision claim;
   the positions section states the engine's verified error budget. */
const dmsFull = L => {
  const p2 = n => String(n).padStart(2, "0");
  let t = Math.round(degIn(L) * 3600);
  const d = Math.floor(t / 3600); t -= d * 3600;
  return `${d}°${p2(Math.floor(t / 60))}'${p2(t % 60)}"`;
};
const PLANET_AB = { Sun:"Su", Moon:"Mo", Mars:"Ma", Mercury:"Me", Jupiter:"Ju",
  Venus:"Ve", Saturn:"Sa", Rahu:"Ra", Ketu:"Ke" };
/* combustion orbs (degrees from the Sun), the same table yogas.js uses */
const COMBUST_ORB = { Mercury:12, Venus:10, Mars:17, Jupiter:11, Saturn:15 };
const sepDeg = (a, b) => { const r = Math.abs(norm(a) - norm(b)); return r > 180 ? 360 - r : r; };
/* full drishti (special aspects as houses from own seat); all cast the 7th */
const DRISHTI = { Mars:[4,7,8], Jupiter:[5,7,9], Saturn:[3,7,10] };
const advSign = (s, n) => ((s - 1 + n - 1) % 12) + 1;   /* n-th sign from s */

const angDiff = (a, b) => { let d = norm(a - b); if (d > 180) d -= 360; return d; };

/* Signed daily motion of a graha, degrees/day (centred difference) */
function speedOf(g, date) {
  const H = 432e5;   /* 12 h */
  const a = positions(new Date(date.getTime() - H))[g];
  const b = positions(new Date(date.getTime() + H))[g];
  return angDiff(b, a);
}

/* First time >= start when a slowly-increasing angular quantity f(t)
   (degrees, wrapping at 360) reaches `target`. Newton-style stepping on
   the finite-difference rate; used for panchang limb end-times. */
function crossForward(f, startMs, target) {
  let t = startMs;
  for (let i = 0; i < 24; i++) {
    const cur = f(t);
    let rem = norm(target - cur);
    if (rem < 1e-4 || rem > 359.999) return t;
    const rate = angDiff(f(t + 864e5), cur);          /* deg/day */
    if (rate <= 0) return null;
    if (rem > 340) return t;                          /* numerically at the boundary */
    t += (rem / rate) * 864e5;
  }
  return t;
}

/* Next moment a graha changes sidereal sign (either direction - a
   retrograde slip back across the boundary counts, honestly). */
function nextSignChange(g, from) {
  const STEP_DAYS = { Moon:0.25, Sun:1, Mercury:0.5, Venus:0.5, Mars:1,
    Jupiter:4, Saturn:4, Rahu:4, Ketu:4 };
  const step = (STEP_DAYS[g] ?? 2) * 864e5;
  const sOf = t => signOf(positions(new Date(t))[g]);
  let t = from.getTime(); const s0 = sOf(t); const limit = t + 4 * 365.25 * 864e5;
  for (let prev = t, u = t + step; u < limit; prev = u, u += step) {
    if (sOf(u) !== s0) {
      let a = prev, b = u;
      while (b - a > 36e5) { const m = (a + b) / 2; if (sOf(m) === s0) a = m; else b = m; }
      return new Date(b);
    }
  }
  return null;
}

/* Constant-sign segments of transiting Jupiter (retrograde re-entries
   appear as their own rows - the honest shape of the transit). */
function jupiterSignSegments(from, to) {
  const STEP = 5 * 864e5;
  const sOf = t => signOf(positions(new Date(t)).Jupiter);
  const segs = []; let t = from.getTime(), cur = sOf(t), st = t;
  for (t += STEP; t <= to.getTime(); t += STEP) {
    const s = sOf(t);
    if (s !== cur) {
      let a = t - STEP, b = t;
      while (b - a > 36e5) { const m = (a + b) / 2; if (sOf(m) === cur) a = m; else b = m; }
      segs.push({ sign: cur, start: new Date(st), end: new Date(b) });
      cur = s; st = b;
    }
  }
  segs.push({ sign: cur, start: new Date(st), end: new Date(to) });
  return segs;
}

/* --- report zone ---------------------------------------------------
   Wall-clock display zone for every date/time the report prints.
   Defaults to IST so the two validated reference reports render
   byte-identical; report.html calls setReportZone(subject's IANA
   zone). Offsets come from Intl PER-INSTANT, so DST-observing birth
   zones stay correct across decades of dasha dates. */
let TZ_NAME = "Asia/Kolkata", TZ_ABBR = "IST";
export function setReportZone(tzName, abbr) {
  TZ_NAME = tzName;
  if (abbr) { TZ_ABBR = abbr; return; }
  const parts = new Intl.DateTimeFormat("en-US",
    { timeZone: tzName, timeZoneName: "short" }).formatToParts(new Date());
  TZ_ABBR = (parts.find(p => p.type === "timeZoneName") || {}).value || tzName;
}
const tzOffsetMs = d => {
  const f = new Intl.DateTimeFormat("en-US", { timeZone: TZ_NAME, hour12: false,
    year: "numeric", month: "numeric", day: "numeric",
    hour: "numeric", minute: "numeric", second: "numeric" });
  const m = {}; for (const p of f.formatToParts(d)) m[p.type] = p.value;
  return Date.UTC(m.year, m.month - 1, m.day, m.hour % 24, m.minute, m.second)
       - Math.floor(d.getTime() / 1000) * 1000;
};
const fmtTime = d => {                      /* HH:MM in the report zone */
  const t = new Date(d.getTime() + tzOffsetMs(d));
  return `${String(t.getUTCHours()).padStart(2,"0")}:${String(t.getUTCMinutes()).padStart(2,"0")}`;
};
const fmtDateTime = d => `${fmtDate(d)}, ${fmtTime(d)} ${TZ_ABBR}`;

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmtDate = d => {                       /* calendar day, report zone */
  const t = new Date(d.getTime() + tzOffsetMs(d));
  return `${t.getUTCDate()} ${MONTHS[t.getUTCMonth()]} ${t.getUTCFullYear()}`;
};
const istWeekday = d => new Date(d.getTime() + tzOffsetMs(d)).getUTCDay();
const fmtLatLon = (lat, lon) =>
  `${Math.abs(lat)}°${lat >= 0 ? "N" : "S"}, ${Math.abs(lon)}°${lon >= 0 ? "E" : "W"}`;

/* sky.js sunTimes() anchors its scan on the RUNTIME's local midnight
   (fine inside the app, where device zone ~ user zone). The report
   must be right for any visitor viewing any birthplace, so this
   variant anchors on the report zone's civil midnight instead -
   identical to the original under TZ=Asia/Kolkata. */
function sunTimesZone(date, lat, lon) {
  const off = tzOffsetMs(date);
  const t = date.getTime() + off;
  const day0 = new Date(t - (((t % 864e5) + 864e5) % 864e5) - off);
  const altAt = h => altAz("Sun", new Date(day0.getTime() + h * 36e5), lat, lon).alt;
  const cross = (h1, h2, rising) => {
    let a = h1, b = h2;
    for (let i = 0; i < 24; i++) {
      const m = (a + b) / 2, up = altAt(m) > -0.833;
      if (up === rising) b = m; else a = m;
    }
    return new Date(day0.getTime() + ((a + b) / 2) * 36e5);
  };
  let rise = null, set = null, prev = altAt(0);
  for (let h = 1; h <= 24; h++) {
    const cur = altAt(h);
    if (prev <= -0.833 && cur > -0.833) rise = cross(h - 1, h, true);
    if (prev > -0.833 && cur <= -0.833) set = cross(h - 1, h, false);
    prev = cur;
  }
  return { rise, set };
}

function dignity(g, s) {
  if (!SEVEN.includes(g)) return null;
  if (EXALT[g] === s) return "exalted";
  if (DEBIL[g] === s) return "debilitated";
  if (SIGN_LORD[s - 1] === g) return "own sign";
  return null;
}

/* Chara karakas - Jaimini/Parashari movable significators, ranked by
   degrees traversed within the sign. Two schools are computed and both
   are shown: the eight-karaka scheme (Parashara: seven grahas plus
   Rahu, whose arc is counted from the END of its sign, 30 - deg) and
   the seven-karaka scheme (grahas only, no Pitrikaraka). */
const K8 = ["Atmakaraka","Amatyakaraka","Bhratrikaraka","Matrikaraka",
            "Pitrikaraka","Putrakaraka","Gnatikaraka","Darakaraka"];
const K7 = ["Atmakaraka","Amatyakaraka","Bhratrikaraka","Matrikaraka",
            "Putrakaraka","Gnatikaraka","Darakaraka"];
function charaKarakas(pos) {
  const arc = g => g === "Rahu" ? 30 - degIn(pos[g]) : degIn(pos[g]);
  const rank = list => [...list].sort((a, b) => arc(b) - arc(a));
  const eight = rank([...SEVEN, "Rahu"]).map((g, i) => ({ karaka: K8[i], graha: g, arc: arc(g) }));
  const seven = rank(SEVEN).map((g, i) => ({ karaka: K7[i], graha: g, arc: arc(g) }));
  return { eight, seven };
}

/* Sade sati - Saturn transiting the 12th, 1st and 2nd signs counted
   from the natal Moon, computed directly from the ephemeris: scan
   Saturn's sidereal sign, refine each boundary crossing by bisection,
   then merge runs separated only by a short retrograde dip. */
function sadeSati(moonSign, fromDate, toDate) {
  const inBand = s => [12, 1, 2].includes(houseFrom(moonSign, s));
  const satSign = t => signOf(positions(new Date(t)).Saturn);
  const STEP = 5 * 864e5;
  const refine = (t0, t1) => {              /* sign flips between t0,t1 */
    let a = t0, b = t1;
    const sa = satSign(a);
    while (b - a > 36e5) { const m = (a + b) / 2; if (satSign(m) === sa) a = m; else b = m; }
    return b;
  };
  /* raw segments of constant Saturn sign */
  const segs = [];
  let t = fromDate.getTime(), cur = satSign(t), segStart = t;
  for (t += STEP; t <= toDate.getTime(); t += STEP) {
    const s = satSign(t);
    if (s !== cur) {
      const cross = refine(t - STEP, t);
      segs.push({ sign: cur, start: segStart, end: cross });
      cur = s; segStart = cross;
    }
  }
  segs.push({ sign: cur, start: segStart, end: toDate.getTime() });
  /* group in-band segments into windows; a gap under 600 days is a
     retrograde dip back across the entry boundary, not a new window */
  const windows = [];
  for (const seg of segs.filter(s => inBand(s.sign))) {
    const last = windows.at(-1);
    if (last && seg.start - last.end < 600 * 864e5) {
      last.end = seg.end; last.segs.push(seg);
    } else windows.push({ start: seg.start, end: seg.end, segs: [seg] });
  }
  const PHASE = { 12: "rising (12th from Moon)", 1: "peak (over the Moon sign)", 2: "setting (2nd from Moon)" };
  return windows.map(w => ({
    start: new Date(w.start), end: new Date(w.end),
    years: (w.end - w.start) / (365.25 * 864e5),
    active: NOW.getTime() >= w.start && NOW.getTime() < w.end,
    atBirth: null,                     /* filled by the caller */
    phases: w.segs.map(s => ({
      phase: PHASE[houseFrom(moonSign, s.sign)], sign: SIGNS[s.sign - 1],
      start: new Date(s.start), end: new Date(s.end),
    })),
  }));
}

/* sidereal midheaven - same derivation the app's mcOf uses (verified
   against printed KP cusps in the round-2 validation) */
const RADm = Math.PI / 180;
function mcOf(date, lonE) {
  const J = jd(date), T = (J - 2451545) / 36525;
  const g = 280.46061837 + 360.98564736629 * (J - 2451545) + 0.000387933 * T * T;
  const ramc = norm(g + lonE);
  const eps = 23.439291 - 0.0130042 * T;
  const lam = Math.atan2(Math.sin(ramc * RADm),
    Math.cos(ramc * RADm) * Math.cos(eps * RADm)) / RADm;
  return norm(lam - ayanamsa(J));
}

/* ------------------------------------------------ compute --------- */

function computeChart(p) {
  const pos = positions(p.date);
  const rx = retrograde(p.date);
  const ascLon = ascendant(p.date, p.lat, p.lon);
  const lagna = signOf(ascLon);
  const moonL = moonSidereal(p.date);

  const points = { Asc: ascLon, ...pos };

  const houses = Array.from({ length: 12 }, (_, i) => {
    const s = ((lagna - 1 + i) % 12) + 1;
    return {
      n: i + 1, sign: s, lord: SIGN_LORD[s - 1],
      occupants: GRAHAS.filter(g => signOf(pos[g]) === s),
    };
  });

  const vargas = {};
  for (const D of SUPPORTED) vargas[D] = vargaChart(points, D);

  const dasha = vimshottari(moonL, p.date);
  const nowStack = dasha.at(NOW);

  const avPlacements = { Lagna: lagna };
  for (const g of AV_GRAHAS) avPlacements[g] = signOf(pos[g]);
  const bav = bhinnashtakavarga(avPlacements);
  const sav = sarvashtakavarga(bav);

  const yogas = detectYogas(buildYogaChart(pos, ascLon));

  const moonSign = signOf(pos.Moon);
  /* scan from 12 years before birth so a window already running at
     birth is captured whole; windows fully before birth are dropped */
  const sati = sadeSati(moonSign, new Date(p.date.getTime() - 12 * 365.25 * 864e5),
    new Date(Date.UTC(2060, 0, 1)))
    .filter(w => w.end.getTime() >= p.date.getTime())
    .map(w => ({ ...w, atBirth: w.start.getTime() <= p.date.getTime() && p.date.getTime() < w.end.getTime() }));

  const marsSign = signOf(pos.Mars);
  const mangal = {
    fromLagna: manglik(marsSign, lagna),
    fromMoon: manglik(marsSign, moonSign),
  };

  const karakas = charaKarakas(pos);

  const birthLimbs = limbs(sunSidereal(p.date), moonL);
  const wd = istWeekday(p.date);

  /* --- birth-sky clock: sunrise/sunset, day length, LMT, sidereal time */
  const st = sunTimesZone(p.date, p.lat, p.lon);
  const nextRise = sunTimesZone(new Date(p.date.getTime() + 864e5), p.lat, p.lon).rise;
  const lmtDate = new Date(p.date.getTime() + p.lon / 15 * 36e5); /* local mean time */
  const lmt = `${String(lmtDate.getUTCHours()).padStart(2,"0")}:${String(lmtDate.getUTCMinutes()).padStart(2,"0")}`;
  const lstDeg = norm(gmst(jd(p.date)) + p.lon);                /* local sidereal, deg */
  const lstH = lstDeg / 15;
  const lst = `${String(Math.floor(lstH)).padStart(2,"0")}:${String(Math.floor(lstH*60)%60).padStart(2,"0")}:${String(Math.round(lstH*3600)%60).padStart(2,"0")}`;

  /* --- panchang limb end-times (first boundary after birth) ---------- */
  const t0 = p.date.getTime();
  const elongAt = t => norm(moonSidereal(new Date(t)) - sunSidereal(new Date(t)));
  const moonAt  = t => moonSidereal(new Date(t));
  const sumAt   = t => norm(sunSidereal(new Date(t)) + moonSidereal(new Date(t)));
  const NAKSPAN = 360 / 27;
  const upTo = (v, span) => norm((Math.floor(v / span) + 1) * span);
  const ends = {
    tithi:  crossForward(elongAt, t0, upTo(elongAt(t0), 12)),
    karana: crossForward(elongAt, t0, upTo(elongAt(t0), 6)),
    nak:    crossForward(moonAt,  t0, upTo(moonAt(t0), NAKSPAN)),
    yoga:   crossForward(sumAt,   t0, upTo(sumAt(t0), NAKSPAN)),
  };
  for (const k in ends) ends[k] = ends[k] ? new Date(ends[k]) : null;
  ends.vara = nextRise;                       /* the Vedic day runs sunrise to sunrise */

  /* --- doshas (evidence-first, from the same engine as the yogas) --- */
  const doshas = detectDoshas(buildYogaChart(pos, ascLon));

  /* --- gochara snapshot: where every graha stands right now ---------- */
  const nowPos = positions(NOW);
  const gochara = GRAHAS.map(g => {
    const s = signOf(nowPos[g]);
    const fromMoon = houseFrom(moonSign, s);
    return { graha: g, lon: nowPos[g], sign: s,
      fromMoon, fromLagna: houseFrom(lagna, s),
      favourable: (GOCHARA_GOOD[g] || []).includes(fromMoon),
      sav: sav[s - 1],
      until: nextSignChange(g, NOW) };
  });

  /* --- per-graha speed and combustion at birth ----------------------- */
  const speeds = {}; for (const g of GRAHAS) speeds[g] = speedOf(g, p.date);
  const combust = {};
  for (const g of Object.keys(COMBUST_ORB)) {
    const d = sepDeg(pos[g], pos.Sun);
    if (d < COMBUST_ORB[g]) combust[g] = d;
  }

  /* --- shadbala + bhava bala (BPHS, validated round 2) -------------- */
  let sb = null, bb = null;
  try {
    if (st.rise && st.set) {
      const shChart = { longitudes: pos, ascendant: ascLon, mc: mcOf(p.date, p.lon),
        date: p.date, sunrise: st.rise, sunset: st.set,
        tzMinutes: Math.round(tzOffsetMs(p.date) / 6e4) };
      sb = shadbala(shChart);
      bb = bhavabala(shChart, {}, sb);
    }
  } catch (_) { sb = null; bb = null; }

  /* --- yogini + placidus/chalit (both validated vs printed tables) -- */
  const yogini = yoginiDasha(moonL, p.date);
  let cusps = null, chalit = null;
  try {
    cusps = placidusCusps(p.date, p.lat, p.lon);
    chalit = {};
    for (const g of GRAHAS) chalit[g] = chalitHouseOf(pos[g], cusps);
  } catch (_) { cusps = null; chalit = null; }

  return { ...p, pos, rx, ascLon, lagna, moonL, points, houses, vargas,
    dasha, nowStack, bav, sav, yogas, sati, mangal, karakas, sb, bb,
    yogini, cusps, chalit,
    birthLimbs, vara: { name: VARA_NAMES[wd], lord: VARA_LORD[wd] },
    moonSign, marsSign,
    sunrise: st.rise, sunset: st.set, lmt, lst, ends, doshas, gochara,
    speeds, combust };
}

/* ------------------------------------------------ render: kundali - */

const VOICE_NOTE =
  "*Every position in this report is computed deterministically by Astra's " +
  "ephemeris and rule engine, and every reading names the placement that " +
  "produced it. Interpretive lines describe what a placement is " +
  "**traditionally associated with** within Vedic astrology — they are a " +
  "compass for reflection, not a prediction, and nothing here is medical, " +
  "legal or financial advice.*";

function renderKundali(c) {
  const L = [];
  const push = (...x) => L.push(...x, "");

  push(`# ${c.name} — Vedic Birth Chart`,
    "",
    `**Born:** ${c.birthLocal} · ${c.place} (${fmtLatLon(c.lat, c.lon)})`,
    `**Generated by Astra** on ${fmtDate(NOW)} · Lahiri ayanamsa · whole-sign houses · true lunar node`,
    "",
    VOICE_NOTE);

  /* --- 1 birth panchang --------------------------------------- */
  const bl = c.birthLimbs;
  const moonNak = nakOf(c.moonL);
  push("## 1. Birth Panchang",
    "",
    "The five limbs of the Vedic day you were born on, computed from the Sun–Moon geometry at the birth moment. Each limb also shows when it ended — the transition the engine finds by running the same geometry forward:",
    "",
    "| Limb | Value | How it is derived | Until |",
    "|---|---|---|---|",
    `| Vara (weekday) | ${c.vara.name}, ruled by ${c.vara.lord} | the weekday's traditional lord (sunrise to sunrise) | ${c.ends.vara ? fmtDateTime(c.ends.vara) : "—"} |`,
    `| Tithi (lunar day) | ${bl.tithi.name} (${bl.tithi.paksha} paksha, day ${bl.tithi.inPaksha} of 15) | Moon–Sun elongation of ${bl.elongation.toFixed(1)}° ÷ 12° per tithi | ${c.ends.tithi ? fmtDateTime(c.ends.tithi) : "—"} |`,
    `| Nakshatra | ${NAK_NAMES[moonNak]} (pada ${padaOf(c.moonL)}) | Moon at ${SIGNS[c.moonSign - 1]} ${dm(c.moonL)} | ${c.ends.nak ? fmtDateTime(c.ends.nak) : "—"} |`,
    `| Yoga | ${bl.yoga.name} | (Sun + Moon longitude) ÷ 13°20' | ${c.ends.yoga ? fmtDateTime(c.ends.yoga) : "—"} |`,
    `| Karana | ${bl.karana.name} | the half-tithi running at birth | ${c.ends.karana ? fmtDateTime(c.ends.karana) : "—"} |`,
    "",
    "**The birth sky's clock** — the local solar and sidereal frame the chart was cast in:",
    "",
    "| | Value | How it is derived |",
    "|---|---|---|",
    `| Sunrise | ${c.sunrise ? `${fmtTime(c.sunrise)} ${TZ_ABBR}` : "—"} | Sun's centre at −0°50' altitude at ${c.place.split(",")[0]} |`,
    `| Sunset | ${c.sunset ? `${fmtTime(c.sunset)} ${TZ_ABBR}` : "—"} | same rule, evening crossing |`,
    `| Day length | ${(() => { if (!c.sunrise || !c.sunset) return "—"; const m = Math.round((c.sunset - c.sunrise) / 6e4); return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`; })()} | sunset − sunrise |`,
    `| Local mean time of birth | ${c.lmt} LMT | clock time shifted to the birthplace meridian (${c.lon}°E ÷ 15) |`,
    `| Local sidereal time | ${c.lst} | Greenwich sidereal time + east longitude — the angle that fixes the ascendant |`);

  /* --- 2 avakhada ---------------------------------------------- */
  const ms = c.moonSign;
  push("## 2. Avakhada — Moon-Based Identity",
    "",
    "The classical identity block, read entirely from the Moon's position at birth — the same categories the ashtakoota matching system scores:",
    "",
    "| Attribute | Value | Source |",
    "|---|---|---|",
    `| Rashi (Moon sign) | ${SIGNS[ms - 1]} | Moon at ${dm(c.moonL)} ${SIGNS[ms - 1]} |`,
    `| Rashi lord | ${SIGN_LORD[ms - 1]} | lord of ${SIGNS[ms - 1]} |`,
    `| Nakshatra · pada | ${NAK_NAMES[moonNak]} · ${padaOf(c.moonL)} | 27 equal divisions of the zodiac |`,
    `| Nakshatra lord | ${nakLord(moonNak)} | the Vimshottari lord of ${NAK_NAMES[moonNak]} |`,
    `| Varna | ${VARNA_OF_SIGN[ms - 1]} | class of the Moon sign |`,
    `| Vashya | ${VASHYA_OF_SIGN[ms - 1]} | nature-group of the Moon sign |`,
    `| Yoni | ${YONI_OF[moonNak]} | instinct-nature of ${NAK_NAMES[moonNak]} |`,
    `| Gana | ${GANA_OF[moonNak]} | temperament group of ${NAK_NAMES[moonNak]} |`,
    `| Nadi | ${NADI_OF[moonNak]} | constitution group of ${NAK_NAMES[moonNak]} |`,
    `| Tatva | ${TATVA_OF_SIGN[(c.moonSign - 1) % 4]} | element of the Moon sign (${SIGNS[c.moonSign - 1]}) |`,
    `| Namakshara | ${NAME_SYL[moonNak][padaOf(c.moonL) - 1]} | naming syllable of ${NAK_NAMES[moonNak]} pada ${padaOf(c.moonL)}, from the classical avakahada chakra |`,
    `| Yunja | ${YUNJA_OF_NAK(moonNak)} | ${NAK_NAMES[moonNak]} is nakshatra ${moonNak + 1} of 27 — first/middle/final third |`,
    "",
    "*Where platforms disagree on an attribute's scheme (they do — even with each other), Astra ships only the attributes whose rule reproduces the printed benchmarks for both reference charts, and leaves the rest out rather than guessing.*");

  /* --- 3 positions --------------------------------------------- */
  const rows = ["Asc", ...GRAHAS].map(g => {
    const Lg = c.points[g], s = signOf(Lg), nk = nakOf(Lg);
    const dg = g === "Asc" ? null : dignity(g, s);
    const motion = g === "Asc" ? "—"
      : (g === "Rahu" || g === "Ketu") ? "always retrograde"
      : c.rx[g] ? "retrograde" : "direct";
    const speed = g === "Asc" ? "—" : (v => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(Math.abs(v) < 0.05 ? 3 : 2)}°/d`)(c.speeds[g]);
    const comb = !(g in COMBUST_ORB) ? "—"
      : c.combust[g] !== undefined ? `combust (${c.combust[g].toFixed(1)}° from Sun)` : "no";
    const house = g === "Asc" ? 1 : houseFrom(c.lagna, s);
    return `| ${g === "Asc" ? "Ascendant" : g} | ${SIGNS[s - 1]} ${dmsFull(Lg)} | ${NAK_NAMES[nk]} · ${padaOf(Lg)} | ${nakLord(nk)} | ${ord(house)} | ${motion} | ${speed} | ${comb} | ${dg ?? "—"} |`;
  });
  push("## 3. Planetary Positions",
    "",
    "Sidereal longitudes (Lahiri). Houses are whole-sign, counted from the ascendant. Speed is the graha's actual daily motion at the birth moment; combustion is proximity to the Sun within the classical orb for that graha.",
    "",
    "| Point | Sign · degree | Nakshatra · pada | Nak. lord | House | Motion | Speed | Combust | Dignity |",
    "|---|---|---|---|---|---|---|---|---|",
    ...rows,
    "",
    "*Method notes: Rahu/Ketu are the **true** lunar node (some platforms print the mean node; the two can differ by up to ~1.7°, enough to move a node's nakshatra). Seconds of arc are display resolution — the ephemeris's verified worst-case error is under 1' for Sun, Moon, ascendant and nodes, and a few minutes of arc for the slow planets, which cannot move a sign or nakshatra here but can matter within ~0.1° of a boundary.*");

  /* chart grid - fixed-sign (South Indian) layout, faithful in plain text;
     the app itself draws the North Indian diamond interactively */
  const cellOf = s => {
    const names = [];
    if (c.lagna === s) names.push("**Asc**");
    names.push(...GRAHAS.filter(g => signOf(c.pos[g]) === s).map(g => PLANET_AB[g]));
    return `${SIGN_AB[s - 1]}${names.length ? " · " + names.join(" ") : ""}`;
  };
  const GRID = [[12, 1, 2, 3], [11, 0, 0, 4], [10, 0, 0, 5], [9, 8, 7, 6]];
  push("**Rashi chart (D1)** — fixed-sign grid, Aries at the top second cell, reading clockwise:",
    "",
    "| | | | |",
    "|---|---|---|---|",
    ...GRID.map(row => `| ${row.map(s => s === 0 ? "·" : cellOf(s)).join(" | ")} |`),
    "",
    `*Your ascendant falls in ${SIGNS[c.lagna - 1]}, so count houses clockwise from the cell marked **Asc**. (Su Sun, Mo Moon, Ma Mars, Me Mercury, Ju Jupiter, Ve Venus, Sa Saturn, Ra Rahu, Ke Ketu.)*`);

  /* --- 4 houses ------------------------------------------------- */
  push("## 4. Lagna and the Twelve Houses",
    "",
    `Your ascendant is **${SIGNS[c.lagna - 1]} ${dm(c.ascLon)}**, so ${SIGNS[c.lagna - 1]} is your 1st house and each following sign takes the next house (the whole-sign system).`,
    "",
    "| House | Field (traditional) | Sign | Lord | Lord sits in | Occupants |",
    "|---|---|---|---|---|---|",
    ...c.houses.map(h => {
      const lordHouse = houseFrom(c.lagna, signOf(c.pos[h.lord]));
      return `| ${h.n} | ${HOUSE_SENSE[h.n]} | ${SIGNS[h.sign - 1]} | ${h.lord} | ${ord(lordHouse)} house | ${h.occupants.join(", ") || "—"} |`;
    }));

  /* --- the Bhav Chalit frame (validated Placidus cusps) ---------- */
  if (c.cusps && c.chalit) {
    const moved = GRAHAS.filter(g =>
      c.chalit[g] !== houseFrom(c.lagna, signOf(c.pos[g])));
    push("Alongside the whole-sign houses above, some traditions overlay the **Bhav Chalit** frame — twelve unequal cusps cut by the Placidus rule (Astra's cusps reproduce the printed benchmark to 0.02°):",
      "",
      "| Cusp | Begins at | Cusp | Begins at |",
      "|---|---|---|---|",
      ...Array.from({ length: 6 }, (_, i) =>
        `| ${i + 1} | ${SIGNS[signOf(c.cusps[i]) - 1]} ${dm(c.cusps[i])} | ${i + 7} | ${SIGNS[signOf(c.cusps[i + 6]) - 1]} ${dm(c.cusps[i + 6])} |`),
      "",
      moved.length
        ? `In the chalit frame ${moved.map(g => `**${g}** shifts to the ${ord(c.chalit[g])} bhava`).join(", ")} — a graha near a cusp belongs to different houses in the two systems, and both readings are given rather than silently choosing.`
        : "*In your chart the chalit frame moves no graha out of its whole-sign house — the two systems agree end to end.*");
  }

  /* --- house-by-house reading: opener from the vetted lore library,
     then the lord placement and each occupant - every sentence keyed
     to the placement it prints (§61) ----------------------------- */
  for (const h of c.houses) {
    const lordSign = signOf(c.pos[h.lord]);
    const lordHouse = houseFrom(c.lagna, lordSign);
    push(`### House ${h.n} — ${HOUSE_SENSE[h.n]}`,
      "",
      HOUSE_STORY[h.n],
      "",
      `**${SIGNS[h.sign - 1]} rules your ${ord(h.n)} house, and its lord ${h.lord} sits in your ${ord(lordHouse)} house** (${SIGNS[lordSign - 1]} ${dm(c.pos[h.lord])}). ${LORD_IN_HOUSE[h.n][lordHouse]}`);
    for (const g of h.occupants)
      push(`**${g} occupies this house** (${SIGNS[h.sign - 1]} ${dm(c.pos[g])}${c.rx[g] ? ", retrograde" : ""}). ${dash(PLANET_STORY[g].inHouse[h.n])}`);
  }

  /* --- 5 planet-by-planet: opener + placement line + house/sign
     lore + conjunction blends (each pair told once) --------------- */
  push("## 5. Planet-by-Planet Readings",
    "",
    "Each graha read three ways — what it stands for, the sign it wears, and the house it works from. Every sentence keys off the placement shown in bold above it; nothing here is generic to a Sun sign.");
  for (const g of GRAHAS) {
    const s = signOf(c.pos[g]), h = houseFrom(c.lagna, s), dg = dignity(g, s);
    const story = PLANET_STORY[g];
    push(`### ${g} — ${GRAHA_MEANING[g].is}`,
      "",
      dash(story.opener),
      "",
      `**Your ${g}: ${SIGNS[s - 1]} ${dm(c.pos[g])}, ${ord(h)} house${c.rx[g] ? ", retrograde" : ""}${dg ? `, ${dg}` : ""}.**`,
      "",
      `${dash(story.inHouse[h])} ${GRAHA_IN_SIGN[g][SIGNS[s - 1]]}`);
    for (const m of GRAHAS.filter(x => x !== g && signOf(c.pos[x]) === s)) {
      if (GRAHAS.indexOf(m) < GRAHAS.indexOf(g)) continue;   /* each pair once */
      push(`**Together with ${m} in ${SIGNS[s - 1]}.** ${CONJUNCTION_BLEND[conjKey(g, m)]}`);
    }
  }

  /* --- 6 aspects and conjunctions -------------------------------- */
  const conjGroups = [];
  for (let s = 1; s <= 12; s++) {
    const here = GRAHAS.filter(g => signOf(c.pos[g]) === s);
    if (here.length >= 2) conjGroups.push({ sign: s, grahas: here });
  }
  const aspectRows = SEVEN.map(g => {
    const offs = DRISHTI[g] || [7];
    const cells = offs.map(o => {
      const ts = advSign(signOf(c.pos[g]), o);
      const hit = GRAHAS.filter(x => x !== g && signOf(c.pos[x]) === ts);
      return `${ord(o)} → ${SIGNS[ts - 1]} (${ord(houseFrom(c.lagna, ts))} house)${hit.length ? ` — falls on ${hit.join(", ")}` : ""}`;
    });
    return `| ${g} | ${SIGNS[signOf(c.pos[g]) - 1]} | ${cells.join("; ")} |`;
  });
  push("## 6. Aspects and Conjunctions",
    "",
    "Every planet casts its full aspect (drishti) on the 7th sign from its seat; Mars additionally on the 4th and 8th, Jupiter on the 5th and 9th, Saturn on the 3rd and 10th. The table shows where each aspect lands in **your** chart and which planets receive it. (This engine follows the classical Parashari convention in which the nodes cast no aspects of their own; some schools give them Jupiter's set.)",
    "",
    "| Planet | Seat | Aspects cast |",
    "|---|---|---|",
    ...aspectRows,
    "",
    conjGroups.length
      ? ["**Conjunctions** — grahas sharing one sign:", "",
         ...conjGroups.map(cg =>
           `- ${cg.grahas.join(", ")} together in ${SIGNS[cg.sign - 1]} (your ${ord(houseFrom(c.lagna, cg.sign))} house)${
             cg.grahas.length === 2 ? ` — ${sepDeg(c.pos[cg.grahas[0]], c.pos[cg.grahas[1]]).toFixed(1)}° apart` : ""}`)].join("\n")
      : "**Conjunctions** — no two grahas share a sign in this chart.");

  /* --- 6 vargas ------------------------------------------------- */
  const header = `| Point | ${SUPPORTED.map(D => "D" + D).join(" | ")} |`;
  const sep = `|---|${SUPPORTED.map(() => "---").join("|")}|`;
  push("## 7. Divisional Charts (Vargas)",
    "",
    `All ${SUPPORTED.length} divisional charts the engine supports, computed from the same sidereal longitudes. Each column shows the sign a point maps to when its sign is divided into D parts (D1 is the birth chart itself).`,
    "",
    header, sep,
    ...["Asc", ...GRAHAS].map(g =>
      `| ${g} | ${SUPPORTED.map(D => SIGN_AB[c.vargas[D][g] - 1]).join(" | ")} |`),
    "",
    (() => {
      const vg = ["Asc", ...GRAHAS].filter(g => c.vargas[9][g] === c.vargas[1][g]);
      return vg.length
        ? `**Vargottama** — same sign in D1 and D9, traditionally read as a placement standing on its own ground: ${vg.map(g => `${g === "Asc" ? "the Ascendant" : g} (${SIGNS[c.vargas[1][g] - 1]})`).join(", ")}.`
        : "**Vargottama** — no point repeats its birth sign in the navamsa here.";
    })(),
    "",
    `*Reading note: the navamsa (D9) is traditionally read alongside the birth chart for marriage and inner strength; the dashamsa (D10) for career. Your D9 ascendant is ${SIGNS[c.vargas[9].Asc - 1]}; your D10 ascendant is ${SIGNS[c.vargas[10].Asc - 1]}. Two divisional charts some vendors print are deliberately absent: the D5 and true D6 follow no rule we could validate against printed ground truth (the one benchmark "D6" is arithmetically a D60), and Astra does not guess.*`);

  /* --- 7 vimshottari -------------------------------------------- */
  const d = c.dasha;
  push("## 8. Vimshottari Dasha — All Three Levels",
    "",
    `The 120-year Vimshottari cycle is seeded by the Moon's position inside its nakshatra at birth: your Moon sat at ${SIGNS[c.moonSign - 1]} ${dm(c.moonL)}, inside ${NAK_NAMES[moonNak]}, whose lord is **${d.birthLord}** — so life begins in a ${d.birthLord} mahadasha with ${d.balanceYears.toFixed(2)} years of it remaining.`,
    "",
    "### Mahadashas (major periods)",
    "",
    "| Lord | Years | From | To |",
    "|---|---|---|---|",
    ...d.mahadashas.map(m =>
      `| ${m.lord} | ${m.years} | ${fmtDate(m.start)} | ${fmtDate(m.end)} |`),
    "",
    `*The first row starts before birth — classical tables print the birth mahadasha in full; of it, only the ${d.balanceYears.toFixed(2)}-year balance from the birth date was actually lived.*`);

  L.push("### Antardashas (sub-periods) within each mahadasha", "");
  for (const m of d.mahadashas) {
    L.push(`**${m.lord} mahadasha** (${fmtDate(m.start)} → ${fmtDate(m.end)})`, "",
      "| Antardasha | From | To |", "|---|---|---|",
      ...m.antardashas.map(a => `| ${m.lord}–${a.lord} | ${fmtDate(a.start)} | ${fmtDate(a.end)} |`),
      "");
  }

  /* anchor a period lord to its actual natal seat - the difference
     between single-key templating and synthesis (COMPARISON.md §3) */
  const listWords = a => a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a.at(-1);
  const lordAnchor = lord => {
    const s = signOf(c.pos[lord]), h = houseFrom(c.lagna, s), dg = dignity(lord, s);
    const conj = GRAHAS.filter(g => g !== lord && signOf(c.pos[g]) === s);
    const rulesH = [];
    for (let i = 1; i <= 12; i++)
      if (SIGN_LORD[(c.lagna - 1 + i - 1) % 12] === lord) rulesH.push(i);
    const bits = [`your ${lord} sits in ${SIGNS[s - 1]} in the ${ord(h)} house (${HOUSE_SENSE[h]})`];
    if (dg) bits.push(dg);
    if (c.rx[lord] && lord !== "Rahu" && lord !== "Ketu") bits.push("retrograde");
    if (conj.length) bits.push(`sharing the sign with ${listWords(conj)}`);
    const ruleTxt = rulesH.length
      ? `, and it rules your ${listWords(rulesH.map(ord))} house${rulesH.length > 1 ? "s" : ""}`
      : " (as a node it holds no lordships, so its sign dispositor carries them)";
    return { text: bits.join(", ") + ruleTxt, h };
  };

  const ns = c.nowStack;
  if (ns?.maha && ns?.antar && ns?.pratyantar) {
    const mahaA = lordAnchor(ns.maha.lord), antarA = lordAnchor(ns.antar.lord);
    push(`### Where you are now (${fmtDate(NOW)})`,
      "",
      `Running period: **${ns.maha.lord} – ${ns.antar.lord} – ${ns.pratyantar.lord}** (mahadasha – antardasha – pratyantardasha).`,
      "",
      dash(DASHA_THEME[ns.maha.lord]),
      "",
      `**Read through this chart, not in the abstract:** ${mahaA.text}. Within this tradition a mahadasha takes on its lord's seat, so these ${ns.maha.lord} years are read here through that ${ord(mahaA.h)}-house ground.`,
      "",
      `Within it, the ${ns.antar.lord} antardasha (${fmtDate(ns.antar.start)} → ${fmtDate(ns.antar.end)}) traditionally ${dash(ANTAR_FLAVOR[ns.antar.lord])}. In this chart ${antarA.text} — so that colouring is traditionally filtered through the ${ord(antarA.h)} house's matters.`,
      "",
      `Pratyantardashas of the running ${ns.maha.lord}–${ns.antar.lord} antardasha:`,
      "",
      "| Pratyantar | From | To | |",
      "|---|---|---|---|",
      ...ns.antar.pratyantardashas.map(pr =>
        `| ${pr.lord} | ${fmtDate(pr.start)} | ${fmtDate(pr.end)} | ${pr === ns.pratyantar ? "◀ now" : ""} |`));
  }

  /* --- 7 ashtakavarga ------------------------------------------- */
  const savLine = c.sav.map(String);
  const maxSav = Math.max(...c.sav), minSav = Math.min(...c.sav);
  const maxSign = c.sav.indexOf(maxSav) + 1, minSign = c.sav.indexOf(minSav) + 1;
  /* --- 9 the full third level --------------------------------- */
  push("## 9. The Full Clock — Every Pratyantardasha",
    "",
    "The Vimshottari clock's third level, complete: all eighty-one antardashas with their nine pratyantars each — the full table serious practitioners expect, computed rather than padded.",
    "");
  for (const m of c.dasha.mahadashas) {
    push(`### ${m.lord} mahadasha (${fmtDate(m.start)} → ${fmtDate(m.end)})`, "");
    for (const a of (m.antardashas || [])) {
      if (!a.pratyantardashas) continue;
      push(`**${m.lord}–${a.lord}** (${fmtDate(a.start)} → ${fmtDate(a.end)})`,
        "",
        "| Pratyantar | From | To |",
        "|---|---|---|",
        ...a.pratyantardashas.map(pr =>
          `| ${m.lord}–${a.lord}–${pr.lord} | ${fmtDate(pr.start)} | ${fmtDate(pr.end)} |`),
        "");
    }
  }

  /* --- 10 yogini dasha ----------------------------------------- */
  push("## 10. Yogini Dasha — The Second Clock",
    "",
    "A parallel timing tradition: eight yoginis on a 36-year cycle, each ruled by a graha. The sequence is seeded by the birth nakshatra exactly as Vimshottari is — Astra's table reproduces the printed benchmark's dates to the day.",
    "",
    "| Yogini | Ruled by | Years | From | To | |",
    "|---|---|---|---|---|---|",
    ...c.yogini.map(y =>
      `| ${y.name} | ${y.lord} | ${y.years}${y.balance ? " (balance)" : ""} | ${fmtDate(y.start)} | ${fmtDate(y.end)} | ${NOW >= y.start && NOW < y.end ? "**active**" : ""} |`),
    "",
    "*Where the two clocks agree on a season's tone, tradition weighs it doubly; where they differ, Vimshottari leads.*");

  push("## 11. Ashtakavarga — Transit Strength Map",
    "",
    "Each of the seven grahas grants benefic points (bindus) to the twelve signs, judged from eight vantage points (the seven grahas and the lagna). A sign's total (Sarvashtakavarga) is traditionally read as how well transits through that sign tend to support you — more bindus, smoother passage.",
    "",
    `| | ${SIGN_AB.join(" | ")} |`,
    `|---|${SIGN_AB.map(() => "---").join("|")}|`,
    ...AV_GRAHAS.map(g => `| ${g} | ${c.bav[g].join(" | ")} |`),
    `| Lagna | ${c.bav.Lagna.join(" | ")} |`,
    `| **SAV** | ${savLine.map(v => `**${v}**`).join(" | ")} |`,
    "",
    "*The Lagna row is the ascendant's own bhinnashtakavarga (49 bindus across the twelve signs); by the classical rule it is shown but never added into the SAV totals, which sum the seven graha rows only — 337 for every chart ever cast.*",
    "",
    `The strongest sign is **${SIGNS[maxSign - 1]}** (${maxSav} bindus, your ${ord(houseFrom(c.lagna, maxSign))} house) and the lightest is **${SIGNS[minSign - 1]}** (${minSav} bindus, your ${ord(houseFrom(c.lagna, minSign))} house). A light sign is traditionally read as a place to pace yourself during transits, not as a misfortune.`);

  /* --- 9 current transits (gochara) ------------------------------- */
  const favWord = g => g.favourable ? "favourable seat" : "neutral-to-testing seat";
  const gRows = c.gochara.map(g =>
    `| ${g.graha} | ${SIGNS[g.sign - 1]} ${dm(g.lon)} | ${ord(g.fromMoon)} | ${ord(g.fromLagna)} | ${favWord(g)} | ${g.sav} | ${g.until ? "~" + fmtDate(g.until) : "—"} |`);
  const moonNow = c.gochara.find(g => g.graha === "Moon");
  /* --- 10 shadbala + bhava bala --------------------------------- */
  if (c.sb) {
    const gs = SHADBALA_GRAHAS.map(g => ({ g, ...c.sb.grahas[g] }))
      .sort((a, b) => b.rupas - a.rupas);
    push("## 12. Shadbala — Six-Fold Strength",
      "",
      "The classical strength computation (Brihat Parashara Hora Shastra): six sources of strength per graha — positional (sthana), temporal (kaala), directional (dig), motional (cheshta), natural (naisargika) and aspectual (drik) — summed in virupas, 60 virupas to a rupa. Ranked strongest first:",
      "",
      "| Rank | Graha | Sthana | Kaala | Dig | Cheshta | Naisargika | Drik | Total | Rupas |",
      "|---|---|---|---|---|---|---|---|---|---|",
      ...gs.map((r, i) =>
        `| ${i + 1} | ${r.g} | ${r.sthana.toFixed(1)} | ${r.kaala.toFixed(1)} | ${r.dig.toFixed(1)} | ${r.cheshta.toFixed(1)} | ${r.naisargika.toFixed(1)} | ${r.drik.toFixed(1)} | ${r.total.toFixed(1)} | **${r.rupas.toFixed(2)}** |`),
      "",
      `**${gs[0].g} is your strongest graha** (${gs[0].rupas.toFixed(2)} rupas) and ${gs.at(-1).g} the least fortified (${gs.at(-1).rupas.toFixed(2)}). Strength here is traditionally read as a graha's capacity to deliver what it signifies — not as goodness or badness. Required-strength thresholds are printed by some vendors but differ between schools; Astra omits them until a rule reproduces printed ground truth.`);
    if (Array.isArray(c.bb) && c.bb.length === 12) {
      const hb = c.bb.map((r, i) => ({ h: i + 1, ...r })).sort((a, b) => b.rupas - a.rupas);
      push("",
        "**Bhava Bala** — the same discipline applied to the twelve houses, ranked:",
        "",
        "| Rank | House | Field | Total | Rupas |",
        "|---|---|---|---|---|",
        ...hb.map((r, i) =>
          `| ${i + 1} | ${ord(r.h)} | ${HOUSE_SENSE[r.h]} | ${r.total.toFixed(1)} | **${r.rupas.toFixed(2)}** |`));
    }
  }

  push(`## 13. Current Transits (Gochara) — as of ${fmtDate(NOW)}`,
    "",
    `Where every graha stands **today**, read against your natal Moon (${SIGNS[c.moonSign - 1]}) and lagna (${SIGNS[c.lagna - 1]}). The favourable/testing call uses the classical gochara table — each graha has a fixed set of houses from the natal Moon in which its transit is traditionally read as supportive (Sun 3/6/10/11, Moon 1/3/6/7/10/11, Mars 3/6/11, Mercury 2/4/6/8/10/11, Jupiter 2/5/7/9/11, Venus 1/2/3/4/5/8/9/11/12, Saturn 3/6/11, Rahu 3/6/10/11, Ketu 3/6/11). The bindu column joins this to §11: your own ashtakavarga score for the sign being transited.`,
    "",
    "| Graha | Transiting | From Moon | From lagna | Classical read | Bindus (§11) | In this sign until |",
    "|---|---|---|---|---|---|---|",
    ...gRows,
    "",
    `*The Moon crosses a sign in about two and a quarter days and the Sun in a month, so their rows date quickly; Jupiter, Saturn and the nodes set the season. ${moonNow && moonNow.fromMoon === 8 ? "Today the transiting Moon stands 8th from your natal Moon — chandrashtama, a named low-energy day in the tradition: a pacing note, not a warning." : "Sign-change dates are approximate near a station, when a planet crawls across the boundary."}*`,
    "",
    "*This snapshot is the report-form of what the app computes live; the classical read describes the transit seat, and never overrides the running dasha context in §8.*");

  /* --- 8 yogas --------------------------------------------------- */
  push("## 14. Yogas — With the Working Shown",
    "",
    `${c.yogas.length} classical combinations are present in this chart. Each one below states the rule as it applies to your actual placements — a yoga is never just a name here.`,
    "");
  for (const y of c.yogas) {
    L.push(`### ${y.name} · ${y.sanskrit} — ${y.strength}`, "", y.because, "");
  }

  /* --- 9 sade sati ------------------------------------------------ */
  push("## 15. Sade Sati — Saturn's Pass Over Your Moon",
    "",
    `Sade sati is the roughly seven-and-a-half-year stretch when transiting Saturn crosses the 12th, 1st and 2nd signs counted from your natal Moon (${SIGNS[c.moonSign - 1]}). The tradition reads it as a season of consolidation and pruning — slow, structural, and finite — not as a verdict. The windows below are computed directly from the ephemeris; each window's internal phases show Saturn's actual sign entries, including retrograde re-entries.`,
    "");
  for (const w of c.sati) {
    L.push(`**${fmtDate(w.start)} → ${fmtDate(w.end)}** (${w.years.toFixed(1)} years)${w.active ? " — **running now**" : ""}${w.atBirth ? " — already running when you were born" : ""}`, "",
      ...w.phases.map(ph =>
        `- ${ph.phase}: Saturn in ${ph.sign}, ${fmtDate(ph.start)} → ${fmtDate(ph.end)}`),
      "");
  }
  const satNow = houseFrom(c.moonSign, signOf(positions(NOW).Saturn));
  L.push(`As of ${fmtDate(NOW)}, transiting Saturn stands in the ${ord(satNow)} sign from your Moon — ${[12,1,2].includes(satNow) ? "inside" : "outside"} the sade sati band.`, "");

  /* --- 12 doshas --------------------------------------------------- */
  const mg = c.mangal;
  const second = mg.fromLagna.house === 2 || mg.fromMoon.house === 2;
  push("## 16. Doshas — Verdicts With the Rule Shown",
    "",
    "Four classical afflictions, each checked against this chart with the rule written out. An absent dosha gets its reasoning too — a verdict you cannot audit is not a verdict.",
    "",
    "### Manglik",
    "",
    `Mars sits in ${SIGNS[c.marsSign - 1]}: the ${ord(mg.fromLagna.house)} house from your lagna and the ${ord(mg.fromMoon.house)} from your Moon. The widely used rule counts houses 1, 4, 7, 8 and 12 from the lagna.`,
    "",
    `- **From the lagna:** house ${mg.fromLagna.house} → ${mg.fromLagna.manglik ? "within the classical set — the chart carries the Mangal placement" : "not in the classical set — no Mangal placement"}.`,
    `- **From the Moon:** house ${mg.fromMoon.house} → ${mg.fromMoon.manglik ? "within the classical set under the Moon-counted reading" : "not in the classical set under the Moon-counted reading"}.`,
    `- **The 2nd-house school:** some traditions, notably in the south, add the 2nd house to the set. Mars stands in your ${ord(mg.fromLagna.house)} from the lagna and ${ord(mg.fromMoon.house)} from the Moon, so under that wider reading the verdict here ${second ? "**changes** — that school would count this placement" : "is unchanged"}.`,
    "",
    "*Traditions differ on how much weight this carries and on many cancelling factors; the placement is a data point for matching, never a sentence.*");
  for (const dosha of c.doshas) {
    L.push(`### ${dosha.name} · ${dosha.sanskrit} — ${dosha.present ? "present" : "not present"}`,
      "", dosha.because, "");
  }
  L.push("*None of these placements is a sentence. Within Vedic astrology a dosha names a pattern to be aware of; traditions attach many cancelling factors, and this report's job is to show you exactly what is — and is not — in the chart.*", "");

  /* --- 13 chara karakas ------------------------------------------- */
  const k = c.karakas;
  const dk8 = k.eight.find(x => x.karaka === "Darakaraka");
  const same = k.eight.filter(x => x.karaka !== "Pitrikaraka")
    .every(x => k.seven.find(y => y.karaka === x.karaka)?.graha === x.graha);
  push("## 17. Chara Karakas — The Movable Significators",
    "",
    "Jaimini's movable significators rank the grahas by how far each has travelled through its sign — the furthest-travelled becomes the Atmakaraka, the soul's own significator, down to the Darakaraka, the significator of the partner. Shown under the eight-karaka scheme (seven grahas plus Rahu, whose arc counts from the end of its sign); the seven-karaka variant follows.",
    "",
    "| Karaka | Graha | Arc in sign |",
    "|---|---|---|",
    ...k.eight.map(x => `| ${x.karaka} | ${x.graha} | ${x.arc.toFixed(2)}° |`),
    "",
    same
      ? `Under the seven-karaka scheme (no Rahu, no Pitrikaraka) every assignment is unchanged; the Darakaraka is **${dk8.graha}** in both readings.`
      : `Under the seven-karaka scheme (no Rahu, no Pitrikaraka) the ranking shifts: ${k.seven.map(x => `${x.karaka} ${x.graha}`).join(", ")}. Schools differ here, so Astra shows both.`,
    ...(() => {                       /* honesty check: rankings decided by tiny arcs */
      const close = [];
      for (let i = 0; i + 1 < k.eight.length; i++) {
        const gap = k.eight[i].arc - k.eight[i + 1].arc;
        if (gap < 0.25) close.push({ a: k.eight[i], b: k.eight[i + 1], gap });
      }
      return close.length ? ["",
        `*A precision note: ${close.map(x =>
          `**${x.a.graha}** and **${x.b.graha}** are separated by only ${Math.round(x.gap * 60)}' of arc, which decides ${x.a.karaka} versus ${x.b.karaka}`).join("; ")}. ` +
        `That margin sits inside the ephemeris's stated error budget for slow planets, and platforms using a different ephemeris may print the pair swapped — treat those assignments as provisional until the positions are pinned to the arc-second.*`] : [];
    })());

  push("---",
    "*Astra is a compass, not an oracle. These pages describe traditional associations so you can explore and reflect — the decisions remain yours.*");
  return L.join("\n");
}

/* ------------------------------------------------ render: love ---- */

function renderLove(a, b) {
  const L = [];
  const push = (...x) => L.push(...x, "");

  push(`# ${a.name} & ${b.name} — Compatibility`,
    "",
    `**${a.name}:** ${a.birthLocal}, ${a.place}`,
    `**${b.name}:** ${b.birthLocal}, ${b.place}`,
    `**Generated by Astra** on ${fmtDate(NOW)} · Lahiri ayanamsa · whole-sign houses · true lunar node`,
    "",
    VOICE_NOTE);

  /* --- 1 side by side ------------------------------------------- */
  push("## 1. Two Charts, Side by Side",
    "",
    `| Point | ${a.name} | ${b.name} |`,
    "|---|---|---|",
    ...["Asc", ...GRAHAS].map(g => {
      const cell = c => {
        const Lg = c.points[g];
        return `${SIGNS[signOf(Lg) - 1]} ${dm(Lg)} · ${NAK_NAMES[nakOf(Lg)]}`;
      };
      return `| ${g === "Asc" ? "Ascendant" : g} | ${cell(a)} | ${cell(b)} |`;
    }),
    "",
    `${a.name}'s Moon is in ${SIGNS[a.moonSign - 1]} (${NAK_NAMES[nakOf(a.moonL)]}); ${b.name}'s is in ${SIGNS[b.moonSign - 1]} (${NAK_NAMES[nakOf(b.moonL)]}). The whole matching system below is built on those two Moons.`);

  /* --- 2 ashtakoota ---------------------------------------------- */
  const m = ashtakoota({ moonL: a.moonL }, { moonL: b.moonL });
  push("## 2. Ashtakoota — The Eight-Fold Score",
    "",
    "The classical gun milan compares the two Moons across eight kootas worth 36 points in total. Every score below shows what was compared and why it scored as it did:",
    "",
    "| Koota | What it weighs | Score | Out of |",
    "|---|---|---|---|",
    ...m.kootas.map(k => `| ${k.name} | ${k.why} | ${k.got} | ${k.max} |`),
    `| **Total** | | **${m.total}** | **36** |`,
    "",
    `**${m.total}/36 — ${m.verdict}.**`,
    "",
    "How every score was actually derived — the mechanic, not a pointer at an unshown table:",
    "",
    ...m.kootas.map(k =>
      `- **${k.name} ${String(k.got)}/${k.max}** — ${k.detail}`),
    "",
    "The tradition itself reads these as weights inside a 36-point total, never as omens on their own — which is why the total, not any single koota, carries the verdict.",
    "",
    "*Computed in the classical direction (first chart → second); the tables are the standard Parashari ones, and the koota arithmetic was validated against an independently printed professional match of these same Moon positions.*");

  /* --- 3 manglik both --------------------------------------------- */
  const mgLine = (c) => {
    const f = c.mangal.fromLagna, mm = c.mangal.fromMoon;
    return `- **${c.name}:** Mars in ${SIGNS[c.marsSign - 1]} — ${ord(f.house)} from the lagna (${f.manglik ? "in" : "not in"} the 1/4/7/8/12 set), ${ord(mm.house)} from the Moon (${mm.manglik ? "in" : "not in"} the set).`;
  };
  const aM = a.mangal.fromLagna.manglik, bM = b.mangal.fromLagna.manglik;
  const anySecond = [a, b].some(c => c.mangal.fromLagna.house === 2 || c.mangal.fromMoon.house === 2);
  push("## 3. Manglik — Both Charts",
    "",
    mgLine(a), mgLine(b),
    "",
    aM === bM
      ? `Counted from the lagna, ${aM ? "both charts carry the placement — and the widely used pairing rule reads two matching statuses as balancing each other" : "neither chart carries the placement, so the question does not arise for this pair"}.`
      : "Counted from the lagna, the two charts differ on this point. Traditions list many balancing factors before weighing it, and this system treats it as one datum inside the whole comparison, never a verdict on its own.",
    "",
    `*A southern school adds the 2nd house to the set; ${anySecond ? "that wider reading **does** change one of the verdicts above" : "neither chart has Mars in the 2nd from lagna or Moon, so that wider reading changes nothing here"}.*`);

  /* --- 4 venus & darakaraka ---------------------------------------- */
  const vd = (c, other) => {
    const vL = c.pos.Venus, vs = signOf(vL);
    const vh = houseFrom(c.lagna, vs), vd8 = c.karakas.eight.find(x => x.karaka === "Darakaraka");
    const dg = dignity("Venus", vs);
    const dkSign = signOf(c.pos[vd8.graha] ?? 0);
    const seventhSign = ((c.lagna - 1 + 6) % 12) + 1;
    const seventhLord = SIGN_LORD[seventhSign - 1];
    const inOther = houseFrom(other.lagna, vs);
    return [
      `### ${c.name}`,
      "",
      `- **Venus** stands at ${SIGNS[vs - 1]} ${dm(vL)} (${NAK_NAMES[nakOf(vL)]}), the ${ord(vh)} house${dg ? `, ${dg}` : ""} — traditionally the significator of partnership and what one is drawn toward. Projected onto ${other.name}'s chart, that same sign is ${other.name}'s ${ord(inOther)} house.`,
      `- **7th house** (partnership): ${SIGNS[seventhSign - 1]}, ruled by ${seventhLord}, which sits in the ${ord(houseFrom(c.lagna, signOf(c.pos[seventhLord])))} house.`,
      `- **Darakaraka** (eight-karaka scheme): **${vd8.graha}** at ${vd8.arc.toFixed(2)}° through ${SIGNS[dkSign - 1]} — the least-travelled graha, which Jaimini assigns to the partner. Its condition is read as how partnership presents itself to this chart.`,
      "",
    ];
  };
  push("## 4. Venus and the Darakaraka",
    "",
    "Two independent lenses on partnership — Venus by placement, and Jaimini's Darakaraka by degree ranking:",
    "",
    ...vd(a, b), ...vd(b, a));

  /* --- 5 dasha overlap --------------------------------------------- */
  const antarSegs = c => c.dasha.mahadashas.flatMap(mm =>
    mm.antardashas.map(x => ({ start: x.start.getTime(), end: x.end.getTime(),
      label: `${mm.lord}–${x.lord}` })));
  const from = Date.UTC(NOW.getUTCFullYear(), 0, 1);
  const to = Date.UTC(NOW.getUTCFullYear() + 15, 0, 1);
  const cuts = [...new Set([from, to,
    ...antarSegs(a).flatMap(s => [s.start, s.end]),
    ...antarSegs(b).flatMap(s => [s.start, s.end])]
    .filter(t => t >= from && t <= to))].sort((x, y) => x - y);
  const at = (c, t) => antarSegs(c).find(s => t >= s.start && t < s.end)?.label ?? "—";
  const overlapRows = [];
  for (let i = 0; i + 1 < cuts.length; i++) {
    const mid = (cuts[i] + cuts[i + 1]) / 2;
    overlapRows.push(`| ${fmtDate(new Date(cuts[i]))} → ${fmtDate(new Date(cuts[i + 1]))} | ${at(a, mid)} | ${at(b, mid)} |`);
  }
  const nsA = a.nowStack, nsB = b.nowStack;
  push("## 5. Dasha Overlap — Your Two Timelines Together",
    "",
    `Each of you moves through your own Vimshottari periods; this table lays the two timelines side by side at antardasha resolution from January ${NOW.getUTCFullYear()} to January ${NOW.getUTCFullYear() + 15}. A row is a stretch in which neither of you changes sub-period.`,
    "",
    `Right now: ${a.name} runs **${nsA.maha.lord}–${nsA.antar.lord}** and ${b.name} runs **${nsB.maha.lord}–${nsB.antar.lord}**.`,
    "",
    `| Period | ${a.name} (maha–antar) | ${b.name} (maha–antar) |`,
    "|---|---|---|",
    ...overlapRows,
    "",
    "*Reading note: the tradition reads shared Venus, Moon or Jupiter sub-periods as seasons that favour partnership themes for that person; where one of you runs a Saturn stretch, the same tradition counsels patience with that person's pace. Neither timeline overrides a choice either of you makes.*");

  /* --- 6 jupiter partnership windows -------------------------------- */
  const targetsOf = c => {
    const t = [];
    const add = (sign, label) => {
      const hit = t.find(x => x.sign === sign);
      if (hit) hit.label += ` = ${label}`; else t.push({ sign, label });
    };
    add(((c.lagna - 1 + 6) % 12) + 1, "7th from lagna");
    add(((c.moonSign - 1 + 6) % 12) + 1, "7th from Moon");
    add(signOf(c.pos.Venus), "natal Venus");
    add(signOf(c.pos[c.karakas.eight.find(x => x.karaka === "Darakaraka").graha]), "Darakaraka's sign");
    return t;
  };
  const tA = targetsOf(a), tB = targetsOf(b);
  const touches = (jSign, targetSign) =>
    [1, 5, 7, 9].some(o => advSign(jSign, o) === targetSign);
  const windows = jupiterSignSegments(new Date(Date.UTC(NOW.getUTCFullYear(), 0, 1)),
    new Date(Date.UTC(NOW.getUTCFullYear() + 12, 0, 1)));
  const gradeWord = n => n >= 3 ? "strong" : n === 2 ? "good" : n === 1 ? "fair" : "quiet";
  const scoreCell = (targets, jSign) => {
    const hits = targets.filter(t => touches(jSign, t.sign));
    return { n: hits.length, txt: hits.length ? `${gradeWord(hits.length)} (${hits.map(h => h.label).join("; ")})` : "quiet" };
  };
  const windowRows = windows.map(w => {
    const sa = scoreCell(tA, w.sign), sb = scoreCell(tB, w.sign);
    return { w, sa, sb,
      row: `| ${fmtDate(w.start)} → ${fmtDate(w.end)} | ${SIGNS[w.sign - 1]} | ${sa.txt} | ${sb.txt} |` };
  });
  const shared = windowRows.filter(r => r.sa.n >= 2 && r.sb.n >= 2);
  push("## 6. Partnership Timing Windows — Jupiter's Transit, With the Mechanic Shown",
    "",
    `The almanac technique for timing partnership matters follows transiting Jupiter: a window is traditionally read as supportive when Jupiter occupies or aspects (its 5th, 7th and 9th aspects, plus conjunction) the signs that carry each chart's partnership significations. The targets this engine uses, disclosed in full — for ${a.name}: ${tA.map(t => `${SIGNS[t.sign - 1]} (${t.label})`).join(", ")}; for ${b.name}: ${tB.map(t => `${SIGNS[t.sign - 1]} (${t.label})`).join(", ")}. More targets touched at once, stronger the window. Rows follow Jupiter's actual sign entries from the ephemeris, so retrograde re-entries appear as their own shorter windows.`,
    "",
    `| Window | Jupiter in | ${a.name} | ${b.name} |`,
    "|---|---|---|---|",
    ...windowRows.map(r => r.row),
    "",
    shared.length
      ? `**Windows the tradition reads as supportive for both charts at once:** ${shared.map(r => `${fmtDate(r.w.start)} → ${fmtDate(r.w.end)} (Jupiter in ${SIGNS[r.w.sign - 1]})`).join("; ")}.`
      : "**No window in this span scores good-or-better for both charts at once** — the tradition would simply counsel patience with the calendar, nothing more.",
    "",
    "*These are traditionally supportive seasons for partnership decisions — an almanac lens, not a prediction that anything will or must happen, and no season is required before a choice the two of you make. Read them alongside the dasha overlap in §5: the same tradition weighs the running periods at least as heavily as any transit.*");

  push("---",
    "*A match score is a structured comparison inside one traditional system — it measures pattern, not destiny. Astra shows the working so the two of you can explore it together.*");
  return L.join("\n");
}

/* ------------------------------------------------ api ------------- */

export { computeChart, renderKundali, renderLove };
