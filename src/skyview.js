/* ===================================================================
   SKY — Astra's living sky (motion-aligned, no camera).
   -------------------------------------------------------------------
   Rebuilt 2 Sep 2026 to the "Major redesign of Astra Sky" spec. The
   organising object is the CELESTIAL RIBBON: the sidereal ecliptic as a
   warm band carrying twelve rashi regions and twenty-seven nakshatra
   sectors, with the grahas hovering against it. Stars are atmosphere.
   Three visual levels, always: the thing (graha) · where it is (rashi,
   nakshatra) · what it means to me (natal house, one sentence).

   Source of truth: ephemeris.js positions() (sidereal, Lahiri) and
   sky.js alt/az - the same engine as the chart. Nothing here places a
   sign, nakshatra or planet by itself.

   Camera: a true perspective (gnomonic) projection about the view
   direction, so the field of view is the single zoom parameter and
   the zenith is not a singularity. Device motion steers the camera
   until a finger drags; Recenter hands it back.

   State: SkyMoment - birth | now | custom - each with its own
   timestamp and place. Birth never inherits device time or place.
   =================================================================== */
import { positions, retrograde } from "./ephemeris.js?v=20260831a";
import { raDecToAltAz, siderealPointAltAz, sunTimes } from "./sky.js?v=20260831a";
import { ASTERISMS } from "./asterisms.js?v=20260831";
import { GRAHA_MEANING, PLANET_STORY, HOUSE_TRANSIT_SENSE } from "./interpret.js";
import { NAK_META, nakLord, pointGrid, nakshatraRange, signNakshatras, fmtDMS } from "./zodiac.js?v=20260902";

const SIGNS_SK=["Mesha","Vrishabha","Mithuna","Karka","Simha","Kanya",
  "Tula","Vrishchika","Dhanu","Makara","Kumbha","Meena"];
