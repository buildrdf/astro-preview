/* ===================================================================
   NARRATIVE CONTENT
   -------------------------------------------------------------------
   The words of the daily reading, separated from the screens that show
   them (DDR 0003 §6). Editing this file changes what Astra says; it
   cannot change how a screen behaves. The engine that DECIDES which of
   these lines applies stays with the computation, in app.js.
   =================================================================== */

/* which houses each life area is read from - standard significations */
export const AREA_HOUSES={
  Career:      [10,6,3,1],
  Wealth:      [2,11,5],
  Relationships:[7,5,11],
  Wellbeing:   [1,6,8],
  "Inner life":[4,9,12,5]};

export const AREA_LINE={
  Career:"work, standing and what people see you do",
  Wealth:"money, income and what you spend it on",
  Relationships:"partners, family and the people around you",
  Wellbeing:"energy, rest and the body",
  "Inner life":"reflection, learning and what settles you"};

export const TONE_WORD={favourable:"Good",balanced:"Steady",slow:"Slow"};

/* the sentence a person actually wants, per area and verdict - plain
   words in front, the astrology in layers underneath */
export const PLAIN_DAY={
  Career:{favourable:"A good day to push work forward and be seen doing it.",
          balanced:"Work runs on rails today &#8212; keep the routine.",
          slow:"Let work be ordinary today; save the big push."},
  Wealth:{favourable:"A fine day to sort money &#8212; ask, invoice, tidy the accounts.",
          balanced:"Money is quiet. Nothing needs forcing.",
          slow:"Spend lightly and let financial decisions wait a day."},
  Relationships:{favourable:"People are receptive &#8212; reach out, say the thing.",
          balanced:"Company is easy today; nothing needs managing.",
          slow:"Give people room. Keep delicate talks for another day."},
  Wellbeing:{favourable:"Energy is with you &#8212; move, start the habit.",
          balanced:"Energy is even. Keep the routines that hold you.",
          slow:"A rest-first day. Go gently with yourself."},
  "Inner life":{favourable:"A clear-headed day for learning and reflection.",
          balanced:"A quiet-mind day &#8212; small readings, small notes.",
          slow:"Let the mind idle; conclusions can wait."}};

/* the colour of the day follows the vara lord - a widely attested
   weekday tradition, offered as tradition and nothing stronger */
export const VARA_COLOUR={
  Sun:{c:"Copper and gold",why:"Sunday belongs to the Sun"},
  Moon:{c:"White and pearl",why:"Monday belongs to the Moon"},
  Mars:{c:"Red and coral",why:"Tuesday belongs to Mars"},
  Mercury:{c:"Green",why:"Wednesday belongs to Mercury"},
  Jupiter:{c:"Yellow",why:"Thursday belongs to Jupiter"},
  Venus:{c:"White and bright pastels",why:"Friday belongs to Venus"},
  Saturn:{c:"Deep blue and black",why:"Saturday belongs to Saturn"}};

/* number of the day: the weekday lord's classical navagraha number */
export const VARA_NUM={Sun:1,Moon:2,Mars:9,Mercury:5,Jupiter:3,Venus:6,Saturn:8};

/* Rahu Kalam occupies one eighth of daylight, indexed by weekday
   (1-based eighth, the standard table) */
export const RAHU_KALAM_SEGMENT={0:8,1:2,2:7,3:5,4:6,5:4,6:3};

/* ---- DASHA PERIODS ------------------------------------------------
   The season a mahadasha lord traditionally sets, and the colouring an
   antardasha lord lays over it. Composed with the person's real chart
   facts in app.js - never printed as bare fortune-telling. */
export const DASHA_THEME={
  Sun:"Sun periods are traditionally read as years of definition &#8212; authority, visibility and the slow clarifying of who you are when people are watching. Work tends to move toward the centre of life, and recognition matters more than it used to.",
  Moon:"Moon periods are traditionally read as years lived close to the skin &#8212; home, family, feeling and belonging come forward, and life is steered more by tides than by plans. Care, rest and the people who feel like harbour set the tone.",
  Mars:"Mars periods are traditionally read as years of drive &#8212; effort, competition, property and physical energy. Things move fast when they move; the classical advice is to give the heat somewhere useful to go.",
  Mercury:"Mercury periods are traditionally read as years of exchange &#8212; learning, trade, writing, networks and quick adaptation. Skills sharpen and doors open through conversation rather than force.",
  Jupiter:"Jupiter periods are traditionally read as expansive years &#8212; teachers, faith, children, growth and luck that arrives looking like good judgement. What you believe in tends to grow, so the tradition asks you to choose it carefully.",
  Venus:"Venus periods are traditionally read as years of relationship and refinement &#8212; partnership, beauty, comfort, art and the pleasures of a settled life. What you love takes the wheel.",
  Saturn:"Saturn periods are traditionally read as the great structural years &#8212; discipline, duty, endurance and work that compounds slowly. The tradition regards them as demanding, and reads what they build as built to last.",
  Rahu:"Rahu periods are traditionally read as years of appetite &#8212; ambition, foreign ground, unconventional routes and a hunger for what is just out of reach. They can carry you far; the classical caution is to check the map while moving.",
  Ketu:"Ketu periods are traditionally read as years of release &#8212; insight, detachment, spiritual pull and the quiet dismantling of what no longer fits. Less is gained than clarified."};

export const ANTAR_FLAVOR={
  Sun:"brings matters of standing and direction to a head",
  Moon:"softens the stretch toward feeling, home and rest",
  Mars:"quickens it &#8212; effort, urgency and courage rise",
  Mercury:"turns it toward talk, trade, study and paperwork",
  Jupiter:"opens it out &#8212; growth, guidance and opportunity",
  Venus:"sweetens it &#8212; relationship, comfort and taste lead",
  Saturn:"slows and tests it &#8212; patient work is favoured",
  Rahu:"amplifies it &#8212; ambition and unusual routes call",
  Ketu:"loosens it &#8212; endings, insight and simplification"};

/* ---- MANTRAS -------------------------------------------------------
   The classical navagraha namah mantras only - simple, universally
   attested salutations (the constitution forbids invented Sanskrit).
   Devanagari, transliteration, and plain meaning. */
export const MANTRA={
  Sun:{dev:"ॐ सूर्याय नमः",tr:"Om Suryaya Namah",en:"Salutations to Surya, the Sun"},
  Moon:{dev:"ॐ चन्द्राय नमः",tr:"Om Chandraya Namah",en:"Salutations to Chandra, the Moon"},
  Mars:{dev:"ॐ अङ्गारकाय नमः",tr:"Om Angarakaya Namah",en:"Salutations to Angaraka, Mars"},
  Mercury:{dev:"ॐ बुधाय नमः",tr:"Om Budhaya Namah",en:"Salutations to Budha, Mercury"},
  Jupiter:{dev:"ॐ बृहस्पतये नमः",tr:"Om Brihaspataye Namah",en:"Salutations to Brihaspati, Jupiter"},
  Venus:{dev:"ॐ शुक्राय नमः",tr:"Om Shukraya Namah",en:"Salutations to Shukra, Venus"},
  Saturn:{dev:"ॐ शनैश्चराय नमः",tr:"Om Shanaishcharaya Namah",en:"Salutations to Shanaishchara, Saturn"},
  Rahu:{dev:"ॐ राहवे नमः",tr:"Om Rahave Namah",en:"Salutations to Rahu"},
  Ketu:{dev:"ॐ केतवे नमः",tr:"Om Ketave Namah",en:"Salutations to Ketu"}};
