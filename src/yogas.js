/* ===================================================================
   YOGAS - named planetary combinations, detected with evidence.

   Every yoga this module reports carries a "because" string: the
   classical rule instantiated with THIS chart's actual placements.
   No verdict is ever emitted without the reasoning that produced it.
   That is the deliberate inversion of the competitor reports we
   studied, which print yoga names with zero shown work.

   Rules are Parashari/Phaladeepika mainstream. Where traditions
   split, the choice made here is stated in a comment next to the
   rule, and the "because" string says which reading was applied.
   Documented choices:

     benefics   - Jupiter and Venus always; Mercury unless it shares
                  a sign with Mars, Saturn, Rahu or Ketu (the Sun
                  alone does not turn Mercury malefic, or Budha-
                  Aditya charts would contradict themselves); the
                  Moon only in its bright half (elongation from the
                  Sun between 90 and 270 degrees - paksha bala).
     nodes      - Rahu/Ketu own no signs, cast no lordships, and are
                  excluded from the Moon- and Sun-flanking yogas
                  (Sunapha/Anapha/Kemadruma, Vesi/Vosi), per the
                  classical texts. They DO count as malefic
                  occupants where occupancy matters (Parvata's
                  6th/8th test, Amala's co-tenancy).
     Vesi/Vosi  - 2nd from the Sun = Vesi, 12th = Vosi (BPHS).
                  Some vendors swap the two names.
     Adhi       - counted from the Moon (Chandradhi), the primary
                  classical form.
     yogakaraka - a planet lording one of houses 4/7/10 AND one of
                  5/9 simultaneously; reported inside Raja yoga only
                  when it is not in a dusthana, debilitated or
                  combust - existence alone is a property of the
                  lagna, not of the person.

   Input contract - detectYogas(chart) where chart is either the
   object buildYogaChart() returns or any object shaped like:
     { lagna: 1..12, planets: { Sun:{lon}, Moon:{lon}, ... } }
   with sidereal longitudes in degrees for all nine grahas.
   =================================================================== */

const SIGNS=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra",
  "Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const SIGN_LORD={1:"Mars",2:"Venus",3:"Mercury",4:"Moon",5:"Sun",6:"Mercury",
  7:"Venus",8:"Mars",9:"Jupiter",10:"Saturn",11:"Saturn",12:"Jupiter"};
const SEVEN=["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"];
const GRAHAS=[...SEVEN,"Rahu","Ketu"];
const EXALT={Sun:1,Moon:2,Mars:10,Mercury:6,Jupiter:4,Venus:12,Saturn:7};
const DEBIL={Sun:7,Moon:8,Mars:4,Mercury:12,Jupiter:10,Venus:6,Saturn:1};
/* combustion orbs, degrees from the Sun */
const COMBUST={Mercury:12,Venus:10,Mars:17,Jupiter:11,Saturn:15};
/* full special aspects (houses from own position); everything else casts 7 */
const DRISHTI={Mars:[4,7,8],Jupiter:[5,7,9],Saturn:[3,7,10]};

import { F, P as MP, H, L as LK, collapse, story, formed, scoreOf,
  assertFormation, MODEL, SHAPES } from "./yoga-formation.js?v=20260904y";
export { MODEL, SHAPES, collapse, story, formed };

const norm=d=>((d%360)+360)%360;
const signOf=L=>Math.floor(norm(L)/30)+1;
const degIn=L=>norm(L)%30;
const adv=(s,n)=>((s-1+n-1)%12)+1;              /* n-th sign counted from s, n>=1 */
const countFrom=(a,b)=>((b-a+12)%12)+1;         /* b as the n-th sign from a */
const sep=(a,b)=>{const r=Math.abs(norm(a)-norm(b));return r>180?360-r:r};
const sign=s=>SIGNS[s-1];
const ord=h=>h+(h===1?"st":h===2?"nd":h===3?"rd":"th");
const list=a=>a.length<2?a.join(""):a.slice(0,-1).join(", ")+" and "+a.at(-1);

const KENDRA=[1,4,7,10], TRIKONA=[1,5,9], UPACHAYA=[3,6,10,11], DUSTHANA=[6,8,12];

/* ---- chart construction ------------------------------------------- */

export function buildYogaChart(positions, ascLon){
  const planets={};
  for(const g of GRAHAS){
    if(positions[g]===undefined) throw new Error(`missing graha: ${g}`);
    planets[g]={lon:norm(positions[g])};
  }
  return {lagna:signOf(ascLon), ascLon:norm(ascLon), planets};
}

/* internal working view over the loose input contract */
function view(chart){
  const lagna=chart.lagna??signOf(chart.ascLon);
  const P={};
  for(const g of GRAHAS){
    const L=chart.planets[g].lon;
    P[g]={lon:L, sign:signOf(L), house:countFrom(lagna,signOf(L)), deg:degIn(L)};
  }
  const inSign=s=>GRAHAS.filter(g=>P[g].sign===s);
  const dign=g=>{
    if(!SEVEN.includes(g)) return null;
    if(P[g].sign===EXALT[g]) return "exalted";
    if(P[g].sign===DEBIL[g]) return "debilitated";
    if(SIGN_LORD[P[g].sign]===g) return "own sign";
    return null;
  };
  const combust=g=>g!=="Sun"&&COMBUST[g]!==undefined&&sep(P[g].lon,P.Sun.lon)<COMBUST[g];
  const elong=norm(P.Moon.lon-P.Sun.lon);
  const moonBright=elong>90&&elong<270;         /* paksha bala reading */
  const mercAfflicted=["Mars","Saturn","Rahu","Ketu"].some(m=>P[m].sign===P.Mercury.sign);
  const benefic=g=>g==="Jupiter"||g==="Venus"
    ||(g==="Mercury"&&!mercAfflicted)||(g==="Moon"&&moonBright);
  const benefics=GRAHAS.filter(benefic);
  const malefic=g=>GRAHAS.includes(g)&&!benefic(g);
  const aspects=(g,s)=>(DRISHTI[g]||[7]).some(o=>adv(P[g].sign,o)===s);
  const lordOfHouse=h=>SIGN_LORD[adv(lagna,h)];
  const housesOf=g=>Object.keys(SIGN_LORD).filter(s=>SIGN_LORD[s]===g)
    .map(s=>countFrom(lagna,Number(s)));
  const at=g=>`${g} (${sign(P[g].sign)}, ${ord(P[g].house)} house)`;
  /* ---- formation helpers -------------------------------------------
     Nothing new is COMPUTED here. Every one of these is a value the
     detectors already work out, interpolate into a sentence and throw
     away; naming them once is what lets a fact carry the structure. */
  const rules=g=>SEVEN.includes(g)?housesOf(g).slice().sort((a,b)=>a-b):[];
  const cls=h=>KENDRA.includes(h)?"kendra":TRIKONA.includes(h)?"trikona"
    :DUSTHANA.includes(h)?"dusthana":UPACHAYA.includes(h)?"upachaya":null;
  const houseOfSign=s2=>countFrom(lagna,s2);
  const nth=(a,b)=>countFrom(a,b);
  /* the houses a count WALKS THROUGH, so the reader can watch it happen
     instead of being told the answer */
  const via=(fromSign,n)=>Array.from({length:Math.min(n,5)},(_,i)=>houseOfSign(adv(fromSign,i)));
  const gap=(a,b)=>sep(P[a].lon,P[b].lon);          /* raw, never rounded */
  const role=(g,part)=>({g,part,sign:P[g].sign,house:P[g].house,deg:P[g].deg,
    dignity:dign(g)==="own sign"?"own":dign(g), combust:combust(g), rules:rules(g)});
  return {lagna,P,inSign,dign,combust,benefic,benefics,malefic,aspects,
          lordOfHouse,housesOf,at,moonBright,
          rules,cls,houseOfSign,nth,via,gap,role,sign,ord};
}

