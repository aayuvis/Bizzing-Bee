/* game-art.js — Arcade tile mascots.
   The Games & challenges tiles used to carry white line-art icons. These replace them with
   CHARACTERS drawn to the same recipe as the avatars: a 120x120 viewBox, a gradient-shaded
   body, glossy eyes with a highlight, cheek blush, and a heavy ink outline applied by the
   renderer — so an arcade tile and an avatar card read as the same world.

   Every mascot also ACTS OUT its own game: the buzzer bot slams its buzzer, the boss chomps,
   the duellists clash, the timekeeper's hand sweeps. Animations are CSS keyframes declared in
   index.html (sb-gm-*), so the reduced-motion setting switches all of them off at once. */
(function(){
  var INK='#2B1B5E';

  /* ---- shared chassis: the thing that makes them one family ---- */
  function grad(id,a,b){ return '<radialGradient id="'+id+'" cx="44%" cy="26%" r="82%"><stop offset="0" stop-color="'+a+'"/><stop offset="1" stop-color="'+b+'"/></radialGradient>'; }
  // glossy avatar eye: white ball, dark iris, catchlight
  function eye(cx,cy,r,look){ var dx=(look&&look[0])||0, dy=(look&&look[1])||0;
    return '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="#fff"/>'
      +'<circle cx="'+(cx+dx)+'" cy="'+(cy+dy)+'" r="'+(r*0.5).toFixed(1)+'" fill="'+INK+'"/>'
      +'<circle cx="'+(cx+dx-r*0.2).toFixed(1)+'" cy="'+(cy+dy-r*0.3).toFixed(1)+'" r="'+(r*0.2).toFixed(1)+'" fill="#fff"/>'; }
  function blush(cx,cy,rx){ return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+(rx*0.62).toFixed(1)+'" fill="#FF7FBE" opacity=".72"/>'; }
  function smile(cx,cy,w,sw){ return '<path d="M'+(cx-w)+' '+cy+' q'+w+' '+(w*0.75).toFixed(1)+' '+(w*2)+' 0" fill="none" stroke="'+INK+'" stroke-width="'+(sw||3.4)+'" stroke-linecap="round"/>'; }
  function gloss(cx,cy,rx,ry){ return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#fff" opacity=".24"/>'; }
  function shade(cx,rx){ return '<ellipse cx="'+cx+'" cy="114" rx="'+rx+'" ry="4.5" fill="'+INK+'" opacity=".24"/>'; }
  // The house body shape: a tall rounded dome with a flat-ish base. Every mascot uses it, which
  // is what makes eight different characters read as one set.
  function body(g,x,top,w){ var h=104-top, r=w/2;
    return '<path d="M'+(x-r)+' 100 q-'+(r*0.14).toFixed(1)+' -'+h.toFixed(1)+' '+r.toFixed(1)+' -'+h.toFixed(1)
      +' q'+r.toFixed(1)+' 0 '+r.toFixed(1)+' '+h.toFixed(1)+' q0 8 -'+r.toFixed(1)+' 8 q-'+r.toFixed(1)+' 0 -'+r.toFixed(1)+' -8 z" fill="url(#'+g+')"/>'; }
  // animate a group about its own centre, without the positioning transform fighting it
  function anim(name,dur,content,delay,ease){
    return '<g style="transform-box:fill-box;transform-origin:center;animation:'+name+' '+dur+'s '+(ease||'ease-in-out')+' '+(delay||0)+'s infinite">'+content+'</g>'; }
  function at(x,y,content){ return '<g transform="translate('+x+' '+y+')">'+content+'</g>'; }

  var A={};

  /* ---- BEAT THE BUZZER — a stout bot who slams the buzzer on its head; the ring pings out ---- */
  A.beat='<defs>'+grad('gm-beat','#FF8FC0','#C42B6E')+'</defs>'
    +shade(60,31)
    +anim('sb-gm-ping',1.9,'<circle cx="60" cy="34" r="26" fill="none" stroke="#FFD3E6" stroke-width="3.4"/>')
    +anim('sb-gm-squash',1.9,'<g>'
      +body('gm-beat',60,46,66)
      +gloss(45,60,13,9)
      +eye(48,68,10,[1,1])+eye(74,68,10,[1,1])
      +blush(33,82,7)+blush(87,82,7)+smile(60,84,8)
      // little feet peeking out from under the shell
      +'<ellipse cx="42" cy="106" rx="10" ry="5" fill="#8E1C4E"/><ellipse cx="78" cy="106" rx="10" ry="5" fill="#8E1C4E"/>'
      +'</g>')
    // the buzzer dome it slams
    +'<rect x="56.5" y="34" width="7" height="16" fill="#8E1C4E"/>'
    +anim('sb-gm-press',1.9,at(60,32,'<ellipse cx="0" cy="7" rx="20" ry="6.5" fill="#8E1C4E"/>'
      +'<path d="M-18 7 q0 -17 18 -17 q18 0 18 17 z" fill="#FF4D6D"/>'
      +'<ellipse cx="-6" cy="-3" rx="7.5" ry="4" fill="#fff" opacity=".42"/>'));

  /* ---- WORD QUIZ — a bookish sprite; the question mark pops, then the tick lands ---- */
  A.wordquiz='<defs>'+grad('gm-quiz','#43DCC3','#0A7566')+'</defs>'
    +shade(60,30)
    +anim('sb-gm-bob',2.6,'<g>'
      +body('gm-quiz',60,34,68)
      +gloss(44,50,13,9)
      +eye(49,58,10)+eye(75,58,10)
      +blush(32,72,6.5)+blush(88,72,6.5)+smile(60,74,7)
      // an open book held across the belly
      +'<path d="M32 88 q14 -7 28 0 q14 -7 28 0 l0 14 q-14 -6 -28 0 q-14 -6 -28 0 z" fill="#FFF6E2"/>'
      +'<path d="M60 88 v14" stroke="#C8A96A" stroke-width="2"/>'
      +'<path d="M38 93 h14 M68 93 h14 M38 97.5 h10 M68 97.5 h10" stroke="#C8A96A" stroke-width="1.6" stroke-linecap="round"/>'
      +'</g>')
    +anim('sb-gm-qpop',2.6,at(97,26,'<circle r="15" fill="#FFC83D"/>'
      +'<text x="0" y="7" text-anchor="middle" font-family="Baloo 2,Verdana,sans-serif" font-weight="800" font-size="22" fill="'+INK+'">?</text>'))
    +anim('sb-gm-tick',2.6,at(22,30,'<circle r="11" fill="#FFF6E2"/>'
      +'<path d="M-5 0 l3.6 4 l6.4 -7" stroke="#0A7566" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),1.1);

  /* ---- BOSS BATTLE — a horned word-eater who lunges and chomps, crown rocking ---- */
  A.boss='<defs>'+grad('gm-boss','#A470FF','#43199E')+'</defs>'
    +shade(60,33)
    +anim('sb-gm-lunge',2.2,'<g>'
      // horns
      +'<path d="M28 52 q-13 -13 -8 -28 q12 6 17 22 z" fill="#6C3FD0"/><path d="M92 52 q13 -13 8 -28 q-12 6 -17 22 z" fill="#6C3FD0"/>'
      +body('gm-boss',60,32,74)
      +gloss(42,50,14,10)
      // angry brows
      +'<path d="M34 54 l16 7" stroke="'+INK+'" stroke-width="4" stroke-linecap="round"/><path d="M86 54 l-16 7" stroke="'+INK+'" stroke-width="4" stroke-linecap="round"/>'
      +eye(47,68,10,[1.5,0])+eye(73,68,10,[-1.5,0])
      // chomping jaw
      +anim('sb-gm-chomp',2.2,at(60,90,'<path d="M-21 -3 q21 -8 42 0 q-6 17 -21 17 q-15 0 -21 -17 z" fill="#26104C"/>'
        +'<path d="M-15 -3.5 l4.6 8 l4.6 -8 l4.6 8 l4.6 -8 l4.6 8 l4.6 -8 z" fill="#fff"/>'))
      +'</g>')
    +anim('sb-gm-crown',2.2,at(60,18,'<path d="M-17 8 l0 -14 l7.5 6.5 l4.5 -11 l4.5 11 l7.5 -6.5 l0 14 z" fill="#FFC83D"/><circle cx="0" cy="-10" r="2.6" fill="#FF6FA8"/>'));

  /* ---- SPELLING DUEL — two bee knights, well apart, pencil-swords crossing between them ---- */
  function knight(cx,g,flip){
    var s=flip?-1:1;
    return '<g transform="translate('+cx+' 0)">'
      +'<ellipse cx="0" cy="108" rx="19" ry="4" fill="'+INK+'" opacity=".22"/>'
      // antenna
      +'<path d="M'+(-6*s)+' 56 q'+(-5*s)+' -12 '+(-11*s)+' -16" stroke="'+INK+'" stroke-width="3.2" fill="none" stroke-linecap="round"/>'
      +'<circle cx="'+(-17*s)+'" cy="38" r="4" fill="#FFC83D"/>'
      +'<path d="M-21 100 q-3 -46 21 -46 q24 0 21 46 q0 6 -21 6 q-21 0 -21 -6 z" fill="url(#'+g+')"/>'
      +'<clipPath id="'+g+'-c"><path d="M-21 100 q-3 -46 21 -46 q24 0 21 46 q0 6 -21 6 q-21 0 -21 -6 z"/></clipPath>'
      +'<g clip-path="url(#'+g+'-c)"><rect x="-24" y="88" width="48" height="6" fill="'+INK+'" opacity=".5"/><rect x="-24" y="98" width="48" height="6" fill="'+INK+'" opacity=".5"/></g>'
      +gloss(-9,66,8,5)
      +eye(-8,74,7.5,[1*s,0])+eye(8,74,7.5,[1*s,0])
      +blush(-18,86,5)+blush(18,86,5)+smile(0,87,5,2.8)
      +'</g>'; }
  A.duel='<defs>'+grad('gm-duelA','#FF8A9E','#961B39')+grad('gm-duelB','#FFD86E','#C07E0C')+'</defs>'
    +anim('sb-gm-lungeL',1.6,knight(25,'gm-duelA',false))
    +anim('sb-gm-lungeR',1.6,knight(95,'gm-duelB',true))
    // crossed pencil-swords meeting in the middle
    +anim('sb-gm-clashL',1.6,at(48,52,'<g transform="rotate(42)"><rect x="-3" y="-34" width="6" height="40" rx="3" fill="#F5C24B"/><path d="M-3 -34 l3 -8 l3 8 z" fill="#EDE7FF"/><rect x="-8" y="6" width="16" height="5" rx="2.5" fill="#7A5A18"/></g>'))
    +anim('sb-gm-clashR',1.6,at(72,52,'<g transform="rotate(-42)"><rect x="-3" y="-34" width="6" height="40" rx="3" fill="#F5C24B"/><path d="M-3 -34 l3 -8 l3 8 z" fill="#EDE7FF"/><rect x="-8" y="6" width="16" height="5" rx="2.5" fill="#7A5A18"/></g>'))
    +anim('sb-gm-spark',1.6,at(60,22,'<path d="M0 -15 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 z" fill="#FFF0A8"/>'));

  /* ---- DAILY BUZZ — a sprout who wakes with the day; five guess-squares light on its belly ---- */
  A.daily='<defs>'+grad('gm-daily','#66E296','#0E6B45')
    +'<radialGradient id="gm-sun" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFE9A8" stop-opacity=".85"/><stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/></radialGradient></defs>'
    +anim('sb-gm-rise',3,'<circle cx="60" cy="52" r="42" fill="url(#gm-sun)"/>')
    +shade(60,30)
    +anim('sb-gm-bob',3,'<g>'
      +body('gm-daily',60,40,66)
      +gloss(45,54,12,8)
      +eye(49,62,9.5)+eye(74,62,9.5)
      +blush(33,76,6)+blush(88,76,6)+smile(60,78,7)
      // the five daily squares, lighting in sequence across the belly
      +[0,1,2,3,4].map(function(i){
        return '<rect x="'+(35+i*10.5)+'" y="90" width="8.5" height="8.5" rx="2.4" fill="#fff" fill-opacity=".2" stroke="#0B5537" stroke-width="1.2" style="animation:sb-gm-cell 3s linear '+(i*0.3).toFixed(2)+'s infinite"/>'; }).join('')
      +'</g>')
    // leaf sprout on top
    +anim('sb-gm-leaf',3,at(60,36,'<path d="M0 6 q-3 -13 -16 -15 q3 13 16 15 z" fill="#8BE0A4"/><path d="M0 6 q3 -15 16 -17 q-3 15 -16 17 z" fill="#6FD48F"/><path d="M0 9 v-7" stroke="#0E6B45" stroke-width="3" stroke-linecap="round"/>'));

  /* ---- BEE TRIVIA — a scholar bee in a mortarboard whose lightbulb flicks on ---- */
  A.trivia='<defs>'+grad('gm-triv','#FFD86E','#C07E0C')+'</defs>'
    +shade(60,30)
    +anim('sb-gm-bob',2.8,'<g>'
      +'<ellipse cx="30" cy="62" rx="11" ry="17" fill="#EDE7FF" stroke="#B9A6F0" stroke-width="2.6" transform="rotate(-28 30 62)"/>'
      +'<ellipse cx="90" cy="62" rx="11" ry="17" fill="#EDE7FF" stroke="#B9A6F0" stroke-width="2.6" transform="rotate(28 90 62)"/>'
      +body('gm-triv',60,40,68)
      +'<clipPath id="gm-trivc"><path d="M26 100 q-5 -60 34 -60 q39 0 34 60 q0 8 -34 8 q-34 0 -34 -8 z"/></clipPath>'
      +'<g clip-path="url(#gm-trivc)"><rect x="20" y="88" width="80" height="7.5" fill="#3A2A8C"/><rect x="20" y="100" width="80" height="7" fill="#3A2A8C"/></g>'
      +gloss(45,54,12,8)
      +eye(49,64,10)+eye(74,64,10)
      +blush(32,79,6)+blush(89,79,6)+smile(60,80,7)
      +'</g>')
    // mortarboard
    +anim('sb-gm-bob',2.8,at(60,32,'<path d="M-12 4 l0 10 q12 6 24 0 l0 -10 z" fill="#3B2E70"/>'
      +'<path d="M-26 0 l26 -11 l26 11 l-26 11 z" fill="#2E2258"/>'
      +'<path d="M24 2 v14" stroke="#FFC83D" stroke-width="2.6"/><circle cx="24" cy="17" r="3.4" fill="#FFC83D"/>'))
    // the idea
    +anim('sb-gm-idea',2.8,at(101,28,'<path d="M0 -12 a10 10 0 0 1 5.5 18 l0 3.5 l-11 0 l0 -3.5 a10 10 0 0 1 5.5 -18 z" fill="#FFF0A8"/><rect x="-5.5" y="10" width="11" height="4.5" rx="1.8" fill="#C8901B"/>'));

  /* ---- CHAMP CHALLENGE — a laurel-wreathed racer with a stopwatch belly, hand sweeping ---- */
  A.champ='<defs>'+grad('gm-champ','#AE92FF','#41249F')+'</defs>'
    +shade(60,30)
    // the wreath sits around the crown of the head, not beside it
    +'<path d="M30 74 q-14 -32 6 -50 q14 26 3 52 z" fill="#5FCB85"/>'
    +'<path d="M90 74 q14 -32 -6 -50 q-14 26 -3 52 z" fill="#5FCB85"/>'
    +'<path d="M33 66 q-9 -22 4 -36 M87 66 q9 -22 -4 -36" stroke="#3E9660" stroke-width="2.2" fill="none" stroke-linecap="round"/>'
    +anim('sb-gm-bob',2.2,'<g>'
      +body('gm-champ',60,38,66)
      +gloss(45,52,12,8)
      +eye(49,60,9.5)+eye(74,60,9.5)
      +blush(33,72,6)+blush(88,72,6)+smile(60,74,6.5)
      +'<circle cx="60" cy="92" r="14" fill="#EDE7FF" stroke="#2E2258" stroke-width="2.2"/>'
      +'<rect x="56.5" y="75" width="7" height="5" rx="2" fill="#2E2258"/>'
      +'</g>')
    // the sweeping second hand
    +anim('sb-gm-sweep',2.2,at(60,92,'<rect x="-1.6" y="-11.5" width="3.2" height="13" rx="1.6" fill="#C43D5A"/><circle r="2.4" fill="#2E2258"/>'),0,'linear')
    +anim('sb-gm-spin',2.2,at(60,18,'<path d="M0 -12 l3.4 8 l8 3.4 l-8 3.4 l-3.4 8 l-3.4 -8 l-8 -3.4 l8 -3.4 z" fill="#FFC83D"/>'),0,'linear');

  /* ---- MAGIC SQUARES — a small wizard whose 3x3 rune cloak lights cell by cell ---- */
  A.magic='<defs>'+grad('gm-magic','#E08CF2','#65198A')+'</defs>'
    +shade(60,32)
    +anim('sb-gm-bob',3.2,'<g>'
      +body('gm-magic',60,44,70)
      +gloss(44,58,12,8)
      +eye(49,66,9.5)+eye(74,66,9.5)
      +blush(32,78,6)+blush(89,78,6)+smile(60,79,6.5)
      // the 3x3 rune grid across the cloak, lighting cell by cell
      +[0,1,2,3,4,5,6,7,8].map(function(i){ var x=44+(i%3)*12, y=86+Math.floor(i/3)*7;
        return '<rect x="'+x+'" y="'+y+'" width="9" height="5.5" rx="1.8" fill="#FFE9FF" fill-opacity=".2" style="animation:sb-gm-cell 3.6s linear '+(i*0.28).toFixed(2)+'s infinite"/>'; }).join('')
      +'</g>')
    // wizard hat
    +anim('sb-gm-bob',3.2,at(60,34,'<path d="M-22 12 q22 6 44 0 q-5 -7 -22 -7 q-17 0 -22 7 z" fill="#2A1152"/>'
      +'<path d="M-16 8 q7 -38 18 -38 q8 14 9 38 q-14 5 -27 0 z" fill="#3C1A70"/>'
      +'<circle cx="4" cy="-16" r="3" fill="#FFE07A"/><circle cx="-5" cy="-2" r="2.2" fill="#FFE07A"/>'))
    +anim('sb-gm-spin',3.6,at(100,30,'<path d="M0 -12 l3.4 8 l8 3.4 l-8 3.4 l-3.4 8 l-3.4 -8 l-8 -3.4 l8 -3.4 z" fill="#FFF0A8"/>'),0,'linear');

  window.SB_GAME_ART=A;
  /* Render one at any size. Same 120x120 stage and ink-outline treatment as SB_AVATAR, so the
     tiles sit in the same visual family as the avatar cards. */
  window.SB_GAME_MASCOT=function(type,size){
    var inner=A[type]; if(!inner) return '';
    size=size||64; var w=Math.max(1,Math.round(size/100*13)/10);
    var o='filter:drop-shadow('+w+'px 0 0 '+INK+') drop-shadow(-'+w+'px 0 0 '+INK+') drop-shadow(0 '+w+'px 0 '+INK+') drop-shadow(0 -'+w+'px 0 '+INK+') drop-shadow(0 4px 8px rgba(0,0,0,.3));';
    return '<svg viewBox="0 0 120 120" width="'+size+'" height="'+size+'" aria-hidden="true" style="display:block;overflow:visible;'+o+'">'+inner+'</svg>'; };
})();
