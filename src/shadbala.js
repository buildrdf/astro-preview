/* ===================================================================
   SHADBALA - classical Parashari six-fold graha strength, plus
   Bhava Bala. All values in virupas (60 virupas = 1 rupa).

   The six balas, per BPHS ch. on graha strength (Santhanam ed.) and
   B.V. Raman's "Graha and Bhava Balas":

   1. STHANA  = uccha + saptavargaja + ojayugmarasyamsa + kendradi
               + drekkana.
      - uccha: arc from the debilitation point (folded to <=180) / 3.
      - saptavargaja: dignity in the seven vargas D1 D2 D3 D7 D9 D12
        D30 under compound (panchadha) maitri - natural friendship
        plus temporal (planets 2,3,4,10,11,12 from the graha's rasi
        are temporal friends). Values: moolatrikona 45, own 30,
        adhimitra 22.5, mitra 15, sama 7.5, satru 3.75, adhisatru
        1.875. The moolatrikona degree span is recognised in D1 only;
        in other vargas the planet's own sign scores 30.
      - ojayugma: 15 for rasi parity + 15 for navamsa parity (Moon
        and Venus want even signs, the rest odd).
      - kendradi: 60 kendra / 30 panapara / 15 apoklima, whole-sign
        houses from the lagna sign.
      - drekkana: 15 to male grahas (Sun Mars Jupiter) in the 1st
        decanate, hermaphrodite (Mercury Saturn) in the 2nd, female
        (Moon Venus) in the 3rd. Translations of BPHS 27 disagree on
        the 2nd/3rd assignment; the reference tables pin the female
        grahas to the 3rd (Venus scores there in one chart and not
        in the 2nd in the other), so that is the default, with the
        swapped reading (female 2nd, neuter 3rd) as
        KNOWN_VARIANTS.drekkana. The vendor's neuter rule is odder:
        their Mercury scores in the 2nd decanate in one chart AND
        the 3rd in the other, so no single-decanate reading fits -
        drekkanaNeuterBoth (in the astrotalk variant) lets the
        neuter grahas score in either.

   2. KAALA   = natonnata + paksha + tribhaga + abda + masa + vara
               + hora + ayana.  (Yuddha - planetary war - is NOT
        implemented: neither reference chart has one; a war is two
        taragrahas within 1 degree, and callers can check that
        themselves until an oracle exists.)
      - natonnata: distance of birth from local apparent midnight
        (apparent noon = midpoint of sunrise and sunset). Diurnal
        grahas (Sun Jupiter Venus) get 60 * (12h - |t-noon|)/12h,
        nocturnal (Moon Mars Saturn) the complement, Mercury 60.
      - paksha: a = Sun->Moon separation folded to <=180. Benefics
        get a/3, malefics (180-a)/3, and the Moon's value doubles.
        Benefics: Jupiter, Venus, waxing Moon, Mercury not sharing
        a sign with a malefic (Sun Mars Saturn waning-Moon).
      - tribhaga: 60 to the lord of the day/night third of birth
        (day Mercury/Sun/Saturn, night Moon/Venus/Mars); Jupiter
        always 60.
      - abda 15 / masa 30 / vara 45 / hora 60 to the lords of the
        360-day year, 30-day month (both via ahargana from the Kali
        epoch, JDN 588466, a Friday), weekday (sunrise-bounded) and
        planetary hour (equal hours from sunrise, Sun-Venus-Mercury-
        Moon-Saturn-Jupiter-Mars chain from the day lord).
      - ayana: kranti (declination) of the tropical longitude with
        zero latitude - delta = asin(sin eps * sin lambda) - scored
        (eps + delta')/(2 eps) * 60 where delta' is +delta for the
        north-strong grahas (Sun Mars Jupiter Venus), -delta for
        Moon and Saturn, |delta| for Mercury. The Sun's is doubled.

   3. DIG     - arc between the graha and the cusp where it is
        powerless (Jupiter/Mercury: 7th cusp = asc+180; Sun/Mars:
        4th cusp = mc+180; Saturn: the ascendant; Moon/Venus: the
        MC), folded to <=180, / 3.

   4. CHESHTA - for the five taragrahas: seeghra kendra = seeghrocca
        minus the mean of the madhya (mean longitude) and sphuta
        (true longitude), folded to <=180, / 3. Seeghrocca is the
        mean Sun for superiors and the planet's own mean heliocentric
        longitude for Mercury/Venus (whose madhya is the mean Sun).
        Mean longitudes come from the same JPL/Standish rates the
        ephemeris uses; the mean Sun from Meeus. Sun and Moon report
        0 here: BPHS folds the Sun's ayana and the Moon's paksha
        into their cheshta INSTEAD of kaala, but our kaala already
        carries both (that is the vendor-validated presentation), so
        zeroing the luminaries avoids double counting.

   5. NAISARGIKA - the fixed ladder 60*(k/7): Sun 60, Moon 51.43,
        Venus 42.86, Jupiter 34.29, Mercury 25.71, Mars 17.14,
        Saturn 8.57. Constant for every chart ever cast.

   6. DRIK    - net sputa drishti of the other six grahas, benefics
        positive, malefics negative, / 4. Sputa drishti is the
        classical piecewise arc function (60 at opposition), with
        the special aspects ADDED as flat boosts inside their arcs:
        Mars +15 in [90,120) and [210,240), Jupiter +30 in [120,150)
        and [240,270), Saturn +45 in [60,90) and [270,300) - which
        makes each special aspect peak at exactly 60.

   BHAVA BALA (bhavabala()) = bhavadhipati (the house lord's total
   shadbala) + bhava dig bala (house-type vs sign-type: Nara signs
   strong in H1, Jalachara in H4, Keeta in H7, Chatushpada in H10;
   60 minus 15 per house of separation, floor 0; sign halves split
   at the equal-house madhya) + bhava drishti bala (net drik on the
   equal-house madhya, same drishti machinery, / 4).

   -------------------------------------------------------------------
   VALIDATION - prototype/tools/validate_shadbala.mjs, against the
   printed Astrotalk shadbala tables for both reference charts
   (docs/research/report-astrotalk-kundli.md and -partner.md).
   With VENDOR_VARIANTS (below) the engine reproduces, cell for cell:
     - Sthana: all 12 printed cells exact (<=0.02).
     - Dig:    all 12 exact  - after adopting the vendor's defect of
               taking |a-b| on raw 0..360 longitudes with no wrap.
     - Drik:   all 12 exact.
     - Naisargika: constant, exact.
     - Kaala:  10 of 12 exact; two cells (Sangram Sun +3.27,
               Natasha Mars +13.44) the vendor inflates in a way no
               classical component of 15/30/45/60 explains - pinned
               in the validator as known anomalies.
     - Cheshta: the vendor runs the classical formula on mean
               longitudes offset by a fixed per-planet phase
               (equivalent to +3.1/+3.6/-0.6/+3.0 days for Mars/
               Mercury/Jupiter/Venus - fitted once, stable across
               both charts), prints superiors unfolded (Jupiter
               68.56 > 60), folds Mars, and flips the sign for
               Mercury/Venus. With those offsets all 8 printed
               cells reproduce to <=0.05 virupa; the offsets are
               the vendor's planetary-theory constants, not a
               school, so the classical computation is the default
               and the emulation lives in KNOWN_VARIANTS.
     - Bhav Bala: the vendor's bhavadhipati is the shadbala total
               of the lord of the PREVIOUS sign (an off-by-one lord
               lookup; all 20 printed cells then leave a plausible
               0..64-virupa house term, where the correct lord
               leaves -238..+292). The validator asserts that
               decomposition; the leftover house term matches no
               classical dig/drishti convention we tested and is
               documented there as an open unknown.
   The classical (default) settings differ from the vendor only
   where the vendor is defective: arcs get folded, hora follows the
   real hora chain, abda/masa are included, bhavabala() uses the
   correct house lord.
   =================================================================== */

