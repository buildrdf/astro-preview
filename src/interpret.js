/* ===================================================================
   INTERPRETATION LIBRARY
   -------------------------------------------------------------------
   Phrases for the daily-reading engine. Nothing here calculates:
   the engine computes positions and picks sentences from these
   tables. Every line is hedged the way CLAUDE.md 51/143 requires -
   "traditionally associated with", never a promised outcome - and
   every difficult placement is framed as pace and care, never fear.
   Sanskrit follows plain English, and only universally attested
   material appears (standard Parashari significations, standard
   navagraha namah mantras, widely documented weekday practices).
   =================================================================== */

export const GRAHA_MEANING = {
  Sun: {
    is: "the self, vitality and authority",
    body: "The Sun stands for who you are when nobody is directing you &#8212; your core, your health, your father, your relationship to authority. Where it sits in a chart is traditionally read as where you need to be seen, and where being overlooked stings most."
  },
  Moon: {
    is: "the mind, mood and memory",
    body: "The Moon is how you actually feel, as against how you present. It stands for the mind, the mother, memory and the need for comfort. Vedic astrology reads more from the Moon than almost anything else &#8212; the daily reading is largely a reading of where the Moon is now against where it was when you were born."
  },
  Mars: {
    is: "drive, courage and conflict",
    body: "Mars is the will to act &#8212; energy, nerve, competition, and the capacity to cut through. It also stands for younger siblings, land and machinery. A strong Mars is traditionally read as decisiveness; the same placement under pressure can read as haste."
  },
  Mercury: {
    is: "intellect, speech and commerce",
    body: "Mercury is how you process and transmit &#8212; thinking, talking, writing, counting, trading. It stands for learning, wit and the marketplace. Its house shows where words and numbers do your heaviest lifting."
  },
  Jupiter: {
    is: "wisdom, growth and grace",
    body: "Jupiter enlarges whatever it touches. It stands for teachers, children, wealth, faith and good counsel. Traditionally the most generous of the nine, its house is read as where life tends to give you more than you strictly earned."
  },
  Venus: {
    is: "love, beauty and value",
    body: "Venus is what you are drawn toward &#8212; partnership, pleasure, art, comfort and taste. It stands for the spouse, vehicles and the sweetness of life. Its house is traditionally read as where you know, without being told, what is beautiful."
  },
  Saturn: {
    is: "time, discipline and endurance",
    body: "Saturn is the slowest of the visible planets, and it stands for what only time can build: structure, patience, duty, and the rewards of sustained work. It withholds first and pays later. Its house is traditionally read as where life asks you to grow up &#8212; and where you eventually become hardest to shake."
  },
  Rahu: {
    is: "appetite, obsession and the foreign",
    body: "Rahu is not a body but a point &#8212; the north node of the Moon, where eclipses happen. It stands for hunger without a natural limit: ambition, novelty, foreign things, and whatever you cannot stop wanting. Traditions differ on Rahu more than on any other graha, and this app says so rather than papering over it."
  },
  Ketu: {
    is: "detachment, release and past mastery",
    body: "Ketu is the south node, Rahu's opposite point. It stands for what you already carry &#8212; skills that feel inborn, and the parts of life you find easy to walk away from. Its house is traditionally read as a place of quiet competence and low appetite, which can look like indifference from outside."
  }
};

