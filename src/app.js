import { positions, retrograde, ayanamsa, jd, norm as ephNorm,
         moonTropical, sunTropical, moonSidereal, sunSidereal } from "./ephemeris.js";
const julian = jd;
const RAD=Math.PI/180;
const sind=d=>Math.sin(d*RAD);

/* &#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;
   ENGINE &#8212; ported from AstrologyKit (85 checks pass under `swift run
   validate`), and re-verified in Node against the Swift results.
   Signs, houses, lordships, dignity, nakshatra and dasha are DERIVED.
   &#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552; */
const SIGNS=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const SIGNS_SK=["Mesha","Vrishabha","Mithuna","Karka","Simha","Kanya","Tula","Vrishchika","Dhanu","Makara","Kumbha","Meena"];
const SIGN_LORD={1:"Mars",2:"Venus",3:"Mercury",4:"Moon",5:"Sun",6:"Mercury",7:"Venus",8:"Mars",9:"Jupiter",10:"Saturn",11:"Saturn",12:"Jupiter"};
const NAK=["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"];
const ORDER=["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"];
const YEARS={Ketu:7,Venus:20,Sun:6,Moon:10,Mars:7,Rahu:18,Jupiter:16,Saturn:19,Mercury:17};
const NSPAN=360/27, PSPAN=NSPAN/4, YDAYS=365.2425;

const BHAVA=[
 ["Tanu","The self","Your body, temperament and the face you show the world. The lens every other house is read through."],
 ["Dhana","Wealth and speech","What you accumulate and what you say &#8212; money, family line, food, and the voice you speak in."],
 ["Sahaja","Siblings and courage","Younger siblings, nerve, short journeys, and the willingness to act on your own behalf."],
 ["Bandhu","Mother and home","Your mother, land, vehicles and inner peace. The house of where you rest."],
 ["Putra","Children and creativity","Children, intelligence, romance, and the merit carried in from past action."],
 ["Ari","Illness, debt and rivals","Disease, borrowing, enemies and service &#8212; and the discipline that comes from meeting them."],
 ["Yuvati","Marriage and partnership","Your spouse, business partners and contracts. Whoever stands opposite you."],
 ["Randhra","Transformation and the hidden","Longevity, inheritance, upheaval, and the things that arrive unannounced."],
 ["Dharma","Father, fortune and belief","Your father, teachers, philosophy, long journeys and grace."],
 ["Karma","Career and standing","Work, authority, reputation and the mark you leave publicly."],
 ["Labha","Gains and friends","Income, networks, elder siblings, and desires that come good."],
 ["Vyaya","Loss and release","Expenditure, seclusion, foreign lands, sleep and liberation."]];

const KARAKA={Sun:"Self, father, authority, vitality",Moon:"Mind, mother, emotion, memory",
 Mars:"Courage, siblings, conflict, property",Mercury:"Intellect, speech, commerce, learning",
 Jupiter:"Wisdom, children, wealth, teachers",Venus:"Spouse, beauty, pleasure, art",
 Saturn:"Time, discipline, longevity, sorrow",Rahu:"Obsession, foreign things, disruption",
 Ketu:"Detachment, liberation, past mastery"};
const CORE={
 Sun:"Authority, vitality, the self as it wants to be seen. Where the Sun sits is where you must be visible.",
 Moon:"Mind, mood, memory and the mother &#8212; how you actually feel, as against how you present.",
 Mars:"Drive, courage, conflict and sharp instruments. The will to cut through.",
 Mercury:"Intellect, speech, commerce, calculation. How you process and transmit.",
 Jupiter:"Expansion, teaching, faith, counsel. Jupiter enlarges whatever it touches.",
 Venus:"Beauty, pleasure, art, partnership and value. What you are drawn toward.",
 Saturn:"Time, structure, limitation and endurance. Saturn withholds, then rewards what survived the withholding.",
 Rahu:"The north node &#8212; not a body but a point where eclipses occur. Hunger and appetite without a natural limit.",
 Ketu:"The south node. Detachment, past mastery, and the impulse to release what Rahu grasps at."};
const SK={Sun:"Surya",Moon:"Chandra",Mars:"Mangala",Mercury:"Budha",Jupiter:"Guru",
 Venus:"Shukra",Saturn:"Shani",Rahu:"Rahu",Ketu:"Ketu"};

const norm=d=>((d%360)+360)%360;
const lon=(s,d,m=0)=>norm((s-1)*30+d+m/60);
const signOf=L=>Math.floor(norm(L)/30)+1;
const degIn=L=>norm(L)%30;
const nakOf=L=>Math.floor(norm(L)/NSPAN);
const padaOf=L=>Math.floor((norm(L)%NSPAN)/PSPAN)+1;
const nakFrac=L=>(norm(L)%NSPAN)/NSPAN;
const sep=(a,b)=>{const r=Math.abs(norm(a)-norm(b));return r>180?360-r:r};
const spokenDeg=L=>{const d=degIn(L),i=Math.floor(d);
  return `${i} degrees ${Math.floor((d-i)*60)} minutes`};
const fmtDeg=L=>{const d=degIn(L),i=Math.floor(d);
  return `${String(i).padStart(2,"0")}&#176;${String(Math.floor((d-i)*60)).padStart(2,"0")}'`};
const adv=(s,n)=>((s-1+n-1)%12+12)%12+1;
const own=g=>Object.keys(SIGN_LORD).filter(s=>SIGN_LORD[s]===g).map(Number);
const shadow=g=>g==="Rahu"||g==="Ketu";
const EX={Sun:[1,10],Moon:[2,3],Mars:[10,28],Mercury:[6,15],Jupiter:[4,5],Venus:[12,27],Saturn:[7,20]};
const MT={Sun:[5,0,20],Moon:[2,4,30],Mars:[1,0,12],Mercury:[6,16,20],Jupiter:[9,0,10],Venus:[7,0,15],Saturn:[11,0,20]};
function dignity(g,L){
  if(shadow(g))return null;
  const s=signOf(L),d=degIn(L),e=EX[g],m=MT[g];
  if(e&&e[0]===s)return "Exalted";
  if(e&&adv(e[0],7)===s)return "Debilitated";
  if(m&&m[0]===s&&d>=m[1]&&d<=m[2])return "Moolatrikona";
  if(own(g).includes(s))return "Own sign";
  return null;
}
const DR={Mars:[4,7,8],Jupiter:[5,7,9],Saturn:[3,7,10]};
const offsets=g=>DR[g]||((g==="Rahu"||g==="Ketu")&&PREFS().nodal?[5,7,9]:[7]);

function vimshottari(birth,moonL){
  const li=nakOf(moonL)%9, birthLord=ORDER[li];
  const balance=YEARS[birthLord]*(1-nakFrac(moonL));
  const mahas=[]; let c=new Date(birth);
  for(let i=0;i<10;i++){
    const lord=ORDER[(li+i)%9], y=i===0?balance:YEARS[lord];
    const end=new Date(c.getTime()+y*YDAYS*864e5);
    mahas.push({lord,start:new Date(c),end,years:y}); c=end;
  }
  const antars=m=>{const st=ORDER.indexOf(m.lord),out=[];let c=m.start.getTime();
    const span=m.end-m.start;
    for(let i=0;i<9;i++){const lord=ORDER[(st+i)%9];
      const end=c+span*(YEARS[lord]/120);
      out.push({lord,start:new Date(c),end:new Date(end)});c=end}
    return out};
  const at=d=>{const m=mahas.find(x=>d>=x.start&&d<x.end);
    return m?{maha:m,antar:antars(m).find(x=>d>=x.start&&d<x.end)}:null};
  return {birthLord,balance,mahas,antars,at};
}

function buildChart({ascendant,placements,birthDate}){
  const lagna=signOf(ascendant);
  const houseOfSign=s=>((s-lagna)%12+12)%12+1;
  const signOfHouse=h=>adv(lagna,h);
  const ps=placements.map(p=>{
    const s=signOf(p.L),ni=nakOf(p.L);
    return {...p,sign:s,house:houseOfSign(s),degf:fmtDeg(p.L),
      nak:NAK[ni],pada:padaOf(p.L),dig:dignity(p.graha,p.L)}});
  const get=g=>ps.find(p=>p.graha===g);
  const occupants=h=>ps.filter(p=>p.house===h);
  const housesRuled=g=>shadow(g)?[]:own(g).map(houseOfSign).sort((a,b)=>a-b);
  const aspectedBy=g=>{const p=get(g);return p?offsets(g).map(o=>adv(p.house,o)).sort((a,b)=>a-b):[]};
  const aspecting=h=>ps.filter(p=>p.house!==h&&aspectedBy(p.graha).includes(h)).map(p=>p.graha);
  const conjunct=g=>{const p=get(g);return p?ps.filter(q=>q.graha!==g&&q.sign===p.sign).map(q=>q.graha):[]};
  const dasha=vimshottari(birthDate,placements.find(p=>p.graha==="Moon").L);
  return {lagna,ascendant,placements:ps,birthDate,houseOfSign,signOfHouse,
          get,occupants,housesRuled,aspectedBy,aspecting,conjunct,dasha};
}

/* Solar longitude (Meeus 25), needed for the lunar phase. */
/* Phase is the Moon's elongation from the Sun - the actual geometry.
   An earlier version counted mean lunations from a fixed epoch and drifted
   by days: it put 28 Aug 2026 dark when that date carries a lunar eclipse.
   Checked against the Aug 2026 eclipses: 12 Aug reads 0%, 28 Aug reads 100%. */

/* Where the sky actually is on a given day, read against the natal chart.
   The Moon changes sign every ~2.3 days, so this is what makes one day
   differ from the next - without it a "daily" screen is just the chart again. */
function transits(date){
  const pos=positions(date), retro=retrograde(date);
  const mk=L=>({L,sign:signOf(L),house:CHART.houseOfSign(signOf(L)),
    nak:NAK[nakOf(L)],pada:padaOf(L),deg:fmtDeg(L)});
  const all={};
  GRAHA_ORDER.forEach(g=>{ all[g]={...mk(pos[g]), retro:retro[g], graha:g} });
  return {...all, moon:all.Moon, sun:all.Sun, all, phase:moonPhase(date)};
}

function moonPhase(date){
  const J=julian(date);
  const e=norm(moonTropical(J)-sunTropical(J));
  const f=e/360;
  const names=["New Moon","Waxing Crescent","First Quarter","Waxing Gibbous",
               "Full Moon","Waning Gibbous","Last Quarter","Waning Crescent"];
  return {f, illum:(1-Math.cos(e*RAD))/2, name:names[Math.round(f*8)%8],
          waxing:f<0.5, elongation:e};
}

/* Birth: 26 March 1992, 10:00 IST, Kopargaon (19.8824N 74.4761E).
   Positions are now COMPUTED from that moment rather than transcribed.
   Cross-checked against the Astrotalk report: worst error 5.6 arcmin,
   every sign, nakshatra, pada and retrograde flag matching. */
const BIRTH = new Date("1992-03-26T10:00:00+05:30");
const BIRTHPLACE = { name:"Kopargaon, Maharashtra", lat:19.8824, lon:74.4761 };

/* The ascendant still needs sidereal time and latitude, which the report
   already gives us to the arcsecond. Computing it is the next engine task. */
const ASCENDANT = lon(2,12,5.75);

const GRAHA_ORDER=["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"];
function chartFor(date, ascendant){
  const pos=positions(date), retro=retrograde(date);
  return buildChart({
    ascendant,
    birthDate: date,
    placements: GRAHA_ORDER.map(g=>({graha:g, L:pos[g], retro:retro[g]}))
  });
}
const CHART = chartFor(BIRTH, ASCENDANT);

const gIcon=(g,sz=18)=>`<img class="gico" src="assets/graha/${g.toLowerCase()}.png" width="${sz}" height="${sz}" alt="" draggable="false">`;
const COLOUR=g=>`var(--${g.toLowerCase()})`;
const ordinal=n=>n+(["th","st","nd","rd"][(n%100-20)%10]||["th","st","nd","rd"][n%100]||"th");
const buzz=ms=>{try{if(PREFS().haptics!==false&&navigator.vibrate)navigator.vibrate(ms)}catch(_){}}
const el=(t,a={})=>{const e=document.createElementNS("http://www.w3.org/2000/svg",t);
  for(const k in a)e.setAttribute(k,a[k]);return e};
const fmtDate=d=>d.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});

/* &#9552;&#9552;&#9552; GEOMETRY &#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552; */
const PT={tl:[0,0],tr:[100,0],br:[100,100],bl:[0,100],t:[50,0],r:[100,50],
  b:[50,100],l:[0,50],c:[50,50],q1:[25,25],q2:[75,25],q3:[75,75],q4:[25,75]};
const HOUSES={1:[PT.t,PT.q2,PT.c,PT.q1],2:[PT.tl,PT.t,PT.q1],3:[PT.tl,PT.q1,PT.l],
  4:[PT.l,PT.q1,PT.c,PT.q4],5:[PT.bl,PT.l,PT.q4],6:[PT.bl,PT.q4,PT.b],
  7:[PT.b,PT.q4,PT.c,PT.q3],8:[PT.br,PT.b,PT.q3],9:[PT.br,PT.q3,PT.r],
  10:[PT.r,PT.q3,PT.c,PT.q2],11:[PT.tr,PT.r,PT.q2],12:[PT.tr,PT.q2,PT.t]};
const CHART_PX=430;
function inradius(poly){
  const c=cent(poly); let m=Infinity;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const [x1,y1]=poly[j],[x2,y2]=poly[i];
    const L=Math.hypot(x2-x1,y2-y1);
    m=Math.min(m, Math.abs((x2-x1)*(y1-c[1])-(x1-c[0])*(y2-y1))/L);
  }
  return m;
}
const cent=p=>[p.reduce((a,q)=>a+q[0],0)/p.length,p.reduce((a,q)=>a+q[1],0)/p.length];
const ANCHOR={},LABEL={};
for(const h in HOUSES){
  const c=cent(HOUSES[h]),tri=HOUSES[h].length===3;
  ANCHOR[h]=tri?[c[0]+(50-c[0])*.14,c[1]+(50-c[1])*.14]:c;
  const outer=HOUSES[h].reduce((b,v)=>Math.hypot(v[0]-50,v[1]-50)>Math.hypot(b[0]-50,b[1]-50)?v:b,HOUSES[h][0]);
  LABEL[h]=[c[0]+(outer[0]-c[0])*.56,c[1]+(outer[1]-c[1])*.56];
}

/* Point-in-polygon, so a graha can never be drawn into a neighbouring
   house. Candidate positions are pulled toward the house anchor until
   they sit inside a shrunk copy of the polygon - shrunk by roughly the
   graha's own radius, so the disc clears the border too. */
function inPoly(pt,poly){
  let inside=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const [xi,yi]=poly[i],[xj,yj]=poly[j];
    if(((yi>pt[1])!==(yj>pt[1])) && (pt[0]<(xj-xi)*(pt[1]-yi)/(yj-yi)+xi)) inside=!inside;
  }
  return inside;
}
const shrinkPoly=(poly,k)=>{const c=cent(poly);
  return poly.map(v=>[v[0]+(c[0]-v[0])*k, v[1]+(c[1]-v[1])*k])};
function fitInside(pt,poly,anchor,margin){
  const sp=shrinkPoly(poly,margin);
  if(inPoly(pt,sp)) return pt;
  for(let t=0.08;t<=1;t+=0.08){
    const q=[pt[0]+(anchor[0]-pt[0])*t, pt[1]+(anchor[1]-pt[1])*t];
    if(inPoly(q,sp)) return q;
  }
  return anchor;
}

/* Each house has a different shape: house 2 is wide and flat, house 11 is
   tall and narrow. Spreading grahas horizontally in both crowds the narrow
   ones, so the group is laid out along the polygon's own longest axis. */
