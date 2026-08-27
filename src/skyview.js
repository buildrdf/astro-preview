/* ===================================================================
   SKY VIEW - the magic window. Raise the phone and the screen shows
   the Vedic sky in that direction: the ecliptic band with its twelve
   rashis and nakshatra marks, the nine grahas, and the great anchor
   stars of the nakshatras. Sensors steer the view when permitted;
   a finger always can. No camera - that is the native app's job.
   =================================================================== */
import { positions, retrograde } from "./ephemeris.js";
import { raDecToAltAz, siderealPointAltAz } from "./sky.js";

const SIGNS_SK=["Mesha","Vrishabha","Mithuna","Karka","Simha","Kanya",
  "Tula","Vrishchika","Dhanu","Makara","Kumbha","Meena"];
const GRAHAS=["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"];

/* the nakshatra stars whose identifications are settled and bright */
const STARS=[
  {name:"Aldebaran", nak:"Rohini",    ra:68.98,  dec:16.51},
  {name:"Pleiades",  nak:"Krittika",  ra:56.85,  dec:24.11},
  {name:"Regulus",   nak:"Magha",     ra:152.09, dec:11.97},
  {name:"Spica",     nak:"Chitra",    ra:201.30, dec:-11.16},
  {name:"Antares",   nak:"Jyeshtha",  ra:247.35, dec:-26.43},
  {name:"Altair",    nak:"Shravana",  ra:297.70, dec:8.87},
];

let el=null, ctx=null, running=false, watch=null;
let viewAz=180, viewAlt=25, wantAz=180, wantAlt=25, sensing=false;
let spot={lat:19.8824, lon:74.4761, from:"Kopargaon (approximate)"};
let cache=null, cacheAt=0, focusG=null;
const IMG={};
for(const g of GRAHAS){ IMG[g]=new Image(); IMG[g].src=`assets/graha/${g.toLowerCase()}.png`; }

const wrap=a=>((a+180)%360+360)%360-180;

function computeSky(){
  const d=new Date();
  const pos=positions(d), ret=retrograde(d);
  cache={
    grahas:GRAHAS.map(g=>({g, retro:ret[g],
      ...siderealPointAltAz(pos[g], d, spot.lat, spot.lon)})),
    stars:STARS.map(s=>({...s, ...raDecToAltAz(s.ra, s.dec, d, spot.lat, spot.lon)})),
    ecliptic:Array.from({length:121},(_,i)=>{
      const L=i*3;
      return {L, ...siderealPointAltAz(L, d, spot.lat, spot.lon)};
    }),
  };
  cacheAt=Date.now();
}

function project(p, W, H, ppd){
  return [W/2 + wrap(p.az-viewAz)*ppd, H/2 - (p.alt-viewAlt)*ppd, ppd];
}

function draw(){
  if(!running) return;
  const W=el.canvas.width/devicePixelRatio, H=el.canvas.height/devicePixelRatio;
  const ppd=H/70;                        /* ~70 degree vertical field */
  viewAz+=wrap(wantAz-viewAz)*0.12; viewAlt+=(wantAlt-viewAlt)*0.12;
  if(Date.now()-cacheAt>2000) computeSky();
  const c=ctx;
  c.clearRect(0,0,W,H);

  /* ground + horizon */
  const hy=H/2+viewAlt*ppd;
  if(hy<H){ c.fillStyle="rgba(10,11,26,.88)"; c.fillRect(0,hy,W,H-hy); }
  c.strokeStyle="rgba(170,180,235,.4)"; c.lineWidth=1;
  c.beginPath(); c.moveTo(0,hy); c.lineTo(W,hy); c.stroke();
  c.font="11px ui-monospace,monospace"; c.textAlign="center";
  for(const [az,t] of [[0,"N"],[45,"NE"],[90,"E"],[135,"SE"],[180,"S"],[225,"SW"],[270,"W"],[315,"NW"]]){
    const x=W/2+wrap(az-viewAz)*ppd;
    if(x>-20&&x<W+20){ c.fillStyle="rgba(170,180,235,.7)"; c.fillText(t,x,Math.min(hy+16,H-8)); }
  }

  /* the ecliptic band, its rashis and nakshatra ticks */
  c.strokeStyle="rgba(194,155,78,.5)"; c.lineWidth=1.4; c.beginPath();
  let pen=false;
  for(const p of cache.ecliptic){
    const [x,y]=project(p,W,H,ppd);
    if(x<-60||x>W+60){pen=false;continue}
    pen?c.lineTo(x,y):(c.moveTo(x,y),pen=true);
  }
  c.stroke();
  c.font="12px -apple-system,system-ui"; c.textAlign="center";
  for(let s=0;s<12;s++){
    const b=cache.ecliptic[s*10];                 /* 30-degree boundary */
    const m=cache.ecliptic[s*10+5];               /* label at mid-sign */
    const [bx,by]=project(b,W,H,ppd);
    if(bx>-40&&bx<W+40){ c.strokeStyle="rgba(194,155,78,.65)";
      c.beginPath(); c.moveTo(bx,by-7); c.lineTo(bx,by+7); c.stroke(); }
    const [mx,my]=project(m,W,H,ppd);
    if(mx>-60&&mx<W+60){ c.fillStyle=m.up?"rgba(194,155,78,.75)":"rgba(194,155,78,.3)";
      c.fillText(SIGNS_SK[s],mx,my-12); }
  }

  /* anchor stars */
  for(const s of cache.stars){
    const [x,y]=project(s,W,H,ppd);
    if(x<-40||x>W+40||y<-40||y>H+40) continue;
    const a=s.up?1:0.25;
    c.fillStyle=`rgba(240,242,255,${.95*a})`;
    c.beginPath();
    for(let i=0;i<8;i++){ const r=i%2?2:6, an=i*Math.PI/4;
      c[i?"lineTo":"moveTo"](x+Math.cos(an)*r, y+Math.sin(an)*r); }
    c.closePath(); c.fill();
    c.font="10px ui-monospace,monospace";
    c.fillStyle=`rgba(168,174,203,${a})`;
    c.fillText(`${s.name} · ${s.nak}`, x, y+18);
  }

  /* the grahas - labels dodge each other when planets sit conjunct */
  const labelBoxes=[];
  for(const p of cache.grahas){
    const [x,y]=project(p,W,H,ppd);
    if(x<-60||x>W+60||y<-60||y>H+60) continue;
    const a=p.up?1:0.3, R=p.g==="Sun"?17:p.g==="Moon"?15:13;
    c.globalAlpha=a;
    if(focusG===p.g){ c.strokeStyle="rgba(194,155,78,.9)"; c.lineWidth=1.6;
      c.beginPath(); c.arc(x,y,R+7,0,7); c.stroke(); }
    const im=IMG[p.g];
    if(im.complete) c.drawImage(im,x-R,y-R,2*R,2*R);
    c.font="10.5px ui-monospace,monospace";
    c.fillStyle="rgba(243,244,250,.9)";
    let ly=y+R+13;
    while(labelBoxes.some(b=>Math.abs(b.x-x)<52 && Math.abs(b.y-ly)<12)) ly+=13;
    labelBoxes.push({x,y:ly});
    c.fillText(p.g+(p.retro&&p.g!=="Rahu"&&p.g!=="Ketu"?" ℞":""), x, ly);
    c.globalAlpha=1;
  }
  requestAnimationFrame(draw);
}

