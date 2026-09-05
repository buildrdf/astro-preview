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
import { positions, retrograde, eclipticLatitudes } from "./ephemeris.js?v=20260902e";
import { raDecToAltAz, siderealPointAltAz, siderealPointAltAzB, sunTimes } from "./sky.js?v=20260902e";
import { ASTERISMS } from "./asterisms.js?v=20260831";
import { GRAHA_MEANING, PLANET_STORY, HOUSE_TRANSIT_SENSE } from "./interpret.js";
import { NAK_META, nakLord, pointGrid, nakshatraRange, signNakshatras, fmtDMS } from "./zodiac.js?v=20260902";
import { drawGraha, grahaSprite, preloadGrahaArt, GRAHA_BASE } from "./celestial-art.js?v=20260902e";
import { drawOrrery, orreryHit } from "./orrery.js?v=20260906e";
preloadGrahaArt();

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
  return Array.from({length:460},()=>({
    ra:rnd()*360, dec:Math.asin(rnd()*1.9-0.95)*180/Math.PI, m:3.4+rnd()*2.4}));
})();
const GLOW={Sun:"255,196,110",Moon:"214,226,255",Mars:"255,128,96",
  Mercury:"150,224,170",Jupiter:"255,214,150",Venus:"242,242,255",
  Saturn:"232,204,146",Rahu:"156,146,208",Ketu:"156,146,208"};
const IMG={};
for(const g of GRAHAS){ IMG[g]=new Image(); IMG[g].src=`assets/graha/${g.toLowerCase()}.png`; }
const RASHI_ART={};
/* the rashi art layer reads the asset manifest: only APPROVED assets ship;
   a review state (artPending) may show pending ones so they can be judged in situ */