const AXIS={};
for(const h in HOUSES){
  const v=HOUSES[h]; let best=0, ax=[1,0];
  for(let i=0;i<v.length;i++) for(let j=i+1;j<v.length;j++){
    const d=Math.hypot(v[i][0]-v[j][0], v[i][1]-v[j][1]);
    if(d>best+0.01){best=d; ax=[(v[j][0]-v[i][0])/d, (v[j][1]-v[i][1])/d]}
  }
  /* diamonds are square in both directions - horizontal reads better there */
  AXIS[h]= v.length===4 ? [1,0] : ax;
}

function locator(h){
  const shapes=Object.keys(HOUSES).map(k=>
    `<polygon points="${HOUSES[k].map(q=>q.join(",")).join(" ")}" fill="${+k===h?"var(--brass)":"transparent"}" fill-opacity="${+k===h?.9:0}" stroke="var(--line-2)" stroke-width="2.5"/>`).join("");
  return `<svg class="loc" viewBox="-4 -4 108 108" aria-hidden="true"><rect x="0" y="0" width="100" height="100" fill="none" stroke="var(--line-2)" stroke-width="2.5"/>${shapes}</svg>`;
}

/* &#9552;&#9552;&#9552; TODAY &#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552; */
let viewDate=new Date(); let stripScroll=null;
const isToday=d=>d.toDateString()===new Date().toDateString();
const isoOf=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

const CATS=[
  {key:"Career",     house:10, colour:"var(--saturn)"},
  {key:"Wealth",     house:2,  colour:"var(--jupiter)"},
  {key:"Relationships",house:7, colour:"var(--venus)"},
  {key:"Wellbeing",  house:6,  colour:"var(--mars)"},
  {key:"Inner life", house:12, colour:"var(--moon)"}
];

/* Readings are assembled from chart facts by template &#8212; never free text.
   Each one can name the placement it came from, which is what makes the
   "why am I seeing this?" answer possible. */
function reading(cat,tr){
  const lord=SIGN_LORD[CHART.signOfHouse(cat.house)];
  const lp=CHART.get(lord), occ=CHART.occupants(cat.house);
  const now=CHART.dasha.at(viewDate);
  const moonHere=tr && tr.moon.house===cat.house;
  const dashaTouch=now&&(now.maha.lord===lord||now.antar.lord===lord);

  /* one short line. The technical trail lives in the "why", underneath. */
  let line;
  if(moonHere) line=`Lit up today &#8212; the Moon is passing through.`;
  else if(dashaTouch) line=`Emphasised right now: ${lord} rules both this and the period you are in.`;
  else if(occ.length) line=`${occ.map(o=>o.graha).join(" and ")} ${occ.length>1?"sit":"sits"} here${occ[0].dig?`, ${occ[0].dig.toLowerCase()}`:""}.`;
  else if(lp.dig) line=`Read through ${lord}, which is ${lp.dig.toLowerCase()} in your ${ordinal(lp.house)}.`;
  else line=`Quiet. Read through ${lord} in your ${ordinal(lp.house)}.`;

  return {text:line,
    why:`${ordinal(cat.house)} &#183; ${lord} in ${ordinal(lp.house)}${dashaTouch?" &#183; active":""}${moonHere?" &#183; moon here":""}`};
}

let horoPeriod="day";

const HOUSE_ADVICE={
 1:["yourself","how you come across, and your own energy"],
 2:["money and words","spending, saving, and what you say"],
 3:["nerve","initiative, siblings, short trips"],
 4:["home","family, rest, and where you feel settled"],
 5:["creativity","romance, children, and what you make"],
 6:["obstacles","work pressure, health routines, and rivals"],
 7:["other people","your partner, and the deals you make"],
 8:["what is hidden","shared money, and things that surface unexpectedly"],
 9:["belief","teachers, travel, and the bigger picture"],
 10:["work","your standing, and what people see you do"],
 11:["gains","income, friends, and things paying off"],
 12:["letting go","rest, solitude, expenses, and closure"]};

/* The reading a person actually wants: what to expect, in ordinary words.
   Built from chart facts, but the facts stay underneath rather than on top. */
function horoscope(period,date){
  const tr=transits(date), now=CHART.dasha.at(date);
  const mh=tr.moon.house, sh=tr.sun.house;
  const lord=now.maha.lord, dashaHouses=CHART.housesRuled(lord);

  if(period==="day"){
    const [topic,detail]=HOUSE_ADVICE[mh];
    const flavour=tr.phase.illum>0.9?"A full Moon tends to bring things to a head."
      :tr.phase.illum<0.1?"A dark Moon suits starting quietly rather than announcing anything."
      :tr.phase.waxing?"The Moon is building, which traditionally favours starting things."
      :"The Moon is waning, which traditionally favours finishing and clearing.";
    return {head:`A day about ${topic}`,
      body:`The Moon is crossing your ${ordinal(mh)} house, so ${detail} is where today's attention naturally goes. ${flavour}`,
      under:`Underneath, a ${lord} period keeps ${dashaHouses.length?dashaHouses.map(h=>HOUSE_ADVICE[h][0]).join(" and "):"whatever "+lord+" sits with"} in the background.`};
  }
  if(period==="week"){
    const houses=[];
    for(let i=0;i<7;i++){const d=new Date(date); d.setDate(d.getDate()+i);
      const h=transits(d).moon.house; if(houses[houses.length-1]!==h) houses.push(h)}
    return {head:`A week across ${houses.length} areas`,
      body:`The Moon moves from your ${houses.map(ordinal).join(", then the ")} house &#8212; ${houses.map(h=>HOUSE_ADVICE[h][0]).join(", then ")}.`,
      under:`Put the ${HOUSE_ADVICE[houses[0]][0]} things early and the ${HOUSE_ADVICE[houses[houses.length-1]][0]} things late.`};
  }
  const [stopic,sdetail]=HOUSE_ADVICE[sh];
  return {head:`A month about ${stopic}`,
    body:`The Sun sits in your ${ordinal(sh)} house for about a month, so ${sdetail} stays lit throughout.`,
    under:`Your ${now.antar.lord} sub-period runs to ${fmtDate(now.antar.end)}; the ${lord} period behind it to ${fmtDate(now.maha.end)}.`};
}


function renderToday(){
  const tr=transits(viewDate), mp=tr.phase;
  const now=CHART.dasha.at(viewDate);
  const natalMoon=CHART.get("Moon");

  /* a fixed window around today, so selecting a day highlights it in place
     instead of re-centring the strip under your finger */
  const days=[];
  for(let i=-14;i<=14;i++){
    const d=new Date(); d.setDate(d.getDate()+i); d.setHours(12,0,0,0);
    const on=d.toDateString()===viewDate.toDateString();
    days.push(`<button class="dchip ${on?"on":""}" data-off="${i}">
      <small>${d.toLocaleDateString("en-GB",{weekday:"short"}).slice(0,2)}</small>
      <b>${d.getDate()}</b>${moonImg(d,22)}${isToday(d)?`<i class="nowdot"></i>`:""}</button>`);
  }

  const mHouse=tr.moon.house, sHouse=tr.sun.house;
  const h=horoscope(horoPeriod,viewDate);
  setTopBar("Hi Sangram",{sub:viewDate.toLocaleDateString("en-GB",
      {weekday:"short",day:"numeric",month:"short"}).replace(",",""),
    actions:`${isToday(viewDate)?"":`<button class="tb-btn txt" id="totoday">Today</button>`}
     <button class="tb-btn" id="calbtn" aria-label="Choose a date">
       <svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/>
         <path d="M3.5 9.6h17M8 3.2v3.6M16 3.2v3.6"/></svg></button>`});

  document.getElementById("pg-today").innerHTML=`
    <div class="datestrip" id="dates">${days.join("")}</div>

    <div class="segmented" id="hperiod">
      ${["day","week","month"].map(k=>`<button class="${horoPeriod===k?"on":""}" data-k="${k}">
        ${k[0].toUpperCase()+k.slice(1)}</button>`).join("")}
    </div>

    <p class="forline">${
      horoPeriod==="day"
        ? `Horoscope for ${viewDate.toLocaleDateString("en-GB",{day:"numeric",month:"long"})}`
        : horoPeriod==="week"
        ? (()=>{const e=new Date(viewDate);e.setDate(e.getDate()+6);
            return `Horoscope for ${viewDate.toLocaleDateString("en-GB",{day:"numeric",month:"short"})} to ${e.toLocaleDateString("en-GB",{day:"numeric",month:"short"})}`})()
        : `Horoscope for ${viewDate.toLocaleDateString("en-GB",{month:"long",year:"numeric"})}`}</p>
    <div class="reading">
      <h2>${h.head}</h2>
      <p>${h.body}</p>
      <p class="under">${h.under}</p>
    </div>

    <div class="moonline">
      ${moonImg(viewDate,30)}
      <span><b>${tr.phase.name}</b> ${Math.round(tr.phase.illum*100)}% &#183;
        ${SIGNS[tr.moon.sign-1]} &#183; ${tr.moon.nak}</span>
    </div>

    <div class="movingline">
      ${moonImg(viewDate,22)}<span>Moon in ${SIGNS[tr.moon.sign-1]}, your ${ordinal(mHouse)}</span>
      <i></i>
      <img class="mvico" src="assets/graha/sun.png" alt=""><span>Sun in ${SIGNS[tr.sun.sign-1]}, your ${ordinal(sHouse)}</span>
    </div>

    <div class="section">${practiceFor(now.maha.lord)}</div>

    <p class="note">Sun and Moon computed for this date; the rest is your natal chart.
    Traditional interpretation, not a prediction.</p>`;

  const strip=document.getElementById("dates");
  strip.onclick=e=>{
    const b=e.target.closest(".dchip"); if(!b)return;
    const d=new Date(); d.setDate(d.getDate()+ +b.dataset.off); d.setHours(12,0,0,0);
    viewDate=d; buzz(6); renderToday();
  };
  /* centre only on first paint - re-centring on every tap makes the row
     jump under your finger */
  const sel=strip.querySelector(".dchip.on");
  if(sel && stripScroll===null) stripScroll=sel.offsetLeft-strip.clientWidth/2+sel.offsetWidth/2;
  strip.style.scrollBehavior="auto";
  strip.scrollLeft=stripScroll??0;
  strip.addEventListener("scroll",()=>{stripScroll=strip.scrollLeft},{passive:true});
  document.getElementById("calbtn").onclick=openCalendar;
  const tt=document.getElementById("totoday");
  if(tt) tt.onclick=()=>{ viewDate=new Date(); buzz(10); renderToday(); };
  document.getElementById("hperiod").onclick=e=>{
    const b=e.target.closest("button[data-k]"); if(!b)return;
    horoPeriod=b.dataset.k; buzz(6); renderToday();
  };

}

const PEL={};
function renderUniverse(){
  setTopBar("Sangram\u2019s birth chart",{sub:`${SIGNS_SK[CHART.lagna-1]} lagna \u00b7 ${fmtDeg(CHART.ascendant)} \u00b7 ${CHART.get("Moon").nak} Moon`});
  const pg=document.getElementById("pg-universe");
  pg.innerHTML=`
    <p class="muted" style="margin:0;font-size:13px;color:var(--ink-3)">Touch a house, or a graha.</p>
    <div class="stagewrap" id="sw">
      <div class="stage" id="stage">
        <div class="orbit" id="orbit">
          <svg class="chart" viewBox="0 0 100 100" id="chart"
               aria-label="North Indian birth chart, twelve houses"></svg>
          <svg class="asp" viewBox="0 0 100 100" id="asp"></svg>
          <div class="plane" id="plane"></div>
        </div>
      </div>
    </div>
    <div class="chartactions" id="chartactions">
      <button class="ghostbtn" id="dlchart">
        <svg viewBox="0 0 24 24"><path d="M12 4v11M8 11.5l4 4 4-4M5 19.5h14"/></svg>
        Download my birth chart</button>
    </div>`;

  const chart=document.getElementById("chart"), plane=document.getElementById("plane");
  for(let h=1;h<=12;h++){
    const sg=CHART.signOfHouse(h), occ=CHART.occupants(h);
    const s=el("polygon",{points:HOUSES[h].map(p=>p.join(",")).join(" "),
      class:"hs","data-h":h,tabindex:"0",role:"button"});
    s.setAttribute("aria-label",
      `${ordinal(h)} house. ${SIGNS[sg-1]}, sign ${sg}. Ruled by ${SIGN_LORD[sg]}. `+
      (occ.length?`${occ.map(o=>o.graha).join(", ")} ${occ.length>1?"occupy":"occupies"} this house.`:"No graha here."));
    chart.appendChild(s);
    const L=LABEL[h], t=el("text",{class:"sn",x:L[0],y:L[1],"data-h":h});
    t.textContent=String(sg); chart.appendChild(t);
  }
  chart.appendChild(el("rect",{x:0,y:0,width:100,height:100,class:"fr"}));
  chart.appendChild(el("line",{x1:0,y1:0,x2:100,y2:100,class:"fr in"}));
  chart.appendChild(el("line",{x1:100,y1:0,x2:0,y2:100,class:"fr in"}));
  chart.appendChild(el("polygon",{points:"50,0 100,50 50,100 0,50",class:"fr in"}));
  chart.appendChild(el("polygon",{points:HOUSES[1].map(p=>p.join(",")).join(" "),class:"lg"}));
  const asc=el("text",{class:"asclbl",x:50,y:9}); asc.textContent="ASC"; chart.appendChild(asc);

  for(const p of CHART.placements){
    const sibs=CHART.occupants(p.house), i=sibs.indexOf(p), n=sibs.length;
    const a=ANCHOR[p.house], poly=HOUSES[p.house], tri=poly.length===3;
    /* the illustrations fill their frame, and the Sun's corona and Saturn's
       ring extend past the disc - so these weights are about apparent size,
       not radius */
    const sz={Sun:1.14,Moon:1.0,Mars:.98,Mercury:.9,Jupiter:1.06,Venus:.98,
              Saturn:1.16,Rahu:.94,Ketu:.9}[p.graha];
    const dpx=(n>=3?22:n===2?25:29)*sz;

    /* lay the group out on a short arc centred on the anchor, then clamp
       every member inside the house */
    const [ux,uy]=AXIS[p.house];
    const step=n===1?0:(tri?12:13.5);
    const t=(i-(n-1)/2)*step;
    /* nudge perpendicular to the axis so three-graha groups do not sit in a line */
    const perp=n<=2?0:Math.abs(i-(n-1)/2)*(tri?3.0:4.0);
    /* shrink the polygon by the disc's own radius, expressed as a fraction of
       the house's inradius - a fixed guess either clips or over-pulls */
    const radiusUnits=dpx/2/CHART_PX*100;
    const margin=Math.min(radiusUnits/inradius(poly), 0.42);
    const fit=fitInside([a[0]+ux*t - uy*perp, a[1]+uy*t + ux*perp - (uy?0:2.2)],
                        poly, a, margin);
    const x=fit[0]/100, y=fit[1]/100;

    const b=document.createElement("button");
    b.className="p"+(shadow(p.graha)?" shadow":"")+(p.retro?" retro":"");
    b.dataset.g=p.graha;
    b.style.setProperty("--x",x); b.style.setProperty("--y",y);
    b.style.setProperty("--d",dpx+"px");
    b.style.setProperty("--fill",COLOUR(p.graha));
    b.style.setProperty("--glow",shadow(p.graha)?`0 0 12px -1px ${COLOUR(p.graha)}`
      :`0 0 16px -2px ${COLOUR(p.graha)}, 0 0 34px -8px ${COLOUR(p.graha)}`);
    b.setAttribute("aria-label",`${p.graha}. ${SIGNS[p.sign-1]}, ${ordinal(p.house)} house, ${p.degf}.`+
      (p.dig?` ${p.dig}.`:"")+(p.retro?" Retrograde.":""));
    b.innerHTML=`<img class="art" src="assets/graha/${p.graha.toLowerCase()}.png" alt="" draggable="false">`+
      `<span class="name">${p.graha}<small>${SK[p.graha]}</small></span>`+
      
      `<span class="tag">${{Sun:"SU",Moon:"MO",Mars:"MA",Mercury:"ME",Jupiter:"JU",
        Venus:"VE",Saturn:"SA",Rahu:"RA",Ketu:"KE"}[p.graha]}</span>`+
      (p.retro?`<span class="retro">R</span>`:``);
    b._pos=[x,y]; plane.appendChild(b); PEL[p.graha]=b;
  }

  document.getElementById("dlchart").onclick=()=>{
    buzz(8);
    alert("Not built yet. The export will render your chart as an image with the app's name on it.");
  };
  chart.onclick=e=>{const t=e.target.closest(".hs"); if(t)openHouse(+t.dataset.h)};
  chart.onkeydown=e=>{const t=e.target.closest(".hs");
    if(t&&(e.key==="Enter"||e.key===" ")){e.preventDefault();openHouse(+t.dataset.h)}};
  plane.onclick=e=>{const b=e.target.closest(".p"); if(b){e.stopPropagation();openPlanet(b.dataset.g)}};
}

