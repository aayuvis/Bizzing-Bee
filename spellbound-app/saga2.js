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


  /* ---------- ENGINE C · BEE GRAND PRIX (side-view racer) ---------- */
  function beeGrandPrix(host, opts, done){
    const Wd=Math.min(innerWidth-16,640), Ht=340, LANES=4, LANE_H=64, TRACK=3200; // px per lap
    const diff=opts.diff||'medium';
    const CFG={easy:{ai:2.0,laps:2},medium:{ai:2.5,laps:3},hard:{ai:2.9,laps:3},champ:{ai:3.3,laps:3}}[diff];
    host.innerHTML='<div class="sg-hud"><span id="sg-lap">Lap 1/'+CFG.laps+'</span><span id="sg-pos"></span><span id="sg-nitro"></span></div>'+
      '<canvas id="sg-cv"></canvas><div class="sg-race-word" id="sg-rw"></div>';
    const cv=host.querySelector('#sg-cv'); cv.width=Wd; cv.height=Ht; const cx=cv.getContext('2d');
    const racers=[
      {name:'You', lane:1, x:0, spd:0, base:2.6, col:'#F0B429', you:true, nitro:0, boost:0},
      {name:'Bumble', lane:0, x:0, spd:0, base:CFG.ai*0.98, col:'#E8912D'},
      {name:'Waggle', lane:2, x:0, spd:0, base:CFG.ai*1.0, col:'#C8B26A'},
      {name:'Drone Dan', lane:3, x:0, spd:0, base:CFG.ai*1.02, col:'#8A8A8A'}];
    const hazards=[]; for(let i=0;i<10;i++) hazards.push({x:400+i*300+Math.random()*120, lane:Math.floor(Math.random()*LANES)});
    const words=pool(12); let wi=0, curWord=null, typed='', over=false;
    function nextWord(){ curWord=words[wi++%words.length]; typed='';
      host.querySelector('#sg-rw').innerHTML='🔊 <b>Spell for nitro:</b> <span id="sg-rt"></span>'; try{ say(curWord.w); }catch(e){} }
    const key=e=>{ const me=racers[0];
      if(e.key==='ArrowUp'){ me.lane=Math.max(0,me.lane-1); e.preventDefault(); }
      else if(e.key==='ArrowDown'){ me.lane=Math.min(LANES-1,me.lane+1); e.preventDefault(); }
      else if(e.key==='Enter'){ if(curWord && typed.trim().toLowerCase()===curWord.w.toLowerCase()){ me.nitro=Math.min(3,me.nitro+1); try{flash('⚡ Nitro banked!');}catch(_){} } nextWord(); }
      else if(e.key===' '){ if(me.nitro>0){ me.nitro--; me.boost=1.6; } e.preventDefault(); }
      else if(e.key==='Backspace'){ typed=typed.slice(0,-1); }
      else if(/^[a-zA-Z-]$/.test(e.key)){ typed+=e.key; }
      const rt=host.querySelector('#sg-rt'); if(rt) rt.textContent=typed; };
    addEventListener('keydown',key);
    cv.addEventListener('pointerdown',e=>{ const r=cv.getBoundingClientRect(); const y=e.clientY-r.top;
      const me=racers[0]; me.lane=Math.max(0,Math.min(LANES-1,Math.floor(y/LANE_H))); });
    nextWord();
    let last=0;
    function frame(ts){ if(over) return; const dt=Math.min(50,ts-last)/16.7; last=ts;
      racers.forEach(r=>{
        let sp=r.base;
        if(r.you){ sp=2.6+(r.boost>0?2.2:0); r.boost=Math.max(0,r.boost-dt/60); }
        else if(Math.random()<0.004) r.lane=Math.max(0,Math.min(LANES-1,r.lane+(Math.random()<0.5?-1:1)));
        // rubber band
        if(!r.you){ const lead=racers[0].x-r.x; sp+= lead>200?0.4: lead<-200?-0.3:0; }
        // hazards slow
        hazards.forEach(h=>{ const hx=h.x%TRACK; const rx=r.x%TRACK; if(Math.abs(hx-rx)<26 && h.lane===r.lane) sp*=0.45; });
        r.x+=sp*dt; });
      const me=racers[0];
      if(me.x>=TRACK*CFG.laps){ over=true; finish(); return; }
      draw(); requestAnimationFrame(frame); }
    function draw(){
      cx.fillStyle='#7FBF6A'; cx.fillRect(0,0,Wd,Ht);
      for(let l=0;l<LANES;l++){ cx.fillStyle=l%2?'#8FCF7A':'#86C772'; cx.fillRect(0,40+l*LANE_H,Wd,LANE_H); }
      cx.strokeStyle='#FFFFFF88'; for(let l=0;l<=LANES;l++){ cx.beginPath(); cx.moveTo(0,40+l*LANE_H); cx.lineTo(Wd,40+l*LANE_H); cx.stroke(); }
      const me=racers[0], camX=me.x-120;
      hazards.forEach(h=>{ for(let lap=0;lap<CFG.laps;lap++){ const sx=h.x+lap*TRACK-camX; if(sx>-30&&sx<Wd+30){ cx.font='22px serif'; cx.fillText('☁️',sx,40+h.lane*LANE_H+40); } } });
      // finish line each lap
      for(let lap=1;lap<=CFG.laps;lap++){ const fx=lap*TRACK-camX; if(fx>-10&&fx<Wd+10){ cx.fillStyle='#2B2117'; cx.fillRect(fx,40,6,LANES*LANE_H); } }
      racers.forEach(r=>{ const sx=r.x-camX, sy=40+r.lane*LANE_H+LANE_H/2;
        if(sx>-40&&sx<Wd+40){ cx.fillStyle=r.col; cx.beginPath(); cx.arc(sx,sy,14,0,7); cx.fill();
          cx.fillStyle='#2B2117'; cx.fillRect(sx-9,sy-2,18,4);
          if(r.you&&r.boost>0){ cx.fillStyle='#36D1FF'; cx.fillRect(sx-26,sy-3,12,6); } } });
      const order=[...racers].sort((a,b)=>b.x-a.x); const pos=order.indexOf(me)+1;
      host.querySelector('#sg-lap').textContent='Lap '+Math.min(CFG.laps,1+Math.floor(me.x/TRACK))+'/'+CFG.laps;
      host.querySelector('#sg-pos').textContent=['🥇','🥈','🥉','4th'][pos-1];
      host.querySelector('#sg-nitro').textContent='⚡'.repeat(me.nitro);
    }
    function finish(){ removeEventListener('keydown',key);
      const order=[...racers].sort((a,b)=>b.x-a.x); const pos=order.indexOf(racers[0])+1;
      done({win:pos===1, score:(5-pos)*250, stars:pos===1?3:pos===2?2:pos===3?1:0}); }
    requestAnimationFrame(frame);
    return { destroy(){ over=true; removeEventListener('keydown',key); } };
  }

  /* ---------- ENGINE E · WHACK-A-MOTH ---------- */
  function whackAMoth(host, opts, done){
    const diff=opts.diff||'medium';
    const CFG={easy:{words:6,up:1500,time:90},medium:{words:8,up:1200,time:90},hard:{words:9,up:950,time:85},champ:{words:10,up:800,time:80}}[diff];
    const words=pool(CFG.words+2).filter(w=>w.w.length<=9); let wi=0, cur=null, li=0, t=CFG.time, doneWords=0, over=false;
    host.innerHTML='<div class="sg-hud"><span id="sg-w">Word 1/'+CFG.words+'</span><span id="sg-time"></span></div>'+
      '<div class="sg-target" id="sg-target"></div><div class="sg-molegrid" id="sg-grid"></div>';
    const grid=host.querySelector('#sg-grid');
    for(let i=0;i<12;i++){ const c=document.createElement('button'); c.className='sg-cell'; c.dataset.i=i; grid.appendChild(c); }
    function newWord(){ if(wi>=words.length||doneWords>=CFG.words){ over=true; finish(true); return; }
      cur=words[wi++]; li=0; renderTarget(); try{ say(cur.w); }catch(e){} }
    function renderTarget(){ host.querySelector('#sg-target').innerHTML=cur.w.split('').map((ch,i)=>
      '<span class="sg-tl'+(i<li?' done':i===li?' next':'')+'">'+(i<li?ch.toUpperCase():'•')+'</span>').join('');
      host.querySelector('#sg-w').textContent='Word '+(doneWords+1)+'/'+CFG.words; }
    let pops=[];
    function pop(){ if(over) return;
      const need=cur.w[li]; const cells=[...grid.children].filter(c=>!c.dataset.on);
      if(!cells.length) return;
      const c=cells[Math.floor(Math.random()*cells.length)];
      const golden=Math.random()<0.08;
      const showNeed=Math.random()<0.45;
      const ch=golden?'★':showNeed?need:String.fromCharCode(97+Math.floor(Math.random()*26));
      c.dataset.on='1'; c.dataset.ch=ch; c.dataset.g=golden?'1':'';
      c.innerHTML='<span class="sg-moth'+(golden?' gold':'')+'">🦋<b>'+ch.toUpperCase()+'</b></span>';
      setTimeout(()=>{ if(c.dataset.on){ c.dataset.on=''; c.innerHTML=''; } }, CFG.up+(golden?400:0));
    }
    grid.onclick=e=>{ const c=e.target.closest('.sg-cell'); if(!c||!c.dataset.on||over) return;
      const ch=c.dataset.ch, golden=c.dataset.g==='1';
      c.dataset.on=''; c.innerHTML='💥';setTimeout(()=>{ if(c.innerHTML==='💥') c.innerHTML=''; },260);
      if(golden){ t+=5; try{flash('★ Golden moth! +5s');}catch(_){} return; }
      if(ch===cur.w[li]){ li++; if(li>=cur.w.length){ doneWords++; try{flash('✓ '+cur.w.toUpperCase());}catch(_){} newWord(); } else renderTarget(); }
      else { t-=3; try{flash('Wrong moth! −3s');}catch(_){} } };
    const popT=setInterval(pop, 520);
    const tick=setInterval(()=>{ if(over){ clearInterval(tick); clearInterval(popT); return; } t--;
      host.querySelector('#sg-time').textContent='⏱ '+t+'s';
      if(t<=0){ over=true; clearInterval(tick); clearInterval(popT); finish(doneWords>=CFG.words); } },1000);
    newWord();
    function finish(win){ done({win,score:doneWords*100+t*2,stars:win?(t>25?3:t>10?2:1):0}); }
    return { destroy(){ over=true; clearInterval(popT); clearInterval(tick); } };
  }

  W().SB_SAGA_ENGINES = { honeycombRun, keepFlying, wordHive, beeGrandPrix, whackAMoth };
})();
