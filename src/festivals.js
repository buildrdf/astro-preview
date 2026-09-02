/* ===================================================================
   FESTIVALS & VRATS (src/festivals.js)
   -------------------------------------------------------------------
   Derives the Hindu luni-solar calendar from Astra's own ephemeris:
   lunations (new moon → new moon), amanta month names with adhika
   (intercalary) detection from the Sun's sidereal sign entries, and
   festival/vrat dates from (masa, paksha, tithi) rules evaluated at
   the reference instant each observance traditionally uses (sunrise,
   noon, afternoon, evening/pradosh, midnight/nishita).

   Nothing here interprets. Regional conventions differ (amanta vs
   purnimanta month names, moonrise-based vrats, bhadra avoidance); the
   table records which rule each entry follows, and `note` says where
   Astra simplifies. Validate with tools/validate_festivals.mjs.
   =================================================================== */

import { sunSidereal, moonSidereal, norm } from "./ephemeris.js";
import { sunTimes } from "./sky.js";

/* amanta month names, indexed by the sidereal sign the Sun ENTERS during
   that lunation (Mesha sankranti falls in Chaitra, and so on) */
export const MASA = ["Chaitra","Vaishakha","Jyeshtha","Ashadha","Shravana","Bhadrapada",
  "Ashwin","Kartika","Margashirsha","Pausha","Magha","Phalguna"];
export const MASA_HI = ["चैत्र","वैशाख","ज्येष्ठ","आषाढ़","श्रावण","भाद्रपद",
  "आश्विन","कार्तिक","मार्गशीर्ष","पौष","माघ","फाल्गुन"];

const DAY = 864e5;
const elong = d => norm(moonSidereal(d) - sunSidereal(d));

/* bisect an instant where f crosses from below to above a target on a
   circular 0..360 scale (wraps handled by the caller's bracket) */
function bisect(f, a, b, target, wrap) {
  let lo = a.getTime(), hi = b.getTime();
  for (let i = 0; i < 40 && hi - lo > 1000; i++) {
    const mid = (lo + hi) / 2;
    let v = f(new Date(mid));
    if (wrap && v > 300) v -= 360;                   /* treat 359 as -1 near the wrap */
    if (v < target) lo = mid; else hi = mid;
  }
  return new Date((lo + hi) / 2);
}

/* new moons (elongation wraps 360→0) and full moons (crosses 180) */
export function newMoons(from, to) {
  const out = [];
  let prev = elong(from), t = from.getTime();
  for (; t <= to.getTime() + DAY; t += DAY / 2) {
    const d = new Date(t), e = elong(d);
    if (prev > 300 && e < 60) out.push(bisect(elong, new Date(t - DAY / 2), d, 0, true));
    prev = e;
  }
  return out;
}
export function fullMoons(from, to) {
  const out = [];
  let prev = elong(from), t = from.getTime();
  for (; t <= to.getTime() + DAY; t += DAY / 2) {
    const d = new Date(t), e = elong(d);
    if (prev < 180 && e >= 180 && e - prev < 180) out.push(bisect(elong, new Date(t - DAY / 2), d, 180, false));
    prev = e;
  }
  return out;
}

/* sidereal sign entries of the Sun (sankrantis) inside [a, b) */
export function sankrantis(a, b) {
  const out = [];
  let t = a.getTime(), prevSign = Math.floor(sunSidereal(a) / 30);
  for (; t < b.getTime(); t += DAY / 4) {
    const d = new Date(Math.min(t + DAY / 4, b.getTime()));
    const s = Math.floor(sunSidereal(d) / 30);
    if (s !== prevSign) {
      const f = x => { const v = sunSidereal(x) - s * 30; return v < -180 ? v + 360 : v; };
      out.push({ sign: s + 1, at: bisect(f, new Date(t), d, 0, false) });
      prevSign = s;
    }
  }
  return out;
}

