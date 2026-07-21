/* Bizzing Bee — SAGA v2 · "Bizzy and the Great Unspelling" · Act I engines.
   Placeholder vector art (swaps for Claude Design drops). Words via gameWordsD/pickFresh; audio via voice/d + say(). */
(function(){
  const W=()=>window;
  function pool(n){ try{ return pickFresh(gameWordsD(),n)||[]; }catch(e){ return []; } }
  function dlg(key){ // play a dialogue clip if present, else nothing (text always shows)
    try{ const a=new Audio('voice/d/'+key+'.mp3'); a.play().catch(()=>{}); return a; }catch(e){ return null; } }

  /* ---------- ENGINE A · HONEYCOMB RUN (Pac-Man) ---------- */
  // grid maze; arrows/swipe; moth patrols; nectar dots; golden flower spell-cards.
  function honeycombRun(host, opts, done){
    const COLS=13, ROWS=11, CELL=Math.min(46, Math.floor(Math.min(innerWidth-20,620)/COLS));
    const MAZE=[ // 0 wall 1 dot 2 empty
      "0000000000000","0111111111110","0101010101010","0111111111110","0101010101010",
      "0111121111110","0101010101010","0111111111110","0101010101010","0111111111110","0000000000000"
    ].map(r=>r.split('').map(Number));
    const diff=opts.diff||'medium';
    const CFG={easy:{moths:2,speed:2.0,target:900,time:150},medium:{moths:3,speed:2.6,target:1200,time:180},
               hard:{moths:4,speed:3.1,target:1500,time:180},champ:{moths:5,speed:3.6,target:1800,time:180}}[diff];
    let bee={c:6,r:5,px:6,py:5,dir:[0,0],want:[0,0]};
    let moths=[], score=0, lives=3, t=CFG.time, jelly=null, flee=0, flower=null, flowerT=8, card=null, over=false;
    const words=pool(14); let wi=0;
    for(let i=0;i<CFG.moths;i++) moths.push({c:1+i*3%11,r:1,px:1+i*3%11,py:1,dir:[1,0]});
    // one royal jelly + dot bookkeeping
    let dots=0; MAZE.forEach(r=>r.forEach(v=>{ if(v===1) dots++; }));
    const J={c:11,r:9}; 
    host.innerHTML='<div class="sg-hud"><span id="sg-score">0</span><span id="sg-time"></span><span id="sg-lives"></span></div><canvas id="sg-cv"></canvas><div id="sg-card"></div>';
    const cv=host.querySelector('#sg-cv'); cv.width=COLS*CELL; cv.height=ROWS*CELL;
    const cx=cv.getContext('2d');
    const key=e=>{ const m={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[e.key]; if(m){ bee.want=m; e.preventDefault(); } };
    addEventListener('keydown',key);
    let tx=0,ty=0; cv.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;},{passive:true});
    cv.addEventListener('touchend',e=>{ const dx=e.changedTouches[0].clientX-tx, dy=e.changedTouches[0].clientY-ty;
      bee.want=Math.abs(dx)>Math.abs(dy)?[Math.sign(dx),0]:[0,Math.sign(dy)]; },{passive:true});
    function open(c,r){ return MAZE[r]&&MAZE[r][c]!==0; }
    function step(ent,sp){ // grid mover with desired-turn buffering
      const atC=Math.abs(ent.px-Math.round(ent.px))<0.08 && Math.abs(ent.py-Math.round(ent.py))<0.08;
      if(atC){ ent.px=Math.round(ent.px); ent.py=Math.round(ent.py);
        if(ent===bee && open(ent.px+bee.want[0], ent.py+bee.want[1])) ent.dir=bee.want.slice();
        if(!open(ent.px+ent.dir[0], ent.py+ent.dir[1])){ if(ent===bee) ent.dir=[0,0]; else {
          const ops=[[1,0],[-1,0],[0,1],[0,-1]].filter(d=>open(ent.px+d[0],ent.py+d[1])&&!(d[0]===-ent.dir[0]&&d[1]===-ent.dir[1]));
          ent.dir=ops[Math.floor(Math.random()*ops.length)]||[-ent.dir[0],-ent.dir[1]]; } }
        if(ent!==bee && Math.random()<0.25){ const ops=[[1,0],[-1,0],[0,1],[0,-1]].filter(d=>open(ent.px+d[0],ent.py+d[1])&&!(d[0]===-ent.dir[0]&&d[1]===-ent.dir[1]));
          if(ops.length) ent.dir=ops[Math.floor(Math.random()*ops.length)]; } }
      ent.px+=ent.dir[0]*sp/60; ent.py+=ent.dir[1]*sp/60;
    }
    function spellCard(){
      if(wi>=words.length) return; const w=words[wi++]; card={w,typed:'',t:10};
      const el=host.querySelector('#sg-card');
      el.innerHTML='<div class="sg-cardbox"><b>🌼 Spell to bloom!</b><div class="sg-cardw" id="sg-cw">🔊</div><input id="sg-ci" autocomplete="off" autocapitalize="off"><div id="sg-ct">10</div></div>';
      el.style.display='grid'; try{ say(w.w); }catch(e){}
      const inp=el.querySelector('#sg-ci'); inp.focus();
      inp.onkeydown=e=>{ if(e.key==='Enter'){ const ok=inp.value.trim().toLowerCase()===w.w.toLowerCase();
        score+=ok?150:0; if(ok){ try{flash('🌸 +150 — the meadow blooms!');}catch(_){} } el.style.display='none'; card=null; } };
      const tick=setInterval(()=>{ if(!card){ clearInterval(tick); return; } card.t--; el.querySelector('#sg-ct').textContent=card.t;
        if(card.t<=0){ clearInterval(tick); el.style.display='none'; card=null; } },1000);
    }
    let last=0, dotTimer=0;
    function frame(ts){
      if(over) return;
      if(card){ requestAnimationFrame(frame); return; } // paused during spell card
      const dt=Math.min(50, ts-last); last=ts;
      step(bee,CFG.speed*1.25); moths.forEach(m=>step(m, flee>0?CFG.speed*0.6:CFG.speed));
      flee=Math.max(0,flee-dt/1000);
      // collisions
      const bc=Math.round(bee.px), br=Math.round(bee.py);
      if(MAZE[br][bc]===1){ MAZE[br][bc]=2; score+=10; }
      if(J.c===bc&&J.r===br&&!J.got){ J.got=true; flee=6; }
      if(flower && Math.round(flower.c)===bc && Math.round(flower.r)===br){ flower=null; spellCard(); }
      moths.forEach(m=>{ if(Math.abs(m.px-bee.px)<0.5&&Math.abs(m.py-bee.py)<0.5){
        if(flee>0){ score+=50; m.px=6;m.py=1; } else { lives--; bee.px=6;bee.py=5;bee.dir=[0,0];
          if(lives<=0){ over=true; finish(false); } } } });
      // timers
      dotTimer+=dt/1000; if(dotTimer>=1){ dotTimer=0; t--; flowerT--; if(flowerT<=0&&!flower){ flowerT=20;
        let c,r; do{ c=1+Math.floor(Math.random()*(COLS-2)); r=1+Math.floor(Math.random()*(ROWS-2)); }while(!open(c,r));
        flower={c,r}; } if(t<=0){ over=true; finish(score>=CFG.target); } }
      draw(); requestAnimationFrame(frame);
    }
    function draw(){
      cx.fillStyle='#173222'; cx.fillRect(0,0,cv.width,cv.height);
      for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){ const v=MAZE[r][c];
        if(v===0){ cx.fillStyle='#0E2117'; cx.fillRect(c*CELL,r*CELL,CELL,CELL);
          cx.strokeStyle='#F0B42933'; cx.strokeRect(c*CELL+2,r*CELL+2,CELL-4,CELL-4); }
        else if(v===1){ cx.fillStyle='#F0B429'; cx.beginPath(); cx.arc(c*CELL+CELL/2,r*CELL+CELL/2,3,0,7); cx.fill(); } }
      if(!J.got){ cx.fillStyle='#FFE28A'; cx.beginPath(); cx.arc(J.c*CELL+CELL/2,J.r*CELL+CELL/2,8,0,7); cx.fill(); }
      if(flower){ cx.font=(CELL*0.7)+'px serif'; cx.fillText('🌼',flower.c*CELL+CELL*0.15,flower.r*CELL+CELL*0.8); }
      // bee placeholder: gold circle w/ stripes
      cx.fillStyle='#F0B429'; cx.beginPath(); cx.arc(bee.px*CELL+CELL/2,bee.py*CELL+CELL/2,CELL*0.34,0,7); cx.fill();
      cx.fillStyle='#2B2117'; cx.fillRect(bee.px*CELL+CELL*0.3,bee.py*CELL+CELL*0.34,CELL*0.4,CELL*0.09);
      moths.forEach(m=>{ cx.fillStyle=flee>0?'#8FA0F5':'#A39B8E'; cx.beginPath();
        cx.moveTo(m.px*CELL+CELL/2,m.py*CELL+CELL*0.2); cx.lineTo(m.px*CELL+CELL*0.2,m.py*CELL+CELL*0.8);
        cx.lineTo(m.px*CELL+CELL*0.8,m.py*CELL+CELL*0.8); cx.fill(); });
      host.querySelector('#sg-score').textContent='🍯 '+score+' / '+CFG.target;
      host.querySelector('#sg-time').textContent='⏱ '+Math.floor(t/60)+':'+String(t%60).padStart(2,'0');
      host.querySelector('#sg-lives').textContent='❤'.repeat(Math.max(0,lives));
    }
    function finish(win){ removeEventListener('keydown',key); done({win, score, stars: win?(score>=CFG.target*1.5?3:score>=CFG.target*1.2?2:1):0}); }
    requestAnimationFrame(frame);
    return { destroy(){ over=true; removeEventListener('keydown',key); } };
  }


  /* ---------- ENGINE B · KEEP FLYING (flappy) ---------- */
  function keepFlying(host, opts, done){
    const Wd=Math.min(innerWidth-16,640), Ht=Math.min(innerHeight-180,440);
    const diff=opts.diff||'medium';
    const CFG={easy:{gap:170,speed:2.2,pots:8},medium:{gap:150,speed:2.6,pots:10},
               hard:{gap:130,speed:3.0,pots:10},champ:{gap:115,speed:3.4,pots:12}}[diff];
    host.innerHTML='<div class="sg-hud"><span id="sg-pots">🍯 0/'+CFG.pots+'</span><span id="sg-lives"></span></div><canvas id="sg-cv"></canvas><div id="sg-card"></div>';
    const cv=host.querySelector('#sg-cv'); cv.width=Wd; cv.height=Ht; const cx=cv.getContext('2d');
    let bee={y:Ht/2,vy:0}, obs=[], pot=null, potIn=0, banked=0, lives=3, t=0, over=false, card=null;
    const words=pool(CFG.pots+4); let wi=0;
    const flap=e=>{ if(e.type==='keydown'&&e.key!==' ')return; bee.vy=-5.4; e.preventDefault&&e.preventDefault(); };
    addEventListener('keydown',flap); cv.addEventListener('pointerdown',flap);
    function spawn(){ const g=CFG.gap, y=60+Math.random()*(Ht-120-g); obs.push({x:Wd+30,y,g}); }
    function spellStop(){
      const w=words[wi++%words.length]; card={w};
      const el=host.querySelector('#sg-card');
      el.innerHTML='<div class="sg-cardbox"><b>🍯 Honey pot! Spell to bank it</b><div class="sg-cardw">🔊</div><input id="sg-ci" autocomplete="off" autocapitalize="off"></div>';
      el.style.display='grid'; try{ say(w.w); }catch(e){}
      const inp=el.querySelector('#sg-ci'); inp.focus();
      inp.onkeydown=e=>{ if(e.key==='Enter'){ const ok=inp.value.trim().toLowerCase()===w.w.toLowerCase();
        if(ok){ banked++; try{flash('🍯 Pot banked! '+banked+'/'+CFG.pots);}catch(_){}}else{ bee.y=Math.min(Ht-40,bee.y+60); try{flash('Almost! The pot floats ahead…');}catch(_){} }
        el.style.display='none'; card=null;
        if(banked>=CFG.pots){ over=true; finish(true); } } };
    }
    let last=0, spawnT=0, potT=4;
    function frame(ts){ if(over) return;
      if(card){ requestAnimationFrame(frame); return; }
      const dt=Math.min(50,ts-last); last=ts; t+=dt/1000; spawnT+=dt/1000; potT-=dt/1000;
      bee.vy+=0.28; bee.y+=bee.vy;
      if(spawnT>1.9){ spawnT=0; spawn(); }
      if(potT<=0&&!pot){ potT=8; pot={x:Wd+30,y:Ht-70}; }
      obs.forEach(o=>o.x-=CFG.speed); if(pot) pot.x-=CFG.speed;
      obs=obs.filter(o=>o.x>-40);
      // collide
      obs.forEach(o=>{ if(o.x<70&&o.x>10){ if(bee.y<o.y||bee.y>o.y+o.g){ hit(); o.x=-99; } } });
      if(bee.y>Ht-14||bee.y<8) hit();
      if(pot&&pot.x<70&&pot.x>10&&bee.y>Ht-110){ pot=null; spellStop(); }
      if(pot&&pot.x<=-30) pot=null;
      draw(); requestAnimationFrame(frame);
    }
    function hit(){ lives--; bee.y=Ht/2; bee.vy=0; if(lives<=0){ over=true; finish(false); } }
    function draw(){
      const grd=cx.createLinearGradient(0,0,0,Ht); grd.addColorStop(0,'#8FCBEF'); grd.addColorStop(1,'#DFF0FA');
      cx.fillStyle=grd; cx.fillRect(0,0,Wd,Ht);
      cx.fillStyle='#4A7A3A'; obs.forEach(o=>{ cx.fillRect(o.x,0,44,o.y); cx.fillRect(o.x,o.y+o.g,44,Ht-o.y-o.g); });
      if(pot){ cx.font='30px serif'; cx.fillText('🍯',pot.x,pot.y+40); cx.fillStyle='#8A6A2A'; cx.fillRect(pot.x-8,Ht-24,52,10); }
      cx.fillStyle='#F0B429'; cx.beginPath(); cx.arc(60,bee.y,15,0,7); cx.fill();
      cx.fillStyle='#2B2117'; cx.fillRect(50,bee.y-2,20,4);
      cx.fillStyle='#FFFFFFAA'; cx.beginPath(); cx.ellipse(66,bee.y-12,8,5,-0.6,0,7); cx.fill();
      host.querySelector('#sg-pots').textContent='🍯 '+banked+'/'+CFG.pots;
      host.querySelector('#sg-lives').textContent='❤'.repeat(Math.max(0,lives));
    }
    function finish(win){ removeEventListener('keydown',flap); done({win,score:banked*100,stars:win?(lives>=3?3:lives===2?2:1):0}); }
    requestAnimationFrame(frame);
    return { destroy(){ over=true; removeEventListener('keydown',flap); } };
  }

  /* ---------- ENGINE D · WORD HIVE (make words from a big word) ---------- */
  function wordHive(host, opts, done){
    const BIG=(opts.big||'THUNDERSTORM').toUpperCase();
    const diff=opts.diff||'medium';
    const CFG={easy:{target:12,time:360},medium:{target:20,time:300},hard:{target:24,time:300},champ:{target:28,time:270}}[diff];
    const counts={}; BIG.split('').forEach(ch=>counts[ch]=(counts[ch]||0)+1);
    const found=[]; let cells=0, t=CFG.time, over=false;
    const dict=(()=>{ try{ const s=new Set(); (window.SB_FULL||[]).forEach(w=>{ if(typeof w==='string') s.add(w.toUpperCase()); else if(w&&w.w) s.add(w.w.toUpperCase()); }); return s; }catch(e){ return new Set(); } })();
    host.innerHTML='<div class="sg-hud"><span id="sg-cells">🐝 0/'+CFG.target+' comb</span><span id="sg-time"></span></div>'+
      '<div class="sg-bigword">'+BIG.split('').map(c=>'<span class="sg-tile">'+c+'</span>').join('')+'</div>'+
      '<input id="sg-hi" placeholder="type a word + Enter" autocomplete="off" autocapitalize="off">'+
      '<div id="sg-found" class="sg-found"></div>';
    const inp=host.querySelector('#sg-hi'); inp.focus();
    function canMake(w){ const c={...counts}; for(const ch of w){ if(!c[ch]) return false; c[ch]--; } return true; }
    inp.onkeydown=e=>{ if(e.key!=='Enter') return; const w=inp.value.trim().toUpperCase(); inp.value='';
      if(w.length<3) return note(w+' — too short (3+)');
      if(w===BIG) return note('The big word itself doesn\u2019t count!');
      if(found.includes(w)) return note(w+' — already found');
      if(!canMake(w)) return note(w+' — letters aren\u2019t in '+BIG);
      if(dict.size&&!dict.has(w)) return note(w+' — not in the dictionary');
      found.push(w); const v=w.length>=5?3:w.length===4?2:1; cells+=v;
      host.querySelector('#sg-found').innerHTML=found.map(f=>'<span class="sg-fw">'+f+'</span>').join('');
      host.querySelector('#sg-cells').textContent='🐝 '+Math.min(cells,CFG.target)+'/'+CFG.target+' comb';
      try{flash('+'+v+' comb — '+w);}catch(_){}
      if(cells>=CFG.target){ over=true; finish(true); } };
    function note(m){ try{flash(m);}catch(_){} }
    const tick=setInterval(()=>{ if(over){ clearInterval(tick); return; } t--;
      host.querySelector('#sg-time').textContent='⏳ '+Math.floor(t/60)+':'+String(t%60).padStart(2,'0');
      if(t<=0){ over=true; clearInterval(tick); finish(cells>=CFG.target); } },1000);
    function finish(win){ done({win,score:cells*20,stars:win?(t>CFG.time*0.4?3:t>CFG.time*0.15?2:1):0}); }
    return { destroy(){ over=true; clearInterval(tick); } };
  }

  W().SB_SAGA_ENGINES = { honeycombRun, keepFlying, wordHive };
})();