import { norm, jd, ayanamsa } from "./ephemeris.js?v=20260908a";
import { vargaSign } from "./vargas.js";

const D = Math.PI / 180;
export const SHADBALA_GRAHAS = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"];
const fold = a => { a = norm(a); return a > 180 ? 360 - a : a; };
const signOf = L => Math.floor(norm(L) / 30) + 1;          /* 1 = Aries */

/* ------------------------------------------------------------------ */
/* Reference data                                                      */
/* ------------------------------------------------------------------ */
const SIGN_LORD = {1:"Mars",2:"Venus",3:"Mercury",4:"Moon",5:"Sun",6:"Mercury",
                   7:"Venus",8:"Mars",9:"Jupiter",10:"Saturn",11:"Saturn",12:"Jupiter"};
const EXALT = {Sun:10,Moon:33,Mars:298,Mercury:165,Jupiter:95,Venus:357,Saturn:200};
const MOOLA = {Sun:[5,0,20],Moon:[2,4,30],Mars:[1,0,12],Mercury:[6,16,20],
               Jupiter:[9,0,10],Venus:[7,0,15],Saturn:[11,0,20]};
/* natural friendship: 1 friend / 0 neutral / -1 enemy */
const NATURAL = {
  Sun:    {Moon:1,Mars:1,Jupiter:1,Mercury:0,Venus:-1,Saturn:-1},
  Moon:   {Sun:1,Mercury:1,Mars:0,Jupiter:0,Venus:0,Saturn:0},
  Mars:   {Sun:1,Moon:1,Jupiter:1,Venus:0,Saturn:0,Mercury:-1},
  Mercury:{Sun:1,Venus:1,Mars:0,Jupiter:0,Saturn:0,Moon:-1},
  Jupiter:{Sun:1,Moon:1,Mars:1,Saturn:0,Mercury:-1,Venus:-1},
  Venus:  {Mercury:1,Saturn:1,Mars:0,Jupiter:0,Sun:-1,Moon:-1},
  Saturn: {Mercury:1,Venus:1,Jupiter:0,Sun:-1,Moon:-1,Mars:-1}};