/* Lunations covering [from, to], each with its amanta name. A lunation
   with no sankranti is adhika and takes the NEXT month's name; a
   lunation with two (kshaya, very rare) carries both names. */
export function lunations(from, to) {
  const pad = 40 * DAY;
  const nms = newMoons(new Date(from.getTime() - pad), new Date(to.getTime() + pad));
  const out = [];
  for (let i = 0; i + 1 < nms.length; i++) {
    const a = nms[i], b = nms[i + 1];
    if (b < from || a > to) continue;
    const sk = sankrantis(a, b);
    let masa, adhika = false, kshaya = false;
    if (sk.length === 1) masa = sk[0].sign - 1;
    else if (sk.length === 0) {
      adhika = true;
      const next = sankrantis(b, new Date(b.getTime() + 40 * DAY))[0];
      masa = next ? next.sign - 1 : 0;
    } else { kshaya = true; masa = sk[0].sign - 1; }
    out.push({ start: a, end: b, masa, adhika, kshaya,
      name: (adhika ? "Adhika " : "") + MASA[masa] + (kshaya ? ` (kshaya, with ${MASA[sk[1].sign - 1]})` : ""),
      nameHi: (adhika ? "अधिक " : "") + MASA_HI[masa] });
  }
  return out;
}

/* tithi index 1..30 at an instant (1..15 shukla, 16..30 krishna; 30 = amavasya) */
export const tithiIndex = d => Math.floor(elong(d) / 12) + 1;

/* reference instants of a civil day at a place */
export function dayInstants(day, lat, lon) {
  const st = sunTimes(day, lat, lon);
  const next = sunTimes(new Date(day.getTime() + DAY), lat, lon);
  const rise = st.rise, set = st.set;
  if (!rise || !set) return null;
  const dayLen = set - rise;
  return {
    sunrise: rise,
    noon: new Date(rise.getTime() + dayLen / 2),
    afternoon: new Date(rise.getTime() + dayLen * 0.7),      /* aparahna: last third of the day */
    evening: new Date(set.getTime() + 60 * 60e3),            /* pradosh: after sunset */
    night: new Date(set.getTime() + 150 * 60e3),             /* moonrise-ish on krishna chaturthi */
    midnight: new Date(set.getTime() + ((next.rise || new Date(rise.getTime() + DAY)) - set) / 2),
  };
}

/* ---- the table ----------------------------------------------------
   masa: amanta index 0..11 (or "any"); paksha: "S"|"K"; tithi: 1..15
   (15 = purnima in S, amavasya in K); rule: which instant the tithi
   must prevail at; kind: festival | vrat | observance | solar. Ekadashi
   names follow the purnimanta convention most of India prints, so the
   krishna-paksha name is keyed to the NEXT amanta month. */
