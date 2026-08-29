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
const IMG={};
for(const g of GRAHAS){ IMG[g]=new Image(); IMG[g].src=`assets/graha/${g.toLowerCase()}.png`; }

const wrap=a=>((a+180)%360+360)%360-180;
const clampAlt=a=>Math.max(-30,Math.min(85,a));

function computeSky(){
  const d=new Date();
  const pos=positions(d), ret=retrograde(d);
  cache={
    grahas:GRAHAS.map(g=>({g, retro:ret[g],
      ...siderealPointAltAz(pos[g], d, spot.lat, spot.lon)})),
    stars:STARS.map((s,i)=>({...s, nak:NAKS[i],
      ...raDecToAltAz(s.ra, s.dec, d, spot.lat, spot.lon)})),
    amb:AMBIENT.map(s=>({m:s.m, ...raDecToAltAz(s.ra, s.dec, d, spot.lat, spot.lon)})),
    ecliptic:Array.from({length:121},(_,i)=>{
      const L=i*3;
      return {L, ...siderealPointAltAz(L, d, spot.lat, spot.lon)};
    }),
    nakMids:NAKS.map((n,i)=>({n, ...siderealPointAltAz(i*(360/27)+360/54, d, spot.lat, spot.lon)})),
    nakEdges:Array.from({length:27},(_,i)=>siderealPointAltAz(i*(360/27), d, spot.lat, spot.lon)),
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
  return null;
}
function setFoot(){
  const f=document.getElementById("svfoot"); if(!f) return;
  if(!target){
    f.innerHTML=`Computed for ${spot.from}. Rashi band, twenty-seven nakshatras and
      their yogatara stars; Rahu and Ketu are points, not lights.`;
    return;
  }
  const p=targetPos(); if(!p) return;
  const dir=["N","NE","E","SE","S","SW","W","NW"][Math.round(((p.az%360)+360)%360/45)%8];
  const where=p.up?`up in the ${dir}`:`below the horizon to the ${dir} right now`;
  f.innerHTML=`<b>${target.label}</b> &#8212; ${where}.
    <button class="svclear" id="svclear">Clear</button>`;
  const cb=document.getElementById("svclear");
  if(cb) cb.onclick=()=>{ target=null; setFoot(); };
}

function draw(){
  if(!running) return;
  const W=el.canvas.width/devicePixelRatio, H=el.canvas.height/devicePixelRatio;
  const ppd=H/70;                        /* ~70 degree vertical field */
  viewAz+=wrap(wantAz-viewAz)*0.12; viewAlt+=(wantAlt-viewAlt)*0.12;
  if(Date.now()-cacheAt>2000) computeSky();
  const c=ctx, now=performance.now();
  const hy=H/2+viewAlt*ppd;

  /* sky: darkest at the zenith, a breath of light toward the horizon */
  const sg=c.createLinearGradient(0,0,0,H);
  const hstop=Math.max(0.05,Math.min(0.95,hy/H));
  sg.addColorStop(0,"#04050E");
  sg.addColorStop(hstop,"#171B38");
  sg.addColorStop(Math.min(1,hstop+0.02),"#0B0D1F");
  sg.addColorStop(1,"#08091A");
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

function onOrient(ev){
  const heading=ev.webkitCompassHeading!=null ? ev.webkitCompassHeading
    : (ev.absolute&&ev.alpha!=null ? 360-ev.alpha : null);
  if(heading!=null){ sensing=true; wantAz=heading; }
  /* holding the phone upright at the horizon puts beta near 90 */
  if(ev.beta!=null&&sensing) wantAlt=clampAlt(ev.beta-90);
  if(sensing){
    const hint=document.getElementById("svhint");
    if(hint) hint.textContent="Move your phone — the sky follows. Drag to look around.";
    const fb=el?.root.querySelector(".svfollow");
    if(fb) fb.hidden=true;
  }
}
function armSensors(){
  if(watch) return;
  watch=onOrient;
  addEventListener("deviceorientationabsolute",watch);
  addEventListener("deviceorientation",watch);
}

export function openSkyView(opts={}){
  if(opts.lat!=null) spot={lat:opts.lat, lon:opts.lon, from:opts.from||"your location"};
  if(!el){
    const n=document.createElement("div");
    n.className="skyview"; n.id="skyview";
    n.innerHTML=`<canvas id="svc"></canvas>
      <button class="svclose" aria-label="Close">&#10005;</button>
      <div class="svtitle"><b>The sky right now</b><span id="svhint">Drag to look around.</span></div>
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
    let px=0,py=0,drag=false;
    n.addEventListener("pointerdown",e=>{
      if(e.target.closest(".svsearch,.svres,.svclose,.svfoot")) return;
      drag=true;px=e.clientX;py=e.clientY;});
    n.addEventListener("pointermove",e=>{
      if(!drag) return;
      const ppd=(el.canvas.height/devicePixelRatio)/70;
      wantAz-= (e.clientX-px)/ppd; wantAlt+=(e.clientY-py)/ppd;
      wantAlt=clampAlt(wantAlt);
      px=e.clientX; py=e.clientY;
    });
    n.addEventListener("pointerup",()=>drag=false);
  }
  const fit=()=>{
    const w=Math.max(innerWidth,document.documentElement.clientWidth||0,320),
          h=Math.max(innerHeight,document.documentElement.clientHeight||0,480);
    el.canvas.width=w*devicePixelRatio;
    el.canvas.height=h*devicePixelRatio;
    ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0); };
  fit(); addEventListener("resize",fit);
  el.root.classList.add("on");
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
