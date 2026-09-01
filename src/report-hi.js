/* ===================================================================
   REPORT-HI (src/report-hi.js) - Hindi (हिन्दी) rendering of the
   markdown that src/report.js's renderKundali()/renderLove() produce.

   DRAFT. Built for review by a Hindi-reading jyotishi. The engine is
   untouched: this module takes the finished English markdown and
   rewrites it line by line, so report.js keeps a single code path and
   its English output stays byte-identical.

   How a line is handled, in order:
     1. markdown table separator  -> unchanged
     2. exact whole-line match    -> LINES
     3. ordered regex templates   -> TEMPLATES (dynamic sentences)
     4. table row (starts with |) -> per-cell CELLS, then token pass
     5. anything else             -> LEFT IN ENGLISH

   Rule 5 is deliberate. Interpretive lore paragraphs (LORD_IN_HOUSE,
   GRAHA_IN_SIGN, PLANET_STORY.inHouse, CONJUNCTION_BLEND, the yoga and
   dosha `because` strings, koota `detail`) are not translated in this
   draft, and a token pass over them would produce Hinglish mush. So a
   line only ever gets the token pass once it has been recognised as
   structural. tools/report_hi_coverage.mjs enforces that every
   structural line IS recognised.

   Where a structural sentence carries a lore tail (the bold placement
   line before a lore paragraph, a koota bullet before its detail), the
   template protects the tail with K() so the token pass cannot touch
   it.
   =================================================================== */

/* ------------------------------------------------ vocabulary ------ */

export const GRAHA_HI = {
  Sun: "सूर्य", Moon: "चंद्र", Mars: "मंगल", Mercury: "बुध", Jupiter: "गुरु",
  Venus: "शुक्र", Saturn: "शनि", Rahu: "राहु", Ketu: "केतु",
};

export const GRAHA_AB_HI = {
  Su: "सू", Mo: "चं", Ma: "मं", Me: "बु", Ju: "गु", Ve: "शु", Sa: "श",
  Ra: "रा", Ke: "के",
};

export const SIGN_HI = {
  Aries: "मेष", Taurus: "वृषभ", Gemini: "मिथुन", Cancer: "कर्क", Leo: "सिंह",
  Virgo: "कन्या", Libra: "तुला", Scorpio: "वृश्चिक", Sagittarius: "धनु",
  Capricorn: "मकर", Aquarius: "कुंभ", Pisces: "मीन",
};

export const SIGN_AB_HI = {
  Ari: "मेष", Tau: "वृष", Gem: "मिथु", Can: "कर्क", Vir: "कन्या", Lib: "तुला",
  Sco: "वृश्चि", Sag: "धनु", Cap: "मकर", Aqu: "कुंभ", Pis: "मीन",
  /* "Leo" is both the full name and the abbreviation; SIGN_HI covers it */
};

export const NAK_HI = {
  Ashwini: "अश्विनी", Bharani: "भरणी", Krittika: "कृत्तिका", Rohini: "रोहिणी",
  Mrigashira: "मृगशिरा", Ardra: "आर्द्रा", Punarvasu: "पुनर्वसु", Pushya: "पुष्य",
  Ashlesha: "आश्लेषा", Magha: "मघा", "Purva Phalguni": "पूर्वा फाल्गुनी",
  "Uttara Phalguni": "उत्तरा फाल्गुनी", Hasta: "हस्त", Chitra: "चित्रा",
  Swati: "स्वाति", Vishakha: "विशाखा", Anuradha: "अनुराधा", Jyeshtha: "ज्येष्ठा",
  Mula: "मूल", "Purva Ashadha": "पूर्वाषाढ़ा", "Uttara Ashadha": "उत्तराषाढ़ा",
  Shravana: "श्रवण", Dhanishta: "धनिष्ठा", Shatabhisha: "शतभिषा",
  "Purva Bhadrapada": "पूर्वा भाद्रपद", "Uttara Bhadrapada": "उत्तरा भाद्रपद",
  Revati: "रेवती",
};

export const WEEKDAY_HI = {
  Sunday: "रविवार", Monday: "सोमवार", Tuesday: "मंगलवार", Wednesday: "बुधवार",
  Thursday: "गुरुवार", Friday: "शुक्रवार", Saturday: "शनिवार",
};

export const MONTH_HI = {
  Jan: "जन", Feb: "फ़र", Mar: "मार्च", Apr: "अप्रै", May: "मई", Jun: "जून",
  Jul: "जुल", Aug: "अग", Sep: "सित", Oct: "अक्तू", Nov: "नव", Dec: "दिस",
  January: "जनवरी", February: "फ़रवरी", March: "मार्च", April: "अप्रैल",
  June: "जून", July: "जुलाई", August: "अगस्त", September: "सितंबर",
  October: "अक्तूबर", November: "नवंबर", December: "दिसंबर",
};

export const TITHI_HI = {
  Pratipada: "प्रतिपदा", Dvitiya: "द्वितीया", Tritiya: "तृतीया",
  Chaturthi: "चतुर्थी", Panchami: "पंचमी", Shashthi: "षष्ठी", Saptami: "सप्तमी",
  Ashtami: "अष्टमी", Navami: "नवमी", Dashami: "दशमी", Ekadashi: "एकादशी",
  Dvadashi: "द्वादशी", Trayodashi: "त्रयोदशी", Chaturdashi: "चतुर्दशी",
  Purnima: "पूर्णिमा", Amavasya: "अमावस्या",
};

export const PAKSHA_HI = { Shukla: "शुक्ल", Krishna: "कृष्ण" };

/* nitya yogas (panchang limb) */
export const NITYA_YOGA_HI = {
  Vishkambha: "विष्कम्भ", Priti: "प्रीति", Ayushman: "आयुष्मान",
  Saubhagya: "सौभाग्य", Shobhana: "शोभन", Atiganda: "अतिगण्ड",
  Sukarman: "सुकर्मा", Dhriti: "धृति", Shula: "शूल", Ganda: "गण्ड",
  Vriddhi: "वृद्धि", Dhruva: "ध्रुव", Vyaghata: "व्याघात", Harshana: "हर्षण",
  Vajra: "वज्र", Siddhi: "सिद्धि", Vyatipata: "व्यतीपात", Variyana: "वरीयान",
  Parigha: "परिघ", Shiva: "शिव", Siddha: "सिद्ध", Sadhya: "साध्य", Shubha: "शुभ",
  Brahma: "ब्रह्म", Indra: "इन्द्र", Vaidhriti: "वैधृति",
  /* "Shukla" doubles as a paksha name; both render शुक्ल */
};

/* The 108 naming syllables of the avakahada chakra, in ASTERISMS order,
   four padas per nakshatra - the same table report.js NAME_SYL holds in
   transliteration. Kept as a table (not a token map) because the same
   transliterated syllable takes different Devanagari letters in
   different nakshatras (ट/त, ड/द, ण/न, ठ/थ). */
export const NAMAKSHARA_HI = [
  ["चू","चे","चो","ला"], ["ली","लू","ले","लो"], ["अ","ई","उ","ए"],
  ["ओ","वा","वी","वू"], ["वे","वो","का","की"], ["कु","घ","ङ","छ"],
  ["के","को","हा","ही"], ["हु","हे","हो","डा"], ["डी","डू","डे","डो"],
  ["मा","मी","मू","मे"], ["मो","टा","टी","टू"], ["टे","टो","पा","पी"],
  ["पू","ष","ण","ठ"],    ["पे","पो","रा","री"], ["रु","रे","रो","ता"],
  ["ती","तू","ते","तो"], ["ना","नी","नू","ने"], ["नो","या","यी","यू"],
  ["ये","यो","भा","भी"], ["भू","धा","फा","ढा"], ["भे","भो","जा","जी"],
  ["खी","खू","खे","खो"], ["गा","गी","गु","गे"], ["गो","सा","सी","सू"],
  ["से","सो","दा","दी"], ["दू","थ","झ","ञ"],    ["दे","दो","चा","ची"],
];
const NAK_ORDER = Object.keys(NAK_HI);

export const KARANA_HI = {
  Bava: "बव", Balava: "बालव", Kaulava: "कौलव", Taitila: "तैतिल", Gara: "गर",
  Vanija: "वणिज", Vishti: "विष्टि", Kimstughna: "किंस्तुघ्न", Shakuni: "शकुनि",
  Chatushpada: "चतुष्पद", Naga: "नाग",
};

export const KARAKA_HI = {
  Atmakaraka: "आत्मकारक", Amatyakaraka: "अमात्यकारक",
  Bhratrikaraka: "भ्रातृकारक", Matrikaraka: "मातृकारक",
  Pitrikaraka: "पितृकारक", Putrakaraka: "पुत्रकारक", Gnatikaraka: "ज्ञातिकारक",
  Darakaraka: "दारकारक",
};

export const YOGINI_HI = {
  Mangala: "मंगला", Pingala: "पिंगला", Dhanya: "धान्या", Bhramari: "भ्रामरी",
  Bhadrika: "भद्रिका", Ulka: "उल्का", Siddha: "सिद्धा", Sankata: "संकटा",
};

export const KOOTA_HI = {
  Varna: "वर्ण", Vashya: "वश्य", Tara: "तारा", Yoni: "योनि",
  "Graha Maitri": "ग्रह मैत्री", Gana: "गण", Bhakoot: "भकूट", Nadi: "नाड़ी",
};

/* avakhada values */
export const VARNA_HI = {
  Kshatriya: "क्षत्रिय", Vaishya: "वैश्य", Shudra: "शूद्र", Brahmin: "ब्राह्मण",
};
export const VASHYA_HI = {
  Chatushpada: "चतुष्पद", Manava: "मानव", Jalachara: "जलचर",
  Vanachara: "वनचर", Keeta: "कीट",
};
export const YONI_HI = {
  horse: "अश्व", elephant: "गज", sheep: "मेष", serpent: "सर्प", dog: "श्वान",
  cat: "मार्जार", rat: "मूषक", cow: "गौ", buffalo: "महिष", tiger: "व्याघ्र",
  deer: "मृग", monkey: "वानर", mongoose: "नकुल", lion: "सिंह",
};
export const GANA_HI = { Deva: "देव", Manushya: "मनुष्य", Rakshasa: "राक्षस" };
export const NADI_HI = { Adi: "आदि", Madhya: "मध्य", Antya: "अन्त्य" };
export const TATVA_HI = { Fire: "अग्नि", Earth: "पृथ्वी", Air: "वायु", Water: "जल" };

/* one-line traditional field per house (report.js HOUSE_SENSE) */
export const HOUSE_SENSE_HI = {
  "self, body and bearing": "स्वयं, शरीर और आत्म-प्रस्तुति",
  "speech, family and stored wealth": "वाणी, कुटुम्ब और संचित धन",
  "courage, siblings and skill of hand": "पराक्रम, भाई-बहन और हस्तकौशल",
  "home, mother and inner ground": "घर, माता और भीतरी आधार",
  "creativity, children and learning": "सृजनशीलता, संतान और विद्या",
  "work, service and obstacles met": "कार्य, सेवा और सामने आने वाली बाधाएँ",
  "partnership and the other": "साझेदारी और सम्मुख व्यक्ति",
  "depth, change and what is shared": "गहराई, परिवर्तन और साझा संसाधन",
  "fortune, teachers and belief": "भाग्य, गुरुजन और आस्था",
  "career, standing and visible work": "व्यवसाय, प्रतिष्ठा और दृश्यमान कार्य",
  "gains, friends and networks": "लाभ, मित्र और संपर्क-जाल",
  "retreat, expense and release": "एकांत, व्यय और विसर्जन",
};

/* GRAHA_MEANING[g].is - used in the §5 planet headings */
export const GRAHA_IS_HI = {
  "the self, vitality and authority": "आत्मा, ओज और अधिकार",
  "the mind, mood and memory": "मन, भाव और स्मृति",
  "drive, courage and conflict": "ऊर्जा, साहस और संघर्ष",
  "intellect, speech and commerce": "बुद्धि, वाणी और व्यापार",
  "wisdom, growth and grace": "ज्ञान, विस्तार और कृपा",
  "love, beauty and value": "प्रेम, सौंदर्य और मूल्य",
  "time, discipline and endurance": "समय, अनुशासन और धैर्य",
  "appetite, obsession and the foreign": "तृष्णा, आसक्ति और परदेस",
  "detachment, release and past mastery": "वैराग्य, विसर्जन और पूर्वार्जित प्रवीणता",
};

export const STRENGTH_HI = {
  strong: "प्रबल", moderate: "मध्यम", weak: "क्षीण",
  present: "विद्यमान", "not present": "अविद्यमान",
};

export const VERDICT_HI = {
  "an excellent match in this system": "इस पद्धति में उत्तम मेल",
  "a very good match in this system": "इस पद्धति में बहुत अच्छा मेल",
  "an average match in this system": "इस पद्धति में औसत मेल",
  "a below-average score in this system": "इस पद्धति में औसत से कम अंक",
};

export const GRADE_HI = { strong: "प्रबल", good: "अच्छा", fair: "ठीक-ठाक", quiet: "शांत" };