export const GOCHARA_FEEL = {
  Sun: {
    fav: "A well-placed Sun transit is traditionally associated with visibility, recognition and a clearer sense of direction.",
    unfav: "A less supported Sun transit asks you to hold your standing lightly and not force the spotlight."
  },
  Moon: {
    fav: "A well-placed Moon transit is traditionally associated with ease of mood and days that simply flow.",
    unfav: "A less supported Moon transit asks for gentleness with yourself &#8212; feelings may run closer to the surface than usual."
  },
  Mars: {
    fav: "A well-placed Mars transit is traditionally associated with energy, courage and the momentum to finish what you start.",
    unfav: "A less supported Mars transit asks you to slow your reactions and let small frictions pass without a reply."
  },
  Mercury: {
    fav: "A well-placed Mercury transit is traditionally associated with clear thinking, easy conversation and paperwork that cooperates.",
    unfav: "A less supported Mercury transit asks you to read things twice and say the important thing plainly."
  },
  Jupiter: {
    fav: "A well-placed Jupiter transit is traditionally associated with growth, good counsel and doors that open with little pushing.",
    unfav: "A less supported Jupiter transit asks for realism about promises &#8212; your own and other people's."
  },
  Venus: {
    fav: "A well-placed Venus transit is traditionally associated with warmth, pleasure and things simply looking better.",
    unfav: "A less supported Venus transit asks you to enjoy quietly rather than indulge, and to keep comfort spending modest."
  },
  Saturn: {
    fav: "A well-placed Saturn transit is traditionally associated with steady progress &#8212; slow, but the kind that stays built.",
    unfav: "A less supported Saturn transit asks for patience: this is a stretch for maintaining, not launching."
  },
  Rahu: {
    fav: "A well-placed Rahu transit is traditionally associated with bold appetite paying off, often through something unconventional.",
    unfav: "A less supported Rahu transit asks you to check the wanting before acting on it &#8212; sleep on the big desires."
  },
  Ketu: {
    fav: "A well-placed Ketu transit is traditionally associated with clean detachment &#8212; letting go of the right things at the right time.",
    unfav: "A less supported Ketu transit asks you not to mistake tiredness for indifference; rest before renouncing."
  }
};

export const HOUSE_TRANSIT_SENSE = {
  1: "how you feel in your own skin, and the impression you are making",
  2: "money in and out, and the weight your words carry",
  3: "your nerve &#8212; initiative, messages, short trips and siblings",
  4: "home, family and whether you feel settled where you are",
  5: "what you are making &#8212; creativity, romance, children and play",
  6: "the daily grind &#8212; work pressure, routines, health habits and rivals",
  7: "the people opposite you &#8212; your partner, and the deals on the table",
  8: "shared money, private matters, and things surfacing unannounced",
  9: "the bigger picture &#8212; belief, teachers, travel and luck",
  10: "your work and standing &#8212; what people can see you doing",
  11: "gains &#8212; income, friends, and efforts starting to pay off",
  12: "letting go &#8212; rest, solitude, expenses and quiet closure"
};

export const SPECIAL = {
  sadeSati: {
    name: "Sade Sati",
    body: "Sade Sati is the stretch when Saturn transits the 12th, 1st and 2nd houses from your natal Moon &#8212; roughly seven and a half years in all. It has a fearsome reputation it does not entirely deserve. The tradition reads it as a maturing period: things that were loosely held get tested, and what survives tends to be more solid afterwards. Schools differ on how strongly to weigh it, and many hold that its middle phase asks the most patience."
  },
  chandrashtama: {
    name: "Chandrashtama",
    body: "Today the Moon crosses the 8th house from your natal Moon &#8212; a named low-energy day in the tradition, and only that. It is traditionally read as a day when reserves run shallower than usual. Rest over launch; let today be quiet and let tomorrow do the starting."
  },
  jupiterReturn: {
    name: "Jupiter return",
    body: "Jupiter has come back to the sign it occupied when you were born, something it does roughly every twelve years. The tradition reads this as the opening of a growth chapter &#8212; a good stretch for study, mentors, and beginnings you want to still matter a decade from now."
  },
  saturnReturn: {
    name: "Saturn return",
    body: "Saturn has returned to its birth sign, which happens roughly every twenty-nine years. The tradition reads this as a restructuring chapter: what you have outgrown tends to be dismantled so that what fits can be built in its place."
  }
};

export const DAY_DO = {
  good: [
    "Start the conversation you have been putting off.",
    "Send the thing that is ready enough.",
    "Ask &#8212; for the meeting, the favour, the price.",
    "Say yes to the invitation you were wavering on.",
    "Put the first hour into whatever matters most.",
    "Make the introduction two people have been waiting for."
  ],
  mixed: [
    "Move one thing forward rather than six.",
    "Have the ordinary conversations; save the delicate one.",
    "Clear the small obligations that have been accumulating.",
    "Prepare the ground for what you plan to start later.",
    "Check in with someone you have been meaning to reach."
  ],
  slow: [
    "Finish rather than start.",
    "Tidy one corner &#8212; a desk, an inbox, a drawer.",
    "Listen more than you speak.",
    "Rest without treating rest as falling behind.",
    "Reread before you reply.",
    "Let something end quietly that has been ending anyway."
  ]
};