/* ---- the detectors ------------------------------------------------ */

/* The record stays additive: without a formation it is byte-identical to
   what every existing surface already consumes. With one, three fields
   stop being asserted by hand and start being DERIVED — which is what
   removes the whole class of bug where `planets` omits a graha the
   `because` string names. */
const yoga=(name,sanskrit,because,strength,planets,formation)=>{
  if(!formation) return {name,sanskrit,present:true,because,strength,planets};
  return {name,sanskrit,present:true,
    key:formation.key,
    because: because ?? formation.facts.filter(x=>x.ok&&x.req).map(x=>x.says).join(" "),
    strength: formation.strength.band,
    planets: [...new Set(formation.cast.map(r=>r.g))],
    formation};
};

function budhaAditya(v){
  if(v.P.Sun.sign!==v.P.Mercury.sign) return null;
  const raw=v.gap("Sun","Mercury"), gap=raw.toFixed(1);
  const deep=Number(gap)<3;
  const sg=v.P.Sun.sign, hs=v.P.Sun.house;
  const dg=v.dign("Mercury");
  const facts=[
    F({id:"conj", t:"conjunction", req:true, grahas:["Sun","Mercury"], sign:sg, house:hs, maxSep:raw,
      says:`Sun and Mercury share ${sign(sg)}, your ${ord(hs)} house.`,
      draw:[MP("Sun"), MP("Mercury", deep?"flaw":"lit"), H(hs,"seat",sign(sg)),
        LK({g:"Sun",h:hs},{g:"Mercury",h:hs},"pair","lit",{label:`${gap}°`})]}),
    F({id:"rule", t:"company", req:true, sign:sg, house:hs, grahas:["Sun","Mercury"], malefic:[],
      says:"One shared sign is the whole rule — no degree, no aspect.", draw:[]}),
  ];
  /* The engine's real combustion orb, not the 3° the old grading invented.
     Only the DEEP case carries weight, which keeps every existing band
     exactly where it was while letting the practitioner see the true figure. */
  if(v.combust("Mercury")) facts.push(F({id:"combust:Mercury", t:"combustion", g:"Mercury",
    sep:raw, orb:COMBUST.Mercury, deep,
    says:`Mercury stands ${gap}° from the Sun, ${deep?"deep inside its glare":"inside its glare"}.`,
    draw:[MP("Mercury","flaw",`${gap}° · combust`)]}));
  if(dg) facts.push(F({id:"dignity:Mercury", t:"dignity", g:"Mercury",
    value: dg==="own sign"?"own":dg, sign:sg,
    says:dignitySays("Mercury",dg,sg),
    draw:[MP("Mercury", dg==="debilitated"?"flaw":"lit", dg)]}));
  const formation={key:"budha-aditya", shape:"conjunction", chart:"D1",
    frame:{from:"lagna"},
    cast:[v.role("Sun","actor"), v.role("Mercury","actor")],
    facts, story:["conj","rule",...facts.slice(2).map(x=>x.id)],
    strength:scoreOf(78,facts)};
  return yoga("Budha-Aditya Yoga","बुधादित्य योग",
    `Sun and Mercury share ${sign(v.P.Sun.sign)} in your ${ord(v.P.Sun.house)} house, `+
    `${gap}° apart - the rule asks only that the two occupy one sign.`+
    (deep?` Mercury sits deep in the Sun's glare (combust), which tempers the yoga.`:""),
    null,null,formation);
}

function gajakesari(v){
  const n=countFrom(v.P.Moon.sign,v.P.Jupiter.sign);
  if(!KENDRA.includes(n)) return null;
  const d=v.dign("Jupiter");
  const mH=v.P.Moon.house, jH=v.P.Jupiter.house, mS=v.P.Moon.sign;
  const facts=[
    F({id:"frame", t:"seat", g:"Moon", sign:mS, house:mH, deg:v.P.Moon.deg, cls:v.cls(mH),
      says:"The kendra here is counted from your Moon, not from the lagna.",
      draw:[MP("Moon","ref"), H(mH,"ref",`${sign(mS)} · count starts here`)]}),
    F({id:"count:Moon>Jupiter", t:"count", req:true, from:"Moon", fromSign:mS,
      toSign:v.P.Jupiter.sign, n, cls:"kendra", via:v.via(mS,n),
      says:`Jupiter in ${sign(v.P.Jupiter.sign)} stands in the ${ord(n)} sign from it.`,
      draw:[MP("Jupiter"), H(jH,"seat"),
        LK({g:"Moon",h:mH},{g:"Jupiter",h:jH},"step","lit",
          {label:`${ord(n)} from the Moon`, via:v.via(mS,n)})]}),
    /* the alt cells teach the rule's SPACE — they are excluded from the still
       frame by collapse(), so they can only ever be seen with the sentence */
    F({id:"rule", t:"count", req:true, from:"Moon", fromSign:mS, toSign:v.P.Jupiter.sign, n, cls:"kendra", via:[],
      says:"A kendra from the Moon — the 1st, 4th, 7th or 10th — is the whole rule.",
      draw:KENDRA.map(k=>H(v.houseOfSign(adv(mS,k)),"alt"))}),
  ];
  if(d) facts.push(F({id:"dignity:Jupiter", t:"dignity", g:"Jupiter", value:d==="own sign"?"own":d,
    sign:v.P.Jupiter.sign,
    says:dignitySays("Jupiter",d,v.P.Jupiter.sign),
    draw:[MP("Jupiter", d==="debilitated"?"flaw":"lit", d)]}));
  if(v.combust("Jupiter")) facts.push(F({id:"combust:Jupiter", t:"combustion", g:"Jupiter",
    sep:v.gap("Jupiter","Sun"), orb:COMBUST.Jupiter, deep:v.gap("Jupiter","Sun")<3,
    says:"Jupiter stands inside the Sun's glare, which dims it.",
    draw:[MP("Jupiter","flaw","combust")]}));
  const formation={key:"gajakesari", shape:"relative-geometry", chart:"D1",
    frame:{from:"graha", graha:"Moon", sign:mS, house:mH},
    cast:[v.role("Moon","frame"), v.role("Jupiter","actor")],
    facts, story:["frame","rule","count:Moon>Jupiter",...facts.slice(3).map(x=>x.id)],
    strength:scoreOf(62,facts)};
  return yoga("Gajakesari Yoga","गजकेसरी योग",
    `Jupiter in ${sign(v.P.Jupiter.sign)} stands in the ${ord(n)} from your Moon in `+
    `${sign(v.P.Moon.sign)} - a kendra (1/4/7/10) from the Moon, which is the whole rule.`+
    (d?` Jupiter is ${d} there.`:""),
    null,null,formation);
}

function chandraMangala(v){
  const conj=v.P.Moon.sign===v.P.Mars.sign;
  const mutual=v.aspects("Moon",v.P.Mars.sign)&&v.aspects("Mars",v.P.Moon.sign);
  if(!conj&&!mutual) return null;
  return yoga("Chandra-Mangala Yoga","चन्द्र-मङ्गल योग",
    conj?`Moon and Mars are conjunct in ${sign(v.P.Moon.sign)}, your ${ord(v.P.Moon.house)} house.`
        :`Moon (${sign(v.P.Moon.sign)}) and Mars (${sign(v.P.Mars.sign)}) hold full mutual aspect.`,
    conj?"strong":"moderate",["Moon","Mars"]);
}