const F = (name, masa, paksha, tithi, rule, kind, hi, note) => ({ name, masa, paksha, tithi, rule, kind, hi, note });
export const FESTIVALS = [
  F("Gudi Padwa / Ugadi", 0, "S", 1, "sunrise", "festival", "गुड़ी पड़वा / उगादि", "Chaitra Shukla Pratipada — the amanta new year"),
  F("Ram Navami", 0, "S", 9, "noon", "festival", "राम नवमी", "Navami prevailing at midday"),
  F("Hanuman Jayanti", 0, "S", 15, "sunrise", "festival", "हनुमान जयंती", "Chaitra Purnima (the north/west convention)"),
  F("Akshaya Tritiya", 1, "S", 3, "noon", "festival", "अक्षय तृतीया", "Tritiya prevailing at midday"),
  F("Buddha Purnima", 1, "S", 15, "sunrise", "festival", "बुद्ध पूर्णिमा"),
  F("Vat Purnima", 2, "S", 15, "sunrise", "vrat", "वट पूर्णिमा", "Jyeshtha Purnima (Maharashtra, Gujarat)"),
  F("Ganga Dussehra", 2, "S", 10, "sunrise", "festival", "गंगा दशहरा"),
  F("Rath Yatra", 3, "S", 2, "sunrise", "festival", "रथ यात्रा"),
  F("Guru Purnima", 3, "S", 15, "sunrise", "festival", "गुरु पूर्णिमा"),
  F("Nag Panchami", 4, "S", 5, "sunrise", "festival", "नाग पंचमी"),
  { ...F("Raksha Bandhan", 4, "S", 15, "afternoon", "festival", "रक्षा बंधन", "Purnima in the afternoon, after bhadra (the first half of the tithi)"), avoidBhadra: true },
  F("Janmashtami", 4, "K", 8, "midnight", "festival", "जन्माष्टमी", "Ashtami at midnight (nishita); smarta/vaishnava dates can differ by a day"),
  F("Hartalika Teej", 5, "S", 3, "sunrise", "vrat", "हरतालिका तीज"),
  F("Ganesh Chaturthi", 5, "S", 4, "noon", "festival", "गणेश चतुर्थी", "Chaturthi prevailing at midday"),
  F("Anant Chaturdashi", 5, "S", 14, "sunrise", "festival", "अनंत चतुर्दशी"),
  F("Pitru Paksha begins", 5, "K", 1, "sunrise", "observance", "पितृ पक्ष आरंभ"),
  F("Sarva Pitru Amavasya", 5, "K", 15, "sunrise", "observance", "सर्वपितृ अमावस्या"),
  F("Navratri begins", 6, "S", 1, "sunrise", "festival", "शारदीय नवरात्रि आरंभ"),
  F("Durga Ashtami", 6, "S", 8, "sunrise", "festival", "दुर्गाष्टमी"),
  F("Vijayadashami / Dussehra", 6, "S", 10, "afternoon", "festival", "विजयादशमी / दशहरा", "Dashami in the afternoon (aparahna)"),
  F("Sharad Purnima", 6, "S", 15, "sunrise", "festival", "शरद पूर्णिमा", "Kojagiri"),
  F("Karva Chauth", 6, "K", 4, "night", "vrat", "करवा चौथ", "Chaturthi at moonrise; Astra uses about two and a half hours after sunset"),
  F("Dhanteras", 6, "K", 13, "evening", "festival", "धनतेरस", "Trayodashi during pradosh"),
  F("Naraka Chaturdashi", 6, "K", 14, "sunrise", "festival", "नरक चतुर्दशी", "Chhoti Diwali; many observe by the pre-dawn (moonrise) rule"),
  F("Diwali / Lakshmi Puja", 6, "K", 15, "evening", "festival", "दीपावली / लक्ष्मी पूजन", "Amavasya during pradosh"),
  F("Govardhan Puja", 7, "S", 1, "sunrise", "festival", "गोवर्धन पूजा"),
  F("Bhai Dooj", 7, "S", 2, "afternoon", "festival", "भाई दूज"),
  F("Tulsi Vivah", 7, "S", 12, "sunrise", "festival", "तुलसी विवाह"),
  F("Kartik Purnima / Guru Nanak Jayanti", 7, "S", 15, "sunrise", "festival", "कार्तिक पूर्णिमा / गुरु नानक जयंती"),
  F("Vasant Panchami", 10, "S", 5, "sunrise", "festival", "वसंत पंचमी"),
  F("Ratha Saptami", 10, "S", 7, "sunrise", "festival", "रथ सप्तमी"),
  F("Maha Shivratri", 10, "K", 14, "midnight", "festival", "महाशिवरात्रि", "Chaturdashi at midnight (nishita)"),
  { ...F("Holika Dahan", 11, "S", 15, "evening", "festival", "होलिका दहन", "Purnima during pradosh, after bhadra"), avoidBhadra: true },
  F("Holi (Dhulivandan)", 11, "K", 1, "sunrise", "festival", "होली / धुलिवंदन", "the day after Holika Dahan"),
];
export const EKADASHI = {                 /* purnimanta (masa, paksha) → name */
  "0S": "Kamada", "0K": "Papmochani", "1S": "Mohini", "1K": "Varuthini",
  "2S": "Nirjala", "2K": "Apara", "3S": "Devshayani", "3K": "Yogini",
  "4S": "Shravana Putrada", "4K": "Kamika", "5S": "Parivartini", "5K": "Aja",
  "6S": "Papankusha", "6K": "Indira", "7S": "Prabodhini (Dev Uthani)", "7K": "Rama",
  "8S": "Mokshada", "8K": "Utpanna", "9S": "Pausha Putrada", "9K": "Saphala",
  "10S": "Jaya", "10K": "Shattila", "11S": "Amalaki", "11K": "Vijaya",
};
const RECURRING = [
  { name: "Ekadashi", tithi: 11, paksha: "SK", rule: "sunrise", kind: "vrat", hi: "एकादशी" },
  { name: "Pradosh", tithi: 13, paksha: "SK", rule: "evening", kind: "vrat", hi: "प्रदोष" },
  { name: "Sankashti Chaturthi", tithi: 4, paksha: "K", rule: "night", kind: "vrat", hi: "संकष्टी चतुर्थी", note: "Chaturthi at moonrise; Astra uses about two and a half hours after sunset" },
  { name: "Vinayaka Chaturthi", tithi: 4, paksha: "S", rule: "sunrise", kind: "vrat", hi: "विनायक चतुर्थी" },
  { name: "Purnima", tithi: 15, paksha: "S", rule: "sunrise", kind: "observance", hi: "पूर्णिमा" },
  { name: "Amavasya", tithi: 15, paksha: "K", rule: "sunrise", kind: "observance", hi: "अमावस्या" },
];