let mode=null,current=null;
const sheet=document.getElementById("sheet"), closeBtn=document.getElementById("close");
const qa=s=>Array.from(document.querySelectorAll(s));

function clearMarks(){
  qa(".hs").forEach(e=>e.classList.remove("sel","lit","dim"));
  qa(".sn").forEach(e=>e.classList.remove("sel","dim"));
  qa(".p").forEach(e=>e.classList.remove("dim","hidden","focus"));
  document.getElementById("asp").innerHTML="";
}
function resetChart(){
  mode=null;current=null;clearMarks();
  const st=document.getElementById("stage"),ob=document.getElementById("orbit");
  if(st)st.classList.remove("pmode");
  if(ob){ob.style.transform="";ob.style.transformOrigin="50% 50%"}
  qa(".p").forEach(b=>{b.style.transform="";b.style.zIndex=""});
  sheet.classList.remove("up"); closeBtn.classList.remove("on");
  document.getElementById("pg-universe").classList.remove("zoomed");
}
function showSheet(){
  sheet.classList.add("up"); sheet.scrollTop=0; closeBtn.classList.add("on"); sheet.scrollTop=0;
  document.getElementById("pg-universe").classList.add("zoomed");
}

function openHouse(h){
  if(mode==="house"&&current===h)return;
  mode="house";current=h;clearMarks();buzz(9);
  const a=ANCHOR[h],k=HOUSES[h].length===3?2.5:2.15;
  const ob=document.getElementById("orbit");
  ob.style.transformOrigin=`${a[0]}% ${a[1]}%`;
  ob.style.transform=`translate(${50-a[0]}%, ${30-a[1]}%) scale(${k})`;
  qa(".hs").forEach(e=>e.classList.add(+e.dataset.h===h?"sel":"dim"));
  qa(".sn").forEach(e=>e.classList.add(+e.dataset.h===h?"sel":"dim"));
  CHART.placements.forEach(p=>{if(p.house!==h)PEL[p.graha].classList.add("dim")});
  sheetHouse(h); showSheet();
}

function openPlanet(g){
  if(mode==="planet"&&current===g)return;
  const p=CHART.get(g); mode="planet";current=g;clearMarks();buzz(12);
  document.getElementById("stage").classList.add("pmode");
  const b=PEL[g],[px,py]=b._pos,K=.94,T=[.5,.28];
  b.classList.add("focus"); b.style.zIndex=40;
  b.style.transform=`translate(${((T[0]-.5)/K+.5-px)*100}%, ${((T[1]-.5)/K+.5-py)*100}%) scale(${(2.5/K).toFixed(3)})`;
  CHART.placements.forEach(o=>{if(o.graha!==g)PEL[o.graha].classList.add("hidden")});
  qa(".hs").forEach(e=>e.classList.add(+e.dataset.h===p.house?"lit":"dim"));
  qa(".sn").forEach(e=>{if(+e.dataset.h!==p.house)e.classList.add("dim")});
  drawAspects(p); sheetPlanet(p); showSheet();
}

function drawAspects(p){
  const asp=document.getElementById("asp"), from=ANCHOR[p.house];
  CHART.aspectedBy(p.graha).forEach((h,i)=>{
    const to=ANCHOR[h], mx=(from[0]+to[0])/2, my=(from[1]+to[1])/2;
    const path=el("path",{d:`M ${from[0]} ${from[1]} Q ${mx+(mx-50)*.3} ${my+(my-50)*.3} ${to[0]} ${to[1]}`,
      class:"al",stroke:"var(--hot)"});
    asp.appendChild(path);
    const len=path.getTotalLength();
    path.style.setProperty("--len",len);
    path.style.strokeDasharray=len; path.style.strokeDashoffset=len;
    path.style.animationDelay=(.18+i*.12)+"s";
    requestAnimationFrame(()=>path.classList.add("on"));
    const dot=el("circle",{cx:to[0],cy:to[1],r:1.6,fill:"var(--hot)",class:"al",stroke:"none"});
    asp.appendChild(dot); dot.style.animationDelay=(.5+i*.12)+"s";
    requestAnimationFrame(()=>dot.classList.add("on"));
  });
}

const rows=l=>`<div class="rows">${l.map(([k,v])=>
  `<div class="row"><span class="k">${k}</span><span class="v">${v}</span></div>`).join("")}</div>`;

function sheetHouse(h){
  const sg=CHART.signOfHouse(h), lord=SIGN_LORD[sg], lp=CHART.get(lord);
  const occ=CHART.occupants(h), inc=CHART.aspecting(h);
  const [sk,head,body]=BHAVA[h-1];
  document.getElementById("sheetbody").innerHTML=`
    <div class="eyebrow">${locator(h)}${ordinal(h)} house &#183; ${sk} Bhava &#183; ${SIGNS_SK[sg-1]} rashi</div>
    <h1 style="font-size:26px">${head}</h1>
    <p class="muted" style="margin:0 0 14px">${body}</p>
    <p class="lordline">Sign <b>${sg}</b> (${SIGNS[sg-1]}) &#183; ruled by ${gIcon(lord,17)}<b>${lord}</b>, which sits in the <b>${ordinal(lp.house)}</b></p>
    ${rows([
      ["Sign",`${SIGNS[sg-1]} (${sg})`],
      ["Grahas here",occ.length?occ.map(o=>`${gIcon(o.graha,16)}${o.graha}`).join("&nbsp; "):"&#8212;"],
      ["Aspected by",inc.length?inc.join(", "):"&#8212;"],
      ["Classification",[h===1||h===4||h===7||h===10?"Kendra":null,
        [1,5,9].includes(h)?"Trikona":null,[6,8,12].includes(h)?"Dusthana":null,
        [3,6,10,11].includes(h)?"Upachaya":null].filter(Boolean).join(" &#183; ")||"&#8212;"]
    ])}
    <div class="eyebrow" style="margin:20px 0 8px">What this means in your chart</div>
    <p class="interp">${occ.length
      ? `${occ.map(o=>o.graha).join(" and ")} ${occ.length>1?"sit":"sits"} here in ${SIGNS[sg-1]}${occ[0].dig?`, ${occ[0].dig.toLowerCase()}`:""}. ${CORE[occ[0].graha]}`
      : `No graha occupies this house, which in Vedic practice is not an empty subject &#8212; it is read through its lord.`}</p>
    <p class="interp">Its lord ${lord} sits in your ${ordinal(lp.house)} house${lp.dig?`, ${lp.dig.toLowerCase()}`:""}, which traditionally ties ${head.toLowerCase()} to ${BHAVA[lp.house-1][1].toLowerCase()}.</p>
    ${inc.length?`<p class="interp">${inc.join(" and ")} cast${inc.length>1?"":"s"} drishti here from elsewhere, adding ${inc.map(g=>KARAKA[g].split(",")[0].toLowerCase()).join(" and ")}.</p>`:""}
    ${(()=>{const n=CHART.dasha.at(new Date());
      const active=n.maha.lord===lord||n.antar.lord===lord||occ.some(o=>o.graha===n.maha.lord);
      return active?`<p class="interp brass">This house is live right now &#8212; ${lord} governs the period you are running.</p>`:""})()}
    <p class="note">Traditional readings for this configuration. Not a prediction.</p>`;
}

function sheetPlanet(p){
  const g=p.graha, ruled=CHART.housesRuled(g), conj=CHART.conjunct(g);
  const now=CHART.dasha.at(new Date());
  document.getElementById("sheetbody").innerHTML=`
    <div class="sheethead">
      <img class="sheetart" src="assets/graha/${g.toLowerCase()}.png" alt="" draggable="false">
      <div><div class="eyebrow" style="margin-bottom:3px">${SK[g]}${shadow(g)?" &#183; chhaya graha":""}</div>
        <h1 style="font-size:26px;margin:0">${g}</h1></div>
    </div>
    <p class="muted" style="margin:0 0 14px">${CORE[g]}</p>
    <p class="lordline">${ruled.length
      ? `Lord of the <b>${ruled.map(ordinal).join(" & ")}</b>, sitting in the <b>${ordinal(p.house)}</b>`
      : `Owns no sign, so rules no house. Sitting in the <b>${ordinal(p.house)}</b>`}</p>
    ${rows([
      ["Sign",`${SIGNS[p.sign-1]} (${p.sign})`],
      ["Degree",p.degf],
      ["Nakshatra",`${p.nak} &#183; pada ${p.pada}`],
      ["Motion",p.retro?(shadow(g)?"Retrograde (always)":"Retrograde"):"Direct"],
      ["Dignity",p.dig||"&#8212;"],
      ["Conjunct",conj.length?conj.join(", "):"&#8212;"],
      ["Aspects",CHART.aspectedBy(g).map(ordinal).join(", ")],
      ["Natural karaka",KARAKA[g]]
    ])}
    <p class="muted" style="font-size:13px">${
      now.maha.lord===g?`You are currently running the <b style="color:var(--ink)">${g} mahadasha</b>, so this graha governs the present period.`
      :now.antar.lord===g?`${g} rules your current <b style="color:var(--ink)">antardasha</b> &#8212; the sub-period inside a ${now.maha.lord} mahadasha.`
      :`${g} does not rule the period you are currently running (${now.maha.lord}/${now.antar.lord}).`}</p>
    ${p.retro&&!shadow(g)?`<p class="muted" style="font-size:12.5px;margin-top:10px">
      Retrograde motion is apparent, not real. ${g} does not reverse in space &#8212; Earth
      overtakes it on the inside of its orbit, the way a slower train seems to slide
      backwards as yours passes. Tradition reads it as a matter returned to rather than
      settled first time.</p>`:``}`;
}

/* the transparent gap shows the chart; a tap there should reach it, but the
   panel still has to own scrolling - so forward the hit by hand */
document.querySelector(".sheetgap").addEventListener("click",e=>{
  const el=document.elementFromPoint(e.clientX,e.clientY);
  const under=document.elementsFromPoint(e.clientX,e.clientY)
    .find(n=>n.classList&&(n.classList.contains("hs")||n.classList.contains("p")));
  if(under&&under.classList.contains("hs")) openHouse(+under.dataset.h);
  else if(under&&under.dataset.g) openPlanet(under.dataset.g);
  else resetChart();
});
closeBtn.onclick=resetChart;
document.addEventListener("keydown",e=>{if(e.key==="Escape")resetChart()});
sheet.addEventListener("click",e=>e.stopPropagation());

/* &#9552;&#9552;&#9552; GUIDE &#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552; */
const ASKS=[
  {q:"What does Saturn mean in my chart?",
   cmd:"focusPlanet(Saturn)",
   a:()=>{const s=CHART.get("Saturn");
     return `Your <b>Saturn is exalted in Libra</b>, in the ${ordinal(s.house)} house, and retrograde. It rules your ${CHART.housesRuled("Saturn").map(ordinal).join(" and ")} &#8212; so career and gains both answer to it. Exaltation strengthens it; the retrograde is traditionally read as work returned to rather than finished first time.`},
   act:()=>{go(CHART_INDEX);setTimeout(()=>openPlanet("Saturn"),340)}},
  {q:"What period am I in?",
   cmd:"showDasha(current)",
   a:()=>{const n=CHART.dasha.at(new Date());
     return `A <b>${n.maha.lord} mahadasha</b> with <b>${n.antar.lord} antardasha</b>. The sequence started from your Moon in ${CHART.get("Moon").nak} &#8212; that nakshatra alone fixes both the order and the starting point.`},
   act:()=>{go(TIMELINE_INDEX);setTimeout(renderTimelineTab,340)}},
  {q:"Explain my seventh house.",
   cmd:"focusHouse(7)",
   a:()=>{const sg=CHART.signOfHouse(7),l=SIGN_LORD[sg];
     return `Your 7th carries <b>${SIGNS[sg-1]}</b>, ruled by ${l}, which sits in your ${ordinal(CHART.get(l).house)}. Marriage and partnership are therefore read through where ${l} landed, not through the 7th alone.`},
   act:()=>{go(CHART_INDEX);setTimeout(()=>openHouse(7),340)}},
  {q:"Why is Jupiter strong?",
   cmd:"focusPlanet(Jupiter)",
   a:()=>`<b>Jupiter is exalted in Cancer</b>, sharing the sign with your Moon in the 3rd. It rules your 8th and 11th. Exaltation plus a conjunction with the Moon is traditionally among the most benefic combinations a chart can carry.`,
   act:()=>{go(CHART_INDEX);setTimeout(()=>openPlanet("Jupiter"),340)}}
];

/* Every claim below is derived, never written. An earlier version had these
   as prose composed against a different chart, and it told Sangram his Saturn
   was exalted in Libra and retrograde when it is in Capricorn, own sign and
   direct. CLAUDE.md 102: the AI layer must never contradict the engine. */
const describe=g=>{
  const p=CHART.get(g), ruled=CHART.housesRuled(g);
  const bits=[`Your ${g} is in <b>${SIGNS[p.sign-1]}, the ${ordinal(p.house)} house</b>, at ${p.degf}`];
  if(p.dig) bits.push(`&#8212; ${p.dig.toLowerCase()}`);
  if(p.retro && !shadow(g)) bits.push(`, and retrograde`);
  let t=bits.join(" ")+`.<br><br>`;
  t+= ruled.length
    ? `It rules your ${ruled.map(ordinal).join(" and ")} house${ruled.length>1?"s":""}, so ${ruled.map(h=>BHAVA[h-1][1].toLowerCase()).join(" and ")} answer to it.`
    : `It owns no sign, so it rules no house &#8212; a shadow graha acts through whatever it sits with.`;
  const conj=CHART.conjunct(g);
  if(conj.length) t+=` It shares ${SIGNS[p.sign-1]} with ${conj.join(" and ")}.`;
  return t;
};

const SAMPLE_CHAT=[
  {me:true, t:"Where does Saturn sit in my kundali?"},
  {me:false, cmd:"focusPlanet(Saturn)", t:()=>describe("Saturn")},
  {me:true, t:"At what age will I likely find my partner?"},
  {me:false, cmd:"focusHouse(7)", t:()=>{
    const sg=CHART.signOfHouse(7), l=SIGN_LORD[sg], lp=CHART.get(l);
    const m=CHART.dasha.mahas.find(x=>x.lord===l);
    return `I can show you what the chart traditionally associates with partnership, but I would not put a number on it &#8212; nothing here predicts events.<br><br>Your 7th carries <b>${SIGNS[sg-1]}</b>, ruled by ${l}, which sits in your ${ordinal(lp.house)}${lp.dig?`, ${lp.dig.toLowerCase()}`:""}. In Vedic practice, periods governed by ${l} are the ones read as bringing partnership themes forward${m?`; yours runs ${fmtDate(m.start)} to ${fmtDate(m.end)}`:""}.<br><br>Would you like me to open that period on your timeline?`}},
  {me:true, t:"Which of my planets is weakest?"},
  {me:false, cmd:"focusPlanet(weakest)", t:()=>{
    const deb=CHART.placements.filter(p=>p.dig==="Debilitated");
    const sun=CHART.get("Sun");
    const comb=CHART.placements.filter(p=>p.graha!=="Sun"&&!shadow(p.graha)&&sep(p.L,sun.L)<12);
    if(!deb.length&&!comb.length) return `No graha in your chart is debilitated or combust. Strength is read from dignity, house and aspects together rather than from one label.`;
    const g=(deb[0]||comb[0]).graha, p=CHART.get(g);
    const flags=[];
    if(p.dig==="Debilitated") flags.push("<b>debilitated</b>");
    if(p.retro&&!shadow(g)) flags.push("retrograde");
    if(comb.some(c=>c.graha===g)) flags.push(`<b>combust</b> &#8212; ${sep(p.L,sun.L).toFixed(1)}&#176; from your Sun`);
    return `${g}, in ${SIGNS[p.sign-1]}: ${flags.join(", ")}.<br><br>Traditionally that is read as ${KARAKA[g].split(",")[0].toLowerCase()} working indirectly rather than plainly &#8212; not as an absence of it.`}}
];