/* Sunapha / Anapha / Durudhara / Kemadruma - the Moon-flanking family.
   Only real planets other than the Sun count, per the classical rule. */
/* One phrasing for dignity everywhere. "Cancer is Jupiter's exalted" is not
   a sentence, and every one of these lines is read aloud by VoiceOver. */
function dignitySays(g,d,sg){
  return d==="exalted" ? `${g} is exalted in ${sign(sg)}.`
    : (d==="own sign"||d==="own") ? `${sign(sg)} is ${g}'s own sign.`
    : `${sign(sg)} is ${g}'s sign of fall.`;
}

/* Sunapha and Anapha are the clearest case for a frame being data rather
   than a sentence: house 9 is only "the 2nd" because the count starts at
   the Moon. Drawn as a step link, the reader watches the count instead of
   being told the answer. */
function flankFormation(v,key,label,gs,n,other){
  const mSign=v.P.Moon.sign, mHouse=v.P.Moon.house;
  const toSign=adv(mSign,n), toHouse=v.houseOfSign(toSign);
  const facts=[
    F({id:"frame", t:"seat", g:"Moon", sign:mSign, house:mHouse, deg:v.P.Moon.deg, cls:v.cls(mHouse),
      says:"Everything here is counted from your Moon, not from the lagna.",
      draw:[MP("Moon","ref"), H(mHouse,"ref",`${sign(mSign)} · count starts here`)]}),
    F({id:`count:Moon>${n}`, t:"count", req:true, from:"Moon", fromSign:mSign, toSign, n,
      cls:v.cls(toHouse), via:v.via(mSign,n),
      says:`${sign(toSign)} is the ${ord(n)} sign from it.`,
      draw:[H(toHouse,"path"),
        LK({g:"Moon",h:mHouse},{h:toHouse},"step","lit",
          {label:`${ord(n)} from the Moon`, via:v.via(mSign,n)})]}),
    /* `malefic` stays empty on purpose: the rule asks for ANY graha but the Sun,
       so the actor being a malefic is the yoga working, not an affliction. Only a
       malefic that is NOT part of the rule dilutes a placement. */
    F({id:"seat", t:"company", req:true, sign:toSign, house:toHouse, grahas:gs, malefic:[],
      says:`${list(gs)} ${gs.length>1?"sit":"sits"} there.`,
      draw:[...gs.map(g=>MP(g)), H(toHouse,"seat")]}),
    F({id:"eligible", t:"company", req:true, sign:toSign, house:toHouse, grahas:gs, malefic:[],
      says:`Any graha but the Sun and the nodes in that place is the whole rule.`, draw:[]}),
    F({id:"other-empty", t:"company", req:true, sign:adv(mSign,n===2?12:2), house:v.houseOfSign(adv(mSign,n===2?12:2)),
      grahas:other, malefic:[],
      says:`The ${ord(n===2?12:2)} from the Moon is empty — otherwise this would be Durudhara.`, draw:[]}),
  ];
  for(const g of gs){
    const d=v.dign(g);
    if(d) facts.push(F({id:`dignity:${g}`, t:"dignity", g, value:d==="own sign"?"own":d, sign:v.P[g].sign,
      says:dignitySays(g,d,v.P[g].sign),
      draw:[MP(g, d==="debilitated"?"flaw":"lit", d)]}));
    if(v.combust(g)) facts.push(F({id:`combust:${g}`, t:"combustion", g, sep:v.gap(g,"Sun"),
      orb:COMBUST[g], deep:v.gap(g,"Sun")<3,
      says:`${g} stands inside the Sun's glare.`, draw:[MP(g,"flaw","combust")]}));
  }
  return {key, shape:"relative-to-moon", chart:"D1",
    frame:{from:"graha", graha:"Moon", sign:mSign, house:mHouse},
    cast:[v.role("Moon","frame"), ...gs.map(g=>v.role(g,"actor"))],
    facts, strength:scoreOf(62,facts)};
}

function moonFlanks(v){
  const flankers=s=>SEVEN.filter(g=>g!=="Sun"&&g!=="Moon"&&v.P[g].sign===s);
  const second=flankers(adv(v.P.Moon.sign,2));
  const twelfth=flankers(adv(v.P.Moon.sign,12));
  const withMoon=flankers(v.P.Moon.sign);
  const strengthOf=gs=>gs.some(g=>["exalted","own sign"].includes(v.dign(g)))?"strong"
    :gs.every(g=>v.dign(g)==="debilitated"||v.combust(g))?"weak":"moderate";
  const seat=(gs,n)=>`${list(gs)} ${gs.length>1?"occupy":"occupies"} `+
    `${sign(adv(v.P.Moon.sign,n))}, the ${ord(n)} from your Moon in ${sign(v.P.Moon.sign)}`;
  if(second.length&&twelfth.length)
    return [yoga("Durudhara Yoga","दुरुधरा योग",
      `Planets flank the Moon on both sides: ${seat(second,2)}, and ${seat(twelfth,12)}. `+
      `Both the 2nd and the 12th from the Moon are occupied, so Sunapha and Anapha `+
      `combine into Durudhara.`,strengthOf([...second,...twelfth]),
      ["Moon",...second,...twelfth])];
  const out=[];
  if(second.length)
    out.push(yoga("Sunapha Yoga","सुनफा योग",
      `${seat(second,2)}. A planet other than the Sun in the 2nd from the Moon is the `+
      `entire rule${second.some(g=>v.dign(g)==="own sign")?
        `, and ${second.find(g=>v.dign(g)==="own sign")} stands there in its own sign`:""}.`,
      null,null,flankFormation(v,"sunapha","Sunapha",second,2,twelfth)));
  if(twelfth.length)
    out.push(yoga("Anapha Yoga","अनफा योग",
      `${seat(twelfth,12)}. A planet other than the Sun in the 12th from the Moon is the `+
      `entire rule.`,strengthOf(twelfth),["Moon",...twelfth]));
  if(!second.length&&!twelfth.length&&!withMoon.length){
    /* Kemadruma - the affliction of the unaccompanied Moon */
    const kendraFromMoon=SEVEN.filter(g=>g!=="Moon"&&
      KENDRA.includes(countFrom(v.P.Moon.sign,v.P[g].sign)));
    const jupOnMoon=v.aspects("Jupiter",v.P.Moon.sign);
    const moonKendraLagna=KENDRA.includes(v.P.Moon.house);
    const bhanga=kendraFromMoon.length?`planets stand in kendra from the Moon (${list(kendraFromMoon)})`
      :jupOnMoon?`Jupiter aspects the Moon from ${sign(v.P.Jupiter.sign)}`
      :moonKendraLagna?`the Moon itself holds a kendra from the lagna (${ord(v.P.Moon.house)} house)`
      :null;
    out.push(yoga("Kemadruma Yoga","केमद्रुम योग",
      `No planet other than the Sun occupies the sign with your Moon `+
      `(${sign(v.P.Moon.sign)}), the 2nd from it or the 12th from it - the Moon stands `+
      `unaccompanied. This is an affliction yoga, not a gift.`+
      (bhanga?` Classical cancellation applies here: ${bhanga}.`:""),
      bhanga?"weak":"strong",["Moon"]));
  }
  return out;
}