export const DAY_AVOID = {
  good: [
    "Even so, big irreversible decisions keep till you have slept on them.",
    "Momentum is not a reason to overcommit the calendar.",
    "A good day is still a poor time to say everything you think."
  ],
  mixed: [
    "Reading too much into a level day &#8212; it is simply level.",
    "Forcing an outcome that would arrive on its own by Friday.",
    "Signing anything you have not read twice."
  ],
  slow: [
    "Launching something new just to feel productive &#8212; it can wait.",
    "Difficult conversations that can honestly wait a day.",
    "Judging your whole situation by how today feels."
  ]
};

export const VARA_PRACTICE = {
  Sun: {
    day: "Sunday",
    practice: "Offering water to the rising sun &#8212; surya arghya &#8212; is one of the most widely documented daily practices in the tradition: water poured from a small vessel toward the morning sun. The navagraha mantra Om Suryaya Namah is traditionally recited. Failing either, a few quiet minutes facing the morning light serves the same spirit."
  },
  Moon: {
    day: "Monday",
    practice: "Monday is traditionally kept simple: light eating, and an evening quiet enough to actually notice the Moon. Many observe a partial fast; the mantra Om Chandraya Namah is traditionally recited. A plainer version &#8212; step outside after dark and find the Moon &#8212; loses nothing essential."
  },
  Mars: {
    day: "Tuesday",
    practice: "Tuesday is widely associated with Hanuman, and visiting a Hanuman temple on this day is a long-documented custom. In behavioural terms the day suits physical effort and deliberate restraint from argument &#8212; spending Mars rather than being spent by it. The mantra Om Angarakaya Namah is traditionally recited."
  },
  Mercury: {
    day: "Wednesday",
    practice: "Wednesday traditionally favours Mercury's own work: study, writing, accounts, and tidying whatever involves words or numbers. Giving green gram or fresh greens in charity is a widely documented observance. The mantra Om Budhaya Namah is traditionally recited."
  },
  Jupiter: {
    day: "Thursday",
    practice: "Thursday is Guruvara &#8212; the teacher's day. Honouring a teacher, in person or by message, is the most portable of its traditional observances; charity of yellow foods such as chana dal or turmeric is widely documented. The mantra Om Brihaspataye Namah is traditionally recited."
  },
  Venus: {
    day: "Friday",
    practice: "Friday is widely associated with Lakshmi, and keeping the home clean and welcoming on this day is a long-documented custom. The day traditionally suits art, music and small acts of beauty &#8212; making something pleasing rather than merely consuming it. The mantra Om Shukraya Namah is traditionally recited."
  },
  Saturn: {
    day: "Saturday",
    practice: "Saturday's most widely documented observances are practical: charity to labourers and those who work hard for little, and lighting a sesame-oil lamp for Shani in the evening. Finishing a neglected duty is very much in the day's spirit. The mantra Om Shanaishcharaya Namah is traditionally recited."
  }
};

