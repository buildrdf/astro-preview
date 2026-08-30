/* ===================================================================
   SKY VIEW - the magic window. Raise the phone and the screen shows
   the Vedic sky in that direction: the ecliptic band with its twelve
   rashis and twenty-seven nakshatras, the nine grahas, and the
   yogatara - the anchor star - of every nakshatra. Sensors steer the
   view when permitted; a finger always can. Search finds any graha,
   nakshatra, rashi or star, and an edge arrow walks you to it.
   No camera - passthrough AR is the native app's job.
   =================================================================== */
import { positions, retrograde } from "./ephemeris.js";
import { raDecToAltAz, siderealPointAltAz } from "./sky.js";
import { ASTERISMS } from "./asterisms.js?v=20260830d";

const SIGNS_SK=["Mesha","Vrishabha","Mithuna","Karka","Simha","Kanya",
  "Tula","Vrishchika","Dhanu","Makara","Kumbha","Meena"];
const SIGNS_EN=["Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const GRAHAS=["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"];
const GRAHA_SK={Sun:"Surya",Moon:"Chandra",Mars:"Mangal",Mercury:"Budh",
  Jupiter:"Guru",Venus:"Shukra",Saturn:"Shani",Rahu:"Rahu",Ketu:"Ketu"};
const NAKS=["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra",
  "Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni",
  "Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula",
  "Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha",
  "Purva Bhadrapada","Uttara Bhadrapada","Revati"];

/* One yogatara per nakshatra - the star tradition anchors it to.
   J2000 RA/Dec in degrees; m is visual magnitude (drawn size). Where
   schools differ the most widely used identification is taken. */
const STARS=[
  {name:"Sheratan",   ra:28.66,  dec:20.81,  m:2.6},
  {name:"41 Arietis", ra:42.50,  dec:27.26,  m:3.6},
  {name:"Alcyone",    ra:56.87,  dec:24.11,  m:2.9},
  {name:"Aldebaran",  ra:68.98,  dec:16.51,  m:0.9},
  {name:"Meissa",     ra:83.78,  dec:9.93,   m:3.5},
  {name:"Betelgeuse", ra:88.79,  dec:7.41,   m:0.5},
  {name:"Pollux",     ra:116.33, dec:28.03,  m:1.1},
  {name:"Asellus Australis",ra:131.17,dec:18.15,m:3.9},
  {name:"Epsilon Hydrae",ra:131.69,dec:6.42, m:3.4},
  {name:"Regulus",    ra:152.09, dec:11.97,  m:1.4},
  {name:"Zosma",      ra:168.53, dec:20.52,  m:2.6},
  {name:"Denebola",   ra:177.26, dec:14.57,  m:2.1},
  {name:"Algorab",    ra:187.47, dec:-16.52, m:2.9},
  {name:"Spica",      ra:201.30, dec:-11.16, m:1.0},
  {name:"Arcturus",   ra:213.92, dec:19.18,  m:0.0},
  {name:"Zubenelgenubi",ra:222.72,dec:-16.04,m:2.8},
  {name:"Dschubba",   ra:240.08, dec:-22.62, m:2.3},
  {name:"Antares",    ra:247.35, dec:-26.43, m:1.0},
  {name:"Shaula",     ra:263.40, dec:-37.10, m:1.6},
  {name:"Kaus Media", ra:275.25, dec:-29.83, m:2.7},
  {name:"Nunki",      ra:283.82, dec:-26.30, m:2.0},
  {name:"Altair",     ra:297.70, dec:8.87,   m:0.8},
  {name:"Rotanev",    ra:305.66, dec:14.60,  m:3.6},
  {name:"Lambda Aquarii",ra:343.15,dec:-7.58,m:3.7},
  {name:"Markab",     ra:346.19, dec:15.21,  m:2.5},
  {name:"Algenib",    ra:3.31,   dec:15.18,  m:2.8},
  {name:"Zeta Piscium",ra:18.43, dec:7.58,   m:5.2},
];

/* An ambient field of faint stars for depth. They are seeded points on
   the real celestial sphere - they rise, set and turn correctly - but
   they are texture, kept below naming brightness on purpose. */
const AMBIENT=(()=>{ let s=971;
  const rnd=()=>((s=(s*1664525+1013904223)|0)>>>0)/2**32;
  return Array.from({length:170},()=>({
    ra:rnd()*360, dec:Math.asin(rnd()*1.9-0.95)*180/Math.PI, m:3.4+rnd()*2.4}));
})();

const GLOW={Sun:"255,196,110",Moon:"214,226,255",Mars:"255,128,96",
  Mercury:"150,224,170",Jupiter:"255,214,150",Venus:"242,242,255",
  Saturn:"232,204,146",Rahu:"156,146,208",Ketu:"156,146,208"};

let el=null, ctx=null, running=false, watch=null;
let viewAz=180, viewAlt=25, wantAz=180, wantAlt=25, sensing=false;
let spot={lat:19.8824, lon:74.4761, from:"Kopargaon (approximate)"};
let cache=null, cacheAt=0, target=null;
/* "now" = the living sky here; "birth" = the remembered sky over the
   birthplace at the first breath. Always opens on Now - the living sky
   is the habit, the birth sky is the pilgrimage. */
let mode="now", birthOpts=null, proUser=false;
/* custom = a chosen moment+place riding in the Now slot (Pro):
   {iso, dateStr, timeStr, place, lat, lon} */
let custom=null;
const skyDate=()=>mode==="birth"?new Date(birthOpts.date)
  :custom?new Date(custom.iso):new Date();
const skySpot=()=>mode==="birth"?{lat:birthOpts.lat,lon:birthOpts.lon}
  :custom?custom:spot;
const cacheKey=()=>mode+"|"+(mode==="birth"?"b":custom?custom.iso+custom.lat:"live");

/* places for the moment editor - standard-time UTC offsets (no DST),
   coordinates to city precision, which the sky cannot tell apart */
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
const IMG={};
for(const g of GRAHAS){ IMG[g]=new Image(); IMG[g].src=`assets/graha/${g.toLowerCase()}.png`; }

const wrap=a=>((a+180)%360+360)%360-180;
const clampAlt=a=>Math.max(-30,Math.min(85,a));

function computeSky(){
  const d=skyDate(), sp=skySpot();
  const pos=positions(d), ret=retrograde(d);
  cache={
    mode, key:cacheKey(),
    grahas:GRAHAS.map(g=>({g, retro:ret[g], L:pos[g],
      ...siderealPointAltAz(pos[g], d, sp.lat, sp.lon)})),
    stars:STARS.map((s,i)=>({...s, nak:NAKS[i],
      ...raDecToAltAz(s.ra, s.dec, d, sp.lat, sp.lon)})),
    asts:ASTERISMS.map(A=>({lines:A.lines,
      pts:A.stars.map(s=>({m:s.m, ...raDecToAltAz(s.ra, s.dec, d, sp.lat, sp.lon)}))})),
    amb:AMBIENT.map(s=>({m:s.m, ...raDecToAltAz(s.ra, s.dec, d, sp.lat, sp.lon)})),
    ecliptic:Array.from({length:121},(_,i)=>{
      const L=i*3;
      return {L, ...siderealPointAltAz(L, d, sp.lat, sp.lon)};
    }),
    nakMids:NAKS.map((n,i)=>({n, ...siderealPointAltAz(i*(360/27)+360/54, d, sp.lat, sp.lon)})),
    nakEdges:Array.from({length:27},(_,i)=>siderealPointAltAz(i*(360/27), d, sp.lat, sp.lon)),
    asc:(mode==="birth"&&birthOpts&&birthOpts.asc!=null)
      ? siderealPointAltAz(birthOpts.asc, d, sp.lat, sp.lon) : null,
  };
  cacheAt=Date.now();
}

function project(p, W, H, ppd){
  return [W/2 + wrap(p.az-viewAz)*ppd, H/2 - (p.alt-viewAlt)*ppd];
}
function glowDot(c,x,y,r,rgb,a){
  const g=c.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,`rgba(${rgb},${a})`);
  g.addColorStop(1,`rgba(${rgb},0)`);
  c.fillStyle=g; c.beginPath(); c.arc(x,y,r,0,7); c.fill();
}
function starSprite(c,x,y,m,up){
  const a=up?1:0.22;
  const r=m<=0.2?3.4:m<=1.2?2.9:m<=2.4?2.3:m<=3.2?1.8:1.4;
  glowDot(c,x,y,r*5.5,"228,234,255",.34*a);
  c.fillStyle=`rgba(240,244,255,${.95*a})`;
  c.beginPath(); c.arc(x,y,r,0,7); c.fill();
  if(m<=1.2){                          /* a soft cross flare on the bright ones */
    c.strokeStyle=`rgba(235,240,255,${.4*a})`; c.lineWidth=0.9;
    c.beginPath(); c.moveTo(x-r*4.4,y); c.lineTo(x+r*4.4,y);
    c.moveTo(x,y-r*4.4); c.lineTo(x,y+r*4.4); c.stroke();
  }
}