/* Vesi / Vosi / Ubhayachari - the Sun-flanking family (Moon and nodes excluded) */
function sunFlanks(v){
  const flankers=s=>SEVEN.filter(g=>g!=="Sun"&&g!=="Moon"&&v.P[g].sign===s);
  const second=flankers(adv(v.P.Sun.sign,2));
  const twelfth=flankers(adv(v.P.Sun.sign,12));
  const strengthOf=gs=>gs.some(g=>v.benefic(g)&&!v.combust(g))?"moderate":"weak";
  const upgraded=gs=>gs.some(g=>["exalted","own sign"].includes(v.dign(g)))?"strong":strengthOf(gs);
  const seat=(gs,n)=>`${list(gs)} ${gs.length>1?"occupy":"occupies"} `+
    `${sign(adv(v.P.Sun.sign,n))}, the ${ord(n)} from your Sun in ${sign(v.P.Sun.sign)} `+
    `(the Moon and the nodes do not count for this rule)`;
  if(second.length&&twelfth.length)
    return yoga("Ubhayachari Yoga","उभयचरी योग",
      `Planets flank the Sun on both sides: ${seat(second,2)}, and ${seat(twelfth,12)}.`,
      upgraded([...second,...twelfth]),["Sun",...second,...twelfth]);
  if(second.length)
    return yoga("Vesi Yoga","वेशि योग",
      `${seat(second,2)}. In the naming this engine follows (BPHS), the 2nd from the Sun `+
      `gives Vesi; some schools call this Vosi.`,upgraded(second),["Sun",...second]);
  if(twelfth.length)
    return yoga("Vosi Yoga","वोशि योग",
      `${seat(twelfth,12)}. In the naming this engine follows (BPHS), the 12th from the `+
      `Sun gives Vosi; some schools call this Vesi.`,upgraded(twelfth),["Sun",...twelfth]);
  return null;
}

function adhi(v){
  const bene=["Jupiter","Venus","Mercury"].filter(g=>v.benefic(g));
  const hits=bene.map(g=>({g,n:countFrom(v.P.Moon.sign,v.P[g].sign)}))
    .filter(x=>[6,7,8].includes(x.n));
  if(!hits.length) return null;
  return yoga("Adhi Yoga","अधि योग",
    `Counted from your Moon in ${sign(v.P.Moon.sign)}, `+
    list(hits.map(x=>`benefic ${x.g} stands in the ${ord(x.n)} (${sign(v.P[x.g].sign)})`))+
    `. Benefics in the 6th, 7th or 8th from the Moon form Adhi yoga (Chandradhi, the `+
    `classical Moon-based count).`,
    hits.length>=2?"strong":"moderate",["Moon",...hits.map(x=>x.g)]);
}

function vasumathi(v){
  const bene=["Jupiter","Venus","Mercury","Moon"].filter(g=>v.benefic(g));
  const hits=[];
  for(const g of bene){
    const fromMoon=g!=="Moon"?countFrom(v.P.Moon.sign,v.P[g].sign):0;
    const fromLagna=v.P[g].house;
    if(UPACHAYA.includes(fromMoon))
      hits.push(`${g} in ${sign(v.P[g].sign)} is the ${ord(fromMoon)} from the Moon`);
    if(UPACHAYA.includes(fromLagna))
      hits.push(`${g} in ${sign(v.P[g].sign)} is your ${ord(fromLagna)} house from the lagna`);
  }
  if(!hits.length) return null;
  return yoga("Vasumathi Yoga","वसुमती योग",
    `Benefics occupy upachaya places (3/6/10/11) counted from the Moon or the lagna: `+
    list(hits)+`.`,hits.length>=2?"strong":"moderate",
    [...new Set(hits.map(h=>h.split(" ")[0]))]);
}

function lakshmi(v){
  const lord9=v.lordOfHouse(9), p=v.P[lord9];
  const d=v.dign(lord9);
  const seat=countFrom(v.lagna,p.sign);
  const wellDignified=d==="own sign"||d==="exalted";
  const wellPlaced=KENDRA.includes(seat)||TRIKONA.includes(seat);
  if(!wellDignified||!wellPlaced) return null;
  const lagnaLord=v.lordOfHouse(1), lp=v.P[lagnaLord];
  const lagnaLordStrong=!v.combust(lagnaLord)&&v.dign(lagnaLord)!=="debilitated"
    &&(KENDRA.includes(lp.house)||TRIKONA.includes(lp.house)
       ||["own sign","exalted"].includes(v.dign(lagnaLord)));
  return yoga("Lakshmi Yoga","लक्ष्मी योग",
    `Your 9th lord ${lord9} stands ${d} in ${sign(p.sign)} - which is itself your `+
    `${ord(seat)} house, a ${TRIKONA.includes(seat)?"trikona":"kendra"}. `+
    (lagnaLordStrong
      ?`The lagna lord ${lagnaLord} supports it from ${sign(lp.sign)} in the `+
       `${ord(lp.house)} house.`
      :`The lagna lord ${lagnaLord} is weakly placed, which tempers the yoga.`),
    lagnaLordStrong?"strong":"moderate",[lord9,lagnaLord]);
}

function parivartana(v){
  const out=[];
  for(let i=0;i<SEVEN.length;i++)for(let j=i+1;j<SEVEN.length;j++){
    const a=SEVEN[i],b=SEVEN[j];
    if(SIGN_LORD[v.P[a].sign]!==b||SIGN_LORD[v.P[b].sign]!==a) continue;
    const ha=v.P[a].house, hb=v.P[b].house;
    const kind=(DUSTHANA.includes(ha)||DUSTHANA.includes(hb))?"Dainya"
      :(ha===3||hb===3)?"Khala":"Maha";
    /* An exchange is the case that most obviously defeats a single house id:
       two lords, two houses, and the claim is RECIPROCAL. Each cell is
       simultaneously a seat (someone sits in it) and ruled-from-elsewhere,
       and that double claim IS the yoga — which is why house marks carry
       two independent channels. */
    const facts=[
      F({id:`seat:${a}`, t:"seat", req:true, g:a, sign:v.P[a].sign, house:ha, deg:v.P[a].deg, cls:v.cls(ha),
        says:`${a} sits in ${sign(v.P[a].sign)}, which ${b} rules.`,
        draw:[MP(a), H(ha,"seat",sign(v.P[a].sign)), H(hb,"rule")]}),
      F({id:`seat:${b}`, t:"seat", req:true, g:b, sign:v.P[b].sign, house:hb, deg:v.P[b].deg, cls:v.cls(hb),
        says:`${b} sits in ${sign(v.P[b].sign)}, which ${a} rules.`,
        draw:[MP(b), H(hb,"seat",sign(v.P[b].sign)), H(ha,"rule")]}),
      F({id:"exchange", t:"exchange", req:true, grahas:[a,b], houses:[ha,hb],
        signs:[v.P[a].sign,v.P[b].sign], variant:kind,
        says:`Each stands in the other's sign — your ${ord(ha)} and ${ord(hb)} have swapped lords.`,
        draw:[LK({g:a,h:ha},{g:b,h:hb},"swap","lit",{label:"exchange"})]}),
      F({id:"grade", t:"exchange", grahas:[a,b], houses:[ha,hb],
        signs:[v.P[a].sign,v.P[b].sign], variant:kind,
        says: kind==="Maha"?"Both are good houses, so this is the Maha grade."
          :kind==="Khala"?"The 3rd house is involved, so this is the Khala grade."
          :"A dusthana (6, 8 or 12) is involved, so this is the Dainya grade.",
        draw:[]}),
    ];
    const formation={key:`parivartana:${a}+${b}`, shape:"exchange", chart:"D1",
      variant:kind, frame:{from:"lagna"},
      cast:[v.role(a,"actor"), v.role(b,"actor")],
      facts, story:[`seat:${a}`,`seat:${b}`,"exchange","grade"],
      strength:scoreOf(60,facts,"grade")};
    out.push(yoga(`Parivartana Yoga (${kind})`,"परिवर्तन योग",
      `${a} occupies ${sign(v.P[a].sign)} - ${b}'s sign - while ${b} occupies `+
      `${sign(v.P[b].sign)} - ${a}'s sign. The two lords have exchanged houses `+
      `${ord(ha)} and ${ord(hb)}. `+
      (kind==="Maha"?`Both are good houses, making this the Maha (raja-grade) exchange.`
       :kind==="Khala"?`The 3rd house is involved, making this the Khala grade.`
       :`A dusthana (6/8/12) is involved, making this the Dainya grade.`),
      null,null,formation));
  }
  return out;
}

