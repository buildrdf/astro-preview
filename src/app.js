import { limbs, vara, taraBala, houseFrom, gocharaFavourable,
         chandrashtama, GOCHARA_GOOD } from "./panchang.js";
import { GRAHA_MEANING, GOCHARA_FEEL, HOUSE_TRANSIT_SENSE, SPECIAL,
         DAY_DO, DAY_AVOID, VARA_PRACTICE, PLANET_STORY } from "./interpret.js";
import { LEARN_LEVELS } from "./learn.js";
import { AREA_HOUSES, AREA_LINE, TONE_WORD, PLAIN_DAY, VARA_COLOUR } from "./narrative.js";
import { whereIs, riseSetHint, ascendant } from "./sky.js";
import { ashtakoota, manglik } from "./match.js";
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
  const pull=(m,k)=>[m[0]+(A[0]-m[0])*k, m[1]+(A[1]-m[1])*k];
  const E=pull(sharedEdgeMid(h,prev), HOUSES[h].length===3?0.40:0.24);
  const X=pull(sharedEdgeMid(h,next), HOUSES[h].length===3?0.40:0.24);
  const l1=Math.hypot(A[0]-E[0],A[1]-E[1]), l2=Math.hypot(X[0]-A[0],X[1]-A[1]);
  PATH_CACHE[h]={E,A,X,l1,l2,L:l1+l2};
}
/* position along E -> anchor -> X by fraction of the sign traversed */
function pathPoint(h,t){
  const P=PATH_CACHE[h], s=t*P.L;
  if(s<=P.l1){ const k=P.l1?s/P.l1:0;
    return {x:P.E[0]+(P.A[0]-P.E[0])*k, y:P.E[1]+(P.A[1]-P.E[1])*k,
            ux:(P.A[0]-P.E[0])/(P.l1||1), uy:(P.A[1]-P.E[1])/(P.l1||1)}; }
  const k=P.l2?(s-P.l1)/P.l2:0;
  return {x:P.A[0]+(P.X[0]-P.A[0])*k, y:P.A[1]+(P.X[1]-P.A[1])*k,
          ux:(P.X[0]-P.A[0])/(P.l2||1), uy:(P.X[1]-P.A[1])/(P.l2||1)};
}

/* longitude -> a point inside its house, ordered by degree along the
   house's long axis, then nudged apart if two land on top of each other */