/* tithi t (1..30) as an instant interval inside a lunation: the elongation
   rises monotonically 0→360 between two new moons, so a plain bisection
   finds each 12° boundary */
export function tithiInterval(lun, t) {
  const a = new Date(lun.start.getTime() + 60e3), b = new Date(lun.end.getTime() - 60e3);
  const cross = deg => deg <= 0 ? lun.start : deg >= 360 ? lun.end : bisect(elong, a, b, deg, false);
  return { start: cross((t - 1) * 12), end: cross(t * 12) };
}

/* civil day (local midnight) containing an instant */
const dayOf = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };

/* Pick the observance day for a tithi interval under a rule:
     1. the first civil day whose reference instant (sunrise / noon /
        afternoon / evening / night / midnight) falls inside the tithi,
        skipping bhadra (the first half of the tithi) where the rule says so;
     2. else the first day whose sunrise falls inside it (udaya fallback);
     3. else - a kshaya tithi touching no sunrise - the day holding its midpoint. */
function pickDay(iv, rule, lat, lon, avoidBhadra) {
  const mid = new Date((iv.start.getTime() + iv.end.getTime()) / 2);
  const first = dayOf(new Date(iv.start.getTime() - DAY)), notes = [];
  const tryRule = key => {
    for (let t = first.getTime(); t <= iv.end.getTime() + DAY; t += DAY) {
      const inst = dayInstants(new Date(t), lat, lon);
      if (!inst) continue;
      const x = inst[key];
      if (x >= iv.start && x < iv.end) {
        if (avoidBhadra && x < mid) { notes.push("bhadra"); continue; }
        return new Date(t);
      }
    }
    return null;
  };
  let d = tryRule(rule);
  if (!d && rule !== "sunrise") { d = tryRule("sunrise"); if (d) notes.push("the tithi did not hold at the usual hour on any day, so the day it held at sunrise is used"); }
  if (!d) { d = dayOf(mid); notes.push("a short tithi that touches no sunrise - the day it mostly falls on"); }
  return { day: d, notes };
}

