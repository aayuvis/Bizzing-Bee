/* Bizzing Bee — collectible avatars ("blooks"): 150 characters in 15 packs (art in avatars-art.js).
   Blooket-style squircle characters drawn with the app's palette + duotone cheer.
   window.SB_AVATARS = defs (pack, rarity, price); window.SB_AVATAR(id, size) = SVG. */
(function(){
  const RAR = { free:{label:'Starter', c:'#7B8794', price:0, sell:0},
                rare:{label:'Rare', c:'#3D7DF0', price:120, sell:60},
                epic:{label:'Epic', c:'#B14FC4', price:250, sell:125},
                legendary:{label:'Legendary', c:'#F0B429', price:500, sell:250} };
  const PACKS = [
    { id:'hive',   label:'Hive Pack',   world:'spellbound', c1:'#6C4FE0', c2:'#FFC23D' },
    { id:'stage',  label:'Stage Pack',  world:'spotlight',  c1:'#9C6A08', c2:'#F7E9C8' },
    { id:'cosmos', label:'Cosmos Pack', world:'galaxy',     c1:'#4A5BD4', c2:'#36D1FF' },
    { id:'dojo',   label:'Dojo Pack',   world:'blade',      c1:'#C43D5A', c2:'#FFD23F' },
    { id:'lab',    label:'Lab Pack',    world:'lab',        c1:'#0E8A78', c2:'#9BE34D' },
    { id:'arcade', label:'Arcade Pack', world:'arcade',     c1:'#3B6FE0', c2:'#FF5D9E' },
    { id:'origami',label:'Origami Pack',world:'origami',    c1:'#C25A2E', c2:'#F2E9DA' },
    { id:'elements',label:'Elements Pack',world:'elements', c1:'#2E8FB8', c2:'#9BD3B4' },
    { id:'critter', label:'Critter Crew',  world:'spellbound', c1:'#E8845C', c2:'#FFD9A8' },
    { id:'vibe',    label:'Vibe Pack',     world:'galaxy',     c1:'#8A5CE8', c2:'#FF7FBE' },
    { id:'dino',    label:'Dino Pack',     world:'lab',        c1:'#6CB454', c2:'#F0A82A' },
    { id:'enchanted',label:'Enchanted Pack',world:'spellbound',c1:'#A05CC8', c2:'#FF9EC4' },
    { id:'wildhearts',label:'Wildhearts Pack',world:'blade',   c1:'#E86A9A', c2:'#FFC0D8' },
    { id:'legends', label:'Legends Pack',  world:'blade',      c1:'#4A7A5C', c2:'#7CFFB2' },
    { id:'turbo',   label:'Turbo Pack',    world:'arcade',     c1:'#E05C3A', c2:'#FFC23D' },
    { id:'villains',label:'Villains Pack', world:'greysea',    c1:'#8B857B', c2:'#C43D5A' },
  ];
  // shared drawing kit — every avatar is a 120x120 squircle character
  const SQ = (fill, extra) => `<rect x="10" y="14" width="100" height="96" rx="30" fill="${fill}"${extra||''}/>`;
  const GRAD = (id,a,b)=>`<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>`;
  const EYES = {
    dot:(y)=>`<circle cx="45" cy="${y}" r="6.5" fill="#241E33"/><circle cx="75" cy="${y}" r="6.5" fill="#241E33"/><circle cx="47" cy="${y-2}" r="2" fill="#fff"/><circle cx="77" cy="${y-2}" r="2" fill="#fff"/>`,
    happy:(y)=>`<path d="M38 ${y} q7 -8 14 0" stroke="#241E33" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M68 ${y} q7 -8 14 0" stroke="#241E33" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    star:(y)=>{const s=(cx)=>{let p='';for(let i=0;i<10;i++){const r=i%2?3.4:8,a=-Math.PI/2+i*Math.PI/5;p+=(i?'L':'M')+(cx+r*Math.cos(a)).toFixed(1)+' '+(y+r*Math.sin(a)).toFixed(1);}return p+'Z';};return `<path d="${s(45)}" fill="#241E33"/><path d="${s(75)}" fill="#241E33"/>`;},
    wink:(y)=>`<circle cx="45" cy="${y}" r="6.5" fill="#241E33"/><circle cx="47" cy="${y-2}" r="2" fill="#fff"/><path d="M68 ${y} q7 -6 14 0" stroke="#241E33" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    visor:(y)=>`<rect x="30" y="${y-10}" width="60" height="18" rx="9" fill="#241E33"/><rect x="34" y="${y-6}" width="22" height="7" rx="3.5" fill="#5EC2FF" opacity=".9"/>`,
  };
  const MOUTH = {
    smile:(y)=>`<path d="M48 ${y} q12 10 24 0" stroke="#241E33" stroke-width="4.5" fill="none" stroke-linecap="round"/>`,
    open:(y)=>`<path d="M50 ${y} q10 14 20 0 z" fill="#3A1E5C"/><path d="M55 ${y+6} q5 4 10 0 z" fill="#FF6FA0"/>`,
    ooh:(y)=>`<ellipse cx="60" cy="${y+2}" rx="7" ry="9" fill="#3A1E5C"/>`,
    flat:(y)=>`<path d="M50 ${y} h20" stroke="#241E33" stroke-width="4.5" stroke-linecap="round"/>`,
  };
  const CHEEKS=(y)=>`<ellipse cx="32" cy="${y}" rx="7" ry="4.5" fill="#FF7FBE" opacity=".7"/><ellipse cx="88" cy="${y}" rx="7" ry="4.5" fill="#FF7FBE" opacity=".7"/>`;
  const CROWN=(x,y,s)=>`<path d="M${x-14*s} ${y} l${4*s} -${10*s} l${6*s} ${7*s} l${4*s} -${11*s} l${4*s} ${11*s} l${6*s} -${7*s} l${4*s} ${10*s} z" fill="#F0B429" stroke="#C8901B" stroke-width="2"/>`;
  const D = {}; // id -> draw()
  // ---------- HIVE ----------
  D.bizzy = () => ((window.mascotSVG||window.SB_MASCOT)? '<g transform="translate(4,2) scale(.47)">'+(window.mascotSVG||window.SB_MASCOT)('happy').replace(/<\/?svg[^>]*>/g,'')+'</g>' :
    GRAD('gbz','#FFC23D','#F0A93C')+SQ('url(#gbz)')+`<rect x="10" y="72" width="100" height="12" fill="#3A2A8C"/><rect x="10" y="92" width="100" height="12" fill="#3A2A8C"/>`+EYES.dot(52)+MOUTH.smile(72)+CHEEKS(64));
  D.honeypot = () => GRAD('ghp','#E8A33D','#C8791B')+`<path d="M20 50 q0 -16 40 -16 q40 0 40 16 q6 4 6 12 q0 8 -6 12 q4 34 -40 34 q-44 0 -40 -34 q-6 -4 -6 -12 q0 -8 6 -12z" fill="url(#ghp)"/><ellipse cx="60" cy="38" rx="34" ry="9" fill="#FFD86E"/><path d="M40 44 q6 12 -2 18" stroke="#FFD86E" stroke-width="7" fill="none" stroke-linecap="round"/>`+EYES.happy(68)+MOUTH.open(80)+CHEEKS(76);
  D.bumble = () => GRAD('gbb','#FFD24D','#FFC23D')+SQ('url(#gbb)')+`<ellipse cx="26" cy="26" rx="12" ry="18" fill="#EDE7FF" stroke="#C4B4FF" stroke-width="2.5" transform="rotate(-30 26 26)"/><ellipse cx="94" cy="26" rx="12" ry="18" fill="#EDE7FF" stroke="#C4B4FF" stroke-width="2.5" transform="rotate(30 94 26)"/><rect x="10" y="80" width="100" height="14" fill="#241E33"/>`+EYES.wink(54)+MOUTH.smile(70)+CHEEKS(62);
  D.blossom = () => GRAD('gbl','#FF9AC9','#FF5FA2')+[0,60,120,180,240,300].map(a=>`<ellipse cx="60" cy="28" rx="16" ry="26" fill="url(#gbl)" transform="rotate(${a} 60 62)"/>`).join('')+`<circle cx="60" cy="62" r="34" fill="#FFD86E"/>`+EYES.happy(58)+MOUTH.open(72)+CHEEKS(66);
  D.queenhive = () => GRAD('gqh','#8B6FF0','#5A37D6')+SQ('url(#gqh)')+`<rect x="10" y="78" width="100" height="12" fill="#FFC23D"/><rect x="10" y="96" width="100" height="10" fill="#FFC23D"/>`+CROWN(60,26,1.4)+EYES.star(56)+MOUTH.smile(74)+CHEEKS(66)+`<circle cx="22" cy="44" r="2.5" fill="#FFD34D"/><circle cx="98" cy="40" r="2.5" fill="#FFD34D"/>`;
  // ---------- STAGE ----------
  D.star = () => {let p='';for(let i=0;i<10;i++){const r=i%2?26:52,a=-Math.PI/2+i*Math.PI/5;p+=(i?'L':'M')+(60+r*Math.cos(a)).toFixed(1)+' '+(62+r*Math.sin(a)).toFixed(1);}
    return GRAD('gst','#FFD34D','#F0A93C')+`<path d="${p}Z" fill="url(#gst)" stroke="#C8901B" stroke-width="2.5"/>`+EYES.dot(56)+MOUTH.open(72)+CHEEKS(64);};
  D.mic = () => GRAD('gmc','#B8B2C8','#847E96')+`<rect x="48" y="66" width="24" height="34" rx="8" fill="#3A3450"/><circle cx="60" cy="48" r="34" fill="url(#gmc)"/><path d="M32 36 q28 -18 56 0" stroke="#3A3450" stroke-width="4" fill="none"/><path d="M30 48 h60 M34 60 h52" stroke="#3A3450" stroke-width="3"/>`+EYES.happy(46)+MOUTH.ooh(58)+CHEEKS(52);
  D.maestro = () => GRAD('gma','#F7E9C8','#E8D5A0')+SQ('url(#gma)')+`<rect x="30" y="4" width="60" height="22" rx="5" fill="#241E33"/><rect x="22" y="24" width="76" height="7" rx="3.5" fill="#241E33"/><path d="M45 96 l15 -8 l15 8 l-15 8 z" fill="#C43D5A"/>`+EYES.dot(56)+MOUTH.smile(74)+CHEEKS(66);
  D.diva = () => GRAD('gdv','#FF9AC9','#E8458C')+SQ('url(#gdv)')+`<path d="M28 44 h28 v14 q0 8 -14 8 q-14 0 -14 -8 z M64 44 h28 v14 q0 8 -14 8 q-14 0 -14 -8 z" fill="#241E33"/><path d="M56 48 h8" stroke="#241E33" stroke-width="4"/><circle cx="38" cy="50" r="3" fill="#fff" opacity=".8"/>`+MOUTH.open(78)+CHEEKS(72)+`<circle cx="20" cy="24" r="2.5" fill="#fff"/><circle cx="100" cy="30" r="2.5" fill="#fff"/>`;
  D.goldlegend = () => GRAD('ggl','#FFD24D','#C8901B')+`<path d="M30 30 h60 v26 q0 26 -30 26 q-30 0 -30 -26 z" fill="url(#ggl)"/><path d="M30 36 q-16 2 -6 18 q6 9 12 8 M90 36 q16 2 6 18 q-6 9 -12 8" fill="none" stroke="#C8901B" stroke-width="5"/><rect x="52" y="80" width="16" height="12" fill="#C8901B"/><rect x="40" y="92" width="40" height="12" rx="4" fill="#8A5B00"/>`+EYES.star(48)+MOUTH.smile(62)+CROWN(60,22,1);
  // ---------- COSMOS ----------
  D.luna = () => GRAD('glu','#E9EDF8','#B9C4E8')+`<path d="M78 14 a48 48 0 1 0 0 96 a38 38 0 0 1 0 -96z" fill="url(#glu)"/><circle cx="44" cy="46" r="6" fill="#9AA6CF" opacity=".6"/><circle cx="36" cy="72" r="4" fill="#9AA6CF" opacity=".6"/>`+EYES.happy(56)+MOUTH.smile(72)+`<circle cx="90" cy="30" r="2.5" fill="#FFD34D"/><circle cx="98" cy="52" r="2" fill="#FFD34D"/>`;
  D.astro = () => GRAD('gas','#F2F4FA','#C9D2EA')+SQ('url(#gas)')+`<circle cx="60" cy="58" r="30" fill="#241E33"/><ellipse cx="52" cy="50" rx="10" ry="6" fill="#5EC2FF" opacity=".7" transform="rotate(-20 52 50)"/><rect x="42" y="96" width="36" height="10" rx="5" fill="#FF5D9E"/>`+`<circle cx="24" cy="28" r="2" fill="#4A5BD4"/><circle cx="96" cy="24" r="2.5" fill="#4A5BD4"/>`;
  D.comet = () => GRAD('gcm','#36D1FF','#4A5BD4')+`<path d="M14 96 q10 -34 34 -52 q20 -14 44 -18 q4 22 -8 44 q-14 24 -44 32 q-16 4 -26 -6z" fill="url(#gcm)"/><circle cx="74" cy="48" r="26" fill="#FFD86E"/>`+EYES.dot(44)+MOUTH.open(58)+`<path d="M18 60 q8 -4 14 2 M24 78 q8 -4 14 2" stroke="#9BE3FF" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  D.saturn = () => GRAD('gsa','#E8A33D','#C8791B')+`<circle cx="60" cy="60" r="36" fill="url(#gsa)"/><ellipse cx="60" cy="66" rx="54" ry="14" fill="none" stroke="#8B6FF0" stroke-width="7"/><path d="M24 60 a36 36 0 0 0 72 0" fill="none"/>`+EYES.wink(52)+MOUTH.smile(70)+CHEEKS(62);
  D.nebula = () => GRAD('gne','#8B6FF0','#36D1FF')+SQ('url(#gne)')+`<path d="M26 14 q-8 14 6 18 M94 14 q8 14 -6 18" stroke="#36D1FF" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M34 110 l8 -12 l8 12 M70 110 l8 -12 l8 12" fill="#5A37D6"/>`+EYES.star(52)+`<path d="M46 72 q14 12 28 0 l-6 6 l-8 -4 l-8 4 z" fill="#241E33"/>`+`<circle cx="26" cy="90" r="2.5" fill="#fff"/><circle cx="94" cy="86" r="2" fill="#fff"/><circle cx="86" cy="98" r="2.5" fill="#fff"/>`;
  // ---------- DOJO ----------
  D.ninja = () => GRAD('gnj','#3A3450','#241E33')+SQ('url(#gnj)')+`<rect x="18" y="42" width="84" height="26" rx="13" fill="#F5E7EB"/><path d="M102 50 l14 -8 l-4 14 z" fill="#C43D5A"/>`+EYES.dot(55)+`<circle cx="45" cy="53" r="1.6" fill="#fff"/>`;
  D.panda = () => GRAD('gpd','#FFFFFF','#EDE9F2')+SQ('url(#gpd)',' stroke="#D9D2E4" stroke-width="2"')+`<circle cx="24" cy="20" r="13" fill="#241E33"/><circle cx="96" cy="20" r="13" fill="#241E33"/><ellipse cx="45" cy="54" rx="12" ry="14" fill="#241E33"/><ellipse cx="75" cy="54" rx="12" ry="14" fill="#241E33"/>`+`<circle cx="45" cy="54" r="5" fill="#fff"/><circle cx="75" cy="54" r="5" fill="#fff"/><circle cx="46" cy="53" r="2.4" fill="#241E33"/><circle cx="76" cy="53" r="2.4" fill="#241E33"/><ellipse cx="60" cy="74" rx="7" ry="5" fill="#241E33"/>`+MOUTH.smile(82)+`<rect x="26" y="96" width="68" height="9" rx="4.5" fill="#C43D5A"/>`;
  D.samurai = () => GRAD('gsm','#C43D5A','#A33232')+SQ('url(#gsm)')+`<path d="M20 34 q40 -22 80 0 l-6 14 q-34 -16 -68 0 z" fill="#241E33"/><path d="M52 20 q8 -14 16 0 l-4 12 h-8 z" fill="#F0B429"/><circle cx="60" cy="30" r="5" fill="#F0B429"/>`+EYES.dot(58)+MOUTH.flat(76)+CHEEKS(68);
  D.kitsune = () => GRAD('gkt','#FF9A62','#E8458C')+`<path d="M22 34 l-6 -24 l24 12 z M98 34 l6 -24 l-24 12 z" fill="url(#gkt)"/>`+SQ('url(#gkt)')+`<path d="M40 88 q20 14 40 0 q-4 16 -20 16 q-16 0 -20 -16z" fill="#fff" opacity=".9"/>`+EYES.wink(54)+`<path d="M54 70 q6 6 12 0" stroke="#241E33" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M30 66 h12 M78 66 h12" stroke="#C43D5A" stroke-width="3.5" stroke-linecap="round"/>`;
  D.dragonmaster = () => GRAD('gdm','#2E9E6B','#0E6E48')+SQ('url(#gdm)')+`<path d="M28 14 q-4 -12 10 -8 q10 2 6 12 M92 14 q4 -12 -10 -8 q-10 2 -6 12" fill="#F0B429"/><path d="M14 62 q-10 6 0 14 M106 62 q10 6 0 14" stroke="#2E9E6B" stroke-width="8" fill="none"/><path d="M48 96 q12 10 24 0 l-4 10 h-16 z" fill="#F0B429"/>`+EYES.star(52)+`<path d="M46 72 q14 12 28 0" stroke="#241E33" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M42 40 l8 -8 M78 32 l-8 8" stroke="#9BE34D" stroke-width="4" stroke-linecap="round"/>`;
  // ---------- LAB ----------
  D.beaker = () => GRAD('gbk','#BFE4F2','#8FCBE0')+`<path d="M44 14 h32 v26 l20 44 q6 18 -12 22 h-48 q-18 -4 -12 -22 l20 -44 z" fill="url(#gbk)" opacity=".95"/><path d="M32 74 q28 -12 56 0 l8 16 q4 14 -10 16 h-52 q-14 -2 -10 -16 z" fill="#9BE34D"/><circle cx="48" cy="88" r="4" fill="#fff" opacity=".8"/><circle cx="72" cy="94" r="3" fill="#fff" opacity=".8"/>`+EYES.dot(54)+MOUTH.smile(66);
  D.atom = () => GRAD('gat','#0E8A78','#0A6154')+`<circle cx="60" cy="62" r="24" fill="url(#gat)"/>`+[0,60,120].map(a=>`<ellipse cx="60" cy="62" rx="48" ry="18" fill="none" stroke="#3BC0AA" stroke-width="4" transform="rotate(${a} 60 62)"/>`).join('')+`<circle cx="108" cy="62" r="5" fill="#9BE34D"/><circle cx="36" cy="30" r="5" fill="#9BE34D"/>`+EYES.happy(58)+MOUTH.ooh(70);
  D.robo = () => GRAD('grb','#B8C4CC','#8A9AA6')+SQ('url(#grb)')+`<rect x="54" y="2" width="4" height="14" fill="#8A9AA6"/><circle cx="56" cy="2" r="5" fill="#FF5D9E"/><rect x="24" y="40" width="72" height="28" rx="10" fill="#241E33"/><circle cx="45" cy="54" r="8" fill="#5EC2FF"/><circle cx="75" cy="54" r="8" fill="#5EC2FF"/><circle cx="45" cy="54" r="3" fill="#fff"/><circle cx="75" cy="54" r="3" fill="#fff"/><rect x="42" y="80" width="36" height="8" rx="4" fill="#241E33"/><rect x="46" y="80" width="5" height="8" fill="#8A9AA6"/><rect x="58" y="80" width="5" height="8" fill="#8A9AA6"/><rect x="70" y="80" width="5" height="8" fill="#8A9AA6"/>`;
  D.brainiac = () => GRAD('gbr','#FF9AC9','#E876B8')+`<path d="M60 16 q-26 0 -30 22 q-14 4 -8 20 q-8 14 8 22 q2 20 26 18 h8 q24 2 26 -18 q16 -8 8 -22 q6 -16 -8 -20 q-4 -22 -30 -22z" fill="url(#gbr)"/><path d="M60 20 v76 M38 36 q10 8 0 18 M82 36 q-10 8 0 18 M40 72 q10 -6 18 2 M80 72 q-10 -6 -18 2" stroke="#C9558E" stroke-width="4" fill="none" stroke-linecap="round"/>`+`<rect x="34" y="52" width="22" height="14" rx="7" fill="#241E33"/><rect x="64" y="52" width="22" height="14" rx="7" fill="#241E33"/><rect x="56" y="56" width="8" height="4" fill="#241E33"/><circle cx="41" cy="58" r="3" fill="#5EC2FF"/><circle cx="71" cy="58" r="3" fill="#5EC2FF"/>`+MOUTH.smile(80);
  D.phoenix = () => GRAD('gph','#FF9A3D','#E84545')+`<path d="M60 8 q10 18 2 28 q16 -6 22 8 q14 -2 12 16 q14 10 -2 24 q0 22 -34 24 q-34 -2 -34 -24 q-16 -14 -2 -24 q-2 -18 12 -16 q6 -14 22 -8 q-8 -10 2 -28z" fill="url(#gph)"/><path d="M44 96 q16 10 32 0" stroke="#FFD86E" stroke-width="5" fill="none" stroke-linecap="round"/>`+EYES.star(60)+MOUTH.open(76)+`<circle cx="24" cy="40" r="2.5" fill="#FFD86E"/><circle cx="96" cy="36" r="2.5" fill="#FFD86E"/>`;
  // ---------- ARCADE ----------
  D.pixel = () => { const px=(x,y,c)=>`<rect x="${x}" y="${y}" width="12" height="12" fill="${c}"/>`; let o='';
    const grid=[[3,1],[4,1],[5,1],[6,1],[2,2],[7,2],[1,3],[8,3],[1,4],[8,4],[1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[2,6],[7,6],[3,7],[6,7]];
    grid.forEach(([gx,gy])=>{ o+=px(gx*12,14+gy*11,'#3B6FE0'); });
    return o+`<rect x="38" y="52" width="12" height="12" fill="#fff"/><rect x="70" y="52" width="12" height="12" fill="#fff"/><rect x="41" y="55" width="6" height="6" fill="#241E33"/><rect x="73" y="55" width="6" height="6" fill="#241E33"/><rect x="48" y="76" width="24" height="6" fill="#FF5D9E"/>`; };
  D.joy = () => GRAD('gjy','#5A5F73','#3A3F52')+`<rect x="22" y="66" width="76" height="38" rx="14" fill="url(#gjy)"/><rect x="52" y="26" width="12" height="40" rx="6" fill="#8A90A6"/><circle cx="58" cy="24" r="16" fill="#FF5D9E"/><circle cx="53" cy="19" r="5" fill="#fff" opacity=".6"/><circle cx="82" cy="80" r="7" fill="#FFD34D"/><circle cx="94" cy="90" r="7" fill="#9BE34D"/>`+`<circle cx="38" cy="82" r="4" fill="#5EC2FF"/><path d="M34 94 q6 5 12 0" stroke="#5EC2FF" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  D.ghost = () => GRAD('ggh','#7BA3F5','#4A6FD4')+`<path d="M22 60 q0 -40 38 -40 q38 0 38 40 v42 l-12 -9 l-13 9 l-13 -9 l-13 9 l-13 -9 l-12 9 z" fill="url(#ggh)"/>`+`<circle cx="45" cy="52" r="10" fill="#fff"/><circle cx="77" cy="52" r="10" fill="#fff"/><circle cx="48" cy="54" r="5" fill="#241E33"/><circle cx="80" cy="54" r="5" fill="#241E33"/>`+MOUTH.ooh(74);
  D.bossbot = () => GRAD('gbo','#8B5CF6','#5A37D6')+SQ('url(#gbo)')+`<path d="M28 14 l-8 -10 M92 14 l8 -10" stroke="#241E33" stroke-width="5" stroke-linecap="round"/><circle cx="20" cy="2" r="4" fill="#FF5D9E"/><circle cx="100" cy="2" r="4" fill="#FF5D9E"/>`+EYES.visor(54)+`<path d="M44 78 l8 6 l8 -6 l8 6 l8 -6" stroke="#241E33" stroke-width="4.5" fill="none" stroke-linecap="round"/>`+CROWN(60,30,0.9);
  D.rainbow = () => GRAD('grw','#4A4F63','#2F3344')+`<rect x="22" y="20" width="76" height="84" rx="10" fill="url(#grw)"/><rect x="34" y="10" width="52" height="18" rx="5" fill="#6A7086"/>`+['#FF5D9E','#FFD34D','#9BE34D','#5EC2FF','#B18CFF'].map((c,i)=>`<rect x="30" y="${34+i*8}" width="60" height="6" rx="3" fill="${c}"/>`).join('')+EYES.dot(88)+MOUTH.smile(98).replace('M48','M50').replace('q12','q10');
  const EARS={ cat:(c)=>`<path d="M20 22 l6 -18 l16 12 z M100 22 l-6 -18 l-16 12 z" fill="${c}"/>`,
    bunny:(c)=>`<ellipse cx="38" cy="6" rx="9" ry="20" fill="${c}"/><ellipse cx="82" cy="6" rx="9" ry="20" fill="${c}"/><ellipse cx="38" cy="8" rx="4" ry="13" fill="#FF9AC9" opacity=".7"/><ellipse cx="82" cy="8" rx="4" ry="13" fill="#FF9AC9" opacity=".7"/>`,
    bear:(c)=>`<circle cx="26" cy="16" r="11" fill="${c}"/><circle cx="94" cy="16" r="11" fill="${c}"/>` };
  const HAT={ cap:(c)=>`<path d="M30 20 q30 -18 60 0 l0 8 h-60z" fill="${c}"/><path d="M88 26 h24 q2 6 -4 8 h-20z" fill="${c}"/><circle cx="60" cy="10" r="4" fill="#fff" opacity=".8"/>`,
    wizard:(c)=>`<path d="M60 -8 l22 34 h-44 z" fill="${c}"/><path d="M28 26 h64 q4 6 -2 8 h-60 q-6 -2 -2 -8z" fill="${c}"/><circle cx="60" cy="8" r="3" fill="#FFD34D"/>`,
    band:(c)=>`<rect x="14" y="22" width="92" height="12" rx="6" fill="${c}"/><path d="M100 26 l16 -8 l-4 16 z" fill="${c}"/>` };
  const NOTE=(x,y)=>`<path d="M${x} ${y} v-16 l12 -4 v16" stroke="#241E33" stroke-width="4" fill="none"/><circle cx="${x-1}" cy="${y}" r="5" fill="#241E33"/><circle cx="${x+11}" cy="${y-4}" r="5" fill="#241E33"/>`;
  const SPARK=(x,y,c)=>`<path d="M${x} ${y-7} l2.5 5 l5 2 l-5 2 l-2.5 5 l-2.5 -5 l-5 -2 l5 -2 z" fill="${c||'#FFD34D'}"/>`;
  const WING=(x,f)=>`<ellipse cx="${x}" cy="30" rx="11" ry="17" fill="#EDE7FF" stroke="#C4B4FF" stroke-width="2.5" transform="rotate(${f?-28:28} ${x} 30)"/>`;
  // ---- HIVE +5 ----
  D.waggle=()=>GRAD('gwg','#FFC23D','#F0A93C')+SQ('url(#gwg)')+WING(24,1)+WING(96)+`<rect x="10" y="84" width="100" height="12" fill="#3A2A8C"/>`+EYES.happy(52)+MOUTH.open(68)+CHEEKS(60)+NOTE(92,26);
  D.drone=()=>GRAD('gdr','#B8C4CC','#8FA3B0')+SQ('url(#gdr)')+HAT.cap('#3A2A8C')+EYES.dot(58)+MOUTH.smile(76)+`<rect x="10" y="92" width="100" height="10" fill="#3A2A8C"/>`;
  D.clover=()=>GRAD('gcl','#7BC96F','#4F9E5A')+SQ('url(#gcl)')+`<g transform="translate(88,18) scale(.8)"><circle cx="0" cy="-8" r="7" fill="#4F9E5A"/><circle cx="-7" cy="2" r="7" fill="#4F9E5A"/><circle cx="7" cy="2" r="7" fill="#4F9E5A"/><rect x="-2" y="4" width="4" height="12" rx="2" fill="#3A7A44"/></g>`+EYES.happy(54)+MOUTH.smile(72)+CHEEKS(64);
  D.nectar=()=>GRAD('gnc','#FF9AC9','#E8458C')+`<path d="M60 10 q34 34 34 58 a34 34 0 0 1 -68 0 q0 -24 34 -58z" fill="url(#gnc)"/><ellipse cx="48" cy="52" rx="7" ry="10" fill="#fff" opacity=".5" transform="rotate(-18 48 52)"/>`+EYES.dot(70)+MOUTH.smile(86)+CHEEKS(78);
  D.propolis=()=>GRAD('gpp','#E8A33D','#8A5B00')+`<path d="M60 12 l42 14 v34 q0 34 -42 48 q-42 -14 -42 -48 v-34 z" fill="url(#gpp)"/><path d="M60 24 l28 9 v26 q0 24 -28 34 q-28 -10 -28 -34 v-26 z" fill="#FFD86E"/>`+EYES.dot(58)+MOUTH.smile(74)+SPARK(88,30,'#fff');
  // ---- STAGE +5 ----
  D.jester=()=>GRAD('gjs','#B14FC4','#7B2E8E')+SQ('url(#gjs)')+`<path d="M24 24 q-10 -22 12 -16 l8 10 M96 24 q10 -22 -12 -16 l-8 10 M52 16 q8 -18 16 0 l-4 8 h-8z" fill="#FFD23F"/><circle cx="22" cy="6" r="5" fill="#FF5D9E"/><circle cx="98" cy="6" r="5" fill="#5EC2FF"/><circle cx="60" cy="4" r="5" fill="#9BE34D"/>`+EYES.wink(56)+MOUTH.open(72)+CHEEKS(64);
  D.lumen=()=>GRAD('glm','#FFD86E','#C8901B')+`<path d="M36 20 h48 l10 44 h-68 z" fill="#3A3450"/><ellipse cx="60" cy="66" rx="36" ry="10" fill="#FFD86E" opacity=".9"/><path d="M40 76 l-10 30 M80 76 l10 30 M60 78 v30" stroke="#3A3450" stroke-width="5" stroke-linecap="round"/>`+`<circle cx="48" cy="42" r="5" fill="#fff"/><circle cx="72" cy="42" r="5" fill="#fff"/><circle cx="49" cy="43" r="2.4" fill="#241E33"/><circle cx="73" cy="43" r="2.4" fill="#241E33"/><path d="M50 54 q10 8 20 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  D.popcorn=()=>GRAD('gpc','#F5E7EB','#E8D5DB')+`<path d="M28 46 h64 l-8 60 h-48 z" fill="url(#gpc)"/><path d="M34 46 v58 M48 46 v60 M62 46 v60 M76 46 v58" stroke="#C43D5A" stroke-width="7"/><circle cx="38" cy="36" r="11" fill="#FFF7E0"/><circle cx="58" cy="30" r="13" fill="#FFF7E0"/><circle cx="80" cy="36" r="11" fill="#FFF7E0"/>`+EYES.dot(72)+MOUTH.open(86);
  D.melody=()=>GRAD('gme','#F7E9C8','#E8B23A')+SQ('url(#gme)')+NOTE(30,30)+NOTE(88,24)+EYES.happy(56)+MOUTH.open(72)+CHEEKS(64)+`<path d="M20 96 q40 14 80 0" stroke="#9C6A08" stroke-width="4" fill="none"/>`;
  D.encore=()=>GRAD('gen','#FF9AC9','#C4457E')+SQ('url(#gen)')+CROWN(60,20,0.8)+EYES.star(54)+MOUTH.open(72)+CHEEKS(62)+SPARK(24,40)+SPARK(96,36)+`<path d="M30 98 l8 -8 M90 98 l-8 -8" stroke="#FFD34D" stroke-width="4" stroke-linecap="round"/>`;
  // ---- COSMOS +5 ----
  D.rocket=()=>GRAD('grk','#F2F4FA','#C9D2EA')+`<path d="M60 8 q26 22 26 56 h-52 q0 -34 26 -56z" fill="url(#grk)"/><circle cx="60" cy="48" r="13" fill="#5EC2FF"/><circle cx="60" cy="48" r="13" fill="none" stroke="#4A5BD4" stroke-width="3"/><path d="M34 64 l-14 22 l20 -6 M86 64 l14 22 l-20 -6" fill="#C43D5A"/><path d="M50 90 q10 20 20 0 q-6 16 -10 22 q-4 -6 -10 -22z" fill="#FF9A3D"/>`+`<circle cx="55" cy="45" r="2.5" fill="#241E33"/><circle cx="65" cy="45" r="2.5" fill="#241E33"/><path d="M55 52 q5 4 10 0" stroke="#241E33" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  D.alien=()=>GRAD('gal','#9BE34D','#5FB87A')+`<ellipse cx="60" cy="64" rx="44" ry="46" fill="url(#gal)"/><path d="M42 20 q-4 -14 8 -12 M78 20 q4 -14 -8 -12" stroke="#5FB87A" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="50" cy="6" r="4" fill="#FFD34D"/><circle cx="70" cy="6" r="4" fill="#FFD34D"/>`+`<ellipse cx="45" cy="58" rx="10" ry="14" fill="#241E33"/><ellipse cx="75" cy="58" rx="10" ry="14" fill="#241E33"/><ellipse cx="42" cy="52" rx="3.5" ry="5" fill="#fff"/><ellipse cx="72" cy="52" rx="3.5" ry="5" fill="#fff"/>`+MOUTH.smile(82);
  D.blackhole=()=>GRAD('gbh','#3A3450','#12101E')+`<circle cx="60" cy="60" r="38" fill="url(#gbh)"/><ellipse cx="60" cy="60" rx="52" ry="12" fill="none" stroke="#8B6FF0" stroke-width="5" opacity=".8"/><circle cx="60" cy="60" r="22" fill="#000"/>`+`<circle cx="52" cy="56" r="4" fill="#fff"/><circle cx="68" cy="56" r="4" fill="#fff"/><path d="M52 68 q8 6 16 0" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round"/>`+SPARK(20,26,'#8B6FF0')+SPARK(100,30,'#36D1FF');
  D.supernova=()=>{let p='';for(let i=0;i<16;i++){const r=i%2?28:50,a=-Math.PI/2+i*Math.PI/8;p+=(i?'L':'M')+(60+r*Math.cos(a)).toFixed(1)+' '+(60+r*Math.sin(a)).toFixed(1);}return GRAD('gsn','#FFD34D','#FF5D9E')+`<path d="${p}Z" fill="url(#gsn)"/>`+EYES.star(54)+MOUTH.open(70)+SPARK(16,20)+SPARK(104,24,'#36D1FF');};
  D.ufo=()=>GRAD('guf','#B8C4CC','#7A8894')+`<ellipse cx="60" cy="64" rx="52" ry="18" fill="url(#guf)"/><path d="M34 58 q0 -30 26 -30 q26 0 26 30" fill="#5EC2FF" opacity=".85"/><circle cx="34" cy="70" r="4" fill="#FFD34D"/><circle cx="60" cy="74" r="4" fill="#FF5D9E"/><circle cx="86" cy="70" r="4" fill="#9BE34D"/>`+`<circle cx="53" cy="46" r="3.5" fill="#241E33"/><circle cx="67" cy="46" r="3.5" fill="#241E33"/><path d="M54 54 q6 5 12 0" stroke="#241E33" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  // ---- DOJO +5 ----
  D.neko=()=>GRAD('gnk','#F5E7EB','#E0C9D1')+EARS.cat('#E0C9D1')+SQ('url(#gnk)')+`<path d="M30 66 h-14 M30 74 h-12 M90 66 h14 M90 74 h12" stroke="#C43D5A" stroke-width="3" stroke-linecap="round"/><circle cx="60" cy="98" r="9" fill="#FFD23F"/><path d="M60 92 v12 M54 98 h12" stroke="#C8901B" stroke-width="2.5"/>`+EYES.happy(56)+`<path d="M56 70 q4 4 8 0" stroke="#241E33" stroke-width="3.5" fill="none" stroke-linecap="round"/>`+CHEEKS(66);
  D.bamboo=()=>GRAD('gbm','#7BC96F','#3A7A44')+`<rect x="40" y="10" width="40" height="100" rx="16" fill="url(#gbm)"/><path d="M40 40 h40 M40 72 h40" stroke="#2E5E36" stroke-width="5"/><path d="M80 24 q22 -10 24 8 q-14 8 -24 0z" fill="#5FB87A"/>`+`<circle cx="52" cy="52" r="4.5" fill="#241E33"/><circle cx="68" cy="52" r="4.5" fill="#241E33"/><path d="M52 62 q8 7 16 0" stroke="#241E33" stroke-width="3.5" fill="none" stroke-linecap="round"/>`+CHEEKS(60);
  D.oni=()=>GRAD('gon','#C43D5A','#7E2340')+SQ('url(#gon)')+`<path d="M36 16 l-6 -14 l14 8 z M84 16 l6 -14 l-14 8 z" fill="#FFD23F"/>`+EYES.star(52)+`<path d="M46 74 q14 10 28 0" stroke="#241E33" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M48 74 l4 7 M72 74 l-4 7" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`+CHEEKS(64);
  D.koi=()=>GRAD('gko','#FF9A62','#E84545')+`<path d="M18 60 q22 -34 60 -30 q30 4 24 30 q6 26 -24 30 q-38 4 -60 -30z" fill="url(#gko)"/><path d="M96 44 q18 -10 14 16 q4 26 -14 16 q6 -16 0 -32z" fill="#FF9A62"/><path d="M48 38 q10 10 0 22 M68 36 q10 12 0 26" stroke="#fff" stroke-width="4" fill="none" opacity=".6"/>`+`<circle cx="40" cy="56" r="5" fill="#241E33"/><circle cx="41" cy="54" r="1.8" fill="#fff"/><path d="M30 70 q6 5 12 1" stroke="#241E33" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  D.starsteel=()=>{let p='';for(let i=0;i<8;i++){const r=i%2?20:48,a=-Math.PI/2+i*Math.PI/4;p+=(i?'L':'M')+(60+r*Math.cos(a)).toFixed(1)+' '+(60+r*Math.sin(a)).toFixed(1);}return GRAD('gss','#B8C4CC','#5A6874')+`<path d="${p}Z" fill="url(#gss)"/><circle cx="60" cy="60" r="17" fill="#3A3450"/>`+`<circle cx="54" cy="57" r="3.5" fill="#5EC2FF"/><circle cx="66" cy="57" r="3.5" fill="#5EC2FF"/><path d="M54 66 q6 5 12 0" stroke="#5EC2FF" stroke-width="3" fill="none" stroke-linecap="round"/>`;};
  // ---- LAB +5 ----
  D.magnet=()=>GRAD('gmg','#C43D5A','#8E2340')+`<path d="M28 14 h24 v46 q0 12 8 12 q8 0 8 -12 v-46 h24 v48 q0 40 -32 40 q-32 0 -32 -40z" fill="url(#gmg)"/><rect x="28" y="14" width="24" height="16" fill="#E8E4EC"/><rect x="68" y="14" width="24" height="16" fill="#E8E4EC"/>`+`<circle cx="48" cy="80" r="4" fill="#fff"/><circle cx="72" cy="80" r="4" fill="#fff"/><circle cx="49" cy="81" r="2" fill="#241E33"/><circle cx="73" cy="81" r="2" fill="#241E33"/><path d="M52 92 q8 6 16 0" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round"/>`+SPARK(20,50,'#FFD34D')+SPARK(100,54,'#FFD34D');
  D.germy=()=>GRAD('ggm','#9BE34D','#4F9E5A')+`<circle cx="60" cy="62" r="36" fill="url(#ggm)"/>`+[0,45,90,135,180,225,270,315].map(a=>`<circle cx="${(60+46*Math.cos(a*Math.PI/180)).toFixed(1)}" cy="${(62+46*Math.sin(a*Math.PI/180)).toFixed(1)}" r="6" fill="#7BC96F"/>`).join('')+`<circle cx="48" cy="56" r="6" fill="#fff"/><circle cx="74" cy="56" r="6" fill="#fff"/><circle cx="50" cy="57" r="3" fill="#241E33"/><circle cx="76" cy="57" r="3" fill="#241E33"/>`+MOUTH.open(74)+CHEEKS(66);
  D.volt=()=>GRAD('gvt','#FFD34D','#F0A93C')+SQ('url(#gvt)')+`<path d="M63 8 l-12 18 h8 l-6 16 l17 -21 h-8 l7 -13 z" fill="#241E33"/>`+`<circle cx="43" cy="62" r="7" fill="#241E33"/><circle cx="77" cy="62" r="7" fill="#241E33"/><circle cx="45.5" cy="59.5" r="2.4" fill="#fff"/><circle cx="79.5" cy="59.5" r="2.4" fill="#fff"/>`+CHEEKS(76)+`<path d="M46 82 q14 12 28 0" stroke="#241E33" stroke-width="4.5" fill="none" stroke-linecap="round"/>`+SPARK(22,30,'#fff')+SPARK(98,44,'#fff');
  D.scopey=()=>GRAD('gsc','#8FCBE0','#4A8FA8')+`<rect x="52" y="12" width="18" height="34" rx="6" fill="#3A3450"/><path d="M52 40 q-26 8 -26 34 q0 24 26 26 h26 q10 -2 10 -12 h-22 q-18 -4 -18 -22 q0 -16 14 -20z" fill="url(#gsc)"/><rect x="34" y="98" width="52" height="10" rx="5" fill="#3A3450"/><circle cx="82" cy="70" r="14" fill="#5EC2FF" opacity=".9"/>`+`<circle cx="78" cy="67" r="3" fill="#241E33"/><circle cx="88" cy="67" r="3" fill="#241E33"/><path d="M79 76 q5 4 10 0" stroke="#241E33" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  D.aurum=()=>GRAD('gau','#FFD24D','#C8901B')+`<path d="M44 14 h32 v26 l20 44 q6 18 -12 22 h-48 q-18 -4 -12 -22 l20 -44 z" fill="url(#gau)"/><path d="M32 74 q28 -12 56 0 l8 16 q4 14 -10 16 h-52 q-14 -2 -10 -16 z" fill="#FFF3D6"/>`+CROWN(60,10,0.9)+EYES.star(54)+MOUTH.smile(68)+SPARK(24,36)+SPARK(96,40);
  // ---- ARCADE +5 ----
  D.dpad=()=>GRAD('gdp','#5A5F73','#33374A')+`<path d="M44 24 h32 v20 h20 v32 h-20 v20 h-32 v-20 h-20 v-32 h20 z" fill="url(#gdp)"/><path d="M52 32 l8 -8 l8 8 M52 88 l8 8 l8 -8 M32 52 l-8 8 l8 8 M88 52 l8 8 l-8 8" fill="none" stroke="#8A90A6" stroke-width="4" stroke-linejoin="round"/>`+`<circle cx="52" cy="58" r="4" fill="#5EC2FF"/><circle cx="68" cy="58" r="4" fill="#5EC2FF"/><path d="M52 70 q8 6 16 0" stroke="#5EC2FF" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  D.tokeny=()=>GRAD('gtk','#FFD24D','#C8901B')+`<circle cx="60" cy="60" r="44" fill="url(#gtk)"/><circle cx="60" cy="60" r="34" fill="none" stroke="#8A5B00" stroke-width="4" stroke-dasharray="6 5"/><path d="M60 40 v40 M48 50 q12 -8 24 0 M48 70 q12 8 24 0" stroke="#8A5B00" stroke-width="5" fill="none" stroke-linecap="round"/>`+`<circle cx="46" cy="52" r="3.5" fill="#241E33"/><circle cx="74" cy="52" r="3.5" fill="#241E33"/>`;
  D.glitch=()=>GRAD('ggl2','#B18CFF','#5A37D6')+SQ('url(#ggl2)')+`<rect x="10" y="40" width="100" height="8" fill="#36D1FF" opacity=".7" transform="translate(6,0)"/><rect x="10" y="64" width="100" height="6" fill="#FF5D9E" opacity=".7" transform="translate(-6,0)"/>`+`<rect x="38" y="50" width="13" height="13" fill="#fff"/><rect x="69" y="50" width="13" height="13" fill="#fff"/><rect x="42" y="54" width="6" height="6" fill="#241E33"/><rect x="73" y="54" width="6" height="6" fill="#241E33"/><path d="M46 82 h10 v-4 h10 v4 h10" stroke="#241E33" stroke-width="4" fill="none"/>`;
  D.hiscore=()=>GRAD('ghs','#3B6FE0','#243F8E')+SQ('url(#ghs)')+`<text x="60" y="52" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="26" fill="#FFD34D">1UP</text>`+`<circle cx="46" cy="70" r="4.5" fill="#fff"/><circle cx="74" cy="70" r="4.5" fill="#fff"/><path d="M50 86 q10 8 20 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`+SPARK(22,26)+SPARK(98,24,'#FF5D9E');
  D.neonking=()=>GRAD('gnx','#12101E','#2A2440')+SQ('url(#gnx)',' stroke="#36D1FF" stroke-width="3"')+CROWN(60,24,1.2)+`<path d="M38 54 h18 M64 54 h18" stroke="#36D1FF" stroke-width="6" stroke-linecap="round"/><path d="M44 76 q16 12 32 0" stroke="#FF5D9E" stroke-width="5" fill="none" stroke-linecap="round"/>`+SPARK(22,44,'#36D1FF')+SPARK(98,40,'#FF5D9E');
  // ---- ORIGAMI (10) ----
  const FOLD=(c)=>` stroke="${c}" stroke-width="2.5" stroke-linejoin="round"`;
  D.paperplane=()=>GRAD('gpl','#F2E9DA','#E0D0B8')+`<path d="M14 66 l92 -40 l-30 78 l-18 -26 z" fill="url(#gpl)"${FOLD('#C25A2E')}/><path d="M106 26 l-48 52 l-12 -12" fill="none"${FOLD('#C25A2E')}/>`+`<circle cx="42" cy="58" r="3.5" fill="#241E33"/><circle cx="56" cy="52" r="3.5" fill="#241E33"/><path d="M44 66 q7 3 12 -2" stroke="#241E33" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  D.cranefold=()=>GRAD('gcr','#F5E7EB','#E8C9D5')+`<path d="M30 96 l30 -60 l14 24 l32 -44 l-8 56 l-38 24 z" fill="url(#gcr)"${FOLD('#C25A2E')}/><path d="M60 36 l14 24 l-30 36" fill="none"${FOLD('#C25A2E')}/><path d="M30 96 l-16 8 l20 2z" fill="#C25A2E"/>`+`<circle cx="94" cy="24" r="3" fill="#241E33"/>`;
  D.boatfold=()=>GRAD('gbt','#8FCBE0','#4A8FA8')+`<path d="M18 70 h84 l-16 26 h-52 z" fill="url(#gbt)"${FOLD('#2E6E88')}/><path d="M60 18 v52 M60 26 l26 36 h-52 z" fill="#F2E9DA"${FOLD('#C25A2E')}/>`+`<circle cx="48" cy="82" r="3.5" fill="#fff"/><circle cx="70" cy="82" r="3.5" fill="#fff"/><path d="M52 90 q7 4 14 0" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  D.hopfold=()=>GRAD('ghf','#9BE34D','#4F9E5A')+`<path d="M20 84 l20 -34 l-8 -22 l26 14 h4 l26 -14 l-8 22 l20 34 l-32 14 h-16 z" fill="url(#ghf)"${FOLD('#3A7A44')}/><path d="M40 50 l20 12 l20 -12 M60 62 v36" fill="none"${FOLD('#3A7A44')}/>`+`<circle cx="46" cy="40" r="4" fill="#241E33"/><circle cx="74" cy="40" r="4" fill="#241E33"/>`;
  D.fanfold=()=>GRAD('gff','#FF9A62','#C25A2E')+[-60,-30,0,30,60].map(a=>`<path d="M60 92 l-9 -74 h18 z" fill="url(#gff)" stroke="#8E3E1E" stroke-width="2" transform="rotate(${a} 60 92)"/>`).join('')+`<circle cx="60" cy="92" r="17" fill="#FFEBDD" stroke="#8E3E1E" stroke-width="2.5"/>`+`<circle cx="54" cy="89" r="3" fill="#241E33"/><circle cx="66" cy="89" r="3" fill="#241E33"/><circle cx="49" cy="95" r="2.6" fill="#F5A8B8"/><circle cx="71" cy="95" r="2.6" fill="#F5A8B8"/><path d="M55 97 q5 4 10 0" stroke="#241E33" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  D.lotusfold=()=>GRAD('glf','#FF9AC9','#E8458C')+`<path d="M60 30 q18 16 12 40 h-24 q-6 -24 12 -40z" fill="url(#glf)"${FOLD('#C4457E')}/><path d="M28 48 q22 2 26 26 l-20 6 q-14 -14 -6 -32z M92 48 q-22 2 -26 26 l20 6 q14 -14 6 -32z" fill="#FFB8DA"${FOLD('#C4457E')}/><path d="M18 78 h84 q-10 24 -42 24 q-32 0 -42 -24z" fill="#9BE34D"${FOLD('#4F9E5A')}/>`+`<circle cx="52" cy="60" r="3" fill="#241E33"/><circle cx="68" cy="60" r="3" fill="#241E33"/>`;
  D.koifold=()=>GRAD('gkf','#FF9A62','#E84545')+`<path d="M22 60 l50 -28 l-8 28 l8 28 z" fill="url(#gkf)"${FOLD('#A33232')}/><path d="M72 32 l26 12 l-16 16 l16 16 l-26 12 l-8 -28z" fill="#FFB8A0"${FOLD('#A33232')}/>`+`<circle cx="38" cy="56" r="4" fill="#241E33"/><circle cx="39" cy="54" r="1.5" fill="#fff"/>`;
  D.kabuto=()=>GRAD('gkb','#3A3450','#241E33')+`<path d="M20 62 q0 -34 40 -34 q40 0 40 34 l-8 26 h-64 z" fill="url(#gkb)"${FOLD('#C8901B')}/><path d="M60 28 v34 M40 34 q-16 22 -12 44 M80 34 q16 22 12 44" fill="none"${FOLD('#C8901B')}/><path d="M46 20 l-14 -16 l6 20 M74 20 l14 -16 l-6 20" fill="#FFD23F"/><circle cx="60" cy="50" r="8" fill="#FFD23F"/>`+`<circle cx="46" cy="76" r="4" fill="#fff"/><circle cx="74" cy="76" r="4" fill="#fff"/>`;
  D.flutterfold=()=>GRAD('gbf','#B18CFF','#5A37D6')+`<path d="M60 60 q-40 -44 -46 -8 q-4 26 34 22 M60 60 q40 -44 46 -8 q4 26 -34 22 M60 60 q-34 40 -12 46 q14 4 16 -20 M60 60 q34 40 12 46 q-14 4 -16 -20" fill="url(#gbf)"${FOLD('#4A2BB0')}/><rect x="56" y="34" width="8" height="52" rx="4" fill="#241E33"/><path d="M56 36 q-8 -12 -2 -16 M64 36 q8 -12 2 -16" stroke="#241E33" stroke-width="3" fill="none"/>`;
  D.goldencrane=()=>GRAD('ggc','#FFD24D','#C8901B')+`<path d="M30 96 l30 -60 l14 24 l32 -44 l-8 56 l-38 24 z" fill="url(#ggc)"${FOLD('#8A5B00')}/><path d="M60 36 l14 24 l-30 36" fill="none"${FOLD('#8A5B00')}/><path d="M30 96 l-16 8 l20 2z" fill="#8A5B00"/>`+CROWN(94,12,0.7)+SPARK(24,30)+SPARK(100,64,'#fff');
  // ---- ELEMENTS (10) ----
  D.pebble=()=>GRAD('gpb','#B8C4CC','#8FA3B0')+`<path d="M24 78 q-8 -34 24 -44 q40 -12 48 22 q6 30 -24 38 q-40 10 -48 -16z" fill="url(#gpb)"/>`+EYES.happy(60)+MOUTH.smile(76)+CHEEKS(68);
  D.breeze=()=>GRAD('gbr2','#BFE4F2','#8FCBE0')+`<path d="M16 46 q20 -18 40 0 q20 18 40 0 M16 70 q20 -18 40 0 q20 18 40 0 M16 94 q20 -18 40 0 q20 18 40 0" fill="none" stroke="url(#gbr2)" stroke-width="12" stroke-linecap="round"/>`+`<circle cx="46" cy="40" r="4" fill="#241E33"/><circle cx="66" cy="40" r="4" fill="#241E33"/><path d="M48 52 q8 6 16 0" stroke="#241E33" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  D.droplet=()=>GRAD('gdt','#8FCBE0','#2E8FB8')+`<path d="M60 10 q36 40 36 66 a36 36 0 0 1 -72 0 q0 -26 36 -66z" fill="url(#gdt)"/><ellipse cx="46" cy="58" rx="7" ry="11" fill="#fff" opacity=".5" transform="rotate(-16 46 58)"/>`+EYES.dot(74)+MOUTH.smile(90)+CHEEKS(82);
  D.ember=()=>GRAD('gem','#FF9A3D','#E84545')+`<path d="M60 8 q14 22 4 34 q18 -8 24 12 q16 -2 12 20 q10 12 -6 24 q-4 16 -34 14 q-30 2 -34 -14 q-16 -12 -6 -24 q-4 -22 12 -20 q6 -20 24 -12 q-10 -12 4 -34z" fill="url(#gem)"/><path d="M60 52 q10 14 0 26 q-10 -12 0 -26z" fill="#FFD86E"/>`+EYES.dot(66)+MOUTH.open(84);
  D.leafy=()=>GRAD('glv','#9BE34D','#4F9E5A')+`<path d="M60 8 q44 26 40 66 q-4 34 -40 38 q-36 -4 -40 -38 q-4 -40 40 -66z" fill="url(#glv)"/><path d="M60 20 v80 M60 42 q-16 4 -24 18 M60 42 q16 4 24 18 M60 68 q-14 4 -20 14 M60 68 q14 4 20 14" stroke="#3A7A44" stroke-width="4" fill="none" stroke-linecap="round"/>`+`<circle cx="47" cy="52" r="4" fill="#241E33"/><circle cx="73" cy="52" r="4" fill="#241E33"/><path d="M50 64 q10 7 20 0" stroke="#241E33" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  D.cloudy=()=>GRAD('gcd','#F2F4FA','#C9D2EA')+`<path d="M30 84 q-18 0 -16 -18 q2 -16 18 -14 q2 -20 24 -20 q20 0 24 16 q20 -4 22 14 q2 20 -18 22 z" fill="url(#gcd)"/>`+EYES.happy(58)+MOUTH.smile(72)+CHEEKS(64)+`<path d="M36 96 l-4 10 M60 98 l-4 10 M84 96 l-4 10" stroke="#5EC2FF" stroke-width="4" stroke-linecap="round"/>`;
  D.wave=()=>GRAD('gwv','#36D1FF','#2E8FB8')+`<path d="M14 88 q0 -44 34 -58 q30 -12 38 10 q6 18 -12 22 q14 2 18 16 q4 18 -18 22 q-44 8 -60 -12z" fill="url(#gwv)"/><path d="M28 44 q14 -16 34 -14 M40 96 q26 6 44 -6" stroke="#BFE9FF" stroke-width="5" fill="none" stroke-linecap="round"/>`+EYES.dot(64)+MOUTH.open(80);
  D.boulder=()=>GRAD('gbd','#8FA3B0','#5A6874')+`<path d="M22 84 l8 -40 l26 -22 l34 10 l12 34 l-16 30 h-48 z" fill="url(#gbd)"/><path d="M40 50 l14 -10 M70 40 l14 16" stroke="#4A5560" stroke-width="4" stroke-linecap="round"/>`+EYES.dot(66)+MOUTH.flat(82)+`<path d="M34 34 q4 -10 12 -8" stroke="#9BD3B4" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  D.zappy=()=>GRAD('gzp','#FFD34D','#FF9A3D')+`<path d="M70 6 l-38 54 h22 l-14 54 l48 -62 h-24 l20 -46z" fill="url(#gzp)" stroke="#C8901B" stroke-width="3" stroke-linejoin="round"/>`+`<circle cx="52" cy="46" r="4" fill="#241E33"/><circle cx="66" cy="44" r="4" fill="#241E33"/><path d="M54 56 q7 5 14 -1" stroke="#241E33" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  D.elemental=()=>GRAD('gel','#2E8FB8','#103647')+`<circle cx="60" cy="60" r="40" fill="url(#gel)"/><path d="M60 24 a36 36 0 0 1 0 72" fill="#FF9A3D" opacity=".85"/><path d="M60 36 a24 24 0 0 0 0 48" fill="#9BE34D" opacity=".85"/><circle cx="60" cy="60" r="13" fill="#F2F4FA"/>`+`<circle cx="55" cy="58" r="2.6" fill="#241E33"/><circle cx="65" cy="58" r="2.6" fill="#241E33"/><path d="M55 65 q5 4 10 0" stroke="#241E33" stroke-width="2.5" fill="none" stroke-linecap="round"/>`+CROWN(60,14,0.8)+SPARK(20,30,'#36D1FF')+SPARK(100,34,'#FF9A3D');

  // ---------- VILLAINS (saga antagonists — reuse the SAGA_ART sprites in a squircle) ----------
  function sagaAv(name, gid, c1, c2){ return function(){
    const bg = GRAD(gid,c1,c2)+SQ('url(#'+gid+')');
    const a = (window.SAGA_ART||{})[name]; if(!a) return bg+EYES.dot(58)+MOUTH.flat(76);
    const p = String(a.vb||'0 0 120 120').split(/\s+/).map(Number);
    const vw=p[2]||120, vh=p[3]||120, box=82, s=box/Math.max(vw,vh);
    const tx=(60 - s*(p[0]+vw/2)), ty=(62 - s*(p[1]+vh/2));
    const f=(a.frames&&a.frames[0])||a.svg||'';
    return bg+'<g transform="translate('+tx.toFixed(1)+','+ty.toFixed(1)+') scale('+s.toFixed(3)+')">'+f+'</g>';
  }; }
  D.vex        = sagaAv('vex-portrait','gvex','#5A2440','#C43D5A');
  D.smudge     = sagaAv('smudge-swarm','gsmg','#6B6560','#3E3A36');
  D.gnash      = sagaAv('gnash-standing','ggna','#7A5A3A','#4A3420');
  D.vstatic    = sagaAv('static-idle','gsta','#3A4A6A','#1E2A44');
  D.voidmaw    = sagaAv('void-maw','gvod','#2A2450','#120E2A');
  D.glitchv    = sagaAv('glitch-corrupt-glee','gglv','#2E5A6A','#12303E');
  D.gatekeeper = sagaAv('gatekeeper-roar','ggat','#6A3A2A','#3A1E14');
  D.locust     = sagaAv('locust-trooper','gloc','#5A5A4A','#32322A');
  D.greymoth   = sagaAv('grey-moth','ggmo','#9A948A','#5A5550');
  D.wordeater  = sagaAv('word-eater','gwe','#5A1E2E','#2A0E16');

  const AV = [
    ['bizzy','Bizzy Bee','hive','free'],['honeypot','Honey Pot','hive','free'],['bumble','Bumble','hive','rare'],['waggle','Waggle','hive','rare'],['drone','Drone Dan','hive','rare'],['clover','Clover','hive','rare'],['blossom','Blossom','hive','epic'],['nectar','Nectar','hive','epic'],['propolis','Propolis','hive','epic'],['queenhive','Hive Queen','hive','legendary'],
    ['star','Center Star','stage','free'],['mic','Big Mic','stage','rare'],['maestro','Maestro','stage','rare'],['jester','Jester','stage','rare'],['lumen','Lumen the Light','stage','rare'],['diva','Diva','stage','epic'],['popcorn','Popcorn','stage','epic'],['melody','Melody','stage','epic'],['encore','Encore','stage','epic'],['goldlegend','Gold Legend','stage','legendary'],
    ['luna','Luna','cosmos','free'],['astro','Astro','cosmos','rare'],['comet','Comet','cosmos','rare'],['rocket','Rocket Rae','cosmos','rare'],['alien','Zib the Alien','cosmos','rare'],['saturn','Saturn','cosmos','epic'],['blackhole','Void','cosmos','epic'],['supernova','Supernova','cosmos','epic'],['ufo','Saucer','cosmos','epic'],['nebula','Nebula Drake','cosmos','legendary'],
    ['panda','Panda Sensei','dojo','free'],['ninja','Shadow Ninja','dojo','rare'],['samurai','Samurai','dojo','rare'],['neko','Lucky Neko','dojo','rare'],['bamboo','Bamboo','dojo','rare'],['kitsune','Kitsune','dojo','epic'],['oni','Oni Grin','dojo','epic'],['koi','Koi','dojo','epic'],['starsteel','Star Steel','dojo','epic'],['dragonmaster','Dragon Master','dojo','legendary'],
    ['beaker','Bubbly Beaker','lab','free'],['atom','Atom','lab','rare'],['robo','Robo Helper','lab','rare'],['magnet','Magneto Max','lab','rare'],['germy','Germy','lab','rare'],['brainiac','Brainiac','lab','epic'],['phoenix','Phoenix Flame','lab','epic'],['volt','Volt','lab','epic'],['scopey','Scopey','lab','epic'],['aurum','Aurum Formula','lab','legendary'],
    ['pixel','Pixel Pal','arcade','free'],['joy','Joy Stick','arcade','rare'],['ghost','Cabinet Ghost','arcade','rare'],['dpad','D-Pad','arcade','rare'],['tokeny','Tokeny','arcade','rare'],['bossbot','Boss Bot','arcade','epic'],['rainbow','Rainbow Cart','arcade','epic'],['glitch','Glitch','arcade','epic'],['hiscore','1-UP','arcade','epic'],['neonking','Neon King','arcade','legendary'],
    ['paperplane','Paper Plane','origami','free'],['cranefold','Crane','origami','rare'],['boatfold','Little Boat','origami','rare'],['hopfold','Hop Frog','origami','rare'],['fanfold','Fan Dancer','origami','rare'],['lotusfold','Lotus','origami','epic'],['koifold','Paper Koi','origami','epic'],['kabuto','Kabuto','origami','epic'],['flutterfold','Flutter','origami','epic'],['goldencrane','Golden Crane','origami','legendary'],
    ['pebble','Pebble','elements','free'],['breeze','Breeze','elements','free'],['droplet','Droplet','elements','rare'],['ember','Ember','elements','rare'],['leafy','Leafy','elements','rare'],['cloudy','Cloudy','elements','rare'],['wave','Big Wave','elements','epic'],['boulder','Boulder','elements','epic'],['zappy','Zappy','elements','epic'],['elemental','Elemental Prime','elements','legendary'],
    ['froggy','Pond Star','critter','free'],['corg','Zoomies','critter','rare'],['sharky','Finn','critter','rare'],['slowmo','Slowmo','critter','rare'],['capy','Capy','critter','rare'],['narly','Narly','critter','epic'],['redpanda','Rusty','critter','epic'],['axo','Axo','critter','epic'],['rexy','Rexy','critter','epic'],['uni','Uni','critter','legendary'],
    ['gg','GG','vibe','free'],['duckie','Duckie','vibe','rare'],['boba','Boba','vibe','rare'],['sprinkle','Sprinkle','vibe','rare'],['pengu','Pengu','vibe','rare'],['slimey','Slimey','vibe','epic'],['djbot','Beat Bot','vibe','epic'],['plushy','Plushy','vibe','epic'],['catlord','Catlord','vibe','epic'],['yeti','Frost','vibe','legendary'],
    ['trice','Trice','dino','free'],['stego','Stego','dino','rare'],['raptor','Raptor','dino','rare'],['ptero','Ptero','dino','rare'],['bronto','Bronto','dino','rare'],['spino','Spino','dino','epic'],['ankylo','Ankylo','dino','epic'],['mosa','Mosa','dino','epic'],['fossil','Fossil','dino','epic'],['rexking','Rex King','dino','legendary'],
    ['midnight','Midnight','enchanted','free'],['wisp','Wisp','enchanted','rare'],['lunamoth','Luna Moth','enchanted','rare'],['fae','Fae','enchanted','rare'],['crystal','Crystal','enchanted','rare'],['mer','Pearl','enchanted','epic'],['snowfox','Snowfox','enchanted','epic'],['briar','Briar','enchanted','epic'],['wish','Wish','enchanted','epic'],['starweaver','Starweaver','enchanted','legendary'],
    ['monarch','Monarch','wildhearts','free'],['hoppy','Hoppy','wildhearts','rare'],['fawn','Fawn','wildhearts','rare'],['ottie','Ottie','wildhearts','rare'],['echo','Echo','wildhearts','rare'],['pounce','Pounce','wildhearts','epic'],['swan','Swan','wildhearts','epic'],['howl','Howl','wildhearts','epic'],['blaze','Blaze','wildhearts','epic'],['pegasus','Pegasus','wildhearts','legendary'],
    ['squatch','Squatch','legends','free'],['nessie','Nessie','legends','rare'],['griff','Griff','legends','rare'],['golem','Golem','legends','rare'],['cyclo','Cyclo','legends','rare'],['fang','Fang','legends','epic'],['kraken','Kraken','legends','epic'],['mino','Mino','legends','epic'],['phantom','Phantom','legends','epic'],['hydra','Hydra','legends','legendary'],
    ['rally','Rally','turbo','free'],['turbo','Turbo','turbo','rare'],['crash','Crash','turbo','rare'],['airtime','Airtime','turbo','rare'],['striker','Striker','turbo','rare'],['champ','Champ','turbo','epic'],['hover','Hover','turbo','epic'],['nitro','Nitro','turbo','epic'],['mech','Mech','turbo','epic'],['titan','Titan','turbo','legendary'],
    ['greymoth','Grey Moth','villains','free'],['locust','Locust Trooper','villains','rare'],['vstatic','Static','villains','rare'],['gnash','Gnash','villains','rare'],['glitchv','Glitch','villains','rare'],['smudge','The Smudge','villains','epic'],['voidmaw','The Void','villains','epic'],['gatekeeper','Gatekeeper','villains','epic'],['vex','Vex','villains','legendary'],['wordeater','The Ten-Headed Word-Eater','villains','legendary'],
  ].map(([id,name,pack,rarity])=>({ id, name, pack, rarity, price:RAR[rarity].price, sell:RAR[rarity].sell }));
  window.SB_AVATARS = { list:AV, packs:PACKS, rarities:RAR, byId:Object.fromEntries(AV.map(a=>[a.id,a])) };

  /* Per-pack ink colour for the sticker outline (matches the design Contact Sheet). */
  const INK = {
    hive:'#7A4A08', dino:'#2B4A1E', cosmos:'#1E2A5C', stage:'#5C3A08', dojo:'#6E1F30',
    lab:'#0F3A34', arcade:'#12234A', origami:'#6E3418', elements:'#123A52',
    critter:'#5C2A10', vibe:'#2E1B52', enchanted:'#44205C', wildhearts:'#5C1F38',
    legends:'#14402A', turbo:'#5A1410', villains:'#2A1620'
  };
  window.SB_AVATAR_INK = id => INK[(window.SB_AVATARS.byId[id]||{}).pack] || '#3A2A5C';

  /* Villain lore — from "Bizzy & the Great Unspelling".
     tagline  → shown on hover over the avatar tile in a pack / collection.
     greeting → the villain's own voice; fact → a story detail. Both show on
     hover over the equipped avatar on the Home greeting card. */
  window.SB_AVATAR_LORE = {
    vex:{ tagline:'The Hornet Who Unwrites the World',
      greeting:'Ah — a speller. How quaint. I crossed out MEADOW before breakfast; shall I pencil you in?',
      fact:'Once a bee of the Hive, Vex keeps a ledger of every word he has erased. He isn’t hungry for letters — he is building an army.' },
    smudge:{ tagline:'A Thousand Moths Wearing One Grin',
      greeting:'Namesss... sweet namesss... give usss just one letter and we’ll leave the ressst. We promissse.',
      fact:'The Smudge isn’t one monster — it’s a swarm of grey moths that eats the first letter of anything it lands on, then the next, then the next.' },
    gnash:{ tagline:'All Teeth, No Spelling',
      greeting:'GNASH SMASH WORDS! ...wait, how do you spell “smash”? GNASH SMASH ANYWAY!',
      fact:'Gnash chews through dictionaries for fun but has never spelled a word right in his life — which is exactly why Vex keeps him around.' },
    vstatic:{ tagline:'The Sound Between the Words',
      greeting:'bzzt— can you— bzzzt —hear me? the words keep— skhhht —cutting ou—',
      fact:'Static lives in the gaps between letters, turning clear words into fuzzy noise. Spell loudly and clearly and it fades away.' },
    voidmaw:{ tagline:'The Mouth at the End of the Sentence',
      greeting:'...you may put your words in. I keep everything that goes in. I have never once given anything back.',
      fact:'The Void swallowed a whole constellation once. Star-charts still can’t spell the Great Bear’s name without checking twice.' },
    glitchv:{ tagline:'Traded Friends for Infinite Lives',
      greeting:'Sorry, hero. The hornet offered me INFINITE continues. You’d have taken the deal too. ...Wouldn’t you?',
      fact:'Glitch was the Arcade’s guardian until Vex promised a game that never ends. Now he corrupts the very letters he once protected.' },
    gatekeeper:{ tagline:'Roars First, Asks Never',
      greeting:'NONE SHALL PASS who cannot spell the password. The password is long. The password is “onomatopoeia.” Begin.',
      fact:'The Gatekeeper guards each act’s gate and only opens it for a perfectly spelled word — no second guesses, no hints.' },
    locust:{ tagline:'One of Ten Thousand',
      greeting:'I march where the ledger points. I don’t read it. I’m not allowed to read it. Marching now.',
      fact:'Locust Troopers are Vex’s foot soldiers, copied a thousand times over. Each one can only remember a single letter of its orders.' },
    greymoth:{ tagline:'The First Nibble of the Unspelling',
      greeting:'flutter... flutter... which letter is yours? just the one on the end. you won’t even miss it.',
      fact:'A single grey moth is nearly harmless — it can grey out just one letter. It’s when thousands gather that whole names vanish.' },
    wordeater:{ tagline:'Ten Hungry Heads, One Sad Secret',
      greeting:'FEED US. FEED US EVERY WORD YOU KNOW. ...the little head in the middle says please.',
      fact:'The Word-Eater is a great machine of ten serpent heads — but a small, sad face hides in its chest, and it remembers being someone else.' }
  };
  window.SB_AVATAR_TAGLINE = id => (window.SB_AVATAR_LORE[id]||{}).tagline || '';

  // 4-way hard drop-shadow = crisp enamel/sticker outline. Constant ~1.2px keeps
  // it readable at every size, exactly like the design contact sheet. On dark
  // surfaces (opts.dark, or the app's dusk mode) epic & legendary avatars GLOW
  // (design "dusk tile" spec); everything else gets a thin white edge instead
  // of the ink outline, which would vanish on dark.
  window.SB_AVATAR = function(id, size, opts){ size=size||64; opts=opts||{};
    let inner = (window.SB_AVATAR_ART && window.SB_AVATAR_ART[id]) || (D[id] ? D[id]() : '');
    if(!inner) return '';
    const w = Math.max(1, Math.round(size/100 * 12)/10); // ~1.2px, scales gently
    const dusk = !!opts.dark || (typeof state!=='undefined' && state && state.mode==='dusk');
    let outline='';
    if(opts.outline!==false){
      if(dusk){
        const rar=(window.SB_AVATARS.byId[id]||{}).rarity;
        if(rar==='epic'||rar==='legendary'){
          const g=Math.max(4, Math.round(size/14));
          outline = `filter:drop-shadow(0 0 ${g}px rgba(255,255,255,.65)) drop-shadow(0 0 2px rgba(255,255,255,.9));`;
        } else {
          outline = `filter:drop-shadow(${w}px 0 0 #fff) drop-shadow(-${w}px 0 0 #fff) drop-shadow(0 ${w}px 0 #fff) drop-shadow(0 -${w}px 0 #fff);`;
        }
      } else { const ink = opts.ink || window.SB_AVATAR_INK(id);
        outline = `filter:drop-shadow(${w}px 0 0 ${ink}) drop-shadow(-${w}px 0 0 ${ink}) drop-shadow(0 ${w}px 0 ${ink}) drop-shadow(0 -${w}px 0 ${ink});`;
      }
    }
    return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" aria-hidden="true" style="display:block;overflow:visible;${outline}">${inner}</svg>`; };
})();
