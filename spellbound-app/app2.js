"use strict";
/* =====================================================================
   Spellbound app — part 2: buddy sprites, UI icons, world emblems, data
   ===================================================================== */

/* ---- 16 buddy sprites (ported from buddy()) ---- */
function buddySVG(id, size){
  size = size || 34; const D = '#2A2140';
  const svg = (inner) => `<svg viewBox="0 0 40 40" width="${size}" height="${size}" aria-hidden="true" focusable="false" style="display:block">${inner}</svg>`;
  const C = (cx,cy,r,fill,ex) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${ex||''}/>`;
  const E = (cx,cy,rx,ry,fill,ex) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${ex||''}/>`;
  const P = (d,fill,ex) => `<path d="${d}" fill="${fill}" ${ex||''}/>`;
  const R = (x,y,w,h,r,fill) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
  const st = (w) => `stroke="${D}" stroke-width="${w||1.6}" stroke-linecap="round" stroke-linejoin="round"`;
  const eyes = (lx,rx,cy,r) => { r=r||2; return C(lx,cy,r,D)+C(rx,cy,r,D)+C(lx+0.7,cy-0.7,r*0.36,'#fff')+C(rx+0.7,cy-0.7,r*0.36,'#fff'); };
  switch (id) {
    case 'bee': return svg(E(13,15,4.5,6.5,'rgba(124,92,255,.16)')+E(27,15,4.5,6.5,'rgba(124,92,255,.16)')+P('M15 9 L12.5 5','none',st(1.6))+C(12.5,5,1.5,D)+P('M25 9 L27.5 5','none',st(1.6))+C(27.5,5,1.5,D)+C(20,21,11,'#FFC83D')+P('M11 17 H29','none',st(2.6))+P('M10.5 23.5 H29.5','none',st(2.6))+eyes(16.5,23.5,20,1.8));
    case 'fox': return svg(P('M9 7 L15 14 L7 14 Z','#F0894B')+P('M31 7 L25 14 L33 14 Z','#F0894B')+C(20,21,11,'#F0894B')+P('M20 22 C24 22 26 25 24.5 28 C22 32 18 32 15.5 28 C14 25 16 22 20 22 Z','#FFF1E6')+C(20,24.5,1.6,D)+eyes(16,24,19,1.9));
    case 'owl': return svg(P('M12 8 L16 13 L10 13 Z','#3F938B')+P('M28 8 L24 13 L30 13 Z','#3F938B')+C(20,21,11,'#4FB0A6')+C(16,20,4,'#fff')+C(24,20,4,'#fff')+C(16,20,2,D)+C(24,20,2,D)+P('M20 24 L17.5 27 L22.5 27 Z','#FFC83D'));
    case 'cat': return svg(P('M10 8 L15 15 L8 14 Z','#A99BC4')+P('M30 8 L25 15 L32 14 Z','#A99BC4')+C(20,21,11,'#A99BC4')+P('M20 23 L18.5 25 L21.5 25 Z',D)+P('M9 21 H14','none',st(1.1))+P('M9 24 H14','none',st(1.1))+P('M26 21 H31','none',st(1.1))+P('M26 24 H31','none',st(1.1))+eyes(16,24,20,1.8));
    case 'panda': return svg(C(11,11,3.5,D)+C(29,11,3.5,D)+C(20,21,11,'#F4F4F8',`stroke="${D}" stroke-width="1.1"`)+E(15,20,3,4,D)+E(25,20,3,4,D)+C(15,20,1.4,'#fff')+C(25,20,1.4,'#fff')+C(20,25,1.4,D));
    case 'frog': return svg(C(13,12,4,'#6BBF59')+C(27,12,4,'#6BBF59')+C(13,12,2.1,'#fff')+C(27,12,2.1,'#fff')+C(13,12,1.1,D)+C(27,12,1.1,D)+C(20,23,11,'#6BBF59')+P('M13 24 Q20 30 27 24','none',st(1.8)));
    case 'penguin': return svg(C(20,21,11,'#3A4763')+E(20,24,6,8,'#fff')+P('M20 19 L17.5 22 L22.5 22 Z','#FFC83D')+eyes(16.5,23.5,17,1.7));
    case 'bunny': return svg(E(14,9,2.6,7,'#F2A8C4')+E(26,9,2.6,7,'#F2A8C4')+E(14,9,1,3.5,'#FFE3EE')+E(26,9,1,3.5,'#FFE3EE')+C(20,22,11,'#F2A8C4')+P('M20 24 L18.5 26 L21.5 26 Z',D)+eyes(16,24,21,1.8));
    case 'dino': return svg(P('M13 12 L15 8 L17 12 Z','#3E9C74')+P('M18 11 L20 6 L22 11 Z','#3E9C74')+P('M23 12 L25 8 L27 12 Z','#3E9C74')+C(20,22,11,'#54B58A')+C(16,22,1.7,D)+C(24,22,1.7,D)+C(15,26,1,D)+C(17,26,1,D));
    case 'robot': return svg(P('M20 6 V10','none',st(1.6))+C(20,5,1.6,D)+R(9,11,22,20,6,'#8A93A6')+R(14,18,3.5,4,1,D)+R(22.5,18,3.5,4,1,D)+P('M15 26 H25','none',st(1.8)));
    case 'dragon': return svg(P('M12 9 L13 4 L16 9 Z','#6E4FD0')+P('M28 9 L27 4 L24 9 Z','#6E4FD0')+C(20,22,11,'#8C6BF0')+E(20,26,5,3.5,'#6E4FD0')+C(18,26,0.9,D)+C(22,26,0.9,D)+eyes(16,24,20,1.8));
    case 'narwhal': return svg(P('M20 3 L18.5 12 L21.5 12 Z','#EDE3FF',`stroke="${D}" stroke-width="0.8"`)+C(20,22,11,'#4FA0E0')+P('M30 18 L35 14 L34 22 Z','#4FA0E0')+E(20,25,5,3,'#BFE0F7')+eyes(16.5,23.5,21,1.8));
    case 'octopus': return svg(P('M9 26 C9 16 13 12 20 12 C27 12 31 16 31 26 C29 24 28 28 26 26 C24 24 23 28 21 26 C19 24 18 28 16 26 C14 24 12 28 9 26 Z','#B074E0')+eyes(16.5,23.5,20,1.9)+P('M16.5 25 Q20 28 23.5 25','none',st(1.4)));
    case 'chick': return svg(P('M18 8 L18 4','none',st(1.4))+P('M20 8 L20 3.5','none',st(1.4))+P('M22 8 L22 4','none',st(1.4))+C(20,22,11,'#FFD24D')+P('M20 23 L16.5 25.5 L20 28 Z','#F0894B')+eyes(16.5,23.5,20,1.8));
    case 'unicorn': return svg(P('M20 3 L18 11 L22 11 Z','#FFC83D',`stroke="${D}" stroke-width="0.7"`)+C(20,22,11,'#C9A8F0')+P('M11 14 C8 18 9 24 12 27','none',`stroke="#F2A8C4" stroke-width="3" stroke-linecap="round"`)+C(20,25,1.4,D)+eyes(16,24,20,1.8));
    case 'axolotl': return svg(P('M9 13 L5 10','none',st(1.6))+C(5,10,1.4,'#FF8FB0')+P('M9 17 L4 17','none',st(1.6))+C(4,17,1.4,'#FF8FB0')+P('M31 13 L35 10','none',st(1.6))+C(35,10,1.4,'#FF8FB0')+P('M31 17 L36 17','none',st(1.6))+C(36,17,1.4,'#FF8FB0')+C(20,22,11,'#F7A8C8')+C(16,21,1.6,D)+C(24,21,1.6,D)+P('M16.5 25 Q20 27 23.5 25','none',st(1.4)));
    default: return svg(C(20,21,11,'#7C5CFF')+eyes(16,24,20,2));
  }
}