/* the target's live position, whatever kind it is */
function targetPos(){
  if(!target||!cache) return null;
  if(target.t==="graha") return cache.grahas.find(x=>x.g===target.g);
  if(target.t==="star"||target.t==="nakshatra") return cache.stars[target.i];
  if(target.t==="rashi") return cache.ecliptic[target.i*10+5];
  if(target.t==="asc") return cache.asc;
  return null;
}
function setFoot(){
  const f=document.getElementById("svfoot"); if(!f) return;
  if(!target){
    if(mode==="birth"&&birthOpts){
      const sunUp=cache&&cache.grahas.find(x=>x.g==="Sun")?.up;
      f.innerHTML=`The sky over ${birthOpts.place} at ${birthOpts.self?"your":birthOpts.name+"&#8217;s"}
        first breath${sunUp?` &#8212; born in daylight, so these stars stood overhead,
        hidden in the blue`:""}.`;
    }else if(custom){
      const sunUp=cache&&cache.grahas.find(x=>x.g==="Sun")?.up;
      f.innerHTML=`The sky over ${custom.place}, ${custom.dateStr}${sunUp?`
        &#8212; daylight then; the stars stood there, hidden in the blue`:""}.`;
    }else{
      f.innerHTML=`Computed for ${spot.from}. Rashi band, twenty-seven nakshatras and
        their yogatara stars; Rahu and Ketu are points, not lights.`;
    }
    return;
  }
  const p=targetPos(); if(!p) return;
  const dir=["N","NE","E","SE","S","SW","W","NW"][Math.round(((p.az%360)+360)%360/45)%8];
  const where=p.up?`up in the ${dir}`:`below the horizon to the ${dir} right now`;
  if(target.t==="graha"){
    /* the Star Walk move: the sky stays, a card rises (Sangram, 30 Aug) */
    const L=p.L, sg=Math.floor(((L%360)+360)%360/30), nk=Math.floor(((L%360)+360)%360/(360/27));
    const dg=`${Math.floor(L%30)}&#176;${String(Math.floor((L%1)*60)).padStart(2,"0")}&#8242;`;
    const house=birthOpts&&birthOpts.lagna
      ? ((sg+1-birthOpts.lagna+12)%12)+1 : null;
    f.innerHTML=`<div class="svcardrow">
        <img class="svcart" src="assets/graha/${p.g.toLowerCase()}.png" alt="">
        <div class="svcmain">
          <b>${p.g} &#183; ${GRAHA_SK[p.g]}${p.retro&&p.g!=="Rahu"&&p.g!=="Ketu"?" &#183; &#8478;":""}</b>
          <span>${SIGNS_SK[sg]} ${dg} &#183; ${NAKS[nk]}${house?` &#183; house ${house} in your chart`:""}</span>
          <span>${where} &#183; alt ${Math.round(p.alt)}&#176;</span>
        </div>
        <button class="svclear" id="svclear" aria-label="Close">&#10005;</button>
      </div>
      <button class="svchart" id="svchart">Open in chart &#8250;</button>`;
    const oc=document.getElementById("svchart");
    if(oc) oc.onclick=()=>{ const g=target.g; closeSkyView();
      dispatchEvent(new CustomEvent("astra:openplanet",{detail:g})); };
  }else{
    f.innerHTML=`<b>${target.label}</b> &#8212; ${where}.
      <button class="svclear" id="svclear">Clear</button>`;
  }
  const cb=document.getElementById("svclear");
  if(cb) cb.onclick=()=>{ target=null; setFoot(); };
}