const SIGNS_EN=["Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const SIGNS_DEV=["मेष","वृषभ","मिथुन","कर्क","सिंह","कन्या","तुला","वृश्चिक","धनु","मकर","कुम्भ","मीन"];
const GRAHAS=["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"];
const GRAHA_SK={Sun:"Surya",Moon:"Chandra",Mars:"Mangal",Mercury:"Budh",
  Jupiter:"Guru",Venus:"Shukra",Saturn:"Shani",Rahu:"Rahu",Ketu:"Ketu"};
const NAKS=NAK_META.map(m=>m.n);
const NSPAN=360/27;

/* One yogatara per nakshatra (J2000). Drawn as atmosphere; named only
   when the "Star names" layer is on. */
const STARS=[
  {name:"Sheratan",   ra:28.66,  dec:20.81,  m:2.6},{name:"41 Arietis", ra:42.50,  dec:27.26,  m:3.6},
  {name:"Alcyone",    ra:56.87,  dec:24.11,  m:2.9},{name:"Aldebaran",  ra:68.98,  dec:16.51,  m:0.9},
  {name:"Meissa",     ra:83.78,  dec:9.93,   m:3.5},{name:"Betelgeuse", ra:88.79,  dec:7.41,   m:0.5},
  {name:"Pollux",     ra:116.33, dec:28.03,  m:1.1},{name:"Asellus Australis",ra:131.17,dec:18.15,m:3.9},
  {name:"Epsilon Hydrae",ra:131.69,dec:6.42, m:3.4},{name:"Regulus",    ra:152.09, dec:11.97,  m:1.4},
  {name:"Zosma",      ra:168.53, dec:20.52,  m:2.6},{name:"Denebola",   ra:177.26, dec:14.57,  m:2.1},
  {name:"Algorab",    ra:187.47, dec:-16.52, m:2.9},{name:"Spica",      ra:201.30, dec:-11.16, m:1.0},
  {name:"Arcturus",   ra:213.92, dec:19.18,  m:0.0},{name:"Zubenelgenubi",ra:222.72,dec:-16.04,m:2.8},
  {name:"Dschubba",   ra:240.08, dec:-22.62, m:2.3},{name:"Antares",    ra:247.35, dec:-26.43, m:1.0},
  {name:"Shaula",     ra:263.40, dec:-37.10, m:1.6},{name:"Kaus Media", ra:275.25, dec:-29.83, m:2.7},
  {name:"Nunki",      ra:283.82, dec:-26.30, m:2.0},{name:"Altair",     ra:297.70, dec:8.87,   m:0.8},
  {name:"Rotanev",    ra:305.66, dec:14.60,  m:3.6},{name:"Lambda Aquarii",ra:343.15,dec:-7.58,m:3.7},
  {name:"Markab",     ra:346.19, dec:15.21,  m:2.5},{name:"Algenib",    ra:3.31,   dec:15.18,  m:2.8},
  {name:"Zeta Piscium",ra:18.43, dec:7.58,   m:5.2},
];
const AMBIENT=(()=>{ let s=971;
  const rnd=()=>((s=(s*1664525+1013904223)|0)>>>0)/2**32;
  return Array.from({length:190},()=>({
    ra:rnd()*360, dec:Math.asin(rnd()*1.9-0.95)*180/Math.PI, m:3.4+rnd()*2.4}));
})();
const GLOW={Sun:"255,196,110",Moon:"214,226,255",Mars:"255,128,96",
  Mercury:"150,224,170",Jupiter:"255,214,150",Venus:"242,242,255",
  Saturn:"232,204,146",Rahu:"156,146,208",Ketu:"156,146,208"};
const IMG={};
for(const g of GRAHAS){ IMG[g]=new Image(); IMG[g].src=`assets/graha/${g.toLowerCase()}.png`; }
const RASHI_ART={};
/* the rashi art layer is optional until the assets land: probe one file
   and only fetch the rest if it exists (no twelve 404s per open) */
{ const probe=new Image();
  probe.onload=()=>{ RASHI_ART[1]=probe;
    for(let i=2;i<=12;i++){ RASHI_ART[i]=new Image(); RASHI_ART[i].src=`assets/rashi/${i}.svg`; } };
  probe.src="assets/rashi/1.svg"; }

/* ---- timezone-true local time (kept; validated 31 Aug) ---- */
export function offsetAtTz(tz, utcMs){
  const f=new Intl.DateTimeFormat("en-US",{timeZone:tz,hour12:false,
    year:"numeric",month:"numeric",day:"numeric",
    hour:"numeric",minute:"numeric",second:"numeric"});
  const m={}; for(const p of f.formatToParts(new Date(utcMs))) m[p.type]=p.value;
  return Date.UTC(m.year,m.month-1,m.day,m.hour%24,m.minute,m.second)
       - Math.floor(utcMs/1000)*1000;
}
export function utcFromLocalTz(y,mo,da,hh,mi,tz){
  const wall=Date.UTC(y,mo-1,da,hh,mi);
  let guess=wall;
  for(let i=0;i<3;i++) guess=wall-offsetAtTz(tz,guess);
  return new Date(guess);
}
const fmtLocal=(d,tz,opts)=>{ const loc=opts.hour?"en-US":"en-GB";
  try{ return d.toLocaleString(loc,{...opts,timeZone:tz||undefined}).replace("Sept","Sep"); }catch(_){ return d.toLocaleString(loc,opts); } };
const tzAbbr=(d,tz)=>{ try{ const p=new Intl.DateTimeFormat("en-IN",{timeZone:tz,timeZoneName:"short"}).formatToParts(d);
  const v=(p.find(x=>x.type==="timeZoneName")||{}).value||""; return v.startsWith("GMT")&&tz==="Asia/Kolkata"?"IST":v; }catch(_){ return ""; } };

/* OFFLINE FALLBACK places (standard offsets; IANA zone when known) */
const CITIES=[
["Kopargaon",19.88,74.48,5.5],["Mumbai",19.08,72.88,5.5],["Pune",18.52,73.86,5.5],
["Delhi",28.61,77.21,5.5],["Bengaluru",12.97,77.59,5.5],["Hyderabad",17.39,78.49,5.5],
["Chennai",13.08,80.27,5.5],["Kolkata",22.57,88.36,5.5],["Ahmedabad",23.02,72.57,5.5],
["Jaipur",26.91,75.79,5.5],["Kota",25.18,75.84,5.5],["Nashik",20.00,73.79,5.5],
["Nagpur",21.15,79.09,5.5],["Surat",21.17,72.83,5.5],["Lucknow",26.85,80.95,5.5],
["Varanasi",25.32,82.99,5.5],["Indore",22.72,75.86,5.5],["Bhopal",23.26,77.41,5.5],
["Panaji, Goa",15.49,73.83,5.5],["Kochi",9.93,76.27,5.5],["Thiruvananthapuram",8.52,76.94,5.5],
["Chandigarh",30.73,76.78,5.5],["Amritsar",31.63,74.87,5.5],["Patna",25.59,85.14,5.5],
["Guwahati",26.14,91.74,5.5],["Bhubaneswar",20.30,85.82,5.5],["Coimbatore",11.02,76.96,5.5],
["Visakhapatnam",17.69,83.22,5.5],["Rishikesh",30.09,78.27,5.5],["Ujjain",23.18,75.78,5.5],
["New York",40.71,-74.01,-5],["Los Angeles",34.05,-118.24,-8],["Chicago",41.88,-87.63,-6],
["San Francisco",37.77,-122.42,-8],["Seattle",47.61,-122.33,-8],["Austin",30.27,-97.74,-6],
["Houston",29.76,-95.37,-6],["Miami",25.76,-80.19,-5],["Boston",42.36,-71.06,-5],
["Denver",39.74,-104.99,-7],["Phoenix",33.45,-112.07,-7],["Atlanta",33.75,-84.39,-5],
["Dallas",32.78,-96.80,-6],["San Diego",32.72,-117.16,-8],["Washington DC",38.91,-77.04,-5],
["London",51.51,-0.13,0],["Paris",48.86,2.35,1],["Berlin",52.52,13.40,1],
["Amsterdam",52.37,4.90,1],["Zurich",47.38,8.54,1],["Rome",41.90,12.50,1],
["Madrid",40.42,-3.70,1],["Lisbon",38.72,-9.14,0],["Dubai",25.20,55.27,4],
["Abu Dhabi",24.45,54.38,4],["Doha",25.29,51.53,3],["Riyadh",24.71,46.68,3],
["Singapore",1.35,103.82,8],["Hong Kong",22.32,114.17,8],["Tokyo",35.68,139.69,9],
["Seoul",37.57,126.98,9],["Shanghai",31.23,121.47,8],["Beijing",39.90,116.41,8],
["Bangkok",13.76,100.50,7],["Kathmandu",27.72,85.32,5.75],["Colombo",6.93,79.85,5.5],
["Dhaka",23.81,90.41,6],["Karachi",24.86,67.01,5],["Lahore",31.55,74.34,5],
["Sydney",-33.87,151.21,10],["Melbourne",-37.81,144.96,10],["Auckland",-36.85,174.76,12],
["Toronto",43.65,-79.38,-5],["Vancouver",49.28,-123.12,-8],["Mexico City",19.43,-99.13,-6],
["São Paulo",-23.55,-46.63,-3],["Johannesburg",-26.20,28.05,2],["Nairobi",-1.29,36.82,3],
["Cairo",30.04,31.24,2],["Istanbul",41.01,28.98,3],["Moscow",55.76,37.62,3],
["Mauritius",-20.16,57.50,4],["Denpasar, Bali",-8.65,115.22,8],["Kuala Lumpur",3.14,101.69,8]];
const CITY_TZ={"New York":"America/New_York","Boston":"America/New_York",
  "Miami":"America/New_York","Atlanta":"America/New_York","Washington DC":"America/New_York",
  "Toronto":"America/Toronto","Chicago":"America/Chicago","Austin":"America/Chicago",
  "Houston":"America/Chicago","Dallas":"America/Chicago","Mexico City":"America/Mexico_City",
  "Denver":"America/Denver","Phoenix":"America/Phoenix",
  "Los Angeles":"America/Los_Angeles","San Francisco":"America/Los_Angeles",
  "Seattle":"America/Los_Angeles","San Diego":"America/Los_Angeles","Vancouver":"America/Vancouver",
  "London":"Europe/London","Paris":"Europe/Paris","Berlin":"Europe/Berlin",
  "Amsterdam":"Europe/Amsterdam","Zurich":"Europe/Zurich","Rome":"Europe/Rome",
  "Madrid":"Europe/Madrid","Lisbon":"Europe/Lisbon","Istanbul":"Europe/Istanbul",
  "Moscow":"Europe/Moscow","Dubai":"Asia/Dubai","Abu Dhabi":"Asia/Dubai",
  "Doha":"Asia/Qatar","Riyadh":"Asia/Riyadh","Singapore":"Asia/Singapore",
  "Hong Kong":"Asia/Hong_Kong","Tokyo":"Asia/Tokyo","Seoul":"Asia/Seoul",
  "Shanghai":"Asia/Shanghai","Beijing":"Asia/Shanghai","Bangkok":"Asia/Bangkok",
  "Kathmandu":"Asia/Kathmandu","Colombo":"Asia/Colombo","Dhaka":"Asia/Dhaka",
  "Karachi":"Asia/Karachi","Lahore":"Asia/Karachi","Sydney":"Australia/Sydney",
  "Melbourne":"Australia/Melbourne","Auckland":"Pacific/Auckland",
  "São Paulo":"America/Sao_Paulo","Johannesburg":"Africa/Johannesburg",
  "Nairobi":"Africa/Nairobi","Cairo":"Africa/Cairo","Mauritius":"Indian/Mauritius",
  "Denpasar, Bali":"Asia/Makassar","Kuala Lumpur":"Asia/Kuala_Lumpur"};
const cityHit=c=>({label:c[0],n:c[0],lat:c[1],lon:c[2],off:c[3],
  tz:CITY_TZ[c[0]]||(c[3]===5.5?"Asia/Kolkata":null)});
/* a name for coordinates, from the offline list when close enough */
function nearestCity(lat,lon){
  let best=null,bd=1e9;
  for(const c of CITIES){ const d=Math.hypot((c[1]-lat),(c[2]-lon)*Math.cos(lat*Math.PI/180));
    if(d<bd){bd=d;best=c;} }
  return bd<0.6?best[0]:null;      /* ~65 km */
}

/* ====================================================================
   STATE
   ==================================================================== */
let el=null, ctx=null, running=false, watch=null, reduced=false;
let viewAz=180, viewAlt=25, wantAz=180, wantAlt=25, sensing=false, followSky=true;
let vFov=62;                            /* vertical field of view, degrees */
const FOV_MIN=22, FOV_MAX=96;
let spot={lat:19.8824, lon:74.4761, from:"Kopargaon (approximate)", tz:"Asia/Kolkata"};
let cache=null, cacheAt=0, target=null, focusK=0;
let mode="now", birthOpts=null, proUser=false, custom=null;
let seek=null;        /* Now/custom mode: a scrubbed absolute Date, or null = live */
let birthSeek=null;   /* Birth mode: a scrubbed absolute Date, or null = natal */
let ghostBirth=false, trackTarget=false;
let lastFrame=0, layers=null, uiTimer=null, hintStep=0;
let tween=null;       /* {from:{g:L}, t0, ms} for the Birth->Now fast-forward */
const LAYER_DEFAULT={planets:true,rashis:true,naks:true,art:true,horizon:true,stars:true,starNames:false,natal:false};
function loadLayers(){ try{ layers={...LAYER_DEFAULT,...JSON.parse(localStorage.getItem("astro.sky.layers")||"{}")}; }catch(_){ layers={...LAYER_DEFAULT}; } }
function saveLayers(){ try{ localStorage.setItem("astro.sky.layers",JSON.stringify(layers)); }catch(_){} }

const skyDate=()=>mode==="birth"?(birthSeek||new Date(birthOpts.date))
  :custom?new Date(custom.iso):(seek||new Date());
const skySpot=()=>mode==="birth"?{lat:birthOpts.lat,lon:birthOpts.lon}:custom?custom:spot;
const skyTz=()=>mode==="birth"?(birthOpts.tz||"Asia/Kolkata"):custom?(custom.tz||null):(spot.tz||Intl.DateTimeFormat().resolvedOptions().timeZone);
const cacheKey=()=>mode+"|"+(mode==="birth"?(birthSeek?birthSeek.getTime():"b"):custom?custom.iso+custom.lat:seek?seek.getTime():"live");
const wrap=a=>((a+180)%360+360)%360-180;
const clampAlt=a=>Math.max(-60,Math.min(85,a));
const buzz=n=>{ try{ navigator.vibrate&&navigator.vibrate(n); }catch(_){} };
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

/* ====================================================================
   SKY MODEL — one compute per moment, cached
   ==================================================================== */
function computeSky(){
  const d=skyDate(), sp=skySpot();
  const pos=positions(d), ret=retrograde(d);
  if(tween){ const k=Math.min(1,(performance.now()-tween.t0)/tween.ms);
    const e=1-Math.pow(1-k,3);
    for(const g of GRAHAS){ const a=tween.from[g], b=pos[g];
      let dl=((b-a)%360+360)%360; if(dl>180) dl-=360;
      pos[g]=((a+dl*e)%360+360)%360; }
    if(k>=1) tween=null; }
  const sunT=(mode==="birth"||custom||seek)?null:null;
  cache={
    mode, key:cacheKey(), d, sp,
    grahas:GRAHAS.map(g=>({g, retro:ret[g], L:pos[g], ...siderealPointAltAz(pos[g], d, sp.lat, sp.lon)})),
    stars:STARS.map((s,i)=>({...s, nak:NAKS[i], ...raDecToAltAz(s.ra, s.dec, d, sp.lat, sp.lon)})),
    asts:ASTERISMS.map(A=>({lines:A.lines,
      pts:A.stars.map(s=>({m:s.m, ...raDecToAltAz(s.ra, s.dec, d, sp.lat, sp.lon)}))})),
    amb:AMBIENT.map(s=>({m:s.m, ...raDecToAltAz(s.ra, s.dec, d, sp.lat, sp.lon)})),
    ecl:Array.from({length:181},(_,i)=>{ const L=i*2; return {L, ...siderealPointAltAz(L, d, sp.lat, sp.lon)}; }),
    rashiMid:Array.from({length:12},(_,i)=>siderealPointAltAz(i*30+15, d, sp.lat, sp.lon)),
    nakMid:Array.from({length:27},(_,i)=>siderealPointAltAz(i*NSPAN+NSPAN/2, d, sp.lat, sp.lon)),
    nakEdge:Array.from({length:27},(_,i)=>siderealPointAltAz(i*NSPAN, d, sp.lat, sp.lon)),
    asc:(mode==="birth"&&birthOpts&&birthOpts.asc!=null)?siderealPointAltAz(birthOpts.asc, d, sp.lat, sp.lon):null,
    ghost:(mode!=="birth"&&ghostBirth&&target&&target.t==="graha"&&birthOpts&&birthOpts.natal&&birthOpts.natal[target.g]!=null)
      ?siderealPointAltAz(birthOpts.natal[target.g], d, sp.lat, sp.lon):null,
  };
  cache.sunAlt=cache.grahas[0].alt;
  cacheAt=Date.now();
  if(tween) cache.key="tween"+performance.now();
}

/* ====================================================================
   CAMERA — perspective projection about the view direction
   ==================================================================== */
const D2R=Math.PI/180;
let CAM={W:0,H:0,F:1,r:[1,0,0],u:[0,0,1],f:[0,1,0]};
function updateCamera(W,H){
  const A=viewAlt*D2R, Z=viewAz*D2R;
  CAM.W=W; CAM.H=H; CAM.F=(H/2)/Math.tan(vFov*D2R/2);
  CAM.f=[Math.cos(A)*Math.sin(Z), Math.cos(A)*Math.cos(Z), Math.sin(A)];
  CAM.r=[Math.cos(Z), -Math.sin(Z), 0];
  CAM.u=[-Math.sin(A)*Math.sin(Z), -Math.sin(A)*Math.cos(Z), Math.cos(A)];
}
/* returns [x, y, depth] with depth<=0 meaning behind the camera */
function project(p){
  const a=p.alt*D2R, z=p.az*D2R;
  const v=[Math.cos(a)*Math.sin(z), Math.cos(a)*Math.cos(z), Math.sin(a)];
  const X=v[0]*CAM.r[0]+v[1]*CAM.r[1]+v[2]*CAM.r[2];
  const Y=v[0]*CAM.u[0]+v[1]*CAM.u[1]+v[2]*CAM.u[2];
  const Zc=v[0]*CAM.f[0]+v[1]*CAM.f[1]+v[2]*CAM.f[2];
  if(Zc<=0.04) return [NaN,NaN,Zc];
  return [CAM.W/2+CAM.F*X/Zc, CAM.H/2-CAM.F*Y/Zc, Zc];
}
const ppdCenter=()=>CAM.F*D2R;          /* px per degree at the centre */
const onScreen=(x,y,m=0)=>Number.isFinite(x)&&x>-m&&x<CAM.W+m&&y>-m&&y<CAM.H+m;

/* ====================================================================
   DRAWING PRIMITIVES
   ==================================================================== */
function glowDot(c,x,y,r,rgb,a){
  const g=c.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,`rgba(${rgb},${a})`); g.addColorStop(1,`rgba(${rgb},0)`);
  c.fillStyle=g; c.beginPath(); c.arc(x,y,r,0,7); c.fill();
}
function starSprite(c,x,y,m,a){
  const r=m<=0.2?3.2:m<=1.2?2.7:m<=2.4?2.1:m<=3.2?1.7:1.3;
  glowDot(c,x,y,r*5,"228,234,255",.28*a);
  c.fillStyle=`rgba(240,244,255,${.92*a})`;
  c.beginPath(); c.arc(x,y,r,0,7); c.fill();
}
function haloText(c,txt,x,y,fill,font,align="center"){
  c.font=font; c.textAlign=align; c.textBaseline="middle";
  c.lineWidth=3; c.strokeStyle="rgba(6,7,20,.75)"; c.lineJoin="round";
  c.strokeText(txt,x,y); c.fillStyle=fill; c.fillText(txt,x,y);
}
/* the Moon with its real phase: bright limb toward the Sun's screen direction */
function moonDisc(c,x,y,R,sunXY,k,waxing){
  const im=IMG.Moon;
  c.save(); c.beginPath(); c.arc(x,y,R,0,7); c.clip();
  c.globalAlpha=0.22; if(im.complete) c.drawImage(im,x-R,y-R,2*R,2*R);
  c.globalAlpha=1;
  const ang=Math.atan2(sunXY[1]-y, sunXY[0]-x);
  c.translate(x,y); c.rotate(ang);
  const rx=R*Math.abs(2*k-1);
  c.beginPath();
  c.moveTo(0,-R); c.arc(0,0,R,-Math.PI/2,Math.PI/2,false);
  c.ellipse(0,0,Math.max(rx,0.01),R,0,Math.PI/2,3*Math.PI/2,k<0.5);
  c.closePath(); c.clip();
  c.rotate(-ang); c.translate(-x,-y);
  if(im.complete) c.drawImage(im,x-R,y-R,2*R,2*R);
  c.restore();
}
/* Rahu/Ketu: a node, not a lamp — a quiet ring with a stroke, no glow */
function nodeGlyph(c,x,y,R,a,ketu){
  c.save(); c.globalAlpha=a;
  c.strokeStyle="rgba(190,180,236,.9)"; c.lineWidth=1.4; c.setLineDash([3,3]);
  c.beginPath(); c.arc(x,y,R*0.78,0,7); c.stroke(); c.setLineDash([]);
  c.fillStyle="rgba(190,180,236,.95)"; c.beginPath(); c.arc(x,y,2.2,0,7); c.fill();
  c.beginPath(); c.moveTo(x,y-R*0.78); c.lineTo(x,y-R*1.15); c.moveTo(x,y+R*0.78); c.lineTo(x,y+R*1.15);
  if(ketu){ c.moveTo(x-R*0.78,y); c.lineTo(x-R*1.15,y); c.moveTo(x+R*0.78,y); c.lineTo(x+R*1.15,y); }
  c.stroke(); c.restore();
}

