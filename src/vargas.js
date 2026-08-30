/* ===================================================================
   VARGAS - divisional chart positions (D2..D60).
   -------------------------------------------------------------------
   A varga divides each 30-degree sign into D equal parts (Trimsamsa
   excepted - its parts are unequal) and maps every part to a sign.
   Everything here is arithmetic on the sidereal longitudes the
   ephemeris produced; nothing is interpreted.

   Rules are classical Parashari, validated cell-for-cell against a
   professional vendor's 19-varga table for the 26 Mar 1992 reference
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
  const p = Math.min(D - 1, Math.floor(deg * D / 30));
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
