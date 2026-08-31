/* ===================================================================
   LORE - the deep interpretation library (house stories, graha-in-sign,
   lord-of-X-in-Y, conjunction blends). 300 entries.

   Drafted with GPT-4o at build time (tools/gen_lore.mjs), then
   machine-vetted by tools/build_lore.mjs against the tone contract
   (traditional-association language, zero fear, no predictions, no
   Sanskrit outside the engine's validated tables) and reviewed before
   committing. DO NOT EDIT BY HAND - regenerate via the tools, or the
   validator can no longer vouch for the text.

   Nothing here calculates. The engine computes placements and picks
   sentences from these tables (CLAUDE.md §57/§60).
   =================================================================== */

export const HOUSE_STORY = {
  "1": "The first house is traditionally associated with self, body, and bearing. It governs how you step into the world, your physical presence, and how others first perceive you. Listen for themes of identity and self-expression in your life, as this house sets the stage for your personal journey.",
  "2": "The second house is traditionally read as the domain of speech, family, and stored wealth. It speaks to how you voice your values and what you consider your material worth. Pay attention to your relationship with possessions and your family ties, as they shape the foundation of your security.",
  "3": "The third house is traditionally associated with courage, siblings, and skill of hand. It governs your ability to learn, communicate, and connect with those close to you. Consider how you express your skills and courage in daily life — this house highlights the ties that bind your immediate world.",
  "4": "The fourth house is traditionally associated with home, mother, and inner ground. It touches on your roots, emotional security, and the place you call sanctuary. Reflect on your sense of belonging and how you nurture your inner self, as this house speaks to where you find comfort and stability.",
  "5": "The fifth house is traditionally read as encompassing creativity, children, and learning. It governs your expressions of joy, romantic inclinations, and intellectual pursuits. Look for where your heart finds delight and how you share that spark with the world, as this house captures your creative drive.",
  "6": "The sixth house is traditionally associated with work, service, and obstacles met. It deals with daily routines, health, and how you tackle challenges. Consider the rhythms of your work life and how you balance service with self-care — this house speaks to your approach to life's demands.",
  "7": "The seventh house is traditionally read as the realm of partnership and the other. It governs your relationships, both personal and professional, and how you navigate shared space. Reflect on the balance of give and take in your connections, as this house highlights the dance of togetherness.",
  "8": "The eighth house is traditionally associated with depth, change, and what is shared. It invites you to explore transformation, intimacy, and the resources you merge with others. Look at the ways you handle change and shared commitments, as this house digs into the deeper currents of life.",
  "9": "The ninth house is traditionally read as the domain of fortune, teachers, and belief. It covers your quests for knowledge, spiritual truths, and broader horizons. Tune into your search for meaning and how you expand your worldview, as this house speaks to the journey of discovery and faith.",
  "10": "The tenth house is traditionally associated with career, standing, and visible work. It governs your public role, ambitions, and the legacy you build over time. Consider how you pursue goals and the image you project to the world, as this house highlights your professional path and achievements.",
  "11": "The eleventh house is traditionally read as encompassing gains, friends, and networks. It speaks to the support systems that help you grow and the aspirations you share with others. Reflect on the community you build and the dreams you chase, as this house celebrates collective success and friendships.",
  "12": "The twelfth house is traditionally associated with retreat, expense, and release. It touches on the hidden corners of the psyche, solitude, and the process of letting go. Consider how you find peace and the ways you seek closure, as this house guides you through the cycles of rest and renewal."
};