export const TARGET_HI = {
  "7th from lagna": "लग्न से सप्तम",
  "7th from Moon": "चंद्र से सप्तम",
  "natal Venus": "जन्मकालीन शुक्र",
  "Darakaraka's sign": "दारकारक की राशि",
};

export const YOGA_QUALIFIER_HI = { Maha: "महा", Khala: "खल", Dainya: "दैन्य" };

export const SATI_PHASE_HI = {
  "rising (12th from Moon)": "आरोहण (चंद्र से द्वादश)",
  "peak (over the Moon sign)": "शिखर (चंद्र राशि के ऊपर)",
  "setting (2nd from Moon)": "अवरोहण (चंद्र से द्वितीय)",
};

/* the DASHA_THEME paragraphs (narrative.js), dash()-processed */
export const DASHA_THEME_HI = {
  "Sun periods are traditionally read as years of definition — authority, visibility and the slow clarifying of who you are when people are watching. Work tends to move toward the centre of life, and recognition matters more than it used to.":
    "सूर्य की दशा परंपरागत रूप से स्वयं को परिभाषित करने के वर्षों के रूप में पढ़ी जाती है — अधिकार, दृश्यता, और लोगों के सामने आप कौन हैं इसका धीरे-धीरे स्पष्ट होना। कार्य जीवन के केंद्र की ओर आता है, और मान्यता पहले से अधिक महत्व रखने लगती है।",
  "Moon periods are traditionally read as years lived close to the skin — home, family, feeling and belonging come forward, and life is steered more by tides than by plans. Care, rest and the people who feel like harbour set the tone.":
    "चंद्र की दशा परंपरागत रूप से संवेदनशीलता के निकट जिए गए वर्षों के रूप में पढ़ी जाती है — घर, परिवार, भावना और अपनापन आगे आते हैं, और जीवन योजनाओं से अधिक भीतरी लहरों से चलता है। देखभाल, विश्राम और वे लोग जो आश्रय जैसे लगते हैं, इस अवधि का स्वर तय करते हैं।",
  "Mars periods are traditionally read as years of drive — effort, competition, property and physical energy. Things move fast when they move; the classical advice is to give the heat somewhere useful to go.":
    "मंगल की दशा परंपरागत रूप से गति और पुरुषार्थ के वर्षों के रूप में पढ़ी जाती है — परिश्रम, प्रतिस्पर्धा, भूमि-संपत्ति और शारीरिक ऊर्जा। जब कुछ चलता है तो तेज़ी से चलता है; शास्त्रीय परामर्श यह है कि इस ताप को कोई उपयोगी दिशा दी जाए।",
  "Mercury periods are traditionally read as years of exchange — learning, trade, writing, networks and quick adaptation. Skills sharpen and doors open through conversation rather than force.":
    "बुध की दशा परंपरागत रूप से आदान-प्रदान के वर्षों के रूप में पढ़ी जाती है — अध्ययन, व्यापार, लेखन, संपर्क और शीघ्र अनुकूलन। कौशल निखरते हैं और द्वार बल से नहीं, संवाद से खुलते हैं।",
  "Jupiter periods are traditionally read as expansive years — teachers, faith, children, growth and luck that arrives looking like good judgement. What you believe in tends to grow, so the tradition asks you to choose it carefully.":
    "गुरु की दशा परंपरागत रूप से विस्तार के वर्षों के रूप में पढ़ी जाती है — गुरुजन, आस्था, संतान, वृद्धि, और वह सौभाग्य जो अच्छे निर्णय जैसा दिखकर आता है। जिस पर आप श्रद्धा रखते हैं वही बढ़ता है, इसलिए परंपरा कहती है कि उसे सोच-समझकर चुनें।",
  "Venus periods are traditionally read as years of relationship and refinement — partnership, beauty, comfort, art and the pleasures of a settled life. What you love takes the wheel.":
    "शुक्र की दशा परंपरागत रूप से संबंध और परिष्कार के वर्षों के रूप में पढ़ी जाती है — साझेदारी, सौंदर्य, सुख-सुविधा, कला और स्थिर जीवन के आनंद। जो आपको प्रिय है, वही दिशा तय करने लगता है।",
  "Saturn periods are traditionally read as the great structural years — discipline, duty, endurance and work that compounds slowly. The tradition regards them as demanding, and reads what they build as built to last.":
    "शनि की दशा परंपरागत रूप से ढाँचा गढ़ने के महान वर्षों के रूप में पढ़ी जाती है — अनुशासन, कर्तव्य, धैर्य और वह श्रम जो धीरे-धीरे संचित होता है। परंपरा इन्हें कठिन मानती है, और जो ये बनाते हैं उसे टिकाऊ मानती है।",
  "Rahu periods are traditionally read as years of appetite — ambition, foreign ground, unconventional routes and a hunger for what is just out of reach. They can carry you far; the classical caution is to check the map while moving.":
    "राहु की दशा परंपरागत रूप से तृष्णा के वर्षों के रूप में पढ़ी जाती है — महत्वाकांक्षा, विदेश-भूमि, अपरंपरागत मार्ग और उस वस्तु की भूख जो अभी पहुँच से थोड़ी बाहर है। यह आपको दूर तक ले जा सकती है; शास्त्रीय सावधानी यह है कि चलते हुए मानचित्र देखते रहें।",
  "Ketu periods are traditionally read as years of release — insight, detachment, spiritual pull and the quiet dismantling of what no longer fits. Less is gained than clarified.":
    "केतु की दशा परंपरागत रूप से विसर्जन के वर्षों के रूप में पढ़ी जाती है — अंतर्दृष्टि, वैराग्य, आध्यात्मिक खिंचाव, और जो अब उपयुक्त नहीं रहा उसका शांत विघटन। यहाँ अर्जन कम और स्पष्टता अधिक होती है।",
};

/* the ANTAR_FLAVOR fragments (narrative.js), dash()-processed */
export const ANTAR_FLAVOR_HI = {
  "brings matters of standing and direction to a head": "प्रतिष्ठा और दिशा से जुड़े विषयों को निर्णायक बिंदु पर लाती है",
  "softens the stretch toward feeling, home and rest": "इस अवधि को भावना, घर और विश्राम की ओर कोमल करती है",
  "quickens it — effort, urgency and courage rise": "इसे गति देती है — परिश्रम, तत्परता और साहस बढ़ते हैं",
  "turns it toward talk, trade, study and paperwork": "इसे संवाद, व्यापार, अध्ययन और लेखा-पत्र की ओर मोड़ती है",
  "opens it out — growth, guidance and opportunity": "इसे खोलती है — वृद्धि, मार्गदर्शन और अवसर",
  "sweetens it — relationship, comfort and taste lead": "इसे मधुर करती है — संबंध, सुख और रुचि आगे रहते हैं",
  "slows and tests it — patient work is favoured": "इसे धीमा और परीक्षित करती है — धैर्यपूर्ण श्रम अनुकूल रहता है",
  "amplifies it — ambition and unusual routes call": "इसे बढ़ा देती है — महत्वाकांक्षा और असामान्य मार्ग पुकारते हैं",
  "loosens it — endings, insight and simplification": "इसे शिथिल करती है — समापन, अंतर्दृष्टि और सरलीकरण",
};

/* the 12 HOUSE_STORY paragraphs (lore.js) */
export const HOUSE_STORY_HI = {
  "The first house is traditionally associated with self, body, and bearing. It governs how you step into the world, your physical presence, and how others first perceive you. Listen for themes of identity and self-expression in your life, as this house sets the stage for your personal journey.":
    "प्रथम भाव परंपरागत रूप से स्वयं, शरीर और आत्म-प्रस्तुति से जुड़ा माना जाता है। यह बताता है कि आप संसार में किस भाव से पैर रखते हैं, आपकी देह-उपस्थिति कैसी है, और लोग पहली बार आपको किस रूप में देखते हैं। अपने जीवन में पहचान और आत्म-अभिव्यक्ति के सूत्रों पर ध्यान दें, क्योंकि यही भाव आपकी व्यक्तिगत यात्रा की भूमिका तय करता है।",
  "The second house is traditionally read as the domain of speech, family, and stored wealth. It speaks to how you voice your values and what you consider your material worth. Pay attention to your relationship with possessions and your family ties, as they shape the foundation of your security.":
    "द्वितीय भाव परंपरागत रूप से वाणी, कुटुम्ब और संचित धन का क्षेत्र माना जाता है। यह दर्शाता है कि आप अपने मूल्यों को किस प्रकार शब्द देते हैं और किसे अपनी भौतिक सामर्थ्य मानते हैं। संपत्ति के साथ अपने संबंध और पारिवारिक बंधनों पर ध्यान दें, क्योंकि वही आपकी सुरक्षा की नींव गढ़ते हैं।",
  "The third house is traditionally associated with courage, siblings, and skill of hand. It governs your ability to learn, communicate, and connect with those close to you. Consider how you express your skills and courage in daily life — this house highlights the ties that bind your immediate world.":
    "तृतीय भाव परंपरागत रूप से पराक्रम, भाई-बहन और हस्तकौशल से जुड़ा माना जाता है। यह सीखने, संवाद करने और निकट के लोगों से जुड़ने की आपकी क्षमता को दर्शाता है। विचार करें कि दैनिक जीवन में आप अपने कौशल और साहस को किस प्रकार व्यक्त करते हैं — यह भाव आपके निकटतम संसार को बाँधने वाले सूत्रों को उजागर करता है।",
  "The fourth house is traditionally associated with home, mother, and inner ground. It touches on your roots, emotional security, and the place you call sanctuary. Reflect on your sense of belonging and how you nurture your inner self, as this house speaks to where you find comfort and stability.":
    "चतुर्थ भाव परंपरागत रूप से घर, माता और भीतरी आधार से जुड़ा माना जाता है। यह आपकी जड़ों, भावनात्मक सुरक्षा और उस स्थान को छूता है जिसे आप अपना आश्रय कहते हैं। अपनेपन के भाव पर और इस पर विचार करें कि आप अपने भीतरी स्वरूप का पोषण कैसे करते हैं, क्योंकि यह भाव बताता है कि आपको सुकून और स्थिरता कहाँ मिलती है।",
  "The fifth house is traditionally read as encompassing creativity, children, and learning. It governs your expressions of joy, romantic inclinations, and intellectual pursuits. Look for where your heart finds delight and how you share that spark with the world, as this house captures your creative drive.":
    "पंचम भाव परंपरागत रूप से सृजनशीलता, संतान और विद्या का क्षेत्र माना जाता है। यह आपके आनंद की अभिव्यक्ति, प्रेम-प्रवृत्ति और बौद्धिक रुचियों को दर्शाता है। देखें कि आपका हृदय कहाँ प्रसन्न होता है और उस चिंगारी को आप संसार के साथ कैसे बाँटते हैं, क्योंकि यही भाव आपकी सृजन-प्रेरणा को धारण करता है।",
  "The sixth house is traditionally associated with work, service, and obstacles met. It deals with daily routines, health, and how you tackle challenges. Consider the rhythms of your work life and how you balance service with self-care — this house speaks to your approach to life's demands.":
    "षष्ठ भाव परंपरागत रूप से कार्य, सेवा और सामने आने वाली बाधाओं से जुड़ा माना जाता है। इसका संबंध दैनिक दिनचर्या, स्वास्थ्य और चुनौतियों से निपटने की आपकी रीति से है। अपने कार्य-जीवन की लय पर और इस पर विचार करें कि आप सेवा तथा आत्म-देखभाल में संतुलन कैसे बनाते हैं — यह भाव जीवन की माँगों के प्रति आपके दृष्टिकोण को दर्शाता है।",
  "The seventh house is traditionally read as the realm of partnership and the other. It governs your relationships, both personal and professional, and how you navigate shared space. Reflect on the balance of give and take in your connections, as this house highlights the dance of togetherness.":
    "सप्तम भाव परंपरागत रूप से साझेदारी और सम्मुख व्यक्ति का क्षेत्र माना जाता है। यह आपके व्यक्तिगत तथा व्यावसायिक संबंधों को और साझा स्थान में आपके व्यवहार को दर्शाता है। अपने संबंधों में देने-लेने के संतुलन पर विचार करें, क्योंकि यह भाव सहजीवन की लय को उजागर करता है।",
  "The eighth house is traditionally associated with depth, change, and what is shared. It invites you to explore transformation, intimacy, and the resources you merge with others. Look at the ways you handle change and shared commitments, as this house digs into the deeper currents of life.":
    "अष्टम भाव परंपरागत रूप से गहराई, परिवर्तन और साझा संसाधनों से जुड़ा माना जाता है। यह आपको रूपांतरण, घनिष्ठता और उन साधनों की खोज के लिए आमंत्रित करता है जिन्हें आप दूसरों के साथ मिलाते हैं। देखें कि आप परिवर्तन और साझा उत्तरदायित्वों को किस प्रकार सँभालते हैं, क्योंकि यह भाव जीवन की गहरी धाराओं में उतरता है।",
  "The ninth house is traditionally read as the domain of fortune, teachers, and belief. It covers your quests for knowledge, spiritual truths, and broader horizons. Tune into your search for meaning and how you expand your worldview, as this house speaks to the journey of discovery and faith.":
    "नवम भाव परंपरागत रूप से भाग्य, गुरुजन और आस्था का क्षेत्र माना जाता है। इसमें ज्ञान की खोज, आध्यात्मिक सत्य और विस्तृत क्षितिज आते हैं। अर्थ की अपनी तलाश पर और इस पर ध्यान दें कि आप अपनी दृष्टि को कैसे विस्तार देते हैं, क्योंकि यह भाव खोज और श्रद्धा की यात्रा को दर्शाता है।",
  "The tenth house is traditionally associated with career, standing, and visible work. It governs your public role, ambitions, and the legacy you build over time. Consider how you pursue goals and the image you project to the world, as this house highlights your professional path and achievements.":
    "दशम भाव परंपरागत रूप से व्यवसाय, प्रतिष्ठा और दृश्यमान कार्य से जुड़ा माना जाता है। यह आपकी सार्वजनिक भूमिका, महत्वाकांक्षाओं और समय के साथ बनने वाली विरासत को दर्शाता है। विचार करें कि आप लक्ष्यों का पीछा कैसे करते हैं और संसार के सामने कैसी छवि रखते हैं, क्योंकि यह भाव आपके व्यावसायिक मार्ग और उपलब्धियों को उजागर करता है।",
  "The eleventh house is traditionally read as encompassing gains, friends, and networks. It speaks to the support systems that help you grow and the aspirations you share with others. Reflect on the community you build and the dreams you chase, as this house celebrates collective success and friendships.":
    "एकादश भाव परंपरागत रूप से लाभ, मित्र और संपर्क-जाल का क्षेत्र माना जाता है। यह उन सहारा-तंत्रों को दर्शाता है जो आपकी वृद्धि में सहायक होते हैं, और उन आकांक्षाओं को जो आप दूसरों के साथ बाँटते हैं। जिस समुदाय को आप बनाते हैं और जिन स्वप्नों का पीछा करते हैं, उन पर विचार करें, क्योंकि यह भाव सामूहिक सफलता और मैत्री का उत्सव है।",
  "The twelfth house is traditionally associated with retreat, expense, and release. It touches on the hidden corners of the psyche, solitude, and the process of letting go. Consider how you find peace and the ways you seek closure, as this house guides you through the cycles of rest and renewal.":
    "द्वादश भाव परंपरागत रूप से एकांत, व्यय और विसर्जन से जुड़ा माना जाता है। यह चित्त के गुप्त कोनों, एकाकीपन और छोड़ देने की प्रक्रिया को छूता है। विचार करें कि आपको शांति कैसे मिलती है और आप समापन किस प्रकार खोजते हैं, क्योंकि यह भाव आपको विश्राम और नवीकरण के चक्रों से होकर ले जाता है।",
};

