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
  return {lagna,P,inSign,dign,combust,benefic,benefics,malefic,aspects,
          lordOfHouse,housesOf,at,moonBright};
}

/* ---- the detectors ------------------------------------------------ */

const yoga=(name,sanskrit,because,strength,planets)=>
  ({name,sanskrit,present:true,because,strength,planets});

function budhaAditya(v){
  if(v.P.Sun.sign!==v.P.Mercury.sign) return null;
  const gap=sep(v.P.Sun.lon,v.P.Mercury.lon).toFixed(1);
  const deep=Number(gap)<3;
  return yoga("Budha-Aditya Yoga","बुधादित्य योग",
    `Sun and Mercury share ${sign(v.P.Sun.sign)} in your ${ord(v.P.Sun.house)} house, `+
    `${gap}° apart - the rule asks only that the two occupy one sign.`+
    (deep?` Mercury sits deep in the Sun's glare (combust), which tempers the yoga.`:""),
    deep?"moderate":"strong",["Sun","Mercury"]);
}

function gajakesari(v){
  const n=countFrom(v.P.Moon.sign,v.P.Jupiter.sign);
  if(!KENDRA.includes(n)) return null;
  const d=v.dign("Jupiter");
  return yoga("Gajakesari Yoga","गजकेसरी योग",
    `Jupiter in ${sign(v.P.Jupiter.sign)} stands in the ${ord(n)} from your Moon in `+
    `${sign(v.P.Moon.sign)} - a kendra (1/4/7/10) from the Moon, which is the whole rule.`+
    (d?` Jupiter is ${d} there.`:""),
    d==="exalted"||d==="own sign"?"strong":v.combust("Jupiter")?"weak":"moderate",
    ["Jupiter","Moon"]);
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
      strengthOf(second),["Moon",...second]));
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
    out.push(yoga(`Parivartana Yoga (${kind})`,"परिवर्तन योग",
      `${a} occupies ${sign(v.P[a].sign)} - ${b}'s sign - while ${b} occupies `+
      `${sign(v.P[b].sign)} - ${a}'s sign. The two lords have exchanged houses `+
      `${ord(ha)} and ${ord(hb)}. `+
      (kind==="Maha"?`Both are good houses, making this the Maha (raja-grade) exchange.`
       :kind==="Khala"?`The 3rd house is involved, making this the Khala grade.`
       :`A dusthana (6/8/12) is involved, making this the Dainya grade.`),
      kind==="Maha"?"strong":kind==="Khala"?"moderate":"weak",[a,b]));
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
    if(inKendraFrom(disp))
      reasons.push(`its dispositor ${disp} stands in ${sign(v.P[disp].sign)}, a kendra `+
        `from the lagna or the Moon`);
    if(exaltedThere&&exaltedThere!==g&&inKendraFrom(exaltedThere))
      reasons.push(`${exaltedThere}, the planet exalted in ${sign(debSign)}, holds a `+
        `kendra from the lagna or the Moon (${sign(v.P[exaltedThere].sign)})`);
    if(SIGN_LORD[v.P[disp].sign]===g)
      reasons.push(`${g} and its dispositor ${disp} are in mutual exchange`);
    if(v.aspects(disp,debSign))
      reasons.push(`its dispositor ${disp} aspects it from ${sign(v.P[disp].sign)}`);
    if(!reasons.length) continue;
    out.push(yoga("Neecha Bhanga Raja Yoga","नीचभङ्ग राजयोग",
      `${g} is debilitated in ${sign(debSign)} (your ${ord(v.P[g].house)} house), but the `+
      `debilitation is cancelled: ${list(reasons)}.`,
      reasons.length>=2?"strong":"moderate",[g,disp]));
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
    out.push(yoga(name,sk,
      `${g} stands ${d} in ${sign(v.P[g].sign)}, which is your ${ord(v.P[g].house)} `+
      `house - a kendra from the lagna. ${d==="exalted"?"Exaltation":"Own sign"} in a `+
      `kendra is the complete Mahapurusha rule for ${g}.`,
      v.combust(g)?"moderate":"strong",[g]));
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
  const clauses=[], involved=new Set();
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
    involved.add(g);
    if(["own sign","exalted"].includes(d)||KENDRA.includes(v.P[g].house)
       ||TRIKONA.includes(v.P[g].house)) karakaStrong=true;
  }
  if(!clauses.length) return null;
  const afflicted=[...involved].every(g=>v.dign(g)==="debilitated"||v.combust(g));
  return yoga("Raja Yoga (Kendra-Trikona)","राजयोग (केन्द्र-त्रिकोण)",
    `Lords of kendra (angle) and trikona (trine) houses join forces: `+list(clauses)+`.`,
    karakaStrong||clauses.length>=2?"strong":afflicted?"weak":"moderate",
    [...involved]);
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
