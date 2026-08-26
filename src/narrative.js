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