/* the 9 PLANET_STORY[g].opener paragraphs (interpret.js), dash()-processed */
export const PLANET_OPENER_HI = {
  "Every chart has exactly one Sun, and its house answers a simple question: where do you need to shine to feel like yourself? The tradition treats it as the king of the nine — wherever it sits, that part of life refuses to stay in the background.":
    "हर कुंडली में ठीक एक सूर्य होता है, और उसका भाव एक सरल प्रश्न का उत्तर देता है: स्वयं जैसा अनुभव करने के लिए आपको कहाँ चमकना आवश्यक है? परंपरा उसे नवग्रहों का राजा मानती है — वह जहाँ भी बैठता है, जीवन का वह हिस्सा पृष्ठभूमि में रहने से इनकार कर देता है।",
  "In Vedic astrology the Moon nearly outranks the Sun: it is the mind itself, and a whole layer of the tradition is counted from wherever yours sits. Its house shows what your feelings orbit — what you reach for when nobody is watching.":
    "वैदिक ज्योतिष में चंद्रमा लगभग सूर्य से भी ऊपर है: वही मन है, और परंपरा की एक पूरी परत आपके चंद्रमा की स्थिति से गिनी जाती है। उसका भाव दिखाता है कि आपकी भावनाएँ किसके चारों ओर घूमती हैं — जब कोई नहीं देख रहा होता, तब आप किसकी ओर बढ़ते हैं।",
  "Mars is the chart's supply of nerve — the willingness to push, compete and cut through. Its house shows where you fight, and the tradition is even-handed about it: the same heat that wins battles can start them.":
    "मंगल कुंडली में साहस का स्रोत है — आगे बढ़ने, प्रतिस्पर्धा करने और काट कर निकल जाने की तत्परता। उसका भाव दिखाता है कि आप कहाँ संघर्ष करते हैं, और परंपरा इस पर संतुलित दृष्टि रखती है: जो ताप युद्ध जिताता है, वही युद्ध छेड़ भी सकता है।",
  "Mercury is the fastest planet and the chart's translator — everything that involves words, numbers and quick connections runs through it. Its house shows where your mind does its best trading.":
    "बुध सबसे तीव्र ग्रह है और कुंडली का अनुवादक — शब्द, संख्या और शीघ्र जुड़ाव से जुड़ा सब कुछ उसी से होकर जाता है। उसका भाव दिखाता है कि आपका मन कहाँ अपना सर्वोत्तम विनिमय करता है।",
  "Jupiter is the great benefic — the planet of more. Whichever house holds it is traditionally where life is generous with you, and where you in turn find it easiest to be generous.":
    "गुरु महाशुभ ग्रह है — अधिकता का ग्रह। जो भाव उसे धारण करता है, वहीं परंपरागत रूप से जीवन आपके प्रति उदार रहता है, और वहीं आपको स्वयं उदार होना सबसे सहज लगता है।",
  "Venus is the planet of what delights you — love, art, comfort and taste. Its house is traditionally where life is at its most pleasant, and where you have an eye others lack.":
    "शुक्र उस सबका ग्रह है जो आपको आनंद देता है — प्रेम, कला, सुख और रुचि। उसका भाव परंपरागत रूप से वह स्थान है जहाँ जीवन सबसे सुखद है, और जहाँ आपकी दृष्टि वैसी है जैसी दूसरों की नहीं होती।",
  "Saturn is the slowest of the classical planets, and the tradition calls it the great teacher. Its house is where life makes you wait — and where, after the waiting, you end up more solid than anyone else in the room.":
    "शनि शास्त्रीय ग्रहों में सबसे मंद है, और परंपरा उसे महान गुरु कहती है। उसका भाव वह स्थान है जहाँ जीवन आपसे प्रतीक्षा कराता है — और जहाँ प्रतीक्षा के बाद आप कक्ष में उपस्थित किसी भी व्यक्ति से अधिक ठोस निकलते हैं।",
  "Rahu is not a planet but a point — the lunar node where eclipses occur — and the tradition treats it as pure appetite. Its house shows what you hunger for beyond reason, and where this life keeps pulling you toward the unfamiliar.":
    "राहु ग्रह नहीं, एक बिंदु है — वह चंद्र-नोड जहाँ ग्रहण होते हैं — और परंपरा उसे शुद्ध तृष्णा मानती है। उसका भाव दिखाता है कि आप तर्क से परे किसकी भूख रखते हैं, और यह जीवन आपको अपरिचित की ओर कहाँ खींचता रहता है।",
  "Ketu is Rahu's opposite point — the south node — and the tradition reads it as what you have already mastered and are half-finished wanting. Its house shows where you carry skill without hunger, and detachment that others mistake for distance.":
    "केतु राहु का सम्मुख बिंदु है — दक्षिण नोड — और परंपरा उसे उस वस्तु के रूप में पढ़ती है जिसमें आप पहले ही प्रवीण हो चुके हैं और जिसकी चाह अब आधी बुझ चुकी है। उसका भाव दिखाता है कि आप कहाँ बिना भूख के कौशल धारण करते हैं, और वह वैराग्य जिसे दूसरे दूरी समझ बैठते हैं।",
};

/* ------------------------------------------------ token pass ------ */

/* Tokens are applied longest-first, once, in a single scan, with
   non-letter boundaries. Only lines already recognised as structural
   are token-passed (see the header note). */
const TOKENS = {
  ...GRAHA_HI, ...SIGN_HI, ...SIGN_AB_HI, ...NAK_HI, ...WEEKDAY_HI,
  ...MONTH_HI, ...TITHI_HI, ...PAKSHA_HI, ...NITYA_YOGA_HI, ...KARANA_HI,
  ...KARAKA_HI, ...KOOTA_HI, ...VARNA_HI, ...VASHYA_HI, ...YONI_HI,
  ...GANA_HI, ...NADI_HI, ...TATVA_HI, ...GRAHA_AB_HI, ...HOUSE_SENSE_HI,
  /* lowercase avakhada/koota values as match.js emits them */
  deva: "देव", manushya: "मनुष्य", rakshasa: "राक्षस",
  adi: "आदि", madhya: "मध्य", antya: "अन्त्य",
  /* structural vocabulary that is unambiguous inside translated prose */
  "always retrograde": "सदैव वक्री",
  retrograde: "वक्री",
  direct: "मार्गी",
  combust: "अस्त",
  Combust: "अस्त",
  "own sign": "स्वक्षेत्र",
  exalted: "उच्च",
  debilitated: "नीच",
  houses: "भावों",
  house: "भाव",
  bhava: "भाव",
  signs: "राशियाँ",
  sign: "राशि",
  lagna: "लग्न",
  Lagna: "लग्न",
  Asc: "लग्न",
  Ascendant: "लग्न",
  bindus: "बिंदु",
  paksha: "पक्ष",
  pada: "चरण",
  nakshatra: "नक्षत्र",
  mahadasha: "महादशा",
  antardasha: "अंतर्दशा",
  and: "और",
  no: "नहीं",
  years: "वर्ष",
  balance: "शेष",
  active: "सक्रिय",
  now: "अभी",
  "favourable seat": "अनुकूल स्थान",
  "neutral-to-testing seat": "सामान्य से परीक्षात्मक स्थान",
  "°/d": "°/दिन",
};

const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const TOKEN_KEYS = Object.keys(TOKENS).sort((a, b) => b.length - a.length);
const TOKEN_RE = new RegExp(
  `(?<![A-Za-z])(?:${TOKEN_KEYS.map(esc).join("|")})(?![A-Za-z])`, "g");

/* the twelve houses take their Sanskrit ordinals in Hindi jyotish
   prose ("दशम भाव", never "10वें भाव"); every other ordinal keeps the
   numeral. */
const HOUSE_ORD_HI = ["", "प्रथम", "द्वितीय", "तृतीय", "चतुर्थ", "पंचम", "षष्ठ",
  "सप्तम", "अष्टम", "नवम", "दशम", "एकादश", "द्वादश"];
const houseOrd = n => HOUSE_ORD_HI[+n] || `${n}वें`;

function tokens(s) {
  let out = s.replace(TOKEN_RE, m => TOKENS[m]);
  out = out.replace(/(?<![\w°])(\d+)(?:st|nd|rd|th)(?![A-Za-z])/g, "$1वें");
  out = out.replace(/(?<![\w])(\d+)h (\d+)m(?![A-Za-z])/g, "$1घं $2मि");
  /* lists first ("1वें और 6वें भावों" -> "प्रथम और षष्ठ भावों") */
  out = out.replace(/((?:\d+वें(?:, | तथा | और ))+\d+वें) (भावों|भाव)/g,
    (_, list, tail) => list.replace(/(\d+)वें/g, (__, n) => houseOrd(n)) + " " + tail);
  out = out.replace(/(\d+)(?:वें|वाँ|वीं) (भाव)(?![ोा])/g, (_, n, t) => houseOrd(n) + " " + t);
  return out;
}

export { tokens as translateTokens };

/* ------------------------------------------------ table cells ----- */

/* Exact whole-cell matches. Kept separate from TOKENS so that header
   words which are ambiguous inside prose ("From", "To", "House",
   "Jupiter in") can be translated safely in a table without risking
   the same word elsewhere. */