const RASHI_ID={mesha:1,vrishabha:2,mithuna:3,karka:4,simha:5,kanya:6,tula:7,vrischika:8,dhanu:9,makara:10,kumbha:11,meena:12};
let ART_PENDING=false, artLoaded=false;
function loadRashiArt(){
  if(artLoaded) return; artLoaded=true;
  fetch("assets/gen/manifest.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(m=>{
    const list=Array.isArray(m)?m:(m&&(m.assets||m.entries))||[];
    for(const a of list){ if(a.kind!=="rashi"||!RASHI_ID[a.id]) continue;
      if(a.status!=="approved"&&!(ART_PENDING&&a.status==="pending-review")) continue;
      if(!a.file) continue;
      const im=new Image(); im.src=a.file.replace(/^prototype\//,""); RASHI_ART[RASHI_ID[a.id]]=im; }
  }).catch(()=>{});
}

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

/* the galactic equator, as RA/Dec, weighted brighter toward the centre (l=0) */
const MW=(()=>{ const R=Math.PI/180, aG=192.85948*R, dG=27.12825*R, lN=122.93192*R, out=[];
  for(let l=0;l<360;l+=4){ const L=l*R, b=0, x=lN-L;
    const sd=Math.sin(dG)*Math.sin(b)+Math.cos(dG)*Math.cos(b)*Math.cos(x);
    const ra=aG+Math.atan2(Math.cos(b)*Math.sin(x), Math.sin(b)*Math.cos(dG)-Math.cos(b)*Math.sin(dG)*Math.cos(x));
    out.push({ra:((ra/R)%360+360)%360, dec:Math.asin(sd)/R, w:0.35+0.65*Math.pow(Math.max(0,Math.cos(L)),0.7)}); }
  return out; })();

/* ====================================================================
   STATE
   ==================================================================== */
let el=null, ctx=null, running=false, watch=null, reduced=false;
let viewAz=180, viewAlt=25, wantAz=180, wantAlt=25, sensing=false, followSky=true;
let QUIET=false;   /* test states: no toasts, no motion pill (screenshots must compare) */
let revealBelow=false;   /* ground as glass to show a target that is below the horizon */
let vFov=62;                            /* vertical field of view, degrees */
const FOV_MIN=10, FOV_MAX=112;
/* past the widest field the ground falls away: orr 0 = the sky, 1 = the zodiac from above
   the Earth (orrery.js). One zoom scalar runs through both so a pinch never "ends". */
const ORR_SPAN=70; let orr=0, wantOrr=0, orrSide=false, wheelT=null;
/* zoomed out, a drag turns the whole system: sideways spins the Earth and its ring together,
   up and down tips the ring from edge-on toward a plan view */
/* the drag sets a TARGET; the view chases it. Raw per-event updates read as jumpy on iOS,
   which coalesces pointer moves, and the same is true of the date: it now travels day by
   day toward where the finger asks rather than teleporting there. */
let orrSpin=0, orrPitch=0, wantSpin=0, wantPitch=0, orrBase=null, seekTargetMs=null;
/* zoomed out, time is the wrong scale: a whole day moves only the Moon. The rail becomes a
   year, so every graha visibly walks the ring and the rashis change under them. */
/* six months across the rail, not a year: the point is to WATCH the grahas walk, and a
   year's worth of days under one thumb travels faster than the eye can follow */
const YEAR_MS=182*864e5;
const orrTime=()=>orr>0.5;
const seekSpan=()=>orrTime()?YEAR_MS:864e5;
const zoomOf=()=>wantOrr>0?FOV_MAX+ORR_SPAN*wantOrr:vFov;
function setZoom(z){ z=Math.max(FOV_MIN,Math.min(FOV_MAX+ORR_SPAN,z)); vFov=Math.min(FOV_MAX,z); wantOrr=Math.max(0,Math.min(1,(z-FOV_MAX)/ORR_SPAN)); }

let spot={lat:19.8824, lon:74.4761, from:"Kopargaon (approximate)", tz:"Asia/Kolkata"};
let cache=null, cacheAt=0, target=null, focusK=0;
let mode="now", birthOpts=null, proUser=false, custom=null;
let seek=null;        /* Now/custom mode: a scrubbed absolute Date, or null = live */
let birthSeek=null;   /* Birth mode: a scrubbed absolute Date, or null = natal */
let ghostBirth=false, trackTarget=false;
let lastFrame=0, layers=null, uiTimer=null, hintStep=0;
let tween=null;       /* {from:{g:L}, t0, ms} for the Birth->Now fast-forward */
/* the compass rose, measured off Apple's dial: 16 marks every 22.5 degrees, the cardinals
   longer and brighter, north drawn as the red pointer instead of a mark. The rose turns as
   a whole; the N in the middle stays upright, the way a compass card reads. Rotation is an
   SVG transform about an explicit centre (24,24) — a CSS transform on a positioned element
   would lose its centring translate. */
const ROSE=(()=>{ let out="";
  for(let i=1;i<16;i++){ const a=i*22.5*Math.PI/180, card=(i%4===0), R=21.2, r=card?16.4:18.3;
    out+=`<line x1="${(24+R*Math.sin(a)).toFixed(2)}" y1="${(24-R*Math.cos(a)).toFixed(2)}" x2="${(24+r*Math.sin(a)).toFixed(2)}" y2="${(24-r*Math.cos(a)).toFixed(2)}"${card?' class="c"':""}/>`; }
  return out; })();

const LAYER_DEFAULT={planets:true,rashis:true,naks:true,art:true,horizon:true,stars:true,starNames:false,sanskrit:false};
/* display radius per body (px): a controlled informational scale, not angular size;
   grows gently as the field narrows so close views stay balanced */
const R_BASE={Sun:26,Moon:22,Rahu:15,Ketu:15};
const grahaR=(g,fov)=>Math.round((R_BASE[g]||19)*Math.max(0.78,Math.min(1.6,Math.pow(62/(fov||62),0.3))));
function loadLayers(){ try{ layers={...LAYER_DEFAULT,...JSON.parse(localStorage.getItem("astro.sky.layers")||"{}")}; }catch(_){ layers={...LAYER_DEFAULT}; } }
function saveLayers(){ try{ localStorage.setItem("astro.sky.layers",JSON.stringify(layers)); }catch(_){} }

const skyDate=()=>mode==="birth"?(birthSeek||new Date(birthOpts.date))
  :(seek||(custom?new Date(custom.iso):new Date()));
const skySpot=()=>mode==="birth"?{lat:birthOpts.lat,lon:birthOpts.lon}:custom?custom:spot;
const skyTz=()=>mode==="birth"?(birthOpts.tz||"Asia/Kolkata"):custom?(custom.tz||null):(spot.tz||Intl.DateTimeFormat().resolvedOptions().timeZone);
const cacheKey=()=>mode+"|"+(mode==="birth"?(birthSeek?birthSeek.getTime():"b")
  :(seek?seek.getTime():custom?custom.iso+custom.lat:"live"));
const wrap=a=>((a+180)%360+360)%360-180;
const clampAlt=a=>Math.max(-60,Math.min(85,a));
/* Safari has no Vibration API on any version, so the sky was silent on iPhone too.
   Same label-through-switch route as app.js: an enhancement where it works, a no-op
   where it does not. */
let SKYTAP=null;
const buzz=n=>{ try{
  if(navigator.vibrate) return void navigator.vibrate(n);
  if(!SKYTAP){ const l=document.createElement("label");
    l.setAttribute("aria-hidden","true");
    l.style.cssText="position:fixed;left:-9999px;top:0;width:1px;height:1px;pointer-events:none";
    const b=document.createElement("input"); b.type="checkbox"; b.setAttribute("switch",""); b.tabIndex=-1;
    l.appendChild(b); document.body.appendChild(l); SKYTAP=l; }
  const was=document.activeElement; SKYTAP.click();
  if(was&&document.activeElement!==was&&was.focus) was.focus({preventScroll:true});
}catch(_){} };
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

/* ====================================================================
   SKY MODEL — one compute per moment, cached
   ==================================================================== */
function computeSky(){
  const d=skyDate(), sp=skySpot();
  const pos=positions(d), ret=retrograde(d), lats=eclipticLatitudes(d);
  if(tween){ const k=Math.min(1,(performance.now()-tween.t0)/tween.ms);
    const e=1-Math.pow(1-k,3);
    for(const g of GRAHAS){ const a=tween.from[g], b=pos[g];
      let dl=((b-a)%360+360)%360; if(dl>180) dl-=360;
      pos[g]=((a+dl*e)%360+360)%360; }
    if(k>=1) tween=null; }
  const sunT=(mode==="birth"||custom||seek)?null:null;
  cache={
    mode, key:cacheKey(), d, sp,
    grahas:GRAHAS.map(g=>({g, retro:ret[g], L:pos[g], B:lats[g], ...siderealPointAltAzB(pos[g], lats[g], d, sp.lat, sp.lon)})),
    stars:STARS.map((s,i)=>({...s, nak:NAKS[i], ...raDecToAltAz(s.ra, s.dec, d, sp.lat, sp.lon)})),
    asts:ASTERISMS.map(A=>({lines:A.lines,
      pts:A.stars.map(s=>({m:s.m, ...raDecToAltAz(s.ra, s.dec, d, sp.lat, sp.lon)}))})),
    amb:AMBIENT.map(s=>({m:s.m, ...raDecToAltAz(s.ra, s.dec, d, sp.lat, sp.lon)})),
    amb2:AMBIENT.map(s=>({m:s.m, ...raDecToAltAz((s.ra+137.5)%360, -s.dec*0.93, d, sp.lat, sp.lon)})),
    mw:MW.map(p=>({w:p.w, ...raDecToAltAz(p.ra, p.dec, d, sp.lat, sp.lon)})),
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
function haloText(c,txt,x,y,fill,font,align="center",halo="rgba(6,7,20,.75)"){
  c.font=font; c.textAlign=align; c.textBaseline="middle";
  c.lineWidth=3; c.strokeStyle=halo; c.lineJoin="round";
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

/* The nakshatra figures. Sangram, twice: "I still don't see the nakshatra
   shapes." They were being drawn — at sixteen percent of an already-faded
   star alpha, which on a phone in daylight is nothing at all. They now carry
   a floor of their own, brighten when their nakshatra is the selected one,
   and survive into daylight as ink. */
function drawAsterisms(c,W,starA,dim,focusNak,dayA){
  const ink=dayA>0;
  for(let ai=0;ai<cache.asts.length;ai++){
    const A=cache.asts[ai], on=focusNak===ai;
    const px=A.pts.map(p=>{ const [x,y]=project(p); return {x,y,up:p.up,m:p.m,on:onScreen(x,y,80)}; });
    if(!px.some(p=>p.on)) continue;
    const base=ink?0.42*dayA:(on?0.85:0.38)*starA;
    const lo=ink?0.15*dayA:(on?0.30:0.12)*starA;
    for(const [i,j] of A.lines){ const a2=px[i],b2=px[j];
      if(!a2||!b2||(!a2.on&&!b2.on)||!Number.isFinite(a2.x)||!Number.isFinite(b2.x)) continue;
      if(Math.hypot(a2.x-b2.x,a2.y-b2.y)>W*0.8) continue;
      c.strokeStyle=ink?`rgba(52,56,92,${(((a2.up||b2.up)?base:lo)*dim).toFixed(3)})`
                       :`rgba(168,182,236,${(((a2.up||b2.up)?base:lo)*dim).toFixed(3)})`;
      c.lineWidth=on&&!ink?1.4:1;
      c.beginPath(); c.moveTo(a2.x,a2.y); c.lineTo(b2.x,b2.y); c.stroke(); }
    if(ink) continue;
    for(const p of px){ if(!p.on||!p.up) continue;
      const r2=p.m<=1.2?2.1:p.m<=2.6?1.6:p.m<=3.6?1.25:1.0;
      c.fillStyle=`rgba(235,240,255,${((on?0.95:0.75)*starA*dim).toFixed(3)})`;
      c.beginPath(); c.arc(p.x,p.y,on?r2*1.25:r2,0,7); c.fill(); }
  }
}

function draw(){
  if(!running) return;
  const now=performance.now();
  const dt=Math.min(60,now-(lastFrame||now)); lastFrame=now;
  const W=el.canvas.width/devicePixelRatio, H=el.canvas.height/devicePixelRatio;
  const k=reduced?1:1-Math.exp(-dt/110);
  viewAz+=wrap(wantAz-viewAz)*k; viewAlt+=(wantAlt-viewAlt)*k;
  focusK+=((target?1:0)-focusK)*(reduced?1:1-Math.exp(-dt/160));
  orr+=(wantOrr-orr)*(reduced?1:1-Math.exp(-dt/150)); if(Math.abs(wantOrr-orr)<0.002) orr=wantOrr;
  { const k2=reduced?1:1-Math.exp(-dt/120);
    orrSpin+=(wantSpin-orrSpin)*k2; orrPitch+=(wantPitch-orrPitch)*k2; }
  /* the date walks toward the target at a readable pace, so planets are seen to move */
  if(seekTargetMs!=null){
    const cur=skyDate().getTime(), gap=seekTargetMs-cur;
    if(Math.abs(gap)<864e5*0.5){ seekTo(seekTargetMs); seekTargetMs=null; }
    else { /* rate in DAYS PER SECOND, not per frame: a 120Hz phone must travel at the same
              speed as a 60Hz one, and the walk has to stay readable on both */
      const cap=864e5*0.022*Math.max(8,dt);          /* about 22 days a second */
      const step=Math.sign(gap)*Math.min(Math.abs(gap)*0.12,cap);
      /* no day-rounding here: a sub-day step rounded back to today never advances, and the
         sky is happy to sit between days — the chip is what names the date */
      seekTo(cur+step); }
  }
  if((orr>=0.5)!==orrSide){ orrSide=orr>=0.5; buzz(8);
    if(orrSide) orrBase=skyDate().getTime();
    if(el&&el.root.querySelector("#svseek")) paintSeeker(); }
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
  const mixc=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t));
  /* keyframes by solar altitude: [zenith, mid-sky, horizon] */
  const SKY_KEYS=[
    [-90,[3,4,14],[13,17,44],[26,30,66]],       /* deep night: indigo depth, faint skyglow at the horizon */
    [-18,[3,4,14],[13,17,44],[26,30,66]],       /* astronomical twilight begins */
    [-12,[5,7,22],[22,26,62],[54,48,96]],       /* nautical: a violet breath at the horizon */
    [-6,[11,17,50],[50,64,126],[176,118,108]],  /* civil: rose and peach */
    [0,[38,72,148],[108,138,198],[238,168,118]],/* the Sun on the horizon */
    [6,[48,94,174],[126,160,216],[208,212,230]],
    [15,[42,98,190],[118,158,222],[198,212,236]],/* day: deep blue zenith, pale scattering at the horizon */
    [90,[40,96,192],[116,156,222],[196,210,236]]];
  const skyAt=alt=>{ let i=0; while(i<SKY_KEYS.length-2&&alt>SKY_KEYS[i+1][0]) i++;
    const A=SKY_KEYS[i], Bk=SKY_KEYS[i+1]; let t=(alt-A[0])/(Bk[0]-A[0]); t=Math.max(0,Math.min(1,t)); t=t*t*(3-2*t);
    return [mixc(A[1],Bk[1],t),mixc(A[2],Bk[2],t),mixc(A[3],Bk[3],t)]; };
  const [t0,t1,t2]=skyAt(cache.sunAlt);
  const starFade=Math.max(0,Math.min(1,(-cache.sunAlt-4)/8));   /* stars gone by civil dawn */
  /* the horizon line on screen: two far-apart points and the unit normal toward the ground */
  const hz=(()=>{
    const pts=[]; for(let az=0;az<360;az+=3){ const p=project({alt:0,az}); if(Number.isFinite(p[0])) pts.push({x:p[0],y:p[1],az}); }
    if(pts.length<2) return null;
    let p1=pts[0], p2=pts[0], best=-1;
    for(const p of pts){ const d=Math.hypot(p.x-p1.x,p.y-p1.y); if(d>best){best=d;p2=p;} }
    for(const p of pts){ const d=Math.hypot(p.x-p2.x,p.y-p2.y); if(d>best){best=d;p1=p;} }
    if(best<4) return null;
    const dx=(p2.x-p1.x)/best, dy=(p2.y-p1.y)/best; let nx=-dy, ny=dx;
    const g=project({alt:-6,az:p1.az});
    const side=Number.isFinite(g[0])?Math.sign((g[0]-p1.x)*nx+(g[1]-p1.y)*ny)||1:(ny>0?1:-1);
    nx*=side; ny*=side;
    /* the point of the line nearest the screen centre anchors the gradients */
    const t=((W/2-p1.x)*dx+(H/2-p1.y)*dy); const cx=p1.x+dx*t, cy=p1.y+dy*t;
    return {p1,p2,dx,dy,nx,ny,cx,cy,pts};
  })();
  const rgb=v=>`rgb(${v.join(",")})`;
  if(hz){
    /* sky: haze at the horizon deepening toward the zenith, measured away from the line */
    const D=Math.max(H,W)*1.1;
    const sg=c.createLinearGradient(hz.cx,hz.cy,hz.cx-hz.nx*D,hz.cy-hz.ny*D);
    sg.addColorStop(0,rgb(t2)); sg.addColorStop(0.06,rgb(mixc(t2,t1,0.55))); sg.addColorStop(0.32,rgb(t1)); sg.addColorStop(1,rgb(t0));
    c.fillStyle=sg; c.fillRect(0,0,W,H);
    /* daylight scattering: a broad, pale aureole toward the Sun's direction */
    const sunG=cache.grahas.find(x=>x.g==="Sun");
    if(sunG&&day>0.05){ const sp=project(sunG);
      if(Number.isFinite(sp[0])){ const ag=c.createRadialGradient(sp[0],sp[1],0,sp[0],sp[1],Math.max(W,H)*1.9);
        ag.addColorStop(0,`rgba(255,250,235,${0.55*day})`); ag.addColorStop(0.09,`rgba(235,240,250,${0.24*day})`); ag.addColorStop(0.45,`rgba(225,234,250,${0.10*day})`); ag.addColorStop(1,"rgba(225,234,250,0)");
        c.fillStyle=ag; c.fillRect(0,0,W,H); } }
    /* dawn and dusk: warmth pooled where the Sun meets the horizon */
    if(sunG&&Math.abs(cache.sunAlt)<9){
      const sp=project({alt:0,az:sunG.az});
      if(Number.isFinite(sp[0])){ const k=1-Math.abs(cache.sunAlt)/9;
        const rg=c.createRadialGradient(sp[0],sp[1],0,sp[0],sp[1],H*0.75);
        rg.addColorStop(0,`rgba(255,168,92,${0.55*k})`); rg.addColorStop(0.35,`rgba(255,140,90,${0.22*k})`); rg.addColorStop(1,"rgba(255,140,90,0)");
        c.fillStyle=rg; c.fillRect(0,0,W,H); }
    }
  } else {
    const sg=c.createLinearGradient(0,0,0,H);
    sg.addColorStop(0,rgb(viewAlt>0?t0:t2)); sg.addColorStop(1,rgb(viewAlt>0?t1:t2));
    c.fillStyle=sg; c.fillRect(0,0,W,H);
  }

  /* --- horizon: a cool material line with ground beneath it --- */
  if(layers.horizon){
    const horizon=hz?hz.pts:[];
    /* ground: the half-plane on the nadir side of the horizon line (a great
       circle is a straight line in this projection), shaded from horizon
       haze into deep ground; objects below the horizon stay faintly visible */
    c.save();
    if(hz){
      const {p1,p2,dx,dy,nx,ny,cx,cy}=hz, L=6000;
      const ga=revealBelow?0.38:1;
      /* aerial perspective: the ground near the horizon wears the sky's haze — pale and
         airy by day, the sky's warmth at dusk, blue-black at night; the nadir stays dark */
      const hazeC=day>0.5?mixc(t2,[160,168,184],0.45):mixc(t2,[10,12,26],0.42);
      const midC=mixc(hazeC,[12,14,28],day>0.5?0.38:0.72);
      const gg=c.createLinearGradient(cx,cy,cx+nx*H*0.95,cy+ny*H*0.95);
      gg.addColorStop(0,`rgba(${hazeC.join(",")},${0.9*ga})`); gg.addColorStop(day>0.5?0.42:0.22,`rgba(${midC.join(",")},${0.9*ga})`); gg.addColorStop(1,`rgba(6,7,16,${0.95*ga})`);
      c.fillStyle=gg;
      c.beginPath(); c.moveTo(p1.x-dx*L,p1.y-dy*L); c.lineTo(p2.x+dx*L,p2.y+dy*L);
      c.lineTo(p2.x+dx*L+nx*L,p2.y+dy*L+ny*L); c.lineTo(p1.x-dx*L+nx*L,p1.y-dy*L+ny*L); c.closePath(); c.fill();
      /* two ridges along the horizon: a far one lost in the haze, a nearer darker one
         (a sense of place, not scenery — the same land at every azimuth of this spot) */
      if(horizon.length>4){
        /* the point list runs by azimuth and drops everything behind the camera, so when the
           camera faces north the 357-degree point and the 0-degree point sit next to each
           other on screen but at opposite ends of the array: closing the polygon on array
           order drew a thin double-filled sliver from the horizon to the bottom of the
           screen, right under the N label. Sort along the horizon line instead. */
        const ord=horizon.map(p=>({az:p.az,x:p.x,y:p.y,t:(p.x-cx)*dx+(p.y-cy)*dy})).sort((a,b)=>a.t-b.t);
        const ridge=(amp,ph,col)=>{ c.fillStyle=col; c.beginPath(); let pen0=false;
          for(const p of ord){ const h=Math.max(0,amp*ppd*(0.5+0.5*Math.sin(p.az*3*D2R+ph)+0.3*Math.sin(p.az*7*D2R+ph*1.7)+0.16*Math.sin(p.az*17*D2R+ph*0.6)));
            const x=p.x-nx*h, y=p.y-ny*h; pen0?c.lineTo(x,y):(c.moveTo(x,y),pen0=true); }
          const e=ord[ord.length-1], f=ord[0];
          c.lineTo(e.x+dx*L,e.y+dy*L); c.lineTo(e.x+dx*L+nx*L,e.y+dy*L+ny*L);
          c.lineTo(f.x-dx*L+nx*L,f.y-dy*L+ny*L); c.lineTo(f.x-dx*L,f.y-dy*L); c.closePath(); c.fill(); };
        const farC=mixc(hazeC,[8,10,24],day>0.5?0.22:0.45), nearC=mixc(farC,[5,6,15],0.6);
        ridge(2.2,0.4,`rgba(${farC.join(",")},${0.92*ga})`);
        ridge(1.2,2.1,`rgba(${nearC.join(",")},${0.94*ga})`);
      }
      /* haze rising from the line into the sky: airy by day, a thin breath at night */
      const hzC=mixc(t2,[255,255,255],0.3*day);
      const hzg=c.createLinearGradient(cx,cy,cx-nx*H*(0.14+0.1*day),cy-ny*H*(0.14+0.1*day));
      hzg.addColorStop(0,`rgba(${hzC.join(",")},${0.32+0.3*day})`); hzg.addColorStop(1,`rgba(${hzC.join(",")},0)`);
      c.fillStyle=hzg;
      c.beginPath(); c.moveTo(p1.x-dx*L,p1.y-dy*L); c.lineTo(p2.x+dx*L,p2.y+dy*L);
      c.lineTo(p2.x+dx*L-nx*H*0.24,p2.y+dy*L-ny*H*0.24); c.lineTo(p1.x-dx*L-nx*H*0.24,p1.y-dy*L-ny*H*0.24); c.closePath(); c.fill();
      /* a soft luminous edge — never a hard line */
      c.strokeStyle=`rgba(${mixc(t2,[220,228,255],0.5).join(",")},${0.05+0.08*day})`; c.lineWidth=6; c.lineCap="round";
      c.beginPath(); c.moveTo(p1.x-dx*L,p1.y-dy*L); c.lineTo(p2.x+dx*L,p2.y+dy*L); c.stroke();
    } else if(viewAlt<0){ c.fillStyle="rgba(4,5,14,0.94)"; c.fillRect(0,0,W,H); }
    c.restore();
    c.strokeStyle=`rgba(${mixc(t2,[200,212,255],0.55).join(",")},${day>0.5?0.22:0.36})`; c.lineWidth=1; c.beginPath(); let pen=false;
    let last=null;
    for(const p of horizon){ if(last&&Math.hypot(p.x-last.x,p.y-last.y)>W) pen=false;
      pen?c.lineTo(p.x,p.y):(c.moveTo(p.x,p.y),pen=true); last=p; }
    c.stroke();
    for(const [az,t] of [[0,"N"],[45,"NE"],[90,"E"],[135,"SE"],[180,"S"],[225,"SW"],[270,"W"],[315,"NW"]]){
      const p=project({alt:-1.6,az}); if(!onScreen(p[0],p[1],20)) continue;
      haloText(c,t.split("").join("\u2009"),p[0],p[1]+9,"rgba(170,185,240,.55)",`600 ${t.length>1?9:10.5}px -apple-system,system-ui,sans-serif`);
    }
  }

  /* --- vignette: corners recede a little (more at night) --- */
  { const vg=c.createRadialGradient(W/2,H*0.46,Math.min(W,H)*0.45,W/2,H*0.46,Math.max(W,H)*0.78);
    vg.addColorStop(0,"rgba(0,0,0,0)"); vg.addColorStop(1,`rgba(2,3,10,${0.22-0.14*day})`);
    c.fillStyle=vg; c.fillRect(0,0,W,H); }
  /* --- stars: atmosphere, fading in daylight --- */
  const starA=starFade*(layers.stars?1:0);
  const slip=(viewAz-180)*0.015;                                 /* plane 1 parallax: restrained */
  if(starA>0.02){
    if(vFov>56){ /* wide view: a second, fainter plane of stars (the same seeded field, turned) */
      const k=Math.min(1,(vFov-56)/30);
      for(const s of cache.amb2){ if(!s.up) continue; const [x,y]=project({alt:s.alt,az:s.az+slip*1.4}); if(!onScreen(x,y,4)) continue;
        c.fillStyle=`rgba(215,224,255,${0.12*starA*k})`; c.beginPath(); c.arc(x,y,0.75,0,7); c.fill(); }
    }
    /* the Milky Way: one continuous path per layer (segment-wise strokes leave a string of
       pearls), feathered by three widths; the half toward the galactic centre gets a core */
    { const pts=cache.mw.map(p=>{ const [x,y]=project(p); return {x,y,w:p.w,up:p.up}; });
      const path=(pred)=>{ c.beginPath(); let pen=false,last=null;
        for(let i=0;i<=pts.length;i++){ const p=pts[i%pts.length];
          const ok=Number.isFinite(p.x)&&pred(p)&&!(last&&Math.hypot(p.x-last.x,p.y-last.y)>W*0.6);
          if(!ok){ pen=false; last=Number.isFinite(p.x)?p:null; continue; }
          pen?c.lineTo(p.x,p.y):(c.moveTo(p.x,p.y),pen=true); last=p; } };
      c.lineCap="round"; c.lineJoin="round";
      for(const wid of [30,25,20,16,12,9,6]){ path(()=>true); c.strokeStyle=`rgba(205,214,242,${0.011*starA*dim})`; c.lineWidth=wid*ppd; c.stroke(); }
      for(const wid of [14,10,7,4]){ path(p=>p.w>0.6); c.strokeStyle=`rgba(222,226,246,${0.014*starA*dim})`; c.lineWidth=wid*ppd; c.stroke(); }
    }
    for(const s of cache.amb){ if(!s.up) continue; const [x,y]=project({alt:s.alt,az:s.az+slip}); if(!onScreen(x,y,6)) continue;
      const a=(s.m>5?.15:s.m>4.4?.22:.32)*starA;
      c.fillStyle=`rgba(225,232,255,${a})`; c.beginPath(); c.arc(x,y,s.m>4.6?0.7:1.05,0,7); c.fill(); }
    drawAsterisms(c,W,starA,dim,focusNak);
    for(const s of cache.stars){ if(!s.up) continue; const [x,y]=project(s); if(!onScreen(x,y,30)) continue;
      starSprite(c,x,y,s.m,starA*dim); }
  }
  /* DAYLIGHT. The stars are not really visible, and the nakshatras are the
     reference frame of the whole system — so the twenty-seven yogataras and
     their figures stay, drawn as quiet ink on the bright sky rather than as
     light. All twenty-seven, not the three brightest: a frame with a quarter
     of its marks missing is not a frame. */
  if(day>0.5&&layers.stars){
    drawAsterisms(c,W,0,dim,focusNak,day);
    for(const s of cache.stars){ if(!s.up) continue; const [x,y]=project(s); if(!onScreen(x,y,10)) continue;
      const big=s.m<=2.6;
      c.fillStyle=`rgba(255,252,244,${(big?0.5:0.34)*day*dim})`; c.beginPath(); c.arc(x,y,big?2.6:1.9,0,7); c.fill();
      c.fillStyle=`rgba(38,40,70,${(big?0.55:0.4)*day*dim})`; c.beginPath(); c.arc(x,y,big?1.3:0.95,0,7); c.fill(); }
  }

  /* --- the CELESTIAL RIBBON --- */
  const eclPts=cache.ecl.map(p=>{ const [x,y,z]=project(p); return {L:p.L,x,y,z,up:p.up}; });
  const bandW=Math.max(32,Math.min(96,6.4*ppd));         /* the rashi band: an engraved tape on the sphere */
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
      const a=(on?0.22:(s%2?0.05:0.032))*(layers.rashis?1:0.4)*(on?1:dim)*(1-0.15*day)+(day>0.5?0.012:0);
      c.lineCap="butt";
      c.beginPath(); let pen=false,last=null;
      for(const p of seg){ if(!Number.isFinite(p.x)||(last&&Math.hypot(p.x-last.x,p.y-last.y)>W*0.6)){pen=false;last=p;continue;}
        pen?c.lineTo(p.x,p.y):(c.moveTo(p.x,p.y),pen=true); last=p; }
      /* feathered edges: three strokes, wide and faint to narrow and full */
      c.strokeStyle=`rgba(194,155,78,${a*0.22})`; c.lineWidth=bandW*1.7; c.stroke();
      c.strokeStyle=`rgba(194,155,78,${a*0.45})`; c.lineWidth=bandW*1.28; c.stroke();
      c.strokeStyle=`rgba(194,155,78,${a})`;      c.lineWidth=bandW;      c.stroke();
    }
    ribbon(0.9,day>0.5?`rgba(120,96,50,${0.28*(0.6+0.4*dim)})`:`rgba(214,180,110,${0.3*(0.6+0.4*dim)})`);   /* the ecliptic line itself, quiet; ink in daylight */
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
    if(layers.rashis) for(let s=0;s<12;s++) tickAt(cache.ecl[s*15],bandW/2+2,0,day>0.5?`rgba(110,88,44,${0.34*dim})`:`rgba(214,180,110,${0.36*dim})`,1);
    if(layers.naks) for(let i=0;i<27;i++){ const e=cache.nakEdge[i]; if(!e.up&&mode!=="birth") continue;
      tickAt({...e,L:i*NSPAN},bandW/2,1,`rgba(160,150,214,${(focusNak===i||focusNak===i-1?0.85:0.28)*dim})`,0.9); }
    if(layers.naks&&vFov<30) for(let i=0;i<108;i++){ if(i%4===0) continue;
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
    c.save(); c.globalAlpha=(focusSign===s?0.42:(day>0.5?0.2:0.15))*dim; c.translate(m[0],m[1]);
    c.rotate(Math.atan2(e2[1]-e1[1],e2[0]-e1[0])); c.drawImage(img,-sz/2,-sz/2,sz,sz); c.restore();
  }

  /* --- labels: priority order, one ledger --- */
  const L=makeLedger();
  const sysF=(px,w)=>`${w||500} ${px}px -apple-system,system-ui,sans-serif`;
  const devF=px=>`600 ${px}px "Devanagari Sangam MN","Kohinoor Devanagari","Noto Sans Devanagari",-apple-system,system-ui,sans-serif`;
  /* graha discs claim first so no caption ever sits on a planet */
  const discs=cache.grahas.map(p=>{ const [x,y]=project(p);
    const R=grahaR(p.g,vFov), Re=Math.round(R*((GRAHA_BASE[p.g]?.extent||1.34)-0.34));   /* rings / corona reach */
    const vis=onScreen(x,y,60); if(vis) L.claim(x,y,2*Re+6,2*Re+6); return {p,x,y,R,Re,vis}; });
  const tgt=targetPos(); const tgtXY=tgt?project(tgt):null;
  if(tgtXY&&Number.isFinite(tgtXY[0])) L.claim(tgtXY[0],tgtXY[1],60,60);
  /* 1. the selected target label + 2. grahas */
  const grahaLabels=[];
  for(const {p,x,y,R,Re,vis} of discs){
    if(!vis||!layers.planets) continue;
    const isT=target&&target.t==="graha"&&target.g===p.g;
    if(!p.up&&!isT&&mode!=="birth") continue;
    const txt=p.g+(p.retro&&p.g!=="Rahu"&&p.g!=="Ketu"?" ℞":"");
    grahaLabels.push({p,x,y,R:Re,isT,txt});
  }
  grahaLabels.sort((a,b)=>(b.isT?1:0)-(a.isT?1:0));
  const drawnLabels=[];
  for(const g of grahaLabels){
    const font=sysF(g.isT?14.5:12.5,g.isT?700:600); c.font=font;
    const w=c.measureText(g.txt).width+4;
    const pos=L.place(g.x,g.y,w,15,[[0,g.R+19],[0,-g.R-18],[g.R+w/2+12,0],[-g.R-w/2-12,0]]);
    if(pos) drawnLabels.push({...g,font,pos,w});
  }
  /* 3 + 4. the tape is engraved: rashi glyph + name set into the upper
     lane, nakshatra names into the lower lane, both running along the
     band. Letterpress = a dark offset copy beneath a light copy. A
     sector too narrow for its text shows only the glyph, then nothing;
     the focused item always falls back to a floating caption. */
  const engrave=(txt,x,y,ang,font,light,alpha)=>{
    c.save(); c.translate(x,y); c.rotate(ang); c.font=font; c.textAlign="center"; c.textBaseline="middle";
    if(day>0.5){ /* daylight: ink pressed into the pale band, light relief above */
      c.fillStyle=`rgba(255,250,240,${0.55*alpha})`; c.fillText(txt,-0.6,-0.7);
      c.fillStyle=`rgba(58,46,24,${0.9*alpha})`; c.fillText(txt,0,0);
    } else {
      c.fillStyle=`rgba(18,14,8,${0.55*alpha})`; c.fillText(txt,0.7,0.9);
      c.fillStyle=light.replace(/[\d.]+\)$/,`${alpha})`); c.fillText(txt,0,0);
    }
    c.restore();
  };
  const laneAt=(mid,e1,e2)=>{               /* screen frame of a sector: centre, tangent angle, up-normal */
    const [x,y]=project(mid); const a=project(e1), b=project(e2);
    if(!onScreen(x,y,40)||!Number.isFinite(a[0])||!Number.isFinite(b[0])) return null;
    const wid=Math.hypot(b[0]-a[0],b[1]-a[1]); if(wid<1) return null;
    let ang=Math.atan2(b[1]-a[1],b[0]-a[0]); if(ang>Math.PI/2) ang-=Math.PI; else if(ang<-Math.PI/2) ang+=Math.PI;
    const nx=-Math.sin(ang), ny=Math.cos(ang);       /* perpendicular; ny>0 means screen-down */
    const ux=ny>0?-nx:nx, uy=ny>0?-ny:ny;            /* unit vector toward screen-up */
    return {x,y,wid,ang,ux,uy};
  };
  /* LOD by field of view: wide = Devanagari alone; medium adds the second line
     (English by default, Sanskrit when the layer is on); no glyph on the band */
  const midLOD=vFov<75;
  if(layers.rashis) for(let s=0;s<12;s++){
    const m=cache.rashiMid[s]; if(!m.up&&mode!=="birth"&&s!==focusSign) continue;
    const f=laneAt(m,cache.ecl[s*15],cache.ecl[s*15+15]); if(!f) continue;
    const on=s===focusSign, alpha=(on?1:0.86)*(on?1:dim);
    const big=on?19:Math.min(19,Math.max(13.5,bandW*0.3));
    const dev=SIGNS_DEV[s]; c.font=devF(big); const wDev=c.measureText(dev).width;
    const sub=layers.sanskrit?SIGNS_SK[s]:SIGNS_EN[s];
    const showSub=midLOD&&(on||f.wid>wDev+70);
    const px=f.x+f.ux*bandW*(showSub?0.31:0.24), py=f.y+f.uy*bandW*(showSub?0.31:0.24);
    if(f.wid>wDev+14&&L.place(px,py,Math.min(f.wid-8,wDev),big+4,[[0,0]])){
      engrave(dev,px,py,f.ang,devF(big),"rgba(241,231,201,1)",alpha);
      if(showSub){ const sx=f.x+f.ux*bandW*0.08, sy=f.y+f.uy*bandW*0.08;
        c.font=sysF(10,500); const wSub=c.measureText(sub).width;
        if(L.place(sx,sy,wSub,11,[[0,0]])) engrave(sub,sx,sy,f.ang,sysF(10,500),"rgba(224,206,160,1)",alpha*0.9); }
    } else if(on){                                        /* focused but cramped: floating caption */
      c.font=devF(17); const w=c.measureText(SIGNS_DEV[s]).width+6;
      const pos=L.place(f.x,f.y,w,20,[[0,-bandW/2-14],[0,bandW/2+16]]);
      if(pos) haloText(c,SIGNS_DEV[s],pos[0],pos[1],"rgba(241,231,201,1)",devF(17));
    }
  }
  const track=t=>t.toUpperCase().split("").join("\u2009");   /* letter-spaced small caps look */
  if(layers.naks) for(let i=0;i<27;i++){
    const on=i===focusNak; if(!midLOD&&!on) continue;
    /* below the horizon the name used to be dropped entirely. The grahas down
       there are drawn dimmed, not deleted, and the ring of names is the thing
       that makes the ground legible as sky-you-cannot-see-yet. */
    const m=cache.nakMid[i];
    const below=!m.up;
    const f=laneAt(m,cache.nakEdge[i],cache.nakEdge[(i+1)%27]); if(!f) continue;
    const txt=track(NAKS[i]);
    const px=f.x-f.ux*bandW*0.27, py=f.y-f.uy*bandW*0.27;
    const size=on?10.5:Math.min(9.5,Math.max(7.5,bandW*0.15));
    c.font=sysF(size,on?700:600); const w=c.measureText(txt).width;
    if(f.wid>w+12&&L.place(px,py,Math.min(f.wid-6,w),size+3,[[0,0]])){
      engrave(txt,px,py,f.ang,sysF(size,on?700:600),"rgba(196,188,236,1)",(on?1:0.8)*(on?1:dim)*(below?0.42:1));
    } else if(on){
      const anchors=[[0,bandW/2+14],[0,bandW/2+28],[0,-(bandW/2+14)],[w/2+30,bandW/2+14],[-(w/2+30),bandW/2+14]];
      const pos=L.place(f.x,f.y,w+4,12,anchors);
      if(pos) haloText(c,txt,pos[0],pos[1],"rgba(196,188,236,1)",sysF(10.5,700));
    }
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
    const ground=day>0.5?"light":"dark";
    const sunOK=sunD&&Number.isFinite(sunD.x)&&p.g!=="Sun";
    let light; if(sunOK){ const dx=sunD.x-x, dy=sunD.y-y, d=Math.hypot(dx,dy)||1; light={x:dx/d,y:dy/d}; }
    const q=(isT||R>=22)?"high":"low";
    if(p.g==="Moon"){
      const sun=cache.grahas[0]; const e=((p.L-sun.L)%360+360)%360, kk=(1-Math.cos(e*D2R))/2, waxing=e<180;
      /* the renderer lights a waxing Moon from +x: turn the frame so that side faces the Sun */
      const th=sunOK?Math.atan2(sunD.y-y,sunD.x-x):(waxing?0:Math.PI);
      c.save(); c.translate(x,y); c.rotate(waxing?th:th-Math.PI);
      drawGraha(c,"Moon",0,0,R,{phase:{illum:kk,waxing},quality:q,focus:isT,ground}); c.restore();
    } else {
      drawGraha(c,p.g,x,y,R,{light,quality:q,focus:isT,ground,tilt:22});
    }
    c.globalAlpha=1;
  }
  for(const g of drawnLabels){
    const a=(g.p.up?1:0.45)*(g.isT?1:(target?0.55+0.45*(1-focusK):1));
    if(day>0.5) haloText(c,g.txt,g.pos[0],g.pos[1],`rgba(22,20,40,${a})`,g.font,"center",`rgba(255,252,244,${0.8*a})`);
    else haloText(c,g.txt,g.pos[0],g.pos[1],`rgba(245,246,252,${a})`,g.font);
    if(g.isT){ /* one concise identification: rashi · nakshatra, under the name */
      const s=sgOf(g.p.L), n=nkOf(g.p.L); const sub=`${SIGNS_DEV[s]} ${layers.sanskrit?SIGNS_SK[s]:SIGNS_EN[s]} · ${NAKS[n]}`;
      c.font=devF(10.5); const w=c.measureText(sub).width+4; const below=g.pos[1]>g.y;
      const p2=L.place(g.pos[0],g.pos[1],w,13,[[0,below?15:-15]]);
      if(p2){ if(day>0.5) haloText(c,sub,p2[0],p2[1],`rgba(50,46,70,${a})`,devF(10.5),"center",`rgba(255,252,244,${0.7*a})`);
        else haloText(c,sub,p2[0],p2[1],`rgba(224,206,160,${a})`,devF(10.5)); }
    }
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
  if(tgt&&orr<0.5){
    const [x,y]=tgtXY;
    const inside=Number.isFinite(x)&&x>36&&x<W-36&&y>110&&y<H-150;
    if(inside){
      const rr=target.t==="graha"?grahaR(target.g,vFov):14;
      const tone=target.t==="graha"?(GRAHA_BASE[target.g]?.token||"241,231,201"):"241,231,201";
      const hg=c.createRadialGradient(x,y,rr*0.9,x,y,rr*2.6);
      hg.addColorStop(0,`rgba(${tone},${day>0.5?0.10:0.22})`); hg.addColorStop(1,`rgba(${tone},0)`);
      c.fillStyle=hg; c.beginPath(); c.arc(x,y,rr*2.6,0,7); c.fill();
      c.strokeStyle=day>0.5?"rgba(40,36,60,.55)":"rgba(241,231,201,.6)"; c.lineWidth=1.2; c.beginPath(); c.arc(x,y,rr+7,0,7); c.stroke();
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
      c.font=sysF(11.5,600); const lw=c.measureText(lbl).width/2+10;
      haloText(c,lbl,Math.max(lw,Math.min(W-lw,ex)),ey+(Math.sin(ang)>0?-22:24),"rgba(241,231,201,.95)",sysF(11.5,600));
    }
  }
  if(orr>0.002) drawOrrery(c,W,H,orr,{grahas:cache.grahas,ecl:cache.ecl,sunAlt:cache.sunAlt,sunAz:cache.grahas[0].az,asc:(mode==="birth"&&birthOpts&&birthOpts.asc!=null)?birthOpts.asc:null,
    spot:cache.sp,layers,target,reduced,now,mode,spin:orrSpin,pitch:orrPitch,names:{SIGNS_DEV,SIGNS_EN,SIGNS_SK,NAKS},padBottom:target&&el.root.classList.contains("hascard")?330:150});
  { const cp=el.root.querySelector("#svcompass"); if(cp&&!cp.hidden){ const g=cp.querySelector(".skrose");
      if(g) g.setAttribute("transform",`rotate(${wrap(-viewAz).toFixed(1)} 24 24)`); } }
  /* accessibility: one sentence describing the view */
  if(now-(el._ariaAt||0)>1500){ el._ariaAt=now;
    { const ul=el.root.querySelector("#svlist"); if(ul){ const html=cache.grahas.map(g=>{ const s=sgOf(g.L), n2=nkOf(g.L);
        return `<li><button data-g="${g.g}" aria-pressed="${target?.t==="graha"&&target.g===g.g}">${g.g}${g.retro&&g.g!=="Rahu"&&g.g!=="Ketu"?" retrograde":""}, ${SIGNS_EN[s]}, ${NAKS[n2]}, ${g.up?Math.round(g.alt)+" degrees up":"below the horizon"}</button></li>`; }).join("");
      if(ul._html!==html){ ul._html=html; ul.innerHTML=html; } } }
    const dir=["north","north-east","east","south-east","south","south-west","west","north-west"][Math.round((((viewAz%360)+360)%360)/45)%8];
    const vis=discs.filter(d=>d.vis&&d.p.up).map(d=>d.p.g);
    el.canvas.setAttribute("aria-label",orr>0.5?`The zodiac ring seen from above the Earth. ${cache.grahas.map(g=>g.g+" in "+SIGNS_EN[sgOf(g.L)]).join(", ")}.${target?" Selected: "+target.label+".":""}`:`Looking ${dir}, ${Math.round(viewAlt)} degrees up. ${vis.length?vis.join(", ")+" visible.":"No graha in view."}${target?" Selected: "+target.label+".":""}`); }
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
    /* the peek sheet (§20-21): most of the sky stays visible; meaning first, one primary action */
    const sentence=String(meaning||"").replace(/&#8212;/g,"—").split(/(?<=[.!?])\s/)[0];
    f.innerHTML=`<div class="skcard peek">
      <div class="skcardrow">
        <div class="skart" id="skart" aria-hidden="true"></div>
        <div class="skmain">
          <b>${g}${p.retro&&g!=="Rahu"&&g!=="Ketu"?' <i class="skretro">℞</i>':""}</b>
          <span class="skline"><span class="dev">${SIGNS_DEV[sg]}</span> ${layers.sanskrit?SIGNS_SK[sg]:SIGNS_EN[sg]} · ${NAKS[nk]}${house?` · your ${house}${["st","nd","rd"][house-1]||"th"}`:""}${p.up?"":" · below the horizon"}</span>
        </div>
        <button class="skx" id="svclear" aria-label="Clear selection">✕</button>
      </div>
      <p class="skmeaning">${sentence}</p>
      <div class="skacts">
        <button class="skact solid" id="svexplore" aria-label="See more about ${g}">See more</button>
        <button class="skact${trackTarget?" on":""}" id="svtrackb">${trackTarget?"Tracking":"Track"}</button>
      </div>
    </div>`;
    /* the art in the card is the same dimensional object as in the sky */
    try{ const art=document.getElementById("skart"); const c=grahaSprite(g,44,{ground:"dark",quality:"high",tilt:22}); art.appendChild(c); }catch(_){}
    document.getElementById("svexplore").onclick=()=>{
      const pt=targetPos(); const [x,y]=pt?project(pt):[NaN,NaN];
      const origin=Number.isFinite(x)?{x,y,r:grahaR(g,vFov)}:null;
      buzz(8);
      dispatchEvent(new CustomEvent("astra:open",{detail:{kind:"planet",id:g,mode:mode==="birth"?"birth":"now",at:skyDate().toISOString(),from:"sky",emphasis:mode==="birth"?"birth":"now",origin}})); };
    document.getElementById("svtrackb").onclick=()=>{ trackTarget=!trackTarget; setFoot(); buzz(5); if(trackTarget) aimAt(targetPos(),{below:true}); };
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
        <button class="skact solid" id="svexplore" aria-label="See more about ${SIGNS_EN[s]}">See more</button>
      </div></div>`;
    f.querySelectorAll("[data-pick]").forEach(b=>b.onclick=()=>selectTarget({t:"graha",g:b.dataset.pick,label:b.dataset.pick}));
    document.getElementById("svexplore").onclick=()=>{ const m=project(cache.rashiMid[s]); const origin=Number.isFinite(m[0])?{x:m[0],y:m[1],r:28}:null; buzz(8);
      dispatchEvent(new CustomEvent("astra:open",{detail:{kind:"rashi",id:s+1,mode:mode==="birth"?"birth":"now",at:skyDate().toISOString(),from:"sky",emphasis:mode==="birth"?"birth":"now",origin}})); };
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
        <button class="skact solid" id="svexplore" aria-label="See more about ${r.name}">See more</button>
      </div></div>`;
    f.querySelectorAll("[data-pick]").forEach(b=>b.onclick=()=>selectTarget({t:"graha",g:b.dataset.pick,label:b.dataset.pick}));
    document.getElementById("svexplore").onclick=()=>{ const m=project(cache.nakMid[i]); const origin=Number.isFinite(m[0])?{x:m[0],y:m[1],r:24}:null; buzz(8);
      dispatchEvent(new CustomEvent("astra:open",{detail:{kind:"nakshatra",id:i,mode:mode==="birth"?"birth":"now",at:skyDate().toISOString(),from:"sky",emphasis:mode==="birth"?"birth":"now",origin}})); };
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
  measureCard();
}
/* The seeker's touch strip is 48px wide down the right edge, and the card can
   be over 400px tall — so the strip lay across the card's own close button and
   swallowed every tap on it. The seeker now clears the card by the card's
   measured height, and sits behind it in the stack besides. */
function measureCard(){
  const f=document.getElementById("svfoot"); if(!f||!el) return;
  const set=()=>{ const card=f.querySelector(".skcard");
    el.root.style.setProperty("--cardh", card?`${Math.round(card.getBoundingClientRect().height)}px`:"0px"); };
  set();                       /* the card is in the DOM already; measure it now */
  requestAnimationFrame(set);  /* and again once its entry animation has laid out */
}
function clearTarget(){ target=null; trackTarget=false; ghostBirth=false; cache=null; setFoot(); syncFind(); }

/* ====================================================================
   AIM / SEARCH / FIND
   ==================================================================== */
function aimAt(p,opts={}){
  if(!p) return;
  const detachedOrNoSensors=!(sensing&&followSky);
  if(!detachedOrNoSensors&&!opts.force) return;
  /* The floor of six degrees stops a plain "show me Saturn" from pointing at
     the dirt. But while TRACKING through time, following a graha down past
     the horizon is the entire point — Sangram: "when it goes below the Earth,
     then it stops tracking it." It stopped because the aim was clamped to six
     and stayed there. Tracking now follows it down, and turns the ground to
     glass on the way so there is something to see. */
  const floor=opts.below?-50:6;
  if(opts.below&&p.alt<0&&!revealBelow){ revealBelow=true; syncFind(); }
  wantAz=p.az; wantAlt=clampAlt(Math.max(floor,Math.min(66,p.alt)));
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
let INDEX=null, searchCat=null;
const CATS=[["graha","Planets","the nine grahas"],["rashi","Rashis","twelve signs of the zodiac"],["nakshatra","Nakshatras","twenty-seven lunar mansions"],["lagna","Lagna","the rising point at birth"],["star","Stars","the bright yogataras"]];
function hitLabel(h){
  if(h.t==="rashi") return `<b class="dev">${SIGNS_DEV[h.i]}</b><span class="sub">${SIGNS_SK[h.i]} · ${SIGNS_EN[h.i]}</span>`;
  if(h.t==="nakshatra"&&h.kind==="nakshatra"){ const r=nakshatraRange(h.i), s0=r.signs[0], s1=r.signs[r.signs.length-1];
    return `<b>${NAKS[h.i]}</b><span class="sub">${SIGNS_EN[s0-1]}${s1!==s0?` – ${SIGNS_EN[s1-1]}`:""}</span>`; }
  if(h.t==="graha") return `<b>${h.g}</b><span class="sub">${GRAHA_SK[h.g]}</span>`;
  return `<b>${h.label}</b><span class="sub">${h.kind}</span>`;
}
function renderSearch(q){
  const res=document.getElementById("svres"); if(!res) return; q=(q||"").trim().toLowerCase();
  INDEX=buildIndex();
  const bind=(hits)=>{ res.querySelectorAll(".svhit").forEach((b,i)=>b.onclick=()=>{ selectTarget(hits[i]); document.getElementById("svsearch").hidden=true; }); };
  if(q){
    const hits=INDEX.filter(it=>it.keys.some(k=>k.startsWith(q)))
      .concat(INDEX.filter(it=>it.keys.some(k=>!k.startsWith(q)&&k.includes(q)))).slice(0,12);
    res.innerHTML=hits.length?hits.map(h=>`<button class="svhit">${hitLabel(h)}</button>`).join(""):`<p class="svnone">Nothing in the sky by that name.</p>`;
    bind(hits); return;
  }
  if(!searchCat){
    const avail=CATS.filter(([k])=>INDEX.some(it=>it.kind===k));
    res.innerHTML=`<p class="skseyebrow">Find in the sky</p><div class="skcats">${avail.map(([k,l,n])=>`<button class="skcat" data-c="${k}"><i class="ci ${k}"></i><span><b>${l}</b><small>${n}</small></span><em>›</em></button>`).join("")}</div>`;
    res.querySelectorAll(".skcat").forEach(b=>b.onclick=()=>{ searchCat=b.dataset.c; buzz(4); renderSearch(""); });
    return;
  }
  const hits=INDEX.filter(it=>it.kind===searchCat);
  const title=(CATS.find(([k])=>k===searchCat)||[])[1]||"";
  res.innerHTML=`<button class="skcatback" id="svcatback">‹ ${title}</button><div class="skcatlist">${hits.map(h=>`<button class="svhit">${hitLabel(h)}</button>`).join("")}</div>`;
  res.querySelector("#svcatback").onclick=()=>{ searchCat=null; renderSearch(""); };
  bind(hits);
}
const runSearch=renderSearch;
function selectTarget(hit){
  if(hit.t==="asc"&&mode!=="birth"){ setSkyMode("birth"); }
  revealBelow=false;
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
  const below=!p.up&&target.t!=="asc";
  fb.innerHTML=below
    ?`<button class="skpill solid" id="svreveal">${revealBelow?"Hide the ground":"Show below horizon"}</button>${sensing?`<button class="skpill" id="svtrackp">Track with phone</button>`:""}`
    :`<button class="skpill solid" id="svgo">Take me there</button>${sensing?`<button class="skpill" id="svtrackp">Track with phone</button>`:""}`;
  const go=fb.querySelector("#svgo"); if(go) go.onclick=()=>{ aimAt(targetPos(),{force:true}); buzz(6); };
  const rv=fb.querySelector("#svreveal"); if(rv) rv.onclick=()=>{ revealBelow=!revealBelow; if(revealBelow){ followSky=false; aimAt(targetPos(),{force:true}); } buzz(6); syncFind(); syncRecenter(); };
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
    w.innerHTML=`<span>${esc(t)} · ${esc(dd)} · ${esc(custom.place.split(",")[0])}</span><b class="skreturn">\u21ba Now</b>`;
    w.dataset.act="live";
  }else if(seek){
    w.innerHTML=`<span>${esc(t)} · ${esc(dd)} · ${esc(placeName())}</span><b class="skreturn">\u21ba Now</b>`;
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
function toast(msg){ if(QUIET) return;
  const t=el.root.querySelector("#sktoast"); if(!t) return;
  t.textContent=msg; t.hidden=false; t.classList.remove("in"); void t.offsetWidth; t.classList.add("in");
  clearTimeout(toastT); toastT=setTimeout(()=>{ t.classList.remove("in"); setTimeout(()=>t.hidden=true,350); },2600);
}

/* ====================================================================
   VERTICAL TIME SEEKER — the signature interaction
   ==================================================================== */
let seekActive=false, seekLastHour=null, seekLastSign=null, seekLastNak=null, seekEvents=null;
function anchorDate(){ return mode==="birth"?new Date(birthOpts.date):custom?new Date(custom.iso):new Date(); }
/* Moon rise/set for the civil day: altitude sign changes, bisected to the minute */
function moonTimes(d,lat,lon){
  const day0=new Date(d); day0.setHours(0,0,0,0);
  const altAt=t=>siderealPointAltAzB(positions(new Date(t)).Moon, eclipticLatitudes(new Date(t)).Moon, new Date(t), lat, lon).alt;
  let rise=null,set=null, prev=altAt(day0.getTime());
  for(let t=day0.getTime()+15*60e3;t<=day0.getTime()+864e5;t+=15*60e3){
    const a=altAt(t);
    if(prev<0&&a>=0||prev>=0&&a<0){ let lo=t-15*60e3, hi=t; for(let i=0;i<10;i++){ const m=(lo+hi)/2; ((altAt(m)>=0)===(a>=0))?hi=m:lo=m; }
      if(a>=0) rise=rise||new Date((lo+hi)/2); else set=set||new Date((lo+hi)/2); }
    prev=a;
  }
  return {rise,set};
}
function buildSeeker(){
  const s=el.root.querySelector("#svseek"); if(!s) return;
  const d=skyDate(), sp=skySpot(), tz=skyTz();
  const st=sunTimes(d,sp.lat,sp.lon);
  let mt={rise:null,set:null}; try{ mt=moonTimes(d,sp.lat,sp.lon); }catch(_){}
  seekEvents={rise:st.rise,set:st.set,mrise:mt.rise,mset:mt.set,anchor:anchorDate()};
  paintSeeker();
}
function paintSeeker(){
  const s=el.root.querySelector("#svseek"); if(!s) return;
  const d=skyDate(), tz=skyTz();
  const off=offsetAtTz(tz||Intl.DateTimeFormat().resolvedOptions().timeZone,d.getTime());
  const chip=s.querySelector(".skseekchip");
  const knob=s.querySelector(".skseekknob");
  const rl=s.querySelector(".skseekrule");
  if(orrTime()){
    /* a year centred on the moment the Earth came into view */
    const base=orrBase||d.getTime(), start=base-YEAR_MS/2;
    const f=Math.max(0,Math.min(1,(d.getTime()-start)/YEAR_MS));
    if(chip) chip.textContent=fmtLocal(d,tz,{day:"numeric",month:"short",year:"numeric"});
    if(knob) knob.style.top=(f*100).toFixed(2)+"%";
    if(rl){
      let out="";
      for(let i=0;i<=4;i++){ const t=new Date(start+i*YEAR_MS/4);
        out+=`<span style="top:${(i*25).toFixed(2)}%">${t.toLocaleDateString("en-GB",{month:"short",year:"2-digit"})}</span>`; }
      const af=(base-start)/YEAR_MS;
      out+=`<i class="sknow" style="top:${(af*100).toFixed(2)}%"></i>`;
      rl.innerHTML=out;
    }
    s.dataset.day=fmtLocal(d,tz,{year:"numeric"});
    return;
  }
  const localMs=d.getTime()+off; const dayStart=localMs-((localMs%864e5)+864e5)%864e5; /* local midnight */
  const frac=(localMs-dayStart)/864e5;
  if(chip) chip.textContent=fmtLocal(d,tz,{hour:"numeric",minute:"2-digit"});
  if(knob) knob.style.top=(frac*100).toFixed(2)+"%";
  if(!rl) return;
  const mark=(dd,cls,txt)=>{ if(!dd) return ""; const f=((dd.getTime()+off)-dayStart)/864e5; if(f<0||f>1) return "";
    return `<i class="${cls}" style="top:${(f*100).toFixed(2)}%">${txt||""}</i>`; };
  rl.innerHTML=[0,3,6,9,12,15,18,21,24].map(h=>`<span style="top:${(h/24*100).toFixed(2)}%">${h===0?"12 AM":h===12?"12 PM":h===24?"12 AM":h<12?h+" AM":(h-12)+" PM"}</span>`).join("")
    +mark(seekEvents?.rise,"sksun","☀")+mark(seekEvents?.set,"sksun","☀")
    +mark(seekEvents?.mrise,"skmoonm","☾")+mark(seekEvents?.mset,"skmoonm","☾")
    +(mode==="birth"?mark(new Date(birthOpts.date),"skbirth"):mark(new Date(),"sknow"));
  s.dataset.day=fmtLocal(d,tz,{day:"numeric",month:"short"});
}
function seekTo(ms){
  const dNew=new Date(ms);
  if(mode==="birth") birthSeek=dNew; else seek=dNew;
  const prevSel=target&&target.t==="graha"?cache.grahas.find(x=>x.g===target.g):null;
  cache=null; computeSky();
  /* haptics: hour, sunrise/sunset, the anchor, and the selected graha's sign/nakshatra edges */
  const tz=skyTz(); const unit=orrTime()?864e5*7:36e5;   /* a tick per week when a year is in hand */
  const hr=Math.floor((ms+offsetAtTz(tz||Intl.DateTimeFormat().resolvedOptions().timeZone,ms))/unit);
  if(seekLastHour!==null&&hr!==seekLastHour) buzz(3);
  seekLastHour=hr;
  const crossed=(t)=>t&&prevSeekMs!=null&&((prevSeekMs<t.getTime())!==(ms<t.getTime()));
  if(crossed(seekEvents?.rise)||crossed(seekEvents?.set)||crossed(seekEvents?.anchor)) buzz(9);
  else if(crossed(seekEvents?.mrise)||crossed(seekEvents?.mset)) buzz(6);
  if(prevSel){ const nowSel=cache.grahas.find(x=>x.g===target.g);
    const s0=sgOf(prevSel.L), s1=sgOf(nowSel.L), n0=nkOf(prevSel.L), n1=nkOf(nowSel.L);
    if(s0!==s1){ buzz(8); toast(`${target.g} entered ${SIGNS_EN[s1]}`); }
    else if(n0!==n1&&(target.g==="Moon"||vFov<45)){ buzz(4); toast(`${target.g} entered ${NAKS[n1]}`); }
    if((prevSel.alt>0)!==(nowSel.alt>0)) buzz(6);
    if(trackTarget) aimAt(nowSel,{force:true,instant:true,below:true}); }
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
    const ms=startMs+(dy/H())*seekSpan();  /* down = later, like reading top to bottom */
    if(orrTime()){ seekTargetMs=Math.round(ms/864e5)*864e5; return; }   /* the chase walks there */
    seekTo(Math.round(ms/60000)*60000); });
  const end=e=>{ if(!dragging) return; dragging=false; clearTimeout(holdT); setTimeout(()=>expand(false),900); };
  s.addEventListener("pointerup",end); s.addEventListener("pointercancel",end);
  s.addEventListener("keydown",e=>{ const step=e.shiftKey?60:15; let ms=skyDate().getTime();
    if(e.key==="ArrowDown"){ ms+=step*60000; } else if(e.key==="ArrowUp"){ ms-=step*60000; } else return;
    e.preventDefault(); prevSeekMs=skyDate().getTime(); seekTo(ms); });
}
function returnToAnchor(){ if(mode==="birth") birthSeek=null; else { seek=null; custom=custom&&custom.fromLink?null:custom; }
  cache=null; computeSky(); fmtMoment(); paintSeeker(); setFoot(); buzz(7); }

/* ====================================================================
   LAYERS SHEET
   ==================================================================== */
const PRESETS={essential:{planets:true,rashis:true,naks:true,art:false,horizon:true,stars:false,starNames:false},
  jyotish:{planets:true,rashis:true,naks:true,art:true,horizon:true,stars:true,starNames:false},
  sky:{planets:true,rashis:true,naks:false,art:false,horizon:true,stars:true,starNames:true}};
const PRESET_LABEL={essential:"Essential",jyotish:"Jyotish",sky:"Sky"};
let layersCustom=false;
function paintLayers(){
  const sh=el.root.querySelector("#svlayers"); if(!sh) return;
  const row=(k,label,note)=>`<div class="sklrow"><div><b>${label}</b>${note?`<span>${note}</span>`:""}</div>
    <button class="switch${layers[k]?" on":""}" data-l="${k}" role="switch" aria-checked="${layers[k]}"><i></i></button></div>`;
  const preset=Object.entries(PRESETS).find(([,val])=>Object.keys(val).every(kk=>val[kk]===layers[kk]))?.[0]||"";
  sh.innerHTML=`<div class="sklhead"><b>Layers</b><button class="skx" id="svlclose" aria-label="Close">✕</button></div>
    <div class="sklpre" role="tablist">${Object.keys(PRESETS).map(kk=>`<button data-p="${kk}" role="tab" aria-selected="${preset===kk}" class="${preset===kk?"on":""}">${PRESET_LABEL[kk]}</button>`).join("")}</div>
    <p class="sklnote">${preset==="essential"?"Planets, rashis, nakshatras and the horizon.":preset==="jyotish"?"Adds the rashi artwork and a quiet field of stars.":preset==="sky"?"The physical sky: stars and their names, the zodiac kept light.":"Your own mix."}</p>
    <button class="sklcust" id="svlcust" aria-expanded="${layersCustom}">Customize <span>${layersCustom?"▴":"▾"}</span></button>
    <div class="sklrows" ${layersCustom?"":"hidden"}>
    ${row("planets","Planets")}${row("rashis","Rashis","the twelve regions of the ribbon")}${row("naks","Nakshatras","twenty-seven finer sectors")}
    ${row("art","Rashi artwork","symbolic figures — not constellation boundaries")}${row("horizon","Horizon")}${row("stars","Stars","atmosphere, unlabelled")}
    ${row("starNames","Star names","the bright yogataras")}${row("sanskrit","Sanskrit names","Kanya instead of Virgo under the Devanagari")}</div>`;
  sh.onclick=e=>{
    const sw=e.target.closest("[data-l]"); if(sw){ layers[sw.dataset.l]=!layers[sw.dataset.l]; saveLayers(); paintLayers(); buzz(4); return; }
    const pr=e.target.closest("[data-p]"); if(pr){ layers={...layers,...PRESETS[pr.dataset.p]}; saveLayers(); paintLayers(); buzz(5); return; }
    if(e.target.closest("#svlcust")){ layersCustom=!layersCustom; paintLayers(); return; }
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
  /* THE ZENITH SNAP. Compass heading is a rotation ABOUT the vertical, so it
     stops meaning anything as the phone points at the sky — the raw reading
     wanders and can flip by half a turn. The old guard froze the azimuth above
     78 degrees, which removed the wander but not the snap: coming back down,
     the view teleported to whatever heading had accumulated while it was
     frozen, and the chase took the short way round as a fast spin.

     So the heading is TRUSTED PROPORTIONALLY instead. Full weight below 58
     degrees, none at 80, eased between — and never more than a few degrees
     from one sample, so a single bad reading cannot turn the sky. Looking
     straight up the view simply holds still, and lowering the phone eases
     back onto the true heading rather than jumping to it. */
  const trust=1-Math.min(1,Math.max(0,(Math.abs(altm)-58)/22));
  if(trust>0.001){
    const next=((azm+azOff)%360+360)%360;
    const step=wrap(next-wantAz)*trust;
    wantAz=((wantAz+Math.max(-9,Math.min(9,step)))%360+360)%360;
  }
  wantAlt=Math.max(-60,Math.min(82,altm));
  const fb=el?.root.querySelector("#svrecenter"); if(fb) fb.hidden=true;
}
function armSensors(){ if(watch) return; watch=onOrient;
  addEventListener("deviceorientationabsolute",watch); addEventListener("deviceorientation",watch); }
let compassShown=false;
function syncLoc(){
  const b=el?.root.querySelector("#svlocb"); if(!b) return;
  const st=!(sensing&&followSky)?"off":(compassShown?"compass":"on");
  b.dataset.state=st;
  b.setAttribute("aria-label",st==="off"?(sensing?"Recenter on my phone":"Follow my phone"):st==="on"?"Show the compass":"Hide the compass");
  const cp=el.root.querySelector("#svcompass"); if(cp) cp.hidden=!compassShown;
  const rc=el.root.querySelector("#svrecenter"); if(rc) rc.hidden=true;
}
const syncRecenter=syncLoc;
/* turn to face north: azimuth to 0, pitch eased back to where the horizon is on screen.
   Detaches from the phone first — otherwise the next sensor frame would snap the view back. */
function faceNorth(){
  buzz(8); followSky=false;
  wantAz=0; wantAlt=clampAlt(Math.max(-4,Math.min(48,viewAlt)));
  if(reduced){ viewAz=wantAz; viewAlt=wantAlt; }
  syncLoc(); wakeUI();
}
function locTap(){
  buzz(7);
  const canAsk=typeof DeviceOrientationEvent!=="undefined"&&typeof DeviceOrientationEvent.requestPermission==="function";
  if(!sensing){
    if(canAsk){ DeviceOrientationEvent.requestPermission().then(r=>{ if(r==="granted"){ armSensors(); followSky=true; syncLoc(); }
      else toast("Motion access is off — allow it in Settings › Safari › Motion & Orientation."); }).catch(()=>{}); return; }
    armSensors(); followSky=true;
    if(!sensing){ /* no sensors at all: look east, the sky's natural front */ wantAz=90; wantAlt=Math.max(wantAlt,14); toast("No motion sensors — drag to explore"); }
    syncLoc(); return;
  }
  if(!followSky){ followSky=true; compassShown=false; syncLoc(); return; }
  compassShown=!compassShown; syncLoc();
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
  const seq=[["move","Move your phone to look around"],["pinch","Pinch to zoom · keep pinching in to see the Earth"],["time","Drag the time bar to move the sky"]]
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
  QUIET=!!opts.quiet; ART_PENDING=!!opts.artPending;
  loadLayers(); loadRashiArt();
  if(opts.lat!=null) spot={lat:opts.lat,lon:opts.lon,from:opts.from||"your location",tz:opts.tz||Intl.DateTimeFormat().resolvedOptions().timeZone};
  birthOpts=opts.birth||null; proUser=!!opts.pro;
  mode="now"; custom=null; seek=null; birthSeek=null; followSky=true; target=null; ghostBirth=false; trackTarget=false; tween=null;
  if(opts.at){ const d=new Date(opts.at); if(!isNaN(d)&&Math.abs(d-Date.now())>60000){
    custom={iso:d.toISOString(),lat:spot.lat,lon:spot.lon,off:-d.getTimezoneOffset()/60,tz:spot.tz,place:placeName(),fromLink:true}; } }
  if(!el){
    const n=document.createElement("div"); n.className="skyview sky2"; n.id="skyview";
    n.innerHTML=`<canvas id="svc" role="img" aria-label="The sky"></canvas>
      <ul class="svlist" id="svlist" aria-label="Objects in view"></ul>
      <div class="sktop">
        <div class="svseg" id="svseg" role="tablist" aria-label="Which sky" hidden>
          <button data-m="birth" role="tab" aria-selected="false">Birth</button>
          <button data-m="now" class="on" role="tab" aria-selected="true">Now</button>
        </div>
        <button class="skcap" id="svcap" aria-label="Viewing moment"></button>
      </div>
      <button class="svclose" aria-label="Close">✕</button>
      <button class="skcompass" id="svcompass" hidden aria-label="Compass — tap to face north">
        <svg viewBox="0 0 48 48" aria-hidden="true"><g class="skrose">${ROSE}<path class="sknpt" d="M24 5.4l3.3 6.4h-6.6z"/></g></svg><span>N</span></button>
      <div class="skstack" id="svstack">
        <button class="skstk" id="svsearchb" aria-label="Search the sky"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16.5 16.5l4 4"/></svg></button>
        <button class="skstk" id="svlayersb" aria-label="Layers"><svg viewBox="0 0 24 24"><path d="M12 4l9 5-9 5-9-5 9-5z"/><path d="M3 14l9 5 9-5"/></svg></button>
        <button class="skstk skloc" id="svlocb" aria-label="Follow my phone" data-state="off"><svg viewBox="0 0 24 24"><path class="beam" d="M12 3.3v3.3"/><path class="arrowN" d="M12 8.5L17 20.4L12 17.1L7 20.4Z"/><path class="arrow" d="M20.5 3.5L3.5 11l8 2 2 8z"/></svg></button>
      </div>
      <div class="skseek" id="svseek" role="slider" tabindex="0" aria-label="Time of day" aria-valuetext="">
        <div class="skseekchip"></div>
        <div class="skseektrack"><div class="skseekrule"></div><div class="skseekknob"></div></div>
      </div>
      <div class="sksearch" id="svsearch" hidden role="dialog" aria-label="Search the sky">
        <div class="skshead">
          <div class="sksfield"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16.5 16.5l4 4"/></svg>
            <input id="svq" type="search" placeholder="Search the sky" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></div>
          <button class="skx" id="svsclose" aria-label="Close">✕</button>
        </div>
        <div class="svres" id="svres"></div>
      </div>
      <div class="sklayers" id="svlayers" hidden></div>
      <div class="skfind" id="svfind" hidden></div>
      <button class="skpill" id="svrecenter" hidden>⌖ Recenter</button>
      <button class="skpill" id="svmotion" hidden>Follow my phone</button>
      <div class="sktoast" id="sktoast" hidden></div>
      <div class="svedit" id="svedit" hidden>
        <div class="svquick" id="svquick"><button data-q="now">Now</button><button data-q="birth">Birth</button></div>
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
    addEventListener("popstate",()=>{ if(running&&!(history.state&&history.state.sky)) closeSkyView(); });
    addEventListener("keydown",e=>{ if(e.key==="Escape"&&running) n.querySelector(".svclose").click(); });
    n.querySelector("#svsearchb").onclick=()=>{ const s=n.querySelector("#svsearch"); s.hidden=!s.hidden; searchCat=null; if(!s.hidden){ renderSearch(""); } n.querySelector("#svlayers").hidden=true; wakeUI(); };
    n.querySelector("#svsclose").onclick=()=>{ n.querySelector("#svsearch").hidden=true; };
    n.querySelector("#svlocb").onclick=()=>{ locTap(); };
    n.querySelector("#svcompass").onclick=()=>{ faceNorth(); };
    n.querySelector("#svquick").onclick=e=>{ const b=e.target.closest("[data-q]"); if(!b) return; buzz(6);
      n.querySelector("#svedit").hidden=true;
      if(b.dataset.q==="now"){ custom=null; seek=null; birthSeek=null; if(mode!=="now") setSkyMode("now"); else { cache=null; computeSky(); fmtMoment(); buildSeeker(); } }
      else if(birthOpts){ if(mode!=="birth") setSkyMode("birth"); else { birthSeek=null; cache=null; computeSky(); fmtMoment(); buildSeeker(); } } };
    n.querySelector("#svlayersb").onclick=()=>{ const s=n.querySelector("#svlayers"); s.hidden=!s.hidden; if(!s.hidden) paintLayers(); n.querySelector("#svsearch").hidden=true; wakeUI(); };
    const q=n.querySelector("#svq"); q.oninput=()=>renderSearch(q.value);
    q.onkeydown=e=>{ if(e.key==="Enter"){ const first=n.querySelector(".svhit"); if(first) first.click(); } };
    n.querySelector("#svcap").onclick=e=>{
      if(e.target.closest(".skreturn")){ returnToAnchor(); wakeUI(); return; }   /* the return chip */
      openEditor(); wakeUI(); };
    n.querySelector("#svcancel").onclick=()=>{ n.querySelector("#svedit").hidden=true; };
    n.querySelector("#svapply").onclick=applyMoment;
    n.querySelector("#svp").oninput=e=>paintPlist(e.target.value);
    n.querySelector("#svp").onkeydown=e=>{ if(e.key==="Enter"){ const f=n.querySelector(".svpitem"); if(f) f.click(); } };
    n.querySelector("#svlist").onclick=e=>{ const b=e.target.closest("[data-g]"); if(!b) return; const g=b.dataset.g;
      target={t:"graha",g,label:g,kind:"graha",seen:false}; ghostBirth=false; cache=null; computeSky(); setFoot(); syncFind(); aimAt(targetPos(),{force:true}); buzz(6); };
    n.querySelector("#svrecenter").onclick=()=>{ followSky=true; if(wantOrr>0){ wantOrr=0; vFov=FOV_MAX; } syncRecenter(); buzz(8); wakeUI(); };
    wireSeeker();
    /* gestures: one finger drags (detaches motion), two fingers pinch the field of view, tap selects */
    const ptrs=new Map(); let moved=0, pinch0=null;
    n.addEventListener("pointerdown",e=>{
      if(e.target.closest(".sktop,.svclose,.skside,.skstack,.skcompass,.skseek,.sksearch,.sklayers,.skfind,.skpill,.svedit,.skfoot")) return;
      ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY}); moved=0;
      if(ptrs.size===2){ const [a,b]=[...ptrs.values()]; pinch0={d:Math.hypot(a.x-b.x,a.y-b.y),z:zoomOf()}; }
      wakeUI(); });
    n.addEventListener("pointermove",e=>{
      if(!ptrs.has(e.pointerId)) return;
      const prev=ptrs.get(e.pointerId); ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(ptrs.size===2&&pinch0){ const [a,b]=[...ptrs.values()]; const d=Math.hypot(a.x-b.x,a.y-b.y);
        setZoom(pinch0.z*pinch0.d/Math.max(20,d)); return; }
      const dx=e.clientX-prev.x, dy=e.clientY-prev.y; moved+=Math.abs(dx)+Math.abs(dy);
      if(moved>10&&sensing&&followSky){ followSky=false; syncRecenter(); }
      if(orr>0.25){ wantSpin-=dx*0.30; wantPitch=Math.max(-62,Math.min(78,wantPitch+dy*0.17)); return; }
      /* a sideways drag has to turn MORE than dx/F when the camera is pitched: the screen
         foreshortens azimuth by cos(alt). Without this the sky slid under the finger. */
      const F=CAM.F||1, cA=Math.max(0.35,Math.cos(viewAlt*D2R));
      wantAz-=dx/(F*cA)/D2R; wantAlt=clampAlt(wantAlt+dy/F/D2R);
      if(reduced){ viewAz=wantAz; viewAlt=wantAlt; } });
    const up=e=>{ const was=ptrs.has(e.pointerId); ptrs.delete(e.pointerId); if(ptrs.size<2) pinch0=null;
      if(!was||moved>10||!cache||e.type==="pointercancel") return;
      const r=el.canvas.getBoundingClientRect(); const cx=e.clientX-r.left, cy=e.clientY-r.top;
      hitTest(cx,cy); };
    n.addEventListener("pointerup",up); n.addEventListener("pointercancel",up);
    n.addEventListener("dblclick",e=>{ if(e.target.closest(".sktop,.skside,.skseek,.skfoot,.skcard")) return;
      if(wantOrr>0){ wantSpin=0; wantPitch=0; wantOrr=0; vFov=FOV_MAX; buzz(6); return; }
      const tp=target&&targetPos(); if(tp){ aimAt(tp,{force:true}); vFov=Math.max(FOV_MIN,Math.min(vFov,40)); buzz(6); } else { vFov=62; buzz(4); } });
    n.addEventListener("wheel",e=>{ setZoom(zoomOf()*(e.deltaY>0?1.08:0.92)); },{passive:true});
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
  /* ---- reproducible test states (phase gates + phone testers):
     az/alt/fov pin the camera, sel selects without re-aiming, preset picks
     a layer set, state forces manual | find:<graha> | seek | layers | below ---- */
  if(opts.az!=null){ wantAz=viewAz=((+opts.az)%360+360)%360; }
  if(opts.alt!=null){ wantAlt=viewAlt=clampAlt(+opts.alt); }
  if(opts.fov){ vFov=Math.max(FOV_MIN,Math.min(FOV_MAX,+opts.fov)); }
  orr=wantOrr=0; orrSide=false; orrSpin=orrPitch=wantSpin=wantPitch=0; seekTargetMs=null;
  if(opts.orr!=null){ orr=wantOrr=Math.max(0,Math.min(1,+opts.orr)); orrSide=orr>=0.5; if(wantOrr>0) vFov=FOV_MAX; }
  if(opts.preset&&PRESETS[opts.preset]){ layers={...layers,...PRESETS[opts.preset]}; }
  const selOf=s=>{ if(!s) return null; const m=String(s).match(/^(rashi|nak):(\d+)$/);
    if(m) return m[1]==="rashi"?{t:"rashi",i:+m[2],label:SIGNS_SK[+m[2]],kind:"rashi",seen:false}:{t:"nakshatra",i:+m[2],label:NAKS[+m[2]],kind:"nakshatra",seen:false};
    if(s==="asc") return cache.asc?{t:"asc",label:`${birthOpts?.sign||""} Lagna`,kind:"lagna",seen:false}:null;
    return cache.grahas.find(x=>x.g===s)?{t:"graha",g:s,label:s,kind:"graha",seen:false}:null; };
  const st=String(opts.state||"");
  if(opts.sel){ const t=selOf(opts.sel); if(t){ target=t; if(opts.az==null){ const p=targetPos(); if(p&&p.up){ wantAz=viewAz=p.az; wantAlt=viewAlt=clampAlt(p.alt); } } } }
  if(st.startsWith("find:")){ const t=selOf(st.slice(5)); if(t){ target=t; followSky=false; if(opts.az==null){ const p=targetPos(); if(p){ wantAz=viewAz=(p.az+150)%360; wantAlt=viewAlt=20; } } } }
  if(st==="below"){ const down=cache.grahas.filter(x=>!x.up&&x.g!=="Rahu"&&x.g!=="Ketu").sort((a,b)=>b.alt-a.alt)[0]; if(down){ target={t:"graha",g:down.g,label:down.g,kind:"graha",seen:false}; followSky=false; } }
  if(st==="manual"){ followSky=false; }
  if(st==="compass"){ compassShown=true; followSky=false; }
  if(st==="orrery"){ orr=wantOrr=1; orrSide=true; vFov=FOV_MAX; followSky=false; }
  fmtMoment(); setFoot(); syncFind(); buildSeeker(); wakeUI(); showHints();
  if(st==="seek"){ const s=el.root.querySelector("#svseek"); if(s){ s.classList.add("open"); seekActive=true; paintSeeker(); } }
  if(st==="layers"){ const s=el.root.querySelector("#svlayers"); if(s){ s.hidden=false; paintLayers(); } }
  if(st==="search"||st.startsWith("search:")){ const s=el.root.querySelector("#svsearch"); if(s){ s.hidden=false; searchCat=st.includes(":")?st.split(":")[1]:null; renderSearch(""); } }
  if(st==="moment"){ openEditor(); }
  if(st==="manual"||st.startsWith("find:")||st==="below"){ setTimeout(syncRecenter,0); setTimeout(syncFind,0); }
  running=true; lastFrame=0; draw();
  if(mode==="birth") toast("The sky you were born under.");
  const canAsk=typeof DeviceOrientationEvent!=="undefined"&&typeof DeviceOrientationEvent.requestPermission==="function";
  const fb=el.root.querySelector("#svmotion");
  fb.hidden=true;                                   /* the location button owns motion permission now */
  if(!QUIET&&(!canAsk||opts.motion===true)){ armSensors(); }
  setTimeout(syncLoc,50);
  setTimeout(()=>{ if(running&&!sensing) toast(canAsk&&fb&&!fb.hidden?"Drag to explore — or tap Follow my phone":"Motion tracking unavailable · drag to explore"); },2500);
}
function hitTest(cx,cy){
  if(orr>0.5){ const h=orreryHit(cx,cy);
    if(h){ target={...h,seen:true}; ghostBirth=false; cache=null; computeSky(); buzz(6); setFoot(); syncFind(); }
    else if(target) clearTarget();
    wakeUI(); return; }
  let best=null,bd=34;
  for(const p of cache.grahas){ const [x,y]=project(p); if(!Number.isFinite(x)) continue; const d2=Math.hypot(x-cx,y-cy); if(d2<bd){bd=d2;best={t:"graha",g:p.g,label:p.g,kind:"graha"};} }
  if(!best&&cache.asc){ const [x,y]=project(cache.asc); if(Number.isFinite(x)&&Math.hypot(x-cx,y-cy)<28) best={t:"asc",label:`${birthOpts.sign} Lagna`,kind:"lagna"}; }
  if(!best&&(layers.rashis||layers.naks)){
    /* the ribbon: nearest ecliptic sample within the band; upper half = rashi, lower = nakshatra */
    let bi=-1,bdd=1e9,by=0;
    cache.ecl.forEach((p,i)=>{ const [x,y]=project(p); if(!Number.isFinite(x)) return; const d=Math.hypot(x-cx,y-cy); if(d<bdd){bdd=d;bi=i;by=y;} });
    const bandW=Math.max(32,Math.min(96,6.4*ppdCenter()));
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
  orr=wantOrr=0; orrSpin=orrPitch=wantSpin=wantPitch=0; seekTargetMs=null;
  if(watch){ removeEventListener("deviceorientationabsolute",watch); removeEventListener("deviceorientation",watch); watch=null; }
  if(el){ el.root.classList.remove("on"); el.root.querySelector("#svq").value=""; el.root.querySelector("#svres").innerHTML=""; el.root.querySelector("#svfoot").hidden=true; }
}