function draw(){
  if(!running) return;
  const W=el.canvas.width/devicePixelRatio, H=el.canvas.height/devicePixelRatio;
  const ppd=H/70;                        /* ~70 degree vertical field */
  viewAz+=wrap(wantAz-viewAz)*0.12; viewAlt+=(wantAlt-viewAlt)*0.12;
  if(!cache||cache.key!==cacheKey()
     ||(mode==="now"&&!custom&&Date.now()-cacheAt>2000)) computeSky();
  if(mode==="now"&&!custom){
    const m2=new Date().getMinutes();
    if(m2!==lastChipMin){ lastChipMin=m2; fmtWhenChip(); }
  }
  const c=ctx, now=performance.now();
  const hy=H/2+viewAlt*ppd;

  /* sky: darkest at the zenith, a breath of light toward the horizon.
     The remembered (birth) sky leans violet so the two can never be
     mistaken for one another. */
  const sg=c.createLinearGradient(0,0,0,H);
  const hstop=Math.max(0.05,Math.min(0.95,hy/H));
  const B=mode==="birth";
  sg.addColorStop(0,B?"#0A0518":"#04050E");
  sg.addColorStop(hstop,B?"#241640":"#171B38");
  sg.addColorStop(Math.min(1,hstop+0.02),B?"#140C28":"#0B0D1F");
  sg.addColorStop(1,B?"#0C0720":"#08091A");
  c.fillStyle=sg; c.fillRect(0,0,W,H);
  c.strokeStyle="rgba(170,180,235,.4)"; c.lineWidth=1;
  c.beginPath(); c.moveTo(0,hy); c.lineTo(W,hy); c.stroke();
  c.font="11px ui-monospace,monospace"; c.textAlign="center";
  for(const [az,t] of [[0,"N"],[45,"NE"],[90,"E"],[135,"SE"],[180,"S"],[225,"SW"],[270,"W"],[315,"NW"]]){
    const x=W/2+wrap(az-viewAz)*ppd;
    if(x>-20&&x<W+20){ c.fillStyle="rgba(170,180,235,.7)"; c.fillText(t,x,Math.min(hy+16,H-8)); }
  }

  /* the ambient field first - everything real draws over it */
  for(const s of cache.amb){
    const [x,y]=project(s,W,H,ppd);
    if(x<-8||x>W+8||y<-8||y>H+8||!s.up) continue;
    const a=s.m>5?.08:s.m>4.4?.13:.2;
    c.fillStyle=`rgba(225,232,255,${a})`;
    c.beginPath(); c.arc(x,y,s.m>4.6?0.7:1.05,0,7); c.fill();
  }

  /* the nakshatra figures - each mansion's own stars, joined the way the
     tradition sketches them. Vedic asterisms, not Greek constellations. */
  for(const A of cache.asts){
    const px=A.pts.map(p=>{
      const [x,y]=project(p,W,H,ppd);
      return {x,y,up:p.up,m:p.m,on:x>-80&&x<W+80&&y>-80&&y<H+80};
    });
    if(!px.some(p=>p.on)) continue;
    for(const [i,j] of A.lines){
      const a2=px[i],b2=px[j]; if(!a2||!b2||(!a2.on&&!b2.on)) continue;
      c.strokeStyle=`rgba(168,182,236,${(a2.up||b2.up)?0.26:0.08})`;
      c.lineWidth=1;
      c.beginPath(); c.moveTo(a2.x,a2.y); c.lineTo(b2.x,b2.y); c.stroke();
    }
    for(const p of px){
      if(!p.on) continue;
      const a3=p.up?0.8:0.18;
      const r2=p.m<=1.2?2.2:p.m<=2.6?1.7:p.m<=3.6?1.3:1.0;
      c.fillStyle=`rgba(235,240,255,${a3})`;
      c.beginPath(); c.arc(p.x,p.y,r2,0,7); c.fill();
    }
  }

  /* the ecliptic: a soft golden ribbon with the sharp path inside it */
  for(const pass of [[13,.07],[1.4,.5]]){
    c.strokeStyle=`rgba(194,155,78,${pass[1]})`; c.lineWidth=pass[0];
    c.lineCap="round"; c.beginPath();
    let pen=false;
    for(const p of cache.ecliptic){
      const [x,y]=project(p,W,H,ppd);
      if(x<-60||x>W+60){pen=false;continue}
      pen?c.lineTo(x,y):(c.moveTo(x,y),pen=true);
    }
    c.stroke();
  }

  /* One shared ledger of claimed screen space: band names, rashi names,
     planet discs and every label claim a box, and later text dodges
     everything already claimed. Conjunctions are the whole point of a
     Vedic sky - they must not become soup. */
  const labelBoxes=[];
  const collide=(b,x,y,w,h)=>Math.abs(b.x-x)<(b.w+w)/2+8 && Math.abs(b.y-y)<(b.h+h)/2+3;
  const claim=(x,y,w,h)=>labelBoxes.push({x,y,w,h});
  const place=(x,y0,w,step)=>{ let ly=y0;
    while(labelBoxes.some(b=>collide(b,x,ly,w,11))) ly+=step;
    claim(x,ly,w,11); return ly; };

  /* nakshatra edges (small ticks) and names under the band */
  for(let i=0;i<27;i++){
    const e=cache.nakEdges[i];
    const [x,y]=project(e,W,H,ppd);
    if(x>-30&&x<W+30){
      c.strokeStyle="rgba(194,155,78,.4)"; c.lineWidth=1;
      c.beginPath(); c.moveTo(x,y-4); c.lineTo(x,y+4); c.stroke();
    }
    const m=cache.nakMids[i];
    const [mx,my]=project(m,W,H,ppd);
    if(mx>-70&&mx<W+70){
      c.font="9px ui-monospace,monospace";
      c.fillStyle=m.up?"rgba(214,190,140,.6)":"rgba(214,190,140,.24)";
      c.fillText(m.n,mx,my+17);
      claim(mx,my+17,c.measureText(m.n).width,11);
    }
  }
  /* rashi boundaries (tall ticks) and names above the band */
  c.font="12px -apple-system,system-ui";
  for(let s=0;s<12;s++){
    const b=cache.ecliptic[s*10], m=cache.ecliptic[s*10+5];
    const [bx,by]=project(b,W,H,ppd);
    if(bx>-40&&bx<W+40){ c.strokeStyle="rgba(194,155,78,.65)";
      c.beginPath(); c.moveTo(bx,by-8); c.lineTo(bx,by+8); c.stroke(); }
    const [mx,my]=project(m,W,H,ppd);
    if(mx>-60&&mx<W+60){ c.fillStyle=m.up?"rgba(194,155,78,.8)":"rgba(194,155,78,.32)";
      c.fillText(SIGNS_SK[s],mx,my-14);
      claim(mx,my-14,c.measureText(SIGNS_SK[s]).width,12); }
  }

  /* every visible graha disc claims its ground before any label lands */
  const discs=cache.grahas.map(p=>{
    const [x,y]=project(p,W,H,ppd);
    const R=p.g==="Sun"?17:p.g==="Moon"?15:13;
    const vis=x>-60&&x<W+60&&y>-60&&y<H+60;
    if(vis) claim(x,y,2*R,2*R);
    return {p,x,y,R,vis};
  });

  /* yogatara stars - sized by brightness, labelled star + nakshatra */
  for(const s of cache.stars){
    const [x,y]=project(s,W,H,ppd);
    if(x<-40||x>W+40||y<-40||y>H+40) continue;
    starSprite(c,x,y,s.m,s.up);
    const a=s.up?1:0.25;
    c.font="10px ui-monospace,monospace";
    c.fillStyle=`rgba(168,174,203,${a})`;
    const txt=`${s.name} · ${s.nak}`, lw=c.measureText(txt).width;
    const ly=place(x,y+16,lw,12);
    c.fillText(txt, x, ly);
  }

  /* the grahas - a halo in each one's own light, labels dodging */
  for(const {p,x,y,R,vis} of discs){
    if(!vis) continue;
    const a=p.up?1:0.3;
    c.globalAlpha=a;
    glowDot(c,x,y,R*(p.g==="Sun"?3.1:2.2),GLOW[p.g],p.g==="Sun"?.5:.34);
    const im=IMG[p.g];
    if(im.complete) c.drawImage(im,x-R,y-R,2*R,2*R);
    c.font="10.5px ui-monospace,monospace";
    c.fillStyle="rgba(243,244,250,.9)";
    const gt=p.g+(p.retro&&p.g!=="Rahu"&&p.g!=="Ketu"?" ℞":""),
          gw=c.measureText(gt).width;
    const ly=place(x,y+R+13,gw,13);
    c.fillText(gt, x, ly);
    c.globalAlpha=1;
  }

  /* the guide: a pulsing ring on the target, or an edge arrow to it */
  const tp=targetPos();
  if(tp){
    const [x,y]=project(tp,W,H,ppd);
    const inside=x>30&&x<W-30&&y>90&&y<H-90;
    if(inside){
      const r=24+3.5*Math.sin(now/280);
      c.strokeStyle="rgba(194,155,78,.9)"; c.lineWidth=1.8;
      c.beginPath(); c.arc(x,y,r,0,7); c.stroke();
      c.strokeStyle="rgba(194,155,78,.35)";
      c.beginPath(); c.arc(x,y,r+7,0,7); c.stroke();
    }else{
      const dx=x-W/2, dy=y-H/2, ang=Math.atan2(dy,dx);
      const ex=W/2+Math.cos(ang)*Math.min(W/2-56,Math.abs(dx)),
            ey=Math.max(120,Math.min(H-130,H/2+Math.sin(ang)*Math.min(H/2-120,Math.abs(dy))));
      const bob=4*Math.sin(now/260);
      c.save(); c.translate(ex+Math.cos(ang)*bob,ey+Math.sin(ang)*bob); c.rotate(ang);
      c.fillStyle="rgba(194,155,78,.95)";
      c.beginPath(); c.moveTo(14,0); c.lineTo(-7,-9); c.lineTo(-3,0); c.lineTo(-7,9);
      c.closePath(); c.fill();
      c.restore();
      c.font="10.5px ui-monospace,monospace"; c.textAlign="center";
      c.fillStyle="rgba(214,190,140,.95)";
      c.fillText(target.label.split(" · ")[0], ex, ey+22);
    }
  }
  requestAnimationFrame(draw);
}