export const GRAHA_IN_SIGN = {
  "Sun": {
    "Aries": "The Sun in Aries is traditionally read as identity forged through action and initiative — there's a pioneering spirit, and assertive energy finds its way into leadership roles.",
    "Taurus": "The Sun in Taurus is traditionally read as identity expressed through stability and pleasure — comfort and beauty become anchors, with a steady pace grounding your ambitions.",
    "Gemini": "The Sun in Gemini is traditionally read as identity shaped by curiosity and communication — a lively exchange of ideas and a knack for adaptability keep life interesting.",
    "Cancer": "The Sun in Cancer is traditionally read as identity intertwined with home and emotions — a nurturing presence is your hallmark, and personal roots provide strength.",
    "Leo": "The Sun in Leo is traditionally read as identity radiating through creativity and confidence — there's a natural flair for drama, and self-expression is your stage.",
    "Virgo": "The Sun in Virgo is traditionally read as identity refined through service and precision — attention to detail and a love for improvement guide your pursuits.",
    "Libra": "The Sun in Libra is traditionally read as identity harmonized through relationships and aesthetics — balance is key, and you may find yourself drawn to beauty and fairness.",
    "Scorpio": "The Sun in Scorpio is traditionally read as identity transformed through intensity and insight — depth of feeling and a quest for truth drive your journey.",
    "Sagittarius": "The Sun in Sagittarius is traditionally read as identity expanded through exploration and philosophy — a quest for knowledge and a love of freedom mark your path.",
    "Capricorn": "The Sun in Capricorn is traditionally read as identity built through ambition and discipline — a patient climb towards goals and a respect for structure define your approach.",
    "Aquarius": "The Sun in Aquarius is traditionally read as identity liberated through innovation and ideals — thinking ahead and valuing community shape your unique perspective.",
    "Pisces": "The Sun in Pisces is traditionally read as identity dissolved into compassion and imagination — empathy and creativity weave through your life, inviting connection and dreams."
  },
  "Moon": {
    "Aries": "The Moon in Aries is traditionally read as feelings that surge with enthusiasm and spontaneity — emotions take on a bold, immediate flavor, and your instincts often lead the charge.",
    "Taurus": "The Moon in Taurus is traditionally read as emotions seeking comfort and stability — your feelings often root in the tangible, with a love for the sensory and reliable.",
    "Gemini": "The Moon in Gemini is traditionally read as emotions that dance through conversation and curiosity — feelings often expressed through words and the lively exchange of ideas.",
    "Cancer": "The Moon in Cancer is traditionally read as feelings deeply tied to home and nurturing — a natural affinity for emotional connection, with instincts often guided by care.",
    "Leo": "The Moon in Leo is traditionally read as emotions seeking expression and recognition — feelings often carry a dramatic flair, with a heart that shines in the spotlight.",
    "Virgo": "The Moon in Virgo is traditionally read as emotions finding order through analysis and service — feelings often detailed and practical, with care expressed in thoughtful acts.",
    "Libra": "The Moon in Libra is traditionally read as emotions that harmonize through relationship and balance — feelings often weigh options, seeking fairness and graceful connection.",
    "Scorpio": "The Moon in Scorpio is traditionally read as emotions that delve into depth and transformation — feelings often intense and probing, seeking the core of experience.",
    "Sagittarius": "The Moon in Sagittarius is traditionally read as emotions that wander through exploration and adventure — feelings often buoyant and expansive, with a thirst for discovery.",
    "Capricorn": "The Moon in Capricorn is traditionally read as emotions that ground through discipline and responsibility — feelings often reserved, with a focus on achievement and structure.",
    "Aquarius": "The Moon in Aquarius is traditionally read as emotions that soar through innovation and community — feelings often detached yet idealistic, with a vision for shared progress.",
    "Pisces": "The Moon in Pisces is traditionally read as emotions that flow with imagination and empathy — feelings often boundless and intuitive, with a heart open to the unseen."
  },
  "Mars": {
    "Aries": "Mars in Aries is traditionally read as a dynamic expression of action and initiative — you're seen as bold and quick to start, with energy that drives direct results.",
    "Taurus": "Mars in Taurus is traditionally read as steady and enduring — your energy finds form in persistence and a preference for tangible outcomes, taking time to build securely.",
    "Gemini": "Mars in Gemini is traditionally read as energetic curiosity — your drive is fueled by variety and mental engagement, with adaptability guiding your actions.",
    "Cancer": "Mars in Cancer is traditionally read as action colored by emotion — your energy is engaged by personal and home matters, where motivation flows from care and protection.",
    "Leo": "Mars in Leo is traditionally read as creative and bold action — your drive expresses through flair and confidence, with a focus on personal impact and recognition.",
    "Virgo": "Mars in Virgo is traditionally read as precise and methodical energy — your actions are driven by a desire to improve and refine, with an eye for detail and efficiency.",
    "Libra": "Mars in Libra is traditionally read as action seeking balance — your energy is channeled through harmony and partnership, weighing options before taking decisive steps.",
    "Scorpio": "Mars in Scorpio is traditionally read as intense and focused drive — your energy is deep and transformative, often seeking to uncover and empower through determination.",
    "Sagittarius": "Mars in Sagittarius is traditionally read as adventurous and spirited action — your drive is fueled by exploration and belief, with enthusiasm guiding your pursuits.",
    "Capricorn": "Mars in Capricorn is traditionally read as disciplined and strategic energy — your actions are methodical, aiming for long-term achievement and structured growth.",
    "Aquarius": "Mars in Aquarius is traditionally read as innovative and unconventional drive — your energy is directed toward progressive ideas and collective endeavors, with originality leading the way.",
    "Pisces": "Mars in Pisces is traditionally read as compassionate and imaginative energy — your actions are inspired by empathy and creativity, often moving fluidly and with a gentle touch."
  },
  "Mercury": {
    "Aries": "Mercury in Aries is traditionally read as communication that bursts forth with energy and directness — quick thinking often paired with a bold voice. The tradition suggests that your ideas may come rapidly, benefiting from practice in slowing down to ensure clarity.",
    "Taurus": "Mercury in Taurus is traditionally read as communication that values patience and practicality — words chosen with care and a preference for the tangible. The tradition associates this placement with thoughts that are grounded and deliberate, favoring a steady pace.",
    "Gemini": "Mercury in Gemini is traditionally read as communication that thrives on versatility and curiosity — an agile mind thriving on variety and rapid exchanges. The tradition suggests that your thoughts may dart across topics, with learning enhanced by focus.",
    "Cancer": "Mercury in Cancer is traditionally read as communication steeped in emotion and intuition — words that often carry a nurturing tone. The tradition suggests that your thoughts may be influenced by feelings, and finding balance between heart and mind is key.",
    "Leo": "Mercury in Leo is traditionally read as communication that seeks to inspire and captivate — words often carrying flair and confidence. The tradition suggests that expressing ideas with warmth and creativity comes naturally, with practice needed in listening as well as speaking.",
    "Virgo": "Mercury in Virgo is traditionally read as communication that values precision and practicality — thoughts organized into clear, methodical expression. The tradition suggests that your analytical abilities shine, with care taken to avoid overly critical assessments.",
    "Libra": "Mercury in Libra is traditionally read as communication that seeks harmony and balance — thoughts often weighing both sides before expressing. The tradition suggests that diplomacy comes naturally, with practice needed in decisiveness and setting boundaries.",
    "Scorpio": "Mercury in Scorpio is traditionally read as communication that delves deep and probes beneath the surface — words carrying intensity and focus. The tradition suggests a talent for uncovering truths, with care taken to balance depth with openness.",
    "Sagittarius": "Mercury in Sagittarius is traditionally read as communication that seeks to expand horizons and explore — words often infused with enthusiasm and a quest for truth. The tradition suggests that your ideas may be broad and visionary, with benefits found in refining details.",
    "Capricorn": "Mercury in Capricorn is traditionally read as communication that values responsibility and structure — words often carrying a serious tone and a focus on goals. The tradition suggests that your thoughts are practical and disciplined, with creativity enhanced by flexibility.",
    "Aquarius": "Mercury in Aquarius is traditionally read as communication that embraces innovation and uniqueness — ideas often forward-thinking and unconventional. The tradition suggests that your thoughts may be inventive, with practice needed in grounding them for clearer understanding.",
    "Pisces": "Mercury in Pisces is traditionally read as communication that flows with imagination and empathy — words often interwoven with dreams and intuition. The tradition suggests that your thoughts may be vivid and poetic, with clarity enhanced by grounding in reality."
  },
  "Jupiter": {
    "Aries": "Jupiter in Aries is traditionally read as enthusiasm meeting opportunity — your growth often feels like a bold adventure, and generosity may come through spirited action.",
    "Taurus": "Jupiter in Taurus is traditionally read as abundance appreciated through the senses — your expansion finds grounding in patience and stability, enriching life with tangible comforts.",
    "Gemini": "Jupiter in Gemini is traditionally read as wisdom shared through curiosity — your growth may spring from diverse learning, with communication as a gateway to broader horizons.",
    "Cancer": "Jupiter in Cancer is traditionally read as nurturing expanding into wisdom — your generosity may flow through emotional connections, with intuition guiding your path to abundance.",
    "Leo": "Jupiter in Leo is traditionally read as confidence radiating into growth — your expansion often feels like a grand performance, with creativity fueling your sense of purpose.",
    "Virgo": "Jupiter in Virgo is traditionally read as precision leading to wisdom — your growth may come through practical service, with a keen eye for detail bringing steady progress.",
    "Libra": "Jupiter in Libra is traditionally read as harmony fostering growth — your expansion may be tied to relationships, where balance and fairness create a pathway to wisdom.",
    "Scorpio": "Jupiter in Scorpio is traditionally read as transformation deepening into understanding — your growth may emerge from profound change, with intensity guiding you to uncover hidden truths.",
    "Sagittarius": "Jupiter in Sagittarius is traditionally read as exploration opening up wisdom — your expansion may feel like a quest for truth, with freedom and adventure fueling your journey.",
    "Capricorn": "Jupiter in Capricorn is traditionally read as ambition structuring growth — your expansion may come through discipline and responsibility, with long-term goals shaping your path to wisdom.",
    "Aquarius": "Jupiter in Aquarius is traditionally read as innovation sparking growth — your expansion may be linked to unconventional ideas, with humanitarian ideals guiding your pursuit of wisdom.",
    "Pisces": "Jupiter in Pisces is traditionally read as compassion flowing into wisdom — your growth may arise from empathy and imagination, with dreams and intuition weaving your path to understanding."
  },
  "Venus": {
    "Aries": "Venus in Aries is traditionally read as love expressed with bold enthusiasm — relationships here are often spontaneous and fiery, with a taste for the new and exciting.",
    "Taurus": "Venus in Taurus is traditionally read as love grounded in the senses — comfort and stability are valued, with a fondness for the familiar and tangible pleasures.",
    "Gemini": "Venus in Gemini is traditionally read as love expressed through communication and curiosity — relationships thrive on variety and lively exchange, with a playful touch.",
    "Cancer": "Venus in Cancer is traditionally read as love nurtured through care and emotional connection — relationships feel cozy and protective, with a strong sense of home.",
    "Leo": "Venus in Leo is traditionally read as love expressed with flair and generosity — relationships here shine with warmth and creativity, often enjoying a touch of drama.",
    "Virgo": "Venus in Virgo is traditionally read as love expressed through service and detail — relationships focus on practical support, valuing small gestures and thoughtful care.",
    "Libra": "Venus in Libra is traditionally read as love seeking harmony and balance — relationships are often graceful and diplomatic, with a focus on mutual respect and beauty.",
    "Scorpio": "Venus in Scorpio is traditionally read as love expressed with intensity and depth — relationships feel transformative and passionate, with a desire for deep emotional bonds.",
    "Sagittarius": "Venus in Sagittarius is traditionally read as love seeking adventure and truth — relationships thrive on exploration and shared ideals, valuing freedom and growth.",
    "Capricorn": "Venus in Capricorn is traditionally read as love expressed through commitment and structure — relationships are built with patience and respect, often with long-term goals in mind.",
    "Aquarius": "Venus in Aquarius is traditionally read as love expressed with innovation and independence — relationships value individuality and unconventional paths, often with a social or intellectual focus.",
    "Pisces": "Venus in Pisces is traditionally read as love expressed with imagination and empathy — relationships here are dreamy and compassionate, often blurring boundaries and embracing the mystical."
  },
  "Saturn": {
    "Aries": "Saturn in Aries is traditionally read as structured energy, where initiative meets discipline — patience is the practice, and leadership requires perseverance.",
    "Taurus": "Saturn in Taurus is traditionally read as steady building, where stability embraces hard work — persistence is cultivated, and comfort is crafted through effort.",
    "Gemini": "Saturn in Gemini is traditionally read as disciplined intellect, where curiosity finds structure — communication is honed, and learning requires patience.",
    "Cancer": "Saturn in Cancer is traditionally read as emotional responsibility, where nurturing meets discipline — security is built carefully, and home life takes planning.",
    "Leo": "Saturn in Leo is traditionally read as disciplined creativity, where self-expression is structured — recognition demands effort, and pride requires patience.",
    "Virgo": "Saturn in Virgo is traditionally read as meticulous discipline, where details are managed with care — routine is honed, and precision is a practiced art.",
    "Libra": "Saturn in Libra is traditionally read as structured harmony, where balance is maintained with patience — partnerships are cultivated, and fairness is a crafted effort.",
    "Scorpio": "Saturn in Scorpio is traditionally read as intense discipline, where transformation requires structure — depth is explored cautiously, and power is managed carefully.",
    "Sagittarius": "Saturn in Sagittarius is traditionally read as disciplined exploration, where freedom meets responsibility — adventure is planned, and wisdom is gained step by step.",
    "Capricorn": "Saturn in Capricorn is traditionally read as focused ambition, where achievement is built on perseverance — goals are pursued steadily, and success is crafted with care.",
    "Aquarius": "Saturn in Aquarius is traditionally read as structured innovation, where progress meets discipline — ideas are organized, and change is cultivated thoughtfully.",
    "Pisces": "Saturn in Pisces is traditionally read as disciplined imagination, where dreams are given form — intuition requires grounding, and creativity is approached with care."
  },
  "Rahu": {
    "Aries": "Rahu in Aries is traditionally read as a drive for innovation and leadership — a restless energy that seeks new frontiers and thrives on taking the initiative.",
    "Taurus": "Rahu in Taurus is traditionally read as a pull towards stability and sensual pleasures — an appetite for life's comforts and a persistent pursuit of material security.",
    "Gemini": "Rahu in Gemini is traditionally read as a curiosity-driven quest for knowledge and communication — a versatile mind that delights in ideas and thrives in exchange.",
    "Cancer": "Rahu in Cancer is traditionally read as an emotional deep dive into nurturing and home life — a yearning for connection, with feelings often at the forefront.",
    "Leo": "Rahu in Leo is traditionally read as a pursuit of recognition and self-expression — a magnetic presence that seeks the spotlight and revels in creative performance.",
    "Virgo": "Rahu in Virgo is traditionally read as an analytical quest for perfection and efficiency — a meticulous approach to details and a keen problem-solving drive.",
    "Libra": "Rahu in Libra is traditionally read as a fascination with balance and relationships — a diplomatic charm that seeks harmony and values partnership.",
    "Scorpio": "Rahu in Scorpio is traditionally read as an attraction to depth and transformation — a magnetic pull towards the mysterious and an intense journey of self-discovery.",
    "Sagittarius": "Rahu in Sagittarius is traditionally read as an adventurous pursuit of truth and freedom — a philosophical spirit with a thirst for exploration and broad horizons.",
    "Capricorn": "Rahu in Capricorn is traditionally read as an ambition-fueled climb towards authority and structure — a disciplined approach to achievement and a focus on long-term goals.",
    "Aquarius": "Rahu in Aquarius is traditionally read as a visionary quest for innovation and community — an affinity for progressive ideals and a drive to connect with like-minded souls.",
    "Pisces": "Rahu in Pisces is traditionally read as a dive into imagination and spirituality — a creative yearning for transcendence and a fluid approach to life's mysteries."
  },
  "Ketu": {
    "Aries": "Ketu in Aries is traditionally read as a drive towards independence and action that may feel unanchored, with a flair for solo pursuits that can be honed through patience.",
    "Taurus": "Ketu in Taurus is traditionally associated with a deep connection to the material world that can feel elusive, inviting practice in discerning true value beyond the surface.",
    "Gemini": "Ketu in Gemini is traditionally read as a mind drawn to diverse ideas and communication, where focus and clarity are cultivated through steady engagement.",
    "Cancer": "Ketu in Cancer is traditionally read as emotional depth that can feel untethered, suggesting careful nurturing of roots and connections as a grounding practice.",
    "Leo": "Ketu in Leo is traditionally associated with a sense of self-expression that may feel detached, inviting exploration of creative outlets to find genuine joy.",
    "Virgo": "Ketu in Virgo is traditionally read as a propensity for detail and precision that can seem scattered, with mastery found in mindful organization and service.",
    "Libra": "Ketu in Libra is traditionally associated with a pull towards balance and harmony that may seem elusive, encouraging thoughtful engagement in relationships and fairness.",
    "Scorpio": "Ketu in Scorpio is traditionally read as an intense drive for transformation that can feel unfocused, inviting deliberate exploration of deeper truths and resilience.",
    "Sagittarius": "Ketu in Sagittarius is traditionally associated with a quest for knowledge and freedom that may feel aimless, suggesting a mindful approach to learning and exploration.",
    "Capricorn": "Ketu in Capricorn is traditionally read as ambition and structure that can seem ungrounded, with growth found in disciplined practice and perseverance.",
    "Aquarius": "Ketu in Aquarius is traditionally associated with visionary thinking that may feel disconnected, encouraging the integration of innovative ideas with practical application.",
    "Pisces": "Ketu in Pisces is traditionally read as a pull towards imagination and spirituality that can seem unmoored, inviting grounding through creative and compassionate practices."
  }
};