const NAISARGIKA = {Sun:60,Moon:360/7,Venus:300/7,Jupiter:240/7,
                    Mercury:180/7,Mars:120/7,Saturn:60/7};
const DIURNAL = ["Sun","Jupiter","Venus"];                  /* natonnata day group */
const NORTH_STRONG = ["Sun","Mars","Jupiter","Venus"];      /* ayana */
const WEEKDAY_LORD = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"];
const HORA_CHAIN = ["Sun","Venus","Mercury","Moon","Saturn","Jupiter","Mars"];
/* mean-longitude polynomials, deg per Julian century from J2000 -
   the L element of the same Standish set ephemeris.js integrates,
   plus Meeus' mean Sun. Cheshta only needs differences, so the
   frame mismatch (J2000 vs of-date) cancels to ~0.1 deg. */
const MEAN_L = {Mercury:[252.25032350,149472.67411175],Venus:[181.97909950,58517.81538729],
  Mars:[-4.55343205,19140.30268499],Jupiter:[34.39644051,3034.74612775],
  Saturn:[49.95424423,1222.49362201]};
const meanSun = T => norm(280.46646 + 36000.76983*T + 0.0003032*T*T);

/* ------------------------------------------------------------------ */
/* Variants                                                            */
/* ------------------------------------------------------------------ */
/* Defaults are the classical readings; VENDOR_VARIANTS reproduces the
   Astrotalk tables (see header). Pass as opts to shadbala(). */