/* ---- search ---------------------------------------------------- */
function buildIndex(){
  const items=[];
  GRAHAS.forEach(g=>items.push({t:"graha", g, label:g, kind:"graha",
    keys:[g,GRAHA_SK[g]].map(x=>x.toLowerCase())}));
  NAKS.forEach((n,i)=>items.push({t:"nakshatra", i, label:`${n} · ${STARS[i].name}`,
    kind:"nakshatra", keys:[n.toLowerCase()]}));
  SIGNS_SK.forEach((s,i)=>items.push({t:"rashi", i, label:`${s} · ${SIGNS_EN[i]}`,
    kind:"rashi", keys:[s.toLowerCase(),SIGNS_EN[i].toLowerCase()]}));
  STARS.forEach((s,i)=>items.push({t:"star", i, label:`${s.name} · ${NAKS[i]}`,
    kind:"star", keys:[s.name.toLowerCase()]}));
  return items;
}
let INDEX=null;
function runSearch(q){
  const res=document.getElementById("svres");
  q=q.trim().toLowerCase();
  if(!q){ res.innerHTML=""; return; }
  INDEX=INDEX||buildIndex();
  const hits=INDEX.filter(it=>it.keys.some(k=>k.startsWith(q)))
    .concat(INDEX.filter(it=>it.keys.some(k=>!k.startsWith(q)&&k.includes(q))))
    .slice(0,5);
  res.innerHTML=hits.map((h,i)=>`<button class="svhit" data-i="${i}">
      <b>${h.label}</b><span>${h.kind}</span></button>`).join("");
  res.querySelectorAll(".svhit").forEach((b,i)=>b.onclick=()=>selectTarget(hits[i]));
}
function selectTarget(hit){
  target=hit;
  const q=document.getElementById("svq"), res=document.getElementById("svres");
  if(q){ q.value=""; q.blur(); } if(res) res.innerHTML="";
  const p=targetPos();
  if(p&&!sensing){ wantAz=p.az; wantAlt=clampAlt(Math.max(6,Math.min(66,p.alt))); }
  setFoot();
}