function sakata(v){
  const n=countFrom(v.P.Jupiter.sign,v.P.Moon.sign);
  if(![6,8,12].includes(n)) return null;
  const mitigated=KENDRA.includes(v.P.Moon.house);
  return yoga("Sakata Yoga","शकट योग",
    `Your Moon in ${sign(v.P.Moon.sign)} falls in the ${ord(n)} from Jupiter in `+
    `${sign(v.P.Jupiter.sign)} - Moon in 6/8/12 from Jupiter is the Sakata rule. `+
    `An affliction yoga of alternating fortunes, not a gift.`+
    (mitigated?` Mitigation applies: the Moon itself holds a kendra from your lagna `+
      `(${ord(v.P.Moon.house)} house), which classically breaks Sakata's force.`:""),
    mitigated?"weak":"moderate",["Moon","Jupiter"]);
}

function amala(v){
  const bene=["Jupiter","Venus","Mercury","Moon"].filter(g=>v.benefic(g));
  const refs=[["lagna",v.lagna],["Moon",v.P.Moon.sign]];
  for(const [refName,refSign] of refs){
    const tenth=adv(refSign,10);
    const found=bene.filter(g=>v.P[g].sign===tenth);
    if(!found.length) continue;
    const sharers=GRAHAS.filter(g=>!found.includes(g)&&v.P[g].sign===tenth&&v.malefic(g));
    const clean=!sharers.length;
    return yoga("Amala Yoga","अमल योग",
      `Benefic ${list(found)} occupies ${sign(tenth)}, the 10th from your ${refName}.`+
      (clean?"":` The yoga is diluted: malefic ${list(sharers)} share${sharers.length>1?"":"s"} `+
        `that sign.`),
      clean?(found.some(g=>["exalted","own sign"].includes(v.dign(g)))?"strong":"moderate")
           :"weak",found);
  }
  return null;
}

/* Parvata - two classical branches; either fires the yoga.
   (a) Phaladeepika: benefics in kendras while the 6th and 8th are empty
       or benefic-held (nodes count as malefic occupants here).
   (b) Lagna lord and 12th lord in mutual kendras, aspected by a benefic. */
function parvata(v){
  const kendraBene=GRAHAS.filter(g=>v.benefic(g)&&KENDRA.includes(v.P[g].house));
  const badIn68=GRAHAS.filter(g=>v.malefic(g)&&[6,8].includes(v.P[g].house));
  if(kendraBene.length&&!badIn68.length)
    return yoga("Parvata Yoga","पर्वत योग",
      `Benefic ${list(kendraBene)} hold${kendraBene.length>1?"":"s"} kendra houses while `+
      `the 6th and 8th are free of malefics - the Phaladeepika rule.`,
      "strong",kendraBene);
  const l1=v.lordOfHouse(1), l12=v.lordOfHouse(12);
  if(l1!==l12){
    const n=countFrom(v.P[l1].sign,v.P[l12].sign);
    if(KENDRA.includes(n)){
      const witnesses=["Jupiter","Venus","Mercury"].filter(g=>v.benefic(g)&&g!==l1&&g!==l12
        &&(v.aspects(g,v.P[l1].sign)||v.aspects(g,v.P[l12].sign)));
      if(witnesses.length)
        return yoga("Parvata Yoga","पर्वत योग",
          `Lagna lord ${l1} (${sign(v.P[l1].sign)}) and 12th lord ${l12} `+
          `(${sign(v.P[l12].sign)}) stand in mutual kendra`+
          (n===1?` - together in one sign`:``)+
          `, aspected by benefic ${list(witnesses)} - the lagna/12th-lord branch of the rule.`,
          "moderate",[l1,l12,...witnesses]);
    }
  }
  return null;
}

/* Neecha Bhanga - cancellation of debilitation, checked per debilitated planet */
function neechaBhanga(v){
  const out=[];
  for(const g of SEVEN){
    if(v.dign(g)!=="debilitated") continue;
    const debSign=v.P[g].sign;
    const disp=SIGN_LORD[debSign];
    const exaltedThere=SEVEN.find(x=>EXALT[x]===debSign);
    const inKendraFrom=x=>KENDRA.includes(v.P[x].house)
      ||KENDRA.includes(countFrom(v.P.Moon.sign,v.P[x].sign));
    const reasons=[];
    /* All four classical clauses are evaluated, not just the ones that fire.
       A clause that does not apply becomes a fact with ok:false and a `why`,
       so the page can say "not present" instead of implying failure (§25). */
    const clause=[];
    const C=(id,hit,says,why,draw,by)=>{ clause.push(F({id, t:"cancels", ok:hit, clause:id,
      of:`dignity:${g}`, by:by||[], says, ...(hit?{}:{why}), draw:hit?draw:[] })); return hit; };
    if(C("cancel:dispositor-kendra", inKendraFrom(disp),
      `Its dispositor ${disp} stands in ${sign(v.P[disp].sign)}, a kendra from the lagna or the Moon.`,
      `${disp} holds no kendra from either the lagna or the Moon.`,
      [MP(disp), H(v.P[disp].house,"seat"), LK({g:disp,h:v.P[disp].house},{g,h:v.P[g].house},"arrow","lit",{label:"lifts"})],
      [disp]))
      reasons.push(`its dispositor ${disp} stands in ${sign(v.P[disp].sign)}, a kendra `+
        `from the lagna or the Moon`);
    if(exaltedThere&&exaltedThere!==g&&C("cancel:exalted-kendra", inKendraFrom(exaltedThere),
      `${exaltedThere}, exalted in ${sign(debSign)}, holds a kendra from the lagna or the Moon.`,
      `${exaltedThere} holds no kendra.`,
      [MP(exaltedThere), H(v.P[exaltedThere].house,"seat"),
       LK({g:exaltedThere,h:v.P[exaltedThere].house},{g,h:v.P[g].house},"arrow","lit",{label:"lifts"})],
      [exaltedThere]))
      reasons.push(`${exaltedThere}, the planet exalted in ${sign(debSign)}, holds a `+
        `kendra from the lagna or the Moon (${sign(v.P[exaltedThere].sign)})`);
    if(C("cancel:exchange", SIGN_LORD[v.P[disp].sign]===g,
      `${g} and its dispositor ${disp} stand in mutual exchange.`,
      `${g} and ${disp} are not in exchange.`,
      [MP(disp), LK({g,h:v.P[g].house},{g:disp,h:v.P[disp].house},"swap","lit")], [disp]))
      reasons.push(`${g} and its dispositor ${disp} are in mutual exchange`);
    if(C("cancel:aspect", v.aspects(disp,debSign),
      `Its dispositor ${disp} aspects it from ${sign(v.P[disp].sign)}.`,
      `${disp} casts no full aspect on ${sign(debSign)}.`,
      [MP(disp), LK({g:disp,h:v.P[disp].house},{g,h:v.P[g].house},"arrow","lit",{label:"aspects"})], [disp]))
      reasons.push(`its dispositor ${disp} aspects it from ${sign(v.P[disp].sign)}`);
    if(!reasons.length) continue;
    const hit=clause.filter(c=>c.ok);
    const helpers=[...new Set(hit.flatMap(c=>c.by))];
    const facts=[
      F({id:`dignity:${g}`, t:"dignity", req:true, g, value:"debilitated", sign:debSign,
        says:dignitySays(g,"debilitated",debSign),
        draw:[MP(g,"flaw","debilitated"), H(v.P[g].house,"seat")]}),
      ...clause,
      F({id:"rule", t:"cancels", req:true, clause:"any", of:`dignity:${g}`, by:helpers,
        says:"Any one of the classical cancellations is enough to lift a fall.", draw:[]}),
    ];
    const formation={key:`neecha-bhanga:${g}`, shape:"cancellation", chart:"D1",
      frame:{from:"lagna"},
      cast:[v.role(g,"subject"), ...helpers.map(x=>v.role(x,"witness"))],
      facts, story:[`dignity:${g}`,"rule",...clause.map(c=>c.id)],
      strength:scoreOf(46,facts)};
    out.push(yoga("Neecha Bhanga Raja Yoga","नीचभङ्ग राजयोग",
      `${g} is debilitated in ${sign(debSign)} (your ${ord(v.P[g].house)} house), but the `+
      `debilitation is cancelled: ${list(reasons)}.`,
      null,null,formation));
  }
  return out;
}

