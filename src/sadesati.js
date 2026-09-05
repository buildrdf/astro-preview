/* ===================================================================
   SADE SATI - Saturn's roughly seven-and-a-half-year pass over the
   12th, 1st and 2nd signs counted from the natal Moon. A TRANSIT
   phenomenon, not a dasha: it comes from where Saturn stands in the
   sky, while dashas come from the Moon's nakshatra at birth. Windows
   are found by scanning Saturn's actual sign entries (retrograde
   re-entries under 600 days merge into their window, matching how
   the tradition counts one continuous sade sati).
   =================================================================== */
import { positions, norm } from "./ephemeris.js?v=20260908a";
import { houseFrom } from "./panchang.js";

const signOf=L=>Math.floor(norm(L)/30)+1;
const satSign=t=>signOf(positions(new Date(t)).Saturn);

const cacheMap=new Map();

export function saturnFromMoon(moonSign, date=new Date()){
  return houseFrom(moonSign, satSign(date.getTime()));
}

export function sadeSatiWindows(moonSign, birthDate){
  const key=moonSign+":"+Math.floor(birthDate.getTime()/864e5);
  if(cacheMap.has(key)) return cacheMap.get(key);
  /* start ten years back so a cycle already running at birth is seen
     whole, not clipped at the scan edge (caught by the unit tests) */
  const from=birthDate.getTime()-10*365.25*864e5;
  const to=birthDate.getTime()+95*365.25*864e5;
  const STEP=20*864e5;
  const refine=(t0,t1)=>{ let a=t0,b=t1; const sa=satSign(a);
    while(b-a>36e5){ const m=(a+b)/2; if(satSign(m)===sa)a=m; else b=m; }
    return b; };
  const segs=[];
  let t=from, cur=satSign(t), segStart=t;
  for(t+=STEP;t<=to;t+=STEP){
    const s=satSign(t);
    if(s!==cur){ const cross=refine(t-STEP,t);
      segs.push({sign:cur,start:segStart,end:cross});
      cur=s; segStart=cross; }
  }
  segs.push({sign:cur,start:segStart,end:to});
  const inBand=s=>[12,1,2].includes(houseFrom(moonSign,s.sign));
  const windows=[];
  for(const seg of segs.filter(inBand)){
    const last=windows[windows.length-1];
    if(last && seg.start-last.end<600*864e5){ last.end=seg.end; last.segs.push(seg); }
    else windows.push({start:seg.start,end:seg.end,segs:[seg]});
  }
  const PHASE={12:"Rising",1:"Peak",2:"Setting"};
  const out=windows.filter(w=>w.end>birthDate.getTime()).map(w=>({
    start:new Date(w.start), end:new Date(w.end),
    years:(w.end-w.start)/(365.25*864e5),
    atBirth:birthDate.getTime()>=w.start&&birthDate.getTime()<w.end,
    phases:w.segs.map(s=>({
      phase:PHASE[houseFrom(moonSign,s.sign)],
      fromMoon:houseFrom(moonSign,s.sign),
      sign:s.sign, start:new Date(s.start), end:new Date(s.end)})),
  }));
  cacheMap.set(key,out);
  return out;
}

export const SATI_PHASE={12:"Rising",1:"Peak",2:"Setting"};

/* Every exact boundary event inside a window - the professional layer.
   A retrograde dip shows up naturally as exit -> later re-entry of the
   same sign; motion is sampled from Saturn's actual longitude change. */
export function satiCrossings(win){
  const motion=t=>{
    const a=norm(positions(new Date(t-2*864e5)).Saturn),
          b=norm(positions(new Date(t+2*864e5)).Saturn);
    let d=b-a; if(d>180)d-=360; if(d<-180)d+=360;
    return d>=0?"Direct":"Retrograde";
  };
  const evts=[];
  win.phases.forEach((p,i)=>{
    evts.push({date:p.start,sign:p.sign,fromMoon:p.fromMoon,phase:SATI_PHASE[p.fromMoon],
      kind:"Entry",motion:motion(p.start.getTime())});
    const last=i===win.phases.length-1;
    const next=win.phases[i+1];
    const gap=next && next.start-p.end>36e5;
    evts.push({date:p.end,sign:p.sign,fromMoon:p.fromMoon,phase:SATI_PHASE[p.fromMoon],
      kind:last?"Final exit":gap?"Temporary exit":"Moves on",
      motion:motion(p.end.getTime())});
  });
  return evts.sort((a,b)=>a.date-b.date);
}
