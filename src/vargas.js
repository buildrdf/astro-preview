/* ===================================================================
   VARGAS - divisional chart positions (D2..D60).
   -------------------------------------------------------------------
   A varga divides each 30-degree sign into D equal parts (Trimsamsa
   excepted - its parts are unequal) and maps every part to a sign.
   Everything here is arithmetic on the sidereal longitudes the
   ephemeris produced; nothing is interpreted.

   Rules are classical Parashari, validated cell-for-cell against a
   professional vendor's 19-varga table for the private reference
   chart (all 10 chart points per varga):

     PASS with the textbook rule:
       D2 hora (odd: Sun then Moon; even: Moon then Sun)
       D3 dreshkana (1st/5th/9th from the sign)
       D4 chaturthamsa (kendras from the sign)
       D7 saptamsa (odd from the sign, even from its 7th)
       D9 navamsa (cyclic: sign*9 + part)
       D10 dashamsa (odd from the sign, even from its 9th)
       D12 dwadashamsa (from the sign itself)
       D16 shodashamsa (movable Aries / fixed Leo / dual Sagittarius)
       D20 vimsamsa (movable Aries / fixed Sagittarius / dual Leo)
       D24 siddhamsa (odd from Leo, even from Cancer)
       D27 bhamsa (fire Aries / earth Cancer / air Libra / water Capricorn)
       D30 trimsamsa (unequal Parashari parts, even signs reversed)
       D40 khavedamsa (odd from Aries, even from Libra)
       D45 akshavedamsa (movable Aries / fixed Leo / dual Sagittarius)

     Non-Parashari extras, rule variant fixed by the reference table:
       D8 ashtamsa - navamsa-style trikona starts (movable from the
          sign, fixed from its 9th, dual from its 5th): sign*9 + part.
       D11 rudramsa - counted from a start set by the sign's quality:
          movable Aries, fixed Capricorn, dual Cancer.
       D60 shashtiamsa - odd signs from the sign itself, even from its
          7th. (BPHS counts every sign from itself; the vendor variant
          is what the reference table prints, for even signs too.)

     NOT implemented:
       D5 panchamsa - the vendor's D5 row follows no continuous
          counting scheme and no published fixed-list rule we know
          (same sign + same part can be reproduced only with a
          per-part target table, which would be overfitting ten
          cells). Genuine methodology ambiguity; revisit with a
          second oracle.
       D6 shashthamsa - the vendor row labelled "D6" is arithmetically
          a D60 (its outputs need a part boundary at 12.5 degrees,
          impossible with 5-degree parts), so no oracle exists for a
          true D6 and we do not guess.
   =================================================================== */

const norm = d => ((d % 360) + 360) % 360;

/* Trimsamsa: cumulative degree boundaries and target signs (0-based).
   Odd signs: Mars 5 / Saturn 5 / Jupiter 8 / Mercury 7 / Venus 5.
   Even signs: the same spans in reverse order, opposite lords' signs. */
const D30_ODD  = [[5, 0], [10, 10], [18, 8], [25, 2], [30, 6]];  /* Ari Aqu Sag Gem Lib */
const D30_EVEN = [[5, 1], [12, 5], [20, 11], [25, 9], [30, 7]];  /* Tau Vir Pis Cap Sco */

/* quality of a 0-based sign: 0 movable, 1 fixed, 2 dual */
const quality = s => s % 3;

/* Each rule takes (sign0 0..11, part 0..D-1, odd) and returns 0..11. */
const RULES = {
  1:  (s)       => s,
  2:  (s, p, odd) => (odd ? p === 0 : p !== 0) ? 4 : 3,   /* Leo : Cancer */
  3:  (s, p)    => (s + 4 * p) % 12,
  4:  (s, p)    => (s + 3 * p) % 12,
  7:  (s, p, odd) => (s + p + (odd ? 0 : 6)) % 12,
  8:  (s, p)    => (s * 9 + p) % 12,
  9:  (s, p)    => (s * 9 + p) % 12,
  10: (s, p, odd) => (s + p + (odd ? 0 : 8)) % 12,
  11: (s, p)    => ([0, 9, 3][quality(s)] + p) % 12,      /* Ari / Cap / Can */
  12: (s, p)    => (s + p) % 12,
  16: (s, p)    => ([0, 4, 8][quality(s)] + p) % 12,      /* Ari / Leo / Sag */
  20: (s, p)    => ([0, 8, 4][quality(s)] + p) % 12,      /* Ari / Sag / Leo */
  24: (s, p, odd) => ((odd ? 4 : 3) + p) % 12,            /* Leo / Can */
  27: (s, p)    => (s * 3 + p) % 12,                      /* element trines */
  40: (s, p, odd) => ((odd ? 0 : 6) + p) % 12,            /* Ari / Lib */
  45: (s, p)    => ([0, 4, 8][quality(s)] + p) % 12,      /* Ari / Leo / Sag */
  60: (s, p, odd) => (s + p + (odd ? 0 : 6)) % 12
};