function renderGuide(){
  setTopBar("Guide");
  document.getElementById("pg-guide").innerHTML=`
    <div class="chatwrap">
      <div class="voice"><div class="orb"></div>
        <p class="muted" style="text-align:center;font-size:13px;max-width:30ch;margin:14px auto 0">
          Ask about your chart. The answer moves it.</p></div>
      <div class="chat" id="chat">
        ${SAMPLE_CHAT.map(m=>m.me
          ? `<div class="bubble me">${m.t}</div>`
          : `<div class="bubble it">${typeof m.t==="function"?m.t():m.t}
               <div class="cmd">&#9656; ${m.cmd}</div></div>`).join("")}
      </div>
      <div class="asks" id="asks">${ASKS.map((a,i)=>`<button class="ask" data-i="${i}">${a.q}</button>`).join("")}</div>
      <p class="note"><b>Placeholder.</b> This conversation is scripted and the composer below
      is not connected. The mechanism being shown is real though: each reply carries a UI
      command, so answering moves the chart rather than only describing it. A live model needs
      a small server to hold the API key &#8212; a key in this page would be readable by anyone.</p>
    </div>
    <div class="composer">
      <button class="cmp-btn" aria-label="Add"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>
      <input id="cmpin" placeholder="Ask your chart" aria-label="Message">
      <button class="cmp-btn mic" id="cmpmic" aria-label="Voice">
        <svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/>
          <path d="M5.5 11.5a6.5 6.5 0 0013 0M12 18v3"/></svg></button>
    </div>`;

  document.getElementById("asks").onclick=e=>{
    const b=e.target.closest(".ask"); if(!b)return;
    const item=ASKS[+b.dataset.i], chat=document.getElementById("chat");
    chat.insertAdjacentHTML("beforeend",`<div class="bubble me">${item.q}</div>`);
    buzz(6);
    setTimeout(()=>{
      chat.insertAdjacentHTML("beforeend",
        `<div class="bubble it">${item.a()}<div class="cmd">&#9656; ${item.cmd}</div></div>`);
      chat.lastElementChild.scrollIntoView({behavior:"smooth",block:"nearest"});
      setTimeout(item.act,900);
    },420);
  };
  const mic=document.getElementById("cmpmic");
  mic.onclick=()=>{mic.classList.toggle("live");buzz(8)};
}

const ICONS={
  chart:'<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  people:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 5.5a3.2 3.2 0 010 5.6"/>',
  book:'<path d="M4 5.5A2.5 2.5 0 016.5 3H19v15H6.5A2.5 2.5 0 004 20.5z"/><path d="M4 20.5V5.5"/>',
  star:'<path d="M12 3.5l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.9l6-.8z"/>',
  learn:'<path d="M4 6.2A2.2 2.2 0 016.2 4H11v16H6.2A2.2 2.2 0 014 17.8z"/><path d="M20 6.2A2.2 2.2 0 0017.8 4H13v16h4.8A2.2 2.2 0 0020 17.8z"/>',
  doc:'<path d="M14 3.5H7.4A2.4 2.4 0 005 5.9v12.2a2.4 2.4 0 002.4 2.4h9.2a2.4 2.4 0 002.4-2.4V8.5z"/><path d="M14 3.5V8.5h5"/><path d="M9 13h6M9 16.5h4"/>',
  az:'<path d="M4.5 15.5L8 6.5l3.5 9M5.6 12.8h4.8"/><path d="M14 6.5h5.5L14 15.5h5.5"/>',
  gear:'<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1"/>'
};

const SUBS=[
  {id:"birth", label:"Birth details", icon:ICONS.chart, sub:()=>SIGNS_SK[CHART.lagna-1]},
  {id:"events", label:"Life events", icon:ICONS.star, sub:()=>events().length+""},
  {id:"rel", label:"Relationships", icon:ICONS.people, sub:()=>{const p=partners();return p.length?p.length+"":"none yet"}},
  {id:"learn", label:"Learn astrology", icon:ICONS.learn, sub:()=>LEARN.length+" topics"},
  {id:"glossary", label:"Glossary", icon:ICONS.az, sub:()=>GLOSSARY.reduce((a,g)=>a+g[1].length,0)+" terms"},
  {id:"report", label:"Detailed report", icon:ICONS.doc, sub:()=>"PDF"},
  {id:"settings", label:"Settings", icon:ICONS.gear, sub:()=>PREFS().ayanamsa||"Lahiri"}
];


const GLOSSARY=[
 ["The frame",[
  ["Lagna","The ascendant - the exact degree of the zodiac rising on the eastern horizon at your birth minute. It fixes house 1, and so fixes everything else."],
  ["Bhava","A house. Twelve divisions of the chart, each covering an area of life. Houses stay put; signs rotate across them."],
  ["Rashi","A zodiac sign. Twelve of them, 30 degrees each, measured against the fixed stars rather than the seasons."],
  ["Graha","A 'grasper'. The nine bodies a chart reads - seven visible, plus Rahu and Ketu, which have no body at all."],
  ["Ayanamsa","The gap between the tropical and sidereal zodiacs, currently about 24 degrees. Vedic astrology subtracts it; Western astrology does not. This is the single biggest difference between the two."]]],
 ["Position",[
  ["Nakshatra","A lunar mansion. Twenty-seven of them, 13 degrees 20 minutes each - a finer grid than the signs, and the one your dasha sequence is built from."],
  ["Pada","A quarter of a nakshatra, 3 degrees 20 minutes wide. 108 padas cover the zodiac."],
  ["Lord","The graha that owns a sign. A house is read through the lord of the sign sitting in it, and through where that lord landed."],
  ["Drishti","Aspect, literally 'gaze'. Every graha looks at the 7th house from itself. Mars also looks at the 4th and 8th, Jupiter the 5th and 9th, Saturn the 3rd and 10th."],
  ["Retrograde","Apparent backward motion. Nothing reverses in space - Earth overtakes the planet on the inside track. Read as a matter returned to rather than settled first time."]]],
 ["Strength",[
  ["Exalted","A graha in the sign where it is traditionally strongest. Saturn in Libra, Jupiter in Cancer, Mars in Capricorn."],
  ["Debilitated","The opposite sign to exaltation, where it is traditionally weakest. Not a verdict - a debilitated graha can still be well placed."],
  ["Own sign","A graha sitting in a sign it rules. Comfortable, and reliably itself."],
  ["Moolatrikona","A specific degree range within a graha's own sign where it is at root strength."],
  ["Kendra","Houses 1, 4, 7 and 10 - the angles. Traditionally the strongest positions."],
  ["Trikona","Houses 1, 5 and 9 - the trines. Traditionally the most fortunate."],
  ["Dusthana","Houses 6, 8 and 12 - the difficult ones. Debt, upheaval and loss."],
  ["Shadbala","Six-fold strength. A numeric score for each graha across position, time, direction, motion, nature and aspect."],
  ["Ashtakavarga","A bindu, or point, system giving each house a score. More points, more traditional support."]]],
 ["Time",[
  ["Dasha","A planetary period. The main timing system, dividing life into stretches each governed by one graha."],
  ["Mahadasha","A major period. The nine run 120 years in total; yours began with Ketu because your Moon sits in Mula."],
  ["Antardasha","A sub-period inside a mahadasha, following the same order and proportions."],
  ["Vimshottari","The 120-year dasha system, the most widely used. Its starting point comes entirely from the Moon's nakshatra at birth."],
  ["Gochara","Transit. Where the grahas are right now, as against where they were at your birth."],
  ["Sade Sati","The roughly seven-and-a-half years Saturn spends transiting the signs before, on and after your natal Moon."]]],
 ["People",[
  ["Karaka","A natural significator. Jupiter signifies children wherever it sits; Venus signifies the spouse."],
  ["Atmakaraka","The graha at the highest degree in the chart. Read as the soul's chief indicator."],
  ["Darakaraka","The graha at the lowest degree. Traditionally read for the spouse."],
  ["Gun Milan","Ashtakoota matching. Eight tests worth 36 points between two charts, weighted toward Nadi and Bhakoot."],
  ["Gana","Temperament by nakshatra - Deva, Manushya or Rakshasa. A classification, not a judgement."],
  ["Nadi","Constitution by nakshatra - Aadi, Madhya or Antya. The heaviest koota in matching, and the most argued over."],
  ["Manglik","A chart with Mars in the 1st, 2nd, 4th, 7th, 8th or 12th. Traditionally flagged in matching; treated with far more weight in some regions than others."]]],
 ["Combinations",[
  ["Yoga","A named combination of placements. Hundreds exist; most charts carry several."],
  ["Dosha","An affliction or flaw in a chart. Traditionally something to be aware of, not a sentence."],
  ["Kalsarpa","All seven grahas caught between Rahu and Ketu."],
  ["Combust","A graha too close to the Sun to be seen, and traditionally weakened by it."],
  ["Conjunction","Two grahas sharing a sign, blending their significations."],
  ["Divisional chart","A subdivision of the chart used for one area of life - D9 for marriage, D10 for career, D7 for children."]]]
];

let glossQ="", glossOpen=false;
/* A definition that also answers "what is mine?" turns a reference into
   an explanation. Only where the chart actually has an answer. */
const PERSONAL={
 "Lagna":()=>`Yours is <b>${SIGNS_SK[CHART.lagna-1]}</b> (${SIGNS[CHART.lagna-1]}), at ${fmtDeg(CHART.ascendant)}.`,
 "Nakshatra":()=>`Your Moon is in <b>${CHART.get("Moon").nak}</b>, pada ${CHART.get("Moon").pada}.`,
 "Pada":()=>`Your Moon sits in pada <b>${CHART.get("Moon").pada}</b> of ${CHART.get("Moon").nak}.`,
 "Retrograde":()=>{const r=CHART.placements.filter(p=>p.retro&&!shadow(p.graha)).map(p=>p.graha);
   return r.length?`In your chart <b>${r.join(" and ")}</b> ${r.length>1?"are":"is"} retrograde.`:""},
 "Exalted":()=>{const e=CHART.placements.filter(p=>p.dig==="Exalted").map(p=>p.graha);
   return e.length?`Yours: <b>${e.join(", ")}</b>.`:""},
 "Debilitated":()=>{const d=CHART.placements.filter(p=>p.dig==="Debilitated").map(p=>p.graha);
   return d.length?`Yours: <b>${d.join(", ")}</b>.`:"No graha is debilitated in your chart."},
 "Own sign":()=>{const o=CHART.placements.filter(p=>p.dig==="Own sign").map(p=>p.graha);
   return o.length?`Yours: <b>${o.join(", ")}</b>.`:""},
 "Mahadasha":()=>{const n=CHART.dasha.at(new Date());
   return `You are in <b>${n.maha.lord}</b> mahadasha until ${fmtDate(n.maha.end)}.`},
 "Antardasha":()=>{const n=CHART.dasha.at(new Date());
   return `Currently <b>${n.antar.lord}</b>, to ${fmtDate(n.antar.end)}.`},
 "Dasha":()=>{const n=CHART.dasha.at(new Date());
   return `Yours began with Ketu, because your Moon is in Mula. Right now: <b>${n.maha.lord}/${n.antar.lord}</b>.`},
 "Vimshottari":()=>`Yours started from <b>${CHART.get("Moon").nak}</b>, so Ketu ran first.`,
 "Gana":()=>`Yours is <b>${AVAKHADA.Gan}</b>.`,
 "Nadi":()=>`Yours is <b>${AVAKHADA.Nadi}</b>.`,
 "Manglik":()=>manglik(CHART)?"You are <b>Manglik</b>.":"You are <b>not</b> Manglik.",
 "Ayanamsa":()=>`Your chart uses <b>${PREFS().ayanamsa||"Lahiri"}</b>.`,
 "Kendra":()=>{const k=CHART.placements.filter(p=>[1,4,7,10].includes(p.house)).map(p=>p.graha);
   return k.length?`In yours, <b>${k.join(", ")}</b> sit in kendras.`:"No graha sits in a kendra in your chart."},
 "Trikona":()=>{const t=CHART.placements.filter(p=>[1,5,9].includes(p.house)).map(p=>p.graha);
   return t.length?`In yours, <b>${t.join(", ")}</b> sit in trikonas.`:""},
 "Drishti":()=>`Your Saturn, for instance, aspects the ${CHART.aspectedBy("Saturn").map(ordinal).join(", ")}.`,
 "Darakaraka":()=>{const p=[...CHART.placements].filter(x=>!shadow(x.graha))
   .sort((a,b)=>degIn(a.L)-degIn(b.L))[0];
   return `Yours is <b>${p.graha}</b>, at ${p.degf} in ${SIGNS[p.sign-1]}.`},
 "Atmakaraka":()=>{const p=[...CHART.placements].filter(x=>!shadow(x.graha))
   .sort((a,b)=>degIn(b.L)-degIn(a.L))[0];
   return `Yours is <b>${p.graha}</b>, at ${p.degf} in ${SIGNS[p.sign-1]}.`},
 "Combust":()=>{const sun=CHART.get("Sun");
   const c=CHART.placements.filter(x=>x.graha!=="Sun"&&!shadow(x.graha)&&sep(x.L,sun.L)<12).map(x=>x.graha);
   return c.length?`In yours, <b>${c.join(", ")}</b> ${c.length>1?"are":"is"} close enough to the Sun to be read as combust.`:""},
 "Dusthana":()=>{const d=CHART.placements.filter(p=>[6,8,12].includes(p.house)).map(p=>p.graha);
   return d.length?`In yours, <b>${d.join(", ")}</b> sit in dusthanas.`:"No graha sits in a dusthana in your chart."},
 "Conjunction":()=>{const pairs=[];
   CHART.placements.forEach(p=>{const c=CHART.conjunct(p.graha);
     c.forEach(q=>{const k=[p.graha,q].sort().join("+"); if(!pairs.includes(k))pairs.push(k)})});
   return pairs.length?`Yours: <b>${pairs.map(x=>x.replace("+"," and ")).join("; ")}</b>.`:""},
 "Lord":()=>`Your lagna lord is <b>${SIGN_LORD[CHART.lagna]}</b>, sitting in the ${ordinal(CHART.get(SIGN_LORD[CHART.lagna]).house)}.`
};
const GLOSS_FLAT=()=>GLOSSARY.flatMap(([grp,items])=>items.map(([t,d])=>({t,d,grp})))
  .sort((x,y)=>x.t.localeCompare(y.t));