export const CELLS = {
  /* §1 panchang */
  "Limb": "अंग", "Value": "मान", "How it is derived": "गणना का आधार",
  "Until": "कब तक",
  "Vara (weekday)": "वार (सप्ताह-दिन)",
  "Tithi (lunar day)": "तिथि (चंद्र-दिवस)",
  "Nakshatra": "नक्षत्र", "Yoga": "योग", "Karana": "करण",
  "the weekday's traditional lord (sunrise to sunrise)":
    "उस वार का परंपरागत स्वामी (सूर्योदय से सूर्योदय तक)",
  "(Sun + Moon longitude) ÷ 13°20'": "(सूर्य + चंद्र का देशांतर) ÷ 13°20'",
  "the half-tithi running at birth": "जन्म के समय चल रही अर्ध-तिथि",
  "Sunrise": "सूर्योदय", "Sunset": "सूर्यास्त", "Day length": "दिनमान",
  "Local mean time of birth": "जन्म का स्थानीय मध्यम समय",
  "Local sidereal time": "स्थानीय नाक्षत्र समय",
  "same rule, evening crossing": "वही नियम, सायंकालीन संक्रमण",
  "sunset − sunrise": "सूर्यास्त − सूर्योदय",
  "Greenwich sidereal time + east longitude — the angle that fixes the ascendant":
    "ग्रीनविच नाक्षत्र समय + पूर्वी देशांतर — वही कोण जो लग्न निश्चित करता है",
  /* §2 avakhada */
  "Attribute": "गुण", "Source": "स्रोत",
  "Rashi (Moon sign)": "राशि (चंद्र राशि)", "Rashi lord": "राशि स्वामी",
  "Nakshatra · pada": "नक्षत्र · चरण", "Nakshatra lord": "नक्षत्र स्वामी",
  "Varna": "वर्ण", "Vashya": "वश्य", "Yoni": "योनि", "Gana": "गण",
  "Nadi": "नाड़ी", "Tatva": "तत्व", "Namakshara": "नामाक्षर", "Yunja": "युंजा",
  "27 equal divisions of the zodiac": "राशिचक्र के 27 समान विभाग",
  "class of the Moon sign": "चंद्र राशि का वर्ण",
  "nature-group of the Moon sign": "चंद्र राशि का वश्य-वर्ग",
  /* §3 positions */
  "Point": "बिंदु", "Sign · degree": "राशि · अंश", "Nak. lord": "नक्षत्र स्वामी",
  "House": "भाव", "Motion": "गति", "Speed": "चाल", "Dignity": "अवस्था",
  "Planet": "ग्रह", "Seat": "स्थान", "Aspects cast": "डाली गई दृष्टियाँ",
  /* §4 houses + chalit */
  "Field (traditional)": "क्षेत्र (परंपरागत)", "Sign": "राशि", "Lord": "स्वामी",
  "Lord sits in": "स्वामी की स्थिति", "Occupants": "स्थित ग्रह",
  "Cusp": "संधि", "Begins at": "आरंभ",
  /* §8/§9 dashas */
  "Years": "वर्ष", "From": "से", "To": "तक",
  "Antardasha": "अंतर्दशा", "Pratyantar": "प्रत्यंतर", "◀ now": "◀ अभी",
  /* §10 yogini */
  "Yogini": "योगिनी", "Ruled by": "स्वामी", "**active**": "**सक्रिय**",
  /* §11 ashtakavarga */
  "**SAV**": "**SAV**", "Lagna": "लग्न",
  /* §12 shadbala */
  "Rank": "क्रम", "Graha": "ग्रह", "Sthana": "स्थान", "Kaala": "काल",
  "Dig": "दिक्", "Cheshta": "चेष्टा", "Naisargika": "नैसर्गिक", "Drik": "दृक्",
  "Total": "कुल", "Rupas": "रूप", "Field": "क्षेत्र", "**Total**": "**कुल**",
  /* §13 gochara */
  "Transiting": "गोचर राशि", "From Moon": "चंद्र से", "From lagna": "लग्न से",
  "Classical read": "शास्त्रीय पाठ", "Bindus (§11)": "बिंदु (§11)",
  "In this sign until": "इस राशि में कब तक",
  /* §17 chara karakas */
  "Karaka": "कारक", "Arc in sign": "राशि में तय अंश",
  /* love report */
  "Koota": "कूट", "What it weighs": "क्या तौला जाता है", "Score": "अंक",
  "Out of": "में से", "Period": "अवधि", "Window": "अवधि",
  "Jupiter in": "गुरु की राशि",
  "temperamental class of the two Moon signs": "दोनों चंद्र राशियों का वर्ण",
  "mutual sway between the sign natures": "राशि-प्रकृतियों का पारस्परिक वश्यत्व",
  "birth stars counted against each other, both directions":
    "दोनों जन्म-नक्षत्रों की परस्पर गणना, दोनों दिशाओं में",
  "the distance between the two Moon signs": "दोनों चंद्र राशियों के बीच की दूरी",
};

/* Cell-level regex templates, tried in order after CELLS misses. */
const CELL_TEMPLATES = [
  /* §1 panchang */
  [/^(\w+day), ruled by (\w+)$/, (m) => `${m[1]} — स्वामी ${m[2]}`],
  [/^(.+) \((Shukla|Krishna) paksha, day (\d+) of 15\)$/,
    (m) => `${m[1]} (${m[2]} पक्ष, 15 में से ${m[3]}वाँ दिन)`],
  [/^Moon–Sun elongation of ([\d.]+)° ÷ 12° per tithi$/,
    (m) => `चंद्र–सूर्य का अंतर ${m[1]}° ÷ प्रति तिथि 12°`],
  [/^(.+) \(pada (\d+)\)$/, (m) => `${m[1]} (चरण ${m[2]})`],
  [/^Moon at (\w+) (\S+)$/, (m) => `चंद्र ${m[1]} ${m[2]} पर`],
  [/^Moon at (\S+) (\w+)$/, (m) => `चंद्र ${m[2]} ${m[1]} पर`],
  [/^Sun's centre at −0°50' altitude at (.+)$/,
    (m) => `${m[1]} में सूर्य-बिंब का केंद्र −0°50' ऊँचाई पर`],
  [/^clock time shifted to the birthplace meridian \((.+) ÷ 15\)$/,
    (m) => `घड़ी का समय जन्मस्थान की देशांतर-रेखा पर स्थानांतरित (${m[1]} ÷ 15)`],
  /* §2 avakhada sources */
  [/^lord of (\w+)$/, (m) => `${m[1]} का स्वामी`],
  [/^the Vimshottari lord of (.+)$/, (m) => `${m[1]} का विंशोत्तरी स्वामी`],
  [/^instinct-nature of (.+)$/, (m) => `${m[1]} की योनि-प्रकृति`],
  [/^temperament group of (.+)$/, (m) => `${m[1]} का गण`],
  [/^constitution group of (.+)$/, (m) => `${m[1]} की नाड़ी`],
  [/^element of the Moon sign \((\w+)\)$/, (m) => `चंद्र राशि (${m[1]}) का तत्व`],
  [/^naming syllable of (.+) pada (\d+), from the classical avakahada chakra$/,
    (m) => `${m[1]} चरण ${m[2]} का नामाक्षर, शास्त्रीय अवकहड़ा चक्र से`],
  [/^(.+) is nakshatra (\d+) of 27 — first\/middle\/final third$/,
    (m) => `${m[1]} 27 नक्षत्रों में ${m[2]}वाँ है — प्रथम/मध्य/अंतिम तिहाई`],
  /* §3 positions */
  [/^combust \(([\d.]+)° from Sun\)$/, (m) => `अस्त (सूर्य से ${m[1]}°)`],
  /* §6 aspects: "3rd → Pisces (11th house) — falls on Sun, Mercury; 7th → …" */
  [/^\d+(?:st|nd|rd|th) → \w+ \(\d+(?:st|nd|rd|th) house\)/, (m) =>
    m.input.split("; ").map(part => {
      const p = part.match(/^(\d+)(?:st|nd|rd|th) → (\w+) \((\d+)(?:st|nd|rd|th) house\)(?: — falls on (.+))?$/);
      if (!p) return part;
      return `${houseOrd(p[1])} दृष्टि → ${p[2]} (${houseOrd(p[3])} भाव)` +
        (p[4] ? ` — ${p[4]} पर` : "");
    }).join("; ")],
  /* a lone ordinal cell is always a house or sign position */
  [/^(\d+)(?:st|nd|rd|th)$/, (m) => houseOrd(m[1])],
  /* §10 yogini years cell */
  [/^(\d+) \(balance\)$/, (m) => `${m[1]} (शेष)`],
  /* love: Jupiter window grade cells */
  [/^(strong|good|fair|quiet)(?: \((.+)\))?$/, (m) => GRADE_HI[m[1]] +
    (m[2] ? ` (${m[2].split("; ").map(seg =>
      seg.split(" = ").map(x => TARGET_HI[x] || x).join(" = ")).join("; ")})` : "")],
  /* love: koota "why" cells with interpolated values */
  [/^instinct natures - (.+) and (.+)$/, (m) => `योनि-प्रकृति — ${m[1]} और ${m[2]}`],
  [/^friendship of the Moon-sign lords, (\w+) and (\w+)$/,
    (m) => `चंद्र-राशि स्वामियों की मैत्री — ${m[1]} और ${m[2]}`],
  [/^temperament groups - (.+) and (.+)$/, (m) => `गण — ${m[1]} और ${m[2]}`],
  [/^constitution - (.+) and (.+)$/, (m) => `नाड़ी — ${m[1]} और ${m[2]}`],
  /* love: overlap/side-by-side headers "Sangram (maha–antar)" */
  [/^(.+) \(maha–antar\)$/, (m) => `${m[1]} (महा–अंतर)`],
];

/* ------------------------------------------------ static lines ---- */

export const DRAFT_NOTE =
  "*मसौदा: कुछ व्याख्यात्मक अनुच्छेद अभी अंग्रेज़ी में हैं; समीक्षा के बाद वे भी हिन्दी में आएँगे।*";

export const VOICE_NOTE_EN =
  "*Every position in this report is computed deterministically by Astra's " +
  "ephemeris and rule engine, and every reading names the placement that " +
  "produced it. Interpretive lines describe what a placement is " +
  "**traditionally associated with** within Vedic astrology — they are a " +
  "compass for reflection, not a prediction, and nothing here is medical, " +
  "legal or financial advice.*";