/* ====================================================================
   LABEL ENGINE — priority-ordered, collision-aware, screen-horizontal
   ==================================================================== */
const PAD={top:200,bottom:60};
function makeLedger(){
  PAD.top=200; PAD.bottom=target?(el?.root.classList.contains("hascard")?330:60):60;
  const boxes=[];
  const collide=(b,x,y,w,h)=>Math.abs(b.x-x)<(b.w+w)/2+6 && Math.abs(b.y-y)<(b.h+h)/2+3;
  return {
    claim(x,y,w,h){ boxes.push({x,y,w,h}); },
    /* try anchors in order; return the first free spot or null (drop) */
    place(x,y,w,h,anchors){
      for(const [dx,dy] of anchors){
        const px=x+dx, py=y+dy;
        if(px-w/2<4||px+w/2>CAM.W-4||py<PAD.top||py>CAM.H-PAD.bottom) continue;
        if(!boxes.some(b=>collide(b,px,py,w,h))){ boxes.push({x:px,y:py,w,h}); return [px,py]; }
      }
      return null;
    }
  };
}

/* ====================================================================
   THE FRAME
   ==================================================================== */
function targetPos(){
  if(!target||!cache) return null;
  if(target.t==="graha") return cache.grahas.find(x=>x.g===target.g);
  if(target.t==="rashi") return cache.rashiMid[target.i];
  if(target.t==="nakshatra") return cache.nakMid[target.i];
  if(target.t==="asc") return cache.asc;
  return null;
}
const sgOf=L=>Math.floor((((L%360)+360)%360)/30);
const nkOf=L=>Math.floor((((L%360)+360)%360)/NSPAN);