export const KNOWN_VARIANTS = {
  /* the other reading of BPHS 27's decanate line */
  drekkana: { drekkanaOrder: "male-female-neuter" },
  /* the full Astrotalk emulation used by the validator */
  astrotalk: {
    digFold: false,            /* their dig arcs never wrap or fold   */
    hora: "daylord",           /* their hora bala lands on the day lord */
    abdaMasa: false,           /* year/month lords absent from their sums */
    drekkanaNeuterBoth: true,  /* Mercury/Saturn score in 2nd OR 3rd  */
    cheshta: {
      unfolded: true,          /* superiors printed raw (>60 possible) */
      marsFold: true,          /* ...except Mars, which they fold      */
      inferiorReversed: true,  /* Mercury/Venus kendra sign flipped    */
      meanOffsetDays: {Mars:3.10, Mercury:3.63, Jupiter:-0.63, Venus:2.99, Saturn:0}
    }
  }
};

/* ------------------------------------------------------------------ */
/* Shared drishti machinery (also used by bhavabala)                   */
/* ------------------------------------------------------------------ */
function sputaDrishti(theta){
  const t = norm(theta);
  if (t < 30)  return 0;
  if (t < 60)  return (t - 30) / 2;
  if (t < 90)  return t - 45;
  if (t < 120) return 45 - (t - 90) / 2;
  if (t < 150) return 150 - t;
  if (t < 180) return (t - 150) * 2;
  if (t < 300) return (300 - t) / 2;
  return 0;
}
const SPECIAL_ARCS = {Mars:[[90,120,15],[210,240,15]],
  Jupiter:[[120,150,30],[240,270,30]], Saturn:[[60,90,45],[270,300,45]]};
function drishtiOf(aspecter, theta){
  let v = sputaDrishti(theta);
  for (const [a,b,add] of SPECIAL_ARCS[aspecter] ?? [])
    if (theta >= a && theta < b) v += add;
  return v;
}
/* net drishti of the seven grahas on a longitude, benefic-positive, /4 */
function netDrik(longitudes, ben, targetL, exclude){
  let sum = 0;
  for (const a of SHADBALA_GRAHAS){
    if (a === exclude) continue;
    sum += (ben[a] ? 1 : -1) * drishtiOf(a, norm(targetL - longitudes[a]));
  }
  return sum / 4;
}
/* benefic/malefic classification used by paksha and drik */
function beneficSet(longitudes){
  const wax = norm(longitudes.Moon - longitudes.Sun) < 180;
  const malefic0 = ["Sun","Mars","Saturn", ...(wax ? [] : ["Moon"])];
  const mercMalefic = malefic0.some(m => signOf(longitudes[m]) === signOf(longitudes.Mercury));
  return {Jupiter:true, Venus:true, Mercury:!mercMalefic, Moon:wax,
          Sun:false, Mars:false, Saturn:false, waxing:wax};
}

/* ------------------------------------------------------------------ */
/* Sthana                                                              */
/* ------------------------------------------------------------------ */
function ucchaBala(g, L){ return fold(L - norm(EXALT[g] + 180)) / 3; }

