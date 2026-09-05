/* ===================================================================
   ASHTAKAVARGA - classical Parashari bindu accounting.

   Each of the seven grahas (Sun..Saturn) has a bhinnashtakavarga:
   eight contributors - the seven grahas plus the lagna - each donate
   one bindu into specific houses counted from wherever that
   contributor sits. The per-graha benefic-place tables below are the
   standard Parashari ones; their row sums are fixed constants of the
   system (Sun 48, Moon 49, Mars 39, Mercury 54, Jupiter 56,
   Venus 52, Saturn 39, and 49 for the lagna's own varga).

   Sarvashtakavarga is the sign-by-sign sum of the seven graha vargas
   only - the lagna varga is computed but never added - so the twelve
   totals always sum to 337 for every chart ever cast.

   Input is pure placement data: a sign number 1..12 (1 = Aries) for
   each contributor. Nothing here reads the ephemeris; callers derive
   signs from positions() and ascendant() and hand them in. Output
   arrays are indexed 0..11 for Aries..Pisces, whatever the lagna -
   counting from the lagna is presentation, not calculation.

   Editions of the tradition differ on two sub-tables, and our two
   reference reports sit on opposite sides of both: Moon-from-Jupiter
   (12th vs 2nd as one benefic place) and Venus-from-Mars (5th vs
   4th). The defaults below are the reading the AAP report follows;
   KNOWN_VARIANTS carries the alternates the Astrotalk report
   follows. Either way every row keeps its classical total, so the
   choice never changes the 337. Which reading to surface in the app
   is a product decision to make visibly, not silently.

   Validated cell-by-cell against two independent professional
   reports (see prototype/tools/validate_ashtakavarga.mjs):
   204 bindu cells across both charts, all exact once each report's
   own edition of the two disputed sub-tables is selected.
   =================================================================== */

export const AV_GRAHAS = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"];
export const AV_CONTRIBUTORS = [...AV_GRAHAS, "Lagna"];

/* Benefic places: for TABLES[graha][contributor], the houses counted
   inclusively from the contributor's sign in which the contributor
   drops a bindu into the graha's varga. */
const TABLES = {
  Sun: {
    Sun:[1,2,4,7,8,9,10,11], Moon:[3,6,10,11],
    Mars:[1,2,4,7,8,9,10,11], Mercury:[3,5,6,9,10,11,12],
    Jupiter:[5,6,9,11], Venus:[6,7,12],
    Saturn:[1,2,4,7,8,9,10,11], Lagna:[3,4,6,10,11,12]},
  Moon: {
    Sun:[3,6,7,8,10,11], Moon:[1,3,6,7,10,11],
    Mars:[2,3,5,6,9,10,11], Mercury:[1,3,4,5,7,8,10,11],
    Jupiter:[1,4,7,8,10,11,12], Venus:[3,4,5,7,9,10,11],
    Saturn:[3,5,6,11], Lagna:[3,6,10,11]},
  Mars: {
    Sun:[3,5,6,10,11], Moon:[3,6,11],
    Mars:[1,2,4,7,8,10,11], Mercury:[3,5,6,11],
    Jupiter:[6,10,11,12], Venus:[6,8,11,12],
    Saturn:[1,4,7,8,9,10,11], Lagna:[1,3,6,10,11]},
  Mercury: {
    Sun:[5,6,9,11,12], Moon:[2,4,6,8,10,11],
    Mars:[1,2,4,7,8,9,10,11], Mercury:[1,3,5,6,9,10,11,12],
    Jupiter:[6,8,11,12], Venus:[1,2,3,4,5,8,9,11],
    Saturn:[1,2,4,7,8,9,10,11], Lagna:[1,2,4,6,8,10,11]},
  Jupiter: {
    Sun:[1,2,3,4,7,8,9,10,11], Moon:[2,5,7,9,11],
    Mars:[1,2,4,7,8,10,11], Mercury:[1,2,4,5,6,9,10,11],
    Jupiter:[1,2,3,4,7,8,10,11], Venus:[2,5,6,9,10,11],
    Saturn:[3,5,6,12], Lagna:[1,2,4,5,6,7,9,10,11]},
  Venus: {
    Sun:[8,11,12], Moon:[1,2,3,4,5,8,9,11,12],
    Mars:[3,5,6,9,11,12], Mercury:[3,5,6,9,11],
    Jupiter:[5,8,9,10,11], Venus:[1,2,3,4,5,8,9,10,11],
    Saturn:[3,4,5,8,9,10,11], Lagna:[1,2,3,4,5,8,9,11]},
  Saturn: {
    Sun:[1,2,4,7,8,10,11], Moon:[3,6,11],
    Mars:[3,5,6,10,11,12], Mercury:[6,8,9,10,11,12],
    Jupiter:[5,6,11,12], Venus:[6,11,12],
    Saturn:[3,5,6,11], Lagna:[1,3,4,6,10,11]},
  Lagna: {
    Sun:[3,4,6,10,11,12], Moon:[3,6,10,11,12],
    Mars:[1,3,6,10,11], Mercury:[1,2,4,6,8,10,11],
    Jupiter:[1,2,4,5,6,7,9,10,11], Venus:[1,2,3,4,5,8,9],
    Saturn:[1,3,4,6,10,11], Lagna:[3,6,10,11]}
};