export const LINES = {
  [VOICE_NOTE_EN]:
    "*इस रिपोर्ट की प्रत्येक स्थिति Astra के गणित-इंजन और नियम-इंजन द्वारा निर्धारित रूप से " +
    "गणना की गई है, और प्रत्येक व्याख्या उस स्थिति का नाम लेती है जिससे वह निकली है। " +
    "व्याख्यात्मक पंक्तियाँ बताती हैं कि वैदिक ज्योतिष में कोई स्थिति " +
    "**परंपरागत रूप से किससे जुड़ी मानी जाती है** — ये चिंतन के लिए दिशा-सूचक हैं, " +
    "भविष्यवाणी नहीं, और इनमें से कुछ भी चिकित्सकीय, कानूनी या वित्तीय सलाह नहीं है।*",

  /* ---- kundali sections ---- */
  "## 1. Birth Panchang": "## 1. जन्म पंचांग",
  "The five limbs of the Vedic day you were born on, computed from the Sun–Moon geometry at the birth moment. Each limb also shows when it ended — the transition the engine finds by running the same geometry forward:":
    "जिस वैदिक दिन में आपका जन्म हुआ, उसके पाँच अंग — जन्म-क्षण की सूर्य–चंद्र ज्यामिति से गणना किए गए। प्रत्येक अंग यह भी दिखाता है कि वह कब समाप्त हुआ — वह संक्रमण जिसे इंजन उसी ज्यामिति को आगे चलाकर निकालता है:",
  "**The birth sky's clock** — the local solar and sidereal frame the chart was cast in:":
    "**जन्म-आकाश की घड़ी** — वह स्थानीय सौर और नाक्षत्र ढाँचा जिसमें कुंडली बनाई गई:",

  "## 2. Avakhada — Moon-Based Identity": "## 2. अवकहड़ा — चंद्रमा से बनी पहचान",
  "The classical identity block, read entirely from the Moon's position at birth — the same categories the ashtakoota matching system scores:":
    "शास्त्रीय पहचान-खंड, जो पूर्णतः जन्म के समय चंद्रमा की स्थिति से पढ़ा जाता है — वही श्रेणियाँ जिन्हें अष्टकूट गुण मिलान अंक देता है:",
  "*Where platforms disagree on an attribute's scheme (they do — even with each other), Astra ships only the attributes whose rule reproduces the printed benchmarks for both reference charts, and leaves the rest out rather than guessing.*":
    "*जहाँ अलग-अलग मंच किसी गुण की पद्धति पर असहमत होते हैं (और वे आपस में भी असहमत होते हैं), वहाँ Astra केवल वे गुण देता है जिनका नियम दोनों संदर्भ कुंडलियों के मुद्रित मानकों को दोहरा देता है; शेष का अनुमान लगाने के बजाय उन्हें छोड़ देता है।*",

  "## 3. Planetary Positions": "## 3. ग्रह-स्थिति",
  "Sidereal longitudes (Lahiri). Houses are whole-sign, counted from the ascendant. Speed is the graha's actual daily motion at the birth moment; combustion is proximity to the Sun within the classical orb for that graha.":
    "निरयन (लाहिड़ी) देशांतर। भाव पूर्ण-राशि पद्धति से, लग्न से गिने गए हैं। चाल जन्म-क्षण पर ग्रह की वास्तविक दैनिक गति है; अस्तता उस ग्रह के लिए शास्त्रीय सीमा के भीतर सूर्य की निकटता है।",
  "*Method notes: Rahu/Ketu are the **true** lunar node (some platforms print the mean node; the two can differ by up to ~1.7°, enough to move a node's nakshatra). Seconds of arc are display resolution — the ephemeris's verified worst-case error is under 1' for Sun, Moon, ascendant and nodes, and a few minutes of arc for the slow planets, which cannot move a sign or nakshatra here but can matter within ~0.1° of a boundary.*":
    "*पद्धति-टिप्पणी: राहु/केतु यहाँ **वास्तविक (ट्रू)** चंद्र-नोड हैं (कुछ मंच मध्यम नोड छापते हैं; दोनों में ~1.7° तक अंतर हो सकता है, जो किसी नोड का नक्षत्र बदलने के लिए पर्याप्त है)। विकला केवल प्रदर्शन की सूक्ष्मता है — गणित-इंजन की सत्यापित अधिकतम त्रुटि सूर्य, चंद्र, लग्न और नोड के लिए 1' से कम है, तथा मंद ग्रहों के लिए कुछ कलाएँ, जो यहाँ राशि या नक्षत्र नहीं बदल सकतीं, पर किसी संधि के ~0.1° भीतर महत्व रख सकती हैं।*",
  "**Rashi chart (D1)** — fixed-sign grid, Aries at the top second cell, reading clockwise:":
    "**राशि कुंडली (D1)** — स्थिर-राशि ग्रिड, ऊपर के दूसरे खाने में मेष, दक्षिणावर्त पढ़ें:",

  "## 4. Lagna and the Twelve Houses": "## 4. लग्न और बारह भाव",
  "Alongside the whole-sign houses above, some traditions overlay the **Bhav Chalit** frame — twelve unequal cusps cut by the Placidus rule (Astra's cusps reproduce the printed benchmark to 0.02°):":
    "ऊपर की पूर्ण-राशि भाव-व्यवस्था के साथ-साथ कुछ परंपराएँ **भाव चलित** ढाँचा भी रखती हैं — प्लेसिडस नियम से कटी बारह असमान भाव-संधियाँ (Astra की संधियाँ मुद्रित मानक को 0.02° तक दोहराती हैं):",
  "*In your chart the chalit frame moves no graha out of its whole-sign house — the two systems agree end to end.*":
    "*आपकी कुंडली में चलित ढाँचा किसी ग्रह को उसके पूर्ण-राशि भाव से बाहर नहीं ले जाता — दोनों पद्धतियाँ आद्योपांत सहमत हैं।*",

  "## 5. Planet-by-Planet Readings": "## 5. ग्रह-दर-ग्रह विवेचन",
  "Each graha read three ways — what it stands for, the sign it wears, and the house it works from. Every sentence keys off the placement shown in bold above it; nothing here is generic to a Sun sign.":
    "प्रत्येक ग्रह तीन दृष्टियों से पढ़ा गया है — वह किसका द्योतक है, वह कौन-सी राशि धारण करता है, और किस भाव से कार्य करता है। प्रत्येक वाक्य उसके ऊपर मोटे अक्षरों में दिखाई गई स्थिति से निकलता है; यहाँ कुछ भी सूर्य-राशि जैसा सामान्य नहीं है।",

  "## 6. Aspects and Conjunctions": "## 6. दृष्टि और युति",
  "Every planet casts its full aspect (drishti) on the 7th sign from its seat; Mars additionally on the 4th and 8th, Jupiter on the 5th and 9th, Saturn on the 3rd and 10th. The table shows where each aspect lands in **your** chart and which planets receive it. (This engine follows the classical Parashari convention in which the nodes cast no aspects of their own; some schools give them Jupiter's set.)":
    "प्रत्येक ग्रह अपने स्थान से सातवीं राशि पर पूर्ण दृष्टि डालता है; मंगल अतिरिक्त रूप से चौथी और आठवीं पर, गुरु पाँचवीं और नवीं पर, शनि तीसरी और दसवीं पर। यह तालिका दिखाती है कि **आपकी** कुंडली में प्रत्येक दृष्टि कहाँ गिरती है और किन ग्रहों पर पड़ती है। (यह इंजन उस शास्त्रीय पाराशरी परंपरा का अनुसरण करता है जिसमें नोड अपनी कोई दृष्टि नहीं डालते; कुछ शाखाएँ उन्हें गुरु की दृष्टियाँ देती हैं।)",
  "**Conjunctions** — grahas sharing one sign:": "**युतियाँ** — एक ही राशि में स्थित ग्रह:",
  "**Conjunctions** — no two grahas share a sign in this chart.":
    "**युतियाँ** — इस कुंडली में कोई दो ग्रह एक राशि साझा नहीं करते।",

  "## 7. Divisional Charts (Vargas)": "## 7. वर्ग कुंडलियाँ",
  "**Vargottama** — no point repeats its birth sign in the navamsa here.":
    "**वर्गोत्तम** — यहाँ नवांश में कोई बिंदु अपनी जन्म-राशि नहीं दोहराता।",

  "## 8. Vimshottari Dasha — All Three Levels": "## 8. विंशोत्तरी दशा — तीनों स्तर",
  "### Mahadashas (major periods)": "### महादशाएँ (मुख्य अवधियाँ)",
  "### Antardashas (sub-periods) within each mahadasha":
    "### प्रत्येक महादशा की अंतर्दशाएँ (उप-अवधियाँ)",

  "## 9. The Full Clock — Every Pratyantardasha": "## 9. पूरी घड़ी — प्रत्येक प्रत्यंतर दशा",
  "The Vimshottari clock's third level, complete: all eighty-one antardashas with their nine pratyantars each — the full table serious practitioners expect, computed rather than padded.":
    "विंशोत्तरी घड़ी का तीसरा स्तर, पूर्ण रूप में: सभी इक्यासी अंतर्दशाएँ और प्रत्येक की नौ प्रत्यंतर दशाएँ — वही पूरी तालिका जिसकी गंभीर ज्योतिषी अपेक्षा करते हैं, भरी हुई नहीं बल्कि गणना की हुई।",

  "## 10. Yogini Dasha — The Second Clock": "## 10. योगिनी दशा — दूसरी घड़ी",
  "A parallel timing tradition: eight yoginis on a 36-year cycle, each ruled by a graha. The sequence is seeded by the birth nakshatra exactly as Vimshottari is — Astra's table reproduces the printed benchmark's dates to the day.":
    "एक समानांतर काल-गणना परंपरा: 36 वर्ष के चक्र में आठ योगिनियाँ, प्रत्येक का एक ग्रह स्वामी। इसका क्रम ठीक विंशोत्तरी की तरह जन्म-नक्षत्र से आरंभ होता है — Astra की तालिका मुद्रित मानक की तिथियों को दिन-प्रतिदिन दोहराती है।",
  "*Where the two clocks agree on a season's tone, tradition weighs it doubly; where they differ, Vimshottari leads.*":
    "*जहाँ दोनों घड़ियाँ किसी काल के स्वर पर सहमत हों, वहाँ परंपरा उसे दोहरा महत्व देती है; जहाँ वे भिन्न हों, वहाँ विंशोत्तरी प्रमुख रहती है।*",

  "## 11. Ashtakavarga — Transit Strength Map": "## 11. अष्टकवर्ग — गोचर-बल का मानचित्र",
  "Each of the seven grahas grants benefic points (bindus) to the twelve signs, judged from eight vantage points (the seven grahas and the lagna). A sign's total (Sarvashtakavarga) is traditionally read as how well transits through that sign tend to support you — more bindus, smoother passage.":
    "सातों ग्रह बारह राशियों को शुभ बिंदु देते हैं, और यह निर्णय आठ दृष्टि-बिंदुओं (सात ग्रह तथा लग्न) से होता है। किसी राशि का योग (सर्वाष्टकवर्ग) परंपरागत रूप से यह बताता है कि उस राशि से होकर होने वाले गोचर आपका कितना साथ देते हैं — जितने अधिक बिंदु, उतना सहज मार्ग।",
  "*The Lagna row is the ascendant's own bhinnashtakavarga (49 bindus across the twelve signs); by the classical rule it is shown but never added into the SAV totals, which sum the seven graha rows only — 337 for every chart ever cast.*":
    "*लग्न की पंक्ति लग्न का अपना भिन्नाष्टकवर्ग है (बारह राशियों में कुल 49 बिंदु); शास्त्रीय नियम से इसे दिखाया तो जाता है पर SAV के योग में कभी नहीं जोड़ा जाता, जो केवल सात ग्रह-पंक्तियों का योग है — प्रत्येक कुंडली में सदैव 337।*",

  "## 12. Shadbala — Six-Fold Strength": "## 12. षड्बल — छह प्रकार का बल",
  "The classical strength computation (Brihat Parashara Hora Shastra): six sources of strength per graha — positional (sthana), temporal (kaala), directional (dig), motional (cheshta), natural (naisargika) and aspectual (drik) — summed in virupas, 60 virupas to a rupa. Ranked strongest first:":
    "शास्त्रीय बल-गणना (बृहत् पाराशर होरा शास्त्र): प्रत्येक ग्रह के लिए बल के छह स्रोत — स्थान बल, काल बल, दिक् बल, चेष्टा बल, नैसर्गिक बल और दृक् बल — विरूप में जोड़े जाते हैं, 60 विरूप का एक रूप। सबसे प्रबल पहले:",
  "**Bhava Bala** — the same discipline applied to the twelve houses, ranked:":
    "**भाव बल** — वही विधि बारह भावों पर लागू, क्रमानुसार:",

  "*The Moon crosses a sign in about two and a quarter days and the Sun in a month, so their rows date quickly; Jupiter, Saturn and the nodes set the season. Sign-change dates are approximate near a station, when a planet crawls across the boundary.*":
    "*चंद्रमा लगभग सवा दो दिन में और सूर्य लगभग एक मास में राशि बदलता है, इसलिए उनकी पंक्तियाँ शीघ्र पुरानी पड़ जाती हैं; ऋतु का स्वर गुरु, शनि और नोड तय करते हैं। वक्री/मार्गी होने के निकट, जब ग्रह संधि पर धीरे-धीरे सरकता है, राशि-परिवर्तन की तिथियाँ अनुमानित होती हैं।*",
  "*The Moon crosses a sign in about two and a quarter days and the Sun in a month, so their rows date quickly; Jupiter, Saturn and the nodes set the season. Today the transiting Moon stands 8th from your natal Moon — chandrashtama, a named low-energy day in the tradition: a pacing note, not a warning.*":
    "*चंद्रमा लगभग सवा दो दिन में और सूर्य लगभग एक मास में राशि बदलता है, इसलिए उनकी पंक्तियाँ शीघ्र पुरानी पड़ जाती हैं; ऋतु का स्वर गुरु, शनि और नोड तय करते हैं। आज गोचर का चंद्रमा आपके जन्म-चंद्र से अष्टम है — चंद्राष्टम, परंपरा में नामांकित एक मंद-ऊर्जा दिवस: यह गति सँभालने की सूचना है, चेतावनी नहीं।*",
  "*This snapshot is the report-form of what the app computes live; the classical read describes the transit seat, and never overrides the running dasha context in §8.*":
    "*यह चित्र वही है जो ऐप सजीव रूप से गणना करता है, रिपोर्ट के रूप में; शास्त्रीय पाठ केवल गोचर-स्थान का वर्णन करता है और §8 में चल रही दशा के संदर्भ को कभी नहीं काटता।*",

  "## 14. Yogas — With the Working Shown": "## 14. योग — गणना सहित",
  "## 15. Sade Sati — Saturn's Pass Over Your Moon": "## 15. साढ़े साती — आपके चंद्रमा पर शनि का भ्रमण",
  "## 16. Doshas — Verdicts With the Rule Shown": "## 16. दोष — नियम सहित निष्कर्ष",
  "Four classical afflictions, each checked against this chart with the rule written out. An absent dosha gets its reasoning too — a verdict you cannot audit is not a verdict.":
    "चार शास्त्रीय दोष, प्रत्येक की इस कुंडली पर नियम सहित जाँच। अनुपस्थित दोष का कारण भी लिखा गया है — जिस निष्कर्ष की जाँच न की जा सके वह निष्कर्ष नहीं है।",
  "### Manglik": "### मांगलिक",
  "*Traditions differ on how much weight this carries and on many cancelling factors; the placement is a data point for matching, never a sentence.*":
    "*इसका कितना भार है और कौन-कौन से निवारक कारक हैं, इस पर परंपराएँ भिन्न हैं; यह स्थिति मिलान के लिए एक तथ्य है, कोई दंडादेश नहीं।*",
  "*None of these placements is a sentence. Within Vedic astrology a dosha names a pattern to be aware of; traditions attach many cancelling factors, and this report's job is to show you exactly what is — and is not — in the chart.*":
    "*इनमें से कोई भी स्थिति दंडादेश नहीं है। वैदिक ज्योतिष में दोष उस प्रवृत्ति का नाम है जिसके प्रति सचेत रहना चाहिए; परंपराएँ उससे अनेक निवारक कारक जोड़ती हैं, और इस रिपोर्ट का काम आपको ठीक-ठीक दिखाना है कि कुंडली में क्या है — और क्या नहीं है।*",

  "## 17. Chara Karakas — The Movable Significators": "## 17. चर कारक — चल कारक",
  "Jaimini's movable significators rank the grahas by how far each has travelled through its sign — the furthest-travelled becomes the Atmakaraka, the soul's own significator, down to the Darakaraka, the significator of the partner. Shown under the eight-karaka scheme (seven grahas plus Rahu, whose arc counts from the end of its sign); the seven-karaka variant follows.":
    "जैमिनि के चर कारक ग्रहों को इस आधार पर क्रम देते हैं कि प्रत्येक ने अपनी राशि में कितनी दूरी तय की है — सर्वाधिक दूरी तय करने वाला आत्मकारक बनता है, अर्थात् आत्मा का कारक, और अंत में दारकारक, जो जीवनसाथी का कारक है। यहाँ अष्ट-कारक पद्धति दी गई है (सात ग्रह और राहु, जिसका अंश उसकी राशि के अंत से गिना जाता है); उसके बाद सप्त-कारक पद्धति है।",

  "*Astra is a compass, not an oracle. These pages describe traditional associations so you can explore and reflect — the decisions remain yours.*":
    "*Astra दिशा-सूचक है, भविष्यवक्ता नहीं। ये पृष्ठ परंपरागत संबंधों का वर्णन करते हैं ताकि आप खोज और चिंतन कर सकें — निर्णय आपके ही रहते हैं।*",

  /* ---- love report ---- */
  "## 1. Two Charts, Side by Side": "## 1. दो कुंडलियाँ, आमने-सामने",
  "## 2. Ashtakoota — The Eight-Fold Score": "## 2. अष्टकूट — आठ कूटों का गुण मिलान",
  "The classical gun milan compares the two Moons across eight kootas worth 36 points in total. Every score below shows what was compared and why it scored as it did:":
    "शास्त्रीय गुण मिलान दोनों चंद्रमाओं की तुलना आठ कूटों पर करता है, जिनका कुल 36 गुण है। नीचे प्रत्येक अंक बताता है कि क्या तुलना की गई और उसे वह अंक क्यों मिला:",
  "How every score was actually derived — the mechanic, not a pointer at an unshown table:":
    "प्रत्येक अंक वास्तव में कैसे निकला — पूरी विधि, किसी अनदिखी तालिका का संकेत मात्र नहीं:",
  "The tradition itself reads these as weights inside a 36-point total, never as omens on their own — which is why the total, not any single koota, carries the verdict.":
    "परंपरा स्वयं इन्हें 36 गुणों के भीतर के भार के रूप में पढ़ती है, अकेले किसी शकुन के रूप में नहीं — इसीलिए निष्कर्ष कुल योग से निकलता है, किसी एक कूट से नहीं।",
  "*Computed in the classical direction (first chart → second); the tables are the standard Parashari ones, and the koota arithmetic was validated against an independently printed professional match of these same Moon positions.*":
    "*गणना शास्त्रीय दिशा में की गई है (पहली कुंडली → दूसरी); तालिकाएँ मानक पाराशरी हैं, और कूट-गणित को इन्हीं चंद्र-स्थितियों के एक स्वतंत्र रूप से मुद्रित व्यावसायिक मिलान के विरुद्ध सत्यापित किया गया है।*",

  "## 3. Manglik — Both Charts": "## 3. मांगलिक — दोनों कुंडलियाँ",
  "Counted from the lagna, both charts carry the placement — and the widely used pairing rule reads two matching statuses as balancing each other.":
    "लग्न से गिनने पर दोनों कुंडलियों में यह स्थिति है — और व्यापक रूप से प्रयुक्त मिलान-नियम दो समान स्थितियों को परस्पर संतुलनकारी मानता है।",
  "Counted from the lagna, neither chart carries the placement, so the question does not arise for this pair.":
    "लग्न से गिनने पर किसी भी कुंडली में यह स्थिति नहीं है, इसलिए इस युगल के लिए यह प्रश्न उठता ही नहीं।",
  "Counted from the lagna, the two charts differ on this point. Traditions list many balancing factors before weighing it, and this system treats it as one datum inside the whole comparison, never a verdict on its own.":
    "लग्न से गिनने पर दोनों कुंडलियाँ इस बिंदु पर भिन्न हैं। परंपराएँ इसे तौलने से पहले अनेक संतुलनकारी कारक गिनाती हैं, और यह पद्धति इसे पूरी तुलना के भीतर एक तथ्य मानती है, अकेले में कोई निष्कर्ष नहीं।",
  "*A southern school adds the 2nd house to the set; that wider reading **does** change one of the verdicts above.*":
    "*एक दक्षिणी शाखा इस समूह में द्वितीय भाव भी जोड़ती है; उस व्यापक पाठ से ऊपर दिए गए निष्कर्षों में से एक **बदल जाता है**।*",
  "*A southern school adds the 2nd house to the set; neither chart has Mars in the 2nd from lagna or Moon, so that wider reading changes nothing here.*":
    "*एक दक्षिणी शाखा इस समूह में द्वितीय भाव भी जोड़ती है; किसी भी कुंडली में मंगल लग्न या चंद्र से द्वितीय में नहीं है, इसलिए उस व्यापक पाठ से यहाँ कुछ नहीं बदलता।*",

  "## 4. Venus and the Darakaraka": "## 4. शुक्र और दारकारक",
  "Two independent lenses on partnership — Venus by placement, and Jaimini's Darakaraka by degree ranking:":
    "साझेदारी को देखने की दो स्वतंत्र दृष्टियाँ — स्थिति के आधार पर शुक्र, और अंश-क्रम के आधार पर जैमिनि का दारकारक:",

  "## 5. Dasha Overlap — Your Two Timelines Together": "## 5. दशा-संपात — आपकी दोनों काल-रेखाएँ एक साथ",
  "*Reading note: the tradition reads shared Venus, Moon or Jupiter sub-periods as seasons that favour partnership themes for that person; where one of you runs a Saturn stretch, the same tradition counsels patience with that person's pace. Neither timeline overrides a choice either of you makes.*":
    "*पाठ-टिप्पणी: परंपरा शुक्र, चंद्र या गुरु की सहवर्ती अंतर्दशाओं को उस व्यक्ति के लिए साझेदारी के अनुकूल काल मानती है; जब आप में से किसी की शनि की अवधि चल रही हो, तब वही परंपरा उस व्यक्ति की गति के प्रति धैर्य रखने का परामर्श देती है। कोई भी काल-रेखा आप दोनों में से किसी के निर्णय को नहीं काटती।*",

  "## 6. Partnership Timing Windows — Jupiter's Transit, With the Mechanic Shown":
    "## 6. साझेदारी के अनुकूल काल — गुरु का गोचर, विधि सहित",
  "**No window in this span scores good-or-better for both charts at once** — the tradition would simply counsel patience with the calendar, nothing more.":
    "**इस अवधि में कोई ऐसा काल नहीं है जो दोनों कुंडलियों के लिए एक साथ 'अच्छा' या उससे बेहतर हो** — परंपरा बस पंचांग के प्रति धैर्य रखने का परामर्श देगी, इससे अधिक कुछ नहीं।",
  "*These are traditionally supportive seasons for partnership decisions — an almanac lens, not a prediction that anything will or must happen, and no season is required before a choice the two of you make. Read them alongside the dasha overlap in §5: the same tradition weighs the running periods at least as heavily as any transit.*":
    "*ये साझेदारी के निर्णयों के लिए परंपरागत रूप से अनुकूल काल हैं — एक पंचांग-दृष्टि, न कि यह भविष्यवाणी कि कुछ होगा ही या होना ही चाहिए, और आप दोनों के किसी निर्णय के लिए किसी काल की प्रतीक्षा अनिवार्य नहीं है। इन्हें §5 के दशा-संपात के साथ पढ़ें: वही परंपरा चल रही दशाओं को किसी भी गोचर से कम भार नहीं देती।*",
  "*A match score is a structured comparison inside one traditional system — it measures pattern, not destiny. Astra shows the working so the two of you can explore it together.*":
    "*मिलान का अंक एक परंपरागत पद्धति के भीतर की संरचित तुलना है — यह प्रवृत्ति नापता है, नियति नहीं। Astra पूरी गणना दिखाता है ताकि आप दोनों उसे साथ मिलकर देख सकें।*",

  /* lore seeds that are pushed as their own lines */
  ...HOUSE_STORY_HI, ...PLANET_OPENER_HI, ...DASHA_THEME_HI,
};

