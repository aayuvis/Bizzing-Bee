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
window.SB_MASCOT = mascotSVG;
