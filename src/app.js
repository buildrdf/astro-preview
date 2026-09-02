import { limbs, vara, taraBala, houseFrom, gocharaFavourable,
         chandrashtama, GOCHARA_GOOD } from "./panchang.js?v=20260831a";
import { GRAHA_MEANING, GOCHARA_FEEL, HOUSE_TRANSIT_SENSE, SPECIAL,
         DAY_DO, DAY_AVOID, VARA_PRACTICE, PLANET_STORY } from "./interpret.js";
import { LEARN_LEVELS } from "./learn.js?v=20260902";
import { AREA_HOUSES, AREA_LINE, TONE_WORD, PLAIN_DAY, VARA_COLOUR,
         VARA_NUM, RAHU_KALAM_SEGMENT, DASHA_THEME, ANTAR_FLAVOR, MANTRA } from "./narrative.js?v=20260901";
import { sadeSatiWindows, saturnFromMoon, satiCrossings } from "./sadesati.js?v=20260901e";
import { vargaChart, vargaDetail, vargaMeta, VARGA_META, SUPPORTED as VARGA_SUPPORTED } from "./vargas.js?v=20260902";
import { nakIndex, padaIndex, pointGrid, nakshatraRange, signNakshatras, nakLord,
  NAK_META, NAK_SPAN, PADA_SPAN, fmtDMS, SIGN_ELEMENT, SIGN_MODALITY } from "./zodiac.js?v=20260902";
import { buildYogaChart, detectYogas, detectDoshas } from "./yogas.js?v=20260831";
import { bhinnashtakavarga, sarvashtakavarga } from "./ashtakavarga.js?v=20260831";
import { vimshottari as vimshottari3 } from "./dasha3.js?v=20260831";
import { shadbala } from "./shadbala.js?v=20260831a";
import { whereIs, riseSetHint, ascendant, sunTimes } from "./sky.js?v=20260902e";
import { openSkyView, utcFromLocalTz } from "./skyview.js?v=20260902p";
import { ashtakoota, manglik } from "./match.js?v=20260831a";
import { avakhadaOf } from "./report.js?v=20260902e";
import { festivalsBetween, todayObservance } from "./festivals.js?v=20260902c";
import { openObjectDetail, isDetailOpen } from "./objectdetail.js?v=20260902p";
import * as INTERP from "./interpret.js";
import * as LORE from "./lore.js";
/* test states (?sky=1 …) run headless without a saved profile: skip onboarding so
   the screenshot matrix always opens the same app; the built-in reference chart is used */
try{ if(new URLSearchParams(location.search).get("sky")) localStorage.setItem("astro.onboarded","1"); }catch(_){}
import { placementRecord, comparePlacement, transitToNatal, timingContext, functionalNature,
         bindu as avBindu, houseClass } from "./objectmodel.js?v=20260902e";
import { positions, retrograde, ayanamsa, jd, norm as ephNorm,
         moonTropical, sunTropical, moonSidereal, sunSidereal } from "./ephemeris.js?v=20260902e";
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
/* one grid engine for every screen (spec part 54) */
const nakOf=L=>nakIndex(L);
const padaOf=L=>padaIndex(L);
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
  /* the ONE record shape every detail screen reads (objectmodel.js):
     identity + house + dignity + combustion + speed + natural/functional
     nature, cached per graha; the legacy fields above stay for old callers */
  const recCache={}, sunL=(placements.find(p=>p.graha==="Sun")||{}).L;
  const rec=g=>{ if(recCache[g]!==undefined) return recCache[g];
    const p=get(g); return recCache[g]=p?placementRecord(g,p.L,{retro:p.retro,lagna,sunL,date:birthDate}):null; };
  const occupants=h=>ps.filter(p=>p.house===h);
  const housesRuled=g=>shadow(g)?[]:own(g).map(houseOfSign).sort((a,b)=>a-b);
  const aspectedBy=g=>{const p=get(g);return p?offsets(g).map(o=>adv(p.house,o)).sort((a,b)=>a-b):[]};
  const aspecting=h=>ps.filter(p=>p.house!==h&&aspectedBy(p.graha).includes(h)).map(p=>p.graha);
  const conjunct=g=>{const p=get(g);return p?ps.filter(q=>q.graha!==g&&q.sign===p.sign).map(q=>q.graha):[]};
  const dasha=vimshottari(birthDate,placements.find(p=>p.graha==="Moon").L);
  return {lagna,ascendant,placements:ps,birthDate,houseOfSign,signOfHouse,
          get,rec,occupants,housesRuled,aspectedBy,aspecting,conjunct,dasha,
          functional:functionalNature(lagna)};
}
/* current placement of a graha as the same record shape, and the natal-vs-now
   pair every planet page opens with (side by side, never a toggle) */
function nowRecord(g,date){
  const pos=positions(date), ret=retrograde(date);
  return placementRecord(g,pos[g],{retro:ret[g],lagna:CHART.lagna,sunL:pos.Sun,date});
}
function pairFor(g,date){
  const birth=CHART.rec(g), now=nowRecord(g,date);
  const natal=CHART.placements.map(p=>CHART.rec(p.graha)).filter(Boolean);
  return {birth, now, compare:comparePlacement(birth,now),
    toNatal:transitToNatal(now,natal,CHART.lagna,{nodal:!!PREFS().nodal})};
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
let CHART = chartFor(BIRTH, ASCENDANT);

/* ---- THE DEEP ENGINE — vargas, yogas, ashtakavarga and the 3-level
   dasha, computed once per chart and cached. Every value here passed
   the printed-report validators (636 cells) before being shown. ---- */
let ENGINE=null, ENGINE_FOR=null;
/* midheaven, sidereal - verified against the printed KP 10th cusps of
   both reference charts (0.004 deg and 0.000 deg) */
function mcOf(date, lonE){
  const J=jd(date), T=(J-2451545)/36525;
  const gmst=280.46061837+360.98564736629*(J-2451545)+0.000387933*T*T;
  const ramc=ephNorm(gmst+lonE);
  const eps=23.439291-0.0130042*T;
  const lam=Math.atan2(Math.sin(ramc*RAD), Math.cos(ramc*RAD)*Math.cos(eps*RAD))/RAD;
  return ephNorm(lam - ayanamsa(J));
}
function engine(){
  if(ENGINE && ENGINE_FOR===CHART) return ENGINE;
  const posMap={}; CHART.placements.forEach(p=>posMap[p.graha]=p.L);
  const signs={Lagna:CHART.lagna};
  CHART.placements.forEach(p=>{ if(p.graha!=="Rahu"&&p.graha!=="Ketu") signs[p.graha]=p.sign; });
  const ych=buildYogaChart(posMap, CHART.ascendant);
  const bav=bhinnashtakavarga(signs);
  let sb=null;
  try{
    const bp=ACTIVE.p?{lat:ACTIVE.p.lat??BIRTHPLACE.lat,lon:ACTIVE.p.lon??BIRTHPLACE.lon}:BIRTHPLACE;
    const stb=sunTimes(CHART.birthDate, bp.lat, bp.lon);
    if(stb.rise&&stb.set)
      sb=shadbala({longitudes:posMap, ascendant:CHART.ascendant,
        mc:mcOf(CHART.birthDate, bp.lon), date:CHART.birthDate,
        sunrise:stb.rise, sunset:stb.set, tzMinutes:330});
  }catch(_){ sb=null; }
  ENGINE={
    yogas:detectYogas(ych).filter(y=>y.present!==false),
    doshas:detectDoshas(ych),
    bav, sav:sarvashtakavarga(bav),
    d3:vimshottari3(CHART.get("Moon").L, CHART.birthDate),
    varga:D=>vargaChart(CHART.placements, D),
    sb,
  };
  ENGINE_FOR=CHART;
  return ENGINE;
}

/* ---- ACTIVE USER — the whole app reads one chart at a time.
   Switching rebuilds CHART from the person's birth moment (ascendant
   computed on the fly) and re-renders every tab. Pro feature. ---- */
let ACTIVE={name:"Sangram", first:"Sangram", p:null};
function setActiveUser(p){
  if(!p){
    /* "back to me": the onboarded profile when one exists, the
       built-in reference chart otherwise */
    const me=meProfile();
    if(me){
      const d=new Date(me.born);
      CHART=chartFor(d, ascendant(d, me.lat, me.lon));
      ACTIVE={name:me.name, first:me.name.split(" ")[0], p:{...me}};
    }else{
      ACTIVE={name:"Sangram", first:"Sangram", p:null};
      CHART=chartFor(BIRTH, ASCENDANT);
    }
    localStorage.removeItem("astro.activeUser");
  }else{
    const d=new Date(p.born);
    const lat=p.lat??BIRTHPLACE.lat, lon2=p.lon??BIRTHPLACE.lon;
    CHART=chartFor(d, ascendant(d, lat, lon2));
    ACTIVE={name:p.name, first:p.name.split(" ")[0], p};
    try{localStorage.setItem("astro.activeUser",p.name)}catch(_){}
  }
  ingressCache={key:null,map:null};
  tlT=null; uniMode="birth";
  renderUniverse(); renderGuide(); renderTimelineTab(); renderToday(); renderYou();
  go(activeTab);
  if(activeTab===YOU_INDEX) renderYou();
}

const gIcon=(g,sz=18)=>`<img class="gico" src="assets/graha/${g.toLowerCase()}.png" width="${sz}" height="${sz}" alt="" draggable="false">`;
const COLOUR=g=>`var(--${g.toLowerCase()})`;
const ordinal=n=>n+(["th","st","nd","rd"][(n%100-20)%10]||["th","st","nd","rd"][n%100]||"th");
const buzz=ms=>{try{if(PREFS().haptics!==false&&navigator.vibrate)navigator.vibrate(ms)}catch(_){}}
const el=(t,a={})=>{const e=document.createElementNS("http://www.w3.org/2000/svg",t);
  for(const k in a)e.setAttribute(k,a[k]);return e};
const fmtDate=d=>d.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
/* 12-hour clock everywhere a human reads a time; the zone is named once per
   surface, not per value (Sangram, 29 Aug: "it should say full timing"). */
const fmtClock=d=>d?d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:true}):"&#8211;";

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
/* The classical hand-drawn geometry, matched to reference charts: each
   quadrant's inner line is an OGEE - it leaves the gate (edge midpoint)
   with a narrow neck, swells outward, and meets a sharp cusp on the
   diagonal halfway between corner and centre. Central houses become
   onion domes: S-curved shoulders, straight diagonal sides at the base,
   pointed at the gates and at the cusps. Diagonals stay straight.
   Numbers generated from gate/cusp geometry (neck 3.2, bulge 4.8). */
const RHOMBUS_D="M 50 0 C 43.07 11.46 29.38 13.83 25 25 C 13.83 29.38 11.46 43.07 0 50 "+
  "C 11.46 56.93 13.83 70.62 25 75 C 29.38 86.17 43.07 88.54 50 100 "+
  "C 56.93 88.54 70.62 86.17 75 75 C 86.17 70.62 88.54 56.93 100 50 "+
  "C 88.54 43.07 86.17 29.38 75 25 C 70.62 13.83 56.93 11.46 50 0 Z";
/* house 1's wash: the dome's ogee shoulders down to the cusps, then the
   straight diagonals to the centre - agreeing with the drawn lines */
const LAGNA_D="M 50 0 C 56.93 11.46 70.62 13.83 75 25 L 50 50 L 25 25 "+
  "C 29.38 13.83 43.07 11.46 50 0 Z";
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


/* ---------------------------------------------------------------
   Degree-accurate placement. A house spans 30 degrees of one sign;
   a graha at 2 degrees and one at 28 belong at opposite ends of it.
   Previously every graha sat at its house's centroid, so a day of
   scrubbing moved nothing on screen even with correct positions.
   --------------------------------------------------------------- */
function polySpan(poly){
  const [ux,uy]=AXIS[poly.h], c=cent(HOUSES[poly.h]);
  let lo=0, hi=0;
  HOUSES[poly.h].forEach(v=>{
    const t=(v[0]-c[0])*ux+(v[1]-c[1])*uy;
    lo=Math.min(lo,t); hi=Math.max(hi,t);
  });
  return {lo,hi,ux,uy,c};
}
const SPAN_CACHE={};
for(const h in HOUSES) SPAN_CACHE[h]=polySpan({h});

/* Each house gets a travel path that ENTERS at the edge shared with the
   previous house and LEAVES at the edge shared with the next, so a graha
   crossing a sign boundary walks across it instead of teleporting - the
   scrub becomes physical travel (CLAUDE.md 74, 79). */
const sharedEdgeMid=(a,b)=>{
  const A=HOUSES[a], B=HOUSES[b], hit=[];
  for(const v of A) for(const w of B)
    if(Math.abs(v[0]-w[0])<.01 && Math.abs(v[1]-w[1])<.01) hit.push(v);
  if(hit.length<2) return ANCHOR[a];
  return [(hit[0][0]+hit[1][0])/2,(hit[0][1]+hit[1][1])/2];
};
const PATH_CACHE={};
for(let h=1;h<=12;h++){
  const prev=((h+10)%12)+1, next=(h%12)+1, A=ANCHOR[h];
  const gE=sharedEdgeMid(h,prev), gX=sharedEdgeMid(h,next);
  /* parked positions sit a full disc INSIDE the house; the gate points on
     the shared edges are touched only at the instant of crossing, and both
     neighbouring houses share them exactly - so the position function is
     continuous across every boundary, and a parked graha never sits on a
     line (Sangram, 25 Aug) */
  const inset=(g)=>{const d=Math.hypot(A[0]-g[0],A[1]-g[1]);
    const k=Math.min(5.2/d,0.5); return [g[0]+(A[0]-g[0])*k, g[1]+(A[1]-g[1])*k]};
  const E=inset(gE), X=inset(gX);
  const l1=Math.hypot(A[0]-E[0],A[1]-E[1]), l2=Math.hypot(X[0]-A[0],X[1]-A[1]);
  PATH_CACHE[h]={gE,gX,E,A,X,l1,l2,L:l1+l2};
}
const BLEND=1.2;   /* degrees of sign spent easing through the gate */
function pathPoint(h,t){          /* t = 0..1 across the CORE path */
  const P=PATH_CACHE[h], sgm=t*P.L;
  if(sgm<=P.l1){ const k=P.l1?sgm/P.l1:0;
    return {x:P.E[0]+(P.A[0]-P.E[0])*k, y:P.E[1]+(P.A[1]-P.E[1])*k}; }
  const k=P.l2?(sgm-P.l1)/P.l2:0;
  return {x:P.A[0]+(P.X[0]-P.A[0])*k, y:P.A[1]+(P.X[1]-P.A[1])*k};
}
/* full position by degree-in-sign, with gate blends at both ends */
function pathPos(h,deg){
  const P=PATH_CACHE[h];
  if(deg<BLEND){ const k=deg/BLEND;
    return {x:P.gE[0]+(P.E[0]-P.gE[0])*k, y:P.gE[1]+(P.E[1]-P.gE[1])*k}; }
  if(deg>30-BLEND){ const k=(deg-(30-BLEND))/BLEND;
    return {x:P.X[0]+(P.gX[0]-P.X[0])*k, y:P.X[1]+(P.gX[1]-P.X[1])*k}; }
  return pathPoint(h,(deg-BLEND)/(30-2*BLEND));
}
function placeByDegree(list){
  /* Continuous by construction: each graha rides its house's path at its
     exact degree; crowded neighbours merge into blocks centred on their
     collective mean (a slow graha never freezes fast ones). */
  const byHouse={};
  list.forEach(p=>{ (byHouse[p.house]=byHouse[p.house]||[]).push(p) });
  const out={};
  for(const h in byHouse){
    const group=byHouse[h].slice().sort((a,b)=>degIn(a.L)-degIn(b.L));
    if(group.length===1){
      const p=group[0], pt=pathPos(+h,degIn(p.L));
      out[p.graha]=[pt.x,pt.y];
      continue;
    }
    const P=PATH_CACHE[h];
    const gap=Math.min(9.6/P.L, 1/(group.length-1));
    const raw=group.map(p=>degIn(p.L)/30);
    let blocks=raw.map(v=>({sum:v,n:1}));
    let merged=true;
    while(merged){
      merged=false;
      for(let i2=0;i2<blocks.length-1;i2++){
        const A=blocks[i2],B=blocks[i2+1];
        const endA=A.sum/A.n+(A.n-1)*gap/2, startB=B.sum/B.n-(B.n-1)*gap/2;
        if(endA+gap>startB){
          blocks.splice(i2,2,{sum:A.sum+B.sum,n:A.n+B.n}); merged=true; break;
        }
      }
    }
    const t=[];
    for(const bl of blocks){
      let c=bl.sum/bl.n;
      const half=(bl.n-1)*gap/2;
      c=Math.max(half,Math.min(1-half,c));
      for(let i2=0;i2<bl.n;i2++) t.push(c-half+i2*gap);
    }
    group.forEach((p,i2)=>{
      const pt=pathPoint(+h,Math.max(0,Math.min(1,t[i2])));
      out[p.graha]=[pt.x,pt.y];
    });
  }
  return out;
}

function locator(h){
  const shapes=Object.keys(HOUSES).map(k=>
    `<polygon points="${HOUSES[k].map(q=>q.join(",")).join(" ")}" fill="${+k===h?"var(--brass)":"transparent"}" fill-opacity="${+k===h?.9:0}" stroke="var(--line-2)" stroke-width="2.5"/>`).join("");
  return `<svg class="loc" viewBox="-4 -4 108 108" aria-hidden="true"><rect x="0" y="0" width="100" height="100" fill="none" stroke="var(--line-2)" stroke-width="2.5"/>${shapes}</svg>`;
}

/* &#9552;&#9552;&#9552; TODAY &#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552; */
let viewDate=new Date(); let stripKeep=null, stripGlide=false;
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


/* ===================================================================
   THE DAY, DERIVED
   -------------------------------------------------------------------
   A sun-sign horoscope gives one of twelve readings to eight hundred
   million people. This does not. Every line below comes from where the
   nine grahas actually are today, measured against THIS chart: the
   houses they occupy counted from the lagna and from the natal Moon,
   the natal grahas they contact, the nakshatra the Moon is crossing
   relative to the birth nakshatra, and the dasha running underneath.

   Nothing here is written in advance and nothing is generated. Each
   sentence carries the facts that produced it, which is what makes the
   "Why?" control possible (CLAUDE.md 61, 62).
   =================================================================== */

const BENEFIC={Jupiter:1,Venus:1,Mercury:.6,Moon:.6};
const MALEFIC={Saturn:1,Mars:1,Sun:.6,Rahu:.8,Ketu:.8};

/* Parashari drishti, as house offsets from the graha's own house */
const DRISHTI={Sun:[7],Moon:[7],Mercury:[7],Venus:[7],
  Mars:[4,7,8],Jupiter:[5,7,9],Saturn:[3,7,10],Rahu:[5,7,9],Ketu:[5,7,9]};


function dayFacts(date){
  const tr=transits(date);
  const natalMoonSign=CHART.get("Moon").sign;
  const natalMoonNak=nakOf(CHART.get("Moon").L);
  const todayMoonNak=nakOf(tr.Moon.L);
  const lb=limbs(sunSidereal(date), moonSidereal(date));
  const vr=vara(date);
  const tara=taraBala(natalMoonNak, todayMoonNak);

  /* every graha, twice over: from the lagna and from the natal Moon */
  const sky=GRAHA_ORDER.map(g=>{
    const t=tr[g];
    const hMoon=houseFrom(natalMoonSign, t.sign);
    const natal=CHART.get(g);
    /* a transit "returns" when it re-enters the sign it was born in */
    const onNatal=CHART.placements.filter(n=>n.sign===t.sign);
    return {graha:g, sign:t.sign, house:t.house, houseFromMoon:hMoon,
      nak:t.nak, pada:t.pada, deg:t.deg, retro:t.retro,
      favourable:gocharaFavourable(g,hMoon),
      aspects:(DRISHTI[g]||[7]).map(o=>adv(t.house,o)),
      conjunctNatal:onNatal.map(n=>n.graha),
      returned:natal && natal.sign===t.sign};
  });

  return {date, tr, sky, limbs:lb, vara:vr, tara,
    natalMoonSign, natalMoonNak, todayMoonNak,
    chandrashtama:chandrashtama(houseFrom(natalMoonSign,tr.Moon.sign)),
    dasha:CHART.dasha.at(date)};
}

/* Score one life area from the grahas actually touching its houses.
   Occupation counts full; an aspect counts half; the classical gochara
   verdict from the Moon shifts the sign of the contribution. */
function areaScore(area, F){
  const hs=AREA_HOUSES[area], ev=[];
  let score=0, n=0;
  F.sky.forEach(p=>{
    const occupies=hs.includes(p.house);
    const aspects=p.aspects.filter(h=>hs.includes(h));
    if(!occupies && !aspects.length) return;
    /* the graha's own nature leads; the classical gochara verdict from the
       natal Moon shifts it; an aspect counts half of an occupation */
    const nature=(BENEFIC[p.graha]||0) - (MALEFIC[p.graha]||0);
    const reach=occupies?1:0.5;
    const c=(nature*0.6 + (p.favourable?0.55:-0.4)) * reach;
    score+=c; n+=reach;
    ev.push({graha:p.graha, house:p.house, houseFromMoon:p.houseFromMoon,
      occupies, aspects, favourable:p.favourable, retro:p.retro, weight:Math.abs(c)});
  });
  /* the Moon's tara colours every area of the day equally */
  score += F.tara.tone==="good"?.45 : F.tara.tone==="testing"?-.45 : 0; n+=1;
  ev.push({graha:"Moon", tara:true, weight:.45});

  /* a mean, not a sum: an area touched by six grahas should not read
     darker than one touched by two simply for being busier */
  const mean = n ? score/n : 0;
  const lead = [...ev].sort((a,b)=>b.weight-a.weight)[0];
  return {area, score:mean, evidence:ev, lead};
}

/* Tone is read ACROSS the five areas of one day, not against an absolute
   scale. Two reasons. Gochara verdicts are lopsided by construction - most
   grahas are unfavourable in most houses - so an absolute scale would call
   almost every day difficult, which is neither true nor a thing this app
   should be saying (CLAUDE.md 106, 143). And a day where all five read the
   same tells the user nothing. Relative tone answers the question they
   actually have: of my life today, where is the support and where is the drag? */
function assignTones(areas){
  const avg=areas.reduce((a,x)=>a+x.score,0)/areas.length;
  areas.forEach(a=>{
    a.tone = a.score>avg+0.12 ? "favourable" : a.score<avg-0.12 ? "slow" : "balanced";
  });
  if(new Set(areas.map(a=>a.tone)).size===1){
    const sorted=[...areas].sort((x,y)=>y.score-x.score);
    sorted.forEach((a,i)=>a.tone = i===0?"favourable"
      : i===sorted.length-1?"slow" : "balanced");
  }
  return areas;
}

function dayReading(date){
  const F=dayFacts(date);
  const areas=assignTones(Object.keys(AREA_HOUSES).map(a=>areaScore(a,F)));

  /* the headline names the loudest thing in the sky today, not a mood */
  const moon=F.sky.find(p=>p.graha==="Moon");
  const rank=[...areas].sort((a,b)=>b.score-a.score);
  const best=rank[0], worst=rank[rank.length-1];
  const head = F.chandrashtama
    ? `The Moon is in your eighth from birth`
    : `A day about ${HOUSE_ADVICE[moon.house][0]}`;
  const body = F.chandrashtama
    ? `The Moon is crossing the eighth sign from where it stood at your birth &#8212; <b>Chandrashtama</b> in the tradition. It is read as a low day rather than a dangerous one: rest is favoured over launching, and other people's judgement over your own.`
    : `The Moon crosses your ${ordinal(moon.house)} house today, so ${HOUSE_ADVICE[moon.house][1]} is where attention naturally sits. `+
      `Across your life areas, <b>${best.area.toLowerCase()}</b> carries the most support today`+
      `${worst.tone==="slow" ? `, and <b>${worst.area.toLowerCase()}</b> the least` : ""}.`;
  return {F, areas, head, body};
}

/* ---- prose assembly: facts from the engine, words from the library ---- */
const pickBy=(arr,seed,n)=>Array.from({length:Math.min(n,arr.length)},(_,i)=>arr[(seed+i*2)%arr.length]);
const dayOfYear=d=>Math.floor((d-new Date(d.getFullYear(),0,0))/864e5);

/* ---- special long transits, checked from real positions ---- */
function specialTransits(F){
  const out=[];
  const sat=F.sky.find(p=>p.graha==="Saturn"), jup=F.sky.find(p=>p.graha==="Jupiter");
  if([12,1,2].includes(sat.houseFromMoon)){
    const phase={12:"first",1:"middle",2:"final"}[sat.houseFromMoon];
    out.push({...SPECIAL.sadeSati, extra:`You are in its ${phase} phase &#8212; Saturn is ${ordinal(sat.houseFromMoon)} from your Moon.`});
  }
  if(jup.returned) out.push(SPECIAL.jupiterReturn);
  if(sat.returned) out.push(SPECIAL.saturnReturn);
  if(F.chandrashtama) out.push(SPECIAL.chandrashtama);
  return out;
}

/* ---- next sign change for each graha, one daily sweep, cached per day ---- */
let ingressCache={key:null,map:null};
function nextIngressMap(from){
  const key=from.toDateString();
  if(ingressCache.key===key) return ingressCache.map;
  const map={}, start={};
  const p0=positions(from);
  GRAHA_ORDER.forEach(g=>start[g]=signOf(p0[g]));
  let pending=GRAHA_ORDER.length;
  for(let d=1;d<=1100 && pending;d++){
    const t=new Date(from.getTime()+d*864e5);
    const pos=positions(t);
    for(const g of GRAHA_ORDER){
      if(map[g]) continue;
      const sg=signOf(pos[g]);
      if(sg!==start[g]){ map[g]={sign:sg,date:t,days:d}; pending--; }
    }
  }
  ingressCache={key,map};
  return map;
}

/* ===================================================================
   TODAY'S RHYTHM — the one canonical time-quality model (spec §11).
   Every surface that talks about the quality of an hour - the track,
   the seeker readout, Best window, Take care, VoiceOver - reads from
   THIS, never from its own arithmetic. Personal, not just panchang
   (§15): choghadiya is the base clock; Rahu Kalam and Abhijit force
   their windows; the person's tara bala and the Moon's count from
   their natal Moon shift the whole day; chandrashtama caps it.
   =================================================================== */
const RH_HORA=["Sun","Venus","Mercury","Moon","Saturn","Jupiter","Mars"];
const RH_CHOG={Sun:["Udveg",-1],Venus:["Char",1],Mercury:["Labh",1],
  Moon:["Amrit",2],Saturn:["Kaal",-2],Jupiter:["Shubh",2],Mars:["Rog",-1]};
const RH_SENSE={Amrit:"nectar &#8212; broadly auspicious",
  Shubh:"gentle and constructive",
  Labh:"supportive for gains, negotiations and practical decisions",
  Char:"movement &#8212; good for travel and setting out",
  Udveg:"restless &#8212; routine over launches",
  Kaal:"heavy &#8212; maintenance, not beginnings",
  Rog:"friction-prone &#8212; keep the stakes low",
  Abhijit:"the midday victor &#8212; traditionally the finest window",
  Rahu:"traditionally set aside"};
const RH_GRADE=[[3,"excellent","Excellent"],[1,"good","Good"],[0,"steady","Steady"],
  [-2,"caution","Caution"],[-99,"avoid","Avoid"]];
const rhGrade=s=>{for(const [min,cls,label] of RH_GRADE) if(s>=min) return {cls,label};
  return {cls:"avoid",label:"Avoid"};};
const VARA_LORD_BY_DAY=["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"];

/* Sun-clock times (choghadiya, rahu kalam, sunrise marks) follow the
   phone's real location once the user has granted it anywhere in the
   app (sky/AR caches a fix) - never prompting from Today itself.
   Falls back to the birth city, exactly as before. */
function liveSpot(){
  try{
    const g=JSON.parse(localStorage.getItem("astro.geo")||"null");
    if(g&&Date.now()-g.t<7*864e5) return {lat:g.lat,lon:g.lon};
  }catch(_){}
  return null;
}

let RHYTHM={key:null,m:null};
function rhythmModel(date){
  const key=date.toDateString()+"|"+ACTIVE.name+(liveSpot()?"|g":"|b");
  if(RHYTHM.key===key) return RHYTHM.m;
  const F=dayFacts(date);
  const d0=new Date(date); d0.setHours(0,0,0,0);
  const d1t=d0.getTime()+864e5;
  const bp=liveSpot()||(ACTIVE.p?{lat:ACTIVE.p.lat??BIRTHPLACE.lat,lon:ACTIVE.p.lon??BIRTHPLACE.lon}:BIRTHPLACE);
  const st =sunTimes(date, bp.lat, bp.lon);
  const stP=sunTimes(new Date(d0.getTime()-864e5), bp.lat, bp.lon);
  const stN=sunTimes(new Date(d0.getTime()+864e5), bp.lat, bp.lon);
  if(!st.rise||!st.set||!stP.set||!stN.rise){ RHYTHM={key,m:null}; return null; }

  /* raw choghadiya segments spanning midnight to midnight: the tail of
     the PREVIOUS night, this day's eight, this night's head */
  const segs=[];
  const eight=(t0,t1,lord0)=>{ const i0=RH_HORA.indexOf(lord0);
    for(let i=0;i<8;i++){ const lord=RH_HORA[(i0+i)%7];
      segs.push({a:t0+(t1-t0)*i/8, b:t0+(t1-t0)*(i+1)/8,
        lord, name:RH_CHOG[lord][0], base:RH_CHOG[lord][1]}); } };
  const prevLord=VARA_LORD_BY_DAY[new Date(d0.getTime()-864e5).getDay()];
  eight(stP.set.getTime(), st.rise.getTime(), RH_HORA[(RH_HORA.indexOf(prevLord)+5)%7]);
  eight(st.rise.getTime(), st.set.getTime(), F.vara.lord);
  eight(st.set.getTime(), stN.rise.getTime(), RH_HORA[(RH_HORA.indexOf(F.vara.lord)+5)%7]);

  /* forced overlays */
  const dayMs=st.set-st.rise, noon=(st.rise.getTime()+st.set.getTime())/2;
  const rseg=RAHU_KALAM_SEGMENT[date.getDay()];
  const rahu={a:st.rise.getTime()+dayMs*(rseg-1)/8, b:st.rise.getTime()+dayMs*rseg/8};
  const wednesday=date.getDay()===3;
  const abhi=wednesday?null:{a:noon-24*6e4, b:noon+24*6e4};

  /* the personal layer: one day-level shift from tara bala + the Moon's
     count from the natal Moon; chandrashtama caps the whole day */
  const moonT=F.sky.find(p=>p.graha==="Moon");
  let mood=(F.tara.tone==="good"?1:F.tara.tone==="testing"?-1:0)
          +(moonT.favourable?1:-1);
  const shift=Math.max(-1,Math.min(1,Math.round(mood/2)));

  /* slice at overlay edges and clamp to the civil day */
  const cuts=new Set([d0.getTime(), d1t, rahu.a, rahu.b]);
  if(abhi){ cuts.add(abhi.a); cuts.add(abhi.b); }
  const sliced=[];
  for(const s of segs){
    let edges=[s.a, s.b, ...[...cuts].filter(c=>c>s.a&&c<s.b)].sort((x,y)=>x-y);
    for(let i=0;i<edges.length-1;i++){
      const a=Math.max(edges[i], d0.getTime()), b=Math.min(edges[i+1], d1t);
      if(b<=a) continue;
      let score=s.base+shift, name=s.name, lord=s.lord, forced=null;
      const mid=(a+b)/2;
      if(abhi && mid>=abhi.a && mid<abhi.b){ score=3; name="Abhijit"; forced="abhi"; }
      if(mid>=rahu.a && mid<rahu.b){ score=-3; name="Rahu Kalam"; forced="rahu"; }
      if(F.chandrashtama) score=Math.min(score,0);
      sliced.push({a,b,score,name,lord,chog:s.name,forced,...rhGrade(score)});
    }
  }
  sliced.sort((x,y)=>x.a-y.a);
  /* merge equal neighbours */
  const windows=[];
  for(const s of sliced){
    const last=windows[windows.length-1];
    if(last && last.cls===s.cls && last.name===s.name && Math.abs(last.b-s.a)<1000)
      last.b=s.b;
    else windows.push({...s});
  }
  const daytime=windows.filter(w=>w.b>st.rise.getTime()&&w.a<st.set.getTime());
  const best=[...daytime].sort((x,y)=>y.score-x.score||(y.b-y.a)-(x.b-x.a))[0]||null;
  const care=[...windows].sort((x,y)=>x.score-y.score||(y.b-y.a)-(x.b-x.a))[0]||null;
  const m={windows, d0:d0.getTime(), d1:d1t, sunrise:st.rise, sunset:st.set,
    rahu, abhi, shift, tara:F.tara, moonFav:moonT.favourable,
    chandrashtama:F.chandrashtama, best, care, wednesday};
  RHYTHM={key,m};
  return m;
}
/* the window containing an instant, from the same model - §11 */
const rhythmAt=(m,t)=>m.windows.find(w=>t>=w.a&&t<w.b)||m.windows[m.windows.length-1];

let todayTab="horo", todayBodies=null, DAYBAND=null;
function renderToday(){
  lastRenderAt=Date.now();
  const R=dayReading(viewDate), F=R.F, tr=F.tr;
  const now=F.dasha, seed=dayOfYear(viewDate);

  const days=[];
  for(let i=-14;i<=14;i++){
    const d=new Date(); d.setDate(d.getDate()+i); d.setHours(12,0,0,0);
    const on=d.toDateString()===viewDate.toDateString();
    days.push(`<button class="dchip ${on?"on":""}" data-off="${i}">
      <small>${d.toLocaleDateString("en-GB",{weekday:"short"}).slice(0,2)}</small>
      <b>${d.getDate()}</b>${moonImg(d,22)}${isToday(d)?`<i class="nowdot"></i>`:""}</button>`);
  }

  /* the time basis is stated ONCE, here (spec §2) - nothing below
     repeats "at Kopargaon, IST" again */
  setTopBar(`Hi ${ACTIVE.first}`,{sub:viewDate.toLocaleDateString("en-GB",
      {weekday:"short",day:"numeric",month:"short"}).replace(",","")+" · IST",
    actions:`${isToday(viewDate)?"":`<button class="tb-btn txt" id="totoday">Today</button>`}
     <button class="tb-btn" id="calbtn" aria-label="Choose a date">
       <svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/>
         <path d="M3.5 9.6h17M8 3.2v3.6M16 3.2v3.6"/></svg></button>`});

  /* ---- day tone (feeds the summary chip and Do/Hold pick) ---- */
  const favN=R.areas.filter(a=>a.tone==="favourable").length,
        slowN=R.areas.filter(a=>a.tone==="slow").length;
  const dayTone=favN>=2?"favourable":slowN>=2?"slow":"balanced";
  const VERDICT={favourable:["Shubh","auspicious"],
                 balanced:["Sama","an even day"],
                 slow:["Ashubh","go gently"]};
  const [vWord,vGloss]=VERDICT[dayTone];
  const vc=VARA_COLOUR[F.vara.lord], vp=VARA_PRACTICE[F.vara.lord];
  const sp0=liveSpot()||BIRTHPLACE;
  const st=sunTimes(viewDate, sp0.lat, sp0.lon);
  const ft=fmtClock;

  /* ---- 1 · DAILY ESSENTIALS (spec §6): three facts, one quiet row ---- */
  const SWATCH={Copper:"#B87333",White:"#ECEDF2",Red:"#C5482F",
    Green:"#3E8E5C",Yellow:"#E0B84C",Deep:"#3552A8"};
  const cword=vc.c.split(" ")[0];
  const essentials=`
    <div class="essentials">
      <div class="ess"><span class="essv"><i class="csw"
        style="background:${SWATCH[cword]||"#888"}"></i>${vc.c.split(" and ")[0]}</span>
        <small>Lucky colour</small></div>
      <div class="ess"><span class="essv essnum">${VARA_NUM[F.vara.lord]}</span>
        <small>Lucky number</small></div>
      <div class="ess"><span class="essv">${gIcon(F.vara.lord,26)}${F.vara.lord}</span>
        <small>Day lord</small></div>
    </div>`;

  /* ---- 2 · TODAY'S RHYTHM (spec §7-14): one canonical model ---- */
  const M=rhythmModel(viewDate);
  DAYBAND=null;
  let rhythm="";
  if(M){
    const span=M.d1-M.d0, pc=t=>((t-M.d0)/span*100).toFixed(2);
    rhythm=`
    <section class="daysec">
      <h3 class="secttl">Today&#8217;s rhythm</h3>
      <div class="rhytrack" id="rhytrack" role="slider" tabindex="0"
        aria-label="Quality of the day&#8217;s hours &#8212; drag to inspect any time"
        aria-valuetext="">
        ${M.windows.map(w=>`<i class="rw ${w.cls}"
          style="left:${pc(w.a)}%;width:${(pc(w.b)-pc(w.a)).toFixed(2)}%"></i>`).join("")}
        <span class="rsun" style="left:${pc(+M.sunrise)}%"></span>
        <span class="rsun set" style="left:${pc(+M.sunset)}%"></span>
        ${isToday(viewDate)&&Date.now()>M.d0&&Date.now()<M.d1
          ?`<span class="rnow" style="left:${pc(Date.now())}%"></span>`:""}
        <span class="rseek" id="rseek" hidden><b id="rseekt"></b></span>
      </div>
      <div class="rsunlabels">
        <span style="left:${pc(+M.sunrise)}%"><svg viewBox="0 0 24 24" class="sunico">
          <circle cx="12" cy="14" r="4"/><path d="M12 7V3M8.5 4.5L12 1l3.5 3.5" class="arr"/>
          <path d="M4 14H1.5M22.5 14H20M5.6 7.6L4 6M18.4 7.6L20 6"/></svg>${ft(M.sunrise)}</span>
        <span class="setl" style="left:${pc(+M.sunset)}%"><svg viewBox="0 0 24 24" class="sunico">
          <circle cx="12" cy="14" r="4"/><path d="M12 1v4M8.5 3.5L12 7l3.5-3.5" class="arr"/>
          <path d="M4 14H1.5M22.5 14H20M5.6 7.6L4 6M18.4 7.6L20 6"/></svg>${ft(M.sunset)}</span>
      </div>
      <div class="rscale"><span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>12 AM</span></div>
      <div class="rread" id="rread" aria-live="polite"></div>
      <div class="rsummary">
        ${M.best?`<div class="rs"><small>Best window</small>
          <b>${ft(new Date(M.best.a))} &#8211; ${ft(new Date(M.best.b))}</b></div>`:""}
        ${M.care?`<div class="rs care"><small>Take care</small>
          <b>${ft(new Date(M.care.a))} &#8211; ${ft(new Date(M.care.b))}</b></div>`:""}
      </div>
    </section>`;
  }

  /* ---- 3 · DAILY SUMMARY (spec §16): 2-4 lines, human, derived ---- */
  const summary=(()=>{
    const evAll=[...new Map(R.areas.flatMap(x=>x.evidence)
      .filter(e=>!e.tara&&e.occupies&&e.graha!=="Moon")
      .map(e=>[e.graha,e])).values()];
    const sup=evAll.find(e=>e.favourable);
    const extra=sup?` <b>${sup.graha}</b> in your ${ordinal(sup.house)} &#8212;
      ${HOUSE_TRANSIT_SENSE[sup.house]} &#8212; is the current worth using.`:"";
    return `
    <section class="daysec">
      <div class="secrow"><h3 class="secttl">Your day</h3>
        <span class="daychip tone-${dayTone}">${vWord} &#183; ${vGloss}</span></div>
      <p class="dsum"><b>${R.head}.</b> ${R.body}${extra}</p>
    </section>`})();

  /* ---- 4 · DO / HOLD (spec §17): one section, two rows ---- */
  const dhKey=dayTone==="favourable"?"good":dayTone==="slow"?"slow":"mixed";
  const doHold=`
    <section class="daysec">
      <h3 class="secttl">For today</h3>
      <div class="dh"><span class="dhk do">Do</span><p>${pickBy(DAY_DO[dhKey],seed,1)[0]}</p></div>
      <div class="dh"><span class="dhk hold">Hold</span><p>${pickBy(DAY_AVOID[dhKey],seed,1)[0]}</p></div>
    </section>`;

  /* ---- 5 · LIFE AREAS (spec §18-20): horizontal carousel, six cards,
     light "moonlight" surfaces, See why -> full reading page ---- */
  const STATUS={favourable:"Supportive",balanced:"Steady",slow:"Caution"};
  const rankTop=[...R.areas].sort((a,b)=>b.score-a.score)[0];
  const laCards=R.areas.map((a,i)=>{
    const ev=a.evidence.filter(e=>!e.tara)
      .sort((x,y)=>(y.occupies?1:0)-(x.occupies?1:0)).slice(0,3);
    const status=(a===rankTop&&a.tone==="favourable")?"Strong":STATUS[a.tone];
    return `<article class="lacard t-${a.tone}" data-area="${i}">
      <header class="lahead"><span class="laname">${a.area}</span>
        <span class="lastatus s-${a.tone}">${status}</span></header>
      <p class="lains">${PLAIN_DAY[a.area][a.tone]}</p>
      <div class="laplanets" aria-hidden="true">${ev.map(e=>gIcon(e.graha,36)).join("")}</div>
      <button class="seewhy" data-why="${i}">See why <span aria-hidden="true">&#8594;</span></button>
    </article>`}).join("");
  const areasSec=`
    <section class="daysec">
      <h3 class="secttl">Life areas</h3>
      <div class="lacarousel" id="lacar">${laCards}</div>
    </section>`;

  /* ---- 6 · MANTRA (spec §28): contemplative, not a card ---- */
  const vm=MANTRA[F.vara.lord], mm=MANTRA[now.maha.lord];
  const mantra=`
    <section class="mantrasec">
      <h3 class="secttl" style="text-align:center">Mantra for today</h3>
      <p class="mdev">${vm.dev}</p>
      <p class="mtr">${vm.tr}</p>
      <p class="mline">${vm.en} &#8212; ${F.vara.name}&#8217;s mantra.</p>
      ${now.maha.lord!==F.vara.lord
        ?`<p class="mline quiet">For your ${now.maha.lord} season: <i>${mm.tr}</i></p>`:""}
    </section>`;

  /* ---- 7 · TRADITIONAL PRACTICE (spec §29): collapsed, concise ---- */
  const practice=`
    <details class="adv soft">
      <summary>Traditional practice for ${F.vara.name}</summary>
      <p class="interp">${vp.practice}</p>
    </details>`;

  /* free window: yesterday, today, tomorrow. Farther readings ride with Pro. */
  const dayDiff=Math.round((new Date(viewDate).setHours(12,0,0,0)
                           -new Date().setHours(12,0,0,0))/864e5);
  const horoLocked=Math.abs(dayDiff)>1 && !isPro();

  const horo=horoLocked?`
    ${essentials}
    <div class="procard">
      <div class="prolock" aria-hidden="true"><svg viewBox="0 0 24 24">
        <rect x="5" y="10.5" width="14" height="9.5" rx="2.5"/>
        <path d="M8 10.5V7.5a4 4 0 018 0v3"/></svg></div>
      <h3>Time travel is part of Astra Pro</h3>
      <p>Yesterday, today and tomorrow are always free. Any other day&#8217;s full reading
        &#8212; decades either way &#8212; comes with Pro, along with the Guide and
        charts for your people.</p>
      <button class="primary" id="prosee">See Astra Pro</button>
    </div>`
  :essentials+rhythm+summary+doHold+areasSec+mantra+practice;

  /* ---- panchang ---- */
  const LIMB_MEANS={
    Vara:"the weekday, each ruled by a graha",
    Tithi:"the lunar day",
    Nakshatra:"the lunar mansion the Moon sits in",
    Yoga:"a Sun&#8211;Moon angle, one of twenty-seven",
    Karana:"half a tithi",
    Observance:"the festival or vrat this day carries, fixed by its month, paksha and tithi at the traditional hour",
    "Tara bala":"today&#8217;s Moon star counted from your birth star",
    "Colour of the day":`${vc.why} in this tradition`};
  const obs=(()=>{ try{ return todayObservance(viewDate, sp0.lat, sp0.lon); }catch(_){ return null; } })();
  const panch=`
    <p class="skylead">The five limbs of ${isToday(viewDate)?"today":"this day"}.
      Tap any term for what it means.</p>
    <div class="rows panch">
      ${[["Vara",`${F.vara.name} &#183; ruled by ${F.vara.lord}`],
         ["Tithi",`${F.limbs.tithi.paksha} ${F.limbs.tithi.name}`],
         ["Nakshatra",`${NAK[F.todayMoonNak]} &#183; pada ${tr.Moon.pada}`],
         ["Yoga",F.limbs.yoga.name],
         ["Karana",F.limbs.karana.name],
         ...(obs?[["Observance",`${obs.name}${PREFS().lang!=="en"&&obs.hi?` <small class="hiname">${obs.hi}</small>`:""}`]]:[]),
         ["Tara bala",F.tara.name],
         ["Colour of the day",vc.c]]
        .map(([k,v])=>`<div class="row panchrow">
          <button class="term" data-term="${k}">${k}</button>
          <span class="v">${v}</span></div>
        <div class="termdef" data-def="${k}" hidden>${LIMB_MEANS[k]||""}</div>`).join("")}
      <div class="row panchrow"><span class="k">Sunrise &#183; sunset</span>
        <span class="v">${ft(st.rise)} &#183; ${ft(st.set)}</span></div>
    </div>
    <button class="festlink" id="festlink">Festivals &amp; vrats ahead <span class="chev">&#8250;</span></button>
    <div class="moonline">
      ${moonImg(viewDate,30)}
      <span><b>${tr.phase.name}</b> ${Math.round(tr.phase.illum*100)}% &#183;
        ${SIGNS[tr.moon.sign-1]} &#183; ${tr.moon.nak}</span>
    </div>
    ${F.limbs.karana.vishti?`<div class="card special"><b>Vishti karana</b>
      <p>This half-tithi is traditionally set aside from new beginnings.</p></div>`:""}
    ${(()=>{ /* Choghadiya + Hora - the daily timing tables every Indian
                panchang carries (Sangram, 30 Aug). Sequence follows the
                classical hora order from the day lord; night restarts
                five lords on. */
      if(!st.rise||!st.set) return "";
      const HORA_ORDER=["Sun","Venus","Mercury","Moon","Saturn","Jupiter","Mars"];
      const CHOG={Sun:["Udveg","avoid"],Venus:["Char","good"],Mercury:["Labh","good"],
        Moon:["Amrit","good"],Saturn:["Kaal","avoid"],Jupiter:["Shubh","good"],
        Mars:["Rog","avoid"]};
      const st2=sunTimes(new Date(viewDate.getTime()+864e5),BIRTHPLACE.lat,BIRTHPLACE.lon);
      const nowT=Date.now();
      const seg8=(t0,t1,i0)=>Array.from({length:8},(_,i)=>{
        const a=t0+(t1-t0)*i/8, b=t0+(t1-t0)*(i+1)/8;
        const lord=HORA_ORDER[(i0+i)%7];
        return {lord,name:CHOG[lord][0],cls:CHOG[lord][1],a,b,
          on:isToday(viewDate)&&nowT>=a&&nowT<b};
      });
      const di=HORA_ORDER.indexOf(F.vara.lord);
      const dayC=seg8(st.rise.getTime(),st.set.getTime(),di);
      const nightC=st2.rise?seg8(st.set.getTime(),st2.rise.getTime(),(di+5)%7):[];
      const row=c=>`<div class="chogrow${c.on?" on":""} ${c.cls}">
        <b>${c.name}</b><span class="evmeta">${c.cls==="good"?"favourable":"set aside"}</span>
        <span class="chogt">${ft(new Date(c.a))} &#8211; ${ft(new Date(c.b))}</span></div>`;
      const horas=(()=>{ if(!st2.rise) return [];
        const out=[];
        for(let i=0;i<12;i++){ const a=st.rise.getTime()+(st.set-st.rise)*i/12;
          out.push({lord:HORA_ORDER[(di+i)%7],a,b:st.rise.getTime()+(st.set-st.rise)*(i+1)/12}); }
        for(let i=0;i<12;i++){ const a=st.set.getTime()+(st2.rise-st.set)*i/12;
          out.push({lord:HORA_ORDER[(di+12+i)%7],a,b:st.set.getTime()+(st2.rise-st.set)*(i+1)/12}); }
        return out.map(h=>({...h,on:isToday(viewDate)&&nowT>=h.a&&nowT<h.b}));
      })();
      const cur=dayC.concat(nightC).find(c=>c.on);
      const curH=horas.find(h=>h.on);
      return `
      ${cur||curH?`<div class="card special" style="margin-top:12px">
        <b>Right now</b><p>${cur?`<b>${cur.name}</b> choghadiya (${cur.cls==="good"?"favourable":"set aside"}) until ${ft(new Date(cur.b))}`:""}${cur&&curH?" &#183; ":""}${curH?`the hour belongs to <b>${curH.lord}</b> until ${ft(new Date(curH.b))}`:""}.</p>
      </div>`:""}
      <details class="adv soft" style="margin-top:12px">
        <summary>Choghadiya &#8212; favourable and caution windows</summary>
        <div class="eyebrow" style="margin:10px 0 6px">Day</div>
        ${dayC.map(row).join("")}
        ${nightC.length?`<div class="eyebrow" style="margin:14px 0 6px">Night</div>
        ${nightC.map(row).join("")}`:""}
        <p class="note" style="margin-top:8px">Amrit, Shubh, Labh and Char are traditionally
        favourable; Udveg, Kaal and Rog are set aside.</p>
      </details>
      <details class="adv soft" style="margin-top:10px">
        <summary>Hora &#8212; the planetary hours</summary>
        ${horas.map(h=>`<div class="chogrow${h.on?" on":""}">
          ${gIcon(h.lord,15)}<b>${h.lord}</b>
          <span class="chogt">${ft(new Date(h.a))} &#8211; ${ft(new Date(h.b))}</span></div>`).join("")}
        <p class="note" style="margin-top:8px">Twenty-four planetary hours from sunrise,
        in the classical order; each favours its lord&#8217;s matters.</p>
      </details>`;
    })()}`;

  /* ---- TRANSITS (spec §32-37): one beautiful list, no duplicate grid.
     Status badges only where they materially matter; conjunctions
     surfaced when astronomically close (3.5 degree orb, same sign). */
  const specials=specialTransits(F);
  const ing=nextIngressMap(viewDate);
  const wrapd=x=>((x%360)+540)%360-180;
  const COMBUST={Mercury:12,Venus:8,Mars:17,Jupiter:11,Saturn:15,Moon:12};
  const sunL=F.tr.all.Sun.L;
  const moves=F.sky.map(p2=>{
    const nx=ing[p2.graha];
    const L=F.tr.all[p2.graha].L;
    const when=!nx?"" : nx.days<=1?"tomorrow" : nx.days<=14?`in ${nx.days} days`
      : nx.date.toLocaleDateString("en-GB",{day:"numeric",month:"short"})+(nx.date.getFullYear()!==viewDate.getFullYear()?" "+nx.date.getFullYear():"");
    /* one material status beyond retrograde, if any (spec §35) */
    const dig=dignity(p2.graha,L);
    const comb=p2.graha!=="Sun"&&COMBUST[p2.graha]
      &&Math.abs(wrapd(L-sunL))<=COMBUST[p2.graha];
    const badge=dig?dig.toLowerCase():comb?"combust":"";
    return `<button class="ingrow" data-g="${p2.graha}">
      ${gIcon(p2.graha,26)}
      <span class="ingbody">
        <span class="ingmain"><b>${p2.graha}</b> &#183; ${SIGNS[p2.sign-1]} &#183; your ${ordinal(p2.house)} house</span>
        <span class="ingnext">${[p2.retro?"Retrograde":"",badge?cap(badge):"",
          nx?`moves to ${SIGNS[nx.sign-1]} ${when}`:""].filter(Boolean).join(" &#183; ")}</span>
      </span>
      <span class="chev">&#8250;</span>
    </button>`}).join("");
  /* notable conjunctions: within orb AND sharing a sign */
  const conj=(()=>{
    const GL=GRAHA_ORDER.map(g=>({g,L:F.tr.all[g].L,sign:F.tr.all[g].sign}));
    const out=[];
    for(let i=0;i<GL.length;i++) for(let j=i+1;j<GL.length;j++){
      const d=Math.abs(wrapd(GL[i].L-GL[j].L));
      if(d<=3.5 && GL[i].sign===GL[j].sign)
        out.push({a:GL[i].g,b:GL[j].g,d,
          house:F.sky.find(p=>p.graha===GL[i].g).house});
    }
    return out.sort((x,y)=>x.d-y.d).slice(0,3);
  })();
  const sky=`
    <p class="skylead">What is moving in the sky ${isToday(viewDate)?"today":"on this date"},
      where it stands in <b>your</b> houses, and when each moves next.</p>
    ${specials.length?specials.map(x=>`
      <div class="card special"><b>${x.name}</b><p>${x.body}${x.extra?" "+x.extra:""}</p></div>`).join(""):""}
    <div class="list ings">${moves}</div>
    ${conj.length?`
    <h3 class="secttl" style="margin-top:20px">Notable today</h3>
    ${conj.map(c=>`<button class="conjrow" data-g="${c.a}">
      <span class="conjart">${gIcon(c.a,26)}${gIcon(c.b,26)}</span>
      <span class="ingbody"><span class="ingmain"><b>${c.a}</b> and <b>${c.b}</b> are closely conjunct</span>
      <span class="ingnext">${c.d.toFixed(1)}&#176; apart in your ${ordinal(c.house)} house</span></span>
      <span class="chev">&#8250;</span></button>`).join("")}`:""}
    <p class="note">Positions from the ephemeris; houses counted from your lagna,
      verdicts from your natal Moon. Traditional interpretation, not a prediction.</p>`;

  todayBodies={horo,panch,sky};
  document.getElementById("pg-today").innerHTML=`
    <div class="datestrip" id="dates">${days.join("")}</div>
    <div class="tbseg subseg" id="todayseg" role="tablist">
      <span class="thumb" aria-hidden="true"></span>
      ${[["horo","Horoscope"],["sky","Transits"],["panch","Panchang"]].map(([k,l])=>
        `<button class="${todayTab===k?"on":""}" data-t="${k}" role="tab"
           aria-selected="${todayTab===k}">${segIcon(k)}${l}</button>`).join("")}
    </div>
    <div id="todaybody">${todayBodies[todayTab]}</div>`;

  const seg=document.getElementById("todayseg");
  requestAnimationFrame(()=>setThumb(seg,true)); setTimeout(()=>setThumb(seg,true),80);
  wireRhythm();

  /* The strip: a chip tap keeps your place (the handler captured it);
     any other entry centres the selected day. Coming home to today
     GLIDES to centre - the one case Sangram asked to see move. */
  const strip=document.getElementById("dates");
  strip.style.scrollBehavior="auto";
  const stripCentreAt=()=>{
    const sel=strip.querySelector(".dchip.on");
    return sel? sel.offsetLeft-strip.clientWidth/2+sel.offsetWidth/2 : 0;
  };
  if(stripKeep!=null){
    const k=stripKeep, glide=stripGlide;
    stripKeep=null; stripGlide=false;
    strip.scrollLeft=k;
    if(glide) setTimeout(()=>{ const t=stripCentreAt();
      strip.scrollTo({left:t,behavior:"smooth"});
      /* land regardless - a stalled smooth scroll must not strand the strip */
      setTimeout(()=>{ if(Math.abs(strip.scrollLeft-t)>8) strip.scrollLeft=t; },800);
    },70);
    else setTimeout(()=>{ strip.scrollLeft=k; },80);
  } else {
    stripGlide=false;
    const centre=()=>{ strip.scrollLeft=stripCentreAt(); };
    centre(); setTimeout(centre,120);
  }
  document.getElementById("calbtn").onclick=openCalendar;
  const tt=document.getElementById("totoday");
  if(tt) tt.onclick=()=>{ viewDate=new Date();
    stripKeep=strip.scrollLeft; stripGlide=true; buzz(10); renderToday(); };

  document.getElementById("pg-today").onclick=e=>{
    const d=e.target.closest(".dchip");
    if(d){ const nd=new Date(); nd.setDate(nd.getDate()+ +d.dataset.off); nd.setHours(12,0,0,0);
      viewDate=nd; stripKeep=strip.scrollLeft;
      if(+d.dataset.off===0) stripGlide=true;
      buzz(6); renderToday(); return; }
    const pr=e.target.closest("#prosee");
    if(pr){ buzz(8); openProSheet(); return; }
    const rp=e.target.closest("#torpts");
    if(rp){ buzz(8); subView="report"; subArg=null; go(YOU_INDEX); renderYou(); return; }
    const t2=e.target.closest("#todayseg button[data-t]");
    if(t2){
      todayTab=t2.dataset.t; buzz(6);
      const seg2=document.getElementById("todayseg");
      seg2.querySelectorAll("button").forEach(b=>{
        b.classList.toggle("on",b.dataset.t===todayTab);
        b.setAttribute("aria-selected",String(b.dataset.t===todayTab));
      });
      setThumb(seg2,false);
      document.getElementById("todaybody").innerHTML=todayBodies[todayTab];
      wireRhythm();
      return; }
    const w=e.target.closest(".seewhy");
    if(w){ buzz(8); openAreaWhy(+w.dataset.why, w.closest(".lacard")); return; }
    const lc=e.target.closest(".lacard");   /* the whole card opens it */
    if(lc){ const sw=lc.querySelector(".seewhy");
      if(sw){ buzz(8); openAreaWhy(+sw.dataset.why, lc); return; } }
    const tm=e.target.closest(".term");
    if(tm){ const def=document.querySelector(`.termdef[data-def="${tm.dataset.term}"]`);
      if(def){ def.hidden=!def.hidden; buzz(4); } return; }
    const c=e.target.closest(".ingrow,.conjrow");
    if(c){ buzz(8); openObject({kind:"planet",id:c.dataset.g,mode:"now",at:viewDate,from:"today",emphasis:"now",origin:rectOrigin(c.querySelector("img,.art,.ga")||c)}); }
  };
}

/* ---- SEE WHY — the signature chain (spec §21-27). The card expands
   into a full-screen warm-paper reading page; back reverses it and the
   carousel keeps its place (the Today DOM is never torn down). ---- */
/* ---- SHARED CARD MORPH (Sangram, 1 Sep) ---------------------------
   Every warm-light reading page expands from the element that was
   tapped and contracts back to the same place. The content cross-fades
   while the surface morphs, so text never visibly stretches. One
   primitive, used by every opener - the interaction is learned once. */
/* ---- NAV: every full-screen page is a history entry, so the phone's
   back gesture / browser back closes the topmost page exactly as its own
   back button would (ARCH: no page without a back route). Programmatic
   closes go through history.back() so the two paths never diverge. ---- */
const NAV={stack:[],closing:false,seq:0};
function navPush(ov,closeFn){
  const token="aw"+(++NAV.seq);
  NAV.stack.push({token,ov,closeFn});
  try{ history.pushState({astra:token},""); }catch(_){}
  return token;
}
/* a page that replaces the page on top keeps that entry - one Back leaves both, and no
   orphan entry is left for the sky's guard to misread */
function navReplace(ov,closeFn){ const top=NAV.stack[NAV.stack.length-1]; if(!top) return navPush(ov,closeFn); top.ov=ov; top.closeFn=closeFn; return top.token; }
window.addEventListener("popstate",()=>{
  /* drop entries whose page was bulk-removed by a cross-navigation */
  while(NAV.stack.length&&!NAV.stack[NAV.stack.length-1].ov.isConnected) NAV.stack.pop();
  const top=NAV.stack.pop(); if(!top) return;
  NAV.closing=true; try{ top.closeFn(); } finally{ NAV.closing=false; }
});
/* close every open page at once (a CTA that jumps elsewhere), keeping
   history in step */
function navUnwindAll(){
  const live=NAV.stack.filter(e=>e.ov.isConnected);
  NAV.stack.length=0;
  live.forEach(e=>e.ov.remove());
  if(live.length){ NAV.closing=true; try{ history.go(-live.length); }catch(_){} setTimeout(()=>{NAV.closing=false;},50); }
}
function awOpen(ov,card){
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.body.appendChild(ov);
  ov._navToken=navPush(ov,()=>{ if(ov.isConnected) awClose(ov,ov._src,ov._then); });
  if(card&&!reduced){
    const r=card.getBoundingClientRect();
    ov.style.transformOrigin="0 0";
    ov.style.transform=`translate(${r.left}px,${r.top}px) scale(${r.width/innerWidth},${r.height/innerHeight})`;
    ov.style.borderRadius="22px";
    void ov.offsetHeight;
    ov.classList.add("in");
    ov.style.transform=""; ov.style.borderRadius="";
    return {rect:r};
  }
  ov.classList.add("in","fade");
  return null;
}
function awClose(ov,src,then){
  /* a tap on the page's own back arrow: let history drive the close so the
     entry is consumed; popstate re-enters here with NAV.closing set */
  if(!NAV.closing&&ov._navToken&&history.state&&history.state.astra===ov._navToken){
    ov._src=src; ov._then=then; history.back(); return;
  }
  const idx=NAV.stack.findIndex(e=>e.ov===ov); if(idx>=0&&!NAV.closing) NAV.stack.splice(idx,1);
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const done=()=>{ ov.remove(); if(then) then(); };
  if(src&&!reduced){
    const r=src.rect;
    ov.classList.add("out");
    ov.style.transform=`translate(${r.left}px,${r.top}px) scale(${r.width/innerWidth},${r.height/innerHeight})`;
    ov.style.borderRadius="22px";
    setTimeout(done,340);
  } else { ov.classList.add("fadeout"); setTimeout(done,190); }
  buzz(5);
}

function openAreaWhy(i, card){
  const R=dayReading(viewDate), a=R.areas[i], F=R.F;
  if(!a) return;
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const STATUS={favourable:"Supportive",balanced:"Steady",slow:"Caution"};
  const rankTop=[...R.areas].sort((x,y)=>y.score-x.score)[0];
  const status=(a===rankTop&&a.tone==="favourable")?"Strong":STATUS[a.tone];
  const noTime=(ACTIVE.p&&ACTIVE.p.approx)||(!ACTIVE.p&&meProfile()?.noTime);
  const ev=a.evidence.filter(e=>!e.tara)
    .sort((x,y)=>(y.occupies?1:0)-(x.occupies?1:0));
  const tara=a.evidence.find(e=>e.tara);
  const infl=(e,n)=>{
    const gm=GRAHA_MEANING[e.graha], sk=F.sky.find(p=>p.graha===e.graha);
    const feel=GOCHARA_FEEL[e.graha];
    const where=e.occupies
      ?`${SIGNS[sk.sign-1]} &#183; your ${ordinal(e.house)} house`
      :`aspecting your ${e.aspects.map(ordinal).join(" & ")}`;
    /* two voices (Sangram, 1 Sep): the guidance leads in the primary
       reading style; the technical basis follows muted and smaller, so
       a skimmer reads the dark text and glides past the grey */
    const tell=feel?(e.favourable?feel.fav:feel.unfav)
      :(e.favourable?"Lean on what this touches today."
        :"Give what this touches a little more patience today.");
    const because=e.occupies
      ?`${cap(gm.is)} &#8212; in the house of ${HOUSE_TRANSIT_SENSE[e.house]};
        counted ${ordinal(e.houseFromMoon)} from your natal Moon, ${e.favourable?"a supportive count":"a slower count"}${
        e.retro?"; retrograde &#8212; matters return rather than settle first time":""}.`
      :`${cap(gm.is)} &#8212; its gaze falls on ${e.aspects.map(h=>`your ${ordinal(h)} (${HOUSE_TRANSIT_SENSE[h]})`).join(" and ")};
        counted ${ordinal(e.houseFromMoon)} from your natal Moon, ${e.favourable?"supportive":"slower going"}.`;
    return `<div class="awinf">
      <div class="awinfhead">
        <span class="awn">${n}</span>
        <img class="awart" src="assets/graha/${e.graha.toLowerCase()}.png" alt="">
        <div><b>${e.graha}</b><span>${where}</span></div>
      </div>
      <p class="tellme">${tell}</p>
      <p class="because">${because}</p>
      <div class="awctas">
        <button class="awcta" data-act="chart" data-g="${e.graha}">See on today&#8217;s chart</button>
        <button class="awcta" data-act="sky" data-g="${e.graha}">See in today&#8217;s sky</button>
      </div>
    </div>`;
  };
  const ov=document.createElement("div");
  ov.className="awpage";
  ov.innerHTML=`
    <header class="awtop">
      <button class="awback" aria-label="Back">&#8249;</button>
      <span>${a.area}</span>
    </header>
    <div class="awscroll">
      <h1 class="awh1">${a.area}</h1>
      <p class="awstatus s-${a.tone}">${status} today</p>
      <p class="awlead">${PLAIN_DAY[a.area][a.tone]}</p>
      <h2 class="awh2">What this means</h2>
      <p class="awbody">This reading covers ${AREA_LINE[a.area]} &#8212; houses
        ${AREA_HOUSES[a.area].join(", ")} of your chart. ${
        a.tone==="favourable"?"The currents touching those houses run supportive today, so initiative tends to be met."
        :a.tone==="slow"?"The currents touching those houses run slower today &#8212; patience outperforms push."
        :"The currents touching those houses balance out today &#8212; steady effort, no forcing."}</p>
      ${noTime?`<p class="awnote">Birth time unknown &#8212; house-based reasons here are
        approximate; the Moon-count reasons remain reliable.</p>`:""}
      <h2 class="awh2">Why</h2>
      ${ev.map((e,n)=>infl(e,n+1)).join("")}
      ${tara?`<p class="awbody" style="margin-top:14px">And beneath all of it, today&#8217;s
        Moon rides <b>${NAK[F.todayMoonNak]}</b> &#8212; the ${ordinal(F.tara.count)} star
        from your birth star, <b>${F.tara.name}</b> in tara bala. ${F.tara.note}</p>`:""}
      <div class="awctas" style="margin-top:14px">
        <button class="awcta" data-act="guide">Ask Guide about this</button>
      </div>
      <p class="awfoot">Verdicts from the classical gochara tables, counted from your
        natal Moon; schools differ over Rahu and Ketu. A compass for reflection,
        not a prediction.</p>
    </div>`;
  const src=awOpen(ov,card);
  const close=(then)=>awClose(ov,src,then);
  ov.querySelector(".awback").onclick=()=>close();
  ov.onclick=e=>{
    const b=e.target.closest(".awcta"); if(!b) return;
    const g=b.dataset.g; buzz(9);
    if(b.dataset.act==="chart") close(()=>{ go(CHART_INDEX); setMode("today"); openPlanet(g); });
    else if(b.dataset.act==="guide") close(()=>askGuide(
      `Why does ${a.area.toLowerCase()} look ${a.tone==="favourable"?"supportive":a.tone==="slow"?"slow":"steady"} today?`,
      {source:"today",area:a.area,tone:a.tone,date:viewDate.toDateString()}));
    else close(()=>openSkyFocused(g));
  };
}
/* ---- TRANSIT DETAIL (spec §36): same philosophy as See why - a
   focused warm-paper page for one moving graha, then the two evidence
   CTAs. Reuses the awpage environment. ---- */
function openTransitWhy(g, card){
  const F=dayFacts(viewDate);
  const sk=F.sky.find(p=>p.graha===g); if(!sk) return;
  const t=F.tr.all[g], natal=CHART.get(g);
  const ing=nextIngressMap(viewDate)[g];
  const gm=GRAHA_MEANING[g], feel=GOCHARA_FEEL[g];
  const wrapd=x=>((x%360)+540)%360-180;
  const COMBUST={Mercury:12,Venus:8,Mars:17,Jupiter:11,Saturn:15,Moon:12};
  const comb=g!=="Sun"&&COMBUST[g]&&Math.abs(wrapd(t.L-F.tr.all.Sun.L))<=COMBUST[g];
  const dig=dignity(g,t.L);
  const areas=Object.entries(AREA_HOUSES)
    .filter(([,hs])=>hs.includes(sk.house)).map(([a])=>a);
  const nxWhen=!ing?"":ing.days<=1?"tomorrow":ing.days<=14?`in ${ing.days} days`
    :ing.date.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ov=document.createElement("div");
  ov.className="awpage";
  ov.innerHTML=`
    <header class="awtop">
      <button class="awback" aria-label="Back">&#8249;</button>
      <span>${g}</span>
    </header>
    <div class="awscroll">
      <div class="awinfhead" style="margin:6px 0 2px">
        <img class="awart" style="width:56px;height:56px" src="assets/graha/${g.toLowerCase()}.png" alt="">
        <div><b style="font-size:22px">${g}</b>
          <span>${SIGNS[sk.sign-1]} &#183; your ${ordinal(sk.house)} house</span></div>
      </div>
      <p class="awlead" style="margin-top:10px">${cap(gm.is)}.</p>
      <p class="tellme">${feel?(sk.favourable?feel.fav:feel.unfav):""}</p>
      <h2 class="awh2">Right now</h2>
      <p class="because">${t.deg} ${SIGNS[sk.sign-1]} &#183; ${t.nak}${t.pada?` &#183; pada ${t.pada}`:""}
        &#183; ${sk.retro?"retrograde":"direct"}${dig?` &#183; ${dig.toLowerCase()}`:""}${comb?" &#183; combust":""}.
        ${ing?`It moves to ${SIGNS[ing.sign-1]} ${nxWhen}.`:""}</p>
      <h2 class="awh2">Against your chart</h2>
      <p class="because">At your birth it stood in <b>${SIGNS[natal.sign-1]}</b>, your
        ${ordinal(natal.house)} house${sk.sign===natal.sign
          ?` &#8212; it is crossing its own natal sign right now, a <b>return</b>`:""}. Today it moves through the house
        of ${HOUSE_TRANSIT_SENSE[sk.house]}, counted ${ordinal(sk.houseFromMoon)} from
        your natal Moon &#8212; ${sk.favourable?"a supportive count":"a slower count"}.</p>
      ${areas.length?`<p class="awbody">It is shaping today&#8217;s reading for
        <b>${areas.join(", ")}</b>.</p>`:""}
      <div class="awctas" style="margin-top:16px">
        <button class="awcta" data-act="chart" data-g="${g}">See on today&#8217;s chart</button>
        <button class="awcta" data-act="sky" data-g="${g}">See in today&#8217;s sky</button>
        <button class="awcta" data-act="guide" data-g="${g}">Ask Guide about this</button>
      </div>
      <p class="awfoot">Positions from the ephemeris; verdicts from the classical
        gochara tables. Traditional associations, not a prediction.</p>
    </div>`;
  const src=awOpen(ov,card);
  const close=(then)=>awClose(ov,src,then);
  ov.querySelector(".awback").onclick=()=>close();
  ov.onclick=e=>{
    const b=e.target.closest(".awcta"); if(!b) return;
    buzz(9);
    if(b.dataset.act==="chart") close(()=>{ go(CHART_INDEX); setMode("today"); openPlanet(b.dataset.g); });
    else if(b.dataset.act==="guide") close(()=>askGuide(
      `What does ${b.dataset.g}&#8217;s current transit mean for me?`
        .replace("&#8217;","'"),
      {source:"transit",planet:b.dataset.g,date:viewDate.toDateString()}));
    else close(()=>openSkyFocused(b.dataset.g));
  };
}

function openSkyFocused(g){
  const motion=askMotion();
  const at=isToday(viewDate)?null:new Date(viewDate.getTime());
  getSpot().then(spot=>motion.then(m=>openSkyView({...spot, focus:g, motion:m, at,
    pro:isPro(), birth:skyBirthOpts()})));
}
/* the sky at a specific moment (Sade Sati phases, Guide dates) */
function openSkyAt(g,date,opts={}){
  const motion=askMotion();
  /* g is a graha name, or a ribbon selector "rashi:N" / "nak:N" (0-based) from the detail page */
  const sel=/^(rashi|nak):/.test(String(g))?String(g):null;
  getSpot().then(spot=>motion.then(m=>openSkyView({...spot, focus:sel?null:g, sel, motion:m, at:date,
    mode:opts.mode, pro:isPro(), birth:skyBirthOpts()})));
}

/* the rhythm seeker (spec §12-13): continuous time inspection along the
   civil day, floating time label, readout + reason from the ONE model,
   subtle haptic only when crossing into a different window. */
function wireRhythm(){
  const el2=document.getElementById("rhytrack"); if(!el2) return;
  const M=rhythmModel(viewDate); if(!M) return;
  const read=document.getElementById("rread"),
        seek=document.getElementById("rseek"),
        seekT=document.getElementById("rseekt");
  let lastWin=null;
  const show=t=>{
    const w=rhythmAt(M,t);
    seek.hidden=false;
    seek.style.left=(((t-M.d0)/(M.d1-M.d0))*100).toFixed(2)+"%";
    seekT.textContent=fmtClock(new Date(t));
    const sense=w.name==="Rahu Kalam"?RH_SENSE.Rahu
      :w.name==="Abhijit"?RH_SENSE.Abhijit:RH_SENSE[w.chog]||"";
    const why=M.chandrashtama
      ?`chandrashtama caps the day &#8212; the Moon crosses your eighth from birth`
      :`the ${w.name} window, shaded by your tara bala (${M.tara.name}) and the
        Moon&#8217;s ${M.moonFav?"supportive":"slower"} count from your natal Moon`;
    read.innerHTML=`
      <div class="rreadrow"><b class="rgrade g-${w.cls}">${w.label}</b>
        <span class="rspan">${fmtClock(new Date(w.a))} &#8211; ${fmtClock(new Date(w.b))}</span></div>
      <p class="rsense"><b>${w.name}</b> &#183; ${sense}.</p>
      <p class="rwhy">Why: ${why}.</p>`;
    el2.setAttribute("aria-valuetext",
      `${fmtClock(new Date(t))}. ${w.label} period. ${w.name}. From ${fmtClock(new Date(w.a))} to ${fmtClock(new Date(w.b))}.`);
    if(lastWin&&lastWin!==w) buzz(4);
    lastWin=w; el2._t=t;
  };
  const tFromX=x=>{const r=el2.getBoundingClientRect();
    return M.d0+Math.min(Math.max((x-r.left)/r.width,0),1)*(M.d1-M.d0)};
  let drag=false;
  el2.addEventListener("pointerdown",e=>{drag=true;
    try{el2.setPointerCapture(e.pointerId)}catch(_){}
    show(tFromX(e.clientX));});
  el2.addEventListener("pointermove",e=>{if(drag)show(tFromX(e.clientX));});
  /* magnetic release (audit item 2): let go near a window edge and the
     seeker settles onto it - the boundary is the meaningful place */
  const magnetSnap=()=>{
    const t=el2._t; if(t==null) return;
    const PULL=12*6e4;
    let best=null;
    for(const w of M.windows) for(const edge of [w.a,w.b]){
      const d=Math.abs(edge-t);
      if(d>0&&d<=PULL&&(!best||d<Math.abs(best-t))) best=edge;
    }
    if(best==null) return;
    if(matchMedia("(prefers-reduced-motion: reduce)").matches){ show(Math.min(best,M.d1-1)); buzz(4); return; }
    const from=t, to=Math.min(best,M.d1-1), t0=performance.now();
    const step=n=>{
      const k=Math.min((n-t0)/180,1), e=1-Math.pow(1-k,3);
      show(from+(to-from)*e);
      if(k<1) requestAnimationFrame(step); else buzz(4);
    };
    requestAnimationFrame(step);
  };
  el2.addEventListener("pointerup",()=>{ if(drag){ drag=false; magnetSnap(); } });
  el2.addEventListener("keydown",e=>{
    const step=15*6e4*(e.shiftKey?4:1);
    if(e.key==="ArrowRight"){show(Math.min((el2._t??M.d0)+step,M.d1-1));e.preventDefault();}
    if(e.key==="ArrowLeft"){show(Math.max((el2._t??M.d0)-step,M.d0));e.preventDefault();}
  });
  const now=Date.now();
  show(now>M.d0&&now<M.d1?now:M.d0+13.5*36e5);
}

const PEL={};
let uniMode="birth";                 /* "birth" | "today" */
let uniVarga=1;                      /* 1 = rashi; birth mode only */
let uniDate=new Date();
/* The famous divisional charts, each with the one-line reason a person
   would open it - standard Parashari significations, hedged like all
   Astra prose. The full 18 stay in the printed report. */
const VARGA_INFO=[1,2,3,4,7,9,10,12,30].map(D=>{const m=vargaMeta(D); return [D,m.name,m.focus];});
/* the same nine grahas re-seated by the D-fold division of each sign;
   null when the plain rashi chart is showing */
function vargaView(){
  if(uniMode!=="birth"||uniVarga===1) return null;
  const points={Asc:CHART.ascendant};
  for(const p of CHART.placements) points[p.graha]=p.L;
  const signs=vargaChart(points, uniVarga);
  return {lagna:signs.Asc, signs};
}
const uniPlacements=()=>{
  if(uniMode==="birth"){
    const v=vargaView();
    if(!v) return CHART.placements;
    return CHART.placements.map(p=>{
      const sg=v.signs[p.graha];
      /* degree inside the varga sign: position within the division,
         stretched to 30 degrees - the standard varga longitude */
      const vL=(sg-1)*30 + (p.L%(30/uniVarga))*uniVarga;
      /* dignity is re-judged in the varga sign (exaltation in navamsa
         is its own tradition); the natal nakshatra doesn't map to a
         varga longitude, so it is dropped rather than mislabelled */
      return {...p, sign:sg, house:houseFrom(v.lagna,sg), L:vL, degf:fmtDeg(vL),
        dig:dignity(p.graha,vL), nak:null, pada:null};
    });
  }
  const pos=positions(uniDate), retro=retrograde(uniDate);
  return GRAHA_ORDER.map(g=>{
    const L=pos[g], sg=signOf(L);
    return {graha:g, L, retro:retro[g], sign:sg, house:CHART.houseOfSign(sg),
            degf:fmtDeg(L), nak:NAK[nakOf(L)], pada:padaOf(L), dig:dignity(g,L)};
  });
};

/* ---------------------------------------------------------------
   TIME SCRUBBER. The centre line never moves; the scale slides
   underneath it. Sixty tick elements are recycled rather than
   rebuilt, so dragging stays cheap.
   --------------------------------------------------------------- */
const PX_PER_DAY=24, TICKS=101;
let dayOffset=0, rulerReady=false;

/* Offset 0 is NOW, not noon. Today's reading and Today's sky must share
   one instant - anchoring the chart to noon while the horoscope used the
   clock let the two surfaces disagree whenever the Moon crossed a sign
   between noon and now (caught by Sangram on 22 Aug: 8th vs 7th). */
const dateAtOffset=off=>new Date(Date.now()+off*864e5);

function buildTicks(){
  const track=document.getElementById("rulertrack"); if(!track) return;
  track.innerHTML=Array.from({length:TICKS},(_,i)=>
    `<span class="tick" data-i="${i}"><i></i><b></b></span>`).join("");
  rulerReady=true;
}

function paintRuler(){
  const track=document.getElementById("rulertrack");
  const wrap=document.getElementById("ruler");
  if(!track||!wrap) return;
  if(!rulerReady) buildTicks();
  const half=wrap.clientWidth/2;
  /* laid out at zero width while the scrubber is hidden - the visible-time
     call in setMode paints it, so just stand down (an rAF retry never fires
     when the page is backgrounded, which left the ruler empty) */
  if(!half) return;
  const base=Math.round(dayOffset);
  track.querySelectorAll(".tick").forEach(t=>{
    const k=base + (+t.dataset.i - (TICKS-1)/2);
    const d=dateAtOffset(k);
    const x=half + (k-dayOffset)*PX_PER_DAY;
    t.style.transform=`translateX(${x}px)`;
    const first=d.getDate()===1;
    t.className="tick"+(first?" month":"")+(k===0?" today":"");
    t.querySelector("b").textContent = (first||d.getDate()%5===0)
      ? d.toLocaleDateString("en-GB",first?{month:"short"}:{day:"numeric"}) : "";
  });
}

function updateScrubLabel(){
  const el2=document.getElementById("scrubdate");
  if(el2) el2.textContent = uniDate.toLocaleDateString("en-GB",
    {weekday:"short",day:"numeric",month:"long",year:"numeric"});
  const r=document.getElementById("ruler");
  if(r) r.setAttribute("aria-valuetext",
    uniDate.toDateString()+". "+GRAHA_ORDER.map(g=>{
      const p=uniPlacements().find(x=>x.graha===g);
      return `${g} in ${SIGNS[p.sign-1]}, ${ordinal(p.house)} house`;
    }).join(". "));
  const now=document.getElementById("scrubnow");
  if(now) now.style.visibility = Math.abs(dayOffset)<0.5 ? "hidden" : "visible";
}

let lastSigns=null, lastDay=null, lastScrubDate=null;
function crossingTime(g,d0,d1,fromSign){
  let a=d0.getTime(), b=d1.getTime();
  if(a>b){[a,b]=[b,a]}
  for(let i=0;i<22;i++){
    const m=(a+b)/2;
    if(signOf(positions(new Date(m))[g])===fromSign) a=m; else b=m;
  }
  return new Date(b);
}

/* ------------------------------------------------------------------
   THE CHASE. Input never moves planets directly: the ruler sets a
   TARGET day, and a frame loop eases the shown day toward it, so a
   four-day flick sweeps THROUGH four days of sky - every ingress,
   every path - no matter how few touch events the phone delivers.
   (iOS coalesces drag events; animating between sparse targets was
   why fast drags looked like teleports.) CSS transitions are off
   while the loop runs - the loop IS the animation.
   ------------------------------------------------------------------ */
let targetOffset=0, chasing=false, lastFrame=0;
const TAU=105;                     /* ms; smaller = tighter tracking */
function setScrubTarget(off){
  targetOffset=off;
  if(!chasing){ chasing=true; lastFrame=performance.now();
    document.getElementById("stage")?.classList.add("instant");
    requestAnimationFrame(chaseFrame); }
}
function chaseFrame(now){
  if(!chasing) return;
  const dt=Math.min(64, now-lastFrame); lastFrame=now;
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const k=(reduce||document.hidden)?1:1-Math.exp(-dt/TAU);
  dayOffset+=(targetOffset-dayOffset)*k;
  if(Math.abs(targetOffset-dayOffset)<0.004){
    dayOffset=targetOffset; chasing=false;
    document.getElementById("stage")?.classList.remove("instant");
    applyScrub(true);
    return;
  }
  applyScrub(false);
  requestAnimationFrame(chaseFrame);
}

function applyScrub(settled){
  const prevDate=lastScrubDate||uniDate;
  uniDate=dateAtOffset(dayOffset);
  paintRuler(); paintUniverse(false);
  const day=Math.round(dayOffset);
  if(day!==lastDay){ lastDay=day; buzz(3); updateScrubLabel(); }
  if(settled) updateScrubLabel();
  const list=uniPlacements();
  const sig=list.map(p=>p.sign).join(",");
  if(lastSigns!==null && sig!==lastSigns){
    buzz(14);
    const prev=lastSigns.split(",");
    const changed=list.filter((p,i)=>prev[i]!==String(p.sign));
    if(changed.length){
      const p2=changed[0];
      const when=crossingTime(p2.graha, prevDate, uniDate, +prev[GRAHA_ORDER.indexOf(p2.graha)]);
      flashEvent(p2, when.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}));
    }
  }
  lastSigns=sig; lastScrubDate=uniDate;
}
function flashEvent(p,time){
  const host=document.getElementById("scrubwrap"); if(!host) return;
  let n=host.querySelector(".scrubevent");
  if(!n){ n=document.createElement("div"); n.className="scrubevent"; host.appendChild(n) }
  n.innerHTML=`${gIcon(p.graha,18)}<b>${p.graha}</b> entered your ${ordinal(p.house)}${time?` &#183; ${time}`:""}
    <span>${SIGNS[p.sign-1]} &#183; ${BHAVA[p.house-1][1].toLowerCase()}</span>`;
  n.classList.add("on");
  clearTimeout(n._t); n._t=setTimeout(()=>n.classList.remove("on"),2600);
}

function wireRuler(){
  const r=document.getElementById("ruler"); if(!r) return;
  rulerReady=false;
  let dragging=false, x0=0, o0=0;
  r.addEventListener("pointerdown",e=>{
    dragging=true; x0=e.clientX; o0=targetOffset;
    try{r.setPointerCapture(e.pointerId)}catch(_){}
    e.preventDefault();
  });
  r.addEventListener("pointermove",e=>{
    if(!dragging) return;
    setScrubTarget(o0 - (e.clientX-x0)/PX_PER_DAY);
  });
  const end=e=>{
    if(!dragging) return; dragging=false;
    const moved=Math.abs(e.clientX-x0)>6;
    /* a still finger is a tap on a day; a drag stops where it stops */
    if(!moved){
      const rect=r.getBoundingClientRect();
      setScrubTarget(Math.round(o0+(e.clientX-(rect.left+rect.width/2))/PX_PER_DAY));
    }
  };
  r.addEventListener("pointerup",end);
  r.addEventListener("pointercancel",()=>{dragging=false});
  r.addEventListener("keydown",e=>{
    const step=e.shiftKey?7:1;
    if(e.key==="ArrowRight"){setScrubTarget(targetOffset+step);e.preventDefault()}
    if(e.key==="ArrowLeft"){setScrubTarget(targetOffset-step);e.preventDefault()}
    if(e.key==="Home"){setScrubTarget(0);e.preventDefault()}
  });
  document.getElementById("scrubnow").onclick=()=>{buzz(10);setScrubTarget(0)};
  requestAnimationFrame(()=>{ paintRuler(); updateScrubLabel(); });
}


/* The mode pill lives in the bar, not the page: it is the identity of this
   tab, it must stay reachable while a house sheet is open, and the bar is the
   one surface nothing is ever allowed to scroll over. */
function setUniverseBar(){
  setTopBar("",{actions:`
    <button class="tb-btn" id="tbsky" aria-label="Open the sky view">
      <!-- the AR badge form people know: viewfinder corners around a
           cube (Sangram, 31 Aug: "use the icon Apple uses, not a
           random cube") -->
      <svg viewBox="0 0 24 24">
        <path d="M3.5 7V5.4a2 2 0 012-2H7M17 3.4h1.5a2 2 0 012 2V7M20.5 17v1.6a2 2 0 01-2 2H17M7 20.6H5.5a2 2 0 01-2-2V17"/>
        <path d="M12 7.4l3.6 2v5.2l-3.6 2-3.6-2V9.4z"/>
        <path d="M12 12.2l3.6-2.1M12 12.2l-3.6-2.1M12 12.2v4.4"/>
      </svg>
    </button>`,centre:`
    <div class="tbseg" id="unimode" role="tablist" aria-label="Chart mode">
      <span class="thumb" aria-hidden="true"></span>
      <button class="${uniMode==="birth"?"on":""}" data-m="birth" role="tab"
        aria-selected="${uniMode==="birth"}">Birth</button>
      <button class="${uniMode==="today"?"on":""}" data-m="today" role="tab"
        aria-selected="${uniMode==="today"}">Today&#8217;s sky</button>
    </div>`});
  requestAnimationFrame(()=>placeThumb(true)); setTimeout(()=>placeThumb(true),80);
  const sk=document.getElementById("tbsky");
  if(sk) sk.onclick=()=>{buzz(9);
    /* iOS grants motion access only inside the raw tap - ask BEFORE any
       await, or the permission window closes while geolocation resolves */
    const motion=askMotion();
    getSpot().then(spot=>motion.then(m=>openSkyView({...spot, motion:m,
      mode:uniMode==="birth"?"birth":"now", pro:isPro(), birth:skyBirthOpts()})));
  };
}

/* the capsule's highlight is one object that slides between the labels;
   the first placement is instant so it never animates in from nowhere */
function setThumb(seg,instant){
  if(!seg) return;
  const on=seg.querySelector("button.on"), th=seg.querySelector(".thumb");
  if(!on||!th) return;
  if(instant) th.style.transition="none";
  th.style.left=on.offsetLeft+"px"; th.style.width=on.offsetWidth+"px";
  if(instant){ void th.offsetWidth; th.style.transition=""; }
}
function placeThumb(instant){ setThumb(document.getElementById("unimode"),instant) }

function renderUniverse(){
  setUniverseBar();
  const pg=document.getElementById("pg-universe");
  pg.innerHTML=`
    <p class="unihint" id="unihint"></p>
    <div class="stagewrap" id="sw">
      <div class="stage" id="stage">
        <div class="orbit" id="orbit">
          <svg class="chart" viewBox="0 0 100 100" id="chart"
               aria-label="North Indian chart, twelve houses"></svg>
          <svg class="asp" viewBox="0 0 100 100" id="asp"></svg>
          <div class="ghosts" id="ghosts"></div>
        </div>
        <div class="plane" id="plane"></div>
      </div>
    </div>
    <div class="reading" id="reading" hidden></div>
    <div class="scrubwrap" id="scrubwrap">
      <div class="scrubdatehead"><b id="scrubdate"></b>
        <button class="tb-btn txt" id="scrubnow">Now</button></div>
      <div class="ruler" id="ruler" role="slider" tabindex="0"
           aria-label="Move through time" aria-valuetext="">
        <div class="rulertrack" id="rulertrack"></div>
        <div class="rulercentre"></div>
      </div>
      <p class="scrubnote">Drag the scale. The houses hold still; the sky moves.</p>
    </div>`;

  const chart=document.getElementById("chart"), plane=document.getElementById("plane");
  for(let h=1;h<=12;h++){
    const sg=CHART.signOfHouse(h), occ=CHART.occupants(h);
    const sf=el("polygon",{points:HOUSES[h].map(p=>p.join(",")).join(" "),
      class:"hs","data-h":h,tabindex:"0",role:"button"});
    sf.setAttribute("aria-label",
      `${ordinal(h)} house. ${SIGNS[sg-1]}, sign ${sg}. Ruled by ${SIGN_LORD[sg]}. `+
      (occ.length?`${occ.map(o=>o.graha).join(", ")} at birth.`:"No graha here at birth."));
    chart.appendChild(sf);
    const L=LABEL[h], t=el("text",{class:"sn",x:L[0],y:L[1],"data-h":h});
    t.textContent=String(sg); chart.appendChild(t);
  }
  chart.appendChild(el("rect",{x:0,y:0,width:100,height:100,class:"fr"}));
  chart.appendChild(el("line",{x1:0,y1:0,x2:100,y2:100,class:"fr in"}));
  chart.appendChild(el("line",{x1:100,y1:0,x2:0,y2:100,class:"fr in"}));
  /* the inner rhombus bows gently toward the centre, the way the lines of
     a hand-drawn North Indian chart do - pointed at the four gates,
     Vedic rather than geometric */
  chart.appendChild(el("path",{d:RHOMBUS_D,class:"fr in"}));
  chart.appendChild(el("path",{d:LAGNA_D,class:"lg"}));
  const asc=el("text",{class:"asclbl",x:50,y:9}); asc.textContent="ASC"; chart.appendChild(asc);

  const SZ={Sun:1.14,Moon:1.0,Mars:.98,Mercury:.9,Jupiter:1.06,Venus:.98,Saturn:1.16,Rahu:.94,Ketu:.9};
  /* instant recognition beats density (DDR 0003) */
  for(const g of GRAHA_ORDER){
    const b=document.createElement("button");
    b.className="p"; b.dataset.g=g;
    b.style.setProperty("--fill",COLOUR(g));
    b.style.setProperty("--glow",shadow(g)?`0 0 12px -1px ${COLOUR(g)}`
      :`0 0 16px -2px ${COLOUR(g)}, 0 0 34px -8px ${COLOUR(g)}`);
    b.innerHTML=`<img class="art" src="assets/graha/${g.toLowerCase()}.png" alt="" draggable="false">`+
      `<span class="name">${g}<small>${SK[g]}</small></span>`+
      `<span class="tag">${{Sun:"SU",Moon:"MO",Mars:"MA",Mercury:"ME",Jupiter:"JU",
        Venus:"VE",Saturn:"SA",Rahu:"RA",Ketu:"KE"}[g]}</span>`+
      `<span class="retro">R</span>`;
    b.style.setProperty("--d",(34*SZ[g])+"px");
    plane.appendChild(b); PEL[g]=b;
  }

  document.getElementById("reading").addEventListener("click",readingClicks);
  chart.onclick=e=>{const t=e.target.closest(".hs"); if(t){ buzz(9); openObject({kind:"house",id:+t.dataset.h,mode:uniMode==="birth"?"birth":"now",at:uniMode==="birth"?null:uniDate,from:"chart",emphasis:uniMode==="birth"?"birth":"now",origin:rectOrigin(t)}); }};
  chart.onkeydown=e=>{const t=e.target.closest(".hs");
    if(t&&(e.key==="Enter"||e.key===" ")){e.preventDefault();openHouse(+t.dataset.h)}};
  plane.onclick=e=>{const b=e.target.closest(".p"); if(b){e.stopPropagation(); buzz(12);
    openObject({kind:"planet",id:b.dataset.g,mode:uniMode==="birth"?"birth":"now",at:uniMode==="birth"?null:uniDate,from:"chart",emphasis:uniMode==="birth"?"birth":"now",origin:rectOrigin(b)}); }};
  document.getElementById("tbcentre").onclick=e=>{
    const b=e.target.closest("button[data-m]"); if(!b||b.dataset.m===uniMode)return;
    setMode(b.dataset.m);
  };
  wireRuler();
  paintUniverse(true);
}

/* Move the nine buttons rather than rebuilding them, so a mode change or a
   scrub is one continuous motion of the same objects (CLAUDE.md 74, 78). */
function paintUniverse(instant){
  const list=uniPlacements();
  const pos=placeByDegree(list);
  const stage=document.getElementById("stage");
  if(!stage) return;
  stage.classList.toggle("instant", !!instant);
  list.forEach(p=>{
    const b=PEL[p.graha]; if(!b) return;
    const xy=pos[p.graha]; if(!xy) return;
    b.style.setProperty("--x", xy[0]/100);
    b.style.setProperty("--y", xy[1]/100);
    b._pos=[xy[0]/100, xy[1]/100];
    b.classList.toggle("retro", !!p.retro);
    b.setAttribute("aria-label",
      `${p.graha}. ${SIGNS[p.sign-1]}, ${ordinal(p.house)} house, ${p.degf}.`+
      (p.dig?` ${p.dig}.`:"")+(p.retro?" Retrograde.":""));
  });
  paintGhosts();
  paintHouseSigns(list);
  const vi=VARGA_INFO.find(v=>v[0]===uniVarga)||VARGA_INFO[0];
  document.getElementById("unihint").innerHTML = uniMode==="birth"
    ? `<button class="vchip" id="vchip" aria-haspopup="dialog"
         aria-label="Choose a divisional chart. Showing D${uniVarga}, ${vi[1]}">D${uniVarga} &#183; ${vi[1]} <i aria-hidden="true">&#9662;</i></button>`+
      (uniVarga===1
        ? `<button class="vchip" id="ychip" aria-haspopup="dialog"
             aria-label="Show the yogas in your chart">Yogas &#183; ${engine().yogas.length}</button>`+
          `The sky at your birth &#8212; ${fmtDate(CHART.birthDate)}, ${fmtClock(CHART.birthDate)}.`
        : `${cap(vi[2])} &#8212; house 1 is the ${vi[1]} lagna.`)
    : `Where the grahas are on the selected date, in your houses. Faint markers are birth positions.`;
  const vc=document.getElementById("vchip");
  if(vc) vc.onclick=openVargaSheet;
  const yc=document.getElementById("ychip");
  if(yc) yc.onclick=openYogaSheet;
  document.getElementById("scrubwrap").classList.toggle("on", uniMode==="today");
  if(instant) requestAnimationFrame(()=>stage.classList.remove("instant"));
}

/* House sign numbers follow the showing chart: rashi lagna normally,
   the varga lagna when a divisional chart is up. (Also fixes the aria
   labels, which described birth occupants even in Today mode.) */
function paintHouseSigns(list){
  const lag=vargaView()?.lagna ?? CHART.lagna;
  for(let h=1;h<=12;h++){
    const sg=((lag-1+h-1)%12)+1;
    const t=document.querySelector(`.sn[data-h="${h}"]`);
    if(t&&t.textContent!==String(sg)) t.textContent=String(sg);
    const s=document.querySelector(`.hs[data-h="${h}"]`);
    if(s){
      const occ=list.filter(p=>p.house===h).map(p=>p.graha);
      s.setAttribute("aria-label",
        `${ordinal(h)} house. ${SIGNS[sg-1]}, sign ${sg}. Ruled by ${SIGN_LORD[sg]}. `+
        (occ.length?`${occ.join(", ")} here.`:"No graha here."));
    }
  }
}

/* Yogas live ON the chart, not only in a buried list (Sangram, 31 Aug:
   "show those two planets sitting together in that house"). Pick a
   yoga and the grahas that make it light up, joined by a drawn line,
   with the classical rule's working underneath. Rashi chart only - a
   yoga is a D1 pattern, so the chip hides under a varga lens. */
function openYogaSheet(){
  if(mode) resetChart();
  mode="yogas"; buzz(9);
  const ys=engine().yogas;
  document.getElementById("sheetbody").innerHTML=`
    ${peekBlock("Yogas in your chart", `${ys.length} active &#183; tap one to see it`)}
    <div>
      ${ys.map((y,i)=>`
        <button class="vrow" data-y="${i}">
          <b>${y.name}${y.strength?` &#183; ${y.strength}`:""}</b>
          <span>${y.planets?y.planets.join(" + "):""}</span>
        </button>`).join("")}
      <p class="note" style="margin-top:10px">Every yoga here fired from the classical
        rule run against your actual placements &#8212; open one and the chart shows the
        planets that make it. Doshas and the agree/disagree ledger stay in
        You &#8594; Yogas &amp; doshas.</p>
    </div>`;
  showSheetPeek(); expandSheet();
  document.getElementById("sheetbody").onclick=e=>{
    const b=e.target.closest(".vrow"); if(!b) return;
    focusYoga(engine().yogas[+b.dataset.y]);
  };
}
function focusYoga(y){
  clearMarks(); buzz(12);
  const list=uniPlacements();
  const inv=new Set(y.planets||[]);
  const houses=new Set(list.filter(p=>inv.has(p.graha)).map(p=>p.house));
  list.forEach(p=>{ if(!inv.has(p.graha)) PEL[p.graha].classList.add("recede"); });
  qa(".hs").forEach(e2=>e2.classList.add(houses.has(+e2.dataset.h)?"lit":"dim"));
  qa(".sn").forEach(e2=>{ if(!houses.has(+e2.dataset.h)) e2.classList.add("dim"); });
  /* join the participants - the relationship drawn, not described */
  const asp=document.getElementById("asp");
  const ps=[...inv].map(g=>PEL[g]?._pos).filter(Boolean);
  for(let i=0;i+1<ps.length;i++){
    const [x1,y1]=[ps[i][0]*100,ps[i][1]*100], [x2,y2]=[ps[i+1][0]*100,ps[i+1][1]*100];
    const mx=(x1+x2)/2, my=(y1+y2)/2;
    const path=el("path",{d:`M ${x1} ${y1} Q ${mx+(mx-50)*.25} ${my+(my-50)*.25} ${x2} ${y2}`,
      class:"al",stroke:"var(--brass)"});
    asp.appendChild(path);
    const len=path.getTotalLength();
    path.style.setProperty("--len",len);
    path.style.strokeDasharray=len; path.style.strokeDashoffset=len;
    requestAnimationFrame(()=>path.classList.add("on"));
  }
  document.getElementById("sheetbody").onclick=null;
  document.getElementById("sheetbody").innerHTML=`
    ${peekBlock(y.name, y.planets?y.planets.join(" + "):"")}
    <div>
      <div class="eyebrow">${y.sanskrit||""}${y.strength?` &#183; ${y.strength} strength`:""}</div>
      <p class="interp" style="margin-top:8px">${y.because}</p>
      <button class="tb-btn txt" id="ybk" style="margin-top:10px;min-height:44px">&#8249; All yogas</button>
    </div>`;
  collapseSheet();
  const bk=document.getElementById("ybk");
  if(bk) bk.onclick=e2=>{ e2.stopPropagation(); openYogaSheet(); };
}

/* the varga picker rides the standard sheet, so close/reset behave
   exactly like a house or planet sheet */
function openVargaSheet(){
  if(mode) resetChart();
  mode="varga"; buzz(9);
  document.getElementById("sheetbody").innerHTML=`
    ${peekBlock("Divisional charts","different lenses on the same birth positions")}
    <div>
      <p class="muted" style="margin-bottom:14px">Nothing moves in the sky. Each varga
        divides every 30&#176; sign into finer parts and maps each part to a sign by a
        classical rule, so the same natal longitudes form a new chart read for one
        field of life. The chart above becomes the one you choose.</p>
      ${VARGA_INFO.map(([d,name,sense])=>`
        <button class="vrow${d===uniVarga?" on":""}" data-d="${d}">
          <b>D${d} &#183; ${name}</b><span>${sense}</span>
        </button>`).join("")}
      <p class="note" style="margin-top:12px">These nine are the ones tradition reaches
      for first. Astra computes all sixteen classical vargas (and two extras, labelled as
      such) &#8212; the full directory, with the working shown, is in You &#8594; Birth
      details &#8594; Divisional charts.</p>
    </div>`;
  showSheetPeek(); expandSheet();
  document.getElementById("sheetbody").onclick=e=>{
    const b=e.target.closest(".vrow"); if(!b) return;
    uniVarga=+b.dataset.d; buzz(12);
    resetChart();
    vargaSwitchMotion();
  };
}

/* natal ghosts, shown only in Today mode so "then vs now" is legible */
function paintGhosts(){
  const host=document.getElementById("ghosts"); if(!host) return;
  if(uniMode!=="today"){ host.innerHTML=""; return; }
  const pos=placeByDegree(CHART.placements);
  host.innerHTML=CHART.placements.map(p=>{
    const xy=pos[p.graha]; if(!xy) return "";
    return `<span class="ghost" style="--x:${xy[0]/100};--y:${xy[1]/100};--fill:${COLOUR(p.graha)}"
      title="${p.graha} at birth"></span>`;
  }).join("");
}

function setMode(m){
  if(mode) resetChart();          /* an open house or planet froze the switch */
  uniMode=m; buzz(9);
  document.querySelectorAll("#unimode button").forEach(b=>{
    b.classList.toggle("on", b.dataset.m===m);
    b.setAttribute("aria-selected", String(b.dataset.m===m));
  });
  placeThumb();
  if(m==="today"){ uniDate=dateAtOffset(dayOffset); }
  paintUniverse(false);          /* makes the scrubber visible... */
  if(m==="today") paintRuler();  /* ...so it can be measured and painted now */
  updateScrubLabel();
}

let mode=null,current=null;
const sheet=document.getElementById("sheet"), closeBtn=document.getElementById("close");
/* Layer 1 is the sheet itself, opened at a collapsed detent: one line and
   a drag handle peeking over the chart. Drag or tap up for the reading;
   down again and the chart is back (DDR 0003, amending DDR 0002's pill). */
function showSheetPeek(){
  sheet.classList.add("up","peek"); sheet.scrollTop=0;
  closeBtn.classList.add("on"); buzz(7);
}
function expandSheet(){ sheet.classList.remove("peek"); sheet.scrollTop=0; buzz(7); }
function collapseSheet(){ sheet.classList.add("peek"); sheet.scrollTop=0; buzz(5); }
function hideSheetKeepFocus(){ sheet.classList.remove("up","peek") }
function peekBlock(title,sub){
  return `<button class="grabwrap" id="grab" aria-label="Expand">
      <span class="grabber" aria-hidden="true"></span>
      <span class="peekline"><b>${title}</b><i>${sub}</i></span>
    </button>`;
}
(()=>{  /* the handle: tap toggles, a vertical drag decides by direction */
  let y0=null;
  sheet.addEventListener("pointerdown",e=>{
    const g=e.target.closest(".grabwrap"); if(!g){y0=null;return}
    y0=e.clientY;
  });
  sheet.addEventListener("pointerup",e=>{
    if(y0===null) return;
    const dy=e.clientY-y0; y0=null;
    const peek=sheet.classList.contains("peek");
    if(Math.abs(dy)<14){ peek?expandSheet():collapseSheet(); return; }  /* tap */
    if(dy<-24 && peek) expandSheet();
    else if(dy>24){ if(peek){resetChart()} else collapseSheet(); }
  });
})();
const qa=s=>Array.from(document.querySelectorAll(s));

function clearMarks(){
  qa(".hs").forEach(e=>e.classList.remove("sel","lit","dim"));
  qa(".sn").forEach(e=>e.classList.remove("sel","dim"));
  qa(".p").forEach(e=>{
    e.classList.remove("dim","hidden","recede","focus");
    e.style.transform=""; e.style.zIndex="";
  });
  document.getElementById("asp").innerHTML="";
}
/* ---- OPTION B (Sangram, 31 Aug): house/planet READINGS are page
   content. The chart shrinks and pins to the top - alive, tappable -
   while the reading flows beneath in the page's own scroll. One
   scroll, no drawer physics. The sheet stays for pickers (vargas,
   yogas, Pro) where a transient overlay is the right shape.
   Amends DDR 0003's sheet ladder for readings - founder-approved. */
function setReading(html){
  const pg=document.getElementById("pg-universe");
  const r=document.getElementById("reading");
  if(!pg||!r) return;
  r.innerHTML=html; r.hidden=false;
  pg.classList.add("compact");
  closeBtn.classList.add("on");
  pg.scrollTop=0;
}
function clearReading(){
  const pg=document.getElementById("pg-universe");
  const r=document.getElementById("reading");
  if(r){ r.hidden=true; r.innerHTML=""; }
  pg?.classList.remove("compact");
}
/* the reading hosts the same interactive content the sheet carried -
   mirror its delegated clicks */
function readingClicks(e){
  const sw=e.target.closest("#psheetseg button[data-w]");
  if(sw){
    const seg=sw.closest("#psheetseg");
    seg.querySelectorAll("button").forEach(b=>b.classList.toggle("on",b===sw));
    setThumb(seg,false); buzz(5);
    document.querySelectorAll("#reading .modeblk").forEach(b=>
      b.hidden = b.dataset.w!==sw.dataset.w);
    return;
  }
  const a=e.target.closest(".askastra");
  if(a){ buzz(9); askAstra(a.dataset.q); return; }
  const f=e.target.closest(".findsky");
  if(f){ buzz(8); openSkyPanel(f.dataset.g); }
}

function resetChart(){
  mode=null;current=null;clearMarks();clearReading();
  const st=document.getElementById("stage"),ob=document.getElementById("orbit");
  if(st)st.classList.remove("pmode");
  if(ob){ob.style.transform="";ob.style.transformOrigin="50% 50%"}
  const pl=document.getElementById("plane");
  if(pl){pl.style.transform="";pl.style.transformOrigin="50% 50%"}
  qa(".p").forEach(b=>{b.style.transform="";b.style.zIndex=""});
  sheet.classList.remove("up","peek"); closeBtn.classList.remove("on");
  document.getElementById("pg-universe").classList.remove("zoomed");
}
function showSheet(){
  sheet.classList.add("up"); sheet.scrollTop=0; closeBtn.classList.add("on"); sheet.scrollTop=0;
  document.getElementById("pg-universe").classList.add("zoomed");
}

function openHouse(h){
  if(mode==="house"&&current===h)return;
  mode="house";current=h;clearMarks();buzz(9);
  /* The chart leans toward the touched house but never leaves the frame:
     every other house stays visible and tappable, so the user can move
     from one house straight to the next (CLAUDE.md 34, 79, 130). */
  const a=ANCHOR[h],k=1.16;
  const t=`translate(${(50-a[0])*.22}%, ${(42-a[1])*.22}%) scale(${k})`;
  for(const id of ["orbit","plane"]){
    const n=document.getElementById(id);
    n.style.transformOrigin="50% 50%"; n.style.transform=t;
  }
  qa(".hs").forEach(e=>e.classList.add(+e.dataset.h===h?"sel":"dim"));
  qa(".sn").forEach(e=>e.classList.add(+e.dataset.h===h?"sel":"dim"));
  uniPlacements().forEach(p=>{if(p.house!==h)PEL[p.graha].classList.add("dim")});
  if(uniMode==="birth"&&uniVarga>1) sheetVargaHouse(h); else sheetHouse(h);
}

/* Compact sheets for taps while a divisional chart is showing: the
   natal sheets describe the rashi chart and would contradict the
   varga on screen, so the varga lens gets its own honest, smaller
   reading (full prose stays with D1). */
function sheetVargaHouse(h){
  const vi=VARGA_INFO.find(v=>v[0]===uniVarga);
  const v=vargaView(); if(!v||!vi) return sheetHouse(h);
  const sg=((v.lagna-1+h-1)%12)+1;
  const occ=uniPlacements().filter(p=>p.house===h).map(p=>p.graha);
  setReading(`
    <div class="eyebrow">House ${h} &#183; ${vi[1]} (D${uniVarga}) &#183; ${SIGNS[sg-1]}</div>
    <div>
      ${rows([["Sign",SIGNS[sg-1]],["Lord",SIGN_LORD[sg]],
        ["Occupants",occ.length?occ.join(", "):"&#8212;"]])}
      <p class="interp" style="margin-top:12px">The ${vi[1]} is traditionally read for
        ${vi[2]}. This is its ${ordinal(h)} house, counted from the ${vi[1]} lagna.${
        occ.length?` A graha seated here &#8212; ${occ.join(", ")} &#8212; is read with
        particular weight in that field.`:""}</p>
      <p class="note">The full natal reading lives on the Rashi (D1) chart; divisional
        placements refine it, they don&#8217;t replace it.</p>
    </div>`);
}
function sheetVargaPlanet(p){
  const vi=VARGA_INFO.find(v=>v[0]===uniVarga);
  const natal=CHART.get(p.graha);
  const votta=uniVarga===9&&p.sign===natal.sign;
  setReading(`
    <div class="eyebrow">${p.graha} in the ${vi[1]} &#183; ${SIGNS[p.sign-1]} &#183; ${ordinal(p.house)} house</div>
    <div>
      ${rows([[`D${uniVarga} seat`,`${SIGNS[p.sign-1]} &#183; ${ordinal(p.house)} house`],
        ["Natal (D1) seat",`${SIGNS[natal.sign-1]} &#183; ${ordinal(natal.house)} house`],
        ...(uniVarga===9?[["Vargottama",votta?"yes &#8212; same sign in D1 and D9":"no"]]:[])])}
      <p class="interp" style="margin-top:12px">The ${vi[1]} is traditionally read for
        ${vi[2]}; a graha&#8217;s seat here is its footing in that field.${
        votta?" A vargottama seat &#8212; the same sign in both charts &#8212; is traditionally read as steadier and more fully itself.":""}</p>
      <p class="note">Tap ${p.graha} on the Rashi (D1) chart for its full reading.</p>
    </div>`);
}

function openPlanet(g,opts={}){
  if(mode==="planet"&&current===g && !opts.sub)return;
  const list=uniPlacements();                  /* the placements ON SCREEN */
  const p=list.find(x=>x.graha===g)||CHART.get(g);
  mode="planet";current=g;clearMarks();buzz(12);
  document.getElementById("stage").classList.add("pmode");
  const b=PEL[g],[px,py]=b._pos,T=[.5,.26];
  b.classList.add("focus"); b.style.zIndex=40;
  const st=document.getElementById("stage").getBoundingClientRect();
  b.style.transform=`translate(${((T[0]-px)*st.width).toFixed(1)}px, ${((T[1]-py)*st.height).toFixed(1)}px) scale(2.3)`;
  list.forEach(o=>{if(o.graha!==g)PEL[o.graha].classList.add("recede")});
  qa(".hs").forEach(e=>e.classList.add(+e.dataset.h===p.house?"lit":"dim"));
  qa(".sn").forEach(e=>{if(+e.dataset.h!==p.house)e.classList.add("dim")});
  const vargaLens=uniMode==="birth"&&uniVarga>1;
  /* natal drishti lines belong to the rashi chart - drawing them over
     a varga would point at the wrong houses */
  if(!vargaLens) drawAspects(CHART.get(g)||p);
  if(vargaLens) sheetVargaPlanet(p); else sheetPlanet(p,opts);
  requestAnimationFrame(()=>setThumb(document.getElementById("psheetseg"),true));
}
const cap=t=>t.charAt(0).toUpperCase()+t.slice(1)

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
  setReading(`
    <div class="eyebrow">${locator(h)}${ordinal(h)} house &#183; ${sk} Bhava &#183; ${SIGNS_SK[sg-1]} rashi</div>
    <h1 style="font-size:26px">${head}</h1>
    <p class="muted" style="margin:0 0 14px">${body}</p>
    <p class="lordline">Sign <b>${sg}</b> (${SIGNS[sg-1]}) &#183; ruled by ${gIcon(lord,17)}<b>${lord}</b>, which sits in the <b>${ordinal(lp.house)}</b></p>
    ${(()=>{ const b=engine().sav[sg-1];
      const read=b>=30?"well supported in the bindu count":b<=25?"leaner in the bindu count &#8212; matters here ask for more deliberate effort":"middling in the bindu count";
      return `<p class="ameta" style="margin:2px 0 12px">Ashtakavarga: <b>${b}</b> of 337
        bindus fall in ${SIGNS[sg-1]} &#8212; ${read} (the average sign carries 28).</p>`})()}
    ${rows([
      ["Sign",`${SIGNS[sg-1]} (${sg})`],
      ["At your birth",occ.length?occ.map(o=>`${gIcon(o.graha,16)}${o.graha}`).join("&nbsp; "):"&#8212;"],
      ["Passing through now",(()=>{const nowOcc=uniPlacements().filter(q=>q.house===h);
        return nowOcc.length?nowOcc.map(o=>`${gIcon(o.graha,16)}${o.graha}`).join("&nbsp; "):"&#8212;"})()],
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
    <button class="askastra" data-q="What should I know about my ${ordinal(h)} house?">
      <span class="orbdot" aria-hidden="true"></span>
      Ask Astra about your ${ordinal(h)} house</button>
    <p class="note">Traditional readings for this configuration. Not a prediction.</p>`);
}

function sheetPlanet(p,opts){
  const g=p.graha, natal=CHART.get(g);
  const ruled=CHART.housesRuled(g), conj=CHART.conjunct(g);
  const now=CHART.dasha.at(new Date());
  const transiting = uniMode==="today";
  setReading(`
    <div class="sheethead">
      <img class="sheetart" src="assets/graha/${g.toLowerCase()}.png" alt="" draggable="false">
      <div><div class="eyebrow" style="margin-bottom:3px">${SK[g]}${shadow(g)?" &#183; chhaya graha":""}</div>
        <h1 style="font-size:26px;margin:0">${g} in your ${ordinal(p.house)}</h1></div>
    </div>
    <div class="tbseg subseg sheetseg" id="psheetseg" role="tablist">
      <span class="thumb" aria-hidden="true"></span>
      <button class="${transiting?"":"on"}" data-w="birth" role="tab">At your birth</button>
      <button class="${transiting?"on":""}" data-w="today" role="tab">Now</button>
    </div>
    <div class="modeblk" data-w="birth" ${transiting?"hidden":""}>
      <p class="lordline">Born with ${g} in <b>${SIGNS[natal.sign-1]}</b>, your
        <b>${ordinal(natal.house)}</b> &#183; ${natal.degf}
        ${natal.retro&&!shadow(g)?" &#183; retrograde":""}${natal.dig?` &#183; ${natal.dig.toLowerCase()}`:""}</p>
      <p class="ameta" style="margin:0 0 12px">${natal.nak} nakshatra &#183; pada ${natal.pada}</p>
    </div>
    <div class="modeblk" data-w="today" ${transiting?"":"hidden"}>
      <p class="lordline">${isToday(uniDate)?"Right now":"On this date"} &#8212; passing through
        <b>${SIGNS[p.sign-1]}</b>, your <b>${ordinal(p.house)}</b>
        ${p.degf?` &#183; ${p.degf}`:""}${p.retro&&!shadow(g)?" &#183; retrograde":""}</p>
      <p class="ameta" style="margin:0 0 12px">${p.nak||""}${p.pada?` nakshatra &#183; pada ${p.pada}`:""}
        &#183; at birth: ${SIGNS[natal.sign-1]}, your ${ordinal(natal.house)}</p>
    </div>

    <div class="eyebrow" style="margin:16px 0 7px">What it means</div>
    <p class="interp">${GRAHA_MEANING[g].body}</p>

    <div class="eyebrow" style="margin:20px 0 7px">In your chart</div>
    <p class="interp">${PLANET_STORY[g].inHouse[natal.house]}</p>
    <p class="interp">${ruled.length
        ? `It rules your <b>${ruled.map(ordinal).join(" and ")}</b>, so ${ruled.map(h=>HOUSE_ADVICE[h][0]).join(" and ")} answer to it.`
        : `It owns no sign, so it is read through the house it occupies and the grahas it sits with.`}
      ${natal.dig?` It is <b>${natal.dig.toLowerCase()}</b> here.`:""}${natal.retro&&!shadow(g)?" It was <b>retrograde</b> at your birth &#8212; its themes turn inward, or come back for a second pass.":""}</p>

    ${(()=>{ /* the deeper charts + the yogas this graha takes part in -
                straight from the validated engine (30 Aug) */
      const E=engine();
      const d9=E.varga(9)[g], d10=E.varga(10)[g];
      const yg=E.yogas.filter(y=>y.planets&&y.planets.includes(g));
      return `
      <div class="eyebrow" style="margin:20px 0 7px">In the deeper charts</div>
      <p class="interp tech">In the <b>navamsa (D9)</b> &#8212; the chart read for marriage and
        inner strength &#8212; your ${g} sits in <b>${d9?SIGNS[d9-1]:"&#8212;"}</b>.
        In the <b>dashamsa (D10)</b> &#8212; career and public work &#8212; in
        <b>${d10?SIGNS[d10-1]:"&#8212;"}</b>.${(()=>{
          if(!E.sb||!E.sb.grahas[g]) return "";
          const rank=Object.entries(E.sb.grahas).sort((a,b)=>b[1].rupas-a[1].rupas)
            .findIndex(([k])=>k===g)+1;
          const say=rank===1?"the strongest of the seven":rank===7?"the leanest of the seven"
            :`${ordinal(rank)} of the seven by strength`;
          return ` By shadbala it carries <b>${E.sb.grahas[g].rupas.toFixed(1)} rupas</b>
            &#8212; ${say}.`})()}</p>
      ${yg.length?`
      <div class="eyebrow" style="margin:20px 0 7px">Yogas it takes part in</div>
      ${yg.map(y=>`<p class="interp"><b>${y.name}</b>${y.strength?` <span class="ameta">&#183; ${y.strength}</span>`:""}
        &#8212; ${y.because}</p>`).join("")}`:""}`;
    })()}
    ${conj.length?`<p class="interp">It shares the sign with <b>${conj.join(" and ")}</b>; their significations blend.</p>`:""}
    ${now.maha.lord===g?`<p class="interp brass">You are living its mahadasha right now &#8212; this graha governs the present period.</p>`
      :now.antar.lord===g?`<p class="interp brass">It rules the current antardasha &#8212; the sub-period inside your ${now.maha.lord} years.</p>`:""}

    ${shadow(g)?"":`<button class="findsky" data-g="${g}">
      <svg viewBox="0 0 24 24">
        <path d="M3.5 7V5.4a2 2 0 012-2H7M17 3.4h1.5a2 2 0 012 2V7M20.5 17v1.6a2 2 0 01-2 2H17M7 20.6H5.5a2 2 0 01-2-2V17"/>
        <path d="M12 7.4l3.6 2v5.2l-3.6 2-3.6-2V9.4z"/>
        <path d="M12 12.2l3.6-2.1M12 12.2l-3.6-2.1M12 12.2v4.4"/></svg>
      Find ${g} in the sky
      <span class="fschev">&#8250;</span></button>
    <div class="skypanel" id="skypanel" hidden></div>`}
    <button class="askastra" data-q="Why is ${g} important in my life right now?">
      <span class="orbdot" aria-hidden="true"></span>
      Ask Astra &#8212; &#8220;Why is ${g} important in my life?&#8221;</button>

    <details class="adv">
      <summary>The technical placement</summary>
      ${rows([
        ["Sign",`${SIGNS[natal.sign-1]} (${natal.sign})`],
        ["Degree",natal.degf],
        ["Nakshatra",`${natal.nak} &#183; pada ${natal.pada}`],
        ["Motion",natal.retro?(shadow(g)?"Retrograde (always)":"Retrograde"):"Direct"],
        ["Dignity",natal.dig||"&#8212;"],
        ["Conjunct",conj.length?conj.join(", "):"&#8212;"],
        ["Aspects",CHART.aspectedBy(g).map(ordinal).join(", ")],
        ["Natural karaka",KARAKA[g]]
      ])}
    </details>
    <p class="note">Traditional readings for this placement. Not a prediction.</p>`);
}

/* the transparent gap shows the chart; a tap there should reach it, but the
   panel still has to own scrolling - so forward the hit by hand */
document.querySelector(".sheetgap").addEventListener("click",e=>{
  /* The panel sits over the chart so it can scroll. Taps landing on the
     transparent gap are handed to whatever house or graha is beneath. */
  const stack=document.elementsFromPoint(e.clientX,e.clientY);
  const hit=stack.find(n=>n.classList &&
    (n.classList.contains("hs") || n.classList.contains("p") || n.dataset?.g));
  if(!hit){ resetChart(); return; }
  if(hit.classList.contains("hs")) openHouse(+hit.dataset.h);
  else {
    const btn=hit.closest(".p");
    if(btn) openPlanet(btn.dataset.g); else resetChart();
  }
});
closeBtn.onclick=()=>{
  if(sheet.classList.contains("up") && !sheet.classList.contains("peek")) collapseSheet();
  else resetChart();
};
document.addEventListener("keydown",e=>{ if(e.key!=="Escape") return;
  const top=NAV.stack.filter(x=>x.ov.isConnected).pop();
  if(top){ if(history.state&&history.state.astra===top.token) history.back(); else { NAV.closing=true; try{top.closeFn();}finally{NAV.closing=false;} } return; }
  resetChart(); });
sheet.addEventListener("click",e=>{
  const sw=e.target.closest("#psheetseg button[data-w]");
  if(sw){
    const seg=sw.closest("#psheetseg");
    seg.querySelectorAll("button").forEach(b=>b.classList.toggle("on",b===sw));
    setThumb(seg,false); buzz(5);
    document.querySelectorAll("#sheetbody .modeblk").forEach(b=>
      b.hidden = b.dataset.w!==sw.dataset.w);
  }
  const a=e.target.closest(".askastra");
  if(a){ buzz(9); askAstra(a.dataset.q); }
  const f=e.target.closest(".findsky");
  if(f){ buzz(8); openSkyPanel(f.dataset.g); }
  e.stopPropagation();
});

/* ---- Find in sky: sensors point you at the graha (DDR 0003 §5) ---- */
let skyWatch=null;
/* the active user's birth moment, packaged for the sky view's Birth mode */
const skyBirthOpts=()=>{
  const natal=Object.fromEntries(CHART.placements.map(p=>[p.graha,p.L]));
  const tz=(ACTIVE.p&&ACTIVE.p.tz)||"Asia/Kolkata";
  const date=ACTIVE.p?new Date(ACTIVE.p.born):BIRTH;
  let off=5.5; try{ off=utcFromLocalTzOffset(tz,date.getTime()); }catch(_){}
  return ACTIVE.p
    ? {date:date.toISOString(), tz, off,
       lat:ACTIVE.p.lat??BIRTHPLACE.lat, lon:ACTIVE.p.lon??BIRTHPLACE.lon,
       place:(ACTIVE.p.place||BIRTHPLACE.name).split(",")[0],
       name:ACTIVE.first, self:!!ACTIVE.p.me, natal,
       asc:CHART.ascendant, sign:SIGNS_SK[CHART.lagna-1], lagna:CHART.lagna}
    : {date:date.toISOString(), tz, off, lat:BIRTHPLACE.lat, lon:BIRTHPLACE.lon,
       place:BIRTHPLACE.name.split(",")[0], name:"you", self:true, natal,
       asc:CHART.ascendant, sign:SIGNS_SK[CHART.lagna-1], lagna:CHART.lagna};
};
/* hours offset of a zone at an instant, via Intl */
function utcFromLocalTzOffset(tz,ms){
  const f=new Intl.DateTimeFormat("en-US",{timeZone:tz,hour12:false,year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric"});
  const m={}; for(const p of f.formatToParts(new Date(ms))) m[p.type]=p.value;
  return (Date.UTC(m.year,m.month-1,m.day,m.hour%24,m.minute,m.second)-Math.floor(ms/1000)*1000)/36e5;
}

/* motion permission, synchronously inside a user gesture. Resolves true
   when sensors may be armed, false when iOS wants a fresh tap later. */
function askMotion(){
  if(typeof DeviceOrientationEvent==="undefined"
     || typeof DeviceOrientationEvent.requestPermission!=="function")
    return Promise.resolve(true);          /* non-iOS: no gate */
  return DeviceOrientationEvent.requestPermission()
    .then(r=>r==="granted").catch(()=>false);
}

function getSpot(){                       /* quick fix, honest fallback */
  return new Promise(res=>{
    let done=false;
    const fallback=()=>{ if(!done){done=true;
      res({lat:BIRTHPLACE.lat, lon:BIRTHPLACE.lon, from:BIRTHPLACE.name+" (approximate)"});}};
    if(!navigator.geolocation) return fallback();
    const t=setTimeout(fallback,3500);
    navigator.geolocation.getCurrentPosition(
      p=>{ if(!done){done=true; clearTimeout(t);
        try{localStorage.setItem("astro.geo",JSON.stringify(
          {lat:p.coords.latitude,lon:p.coords.longitude,t:Date.now()}))}catch(_){}
        res({lat:p.coords.latitude, lon:p.coords.longitude, from:"your location"});}},
      fallback, {maximumAge:600000, timeout:3000});
  });
}
async function openSkyPanel(g){
  const panel=document.getElementById("skypanel"); if(!panel) return;
  panel.hidden=false;
  panel.innerHTML=`<p class="skyline">Finding ${g}&#8230;</p>`;
  const spot=await getSpot();
  const w=whereIs(g, new Date(), spot.lat, spot.lon);
  const hint=riseSetHint(g, new Date(), spot.lat, spot.lon);
  const height = w.alt>60?"nearly overhead" : w.alt>35?"high up"
    : w.alt>15?"halfway up" : w.alt>0?"low, near the horizon" : "below the horizon";
  panel.innerHTML=`
    <div class="skyfacts">
      <div class="skyarrow" id="skyarrow" style="--az:${Math.round(w.az)}deg">
        <svg viewBox="0 0 24 24"><path d="M12 3l5 14-5-3.4L7 17z"/></svg>
      </div>
      <div>
        <b>${w.up?`Look ${w.compass}, ${height}`:`${g} is below the horizon`}</b>
        <span>${hint} &#183; computed for ${spot.from}</span>
        <span id="skyorient">${w.up?"Point your phone and the arrow turns with you.":""}</span>
      </div>
    </div>
    <button class="askastra" id="opensky">
      <svg class="ico" viewBox="0 0 24 24" aria-hidden="true" style="width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round">
        <path d="M3.5 7V5.4a2 2 0 012-2H7M17 3.4h1.5a2 2 0 012 2V7M20.5 17v1.6a2 2 0 01-2 2H17M7 20.6H5.5a2 2 0 01-2-2V17"/>
        <path d="M12 7.4l3.6 2v5.2l-3.6 2-3.6-2V9.4z"/>
        <path d="M12 12.2l3.6-2.1M12 12.2l-3.6-2.1M12 12.2v4.4"/></svg>
      Open the sky &#8212; see ${g} among the rashis</button>`;
  document.getElementById("opensky").onclick=()=>{buzz(9);
    const motion=askMotion();
    motion.then(m=>openSkyView({...spot, focus:g, motion:m,
      pro:isPro(), birth:skyBirthOpts()}));};
  if(!w.up) return;
  /* iOS wants a user-gesture permission request; this tap was one */
  const arm=()=>{
    if(skyWatch) removeEventListener("deviceorientationabsolute",skyWatch),
                 removeEventListener("deviceorientation",skyWatch);
    skyWatch=ev=>{
      const heading = ev.webkitCompassHeading!=null ? ev.webkitCompassHeading
        : (ev.absolute && ev.alpha!=null ? 360-ev.alpha : null);
      const n=document.getElementById("skyarrow");
      if(n && heading!=null) n.style.setProperty("--turn",(w.az-heading)+"deg");
    };
    addEventListener("deviceorientationabsolute",skyWatch);
    addEventListener("deviceorientation",skyWatch);
  };
  if(typeof DeviceOrientationEvent!=="undefined" &&
     typeof DeviceOrientationEvent.requestPermission==="function"){
    DeviceOrientationEvent.requestPermission().then(r=>{ if(r==="granted") arm();
      else{const o=document.getElementById("skyorient");
        if(o) o.textContent="Compass permission declined - the arrow shows map north.";}
    }).catch(()=>{});
  } else arm();
}
function askAstra(q){
  resetChart(); go(3);
  const inp=document.getElementById("cmpin");
  if(inp){ inp.value=q; inp.focus(); }
}

/* &#9552;&#9552;&#9552; GUIDE &#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552; */
const ASKS=[
  {q:"What does Saturn mean in my chart?",
   a:()=>describe("Saturn"),
   chips:()=>[chipPlanet("Saturn"), chipHouse(CHART.get("Saturn").house)],
   act:()=>{go(CHART_INDEX);setTimeout(()=>openPlanet("Saturn"),340)}},
  {q:"What period am I in?",
   a:()=>{const n=CHART.dasha.at(new Date());
     return `A <b>${n.maha.lord} mahadasha</b> with <b>${n.antar.lord} antardasha</b>. The sequence started from your Moon in ${CHART.get("Moon").nak} &#8212; that nakshatra alone fixes both the order and the starting point.`},
   chips:()=>[chipTimeline(), chipPlanet(CHART.dasha.at(new Date()).maha.lord)],
   act:()=>{go(TIMELINE_INDEX);setTimeout(renderTimelineTab,340)}},
  {q:"Explain my seventh house.",
   a:()=>{const sg=CHART.signOfHouse(7),l=SIGN_LORD[sg];
     return `Your 7th carries <b>${SIGNS[sg-1]}</b>, ruled by ${l}, which sits in your ${ordinal(CHART.get(l).house)}. Marriage and partnership are therefore read through where ${l} landed, not through the 7th alone.`},
   chips:()=>[chipHouse(7), chipPlanet(SIGN_LORD[CHART.signOfHouse(7)])],
   act:()=>{go(CHART_INDEX);setTimeout(()=>openHouse(7),340)}},
  {q:"Tell me about Jupiter.",
   a:()=>describe("Jupiter"),
   chips:()=>[chipPlanet("Jupiter"), chipHouse(CHART.get("Jupiter").house)],
   act:()=>{go(CHART_INDEX);setTimeout(()=>openPlanet("Jupiter"),340)}}
];

/* entity chips: Astra's replies point at the objects they talk about, and
   the objects open - not links in prose, the chart itself (DDR 0003 §4) */
const chipPlanet=g=>({t:`${gIcon(g,15)}${g}`,
  act:()=>{go(CHART_INDEX);setTimeout(()=>openPlanet(g),340)}});
const chipHouse=h=>({t:`${ordinal(h)} house`,
  act:()=>{go(CHART_INDEX);setTimeout(()=>openHouse(h),340)}});
const chipTimeline=()=>({t:"Timeline",
  act:()=>{go(TIMELINE_INDEX)}});


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

let CHIP_ACTS=[];
function astraCard(text,chips){
  const list=typeof chips==="function"?chips():(chips||[]);
  const idx=list.map(c=>{CHIP_ACTS.push(c.act); return CHIP_ACTS.length-1});
  return `<div class="astrareply">
    <div class="astrahead"><span class="orbdot" aria-hidden="true"></span>Astra</div>
    <div class="astratext">${text}</div>
    ${list.length?`<div class="chiprow">${list.map((c,i)=>
      `<button class="entchip" data-ca="${idx[i]}">${c.t}</button>`).join("")}</div>`:""}
  </div>`;
}
function wireChips(scope){
  (scope||document).querySelectorAll(".entchip").forEach(b=>b.onclick=()=>{
    buzz(8); const f=CHIP_ACTS[+b.dataset.ca]; if(f) f();
  });
}

/* ===================================================================
   GUIDE — the conversational interface to Astra (Guide-tab spec).
   Talk to your Kundali: full-screen warm-light room, a living Moon as
   the conversational object, one continuous conversation, structured
   navigation actions, incognito, and a prototype voice loop.

   The brain is Astra's own server (Supabase edge fn) holding the API
   key and daily caps; the client sends the conversation plus
   engine-computed facts. The model explains, it never calculates.
   The anon key below is public by design - it only marks requests as
   coming from Astra's frontend.
   =================================================================== */
const GUIDE_URL="https://zjrhtmeyqogriucqkwlq.supabase.co/functions/v1/guide";
const GUIDE_ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpqcmh0bWV5cW9ncml1Y3Frd2xxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMTgzNzEsImV4cCI6MjEwMzc5NDM3MX0.DLp2GtNvPnxv8De3cWwkuWN2yb2KQ5lmrtUP1wqy4S8";

const escText=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* one continuous conversation per profile (spec 5), persisted -
   except in incognito, where the session lives only in memory (7-8) */
/* language choice (Dad's suggestion, 1 Sep): honored by Guide's text
   and voice today; full app translation arrives with the iOS build */
const LANG_OPTS=[["en","English"],["hi","&#2361;&#2367;&#2344;&#2381;&#2342;&#2368;"],["mix","Hinglish"]];
const langName=()=>({en:"English",
  hi:"Hindi, written in Devanagari",
  mix:"Hinglish - a natural conversational Hindi-English mix written in Latin script"}
  [PREFS().lang||"en"]);

const GUIDE_KEY=()=>"astro.guide."+(ACTIVE.p?ACTIVE.name:"me");
let GUIDE={msgs:[],incognito:false,snapshot:null,busy:false};
let GUIDE_SEED=null;
function guideLoad(){
  try{GUIDE.msgs=JSON.parse(localStorage.getItem(GUIDE_KEY())||"[]")}catch(_){GUIDE.msgs=[]}
}
function guideSave(){
  if(GUIDE.incognito) return;
  try{localStorage.setItem(GUIDE_KEY(),JSON.stringify(GUIDE.msgs.slice(-200)))}catch(_){}
}
function guideExit(){
  /* leaving the room. Incognito discards the session and switches off
     (spec 8/73); the stored history returns untouched. */
  voiceStop(true);
  if(GUIDE.incognito){
    GUIDE.msgs=GUIDE.snapshot||[]; GUIDE.snapshot=null; GUIDE.incognito=false;
  }
}

/* layer B lite: a rolling list of what was recently discussed, sent as
   context so dropped turns aren't forgotten wholesale (spec 6) */
function guideTopics(){
  return GUIDE.msgs.filter(m=>m.role==="user").slice(0,-1).slice(-8)
    .map(m=>m.content.slice(0,70));
}

function guideFacts(){
  const F=dayFacts(viewDate), now=CHART.dasha.at(new Date());
  const p3=now?pratAt(new Date(),now):null;
  const sati=satiAt(new Date());
  const natal={};
  for(const p of CHART.placements)
    natal[p.graha]={sign:SIGNS[p.sign-1],house:p.house,deg:p.degf,nakshatra:p.nak,
      pada:p.pada,retrograde:!!p.retro,dignity:p.dig||undefined};
  const facts={
    name:ACTIVE.first||ACTIVE.name||"the user",
    lagna:SIGNS[CHART.lagna-1],
    today:new Date().toDateString(),
    selectedDate:viewDate.toDateString(),
    natal,
    dasha:now?{mahadasha:{lord:now.maha.lord,start:fmtDate(now.maha.start),end:fmtDate(now.maha.end)},
      antardasha:{lord:now.antar.lord,start:fmtDate(now.antar.start),end:fmtDate(now.antar.end)},
      pratyantardasha:p3?{lord:p3.lord,start:fmtDate(p3.start),end:fmtDate(p3.end)}:undefined}:null,
    sadeSati:sati?{phase:sati.ph.phase,until:fmtDate(sati.ph.end)}:"not active",
    transits:F.sky.map(s=>({graha:s.graha,sign:SIGNS[s.sign-1],house:s.house,
      retrograde:!!s.retro,supportive:!!s.favourable})),
    recentTopics:guideTopics(),
    replyLanguage:langName()
  };
  if(GUIDE_SEED&&GUIDE_SEED.ctx) facts.invocation=GUIDE_SEED.ctx;
  return facts;
}

/* ---- structured navigation actions (spec 40-42): the model appends
   one @@ACTIONS [...]@@ line; everything is validated against this
   allow-list before a single chip is drawn. ---- */
const G9=["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"];
const normG=s=>G9.find(g=>g.toLowerCase()===String(s||"").toLowerCase())||null;
function parseActions(text){
  const m=text.match(/@@ACTIONS\s*(\[[\s\S]*?\])\s*@@/);
  if(!m) return {text:text.trim(),actions:[]};
  let acts=[]; try{acts=JSON.parse(m[1])}catch(_){acts=[]}
  if(!Array.isArray(acts)) acts=[];
  acts=acts.filter(a=>a&&typeof a==="object").map(a=>{
    switch(a.action){
      case "focus_planet": case "open_sky":{
        const g=normG(a.planet); return g?{action:a.action,planet:g,
          mode:a.mode==="birth"?"birth":"today"}:null;}
      case "focus_house":{const h=+a.house;
        return h>=1&&h<=12?{action:"focus_house",house:h,
          mode:a.mode==="birth"?"birth":"today"}:null;}
      case "open_timeline": return {action:"open_timeline"};
      case "open_sade_sati": return {action:"open_sade_sati"};
      case "suggest_life_event":
        if(GUIDE.incognito) return null;      /* spec 46/49: never in incognito */
        return (a.title&&/^\d{4}-\d{2}-\d{2}$/.test(a.date||""))
          ?{action:"suggest_life_event",title:String(a.title).slice(0,60),date:a.date}:null;
      default: return null;
    }
  }).filter(Boolean).slice(0,3);
  return {text:text.replace(m[0],"").trim(),actions:acts};
}
function evidLine(g,modeK){
  try{
    if(modeK==="birth"){ const p=CHART.get(g); return `${SIGNS[p.sign-1]} · your ${ordinal(p.house)} house at birth`; }
    const s=dayFacts(new Date()).sky.find(x=>x.graha===g);
    return s?`${SIGNS[s.sign-1]} · your ${ordinal(s.house)} house now${s.retro?" · retrograde":""}`:"";
  }catch(_){ return ""; }
}
function actChips(actions,idx){
  if(!actions||!actions.length) return "";
  const planetActs=actions.filter(a=>a.action==="focus_planet");
  const evids=planetActs.map(a=>`<button class="gevid" data-mi="${idx}" data-ai="${actions.indexOf(a)}">
      <img src="assets/graha/${a.planet.toLowerCase()}.png" alt="">
      <span><b>${a.planet}</b><small>${evidLine(a.planet,a.mode)}</small></span><i>&#8250;</i></button>`).join("");
  const nav=actions.filter(a=>a.action!=="suggest_life_event"&&a.action!=="focus_planet");
  const ev=actions.find(a=>a.action==="suggest_life_event");
  const label=a=>({
    focus_planet:a.mode==="birth"?`See ${a.planet} in birth chart`:`See ${a.planet} on today&#8217;s chart`,
    open_sky:`See ${a.planet} in today&#8217;s sky`,
    open_timeline:"See on Timeline",
    open_sade_sati:"Explore sade sati",
    focus_house:`Open your ${ordinal(a.house)} house`})[a.action];
  return `${evids?`<div class="gevids">${evids}</div>`:""}${nav.length?`<div class="gacts">${nav.map((a,i)=>
      `<button class="gact" data-k="${a.action}${a.action==="focus_planet"?"-"+a.mode:""}" data-mi="${idx}" data-ai="${actions.indexOf(a)}">${label(a)}</button>`).join("")}</div>`:""}
    ${ev?`<div class="gevask">
      <p>Add &#8220;${escText(ev.title)}&#8221; (${fmtDate(new Date(ev.date+"T12:00:00"))}) to your Timeline?</p>
      <button class="gact solid" data-evadd="${idx}">Add to Timeline</button>
      <button class="gact" data-evno="${idx}">Not now</button>
    </div>`:""}`;
}
function runAct(a){
  buzz(9);
  switch(a.action){
    case "focus_planet": go(CHART_INDEX); setMode(a.mode); openPlanet(a.planet); break;
    case "open_sky": openSkyFocused(a.planet); break;
    case "open_timeline": go(TIMELINE_INDEX); break;
    case "open_sade_sati": go(YOU_INDEX); bdTab="sati"; subView="birth"; renderSub(); break;
    case "focus_house": go(CHART_INDEX); setMode(a.mode); openHouse(a.house); break;
  }
}

/* ---- CELESTIAL OBJECT DETAIL: the one entry point for planet and house pages
   (docs/UNIVERSE_OBJECT_SYSTEM_SPEC.md ARCH-01). Old in-page readings remain as
   fallbacks until every kind routes here. ---- */
const SIGNS_DEV=["मेष","वृषभ","मिथुन","कर्क","सिंह","कन्या","तुला","वृश्चिक","धनु","मकर","कुम्भ","मीन"];
const SIGN_LORD_ARR=Array.from({length:12},(_,i)=>SIGN_LORD[i+1]);
function codCtx(){
  return {
    CHART, pairFor, dayFacts, ordinal, fmtDeg, houseClass,
    engine:()=>{ try{ return engine(); }catch(_){ return null; } },
    timingContext:(g,d)=>{ let d3=null, ni=null; try{ d3=engine().d3; }catch(_){}; try{ ni=nextIngressMap(d)[g]||null; }catch(_){}
      let sati=null; try{ if(g==="Saturn") sati=satiAt(d); }catch(_){}
      return timingContext(g,d,{chart:CHART,d3,satiAt:()=>sati,sadeSati:sati,nextIngress:ni}); },
    T:{SIGNS,SIGNS_SK,SIGNS_DEV,SIGN_LORD:SIGN_LORD_ARR,
       BHAVA:BHAVA.map(b=>({head:b[1],body:b[2],name:b[0]})),
       PLANET_STORY:INTERP.PLANET_STORY, GRAHA_MEANING:INTERP.GRAHA_MEANING, GOCHARA_FEEL:INTERP.GOCHARA_FEEL,
       HOUSE_TRANSIT_SENSE:INTERP.HOUSE_TRANSIT_SENSE, HOUSE_STORY:LORE.HOUSE_STORY, GRAHA_IN_SIGN:LORE.GRAHA_IN_SIGN,
       LORD_IN_HOUSE:LORE.LORD_IN_HOUSE, DASHA_THEME},
    nav:{push:navPush,replace:navReplace}, buzz,
    actions:{
      seeOnChart:(g,mode)=>{ closeDetailThen(()=>{ go(CHART_INDEX); setMode(mode==="now"?"today":"birth"); setTimeout(()=>openPlanet(g),260); }); },
      showInSky:(g,mode,at)=>{ closeDetailThen(()=>{ if(mode==="birth") openSkyAt(g,CHART.birthDate,{mode:"birth"}); else openSkyAt(g,at||new Date(),{mode:"now"}); }); },
      askGuide:(q,ctx)=>{ closeDetailThen(()=>askGuide(q,ctx)); },
      openHouse:(h,mode)=>{ closeDetailThen(()=>{ go(CHART_INDEX); setMode(mode==="now"?"today":"birth"); setTimeout(()=>openHouse(h),260); }); },
      show:(k,id,spec)=>{
        if(k==="planet") openObject({kind:"planet",id,mode:spec.mode,at:spec.at,from:"detail",emphasis:spec.emphasis});
        else if(k==="house") openObject({kind:"house",id:+id,mode:spec.mode,at:spec.at,from:"detail",emphasis:spec.emphasis});
        else if(k==="chart") closeDetailThen(()=>{ go(CHART_INDEX); setMode(spec.mode==="now"?"today":"birth"); setTimeout(()=>openPlanet(id),260); });
        else if(k==="sky") closeDetailThen(()=>openSkyAt(id,spec.at||new Date(),{mode:spec.mode==="birth"?"birth":"now"}));
        else if(k==="sign") openObject({kind:"rashi",id:+id,mode:spec.mode,at:spec.at,from:"detail",emphasis:spec.emphasis});
        else if(k==="nak") openObject({kind:"nakshatra",id:+id,mode:spec.mode,at:spec.at,from:"detail",emphasis:spec.emphasis});
        else if(k==="timeline") closeDetailThen(()=>go(TIMELINE_INDEX));
        else if(k==="sati") closeDetailThen(()=>{ go(YOU_INDEX); bdTab="sati"; subView="birth"; renderSub(); });
      }
    }
  };
}
/* leave the page through history so the stack stays true, then act */
function closeDetailThen(fn){
  const top=NAV.stack[NAV.stack.length-1];
  if(top&&top.ov.classList.contains("cod")&&history.state&&history.state.astra===top.token){
    const once=()=>{ removeEventListener("popstate",once); setTimeout(fn,380); };
    addEventListener("popstate",once); history.back();
  } else fn();
}
function openObject(spec){
  /* the NOW column is always a live or pinned instant - never the birth instant, even when
     the page is opened from a birth-mode surface (the birth column has its own source) */
  const at=(spec.mode==="birth"||!spec.at)?new Date():new Date(spec.at);
  return openObjectDetail({...spec,at},codCtx());
}
const rectOrigin=el=>{ if(!el) return null; const r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2,r:Math.max(10,Math.min(r.width,r.height)/2)}; };
addEventListener("astra:open",e=>{ const d=e.detail||{}; if(!d.kind||d.id==null) return; openObject(d); });

/* ---- the living Moon (spec 15-18): real phase art, and its state
   always mirrors actual system state - motion teaches. ---- */
function gMoonState(s){
  VOICE.state=s;
  for(const id of ["gmoon","gvorb"]){
    const m=document.getElementById(id);
    if(m){ m.classList.remove("idle","listening","thinking","speaking"); m.classList.add(s); }
  }
  const cap=document.getElementById("gvstate");
  if(cap) cap.textContent=s==="listening"?"Listening":s==="thinking"?"Thinking":s==="speaking"?"Speaking":(VOICE.muted?"Muted":"");
}

/* adaptive suggestions (spec 11-12) - drawn from the person's actual
   chart state, so Guide visibly already knows the chart */
function guideChips(){
  const out=["What should I focus on today?"];
  const sati=satiAt(new Date());
  if(sati) out.push(`What does my sade sati (${sati.ph.phase.toLowerCase()} phase) mean?`);
  const now=CHART.dasha.at(new Date());
  if(now) out.push(`How is the ${now.antar.lord} antardasha affecting me?`,
    "Explain my current dasha");
  out.push("What does my 7th house say about relationships?",
    "When is a good time to travel?");
  return out.slice(0,6);
}

const daySepLabel=t=>{
  const d=new Date(t), now=new Date();
  const day=x=>new Date(x.getFullYear(),x.getMonth(),x.getDate()).getTime();
  const diff=(day(now)-day(d))/864e5;
  return diff===0?"Today":diff===1?"Yesterday"
    :d.toLocaleDateString("en-GB",{day:"numeric",month:"short"});
};
/* the model writes light markdown; render bold/italic safely after
   escaping, and fold long answers behind "Show more" so the thread
   stays scannable (Sangram's UX reference, 2 Sep) */
function fmtGuide(text){
  return escText(text).split(/\n{2,}/).map(p=>{
    let h=p.replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/(^|[\s(])\*([^*\n]+?)\*(?=[\s).,;:!?]|$)/g,"$1<i>$2</i>");
    h=h.split("\n").map(l=>/^\s*[-•]\s+/.test(l)?"• "+l.replace(/^\s*[-•]\s+/,""):l).join("<br>");
    return `<p>${h}</p>`;
  }).join("");
}
function guideMsgHTML(m,i,prev){
  const sep=(!prev||daySepLabel(prev.t||Date.now())!==daySepLabel(m.t||Date.now()))
    ?`<div class="gsep">${daySepLabel(m.t||Date.now())}</div>`:"";
  if(m.role==="user")
    return `${sep}<div class="bubble me">${escText(m.content)}</div>`;
  const long=m.content.length>520;
  return `${sep}<div class="gasr">
    <div class="astrahead"><span class="orbdot" aria-hidden="true"></span>Astra</div>
    <div class="astratext${long?" clamp":""}">${fmtGuide(m.content)}</div>
    ${long?`<button class="gshowmore">Show more</button>`:""}
    ${m.actions?actChips(m.actions,i):""}
  </div>`;
}

function setGuideBar(){
  setTopBar("Guide",{sub:"Ask your chart",
    actions:`<button class="tb-btn" id="gmenu" aria-label="Guide options">
      <svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/>
      <circle cx="19" cy="12" r="1.7"/></svg></button>
    <button class="tb-btn" id="gclose" aria-label="Close Guide">
      <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>`});
  const c=document.getElementById("gclose");
  if(c) c.onclick=()=>{ buzz(6); go(guideFrom); if(guideFrom===YOU_INDEX) renderYou(); };
  const mn=document.getElementById("gmenu");
  if(mn) mn.onclick=()=>{ buzz(6); toggleGuideMenu(); };
}

function toggleGuideMenu(){
  const old=document.getElementById("gmenusheet");
  if(old){ old.remove(); return; }
  const el=document.createElement("div");
  el.id="gmenusheet"; el.className="gmenusheet";
  el.innerHTML=`
    <button data-g="incog">${GUIDE.incognito?"Turn off Incognito":"Incognito mode"}</button>
    <button data-g="clear">Clear conversation</button>
    <button data-g="privacy">How Guide uses your chart</button>`;
  document.getElementById("pg-guide").appendChild(el);
  el.onclick=e=>{
    const b=e.target.closest("button[data-g]"); if(!b) return;
    el.remove(); buzz(7);
    if(b.dataset.g==="incog"){
      if(!GUIDE.incognito){ GUIDE.snapshot=GUIDE.msgs.slice(); GUIDE.msgs=[]; GUIDE.incognito=true; }
      else { GUIDE.msgs=GUIDE.snapshot||[]; GUIDE.snapshot=null; GUIDE.incognito=false; }
      renderGuide();
    }
    if(b.dataset.g==="clear") guideConfirmClear();
    if(b.dataset.g==="privacy") guidePrivacy();
  };
}
function guideConfirmClear(){
  const el=document.createElement("div");
  el.className="gconfirm";
  el.innerHTML=`<div class="gconfirmcard">
    <b>Clear your Guide conversation?</b>
    <p>Your birth chart and saved astrology data won&#8217;t be affected.</p>
    <div><button data-c="no">Cancel</button><button data-c="yes" class="solid">Clear</button></div>
  </div>`;
  document.getElementById("pg-guide").appendChild(el);
  el.onclick=e=>{
    const b=e.target.closest("button[data-c]");
    if(!b){ if(e.target===el) el.remove(); return; }
    el.remove();
    if(b.dataset.c==="yes"){
      GUIDE.msgs=[]; GUIDE.snapshot=GUIDE.incognito?[]:GUIDE.snapshot;
      try{localStorage.removeItem(GUIDE_KEY())}catch(_){}
      buzz(9); renderGuide();
    }
  };
}
function guidePrivacy(){
  const el=document.createElement("div");
  el.className="gconfirm";
  el.innerHTML=`<div class="gconfirmcard">
    <b>How Guide uses your chart</b>
    <p>Guide is an AI astrology guide. It answers using your saved birth chart,
    current planetary calculations and relevant Timeline information &#8212; computed
    by Astra&#8217;s own engine, never guessed. Incognito conversations aren&#8217;t
    added to your Guide history.</p>
    <div><button data-c="no" class="solid">Done</button></div>
  </div>`;
  document.getElementById("pg-guide").appendChild(el);
  el.onclick=e=>{ if(e.target.closest("button")||e.target===el) el.remove(); };
}

/* cross-tab entry (spec 13-14): other tabs open Guide with a question
   and structured context; nothing has to be retyped */
function askGuide(q,ctx){
  GUIDE_SEED={q,ctx:ctx||null};
  go(3);
}

function renderGuide(){
  setGuideBar();
  if(!isPro()){
    CHIP_ACTS=[];
    const s=ASKS[0];
    document.getElementById("pg-guide").innerHTML=`
      <div class="chatwrap">
        <div class="gmoonwrap"><div class="gmoon idle" id="gmoon">${moonArt(new Date(),84)}</div></div>
        <p class="gsub">Ask about your chart. The answer moves it.</p>
        <div class="chat">
          <div class="bubble me">${s.q}</div>
          ${astraCard(s.a(), s.chips)}
        </div>
        <div class="procard" style="margin-top:20px">
          <div class="prolock" aria-hidden="true"><svg viewBox="0 0 24 24">
            <rect x="5" y="10.5" width="14" height="9.5" rx="2.5"/>
            <path d="M8 10.5V7.5a4 4 0 018 0v3"/></svg></div>
          <h3>Talk to your chart with Astra Pro</h3>
          <p>That answer above came from ${ACTIVE.p?`${ACTIVE.first}&#8217;s`:"your"} real chart
            &#8212; tap its buttons and watch the app move. Pro opens the full conversation,
            voice included.</p>
          <button class="primary" id="prosee2">See Astra Pro</button>
        </div>
      </div>`;
    wireChips(document.getElementById("pg-guide"));
    const b=document.getElementById("prosee2");
    if(b) b.onclick=()=>{buzz(8); openProSheet();};
    GUIDE_SEED=null;
    return;
  }
  if(!GUIDE.incognito&&!GUIDE.msgs.length) guideLoad();
  const empty=!GUIDE.msgs.length;
  const firstRun=(()=>{try{return !localStorage.getItem("astro.guide.seen")}catch(_){return false}})();
  document.getElementById("pg-guide").innerHTML=`
    <div class="chatwrap glight">
      ${GUIDE.incognito?`<div class="gincog"><svg viewBox="0 0 24 24"><path d="M4 14c0-1.5 1-2.5 2.5-2.5h11c1.5 0 2.5 1 2.5 2.5M7 17.5a2.2 2.2 0 104.4 0 2.2 2.2 0 10-4.4 0M12.6 17.5a2.2 2.2 0 104.4 0 2.2 2.2 0 10-4.4 0M6 11l1.4-4.6A2 2 0 019.3 5h5.4a2 2 0 011.9 1.4L18 11"/></svg>Incognito</div>`:""}
      <div class="gmoonwrap${empty?"":" mini"}"><div class="gmoon idle" id="gmoon">${moonArt(new Date(),empty?96:44)}</div></div>
      ${empty?`
        <h2 class="gh1">Ask your chart anything</h2>
        <p class="gsub">${firstRun
          ?"I can explain your Kundali, current transits, dashas, relationships and timing."
          :"Your birth chart, current sky and timeline are already in context."}</p>`:""}
      <div class="chat gchat" id="chat">
        ${GUIDE.msgs.map((m,i)=>guideMsgHTML(m,i,GUIDE.msgs[i-1])).join("")}
      </div>
      <button class="gjump" id="gjump" hidden>Jump to latest</button>
      ${empty?`<div class="gchips" id="gasks">${guideChips().map(q=>
        `<button class="gchip">${q}</button>`).join("")}</div>`:""}
    </div>
    <div class="composer glight" id="gcomposer">
      <div class="cmp-pill">
        <input id="cmpin" placeholder="Ask Astra" aria-label="Message" autocomplete="off">
        <button class="cmp-go" id="cmpgo" aria-label="Talk to Astra">
          <svg class="ico-voice" viewBox="0 0 24 24"><path d="M4.5 10v4M8.25 7v10M12 4.5v15M15.75 8v8M19.5 10.5v3"/></svg>
          <svg class="ico-send" viewBox="0 0 24 24"><path d="M12 19V5M6 11l6-6 6 6"/></svg>
        </button>
      </div>
    </div>
    <div class="gvoice" id="gvoice" hidden>
      <div class="gvstage">
        <div class="gvorb idle" id="gvorb"><img src="assets/moon/phase_15_full_moon.png" alt=""></div>
        <div class="gvstate" id="gvstate" aria-live="polite">Listening</div>
        <div class="gvtranscript" id="gvtranscript"></div>
        <div class="gvreply" id="gvreply"></div>
      </div>
      <div class="gvbar">
        <input id="gvin" class="gvpill" placeholder="Ask Astra" aria-label="Type instead" autocomplete="off">
        <button class="gvround" id="gvmute" aria-label="Mute microphone" aria-pressed="false">
          <svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/>
            <path d="M5.5 11.5a6.5 6.5 0 0013 0M12 18v3"/><path class="slash" d="M4.5 4.5l15 15"/></svg></button>
        <button class="gvround end" id="gvend" aria-label="End voice">
          <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      </div>
    </div>`;
  try{localStorage.setItem("astro.guide.seen","1")}catch(_){}
  const pg=document.getElementById("pg-guide");
  pg.scrollTop=pg.scrollHeight;
  /* reading older messages must never be interrupted (spec 45): new
     replies show a quiet pill instead of yanking the scroll */
  const gj=document.getElementById("gjump");
  pg.onscroll=()=>{ if(gj&&!gj.hidden &&
    pg.scrollHeight-pg.scrollTop-pg.clientHeight<90) gj.hidden=true; };
  if(gj) gj.onclick=()=>{ gj.hidden=true; buzz(5);
    pg.scrollTo({top:pg.scrollHeight,behavior:"smooth"}); };
  const chat=document.getElementById("chat");
  chat.onclick=e=>{
    const sm=e.target.closest(".gshowmore");
    if(sm){ const t=sm.previousElementSibling; t.classList.toggle("clamp"); sm.textContent=t.classList.contains("clamp")?"Show more":"Show less"; buzz(4); return; }
    const ev0=e.target.closest(".gevid[data-ai]");
    if(ev0){ const m=GUIDE.msgs[+ev0.dataset.mi]; const act=m&&m.actions&&m.actions[+ev0.dataset.ai]; if(act) runAct(act); return; }
    const a=e.target.closest(".gact[data-ai]");
    if(a){ const m=GUIDE.msgs[+a.dataset.mi];
      const act=m&&m.actions&&m.actions[+a.dataset.ai];
      if(act) runAct(act); return; }
    const ad=e.target.closest("[data-evadd]");
    if(ad){ const m=GUIDE.msgs[+ad.dataset.evadd];
      const ev=m&&m.actions&&m.actions.find(x=>x.action==="suggest_life_event");
      if(ev){ const l=events(); l.push({t:ev.title,d:ev.date,k:"milestone",f:"neutral"});
        saveEvents(l); buzz(11);
        ad.closest(".gevask").innerHTML=`<p>Saved to your Timeline.</p>`; }
      return; }
    const no=e.target.closest("[data-evno]");
    if(no){ buzz(5); no.closest(".gevask").remove(); }
  };
  const asks=document.getElementById("gasks");
  if(asks) asks.onclick=e=>{
    const b=e.target.closest(".gchip"); if(!b) return;
    buzz(6); guideSend(b.textContent);
  };
  const inp=document.getElementById("cmpin"), goB=document.getElementById("cmpgo");
  /* one round button: voice when the field is empty, send once you type */
  const swap=()=>{ const has=!!inp.value.trim();
    goB.classList.toggle("has",has);
    goB.setAttribute("aria-label",has?"Send":"Talk to Astra"); };
  inp.oninput=swap;
  inp.onkeydown=e=>{
    if(e.key==="Enter"&&inp.value.trim()){
      const q=inp.value.trim(); inp.value=""; swap(); guideSend(q);
    }
  };
  goB.onclick=()=>{
    if(inp.value.trim()){ const q=inp.value.trim(); inp.value=""; swap(); buzz(6); guideSend(q); }
    else voiceStart();
  };
  document.getElementById("gvmute").onclick=voiceMuteToggle;
  document.getElementById("gvend").onclick=()=>voiceStop();
  const gvin=document.getElementById("gvin");
  gvin.onkeydown=e=>{
    if(e.key==="Enter"&&gvin.value.trim()){
      const q=gvin.value.trim(); gvin.value=""; buzz(6); guideSend(q,{voice:true});
    }
  };
  if(VOICE.on){ voiceUI(true); gMoonState(VOICE.state); }
  if(GUIDE_SEED&&GUIDE_SEED.q){
    const q=GUIDE_SEED.q; GUIDE_SEED.q=null;   /* ctx stays for the send */
    setTimeout(()=>{ guideSend(q); },320);
  }
}

async function guideSend(q,opts={}){
  if(GUIDE.busy) return;
  GUIDE.busy=true;
  const wasEmpty=!GUIDE.msgs.length;
  GUIDE.msgs.push({role:"user",content:q,t:Date.now()});
  if(wasEmpty){ renderGuide(); }
  else{
    const chat=document.getElementById("chat");
    if(chat) chat.insertAdjacentHTML("beforeend",
      guideMsgHTML(GUIDE.msgs[GUIDE.msgs.length-1],GUIDE.msgs.length-1,GUIDE.msgs[GUIDE.msgs.length-2]));
  }
  const chat=document.getElementById("chat");
  if(chat){ chat.insertAdjacentHTML("beforeend",
    `<div class="gasr" id="gpending"><div class="astrahead"><span class="orbdot"></span>Astra</div>
     <div class="astratext gthink">Reading your chart&#8230;</div></div>`);
    chat.lastElementChild.scrollIntoView({behavior:"smooth",block:"nearest"}); }
  gMoonState("thinking");
  buzz(6);
  const payload={
    messages:GUIDE.msgs.slice(-12).map(m=>({role:m.role,content:m.content})),
    facts:guideFacts()
  };
  GUIDE_SEED=null;
  let reply=null, errText=null, e_plain=null;
  try{
    const r=await fetch(GUIDE_URL,{method:"POST",
      headers:{"content-type":"application/json","authorization":"Bearer "+GUIDE_ANON},
      body:JSON.stringify(payload)});
    const j=await r.json().catch(()=>({}));
    if(!r.ok||!j.text) throw new Error(j.error||"err");
    reply=parseActions(j.text);
  }catch(e){
    errText=String(e.message)==="limit"
      ? "The Guide has said a lot today and rests until tomorrow. Everything else in Astra keeps working."
      : "The Guide can&#8217;t reach the sky just now. Your chart still works &#8212; try again in a moment.";
    e_plain=String(e.message)==="limit"
      ? "The Guide has said a lot today and rests until tomorrow."
      : "The Guide can\u2019t reach the sky just now. Your chart still works \u2014 try again in a moment.";
  }
  GUIDE.busy=false;
  const pend=document.getElementById("gpending");
  if(reply){
    GUIDE.msgs.push({role:"assistant",content:reply.text,t:Date.now(),
      actions:reply.actions.length?reply.actions:undefined});
    guideSave();
    if(pend) pend.outerHTML=guideMsgHTML(GUIDE.msgs[GUIDE.msgs.length-1],
      GUIDE.msgs.length-1,GUIDE.msgs[GUIDE.msgs.length-2]);
    buzz(4);
    if(VOICE.on){ voiceNote(reply.text.replace(/@@ACTIONS[\s\S]*?@@/,"").trim()); voiceSpeak(reply.text); }
    else gMoonState("idle");
  }else{
    GUIDE.msgs.pop();          /* the question stays visible but not in context */
    if(pend){ pend.removeAttribute("id");
      pend.querySelector(".astratext").innerHTML=errText;
      pend.querySelector(".astratext").classList.remove("gthink"); }
    gMoonState("idle");
    if(VOICE.on){
      const plain=String(e_plain||"");
      voiceNote(plain); voiceSpeak(plain);
    }
  }
  const pg2=document.getElementById("pg-guide"), c2=document.getElementById("chat");
  const nearBottom=pg2 && pg2.scrollHeight-pg2.scrollTop-pg2.clientHeight<320;
  if(nearBottom){
    if(c2&&c2.lastElementChild) c2.lastElementChild.scrollIntoView({behavior:"smooth",block:"nearest"});
  } else {
    const gj2=document.getElementById("gjump");
    if(gj2) gj2.hidden=false;
  }
}

/* ---- PROTOTYPE VOICE (spec 21-27, modular pipeline variant) --------
   On-device speech recognition -> Guide server -> on-device speech
   synthesis. Zero-cost modular STT/LLM/TTS loop to validate the
   conversation design; the OpenAI Realtime benchmark is a separate
   queued task. Moon states mirror REAL system state only (spec 17):
   listening = recogniser running and unmuted, speaking = synthesis
   actually playing, barge-in cancels speech immediately (spec 24). */
let VOICE={on:false,muted:false,rec:null,utter:null,state:"idle",
  amp:0,bump:0,raf:0,ac:null,an:null,buf:null,stream:null};
const IS_IOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
function voiceNote(t){ const r=document.getElementById("gvreply"); if(r) r.textContent=t||""; }
function voiceSupported(){ return !!(window.SpeechRecognition||window.webkitSpeechRecognition); }
function voiceUI(on){
  const c=document.getElementById("gcomposer"), v=document.getElementById("gvoice");
  if(c) c.hidden=on;
  if(v) v.hidden=!on;
  document.body.classList.toggle("gvoicemode",on);
}
function voiceStart(){
  buzz(8);
  if(!voiceSupported()){
    const inp=document.getElementById("cmpin");
    if(inp){ inp.placeholder="Voice isn\u2019t available in this browser \u2014 type instead"; }
    return;
  }
  VOICE.on=true; VOICE.muted=false; VOICE.amp=0; VOICE.bump=0;
  const mb=document.getElementById("gvmute");
  if(mb){ mb.classList.remove("muted"); mb.setAttribute("aria-pressed","false"); }
  voiceUI(true);
  voiceNote("");
  gMoonState("listening");
  /* Safari only speaks if synthesis was first touched inside a tap */
  try{ const u0=new SpeechSynthesisUtterance("\u00a0"); u0.volume=0; speechSynthesis.speak(u0); }catch(_){}
  voiceMeterStart();
  voiceListen();
  voiceLoop();
}
/* The Moon swells with the voice in the room: mic RMS while you talk,
   word beats while Astra talks. AudioContext is created inside the tap
   (iOS needs the gesture); the mic stream attaches when it arrives. */
function voiceMeterStart(){
  if(IS_IOS) return;      /* a second capture session stops Safari's recogniser; beats come from it instead */
  try{
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC||!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia) return;
    const ac=new AC(); VOICE.ac=ac; try{ac.resume()}catch(_){}
    navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
      if(!VOICE.on){ stream.getTracks().forEach(t=>t.stop()); return; }
      const an=ac.createAnalyser(); an.fftSize=512; an.smoothingTimeConstant=.55;
      ac.createMediaStreamSource(stream).connect(an);
      VOICE.an=an; VOICE.buf=new Uint8Array(an.fftSize); VOICE.stream=stream;
    }).catch(()=>{});
  }catch(_){}
}
function micLevel(){
  if(!VOICE.an) return null;
  VOICE.an.getByteTimeDomainData(VOICE.buf);
  let s=0; for(let i=0;i<VOICE.buf.length;i++){ const d=(VOICE.buf[i]-128)/128; s+=d*d; }
  const rms=Math.sqrt(s/VOICE.buf.length);
  return Math.min(1,Math.max(0,(rms-0.015)*7));
}
function voiceLoop(){
  cancelAnimationFrame(VOICE.raf);
  const orb=()=>document.getElementById("gvorb");
  const step=t=>{
    if(!VOICE.on) return;
    let target=0;
    if(VOICE.state==="listening"&&!VOICE.muted){
      const lv=micLevel(); target=lv==null?VOICE.bump:Math.max(lv,VOICE.bump);
    } else if(VOICE.state==="speaking"){
      target=0.16+0.10*Math.sin(t/150)+VOICE.bump;
    } else if(VOICE.state==="thinking"){
      target=0.05+0.04*Math.sin(t/650);
    }
    VOICE.bump*=0.88;
    VOICE.amp+=(target-VOICE.amp)*(target>VOICE.amp?0.32:0.10);
    const o=orb(); if(o) o.style.setProperty("--amp",Math.min(1,VOICE.amp).toFixed(3));
    VOICE.raf=requestAnimationFrame(step);
  };
  VOICE.raf=requestAnimationFrame(step);
}
function voiceListen(){
  if(!VOICE.on||VOICE.muted) return;
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  const rec=new SR();
  rec.lang=(PREFS().lang==="hi")?"hi-IN":"en-IN";
  rec.continuous=true; rec.interimResults=true;
  rec.onstart=()=>{ if(!speechSynthesis.speaking) gMoonState("listening"); };
  rec.onsoundstart=()=>{ if(!VOICE.an) VOICE.bump=Math.min(1,VOICE.bump+0.6); };
  rec.onspeechstart=()=>{ if(!VOICE.an) VOICE.bump=Math.min(1,VOICE.bump+0.6); };
  rec.onresult=e=>{
    let interim="", final="";
    for(let i=e.resultIndex;i<e.results.length;i++){
      const r=e.results[i];
      if(r.isFinal) final+=r[0].transcript; else interim+=r[0].transcript;
    }
    if(interim||final){
      if(!VOICE.an) VOICE.bump=Math.min(1,VOICE.bump+0.5);   /* no meter: beat per phrase */
      /* barge-in: the user talking cancels Astra instantly */
      if(speechSynthesis.speaking){ speechSynthesis.cancel(); gMoonState("listening"); }
      const t=document.getElementById("gvtranscript");
      if(t) t.textContent=interim||final;
    }
    if(final.trim()){
      const t=document.getElementById("gvtranscript");
      if(t) t.textContent="";
      guideSend(final.trim(),{voice:true});
    }
  };
  rec.onend=()=>{ if(VOICE.on&&!VOICE.muted) try{rec.start()}catch(_){} };
  rec.onerror=ev=>{
    const err=ev.error||"";
    if(err==="not-allowed"||err==="service-not-allowed"){
      voiceNote("Microphone blocked \u2014 allow it for this site in Settings \u203a Safari \u203a Microphone");
      const inp=document.getElementById("cmpin");
      if(inp) inp.placeholder="Microphone permission needed for voice";
      setTimeout(()=>voiceStop(true),2800);
    } else if(err==="audio-capture"){
      voiceNote("No microphone found on this device");
      setTimeout(()=>voiceStop(true),2200);
    } else if(err==="network"){
      voiceNote("Speech service unreachable \u2014 check the connection and try again");
    }
    /* no-speech / aborted: onend restarts the recogniser */
  };
  VOICE.rec=rec;
  try{rec.start()}catch(_){}
}
function voiceSpeak(text){
  if(!VOICE.on){ gMoonState("idle"); return; }
  try{
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text.replace(/@@ACTIONS[\s\S]*?@@/,""));
    const vs=speechSynthesis.getVoices();
    u.voice=(PREFS().lang==="hi"
      ? vs.find(v=>/hi[-_]IN/i.test(v.lang))||vs.find(v=>/en[-_]IN/i.test(v.lang))
      : vs.find(v=>/en[-_]IN/i.test(v.lang)))||vs.find(v=>/en/i.test(v.lang))||null;
    u.rate=1;
    u.onstart=()=>gMoonState("speaking");
    u.onboundary=()=>{ VOICE.bump=Math.min(1,VOICE.bump+0.3); };
    u.onend=()=>{ if(VOICE.on) gMoonState(VOICE.muted?"idle":"listening"); };
    VOICE.utter=u;
    speechSynthesis.speak(u);
  }catch(_){ gMoonState("idle"); }
}
function voiceMuteToggle(){
  if(!VOICE.on) return;
  buzz(7);
  VOICE.muted=!VOICE.muted;
  const b=document.getElementById("gvmute");
  if(b){ b.classList.toggle("muted",VOICE.muted); b.setAttribute("aria-pressed",String(VOICE.muted));
    b.setAttribute("aria-label",VOICE.muted?"Unmute microphone":"Mute microphone"); }
  if(VOICE.muted){ try{VOICE.rec&&VOICE.rec.stop()}catch(_){}
    if(!speechSynthesis.speaking) gMoonState("idle"); }
  else { voiceListen(); if(!speechSynthesis.speaking) gMoonState("listening"); }
}
function voiceStop(silent){
  if(!VOICE.on){ return; }
  VOICE.on=false;
  try{VOICE.rec&&VOICE.rec.stop()}catch(_){}
  try{speechSynthesis.cancel()}catch(_){}
  VOICE.rec=null;
  cancelAnimationFrame(VOICE.raf);
  try{VOICE.stream&&VOICE.stream.getTracks().forEach(x=>x.stop())}catch(_){}
  try{VOICE.ac&&VOICE.ac.close()}catch(_){}
  VOICE.stream=null; VOICE.ac=null; VOICE.an=null; VOICE.amp=0; VOICE.bump=0;
  const o=document.getElementById("gvorb"); if(o) o.style.setProperty("--amp","0");
  const t=document.getElementById("gvtranscript"); if(t) t.textContent="";
  voiceNote("");
  VOICE.muted=false;
  voiceUI(false);
  gMoonState("idle");
  if(!silent) buzz(6);
}
const ICONS={
  cal:'<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 9.6h17M8 3.2v3.6M16 3.2v3.6"/>',
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
  {id:"learn", label:"Learn astrology", icon:ICONS.learn, sub:()=>"three levels"},
  {id:"glossary", label:"Glossary", icon:ICONS.az, sub:()=>GLOSSARY.reduce((a,g)=>a+g[1].length,0)+" terms"},
  {id:"muhurta", label:"Find a good time", icon:ICONS.clock, sub:()=>"muhurta"},
  {id:"festivals", label:"Festivals & vrats", icon:ICONS.cal, sub:()=>{
    const n=festivalsBetween(new Date(),new Date(Date.now()+14*864e5),BIRTHPLACE.lat,BIRTHPLACE.lon)
      .filter(x=>!x.minor&&x.kind!=="observance").length; return n?`${n} in two weeks`:"calendar"; }},
  {id:"report", label:"Reports", icon:ICONS.doc, sub:()=>"kundali &#183; relationship"},
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
 "Gana":()=>`Yours is <b>${avakhadaOf(CHART.get("Moon").L).Gana}</b>.`,
 "Nadi":()=>`Yours is <b>${avakhadaOf(CHART.get("Moon").L).Nadi}</b>.`,
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
const escg=x=>String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
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
      :`<p class="gempty">No results for &#8220;${escg(glossQ)}&#8221;</p>`}
    <div class="azbubble" id="azbubble" aria-hidden="true"></div>
    <nav class="azrail" id="azrail" aria-label="Jump to letter">
      ${letters.map(L=>`<button data-l="${L}" class="${groups[L]?"":"off"}">${L}</button>`).join("")}
    </nav>`;
}

function wireGlossary(){
  const page=document.getElementById("pg-you");
  const open=document.getElementById("gsbtn");
  if(open) open.onclick=()=>{ glossSearching=true; buzz(5); renderSub();
    const n=document.getElementById("gq"); if(n) n.focus(); };
  const q=document.getElementById("gq");
  if(q) q.oninput=()=>{
    glossQ=q.value; const at=q.selectionStart;
    /* only the LIST re-renders while typing; the bar (and its focused
       input) is left alone, so the keyboard never flickers */
    document.getElementById("pg-you").innerHTML=subGlossary();
    wireGlossaryRail();
    void at;
  };
  const cancel=document.getElementById("gcancel");
  if(cancel) cancel.onclick=()=>{glossSearching=false; glossQ="";
    renderSub(); page.scrollTop=0;};

  wireGlossaryRail();
}

/* index rail: drag it like Contacts, showing the letter as you move */
function wireGlossaryRail(){
  const page=document.getElementById("pg-you");
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

/* Sample saved entries, but every fact in them is read from the engine at
   render time - a sample must never contradict the chart (CLAUDE.md 104). */
const SAVED=()=>{
  const sat=CHART.get("Saturn"), mer=CHART.get("Mercury"), jup=CHART.get("Jupiter");
  const now=CHART.dasha.at(new Date());
  return [
   {t:`Saturn ${sat.dig?sat.dig.toLowerCase():"in "+SIGNS[sat.sign-1]}`,w:"Universe &#183; graha",
    b:`${sat.dig||"Placed"} in ${SIGNS[sat.sign-1]}, your ${ordinal(sat.house)}, ruling your ${CHART.housesRuled("Saturn").map(ordinal).join(" and ")}.${sat.retro?" Retrograde.":""}`},
   {t:`Mercury ${mer.dig?mer.dig.toLowerCase():"in "+SIGNS[mer.sign-1]}`,w:"Universe &#183; graha",
    b:`Mercury sits in ${SIGNS[mer.sign-1]}${mer.dig?`, its sign of ${mer.dig.toLowerCase()}`:""}, in your ${ordinal(mer.house)}${CHART.conjunct("Mercury").includes("Sun")?", conjunct the Sun &#8212; close enough to be read as combust":""}.${mer.retro?" Retrograde as well.":""}`},
   {t:`${now.maha.lord} mahadasha to ${now.maha.end.getFullYear()}`,w:"Timeline",
    b:`The present period, ruled by the lord of your ${CHART.housesRuled(now.maha.lord).map(ordinal).join(" and ")||ordinal(CHART.get(now.maha.lord).house)}. The antardasha inside it changes roughly every year.`},
   {t:`Jupiter in your ${ordinal(jup.house)}`,w:"Universe &#183; house",
    b:`Your ${ordinal(jup.house)} carries ${SIGNS[jup.sign-1]}. Jupiter sits there &#8212; ${BHAVA[jup.house-1][1].toLowerCase()}.`}
  ];
};
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

let subView=null, subArg=null, cameFrom=null, glossSearching=false;

function renderYou(){
  if(subView) return renderSub();
  document.body.classList.remove("insub");
  document.body.classList.remove("glossary");
  setTopBar("You");
  document.getElementById("pg-you").innerHTML=`
    <div class="me-head">
      <div class="avatar big">${ACTIVE.name[0]}</div>
      <div class="me-id">
        <div class="me-row">
          <h1>${ACTIVE.name}</h1>
          <button class="planbadge" id="planbadge">${isPro()?"ASTRA PRO":"FREE"}</button>
        </div>
        <p class="me-sub">${SIGNS_SK[CHART.lagna-1]} lagna</p>
        <button class="editlink" id="editme">${ACTIVE.p?"See & edit details":"Birth details"}
          <span class="chev">&#8250;</span></button>
      </div>
    </div>
    <div class="userstrip" id="userstrip" role="tablist" aria-label="Whose chart">
      <button class="uchip${ACTIVE.p?"":" on"}" data-u="me"><i class="uavatar">S</i>You</button>
      ${partners().map((p,i)=>`<button class="uchip${ACTIVE.p&&ACTIVE.name===p.name?" on":""}"
        data-u="${i}"><i class="uavatar">${p.name[0]}</i>${p.name.split(" ")[0]}${
        isPro()?"":`<svg class="ulock" viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="9.5" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 018 0v3"/></svg>`}</button>`).join("")}
      <button class="uchip add" data-u="add">+</button>
    </div>
    <div class="section">
      <div class="list">
        ${SUBS.map(v=>`<button class="item" data-v="${v.id}">
          <svg class="ico" viewBox="0 0 24 24">${v.icon}</svg>${v.label}
          <span class="sub">${v.sub()}</span><span class="chev">&#8250;</span></button>`).join("")}
      </div>
    </div>`;
  const pb=document.getElementById("planbadge");
  if(pb) pb.onclick=()=>{buzz(7); subView="plans"; subArg=null; renderSub();};
  const em=document.getElementById("editme");
  if(em) em.onclick=()=>{buzz(7);
    if(ACTIVE.p){ subArg=partners().findIndex(x=>x.name===ACTIVE.name);
      cameFrom=null; subView="addpartner"; }
    else subView="birth";
    renderSub();};
  document.getElementById("userstrip").onclick=e=>{
    const c=e.target.closest(".uchip"); if(!c) return;
    buzz(8);
    if(c.dataset.u==="add"){ subArg=null; subView="addpartner"; renderSub(); return; }
    if(c.dataset.u==="me"){ if(ACTIVE.p) setActiveUser(null); return; }
    if(!isPro()) return openProSheet();
    const p=partners()[+c.dataset.u];
    if(p && (!ACTIVE.p||ACTIVE.name!==p.name)) setActiveUser(p);
  };
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
    glossary: glossSearching
      ? `<div class="barsearch">
           <span class="gsico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round">
             <circle cx="11" cy="11" r="6.5"/><path d="M16.5 16.5l4 4"/></svg></span>
           <input id="gq" type="search" value="${escg(glossQ)}"
             placeholder="Search the glossary" aria-label="Search the glossary">
         </div>
         <button class="tb-btn txt" id="gcancel">Cancel</button>`
      : `<button class="tb-btn" id="gsbtn" aria-label="Search the glossary">
           <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/>
             <path d="M16.5 16.5l4 4"/></svg></button>`,
  };
  const TITLES={birth:"Birth details",rel:"Relationships",events:"Life events",
    glossary:"Glossary",settings:"Settings",report:"Reports",people:"Charts",plans:"Plans",
    yogas:"Yogas & doshas",muhurta:"Find a good time",festivals:"Festivals & vrats",signs:"Signs & Nakshatras",reportview:"Your kundali report",
    relreportview:"Relationship report",
    learn:"Learn astrology",learntopic:(LEARN_LEVELS.flatMap(l=>l.topics).find(x=>x.id===learnTopic)||{}).title||"Learn",
    personchart:(partners()[subArg]||{}).name||"Chart",addpartner:subArg!=null?"Edit person":"Add a person",
    addevent:subArg!=null?"Edit event":"Add a life event",
    partner:(partners()[subArg]||{}).name||"Person"};
  const searching=subView==="glossary"&&glossSearching;
  setTopBar(searching?"":TITLES[subView]||"",{back:!searching,actions:ACTIONS[subView]||""});
  document.getElementById("topbar").classList.toggle("searching",searching);
  const body={birth:subBirth,rel:subRel,partner:subPartner,events:subEvents,addpartner:subAddPartner,addevent:subAddEvent,
              glossary:subGlossary,report:subReport,people:subPeople,learn:subLearn,learntopic:subLearnTopic,personchart:subPersonChart,
              settings:subSettings,plans:subPlans,yogas:subYogas,muhurta:subMuhurta,festivals:subFestivals,signs:subSigns,
              reportview:subReportView,relreportview:subRelReportView}[subView];
  pg.innerHTML=body();
  pg.scrollTop=0;
  const ta=document.getElementById("tbadd"), te=document.getElementById("tbaddev"),
        ted=document.getElementById("tbedit");
  if(ta) ta.onclick=()=>{subArg=null;subView="addpartner";buzz(7);renderSub()};
  if(te) te.onclick=()=>{subArg=null;subView="addevent";buzz(7);renderSub()};
  if(ted) ted.onclick=()=>{subView="addpartner";buzz(7);renderSub()};
  if(subView==="rel") wireRel();
  if(subView==="events") wireEvents();
  if(subView==="birth") wireBirth();
  if(subView==="signs") wireSigns();
  document.body.classList.toggle("glossary",subView==="glossary");
  if(subView!=="glossary"){ glossSearching=false;
    document.getElementById("topbar").classList.remove("searching"); }
  if(subView!=="glossary") document.body.classList.remove("gstuck","gtyping");
  if(subView==="glossary") wireGlossary();
  if(subView==="learn"||subView==="learntopic") wireLearn();
  if(subView==="people") wirePeople();
  if(subView==="personchart") wirePersonChart();
  if(subView==="settings") wireSettings();
  if(subView==="plans") wirePlans();
  if(subView==="report") wireReport();
  if(subView==="muhurta") wireMuhurta();
  if(subView==="festivals") wireFestivals();
  if(subView==="reportview"||subView==="relreportview") wireReportView();
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

/* ---- ASTRA PRO --------------------------------------------------
   The gate is real; the payment is not, yet. Until pricing is settled
   the sheet offers an honest preview switch instead of a fake buy
   button - no dark patterns, per the constitution (107). */
const isPro=()=>!!PREFS().pro;
let proHost=null;
function openProSheet(){
  if(!proHost){ proHost=document.createElement("div"); proHost.className="prosheet";
    document.body.appendChild(proHost); }
  proHost.innerHTML=`
    <div class="proscrim"></div>
    <div class="propanel">
      <div class="prohead">
        <svg viewBox="0 0 24 24" class="prostar"><path d="M12 3.5l2 4.4 4.8.5-3.6 3.2 1 4.7-4.2-2.4-4.2 2.4 1-4.7L5.2 8.4l4.8-.5z"/></svg>
        <h2>Astra Pro</h2>
        <p>The whole of time, and everything written down.</p>
      </div>
      <div class="probens">
        ${[["Time travel","Any day&#8217;s full reading &#8212; decades back or forward"],
           ["Guide","Talk to the chart &#8212; 300 questions and 30 voice minutes a month"],
           ["Your people","Up to 3 charts, and the whole app switches to them"],
           ["The full timeline","Every dasha level, all 8 kootas, complete reasoning"]].map(([t,s])=>`
          <div class="proben"><svg viewBox="0 0 24 24" class="tick"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>
            <div><b>${t}</b><span>${s}</span></div></div>`).join("")}
      </div>
      <div class="proprice"><b>Pricing is being decided</b>
        <span>planned as a yearly plan, priced like one good consultation</span></div>
      <button class="primary" id="prostart">Preview Pro while we build</button>
      <button class="proclose" id="proclose">Not now</button>
    </div>`;
  /* a forced reflow, not rAF: the class must land even in a hidden tab,
     and the reflow still lets the slide-in transition play */
  void proHost.offsetHeight;
  proHost.classList.add("open");
  proHost.querySelector(".proscrim").onclick=closeProSheet;
  document.getElementById("proclose").onclick=closeProSheet;
  document.getElementById("prostart").onclick=()=>{
    setPref("pro",true); buzz(12); closeProSheet();
    if(activeTab===0) renderToday(); else if(activeTab===YOU_INDEX) renderYou();
  };
  buzz(8);
}
function closeProSheet(){ if(proHost) proHost.classList.remove("open"); }



/* ---- LEARN ------------------------------------------------------
   The app should leave someone more knowledgeable than it found them
   (CLAUDE.md 39, 146). Beginner first, then depth. */
const nakLord2=i=>ORDER[i%9];
/* ===================================================================
   LEARN ASTROLOGY
   -------------------------------------------------------------------
   The curriculum lives in learn.js: three levels, concept by concept.
   The diagrams are drawn here, from the same geometry as the real
   chart, because the app should teach with its own visual language
   (CLAUDE.md 42) - not with stock art.
   =================================================================== */

/* U+FE0E pins text presentation - without it these render as emoji
   squares, which is exactly the generic-astrology look we refuse */
const SIGN_GLYPH=["\u2648","\u2649","\u264A","\u264B","\u264C","\u264D",
  "\u264E","\u264F","\u2650","\u2651","\u2652","\u2653"].map(g=>g+"\uFE0E");
const ELEMENTS=[["Fire","Aries, Leo, Sagittarius","var(--mars)"],
                ["Earth","Taurus, Virgo, Capricorn","var(--brass)"],
                ["Air","Gemini, Libra, Aquarius","var(--hot)"],
                ["Water","Cancer, Scorpio, Pisces","var(--venus)"]];

/* a miniature of the real chart geometry, with optional per-house label */
function miniChart(label,opts={}){
  const cell=h=>label?label(h):"";
  return `<svg class="lgfig" viewBox="-3 -3 106 106" aria-hidden="true">
    <rect x="0" y="0" width="100" height="100" fill="none" stroke="var(--line-2)" stroke-width="1.6"/>
    <line x1="0" y1="0" x2="100" y2="100" stroke="var(--line-2)" stroke-width="1.2"/>
    <line x1="100" y1="0" x2="0" y2="100" stroke="var(--line-2)" stroke-width="1.2"/>
    <path d="${RHOMBUS_D}" fill="none" stroke="var(--line-2)" stroke-width="1.2"/>
    ${opts.lagna?`<path d="${LAGNA_D}"
      fill="rgba(194,155,78,.14)" stroke="none"/>`:""}
    ${Object.keys(LABEL).map(h=>`<text x="${LABEL[h][0]}" y="${LABEL[h][1]}"
      font-size="7.5" fill="${opts.lagna&&+h===1?"var(--brass)":"var(--ink-3)"}"
      text-anchor="middle" dominant-baseline="middle"
      font-family="var(--fm)">${cell(+h)}</text>`).join("")}
  </svg>`;
}

const GRAPHIC={
  "chart-anatomy":()=>`<figure class="lg">
    ${miniChart(h=>h===1?"1":"", {lagna:true})}
    <figcaption>The North Indian chart. The gold diamond at the top is the
      <b>1st house</b> &#8212; the lagna. Houses run anticlockwise from it and
      never move.</figcaption></figure>`,
  "houses-wheel":()=>`<figure class="lg">
    ${miniChart(h=>String(h))}
    <figcaption>The twelve houses. The positions are fixed &#8212; only the signs
      and grahas inside them change from person to person.</figcaption></figure>`,
  "sign-glyphs":()=>`<figure class="lg"><div class="glyphgrid">
    ${SIGNS.map((n,i)=>`<span class="glyphcell"><b>${SIGN_GLYPH[i]}</b>
      <small>${n}</small><small class="sk">${SIGNS_SK[i]}</small></span>`).join("")}
    </div><figcaption>The twelve rashis, in order. In your chart each occupies
      one house, starting from wherever your lagna sign fell.</figcaption></figure>`,
  "elements-grid":()=>`<figure class="lg"><div class="elgrid">
    ${ELEMENTS.map(([e,list,c])=>`<span class="elcell" style="--ec:${c}">
      <b>${e}</b><small>${list}</small></span>`).join("")}
    </div><figcaption>Four elements, three signs each. Fire initiates, earth
      builds, air connects, water feels.</figcaption></figure>`,
  "aspect-lines":()=>`<figure class="lg">
    <svg class="lgfig" viewBox="-3 -3 106 106" aria-hidden="true">
      <rect x="0" y="0" width="100" height="100" fill="none" stroke="var(--line-2)" stroke-width="1.6"/>
      <line x1="0" y1="0" x2="100" y2="100" stroke="var(--line-2)" stroke-width="1.2"/>
      <line x1="100" y1="0" x2="0" y2="100" stroke="var(--line-2)" stroke-width="1.2"/>
      <path d="${RHOMBUS_D}" fill="none" stroke="var(--line-2)" stroke-width="1.2"/>
      <circle cx="50" cy="14" r="4.5" fill="var(--saturn)"/>
      <path d="M 50 14 Q 78 40 50 86" fill="none" stroke="var(--hot)" stroke-width="1.6" stroke-dasharray="3 2.4"/>
      <circle cx="50" cy="86" r="2.6" fill="var(--hot)"/>
      <path d="M 50 14 Q 22 30 14 50" fill="none" stroke="var(--hot)" stroke-width="1.6" stroke-dasharray="3 2.4" opacity=".65"/>
      <circle cx="14" cy="50" r="2.6" fill="var(--hot)" opacity=".65"/>
      <path d="M 50 14 Q 86 26 86 50" fill="none" stroke="var(--hot)" stroke-width="1.6" stroke-dasharray="3 2.4" opacity=".65"/>
      <circle cx="86" cy="50" r="2.6" fill="var(--hot)" opacity=".65"/>
    </svg>
    <figcaption>Drishti: a graha in the 1st casting its glance. Every graha
      aspects the 7th from itself; Saturn (shown) also reaches the 3rd and 10th.</figcaption></figure>`,
  "retrograde-loop":()=>`<figure class="lg">
    <svg class="lgfig wide" viewBox="0 0 200 66" aria-hidden="true">
      <line x1="8" y1="46" x2="192" y2="46" stroke="var(--line-2)" stroke-width="1.4"/>
      <path d="M 16 46 C 60 46 74 20 100 20 C 126 20 118 46 100 46 C 82 46 116 46 184 46"
        fill="none" stroke="var(--mars)" stroke-width="2"/>
      <polygon points="184,46 176,42 176,50" fill="var(--mars)"/>
      <text x="100" y="12" font-size="8.5" fill="var(--ink-3)" text-anchor="middle"
        font-family="var(--fm)">apparent backward loop</text>
    </svg>
    <figcaption>A retrograde is apparent motion: Earth overtakes, and for a
      while the planet seems to slip backwards along the zodiac before resuming.</figcaption></figure>`,
  "dasha-timeline":()=>{
    const SEQ=[["Ketu",7],["Venus",20],["Sun",6],["Moon",10],["Mars",7],
               ["Rahu",18],["Jupiter",16],["Saturn",19],["Mercury",17]];
    let x=0;
    return `<figure class="lg">
    <svg class="lgfig wide" viewBox="0 0 240 44" aria-hidden="true">
      ${SEQ.map(([g,y])=>{const w=y*2, r=`<rect x="${x}" y="8" width="${w-1}" height="16" rx="3"
          fill="${'var(--'+g.toLowerCase()+')'}" opacity=".8"/>
        <text x="${x+w/2}" y="36" font-size="6.5" fill="var(--ink-3)" text-anchor="middle"
          font-family="var(--fm)">${y>=10?g:g.slice(0,2)}</text>`; x+=w; return r}).join("")}
    </svg>
    <figcaption>The Vimshottari cycle: 120 years split unevenly between the nine
      grahas. Where you enter the wheel is set by your birth nakshatra.</figcaption></figure>`},
  "varga-split":()=>`<figure class="lg"><div class="vargarow">
    ${miniChart(h=>h===1?"D1":"" ,{lagna:true})}
    <span class="varga-arrow">&#8594;</span>
    ${miniChart(h=>h===1?"D9":"" ,{lagna:true})}
    </div><figcaption>Every sign can be subdivided. The ninth division builds a
      second chart, the navamsha (D9), read alongside the birth chart.</figcaption></figure>`,
  "nakshatra-belt":()=>`<figure class="lg">
    <svg class="lgfig wide" viewBox="0 0 240 52" aria-hidden="true">
      <line x1="10" y1="26" x2="230" y2="26" stroke="var(--line-2)" stroke-width="1.4"/>
      ${Array.from({length:27},(_,i)=>`<line x1="${10+i*220/26}" y1="${i%9===0?16:20}"
        x2="${10+i*220/26}" y2="${i%9===0?36:32}" stroke="${i%9===0?"var(--brass)":"var(--ink-3)"}"
        stroke-width="1.3"/>`).join("")}
      <circle cx="${10+18*220/26}" cy="26" r="4" fill="var(--moon)"/>
      <text x="${10+18*220/26}" y="48" font-size="7.5" fill="var(--ink-3)" text-anchor="middle"
        font-family="var(--fm)">Mula &#183; your Moon</text>
    </svg>
    <figcaption>The 27 nakshatras divide the zodiac finer than the signs &#8212;
      13&#176;20&#8242; each. Your Moon's nakshatra is the anchor of the dasha system.</figcaption></figure>`,
  "moon-phases":()=>`<figure class="lg"><div class="phaserow">
    ${[["00","new_moon"],["04","waxing_crescent"],["07","first_quarter"],
       ["11","waxing_gibbous"],["15","full_moon"],["19","waning_gibbous"],
       ["22","last_quarter"],["26","waning_crescent"]].map(([k,n])=>
      `<img src="assets/moon/phase_${k}_${n}.png" width="30" height="30" alt="">`).join("")}
    </div><figcaption>One lunar month: new to full and back. The tithi &#8212; the
      Vedic lunar day &#8212; is a thirtieth of this lap.</figcaption></figure>`,
};

let learnTopic=null;
function subLearn(){
  return `
    <p class="muted" style="font-size:13.5px;margin:0 0 14px">
      Concept by concept, using your own chart as the classroom.</p>
    <button class="item lsigns" style="margin-bottom:18px">
      <svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17M3.5 12h17M6 6l12 12M18 6L6 18"/></svg>
      Signs &amp; Nakshatras<span class="sub">interactive &#8212; two grids over one zodiac, with your chart on the wheel</span>
      <span class="chev">&#8250;</span></button>
    ${LEARN_LEVELS.map(lv=>`
      <div class="lvlhead"><b>${lv.level}</b><span>${lv.tag}</span></div>
      <p class="lvlintro">${lv.intro}</p>
      <div class="list lvllist">
        ${lv.topics.map(t=>`<button class="item lrnitem" data-l="${t.id}">
          <span style="flex:1"><b style="font-weight:600">${t.title}</b>
            <span class="gdef">${t.one}</span></span>
          <span class="lrnread">${t.read}</span>
          <span class="chev">&#8250;</span></button>`).join("")}
      </div>`).join("")}`;
}
function learnSection(sec){
  if(sec.h) return `<h3>${sec.h}</h3>`;
  if(sec.p) return `<p>${sec.p}</p>`;
  if(sec.graphic) return GRAPHIC[sec.graphic]?GRAPHIC[sec.graphic]():"";
  if(sec.list) return `<ul>${sec.list.map(x=>`<li>${x}</li>`).join("")}</ul>`;
  if(sec.term) return `<div class="lterm"><b>${sec.term}</b><span>${sec.means}</span></div>`;
  if(sec.try) return `<div class="ltry"><span class="ltryk">Try it</span><p>${sec.try}</p></div>`;
  return "";
}
function subLearnTopic(){
  let lv=null, t=null;
  for(const l of LEARN_LEVELS){ const f=l.topics.find(x=>x.id===learnTopic); if(f){lv=l;t=f;break} }
  if(!t) return subLearn();
  const flat=LEARN_LEVELS.flatMap(l=>l.topics);
  const i=flat.findIndex(x=>x.id===t.id), next=flat[i+1];
  return `<article class="lrnbody">
    <div class="eyebrow">${lv.level} &#183; ${t.read}</div>
    <h1>${t.title}</h1>
    ${t.sections.map(learnSection).join("")}
    ${next?`<button class="item lrnnext" data-l="${next.id}">
      <span style="flex:1"><small class="gdef">Next up</small>
        <b style="font-weight:600">${next.title}</b></span>
      <span class="chev">&#8250;</span></button>`:""}
  </article>`;
}
function wireLearn(){
  document.getElementById("pg-you").onclick=e=>{
    if(e.target.closest(".lsigns")){ subView="signs"; buzz(7); renderSub();
      document.getElementById("pg-you").scrollTop=0; return; }
    const b=e.target.closest(".lrnitem,.lrnnext"); if(!b) return;
    learnTopic=b.dataset.l; subView="learntopic"; buzz(7); renderSub();
    document.getElementById("pg-you").scrollTop=0;
  };
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

/* ---- PLANS — the three tiers, spelled out ------------------------
   Reached from the plan badge under the name. Checkmarks are text
   glyphs at full contrast - no icon subtlety here (Sangram, 30 Aug). */
function subPlans(){
  const pro=isPro();
  const li=(on,txt)=>`<li class="${on?"on":"off"}"><i>${on?"&#10003;":"&#8212;"}</i>${txt}</li>`;
  return `
    <div class="plancard${pro?"":" cur"}">
      <div class="planhead"><b>Free</b>${pro?"":`<span class="plantag now">your plan</span>`}</div>
      <p class="planprice">&#8377;0 &#183; forever</p>
      <ul class="planfeats">
        ${li(1,"Your full birth chart, explorable forever")}
        ${li(1,"Today&#8217;s sky, panchang and placements")}
        ${li(1,"The AR sky view")}
        ${li(1,"Horoscope for yesterday, today and tomorrow")}
        ${li(1,"One person saved, compatibility summary")}
        ${li(0,"Other days&#8217; readings, full dasha timeline")}
        ${li(0,"Guide &#8212; conversations with the chart")}
        ${li(0,"Switching the whole app to another person")}
      </ul>
    </div>
    <div class="plancard reco${pro?" cur":""}">
      <div class="planhead"><b>Astra Pro</b>${pro?`<span class="plantag now">your plan &#183; preview</span>`:`<span class="plantag">recommended</span>`}</div>
      <p class="planprice">&#8377;499/mo &#183; &#8377;1,199/quarter &#183; <b>&#8377;2,999/yr</b>
        <span class="usd">$9.99 &#183; $24.99 &#183; $69.99</span></p>
      <ul class="planfeats">
        ${li(1,"Everything in Free")}
        ${li(1,"Any day&#8217;s full reading &#8212; decades either way")}
        ${li(1,"Full 120-year dasha timeline, every level")}
        ${li(1,"Guide &#8212; talk to the chart, 300 questions a month")}
        ${li(1,"Voice conversations &#8212; 30 minutes a month, when it ships")}
        ${li(1,"Up to 3 people, and the whole app switches to them")}
        ${li(1,"All 8 kootas with complete reasoning")}
      </ul>
      ${pro?"":`<button class="primary" data-plan="pro">Preview Pro while pricing is decided</button>`}
    </div>
    <div class="card" style="margin-top:14px">
      <div class="eyebrow" style="margin-bottom:7px">Reports &#8212; always priced separately</div>
      ${rows([["Kundali report &#183; PDF","&#8377;499 &#183; $14.99"],
              ["Relationship report &#183; PDF","&#8377;399 &#183; $11.99"]])}
      <p class="note" style="margin:10px 0 0">Every report is a one-time purchase, on any
      plan &#8212; delivered in the app and by email when purchases arrive.</p>
    </div>
    ${pro?`<button class="proclose" id="planoff">Manage &#183; switch back to Free</button>`:""}
    <p class="note">Preview pricing &#8212; nothing is charged in this prototype. Real
    purchases arrive with the App Store build. No remedy is ever behind a paywall,
    and nothing here is sold on fear.</p>`;
}
function wirePlans(){
  document.querySelectorAll("[data-plan]").forEach(b=>b.onclick=()=>{
    setPref("pro",true); buzz(12); renderSub();
  });
  const off=document.getElementById("planoff");
  if(off) off.onclick=()=>{ setPref("pro",false); buzz(8); renderSub(); };
}

/* ---- YOGAS & DOSHAS — every combination with its evidence --------- */
function subYogas(){
  const E=engine();
  return `
    <p class="skylead">Every combination below was detected by the rule engine, and
      every one shows the rule that fired it &#8212; the &#8220;because&#8221; no
      other app prints.</p>
    ${E.yogas.map(y=>`
      <div class="card" style="margin-bottom:10px;padding:13px 15px">
        <div class="areahead"><span class="aname">${y.name}</span>
          ${y.strength?`<span class="atone ${y.strength==="strong"?"favourable":"balanced"}">${y.strength}</span>`:""}</div>
        ${y.sanskrit?`<p class="ameta" style="margin:2px 0 6px">${y.sanskrit}</p>`:""}
        <p class="interp" style="margin:4px 0 0">${y.because}</p>
      </div>`).join("")}
    <div class="eyebrow" style="margin:22px 0 10px">Doshas</div>
    ${E.doshas.map(d=>`
      <div class="card" style="margin-bottom:10px;padding:13px 15px">
        <div class="areahead"><span class="aname">${d.name}</span>
          <span class="atone ${d.present?"slow":"favourable"}">${d.present?"present":"absent"}</span></div>
        <p class="interp" style="margin:4px 0 0">${d.because}</p>
      </div>`).join("")}
    <p class="note">Detection follows the classical rules stated in each card; where a
    popular report disagrees with the rule, trust the rule &#8212; several vendor
    reports print yogas whose conditions their own charts fail. Traditional
    associations, not a forecast.</p>`;
}

/* ---- MUHURTA — find a good time (Pro) ----------------------------
   General electional astrology from the panchang engine: tara bala,
   the Moon's count, tithi class, the weekday, karana - each day's
   verdict shows its reasons. Not for medical decisions; the framing
   stays firmly non-clinical (constitution 70). */
let muhFrom=null, muhDays=14, muhAct="begin";
const MUH_ACTS={begin:"Beginning something new",journey:"A journey",
  money:"Money & signing",home:"Home & family",quiet:"Quiet, inner work"};
function muhurtaScore(d){
  const F=dayFacts(d);
  const reasons=[]; let s=0;
  if(F.chandrashtama){ return {s:-99, reasons:[`The Moon crosses the 8th from your natal Moon &#8212; chandrashtama; the tradition sets such days aside.`], F}; }
  if(F.tara.tone==="good"){s+=2;reasons.push(`Tara bala counts <b>${F.tara.name}</b> &#8212; a supportive star from yours.`)}
  else if(F.tara.tone==="testing"){s-=2;reasons.push(`Tara bala counts <b>${F.tara.name}</b> &#8212; a testing star from yours.`)}
  const moon=F.sky.find(p=>p.graha==="Moon");
  if(moon.favourable){s+=2;reasons.push(`The Moon rides your ${ordinal(moon.house)} house, well counted from your natal Moon.`)}
  else {s-=1;reasons.push(`The Moon&#8217;s count from your natal Moon runs slower.`)}
  const benefic={Mercury:1,Jupiter:1,Venus:1}, heavy={Saturn:1,Mars:1};
  if(benefic[F.vara.lord]){s+=1;reasons.push(`${F.vara.name} belongs to ${F.vara.lord}, a gentle day lord.`)}
  if(heavy[F.vara.lord]){s-=1;reasons.push(`${F.vara.name} belongs to ${F.vara.lord} &#8212; workable, but weightier.`)}
  if(["Chaturthi","Navami","Chaturdashi"].includes(F.limbs.tithi.name)){s-=2;
    reasons.push(`${F.limbs.tithi.name} is a rikta tithi &#8212; traditionally empty-handed for beginnings.`)}
  if(F.limbs.karana.vishti){s-=1;reasons.push(`Vishti karana runs &#8212; set aside for launches.`)}
  return {s, reasons, F};
}
/* ---- FESTIVALS & VRATS (src/festivals.js) — the luni-solar calendar the
   engine derives from its own ephemeris; nothing here is looked up ---- */
let festFilter="all", festDays=90;
function subFestivals(){
  const sp=liveSpot()||BIRTHPLACE;
  const from=new Date(); from.setHours(0,0,0,0);
  const to=new Date(from.getTime()+festDays*864e5);
  let list=festivalsBetween(from,to,sp.lat,sp.lon).filter(x=>!x.minor);
  if(festFilter==="festival") list=list.filter(x=>x.kind==="festival"||x.kind==="solar");
  if(festFilter==="vrat") list=list.filter(x=>x.kind==="vrat");
  if(festFilter==="all") list=list.filter(x=>x.kind!=="observance");
  const hi=PREFS().lang!=="en";
  const months=[];
  for(const x of list){
    const key=x.date.toLocaleDateString("en-GB",{month:"long",year:"numeric"});
    let m=months.find(y=>y.key===key); if(!m){ m={key,items:[]}; months.push(m); }
    m.items.push(x);
  }
  const KIND={festival:"festival",solar:"sankranti",vrat:"vrat",observance:"observance"};
  const RULE={sunrise:"tithi at sunrise",noon:"tithi at midday",afternoon:"tithi in the afternoon",
    evening:"tithi at pradosh",night:"tithi at moonrise",midnight:"tithi at midnight",sankranti:"the Sun enters the sign"};
  return `
    <p class="skylead">The next ${festDays} days at ${sp.name?sp.name.split(",")[0]:"your place"},
      derived from the same ephemeris as your chart &#8212; each date says which rule fixed it.</p>
    <div class="feelseg" style="margin-bottom:10px" id="festkind">
      ${[["all","Festivals & vrats"],["festival","Festivals"],["vrat","Vrats"]].map(([k,v])=>
        `<button data-k="${k}" class="${festFilter===k?"on":""}">${v}</button>`).join("")}
    </div>
    <div class="feelseg" style="margin-bottom:16px" id="festrange">
      ${[30,90,365].map(n=>`<button data-n="${n}" class="${festDays===n?"on":""}">${n===365?"Year":n+" days"}</button>`).join("")}
    </div>
    ${months.map(m=>`
      <div class="eyebrow festmonth">${m.key}</div>
      <div class="card festcard">
        ${m.items.map(x=>{
          const today=isToday(x.date);
          return `<div class="festrow${today?" today":""}">
            <div class="festday"><b>${x.date.getDate()}</b><span>${x.date.toLocaleDateString("en-GB",{weekday:"short"})}</span></div>
            <div class="festbody">
              <div class="festname">${x.name}${hi&&x.hi?` <small class="hiname">${x.hi}</small>`:""}
                <span class="festkind ${x.kind}">${KIND[x.kind]}</span></div>
              <div class="festmeta">${x.masa?`${hi?x.masaHi:x.masa}${x.paksha?` &#183; ${x.paksha==="S"?"Shukla":"Krishna"} ${x.tithi===15?(x.paksha==="S"?"Purnima":"Amavasya"):x.tithi}`:""}`:""}
                &#183; ${RULE[x.rule]||x.rule}</div>
              ${x.note?`<div class="festnote">${x.note}</div>`:""}
            </div></div>`;}).join("")}
      </div>`).join("")}
    <p class="note">Dates follow the amanta month reckoning used across Maharashtra, Gujarat and the
      south; the north names the same days by purnimanta months, so an Ekadashi&#8217;s name here
      follows that wider convention. Regional almanacs can still differ by a day where a tithi
      straddles two sunrises or where moonrise, bhadra or local sunrise is judged differently.</p>`;
}
function wireFestivals(){
  const k=document.getElementById("festkind"), r=document.getElementById("festrange");
  if(k) k.onclick=e=>{ const b=e.target.closest("[data-k]"); if(!b)return; festFilter=b.dataset.k; buzz(6); renderSub(); };
  if(r) r.onclick=e=>{ const b=e.target.closest("[data-n]"); if(!b)return; festDays=+b.dataset.n; buzz(6); renderSub(); };
}

function subMuhurta(){
  if(!isPro()) return `
    <div class="procard" style="margin-top:8px">
      <div class="prolock" aria-hidden="true"><svg viewBox="0 0 24 24">
        <rect x="5" y="10.5" width="14" height="9.5" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 018 0v3"/></svg></div>
      <h3>Finding the right day rides with Pro</h3>
      <p>Scan the weeks ahead for days the panchang genuinely favours &#8212; with every
        reason shown. Part of Astra Pro, like all time travel.</p>
      <button class="primary" id="muhpro">See Astra Pro</button>
    </div>`;
  const from=muhFrom||new Date();
  const days=[];
  for(let i=0;i<muhDays;i++){
    const d=new Date(from.getTime()+i*864e5); d.setHours(12,0,0,0);
    days.push({d, ...muhurtaScore(d)});
  }
  const ranked=days.filter(x=>x.s>-90).sort((a,b)=>b.s-a.s).slice(0,5)
    .sort((a,b)=>a.d-b.d);
  const st0=sunTimes(new Date(),BIRTHPLACE.lat,BIRTHPLACE.lon);
  return `
    <p class="skylead">${MUH_ACTS[muhAct]} &#8212; the strongest days in the next
      ${muhDays}, each with its reasons. Times favour Abhijit muhurta around solar noon.</p>
    <div class="feelseg" style="margin-bottom:10px" id="muhact">
      ${Object.entries(MUH_ACTS).slice(0,3).map(([k,v])=>
        `<button data-a="${k}" class="${muhAct===k?"on":""}">${v.split(" ")[0]}</button>`).join("")}
    </div>
    <div class="feelseg" style="margin-bottom:16px" id="muhrange">
      ${[7,14,30].map(n=>`<button data-n="${n}" class="${muhDays===n?"on":""}">${n} days</button>`).join("")}
    </div>
    ${ranked.map(x=>`
      <div class="card ${x.s>=3?"":""}" style="margin-bottom:10px;padding:13px 15px${x.s>=3?";border-color:rgba(194,155,78,.45)":""}">
        <div class="areahead">
          <span class="aname">${x.d.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"short"})}</span>
          <span class="atone ${x.s>=3?"favourable":x.s>=1?"balanced":"slow"}">${x.s>=3?"Favourable":x.s>=1?"Workable":"Slower"}</span>
        </div>
        ${x.reasons.map(r=>`<p class="interp" style="margin:5px 0 0;font-size:12.5px">${r}</p>`).join("")}
      </div>`).join("")}
    <p class="note">A screening of the panchang &#8212; tara bala, the Moon&#8217;s count,
    tithi, weekday and karana &#8212; not a guarantee, and never a substitute for
    practical or medical judgement. Deeper activity-specific rules (lagna of the hour,
    choghadiya fit) arrive with the engine&#8217;s next pass.</p>`;
}
function wireMuhurta(){
  const pb=document.getElementById("muhpro");
  if(pb){ pb.onclick=()=>{buzz(8);openProSheet();}; return; }
  document.getElementById("muhact").onclick=e=>{
    const b=e.target.closest("[data-a]"); if(!b)return;
    muhAct=b.dataset.a; buzz(6); renderSub(); };
  document.getElementById("muhrange").onclick=e=>{
    const b=e.target.closest("[data-n]"); if(!b)return;
    muhDays=+b.dataset.n; buzz(6); renderSub(); };
}

/* ---- IN-APP REPORTS — the paid product, previewed live -----------
   Same engine, rendered as a paper document; Safari's share sheet
   prints it to PDF today, purchase + email arrive with the App Store
   build. ---- */
function repDasha3Rows(){
  const E=engine(), now=new Date();
  const m3=E.d3.mahadashas.find(m=>now>=m.start&&now<m.end);
  const a3=m3?.antardashas.find(a=>now>=a.start&&now<a.end);
  const p3=a3?.pratyantardashas?.find(p=>now>=p.start&&now<p.end);
  return {m3,a3,p3};
}
function subReportView(){
  const E=engine();
  const {m3,a3,p3}=repDasha3Rows();
  const karakas=(()=>{
    const KN=["Atmakaraka","Amatyakaraka","Bhratrukaraka","Matrukaraka",
      "Putrakaraka","Gnatikaraka","Darakaraka"];
    const ranked=CHART.placements.filter(p=>p.graha!=="Rahu"&&p.graha!=="Ketu")
      .map(p=>({g:p.graha,deg:p.L%30})).sort((a,b)=>b.deg-a.deg);
    return ranked.map((r,i)=>[KN[i],`${r.g} &#183; ${r.deg.toFixed(2)}&#176; in its sign`]);
  })();
  const moonSign=CHART.get("Moon").sign;
  const sati=sadeSatiWindows(moonSign, CHART.birthDate).slice(0,3);
  const VD=[1,2,3,9,10,12,30];
  const vtables=VD.map(D=>({D,ch:E.varga(D)}));
  return `
  <div class="paper report">
    <div class="repbanner">Preview &#8212; purchasing and email delivery arrive with the
      App Store build. Print to PDF from the share menu today.</div>
    <h2 style="font-size:22px">${ACTIVE.name} &#8212; Vedic Birth Chart</h2>
    <p class="evmeta">${ACTIVE.p?`${fmtDate(new Date(ACTIVE.p.born))}, ${fmtClock(new Date(ACTIVE.p.born))} IST &#183; ${ACTIVE.p.place||""}`
      :"26 Mar 1992, 10:00 AM IST &#183; Kopargaon"} &#183; Lahiri ayanamsa &#183; whole-sign houses</p>
    <p class="interp" style="font-style:italic">Every position is computed deterministically
      and every reading names the placement that produced it &#8212; a compass for
      reflection, not a prediction.</p>

    <div class="eyebrow" style="margin:18px 0 8px">Grahas at birth</div>
    ${rows(CHART.placements.map(p=>[`${gIcon(p.graha)}${p.graha}`,
      `${SIGNS[p.sign-1]} ${p.degf} &#183; ${p.nak} ${p.pada} &#183; house ${p.house}${p.retro?" &#183; R":""}`]))}

    <div class="eyebrow" style="margin:20px 0 8px">Houses and their lords</div>
    ${rows(Array.from({length:12},(_,i)=>{const h=i+1,sg=CHART.signOfHouse(h),l=SIGN_LORD[sg];
      return [`House ${h} &#183; ${SIGNS[sg-1]}`,`${gIcon(l,15)}${l} &#8594; house ${CHART.get(l).house}`]}))}

    <div class="eyebrow" style="margin:20px 0 8px">Divisional charts</div>
    <div class="tblwrap-x"><table class="reptable"><thead><tr><th></th>
      ${VD.map(D=>`<th>D${D}</th>`).join("")}</tr></thead><tbody>
      ${["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"].map(g=>
        `<tr><td>${g}</td>${vtables.map(v=>`<td>${v.ch[g]?SIGNS[v.ch[g]-1].slice(0,3):"&#8212;"}</td>`).join("")}</tr>`).join("")}
    </tbody></table></div>
    <p class="note" style="margin-top:6px">18 divisional charts are computed and validated;
      seven shown here, the full set ships in the purchased PDF.</p>

    <div class="eyebrow" style="margin:20px 0 8px">Vimshottari &#8212; the 120 years</div>
    ${rows(E.d3.mahadashas.map(m=>[`${gIcon(m.lord,15)}${m.lord}`,
      `${fmtDate(m.start)} &#8594; ${fmtDate(m.end)}`]))}
    ${m3&&a3?`<p class="interp" style="margin-top:10px">Right now:
      <b>${m3.lord} &#8594; ${a3.lord}${p3?` &#8594; ${p3.lord}`:""}</b>
      ${p3?`(pratyantar to ${fmtDate(p3.end)})`:""}.</p>`:""}

    <div class="eyebrow" style="margin:20px 0 8px">Ashtakavarga &#8212; sarvashtakavarga</div>
    <div class="tblwrap-x"><table class="reptable"><thead><tr>
      ${SIGNS.map(s=>`<th>${s.slice(0,3)}</th>`).join("")}</tr></thead>
      <tbody><tr>${E.sav.map(b=>`<td${b>=30?' class="hi"':b<=25?' class="lo"':""}>${b}</td>`).join("")}</tr></tbody>
    </table></div>
    <p class="note" style="margin-top:6px">Total 337 &#183; average 28 per sign. Strong and
      lean signs marked.</p>

    ${E.sb?(()=>{ const gs=Object.entries(E.sb.grahas)
        .sort((a,b)=>b[1].rupas-a[1].rupas);
      return `
    <div class="eyebrow" style="margin:20px 0 8px">Shadbala &#8212; six-fold strength</div>
    ${rows(gs.map(([g,v],i)=>[`${gIcon(g,15)}${g}${i===0?" &#183; strongest":""}`,
      `${v.rupas.toFixed(2)} rupas`]))}
    <p class="note" style="margin-top:6px">Positional, temporal, directional, motional,
      natural and aspectual strength combined, per the classical formulas &#8212;
      validated against printed professional tables.</p>`})():""}

    <div class="eyebrow" style="margin:20px 0 8px">Yogas &#8212; with their reasons</div>
    ${E.yogas.map(y=>`<p class="interp"><b>${y.name}</b>${y.strength?` (${y.strength})`:""}
      &#8212; ${y.because}</p>`).join("")}

    <div class="eyebrow" style="margin:20px 0 8px">Doshas</div>
    ${E.doshas.map(d=>`<p class="interp"><b>${d.name}: ${d.present?"present":"absent"}.</b>
      ${d.because}</p>`).join("")}
    <p class="interp"><b>Manglik: ${manglik(CHART)?"yes":"no"}.</b> Mars occupies house
      ${CHART.get("Mars").house}; the dosha counts houses 1, 4, 7, 8 and 12 from the
      lagna (some schools add the 2nd).</p>

    <div class="eyebrow" style="margin:20px 0 8px">Sade sati windows</div>
    ${rows(sati.map(w=>[`${fmtDate(w.start)} &#8594; ${fmtDate(w.end)}`,
      `${ageSpan(w.start,w.end)}${w.atBirth?" &#183; running at birth":""}`]))}

    <div class="eyebrow" style="margin:20px 0 8px">Chara karakas</div>
    ${rows(karakas)}

    <p class="note" style="margin-top:16px">Generated by Astra&#8217;s deterministic engine
      &#8212; validated cell-by-cell against printed professional reports. Traditional
      Vedic associations, not predictions; nothing here is medical, legal or financial
      advice. Rahu/Ketu: true node.</p>
    <button class="primary printbtn" id="doprint">Print / save as PDF</button>
  </div>`;
}
function subRelReportView(){
  const p=partners()[subArg||0];
  if(!p){subView="report";return subReport()}
  const me={moonL:CHART.get("Moon").L};
  const k=ashtakoota(me,{moonL:p.moonL});
  const pd=new Date(p.born);
  const pchart=chartFor(pd, ascendant(pd, p.lat??BIRTHPLACE.lat, p.lon??BIRTHPLACE.lon));
  const years=Array.from({length:10},(_,i)=>2026+i).map(y=>{
    const d=new Date(y,0,15);
    const a=CHART.dasha.at(d), b=pchart.dasha.at(d);
    return [String(y),`${a?`${a.maha.lord}/${a.antar.lord}`:"&#8212;"} &#183; ${b?`${b.maha.lord}/${b.antar.lord}`:"&#8212;"}`];
  });
  return `
  <div class="paper report">
    <div class="repbanner">Preview &#8212; purchasing and email delivery arrive with the
      App Store build. Print to PDF from the share menu today.</div>
    <h2 style="font-size:22px">Sangram &amp; ${p.name} &#8212; Relationship Report</h2>
    <p class="evmeta">Gun Milan &#183; both charts computed &#183; Lahiri ayanamsa</p>
    <div class="scorecard" style="margin:14px 0">
      <div class="scorenum" style="color:${k.total>=18?"var(--mercury)":"var(--mars)"}">${k.total}<small>/36</small></div>
      <div style="flex:1"><p class="interp" style="margin:0">${k.total>=28?"Traditionally a strong match"
        :k.total>=18?"Above the classical threshold of 18":"Below the classical threshold of 18"} &#8212;
        and a score is a conversation starter, not a verdict.</p></div>
    </div>
    <div class="eyebrow" style="margin:16px 0 8px">The eight kootas</div>
    ${k.kootas.map(x=>`<p class="interp"><b>${x.name} &#183; ${x.got}/${x.max}</b> &#8212;
      you: ${x.a}, ${p.name.split(" ")[0]}: ${x.b}. ${x.about}</p>`).join("")}
    <div class="eyebrow" style="margin:20px 0 8px">Manglik</div>
    <p class="interp">You: <b>${manglik(CHART)?"yes":"no"}</b> (Mars in house ${CHART.get("Mars").house}).
      ${p.name.split(" ")[0]}: <b>${manglik(pchart)?"yes":"no"}</b> (Mars in house ${pchart.get("Mars").house}).</p>
    <div class="eyebrow" style="margin:20px 0 8px">Your seasons, side by side</div>
    <p class="ameta" style="margin:0 0 8px">Each year: your maha/antar &#183; theirs</p>
    ${rows(years)}
    <p class="note" style="margin-top:16px">Gun Milan is one traditional method among
      several; kootas marked simplified in the app use reduced classical tables. Nothing
      here predicts a relationship&#8217;s course.</p>
    <button class="primary printbtn" id="doprint">Print / save as PDF</button>
  </div>`;
}
function wireReportView(){
  const b=document.getElementById("doprint");
  if(b) b.onclick=()=>{buzz(8); window.print();};
}

const repLang=()=>PREFS().reportLang||(PREFS().lang==="en"||!PREFS().lang?"en":"hi");
/* the printed report renders on report.html; hand it the birth so it casts at once */
function openReportPage(lang){
  const born=ACTIVE.p?new Date(ACTIVE.p.born):BIRTH;
  const bp=ACTIVE.p?{lat:ACTIVE.p.lat??BIRTHPLACE.lat,lon:ACTIVE.p.lon??BIRTHPLACE.lon,name:ACTIVE.p.place||BIRTHPLACE.name}:BIRTHPLACE;
  const f=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false}).formatToParts(born);
  const g=t=>f.find(p=>p.type===t).value;
  const q=new URLSearchParams({name:ACTIVE.name,date:`${g("year")}-${g("month")}-${g("day")}`,time:`${g("hour")}:${g("minute")}`,
    lat:bp.lat,lon:bp.lon,place:(bp.name||"").split(",")[0],tz:"Asia/Kolkata",lang});
  window.open(`report.html?${q}`,"_blank");
}
function subReport(){
  const now=CHART.dasha.at(new Date());
  const tag="";
  return `
    <div class="card repcard">
      <div class="rephead">
        <svg class="ico" viewBox="0 0 24 24">${ICONS.doc}</svg>
        <div><b>Your kundali report</b>
          <span>Every graha, house and lord; the full Vimshottari; yogas, strengths and
          traditional practices &#8212; written for you, not filled into a template.</span></div>
        ${tag}
      </div>
      ${rows([["For",ACTIVE.name],["Chart",`${SIGNS_SK[CHART.lagna-1]} lagna`],
              ["Current period",`${now.maha.lord}/${now.antar.lord}`],
              ["Price","&#8377;499 &#183; $14.99 &#183; one-time"],
              ["Delivery","in the app + by email"]])}
      <div class="replang">
        <span class="k">Report language</span>
        <div class="feelseg" id="replang">
          ${[["en","English"],["hi","हिन्दी"]].map(([k,v])=>`<button data-l="${k}" class="${repLang()===k?"on":""}">${v}</button>`).join("")}
        </div>
        ${repLang()==="hi"?`<p class="ameta" style="margin:6px 0 0">Hindi is a reviewed draft: tables and readings in Hindi, a few interpretive passages still in English.</p>`:""}
      </div>
      <button class="primary" data-rep="self">Get for &#8377;499 &#183; $14.99</button>
      <button class="proclose" data-prev="self" style="margin:2px 0 0">Preview in app</button>
    </div>
    ${partners().map((p,i)=>`
    <div class="card repcard">
      <div class="rephead">
        <svg class="ico" viewBox="0 0 24 24">${ICONS.people}</svg>
        <div><b>Relationship report &#183; ${p.name}</b>
          <span>Both charts side by side; the eight kootas with their reasons;
          the periods that matter for the two of you.</span></div>
      </div>
      ${rows([["Price","&#8377;399 &#183; $11.99 &#183; one-time"],["Delivery","in the app + by email"]])}
      <button class="primary" data-rep="rel${i}">Get for &#8377;399 &#183; $11.99</button>
      <button class="proclose" data-prev="rel${i}" style="margin:2px 0 0">Preview in app</button>
    </div>`).join("")}
    <p class="note">Reports come from the same engine the app runs on, so a report and its
    screens can never disagree. Nothing here is sold on fear, and no remedy is gated
    behind payment.</p>`;
}
function wireReport(){
  const rl=document.getElementById("replang");
  if(rl) rl.onclick=e=>{ const b=e.target.closest("[data-l]"); if(!b) return; buzz(6); setPref("reportLang",b.dataset.l); renderSub(); };
  document.querySelectorAll("[data-rep]").forEach(b=>b.onclick=()=>{
    buzz(8);
    b.textContent="Purchases arrive with the App Store build";
    b.disabled=true;
  });
  document.querySelectorAll("[data-prev]").forEach(b=>b.onclick=()=>{
    buzz(8);
    const v=b.dataset.prev;
    if(v==="self"){ if(repLang()==="hi"){ openReportPage("hi"); return; } subView="reportview"; subArg=null; }
    else { subView="relreportview"; subArg=+v.slice(3); }
    renderSub();
  });
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
  const langLabel={en:"English",hi:"&#2361;&#2367;&#2344;&#2381;&#2342;&#2368;",mix:"Hinglish"}[pr.lang||"en"];
  return `
    <div class="setgroup">
      ${picker("lang","Language",["English","&#2361;&#2367;&#2344;&#2381;&#2342;&#2368;","Hinglish"],langLabel,
        "Guide replies and voice; full app translation coming")}
    </div>
    <div class="setgroup">
      ${picker("ayan","Ayanamsa",AYANAMSAS,pr.ayanamsa||"Lahiri","Sidereal offset")}
      ${picker("style","Chart style",STYLES,pr.style||"North Indian")}
    </div>
    <div class="setgroup">
      ${tog("s_nodal","Nodal drishti",!!pr.nodal,"Rahu and Ketu aspect the 5th and 9th")}
      ${tog("s_haptics","Haptics",pr.haptics!==false)}
    </div>
    <div class="setgroup">
      ${tog("s_pro","Astra Pro (preview)",isPro(),"Unlocks Pro features while pricing is decided")}
    </div>
    <p class="note">Ayanamsa and chart style are saved but not yet applied.</p>`;
}

function wireSettings(){
  document.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>{
    setOpen=setOpen===b.dataset.open?null:b.dataset.open; buzz(5); renderSub();
  });
  document.querySelectorAll("[data-set]").forEach(b=>b.onclick=()=>{
    if(b.dataset.set==="lang"){
      const code={"English":"en","Hinglish":"mix"}[b.dataset.val]||"hi";
      setPref("lang",code);
    } else setPref(b.dataset.set==="ayan"?"ayanamsa":"style", b.dataset.val);
    setOpen=null; buzz(8); renderSub();
  });
  const n=document.getElementById("s_nodal");
  n.onclick=()=>{const v=!n.classList.contains("on");n.classList.toggle("on",v);
    n.setAttribute("aria-checked",v);setPref("nodal",v);
    CHART.drishtiNodal=v; buzz(8);};
  const h=document.getElementById("s_haptics");
  h.onclick=()=>{const v=!h.classList.contains("on");h.classList.toggle("on",v);
    h.setAttribute("aria-checked",v);setPref("haptics",v);if(v)buzz(10)};
  const pp=document.getElementById("s_pro");
  if(pp) pp.onclick=()=>{const v=!pp.classList.contains("on");pp.classList.toggle("on",v);
    pp.setAttribute("aria-checked",v);setPref("pro",v);buzz(8)};
}

/* ---- BIRTH DETAILS: the complete reference file for a natal chart
   (Tab-2 spec part B). One parent destination, six subtabs. Birth
   Details is structured reference; Universe stays the place for
   immersive exploration - every row here deep-links there. ---- */
let bdTab="overview";
const BD_TABS=[["overview","Overview"],["planets","Planets"],["houses","Houses"],
  ["vargas","Divisional Charts"],["yogas","Yogas"],["dashas","Dashas"],["sati","Sade Sati"]];
/* monoline glyphs (24-box, stroke) for category controls — the same language as the tab bar */
const SEG_ICON={
  horo:'<path d="M12 3.5l2.2 5.1 5.5.5-4.2 3.7 1.3 5.4L12 15.4l-4.8 2.8 1.3-5.4L4.3 9.1l5.5-.5z"/>',
  sky:'<circle cx="12" cy="12" r="3.2"/><path d="M4.5 12a7.5 7.5 0 0113.9-3.9M19.5 12a7.5 7.5 0 01-13.9 3.9"/><path d="M18.6 5.2v3h-3M5.4 18.8v-3h3"/>',
  panch:'<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 9.6h17M8 3.2v3.6M16 3.2v3.6"/><path d="M12.5 12.4a2.4 2.4 0 102.4 3.4 3 3 0 11-2.4-3.4z"/>',
  overview:'<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17M3.5 12h17"/>',
  planets:'<circle cx="12" cy="12" r="4"/><path d="M4.2 9.6c-1.6 3.4 8 9.6 14.6 6.6M19.8 14.4c1.6-3.4-8-9.6-14.6-6.6"/>',
  houses:'<path d="M12 3.2l8.8 8.8L12 20.8 3.2 12z"/><path d="M12 3.2v17.6M3.2 12h17.6"/>',
  vargas:'<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M3.5 9.2h17M3.5 14.8h17M9.2 3.5v17M14.8 3.5v17"/>',
  yogas:'<path d="M9.5 14.5a4 4 0 010-5.7l1.4-1.4a4 4 0 015.7 5.7l-1 1"/><path d="M14.5 9.5a4 4 0 010 5.7l-1.4 1.4a4 4 0 01-5.7-5.7l1-1"/>',
  dashas:'<circle cx="12" cy="12" r="8.6"/><path d="M12 7.2V12l3.2 2"/>',
  sati:'<circle cx="12" cy="12" r="3.8"/><path d="M3.4 10.2c-1.2 2 4.2 6 10.6 5.2s9.6-4.4 7.8-6.4M5.5 8.6c2.4-1.6 6-2.2 9.8-1.6"/>'};
const segIcon=k=>SEG_ICON[k]?`<svg class="segico" viewBox="0 0 24 24" aria-hidden="true">${SEG_ICON[k]}</svg>`:"";

function subBirth(){
  const body={overview:bdOverview,planets:bdPlanets,houses:bdHouses,vargas:bdVargas,
    yogas:subYogas,dashas:bdDashas,sati:bdSati}[bdTab]();
  return `
    <div class="bdrail" id="bdrail" role="tablist" aria-label="Birth details section">
      ${BD_TABS.map(([k,l])=>`<button class="${bdTab===k?"on":""}" data-b="${k}"
        role="tab" aria-selected="${bdTab===k}">${segIcon(k)}${l}</button>`).join("")}
    </div>
    <div id="bdbody">${body}</div>`;
}

function bdOverview(){
  const idRows=ACTIVE.p
    ? (()=>{const p=ACTIVE.p, d=new Date(p.born);
        return rows([["Name",ACTIVE.name],["Date",fmtDate(d)],
          ["Time",p.approx?"not given (noon assumed)":`${fmtClock(d)} IST`],
          ["Place",p.place||"&#8212;"],
          ["Lagna",`${SIGNS_SK[CHART.lagna-1]} &#183; ${fmtDeg(CHART.ascendant)}`],
          ["Moon",`${SIGNS[CHART.get("Moon").sign-1]} &#183; ${CHART.get("Moon").nak}`],
          ["Ayanamsa","Lahiri"]])})()
    : rows([["Date","26 Mar 1992"],["Time","10:00 AM IST"],
        ["Place","Kopargaon, Maharashtra"],["Coordinates","19.88N  74.48E"],
        ["Lagna",`Vrishabha &#183; ${fmtDeg(CHART.ascendant)}`],
        ["Lagna nakshatra",`${NAK[nakOf(CHART.ascendant)]} &#183; pada ${padaOf(CHART.ascendant)}`],
        ["Moon",`${SIGNS[CHART.get("Moon").sign-1]} &#183; ${CHART.get("Moon").nak}`],
        ["Ayanamsa","Lahiri"]]);
  return `
    ${idRows}
    ${!ACTIVE.p?`
    <div class="eyebrow" style="margin:22px 0 8px">Panchang at birth</div>
    ${rows(Object.entries(birthPanchang()))}
    <div class="eyebrow" style="margin:22px 0 8px">Avakhada</div>
    ${rows(Object.entries(avakhadaOf(CHART.get("Moon").L)))}`:""}
    <button class="item" id="bd2chart" style="margin-top:18px">
      <svg class="ico" viewBox="0 0 24 24">${ICONS.chart}</svg>
      View birth chart<span class="chev">&#8250;</span></button>
    <button class="item" id="bd2rep">
      <svg class="ico" viewBox="0 0 24 24">${ICONS.doc}</svg>
      Detailed birth report<span class="sub">complete natal chart, planets, houses,
      yogas, dashas and interpretation</span><span class="chev">&#8250;</span></button>
    <p class="note">Everything on this screen is computed from the birth longitudes
    &#8212; the same engine the printed reports use.</p>`;
}

function bdPlanets(){
  return `
    <p class="skylead">All nine grahas as they stood at birth. Tap one to explore
      it in Universe.</p>
    ${CHART.placements.map(p=>`
      <button class="bdrow" data-planet="${p.graha}">
        <img src="assets/graha/${p.graha.toLowerCase()}.png" alt="" width="34" height="34">
        <span><b>${p.graha}${p.retro?` <i class="rflag">R</i>`:""}</b>
          <span class="evmeta">${SIGNS[p.sign-1]} ${p.degf} &#183; ${ordinal(p.house)} house
          &#183; ${p.nak}${p.pada?` ${p.pada}`:""}${p.dig?` &#183; ${p.dig.toLowerCase()}`:""}</span></span>
        <span class="chev">&#8250;</span>
      </button>`).join("")}`;
}

function bdHouses(){
  return `
    <p class="skylead">The twelve houses of your chart. Tap one to open it in
      Universe.</p>
    ${Array.from({length:12},(_,i)=>{
      const h=i+1, s=CHART.signOfHouse(h), lord=SIGN_LORD[s];
      const seat=CHART.get(lord), occ=CHART.occupants(h);
      return `<button class="bdrow" data-house="${h}">
        <span class="bdh">${h}</span>
        <span><b>${BHAVA[i][1]}</b>
          <span class="evmeta">${SIGNS[s-1]} &#183; lord ${lord}, in your
          ${ordinal(seat.house)}${occ.length?` &#183; holds ${occ.map(o=>o.graha).join(", ")}`:""}</span></span>
        <span class="chev">&#8250;</span>
      </button>`}).join("")}`;
}

function bdDashas(){
  const D=CHART.dasha, nowD=new Date(), now=D.at(nowD);
  const p3=now?pratAt(nowD,now):null;
  return `
    <p class="skylead">The Vimshottari sequence as reference &#8212; the interactive
      way to move through it is the Timeline.</p>
    ${rows([["Starting lord",`${D.birthLord} &#8212; from your Moon in ${CHART.get("Moon").nak}`],
      ["Balance at birth",`${D.balance.toFixed(1)} years of ${D.birthLord} remained`]])}
    <div class="eyebrow" style="margin:20px 0 8px">Running now</div>
    ${now?rows([["Mahadasha",`${now.maha.lord} &#183; ${fmtDate(now.maha.start)} &#8594; ${fmtDate(now.maha.end)}`],
      ["Antardasha",`${now.antar.lord} &#183; ${fmtDate(now.antar.start)} &#8594; ${fmtDate(now.antar.end)}`],
      ...(p3?[["Pratyantardasha",`${p3.lord} &#183; ${fmtDate(p3.start)} &#8594; ${fmtDate(p3.end)}`]]:[])]):""}
    <div class="eyebrow" style="margin:20px 0 8px">The full sequence</div>
    ${D.mahas.slice(0,9).map(m=>{
      const on=now&&m.lord===now.maha.lord&&m.start.getTime()===now.maha.start.getTime();
      return `<div class="bdseq${on?" on":""}">${gIcon(m.lord,16)}
        <b>${m.lord}</b><span class="evmeta">${fmtDate(m.start)} &#8594; ${fmtDate(m.end)}
        &#183; ${ageSpan(m.start,m.end)}</span></div>`}).join("")}
    <button class="item" id="bd2tl" style="margin-top:16px">
      <svg class="ico" viewBox="0 0 24 24">${ICONS.clock}</svg>
      Open interactive Timeline<span class="chev">&#8250;</span></button>`;
}

/* ---- SADE SATI (Birth Details) — the teaching experience -----------
   Understand -> locate yourself -> interpret -> see why -> inspect.
   Rising/Peak/Setting are friendly English labels; the astronomy
   (12th from Moon -> over Moon -> 2nd from Moon) is always shown
   beneath them. No fear language, no red, no severity scores. ---- */
const SATI_IDX={12:1,1:2,2:3};
const SATI_STORY={
  Rising:{t:"What begins to shift",
    s:"Preparation and release &#8212; loads shift and old supports thin before Saturn reaches your Moon sign."},
  Peak:{t:"What comes into focus",
    s:"Saturn crosses your natal Moon sign &#8212; traditionally considered especially significant: the audit of what is really solid."},
  Setting:{t:"What gets rebuilt",
    s:"Integration &#8212; what survived the pass is rebuilt stronger as Saturn moves beyond your Moon."}};
const SATI_REL={12:"the 12th sign from your Moon",1:"your Moon sign itself",2:"the 2nd sign from your Moon"};

function satiMerged(w){
  const by={};
  for(const p of w.phases){
    const k=p.fromMoon;
    if(!by[k]) by[k]={idx:SATI_IDX[k],phase:p.phase,fromMoon:k,sign:p.sign,
      start:p.start,end:p.end,spans:[p]};
    else { by[k].end=p.end; by[k].spans.push(p); }
  }
  return Object.values(by).sort((a,b)=>a.idx-b.idx);
}
const satiBand=moonSign=>[12,1,2].map(k=>((moonSign-1+(k===12?-1:k-1))%12+12)%12+1);
const durTxt=(a,b)=>{const m=Math.round((b-a)/(30.44*864e5));
  return m>=12?`${Math.floor(m/12)} yr ${m%12?`${m%12} mo`:""}`.trim():`${m} mo`};

/* the core teaching graphic: Moon fixed over the middle sign, Saturn
   positioned over the active phase. aria text carries the whole story. */
function satiJourney(moonSign,activeIdx,opts={}){
  const band=satiBand(moonSign);
  const aria=`Sade sati band for your ${SIGNS[moonSign-1]} Moon: phase 1 ${SIGNS[band[0]-1]}, the 12th sign from your Moon; phase 2 ${SIGNS[band[1]-1]}, your Moon sign; phase 3 ${SIGNS[band[2]-1]}, the 2nd sign from your Moon. Each lasts about two and a half years.`;
  return `<div class="sjour${opts.light?" light":""}" role="img" aria-label="${aria}">
    <div class="sjmoon"><img src="assets/graha/moon.png" alt="" width="30" height="30">
      <span>your Moon</span></div>
    ${activeIdx?`<img class="sjsat p${activeIdx}" src="assets/graha/saturn.png" alt="" width="34" height="34">`:""}
    <div class="sjcells">
      ${band.map((s,i)=>`<div class="sjcell${i===1?" moonseat":""}${activeIdx===i+1?" on":""}">
        <b>${SIGNS[s-1]}</b>
        <span class="sjp">Phase ${i+1} &#183; ${["Rising","Peak","Setting"][i]}</span>
        <span class="sjt">${["12th from Moon","Over your Moon","2nd from Moon"][i]}</span>
        <span class="sjy">~2&#189; yrs</span>
      </div>`).join(`<span class="sjarrow" aria-hidden="true">&#8594;</span>`)}
    </div>
  </div>`;
}

function bdSati(){
  const moonSign=CHART.get("Moon").sign;
  const wins=satiWindows();
  const nowD=new Date();
  const cur=saturnFromMoon(moonSign,nowD);
  const act=satiAt(nowD);
  const band=satiBand(moonSign);
  const curWin=wins.find(w=>nowD>=w.start&&nowD<w.end);
  const prevWin=[...wins].reverse().find(w=>w.end<=nowD);
  const nxt=wins.find(w=>w.start>nowD);
  const approx=(ACTIVE.p&&ACTIVE.p.approx)||(!ACTIVE.p&&typeof meProfile==="function"&&meProfile()?.noTime);
  const mdeg=CHART.get("Moon").L%30;
  if(approx&&(mdeg<2||mdeg>28)) return `
    <div class="card special">
      ${gIcon("Saturn",22)} <b>Your Moon sign needs a birth time first</b>
      <p>The Moon stood within ${mdeg<2?mdeg.toFixed(1):(30-mdeg).toFixed(1)}&#176; of a
      sign boundary on your birth day, so an approximate birth time could change which
      Moon sign applies &#8212; and sade sati is defined entirely by that sign. Add a
      birth time in your profile and this page unlocks with confident dates.</p>
    </div>`;
  const dTo=d=>{const n=Math.round((d-nowD)/864e5);
    return n>730?`${(n/365.25).toFixed(1)} years`:`${n} days`};
  const born=CHART.birthDate;
  const spanY0=born.getFullYear(), spanY1=spanY0+92;
  const pct=d=>Math.min(Math.max((d-born)/((spanY1-spanY0)*365.25*864e5),0),1)*100;
  return `
    <p class="skylead">Saturn&#8217;s 7&#189;-year journey around your natal Moon.</p>

    <div class="card special satihero">
      ${act?`
        <b>You are in Sade Sati</b>
        <p class="satiherop">Phase ${SATI_IDX[act.ph.fromMoon]} of 3 &#183;
          ${act.ph.phase==="Peak"?"Saturn over your Moon sign":`Saturn in ${SIGNS[act.ph.sign-1]}`}
          &#183; until ${fmtDate(curWin.end)}</p>
        <div class="bar sm"><i style="width:${(((nowD-curWin.start)/(curWin.end-curWin.start))*100).toFixed(1)}%;background:#8A7FBF"></i></div>`
      :`
        <b>You are not currently in Sade Sati</b>
        <p class="satiherop">Saturn stands ${ordinal(cur)} from your natal Moon &#8212;
          outside the three signs that surround it.</p>
        ${nxt?`<div class="satinext"><span>Next cycle begins</span><b>${fmtDate(nxt.start)}</b>
          <span class="evmeta">${dTo(nxt.start)} from today &#183; age ${ageAt(nxt.start)}</span></div>`:""}`}
    </div>

    <h3 class="secttl" style="margin-top:22px">Your Moon</h3>
    <p class="interp">&#8220;Your Moon&#8221; means the sign the Moon occupied at the
      minute you were born &#8212; the <button class="term" data-bdterm="natal">natal
      Moon</button><span class="termdef" hidden>Not today&#8217;s Moon, not your
      Ascendant, not the moving monthly Moon &#8212; the fixed reference point your
      whole sade sati is measured from.</span>. Yours was in
      <b>${SIGNS[moonSign-1]}</b>, so sade sati begins when Saturn enters
      <b>${SIGNS[band[0]-1]}</b>, continues through <b>${SIGNS[moonSign-1]}</b>, and ends
      when Saturn leaves <b>${SIGNS[band[2]-1]}</b>.</p>

    <h3 class="secttl" style="margin-top:20px">How Sade Sati works</h3>
    ${satiJourney(moonSign, act?SATI_IDX[act.ph.fromMoon]:null)}

    <h3 class="secttl" style="margin-top:20px">Why 7&#189; years?</h3>
    <div class="satimath" aria-label="Saturn takes about 29 and a half years around the zodiac, about two and a half years per sign, three signs make about seven and a half years">
      <span><b>29&#189; yrs</b>around the zodiac</span><i>&#247; 12</i>
      <span><b>~2&#189; yrs</b>per sign</span><i>&#215; 3</i>
      <span><b>~7&#189; yrs</b>sade sati</span>
    </div>

    <h3 class="secttl" style="margin-top:20px">Your Sade Sati cycles</h3>
    <p class="interp" style="margin-top:2px">Saturn returns to the same region of the sky
      roughly every 29&#189; years, so a lifetime usually holds two or three cycles.</p>
    <div class="slife" role="list">
      <div class="slifetrack">
        ${wins.map((w,i)=>{const on=nowD>=w.start&&nowD<w.end;
          return `<button class="slifeseg${w.end<=nowD?" past":""}${on?" on":""}" role="listitem"
            data-cyc="${i}" style="left:${pct(w.start).toFixed(2)}%;width:${(pct(w.end)-pct(w.start)).toFixed(2)}%"
            aria-label="Sade sati ${w.start.getFullYear()} to ${w.end.getFullYear()}, ${w.start<CHART.birthDate?"from birth":"age "+ageAt(w.start)} to age ${ageAt(w.end)}${on?", running now":w.end<=nowD?", completed":", ahead"}"></button>`}).join("")}
        ${nowD>born?`<span class="slifenow" style="left:${pct(nowD).toFixed(2)}%" title="today"></span>`:""}
      </div>
      <div class="slifescale"><span>birth</span><span>age 30</span><span>age 60</span><span>age 90</span></div>
    </div>
    ${wins.map((w,i)=>{const on=nowD>=w.start&&nowD<w.end;
      return `<button class="bdrow" data-cyc="${i}">
        <span class="bdh">${i+1}</span>
        <span><b>${w.start.getFullYear()} &#8594; ${w.end.getFullYear()}${w.atBirth?" &#183; running at your birth":on?" &#183; now":""}</b>
          <span class="evmeta">${fmtDate(w.start)} &#8211; ${fmtDate(w.end)} &#183; ${ageSpan(w.start,w.end)}</span></span>
        <span class="chev">&#8250;</span>
      </button>`}).join("")}

    <h3 class="secttl" style="margin-top:22px">Same Sade Sati. Different life.</h3>
    <p class="interp">Everyone with a ${SIGNS[moonSign-1]} Moon enters these broad Saturn
      phases at roughly the same time. The experience differs because the rest of the
      chart differs &#8212; Ascendant, houses, what Saturn rules, your natal Saturn,
      and the dasha running underneath.</p>
    <button class="item" id="satiwhydiff">
      <svg class="ico" viewBox="0 0 24 24">${ICONS.book}</svg>
      Why is my Sade Sati different?<span class="chev">&#8250;</span></button>
    <div id="satidiff" hidden>
      <div class="satidiffcols">
        <div><span class="sk">Same sky</span>
          <p>Saturn crossing ${SIGNS[band[0]-1]} &#8594; ${SIGNS[moonSign-1]} &#8594; ${SIGNS[band[2]-1]}
          &#8212; identical for every ${SIGNS[moonSign-1]}-Moon chart.</p></div>
        <div><span class="sk">Different chart</span>
          <p>Your ${SIGNS_SK[CHART.lagna-1]} Ascendant makes ${SIGNS[moonSign-1]} your
          ${ordinal(CHART.houseOfSign(moonSign))} house; for a different Ascendant those same
          signs are different houses. Saturn rules your
          ${CHART.housesRuled("Saturn").map(ordinal).join(" and ")}; your natal Saturn sits in
          ${SIGNS[CHART.get("Saturn").sign-1]}${CHART.get("Saturn").dig?`, ${CHART.get("Saturn").dig.toLowerCase()}`:""};
          and your own dashas run on their own clock. Same weather &#8212; different house it
          falls on.</p></div>
      </div>
    </div>

    <details class="advd dark"><summary>How Astra calculates this</summary>
      <p class="interp">Sidereal zodiac with the Lahiri ayanamsa &#8212; the same settings
      as the rest of your chart. Your natal Moon sign is taken from the birth longitudes;
      Saturn&#8217;s sign entries come from the ephemeris, retrograde re-entries included,
      each boundary refined to the hour. The three-sign definition is classical: 12th
      from the Moon, the Moon sign, 2nd from the Moon. Personalisation layers use the
      Vimshottari dasha system and Parashari drishti, consistently with the rest of
      Astra.</p>
    </details>`;
}

/* ---- cycle page (spec 65): one window, its arc and its phases ---- */
function openSatiCycle(ci,card){
  const wins=satiWindows(), w=wins[ci]; if(!w) return;
  const moonSign=CHART.get("Moon").sign;
  const nowD=new Date();
  const on=nowD>=w.start&&nowD<w.end;
  const merged=satiMerged(w);
  const sub=w.atBirth?"Running at your birth"
    :on?"Your current Sade Sati"
    :w.end<=nowD?"Your previous Sade Sati":"Your next Sade Sati";
  const total=w.end-w.start;
  const crossings=satiCrossings(w);
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const actIdx=on?SATI_IDX[satiAt(nowD)?.ph.fromMoon]:null;
  const ov=document.createElement("div");
  ov.className="awpage";
  ov.innerHTML=`
    <header class="awtop">
      <button class="awback" aria-label="Back to Sade Sati">&#8249;</button>
      <span>Sade Sati &#183; ${w.start.getFullYear()}&#8211;${w.end.getFullYear()}</span>
    </header>
    <div class="awscroll">
      <p class="awlead" style="margin:4px 0 2px"><b>${sub}.</b>
        ${fmtDate(w.start)} to ${fmtDate(w.end)} &#183; ${w.start<CHART.birthDate?"from birth":"age "+ageAt(w.start)} to age ${ageAt(w.end)}.</p>
      ${satiJourney(moonSign,actIdx||1,{light:true})}
      <div class="scyc" role="img" aria-label="${merged.map(m=>`Phase ${m.idx} ${m.phase}, ${fmtDate(m.start)} to ${fmtDate(m.end)}`).join(". ")}">
        ${merged.map(m=>`<i class="scseg p${m.idx}" style="width:${(((m.end-m.start)/total)*100).toFixed(1)}%">
          <span>${m.phase}</span></i>`).join("")}
        ${on?`<span class="scnow" style="left:${(((nowD-w.start)/total)*100).toFixed(1)}%"><i></i>you are here</span>`:""}
      </div>
      <div class="scycscale"><span>${w.start.getFullYear()}</span><span>${w.end.getFullYear()}</span></div>
      ${merged.map(m=>{
        const pOn=nowD>=m.start&&nowD<m.end;
        return `<div class="sphcard${pOn?" on":""}">
        <div class="sphhead">
          <b>Phase ${m.idx} &#183; ${m.phase}</b>
          <span class="evmeta">Saturn in ${SIGNS[m.sign-1]} &#183; ${SATI_REL[m.fromMoon]}</span>
        </div>
        <p class="awbody" style="margin:6px 0 8px">${SATI_STORY[m.phase].s}</p>
        <p class="evmeta">${fmtDate(m.start)} &#8211; ${fmtDate(m.end)} &#183; ${durTxt(m.start,m.end)}${
          m.spans.length>1?` &#183; ${m.spans.length} crossings (retrograde)`:""}${pOn?" &#183; now":""}</p>
        <button class="awcta" data-ph="${m.idx}" style="margin-top:9px">Understand this phase</button>
      </div>`}).join("")}
      <h2 class="awh2">The arc of the seven and a half years</h2>
      <div class="sphcompare">
        ${merged.map(m=>`<div><b>${SATI_STORY[m.phase].t}</b><span>Phase ${m.idx} &#183; ${m.phase}</span></div>`).join("")}
      </div>
      <details class="advd"><summary>Advanced timing &#8212; exact Saturn crossings</summary>
        <div class="awrow" style="font-weight:600"><b>Date</b><span>Sign &#183; motion &#183; event</span></div>
        ${crossings.map(e=>`<div class="awrow"><b>${fmtDate(e.date)}</b>
          <span>${SIGNS[e.sign-1]} &#183; ${e.motion} &#183; ${e.kind}${e.kind==="Entry"?` (${e.phase})`:""}</span></div>`).join("")}
        <p class="awfoot" style="margin-top:8px">From the ephemeris, refined to the hour.
        A retrograde &#8220;temporary exit&#8221; means Saturn slipped back over the
        boundary before crossing for good &#8212; which is why phases are rarely one
        clean block.</p>
      </details>
      <div class="awctas" style="margin-top:14px">
        <button class="awcta" data-guide="1">Ask Guide about this cycle</button>
      </div>
      <p class="awfoot">Within traditional Jyotish these phases are read as one long
      Saturn season with edges &#8212; not a verdict. Astra&#8217;s dates come from
      Saturn&#8217;s real motion, retrogrades included.</p>
    </div>`;
  const src=awOpen(ov,card);
  const close=(then)=>awClose(ov,src,then);
  ov.querySelector(".awback").onclick=()=>close();
  ov.onclick=e=>{
    const p=e.target.closest("[data-ph]");
    if(p){ buzz(8); openSatiPhase(ci,+p.dataset.ph,p); return; }
    /* audit item 1: touching a phase card slides Saturn along the three
       signs - the movement itself is the lesson (spec 49) */
    const pc=e.target.closest(".sphcard");
    if(pc){
      const idx=+pc.querySelector("[data-ph]").dataset.ph;
      const s=ov.querySelector(".sjsat");
      if(s){ s.classList.remove("p1","p2","p3"); s.classList.add("p"+idx); }
      [...ov.querySelectorAll(".sjcell")].forEach((c,i)=>c.classList.toggle("on",i+1===idx));
      buzz(6);
      return;
    }
    if(e.target.closest("[data-guide]")){
      buzz(9);
      close(()=>askGuide("How might this Sade Sati cycle affect me?",
        {source:"sadesati",cycle:`${w.start.getFullYear()}-${w.end.getFullYear()}`,
         active:on,phases:merged.map(m=>({phase:m.phase,sign:SIGNS[m.sign-1],
           start:fmtDate(m.start),end:fmtDate(m.end)}))}));
    }
  };
}

/* ---- phase page (spec 66): the personalized reading -------------- */
function satiAreaModel(m){
  const hAsc=CHART.houseOfSign(m.sign);
  const dr=[3,7,10].map(o=>adv(hAsc,o));
  const ruled=CHART.housesRuled("Saturn");
  const w={}; const add=(h,pts,why)=>{(w[h]=w[h]||{pts:0,why:[]}); w[h].pts+=pts; w[h].why.push(why);};
  add(hAsc,3,`Saturn moves through your ${ordinal(hAsc)} house in this phase`);
  dr.forEach(h=>add(h,2,`Saturn&#8217;s drishti falls on your ${ordinal(h)}`));
  ruled.forEach(h=>add(h,2,`Saturn rules your ${ordinal(h)}`));
  add(CHART.get("Moon").house,1,`your natal Moon lives in your ${ordinal(CHART.get("Moon").house)}`);
  const mid=new Date((+m.start + +m.end)/2);
  const now=CHART.dasha.at(mid);
  if(now){ const anp=CHART.get(now.antar.lord);
    if(anp) add(anp.house,1,`the ${now.antar.lord} antardasha lord sits in your ${ordinal(anp.house)}`); }
  const areas=Object.entries(AREA_HOUSES).map(([a,hs])=>{
    let pts=0; const why=[];
    hs.forEach(h=>{ if(w[h]){ pts+=w[h].pts;
      w[h].why.forEach(x=>{ if(!why.some(y=>y.x===x)) why.push({x,p:w[h].pts}); }); } });
    return {area:a,pts,why:why.sort((q,r)=>r.p-q.p).map(q=>q.x).slice(0,3)};
  }).sort((a,b)=>b.pts-a.pts);
  return {hAsc,dr,ruled,mid,now,areas};
}
const SATI_EMPH=p=>p>=5?"Strong emphasis":p>=3?"Moderate emphasis":p>=1?"In the background":"Quiet";
const SATI_GUIDANCE={
  Career:"Keep commitments realistic and let progress be slow and cumulative.",
  Wealth:"Build a buffer; avoid stacking new heavy obligations mid-phase.",
  Relationships:"Say things plainly and early &#8212; patience over pressure.",
  "Home & Family":"Steady the base before extending it.",
  "Health & Well-being":"Protect sleep and routine &#8212; Saturn rewards rhythm.",
  "Inner Growth":"Keep a reflective practice; write the season down."};

function openSatiPhase(ci,idx,card){
  const wins=satiWindows(), w=wins[ci]; if(!w) return;
  const m=satiMerged(w).find(x=>x.idx===idx); if(!m) return;
  const moonSign=CHART.get("Moon").sign;
  const nowD=new Date();
  const pOn=nowD>=m.start&&nowD<m.end;
  const prog=pOn?Math.min(Math.max((nowD-m.start)/(m.end-m.start),0),1):null;
  const M=satiAreaModel(m);
  const moon=CHART.get("Moon"), sat=CHART.get("Saturn");
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const approx=(ACTIVE.p&&ACTIVE.p.approx)||(!ACTIVE.p&&typeof meProfile==="function"&&meProfile()?.noTime);
  /* antardashas overlapping this ~2.5y phase (spec 24) */
  const antars=[];
  for(const mh of CHART.dasha.mahas){
    if(mh.end<=m.start||mh.start>=m.end) continue;
    for(const a of CHART.dasha.antars(mh)){
      if(a.end<=m.start||a.start>=m.end) continue;
      antars.push({maha:mh.lord,lord:a.lord,
        start:new Date(Math.max(+a.start,+m.start)),
        end:new Date(Math.min(+a.end,+m.end)),
        full:a});
    }
  }
  const midSat=positions(M.mid).Saturn;
  const synth=sel=>{
    const now=sel?CHART.dasha.at(new Date((+sel.start + +sel.end)/2)):M.now;
    if(!now) return "";
    const mp=CHART.get(now.maha.lord);
    return `Saturn supplies the structural pressure of this phase &#8212; crossing
      ${SATI_REL[m.fromMoon]} while moving through your ${ordinal(M.hAsc)} house. The
      <b>${now.maha.lord} mahadasha</b> sets the wider environment
      (${now.maha.lord} sits in your ${ordinal(mp.house)}), and the
      <b>${now.antar.lord} antardasha</b> ${ANTAR_FLAVOR[now.antar.lord]}. Read
      together, the phase&#8217;s Saturn themes tend to land where those currents
      already point.`;
  };
  const topAreas=M.areas.filter(a=>a.pts>0).slice(0,5);
  const ov=document.createElement("div");
  ov.className="awpage";
  ov.innerHTML=`
    <header class="awtop">
      <button class="awback" aria-label="Back to cycle">&#8249;</button>
      <span>Phase ${idx} &#183; ${m.phase}</span>
    </header>
    <div class="awscroll">
      <div class="awinfhead" style="margin:6px 0 2px">
        <img class="awart" style="width:52px;height:52px" src="assets/graha/saturn.png" alt="">
        <div><b style="font-size:20px">${m.phase==="Peak"?"Saturn over your Moon":`Saturn in ${SIGNS[m.sign-1]}`}</b>
          <span>${SATI_REL[m.fromMoon]} &#183; ${fmtDate(m.start)} &#8211; ${fmtDate(m.end)}</span></div>
      </div>
      ${pOn?`<div class="bar sm" style="margin-top:8px"><i style="width:${(prog*100).toFixed(1)}%;background:#8A7FBF"></i></div>
        <p class="awbody" style="font-size:12.5px;color:#6B6E85">${Math.round(prog*100)}% through &#183; ends ${fmtDate(m.end)}</p>`:""}
      <h2 class="awh2">${SATI_STORY[m.phase].t}</h2>
      <p class="awbody">${SATI_STORY[m.phase].s}</p>
      <p class="awbody">${m.phase==="Peak"
        ?`The middle phase is traditionally considered especially significant because Saturn
          crosses the natal Moon sign &#8212; but &#8220;significant&#8221; is not
          &#8220;worst&#8221;. Which stretch asks most of you depends on your whole chart,
          not the phase number.`:""}
        In your chart this pass runs through your <b>${ordinal(M.hAsc)} house</b>
        (${BHAVA[M.hAsc-1][1].toLowerCase()}), so that is where the Saturn work is done.</p>
      ${approx?`<p class="awnote">Birth time is approximate &#8212; the house-based parts of
        this reading carry lower confidence; the Moon-sign timing itself is unaffected.</p>`:""}
      <h2 class="awh2">What may be emphasised</h2>
      ${topAreas.map(a=>`<div class="awrow satiarea"><div>
          <b>${a.area}</b><span style="display:block;text-align:left;margin-top:2px">${SATI_GUIDANCE[a.area]||""}</span>
          <span class="satiwhy" style="display:block;text-align:left;margin-top:3px">Why: ${a.why.join("; ")}.</span>
        </div><span class="satilev">${SATI_EMPH(a.pts)}</span></div>`).join("")}
      <h2 class="awh2">Why Astra reads it this way</h2>
      ${periodEvidence("Moon","Your natal Moon &#8212; the reference point")}
      <div class="awinfblock">
        <div class="awinfhead">
          <img class="awart" src="assets/graha/saturn.png" alt="">
          <div><b>Transit Saturn</b><span>during this phase</span></div>
        </div>
        <p class="awbody">Saturn crosses <b>${SIGNS[m.sign-1]}</b> &#8212;
          ${SATI_REL[m.fromMoon]} (this is what defines the phase), and separately your
          <b>${ordinal(M.hAsc)} house</b> counted from your ${SIGNS_SK[CHART.lagna-1]}
          Ascendant (this is what colours the life areas). Two different measures; the
          interface keeps them apart on purpose. From there its
          <button class="term" data-bdterm="drishti">drishti</button><span class="termdef" hidden>
          Saturn&#8217;s classical aspects: it &#8220;looks at&#8221; the 3rd, 7th and 10th
          houses from wherever it stands.</span> falls on your
          ${M.dr.map(ordinal).join(", ")} houses.</p>
      </div>
      ${periodEvidence("Saturn","Your natal Saturn &#8212; how you carry Saturn seasons")}
      <p class="awbody">${sat.dig?`A ${sat.dig.toLowerCase()} natal Saturn can change how
        Saturn themes &#8212; responsibility, structure, endurance &#8212; are expressed.
        It sets the tone; the whole chart still matters.`:""}</p>
      <h2 class="awh2">The dasha running underneath</h2>
      ${antars.length?`<div class="antstrip" id="antstrip">${antars.map((a,i)=>
        `<button class="antchip${nowD>=a.start&&nowD<a.end?" now":""}" data-ai="${i}">
          ${gIcon(a.lord,13)}${a.lord}<span>${a.start.getFullYear()}</span></button>`).join("")}</div>
      <p class="awbody" style="font-size:12.5px;color:#6B6E85">A 2&#189;-year phase spans
        several antardashas &#8212; tap one to read that stretch.</p>`:""}
      <p class="awbody" id="satisynth">${synth(antars.find(a=>nowD>=a.start&&nowD<a.end)||antars[0])}</p>
      <h2 class="awh2">How to work with this period</h2>
      ${topAreas.slice(0,3).map(a=>`<p class="awbody" style="margin-bottom:6px">&#8226; ${SATI_GUIDANCE[a.area]}</p>`).join("")}
      <p class="awbody" style="margin-bottom:6px">&#8226; Let the fear stories pass &#8212;
        this is a season with edges, not a verdict.</p>
      <details class="advd"><summary>Traditional Vedic practices</summary>
        <p class="awbody">Within Vedic tradition, Saturn periods are associated with
        observances directed to Shani &#8212; recitation, giving and service on
        Saturdays, and steady reflective discipline. Astra doesn&#8217;t promise any
        practice removes a transit; the tradition itself frames them as ways of
        meeting Saturn, not escaping it.</p>
      </details>
      <details class="advd"><summary>Advanced astrology</summary>
        ${rows([["Natal Moon",`${fmtDeg(moon.L)} &#183; ${SIGNS[moon.sign-1]} &#183; ${moon.nak}${moon.pada?` ${moon.pada}`:""}`],
          ["Natal Saturn",`${fmtDeg(sat.L)} &#183; ${SIGNS[sat.sign-1]}${sat.dig?` &#183; ${sat.dig}`:""}${sat.retro?" &#183; R":""}`],
          ["Saturn mid-phase",`${fmtDeg(midSat)} &#183; ${NAK[nakOf(midSat)]}`],
          ["Saturn rules",CHART.housesRuled("Saturn").map(ordinal).join(", ")],
          ["Transit house",`${ordinal(M.hAsc)} from Ascendant`],
          ["Drishti on",M.dr.map(ordinal).join(", ")],
          ["Crossings",`${m.spans.length} exact ${m.spans.length>1?"entries":"entry"} for this phase`]])}
      </details>
      <div class="awctas" style="margin-top:14px">
        <button class="awcta" data-act="natal" data-g="Moon">See Moon in birth chart</button>
        <button class="awcta" data-act="natal" data-g="Saturn">See Saturn in birth chart</button>
        <button class="awcta" data-act="skyat" data-g="Saturn">See Saturn during this phase</button>
        <button class="awcta" data-act="tl">See on Timeline</button>
        <button class="awcta" data-act="guide">Ask Guide about this phase</button>
      </div>
      <p class="awfoot">In traditional Jyotish this configuration is read as above &#8212;
      themes, not certainties. Dates from Saturn&#8217;s real motion; dasha overlap from
      the Vimshottari engine.</p>
    </div>`;
  const src=awOpen(ov,card);
  const close=(then)=>awClose(ov,src,then);
  ov.querySelector(".awback").onclick=()=>close();
  ov.onclick=e=>{
    const term=e.target.closest(".term");
    if(term){ const d=term.nextElementSibling;
      if(d&&d.classList.contains("termdef")) d.hidden=!d.hidden; return; }
    const ac=e.target.closest(".antchip");
    if(ac){ buzz(6);
      ov.querySelectorAll(".antchip").forEach(x=>x.classList.remove("sel"));
      ac.classList.add("sel");
      const s=document.getElementById("satisynth");
      if(s) s.innerHTML=synth(antars[+ac.dataset.ai]);
      return; }
    const b=e.target.closest(".awcta"); if(!b) return;
    buzz(9);
    if(b.dataset.act==="natal") close(()=>{ go(CHART_INDEX); setMode("birth"); openPlanet(b.dataset.g); });
    else if(b.dataset.act==="skyat") close(()=>openSkyAt("Saturn",new Date(pOn?Date.now():(+m.start + +m.end)/2)));
    else if(b.dataset.act==="tl") close(()=>{ tlSeek(new Date((+m.start + +m.end)/2)); });
    else if(b.dataset.act==="guide"){
      const now=M.now;
      close(()=>askGuide("How might this Sade Sati phase affect me?",
        {source:"sadesati",phase:`${idx} ${m.phase}`,saturnIn:SIGNS[m.sign-1],
         relationToMoon:SATI_REL[m.fromMoon],dates:`${fmtDate(m.start)} - ${fmtDate(m.end)}`,
         transitHouse:M.hAsc,drishtiOn:M.dr,
         mahadasha:now?now.maha.lord:undefined,antardasha:now?now.antar.lord:undefined}));
    }
  };
}

function tlSeek(date){
  const {t0,t1}=tlBounds();
  tlT=Math.min(Math.max((date.getTime()-t0)/(t1-t0),0),1);
  go(TIMELINE_INDEX);
}

/* ---- DIVISIONAL CHARTS (Birth Details) — spec parts 5-29 ----------
   Teach the calculation first, interpret after. Every number here
   comes from vargaDetail()/vargaChart() in vargas.js; the views never
   divide a sign themselves (part 54). ---- */
const G_ABBR={Sun:"Su",Moon:"Mo",Mars:"Ma",Mercury:"Me",Jupiter:"Ju",Venus:"Ve",Saturn:"Sa",Rahu:"Ra",Ketu:"Ke",Asc:"As"};
let vgMajorOnly=true, vgSort="uses", vgWalkG="Jupiter", vgWalkStep=1, vgHeroD=9, vgHeroTimer=null;

const birthApprox=()=>!!((ACTIVE.p&&ACTIVE.p.approx)||(!ACTIVE.p&&typeof meProfile==="function"&&meProfile()?.noTime));

/* sign-level dignity only: the stretched "varga degree" is a
   convention, not a measurement, so no deep-exaltation claims (part 23) */
const EXALT_SIGN={Sun:1,Moon:2,Mars:10,Mercury:6,Jupiter:4,Venus:12,Saturn:7};
function signDignity(g,sign){
  if(!EXALT_SIGN[g]) return "";
  if(EXALT_SIGN[g]===sign) return "exalted";
  if(((EXALT_SIGN[g]+5)%12)+1===sign) return "debilitated";
  if(SIGN_LORD[sign]===g) return "own sign";
  return "";
}

/* the derived chart: every point's sign, and houses from the varga lagna */
function vargaViewFor(D){
  const points={Asc:CHART.ascendant};
  for(const p of CHART.placements) points[p.graha]=p.L;
  const signs=D===1?Object.fromEntries(Object.entries(points).map(([k,L])=>[k,signOf(L)])):vargaChart(points,D);
  const lagna=signs.Asc;
  const houses={};
  for(const k in signs) houses[k]=houseFrom(lagna,signs[k]);
  return {D,lagna,signs,houses,points};
}

/* a full North Indian figure for any derived chart: rashi number in
   each house plus the grahas seated there (houses fixed, numbers = rashis) */
function vargaFigure(view,opts={}){
  const focus=opts.focus||null;
  const byHouse={};
  for(const g of GRAHA_ORDER){ const h=view.houses[g]; (byHouse[h]=byHouse[h]||[]).push(g); }
  return `<svg class="vfig" viewBox="-3 -3 106 106" role="img" aria-label="${opts.aria||"chart"}">
    <rect x="0" y="0" width="100" height="100" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="1.4"/>
    <line x1="0" y1="0" x2="100" y2="100" stroke="rgba(255,255,255,.22)" stroke-width="1"/>
    <line x1="100" y1="0" x2="0" y2="100" stroke="rgba(255,255,255,.22)" stroke-width="1"/>
    <path d="${RHOMBUS_D}" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="1"/>
    <path d="${LAGNA_D}" fill="rgba(194,155,78,.12)" stroke="none"/>
    ${Object.keys(LABEL).map(h=>{
      const hh=+h, sg=adv(view.lagna,hh), lst=byHouse[hh]||[];
      const [x,y]=LABEL[h];
      return `<text x="${x}" y="${y-(lst.length?4.2:0)}" font-size="5.2" fill="rgba(236,237,242,.55)"
          text-anchor="middle" dominant-baseline="middle" font-family="var(--fm)">${sg}</text>
        ${lst.length?(()=>{const rowsOf=[]; for(let i=0;i<lst.length;i+=3) rowsOf.push(lst.slice(i,i+3));
          const fs=lst.length>3?5:5.6;
          return `<text x="${x}" y="${y+3.4-(rowsOf.length-1)*2.6}" font-size="${fs}" font-weight="600"
            text-anchor="middle" dominant-baseline="middle" font-family="var(--ff)" fill="#F1E7C9">${
            rowsOf.map((row,ri)=>`<tspan x="${x}" dy="${ri?fs+0.4:0}">${row.map(g=>`<tspan fill="${focus===g?"#FFD37A":"#F1E7C9"}">${G_ABBR[g]}</tspan>`).join(" ")}</tspan>`).join("")}</text>`})():""}`;
    }).join("")}
  </svg>`;
}

/* ---- hero: one 30° sign, divided (Animation 2, part 7) ---- */
const HERO_STEPS=[1,2,3,9,60];
function vargaHeroHTML(){
  const sign=CHART.lagna;
  return `<div class="vhero" id="vhero" data-d="${vgHeroD}">
    <div class="vherotop"><span>0&#176;</span><b>${SIGNS[sign-1]} &#8212; one sign, 30&#176;</b><span>30&#176;</span></div>
    <div class="vherobar" id="vherobar">${heroCells(vgHeroD)}</div>
    <div class="vheroseg" role="tablist" aria-label="Division">
      ${HERO_STEPS.map(d=>`<button data-hd="${d}" class="${d===vgHeroD?"on":""}" role="tab" aria-selected="${d===vgHeroD}">D${d}</button>`).join("")}
    </div>
    <p class="vherocap" id="vherocap">${heroCaption(vgHeroD)}</p>
  </div>`;
}
const heroCells=d=>Array.from({length:d},(_,i)=>`<i style="--k:${i}"></i>`).join("");
function heroCaption(d){
  return {1:"D1 &#8212; the sign whole. One 30&#176; section, the rashi chart itself.",
    2:"D2 &#8212; the sign in two halves of 15&#176;. Hora, read for wealth.",
    3:"D3 &#8212; three parts of 10&#176;. Drekkana, read for siblings and effort.",
    9:"D9 &#8212; nine parts of 3&#176;20&#8242;. Navamsha does not cut the whole chart into nine: it divides <b>each</b> 30&#176; sign into nine.",
    60:"D60 &#8212; sixty parts of 0&#176;30&#8242;. So fine that a two-minute birth-time error can change a placement."}[d];
}
function vargaHeroSet(d){
  vgHeroD=d;
  const h=document.getElementById("vhero"); if(!h) return;
  h.dataset.d=d;
  const bar=document.getElementById("vherobar"); if(bar) bar.innerHTML=heroCells(d);
  h.querySelectorAll("[data-hd]").forEach(b=>{b.classList.toggle("on",+b.dataset.hd===d);b.setAttribute("aria-selected",+b.dataset.hd===d)});
  const c=document.getElementById("vherocap"); if(c) c.innerHTML=heroCaption(d);
}
function vargaHeroAutoplay(){
  clearInterval(vgHeroTimer);
  if(matchMedia("(prefers-reduced-motion: reduce)").matches){ vargaHeroSet(9); return; }
  let i=0; vargaHeroSet(HERO_STEPS[0]);
  vgHeroTimer=setInterval(()=>{ i++; if(i>=HERO_STEPS.length){ clearInterval(vgHeroTimer); return; }
    if(!document.getElementById("vhero")){ clearInterval(vgHeroTimer); return; }
    vargaHeroSet(HERO_STEPS[i]); },1400);
}

/* ---- walkthrough: one exact longitude remapped (Animation 3, part 8) ---- */
function walkModel(g,D){
  const L=g==="Asc"?CHART.ascendant:CHART.get(g).L;
  const d=vargaDetail(L,D), a=vargaDetail(CHART.ascendant,D);
  const natalHouse=g==="Asc"?1:CHART.get(g).house;
  return {g,D,L,d,a,natalHouse,house:houseFrom(a.sign,d.sign),meta:vargaMeta(D)};
}
function vargaWalkHTML(D=9){
  const m=walkModel(vgWalkG,D);
  const name=m.g==="Asc"?"Ascendant":m.g;
  const steps=[
    [`${name} in D1`,`${name} stands at <b>${SIGNS[m.d.natalSign-1]} ${fmtDMS(m.d.degInSign)}</b>${m.g!=="Asc"?`, your ${ordinal(m.natalHouse)} house`:""}. That longitude is the only input.`],
    [`The exact degree`,`Inside the 30&#176; of ${SIGNS[m.d.natalSign-1]}, it sits ${fmtDMS(m.d.degInSign)} from the sign&#8217;s start.`],
    [`Divide the sign into ${m.d.parts}`,`${m.meta.name} cuts every sign into ${m.d.parts} parts${m.d.unequal?" of unequal, classical widths":` of ${fmtDMS(m.d.span)}`}. The degree falls in <b>part ${m.d.part}</b> (${fmtDMS(m.d.partStart)} &#8211; ${fmtDMS(m.d.partEnd)}).`],
    [`Map that part to a sign`,`Rule: ${m.meta.rule} For ${SIGNS[m.d.natalSign-1]}, part ${m.d.part} &#8594; <b>${SIGNS[m.d.sign-1]}</b>.`],
    [`Place it in the D${D} chart`,`The Ascendant goes through the same working: ${fmtDMS(m.a.degInSign)} of ${SIGNS[m.a.natalSign-1]} &#8594; part ${m.a.part} &#8594; <b>${SIGNS[m.a.sign-1]}</b>, so D${D} houses start there. ${name} in ${SIGNS[m.d.sign-1]} is therefore the <b>${ordinal(m.house)} house</b> of D${D}. It did not move in the sky &#8212; its natal longitude was remapped.`]
  ];
  const s=Math.min(Math.max(vgWalkStep,1),5);
  const parts=m.d.unequal?[[0,5],[5,10],[10,18],[18,25],[25,30]].map(([a,b],i)=>({w:(b-a)/30*100,i:i+1}))
    :Array.from({length:m.d.parts},(_,i)=>({w:100/m.d.parts,i:i+1}));
  const view=vargaViewFor(D);
  return `<div class="vwalk" id="vwalk" data-step="${s}">
    <div class="vwalkchips">${["Asc",...GRAHA_ORDER].map(g=>`<button class="antchip${g===vgWalkG?" sel":""}" data-wg="${g}">${g==="Asc"?"Asc":gIcon(g,13)}${g==="Asc"?"":g}</button>`).join("")}</div>
    <div class="vwbar" aria-hidden="true">
      <div class="vwsign"><span>${SIGNS[m.d.natalSign-1]}</span><span>30&#176;</span></div>
      <div class="vwtrack">
        ${parts.map(p=>`<i class="vwpart${p.i===m.d.part?" hit":""}" style="width:${p.w.toFixed(3)}%"></i>`).join("")}
        <b class="vwmark" style="left:${(m.d.degInSign/30*100).toFixed(2)}%"><img src="assets/graha/${m.g==="Asc"?"sun":m.g.toLowerCase()}.png" alt=""></b>
      </div>
      <div class="vwmap"><span>part ${m.d.part}</span><i>&#8594;</i><b>${SIGNS[m.d.sign-1]}</b></div>
    </div>
    <div class="vwfig">${vargaFigure(view,{focus:m.g,aria:`D${D} chart with ${name} highlighted`})}</div>
    <ol class="vwsteps">${steps.map(([t,b],i)=>`<li class="${i+1===s?"on":i+1<s?"done":""}" data-ws="${i+1}"><b>${t}</b><p>${b}</p></li>`).join("")}</ol>
    <div class="vwctl"><button class="gact" data-wprev>&#8249; Back</button>
      <button class="gact solid" data-wnext>${s<5?"Next &#8250;":"Replay"}</button></div>
  </div>`;
}

/* ---- directory (parts 13-16) ---- */
function vargaRows(){
  let list=VARGA_META.filter(m=>vgMajorOnly?m.tier==="major":true);
  list=vgSort==="uses"?[...list].sort((a,b)=>a.uses-b.uses):[...list].sort((a,b)=>a.D-b.D);
  return list.map(m=>{
    const v=vargaViewFor(m.D);
    return `<button class="vrowx" data-vd="${m.D}">
      <span class="vthumb">${miniChart(h=>String(adv(v.lagna,h)),{lagna:true})}</span>
      <span class="vrowbody"><b>D${m.D} &#183; ${m.name}${m.alias?` <i>(${m.alias})</i>`:""}</b>
        <span class="evmeta">${m.D===1?m.focus:cap(m.focus)}${m.tier==="extra"?` &#183; ${m.tradition}`:""}${m.sensitive&&birthApprox()?" &#183; low confidence with an approximate birth time":""}</span></span>
      <span class="chev">&#8250;</span>
    </button>`}).join("");
}

function bdVargas(){
  const approx=birthApprox();
  return `
    <p class="skylead">Different lenses on the same birth positions. Each divisional chart
      mathematically remaps the same natal planetary longitudes to examine one dimension
      of the chart &#8212; nothing moves in the sky.</p>
    <div class="vconf${approx?" warn":""}">${approx
      ?`<b>Approximate birth time.</b> D27, D40, D45 and especially D60 are sensitive to small time errors; treat their placements as low confidence.`
      :`<b>Exact birth time.</b> All sixteen classical vargas can be read; D60 still rewards a birth time known to the minute.`}</div>
    <h3 class="secttl" style="margin-top:20px">How a varga divides a sign</h3>
    ${vargaHeroHTML()}
    <h3 class="secttl" style="margin-top:22px">Why planets appear in different houses</h3>
    <p class="interp" style="margin-top:2px">Pick any point and watch its exact D1 longitude
      become a D9 placement, step by step.</p>
    ${vargaWalkHTML(9)}
    <h3 class="secttl" style="margin-top:24px">The charts</h3>
    <div class="vctl">
      <div class="setrow" style="padding:8px 0">
        <div class="setlabel"><b>Major vargas only</b><span>Astra shows the sixteen principal classical vargas by default</span></div>
        <button class="switch${vgMajorOnly?" on":""}" id="vgmajor" role="switch" aria-checked="${vgMajorOnly}"><i></i></button>
      </div>
      <div class="tbseg subseg" id="vgsort" role="tablist" aria-label="Sort">
        <span class="thumb" aria-hidden="true"></span>
        <button class="${vgSort==="uses"?"on":""}" data-s="uses" role="tab" aria-selected="${vgSort==="uses"}">Most used</button>
        <button class="${vgSort==="trad"?"on":""}" data-s="trad" role="tab" aria-selected="${vgSort==="trad"}">Traditional order</button>
      </div>
    </div>
    <div id="vdir">${vargaRows()}</div>
    <p class="note">&#8220;Most used&#8221; is one reasonable ordering, not a universal ranking.
      Astra lists only vargas it has a validated rule for &#8212; D5 and D6 are absent because
      no reliable published rule could be confirmed, and no D-number is invented to fill a gap.</p>`;
}

function wireVargasTab(){
  const bb=document.getElementById("bdbody"); if(!bb) return;
  vargaHeroAutoplay();
  bb.addEventListener("click",e=>{
    const hd=e.target.closest("[data-hd]");
    if(hd){ clearInterval(vgHeroTimer); vargaHeroSet(+hd.dataset.hd); buzz(5); return; }
    const wg=e.target.closest("[data-wg]");
    if(wg){ vgWalkG=wg.dataset.wg; vgWalkStep=1; buzz(6);
      document.getElementById("vwalk").outerHTML=vargaWalkHTML(9); return; }
    const ws=e.target.closest("[data-ws]");
    if(ws){ vgWalkStep=+ws.dataset.ws; buzz(4); document.getElementById("vwalk").outerHTML=vargaWalkHTML(9); return; }
    if(e.target.closest("[data-wnext]")){ vgWalkStep=vgWalkStep>=5?1:vgWalkStep+1; buzz(5);
      document.getElementById("vwalk").outerHTML=vargaWalkHTML(9); return; }
    if(e.target.closest("[data-wprev]")){ vgWalkStep=Math.max(1,vgWalkStep-1); buzz(5);
      document.getElementById("vwalk").outerHTML=vargaWalkHTML(9); return; }
    const sw=e.target.closest("#vgmajor");
    if(sw){ vgMajorOnly=!vgMajorOnly; sw.classList.toggle("on",vgMajorOnly); sw.setAttribute("aria-checked",vgMajorOnly);
      buzz(6); document.getElementById("vdir").innerHTML=vargaRows(); return; }
    const so=e.target.closest("#vgsort button[data-s]");
    if(so){ vgSort=so.dataset.s; buzz(5);
      so.parentElement.querySelectorAll("button").forEach(b=>{b.classList.toggle("on",b===so);b.setAttribute("aria-selected",b===so)});
      setThumb(so.parentElement,false);
      document.getElementById("vdir").innerHTML=vargaRows(); return; }
    const vr=e.target.closest("[data-vd]");
    if(vr){ buzz(8); openVargaPage(+vr.dataset.vd, vr); return; }
  });
  requestAnimationFrame(()=>{ const s=document.getElementById("vgsort"); if(s) setThumb(s,true); });
}

/* ---- the varga page (parts 17-29) ---- */
const VARGA_KEYHOUSE={9:7,10:10,7:5,2:2,4:4,12:9,3:3,16:4,24:5,20:9,30:6};
function vargaThemes(D,view){
  const out=[];
  const votta=GRAHA_ORDER.filter(g=>view.signs[g]===CHART.get(g).sign);
  if(D>1&&votta.length) out.push(`<b>${votta.join(", ")}</b> ${votta.length>1?"keep":"keeps"} the same sign here as in D1${D===9?" &#8212; vargottama":""}, traditionally read as steadier and more fully ${votta.length>1?"themselves":"itself"}.`);
  const strong=GRAHA_ORDER.filter(g=>["exalted","own sign"].includes(signDignity(g,view.signs[g])));
  if(strong.length) out.push(`${strong.map(g=>`<b>${g}</b> (${signDignity(g,view.signs[g])})`).join(", ")} ${strong.length>1?"sit":"sits"} well by sign in this chart.`);
  const weak=GRAHA_ORDER.filter(g=>signDignity(g,view.signs[g])==="debilitated");
  if(weak.length) out.push(`${weak.map(g=>`<b>${g}</b>`).join(", ")} ${weak.length>1?"fall":"falls"} in ${weak.length>1?"their":"its"} debilitation sign here &#8212; a placement the tradition reads with care, not alarm.`);
  const kh=VARGA_KEYHOUSE[D];
  if(kh){ const lord=SIGN_LORD[CHART.signOfHouse(kh)];
    out.push(`Read with D1 (part 24): your D1 ${ordinal(kh)} lord <b>${lord}</b> sits in the D${D} ${ordinal(view.houses[lord])} house, in ${SIGNS[view.signs[lord]-1]}.`); }
  const moved=GRAHA_ORDER.filter(g=>view.houses[g]!==CHART.get(g).house).length;
  if(D>1) out.push(`${moved} of nine grahas appear in a different house than in D1 &#8212; remapped, not moved.`);
  return out.slice(0,4);
}
function vargaCalcRows(D,view){
  return ["Asc",...GRAHA_ORDER].map(k=>{
    const L=view.points[k], d=vargaDetail(L,D);
    return `<div class="awrow"><b>${k==="Asc"?"Ascendant":k}</b>
      <span>${SIGNS[d.natalSign-1]} ${fmtDMS(d.degInSign)} &#8594; part ${d.part}/${d.parts}
      (${fmtDMS(d.partStart)}&#8211;${fmtDMS(d.partEnd)}) &#8594; <b>${SIGNS[d.sign-1]}</b> &#183; ${ordinal(view.houses[k])} house</span></div>`;
  }).join("");
}
let VG_VIEW="varga";
function openVargaPage(D,card){
  const m=vargaMeta(D); if(!m) return;
  const view=vargaViewFor(D), d1=vargaViewFor(1);
  VG_VIEW=D===1?"d1":"varga";
  const approx=birthApprox();
  const ov=document.createElement("div");
  ov.className="awpage";
  const fig=which=>vargaFigure(which==="d1"?d1:view,{aria:which==="d1"?"D1 chart":`D${D} chart`});
  ov.innerHTML=`
    <header class="awtop">
      <button class="awback" aria-label="Back to Divisional Charts">&#8249;</button>
      <span>D${D} &#183; ${m.name}</span>
    </header>
    <div class="awscroll">
      <p class="awlead" style="margin:4px 0 10px">${m.D===1?m.focus:cap(m.focus)}.</p>
      ${D>1?`<div class="tbseg subseg vgseg" id="vgseg" role="tablist" aria-label="Chart">
        <span class="thumb" aria-hidden="true"></span>
        <button data-v="d1" role="tab" aria-selected="false">Birth (D1)</button>
        <button class="on" data-v="varga" role="tab" aria-selected="true">D${D}</button>
      </div>
      <p class="because" style="text-align:center;margin:6px 0 4px">Read D${D} together with D1, not instead of it.</p>`:""}
      <div class="vfigwrap" id="vfigwrap">${fig(VG_VIEW)}</div>
      <p class="because" style="text-align:center">Houses stay fixed; the numbers in the cells are rashis.
        D${D} Ascendant: <b>${SIGNS[view.lagna-1]}</b>${D>1?` (D1: ${SIGNS[CHART.lagna-1]})`:""}.</p>
      ${m.sensitive?`<p class="awnote">${approx
        ?"D60 is highly sensitive to small birth-time differences and may not be reliable with an approximate birth time. Low confidence."
        :"D60 is extremely birth-time sensitive: the Ascendant moves about 1&#176; every four minutes and each D60 part is only 0&#176;30&#8242;, so a two-minute error can change a placement."}</p>`:""}
      <h2 class="awh2">What this chart looks at</h2>
      <p class="tellme">${D===1?"Everything begins here: the sky as it stood, houses counted from your rising sign. Every other chart on this page is a remapping of these same longitudes."
        :`Within Vedic astrology D${D} is read for ${m.focus}. It is a lens, not a second sky &#8212; the strength and seating a graha shows here is taken as a refinement of what D1 already says.`}</p>
      ${m.tradition?`<p class="because">${m.tradition}. Not part of the classical Shodashavarga.</p>`:""}
      ${D>1?`<h2 class="awh2">Your strongest themes</h2>${vargaThemes(D,view).map(t=>`<p class="awbody" style="margin-bottom:6px">&#8226; ${t}</p>`).join("")}`:""}
      <h2 class="awh2">Placements</h2>
      ${["Asc",...GRAHA_ORDER].map(k=>{
        const nm=k==="Asc"?"Ascendant":k, dg=k==="Asc"?"":signDignity(k,view.signs[k]);
        return `<button class="bdrow" data-vg="${k}">
          ${k==="Asc"?`<span class="bdh">As</span>`:`<img src="assets/graha/${k.toLowerCase()}.png" alt="" width="34" height="34">`}
          <span><b>${nm}</b><span class="evmeta">D1: ${SIGNS[d1.signs[k]-1]} &#183; ${ordinal(d1.houses[k])}${D>1?` &nbsp;&#8594;&nbsp; D${D}: ${SIGNS[view.signs[k]-1]} &#183; ${ordinal(view.houses[k])}${dg?` &#183; ${dg}`:""}`:""}</span></span>
          <span class="chev">&#8250;</span></button>`}).join("")}
      ${D>1?`<details class="advd"><summary>How was this calculated?</summary>
        <p class="because" style="margin:6px 0 10px">${m.rule}${m.variant?` <b>Methodology note:</b> ${m.variant}`:""}</p>
        ${vargaCalcRows(D,view)}
        <p class="awfoot" style="margin-top:8px">Sidereal zodiac, Lahiri ayanamsa &#8212; the same longitudes as every other screen. Rules validated cell-for-cell against professional reference tables for all ten chart points.</p>
      </details>`:""}
      <div class="awctas" style="margin-top:14px">
        <button class="awcta" data-act="universe">Open in Universe</button>
        <button class="awcta" data-act="guide">Ask Guide about this chart</button>
      </div>
      <p class="awfoot">Traditional readings within Vedic astrology &#8212; a lens for reflection, not a verdict.</p>
    </div>`;
  const src=awOpen(ov,card);
  const close=(then)=>awClose(ov,src,then);
  ov.querySelector(".awback").onclick=()=>close();
  requestAnimationFrame(()=>{ const s=ov.querySelector("#vgseg"); if(s) setThumb(s,true); });
  ov.onclick=e=>{
    const sv=e.target.closest("#vgseg button[data-v]");
    if(sv){ VG_VIEW=sv.dataset.v; buzz(6);
      sv.parentElement.querySelectorAll("button").forEach(b=>{b.classList.toggle("on",b===sv);b.setAttribute("aria-selected",b===sv)});
      setThumb(sv.parentElement,false);
      const w=ov.querySelector("#vfigwrap"); w.classList.add("swap");
      setTimeout(()=>{ w.innerHTML=fig(VG_VIEW); w.classList.remove("swap"); },180);
      return; }
    const pr=e.target.closest("[data-vg]");
    if(pr){ buzz(8); openVargaPlanet(D,pr.dataset.vg,pr); return; }
    const b=e.target.closest(".awcta"); if(!b) return;
    buzz(9);
    if(b.dataset.act==="universe") close(()=>{ uniVarga=D; go(CHART_INDEX); setMode("birth"); vargaSwitchMotion(); });
    else close(()=>askGuide(D===9?"What does my Navamsha say about relationships?":`What does my D${D} (${m.name}) chart show?`,
      {source:"varga",D,name:m.name,focus:m.focus,d1Ascendant:SIGNS[CHART.lagna-1],vargaAscendant:SIGNS[view.lagna-1],
       placements:Object.fromEntries(GRAHA_ORDER.map(g=>[g,{d1:`${SIGNS[CHART.get(g).sign-1]} ${ordinal(CHART.get(g).house)}`,varga:`${SIGNS[view.signs[g]-1]} ${ordinal(view.houses[g])}`}]))}));
  };
}

/* ---- planet in a varga (part 22) ---- */
function openVargaPlanet(D,k,card){
  const m=vargaMeta(D), view=vargaViewFor(D), d1=vargaViewFor(1);
  const nm=k==="Asc"?"Ascendant":k;
  const w=walkModel(k,D);
  const dg=k==="Asc"?"":signDignity(k,view.signs[k]);
  const moved=view.houses[k]!==d1.houses[k];
  const ov=document.createElement("div");
  ov.className="awpage";
  ov.innerHTML=`
    <header class="awtop"><button class="awback" aria-label="Back">&#8249;</button><span>${nm} in D${D}</span></header>
    <div class="awscroll">
      <div class="awinfhead" style="margin:6px 0 2px">
        ${k==="Asc"?`<span class="bdh" style="width:52px;height:52px;font-size:18px">As</span>`:`<img class="awart" style="width:52px;height:52px" src="assets/graha/${k.toLowerCase()}.png" alt="">`}
        <div><b style="font-size:20px">${nm} in D${D}</b>
          <span>${SIGNS[view.signs[k]-1]} &#183; ${ordinal(view.houses[k])} house${dg?` &#183; ${dg}`:""}</span></div>
      </div>
      <h2 class="awh2">In your D1</h2>
      <p class="because">${SIGNS[d1.signs[k]-1]} &#183; ${ordinal(d1.houses[k])} house &#183; ${fmtDMS(w.d.degInSign)}</p>
      <h2 class="awh2">In your D${D}</h2>
      <p class="because">${SIGNS[view.signs[k]-1]} &#183; ${ordinal(view.houses[k])} house${dg?` &#183; ${dg} by sign`:""}</p>
      <h2 class="awh2">What changes?</h2>
      <p class="tellme">${moved
        ?`${nm} shows in the ${ordinal(view.houses[k])} house here instead of the ${ordinal(d1.houses[k])} &#8212; because its part of ${SIGNS[w.d.natalSign-1]} maps to ${SIGNS[w.d.sign-1]}, and D${D}&#8217;s houses are counted from a D${D} Ascendant of ${SIGNS[w.a.sign-1]}. Nothing moved in the sky; the coordinates did.`
        :`${nm} lands in the same house here as in D1 &#8212; the remapping of its part of ${SIGNS[w.d.natalSign-1]} and the D${D} Ascendant happen to agree.`}
        ${view.signs[k]===d1.signs[k]&&k!=="Asc"?` It keeps the same sign in both charts${D===9?" &#8212; vargottama":""}, traditionally read as steadier.`:""}</p>
      <details class="advd"><summary>See why &#8212; the calculation</summary>
        <div class="awrow"><b>D1 longitude</b><span>${SIGNS[w.d.natalSign-1]} ${fmtDMS(w.d.degInSign)}</span></div>
        <div class="awrow"><b>Division</b><span>${w.d.parts} parts${w.d.unequal?" (unequal, classical)":` of ${fmtDMS(w.d.span)}`}</span></div>
        <div class="awrow"><b>Falls in</b><span>part ${w.d.part} &#183; ${fmtDMS(w.d.partStart)}&#8211;${fmtDMS(w.d.partEnd)}</span></div>
        <div class="awrow"><b>Rule</b><span>${m.rule}</span></div>
        <div class="awrow"><b>Maps to</b><span>${SIGNS[w.d.sign-1]}</span></div>
        <div class="awrow"><b>D${D} Ascendant</b><span>${SIGNS[w.a.natalSign-1]} ${fmtDMS(w.a.degInSign)} &#8594; part ${w.a.part} &#8594; ${SIGNS[w.a.sign-1]}</span></div>
        <div class="awrow cur"><b>Therefore</b><span>${ordinal(view.houses[k])} house of D${D}</span></div>
      </details>
      <div class="awctas" style="margin-top:14px">
        ${k!=="Asc"?`<button class="awcta" data-act="chart">Show in D${D} chart</button>`:""}
        <button class="awcta" data-act="guide">Ask Guide</button>
      </div>
      <p class="awfoot">Sign-level dignity only: the &#8220;degree&#8221; inside a divisional sign is a convention, not a measurement, so Astra does not print one.</p>
    </div>`;
  const src=awOpen(ov,card);
  const close=(then)=>awClose(ov,src,then);
  ov.querySelector(".awback").onclick=()=>close();
  ov.onclick=e=>{
    const b=e.target.closest(".awcta"); if(!b) return;
    buzz(9);
    if(b.dataset.act==="chart") close(()=>{ navUnwindAll();
      uniVarga=D; go(CHART_INDEX); setMode("birth"); vargaSwitchMotion(); setTimeout(()=>openPlanet(k),800); });
    else close(()=>askGuide(`Why is ${nm} in a different house in D${D}?`,
      {source:"varga_planet",D,point:nm,d1:`${SIGNS[d1.signs[k]-1]} ${ordinal(d1.houses[k])}`,
       varga:`${SIGNS[view.signs[k]-1]} ${ordinal(view.houses[k])}`,part:w.d.part,parts:w.d.parts,rule:m.rule}));
  };
}

/* ---- Universe: the D1 -> varga move choreography (part 20) ----
   hold, glow the natal degrees, a divide flash, then the planets
   glide to their derived houses on the existing transition */
function vargaSwitchMotion(){
  const stage=document.getElementById("stage");
  if(!stage||matchMedia("(prefers-reduced-motion: reduce)").matches){ paintUniverse(!stage); return; }
  stage.classList.add("divide");
  setTimeout(()=>{ stage.classList.remove("divide"); paintUniverse(false); },420);
}

/* ---- SIGNS & NAKSHATRAS (Learn) — spec parts 30-47 ----------------
   Two coordinate grids over one 360° circle. Everything drawn here is
   derived from longitude via zodiac.js; the wheel proves visually why
   a nakshatra can belong to two signs. ---- */
let szLayer="both", szMine=false, szDeg=false, szQ="", szAuto=null;

const ringPt=(L,r)=>{const a=(180-L)*Math.PI/180; return [50+r*Math.cos(a), 50+r*Math.sin(a)];};
const ringArc=(a,b,r)=>{const [x1,y1]=ringPt(a,r),[x2,y2]=ringPt(b,r);
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${b-a>180?1:0} 0 ${x2.toFixed(2)} ${y2.toFixed(2)}`;};

/* the points of this chart, longitude-first */
function myPoints(){
  const out=[{k:"Asc",name:"Ascendant",L:CHART.ascendant}];
  for(const p of CHART.placements) out.push({k:p.graha,name:p.graha,L:p.L});
  return out.map(p=>({...p,g:pointGrid(p.L)}));
}

function zodiacRing(){
  const R=44, r2=36, r3=30;
  const signs=SIGNS.map((n,i)=>{
    const [x,y]=ringPt(i*30+15,40);
    return `<path class="zsw" d="${ringArc(i*30,i*30+30,R)}" style="--k:${i}"/>
      <line class="zsb" x1="${ringPt(i*30,r3)[0].toFixed(2)}" y1="${ringPt(i*30,r3)[1].toFixed(2)}" x2="${ringPt(i*30,R)[0].toFixed(2)}" y2="${ringPt(i*30,R)[1].toFixed(2)}" style="--k:${i}"/>
      <text class="zsl" x="${x.toFixed(2)}" y="${y.toFixed(2)}" style="--k:${i}">${n.slice(0,3).toUpperCase()}</text>`;
  }).join("");
  const naks=Array.from({length:27},(_,i)=>{
    const L=i*NAK_SPAN, [x1,y1]=ringPt(L,r2-3),[x2,y2]=ringPt(L,r3+2);
    const [tx,ty]=ringPt(L+NAK_SPAN/2,r2+1.5);
    return `<line class="znb" x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" style="--k:${i}"/>
      <text class="znl" x="${tx.toFixed(2)}" y="${ty.toFixed(2)}" style="--k:${i}" transform="rotate(${(-(L+NAK_SPAN/2)+90).toFixed(1)} ${tx.toFixed(2)} ${ty.toFixed(2)})">${i+1}</text>`;
  }).join("");
  const padas=Array.from({length:108},(_,i)=>{ if(i%4===0) return "";
    const L=i*PADA_SPAN, [x1,y1]=ringPt(L,r3+2),[x2,y2]=ringPt(L,r3+5);
    return `<line class="zpb" x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}"/>`; }).join("");
  const degs=[0,30,60,90,120,150,180,210,240,270,300,330].map(d=>{const [x,y]=ringPt(d,48.5);
    return `<text class="zdeg" x="${x.toFixed(2)}" y="${y.toFixed(2)}">${d}&#176;</text>`;}).join("");
  const mine=szMine?myPoints().map(p=>{const [x,y]=ringPt(p.L,25);
    return `<g class="zme" data-pt="${p.k}" transform="translate(${x.toFixed(2)} ${y.toFixed(2)})">
      <circle r="4.6" fill="#171A33" stroke="rgba(255,255,255,.5)" stroke-width=".5"/>
      ${p.k==="Asc"?`<text y="1.4" font-size="3.6" text-anchor="middle" fill="#F1E7C9" font-weight="700">As</text>`
        :`<image href="assets/graha/${p.k.toLowerCase()}.png" x="-3.6" y="-3.6" width="7.2" height="7.2"/>`}
    </g>`;}).join(""):"";
  return `<svg class="zring l-${szLayer}${szMine?" mine":""}" viewBox="0 0 100 100" role="img"
      aria-label="The zodiac as one 360 degree circle: twelve signs of thirty degrees, twenty-seven nakshatras of thirteen degrees twenty minutes, four padas each">
    <circle cx="50" cy="50" r="${R}" class="zbase"/>
    <circle cx="50" cy="50" r="${r3}" class="zbase"/>
    <g class="zsigns">${signs}</g>
    <g class="znaks">${naks}</g>
    <g class="zpadas">${padas}</g>
    <g class="zdegs">${degs}</g>
    <g class="zmine">${mine}</g>
  </svg>`;
}

function subSigns(){
  const me=myPoints(), asc=me[0].g, moon=me.find(p=>p.k==="Moon").g, sun=me.find(p=>p.k==="Sun").g;
  const ascParts=signNakshatras(asc.sign);
  return `
    <p class="skylead">Two coordinate systems describing the same zodiac.</p>
    <div class="zwheel">${zodiacRing()}
      <p class="zpick" id="zpick">${szMine?"Tap a marker to read it.":"&nbsp;"}</p>
    </div>
    <div class="tbseg subseg" id="zlayer" role="tablist" aria-label="Grid">
      <span class="thumb" aria-hidden="true"></span>
      ${[["rashi","Rashis"],["nak","Nakshatras"],["both","Both"]].map(([k,l])=>`<button class="${szLayer===k?"on":""}" data-z="${k}" role="tab" aria-selected="${szLayer===k}">${l}</button>`).join("")}
    </div>
    <div class="setrow" style="padding:8px 0 2px">
      <div class="setlabel"><b>Show my chart</b><span>Your Ascendant and grahas on the wheel</span></div>
      <button class="switch${szMine?" on":""}" id="zmine" role="switch" aria-checked="${szMine}"><i></i></button>
    </div>
    <div class="satimath" style="margin-top:14px" aria-label="Twelve rashis of thirty degrees, twenty-seven nakshatras of thirteen degrees twenty minutes, four padas each of three degrees twenty minutes">
      <span><b>12 &#215; 30&#176;</b>rashis</span><i>=</i>
      <span><b>27 &#215; 13&#176;20&#8242;</b>nakshatras</span><i>=</i>
      <span><b>108 &#215; 3&#176;20&#8242;</b>padas</span>
    </div>
    <p class="interp">Both grids add up to the same 360&#176; &#8212; but 30 is not a multiple of
      13&#176;20&#8242;, so their boundaries drift apart. That is why one
      <button class="term" data-bdterm="nak">nakshatra</button><span class="termdef" hidden>A
      lunar mansion: one of 27 equal 13&#176;20&#8242; divisions of the ecliptic, each tied to a
      traditional stellar reference point. Not the same as a modern IAU constellation, whose
      boundaries differ.</span> can sit across two signs. A point does not choose between them:
      its exact longitude belongs to both at once.</p>

    <h3 class="secttl" style="margin-top:22px">Which sign is &#8220;my sign&#8221;?</h3>
    <p class="interp" style="margin-top:2px">There isn&#8217;t one universal sign. Every point
      in your chart has its own sign, its own nakshatra and its own pada.</p>
    <div class="zwhich">
      <div class="zwrow"><b>Ascendant &#183; Lagna</b><span>${asc.signName} ${fmtDMS(asc.degInSign)} &#183; ${asc.nakName} pada ${asc.pada}</span>
        <small>The sign rising in the east at your birth &#8212; it sets the house framework of D1.</small></div>
      <div class="zwrow"><b>Moon sign &#183; Chandra rashi</b><span>${moon.signName} ${fmtDMS(moon.degInSign)} &#183; ${moon.nakName} pada ${moon.pada}</span>
        <small>The sign holding the Moon at birth &#8212; used by many Moon-based techniques, including sade sati.</small></div>
      <div class="zwrow"><b>Sun sign</b><span>${sun.signName} ${fmtDMS(sun.degInSign)} &#183; ${sun.nakName} pada ${sun.pada}</span>
        <small>The sign holding the Sun at birth.</small></div>
      <details class="advd dark"><summary>Every graha has its own</summary>
        ${me.filter(p=>!["Asc","Moon","Sun"].includes(p.k)).map(p=>`<div class="bdseq"><b>${p.name}</b>
          <span class="evmeta">${p.g.signName} ${fmtDMS(p.g.degInSign)} &#183; ${p.g.nakName} ${p.g.pada}</span></div>`).join("")}
      </details>
    </div>
    <p class="interp">So you can have a ${asc.signName} Ascendant, a ${moon.signName} Moon in
      ${moon.nakName}, and ${me.find(p=>p.k==="Saturn").name} in ${me.find(p=>p.k==="Saturn").g.signName}
      in a different nakshatra again. There is no contradiction &#8212; they are different points.</p>

    <h3 class="secttl" style="margin-top:22px">What does &#8220;${asc.signName} rising&#8221; actually mean?</h3>
    <figure class="zhoriz" aria-label="An observer on the ground; the ecliptic crosses the eastern horizon at the Ascendant point">
      <svg viewBox="0 0 200 90">
        <path d="M0 62 Q100 54 200 62" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.2"/>
        <path d="M18 88 C 60 40, 130 8, 196 20" fill="none" stroke="#C29B4E" stroke-width="1.4" stroke-dasharray="3 2.5"/>
        <circle cx="152" cy="58.7" r="4" fill="#F1E7C9"/>
        <circle cx="100" cy="66" r="2.4" fill="#ECEDF2"/>
        <text x="100" y="80" font-size="7" fill="rgba(236,237,242,.7)" text-anchor="middle">you, at your birthplace</text>
        <text x="184" y="70" font-size="7" fill="rgba(236,237,242,.7)" text-anchor="end">east</text>
        <text x="152" y="49" font-size="7" fill="#F1E7C9" text-anchor="middle" font-weight="700">Ascendant</text>
        <text x="40" y="30" font-size="6.5" fill="#C29B4E">ecliptic &#8212; the planets&#8217; road</text>
      </svg>
    </figure>
    <p class="interp">The Ascendant is a mathematical point: where the ecliptic crosses the
      eastern horizon at your birth time and place. Its longitude at your birth was
      <b>${fmtDMS(asc.longitude)}</b> of the sidereal zodiac &#8212; and because that lies between
      ${(asc.sign-1)*30}&#176; and ${asc.sign*30}&#176;, Astra labels it <b>${asc.signName}</b>. The sign
      is not itself rising like a planet; the point is.</p>
    <p class="interp">The same longitude also falls inside a nakshatra. A ${asc.signName} Ascendant
      can be ${ascParts.map(x=>x.name).join(", ")} depending on the exact degree &#8212; yours is
      <b>${asc.nakName}, pada ${asc.pada}</b>.</p>

    <h3 class="secttl" style="margin-top:22px">Moon sign and Moon nakshatra</h3>
    <div class="zmoonrow">
      <img src="assets/graha/moon.png" alt="" width="40" height="40">
      <div><b>Moon at ${moon.signName} ${fmtDMS(moon.degInSign)}</b>
        <span class="evmeta">longitude ${fmtDMS(moon.longitude)} &#8594; rashi ${moon.signName} &#183;
        nakshatra ${moon.nakName} &#183; pada ${moon.pada}</span></div>
    </div>
    <p class="because" style="color:var(--ink-3)">One longitude, three labels &#8212; the dasha
      sequence starts from the nakshatra, sade sati counts from the rashi.</p>

    <h3 class="secttl" style="margin-top:22px">Reference</h3>
    <div class="zsearch"><input id="zq" type="search" placeholder="Search a sign or nakshatra &#8212; Taurus, Vrishabha, Rohini, Mula&#8230;" value="${escText(szQ)}" autocomplete="off">
      <button class="gact${szDeg?" solid":""}" id="zdeg">${szDeg?"Hide degrees":"Show degrees"}</button></div>
    <div id="ztable">${signsTable()}</div>
    <p class="note">Nakshatras are traditional lunar mansions &#8212; equal divisions of the
      ecliptic tied to stellar reference points. Their boundaries are not the modern IAU
      constellation boundaries the Sky view draws.</p>`;
}

function signsTable(){
  const q=szQ.trim().toLowerCase();
  const hit=s=>!q||s.toLowerCase().includes(q);
  const rows=[];
  for(let s=1;s<=12;s++){
    const parts=signNakshatras(s);
    const match=hit(SIGNS[s-1])||hit(SIGNS_SK[s-1])||parts.some(p=>hit(p.name));
    if(!match) continue;
    rows.push(`<button class="zrow" data-zs="${s}">
      <b>${SIGN_GLYPH[s-1]} ${SIGNS[s-1]} <i>&#183; ${SIGNS_SK[s-1]}</i></b>
      <span class="evmeta">${szDeg?`${(s-1)*30}&#176;&#8211;${s*30}&#176; &#183; `:""}${parts.map(p=>{
        const pd=p.padas.length===1?String(p.padas[0]):`${p.padas[0]}&#8211;${p.padas[p.padas.length-1]}`;
        return `<em data-zn="${p.index}">${p.name} ${pd}${szDeg?` (${fmtDMS(p.from-(s-1)*30)}&#8211;${fmtDMS(p.to-(s-1)*30)})`:""}</em>`;}).join(", ")}</span>
    </button>`);
  }
  return rows.length?rows.join(""):`<p class="muted" style="font-size:13px">Nothing matches &#8220;${escText(szQ)}&#8221;.</p>`;
}

function wireSigns(){
  const pg=document.getElementById("pg-you");
  clearInterval(szAuto);
  /* Animation 1: circle -> rashis -> nakshatras -> padas, once per visit */
  if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&!sessionStorage.getItem("astro.zring")){
    const seq=["none","rashi","nak","both"]; let i=0;
    const ring=()=>pg.querySelector(".zring");
    if(ring()) ring().className.baseVal="zring l-none";
    szAuto=setInterval(()=>{ i++; const r=ring(); if(!r||i>=seq.length){ clearInterval(szAuto); return; }
      r.className.baseVal=`zring l-${seq[i]}${szMine?" mine":""}`; if(i===seq.length-1) sessionStorage.setItem("astro.zring","1"); },1100);
  }
  pg.onclick=e=>{
    const zl=e.target.closest("#zlayer button[data-z]");
    if(zl){ clearInterval(szAuto); szLayer=zl.dataset.z; buzz(5);
      zl.parentElement.querySelectorAll("button").forEach(b=>{b.classList.toggle("on",b===zl);b.setAttribute("aria-selected",b===zl)});
      setThumb(zl.parentElement,false);
      const r=pg.querySelector(".zring"); if(r) r.className.baseVal=`zring l-${szLayer}${szMine?" mine":""}`; return; }
    if(e.target.closest("#zmine")){ clearInterval(szAuto); szMine=!szMine; buzz(6);
      pg.querySelector(".zwheel").innerHTML=zodiacRing()+`<p class="zpick" id="zpick">${szMine?"Tap a marker to read it.":"&nbsp;"}</p>`;
      const sw=document.getElementById("zmine"); sw.classList.toggle("on",szMine); sw.setAttribute("aria-checked",szMine); return; }
    const mk=e.target.closest(".zme");
    if(mk){ const p=myPoints().find(x=>x.k===mk.dataset.pt); buzz(4);
      pg.querySelectorAll(".zme").forEach(m=>m.classList.toggle("sel",m===mk));
      const z=document.getElementById("zpick");
      if(z&&p) z.innerHTML=`<b>${p.name}</b> &#183; ${p.g.signName} ${fmtDMS(p.g.degInSign)} &#183; ${p.g.nakName} &#183; pada ${p.g.pada}`;
      return; }
    const tm=e.target.closest(".term");
    if(tm){ const d=tm.nextElementSibling; if(d&&d.classList.contains("termdef")) d.hidden=!d.hidden; return; }
    if(e.target.closest("#zdeg")){ szDeg=!szDeg; buzz(5);
      document.getElementById("zdeg").textContent=szDeg?"Hide degrees":"Show degrees";
      document.getElementById("zdeg").classList.toggle("solid",szDeg);
      document.getElementById("ztable").innerHTML=signsTable(); return; }
    const zn=e.target.closest("[data-zn]");
    if(zn){ e.stopPropagation(); buzz(8); openObject({kind:"nakshatra",id:+zn.dataset.zn,mode:"birth",from:"directory",emphasis:"birth",origin:rectOrigin(zn)}); return; }
    const zr=e.target.closest(".zrow");
    if(zr){ buzz(8); openObject({kind:"rashi",id:+zr.dataset.zs,mode:"birth",from:"directory",emphasis:"birth",origin:rectOrigin(zr)}); return; }
  };
  const q=document.getElementById("zq");
  if(q) q.oninput=()=>{ szQ=q.value; document.getElementById("ztable").innerHTML=signsTable(); };
}

/* the sign and nakshatra pages retired 2 Sep 2026 — objectdetail.js answers every kind */
function wireBirth(){
  if(bdTab==="vargas") wireVargasTab();
  document.querySelector("#bdrail button.on")?.scrollIntoView({inline:"center",block:"nearest"});
  const r=document.getElementById("bdrail");
  if(r) r.onclick=e=>{
    const b=e.target.closest("button[data-b]");
    if(!b||b.dataset.b===bdTab) return;
    bdTab=b.dataset.b; buzz(6); renderSub();
  };
  const bb=document.getElementById("bdbody");
  if(bb) bb.onclick=e=>{
    const cy=e.target.closest("[data-cyc]");
    if(cy){ buzz(8); openSatiCycle(+cy.dataset.cyc, cy); return; }
    if(e.target.closest("#satiwhydiff")){ buzz(6);
      const d=document.getElementById("satidiff"); if(d) d.hidden=!d.hidden; return; }
    const tm=e.target.closest(".term");
    if(tm){ const d=tm.nextElementSibling;
      if(d&&d.classList.contains("termdef")) d.hidden=!d.hidden; return; }
    const pl=e.target.closest("[data-planet]");
    if(pl){ buzz(8); go(CHART_INDEX); setMode("birth"); openPlanet(pl.dataset.planet); return; }
    const ho=e.target.closest("[data-house]");
    if(ho){ buzz(8); go(CHART_INDEX); setMode("birth"); openHouse(+ho.dataset.house); return; }
    if(e.target.closest("#bd2chart")){ buzz(8); go(CHART_INDEX); setMode("birth"); return; }
    if(e.target.closest("#bd2tl")){ buzz(8); go(TIMELINE_INDEX); return; }
    if(e.target.closest("#bd2rep")){ buzz(8); subView="report"; renderSub(); return; }
  };
}

/* Birth panchang, COMPUTED. The old PANCHANG/AVAKHADA constants were
   transcribed from the Astrotalk PDF and died in a refactor - the
   Birth-details sheet crashed on a live tap (ReferenceError, caught
   31 Aug). Deriving them from the engine means this sheet can never
   again disagree with the reports. */
function birthPanchang(){
  const d=CHART.birthDate;
  const L=limbs(sunSidereal(d), moonSidereal(d));
  const m=CHART.get("Moon");
  const wd=new Date(d.getTime()+5.5*36e5).getUTCDay();      /* IST weekday */
  const dayName=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][wd];
  const dayLord=["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"][wd];
  return {
    "Vara":`${dayName} &#183; ruled by ${dayLord}`,
    "Tithi":`${L.tithi.name} (${L.tithi.paksha}, day ${L.tithi.inPaksha})`,
    "Nakshatra":`${m.nak} &#183; pada ${m.pada}`,
    "Yoga":L.yoga.name,
    "Karana":L.karana.name,
  };
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
    /* Purnima glows, Amavasya gets a rim - otherwise both vanish in a
       grid of small discs (Sangram, 29 Aug) */
    const pf=Math.round(moonPhase(dt).f*PHASE_COUNT)%PHASE_COUNT;
    const mark=pf===15?" fullm":pf===0?" newm":"";
    cells.push(`<button class="cday${today?" today":""}${sel?" sel":""}${mark}"
      data-iso="${isoOf(dt)}" aria-label="${dt.toDateString()}${
        mark===" fullm"?", full moon":mark===" newm"?", new moon":""}">
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
    return `<span class="evdot" data-t="${t.toFixed(4)}"
             style="top:${t*100}%;background:${KIND_COLOUR[e.k]||"var(--hot)"}"
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

/* Timeline is the dasha interface, full stop - the old Dasha|Sade Sati
   segmented control is gone (Tab-2 spec 2). Sade sati now lives in
   Birth Details as reference, and appears here only contextually, as a
   strip when the scrubbed date actually falls inside a window. */
let SATI_CACHE=null, SATI_KEY="";
function satiWindows(){
  const k=ACTIVE.name+"|"+CHART.get("Moon").sign;
  if(SATI_KEY!==k){ SATI_CACHE=sadeSatiWindows(CHART.get("Moon").sign, CHART.birthDate); SATI_KEY=k; }
  return SATI_CACHE;
}
function satiAt(d){
  const w=satiWindows().find(x=>d>=x.start&&d<x.end);
  if(!w) return null;
  const ph=w.phases.find(p=>d>=p.start&&d<p.end);
  return ph?{win:w,ph}:null;
}
function pratAt(when,now){
  /* third level from the validated 3-level engine; quiet at boundaries
     where the two modules disagree by a few days */
  const d3=engine().d3;
  const m3=d3.mahadashas.find(x=>when>=x.start&&when<x.end);
  const a3=m3?.antardashas.find(x=>when>=x.start&&when<x.end);
  return (m3?.lord===now.maha.lord && a3?.lord===now.antar.lord)
    ? (a3?.pratyantardashas?.find(x=>when>=x.start&&when<x.end)||null) : null;
}

function renderTimelineTab(){
  document.getElementById("pg-timeline").innerHTML=timelineBody();
  wireTimeline();
}

/* ---- LIFE EVENT DETAIL — the reflective page. Lays the person's own
   moment against the periods and transits that were running. Language
   holds the constitution's line: alongside, never caused (§50-51). ---- */
/* ---- LIFE EVENT READING — the reflective page, on the same
   warm-light surface as every other deep reading. Language holds the
   constitution's line: alongside, never caused (§50-51). ---- */
function openEventWhy(i, card){
  const e=events()[i]; if(!e) return;
  const d=new Date(e.d+"T12:00:00");
  const now=CHART.dasha.at(d);
  const pos=positions(d), retro=retrograde(d);
  const FEEL={good:"a happy one",hard:"a hard one",neutral:"one you marked"};
  const moonH=CHART.houseOfSign(signOf(pos.Moon));
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ov=document.createElement("div");
  ov.className="awpage";
  ov.innerHTML=`
    <header class="awtop">
      <button class="awback" aria-label="Back to Timeline">&#8249;</button>
      <span>${escText(e.t).slice(0,30)}</span>
    </header>
    <div class="awscroll">
      <div class="awinfhead" style="margin:6px 0 2px">
        <span class="evkey big" style="background:${KIND_COLOUR[e.k]||"#8A7FBF"}"></span>
        <div><b style="font-size:20px">${escText(e.t)}</b>
          <span>${fmtDate(d)} &#183; ${EVENT_KINDS[e.k]||e.k} &#183; ${FEEL[e.f]||FEEL.neutral}</span></div>
      </div>
      ${e.n?`<p class="awlead" style="font-style:italic;margin-top:10px">&#8220;${escText(e.n)}&#8221;</p>`:""}
      <h2 class="awh2">The period you were in</h2>
      ${now?`<p class="awbody">You were in a <b>${now.maha.lord} mahadasha</b>, inside its
        <b>${now.antar.lord} antardasha</b> (${fmtDate(now.antar.start)} to
        ${fmtDate(now.antar.end)}). ${DASHA_THEME[now.maha.lord].split(" &#8212; ")[0]}
        &#8212; and a ${now.antar.lord} stretch traditionally ${ANTAR_FLAVOR[now.antar.lord]}.</p>`
        :`<p class="awbody">This date falls outside the computed dasha range.</p>`}
      <h2 class="awh2">The sky that day</h2>
      <p class="awbody">The Moon was moving through your ${ordinal(moonH)} house
        &#8212; ${HOUSE_TRANSIT_SENSE[moonH]}.</p>
      ${["Saturn","Jupiter","Rahu","Ketu"].map(g=>{
        const h=CHART.houseOfSign(signOf(pos[g]));
        return `<p class="awbody"><b>${g}</b> was crossing your ${ordinal(h)} house
          &#8212; ${HOUSE_TRANSIT_SENSE[h]}${retro[g]&&g!=="Rahu"&&g!=="Ketu"?", retrograde":""}.</p>`;
      }).join("")}
      <div class="awctas" style="margin-top:14px">
        <button class="awcta" data-act="guide">Ask Guide about this event</button>
        <button class="awcta" data-act="edit">Edit event</button>
      </div>
      <p class="awfoot">Within Vedic astrology these periods are traditionally associated
      with such themes &#8212; shown alongside your memory as a frame for reflection.
      Nothing here means the sky caused what happened.</p>
    </div>`;
  const src=awOpen(ov,card);
  const close=(then)=>awClose(ov,src,then);
  ov.querySelector(".awback").onclick=()=>close();
  ov.onclick=ev2=>{
    const b=ev2.target.closest(".awcta"); if(!b) return;
    buzz(9);
    if(b.dataset.act==="guide") close(()=>askGuide(
      "What was happening astrologically when this happened?",
      {source:"life_event",title:e.t,date:e.d,
       mahadasha:now?now.maha.lord:undefined,antardasha:now?now.antar.lord:undefined}));
    else close(()=>{ go(YOU_INDEX); subArg=i; subView="addevent"; renderSub(); });
  };
}

/* ---- UNDERSTAND THIS PERIOD (Tab-2 spec 13, 20-35) ----------------
   One reading page for the whole configuration at the selected date -
   maha + antar + pratyantar + sade sati if running - on the same
   warm-light surface as every other deep reading. Beginners get the
   season in plain words first; the astrology arrives in layers under
   it, ending in the pratyantar table the professionals want. */
const HOUSE_THEME=["Self & vitality","Family & money","Communication & courage",
  "Home & inner ground","Creativity & children","Work & health","Partnership",
  "Transformation & shared resources","Belief & fortune","Career & standing",
  "Gains & friendship","Rest & release"];

function periodThemeRows(lord){
  const p=CHART.get(lord), out=[];
  for(const h of CHART.housesRuled(lord)) out.push({h,why:`${lord} rules your ${ordinal(h)}`});
  out.push({h:p.house,why:`${lord} occupies your ${ordinal(p.house)}`});
  for(const h of CHART.aspectedBy(lord)) out.push({h,why:`${lord} casts drishti on the ${ordinal(h)}`});
  const seen=new Set();
  return out.filter(r=>!seen.has(r.h)&&seen.add(r.h)).slice(0,4);
}

function periodEvidence(g,role,extra=""){
  const p=CHART.get(g), conj=CHART.conjunct(g), ruled=CHART.housesRuled(g);
  return `<div class="awinfblock">
    <div class="awinfhead">
      <img class="awart" src="assets/graha/${g.toLowerCase()}.png" alt="">
      <div><b>${g}</b><span>${role}</span></div>
    </div>
    <p class="because">In your chart ${g} sits in <b>${SIGNS[p.sign-1]}</b>, your
      <b>${ordinal(p.house)} house</b> &#8212; ${BHAVA[p.house-1][1].toLowerCase()} &#8212;
      in ${p.nak}${p.pada?`, pada ${p.pada}`:""}${p.dig?`, ${p.dig.toLowerCase()}`:""}.
      ${conj.length?`It shares that sign with ${conj.join(" and ")}.`:""}
      ${ruled.length?`It rules your ${ruled.map(ordinal).join(" and ")}.`:""}
      It casts drishti on the ${CHART.aspectedBy(g).map(ordinal).join(", ")}.</p>
    <div class="awctas">
      <button class="awcta" data-act="natal" data-g="${g}">See in birth chart</button>${extra}
    </div>
  </div>`;
}

function openPeriodWhy(maha,antar,when,p3,sati,card){
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mp=CHART.get(maha.lord), apn=CHART.get(antar.lord);
  const pos=Math.min(Math.max((when-maha.start)/(maha.end-maha.start),0),1);
  const apos=Math.min(Math.max((when-antar.start)/(antar.end-antar.start),0),1);
  const snap=(g,title,range,pct)=>`
    <div class="psrow">
      <img class="awart" src="assets/graha/${g.toLowerCase()}.png" alt="">
      <div><b>${title}</b><span>${range}</span></div>
      ${pct!=null?`<span class="pspct">${Math.round(pct*100)}%</span>`:""}
    </div>`;
  /* life areas the active lords actually touch (spec 33) */
  const touched=new Set();
  for(const g of [maha.lord,antar.lord]){
    CHART.housesRuled(g).forEach(h=>touched.add(h));
    touched.add(CHART.get(g).house);
    CHART.aspectedBy(g).forEach(h=>touched.add(h));
  }
  const areaRows=Object.entries(AREA_HOUSES).map(([a,hs])=>{
    const hits=hs.filter(h=>touched.has(h));
    return hits.length?`<div class="awrow"><b>${a}</b>
      <span>through your ${hits.map(ordinal).join(" and ")}</span></div>`:"";
  }).join("");
  /* the fine-grain table (spec 35) */
  const E=engine();
  const m3=E.d3.mahadashas.find(x=>Math.abs(x.start-maha.start)<3*864e5);
  const a3=m3?.antardashas.find(x=>Math.abs(x.start-antar.start)<3*864e5);
  const futureNote=when>new Date()
    ?`<p class="awbody" style="font-style:italic">This period lies ahead. What follows are the
      themes tradition associates with it &#8212; a season forecast, never a script.</p>`:"";

  const ov=document.createElement("div");
  ov.className="awpage";
  ov.innerHTML=`
    <header class="awtop">
      <button class="awback" aria-label="Back to Timeline">&#8249;</button>
      <span>${maha.lord} Mahadasha &#183; ${antar.lord} Antardasha</span>
    </header>
    <div class="awscroll">
      <div class="psnap">
        ${snap(maha.lord,`${maha.lord} Mahadasha`,
          `${fmtDate(maha.start)} &#8594; ${fmtDate(maha.end)} &#183; Age ${ageAt(maha.start)} &#8594; ${ageAt(maha.end)}`,pos)}
        ${snap(antar.lord,`${antar.lord} Antardasha`,
          `${fmtDate(antar.start)} &#8594; ${fmtDate(antar.end)}`,apos)}
        ${p3?snap(p3.lord,`${p3.lord} Pratyantardasha`,
          `${fmtDate(p3.start)} &#8594; ${fmtDate(p3.end)}`,null):""}
        ${sati?snap("Saturn",`Sade Sati &#183; ${sati.ph.phase}`,
          `${fmtDate(sati.ph.start)} &#8594; ${fmtDate(sati.ph.end)}`,null):""}
      </div>
      ${futureNote}
      <h2 class="awh2">The season you&#8217;re in</h2>
      <p class="awbody">${DASHA_THEME[maha.lord]}</p>
      <p class="awbody">Because your ${maha.lord} sits in <b>${SIGNS[mp.sign-1]}</b> in your
        <b>${ordinal(mp.house)} house</b>, the period is read through
        ${HOUSE_TRANSIT_SENSE[mp.house]}.</p>
      <h2 class="awh2">This stretch within it</h2>
      <p class="awbody">Inside the larger ${maha.lord} season, a ${antar.lord} antardasha
        traditionally ${ANTAR_FLAVOR[antar.lord]}. In your chart ${antar.lord} sits in
        ${SIGNS[apn.sign-1]} in your ${ordinal(apn.house)} house, so these themes tend to
        express through ${BHAVA[apn.house-1][1].toLowerCase()}.</p>
      <h2 class="awh2">Right now</h2>
      ${p3?`<p class="awbody">The finest dial: a <b>${p3.lord} pratyantardasha</b> runs
        ${fmtDate(p3.start)} to ${fmtDate(p3.end)}. ${p3.lord===maha.lord
          ?`It briefly brings the mahadasha&#8217;s own themes closer to the surface.`
          :`For these few weeks it ${ANTAR_FLAVOR[p3.lord]}.`}</p>`
        :`<p class="awbody">At this exact date the micro-period is changing hands &#8212;
          the two calculation layers disagree by a day or two, so Astra stays quiet
          rather than guessing.</p>`}
      ${sati?`<p class="awbody">Underneath all of it, <b>sade sati</b> is in its
        ${sati.ph.phase.toLowerCase()} phase &#8212; Saturn
        ${sati.ph.phase==="Peak"?"is crossing your natal Moon sign":`stands in ${SIGNS[sati.ph.sign-1]}, beside your Moon sign`} until
        ${fmtDate(sati.ph.end)}. The tradition reads it as a slow audit of structure and
        responsibility, colouring the dasha themes above.</p>`:""}
      <h2 class="awh2">Likely themes</h2>
      ${periodThemeRows(maha.lord).map(r=>`<div class="awrow">
        <b>${HOUSE_THEME[r.h-1]}</b><span>${r.why}</span></div>`).join("")}
      <h2 class="awh2">Where it may show up</h2>
      ${areaRows}
      <h2 class="awh2">The planets behind this</h2>
      ${periodEvidence(maha.lord,"Mahadasha lord")}
      ${antar.lord!==maha.lord?periodEvidence(antar.lord,"Antardasha lord"):""}
      ${sati?periodEvidence("Saturn","Sade sati &#183; transit",
        `<button class="awcta" data-act="chart" data-g="Saturn">See on today&#8217;s chart</button>
         <button class="awcta" data-act="sky" data-g="Saturn">See in today&#8217;s sky</button>`):""}
      ${a3?.pratyantardashas?`
      <details class="advd"><summary>Advanced timing &#8212; all nine pratyantardashas</summary>
        ${a3.pratyantardashas.map(pr=>{
          const on=when>=pr.start&&when<pr.end;
          return `<div class="awrow${on?" cur":""}"><b>${pr.lord}</b>
            <span>${fmtDate(pr.start)} &#8594; ${fmtDate(pr.end)}</span></div>`}).join("")}
      </details>`:""}
      <details class="advd"><summary>Traditional practice &#183; ${maha.lord}</summary>
        <p class="awbody">Within Vedic tradition, periods governed by ${maha.lord} are
        associated with observances directed to that graha &#8212; recitation, giving on
        ${WEEKDAY[maha.lord]}, and reflective discipline. No practice is offered as a
        guarantee of outcome.</p>
      </details>
      <div class="awctas" style="margin-top:14px">
        <button class="awcta" data-act="guide">Ask Guide about this period</button>
      </div>
      <p class="awfoot">Dates from the Vimshottari engine, validated against the printed
      reports. Traditional associations within Vedic astrology &#8212; a lens for
      reflection, not a forecast.</p>
    </div>`;
  const src=awOpen(ov,card);
  const close=(then)=>awClose(ov,src,then);
  ov.querySelector(".awback").onclick=()=>close();
  ov.onclick=e=>{
    const b=e.target.closest(".awcta"); if(!b) return;
    buzz(9); const g=b.dataset.g;
    if(b.dataset.act==="natal") close(()=>{ go(CHART_INDEX); setMode("birth"); openPlanet(g); });
    else if(b.dataset.act==="chart") close(()=>{ go(CHART_INDEX); setMode("today"); openPlanet(g); });
    else if(b.dataset.act==="guide") close(()=>askGuide(
      "What does this period of my life mean?",
      {source:"timeline",mahadasha:maha.lord,antardasha:antar.lord,
       date:when.toDateString(),sadeSati:sati?sati.ph.phase:undefined}));
    else close(()=>openSkyFocused(g));
  };
}

function timelineBody(){
  const {m}=tlBounds();
  if(tlT===null) tlT=tlNowT();
  /* No standing instructional copy (spec 4) - a one-time gesture hint
     plays on first visit, then never again. */
  let hint="";
  try{
    if(!localStorage.getItem("astro.tlhint")){
      hint=`<div class="tlhint" aria-hidden="true"><svg viewBox="0 0 24 24">
        <path d="M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4"/></svg></div>`;
      localStorage.setItem("astro.tlhint","1");
    }
  }catch(_){}
  return `
    <div class="tl2">${hint}
      <div class="spine" id="spine" role="slider" tabindex="0"
           aria-label="Move through time" aria-valuemin="0" aria-valuemax="100">
        <div class="spinecol" id="spinecol" style="height:${TL_H}px">
          ${(()=>{ /* antar sub-bands ride inside each maha band, shown
               when that maha is active - the 9-in-9 nesting of
               Vimshottari drawn, not described */
            const d3m=engine().d3.mahadashas;
            return m.map((d,i)=>`<div class="band" data-i="${i}" style="flex:${d.years};
              background:linear-gradient(180deg, ${COLOUR(d.lord)}30, ${COLOUR(d.lord)}0c)">
              <div class="subs" aria-hidden="true">${(d3m[i]?.antardashas||[]).map(a=>
                `<i style="flex:${a.end-a.start} 0 0;background:${COLOUR(a.lord)}1f;
                   border-top:1px solid ${COLOUR(a.lord)}59"></i>`).join("")}</div>
              <img class="bico" src="assets/graha/${d.lord.toLowerCase()}.png" alt="${d.lord}">
            </div>`).join("");})()}
        </div>
        <span class="nowtick" id="nowtick" title="today"></span>
        ${(()=>{ /* decade ticks on the rail - the whole-life map gets a scale */
          const {t0,t1}=tlBounds(); const out=[];
          for(let a=10;a<=110;a+=10){
            const t=(CHART.birthDate.getTime()+a*365.2425*864e5-t0)/(t1-t0);
            if(t>0.01&&t<0.99) out.push(`<span class="agetick" style="top:${(t*100).toFixed(2)}%"><i></i>${a}</span>`);
          }
          return out.join("");})()}
        ${subEventsMarkup()}
        <div class="spinemark"><i></i></div>
      </div>
      <div class="tlbody" id="ro"></div>
    </div>
    `;
}

/* Age never reads below zero (Sangram, 2 Sep): a period that was already
   running at birth is shown from birth, not from a negative age. */
const ageAt=d=>Math.max(0,Math.floor((d-CHART.birthDate)/(365.2425*864e5)));
const ageSpan=(a,b)=>(a<CHART.birthDate?"birth":`age ${ageAt(a)}`)+`&#8211;${ageAt(b)}`;

function wireTimeline(){
  const {m,t0,t1}=tlBounds();
  const spine=document.getElementById("spine");
  const col=document.getElementById("spinecol");
  let lastLord=null, lastAntar=null, lastSati=null, prevWhen=null;
  document.getElementById("nowtick").style.top=(tlNowT()*100)+"%";

  const paint=()=>{
    spine.setAttribute("aria-valuenow",Math.round(tlT*100));
    const vh=spine.clientHeight;
    col.style.transform=`translateY(${-(tlT*TL_H - vh/2)}px)`;

    const when=new Date(t0+tlT*(t1-t0));
    const now=CHART.dasha.at(when); if(!now) return;
    document.querySelectorAll(".band").forEach((b,i)=>
      b.classList.toggle("on", when>=m[i].start && when<m[i].end));
    document.querySelectorAll(".evdot").forEach(d=>
      d.classList.toggle("on", Math.abs(+d.dataset.t - tlT)<0.012));

    const pos=(when-now.maha.start)/(now.maha.end-now.maha.start);
    const apos=Math.min(Math.max((when-now.antar.start)/(now.antar.end-now.antar.start),0),1);
    const p3=pratAt(when,now);
    const sati=satiAt(when);
    const inPeriod=events().map((e,i)=>({...e,_i:i})).filter(e=>{
      const d=new Date(e.d+"T12:00:00");
      return d>=now.maha.start && d<now.maha.end});

    /* landing order per spec 19: maha, antar, pratyantar, contextual
       sade sati, one CTA, life events. Interpretation lives behind the
       CTA, not on the landing. */
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
      <div class="antarcard">
        <p class="abig" style="color:${COLOUR(now.antar.lord)}">${gIcon(now.antar.lord,22)}${now.antar.lord} antardasha</p>
        <div class="spanrow sm">
          <div><span class="sk">from</span><b>${fmtDate(now.antar.start)}</b></div>
          <span class="sarrow">&#8594;</span>
          <div><span class="sk">to</span><b>${fmtDate(now.antar.end)}</b></div>
        </div>
        <div class="bar sm"><i style="width:${(apos*100).toFixed(1)}%;background:${COLOUR(now.antar.lord)}"></i></div>
        <p class="poslabel">${Math.round(apos*100)}% through</p>
      </div>
      ${p3?`<div class="pratstrip">
        <span class="eyebrow">Current micro-period</span>
        <div class="pratrow">${gIcon(p3.lord,17)}
          <b style="color:${COLOUR(p3.lord)}">${p3.lord} pratyantardasha</b>
          <span class="evmeta">${fmtDate(p3.start)} &#8211; ${fmtDate(p3.end)}</span></div>
      </div>`:""}
      ${sati?(()=>{const sp=Math.min(Math.max((when-sati.ph.start)/(sati.ph.end-sati.ph.start),0),1);
        return `<div class="satistrip" id="satistrip" role="button" tabindex="0">
        ${gIcon("Saturn",18)}
        <div><b>Sade Sati &#183; ${sati.ph.phase}</b>
          <span class="evmeta">${fmtDate(sati.ph.start)} &#8211; ${fmtDate(sati.ph.end)} &#183;
          Saturn ${sati.ph.phase==="Peak"?"crossing your natal Moon sign":`in ${SIGNS[sati.ph.sign-1]}`}</span>
          <span class="satibar"><i style="width:${(sp*100).toFixed(0)}%"></i></span></div>
      </div>`})():""}
      <button class="understand" id="understand">Understand this period<span class="chev">&#8250;</span></button>
      <div class="eyebrow" style="margin:20px 0 8px">Your life around this time</div>
      ${inPeriod.map(e=>{const ed=eventDasha(e.d);
        return `<button class="evrow tap" data-ev="${e._i}">
          <span class="evkey" style="background:${KIND_COLOUR[e.k]}"></span>
          <span><b>${e.t}</b><span class="evmeta">${fmtDate(new Date(e.d+"T12:00:00"))}
          &#183; ${ed?`${gIcon(ed.maha.lord,13)}${ed.maha.lord}/${ed.antar.lord}`:""}</span></span>
          <span class="chev">&#8250;</span></button>`}).join("")}
      <button class="addev" id="tladdev">+ Add event</button>`;
    setTopBar(when.toLocaleDateString("en-GB",{month:"long",year:"numeric"}),
      {sub:`Age ${ageAt(when)}`,
       actions:isToday(when)?`<span class="nowbadge">today</span>`
         :`<button class="tb-btn txt" id="tlnow">Today</button>`});
    const tn=document.getElementById("tlnow");
    if(tn) tn.onclick=()=>{tlT=tlNowT();buzz(10);paint()};
    const un=document.getElementById("understand");
    if(un) un.onclick=()=>openPeriodWhy(now.maha, now.antar, when, p3, sati, un);
    const ae=document.getElementById("tladdev");
    if(ae) ae.onclick=()=>{ buzz(7); go(YOU_INDEX); subArg=null; subView="addevent"; renderSub(); };
    const ss=document.getElementById("satistrip");
    if(ss) ss.onclick=()=>{ buzz(8); go(YOU_INDEX); bdTab="sati"; subView="birth"; renderSub(); };
    document.querySelectorAll(".evrow.tap").forEach(b=>b.onclick=()=>{
      buzz(8); openEventWhy(+b.dataset.ev, b); });
    /* boundary haptics (spec 6): maha strongest, antar lighter, sati
       phase change distinct, saved events a soft tick */
    /* audit item 3: period names crossfade as a boundary is crossed,
       instead of hard-swapping mid-scrub */
    const crossed=now.maha.lord!==lastLord||now.antar.lord!==lastAntar;
    if(crossed&&lastLord!==null){
      const ro2=document.getElementById("ro");
      ro2.classList.remove("swap"); void ro2.offsetWidth; ro2.classList.add("swap");
    }
    if(now.maha.lord!==lastLord){lastLord=now.maha.lord;lastAntar=now.antar.lord;buzz(11)}
    else if(now.antar.lord!==lastAntar){lastAntar=now.antar.lord;buzz(6)}
    const satiKey=sati?sati.ph.phase+sati.ph.start.getTime():null;
    if(lastSati!==null&&satiKey!==lastSati) buzz(8);
    lastSati=satiKey;
    if(prevWhen!==null){
      const lo=Math.min(prevWhen,when), hi=Math.max(prevWhen,when);
      if(hi-lo<86400e3*400 && events().some(e=>{
        const d=new Date(e.d+"T12:00:00"); return d>=lo&&d<hi;})) buzz(5);
    }
    prevWhen=when;
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
    <div class="fld"><span class="flabel">How it felt</span>
      <div class="feelseg" id="feelseg">
        ${[["good","Happy"],["neutral","Neutral"],["hard","Hard"]].map(([v,l])=>
          `<button type="button" data-f="${v}"
            class="${(ed?.f||"neutral")===v?"on":""}">${l}</button>`).join("")}
      </div></div>
    <button class="primary" id="esave">${ed?"Save changes":"Add event"}</button>
    ${ed?`<button class="danger" id="edel">Remove</button>`:""}`;
}
function wireAddEvent(){
  document.getElementById("esave").onclick=()=>{
    const d=document.getElementById("e_date").value;
    const t=document.getElementById("e_title").value.trim();
    const n=document.getElementById("e_note").value.trim();
    const k=document.getElementById("e_kind").value;
    const f=document.querySelector("#feelseg .on")?.dataset.f||"neutral";
    if(!d||!t){alert("A date and a description are needed.");return}
    const l=events();
    if(subArg!=null) l[subArg]={...l[subArg],d,t,n,k,f,demo:false}; else l.push({d,t,n,k,f});
    saveEvents(l); buzz(12); subArg=null; subView="events"; renderSub();
  };
  const fs=document.getElementById("feelseg");
  if(fs) fs.onclick=e=>{const b=e.target.closest("[data-f]"); if(!b) return;
    fs.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b)); buzz(5);};
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

/* v3: the partner appears as Natasha in the app at Sangram's request;
   the birth data underneath is real so every computation stays true */
const PKEY="astro.partners.v3";
const DEMO=[{name:"Natasha",born:"1988-10-12T13:56:00+05:30",
             lat:25.18, lon:75.84, place:"Kota"}];
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
    ${rows([["Born",`${fmtDate(new Date(p.born))}, ${fmtClock(new Date(p.born))} IST`],
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
    <button class="item repentry" id="prelrep" style="margin-top:18px">
      <svg class="ico" viewBox="0 0 24 24">${ICONS.doc}</svg>Download relationship report
      <span class="sub">&#8377;399 &#183; $11.99</span><span class="chev">&#8250;</span>
    </button>
    <p class="note">${p.approx?`No birth time was given, so noon was assumed. The Moon
      moves about 13&#176; a day, so the nakshatra may be wrong by one either way &#8212;
      which changes several kootas. Add the real time for a reliable score.<br><br>`:``}
      Gun Milan is one traditional method among several, and a score is not a verdict on a
      relationship. Kootas marked <i>simplified rule</i> use a reduced version of a longer
      classical table and will be completed later.</p>`;
}

function wirePartner(){
  const r=document.getElementById("prelrep");
  if(r) r.onclick=()=>{ buzz(8);
    r.querySelector(".sub").textContent="purchases arrive with the App Store build";
  };
}

const TABS=[
  {id:"today",label:"Today",icon:'<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 9.6h17M8 3.2v3.6M16 3.2v3.6"/><circle cx="12" cy="14.6" r="1.5" fill="currentColor" stroke="none"/>'},
  {id:"timeline",label:"Timeline",icon:'<circle cx="12" cy="12" r="8.6"/><path d="M12 7.2V12l3.2 2"/>'},
  {id:"universe",label:"Universe",
   icon:'<rect x="3.6" y="3.6" width="16.8" height="16.8" rx="1.4"/><path d="M3.6 3.6l16.8 16.8M20.4 3.6L3.6 20.4M12 3.6l8.4 8.4-8.4 8.4-8.4-8.4z"/>'},
  {id:"guide",label:"Guide",icon:'<path d="M20 15.2a2.6 2.6 0 01-2.6 2.6H8.2L4 20.8V6.2A2.6 2.6 0 016.6 3.6h10.8A2.6 2.6 0 0120 6.2z"/>'},
  {id:"you",label:"You",icon:'<circle cx="12" cy="8.4" r="3.5"/><path d="M4.8 20.4c0-4 3.2-7.2 7.2-7.2s7.2 3.2 7.2 7.2"/>'}
];

const YOU_INDEX=4, CHART_INDEX=2, TIMELINE_INDEX=1;
function setTopBar(title,{back=false,actions="",sub="",centre=""}={}){
  document.getElementById("tbtitle").innerHTML=
    !title ? "" : sub?`<b>${title}</b><span>${sub}</span>`:`<b>${title}</b>`;
  document.getElementById("tbback").classList.toggle("on",back);
  document.getElementById("tbact").innerHTML=actions;
  document.getElementById("tbcentre").innerHTML=centre;
}
document.getElementById("tbback").onclick=()=>{
  buzz(5);
  if(subView==="reportview"||subView==="relreportview"){subView="report";subArg=null;renderSub();return}
  if(subView==="partner"||subView==="addpartner"){subView=cameFrom||"rel";subArg=null;renderSub()}
  else if(subView==="addevent"){subView="events";subArg=null;renderSub()}
  else if(subView==="learntopic"){subView="learn";renderSub()}
  else if(subView==="personchart"){subView="people";subArg=null;renderSub()}
  else{subView=null;subArg=null;renderYou()}
};
document.body.classList.add("light");
const nav=document.getElementById("tabs");
nav.innerHTML=TABS.map((t,i)=>`<button class="tab ${t.hero?"hero":""} ${i===0?"on":""}"
  role="tab" data-i="${i}" aria-label="${t.label}">
  <span class="tabico"><svg viewBox="0 0 24 24">${t.icon}</svg></span>
  <span class="tablbl">${t.label}</span></button>`).join("");

/* the bar minimises while reading: scroll down past the fold hides the other tabs,
   scroll up (or any tap on the bar) brings them back */
{ let lastY=0;
  document.querySelectorAll(".page").forEach(pg=>pg.addEventListener("scroll",()=>{
    const y=pg.scrollTop, dy=y-lastY; lastY=y;
    if(dy>6&&y>80) document.body.classList.add("tabmin");
    else if(dy<-6||y<40) document.body.classList.remove("tabmin");
  },{passive:true}));
  nav.addEventListener("click",()=>document.body.classList.remove("tabmin"),true); }
let activeTab=0, guideFrom=0;
function go(i){
  if(mode) resetChart();
  /* iOS convention: tapping the tab you are already on pops to its root */
  if(i!==YOU_INDEX || activeTab===YOU_INDEX){
    subView=null; subArg=null; document.body.classList.remove("insub"); }
  const from=activeTab;
  activeTab=i;
  /* two materials: the instrument (Universe) keeps its night; every reading tab is paper */
  document.body.classList.toggle("light", i!==CHART_INDEX);
  /* the bar belongs to the tab, so it has to be reset on every switch -
     the render functions only run once at startup */
  if(i===0) renderToday();
  else if(i===TIMELINE_INDEX) renderTimelineTab();
  else if(i===CHART_INDEX) setUniverseBar();
  else if(i===3) renderGuide();
  /* Guide is a room, not a tab: the nav bows out and a close returns you */
  if(i===3){ if(from!==3) guideFrom=from; document.body.classList.add("guidefull"); }
  else { document.body.classList.remove("guidefull");
    if(from===3) guideExit(); }
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

/* a phone wakes days later: stale skies must refresh themselves */
let lastRenderAt=Date.now();
document.addEventListener("visibilitychange",()=>{
  if(document.hidden) return;
  if(Date.now()-lastRenderAt < 20*60*1000) return;
  lastRenderAt=Date.now();
  if(isToday(viewDate)||viewDate<new Date()) viewDate=new Date();
  renderToday();
  if(document.getElementById("pg-universe").classList.contains("on")){
    if(mode) resetChart();
    uniDate=dateAtOffset(dayOffset);
    paintUniverse(true); paintRuler(); updateScrubLabel();
  }
});

/* ---- PULL TO REFRESH -------------------------------------------
   The shell is fixed and pages scroll inside it, so Safari's own
   pull-to-refresh (which watches the document scroller) can never
   fire here. So the app supplies its own: pull down from the top of
   Today or You and the tab re-renders against the live clock.
   Universe, Timeline and Guide are excluded - they own their drags. */
/* No pull-to-refresh (Sangram, 1 Sep): it collided with the rhythm
   seeker's drag, and a daily screen should simply stay current. A
   minute tick keeps the now-marker honest and rolls the day over at
   midnight; the visibility handler above covers long sleeps. */
let tickDay=new Date().toDateString();
setInterval(()=>{
  if(document.hidden) return;
  const nowD=new Date();
  if(nowD.toDateString()!==tickDay){
    tickDay=nowD.toDateString();
    lastRenderAt=Date.now();
    if(isToday(viewDate)||viewDate<nowD) viewDate=nowD;
    renderToday();
    return;
  }
  const rn=document.querySelector(".rnow");
  if(rn&&isToday(viewDate)){
    const M=rhythmModel(viewDate);
    if(M) rn.style.left=(((nowD.getTime()-M.d0)/(M.d1-M.d0))*100).toFixed(3)+"%";
  }
},60000);

/* the onboarded person's own chart takes over from the built-in
   reference chart before anything paints */
const __me=meProfile();
if(__me){ try{
  const d=new Date(__me.born);
  CHART=chartFor(d, ascendant(d, __me.lat, __me.lon));
  ACTIVE={name:__me.name, first:__me.name.split(" ")[0], p:{...__me}};
}catch(_){} }

document.body.insertAdjacentHTML("afterbegin",MOON_DEFS);
renderUniverse(); renderGuide(); renderYou(); renderTimelineTab(); renderToday();

/* a planet tapped inside the sky view lands on its chart page */
addEventListener("astra:openplanet",e=>{           /* birth placement */
  go(CHART_INDEX); setMode("birth");
  setTimeout(()=>openPlanet(e.detail),260);
});
addEventListener("astra:opentransit",e=>{          /* current influence, warm-light reading */
  go(0); setTimeout(()=>openTransitWhy(e.detail,null),200);
});
addEventListener("astra:askguide",e=>{ const {q,ctx}=e.detail||{}; if(q) askGuide(q,ctx); });
/* legacy events from older surfaces: the universal detail answers them now */
addEventListener("astra:opensign",e=>openObject({kind:"rashi",id:+e.detail,mode:"birth",from:"event",emphasis:"birth"}));
addEventListener("astra:opennak",e=>openObject({kind:"nakshatra",id:+e.detail,mode:"birth",from:"event",emphasis:"birth"}));
addEventListener("astra:openhouse",e=>{ go(CHART_INDEX); setMode("birth"); setTimeout(()=>openHouse(+e.detail),260); });
addEventListener("astra:openbirth",()=>{ go(YOU_INDEX); bdTab="overview"; subView="birth"; renderSub(); });
/* the sky's moment editor knocks on the Pro door */
addEventListener("astra:pro",()=>openProSheet());

/* a Pro user who was viewing another person comes back to them */
try{
  const an=localStorage.getItem("astro.activeUser");
  if(an && isPro()){ const p=partners().find(x=>x.name===an); if(p) setActiveUser(p); }
}catch(_){}

/* ==================================================================
   ONBOARDING - the beginning of a personal universe (CLAUDE.md
   §99-102). Three quiet steps: welcome -> keeping the chart -> the
   birth moment; then the person's own sky arrives.

   Google sign-in wires itself up when OB_GOOGLE_CLIENT_ID is set (the
   origin must be authorized for it in Google Cloud Console); until
   then the account step says, honestly, that the chart lives on this
   device. No fake buttons.

   First run (no stored profile, never onboarded) opens it; #onboard
   in the URL reopens it any time for review.
   ================================================================== */
const OB_GOOGLE_CLIENT_ID="";
let obEl=null, obStep=0, obPlace=null, obDraft={};

/* the onboarded person; function declaration so the boot code and
   setActiveUser (which run earlier in the module) can hoist-call it */
function meProfile(){
  try{ return JSON.parse(localStorage.getItem("astro.me")||"null"); }
  catch(_){ return null; }
}

function openOnboarding(){
  if(obEl) return;
  obEl=document.createElement("div");
  obEl.className="onb";
  document.body.appendChild(obEl);
  obStep=0; obPlace=null; obDraft={};
  paintOnb();
}
function closeOnboarding(){ obEl?.remove(); obEl=null; }

function paintOnb(){
  if(!obEl) return;
  const esc2=t=>String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  if(obStep===0){
    obEl.innerHTML=`<div class="onbstep">
      <p class="obword">Astra</p>
      <p class="obline">Your birth chart, computed to the arc-minute &#8212;
        and a sky you can touch.</p>
      <button class="primary obwide" data-ob="begin">Begin</button>
      <button class="obghost" data-ob="sample">Explore a sample chart first</button>
      <div class="oblang" role="radiogroup" aria-label="Language">
        ${LANG_OPTS.map(([k,l])=>`<button data-oblang="${k}"
          class="${(PREFS().lang||"en")===k?"on":""}" role="radio"
          aria-checked="${(PREFS().lang||"en")===k}">${l}</button>`).join("")}
      </div>
      <p class="obnote" style="text-align:center;margin-top:6px">Guide converses in your
        language today; the full app follows.</p>
    </div>`;
  }else if(obStep===1){
    obEl.innerHTML=`<div class="onbstep">
      <h2 class="obh">Keeping your chart</h2>
      ${OB_GOOGLE_CLIENT_ID
        ?`<p class="obline">Sign in so your chart follows you.</p>
          <div id="gbtn" style="display:flex;justify-content:center;margin:14px 0"></div>
          <button class="obghost" data-ob="device">Continue without an account</button>`
        :`<p class="obline">For now your chart is stored privately on this device
            &#8212; nothing leaves it. Accounts and sync arrive with the App Store
            release.</p>
          <button class="primary obwide" data-ob="device">Continue</button>`}
    </div>`;
    obWireGoogle();
  }else{
    const d=obDraft;
    obEl.innerHTML=`<div class="onbstep">
      <h2 class="obh">The moment you arrived</h2>
      <p class="obline sm">The sky is cast for one exact moment and place. Birth time
        matters most &#8212; the ascendant changes sign about every two hours.</p>
      <label class="fld"><span class="flabel">Name</span>
        <input id="ob_name" type="text" autocomplete="name" value="${esc2(d.name||"")}" placeholder="Your name"></label>
      <div class="sverow">
        <label class="fld"><span class="flabel">Birth date</span>
          <input id="ob_date" type="date" value="${d.date||""}"></label>
        <label class="fld"><span class="flabel">Birth time</span>
          <input id="ob_time" type="time" value="${d.time||""}" ${d.noTime?"disabled":""}></label>
      </div>
      <button class="obcheck${d.noTime?" on":""}" id="ob_notime" role="checkbox"
        aria-checked="${!!d.noTime}"><i></i>I don&#8217;t know my birth time</button>
      ${d.noTime?`<p class="obnote">We&#8217;ll assume midday. Your Moon sign, nakshatra and
        dasha sequence stay close; the ascendant and houses can&#8217;t be trusted without
        a time, and Astra will say so rather than guess.</p>`:""}
      <label class="fld" style="position:relative"><span class="flabel">Birthplace</span>
        <input id="ob_place" type="search" autocomplete="off" autocorrect="off"
          spellcheck="false" value="${esc2(d.placeText||"")}" placeholder="Start typing a city&#8230;">
      </label>
      <div class="svplist" id="ob_plist"></div>
      <button class="primary obwide" id="ob_go" disabled>Cast my chart</button>
    </div>`;
    obWireBirth();
  }
  obEl.querySelectorAll("[data-oblang]").forEach(b=>b.onclick=()=>{
    setPref("lang",b.dataset.oblang); buzz(6); paintOnb();
  });
  obEl.querySelectorAll("[data-ob]").forEach(b=>b.onclick=()=>{
    buzz(8);
    const a=b.dataset.ob;
    if(a==="begin"){ obStep=1; paintOnb(); }
    else if(a==="device"){ obStep=2; paintOnb(); }
    else if(a==="sample"){
      localStorage.setItem("astro.onboarded","1");
      closeOnboarding();
    }
  });
}

function obWireGoogle(){
  if(!OB_GOOGLE_CLIENT_ID) return;
  const s=document.createElement("script");
  s.src="https://accounts.google.com/gsi/client"; s.async=true;
  s.onload=()=>{ try{
    google.accounts.id.initialize({client_id:OB_GOOGLE_CLIENT_ID, callback:r=>{
      try{
        const p=JSON.parse(atob(r.credential.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));
        localStorage.setItem("astro.account",JSON.stringify({email:p.email,name:p.name}));
        obDraft.name=p.name||"";
        obStep=2; paintOnb();
      }catch(_){}
    }});
    google.accounts.id.renderButton(obEl.querySelector("#gbtn"),
      {theme:"filled_black",width:280,shape:"pill"});
  }catch(_){} };
  document.head.appendChild(s);
}

function obWireBirth(){
  const $o=id=>obEl.querySelector(id);
  const valid=()=>{
    obDraft.name=$o("#ob_name").value; obDraft.date=$o("#ob_date").value;
    obDraft.time=$o("#ob_time").value;
    $o("#ob_go").disabled=!(obDraft.name.trim()&&obDraft.date&&
      (obDraft.noTime||obDraft.time)&&obPlace);
  };
  ["#ob_name","#ob_date","#ob_time"].forEach(id=>$o(id).addEventListener("input",valid));
  $o("#ob_notime").onclick=()=>{
    obDraft.noTime=!obDraft.noTime; buzz(6); paintOnb();
  };
  let seq=0;
  $o("#ob_place").addEventListener("input",()=>{
    obPlace=null; obDraft.placeText=$o("#ob_place").value; valid();
    const q=$o("#ob_place").value.trim(); const s=++seq;
    const list=$o("#ob_plist");
    if(q.length<2){ list.innerHTML=""; return; }
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en&format=json`)
      .then(r=>r.json()).then(j=>{
        if(s!==seq||!obEl) return;
        const esc2=t=>String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
        const hits=j.results||[];
        list.innerHTML=hits.map((x,i)=>`<button class="svpitem" data-i="${i}">
          ${esc2(x.name)} <span class="svpsub">${esc2([x.admin1,x.country].filter(Boolean).join(", "))}</span></button>`).join("");
        list.querySelectorAll(".svpitem").forEach(b=>b.onclick=()=>{
          const x=hits[+b.dataset.i];
          obPlace={n:x.name, detail:[x.admin1,x.country].filter(Boolean).join(", "),
            lat:x.latitude, lon:x.longitude, tz:x.timezone};
          obDraft.placeText=`${x.name}${obPlace.detail?", "+obPlace.detail:""}`;
          $o("#ob_place").value=obDraft.placeText;
          list.innerHTML=""; buzz(6); valid();
        });
      }).catch(()=>{});
  });
  $o("#ob_go").onclick=()=>{
    const [y,mo,da]=obDraft.date.split("-").map(Number);
    const [hh,mi]=obDraft.noTime?[12,0]:obDraft.time.split(":").map(Number);
    const born=obPlace.tz
      ? utcFromLocalTz(y,mo,da,hh,mi,obPlace.tz)
      : new Date(Date.UTC(y,mo-1,da,hh,mi));
    const me={name:obDraft.name.trim(), born:born.toISOString(),
      place:obDraft.placeText, lat:obPlace.lat, lon:obPlace.lon,
      tz:obPlace.tz||null, approx:!!obDraft.noTime};
    try{
      localStorage.setItem("astro.me",JSON.stringify(me));
      localStorage.setItem("astro.onboarded","1");
    }catch(_){}
    setActiveUser(null);                     /* boots the me profile */
    closeOnboarding();
    go(CHART_INDEX);
    buzz(16);
    /* the arrival: planets fade in one by one (§101 step 6);
       Reduce Motion gets them all at once via CSS */
    const pl=document.getElementById("plane");
    if(pl){ pl.classList.add("reveal");
      setTimeout(()=>pl.classList.remove("reveal"),2600); }
  };
}

if((!meProfile() && !localStorage.getItem("astro.onboarded"))
   || location.hash.includes("onboard")) openOnboarding();

/* Today's panchang card → the festival calendar under You */
document.addEventListener("click",e=>{
  const b=e.target.closest("#festlink"); if(!b) return;
  buzz(7); go(YOU_INDEX); subView="festivals"; subArg=null; renderSub();
});

/* ---- reproducible Sky test states (phase gates): ?sky=1&mode=birth|now&t=ISO&az=&alt=&fov=&sel=&preset=&state= ----
   deterministic place (the profile's birthplace, IST), no sensors, no geolocation */
setTimeout(()=>{
  try{
    const q=new URLSearchParams(location.search); if(!q.get("sky")) return;
    const o={lat:BIRTHPLACE.lat,lon:BIRTHPLACE.lon,from:BIRTHPLACE.name.split(",")[0],tz:"Asia/Kolkata",motion:false,
      mode:q.get("mode")||"now",pro:true,birth:skyBirthOpts()};
    for(const k of ["at","az","alt","fov","sel","preset","state"]) if(q.get(k)!=null) o[k]=q.get(k);
    o.quiet=q.get("quiet")!=="0"; o.artPending=q.get("art")==="pending";
    if(q.get("orr")!=null) o.orr=+q.get("orr");
    if(q.get("t")) o.at=q.get("t");
    if(q.get("hints")!=="1") try{ localStorage.setItem("astro.sky.hints",JSON.stringify({move:1,pinch:1,time:1})); }catch(_){}
    openSkyView(o);
  }catch(e){ console.warn("sky test state failed", e); }
},700);
