"use strict";
/* =====================================================================
   Spellbound — full app (vanilla port of Spellbound App.dc.html).
   No framework, no build. Renders into #root from a single state object.
   ===================================================================== */

/* ---------------- data (from words-data.js / concepts-data.js) ------- */
const SB_DATA = (typeof window !== 'undefined' && window.SB_DATA) || { nsf:[], champions:[], nationalRound:[] };
const SB_CONCEPTS = (typeof window !== 'undefined' && window.SB_CONCEPTS) || { chapters:[] };

/* =====================================================================
   Bee mascot — ported from SpellboundMascot.dc.html
   ===================================================================== */
let _clipN = 0;
function mascotSVG(mood, bodyColor, accentColor){
  mood = mood || 'happy';
  const C = { body: bodyColor||'#FFC23D', bodyLt:'#FFD86E', stripe: accentColor||'#3A2A8C', wing:'#EDE7FF', wingEdge:'#C4B4FF',
    gold:'#FFC83D', white:'#FFFFFF', pupil:'#2B1B5E', cheek:'#FF7FBE', mouth:'#3A1E5C', tongue:'#FF6FA0', heart:'#FF4D8D', tear:'#5EC2FF' };
  const CLIP = 'bc' + (++_clipN);
  function starPath(cx,cy,outer,inner,pts){ pts=pts||5; let p=''; const step=Math.PI/pts;
    for(let i=0;i<2*pts;i++){ const r=i%2?inner:outer; const a=-Math.PI/2+i*step; p+=(i?'L':'M')+(cx+r*Math.cos(a)).toFixed(1)+','+(cy+r*Math.sin(a)).toFixed(1);} return p+'Z'; }
  function heartPath(cx,cy,s){ return 'M'+cx+','+(cy+0.32*s)+
    ' C'+cx+','+(cy-0.05*s)+' '+(cx-0.55*s)+','+(cy-0.45*s)+' '+(cx-0.55*s)+','+(cy-0.05*s)+
    ' C'+(cx-0.55*s)+','+(cy+0.22*s)+' '+(cx-0.18*s)+','+(cy+0.42*s)+' '+cx+','+(cy+0.62*s)+
    ' C'+(cx+0.18*s)+','+(cy+0.42*s)+' '+(cx+0.55*s)+','+(cy+0.22*s)+' '+(cx+0.55*s)+','+(cy-0.05*s)+
    ' C'+(cx+0.55*s)+','+(cy-0.45*s)+' '+cx+','+(cy-0.05*s)+' '+cx+','+(cy+0.32*s)+' Z'; }
  const EL=92, ER=152, EY=150;
  const base =
    `<ellipse cx="58" cy="106" rx="30" ry="50" fill="${C.wing}" stroke="${C.wingEdge}" stroke-width="3" opacity="0.92" transform="rotate(-26 58 106)"/>`+
    `<ellipse cx="182" cy="106" rx="30" ry="50" fill="${C.wing}" stroke="${C.wingEdge}" stroke-width="3" opacity="0.92" transform="rotate(26 182 106)"/>`+
    `<path d="M104,84 Q88,48 84,28" fill="none" stroke="${C.stripe}" stroke-width="6" stroke-linecap="round"/>`+
    `<path d="M136,84 Q152,48 156,28" fill="none" stroke="${C.stripe}" stroke-width="6" stroke-linecap="round"/>`+
    `<path d="${starPath(84,24,11,4.5)}" fill="${C.gold}"/>`+`<path d="${starPath(156,24,11,4.5)}" fill="${C.gold}"/>`+
    `<ellipse cx="32" cy="196" rx="13" ry="20" fill="${C.body}" transform="rotate(22 32 196)"/>`+
    `<ellipse cx="208" cy="196" rx="13" ry="20" fill="${C.body}" transform="rotate(-22 208 196)"/>`+
    `<ellipse cx="120" cy="172" rx="88" ry="96" fill="${C.body}"/>`+
    `<ellipse cx="98" cy="118" rx="42" ry="30" fill="${C.bodyLt}" opacity="0.5"/>`+
    `<defs><clipPath id="${CLIP}"><ellipse cx="120" cy="172" rx="88" ry="96"/></clipPath></defs>`+
    `<g clip-path="url(#${CLIP})"><rect x="28" y="214" width="184" height="24" fill="${C.stripe}"/><rect x="28" y="246" width="184" height="24" fill="${C.stripe}"/></g>`;
  const cheeks = `<ellipse cx="62" cy="184" rx="15" ry="9" fill="${C.cheek}" opacity="0.85"/><ellipse cx="178" cy="184" rx="15" ry="9" fill="${C.cheek}" opacity="0.85"/>`;
  const eye=(cx,cy,er,pr,dx,dy)=>`<circle cx="${cx}" cy="${cy}" r="${er}" fill="${C.white}"/><circle cx="${cx+dx}" cy="${cy+dy}" r="${pr}" fill="${C.pupil}"/><circle cx="${cx+dx-pr*0.35}" cy="${cy+dy-pr*0.4}" r="${pr*0.32}" fill="${C.white}"/>`;
  let face='';
  if(mood==='happy'){ face=eye(EL,EY,27,13,2,2)+eye(ER,EY,27,13,2,2)+`<path d="M96,196 Q120,224 150,196" fill="none" stroke="${C.mouth}" stroke-width="9" stroke-linecap="round"/>`; }
  else if(mood==='excited'){ face=`<path d="${starPath(EL,EY,26,11)}" fill="${C.pupil}"/><path d="${starPath(ER,EY,26,11)}" fill="${C.pupil}"/><path d="M92,194 Q120,200 150,194 Q142,232 120,232 Q98,232 92,194 Z" fill="${C.mouth}"/><path d="M104,222 Q120,238 138,222 Q138,210 120,210 Q104,210 104,222 Z" fill="${C.tongue}"/><path d="${starPath(30,70,9,4,4)}" fill="${C.gold}"/><path d="${starPath(214,60,11,5,4)}" fill="${C.gold}"/><path d="${starPath(200,120,7,3,4)}" fill="${C.gold}"/>`; }
  else if(mood==='love'){ face=`<path d="${heartPath(EL,EY,46)}" fill="${C.heart}"/><path d="${heartPath(ER,EY,46)}" fill="${C.heart}"/><path d="M100,198 Q120,218 142,198" fill="none" stroke="${C.mouth}" stroke-width="9" stroke-linecap="round"/><path d="${heartPath(34,96,26)}" fill="${C.heart}" opacity="0.85"/><path d="${heartPath(210,84,20)}" fill="${C.heart}" opacity="0.85"/>`; }
  else if(mood==='sleepy'){ face=`<path d="M76,150 Q92,162 108,150" fill="none" stroke="${C.pupil}" stroke-width="8" stroke-linecap="round"/><path d="M136,150 Q152,162 168,150" fill="none" stroke="${C.pupil}" stroke-width="8" stroke-linecap="round"/><path d="M108,202 Q120,212 132,202" fill="none" stroke="${C.mouth}" stroke-width="8" stroke-linecap="round"/><text x="182" y="70" fill="${C.pupil}" font-size="30" font-family="Baloo 2, sans-serif" font-weight="800">z</text><text x="202" y="46" fill="${C.pupil}" font-size="22" font-family="Baloo 2, sans-serif" font-weight="800">z</text>`; }
  else if(mood==='oops'){ face=eye(EL,EY+4,22,11,0,5)+eye(ER,EY+4,22,11,0,5)+`<path d="M72,128 L110,138" stroke="${C.pupil}" stroke-width="7" stroke-linecap="round"/><path d="M172,128 L134,138" stroke="${C.pupil}" stroke-width="7" stroke-linecap="round"/><path d="M100,214 Q120,198 144,214" fill="none" stroke="${C.mouth}" stroke-width="8" stroke-linecap="round"/><path d="M168,158 q-8,12 0,18 q8,-6 0,-18 Z" fill="${C.tear}"/>`; }
  else if(mood==='think'){ // curious "ooh!" — wide eyes up, raised friendly brows, little o mouth, sparkles (a happy learning face, never sad)
    face=eye(EL,EY-2,26,12,1,-4)+eye(ER,EY-2,26,12,1,-4)
      +`<path d="M70,114 Q92,100 112,110" fill="none" stroke="${C.pupil}" stroke-width="7" stroke-linecap="round"/><path d="M132,110 Q152,100 174,114" fill="none" stroke="${C.pupil}" stroke-width="7" stroke-linecap="round"/>`
      +`<ellipse cx="121" cy="209" rx="11" ry="13" fill="${C.mouth}"/>`
      +`<path d="${starPath(208,76,10,4,4)}" fill="${C.gold}"/><path d="${starPath(30,88,7,3,4)}" fill="${C.gold}"/>`; }
  else { face=eye(EL,EY,30,15,1,1)+eye(ER,EY,30,15,1,1)+`<path d="M70,116 Q92,106 112,116" fill="none" stroke="${C.pupil}" stroke-width="7" stroke-linecap="round"/><path d="M132,116 Q152,106 174,116" fill="none" stroke="${C.pupil}" stroke-width="7" stroke-linecap="round"/><ellipse cx="120" cy="212" rx="15" ry="18" fill="${C.mouth}"/>`; }
  return `<svg viewBox="0 0 240 270" width="100%" height="100%" aria-hidden="true" focusable="false" style="display:block;overflow:visible">${base}<g transform="translate(0,-18)">${cheeks}${face}</g></svg>`;
}