function placeByDegree(list){
  const byHouse={};
  list.forEach(p=>{ (byHouse[p.house]=byHouse[p.house]||[]).push(p) });
  const out={};
  for(const h in byHouse){
    const poly=HOUSES[h];
    const group=byHouse[h].slice().sort((a,b)=>degIn(a.L)-degIn(b.L));
    const dpx=(group.length>=3?22:group.length===2?25:29);
    const margin=Math.min(dpx/2/CHART_PX*100/inradius(poly),0.42);
    if(group.length===1){
      const p=group[0], t=0.09+(degIn(p.L)/30)*0.82, pt=pathPoint(+h,t);
      out[p.graha]=fitInside([pt.x,pt.y],poly,ANCHOR[h],margin);
      continue;
    }
    /* several grahas in one house: the CLUSTER travels the path at the
       mean degree, and the members sit radially around it. The ring is
       sized to the house and only its CENTRE is clamped - clamping each
       member separately collapsed them onto one point in the triangles. */
    const meanT=0.09+(group.reduce((a,p)=>a+degIn(p.L),0)/group.length/30)*0.82;
    const inr=inradius(poly);
    const R=Math.min(group.length===2?5.4:7.2, inr*0.72);
    const c0=pathPoint(+h,meanT);
    const cm=Math.min(0.42, margin + R/inr*0.5);
    const c=fitInside([c0.x,c0.y],poly,ANCHOR[h],cm);
    const a0=Math.atan2(c0.uy,c0.ux)-Math.PI/2;   /* first disc perpendicular to travel */
    group.forEach((p,i)=>{
      const a=a0 + i*(2*Math.PI/group.length);
      out[p.graha]=[c[0]+Math.cos(a)*R, c[1]+Math.sin(a)*R];
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
      `Across your five areas, <b>${best.area.toLowerCase()}</b> carries the most support today`+
      `${worst.tone==="slow" ? `, and <b>${worst.area.toLowerCase()}</b> the least` : ""}.`;
  return {F, areas, head, body};
}

/* ---- prose assembly: facts from the engine, words from the library ---- */
function leadLine(e,F){
  if(e.tara) return `Today's Moon is in <b>${NAK[F.todayMoonNak]}</b>, `+
    `${ordinal(F.tara.count)} from your birth star &#8212; <b>${F.tara.name}</b>, `+
    `${F.tara.tone==="good"?"a supportive count":F.tara.tone==="testing"?"a count that asks for patience":"your own star"}.`;
  return `<b>${e.graha}</b> ${e.occupies
      ?`is moving through your ${ordinal(e.house)} house`
      :`aspects your ${e.aspects.map(ordinal).join(" and ")}`}`
    +` &#8212; ${e.favourable?"well placed from your Moon":"a slower placement from your Moon"}`
    +`${e.retro?", and retrograde":""}.`;
}
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

  setTopBar("Hi Sangram",{sub:viewDate.toLocaleDateString("en-GB",
      {weekday:"short",day:"numeric",month:"short"}).replace(",",""),
    actions:`${isToday(viewDate)?"":`<button class="tb-btn txt" id="totoday">Today</button>`}
     <button class="tb-btn" id="calbtn" aria-label="Choose a date">
       <svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/>
         <path d="M3.5 9.6h17M8 3.2v3.6M16 3.2v3.6"/></svg></button>`});

  /* three things: the best-supported area, the one asking patience, and
     the Moon itself. One line each; the astrology is behind Show me. */
  const rank=[...R.areas].sort((a,b)=>b.score-a.score);
  const best=rank[0], slow=rank[rank.length-1];
  const insight=(a)=>`
    <div class="thing ${a.tone}">
      <span class="thingdot ${a.tone}" aria-hidden="true"></span>
      <span class="thingtxt"><b>${a.area}</b> ${PLAIN_DAY[a.area][a.tone]}</span>
      <button class="showme sm2" data-g="${a.lead.graha}" data-area="${a.area}"
        aria-label="Show ${a.area.toLowerCase()} in the sky">
        <svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6"/></svg></button>
    </div>`;
  const moonThing=`
    <div class="thing">
      <span class="thingdot" aria-hidden="true"></span>
      <span class="thingtxt"><b>Moon</b> ${leadLine({graha:"Moon",tara:true},F)}</span>
      <button class="showme sm2" data-g="Moon" data-area="Relationships"
        aria-label="Show the Moon in the sky">
        <svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6"/></svg></button>
    </div>`;

  const tone=R.areas.filter(a=>a.tone==="favourable").length>=2?"good"
    :R.areas.some(a=>a.tone==="slow")&&!R.areas.some(a=>a.tone==="favourable")?"slow":"mixed";
  const doLine=pickBy(DAY_DO[tone==="good"?"good":tone==="slow"?"slow":"mixed"],seed,1)[0];
  const holdLine=pickBy(DAY_AVOID[tone==="good"?"good":tone==="slow"?"slow":"mixed"],seed,1)[0];
  const vp=VARA_PRACTICE[F.vara.lord], vc=VARA_COLOUR[F.vara.lord];

  const specials=specialTransits(F);
  const ing=nextIngressMap(viewDate);
  const skyRow=F.sky.map(p=>`
    <button class="skycell" data-g="${p.graha}">
      ${gIcon(p.graha,26)}
      <b>${ordinal(p.house)}</b>
      <small>${SIGNS[p.sign-1].slice(0,3)}</small>
      <i class="dotm ${p.favourable?"good":"testing"}" aria-hidden="true"></i>
      ${p.retro?`<span class="rtag">R</span>`:""}
    </button>`).join("");
  const moves=F.sky.map(p=>{
    const nx=ing[p.graha];
    const when=!nx?"" : nx.days<=1?"tomorrow" : nx.days<=14?`in ${nx.days} days`
      : nx.date.toLocaleDateString("en-GB",{day:"numeric",month:"short"})+(nx.date.getFullYear()!==viewDate.getFullYear()?" "+nx.date.getFullYear():"");
    return `<button class="ingrow" data-g="${p.graha}">
      ${gIcon(p.graha,22)}
      <span class="ingmain"><b>${p.graha}</b> in ${SIGNS[p.sign-1]}, your ${ordinal(p.house)}
        ${p.retro?`<i class="ingr">retrograde</i>`:""}</span>
      <span class="ingnext">${nx?`&#8594; ${SIGNS[nx.sign-1]} ${when}`:""}</span>
    </button>`}).join("");

  const LIMB_MEANS={
    Vara:"the weekday, each ruled by a graha",
    Tithi:"the lunar day",
    Nakshatra:"the lunar mansion the Moon sits in",
    Yoga:"a Sun&#8211;Moon angle, one of twenty-seven",
    Karana:"half a tithi",
    "Tara bala":"today&#8217;s Moon star counted from your birth star"};

  document.getElementById("pg-today").innerHTML=`
    <div class="datestrip" id="dates">${days.join("")}</div>

    <div class="reading">
      <h2>${R.head}</h2>
      <p>${R.body.split(". ")[0]}.</p>
    </div>

    <div class="things">
      ${insight(best)}
      ${slow!==best?insight(slow):""}
      ${moonThing}
    </div>

    <div class="card mtb">
      <div class="mtbrow"><span class="mtbk do">Do</span><ul><li>${doLine}</li></ul></div>
      <div class="mtbrow"><span class="mtbk hold">Hold</span><ul><li>${holdLine}</li></ul></div>
    </div>
    <details class="adv soft">
      <summary>Traditional practice for ${F.vara.name}</summary>
      <p class="interp">${vp.practice}</p>
      <div class="section" style="margin-top:8px">${practiceFor(now.maha.lord)}</div>
    </details>

    <details class="adv soft">
      <summary>The day itself &#183; panchang</summary>
      <div class="rows panch">
        ${[["Vara",`${F.vara.name} &#183; ruled by ${F.vara.lord}`],
           ["Tithi",`${F.limbs.tithi.paksha} ${F.limbs.tithi.name}`],
           ["Nakshatra",`${NAK[F.todayMoonNak]} &#183; pada ${tr.Moon.pada}`],
           ["Yoga",F.limbs.yoga.name],
           ["Karana",F.limbs.karana.name],
           ["Tara bala",F.tara.name]]
          .map(([k,v])=>`<div class="row panchrow"><span class="k">${k}
            <small>${LIMB_MEANS[k]}</small></span><span class="v">${v}</span></div>`).join("")}
        <div class="row panchrow"><span class="k">Colour of the day
          <small>${vc.why} in this tradition</small></span><span class="v">${vc.c}</span></div>
      </div>
      <div class="moonline">
        ${moonImg(viewDate,30)}
        <span><b>${tr.phase.name}</b> ${Math.round(tr.phase.illum*100)}% &#183;
          ${SIGNS[tr.moon.sign-1]} &#183; ${tr.moon.nak}</span>
      </div>
    </details>

    <details class="adv soft">
      <summary>The sky right now &#183; all nine</summary>
      <div class="skyrow" style="margin-top:4px">${skyRow}</div>
      <p class="skykey"><i class="dotm good"></i> supportive from your Moon &#183;
        <i class="dotm testing"></i> slower going. Tap any graha to see it in your chart.</p>
      ${specials.length?specials.map(x=>`
        <div class="card special"><b>${x.name}</b><p>${x.body}${x.extra?" "+x.extra:""}</p></div>`).join(""):""}
      <div class="list ings">${moves}</div>
    </details>

    <p class="note">Computed from the ephemeris for this date, in your houses,
      judged from your natal Moon. Traditional interpretation, not a prediction.</p>

    <p class="dashaline" style="margin-top:16px">The longer season: a <b>${now.maha.lord}</b>
      period runs to ${fmtDate(now.maha.end)}. Days change; this does not.</p>`;

  const strip=document.getElementById("dates");
  strip.style.scrollBehavior="auto";
  const centreStrip=()=>{
    const sel=strip.querySelector(".dchip.on");
    if(sel && stripScroll===null && strip.scrollWidth>strip.clientWidth)
      stripScroll=sel.offsetLeft-strip.clientWidth/2+sel.offsetWidth/2;
    if(stripScroll!==null && Math.abs(strip.scrollLeft-stripScroll)>2)
      strip.scrollLeft=stripScroll;
  };
  centreStrip(); requestAnimationFrame(centreStrip); setTimeout(centreStrip,120);
  strip.addEventListener("scroll",()=>{stripScroll=strip.scrollLeft},{passive:true});
  document.getElementById("calbtn").onclick=openCalendar;
  const tt=document.getElementById("totoday");
  if(tt) tt.onclick=()=>{ viewDate=new Date(); buzz(10); renderToday(); };

  document.getElementById("pg-today").onclick=e=>{
    const d=e.target.closest(".dchip");
    if(d){ const nd=new Date(); nd.setDate(nd.getDate()+ +d.dataset.off); nd.setHours(12,0,0,0);
      viewDate=nd; buzz(6); renderToday(); return; }
    const sm=e.target.closest(".showme");
    if(sm){ buzz(9); go(CHART_INDEX); setMode("today");
      openPlanet(sm.dataset.g,{sub:AREA_LINE[sm.dataset.area]}); return; }
    const c=e.target.closest(".skycell,.ingrow");
    if(c){ buzz(8); go(CHART_INDEX); setMode("today"); openPlanet(c.dataset.g); }
  };
}

const PEL={};
let uniMode="birth";                 /* "birth" | "today" */
let uniDate=new Date();
const uniPlacements=()=>{
  if(uniMode==="birth") return CHART.placements;
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
/* the exact moment a graha crossed - bisect between the previous scrub
   position and this one, so the toast can carry a time */
function crossingTime(g,d0,d1,fromSign){
  let a=d0.getTime(), b=d1.getTime();
  if(a>b){[a,b]=[b,a]}
  for(let i=0;i<22;i++){
    const m=(a+b)/2;
    if(signOf(positions(new Date(m))[g])===fromSign) a=m; else b=m;
  }
  return new Date(b);
}
function applyScrub(){
  const prevDate=lastScrubDate||uniDate;
  uniDate=dateAtOffset(dayOffset);
  paintRuler(); paintUniverse(false); updateScrubLabel();
  const day=Math.round(dayOffset);
  if(day!==lastDay){ lastDay=day; buzz(3) }
  const list=uniPlacements();
  const sig=list.map(p=>p.sign).join(",");
  if(lastSigns!==null && sig!==lastSigns){
    buzz(14);
    const prev=lastSigns.split(",");
    const changed=list.filter((p,i)=>prev[i]!==String(p.sign));
    if(changed.length){
      const p=changed[0];
      const when=crossingTime(p.graha, prevDate, uniDate, +prev[GRAHA_ORDER.indexOf(p.graha)]);
      flashEvent(p, when.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}));
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
    dragging=true; x0=e.clientX; o0=dayOffset;
    try{r.setPointerCapture(e.pointerId)}catch(_){}
    e.preventDefault();
  });
  r.addEventListener("pointermove",e=>{
    if(!dragging) return;
    dayOffset = o0 - (e.clientX-x0)/PX_PER_DAY;
    applyScrub();
  });
  /* release: a still finger is a tap on a day - go there; a drag snaps
     to the nearest whole day, because days are the unit of this scale */
  const glide=to=>{
    const from=dayOffset;
    /* Reduce Motion, or a backgrounded page where rAF is asleep: land at once */
    if(Math.abs(to-from)<.01 || document.hidden ||
       matchMedia("(prefers-reduced-motion: reduce)").matches){
      dayOffset=to; applyScrub(); return;
    }
    const t0=performance.now(), D=Math.min(420, 90+Math.abs(to-from)*26);
    const step=t=>{
      const k=Math.min(1,(t-t0)/D), e2=1-Math.pow(1-k,3);
      dayOffset=from+(to-from)*e2; applyScrub();
      if(k<1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const end=e=>{
    if(!dragging) return; dragging=false;
    const moved=Math.abs(e.clientX-x0)>6;
    /* a still finger is a tap on a day - glide there. A drag simply stops
       where the finger stops: time is continuous, no snap (DDR 0003). */
    if(!moved){
      const rect=r.getBoundingClientRect();
      glide(Math.round(o0+(e.clientX-(rect.left+rect.width/2))/PX_PER_DAY));
    }
  };
  r.addEventListener("pointerup",end);
  r.addEventListener("pointercancel",()=>{dragging=false});
  r.addEventListener("keydown",e=>{
    const step=e.shiftKey?7:1;
    if(e.key==="ArrowRight"){dayOffset+=step;applyScrub();e.preventDefault()}
    if(e.key==="ArrowLeft"){dayOffset-=step;applyScrub();e.preventDefault()}
    if(e.key==="Home"){dayOffset=0;applyScrub();e.preventDefault()}
  });
  document.getElementById("scrubnow").onclick=()=>{dayOffset=0;buzz(10);applyScrub()};
  requestAnimationFrame(()=>{ paintRuler(); updateScrubLabel(); });
}


/* The mode pill lives in the bar, not the page: it is the identity of this
   tab, it must stay reachable while a house sheet is open, and the bar is the
   one surface nothing is ever allowed to scroll over. */
function setUniverseBar(){
  setTopBar("",{centre:`
    <div class="tbseg" id="unimode" role="tablist" aria-label="Chart mode">
      <span class="thumb" aria-hidden="true"></span>
      <button class="${uniMode==="birth"?"on":""}" data-m="birth" role="tab"
        aria-selected="${uniMode==="birth"}">Birth</button>
      <button class="${uniMode==="today"?"on":""}" data-m="today" role="tab"
        aria-selected="${uniMode==="today"}">Today&#8217;s sky</button>
    </div>`});
  requestAnimationFrame(()=>placeThumb(true)); setTimeout(()=>placeThumb(true),80);
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

  chart.onclick=e=>{const t=e.target.closest(".hs"); if(t)openHouse(+t.dataset.h)};
  chart.onkeydown=e=>{const t=e.target.closest(".hs");
    if(t&&(e.key==="Enter"||e.key===" ")){e.preventDefault();openHouse(+t.dataset.h)}};
  plane.onclick=e=>{const b=e.target.closest(".p"); if(b){e.stopPropagation();openPlanet(b.dataset.g)}};
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
  document.getElementById("unihint").innerHTML = uniMode==="birth"
    ? `The sky at your birth &#8212; 26 March 1992, 10:00.`
    : `Where the grahas are on the selected date, in your houses. Faint markers are birth positions.`;
  document.getElementById("scrubwrap").classList.toggle("on", uniMode==="today");
  if(instant) requestAnimationFrame(()=>stage.classList.remove("instant"));
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
function resetChart(){
  mode=null;current=null;clearMarks();
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
  hideSheetKeepFocus();
  sheetHouse(h);
  showSheetPeek();
}

function openPlanet(g,opts={}){
  if(mode==="planet"&&current===g && !opts.sub)return;
  const list=uniPlacements();                  /* the placements ON SCREEN */
  const p=list.find(x=>x.graha===g)||CHART.get(g);
  mode="planet";current=g;clearMarks();hideSheetKeepFocus();buzz(12);
  document.getElementById("stage").classList.add("pmode");
  const b=PEL[g],[px,py]=b._pos,T=[.5,.26];
  b.classList.add("focus"); b.style.zIndex=40;
  const st=document.getElementById("stage").getBoundingClientRect();
  b.style.transform=`translate(${((T[0]-px)*st.width).toFixed(1)}px, ${((T[1]-py)*st.height).toFixed(1)}px) scale(2.3)`;
  list.forEach(o=>{if(o.graha!==g)PEL[o.graha].classList.add("recede")});
  qa(".hs").forEach(e=>e.classList.add(+e.dataset.h===p.house?"lit":"dim"));
  qa(".sn").forEach(e=>{if(+e.dataset.h!==p.house)e.classList.add("dim")});
  drawAspects(CHART.get(g)||p);
  sheetPlanet(p,opts);
  showSheetPeek();
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
  document.getElementById("sheetbody").innerHTML=`
    ${peekBlock(`${ordinal(h)} house &#183; ${SIGNS[sg-1]}`, head)}
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
    <button class="askastra" data-q="What should I know about my ${ordinal(h)} house?">
      <span class="orbdot" aria-hidden="true"></span>
      Ask Astra about your ${ordinal(h)} house</button>
    <p class="note">Traditional readings for this configuration. Not a prediction.</p>`;
}

function sheetPlanet(p,opts){
  const g=p.graha, natal=CHART.get(g);
  const ruled=CHART.housesRuled(g), conj=CHART.conjunct(g);
  const now=CHART.dasha.at(new Date());
  const transiting = uniMode==="today";
  document.getElementById("sheetbody").innerHTML=`
    ${peekBlock(`${g} &#183; ${ordinal(p.house)} house`,
                (opts&&opts.sub) || cap(GRAHA_MEANING[g].is))}
    <div class="sheethead">
      <img class="sheetart" src="assets/graha/${g.toLowerCase()}.png" alt="" draggable="false">
      <div><div class="eyebrow" style="margin-bottom:3px">${SK[g]}${shadow(g)?" &#183; chhaya graha":""}</div>
        <h1 style="font-size:26px;margin:0">${g} in your ${ordinal(p.house)}</h1></div>
    </div>
    ${transiting?`<p class="lordline">Right now &#8212; passing through <b>${SIGNS[p.sign-1]}</b>,
       your <b>${ordinal(p.house)}</b>. At your birth: ${SIGNS[natal.sign-1]}, your ${ordinal(natal.house)}.</p>`:""}

    <div class="eyebrow" style="margin:16px 0 7px">What it means</div>
    <p class="interp">${GRAHA_MEANING[g].body}</p>

    <div class="eyebrow" style="margin:20px 0 7px">In your chart</div>
    <p class="interp">${PLANET_STORY[g].inHouse[natal.house]}</p>
    <p class="interp">${ruled.length
        ? `It rules your <b>${ruled.map(ordinal).join(" and ")}</b>, so ${ruled.map(h=>HOUSE_ADVICE[h][0]).join(" and ")} answer to it.`
        : `It owns no sign, so it is read through the house it occupies and the grahas it sits with.`}
      ${natal.dig?` It is <b>${natal.dig.toLowerCase()}</b> here.`:""}${natal.retro&&!shadow(g)?" It was <b>retrograde</b> at your birth &#8212; its themes turn inward, or come back for a second pass.":""}</p>
    ${conj.length?`<p class="interp">It shares the sign with <b>${conj.join(" and ")}</b>; their significations blend.</p>`:""}
    ${now.maha.lord===g?`<p class="interp brass">You are living its mahadasha right now &#8212; this graha governs the present period.</p>`
      :now.antar.lord===g?`<p class="interp brass">It rules the current antardasha &#8212; the sub-period inside your ${now.maha.lord} years.</p>`:""}

    ${shadow(g)?"":`<button class="findsky" data-g="${g}">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/>
        <path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3"/></svg>
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
    <p class="note">Traditional readings for this placement. Not a prediction.</p>`;
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
document.addEventListener("keydown",e=>{if(e.key==="Escape")resetChart()});
sheet.addEventListener("click",e=>{
  const a=e.target.closest(".askastra");
  if(a){ buzz(9); askAstra(a.dataset.q); }
  const f=e.target.closest(".findsky");
  if(f){ buzz(8); openSkyPanel(f.dataset.g); }
  e.stopPropagation();
});

/* ---- Find in sky: sensors point you at the graha (DDR 0003 §5) ---- */
let skyWatch=null;
function getSpot(){                       /* quick fix, honest fallback */
  return new Promise(res=>{
    let done=false;
    const fallback=()=>{ if(!done){done=true;
      res({lat:BIRTHPLACE.lat, lon:BIRTHPLACE.lon, from:BIRTHPLACE.name+" (approximate)"});}};
    if(!navigator.geolocation) return fallback();
    const t=setTimeout(fallback,3500);
    navigator.geolocation.getCurrentPosition(
      p=>{ if(!done){done=true; clearTimeout(t);
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
    </div>`;
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
          : astraCard(typeof m.t==="function"?m.t():m.t, m.chips)).join("")}
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
      chat.insertAdjacentHTML("beforeend", astraCard(item.a(), item.chips));
      wireChips(chat.lastElementChild);
      chat.lastElementChild.scrollIntoView({behavior:"smooth",block:"nearest"});
      setTimeout(item.act,900);
    },420);
  };
  wireChips(document.getElementById("chat"));
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
  {id:"learn", label:"Learn astrology", icon:ICONS.learn, sub:()=>LEARN_LEVELS.reduce((a,l)=>a+l.topics.length,0)+" topics, three levels"},
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
    glossary: glossSearching
      ? `<div class="barsearch">
           <span class="gsico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round">
             <circle cx="11" cy="11" r="6.5"/><path d="M16.5 16.5l4 4"/></svg></span>
           <input id="gq" type="search" value="${glossQ.replace(/"/g,"&quot;")}"
             placeholder="Search the glossary" aria-label="Search the glossary">
         </div>
         <button class="tb-btn txt" id="gcancel">Cancel</button>`
      : `<button class="tb-btn" id="gsbtn" aria-label="Search the glossary">
           <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/>
             <path d="M16.5 16.5l4 4"/></svg></button>`,
  };
  const TITLES={birth:"Birth details",rel:"Relationships",events:"Life events",
    glossary:"Glossary",settings:"Settings",report:"Detailed report",people:"Charts",
    learn:"Learn astrology",learntopic:(LEARN_LEVELS.flatMap(l=>l.topics).find(x=>x.id===learnTopic)||{}).title||"Learn",
    personchart:(partners()[subArg]||{}).name||"Chart",addpartner:subArg!=null?"Edit person":"Add a person",
    addevent:subArg!=null?"Edit event":"Add a life event",
    partner:(partners()[subArg]||{}).name||"Person"};
  const searching=subView==="glossary"&&glossSearching;
  setTopBar(searching?"":TITLES[subView]||"",{back:!searching,actions:ACTIONS[subView]||""});
  document.getElementById("topbar").classList.toggle("searching",searching);
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
  if(subView!=="glossary"){ glossSearching=false;
    document.getElementById("topbar").classList.remove("searching"); }
  if(subView!=="glossary") document.body.classList.remove("gstuck","gtyping");
  if(subView==="glossary") wireGlossary();
  if(subView==="learn"||subView==="learntopic") wireLearn();
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
    ${[0,4,7,11,15,19,22,26].map(k=>`<img src="assets/moon/phase_${String(k).padStart(2,"0")}.png"
      width="30" height="30" alt="">`).join("")}
    </div><figcaption>One lunar month: new to full and back. The tithi &#8212; the
      Vedic lunar day &#8212; is a thirtieth of this lap.</figcaption></figure>`,
};

let learnTopic=null;
function subLearn(){
  return `
    <p class="muted" style="font-size:13.5px;margin:0 0 18px">
      Concept by concept, using your own chart as the classroom.</p>
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
  else if(i===CHART_INDEX) setUniverseBar();
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

document.body.insertAdjacentHTML("afterbegin",MOON_DEFS);
renderUniverse(); renderGuide(); renderYou(); renderTimelineTab(); renderToday();
