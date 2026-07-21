/* Bizzing Bee — SAGA v2 · "Bizzy and the Great Unspelling" · Act I engines.
   Placeholder vector art (swaps for Claude Design drops). Words via gameWordsD/pickFresh; audio via voice/d + say(). */
(function(){
  const W=()=>window;
  function pool(n){ try{ return pickFresh(gameWordsD(),n)||[]; }catch(e){ return []; } }
  function dlg(key){ // play a dialogue clip if present, else nothing (text always shows)
    try{ const a=new Audio('voice/d/'+key+'.mp3'); a.play().catch(()=>{}); return a; }catch(e){ return null; } }

  /* Rasterise a SAGA_ART sprite into a canvas-drawable <img> (cached). Returns the
     loaded image, or null while it loads / if the sprite is missing. Lets the
     canvas engines draw the real Claude Design art instead of primitive shapes. */
  const _imgCache={};
  function sgImg(name){
    if(name in _imgCache) return _imgCache[name];
    _imgCache[name]=null;
    const a=(window.SAGA_ART||{})[name]; if(!a) return null;
    const f=(a.frames&&a.frames[0])||a.svg||'';
    const vb=(a.vb||'0 0 120 120'), p=String(vb).split(/\s+/), w=(+p[2])||120, h=(+p[3])||120;
    // width/height are REQUIRED — without them the SVG <img> has 0 intrinsic size
    // and canvas drawImage() throws, which would kill the game loop.
    const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="'+vb+'">'+f+'</svg>';
    const img=new Image(w,h);
    img.onload=()=>{ _imgCache[name]=img; };
    img.onerror=()=>{ _imgCache[name]=false; };  // never retry a broken sprite
    img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
    return null;
  }
  function sgPreload(names){ (names||[]).forEach(sgImg); }

  /* Rasterise a collectible AVATAR (window.SB_AVATAR) into a canvas-drawable <img>
     (cached by id). This is how the games show the REAL characters — Bizzy, the
     bee racers, the villains — instead of primitive blobs. */
  const _avCache={};
  function avImg(id){
    if(!id) return null;
    if(id in _avCache) return _avCache[id];
    _avCache[id]=null;
    try{
      if(typeof window.SB_AVATAR!=='function') return null;
      let svg=window.SB_AVATAR(id,120,{outline:false});   // outline via CSS filter doesn't rasterise reliably
      if(!svg) { _avCache[id]=false; return null; }
      if(!/xmlns=/.test(svg)) svg=svg.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ');
      const img=new Image(120,120);
      img.onload=()=>{ _avCache[id]=img; };
      img.onerror=()=>{ _avCache[id]=false; };
      img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
    }catch(e){ _avCache[id]=false; }
    return null;
  }
  // The player's equipped avatar — but only if it actually has art; else Bizzy.
  function heroAv(){ try{ const id=(typeof active==='function' && active() && active().avatar);
    if(id && typeof window.SB_AVATAR==='function' && window.SB_AVATAR(id,40)) return id; }catch(e){}
    return 'bizzy'; }

  /* Rasterise a full WORLD_ART background plate (rich Claude Design illustration)
     into a canvas-drawable <img>, cached by id. This is how a game gets a real
     illustrated backdrop instead of a flat colour fill. */
  const _wCache={};
  function worldImg(id){
    if(!id) return null;
    if(id in _wCache) return _wCache[id];
    _wCache[id]=null;
    const a=(window.WORLD_ART||{})[id]; if(!a){ _wCache[id]=false; return null; }
    const vb=a.vb||'0 0 320 180', p=String(vb).split(/\s+/), w=(+p[2])||320, h=(+p[3])||180;
    const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="'+vb+'">'+(a.svg||'')+'</svg>';
    const img=new Image(w,h);
    img.onload=()=>{ _wCache[id]=img; };
    img.onerror=()=>{ _wCache[id]=false; };
    img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
    return null;
  }
  // Draw a world plate to fill a rect, cover-fit (crop, no distortion). Returns true if drawn.
  function drawWorld(cx,id,x,y,w,h){
    const im=worldImg(id); if(!im) return false;
    try{ const ir=im.width/im.height, rr=w/h; let sw,sh,sx,sy;
      if(ir>rr){ sh=im.height; sw=sh*rr; sx=(im.width-sw)/2; sy=0; }
      else { sw=im.width; sh=sw/rr; sx=0; sy=(im.height-sh)/2; }
      cx.drawImage(im,sx,sy,sw,sh,x,y,w,h); return true;
    }catch(e){ return false; }
  }

  /* A polished vector moth drawn straight onto the canvas — dusty scalloped wings,
     a fuzzy body, feathered antennae, and a soft blue glow when it's edible.
     Far cleaner than an emoji or a flat triangle. */
  function drawMoth(cx,x,y,size,edible,ph){
    const cxp=x+size/2, cyp=y+size/2, s=size*0.5, flap=0.82+0.18*Math.sin((ph||0));
    cx.save(); cx.translate(cxp,cyp);
    if(edible){ const g=cx.createRadialGradient(0,0,2,0,0,s*1.15); g.addColorStop(0,'rgba(120,150,255,.55)'); g.addColorStop(1,'rgba(120,150,255,0)');
      cx.fillStyle=g; cx.beginPath(); cx.arc(0,0,s*1.15,0,7); cx.fill(); }
    const wing=edible?'#9DB0FF':'#B7ADA0', wing2=edible?'#7C93F5':'#948A7C', spot=edible?'#5B6FD8':'#6E655A';
    // four wings (upper big, lower small), mirrored
    for(const sgn of [-1,1]){ cx.save(); cx.scale(sgn*flap,1);
      cx.fillStyle=wing; cx.beginPath();
      cx.moveTo(0,-s*0.1); cx.bezierCurveTo(s*0.5,-s*0.95, s*1.05,-s*0.55, s*0.95,-s*0.02);
      cx.bezierCurveTo(s*1.02,s*0.15, s*0.7,s*0.28, 0,s*0.12); cx.closePath(); cx.fill();
      cx.fillStyle=wing2; cx.beginPath();
      cx.moveTo(0,s*0.06); cx.bezierCurveTo(s*0.42,s*0.2, s*0.66,s*0.6, s*0.5,s*0.86);
      cx.bezierCurveTo(s*0.34,s*0.98, s*0.12,s*0.6, 0,s*0.28); cx.closePath(); cx.fill();
      cx.fillStyle=spot; cx.beginPath(); cx.arc(s*0.6,-s*0.42,s*0.13,0,7); cx.fill();
      cx.restore(); }
    // body
    cx.fillStyle=edible?'#3D4EA8':'#4A423A';
    cx.beginPath(); cx.ellipse(0,0,s*0.16,s*0.5,0,0,7); cx.fill();
    // head + antennae
    cx.beginPath(); cx.arc(0,-s*0.5,s*0.15,0,7); cx.fill();
    cx.strokeStyle=edible?'#3D4EA8':'#4A423A'; cx.lineWidth=Math.max(1.4,s*0.05); cx.lineCap='round';
    cx.beginPath(); cx.moveTo(-s*0.05,-s*0.58); cx.quadraticCurveTo(-s*0.34,-s*0.9,-s*0.42,-s*0.72);
    cx.moveTo(s*0.05,-s*0.58); cx.quadraticCurveTo(s*0.34,-s*0.9,s*0.42,-s*0.72); cx.stroke();
    // eyes
    cx.fillStyle='#FFFFFF'; cx.beginPath(); cx.arc(-s*0.06,-s*0.52,s*0.045,0,7); cx.arc(s*0.06,-s*0.52,s*0.045,0,7); cx.fill();
    cx.restore();
  }

  /* ---------- ENGINE A · HONEYCOMB RUN (Pac-Man) ---------- */
  // grid maze; arrows/swipe; moth patrols; nectar dots; golden flower spell-cards.
  function honeycombRun(host, opts, done){
    const COLS=13, ROWS=11, CELL=Math.min(46, Math.floor(Math.min(innerWidth-20,620)/COLS));
    const MAZE=[ // 0 wall 1 dot 2 empty
      "0000000000000","0111111111110","0101010101010","0111111111110","0101010101010",
      "0111121111110","0101010101010","0111111111110","0101010101010","0111111111110","0000000000000"
    ].map(r=>r.split('').map(Number));
    const diff=opts.diff||'medium';
    const world=opts.world||'meadow';   // rich Claude Design backdrop plate
    const CFG={easy:{moths:2,speed:2.0,target:900,time:150},medium:{moths:3,speed:2.6,target:1200,time:180},
               hard:{moths:4,speed:3.1,target:1500,time:180},champ:{moths:5,speed:3.6,target:1800,time:180}}[diff];
    let bee={c:6,r:5,px:6,py:5,dir:[0,0],want:[0,0]};
    let moths=[], score=0, lives=3, t=CFG.time, jelly=null, flee=0, flower=null, flowerT=5, card=null, over=false, fx=[];
    // Celebratory splash — petal burst + shockwave ring + "+1 LIFE" pop, drawn in the loop.
    function spawnSplash(){ const cw=cv.width, ch=cv.height, N=28, cols=['#F0B429','#FF7FB0','#8FA0F5','#4FC98A','#FFD13F'];
      for(let i=0;i<N;i++){ const a=(i/N)*Math.PI*2+Math.random()*0.4, sp=2.4+Math.random()*4.2;
        fx.push({x:cw/2,y:ch/2,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-1.4,rot:Math.random()*7,vr:(Math.random()-0.5)*0.4,life:1,col:cols[i%cols.length]}); }
      fx.push({ring:true,x:cw/2,y:ch/2,r:8,life:1});
      fx.push({ring:true,x:cw/2,y:ch/2,r:8,life:1.3,slow:1});
      fx.push({text:'+1 LIFE  ❤',x:cw/2,y:ch/2-4,life:1.5}); }
    const words=pool(14); let wi=0;
    for(let i=0;i<CFG.moths;i++) moths.push({c:1+i*3%11,r:1,px:1+i*3%11,py:1,dir:[1,0]});
    // one royal jelly + dot bookkeeping
    let dots=0; MAZE.forEach(r=>r.forEach(v=>{ if(v===1) dots++; }));
    const J={c:11,r:9}; 
    host.innerHTML='<div class="sg-hud"><span id="sg-score">0</span><span id="sg-time"></span><span id="sg-lives"></span></div><canvas id="sg-cv"></canvas>'+
      '<div class="sg-dpad" id="sg-dpad">'+
        '<button class="sg-dbtn" data-d="up" aria-label="Up">▲</button>'+
        '<div class="sg-dmid"><button class="sg-dbtn" data-d="left" aria-label="Left">◀</button>'+
        '<button class="sg-dbtn" data-d="down" aria-label="Down">▼</button>'+
        '<button class="sg-dbtn" data-d="right" aria-label="Right">▶</button></div>'+
      '</div><div id="sg-card"></div>';
    const cv=host.querySelector('#sg-cv'); cv.width=COLS*CELL; cv.height=ROWS*CELL;
    const cx=cv.getContext('2d');
    const DIR={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
    const key=e=>{ if(card) return;                       // spelling box open — let the letters through
      const tg=e.target; if(tg&&(tg.tagName==='INPUT'||tg.tagName==='TEXTAREA'||tg.isContentEditable)) return;
      const m={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],
      w:[0,-1],s:[0,1],a:[-1,0],d:[1,0],W:[0,-1],S:[0,1],A:[-1,0],D:[1,0]}[e.key]; if(m){ bee.want=m; e.preventDefault(); } };
    addEventListener('keydown',key);
    // on-screen D-pad — tablet controls (press-and-hold friendly)
    const pad=host.querySelector('#sg-dpad');
    const setDir=b=>{ if(card) return; const m=DIR[b&&b.dataset&&b.dataset.d]; if(m){ bee.want=m.slice(); } };
    pad.addEventListener('click',e=>setDir(e.target.closest('.sg-dbtn')));
    pad.addEventListener('pointerdown',e=>{ const b=e.target.closest('.sg-dbtn'); if(b){ setDir(b); e.preventDefault(); } },{passive:false});
    let tx=0,ty=0; cv.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;},{passive:true});
    cv.addEventListener('touchend',e=>{ const dx=e.changedTouches[0].clientX-tx, dy=e.changedTouches[0].clientY-ty;
      bee.want=Math.abs(dx)>Math.abs(dy)?[Math.sign(dx),0]:[0,Math.sign(dy)]; },{passive:true});
    function open(c,r){ return MAZE[r]&&MAZE[r][c]!==0; }
    function step(ent,sp){ // grid mover with desired-turn buffering
      const spd=sp/60, thr=spd*0.6;   // snap window MUST be smaller than the per-frame step, or the bee vibrates in place
      const atC=Math.abs(ent.px-Math.round(ent.px))<thr && Math.abs(ent.py-Math.round(ent.py))<thr;
      if(atC){ ent.px=Math.round(ent.px); ent.py=Math.round(ent.py);
        if(ent===bee && open(ent.px+bee.want[0], ent.py+bee.want[1])) ent.dir=bee.want.slice();
        if(!open(ent.px+ent.dir[0], ent.py+ent.dir[1])){ if(ent===bee) ent.dir=[0,0]; else {
          const ops=[[1,0],[-1,0],[0,1],[0,-1]].filter(d=>open(ent.px+d[0],ent.py+d[1])&&!(d[0]===-ent.dir[0]&&d[1]===-ent.dir[1]));
          ent.dir=ops[Math.floor(Math.random()*ops.length)]||[-ent.dir[0],-ent.dir[1]]; } }
        if(ent!==bee && Math.random()<0.25){ const ops=[[1,0],[-1,0],[0,1],[0,-1]].filter(d=>open(ent.px+d[0],ent.py+d[1])&&!(d[0]===-ent.dir[0]&&d[1]===-ent.dir[1]));
          if(ops.length) ent.dir=ops[Math.floor(Math.random()*ops.length)]; } }
      ent.px+=ent.dir[0]*spd; ent.py+=ent.dir[1]*spd;
    }
    function spellCard(){
      if(wi>=words.length) wi=0; const w=words[wi++]; card={w,typed:'',t:12};
      const el=host.querySelector('#sg-card');
      el.innerHTML='<div class="sg-cardbox"><b>🌼 Spell it to bloom — earn time &amp; coins!</b><button class="sg-cardw" id="sg-cw">🔊</button><div class="sg-inrow"><input id="sg-ci" autocomplete="off" autocapitalize="off"><button class="sg-rbtn go" id="sg-cgo">Bloom</button></div><div id="sg-ct">12</div></div>';
      el.style.display='grid'; try{ say(w.w); }catch(e){}
      const inp=el.querySelector('#sg-ci'); inp.focus();
      function submit(){ const ok=inp.value.trim().toLowerCase()===w.w.toLowerCase();
        if(ok){ score+=150; t+=15; lives=Math.min(5,lives+1); try{ if(typeof addCoins==='function') addCoins(20); }catch(_){}
          el.style.display='none'; card=null; spawnSplash();
          try{flash('🌸 +1 life ❤ · +150 · +15 seconds · +20 🪙 — the meadow blooms!');}catch(_){} return; }
        else { try{flash('Not quite — the moth got that one.');}catch(_){} }
        el.style.display='none'; card=null; }
      inp.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); submit(); } };
      el.querySelector('#sg-cgo').onclick=submit;
      el.querySelector('#sg-cw').onclick=()=>{ try{ say(w.w); }catch(e){} };
      const tick=setInterval(()=>{ if(!card){ clearInterval(tick); return; } card.t--; el.querySelector('#sg-ct').textContent=card.t;
        if(card.t<=0){ clearInterval(tick); el.style.display='none'; card=null; } },1000);
    }
    let last=Date.now(), dotTimer=0, loop=null;
    function frame(){
      if(over){ if(loop){ clearInterval(loop); loop=null; } return; }
      try{
        if(!card){                                   // paused during a spell card
          const now=Date.now(), dt=Math.min(50, now-last); last=now;
          step(bee,CFG.speed*1.25); moths.forEach(m=>step(m, flee>0?CFG.speed*0.6:CFG.speed));
          flee=Math.max(0,flee-dt/1000);
          const bc=Math.round(bee.px), br=Math.round(bee.py);
          if(MAZE[br]&&MAZE[br][bc]===1){ MAZE[br][bc]=2; score+=10; dots--;
            if(dots<=0){ over=true; finish(true); return; } }          // maze cleared → win the round
          if(J.c===bc&&J.r===br&&!J.got){ J.got=true; flee=6; }
          if(flower && Math.round(flower.c)===bc && Math.round(flower.r)===br){ flower=null; spellCard(); }
          moths.forEach(m=>{ if(Math.abs(m.px-bee.px)<0.5&&Math.abs(m.py-bee.py)<0.5){
            if(flee>0){ score+=50; m.px=6;m.py=1; } else { lives--; bee.px=6;bee.py=5;bee.dir=[0,0];
              if(lives<=0){ over=true; finish(false); } } } });
          dotTimer+=dt/1000; if(dotTimer>=1){ dotTimer=0; t--; flowerT--; if(flowerT<=0&&!flower){ flowerT=9;
            let c,r,tries=0; do{ c=1+Math.floor(Math.random()*(COLS-2)); r=1+Math.floor(Math.random()*(ROWS-2)); }while(!open(c,r)&&++tries<50);
            flower={c,r}; }
            if(Math.random()<0.16 && moths.length<CFG.moths+6){ moths.push({c:6,r:1,px:6,py:1,dir:[[1,0],[-1,0]][Math.floor(Math.random()*2)]}); }  // random moth spam
            if(t<=0){ over=true; finish(score>=CFG.target); } }
          draw();
        }
      }catch(err){ /* never let a render/logic error stop the loop — the bee must keep moving */ }
    }
    function draw(){
      cx.clearRect(0,0,cv.width,cv.height);
      const rrect=(x,y,w,h,rad)=>{ if(cx.roundRect){ cx.beginPath(); cx.roundRect(x,y,w,h,rad); } else { cx.beginPath(); cx.moveTo(x+rad,y); cx.arcTo(x+w,y,x+w,y+h,rad); cx.arcTo(x+w,y+h,x,y+h,rad); cx.arcTo(x,y+h,x,y,rad); cx.arcTo(x,y,x+w,y,rad); cx.closePath(); } };
      // rich illustrated backdrop (Claude Design world plate), softened so the maze reads on top
      if(!drawWorld(cx,world,0,0,cv.width,cv.height)){ cx.fillStyle='#8FCF7A'; cx.fillRect(0,0,cv.width,cv.height); }
      cx.fillStyle='rgba(30,22,60,.28)'; cx.fillRect(0,0,cv.width,cv.height);   // scrim for contrast
      // walls as translucent honeycomb tiles; paths let the backdrop shine through
      for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){ const v=MAZE[r][c];
        if(v===0){ cx.fillStyle='rgba(240,180,41,.30)'; rrect(c*CELL+3,r*CELL+3,CELL-6,CELL-6,CELL*0.3); cx.fill();
          cx.strokeStyle='rgba(255,214,110,.55)'; cx.lineWidth=1.5; cx.stroke(); }
        else if(v===1){ cx.fillStyle='#FFCF3F'; cx.beginPath(); cx.arc(c*CELL+CELL/2,r*CELL+CELL/2,3.6,0,7); cx.fill();
          cx.fillStyle='rgba(255,255,255,.7)'; cx.beginPath(); cx.arc(c*CELL+CELL/2-1,r*CELL+CELL/2-1,1.2,0,7); cx.fill(); } }
      if(!J.got){ cx.fillStyle='#FFE28A'; cx.beginPath(); cx.arc(J.c*CELL+CELL/2,J.r*CELL+CELL/2,8,0,7); cx.fill();
        cx.strokeStyle='#F0B429'; cx.lineWidth=2; cx.stroke(); }
      if(flower){ const fi=sgImg('env-meadow'); cx.font=(CELL*0.72)+'px serif'; cx.fillText('🌼',flower.c*CELL+CELL*0.14,flower.r*CELL+CELL*0.8); }
      // moths — the delivered grey-moth sprite (blue glow when edible); vector moth as fallback
      const mi=sgImg('grey-moth'), _ph=Date.now()/90;
      moths.forEach((m,i)=>{ const mx=m.px*CELL, my=m.py*CELL;
        if(flee>0){ cx.fillStyle='rgba(120,150,255,.45)'; cx.beginPath(); cx.arc(mx+CELL/2,my+CELL/2,CELL*0.44,0,7); cx.fill(); }
        let md=false; if(mi){ try{ const s=CELL*0.96, bob=Math.sin(_ph+i)*CELL*0.03; cx.drawImage(mi,mx+(CELL-s)/2,my+(CELL-s)/2+bob,s,s); md=true; }catch(e){} }
        if(!md) drawMoth(cx,mx+CELL*0.04,my+CELL*0.04,CELL*0.92,flee>0,_ph+i); });
      // bee — the delivered Bizzy sprite (flips with direction); avatar then blob as fallback
      const bi=sgImg('bizzy-side-fly')||avImg(heroAv())||avImg('bizzy'), bx=bee.px*CELL, by=bee.py*CELL; let beeDrew=false;
      if(bi){ try{ const bob=1+0.05*Math.sin(Date.now()/110), s=CELL*1.12*bob;
        cx.save(); cx.translate(bx+CELL/2,by+CELL/2);
        if(bee.dir[0]<0) cx.scale(-1,1);              // flip when flying left
        cx.drawImage(bi,-s/2,-s/2,s,s); cx.restore(); beeDrew=true; }catch(e){ try{cx.restore();}catch(_){} } }
      if(!beeDrew){ cx.fillStyle='#F0B429'; cx.beginPath(); cx.arc(bx+CELL/2,by+CELL/2,CELL*0.34,0,7); cx.fill();
        cx.fillStyle='#2B2117'; cx.fillRect(bx+CELL*0.3,by+CELL*0.34,CELL*0.4,CELL*0.09); }
      // celebratory splash particles (bloom burst on a correct spelling)
      if(fx.length){
        for(let i=fx.length-1;i>=0;i--){ const f=fx[i]; f.life-=0.025;
          if(f.life<=0){ fx.splice(i,1); continue; }
          if(f.ring){ f.r+=f.slow?4:8; cx.strokeStyle='rgba(255,209,63,'+Math.max(0,Math.min(1,f.life))+')'; cx.lineWidth=5;
            cx.beginPath(); cx.arc(f.x,f.y,f.r,0,7); cx.stroke(); }
          else if(f.text){ f.y-=1.3; const a=Math.max(0,Math.min(1,f.life));
            cx.save(); cx.globalAlpha=a; cx.textAlign='center'; cx.textBaseline='middle';
            cx.font='800 '+Math.floor(CELL*0.9)+'px Sono, ui-monospace, monospace';
            cx.lineWidth=6; cx.strokeStyle='rgba(255,255,255,.95)'; cx.strokeText(f.text,f.x,f.y);
            cx.fillStyle='#E5533D'; cx.fillText(f.text,f.x,f.y); cx.restore(); }
          else { f.x+=f.vx; f.y+=f.vy; f.vy+=0.14; f.vx*=0.99; f.rot+=f.vr;
            cx.save(); cx.globalAlpha=Math.max(0,Math.min(1,f.life)); cx.translate(f.x,f.y); cx.rotate(f.rot);
            cx.fillStyle=f.col; cx.beginPath(); cx.ellipse(0,0,4.5,8,0,0,7); cx.fill();
            cx.fillStyle='rgba(255,255,255,.5)'; cx.beginPath(); cx.ellipse(-1,-2,1.6,3,0,0,7); cx.fill(); cx.restore(); }
        }
      }
      host.querySelector('#sg-score').textContent='🍯 '+score+' / '+CFG.target;
      host.querySelector('#sg-time').textContent='⏱ '+Math.floor(t/60)+':'+String(t%60).padStart(2,'0');
      host.querySelector('#sg-lives').textContent='❤'.repeat(Math.max(0,lives));
    }
    function finish(win){ if(loop){ clearInterval(loop); loop=null; } removeEventListener('keydown',key);
      const stars=win?(score>=CFG.target*1.5?3:score>=CFG.target*1.2?2:1):0; endCard(win,stars); }
    function endCard(win,stars){
      const el=host.querySelector('#sg-card'); if(!el){ done({win,score,stars}); return; }
      el.innerHTML='<div class="sg-cardbox sg-endcard">'
        +'<div style="font:800 26px var(--display,serif);margin-bottom:4px">'+(win?'🏆 Round clear!':'🌙 Out of time')+'</div>'
        +'<div style="font-size:26px;letter-spacing:4px;margin:2px 0">'+('★'.repeat(stars)+'☆'.repeat(3-stars))+'</div>'
        +'<div style="font-size:15px;color:var(--muted,#7A6E5C);margin-bottom:12px">🍯 '+score+' honey collected'+(win?' — the meadow is free!':'')+'</div>'
        +'<div class="sg-inrow" style="max-width:340px"><button class="sg-rbtn" id="sg-again">↻ Play again</button>'
        +'<button class="sg-rbtn go" id="sg-cont">'+(win?'Continue →':'Back to map')+'</button></div></div>';
      el.style.display='grid';
      el.querySelector('#sg-again').onclick=()=>{ el.style.display='none'; el.innerHTML=''; honeycombRun(host,opts,done); };
      el.querySelector('#sg-cont').onclick=()=>{ el.style.display='none'; el.innerHTML=''; done({win,score,stars}); };
    }
    loop=setInterval(frame, 1000/60);
    return { destroy(){ over=true; if(loop){ clearInterval(loop); loop=null; } removeEventListener('keydown',key); } };
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
      el.innerHTML='<div class="sg-cardbox"><b>🍯 Honey pot! Spell to bank it</b><button class="sg-cardw" id="sg-cspk">🔊</button><div class="sg-inrow"><input id="sg-ci" autocomplete="off" autocapitalize="off"><button class="sg-rbtn go" id="sg-cgo">Bank</button></div></div>';
      el.style.display='grid'; try{ say(w.w); }catch(e){}
      const inp=el.querySelector('#sg-ci'); inp.focus();
      function submit(){ const ok=inp.value.trim().toLowerCase()===w.w.toLowerCase();
        if(ok){ banked++; try{flash('🍯 Pot banked! '+banked+'/'+CFG.pots);}catch(_){}}else{ bee.y=Math.min(Ht-40,bee.y+60); try{flash('Almost! The pot floats ahead…');}catch(_){} }
        el.style.display='none'; card=null;
        if(banked>=CFG.pots){ over=true; finish(true); } }
      inp.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); submit(); } };
      el.querySelector('#sg-cgo').onclick=submit;
      el.querySelector('#sg-cspk').onclick=()=>{ try{ say(w.w); }catch(e){} };
    }
    let last=0, spawnT=0, potT=4;
    function frame(ts){ if(over) return;
      if(card){ requestAnimationFrame(frame); return; }
      const dt=Math.min(50,ts-last); last=ts; t+=dt/1000; potT-=dt/1000;
      const GRACE=t<3;                                   // 3 s of free flight before gravity
      if(GRACE){ bee.vy*=0.88; bee.y+=bee.vy; bee.y=Math.max(30,Math.min(Ht-40,bee.y)); }
      else { spawnT+=dt/1000; bee.vy+=0.196; bee.y+=bee.vy; }   // gravity −30% (was 0.28)
      if(spawnT>1.9){ spawnT=0; spawn(); }
      if(potT<=0&&!pot){ potT=8; pot={x:Wd+30,y:Ht-70}; }
      obs.forEach(o=>o.x-=CFG.speed); if(pot) pot.x-=CFG.speed;
      obs=obs.filter(o=>o.x>-40);
      // collide (no crashing during the grace window)
      if(!GRACE){ obs.forEach(o=>{ if(o.x<70&&o.x>10){ if(bee.y<o.y||bee.y>o.y+o.g){ hit(); o.x=-99; } } });
        if(bee.y>Ht-14||bee.y<8) hit(); }
      if(pot&&pot.x<70&&pot.x>10&&bee.y>Ht-110){ pot=null; spellStop(); }
      if(pot&&pot.x<=-30) pot=null;
      draw(); requestAnimationFrame(frame);
    }
    function hit(){ lives--; bee.y=Ht/2; bee.vy=0; if(lives<=0){ over=true; finish(false); } }
    function draw(){
      // rich sky backdrop (Claude Design open-sky plate); gradient fallback
      if(!drawWorld(cx,'opensky',0,0,Wd,Ht)){ const grd=cx.createLinearGradient(0,0,0,Ht); grd.addColorStop(0,'#8FCBEF'); grd.addColorStop(1,'#DFF0FA');
        cx.fillStyle=grd; cx.fillRect(0,0,Wd,Ht); }
      // honeycomb pillars instead of flat green pipes
      obs.forEach(o=>{ const pil=(yy,hh)=>{ const g=cx.createLinearGradient(o.x,0,o.x+44,0); g.addColorStop(0,'#F0B429'); g.addColorStop(1,'#D89614');
        cx.fillStyle=g; cx.fillRect(o.x,yy,44,hh); cx.fillStyle='rgba(255,255,255,.18)'; cx.fillRect(o.x,yy,7,hh);
        cx.strokeStyle='rgba(120,80,10,.45)'; cx.lineWidth=2; cx.strokeRect(o.x,yy,44,hh); };
        pil(0,o.y); pil(o.y+o.g,Ht-o.y-o.g); });
      if(pot){ const pi=sgImg('artifact-quill-glow')||sgImg('gem-act1'); let pd=false;
        if(pi){ try{ cx.drawImage(pi,pot.x-6,pot.y,44,44); pd=true; }catch(e){} }
        if(!pd){ cx.font='30px serif'; cx.fillText('🍯',pot.x,pot.y+40); } }
      // delivered Bizzy sprite (side-fly), tilts with vertical velocity
      const bi=sgImg('bizzy-side-fly')||avImg(heroAv()); let bd=false;
      if(bi){ try{ const s=42, tilt=Math.max(-0.5,Math.min(0.5,bee.vy/14));
        cx.save(); cx.translate(60,bee.y); cx.rotate(tilt); cx.drawImage(bi,-s/2,-s/2,s,s); cx.restore(); bd=true; }catch(e){ try{cx.restore();}catch(_){} } }
      if(!bd){ cx.fillStyle='#F0B429'; cx.beginPath(); cx.arc(60,bee.y,15,0,7); cx.fill();
        cx.fillStyle='#2B2117'; cx.fillRect(50,bee.y-2,20,4); }
      // grace-window cue: free flight, gravity counts in
      if(t<3){ const n=Math.ceil(3-t);
        cx.save(); cx.textAlign='center'; cx.globalAlpha=0.92;
        cx.font='800 22px Fraunces, serif'; cx.fillStyle='#fff'; cx.strokeStyle='rgba(20,20,50,.55)'; cx.lineWidth=4;
        cx.strokeText('Free flight — gravity in '+n, Wd/2, 42); cx.fillText('Free flight — gravity in '+n, Wd/2, 42);
        cx.restore(); }
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
    const art=(window.SGART&&SGART.ready());
    const plate=art?SGART.plateForWorld(opts.world||'Hive'):'';
    host.innerHTML='<div class="sg-hud"><span id="sg-cells">🐝 0/'+CFG.target+' comb</span><span id="sg-time"></span></div>'+
      '<div class="sg-hivestage"><div class="sg-hive-bg">'+plate+'</div>'+
      '<div class="sg-bigword">'+BIG.split('').map(c=>'<span class="sg-tile">'+c+'</span>').join('')+'</div></div>'+
      '<div class="sg-inrow"><input id="sg-hi" placeholder="type a word" autocomplete="off" autocapitalize="off">'+
      '<button class="sg-rbtn go" id="sg-hgo">Add</button></div>'+
      '<div id="sg-found" class="sg-found"></div>';
    const inp=host.querySelector('#sg-hi'); inp.focus();
    function canMake(w){ const c={...counts}; for(const ch of w){ if(!c[ch]) return false; c[ch]--; } return true; }
    function submit(){ const w=inp.value.trim().toUpperCase(); inp.value=''; try{inp.focus();}catch(e){}
      if(w.length<3) return note(w+' — too short (3+)');
      if(w===BIG) return note('The big word itself doesn\u2019t count!');
      if(found.includes(w)) return note(w+' — already found');
      if(!canMake(w)) return note(w+' — letters aren\u2019t in '+BIG);
      if(dict.size&&!dict.has(w)) return note(w+' — not in the dictionary');
      found.push(w); const v=w.length>=5?3:w.length===4?2:1; cells+=v;
      host.querySelector('#sg-found').innerHTML=found.map(f=>'<span class="sg-fw">'+f+'</span>').join('');
      host.querySelector('#sg-cells').textContent='🐝 '+Math.min(cells,CFG.target)+'/'+CFG.target+' comb';
      try{flash('+'+v+' comb — '+w);}catch(_){}
      if(cells>=CFG.target){ over=true; finish(true); } }
    inp.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); submit(); } };
    host.querySelector('#sg-hgo').onclick=submit;
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
      '<canvas id="sg-cv"></canvas>'+
      '<div class="sg-race-word" id="sg-rw"><button class="sg-rbtn" id="sg-rspk" aria-label="Hear the word">🔊</button>'+
      '<input id="sg-ri" class="sg-rin" placeholder="type what you hear" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" inputmode="text">'+
      '<button class="sg-rbtn go" id="sg-rgo">Go</button><button class="sg-rbtn boost" id="sg-rboost">⚡</button></div>'+
      '<div class="sg-lanebtns"><button class="sg-dbtn" data-l="-1" aria-label="Move up a lane">▲</button><button class="sg-dbtn" data-l="1" aria-label="Move down a lane">▼</button></div>';
    const cv=host.querySelector('#sg-cv'); cv.width=Wd; cv.height=Ht; const cx=cv.getContext('2d');
    const racers=[
      {name:'You', lane:1, x:0, spd:0, base:2.6, col:'#F0B429', you:true, nitro:0, boost:0, av:heroAv()},
      {name:'Bumble', lane:0, x:0, spd:0, base:CFG.ai*0.98, col:'#E8912D', av:'bumble'},
      {name:'Waggle', lane:2, x:0, spd:0, base:CFG.ai*1.0, col:'#C8B26A', av:'waggle'},
      {name:'Drone Dan', lane:3, x:0, spd:0, base:CFG.ai*1.02, col:'#8A8A8A', av:'drone'}];
    const hazards=[]; for(let i=0;i<10;i++) hazards.push({x:400+i*300+Math.random()*120, lane:Math.floor(Math.random()*LANES)});
    const words=pool(12); let wi=0, curWord=null, typed='', over=false;
    const inp=host.querySelector('#sg-ri');
    function nextWord(){ curWord=words[wi++%words.length]; typed=''; if(inp) inp.value=''; try{ say(curWord.w); }catch(e){} }
    function bank(){ const me=racers[0]; const val=(inp?inp.value:typed).trim().toLowerCase();
      if(curWord && val===curWord.w.toLowerCase()){ me.nitro=Math.min(3,me.nitro+1); try{flash('⚡ Nitro banked!');}catch(_){} }
      nextWord(); if(inp) inp.focus(); }
    function boost(){ const me=racers[0]; if(me.nitro>0){ me.nitro--; me.boost=1.6; } }
    function laneShift(d){ const me=racers[0]; me.lane=Math.max(0,Math.min(LANES-1,me.lane+d)); }
    if(inp){ inp.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); bank(); } }; setTimeout(()=>{ try{inp.focus();}catch(e){} },60); }
    host.querySelector('#sg-rgo').onclick=bank;
    host.querySelector('#sg-rboost').onclick=boost;
    host.querySelector('#sg-rspk').onclick=()=>{ try{ if(curWord) say(curWord.w); }catch(e){} };
    host.querySelector('.sg-lanebtns').onclick=e=>{ const b=e.target.closest('[data-l]'); if(b) laneShift(+b.dataset.l); };
    const key=e=>{ if(e.key==='ArrowUp'){ laneShift(-1); e.preventDefault(); }
      else if(e.key==='ArrowDown'){ laneShift(1); e.preventDefault(); }
      else if(e.key===' ' && e.target!==inp){ boost(); e.preventDefault(); } };
    addEventListener('keydown',key);
    cv.addEventListener('pointerdown',e=>{ const r=cv.getBoundingClientRect(); const y=e.clientY-r.top;
      const me=racers[0]; me.lane=Math.max(0,Math.min(LANES-1,Math.floor((y-40)/LANE_H))); });
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
        if(sx>-40&&sx<Wd+40){
          if(r.you&&r.boost>0){ cx.fillStyle='#36D1FF'; cx.beginPath(); cx.ellipse(sx-24,sy,16,6,0,0,7); cx.fill();
            cx.fillStyle='rgba(54,209,255,.4)'; cx.beginPath(); cx.ellipse(sx-34,sy,10,4,0,0,7); cx.fill(); }
          // delivered kart sprites — Bizzy's kart for the player, rally kart for rivals
          const ki=sgImg(r.you?'bizzy-kart':'kart-rally'); const sz=LANE_H*0.92;
          let drew=false; if(ki){ try{ cx.drawImage(ki,sx-sz/2,sy-sz/2,sz,sz); drew=true; }catch(e){} }
          if(!drew){ const ai=avImg(r.av); if(ai){ try{ cx.drawImage(ai,sx-20,sy-20,40,40); drew=true; }catch(e){} } }
          if(!drew){ cx.fillStyle=r.col; cx.beginPath(); cx.arc(sx,sy,14,0,7); cx.fill();
            cx.fillStyle='#2B2117'; cx.fillRect(sx-9,sy-2,18,4); }
        } });
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
    const art=(window.SGART&&SGART.ready());
    const mothArt=art?SGART.sprite('grey-moth',{cls:'sg-mothimg'}):'🦋';
    const plate=art?SGART.plateForWorld(opts.world||'Hive'):'';
    host.innerHTML='<div class="sg-hud"><span id="sg-w">Word 1/'+CFG.words+'</span><span id="sg-time"></span></div>'+
      '<div class="sg-target" id="sg-target"></div><div class="sg-mothstage"><div class="sg-moth-bg">'+plate+'</div><div class="sg-molegrid" id="sg-grid"></div></div>';
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
      c.innerHTML='<span class="sg-moth'+(golden?' gold':'')+'">'+(golden?'⭐':mothArt)+'<b>'+ch.toUpperCase()+'</b></span>';
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


  /* ---------- ENGINE F · SPELL-SHIELD (boss duel vs The Smudge) ---------- */
  function spellShield(host, opts, done){
    const diff=opts.diff||'medium';
    const CFG={easy:{hexes:6,t:14},medium:{hexes:8,t:12},hard:{hexes:9,t:10},champ:{hexes:10,t:9}}[diff];
    const words=pool(CFG.hexes+6).filter(w=>w.w.length>=4&&w.w.length<=10);
    let phase=1, hexes=0, broken=0, wi=0, over=false, cur=null, timer=null;
    const art=(window.SGART&&SGART.ready());
    const foe=opts.foe||'smudge-swarm';
    const plate=art?SGART.plateForWorld(opts.world||'Hive Gates'):'';
    const bossArt=art?SGART.sprite(foe,{cls:'sg-bossimg'}):'🦋🦋🦋<br>🦋🦋🦋🦋';
    host.innerHTML='<div class="sg-boss"><div class="sg-boss-bg">'+plate+'</div>'+
      '<div class="sg-bossface" id="sg-bf">'+bossArt+'</div>'+
      '<div class="sg-shieldwall" id="sg-sw"></div>'+
      '<div class="sg-duel"><div id="sg-scramble" class="sg-scramble"></div>'+
      '<div class="sg-inrow"><input id="sg-di" autocomplete="off" autocapitalize="off" placeholder="type the word">'+
      '<button class="sg-rbtn go" id="sg-dgo">Cast</button></div>'+
      '<div id="sg-dt" class="sg-dtimer"></div></div></div>';
    const sw=host.querySelector('#sg-sw');
    function wall(){ sw.innerHTML=Array.from({length:CFG.hexes},(_,i)=>
      '<span class="sg-hex'+(i<hexes?' up':'')+'">⬡</span>').join(''); }
    function scramble(w){ const a=w.split(''); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
      const s=a.join(''); return s===w?scramble(w):s; }
    function next(){
      if(over) return;
      if(phase===1 && hexes>=CFG.hexes){ phase=2; host.querySelector('#sg-bf').classList.add('dive'); try{flash('⚔️ The Smudge dives! Three words by ear alone!');}catch(_){} }
      if(phase===2 && wi>=words.length-3+3){ /* handled in check */ }
      cur=words[wi++]; if(!cur){ over=true; done({win:true,score:hexes*100,stars:3}); return; }
      let t=CFG.t;
      const sc=host.querySelector('#sg-scramble');
      if(phase===1){ sc.textContent=scramble(cur.w.toLowerCase()); }
      else { sc.textContent='🔊 listen…'; }
      try{ say(cur.w); }catch(e){}
      host.querySelector('#sg-dt').textContent=t;
      clearInterval(timer);
      timer=setInterval(()=>{ if(over){ clearInterval(timer); return; } t--; host.querySelector('#sg-dt').textContent=t;
        if(t<=0){ clearInterval(timer); hit(); } },1000);
    }
    function hit(){ if(phase===1&&hexes>0){ hexes--; wall(); } broken++;
      try{flash('💥 A shield hex shatters!');}catch(_){}
      if(broken>=4){ over=true; clearInterval(timer); done({win:false,score:hexes*50,stars:0}); return; }
      next(); }
    const inp=host.querySelector('#sg-di'); inp.focus();
    let p2right=0;
    function cast(){ if(over) return;
      const ok=inp.value.trim().toLowerCase()===cur.w.toLowerCase(); inp.value=''; try{inp.focus();}catch(e){}
      clearInterval(timer);
      if(ok){ if(phase===1){ hexes++; wall(); try{flash('⬡ Shield hex forged!');}catch(_){} }
        else { p2right++; try{flash('⚡ The Quill fires! '+p2right+'/3');}catch(_){}
          if(p2right>=3){ over=true; done({win:true,score:hexes*100+300,stars:broken===0?3:broken<=2?2:1}); return; } } }
      else hit();
      if(!over) next(); }
    inp.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); cast(); } };
    host.querySelector('#sg-dgo').onclick=cast;
    wall(); next();
    return { destroy(){ over=true; clearInterval(timer); } };
  }

  /* ---------- ENGINE I · WORD SNAKE (steer Bizzy to spell in order) ---------- */
  function wordSnake(host, opts, done){
    const COLS=15, ROWS=11, CELL=Math.min(42, Math.floor(Math.min(innerWidth-20,620)/COLS));
    const world=opts.world||'meadow', diff=opts.diff||'medium';
    const CFG={easy:{words:3,tick:210},medium:{words:4,tick:185},hard:{words:5,tick:160},champ:{words:6,tick:140}}[diff];
    const bank=pool(CFG.words+8).map(w=>w.w).filter(w=>/^[a-z]+$/i.test(w)&&w.length>=3&&w.length<=8);
    if(bank.length<1) bank.push('bloom','honey','flower','nectar');
    host.innerHTML='<div class="sg-hud"><span id="sg-score">0</span><span id="sg-word"></span><span id="sg-lives"></span></div>'+
      '<canvas id="sg-cv"></canvas>'+
      '<div class="sg-dpad" id="sg-dpad"><button class="sg-dbtn" data-d="up" aria-label="Up">▲</button>'+
      '<div class="sg-dmid"><button class="sg-dbtn" data-d="left" aria-label="Left">◀</button>'+
      '<button class="sg-dbtn" data-d="down" aria-label="Down">▼</button>'+
      '<button class="sg-dbtn" data-d="right" aria-label="Right">▶</button></div></div><div id="sg-card"></div>';
    const cv=host.querySelector('#sg-cv'); cv.width=COLS*CELL; cv.height=ROWS*CELL; const cx=cv.getContext('2d');
    let snake,dir,ndir,word='',spelled=0,tiles=[],wordsDone=0,score=0,lives=3,over=false,bonk=0,tick=CFG.tick,loop=null,fx=[];
    function occupied(x,y,extra){ for(let i=0;i<snake.length;i++) if(snake[i].x===x&&snake[i].y===y) return true;
      for(let i=0;i<(extra||[]).length;i++) if(extra[i].x===x&&extra[i].y===y) return true; return false; }
    function layoutWord(){ word=bank[wordsDone%bank.length]; spelled=0; tiles=[];
      const head=snake[0], ring=[]; for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++) ring.push({x:(head.x+dx+COLS)%COLS,y:(head.y+dy+ROWS)%ROWS});
      for(let k=0;k<word.length;k++){ let x,y,tries=0; do{ x=Math.floor(Math.random()*COLS); y=Math.floor(Math.random()*ROWS); }
        while((occupied(x,y,ring)||tiles.some(t=>t.x===x&&t.y===y))&&++tries<200);
        tiles.push({x,y,ch:word[k],idx:k}); }
      renderWord(); try{ say(word); }catch(e){} }
    function renderWord(){ host.querySelector('#sg-word').innerHTML=word.split('').map((ch,i)=>
      '<span style="font-family:var(--mono,monospace);font-weight:800;font-size:16px;letter-spacing:1px;color:'+(i<spelled?'#2FA35C':i===spelled?'#F0B429':'rgba(255,255,255,.5)')+'">'+(i<spelled?ch.toUpperCase():'·')+'</span>').join(''); }
    function setHud(){ host.querySelector('#sg-score').textContent='⭐ '+score; host.querySelector('#sg-lives').textContent='❤'.repeat(Math.max(0,lives)); }
    function reset(){ const cxm=Math.floor(COLS/2), cym=Math.floor(ROWS/2);
      snake=[{x:cxm,y:cym},{x:cxm-1,y:cym},{x:cxm-2,y:cym}]; dir={x:1,y:0}; ndir={x:1,y:0}; layoutWord(); setHud(); }
    function spawnSplash(txt){ const cw=cv.width, ch=cv.height, cols=['#F0B429','#FF7FB0','#8FA0F5','#4FC98A'];
      for(let i=0;i<20;i++){ const a=(i/20)*Math.PI*2, sp=2+Math.random()*3.5;
        fx.push({x:cw/2,y:ch/2,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-1,rot:0,vr:(Math.random()-0.5)*0.4,life:1,col:cols[i%4]}); }
      fx.push({ring:true,x:cw/2,y:ch/2,r:8,life:1}); if(txt) fx.push({text:txt,x:cw/2,y:ch/2-4,life:1.4}); }
    function loseLife(){ lives--; setHud(); if(lives<=0){ finish(false); return; }
      bonk=3; const cxm=Math.floor(COLS/2), cym=Math.floor(ROWS/2); snake=[{x:cxm,y:cym},{x:cxm-1,y:cym},{x:cxm-2,y:cym}]; dir={x:1,y:0}; ndir={x:1,y:0}; }
    function step(){ if(over) return; dir=ndir; const h=snake[0], nx=(h.x+dir.x+COLS)%COLS, ny=(h.y+dir.y+ROWS)%ROWS;
      for(let i=0;i<snake.length-1;i++) if(snake[i].x===nx&&snake[i].y===ny){ loseLife(); return; }
      snake.unshift({x:nx,y:ny}); let grew=false;
      for(let t=0;t<tiles.length;t++){ if(tiles[t].x===nx&&tiles[t].y===ny){
        if(tiles[t].idx===spelled){ spelled++; score+=15; grew=true; tiles.splice(t,1);
          if(spelled>=word.length){ wordsDone++; score+=40; spawnSplash('✓ '+word.toUpperCase());
            try{ if(typeof addCoins==='function') addCoins(10); }catch(e){}
            if(wordsDone>=CFG.words){ finish(true); return; }
            if(tick>110) tick-=8; layoutWord(); } else renderWord(); }
        else { bonk=2; } break; } }
      if(!grew) snake.pop(); setHud(); }
    function roundRect(x,y,w,h,r){ cx.beginPath(); cx.moveTo(x+r,y); cx.arcTo(x+w,y,x+w,y+h,r); cx.arcTo(x+w,y+h,x,y+h,r); cx.arcTo(x,y+h,x,y,r); cx.arcTo(x,y,x+w,y,r); cx.closePath(); }
    function draw(){
      cx.clearRect(0,0,cv.width,cv.height);
      if(!drawWorld(cx,world,0,0,cv.width,cv.height)){ cx.fillStyle='#8FCF7A'; cx.fillRect(0,0,cv.width,cv.height); }
      cx.fillStyle='rgba(30,22,60,.24)'; cx.fillRect(0,0,cv.width,cv.height);
      // letter tiles as honeycomb chips; next needed one glows
      for(let t=0;t<tiles.length;t++){ const tl=tiles[t], px=tl.x*CELL, py=tl.y*CELL, isNext=tl.idx===spelled;
        cx.fillStyle=isNext?'#F0B429':'rgba(255,247,226,.94)'; roundRect(px+3,py+3,CELL-6,CELL-6,8); cx.fill();
        if(isNext){ cx.strokeStyle='#C8901B'; cx.lineWidth=2.5; cx.stroke(); }
        cx.fillStyle=isNext?'#2B2117':'#8A7A55'; cx.font='800 '+Math.floor(CELL*0.56)+'px Sono, monospace';
        cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText(tl.ch.toUpperCase(),px+CELL/2,py+CELL/2+1); }
      cx.textAlign='left'; cx.textBaseline='alphabetic';
      // snake body (honey segments) then head (Bizzy sprite)
      for(let i=snake.length-1;i>=1;i--){ const s=snake[i], f=1-(i/snake.length)*0.45;
        cx.fillStyle='rgba(240,180,41,'+f+')'; roundRect(s.x*CELL+4,s.y*CELL+4,CELL-8,CELL-8,7); cx.fill(); }
      const hd=snake[0], hx=hd.x*CELL, hy=hd.y*CELL;
      if(bonk>0){ cx.fillStyle='rgba(229,83,61,.5)'; roundRect(hx+1,hy+1,CELL-2,CELL-2,9); cx.fill(); bonk--; }
      const bi=sgImg('bizzy-side-fly')||avImg(heroAv())||avImg('bizzy'); let bd=false;
      if(bi){ try{ const s=CELL*1.06; cx.save(); cx.translate(hx+CELL/2,hy+CELL/2); if(dir.x<0) cx.scale(-1,1);
        cx.drawImage(bi,-s/2,-s/2,s,s); cx.restore(); bd=true; }catch(e){ try{cx.restore();}catch(_){} } }
      if(!bd){ cx.fillStyle='#F0B429'; roundRect(hx+3,hy+3,CELL-6,CELL-6,9); cx.fill(); }
      // splash fx
      for(let i=fx.length-1;i>=0;i--){ const f=fx[i]; f.life-=0.03; if(f.life<=0){ fx.splice(i,1); continue; }
        if(f.ring){ f.r+=7; cx.strokeStyle='rgba(255,209,63,'+Math.max(0,f.life)+')'; cx.lineWidth=4; cx.beginPath(); cx.arc(f.x,f.y,f.r,0,7); cx.stroke(); }
        else if(f.text){ f.y-=1.1; cx.save(); cx.globalAlpha=Math.max(0,f.life); cx.textAlign='center'; cx.textBaseline='middle';
          cx.font='800 '+Math.floor(CELL*0.7)+'px Sono, monospace'; cx.lineWidth=5; cx.strokeStyle='#fff'; cx.strokeText(f.text,f.x,f.y);
          cx.fillStyle='#2FA35C'; cx.fillText(f.text,f.x,f.y); cx.restore(); }
        else { f.x+=f.vx; f.y+=f.vy; f.vy+=0.14; f.rot+=f.vr; cx.save(); cx.globalAlpha=Math.max(0,f.life);
          cx.translate(f.x,f.y); cx.rotate(f.rot); cx.fillStyle=f.col; cx.beginPath(); cx.ellipse(0,0,4,7,0,0,7); cx.fill(); cx.restore(); } }
    }
    function frame(){ if(over){ if(loop){clearInterval(loop);loop=null;} return; }
      try{ step(); if(!over) draw(); }catch(e){}
      if(loop&&frame._t!==tick){ clearInterval(loop); frame._t=tick; loop=setInterval(frame,tick); } }
    const DIR={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
    function setDir(d){ if(over) return; const nd=DIR[d]; if(!nd) return; if(nd.x===-dir.x&&nd.y===-dir.y) return; ndir=nd; }
    const key=e=>{ const m={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right',W:'up',S:'down',A:'left',D:'right'}[e.key];
      if(m){ setDir(m); e.preventDefault(); } };
    addEventListener('keydown',key);
    const pad=host.querySelector('#sg-dpad');
    pad.addEventListener('click',e=>{ const b=e.target.closest('[data-d]'); if(b) setDir(b.dataset.d); });
    pad.addEventListener('pointerdown',e=>{ const b=e.target.closest('[data-d]'); if(b){ setDir(b.dataset.d); e.preventDefault(); } },{passive:false});
    let tx=0,ty=0; cv.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;},{passive:true});
    cv.addEventListener('touchend',e=>{ const dx=e.changedTouches[0].clientX-tx, dy=e.changedTouches[0].clientY-ty;
      if(Math.abs(dx)<10&&Math.abs(dy)<10) return; setDir(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up')); },{passive:true});
    function finish(win){ over=true; if(loop){ clearInterval(loop); loop=null; } removeEventListener('keydown',key);
      const stars=win?(lives>=3?3:lives===2?2:1):0; const el=host.querySelector('#sg-card');
      if(!el){ done({win,score,stars}); return; }
      el.innerHTML='<div class="sg-cardbox sg-endcard"><div style="font:800 26px var(--display,serif);margin-bottom:4px">'+(win?'🏆 Words spelled!':'🌙 Tangled out')+'</div>'
        +'<div style="font-size:26px;letter-spacing:4px;margin:2px 0">'+('★'.repeat(stars)+'☆'.repeat(3-stars))+'</div>'
        +'<div style="font-size:15px;color:var(--muted,#7A6E5C);margin-bottom:12px">'+wordsDone+' word'+(wordsDone===1?'':'s')+' · ⭐ '+score+'</div>'
        +'<div class="sg-inrow" style="max-width:340px"><button class="sg-rbtn" id="sg-again">↻ Play again</button>'
        +'<button class="sg-rbtn go" id="sg-cont">'+(win?'Continue →':'Back to map')+'</button></div></div>';
      el.style.display='grid';
      el.querySelector('#sg-again').onclick=()=>{ el.style.display='none'; el.innerHTML=''; wordSnake(host,opts,done); };
      el.querySelector('#sg-cont').onclick=()=>{ el.style.display='none'; el.innerHTML=''; done({win,score,stars}); };
    }
    reset(); frame._t=tick; loop=setInterval(frame,tick); draw();
    return { destroy(){ over=true; if(loop){ clearInterval(loop); loop=null; } removeEventListener('keydown',key); } };
  }

  W().SB_SAGA_ENGINES = { honeycombRun, keepFlying, wordHive, beeGrandPrix, whackAMoth, spellShield, spotlightSimon, unscrambleStars, wordSnake };


  /* ---------- ENGINE G · SPOTLIGHT SIMON (memory sequence) ---------- */
  function spotlightSimon(host, opts, done){
    const diff=opts.diff||'medium';
    const CFG={easy:{seqs:4,start:3},medium:{seqs:6,start:3},hard:{seqs:6,start:4},champ:{seqs:7,start:5}}[diff];
    const words=pool(CFG.seqs+3).filter(w=>w.w.length>=CFG.start&&w.w.length<=9);
    let si=0, seq=null, showing=false, tapIdx=0, over=false, misses=0;
    const art=(window.SGART&&SGART.ready());
    const plate=art?SGART.plateForWorld(opts.world||'Stage'):'';
    host.innerHTML='<div class="sg-hud"><span id="sg-seq">Song 1/'+CFG.seqs+'</span><span id="sg-miss"></span></div>'+
      '<div class="sg-stage"><div class="sg-stage-bg">'+plate+'</div><div class="sg-tiles" id="sg-tiles"></div></div>'+
      '<div class="sg-simonprompt" id="sg-sp"></div><div id="sg-card"></div>';
    function newSeq(){
      if(si>=CFG.seqs){ over=true; done({win:true,score:CFG.seqs*120-misses*20,stars:misses===0?3:misses<=2?2:1}); return; }
      const w=words[si%words.length]; seq={w:w.w.toLowerCase(),i:0};
      const tiles=host.querySelector('#sg-tiles'); tiles.innerHTML='';
      const letters=[...new Set(seq.w.split(''))];
      while(letters.length<8){ const c=String.fromCharCode(97+Math.floor(Math.random()*26)); if(!letters.includes(c)) letters.push(c); }
      letters.sort(()=>Math.random()-0.5).forEach(ch=>{ const t=document.createElement('button');
        t.className='sg-stile'; t.textContent=ch.toUpperCase(); t.dataset.ch=ch; tiles.appendChild(t); });
      showSeq();
    }
    async function showSeq(){
      showing=true; tapIdx=0;
      host.querySelector('#sg-sp').textContent='👀 Watch the spotlights…';
      await new Promise(r=>setTimeout(r,700));
      for(const ch of seq.w){ if(over) return;
        const t=[...host.querySelectorAll('.sg-stile')].find(x=>x.dataset.ch===ch);
        t.classList.add('lit'); await new Promise(r=>setTimeout(r,520)); t.classList.remove('lit');
        await new Promise(r=>setTimeout(r,160)); }
      showing=false;
      host.querySelector('#sg-sp').textContent='🎯 Your turn — repeat it!';
    }
    host.querySelector('#sg-tiles').onclick=e=>{
      const t=e.target.closest('.sg-stile'); if(!t||showing||over) return;
      if(t.dataset.ch===seq.w[tapIdx]){ t.classList.add('lit'); setTimeout(()=>t.classList.remove('lit'),200); tapIdx++;
        if(tapIdx>=seq.w.length) recall(); }
      else { misses++; host.querySelector('#sg-miss').textContent='✖'.repeat(misses);
        if(misses>=4){ over=true; done({win:false,score:si*60,stars:0}); return; }
        try{flash('Off-beat! Watch again…');}catch(_){} showSeq(); } };
    function recall(){ // the sequence WAS a word — now spell it blind
      const el=host.querySelector('#sg-card');
      el.innerHTML='<div class="sg-cardbox"><b>🌟 That was a word! Spell it from memory</b><div class="sg-inrow"><input id="sg-ci" autocomplete="off" autocapitalize="off"><button class="sg-rbtn go" id="sg-cgo">Sing</button></div></div>';
      el.style.display='grid';
      [...host.querySelectorAll('.sg-stile')].forEach(t=>t.style.visibility='hidden');
      const inp=el.querySelector('#sg-ci'); inp.focus();
      function submit(){
        const ok=inp.value.trim().toLowerCase()===seq.w;
        el.style.display='none'; [...host.querySelectorAll('.sg-stile')].forEach(t=>t.style.visibility='');
        if(ok){ si++; host.querySelector('#sg-seq').textContent='Song '+Math.min(si+1,CFG.seqs)+'/'+CFG.seqs;
          try{flash('✨ '+seq.w.toUpperCase()+' — the marquee brightens!');}catch(_){} newSeq(); }
        else { misses++; host.querySelector('#sg-miss').textContent='✖'.repeat(misses);
          if(misses>=4){ over=true; done({win:false,score:si*60,stars:0}); return; }
          try{flash('Almost! Watch once more…');}catch(_){} showSeq(); } }
      inp.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); submit(); } };
      el.querySelector('#sg-cgo').onclick=submit;
    }
    newSeq();
    return { destroy(){ over=true; } };
  }

  /* ---------- ENGINE H · UNSCRAMBLE THE STARS ---------- */
  function unscrambleStars(host, opts, done){
    const diff=opts.diff||'medium';
    const CFG={easy:{n:8},medium:{n:12},hard:{n:12},champ:{n:14}}[diff];
    const words=pool(CFG.n+4).filter(w=>/^[a-z]+$/.test(w.w)&&w.w.length>=4&&w.w.length<=9).slice(0,CFG.n);
    let i=0, hints=3, over=false;
    const art=(window.SGART&&SGART.ready());
    const plate=art?SGART.plateForWorld(opts.world||'Cosmos'):'';
    host.innerHTML='<div class="sg-hud"><span id="sg-c">⭐ 1/'+CFG.n+'</span><span id="sg-h">💡 ×3</span></div>'+
      '<div class="sg-sky"><div class="sg-sky-bg">'+plate+'</div><div class="sg-stars" id="sg-stars"></div><div class="sg-answer" id="sg-ans"></div></div>'+
      '<div class="sg-simonprompt"><button class="sg-hintbtn" id="sg-hint">💡 Zib\u2019s hint</button></div>';
    function scr(w){ const a=w.split(''); do{ a.sort(()=>Math.random()-0.5); }while(a.join('')===w); return a; }
    function newWord(){
      if(i>=words.length){ over=true; done({win:true,score:CFG.n*100+hints*50,stars:hints>=2?3:hints===1?2:1}); return; }
      const w=words[i].w.toLowerCase(); const letters=scr(w);
      host.querySelector('#sg-c').textContent='⭐ '+(i+1)+'/'+CFG.n;
      const st=host.querySelector('#sg-stars'); st.innerHTML='';
      letters.forEach(ch=>{ const s=document.createElement('button'); s.className='sg-star'; s.textContent=ch.toUpperCase(); s.dataset.ch=ch; st.appendChild(s); });
      host.querySelector('#sg-ans').innerHTML=w.split('').map(()=>'<span class="sg-slot"></span>').join('');
      try{ say(words[i].w); }catch(e){}
    }
    let picked=[];
    host.querySelector('#sg-stars').onclick=e=>{
      const s=e.target.closest('.sg-star'); if(!s||s.disabled||over) return;
      const w=words[i].w.toLowerCase();
      if(s.dataset.ch===w[picked.length]){ s.disabled=true; s.classList.add('set');
        const slot=host.querySelectorAll('.sg-slot')[picked.length]; slot.textContent=s.textContent; slot.classList.add('fill');
        picked.push(s.dataset.ch);
        if(picked.length===w.length){ i++; picked=[];
          try{flash('🌌 Constellation restored!');}catch(_){}
          setTimeout(newWord,600); } }
      else { s.classList.add('no'); setTimeout(()=>s.classList.remove('no'),300); } };
    host.querySelector('#sg-hint').onclick=()=>{ if(hints<=0||over) return; hints--;
      host.querySelector('#sg-h').textContent='💡 ×'+hints;
      const w=words[i].w.toLowerCase(); const need=w[picked.length];
      const s=[...host.querySelectorAll('.sg-star')].find(x=>!x.disabled&&x.dataset.ch===need);
      if(s){ s.classList.add('lit'); setTimeout(()=>s.classList.remove('lit'),900); } };
    newWord();
    return { destroy(){ over=true; } };
  }

  /* ================================================================
     UNIFIED STORY ENGINE · SPELL SCENE
     A fluid, illustrated spelling scene (no grid, no canvas). The world
     backdrop is greyed by the Unspelling; spelling words sweeps colour
     back, drives the villain back, and fills the restore meter. Themed
     per chapter via opts {world, foe, hero, verb}.
     ================================================================ */
  function spellScene(host, opts, done){
    const diff=opts.diff||'medium';
    const CFG={easy:{n:6},medium:{n:8},hard:{n:10},champ:{n:12}}[diff]||{n:8};
    const words=pool(CFG.n+6).filter(w=>w&&/^[a-z]+$/i.test(w.w||'')&&(w.w||'').length>=3&&(w.w||'').length<=12).slice(0,CFG.n);
    if(!words.length){ done({win:true,score:0,stars:1}); return; }
    const art=(window.SGART&&SGART.ready());
    const plate=art?SGART.plateForWorld(opts.world||'Meadow'):'';
    const heroSvg=art?SGART.sprite(opts.hero||'bizzy-base',{cls:'ss-sprite'}):'<span class="ss-emoji">🐝</span>';
    const foeSvg=art?SGART.sprite(opts.foe||'grey-moth',{cls:'ss-sprite'}):'<span class="ss-emoji">🦋</span>';
    host.innerHTML=
      '<div class="ss-wrap">'+
        '<div class="ss-bg" id="ss-bg">'+plate+'</div>'+
        '<div class="ss-stage">'+
          '<div class="ss-hero">'+heroSvg+'</div>'+
          '<div class="ss-foe" id="ss-foe">'+foeSvg+'</div>'+
        '</div>'+
        '<div class="ss-meterwrap"><div class="ss-meter"><div class="ss-meter-fill" id="ss-fill"></div></div><span class="ss-mlbl" id="ss-mlbl">0 / '+words.length+'</span></div>'+
        '<div class="ss-panel">'+
          '<div class="ss-prompt"><button class="ss-say" id="ss-say" aria-label="Hear the word">🔊</button><span class="ss-hint" id="ss-hint"></span></div>'+
          '<div class="ss-slots" id="ss-slots"></div>'+
          '<div class="ss-key" id="ss-key"></div>'+
        '</div>'+
      '</div>';
    let i=0, typed='', over=false, misses=0;
    const bg=host.querySelector('#ss-bg'), foeEl=host.querySelector('#ss-foe'),
          fill=host.querySelector('#ss-fill'), slotsEl=host.querySelector('#ss-slots'), mlbl=host.querySelector('#ss-mlbl');
    function grey(p){ bg.style.filter='grayscale('+(0.92*(1-p)).toFixed(2)+') brightness('+(0.9+0.12*p).toFixed(2)+')'; }
    grey(0);
    const rows=['qwertyuiop','asdfghjkl','zxcvbnm'];
    host.querySelector('#ss-key').innerHTML=rows.map(r=>'<div class="ss-krow">'+r.split('').map(ch=>'<button class="ss-kb" data-k="'+ch+'">'+ch+'</button>').join('')+'</div>').join('')+
      '<div class="ss-krow"><button class="ss-kb ss-kwide" data-k="back">⌫</button><button class="ss-kb ss-kwide ss-kgo" data-k="enter">Enter</button></div>';
    function renderSlots(flashWrong){ const w=words[i].w.toLowerCase();
      slotsEl.innerHTML=w.split('').map((ch,ix)=>{ const on=ix<typed.length;
        return '<span class="ss-slot'+(on?' fill':'')+(flashWrong?' wrong':'')+'">'+(on?typed[ix].toUpperCase():'')+'</span>'; }).join(''); }
    function newWord(){ if(i>=words.length){ over=true; return win(); }
      typed=''; const w=words[i];
      host.querySelector('#ss-hint').textContent=w.d?('“'+String(w.d).slice(0,88)+'”'):'Spell the word you hear';
      renderSlots(); try{ say(w.w); }catch(e){} }
    function sparkle(){ const fx=document.createElement('div'); fx.className='ss-burst'; foeEl.appendChild(fx); setTimeout(()=>fx.remove(),720); }
    function commit(){ const w=words[i].w.toLowerCase();
      if(typed.toLowerCase()===w){ i++; const p=i/words.length;
        fill.style.width=Math.round(p*100)+'%'; grey(p); mlbl.textContent=i+' / '+words.length;
        foeEl.classList.remove('recoil'); void foeEl.offsetWidth; foeEl.classList.add('recoil'); sparkle();
        try{ if(typeof sfx==='function') sfx('correct'); }catch(e){}
        try{ flash('✨ '+w.toUpperCase()+' — the colour rushes back!'); }catch(e){}
        setTimeout(newWord,700);
      } else { misses++; typed='';
        renderSlots(true); setTimeout(()=>renderSlots(),420);
        slotsEl.classList.remove('shake'); void slotsEl.offsetWidth; slotsEl.classList.add('shake');
        foeEl.classList.remove('gloat'); void foeEl.offsetWidth; foeEl.classList.add('gloat');
        try{ flash('The Unspelling holds — listen again.'); }catch(e){} try{ say(words[i].w); }catch(e){}
      } }
    function type(ch){ if(over) return; const w=words[i].w.toLowerCase();
      if(typed.length<w.length){ typed+=ch; renderSlots(); if(typed.length===w.length) setTimeout(commit,180); } }
    function back(){ if(over) return; typed=typed.slice(0,-1); renderSlots(); }
    const kb=e=>{ if(over) return; const k=e.key;
      if(/^[a-zA-Z]$/.test(k)){ type(k.toLowerCase()); e.preventDefault(); }
      else if(k==='Backspace'){ back(); e.preventDefault(); }
      else if(k==='Enter'){ if(typed.length===words[i].w.length) commit(); e.preventDefault(); } };
    addEventListener('keydown',kb);
    host.querySelector('#ss-key').onclick=e=>{ const bt=e.target.closest('.ss-kb'); if(!bt) return;
      const k=bt.dataset.k; if(k==='back') back(); else if(k==='enter'){ if(typed.length===words[i].w.length) commit(); } else type(k); };
    host.querySelector('#ss-say').onclick=()=>{ try{ say(words[i].w); }catch(e){} };
    function win(){ removeEventListener('keydown',kb); done({win:true, score:words.length*100-misses*15, stars:misses===0?3:misses<=2?2:1}); }
    newWord();
    return { destroy(){ over=true; removeEventListener('keydown',kb); } };
  }
  W().SB_SAGA_ENGINES = Object.assign(W().SB_SAGA_ENGINES||{}, { spellScene });

  /* ---------- SAGA CONTROLLER · map, chapter runner, dialogue player ---------- */
  const ACTS=[
    {n:1,kick:'ACT I',title:'The Scattering',world:'Meadow',blurb:'The meadow falls; the first crew forms.',gem:'gem-act1'},
    {n:2,kick:'ACT II',title:'The Show Must Go On',world:'Stage',blurb:'The Unspelling reaches Stage World \u2014 and the marquee is going dark.',gem:'gem-act2'},
    {n:3,kick:'ACT III',title:'The Scrambled Sky',world:'Cosmos',blurb:'Above the clouds, whole constellations have come loose from their names.',gem:'gem-act3'}
  ];
  const CH_META=[
    {n:1,act:1,title:'Escape from the Meadow of Challenges',world:'Meadow',engine:'honeycombRun',opts:{}},
    {n:2,act:1,title:'The Long Sky',world:'Sky',engine:'keepFlying',opts:{}},
    {n:3,act:1,title:'The Elders\u2019 Test: Bee Grand Prix',world:'Hive',engine:'beeGrandPrix',opts:{}},
    {n:4,act:1,title:'The Queen\u2019s Riddle',world:'Hive',engine:'wordHive',opts:{big:'THUNDERSTORM'}},
    {n:5,act:1,title:'Whack-the-Moths',world:'Hive',engine:'whackAMoth',opts:{}},
    {n:6,act:1,title:'BOSS: The Smudge',world:'Hive Gates',engine:'spellShield',opts:{}},
    {n:7,act:1,title:'Word Snake: Trail of Letters',world:'Meadow',engine:'wordSnake',opts:{},script:'chSnake'},
    {n:8,act:2,title:'Spotlight Simon: The Marquee',world:'Stage',engine:'spotlightSimon',opts:{},script:'ch7'},
    {n:9,act:3,title:'Unscramble the Stars',world:'Cosmos',engine:'unscrambleStars',opts:{},script:'ch8'}
  ];
  const FACE={bizzy:'🐝',bumble:'🐝',waggle:'🐝',drone:'🐝',queen:'👑',smudge:'🦋',sting:'🐝',narrator:'📖',melody:'🎵',maestro:'🎩',astro:'🚀',comet:'☄️',zib:'👽',sensei:'🐼',ninja:'🥷',beaker:'🧪',brainiac:'🧠',zoomies:'🐶',capy:'🦫',pixel:'👾',joystick:'🕹️',glitch:'😈',vex:'🐝'};
  const NAME={bizzy:'Bizzy',bumble:'Bumble',waggle:'Waggle',drone:'Drone Dan',queen:'Hive Queen',smudge:'The Smudge',sting:'Sting',narrator:'',melody:'Melody',maestro:'Maestro',astro:'Astro',comet:'Comet',zib:'Zib',sensei:'Panda Sensei',ninja:'Shadow Ninja',beaker:'Beaker',brainiac:'Brainiac',zoomies:'Zoomies',capy:'Capy',pixel:'Pixel Pal',joystick:'Joy Stick',glitch:'Glitch',vex:'Vex'};
  function prog(){ try{ return JSON.parse(localStorage.getItem('sb_saga2')||'{}'); }catch(e){ return {}; } }
  function setProg(p){ localStorage.setItem('sb_saga2', JSON.stringify(p)); }
  let overlay=null, engineHandle=null, curAudio=null;
  function music(){ return window.SAGA_MUSIC; }
  function playMusic(world){ try{ if(music()) music().start(world); }catch(e){} }
  function close(){ if(engineHandle){ try{engineHandle.destroy();}catch(e){} engineHandle=null; }
    if(curAudio){ try{curAudio.pause();}catch(e){} curAudio=null; }
    try{ if(music()) music().stop(); }catch(e){}
    if(overlay){ overlay.remove(); overlay=null; } }
  function musicBtn(){ const m=music()&&music().isMuted(); return '<button class="sg-music'+(m?' off':'')+'" id="sg-music" title="Music" aria-label="Toggle music">'+(m?'🔇':'🎵')+'</button>'; }
  function shell(inner){ close();
    overlay=document.createElement('div'); overlay.className='sg-overlay';
    overlay.innerHTML='<div class="sg-top"><button class="sg-back" id="sg-back">← Saga</button><span class="sg-brand">Bizzy & the Great Unspelling</span>'+musicBtn()+'</div><div class="sg-body" id="sg-body"></div>';
    document.body.appendChild(overlay);
    overlay.querySelector('#sg-back').onclick=()=>{ close(); SAGA2.open(); };
    const mb=overlay.querySelector('#sg-music');
    if(mb) mb.onclick=()=>{ const muted=music().toggleMute(); mb.classList.toggle('off',muted); mb.textContent=muted?'🔇':'🎵'; };
    overlay.querySelector('#sg-body').innerHTML=inner;
    return overlay.querySelector('#sg-body'); }
  function map(){
    const p=prog(); const cleared=p.cleared||0; const gems=(p.gems||0);
    const dev=(()=>{ try{ return (window.state&&window.state.devUnlock)||localStorage.getItem('sb_devunlock')==='1'; }catch(e){ return false; } })();
    const art=(window.SGART&&SGART.ready());
    const node=(c)=>{ const st=dev?(c.n<=cleared?'done':'open'):(c.n<=cleared?'done':c.n===cleared+1?'open':'locked');
      const stars=(p.stars||{})[c.n]||0;
      return '<button class="sg-node '+st+'" data-ch="'+c.n+'" '+(st==='locked'?'disabled':'')+'>'+
        '<span class="sg-nhex">'+(st==='done'?'★'.repeat(Math.max(1,stars)):c.n)+'</span>'+
        '<b>'+c.title+'</b><i>'+c.world+'</i></button>'; };
    // one section per act: banner + its chapters. Later acts unlock as earlier chapters clear.
    const sections=ACTS.map(A=>{
      const chs=CH_META.filter(c=>c.act===A.n); if(!chs.length) return '';
      const done=chs.filter(c=>c.n<=cleared).length; const first=chs[0].n;
      const actLive=dev||cleared>=first-1;   // act opens once the chapter before its first is cleared
      const banner=art?('<div class="sg-actbanner">'+SGART.plateForWorld(A.world)+
        '<div class="sg-actbanner-in"><span class="sg-actkick">'+A.kick+'</span><h3>'+A.title+'</h3>'+
        '<p>'+A.blurb+' '+done+'/'+chs.length+' cleared.</p>'+
        '<div class="sg-actgem">'+SGART.sprite(A.gem||'gem-act1',{size:28,grey:done<chs.length})+'<b>'+gems+'</b></div></div></div>'):
        ('<div class="sg-acthead"><span>'+A.kick+'</span><h3>'+A.title+'</h3><p>'+A.blurb+' '+done+'/'+chs.length+' cleared.</p></div>');
      const lockNote=actLive?'':'<div class="sg-actlock">🔒 Clear Act '+(A.n-1)+' to raise the curtain.</div>';
      return '<section class="sg-act">'+banner+lockNote+'<div class="sg-map">'+chs.map(node).join('')+'</div></section>';
    }).join('');
    const b=shell(sections);
    playMusic('Meadow');
    b.querySelectorAll('.sg-node:not([disabled])').forEach(n=>n.onclick=()=>chapter(+n.dataset.ch));
    overlay.querySelector('#sg-back').onclick=()=>close();
  }
  function beats(ch, phase, then){
    const meta0=CH_META[ch-1]||{}; const skey=meta0.script||('ch'+ch);
    const S=(window.SB_SAGA_SCRIPT||{})[skey]||{}; const lines=S[phase]||[];
    if(!lines.length){ then(); return; }
    let i=0;
    const meta=CH_META[ch-1]||{};
    const art=(window.SGART&&SGART.ready());
    const plate=art?SGART.plateForWorld(meta.world, phase==='lose'):'';
    const b=shell('<div class="sg-scene">'+
      '<div class="sg-scene-bg">'+plate+'</div>'+
      '<div class="sg-scene-char" id="sg-df"></div>'+
      '<div class="sg-bubble"><b id="sg-dn"></b><p id="sg-dl"></p><button class="sg-next" id="sg-nx">▸</button></div>'+
    '</div>');
    playMusic(meta.world);
    function show(){ const [spk,text,key]=lines[i];
      const face=b.querySelector('#sg-df'); const port=art?SGART.portrait(spk):'';
      if(port){ face.innerHTML=port; face.className='sg-scene-char has-art'; }
      else if(spk==='narrator'){ face.innerHTML=''; face.className='sg-scene-char narrator'; }
      else { face.innerHTML='<span class="sg-scene-emoji">'+(FACE[spk]||'🐝')+'</span>'; face.className='sg-scene-char'; }
      b.querySelector('#sg-dn').textContent=NAME[spk]||'';
      b.querySelector('#sg-dl').textContent=text;
      if(curAudio){ try{curAudio.pause();}catch(e){} }
      curAudio=null;
      const unduck=()=>{ try{ if(music()) music().duck(false); }catch(e){} };
      try{ const a=new Audio('voice/d/'+key+'.mp3');
        a.addEventListener('ended',unduck); a.addEventListener('error',unduck);
        a.play().then(()=>{ curAudio=a; try{ if(music()) music().duck(true); }catch(e){} }).catch(unduck); }catch(e){ unduck(); }
    }
    b.querySelector('#sg-nx').onclick=()=>{ i++; if(i>=lines.length) then(); else show(); };
    show();
  }
  function chapter(ch){
    const meta=CH_META[ch-1]; if(!meta) return;
    beats(ch,'intro',()=>{ game(meta); });
  }
  function game(meta){
    const plate=(window.SGART&&SGART.ready())?SGART.plateForWorld(meta.world):'';
    const b=shell('<div class="sg-gameframe">'+plate+'<div class="sg-gamehost" id="sg-gh"></div></div>');
    playMusic(meta.world);
    const diff=(active&&active().gameDiff)||'medium';
    const eng=W().SB_SAGA_ENGINES[meta.engine];
    const WMAP={meadow:'meadow',sky:'opensky',hive:'hive','hive gates':'hive',stage:'stage',cosmos:'cosmos',carnival:'carnival'};
    const wid=WMAP[String(meta.world||'').toLowerCase()]||'meadow';
    engineHandle=eng(b.querySelector('#sg-gh'), Object.assign({diff,world:wid},meta.opts), res=>{
      engineHandle=null;
      if(res.win){
        const p=prog(); p.cleared=Math.max(p.cleared||0, meta.n);
        p.stars=p.stars||{}; p.stars[meta.n]=Math.max(p.stars[meta.n]||0, res.stars||1);
        p.gems=(p.gems||0)+((p.gemsAt||{})[meta.n]?0:1); p.gemsAt=p.gemsAt||{}; p.gemsAt[meta.n]=1;
        setProg(p);
        try{ if(typeof logActivity==='function') logActivity('saga', {ch:meta.n, stars:res.stars}); }catch(e){}
        try{ if(typeof addCoins==='function') addCoins(25+(res.stars||1)*10); }catch(e){}
        beats(meta.n,'win',()=>{ map(); });
      } else {
        beats(meta.n,'lose',()=>{ game(meta); });
      }
    });
  }
  W().SAGA2={ open: map, close };

})();
