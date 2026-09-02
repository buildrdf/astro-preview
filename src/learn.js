/* ---- LEARN CURRICULUM -------------------------------------------
   Three levels, eighteen topics. The app should leave someone more
   knowledgeable than it found them (CLAUDE.md 39, 146).
   Voice: plain English first, Sanskrit second, hedged always. */

export const LEARN_LEVELS = [

/* ================= BEGINNER ================= */
{ level:"Beginner", tag:"Start here",
  intro:"Everything you need to look at your own chart and know what you are seeing.",
  topics:[

{ id:"what-is-a-kundali", title:"What is a Kundali?",
  one:"A photograph of the sky, taken at your birth", read:"3 min",
  sections:[
    {h:"A moment, frozen"},
    {p:"A Kundali is not a prediction. It is a record &#8212; the position of the Sun, Moon and planets at the exact minute you were born, seen from the exact place you were born. Change either, and the chart changes."},
    {graphic:"chart-anatomy"},
    {p:"Everything else in Vedic astrology &#8212; houses, dashas, transits &#8212; is a way of reading that one photograph. The sky keeps moving afterwards, but your chart never does. It is the fixed reference the moving sky is compared against."},
    {term:"Kundali", means:"birth chart &#8212; the map of the sky at your birth moment and place"},
    {h:"Three ingredients"},
    {list:["Date of birth &#8212; sets where the slow planets sit","Time of birth &#8212; sets the rising sign, to within minutes","Place of birth &#8212; sets which part of the sky was overhead"]},
    {p:"This is why birth time matters so much. The date barely changes over a day; the rising sign changes every two hours."},
    {try:"Open Universe. That diamond is your Kundali &#8212; the sky over your birthplace, at your first minute."}
  ]},

{ id:"the-twelve-houses", title:"The twelve houses",
  one:"Twelve areas of life, one chart", read:"5 min",
  sections:[
    {h:"The chart's floor plan"},
    {p:"The chart is cut into twelve slices called houses. Each covers an area of life. They do not move &#8212; house 1 is always the same position on the diamond. What varies from person to person is which sign, and which grahas, occupy each one."},
    {graphic:"houses-wheel"},
    {term:"Bhava", means:"house &#8212; literally a state of being; one of the twelve life areas"},
    {h:"The twelve, in order"},
    {list:[
      "1st &#8212; the self: your body, temperament, and the face you show the world",
      "2nd &#8212; wealth and speech: money, family, food, and the voice you speak in",
      "3rd &#8212; courage: younger siblings, nerve, short journeys",
      "4th &#8212; home: mother, land, vehicles, and where you rest",
      "5th &#8212; creativity: children, romance, intelligence, what you make",
      "6th &#8212; obstacles: work pressure, health routines, debts and rivals",
      "7th &#8212; partnership: spouse, business partners, whoever stands opposite you",
      "8th &#8212; the hidden: shared money, upheaval, things that arrive unannounced",
      "9th &#8212; belief: father, teachers, philosophy, long journeys",
      "10th &#8212; career: work, authority, and the mark you leave publicly",
      "11th &#8212; gains: income, friends, and desires that come good",
      "12th &#8212; release: expenses, solitude, foreign lands, sleep, letting go"]},
    {p:"Houses are also grouped. The kendras (1, 4, 7, 10) are the angles, traditionally read as the strongest positions. The trikonas (1, 5, 9) are the most fortunate. The dusthanas (6, 8, 12) are the demanding ones &#8212; though within Vedic astrology, demanding is not the same as bad. They are where discipline is learned."},
    {try:"Open Universe and tap your 10th house. Whatever sits there is traditionally read as colouring your work and public standing."}
  ]},

{ id:"the-twelve-signs", title:"The twelve signs",
  one:"The backdrop the grahas move against", read:"5 min",
  sections:[
    {h:"Twelve flavours of sky"},
    {p:"The zodiac is a 360&#176; band divided into twelve signs, or rashis, of 30&#176; each. If houses are the rooms of the chart, signs are the wallpaper &#8212; they colour how whatever is in the room behaves."},
    {graphic:"sign-glyphs"},
    {term:"Rashi", means:"sign &#8212; a 30&#176; segment of the zodiac"},
    {h:"The twelve, in one line each"},
    {list:[
      "Aries &#8212; fire, initiating: the spark that starts things",
      "Taurus &#8212; earth, fixed: the garden that holds its ground",
      "Gemini &#8212; air, adaptable: the conversation that never quite ends",
      "Cancer &#8212; water, initiating: the tide that pulls toward home",
      "Leo &#8212; fire, fixed: the hearth that wants to be seen burning",
      "Virgo &#8212; earth, adaptable: the workshop where details matter",
      "Libra &#8212; air, initiating: the scales weighing every side",
      "Scorpio &#8212; water, fixed: the deep well, still on the surface",
      "Sagittarius &#8212; fire, adaptable: the arrow aimed at the horizon",
      "Capricorn &#8212; earth, initiating: the mountain path, climbed slowly",
      "Aquarius &#8212; air, fixed: the long view held for everyone",
      "Pisces &#8212; water, adaptable: the ocean where boundaries blur"]},
    {graphic:"elements-grid"},
    {p:"Each sign belongs to an element &#8212; fire, earth, air or water &#8212; and a quality: initiating (chara), fixed (sthira) or adaptable (dvisvabhava). Each also has an owner, its lord, and that ownership is the backbone of chart reading."},
    {try:"Open Universe and find the number 1 on your chart &#8212; that sign is your rising sign, the lens the rest is read through."}
  ]},

{ id:"the-nine-grahas", title:"The nine grahas",
  one:"The cast of characters, including two shadows", read:"5 min",
  sections:[
    {h:"Graspers, not planets"},
    {p:"Graha means grasper &#8212; something that takes hold. It is deliberately not the word planet. Two of the nine are luminaries, the Sun and Moon. Two more have no body at all."},
    {term:"Graha", means:"one of the nine celestial influences in Vedic astrology"},
    {h:"The nine, in one line each"},
    {list:[
      "Sun (Surya) &#8212; the self, vitality, authority: where you must be visible",
      "Moon (Chandra) &#8212; mind, mood, memory: how you actually feel",
      "Mars (Mangala) &#8212; drive, courage, conflict: the will to cut through",
      "Mercury (Budha) &#8212; intellect, speech, commerce: how you process and transmit",
      "Jupiter (Guru) &#8212; wisdom, expansion, counsel: it enlarges what it touches",
      "Venus (Shukra) &#8212; beauty, pleasure, partnership: what you are drawn toward",
      "Saturn (Shani) &#8212; time, structure, endurance: it withholds, then rewards what survived",
      "Rahu &#8212; the north node: appetite without a natural limit",
      "Ketu &#8212; the south node: detachment, and the release of what Rahu grasps"]},
    {h:"Rahu and Ketu, honestly"},
    {p:"Rahu and Ketu are the lunar nodes &#8212; the two points where the Moon's path crosses the Sun's. They are mathematical points, not bodies, which is why eclipses happen exactly there. Vedic tradition calls them chhaya grahas, shadow grahas, and treats them as a matched pair: always opposite each other, always retrograde."},
    {p:"Uranus, Neptune and Pluto belong to Western practice. Classical Vedic astrology uses these nine and no others."},
    {try:"Open Universe and tap Saturn. Note which house holds it &#8212; that is traditionally where patience is asked of you."}
  ]},

{ id:"reading-your-chart", title:"Reading your chart",
  one:"How the North Indian diamond works", read:"4 min",
  sections:[
    {h:"Houses fixed, signs rotate"},
    {p:"The North Indian chart is a diamond of twelve cells. Here is the one rule that unlocks it: the houses never move, the signs do. The top-centre diamond is always the 1st house. The houses then run counter-clockwise around the frame."},
    {graphic:"chart-anatomy"},
    {p:"Each cell carries a number. That number is the sign occupying the house &#8212; 1 for Aries, 2 for Taurus, through 12 for Pisces. Whichever sign was rising in the east when you were born goes in the 1st house, and the rest follow in order."},
    {term:"Lagna", means:"the ascendant &#8212; the sign rising on the eastern horizon at birth"},
    {h:"So to read any chart"},
    {list:["Find the top diamond &#8212; that is house 1, the self","Read its number &#8212; that is the rising sign","Count counter-clockwise for houses 2 through 12","Grahas written in a cell sit in that house, in that sign"]},
    {p:"That is the whole mechanism. Everything deeper &#8212; lords, aspects, dashas &#8212; builds on these four steps."},
    {try:"Open Universe and count round your chart from the top diamond. Check that the numbers step through all twelve signs in order."}
  ]},

{ id:"house-lordship", title:"House lords",
  one:"Every house has an owner, and where it sits matters", read:"5 min",
  sections:[
    {h:"Every sign has an owner"},
    {p:"Each of the twelve rashis belongs to a graha. The Sun owns Leo and the Moon owns Cancer; the other five own two signs each. Because a sign sits in a house, the owner of that sign becomes the lord of that house &#8212; permanently, in your chart, from the minute you were born."},
    {graphic:"sign-glyphs"},
    {term:"Adhipati", means:"lord &#8212; the graha that owns the sign in a house, and so answers for that house"},
    {list:[
      "Sun &#8212; Leo",
      "Moon &#8212; Cancer",
      "Mars &#8212; Aries and Scorpio",
      "Mercury &#8212; Gemini and Virgo",
      "Jupiter &#8212; Sagittarius and Pisces",
      "Venus &#8212; Taurus and Libra",
      "Saturn &#8212; Capricorn and Aquarius"]},
    {p:"Rahu and Ketu own nothing in the system this app uses, so they are never lords. Some schools give them co-rulership of Aquarius and Scorpio; that is a genuine disagreement between traditions, not an oversight."},
    {h:"The sentence that does the work"},
    {p:"Almost every classical judgement takes one shape: the lord of X sits in Y. Read it as a sentence about where a subject has gone. If the lord of your 10th sits in your 7th, career and partnership are tied together &#8212; work is traditionally read as arriving through people. If the lord of your 4th sits in your 12th, home is read as connected to distance, or to somewhere foreign."},
    {p:"This is why a house is never judged by what sits in it alone. The occupant describes the room; the lord tells you where the room's affairs are actually conducted."},
    {h:"Where a lord sits, roughly graded"},
    {list:[
      "In its own house &#8212; self-contained, and traditionally strengthened",
      "In a kendra (1, 4, 7, 10) or trikona (1, 5, 9) &#8212; well seated; the house has support",
      "In a dusthana (6, 8, 12) &#8212; the house's affairs are read as tested, often through work rather than lost",
      "In the house of a friendly graha &#8212; comfortable; in an enemy's, read as effortful"]},
    {term:"Dusthana", means:"the 6th, 8th and 12th houses &#8212; the demanding ones, traditionally read as testing rather than destroying"},
    {h:"The lagna lord first"},
    {p:"Of the twelve, the lord of the 1st matters most: it carries the whole chart, because the 1st house is you. Where it sits, and how comfortably, is usually the first thing an astrologer checks after the lagna itself. A well-placed lagna lord is traditionally read as steadying everything else."},
    {try:"Open You &#8226; Birth details &#8226; Houses. Every row already names the sign, its lord, and the house that lord sits in. Read one row aloud as a sentence &#8212; that is the whole grammar."}
  ]},

{ id:"occupants-vs-lords", title:"Occupants and lords",
  one:"Sitting in a house is not the same as owning it", read:"4 min",
  sections:[
    {h:"Two different jobs"},
    {p:"A house can hold grahas, and a house always has a lord. These are separate facts answering separate questions, and confusing them is the single most common beginner's error."},
    {graphic:"houses-wheel"},
    {p:"Think of a room and its keyholder. Whoever is standing in the room affects what happens there tonight &#8212; that is the occupant. The keyholder decides what the room is for, and if they happen to be three floors away, the room's business tends to get done three floors away. That is the lord."},
    {term:"Kendra", means:"the 1st, 4th, 7th and 10th &#8212; the angles, traditionally the strongest seats"},
    {term:"Trikona", means:"the 1st, 5th and 9th &#8212; the trines, traditionally the most fortunate"},
    {h:"Empty houses are not silent"},
    {p:"Nine grahas cannot fill twelve houses, so most charts have six or seven houses with nothing in them. This is completely ordinary. An empty house is read exactly as a full one is: through the sign on it, through its lord, and through anything casting drishti at it."},
    {p:"So a person with an empty 7th does not lack partnership. Their 7th is read through the sign there and through wherever its lord sits &#8212; and a strong lord in a good house is traditionally read as better news than a struggling graha sitting inside."},
    {h:"When a house has both"},
    {p:"Where a house holds grahas and its lord is somewhere interesting, read both and expect texture rather than agreement. The occupant describes how the area feels day to day; the lord describes what it is connected to. They can point in different directions, and when they do, that mixture is the information &#8212; not a contradiction to be resolved."},
    {p:"One more pattern worth recognising early: when two lords sit in each other's signs, the two houses are tied tightly together, each carrying something of the other. Tradition treats that exchange as one of the strongest links a chart can contain."},
    {try:"Open You &#8226; Birth details &#8226; Houses and find a house with nothing in it. Its row still names a sign, a lord and an address for that lord. Nothing is missing &#8212; that is the reading."}
  ]},

{ id:"the-moon-and-you", title:"The Moon and you",
  one:"Why Vedic astrology begins with the Moon", read:"4 min",
  sections:[
    {h:"The mind's planet"},
    {p:"Western astrology leads with the Sun. Vedic astrology leads with the Moon. The Sun changes sign roughly once a month, so a Sun sign describes a twelfth of everyone born that month. The Moon changes sign every two and a quarter days &#8212; and changes nakshatra daily &#8212; so it is far more personal."},
    {graphic:"moon-phases"},
    {p:"Within this tradition the Moon stands for the mind itself: mood, memory, and how you actually feel, as against how you present. Daily readings are counted from it, and the entire dasha timetable is set by it."},
    {term:"Janma nakshatra", means:"birth star &#8212; the lunar mansion the Moon occupied at your birth"},
    {h:"Your birth star"},
    {p:"The sky is divided into 27 nakshatras, and the one holding your Moon at birth is your janma nakshatra. It names the first dasha period of your life and is the reference point for several timing systems you will meet later. When a traditional astrologer asks for your star, this is what they mean."},
    {try:"Open You and find your Moon's nakshatra in your birth profile &#8212; that is your janma nakshatra, the anchor of your whole timing system."}
  ]},

{ id:"your-first-look", title:"Your first look",
  one:"A guided tour of your own chart", read:"5 min",
  sections:[
    {h:"Five stops"},
    {p:"You now know enough to read the surface of a chart. This topic is a walk, not a lecture &#8212; each step below happens in your own chart."},
    {try:"Stop 1. Open Universe. The top diamond is your 1st house. Its number is your rising sign &#8212; your lagna. This is the you that walks into a room."},
    {try:"Stop 2. Find your Moon. The house it sits in is traditionally read as where your mind naturally goes when nothing demands it."},
    {try:"Stop 3. Find your Sun. Its house is where visibility is asked of you &#8212; where you are meant to be seen."},
    {try:"Stop 4. Look at your 7th house, directly opposite the 1st. Occupied or empty, its sign and lord describe how partnership tends to feel."},
    {p:"An empty house is not a lack, by the way. Most charts have several. An empty house is simply read through its lord &#8212; the graha that owns its sign &#8212; wherever that lord happens to sit."},
    {try:"Stop 5. Tap any graha and read what it rules. You have just done what an astrologer does first: lagna, Moon, Sun, partnerships, lords. The rest of the curriculum is depth, not difficulty."}
  ]},
]},

/* ================= INTERMEDIATE ================= */
{ level:"Intermediate", tag:"Going deeper",
  intro:"The machinery underneath: finer positions, timing, and how grahas reach each other.",
  topics:[

{ id:"nakshatras", title:"The 27 nakshatras",
  one:"A finer grid than the signs", read:"5 min",
  sections:[
    {h:"The older sky"},
    {p:"Long before the twelve signs, Indian astronomy divided the sky into 27 lunar mansions &#8212; nakshatras &#8212; each 13&#176;20' wide. They track the Moon, which passes through roughly one per day; 27 of them make a lunar month."},
    {graphic:"nakshatra-belt"},
    {p:"Nakshatras are finer than signs and often more telling. Two people can share a Moon sign and have entirely different nakshatras &#8212; different symbols, different ruling grahas, different dasha sequences."},
    {term:"Nakshatra", means:"lunar mansion &#8212; one of 27 divisions of the zodiac, each 13&#176;20' wide"},
    {h:"Padas"},
    {p:"Each nakshatra divides again into four padas of 3&#176;20', giving 108 across the zodiac &#8212; the same 108 that recurs throughout Indian tradition. The pada refines the reading and decides where a graha lands in the navamsa chart, which you will meet at the Expert level."},
    {term:"Pada", means:"quarter &#8212; one of the four 3&#176;20' subdivisions of a nakshatra"},
    {list:["Each nakshatra has a ruling graha, in a repeating cycle of nine","Each has a traditional symbol and presiding deity","The Moon's nakshatra at birth sets your entire dasha timetable"]},
    {try:"Open Universe, tap the Moon, and open its advanced details. Its nakshatra and pada are both there &#8212; the finest coordinates in your chart."}
  ]},

{ id:"dashas", title:"Dashas &#8212; the timetable",
  one:"How astrology answers the question 'when'", read:"6 min",
  sections:[
    {h:"What is there, and when it wakes"},
    {p:"A chart shows what is there. A dasha system says when it becomes active. The main one, Vimshottari, is a 120-year cycle divided among the nine grahas: Ketu 7 years, Venus 20, Sun 6, Moon 10, Mars 7, Rahu 18, Jupiter 16, Saturn 19, Mercury 17 &#8212; always in that order."},
    {graphic:"dasha-timeline"},
    {p:"Where you enter the cycle is set by your Moon's nakshatra at birth. That nakshatra's ruler runs your first period, and how far the Moon had already travelled through the nakshatra decides how much of that period had elapsed before you arrived."},
    {term:"Mahadasha", means:"major period &#8212; the graha presiding over a span of years"},
    {term:"Antardasha", means:"sub-period &#8212; a second graha colouring a slice of the mahadasha"},
    {h:"What 'ruling' a period means"},
    {p:"Within this framework, a graha ruling your period does not act from a script. It acts from your chart: the houses it owns, the house it sits in, its dignity, its aspects. The question to ask of any dasha is not what is Saturn like, but what is Saturn doing in my chart. The same Saturn period is a very different decade for two different people."},
    {list:["Each mahadasha subdivides into nine antardashas, same order, same proportions","Antardashas subdivide again &#8212; the texture shifts every year or two","A period tends to emphasise the themes its lord already carries natally"]},
    {try:"Open You and find your current mahadasha and antardasha. Then find the ruling graha in Universe and see which houses answer to it."}
  ]},

{ id:"aspects-drishti", title:"Aspects &#8212; drishti",
  one:"How grahas reach across the chart", read:"4 min",
  sections:[
    {h:"The gaze"},
    {p:"Drishti means gaze. A graha influences not only the house it occupies but the houses it looks at. Every graha aspects the 7th house from itself &#8212; the position directly opposite."},
    {graphic:"aspect-lines"},
    {h:"Three special gazes"},
    {list:["Mars also aspects the 4th and 8th from itself","Jupiter also aspects the 5th and 9th from itself","Saturn also aspects the 3rd and 10th from itself"]},
    {term:"Drishti", means:"aspect &#8212; literally 'sight'; a graha's influence on houses it looks at"},
    {p:"Notice the asymmetry: Saturn may aspect a graha that does not aspect it back. Western aspects are angles between two points and always mutual; Vedic drishti is directional, like a gaze actually is."},
    {p:"Traditionally, Jupiter's gaze is read as protective wherever it lands, and Saturn's as sobering &#8212; less a misfortune than a demand for structure. Whether Rahu and Ketu aspect at all is genuinely disputed between schools; this app leaves their aspects off by default."},
    {try:"Open Universe, tap Jupiter, and see which houses its aspect lines reach. Those areas are traditionally read as receiving its protection."}
  ]},

{ id:"dignity", title:"Dignity &#8212; strong and weak placements",
  one:"Why the same graha is not equal everywhere", read:"4 min",
  sections:[
    {h:"Where a graha is at home"},
    {p:"A graha's condition depends heavily on the sign holding it. The traditional grades, from strongest down:"},
    {list:[
      "Exalted (uccha) &#8212; its single strongest sign; Saturn in Libra, Jupiter in Cancer, Mars in Capricorn",
      "Moolatrikona &#8212; a specific degree range within its own sign, near root strength",
      "Own sign (svakshetra) &#8212; a sign it rules; comfortable and reliably itself",
      "Friendly, neutral, enemy signs &#8212; the middle ground, graded by ancient friendship tables",
      "Debilitated (neecha) &#8212; the sign opposite its exaltation; its least comfortable seat"]},
    {term:"Uccha", means:"exalted &#8212; a graha in its sign of greatest strength"},
    {term:"Neecha", means:"debilitated &#8212; a graha in the sign opposite its exaltation"},
    {h:"Weak is not doomed"},
    {p:"Debilitation is read as slower going, not as misfortune. A debilitated graha in a strong house can still deliver, and specific configurations &#8212; neecha bhanga &#8212; are traditionally read as cancelling the debility over time. Dignity is the opening assessment, never the verdict."},
    {try:"Open Universe and tap each graha, watching for words like exalted or debilitated. Most charts hold a mix &#8212; that mix is the texture of the chart."}
  ]},

{ id:"natural-vs-functional", title:"Natural and functional nature",
  one:"Why no graha is simply good or bad", read:"6 min",
  sections:[
    {h:"The question asked twice"},
    {p:"Ask whether Saturn is a benefic and the honest reply is: benefic for whom? Vedic astrology answers twice. Natural nature is the same in every chart ever cast. Functional nature depends entirely on your lagna &#8212; and it can reverse the first answer completely."},
    {graphic:"chart-anatomy"},
    {h:"Natural nature &#8212; the same for everyone"},
    {list:[
      "Naturally benefic &#8212; Jupiter, Venus, the waxing Moon, and Mercury when it keeps good company",
      "Naturally malefic &#8212; Saturn, Mars, the Sun, Rahu and Ketu, and the waning Moon",
      "Mercury appears on both sides on purpose: it takes its colour from whatever it sits with"]},
    {p:"Malefic here does not mean harmful. Within this tradition it names a graha that works through pressure, friction and limit rather than through ease: the Sun burns, Saturn withholds, Mars cuts. A great deal of what people value in themselves is traditionally attributed to exactly those pressures."},
    {h:"Functional nature &#8212; yours alone"},
    {p:"Now the second question: what does this graha own in your chart? The classical grading follows from the houses a graha rules, counted from your lagna and nobody else's."},
    {list:[
      "Lords of the trikonas &#8212; the 1st, 5th and 9th &#8212; are read as functionally benefic, whatever their natural character",
      "Lords of the 3rd, 6th and 11th are read as functionally malefic",
      "The 8th lord is read as difficult, unless it also owns the lagna &#8212; then owning the 1st takes precedence",
      "The 2nd and 12th are treated as neutral, taking their colour from what else their lord owns and the company it keeps",
      "Kendra lords swap: a natural benefic owning the 4th, 7th or 10th loses some of its benefic power, and a natural malefic owning one gains the capacity to do good"]},
    {term:"Yogakaraka", means:"a graha owning both a kendra and a trikona from your lagna &#8212; traditionally the most helpful graha in that chart"},
    {h:"The yogakaraka"},
    {p:"When one graha owns both an angle and a trine, tradition treats it as the chart's best worker regardless of its natural character. Three cases are cited most often: Saturn for a Taurus or Libra lagna, Mars for Cancer or Leo, Venus for Capricorn or Aquarius. A Taurus ascendant's Saturn is a natural malefic doing that chart's most constructive work."},
    {h:"Marakas, without the drama"},
    {p:"The classical texts also call the lords of the 2nd and 7th marakas, a word that concerns the end of life. Read them here as the parts of a chart associated with bringing matters to a conclusion &#8212; commitments closing, chapters finishing. Judging longevity is one of the most technically demanding things in Jyotish, the classical texts hedge it heavily and disagree with each other, and Astra does not attempt it at all."},
    {term:"Maraka", means:"the lords of the 2nd and 7th; in this app read only as themes reaching a conclusion, never as prediction"},
    {h:"Why the tables online are wrong"},
    {p:"A table saying Saturn in the 8th is bad has collapsed six separate questions into one. Natural nature, functional nature, dignity, the house occupied, what joins or aspects it, and whether its period has arrived are independent questions, and they routinely disagree with each other."},
    {p:"Saturn in the 8th for a Taurus lagna is that chart's yogakaraka sitting in a demanding seat &#8212; a very different sentence from the same placement for an Aries lagna, where Saturn owns quite different houses. Any reading that does not begin from your lagna is not reading your chart."},
    {try:"Open You &#8226; Birth details &#8226; Houses and note which grahas own your 1st, 5th and 9th. Those are your functional benefics &#8212; and one of them may well be a graha you were taught to be wary of."}
  ]},

{ id:"retrograde-and-combust", title:"Retrograde and combust",
  one:"Two conditions that change how a graha reads", read:"4 min",
  sections:[
    {h:"The backward loop"},
    {p:"Planets never actually reverse. Retrograde motion is a trick of vantage: as Earth overtakes a slower planet, or is overtaken, the planet appears to drift backward against the stars for a while, then resume."},
    {graphic:"retrograde-loop"},
    {term:"Vakri", means:"retrograde &#8212; apparent backward motion of a graha"},
    {p:"Within Vedic tradition a retrograde graha is often read as strengthened but inward-turning &#8212; its themes revisited, reworked, internalised rather than expressed straightforwardly. The Sun and Moon never retrograde; Rahu and Ketu, as nodes, always move backward and their motion is simply their nature."},
    {h:"Too close to the Sun"},
    {p:"A graha near the Sun disappears from the visible sky &#8212; it rises and sets with the glare. Tradition calls this combust and reads the graha's expression as dimmed for a while: present, but harder to see, in the sky and in life."},
    {term:"Asta", means:"combust &#8212; a graha too close to the Sun to be visible"},
    {p:"Neither condition is a flaw in you. Both are states, and states pass &#8212; retrogrades end, and separation from the Sun restores visibility."},
    {try:"Open Today's Sky and look for an R beside any graha. If Mercury carries one, tradition suggests a season for revising rather than launching."}
  ]},

{ id:"conjunctions", title:"Conjunctions",
  one:"What happens when two grahas share a sign", read:"5 min",
  sections:[
    {h:"Contact in the same room"},
    {p:"When two grahas occupy the same sign they are conjunct &#8212; yuti. They sit in the same house, act on the same area of life, and their significations blend. Drishti reaches across the chart; a conjunction is contact in the same room, and it is the most direct relationship two grahas can have."},
    {term:"Yuti", means:"conjunction &#8212; two or more grahas sharing one sign"},
    {h:"Same sign, or close degree?"},
    {p:"Both readings are used, and they answer different questions. Whole-sign conjunction &#8212; simply sharing a rashi &#8212; is the structural reading, and it is what a chart summary means by conjunct: same house, same lordship consequences. Degree conjunction asks how close, and two grahas a few degrees apart blend far more literally than two at opposite ends of a thirty-degree sign."},
    {p:"Astra uses both, deliberately. Your birth chart lists conjunctions by sign, because that is how houses and lords work. Today's sky flags one only when the two are astronomically close, within about three and a half degrees &#8212; roughly when you could go outside and see them together."},
    {h:"Who sets the tone"},
    {p:"A conjunction is not an average of two grahas. Tradition asks which one is leading, in roughly this order:"},
    {list:[
      "Dignity first &#8212; a graha in its own or exalted sign tends to colour the other rather than the reverse",
      "Then closeness &#8212; a few degrees apart is genuine fusion; twenty degrees apart in one sign is more a shared address than a shared voice",
      "Then what each owns &#8212; when two lords meet, their houses are tied together, and that is often the more useful fact",
      "Then the pairing itself &#8212; Jupiter with Venus reads quite differently from Mars with Saturn, and tradition has a note on most combinations"]},
    {p:"Where two grahas sit within a single degree of each other, the classical texts treat it as a contest and name a winner &#8212; judged by brightness, by latitude or by degree, depending on the school. That disagreement is old and unresolved, so Astra reports the closeness and does not score a victor."},
    {h:"The Sun's conjunctions are a special case"},
    {p:"You have already met this one. A graha sharing the Sun's sign and close enough in degree is combust: present, but lost in the glare. Same mechanism, with one participant so bright that the other stops being visible. The orbs are traditional and differ by graha &#8212; about 12&#176; for Mercury, 8&#176; to 10&#176; for Venus, 17&#176; for Mars, 11&#176; for Jupiter, 15&#176; for Saturn."},
    {term:"Sambandha", means:"a connection between two grahas &#8212; by sharing a sign, by aspect, or by exchanging signs"},
    {p:"Conjunction is only one of the ways two grahas connect. The others are mutual drishti, an exchange in which each sits in a sign the other owns, and one graha sitting in a house the other rules. Any of them links two parts of a chart; a conjunction is simply the tightest."},
    {try:"Open Universe and tap a graha that shares its sign with another. The reading names the pair and says their significations blend &#8212; then check both dignities to see which one is likely leading."}
  ]},

{ id:"gochara-transits", title:"Transits &#8212; gochara",
  one:"Today's sky, read against your birth sky", read:"6 min",
  sections:[
    {h:"Counted from the Moon"},
    {p:"Your chart is fixed, but the sky keeps moving. Gochara is the reading of current planetary positions against your birth chart &#8212; and here Vedic practice differs from Western: transits are traditionally counted from your natal Moon, not your ascendant. The Moon is the mind, and transits describe weather the mind moves through."},
    {term:"Gochara", means:"transit &#8212; the current motion of grahas read against the birth chart"},
    {p:"Each graha's transit is graded by which house from the Moon it currently occupies. A finer daily system, tara bala, grades each day by counting from your birth nakshatra to the Moon's current nakshatra &#8212; nine categories, cycling continuously, traditionally used for choosing timings."},
    {h:"Sade sati, calmly"},
    {p:"Sade sati is Saturn's transit through the 12th, 1st and 2nd houses from your natal Moon &#8212; about seven and a half years, once every thirty. Popular astrology has made it a bogeyman. The traditional reading is more measured: a long season of pruning, where commitments are tested and what is inessential falls away. Many people look back on it as the period that made them. It asks for patience, nothing more."},
    {term:"Chandrashtama", means:"the Moon transiting the 8th house from your natal Moon &#8212; about two days each month"},
    {p:"Chandrashtama is monthly and brief: traditionally a low-energy couple of days, better suited to finishing than starting. Note it, keep the day light if you can, and let it pass."},
    {try:"Open Today's Sky and count which house from your natal Moon the transiting Moon occupies right now. That single count is gochara in miniature."}
  ]},

{ id:"panchang-and-hora", title:"The panchang and the hora",
  one:"The five limbs of a day, and its planetary hours", read:"6 min",
  sections:[
    {h:"Five limbs, one day"},
    {p:"A panchang is the traditional Indian almanac, and the word means five limbs. Where a birth chart describes a person, a panchang describes a day &#8212; the same sky, read for everybody rather than for one chart. It is the oldest and most everyday use of Indian astronomy: the reason a festival falls when it does."},
    {graphic:"moon-phases"},
    {list:[
      "Vara &#8212; the weekday, each one ruled by a graha",
      "Tithi &#8212; the lunar day: a thirtieth of the Moon's lap away from the Sun and back",
      "Nakshatra &#8212; the lunar mansion the Moon occupies that day",
      "Yoga &#8212; one of twenty-seven divisions of the Sun and Moon positions taken together",
      "Karana &#8212; half a tithi; two of them make each lunar day"]},
    {term:"Tithi", means:"lunar day &#8212; one thirtieth of the Moon's cycle away from the Sun and back"},
    {h:"Why the week runs in that order"},
    {p:"Each weekday is ruled by a graha: Sunday the Sun, Monday the Moon, then Mars, Mercury, Jupiter, Venus, Saturn. That sequence looks arbitrary until you look at the hours underneath it."},
    {p:"Classical practice divides each day into twenty-four planetary hours and hands them out in order of apparent slowness: Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon, then round again. A day takes its name from the lord of its first hour. Twenty-four is three more than three full turns of seven, so each new day begins three places along the cycle &#8212; and three places along from the Sun is the Moon. Sunday is followed by Monday for that reason and no other."},
    {term:"Hora", means:"a planetary hour &#8212; one of twenty-four in a day, each ruled by a graha in the classical order"},
    {p:"Confusingly, hora is also the name of the D2 divisional chart, which halves each sign. Same word, unrelated instrument."},
    {h:"The hours are not sixty minutes"},
    {p:"Astra divides sunrise to sunset into twelve, and sunset to the next sunrise into twelve. In summer the daylight hours run long and the night hours short; in winter it reverses. This is the older, seasonal way of keeping time &#8212; and it is why a panchang needs your place as well as your date."},
    {h:"Timing, not fate"},
    {p:"The traditional use of all this is choosing when to begin something, not learning what will happen. An hour belonging to Mercury is traditionally favoured for correspondence and negotiation; Jupiter's for teaching, counsel and anything you would like to grow. The choghadiya table divides the same day a second way, into eight segments marked favourable or set aside."},
    {p:"None of it describes an outcome. It is a suggestion about rhythm, of much the same order as not scheduling a hard conversation at midnight. Treat an unfavourable window as a reason to wait an hour, never as a reason to be afraid of the hour."},
    {try:"Open Today &#8226; Panchang. The five limbs are the first rows &#8212; tap any of them for what it means &#8212; and Right now names both the current choghadiya and the graha that owns the hour you are in."}
  ]},
]},

/* ================= EXPERT ================= */
{ level:"Expert", tag:"The full system",
  intro:"The instruments practitioners actually argue about &#8212; and why they exist.",
  topics:[

{ id:"divisional-charts", title:"Divisional charts",
  one:"Sixteen charts hiding inside one", read:"5 min",
  sections:[
    {h:"Why vargas exist"},
    {p:"The chart you know &#8212; grahas in twelve houses &#8212; is the D1, or rashi chart. It describes life broadly. But a 30&#176; sign is a wide net: two people with Jupiter in the same sign can differ by nearly thirty degrees. Vargas recover that lost precision."},
    {graphic:"varga-split"},
    {p:"A divisional chart slices each sign into N parts and reassembles the pieces into a new twelve-sign chart. The arithmetic uses the same longitudes you already have; no new data is needed. Each varga is then read for one domain of life."},
    {term:"Varga", means:"divisional chart &#8212; a chart derived by subdividing each sign"},
    {list:[
      "D1 &#183; Rashi &#8212; the life as a whole",
      "D9 &#183; Navamsha &#8212; marriage, and the chart's underlying strength",
      "D10 &#183; Dashamsha &#8212; career and public action"]},
    {h:"The D9 above all"},
    {p:"The navamsa divides each sign into nine parts of 3&#176;20' &#8212; exactly one pada each &#8212; and is read alongside the D1 almost always, not only for marriage. A graha weak in the D1 but strong in the D9 is traditionally read as coming good over time, like a tree whose roots are better than its branches. Checking a graha's sign in both charts &#8212; and noting when the two agree, called vargottama &#8212; is standard practice."},
    {try:"Open a graha's advanced details and note its pada. That pada is precisely its navamsa position &#8212; you have been looking at D9 data all along."}
  ]},

{ id:"yogas", title:"Yogas",
  one:"Named combinations, and what they actually claim", read:"5 min",
  sections:[
    {h:"Patterns with names"},
    {p:"A yoga is a named combination of placements &#8212; two grahas together, a lord in a particular house, an exchange of signs &#8212; that tradition has catalogued and attached a reading to. The classical literature names hundreds. Three families matter most in practice."},
    {term:"Yoga", means:"union &#8212; a named planetary combination with a traditional interpretation"},
    {list:[
      "Gajakesari yoga &#8212; Jupiter in a kendra (1st, 4th, 7th or 10th) from the Moon; traditionally associated with wisdom, standing, and a protected mind",
      "Raja yogas &#8212; a kendra lord combining with a trikona lord; traditionally read as authority and rise in the world",
      "Dhana yogas &#8212; wealth-house lords (2nd, 5th, 9th, 11th) combining; traditionally associated with accumulation"]},
    {h:"Read the print before the headline"},
    {p:"Yogas are where astrology software is at its most breathless &#8212; some charts technically contain dozens. Tradition is stricter: a yoga's promise depends on the strength of the grahas forming it, the houses involved, and whether the dasha of a participating graha ever arrives to activate it. A yoga is a seed, not a certificate. Treat any list of your yogas as an index of themes worth examining, not a scorecard."},
    {try:"Check whether Jupiter sits 1st, 4th, 7th or 10th from your Moon in Universe. If so, you carry Gajakesari &#8212; then judge Jupiter's own condition before celebrating."}
  ]},

{ id:"ashtakoota", title:"Ashtakoota &#8212; the 36-point match",
  one:"The traditional compatibility grid, demystified", read:"5 min",
  sections:[
    {h:"Eight tests, thirty-six points"},
    {p:"Ashtakoota is the classical matching system used across India for marriage. It compares two people's Moon positions &#8212; sign and nakshatra &#8212; across eight tests, or kootas, each worth a different maximum. The weights ascend deliberately: the later tests concern deeper compatibility."},
    {term:"Koota", means:"one of eight compatibility tests comparing two Moon positions"},
    {list:[
      "Varna (1) &#8212; temperamental class; a basic grouping of natures",
      "Vashya (2) &#8212; mutual influence; who naturally sways whom",
      "Tara (3) &#8212; birth-star distance; read for wellbeing between the two",
      "Yoni (4) &#8212; instinctive nature; physical and temperamental fit",
      "Graha maitri (5) &#8212; friendship between the two Moon-sign lords",
      "Gana (6) &#8212; temperament class: deva, manushya or rakshasa nature",
      "Bhakoota (7) &#8212; Moon-sign distance; read for prosperity and family harmony",
      "Nadi (8) &#8212; constitutional channel; weighted highest of all"]},
    {p:"Eighteen of thirty-six is the traditional passing mark. But the score was never meant to stand alone: classical practice checks specific doshas, their cancellations, and the whole of both charts. Plenty of long, happy marriages sit below eighteen; the number is an opening conversation within this tradition, not a verdict on two people."},
    {try:"Add someone you know in You &#8226; Relationships and look past the total to the per-koota rows &#8212; the pattern of where you match says more than the sum."}
  ]},

{ id:"the-karakas", title:"The karakas",
  one:"Significators &#8212; fixed and personal", read:"5 min",
  sections:[
    {h:"Two systems, honestly labelled"},
    {p:"A karaka is a significator &#8212; a graha that carries a topic. Vedic astrology has two parallel systems, and they come from different strands of the tradition. Knowing which one a statement belongs to prevents most confusion."},
    {term:"Karaka", means:"significator &#8212; a graha standing for a particular topic or person"},
    {h:"Fixed karakas &#8212; Parashari"},
    {p:"In the Parashara tradition each graha permanently signifies certain things: the Sun for father and authority, the Moon for mother and mind, Jupiter for children and teachers, Venus for spouse, Saturn for longevity. These never change from chart to chart."},
    {h:"Movable karakas &#8212; Jaimini"},
    {p:"The Jaimini school assigns roles by degree. Rank the grahas by how far each has travelled through its sign; the one with the highest degree becomes the Atmakaraka, the soul significator &#8212; traditionally read as the chart's central actor. The rest follow in descending order:"},
    {list:[
      "Atmakaraka &#8212; the self; the chart's protagonist",
      "Amatyakaraka &#8212; counsel and career",
      "Bhratrikaraka &#8212; siblings and mentors",
      "Matrikaraka &#8212; mother",
      "Putrakaraka &#8212; children",
      "Gnatikaraka &#8212; rivals and obstacles",
      "Darakaraka &#8212; spouse and partnership"]},
    {p:"Schools differ on whether Rahu joins the scheme, making seven or eight karakas. Both positions are attested; this is a live disagreement, not an error to be fixed."},
    {try:"Open your grahas' advanced details and find the one with the highest degree in its sign. That is your Atmakaraka &#8212; in Jaimini reading, the lead role in your chart."}
  ]},

{ id:"ayanamsa-and-zodiacs", title:"Ayanamsa and the two zodiacs",
  one:"Why your Vedic sign differs from your Western one", read:"5 min",
  sections:[
    {h:"Two starting lines"},
    {p:"Western astrology uses the tropical zodiac, anchored to the seasons: 0&#176; Aries is defined as the spring equinox. Vedic astrology uses the sidereal zodiac, anchored to the fixed stars. Two thousand years ago the two agreed. They no longer do."},
    {graphic:"nakshatra-belt"},
    {h:"The wobble"},
    {p:"Earth's axis traces a slow circle, one turn in roughly 26,000 years &#8212; the precession of the equinoxes. This drags the equinox point slowly backward through the constellations, at about one degree every 72 years. The accumulated gap between the two zodiacs is the ayanamsa, currently a little over 24&#176;."},
    {term:"Ayanamsa", means:"the angular gap between the tropical and sidereal zodiacs"},
    {p:"Since 24&#176; is most of a 30&#176; sign, most people's Vedic sign is one back from their Western one. A lifelong Leo is very often a Vedic Cancer. Neither system is wrong; they measure from different origins, and each is internally consistent."},
    {h:"Which ayanamsa?"},
    {p:"The exact gap depends on choosing a moment when the zodiacs coincided, and traditions differ. The Lahiri ayanamsa &#8212; adopted by the Indian government's calendar reform committee in the 1950s &#8212; is the most widely used, and is what this app uses. Others (Raman, Krishnamurti) differ by fractions of a degree, enough to move a graha sitting near a sign boundary. Serious software always states its ayanamsa; now you know why."},
    {try:"Compare your Vedic Sun sign in Universe with the Western sign you grew up with. If they differ by one, you have just watched the ayanamsa at work."}
  ]},

{ id:"how-it-combines", title:"How it all combines",
  one:"The reasoning chain behind every reading in Astra", read:"7 min",
  sections:[
    {h:"One chain, used everywhere"},
    {p:"You now have the pieces. This topic is about the order they go in. Every reading in this app &#8212; a house, a graha, a day, a period &#8212; is assembled by walking the same chain, and each link either adds weight to a conclusion or takes weight away."},
    {list:[
      "Placement &#8212; the exact longitude; everything below is derived from it",
      "Sign &#8212; which rashi holds it, and therefore its element and its lord",
      "House &#8212; which area of life it acts on, counted from your lagna",
      "Lordship &#8212; which houses answer to it, and so what it carries with it",
      "Nakshatra &#8212; the finer position, and the graha ruling it",
      "Dignity &#8212; how comfortable it is in the sign it landed in",
      "Conjunction and drishti &#8212; who it is in contact with",
      "Dasha and transit &#8212; whether any of this is awake right now"]},
    {p:"No single link decides anything. A chart is read the way a case is argued: several independent lines pointing the same way make a strong reading, and lines that disagree mean the honest answer is a mixed one. Saying so is not a failure of the method."},
    {h:"A worked example"},
    {p:"Take Saturn in Capricorn in the 9th house, in a chart with a Taurus lagna. Walk the chain link by link."},
    {list:[
      "Sign &#8212; Capricorn is one of Saturn's own signs, so it is at home: comfortable, and reliably itself. Weight added.",
      "House &#8212; from a Taurus lagna, Capricorn falls in the 9th: teachers, belief, the father, long journeys, and what tradition calls fortune.",
      "Lordship &#8212; Saturn owns Capricorn and Aquarius, which from Taurus are the 9th and the 10th. A trikona and a kendra together: this Saturn is the chart's yogakaraka.",
      "Nakshatra &#8212; between 10&#176; and 23&#176;20&#8242; of Capricorn it falls in Shravana, whose ruler is the Moon and whose symbol is an ear. A Saturn of listening, in the house of teachers: the links agree, so the reading firms up.",
      "Dignity &#8212; own sign, so nothing to correct. Had the same Saturn been in Aries, its sign of debilitation, the identical lordship would be read as delivering more slowly.",
      "Drishti &#8212; from the 9th, Saturn looks at the 3rd, the 6th and the 11th: effort, rivals, gains. It does not look at the 10th, which it owns &#8212; a detail no lookup table would ever tell you.",
      "Company &#8212; whoever shares Capricorn with it shifts the tone, and a graha exchanging signs with it would bind those two houses together."]},
    {h:"The link that decides"},
    {graphic:"dasha-timeline"},
    {p:"Then the last link, which settles whether any of the above is live. A yogakaraka Saturn is a promise; its mahadasha or antardasha is when tradition reads that promise as being paid out. Two people with this identical placement &#8212; one thirty years from their Saturn period, one in the middle of it &#8212; hold the same chart and are living very different years. Transits do the same job on a shorter clock."},
    {h:"Two further weights"},
    {term:"Vargottama", means:"a graha holding the same sign in the birth chart and in the navamsa &#8212; traditionally read as steadying whatever it touches"},
    {term:"Shadbala", means:"six-fold strength &#8212; a numeric score across position, time, direction, motion, nature and aspect"},
    {p:"Two refinements sit on top of the same chain rather than replacing it: whether a graha holds its sign in the divisional charts as well, and where it ranks by shadbala among the seven. Both appear on every graha's page in Universe, underneath the plain-language reading rather than in place of it."},
    {h:"Why the chain is always shown"},
    {p:"An interpretation you cannot inspect is a claim you have to take on faith. So every reading here is built to be opened. See why on any life area in Today lists the actual placements behind it. A graha's page names its sign, house, lordships, nakshatra, dignity, conjunctions and aspects, in that order. Every divisional chart will show you its own arithmetic."},
    {p:"You are allowed to disagree with a reading. That is what the chain is for. Traditions differ on a great deal of this &#8212; which is exactly why the evidence matters more than the verdict."},
    {try:"Open Today, tap See why on any life area, then open one of the grahas it names in Universe. You are walking the same chain in both directions &#8212; from the conclusion back to the placement, and from the placement forward."}
  ]},
]},
];