function draw(){
  if(!running) return;
  const now=performance.now();
  const dt=Math.min(60,now-(lastFrame||now)); lastFrame=now;
  const W=el.canvas.width/devicePixelRatio, H=el.canvas.height/devicePixelRatio;
  const k=reduced?1:1-Math.exp(-dt/110);
  viewAz+=wrap(wantAz-viewAz)*k; viewAlt+=(wantAlt-viewAlt)*k;
  focusK+=((target?1:0)-focusK)*(reduced?1:1-Math.exp(-dt/160));
  if(!cache||cache.key!==cacheKey()||tween||(mode==="now"&&!custom&&!seek&&Date.now()-cacheAt>2000)) computeSky();
  updateCamera(W,H);
  const c=ctx, ppd=ppdCenter();
  const focusSign=target&&target.t==="graha"?sgOf(cache.grahas.find(x=>x.g===target.g).L)
    :target&&target.t==="rashi"?target.i:null;
  const focusNak=target&&target.t==="graha"?nkOf(cache.grahas.find(x=>x.g===target.g).L)
    :target&&target.t==="nakshatra"?target.i:null;
  const dim=1-0.5*focusK;                 /* everything unrelated steps back */

  /* --- sky: darkest at the zenith; daylight washes in when the Sun is up --- */
  const day=Math.max(0,Math.min(1,(cache.sunAlt+6)/12));
  const B=mode==="birth";
  const top=B?[10,5,24]:[4,5,14], mid=B?[36,22,64]:[23,27,56], bot=B?[12,7,32]:[8,9,26];
  const mixc=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t));
  const dayTop=[54,86,150], dayMid=[120,150,205], dayBot=[176,196,228];
  const t0=mixc(top,dayTop,day), t1=mixc(mid,dayMid,day), t2=mixc(bot,dayBot,day);
  const hp=project({alt:0,az:viewAz}); const hy=Number.isFinite(hp[1])?hp[1]:(viewAlt>0?H*1.2:-H*0.2);
  const sg=c.createLinearGradient(0,0,0,H);
  const hstop=Math.max(0.02,Math.min(0.98,hy/H));
  sg.addColorStop(0,`rgb(${t0.join(",")})`); sg.addColorStop(hstop,`rgb(${t1.join(",")})`);
  sg.addColorStop(Math.min(1,hstop+0.015),`rgb(${t2.join(",")})`); sg.addColorStop(1,`rgb(${mixc(bot,[12,12,22],0).join(",")})`);
  c.fillStyle=sg; c.fillRect(0,0,W,H);

  /* --- horizon: a cool material line with ground beneath it --- */
  if(layers.horizon){
    const horizon=[]; for(let az=0;az<=360;az+=3){ const p=project({alt:0,az}); if(Number.isFinite(p[0])) horizon.push(p); }
    /* ground fill: everything below the horizon curve */
    c.save(); c.beginPath(); let pen=false;
    for(const p of horizon){ if(!pen){c.moveTo(p[0],p[1]);pen=true;} else c.lineTo(p[0],p[1]); }
    if(pen){ c.lineTo(W+400,H+400); c.lineTo(-400,H+400); c.closePath();
      c.fillStyle=`rgba(6,8,22,${0.55})`; c.fill(); }
    c.restore();
    c.strokeStyle="rgba(150,170,235,.55)"; c.lineWidth=1.5; c.beginPath(); pen=false;
    let last=null;
    for(const p of horizon){ if(last&&Math.hypot(p[0]-last[0],p[1]-last[1])>W) pen=false;
      pen?c.lineTo(p[0],p[1]):(c.moveTo(p[0],p[1]),pen=true); last=p; }
    c.stroke();
    for(const [az,t] of [[0,"N"],[45,"NE"],[90,"E"],[135,"SE"],[180,"S"],[225,"SW"],[270,"W"],[315,"NW"]]){
      const p=project({alt:-1.6,az}); if(!onScreen(p[0],p[1],20)) continue;
      haloText(c,t,p[0],p[1]+8,"rgba(170,185,240,.7)",`${t.length>1?10:11.5}px -apple-system,system-ui,sans-serif`);
    }
  }

  /* --- stars: atmosphere, fading in daylight --- */
  const starA=(1-day*0.92)*(layers.stars?1:0);
  if(starA>0.02){
    for(const s of cache.amb){ if(!s.up) continue; const [x,y]=project(s); if(!onScreen(x,y,6)) continue;
      const a=(s.m>5?.09:s.m>4.4?.14:.2)*starA;
      c.fillStyle=`rgba(225,232,255,${a})`; c.beginPath(); c.arc(x,y,s.m>4.6?0.7:1.05,0,7); c.fill(); }
    for(const A of cache.asts){
      const px=A.pts.map(p=>{ const [x,y]=project(p); return {x,y,up:p.up,m:p.m,on:onScreen(x,y,80)}; });
      if(!px.some(p=>p.on)) continue;
      for(const [i,j] of A.lines){ const a2=px[i],b2=px[j]; if(!a2||!b2||(!a2.on&&!b2.on)||!Number.isFinite(a2.x)||!Number.isFinite(b2.x)) continue;
        if(Math.hypot(a2.x-b2.x,a2.y-b2.y)>W*0.8) continue;
        c.strokeStyle=`rgba(168,182,236,${((a2.up||b2.up)?0.16:0.05)*starA*dim})`; c.lineWidth=1;
        c.beginPath(); c.moveTo(a2.x,a2.y); c.lineTo(b2.x,b2.y); c.stroke(); }
      for(const p of px){ if(!p.on||!p.up) continue;
        const r2=p.m<=1.2?2.1:p.m<=2.6?1.6:p.m<=3.6?1.25:1.0;
        c.fillStyle=`rgba(235,240,255,${0.75*starA*dim})`; c.beginPath(); c.arc(p.x,p.y,r2,0,7); c.fill(); }
    }
    for(const s of cache.stars){ if(!s.up) continue; const [x,y]=project(s); if(!onScreen(x,y,30)) continue;
      starSprite(c,x,y,s.m,starA*dim); }
  }

  /* --- the CELESTIAL RIBBON --- */
  const eclPts=cache.ecl.map(p=>{ const [x,y,z]=project(p); return {L:p.L,x,y,z,up:p.up}; });
  const bandW=Math.max(14,Math.min(46,3.4*ppd));         /* the rashi band, a region on the sphere */
  const ribbon=(lw,style,upOnly)=>{
    c.strokeStyle=style; c.lineWidth=lw; c.lineCap="butt"; c.lineJoin="round";
    c.beginPath(); let pen=false,last=null;
    for(const p of eclPts){
      if(!Number.isFinite(p.x)||(last&&Math.hypot(p.x-last.x,p.y-last.y)>W*0.6)){ pen=false; last=p; continue; }
      pen?c.lineTo(p.x,p.y):(c.moveTo(p.x,p.y),pen=true); last=p;
    }
    c.stroke();
  };
  if(layers.rashis||layers.naks){
    /* rashi regions: alternate a whisper of tone per sign, illuminate the focused one */
    for(let s=0;s<12;s++){
      const seg=eclPts.slice(s*15, s*15+16);
      const on=focusSign===s;
      const a=(on?0.30:(s%2?0.085:0.06))*(layers.rashis?1:0.4);
      c.strokeStyle=`rgba(194,155,78,${a*(on?1:dim)})`; c.lineWidth=bandW; c.lineCap="butt";
      c.beginPath(); let pen=false,last=null;
      for(const p of seg){ if(!Number.isFinite(p.x)||(last&&Math.hypot(p.x-last.x,p.y-last.y)>W*0.6)){pen=false;last=p;continue;}
        pen?c.lineTo(p.x,p.y):(c.moveTo(p.x,p.y),pen=true); last=p; }
      c.stroke();
    }
    ribbon(1.2,`rgba(214,180,110,${0.55*(0.6+0.4*dim)})`);   /* the ecliptic line itself */
    /* boundary ticks: rashi across the band, nakshatra on its lower half, pada when close */
    const tickAt=(p,len,side,style,lw)=>{
      const i=Math.round(p.L/2), a=eclPts[Math.max(0,i-1)], b=eclPts[Math.min(180,i+1)];
      const [x,y]=project(p); if(!onScreen(x,y,30)||!Number.isFinite(a.x)||!Number.isFinite(b.x)) return;
      let nx=-(b.y-a.y), ny=(b.x-a.x); const n=Math.hypot(nx,ny)||1; nx/=n; ny/=n;
      if(ny<0){nx=-nx;ny=-ny;}                                 /* normal points screen-down */
      c.strokeStyle=style; c.lineWidth=lw; c.beginPath();
      if(side===0){ c.moveTo(x-nx*len,y-ny*len); c.lineTo(x+nx*len,y+ny*len); }
      else { c.moveTo(x,y); c.lineTo(x+nx*len,y+ny*len); }
      c.stroke();
    };
    if(layers.rashis) for(let s=0;s<12;s++) tickAt(cache.ecl[s*15],bandW/2+3,0,`rgba(214,180,110,${0.7*dim})`,1.2);
    if(layers.naks) for(let i=0;i<27;i++){ const e=cache.nakEdge[i]; if(!e.up&&mode!=="birth") continue;
      tickAt({...e,L:i*NSPAN},bandW/2,1,`rgba(160,150,214,${(focusNak===i||focusNak===i-1?0.9:0.5)*dim})`,1); }
    if(layers.naks&&vFov<40) for(let i=0;i<108;i++){ if(i%4===0) continue;
      const L=i*NSPAN/4; const p=siderealPointAltAz(L, cache.d, cache.sp.lat, cache.sp.lon);
      tickAt({...p,L},bandW/5,1,`rgba(160,150,214,${0.35*dim})`,0.8); }
    /* the focused nakshatra: a violet highlight on the lower edge */
    if(focusNak!=null&&layers.naks){
      const i0=focusNak*NSPAN, i1=(focusNak+1)*NSPAN;
      c.strokeStyle=`rgba(150,140,215,${0.55*focusK})`; c.lineWidth=Math.max(3,bandW*0.32);
      c.beginPath(); let pen=false,last=null;
      for(let L=i0;L<=i1+0.01;L+=1.5){ const p=siderealPointAltAz(L, cache.d, cache.sp.lat, cache.sp.lon); const [x,y]=project(p);
        if(!Number.isFinite(x)||(last&&Math.hypot(x-last[0],y-last[1])>W*0.6)){pen=false;last=[x,y];continue;}
        pen?c.lineTo(x,y):(c.moveTo(x,y),pen=true); last=[x,y]; }
      c.stroke();
    }
  }
  /* rashi artwork, if the files exist - ghost at rest, richer when focused */
  if(layers.art) for(let s=0;s<12;s++){
    const img=RASHI_ART[s+1]; if(!img||!img.complete||!img.naturalWidth) continue;
    const m=project(cache.rashiMid[s]); if(!onScreen(m[0],m[1],300)) continue;
    const e1=project(cache.ecl[s*15+2]), e2=project(cache.ecl[s*15+13]);
    if(!Number.isFinite(e1[0])||!Number.isFinite(e2[0])) continue;
    const sz=Math.hypot(e2[0]-e1[0],e2[1]-e1[1])*1.3; if(sz<50) continue;
    c.save(); c.globalAlpha=(focusSign===s?0.34:0.12)*dim; c.translate(m[0],m[1]);
    c.rotate(Math.atan2(e2[1]-e1[1],e2[0]-e1[0])); c.drawImage(img,-sz/2,-sz/2,sz,sz); c.restore();
  }

  /* --- labels: priority order, one ledger --- */
  const L=makeLedger();
  const sysF=(px,w)=>`${w||500} ${px}px -apple-system,system-ui,sans-serif`;
  const devF=px=>`600 ${px}px "Devanagari Sangam MN","Kohinoor Devanagari","Noto Sans Devanagari",-apple-system,system-ui,sans-serif`;
  /* graha discs claim first so no caption ever sits on a planet */
  const discs=cache.grahas.map(p=>{ const [x,y]=project(p);
    const R=p.g==="Sun"?19:p.g==="Moon"?16:(p.g==="Rahu"||p.g==="Ketu")?11:13;
    const vis=onScreen(x,y,60); if(vis) L.claim(x,y,2*R+6,2*R+6); return {p,x,y,R,vis}; });
  const tgt=targetPos(); const tgtXY=tgt?project(tgt):null;
  if(tgtXY&&Number.isFinite(tgtXY[0])) L.claim(tgtXY[0],tgtXY[1],60,60);
  /* 1. the selected target label + 2. grahas */
  const grahaLabels=[];
  for(const {p,x,y,R,vis} of discs){
    if(!vis||!layers.planets) continue;
    const isT=target&&target.t==="graha"&&target.g===p.g;
    if(!p.up&&!isT&&mode!=="birth") continue;
    const txt=p.g+(p.retro&&p.g!=="Rahu"&&p.g!=="Ketu"?" ℞":"");
    grahaLabels.push({p,x,y,R,isT,txt});
  }
  grahaLabels.sort((a,b)=>(b.isT?1:0)-(a.isT?1:0));
  const drawnLabels=[];
  for(const g of grahaLabels){
    const font=sysF(g.isT?14.5:12.5,g.isT?700:600); c.font=font;
    const w=c.measureText(g.txt).width+4;
    const pos=L.place(g.x,g.y,w,15,[[0,g.R+13],[0,-g.R-12],[g.R+w/2+4,0],[-g.R-w/2-4,0]]);
    if(pos) drawnLabels.push({...g,font,pos,w});
  }
  /* 3. rashi captions (Devanagari), LOD by sector width */
  if(layers.rashis) for(let s=0;s<12;s++){
    const m=cache.rashiMid[s]; if(!m.up&&mode!=="birth"&&s!==focusSign) continue;
    const [x,y]=project(m); if(!onScreen(x,y,40)) continue;
    const a=project(cache.ecl[s*15]), b=project(cache.ecl[s*15+15]);
    const wid=(Number.isFinite(a[0])&&Number.isFinite(b[0]))?Math.hypot(b[0]-a[0],b[1]-a[1]):0;
    if(wid<52&&s!==focusSign) continue;
    const on=s===focusSign;
    const dev=SIGNS_DEV[s];
    const alpha=(on?1:0.8)*(on?1:dim);
    c.font=devF(on?17:14); const w=c.measureText(dev).width+6;
    const pos=L.place(x,y,w,20,[[0,-bandW/2-14],[0,bandW/2+16]]);
    if(!pos) continue;
    haloText(c,dev,pos[0],pos[1],`rgba(241,231,201,${alpha})`,devF(on?17:14));
    if(on||wid>150){
      const sub=on?`${SIGNS_SK[s]} · ${SIGNS_EN[s]}`:SIGNS_SK[s];
      c.font=sysF(10.5,500); const w2=c.measureText(sub).width+4;
      const p2=L.place(pos[0],pos[1],w2,12,[[0,pos[1]<y?-14:14]]);
      if(p2) haloText(c,sub,p2[0],p2[1],`rgba(214,190,140,${alpha*0.9})`,sysF(10.5,500));
    }
  }
  /* 4. nakshatra captions: only when their sector is wide enough or focused */
  if(layers.naks) for(let i=0;i<27;i++){
    const m=cache.nakMid[i]; if(!m.up&&mode!=="birth") continue;
    const [x,y]=project(m); if(!onScreen(x,y,40)) continue;
    const a=project(cache.nakEdge[i]), b=project(cache.nakEdge[(i+1)%27]);
    const wid=(Number.isFinite(a[0])&&Number.isFinite(b[0]))?Math.hypot(b[0]-a[0],b[1]-a[1]):0;
    const on=i===focusNak;
    if(wid<58&&!on) continue;
    c.font=sysF(on?11:9.5,on?600:500); const w=c.measureText(NAKS[i]).width+4;
    const anchors=on?[[0,bandW/2+14],[0,bandW/2+28],[0,bandW/2+42],[0,-(bandW/2+14)],[w/2+30,bandW/2+14],[-(w/2+30),bandW/2+14]]:[[0,bandW/2+14],[0,bandW/2+26]];
    const pos=L.place(x,y,w,12,anchors);
    if(pos) haloText(c,NAKS[i],pos[0],pos[1],`rgba(190,182,230,${(on?1:0.72)*(on?1:dim)})`,sysF(on?11:9.5,on?600:500));
  }
  /* 5. star names only when asked for, and only the bright ones */
  if(layers.starNames&&starA>0.2) for(const s of cache.stars){ if(!s.up||s.m>2.2) continue;
    const [x,y]=project(s); if(!onScreen(x,y,20)) continue;
    c.font=sysF(9.5,500); const w=c.measureText(s.name).width+4;
    const pos=L.place(x,y,w,12,[[0,12],[0,-12]]);
    if(pos) haloText(c,s.name,pos[0],pos[1],`rgba(168,174,203,${0.7*dim})`,sysF(9.5,500)); }

  /* --- grahas: art, halo, phase, nodes; then their labels --- */
  const sunD=discs.find(d=>d.p.g==="Sun");
  for(const {p,x,y,R,vis} of discs){
    if(!vis||!layers.planets) continue;
    const isT=target&&target.t==="graha"&&target.g===p.g;
    const a=(p.up?1:0.32)*(isT?1:(target?0.55+0.45*(1-focusK):1));
    c.globalAlpha=a;
    if(p.g==="Rahu"||p.g==="Ketu"){ nodeGlyph(c,x,y,R,a,p.g==="Ketu"); }
    else{
      const halo=p.g==="Sun"?3.4:2.1;
      glowDot(c,x,y,R*halo*(isT?1.35:1),GLOW[p.g],(p.g==="Sun"?.55:.32)*(isT?1.4:1));
      if(p.g==="Moon"){ const sun=cache.grahas[0], moon=p;
        const e=((moon.L-sun.L)%360+360)%360, kk=(1-Math.cos(e*D2R))/2;
        moonDisc(c,x,y,R,[sunD.x,sunD.y],kk,e<180); }
      else { const im=IMG[p.g]; if(im.complete) c.drawImage(im,x-R,y-R,2*R,2*R); }
    }
    c.globalAlpha=1;
  }
  for(const g of drawnLabels){
    const a=(g.p.up?1:0.45)*(g.isT?1:(target?0.55+0.45*(1-focusK):1));
    haloText(c,g.txt,g.pos[0],g.pos[1],`rgba(245,246,252,${a})`,g.font);
  }
  /* birth ghost: where the selected graha stood at birth */
  if(cache.ghost){ const [x,y]=project(cache.ghost); if(onScreen(x,y,20)){
    c.save(); c.setLineDash([3,3]); c.strokeStyle="rgba(186,148,255,.85)"; c.lineWidth=1.3;
    c.beginPath(); c.arc(x,y,9,0,7); c.stroke(); c.setLineDash([]);
    if(tgtXY&&Number.isFinite(tgtXY[0])){ c.strokeStyle="rgba(186,148,255,.35)"; c.beginPath(); c.moveTo(x,y); c.lineTo(tgtXY[0],tgtXY[1]); c.stroke(); }
    c.restore(); haloText(c,`${target.g} at birth`,x,y+18,"rgba(214,196,255,.9)",sysF(10,500)); } }
  /* lagna: a gold diamond on the rising point, birth mode only */
  if(cache.asc){ const [x,y]=project(cache.asc); if(onScreen(x,y,20)){
    const isT=target&&target.t==="asc";
    c.save(); c.translate(x,y); c.rotate(Math.PI/4);
    c.fillStyle=`rgba(226,190,100,${isT?1:0.9})`; c.strokeStyle="rgba(255,240,200,.9)"; c.lineWidth=1.2;
    c.beginPath(); c.rect(-6,-6,12,12); c.fill(); c.stroke(); c.restore();
    glowDot(c,x,y,26,"226,190,100",.35);
    c.font=sysF(11.5,700); const t=`${birthOpts.sign} Lagna`; const w=c.measureText(t).width+4;
    const pos=L.place(x,y,w,14,[[0,-20],[0,20],[w/2+14,0]]);
    if(pos) haloText(c,t,pos[0],pos[1],"rgba(241,231,201,.95)",sysF(11.5,700)); } }

  /* --- the guide: halo on the target, or an edge pointer to it --- */
  if(tgt){
    const [x,y]=tgtXY;
    const inside=Number.isFinite(x)&&x>36&&x<W-36&&y>110&&y<H-150;
    if(inside){
      const r=(target.t==="graha"?26:18)+(reduced?0:3*Math.sin(now/300));
      c.strokeStyle="rgba(241,231,201,.95)"; c.lineWidth=1.8; c.beginPath(); c.arc(x,y,r,0,7); c.stroke();
      c.strokeStyle="rgba(241,231,201,.3)"; c.beginPath(); c.arc(x,y,r+8,0,7); c.stroke();
      if(!target.seen){ target.seen=true; buzz(10); setFoot(); }
    }else{
      target.seen=false;
      /* direction on the sphere, not the flat map: angular offset from the view */
      const dAz=wrap(tgt.az-viewAz), dAlt=tgt.alt-viewAlt;
      const ang=Math.atan2(-dAlt,dAz);
      const cx=W/2, cy=H/2, m=Math.min(W/2-52, H/2-160);
      const ex=cx+Math.cos(ang)*m, ey=cy+Math.sin(ang)*m;
      const bob=reduced?0:4*Math.sin(now/260);
      c.save(); c.translate(ex+Math.cos(ang)*bob,ey+Math.sin(ang)*bob); c.rotate(ang);
      c.fillStyle="rgba(241,231,201,.95)"; c.beginPath(); c.moveTo(16,0); c.lineTo(-8,-10); c.lineTo(-3,0); c.lineTo(-8,10); c.closePath(); c.fill();
      c.restore();
      const total=Math.round(Math.hypot(dAz,dAlt));
      const word=Math.abs(dAz)>=Math.abs(dAlt)?(dAz>0?"right":"left"):(dAlt>0?"up":"down");
      const lbl=!tgt.up&&target.t!=="asc"?`${target.label.split(" · ")[0]} · below horizon`:`${target.label.split(" · ")[0]} · ${total}° ${word}`;
      haloText(c,lbl,Math.max(60,Math.min(W-60,ex)),ey+(Math.sin(ang)>0?-22:24),"rgba(241,231,201,.95)",sysF(11.5,600));
    }
  }
  /* accessibility: one sentence describing the view */
  if(now-(el._ariaAt||0)>1500){ el._ariaAt=now;
    const dir=["north","north-east","east","south-east","south","south-west","west","north-west"][Math.round((((viewAz%360)+360)%360)/45)%8];
    const vis=discs.filter(d=>d.vis&&d.p.up).map(d=>d.p.g);
    el.canvas.setAttribute("aria-label",`Looking ${dir}, ${Math.round(viewAlt)} degrees up. ${vis.length?vis.join(", ")+" visible.":"No graha in view."}${target?" Selected: "+target.label+".":""}`); }
  requestAnimationFrame(draw);
}