function subGlossary(){
  const all=GLOSS_FLAT();
  const q=glossQ.trim().toLowerCase();
  const hits=q?all.filter(x=>x.t.toLowerCase().includes(q)||x.d.toLowerCase().includes(q)):all;
  const letters=[...new Set(all.map(x=>x.t[0].toUpperCase()))].sort();
  const groups={};
  hits.forEach(x=>{const L=x.t[0].toUpperCase();(groups[L]=groups[L]||[]).push(x)});
  const mine=t=>{const f=PERSONAL[t]; if(!f) return "";
    let v=""; try{v=f()}catch(_){}; return v?`<p class="gmine">${v}</p>`:""};

  return `
    <div class="gsearch" id="gsearch">
      <span class="gsico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="11" cy="11" r="6.5"/><path d="M16.5 16.5l4 4"/></svg></span>
      <input id="gq" type="search" value="${glossQ}" placeholder="Search ${all.length} terms"
             aria-label="Search the glossary">
      <button class="gcancel" id="gcancel">Cancel</button>
    </div>
    ${Object.keys(groups).length?Object.keys(groups).sort().map(L=>`
      <section class="gsec">
        <h3 class="gletter" id="L-${L}">${L}</h3>
        ${groups[L].map(x=>`
          <article class="gterm">
            <h4>${x.t}</h4>
            <p class="gdef">${x.d}</p>
            ${mine(x.t)}
          </article>`).join("")}
      </section>`).join("")
      :`<p class="gempty">No results for &#8220;${glossQ}&#8221;</p>`}
    <div class="azbubble" id="azbubble" aria-hidden="true"></div>
    <nav class="azrail" id="azrail" aria-label="Jump to letter">
      ${letters.map(L=>`<button data-l="${L}" class="${groups[L]?"":"off"}">${L}</button>`).join("")}
    </nav>`;
}

function wireGlossary(){
  const page=document.getElementById("pg-you");
  const q=document.getElementById("gq"), gs=document.getElementById("gsearch");
  if(q) q.oninput=()=>{
    glossQ=q.value; const at=q.selectionStart;
    renderSub();
    const n=document.getElementById("gq");
    if(n){n.focus();n.setSelectionRange(at,at)}
  };
  const cancel=document.getElementById("gcancel");
  if(cancel) cancel.onclick=()=>{glossQ=""; renderSub(); page.scrollTop=0;};
  document.body.classList.toggle("gtyping", !!glossQ);
  page.onscroll=()=>{ if(gs) document.body.classList.toggle("gstuck", page.scrollTop>4) };
  page.onscroll();

  /* index rail: drag it like Contacts, showing the letter as you move */
  const rail=document.getElementById("azrail"), bubble=document.getElementById("azbubble");
  if(!rail) return;
  const jump=L=>{
    const el=document.getElementById("L-"+L); if(!el) return;
    page.scrollTop = page.scrollTop + el.getBoundingClientRect().top - 62;
    if(bubble){bubble.textContent=L;bubble.classList.add("on")}
    buzz(4);
  };
  const letterAt=cy=>{
    let best=null,bd=1e9;
    rail.querySelectorAll("button").forEach(b=>{
      const r=b.getBoundingClientRect(), d=Math.abs(cy-(r.top+r.height/2));
      if(d<bd){bd=d;best=b}
    });
    return best && !best.classList.contains("off") ? best.dataset.l : null;
  };
  let dragging=false,last=null;
  const move=cy=>{const L=letterAt(cy); if(L&&L!==last){last=L;jump(L)}};
  rail.addEventListener("pointerdown",e=>{
    dragging=true;last=null;
    try{rail.setPointerCapture(e.pointerId)}catch(_){}
    move(e.clientY); e.preventDefault();
  });
  rail.addEventListener("pointermove",e=>{if(dragging)move(e.clientY)});
  const end=()=>{dragging=false;last=null;
    if(bubble) setTimeout(()=>bubble.classList.remove("on"),240)};
  rail.addEventListener("pointerup",end);
  rail.addEventListener("pointercancel",end);
}

const SAVED=()=>[
 {t:"Saturn exalted in Libra",w:"Universe &#183; graha",
  b:`Exalted and retrograde in your ${ordinal(CHART.get("Saturn").house)}, ruling your ${CHART.housesRuled("Saturn").map(ordinal).join(" and ")}. Career and gains both answer to it.`},
 {t:"Mercury debilitated, and combust",w:"Universe &#183; graha",
  b:`Mercury sits in Pisces, its sign of debilitation, less than a degree from your Sun - close enough to be read as combust. Retrograde as well.`},
 {t:"Moon mahadasha to 2028",w:"Timeline",
  b:`Ten years governed by the lord of your 3rd, sitting in your 8th alongside Rahu. The antardasha inside it changes roughly every year.`},
 {t:"Jupiter and the Moon in the 4th",w:"Universe &#183; house",
  b:`Your 4th carries Leo. Jupiter sits there - the house of mother, home and rest.`}
];
function subSaved(){
  return backBar("Saved insights")+`
    <p class="muted" style="font-size:13px;margin:-6px 0 16px">Things you kept.</p>
    ${SAVED().map(x=>`<div class="card" style="margin-bottom:11px">
      <div class="eyebrow" style="margin-bottom:6px">${x.w}</div>
      <b style="font-size:15px;font-weight:620;letter-spacing:-.01em">${x.t}</b>
      <p class="muted" style="font-size:13px;margin:6px 0 0">${x.b}</p></div>`).join("")}
    <p class="note">Sample entries, to show the shape. Saving from a graha, house or period
    is not wired up yet.</p>`;
}

let subView=null, subArg=null, cameFrom=null;

function renderYou(){
  if(subView) return renderSub();
  document.body.classList.remove("insub");
  document.body.classList.remove("glossary");
  setTopBar("You");
  document.getElementById("pg-you").innerHTML=`
    <div class="me-head">
      <div class="avatar">S</div>
      <div class="me-id"><h1>Sangram</h1>
        <p>${SIGNS_SK[CHART.lagna-1]} lagna &#183; Moon in ${CHART.get("Moon").nak}</p></div>
      <button class="switchbtn" id="switchuser">Switch</button>
    </div>
    <div class="section">
      <div class="list">
        ${SUBS.map(v=>`<button class="item" data-v="${v.id}">
          <svg class="ico" viewBox="0 0 24 24">${v.icon}</svg>${v.label}
          <span class="sub">${v.sub()}</span><span class="chev">&#8250;</span></button>`).join("")}
      </div>
    </div>`;
  const sw=document.getElementById("switchuser");
  if(sw) sw.onclick=()=>{buzz(7); subView="people"; subArg=null; renderSub();};
  document.querySelectorAll("#pg-you .item").forEach(b=>b.onclick=()=>{
    subView=b.dataset.v; subArg=null; buzz(7); renderSub();
  });
}

const backBar=title=>`<div class="subhead">
  <button class="backarrow" id="back" aria-label="Back">&#8249;</button>
  <h1>${title}</h1></div>`;

function renderSub(){
  document.body.classList.add("insub");
  const pg=document.getElementById("pg-you");
  const ACTIONS={
    rel:`<button class="tb-btn" id="tbadd" aria-label="Add a person">
      <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>`,
    events:`<button class="tb-btn" id="tbaddev" aria-label="Add an event">
      <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>`,
    partner:`<button class="tb-btn txt" id="tbedit">Edit</button>`,

  };
  const TITLES={birth:"Birth details",rel:"Relationships",events:"Life events",
    glossary:"Glossary",settings:"Settings",report:"Detailed report",people:"Charts",
    learn:"Learn astrology",learntopic:(LEARN.find(x=>x.id===learnTopic)||{}).title||"Learn",
    personchart:(partners()[subArg]||{}).name||"Chart",addpartner:subArg!=null?"Edit person":"Add a person",
    addevent:subArg!=null?"Edit event":"Add a life event",
    partner:(partners()[subArg]||{}).name||"Person"};
  setTopBar(TITLES[subView]||"",{back:true,actions:ACTIONS[subView]||""});
  const body={birth:subBirth,rel:subRel,partner:subPartner,events:subEvents,addpartner:subAddPartner,addevent:subAddEvent,
              glossary:subGlossary,report:subReport,people:subPeople,learn:subLearn,learntopic:subLearnTopic,personchart:subPersonChart,
              settings:subSettings}[subView];
  pg.innerHTML=body();
  pg.scrollTop=0;
  const ta=document.getElementById("tbadd"), te=document.getElementById("tbaddev"),
        ted=document.getElementById("tbedit");
  if(ta) ta.onclick=()=>{subArg=null;subView="addpartner";buzz(7);renderSub()};
  if(te) te.onclick=()=>{subArg=null;subView="addevent";buzz(7);renderSub()};
  if(ted) ted.onclick=()=>{subView="addpartner";buzz(7);renderSub()};
  if(subView==="rel") wireRel();
  if(subView==="events") wireEvents();
  document.body.classList.toggle("glossary",subView==="glossary");
  if(subView!=="glossary") document.body.classList.remove("gstuck","gtyping");
  if(subView==="glossary") wireGlossary();
  if(subView==="learn") wireLearn();
  if(subView==="people") wirePeople();
  if(subView==="personchart") wirePersonChart();
  if(subView==="settings") wireSettings();
  if(subView==="report") wireReport();
  if(subView==="addpartner") wireAddPartner();
  if(subView==="addevent") wireAddEvent();
  if(subView==="partner") wirePartner();
}

function subStub(name){
  return backBar(name)+`<div class="card"><p class="muted" style="font-size:13.5px">
    Not built yet. Listed so the architecture is visible, not to suggest it works.</p></div>`;
}

const PREFS=()=>{try{return JSON.parse(localStorage.getItem("astro.prefs")||"{}")}catch(_){return{}}};
const setPref=(k,v)=>{const p=PREFS();p[k]=v;localStorage.setItem("astro.prefs",JSON.stringify(p));};



/* ---- LEARN ------------------------------------------------------
   The app should leave someone more knowledgeable than it found them
   (CLAUDE.md 39, 146). Beginner first, then depth. */
const nakLord2=i=>ORDER[i%9];
const LEARN=[
 {id:"houses", title:"The twelve houses", blurb:"What each division of the chart covers",
  body:`<p>A chart is a map of the sky at one moment, cut into twelve slices called <b>bhavas</b>, or houses. Each covers an area of life.</p>
<p>The crucial thing, and the thing most people get wrong at first: <b>houses do not move</b>. House 1 is always the same position on the chart. What changes from person to person is which <b>sign</b> sits in each house, and that is decided entirely by the moment and place of birth.</p>
<p>The twelve, in order:</p>
<ol class="lrn">
${BHAVA.map((b,i)=>`<li><b>${ordinal(i+1)} &#183; ${b[0]} Bhava</b> &#8212; ${b[1]}. ${b[2]}</li>`).join("")}
</ol>
<p>Houses are also grouped. The <b>kendras</b> (1, 4, 7, 10) are the angles and are read as the strongest positions. The <b>trikonas</b> (1, 5, 9) are the most fortunate. The <b>dusthanas</b> (6, 8, 12) are the difficult ones &#8212; debt, upheaval, loss &#8212; though difficulty is not the same as disaster.</p>`},

 {id:"grahas", title:"The nine grahas", blurb:"Not planets, exactly",
  body:`<p><b>Graha</b> means "grasper" &#8212; something that takes hold. It is not the same word as planet, and the difference matters.</p>
<p>Two of the nine are not planets at all: the <b>Sun</b> and <b>Moon</b> are luminaries. Two more have no physical body whatsoever: <b>Rahu</b> and <b>Ketu</b> are the two points where the Moon's path crosses the Sun's, which is why eclipses happen there. They are called <b>chhaya grahas</b> &#8212; shadow grahas.</p>
<p>Each graha carries natural significations, called <b>karakatva</b>, which it brings wherever it sits:</p>
<ul class="lrn">
${Object.keys(KARAKA).map(g=>`<li>${gIcon(g,18)}<b>${g}</b> &#8212; ${KARAKA[g]}</li>`).join("")}
</ul>
<p>Vedic astrology uses these nine and no others. Uranus, Neptune and Pluto belong to Western practice; you will occasionally see them in a KP chart, but they play no part in classical readings.</p>`},

 {id:"signs", title:"The twelve signs", blurb:"And why they differ from your Western sign",
  body:`<p>The zodiac is a 360&#176; band divided into twelve <b>rashis</b> of 30&#176; each. So far, identical to Western astrology.</p>
<p>The difference is where you start measuring. Western astrology uses the <b>tropical</b> zodiac, anchored to the seasons &#8212; 0&#176; Aries is the spring equinox. Vedic astrology uses the <b>sidereal</b> zodiac, anchored to the fixed stars.</p>
<p>Because the Earth wobbles slowly on its axis, those two starting points have drifted apart by roughly <b>24&#176;</b> over the last two thousand years. That gap is the <b>ayanamsa</b>.</p>
<p>Practically: your Vedic sign is usually the one before your Western sign. Someone who has always been told they are a Leo is very often a Vedic Cancer. Neither is wrong; they are measuring from different origins.</p>
<p>Each sign has an owner, called its <b>lord</b>, and that lordship is the backbone of chart reading:</p>
<ul class="lrn">
${SIGNS.map((sg,i)=>`<li><b>${sg}</b> (${SIGNS_SK[i]}) &#8212; ruled by ${SIGN_LORD[i+1]}</li>`).join("")}
</ul>`},

 {id:"nakshatras", title:"The 27 nakshatras", blurb:"A finer grid than the signs",
  body:`<p>Long before the twelve signs, Indian astronomy divided the sky into <b>27 nakshatras</b> &#8212; lunar mansions, each 13&#176;20' wide. They track the Moon: it passes through roughly one per day, and 27 of them make a lunar month.</p>
<p>Nakshatras are finer than signs and often more telling. Two people can share a Moon sign and have completely different nakshatras.</p>
<p>Each divides again into four <b>padas</b> of 3&#176;20', giving 108 padas across the zodiac &#8212; the same 108 that recurs throughout Indian tradition.</p>
<p>Most importantly, <b>the nakshatra your Moon occupies at birth decides your entire dasha sequence</b>. Every nakshatra has a ruling graha, and that ruler names the first period of your life. Nothing else in the chart does this.</p>
<ul class="lrn">
${NAK.map((n,i)=>`<li><b>${n}</b> &#8212; ruled by ${nakLord2(i)}</li>`).join("")}
</ul>`},

 {id:"dashas", title:"Dashas and timing", blurb:"How astrology answers 'when'",
  body:`<p>A chart shows what is there. A <b>dasha</b> system says when it becomes active.</p>
<p>The main one is <b>Vimshottari</b>, a 120-year cycle divided among the nine grahas. Ketu gets 7 years, Venus 20, the Sun 6, the Moon 10, Mars 7, Rahu 18, Jupiter 16, Saturn 19, Mercury 17. They always run in that order.</p>
<p>Where you enter the cycle is not arbitrary. It comes from the Moon's nakshatra at birth: that nakshatra's ruler runs first, and how far the Moon had already travelled through it decides how much of that first period had elapsed before you were born.</p>
<p>Each <b>mahadasha</b> subdivides into nine <b>antardashas</b> in the same order and proportion, and those subdivide again. So the texture of a period changes every year or two even when the governing graha does not.</p>
<p>Reading a period means asking what its lord rules in your chart and where it sits. The same Saturn dasha is a very different decade for two different people.</p>`},

 {id:"divisional", title:"Divisional charts", blurb:"D1, D9, D10 and the rest",
  body:`<p>The chart everyone knows &#8212; the one with your grahas in twelve houses &#8212; is the <b>D1</b>, or <b>Rashi</b> chart. It describes life broadly.</p>
<p>For any specific area, Vedic astrology divides each sign further and builds a new chart from the result. These are <b>vargas</b>, or divisional charts. The maths is pure arithmetic on the same longitudes; no new information is needed.</p>
<ul class="lrn">
<li><b>D1 &#183; Rashi</b> &#8212; the life as a whole</li>
<li><b>D2 &#183; Hora</b> &#8212; wealth</li>
<li><b>D3 &#183; Drekkana</b> &#8212; siblings, courage</li>
<li><b>D4 &#183; Chaturthamsa</b> &#8212; property and home</li>
<li><b>D7 &#183; Saptamsa</b> &#8212; children</li>
<li><b>D9 &#183; Navamsa</b> &#8212; marriage, and the chart's underlying strength</li>
<li><b>D10 &#183; Dasamsa</b> &#8212; career</li>
<li><b>D12 &#183; Dwadasamsa</b> &#8212; parents</li>
<li><b>D16, D20, D24, D27, D30, D40, D45, D60</b> &#8212; vehicles, spirituality, education, strengths, misfortune, and finer readings still</li>
</ul>
<p>The <b>D9</b> deserves special mention. It is read alongside the D1 almost always, not only for marriage: a graha that looks weak in the D1 but strong in the D9 is traditionally read as coming good over time.</p>
<p class="lrn-note">Not yet built in this app. It is the largest single thing we are missing.</p>`},

 {id:"drishti", title:"Aspects", blurb:"How grahas reach across a chart",
  body:`<p><b>Drishti</b> means gaze. A graha influences not only the house it sits in but the houses it looks at.</p>
<p>Every graha aspects the <b>7th house from itself</b> &#8212; directly opposite. Three have additional special aspects:</p>
<ul class="lrn">
<li>${gIcon("Mars",18)}<b>Mars</b> also aspects the 4th and 8th</li>
<li>${gIcon("Jupiter",18)}<b>Jupiter</b> also aspects the 5th and 9th</li>
<li>${gIcon("Saturn",18)}<b>Saturn</b> also aspects the 3rd and 10th</li>
</ul>
<p>Note this is not symmetrical. Saturn may aspect a graha that does not aspect it back &#8212; an asymmetry Western astrology does not have, since its aspects are angular and mutual.</p>
<p>Whether Rahu and Ketu aspect at all is disputed. Some schools give them the 5th, 7th and 9th; others none. This app leaves it off by default and lets you turn it on in Settings.</p>`},

 {id:"strength", title:"Strength and dignity", blurb:"Why the same graha is not equal everywhere",
  body:`<p>A graha's power depends heavily on which sign it occupies.</p>
<ul class="lrn">
<li><b>Exalted</b> (uccha) &#8212; its strongest sign. Saturn in Libra, Jupiter in Cancer, Mars in Capricorn.</li>
<li><b>Own sign</b> &#8212; a sign it rules. Comfortable and reliably itself.</li>
<li><b>Moolatrikona</b> &#8212; a specific degree range within its own sign where it is at root strength.</li>
<li><b>Debilitated</b> (neecha) &#8212; the sign opposite its exaltation. Weakest, though not doomed: a debilitated graha in a strong house can still deliver.</li>
</ul>
<p>Beyond dignity there are numeric systems. <b>Shadbala</b> scores each graha across six components &#8212; position, time, direction, motion, nature and aspect. <b>Ashtakavarga</b> gives each house a score in points called bindus.</p>
<p>A graha can also be <b>combust</b> &#8212; so close to the Sun that it cannot be seen, and traditionally weakened by the proximity.</p>
<p class="lrn-note">Shadbala and Ashtakavarga are not yet built here.</p>`},

 {id:"reading", title:"How a chart is actually read", blurb:"Putting the pieces together",
  body:`<p>Beginners tend to look up single placements &#8212; "Saturn in the 7th" &#8212; and read a verdict. That is not how it works. A chart is read in layers, and later layers routinely overturn earlier ones.</p>
<ol class="lrn">
<li><b>Find the lagna.</b> Everything is measured from the rising sign. Change the birth time by two hours and the whole chart re-numbers.</li>
<li><b>Follow the lords.</b> A house is read through the graha that rules it and, crucially, through <i>where that graha sits</i>. Your 10th house of career is read through its lord's position, not just through the 10th.</li>
<li><b>Weigh the grahas.</b> Dignity, then house, then aspects received.</li>
<li><b>Check the D9.</b> Strength there modifies everything in the D1.</li>
<li><b>Then time it.</b> A placement is potential; the dasha says when it activates.</li>
</ol>
<p>This is why two people with the same Sun sign share almost nothing astrologically, and why a one-line horoscope for a twelfth of humanity is a different activity from reading a chart.</p>`}
];

function subLearn(){
  return `
    <p class="muted" style="font-size:13.5px;margin:0 0 18px">
      From first principles to the parts practitioners argue about. Read in any order.</p>
    <div class="list">
      ${LEARN.map(l=>`<button class="item lrnitem" data-l="${l.id}">
        <span style="flex:1"><b style="font-weight:600">${l.title}</b>
          <span class="gdef">${l.blurb}</span></span>
        <span class="chev">&#8250;</span></button>`).join("")}
    </div>`;
}
function subLearnTopic(){
  const l=LEARN.find(x=>x.id===learnTopic); if(!l) return subLearn();
  return `<article class="lrnbody">${l.body}</article>`;
}
let learnTopic=null;
function wireLearn(){
  document.querySelectorAll(".lrnitem").forEach(b=>b.onclick=()=>{
    learnTopic=b.dataset.l; subView="learntopic"; buzz(7); renderSub();
  });
}

function subPeople(){
  const list=partners();
  return `
    <p class="muted" style="font-size:13px;margin:0 0 16px">
      Everyone you have added. Charts you add here appear in Relationships too.</p>
    <div class="list">
      <button class="item" data-p="me">
        <span class="pav" style="background:var(--venus)">S</span>
        <span style="flex:1"><b style="font-weight:600">Sangram</b>
          <span style="display:block;font-size:11.5px;color:var(--ink-3)">26 Mar 1992 &#183; ${SIGNS_SK[CHART.lagna-1]} lagna</span></span>
        <svg viewBox="0 0 24 24" class="tick"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button>
      ${list.map((p,i)=>`<button class="item" data-p="${i}">
        <span class="pav" style="background:${COLOUR(["Venus","Jupiter","Moon","Mars"][i%4])}">${p.name[0].toUpperCase()}</span>
        <span style="flex:1"><b style="font-weight:600">${p.name}</b>
          <span style="display:block;font-size:11.5px;color:var(--ink-3)">
            ${new Date(p.born).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}
            &#183; ${NAK[nakOf(p.moonL)]}</span></span>
        <span class="chev">&#8250;</span></button>`).join("")}
      <button class="item additem" id="addperson">
        <span class="pav addpav">+</span>
        <span style="flex:1"><b style="font-weight:600">Add a person</b></span></button>
    </div>
    <p class="note">Only your own chart is computed in full. The others carry a birth moment,
    which is enough for compatibility &#8212; their houses and dignities need the licensed
    ephemeris.</p>`;
}
function wirePeople(){
  document.querySelectorAll("#pg-you .item[data-p]").forEach(b=>b.onclick=()=>{
    if(b.dataset.p==="me"){buzz(6);return}
    subArg=+b.dataset.p; cameFrom="people"; subView="personchart"; buzz(7); renderSub();
  });
  const add=document.getElementById("addperson");
  if(add) add.onclick=()=>{subArg=null;cameFrom="people";subView="addpartner";buzz(7);renderSub()};
}


function subPersonChart(){
  const p=partners()[subArg]; if(!p){subView="people";return subPeople()}
  const d=new Date(p.born);
  const nk=NAK[nakOf(p.moonL)], lord=SIGN_LORD[signOf(p.moonL)];
  const v=vimshottari(d,p.moonL), now=v.at(new Date());
  return `
    <div class="me-head" style="margin-bottom:14px">
      <div class="avatar" style="background:${COLOUR("Venus")}">${p.name[0].toUpperCase()}</div>
      <div class="me-id"><h1>${p.name}</h1>
        <p>${d.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}
           ${p.place?" &#183; "+p.place:""}</p></div>
    </div>
    <div class="eyebrow" style="margin:18px 0 8px">What can be computed</div>
    ${rows([
      ["Moon",`${gIcon("Moon",16)}${SIGNS[signOf(p.moonL)-1]} ${fmtDeg(p.moonL)}`],
      ["Nakshatra",`${nk} &#183; pada ${padaOf(p.moonL)}`],
      ["Nakshatra lord",`${gIcon(nakLord2(nakOf(p.moonL)),16)}${nakLord2(nakOf(p.moonL))}`],
      ["Moon sign lord",`${gIcon(lord,16)}${lord}`],
      ["Dasha now",now?`${now.maha.lord}/${now.antar.lord}`:"&#8212;"],
      ["Dasha began with",v.birthLord]
    ])}
    <div class="setgroup" style="margin-top:20px">
      <button class="setrow tap" id="gotocompat">
        <div class="setlabel"><b>Compatibility with your chart</b>
          <span>Full 36-point Gun Milan</span></div>
        <span class="setval"><i class="chev">&#8250;</i></span>
      </button>
      <button class="setrow tap" id="editperson">
        <div class="setlabel"><b>Edit birth details</b></div>
        <span class="setval"><i class="chev">&#8250;</i></span>
      </button>
    </div>
    <p class="note">A full chart needs houses and an ascendant, which need the birth place and
    a licensed ephemeris. Everything above comes from the Moon alone, which is enough for
    nakshatra, dasha and matching &#8212; and is computed, not estimated.</p>`;
}
function wirePersonChart(){
  const c=document.getElementById("gotocompat");
  if(c) c.onclick=()=>{cameFrom="people";subView="partner";buzz(7);renderSub()};
  const e=document.getElementById("editperson");
  if(e) e.onclick=()=>{cameFrom="people";subView="addpartner";buzz(7);renderSub()};
}

function subReport(){
  const now=CHART.dasha.at(new Date());
  return `
    <div class="card" style="margin-bottom:16px">
      <div class="eyebrow" style="margin-bottom:7px">What you get</div>
      <p class="muted" style="font-size:14px;margin:0 0 12px">A full written chart -
      every graha with sign, degree, nakshatra and dignity; all twelve houses and their
      lords; the complete Vimshottari sequence; drishti; and the yogas your chart carries.</p>
      ${rows([["Pages","~40"],["Chart","Vrishabha lagna"],
              ["Current period",`${now.maha.lord}/${now.antar.lord}`],
              ["Format","PDF"]])}
    </div>
    <button class="primary" id="buyreport">Get the report &#183; &#8377;499</button>
    <p class="note">Not built yet. When it is, it will be generated from the same engine
    the app runs on, so the report and the screens can never disagree. Nothing here is
    sold on fear, and no remedy is gated behind payment.</p>`;
}
function wireReport(){
  const b=document.getElementById("buyreport");
  if(b) b.onclick=()=>alert("Not wired up yet - this is a placeholder.");
}

let setOpen=null;
const AYANAMSAS=["Lahiri","Raman","Krishnamurti (KP)","Yukteshwar"];
const STYLES=["North Indian","South Indian"];
function subSettings(){
  const pr=PREFS();
  const picker=(key,label,opts,val,note)=>`
    <button class="setrow tap" data-open="${key}">
      <div class="setlabel"><b>${label}</b>${note?`<span>${note}</span>`:""}</div>
      <span class="setval">${val}<i class="chev">&#8250;</i></span>
    </button>
    ${setOpen===key?`<div class="setopts">${opts.map(o=>`
      <button class="setopt${o===val?" on":""}" data-set="${key}" data-val="${o}">
        <span>${o}</span>${o===val?`<svg viewBox="0 0 24 24" class="tick"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`:""}
      </button>`).join("")}</div>`:""}`;
  const tog=(id,label,on,note)=>`
    <div class="setrow">
      <div class="setlabel"><b>${label}</b>${note?`<span>${note}</span>`:""}</div>
      <button class="switch${on?" on":""}" id="${id}" role="switch" aria-checked="${on}"><i></i></button>
    </div>`;
  return `
    <div class="setgroup">
      ${picker("ayan","Ayanamsa",AYANAMSAS,pr.ayanamsa||"Lahiri","Sidereal offset")}
      ${picker("style","Chart style",STYLES,pr.style||"North Indian")}
    </div>
    <div class="setgroup">
      ${tog("s_nodal","Nodal drishti",!!pr.nodal,"Rahu and Ketu aspect the 5th and 9th")}
      ${tog("s_haptics","Haptics",pr.haptics!==false)}
    </div>
    <p class="note">Ayanamsa and chart style are saved but not yet applied.</p>`;
}

function wireSettings(){
  document.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>{
    setOpen=setOpen===b.dataset.open?null:b.dataset.open; buzz(5); renderSub();
  });
  document.querySelectorAll("[data-set]").forEach(b=>b.onclick=()=>{
    setPref(b.dataset.set==="ayan"?"ayanamsa":"style", b.dataset.val);
    setOpen=null; buzz(8); renderSub();
  });
  const n=document.getElementById("s_nodal");
  n.onclick=()=>{const v=!n.classList.contains("on");n.classList.toggle("on",v);
    n.setAttribute("aria-checked",v);setPref("nodal",v);
    CHART.drishtiNodal=v; buzz(8);};
  const h=document.getElementById("s_haptics");
  h.onclick=()=>{const v=!h.classList.contains("on");h.classList.toggle("on",v);
    h.setAttribute("aria-checked",v);setPref("haptics",v);if(v)buzz(10)};
}