function temporalFriends(g, longitudes){
  const out = {}, from = signOf(longitudes[g]);
  for (const o of SHADBALA_GRAHAS){
    if (o === g) continue;
    const d = ((signOf(longitudes[o]) - from) % 12 + 12) % 12 + 1;
    out[o] = [2,3,4,10,11,12].includes(d) ? 1 : -1;
  }
  return out;
}
const SAPTA_VARGAS = [1,2,3,7,9,12,30];
function saptavargajaBala(g, longitudes){
  const temp = temporalFriends(g, longitudes);
  let v = 0;
  for (const dv of SAPTA_VARGAS){
    const s = vargaSign(longitudes[g], dv);
    const lord = SIGN_LORD[s];
    if (lord === g){
      const [ms, d0, d1] = MOOLA[g], deg = norm(longitudes[g]) % 30;
      v += (dv === 1 && s === ms && deg >= d0 && deg <= d1) ? 45 : 30;
    } else {
      const rel = NATURAL[g][lord] + temp[lord];      /* 2..-2 */
      v += {2:22.5, 1:15, 0:7.5, "-1":3.75, "-2":1.875}[rel];
    }
  }
  return v;
}
function ojayugmaBala(g, L){
  const wantsEven = g === "Moon" || g === "Venus";
  const score = odd => (wantsEven ? !odd : odd) ? 15 : 0;
  return score(signOf(L) % 2 === 1) + score(vargaSign(L, 9) % 2 === 1);
}
function kendradiBala(L, asc){
  const h = ((signOf(L) - signOf(asc)) % 12 + 12) % 12 + 1;
  return [1,4,7,10].includes(h) ? 60 : [2,5,8,11].includes(h) ? 30 : 15;
}
function drekkanaBala(g, L, order, neuterBoth){
  const dk = Math.floor((norm(L) % 30) / 10);          /* 0,1,2 */
  const male = ["Sun","Mars","Jupiter"].includes(g);
  const female = g === "Moon" || g === "Venus";
  if (!male && !female && neuterBoth) return dk > 0 ? 15 : 0;
  const want = male ? 0 : order === "male-female-neuter" ? (female ? 1 : 2)
                                                         : (female ? 2 : 1);
  return dk === want ? 15 : 0;
}

/* ------------------------------------------------------------------ */
/* Kaala                                                               */
/* ------------------------------------------------------------------ */
const weekdayOfJDN = jdn => ((jdn + 1) % 7 + 7) % 7;       /* 0 = Sunday */
const KALI_EPOCH_JDN = 588466;                             /* a Friday   */

function kaalaBala(chart, ben, opts){
  const {longitudes, date, sunrise, sunset} = chart;
  const J = jd(date), T = (J - 2451545) / 36525;
  const eps = 23.439281 - 0.0130042 * T;
  const ay = ayanamsa(J);

  const noon = (sunrise.getTime() + sunset.getTime()) / 2;
  const dNoon = Math.min(12, Math.abs(date.getTime() - noon) / 36e5);
  const diurnal = (12 - dNoon) / 12 * 60;

  const pk = fold(norm(longitudes.Moon - longitudes.Sun));

  const isDay = date >= sunrise && date <= sunset;
  let partLord;
  if (isDay){
    const f = (date - sunrise) / (sunset - sunrise);
    partLord = ["Mercury","Sun","Saturn"][Math.min(2, Math.floor(f * 3))];
  } else {
    const nightStart = date < sunrise ? sunset.getTime() - 864e5 : sunset.getTime();
    const nextRise   = date < sunrise ? sunrise.getTime() : sunrise.getTime() + 864e5;
    const f = (date.getTime() - nightStart) / (nextRise - nightStart);
    partLord = ["Moon","Venus","Mars"][Math.min(2, Math.max(0, Math.floor(f * 3)))];
  }

  /* Vedic weekday: the civil day of the most recent sunrise */
  const tz = chart.tzMinutes ?? 0;
  const varaRef = date < sunrise ? new Date(date.getTime() - 864e5) : date;
  const jdnLocal = Math.floor(jd(varaRef) + tz / 1440 + 0.5);
  const dayLord = WEEKDAY_LORD[weekdayOfJDN(jdnLocal)];

  let horaLord;
  if (opts.hora === "daylord") horaLord = dayLord;
  else {
    /* equal hours from the Vedic day's sunrise (previous day's for a
       pre-dawn birth, approximated at sunrise minus 24h) */
    const base = date < sunrise ? sunrise.getTime() - 864e5 : sunrise.getTime();
    const idx = Math.floor((date.getTime() - base) / 36e5);
    horaLord = HORA_CHAIN[(HORA_CHAIN.indexOf(dayLord) + idx) % 7];
  }

  let abdaLord = null, masaLord = null;
  if (opts.abdaMasa !== false){
    const A = jdnLocal - KALI_EPOCH_JDN;
    abdaLord = WEEKDAY_LORD[weekdayOfJDN(KALI_EPOCH_JDN + A - (A % 360))];
    masaLord = WEEKDAY_LORD[weekdayOfJDN(KALI_EPOCH_JDN + A - (A % 30))];
  }

  const out = {};
  for (const g of SHADBALA_GRAHAS){
    const p = {};
    p.natonnata = g === "Mercury" ? 60 : DIURNAL.includes(g) ? diurnal : 60 - diurnal;
    p.paksha = (ben[g] ? pk : 180 - pk) / 3 * (g === "Moon" ? 2 : 1);
    p.tribhaga = (g === "Jupiter" || g === partLord) ? 60 : 0;
    p.abda = g === abdaLord ? 15 : 0;
    p.masa = g === masaLord ? 30 : 0;
    p.vara = g === dayLord ? 45 : 0;
    p.hora = g === horaLord ? 60 : 0;
    const decl = Math.asin(Math.sin(eps*D) * Math.sin(norm(longitudes[g] + ay) * D)) / D;
    const dEff = g === "Mercury" ? Math.abs(decl) : NORTH_STRONG.includes(g) ? decl : -decl;
    p.ayana = (eps + dEff) / (2 * eps) * 60 * (g === "Sun" ? 2 : 1);
    p.total = p.natonnata + p.paksha + p.tribhaga + p.abda + p.masa + p.vara + p.hora + p.ayana;
    out[g] = p;
  }
  return {parts: out, meta: {dayLord, horaLord, partLord, abdaLord, masaLord}};
}