/* ====================================================================
   SELECTION CARDS — the thing · where it is · what it means to me
   ==================================================================== */
function houseOf(sg){ return birthOpts&&birthOpts.lagna?((sg+1-birthOpts.lagna+12)%12)+1:null; }
function setFoot(){
  const f=document.getElementById("svfoot"); if(!f) return;
  el.root.classList.toggle("hascard",!!target);
  const chip=document.getElementById("svtrack");
  if(!target){ f.innerHTML=""; f.hidden=true; if(chip) chip.hidden=true; return; }
  f.hidden=false;
  const p=targetPos(); if(!p){ f.innerHTML=""; return; }
  const dir=["N","NE","E","SE","S","SW","W","NW"][Math.round(((p.az%360)+360)%360/45)%8];
  const g=target.t==="graha"?target.g:null;
  if(g){
    const gr=pointGrid(p.L), sg=gr.sign-1, nk=gr.nak;
    const house=houseOf(sg);
    const meaning=mode==="birth"
      ? (house&&PLANET_STORY[g]?PLANET_STORY[g].inHouse[house]:GRAHA_MEANING[g]?.body||"")
      : (house?`${g==="Moon"?"Today":"Right now"} ${g} moves through your ${house}${["st","nd","rd"][house-1]||"th"} house — ${HOUSE_TRANSIT_SENSE[house]||""}.`:GRAHA_MEANING[g]?.body||"");
    const why=mode==="birth"
      ? [`${g} stood in ${SIGNS_EN[sg]} (${SIGNS_SK[sg]}) at ${fmtDMS(gr.degInSign)}, in ${NAKS[nk]} pada ${gr.pada}.`,
         house?`Counted from your ${birthOpts.sign} Lagna, ${SIGNS_EN[sg]} is your ${house}${["st","nd","rd"][house-1]||"th"} house.`:null,
         p.retro&&g!=="Rahu"&&g!=="Ketu"?`It was retrograde at your birth.`:null].filter(Boolean)
      : [`${g} is transiting ${SIGNS_EN[sg]} (${SIGNS_SK[sg]}) at ${fmtDMS(gr.degInSign)}, in ${NAKS[nk]} pada ${gr.pada}.`,
         house?`${SIGNS_EN[sg]} maps to your natal ${house}${["st","nd","rd"][house-1]||"th"} house.`:null,
         p.retro&&g!=="Rahu"&&g!=="Ketu"?`It is retrograde — matters return rather than settle first time.`:null].filter(Boolean);
    f.innerHTML=`<div class="skcard">
      <div class="skcardrow">
        <img class="skart" src="assets/graha/${g.toLowerCase()}.png" alt="">
        <div class="skmain">
          <b>${g}${mode==="birth"?" at birth":""}${p.retro&&g!=="Rahu"&&g!=="Ketu"?' <i class="skretro">℞</i>':""}</b>
          <span class="skline"><em>Sky</em> ${SIGNS_EN[sg]} · ${NAKS[nk]}</span>
          ${house?`<span class="skline"><em>Your chart</em> ${house}${["st","nd","rd"][house-1]||"th"} house${mode==="birth"?"":" (natal)"}</span>`:""}
          <span class="skline skwhere">${p.up?`up in the ${dir}`:`below the horizon, ${dir}`} · alt ${Math.round(p.alt)}°</span>
        </div>
        <button class="skx" id="svclear" aria-label="Clear selection">✕</button>
      </div>
      <p class="skmeaning">${meaning}</p>
      <details class="skwhy" id="skwhy"><summary>See why</summary>
        <ol>${why.map(w=>`<li>${w}</li>`).join("")}</ol></details>
      <div class="skacts">
        <button class="skact solid" id="svexplore">${mode==="birth"?"Explore birth placement":"Explore current influence"}</button>
        <button class="skact" id="svguide">Ask Guide</button>
        ${mode!=="birth"&&birthOpts&&birthOpts.natal&&birthOpts.natal[g]!=null?`<button class="skact${ghostBirth?" on":""}" id="svghost">${ghostBirth?"Hide birth":"Compare birth"}</button>`:""}
        <button class="skact${trackTarget?" on":""}" id="svtrackb">${trackTarget?"Tracking":"Track"}</button>
        ${!(sensing&&followSky)?`<button class="skact" id="svgo2">Take me there</button>`:""}
      </div>
    </div>`;
    const go2=document.getElementById("svgo2"); if(go2) go2.onclick=()=>{ aimAt(targetPos(),{force:true}); buzz(6); };
    document.getElementById("svexplore").onclick=()=>{ const gg=g; closeSkyView();
      dispatchEvent(new CustomEvent(mode==="birth"?"astra:openplanet":"astra:opentransit",{detail:gg})); };
    document.getElementById("svguide").onclick=()=>{ const q=mode==="birth"?`What does ${g} in ${SIGNS_EN[sg]} at my birth mean?`:`What does ${g} in ${SIGNS_EN[sg]} mean for me right now?`;
      const ctx={source:"sky",mode,graha:g,sign:SIGNS_EN[sg],nakshatra:NAKS[nk],pada:gr.pada,house,retrograde:!!p.retro,when:skyDate().toISOString()};
      closeSkyView(); dispatchEvent(new CustomEvent("astra:askguide",{detail:{q,ctx}})); };
    const gh=document.getElementById("svghost"); if(gh) gh.onclick=()=>{ ghostBirth=!ghostBirth; cache=null; setFoot(); buzz(5); };
    document.getElementById("svtrackb").onclick=()=>{ trackTarget=!trackTarget; setFoot(); buzz(5); if(trackTarget) aimAt(targetPos()); };
  }else if(target.t==="rashi"){
    const s=target.i;
    const here=cache.grahas.filter(x=>sgOf(x.L)===s).map(x=>x.g);
    const naks=signNakshatras(s+1);
    f.innerHTML=`<div class="skcard">
      <div class="skcardrow">
        <div class="skdev">${SIGNS_DEV[s]}</div>
        <div class="skmain"><b>${SIGNS_SK[s]} · ${SIGNS_EN[s]}</b>
          <span class="skline"><em>Region</em> ${s*30}° – ${(s+1)*30}° of the sidereal zodiac${houseOf(s)?` · your ${houseOf(s)}${["st","nd","rd"][houseOf(s)-1]||"th"} house`:""}</span>
          <span class="skline"><em>${mode==="birth"?"Here at birth":"Here now"}</em> ${here.length?here.join(", "):"no graha"}</span>
          <span class="skline"><em>Nakshatras</em> ${naks.map(n=>n.padas.length<4?`part of ${n.name}`:n.name).join(", ")}</span>
        </div>
        <button class="skx" id="svclear" aria-label="Clear selection">✕</button>
      </div>
      <div class="skacts">
        ${here.map(g=>`<button class="skact" data-pick="${g}">${g}</button>`).join("")}
        <button class="skact" id="svlearn">Learn ${SIGNS_EN[s]}</button>
      </div></div>`;
    f.querySelectorAll("[data-pick]").forEach(b=>b.onclick=()=>selectTarget({t:"graha",g:b.dataset.pick,label:b.dataset.pick}));
    document.getElementById("svlearn").onclick=()=>{ closeSkyView(); dispatchEvent(new CustomEvent("astra:opensign",{detail:s+1})); };
  }else if(target.t==="nakshatra"){
    const i=target.i, r=nakshatraRange(i), m=NAK_META[i];
    const here=cache.grahas.filter(x=>nkOf(x.L)===i).map(x=>x.g);
    f.innerHTML=`<div class="skcard">
      <div class="skcardrow">
        <img class="skart" src="assets/graha/${nakLord(i).toLowerCase()}.png" alt="">
        <div class="skmain"><b>${r.name}</b>
          <span class="skline"><em>Range</em> ${fmtDMS(r.start)} – ${fmtDMS(r.end)} · ${r.signs.map(x=>SIGNS_EN[x-1]).join(" and ")}</span>
          <span class="skline"><em>Ruler</em> ${nakLord(i)} · ${m.deity} · ${m.symbol}</span>
          <span class="skline"><em>${mode==="birth"?"Here at birth":"Here now"}</em> ${here.length?here.join(", "):"no graha"}</span>
        </div>
        <button class="skx" id="svclear" aria-label="Clear selection">✕</button>
      </div>
      <div class="skacts">
        ${here.map(g=>`<button class="skact" data-pick="${g}">${g}</button>`).join("")}
        <button class="skact" id="svlearn">Learn ${r.name}</button>
      </div></div>`;
    f.querySelectorAll("[data-pick]").forEach(b=>b.onclick=()=>selectTarget({t:"graha",g:b.dataset.pick,label:b.dataset.pick}));
    document.getElementById("svlearn").onclick=()=>{ closeSkyView(); dispatchEvent(new CustomEvent("astra:opennak",{detail:i})); };
  }else if(target.t==="asc"){
    const gr=pointGrid(birthOpts.asc);
    f.innerHTML=`<div class="skcard">
      <div class="skcardrow">
        <div class="skdev" style="font-size:22px">◆</div>
        <div class="skmain"><b>${birthOpts.sign} Lagna</b>
          <span class="skline"><em>Rising point</em> ${gr.signName} ${fmtDMS(gr.degInSign)} · ${gr.nakName} pada ${gr.pada}</span>
          <span class="skline skwhere">on the eastern horizon at the first breath</span></div>
        <button class="skx" id="svclear" aria-label="Clear selection">✕</button>
      </div>
      <p class="skmeaning">${gr.signName} was rising on the eastern horizon at your birth. That point fixes your 1st house — and so every other house.</p>
      <div class="skacts"><button class="skact solid" id="svlagna">See in birth chart</button></div></div>`;
    document.getElementById("svlagna").onclick=()=>{ closeSkyView(); dispatchEvent(new CustomEvent("astra:openhouse",{detail:1})); };
  }
  const cb=document.getElementById("svclear"); if(cb) cb.onclick=()=>clearTarget();
}
function clearTarget(){ target=null; trackTarget=false; ghostBirth=false; cache=null; setFoot(); syncFind(); }

/* ====================================================================
   AIM / SEARCH / FIND
   ==================================================================== */