/* ------------------------------------------------ helpers --------- */

/* report.js lordAnchor(): "your Saturn sits in Capricorn in the 9th
   house (fortune, teachers and belief), own sign, sharing the sign
   with Mars and Venus, and it rules your 9th and 10th houses" */
function anchorHi(t) {
  let rules = "";
  const NODE = " (as a node it holds no lordships, so its sign dispositor carries them)";
  if (t.endsWith(NODE)) {
    rules = " (छाया ग्रह होने से इसका कोई भावाधिपत्य नहीं है, इसलिए इसकी राशि का स्वामी वह भार वहन करता है)";
    t = t.slice(0, -NODE.length);
  } else {
    const m = t.match(/, and it rules your (.+?) house(s)?$/);
    if (m) {
      rules = `, तथा यह आपके ${m[1]} भाव${m[2] ? "ों" : ""} का स्वामी है`;
      t = t.slice(0, m.index);
    }
  }
  let share = "";
  const sm = t.match(/, sharing the sign with (.+)$/);
  if (sm) { share = `, यह राशि ${sm[1]} के साथ साझा करता है`; t = t.slice(0, sm.index); }
  let extra = "";
  for (let again = true; again;) {
    again = false;
    for (const [en, hi] of [[", retrograde", ", वक्री"], [", exalted", ", उच्च का"],
      [", debilitated", ", नीच का"], [", own sign", ", स्वक्षेत्र में"]]) {
      if (t.endsWith(en)) { extra = hi + extra; t = t.slice(0, -en.length); again = true; }
    }
  }
  const head = t.match(/^your (\w+) sits in (\w+) in the (\d+)(?:st|nd|rd|th) house \((.+)\)$/);
  if (!head) return t + extra + share + rules;   /* shape changed - fail loud upstream */
  return `आपका ${head[1]} ${head[2]} राशि में ${head[3]}वें भाव (${head[4]}) में स्थित है` +
    extra + share + rules;
}

const strengthHi = s => STRENGTH_HI[s] || s;

/* ------------------------------------------------ line templates -- */

/* [regex, (match, K) => hindi]. K(x) protects x from the token pass -
   used for the interpretive lore tail that stays English in this
   draft. Tried in order; the first match wins, and its output is then
   token-passed. */