/* ------------------------------------------------------------------ */
/* Dig                                                                 */
/* ------------------------------------------------------------------ */
function digBala(g, L, asc, mc, foldArcs){
  const point = (g === "Jupiter" || g === "Mercury") ? norm(asc + 180)
              : (g === "Sun" || g === "Mars")        ? norm(mc + 180)
              : g === "Saturn"                       ? norm(asc)
              :                                        norm(mc);
  const arc = foldArcs === false ? Math.abs(norm(L) - point) : fold(L - point);
  return arc / 3;
}

/* ------------------------------------------------------------------ */
/* Cheshta                                                             */
/* ------------------------------------------------------------------ */
const midAngle = (a, b) => { let d = norm(b - a); if (d > 180) d -= 360; return norm(a + d/2); };

function cheshtaBala(g, longitudes, date, co){
  if (g === "Sun" || g === "Moon") return 0;   /* see header - lives in kaala */
  const J = jd(date), off = co.meanOffsetDays?.[g] ?? 0;
  const T = (J + off - 2451545) / 36525;
  const Sm = meanSun(T);
  const Lm = norm(MEAN_L[g][0] + MEAN_L[g][1] * T);
  const sphuta = norm(longitudes[g] + ayanamsa(J));
  const inferior = g === "Mercury" || g === "Venus";
  let ck = inferior ? norm(Lm - midAngle(Sm, sphuta))
                    : norm(Sm - midAngle(Lm, sphuta));
  if (inferior && co.inferiorReversed) ck = norm(-ck);
  const doFold = co.unfolded ? (g === "Mars" && co.marsFold) : true;
  return (doFold ? fold(ck) : ck) / 3;
}