function aimAt(p,opts={}){
  if(!p) return;
  const detachedOrNoSensors=!(sensing&&followSky);
  if(!detachedOrNoSensors&&!opts.force) return;
  wantAz=p.az; wantAlt=clampAlt(Math.max(6,Math.min(66,p.alt)));
  if(reduced||opts.instant){ viewAz=wantAz; viewAlt=wantAlt; }
}
function buildIndex(){
  const items=[];
  GRAHAS.forEach(g=>items.push({t:"graha",g,label:g,kind:"graha",keys:[g,GRAHA_SK[g]].map(x=>x.toLowerCase())}));
  SIGNS_SK.forEach((s,i)=>items.push({t:"rashi",i,label:`${s} · ${SIGNS_EN[i]}`,kind:"rashi",keys:[s.toLowerCase(),SIGNS_EN[i].toLowerCase()]}));
  NAKS.forEach((n,i)=>items.push({t:"nakshatra",i,label:n,kind:"nakshatra",keys:[n.toLowerCase()]}));
  if(birthOpts) items.push({t:"asc",label:`${birthOpts.sign} Lagna`,kind:"lagna",keys:["lagna","ascendant","rising",birthOpts.sign.toLowerCase()]});
  if(layers.starNames) STARS.forEach((s,i)=>items.push({t:"nakshatra",i,label:`${s.name} · ${NAKS[i]}`,kind:"star",keys:[s.name.toLowerCase()]}));
  return items;
}
let INDEX=null;
function runSearch(q){
  const res=document.getElementById("svres"); q=q.trim().toLowerCase();
  if(!q){ res.innerHTML=""; return; }
  INDEX=buildIndex();
  const hits=INDEX.filter(it=>it.keys.some(k=>k.startsWith(q)))
    .concat(INDEX.filter(it=>it.keys.some(k=>!k.startsWith(q)&&k.includes(q)))).slice(0,5);
  res.innerHTML=hits.map((h,i)=>`<button class="svhit" data-i="${i}"><b>${h.label}</b><span>${h.kind}</span></button>`).join("");
  res.querySelectorAll(".svhit").forEach((b,i)=>b.onclick=()=>selectTarget(hits[i]));
}
function selectTarget(hit){
  if(hit.t==="asc"&&mode!=="birth"){ setSkyMode("birth"); }
  target={...hit,seen:false};
  const q=document.getElementById("svq"), res=document.getElementById("svres");
  if(q){ q.value=""; q.blur(); } if(res) res.innerHTML="";
  cache=null; computeSky();
  aimAt(targetPos());
  buzz(6); setFoot(); syncFind(); wakeUI();
}
/* Find-mode helpers for manual explore: fly there, or hand back to the phone */
function syncFind(){
  const fb=el?.root.querySelector("#svfind"); if(!fb) return;
  if(!target){ fb.hidden=true; return; }
  const p=targetPos(); if(!p){ fb.hidden=true; return; }
  const [x,y]=project(p); const inside=Number.isFinite(x)&&x>36&&x<CAM.W-36&&y>110&&y<CAM.H-150;
  if(inside||(sensing&&followSky)){ fb.hidden=true; return; }
  fb.hidden=false;
  fb.innerHTML=`<button class="skpill solid" id="svgo">Take me there</button>${sensing?`<button class="skpill" id="svtrackp">Track with phone</button>`:""}`;
  fb.querySelector("#svgo").onclick=()=>{ aimAt(targetPos(),{force:true}); buzz(6); };
  const tp=fb.querySelector("#svtrackp"); if(tp) tp.onclick=()=>{ followSky=true; syncRecenter(); buzz(6); };
}

/* ====================================================================
   MODE + CAPSULE (the single contextual line)
   ==================================================================== */
function fmtMoment(){
  const w=document.getElementById("svcap"); if(!w) return;
  const tz=skyTz(); const d=skyDate();
  const t=fmtLocal(d,tz,{hour:"numeric",minute:"2-digit"});
  const dd=fmtLocal(d,tz,{day:"numeric",month:"short",year:"numeric"});
  const ab=tzAbbr(d,tz);
  if(mode==="birth"){
    const natal=new Date(birthOpts.date);
    if(!birthSeek||Math.abs(birthSeek-natal)<30000){
      w.innerHTML=`<span>${esc(dd)} · ${esc(t)}${ab?" "+esc(ab):""} · ${esc(birthOpts.place.split(",")[0])}</span><i class="skpen" aria-hidden="true">✎</i>`;
      w.dataset.act="birthedit";
    }else{
      const mins=Math.round((birthSeek-natal)/60000), abs=Math.abs(mins);
      const span=abs<60?`${abs} min`:abs<1440?`${Math.floor(abs/60)}h ${abs%60?abs%60+"m":""}`.trim():`${Math.round(abs/1440)} d`;
      w.innerHTML=`<span>${esc(t)} · ${span} ${mins<0?"before":"after"} birth</span><b class="skreturn">Birth time</b>`;
      w.dataset.act="birthreturn";
    }
  }else if(custom){
    w.innerHTML=`<span>${esc(t)} · ${esc(dd)} · ${esc(custom.place.split(",")[0])}</span><b class="skreturn">Live</b>`;
    w.dataset.act="live";
  }else if(seek){
    w.innerHTML=`<span>${esc(t)} · ${esc(dd)} · ${esc(placeName())}</span><b class="skreturn">Live</b>`;
    w.dataset.act="live";
  }else{
    w.innerHTML=`<span>Now · ${esc(t)}${ab?" "+esc(ab):""} · ${esc(placeName())}</span><i class="skpen" aria-hidden="true">✎</i>`;
    w.dataset.act="edit";
  }
}
function placeName(){
  const f=String(spot.from||"");
  if(!/your location|approximate/i.test(f)) return f.split(",")[0];
  return nearestCity(spot.lat,spot.lon)||(f.includes("approximate")?f.replace(/\s*\(approximate\)/,""):"your location");
}
function setSkyMode(m,opts={}){
  if(m===mode||(m==="birth"&&!birthOpts)) return;
  const prev=cache?Object.fromEntries(cache.grahas.map(x=>[x.g,x.L])):null;
  mode=m; birthSeek=null; seek=null;
  el.root.classList.toggle("birthmode",m==="birth");
  el.root.querySelectorAll("#svseg button").forEach(b=>{ b.classList.toggle("on",b.dataset.m===m); b.setAttribute("aria-selected",b.dataset.m===m); });
  if(prev&&!reduced&&!opts.instant) tween={from:prev,t0:performance.now(),ms:900};
  cache=null; computeSky();
  if(m==="birth"){
    toast("The sky you were born under.");
    if(!target&&cache.asc) target={t:"asc",label:`${birthOpts.sign} Lagna`,kind:"lagna",seen:false};
  } else if(target&&target.t==="asc") target=null;
  aimAt(targetPos());
  fmtMoment(); setFoot(); syncFind(); buildSeeker();
}
let toastT=null;
function toast(msg){
  const t=el.root.querySelector("#sktoast"); if(!t) return;
  t.textContent=msg; t.hidden=false; t.classList.remove("in"); void t.offsetWidth; t.classList.add("in");
  clearTimeout(toastT); toastT=setTimeout(()=>{ t.classList.remove("in"); setTimeout(()=>t.hidden=true,350); },2600);
}

/* ====================================================================
   VERTICAL TIME SEEKER — the signature interaction
   ==================================================================== */
let seekActive=false, seekLastHour=null, seekLastSign=null, seekLastNak=null, seekEvents=null;
function anchorDate(){ return mode==="birth"?new Date(birthOpts.date):custom?new Date(custom.iso):new Date(); }
function buildSeeker(){
  const s=el.root.querySelector("#svseek"); if(!s) return;
  const d=skyDate(), sp=skySpot(), tz=skyTz();
  const st=sunTimes(d,sp.lat,sp.lon);
  seekEvents={rise:st.rise,set:st.set,anchor:anchorDate()};
  paintSeeker();
}
function paintSeeker(){
  const s=el.root.querySelector("#svseek"); if(!s) return;
  const d=skyDate(), tz=skyTz();
  const off=offsetAtTz(tz||Intl.DateTimeFormat().resolvedOptions().timeZone,d.getTime());
  const localMs=d.getTime()+off; const dayStart=localMs-((localMs%864e5)+864e5)%864e5; /* local midnight */
  const frac=(localMs-dayStart)/864e5;
  const chip=s.querySelector(".skseekchip"); if(chip) chip.textContent=fmtLocal(d,tz,{hour:"numeric",minute:"2-digit"});
  const knob=s.querySelector(".skseekknob"); if(knob) knob.style.top=((1-frac)*100).toFixed(2)+"%";
  const rl=s.querySelector(".skseekrule"); if(!rl) return;
  const mark=(dd,cls,txt)=>{ if(!dd) return ""; const f=((dd.getTime()+off)-dayStart)/864e5; if(f<0||f>1) return "";
    return `<i class="${cls}" style="top:${((1-f)*100).toFixed(2)}%">${txt||""}</i>`; };
  rl.innerHTML=[0,3,6,9,12,15,18,21,24].map(h=>`<span style="top:${((1-h/24)*100).toFixed(2)}%">${h===0?"12 AM":h===12?"12 PM":h===24?"12 AM":h<12?h+" AM":(h-12)+" PM"}</span>`).join("")
    +mark(seekEvents?.rise,"sksun","☀")+mark(seekEvents?.set,"sksun","☀")
    +(mode==="birth"?mark(new Date(birthOpts.date),"skbirth"):mark(new Date(),"sknow"));
  s.dataset.day=fmtLocal(d,tz,{day:"numeric",month:"short"});
}
function seekTo(ms){
  const dNew=new Date(ms);
  if(mode==="birth") birthSeek=dNew; else seek=dNew;
  const prevSel=target&&target.t==="graha"?cache.grahas.find(x=>x.g===target.g):null;
  cache=null; computeSky();
  /* haptics: hour, sunrise/sunset, the anchor, and the selected graha's sign/nakshatra edges */
  const tz=skyTz(); const hr=Math.floor((ms+offsetAtTz(tz||Intl.DateTimeFormat().resolvedOptions().timeZone,ms))/36e5);
  if(seekLastHour!==null&&hr!==seekLastHour) buzz(3);
  seekLastHour=hr;
  const crossed=(t)=>t&&prevSeekMs!=null&&((prevSeekMs<t.getTime())!==(ms<t.getTime()));
  if(crossed(seekEvents?.rise)||crossed(seekEvents?.set)||crossed(seekEvents?.anchor)) buzz(9);
  if(prevSel){ const nowSel=cache.grahas.find(x=>x.g===target.g);
    const s0=sgOf(prevSel.L), s1=sgOf(nowSel.L), n0=nkOf(prevSel.L), n1=nkOf(nowSel.L);
    if(s0!==s1){ buzz(8); toast(`${target.g} entered ${SIGNS_EN[s1]}`); }
    else if(n0!==n1&&(target.g==="Moon"||vFov<45)){ buzz(4); toast(`${target.g} entered ${NAKS[n1]}`); }
    if((prevSel.alt>0)!==(nowSel.alt>0)) buzz(6);
    if(trackTarget) aimAt(nowSel,{force:true,instant:true}); }
  prevSeekMs=ms;
  fmtMoment(); paintSeeker(); setFoot();
}
let prevSeekMs=null;
function wireSeeker(){
  const s=el.root.querySelector("#svseek"); if(!s) return;
  let dragging=false, startY=0, startMs=0, holdT=null;
  const H=()=>s.getBoundingClientRect().height;
  const expand=on=>{ s.classList.toggle("open",on); seekActive=on; if(on){ buildSeeker(); paintSeeker(); } };
  s.addEventListener("pointerdown",e=>{ e.stopPropagation(); dragging=true; startY=e.clientY; startMs=skyDate().getTime(); prevSeekMs=startMs;
    seekLastHour=null; try{ s.setPointerCapture(e.pointerId); }catch(_){} holdT=setTimeout(()=>expand(true),140); wakeUI(); });
  s.addEventListener("pointermove",e=>{ if(!dragging) return; e.stopPropagation();
    const dy=e.clientY-startY; if(Math.abs(dy)>4&&!seekActive){ clearTimeout(holdT); expand(true); }
    if(!seekActive) return;
    const ms=startMs-(dy/H())*864e5;     /* up = later */
    seekTo(Math.round(ms/60000)*60000); });
  const end=e=>{ if(!dragging) return; dragging=false; clearTimeout(holdT); setTimeout(()=>expand(false),900); };
  s.addEventListener("pointerup",end); s.addEventListener("pointercancel",end);
  s.addEventListener("keydown",e=>{ const step=e.shiftKey?60:15; let ms=skyDate().getTime();
    if(e.key==="ArrowUp"){ ms+=step*60000; } else if(e.key==="ArrowDown"){ ms-=step*60000; } else return;
    e.preventDefault(); prevSeekMs=skyDate().getTime(); seekTo(ms); });
}
function returnToAnchor(){ if(mode==="birth") birthSeek=null; else { seek=null; custom=custom&&custom.fromLink?null:custom; }
  cache=null; computeSky(); fmtMoment(); paintSeeker(); setFoot(); buzz(7); }

