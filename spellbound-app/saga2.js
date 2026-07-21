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

  W().SB_SAGA_ENGINES = { honeycombRun };
})();