/* Panch Mahapurusha - own or exaltation sign, in a kendra from the lagna */
const MAHAPURUSHA={Mars:["Ruchaka Yoga","रुचक योग"],Mercury:["Bhadra Yoga","भद्र योग"],
  Jupiter:["Hamsa Yoga","हंस योग"],Venus:["Malavya Yoga","मालव्य योग"],
  Saturn:["Sasa Yoga","शश योग"]};
function mahapurusha(v){
  const out=[];
  for(const g of Object.keys(MAHAPURUSHA)){
    const d=v.dign(g);
    if(!["own sign","exalted"].includes(d)) continue;
    if(!KENDRA.includes(v.P[g].house)) continue;
    const [name,sk]=MAHAPURUSHA[g];
    const h=v.P[g].house, sg=v.P[g].sign;
    const facts=[
      F({id:"frame", t:"seat", g, sign:sg, house:h, deg:v.P[g].deg, cls:"kendra",
        says:"The kendra here is counted from the lagna — the four angles of the chart.",
        draw:[H(1,"ref","lagna"), ...KENDRA.filter(k=>k!==h).map(k=>H(k,"alt"))]}),
      F({id:`dignity:${g}`, t:"dignity", req:true, g, value:d==="own sign"?"own":d, sign:sg,
        says:dignitySays(g,d,sg),
        draw:[MP(g,"lit",d==="own sign"?"own sign":"exalted")]}),
      F({id:`kendra:${g}`, t:"count", req:true, from:"lagna", fromSign:v.lagna, toSign:sg,
        n:h, cls:"kendra", via:[],
        says:`It stands in your ${ord(h)} house, one of the four angles.`,
        draw:[MP(g), H(h,"seat",sign(sg)), LK({h:1},{g,h},"arrow","ref",{label:`${ord(h)} from the lagna`})]}),
      F({id:"rule", t:"seat", req:true, g, sign:sg, house:h, deg:v.P[g].deg, cls:"kendra",
        says:`${d==="exalted"?"Exaltation":"Own sign"} in a kendra is the complete rule.`, draw:[]}),
    ];
    if(v.combust(g)) facts.push(F({id:`combust:${g}`, t:"combustion", g, sep:v.gap(g,"Sun"),
      orb:COMBUST[g], deep:v.gap(g,"Sun")<3,
      says:`${g} stands inside the Sun's glare, which dims it.`,
      draw:[MP(g,"flaw","combust")]}));
    const formation={key:`mahapurusha:${g}`, shape:"dignity-kendra", chart:"D1",
      variant:name.replace(/ Yoga$/,""), frame:{from:"lagna"},
      cast:[v.role(g,"actor")],
      facts, story:["frame",`dignity:${g}`,`kendra:${g}`,"rule",...facts.slice(4).map(x=>x.id)],
      strength:scoreOf(64,facts)};
    out.push(yoga(name,sk,
      `${g} stands ${d} in ${sign(v.P[g].sign)}, which is your ${ord(v.P[g].house)} `+
      `house - a kendra from the lagna. ${d==="exalted"?"Exaltation":"Own sign"} in a `+
      `kendra is the complete Mahapurusha rule for ${g}.`,
      null,null,formation));
  }
  return out;
}

/* Raja yoga - association between kendra lords and trikona lords, plus the
   yogakaraka when one planet lords both classes and is decently placed. */