function subBirth(){
  return `
    ${rows([["Date","26 Mar 1992"],["Time","10:00 IST"],
      ["Place","Kopargaon, Maharashtra"],["Coordinates","19.88N  74.48E"],
      ["Lagna",`Vrishabha &#183; ${fmtDeg(CHART.ascendant)}`],
      ["Lagna nakshatra","Rohini"],["Ayanamsa","Lahiri"]])}
    <div class="eyebrow" style="margin:22px 0 8px">Panchang at birth</div>
    ${rows(Object.entries(PANCHANG))}
    <div class="eyebrow" style="margin:22px 0 8px">Avakhada</div>
    ${rows(Object.entries(AVAKHADA))}
    <div class="eyebrow" style="margin:22px 0 8px">Grahas</div>
    ${rows(CHART.placements.map(p=>[
      `${gIcon(p.graha)}${p.graha}`,
      `${SIGNS[p.sign-1]} ${p.degf}${p.retro?" R":""}`]))}
    <p class="note">Panchang and Avakhada are carried from your Astrotalk report rather
    than computed. Everything else on this screen is derived from the longitudes.</p>`;
}


/* Draw a real lunar phase, not an icon.
   The lit region is bounded by two arcs: the outer limb (a semicircle on
   the lit side) and the terminator (a half-ellipse whose x-radius goes to
   zero at the quarters and back to r at new and full). */
function moonPath(r,k,waxing){
  const rx=(r*Math.abs(1-2*k)).toFixed(3);
  /* SVG sweep in a y-down space: from the top point, sweep 1 traces the
     RIGHT limb, sweep 0 the LEFT. The terminator runs bottom-to-top, so its
     flags read the other way round. A crescent needs the terminator hugging
     the SAME side as the lit limb (the two arcs nearly coincide); a gibbous
     needs it bulging across to the far side. */
  const limb=waxing?1:0;
  const term=waxing?(k<0.5?0:1):(k<0.5?1:0);
  return `M 0,${-r} A ${r},${r} 0 0 ${limb} 0,${r} A ${rx},${r} 0 0 ${term} 0,${-r} Z`;
}
const PHASE_COUNT=30;
const phaseFile=date=>{
  const f=moonPhase(date).f;
  const i=((Math.round(f*PHASE_COUNT)%PHASE_COUNT)+PHASE_COUNT)%PHASE_COUNT;
  const names=["new_moon","waxing_crescent","waxing_crescent","waxing_crescent",
    "waxing_crescent","waxing_crescent","waxing_crescent","first_quarter","first_quarter",
    "waxing_gibbous","waxing_gibbous","waxing_gibbous","waxing_gibbous","waxing_gibbous",
    "waxing_gibbous","full_moon","waning_gibbous","waning_gibbous","waning_gibbous",
    "waning_gibbous","waning_gibbous","waning_gibbous","last_quarter","last_quarter",
    "waning_crescent","waning_crescent","waning_crescent","waning_crescent",
    "waning_crescent","waning_crescent"];
  return `assets/moon/phase_${String(i).padStart(2,"0")}_${names[i]}.png`;
};
const moonImg=(date,size)=>`<img class="mn" src="${phaseFile(date)}" width="${size}" height="${size}" alt="" draggable="false">`;

let mcid=0;
function moonArt(date,size){
  const ph=moonPhase(date), r=size/2-0.5, id="mc"+(++mcid);
  return `<svg class="mn" viewBox="${-size/2} ${-size/2} ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">
    <defs><clipPath id="${id}"><path d="${moonPath(r,ph.illum,ph.waxing)}"/></clipPath></defs>
    <circle r="${r}" fill="#1B1F3C" stroke="rgba(150,175,225,.22)" stroke-width=".7"/>
    ${ph.illum>0.012?`<image href="assets/graha/moon.png" x="${-r}" y="${-r}" width="${2*r}" height="${2*r}" clip-path="url(#${id})"/>`:``}
  </svg>`;
}
function moonSVG(date,size){
  const ph=moonPhase(date), r=size/2-0.5;
  return `<svg class="mn" viewBox="${-size/2} ${-size/2} ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">
    <circle r="${r}" fill="#141C33" stroke="rgba(150,175,225,.28)" stroke-width=".6"/>
    ${ph.illum>0.012?`<path d="${moonPath(r,ph.illum,ph.waxing)}" fill="url(#mnfill)"/>`:``}
  </svg>`;
}
const MOON_DEFS=`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <radialGradient id="mnfill" cx="34%" cy="30%">
    <stop offset="0%" stop-color="#F2F5FC"/><stop offset="62%" stop-color="#C3CEE4"/>
    <stop offset="100%" stop-color="#8B99B8"/></radialGradient></defs></svg>`;


/* ---- MONTH CALENDAR -------------------------------------------------
   Apple Fitness lays a year out as one continuous scroll of month grids,
   each day carrying a glanceable daily metric. Ours carries the lunar
   phase, which is the closest thing this app has to a daily reading. */
const CAL_BACK=120, CAL_FWD=60;     // ten years back, five forward
function monthGrid(y,m){
  const first=new Date(y,m,1), days=new Date(y,m+1,0).getDate();
  const lead=(first.getDay()+6)%7;              // Monday-first
  const cells=[];
  for(let i=0;i<lead;i++) cells.push(`<div class="cday empty"></div>`);
  for(let d=1;d<=days;d++){
    const dt=new Date(y,m,d,12);
    const today=isToday(dt), sel=dt.toDateString()===viewDate.toDateString();
    cells.push(`<button class="cday${today?" today":""}${sel?" sel":""}"
      data-iso="${isoOf(dt)}" aria-label="${dt.toDateString()}">
      <span class="cnum">${d}</span>${moonImg(dt,27)}</button>`);
  }
  return `<section class="cmonth" data-label="${first.toLocaleDateString("en-GB",{month:"long",year:"numeric"})}">
    <h3 class="cmname">${first.toLocaleDateString("en-GB",{month:"short"})}${m===0?` ${y}`:""}</h3>
    <div class="cgrid">${cells.join("")}</div></section>`;
}

function openCalendar(){
  const host=document.getElementById("calsheet");
  const now=new Date(), base=new Date(now.getFullYear(),now.getMonth(),1);
  const months=[];
  for(let i=-CAL_BACK;i<=CAL_FWD;i++){
    const d=new Date(base.getFullYear(),base.getMonth()+i,1);
    months.push(monthGrid(d.getFullYear(),d.getMonth()));
  }
  host.innerHTML=`
    <div class="calhead">
      <div class="calnav">
        <button data-j="-12" aria-label="Back one year">&#171;</button>
        <button data-j="-1" aria-label="Back one month">&#8249;</button>
      </div>
      <span id="calttl">${viewDate.toLocaleDateString("en-GB",{month:"long",year:"numeric"})}</span>
      <div class="calnav">
        <button data-j="1" aria-label="Forward one month">&#8250;</button>
        <button data-j="12" aria-label="Forward one year">&#187;</button>
      </div>
      <button class="calclose" id="calclose" aria-label="Close">&#215;</button>
    </div>
    <div class="calweek">${["M","T","W","T","F","S","S"].map(d=>`<span>${d}</span>`).join("")}</div>
    <div class="calscroll" id="calscroll">${months.join("")}</div>`;
  host.classList.add("open");
  document.body.classList.add("noscroll");

  const scroll=document.getElementById("calscroll");
  const target=scroll.children[CAL_BACK + (viewDate.getFullYear()-now.getFullYear())*12
                + (viewDate.getMonth()-now.getMonth())];
  if(target) scroll.scrollTop=target.offsetTop-8;

  const ttl=document.getElementById("calttl");
  scroll.onscroll=()=>{
    for(const sec of scroll.children){
      if(sec.offsetTop+sec.offsetHeight > scroll.scrollTop+16){
        if(ttl.textContent!==sec.dataset.label) ttl.textContent=sec.dataset.label;
        break;
      }
    }
  };
  scroll.onclick=e=>{
    const b=e.target.closest(".cday[data-iso]"); if(!b) return;
    const [y,m,d]=b.dataset.iso.split("-").map(Number);
    viewDate=new Date(y,m-1,d); buzz(10); closeCalendar(); renderToday();
  };
  /* jump by month or by year - scrolling ten years by finger is not navigation */
  let cursor=CAL_BACK + (viewDate.getFullYear()-now.getFullYear())*12
             + (viewDate.getMonth()-now.getMonth());
  host.querySelectorAll(".calnav button").forEach(b=>b.onclick=()=>{
    cursor=Math.min(Math.max(cursor + +b.dataset.j, 0), scroll.children.length-1);
    const sec=scroll.children[cursor];
    scroll.scrollTo({top:sec.offsetTop-8,behavior:"smooth"});
    buzz(6);
  });
  scroll.addEventListener("scroll",()=>{
    for(let i=0;i<scroll.children.length;i++){
      const sec=scroll.children[i];
      if(sec.offsetTop+sec.offsetHeight > scroll.scrollTop+16){cursor=i;break}
    }
  },{passive:true});
  document.getElementById("calclose").onclick=closeCalendar;
  buzz(6);
}
function closeCalendar(){
  document.getElementById("calsheet").classList.remove("open");
  document.body.classList.remove("noscroll");
}

/* ---- TIMELINE: a short window over proportional bands ----------
   Bands stay proportional because their length is information - Saturn's
   19 years should dwarf the Sun's 6. So instead of shrinking them to fit,
   the column is taller than its viewport and scrolls, holding the selected
   moment in the middle. The rail carries a Today tick and a dot per event. */
let tlT=null;
const TL_H=780;                     // full column height, px
function tlBounds(){
  const m=CHART.dasha.mahas.slice(0,9);
  return {m, t0:m[0].start.getTime(), t1:m[8].end.getTime()};
}
const tlNowT=()=>{const {t0,t1}=tlBounds();
  return Math.min(Math.max((Date.now()-t0)/(t1-t0),0),1)};

function subEventsMarkup(){
  const {t0,t1}=tlBounds();
  return events().map(e=>{
    const t=(new Date(e.d+"T12:00:00").getTime()-t0)/(t1-t0);
    if(t<0||t>1) return "";
    return `<span class="evdot" style="top:${t*100}%;background:${KIND_COLOUR[e.k]||"var(--hot)"}"
             title="${e.t}"></span>`;
  }).join("");
}


function dashaImpact(lord){
  const p=CHART.get(lord), ruled=CHART.housesRuled(lord), bits=[];
  bits.push(ruled.length
    ? `Rules your ${ruled.map(ordinal).join(" and ")} house${ruled.length>1?"s":""} &#8212; ${ruled.map(h=>BHAVA[h-1][1]).join("; ").toLowerCase()}.`
    : `Owns no sign, so rules no house. A shadow graha acts through whatever it sits with.`);
  bits.push(`Sits in your ${ordinal(p.house)} &#8212; ${BHAVA[p.house-1][1].toLowerCase()} &#8212; in ${SIGNS[p.sign-1]}${p.dig?`, ${p.dig.toLowerCase()}`:""}.`);
  const conj=CHART.conjunct(lord);
  if(conj.length) bits.push(`Shares that sign with ${conj.join(" and ")}.`);
  bits.push(`Casts drishti on the ${CHART.aspectedBy(lord).map(ordinal).join(", ")}.`);
  return bits;
}