const TEMPLATES = [
  /* ---- headers ---- */
  [/^# (.+) — Vedic Birth Chart$/, m => `# ${m[1]} — वैदिक जन्म कुंडली`],
  [/^# (.+) & (.+) — Compatibility$/, m => `# ${m[1]} और ${m[2]} — गुण मिलान`],
  [/^\*\*Born:\*\* (.+) · (.+) \((.+)\)$/,
    (m, K) => `**जन्म:** ${m[1]} · ${K(m[2])} (${m[3]})`],
  [/^\*\*Generated by Astra\*\* on (.+) · Lahiri ayanamsa · whole-sign houses · true lunar node$/,
    m => `**Astra द्वारा निर्मित** — ${m[1]} · लाहिड़ी अयनांश · पूर्ण-राशि भाव पद्धति · वास्तविक चंद्र-नोड`],
  [/^\*\*([^*]+):\*\* (\d.+ IST), (.+)$/, (m, K) => `**${m[1]}:** ${m[2]}, ${K(m[3])}`],

  /* ---- §3 grid footnote ---- */
  [/^\*Your ascendant falls in (\w+), so count houses clockwise from the cell marked \*\*Asc\*\*\. \(Su Sun, Mo Moon, Ma Mars, Me Mercury, Ju Jupiter, Ve Venus, Sa Saturn, Ra Rahu, Ke Ketu\.\)\*$/,
    m => `*आपका लग्न ${m[1]} में पड़ता है, इसलिए **लग्न** चिह्नित खाने से दक्षिणावर्त भाव गिनें। (सू सूर्य, चं चंद्र, मं मंगल, बु बुध, गु गुरु, शु शुक्र, श शनि, रा राहु, के केतु।)*`],

  /* ---- §4 ---- */
  [/^Your ascendant is \*\*(\w+) (\S+)\*\*, so (\w+) is your 1st house and each following sign takes the next house \(the whole-sign system\)\.$/,
    m => `आपका लग्न **${m[1]} ${m[2]}** है, इसलिए ${m[3]} आपका प्रथम भाव है और उसके आगे की प्रत्येक राशि क्रमशः अगला भाव लेती है (पूर्ण-राशि पद्धति)।`],
  [/^In the chalit frame (.+) — a graha near a cusp belongs to different houses in the two systems, and both readings are given rather than silently choosing\.$/,
    m => `चलित ढाँचे में ${m[1].split(", ").map(x => {
      const p = x.match(/^\*\*(\w+)\*\* shifts to the (\d+)(?:st|nd|rd|th) bhava$/);
      return p ? `**${p[1]}** ${p[2]}वें भाव में चला जाता है` : x;
    }).join(", ")} — भाव-संधि के निकट स्थित ग्रह दोनों पद्धतियों में अलग-अलग भावों का होता है, इसलिए चुपचाप एक चुनने के बजाय दोनों पाठ दिए गए हैं।`],
  [/^### House (\d+) — (.+)$/, m => `### ${HOUSE_ORD_HI[+m[1]] || m[1]} भाव — ${HOUSE_SENSE_HI[m[2]] || m[2]}`],
  [/^\*\*(\w+) rules your (\d+)(?:st|nd|rd|th) house, and its lord (\w+) sits in your (\d+)(?:st|nd|rd|th) house\*\* \(([^)]*)\)\. (.*)$/,
    (m, K) => `**${m[1]} आपके ${m[2]}वें भाव की राशि है, और उसका स्वामी ${m[3]} आपके ${m[4]}वें भाव में स्थित है** (${m[5]})। ${K(m[6])}`],
  [/^\*\*(\w+) occupies this house\*\* \(([^)]*)\)\. (.*)$/,
    (m, K) => `**${m[1]} इस भाव में स्थित है** (${m[2]})। ${K(m[3])}`],

  /* ---- §5 ---- */
  [/^### (Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu) — (.+)$/,
    m => `### ${GRAHA_HI[m[1]]} — ${GRAHA_IS_HI[m[2]] || m[2]}`],
  [/^\*\*Your (\w+): (.+?), (\d+)(?:st|nd|rd|th) house(.*)\.\*\*$/,
    m => `**आपका ${m[1]}: ${m[2]}, ${m[3]}वें भाव में${m[4]}।**`],
  [/^\*\*Together with (\w+) in (\w+)\.\*\* (.*)$/,
    (m, K) => `**${m[2]} में ${m[1]} के साथ युति।** ${K(m[3])}`],

  /* ---- §6 conjunction bullets ---- */
  [/^- (.+) together in (\w+) \(your (\d+)(?:st|nd|rd|th) house\)(?: — ([\d.]+)° apart)?$/,
    m => `- ${m[1]} ${m[2]} में एक साथ (आपका ${m[3]}वाँ भाव)` +
      (m[4] ? ` — परस्पर ${m[4]}° की दूरी` : "")],

  /* ---- §7 vargas ---- */
  [/^All (\d+) divisional charts the engine supports, computed from the same sidereal longitudes\. Each column shows the sign a point maps to when its sign is divided into D parts \(D1 is the birth chart itself\)\.$/,
    m => `इंजन जितनी वर्ग कुंडलियाँ बनाता है, वे सभी ${m[1]} — उन्हीं निरयन देशांतरों से गणना की हुई। प्रत्येक स्तंभ दिखाता है कि जब किसी बिंदु की राशि को उस वर्ग के अनुसार उतने बराबर भागों में बाँटा जाए, तो वह बिंदु किस राशि पर आता है (D1 स्वयं जन्म कुंडली है)।`],
  [/^\*\*Vargottama\*\* — same sign in D1 and D9, traditionally read as a placement standing on its own ground: (.+)\.$/,
    m => `**वर्गोत्तम** — D1 और D9 में एक ही राशि, जिसे परंपरागत रूप से अपनी ही भूमि पर खड़ी स्थिति माना जाता है: ${m[1]}।`],
  [/^\*Reading note: the navamsa \(D9\) is traditionally read alongside the birth chart for marriage and inner strength; the dashamsa \(D10\) for career\. Your D9 ascendant is (\w+); your D10 ascendant is (\w+)\. (.*)\*$/,
    m => `*पाठ-टिप्पणी: नवांश (D9) परंपरागत रूप से विवाह और भीतरी बल के लिए जन्म कुंडली के साथ पढ़ा जाता है; दशमांश (D10) व्यवसाय के लिए। आपका D9 लग्न ${m[1]} है; आपका D10 लग्न ${m[2]} है। कुछ मंच जो दो वर्ग कुंडलियाँ छापते हैं, वे यहाँ जानबूझकर अनुपस्थित हैं: D5 और वास्तविक D6 का कोई ऐसा नियम नहीं मिला जिसे मुद्रित प्रमाण के विरुद्ध सत्यापित किया जा सके (एकमात्र उपलब्ध मानक "D6" गणित की दृष्टि से D60 है), और Astra अनुमान नहीं लगाता।*`],

  /* ---- §8 vimshottari ---- */
  [/^The 120-year Vimshottari cycle is seeded by the Moon's position inside its nakshatra at birth: your Moon sat at (\w+) (\S+), inside (.+), whose lord is \*\*(\w+)\*\* — so life begins in a (\w+) mahadasha with ([\d.]+) years of it remaining\.$/,
    m => `120 वर्ष का विंशोत्तरी चक्र जन्म के समय चंद्रमा की उसके नक्षत्र के भीतर की स्थिति से आरंभ होता है: आपका चंद्र ${m[1]} ${m[2]} पर, ${m[3]} नक्षत्र में था, जिसका स्वामी **${m[4]}** है — इसलिए जीवन ${m[5]} की महादशा से आरंभ होता है, जिसका ${m[6]} वर्ष शेष था।`],
  [/^\*The first row starts before birth — classical tables print the birth mahadasha in full; of it, only the ([\d.]+)-year balance from the birth date was actually lived\.\*$/,
    m => `*पहली पंक्ति जन्म से पहले आरंभ होती है — शास्त्रीय तालिकाएँ जन्म-महादशा को पूरा छापती हैं; उसमें से जन्म-तिथि के बाद वास्तव में केवल ${m[1]} वर्ष का शेष भाग ही जिया गया।*`],
  [/^### (\w+) mahadasha \((.+) → (.+)\)$/, m => `### ${m[1]} महादशा (${m[2]} → ${m[3]})`],
  [/^\*\*(\w+) mahadasha\*\* \((.+) → (.+)\)$/, m => `**${m[1]} महादशा** (${m[2]} → ${m[3]})`],
  [/^\*\*([A-Za-z]+–[A-Za-z]+)\*\* \((.+) → (.+)\)$/, m => `**${m[1]}** (${m[2]} → ${m[3]})`],
  [/^### Where you are now \((.+)\)$/, m => `### आप इस समय कहाँ हैं (${m[1]})`],
  [/^Running period: \*\*(.+)\*\* \(mahadasha – antardasha – pratyantardasha\)\.$/,
    m => `वर्तमान में चल रही अवधि: **${m[1]}** (महादशा – अंतर्दशा – प्रत्यंतर दशा)।`],
  [/^\*\*Read through this chart, not in the abstract:\*\* (.+)\. Within this tradition a mahadasha takes on its lord's seat, so these (\w+) years are read here through that (\d+)(?:st|nd|rd|th)-house ground\.$/,
    m => `**इसे इसी कुंडली में पढ़ें, अमूर्त रूप में नहीं:** ${anchorHi(m[1])}। इस परंपरा में महादशा अपने स्वामी के स्थान का रंग ले लेती है, इसलिए ${m[2]} के ये वर्ष यहाँ उसी ${m[3]}वें भाव की भूमि से पढ़े जाते हैं।`],
  [/^Within it, the (\w+) antardasha \((.+) → (.+)\) traditionally (.*)\. In this chart (.+) — so that colouring is traditionally filtered through the (\d+)(?:st|nd|rd|th) house's matters\.$/,
    m => `इसके भीतर, ${m[1]} की अंतर्दशा (${m[2]} → ${m[3]}) परंपरागत रूप से ${ANTAR_FLAVOR_HI[m[4]] || m[4]}। इस कुंडली में ${anchorHi(m[5])} — इसलिए वह रंगत परंपरागत रूप से ${m[6]}वें भाव के विषयों से होकर पढ़ी जाती है।`],
  [/^Pratyantardashas of the running (\w+)–(\w+) antardasha:$/,
    m => `वर्तमान ${m[1]}–${m[2]} अंतर्दशा की प्रत्यंतर दशाएँ:`],

  /* ---- §2 namakshara row (syllable depends on nakshatra + pada) ---- */
  [/^\| Namakshara \| (\S+) \| naming syllable of (.+) pada (\d+), from the classical avakahada chakra \|$/,
    m => {
      const i = NAK_ORDER.indexOf(m[2]);
      const syl = i >= 0 ? NAMAKSHARA_HI[i][Number(m[3]) - 1] : m[1];
      return `| नामाक्षर | ${syl} | ${m[2]} चरण ${m[3]} का नामाक्षर, शास्त्रीय अवकहड़ा चक्र से |`;
    }],

  /* ---- §10 yogini rows (the yogini "Siddha" is not the nitya yoga) ---- */
  [/^\| (Mangala|Pingala|Dhanya|Bhramari|Bhadrika|Ulka|Siddha|Sankata) \| (.+)$/,
    m => `| ${YOGINI_HI[m[1]]} | ${m[2]}`],

  /* ---- §11 ashtakavarga ---- */
  [/^The strongest sign is \*\*(\w+)\*\* \((\d+) bindus, your (\d+)(?:st|nd|rd|th) house\) and the lightest is \*\*(\w+)\*\* \((\d+) bindus, your (\d+)(?:st|nd|rd|th) house\)\. A light sign is traditionally read as a place to pace yourself during transits, not as a misfortune\.$/,
    m => `सबसे बलवान राशि **${m[1]}** है (${m[2]} बिंदु, आपका ${m[3]}वाँ भाव) और सबसे हल्की **${m[4]}** है (${m[5]} बिंदु, आपका ${m[6]}वाँ भाव)। हल्की राशि को परंपरागत रूप से गोचर के समय अपनी गति सँभालने का स्थान माना जाता है, दुर्भाग्य नहीं।`],

  /* ---- §12 shadbala ---- */
  [/^\*\*(\w+) is your strongest graha\*\* \(([\d.]+) rupas\) and (\w+) the least fortified \(([\d.]+)\)\. (.*)$/,
    m => `**${m[1]} आपका सबसे बलवान ग्रह है** (${m[2]} रूप) और ${m[3]} सबसे कम बल वाला (${m[4]})। यहाँ बल को परंपरागत रूप से ग्रह की उस क्षमता के रूप में पढ़ा जाता है जिससे वह अपने कारकत्व को फल दे सके — भला या बुरा होने के रूप में नहीं। कुछ मंच आवश्यक-बल की सीमाएँ छापते हैं, पर वे शाखा-दर-शाखा भिन्न हैं; जब तक कोई नियम मुद्रित प्रमाण को न दोहरा दे, Astra उन्हें नहीं देता।`],

  /* ---- §13 gochara ---- */
  [/^## 13\. Current Transits \(Gochara\) — as of (.+)$/,
    m => `## 13. वर्तमान गोचर — ${m[1]} की स्थिति`],
  [/^Where every graha stands \*\*today\*\*, read against your natal Moon \((\w+)\) and lagna \((\w+)\)\. (.*)$/,
    m => `प्रत्येक ग्रह **आज** कहाँ खड़ा है, आपके जन्म-चंद्र (${m[1]}) और लग्न (${m[2]}) के सापेक्ष। अनुकूल/परीक्षात्मक का निर्णय शास्त्रीय गोचर तालिका से होता है — प्रत्येक ग्रह के लिए जन्म-चंद्र से गिने कुछ निश्चित भाव हैं जिनमें उसका गोचर परंपरागत रूप से सहायक माना जाता है (सूर्य 3/6/10/11, चंद्र 1/3/6/7/10/11, मंगल 3/6/11, बुध 2/4/6/8/10/11, गुरु 2/5/7/9/11, शुक्र 1/2/3/4/5/8/9/11/12, शनि 3/6/11, राहु 3/6/10/11, केतु 3/6/11)। बिंदु-स्तंभ इसे §11 से जोड़ता है: जिस राशि से गोचर हो रहा है, उसके लिए आपका अपना अष्टकवर्ग अंक।`],

  /* ---- §14 yogas / §16 doshas headings ---- */
  [/^(\d+) classical combinations are present in this chart\. Each one below states the rule as it applies to your actual placements — a yoga is never just a name here\.$/,
    m => `इस कुंडली में ${m[1]} शास्त्रीय योग विद्यमान हैं। नीचे प्रत्येक योग का नियम आपकी वास्तविक ग्रह-स्थितियों पर लागू करके लिखा गया है — यहाँ योग कभी केवल एक नाम नहीं होता।`],
  [/^### (.+) · (.+) — (strong|moderate|weak|present|not present)$/, m => {
    const q = m[1].match(/\(([^)]+)\)$/);
    const name = m[2] + (q && !m[2].includes("(")
      ? ` (${YOGA_QUALIFIER_HI[q[1]] || q[1]})` : "");
    return `### ${name} — ${strengthHi(m[3])}`;
  }],

  /* ---- §15 sade sati ---- */
  [/^Sade sati is the roughly seven-and-a-half-year stretch when transiting Saturn crosses the 12th, 1st and 2nd signs counted from your natal Moon \((\w+)\)\. (.*)$/,
    m => `साढ़े साती वह लगभग साढ़े सात वर्ष की अवधि है जब गोचर का शनि आपके जन्म-चंद्र (${m[1]}) से गिनी बारहवीं, पहली और दूसरी राशि से होकर गुजरता है। परंपरा इसे सुदृढ़ीकरण और छँटाई का काल मानती है — धीमा, संरचनात्मक और सीमित — कोई दंडादेश नहीं। नीचे दी गई अवधियाँ सीधे गणित-इंजन से निकाली गई हैं; प्रत्येक अवधि के भीतर के चरण शनि के वास्तविक राशि-प्रवेश दिखाते हैं, वक्री होकर पुनः प्रवेश सहित।`],
  [/^\*\*(.+) → (.+)\*\* \(([\d.]+) years\)(.*)$/, m => `**${m[1]} → ${m[2]}** (${m[3]} वर्ष)` +
    m[4].replace(" — **running now**", " — **अभी चल रही है**")
      .replace(" — already running when you were born", " — आपके जन्म के समय पहले से चल रही थी")],
  [/^- (rising \(12th from Moon\)|peak \(over the Moon sign\)|setting \(2nd from Moon\)): Saturn in (\w+), (.+) → (.+)$/,
    m => `- ${SATI_PHASE_HI[m[1]]}: शनि ${m[2]} में, ${m[3]} → ${m[4]}`],
  [/^As of (.+), transiting Saturn stands in the (\d+)(?:st|nd|rd|th) sign from your Moon — (inside|outside) the sade sati band\.$/,
    m => `${m[1]} की स्थिति के अनुसार गोचर का शनि आपके चंद्रमा से ${houseOrd(m[2])} राशि में है — साढ़े साती की पट्टी के ${m[3] === "inside" ? "भीतर" : "बाहर"}।`],

  /* ---- §16 manglik ---- */
  [/^Mars sits in (\w+): the (\d+)(?:st|nd|rd|th) house from your lagna and the (\d+)(?:st|nd|rd|th) from your Moon\. The widely used rule counts houses 1, 4, 7, 8 and 12 from the lagna\.$/,
    m => `मंगल ${m[1]} में है: आपके लग्न से ${houseOrd(m[2])} भाव और चंद्रमा से ${houseOrd(m[3])}। व्यापक रूप से प्रयुक्त नियम लग्न से 1, 4, 7, 8 और 12 भाव गिनता है।`],
  [/^- \*\*From the lagna:\*\* house (\d+) → (.+)\.$/,
    m => `- **लग्न से:** भाव ${m[1]} → ${m[2] === "within the classical set — the chart carries the Mangal placement"
      ? "शास्त्रीय समूह के भीतर — कुंडली में मंगल की यह स्थिति है"
      : "शास्त्रीय समूह में नहीं — मंगल की यह स्थिति नहीं है"}।`],
  [/^- \*\*From the Moon:\*\* house (\d+) → (.+)\.$/,
    m => `- **चंद्रमा से:** भाव ${m[1]} → ${m[2] === "within the classical set under the Moon-counted reading"
      ? "चंद्र-गणना के पाठ में शास्त्रीय समूह के भीतर"
      : "चंद्र-गणना के पाठ में शास्त्रीय समूह में नहीं"}।`],
  [/^- \*\*The 2nd-house school:\*\* some traditions, notably in the south, add the 2nd house to the set\. Mars stands in your (\d+)(?:st|nd|rd|th) from the lagna and (\d+)(?:st|nd|rd|th) from the Moon, so under that wider reading the verdict here (is unchanged|\*\*changes\*\* — that school would count this placement)\.$/,
    m => `- **द्वितीय-भाव वाली शाखा:** कुछ परंपराएँ, विशेषतः दक्षिण में, इस समूह में द्वितीय भाव भी जोड़ती हैं। मंगल आपके लग्न से ${houseOrd(m[1])} और चंद्रमा से ${houseOrd(m[2])} में है, इसलिए उस व्यापक पाठ में यहाँ का निष्कर्ष ${m[3] === "is unchanged" ? "अपरिवर्तित रहता है" : "**बदल जाता है** — वह शाखा इस स्थिति को गिनेगी"}।`],

  /* ---- §17 chara karakas ---- */
  [/^Under the seven-karaka scheme \(no Rahu, no Pitrikaraka\) every assignment is unchanged; the Darakaraka is \*\*(\w+)\*\* in both readings\.$/,
    m => `सप्त-कारक पद्धति में (न राहु, न पितृकारक) कोई भी निर्धारण नहीं बदलता; दोनों पाठों में दारकारक **${m[1]}** ही है।`],
  [/^Under the seven-karaka scheme \(no Rahu, no Pitrikaraka\) the ranking shifts: (.+)\. Schools differ here, so Astra shows both\.$/,
    m => `सप्त-कारक पद्धति में (न राहु, न पितृकारक) क्रम बदल जाता है: ${m[1]}। यहाँ शाखाएँ भिन्न हैं, इसलिए Astra दोनों दिखाता है।`],
  [/^\*A precision note: (.+)\. That margin sits inside the ephemeris's stated error budget for slow planets, and platforms using a different ephemeris may print the pair swapped — treat those assignments as provisional until the positions are pinned to the arc-second\.\*$/,
    m => `*सूक्ष्मता-टिप्पणी: ${m[1].split("; ").map(x => {
      const p = x.match(/^\*\*(\w+)\*\* and \*\*(\w+)\*\* are separated by only (\d+)' of arc, which decides (\w+) versus (\w+)$/);
      return p ? `**${p[1]}** और **${p[2]}** के बीच केवल ${p[3]}' का अंतर है, जो ${p[4]} और ${p[5]} का निर्णय करता है` : x;
    }).join("; ")}। यह अंतर मंद ग्रहों के लिए घोषित त्रुटि-सीमा के भीतर आता है, और भिन्न गणित-सारणी वाले मंच इस जोड़ी को उलटा छाप सकते हैं — जब तक स्थितियाँ विकला तक निश्चित न हों, इन निर्धारणों को अस्थायी मानें।*`],

  /* ---- love report ---- */
  [/^(.+)'s Moon is in (\w+) \((.+)\); (.+)'s is in (\w+) \((.+)\)\. The whole matching system below is built on those two Moons\.$/,
    m => `${m[1]} का चंद्र ${m[2]} में है (${m[3]}); ${m[4]} का ${m[5]} में (${m[6]})। नीचे की पूरी मिलान-पद्धति इन्हीं दो चंद्रमाओं पर खड़ी है।`],
  [/^\*\*(\d+)\/36 — (.+)\.\*\*$/, m => `**${m[1]}/36 — ${VERDICT_HI[m[2]] || m[2]}।**`],
  [/^- \*\*(.+?) ([\d.]+)\/(\d+)\*\* — (.*)$/,
    (m, K) => `- **${KOOTA_HI[m[1]] || m[1]} ${m[2]}/${m[3]}** — ${K(m[4])}`],
  [/^- \*\*(.+):\*\* Mars in (\w+) — (\d+)(?:st|nd|rd|th) from the lagna \((not in|in) the 1\/4\/7\/8\/12 set\), (\d+)(?:st|nd|rd|th) from the Moon \((not in|in) the set\)\.$/,
    m => `- **${m[1]}:** मंगल ${m[2]} में — लग्न से ${houseOrd(m[3])} (1/4/7/8/12 के समूह में ${m[4] === "in" ? "है" : "नहीं है"}), चंद्रमा से ${houseOrd(m[5])} (समूह में ${m[6] === "in" ? "है" : "नहीं है"})।`],
  [/^- \*\*Venus\*\* stands at (\w+) (\S+) \((.+)\), the (\d+)(?:st|nd|rd|th) house(, [a-z ]+)? — traditionally the significator of partnership and what one is drawn toward\. Projected onto (.+)'s chart, that same sign is (.+)'s (\d+)(?:st|nd|rd|th) house\.$/,
    m => `- **शुक्र** ${m[1]} ${m[2]} पर है (${m[3]}), अर्थात् ${houseOrd(m[4])} भाव${m[5] || ""} — परंपरागत रूप से साझेदारी का और जिस ओर मन खिंचता है उसका कारक। ${m[6]} की कुंडली पर रखने पर वही राशि ${m[7]} का ${houseOrd(m[8])} भाव बनती है।`],
  [/^- \*\*7th house\*\* \(partnership\): (\w+), ruled by (\w+), which sits in the (\d+)(?:st|nd|rd|th) house\.$/,
    m => `- **सप्तम भाव** (साझेदारी): ${m[1]}, स्वामी ${m[2]}, जो ${houseOrd(m[3])} भाव में स्थित है।`],
  [/^- \*\*Darakaraka\*\* \(eight-karaka scheme\): \*\*(\w+)\*\* at ([\d.]+)° through (\w+) — the least-travelled graha, which Jaimini assigns to the partner\. Its condition is read as how partnership presents itself to this chart\.$/,
    m => `- **दारकारक** (अष्ट-कारक पद्धति): **${m[1]}**, ${m[3]} में ${m[2]}° तय किए हुए — सबसे कम दूरी तय करने वाला ग्रह, जिसे जैमिनि जीवनसाथी का कारक मानते हैं। उसकी अवस्था यह बताती है कि इस कुंडली के सामने साझेदारी किस रूप में आती है।`],
  [/^Each of you moves through your own Vimshottari periods; this table lays the two timelines side by side at antardasha resolution from January (\d+) to January (\d+)\. A row is a stretch in which neither of you changes sub-period\.$/,
    m => `आप दोनों अपनी-अपनी विंशोत्तरी दशाओं से गुजरते हैं; यह तालिका जनवरी ${m[1]} से जनवरी ${m[2]} तक दोनों काल-रेखाओं को अंतर्दशा के स्तर पर आमने-सामने रखती है। प्रत्येक पंक्ति वह अवधि है जिसमें आप दोनों में से किसी की उप-अवधि नहीं बदलती।`],
  [/^Right now: (.+) runs \*\*(.+)\*\* and (.+) runs \*\*(.+)\*\*\.$/,
    m => `इस समय: ${m[1]} की **${m[2]}** चल रही है और ${m[3]} की **${m[4]}**।`],
  [/^The almanac technique for timing partnership matters follows transiting Jupiter: a window is traditionally read as supportive when Jupiter occupies or aspects \(its 5th, 7th and 9th aspects, plus conjunction\) the signs that carry each chart's partnership significations\. The targets this engine uses, disclosed in full — for (.+?): (.+?); for (.+?): (.+?)\. More targets touched at once, stronger the window\. Rows follow Jupiter's actual sign entries from the ephemeris, so retrograde re-entries appear as their own shorter windows\.$/,
    m => {
      const tg = s => s.split(", ").map(x => {
        const p = x.match(/^(\w+) \((.+)\)$/);
        return p ? `${p[1]} (${p[2].split(" = ").map(y => TARGET_HI[y] || y).join(" = ")})` : x;
      }).join(", ");
      return `साझेदारी के विषयों का काल निकालने की पंचांग-विधि गोचर के गुरु का अनुसरण करती है: कोई अवधि परंपरागत रूप से तब अनुकूल पढ़ी जाती है जब गुरु उन राशियों में स्थित हो या उन पर दृष्टि डाले (उसकी पंचम, सप्तम और नवम दृष्टि, तथा युति) जो प्रत्येक कुंडली में साझेदारी की कारक हैं। यह इंजन जिन लक्ष्यों का प्रयोग करता है, वे पूरे खोलकर — ${m[1]} के लिए: ${tg(m[2])}; ${m[3]} के लिए: ${tg(m[4])}। एक साथ जितने अधिक लक्ष्य स्पर्श हों, अवधि उतनी प्रबल। पंक्तियाँ गणित-इंजन से निकले गुरु के वास्तविक राशि-प्रवेशों का अनुसरण करती हैं, इसलिए वक्री होकर पुनः प्रवेश अपनी छोटी अवधियों के रूप में दिखते हैं।`;
    }],
  [/^\*\*Windows the tradition reads as supportive for both charts at once:\*\* (.+)\.$/,
    m => `**वे अवधियाँ जिन्हें परंपरा दोनों कुंडलियों के लिए एक साथ अनुकूल पढ़ती है:** ${m[1].split("; ").map(x => {
      const p = x.match(/^(.+) → (.+) \(Jupiter in (\w+)\)$/);
      return p ? `${p[1]} → ${p[2]} (गुरु ${p[3]} में)` : x;
    }).join("; ")}।`],
];

/* ------------------------------------------------ translateMd ----- */

const isSeparatorRow = l => /^\|[\s\-:|]+\|$/.test(l);

function translateLine(line) {
  if (!line.trim() || line === "---" || isSeparatorRow(line)) return line;

  const keep = [];
  const K = s => { keep.push(s); return `${keep.length - 1}`; };
  const restore = s => s.replace(/(\d+)/g, (_, i) => keep[+i]);

  if (Object.prototype.hasOwnProperty.call(LINES, line)) return LINES[line];

  for (const [re, fn] of TEMPLATES) {
    const m = line.match(re);
    if (m) return restore(tokens(fn(m, K)));
  }

  if (line.startsWith("|")) {
    const parts = line.split("|");
    const out = parts.map((cell, i) => {
      if (i === 0 || i === parts.length - 1) return cell;
      const t = cell.trim();
      if (!t) return cell;
      const lead = cell.slice(0, cell.indexOf(t));
      const tail = cell.slice(cell.indexOf(t) + t.length);
      if (Object.prototype.hasOwnProperty.call(CELLS, t)) return lead + CELLS[t] + tail;
      for (const [re, fn] of CELL_TEMPLATES) {
        const m = t.match(re);
        if (m) { m.input = t; return lead + fn(m) + tail; }
      }
      return cell;
    }).join("|");
    return restore(tokens(out));
  }

  /* Unrecognised: an interpretive lore paragraph that stays English in
     this draft. Never token-pass it - half-translated prose is worse
     than none. tools/report_hi_coverage.mjs reports anything here that
     is actually structural. */
  return line;
}

/* English report markdown -> Hindi report markdown. */
export function translateMd(md) {
  const out = [];
  for (const line of String(md).split("\n")) {
    out.push(translateLine(line));
    if (line === VOICE_NOTE_EN) out.push("", DRAFT_NOTE);
  }
  return out.join("\n");
}

