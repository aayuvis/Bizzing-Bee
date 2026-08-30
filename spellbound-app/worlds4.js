/* worlds4.js — four new worlds: God's Abode, Serpent's Lair, Race Zone, Dino Era.
   Everything a world needs lives here rather than being sprinkled through the app:
     · the THEMES entry, label and one-line promise
     · the ten-rung evolution ladder — names, palette, hand-drawn art and per-rung animation
     · the world hero banner
     · the cover-art motif kit (backgrounds behind every card cover)
     · a signature sound played when the world is chosen
   The animated backdrops and the per-world card treatments are CSS, in worlds4.css.
   Load AFTER app.js / app2.js / cover-art.js and BEFORE app3.js. */
(function(){
  var W = [
    /* Serpent's Lair left the store in the Aug-31 cut (archive/store-cut-2026-08.md);
       its scene, ladder and CSS stay below for revival. */
    { id:'godly',   label:"God's Abode", sub:'Divine',   c1:'#B8860B', c2:'#FBF3DC' },
    { id:'race',    label:'Race Zone',   sub:'Full throttle', c1:'#2456D6', c2:'#EEF3FA' },
    { id:'dino',    label:'Dino Era',    sub:'Prehistoric',   c1:'#5E7A2E', c2:'#F3F2E4' }
  ];

  /* ---------- 1. register the worlds themselves ---------- */
  try{
    W.forEach(function(w){
      if(!THEMES.some(function(t){ return t.id===w.id; })) THEMES.push(w);
      THEME_LABEL[w.id]=w.label;
    });
    WORLD_DEF.godly   = 'Climb from a mortal spark to a god of words.';
    WORLD_DEF.serpent = 'Slither from a single egg to the great world-serpent.';
    WORLD_DEF.race    = 'Start on foot and finish as a champion racer.';
    WORLD_DEF.dino    = 'Hatch small and grow into the mightiest of them all.';
  }catch(e){}

  /* ---------- 2. evolution ladders ---------- */
  try{
    EV_TC.godly   = { a:'#E0A82E', b:'#F6DC8A', c:'#B8860B', ink:'#8A5B00' };
    EV_TC.serpent = { a:'#3FA86A', b:'#8FD9A8', c:'#2E7D52', ink:'#1E5B39' };
    EV_TC.race    = { a:'#3D7DF0', b:'#FFC83D', c:'#2C3A55', ink:'#14337A' };
    EV_TC.dino    = { a:'#6F9438', b:'#A8C86A', c:'#C25A2E', ink:'#3F5A1C' };

    EV_NOMEN.godly   = ['Mortal','Seeker','Acolyte','Devotee','Oracle','Priest','Demigod','Deity','Ascendant','Godhead'];
    EV_NOMEN.serpent = ['Egg','Hatchling','Slitherer','Coil','Viper','Cobra','Python','Basilisk','Wyrm','World-Serpent'];
    EV_NOMEN.race    = ['On Foot','Trike','Scooter','Kart','Hot Rod','Racer','Speedster','Formula','Champion','Grand Prix'];
    EV_NOMEN.dino    = ['Egg','Hatchling','Compy','Raptor','Stego','Trike','Anky','Spino','T-Rex','Brachio'];
  }catch(e){}

  /* --- small drawing helpers, all inside the 48x52 ladder stage --- */
  function halo(k){ return '<circle cx="24" cy="16" r="7" fill="none" stroke="'+k+'" stroke-width="1.6" opacity=".9"/>'; }
  function rays(c){ var o=''; for(var i=0;i<8;i++){ var A=i*Math.PI/4;
    o+='<line x1="'+(24+Math.cos(A)*10).toFixed(1)+'" y1="'+(28+Math.sin(A)*10).toFixed(1)
      +'" x2="'+(24+Math.cos(A)*15).toFixed(1)+'" y2="'+(28+Math.sin(A)*15).toFixed(1)
      +'" stroke="'+c+'" stroke-width="1.5" stroke-linecap="round" opacity=".75"/>'; }
    return o; }
  function coil(n,col,k){ var o='<path d="'; var y=42;
    for(var i=0;i<n;i++){ o+=(i?'':'M14 '+y)+' q10 -6 20 0 q-10 6 -20 0'; y-=5; }
    return '<g stroke="'+k+'" stroke-width="1" fill="'+col+'">'+o+'"/></g>'; }
  function wheel(cx,cy,r,k){ return '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="#2C3A55" stroke="'+k+'" stroke-width="1"/>'
    +'<circle cx="'+cx+'" cy="'+cy+'" r="'+(r*0.45).toFixed(1)+'" fill="#D8DEE9"/>'; }

  var EMB = {
    /* ---- GOD'S ABODE: a mortal spark that becomes a radiant godhead ---- */
    godly:function(s,C){ var A=C.a,B=C.b,G=C.c,k=C.ink; var g='';
      if(s===0) g+='<circle cx="24" cy="30" r="4.5" fill="'+B+'" stroke="'+k+'" stroke-width="1"/><path d="M24 24 v-4" stroke="'+k+'" stroke-width="1" opacity=".5"/>';
      else if(s===1) g+='<path d="M24 40 q-6 -5 -6 -11 a6 6 0 0 1 12 0 q0 6 -6 11 z" fill="'+B+'" stroke="'+k+'" stroke-width="1"/><circle cx="24" cy="28" r="2" fill="#fff" opacity=".7"/>';
      else if(s===2) g+='<path d="M18 42 q6 -3 12 0 l-2 -14 q-4 -2 -8 0 z" fill="'+B+'" stroke="'+k+'" stroke-width="1"/><circle cx="24" cy="23" r="4.5" fill="'+A+'" stroke="'+k+'" stroke-width="1"/>';
      else if(s===3) g+='<path d="M17 42 q7 -3 14 0 l-2 -15 q-5 -2 -10 0 z" fill="'+B+'" stroke="'+k+'" stroke-width="1"/><circle cx="24" cy="22" r="5" fill="'+A+'" stroke="'+k+'" stroke-width="1"/>'+halo(G);
      else if(s===4) g+='<path d="M16 42 q8 -3 16 0 l-2 -16 q-6 -2 -12 0 z" fill="'+B+'" stroke="'+k+'" stroke-width="1"/><circle cx="24" cy="21" r="5" fill="'+A+'" stroke="'+k+'" stroke-width="1"/>'+halo(G)+'<path d="M31 34 l7 -5" stroke="'+G+'" stroke-width="1.6" stroke-linecap="round"/>';
      else if(s===5) g+='<path d="M15 42 q9 -3 18 0 l-2 -17 q-7 -2 -14 0 z" fill="'+A+'" stroke="'+k+'" stroke-width="1"/><circle cx="24" cy="20" r="5.2" fill="'+B+'" stroke="'+k+'" stroke-width="1"/>'+halo(G)+'<path d="M10 30 h4 M34 30 h4" stroke="'+G+'" stroke-width="1.4" stroke-linecap="round"/>';
      else if(s===6) g+=rays(B)+'<path d="M15 42 q9 -3 18 0 l-2 -17 q-7 -2 -14 0 z" fill="'+A+'" stroke="'+k+'" stroke-width="1"/><circle cx="24" cy="19" r="5.4" fill="'+B+'" stroke="'+k+'" stroke-width="1"/>'+halo(G);
      else if(s===7) g+=rays(B)+'<path d="M14 42 q10 -3 20 0 l-2 -18 q-8 -2 -16 0 z" fill="'+A+'" stroke="'+k+'" stroke-width="1"/><circle cx="24" cy="18" r="5.6" fill="#FFF3D0" stroke="'+k+'" stroke-width="1"/><path d="M17 12 l3 -5 l4 4 l4 -4 l3 5 z" fill="'+B+'" stroke="'+k+'" stroke-width=".8"/>';
      else if(s===8) g+=rays(B)+'<circle cx="24" cy="28" r="13" fill="none" stroke="'+B+'" stroke-width="1.2" opacity=".7"/><path d="M13 42 q11 -3 22 0 l-3 -19 q-8 -2 -16 0 z" fill="'+G+'" stroke="'+k+'" stroke-width="1"/><circle cx="24" cy="17" r="6" fill="#FFF6DE" stroke="'+k+'" stroke-width="1"/><path d="M16 11 l3 -6 l5 5 l5 -5 l3 6 z" fill="'+B+'" stroke="'+k+'" stroke-width=".8"/>';
      else g+=rays(B)+'<circle cx="24" cy="28" r="15" fill="none" stroke="'+B+'" stroke-width="1.4"/><circle cx="24" cy="28" r="11" fill="'+B+'" opacity=".28"/><path d="M12 43 q12 -3 24 0 l-3 -20 q-9 -2 -18 0 z" fill="'+A+'" stroke="'+k+'" stroke-width="1.1"/><circle cx="24" cy="16" r="6.4" fill="#FFFBEE" stroke="'+k+'" stroke-width="1"/><path d="M15 10 l3 -7 l6 6 l6 -6 l3 7 z" fill="'+B+'" stroke="'+k+'" stroke-width=".9"/><circle cx="24" cy="16" r="9" fill="none" stroke="#fff" stroke-width="1" opacity=".8"/>';
      return g; },

    /* ---- SERPENT'S LAIR: one egg to the world-serpent ---- */
    serpent:function(s,C){ var A=C.a,B=C.b,G=C.c,k=C.ink; var g='';
      var head=function(x,y,r,f){ return '<ellipse cx="'+x+'" cy="'+y+'" rx="'+r+'" ry="'+(r*0.8).toFixed(1)+'" fill="'+f+'" stroke="'+k+'" stroke-width="1"/>'
        +'<circle cx="'+(x-r*0.35).toFixed(1)+'" cy="'+(y-r*0.2).toFixed(1)+'" r="'+(r*0.2).toFixed(1)+'" fill="#FFE07A"/>'
        +'<circle cx="'+(x+r*0.35).toFixed(1)+'" cy="'+(y-r*0.2).toFixed(1)+'" r="'+(r*0.2).toFixed(1)+'" fill="#FFE07A"/>'
        +'<path d="M'+x+' '+(y+r*0.7)+' l0 4 l-2.5 2 M'+x+' '+(y+r*0.7+4)+' l2.5 2" stroke="#E0453A" stroke-width="1" fill="none"/>'; };
      if(s===0) g+='<ellipse cx="24" cy="32" rx="8" ry="10" fill="#E9F3DF" stroke="'+k+'" stroke-width="1.2"/><path d="M20 30 q4 2 7 -1" stroke="'+k+'" stroke-width=".8" fill="none" opacity=".4"/><ellipse cx="21" cy="28" rx="2" ry="2.6" fill="'+B+'" opacity=".5"/>';
      else if(s===1) g+='<path d="M16 42 q4 -4 10 -3" stroke="'+A+'" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="24" cy="36" rx="8" ry="7" fill="#E9F3DF" stroke="'+k+'" stroke-width="1"/><path d="M17 33 l5 3 l-4 3" fill="none" stroke="'+k+'" stroke-width=".9"/>'+head(29,30,4.5,B);
      else if(s===2) g+='<path d="M11 40 q7 -7 13 0 q6 7 13 0" stroke="'+A+'" stroke-width="5" fill="none" stroke-linecap="round"/>'+head(37,36,5,B);
      else if(s===3) g+=coil(3,A,k)+head(24,25,5.5,B);
      else if(s===4) g+=coil(4,A,k)+head(24,20,6,B)+'<path d="M19 15 q5 -4 10 0" stroke="'+G+'" stroke-width="1.4" fill="none"/>';
      else if(s===5) g+=coil(4,A,k)+'<path d="M14 22 q10 -9 20 0 q-4 4 -10 4 q-6 0 -10 -4 z" fill="'+G+'" stroke="'+k+'" stroke-width="1" opacity=".9"/>'+head(24,19,6,B);
      else if(s===6) g+=coil(5,G,k)+head(24,16,6.4,A)+'<path d="M15 40 q9 5 18 0" stroke="'+k+'" stroke-width=".8" fill="none" opacity=".4"/>';
      else if(s===7) g+=coil(5,G,k)+head(24,15,6.6,A)+'<path d="M18 9 l2 -5 l3 4 l3 -4 l2 5 z" fill="'+B+'" stroke="'+k+'" stroke-width=".8"/>';
      else if(s===8) g+='<circle cx="24" cy="30" r="14" fill="none" stroke="'+G+'" stroke-width="4" opacity=".85"/>'+coil(4,A,k)+head(24,14,7,B);
      else g+='<circle cx="24" cy="28" r="16" fill="none" stroke="'+G+'" stroke-width="5"/><circle cx="24" cy="28" r="16" fill="none" stroke="'+B+'" stroke-width="1.4" opacity=".7"/>'+coil(3,A,k)+head(24,12,7.4,B)+'<path d="M17 6 l2 -4 l5 4 l5 -4 l2 4 z" fill="'+B+'" stroke="'+k+'" stroke-width=".8"/>';
      return g; },

    /* ---- RACE ZONE: on foot to the Grand Prix ---- */
    race:function(s,C){ var A=C.a,B=C.b,G=C.c,k=C.ink; var g='';
      if(s===0) g+='<circle cx="24" cy="22" r="4" fill="'+B+'" stroke="'+k+'" stroke-width="1"/><path d="M24 26 v8 M24 30 l-4 5 M24 30 l4 5 M20 28 l-4 3 M28 28 l4 3" stroke="'+k+'" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
      else if(s===1) g+='<path d="M14 34 h20 l-3 -7 h-11 z" fill="'+B+'" stroke="'+k+'" stroke-width="1"/>'+wheel(15,38,4,k)+wheel(32,38,4,k)+wheel(24,38,3,k);
      else if(s===2) g+='<path d="M13 34 q4 -10 16 -8 l3 8 z" fill="'+A+'" stroke="'+k+'" stroke-width="1"/><path d="M28 26 v-6" stroke="'+k+'" stroke-width="1.4"/>'+wheel(14,38,4.5,k)+wheel(32,38,4.5,k);
      else if(s===3) g+='<path d="M10 34 h28 l-4 -8 h-8 l-3 -4 h-9 z" fill="'+A+'" stroke="'+k+'" stroke-width="1"/><rect x="18" y="24" width="7" height="4" rx="1" fill="#BFE3F5"/>'+wheel(15,38,5,k)+wheel(33,38,5,k);
      else if(s===4) g+='<path d="M8 34 h32 l-3 -9 h-10 l-4 -4 h-11 z" fill="'+A+'" stroke="'+k+'" stroke-width="1"/><rect x="17" y="23" width="8" height="5" rx="1" fill="#BFE3F5"/><path d="M36 25 l4 -4" stroke="'+B+'" stroke-width="2" stroke-linecap="round"/>'+wheel(14,38,5.4,k)+wheel(34,38,5.4,k);
      else if(s===5) g+='<path d="M7 33 q6 -12 20 -10 l10 4 l2 6 z" fill="'+A+'" stroke="'+k+'" stroke-width="1"/><rect x="18" y="23" width="9" height="5" rx="1.5" fill="#BFE3F5"/><path d="M6 30 h-4 M6 34 h-5" stroke="'+B+'" stroke-width="1.6" stroke-linecap="round"/>'+wheel(14,38,5.6,k)+wheel(34,38,5.6,k);
      else if(s===6) g+='<path d="M5 33 q7 -13 22 -11 l11 5 l2 6 z" fill="'+A+'" stroke="'+k+'" stroke-width="1"/><rect x="19" y="22" width="9" height="5" rx="1.5" fill="#BFE3F5"/><path d="M4 28 h-3 M4 32 h-4 M5 36 h-3" stroke="'+B+'" stroke-width="1.6" stroke-linecap="round"/>'+wheel(14,38,5.8,k)+wheel(35,38,5.8,k);
      else if(s===7) g+='<path d="M4 34 h40 l-4 -6 l-10 -2 l-6 -4 h-12 z" fill="'+A+'" stroke="'+k+'" stroke-width="1"/><path d="M30 22 h9 l1 5 h-10 z" fill="'+G+'"/><rect x="16" y="24" width="8" height="4" rx="1" fill="#BFE3F5"/>'+wheel(12,38,6,k)+wheel(36,38,6,k);
      else if(s===8) g+='<path d="M3 34 h42 l-4 -6 l-11 -2 l-6 -5 h-13 z" fill="'+A+'" stroke="'+k+'" stroke-width="1.1"/><path d="M29 21 h11 l1 6 h-12 z" fill="'+G+'"/><rect x="15" y="24" width="8" height="4" rx="1" fill="#BFE3F5"/><path d="M2 26 h-2 M2 31 h-2 M3 36 h-3" stroke="'+B+'" stroke-width="1.8" stroke-linecap="round"/>'+wheel(12,38,6.2,k)+wheel(37,38,6.2,k);
      else g+='<g opacity=".9"><rect x="2" y="8" width="12" height="9" fill="#fff"/><path d="M2 8h4v3h-4z M10 8h4v3h-4z M6 11h4v3h-4z M2 14h4v3h-4z M10 14h4v3h-4z" fill="'+G+'"/></g>'
        +'<path d="M3 34 h42 l-4 -7 l-11 -2 l-6 -5 h-13 z" fill="'+A+'" stroke="'+k+'" stroke-width="1.1"/><path d="M28 20 h12 l2 7 h-13 z" fill="'+G+'"/><rect x="14" y="24" width="9" height="4" rx="1" fill="#BFE3F5"/>'
        +'<path d="M18 18 l3 -6 l3 5 l3 -5 l3 6 z" fill="'+B+'" stroke="'+k+'" stroke-width=".8"/>'+wheel(12,38,6.4,k)+wheel(37,38,6.4,k);
      return g; },

    /* ---- DINO ERA: egg to brachiosaurus ---- */
    dino:function(s,C){ var A=C.a,B=C.b,G=C.c,k=C.ink; var g='';
      if(s===0) g+='<ellipse cx="24" cy="32" rx="8.5" ry="10.5" fill="#EFEBD4" stroke="'+k+'" stroke-width="1.2"/><path d="M17 32 q4 -3 7 0 q3 3 7 0" stroke="'+k+'" stroke-width=".8" fill="none" opacity=".45"/><circle cx="20" cy="27" r="1.6" fill="'+B+'" opacity=".55"/>';
      else if(s===1) g+='<ellipse cx="24" cy="38" rx="8.5" ry="6.5" fill="#EFEBD4" stroke="'+k+'" stroke-width="1"/><path d="M16 34 l4 3 l-3 3 l4 2" fill="none" stroke="'+k+'" stroke-width=".9"/><ellipse cx="26" cy="28" rx="5" ry="4.5" fill="'+A+'" stroke="'+k+'" stroke-width="1"/><circle cx="28" cy="27" r="1.2" fill="#fff"/>';
      else if(s===2) g+='<path d="M10 40 q4 -8 12 -8 q8 0 10 6 l4 -4 l-2 6 z" fill="'+A+'" stroke="'+k+'" stroke-width="1"/><circle cx="14" cy="33" r="1.2" fill="#fff"/><path d="M12 40 v3 M20 40 v3 M28 41 v2" stroke="'+k+'" stroke-width="1.4"/>';
      else if(s===3) g+='<path d="M8 40 q3 -6 9 -7 q5 -1 9 3 l8 -2 l-4 5 q2 5 -4 6 z" fill="'+A+'" stroke="'+k+'" stroke-width="1"/><path d="M31 34 l6 -3" stroke="'+k+'" stroke-width="1.6"/><circle cx="12" cy="35" r="1.3" fill="#fff"/><path d="M12 42 v3 M20 43 v3" stroke="'+k+'" stroke-width="1.6"/>';
      else if(s===4) g+='<path d="M8 42 q4 -10 14 -10 q10 0 14 8 l4 3 z" fill="'+A+'" stroke="'+k+'" stroke-width="1"/><path d="M14 32 l3 -6 l3 6 M20 31 l3 -7 l3 7 M26 32 l3 -6 l3 6" fill="'+G+'" stroke="'+k+'" stroke-width=".8"/><circle cx="11" cy="38" r="1.3" fill="#fff"/>';
      else if(s===5) g+='<path d="M9 42 q4 -11 15 -11 q11 0 14 9 l3 2 z" fill="'+A+'" stroke="'+k+'" stroke-width="1"/><path d="M13 34 q-2 -6 4 -7 q7 -1 8 6 z" fill="'+B+'" stroke="'+k+'" stroke-width="1"/><path d="M11 30 l-3 -4 M17 27 l0 -5 M23 29 l3 -4" stroke="'+k+'" stroke-width="1.4"/><circle cx="12" cy="34" r="1.2" fill="#fff"/>';
      else if(s===6) g+='<path d="M8 43 q5 -12 17 -12 q12 0 14 10 l3 2 z" fill="'+G+'" stroke="'+k+'" stroke-width="1"/><path d="M10 32 q6 -4 12 -1 M12 28 q6 -3 11 0" stroke="'+B+'" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="11" cy="38" r="1.3" fill="#fff"/>';
      else if(s===7) g+='<path d="M8 43 q4 -13 16 -13 q12 0 15 11 l4 2 z" fill="'+A+'" stroke="'+k+'" stroke-width="1"/><path d="M14 30 q3 -9 6 0 M20 29 q4 -11 7 0 M27 31 q3 -8 5 0" fill="'+G+'" stroke="'+k+'" stroke-width=".8"/><circle cx="11" cy="38" r="1.3" fill="#fff"/>';
      else if(s===8) g+='<path d="M6 44 q5 -16 19 -16 q13 0 16 13 l5 2 z" fill="'+G+'" stroke="'+k+'" stroke-width="1.1"/><path d="M9 32 q-3 -6 2 -9 q8 -4 12 4 q1 4 -3 6 z" fill="'+A+'" stroke="'+k+'" stroke-width="1"/><path d="M10 28 l2 3 l2 -3 l2 3 l2 -3 l2 3" fill="#fff"/><circle cx="12" cy="25" r="1.4" fill="#fff"/>';
      else g+='<path d="M6 46 q7 -18 22 -18 q14 0 16 15 l5 3 z" fill="'+A+'" stroke="'+k+'" stroke-width="1.1"/>'
        +'<path d="M24 30 q-2 -14 6 -20 q7 -5 9 1 q2 5 -4 7 q-6 2 -5 12 z" fill="'+A+'" stroke="'+k+'" stroke-width="1.1"/>'
        +'<ellipse cx="37" cy="10" rx="5" ry="3.6" fill="'+B+'" stroke="'+k+'" stroke-width="1"/><circle cx="39" cy="9" r="1.3" fill="#fff"/><circle cx="39.3" cy="9.3" r=".6" fill="'+k+'"/>'
        +'<path d="M11 44 v4 M20 46 v3 M30 45 v4" stroke="'+k+'" stroke-width="2" stroke-linecap="round"/>'
        +'<path d="M6 46 q-4 2 -5 6" stroke="'+A+'" stroke-width="3.4" fill="none" stroke-linecap="round"/>';
      return g; }
  };

  /* per-rung animation: same grammar as the built-in worlds */
  var AN = {
    godly:  [['ev-twinkle 1.4s ease-in-out infinite','50% 60%'],['ev-flame 1.2s ease-in-out infinite','50% 88%'],['ev-bob 2.6s ease-in-out infinite','50% 90%'],['ev-bob 2.4s ease-in-out infinite','50% 90%'],['ev-pulse 1.8s ease-in-out infinite','50% 40%'],['ev-pulse 1.6s ease-in-out infinite','50% 40%'],['ev-spin 14s linear infinite','50% 58%'],['ev-twinkle 1.6s ease-in-out infinite','50% 50%'],['ev-spin 11s linear infinite','50% 58%'],['ev-spin 9s linear infinite','50% 58%']],
    serpent:[['ev-wobble 2.4s ease-in-out infinite','50% 84%'],['ev-crawl 1.6s ease-in-out infinite','50% 70%'],['ev-crawl 1.3s ease-in-out infinite','50% 76%'],['ev-sway 2.2s ease-in-out infinite','50% 84%'],['ev-sway 2s ease-in-out infinite','50% 84%'],['ev-sway 1.8s ease-in-out infinite','50% 84%'],['ev-sway 1.7s ease-in-out infinite','50% 84%'],['ev-sway 1.6s ease-in-out infinite','50% 84%'],['ev-spin 18s linear infinite','50% 58%'],['ev-spin 15s linear infinite','50% 56%']],
    race:   [['ev-hop 1.1s ease-in-out infinite','50% 90%'],['ev-wobble 1.4s ease-in-out infinite','50% 88%'],['ev-wobble 1.2s ease-in-out infinite','50% 88%'],['ev-wobble 1s ease-in-out infinite','50% 88%'],['ev-wobble .9s ease-in-out infinite','50% 88%'],['ev-wobble .8s ease-in-out infinite','50% 88%'],['ev-wobble .7s ease-in-out infinite','50% 88%'],['ev-wobble .6s ease-in-out infinite','50% 88%'],['ev-wobble .55s ease-in-out infinite','50% 88%'],['ev-wobble .5s ease-in-out infinite','50% 88%']],
    dino:   [['ev-wobble 2.6s ease-in-out infinite','50% 84%'],['ev-wobble 1.8s ease-in-out infinite','50% 84%'],['ev-hop 1.3s ease-in-out infinite','50% 90%'],['ev-hop 1.1s ease-in-out infinite','50% 90%'],['ev-bob 2.4s ease-in-out infinite','50% 90%'],['ev-bob 2.2s ease-in-out infinite','50% 90%'],['ev-bob 2.4s ease-in-out infinite','50% 90%'],['ev-bob 2.2s ease-in-out infinite','50% 90%'],['ev-breathe 2.6s ease-in-out infinite','50% 70%'],['ev-breathe 3.2s ease-in-out infinite','50% 74%']]
  };
  window.SB_W4 = { emb:EMB, anim:AN, ids:W.map(function(w){ return w.id; }) };

  /* ---------- 3. cover-art motif kits ---------- */
  try{
    var K=window.SB_COVER_KIT;
    if(K){
      function sun(c){ return function(x,y,s){ var o='<circle cx="'+x+'" cy="'+y+'" r="'+(s*.5)+'" fill="'+c+'"/>';
        for(var i=0;i<8;i++){ var A=i*Math.PI/4; o+='<line x1="'+(x+Math.cos(A)*s*.7).toFixed(1)+'" y1="'+(y+Math.sin(A)*s*.7).toFixed(1)+'" x2="'+(x+Math.cos(A)*s*1.2).toFixed(1)+'" y2="'+(y+Math.sin(A)*s*1.2).toFixed(1)+'" stroke="'+c+'" stroke-width="1.4"/>'; }
        return o; }; }
      function leaf(c){ return function(x,y,s){ return '<path d="M'+x+' '+(y-s)+' q'+s+' '+s+' 0 '+(s*2)+' q-'+s+' -'+s+' 0 -'+(s*2)+'z" fill="'+c+'"/>'; }; }
      function chequer(c){ return function(x,y,s){ return '<g fill="'+c+'"><rect x="'+(x-s)+'" y="'+(y-s)+'" width="'+s+'" height="'+s+'"/><rect x="'+x+'" y="'+y+'" width="'+s+'" height="'+s+'"/></g>'; }; }
      function bone(c){ return function(x,y,s){ return '<g fill="'+c+'"><rect x="'+(x-s)+'" y="'+(y-s*.25)+'" width="'+(s*2)+'" height="'+(s*.5)+'" rx="'+(s*.25)+'"/><circle cx="'+(x-s)+'" cy="'+(y-s*.4)+'" r="'+(s*.34)+'"/><circle cx="'+(x-s)+'" cy="'+(y+s*.4)+'" r="'+(s*.34)+'"/><circle cx="'+(x+s)+'" cy="'+(y-s*.4)+'" r="'+(s*.34)+'"/><circle cx="'+(x+s)+'" cy="'+(y+s*.4)+'" r="'+(s*.34)+'"/></g>'; }; }
      /* motifs paint the 320x110 cover background */
      function pillars(k,db){ var c=db?k.p1:k.lt; var o='';
        for(var i=0;i<6;i++){ var x=18+i*58; o+='<rect x="'+x+'" y="24" width="16" height="86" fill="'+c+'" opacity=".26"/><rect x="'+(x-4)+'" y="18" width="24" height="7" rx="2" fill="'+c+'" opacity=".34"/>'; }
        o+='<path d="M0 0 L320 0 L320 16 L0 16 Z" fill="'+c+'" opacity=".2"/>'; return o; }
      function vines(k,db){ var c=db?k.p1:k.lt; var o='';
        for(var i=0;i<4;i++){ var y=14+i*30;
          o+='<path d="M-10 '+y+' q40 -14 80 0 q40 14 80 0 q40 -14 80 0 q40 14 80 0" fill="none" stroke="'+c+'" stroke-width="7" opacity=".22" stroke-linecap="round"/>'; }
        return o; }
      function trackm(k,db){ var c=db?k.p1:k.lt; var o='<rect x="0" y="46" width="320" height="30" fill="'+c+'" opacity=".2"/>';
        for(var i=0;i<12;i++){ o+='<rect x="'+(6+i*28)+'" y="59" width="16" height="4" rx="2" fill="'+c+'" opacity=".42"/>'; }
        for(var j=0;j<8;j++){ o+='<rect x="'+(j*40)+'" y="0" width="20" height="10" fill="'+c+'" opacity="'+(j%2?'.3':'.14')+'"/>'; }
        return o; }
      function ferns(k,db){ var c=db?k.p1:k.lt; var o='';
        for(var i=0;i<7;i++){ var x=12+i*48, h=30+((i*13)%26);
          o+='<path d="M'+x+' 110 q-4 -'+h+' 4 -'+(h+14)+' q8 '+14+' 4 '+(h+14)+'" fill="'+c+'" opacity=".24"/>'; }
        o+='<path d="M0 96 q60 -22 120 -4 q60 18 120 -8 q40 -16 80 -4 L320 110 L0 110 Z" fill="'+c+'" opacity=".2"/>';
        return o; }
      K.godly   = { L:'#FBF3DC', D:'#4A3A12', a:'#B8860B', p1:'#E0A82E', p2:'#F6DC8A', lt:'#F7ECCB', face:"'Fraunces',Georgia,serif", spark:sun('#F6DC8A'), motif:pillars };
      K.serpent = { L:'#EEF6EE', D:'#1E3B2A', a:'#2E7D52', p1:'#3FA86A', p2:'#8FD9A8', lt:'#DCEFE1', face:"'Fredoka',sans-serif", spark:leaf('#8FD9A8'), motif:vines };
      K.race    = { L:'#EEF3FA', D:'#0F1729', a:'#2456D6', p1:'#4A8CFF', p2:'#FFC83D', lt:'#DBE5F3', face:"'Bungee',sans-serif", spark:chequer('#FFC83D'), motif:trackm };
      K.dino    = { L:'#F3F2E4', D:'#33401A', a:'#5E7A2E', p1:'#6F9438', p2:'#A8C86A', lt:'#E6E7CE', face:"'Baloo 2',sans-serif", spark:bone('#A8C86A'), motif:ferns };
    }
  }catch(e){}

  /* ---------- 4. a signature sound per world, played when it is chosen ---------- */
  /* Built on the same WebAudio context the rest of the app uses. The serpent hiss is filtered
     white noise; the others are shaped tones. All respect the SFX setting. */
  window.SB_W4_SOUND=function(id){
    try{
      if(typeof state!=='undefined' && state.sound===false) return;
      var AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
      window._sbAC=window._sbAC||new AC(); var ac=window._sbAC; if(ac.state==='suspended') ac.resume();
      var t=ac.currentTime;
      var tone=function(f,at,dur,type,vol,slideTo){ var o=ac.createOscillator(), g=ac.createGain();
        o.type=type||'sine'; o.frequency.setValueAtTime(f,t+at);
        if(slideTo) o.frequency.exponentialRampToValueAtTime(slideTo,t+at+dur);
        g.gain.setValueAtTime(0.0001,t+at); g.gain.exponentialRampToValueAtTime(vol||0.14,t+at+0.02);
        g.gain.exponentialRampToValueAtTime(0.0001,t+at+dur);
        o.connect(g); g.connect(ac.destination); o.start(t+at); o.stop(t+at+dur+0.05); };
      if(id==='serpent'){                       // hisssss — band-passed noise, fading away
        var len=Math.floor(ac.sampleRate*0.9), buf=ac.createBuffer(1,len,ac.sampleRate), d=buf.getChannelData(0);
        for(var i=0;i<len;i++){ d[i]=(Math.random()*2-1)*Math.pow(1-i/len,1.4); }
        var src=ac.createBufferSource(); src.buffer=buf;
        var bp=ac.createBiquadFilter(); bp.type='bandpass'; bp.frequency.setValueAtTime(5200,t); bp.Q.value=1.1;
        bp.frequency.exponentialRampToValueAtTime(2600,t+0.9);
        var g2=ac.createGain(); g2.gain.setValueAtTime(0.16,t); g2.gain.exponentialRampToValueAtTime(0.0001,t+0.9);
        src.connect(bp); bp.connect(g2); g2.connect(ac.destination); src.start(t); src.stop(t+0.95);
      }
      else if(id==='race'){                     // three lights then a rev
        tone(700,0,0.10,'square',0.10); tone(700,0.22,0.10,'square',0.10); tone(1050,0.44,0.14,'square',0.12);
        tone(90,0.62,0.55,'sawtooth',0.13,320);
      }
      else if(id==='godly'){                    // a struck bell, open fifth above
        tone(523,0,1.5,'sine',0.13); tone(784,0.04,1.4,'sine',0.09); tone(1568,0.02,0.9,'sine',0.04);
      }
      else if(id==='dino'){                     // a low roar sliding down
        tone(150,0,0.75,'sawtooth',0.13,62); tone(220,0.05,0.6,'triangle',0.07,96);
      }
    }catch(e){}
  };

  /* ---------- 5. world hero banners ---------- */
  try{
    {                                     /* WORLD_HERO is a top-level const, not window.* */
      WORLD_HERO.godly={ face:"'Fraunces',Georgia,serif", tag:'ENTER THE ABODE', ink:'#FFF3D0',
        bg:"background:radial-gradient(120% 130% at 50% -10%,#C9962B 0%,#7A5410 55%,#3E2A08 100%)",
        art:'<svg viewBox="0 0 120 60" style="position:absolute;right:4px;top:2px;width:118px"><g opacity=".95"><circle cx="92" cy="24" r="11" fill="#FFF3D0"/><circle cx="92" cy="24" r="16" fill="none" stroke="#F6DC8A" stroke-width="1.4" opacity=".8"/>'
          +[0,1,2,3,4,5,6,7].map(function(i){ var A=i*Math.PI/4; return '<line x1="'+(92+Math.cos(A)*19).toFixed(1)+'" y1="'+(24+Math.sin(A)*19).toFixed(1)+'" x2="'+(92+Math.cos(A)*26).toFixed(1)+'" y2="'+(24+Math.sin(A)*26).toFixed(1)+'" stroke="#F6DC8A" stroke-width="1.6" opacity=".7"/>'; }).join('')
          +'<rect x="14" y="30" width="6" height="28" fill="#F6DC8A" opacity=".5"/><rect x="30" y="26" width="6" height="32" fill="#F6DC8A" opacity=".4"/><rect x="46" y="34" width="6" height="24" fill="#F6DC8A" opacity=".3"/></g></svg>' };
      WORLD_HERO.serpent={ face:"'Fredoka',system-ui,sans-serif", tag:'INTO THE LAIR', ink:'#DFF3E4',
        bg:"background:radial-gradient(130% 140% at 20% 0%,#2E7D52 0%,#17422C 58%,#0C2418 100%)",
        art:'<svg viewBox="0 0 120 60" style="position:absolute;right:0;top:0;width:120px"><path d="M120 44 q-18 -12 -34 0 q-16 12 -32 0 q-14 -10 -28 2" fill="none" stroke="#3FA86A" stroke-width="9" stroke-linecap="round" opacity=".85"/><path d="M120 44 q-18 -12 -34 0 q-16 12 -32 0 q-14 -10 -28 2" fill="none" stroke="#8FD9A8" stroke-width="2" stroke-linecap="round" opacity=".5"/><ellipse cx="24" cy="46" rx="9" ry="7" fill="#8FD9A8"/><circle cx="21" cy="44" r="1.8" fill="#FFE07A"/><circle cx="27" cy="44" r="1.8" fill="#FFE07A"/><path d="M20 51 l-1 4 l3 -2 l3 2 l-1 -4" fill="#E0453A"/><path d="M70 14 q4 -6 9 0" stroke="#8FD9A8" stroke-width="1.6" fill="none" opacity=".6"/></svg>' };
      WORLD_HERO.race={ face:"'Bungee',system-ui,sans-serif", tag:'LIGHTS OUT', ink:'#FFE6E2',
        bg:"background:linear-gradient(160deg,#E0453A 0%,#8E1C14 58%,#40100B 100%)",
        art:'<svg viewBox="0 0 120 60" style="position:absolute;right:0;top:0;width:120px"><g opacity=".92">'
          +[0,1,2,3,4,5].map(function(j){ return '<rect x="'+(j*20)+'" y="0" width="10" height="8" fill="#fff" opacity="'+(j%2?'.85':'.35')+'"/>'; }).join('')
          +'<rect x="0" y="40" width="120" height="14" fill="#2C3A55" opacity=".55"/>'
          +[0,1,2,3,4].map(function(j){ return '<rect x="'+(8+j*26)+'" y="46" width="14" height="3" rx="1.5" fill="#FFC83D" opacity=".9"/>'; }).join('')
          +'<circle cx="98" cy="20" r="4.5" fill="#FFC83D"/><circle cx="86" cy="20" r="4.5" fill="#FFC83D" opacity=".6"/><circle cx="74" cy="20" r="4.5" fill="#FFC83D" opacity=".3"/></g></svg>' };
      WORLD_HERO.dino={ face:"'Baloo 2',system-ui,sans-serif", tag:'THE LOST VALLEY', ink:'#EEF2DA',
        bg:"background:linear-gradient(165deg,#7F9B45 0%,#435A1F 55%,#22300E 100%)",
        art:'<svg viewBox="0 0 120 60" style="position:absolute;right:2px;top:0;width:120px"><g opacity=".95"><circle cx="20" cy="14" r="8" fill="#F6DC8A" opacity=".55"/>'
          +'<path d="M52 58 q10 -22 30 -22 q19 0 21 20 l7 2 z" fill="#3E5A1C"/>'
          +'<path d="M78 40 q-3 -19 8 -27 q10 -7 13 1 q3 7 -6 10 q-9 3 -7 16 z" fill="#3E5A1C"/>'
          +'<ellipse cx="100" cy="10" rx="7" ry="5" fill="#4E6E26"/><circle cx="103" cy="9" r="1.5" fill="#fff"/>'
          +'<path d="M52 58 q-8 2 -12 8" stroke="#3E5A1C" stroke-width="5" fill="none" stroke-linecap="round"/>'
          +'<path d="M4 60 q4 -16 8 -18 q5 2 8 18" fill="#2E4416" opacity=".8"/></g></svg>' };
    }
  }catch(e){}
})();