/* LORD_IN_HOUSE[X][Y]: the lord of house X placed in house Y */
export const LORD_IN_HOUSE = {
  "1": {
    "1": "The lord of the 1st house in the 1st is traditionally read as self-awareness being central to your life path — your identity radiates clearly, and authenticity is your anchor.",
    "2": "The lord of the 1st in the 2nd is traditionally read as self-expression through voice and resources — you find identity in family ties and the way you manage your wealth.",
    "3": "The lord of the 1st in the 3rd is traditionally read as self-discovery through communication and skill — you carve your path by connecting with siblings and honing your talents.",
    "4": "The lord of the 1st in the 4th is traditionally read as self-rootedness in home and heritage — your sense of self flourishes in familiar surroundings and inner reflection.",
    "5": "The lord of the 1st in the 5th is traditionally read as self-expression through creativity and learning — your personal journey is enriched by artistic pursuits and intellectual growth.",
    "6": "The lord of the 1st in the 6th is traditionally read as self-development through work and service — overcoming obstacles and routine tasks shape your identity.",
    "7": "The lord of the 1st in the 7th is traditionally read as self-definition through partnership — your sense of self emerges strongly in relation to others.",
    "8": "The lord of the 1st in the 8th is traditionally read as self-transformation through depth and shared experiences — your identity evolves through significant changes and deep connections.",
    "9": "The lord of the 1st in the 9th is traditionally read as self-expansion through belief and learning — travel, philosophy, and higher education enrich your personal journey.",
    "10": "The lord of the 1st in the 10th is traditionally read as self-realization through career and public life — your identity is shaped by your ambitions and achievements.",
    "11": "The lord of the 1st in the 11th is traditionally read as self-growth through friendships and networks — your personal goals are supported by your social circles and shared aspirations.",
    "12": "The lord of the 1st in the 12th is traditionally read as self-reflection through retreat and solitude — your identity is refined in quiet moments and introspective spaces."
  },
  "2": {
    "1": "The lord of the 2nd in the 1st is traditionally read as speech and stored wealth closely tied to your self-presentation and personal bearing — your words and resources become part of how you are seen and can shape your confidence.",
    "2": "The lord of the 2nd in the 2nd is traditionally read as a strong focus on family and wealth — your voice and values resonate within your inner circle, reinforcing security and shared interests.",
    "3": "The lord of the 2nd in the 3rd is traditionally read as speech and stored wealth engaged actively with courage and skill — your resources and family ties might support your initiatives and close connections.",
    "4": "The lord of the 2nd in the 4th is traditionally read as family and stored wealth anchored in the home and inner life — resources may nurture your inner grounding and emotional stability.",
    "5": "The lord of the 2nd in the 5th is traditionally read as resources and speech channeling into creativity and learning — your stored wealth might support creative pursuits or educational endeavors.",
    "6": "The lord of the 2nd in the 6th is traditionally read as speech and stored wealth meeting challenges through work and service — efforts to manage resources can be part of your routine.",
    "7": "The lord of the 2nd in the 7th is traditionally read as family and stored wealth influencing partnership dynamics — shared resources and values can play a significant role in relationships.",
    "8": "The lord of the 2nd in the 8th is traditionally read as speech and wealth undergoing transformation through shared depths — resources may be involved in joint ventures or deep changes.",
    "9": "The lord of the 2nd in the 9th is traditionally read as family and stored wealth connected to fortune and belief — resources might support travel, learning, or philosophical pursuits.",
    "10": "The lord of the 2nd in the 10th is traditionally read as speech and stored wealth influencing career and public standing — your resources and communication can shape professional endeavors.",
    "11": "The lord of the 2nd in the 11th is traditionally read as family and stored wealth contributing to gains and networks — resources and speech can foster friendships and community ties.",
    "12": "The lord of the 2nd in the 12th is traditionally read as speech and stored wealth seeking retreat and release — resources might be directed towards solitary pursuits or spiritual exploration."
  },
  "3": {
    "1": "The lord of the 3rd house in the 1st is traditionally read as courage and skill manifesting through your own presence — your personal bearing becomes a testament to your communication and sibling dynamics.",
    "2": "The lord of the 3rd house in the 2nd is traditionally read as communication and sibling relations influencing your speech and wealth — your voice and stored resources often reflect your courage and hands-on abilities.",
    "3": "The lord of the 3rd house in the 3rd is traditionally read as a strong focus on siblings and communication — courage is honed through skillful expression and close kin interactions.",
    "4": "The lord of the 3rd house in the 4th is traditionally read as your courage and skill finding grounding in home and inner life — domestic matters and internal stability support your communicative ventures.",
    "5": "The lord of the 3rd house in the 5th is traditionally read as creativity and learning enhancing your communication and sibling ties — your courage is often expressed through playful or educational channels.",
    "6": "The lord of the 3rd house in the 6th is traditionally read as courage and skill being tested and refined through work and service — your communication style is honed through daily challenges.",
    "7": "The lord of the 3rd house in the 7th is traditionally read as partnerships shaping your communication and courage — your interactions with others often reflect in your sibling relations and skill of hand.",
    "8": "The lord of the 3rd house in the 8th is traditionally read as depth and transformation influencing your communication and sibling relations — courage is often tested through shared resources and profound changes.",
    "9": "The lord of the 3rd house in the 9th is traditionally read as belief and fortune guiding your communication and sibling dynamics — your courage is often bolstered by philosophical insights and broader horizons.",
    "10": "The lord of the 3rd house in the 10th is traditionally read as career and public standing enhancing your communication and courage — your skill and sibling ties often play a role in your visible achievements.",
    "11": "The lord of the 3rd house in the 11th is traditionally read as friendships and networks enhancing your communication and sibling relations — your courage is often expressed through social circles and collaborative efforts.",
    "12": "The lord of the 3rd house in the 12th is traditionally read as retreat and release shaping your communication and sibling ties — your courage may find expression in solitude or through letting go of past dynamics."
  },
  "4": {
    "1": "The lord of the 4th in the 1st is traditionally read as home and inner ground influencing your self and bearing — a sense of rootedness colors your approach to life, with your personal identity often guided by early foundations.",
    "2": "The lord of the 4th in the 2nd is traditionally read as home and family shaping speech and stored wealth — nurturing language and familial values may guide your resources and how you express yourself.",
    "3": "The lord of the 4th in the 3rd is traditionally read as home and inner ground driving courage and skill — communication and sibling relationships might be strongly connected to your foundational sense of security.",
    "4": "The lord of the 4th in its own house is traditionally read as a strong focus on home and inner grounding — a deep connection to your roots and personal sanctuary supports your emotional well-being.",
    "5": "The lord of the 4th in the 5th is traditionally read as home and inner ground influencing creativity and learning — your artistic and intellectual pursuits may reflect family values or early teachings.",
    "6": "The lord of the 4th in the 6th is traditionally read as home and inner ground contributing to work and meeting obstacles — daily routines and service roles might be shaped by your foundational experiences.",
    "7": "The lord of the 4th in the 7th is traditionally read as home and inner ground informing partnership — your relationships may echo familial patterns or seek to recreate a sense of emotional security.",
    "8": "The lord of the 4th in the 8th is traditionally read as home and inner ground interacting with change and shared depth — transformations in life can be deeply tied to family dynamics or personal foundations.",
    "9": "The lord of the 4th in the 9th is traditionally read as home and inner ground influencing fortune and belief — your worldview and philosophy may be rooted in early family teachings or cultural heritage.",
    "10": "The lord of the 4th in the 10th is traditionally read as home and inner ground affecting career and standing — professional life may be intertwined with family expectations or a desire to honor familial legacy.",
    "11": "The lord of the 4th in the 11th is traditionally read as home and inner ground shaping gains and networks — social circles and aspirations might be rooted in shared family values or home-based connections.",
    "12": "The lord of the 4th in the 12th is traditionally read as home and inner ground relating to retreat and release — periods of solitude and letting go may be influenced by early home life or familial ties."
  },
  "5": {
    "1": "The lord of the 5th in the 1st is traditionally read as creativity and learning expressed through your self and presence — your personal expression and identity often become the canvas for your creative endeavors.",
    "2": "The lord of the 5th in the 2nd is traditionally read as creativity and learning supported by speech and resources — your artistic pursuits may find grounding in your voice or the wealth you accumulate.",
    "3": "The lord of the 5th in the 3rd is traditionally read as creativity and learning manifesting through courage and skill — your hands and communication become tools for your creative expression and educational pursuits.",
    "4": "The lord of the 5th in the 4th is traditionally read as creativity and learning nurtured by home and inner ground — your creative projects may find inspiration and support within your domestic sphere or from your roots.",
    "5": "The lord of the 5th in the 5th is traditionally read as creativity and learning thriving in their own realm — your natural flair for creativity and education shines brightly and feels at home.",
    "6": "The lord of the 5th in the 6th is traditionally read as creativity and learning finding expression through work and routine — your creative projects may benefit from structured effort and service-oriented tasks.",
    "7": "The lord of the 5th in the 7th is traditionally read as creativity and learning flourishing in partnership — collaborative endeavors and relationships may spark and support your artistic and educational pursuits.",
    "8": "The lord of the 5th in the 8th is traditionally read as creativity and learning deepened through change and shared experiences — transformative encounters may fuel your creative processes and educational growth.",
    "9": "The lord of the 5th in the 9th is traditionally read as creativity and learning inspired by fortune and belief — your creative vision may expand through philosophical exploration or travel.",
    "10": "The lord of the 5th in the 10th is traditionally read as creativity and learning contributing to career and public standing — your artistic endeavors and educational achievements may play a significant role in your professional life.",
    "11": "The lord of the 5th in the 11th is traditionally read as creativity and learning enhanced by networks and gains — your social circles and aspirations may provide fertile ground for your creative and educational pursuits.",
    "12": "The lord of the 5th in the 12th is traditionally read as creativity and learning finding release in retreat and solitude — your artistic and educational endeavors may flourish in quiet reflection or behind the scenes."
  },
  "6": {
    "1": "The lord of the 6th in the 1st is traditionally read as work and service shaping your self and bearing — your approach to life's tasks becomes a defining feature of your identity.",
    "2": "The lord of the 6th in the 2nd is traditionally read as work and service influencing your speech and stored wealth — practical efforts may enrich your voice and resources.",
    "3": "The lord of the 6th in the 3rd is traditionally read as work and service being expressed through courage and skill of hand — challenges may find their solutions in your active efforts and communication.",
    "4": "The lord of the 6th in the 4th is traditionally read as work and service affecting your home and inner ground — daily duties might find balance through a nurturing and stable environment.",
    "5": "The lord of the 6th in the 5th is traditionally read as work and service impacting creativity and learning — obstacles could spark innovative ideas and educational pursuits.",
    "6": "The lord of the 6th in the 6th is traditionally read as work and service finding focus in their own terrain — steady engagement with tasks may build resilience and routine mastery.",
    "7": "The lord of the 6th in the 7th is traditionally read as work and service playing out through partnership — collaborative efforts could turn challenges into shared successes.",
    "8": "The lord of the 6th in the 8th is traditionally read as work and service leading to depth and transformation — facing obstacles may involve embracing change and sharing resources.",
    "9": "The lord of the 6th in the 9th is traditionally read as work and service being viewed through fortune and belief — tasks might take on a broader significance within your personal philosophy.",
    "10": "The lord of the 6th in the 10th is traditionally read as work and service contributing to career and public standing — your daily efforts may build your reputation and professional identity.",
    "11": "The lord of the 6th in the 11th is traditionally read as work and service aligning with gains and networks — collaborations and practical efforts may expand your social circles and aspirations.",
    "12": "The lord of the 6th in the 12th is traditionally read as work and service meeting retreat and release — periods of withdrawal might offer resolution to obstacles through reflection and letting go."
  },
  "7": {
    "1": "The lord of the 7th in the 1st is traditionally read as partnership shaping your sense of self — relationships may influence your identity, and balancing individual needs with those of others takes practice.",
    "2": "The lord of the 7th in the 2nd is traditionally read as partnership impacting speech and family — communication within relationships can affect financial stability, and nurturing shared values is key.",
    "3": "The lord of the 7th in the 3rd is traditionally read as partnership expressed through courage and skill — relationships may prompt you to develop new talents or connect with siblings in meaningful ways.",
    "4": "The lord of the 7th in the 4th is traditionally read as partnership grounding in home and inner life — domestic harmony may influence relationships, and finding emotional security with a partner can be nurturing.",
    "5": "The lord of the 7th in the 5th is traditionally read as partnership inspiring creativity and learning — romantic connections may spark artistic expression or encourage educational pursuits.",
    "6": "The lord of the 7th in the 6th is traditionally read as partnership navigating work and service — collaborations might thrive through shared responsibilities, with balance required to manage daily challenges together.",
    "7": "The lord of the 7th in the 7th is traditionally read as partnership centered in its own domain — relationships are a focal point, and the art of cooperation and mutual respect becomes a life-long pursuit.",
    "8": "The lord of the 7th in the 8th is traditionally read as partnership delving into depth and transformation — intimate relationships may challenge you to share resources and embrace change with another.",
    "9": "The lord of the 7th in the 9th is traditionally read as partnership expanding through belief and fortune — relationships can be enriched by shared philosophies, travel, or learning experiences.",
    "10": "The lord of the 7th in the 10th is traditionally read as partnership influencing career and public standing — professional relationships might boost your reputation or lead to visible accomplishments.",
    "11": "The lord of the 7th in the 11th is traditionally read as partnership flourishing in networks and gains — friendships and social connections can enhance relationships, fostering a supportive community.",
    "12": "The lord of the 7th in the 12th is traditionally read as partnership exploring retreat and release — relationships may involve sacrifice or spiritual growth, and finding peace through solitude together is a journey."
  },
  "8": {
    "1": "The lord of the 8th in the 1st is traditionally read as transformative experiences shaping your self and bearing — depth and shared matters influence your identity and presence.",
    "2": "The lord of the 8th in the 2nd is traditionally read as change and depth affecting speech and values — what is shared or transformed touches your family and stored wealth.",
    "3": "The lord of the 8th in the 3rd is traditionally read as depth and shared experiences informing courage and skill — changing dynamics may flow through siblings and communication.",
    "4": "The lord of the 8th in the 4th is traditionally read as transformation and shared depths influencing home and inner ground — changes within can reshape the sense of foundation and family.",
    "5": "The lord of the 8th in the 5th is traditionally read as transformation and shared experiences enriching creativity and learning — depths may inspire expression and growth with children.",
    "6": "The lord of the 8th in the 6th is traditionally read as shared depths influencing work and service — challenges and changes can inform how you handle obstacles and routine.",
    "7": "The lord of the 8th in the 7th is traditionally read as depth and transformation shaping partnerships — shared experiences and change can heavily influence the dynamics with others.",
    "8": "The lord of the 8th in the 8th is traditionally read as a strong focus on depth and transformation — what is shared and changed is deeply anchored in its own realm, magnifying its influence.",
    "9": "The lord of the 8th in the 9th is traditionally read as shared depths and transformation guiding belief and fortune — change may inform your views and interactions with teachers.",
    "10": "The lord of the 8th in the 10th is traditionally read as transformation and shared depths affecting career and standing — what is deeply shared may influence visible work and reputation.",
    "11": "The lord of the 8th in the 11th is traditionally read as transformation and shared experiences influencing gains and networks — depth may shape friendships and collective pursuits.",
    "12": "The lord of the 8th in the 12th is traditionally read as shared depths and transformation informing retreat and release — change may guide how you approach solitude and letting go."
  },
  "9": {
    "1": "The lord of the 9th in the 1st is traditionally read as fortune and belief shaping your identity — your personal path is often influenced by what you learn from teachers and your own philosophical outlook.",
    "2": "The lord of the 9th in the 2nd is traditionally read as fortune and belief impacting your speech and wealth — values and teachings may guide how you manage resources and communicate.",
    "3": "The lord of the 9th in the 3rd is traditionally read as fortune and belief expressed through courage and skills — your philosophical insights may inspire creative expression and sibling relationships.",
    "4": "The lord of the 9th in the 4th is traditionally read as fortune and belief nurturing your home and inner world — teachings and faith often provide a foundation for emotional stability.",
    "5": "The lord of the 9th in the 5th is traditionally read as fortune and belief fueling creativity and learning — your inspiration and joy can often be traced back to teachers and philosophical pursuits.",
    "6": "The lord of the 9th in the 6th is traditionally read as fortune and belief meeting work and obstacles — your faith and teachings may guide you in service and overcoming challenges.",
    "7": "The lord of the 9th in the 7th is traditionally read as fortune and belief weaving through partnership — relationships may benefit from shared philosophies and mutual growth.",
    "8": "The lord of the 9th in the 8th is traditionally read as fortune and belief diving into depth and transformation — your spiritual insights may guide shared resources and personal renewal.",
    "9": "The lord of the 9th in the 9th is traditionally read as fortune and belief finding their home — your natural inclination towards philosophical pursuits and teaching is emphasized.",
    "10": "The lord of the 9th in the 10th is traditionally read as fortune and belief informing career and public standing — your professional path is often inspired by higher learning and ethical principles.",
    "11": "The lord of the 9th in the 11th is traditionally read as fortune and belief influencing gains and networks — your friendships and aspirations may be shaped by shared ideals and philosophies.",
    "12": "The lord of the 9th in the 12th is traditionally read as fortune and belief guiding retreat and release — spiritual practices and teachings may offer solace in solitude and letting go."
  },
  "10": {
    "1": "The tradition associates the lord of your 10th in the 1st with career shaping your identity — your work becomes a personal expression, and standing is tied closely to your self-image.",
    "2": "The lord of your 10th in the 2nd is traditionally read as career influencing your resources — how you speak and what you accumulate echo your professional stature.",
    "3": "With the lord of your 10th in the 3rd, the tradition ties career to your skills and courage — communication and dexterity become key to your visible work.",
    "4": "The tradition sees the lord of your 10th in the 4th as career linked to home and foundation — your standing is nurtured by a stable inner life.",
    "5": "The lord of your 10th in the 5th is traditionally associated with creativity and learning enhancing your career — professional success is often fueled by your expressive talents.",
    "6": "The tradition reads the lord of your 10th in the 6th as career unfolding through service and routine — visible work demands diligent effort and addressing obstacles.",
    "7": "With the lord of your 10th in the 7th, partnership is traditionally seen as vital to career — collaborations and alliances shape your professional path.",
    "8": "The tradition links the lord of your 10th in the 8th to transformation within your career — depth and shared resources play a role in your professional standing.",
    "9": "The lord of your 10th in the 9th is traditionally read as career connected to belief and higher learning — your professional path may be guided by teachers and philosophy.",
    "10": "The tradition associates the lord of your 10th in the 10th with a strong focus on career itself — standing and visible work are central, with a natural authority in your field.",
    "11": "With the lord of your 10th in the 11th, the tradition ties career to networks and gains — your professional life is enriched by friendships and social connections.",
    "12": "The tradition reads the lord of your 10th in the 12th as career linked to retreat and introspection — your visible work may benefit from solitude and letting go."
  },
  "11": {
    "1": "The lord of the 11th in the 1st is traditionally read as your social networks influencing your self-image and bearing — friends and gains reflect on who you are, shaping your identity and presence.",
    "2": "The lord of the 11th in the 2nd is traditionally read as social ties shaping your speech and wealth — friends and networks influence your voice and resources, affecting how you manage and express stored values.",
    "3": "The lord of the 11th in the 3rd is traditionally read as gains linked to courage and skill — your social networks encourage your hands-on abilities and sibling-like connections fuel your pursuits.",
    "4": "The lord of the 11th in the 4th is traditionally read as social networks grounding you at home — friendships and gains find their roots in your private and inner life, shaping your sense of security.",
    "5": "The lord of the 11th in the 5th is traditionally read as friends inspiring creativity and learning — networks and gains become a source of joy, fueling your creative expression and intellectual pursuits.",
    "6": "The lord of the 11th in the 6th is traditionally read as networks engaged through work and service — your social connections bring opportunities for service and help you navigate obstacles with practical support.",
    "7": "The lord of the 11th in the 7th is traditionally read as partnerships shaping social networks — your gains and friendships are influenced by close relationships, as you navigate the balance between self and others.",
    "8": "The lord of the 11th in the 8th is traditionally read as transformations affecting your social ties — deep changes and shared resources can redefine friendships and the gains you derive from them.",
    "9": "The lord of the 11th in the 9th is traditionally read as beliefs guiding your networks — your social circles and gains are influenced by your philosophies and the wisdom shared by mentors.",
    "10": "The lord of the 11th in the 10th is traditionally read as career influencing your social gains — your standing and visible work shape your networks, with professional achievements linking to friendships.",
    "11": "The lord of the 11th in the 11th is traditionally read as gains reinforcing themselves — your social networks and friendships naturally align and support your aspirations and collective goals.",
    "12": "The lord of the 11th in the 12th is traditionally read as retreats affecting your friendships — expenses and release influence your networks, as withdrawing moments provide insights into your social connections."
  },
  "12": {
    "1": "The lord of the 12th in the 1st is traditionally read as retreat influencing self-perception — your sense of self may find clarity through solitude, and personal growth often thrives in quiet moments.",
    "2": "The lord of the 12th in the 2nd is traditionally read as expenses affecting speech and savings — financial outflows encourage careful communication, and family values may be shaped by periods of seclusion.",
    "3": "The lord of the 12th in the 3rd is traditionally read as retreat shaping skill and courage — solitary time may fuel creative pursuits, and private reflection often boosts your confidence in handling daily tasks.",
    "4": "The lord of the 12th in the 4th is traditionally read as release finding its way home — inner peace may be cultivated through domestic retreat, and your sense of grounding often benefits from introspective periods.",
    "5": "The lord of the 12th in the 5th is traditionally read as retreat feeding creativity — solitude can spark learning and artistic expression, and personal growth often flourishes in quiet reflection.",
    "6": "The lord of the 12th in the 6th is traditionally read as release informing work and service — solitude may assist in overcoming obstacles, and private reflection can guide your approach to daily duties.",
    "7": "The lord of the 12th in the 7th is traditionally read as retreat influencing partnership — your relationships may thrive with space for reflection, and shared journeys often include moments of solitude.",
    "8": "The lord of the 12th in the 8th is traditionally read as release impacting shared depths — intimate transformations may call for quiet reflection, and the hidden aspects of life often reveal themselves in solitude.",
    "9": "The lord of the 12th in the 9th is traditionally read as retreat guiding belief — your search for meaning may benefit from spiritual solitude, and personal philosophies often deepen in quiet contemplation.",
    "10": "The lord of the 12th in the 10th is traditionally read as retreat affecting career visibility — your professional standing may gain depth from private reflection, and public achievements often root in quiet moments.",
    "11": "The lord of the 12th in the 11th is traditionally read as release informing social networks — friendships may thrive with periods of solitude, and your community ties often deepen through reflective detachment.",
    "12": "The lord of the 12th in the 12th is traditionally read as retreat reinforcing release — solitude and introspection may become a natural rhythm, and your sense of peace often finds strength in quiet surrender."
  }
};