/* =====================================================================
   EvoLadder — 80 animated emblems (ported from EvoLadder.dc.html)
   ===================================================================== */
const EV_TC = {
  spellbound:{ a:'#7C5CFF', b:'#FFC83D', c:'#FF5FA2', ink:'#5a3fd0' }, marquee:{ a:'#E8B23A', b:'#F4D27A', c:'#C0392B', ink:'#9a6a14' },
  aurora:{ a:'#7C5CFF', b:'#36D1FF', c:'#B98CFF', ink:'#4a3fb0' }, anime:{ a:'#FF4D8D', b:'#FFD23F', c:'#36C6E0', ink:'#c41f6a' },
  science:{ a:'#22B814', b:'#16BEDC', c:'#9BE34D', ink:'#1f8e0c' }, origami:{ a:'#D9694A', b:'#5F8A6B', c:'#E0A458', ink:'#b04a2e' },
  pixel:{ a:'#12B59C', b:'#FF5D9E', c:'#36E0C8', ink:'#0e9a86' }, avatar:{ a:'#F3A13C', b:'#2FA7D8', c:'#5FB87A', ink:'#1c6f96' },
};
const EV_NOMEN = {
  spellbound:['Egg','Hatchling','Larva','Grub','Pupa','Cocoon','Worker','Forager','Spellbinder','Queen Bee'],
  marquee:['Spark','Flicker','Bulb','Footlight','Rising Star','Star','Trailblazer','Headliner','Legend','Marquee'],
  aurora:['Stardust','Cloud','Moon','Planet','Spark','Star','Pulsar','Nebula','Quasar','Galaxy'],
  anime:['Student','Trainee','Cadet','Adept','Fighter','Warrior','Ninja','Samurai','Champion','Master'],
  science:['Experiment','Drop','Vial','Sample','Reaction','Catalyst','Compound','Formula','Theory','Eureka'],
  origami:['Sheet','Fold','Cup','Boat','Dart','Plane','Lotus','Crane','Dragon','Swan'],
  pixel:['Bit','Byte','Sprite','Pixel','Hero','Combo','Mini-Boss','Boss','High Score','Arcade'],
  avatar:['Pebble','Breeze','Gust','Droplet','Wave','Stone','Boulder','Ember','Flame','Elemental'],
};
function evStar(cx,cy,R,fill,stroke){ let p=''; for(let i=0;i<10;i++){const ang=-Math.PI/2+i*Math.PI/5;const rr=i%2?R*0.44:R;p+=(i?'L':'M')+(cx+Math.cos(ang)*rr).toFixed(1)+' '+(cy+Math.sin(ang)*rr).toFixed(1);} return `<path d="${p}Z" fill="${fill}"${stroke?` stroke="${stroke}" stroke-width="1"`:''}/>`; }
function evAnimFor(id,s){ const A={
  spellbound:[['ev-wobble 2.2s ease-in-out infinite','50% 82%'],['ev-wobble 1.5s ease-in-out infinite','50% 82%'],['ev-crawl 1.5s ease-in-out infinite','50% 62%'],['ev-crawl 1.2s ease-in-out infinite','50% 62%'],['ev-breathe 2.6s ease-in-out infinite','50% 50%'],['ev-wobble 1.8s ease-in-out infinite','50% 82%'],['ev-hover .8s ease-in-out infinite','50% 50%'],['ev-hover .7s ease-in-out infinite','50% 50%'],['ev-hover .8s ease-in-out infinite','50% 50%'],['ev-hover 1s ease-in-out infinite','50% 50%']],
  marquee:[['ev-twinkle 1.2s ease-in-out infinite','50% 50%'],['ev-flicker .5s steps(2,end) infinite','50% 50%'],['ev-pulse 1.4s ease-in-out infinite','50% 60%'],['ev-bob 2.4s ease-in-out infinite','50% 60%'],['ev-twinkle 1.4s ease-in-out infinite','50% 60%'],['ev-twinkle 1.6s ease-in-out infinite','50% 50%'],['ev-twinkle 1.8s ease-in-out infinite','50% 50%'],['ev-twinkle 1.6s ease-in-out infinite','50% 50%'],['ev-sweep 3s ease-in-out infinite','82% 26%'],['ev-sweep 2.6s ease-in-out infinite','82% 26%']],
  aurora:[['ev-drift 4s ease-in-out infinite','50% 50%'],['ev-drift 4.6s ease-in-out infinite','50% 50%'],['ev-spin 16s linear infinite','50% 60%'],['ev-spin 10s linear infinite','50% 62%'],['ev-twinkle 1.3s ease-in-out infinite','50% 60%'],['ev-twinkle 1.7s ease-in-out infinite','50% 60%'],['ev-pulse 1s ease-in-out infinite','50% 60%'],['ev-drift 4s ease-in-out infinite','50% 50%'],['ev-spin 6s linear infinite','50% 62%'],['ev-spin 13s linear infinite','50% 62%']],
  anime:[['ev-twinkle 1.1s ease-in-out infinite','50% 50%'],['ev-slash 2.6s ease-in-out infinite','50% 90%'],['ev-slash 2.4s ease-in-out infinite','50% 90%'],['ev-slash 2.2s ease-in-out infinite','50% 90%'],['ev-slash 2s ease-in-out infinite','50% 90%'],['ev-slash 1.9s ease-in-out infinite','50% 90%'],['ev-slash 1.8s ease-in-out infinite','50% 90%'],['ev-slash 1.7s ease-in-out infinite','50% 90%'],['ev-slash 1.7s ease-in-out infinite','50% 90%'],['ev-slash 1.6s ease-in-out infinite','50% 90%']],
  science:[['ev-twinkle 1.2s ease-in-out infinite','50% 50%'],['ev-bob 1.5s ease-in-out infinite','50% 20%'],['ev-slosh 2.4s ease-in-out infinite','50% 88%'],['ev-slosh 2.2s ease-in-out infinite','50% 88%'],['ev-slosh 2s ease-in-out infinite','50% 88%'],['ev-slosh 1.8s ease-in-out infinite','50% 88%'],['ev-bob 2.4s ease-in-out infinite','50% 88%'],['ev-bob 2.2s ease-in-out infinite','50% 88%'],['ev-spin 9s linear infinite','50% 62%'],['ev-pulse 1.1s ease-in-out infinite','50% 60%']],
  origami:[['ev-fold 3.2s ease-in-out infinite','50% 50%'],['ev-fold 3s ease-in-out infinite','50% 50%'],['ev-fold 3.2s ease-in-out infinite','50% 50%'],['ev-bob 2.8s ease-in-out infinite','50% 90%'],['ev-fly 2.6s ease-in-out infinite','50% 50%'],['ev-fly 2.4s ease-in-out infinite','50% 50%'],['ev-bloom 3s ease-in-out infinite','50% 70%'],['ev-glide 2.6s ease-in-out infinite','50% 60%'],['ev-sway 2.4s ease-in-out infinite','50% 80%'],['ev-glide 3s ease-in-out infinite','50% 60%']],
  pixel:[['ev-blink .9s steps(2,end) infinite','50% 50%'],['ev-blink .8s steps(2,end) infinite','50% 50%'],['ev-blink .7s steps(2,end) infinite','50% 50%'],['ev-hop 1.2s ease-in-out infinite','50% 90%'],['ev-hop 1.1s ease-in-out infinite','50% 90%'],['ev-hop 1s ease-in-out infinite','50% 90%'],['ev-hop 1s ease-in-out infinite','50% 90%'],['ev-hop .9s ease-in-out infinite','50% 90%'],['ev-hop .9s ease-in-out infinite','50% 90%'],['ev-hop .8s ease-in-out infinite','50% 90%']],
  avatar:[['ev-wobble 2s ease-in-out infinite','50% 88%'],['ev-drift 3.4s ease-in-out infinite','50% 50%'],['ev-spin 5s linear infinite','50% 50%'],['ev-bob 1.5s ease-in-out infinite','50% 20%'],['ev-wave 2.2s ease-in-out infinite','50% 50%'],['ev-bob 3s ease-in-out infinite','50% 90%'],['ev-bob 3.2s ease-in-out infinite','50% 90%'],['ev-flame 1s ease-in-out infinite','50% 90%'],['ev-flame .8s ease-in-out infinite','50% 90%'],['ev-breathe 2.4s ease-in-out infinite','50% 50%']],
}; return (A[id]&&A[id][s])||['ev-bob 2.6s ease-in-out infinite','50% 60%']; }
function evEmb(id,s){
  const C=EV_TC[id]; let g='';
  if(id==='spellbound'){
    if(s===0){ g+=`<ellipse cx="24" cy="30" rx="7" ry="10" fill="#FFE6A8" stroke="${C.ink}" stroke-width="1.5"/><path d="M21 27 q3 1.5 5 0" fill="none" stroke="${C.ink}" stroke-width=".8" opacity=".35"/>`; }
    else if(s===1){ /* hatching — bee poking out of a cracked egg */
      g+=`<path d="M16.5 30 a7.5 9 0 0 0 15 0 q-2 4.5 -7.5 4.5 q-5.5 0 -7.5 -4.5z" fill="#FFE6A8" stroke="${C.ink}" stroke-width="1.4" stroke-linejoin="round"/>`;
      g+=`<path d="M16.5 30 l2.3 -2.1 l2 2.1 l2.2 -2.3 l2.1 2.3 l2.2 -2.1 l2 2.1 l2.2 -1.9" fill="none" stroke="${C.ink}" stroke-width="1.2" stroke-linejoin="round"/>`;
      g+=`<circle cx="24" cy="23.5" r="5" fill="${C.b}" stroke="${C.ink}" stroke-width="1.3"/>`;
      g+=`<circle cx="22" cy="23.3" r="1" fill="${C.ink}"/><circle cx="26" cy="23.3" r="1" fill="${C.ink}"/><path d="M22.4 26 Q24 27.2 25.6 26" fill="none" stroke="${C.ink}" stroke-width=".8" stroke-linecap="round"/>`;
      g+=`<path d="M21 19.5 Q20 15 18 14 M27 19.5 Q28 15 30 14" stroke="${C.ink}" stroke-width="1.1" fill="none"/><circle cx="18" cy="13.8" r="1.1" fill="${C.a}"/><circle cx="30" cy="13.8" r="1.1" fill="${C.a}"/>`; }
    else if(s<=3){ const n=4+s; for(let i=0;i<n;i++){const ang=-1.5+i*0.5;g+=`<circle cx="${(24+Math.cos(ang)*9).toFixed(1)}" cy="${(30+Math.sin(ang)*9).toFixed(1)}" r="${(4.4-i*0.18).toFixed(1)}" fill="#FFD98A" stroke="${C.ink}" stroke-width="1"/>`;} g+=`<circle cx="${(24+Math.cos(-1.5)*9).toFixed(1)}" cy="${(30+Math.sin(-1.5)*9-1).toFixed(1)}" r="1" fill="${C.ink}"/>`; }
    else if(s===4){ g+=`<rect x="17" y="17" width="14" height="24" rx="7" fill="${C.b}" stroke="${C.ink}" stroke-width="1.3"/><path d="M19 24 H29 M19 30 H29 M20 36 H28" stroke="${C.ink}" stroke-width="1.1" opacity=".55"/>`; }
    else if(s===5){ /* cocoon weaving silk */
      g+=`<path d="M24 12 V18" stroke="${C.ink}" stroke-width="1" stroke-linecap="round"/>`;
      g+=`<ellipse cx="24" cy="30" rx="8" ry="12" fill="${C.b}" stroke="${C.ink}" stroke-width="1.3"/>`;
      g+=`<g stroke="${C.ink}" stroke-width=".9" fill="none" opacity=".5"><path d="M17 23 Q24 21 31 25"/><path d="M16 28 Q24 26 32 30"/><path d="M16 33 Q24 31 32 35"/><path d="M18 38 Q24 36 30 39"/></g>`;
      g+=`<path d="M32 26 Q40.5 25 37.5 34" fill="none" stroke="#fff" stroke-width="1.1" opacity=".9"/><circle cx="37.5" cy="34" r="1.2" fill="#fff"/>`; }
    else if(s===9){ /* Queen — echoes the Spellbound logo bee, crowned */
      g+=`<ellipse cx="12.5" cy="22" rx="8" ry="5.5" fill="#EDE7FF" stroke="${C.ink}" stroke-width="1" transform="rotate(-24 12.5 22)"/><ellipse cx="35.5" cy="22" rx="8" ry="5.5" fill="#EDE7FF" stroke="${C.ink}" stroke-width="1" transform="rotate(24 35.5 22)"/>`;
      g+=`<ellipse cx="24" cy="32" rx="10" ry="11.5" fill="${C.b}" stroke="${C.ink}" stroke-width="1.4"/>`;
      g+=`<path d="M15.5 30 H32.5 M15 35.5 H33" stroke="${C.ink}" stroke-width="2.2"/>`;
      g+=`<circle cx="20.5" cy="31" r="1.7" fill="#2B1B5E"/><circle cx="27.5" cy="31" r="1.7" fill="#2B1B5E"/><path d="M21 36.5 Q24 39 27 36.5" fill="none" stroke="${C.ink}" stroke-width="1" stroke-linecap="round"/>`;
      g+=`<path d="M21 22 Q19 15 16 13 M27 22 Q29 15 32 13" stroke="${C.ink}" stroke-width="1.2" fill="none"/>`+evStar(16,12.5,2.1,C.a,C.ink)+evStar(32,12.5,2.1,C.a,C.ink);
      g+=`<path d="M16 18.5 l2.6 -8 3 5.2 2.4 -8.2 2.4 8.2 3 -5.2 2.6 8 z" fill="${C.a}" stroke="${C.ink}" stroke-width=".9" stroke-linejoin="round"/>`;
      g+=`<g fill="${C.a}"><path d="M7 18 l1 2.2 2.2 1 -2.2 1 -1 2.2 -1 -2.2 -2.2 -1 2.2 -1z"/><path d="M41 31 l1 2.2 2.2 1 -2.2 1 -1 2.2 -1 -2.2 -2.2 -1 2.2 -1z"/></g>`; }
    else { g+=`<ellipse cx="15" cy="20" rx="7.5" ry="5" fill="#dff0ff" stroke="${C.ink}" stroke-width="1" transform="rotate(-22 15 20)"/><ellipse cx="33" cy="20" rx="7.5" ry="5" fill="#dff0ff" stroke="${C.ink}" stroke-width="1" transform="rotate(22 33 20)"/><ellipse cx="24" cy="31" rx="9.5" ry="11.5" fill="${C.b}" stroke="${C.ink}" stroke-width="1.4"/><path d="M15.5 28 H32.5 M15 33 H33 M17 38 H31" stroke="${C.ink}" stroke-width="2.1"/><path d="M21 20 Q19 13 16 12 M27 20 Q29 13 32 12" stroke="${C.ink}" stroke-width="1.3" fill="none"/><circle cx="16" cy="12" r="1.4" fill="${C.ink}"/><circle cx="32" cy="12" r="1.4" fill="${C.ink}"/><circle cx="21" cy="29" r="1.6" fill="#1a1226"/><circle cx="27" cy="29" r="1.6" fill="#1a1226"/>`;
      if(s===8)g+=`<path d="M16 16 l2.2 -7 3 4.5 2.8 -7 2.8 7 3 -4.5 2.2 7 z" fill="${C.a}" stroke="${C.ink}" stroke-width=".8"/>`;
      if(s===7){ const fcx=24,fcy=45; let fl='<g>'; for(let i=0;i<5;i++){const a=-Math.PI/2+i*2*Math.PI/5; fl+=`<circle cx="${(fcx+Math.cos(a)*3).toFixed(1)}" cy="${(fcy+Math.sin(a)*3).toFixed(1)}" r="2.3" fill="${C.c}" stroke="${C.ink}" stroke-width=".7"/>`;} fl+=`<circle cx="${fcx}" cy="${fcy}" r="2.1" fill="${C.a}"/></g>`; g+=fl; } }
  } else if(id==='marquee'){
    const bulb=(x,y,r,d)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${C.b}" stroke="${C.ink}" stroke-width="1" style="animation:ev-pulse 1.4s ease-in-out ${d}s infinite"/>`;
    if(s===0){g+=bulb(24,30,3,0);g+=`<g stroke="${C.a}" stroke-width="1.4" stroke-linecap="round"><path d="M24 22V17M24 38V43M16 30H11M32 30H37M18 24l-3-3M30 24l3-3M18 36l-3 3M30 36l3 3"/></g>`;}
    else if(s===1){g+=bulb(24,29,5,0);g+=`<rect x="22" y="34" width="4" height="5" rx="1" fill="${C.ink}"/>`;}
    else if(s===2){g+=bulb(24,27,6.5,0);g+=`<rect x="20" y="33" width="8" height="6" rx="1.5" fill="${C.ink}"/><path d="M21 36h6" stroke="${C.b}" stroke-width="1"/>`;}
    else if(s===3){g+=bulb(15,30,4,0)+bulb(24,30,4,.3)+bulb(33,30,4,.6);g+=`<rect x="11" y="35" width="26" height="4" rx="2" fill="${C.ink}"/>`;}
    else if(s===4){ /* Rising Star — star lifting off with upward streaks */
      g+=`<g stroke="${C.a}" stroke-width="1.7" stroke-linecap="round" opacity=".75"><path d="M18 41 L20 36 M24 43 L24 37 M30 41 L28 36"/></g>`+evStar(24,26,8,C.b,C.ink);}
    else if(s===5){g+=`<circle cx="24" cy="29" r="13" fill="${C.b}" opacity=".18"/>`+evStar(24,29,10,C.b,C.ink);}
    else if(s===6){ /* Trailblazer — a star blazing a trail */
      g+=`<path d="M13 41 Q22 34 30 23" fill="none" stroke="${C.a}" stroke-width="3.4" stroke-linecap="round" opacity=".45"/>`;
      g+=`<path d="M15 41 Q23 35 29 25" fill="none" stroke="${C.b}" stroke-width="1.7" stroke-linecap="round" opacity=".85"/>`;
      g+=evStar(31,21,7,C.b,C.ink);}
    else if(s===7){ /* Headliner — a star above a headline of smaller stars */
      g+=evStar(24,24,8,C.b,C.ink);
      g+=`<rect x="12" y="35" width="24" height="2.4" rx="1.2" fill="${C.ink}" opacity=".35"/>`;
      g+=evStar(15,40,2.6,C.a,C.ink)+evStar(24,41,2.8,C.a,C.ink)+evStar(33,40,2.6,C.a,C.ink);}
    else if(s===8){ /* Legend — spotlight beam on a star */
      g+=`<g transform="rotate(26 36 13)"><rect x="31" y="9" width="10" height="8" rx="1.6" fill="#5a4628" stroke="${C.ink}" stroke-width="1"/><rect x="40" y="10.5" width="2.4" height="5" rx="1" fill="${C.b}"/></g><path d="M38 16 L42 19 L16 39 L10 33 Z" fill="${C.b}" opacity=".4"/><path d="M38 16 L40.5 18 L18 37 L13.5 32 Z" fill="${C.b}" opacity=".28"/><g style="animation:ev-pulse 1.8s ease-in-out infinite">`+evStar(15,35,6.5,C.b,C.ink)+`</g>`;}
    else { /* Marquee — star framed by stage curtains & lights */
      g+=`<g fill="${C.b}" stroke="${C.ink}" stroke-width=".6">`; for(let i=0;i<5;i++){ g+=`<circle cx="${11+i*6.5}" cy="13" r="1.8"/>`; } g+=`</g>`;
      g+=`<path d="M9 15 H39 V18 H9 Z" fill="${C.ink}" opacity=".55"/>`;
      g+=`<path d="M9 18 Q13 22 11 30 Q14 38 10 43 L9 43 Z" fill="${C.c}" stroke="${C.ink}" stroke-width="1" stroke-linejoin="round"/>`;
      g+=`<path d="M39 18 Q35 22 37 30 Q34 38 38 43 L39 43 Z" fill="${C.c}" stroke="${C.ink}" stroke-width="1" stroke-linejoin="round"/>`;
      g+=`<g style="animation:ev-pulse 1.8s ease-in-out infinite">`+evStar(24,31,7.5,C.b,C.ink)+`</g>`; }
  } else if(id==='aurora'){
    const pts=[[19,26],[28,30],[23,35],[30,23],[17,32],[27,38],[33,33],[14,27]];
    if(s===0){for(let i=0;i<3;i++)g+=`<circle cx="${pts[i][0]}" cy="${pts[i][1]}" r="2" fill="${C.b}"/>`;}
    else if(s===1){g+=`<ellipse cx="24" cy="30" rx="13" ry="9" fill="${C.c}" opacity=".4"/>`;for(let i=0;i<6;i++)g+=`<circle cx="${pts[i][0]}" cy="${pts[i][1]}" r="1.8" fill="${C.b}"/>`;}
    else if(s===2){g+=`<circle cx="24" cy="30" r="9" fill="#c4cde0" stroke="${C.ink}" stroke-width="1"/><circle cx="21" cy="27" r="1.6" fill="#9aa6c0"/><circle cx="27" cy="31" r="2.1" fill="#9aa6c0"/><circle cx="23" cy="33" r="1.2" fill="#9aa6c0"/>`;}
    else if(s===3){g+=`<circle cx="24" cy="30" r="10" fill="${C.a}"/><path d="M16 27 Q24 24 32 28" stroke="${C.b}" stroke-width="1.5" fill="none" opacity=".7"/><ellipse cx="24" cy="30" rx="15" ry="4.5" fill="none" stroke="${C.b}" stroke-width="1.6" transform="rotate(-18 24 30)"/>`;}
    else if(s===4){g+=evStar(24,30,6,C.b,'');}
    else if(s===5){g+=`<circle cx="24" cy="30" r="12" fill="${C.b}" opacity=".2"/>`+evStar(24,30,9,C.b,'');}
    else if(s===6){g+=`<circle cx="24" cy="30" r="6" fill="#fff"/><circle cx="24" cy="30" r="6" fill="${C.b}" opacity=".5"/><g stroke="${C.a}" stroke-width="2" stroke-linecap="round"><path d="M24 14V22M24 38V46M8 30H16M32 30H40"/></g>`;}
    else if(s===7){g+=`<g style="filter:blur(1px)"><ellipse cx="22" cy="28" rx="11" ry="8" fill="${C.a}"/><ellipse cx="28" cy="33" rx="9" ry="7" fill="${C.c}"/><ellipse cx="24" cy="30" rx="6" ry="5" fill="${C.b}"/></g>`;}
    else if(s===8){ /* Quasar — fast-spinning jets */
      g+=`<circle cx="24" cy="30" r="8" fill="${C.b}" opacity=".35"/><circle cx="24" cy="30" r="5" fill="#fff"/><g style="animation:ev-orbit 2.2s linear infinite;transform-origin:24px 30px"><path d="M24 30 L10 14 M24 30 L38 46" stroke="${C.a}" stroke-width="3" stroke-linecap="round"/></g>`;}
    else { /* Galaxy — rotating double-spiral */
      g+=`<g style="animation:ev-orbit 7s linear infinite;transform-origin:24px 30px"><circle cx="24" cy="30" r="3.4" fill="#fff"/><path d="M24 30 Q33.5 26.5 33 36 Q27 41.5 20.5 37 Q26 35 24 30" fill="none" stroke="${C.a}" stroke-width="2.8" stroke-linecap="round"/><path d="M24 30 Q14.5 33.5 15 24 Q21 18.5 27.5 23 Q22 25 24 30" fill="none" stroke="${C.c}" stroke-width="2.8" stroke-linecap="round"/><circle cx="33" cy="36" r="1.2" fill="${C.b}"/><circle cx="15" cy="24" r="1.2" fill="${C.b}"/></g>`; }
  } else if(id==='anime'){
    const k=C.ink; const BELT=['#ffffff','#FFD23F','#FF8A3D','#22B814','#2FA7D8','#7C5CFF'][s]||'#1a1226';
    const skin='#FFE0C0'; const blade='#dfe5ee';
    const head=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r||3.5}" fill="${skin}" stroke="${k}" stroke-width="1.4"/>`;
    const limb=(d)=>`<path d="${d}" fill="none" stroke="${k}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
    const belt=(x,y)=>`<rect x="${x-3.5}" y="${y}" width="7" height="2.4" rx="1" fill="${BELT}" stroke="${k}" stroke-width=".5"/>`;
    if(s===0){ /* Student — bowing */
      g+=head(31,28,3.2)+limb('M19 43 L21 35 M27 43 L25 35')+limb('M23 35 Q26 32 30 30')+limb('M30 30 L33 33')+belt(23.5,34); }
    else if(s===1){ /* Trainee — fighting stance */
      g+=head(24,18)+limb('M24 21 V31')+limb('M17 43 L21 33 L24 31 L27 33 L31 43')+limb('M24 24 L18 27 M24 24 L30 27')+belt(24,29.5); }
    else if(s===2){ /* Cadet — with a staff */
      g+=`<path d="M31 13 V42" stroke="#8a5a2b" stroke-width="2.3" stroke-linecap="round"/>`+head(20,18)+limb('M20 21 V32')+limb('M16 43 L20 32 L24 43')+limb('M20 24 L31 21 M20 27 L31 31')+belt(20,30.5); }
    else if(s===3){ /* Adept — raising a sword */
      g+=head(21,19)+limb('M21 22 V32')+limb('M16 43 L21 32 L26 43')+limb('M21 25 L29 21')+`<path d="M29 21 L37 8" stroke="${blade}" stroke-width="2.6" stroke-linecap="round"/><path d="M26.5 21.5 L31.5 19.5" stroke="${k}" stroke-width="2"/>`+belt(21,30.5); }
    else if(s===4){ /* Fighter — a sharp sword wooshing */
      g+=`<path d="M9 40 Q22 12 41 19" fill="none" stroke="${C.a}" stroke-width="2.6" stroke-linecap="round" opacity=".5"/>`;
      g+=`<g transform="rotate(42 24 27)"><path d="M24 11 L24 33" stroke="${blade}" stroke-width="2.8" stroke-linecap="round"/><path d="M24 11 L26 14 L22 14 Z" fill="${blade}"/><rect x="20.3" y="32.5" width="7.4" height="2.6" rx="1" fill="${k}"/><rect x="22.7" y="35" width="2.6" height="6.5" rx="1" fill="#5a3a2a"/></g>`; }
    else if(s===5){ /* Warrior — bandana, sword & shield */
      g+=head(21,19,3.6)+`<path d="M17 18.5 H25 M25 17.5 L30 15.5" stroke="${C.c}" stroke-width="1.8" stroke-linecap="round"/>`;
      g+=limb('M21 22 V31')+limb('M17 43 L21 31 L25 43')+belt(21,29.5);
      g+=`<path d="M21 24 L13 26 L13 33 Q17 35.5 21 32 Z" fill="${C.b}" stroke="${k}" stroke-width="1" stroke-linejoin="round"/>`;
      g+=`<path d="M21 24 L33 15" stroke="${blade}" stroke-width="2.6" stroke-linecap="round"/><path d="M30 13.5 L34.5 16.5" stroke="${k}" stroke-width="2"/>`; }
    else if(s===6){ /* Ninja — sneaking, throwing a shuriken */
      g+=`<circle cx="20" cy="22" r="3.7" fill="${k}"/><path d="M16.4 21.5 H23.6" stroke="#fff" stroke-width="1.5"/>`;
      g+=`<g stroke="${k}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M20 25 Q19 29 15 31"/><path d="M15 31 L11 35 M15 31 L12.5 27"/><path d="M20 25 L23 31 L19 39 M23 31 L29 35"/></g>`;
      g+=evStar(36,14,3,C.a,k)+`<path d="M30 18 L34 15" stroke="${k}" stroke-width="1" opacity=".5"/>`; }
    else if(s===7){ /* Samurai — kabuto helmet & katana */
      g+=`<path d="M30 23 L42 16" stroke="${blade}" stroke-width="2.6" stroke-linecap="round"/><rect x="28" y="22" width="3" height="3" rx="1" transform="rotate(-30 29.5 23.5)" fill="${k}"/>`;
      g+=`<path d="M17 39 L20 27 H26 L29 39 Z" fill="#3a3550" stroke="${k}" stroke-width="1" stroke-linejoin="round"/>`+belt(23,32);
      g+=`<rect x="19" y="21.5" width="8" height="4.5" rx="1.3" fill="${skin}" stroke="${k}" stroke-width=".8"/>`;
      g+=`<path d="M15.5 21 Q23 11 30.5 21 L27.5 22.5 Q23 19 18.5 22.5 Z" fill="${C.a}" stroke="${k}" stroke-width="1" stroke-linejoin="round"/><path d="M20 16 Q23 11 26 16" fill="none" stroke="${C.b}" stroke-width="1.8" stroke-linecap="round"/>`; }
    else if(s===8){ /* Champion — knight with lance & shield */
      g+=`<path d="M10 13 L41 31" stroke="#c9ccd2" stroke-width="2.6" stroke-linecap="round"/><path d="M10 13 L8 10.5 L13 12 Z" fill="#c9ccd2"/><circle cx="11" cy="13" r="2" fill="${C.b}" stroke="${k}" stroke-width=".8"/>`;
      g+=`<path d="M16 27 L29 27 L27 41 L18 41 Z" fill="${C.a}" stroke="${k}" stroke-width="1" stroke-linejoin="round"/>`;
      g+=`<rect x="18" y="14.5" width="9.5" height="11.5" rx="2.5" fill="#b8bcc6" stroke="${k}" stroke-width="1"/><path d="M19.5 20 H26" stroke="${k}" stroke-width="1.4"/><path d="M22.7 15 V13" stroke="${C.c}" stroke-width="1.6" stroke-linecap="round"/>`;
      g+=`<path d="M15 30 L9.5 32 L9.5 39.5 Q13.5 41.5 15 37 Z" fill="${C.b}" stroke="${k}" stroke-width="1" stroke-linejoin="round"/>`; }
    else { /* Master — kept: glowing blade, sparkles, halo */
      g+=`<g transform="rotate(35 24 30)"><rect x="22.5" y="2" width="3" height="28" rx="1.5" fill="${blade}" stroke="${k}" stroke-width="1"/><rect x="21.5" y="30" width="5" height="3" rx="1" fill="${k}"/><rect x="22.5" y="33" width="3" height="7" rx="1.5" fill="#3a2a2a"/></g>`;
      g+=`<path d="M10 40 Q24 8 40 22" fill="none" stroke="${C.a}" stroke-width="2.4" stroke-linecap="round" opacity=".8" style="animation:ev-pulse 1.6s ease-in-out infinite"/>`;
      g+=`<g fill="${C.b}"><path d="M12 16 l.7 1.6 1.6 .7 -1.6 .7 -.7 1.6 -.7 -1.6 -1.6 -.7 1.6 -.7z"/><path d="M36 34 l.7 1.6 1.6 .7 -1.6 .7 -.7 1.6 -.7 -1.6 -1.6 -.7 1.6 -.7z"/></g>`;
      g+=`<circle cx="24" cy="30" r="15" fill="none" stroke="${C.a}" stroke-width="1.4" opacity=".5"/>`; }
  } else if(id==='science'){
    if(s===0){ /* Experiment — little flask with a spark */
      g+=`<path d="M21 18 V25 L16.5 34 a2.6 2.6 0 0 0 2.4 3.6 H29.1 a2.6 2.6 0 0 0 2.4 -3.6 L27 25 V18 Z" fill="#eef6f8" stroke="${C.ink}" stroke-width="1.3" stroke-linejoin="round"/>`;
      g+=`<path d="M18.7 31 H29.3 L30.9 34 a2.2 2.2 0 0 1 -2 3.6 H19.8 a2.2 2.2 0 0 1 -2 -3.6 Z" fill="${C.a}" opacity=".85"/>`;
      g+=`<rect x="19.5" y="16" width="9" height="2.6" rx="1.3" fill="${C.ink}"/>`+evStar(32,18,2.8,C.b,'');}
    else if(s===1){g+=`<path d="M24 18 C30 28 30 33 24 38 C18 33 18 28 24 18 Z" fill="${C.b}" stroke="${C.ink}" stroke-width="1"/>`;}
    else { const flask=s>=6; const fill=Math.min(1,0.25+(s-2)*0.13);
      if(!flask){ g+=`<path d="M20 14 V32 a4 4 0 0 0 8 0 V14" fill="#eef6f8" stroke="${C.ink}" stroke-width="1.4"/>`; const ly=32-fill*16; g+=`<path d="M20.3 ${ly.toFixed(1)} V32 a3.7 3.7 0 0 0 7.4 0 V${ly.toFixed(1)} Z" fill="${C.a}" opacity=".85"/><rect x="18.5" y="12" width="11" height="3" rx="1.5" fill="${C.ink}"/>`; }
      else { g+=`<path d="M21 13 V22 L14 36 a3 3 0 0 0 3 4 H31 a3 3 0 0 0 3 -4 L27 22 V13 Z" fill="#eef6f8" stroke="${C.ink}" stroke-width="1.4"/><path d="M17 30 L31 30 L33 35 a3 3 0 0 1 -2.5 5 H17.5 a3 3 0 0 1 -2.5 -5 Z" fill="${C.a}" opacity=".85"/><rect x="19.5" y="11" width="9" height="3" rx="1.5" fill="${C.ink}"/>`; }
      const nb=Math.max(0,s-3); for(let i=0;i<nb;i++)g+=`<circle cx="${21+(i%3)*3}" cy="30" r="${1+(i%2)*0.6}" fill="${C.c}" style="animation:ev-rise ${(1.4+i*0.2).toFixed(1)}s ease-in-out ${(i*0.25).toFixed(2)}s infinite"/>`;
      if(s===4)g+=`<g fill="none" stroke="${C.c}" stroke-width="1.3" stroke-linecap="round" opacity=".7" style="animation:ev-rise 2.2s ease-in-out infinite"><path d="M22 13 Q19.5 9 22.5 6 Q25 3.5 23 1"/><path d="M26 13 Q28 10 25.6 7"/></g>`;
      if(s>=8){g+=`<g fill="none" stroke="${C.b}" stroke-width="1.2"><ellipse cx="24" cy="24" rx="9" ry="3.4"/><ellipse cx="24" cy="24" rx="9" ry="3.4" transform="rotate(60 24 24)"/><ellipse cx="24" cy="24" rx="9" ry="3.4" transform="rotate(-60 24 24)"/></g><circle cx="24" cy="24" r="1.6" fill="${C.a}"/>`;} }
  } else if(id==='origami'){
    const A=C.a,B=C.b,k=C.ink; const sj=` stroke="${k}" stroke-width="1.4" stroke-linejoin="round"`;
    if(s===0)g+=`<path d="M13 15 H35 V37 H13 Z" fill="${A}"${sj}/><path d="M29 15 H35 V21 Z" fill="${B}" stroke="${k}" stroke-width="1"/><path d="M13 15 L35 37" stroke="${k}" stroke-width=".7" opacity=".22"/>`;
    else if(s===1)g+=`<path d="M13 15 H35 V37 H13 Z" fill="${A}"${sj}/><path d="M13 15 H35 L13 37 Z" fill="${B}" stroke="${k}" stroke-width="1" stroke-linejoin="round"/><path d="M35 15 L13 37" stroke="${k}" stroke-width="1.1"/>`;
    else if(s===2)g+=`<path d="M12 17 L36 17 L24 39 Z" fill="${A}"${sj}/><path d="M12 17 L24 23 L36 17" fill="none" stroke="${k}" stroke-width="1"/><path d="M18 26 L30 26 L24 33 Z" fill="${B}" stroke="${k}" stroke-width="1" stroke-linejoin="round"/>`;
    else if(s===3)g+=`<path d="M10 32 L38 32 L31 39 L17 39 Z" fill="${A}"${sj}/><path d="M24 13 L24 31 L12 31 Z" fill="${B}" stroke="${k}" stroke-width="1" stroke-linejoin="round"/><path d="M24 13 L24 31 L36 31 Z" fill="${A}" stroke="${k}" stroke-width="1" stroke-linejoin="round"/>`;
    else if(s===4)g+=`<path d="M9 30 L37 19 L26 30 Z" fill="${A}"${sj}/><path d="M9 30 L26 30 L37 41 Z" fill="${B}" stroke="${k}" stroke-width="1.1" stroke-linejoin="round"/><path d="M9 30 H26" stroke="${k}" stroke-width=".7" opacity=".4"/>`;
    else if(s===5)g+=`<path d="M8 36 L41 13 L23 33 Z" fill="${B}"${sj}/><path d="M23 33 L41 13 L28 35 Z" fill="${A}" stroke="${k}" stroke-width="1.3" stroke-linejoin="round"/><path d="M23 33 L28 35 L24 39 Z" fill="${A}" opacity=".7" stroke="${k}" stroke-width=".8" stroke-linejoin="round"/>`;
    else if(s===6){ /* Lotus — folded petals radiating from a base */
      const pc=[24,36]; const petal=(ang,len,wid,fill)=>{ const ar=ang*Math.PI/180; const tx=pc[0]+Math.cos(ar)*len, ty=pc[1]+Math.sin(ar)*len; const px=Math.cos(ar+Math.PI/2)*wid, py=Math.sin(ar+Math.PI/2)*wid; const mx=pc[0]+Math.cos(ar)*len*0.55, my=pc[1]+Math.sin(ar)*len*0.55; return `<path d="M${pc[0]} ${pc[1]} L${(mx+px).toFixed(1)} ${(my+py).toFixed(1)} L${tx.toFixed(1)} ${ty.toFixed(1)} L${(mx-px).toFixed(1)} ${(my-py).toFixed(1)} Z" fill="${fill}"/>`; };
      g+=`<g stroke="${k}" stroke-width="1" stroke-linejoin="round">`+petal(-152,17,5,B)+petal(-28,17,5,B)+petal(-90,19,5.5,B)+petal(-118,15,5,A)+petal(-62,15,5,A)+`</g>`;
      g+=`<path d="M13 36 Q24 41 35 36" fill="none" stroke="${k}" stroke-width="1" opacity=".5"/>`; }
    else if(s===7){ /* Crane — classic origami: wings up, neck & head, tail */
      g+=`<g stroke="${k}" stroke-width="1.1" stroke-linejoin="round">`;
      g+=`<path d="M24 36 L17 27 L24 23 L31 27 Z" fill="${A}"/>`;
      g+=`<path d="M24 27 L8 17 L21 29 Z" fill="${B}"/><path d="M24 27 L40 17 L27 29 Z" fill="${B}"/>`;
      g+=`<path d="M31 27 L41 11 L37 14 L31.5 29 Z" fill="${A}"/><path d="M41 11 L45 12.5 L40.5 14 Z" fill="${k}"/>`;
      g+=`<path d="M17 27 L7 35 L19 30 Z" fill="${A}"/></g>`; }
    else if(s===8){ /* Dragon — angular winged origami beast */
      g+=`<g stroke="${k}" stroke-width="1.1" stroke-linejoin="round">`;
      g+=`<path d="M17 33 L27 28 L35 32 L29 37 L19 37 Z" fill="${A}"/>`;
      g+=`<path d="M17 33 L7 29 L12 33 L7 37 Z" fill="${A}"/><path d="M11 29 L9.5 24 L14 30 Z" fill="${A}"/>`;
      g+=`<circle cx="11" cy="31" r="1" fill="${k}"/>`;
      g+=`<path d="M27 28 L31 15 L38 27 Z" fill="${B}"/>`;
      g+=`<path d="M35 32 L45 29 L37 36 L43 40 Z" fill="${A}"/></g>`; }
    else { /* Swan — origami: triangular body, curved neck, head */
      g+=`<g stroke="${k}" stroke-width="1.1" stroke-linejoin="round">`;
      g+=`<path d="M10 38 L34 38 L29 30 L17 31 Z" fill="${A}"/>`;
      g+=`<path d="M10 38 L5 33 L15 35 Z" fill="${A}"/>`;
      g+=`<path d="M29 30 L25 19 L31 14 L33.5 15.5 L28.5 19.5 L33 31 Z" fill="${B}"/>`;
      g+=`<path d="M33.5 15.5 L38 16.5 L33.5 18 Z" fill="${k}"/></g>`;
      g+=`<path d="M14 35 Q24 38 30 33" fill="none" stroke="${k}" stroke-width=".7" opacity=".4"/>`; }
  } else if(id==='pixel'){
    const px=[[2,0],[3,0],[1,1],[2,1],[3,1],[4,1],[0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[0,3],[2,3],[3,3],[5,3],[1,4],[4,4],[0,4],[5,4]];
    const tot=px.length,n=Math.round((s+1)/10*tot); const sz=5,ox=12,oy=16;
    for(let i=0;i<n;i++){const x=px[i][0],y=px[i][1];const col=(i%5===0)?C.b:C.a;g+=`<rect x="${ox+x*sz}" y="${oy+y*sz}" width="${sz}" height="${sz}" fill="${col}" stroke="rgba(0,0,0,.18)" stroke-width=".5"/>`;}
    if(s>=4){g+=`<rect x="${ox+2*sz}" y="${oy+2*sz}" width="${sz}" height="${sz}" fill="#1a1226"/><rect x="${ox+3*sz}" y="${oy+2*sz}" width="${sz}" height="${sz}" fill="#1a1226"/>`;}
  } else if(id==='avatar'){
    const A=C.a,B=C.b,G=C.c,k=C.ink;
    if(s===0)g+=`<ellipse cx="24" cy="33" rx="8" ry="6" fill="#9aa3ad" stroke="${k}" stroke-width="1"/><path d="M19 31 l3 2 M27 30 l-2 3" stroke="${k}" stroke-width=".8" opacity=".5"/>`;
    else if(s<=2){const sc=s===1?1:1.3;g+=`<g transform="translate(24 30) scale(${sc})"><path d="M-10 -2 Q0 -10 8 -4 Q2 0 8 4 Q0 8 -8 3" fill="none" stroke="${B}" stroke-width="2.4" stroke-linecap="round"/></g>`;}
    else if(s===3)g+=`<path d="M24 16 C31 27 31 33 24 39 C17 33 17 27 24 16 Z" fill="${B}" stroke="${k}" stroke-width="1"/><circle cx="24" cy="32" r="2.5" fill="#fff" opacity=".5"/>`;
    else if(s===4)g+=`<path d="M10 32 Q15 24 20 32 T30 32 T40 32" fill="none" stroke="${B}" stroke-width="3" stroke-linecap="round"/><path d="M12 37 Q18 31 24 37 T36 37" fill="none" stroke="${B}" stroke-width="2.4" stroke-linecap="round" opacity=".6"/>`;
    else if(s===5)g+=`<path d="M14 38 L20 22 L30 22 L34 38 Z" fill="#8a949e" stroke="${k}" stroke-width="1"/><path d="M20 30 H30 M24 22 V38" stroke="${k}" stroke-width=".8" opacity=".4"/>`;
    else if(s===6)g+=`<path d="M11 39 L17 20 L31 18 L37 30 L33 39 Z" fill="#7f8a94" stroke="${k}" stroke-width="1.1"/><path d="M17 20 L24 30 L37 30 M24 30 L22 39" stroke="${k}" stroke-width=".8" opacity=".4"/>`;
    else if(s===7)g+=`<path d="M24 38 C18 34 19 27 24 20 C27 26 26 28 28 25 C31 30 30 35 24 38 Z" fill="${A}" stroke="${k}" stroke-width="1"/>`;
    else if(s===8)g+=`<path d="M24 40 C15 35 17 24 24 14 C28 22 27 26 31 22 C35 30 33 36 24 40 Z" fill="${A}"/><path d="M24 38 C20 35 21 29 24 23 C26 28 26 30 28 27 C30 32 28 36 24 38Z" fill="${C.b}" opacity=".8"/>`;
    else { g+=`<circle cx="24" cy="30" r="6" fill="${k}"/><path d="M24 26 v8 M24 26 l-2.4 3 M24 26 l2.4 3" stroke="#fff" stroke-width="1.2" fill="none"/><g style="animation:ev-orbit 7s linear infinite;transform-origin:24px 30px"><circle cx="24" cy="16" r="2.6" fill="${A}"/><circle cx="38" cy="30" r="2.6" fill="${B}"/><circle cx="24" cy="44" r="2.6" fill="${G}"/><circle cx="10" cy="30" r="2.6" fill="#C0392B"/></g>`; }
  }
  const af=evAnimFor(id,s);
  return `<svg viewBox="0 0 48 52" width="54" height="58" aria-hidden="true" focusable="false" style="overflow:visible;animation:${af[0]};transform-origin:${af[1]}">${g}</svg>`;
}
function evoLadderHTML(theme,current){
  const C=EV_TC[theme]||EV_TC.spellbound; const names=EV_NOMEN[theme]||EV_NOMEN.spellbound;
  let cur=(current==null)?4:(typeof current==='string'?parseInt(current,10):current); if(isNaN(cur))cur=4;
  const cells=names.map((nm,i)=>{ const done=i<cur,isCur=i===cur;
    let wrap='flex:1;min-width:60px;display:flex;flex-direction:column;align-items:center;gap:4px;padding:9px 2px 7px;border-radius:10px;transition:background .2s;'+(isCur?`background:color-mix(in srgb,${C.a} 18%,transparent);box-shadow:inset 0 0 0 1.5px ${C.a};`:'')+(!done&&!isCur?'opacity:.78;':'');
    const badge=`font-family:var(--mono);font-size:12px;letter-spacing:.04em;font-weight:700;color:${isCur?C.ink:'rgba(70,64,90,.78)'}`; // dusk override via .sb-evotxt
    const nameStyle=`font-family:var(--body);font-weight:${isCur?800:700};font-size:12px;text-align:center;line-height:1.1;color:${isCur?C.ink:'rgba(50,44,68,.92)'}`;
    return `<div style="${wrap}"><div class="sb-evotxt" style="${badge}">Lv ${i+1}</div><div style="height:60px;display:grid;place-items:center"><div style="width:54px;height:58px">${evEmb(theme,i)}</div></div><div class="sb-evotxt" style="${nameStyle}">${nm}</div></div>`;
  }).join('');
  return `<div style="width:100%;display:flex;align-items:flex-start;gap:2px">${cells}</div>`;
}