export const SUPPORTED = [1, 2, 3, 4, 7, 8, 9, 10, 11, 12, 16, 20, 24, 27, 30, 40, 45, 60];

/* Methodology metadata (spec parts 10-12, 50). Sixteen principal
   Shodashavarga are "major"; D8/D11 are non-Parashari extras that the
   reference table happened to print and we matched - labelled as such,
   never as classical. D5/D6 stay absent: no validated rule. `uses` is
   ONE reasonable most-used ordering (D1, D9, D10, D2, D7, D12, then
   the rest) - not a universal ranking. */
export const VARGA_META = [
  {D:1,  name:"Rashi",          tier:"major", uses:1,  focus:"Your primary natal chart. All divisional interpretation begins here",
     rule:"The sign itself, 30° whole."},
  {D:2,  name:"Hora",           tier:"major", uses:4,  focus:"wealth and what you hold",
     rule:"Two 15° halves. Odd signs: first half Leo (Sun), second Cancer (Moon); even signs the reverse."},
  {D:3,  name:"Drekkana",       tier:"major", uses:7,  focus:"siblings, courage and effort",
     rule:"Three 10° parts, counted from the sign, its 5th and its 9th."},
  {D:4,  name:"Chaturthamsha",  tier:"major", uses:9,  focus:"property, fortune and residence",
     rule:"Four 7°30′ parts, counted from the sign, its 4th, 7th and 10th."},
  {D:7,  name:"Saptamsha",      tier:"major", uses:5,  focus:"children and what you create",
     rule:"Seven parts of 4°17′09″ (30° ÷ 7). Odd signs count from the sign itself; even signs from its 7th."},
  {D:9,  name:"Navamsha",       tier:"major", uses:2,  focus:"marriage, dharma and each graha’s inner strength",
     rule:"Nine parts of 3°20′. Fire signs count from Aries, earth from Capricorn, air from Libra, water from Cancer."},
  {D:10, name:"Dashamsha",      tier:"major", uses:3,  focus:"career, profession and public activity",
     rule:"Ten 3° parts. Odd signs count from the sign itself; even signs from its 9th."},
  {D:12, name:"Dwadashamsha",   tier:"major", uses:6,  focus:"parents and lineage",
     rule:"Twelve 2°30′ parts, counted from the sign itself."},
  {D:16, name:"Shodashamsha",   tier:"major", uses:10, focus:"vehicles, comforts and happiness",
     rule:"Sixteen parts of 1°52′30″. Movable signs count from Aries, fixed from Leo, dual from Sagittarius."},
  {D:20, name:"Vimshamsha",     tier:"major", uses:11, focus:"spiritual practice",
     rule:"Twenty 1°30′ parts. Movable from Aries, fixed from Sagittarius, dual from Leo."},
  {D:24, name:"Chaturvimshamsha", alias:"Siddhamsha", tier:"major", uses:12, focus:"education and learning",
     rule:"Twenty-four 1°15′ parts. Odd signs count from Leo, even from Cancer."},
  {D:27, name:"Saptavimshamsha", alias:"Bhamsha", tier:"major", uses:13, focus:"strengths and vulnerabilities",
     rule:"Twenty-seven parts of 1°06′40″. Fire signs count from Aries, earth from Cancer, air from Libra, water from Capricorn."},
  {D:30, name:"Trimshamsha",    tier:"major", uses:8,  focus:"adversity and how it is met",
     rule:"Five unequal parts. Odd signs: Mars 5°, Saturn 5°, Jupiter 8°, Mercury 7°, Venus 5° → Aries, Aquarius, Sagittarius, Gemini, Libra. Even signs reverse the order → Taurus, Virgo, Pisces, Capricorn, Scorpio."},
  {D:40, name:"Khavedamsha",    tier:"major", uses:14, focus:"auspicious and inauspicious effects; maternal lineage in some traditions",
     rule:"Forty 0°45′ parts. Odd signs count from Aries, even from Libra."},
  {D:45, name:"Akshavedamsha",  tier:"major", uses:15, focus:"character and lineage factors",
     rule:"Forty-five parts of 0°40′. Movable from Aries, fixed from Leo, dual from Sagittarius."},
  {D:60, name:"Shashtiamsha",   tier:"major", uses:16, sensitive:true, focus:"past-life karma and the finest-grained assessment of each graha",
     rule:"Sixty 0°30′ parts. Odd signs count from the sign itself, even signs from its 7th.",
     variant:"This is the convention of the professional reference tables Astra was validated against. The BPHS verse counts every sign from itself; the two agree for odd signs and differ for even ones. Astra states which rule produced a result rather than hiding the choice."},
  {D:8,  name:"Ashtamsha",      tier:"extra", uses:17, tradition:"Non-Parashari; used by some modern software traditions",
     focus:"longevity themes in some traditions",
     rule:"Eight 3°45′ parts. Movable signs count from the sign itself, fixed from its 9th, dual from its 5th."},
  {D:11, name:"Rudramsha",      tier:"extra", uses:18, tradition:"Non-Parashari; used by some modern software traditions",
     focus:"turbulence and dissolution themes in some traditions",
     rule:"Eleven parts of 2°43′38″. Movable from Aries, fixed from Capricorn, dual from Cancer."}
];
export const vargaMeta = D => VARGA_META.find(m => m.D === D);