/* ============================ world music ============================
   A tiny generative engine — no audio files. Each world gets a key, a tempo, a voice and
   a walking pattern; a 250ms scheduler keeps ~0.7s of notes queued. Volume is low
   (background, not foreground), the toggle lives in the header, the choice persists, and
   the music STOPS on the focus screens and when the tab is hidden. */
(function(){
  var AC=null, master=null, timer=null, nextT=0, step=0, playingWorld=null;
  var enabled=(function(){ try{ return localStorage.getItem('sb_w4_music')!=='0'; }catch(e){ return true; } })();
  function midi(n){ return 440*Math.pow(2,(n-69)/12); }
  /* The ORIGINAL tunes — same keys, tempos, patterns and note density as the first engine —
     but every note now plays through a smooth voice: a detuned pair, rounded attack, singing
     release, per-note low-pass, and a light delay room on the master. Arcade stays crisp. */
  var CFG={
    spellbound:{r:64,sc:[0,2,4,7,9],bpm:104,w:'triangle',bw:'sine',g:.05,st:'walk'},
    marquee:{r:62,sc:[0,2,4,5,7,9,11],bpm:112,w:'triangle',bw:'triangle',g:.045,st:'swing'},
    aurora:{r:69,sc:[0,2,4,7,9,11],bpm:60,w:'sine',bw:'sine',g:.05,st:'ambient'},
    anime:{r:64,sc:[0,2,5,7,10],bpm:96,w:'triangle',bw:'sine',g:.04,st:'pluck'},
    science:{r:67,sc:[0,2,4,6,7,11],bpm:120,w:'triangle',bw:'sine',g:.035,st:'blip'},
    origami:{r:76,sc:[0,2,4,7,9],bpm:84,w:'triangle',bw:'sine',g:.045,st:'box'},
    pixel:{r:64,sc:[0,3,5,7,10],bpm:132,w:'square',bw:'square',g:.03,st:'chip'},
    avatar:{r:62,sc:[0,2,5,7,9],bpm:72,w:'sine',bw:'sine',g:.05,st:'ambient'},
    godly:{r:57,sc:[0,4,7,12],bpm:52,w:'sine',bw:'sine',g:.055,st:'bell'},
    serpent:{r:52,sc:[0,1,4,5,7,8],bpm:80,w:'sine',bw:'sine',g:.05,st:'walk'},
    race:{r:52,sc:[0,3,5,6,7,10],bpm:144,w:'sawtooth',bw:'sawtooth',g:.03,st:'drive'},
    dino:{r:45,sc:[0,3,5,7,10],bpm:66,w:'triangle',bw:'sine',g:.055,st:'drums'}
  };
  function ensureAC(){ var A=window.AudioContext||window.webkitAudioContext; if(!A) return false;
    if(!AC){ AC=new A();
      // Background music level. 1 originally, then 0.3, and now 40% of THAT — this is
      // the bed that plays on the world screens themselves, and it had only been cut
      // once while the saga bed had been cut twice, which is why the worlds stayed the
      // loud ones. SFX are on a separate context and unaffected.
      master=AC.createGain(); master.gain.value=0.12;
      var lp=AC.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=3800; lp.Q.value=.3;
      var dly=AC.createDelay(1); dly.delayTime.value=.29;
      var fb=AC.createGain(); fb.gain.value=.28; var wet=AC.createGain(); wet.gain.value=.2;
      master.connect(lp); lp.connect(AC.destination);
      lp.connect(dly); dly.connect(fb); fb.connect(dly); dly.connect(wet); wet.connect(AC.destination);
    }
    if(AC.state==='suspended') AC.resume(); return true; }
  function tone(f,at,dur,type,vol,slide){
    if(type==='square'){ /* Arcade keeps its edges */
      var o=AC.createOscillator(),q=AC.createGain(); o.type=type; o.frequency.setValueAtTime(f,at);
      if(slide) o.frequency.exponentialRampToValueAtTime(slide,at+dur);
      q.gain.setValueAtTime(0.0001,at); q.gain.exponentialRampToValueAtTime(vol,at+0.02);
      q.gain.exponentialRampToValueAtTime(0.0001,at+dur);
      o.connect(q); q.connect(master); o.start(at); o.stop(at+dur+0.05); return; }
    var rel=Math.max(.4,dur*.8), g=AC.createGain(), flt=AC.createBiquadFilter();
    flt.type='lowpass'; flt.frequency.value=2800; flt.Q.value=.4;
    g.gain.setValueAtTime(0.0001,at);
    g.gain.linearRampToValueAtTime(vol,at+Math.min(.05,dur*.3));
    g.gain.setValueAtTime(vol,at+dur*.55);
    g.gain.exponentialRampToValueAtTime(0.0001,at+dur+rel);
    [-4,4].forEach(function(d){ var osc=AC.createOscillator(); osc.type=type;
      osc.frequency.setValueAtTime(f,at); osc.detune.value=d;
      if(slide) osc.frequency.exponentialRampToValueAtTime(slide,at+dur);
      osc.connect(flt); osc.start(at); osc.stop(at+dur+rel+.05); });
    flt.connect(g); g.connect(master); }
  var walkPos=2;
  function scheduleStep(c,t,i){
    var beat=60/c.bpm, deg;
    if(c.st==='bell'){ if(i%8===0){ tone(midi(c.r),t,beat*6,'sine',c.g); tone(midi(c.r+7),t+.05,beat*5,'sine',c.g*.6); tone(midi(c.r+12),t+.1,beat*4,'sine',c.g*.35); } return; }
    if(c.st==='drums'){ if(i%4===0) tone(60,t,.3,'sine',c.g*1.4,40);
      if(i%8===4) tone(48,t,.4,'sine',c.g*1.2,36);
      if(i%2===0&&Math.random()<.3) tone(midi(c.r+12+c.sc[(Math.random()*c.sc.length)|0]),t,beat*.8,'triangle',c.g*.5); return; }
    if(c.st==='ambient'){ if(i%16===0){ deg=c.sc[(Math.random()*c.sc.length)|0];
        tone(midi(c.r+deg),t,beat*14,'sine',c.g*.7); tone(midi(c.r+deg+7),t+.3,beat*12,'sine',c.g*.4); }
      if(i%4===2&&Math.random()<.5) tone(midi(c.r+12+c.sc[(Math.random()*c.sc.length)|0]),t,beat*1.6,'sine',c.g*.5); return; }
    if(i%4===0) tone(midi(c.r-12),t,beat*(c.st==='drive'?.4:.9),c.bw,c.g*.8);
    if(c.st==='drive'&&i%2===1) tone(midi(c.r-12+((i%8===5)?3:0)),t,beat*.3,c.bw,c.g*.55);
    var play=(c.st==='box'||c.st==='pluck')?(i%2===0&&Math.random()<.75):(Math.random()<.85);
    if(play&&i%2===0){ walkPos+=(Math.random()<.5?-1:1); if(Math.random()<.15) walkPos+=(Math.random()<.5?-2:2);
      walkPos=Math.max(0,Math.min(c.sc.length*2-1,walkPos));
      deg=c.sc[walkPos%c.sc.length]+12*Math.floor(walkPos/c.sc.length);
      var dur=beat*(c.st==='blip'||c.st==='chip'?.35:(c.st==='swing'?.5:.9));
      tone(midi(c.r+deg),t,dur,c.w,c.g);
      if(c.st==='swing'&&Math.random()<.4) tone(midi(c.r+deg+4),t+beat*.66,dur*.6,c.w,c.g*.6); }
  }
  function loop(){ if(!AC||!playingWorld) return; var c=CFG[playingWorld]; if(!c) return;
    var sub=(60/c.bpm)/2;
    while(nextT<AC.currentTime+0.7){ scheduleStep(c,Math.max(nextT,AC.currentTime+.02),step); step++; nextT+=sub; } }
  function start(world){ if(!CFG[world]||!ensureAC()) return;
    if(playingWorld===world&&timer) return;
    stop(); playingWorld=world; step=0; walkPos=2; nextT=AC.currentTime+0.1;
    timer=setInterval(loop,250); }
  function stop(){ if(timer){ clearInterval(timer); timer=null; } playingWorld=null; }
  window.SB_W4_MUSIC={
    on:function(){ return enabled; },
    playing:function(){ return !!playingWorld; },
    toggle:function(){ enabled=!enabled; try{ localStorage.setItem('sb_w4_music',enabled?'1':'0'); }catch(e){}
      if(!enabled) stop(); else window.SB_W4_MUSIC.sync(); return enabled; },
    sync:function(){ try{
      var calm=document.documentElement.classList.contains('w4-calm');
      var hidden=(typeof document!=='undefined'&&document.visibilityState!=='visible');
      var w=(typeof state!=='undefined'&&state&&state.screen==='app')?state.theme:null;
      var muted=(typeof state!=='undefined'&&state&&state.sound===false);
      /* a world with no authored tune hums the house one — a pill that says ON
         while a themeless world stays silent reads as "music didn't work" */
      if(w&&!CFG[w]) w='spellbound';
      if(!enabled||calm||hidden||muted||!w){ stop(); return; }
      start(w); }catch(e){} }
  };
  document.addEventListener('visibilitychange',function(){ try{ window.SB_W4_MUSIC.sync(); }catch(e){} });
  var armed=false;
  document.addEventListener('pointerdown',function(){ if(armed) return; armed=true;
    setTimeout(function(){ try{ window.SB_W4_MUSIC.sync(); }catch(e){} },200); },{capture:true});
})();

