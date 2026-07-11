/* ============================================================
   SPELLBOUND COVER ART — composition × world prop kit
   SB_COVER(world, cardId, {h, dark}) → inline SVG string.
   A card's composition never changes; the world kit re-skins
   backdrop, palette, props and sparkle. No raster, no emoji.
   ============================================================ */
(function(){
  var KIT={
    spellbound:{ L:'#F6F4FC', D:'#3D3455', a:'#6C4FE0', p1:'#8B6FF0', p2:'#FFC23D', lt:'#EDE7FF', face:"'Fraunces',Georgia,serif", spark:star4('#F0B429'), motif:hexes },
    marquee:{ L:'#F3E9D2', D:'#4A3520', a:'#9C6A08', p1:'#C89A2B', p2:'#F0B429', lt:'#F7F1E2', face:"'Abril Fatface',Georgia,serif", spark:star5('#F7F1E2'), motif:beams },
    aurora:{ L:'#F2F4FB', D:'#262E5E', a:'#4A5BD4', p1:'#7D8CF0', p2:'#A9B4F7', lt:'#E5E9F6', face:"'Space Grotesk',sans-serif", spark:cross('#8FA0F5'), motif:stars },
    anime:{ L:'#FAF1F3', D:'#4A3038', a:'#C43D5A', p1:'#E76D88', p2:'#F3B2C0', lt:'#F3E2E7', face:"'Rajdhani',sans-serif", spark:petal('#E76D88'), motif:slash },
    science:{ L:'#EFF6F3', D:'#1C4A40', a:'#0E8A78', p1:'#3BC0AA', p2:'#7FD9C4', lt:'#E0EEE8', face:"'Spline Sans Mono',monospace", spark:ring('#7FD9C4'), motif:grid },
    origami:{ L:'#F8F2E8', D:'#584428', a:'#C25A2E', p1:'#E88A5C', p2:'#F0C9A2', lt:'#F0E5D3', face:"'Zen Maru Gothic',sans-serif", spark:diamond('#C25A2E'), motif:folds },
    pixel:{ L:'#EFF3FA', D:'#2C3A55', a:'#3B6FE0', p1:'#7BA3F5', p2:'#FFD34D', lt:'#E1E8F5', face:"'Bungee',sans-serif", spark:pxplus('#7BA3F5'), motif:pixels },
    avatar:{ L:'#EDF5F7', D:'#2C444E', a:'#2E8FB8', p1:'#6FC2E4', p2:'#F0B45B', lt:'#DEECF0', face:"'Philosopher',sans-serif", spark:dotring('#6FC2E4'), motif:arcs },
  };
  KIT.spotlight=KIT.marquee; KIT.galaxy=KIT.aurora; KIT.blade=KIT.anime; KIT.lab=KIT.science; KIT.arcade=KIT.pixel; KIT.elements=KIT.avatar;
  function star4(c){return function(x,y,s){return '<path d="M'+x+' '+(y-s)+'L'+(x+s*.28)+' '+(y-s*.28)+'L'+(x+s)+' '+y+'L'+(x+s*.28)+' '+(y+s*.28)+'L'+x+' '+(y+s)+'L'+(x-s*.28)+' '+(y+s*.28)+'L'+(x-s)+' '+y+'L'+(x-s*.28)+' '+(y-s*.28)+'Z" fill="'+c+'"/>';};}
  function star5(c){return function(x,y,s){var p='';for(var i=0;i<10;i++){var r=i%2?s*.42:s,A=-Math.PI/2+i*Math.PI/5;p+=(i?'L':'M')+(x+r*Math.cos(A)).toFixed(1)+' '+(y+r*Math.sin(A)).toFixed(1);}return '<path d="'+p+'Z" fill="'+c+'"/>';};}
  function cross(c){return function(x,y,s){return '<path d="M'+x+' '+(y-s)+'V'+(y+s)+'M'+(x-s)+' '+y+'H'+(x+s)+'" stroke="'+c+'" stroke-width="2" stroke-linecap="round"/>';};}
  function petal(c){return function(x,y,s){return '<ellipse cx="'+x+'" cy="'+y+'" rx="'+(s*.5)+'" ry="'+s+'" fill="'+c+'" transform="rotate(30 '+x+' '+y+')"/>';};}
  function ring(c){return function(x,y,s){return '<circle cx="'+x+'" cy="'+y+'" r="'+s+'" fill="none" stroke="'+c+'" stroke-width="2"/>';};}
  function diamond(c){return function(x,y,s){return '<path d="M'+x+' '+(y-s)+'L'+(x+s)+' '+y+'L'+x+' '+(y+s)+'L'+(x-s)+' '+y+'Z" fill="'+c+'"/>';};}
  function pxplus(c){return function(x,y,s){return '<path d="M'+(x-s/3)+' '+(y-s)+'h'+(s*2/3)+'v'+(s*2/3)+'h'+(s*2/3)+'v'+(s*2/3)+'h-'+(s*2/3)+'v'+(s*2/3)+'h-'+(s*2/3)+'v-'+(s*2/3)+'h-'+(s*2/3)+'v-'+(s*2/3)+'h'+(s*2/3)+'Z" fill="'+c+'"/>';};}
  function dotring(c){return function(x,y,s){var o='';for(var i=0;i<6;i++){var A=i*Math.PI/3;o+='<circle cx="'+(x+s*Math.cos(A)).toFixed(1)+'" cy="'+(y+s*Math.sin(A)).toFixed(1)+'" r="1.6" fill="'+c+'"/>';}return o;};}
  // backdrop motifs (≤ a few shapes, opacity layer)
  function hexes(k,d){var c=d?k.p1:k.a,o='';for(var i=0;i<5;i++){var x=30+i*66,y=(i%2?18:78);o+='<path d="M'+x+' '+(y-9)+'l8 4.5v9l-8 4.5-8-4.5v-9z" fill="none" stroke="'+c+'" stroke-opacity=".14" stroke-width="1.6"/>';}return o;}
  function beams(k,d){return '<path d="M40 -10 L86 130 L10 130 Z" fill="'+(d?'#F0B429':'#C89A2B')+'" opacity=".13"/><path d="M250 -10 L312 130 L214 130 Z" fill="'+(d?'#F0B429':'#C89A2B')+'" opacity=".10"/>';}
  function stars(k,d){var c=d?'#fff':k.a,o='';var pts=[[24,20],[64,64],[120,18],[196,70],[262,24],[300,60],[160,44]];for(var i=0;i<pts.length;i++)o+='<circle cx="'+pts[i][0]+'" cy="'+pts[i][1]+'" r="'+(i%3?1:1.6)+'" fill="'+c+'" opacity="'+(i%2?.5:.8)+'"/>';return o;}
  function slash(k,d){var c=d?k.p2:k.p1;return '<path d="M-8 96 L200 -14" stroke="'+c+'" stroke-width="2" opacity=".3"/><path d="M60 122 L320 -6" stroke="'+c+'" stroke-width="1.2" opacity=".2"/>';}
  function grid(k,d){var c=d?k.p2:k.a,o='';for(var x=0;x<=320;x+=26)o+='<path d="M'+x+' 0V110" stroke="'+c+'" stroke-opacity=".10"/>';for(var y=0;y<=110;y+=26)o+='<path d="M0 '+y+'H320" stroke="'+c+'" stroke-opacity=".10"/>';return o;}
  function folds(k,d){var c=d?k.p2:k.p1;return '<path d="M0 110 L60 52 L120 110 Z" fill="'+c+'" opacity=".18"/><path d="M90 110 L150 62 L210 110 Z" fill="'+c+'" opacity=".12"/><path d="M40 40 L58 24" stroke="'+c+'" stroke-dasharray="3 4" opacity=".5"/>';}
  function pixels(k,d){var c=d?k.p1:k.a,o='';var b=[[22,18],[38,34],[262,20],[286,44],[70,80],[240,84]];for(var i=0;i<b.length;i++)o+='<rect x="'+b[i][0]+'" y="'+b[i][1]+'" width="10" height="10" fill="'+c+'" opacity="'+(i%2?.18:.3)+'"/>';return o;}
  function arcs(k,d){var c=d?k.p1:k.a;return '<path d="M-20 96 Q160 40 340 96" fill="none" stroke="'+c+'" stroke-width="2" opacity=".2"/><path d="M-20 110 Q160 60 340 110" fill="none" stroke="'+c+'" stroke-width="1.4" opacity=".14"/>';}
  // focal objects per composition (world-varied via kit + per-world variant table)
  function trophy(k,w){ // Champion's Quest — a prize on a stage
    var body='<path d="M138 30 h44 v14 a22 22 0 0 1 -44 0 Z" fill="'+k.p2+'"/><path d="M138 34 q-16 2 -14 14 q2 10 16 10" fill="none" stroke="'+k.p2+'" stroke-width="4"/><path d="M182 34 q16 2 14 14 q-2 10 -16 10" fill="none" stroke="'+k.p2+'" stroke-width="4"/><rect x="152" y="64" width="16" height="9" fill="'+k.p2+'"/><rect x="143" y="73" width="34" height="7" rx="2" fill="'+k.p1+'"/>';
    if(w==='pixel'||w==='arcade') body='<g shape-rendering="crispEdges"><rect x="140" y="30" width="40" height="18" fill="'+k.p2+'"/><rect x="148" y="48" width="24" height="8" fill="'+k.p2+'"/><rect x="156" y="56" width="8" height="10" fill="'+k.p2+'"/><rect x="144" y="66" width="32" height="8" fill="'+k.p1+'"/></g>';
    if(w==='origami') body='<path d="M160 26 L184 58 L160 50 Z" fill="'+k.p2+'"/><path d="M160 26 L136 58 L160 50 Z" fill="'+k.p1+'"/><path d="M160 50 L170 74 L150 74 Z" fill="'+k.a+'"/>';
    if(w==='science'||w==='lab') body='<path d="M152 26 v16 l-14 26 a6 6 0 0 0 5.6 8 h32.8 a6 6 0 0 0 5.6 -8 l-14 -26 v-16" fill="none" stroke="'+k.p2+'" stroke-width="4" stroke-linecap="round"/><path d="M147 26 h26" stroke="'+k.p2+'" stroke-width="4" stroke-linecap="round"/><circle cx="154" cy="62" r="3" fill="'+k.p2+'"/>';
    if(w==='avatar'||w==='elements') body='<circle cx="160" cy="50" r="22" fill="none" stroke="'+k.p2+'" stroke-width="3"/><path d="M160 36 l6 10 h-12 Z" fill="'+k.p2+'"/><circle cx="160" cy="62" r="4" fill="'+k.p1+'"/>';
    return '<rect x="118" y="84" width="84" height="10" rx="3" fill="'+k.p1+'" opacity=".85"/>'+body;
  }
  function bricks(k,w){ // Concepts — UN + LOCK + ED morpheme bricks in the world's display face
    function brick(x,y,wd,txt,fill,rot){ return '<g transform="rotate('+rot+' '+(x+wd/2)+' '+(y+14)+')"><rect x="'+x+'" y="'+y+'" width="'+wd+'" height="30" rx="'+((w==='pixel'||w==='arcade')?0:6)+'" fill="'+fill+'"/><text x="'+(x+wd/2)+'" y="'+(y+21)+'" text-anchor="middle" font-family="'+k.face+'" font-weight="800" font-size="16" fill="#fff">'+txt+'</text></g>'; }
    var plus='<text x="118" y="62" font-family="'+k.face+'" font-size="15" fill="'+k.p1+'" font-weight="800">+</text><text x="216" y="62" font-family="'+k.face+'" font-size="15" fill="'+k.p1+'" font-weight="800">+</text>';
    return brick(62,42,48,'UN',k.p1,-4)+brick(130,40,78,'LOCK',k.a,2)+brick(226,42,42,'ED',k.p2,-3)+plus;
  }
  function route(k,w){ // Word Journeys — dotted route to a flag
    var land='';
    if(w==='marquee'||w==='spotlight') land='<rect x="220" y="58" width="34" height="20" rx="3" fill="'+k.p2+'"/><circle cx="228" cy="68" r="2" fill="'+k.D+'"/><circle cx="246" cy="68" r="2" fill="'+k.D+'"/>';
    else if(w==='aurora'||w==='galaxy') land='<circle cx="238" cy="62" r="10" fill="'+k.p1+'"/><ellipse cx="238" cy="63" rx="17" ry="5" fill="none" stroke="'+k.p2+'" stroke-width="1.6" transform="rotate(-12 238 63)"/>';
    else if(w==='science'||w==='lab') land='<path d="M232 50 v8 l-8 14 a4 4 0 0 0 3.7 5.4 h16.6 a4 4 0 0 0 3.7 -5.4 l-8 -14 v-8" fill="none" stroke="'+k.p1+'" stroke-width="3"/>';
    else if(w==='origami') land='<path d="M226 76 L244 50 L262 76 Z" fill="'+k.p1+'"/><path d="M244 50 L244 76" stroke="'+k.L+'" stroke-dasharray="2 3"/>';
    else if(w==='pixel'||w==='arcade') land='<g shape-rendering="crispEdges"><rect x="228" y="60" width="12" height="12" fill="'+k.p1+'"/><rect x="240" y="48" width="12" height="12" fill="'+k.p2+'"/><rect x="252" y="60" width="12" height="12" fill="'+k.p1+'"/></g>';
    else if(w==='avatar'||w==='elements') land='<circle cx="230" cy="66" r="7" fill="none" stroke="'+k.p1+'" stroke-width="2.4"/><circle cx="250" cy="58" r="7" fill="none" stroke="'+k.p2+'" stroke-width="2.4"/>';
    else land='<path d="M236 74 q-8 -12 4 -20 q14 -8 8 -22" fill="none" stroke="'+k.p1+'" stroke-width="2.4"/><circle cx="248" cy="30" r="5" fill="'+k.p2+'"/>';
    return '<path d="M36 84 Q110 66 150 56 T272 34" fill="none" stroke="'+k.p1+'" stroke-width="2.6" stroke-dasharray="1 9" stroke-linecap="round"/>'
      +'<circle cx="36" cy="84" r="5" fill="'+k.a+'"/>'
      +'<path d="M272 34 v-16 l14 5 -14 5" fill="'+k.p2+'" stroke="'+k.p2+'" stroke-width="2" stroke-linejoin="round"/><path d="M272 18 V44" stroke="'+k.p2+'" stroke-width="2.4"/>'+land;
  }
  function cabinet(k,w){ // Arcade — frame + controller + coin
    var px=(w==='pixel'||w==='arcade');
    var frame=px?'<g shape-rendering="crispEdges"><rect x="112" y="20" width="96" height="14" fill="'+k.a+'"/><rect x="120" y="24" width="6" height="6" fill="'+k.p2+'"/><rect x="136" y="24" width="6" height="6" fill="'+k.p2+'"/><rect x="152" y="24" width="6" height="6" fill="'+k.p2+'"/><rect x="168" y="24" width="6" height="6" fill="'+k.p2+'"/><rect x="184" y="24" width="6" height="6" fill="'+k.p2+'"/></g>'
      :'<path d="M112 34 a48 20 0 0 1 96 0" fill="none" stroke="'+k.a+'" stroke-width="6" stroke-linecap="round"/><circle cx="128" cy="26" r="2.6" fill="'+k.p2+'"/><circle cx="146" cy="21" r="2.6" fill="'+k.p2+'"/><circle cx="160" cy="19" r="2.6" fill="'+k.p2+'"/><circle cx="174" cy="21" r="2.6" fill="'+k.p2+'"/><circle cx="192" cy="26" r="2.6" fill="'+k.p2+'"/>';
    var pad='<rect x="132" y="52" width="56" height="30" rx="'+(px?0:12)+'" fill="'+k.p1+'"/><path d="M146 62 v10 M141 67 h10" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="172" cy="63" r="3.4" fill="#fff"/><circle cx="180" cy="70" r="3.4" fill="#fff" opacity=".85"/>';
    var coin='<circle cx="216" cy="78" r="9" fill="'+k.p2+'"/><path d="M216 73 l1.8 3.4 3.8.5 -2.8 2.6 .7 3.8 -3.5 -1.8 -3.5 1.8 .7 -3.8 -2.8 -2.6 3.8 -.5 Z" fill="'+(px?k.a:'#fff')+'" opacity=".9"/>';
    return frame+pad+coin;
  }
  function swatches(k,w){ // Theme Journeys — four cluster-hue tiles on the world grid
    var cs=['#B14FC4','#13A892','#E0922E','#3D7DF0'],o='';
    for(var i=0;i<4;i++){ var x=112+i*28; o+='<rect x="'+x+'" y="'+(46+(i%2?6:-6))+'" width="22" height="22" rx="'+((w==='pixel'||w==='arcade')?0:6)+'" fill="'+cs[i]+'" transform="rotate('+(i%2?3:-3)+' '+(x+11)+' 57)"/>'; }
    return o+'<path d="M108 88 H236" stroke="'+k.p1+'" stroke-width="2" stroke-dasharray="1 7" stroke-linecap="round"/>';
  }
  function radar(k,w){ // Traps — a radar sweep finding pattern blips
    return '<circle cx="160" cy="58" r="34" fill="none" stroke="'+k.p1+'" stroke-width="2" opacity=".55"/>'
      +'<circle cx="160" cy="58" r="22" fill="none" stroke="'+k.p1+'" stroke-width="2" opacity=".75"/>'
      +'<circle cx="160" cy="58" r="10" fill="none" stroke="'+k.p1+'" stroke-width="2"/>'
      +'<path d="M160 58 L189 41" stroke="'+k.a+'" stroke-width="3" stroke-linecap="round"/>'
      +'<path d="M160 58 L192 44 A34 34 0 0 0 185 33 Z" fill="'+k.a+'" opacity=".25"/>'
      +'<circle cx="143" cy="47" r="4.5" fill="'+k.p2+'"/><circle cx="174" cy="72" r="4.5" fill="'+k.p2+'"/><circle cx="150" cy="74" r="3.2" fill="'+k.p2+'" opacity=".8"/>'
      +'<circle cx="160" cy="58" r="3" fill="'+k.a+'"/>';
  }
  var COMPS={ quest:trophy, concepts:bricks, journeys:route, arcade:cabinet, themes:swatches, traps:radar };

  // ---- extended compositions: practice hub, chapter covers (h150), game tiles ----
  function fan(k,w){ var o='',ang=[-14,-5,4,13]; for(var i=0;i<4;i++){ var x=120+i*20;
    o+='<g transform="rotate('+ang[i]+' '+(x+22)+' 88)"><rect x="'+x+'" y="34" width="44" height="58" rx="'+((w==='pixel'||w==='arcade')?0:7)+'" fill="'+(i===3?k.a:k.lt)+'" stroke="'+k.p1+'" stroke-width="1.4"/>'+(i===3?'<text x="'+(x+22)+'" y="70" text-anchor="middle" font-family="'+k.face+'" font-weight="800" font-size="22" fill="#fff">A</text>':'')+'</g>'; } return o; }
  function mic(k,w){ var t='';['S','A','Y'].forEach(function(L,i){ var x=176+i*38,y=36+(i%2?10:0);
      t+='<g transform="rotate('+(i%2?4:-5)+' '+(x+14)+' '+(y+14)+')"><rect x="'+x+'" y="'+y+'" width="28" height="28" rx="'+((w==='pixel'||w==='arcade')?0:6)+'" fill="'+(i===1?k.a:k.p1)+'"/><text x="'+(x+14)+'" y="'+(y+20)+'" text-anchor="middle" font-family="'+k.face+'" font-weight="800" font-size="15" fill="#fff">'+L+'</text></g>'; });
    return '<rect x="96" y="30" width="26" height="42" rx="13" fill="'+k.a+'"/><path d="M88 56 a21 21 0 0 0 42 0" fill="none" stroke="'+k.p1+'" stroke-width="4" stroke-linecap="round"/><path d="M109 78 V92 M96 92 h26" stroke="'+k.p1+'" stroke-width="4" stroke-linecap="round"/>'+t; }
  function clip(k,w){ return '<rect x="128" y="24" width="64" height="72" rx="6" fill="'+k.lt+'" stroke="'+k.p1+'" stroke-width="2"/><rect x="146" y="18" width="28" height="12" rx="4" fill="'+k.a+'"/><path d="M138 46 h44 M138 60 h44 M138 74 h30" stroke="'+k.p1+'" stroke-width="3" stroke-linecap="round"/><circle cx="216" cy="76" r="12" fill="'+k.p2+'"/><path d="M216 70 v6 l5 4" stroke="'+(k.D)+'" stroke-width="2.4" fill="none" stroke-linecap="round"/>'; }
  function checklist(k,w){ return '<rect x="118" y="26" width="70" height="66" rx="'+((w==='pixel'||w==='arcade')?0:8)+'" fill="'+k.lt+'" stroke="'+k.p1+'" stroke-width="2"/><path d="M128 44 l5 5 9-10 M128 64 l5 5 9-10" stroke="'+k.a+'" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M150 46 h28 M150 66 h22" stroke="'+k.p1+'" stroke-width="3" stroke-linecap="round"/><circle cx="206" cy="70" r="15" fill="'+k.a+'"/><path d="M206 63 v14 M199 70 h14" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/>'; }
  function glyphChapter(k,w,label){ label=(label||'A').slice(0,6);
    return '<g transform="rotate(-3 160 58)"><rect x="104" y="26" width="112" height="60" rx="'+((w==='pixel'||w==='arcade')?0:10)+'" fill="'+k.a+'"/><text x="160" y="68" text-anchor="middle" font-family="'+k.face+'" font-weight="800" font-size="30" fill="#fff">'+label+'</text></g>';
  }
  function gameTile(k,w,g){
    if(g==='beat') return '<circle cx="160" cy="66" r="26" fill="none" stroke="'+k.p1+'" stroke-width="5"/><path d="M160 66 V46 M160 66 l14 10" stroke="'+k.a+'" stroke-width="4.6" stroke-linecap="round"/>';
    if(g==='boss') return '<path d="M136 40 q24 -18 48 0 v22 q0 20 -24 30 q-24 -10 -24 -30 Z" fill="'+k.p1+'"/><circle cx="150" cy="60" r="4" fill="'+k.D+'"/><circle cx="170" cy="60" r="4" fill="'+k.D+'"/>';
    if(g==='magic') { var o=''; for(var i=0;i<9;i++){ var x=132+(i%3)*20,y=38+((i/3)|0)*20; o+='<rect x="'+x+'" y="'+y+'" width="16" height="16" rx="3" fill="'+(i%2?k.a:k.p2)+'" opacity="'+(i%2?1:.85)+'"/>'; } return o; }
    if(g==='buzz') return '<path d="M160 30 c4 12 -3 18 -9 24 -6 6 -12 13 -12 24 a21 21 0 0 0 42 0 c0 -8 -3 -14 -8 -19 -2 4 -4 7 -8 9 2 -12 -1 -27 -5 -38Z" fill="'+k.a+'"/>';
    if(g==='meaning'||g==='wordquiz') return '<rect x="118" y="42" width="40" height="26" rx="6" fill="'+k.p1+'"/><rect x="166" y="42" width="40" height="26" rx="6" fill="'+k.a+'"/><path d="M158 55 h8" stroke="'+k.p2+'" stroke-width="4" stroke-linecap="round"/><path d="M140 84 l6 6 10-12" stroke="'+k.p2+'" stroke-width="4" fill="none" stroke-linecap="round"/>';
    if(g==='spell') return '<circle cx="150" cy="56" r="20" fill="none" stroke="'+k.a+'" stroke-width="5"/><path d="M164 70 l16 16" stroke="'+k.a+'" stroke-width="5" stroke-linecap="round"/><text x="150" y="62" text-anchor="middle" font-family="'+k.face+'" font-weight="800" font-size="16" fill="'+k.p1+'">ab</text>';
    if(g==='origin') return '<circle cx="160" cy="60" r="24" fill="none" stroke="'+k.a+'" stroke-width="4"/><path d="M136 60 h48 M160 36 c-8 8 -8 40 0 48 M160 36 c8 8 8 40 0 48" fill="none" stroke="'+k.p1+'" stroke-width="2.4"/>';
    if(g==='duel') return '<rect x="112" y="46" width="42" height="26" rx="8" fill="'+k.p1+'" transform="rotate(-8 133 59)"/><rect x="166" y="46" width="42" height="26" rx="8" fill="'+k.a+'" transform="rotate(8 187 59)"/><text x="160" y="42" text-anchor="middle" font-family="'+k.face+'" font-weight="800" font-size="15" fill="'+k.p2+'">VS</text><path d="M160 78 l3 6 6.6.6-5 4.4 1.5 6.5-6.1-3.6-6.1 3.6 1.5-6.5-5-4.4 6.6-.6Z" fill="'+k.p2+'"/>';
    if(g==='champ') return '<path d="M148 30 h24 l-6 22 h14 l-32 40 8 -28 h-14 Z" fill="'+k.p2+'"/>';
    return cabinet(k,w);
  }
  COMPS.flashcards=fan; COMPS.spellit=mic; COMPS.coach=clip; COMPS.builder=checklist;
  window.SB_CHAPTER=function(world,label,opt){ opt=opt||{}; var k=KIT[world]||KIT.spellbound; var db=!opt.dark; var bg=db?k.D:k.L;
    return '<svg viewBox="0 0 320 110" preserveAspectRatio="xMidYMid slice" width="100%" height="'+(opt.h||110)+'" style="display:block" aria-hidden="true"><rect width="320" height="110" fill="'+bg+'"/>'+k.motif(k,db)+glyphChapter(k,world,label)+k.spark(288,20,7)+k.spark(36,86,5)+'</svg>'; };
  window.SB_BACKDROP=function(world,opt){ opt=opt||{}; var k=KIT[world]||KIT.spellbound; var db=!opt.dark; var bg=db?k.D:k.L;
    return '<svg viewBox="0 0 320 110" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" style="display:block;position:absolute;inset:0" aria-hidden="true"><rect width="320" height="110" fill="'+bg+'"/>'+k.motif(k,db)+k.spark(292,18,7)+k.spark(30,80,5)+'</svg>'; };
  window.SB_GAME=function(world,type,opt){ opt=opt||{}; var k=KIT[world]||KIT.spellbound; var db=!opt.dark; var bg=db?k.D:k.L;
    return '<svg viewBox="0 0 320 110" preserveAspectRatio="xMidYMid slice" width="100%" height="'+(opt.h||110)+'" style="display:block" aria-hidden="true"><rect width="320" height="110" fill="'+bg+'"/>'+k.motif(k,db)+gameTile(k,world,type)+k.spark(290,18,7)+'</svg>'; };

  var cache={};
  window.SB_COVER=function(world,card,opt){ opt=opt||{}; var h=opt.h||110, dark=!!opt.dark;
    var key=world+'|'+card+'|'+h+'|'+dark; if(cache[key]) return cache[key];
    var k=KIT[world]||KIT.spellbound; var comp=COMPS[card]||COMPS.quest;
    var db=!dark; var bg=db?k.D:k.L;   /* visual contrast: dark art on light modes, light art in dusk */
    var sp=k.spark(292,18,7)+k.spark(30,64,5);
    var svg='<svg viewBox="0 0 320 110" preserveAspectRatio="xMidYMid slice" width="100%" height="'+h+'" style="display:block" aria-hidden="true">'
      +'<rect width="320" height="110" fill="'+bg+'"/>'+k.motif(k,db)+comp(k,world)+sp+'</svg>';
    cache[key]=svg; return svg; };
})();