const EPS = 1e-9;

/* The full working for one point: which part of its natal sign the
   longitude falls in, and the sign that part maps to. Feeds the
   "How was this calculated?" layer (spec part 21). */
export function vargaDetail(longitudeSidereal, D) {
  const L = norm(longitudeSidereal);
  const s = Math.floor(L / 30 + EPS);
  const deg = L - s * 30;
  const odd = s % 2 === 0;
  const base = { D, natalSign: s + 1, degInSign: deg, odd };
  if (D === 30) {
    const tbl = odd ? D30_ODD : D30_EVEN;
    let prev = 0;
    for (let i = 0; i < tbl.length; i++) {
      if (deg < tbl[i][0]) return { ...base, sign: tbl[i][1] + 1, part: i + 1, parts: 5,
        partStart: prev, partEnd: tbl[i][0], unequal: true };
      prev = tbl[i][0];
    }
    return { ...base, sign: tbl[4][1] + 1, part: 5, parts: 5, partStart: 25, partEnd: 30, unequal: true };
  }
  const rule = RULES[D];
  if (!rule) throw new Error(`varga D${D} not supported (no validated rule)`);
  const span = 30 / D;
  const p = Math.min(D - 1, Math.floor(deg / span + EPS));
  return { ...base, sign: rule(s, p, odd) + 1, part: p + 1, parts: D, span,
    partStart: p * span, partEnd: (p + 1) * span, unequal: false };
}

/* Sign (1..12, Aries=1) a sidereal longitude falls in for divisional
   chart D. Same 1-based convention as signOf in app.js. */
export function vargaSign(longitudeSidereal, D) {
  const L = norm(longitudeSidereal);
  const s = Math.floor(L / 30);          /* 0-based sign */
  const deg = L - s * 30;
  const odd = s % 2 === 0;               /* Aries, Gemini, ... */
  if (D === 30) {
    for (const [upto, sign] of odd ? D30_ODD : D30_EVEN)
      if (deg < upto) return sign + 1;
    return (odd ? D30_ODD : D30_EVEN)[4][1] + 1;
  }
  const rule = RULES[D];
  if (!rule) throw new Error(`varga D${D} not supported (no validated rule)`);
  const p = Math.min(D - 1, Math.floor(deg * D / 30 + EPS));
  return rule(s, p, odd) + 1;
}

/* Per-graha varga signs. `placements` may be the plain object the
   ephemeris returns ({Sun: lon, ...}), an object of {L} records, or
   an array of {graha|name, L}. Returns {name: sign 1..12}. */
export function vargaChart(placements, D) {
  const out = {};
  const put = (name, v) => {
    const L = typeof v === "number" ? v : v && typeof v.L === "number" ? v.L : NaN;
    if (Number.isFinite(L)) out[name] = vargaSign(L, D);
  };
  if (Array.isArray(placements))
    for (const p of placements) put(p.graha ?? p.name, p);
  else
    for (const name in placements) put(name, placements[name]);
  return out;
}
