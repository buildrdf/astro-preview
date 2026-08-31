/* ===================================================================
   YOGINI DASHA - the 36-year, eight-yogini timing cycle.

   Rules (standard, as printed by the benchmark vendor):
     - Eight yoginis in fixed order, with period lengths 1..8 years:
         Mangala 1 (Moon)   Pingala 2 (Sun)    Dhanya 3 (Jupiter)
         Bhramari 4 (Mars)  Bhadrika 5 (Mercury) Ulka 6 (Saturn)
         Siddha 7 (Venus)   Sankata 8 (Rahu)
     - Starting yogini from the birth nakshatra (Ashwini=1):
         index = ((nak + 3) mod 8), 0 meaning Sankata.
     - The first period runs only its remaining balance, in proportion
       to the arc of the nakshatra still ahead of the Moon.

   VALIDATED against the printed Astrotalk table for the reference
   chart: Mula Moon -> Ulka first with a 66-day balance; the return
   Ulka window 31 May 2022 - 30 May 2028 reproduced to the day
   (tools/validate_yogini.mjs).
   =================================================================== */

const YOGINIS = [
  { name: "Mangala",  lord: "Moon",    years: 1 },
  { name: "Pingala",  lord: "Sun",     years: 2 },
  { name: "Dhanya",   lord: "Jupiter", years: 3 },
  { name: "Bhramari", lord: "Mars",    years: 4 },
  { name: "Bhadrika", lord: "Mercury", years: 5 },
  { name: "Ulka",     lord: "Saturn",  years: 6 },
  { name: "Siddha",   lord: "Venus",   years: 7 },
  { name: "Sankata",  lord: "Rahu",    years: 8 },
];
const YEAR_MS = 365.25 * 864e5;
const norm = d => ((d % 360) + 360) % 360;

/* periods covering birth .. birth+span years (default ~100) */
export function yoginiDasha(moonL, birthDate, spanYears = 100) {
  const NAKSPAN = 360 / 27;
  const nak = Math.floor(norm(moonL) / NAKSPAN) + 1;          /* 1..27 */
  const frac = (norm(moonL) % NAKSPAN) / NAKSPAN;             /* traversed */
  let idx = (nak + 3) % 8;                                    /* 0 = Sankata */
  idx = (idx + 7) % 8;                                        /* -> array index */
  const first = YOGINIS[idx];
  const balance = first.years * (1 - frac) * YEAR_MS;

  const out = [];
  let t = birthDate.getTime();
  const end0 = t + balance;
  out.push({ ...first, start: new Date(t), end: new Date(end0), balance: true });
  t = end0;
  const limit = birthDate.getTime() + spanYears * YEAR_MS;
  let i = idx;
  while (t < limit) {
    i = (i + 1) % 8;
    const y = YOGINIS[i];
    const e = t + y.years * YEAR_MS;
    out.push({ ...y, start: new Date(t), end: new Date(e), balance: false });
    t = e;
  }
  return out;
}

export const yoginiAt = (periods, date = new Date()) =>
  periods.find(p => date >= p.start && date < p.end) || null;