/* ====================================================================
   LAYERS SHEET
   ==================================================================== */
const PRESETS={clean:{planets:true,rashis:true,naks:false,art:false,horizon:true,stars:true,starNames:false,natal:false},
  jyotish:{planets:true,rashis:true,naks:true,art:true,horizon:true,stars:true,starNames:false,natal:false},
  astronomy:{planets:true,rashis:false,naks:false,art:false,horizon:true,stars:true,starNames:true,natal:false}};
function paintLayers(){
  const sh=el.root.querySelector("#svlayers"); if(!sh) return;
  const row=(k,label,note)=>`<div class="sklrow"><div><b>${label}</b>${note?`<span>${note}</span>`:""}</div>
    <button class="switch${layers[k]?" on":""}" data-l="${k}" role="switch" aria-checked="${layers[k]}"><i></i></button></div>`;
  const preset=Object.entries(PRESETS).find(([,v])=>Object.keys(v).every(k=>v[k]===layers[k]))?.[0]||"";
  sh.innerHTML=`<div class="sklhead"><b>Layers</b><button class="skx" id="svlclose" aria-label="Close">✕</button></div>
    <div class="sklpre">${[["clean","Clean"],["jyotish","Jyotish"],["astronomy","Astronomy"]].map(([k,l])=>`<button data-p="${k}" class="${preset===k?"on":""}">${l}</button>`).join("")}</div>
    ${row("planets","Planets")}${row("rashis","Rashis","the twelve regions of the ribbon")}${row("naks","Nakshatras","twenty-seven finer sectors")}
    ${row("art","Rashi artwork","zodiac art — not constellation boundaries")}${row("horizon","Horizon")}${row("stars","Stars","atmosphere, unlabelled")}
    ${row("starNames","Star names","the bright yogataras")}`;
  sh.onclick=e=>{
    const sw=e.target.closest("[data-l]"); if(sw){ layers[sw.dataset.l]=!layers[sw.dataset.l]; saveLayers(); paintLayers(); buzz(4); return; }
    const pr=e.target.closest("[data-p]"); if(pr){ layers={...layers,...PRESETS[pr.dataset.p]}; saveLayers(); paintLayers(); buzz(5); return; }
    if(e.target.closest("#svlclose")){ sh.hidden=true; }
  };
}

/* ====================================================================
   DEVICE ORIENTATION (validated 30-31 Aug) + Android stream fix
   ==================================================================== */
let azOff=null, sawAbsolute=false;
function onOrient(ev){
  if(ev.alpha==null && ev.webkitCompassHeading==null) return;
  if(ev.webkitCompassHeading==null){ if(ev.absolute===true) sawAbsolute=true; else if(sawAbsolute) return; }
  const D=Math.PI/180;
  const a=(ev.alpha||0)*D, b=(ev.beta||0)*D, g=(ev.gamma||0)*D;
  const ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b),cg=Math.cos(g),sg=Math.sin(g);
  const vx=-(ca*sg+sa*sb*cg), vy=-(sa*sg-ca*sb*cg), vz=-(cb*cg);
  const azm=Math.atan2(vx,vy)/D;
  const altm=Math.asin(Math.max(-1,Math.min(1,vz)))/D;
  if(ev.webkitCompassHeading!=null){
    if(altm>-40 && altm<70){ const off=wrap(ev.webkitCompassHeading-azm); azOff=azOff==null?off:azOff+wrap(off-azOff)*0.08; }
  } else if(ev.absolute===true && azOff==null){ azOff=0; }
  if(azOff==null) return;
  sensing=true; el._lastSensor=performance.now();
  if(!followSky){ syncRecenter(); return; }
  if(Math.abs(altm)<78) wantAz=((azm+azOff)%360+360)%360;
  wantAlt=Math.max(-60,Math.min(85,altm));
  const fb=el?.root.querySelector("#svrecenter"); if(fb) fb.hidden=true;
}
function armSensors(){ if(watch) return; watch=onOrient;
  addEventListener("deviceorientationabsolute",watch); addEventListener("deviceorientation",watch); }
function syncRecenter(){
  const fb=el?.root.querySelector("#svrecenter"); if(!fb) return;
  fb.hidden=!(sensing&&!followSky);
}

/* ====================================================================
   MOMENT EDITOR (Now mode only — viewing place/date, never natal data)
   ==================================================================== */
let editPlace=null, plistSeq=0;
function tznoteFor(place){ const n=el.root.querySelector(".svtznote"); if(!n) return;
  n.innerHTML=place&&place.tz?"Times follow the place’s own clock — daylight saving included.":"Times are the place’s standard clock time (daylight saving not applied)."; }
