/* ===================================================================
   YOGA TEST FIXTURES (src/yoga-fixtures.js)
   -------------------------------------------------------------------
   Charts chosen so that the seven STRUCTURALLY DIFFERENT yoga types
   Sangram named are all reachable. The point is not coverage of the
   catalogue — it is coverage of the FORMATION SHAPES, because a
   visualization model that only really works for conjunctions is the
   failure mode this whole redesign exists to avoid.

     conjunction        Budha-Aditya      two planets, one sign
     relative-to-Moon   Sunapha           a planet 2nd from the Moon
     relative geometry  Gajakesari        Jupiter in a kendra FROM the Moon
     exchange           Parivartana       two lords swap signs, reciprocal
     lordship web       Raja Yoga         many planets, many houses
     dignity + kendra   Sasa (Mahapurusha) one planet, one condition pair
     cancellation       Neecha Bhanga     a debilitation undone by another body

   OWNER is Sangram's real chart and carries five of the seven. It is
   the primary visual QA case (spec §78). The two synthetic charts
   exist only because his chart happens not to form Gajakesari or any
   Pancha Mahapurusha yoga — they are constructed minimally, and each
   one's comment states the single fact that makes the yoga fire.

   Longitudes are sidereal. sign is 1..12 from Aries.
   =================================================================== */

/** sidereal longitude from a (sign 1..12, degrees-in-sign) pair */
export const lon = (sign, deg) => (sign - 1) * 30 + deg;

const chart = (lagna, P) => ({
  lagna,
  planets: Object.fromEntries(Object.entries(P).map(([g, [s, d]]) => [g, { lon: lon(s, d) }])),
});

/* Sangram's and Natasha's real charts are deliberately NOT here.
   tools/validate_yogas.mjs already computes both from birth data through the
   ephemeris and checks them against two printed vendor reports (181 assertions).
   A transcribed copy of the same chart in this file would be a second source of
   truth that silently drifts from the first — the same trap the Avakhada tables
   were in. Use the validator for the real charts; use this file only for the
   formation shapes no real chart in the project happens to produce. */

/* GAJAKESARI — the ONE fact: Jupiter in Cancer is the 4th sign from the Moon in
   Aries, and 4 is a kendra. Jupiter is also exalted in Cancer, which is what
   makes the engine grade it strong rather than moderate. */
export const GAJAKESARI = chart(1, {
  Sun: [5, 10], Moon: [1, 12], Mars: [8, 5], Mercury: [5, 20],
  Jupiter: [4, 5], Venus: [6, 8], Saturn: [11, 3], Rahu: [3, 7], Ketu: [9, 7],
});

/* SASA (Pancha Mahapurusha) — the ONE fact: Saturn stands in Capricorn, its own
   sign, and with Aries rising Capricorn is the 10th house, a kendra. Own sign in
   a kendra is the complete Mahapurusha rule. */
export const MAHAPURUSHA = chart(1, {
  Sun: [2, 10], Moon: [6, 12], Mars: [9, 5], Mercury: [2, 20],
  Jupiter: [12, 5], Venus: [3, 8], Saturn: [10, 15], Rahu: [5, 7], Ketu: [11, 7],
});

/* What each synthetic fixture must produce, recorded 5 Sep 2026 against src/yogas.js
   so a change that silently alters detection or strength fails loudly.

   The five shapes Sangram's own chart covers — conjunction (Budha-Aditya),
   relative-to-moon (Sunapha), exchange (Parivartana Maha), lordship-web (Raja Yoga)
   and cancellation (Neecha Bhanga) — are asserted in tools/validate_yogas.mjs
   against his real birth data, not here. */
export const EXPECTED = {
  GAJAKESARI: [
    { name: "Gajakesari Yoga", strength: "strong", planets: ["Jupiter", "Moon"], shape: "relative-geometry" },
  ],
  MAHAPURUSHA: [
    { name: "Sasa Yoga", strength: "strong", planets: ["Saturn"], shape: "dignity-kendra" },
  ],
};

/* The seven shapes the renderer must handle without knowing any yoga's name. */
export const SHAPES = ["conjunction", "relative-to-moon", "relative-geometry",
  "exchange", "lordship-web", "dignity-kendra", "cancellation"];