function onOrient(ev){
  const heading=ev.webkitCompassHeading!=null ? ev.webkitCompassHeading
    : (ev.absolute&&ev.alpha!=null ? 360-ev.alpha : null);
  if(heading!=null){ sensing=true; wantAz=heading; }
  if(ev.beta!=null&&sensing) wantAlt=Math.max(-30,Math.min(85,ev.beta-60));
  const hint=document.getElementById("svhint");
  if(hint&&sensing) hint.textContent="Move your phone — the sky follows. Drag to look around.";
}

export function openSkyView(opts={}){
  if(opts.lat!=null) spot={lat:opts.lat, lon:opts.lon, from:opts.from||"your location"};
  focusG=opts.focus||null;
  if(!el){
    const n=document.createElement("div");
    n.className="skyview"; n.id="skyview";
    n.innerHTML=`<canvas id="svc"></canvas>
      <button class="svclose" aria-label="Close">&#10005;</button>
      <div class="svtitle"><b>The sky right now</b><span id="svhint">Drag to look around.</span></div>
      <div class="svfoot" id="svfoot"></div>`;
    document.body.appendChild(n);
    el={root:n, canvas:n.querySelector("#svc")};
    ctx=el.canvas.getContext("2d");
    n.querySelector(".svclose").onclick=closeSkyView;
    let px=0,py=0,drag=false;
    n.addEventListener("pointerdown",e=>{drag=true;px=e.clientX;py=e.clientY;});
    n.addEventListener("pointermove",e=>{
      if(!drag) return;
      const ppd=(el.canvas.height/devicePixelRatio)/70;
      wantAz-= (e.clientX-px)/ppd; wantAlt+=(e.clientY-py)/ppd;
      wantAlt=Math.max(-30,Math.min(85,wantAlt));
      px=e.clientX; py=e.clientY;
    });
    n.addEventListener("pointerup",()=>drag=false);
  }
  const fit=()=>{ el.canvas.width=innerWidth*devicePixelRatio;
    el.canvas.height=innerHeight*devicePixelRatio;
    ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0); };
  fit(); addEventListener("resize",fit);
  document.getElementById("svfoot").textContent=
    `Computed for ${spot.from}. Rashi band with nakshatra stars; Rahu and Ketu are points, not lights.`;
  el.root.classList.add("on");
  computeSky();
  /* open aimed at something worth seeing: the requested graha, else the
     Sun by day, else the Moon, else whatever rides highest */
  let aim=focusG && cache.grahas.find(x=>x.g===focusG);
  if(!aim||!aim.up){
    const up=cache.grahas.filter(x=>x.up&&x.g!=="Rahu"&&x.g!=="Ketu");
    aim = up.find(x=>x.g===(focusG||"")) || up.find(x=>x.g==="Sun")
       || up.find(x=>x.g==="Moon") || up.sort((a,b)=>b.alt-a.alt)[0] || null;
  }
  if(aim){ wantAz=aim.az; wantAlt=Math.max(8,Math.min(65,aim.alt));
           viewAz=wantAz-18; viewAlt=wantAlt; }
  running=true; draw();          /* first frame now; rAF takes over */
  if(typeof DeviceOrientationEvent!=="undefined" &&
     typeof DeviceOrientationEvent.requestPermission==="function"){
    DeviceOrientationEvent.requestPermission().then(r=>{
      if(r==="granted"){ watch=onOrient;
        addEventListener("deviceorientationabsolute",watch);
        addEventListener("deviceorientation",watch); }
    }).catch(()=>{});
  } else { watch=onOrient;
    addEventListener("deviceorientationabsolute",watch);
    addEventListener("deviceorientation",watch); }
}
export function closeSkyView(){
  running=false; sensing=false;
  if(watch){ removeEventListener("deviceorientationabsolute",watch);
    removeEventListener("deviceorientation",watch); watch=null; }
  el?.root.classList.remove("on");
}