function rajaYoga(v){
  const lordsOf=hs=>{const m=new Map();
    for(const h of hs){const g=v.lordOfHouse(h);
      if(!m.has(g))m.set(g,[]); m.get(g).push(h);}
    return m};
  const kl=lordsOf(KENDRA), tl=lordsOf(TRIKONA);
  const clauses=[], facts=[], involved=new Set();
  const seen=new Set();
  for(const [kg,khs] of kl)for(const [tg,ths] of tl){
    if(kg===tg) continue;
    const key=[kg,tg].sort().join("+");
    if(seen.has(key)) continue; seen.add(key);
    let how=null;
    if(v.P[kg].sign===v.P[tg].sign) how=`conjunct in ${sign(v.P[kg].sign)}`;
    else if(v.aspects(kg,v.P[tg].sign)&&v.aspects(tg,v.P[kg].sign)) how=`in mutual aspect`;
    else if(SIGN_LORD[v.P[kg].sign]===tg&&SIGN_LORD[v.P[tg].sign]===kg) how=`in exchange`;
    if(!how) continue;
    clauses.push(`${kg} (lord of the ${list(khs.map(ord))}) and ${tg} (lord of the `+
      `${list(ths.map(ord))}) are ${how}`);
    /* Each clause becomes its own chapter. Raja Yoga on a real chart runs to
       five planets across five houses — the case that is unrepresentable as
       one house id, and unreadable if every mark lands at once. `group` is
       what lets the story walk it one clause at a time. */
    const gid=`c${facts.length+1}`;
    const kSeats=khs.map(h=>H(h,"rule")), tSeats=ths.map(h=>H(h,"rule"));
    facts.push(F({id:`lord:${kg}:${gid}`, t:"lordship", req:true, g:kg, houses:khs.slice().sort((x,y)=>x-y),
      signs:khs.map(h=>adv(v.lagna,h)), yogakaraka:false, group:gid,
      says:`${kg} rules your ${list(khs.map(ord))} — an angle.`,
      draw:[MP(kg), H(v.P[kg].house,"seat"), ...kSeats,
        LK({g:kg,h:v.P[kg].house},{h:khs[0]},"arrow","ref",{label:"rules"})]}));
    facts.push(F({id:`lord:${tg}:${gid}`, t:"lordship", req:true, g:tg, houses:ths.slice().sort((x,y)=>x-y),
      signs:ths.map(h=>adv(v.lagna,h)), yogakaraka:false, group:gid,
      says:`${tg} rules your ${list(ths.map(ord))} — a trine.`,
      draw:[MP(tg), H(v.P[tg].house,"seat"), ...tSeats,
        LK({g:tg,h:v.P[tg].house},{h:ths[0]},"arrow","ref",{label:"rules"})]}));
    facts.push(F({id:`join:${gid}`, t: how.startsWith("conjunct")?"conjunction":how==="in exchange"?"exchange":"drishti",
      req:true, group:gid, grahas:[kg,tg], sign:v.P[kg].sign, house:v.P[kg].house,
      houses:[v.P[kg].house,v.P[tg].house], signs:[v.P[kg].sign,v.P[tg].sign],
      variant:"Maha", from:kg, toSign:v.P[tg].sign, toHouse:v.P[tg].house, mutual:true, special:false, maxSep:0,
      says:`The two are ${how}.`,
      draw:[LK({g:kg,h:v.P[kg].house},{g:tg,h:v.P[tg].house},
        how==="in exchange"?"swap":"pair","lit",{label:how.replace(/^in /,"")})]}));
    involved.add(kg); involved.add(tg);
  }
  /* yogakaraka: one planet lording a non-lagna kendra AND a non-lagna trikona */
  let karakaStrong=false;
  for(const g of SEVEN){
    const hs=v.housesOf(g);
    if(!hs.some(h=>[4,7,10].includes(h))||!hs.some(h=>[5,9].includes(h))) continue;
    const ok=!DUSTHANA.includes(v.P[g].house)&&v.dign(g)!=="debilitated"&&!v.combust(g);
    if(!ok) continue;   /* a badly-placed yogakaraka is not evidence of raja yoga */
    const d=v.dign(g);
    clauses.push(`${g} lords both the ${list(hs.map(ord))} - kendra and trikona at once - `+
      `making it yogakaraka, placed in your ${ord(v.P[g].house)} house`+
      (d?` in ${d==="own sign"?"its own sign":d+" dignity"} (${sign(v.P[g].sign)})`:""));
    const gid=`k${g}`;
    facts.push(F({id:`karaka:${g}`, t:"lordship", req:true, g, houses:hs.slice().sort((x,y)=>x-y),
      signs:hs.map(h=>adv(v.lagna,h)), yogakaraka:true, group:gid,
      says:`${g} rules an angle and a trine at once — a yogakaraka.`,
      draw:[MP(g), H(v.P[g].house,"seat"), ...hs.map(h=>H(h,"rule")),
        ...hs.map(h=>LK({g,h:v.P[g].house},{h},"arrow","ref",{label:"rules"}))]}));
    if(d) facts.push(F({id:`dignity:${g}`, t:"dignity", g, value:d==="own sign"?"own":d,
      sign:v.P[g].sign, group:gid, says:dignitySays(g,d,v.P[g].sign),
      draw:[MP(g,"lit",d==="own sign"?"own sign":d)]}));
    involved.add(g);
    if(["own sign","exalted"].includes(d)||KENDRA.includes(v.P[g].house)
       ||TRIKONA.includes(v.P[g].house)) karakaStrong=true;
  }
  if(!clauses.length) return null;
  const afflicted=[...involved].every(g=>v.dign(g)==="debilitated"||v.combust(g));
  facts.unshift(F({id:"rule", t:"lordship", req:true, g:v.lordOfHouse(1), houses:[1],
    signs:[v.lagna], yogakaraka:false,
    says:"A lord of an angle and a lord of a trine, joined, is the rule.",
    draw:[...KENDRA.map(h=>H(h,"alt")), ...TRIKONA.filter(h=>h!==1).map(h=>H(h,"alt"))]}));
  const formation={key:"raja-kendra-trikona", shape:"lordship-web", chart:"D1",
    frame:{from:"lagna"},
    cast:[...involved].map(g=>v.role(g,"actor")),
    facts,
    strength:scoreOf(58,facts,"benefit",
      karakaStrong?[{code:"yogakaraka", delta:14, says:"a yogakaraka stands well placed"}]
      :clauses.length>=2?[{code:"clauses", delta:14, says:`${clauses.length} separate clauses form it`}]
      :afflicted?[{code:"afflicted", delta:-24, says:"every participant is debilitated or combust"}]:[])};
  return yoga("Raja Yoga (Kendra-Trikona)","राजयोग (केन्द्र-त्रिकोण)",
    `Lords of kendra (angle) and trikona (trine) houses join forces: `+list(clauses)+`.`,
    null,null,formation);
}

/* Saraswati - Jupiter, Venus and Mercury each in a kendra, trikona or the
   2nd, with Jupiter well-received. Implemented so the engine can show WHY
   it does or does not fire where competitors assert it without evidence. */
function saraswati(v){
  const seats=[...new Set([...KENDRA,...TRIKONA,2])];
  const trio=["Jupiter","Venus","Mercury"];
  if(!trio.every(g=>seats.includes(v.P[g].house))) return null;
  return yoga("Saraswati Yoga","सरस्वती योग",
    trio.map(g=>`${v.at(g)}`).join(", ")+
    ` - all three benefics of learning hold kendra, trikona or 2nd-house seats.`,
    "strong",trio);
}

/* Bheri - Phaladeepika, two branches; either fires with a strong 9th lord:
   (a) every one of the seven grahas confined to houses 1, 2, 7 and 12;
   (b) Jupiter, Venus and the lagna lord in mutual kendras from one another.
   "Strong" for the 9th lord here: not debilitated, not combust, and either
   own-sign/exalted or seated in a kendra or trikona from the lagna. When the
   lagna lord IS Venus or Jupiter the trio reduces - stated in the evidence. */
function bheri(v){
  const l9=v.lordOfHouse(9);
  const strong9=v.dign(l9)!=="debilitated"&&!v.combust(l9)&&
    (["own sign","exalted"].includes(v.dign(l9))
     ||KENDRA.includes(v.P[l9].house)||TRIKONA.includes(v.P[l9].house));
  if(!strong9) return null;
  const l9line=`the 9th lord ${l9} stands ${v.dign(l9)?v.dign(l9)+" ":""}in `+
    `${sign(v.P[l9].sign)}, your ${ord(v.P[l9].house)} house`;
  if(SEVEN.every(g=>[1,2,7,12].includes(v.P[g].house)))
    return yoga("Bheri Yoga","भेरी योग",
      `All seven grahas are confined to houses 1, 2, 7 and 12, and ${l9line} - `+
      `the first Phaladeepika branch of the rule.`,"strong",SEVEN);
  const l1=v.lordOfHouse(1);
  const trio=[...new Set(["Jupiter","Venus",l1])];
  const mutual=trio.every(a=>trio.every(b=>a===b
    ||KENDRA.includes(countFrom(v.P[a].sign,v.P[b].sign))));
  if(!mutual) return null;
  return yoga("Bheri Yoga","भेरी योग",
    `${list(trio.map(v.at))} stand in mutual kendras from one another`+
    (trio.length<3?` (the lagna lord is ${l1} itself, so the classical trio reduces to `+
      `${trio.length===2?"two":"one"})`:"")+
    `, while ${l9line} - the second Phaladeepika branch of the rule.`,
    ["own sign","exalted"].includes(v.dign(l9))?"strong":"moderate",
    [...trio,l9].filter((g,i,a)=>a.indexOf(g)===i));
}