/* The two sub-tables the editions dispute, in their alternate
   reading. Both alternates keep the classical row totals (49, 52).
   Pass as the `variants` argument to bhinnashtakavarga - together,
   singly, or not at all. */
export const KNOWN_VARIANTS = {
  Moon:  { Jupiter:[1,2,4,7,8,10,11] },   /* default: [1,4,7,8,10,11,12] */
  Venus: { Mars:[3,4,6,9,11,12] }         /* default: [3,5,6,9,11,12]    */
};

/* Fixed row sums of the tables above - a structural invariant, kept
   here so a mistyped table fails loudly rather than mis-scoring. */
const ROW_SUM = {Sun:48, Moon:49, Mars:39, Mercury:54, Jupiter:56,
                 Venus:52, Saturn:39, Lagna:49};

/* placements: { Sun:1..12, Moon:1..12, ... Saturn:1..12, Lagna:1..12 }
   (sign numbers, 1 = Aries). Returns one 12-slot bindu array per
   varga, indexed 0..11 = Aries..Pisces, plus the lagna's own varga.
   `variants` optionally overrides disputed sub-tables per
   {graha:{contributor:[houses]}} - see KNOWN_VARIANTS. */
export function bhinnashtakavarga(placements, variants=null){
  for(const c of AV_CONTRIBUTORS){
    const s=placements[c];
    if(!(Number.isInteger(s)&&s>=1&&s<=12))
      throw new Error(`ashtakavarga: bad sign for ${c}: ${s}`);
  }
  const out={};
  for(const graha of [...AV_GRAHAS,"Lagna"]){
    const bindus=new Array(12).fill(0);
    for(const contrib of AV_CONTRIBUTORS){
      const from=placements[contrib]-1;           /* 0..11 */
      const places=variants?.[graha]?.[contrib] ?? TABLES[graha][contrib];
      for(const h of places)
        bindus[(from+h-1)%12]++;                  /* house h counted from `from` */
    }
    const sum=bindus.reduce((a,b)=>a+b,0);
    if(sum!==ROW_SUM[graha])
      throw new Error(`ashtakavarga: ${graha} varga sums ${sum}, expected ${ROW_SUM[graha]}`);
    out[graha]=bindus;
  }
  return out;
}

/* Sign-by-sign totals across the seven graha vargas (lagna excluded,
   per the classical definition). Always sums to 337. Accepts either
   raw placements or a bhinnashtakavarga() result. */
export function sarvashtakavarga(placementsOrBav, variants=null){
  const bav = Array.isArray(placementsOrBav?.Sun)
    ? placementsOrBav : bhinnashtakavarga(placementsOrBav, variants);
  const sav=new Array(12).fill(0);
  for(const g of AV_GRAHAS)
    for(let s=0;s<12;s++) sav[s]+=bav[g][s];
  return sav;
}