/* Focus: one header switch that quiets the whole app — music silenced and the world
   backdrop held as a faint still — on every screen, not just Practice/Supercharge.
   It rides the same w4-calm rail those screens use, so one contract rules both. */
window.SB_W4_FOCUS={
  on:function(){ try{ return localStorage.getItem('sb_w4_focus')==='1'; }catch(e){ return false; } },
  toggle:function(){ var v=!window.SB_W4_FOCUS.on();
    try{ localStorage.setItem('sb_w4_focus', v?'1':'0'); }catch(e){}
    try{ if(window.SB_W4_SYNC) SB_W4_SYNC(); }catch(e){}
    return v; }
};


/* ============================ the living backdrop + race chrome ============================
   Mounted as a sibling of #root so a re-render never wipes it, and lifted behind #root by the
   .w4-on class. Rebuilt only when the world actually changes. */
(function(){
  var CUR=null, layer=null;
  function el(cls,style,html){ var d=document.createElement('div'); d.className=cls||'';
    if(style) d.style.cssText=style; if(html!=null) d.innerHTML=html; return d; }
  function rnd(a,b){ return a+Math.random()*(b-a); }

  var SNAKE='<svg viewBox="0 0 200 60" width="100%" height="100%"><path d="M0 40 q25 -22 50 0 q25 22 50 0 q25 -22 50 0 q25 22 50 0" fill="none" stroke="#2E7D52" stroke-width="13" stroke-linecap="round"/><path d="M0 40 q25 -22 50 0 q25 22 50 0 q25 -22 50 0 q25 22 50 0" fill="none" stroke="#8FD9A8" stroke-width="3" stroke-linecap="round" opacity=".45"/><ellipse cx="196" cy="40" rx="13" ry="10" fill="#3FA86A"/><circle cx="193" cy="37" r="2.2" fill="#FFE07A"/><circle cx="199" cy="37" r="2.2" fill="#FFE07A"/><path d="M196 49 l0 6 l-4 3 M196 55 l4 3" stroke="#E0453A" stroke-width="1.6" fill="none"/></svg>';
  var BUG='<svg viewBox="0 0 30 30" width="100%" height="100%"><ellipse cx="15" cy="17" rx="8" ry="9" fill="#2E7D52"/><circle cx="15" cy="8" r="4.5" fill="#3FA86A"/><path d="M7 12 l-6 -4 M23 12 l6 -4 M6 18 h-6 M24 18 h6 M8 24 l-5 5 M22 24 l5 5" stroke="#1E5B39" stroke-width="1.8" stroke-linecap="round"/><circle cx="13" cy="7" r="1.2" fill="#FFE07A"/><circle cx="17" cy="7" r="1.2" fill="#FFE07A"/></svg>';
  function carSVG(c){ return '<svg viewBox="0 0 120 46" width="100%" height="100%"><path d="M4 32 h110 l-8 -12 l-26 -3 l-14 -9 h-34 z" fill="'+c+'"/><path d="M60 12 h14 l9 8 h-23 z" fill="#BFE3F5" opacity=".85"/><circle cx="30" cy="34" r="9" fill="#2C3A55"/><circle cx="30" cy="34" r="3.6" fill="#D8DEE9"/><circle cx="92" cy="34" r="9" fill="#2C3A55"/><circle cx="92" cy="34" r="3.6" fill="#D8DEE9"/><path d="M0 22 h-10 M0 27 h-14" stroke="#FFC83D" stroke-width="2.4" stroke-linecap="round"/></svg>'; }
  /* The brachiosaurus is the world's monument: a two-tone body with a lit back, a neck that
     sweeps as it grazes, and a slow tail. Painted big and left standing (no walk) — a
     mountain does not commute. */
  /* the brachiosaur, properly built: countershaded barrel body, columnar legs with
     toenails, a scalloped back ridge, skin folds and mottling, the grazing neck kept
     on its original hinge so the sweep animation carries over untouched */
  var BRACHIO='<svg viewBox="0 0 300 210" width="100%" height="100%" style="overflow:visible">'
    +'<defs><linearGradient id="bqB" x1="0" y1="0" x2="0" y2="1">'
    +'<stop offset="0" stop-color="#57732C"/><stop offset=".5" stop-color="#3E5A1C"/><stop offset="1" stop-color="#243611"/></linearGradient>'
    +'<linearGradient id="bqN" x1="0" y1="0" x2="1" y2="0">'
    +'<stop offset="0" stop-color="#4E6E26"/><stop offset="1" stop-color="#324A16"/></linearGradient></defs>'
    +'<ellipse cx="130" cy="204" rx="112" ry="6" fill="#101A08" opacity=".3"/>'
    +'<path d="M62 148 l20 4 -3 52 h-14 q-5 0 -5 -6 z" fill="#22350F"/>'
    +'<path d="M152 150 l20 2 -2 52 h-14 q-5 0 -5 -6 z" fill="#22350F"/>'
    +'<path d="M66 134 Q30 148 8 172 Q-6 188 2 202 Q10 188 30 178 Q58 164 80 158 q10 -14 -14 -24z" fill="url(#bqB)"/>'
    +'<path d="M52 176 q-14 -56 40 -74 q54 -18 104 2 q28 12 28 44 q0 22 -20 30 q-56 16 -120 10 q-26 -3 -32 -12z" fill="url(#bqB)"/>'
    +'<path d="M96 102 q8 -8 16 0 q8 -8 16 0 q8 -8 16 0 q8 -8 16 0 q8 -8 16 0 q8 -8 16 0" stroke="#2A3F12" stroke-width="4.6" fill="none" stroke-linecap="round" opacity=".65"/>'
    +'<path d="M64 172 q64 18 142 4" stroke="#8FA35C" stroke-width="7" fill="none" stroke-linecap="round" opacity=".3"/>'
    +'<path d="M98 118 q10 26 6 48 M134 112 q8 30 4 56" stroke="#22350F" stroke-width="3" fill="none" opacity=".4" stroke-linecap="round"/>'
    +'<g fill="#2A3F12" opacity=".5"><ellipse cx="120" cy="130" rx="9" ry="6"/><ellipse cx="160" cy="122" rx="7" ry="5"/><ellipse cx="188" cy="136" rx="8" ry="5.4"/><ellipse cx="100" cy="152" rx="6" ry="4.4"/></g>'
    +'<path d="M76 152 q16 -4 28 2 l-2 44 q0 8 -8 8 h-12 q-7 0 -7 -8 z" fill="url(#bqN)"/>'
    +'<path d="M172 154 q16 -4 28 2 l-2 42 q0 8 -8 8 h-12 q-7 0 -7 -8 z" fill="url(#bqN)"/>'
    +'<g fill="#E3DBB4"><path d="M78 206 l5 -7 5 7z"/><path d="M90 206 l5 -7 5 7z"/><path d="M174 206 l5 -7 5 7z"/><path d="M186 206 l5 -7 5 7z"/></g>'
    +'<g style="transform-box:fill-box;transform-origin:20% 96%;animation:w4-graze 9s ease-in-out infinite">'
    +'<path d="M176 136 Q166 62 216 20 Q232 6 250 13 Q262 19 256 33 Q250 43 236 40 Q214 50 210 96 Q208 120 216 138 z" fill="url(#bqN)"/>'
    +'<path d="M184 126 Q176 64 222 24" stroke="#2A3F12" stroke-width="4" fill="none" opacity=".5" stroke-linecap="round"/>'
    +'<path d="M214 104 Q211 70 234 40" stroke="#8FA35C" stroke-width="4" fill="none" opacity=".22" stroke-linecap="round"/>'
    +'<path d="M233 35 q-6 -17 9 -25 q14 -7 25 1 q9 7 4 15 q-6 10 -19 10 q-13 1 -19 -1z" fill="#4E6E26"/>'
    +'<path d="M241 12 q8 -8 15 -2 q5 5 0 9 q-8 -5 -15 -7z" fill="#57732C"/>'
    +'<circle cx="253" cy="15.6" r="1.5" fill="#20300D"/>'
    +'<circle cx="252" cy="25" r="3.6" fill="#F6ECC8"/><circle cx="253" cy="25.6" r="1.9" fill="#20260F"/><circle cx="253.8" cy="24.6" r=".7" fill="#FFFDF2"/>'
    +'<path d="M252 34 q8 2 13 -2" stroke="#20300D" stroke-width="2" fill="none" stroke-linecap="round"/>'
    +'</g></svg>';
  /* the raptor rebuilt: countershaded fusiform body, banded stiff tail, folded arm,
     sickle-clawed feet, and a real head — brow ridge, slit-pupil eye, open toothed jaw.
     Same skeleton for the animator: g.rap bobs, legA/legB kick from their hips. */
  var RAPTOR='<svg viewBox="0 0 170 80" width="100%" height="100%" style="overflow:visible">'
    +'<defs><linearGradient id="rpB" x1="0" y1="0" x2="0" y2="1">'
    +'<stop offset="0" stop-color="#4E6E26"/><stop offset=".6" stop-color="#3E5A1C"/><stop offset="1" stop-color="#2A3F12"/></linearGradient></defs>'
    +'<g class="rap">'
    +'<path d="M2 30 Q30 24 56 30 L72 36 Q62 42 42 42 Q18 42 2 35 z" fill="url(#rpB)"/>'
    +'<path d="M14 31 l2 8 M28 30 l2 9.4 M42 31 l1.6 9.4 M56 33 l1.4 8" stroke="#243611" stroke-width="2.8" stroke-linecap="round" opacity=".7"/>'
    +'<g class="legB"><path d="M52 38 q13 -2 16 9 q2 9 -7 12 q-9 3 -12 -5 q-3 -10 3 -16z" fill="#243611"/>'
    +'<path d="M60 56 l-3 11 q-1 4 3 5.4 l9 2 -1 3 -11 -1.4 q-5 -3 -3.6 -9 l2 -12z" fill="#1E2E0C"/>'
    +'<path d="M64 72 q-1 -6 4.6 -8 q-3.6 5.4 -1 8z" fill="#B8B294"/></g>'
    +'<path d="M50 28 Q68 17 90 21 Q104 24 110 19 L118 10 L123 15 Q117 30 106 37 Q92 47 73 45 Q55 43 48 35 z" fill="url(#rpB)"/>'
    +'<path d="M66 23 l-2.4 10 M78 21 l-2.4 11 M90 22 l-2.4 10.4 M100 24 l-2 8" stroke="#243611" stroke-width="3" stroke-linecap="round" opacity=".65"/>'
    +'<path d="M58 40 Q78 49 100 37" stroke="#9AAD62" stroke-width="4.6" fill="none" stroke-linecap="round" opacity=".45"/>'
    +'<path d="M92 28 q7 7 3 13 l7 4 -2.6 2.6 -9 -4 q-4 -8 -2 -15z" fill="#2A3F12"/>'
    +'<path d="M97 43 l4 3 M99 41.4 l4.6 2.4" stroke="#B8B294" stroke-width="1.6" stroke-linecap="round"/>'
    +'<g class="legA"><path d="M72 36 q16 -2 19 11 q2 10 -8 14 q-10 3 -14 -6 q-3 -12 3 -19z" fill="url(#rpB)"/>'
    +'<path d="M82 58 l-3 12 q-1 4 3.4 5.4 l10 2.2 -1 3.2 -12.4 -1.6 q-5.6 -3 -4 -9.6 l2.4 -13z" fill="#2A3F12"/>'
    +'<path d="M87 75 q-1.2 -7 5.4 -9 q-4.2 6 -1.2 9z" fill="#D8D2B4"/></g>'
    +'<path d="M102 30 Q111 25 114 14 L122 17 Q118 29 109 36z" fill="#4E6E26"/>'
    +'<path d="M111 21 Q111 7 124 4.6 L152 8 Q156 9 155 12 L129 14 Q122 15 119 21 z" fill="#4E6E26"/>'
    +'<path d="M111 15 L127 10.6 L128 14 L112 18z" fill="#243611" opacity=".5"/>'
    +'<path d="M119 23 L145 20 L140 26 L122 28 Q118 27 118 24 z" fill="#3E5A1C"/>'
    +'<g fill="#EFE9CE"><path d="M131 14 l1.8 3.6 1.8 -3.4z"/><path d="M137 13.4 l1.8 3.6 1.8 -3.4z"/><path d="M143 12.8 l1.8 3.4 1.8 -3.2z"/><path d="M132 20.6 l1.6 -3 1.6 3.2z"/><path d="M138 20 l1.6 -3 1.6 3.2z"/></g>'
    +'<path d="M113 8.6 l8 -1.6" stroke="#243611" stroke-width="2.2" stroke-linecap="round"/>'
    +'<circle cx="119" cy="12" r="2.7" fill="#F0C441"/><rect x="118.3" y="9.8" width="1.4" height="4.4" rx=".7" fill="#1A230C"/>'
    +'<circle cx="150" cy="9.6" r="1" fill="#1A230C"/>'
    +'</g></svg>';
  /* a tall conifer: layered triangular boughs on a bare trunk, Jurassic scale */
  function TREE(h){ return '<svg viewBox="0 0 90 '+h+'" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">'
    +'<rect x="41" y="'+(h-46)+'" width="8" height="46" rx="3" fill="#3A2E18"/>'
    +[0,1,2,3,4,5].map(function(i){ var w=76-i*11, y=h-52-i*26;
      return '<path d="M'+(45-w/2)+' '+y+' L45 '+(y-30)+' L'+(45+w/2)+' '+y+' q-'+(w/2)+' 8 -'+w+' 0z" fill="'+(i%2?'#2E4416':'#3E5A1C')+'"/>'; }).join('')
    +'<path d="M45 '+(h-52-6*26)+' L45 '+(h-52-6*26-18)+'" stroke="#3E5A1C" stroke-width="5" stroke-linecap="round"/></svg>'; }
  var PTERO='<svg viewBox="0 0 180 90" width="100%" height="100%" style="overflow:visible">'
    +'<path class="wingL" d="M82 46 Q52 16 8 24 Q42 40 80 56 z" fill="#33481B"/>'
    +'<path class="wingR" d="M98 46 Q128 16 172 24 Q138 40 100 56 z" fill="#33481B"/>'
    +'<path d="M76 44 Q90 38 104 44 L120 38 L138 30 L118 32 L104 36 Q90 32 76 40 L58 52 L74 50 z" fill="#3E5A1C"/>'
    +'<path d="M120 38 L134 24 L126 36 z" fill="#4E6E26"/>'
    +'<circle cx="112" cy="38" r="1.6" fill="#EEF2DA"/></svg>';
  /* one base, seven curved blades fanning out — drawn as stroked arcs so nothing can blob */
  var FERN=(function(){ var o='<svg viewBox="0 0 120 160" width="100%" height="100%"><g fill="none" stroke="#3E5A1C" stroke-linecap="round">';
    var ang=[-62,-42,-22,0,22,42,62];
    ang.forEach(function(a){ var r=a*Math.PI/180;
      var tipx=(60+Math.sin(r)*54).toFixed(1), tipy=(160-Math.cos(r)*132).toFixed(1);
      var cx=(60+Math.sin(r)*18).toFixed(1), cy=(160-Math.cos(r)*84).toFixed(1);
      o+='<path d="M60 158 Q'+cx+' '+cy+' '+tipx+' '+tipy+'" stroke-width="7"/>';
      for(var i=1;i<=5;i++){ var t=i/6;
        var px=(60+(tipx-60)*t*1.05).toFixed(1), py=(158+(tipy-158)*t).toFixed(1);
        o+='<path d="M'+px+' '+py+' l'+(a<0?-9:9)+' -6" stroke-width="3.4" opacity=".8"/>'; }
    });
    return o+'</g></svg>'; })();

  /* ---- props for the original eight (small, silhouette-grade) ---- */
  var BEE_S='<svg viewBox="0 0 40 30" width="100%" height="100%"><ellipse cx="20" cy="18" rx="11" ry="8.5" fill="#FFC23D"/><rect x="14" y="14" width="12" height="2.6" rx="1.3" fill="#3A2A8C"/><rect x="14" y="19" width="12" height="2.6" rx="1.3" fill="#3A2A8C"/><ellipse cx="13" cy="8" rx="5" ry="7" fill="#EDE7FF" opacity=".9" transform="rotate(-24 13 8)"/><ellipse cx="27" cy="8" rx="5" ry="7" fill="#EDE7FF" opacity=".9" transform="rotate(24 27 8)"/><circle cx="26" cy="16" r="1.7" fill="#2B1B5E"/></svg>';
  /* ---- Starry Night props: the swirl, the cypress, the moon, the hills ---- */
  function VG_STROKES(paths){ return paths.map(function(pr){
    return '<path d="'+pr[0]+'" fill="none" stroke="'+pr[1]+'" stroke-width="'+pr[2]+'" stroke-linecap="round" opacity="'+pr[3]+'"/>'; }).join(''); }
  var VG_SWIRL='<svg viewBox="0 0 340 170" width="100%" height="100%">'
    +VG_STROKES([
      ['M8 96 C 60 30 142 16 198 44 C 244 66 248 108 212 122 C 180 134 150 116 153 88 C 156 64 182 56 198 70 C 210 80 206 98 190 100','#3D5490',13,'.9'],
      ['M8 96 C 60 30 142 16 198 44 C 244 66 248 108 212 122 C 180 134 150 116 153 88 C 156 64 182 56 198 70 C 210 80 206 98 190 100','#6C8FD4',7,'.9'],
      ['M12 88 C 64 26 140 12 196 38 C 238 58 242 100 210 114','#9FB8E8',3.4,'.85'],
      ['M198 44 C 252 18 306 26 334 54','#3D5490',11,'.8'],
      ['M198 44 C 252 18 306 26 334 54','#6C8FD4',5.5,'.85'],
      ['M202 40 C 254 14 304 22 330 48','#DFE9F8',2.6,'.7'],
      ['M40 118 C 80 96 120 100 150 118','#6C8FD4',6,'.5'],
      ['M40 118 C 80 96 120 100 150 118','#9FB8E8',2.8,'.55']])
    +'</svg>';
  var VG_CYPRESS='<svg viewBox="0 0 90 240" width="100%" height="100%">'
    +'<path d="M45 238 C30 200 34 170 26 140 C18 108 30 78 38 54 C42 40 40 20 45 4 C50 20 48 40 52 54 C60 78 72 108 64 140 C56 170 60 200 45 238 z" fill="#0F1D14"/>'
    +'<path d="M45 220 C36 190 40 160 34 132 M45 210 C52 184 50 150 56 124 M45 60 C42 44 43 26 45 12" stroke="#1C3324" stroke-width="3" fill="none" opacity=".8"/>'
    +'</svg>';
  var VG_MOON='<svg viewBox="0 0 120 120" width="100%" height="100%">'
    +'<circle cx="66" cy="56" r="50" fill="#F5D76E" opacity=".10"/><circle cx="66" cy="56" r="38" fill="#F5D76E" opacity=".16"/>'
    +'<circle cx="66" cy="56" r="27" fill="#F5D76E" opacity=".3"/>'
    +'<path d="M78 30 A30 30 0 1 0 78 82 A23 23 0 1 1 78 30 z" fill="#F0C94A"/>'
    +'<path d="M60 36 A24 24 0 0 0 58 74" stroke="#E8A33D" stroke-width="3" fill="none" opacity=".7"/>'
    +'</svg>';
  var VG_HILLS='<svg viewBox="0 0 320 60" width="100%" height="100%" preserveAspectRatio="none">'
    +'<path d="M0 60 L0 38 C 40 22 70 34 110 26 C 150 18 190 34 230 28 C 270 22 300 32 320 26 L320 60 z" fill="#17223C"/>'
    +'<path d="M0 44 C 60 30 120 40 180 32 C 240 24 290 36 320 30" stroke="#2C4066" stroke-width="3" fill="none" opacity=".7"/>'
    +'</svg>';
  /* a family of planets: body + polar highlight, optional ring, optional cloud bands */
  function PLANET2(body,lite,ring,bands){
    var o='<svg viewBox="0 0 60 44" width="100%" height="100%">';
    if(ring) o+='<ellipse cx="30" cy="23" rx="27" ry="7.5" fill="none" stroke="'+ring+'" stroke-width="2.6" opacity=".55" transform="rotate(-14 30 23)"/>';
    o+='<circle cx="30" cy="22" r="14" fill="'+body+'"/><circle cx="25" cy="17" r="4.5" fill="'+lite+'" opacity=".9"/>';
    if(bands) o+='<path d="M17 19 q13 -4 26 0 M16 25 q14 4 28 0" stroke="'+bands+'" stroke-width="2.2" fill="none" opacity=".7" clip-path="circle(14px at 30px 22px)"/>';
    if(ring) o+='<path d="M4.6 29.4 A27 7.5 -14 0 0 55.4 16.6" fill="none" stroke="'+ring+'" stroke-width="2.6" opacity=".9" transform="rotate(0)"/>';
    return o+'</svg>'; }
  var PLANET=PLANET2('#7D8CF0','#A9B4F7','#A9B4F7',null);
  var PETAL='<svg viewBox="0 0 20 20" width="100%" height="100%"><path d="M10 1 q7 5 5 12 q-2 6 -5 6 q-3 0 -5 -6 q-2 -7 5 -12z" fill="#F3B2C0"/></svg>';
  var TORII='<svg viewBox="0 0 160 110" width="100%" height="100%"><g fill="#8E2C44" opacity=".9"><path d="M6 18 q74 -14 148 0 l-4 12 h-140 z"/><rect x="24" y="30" width="112" height="8" rx="3"/><rect x="34" y="30" width="12" height="80"/><rect x="114" y="30" width="12" height="80"/></g></svg>';
  /* a beaker of coloured liquid, fizzing */
  function BEAKER(c,lv){ lv=lv||34;
    return '<svg viewBox="0 0 60 74" width="100%" height="100%">'
      +'<path d="M14 4 h32 M18 4 v50 q0 14 12 14 q12 0 12 -14 v-50" fill="none" stroke="#5E7A8A" stroke-width="3" stroke-linecap="round"/>'
      +'<path d="M19 '+(68-lv)+' h22 v'+(lv-14)+' q0 12 -11 12 q-11 0 -11 -12 z" fill="'+c+'" opacity=".8" transform="translate(1 0)"/>'
      +'<ellipse cx="31" cy="'+(68-lv)+'" rx="11" ry="2.6" fill="#fff" opacity=".35"/>'
      +'<g class="fizz" fill="'+c+'"><circle cx="26" cy="'+(64-lv)+'" r="2.2"/><circle cx="34" cy="'+(66-lv)+'" r="1.7"/><circle cx="30" cy="'+(62-lv)+'" r="1.4"/></g>'
      +'</svg>'; }
  /* the pouring rig: a tilted flask streaming into a catch beaker, reaction bubbles at
     the join. The tilt is NEGATIVE: rotate(+38) swung the flask the other way, so its
     MOUTH pointed up-right while the stream left from beside its base — "the beaker is
     pouring chemicals from its bottom" (Amrita). Mouth down-left, stream from the lip. */
  var POUR='<svg viewBox="0 0 150 150" width="100%" height="100%">'
    +'<g transform="rotate(-38 96 30)"><path d="M88 6 h16 v14 l10 24 q2 7 -5 7 h-26 q-7 0 -5 -7 l10 -24 z" fill="none" stroke="#0E8A78" stroke-width="3"/>'
    +'<path d="M84 38 h24 l3 7 q1 5 -4 5 h-22 q-5 0 -4 -5 z" fill="#B14FC4" opacity=".75"/></g>'
    +'<path class="stream" d="M80 16 q-4 40 -7 80" stroke="#B14FC4" stroke-width="3.4" fill="none" stroke-linecap="round"/>'
    +'<path d="M52 96 h44 M56 96 v28 q0 12 16 12 q16 0 16 -12 v-28" fill="none" stroke="#5E7A8A" stroke-width="3" stroke-linecap="round"/>'
    +'<path d="M58 112 h28 v12 q0 10 -14 10 q-14 0 -14 -10 z" fill="#3BC0AA" opacity=".8" transform="translate(1 0)"/>'
    +'<g class="fizz" fill="#B14FC4"><circle cx="68" cy="108" r="2.4"/><circle cx="78" cy="104" r="1.8"/><circle cx="73" cy="100" r="1.5"/></g>'
    +'</svg>';
  var REACT='<svg viewBox="0 0 60 60" width="100%" height="100%"><path d="M30 4 l6 14 l15 2 l-11 11 l3 15 l-13 -8 l-13 8 l3 -15 L9 20 l15 -2 z" fill="#F0A93C" opacity=".85"/><circle cx="30" cy="30" r="7" fill="#FFE07A"/></svg>';
  var FLASK='<svg viewBox="0 0 60 70" width="100%" height="100%"><path d="M24 4 h12 v20 l14 34 q3 8 -6 8 h-28 q-9 0 -6 -8 l14 -34 z" fill="none" stroke="#3BC0AA" stroke-width="3"/><path d="M17 48 h26 l5 12 q2 6 -4 6 h-28 q-6 0 -4 -6 z" fill="#3BC0AA" opacity=".55"/></svg>';
  var PLANE='<svg viewBox="0 0 60 34" width="100%" height="100%"><path d="M2 20 L58 2 L34 32 L26 22 z" fill="#F0C9A2"/><path d="M26 22 L58 2 L30 18 z" fill="#E88A5C"/></svg>';
  var CRANE='<svg viewBox="0 0 70 56" width="100%" height="100%"><path d="M8 44 L30 20 L40 34 L64 40 L40 44 L30 52 z" fill="#E88A5C"/><path d="M30 20 L36 4 L42 22 z" fill="#F0C9A2"/><path d="M30 20 L40 34 L40 44 L30 52 z" fill="#C25A2E"/></svg>';
  /* classic tetrominoes: bevelled cells, authentic colours */
  function TET(shape){
    var SH={ I:[[0,0],[1,0],[2,0],[3,0],'#36C6E0'], O:[[0,0],[1,0],[0,1],[1,1],'#FFD34D'],
             T:[[0,0],[1,0],[2,0],[1,1],'#B14FC4'], L:[[0,0],[0,1],[0,2],[1,2],'#F0A93C'],
             S:[[1,0],[2,0],[0,1],[1,1],'#2FD08C'], Z:[[0,0],[1,0],[1,1],[2,1],'#E0453A'],
             J:[[1,0],[1,1],[1,2],[0,2],'#3B6FE0'] };
    var d=SH[shape]||SH.O, col=d[4], C=18, o='';
    for(var i=0;i<4;i++){ var x=d[i][0]*C, y=d[i][1]*C;
      o+='<rect x="'+x+'" y="'+y+'" width="'+C+'" height="'+C+'" fill="'+col+'" stroke="#1A2438" stroke-width="2"/>'
        +'<rect x="'+(x+3)+'" y="'+(y+3)+'" width="5" height="5" fill="#fff" opacity=".55"/>'; }
    return '<svg viewBox="0 0 72 54" width="100%" height="100%" style="overflow:visible">'+o+'</svg>'; }
  /* the settled stack along the floor, mid-game, gaps and all */
  var TSTACK=(function(){ var cols=['#36C6E0','#FFD34D','#B14FC4','#F0A93C','#2FD08C','#E0453A','#3B6FE0'];
    var o='<svg viewBox="0 0 340 54" width="100%" height="100%" preserveAspectRatio="none">';
    var map=[[0,2,1,1,3,0,5,2,2,6,0,4,4,1,0,3,3,0,5],[2,2,0,4,3,3,0,1,1,6,6,0,4,5,5,0,3,2,0]];
    for(var r=0;r<2;r++) for(var c=0;c<19;c++){ var v=map[r][c]; if(!v&&v!==0) continue; if(map[r][c]===0) continue;
      o+='<rect x="'+(c*18)+'" y="'+(r*18+18)+'" width="18" height="18" fill="'+cols[map[r][c]%7]+'" stroke="#1A2438" stroke-width="2"/>'; }
    return o+'</svg>'; })();
  /* the 8-bit hero bouncing through the level — our own pixel bee, cape and all */
  var PIXBEE=(function(){ var px=6, o='', P=function(x,y,c){ o+='<rect x="'+(x*px)+'" y="'+(y*px)+'" width="'+px+'" height="'+px+'" fill="'+c+'"/>'; };
    var Y='#FFC23D', D='#3A2A8C', W='#EDE7FF', K='#2B1B5E', R='#FF7FBE';
    P(3,0,K);P(8,0,K); P(4,1,K);P(7,1,K);
    P(1,2,W);P(2,2,W);P(9,2,W);P(10,2,W);
    P(0,3,W);P(1,3,W);P(2,3,W);P(9,3,W);P(10,3,W);P(11,3,W);
    for(var x=3;x<=8;x++) P(x,2,Y);
    for(var x2=2;x2<=9;x2++) P(x2,3,Y);
    P(3,4,Y);P(4,4,K);P(5,4,Y);P(6,4,Y);P(7,4,K);P(8,4,Y);P(2,4,Y);P(9,4,Y);
    for(var x3=2;x3<=9;x3++) P(x3,5,Y);
    P(2,6,R);P(9,6,R); for(var x4=3;x4<=8;x4++) P(x4,6,Y);
    for(var x5=2;x5<=9;x5++) P(x5,7,D);
    for(var x6=3;x6<=8;x6++) P(x6,8,Y);
    for(var x7=3;x7<=8;x7++) P(x7,9,D);
    P(4,10,K);P(5,10,K);P(7,10,K);P(8,10,K);
    return '<svg viewBox="0 0 72 66" width="100%" height="100%" shape-rendering="crispEdges">'+o+'</svg>'; })();
  var INVADER='<svg viewBox="0 0 44 32" width="100%" height="100%"><g fill="#7BA3F5"><rect x="8" y="0" width="4" height="4"/><rect x="32" y="0" width="4" height="4"/><rect x="12" y="4" width="4" height="4"/><rect x="28" y="4" width="4" height="4"/><rect x="8" y="8" width="28" height="4"/><rect x="4" y="12" width="10" height="4"/><rect x="18" y="12" width="8" height="4"/><rect x="30" y="12" width="10" height="4"/><rect x="0" y="16" width="44" height="4"/><rect x="0" y="20" width="4" height="8"/><rect x="40" y="20" width="4" height="8"/><rect x="10" y="24" width="6" height="4"/><rect x="28" y="24" width="6" height="4"/></g></svg>';
  var LEAF_E='<svg viewBox="0 0 26 26" width="100%" height="100%"><path d="M3 23 q0 -18 20 -20 q-2 20 -20 20z" fill="#5FB87A"/><path d="M3 23 q8 -10 16 -14" stroke="#3C8455" stroke-width="1.6" fill="none"/></svg>';
  var FLAME_E='<svg viewBox="0 0 26 34" width="100%" height="100%"><path d="M13 2 q8 10 6 20 a7 7 0 0 1 -12 0 q-2 -10 6 -20z" fill="#F3A13C"/><path d="M13 14 q4 6 2 10 a3.5 3.5 0 0 1 -4 0 q-2 -4 2 -10z" fill="#FFE07A"/></svg>';
  var DROP_E='<svg viewBox="0 0 22 30" width="100%" height="100%"><path d="M11 2 q9 12 7 19 a7 7 0 0 1 -14 0 q-2 -7 7 -19z" fill="#2FA7D8"/><circle cx="8" cy="20" r="2.4" fill="#BFE3F5"/></svg>';
  function SPOT(col){ return '<svg viewBox="0 0 200 300" width="100%" height="100%" preserveAspectRatio="none"><polygon points="96,0 104,0 176,300 24,300" fill="'+col+'" opacity=".3"/></svg>'; }
  /* Mount Olympus proper: marble columns framing the stage, a cloud shelf under them,
     laurel leaves adrift, and now and then a soft lightning glint high in the sky. */
  var COLUMN='<svg viewBox="0 0 60 300" width="100%" height="100%" preserveAspectRatio="none"><g fill="#EDE6D2"><rect x="4" y="0" width="52" height="14" rx="3"/><rect x="10" y="14" width="40" height="10"/><rect x="14" y="24" width="32" height="252"/><rect x="10" y="276" width="40" height="10"/><rect x="4" y="286" width="52" height="14" rx="3"/></g><g fill="#CFC4A6"><rect x="19" y="24" width="4" height="252"/><rect x="28" y="24" width="4" height="252"/><rect x="37" y="24" width="4" height="252"/></g></svg>';
  var LAUREL='<svg viewBox="0 0 26 26" width="100%" height="100%"><path d="M3 23 q1 -16 20 -20 q-4 18 -20 20z" fill="#B9A94F"/><path d="M3 23 q8 -9 15 -14" stroke="#8F7F2E" stroke-width="1.4" fill="none"/></svg>';
  var CLOUD='<svg viewBox="0 0 200 60" width="100%" height="100%"><g fill="#F4EFE2" opacity=".9"><ellipse cx="50" cy="42" rx="48" ry="17"/><ellipse cx="105" cy="34" rx="42" ry="20"/><ellipse cx="155" cy="44" rx="44" ry="15"/></g></svg>';
  /* the serpent temple: hanging vines, paired eyes blinking in the gloom, carved stones */
  var VINE='<svg viewBox="0 0 60 220" width="100%" height="100%" preserveAspectRatio="none"><path d="M30 0 q-12 40 4 78 q14 34 -6 70 q-12 24 2 72" fill="none" stroke="#2E6B3E" stroke-width="7" stroke-linecap="round"/><path d="M24 44 q-14 -4 -18 -16 q14 -2 18 16z M36 120 q14 -4 18 -16 q-14 -2 -18 16z M26 188 q-14 -4 -18 -16 q14 -2 18 16z" fill="#3C8455"/></svg>';
  var EYES='<svg viewBox="0 0 60 24" width="100%" height="100%"><g class="w4-eyeblink"><ellipse cx="16" cy="12" rx="9" ry="7" fill="#FFD34D"/><ellipse cx="44" cy="12" rx="9" ry="7" fill="#FFD34D"/><rect x="14" y="5" width="4" height="14" rx="2" fill="#1A2B18"/><rect x="42" y="5" width="4" height="14" rx="2" fill="#1A2B18"/></g></svg>';
  var GLYPHSTONE='<svg viewBox="0 0 90 110" width="100%" height="100%"><path d="M8 110 v-84 q0 -18 37 -18 q37 0 37 18 v84z" fill="#4A5A47"/><g stroke="#7FA37A" stroke-width="3" fill="none" opacity=".8"><circle cx="45" cy="34" r="10"/><path d="M28 58 h34 M28 72 h34 M28 86 h22"/><path d="M45 24 v20"/></g></svg>';
  /* race day: waving chequered flags and a grandstand full of colour along the horizon */
  var RFLAG='<svg viewBox="0 0 70 60" width="100%" height="100%"><rect x="2" y="0" width="4" height="60" rx="2" fill="#8A8A96"/><g class="w4-flagwave"><rect x="6" y="2" width="44" height="30" fill="#fff"/><g fill="#1A2438"><rect x="6" y="2" width="11" height="10"/><rect x="28" y="2" width="11" height="10"/><rect x="17" y="12" width="11" height="10"/><rect x="39" y="12" width="11" height="10"/><rect x="6" y="22" width="11" height="10"/><rect x="28" y="22" width="11" height="10"/></g></g></svg>';
  var STAND=(function(){ var o='<svg viewBox="0 0 400 70" width="100%" height="100%" preserveAspectRatio="none"><rect x="0" y="0" width="400" height="70" fill="#25304A"/>';
    var cols=['#E0453A','#FFC83D','#3B6FE0','#2FD08C','#B14FC4','#F0A93C','#fff'];
    for(var r=0;r<3;r++) for(var c=0;c<33;c++){ if((c*7+r*3)%5===4) continue;
      o+='<circle cx="'+(8+c*12)+'" cy="'+(14+r*20)+'" r="4.2" fill="'+cols[(c*3+r)%7]+'" opacity=".85"/>'; }
    return o+'<rect x="0" y="62" width="400" height="8" fill="#1A2438"/></svg>'; })();
  /* the opening splash borrows the dino cast VERBATIM — same SVGs, same classes,
     same gaits — so the load-up shows the world itself, never a recreation */
  window.SB_W4_ART = { BRACHIO: BRACHIO, RAPTOR: RAPTOR, PTERO: PTERO, TREE: TREE, FERN: FERN, BEE: BEE_S };
  function build(world){
    layer=el('w4-bg');
    if(world==='godly'){
      layer.appendChild(el('w4-godrays'));
      layer.appendChild(el('w4-glow'));
      /* Olympus was rays + motes and read as "no background" beside Dino Era.
         Give it its architecture: columns, the cloud shelf, laurel, lightning. */
      layer.appendChild(el('w4-column','left:1.5vw', COLUMN));
      layer.appendChild(el('w4-column','right:1.5vw;animation-delay:-3s', COLUMN));
      layer.appendChild(el('w4-cloudshelf','left:-4vw;bottom:-2vh;width:44vw', CLOUD));
      layer.appendChild(el('w4-cloudshelf','right:-6vw;bottom:-3vh;width:52vw;animation-delay:-9s', CLOUD));
      layer.appendChild(el('w4-cloudshelf','left:30vw;bottom:-5vh;width:34vw;animation-delay:-16s;opacity:.5', CLOUD));
      layer.appendChild(el('w4-boltglint','left:22vw;top:8vh'));
      layer.appendChild(el('w4-boltglint','right:18vw;top:14vh;animation-delay:-7s'));
      for(var la=0;la<6;la++) layer.appendChild(el('w4o-fall','left:'+rnd(6,94).toFixed(1)+'vw;width:'+rnd(14,20).toFixed(0)+'px;height:'+rnd(14,20).toFixed(0)+'px;opacity:.6;animation-duration:'+rnd(13,22).toFixed(1)+'s,'+rnd(3,5).toFixed(1)+'s;animation-delay:-'+rnd(0,18).toFixed(1)+'s,-'+rnd(0,4).toFixed(1)+'s', LAUREL));
      for(var i=0;i<16;i++){ var m=el('w4-mote','left:'+rnd(2,98).toFixed(1)+'vw;animation-duration:'+rnd(11,22).toFixed(1)+'s;animation-delay:-'+rnd(0,20).toFixed(1)+'s;width:'+rnd(3,7).toFixed(1)+'px;height:'+rnd(3,7).toFixed(1)+'px'); layer.appendChild(m); }
    } else if(world==='serpent'){
      layer.appendChild(el('w4-fog'));
      /* the jungle closes in: vines off the top, a carved stone, eyes in the dark */
      layer.appendChild(el('w4-vine','left:2vw', VINE));
      layer.appendChild(el('w4-vine','right:3vw;height:34vh;animation-delay:-2.4s', VINE));
      layer.appendChild(el('w4-vine','left:26vw;height:22vh;animation-delay:-4s;opacity:.5', VINE));
      layer.appendChild(el('w4-stone','left:4vw;bottom:-8px;width:86px;aspect-ratio:90/110;opacity:.5', GLYPHSTONE));
      layer.appendChild(el('w4-stone','right:6vw;bottom:-12px;width:64px;aspect-ratio:90/110;opacity:.35;transform:scaleX(-1)', GLYPHSTONE));
      layer.appendChild(el('w4-eyes','left:9vw;top:64vh;width:44px;aspect-ratio:60/24', EYES));
      layer.appendChild(el('w4-eyes','right:12vw;top:30vh;width:34px;aspect-ratio:60/24;animation-delay:-5.2s', EYES));
      for(var ff=0;ff<9;ff++) layer.appendChild(el('w4-firefly','left:'+rnd(4,96).toFixed(1)+'vw;top:'+rnd(20,90).toFixed(1)+'vh;animation-duration:'+rnd(3,6).toFixed(1)+'s,'+rnd(9,16).toFixed(1)+'s;animation-delay:-'+rnd(0,5).toFixed(1)+'s,-'+rnd(0,12).toFixed(1)+'s'));
      for(var s=0;s<3;s++) layer.appendChild(el('w4-snake','top:'+rnd(12,80).toFixed(1)+'vh;animation-duration:'+rnd(26,44).toFixed(1)+'s;animation-delay:-'+rnd(0,30).toFixed(1)+'s;opacity:'+rnd(.28,.5).toFixed(2), SNAKE));
      for(var bgi=0;bgi<7;bgi++) layer.appendChild(el('w4-bug','top:'+rnd(8,92).toFixed(1)+'vh;animation-duration:'+rnd(18,34).toFixed(1)+'s;animation-delay:-'+rnd(0,26).toFixed(1)+'s;width:'+rnd(16,30).toFixed(0)+'px;height:'+rnd(16,30).toFixed(0)+'px', BUG));
    } else if(world==='race'){
      layer.appendChild(el('w4-chequer'));
      layer.appendChild(el('w4-asphalt'));
      /* race DAY, not an empty track: a grandstand of colour and flags at both walls */
      layer.appendChild(el('w4-stand','', STAND));
      layer.appendChild(el('w4-rflag','left:2vw;bottom:24vh;width:58px;aspect-ratio:70/60', RFLAG));
      layer.appendChild(el('w4-rflag','right:2vw;bottom:26vh;width:48px;aspect-ratio:70/60;animation-delay:-1.1s;transform:scaleX(-1)', RFLAG));
      var cols=['#3B6FE0','#FFC83D','#2456D6','#2FA35C'];
      for(var ci=0;ci<4;ci++) layer.appendChild(el('w4-car','bottom:'+rnd(3,20).toFixed(1)+'vh;width:'+rnd(90,180).toFixed(0)+'px;animation-duration:'+rnd(4.5,9).toFixed(1)+'s;animation-delay:-'+rnd(0,8).toFixed(1)+'s;opacity:'+rnd(.4,.72).toFixed(2), carSVG(cols[ci%cols.length])));
      for(var li=0;li<10;li++) layer.appendChild(el('w4-line','top:'+rnd(6,92).toFixed(1)+'vh;width:'+rnd(60,190).toFixed(0)+'px;animation-duration:'+rnd(1.1,2.6).toFixed(2)+'s;animation-delay:-'+rnd(0,2).toFixed(2)+'s'));
      /* Aug-31 strengthening: the start gantry and its light tree, kerb stripes
         at both walls, two more cars in the far lane, heat shimmer off the track */
      var GANTRY='<svg viewBox="0 0 300 90" width="100%" height="100%" preserveAspectRatio="none"><rect x="6" y="0" width="10" height="90" fill="#25304A"/><rect x="284" y="0" width="10" height="90" fill="#25304A"/><rect x="0" y="6" width="300" height="22" rx="5" fill="#31405E"/><g class="w4-golight"><circle cx="110" cy="17" r="6" fill="#E0453A"/><circle cx="130" cy="17" r="6" fill="#F0A93C"/><circle cx="150" cy="17" r="6" fill="#2FD08C"/><circle cx="170" cy="17" r="6" fill="#2FD08C"/><circle cx="190" cy="17" r="6" fill="#2FD08C"/></g></svg>';
      layer.appendChild(el('w4-gantry','', GANTRY));
      layer.appendChild(el('w4-kerb','left:0'));
      layer.appendChild(el('w4-kerb','right:0;transform:scaleX(-1)'));
      for(var c2=0;c2<2;c2++) layer.appendChild(el('w4-car','bottom:'+rnd(24,34).toFixed(1)+'vh;width:'+rnd(56,80).toFixed(0)+'px;animation-duration:'+rnd(3.4,5).toFixed(1)+'s;animation-delay:-'+rnd(0,4).toFixed(1)+'s;opacity:.35', carSVG(c2?'#E0453A':'#2FD08C')));
      layer.appendChild(el('w4-shimmer',''));
      layer.appendChild(el('w4-haze'));
      // a treeline of tall conifers, back row hazier than the front
      [['4vw','30vh',.30,'-2s'],['16vw','24vh',.22,'-4s'],['70vw','34vh',.34,'-1s'],['84vw','26vh',.24,'-5s'],['92vw','20vh',.18,'-3s']]
        .forEach(function(t){ layer.appendChild(el('w4-tree','left:'+t[0]+';height:'+t[1]+';width:calc('+t[1]+' * .42);opacity:'+t[2]+';animation-delay:'+t[3], TREE(240))); });
      layer.appendChild(el('w4-fern','left:-14px;animation-delay:-1s', FERN));
      layer.appendChild(el('w4-fern','right:-18px;animation-delay:-3s;width:150px', FERN));
      layer.appendChild(el('w4-ptero','animation-delay:-12s', PTERO));
      layer.appendChild(el('w4-ptero','top:4vh;width:132px;animation-duration:56s;animation-delay:-33s;opacity:.65', PTERO));
      layer.appendChild(el('w4-ptero','top:24vh;width:58px;animation-duration:92s;animation-delay:-70s;opacity:.4', PTERO));
      for(var sp=0;sp<14;sp++) layer.appendChild(el('w4-spore','left:'+rnd(2,98).toFixed(1)+'vw;width:'+rnd(4,9).toFixed(0)+'px;height:'+rnd(4,9).toFixed(0)+'px;animation-duration:'+rnd(16,30).toFixed(1)+'s;animation-delay:-'+rnd(0,26).toFixed(1)+'s'));
      layer.appendChild(el('w4-brachstill','', BRACHIO));
      // raptors creeping through the undergrowth, one each way
      layer.appendChild(el('w4-raptor','bottom:2vh;width:120px;animation-duration:52s;animation-delay:-8s', RAPTOR));
      layer.appendChild(el('w4-raptor w4-raptor-b','bottom:8vh;width:88px;animation-duration:64s;animation-delay:-30s', RAPTOR));
      // movie-light: cottonwood seeds drifting through the sunbeams
      for(var cw=0;cw<12;cw++) layer.appendChild(el('w4-cotton','left:'+rnd(2,98).toFixed(1)+'vw;animation-duration:'+rnd(14,26).toFixed(1)+'s,'+rnd(3,5).toFixed(1)+'s;animation-delay:-'+rnd(0,24).toFixed(1)+'s,-'+rnd(0,4).toFixed(1)+'s;width:'+rnd(5,9).toFixed(0)+'px;height:'+rnd(5,9).toFixed(0)+'px'));
      // a wide golden sunbeam across the canopy
      layer.appendChild(el('w4-beam'));
      layer.appendChild(el('w4-brachio','', BRACHIO));     // the monument
    }
    /* ---- the original eight get lighter scenes in the same voice ---- */
    else if(world==='spellbound'){
      layer.appendChild(el('w4o-comb')); layer.appendChild(el('w4o-hiveglow'));
      // the shimmer lattice: individually addressable cells in true close packing;
      // CSS shows them only at night, each flashing on its own delay so the glow travels
      (function(){ var s0=34, hh=Math.round(Math.sqrt(3)*s0), dx=Math.round(1.5*s0);
        var HEXCELL='<svg viewBox="0 0 68 59" width="100%" height="100%"><polygon points="17,0 51,0 68,29.5 51,59 17,59 0,29.5" fill="rgba(255,211,77,.16)" stroke="#F0B429" stroke-width="2.4"/></svg>';
        var W=(window.innerWidth||1280), H=(window.innerHeight||900), k=0;
        for(var ci=0;ci<Math.ceil(W/dx)+2 && k<360;ci++)
          for(var ri=0;ri<Math.ceil(H/hh)+2 && k<360;ri++){ k++;
            var x=ci*dx-s0, y=ri*hh+((ci%2)?hh/2:0)-hh/2;
            layer.appendChild(el('w4-hexcell','left:'+x+'px;top:'+y+'px;width:'+(2*s0)+'px;height:'+hh+'px;animation-delay:'+(((ci*2+ri*5)%29)*0.23).toFixed(2)+'s', HEXCELL)); }
      })();
      /* NOTHING CROSSES THIS SKY, and that took two tries to learn.
         It was six of the app's own bee avatars flying across — cartoon characters
         loose in the chrome, competing with the avatar the child actually chose, and
         visible behind the loading screen because the world layer paints first.
         Replacing them with drifting letters fixed the mascot problem and kept the
         real one: anything discrete moving across a page pulls the eye off the words,
         and this background sits behind a child trying to read and spell.
         So the world is texture and light now — the honeycomb drift, the hive glow,
         and a little rising dust. No objects, nothing to track. */
      for(var m1=0;m1<8;m1++) layer.appendChild(el('w4o-rise','left:'+rnd(2,98).toFixed(1)+'vw;width:5px;height:5px;background:#FFD34D;box-shadow:0 0 7px 2px rgba(255,211,77,.6);animation-duration:'+rnd(12,22).toFixed(1)+'s;animation-delay:-'+rnd(0,20).toFixed(1)+'s'));
    } else if(world==='marquee'){
      layer.appendChild(el('w4o-drape w4o-drapeL')); layer.appendChild(el('w4o-drape w4o-drapeR'));
      layer.appendChild(el('w4o-stagefloor')); layer.appendChild(el('w4o-bulbs'));
      /* opening night, not an empty stage: the star curtain glitters behind the drapes,
         music drifts up from the pit, and a mirror ball throws its slow sparkle */
      for(var sc2=0;sc2<26;sc2++) layer.appendChild(el('w4-curtainstar','left:'+rnd(4,96).toFixed(1)+'vw;top:'+rnd(4,66).toFixed(1)+'vh;animation-delay:-'+rnd(0,5).toFixed(1)+'s;animation-duration:'+rnd(2.2,5).toFixed(1)+'s'));
      layer.appendChild(el('w4-mirrorball','', '<svg viewBox="0 0 60 72" width="100%" height="100%"><rect x="28" y="0" width="4" height="10" fill="#8A8A96"/><circle cx="30" cy="38" r="28" fill="#C8CCD8"/><g fill="#EEF0F6" opacity=".8"><rect x="10" y="22" width="9" height="9"/><rect x="26" y="18" width="9" height="9"/><rect x="42" y="24" width="9" height="9"/><rect x="16" y="38" width="9" height="9"/><rect x="34" y="36" width="9" height="9"/><rect x="24" y="52" width="9" height="9"/></g></svg>'));
      var NOTE='<svg viewBox="0 0 30 40" width="100%" height="100%"><path d="M22 4 v22 a6 5 0 1 1 -3 -4.4 V8 l-8 2 v18 a6 5 0 1 1 -3 -4.4 V7 z" fill="#F6DC8A"/></svg>';
      for(var nt=0;nt<5;nt++) layer.appendChild(el('w4-note','left:'+rnd(10,88).toFixed(1)+'vw;width:'+rnd(16,26).toFixed(0)+'px;animation-duration:'+rnd(11,19).toFixed(1)+'s;animation-delay:-'+rnd(0,15).toFixed(1)+'s', NOTE));
      layer.appendChild(el('w4o-swing','left:12vw;top:-4vh;width:26vw;height:70vh', SPOT('#F0B429')));
      layer.appendChild(el('w4o-swing','right:12vw;top:-4vh;width:26vw;height:70vh;animation-delay:-4.5s', SPOT('#F7E9C8')));
      for(var m2=0;m2<9;m2++) layer.appendChild(el('w4o-rise','left:'+rnd(8,92).toFixed(1)+'vw;width:4px;height:4px;background:#F6DC8A;box-shadow:0 0 6px 2px rgba(246,220,138,.55);animation-duration:'+rnd(13,24).toFixed(1)+'s;animation-delay:-'+rnd(0,20).toFixed(1)+'s'));
    } else if(world==='aurora'){
      /* Van Gogh's Starry Night: the double swirl rolling across the sky, halo stars,
         the blazing crescent, the cypress flame on the left, hills on the horizon */
      // the Milky Way: a luminous band from bottom-left corner to top-right, through centre,
      // angled to THIS screen's diagonal; star-dust scattered along its length
      (function(){ var W=(window.innerWidth||1280), H=(window.innerHeight||900);
        var ang=-(Math.atan2(H,W)*180/Math.PI).toFixed(1);
        layer.appendChild(el('w4o-milkyway','transform:translate(-50%,-50%) rotate('+ang+'deg)'));
        /* The band itself is STARS: hundreds of grains, gaussian-clustered about the axis so
           the middle is dense and the edges thin out — a river of stars, not a ribbon. */
        var TINT=['#FFF6E0','#FFFFFF','#DFE9F8','#FFEFC2'];
        for(var md=0;md<250;md++){ var t=Math.random();
          var off=((Math.random()+Math.random()+Math.random())-1.5)*9;   // ~gaussian, vmin
          var sz=(Math.random()<.82)?rnd(1,2.2):rnd(2.2,3.6);
          layer.appendChild(el('w4o-mwstar','left:calc('+(t*100).toFixed(1)+'vw + '+off.toFixed(1)+'vmin);top:calc('+(100-t*100).toFixed(1)+'vh + '+off.toFixed(1)+'vmin);width:'+sz.toFixed(1)+'px;height:'+sz.toFixed(1)+'px;background:'+TINT[md%4]+';opacity:'+rnd(.35,.85).toFixed(2)+';animation-duration:'+rnd(1.8,5.2).toFixed(1)+'s;animation-delay:-'+rnd(0,4).toFixed(1)+'s')); }
        for(var mb=0;mb<12;mb++){ var tb=Math.random(), ob=((Math.random()+Math.random())-1)*7;
          layer.appendChild(el('w4o-mwstar w4o-mwbright','left:calc('+(tb*100).toFixed(1)+'vw + '+ob.toFixed(1)+'vmin);top:calc('+(100-tb*100).toFixed(1)+'vh + '+ob.toFixed(1)+'vmin);width:'+rnd(3.4,5).toFixed(1)+'px;height:'+rnd(3.4,5).toFixed(1)+'px;animation-duration:'+rnd(2.2,4.4).toFixed(1)+'s;animation-delay:-'+rnd(0,4).toFixed(1)+'s')); }
      })();
      layer.appendChild(el('w4o-vg w4o-vgswirl','left:4vw;top:7vh;width:min(52vw,620px);aspect-ratio:2/1', VG_SWIRL));
      layer.appendChild(el('w4o-vg w4o-vgswirl w4o-vgswirl2','right:2vw;top:34vh;width:min(30vw,340px);aspect-ratio:2/1;animation-delay:-11s', VG_SWIRL));
      layer.appendChild(el('w4o-vg w4o-vgmoon','right:5vw;top:5vh;width:min(17vw,200px);aspect-ratio:1', VG_MOON));
      layer.appendChild(el('w4o-vghills','', VG_HILLS));
      for(var st=0;st<13;st++){ var sz=rnd(8,22);
        layer.appendChild(el('w4o-vgstar','left:'+rnd(3,94).toFixed(1)+'vw;top:'+rnd(3,60).toFixed(1)+'vh;width:'+sz.toFixed(0)+'px;height:'+sz.toFixed(0)+'px;animation-duration:'+rnd(2.4,5.5).toFixed(1)+'s;animation-delay:-'+rnd(0,4).toFixed(1)+'s')); }
      layer.appendChild(el('w4o-shoot','right:26vw;top:14vh;animation-delay:-6s'));
      // a whole solar neighbourhood, drifting at different depths and speeds
      [[PLANET2('#7D8CF0','#A9B4F7','#A9B4F7',null),'16vh',110,'90s','.7','0s'],
       [PLANET2('#E0885A','#F0B48A','#F6DC8A',null),'8vh',72,'130s','.55','-40s'],
       [PLANET2('#4FC2B0','#9BE3D6',null,'#2E8FA0'),'34vh',56,'75s','.6','-22s'],
       [PLANET2('#B98CFF','#D6BEFF',null,'#8A5CD8'),'52vh',44,'105s','.45','-70s'],
       [PLANET2('#C8CCD8','#EEF0F6',null,null),'26vh',26,'60s','.5','-12s'],
       [PLANET2('#5A6ED0','#8FA0F5','#F0B48A','#3D4FBF'),'66vh',88,'150s','.4','-95s']]
      .forEach(function(pl){ layer.appendChild(el('w4o-across','top:'+pl[1]+';width:'+pl[2]+'px;animation-duration:'+pl[3]+';opacity:'+pl[4]+';animation-delay:'+pl[5], pl[0])); });
    } else if(world==='anime'){
      layer.appendChild(el('w4o-sun')); layer.appendChild(el('w4o-ridge'));
      /* sun + ridge + petals read as empty next to Dino Era. The full postcard:
         the mountain, drifting cloud bands, glowing lanterns, a bough of blossom. */
      layer.appendChild(el('w4-fuji','', '<svg viewBox="0 0 300 160" width="100%" height="100%" preserveAspectRatio="none"><path d="M0 160 L104 26 q10 -12 20 -12 q10 0 20 12 L300 160z" fill="#8B7FA8" opacity=".55"/><path d="M96 52 q14 10 26 0 q12 -10 24 0 q10 8 22 0 L124 14 q-10 -12 -20 0z" fill="#F5F2EC" opacity=".9"/></svg>'));
      layer.appendChild(el('w4-cloudband','top:16vh;width:46vw;animation-duration:90s', CLOUD));
      layer.appendChild(el('w4-cloudband','top:32vh;width:30vw;animation-duration:130s;animation-delay:-60s;opacity:.5', CLOUD));
      var LANTERN='<svg viewBox="0 0 40 60" width="100%" height="100%"><path d="M18 0 h4 v6 h-4z" fill="#8E2C44"/><ellipse cx="20" cy="28" rx="15" ry="22" fill="#F6C25A"/><ellipse cx="20" cy="28" rx="15" ry="22" fill="none" stroke="#C8791B" stroke-width="2"/><path d="M8 20 h24 M6 28 h28 M8 36 h24" stroke="#C8791B" stroke-width="1.2" opacity=".7"/><rect x="14" y="49" width="12" height="5" rx="2" fill="#8E2C44"/></svg>';
      for(var ln=0;ln<3;ln++) layer.appendChild(el('w4-lantern','left:'+(14+ln*32)+'vw;width:'+rnd(24,36).toFixed(0)+'px;animation-duration:'+rnd(22,34).toFixed(1)+'s;animation-delay:-'+rnd(0,26).toFixed(1)+'s', LANTERN));
      layer.appendChild(el('w4-bough','', '<svg viewBox="0 0 240 120" width="100%" height="100%"><path d="M240 8 q-70 4 -120 34 q-36 22 -56 58" fill="none" stroke="#5A3A2E" stroke-width="9" stroke-linecap="round"/><path d="M150 34 q-16 -2 -26 10 M196 20 q-14 4 -18 16" fill="none" stroke="#5A3A2E" stroke-width="5" stroke-linecap="round"/><g fill="#F3B2C0"><circle cx="122" cy="46" r="9"/><circle cx="146" cy="30" r="8"/><circle cx="172" cy="40" r="7"/><circle cx="196" cy="18" r="8"/><circle cx="98" cy="66" r="8"/><circle cx="76" cy="88" r="7"/></g><g fill="#E88AA0"><circle cx="134" cy="38" r="4"/><circle cx="184" cy="30" r="4"/><circle cx="88" cy="76" r="4"/></g></svg>'));
      layer.appendChild(el('','right:3vw;bottom:0;width:min(20vw,180px);height:auto;aspect-ratio:160/110;opacity:.45', TORII));
      for(var pt=0;pt<15;pt++) layer.appendChild(el('w4o-fall','left:'+rnd(2,98).toFixed(1)+'vw;width:'+rnd(10,17).toFixed(0)+'px;height:'+rnd(10,17).toFixed(0)+'px;opacity:.7;animation-duration:'+rnd(9,17).toFixed(1)+'s,'+rnd(2.4,4).toFixed(1)+'s;animation-delay:-'+rnd(0,14).toFixed(1)+'s,-'+rnd(0,3).toFixed(1)+'s', PETAL));
      /* Aug-31 strengthening: a pagoda on the ridge, low mist drifting through
         the valley, and a wing of birds crossing under the sun */
      var PAGODA='<svg viewBox="0 0 140 160" width="100%" height="100%"><g fill="#6E4A62"><path d="M70 6 l6 14 h-12 z"/><path d="M34 34 q36 -18 72 0 l-10 8 h-52 z"/><rect x="52" y="42" width="36" height="16"/><path d="M22 72 q48 -22 96 0 l-12 9 h-72 z"/><rect x="46" y="81" width="48" height="18"/><path d="M10 116 q60 -26 120 0 l-14 10 h-92 z"/><rect x="40" y="126" width="60" height="34"/></g></svg>';
      layer.appendChild(el('w4-pagoda','', PAGODA));
      layer.appendChild(el('w4-mist','top:58vh;animation-duration:75s'));
      layer.appendChild(el('w4-mist','top:71vh;animation-duration:105s;animation-delay:-48s;opacity:.45'));
      var BIRD='<svg viewBox="0 0 40 16" width="100%" height="100%"><path d="M2 12 q9 -10 18 0 q9 -10 18 0" fill="none" stroke="#5A3A50" stroke-width="2.6" stroke-linecap="round"/></svg>';
      [['7vh',26,'64s','-8s',.6],['10vh',18,'80s','-30s',.45],['12vh',22,'72s','-52s',.5]].forEach(function(bd){
        layer.appendChild(el('w4o-across','top:'+bd[0]+';width:'+bd[1]+'px;aspect-ratio:40/16;animation-duration:'+bd[2]+';animation-delay:'+bd[3]+';opacity:'+bd[4], BIRD)); });
    } else if(world==='science'){
      layer.appendChild(el('w4o-pour','right:8vw;bottom:2vh;width:min(17vw,180px);aspect-ratio:1', POUR));
      [['8vw','#3BC0AA',34,74],['20vw','#B14FC4',26,58],['46vw','#F0A93C',38,66],['68vw','#2E8FB8',22,52]]
        .forEach(function(bk,i){ layer.appendChild(el('w4o-beaker','left:'+bk[0]+';width:'+bk[3]+'px;aspect-ratio:60/74;opacity:.'+(6+i%3), BEAKER(bk[1],bk[2]))); });
      layer.appendChild(el('w4o-react','left:22vw;bottom:16vh;width:34px;aspect-ratio:1', REACT));
      layer.appendChild(el('w4o-react','right:24vw;bottom:20vh;width:26px;aspect-ratio:1;animation-delay:-2.6s', REACT));
      layer.appendChild(el('w4o-graph')); layer.appendChild(el('w4o-mol','', '<svg viewBox="0 0 100 100" width="100%" height="100%"><g stroke="#3BC0AA" stroke-width="2.4" fill="none"><line x1="50" y1="50" x2="18" y2="30"/><line x1="50" y1="50" x2="82" y2="30"/><line x1="50" y1="50" x2="50" y2="86"/></g><circle cx="50" cy="50" r="9" fill="#0E8A78"/><circle cx="18" cy="30" r="7" fill="#3BC0AA"/><circle cx="82" cy="30" r="7" fill="#3BC0AA"/><circle cx="50" cy="86" r="7" fill="#7FD9C4"/></svg>'));
      layer.appendChild(el('','left:2vw;bottom:-6px;width:84px;height:auto;aspect-ratio:60/70;opacity:.5', FLASK));
      layer.appendChild(el('','right:3vw;bottom:-6px;width:52px;height:auto;aspect-ratio:60/70;opacity:.3;transform:scaleX(-1)', FLASK));
      /* the lab grows a physics wing: a slow DNA helix and an atom with live electrons */
      layer.appendChild(el('w4-helix','', (function(){ var o='<svg viewBox="0 0 60 240" width="100%" height="100%">';
        for(var hy=0;hy<8;hy++){ var ph=hy*0.9, x1=30+22*Math.sin(ph), x2=30-22*Math.sin(ph), y=14+hy*28;
          o+='<line x1="'+x1.toFixed(0)+'" y1="'+y+'" x2="'+x2.toFixed(0)+'" y2="'+y+'" stroke="#7FD9C4" stroke-width="2.4" opacity=".6"/>'
            +'<circle cx="'+x1.toFixed(0)+'" cy="'+y+'" r="4.4" fill="#0E8A78"/><circle cx="'+x2.toFixed(0)+'" cy="'+y+'" r="4.4" fill="#B14FC4"/>'; }
        return o+'</svg>'; })()));
      layer.appendChild(el('w4-atom','', '<svg viewBox="0 0 100 100" width="100%" height="100%" style="overflow:visible"><g fill="none" stroke="#3BC0AA" stroke-width="1.8" opacity=".75"><ellipse cx="50" cy="50" rx="40" ry="15"/><ellipse cx="50" cy="50" rx="40" ry="15" transform="rotate(60 50 50)"/><ellipse cx="50" cy="50" rx="40" ry="15" transform="rotate(120 50 50)"/></g><circle cx="50" cy="50" r="7" fill="#F0A93C"/><g class="w4-orbit"><circle cx="90" cy="50" r="3.4" fill="#2E8FB8"/></g><g class="w4-orbit w4-orbit2"><circle cx="10" cy="50" r="3.4" fill="#B14FC4"/></g></svg>'));
      for(var bu=0;bu<11;bu++) layer.appendChild(el('w4o-rise','left:'+rnd(2,98).toFixed(1)+'vw;width:'+rnd(5,11).toFixed(0)+'px;height:'+rnd(5,11).toFixed(0)+'px;background:transparent;border:2px solid rgba(59,192,170,.55);animation-duration:'+rnd(9,18).toFixed(1)+'s;animation-delay:-'+rnd(0,16).toFixed(1)+'s'));
      /* Aug-31 strengthening: a tesla coil throwing live arcs, a benzene ring
         drifting through, steam curling off the benches, a microscope on watch */
      var TESLA='<svg viewBox="0 0 80 140" width="100%" height="100%"><rect x="34" y="60" width="12" height="70" rx="4" fill="#4A5A68"/><rect x="30" y="54" width="20" height="10" rx="4" fill="#5E7080"/><circle cx="40" cy="34" r="20" fill="#8FA6B8"/><circle cx="34" cy="28" r="6" fill="#C4D4E0" opacity=".8"/><g class="w4-arcflash" stroke="#7FE0FF" stroke-width="2.6" fill="none" stroke-linecap="round"><path d="M40 16 l-6 -10 l8 4 l-4 -10"/><path d="M56 24 l10 -6 l-6 8 l12 -2"/><path d="M24 26 l-11 -4 l7 7 l-12 1"/></g></svg>';
      layer.appendChild(el('w4-tesla','', TESLA));
      var BENZ='<svg viewBox="0 0 80 80" width="100%" height="100%"><polygon points="40,8 68,24 68,56 40,72 12,56 12,24" fill="none" stroke="#B14FC4" stroke-width="3"/><circle cx="40" cy="40" r="17" fill="none" stroke="#B14FC4" stroke-width="2.2" opacity=".7"/><g fill="#0E8A78"><circle cx="40" cy="8" r="4.4"/><circle cx="68" cy="24" r="4.4"/><circle cx="68" cy="56" r="4.4"/><circle cx="40" cy="72" r="4.4"/><circle cx="12" cy="56" r="4.4"/><circle cx="12" cy="24" r="4.4"/></g></svg>';
      layer.appendChild(el('w4-benzene','', BENZ));
      var STEAM='<svg viewBox="0 0 40 90" width="100%" height="100%" preserveAspectRatio="none"><path d="M20 90 q-12 -18 2 -34 q12 -14 -2 -30 q-10 -12 4 -26" fill="none" stroke="rgba(230,244,240,.55)" stroke-width="7" stroke-linecap="round"/></svg>';
      [['9vw','-1s'],['22vw','-4s'],['47vw','-2.5s'],['69vw','-5.5s']].forEach(function(sm){
        layer.appendChild(el('w4-steam','left:'+sm[0]+';animation-delay:'+sm[1], STEAM)); });
      var MICRO='<svg viewBox="0 0 70 80" width="100%" height="100%"><path d="M14 74 h44 l-6 -8 h-32 z" fill="#4A5A68"/><path d="M30 66 q-8 -14 4 -24 l10 -12 q6 -6 12 0 l-8 10 q10 6 6 18 l-4 8z" fill="#5E7080"/><rect x="40" y="18" width="10" height="18" rx="3" transform="rotate(40 45 27)" fill="#8FA6B8"/><circle cx="34" cy="58" r="5" fill="#7FE0FF" opacity=".8"/></svg>';
      layer.appendChild(el('','left:38vw;bottom:-4px;width:74px;height:auto;aspect-ratio:70/80;opacity:.45', MICRO));
    } else if(world==='origami'){
      layer.appendChild(el('w4o-facets'));
      /* the centrepiece: a sheet of paper folds itself — four corners in sequence, the
         packet condenses, a crane springs out and flaps, then it all unfolds and repeats */
      var CRANE2='<svg viewBox="0 0 120 90" width="100%" height="100%" style="overflow:visible">'
        +'<path class="cwL" d="M52 46 L14 12 L46 40 z" fill="#E88A5C"/>'
        +'<path class="cwR" d="M64 46 L106 14 L72 42 z" fill="#DE7A48"/>'
        +'<path d="M38 62 L58 34 L70 48 L96 54 L70 60 L54 76 z" fill="#C25A2E"/>'
        +'<path d="M58 34 L66 16 L72 30 L70 48 z" fill="#F0C9A2"/>'
        +'<path d="M66 16 L78 12 L72 24 z" fill="#E88A5C"/>'
        +'<circle cx="68" cy="21" r="1.4" fill="#3A2417"/></svg>';
      var stage=el('w4o-foldstage','',
        '<div class="fs-fold">'
        +'<div class="fs-sheet"></div>'
        +'<div class="fs-corner fs-tl"></div><div class="fs-corner fs-tr"></div>'
        +'<div class="fs-corner fs-bl"></div><div class="fs-corner fs-br"></div>'
        +'</div>'
        +'<div class="fs-crane">'+CRANE2+'</div>');
      layer.appendChild(stage);
      for(var pl=0;pl<4;pl++) layer.appendChild(el('w4o-across','top:'+rnd(10,60).toFixed(1)+'vh;width:'+rnd(38,60).toFixed(0)+'px;animation-duration:'+rnd(26,44).toFixed(1)+'s;animation-delay:-'+rnd(0,30).toFixed(1)+'s;opacity:.6', PLANE));
      layer.appendChild(el('','left:3vw;bottom:0;width:76px;height:auto;aspect-ratio:70/56;opacity:.4', CRANE));
      for(var sq=0;sq<8;sq++) layer.appendChild(el('w4o-fall','left:'+rnd(4,96).toFixed(1)+'vw;width:'+rnd(9,15).toFixed(0)+'px;height:'+rnd(9,15).toFixed(0)+'px;opacity:.6;animation-duration:'+rnd(11,20).toFixed(1)+'s,'+rnd(3,5).toFixed(1)+'s;animation-delay:-'+rnd(0,16).toFixed(1)+'s,0s',
        '<div class="w4o-flippaper" style="width:100%;height:100%;background:'+(sq%2?'#E88A5C':'#F0C9A2')+';animation-delay:-'+rnd(0,2).toFixed(1)+'s"></div>'));
    } else if(world==='pixel'){
      layer.appendChild(el('w4o-scan')); layer.appendChild(el('w4o-crt'));
      // tetromino rain — every classic piece, falling and turning at its own pace
      var SHAPES=['I','O','T','L','S','Z','J','O','T','I'];
      for(var tt=0;tt<10;tt++) layer.appendChild(el('w4o-tet','left:'+rnd(2,92).toFixed(1)+'vw;width:'+rnd(34,58).toFixed(0)+'px;aspect-ratio:72/54;opacity:'+rnd(.45,.7).toFixed(2)+';animation-duration:'+rnd(9,20).toFixed(1)+'s;animation-delay:-'+rnd(0,18).toFixed(1)+'s', TET(SHAPES[tt])));
      layer.appendChild(el('w4o-tstack','', TSTACK));
      // the pixel hero bounding across the level
      layer.appendChild(el('w4o-across','bottom:7vh;width:56px;aspect-ratio:72/66;animation-duration:24s;opacity:.9','<div class="w4o-hopper" style="width:100%;height:100%">'+PIXBEE+'</div>'));
      layer.appendChild(el('w4o-across','top:9vh;width:40px;animation-duration:48s;animation-delay:-22s;opacity:.4', INVADER));
    } else if(world==='avatar'){
      /* Four nations, one sky. Corner auras stay as underglow; on top of each sits a
         carved element medallion, two bending streams arc the whole viewport, earth
         islands hover, a koi pair circles its pond, and a temple watches from a spire. */
      ['w4o-el1','w4o-el2','w4o-el3','w4o-el4'].forEach(function(c){ layer.appendChild(el(c)); });
      var MED=function(ring,glyph){ return '<svg viewBox="0 0 90 90" width="100%" height="100%" style="overflow:visible">'
        +'<circle cx="45" cy="45" r="41" fill="none" stroke="'+ring+'" stroke-width="3.4" opacity=".85"/>'
        +'<circle class="med-ring" cx="45" cy="45" r="33" fill="none" stroke="'+ring+'" stroke-width="1.6" stroke-dasharray="6 7" opacity=".7"/>'
        +glyph+'</svg>'; };
      var G_AIR='<path d="M45 24 a19 19 0 1 1 -19 19 a14 14 0 1 0 14 -14 a8.5 8.5 0 1 1 -8.5 8.5 a4 4 0 1 0 4 -4" fill="none" stroke="#AEDDE4" stroke-width="4" stroke-linecap="round"/>';
      var G_WATER='<path d="M27 55 q3 -19 18 -24 q13 -4 19 5 q-8 -2 -13 3 q10 1 12 11 q-8 -7 -17 -3 q-11 5 -19 8z" fill="#3FA9D8"/><circle cx="59" cy="53" r="3.4" fill="#8FD0EC"/><circle cx="66" cy="47" r="2.2" fill="#8FD0EC"/>';
      var G_EARTH='<path d="M25 58 h40 l-8 -13 h-8 l-6 -10 -9 10 h-3 z" fill="#5FB87A"/><path d="M52 58 l6 -9 6 9z" fill="#4C9A64"/><rect x="30" y="30" width="7" height="7" rx="1.4" fill="#8A7A62" transform="rotate(12 33 33)"/>';
      var G_FIRE='<path d="M45 24 q10 12 7.5 24 a8.6 8.6 0 0 1 -15 0 q-2.5 -12 7.5 -24z" fill="#F3A13C"/><path d="M45 38 q4.6 7 2.4 12 a4.2 4.2 0 0 1 -4.8 0 q-2.2 -5 2.4 -12z" fill="#FFE07A"/>';
      [['w4o-elmed med-air','left:3vw;top:9vh',MED('#AEDDE4',G_AIR)],
       ['w4o-elmed med-water','right:3vw;top:9vh',MED('#3FA9D8',G_WATER)],
       ['w4o-elmed med-earth','left:3vw;bottom:6vh',MED('#5FB87A',G_EARTH)],
       ['w4o-elmed med-fire','right:3vw;bottom:6vh',MED('#F3A13C',G_FIRE)]]
        .forEach(function(m){ layer.appendChild(el(m[0],m[1],m[2])); });
      // bending streams: energy flowing along two opposing arcs, drawn edge to edge
      layer.appendChild(el('w4o-bend w4o-bendwater','',
        '<svg viewBox="0 0 100 60" width="100%" height="100%" preserveAspectRatio="none">'
        +'<path d="M-4 54 C 18 34, 42 50, 62 30 S 92 16, 104 6" fill="none" stroke="#8FC9E2" stroke-width=".55" opacity=".3" pathLength="100" class="bend-flow"/>'
        +'<path d="M-4 57 C 19 38, 43 53, 63 34 S 93 20, 104 10" fill="none" stroke="#BFE3F2" stroke-width=".3" opacity=".2" pathLength="100" class="bend-flow bend-lag"/></svg>'));
      layer.appendChild(el('w4o-bend w4o-bendfire','',
        '<svg viewBox="0 0 100 60" width="100%" height="100%" preserveAspectRatio="none">'
        +'<path d="M104 52 C 82 30, 56 46, 38 26 S 10 14, -4 5" fill="none" stroke="#F2C989" stroke-width=".55" opacity=".3" pathLength="100" class="bend-flow"/>'
        +'<path d="M104 55 C 83 34, 57 49, 39 30 S 11 18, -4 9" fill="none" stroke="#F6DFAE" stroke-width=".3" opacity=".2" pathLength="100" class="bend-flow bend-lag"/></svg>'));
      // floating earthbent islands, each with a stray pebble trailing under it
      var ISLE='<svg viewBox="0 0 90 72" width="100%" height="100%" style="overflow:visible">'
        +'<path d="M12 26 h66 l-11 30 q-6 12 -22 12 q-16 0 -22 -12 z" fill="#8A7A62"/>'
        +'<path d="M12 26 h66 l-4 9 h-58 z" fill="#6B5D49"/>'
        +'<path d="M9 26 q36 -13 72 0 q-36 9 -72 0z" fill="#5FB87A"/>'
        +'<path d="M30 19 q4 -9 8 0z" fill="#4C9A64"/><path d="M52 18 q4 -10 9 0z" fill="#4C9A64"/>'
        +'<circle class="isle-peb" cx="24" cy="64" r="3.4" fill="#8A7A62"/><circle class="isle-peb2" cx="66" cy="68" r="2.6" fill="#6B5D49"/></svg>';
      layer.appendChild(el('w4o-isle','left:1.5vw;top:30vh;width:min(13vw,120px);aspect-ratio:90/72', ISLE));
      layer.appendChild(el('w4o-isle','right:2vw;top:44vh;width:min(9vw,86px);aspect-ratio:90/72;animation-delay:-3.4s', ISLE));
      // air: spiral gusts riding across, leaves caught in them
      var GUST='<svg viewBox="0 0 60 34" width="100%" height="100%"><path d="M2 24 q20 -14 34 -6 q10 6 -2 9 q-9 2 -7 -5 M40 12 q10 -6 16 -1" fill="none" stroke="#AEDDE4" stroke-width="2.6" stroke-linecap="round" opacity=".8"/></svg>';
      for(var gu=0;gu<3;gu++) layer.appendChild(el('w4o-across','top:'+rnd(10,58).toFixed(1)+'vh;width:'+rnd(44,66).toFixed(0)+'px;aspect-ratio:60/34;animation-duration:'+rnd(20,32).toFixed(1)+'s;animation-delay:-'+rnd(0,26).toFixed(1)+'s;opacity:.55', GUST));
      for(var lf=0;lf<4;lf++) layer.appendChild(el('w4o-across','top:'+rnd(12,70).toFixed(1)+'vh;width:'+rnd(16,24).toFixed(0)+'px;animation-duration:'+rnd(16,28).toFixed(1)+'s;animation-delay:-'+rnd(0,24).toFixed(1)+'s;opacity:.6', LEAF_E));
      // fire: embers climbing the night air
      for(var em=0;em<8;em++) layer.appendChild(el('w4o-rise w4o-ember','left:'+rnd(3,97).toFixed(1)+'vw;width:'+rnd(4,8).toFixed(0)+'px;height:'+rnd(4,8).toFixed(0)+'px;animation-duration:'+rnd(8,15).toFixed(1)+'s;animation-delay:-'+rnd(0,13).toFixed(1)+'s'));
      // spirit wisps: invisible by day, they surface in the dusk spirit-world
      for(var wi=0;wi<7;wi++) layer.appendChild(el('w4o-rise w4o-wisp','left:'+rnd(4,96).toFixed(1)+'vw;width:'+rnd(6,11).toFixed(0)+'px;height:'+rnd(6,11).toFixed(0)+'px;animation-duration:'+rnd(11,19).toFixed(1)+'s;animation-delay:-'+rnd(0,17).toFixed(1)+'s'));
      // the koi pair, forever circling their pond
      layer.appendChild(el('w4o-pond','',
        '<div class="w4o-koiring"><svg viewBox="0 0 100 100" width="100%" height="100%" style="overflow:visible">'
        +'<g transform="translate(50 12)"><path d="M0 -8 q9 4 9 12 q0 9 -9 13 q-9 -4 -9 -13 q0 -8 9 -12z" fill="#F5F2E8" transform="rotate(90)"/>'
        +'<path d="M-14 0 l-9 -6 q3 6 0 12z" fill="#F5F2E8"/><circle cx="4" cy="0" r="4.2" fill="#E88A5C"/><circle cx="12" cy="-3" r="1.3" fill="#26404E"/></g>'
        +'<g transform="translate(50 88)"><path d="M0 -8 q9 4 9 12 q0 9 -9 13 q-9 -4 -9 -13 q0 -8 9 -12z" fill="#26404E" transform="rotate(-90)"/>'
        +'<path d="M14 0 l9 -6 q-3 6 0 12z" fill="#26404E"/><circle cx="-4" cy="0" r="4.2" fill="#F5F2E8"/><circle cx="-12" cy="3" r="1.3" fill="#F5F2E8"/></g></svg></div>'));
      // an air temple keeping watch from its mountain spire
      layer.appendChild(el('w4o-temple','',
        '<svg viewBox="0 0 90 130" width="100%" height="100%"><g fill="#7C8898">'
        +'<path d="M10 130 L34 62 h22 L80 130z" opacity=".55"/>'
        +'<path d="M45 8 l3 10 h-6z"/><path d="M28 30 q17 -8 34 0 l-5 6 h-24z"/><rect x="38" y="36" width="14" height="8"/>'
        +'<path d="M22 52 q23 -10 46 0 l-6 7 h-34z"/><rect x="34" y="59" width="22" height="10"/>'
        +'<path d="M16 76 q29 -12 58 0 l-7 8 h-44z"/><rect x="30" y="84" width="30" height="14"/></g>'
        +'<circle cx="45" cy="90" r="3.4" fill="#F6DC8A" class="temple-win"/></svg>'));
    }
    document.body.insertBefore(layer, document.body.firstChild);
  }

  /* Race Zone announces itself the way a race does: five lights, then 3 · 2 · 1 · GO.
     Every timer is tracked so switching worlds mid-sequence tears it down — otherwise the
     lights and the big "2" bleed into whichever world you moved to. */
  var cdTimers=[], cdNodes=[];
  function raceStop(){ cdTimers.forEach(function(t){ clearInterval(t); clearTimeout(t); }); cdTimers=[];
    cdNodes.forEach(function(n){ try{ n.remove(); }catch(e){} }); cdNodes=[];
    try{ document.querySelectorAll('.w4-countdown,.w4-lights').forEach(function(n){ n.remove(); }); }catch(e){} }
  function stillRacing(){ try{ return state && state.theme==='race'; }catch(e){ return false; } }
  function raceCountdown(){
    raceStop();
    try{
      if(document.documentElement.getAttribute('data-motion')==='off') return;
      var lights=el('w4-lights','', '<i></i><i></i><i></i><i></i><i></i>');
      document.body.appendChild(lights); cdNodes.push(lights);
      var bulbs=lights.querySelectorAll('i'), n=0;
      var t1=setInterval(function(){
        if(!stillRacing()){ raceStop(); return; }
        if(n<5){ bulbs[n].classList.add('on'); n++; return; }
        clearInterval(t1);
        [].forEach.call(bulbs,function(b){ b.classList.remove('on'); });
        var seq=['3','2','1','GO!'], i=0;
        var t2=setInterval(function(){
          if(!stillRacing()){ raceStop(); return; }
          try{ document.querySelectorAll('.w4-countdown').forEach(function(x){ x.remove(); }); }catch(e){}
          if(i>=seq.length){ clearInterval(t2); try{ lights.remove(); }catch(e){} return; }
          var c=el('w4-countdown','', '<b>'+seq[i]+'</b>'); document.body.appendChild(c); cdNodes.push(c);
          if(i===seq.length-1){ try{ if(window.SB_W4_SOUND) SB_W4_SOUND('race'); }catch(e){} }
          cdTimers.push(setTimeout(function(){ try{ c.remove(); }catch(e){} }, 700));
          i++;
        }, 640);
        cdTimers.push(t2);
      }, 260);
      cdTimers.push(t1);
      cdTimers.push(setTimeout(raceStop, 9000));
    }catch(e){}
  }

  var CALM_NAVS=['coach','quest','train','levelup','revisions','explore','concepts','vocab','typing','figurative','trivtrain','journeys','quotes','themes','own'];
  function sync(){
    try{
      // working screens get stillness: no backdrop, no moving card chrome
      var calm=false; try{ calm=state && state.screen==='app' && CALM_NAVS.indexOf(state.nav)>=0; }catch(e){}
      try{ if(window.SB_W4_FOCUS && SB_W4_FOCUS.on()) calm=true; }catch(e){}
      document.documentElement.classList.toggle('w4-calm', !!calm);
      try{ if(window.SB_W4_MUSIC) SB_W4_MUSIC.sync(); }catch(e){}
      var w=(typeof state!=='undefined' && state && state.theme)||null;
      var SCENED=window.SB_W4.ids.concat(['spellbound','marquee','aurora','anime','science','origami','pixel','avatar']);
      var mine=SCENED.indexOf(w)>=0;
      if(!mine){ if(layer){ layer.remove(); layer=null; } document.documentElement.classList.remove('w4-on'); raceStop(); CUR=null; return; }
      if(w===CUR) return;
      raceStop();
      var first=(CUR!==w);
      if(layer){ layer.remove(); layer=null; }
      CUR=w; build(w); document.documentElement.classList.add('w4-on');
      if(first){ try{ if(window.SB_W4_SOUND && w!=='race') SB_W4_SOUND(w); }catch(e){}
        if(w==='race') raceCountdown(); }
    }catch(e){}
  }
  /* The lair cycles its three serpents across the cards. Cards are re-created on every
     render and are not same-tag siblings, so CSS structural selectors can't do this —
     a MutationObserver stamps w4-sn2/w4-sn3 onto every second and third card instead. */
  function stampSnakes(){
    try{ if(!state || state.theme!=='serpent') return;
      var i=0; document.querySelectorAll('.sb-card').forEach(function(c){
        c.classList.remove('w4-sn2','w4-sn3');
        if(i%3===1) c.classList.add('w4-sn2'); else if(i%3===2) c.classList.add('w4-sn3');
        i++; }); }catch(e){}
  }
  try{ var mo=new MutationObserver(function(){ stampSnakes(); });
    var boot=function(){ var r=document.getElementById('root'); if(r) mo.observe(r,{childList:true}); stampSnakes(); };
    if(document.readyState!=='loading') boot(); else document.addEventListener('DOMContentLoaded',boot);
  }catch(e){}
  window.SB_W4_SYNC=sync;
  if(document.readyState!=='loading') setTimeout(sync,300); else document.addEventListener('DOMContentLoaded',function(){ setTimeout(sync,300); });
  setInterval(sync, 400);              // the app has no theme-change event; a cheap poll is enough
})();