/* Kahala - two classical branches:
   (a) the 4th and 9th lords in mutual kendras while the lagna lord is strong
       (same strength test as Bheri's 9th lord);
   (b) the 4th lord in own or exaltation sign, conjoined the 10th lord.
   Vendors are known to print Kahala without testing the lagna-lord clause;
   this engine keeps the full rule and shows which clause failed. */
function kahala(v){
  const l4=v.lordOfHouse(4), l9=v.lordOfHouse(9), l1=v.lordOfHouse(1), l10=v.lordOfHouse(10);
  if(l4!==l9&&KENDRA.includes(countFrom(v.P[l4].sign,v.P[l9].sign))){
    const l1strong=v.dign(l1)!=="debilitated"&&!v.combust(l1)&&
      (["own sign","exalted"].includes(v.dign(l1))
       ||KENDRA.includes(v.P[l1].house)||TRIKONA.includes(v.P[l1].house));
    if(l1strong)
      return yoga("Kahala Yoga","काहल योग",
        `The 4th lord ${v.at(l4)} and the 9th lord ${v.at(l9)} stand in mutual kendras, `+
        `and the lagna lord ${v.at(l1)} is strongly placed - the complete first branch `+
        `of the rule.`,"moderate",[l4,l9,l1]);
  }
  if(l4!==l10&&["own sign","exalted"].includes(v.dign(l4))&&v.P[l4].sign===v.P[l10].sign)
    return yoga("Kahala Yoga","काहल योग",
      `The 4th lord ${l4} stands ${v.dign(l4)} in ${sign(v.P[l4].sign)}, conjoined the `+
      `10th lord ${l10} - the second branch of the rule.`,"strong",[l4,l10]);
  return null;
}

export function detectYogas(chart){
  const v=view(chart);
  const out=[];
  const push=x=>{if(Array.isArray(x))out.push(...x);else if(x)out.push(x)};
  push(budhaAditya(v));
  push(gajakesari(v));
  push(chandraMangala(v));
  push(moonFlanks(v));
  push(sunFlanks(v));
  push(adhi(v));
  push(vasumathi(v));
  push(lakshmi(v));
  push(parivartana(v));
  push(sakata(v));
  push(amala(v));
  push(parvata(v));
  push(neechaBhanga(v));
  push(mahapurusha(v));
  push(rajaYoga(v));
  push(saraswati(v));
  push(bheri(v));
  push(kahala(v));
  /* Plain JS has no type check, so this is the substitute: it refuses a mark
     with no sentence, a required fact that did not hold, a story citing a
     fact that does not exist. Dev-only — the cost is not worth paying on
     every chart render on a phone. */
  if(globalThis.ASTRA_DEV)
    for(const y of out) if(y.formation) assertFormation(y.formation,GRAHAS);
  return out;
}

/* ---- the doshas ----------------------------------------------------
   Same evidence-first contract as the yogas: every verdict - present
   OR absent - carries the rule instantiated with this chart's actual
   placements. Absence with reasons is deliberate: the benchmark
   products print bare badges ("NOT PRESENT") with zero shown work.
   Framing is the caller's job; nothing here predicts an outcome.   */

export function detectDoshas(chart){
  const v=view(chart);
  const out=[];
  const at=g=>`${g} in ${sign(v.P[g].sign)}`;

  /* Kalsarpa - all seven grahas within one half of the nodal axis.
     Measured on longitudes, not signs: a planet's arc from Rahu decides
     its side (Ketu sits at exactly 180 from Rahu by definition). */
  {
    const rel=g=>norm(v.P[g].lon-v.P.Rahu.lon);
    const sideRK=SEVEN.filter(g=>rel(g)<180);       /* Rahu -> Ketu half  */
    const sideKR=SEVEN.filter(g=>rel(g)>=180);      /* Ketu -> Rahu half  */
    const present=!sideRK.length||!sideKR.length;
    const axis=`the axis runs Rahu ${sign(v.P.Rahu.sign)} - Ketu ${sign(v.P.Ketu.sign)}`;
    out.push({name:"Kalsarpa",sanskrit:"कालसर्प",present,
      because: present
        ?`All seven grahas stand on one side of the nodal axis (${axis}): `+
         `${list((sideRK.length?sideRK:sideKR).map(at))}. That confinement is the entire rule. `+
         `Traditions grade it further by which house Rahu holds and read it as a pattern `+
         `of concentrated effort, never as a verdict.`
        :`The rule requires every one of the seven grahas on one side of the nodal axis `+
         `(${axis}). Here they straddle it - ${list(sideRK.map(at))} on the Rahu side, `+
         `${list(sideKR.map(at))} on the Ketu side - so the formation does not exist in this chart.`});
  }

  /* Guru Chandal - Jupiter conjoined a node, by sign (the mainstream rule).
     A looser school also counts Jupiter's aspect onto a node; when that is
     the only contact, the verdict stays absent and the evidence says so. */
  {
    const node=["Rahu","Ketu"].find(n=>v.P[n].sign===v.P.Jupiter.sign);
    const aspNode=["Rahu","Ketu"].find(n=>v.aspects("Jupiter",v.P[n].sign));
    out.push({name:"Guru Chandal",sanskrit:"गुरु चाण्डाल",present:!!node,
      because: node
        ?`Jupiter and ${node} share ${sign(v.P.Jupiter.sign)} (${sep(v.P.Jupiter.lon,v.P[node].lon).toFixed(1)}° apart). `+
         `Jupiter conjoined a node is the rule; the tradition reads it as conviction and `+
         `appetite pulling on the same rope - a tension to work with, not a punishment.`
        :`The rule needs Jupiter in one sign with Rahu or Ketu; Jupiter stands in `+
         `${sign(v.P.Jupiter.sign)} while the nodes hold ${sign(v.P.Rahu.sign)} and `+
         `${sign(v.P.Ketu.sign)} - no conjunction, so the dosha is absent under the `+
         `conjunction rule this engine follows.`+
         (aspNode?` (A looser school also counts Jupiter's aspect: Jupiter does cast its `+
           `aspect onto ${aspNode} here, which is how some vendors flag this chart.)`:"")});
  }

  /* Chandra Grahan - the Moon conjoined a node by sign (eclipse-flavoured Moon) */
  {
    const node=["Rahu","Ketu"].find(n=>v.P[n].sign===v.P.Moon.sign);
    out.push({name:"Chandra Grahan",sanskrit:"चन्द्र ग्रहण",present:!!node,
      because: node
        ?`The Moon and ${node} share ${sign(v.P.Moon.sign)}, `+
         `${sep(v.P.Moon.lon,v.P[node].lon).toFixed(1)}° apart, in your ${ord(v.P.Moon.house)} house. `+
         `A node conjoined the Moon is the rule - the eclipse geometry written into the birth `+
         `chart. The tradition reads it as emotional weather that runs deeper than average, `+
         `and treats naming it as the useful part.`
        :`The rule needs the Moon in one sign with Rahu or Ketu; the Moon stands in `+
         `${sign(v.P.Moon.sign)} while the nodes hold ${sign(v.P.Rahu.sign)} and `+
         `${sign(v.P.Ketu.sign)} - the formation is absent.`});
  }
  return out;
}