/* ---- device orientation, done properly ----------------------------
   The old heading/beta shortcut snapped 180 degrees whenever the phone
   pitched past vertical or rolled (gimbal flip in the raw angles). The
   fix: build the full ZXY rotation matrix from alpha/beta/gamma, take
   the back-camera direction from it (smooth through every attitude),
   and on iOS - where alpha has an arbitrary zero - anchor it to the
   compass with a slowly-settling offset. */
let azOff=null;
function setTitle(){
  const t=document.getElementById("svttl"), h=document.getElementById("svhint");
  if(!t) return;
  if(mode==="birth"&&birthOpts){
    t.textContent=birthOpts.self?"The sky you were born under"
      :`The sky ${birthOpts.name} was born under`;
    if(h) h.textContent=`${new Date(birthOpts.date).toLocaleDateString("en-GB",
      {day:"numeric",month:"short",year:"numeric"})} · as seen from ${birthOpts.place}`;
  }else if(custom){
    t.textContent=`The sky over ${custom.place}`;
    if(h) h.textContent=`${custom.dateStr}, ${custom.timeStr} · standard time`;
  }else{
    t.textContent="The sky right now";
    if(h&&!sensing) h.textContent="Drag to look around.";
  }
}

function setSkyMode(m){
  if(m===mode||(m==="birth"&&!birthOpts)) return;
  mode=m;
  el.root.classList.toggle("birthmode",m==="birth");
  el.root.querySelectorAll("#svseg button").forEach(b=>
    b.classList.toggle("on",b.dataset.m===m));
  computeSky();
  if(m==="birth"){
    /* the pilgrimage: walk them to the rising point - the lagna, physically
       on the eastern horizon. Unless they already chose a target, which now
       re-resolves to its BIRTH position (focus Saturn, flip to Birth, and
       the arrow walks you to where Saturn stood). */
    if(!target && cache.asc)
      target={t:"asc", label:`Rising point · ${birthOpts.sign} lagna`, kind:"lagna"};
    const p=targetPos();
    if(p&&!sensing){ wantAz=p.az; wantAlt=clampAlt(Math.max(4,Math.min(60,p.alt))); }
  }else if(target&&target.t==="asc"){
    target=null;
  }
  setTitle(); setFoot(); fmtWhenChip();
}