/* Traditional practice, surfaced only where a graha is the reason - never a
   catalogue. Attributed, and promising no outcome (CLAUDE.md 69). */
const WEEKDAY={Sun:"Sunday",Moon:"Monday",Mars:"Tuesday",Mercury:"Wednesday",
  Jupiter:"Thursday",Venus:"Friday",Saturn:"Saturday",Rahu:"Saturday",Ketu:"Tuesday"};
function practiceFor(lord){
  return `<div class="practice">
    <div class="eyebrow" style="margin-bottom:6px">Traditional practice &#183; ${lord}</div>
    <p class="muted" style="font-size:13px;margin:0">Within Vedic tradition, periods governed by
    ${lord} are associated with observances directed to that graha &#8212; recitation, giving on
    ${WEEKDAY[lord]}, and reflective discipline.</p>
    <p class="muted" style="font-size:11.5px;color:var(--ink-3);margin:8px 0 0">
    Specific mantras are not generated here. They will be sourced and attributed rather than
    invented, and no practice is offered as a guarantee of outcome.</p></div>`;
}

function renderTimelineTab(){

  document.getElementById("pg-timeline").innerHTML=timelineBody();
  wireTimeline();
}
function timelineBody(){
  const {m}=tlBounds();
  if(tlT===null) tlT=tlNowT();
  return `
    <p class="muted" style="font-size:12.5px;margin:0 0 12px;color:var(--ink-3)">
      Drag the spine. 120 years, set by your Moon in Mula.</p>
    <div class="tl2">
      <div class="spine" id="spine" role="slider" tabindex="0"
           aria-label="Move through time" aria-valuemin="0" aria-valuemax="100">
        <div class="spinecol" id="spinecol" style="height:${TL_H}px">
          ${m.map((d,i)=>`<div class="band" data-i="${i}" style="flex:${d.years};
            background:linear-gradient(180deg, ${COLOUR(d.lord)}30, ${COLOUR(d.lord)}0c)">
            <img class="bico" src="assets/graha/${d.lord.toLowerCase()}.png" alt="${d.lord}">
          </div>`).join("")}
        </div>
        <span class="nowtick" id="nowtick" title="today"></span>
        ${subEventsMarkup()}
        <div class="spinemark"><i></i></div>
      </div>
      <div class="tlbody" id="ro"></div>
    </div>
    `;
}

const ageAt=d=>Math.floor((d-CHART.birthDate)/(365.2425*864e5));

function wireTimeline(){
  const {m,t0,t1}=tlBounds();
  const spine=document.getElementById("spine");
  const col=document.getElementById("spinecol");
  let lastLord=null;
  document.getElementById("nowtick").style.top=(tlNowT()*100)+"%";

  const paint=()=>{
    spine.setAttribute("aria-valuenow",Math.round(tlT*100));
    const vh=spine.clientHeight;
    col.style.transform=`translateY(${-(tlT*TL_H - vh/2)}px)`;

    const when=new Date(t0+tlT*(t1-t0));
    const now=CHART.dasha.at(when); if(!now) return;
    document.querySelectorAll(".band").forEach((b,i)=>
      b.classList.toggle("on", when>=m[i].start && when<m[i].end));

    const pos=(when-now.maha.start)/(now.maha.end-now.maha.start);
    const inPeriod=events().filter(e=>{const d=new Date(e.d+"T12:00:00");
      return d>=now.maha.start && d<now.maha.end});

    document.getElementById("ro").innerHTML=`

      <p class="big" style="color:${COLOUR(now.maha.lord)}">${gIcon(now.maha.lord,30)}${now.maha.lord} mahadasha</p>
      <div class="spanrow">
        <div><span class="sk">from</span><b>${fmtDate(now.maha.start)}</b>
          <span class="sa">age ${ageAt(now.maha.start)}</span></div>
        <span class="sarrow">&#8594;</span>
        <div><span class="sk">to</span><b>${fmtDate(now.maha.end)}</b>
          <span class="sa">age ${ageAt(now.maha.end)}</span></div>
      </div>
      <div class="bar"><i style="width:${(pos*100).toFixed(1)}%;background:${COLOUR(now.maha.lord)}"></i>
        <span class="barnow" style="left:${(pos*100).toFixed(1)}%"></span></div>
      <p class="poslabel">${Math.round(pos*100)}% through</p>
      <div class="antar">
        ${gIcon(now.antar.lord,20)}<b style="color:${COLOUR(now.antar.lord)};font-size:15px">${now.antar.lord}</b>
        <span class="evmeta">antardasha &#183; ${fmtDate(now.antar.start)} to ${fmtDate(now.antar.end)}</span>
      </div>
      ${inPeriod.length?`
        <div class="eyebrow" style="margin:20px 0 8px">Your life in this period</div>
        ${inPeriod.map(e=>{const ed=eventDasha(e.d);
          return `<div class="evrow"><span class="evkey" style="background:${KIND_COLOUR[e.k]}"></span>
            <span><b>${e.t}</b><span class="evmeta">${fmtDate(new Date(e.d+"T12:00:00"))}
            &#183; ${ed?`${gIcon(ed.maha.lord,13)}${ed.maha.lord}/${ed.antar.lord}`:""}</span></span></div>`}).join("")}
        <p class="muted" style="font-size:11px;color:var(--ink-3);margin:2px 0 0">
          Shown alongside the period, not caused by it.</p>`:``}
      <div class="eyebrow" style="margin:20px 0 8px">What this period touches</div>
      ${dashaImpact(now.maha.lord).map(t=>`<p class="impact">${t}</p>`).join("")}
      ${practiceFor(now.maha.lord)}
      <p class="note">Traditional associations &#8212; not a forecast.</p>`;
    setTopBar(when.toLocaleDateString("en-GB",{month:"long",year:"numeric"}),
      {sub:`age ${ageAt(when)}`,
       actions:isToday(when)?`<span class="nowbadge">today</span>`
         :`<button class="tb-btn txt" id="tlnow">Today</button>`});
    const tn=document.getElementById("tlnow");
    if(tn) tn.onclick=()=>{tlT=tlNowT();buzz(10);paint()};
    if(now.maha.lord!==lastLord){lastLord=now.maha.lord;buzz(11)}
  };

  const setFromY=cy=>{const r=spine.getBoundingClientRect();
    tlT=Math.min(Math.max((cy-r.top)/r.height,0),1); paint()};
  let dragging=false, moved=false;
  /* a tap should not teleport you across a century - only dragging moves time */
  let dragY=0, dragT=0;
  spine.addEventListener("pointerdown",e=>{dragging=true;moved=false;
    dragY=e.clientY;dragT=tlT;spine.setPointerCapture(e.pointerId)});
  spine.addEventListener("pointermove",e=>{
    if(!dragging)return;
    const r=spine.getBoundingClientRect();
    tlT=Math.min(Math.max(dragT+(e.clientY-dragY)/r.height,0),1); moved=true; paint();
  });
  spine.addEventListener("pointerup",()=>dragging=false);
  spine.addEventListener("keydown",e=>{const step=e.shiftKey?0.05:0.01;
    if(e.key==="ArrowDown"){tlT=Math.min(tlT+step,1);paint();e.preventDefault()}
    if(e.key==="ArrowUp"){tlT=Math.max(tlT-step,0);paint();e.preventDefault()}});
  paint();
}


/* ---- FORMS -------------------------------------------------------
   Replacing prompt() chains, which lose everything on a mistyped field
   and cannot show a date picker. */
const field=(id,label,type,val="",hint="",attrs="")=>`
  <label class="fld"><span class="flabel">${label}</span>
    ${type==="area"
      ? `<textarea id="${id}" rows="3" placeholder="${hint}">${val}</textarea>`
      : `<input id="${id}" type="${type}" value="${val}" placeholder="${hint}" ${attrs}>`}
  </label>`;