/* All observances between two civil dates (inclusive) at a place. */
export function festivalsBetween(from, to, lat, lon, opts = {}) {
  const solar = opts.solar !== false;
  const f0 = dayOf(from), t1 = new Date(dayOf(to).getTime() + DAY - 1);
  const luns = lunations(new Date(f0.getTime() - 3 * DAY), new Date(t1.getTime() + 3 * DAY));
  const out = [];
  const emit = (day, e, lun, paksha, tn, notes) => {
    if (day < f0 || day > t1) return;
    let name = e.name;
    if (e.name === "Ekadashi") {
      const pm = paksha === "S" ? lun.masa : (lun.masa + 1) % 12;       /* purnimanta name */
      const nm = lun.adhika ? (paksha === "S" ? "Padmini" : "Parama") : EKADASHI[pm + paksha];
      name = `${nm} Ekadashi`;
    }
    const note = [e.note, ...notes.filter(n => n !== "bhadra")].filter(Boolean).join("; ") || undefined;
    out.push({ date: day, name, hi: e.hi, kind: e.kind, rule: e.rule,
      masa: lun.name, masaHi: lun.nameHi, paksha, tithi: tn, note });
  };
  for (const lun of luns) {
    const entries = [
      ...FESTIVALS.filter(e => e.masa === lun.masa && (!lun.adhika || e.adhikaOk)),
      ...RECURRING,
    ];
    for (const e of entries) {
      for (const paksha of e.paksha) {
        const t = paksha === "S" ? e.tithi : 15 + e.tithi;
        const iv = tithiInterval(lun, t);
        const { day, notes } = pickDay(iv, e.rule, lat, lon, !!e.avoidBhadra);
        emit(day, e, lun, paksha, e.tithi, notes);
      }
    }
  }
  if (solar) {
    /* a sankranti belongs to the civil day whose sunset follows it: entries
       after sunset are observed the next day (the punya-kala convention) */
    for (const s of sankrantis(new Date(f0.getTime() - DAY), new Date(t1.getTime() + DAY))) {
      let day = dayOf(s.at);
      const set = sunTimes(day, lat, lon).set;
      if (set && s.at > set) day = new Date(day.getTime() + DAY);
      if (day < f0 || day > t1) continue;
      const lun = luns.find(l => s.at >= l.start && s.at < l.end);
      const base = { date: day, kind: "solar", rule: "sankranti", masa: lun?.name, masaHi: lun?.nameHi };
      if (s.sign === 10) out.push({ ...base, name: "Makar Sankranti", hi: "मकर संक्रांति",
        note: set && s.at > set ? "Sun entered Makara after sunset - observed the next day" : undefined });
      else if (s.sign === 1) out.push({ ...base, name: "Mesha Sankranti (Baisakhi / Vishu)", hi: "मेष संक्रांति" });
      else out.push({ ...base, name: `${MASA_SOLAR[s.sign - 1]} Sankranti`, hi: "संक्रांति", minor: true });
    }
  }
  return out.sort((a, b) => a.date - b.date);
}
const MASA_SOLAR = ["Mesha","Vrishabha","Mithuna","Karka","Simha","Kanya","Tula","Vrishchika","Dhanu","Makara","Kumbha","Meena"];

/* Today's headline: the most important observance on a day, if any */
export function todayObservance(day, lat, lon) {
  const list = festivalsBetween(day, day, lat, lon).filter(x => !x.minor);
  const rank = { festival: 0, solar: 1, vrat: 2, observance: 3 };
  return list.sort((a, b) => rank[a.kind] - rank[b.kind])[0] || null;
}

/* One plain line for what each day IS, so a row can say something before the reader has to
   know the vocabulary. Widely attested descriptions only — nothing invented, no claims about
   outcomes, no scripture cited. Anything not listed falls back to its tithi reckoning. */