/* key: "A+B" with grahas in Sun..Ketu order */
export const CONJUNCTION_BLEND = {
  "Sun+Moon": "The Sun and Moon sharing a sign is traditionally read as a blend of identity and emotion — your inner self and outer expression seek alignment. Strength emerges in authenticity, while balancing personal needs with public roles may need practice.",
  "Sun+Mars": "The conjunction of the Sun and Mars is traditionally associated with a dynamic blend of identity and action — enthusiasm and vigor come naturally. However, channeling this energy constructively and avoiding impulsiveness can benefit from attention.",
  "Sun+Mercury": "The Sun and Mercury together in a sign is traditionally read as a fusion of identity and intellect — communication becomes a key part of self-expression. Clarity and confidence in conveying ideas are strengths, while listening actively may require practice.",
  "Sun+Jupiter": "When the Sun and Jupiter share a sign, the tradition associates this with expansive identity and growth — optimism and generosity are enhanced. Balancing personal ambitions with broader perspectives might need care to avoid overreach.",
  "Sun+Venus": "The conjunction of the Sun and Venus is traditionally read as identity intertwined with aesthetics and harmony — charm and creativity flourish. Finding balance between self-expression and the desire to please others may need attention.",
  "Sun+Saturn": "The Sun and Saturn in the same sign is traditionally associated with identity meeting discipline — a strong sense of responsibility and endurance is noted. Practicing patience and overcoming self-doubt can be areas to focus on.",
  "Sun+Rahu": "The conjunction of the Sun and Rahu is traditionally read with varied interpretations, often suggesting an amplified focus on personal goals — ambition is highlighted. Navigating these energies with grounded intentions may need practice.",
  "Sun+Ketu": "When the Sun and Ketu share a sign, traditions offer differing views, often seeing a blend of identity and detachment — self-awareness is deepened. Balancing personal significance with the need for spiritual growth can benefit from mindful attention.",
  "Moon+Mars": "The Moon and Mars together in a sign is traditionally read as emotions paired with action — passion and motivation are heightened. Cultivating emotional resilience and managing reactive tendencies may require practice.",
  "Moon+Mercury": "The Moon and Mercury together in a sign is traditionally read as emotions blending with intellect — imagination is enriched, but clarity in communication may need practice.",
  "Moon+Jupiter": "The Moon and Jupiter in conjunction are traditionally associated with a nurturing wisdom — optimism and empathy grow, though maintaining boundaries may require attention.",
  "Moon+Venus": "The Moon and Venus together is traditionally read as emotions intertwined with beauty and pleasure — creativity flourishes, yet balancing indulgence with practicality might need care.",
  "Moon+Saturn": "The conjunction of the Moon and Saturn is traditionally viewed as feelings meeting discipline — emotional resilience strengthens, though balancing warmth with caution may take practice.",
  "Moon+Rahu": "The Moon with Rahu is traditionally read with an emphasis on emotional intensity — imagination is heightened, but grounding these feelings can require careful management.",
  "Moon+Ketu": "The Moon and Ketu together are traditionally associated with introspection and detachment — intuition deepens, though staying connected with the present may need focus.",
  "Mars+Mercury": "Mars and Mercury in conjunction is traditionally read as energy aligning with intellect — sharp thinking and quick action are strengthened, though impulsiveness in words might need checking.",
  "Mars+Jupiter": "Mars and Jupiter together is traditionally associated with expansive energy and enthusiasm — courage and optimism are bolstered, while overreaching can call for mindful restraint.",
  "Mars+Venus": "The conjunction of Mars and Venus is traditionally viewed as desire blending with action — passion and charm are enhanced, though balancing assertiveness with sensitivity may take practice.",
  "Mars+Saturn": "Mars and Saturn in conjunction is traditionally read as energy tempered by discipline — assertion finds structure, though pacing and patience need practice.",
  "Mars+Rahu": "Mars with Rahu is traditionally read as dynamic energy sharpened by ambition — the drive can be intensified, but channeling it constructively requires care. Traditions vary on nodal influence, so staying grounded is key.",
  "Mars+Ketu": "Mars and Ketu together is traditionally read as action driven by instinct — the urge to conquer is innate, yet focusing energy can require careful attention. Traditions differ on nodal impact, suggesting diverse approaches.",
  "Mercury+Jupiter": "Mercury and Jupiter in conjunction is traditionally read as intellect expanded by wisdom — communication flows with optimism, though balancing detail and breadth needs attention.",
  "Mercury+Venus": "Mercury with Venus is traditionally read as charm blended with wit — expressive communication is enhanced, yet ensuring sincerity over superficiality takes practice.",
  "Mercury+Saturn": "Mercury and Saturn in conjunction is traditionally read as intellect solidified by realism — thinking is practical, though fostering flexibility alongside structure needs care.",
  "Mercury+Rahu": "Mercury with Rahu is traditionally read as communication intensified by curiosity — ideas come swiftly, yet grounding them in reality requires focus. Traditions vary on nodal impact, suggesting diverse communication styles.",
  "Mercury+Ketu": "Mercury and Ketu together is traditionally read as intellect sharpened by insight — thoughts are precise, yet maintaining clarity in expression needs attention. Traditions differ on nodal influence, indicating varied outcomes.",
  "Jupiter+Venus": "Jupiter and Venus in conjunction is traditionally read as optimism enriched by harmony — joyful expansion is natural, but balancing generosity with discernment takes practice.",
  "Jupiter+Saturn": "Jupiter and Saturn together is traditionally read as wisdom and discipline mingling — growth tends to be steady, with a need to practice patience. The tradition sees this as a balance between optimism and realism, where your expansive visions are grounded by a structured approach.",
  "Jupiter+Rahu": "Jupiter conjunct Rahu is traditionally read as expansive thinking mixed with ambition — enthusiasm can soar, yet grounded wisdom needs care. Some traditions see this as a quest for higher understanding that benefits from discerning the truth amid grand possibilities.",
  "Jupiter+Ketu": "Jupiter and Ketu in the same sign is traditionally read as wisdom seeking spiritual depth — knowledge may feel internalized, with practice needed in sharing insights. Traditions vary, but often view this as an inward journey that strengthens intuitive understanding.",
  "Venus+Saturn": "Venus and Saturn together is traditionally read as love meeting discipline — affection tends to be steady, with a practice in balancing warmth and caution. This blend is seen as deepening relationships through responsibility and commitment.",
  "Venus+Rahu": "Venus conjunct Rahu is traditionally read as love and desire amplified — charm can be magnetic, though discernment needs practice. Traditions highlight a pursuit of beauty and pleasure that calls for balance and clear intentions.",
  "Venus+Ketu": "Venus and Ketu sharing a sign is traditionally read as love with a touch of detachment — relationships may feel spiritual, with practice needed in emotional presence. Traditions often view this as a nuanced blend where beauty and art take on a transcendent quality.",
  "Saturn+Rahu": "Saturn and Rahu together is traditionally read as ambition coupled with discipline — growth feels structured, with patience needing practice. Traditions often see this as a drive towards material success that benefits from clear focus and perseverance.",
  "Saturn+Ketu": "Saturn and Ketu in the same sign is traditionally read as discipline meeting detachment — responsibilities may feel inward, with practice needed in maintaining outward engagement. Traditions vary but often view this as a time for introspection that strengthens inner resolve.",
  "Rahu+Ketu": "Rahu and Ketu in conjunction is traditionally read as a balance of ambition and detachment — where life's pull feels inward and outward, with practice needed in harmonizing extremes. Traditions weigh this as an opportunity for profound personal insight and growth."
};

export const conjKey = (a, b) => {
  const ORDER = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"];
  return ORDER.indexOf(a) < ORDER.indexOf(b) ? `${a}+${b}` : `${b}+${a}`;
};