function subAddPartner(){
  const ed=subArg!=null?partners()[subArg]:null;
  const b=ed?new Date(ed.born):null;
  const pad=n=>String(n).padStart(2,"0");
  return `
    <p class="muted" style="font-size:13px;margin:-8px 0 18px">
      Compatibility is read from the Moon, so the date and time of birth are what matter.
      Time especially &#8212; the Moon moves about 13&#176; a day.</p>
    ${field("f_name","Name","text",ed?ed.name:"","Their name")}
    ${field("f_date","Date of birth","date",b?`${b.getFullYear()}-${pad(b.getMonth()+1)}-${pad(b.getDate())}`:"")}
    ${field("f_time","Time of birth","time",b?`${pad(b.getHours())}:${pad(b.getMinutes())}`:"","",'')}
    ${field("f_place","Birth place","text",ed?ed.place||"":"","City, country")}
    <p class="fnote">Birth place is stored for later &#8212; it is needed for their ascendant
    and houses, which arrive with the licensed ephemeris. It does not affect the Gun Milan
    score below, which needs only the Moon.</p>
    <button class="primary" id="fsave">${ed?"Save changes":"Add person"}</button>
    ${ed?`<button class="danger" id="fdel">Remove ${ed.name}</button>`:""}`;
}
function wireAddPartner(){
  document.getElementById("fsave").onclick=()=>{
    const name=document.getElementById("f_name").value.trim();
    const date=document.getElementById("f_date").value;
    const time=document.getElementById("f_time").value||"12:00";
    const place=document.getElementById("f_place").value.trim();
    if(!name||!date){alert("A name and a date of birth are needed.");return}
    const d=new Date(`${date}T${time}:00+05:30`);
    if(isNaN(d)){alert("That date could not be read.");return}
    const l=partners();
    const rec={name,born:d.toISOString(),place,moonL:moonSidereal(d),
               approx:!document.getElementById("f_time").value};
    if(subArg!=null) l[subArg]={...l[subArg],...rec,demo:false}; else l.push(rec);
    savePartners(l); buzz(12);
    subView=subArg!=null?"partner":"rel"; renderSub();
  };
  const del=document.getElementById("fdel");
  if(del) del.onclick=()=>{
    const l=partners(); if(!confirm(`Remove ${l[subArg].name}?`))return;
    l.splice(subArg,1); savePartners(l); buzz(9); subArg=null; subView="rel"; renderSub();
  };
}

function subAddEvent(){
  const ed=subArg!=null?events()[subArg]:null;
  return `
    <p class="muted" style="font-size:13px;margin:-8px 0 18px">
      Record what happened and when. The app lays it against the planetary period that was
      running, so you can look for patterns yourself &#8212; astrology as a frame for
      reflection, not a claim about cause.</p>
    ${field("e_date","When","date",ed?ed.d:"")}
    ${field("e_title","What happened","text",ed?ed.t:"","Started a job, moved city...")}
    ${field("e_note","What it meant to you","area",ed&&ed.n?ed.n:"","Optional")}
    <label class="fld"><span class="flabel">Kind</span>
      <select id="e_kind">${Object.entries(EVENT_KINDS).map(([k,v])=>
        `<option value="${k}"${ed&&ed.k===k?" selected":""}>${v}</option>`).join("")}</select></label>
    <button class="primary" id="esave">${ed?"Save changes":"Add event"}</button>
    ${ed?`<button class="danger" id="edel">Remove</button>`:""}`;
}
function wireAddEvent(){
  document.getElementById("esave").onclick=()=>{
    const d=document.getElementById("e_date").value;
    const t=document.getElementById("e_title").value.trim();
    const n=document.getElementById("e_note").value.trim();
    const k=document.getElementById("e_kind").value;
    if(!d||!t){alert("A date and a description are needed.");return}
    const l=events();
    if(subArg!=null) l[subArg]={...l[subArg],d,t,n,k,demo:false}; else l.push({d,t,n,k});
    saveEvents(l); buzz(12); subArg=null; subView="events"; renderSub();
  };
  const del=document.getElementById("edel");
  if(del) del.onclick=()=>{
    const l=events(); if(!confirm(`Remove "${l[subArg].t}"?`))return;
    l.splice(subArg,1); saveEvents(l); buzz(9); subArg=null; subView="events"; renderSub();
  };
}

/* ---- LIFE EVENTS SCREEN ---- */
function subEvents(){
  const list=events();
  return `
    <div class="addrow">
      <p class="muted" style="font-size:13px;margin:0;flex:1">
        Add the moments that mattered, and the app lays each one against the planetary
        period you were running at the time. Over years it becomes a way to look for
        patterns in your own life &#8212; a frame for reflection, not a claim of cause.</p>
    </div>
    ${list.length?`<div style="margin-top:18px">
      ${list.map((e,i)=>{const ed=eventDasha(e.d);
        return `<div class="evcard">
          <span class="evkey" style="background:${KIND_COLOUR[e.k]}"></span>
          <div style="flex:1">
            <div class="evtop"><b>${e.t}</b>
              <button class="evdel" data-i="${i}" aria-label="Edit">Edit</button></div>
            <span class="evmeta">${fmtDate(new Date(e.d+"T12:00:00"))} &#183;
              ${EVENT_KINDS[e.k]||"Milestone"}${e.demo?" &#183; sample":""}</span>
            ${ed?`<p class="evdash">You were running
              ${gIcon(ed.maha.lord,15)}<b style="color:${COLOUR(ed.maha.lord)}">${ed.maha.lord}</b> mahadasha,
              <b style="color:${COLOUR(ed.antar.lord)}">${ed.antar.lord}</b> antardasha.</p>`:""}
          </div></div>`}).join("")}
    </div>`:`<div class="card" style="margin-top:16px"><p class="muted" style="font-size:13.5px">
      Nothing recorded yet. Tap + to add a moment.</p></div>`}
    <p class="note">These are yours, stored on this device only. Astrology is offered here as
    a frame for reflection &#8212; a period is never presented as the cause of an event.</p>`;
}

function wireEvents(){

  document.querySelectorAll(".evdel").forEach(b=>b.onclick=()=>{
    subArg=+b.dataset.i; subView="addevent"; buzz(7); renderSub();
  });
}

/* ---- RELATIONSHIPS ---- */

/* ---- LIFE EVENTS -------------------------------------------------
   The user's own history, laid against astrological time. Framing is
   deliberate and fixed by CLAUDE.md 51: an event is shown alongside the
   period that was running, never as something the period caused. */
const LKEY="astro.events.v1";
const EVENT_KINDS={career:"Career",relationship:"Relationship",home:"Home",
  study:"Study",health:"Health",milestone:"Milestone",loss:"Loss"};
const KIND_COLOUR={career:"var(--saturn)",relationship:"var(--venus)",home:"var(--moon)",
  study:"var(--mercury)",health:"var(--mars)",milestone:"var(--jupiter)",loss:"var(--ketu)"};
const DEMO_EVENTS=[
  {d:"2010-08-02",t:"Started university",k:"study",demo:true},
  {d:"2014-07-14",t:"First job",k:"career",demo:true},
  {d:"2018-03-09",t:"Moved city",k:"home",demo:true},
  {d:"2021-11-18",t:"Founded the company",k:"career",demo:true},
  {d:"2025-02-06",t:"Shipped the first product",k:"milestone",demo:true}
];
const events=()=>{
  try{
    let l=JSON.parse(localStorage.getItem(LKEY)||"null");
    if(!l){ l=DEMO_EVENTS.slice(); localStorage.setItem(LKEY,JSON.stringify(l)); }
    return l.sort((a,b)=>a.d<b.d?-1:1);
  }catch(_){ return DEMO_EVENTS.slice() }
};
const saveEvents=l=>localStorage.setItem(LKEY,JSON.stringify(l));
const eventDasha=iso=>CHART.dasha.at(new Date(iso+"T12:00:00"));

const PKEY="astro.partners.v1";
const DEMO=[{name:"Natasha",born:"1993-02-21T08:40:00+05:30",demo:true}];
const partners=()=>{
  try{
    let l=JSON.parse(localStorage.getItem(PKEY)||"null");
    if(!l){ l=DEMO.map(d=>({...d,moonL:moonSidereal(new Date(d.born))}));
            localStorage.setItem(PKEY,JSON.stringify(l)); }
    return l;
  }catch(_){ return DEMO.map(d=>({...d,moonL:moonSidereal(new Date(d.born))})) }
};
const savePartners=list=>localStorage.setItem(PKEY,JSON.stringify(list));

function subRel(){
  const list=partners();
  return `
    <div class="addrow">
      <p class="muted" style="font-size:13px;margin:0;flex:1">
        Add someone to compare charts. Only a birth date and time are needed.</p>
    </div>
    ${list.length?`<div class="list" style="margin-top:16px">
      ${list.map((p,i)=>{
        const k=ashtakoota({moonL:CHART.get("Moon").L},{moonL:p.moonL});
        return `<button class="item" data-i="${i}">
          <span class="pav" style="background:${COLOUR(["Venus","Jupiter","Moon","Mars"][i%4])}">${p.name[0].toUpperCase()}</span>
          <span><b style="font-weight:600">${p.name}</b>
            <span style="display:block;font-size:11.5px;color:var(--ink-3)">
              ${NAK[nakOf(p.moonL)]} &#183; ${SIGNS[signOf(p.moonL)-1]}${p.demo?" &#183; sample":""}</span></span>
          <span class="sub" style="color:${k.total>=18?"var(--mercury)":"var(--mars)"}">
            ${k.total}/36</span><span class="chev">&#8250;</span></button>`}).join("")}
    </div>`:`<div class="card" style="margin-top:16px"><p class="muted" style="font-size:13.5px">
      No one added yet. Tap + to compare a chart.</p></div>`}
    <p class="note">Compatibility is computed from each person's Moon &#8212; nakshatra,
    sign and its lord. It needs no birthplace, which is why only date and time are asked for.</p>`;
}

function wireRel(){

  document.querySelectorAll("#pg-you .item[data-i]").forEach(b=>b.onclick=()=>{
    subArg=+b.dataset.i; cameFrom="rel"; subView="partner"; buzz(7); renderSub();
  });
}

function subPartner(){
  const p=partners()[subArg]; if(!p){subView="rel";return subRel()}
  const me={moonL:CHART.get("Moon").L};
  const k=ashtakoota(me,{moonL:p.moonL});
  const pct=k.total/36;
  const verdict=k.total>=28?"Traditionally considered a strong match"
    :k.total>=18?"Above the threshold traditionally considered acceptable"
    :"Below the 18-point threshold traditionally considered acceptable";
  return `
    <div class="scorecard">
      <div class="scorenum" style="color:${pct>=.5?"var(--mercury)":"var(--mars)"}">
        ${k.total}<small>/36</small></div>
      <div style="flex:1">
        <div class="bar" style="margin:0 0 7px"><i style="width:${pct*100}%;
          background:${pct>=.5?"var(--mercury)":"var(--mars)"}"></i></div>
        <p class="muted" style="font-size:12.5px;margin:0">${verdict}.</p>
      </div>
    </div>
    ${rows([["Born",new Date(p.born).toLocaleString("en-GB",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})],
            ["Their Moon",`${SIGNS[signOf(p.moonL)-1]} ${fmtDeg(p.moonL)}`],
            ["Nakshatra",`${NAK[nakOf(p.moonL)]} &#183; pada ${padaOf(p.moonL)}`],
            ["Yours",`${SIGNS[CHART.get("Moon").sign-1]} &#183; ${CHART.get("Moon").nak}`],
            ["Manglik (yours)",manglik(CHART)?"Yes":"No"]])}
    <div class="eyebrow" style="margin:22px 0 10px">The eight kootas</div>
    ${k.kootas.map(x=>`
      <div class="koota">
        <div class="ktop">
          <b>${x.name}</b>
          <span class="kscore" style="color:${x.got===0?"var(--mars)":x.got===x.max?"var(--mercury)":"var(--ink-2)"}">
            ${x.got}<span style="color:var(--ink-3)">/${x.max}</span></span>
        </div>
        <div class="kbar"><i style="width:${(x.got/x.max)*100}%;
          background:${x.got===0?"var(--mars)":x.got===x.max?"var(--mercury)":"var(--hot)"}"></i></div>
        <p class="kabout">${x.about}</p>
        <p class="kvals">You: <b>${SK[x.a]?gIcon(x.a,15):""}${x.a}</b> &#183; ${p.name}: <b>${SK[x.b]?gIcon(x.b,15):""}${x.b}</b>${
          x.simplified?` <span class="pill">simplified rule</span>`:``}</p>
      </div>`).join("")}
    <p class="note">${p.approx?`No birth time was given, so noon was assumed. The Moon
      moves about 13&#176; a day, so the nakshatra may be wrong by one either way &#8212;
      which changes several kootas. Add the real time for a reliable score.<br><br>`:``}
      Gun Milan is one traditional method among several, and a score is not a verdict on a
      relationship. Kootas marked <i>simplified rule</i> use a reduced version of a longer
      classical table and will be completed later.</p>`;
}

function wirePartner(){}

const TABS=[
  {id:"today",label:"Today",icon:'<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 9.6h17M8 3.2v3.6M16 3.2v3.6"/><circle cx="12" cy="14.6" r="1.5" fill="currentColor" stroke="none"/>'},
  {id:"timeline",label:"Timeline",icon:'<circle cx="12" cy="12" r="8.6"/><path d="M12 7.2V12l3.2 2"/>'},
  {id:"universe",label:"Birth chart",
   icon:'<rect x="3.6" y="3.6" width="16.8" height="16.8" rx="1.4"/><path d="M3.6 3.6l16.8 16.8M20.4 3.6L3.6 20.4M12 3.6l8.4 8.4-8.4 8.4-8.4-8.4z"/>'},
  {id:"guide",label:"Guide",icon:'<path d="M20 15.2a2.6 2.6 0 01-2.6 2.6H8.2L4 20.8V6.2A2.6 2.6 0 016.6 3.6h10.8A2.6 2.6 0 0120 6.2z"/>'},
  {id:"you",label:"You",icon:'<circle cx="12" cy="8.4" r="3.5"/><path d="M4.8 20.4c0-4 3.2-7.2 7.2-7.2s7.2 3.2 7.2 7.2"/>'}
];

const YOU_INDEX=4, CHART_INDEX=2, TIMELINE_INDEX=1;
function setTopBar(title,{back=false,actions="",sub=""}={}){
  document.getElementById("tbtitle").innerHTML=
    sub?`<b>${title}</b><span>${sub}</span>`:`<b>${title}</b>`;
  document.getElementById("tbback").classList.toggle("on",back);
  document.getElementById("tbact").innerHTML=actions;
}
document.getElementById("tbback").onclick=()=>{
  buzz(5);
  if(subView==="partner"||subView==="addpartner"){subView=cameFrom||"rel";subArg=null;renderSub()}
  else if(subView==="addevent"){subView="events";subArg=null;renderSub()}
  else if(subView==="learntopic"){subView="learn";renderSub()}
  else if(subView==="personchart"){subView="people";subArg=null;renderSub()}
  else{subView=null;subArg=null;renderYou()}
};
const nav=document.getElementById("tabs");
nav.innerHTML=TABS.map((t,i)=>`<button class="tab ${t.hero?"hero":""} ${i===0?"on":""}"
  role="tab" data-i="${i}" aria-label="${t.label}">
  <span class="tabico"><svg viewBox="0 0 24 24">${t.icon}</svg></span>
  <span class="tablbl">${t.label}</span></button>`).join("");

let activeTab=0;
function go(i){
  if(mode) resetChart();
  /* iOS convention: tapping the tab you are already on pops to its root */
  if(i!==YOU_INDEX || activeTab===YOU_INDEX){
    subView=null; subArg=null; document.body.classList.remove("insub"); }
  activeTab=i;
  /* the bar belongs to the tab, so it has to be reset on every switch -
     the render functions only run once at startup */
  if(i===0) renderToday();
  else if(i===TIMELINE_INDEX) renderTimelineTab();
  else if(i===CHART_INDEX) setTopBar("Sangram\u2019s birth chart",{sub:`${SIGNS_SK[CHART.lagna-1]} lagna \u00b7 ${fmtDeg(CHART.ascendant)} \u00b7 ${CHART.get("Moon").nak} Moon`});
  else if(i===3) setTopBar("Guide");
  TABS.forEach((t,j)=>{
    document.getElementById("pg-"+t.id).classList.toggle("on",j===i);
    nav.children[j].classList.toggle("on",j===i);
    nav.children[j].setAttribute("aria-selected",j===i);
  });
  buzz(5);
}
nav.onclick=e=>{const b=e.target.closest(".tab"); if(!b)return;
  go(+b.dataset.i);
  if(+b.dataset.i===YOU_INDEX) renderYou();
};

/* &#9552;&#9552;&#9552; SKY &#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552; */
/* The starfield was removed: it carried no information and competed
   with the chart. A solid ground is what Apple's own list screens use. */

document.body.insertAdjacentHTML("afterbegin",MOON_DEFS);
renderUniverse(); renderGuide(); renderYou(); renderTimelineTab(); renderToday();