/* ---- UI icons (ported from icon()) — stroke:currentColor ---- */
function iconSVG(name, size, sw){
  size = size || 18; sw = sw || 2.1;
  const w = (inner) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="display:block;flex-shrink:0">${inner}</svg>`;
  const p = (d) => `<path d="${d}"/>`;
  const M = {
    home: () => w(p('M3 11.2 12 4l9 7.2')+p('M5.5 9.8V20h13V9.8')),
    pencil: () => w(p('M4 20l4.2-1L19 8.2a2 2 0 0 0-3-3L5 16z')+p('M14.2 6.2l2.6 2.6')),
    chart: () => w(p('M4 4v16h16')+p('M8 14.5l3-3 3 2 4.5-5.5')),
    users: () => w('<circle cx="9" cy="8" r="3"/>'+p('M3.4 20a5.6 5.6 0 0 1 11.2 0')+p('M16.5 5.6a3 3 0 0 1 0 5.8')+p('M18 14.4A5.6 5.6 0 0 1 21 19.5')),
    gear: () => w('<circle cx="12" cy="12" r="3.2"/>'+p('M12 2.2v2.4M12 19.4v2.4M21.8 12h-2.4M4.6 12H2.2M18.9 5.1l-1.7 1.7M6.8 17.2l-1.7 1.7M18.9 18.9l-1.7-1.7M6.8 6.8 5.1 5.1')),
    volume: () => w(p('M11 5 6 9H3v6h3l5 4z')+p('M16 9.2a3 3 0 0 1 0 5.6')+p('M19 6.6a7 7 0 0 1 0 10.8')),
    flame: () => w(p('M12 3c.6 2.6 2.6 3.9 2.6 6.2A2.6 2.6 0 0 1 9.4 9.4c0-.4 0-.7.1-1C8 9.6 7 11.4 7 13.2a5 5 0 0 0 10 0C17 9.6 14.5 6.6 12 3z')),
    steps: () => w(p('M4 19h4v-4h4v-4h4v-4h4')),
    grid: () => w('<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/>'),
    target: () => w('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.8" fill="currentColor"/>'),
    plus: () => w(p('M12 5.5v13M5.5 12h13')),
    crown: () => w(p('M4 18l-1.3-9.4 5.3 4.1L12 6l4 6.7 5.3-4.1L20 18z')+p('M4 21h16')),
    spark: () => w(p('M12 3l1.8 5.6L19.5 10l-5.7 1.4L12 17l-1.8-5.6L4.5 10l5.7-1.4z')),
    check: () => w(p('M5 12.5l4.4 4.4L19 7.2')),
    sprout: () => w(p('M12 20v-7.5')+p('M12 12.5C12 9.5 9.7 7.5 6 7.5c0 3 2.3 5 6 5z')+p('M12 12.5c0-2.4 1.6-4.2 4.8-4.2 0 2.4-1.6 4.2-4.8 4.2z')),
    arrow: () => w(p('M5 12h13')+p('M13 6l6 6-6 6')),
    book: () => w(p('M5 4.5h11a2 2 0 0 1 2 2V20a1.5 1.5 0 0 0-1.5-1.5H5z')+p('M5 4.5v14')),
    upload: () => w(p('M12 16V5')+p('M7.5 9.5 12 5l4.5 4.5')+p('M5 19h14')),
    menu: () => w(p('M4 7h16')+p('M4 12h16')+p('M4 17h16')),
    close: () => w(p('M6 6l12 12')+p('M18 6 6 18')),
    lock: () => w('<rect x="4.5" y="10.5" width="15" height="10" rx="2.2"/>'+p('M8 10.5V7.5a4 4 0 0 1 8 0v3')+p('M12 14.5v2.5')),
    eye: () => w(p('M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z')+'<circle cx="12" cy="12" r="2.6"/>'),
    eyeoff: () => w(p('M4.5 5.5C2.8 7 2 12 2 12s3.6 6.5 10 6.5c1.7 0 3.2-.4 4.5-1M9.6 5.7A9.6 9.6 0 0 1 12 5.5c6.4 0 10 6.5 10 6.5s-1 1.8-2.8 3.4')+p('M9.9 9.9a3 3 0 0 0 4.2 4.2')+p('M4 4l16 16')),
    joystick: () => w('<circle cx="12" cy="6.5" r="2.6"/>'+p('M12 9.1V14')+p('M6.5 20a5.5 5.5 0 0 1 11 0')+p('M5 20h14')),
    coin: () => w('<circle cx="12" cy="12" r="8.5"/>'+'<circle cx="12" cy="12" r="4"/>'+p('M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2')),
    fire: () => w(p('M12 3c.4 2.4 2.2 3.6 2.9 5.6.6 1.7.2 3.4-1 4.4.3-1.3-.2-2.5-1.1-3.2.2 2-1.2 3.2-2.3 4.2-1.6 1.4-1.9 3.6-.6 5.2A5 5 0 0 1 7 14.4c0-1 .3-1.9.8-2.7.3 1 .9 1.6 1.8 1.8-1-2.3.2-4.6 1.7-6 1.2-1.1 1.4-2.6.9-4.5z')),
    cart: () => w(p('M3.5 4.5h2l1.8 9.7a1.5 1.5 0 0 0 1.5 1.2h6.8a1.5 1.5 0 0 0 1.5-1.1l1.4-6.2H6.2')+'<circle cx="9.5" cy="19" r="1.3"/><circle cx="16.5" cy="19" r="1.3"/>'),
    print: () => w(p('M7 9V4h10v5')+'<rect x="4.5" y="9" width="15" height="7" rx="2"/>'+p('M7 14h10v5.5H7z')+'<circle cx="16.4" cy="12" r="0.9" fill="currentColor" stroke="none"/>'),
    bolt: () => w(p('M13 2.5 6.5 13.2H11l-1 8.3L17.5 10H12.8z')),
    alert: () => w(p('M12 4.2 2.9 19.4a.8.8 0 0 0 .7 1.2h16.8a.8.8 0 0 0 .7-1.2z')+p('M12 9.8v4.4')+'<circle cx="12" cy="17.2" r="0.95" fill="currentColor" stroke="none"/>'),
    bulb: () => w(p('M9.2 17.5a5.6 5.6 0 1 1 5.6 0 2 2 0 0 0-.8 1.6v.4H10v-.4a2 2 0 0 0-.8-1.6z')+p('M9.8 21.5h4.4')),
    search: () => w('<circle cx="11" cy="11" r="6.2"/>'+p('M15.6 15.6 20 20')),
    link: () => w(p('M9.5 14.5 14.5 9.5')+p('M8.2 11 6.6 12.6a3.2 3.2 0 0 0 4.5 4.5l1.6-1.6')+p('M15.8 13 17.4 11.4a3.2 3.2 0 0 0-4.5-4.5L11.3 8.5')),
    palette: () => w(p('M12 3.6a8.4 8.4 0 1 0 0 16.8c1.4 0 1.9-1.1 1.4-2-.5-1.1.3-2.2 1.5-2.2h1.3a3.6 3.6 0 0 0 3.6-3.6C19.8 7 16.3 3.6 12 3.6z')+'<circle cx="8.2" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="15.8" cy="11" r="1" fill="currentColor" stroke="none"/>'),
  };
  return (M[name] || M.grid)();
}

/* ---- Arcade logo: a glowing cabinet badge with a joystick + buttons ---- */
function arcadeLogoSVG(size){ size=size||40;
  return `<svg viewBox="0 0 48 48" width="${size}" height="${size}" aria-hidden="true" focusable="false" style="display:block;filter:drop-shadow(0 3px 7px rgba(124,92,255,.45))">
    <defs><linearGradient id="sbArc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7C5CFF"/><stop offset=".55" stop-color="#9B6BFF"/><stop offset="1" stop-color="#36D1FF"/></linearGradient></defs>
    <rect x="3" y="3" width="42" height="42" rx="13" fill="url(#sbArc)"/>
    <rect x="10.5" y="11" width="27" height="15" rx="3.2" fill="#0f0a25" opacity=".88"/>
    <text x="24" y="22.4" text-anchor="middle" font-family="Verdana,Arial,sans-serif" font-weight="900" font-size="9" fill="#FFD24D" letter-spacing="1.5">SB</text>
    <circle cx="16" cy="35" r="3.6" fill="#0f0a25" opacity=".55"/>
    <line x1="16" y1="35" x2="16" y2="29.5" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="16" cy="28.7" r="2.5" fill="#FF4D8D" stroke="#fff" stroke-width="1.1"/>
    <circle cx="29.5" cy="33.5" r="2.5" fill="#FFD24D"/>
    <circle cx="36" cy="33.5" r="2.5" fill="#36E0C8"/>
    <circle cx="32.7" cy="38.4" r="2.5" fill="#FF8A3D"/>
  </svg>`; }

/* ---- delight: sound effects (Web Audio, no files) + confetti ---- */
let _actx=null;
function audioCtx(){ try{ if(!_actx) _actx=new (window.AudioContext||window.webkitAudioContext)(); if(_actx.state==='suspended') _actx.resume(); return _actx; }catch(e){ return null; } }
function _tone(freq,start,dur,type,gain){ const ac=audioCtx(); if(!ac) return; const o=ac.createOscillator(); const g=ac.createGain();
  o.type=type||'sine'; o.frequency.value=freq; const t0=ac.currentTime+start; o.connect(g); g.connect(ac.destination);
  g.gain.setValueAtTime(0.0001,t0); g.gain.exponentialRampToValueAtTime(gain||0.16,t0+0.02); g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  o.start(t0); o.stop(t0+dur+0.03); }
function sfx(kind){ try{ if(typeof state!=='undefined' && state.sound===false) return;
  if(kind==='correct'){ _tone(660,0,0.12,'sine'); _tone(880,0.09,0.16,'sine'); }
  else if(kind==='coin'){ _tone(988,0,0.07,'square',0.11); _tone(1319,0.06,0.12,'square',0.11); }
  else if(kind==='wrong'){ _tone(196,0,0.22,'sawtooth',0.11); }
  else if(kind==='level'){ [523,659,784,1047].forEach((f,i)=>_tone(f,i*0.1,0.22,'triangle',0.15)); }
  else if(kind==='win'){ [523,659,784,1047,1319].forEach((f,i)=>_tone(f,i*0.09,0.26,'triangle',0.16)); }
  else if(kind==='lose'){ [392,330,262].forEach((f,i)=>_tone(f,i*0.13,0.28,'sawtooth',0.12)); }
  else if(kind==='tick'){ _tone(523,0,0.05,'square',0.09); }
}catch(e){} }
// a clear two-tone "boop" that stands in for a hidden word when reading a sentence aloud
// (plays regardless of the SFX setting — it is part of the spoken question, not a game effect)
function beep(){ try{ _tone(880,0,0.18,'square',0.17); _tone(620,0.17,0.18,'square',0.15); }catch(e){} }
(function injectFX(){ try{ if(document.getElementById('sb-fx-style')) return; const st=document.createElement('style'); st.id='sb-fx-style';
  st.textContent='@keyframes sb-conf{0%{transform:translateY(-12vh) rotate(0);opacity:1}100%{transform:translateY(106vh) rotate(720deg);opacity:.85}}';
  document.head.appendChild(st); }catch(e){} })();
function burstConfetti(n){ try{ n=n||90; const colors=['#7C5CFF','#FFC83D','#36D1FF','#FF4D8D','#39d98a','#FF8A3D'];
  const wrap=document.createElement('div'); wrap.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:90;overflow:hidden';
  for(let i=0;i<n;i++){ const d=document.createElement('div'); const c=colors[i%colors.length]; const left=Math.random()*100; const delay=Math.random()*0.3; const dur=1.1+Math.random()*1.2; const sz=6+Math.random()*7;
    d.style.cssText='position:absolute;top:-14px;left:'+left+'vw;width:'+sz+'px;height:'+(sz*0.6)+'px;background:'+c+';border-radius:6px;animation:sb-conf '+dur+'s '+delay+'s ease-in forwards';
    wrap.appendChild(d); }
  document.body.appendChild(wrap); setTimeout(()=>{ try{document.body.removeChild(wrap);}catch(e){} },2800);
}catch(e){} }

/* ---- world emblems (ported from worldEmblem()) — stroke:#fff ---- */
function worldEmblemSVG(id, size){
  size = size || 38;
  const w = (inner) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="display:block;filter:drop-shadow(0 2px 4px rgba(0,0,0,.25))">${inner}</svg>`;
  const p = (d) => `<path d="${d}"/>`;
  const dot = (cx,cy,r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="none"/>`;
  switch (id) {
    case 'spellbound': return w(p('M12 2.6l8 4.6v9.6L12 21.4 4 16.8V7.2z')+p('M12 8.4l3.4 2v4l-3.4 2-3.4-2v-4z'));
    case 'marquee': return w(p('M12 3l2 5.6 5.9.3-4.6 3.7 1.6 5.7L12 20l-4.9 3 1.6-5.7L4.1 8.9 10 8.6z'));
    case 'aurora': return w('<circle cx="12" cy="12" r="3.6"/><ellipse cx="12" cy="12" rx="9.4" ry="3.4" transform="rotate(-22 12 12)"/>');
    case 'anime': return w(p('M13.6 2.5L5 14.2h5.2L9.4 21.5 19 9.2h-5.2z'));
    case 'science': return w(p('M9.2 3h5.6M10.2 3v5.4L5.4 16.6A2 2 0 0 0 7.1 19.6h9.8a2 2 0 0 0 1.7-3l-4.8-8.2V3')+dot(11,15,0.9)+dot(14,16.5,0.7));
    case 'origami': return w(p('M21 3.2L3 10.4l7.3 2.6 2.6 7.3z')+p('M21 3.2L10.3 13'));
    case 'pixel': return w('<rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="8.5" y="13.5" width="7" height="6.5" rx="1"/>');
    case 'avatar': return w('<circle cx="12" cy="12" r="3"/>'+dot(12,3.6,1.4)+dot(20.4,12,1.4)+dot(12,20.4,1.4)+dot(3.6,12,1.4));
    default: return w(p('M12 2.6l8 4.6v9.6L12 21.4 4 16.8V7.2z'));
  }
}

/* ---- constants ---- */
const THEMES = [
  { id:'spellbound', label:'Spellbound', sub:'The bee',   c1:'#6C4FE0', c2:'#F6F4FC' },
  { id:'marquee',    label:'Spotlight',  sub:'On stage',  c1:'#9C6A08', c2:'#F7F1E2' },
  { id:'aurora',     label:'Galaxy',     sub:'Cosmic',    c1:'#4A5BD4', c2:'#F2F4FB' },
  { id:'anime',      label:'Blade',      sub:'Dojo',      c1:'#C43D5A', c2:'#FAF1F3' },
  { id:'science',    label:'Lab',        sub:'Field notes',c1:'#0E8A78', c2:'#EFF6F3' },
  { id:'origami',    label:'Origami',    sub:'Paper',     c1:'#C25A2E', c2:'#F8F2E8' },
  { id:'pixel',      label:'Arcade',     sub:'Game on',   c1:'#3B6FE0', c2:'#EFF3FA' },
  { id:'avatar',     label:'Elements',   sub:'Elemental', c1:'#2E8FB8', c2:'#EDF5F7' },
];
const THEME_LABEL = { spellbound:'Spellbound', marquee:'Spotlight', aurora:'Galaxy', anime:'Blade', science:'Lab', origami:'Origami', pixel:'Arcade', avatar:'Elements' };
const WORLD_DEF = {
  spellbound:'Grow a bee from a tiny egg to queen of the hive.',
  marquee:'Rise from a single spark to top billing on the marquee.',
  aurora:'Begin as stardust and bloom into a whole galaxy.',
  anime:'Train from raw student to undefeated master.',
  science:'Spark a reaction and chase it all the way to Eureka.',
  origami:'Fold a flat sheet into a soaring paper swan.',
  pixel:'Power up from a single bit to arcade legend.',
  avatar:'Bend every element, from pebble to elemental.',
};
const BUDDIES = ['bee','fox','owl','cat','panda','frog','penguin','bunny','dino','robot','dragon','narwhal','octopus','chick','unicorn','axolotl'];

const REVIEW = [
  { w:'liaison', d:'communication between groups', s:'She was the liaison between the two teams.', p:'lee-AY-zon', o:'French', r:'two i’s around the a' },
  { w:'mischievous', d:'causing trouble playfully', s:'The mischievous kitten hid my socks.', p:'MIS-chiv-us', o:'Old French', r:'no extra i: -vous not -vious' },
  { w:'rhythm', d:'a regular repeated pattern', s:'They clapped to the rhythm.', p:'RITH-um', o:'Greek', r:'two h’s, no vowels but y' },
  { w:'conscience', d:'sense of right and wrong', s:'His conscience told him to confess.', p:'KON-shuns', o:'Latin', r:'science hides inside con-' },
  { w:'silhouette', d:'a dark outline against light', s:'We saw the silhouette of the castle.', p:'sil-oo-ET', o:'French', r:'silhou + ette' },
  { w:'bureaucracy', d:'government by officials', s:'The bureaucracy slowed the project.', p:'byoo-ROK-ruh-see', o:'French', r:'bureau + cracy' },
  { w:'maintenance', d:'the act of keeping in good repair', s:'Car maintenance prevents breakdowns.', p:'MAYN-tuh-nuns', o:'Old French', r:'mainten + ance, no -ten-ence' },
  { w:'pharaoh', d:'a ruler of ancient Egypt', s:'The pharaoh built a great pyramid.', p:'FAIR-oh', o:'Egyptian', r:'-aoh ending, not -oah' },
  { w:'questionnaire', d:'a set of printed questions', s:'Please fill in the questionnaire.', p:'kwes-chuh-NAIR', o:'French', r:'double n before -aire' },
  { w:'connoisseur', d:'an expert judge of taste', s:'She is a connoisseur of fine art.', p:'kon-uh-SUR', o:'French', r:'double n, double s' },
];
const HINDI_WORDS = [
  { w:'bungalow', d:'a one-storey house', s:'They live in a small bungalow by the sea.', p:'BUNG-guh-loh', o:'Hindi', r:'from Hindi bangla "of Bengal"' },
  { w:'juggernaut', d:'a huge, unstoppable force', s:'The trend became a marketing juggernaut.', p:'JUG-er-nawt', o:'Hindi/Sanskrit', r:'from Jagannath, "lord of the world"' },
  { w:'pajamas', d:'loose clothes for sleeping', s:'He wore striped pajamas to bed.', p:'puh-JAH-muz', o:'Hindi/Persian', r:'from pae-jama "leg garment"' },
  { w:'shampoo', d:'a liquid soap for hair', s:'She bought coconut shampoo.', p:'sham-POO', o:'Hindi', r:'from champo "to press, knead"' },
  { w:'dungaree', d:'a coarse cotton cloth; overalls', s:'The painter wore faded dungarees.', p:'dung-guh-REE', o:'Hindi', r:'from dungri, a Mumbai district' },
  { w:'cummerbund', d:'a sash worn around the waist', s:'His tuxedo had a red cummerbund.', p:'KUM-er-bund', o:'Hindi/Persian', r:'from kamarband "waist-band"' },
  { w:'jodhpurs', d:'trousers for horse riding', s:'She pulled on her riding jodhpurs.', p:'JOD-perz', o:'Hindi', r:'named after the city Jodhpur' },
  { w:'mongoose', d:'a small animal that hunts snakes', s:'The mongoose darted into the bushes.', p:'MONG-goos', o:'Marathi/Hindi', r:'from mangus; plural is mongooses' },
  { w:'verandah', d:'a roofed porch along a house', s:'We sipped tea on the verandah.', p:'vuh-RAN-duh', o:'Hindi/Portuguese', r:'-andah ending' },
  { w:'chutney', d:'a spicy relish of fruit and spices', s:'She served mango chutney with the rice.', p:'CHUT-nee', o:'Hindi', r:'from chatni' },
];
const WORDS = [
  { w:'iridescent', d:'showing shifting rainbow colours', s:'The soap bubble had an iridescent shine.', p:'ir-ih-DESS-ent', o:'Latin', r:'from Latin iris "rainbow" + -escent "becoming"', y:4 },
  { w:'buoyant', d:'able to float; cheerful', s:'The raft was buoyant enough to carry us all.', p:'BOY-ant', o:'Spanish', r:'from Spanish boyar "to float"', y:3 },
  { w:'gregarious', d:'fond of company; sociable', s:'Her gregarious puppy greets every visitor.', p:'gruh-GAIR-ee-us', o:'Latin', r:'from Latin grex "flock, herd"', y:4 },
  { w:'labyrinth', d:'a maze of winding paths', s:'The old castle had a labyrinth of tunnels.', p:'LAB-uh-rinth', o:'Greek', r:'from Greek labyrinthos', y:3 },
  { w:'nonchalant', d:'calm and not worried', s:'He gave a nonchalant shrug at the news.', p:'non-shuh-LAHNT', o:'French', r:'from French nonchaloir "to lack warmth"', y:4 },
  { w:'silhouette', d:'a dark outline against a light background', s:'We saw the silhouette of a cat on the blind.', p:'sil-oo-ET', o:'French', r:'named after Étienne de Silhouette', y:4 },
  { w:'kaleidoscope', d:'a tube that shows changing colour patterns', s:'The festival was a kaleidoscope of lights.', p:'kuh-LY-duh-skope', o:'Greek', r:'from Greek kalos "beautiful" + eidos "form" + skopein "to look"', y:4 },
  { w:'vehement', d:'showing strong, forceful feeling', s:'She gave a vehement no to the idea.', p:'VEE-uh-ment', o:'Latin', r:'from Latin vehemens "eager, violent"', y:5 },
  { w:'ubiquitous', d:'seeming to be everywhere at once', s:'Phones are ubiquitous in the city.', p:'yoo-BIK-wih-tus', o:'Latin', r:'from Latin ubique "everywhere"', y:5 },
  { w:'mnemonic', d:'a trick that helps you remember', s:'"ROY G BIV" is a mnemonic for the rainbow.', p:'nih-MON-ik', o:'Greek', r:'from Greek mnemonikos "of memory"', y:5 },
  { w:'rhapsody', d:'a piece of music full of feeling; great joy', s:'The pianist played a sweeping rhapsody.', p:'RAP-suh-dee', o:'Greek', r:'from Greek rhaptein "to stitch" + oide "song"', y:4 },
  { w:'zephyr', d:'a soft, gentle breeze', s:'A warm zephyr drifted through the orchard.', p:'ZEFF-er', o:'Greek', r:'from Greek Zephyros, god of the west wind', y:3 },
  { w:'facsimile', d:'an exact copy', s:'The museum showed a facsimile of the old map.', p:'fak-SIM-uh-lee', o:'Latin', r:'from Latin fac simile "make alike"', y:5 },
  { w:'juxtapose', d:'to place side by side for comparison', s:'The artist liked to juxtapose old and new.', p:'JUK-stuh-pohz', o:'Latin', r:'from Latin juxta "next to" + French poser "to place"', y:5 },
  { w:'ebullient', d:'full of bubbly excitement', s:'She was ebullient after winning the round.', p:'ih-BULL-yent', o:'Latin', r:'from Latin ebullire "to bubble up"', y:5 },
  { w:'paradigm', d:'a typical model or example', s:'The school is a paradigm of good teaching.', p:'PAIR-uh-dime', o:'Greek', r:'from Greek paradeigma "pattern"', y:5 },
];
