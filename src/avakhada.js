/* ===================================================================
   AVAKHADA (src/avakhada.js)
   -------------------------------------------------------------------
   The Avakhada identity block for a sidereal Moon longitude — varna,
   vashya, yoni, gana, nadi, tatva, namakshara, yunja — plus the tables
   it reads.

   These lived inside src/report.js. app.js imported report.js for this
   one function, and report.js statically imports report-hi.js, so every
   app launch pulled 185 KB of report machinery to render two glossary
   lines. The reports themselves render in report.html, which loads
   report.js on its own; nothing else in the app needs it.

   The tables are unchanged from report.js, validation notes included:
   they mirror the module-private tables inside src/match.js (the same
   standard Parashari tables the koota scoring was validated against),
   duplicated because match.js keeps them private.
   Order: Aries.. for sign tables, Ashwini.. for nakshatra tables.
   =================================================================== */
import { ASTERISMS } from "./asterisms.js";
import { DASHA_ORDER } from "./dasha3.js";

export const SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra",
  "Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
export const SIGN_LORD = ["Mars","Venus","Mercury","Moon","Sun","Mercury",
  "Venus","Mars","Jupiter","Saturn","Saturn","Jupiter"];       /* Aries.. */
export const NAK_NAMES = ASTERISMS.map(a => a.nak);          /* validated catalog order */

export const VARNA_OF_SIGN = ["Kshatriya","Vaishya","Shudra","Brahmin","Kshatriya","Vaishya",
  "Shudra","Brahmin","Kshatriya","Vaishya","Shudra","Brahmin"];
export const VASHYA_OF_SIGN = ["Chatushpada","Chatushpada","Manava","Jalachara","Vanachara","Manava",
  "Manava","Keeta","Manava","Jalachara","Manava","Jalachara"];
export const YONI_OF = ["horse","elephant","sheep","serpent","serpent","dog","cat","sheep","cat",
  "rat","rat","cow","buffalo","tiger","buffalo","tiger","deer","deer","dog",
  "monkey","mongoose","monkey","lion","horse","lion","cow","elephant"];
export const GANA_OF = ["Deva","Manushya","Rakshasa","Manushya","Deva","Manushya","Deva","Deva","Rakshasa",
  "Rakshasa","Manushya","Manushya","Deva","Rakshasa","Deva","Rakshasa","Deva","Rakshasa","Rakshasa",
  "Manushya","Manushya","Deva","Rakshasa","Rakshasa","Manushya","Manushya","Deva"];
export const NADI_OF = ["Adi","Madhya","Antya","Antya","Madhya","Adi","Adi","Madhya","Antya",
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
export const TATVA_OF_SIGN = ["Fire","Earth","Air","Water"];        /* index sign-1 mod 4 */
export const NAME_SYL = [
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
export const YUNJA_OF_NAK = i => i < 9 ? "Adi" : i < 18 ? "Madhya" : "Antya";

const norm = d => ((d % 360) + 360) % 360;
const signOf = L => Math.floor(norm(L) / 30) + 1;
const nakOf = L => Math.floor(norm(L) / (360 / 27));
/* measured from the nakshatra's own start, never via `%` - the binary
   remainder at exact 40° multiples lands in pada 4 instead of 1 */
const padaOf = L => { const Ln = norm(L), n = Math.floor(Ln / (360 / 27) + 1e-9);
  return Math.min(4, Math.floor((Ln - n * (360 / 27)) / (360 / 108) + 1e-9) + 1); };
const nakLord = i => DASHA_ORDER[i % 9];

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