export const WHAT = {
  "Gudi Padwa / Ugadi": "New year in the amanta reckoning, kept in Maharashtra as Gudi Padwa and in the Deccan as Ugadi.",
  "Ram Navami": "Marks the birth of Rama, observed at midday.",
  "Hanuman Jayanti": "Marks the birth of Hanuman.",
  "Akshaya Tritiya": "A day traditionally treated as auspicious for beginnings and for buying gold.",
  "Buddha Purnima": "Full moon kept as the birth, awakening and passing of the Buddha.",
  "Vat Purnima": "A married women's vrat kept around the banyan tree, in Maharashtra and Gujarat.",
  "Ganga Dussehra": "Marks the descent of the Ganga.",
  "Rath Yatra": "The chariot procession of Jagannath at Puri.",
  "Guru Purnima": "Full moon given to teachers and to Vyasa.",
  "Nag Panchami": "Serpent worship on the fifth of the bright fortnight.",
  "Raksha Bandhan": "Sisters tie a thread on their brothers' wrists.",
  "Janmashtami": "Marks the birth of Krishna, kept at midnight.",
  "Hartalika Teej": "A women's vrat to Parvati, kept without food or water.",
  "Ganesh Chaturthi": "The arrival of Ganesha, installed at midday.",
  "Anant Chaturdashi": "Closes the Ganesh festival with the immersion.",
  "Pitru Paksha begins": "A fortnight given to remembering ancestors.",
  "Sarva Pitru Amavasya": "The last day of the ancestral fortnight, for all forebears together.",
  "Navratri begins": "Nine nights of the Goddess open.",
  "Durga Ashtami": "The eighth night of Navratri.",
  "Vijayadashami / Dussehra": "Closes Navratri; kept as Rama's victory and as Durga's.",
  "Sharad Purnima": "The autumn full moon, kept as Kojagiri.",
  "Karva Chauth": "A wives' vrat broken at moonrise.",
  "Dhanteras": "Opens the Diwali days; traditionally a day for buying metal.",
  "Naraka Chaturdashi": "Chhoti Diwali, the day before the main night.",
  "Diwali / Lakshmi Puja": "The new moon night of lamps, with Lakshmi worshipped at dusk.",
  "Govardhan Puja": "Marks Krishna lifting Govardhan; kept as Annakut.",
  "Bhai Dooj": "Brothers visit their sisters, two days after Diwali.",
  "Tulsi Vivah": "The ceremonial marriage of the tulsi plant, opening the wedding season.",
  "Kartik Purnima / Guru Nanak Jayanti": "Kartik full moon, also kept as the birth of Guru Nanak.",
  "Vasant Panchami": "Spring opens; the day of Saraswati.",
  "Ratha Saptami": "Marks the Sun turning north on his chariot.",
  "Maha Shivratri": "The great night of Shiva, kept awake at midnight.",
  "Holika Dahan": "The bonfire on the eve of Holi.",
  "Holi (Dhulivandan)": "The day of colour, the morning after the bonfire.",
  "Makar Sankranti": "The Sun enters Capricorn and begins its northward half.",
  "Mesha Sankranti (Baisakhi / Vishu)": "The Sun enters Aries; solar new year in several regions.",
  "Ekadashi": "The eleventh tithi, kept as a fast in both fortnights.",
  "Pradosh": "The thirteenth tithi at dusk, given to Shiva.",
  "Sankashti Chaturthi": "The fourth of the dark fortnight, kept for Ganesha and broken at moonrise.",
  "Purnima": "The full moon.",
  "Amavasya": "The new moon.",
};
export const whatIs = name => {
  if (!name) return "";
  if (WHAT[name]) return WHAT[name];
  if (/Ekadashi$/.test(name)) return WHAT["Ekadashi"];             /* Indira, Kamada, … */
  if (/Pradosh/i.test(name)) return WHAT["Pradosh"];
  if (/Sankashti|Chaturthi$/.test(name)) return WHAT["Sankashti Chaturthi"];
  if (/Sankranti$/.test(name)) return "The Sun enters a new sidereal sign.";
  if (/Purnima$/.test(name)) return WHAT["Purnima"];
  if (/Amavasya$/.test(name)) return WHAT["Amavasya"];
  return "";
};