/* ------------------------------------------------------------------ */
/* shadbala(chart, opts)                                               */
/*                                                                     */
/* chart: { longitudes: {Sun..Saturn} sidereal degrees,                */
/*          ascendant, mc: sidereal degrees,                           */
/*          date: Date (UT birth instant),                             */
/*          sunrise, sunset: Date (of the birth day, local apparent),  */
/*          tzMinutes: offset for the civil weekday (e.g. 330) }       */
/* opts:  KNOWN_VARIANTS entries, or {} for classical.                 */
/* Returns { grahas: {g: {sthana,kaala,dig,cheshta,naisargika,drik,    */
/*           total,rupas, parts:{...}}}, meta }                        */
/* ------------------------------------------------------------------ */
export function shadbala(chart, opts = {}){
  const {longitudes, ascendant, mc, date, sunrise, sunset} = chart;
  for (const g of SHADBALA_GRAHAS)
    if (!Number.isFinite(longitudes?.[g]))
      throw new Error(`shadbala: missing longitude for ${g}`);
  for (const [k,v] of Object.entries({ascendant, mc}))
    if (!Number.isFinite(v)) throw new Error(`shadbala: missing ${k}`);
  if (!(date instanceof Date) || !(sunrise instanceof Date) || !(sunset instanceof Date))
    throw new Error("shadbala: date, sunrise and sunset must be Dates");

  const ben = beneficSet(longitudes);
  const kaala = kaalaBala(chart, ben, opts);
  const co = opts.cheshta ?? {};
  const grahas = {};
  for (const g of SHADBALA_GRAHAS){
    const L = longitudes[g];
    const sthanaParts = {
      uccha: ucchaBala(g, L),
      saptavargaja: saptavargajaBala(g, longitudes),
      ojayugma: ojayugmaBala(g, L),
      kendradi: kendradiBala(L, ascendant),
      drekkana: drekkanaBala(g, L, opts.drekkanaOrder, opts.drekkanaNeuterBoth)
    };
    const sthana = Object.values(sthanaParts).reduce((a,b)=>a+b, 0);
    const r = {
      sthana,
      kaala: kaala.parts[g].total,
      dig: digBala(g, L, ascendant, mc, opts.digFold),
      cheshta: cheshtaBala(g, longitudes, date, co),
      naisargika: NAISARGIKA[g],
      drik: netDrik(longitudes, ben, L, g)
    };
    r.total = r.sthana + r.kaala + r.dig + r.cheshta + r.naisargika + r.drik;
    r.rupas = r.total / 60;
    r.parts = {sthana: sthanaParts, kaala: kaala.parts[g]};
    grahas[g] = r;
  }
  return {grahas, meta: {...kaala.meta, benefics: ben}};
}

/* ------------------------------------------------------------------ */
/* Bhava Bala                                                          */
/* ------------------------------------------------------------------ */
/* Sign-type table for bhava dig bala; sign halves matter for
   Sagittarius (Nara then Chatushpada) and Capricorn (Chatushpada
   then Jalachara). Types: N nara, J jalachara, C chatushpada,
   K keeta. Power houses: N->1, J->4, K->7, C->10. */
function signType(L){
  const s = signOf(L), firstHalf = (norm(L) % 30) < 15;
  if (s === 9)  return firstHalf ? "N" : "C";
  if (s === 10) return firstHalf ? "C" : "J";
  return {1:"C",2:"C",3:"N",4:"J",5:"C",6:"N",7:"N",8:"K",11:"N",12:"J"}[s];
}
const POWER_HOUSE = {N:1, J:4, K:7, C:10};

export function bhavabala(chart, opts = {}, sb = null){
  sb = sb ?? shadbala(chart, opts);
  const {longitudes, ascendant} = chart;
  const ben = beneficSet(longitudes);
  const lagna = signOf(ascendant);
  const out = [];
  for (let h = 1; h <= 12; h++){
    const sign = ((lagna - 1 + h - 1) % 12) + 1;
    const lord = SIGN_LORD[sign];
    const madhya = norm(ascendant + (h - 1) * 30);   /* equal-house madhya */
    const powerH = POWER_HOUSE[signType(madhya)];
    const dist = Math.min(((h - powerH) % 12 + 12) % 12, ((powerH - h) % 12 + 12) % 12);
    const dig = Math.max(0, 60 - 15 * dist);
    const drishti = netDrik(longitudes, ben, madhya, null);
    const total = sb.grahas[lord].total + dig + drishti;
    out.push({house: h, sign, lord, bhavadhipati: sb.grahas[lord].total,
              dig, drishti, total, rupas: total / 60});
  }
  return out;
}