export const PLANET_STORY = {
  Sun: {
    opener: "Every chart has exactly one Sun, and its house answers a simple question: where do you need to shine to feel like yourself? The tradition treats it as the king of the nine &#8212; wherever it sits, that part of life refuses to stay in the background.",
    inHouse: {
      1: "The Sun in the 1st is traditionally read as a presence people notice before you have said anything &#8212; identity worn openly.",
      2: "The Sun in the 2nd is traditionally read as pride invested in what you earn and how you speak &#8212; a voice with authority in it.",
      3: "The Sun in the 3rd is traditionally read as courage that likes an audience &#8212; initiative, bold messages, the confident first move.",
      4: "The Sun in the 4th is traditionally read as a need to be somebody at home, not just in the world &#8212; the household as a small kingdom.",
      5: "The Sun in the 5th is traditionally read as creativity central to identity &#8212; what you make carries your name whether you sign it or not.",
      6: "The Sun in the 6th is traditionally read as vitality that sharpens under pressure &#8212; a self built by overcoming rather than by ease.",
      7: "The Sun in the 7th is traditionally read as identity worked out through partnership &#8212; strong partners attract you, and the balance of the spotlight takes practice.",
      8: "The Sun in the 8th is traditionally read as a self that keeps its centre private &#8212; depth over display, and strength drawn from what others avoid.",
      9: "The Sun in the 9th is traditionally read as identity anchored in belief &#8212; the father, teachers and philosophy loom large in who you become.",
      10: "The Sun in the 10th is traditionally read as one of its happiest seats &#8212; ambition in plain view, and a pull toward public responsibility.",
      11: "The Sun in the 11th is traditionally read as shining through networks and shared ambitions &#8212; a natural centre of gravity among friends.",
      12: "The Sun in the 12th is traditionally read as a self most itself in solitude &#8212; recognition matters less than what happens away from the room."
    }
  },
  Moon: {
    opener: "In Vedic astrology the Moon nearly outranks the Sun: it is the mind itself, and a whole layer of the tradition is counted from wherever yours sits. Its house shows what your feelings orbit &#8212; what you reach for when nobody is watching.",
    inHouse: {
      1: "The Moon in the 1st is traditionally read as feelings that show on your face &#8212; a mood the room can read, and a nature that responds to everything.",
      2: "The Moon in the 2nd is traditionally read as security felt through savings and family &#8212; comfort measured in what is stored up.",
      3: "The Moon in the 3rd is traditionally read as an emotional need to reach out &#8212; the mind steadies itself by writing, calling, moving.",
      4: "The Moon in the 4th is traditionally read as its own home ground &#8212; a deep tie to mother, place and the room where you can finally exhale.",
      5: "The Moon in the 5th is traditionally read as a mind that feels through making &#8212; romance, children and creative work sit close to the heart.",
      6: "The Moon in the 6th is traditionally read as feelings processed through work and routine &#8212; caring expressed as fixing, and rest needing to be scheduled.",
      7: "The Moon in the 7th is traditionally read as a mind that settles in company &#8212; moods mirror the partner, and being alone takes deliberate practice.",
      8: "The Moon in the 8th is traditionally read as a deep-running emotional life &#8212; feelings arrive in tides, and privacy is not secrecy but shelter.",
      9: "The Moon in the 9th is traditionally read as comfort found in meaning &#8212; a mind fed by teachers, travel and the long view.",
      10: "The Moon in the 10th is traditionally read as feelings tied to reputation &#8212; the public sees your care, and your standing colours your mood.",
      11: "The Moon in the 11th is traditionally read as nourishment through friendship &#8212; a wide circle, and hopes that genuinely lift the spirits.",
      12: "The Moon in the 12th is traditionally read as an inward mind &#8212; rich dreams, a need for retreat, and an emotional life larger than it looks."
    }
  },
  Mars: {
    opener: "Mars is the chart's supply of nerve &#8212; the willingness to push, compete and cut through. Its house shows where you fight, and the tradition is even-handed about it: the same heat that wins battles can start them.",
    inHouse: {
      1: "Mars in the 1st is traditionally read as energy leading the way &#8212; a direct manner, quick reflexes, and patience as the acquired skill.",
      2: "Mars in the 2nd is traditionally read as drive applied to earning and blunt force in speech &#8212; words that land harder than intended.",
      3: "Mars in the 3rd is traditionally read as one of its strong seats &#8212; raw nerve, competitive siblings, and initiative that does not wait for permission.",
      4: "Mars in the 4th is traditionally read as heat in the home &#8212; energy for property and renovation, and a hearth that is rarely entirely calm.",
      5: "Mars in the 5th is traditionally read as passion in play &#8212; bold creative swings, ardent romance, and a competitive streak in games of every kind.",
      6: "Mars in the 6th is traditionally read as a fighter placed among the fights &#8212; obstacles, rivals and hard routines tend to lose to this placement.",
      7: "Mars in the 7th is traditionally read as heat brought into partnership &#8212; attraction to strong-willed people, and sparks that need honest handling.",
      8: "Mars in the 8th is traditionally read as force applied to the hidden &#8212; courage in crisis, an instinct for research, and energy that surges rather than flows.",
      9: "Mars in the 9th is traditionally read as conviction with muscle &#8212; beliefs defended vigorously, and a taste for the strenuous pilgrimage over the easy one.",
      10: "Mars in the 10th is traditionally read as ambition in motion &#8212; a career built by doing, and authority earned through visible effort.",
      11: "Mars in the 11th is traditionally read as drive pointed at gains &#8212; energetic friends, competitive networks, and goals pursued at pace.",
      12: "Mars in the 12th is traditionally read as force turned inward or abroad &#8212; energy that needs a private outlet, and battles best fought quietly."
    }
  },
  Mercury: {
    opener: "Mercury is the fastest planet and the chart's translator &#8212; everything that involves words, numbers and quick connections runs through it. Its house shows where your mind does its best trading.",
    inHouse: {
      1: "Mercury in the 1st is traditionally read as wit worn on the surface &#8212; a quick tongue, a youthful air, and thinking out loud.",
      2: "Mercury in the 2nd is traditionally read as a head for money and a gift for phrasing &#8212; earning through words, numbers or both.",
      3: "Mercury in the 3rd is traditionally read as its home territory of messages and movement &#8212; a natural writer, caller, connector and courier of ideas.",
      4: "Mercury in the 4th is traditionally read as a mind that works from home &#8212; books in the house, and thinking that needs a settled base.",
      5: "Mercury in the 5th is traditionally read as playful intelligence &#8212; wordgames, clever creations, and learning treated as entertainment.",
      6: "Mercury in the 6th is traditionally read as analysis put to work &#8212; a problem-solver's placement, happiest untangling what others find tedious.",
      7: "Mercury in the 7th is traditionally read as partnership through conversation &#8212; drawn to clever company, and at its best negotiating.",
      8: "Mercury in the 8th is traditionally read as a mind for what is beneath the surface &#8212; research, other people's money, and questions most do not think to ask.",
      9: "Mercury in the 9th is traditionally read as the student's placement &#8212; languages, philosophy and far places absorbed with ease.",
      10: "Mercury in the 10th is traditionally read as a career carried by communication &#8212; known for what you write, say, count or connect.",
      11: "Mercury in the 11th is traditionally read as a networked mind &#8212; wide circles, many conversations, and gains arriving through information.",
      12: "Mercury in the 12th is traditionally read as a quiet intellect &#8212; the mind at its sharpest in solitude, and thoughts that prefer the page to the room."
    }
  },
  Jupiter: {
    opener: "Jupiter is the great benefic &#8212; the planet of more. Whichever house holds it is traditionally where life is generous with you, and where you in turn find it easiest to be generous.",
    inHouse: {
      1: "Jupiter in the 1st is traditionally read as optimism built into the personality &#8212; a broad outlook, and a presence people trust on sight.",
      2: "Jupiter in the 2nd is traditionally read as expansion of wealth and speech &#8212; resources that grow, and words that carry weight kindly.",
      3: "Jupiter in the 3rd is traditionally read as courage guided by wisdom &#8212; generous with siblings, and initiative taken for good reasons.",
      4: "Jupiter in the 4th is traditionally read as abundance at home &#8212; a full house, comfort that expands, and peace treated as wealth.",
      5: "Jupiter in the 5th is traditionally read as one of its most celebrated seats &#8212; blessings around children, learning and creations that grow beyond you.",
      6: "Jupiter in the 6th is traditionally read as grace inside the grind &#8212; obstacles that shrink on approach, and service done with an open hand.",
      7: "Jupiter in the 7th is traditionally read as fortune through partnership &#8212; a generous spouse or partner, and growth arriving in pairs.",
      8: "Jupiter in the 8th is traditionally read as protection in deep water &#8212; ease with inheritance and shared resources, and wisdom drawn from what transforms.",
      9: "Jupiter in the 9th is traditionally read as its own house and one of the chart's luckiest marks &#8212; faith, teachers and fortune working in concert.",
      10: "Jupiter in the 10th is traditionally read as a career with a conscience &#8212; standing built on counsel, teaching or judgment, and reputation that compounds.",
      11: "Jupiter in the 11th is traditionally read as the classic placement for gains &#8212; wide networks, well-placed friends, and ambitions that tend to land.",
      12: "Jupiter in the 12th is traditionally read as generosity turned inward &#8212; giving quietly, spending freely, and finding wealth in retreat and release."
    }
  },
  Venus: {
    opener: "Venus is the planet of what delights you &#8212; love, art, comfort and taste. Its house is traditionally where life is at its most pleasant, and where you have an eye others lack.",
    inHouse: {
      1: "Venus in the 1st is traditionally read as charm as a first language &#8212; grace in manner, care in appearance, and rooms that soften on your arrival.",
      2: "Venus in the 2nd is traditionally read as a taste for the good things and the means to fund them &#8212; a sweet voice, and money spent beautifully.",
      3: "Venus in the 3rd is traditionally read as artistry in the everyday &#8212; graceful writing, warm messages, and courage exercised with tact.",
      4: "Venus in the 4th is traditionally read as beauty at home &#8212; comfortable rooms, good vehicles, and domestic life as a source of genuine pleasure.",
      5: "Venus in the 5th is traditionally read as romance and art in their natural element &#8212; love affairs, creative gifts, and play taken seriously.",
      6: "Venus in the 6th is traditionally read as devotion expressed through service &#8212; love shown by doing, and pleasure that must share space with duty.",
      7: "Venus in the 7th is traditionally read as its own house &#8212; partnership as a central life theme, and a marked gift for making relationships work.",
      8: "Venus in the 8th is traditionally read as attraction to depth &#8212; intense bonds, benefit through shared resources, and beauty found in the mysterious.",
      9: "Venus in the 9th is traditionally read as love of the far and the wise &#8212; beauty in philosophy, fortune through travel, and partners from other worlds than yours.",
      10: "Venus in the 10th is traditionally read as charm in public &#8212; a career touched by art or diplomacy, and a reputation for being pleasant to deal with.",
      11: "Venus in the 11th is traditionally read as sweetness in the network &#8212; affectionate friendships, social gains, and wishes that tend to be granted.",
      12: "Venus in the 12th is traditionally read as one of its quietly favoured seats &#8212; private pleasures, comfort in seclusion, and love that flourishes away from view."
    }
  },
  Saturn: {
    opener: "Saturn is the slowest of the classical planets, and the tradition calls it the great teacher. Its house is where life makes you wait &#8212; and where, after the waiting, you end up more solid than anyone else in the room.",
    inHouse: {
      1: "Saturn in the 1st is traditionally read as gravity in the personality &#8212; a serious bearing, slow warming, and a self built layer by patient layer.",
      2: "Saturn in the 2nd is traditionally read as wealth accumulated the slow way &#8212; careful speech, careful savings, and value that takes years to show.",
      3: "Saturn in the 3rd is traditionally read as one of its strong seats &#8212; courage of the enduring kind, and effort sustained long after others stop.",
      4: "Saturn in the 4th is traditionally read as duty at the foundations &#8212; responsibility for home and family, and comfort that must be built rather than inherited.",
      5: "Saturn in the 5th is traditionally read as seriousness where others play &#8212; disciplined creativity, late-blooming joys, and love that takes its time.",
      6: "Saturn in the 6th is traditionally read as the disciplined worker's placement &#8212; routines mastered, rivals outlasted, and obstacles ground down by persistence.",
      7: "Saturn in the 7th is traditionally read as commitment taken seriously &#8212; partnerships that mature slowly, and bonds valued for their durability.",
      8: "Saturn in the 8th is traditionally read as endurance in the deep &#8212; a long life in the classical reading, and stability found where others find only change.",
      9: "Saturn in the 9th is traditionally read as faith tested into strength &#8212; beliefs earned rather than inherited, and wisdom from hard teachers.",
      10: "Saturn in the 10th is traditionally read as its own natural house &#8212; a career built brick by brick, and authority that arrives late but stays.",
      11: "Saturn in the 11th is traditionally read as slow but sure gains &#8212; fewer friends, older friends, and income that grows steadily once established.",
      12: "Saturn in the 12th is traditionally read as discipline in solitude &#8212; comfort with being alone, structured letting-go, and work done far from applause."
    }
  },
  Rahu: {
    opener: "Rahu is not a planet but a point &#8212; the lunar node where eclipses occur &#8212; and the tradition treats it as pure appetite. Its house shows what you hunger for beyond reason, and where this life keeps pulling you toward the unfamiliar.",
    inHouse: {
      1: "Rahu in the 1st is traditionally read as an outsized hunger to be someone &#8212; an unusual persona, and an identity that keeps reinventing itself.",
      2: "Rahu in the 2nd is traditionally read as appetite for wealth and an unconventional voice &#8212; money desired intensely, and earned in unusual ways.",
      3: "Rahu in the 3rd is traditionally read as one of its favoured seats &#8212; audacity beyond the ordinary, and communication that breaks formats.",
      4: "Rahu in the 4th is traditionally read as restlessness at the root &#8212; homes far from origins, and a search for a peace that keeps moving.",
      5: "Rahu in the 5th is traditionally read as unconventional creativity and intense romance &#8212; an appetite for what has never been made before.",
      6: "Rahu in the 6th is traditionally read as strength against opposition &#8212; unusual rivals defeated by unusual means, and outsized capacity for hard problems.",
      7: "Rahu in the 7th is traditionally read as fascination with the other &#8212; partners unlike yourself, often from far away, and partnership as an adventure.",
      8: "Rahu in the 8th is traditionally read as hunger for the hidden &#8212; drawn to mysteries, research and transformation, rarely content with surfaces.",
      9: "Rahu in the 9th is traditionally read as belief off the beaten path &#8212; foreign philosophies, self-taught convictions, and gurus found in unlikely places.",
      10: "Rahu in the 10th is traditionally read as ambition without a ceiling &#8212; an unconventional career, and a hunger for standing that drives real climbing.",
      11: "Rahu in the 11th is traditionally read as one of its most productive seats &#8212; enormous appetite for gains, vast networks, and desires that scale.",
      12: "Rahu in the 12th is traditionally read as appetite for the beyond &#8212; foreign lands, dissolving boundaries, and expenses that follow fascinations."
    }
  },
  Ketu: {
    opener: "Ketu is Rahu's opposite point &#8212; the south node &#8212; and the tradition reads it as what you have already mastered and are half-finished wanting. Its house shows where you carry skill without hunger, and detachment that others mistake for distance.",
    inHouse: {
      1: "Ketu in the 1st is traditionally read as a light grip on identity &#8212; hard to pin down, spiritually inclined, and least interested in your own image.",
      2: "Ketu in the 2nd is traditionally read as detachment from accumulation &#8212; money held loosely, and speech that is spare but cuts to the point.",
      3: "Ketu in the 3rd is traditionally read as effortless nerve &#8212; courage without the need to display it, and little appetite for small talk.",
      4: "Ketu in the 4th is traditionally read as a loose anchor to home &#8212; comfort found within rather than in place, and roots worn lightly.",
      5: "Ketu in the 5th is traditionally read as inborn creative instinct &#8212; talent that feels remembered rather than learned, held with unusual detachment.",
      6: "Ketu in the 6th is traditionally read as quiet mastery of difficulty &#8212; obstacles dissolved without drama, and rivals who find nothing to grip.",
      7: "Ketu in the 7th is traditionally read as detachment inside partnership &#8212; needing a bond that leaves room for solitude, and a spouse who understands silence.",
      8: "Ketu in the 8th is traditionally read as native ease with depth &#8212; unafraid of endings, and intuitive about what others find unfathomable.",
      9: "Ketu in the 9th is traditionally read as faith beyond doctrine &#8212; inherited beliefs questioned, and meaning sought firsthand rather than received.",
      10: "Ketu in the 10th is traditionally read as ambivalence about standing &#8212; capable in career but unmoved by titles, working for the work itself.",
      11: "Ketu in the 11th is traditionally read as few but deep friendships &#8212; indifference to the crowd, and gains that arrive unchased.",
      12: "Ketu in the 12th is traditionally read as its most natural seat &#8212; a pull toward retreat, release and liberation, at home in what most people flee."
    }
  }
};