function renderPlist(hits){
  const list=el.root.querySelector("#svplist"); if(!list) return;
  list.innerHTML=hits.map((c,i)=>`<button class="svpitem${editPlace&&editPlace.n===c.n?" on":""}" data-i="${i}">${c.raw?esc(c.label):c.label}${c.detail?` <span class="svpsub">${esc(c.detail)}</span>`:""}</button>`).join("");
  list.querySelectorAll(".svpitem").forEach(b=>b.onclick=()=>{ const c=hits[+b.dataset.i];
    editPlace={n:c.n,lat:c.lat,lon:c.lon,off:c.off,tz:c.tz||null}; el.root.querySelector("#svp").value=c.n; list.innerHTML=""; tznoteFor(editPlace); });
}
function pinnedPlaces(){
  const extra=[{label:`Use ${placeName()==="your location"?"my location":placeName()}`,n:placeName(),lat:spot.lat,lon:spot.lon,off:-new Date().getTimezoneOffset()/60,tz:spot.tz||Intl.DateTimeFormat().resolvedOptions().timeZone}];
  if(birthOpts) extra.push({label:`Birthplace · ${birthOpts.place}`,n:birthOpts.place,lat:birthOpts.lat,lon:birthOpts.lon,off:birthOpts.off??5.5,tz:birthOpts.tz||"Asia/Kolkata"});
  return extra;
}
function paintPlist(q){
  const list=el.root.querySelector("#svplist"); if(!list) return;
  const seq=++plistSeq; const pinned=pinnedPlaces();
  if(!q){ renderPlist(pinned.concat(CITIES.slice(0,4).map(cityHit))); return; }
  const lq=q.toLowerCase();
  renderPlist(pinned.filter(p=>p.label.toLowerCase().includes(lq)).concat(CITIES.filter(c=>c[0].toLowerCase().includes(lq)).slice(0,5).map(cityHit)));
  fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`)
    .then(r=>r.json()).then(j=>{ if(seq!==plistSeq) return;
      const hits=(j.results||[]).map(x=>({label:x.name,n:x.name,raw:true,detail:[x.admin1,x.country].filter(Boolean).join(", "),lat:x.latitude,lon:x.longitude,off:offsetAtTz(x.timezone,Date.now())/36e5,tz:x.timezone}));
      if(hits.length) renderPlist(pinned.filter(p=>p.label.toLowerCase().includes(lq)).concat(hits)); }).catch(()=>{});
}
function openEditor(){
  if(!proUser){ dispatchEvent(new CustomEvent("astra:pro")); return; }
  const ed=el.root.querySelector("#svedit"); if(!ed) return;
  ed.hidden=false; const d=skyDate(), tz=skyTz();
  const parts=new Intl.DateTimeFormat("en-CA",{timeZone:tz||undefined,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false}).formatToParts(d);
  const P={}; parts.forEach(p=>P[p.type]=p.value);
  el.root.querySelector("#svd").value=`${P.year}-${P.month}-${P.day}`;
  el.root.querySelector("#svt").value=`${P.hour==="24"?"00":P.hour}:${P.minute}`;
  editPlace=custom?{n:custom.place,lat:custom.lat,lon:custom.lon,off:custom.off,tz:custom.tz||null}
    :{n:placeName(),lat:spot.lat,lon:spot.lon,off:-new Date().getTimezoneOffset()/60,tz:spot.tz||Intl.DateTimeFormat().resolvedOptions().timeZone};
  el.root.querySelector("#svp").value=editPlace.n; paintPlist(""); tznoteFor(editPlace);
}
function applyMoment(){
  const dv=el.root.querySelector("#svd").value, tv=el.root.querySelector("#svt").value||"12:00";
  if(!dv||!editPlace) return;
  const typed=el.root.querySelector("#svp").value.trim();
  if(typed&&typed!==editPlace.n){ const first=el.root.querySelector(".svpitem"); if(first){ first.click(); } }
  const [y,mo,da]=dv.split("-").map(Number), [hh,mi]=tv.split(":").map(Number);
  const when=editPlace.tz?utcFromLocalTz(y,mo,da,hh,mi,editPlace.tz):new Date(Date.UTC(y,mo-1,da,0,Math.round(hh*60+mi-editPlace.off*60)));
  custom={iso:when.toISOString(),lat:editPlace.lat,lon:editPlace.lon,off:editPlace.off,tz:editPlace.tz||null,place:editPlace.n};
  seek=null; el.root.querySelector("#svedit").hidden=true; mode="now";
  cache=null; computeSky(); fmtMoment(); setFoot(); buildSeeker();
  const up=cache.grahas.filter(x=>x.up&&x.g!=="Rahu"&&x.g!=="Ketu"); const aim=up.sort((a,b)=>b.alt-a.alt)[0];
  if(aim) aimAt(aim);
}

/* ====================================================================
   CHROME: immersive fade, hints
   ==================================================================== */
function wakeUI(){ el?.root.classList.remove("quiet"); clearTimeout(uiTimer);
  uiTimer=setTimeout(()=>{ if(el&&!seekActive&&!target) el.root.classList.add("quiet"); },4500); }
function showHints(){
  let seen={}; try{ seen=JSON.parse(localStorage.getItem("astro.sky.hints")||"{}"); }catch(_){}
  const seq=[["move","Move your phone to look around"],["pinch","Pinch to zoom"],["time","Drag the time bar to move the sky"]]
    .filter(([k])=>!seen[k]);
  if(!seq.length) return;
  let i=0; const next=()=>{ if(i>=seq.length||!running) return; const [k,msg]=seq[i++];
    toast(msg); seen[k]=1; try{ localStorage.setItem("astro.sky.hints",JSON.stringify(seen)); }catch(_){}
    setTimeout(next,3400); };
  setTimeout(next,1200);
}

/* ====================================================================
   OPEN / CLOSE
   ==================================================================== */
export function openSkyView(opts={}){
  reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  loadLayers();
  if(opts.lat!=null) spot={lat:opts.lat,lon:opts.lon,from:opts.from||"your location",tz:opts.tz||Intl.DateTimeFormat().resolvedOptions().timeZone};
  birthOpts=opts.birth||null; proUser=!!opts.pro;
  mode="now"; custom=null; seek=null; birthSeek=null; followSky=true; target=null; ghostBirth=false; trackTarget=false; tween=null;
  if(opts.at){ const d=new Date(opts.at); if(!isNaN(d)&&Math.abs(d-Date.now())>60000){
    custom={iso:d.toISOString(),lat:spot.lat,lon:spot.lon,off:-d.getTimezoneOffset()/60,tz:spot.tz,place:placeName(),fromLink:true}; } }
  if(!el){
    const n=document.createElement("div"); n.className="skyview sky2"; n.id="skyview";
    n.innerHTML=`<canvas id="svc" role="img" aria-label="The sky"></canvas>
      <div class="sktop">
        <div class="svseg" id="svseg" role="tablist" aria-label="Which sky" hidden>
          <button data-m="birth" role="tab" aria-selected="false">Birth</button>
          <button data-m="now" class="on" role="tab" aria-selected="true">Now</button>
        </div>
        <button class="skcap" id="svcap" aria-label="Viewing moment"></button>
      </div>
      <button class="svclose" aria-label="Close">✕</button>
      <div class="skside">
        <button class="skibtn" id="svsearchb" aria-label="Search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16.5 16.5l4 4"/></svg></button>
        <button class="skibtn" id="svlayersb" aria-label="Layers"><svg viewBox="0 0 24 24"><path d="M12 4l9 5-9 5-9-5 9-5z"/><path d="M3 14l9 5 9-5"/></svg></button>
      </div>
      <div class="skseek" id="svseek" role="slider" tabindex="0" aria-label="Time of day" aria-valuetext="">
        <div class="skseekchip"></div>
        <div class="skseektrack"><div class="skseekrule"></div><div class="skseekknob"></div></div>
      </div>
      <div class="sksearch" id="svsearch" hidden>
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16.5 16.5l4 4"/></svg>
        <input id="svq" type="search" placeholder="Saturn, Shani, Meena, Mula…" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
        <div class="svres" id="svres"></div>
      </div>
      <div class="sklayers" id="svlayers" hidden></div>
      <div class="skfind" id="svfind" hidden></div>
      <button class="skpill" id="svrecenter" hidden>⌖ Recenter</button>
      <button class="skpill" id="svmotion" hidden>Follow my phone</button>
      <div class="sktoast" id="sktoast" hidden></div>
      <div class="svedit" id="svedit" hidden>
        <p class="svemote">Every sky is kept. Pick a moment and a place, and stand under it again.</p>
        <div class="sverow">
          <label class="fld"><span class="flabel">Date</span><input type="date" id="svd"></label>
          <label class="fld"><span class="flabel">Local time</span><input type="time" id="svt"></label>
        </div>
        <label class="fld"><span class="flabel">Place</span><input type="search" id="svp" placeholder="Search a city" autocomplete="off" autocorrect="off" spellcheck="false"></label>
        <div class="svplist" id="svplist"></div>
        <p class="svtznote"></p>
        <div class="sverow"><button class="primary" id="svapply">See this sky</button>
          <button class="proclose" id="svcancel" style="margin:0;width:auto;padding:13px 18px">Cancel</button></div>
      </div>
      <div class="svfoot skfoot" id="svfoot" hidden></div>`;
    document.body.appendChild(n);
    el={root:n, canvas:n.querySelector("#svc")};
    ctx=el.canvas.getContext("2d");
    const fit=()=>{ const w=Math.max(innerWidth,document.documentElement.clientWidth||0,320), h=Math.max(innerHeight,document.documentElement.clientHeight||0,480);
      el.canvas.width=w*devicePixelRatio; el.canvas.height=h*devicePixelRatio; ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0); };
    fit(); addEventListener("resize",fit); el._fit=fit;
    n.querySelector(".svclose").onclick=()=>{ if(history.state&&history.state.sky) history.back(); else closeSkyView(); };
    addEventListener("popstate",()=>{ if(running) closeSkyView(); });
    addEventListener("keydown",e=>{ if(e.key==="Escape"&&running) n.querySelector(".svclose").click(); });
    n.querySelector("#svsearchb").onclick=()=>{ const s=n.querySelector("#svsearch"); s.hidden=!s.hidden; if(!s.hidden) n.querySelector("#svq").focus(); n.querySelector("#svlayers").hidden=true; wakeUI(); };
    n.querySelector("#svlayersb").onclick=()=>{ const s=n.querySelector("#svlayers"); s.hidden=!s.hidden; if(!s.hidden) paintLayers(); n.querySelector("#svsearch").hidden=true; wakeUI(); };
    const q=n.querySelector("#svq"); q.oninput=()=>runSearch(q.value);
    q.onkeydown=e=>{ if(e.key==="Enter"){ const first=n.querySelector(".svhit"); if(first) first.click(); } };
    n.querySelector("#svcap").onclick=e=>{ const act=e.currentTarget.dataset.act;
      if(act==="edit") openEditor(); else if(act==="live"||act==="birthreturn") returnToAnchor();
      else if(act==="birthedit") { closeSkyView(); dispatchEvent(new CustomEvent("astra:openbirth")); } wakeUI(); };
    n.querySelector("#svcancel").onclick=()=>{ n.querySelector("#svedit").hidden=true; };
    n.querySelector("#svapply").onclick=applyMoment;
    n.querySelector("#svp").oninput=e=>paintPlist(e.target.value);
    n.querySelector("#svp").onkeydown=e=>{ if(e.key==="Enter"){ const f=n.querySelector(".svpitem"); if(f) f.click(); } };
    n.querySelector("#svrecenter").onclick=()=>{ followSky=true; syncRecenter(); buzz(8); wakeUI(); };
    wireSeeker();
    /* gestures: one finger drags (detaches motion), two fingers pinch the field of view, tap selects */
    const ptrs=new Map(); let moved=0, pinch0=null;
    n.addEventListener("pointerdown",e=>{
      if(e.target.closest(".sktop,.svclose,.skside,.skseek,.sksearch,.sklayers,.skfind,.skpill,.svedit,.skfoot")) return;
      ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY}); moved=0;
      if(ptrs.size===2){ const [a,b]=[...ptrs.values()]; pinch0={d:Math.hypot(a.x-b.x,a.y-b.y),fov:vFov}; }
      wakeUI(); });
    n.addEventListener("pointermove",e=>{
      if(!ptrs.has(e.pointerId)) return;
      const prev=ptrs.get(e.pointerId); ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(ptrs.size===2&&pinch0){ const [a,b]=[...ptrs.values()]; const d=Math.hypot(a.x-b.x,a.y-b.y);
        vFov=Math.max(FOV_MIN,Math.min(FOV_MAX,pinch0.fov*pinch0.d/Math.max(20,d))); moved+=9; return; }
      const dx=e.clientX-prev.x, dy=e.clientY-prev.y; moved+=Math.abs(dx)+Math.abs(dy);
      if(moved>10&&sensing&&followSky){ followSky=false; syncRecenter(); }
      const F=CAM.F||1; wantAz-=dx/F/D2R; wantAlt=clampAlt(wantAlt+dy/F/D2R);
      if(reduced){ viewAz=wantAz; viewAlt=wantAlt; } });
    const up=e=>{ const was=ptrs.has(e.pointerId); ptrs.delete(e.pointerId); if(ptrs.size<2) pinch0=null;
      if(!was||moved>10||!cache||e.type==="pointercancel") return;
      const r=el.canvas.getBoundingClientRect(); const cx=e.clientX-r.left, cy=e.clientY-r.top;
      hitTest(cx,cy); };
    n.addEventListener("pointerup",up); n.addEventListener("pointercancel",up);
    n.addEventListener("dblclick",e=>{ if(e.target.closest(".sktop,.skside,.skseek,.skfoot")) return; vFov=62; buzz(4); });
    n.addEventListener("wheel",e=>{ vFov=Math.max(FOV_MIN,Math.min(FOV_MAX,vFov*(e.deltaY>0?1.08:0.92))); },{passive:true});
  }
  el._fit();
  el.root.classList.add("on"); el.root.classList.remove("birthmode","quiet");
  try{ history.pushState({sky:1},""); }catch(_){}
  const seg=el.root.querySelector("#svseg");
  seg.hidden=!birthOpts;
  seg.querySelectorAll("button").forEach(b=>{ b.classList.toggle("on",b.dataset.m==="now"); b.setAttribute("aria-selected",b.dataset.m==="now"); b.onclick=()=>setSkyMode(b.dataset.m); });
  el.root.querySelector("#svedit").hidden=true; el.root.querySelector("#svsearch").hidden=true; el.root.querySelector("#svlayers").hidden=true;
  el.root.querySelector("#svq").value=""; el.root.querySelector("#svres").innerHTML="";
  cache=null; computeSky();
  if(opts.mode==="birth"&&birthOpts){ mode="birth"; el.root.classList.add("birthmode");
    seg.querySelectorAll("button").forEach(b=>{ b.classList.toggle("on",b.dataset.m==="birth"); b.setAttribute("aria-selected",b.dataset.m==="birth"); });
    cache=null; computeSky(); }
  if(opts.focus){ const p=cache.grahas.find(x=>x.g===opts.focus); if(p) target={t:"graha",g:opts.focus,label:opts.focus,kind:"graha",seen:false}; }
  else if(mode==="birth"&&cache.asc) target={t:"asc",label:`${birthOpts.sign} Lagna`,kind:"lagna",seen:false};
  let aim=target&&targetPos();
  if(!aim||(!aim.up&&target.t!=="asc")){ const upG=cache.grahas.filter(x=>x.up&&x.g!=="Rahu"&&x.g!=="Ketu");
    aim=upG.find(x=>x.g===(opts.focus||""))||upG.find(x=>x.g==="Sun")||upG.find(x=>x.g==="Moon")||upG.sort((a,b)=>b.alt-a.alt)[0]||aim||null; }
  if(aim){ wantAz=aim.az; wantAlt=clampAlt(Math.max(8,Math.min(65,aim.alt))); viewAz=reduced?wantAz:wantAz-14; viewAlt=wantAlt; }
  fmtMoment(); setFoot(); syncFind(); buildSeeker(); wakeUI(); showHints();
  running=true; lastFrame=0; draw();
  if(mode==="birth") toast("The sky you were born under.");
  const canAsk=typeof DeviceOrientationEvent!=="undefined"&&typeof DeviceOrientationEvent.requestPermission==="function";
  const fb=el.root.querySelector("#svmotion");
  if(!canAsk||opts.motion===true){ armSensors(); fb.hidden=true; }
  else { fb.hidden=false; fb.onclick=()=>{ DeviceOrientationEvent.requestPermission().then(r=>{ if(r==="granted"){ armSensors(); fb.hidden=true; }
      else toast("Motion access is off — allow it in Settings › Safari › Motion & Orientation."); }).catch(()=>{}); }; }
  setTimeout(()=>{ if(running&&!sensing) toast(canAsk&&fb&&!fb.hidden?"Drag to explore — or tap Follow my phone":"Motion tracking unavailable · drag to explore"); },2500);
}
function hitTest(cx,cy){
  let best=null,bd=34;
  for(const p of cache.grahas){ const [x,y]=project(p); if(!Number.isFinite(x)) continue; const d2=Math.hypot(x-cx,y-cy); if(d2<bd){bd=d2;best={t:"graha",g:p.g,label:p.g,kind:"graha"};} }
  if(!best&&cache.asc){ const [x,y]=project(cache.asc); if(Number.isFinite(x)&&Math.hypot(x-cx,y-cy)<28) best={t:"asc",label:`${birthOpts.sign} Lagna`,kind:"lagna"}; }
  if(!best&&(layers.rashis||layers.naks)){
    /* the ribbon: nearest ecliptic sample within the band; upper half = rashi, lower = nakshatra */
    let bi=-1,bdd=1e9,by=0;
    cache.ecl.forEach((p,i)=>{ const [x,y]=project(p); if(!Number.isFinite(x)) return; const d=Math.hypot(x-cx,y-cy); if(d<bdd){bdd=d;bi=i;by=y;} });
    const bandW=Math.max(14,Math.min(46,3.4*ppdCenter()));
    if(bi>=0&&bdd<bandW/2+16){ const L=cache.ecl[bi].L;
      if(cy<=by&&layers.rashis) best={t:"rashi",i:sgOf(L),label:`${SIGNS_SK[sgOf(L)]} · ${SIGNS_EN[sgOf(L)]}`,kind:"rashi"};
      else if(layers.naks) best={t:"nakshatra",i:nkOf(L),label:NAKS[nkOf(L)],kind:"nakshatra"};
      else best={t:"rashi",i:sgOf(L),label:`${SIGNS_SK[sgOf(L)]} · ${SIGNS_EN[sgOf(L)]}`,kind:"rashi"}; }
  }
  if(best){ target={...best,seen:false}; ghostBirth=false; cache=null; computeSky(); buzz(6); setFoot(); syncFind(); }
  else if(target){ clearTarget(); }
  wakeUI();
}
export function closeSkyView(){
  running=false; sensing=false; target=null; followSky=true; seekActive=false; tween=null;
  if(watch){ removeEventListener("deviceorientationabsolute",watch); removeEventListener("deviceorientation",watch); watch=null; }
  if(el){ el.root.classList.remove("on"); el.root.querySelector("#svq").value=""; el.root.querySelector("#svres").innerHTML=""; el.root.querySelector("#svfoot").hidden=true; }
}