/* ---- the moment editor: any date, any place (Pro) ---- */
let editPlace=null, lastChipMin=-1;
function fmtWhenChip(){
  const w=el?.root.querySelector("#svwhen"); if(!w) return;
  if(mode!=="now"){ w.hidden=true; return; }
  w.hidden=false;
  if(custom){
    w.innerHTML=`${custom.timeStr} &#183; ${custom.dateStr} &#183; ${custom.place}
      <i class="svreset" role="button" aria-label="Back to now">&#10005;</i>`;
  }else{
    const t=new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});
    w.innerHTML=`${t} &#183; ${spot.from} <i class="svpen" aria-hidden="true">&#9998;</i>`;
  }
}
function segLabel(){
  const b=el?.root.querySelector("#svsegnow");
  if(b) b.textContent=custom?custom.dateStr.replace(/ \d{4}$/,""):"Now";
}
function paintPlist(q){
  const list=el.root.querySelector("#svplist"); if(!list) return;
  const extra=[["Use my location",spot.lat,spot.lon,-new Date().getTimezoneOffset()/60]];
  if(birthOpts) extra.push([`Birthplace &#183; ${birthOpts.place}`,birthOpts.lat,birthOpts.lon,birthOpts.off??5.5]);
  const all=[...extra,...CITIES];
  const hits=(q?all.filter(c=>c[0].toLowerCase().includes(q.toLowerCase())):all).slice(0,6);
  list.innerHTML=hits.map((c,i)=>`<button class="svpitem${editPlace&&editPlace.n===c[0]?" on":""}"
    data-i="${i}">${c[0]}</button>`).join("");
  list.querySelectorAll(".svpitem").forEach(b=>b.onclick=()=>{
    const c=hits[+b.dataset.i];
    editPlace={n:c[0].replace(/&#183;.*$/,"").replace("Use my location","your location").trim()
        .replace(/^Birthplace$/,birthOpts?birthOpts.place:"birthplace"),
      lat:c[1],lon:c[2],off:c[3]};
    el.root.querySelector("#svp").value=editPlace.n;
    list.innerHTML="";
  });
}
function openEditor(){
  const ed=el.root.querySelector("#svedit"); if(!ed) return;
  ed.hidden=false;
  const now=new Date();
  el.root.querySelector("#svd").value=custom?custom.iso.slice(0,10)
    :`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
  el.root.querySelector("#svt").value=custom?custom.rawTime
    :`${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
  editPlace=custom?{n:custom.place,lat:custom.lat,lon:custom.lon,off:custom.off}
    :{n:"your location",lat:spot.lat,lon:spot.lon,off:-now.getTimezoneOffset()/60};
  el.root.querySelector("#svp").value=editPlace.n;
  el.root.querySelector("#svplist").innerHTML="";
}
function applyMoment(){
  if(!proUser){ dispatchEvent(new CustomEvent("astra:pro")); return; }
  const dv=el.root.querySelector("#svd").value,
        tv=el.root.querySelector("#svt").value||"12:00";
  if(!dv||!editPlace) return;
  const [y,mo,da]=dv.split("-").map(Number), [hh,mi]=tv.split(":").map(Number);
  const when=new Date(Date.UTC(y,mo-1,da,0,Math.round(hh*60+mi-editPlace.off*60)));
  custom={iso:when.toISOString(), lat:editPlace.lat, lon:editPlace.lon,
    off:editPlace.off, place:editPlace.n, rawTime:tv,
    dateStr:new Date(y,mo-1,da).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}),
    timeStr:new Date(2000,0,1,hh,mi).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})};
  el.root.querySelector("#svedit").hidden=true;
  mode="now";
  computeSky(); segLabel(); setTitle(); setFoot(); fmtWhenChip();
  const up=cache.grahas.filter(x=>x.up&&x.g!=="Rahu"&&x.g!=="Ketu");
  const aim=up.sort((a,b)=>b.alt-a.alt)[0];
  if(aim&&!sensing){ wantAz=aim.az; wantAlt=clampAlt(Math.max(8,Math.min(65,aim.alt))); }
}
function resetCustom(){
  custom=null;
  computeSky(); segLabel(); setTitle(); setFoot(); fmtWhenChip();
}

