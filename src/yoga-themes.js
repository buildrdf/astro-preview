/* ===================================================================
   YOGA THEMES (src/yoga-themes.js)
   -------------------------------------------------------------------
   Three or four words per yoga, for the face of a carousel card.

   This is the shortest surface in the whole feature and the easiest to
   get wrong, so two rules hold it:

   1. It says what the TRADITION associates with the combination, never
      what will happen. "Intellect · expression · visibility", never
      "you will be famous". The card is a label on a pattern, not a
      prediction (§143).

   2. `tone` is not good-versus-bad. A yoga classical texts treat as
      demanding is marked "demanding", and the copy around it stays
      neutral: Kemadruma is an affliction the tradition also gives
      several cancellations for, and Sakata is a rhythm, not a curse.
      Nothing here gets a red badge or an alarming word (§76, §58).

   Content only — no logic. Kept out of app.js and out of the engine so
   the words can be edited without touching either.
   =================================================================== */

/** @typedef {{words:string, tone:"supportive"|"demanding"|"mixed"}} Theme */

export const YOGA_THEME = {
  /* --- Sun and Moon combinations --- */
  "Budha-Aditya Yoga": { words: "Intellect · expression · visibility", tone: "supportive" },
  "Gajakesari Yoga": { words: "Judgement · standing · good counsel", tone: "supportive" },
  "Chandra-Mangala Yoga": { words: "Drive · earning · restlessness", tone: "mixed" },

  /* --- the Moon's companions --- */
  "Sunapha Yoga": { words: "Self-made resources · steadiness", tone: "supportive" },
  "Anapha Yoga": { words: "Bearing · health · a settled mind", tone: "supportive" },
  "Durudhara Yoga": { words: "Support on both sides · balance", tone: "supportive" },
  "Kemadruma Yoga": { words: "The mind standing alone", tone: "demanding" },

  /* --- the Sun's companions --- */
  "Vesi Yoga": { words: "Steady speech · even temper", tone: "supportive" },
  "Vosi Yoga": { words: "Capability · movement · reputation", tone: "supportive" },
  "Ubhayachari Yoga": { words: "Company on both sides · standing", tone: "supportive" },

  /* --- benefic placement --- */
  "Adhi Yoga": { words: "Steadiness · trusted position", tone: "supportive" },
  "Vasumathi Yoga": { words: "Accumulation · resourcefulness", tone: "supportive" },
  "Amala Yoga": { words: "Clean reputation · fair dealing", tone: "supportive" },
  "Lakshmi Yoga": { words: "Fortune · standing · grace", tone: "supportive" },
  "Saraswati Yoga": { words: "Learning · art · expression", tone: "supportive" },
  "Parvata Yoga": { words: "Standing · openness · good fortune", tone: "supportive" },
  "Bheri Yoga": { words: "Long reach · comfort · steadiness", tone: "supportive" },
  "Kahala Yoga": { words: "Energy · initiative · enterprise", tone: "supportive" },

  /* --- lordship and exchange --- */
  "Raja Yoga (Kendra-Trikona)": { words: "Authority · opportunity · rise", tone: "supportive" },
  "Parivartana Yoga (Maha)": { words: "Two areas of life feeding each other", tone: "supportive" },
  "Parivartana Yoga (Khala)": { words: "Effort exchanged for gain", tone: "mixed" },
  "Parivartana Yoga (Dainya)": { words: "A demanding trade between two areas", tone: "demanding" },
  "Neecha Bhanga Raja Yoga": { words: "A weakness lifted · late strength", tone: "supportive" },
  "Sakata Yoga": { words: "Rise and fall in turn · a rhythm", tone: "mixed" },

  /* --- the five Mahapurusha --- */
  "Ruchaka Yoga": { words: "Courage · command · physical force", tone: "supportive" },
  "Bhadra Yoga": { words: "Intelligence · speech · adaptability", tone: "supportive" },
  "Hamsa Yoga": { words: "Wisdom · principle · respect", tone: "supportive" },
  "Malavya Yoga": { words: "Refinement · comfort · attraction", tone: "supportive" },
  "Sasa Yoga": { words: "Discipline · endurance · authority", tone: "supportive" },
};

/* Falls back on the structural shape rather than inventing a theme for a
   yoga nobody has written words for yet — an honest generic beats a
   confident wrong one. */
const BY_SHAPE = {
  "conjunction": "Two grahas working as one",
  "relative-to-moon": "A companion to the Moon",
  "relative-geometry": "A relationship across the chart",
  "exchange": "Two areas of life feeding each other",
  "lordship-web": "Lords of angle and trine joined",
  "dignity-kendra": "A graha at full strength in an angle",
  "cancellation": "A weakness lifted",
};

export function themeOf(y) {
  const t = YOGA_THEME[y.name];
  if (t) return t;
  const shape = y.formation && y.formation.shape;
  return { words: BY_SHAPE[shape] || "A named pattern in your chart", tone: "mixed" };
}
