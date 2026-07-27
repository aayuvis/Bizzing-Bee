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
    { id:'godly',   label:"God's Abode", sub:'Divine',   c1:'#B8860B', c2:'#FBF3DC' },
    { id:'serpent', label:"Serpent's Lair", sub:'Creepy', c1:'#2E7D52', c2:'#EEF6EE' },
    { id:'race',    label:'Race Zone',   sub:'Full throttle', c1:'#D8342A', c2:'#F7EFEE' },
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
    EV_TC.race    = { a:'#E0453A', b:'#FFC83D', c:'#2C3A55', ink:'#8E1C14' };
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
      K.race    = { L:'#F7EFEE', D:'#3A1512', a:'#D8342A', p1:'#E0453A', p2:'#FFC83D', lt:'#F3DEDB', face:"'Bungee',sans-serif", spark:chequer('#FFC83D'), motif:trackm };
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
      master=AC.createGain(); master.gain.value=1;
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
      if(!enabled||calm||hidden||muted||!w||!CFG[w]){ stop(); return; }
      start(w); }catch(e){} }
  };
  document.addEventListener('visibilitychange',function(){ try{ window.SB_W4_MUSIC.sync(); }catch(e){} });
  var armed=false;
  document.addEventListener('pointerdown',function(){ if(armed) return; armed=true;
    setTimeout(function(){ try{ window.SB_W4_MUSIC.sync(); }catch(e){} },200); },{capture:true});
})();


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
  var BRACHIO='<svg viewBox="0 0 300 210" width="100%" height="100%">'
    +'<g fill="#2E4416"><path d="M14 206 q24 -78 98 -78 q70 0 80 66 l30 10 z"/>'
    +'<path d="M40 206 v-14 q0 -6 8 -6 q8 0 8 6 v14 z M96 208 v-12 q0 -6 8 -6 q8 0 8 6 v12 z M152 206 v-13 q0 -6 8 -6 q8 0 8 6 v13 z"/>'
    +'<path d="M14 206 q-16 4 -26 18" stroke="#2E4416" stroke-width="22" fill="none" stroke-linecap="round"/></g>'
    +'<path d="M20 158 q30 -44 84 -40" stroke="#4E6E26" stroke-width="9" fill="none" stroke-linecap="round" opacity=".7"/>'
    +'<g style="transform-box:fill-box;transform-origin:20% 96%;animation:w4-graze 9s ease-in-out infinite">'
    +'<path d="M158 132 q-14 -84 30 -116 q34 -24 48 2 q10 22 -20 30 q-36 10 -26 84 z" fill="#3E5A1C"/>'
    +'<path d="M168 120 q-8 -70 26 -100" stroke="#4E6E26" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/>'
    +'<ellipse cx="224" cy="16" rx="24" ry="15" fill="#4E6E26"/>'
    +'<circle cx="236" cy="11" r="3.4" fill="#F6ECC8"/><circle cx="236.9" cy="11.5" r="1.7" fill="#20260F"/>'
    +'<path d="M244 20 q6 2 8 6" stroke="#2E4416" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>'
    +'</svg>';
  /* a creeping raptor — long balanced tail, S-neck carried low, open jaw, bent legs */
  var RAPTOR='<svg viewBox="0 0 170 80" width="100%" height="100%">'
    +'<g fill="#33481A">'
    +'<path d="M4 30 q26 -6 48 8 q8 5 16 6 q14 2 22 -2 q6 -10 16 -12 q14 -3 22 4 l14 -5 q7 -2 9 2 l-9 8 l8 6 q-6 4 -14 1 l-10 -5 q-6 8 -18 9 q-16 2 -28 -3 q-12 -5 -24 -6 q-24 -2 -52 -11 z"/>'
    +'<path d="M78 46 q-2 10 -8 14 l10 0 q5 -6 6 -13 z M104 44 q0 10 -5 15 l10 0 q4 -7 4 -14 z"/>'
    +'</g>'
    +'<circle class="w4-eye" cx="138" cy="30" r="2.8" fill="#F6ECC8"/></svg>';
  /* a tall conifer: layered triangular boughs on a bare trunk, Jurassic scale */
  function TREE(h){ return '<svg viewBox="0 0 90 '+h+'" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">'
    +'<rect x="41" y="'+(h-46)+'" width="8" height="46" rx="3" fill="#3A2E18"/>'
    +[0,1,2,3,4,5].map(function(i){ var w=76-i*11, y=h-52-i*26;
      return '<path d="M'+(45-w/2)+' '+y+' L45 '+(y-30)+' L'+(45+w/2)+' '+y+' q-'+(w/2)+' 8 -'+w+' 0z" fill="'+(i%2?'#2E4416':'#3E5A1C')+'"/>'; }).join('')
    +'<path d="M45 '+(h-52-6*26)+' L45 '+(h-52-6*26-18)+'" stroke="#3E5A1C" stroke-width="5" stroke-linecap="round"/></svg>'; }
  var PTERO='<svg viewBox="0 0 90 40" width="100%" height="100%"><path d="M4 22 q20 -18 41 -4 q21 -14 41 4 q-20 8 -41 2 q-21 6 -41 -2z" fill="#3E5A1C"/><path d="M45 18 l14 -12 l-3 8 z" fill="#4E6E26"/></svg>';
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
  /* the pouring rig: a tilted flask streaming into a catch beaker, reaction bubbles at the join */
  var POUR='<svg viewBox="0 0 150 150" width="100%" height="100%">'
    +'<g transform="rotate(38 96 30)"><path d="M88 6 h16 v14 l10 24 q2 7 -5 7 h-26 q-7 0 -5 -7 l10 -24 z" fill="none" stroke="#0E8A78" stroke-width="3"/>'
    +'<path d="M84 38 h24 l3 7 q1 5 -4 5 h-22 q-5 0 -4 -5 z" fill="#B14FC4" opacity=".75"/></g>'
    +'<path class="stream" d="M78 52 q-2 26 -4 44" stroke="#B14FC4" stroke-width="3.4" fill="none" stroke-linecap="round"/>'
    +'<path d="M52 96 h44 M56 96 v28 q0 12 16 12 q16 0 16 -12 v-28" fill="none" stroke="#5E7A8A" stroke-width="3" stroke-linecap="round"/>'
    +'<path d="M58 112 h28 v12 q0 10 -14 10 q-14 0 -14 -10 z" fill="#3BC0AA" opacity=".8" transform="translate(1 0)"/>'
    +'<g class="fizz" fill="#B14FC4"><circle cx="68" cy="108" r="2.4"/><circle cx="78" cy="104" r="1.8"/><circle cx="73" cy="100" r="1.5"/></g>'
    +'</svg>';
  var REACT='<svg viewBox="0 0 60 60" width="100%" height="100%"><path d="M30 4 l6 14 l15 2 l-11 11 l3 15 l-13 -8 l-13 8 l3 -15 L9 20 l15 -2 z" fill="#F0A93C" opacity=".85"/><circle cx="30" cy="30" r="7" fill="#FFE07A"/></svg>';
  var FLASK='<svg viewBox="0 0 60 70" width="100%" height="100%"><path d="M24 4 h12 v20 l14 34 q3 8 -6 8 h-28 q-9 0 -6 -8 l14 -34 z" fill="none" stroke="#3BC0AA" stroke-width="3"/><path d="M17 48 h26 l5 12 q2 6 -4 6 h-28 q-6 0 -4 -6 z" fill="#3BC0AA" opacity=".55"/></svg>';
  var PLANE='<svg viewBox="0 0 60 34" width="100%" height="100%"><path d="M2 20 L58 2 L34 32 L26 22 z" fill="#F0C9A2"/><path d="M26 22 L58 2 L30 18 z" fill="#E88A5C"/></svg>';
  var CRANE='<svg viewBox="0 0 70 56" width="100%" height="100%"><path d="M8 44 L30 20 L40 34 L64 40 L40 44 L30 52 z" fill="#E88A5C"/><path d="M30 20 L36 4 L42 22 z" fill="#F0C9A2"/><path d="M30 20 L40 34 L40 44 L30 52 z" fill="#C25A2E"/></svg>';
  var INVADER='<svg viewBox="0 0 44 32" width="100%" height="100%"><g fill="#7BA3F5"><rect x="8" y="0" width="4" height="4"/><rect x="32" y="0" width="4" height="4"/><rect x="12" y="4" width="4" height="4"/><rect x="28" y="4" width="4" height="4"/><rect x="8" y="8" width="28" height="4"/><rect x="4" y="12" width="10" height="4"/><rect x="18" y="12" width="8" height="4"/><rect x="30" y="12" width="10" height="4"/><rect x="0" y="16" width="44" height="4"/><rect x="0" y="20" width="4" height="8"/><rect x="40" y="20" width="4" height="8"/><rect x="10" y="24" width="6" height="4"/><rect x="28" y="24" width="6" height="4"/></g></svg>';
  var LEAF_E='<svg viewBox="0 0 26 26" width="100%" height="100%"><path d="M3 23 q0 -18 20 -20 q-2 20 -20 20z" fill="#5FB87A"/><path d="M3 23 q8 -10 16 -14" stroke="#3C8455" stroke-width="1.6" fill="none"/></svg>';
  var FLAME_E='<svg viewBox="0 0 26 34" width="100%" height="100%"><path d="M13 2 q8 10 6 20 a7 7 0 0 1 -12 0 q-2 -10 6 -20z" fill="#F3A13C"/><path d="M13 14 q4 6 2 10 a3.5 3.5 0 0 1 -4 0 q-2 -4 2 -10z" fill="#FFE07A"/></svg>';
  var DROP_E='<svg viewBox="0 0 22 30" width="100%" height="100%"><path d="M11 2 q9 12 7 19 a7 7 0 0 1 -14 0 q-2 -7 7 -19z" fill="#2FA7D8"/><circle cx="8" cy="20" r="2.4" fill="#BFE3F5"/></svg>';
  function SPOT(col){ return '<svg viewBox="0 0 200 300" width="100%" height="100%" preserveAspectRatio="none"><polygon points="96,0 104,0 176,300 24,300" fill="'+col+'" opacity=".3"/></svg>'; }
  function build(world){
    layer=el('w4-bg');
    if(world==='godly'){
      layer.appendChild(el('w4-godrays'));
      layer.appendChild(el('w4-glow'));
      for(var i=0;i<16;i++){ var m=el('w4-mote','left:'+rnd(2,98).toFixed(1)+'vw;animation-duration:'+rnd(11,22).toFixed(1)+'s;animation-delay:-'+rnd(0,20).toFixed(1)+'s;width:'+rnd(3,7).toFixed(1)+'px;height:'+rnd(3,7).toFixed(1)+'px'); layer.appendChild(m); }
    } else if(world==='serpent'){
      layer.appendChild(el('w4-fog'));
      for(var s=0;s<3;s++) layer.appendChild(el('w4-snake','top:'+rnd(12,80).toFixed(1)+'vh;animation-duration:'+rnd(26,44).toFixed(1)+'s;animation-delay:-'+rnd(0,30).toFixed(1)+'s;opacity:'+rnd(.28,.5).toFixed(2), SNAKE));
      for(var bgi=0;bgi<7;bgi++) layer.appendChild(el('w4-bug','top:'+rnd(8,92).toFixed(1)+'vh;animation-duration:'+rnd(18,34).toFixed(1)+'s;animation-delay:-'+rnd(0,26).toFixed(1)+'s;width:'+rnd(16,30).toFixed(0)+'px;height:'+rnd(16,30).toFixed(0)+'px', BUG));
    } else if(world==='race'){
      layer.appendChild(el('w4-chequer'));
      layer.appendChild(el('w4-asphalt'));
      var cols=['#E0453A','#FFC83D','#3B6FE0','#2FA35C'];
      for(var ci=0;ci<4;ci++) layer.appendChild(el('w4-car','bottom:'+rnd(3,20).toFixed(1)+'vh;width:'+rnd(90,180).toFixed(0)+'px;animation-duration:'+rnd(4.5,9).toFixed(1)+'s;animation-delay:-'+rnd(0,8).toFixed(1)+'s;opacity:'+rnd(.4,.72).toFixed(2), carSVG(cols[ci%cols.length])));
      for(var li=0;li<10;li++) layer.appendChild(el('w4-line','top:'+rnd(6,92).toFixed(1)+'vh;width:'+rnd(60,190).toFixed(0)+'px;animation-duration:'+rnd(1.1,2.6).toFixed(2)+'s;animation-delay:-'+rnd(0,2).toFixed(2)+'s'));
    } else if(world==='dino'){
      layer.appendChild(el('w4-haze'));
      // a treeline of tall conifers, back row hazier than the front
      [['4vw','30vh',.30,'-2s'],['16vw','24vh',.22,'-4s'],['70vw','34vh',.34,'-1s'],['84vw','26vh',.24,'-5s'],['92vw','20vh',.18,'-3s']]
        .forEach(function(t){ layer.appendChild(el('w4-tree','left:'+t[0]+';height:'+t[1]+';width:calc('+t[1]+' * .42);opacity:'+t[2]+';animation-delay:'+t[3], TREE(240))); });
      layer.appendChild(el('w4-fern','left:-14px;animation-delay:-1s', FERN));
      layer.appendChild(el('w4-fern','right:-18px;animation-delay:-3s;width:150px', FERN));
      layer.appendChild(el('w4-ptero','animation-delay:-12s', PTERO));
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
      // the bees crossing the meadow are the app's own bee avatars, not stand-in doodles
      var hive=['bizzy','bumble','waggle','dronedan','queenhive','clover'];
      try{ if(window.SB_AVATARS) hive=hive.filter(function(id){ return SB_AVATARS.byId[id]; }); }catch(e){}
      for(var b1=0;b1<6;b1++){
        var art=BEE_S;
        try{ if(typeof SB_AVATAR==='function' && hive.length) art=SB_AVATAR(hive[b1%hive.length], Math.round(rnd(40,62))); }catch(e){}
        layer.appendChild(el('w4o-across','top:'+rnd(8,72).toFixed(1)+'vh;animation-duration:'+rnd(24,44).toFixed(1)+'s;animation-delay:-'+rnd(0,34).toFixed(1)+'s;opacity:.85', art));
      }
      for(var m1=0;m1<8;m1++) layer.appendChild(el('w4o-rise','left:'+rnd(2,98).toFixed(1)+'vw;width:5px;height:5px;background:#FFD34D;box-shadow:0 0 7px 2px rgba(255,211,77,.6);animation-duration:'+rnd(12,22).toFixed(1)+'s;animation-delay:-'+rnd(0,20).toFixed(1)+'s'));
    } else if(world==='marquee'){
      layer.appendChild(el('w4o-drape w4o-drapeL')); layer.appendChild(el('w4o-drape w4o-drapeR'));
      layer.appendChild(el('w4o-stagefloor')); layer.appendChild(el('w4o-bulbs'));
      layer.appendChild(el('w4o-swing','left:12vw;top:-4vh;width:26vw;height:70vh', SPOT('#F0B429')));
      layer.appendChild(el('w4o-swing','right:12vw;top:-4vh;width:26vw;height:70vh;animation-delay:-4.5s', SPOT('#F7E9C8')));
      for(var m2=0;m2<9;m2++) layer.appendChild(el('w4o-rise','left:'+rnd(8,92).toFixed(1)+'vw;width:4px;height:4px;background:#F6DC8A;box-shadow:0 0 6px 2px rgba(246,220,138,.55);animation-duration:'+rnd(13,24).toFixed(1)+'s;animation-delay:-'+rnd(0,20).toFixed(1)+'s'));
    } else if(world==='aurora'){
      layer.appendChild(el('w4o-nebula')); layer.appendChild(el('w4o-ribbon'));
      for(var st=0;st<26;st++) layer.appendChild(el('w4o-twk','left:'+rnd(2,98).toFixed(1)+'vw;top:'+rnd(2,88).toFixed(1)+'vh;width:'+rnd(2,4).toFixed(1)+'px;height:'+rnd(2,4).toFixed(1)+'px;animation-duration:'+rnd(1.6,4).toFixed(1)+'s;animation-delay:-'+rnd(0,3).toFixed(1)+'s'));
      layer.appendChild(el('w4o-shoot','right:6vw;top:12vh;animation-delay:-2s'));
      layer.appendChild(el('w4o-shoot','right:34vw;top:30vh;animation-delay:-6s'));
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
      layer.appendChild(el('','right:3vw;bottom:0;width:min(20vw,180px);height:auto;aspect-ratio:160/110;opacity:.45', TORII));
      for(var pt=0;pt<15;pt++) layer.appendChild(el('w4o-fall','left:'+rnd(2,98).toFixed(1)+'vw;width:'+rnd(10,17).toFixed(0)+'px;height:'+rnd(10,17).toFixed(0)+'px;opacity:.7;animation-duration:'+rnd(9,17).toFixed(1)+'s,'+rnd(2.4,4).toFixed(1)+'s;animation-delay:-'+rnd(0,14).toFixed(1)+'s,-'+rnd(0,3).toFixed(1)+'s', PETAL));
    } else if(world==='science'){
      layer.appendChild(el('w4o-pour','right:8vw;bottom:2vh;width:min(17vw,180px);aspect-ratio:1', POUR));
      [['8vw','#3BC0AA',34,74],['20vw','#B14FC4',26,58],['46vw','#F0A93C',38,66],['68vw','#2E8FB8',22,52]]
        .forEach(function(bk,i){ layer.appendChild(el('w4o-beaker','left:'+bk[0]+';width:'+bk[3]+'px;aspect-ratio:60/74;opacity:.'+(6+i%3), BEAKER(bk[1],bk[2]))); });
      layer.appendChild(el('w4o-react','left:22vw;bottom:16vh;width:34px;aspect-ratio:1', REACT));
      layer.appendChild(el('w4o-react','right:24vw;bottom:20vh;width:26px;aspect-ratio:1;animation-delay:-2.6s', REACT));
      layer.appendChild(el('w4o-graph')); layer.appendChild(el('w4o-mol','', '<svg viewBox="0 0 100 100" width="100%" height="100%"><g stroke="#3BC0AA" stroke-width="2.4" fill="none"><line x1="50" y1="50" x2="18" y2="30"/><line x1="50" y1="50" x2="82" y2="30"/><line x1="50" y1="50" x2="50" y2="86"/></g><circle cx="50" cy="50" r="9" fill="#0E8A78"/><circle cx="18" cy="30" r="7" fill="#3BC0AA"/><circle cx="82" cy="30" r="7" fill="#3BC0AA"/><circle cx="50" cy="86" r="7" fill="#7FD9C4"/></svg>'));
      layer.appendChild(el('','left:2vw;bottom:-6px;width:84px;height:auto;aspect-ratio:60/70;opacity:.5', FLASK));
      layer.appendChild(el('','right:3vw;bottom:-6px;width:52px;height:auto;aspect-ratio:60/70;opacity:.3;transform:scaleX(-1)', FLASK));
      for(var bu=0;bu<11;bu++) layer.appendChild(el('w4o-rise','left:'+rnd(2,98).toFixed(1)+'vw;width:'+rnd(5,11).toFixed(0)+'px;height:'+rnd(5,11).toFixed(0)+'px;background:transparent;border:2px solid rgba(59,192,170,.55);animation-duration:'+rnd(9,18).toFixed(1)+'s;animation-delay:-'+rnd(0,16).toFixed(1)+'s'));
    } else if(world==='origami'){
      layer.appendChild(el('w4o-facets'));
      for(var pl=0;pl<4;pl++) layer.appendChild(el('w4o-across','top:'+rnd(10,60).toFixed(1)+'vh;width:'+rnd(38,60).toFixed(0)+'px;animation-duration:'+rnd(26,44).toFixed(1)+'s;animation-delay:-'+rnd(0,30).toFixed(1)+'s;opacity:.6', PLANE));
      layer.appendChild(el('','left:3vw;bottom:0;width:76px;height:auto;aspect-ratio:70/56;opacity:.4', CRANE));
      for(var sq=0;sq<6;sq++) layer.appendChild(el('w4o-fall','left:'+rnd(4,96).toFixed(1)+'vw;width:'+rnd(8,13).toFixed(0)+'px;height:'+rnd(8,13).toFixed(0)+'px;background:'+(sq%2?'#E88A5C':'#F0C9A2')+';opacity:.5;animation-duration:'+rnd(11,20).toFixed(1)+'s,'+rnd(3,5).toFixed(1)+'s;animation-delay:-'+rnd(0,16).toFixed(1)+'s,0s'));
    } else if(world==='pixel'){
      layer.appendChild(el('w4o-scan')); layer.appendChild(el('w4o-crt'));
      for(var px=0;px<14;px++) layer.appendChild(el('w4o-fall','left:'+rnd(2,98).toFixed(1)+'vw;width:9px;height:9px;background:'+(px%3===0?'#7BA3F5':(px%3===1?'#FFD34D':'#36E0C8'))+';opacity:.55;animation-duration:'+rnd(8,16).toFixed(1)+'s,'+rnd(3,5).toFixed(1)+'s;animation-delay:-'+rnd(0,12).toFixed(1)+'s,0s'));
      layer.appendChild(el('w4o-across','top:8vh;width:46px;animation-duration:38s;opacity:.5', INVADER));
      layer.appendChild(el('w4o-across','top:22vh;width:34px;animation-duration:54s;animation-delay:-20s;opacity:.35', INVADER));
    } else if(world==='avatar'){
      ['w4o-el1','w4o-el2','w4o-el3','w4o-el4'].forEach(function(c){ layer.appendChild(el(c)); });
      for(var lf=0;lf<5;lf++) layer.appendChild(el('w4o-across','top:'+rnd(12,74).toFixed(1)+'vh;width:'+rnd(18,28).toFixed(0)+'px;animation-duration:'+rnd(18,34).toFixed(1)+'s;animation-delay:-'+rnd(0,26).toFixed(1)+'s;opacity:.6', LEAF_E));
      for(var dr=0;dr<4;dr++) layer.appendChild(el('w4o-fall','left:'+rnd(4,96).toFixed(1)+'vw;width:'+rnd(12,18).toFixed(0)+'px;height:auto;aspect-ratio:22/30;opacity:.55;animation-duration:'+rnd(9,15).toFixed(1)+'s,'+rnd(3,5).toFixed(1)+'s;animation-delay:-'+rnd(0,10).toFixed(1)+'s,0s', DROP_E));
      layer.appendChild(el('w4o-gleam','left:3vw;bottom:0;width:30px;height:auto;aspect-ratio:26/34', FLAME_E));
      layer.appendChild(el('w4o-gleam','right:4vw;bottom:0;width:24px;height:auto;aspect-ratio:26/34;animation-delay:-4s', FLAME_E));
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