function onOrient(ev){
  if(ev.alpha==null && ev.webkitCompassHeading==null) return;
  const D=Math.PI/180;
  const a=(ev.alpha||0)*D, b=(ev.beta||0)*D, g=(ev.gamma||0)*D;
  const ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b),
        cg=Math.cos(g),sg=Math.sin(g);
  /* view = where the back camera points = -(3rd column of Rz(a)Rx(b)Ry(g)) */
  const vx=-(ca*sg+sa*sb*cg), vy=-(sa*sg-ca*sb*cg), vz=-(cb*cg);
  const azm=Math.atan2(vx,vy)/D;
  const altm=Math.asin(Math.max(-1,Math.min(1,vz)))/D;
  if(ev.webkitCompassHeading!=null){
    /* Anchor the matrix azimuth to the compass in the raised-phone
       regime, where iOS's compass value empirically tracks the VIEW
       direction (anchoring to the device-top heading instead read 180
       degrees off past vertical - Sangram, 30 Aug, pointing south).
       Near straight-down/straight-up the view heading degenerates, so
       no anchoring there; the gyro matrix carries those attitudes. */
    if(altm>-40 && altm<70){
      const off=wrap(ev.webkitCompassHeading-azm);
      azOff=azOff==null?off:azOff+wrap(off-azOff)*0.08;
    }
  } else if(ev.absolute===true && azOff==null){
    azOff=0;                     /* android absolute frame: alpha is true */
  }
  if(azOff==null) return;        /* no north reference yet - wait */
  sensing=true;
  /* near straight up or down the view's compass direction degenerates -
     hold the last heading there instead of snapping (Sangram, 30 Aug) */
  if(Math.abs(altm)<78) wantAz=((azm+azOff)%360+360)%360;
  wantAlt=Math.max(-88,Math.min(88,altm));
  if(mode==="now"){
    const hint=document.getElementById("svhint");
    if(hint) hint.textContent="Move your phone — the sky follows. Drag to look around.";
  }
  const fb=el?.root.querySelector(".svfollow");
  if(fb) fb.hidden=true;
}
function armSensors(){
  if(watch) return;
  watch=onOrient;
  addEventListener("deviceorientationabsolute",watch);
  addEventListener("deviceorientation",watch);
}

export function openSkyView(opts={}){
  if(opts.lat!=null) spot={lat:opts.lat, lon:opts.lon, from:opts.from||"your location"};
  birthOpts=opts.birth||null;
  proUser=!!opts.pro;
  mode="now"; custom=null;
  if(!el){
    const n=document.createElement("div");
    n.className="skyview"; n.id="skyview";
    n.innerHTML=`<canvas id="svc"></canvas>
      <button class="svclose" aria-label="Close">&#10005;</button>
      <div class="svtitle"><b id="svttl">The sky right now</b><span id="svhint">Drag to look around.</span></div>
      <div class="svseg" id="svseg" role="tablist" aria-label="Which sky" hidden>
        <button data-m="now" class="on" role="tab" id="svsegnow">Now</button>
        <button data-m="birth" role="tab">Birth</button>
      </div>
      <button class="svwhen" id="svwhen" hidden></button>
      <div class="svedit" id="svedit" hidden>
        <p class="svemote">Every sky is kept. The night you met, the morning it all
          began &#8212; pick the moment and stand under it again.</p>
        <div class="sverow">
          <label class="fld"><span class="flabel">Date</span>
            <input type="date" id="svd"></label>
          <label class="fld"><span class="flabel">Local time</span>
            <input type="time" id="svt"></label>
        </div>
        <label class="fld"><span class="flabel">Place</span>
          <input type="search" id="svp" placeholder="Search a city"
            autocomplete="off" autocorrect="off" spellcheck="false"></label>
        <div class="svplist" id="svplist"></div>
        <p class="svtznote">Times are the place&#8217;s standard clock time
          (daylight saving not applied).</p>
        <div class="sverow">
          <button class="primary" id="svapply">See this sky</button>
          <button class="proclose" id="svcancel" style="margin:0;width:auto;padding:13px 18px">Cancel</button>
        </div>
      </div>
      <div class="svsearch">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16.5 16.5l4 4"/></svg>
        <input id="svq" type="search" placeholder="Find a graha, nakshatra or star"
          autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
      </div>
      <button class="svfollow" hidden>Follow my phone</button>
      <div class="svres" id="svres"></div>
      <div class="svfoot" id="svfoot"></div>`;
    document.body.appendChild(n);
    el={root:n, canvas:n.querySelector("#svc")};
    ctx=el.canvas.getContext("2d");
    n.querySelector(".svclose").onclick=closeSkyView;
    const q=n.querySelector("#svq");
    q.oninput=()=>runSearch(q.value);
    q.onkeydown=e=>{ if(e.key==="Enter"){
      const first=n.querySelector(".svhit"); if(first) first.click(); }};
    n.querySelector("#svwhen").onclick=e=>{
      if(e.target.classList.contains("svreset")) resetCustom();
      else openEditor();
    };
    n.querySelector("#svcancel").onclick=()=>{n.querySelector("#svedit").hidden=true;};
    n.querySelector("#svapply").onclick=applyMoment;
    n.querySelector("#svp").oninput=e=>paintPlist(e.target.value);
    let px=0,py=0,drag=false,moved=0;
    n.addEventListener("pointerdown",e=>{
      if(e.target.closest(".svsearch,.svres,.svclose,.svfoot,.svfollow,.svseg,.svwhen,.svedit")) return;
      drag=true;moved=0;px=e.clientX;py=e.clientY;});
    n.addEventListener("pointermove",e=>{
      if(!drag) return;
      const ppd=(el.canvas.height/devicePixelRatio)/70;
      moved+=Math.abs(e.clientX-px)+Math.abs(e.clientY-py);
      wantAz-= (e.clientX-px)/ppd; wantAlt+=(e.clientY-py)/ppd;
      wantAlt=clampAlt(wantAlt);
      px=e.clientX; py=e.clientY;
    });
    n.addEventListener("pointerup",e=>{
      const wasDrag=drag; drag=false;
      if(!wasDrag||moved>10||!cache) return;
      /* a clean tap: was it on a graha? Land on its chart page. */
      const W=el.canvas.width/devicePixelRatio, H=el.canvas.height/devicePixelRatio;
      const ppd=H/70, r=el.canvas.getBoundingClientRect();
      const cx=e.clientX-r.left, cy=e.clientY-r.top;
      let best=null,bd=34;
      for(const p of cache.grahas){
        const x=W/2+wrap(p.az-viewAz)*ppd, y=H/2-(p.alt-viewAlt)*ppd;
        const d2=Math.hypot(x-cx,y-cy);
        if(d2<bd){bd=d2;best=p.g;}
      }
      if(best){ target={t:"graha", g:best, label:best, kind:"graha"};
        setFoot(); }
    });
  }
  const fit=()=>{
    const w=Math.max(innerWidth,document.documentElement.clientWidth||0,320),
          h=Math.max(innerHeight,document.documentElement.clientHeight||0,480);
    el.canvas.width=w*devicePixelRatio;
    el.canvas.height=h*devicePixelRatio;
    ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0); };
  fit(); addEventListener("resize",fit);
  el.root.classList.add("on");
  el.root.classList.remove("birthmode");
  const seg=el.root.querySelector("#svseg");
  if(seg){
    seg.hidden=!birthOpts;
    seg.querySelectorAll("button").forEach(b=>{
      b.classList.toggle("on",b.dataset.m==="now");
      b.onclick=()=>setSkyMode(b.dataset.m);
    });
  }
  const ed=el.root.querySelector("#svedit"); if(ed) ed.hidden=true;
  setTitle(); segLabel(); fmtWhenChip();
  computeSky();
  /* open aimed at something worth seeing: the requested graha, else the
     Sun by day, else the Moon, else whatever rides highest */
  target=null;
  if(opts.focus){
    const hit={t:"graha", g:opts.focus, label:opts.focus, kind:"graha"};
    const p=cache.grahas.find(x=>x.g===opts.focus);
    if(p){ target=hit; }
  }
  let aim=target&&targetPos();
  if(!aim||!aim.up){
    const up=cache.grahas.filter(x=>x.up&&x.g!=="Rahu"&&x.g!=="Ketu");
    aim = up.find(x=>x.g===(opts.focus||"")) || up.find(x=>x.g==="Sun")
       || up.find(x=>x.g==="Moon") || up.sort((a,b)=>b.alt-a.alt)[0] || aim || null;
  }
  if(aim){ wantAz=aim.az; wantAlt=clampAlt(Math.max(8,Math.min(65,aim.alt)));
           viewAz=wantAz-18; viewAlt=wantAlt; }
  setFoot();
  running=true; draw();          /* first frame now; rAF takes over */
  /* Sensors: permission was requested inside the opening tap and its
     verdict arrives via opts.motion. When iOS said no (or the gesture
     expired), offer a button - a fresh tap reopens the window. */
  const canAsk=typeof DeviceOrientationEvent!=="undefined" &&
     typeof DeviceOrientationEvent.requestPermission==="function";
  const fb=el.root.querySelector(".svfollow");
  if(!canAsk || opts.motion===true){
    armSensors(); if(fb) fb.hidden=true;
  } else {
    if(fb){ fb.hidden=false;
      fb.onclick=()=>{
        DeviceOrientationEvent.requestPermission().then(r=>{
          if(r==="granted"){ armSensors(); fb.hidden=true; }
          else{ const hint=document.getElementById("svhint");
            if(hint) hint.textContent=
              "Motion access is off. Allow it in Settings › Safari › Motion & Orientation.";}
        }).catch(()=>{});
      };
    }
    const hint=document.getElementById("svhint");
    if(hint) hint.textContent="Drag to look around — or tap Follow my phone.";
  }
}
export function closeSkyView(){
  running=false; sensing=false; target=null;
  if(watch){ removeEventListener("deviceorientationabsolute",watch);
    removeEventListener("deviceorientation",watch); watch=null; }
  el?.root.classList.remove("on");
}
