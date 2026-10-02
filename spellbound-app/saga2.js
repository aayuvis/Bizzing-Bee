/* Bizzing Bee — SAGA v2 · "Bizzy and the Great Unspelling" · Act I engines.
   Placeholder vector art (swaps for Claude Design drops). Words via gameWordsD/pickFresh; audio via voice/d + say(). */
(function(){
  const W=()=>window;
  function pool(n){ try{ const l=pickFresh(gameWordsD(),n)||[];
    l.forEach(w=>{ try{ if(typeof logGameWord==='function'&&w&&w.w) logGameWord(nkey(w.w)); }catch(e){} });
    return l; }catch(e){ return []; } }
  /* Every word an arcade game asked for, and whether it was spelled right.
     A game used to swallow its words: miss one mid-flight and the correct spelling went by
     in the same breath as the crash, so the one word you most needed to see was the one you
     never got. Engines record here as they go; the arcade result card reads it back and
     shows the round's words with their spellings (app3.js, arcadeResult).
     Keyed by lower-cased word so a word met twice in a round is one row — and a word missed
     at any point stays missed, because that is the row worth reading. */
  const WORDLOG={
    list:[],
    reset(){ this.list=[]; },
    add(w,ok){ try{
      if(!w||!w.w) return;
      const k=String(w.w).toLowerCase();
      const hit=this.list.find(x=>x.k===k);
      if(hit){ hit.ok=hit.ok&&!!ok; return; }
      this.list.push({k,w:w.w,d:w.d||'',ok:!!ok});
    }catch(e){} },
  };
  W().SB_WORDLOG=WORDLOG;
  const wlog=(w,ok)=>WORDLOG.add(w,ok);
  /* refilling word source: never cycles the same small batch - when a game runs long
     it draws a FRESH batch (still respecting the global 150-word no-repeat window). */
  function wordFeed(n,filter){ const f=filter||(w=>w&&w.w); let q=pool(n).filter(f);
    return { next(){ if(!q.length) q=pool(Math.max(14,n)).filter(f);
      return q.shift()||{w:'honey',d:'the sweet golden food that bees make'}; } }; }
  /* Robust n-word draw for the letter-typing engines. A single pool(n+k) draw can come
     back with ZERO words inside a length band once the difficulty range shifts to a rarer,
     longer slice (e.g. Band 6 'medium' pulls corpus y-bands 5-7, where few words are 3-9
     letters) — and the engines then instant-"win" on an empty host. This keeps drawing
     fresh batches until it has n words in [minLen,maxLen], deduped, so the field is never
     hollow. pickFresh backfills from used words when fresh runs low, so it always terminates. */
  function fillWords(n,minLen,maxLen){
    const ok=w=>w&&/^[a-z]+$/i.test(w.w||'')&&(w.w||'').length>=minLen&&(w.w||'').length<=maxLen;
    const out=[], seen=new Set();
    for(let tries=0; tries<8 && out.length<n; tries++){
      const batch=pool(Math.max(18,(n-out.length)*4)).filter(ok);
      for(const w of batch){ const k=nkey(w.w); if(!seen.has(k)){ seen.add(k); out.push(w); if(out.length>=n) break; } }
    }
    return out.slice(0,n); }

  /* Calm mode (Settings → Accessibility): gentler pacing, more time, no rush.
     Scales the shared CFG knobs in a direction that always eases pressure. */
  function calmCFG(cfg){ if(!window.SB_CALM||!cfg||typeof cfg!=='object') return cfg; const c={...cfg};
    if(c.speed) c.speed=+(c.speed*0.66).toFixed(2);
    if(c.fall) c.fall=+(c.fall*0.66).toFixed(2);
    if(c.time) c.time=Math.round(c.time*1.5);
    if(c.tick) c.tick=Math.round(c.tick*1.35);
    if(c.up) c.up=Math.round(c.up*1.45);
    if(c.gap) c.gap=Math.round(c.gap*1.25);
    if(c.rate) c.rate=+(c.rate*1.4).toFixed(2);
    if(c.haz) c.haz=+(c.haz*0.6).toFixed(4);
    if(c.pull) c.pull=+(c.pull*0.7).toFixed(2);   // Grand Prix: calm bends push out less
    return c; }

  /* ===== Evolution ladders — every saga game shows the hero evolving as the speller
     progresses, and the "champion" form is the ACHIEVABLE endpoint that unlocks the
     next chapter. The round keeps going afterwards so kids can chase the top form. ===== */
  const SG_EVO={
    snake:{unlock:5,max:8,forms:[[0,'🌱','Grass Snake'],[1,'🐍','Cobra'],[2,'🐲','Python'],[3,'🌊','Sea Serpent'],[4,'✨','Naga'],[5,'🌌','VASUKI']]},
    fly:{unlock:'pots',forms:[[0,'🐛','Grub'],[1,'🐝','Bee'],[2,'🦋','Flutter'],[3,'🦅','Sky Rider'],[4,'🌟','Sky King']]},
    maze:{unlock:'target',forms:[[0,'🐝','Forager'],[1,'🍯','Gatherer'],[2,'👑','Nectar Lord']]},
    race:{unlock:'place',forms:[[0,'🛵','Rookie'],[1,'🏍️','Racer'],[2,'🏎️','Ace'],[3,'🏆','Champion']]},
    hive:{unlock:'target',forms:[[0,'🐝','Speller'],[1,'📖','Wordsmith'],[2,'👑','Riddle Queen']]},
    moth:{unlock:'words',forms:[[0,'🔨','Tapper'],[1,'⚡','Quick Hands'],[2,'🌟','Moth Master']]},
    shield:{unlock:'phase2',forms:[[0,'🛡️','Squire'],[1,'⚔️','Knight'],[2,'👑','Shield Champion']]},
    catcher:{unlock:'words',forms:[[0,'🧺','Catcher'],[1,'🍯','Nimble'],[2,'🌟','Nectar Ace']]},
    simon:{unlock:'seqs',forms:[[0,'🎵','Chorus'],[1,'🎤','Soloist'],[2,'⭐','Headliner']]},
    stars:{unlock:'n',forms:[[0,'⭐','Stargazer'],[1,'🌟','Navigator'],[2,'🌌','Skyweaver']]},
    rhythm:{unlock:'words',forms:[[0,'🎵','Tapper'],[1,'🥁','Drummer'],[2,'🎼','Maestro']]},
    connect:{unlock:'n',forms:[[0,'✨','Stargazer'],[1,'🌟','Linker'],[2,'🌌','Constellation Master']]},
    blaster:{unlock:'n',forms:[[0,'👾','Gunner'],[1,'🔫','Sharpshooter'],[2,'🌟','Firewall Ace']]}
  };
  function sgEvo(host, key){
    const cfg=SG_EVO[key]||{forms:[[0,'⭐','Hero']]}; let cur=-1;
    const hud=host.querySelector('.sg-hud')||host.querySelector('.sg-racehud .sg-rh-row');
    let chip=null;
    if(hud){ chip=document.createElement('span'); chip.className='sg-evochip'; hud.insertBefore(chip, hud.firstChild); }
    function toast(f){ const t=document.createElement('div'); t.className='sg-evotoast';
      t.innerHTML='<span class="sg-evotoast-ic">'+f[1]+'</span><b>Evolved!</b><i>'+f[2]+'</i>';
      host.appendChild(t); setTimeout(()=>t.remove(),1700);
      try{ if(typeof sfx==='function') sfx('correct'); }catch(e){} }
    return { set(stage, onUnlock, unlockStage){
      let idx=0; for(let i=0;i<cfg.forms.length;i++) if(stage>=cfg.forms[i][0]) idx=i;
      if(idx!==cur){ const up=idx>cur; cur=idx; const f=cfg.forms[idx];
        if(chip){ chip.innerHTML=f[1]+' <b>'+f[2]+'</b>'; chip.classList.remove('pop'); void chip.offsetWidth; chip.classList.add('pop'); }
        if(up&&idx>0) toast(f); }
      const uAt=(unlockStage!=null)?unlockStage:(cfg.forms.length-1);
      if(stage>=uAt && onUnlock){ onUnlock(3); }
    }, forms:cfg.forms };
  }
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  // A speller-safe "meaning" line: the definition with the target word blanked out so
  // showing the clue never leaks its spelling. Returns '' if no usable definition.
  function meaningText(wobj){
    try{ const d=(wobj&&(wobj.d||wobj.def))||''; const w=(wobj&&wobj.w)||'';
      if(!d || d.length<6) return '';
      let m=d; if(w){ const re=new RegExp('\\b'+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(s|es|ing|ed)?\\b','ig'); m=m.replace(re,'•••'); }
      return m;
    }catch(e){ return ''; }
  }
  /* The clue marker is drawn, not a 💡. This one helper feeds the meaning line in
     every engine, so the emoji was on screen in all of them at once — and a bulb
     glyph is one of the widest platform variations there is. */
  function meaningHTML(wobj){ const m=meaningText(wobj); if(!m) return '';
    return '<div class="sg-cardmean"><svg class="sg-clue" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">'+
      '<path d="M8 1.6a4.4 4.4 0 0 0-2.6 7.95c.4.3.6.75.6 1.25h4c0-.5.2-.95.6-1.25A4.4 4.4 0 0 0 8 1.6z" '+
      'fill="currentColor" opacity=".9"/><path d="M6.4 12.6h3.2M6.9 14.2h2.2" stroke="currentColor" '+
      'stroke-width="1.5" stroke-linecap="round"/></svg>'+esc(m)+'</div>'; }
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
    const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+(w*3)+'" height="'+(h*3)+'" viewBox="'+vb+'">'+f+'</svg>';
    const img=new Image(w*3,h*3);   // 3x raster: crisp when games draw sprites large on DPR canvases
    img.onload=()=>{ _imgCache[name]=img; };
    img.onerror=()=>{ _imgCache[name]=false; };  // never retry a broken sprite
    img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
    return null;
  }
  function sgPreload(names){ (names||[]).forEach(sgImg); }

  /* Raster game-element sprites — Gemini-generated, transparent WebP in app-art/gart/.
     Loaded by URL and DECODED ONCE into a cached <img>, so drawing one per frame is a
     cheap cx.drawImage (no data-URI encode, no per-frame decode). Each engine keeps its
     primitive drawing as the fallback until the sprite is present, so a missing/loading
     texture never breaks the frame loop. Regenerate with voice/pipeline/game-sprites.py. */
  const _texCache={};
  function sgTex(name){ if(!name) return null; if(name in _texCache) return _texCache[name]||null;
    _texCache[name]=null; const img=new Image();
    img.onload=()=>{ _texCache[name]=img; }; img.onerror=()=>{ _texCache[name]=false; };
    img.src='app-art/gart/'+name+'.webp'; return null; }
  function sgTexPreload(names){ (names||[]).forEach(sgTex); }
  /* Build a 4-tone snake/skin palette [base, light, pale, dark] from one colour. */
  function tintPalette(col){ try{ const n=parseInt(col.slice(1),16); let r=(n>>16)&255,g=(n>>8)&255,b=n&255;
    const mix=(v,t,to)=>Math.round(v+(to-v)*t);
    const lt=t=>'#'+[mix(r,t,255),mix(g,t,255),mix(b,t,255)].map(x=>x.toString(16).padStart(2,'0')).join('');
    const dk=t=>'#'+[mix(r,t,0),mix(g,t,0),mix(b,t,0)].map(x=>x.toString(16).padStart(2,'0')).join('');
    return [col, lt(0.28), lt(0.6), dk(0.42)]; }catch(e){ return null; } }

  /* Rasterise a collectible AVATAR (window.SB_AVATAR) into a canvas-drawable <img>
     (cached by id). This is how the games show the REAL characters — Bizzy, the
     bee racers, the villains — instead of primitive blobs. */
  const _avCache={};
  function avImg(id){
    if(!id) return null;
    if(id in _avCache) return _avCache[id];
    _avCache[id]=null;
    try{
      // Avatars are RASTER art (avatars/<id>.webp / avatars/s/<id>.png thumb), not SVG.
      // SB_AVATAR returns an <img> tag — read its resolved src and load that straight for
      // canvas use. (The old code rasterised an SVG data-URI, which silently failed for
      // every photo avatar, so the chosen hero never appeared in any game.)
      let src='avatars/s/'+id+'.png';
      try{ if(typeof window.SB_AVATAR==='function'){ const s=window.SB_AVATAR(id,192,{outline:false});
        const m=s&&s.match(/src=["']([^"']+)["']/); if(m) src=m[1]; } }catch(e){}
      const img=new Image();
      img.onload=()=>{ _avCache[id]=img; };
      img.onerror=()=>{ _avCache[id]=false; };
      img.src=src;
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
    const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+Math.round(w*2.5)+'" height="'+Math.round(h*2.5)+'" viewBox="'+vb+'">'+(a.svg||'')+'</svg>';
    const img=new Image(Math.round(w*2.5),Math.round(h*2.5));   // 2.5x raster - crisp full-screen backdrops
    img.onload=()=>{ _wCache[id]=img; };
    img.onerror=()=>{ _wCache[id]=false; };
    img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
    return null;
  }
  /* The PAINTED play field. The vector plate above is a few dozen filled paths,
     and next to the painted act board the child has just walked across it reads
     as a diagram. Each world has a painting now (app-art/sgw-<world>.jpg, built
     by voice/pipeline/saga-worlds.py), composed to be played over: open and
     low-contrast through the middle, detail pushed to the top and bottom edges,
     and a stop darker than daylight so a gold bee reads against it.
     The vector plate stays as the fallback while the JPEG is still loading and
     for any world that has no painting. */
  const _pCache={};
  function fieldImg(id){
    if(!id) return null;
    if(id in _pCache) return _pCache[id]||null;
    _pCache[id]=null;
    const img=new Image();
    img.onload=()=>{ _pCache[id]=img; };
    img.onerror=()=>{ _pCache[id]=false; };
    img.src='app-art/sgw-'+id+'.jpg';
    return null;
  }
  /* cover-fit without distortion, whichever source we have */
  function coverDraw(cx,im,x,y,w,h){
    const ir=im.width/im.height, rr=w/h; let sw,sh,sx,sy;
    if(ir>rr){ sh=im.height; sw=sh*rr; sx=(im.width-sw)/2; sy=0; }
    else { sw=im.width; sh=sw/rr; sx=0; sy=(im.height-sh)/2; }
    cx.drawImage(im,sx,sy,sw,sh,x,y,w,h);
  }
  // Draw a world plate to fill a rect, cover-fit (crop, no distortion). Returns true if drawn.
  function drawWorld(cx,id,x,y,w,h){
    const pf=fieldImg(id);
    if(pf){ try{ coverDraw(cx,pf,x,y,w,h); return true; }catch(e){} }
    const im=worldImg(id); if(!im) return false;
    try{ const ir=im.width/im.height, rr=w/h; let sw,sh,sx,sy;
      if(ir>rr){ sh=im.height; sw=sh*rr; sx=(im.width-sw)/2; sy=0; }
      else { sw=im.width; sh=sw/rr; sx=0; sy=(im.height-sh)/2; }
      cx.drawImage(im,sx,sy,sw,sh,x,y,w,h); return true;
    }catch(e){ return false; }
  }

  /* =================== SGFX · the shared canvas render kit ===================
     Every canvas engine was drawing flat: solid fills, hard edges, four-pixel
     dots for pickups, no light and nothing left behind anything that moved. The
     engines are fine — what they lacked was a vocabulary. This is it, in one
     place, so a fix to how a pickup glows fixes it in five games at once.

     Everything here is cheap enough to run per frame at 60fps on a tablet: no
     shadowBlur in the hot path except on the small stuff, no per-pixel work. */
  const SGFX={
    /* a rounded rect on any browser */
    rr(cx,x,y,w,h,r){ if(cx.roundRect){ cx.beginPath(); cx.roundRect(x,y,w,h,r); return; }
      cx.beginPath(); cx.moveTo(x+r,y); cx.arcTo(x+w,y,x+w,y+h,r); cx.arcTo(x+w,y+h,x,y+h,r);
      cx.arcTo(x,y+h,x,y,r); cx.arcTo(x,y,x+w,y,r); cx.closePath(); },

    /* a pointy-top hexagon, because a honeycomb maze drawn out of rounded
       squares is not a honeycomb maze */
    hex(cx,cxp,cyp,r){ cx.beginPath();
      for(let i=0;i<6;i++){ const a=Math.PI/180*(60*i-90), x=cxp+r*Math.cos(a), y=cyp+r*Math.sin(a);
        i?cx.lineTo(x,y):cx.moveTo(x,y); } cx.closePath(); },

    /* a lit collectible: outer bloom, body gradient, specular highlight. The
       phase makes a field of them breathe slightly out of step with each other. */
    orb(cx,x,y,r,c1,c2,ph){
      const p=0.86+0.14*Math.sin((ph||0));
      const g=cx.createRadialGradient(x-r*0.35,y-r*0.4,r*0.1,x,y,r*2.6);
      g.addColorStop(0,c1); g.addColorStop(0.34,c2); g.addColorStop(1,'rgba(0,0,0,0)');
      cx.fillStyle=g; cx.beginPath(); cx.arc(x,y,r*2.6*p,0,7); cx.fill();
      const b=cx.createRadialGradient(x-r*0.4,y-r*0.45,r*0.05,x,y,r);
      b.addColorStop(0,'#FFFFFF'); b.addColorStop(0.35,c1); b.addColorStop(1,c2);
      cx.fillStyle=b; cx.beginPath(); cx.arc(x,y,r*p,0,7); cx.fill(); },

    /* a tile with a light source: top face brighter, a hairline rim, a shadow
       under it. Used for maze walls and for letter tiles. */
    tile(cx,x,y,w,h,r,top,bot,rim){
      cx.save(); cx.shadowColor='rgba(10,6,26,.45)'; cx.shadowBlur=Math.max(4,h*0.18); cx.shadowOffsetY=Math.max(2,h*0.08);
      const g=cx.createLinearGradient(0,y,0,y+h); g.addColorStop(0,top); g.addColorStop(1,bot);
      cx.fillStyle=g; SGFX.rr(cx,x,y,w,h,r); cx.fill(); cx.restore();
      if(rim){ cx.strokeStyle=rim; cx.lineWidth=Math.max(1,h*0.045); SGFX.rr(cx,x,y,w,h,r); cx.stroke(); }
      cx.fillStyle='rgba(255,255,255,.22)'; SGFX.rr(cx,x+w*0.12,y+h*0.09,w*0.76,h*0.20,h*0.10); cx.fill(); },

    /* --- particles ------------------------------------------------------
       One list per engine, spawned by the events worth noticing and drained by
       run(). Four kinds: spark, ring, text and mote (ambient drift). */
    spark(fx,x,y,n,cols,opt){ opt=opt||{};
      const sp=opt.speed||3.4, up=opt.up||0, g=opt.g==null?0.16:opt.g;
      for(let i=0;i<n;i++){ const a=opt.dir!=null?opt.dir+(Math.random()-0.5)*(opt.spread||1.4)
          :(i/n)*Math.PI*2+Math.random()*0.5;
        const v=sp*(0.5+Math.random());
        fx.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-up,g,rot:Math.random()*7,
          vr:(Math.random()-0.5)*0.5,life:1,decay:opt.decay||0.028,
          col:cols[i%cols.length],rx:opt.rx||3.6,ry:opt.ry||6.4}); } },
    ring(fx,x,y,col,opt){ opt=opt||{};
      fx.push({ring:1,x,y,r:opt.r0||6,gr:opt.grow||7,life:1,decay:opt.decay||0.045,
        col:col||'255,209,63',lw:opt.lw||5}); },
    say(fx,x,y,text,col){ fx.push({text,x,y,life:1.4,decay:0.02,col:col||'#E5533D',size:opt_size(text)}); },
    /* ambient motes: the slow drifting dust that makes a still background feel
       like air rather than a picture */
    motes(n,w,h){ const out=[]; for(let i=0;i<n;i++) out.push({x:Math.random()*w,y:Math.random()*h,
      r:0.7+Math.random()*1.8,vx:(Math.random()-0.5)*0.18,vy:-0.06-Math.random()*0.22,
      a:0.10+Math.random()*0.26,ph:Math.random()*7}); return out; },
    drawMotes(cx,list,w,h,t){ cx.save();
      for(const m of list){ m.x+=m.vx; m.y+=m.vy; if(m.y<-4){ m.y=h+4; m.x=Math.random()*w; }
        if(m.x<-4) m.x=w+4; if(m.x>w+4) m.x=-4;
        cx.globalAlpha=m.a*(0.55+0.45*Math.sin(t*0.002+m.ph));
        cx.fillStyle='#FFF6E0'; cx.beginPath(); cx.arc(m.x,m.y,m.r,0,7); cx.fill(); }
      cx.restore(); },

    run(cx,fx,scale){ if(!fx||!fx.length) return; scale=scale||1;
      for(let i=fx.length-1;i>=0;i--){ const f=fx[i]; f.life-=f.decay;
        if(f.life<=0){ fx.splice(i,1); continue; }
        const a=Math.max(0,Math.min(1,f.life));
        if(f.ring){ f.r+=f.gr; cx.strokeStyle='rgba('+f.col+','+a*0.9+')'; cx.lineWidth=f.lw*a;
          cx.beginPath(); cx.arc(f.x,f.y,f.r,0,7); cx.stroke(); }
        else if(f.text){ f.y-=1.3; cx.save(); cx.globalAlpha=a; cx.textAlign='center'; cx.textBaseline='middle';
          cx.font='800 '+(f.size||26)+'px Sono, ui-monospace, monospace';
          cx.lineWidth=6; cx.strokeStyle='rgba(255,255,255,.95)'; cx.strokeText(f.text,f.x,f.y);
          cx.fillStyle=f.col; cx.fillText(f.text,f.x,f.y); cx.restore(); }
        else { f.x+=f.vx; f.y+=f.vy; f.vy+=f.g; f.vx*=0.99; f.rot+=f.vr;
          cx.save(); cx.globalAlpha=a; cx.translate(f.x,f.y); cx.rotate(f.rot);
          cx.fillStyle=f.col; cx.beginPath(); cx.ellipse(0,0,f.rx*scale,f.ry*scale,0,0,7); cx.fill();
          cx.fillStyle='rgba(255,255,255,.5)'; cx.beginPath(); cx.ellipse(-1,-2,f.rx*0.4,f.ry*0.4,0,0,7); cx.fill();
          cx.restore(); } } },

    /* a motion trail: the last N positions of something, fading and narrowing.
       push() each frame, draw() once. */
    trail(){ return { pts:[], push(x,y,max){ this.pts.push({x,y});
        if(this.pts.length>(max||14)) this.pts.shift(); },
      draw(cx,col,w){ const p=this.pts; if(p.length<2) return; cx.save(); cx.lineCap='round';
        for(let i=1;i<p.length;i++){ const f=i/p.length;
          cx.strokeStyle='rgba('+col+','+(f*0.45)+')'; cx.lineWidth=(w||6)*f;
          cx.beginPath(); cx.moveTo(p[i-1].x,p[i-1].y); cx.lineTo(p[i].x,p[i].y); cx.stroke(); }
        cx.restore(); },
      clear(){ this.pts.length=0; } }; },

    /* the scrim that makes gameplay legible over a painting, plus the vignette
       that stops the play field looking like a flat rectangle of picture */
    scrim(cx,w,h,amt){ const g=cx.createLinearGradient(0,0,0,h);
      const a=amt==null?0.30:amt;
      g.addColorStop(0,'rgba(16,10,34,'+(a*1.15)+')'); g.addColorStop(0.45,'rgba(16,10,34,'+(a*0.62)+')');
      g.addColorStop(1,'rgba(16,10,34,'+(a*1.3)+')'); cx.fillStyle=g; cx.fillRect(0,0,w,h); },
    vignette(cx,w,h,amt){ const r=Math.max(w,h)*0.75;
      const g=cx.createRadialGradient(w/2,h/2,r*0.42,w/2,h/2,r);
      g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(10,6,24,'+(amt==null?0.42:amt)+')');
      cx.fillStyle=g; cx.fillRect(0,0,w,h); },

    /* screen shake: call hit() on impact, then wrap the frame in begin()/end() */
    shake(){ return { t:0, m:0, hit(m){ this.m=Math.max(this.m,m||6); this.t=1; },
      begin(cx){ if(this.t<=0) return; this.t-=0.07; const k=this.m*this.t*this.t;
        cx.save(); cx.translate((Math.random()-0.5)*k,(Math.random()-0.5)*k); this._on=1; },
      end(cx){ if(this._on){ cx.restore(); this._on=0; } } }; }
  };
  /* ==========================================================================
     SGUI — the screens AROUND the game, which is where these felt cheapest.

     Every engine had grown its own start card and its own end card, or gone
     without: keepFlying had a how-to, honeycombRun had an end card, spellShield
     and typeBlaster had neither and dropped the child straight in and straight
     out. Four dialects of the same two screens, and stars drawn as the text
     glyphs ★☆.

     THE THING NONE OF THEM DID: show the words. The result screen of a SPELLING
     game listed a score and a honey count and never once told a child which words
     they had just learned or which one beat them. That is the whole point of the
     round, and it was the one thing missing — so `result` takes the round's word
     log and prints it, right and wrong marked, each one tappable to hear again.
     A child who lost gets the thing they actually needed from losing.
     ========================================================================== */
  const SGUI = {
    /* Stars as drawn geometry rather than ★☆ glyphs, which render as a different
       shape on every platform and cannot animate. Each pops in on a delay so the
       third star lands last — the beat a child waits for. */
    stars(n, size){ size=size||34;
      /* NOT `.sg-stars` — unscrambleStars already owns that class for its tray of
         letter buttons, and its `min-height:64px` turned a 0-star result into a 64px
         band of nothing. Two components, one class name, and the older one wins on
         the properties the newer one does not set. */
      return '<div class="sg-rstars" role="img" aria-label="'+n+' of 3 stars">'+[0,1,2].map(i=>
        '<svg class="sg-rstar'+(i<n?' won':'')+'" style="animation-delay:'+(i*0.14+0.1).toFixed(2)+'s" '+
        'width="'+size+'" height="'+size+'" viewBox="0 0 24 24" aria-hidden="true">'+
        '<path d="M12 2.6l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.7 6.1 20.8l1.2-6.6L2.5 9.6l6.6-.9z" '+
        'fill="'+(i<n?'#F0B429':'#F4EFE4')+'" stroke="'+(i<n?'#C98A08':'#C3B7A1')+'" stroke-width="1.6" '+
        'stroke-linejoin="round"/></svg>').join('')+'</div>'; },

    /* A draining ring beats a bare number: the shape reads at a glance, and the
       last three seconds go red and pulse, so urgency is felt rather than read. */
    ring(pct, secs){ const R=26, C=2*Math.PI*R, hot=secs<=3;
      return '<svg class="sg-ring'+(hot?' hot':'')+'" viewBox="0 0 64 64" width="62" height="62" aria-hidden="true">'+
        '<circle cx="32" cy="32" r="'+R+'" fill="none" stroke="currentColor" stroke-width="5" opacity=".16"/>'+
        '<circle cx="32" cy="32" r="'+R+'" fill="none" stroke="'+(hot?'#E8458C':'#F0B429')+'" stroke-width="5" '+
        'stroke-linecap="round" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+(C*(1-Math.max(0,Math.min(1,pct)))).toFixed(1)+'" '+
        'transform="rotate(-90 32 32)"/></svg><b class="sg-ring-n'+(hot?' hot':'')+'">'+secs+'</b>'; },

    howto(o){
      return '<div class="sg-howto"><div class="sg-howto-card">'+
        (o.art?'<div class="sg-howto-art">'+o.art+'</div>':'')+
        '<div class="sg-howto-h">'+o.title+'</div>'+
        '<div class="sg-howto-sub">'+o.sub+'</div>'+
        '<div class="sg-howto-steps">'+(o.steps||[]).map(t=>'<div class="sg-pw-legend">'+t+'</div>').join('')+'</div>'+
        '<button class="sg-rbtn go sg-howto-go" id="sg-howgo">'+(o.go||'Start')+' →</button></div></div>'; },

    /* words: [{w, ok}] — the round, in order. Capped at 12 so a long round does
       not push the buttons off a phone; the count in the header stays honest. */
    result(o){ const ws=(o.words||[]), got=ws.filter(w=>w.ok).length;
      const list = ws.length ? '<div class="sg-wordsum">'+
        '<div class="sg-wordsum-h">'+got+' of '+ws.length+' spelled</div>'+
        '<div class="sg-wordrow">'+ws.slice(0,12).map(w=>
          '<button class="sg-wchip'+(w.ok?' ok':' no')+'" data-say="'+esc2(w.w)+'" title="Hear it again">'+
          esc2(w.w)+'</button>').join('')+'</div></div>' : '';
      return '<div class="sg-cardbox sg-endcard">'+
        '<div class="sg-end-h">'+(o.title||(o.win?'Round clear':'Out of time'))+'</div>'+
        (o.sub?'<div class="sg-end-sub">'+o.sub+'</div>':'')+
        SGUI.stars(o.stars||0)+
        '<div class="sg-end-score">'+((o.score|0).toLocaleString())+'<span>'+(o.scoreLabel||'points')+'</span></div>'+
        list+
        '<div class="sg-inrow sg-end-btns"><button class="sg-rbtn" id="sg-again">Play again</button>'+
        '<button class="sg-rbtn go" id="sg-cont">'+(o.win?'Continue':'Back to map')+'</button></div></div>'; },

    /* ◀ ▶ are typographic triangles, and they sit inside the one control a child
       HOLDS DOWN for a whole race: different weight in every font, flat monochrome
       boxes on some Androids, and no way to match the stroke of anything else drawn
       here. Geometry instead, inheriting currentColor so the pressed state works. */
    chev(d){ return '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">'+
      '<path d="M'+(d<0?'15 5l-7 7 7 7':'9 5l7 7-7 7')+'" fill="none" stroke="currentColor" '+
      'stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'; },

    /* wire the word chips so tapping one says it — the reason to show them */
    bind(el){ if(!el) return;
      el.querySelectorAll('[data-say]').forEach(b=>{ b.onclick=()=>{ try{ say(b.dataset.say); }catch(e){} }; }); },
  };
  const esc2=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  W().SGUI = SGUI;

  function opt_size(t){ return String(t||'').length>10?20:26; }

  /* A polished vector moth drawn straight onto the canvas — dusty scalloped wings,
     a fuzzy body, feathered antennae, and a soft blue glow when it's edible.
     Far cleaner than an emoji or a flat triangle. */
  function drawMoth(cx,x,y,size,edible,ph){
    // Gemini moth sprite for the normal (dangerous) state; the frightened/edible state
    // keeps the procedural blue moth so a fled enemy still reads distinctly.
    const mtex=(!edible)&&sgTex('moth');
    if(mtex){ const cxp0=x+size/2, cyp0=y+size/2, fl=1+0.05*Math.sin((ph||0)); const hh0=size*(mtex.height/mtex.width);
      cx.save(); cx.translate(cxp0,cyp0); cx.scale(fl,1);
      try{ cx.drawImage(mtex,-size/2,-hh0/2,size,hh0); }catch(e){}
      cx.restore(); return; }
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
    const diff=opts.diff||'medium';
    const HERO=opts.hero||heroAv();     // the chosen runner is the hero, not always Bizzy
    const LAYOUT=opts.layout||'classic';// 3 maze layouts
    // 3 world styles: wall palette + backdrop plate. Default keeps the golden hive look.
    const STYLES={
      hive:  {world:'hive',   wall:['rgba(255,214,122,.96)','rgba(233,168,32,.94)','rgba(168,113,14,.94)'],edge:'rgba(255,243,206,.55)',core:'rgba(120,72,8,.34)'},
      meadow:{world:'meadow', wall:['rgba(176,224,132,.97)','rgba(96,176,80,.95)','rgba(46,112,44,.95)'], edge:'rgba(226,255,206,.5)', core:'rgba(30,84,22,.34)'},
      cavern:{world:'cosmos', wall:['rgba(196,158,255,.96)','rgba(140,96,222,.95)','rgba(82,52,152,.95)'],edge:'rgba(228,214,255,.55)',core:'rgba(60,32,112,.4)'}
    };
    const STY=STYLES[opts.style]||{world:(opts.world||'meadow'),wall:STYLES.hive.wall,edge:STYLES.hive.edge,core:STYLES.hive.core};
    const world=STY.world;
    // Gameplay hardness scales the MAZE itself: bigger grid at higher levels, and a
    // staggered honeycomb wall pattern at Champion. (Spelling words still match the speller.)
    const DIM={easy:[11,9,false],medium:[13,11,false],hard:[15,11,false],champ:[17,13,true]}[diff]||[13,11,false];
    const COLS=DIM[0], ROWS=DIM[1], HEX=DIM[2];
    sgTexPreload(['bee-fly','moth']);   // canonical bee + moth, decoded before first frame
    const CELL=Math.max(24,Math.min(104, Math.floor(Math.min(innerWidth-16,1600)/COLS), Math.floor((innerHeight-208)/ROWS)));
    // Every layout keeps odd rows / odd columns open, so the maze is always fully connected.
    function makeMaze(cols,rows,hex){ const M=[]; // 0 wall · 1 dot · 2 empty
      for(let r=0;r<rows;r++){ const row=[];
        for(let c=0;c<cols;c++){
          if(r===0||r===rows-1||c===0||c===cols-1){ row.push(0); continue; }  // border wall
          let wall=false;
          if(LAYOUT==='spiral'){        // vertical corridors: pillar COLUMNS
            if(c%2===0){ const off=hex?((c/2)%2):0; wall=((r+off)%2===0); }
          } else if(LAYOUT==='chambers'){ // sparse pillars → big open rooms
            wall=(r%2===0 && c%2===0);
          } else {                       // classic: pillar ROWS
            if(r%2===0){ const off=hex?((r/2)%2):0; wall=((c+off)%2===0); }
          }
          row.push(wall?0:1);
        } M.push(row); } return M; }
    const MAZE=makeMaze(COLS,ROWS,HEX);
    /* SPEED IS IN CELLS PER SECOND, and the bee moves at speed x 1.25. It used to run at
       2.5 (easy) to 4.5 (champ) cells/s, against about 1.5-2.0 for the arcade maze game
       everyone is comparing it to — play-tested as "the avatar is moving too fast", and it
       is: at 3.25 cells/s a 13-wide maze crosses in four seconds and a junction arrives
       before you have decided. Cut 25%, which lands the bee at 1.9 to 3.4. The moths keep
       their 0.8 relative disadvantage because the bee's 1.25 multiplier is unchanged, and
       the round is not made harder by the cut: the moth swarm fix above already removed
       far more pressure than a slower bee adds. */
    const CFG={easy:{moths:2,speed:1.5,target:900,time:150},medium:{moths:3,speed:1.95,target:1200,time:180},
               hard:{moths:4,speed:2.35,target:1500,time:180},champ:{moths:5,speed:2.75,target:1800,time:180}}[diff];
    /* how often a moth at a junction turns toward the bee instead of wandering — and
       only within CHASE_R cells, so pressure means "that moth noticed you", never the
       whole pack converging from across the board. First cut (0.45 at medium, no range)
       wiped a random-walking test bee out in EIGHT seconds. */
    const CHASE={easy:0.22,medium:0.32,hard:0.4,champ:0.45}[diff]||0.32;
    const CHASE_R=8;
    /* at most this many moths HUNT at once (the nearest ones) — five converging
       chasers gang-wiped a play-tested evader in half a minute at champ. The rest
       wander: crowd pressure without the pincer. */
    const HUNTERS={easy:1,medium:2,hard:2,champ:2}[diff]||2;
    // bee starts on the centre corridor row (odd row = always open)
    let scr=Math.floor(ROWS/2); if(scr%2===0) scr=Math.max(1,scr-1); let scc=Math.floor(COLS/2);
    try{ if(MAZE[scr][scc]===0) scc=Math.max(1,scc-1); MAZE[scr][scc]=2; }catch(e){}
    let bee={c:scc,r:scr,px:scc,py:scr,dir:[0,0],want:[0,0]};
    let moths=[], score=0, lives=3, t=CFG.time, jelly=null, flee=0, grace=0, flower=null, flowerT=2, card=null, over=false, fx=[];
    let lateMoth=false, spelled=0;
    const hcRound=[];                      // the round's words, for the result screen
    /* A flower is the ONLY way to spell in this game, so it is placed within reach and
       there is always one on the board. It used to pick a uniformly random open cell —
       on a medium maze that averages a dozen cells of corridor away, often past a moth —
       and only reappeared every nine seconds. Now: 3 to 6 cells from the bee, never on top
       of a moth, and re-seeded the instant one is taken. */
    function placeFlower(){
      const bc=Math.round(bee.px), br=Math.round(bee.py);
      const near=[], far=[];
      for(let r=1;r<ROWS-1;r++) for(let c=1;c<COLS-1;c++){
        if(!open(c,r)) continue;
        const d=Math.abs(c-bc)+Math.abs(r-br); if(d<2) continue;
        if(moths.some(m=>Math.abs(Math.round(m.px)-c)+Math.abs(Math.round(m.py)-r)<2)) continue;
        (d<=6?near:far).push({c,r}); }
      const pool=near.length?near:(far.length?far:null);
      if(pool) flower=pool[Math.floor(Math.random()*pool.length)]; }
    // Celebratory splash — petal burst + shockwave ring + "+1 LIFE" pop, drawn in the loop.
    const trail=SGFX.trail(), shake=SGFX.shake(), motes=SGFX.motes(26,COLS*CELL,ROWS*CELL);
    function spawnSplash(){ const cw=COLS*CELL, ch=ROWS*CELL;
      SGFX.spark(fx,cw/2,ch/2,28,['#F0B429','#FF7FB0','#8FA0F5','#4FC98A','#FFD13F'],{speed:4.4,up:1.4});
      SGFX.ring(fx,cw/2,ch/2,'255,209,63',{grow:8});
      SGFX.ring(fx,cw/2,ch/2,'255,255,255',{grow:5,decay:0.034});
      SGFX.say(fx,cw/2,ch/2-4,'+1 LIFE'); shake.hit(7); }
    const words=pool(14); let wi=0;
    for(let i=0;i<CFG.moths;i++){ const mc=1+(i*3)%(COLS-2); moths.push({c:mc,r:1,px:mc,py:1,dir:[1,0]}); }
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
    const cv=host.querySelector('#sg-cv'); const BW=COLS*CELL, BH=ROWS*CELL;
    const dpr=Math.min(2.5,window.devicePixelRatio||1);
    cv.width=Math.round(BW*dpr); cv.height=Math.round(BH*dpr);
    cv.style.width=BW+'px'; cv.style.height=BH+'px';
    const cx=cv.getContext('2d'); cx.setTransform(dpr,0,0,dpr,0,0);
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
    /* Which cell this thing will arrive at next along one axis. Handles being exactly on a
       centre, where floor and ceil both name the cell you are already standing in. */
    function nextCell(v,d){ return d>0?Math.floor(v)+1 : d<0?Math.ceil(v)-1 : Math.round(v); }
    const TURNWIN=0.4;      // cells: how early a turn may be entered before the junction
    /* Grid mover with desired-turn buffering. `sp` is CELLS PER SECOND and `dt` is the
       real elapsed seconds — it used to be `sp/60`, a fixed distance PER FRAME on the
       assumption that every frame is exactly 1/60s. It is not: the loop below was a
       setInterval drifting against the display refresh, so the bee covered the same
       distance in frames of different lengths and read as jumping rather than gliding.
       Distance per second is now constant whatever the frame does. `thr` scales with the
       step, which keeps the snap window smaller than it — the invariant that stops the
       bee vibrating in place at a cell centre. dt is clamped at TWO frames (34ms): a
       hitched frame otherwise paints several frames of travel in one hop, which on a
       device that hitches often IS the jumping. Under the clamp the game runs a shade
       slow through a hitch instead — invisible; the hop was not. */
    function step(ent,sp,dt){
      const spd=sp*Math.max(0.001,Math.min(0.034,dt||1/60)), thr=spd*0.6;
      /* A turn used to be accepted ONLY within one step of a cell centre, so an arrow
         pressed a moment late was dropped in silence and the player waited out a whole
         cell — often a whole corridor — before it took. Play-testing read that as the
         controls being unresponsive, which it was. Two standard maze fixes:
           1. a REVERSE takes effect at once, since turning back needs no repositioning;
           2. a turn entered while approaching a junction is accepted early — and the bee
              GLIDES onto the new corridor diagonally at running speed (the Pac-Man
              cornering rule). It used to be teleported to the corner, a snap of up to
              0.4 cells — ~40px on a big board — on every early turn, which is exactly
              the "jumping, not smooth" that play-testing kept reporting. */
      if(ent===bee && (bee.want[0]||bee.want[1]) && (ent.dir[0]||ent.dir[1])){
        const rev = bee.want[0]===-ent.dir[0] && bee.want[1]===-ent.dir[1];
        if(rev){
          if(open(nextCell(ent.px,bee.want[0]), nextCell(ent.py,bee.want[1]))) ent.dir=bee.want.slice();
        } else {
          const jc=nextCell(ent.px,ent.dir[0]), jr=nextCell(ent.py,ent.dir[1]);
          if(Math.abs(jc-ent.px)<=TURNWIN && Math.abs(jr-ent.py)<=TURNWIN
             && open(jc+bee.want[0], jr+bee.want[1])){
            ent.dir=bee.want.slice();          // turn NOW; the cornering glide below closes the offset
          }
        }
      }
      const atC=Math.abs(ent.px-Math.round(ent.px))<thr && Math.abs(ent.py-Math.round(ent.py))<thr;
      if(atC){ ent.px=Math.round(ent.px); ent.py=Math.round(ent.py);
        if(ent===bee && open(ent.px+bee.want[0], ent.py+bee.want[1])) ent.dir=bee.want.slice();
        if(!open(ent.px+ent.dir[0], ent.py+ent.dir[1])){ if(ent===bee) ent.dir=[0,0]; else {
          const ops=[[1,0],[-1,0],[0,1],[0,-1]].filter(d=>open(ent.px+d[0],ent.py+d[1])&&!(d[0]===-ent.dir[0]&&d[1]===-ent.dir[1]));
          ent.dir=ops[Math.floor(Math.random()*ops.length)]||[-ent.dir[0],-ent.dir[1]]; } }
        /* MOTHS HUNT, THEY DO NOT WANDER. With the swarm gone, a purely random moth at
           80% of the bee's speed effectively never catches anyone — the game's only
           danger was your own cornering. The Pac-Man answer: at a junction a moth turns
           TOWARD the bee (away from her while she has royal jelly) with a per-difficulty
           probability, and wanders the rest of the time so it never becomes a perfect
           shadow that parks on your tail. Danger scales with the level, count does not. */
        if(ent!==bee){ const ops=[[1,0],[-1,0],[0,1],[0,-1]].filter(d=>open(ent.px+d[0],ent.py+d[1])&&!(d[0]===-ent.dir[0]&&d[1]===-ent.dir[1]));
          if(ops.length){
            const near=ent._hunt && Math.abs(ent.px-bee.px)+Math.abs(ent.py-bee.py)<=CHASE_R;
            if(near && Math.random()<CHASE){
              const dHome=d=>Math.abs(ent.px+d[0]-bee.px)+Math.abs(ent.py+d[1]-bee.py);
              ops.sort((a,b)=>flee>0 ? dHome(b)-dHome(a) : dHome(a)-dHome(b));
              ent.dir=ops[0].slice();
            } else if(Math.random()<0.25) ent.dir=ops[Math.floor(Math.random()*ops.length)];
          } } }
      ent.px+=ent.dir[0]*spd; ent.py+=ent.dir[1]*spd;
      /* cornering glide: after an early turn the bee sits a little off the new
         corridor's centreline. Slide onto it at the SAME speed it runs at — a short
         diagonal, finished in a few frames, instead of a snap. (TURNWIN < 0.5 keeps
         Math.round pointing at the junction the turn was accepted for.) */
      if(ent.dir[0]!==0 && ent.py!==Math.round(ent.py)){ const ty=Math.round(ent.py);
        ent.py+=Math.sign(ty-ent.py)*Math.min(spd,Math.abs(ty-ent.py)); }
      else if(ent.dir[1]!==0 && ent.px!==Math.round(ent.px)){ const tx=Math.round(ent.px);
        ent.px+=Math.sign(tx-ent.px)*Math.min(spd,Math.abs(tx-ent.px)); }
    }
    function spellCard(){
      if(wi>=words.length) wi=0; const w=words[wi++]; card={w,typed:'',t:12};
      const el=host.querySelector('#sg-card');
      el.innerHTML='<div class="sg-cardbox"><b>🌼 Spell it to bloom — earn time &amp; coins!</b><button class="sg-cardw" id="sg-cw">'+iconSVG('volume',18)+'</button>'+meaningHTML(w)+'<div class="sg-inrow"><input id="sg-ci" autocomplete="off" autocapitalize="off"><button class="sg-rbtn go" id="sg-cgo">Bloom</button></div><div id="sg-ct">12</div></div>';
      el.style.display='grid'; try{ say(w.w); }catch(e){}
      const inp=el.querySelector('#sg-ci'); inp.focus();
      function submit(){ const ok=sameSpelling(inp.value,w.w); wlog(w,ok); hcRound.push({w:w.w,ok:ok});
        if(ok){ spelled++; score+=150; t+=15; lives=Math.min(5,lives+1); try{ if(typeof addCoins==='function') addCoins(20); }catch(_){}
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
    /* Every other engine in this file drives on requestAnimationFrame; this one was the
       last on setInterval(1000/60), which free-runs against the display refresh and lands
       frames unevenly — visible judder even at a nominal 60fps. */
    /* the clock is the rAF TIMESTAMP, not Date.now(): Date.now() is whole milliseconds,
       so at 60Hz the frame delta alternates 16/17ms — a permanent ±3% speed shimmer
       that reads as micro-judder. The rAF timestamp is sub-millisecond and is the
       display's own clock. */
    let last=performance.now(), dotTimer=0, loop=null, raf=null;
    function frame(ts){
      if(over){ if(loop){ clearInterval(loop); loop=null; } if(raf){ cancelAnimationFrame(raf); raf=null; } return; }
      try{
        // the clock ticks through a spell card too — otherwise the first frame after
        // the card closes gets the whole pause as its dt (clamped to 50ms: a visible lurch)
        const now=(ts!==undefined?ts:performance.now()), dt=Math.min(34, now-last); last=now;
        if(!card){                                   // paused during a spell card
          const ds=dt/1000;
          // the HUNTERS nearest moths get the chase brain this frame; the rest wander
          moths.map(m=>({m,d:Math.abs(m.px-bee.px)+Math.abs(m.py-bee.py)})).sort((a,b)=>a.d-b.d)
            .forEach((x,i)=>{ x.m._hunt = i<HUNTERS; });
          step(bee,CFG.speed*1.25,ds); moths.forEach(m=>step(m, flee>0?CFG.speed*0.6:CFG.speed, ds));
          flee=Math.max(0,flee-dt/1000); grace=Math.max(0,grace-dt/1000);
          const bc=Math.round(bee.px), br=Math.round(bee.py);
          if(MAZE[br]&&MAZE[br][bc]===1){ MAZE[br][bc]=2; score+=10; dots--;
            SGFX.spark(fx,bc*CELL+CELL/2,br*CELL+CELL/2,4,['#FFE9A8','#F0B429'],{speed:1.9,decay:0.06,rx:2,ry:2.6});
            if(dots<=0){ over=true; finish(true); return; } }          // maze cleared → win the round
          if(J.c===bc&&J.r===br&&!J.got){ J.got=true; flee=6; }
          if(flower && Math.round(flower.c)===bc && Math.round(flower.r)===br){ flower=null; flowerT=2; spellCard(); }
          moths.forEach(m=>{ if(Math.abs(m.px-bee.px)<0.5&&Math.abs(m.py-bee.py)<0.5){
            if(flee>0){ score+=50; m.px=6;m.py=1; SGFX.ring(fx,m.px*CELL+CELL/2,m.py*CELL+CELL/2,'150,180,255',{grow:9}); }
            // two seconds of grace after a hit — a moth camped near the respawn point
            // used to chain three deaths in eight seconds
            else if(grace<=0){ grace=2; lives--; shake.hit(11); trail.clear();
              SGFX.spark(fx,bee.px*CELL+CELL/2,bee.py*CELL+CELL/2,14,['#E0553C','#FF9C7A'],{speed:4});
              bee.px=6;bee.py=5;bee.dir=[0,0];
              if(lives<=0){ over=true; finish(false); } } } });
          dotTimer+=dt/1000; if(dotTimer>=1){ dotTimer=0; t--; flowerT--;
            if(flowerT<=0&&!flower){ flowerT=3; placeFlower(); }
            /* Moths no longer breed. This line used to add one on a 16% roll every second
               up to CFG.moths+6, which saturated in 38 seconds and left EVERY difficulty
               with a swarm: easy 8 moths, champ 11, in a maze of 51 to 130 open cells. The
               per-difficulty counts above stopped meaning anything, and the round stopped
               being about words — you spent it running. One late arrival, once, at the
               halfway mark, is enough to keep the maze from going stale. */
            if(!lateMoth && t<=Math.floor(CFG.time/2)){ lateMoth=true;
              moths.push({c:scc,r:1,px:scc,py:1,dir:[[1,0],[-1,0]][Math.floor(Math.random()*2)]}); }
            /* Time-out: the score alone used to decide it, and score comes from dots and
               eaten moths — so it was possible to win without spelling a word. Two words is
               a low bar and it makes the point: this is a spelling game with a maze in it. */
            if(t<=0){ over=true; finish(score>=CFG.target && spelled>=2); } }
          draw();
        }
      }catch(err){ /* never let a render/logic error stop the loop — the bee must keep moving */ }
    }
    function draw(){
      shake.begin(cx);
      cx.clearRect(-40,-40,BW+80,BH+80);
      const T=Date.now();
      // painted play field, scrimmed so the maze reads on top of it
      if(!drawWorld(cx,world,0,0,BW,BH)){ cx.fillStyle='#4C7A54'; cx.fillRect(0,0,BW,BH); }
      SGFX.scrim(cx,BW,BH,0.34);
      SGFX.drawMotes(cx,motes,BW,BH,T);
      /* the walls are HONEYCOMB - six sides, a light source above, a shadow under
         each cell. They used to be rounded squares at 30% opacity, which is
         neither a honeycomb nor a wall. */
      for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){ const v=MAZE[r][c];
        const px=c*CELL+CELL/2, py=r*CELL+CELL/2;
        if(v===0){
          cx.save(); cx.shadowColor='rgba(8,5,20,.55)'; cx.shadowBlur=CELL*0.22; cx.shadowOffsetY=CELL*0.09;
          const g=cx.createLinearGradient(0,py-CELL*0.5,0,py+CELL*0.5);
          g.addColorStop(0,STY.wall[0]); g.addColorStop(.55,STY.wall[1]); g.addColorStop(1,STY.wall[2]);
          cx.fillStyle=g; SGFX.hex(cx,px,py,CELL*0.53); cx.fill(); cx.restore();
          cx.strokeStyle=STY.edge; cx.lineWidth=1.4; SGFX.hex(cx,px,py,CELL*0.53); cx.stroke();
          cx.fillStyle=STY.core; SGFX.hex(cx,px,py,CELL*0.30); cx.fill();
        }
        else if(v===1) SGFX.orb(cx,px,py,CELL*0.10,'#FFF3C4','#F0B429',T/420+(c+r)*0.7);
      }
      if(!J.got) SGFX.orb(cx,J.c*CELL+CELL/2,J.r*CELL+CELL/2,CELL*0.24,'#FFFFFF','#FFC93F',T/260);
      if(flower){ const fi=sgImg('env-meadow'); cx.font=(CELL*0.72)+'px serif'; cx.fillText('🌼',flower.c*CELL+CELL*0.14,flower.r*CELL+CELL*0.8); }
      // moths — the Gemini purple moth sprite (blue glow when edible); SGART grey-moth then vector fallback
      const mtex=sgTex('moth'), mi=sgImg('grey-moth'), _ph=Date.now()/90;
      moths.forEach((m,i)=>{ const mx=m.px*CELL, my=m.py*CELL;
        if(flee>0){ cx.fillStyle='rgba(120,150,255,.45)'; cx.beginPath(); cx.arc(mx+CELL/2,my+CELL/2,CELL*0.44,0,7); cx.fill(); }
        let md=false; const bob=Math.sin(_ph+i)*CELL*0.03;
        if(mtex){ try{ const s=CELL*1.0, hh=s*(mtex.height/mtex.width); cx.drawImage(mtex,mx+(CELL-s)/2,my+(CELL-hh)/2+bob,s,hh); md=true; }catch(e){} }
        else if(mi){ try{ const s=CELL*0.96; cx.drawImage(mi,mx+(CELL-s)/2,my+(CELL-s)/2+bob,s,s); md=true; }catch(e){} }
        if(!md) drawMoth(cx,mx+CELL*0.04,my+CELL*0.04,CELL*0.92,flee>0,_ph+i); });
      // the bee leaves honey behind her, so motion has a direction you can see
      trail.push(bee.px*CELL+CELL/2, bee.py*CELL+CELL/2, 16);
      trail.draw(cx,'255,205,80',CELL*0.30);
      // the RUNNER is the chosen hero avatar (falls back to the bee-fly sprite / Bizzy)
      const usingAv=!!avImg(HERO);
      const bi=avImg(HERO)||sgTex('bee-fly')||sgImg('bizzy-side-fly')||avImg('bizzy'), bx=bee.px*CELL, by=bee.py*CELL; let beeDrew=false;
      if(bi){ try{ const bob=1+0.05*Math.sin(Date.now()/110), s=CELL*1.12*bob, hh=bi.height&&bi.width?s*(bi.height/bi.width):s;
        cx.save(); cx.translate(bx+CELL/2,by+CELL/2);
        if(bee.dir[0]<0) cx.scale(-1,1);              // flip when flying left
        cx.drawImage(bi,-s/2,-hh/2,s,hh); cx.restore(); beeDrew=true; }catch(e){ try{cx.restore();}catch(_){} } }
      if(!beeDrew){ cx.fillStyle='#F0B429'; cx.beginPath(); cx.arc(bx+CELL/2,by+CELL/2,CELL*0.34,0,7); cx.fill();
        cx.fillStyle='#2B2117'; cx.fillRect(bx+CELL*0.3,by+CELL*0.34,CELL*0.4,CELL*0.09); }
      SGFX.run(cx,fx);
      SGFX.vignette(cx,BW,BH,0.40);
      shake.end(cx);
      host.querySelector('#sg-score').textContent='🍯 '+score+' / '+CFG.target;
      host.querySelector('#sg-time').textContent='⏱ '+Math.floor(t/60)+':'+String(t%60).padStart(2,'0');
      host.querySelector('#sg-lives').textContent='❤'.repeat(Math.max(0,lives));
    }
    function finish(win){ if(loop){ clearInterval(loop); loop=null; } removeEventListener('keydown',key);
      const stars=win?(score>=CFG.target*1.5?3:score>=CFG.target*1.2?2:1):0; endCard(win,stars); }
    function endCard(win,stars){
      const el=host.querySelector('#sg-card'); if(!el){ done({win,score,stars}); return; }
      /* This screen used to hand back a honey count and ★★☆ typed as glyphs, and never
         said which words the round had been about — the one thing a child needs from it.
         SGUI.result prints the log, right and wrong marked, each chip tappable. */
      el.innerHTML=SGUI.result({ win, stars, score, scoreLabel:'honey', words:hcRound,
        title: win?'The meadow is free':'Out of time' });
      el.style.display='grid'; SGUI.bind(el);
      el.querySelector('#sg-again').onclick=()=>{ el.style.display='none'; el.innerHTML=''; honeycombRun(host,opts,done); };
      el.querySelector('#sg-cont').onclick=()=>{ el.style.display='none'; el.innerHTML=''; done({win,score,stars}); };
    }
    if(window.SB_DEBUG) window._maze={ state:()=>({px:bee.px,py:bee.py,dir:bee.dir.slice(),lives,cell:CELL,cols:COLS,rows:ROWS,moths:moths.map(m=>({px:m.px,py:m.py}))}),
      want:d=>{bee.want=d.slice();}, openAt:(c,r)=>open(c,r) };   // capture tooling: watch the bee glide
    (function pump(){ raf=requestAnimationFrame(ts=>{ frame(ts); if(!over) pump(); }); })();
    return { destroy(){ over=true; if(loop){ clearInterval(loop); loop=null; } removeEventListener('keydown',key); } };
  }


  /* ---------- ENGINE B · KEEP FLYING (flappy) ---------- */
  function keepFlying(host, opts, done){
    const Wd=Math.min(innerWidth-8,1600), Ht=Math.max(360,innerHeight-104);
    const diff=opts.diff||'medium', world=opts.world||'opensky';
    const HERO=opts.hero||heroAv();     // the chosen hero rides the bee
    // Real flappy feel: a world that actually moves, honest gravity, and towers spaced
    // ~500px apart (every = seconds between spawns, tuned to each speed) so you get time
    // to read the next gap instead of meeting a wall the moment the last one clears.
    const CFG={easy:{gap:276,speed:2.7,pots:8,every:3.02},medium:{gap:232,speed:3.4,pots:10,every:2.47},
               hard:{gap:204,speed:3.9,pots:10,every:2.15},champ:{gap:185,speed:4.4,pots:12,every:1.86}}[diff];
    const MAXLIVES=5;
    host.innerHTML='<div class="sg-hud"><span id="sg-pots">🍯 0/'+CFG.pots+'</span><span class="sg-flyprog"><i id="sg-fill"></i><b>⛩️</b></span><span id="sg-coins">🪙 0</span><span id="sg-lives"></span></div><canvas id="sg-cv"></canvas><div id="sg-card"></div>';
    const cv=host.querySelector('#sg-cv');
    // render at the device's real pixel density — crisp on tablets, no pixelation
    const dpr=Math.min(2.5,window.devicePixelRatio||1);
    cv.width=Math.round(Wd*dpr); cv.height=Math.round(Ht*dpr);
    cv.style.width=Wd+'px'; cv.style.height=Ht+'px';
    const cx=cv.getContext('2d'); cx.setTransform(dpr,0,0,dpr,0,0);
    let bee={y:Ht/2,vy:0}, obs=[], pot=null, banked=0, lives=3, t=0, over=false, card=null, graceUntil=0, inv=0;
    let moths=[], coins=[], hearts=[], coinsGot=0, gate=null, started=false;
    const kfRound=[];                      // the flight's words, for the result screen
    const feed=wordFeed(CFG.pots+6);
    sgTexPreload(['bee-fly','moth','fly-sky','honeypot','coin','pillar']);   // decode game art before first frame
    /* per-world premium palettes; anything unlisted uses its illustrated plate */
    const PAL={
      opensky:{top:'#3D8BD4',mid:'#7FC0EC',bot:'#E9F6FF',sun:['rgba(255,251,225,.95)','rgba(255,240,180,.42)'],sunCore:'rgba(255,252,235,.96)',hill:'#9CCB7A',hill2:'#7FB662',pill:['#F0B429','#D89614'],stars:0,birds:1},
      sky:null, // alias, set below
      flyway:{top:'#7A4FB0',mid:'#E88A5D',bot:'#FFD9A0',sun:['rgba(255,214,170,.98)','rgba(255,170,110,.5)'],sunCore:'rgba(255,236,200,.98)',hill:'#8A6AA8',hill2:'#6E4E8E',pill:['#E8A03C','#C67F1E'],stars:8,birds:1},
      cosmos:{top:'#0B0B2E',mid:'#232366',bot:'#3A2E7A',sun:['rgba(190,170,255,.5)','rgba(140,120,255,.22)'],sunCore:'rgba(235,230,255,.95)',hill:'#1C1846',hill2:'#141034',pill:['#7B68D8','#5646AC'],stars:70,birds:0}};
    PAL.sky=PAL.opensky;
    const pal=PAL[world]||null;
    const clouds=[]; for(let i=0;i<7;i++) clouds.push({x:Math.random()*Wd, y:12+Math.random()*(Ht*0.55), s:0.4+Math.random()*1.1, sp:0.1+Math.random()*0.3});
    const stars=[]; if(pal&&pal.stars) for(let i=0;i<pal.stars;i++) stars.push({x:Math.random()*Wd,y:Math.random()*Ht*0.8,r:0.6+Math.random()*1.5,tw:Math.random()*7});
    const birds=[]; 
    let holding=false;
    const flap=e=>{ if(e.key!==' ')return; bee.vy=-7.0; e.preventDefault&&e.preventDefault(); };
    const pdown=e=>{ if(e.target.closest&&e.target.closest('#sg-card,.sg-howto'))return; holding=true; if(bee.vy>-3.4) bee.vy=-5.0; e.preventDefault&&e.preventDefault(); };
    const pup=()=>{ holding=false; };
    addEventListener('keydown',flap);
    host.addEventListener('pointerdown',pdown); addEventListener('pointerup',pup); addEventListener('pointercancel',pup);
    /* COLLECTIBLES SIT ON THE FLIGHT PATH — this is the second attempt and the first was
       wrong in an instructive way.
       Originally each pickup chose its own random height, blind to the pillars, so a honey
       pot could arrive flat against a wall: spell it or crash, pick one. The first fix put
       it 170px past a tower at THAT tower's gap height, which sounded right and plays
       badly, because a flappy bee cannot hold a height. To take the pot it had to thread
       gap N, then HOLD that line for a second, then immediately climb or dive to gap N+1 at
       a different random height. Three precise manoeuvres for one word.
       The bee's actual path is the line from gap N to gap N+1. So a pickup goes at the
       MIDPOINT of that line: half way between the two towers, at the mean of their two gap
       centres. It is exactly where the bee already is at exactly the moment it is there,
       and everything drifts left at one speed so the geometry never moves.
       That is why a pickup is placed when tower N+1 spawns, not tower N: only then are both
       ends of the line known. */
    /* prevTower is the LIVE tower object, never a snapshot. It was {x:o.x,mid} taken at
       spawn time — but towers drift left every frame, so by the next spawn that stored x
       was still Wd+30 and the "midpoint" (Wd+30 + Wd+30)/2 sat EXACTLY on the new
       tower's pillar: the honey pot in the wall, again ("do or die" — Amrita 8.26).
       Holding the object means prevTower.x has drifted with the world when it is read. */
    let pending=[], prevTower=null;
    function spawn(){ const g=CFG.gap, y=60+Math.random()*(Ht-120-g); const o={x:Wd+30,y,g,mid:y+g/2}; obs.push(o);
      const mid=o.mid, k=pending.shift();
      if(k && prevTower){
        const px=(prevTower.x+o.x)/2, py=(prevTower.mid+mid)/2;
        if(k==='pot'&&!pot) pot={x:px,y:py-18};                 // pickup tests pot.y+18
        else if(k==='coins') spawnCoins(px,py,prevTower.mid,mid,g);
        else if(k==='heart') hearts.push({x:px,y:py-16,ph:0});
      } else if(k) pending.unshift(k);        // no previous tower yet — wait one spawn
      prevTower=o; }
    function spawnMoth(){ const big=Math.random()<0.14;
      moths.push({x:Wd+40,y:60+Math.random()*(Ht-140),ph:Math.random()*7,amp:14+Math.random()*26,sp:CFG.speed*(0.9+Math.random()*0.5),s:big?54:38,big}); }
    /* A coin run is laid ALONG the path between the two gaps, five coins strung on that
       line, rather than arced across the corridor. Following it IS flying the route. */
    function spawnCoins(px,py,mA,mB,g){ const span=4*34;
      for(let i=0;i<5;i++){ const f=(i-2)/4;                 // -0.5 .. +0.5 around the midpoint
        coins.push({x:px+f*span, y:py+(mB-mA)*f, ph:i*0.7}); } }
    function spellStop(){
      const w=feed.next(); card={w};
      const el=host.querySelector('#sg-card');
      el.innerHTML='<div class="sg-cardbox"><b>🍯 Honey pot! Spell to bank it</b><button class="sg-cardw" id="sg-cspk">'+iconSVG('volume',18)+'</button>'+meaningHTML(w)+'<div class="sg-inrow"><input id="sg-ci" autocomplete="off" autocapitalize="off"><button class="sg-rbtn go" id="sg-cgo">Bank</button></div></div>';
      el.style.display='grid'; try{ say(w.w); }catch(e){}
      const inp=el.querySelector('#sg-ci'); inp.focus();
      function submit(){ const ok=sameSpelling(inp.value,w.w); wlog(w,ok); kfRound.push({w:w.w,ok:ok});
        if(ok){ banked++;
          if(lives<MAXLIVES){ lives++; try{flash('🍯 Pot banked — ❤ Extra life! '+banked+'/'+CFG.pots);}catch(_){} }
          else { try{flash('🍯 Pot banked! '+banked+'/'+CFG.pots+' (lives full)');}catch(_){} }
          try{if(typeof sfx==='function')sfx('correct');}catch(_){}
        } else { bee.y=Math.min(Ht-40,bee.y+40); try{flash('Almost! The pot floats ahead…');}catch(_){} }
        el.style.display='none'; card=null; bee.vy=0; graceUntil=t+2.6;
        if(banked>=CFG.pots&&!gate){ gate={x:Wd+80}; try{flash('⛩️ The Hive Gates appear — fly to them!');}catch(_){} } }
      inp.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); submit(); } };
      el.querySelector('#sg-cgo').onclick=submit;
      el.querySelector('#sg-cspk').onclick=()=>{ try{ say(w.w); }catch(e){} };
    }
    let last=0, spawnT=0, potT=4, mothT=6, coinT=3, heartT=16;
    function frame(ts){ if(over) return;
      if(card||!started){ last=ts; requestAnimationFrame(frame); return; }
      const dt=Math.min(50,ts-last); last=ts; t+=dt/1000; potT-=dt/1000; mothT-=dt/1000; coinT-=dt/1000; heartT-=dt/1000;
      const GRACE=(t<3)||(t<graceUntil);
      if(holding) bee.vy-=0.65;                                 // hold to climb (beats gravity)
      if(GRACE){ bee.vy*=0.9; bee.y+=bee.vy; bee.y=Math.max(30,Math.min(Ht-40,bee.y)); }
      else { spawnT+=dt/1000; bee.vy+=0.243; bee.vy=Math.min(bee.vy,9.0); bee.y+=bee.vy; }   // gravity and lift scaled together: same feel, quicker answer
      if(!gate){
        if(spawnT>CFG.every){ spawnT=0; spawn(); }              // towers spaced to the world speed
        // Collectibles are QUEUED here and positioned by the next tower (see spawn()).
        // Coins and hearts wait while a pot is pending or in play: the pot is the one that
        // stops the game to ask for a spelling, so nothing is allowed to compete with it.
        const potBusy = pot || pending.indexOf('pot')>=0;
        if(potT<=0&&!potBusy){ potT=8; pending.push('pot'); }
        if(mothT<=0){ mothT=4.8+Math.random()*3.2; spawnMoth(); } // fewer moths
        if(coinT<=0&&!potBusy&&pending.indexOf('coins')<0){ coinT=6+Math.random()*5; pending.push('coins'); }
        if(heartT<=0){ heartT=13+Math.random()*8; if(lives<MAXLIVES&&!potBusy&&pending.indexOf('heart')<0) pending.push('heart'); }
      } else gate.x-=CFG.speed;
      obs.forEach(o=>o.x-=CFG.speed); if(pot) pot.x-=CFG.speed;
      moths.forEach(m=>{ m.x-=m.sp; m.ph+=dt/130; m.y+=Math.sin(m.ph)*0.8*(m.amp/22); });
      coins.forEach(c=>{ c.x-=CFG.speed; c.ph+=dt/240; });
      hearts.forEach(h=>{ h.x-=CFG.speed; h.ph+=dt/300; });   // MUST match the towers, or a placed heart drifts off its lane
      obs=obs.filter(o=>o.x>-40); moths=moths.filter(m=>m.x>-70); coins=coins.filter(c=>c.x>-30); hearts=hearts.filter(h=>h.x>-30);
      // collisions — the CEILING is soft (just don't fly off-screen), but the GROUND is deadly
      if(bee.y<24){ bee.y=24; if(bee.vy<0) bee.vy=0; }
      if(bee.y>=Ht-26){ bee.y=Ht-26; if(!GRACE&&t>inv){ try{flash('💥 Crash landing!');}catch(_){} hit(); } }
      if(!GRACE&&t>inv){ obs.forEach(o=>{ if(o.x<70&&o.x>10){ if(bee.y<o.y||bee.y>o.y+o.g){ hit(); o.x=-99; } } });
        moths.forEach(m=>{ if(Math.abs(m.x-60)<m.s*0.45&&Math.abs(m.y-bee.y)<m.s*0.45){ hit(); m.x=-99; } }); }
      coins=coins.filter(c=>{ if(Math.abs(c.x-60)<26&&Math.abs(c.y-bee.y)<30){ coinsGot++; try{if(typeof sfx==='function')sfx('coin');}catch(e){} return false; } return true; });
      hearts=hearts.filter(h=>{ if(Math.abs(h.x-60)<28&&Math.abs(h.y-bee.y)<32){ if(lives<MAXLIVES){lives++; try{flash('❤ Extra life!');}catch(_){}} return false; } return true; });
      if(pot&&pot.x<74&&pot.x>6&&Math.abs(bee.y-(pot.y+18))<46){ pot=null; spellStop(); }
      if(pot&&pot.x<=-30) pot=null;
      if(gate&&gate.x<86){ over=true; finish(true); return; }
      draw(); requestAnimationFrame(frame);
    }
    function hit(){ lives--; inv=t+1.6; bee.vy=-2;
      try{if(typeof sfx==='function')sfx('wrong');}catch(e){}
      if(lives<=0){ over=true; finish(false); } }
    function puff(x,y,s){ cx.save(); cx.fillStyle='rgba(255,255,255,.92)';
      cx.shadowColor='rgba(120,155,195,.28)'; cx.shadowBlur=10*s; cx.shadowOffsetY=5;
      const e=(dx,dy,r)=>{ cx.beginPath(); cx.ellipse(x+dx*s,y+dy*s,r*s,r*s*0.72,0,0,7); cx.fill(); };
      e(0,0,27); e(25,5,20); e(-25,6,19); e(11,-11,18); e(-11,-8,16); cx.restore(); }
    function drawBackdrop(){
      // painted Ghibli sky for the daytime world; night/sunset worlds keep the procedural sky
      const sky=(world==='opensky'||world==='sky')&&sgTex('fly-sky');
      if(sky){
        const ar=sky.width/sky.height, car=Wd/Ht; let dw,dh;
        if(ar>car){ dh=Ht; dw=Ht*ar; } else { dw=Wd; dh=Wd/ar; }
        try{ cx.drawImage(sky,(Wd-dw)/2,(Ht-dh)/2,dw,dh); }catch(e){}
        return;   // the painted sky already carries clouds, sun and hills — no procedural overlay
      }
      const g=cx.createLinearGradient(0,0,0,Ht);
      g.addColorStop(0,pal.top); g.addColorStop(0.52,pal.mid); g.addColorStop(1,pal.bot);
      cx.fillStyle=g; cx.fillRect(0,0,Wd,Ht);
      stars.forEach(s=>{ s.tw+=0.03; cx.globalAlpha=0.45+0.55*Math.abs(Math.sin(s.tw));
        cx.fillStyle='#FFF'; cx.beginPath(); cx.arc(s.x,s.y,s.r,0,7); cx.fill(); });
      cx.globalAlpha=1;
      const sx=Wd*0.83, sy=Ht*0.19;
      const sg=cx.createRadialGradient(sx,sy,4,sx,sy,130);
      sg.addColorStop(0,pal.sun[0]); sg.addColorStop(0.4,pal.sun[1]); sg.addColorStop(1,'rgba(255,240,180,0)');
      cx.fillStyle=sg; cx.fillRect(0,0,Wd,Ht);
      cx.beginPath(); cx.arc(sx,sy,25,0,7); cx.fillStyle=pal.sunCore; cx.fill();
      // far parallax cloud band + rolling hills silhouette
      const cloudDim=pal===PAL.cosmos?0.45:1;
      clouds.forEach(c=>{ if(!card){ c.x-=c.sp*(0.5+c.s*0.55); if(c.x<-90*c.s){ c.x=Wd+80*c.s; c.y=12+Math.random()*(Ht*0.55); } }
        cx.globalAlpha=(0.35+0.6*Math.min(1,c.s))*cloudDim; puff(c.x,c.y,c.s); cx.globalAlpha=1; });
      const hill=(col,h0,amp,ph)=>{ cx.fillStyle=col; cx.beginPath(); cx.moveTo(0,Ht);
        for(let x=0;x<=Wd;x+=16) cx.lineTo(x,Ht-h0-Math.sin(x/95+ph+t*0.12)*amp);
        cx.lineTo(Wd,Ht); cx.closePath(); cx.fill(); };
      hill(pal.hill,26,9,1.7); hill(pal.hill2,13,6,4.2);
      if(pal.birds&&Math.random()<0.002&&birds.length<3) birds.push({x:Wd+20,y:26+Math.random()*Ht*0.3,ph:0});
      for(const b of birds){ b.x-=1.1; b.ph+=0.14;
        cx.strokeStyle='rgba(40,60,90,.55)'; cx.lineWidth=1.6; cx.lineCap='round'; const f=Math.sin(b.ph)*3;
        cx.beginPath(); cx.moveTo(b.x-6,b.y-f); cx.quadraticCurveTo(b.x-2,b.y+2,b.x,b.y);
        cx.quadraticCurveTo(b.x+2,b.y+2,b.x+6,b.y-f); cx.stroke(); }
      for(let i=birds.length-1;i>=0;i--) if(birds[i].x<-12) birds.splice(i,1);
    }
    /* hand-drawn shaded bee with animated wings; the child's avatar rides on its back */
    function drawFlyer(x,y,tilt){
      const wf=Math.sin(t*26), s=1, btex=sgTex('bee-fly');
      cx.save(); cx.translate(x,y); cx.rotate(tilt);
      if(btex){
        const bw=66, bh=bw*(btex.height/btex.width);
        try{ cx.drawImage(btex,-bw*0.5,-bh*0.46,bw,bh); }catch(e){}
        // rider: the child's avatar in a little bubble on the bee's back
        const av=avImg(HERO);
        if(av){ try{ const bob=Math.sin(t*7)*1.2, rx=-bw*0.06, ry=-bh*0.24+bob, rr=9;
          cx.save(); cx.beginPath(); cx.arc(rx,ry,rr,0,7); cx.clip();
          cx.drawImage(av,rx-rr,ry-rr,rr*2,rr*2); cx.restore();
          cx.strokeStyle='rgba(60,40,10,.5)'; cx.lineWidth=1.2;
          cx.beginPath(); cx.arc(rx,ry,rr,0,7); cx.stroke(); }catch(e){ try{cx.restore();}catch(_){} } }
        cx.restore();
      } else {
      // wings behind body
      for(const [dx,dy,rot,len] of [[-2,-14,-0.5-wf*0.35,20],[4,-13,-0.15-wf*0.3,15]]){
        cx.save(); cx.translate(dx,dy); cx.rotate(rot);
        const wg=cx.createLinearGradient(0,-len,0,0);
        wg.addColorStop(0,'rgba(210,235,255,.9)'); wg.addColorStop(1,'rgba(160,200,255,.35)');
        cx.fillStyle=wg; cx.beginPath(); cx.ellipse(0,-len/2,7,len/2,0,0,7); cx.fill();
        cx.strokeStyle='rgba(120,170,230,.5)'; cx.lineWidth=1; cx.stroke(); cx.restore(); }
      // body: fuzzy gradient capsule with stripes and a stinger
      const bg=cx.createLinearGradient(0,-14,0,14);
      bg.addColorStop(0,'#FFD95E'); bg.addColorStop(0.55,'#F5B32B'); bg.addColorStop(1,'#C98A12');
      cx.fillStyle=bg; cx.beginPath(); cx.ellipse(-2,0,20,14,0,0,7); cx.fill();
      cx.save(); cx.beginPath(); cx.ellipse(-2,0,20,14,0,0,7); cx.clip();   // stripes stay inside the body
      cx.fillStyle='#3A2B10';
      for(const bx of [-9,-1,7]){ cx.beginPath(); cx.ellipse(bx,0,3.4,13.4,0,0,7); cx.fill(); }
      cx.restore();
      cx.fillStyle='#3A2B10'; cx.beginPath(); cx.moveTo(-24,0); cx.lineTo(-19,-4); cx.lineTo(-19,4); cx.closePath(); cx.fill();
      // head
      cx.fillStyle='#F7BD37'; cx.beginPath(); cx.arc(15,-2,9.5,0,7); cx.fill();
      cx.fillStyle='rgba(255,255,255,.35)'; cx.beginPath(); cx.ellipse(13,-6,4,2.4,-0.5,0,7); cx.fill();
      cx.fillStyle='#FFF'; cx.beginPath(); cx.arc(18,-4,3.6,0,7); cx.fill();
      cx.fillStyle='#241A0C'; cx.beginPath(); cx.arc(19,-4,1.9,0,7); cx.fill();
      cx.fillStyle='#FFF'; cx.beginPath(); cx.arc(19.7,-4.8,0.7,0,7); cx.fill();
      cx.strokeStyle='#241A0C'; cx.lineWidth=1.3; cx.lineCap='round';
      cx.beginPath(); cx.arc(16,2,3,0.25,2.6); cx.stroke();
      cx.beginPath(); cx.moveTo(13,-10); cx.quadraticCurveTo(11,-17,7,-18); cx.moveTo(17,-10); cx.quadraticCurveTo(17,-17,21,-18); cx.stroke();
      cx.fillStyle='#241A0C'; cx.beginPath(); cx.arc(7,-18,1.6,0,7); cx.arc(21,-18,1.6,0,7); cx.fill();
      // rider: the child's avatar, bobbing on the bee's back
      const av=avImg(HERO);
      if(av){ try{ const bob=Math.sin(t*7)*1.3;
        cx.save(); cx.beginPath(); cx.arc(-4,-16+bob,10,0,7); cx.clip();
        cx.drawImage(av,-14,-26+bob,20,20); cx.restore();
        cx.strokeStyle='rgba(60,40,10,.5)'; cx.lineWidth=1.2;
        cx.beginPath(); cx.arc(-4,-16+bob,10,0,7); cx.stroke(); }catch(e){ try{cx.restore();}catch(_){}} }
      cx.restore();
      }
      // grace sparkle trail
      if(t<graceUntil||t<3){ for(let i=0;i<2;i++){ const a=Math.random();
        cx.globalAlpha=0.5*a; cx.fillStyle='#FFE28A';
        cx.beginPath(); cx.arc(x-24-a*22,y+(Math.random()-0.5)*16,1.5+a*2,0,7); cx.fill(); }
        cx.globalAlpha=1; }
    }
    function drawCoin(c){ const sc=Math.abs(Math.cos(c.ph));
      cx.save(); cx.translate(c.x,c.y); cx.scale(Math.max(0.15,sc),1);
      const tex=sgTex('coin');
      if(tex){ const s=26; try{ cx.drawImage(tex,-s/2,-s/2,s,s); }catch(e){} }
      else {
        const g=cx.createRadialGradient(-3,-3,1,0,0,11);
        g.addColorStop(0,'#FFEFA8'); g.addColorStop(0.7,'#F5C33B'); g.addColorStop(1,'#C98F15');
        cx.fillStyle=g; cx.beginPath(); cx.arc(0,0,11,0,7); cx.fill();
        cx.strokeStyle='#8F6407'; cx.lineWidth=2; cx.stroke();
        cx.fillStyle='#8F6407'; cx.font='800 11px Hanken,sans-serif'; cx.textAlign='center'; cx.fillText('★',0,4); }
      cx.restore(); }
    function drawHeart(h){ const p=1+0.1*Math.sin(h.ph*4);
      cx.save(); cx.translate(h.x,h.y); cx.scale(p,p);
      const g=cx.createRadialGradient(-3,-4,1,0,0,14);
      g.addColorStop(0,'#FF9DB0'); g.addColorStop(0.6,'#F04A6D'); g.addColorStop(1,'#C22B4C');
      cx.fillStyle=g; cx.beginPath();
      cx.moveTo(0,4); cx.bezierCurveTo(-14,-6,-8,-16,0,-8); cx.bezierCurveTo(8,-16,14,-6,0,4); cx.closePath(); cx.fill();
      cx.fillStyle='rgba(255,255,255,.6)'; cx.beginPath(); cx.ellipse(-4,-8,2.6,1.6,-0.6,0,7); cx.fill();
      cx.restore(); }
    function drawGate(){ if(!gate) return; const gx=gate.x;
      cx.save();
      const glow=cx.createRadialGradient(gx+30,Ht/2,10,gx+30,Ht/2,180);
      glow.addColorStop(0,'rgba(255,215,120,.35)'); glow.addColorStop(1,'rgba(255,215,120,0)');
      cx.fillStyle=glow; cx.fillRect(gx-140,0,300,Ht);
      const pillar=(px)=>{ const g=cx.createLinearGradient(px,0,px+26,0);
        g.addColorStop(0,'#FFD86B'); g.addColorStop(1,'#C9911B');
        cx.fillStyle=g; cx.fillRect(px,40,26,Ht-40);
        cx.fillStyle='rgba(120,80,10,.5)'; cx.fillRect(px,40,26,6); };
      pillar(gx); pillar(gx+66);
      cx.fillStyle='#E8A93C'; cx.beginPath();
      cx.moveTo(gx-12,52); cx.quadraticCurveTo(gx+46,8,gx+104,52); cx.lineTo(gx+104,40); cx.quadraticCurveTo(gx+46,-6,gx-12,40); cx.closePath(); cx.fill();
      cx.fillStyle='#7A4A08'; cx.font='800 15px Fraunces,serif'; cx.textAlign='center';
      cx.fillText('🐝 HIVE',gx+46,34);
      cx.restore(); }
    function draw(){
      if(pal){ drawBackdrop(); }
      else if(!drawWorld(cx,world,0,0,Wd,Ht)){ const g=cx.createLinearGradient(0,0,0,Ht);
        g.addColorStop(0,'#3D8BD4'); g.addColorStop(1,'#E9F6FF'); cx.fillStyle=g; cx.fillRect(0,0,Wd,Ht); }
      const pc=(pal||PAL.opensky).pill, ptex=sgTex('pillar');
      obs.forEach(o=>{
        const PW=44;
        const body=(yy,hh)=>{ const g=cx.createLinearGradient(o.x,0,o.x+PW,0); g.addColorStop(0,pc[0]); g.addColorStop(1,pc[1]);
          cx.fillStyle=g; cx.fillRect(o.x,yy,PW,hh); cx.fillStyle='rgba(255,255,255,.18)'; cx.fillRect(o.x,yy,7,hh);
          cx.fillStyle='rgba(0,0,0,.12)';
          for(let hy=yy+10;hy<yy+hh-8;hy+=22) for(let hx=o.x+8;hx<o.x+40;hx+=13){ cx.beginPath();
            for(let k=0;k<6;k++){ const a=Math.PI/3*k+Math.PI/6; const px=hx+Math.cos(a)*5, py=hy+Math.sin(a)*5; k?cx.lineTo(px,py):cx.moveTo(px,py); }
            cx.closePath(); cx.fill(); }
          cx.strokeStyle='rgba(60,40,10,.45)'; cx.lineWidth=2; cx.strokeRect(o.x,yy,PW,hh); };
        // rounded, shaded cap sculpted from the pillar sprite's rounded end, at each pipe mouth
        const cap=(mouthY,down)=>{ if(!ptex) return; const cw=PW+12, ch=cw*0.6;
          cx.save(); cx.translate(o.x+PW/2, mouthY); if(down) cx.scale(1,-1);
          try{ cx.drawImage(ptex, 0,0,ptex.width,Math.round(ptex.height*0.42), -cw/2, -ch*0.72, cw, ch); }catch(e){}
          cx.restore(); };
        body(0,o.y); cap(o.y,true);
        body(o.y+o.g,Ht-o.y-o.g); cap(o.y+o.g,false); });
      coins.forEach(drawCoin); hearts.forEach(drawHeart);
      moths.forEach(m=>drawMoth(cx,m.x-m.s/2,m.y-m.s/2,m.s,false,m.ph*3));
      if(pot){ const px=pot.x+16, py=pot.y+22, bobp=Math.sin(t*3)*3;
        cx.save(); cx.translate(px,py+bobp);
        const hg=cx.createRadialGradient(px*0,0,2,0,0,30);
        hg.addColorStop(0,'rgba(255,220,120,.5)'); hg.addColorStop(1,'rgba(255,220,120,0)');
        cx.fillStyle=hg; cx.beginPath(); cx.arc(0,0,30,0,7); cx.fill();
        const tex=sgTex('honeypot');
        if(tex){ const s=44, hh=s*(tex.height/tex.width); try{ cx.drawImage(tex,-s/2,-hh*0.5,s,hh); }catch(e){} }
        else {
          const jg=cx.createLinearGradient(-14,0,14,0);
          jg.addColorStop(0,'#E8A93C'); jg.addColorStop(0.5,'#FFD073'); jg.addColorStop(1,'#C9861B');
          cx.fillStyle=jg; cx.beginPath();
          cx.moveTo(-11,-8); cx.bezierCurveTo(-16,-2,-16,10,-10,15); cx.lineTo(10,15);
          cx.bezierCurveTo(16,10,16,-2,11,-8); cx.closePath(); cx.fill();
          cx.strokeStyle='rgba(110,70,10,.55)'; cx.lineWidth=1.6; cx.stroke();
          cx.fillStyle='#8A5A10'; cx.beginPath(); cx.ellipse(0,-9,12,4,0,0,7); cx.fill();
          cx.fillStyle='#FFCF5C'; cx.beginPath(); cx.ellipse(0,-10.5,12,4,0,0,7); cx.fill();
          cx.fillStyle='#F5B32B'; cx.beginPath();
          cx.moveTo(-6,-8); cx.quadraticCurveTo(-4,0,-7,3); cx.quadraticCurveTo(-9,-1,-6,-8); cx.fill();
          cx.fillStyle='rgba(255,255,255,.45)'; cx.beginPath(); cx.ellipse(-6,2,2.4,6,0.25,0,7); cx.fill();
          cx.fillStyle='#7A4A08'; cx.font='800 8px Hanken,sans-serif'; cx.textAlign='center'; cx.fillText('HONEY',0,8); }
        cx.restore(); }
      drawGate();
      const blink=(t<inv)&&(Math.floor(t*10)%2===0);
      if(!blink) drawFlyer(60,bee.y,Math.max(-0.5,Math.min(0.5,bee.vy/14)));
      let cueN=0, cueTxt='';
      if(t<3){ cueN=Math.ceil(3-t); cueTxt='Free flight — gravity in '+cueN; }
      else if(t<graceUntil){ cueN=Math.ceil(graceUntil-t); cueTxt='Nice! Fly on — '+cueN; }
      else if(gate){ cueTxt='⛩️ The Hive Gates! Fly through!'; cueN=1; }
      if(cueN){ cx.save(); cx.textAlign='center'; cx.globalAlpha=0.92;
        cx.font='800 22px Fraunces, serif'; cx.fillStyle='#fff'; cx.strokeStyle='rgba(20,20,50,.55)'; cx.lineWidth=4;
        cx.strokeText(cueTxt, Wd/2, 42); cx.fillText(cueTxt, Wd/2, 42);
        cx.restore(); }
      host.querySelector('#sg-pots').textContent='🍯 '+banked+'/'+CFG.pots;
      host.querySelector('#sg-coins').textContent='🪙 '+coinsGot;
      host.querySelector('#sg-fill').style.width=Math.round(100*banked/CFG.pots)+'%';
      host.querySelector('#sg-lives').textContent='❤'.repeat(Math.max(0,lives));
    }
    function howto(){
      const el=host.querySelector('#sg-card');
      el.innerHTML='<div class="sg-howto"><div class="sg-howto-card"><div class="sg-howto-h">☁️ The Long Sky</div>'+
        '<div class="sg-howto-sub">Bank every honey pot to open the Hive Gates — then fly through them home!</div>'+
        '<div class="sg-howto-steps">'+
        '<div class="sg-pw-legend">👆 Hold the sky (or press Space) to fly up — let go to glide down</div>'+
        '<div class="sg-pw-legend">🍯 Touch a honey pot, then spell the word to bank it ('+CFG.pots+' to win)</div>'+
        '<div class="sg-pw-legend">❤ Every pot you spell right earns an extra life (up to '+MAXLIVES+')</div>'+
        '<div class="sg-pw-legend">🦋 Dodge the grey moths and honeycomb towers — the gaps are roomy now</div>'+
        '<div class="sg-pw-legend">🪙 Grab coin trails · ❤ hearts patch you up</div>'+
        '</div><button class="sg-rbtn go sg-howto-go" id="sg-howgo">Take off! →</button></div></div>';
      el.style.display='grid';
      el.querySelector('#sg-howgo').onclick=()=>{ el.style.display='none'; el.innerHTML=''; started=true; };
    }
    function cleanup(){ removeEventListener('keydown',flap); removeEventListener('pointerup',pup); removeEventListener('pointercancel',pup); }
    /* This engine had NO result screen at all — a child flew, was eaten, and was
       handed straight back to the app's generic text card. No stars, no score, and
       above all no list of the words the flight had been about. */
    function finish(win){ cleanup();
      if(coinsGot){ try{ if(typeof addCoins==='function') addCoins(coinsGot); }catch(e){} }
      const score=banked*100+coinsGot*5, stars=win?(lives>=3?3:lives===2?2:1):0;
      const el=host.querySelector('#sg-card'); if(!el){ done({win,score,stars}); return; }
      el.innerHTML=SGUI.result({ win, stars, score, scoreLabel:'points', words:kfRound,
        title: win?'Home through the Hive Gates':'Out of lives' });
      el.style.display='grid'; SGUI.bind(el);
      el.querySelector('#sg-again').onclick=()=>{ el.style.display='none'; el.innerHTML=''; keepFlying(host,opts,done); };
      el.querySelector('#sg-cont').onclick=()=>{ el.style.display='none'; el.innerHTML=''; done({win,score,stars}); }; }
    howto();
    if(window.SB_DEBUG) window._fly={ state:()=>({beeY:bee.y,pot:pot&&{x:pot.x,y:pot.y},banked,lives,coins:coinsGot,gate:!!gate,moths:moths.length,over,started}), steer:(y)=>{bee.y=y;bee.vy=0;} };
    requestAnimationFrame(frame);
    return { destroy(){ over=true; cleanup(); } };
  }

  function wordHive(host, opts, done){
    const BIG=(opts.big||'THUNDERSTORM').toUpperCase();
    const diff=opts.diff||'medium';
    const CFG=calmCFG({easy:{target:12,time:360},medium:{target:20,time:300},hard:{target:24,time:300},champ:{target:28,time:270}}[diff]);
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


  /* 🏁 is a different picture in every font and lands as a flat monochrome box on
     some Androids — on the one HUD element that tells a child where the finish is. */
  /* The brake. There wasn't one: the kart pinned itself to top speed and the only
     input was left/right, so a bend could only ever be a steering-hold test — there
     was no way to ANSWER a corner, and so no way to make one bite without making it
     unfair. Keyboard AND thumb, like every control in this app. */
  const GP_BRAKE=()=>'<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">'+
    '<circle cx="12" cy="12" r="8.4" fill="none" stroke="currentColor" stroke-width="2.6"/>'+
    '<path d="M12 3.6v16.8M3.6 12h16.8" stroke="currentColor" stroke-width="2.2" '+
    'stroke-linecap="round" transform="rotate(45 12 12)"/></svg>';
  const GP_FLAG=()=>'<svg class="sg-pbflag-i" viewBox="0 0 20 22" width="17" height="19" aria-hidden="true">'+
    '<path d="M3 1v20" stroke="#4A4036" stroke-width="2" stroke-linecap="round"/>'+
    '<path d="M4.5 2h13v9h-13z" fill="#FDFBF5" stroke="#4A4036" stroke-width="1.1"/>'+
    '<path d="M4.5 2h4.3v3h-4.3zM13.2 2h4.3v3h-4.3zM8.8 5h4.4v3H8.8zM4.5 8h4.3v3H4.5zM13.2 8h4.3v3h-4.3z" fill="#2B2117"/>'+
    '</svg>';

  /* ---------- ENGINE C · BEE GRAND PRIX (pseudo-3D arcade racer) ----------
     Kids race a real perspective track. Spelling words correctly earns POWER-UPS,
     each doing something different (rocket, turbo, oil slick, gust, honey, shield).
     Steer to hug the racing line and dodge oil patches. First past the flag wins. */
  /* ===== KART ART — drawn, not pasted =====
     The Grand Prix karts used to be five painted sprites, 300px, drawn as flat cards.
     Three things made them read as cheap, and none was the painting: the Classic sprite
     had a helmeted driver PAINTED IN and the player's avatar was stuck on top of that
     helmet, so every kart had two drivers; steering ROTATED the whole card, which is a
     sticker tilting, not a kart turning; and nothing on it moved — no wheels, no
     suspension, no brake lights, no dust.
     This draws the kart from parts, in a 100-unit-wide space scaled to any size, so it
     can do what a sprite cannot: YAW (the nose and front wheels swing into the turn and
     the side of the kart comes into view), roll against the corner, bounce on its
     springs, spin its treads with the road speed, light its brake lamps, and seat the
     driver IN the cockpit — the avatar goes in before the seat back and the body, so
     its lower half is inside the kart instead of pasted over it. Light comes from the
     upper left, as in all three painted skies. */
  const KART_STYLES={
    'kart':        {name:'Classic', body:'#F0527E', acc:'#2EC4B6', tyre:'std',    wing:null,    hoop:true,  exh:2,     tub:'std'},
    'kart-red':    {name:'Racer',   body:'#D62839', acc:'#FFFFFF', tyre:'std',    wing:'flat',  hoop:false, exh:2,     tub:'std'},
    'kart-rocket': {name:'Rocket',  body:'#2F6BFF', acc:'#FFFFFF', tyre:'std',    wing:'swept', hoop:false, exh:'jet', tub:'sleek', bolt:true},
    'kart-buggy':  {name:'Buggy',   body:'#6DBE35', acc:'#23202B', tyre:'knobby', wing:null,    cage:true,  exh:2,     tub:'std', spare:true},
    'kart-cruiser':{name:'Cruiser', body:'#8B5CF6', acc:'#F7E7C1', tyre:'white',  wing:null,    hoop:false, exh:1,     tub:'bubble', chrome:true}
  };
  function kShade(hex,f){ const n=parseInt(hex.slice(1),16); let r=(n>>16)&255,g=(n>>8)&255,b=n&255;
    if(f>=0){ r+=(255-r)*f; g+=(255-g)*f; b+=(255-b)*f; } else { r*=1+f; g*=1+f; b*=1+f; }
    return '#'+((1<<24)+(Math.round(r)<<16)+(Math.round(g)<<8)+Math.round(b)).toString(16).slice(1); }
  function kRR(c,x,y,w,h,r){ r=Math.min(r,w/2,h/2); c.beginPath(); c.moveTo(x+r,y); c.lineTo(x+w-r,y); c.quadraticCurveTo(x+w,y,x+w,y+r);
    c.lineTo(x+w,y+h-r); c.quadraticCurveTo(x+w,y+h,x+w-r,y+h); c.lineTo(x+r,y+h); c.quadraticCurveTo(x,y+h,x,y+h-r);
    c.lineTo(x,y+r); c.quadraticCurveTo(x,y,x+r,y); c.closePath(); }
  /* Gradients are built in the 100-unit space, so one set per (context, style, colour)
     serves every size and every frame — a kart costs paths, not gradient construction. */
  const _kGrad=new WeakMap();
  function kGrads(c,K,body){ let m=_kGrad.get(c); if(!m){ m={}; _kGrad.set(c,m); }
    const key=K.name+body; if(m[key]) return m[key];
    const tub=c.createLinearGradient(0,-60,0,-12);
    tub.addColorStop(0,kShade(body,0.34)); tub.addColorStop(0.28,kShade(body,0.08)); tub.addColorStop(0.7,body); tub.addColorStop(1,kShade(body,-0.42));
    const side=c.createLinearGradient(0,-78,0,-30);
    side.addColorStop(0,kShade(body,-0.05)); side.addColorStop(1,kShade(body,-0.45));
    const tyre=c.createLinearGradient(-13,0,13,0);
    tyre.addColorStop(0,'#101014'); tyre.addColorStop(0.3,'#2B2A32'); tyre.addColorStop(0.55,'#35333D'); tyre.addColorStop(1,'#0E0D12');
    const seat=c.createLinearGradient(0,-78,0,-54);
    seat.addColorStop(0,'#4A4556'); seat.addColorStop(0.45,'#2C2835'); seat.addColorStop(1,'#1A1720');
    const wing=c.createLinearGradient(0,-74,0,-62);
    wing.addColorStop(0,'#5A5566'); wing.addColorStop(0.35,'#2C2935'); wing.addColorStop(1,'#141219');
    const chrome=c.createLinearGradient(0,-18,0,-6);
    chrome.addColorStop(0,'#FFFFFF'); chrome.addColorStop(0.35,'#C9CED6'); chrome.addColorStop(0.7,'#7E858F'); chrome.addColorStop(1,'#4B5059');
    const shadow=c.createRadialGradient(0,0,6,0,0,62);
    shadow.addColorStop(0,'rgba(10,8,20,.46)'); shadow.addColorStop(0.5,'rgba(10,8,20,.26)'); shadow.addColorStop(1,'rgba(10,8,20,0)');
    const helm=c.createRadialGradient(-6,-98,2,0,-88,20);
    helm.addColorStop(0,'#FFFFFF'); helm.addColorStop(0.25,kShade(K.acc==='#FFFFFF'?body:K.acc,0.25)); helm.addColorStop(1,kShade(K.acc==='#FFFFFF'?body:K.acc,-0.35));
    const _ts={};
    const tyreSh=(TW,TH,i)=>{ const k=TW+'|'+TH+'|'+i; if(_ts[k]) return _ts[k]; let g;
      if(i===0){ g=c.createLinearGradient(0,0,TW,0);
        g.addColorStop(0,'rgba(0,0,0,.45)'); g.addColorStop(0.28,'rgba(255,255,255,.10)'); g.addColorStop(0.42,'rgba(255,255,255,.05)'); g.addColorStop(0.8,'rgba(0,0,0,.15)'); g.addColorStop(1,'rgba(0,0,0,.55)'); }
      else { g=c.createLinearGradient(0,0,0,TH);
        g.addColorStop(0,'rgba(255,255,255,.14)'); g.addColorStop(0.25,'rgba(255,255,255,0)'); g.addColorStop(0.85,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,.35)'); }
      return (_ts[k]=g); };
    return (m[key]={tub,side,tyre,seat,wing,chrome,shadow,helm,tyreSh}); }

  /* s: { style, body?, driver?:<img|canvas>, glyph?, yaw -1..1, roll rad, lift (units, -up),
          wheel 0..1 (tread phase), brake, boost, t (seconds, for flicker), lod } */
  function kartDraw(c,X,Y,w,s){
    s=s||{}; const K=KART_STYLES[s.style]||KART_STYLES.kart, body=s.body||K.body, acc=K.acc;
    const u=w/100, yaw=Math.max(-1,Math.min(1,s.yaw||0)), lod=(s.lod!=null)?s.lod:(w<40);
    const G=kGrads(c,K,body), lift=s.lift||0, roll=s.roll||0, t=s.t||0;
    const outline=kShade(body,-0.62), fx=yaw*15, sx=yaw*3.5;
    const TW=K.tyre==='knobby'?29:25, TH=K.tyre==='knobby'?38:34, TX=K.tyre==='knobby'?38:37;
    c.save(); c.translate(X,Y); c.scale(u,u);

    /* 1 — ground: a soft contact shadow and a darker pool under each rear tyre */
    c.save(); c.translate(fx*0.2,-1); c.scale(1,0.2); c.fillStyle=G.shadow; c.beginPath(); c.arc(0,0,62,0,7); c.fill(); c.restore();
    if(!lod){ c.fillStyle='rgba(8,6,14,.45)'; [-1,1].forEach(k=>{ c.beginPath(); c.ellipse(k*TX-yaw*2,-0.5,TW*0.6,3,0,0,7); c.fill(); }); }

    /* 2 — the far end of the kart: front tyres (steered), front axle, the nose */
    if(!lod){
      /* the nose, running away up the track; it swings with the yaw. (Front tyres were
         tried here and read as ears sticking out of the driver's head — the turn shows
         better in the flank and the hubs.) */
      c.fillStyle=G.side; c.beginPath();
      c.moveTo(-20,-56+lift); c.bezierCurveTo(-18,-70+lift,-10+fx,-80+lift,0+fx,-80+lift); c.bezierCurveTo(10+fx,-80+lift,18,-70+lift,20,-56+lift); c.closePath(); c.fill();
    }

    /* the sprung mass rolls about the axle line and rides the springs */
    c.save(); c.translate(sx,-18+lift); c.rotate(roll); c.translate(0,18);

    /* 3 — side pods: they join the tail to the (yawed) front, so turning shows the flank */
    if(!lod){ c.fillStyle=G.side;
      [-1,1].forEach(k=>{ const f=fx-sx; c.beginPath(); c.moveTo(k*35,-36);
        c.bezierCurveTo(k*38,-49,k*31+f*0.6,-57,k*23+f,-57); c.bezierCurveTo(k*21+f,-53,k*26,-45,k*27,-36); c.closePath(); c.fill();
        c.strokeStyle=outline; c.lineWidth=1.1; c.stroke(); }); }

    /* 4 — the driver, seated: drawn BEFORE the seat back and the body, so the kart holds them */
    const D=58, dy=-113+Math.sin(t*9.3)*0.6*(lod?0:1);
    if(s.driver){ try{ c.drawImage(s.driver,-D/2,dy,D,D); }catch(e){} }
    else if(s.glyph){ c.font='40px serif'; c.textAlign='center'; c.fillText(s.glyph,0,dy+38); c.textAlign='left'; }
    else { /* no driver given (the menu thumbnail): a glossy helmet, seen from behind */
      c.fillStyle=G.helm; c.beginPath(); c.arc(0,-84,17,0,7); c.fill();
      c.strokeStyle=outline; c.lineWidth=1.6; c.stroke();
      c.fillStyle=kShade(body,-0.1); c.fillRect(-3,-101,6,34);
      c.fillStyle='rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(-7,-93,5,3,-0.6,0,7); c.fill(); }

    /* 5 — seat back, then the hoop or cage that frames the driver */
    c.fillStyle=G.seat; kRR(c,-19,-78,38,24,10); c.fill();
    c.strokeStyle='rgba(255,255,255,.14)'; c.lineWidth=1.2; kRR(c,-15,-75,30,18,7); c.stroke();
    if(K.hoop||K.cage){ c.lineCap='round'; c.strokeStyle='#2A2731'; c.lineWidth=K.cage?4.2:3.6;
      c.beginPath(); c.moveTo(-30,-57); c.bezierCurveTo(-33,-100,-27,-122,0,-122); c.bezierCurveTo(27,-122,33,-100,30,-57); c.stroke();
      if(K.cage){ c.beginPath(); c.moveTo(-30,-57); c.lineTo(-18,-121); c.moveTo(30,-57); c.lineTo(18,-121); c.stroke(); }
      c.strokeStyle='rgba(255,255,255,.35)'; c.lineWidth=1.1;
      c.beginPath(); c.moveTo(-29.5,-60); c.bezierCurveTo(-32,-98,-26,-120,0,-120.5); c.stroke(); c.lineCap='butt'; }

    /* 6 — the tail: the body tub, lit from the upper left, with its stripe and a hex badge */
    c.beginPath();
    if(K.tub==='bubble'){ c.moveTo(-31,-16); c.bezierCurveTo(-40,-22,-40,-52,-26,-59); c.quadraticCurveTo(0,-65,26,-59); c.bezierCurveTo(40,-52,40,-22,31,-16); c.quadraticCurveTo(0,-11,-31,-16); }
    else if(K.tub==='sleek'){ c.moveTo(-29,-16); c.bezierCurveTo(-35,-19,-37,-29,-36,-36); c.lineTo(-30,-54); c.quadraticCurveTo(-27,-60,-19,-60); c.lineTo(19,-60); c.quadraticCurveTo(27,-60,30,-54); c.lineTo(36,-36); c.bezierCurveTo(37,-29,35,-19,29,-16); c.quadraticCurveTo(0,-11,-29,-16); }
    else { c.moveTo(-30,-16); c.bezierCurveTo(-36,-19,-38,-29,-37,-37); c.lineTo(-33,-53); c.quadraticCurveTo(-31,-59,-24,-59); c.lineTo(24,-59); c.quadraticCurveTo(31,-59,33,-53); c.lineTo(37,-37); c.bezierCurveTo(38,-29,36,-19,30,-16); c.quadraticCurveTo(0,-11,-30,-16); }
    c.closePath(); c.fillStyle=G.tub; c.fill();
    c.save(); c.clip();
    if(K.bolt){ c.fillStyle=acc; c.beginPath(); c.moveTo(3,-62); c.lineTo(-7,-38); c.lineTo(0,-38); c.lineTo(-4,-14); c.lineTo(8,-42); c.lineTo(1,-42); c.lineTo(6,-62); c.closePath(); c.fill(); }
    else if(K.tub==='bubble'){ c.fillStyle=acc; c.fillRect(-45,-43,90,6); c.fillStyle='rgba(0,0,0,.12)'; c.fillRect(-45,-37,90,1.5); }
    else { c.fillStyle=acc; c.fillRect(-5.5,-66,11,60); c.fillStyle='rgba(0,0,0,.10)'; c.fillRect(3.5,-66,2,60); }
    /* specular: a soft sheen upper-left and a hard glint on the shoulder */
    c.fillStyle='rgba(255,255,255,.32)'; c.beginPath(); c.ellipse(-17,-52,13,3.6,-0.12,0,7); c.fill();
    c.fillStyle='rgba(255,255,255,.75)'; c.beginPath(); c.ellipse(-24,-53.5,3.4,1.2,-0.5,0,7); c.fill();
    c.fillStyle='rgba(0,0,0,.18)'; c.fillRect(-45,-24,90,12);   /* the underside turns away from the light */
    c.restore();
    c.strokeStyle=outline; c.lineWidth=1.8; c.stroke();
    if(!lod && !K.bolt && !K.spare){ /* the Bizzing hex, the one bit of branding a kart gets */
      c.save(); c.translate(0,K.tub==='bubble'?-28:-44); c.fillStyle='#F0B429'; c.strokeStyle='#6B4A00'; c.lineWidth=1.1; c.beginPath();
      for(let i=0;i<6;i++){ const a=Math.PI/6+i*Math.PI/3; c.lineTo(Math.cos(a)*5.2,Math.sin(a)*5.2); } c.closePath(); c.fill(); c.stroke();
      c.fillStyle='rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(-1.5,-1.8,2,1,-0.5,0,7); c.fill(); c.restore(); }
    if(K.spare && !lod){ c.fillStyle='#1B1A21'; c.beginPath(); c.arc(0,-40,11,0,7); c.fill();
      c.strokeStyle='#3A3842'; c.lineWidth=2; for(let i=0;i<8;i++){ const a=i*Math.PI/4; c.beginPath(); c.moveTo(Math.cos(a)*8,-40+Math.sin(a)*8); c.lineTo(Math.cos(a)*11,-40+Math.sin(a)*11); c.stroke(); }
      c.fillStyle='#8C929B'; c.beginPath(); c.arc(0,-40,4.5,0,7); c.fill(); c.fillStyle='#C9CED6'; c.beginPath(); c.arc(-1,-41,1.6,0,7); c.fill(); }
    if(K.chrome){ c.fillStyle=G.chrome; kRR(c,-33,-21,66,4.5,2.2); c.fill(); }

    /* 7 — tail lamps: dark red at rest, blazing when the brake is on */
    /* inboard of the tyres — out at ±27 the nearer tyre covered all but a sliver of them */
    [-1,1].forEach(k=>{ const lx=k*18-5.5, ly=K.tub==='bubble'?-33:-35, cxl=lx+5.5, cyl=ly+3;
      if(s.brake){ const gl=c.createRadialGradient(cxl,cyl,0,cxl,cyl,20);
        gl.addColorStop(0,'rgba(255,80,60,.85)'); gl.addColorStop(0.4,'rgba(255,50,40,.35)'); gl.addColorStop(1,'rgba(255,40,40,0)'); c.fillStyle=gl; c.beginPath(); c.arc(cxl,cyl,20,0,7); c.fill(); }
      c.fillStyle='#2A0A0E'; kRR(c,lx-0.8,ly-0.8,12.6,7.6,3); c.fill();
      c.fillStyle=s.brake?'#FF4A3D':'#A3162A'; kRR(c,lx,ly,11,6,2.4); c.fill();
      c.fillStyle=s.brake?'#FFE6E0':'rgba(255,255,255,.38)'; kRR(c,lx+1.4,ly+1,4.6,1.6,0.8); c.fill(); });

    /* 8 — the wing, if the style has one: it is the nearest thing on the kart after the tail */
    if(K.wing){ const sw=K.wing==='swept'?4:0;
      c.fillStyle='#24212B'; c.fillRect(-15,-63,3.2,6); c.fillRect(11.8,-63,3.2,6);
      c.beginPath(); c.moveTo(-41,-68-sw); c.quadraticCurveTo(0,-65.5+sw*0.4,41,-68-sw); c.lineTo(41,-62-sw); c.quadraticCurveTo(0,-59.5+sw*0.4,-41,-62-sw); c.closePath();
      c.fillStyle=G.wing; c.fill(); c.strokeStyle='#0F0E13'; c.lineWidth=1.2; c.stroke();
      c.fillStyle='rgba(255,255,255,.30)'; c.fillRect(-37,-67.3-sw*0.7,32,1.1);
      c.fillStyle=body; [-1,1].forEach(k=>{ kRR(c,k>0?37:-41,-72-sw,4,13,1.5); c.fill(); c.strokeStyle=outline; c.lineWidth=0.9; c.stroke(); }); }
    c.restore();   // end sprung mass

    /* 9 — axle, engine and exhausts, below the tail */
    c.fillStyle='#1E1C24'; kRR(c,-31,-15,62,4.5,2); c.fill();
    c.fillStyle='#2B2833'; kRR(c,-16,-19,32,11,4); c.fill(); c.fillStyle='rgba(255,255,255,.09)'; c.fillRect(-13,-18,26,1.4);
    const pipes=K.exh===1?[0]:[-8,8], pr=K.exh===1?5.8:5;
    pipes.forEach(px=>{ const py=-11+lift*0.5;
      if(K.exh==='jet'){ const jg=c.createRadialGradient(px,py,0,px,py,pr*2.6); jg.addColorStop(0,'rgba(140,250,255,.95)'); jg.addColorStop(0.4,'rgba(60,200,255,.45)'); jg.addColorStop(1,'rgba(60,200,255,0)');
        c.fillStyle=jg; c.beginPath(); c.arc(px,py,pr*2.6,0,7); c.fill(); }
      c.fillStyle=G.chrome; c.beginPath(); c.arc(px,py,pr,0,7); c.fill();
      c.strokeStyle='#3B3F46'; c.lineWidth=0.9; c.stroke();
      c.fillStyle=K.exh==='jet'?'#DFFFFF':'#141218'; c.beginPath(); c.arc(px,py,pr*0.56,0,7); c.fill(); });

    /* 10 — boost: layered flame from each pipe, flickering, added light */
    if(s.boost){ c.save(); c.globalCompositeOperation='lighter';
      pipes.forEach((px,i)=>{ const py=-11+lift*0.5, L=26+Math.sin(t*47+i*2.1)*5+Math.sin(t*29+i)*4;
        [[1,'rgba(255,120,40,.55)'],[0.66,'rgba(255,210,80,.75)'],[0.34,'rgba(255,255,230,.95)']].forEach(([f,col])=>{
          c.fillStyle=col; c.beginPath(); c.moveTo(px-pr*f*1.6,py); c.quadraticCurveTo(px-pr*f*1.5,py+L*f*0.55,px,py+L*f); c.quadraticCurveTo(px+pr*f*1.5,py+L*f*0.55,px+pr*f*1.6,py); c.closePath(); c.fill(); }); });
      c.restore(); }

    /* 11 — rear tyres, the nearest thing on the kart: tread that rolls with the road,
       and the sidewall and hub come into view on the side the kart is turning away from */
    [-1,1].forEach(k=>{ const tx=k*TX-yaw*2, x0=tx-TW/2, y0=-TH;
      c.fillStyle=G.tyre; kRR(c,x0,y0,TW,TH,10.5); c.fill();
      if(!lod){ c.save(); kRR(c,x0,y0,TW,TH,10.5); c.clip();
        const ph=((s.wheel||0)%1+1)%1, gap=K.tyre==='knobby'?9.5:6.8, n=Math.ceil(TH/gap)+2;
        for(let i=0;i<n;i++){ const gy=y0+((i+ph)*gap)%(n*gap)-gap;
          if(K.tyre==='knobby'){ const off=(i%2)?1:0; c.fillStyle='#3A3843';
            c.fillRect(x0+2+off*5,gy,TW*0.36,4.4); c.fillRect(x0+TW*0.56+off*3,gy,TW*0.36,4.4);
            c.fillStyle='rgba(255,255,255,.12)'; c.fillRect(x0+2+off*5,gy,TW*0.36,1); c.fillRect(x0+TW*0.56+off*3,gy,TW*0.36,1); }
          else { /* chevron grooves either side of a centre rib */
            c.strokeStyle='rgba(0,0,0,.55)'; c.lineWidth=1.8; c.beginPath();
            c.moveTo(x0+1,gy+2.2); c.lineTo(x0+TW*0.42,gy); c.moveTo(x0+TW*0.58,gy); c.lineTo(x0+TW-1,gy+2.2); c.stroke();
            c.strokeStyle='rgba(255,255,255,.08)'; c.lineWidth=0.9; c.beginPath();
            c.moveTo(x0+1,gy+3.6); c.lineTo(x0+TW*0.42,gy+1.4); c.moveTo(x0+TW*0.58,gy+1.4); c.lineTo(x0+TW-1,gy+3.6); c.stroke(); } }
        /* the tyre's roundness: a lit shoulder upper-left, shade falling away at the edges —
           built once per style in the tyre's own coordinates, then translated into place */
        c.translate(x0,y0); c.fillStyle=G.tyreSh(TW,TH,0); c.fillRect(0,0,TW,TH); c.fillStyle=G.tyreSh(TW,TH,1); c.fillRect(0,0,TW,TH);
        c.restore();
        /* sidewall: the kart turning right shows its LEFT flank, and so on */
        const sv=-k*yaw; if(sv>0.05){ const sw2=sv*9, ex=k<0?x0:x0+TW;
          c.fillStyle='#1F1D25'; c.beginPath(); c.ellipse(ex,y0+TH/2,sw2,TH/2-1,0,0,7); c.fill();
          c.fillStyle=K.tyre==='white'?'#F4EEDC':'#2E2C35'; c.beginPath(); c.ellipse(ex,y0+TH/2,sw2*0.72,TH/2-4,0,0,7); c.fill();
          c.fillStyle=K.chrome?G.chrome:kShade(body,0.1); c.beginPath(); c.ellipse(ex,y0+TH/2,sw2*0.42,TH/2-9,0,0,7); c.fill(); }
        if(K.tyre==='white'){ c.fillStyle='#F4EEDC'; kRR(c,x0+(k<0?0:TW-2.4),y0+5,2.4,TH-10,1.2); c.fill(); }
      }
      c.strokeStyle='#08070B'; c.lineWidth=1.5; kRR(c,x0,y0,TW,TH,10.5); c.stroke(); });

    c.restore(); }
  /* a menu thumbnail from the same drawing — so the kart you pick is the kart you race */
  const _kThumb={};
  function kartThumb(style,px){ px=px||168; const key=style+'|'+px; if(_kThumb[key]) return _kThumb[key];
    try{ const cv=document.createElement('canvas'); cv.width=px; cv.height=Math.round(px*0.9); const c=cv.getContext('2d');
      /* 0.64 of the width leaves the roll hoop (122 units up) inside the frame */
      kartDraw(c,px/2,cv.height-px*0.06,px*0.64,{style:style,yaw:0.28,roll:-0.02,wheel:0.3});
      return (_kThumb[key]=cv.toDataURL('image/png')); }catch(e){ return ''; } }
  W().SB_KART_ART={ draw:kartDraw, thumb:kartThumb, styles:KART_STYLES };

  /* ===== GRAND PRIX SCENERY — painted once, blitted forever =====
     Everything beside the road is painted ONCE into a canvas at RES pixels per road
     half-width, in the road's own unit (the kart is 0.38 wide, 0.44 tall), and blitted
     from then on. A far prop draws from a pre-shrunk copy (mipOf) already tinted to the
     world's fog (fogOf); a near one draws full size with its fog laid on as a silhouette.
     That is one or two drawImages per prop at any distance, against a dozen path fills
     and a gradient each — which is what let the props get big and varied without the
     frame budget going with them. Painters work with the origin at the prop's FOOT
     (bottom centre), y negative upward, light from the upper left. No lettering on
     anything: a billboard carries a bee, a star, a heart or a bolt. */
  const GPS=(function(){
    const RES=90;
    const rng=s=>()=>{ s|=0; s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
    const sh=(hex,f)=>kShade(hex,f);
    const dot=(g,x,y,r,col)=>{ g.fillStyle=col; g.beginPath(); g.arc(x,y,r,0,7); g.fill(); };
    const foot=(g,w,a)=>{ g.fillStyle='rgba(0,0,0,'+(a||0.18)+')'; g.beginPath(); g.ellipse(0,-0.01,w,w*0.16,0,0,7); g.fill(); };
    function rock(g,cx0,w,h,R,col){ const pts=[]; for(let i=0;i<=10;i++){ const a=Math.PI+i/10*Math.PI, rr=0.84+R()*0.28; pts.push([cx0+Math.cos(a)*w/2*rr,Math.min(0,Math.sin(a)*h*rr)]); }
      g.beginPath(); g.moveTo(cx0-w/2,0); pts.forEach(p=>g.lineTo(p[0],p[1])); g.lineTo(cx0+w/2,0); g.closePath();
      const gr=g.createLinearGradient(cx0-w/2,-h,cx0+w/2,0); gr.addColorStop(0,sh(col,0.24)); gr.addColorStop(0.55,col); gr.addColorStop(1,sh(col,-0.36));
      g.fillStyle=gr; g.fill(); g.strokeStyle='rgba(50,20,10,.28)'; g.lineWidth=0.012; g.stroke();
      g.beginPath(); g.moveTo(cx0-w*0.1,-h*0.75); g.lineTo(cx0+w*0.02,-h*0.4); g.lineTo(cx0-w*0.04,-h*0.15); g.stroke(); }
    const ICON={
      bee:g=>{ g.fillStyle='rgba(255,255,255,.85)'; g.beginPath(); g.ellipse(-0.12,-0.2,0.14,0.09,-0.5,0,7); g.ellipse(0.12,-0.2,0.14,0.09,0.5,0,7); g.fill();
        g.fillStyle='#FFD34A'; g.beginPath(); g.ellipse(0,0,0.24,0.17,0,0,7); g.fill(); g.fillStyle='#2A2340';
        [-0.08,0.06].forEach(x=>g.fillRect(x,-0.16,0.06,0.32)); dot(g,0.2,-0.03,0.025,'#2A2340'); },
      star:g=>{ g.beginPath(); for(let i=0;i<10;i++){ const r=i%2?0.13:0.32, a=-Math.PI/2+i*Math.PI/5; g.lineTo(Math.cos(a)*r,Math.sin(a)*r); } g.closePath(); g.fill(); },
      heart:g=>{ g.beginPath(); g.moveTo(0,0.24); g.bezierCurveTo(-0.38,-0.02,-0.2,-0.34,0,-0.14); g.bezierCurveTo(0.2,-0.34,0.38,-0.02,0,0.24); g.fill(); },
      bolt:g=>{ g.beginPath(); g.moveTo(0.06,-0.32); g.lineTo(-0.16,0.03); g.lineTo(0,0.03); g.lineTo(-0.06,0.32); g.lineTo(0.17,-0.05); g.lineTo(0.01,-0.05); g.closePath(); g.fill(); } };
    /* kind -> (variant, world) -> { bw, bh (box, half-widths), foot (footprint half-width), paint(g) } */
    const P={
      bush:(v,world)=>{ const pal=world==='cactus'?['#6F6E38','#8F8C4A','#B3AF66']:world==='building'?['#1E4632','#2B6142','#3D7F55']:['#2E763C','#45A04E','#6CC768'];
        const R=rng(v*97+3), fl=world==='tree'&&v%2===1, fc=['#FF8FB8','#FFD54A','#FFFFFF'][v%3];
        const pts=[[-0.19,-0.11,0.12],[0.19,-0.11,0.12],[-0.06,-0.19,0.15],[0.1,-0.21,0.13],[0,-0.1,0.14]];
        return {bw:0.72,bh:0.42,foot:0.3,paint:g=>{ foot(g,0.33);
          pts.forEach(p=>dot(g,p[0]+(R()-0.5)*0.04,p[1],p[2]*(0.9+R()*0.2),pal[0]));
          pts.forEach(p=>dot(g,p[0]-0.03,p[1]-0.03,p[2]*0.72,pal[1]));
          pts.forEach(p=>dot(g,p[0]-0.06,p[1]-0.06,p[2]*0.34,pal[2]));
          if(fl) for(let i=0;i<10;i++){ const p=pts[i%5]; dot(g,p[0]+(R()-0.5)*p[2]*1.4,p[1]+(R()-0.5)*p[2]*1.2,0.022,fc); } }}; },
      hedge:()=>({bw:0.8,bh:0.46,foot:0.36,paint:g=>{ foot(g,0.38,0.25);
        const pg=g.createLinearGradient(-0.36,0,0.36,0); pg.addColorStop(0,'#8E93A8'); pg.addColorStop(1,'#5A5F74');
        g.fillStyle=pg; g.fillRect(-0.36,-0.18,0.72,0.18);
        g.fillStyle='#244A36'; kRR(g,-0.33,-0.44,0.66,0.3,0.14); g.fill(); g.fillStyle='#356A4A'; kRR(g,-0.3,-0.43,0.5,0.16,0.08); g.fill(); }}),
      flowers:(v)=>{ const R=rng(v*31+7), fc=['#FF7FAF','#FFD34A','#B48CFF'][v%3];
        return {bw:0.9,bh:0.2,foot:0.42,paint:g=>{ for(let i=0;i<26;i++){ const x=(R()-0.5)*0.8, h=0.05+R()*0.1;
          g.strokeStyle='#3E8B3E'; g.lineWidth=0.012; g.beginPath(); g.moveTo(x,0); g.lineTo(x+(R()-0.5)*0.03,-h); g.stroke();
          dot(g,x,-h,0.022+R()*0.012,fc); dot(g,x-0.006,-h-0.006,0.009,'rgba(255,255,255,.7)'); } }}; },
      haybale:(v)=>{ const n=v%3, r=0.19, bw=n===0?0.5:0.92, bh=n===2?0.74:0.42;
        return {bw,bh,foot:bw/2-0.05,paint:g=>{ foot(g,bw*0.45);
          const one=(x,y)=>{ g.fillStyle='#B6872D'; g.beginPath(); g.ellipse(x+0.05,y-r,r*0.92,r,0,0,7); g.fill();
            const gr=g.createRadialGradient(x-0.06,y-r-0.06,0.02,x,y-r,r); gr.addColorStop(0,'#F6D774'); gr.addColorStop(1,'#C4952F');
            g.fillStyle=gr; g.beginPath(); g.arc(x,y-r,r,0,7); g.fill();
            g.strokeStyle='rgba(120,80,20,.45)'; g.lineWidth=0.012; g.beginPath();
            for(let a=0.3;a<14;a+=0.25){ const rr=r*(a/14); g.lineTo(x+Math.cos(a)*rr,y-r+Math.sin(a)*rr); } g.stroke(); };
          if(n===0) one(0,0); else { one(-0.22,0); one(0.22,0); if(n===2) one(0,-r*1.78); } }}; },
      barn:(v)=>{ const red=v%2?'#B83A32':'#C9563B';
        return {bw:2.5,bh:2.15,foot:1.1,paint:g=>{ foot(g,1.2,0.2);
          const bg=g.createLinearGradient(-1,0,1,0); bg.addColorStop(0,sh(red,0.12)); bg.addColorStop(1,sh(red,-0.2));
          g.fillStyle=bg; g.fillRect(-1,-1.25,2,1.25);
          g.strokeStyle='rgba(60,10,10,.25)'; g.lineWidth=0.02; for(let x=-0.9;x<1;x+=0.18){ g.beginPath(); g.moveTo(x,-1.25); g.lineTo(x,0); g.stroke(); }
          g.fillStyle='#55505E'; g.beginPath(); g.moveTo(-1.12,-1.22); g.lineTo(-0.86,-1.78); g.lineTo(0,-2.1); g.lineTo(0.86,-1.78); g.lineTo(1.12,-1.22); g.closePath(); g.fill();
          g.fillStyle='rgba(255,255,255,.12)'; g.beginPath(); g.moveTo(-1.12,-1.22); g.lineTo(-0.86,-1.78); g.lineTo(0,-2.1); g.lineTo(-0.04,-1.96); g.lineTo(-0.8,-1.68); g.lineTo(-1.0,-1.25); g.closePath(); g.fill();
          g.strokeStyle='#F2EEE6'; g.lineWidth=0.05; g.beginPath(); g.moveTo(-1,-1.25); g.lineTo(-0.78,-1.74); g.lineTo(0,-2.02); g.lineTo(0.78,-1.74); g.lineTo(1,-1.25); g.stroke();
          g.strokeRect(-1,-1.25,2,1.25);
          g.fillStyle=sh(red,-0.28); g.fillRect(-0.4,-0.82,0.8,0.82); g.lineWidth=0.045; g.strokeRect(-0.4,-0.82,0.8,0.82);
          g.beginPath(); g.moveTo(-0.4,-0.82); g.lineTo(0.4,0); g.moveTo(0.4,-0.82); g.lineTo(-0.4,0); g.moveTo(0,-0.82); g.lineTo(0,0); g.stroke();
          g.fillStyle='#3A2A22'; g.fillRect(-0.2,-1.62,0.4,0.3); g.strokeRect(-0.2,-1.62,0.4,0.3); }}; },
      windmill:()=>({bw:2.4,bh:3.5,foot:0.38,paint:g=>{ foot(g,0.5);
        const tg=g.createLinearGradient(-0.36,0,0.36,0); tg.addColorStop(0,'#FFFDF6'); tg.addColorStop(1,'#CFC7B8');
        g.fillStyle=tg; g.beginPath(); g.moveTo(-0.36,0); g.lineTo(-0.2,-2.3); g.lineTo(0.2,-2.3); g.lineTo(0.36,0); g.closePath(); g.fill();
        g.fillStyle='#6A4A3A'; g.fillRect(-0.09,-0.32,0.18,0.32); g.fillStyle='#7FA8C8'; g.fillRect(-0.07,-1.2,0.14,0.16); g.fillRect(-0.06,-1.75,0.12,0.14);
        g.fillStyle='#A8433A'; g.beginPath(); g.moveTo(-0.27,-2.28); g.quadraticCurveTo(0,-2.62,0.27,-2.28); g.closePath(); g.fill();
        g.save(); g.translate(0,-2.38); g.rotate(0.35);
        for(let i=0;i<4;i++){ g.rotate(Math.PI/2); g.fillStyle='#5A4636'; g.fillRect(-0.025,0,0.05,1.0);
          g.fillStyle='rgba(250,245,232,.94)'; g.fillRect(0.03,0.18,0.18,0.8); g.strokeStyle='#5A4636'; g.lineWidth=0.015;
          for(let y=0.28;y<0.98;y+=0.12){ g.beginPath(); g.moveTo(0.03,y); g.lineTo(0.21,y); g.stroke(); } }
        dot(g,0,0,0.07,'#3A2E28'); g.restore(); }}),
      reeds:(v)=>{ const R=rng(v*13+5); return {bw:0.55,bh:0.56,foot:0.2,paint:g=>{
        for(let i=0;i<9;i++){ const x=(R()-0.5)*0.4, h=0.25+R()*0.25, b=(R()-0.5)*0.12; g.strokeStyle=i%2?'#4E8F3C':'#6BAA4A'; g.lineWidth=0.02;
          g.beginPath(); g.moveTo(x,0); g.quadraticCurveTo(x,-h*0.6,x+b,-h); g.stroke(); }
        for(let i=0;i<3;i++){ const x=(i-1)*0.12+(R()-0.5)*0.05, h=0.4+R()*0.12; g.strokeStyle='#5C7A3A'; g.lineWidth=0.014; g.beginPath(); g.moveTo(x,0); g.lineTo(x,-h); g.stroke();
          g.fillStyle='#6B4226'; g.beginPath(); g.ellipse(x,-h+0.05,0.026,0.075,0,0,7); g.fill(); } }}; },
      cactus:(v)=>{ const kk=(v+0.5)/6, U=0.6, H=U*(1.6+kk*0.9), bwid=U*0.36, aw=bwid*0.66, flip=kk>0.5?-1:1;
        return {bw:U*0.95,bh:H+U*0.15,foot:0.12,paint:g=>{ foot(g,0.22,0.2); const top=-H;
          /* arms in the cactus's own mirrored frame, rising from an elbow at their foot, drawn
             before the trunk so the joint is seamless — the old mirror flipped the offsets but
             not the shapes, and half the cacti had an arm floating in the air beside them */
          g.save(); g.scale(flip,1); g.fillStyle='#3E8848';
          const aY=-H*(0.52+kk*0.16), aH=H*0.40, bY=-H*(0.40+kk*0.1), bH=H*0.30;
          kRR(g,bwid*0.42,aY,aw,aH,aw*0.5); g.fill(); kRR(g,bwid*0.1,aY+aH-aw,bwid*0.32+aw,aw,aw*0.5); g.fill();
          kRR(g,-bwid*0.42-aw,bY,aw,bH,aw*0.5); g.fill(); kRR(g,-bwid*0.42-aw,bY+bH-aw,bwid*0.32+aw,aw,aw*0.5); g.fill();
          g.fillStyle='rgba(190,255,190,.28)'; kRR(g,bwid*0.42+aw*0.18,aY+aw*0.3,aw*0.22,aH-aw*1.2,aw*0.11); g.fill(); g.restore();
          const cg=g.createLinearGradient(-bwid/2,0,bwid/2,0); cg.addColorStop(0,'#2F6B3A'); cg.addColorStop(.42,'#63BC70'); cg.addColorStop(.62,'#4E9B57'); cg.addColorStop(1,'#2A5E33');
          g.fillStyle=cg; kRR(g,-bwid/2,top,bwid,H,bwid*0.5); g.fill();
          g.strokeStyle='rgba(20,60,26,.35)'; g.lineWidth=U*0.014;
          for(const f of [-0.22,0,0.22]){ g.beginPath(); g.moveTo(bwid*f,top+bwid*0.4); g.lineTo(bwid*f,-bwid*0.2); g.stroke(); }
          if(kk>0.6) dot(g,0,top+bwid*0.1,U*0.075,'#FF9EC4'); }}; },
      rock:(v,world)=>{ const R=rng(v*41+9), col=world==='cactus'?['#B4643E','#A65A3A','#C27548','#9A5434'][v%4]:['#8E8A86','#7C7874','#9A958E','#868079'][v%4];
        return {bw:0.7,bh:0.42,foot:0.32,paint:g=>{ foot(g,0.32,0.22); rock(g,0,0.62,0.32+R()*0.06,R,col); }}; },
      boulders:(v)=>{ const R=rng(v*59+17), c=['#B4643E','#A65A3A','#C27548'];
        return {bw:1.5,bh:0.85,foot:0.7,paint:g=>{ foot(g,0.72,0.22); rock(g,0.05,0.75,0.78,R,c[(v+1)%3]); rock(g,-0.4,0.62,0.45,R,c[v%3]); rock(g,0.42,0.6,0.38,R,c[(v+2)%3]); }}; },
      deadtree:(v)=>{ const R=rng(v*53+11); return {bw:1.3,bh:1.55,foot:0.08,paint:g=>{ foot(g,0.16);
        const br=(x,y,a,len,w,d)=>{ const x2=x+Math.cos(a)*len, y2=y+Math.sin(a)*len; g.strokeStyle=d>2?'#6B5442':'#7E6650'; g.lineWidth=w;
          g.beginPath(); g.moveTo(x,y); g.lineTo(x2,y2); g.stroke();
          if(d>0){ br(x2,y2,a-0.35-R()*0.3,len*(0.62+R()*0.15),w*0.66,d-1); br(x2,y2,a+0.3+R()*0.3,len*(0.6+R()*0.15),w*0.66,d-1); } };
        br(0,0,-Math.PI/2+(R()-0.5)*0.15,0.55,0.07,4); }}; },
      butte:()=>({bw:5.2,bh:2.5,foot:2.4,paint:g=>{
        g.beginPath(); g.moveTo(-2.6,0); g.lineTo(-2.0,-0.8); g.lineTo(-1.7,-0.9); g.lineTo(-1.45,-2.25); g.lineTo(1.25,-2.4); g.lineTo(1.55,-1.0); g.lineTo(1.95,-0.85); g.lineTo(2.6,0); g.closePath();
        const gr=g.createLinearGradient(-2.6,-2.4,2.6,0); gr.addColorStop(0,'#D98A55'); gr.addColorStop(0.5,'#B5603C'); gr.addColorStop(1,'#7E3E2A'); g.fillStyle=gr; g.fill();
        g.save(); g.clip(); for(let y=-2.2;y<0;y+=0.32){ g.fillStyle='rgba(90,30,20,.18)'; g.fillRect(-2.6,y,5.2,0.08); g.fillStyle='rgba(255,210,170,.12)'; g.fillRect(-2.6,y-0.06,5.2,0.04); }
        g.fillStyle='rgba(60,20,15,.25)'; g.beginPath(); g.moveTo(0.4,-2.37); g.lineTo(1.25,-2.4); g.lineTo(1.55,-1.0); g.lineTo(1.95,-0.85); g.lineTo(2.6,0); g.lineTo(0.9,0); g.closePath(); g.fill(); g.restore(); }}),
      watertower:()=>({bw:1.5,bh:3.32,foot:0.62,paint:g=>{ foot(g,0.6);
        g.strokeStyle='#5B4030'; g.lineWidth=0.06;
        [[-0.55,-0.42],[0.55,0.42],[-0.2,-0.16],[0.2,0.16]].forEach(l=>{ g.beginPath(); g.moveTo(l[0],0); g.lineTo(l[1],-1.95); g.stroke(); });
        g.lineWidth=0.025; for(let y=-0.2;y>-1.8;y-=0.6){ g.beginPath(); g.moveTo(-0.53,y); g.lineTo(0.5,y-0.55); g.moveTo(0.53,y); g.lineTo(-0.5,y-0.55); g.stroke(); }
        const tg=g.createLinearGradient(-0.62,0,0.62,0); tg.addColorStop(0,'#B07A4E'); tg.addColorStop(0.4,'#9A6640'); tg.addColorStop(1,'#6E4428');
        g.fillStyle=tg; g.fillRect(-0.62,-2.95,1.24,1.0);
        g.strokeStyle='rgba(50,25,10,.35)'; g.lineWidth=0.015; for(let x=-0.5;x<0.62;x+=0.12){ g.beginPath(); g.moveTo(x,-2.95); g.lineTo(x,-1.95); g.stroke(); }
        g.strokeStyle='#3E2C22'; g.lineWidth=0.035; [-2.75,-2.15].forEach(y=>{ g.beginPath(); g.moveTo(-0.62,y); g.lineTo(0.62,y); g.stroke(); });
        g.fillStyle='#5E3A26'; g.beginPath(); g.moveTo(-0.7,-2.95); g.lineTo(0,-3.28); g.lineTo(0.7,-2.95); g.closePath(); g.fill(); }}),
      signpost:(v)=>({bw:0.95,bh:1.0,foot:0.05,paint:g=>{ foot(g,0.08);
        g.fillStyle='#6E4A30'; g.fillRect(-0.03,-0.95,0.06,0.95);
        const board=(y,d,col)=>{ g.fillStyle=col; g.beginPath(); g.moveTo(-d*0.06,y-0.055); g.lineTo(d*0.36,y-0.055); g.lineTo(d*0.44,y); g.lineTo(d*0.36,y+0.055); g.lineTo(-d*0.06,y+0.055); g.closePath(); g.fill();
          g.strokeStyle='rgba(60,30,15,.5)'; g.lineWidth=0.012; g.stroke(); };
        board(-0.84,1,'#C99060'); board(-0.64,-1,'#B27A4C'); if(v%2) board(-0.46,1,'#D4A06C'); }}),
      tower:(v)=>{ const k=(v+0.5)/6, bw=2.1*(0.72+((k*7)%1)*0.5), bh=2.1*(1.5+k*1.9), setback=k>0.55?0.63:0, neon=['#5BE9FF','#FF6BD6','#8B7BFF','#57FFC2'][(k*13|0)%4];
        return {bw:bw+0.12,bh:bh+setback+0.12,foot:bw/2,res:56,paint:g=>{ const x0=-bw/2, top=-bh;
          const gr=g.createLinearGradient(0,top,0,0); gr.addColorStop(0,'#4A5080'); gr.addColorStop(0.55,'#2E3355'); gr.addColorStop(1,'#1A1C30'); g.fillStyle=gr; g.fillRect(x0,top,bw,bh);
          g.fillStyle='rgba(255,255,255,.06)'; g.fillRect(x0,top,bw*0.16,bh);
          if(setback){ const tw=bw*0.6; g.fillStyle='#3A4068'; g.fillRect(-tw/2,top-setback,tw,setback); g.fillStyle=neon; g.fillRect(-tw/2,top-setback,tw,0.05); }
          const bay=0.36, cols=Math.floor((bw-0.2)/bay), rows=Math.floor((bh-0.3)/bay), ox=(bw-cols*bay)/2;
          for(let r=0;r<rows;r++) for(let q=0;q<cols;q++){ const lit=((r*7+q*3+v*5)%5)!==0 && ((r+q*2+v)%7)!==3;
            g.fillStyle=lit?'rgba(255,214,130,.95)':'rgba(70,80,120,.55)'; g.fillRect(x0+ox+q*bay+0.07,top+0.2+r*bay+0.07,bay*0.58,bay*0.54); }
          g.fillStyle=neon; g.globalAlpha=0.3; g.fillRect(x0-0.05,top-0.08,bw+0.1,0.2); g.globalAlpha=1; g.fillRect(x0,top,bw,0.05);
          g.globalAlpha=0.5; g.fillRect(x0,top,0.04,bh); g.fillRect(-x0-0.04,top,0.04,bh); g.globalAlpha=1;
          if(k>0.34){ const sw=0.12, sy2=top+bh*0.16, sh2=bh*0.42, sx2=x0+bw*0.8; g.globalAlpha=0.3; g.fillRect(sx2-sw,sy2-sw,sw*3,sh2+sw*2); g.globalAlpha=1; g.fillRect(sx2,sy2,sw,sh2); } }}; },
      lamp:(v,world)=>{ const d=v%2?-1:1, glow=world==='building'?'190,240,255':'255,236,190';
        return {bw:0.64,bh:1.56,foot:0.05,paint:g=>{ g.scale(d,1); g.fillStyle='rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(-0.18,-0.01,0.08,0.025,0,0,7); g.fill();
          g.fillStyle='#2A2F45'; g.fillRect(-0.21,-1.36,0.05,1.36); g.fillRect(-0.245,-0.08,0.12,0.08);
          g.strokeStyle='#2A2F45'; g.lineWidth=0.04; g.beginPath(); g.moveTo(-0.185,-1.34); g.quadraticCurveTo(-0.15,-1.45,0.12,-1.41); g.stroke();
          const gl=g.createRadialGradient(0.15,-1.36,0,0.15,-1.36,0.15); gl.addColorStop(0,'rgba('+glow+',.8)'); gl.addColorStop(1,'rgba('+glow+',0)');
          g.fillStyle=gl; g.beginPath(); g.arc(0.15,-1.36,0.15,0,7); g.fill();
          g.fillStyle='#3A4060'; g.fillRect(0.06,-1.44,0.17,0.05); g.fillStyle='rgb('+glow+')'; g.fillRect(0.08,-1.39,0.13,0.025); }}; },
      /* SANDSTONE FORMATIONS — the canyon pass. Four shapes (hoodoo with a cap rock, mesa
         block, twin spires, an arch), each built as stacked ledges and then dressed the way
         the backdrop painting dresses its rocks: lit left face, shadowed right, strata,
         ledge highlights, cracks, desert-varnish streaks, rubble at the foot. */
      formation:(v)=>{ const R=rng(v*71+23), t=v%4, W=[1.5,2.7,2.4,2.7][t], H=[3.05,1.95,2.75,2.35][t];
        const pal=[['#E39A5E','#C46C40','#8A4029'],['#D98552','#B85E38','#7E3824'],['#E8A468','#C9773F','#91482B'],['#DB8E5A','#BE653D','#843E27']][v%4];
        const stack=(cx0,wb,h,steps,top)=>{ const L=[],Rr=[]; let prev=null;
          for(let i=0;i<steps;i++){ const y0=top-h*i/steps, y1=top-h*(i+1)/steps, ww=wb*(1-0.28*i/steps)*(0.9+R()*0.18)/2;
            if(prev!==null){ L.push([cx0-ww,y0]); Rr.push([cx0+ww+(R()-0.5)*0.04,y0]); } else { L.push([cx0-ww,y0]); Rr.push([cx0+ww,y0]); }
            L.push([cx0-ww*(0.97+R()*0.05),y1]); Rr.push([cx0+ww*(0.97+R()*0.05),y1]); prev=ww; }
          return {pts:L.concat(Rr.reverse()), ledges:L.map(p=>p[1])}; };
        const shapes=[]; const ledgeYs=[];
        if(t===0){ const c=stack(0,1.0,2.55,6,0); shapes.push(c.pts); ledgeYs.push(...c.ledges);
          shapes.push([[-0.62,-2.5],[-0.66,-2.78],[-0.5,-3.0],[0.48,-3.02],[0.66,-2.8],[0.6,-2.5]]); }
        else if(t===1){ const c=stack(0,2.6,1.9,4,0); shapes.push(c.pts); ledgeYs.push(...c.ledges); }
        else if(t===2){ const a=stack(-0.55,0.95,2.7,6,0), b=stack(0.6,0.85,2.05,5,0); shapes.push(a.pts,b.pts,[[-1.15,0],[-1.1,-0.7],[1.1,-0.62],[1.15,0]]); ledgeYs.push(...a.ledges,...b.ledges); }
        else { const a=stack(-0.95,0.75,2.3,5,0), b=stack(0.95,0.75,2.3,5,0); shapes.push(a.pts,b.pts); ledgeYs.push(...a.ledges); }
        const path=new Path2D(); shapes.forEach(sp=>{ path.moveTo(sp[0][0],sp[0][1]); sp.forEach(p=>path.lineTo(p[0],p[1])); path.closePath(); });
        if(t===3){ path.moveTo(-1.3,-1.85); path.bezierCurveTo(-1.25,-2.55,1.25,-2.55,1.3,-1.85); path.lineTo(1.3,-2.05); path.lineTo(-1.3,-2.05); path.closePath();
          path.moveTo(-1.32,-1.72); path.lineTo(-1.32,-2.0); path.bezierCurveTo(-0.9,-2.5,0.9,-2.5,1.32,-2.0); path.lineTo(1.32,-1.72);
          path.bezierCurveTo(0.9,-2.2,-0.9,-2.2,-1.32,-1.72); path.closePath(); }
        return {bw:W+0.5,bh:H+0.25,foot:W/2,paint:g=>{ foot(g,W*0.58,0.26);
          const base=g.createLinearGradient(-W/2,0,W/2,0); base.addColorStop(0,pal[0]); base.addColorStop(0.5,pal[1]); base.addColorStop(1,pal[2]);
          g.fillStyle=base; g.fill(path);
          g.save(); g.clip(path);
          for(let y=0,i=0;y>-H-0.3;y-=0.14+R()*0.14,i++){ const th=0.05+R()*0.06;
            g.fillStyle=i%2?'rgba(255,214,170,.16)':'rgba(110,40,25,.2)'; g.beginPath(); g.moveTo(-W,y);
            for(let x=-W;x<=W;x+=0.25) g.lineTo(x,y+Math.sin(x*3+i)*0.025); g.lineTo(W,y-th); g.lineTo(-W,y-th); g.closePath(); g.fill(); }
          const sh2=g.createLinearGradient(0,0,W/2,0); sh2.addColorStop(0,'rgba(60,20,10,0)'); sh2.addColorStop(1,'rgba(60,20,10,.32)'); g.fillStyle=sh2; g.fillRect(0,-H-0.3,W,H+0.3);
          for(let i=0;i<7;i++){ const x=(R()-0.5)*W*0.9, y=-R()*H*0.9, l=0.25+R()*0.5, vg=g.createLinearGradient(0,y,0,y+l);
            vg.addColorStop(0,'rgba(70,30,20,.30)'); vg.addColorStop(1,'rgba(70,30,20,0)'); g.fillStyle=vg; g.fillRect(x,y,0.06+R()*0.08,l); }
          g.strokeStyle='rgba(60,22,12,.45)'; g.lineWidth=0.018;
          for(let i=0;i<6;i++){ const x=(R()-0.5)*W*0.8, y=-R()*H*0.8; g.beginPath(); g.moveTo(x,y); g.lineTo(x+(R()-0.5)*0.06,y+0.18+R()*0.25); g.lineTo(x+(R()-0.5)*0.08,y+0.4+R()*0.3); g.stroke(); }
          g.strokeStyle='rgba(255,226,190,.55)'; g.lineWidth=0.026;
          ledgeYs.forEach(y=>{ if(y>-0.05) return; g.beginPath(); g.moveTo(-W/2,y+0.012); g.lineTo(-W*0.05,y+0.012); g.stroke(); });
          g.restore();
          g.strokeStyle='rgba(70,26,14,.55)'; g.lineWidth=0.028; g.stroke(path);
          for(let i=0;i<4;i++) rock(g,(R()-0.5)*W*0.9,0.22+R()*0.2,0.12+R()*0.1,R,pal[1+(i%2)]); }}; },
      /* a two-storey shop for the neon avenue: lit window, striped awning, door, upper floor */
      shop:(v)=>{ const body=['#8E3B46','#2F6F78','#5B3F86','#9A7340'][v%4], neon=['#FF6BD6','#5BE9FF','#FFD34A','#57FFC2'][v%4], R=rng(v*19+3);
        return {bw:1.62,bh:1.32,foot:0.76,paint:g=>{ foot(g,0.8,0.25);
          const bg=g.createLinearGradient(-0.75,0,0.75,0); bg.addColorStop(0,sh(body,0.12)); bg.addColorStop(1,sh(body,-0.25));
          g.fillStyle=bg; g.fillRect(-0.75,-1.15,1.5,1.15);
          g.fillStyle=sh(body,-0.35); g.fillRect(-0.8,-1.24,1.6,0.1);            // cornice
          for(let q=0;q<3;q++){ const lit=R()<0.7; g.fillStyle='#1E2034'; g.fillRect(-0.6+q*0.44,-1.05,0.32,0.3);
            g.fillStyle=lit?'rgba(255,214,140,.92)':'rgba(90,110,160,.6)'; g.fillRect(-0.58+q*0.44,-1.03,0.28,0.26);
            g.fillStyle='rgba(255,255,255,.18)'; g.fillRect(-0.58+q*0.44,-1.03,0.28,0.05); }
          g.fillStyle='#14162A'; g.fillRect(-0.68,-0.62,1.0,0.56);                // shop window
          const wg=g.createLinearGradient(0,-0.62,0,-0.06); wg.addColorStop(0,'rgba(255,226,170,.95)'); wg.addColorStop(1,'rgba(255,170,90,.85)');
          g.fillStyle=wg; g.fillRect(-0.65,-0.59,0.94,0.5);
          g.fillStyle='rgba(60,40,30,.35)'; for(let i=0;i<4;i++) g.fillRect(-0.6+i*0.24,-0.3,0.12,0.2);   // shelves of goods
          g.fillStyle='#24263A'; g.fillRect(0.38,-0.6,0.3,0.6); g.fillStyle='rgba(255,220,160,.8)'; g.fillRect(0.42,-0.56,0.22,0.26);   // door
          g.save(); g.beginPath(); g.moveTo(-0.78,-0.72); g.lineTo(0.78,-0.72); g.lineTo(0.7,-0.6); g.lineTo(-0.7,-0.6); g.closePath(); g.clip();
          for(let i=0;i<9;i++){ g.fillStyle=i%2?'#F4EFE6':neon; g.fillRect(-0.78+i*0.174,-0.74,0.174,0.16); } g.restore();
          g.strokeStyle=neon; g.lineWidth=0.03; g.beginPath(); g.moveTo(-0.7,-0.6); g.lineTo(0.7,-0.6); g.stroke();
          /* a blade sign sticking out from the corner, carrying the shop's neon icon */
          g.fillStyle='#30354C'; g.fillRect(-0.8,-0.98,0.06,0.03);
          g.fillStyle='#161A2E'; kRR(g,-0.98,-1.08,0.22,0.26,0.03); g.fill(); g.strokeStyle=neon; g.lineWidth=0.02; kRR(g,-0.98,-1.08,0.22,0.26,0.03); g.stroke();
          g.save(); g.translate(-0.87,-0.95); g.scale(0.27,0.27); g.fillStyle=neon; ICON[['star','heart','bolt','bee'][v%4]](g); g.restore(); }}; },
      billboard:(v)=>{ const neon=['#FF6BD6','#5BE9FF','#FFD34A','#57FFC2'][v%4], ic=['bee','star','heart','bolt'][v%4], deep=['#3A1450','#0E2E52','#4A2A0E','#0E3E36'][v%4];
        return {bw:2.8,bh:2.55,foot:0.95,paint:g=>{ foot(g,1.0,0.22);
          g.strokeStyle='#30354C';
          for(const x of [-0.82,0.82]){ g.lineWidth=0.06; g.beginPath(); g.moveTo(x-0.08,0); g.lineTo(x-0.05,-1.12); g.moveTo(x+0.08,0); g.lineTo(x+0.05,-1.12); g.stroke();
            g.lineWidth=0.022; for(let y=0;y>-1.05;y-=0.22){ g.beginPath(); g.moveTo(x-0.075,y); g.lineTo(x+0.07,y-0.22); g.moveTo(x+0.075,y); g.lineTo(x-0.07,y-0.22); g.stroke(); } }
          g.fillStyle='#1A1D2E'; g.fillRect(-1.32,-2.47,2.64,1.32);
          const sc=g.createLinearGradient(0,-2.38,0,-1.24); sc.addColorStop(0,deep); sc.addColorStop(1,sh(neon,-0.55));
          g.fillStyle=sc; g.fillRect(-1.22,-2.38,2.44,1.14);
          g.save(); g.beginPath(); g.rect(-1.22,-2.38,2.44,1.14); g.clip(); g.translate(0,-1.81);
          g.fillStyle='rgba(255,255,255,.07)'; for(let i=0;i<12;i++){ g.beginPath(); g.moveTo(0,0); g.arc(0,0,2,i*Math.PI/6,i*Math.PI/6+Math.PI/12); g.closePath(); g.fill(); }
          g.globalAlpha=0.28; g.save(); g.scale(1.75,1.75); g.fillStyle=neon; ICON[ic](g); g.restore(); g.globalAlpha=1;
          g.save(); g.scale(1.3,1.3); g.fillStyle=neon; ICON[ic](g); g.restore();
          for(let i=0;i<14;i++){ const a=i*2.4, r=0.55+((i*37)%10)/14; dot(g,Math.cos(a)*r,Math.sin(a)*r*0.5,0.018,'rgba(255,255,255,.75)'); }
          g.restore();
          for(let i=0;i<=16;i++){ const x=-1.27+i*0.159; dot(g,x,-2.43,0.026,i%2?'#FFF6D8':neon); dot(g,x,-1.19,0.026,i%2?neon:'#FFF6D8'); }
          g.fillStyle='#2A2E44'; g.fillRect(-1.22,-1.15,2.44,0.05); g.strokeStyle='#3A4060'; g.lineWidth=0.014; g.beginPath(); g.moveTo(-1.22,-1.27); g.lineTo(1.22,-1.27); g.stroke();
          g.save(); g.globalCompositeOperation='lighter';
          for(const x of [-0.75,0,0.75]){ const cone=g.createLinearGradient(0,-1.16,0,-2.4); cone.addColorStop(0,'rgba(255,250,220,.22)'); cone.addColorStop(1,'rgba(255,250,220,0)');
            g.fillStyle=cone; g.beginPath(); g.moveTo(x-0.04,-1.16); g.lineTo(x-0.34,-2.38); g.lineTo(x+0.34,-2.38); g.lineTo(x+0.04,-1.16); g.closePath(); g.fill(); }
          g.restore();
          for(const x of [-0.75,0,0.75]){ g.fillStyle='#3A4060'; g.fillRect(x-0.05,-1.2,0.1,0.06); g.fillStyle='#FFF6D8'; g.fillRect(x-0.04,-1.21,0.08,0.015); } }}; }
    };
    const _tex=new Map();
    function tex(kind,v,world){ const key=kind+'|'+v+'|'+world; let t=_tex.get(key); if(t) return t;
      const d=P[kind](v,world), res=d.res||RES, c=document.createElement('canvas');
      c.width=Math.max(2,Math.ceil(d.bw*res)); c.height=Math.max(2,Math.ceil(d.bh*res));
      const g=c.getContext('2d'); g.setTransform(res,0,0,res,c.width/2,c.height); g.lineCap='round'; g.lineJoin='round'; d.paint(g);
      t={cv:c,bw:d.bw,bh:d.bh,foot:d.foot}; _tex.set(key,t); return t; }
    const box=(kind,v,world)=>{ const d=P[kind](v,world); return {bw:d.bw,bh:d.bh,foot:d.foot}; };
    const _mip=new WeakMap(), _fog=new WeakMap();
    function mipOf(src,level){ let m=_mip.get(src); if(!m){ m=[src]; _mip.set(src,m); }
      for(let l=m.length;l<=level;l++){ const p=m[l-1], c=document.createElement('canvas'); c.width=Math.max(1,p.width>>1); c.height=Math.max(1,p.height>>1);
        const g=c.getContext('2d'); g.imageSmoothingQuality='high'; g.drawImage(p,0,0,c.width,c.height); m.push(c); }
      return m[level]; }
    function tinted(src,rgb,a){ let m=_fog.get(src); if(!m){ m=new Map(); _fog.set(src,m); } const key=rgb+'|'+a; let c=m.get(key); if(c) return c;
      c=document.createElement('canvas'); c.width=src.width; c.height=src.height; const g=c.getContext('2d'); g.drawImage(src,0,0);
      g.globalCompositeOperation='source-atop'; g.fillStyle='rgba('+rgb+','+a+')'; g.fillRect(0,0,c.width,c.height); m.set(key,c); return c; }
    /* ONE drawImage per prop at any distance: the copy pre-shrunk to about its drawn size,
       already tinted to the nearest of 16 fog steps. Near props used to lay their fog on as a
       second full-size silhouette — on the biggest images on screen that doubled the fill, and
       measured, it was ~6ms a frame in the city. The very nearest (fog < 0.05) take none. */
    function blit(c,src,x,y,w,h,fog,rgb){ if(!src||w<0.5) return;
      const ratio=src.width/Math.max(1,w), lv=ratio<2?0:ratio<4?1:ratio<8?2:3, m=lv?mipOf(src,lv):src;
      const b=fog<0.05?0:Math.max(1,Math.round(fog*16));
      try{ c.drawImage(b?tinted(m,rgb,(b/16).toFixed(4)):m,x,y,w,h); }catch(e){} }
    return { tex, box, blit, kinds:Object.keys(P) };
  })();

  /* ===== THE ZONES OF EACH WORLD =====
     A lap is a run of zones, one per track sector (~150-190 bands), in a shuffled cycle
     so the same zone never follows itself. A zone sets the ground tint, the props and
     their spacing (`gap` in bands, alternating sides at random), an optional landmark
     (`once`, at that fraction of the zone), a strip that runs along the road (fence,
     railing) and water (one side: a lakeshore; both: a bridge). `dense` marks the zones that
     are crowded ON PURPOSE — a canyon pass is walled with rock, a street with buildings —
     and only those may exceed the audit's density cap. `off` is
     the distance from the road's centre line in half-widths; every prop's footprint
     stands clear of the verge, which ends at 1.42. tests/gp-world.cjs audits all of it. */
  const GP_ZONES={
    tree:{ list:['orchard','farm','flowers','lake'], water:['#5AAEE0','#52A4D6'], z:{
      orchard:{grass:['#7AC46A','#71B862'], props:[{k:'tree',gap:[28,48],off:[2.0,3.3],group:[1,3]},{k:'bush',gap:[24,40],off:[1.8,2.9]}]},
      farm:{grass:['#A9C35C','#9FB954'], verge:'#B9A06A', strip:'fence', props:[{k:'haybale',gap:[20,34],off:[2.2,3.6],group:[1,2]},{k:'barn',once:0.5,off:[3.7,4.3]},{k:'tree',gap:[55,85],off:[2.6,3.8]}]},
      flowers:{grass:['#76CA6E','#6CBE66'], props:[{k:'flowers',gap:[10,16],off:[1.9,3.6]},{k:'bush',gap:[26,42],off:[1.8,2.8]},{k:'windmill',once:0.55,off:[4.6,5.4]}]},
      lake:{grass:['#7AC46A','#71B862'], verge:'#D8C996', water:'one', props:[{k:'reeds',gap:[8,14],off:[1.75,2.1],side:'water'},{k:'tree',gap:[30,50],off:[2.1,3.2],side:'dry'},{k:'bush',gap:[24,38],off:[1.8,2.6],side:'dry'}]} }},
    cactus:{ list:['cacti','boulders','canyon','ranch'], z:{
      cacti:{props:[{k:'cactus',gap:[32,54],off:[1.95,3.4],group:[1,2]},{k:'rock',gap:[22,36],off:[1.8,2.8]},{k:'bush',gap:[20,32],off:[1.8,3.0]}]},
      boulders:{grass:['#C27845','#B87040'], props:[{k:'boulders',gap:[32,52],off:[2.3,3.4]},{k:'rock',gap:[14,24],off:[1.8,3.0]},{k:'deadtree',gap:[46,74],off:[2.2,3.2]}]},
      canyon:{dense:1, grass:['#A65C3E','#9C543A'], verge:'#A0603F', props:[{k:'formation',gap:[7,12],off:[2.2,3.0]},{k:'rock',gap:[12,20],off:[1.8,2.4]}]},
      ranch:{grass:['#D79B5C','#CC9154'], props:[{k:'watertower',once:0.35,off:[3.4,4.0]},{k:'signpost',once:0.7,off:[1.75,1.8]},{k:'butte',once:0.5,off:[8,10]},{k:'bush',gap:[24,38],off:[1.8,3.2]},{k:'cactus',gap:[54,84],off:[2.2,3.4]}]} }},
    building:{ list:['downtown','avenue','park','bridge'], water:['#1F3D6B','#1C3863'], z:{
      downtown:{dense:1, lamps:1, props:[{k:'tower',gap:[8,13],off:[3.0,4.4]}]},
      avenue:{dense:1, lamps:1, props:[{k:'shop',gap:[7,11],off:[2.4,2.9]},{k:'billboard',gap:[40,62],off:[3.5,3.9]},{k:'tower',gap:[18,28],off:[4.4,5.4]}]},
      park:{grass:['#2F5A3E','#2A5238'], lamps:1, props:[{k:'parktree',gap:[18,28],off:[2.0,3.0],group:[1,2]},{k:'hedge',gap:[24,36],off:[1.8,2.4]}]},
      bridge:{water:'both', verge:'#4A5068', strip:'rail', lamps:1, props:[]} }} };
  /* how far up the road each kind is still drawn (bands); small things stop sooner */
  const GP_FAR={formation:1300,shop:600,bush:350,flowers:300,reeds:300,haybale:420,rock:380,hedge:350,signpost:420,lamp:320,tree:800,parktree:700,cactus:800,boulders:700,deadtree:700,billboard:900,tower:1100,barn:1500,windmill:1600,watertower:1500,butte:1800};
  const GP_VAR={formation:4,shop:4,bush:4,flowers:3,haybale:3,barn:2,windmill:1,reeds:3,cactus:6,rock:4,boulders:3,deadtree:3,butte:1,watertower:1,signpost:2,tower:6,lamp:2,billboard:4,hedge:1,tree:2,parktree:2};

  /* ===== PHONES RACE SIDEWAYS =====
     Upright, a phone gave the race a 430x390 canvas: a narrow road, the kart under the
     controls, the bends arriving with no warning. Sideways it gets a 2:1 window with a
     thumb gutter either side, which is how every phone racer is held. A phone is a touch
     screen whose short side is under 560px (tablets are fine either way up). Held
     upright, the race does not start — it asks to be turned, and starts when it is. */
  const gpPhone=()=>{ try{ return matchMedia('(pointer:coarse)').matches && Math.min(innerWidth,innerHeight)<560; }catch(e){ return false; } };
  const gpUpright=()=>innerHeight>innerWidth;
  const GP_TURN='<div class="sg-turn" role="alert"><div class="sg-turn-ph" aria-hidden="true">'+
    '<svg viewBox="0 0 64 64"><rect x="20" y="6" width="24" height="44" rx="5" fill="none" stroke="currentColor" stroke-width="3.4"/>'+
    '<rect x="29" y="44" width="6" height="2.6" rx="1.3" fill="currentColor"/></svg></div>'+
    '<b>Turn your phone sideways</b><span>The Grand Prix races in landscape — more road ahead, and a thumb on each side to steer.</span></div>';
  function gpTurnFirst(host,start){
    host.innerHTML=GP_TURN; let inner=null, gone=false, t=0;
    const check=()=>{ clearTimeout(t); t=setTimeout(()=>{ if(gone||inner||gpUpright()) return; off(); host.innerHTML=''; inner=start(); },150); };
    const off=()=>{ removeEventListener('resize',check); try{ screen.orientation.removeEventListener('change',check); }catch(e){} };
    addEventListener('resize',check); try{ screen.orientation.addEventListener('change',check); }catch(e){}
    return { destroy(){ gone=true; clearTimeout(t); off(); if(inner&&inner.destroy) inner.destroy(); } };
  }

  function beeGrandPrix(host, opts, done){
    if(gpPhone() && gpUpright()) return gpTurnFirst(host, ()=>beeGrandPrix(host,opts,done));
    // Fill the play area (the steer/hold controls are absolutely overlaid on the canvas,
    // so the canvas can take almost the whole overlay height — no dark letterbox below).
    /* Sideways on a phone the HUD floats over the sky, the arcade bar is a thin strip,
       and the canvas takes the full height with a GUT-wide gutter each side for the
       thumbs — so no control ever sits on the road. */
    const LAND=gpPhone() && !gpUpright(), GUT=LAND?96:0;
    const top0=LAND?(()=>{ try{ return Math.max(0,host.getBoundingClientRect().top); }catch(e){ return 0; } })():0;
    const HtL=LAND?Math.max(200,Math.round(innerHeight-top0-4)):0;
    const Wd=LAND?Math.max(320,Math.min(innerWidth-2*GUT,Math.round(HtL*2.05))):Math.min(innerWidth-8,1600);
    const Ht=LAND?HtL:Math.max(340,Math.min(innerHeight-96,Math.round(Wd*0.92)));
    const diff=opts.diff||'medium';
    const HERO=(opts.hero)||heroAv();            // the chosen racer shows as the driver + the position marker
    const KART=(opts.kart)||'kart';              // chosen kart sprite (5 options in the start menu)
    // three scenarios: each is its own painted sky + road/grass palette
    const SCENES={
      meadow:{sky:'gp-sky',  prop:'tree',    light:{road:'#6C6C74',roadWear:'#65656E',verge:'#93A86B',grass:'#7BC169',rumble:'#EDEDED',lane:'#FFFFFF'}, dark:{road:'#64646C',roadWear:'#5E5E66',verge:'#8B9E64',grass:'#72B461',rumble:'#C7413F',lane:''}},
      sunset:{sky:'gp-sunset',prop:'cactus',  light:{road:'#6B5A63',roadWear:'#64545C',verge:'#D8A96E',grass:'#C98A4A',rumble:'#FFE7BE',lane:'#FFF3D8'}, dark:{road:'#63535B',roadWear:'#5D4D55',verge:'#CB9C63',grass:'#BC7E42',rumble:'#B5503A',lane:''}},
      city:  {sky:'gp-city',  prop:'building',light:{road:'#50505E',roadWear:'#4B4B58',verge:'#3E4870',grass:'#333B5E',rumble:'#8AE0FF',lane:'#EAF6FF'}, dark:{road:'#484852',roadWear:'#43434D',verge:'#374063',grass:'#2C3452',rumble:'#C452C4',lane:''}}
    };
    const SCN=SCENES[opts.scene]||SCENES.meadow;
    const SKY=SCN.sky, NIGHT=(opts.scene==='city');
    /* DISTANCE FOG — the colour the world dissolves INTO at the horizon. One value per
       scene, used by both the per-segment fog and the haze band, so the road and the sky
       agree about how far away "far" looks. */
    const FOG_RGB={meadow:'214,232,242', sunset:'255,214,160', city:'150,190,235'}[opts.scene]||'214,232,242';
    // one epic point-to-point run - length ~= minutes of driving; boxes pace the spelling
    /* `pull` is how hard a bend pushes you out, in road half-widths a second per unit of
       curve, FLAT OUT. It is the difficulty dial that changes the driving: rivals and
       hazards change who you are racing, this changes whether a corner is a decision.
       On the tightest bend (curve 5) at top speed it asks for 75% of full lock on easy,
       105% on medium, 118% on hard and 130% on champ — so easy holds flat out, medium only
       just, hard wants a lift and champ wants the brake. Hands-off, medium is on the grass
       at the first bend (4.7s); easy gives a small child about thirteen seconds. */
    const CFG=calmCFG({easy:{len:1800,laps:2,rivals:3,rival:0.84,haz:0.014,boxEvery:280,pull:0.33},
               medium:{len:2300,laps:2,rivals:4,rival:0.90,haz:0.026,boxEvery:300,pull:0.46},
               hard:{len:2800,laps:2,rivals:4,rival:0.96,haz:0.04,boxEvery:320,pull:0.52},
               champ:{len:3300,laps:2,rivals:4,rival:1.02,haz:0.055,boxEvery:340,pull:0.57}}[diff]);
    host.innerHTML=
      '<div class="sg-racehud"><div class="sg-rh-row">'+
        '<span class="sg-rh-place" id="sg-pos">1st <i>/ '+(CFG.rivals+1)+'</i></span>'+
        '<span class="sg-rh-lap" id="sg-lap">Lap 1/'+CFG.laps+'</span>'+
        '<div class="sg-posbar" id="sg-pb"><i class="sg-pb-road"></i><b class="sg-pb-flag">'+GP_FLAG()+'</b></div>'+
        '<span class="sg-rh-spd" id="sg-spd"></span></div></div>'+
      '<div class="sg-race3d"><canvas id="sg-cv"></canvas>'+
      '<button class="sg-hold" id="sg-hold" aria-label="Use power-up"><span class="sg-hold-empty">?</span></button>'+
      '<div class="sg-steer"><button class="sg-sbtn" data-s="-1" aria-label="Steer left">'+SGUI.chev(-1)+'</button>'+
      '<div class="sg-steer-r"><button class="sg-sbtn sg-brake" id="sg-brk" aria-label="Brake">'+GP_BRAKE()+'</button>'+
      '<button class="sg-sbtn" data-s="1" aria-label="Steer right">'+SGUI.chev(1)+'</button></div></div></div>'+
      '<div id="sg-card"></div>';
    if(LAND){ host.classList.add('sg-land'); host.style.setProperty('--sg-gut',Math.floor((innerWidth-Wd)/2)+'px'); }
    const cv=host.querySelector('#sg-cv');
    const dpr=Math.min(2,window.devicePixelRatio||1);
    cv.width=Math.round(Wd*dpr); cv.height=Math.round(Ht*dpr);
    cv.style.width=Wd+'px'; cv.style.height=Ht+'px';
    const cx=cv.getContext('2d'); cx.setTransform(dpr,0,0,dpr,0,0);

    /* ---- pseudo-3D track ---- */
    // drawDist is the count of road segments projected AND drawn every frame — the
    // dominant per-frame cost. 130 segments is 2.8s of road at top speed; 100 is 2.2s and
    // still well past the horizon haze, for 23% less work on every frame.
    const segLen=200, roadW=2200, rumbleLen=3, drawDist=100, camH=3600, fov=62;   // zoomed-in, high camera — the race world sits close and large, looking down onto the track
    // Elevated chase-cam: taller camera + a horizon lifted above mid-screen so you
    // look DOWN onto more of the track ahead instead of skimming it at ground level.
    const horizonY=Math.round(Ht*0.30);   // horizon high up-screen: more track visible from above
    const camDepth=1/Math.tan((fov/2)*Math.PI/180);
    sgTexPreload(['oil','cop','item-box',SKY].concat(SCN.prop!=='cactus'?['tree']:[]));   // every other prop is painted (GPS), never fetched   // hazard/scene art, decoded before first frame (karts are drawn: SB_KART_ART)
    const LIGHT=SCN.light;
    const DARK =SCN.dark;
    const segs=[];
    const lastY=()=>segs.length?segs[segs.length-1].p2.world.y:0;
    function addSeg(curve,y){ const n=segs.length;
      segs.push({index:n, curve:curve,
        p1:{world:{y:lastY(),z:n*segLen},camera:{},screen:{}},
        p2:{world:{y:y,z:(n+1)*segLen},camera:{},screen:{}},
        color:(Math.floor(n/rumbleLen)%2)?DARK:LIGHT, sprites:[]}); }
    const eI=(a,b,p)=>a+(b-a)*Math.pow(p,2), eIO=(a,b,p)=>a+(b-a)*(-Math.cos(p*Math.PI)/2+0.5);
    // CURVED but FLAT: the authored curves at full strength — the kart holds a WORLD-straight
    // line, so on a bend the road slides away from under it and the player must steer into the
    // curve (no auto-tracking). Hills stay flattened: crest culling made rivals flicker/slice.
    function road(enter,hold,leave,curve,hill){ hill=0; const sY=lastY(), eY=sY+hill*segLen, tot=enter+hold+leave; let i;
      for(i=0;i<enter;i++) addSeg(eI(0,curve,i/enter), eIO(sY,eY,i/tot));
      for(i=0;i<hold;i++)  addSeg(curve,              eIO(sY,eY,(enter+i)/tot));
      for(i=0;i<leave;i++) addSeg(eIO(curve,0,i/leave),eIO(sY,eY,(enter+hold+i)/tot)); }
    // long varied grand tour: repeated themed sectors until CFG.len is reached
    const SECTORS=[
      ()=>{ road(20,24,20,0,0); road(16,22,16,-3,0); road(16,26,16,0,2.2); },
      ()=>{ road(16,22,16,4,0); road(14,18,14,2,-2.4); road(18,28,18,-4,0); },
      ()=>{ road(16,22,16,0,1.8); road(22,28,22,0,0); road(14,20,14,-2,1.2); },
      ()=>{ road(16,20,16,3,-1.6); road(18,24,18,-5,0); road(20,26,20,0,0); },
      ()=>{ road(14,18,14,5,1.4); road(16,22,16,0,-2); road(18,24,18,2,0); }
    ];
    let si=0; const sectors=[]; while(segs.length<CFG.len){ const a=segs.length; SECTORS[si%SECTORS.length](); sectors.push([a,segs.length]); si++; }
    while(segs.length%rumbleLen!==0) addSeg(0,lastY());
    sectors[sectors.length-1][1]=segs.length;
    const trackLen=segs.length*segLen, TOTAL=trackLen*CFG.laps, FINVIS=trackLen-segLen*8;
    /* THE WORLD IS TO THE KART'S SCALE, AND IT CHANGES AS YOU DRIVE.
       Everything beside the road is in road half-widths, the unit the kart is drawn in
       (KART_W = 0.38). When the kart grew to that size the world did not: trees were 0.19
       wide, a tower was shorter than the kart, a police car half a kart. And it was one
       prop on a fixed beat for the whole race — "too many trees and cacti… repetitive and
       boring". A lap is now a run of zones (GP_ZONES) with their own ground, props,
       spacing, landmarks, strips and water. */
    const COP_W=0.46, OIL_W=0.34, BOX_W=0.27, POST_H=0.24;   // on the road: a car a touch wider than a kart; oil and the box sized to CATCH; a post half a kart high
    const WORLD=SCN.prop, ZONES=GP_ZONES[WORLD]||GP_ZONES.tree;
    const zoneCycle=ZONES.list.slice().sort(()=>Math.random()-0.5);
    sectors.forEach((r,i)=>{ for(let n=r[0];n<r[1];n++) segs[n].zone=zoneCycle[i%zoneCycle.length]; });
    const lerpHex=(a,b,t)=>{ const p=parseInt(a.slice(1),16), q=parseInt(b.slice(1),16), m=k=>Math.round(((p>>k)&255)*(1-t)+((q>>k)&255)*t);
      return '#'+((1<<24)+(m(16)<<16)+(m(8)<<8)+m(0)).toString(16).slice(1); };
    const ZP={}; ZONES.list.forEach(nm=>{ const z=ZONES.z[nm];
      ZP[nm]=[LIGHT,DARK].map((B,d)=>({...B, grass:z.grass?z.grass[d]:B.grass, verge:z.verge?(d?kShade(z.verge,-0.06):z.verge):B.verge, water:z.water?ZONES.water[d]:null})); });
    { let runStart=0; const BLEND=14;            // the ground tint eases into a new zone over 14 bands
      for(let n=0;n<segs.length;n++){ const sg=segs[n]; if(n>0&&sg.zone!==segs[n-1].zone) runStart=n;
        const d=(Math.floor(n/rumbleLen)%2), here=ZP[sg.zone][d], i=n-runStart;
        if(runStart>0&&i<BLEND){ const pz=ZP[segs[runStart-1].zone][d], t=(i+1)/(BLEND+1);
          sg.color={...here, grass:lerpHex(pz.grass,here.grass,t), verge:lerpHex(pz.verge,here.verge,t)}; }
        else sg.color=here; } }
    const runs=[]; segs.forEach((sg,n)=>{ if(!n||sg.zone!==segs[n-1].zone) runs.push({name:sg.zone,a:n,b:n+1}); else runs[runs.length-1].b=n+1; });
    const rnd=(a,b)=>a+Math.random()*(b-a);
    /* every prop's footprint clears the verge (1.42) by construction — a wide variant is
       pushed out rather than trusted to the zone's offset range */
    const put=(n,kind,off,far,v)=>{ if(n<4||n>=segs.length-2) return; const vv=v!=null?v:Math.floor(Math.random()*GP_VAR[kind]);
      if(kind!=='tree'&&kind!=='parktree'&&kind!=='lamp'){ const ft=GPS.box(kind,vv,WORLD).foot; if(Math.abs(off)<1.46+ft) off=Math.sign(off||1)*(1.46+ft); }
      segs[n].sprites.push({kind:'prop',p:kind,v:vv,off,k:Math.random(),far:far||GP_FAR[kind]}); };
    runs.forEach(run=>{ const z=ZONES.z[run.name], len=run.b-run.a;
      run.water=z.water==='one'?(Math.random()<0.5?-1:1):z.water==='both'?2:0;
      for(let n=run.a;n<run.b;n++){ const sg=segs[n]; sg.water=run.water; sg.strip=z.strip||null;
        }
      (z.props||[]).forEach(rule=>{
        const side=()=>{ if(rule.side==='water') return run.water===2?(Math.random()<0.5?-1:1):(run.water||1);
          if(rule.side==='dry') return run.water&&run.water!==2?-run.water:(Math.random()<0.5?-1:1);
          return Math.random()<0.5?-1:1; };
        if(rule.once!=null){ put(run.a+Math.round(len*rule.once),rule.k,side()*rnd(rule.off[0],rule.off[1])); return; }
        for(let n=run.a+Math.round(rnd(0,rule.gap[0])); n<run.b-2; n+=Math.round(rnd(rule.gap[0],rule.gap[1]))){
          const sd=side(), g=rule.group?Math.round(rnd(rule.group[0],rule.group[1]+0.49)):1;
          for(let q=0;q<g;q++) put(Math.min(run.b-1,n+q*Math.round(rnd(2,5))),rule.k,sd*(rnd(rule.off[0],rule.off[1])+q*0.55)); } });
      if(z.lamps) for(let n=run.a+3;n<run.b-1;n+=14){ put(n,'lamp',-1.62,0,0); put(n,'lamp',1.62,0,1); } });   // each lamp's arm reaches over the road
    /* MARKER POSTS, BOTH VERGES, EVERY 5 SEGMENTS. This is the oldest trick in pseudo-3D
       racing and the one thing this track had nothing of: at 46 segments a second a post
       every five is nine a second flicking past your shoulder, and THAT is what speed
       looks like. Trees at random offsets cannot do it — they are too sparse and too
       irregular to read as a rate. Regular spacing is the whole point: the eye counts
       them without being asked, so lifting off is visible before the speedo confirms it. */
    for(let n=0;n<segs.length;n+=6){ if(segs[n].strip==='rail') continue;   // a bridge has its railing instead
                                     segs[n].sprites.push({kind:'post',off:-1.06,k:n});
                                     segs[n].sprites.push({kind:'post',off:1.06,k:n}); }
    // mixed hazards + crazy distractions: oil slicks and patrol cops
    const HKINDS=['oil','oil','oil','cop'];
    const hazards=[]; for(let n=60;n<segs.length-40;n+=Math.floor(20+Math.random()*16)){ if(Math.random()<CFG.haz*8){
      const kind=HKINDS[Math.floor(Math.random()*HKINDS.length)];
      hazards.push({seg:n,off:(Math.random()*1.4-0.7),kind:kind}); } }
    const items=[]; for(let n=70;n<segs.length-60;n+=Math.floor(CFG.boxEvery*(0.8+Math.random()*0.5))){ items.push({seg:n,off:(Math.random()*1.1-0.55),gone:false,k:Math.random()*6}); }

    /* ---- racers: the villains ---- */
    const maxV=segLen*46, accel=maxV/4.6, offDecel=-maxV/1.6, offLimit=maxV/3.2;
    const PULL=CFG.pull;
    /* THE CAMERA FOLLOWS — MOST OF THE WAY, ALMOST AT ONCE.
       Welded to the kart (camX=playerX*roadW, kart at Wd/2) a kart on the grass was
       re-centred onto a road it had left. The fix for that went too far: FOLLOW 0.55 with a
       0.30s half-life made the kart SWIM — let go of the wheel and it kept gliding across the
       screen for most of a second while the camera caught up, which on a phone is motion
       nobody asked for and reads as the car steering itself. 0.85 / 0.08s keeps what the lag
       was for (the kart visibly moves before the world does, and a kart on the grass is
       drawn on the grass) without the glide. */
    const CAM_FOLLOW=0.85, CAM_HALF=0.08;
    let pos=0, playerX=0, push=0, v=0, over=false, mode='howto', lap=1, hudT=1; // howto -> count -> race -> spell -> done
    let camLag=0;                     // where the camera actually is, in road half-widths
    let _kartPx=0;                    // the kart's drawn screen x, read by the feel probe
    let _join=null;                   // where the near road hands over to the far ribbon, read by the seam probe
    /* what the kart LOOKS like it is doing — never read by the physics */
    let yawS=0, wheelPh=0, bumpT=0;
    const KART_W=0.38;                // a kart is 38% of the road's half-width: ~19% of the road, as a kart game's are
    const parts=[];                   // screen-space puffs behind the kart: exhaust, dust, tyre smoke
    const DUST={meadow:'150,128,88', sunset:'214,168,108', city:'150,160,190'}[opts.scene]||'150,128,88';
    let boostT=0, boostMul=1, shieldT=0, spinFlashT=0, countT=0, finishedRivals=0, gpCombo=0, offGrass=false;
    const heroKart=HERO;
    const VILL=[
      {name:'The Smudge',col:'#8B8B96',glyph:'🦋',sprite:'smudge-swarm',        kart:'kart-cruiser'},
      {name:'Glitch',    col:'#7B5CE0',glyph:'👾',sprite:'glitch-corrupt-glee', kart:'kart-rocket'},
      {name:'Vex',       col:'#C9A227',glyph:'🐝',sprite:'vex-full',            kart:'kart-red'},
      {name:'The Bramble',col:'#4A7A3A',glyph:'🌿',sprite:null,                kart:'kart-buggy'}];
    const rivals=[];
    for(let i=0;i<CFG.rivals;i++){ const vd=VILL[i%VILL.length];
      rivals.push({z:segLen*6*(i+1), x:(i-1.2)*0.5, spd:maxV*CFG.rival*(0.92+i*0.035),
        name:vd.name, col:vd.col, glyph:vd.glyph, sprite:vd.sprite, kart:vd.kart, spin:0, slow:0, fin:false, ph:Math.random()}); }

    /* ---- power-ups: spell a ? box to UNLOCK one, tap the slot (or Space) to FIRE ---- */
    const PWSVG={
      rocket:'<svg viewBox="0 0 40 40"><path d="M20 3c6 5 8 13 8 19l-4 5h-8l-4-5c0-6 2-14 8-19Z" fill="#E5484D"/><path d="M20 3c3 4 5 9 5 19h-5V3Z" fill="#FF8A8E" opacity=".7"/><circle cx="20" cy="15" r="3.4" fill="#BFE3FF" stroke="#2B3A67" stroke-width="1.2"/><path d="M12 24l-5 7 7-2M28 24l5 7-7-2" fill="#C43D5A"/><path d="M16 29h8l-1.6 6h-4.8Z" fill="#F5A623"/><path d="M17.5 35c.8 3 4.2 3 5 0l-2.5 4Z" fill="#FF6B35"/></svg>',
      turbo:'<svg viewBox="0 0 40 40"><path d="M8 22 22 5l-4 12h9L13 35l4-13H8Z" fill="#36D1FF" stroke="#0E7EA8" stroke-width="1.6" stroke-linejoin="round"/><path d="M25 9l6 2-4 4M27 22l6 2-4 4" stroke="#9BE7FF" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>',
      oil:'<svg viewBox="0 0 40 40"><g transform="rotate(-14 20 20)"><rect x="12" y="8" width="16" height="22" rx="3" fill="#2A2733"/><rect x="12" y="12" width="16" height="4" fill="#4A4657"/><rect x="12" y="22" width="16" height="4" fill="#4A4657"/><rect x="16" y="5" width="8" height="4" rx="1.4" fill="#17151D"/></g><path d="M28 30c3 2 5 4 4 6-1.4 2.4-5 1.4-5-1 0-1.6.4-3 1-5Z" fill="#171422"/><ellipse cx="14" cy="35" rx="7" ry="2.2" fill="#171422" opacity=".8"/></svg>',
      gust:'<svg viewBox="0 0 40 40"><path d="M33 12c0 7-8 8-17 8m19 2c-2 6-11 7-18 5m14-19c-4-3-12-3-16 2" fill="none" stroke="#39C6A5" stroke-width="3.4" stroke-linecap="round"/><circle cx="9" cy="11" r="2" fill="#39C6A5"/><circle cx="12" cy="29" r="2" fill="#8FE8D2"/><circle cx="30" cy="33" r="2" fill="#8FE8D2"/></svg>',
      honey:'<svg viewBox="0 0 40 40"><path d="M11 14c-3 3-3 12 1 16h16c4-4 4-13 1-16Z" fill="#F5B32B" stroke="#8A5A10" stroke-width="1.4"/><ellipse cx="20" cy="13" rx="10" ry="3.4" fill="#FFCF5C" stroke="#8A5A10" stroke-width="1.2"/><path d="M15 17c-1 3 0 7 1 9" stroke="#FFE49B" stroke-width="2.6" stroke-linecap="round"/><path d="M24 30c0 3 2 4 2 6 0 1.8-2.6 1.8-2.6 0 0-2 .6-3 .6-6Z" fill="#D89614"/></svg>',
      shield:'<svg viewBox="0 0 40 40"><path d="M20 4l12 5v9c0 8-5 14-12 18-7-4-12-10-12-18V9Z" fill="#5AB5F7" opacity=".35" stroke="#2E86D1" stroke-width="2"/><path d="M20 9l8 3.4v6c0 5.4-3.4 9.6-8 12.4-4.6-2.8-8-7-8-12.4v-6Z" fill="none" stroke="#BFE3FF" stroke-width="1.8"/><path d="M15 19l4 4 7-8" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'};
    const POWERS=[
      {id:'rocket',name:'Rocket boost',msg:'🚀 ROCKET! Hold on!',run(){ boostT=2.6; boostMul=1.75; }},
      {id:'turbo', name:'Turbo',msg:'⚡ TURBO!',run(){ boostT=4.0; boostMul=1.45; }},
      {id:'oil',   name:'Oil slick',msg:'🛢️ Oil dropped — chaser spun out!',run(){ let best=null,bd=1e9;
                     rivals.forEach(r=>{ const d=pos-r.z; if(d>0&&d<bd){bd=d;best=r;} }); if(best){best.spin=2.8;} else { boostT=1.5;boostMul=1.4; } }},
      {id:'gust',  name:'Gust push',msg:'🌪️ Gust — shoved them wide!',run(){ let best=null,bd=1e9;
                     rivals.forEach(r=>{ const d=r.z-pos; if(d>0&&d<bd){bd=d;best=r;} }); if(best){ best.x+=(best.x>=0?1:-1)*0.9; best.slow=2.0; } else { boostT=1.7;boostMul=1.4; } }},
      {id:'honey', name:'Sticky honey',msg:'🍯 Honey — every racer ahead slowed!',run(){ rivals.forEach(r=>{ if(r.z>pos) r.slow=2.8; }); }},
      {id:'shield',name:'Bubble shield',msg:'🛡️ Shield up!',run(){ shieldT=8; }}];
    let held=null;
    const holdBtn=host.querySelector('#sg-hold');
    function renderHold(){ holdBtn.innerHTML=held?PWSVG[held.id]:'<span class="sg-hold-empty">?</span>';
      holdBtn.classList.toggle('ready',!!held); }
    function fireHeld(){ if(!held||mode!=='race') return; const p=held; held=null; renderHold();
      try{flash(p.msg);}catch(_){ } try{p.run();}catch(e){} }
    holdBtn.onclick=fireHeld;

    /* ---- spelling gate: hitting a ? box pauses the race ---- */
    const feed=wordFeed(60);
    const gpRound=[];                      // the race's words, read by finish()
    function spellGate(){
      mode='spell'; letGo();
      const w=feed.next();
      const p=POWERS[Math.floor(Math.random()*POWERS.length)];
      const el=host.querySelector('#sg-card');
      el.innerHTML='<div class="sg-cardbox"><b>Item box — spell it to unlock the power-up</b>'+
        '<button class="sg-cardw" id="sg-cspk">'+iconSVG('volume',18)+'</button>'+meaningHTML(w)+
        '<div class="sg-inrow"><input id="sg-ci" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"><button class="sg-rbtn go" id="sg-cgo">Unlock</button></div></div>';
      el.style.display='grid'; try{ say(w.w); }catch(e){}
      const inp=el.querySelector('#sg-ci'); try{inp.focus();}catch(e){}
      function submit(){ const ok=sameSpelling(inp.value,w.w); wlog(w,ok); gpRound.push({w:w.w,ok:ok});
        el.style.display='none'; el.innerHTML='';
        if(ok){ held=p; renderHold();
          // spell combo: unbroken correct spells stack an instant extra boost
          gpCombo++; if(gpCombo>=2){ boostT=Math.max(boostT,1.2); boostMul=Math.max(boostMul,1.22+Math.min(gpCombo,6)*0.06); }
          const uc=host.querySelector('#sg-card');
          uc.innerHTML='<div class="sg-cardbox sg-unlock"><span class="sg-unlock-ic">'+PWSVG[p.id]+'</span><b>'+p.name+(gpCombo>=2?(' · '+gpCombo+'x combo'):'')+' unlocked!</b><i>tap the slot (or Space) to use it</i></div>';
          uc.style.display='grid';
          setTimeout(()=>{ uc.style.display='none'; uc.innerHTML=''; resume(); },1300);
        } else { gpCombo=0; try{flash('The box fizzles… next one is coming!');}catch(_){ } resume(); } }
      inp.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); submit(); } };
      el.querySelector('#sg-cgo').onclick=submit;
      el.querySelector('#sg-cspk').onclick=()=>{ try{ say(w.w); }catch(e){} };
    }
    function resume(){ countT=1.0; mode='count'; }

    /* ---- steering ----
       WHAT IS HELD, NOT WHAT HAPPENED LAST. The old handlers set steer on a press and zeroed
       it on ANY release, so rolling from Left to Right (press Right, then let go of Left) left
       the kart going straight with Right still held down. And a touch the browser turns into
       a gesture ends in pointercancel, which nothing listened for — the wheel stayed full over
       until the next tap. Each input now registers in `wheel` (a Map: the last one pressed
       wins) and every way an input can end removes it. */
    let steer=0, braking=false;
    const wheel=new Map(), pedal=new Set();
    const reSteer=()=>{ let s=0; wheel.forEach(d=>{ s=d; }); steer=s; };
    const press=(id,d)=>{ wheel.delete(id); wheel.set(id,d); reSteer(); };
    const lift=id=>{ if(wheel.delete(id)) reSteer(); };
    const brakeOn=id=>{ pedal.add(id); braking=true; };
    const brakeOff=id=>{ pedal.delete(id); braking=pedal.size>0; };
    const letGo=()=>{ wheel.clear(); pedal.clear(); steer=0; braking=false; };
    /* A pointer is CAPTURED on press, so a thumb that wanders off a 60px button keeps
       steering; and it ends on up, cancel or lost capture — never silently. */
    const hold=(el,down,up)=>{
      el.addEventListener('pointerdown',e=>{ if(down(e)===false) return;
        try{ el.setPointerCapture(e.pointerId); }catch(_){}
        if(e.preventDefault) e.preventDefault(); });
      ['pointerup','pointercancel','lostpointercapture'].forEach(t=>el.addEventListener(t,up));
      el.addEventListener('pointerleave',e=>{ if(!(el.hasPointerCapture&&el.hasPointerCapture(e.pointerId))) up(e); }); };
    const brk=host.querySelector('#sg-brk');
    if(brk) hold(brk, e=>brakeOn('p'+e.pointerId), e=>brakeOff('p'+e.pointerId));
    host.querySelectorAll('.sg-sbtn[data-s]').forEach(b=>{ const s=+b.dataset.s;
      hold(b, e=>press('p'+e.pointerId,s), e=>lift('p'+e.pointerId)); });
    const kd=e=>{ if(e.target&&e.target.tagName==='INPUT') return; const k=e.key;
      if(k==='ArrowLeft'||k==='a'){ e.preventDefault(); if(!e.repeat) press('kL',-1); }
      else if(k==='ArrowRight'||k==='d'){ e.preventDefault(); if(!e.repeat) press('kR',1); }
      else if(k==='ArrowDown'||k==='s'){ e.preventDefault(); brakeOn('k'); }
      else if(k===' '){ fireHeld(); e.preventDefault(); } };
    const ku=e=>{ const k=e.key;
      if(k==='ArrowLeft'||k==='a') lift('kL');
      if(k==='ArrowRight'||k==='d') lift('kR');
      if(k==='ArrowDown'||k==='s') brakeOff('k'); };
    /* a window that loses focus never hears the keyup — so let go of everything */
    const onVis=()=>{ if(document.visibilityState==='hidden') letGo(); };
    addEventListener('keydown',kd); addEventListener('keyup',ku);
    addEventListener('blur',letGo); document.addEventListener('visibilitychange',onVis);
    hold(cv, e=>{ if(mode!=='race'&&mode!=='count') return false; const r=cv.getBoundingClientRect();
      press('p'+e.pointerId,(e.clientX-r.left)<Wd/2?-1:1); }, e=>lift('p'+e.pointerId));
    /* turned upright mid-race: the race stops under the same "turn your phone" card and
       comes back on a one-second countdown — nobody loses a corner to a rotation */
    let paused=false, _rotT=0; const turnEl=document.createElement('div'); turnEl.className='sg-turn-wrap'; turnEl.innerHTML=GP_TURN;
    const onRot=()=>{ clearTimeout(_rotT); _rotT=setTimeout(()=>{ if(over||!gpPhone()) return; const up=gpUpright();
      if(up&&!paused){ paused=true; letGo(); host.appendChild(turnEl); }
      else if(!up&&paused){ paused=false; turnEl.remove(); if(mode==='race') resume(); } },150); };
    if(LAND){ addEventListener('resize',onRot); try{ screen.orientation.addEventListener('change',onRot); }catch(e){} }
    const unbind=()=>{ removeEventListener('keydown',kd); removeEventListener('keyup',ku);
      removeEventListener('resize',onRot); try{ screen.orientation.removeEventListener('change',onRot); }catch(e){}
      removeEventListener('blur',letGo); document.removeEventListener('visibilitychange',onVis); };

    /* ---- projection + drawing ---- */
    function project(p,camX,camY,camZ){ p.camera.x=(p.world.x||0)-camX; p.camera.y=(p.world.y||0)-camY; p.camera.z=(p.world.z||0)-camZ;
      p.screen.scale=camDepth/p.camera.z;
      p.screen.x=Wd/2 + p.screen.scale*p.camera.x*Wd/2;
      p.screen.y=horizonY - p.screen.scale*p.camera.y*Ht/2;
      p.screen.w=p.screen.scale*roadW*Wd/2; }
    function poly(x1,y1,x2,y2,x3,y3,x4,y4,col){ cx.fillStyle=col; cx.beginPath();
      cx.moveTo(x1,y1); cx.lineTo(x2,y2); cx.lineTo(x3,y3); cx.lineTo(x4,y4); cx.closePath(); cx.fill(); }
    function hx(c,f){ const n=parseInt(c.slice(1),16); let r=(n>>16)&255,g=(n>>8)&255,b=n&255;
      r=Math.max(0,Math.min(255,Math.round(r*f))); g=Math.max(0,Math.min(255,Math.round(g*f))); b=Math.max(0,Math.min(255,Math.round(b*f)));
      return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1); }
    function rrp(x,y,w,h,rad){ cx.beginPath(); if(cx.roundRect){ cx.roundRect(x,y,w,h,rad); } else { cx.rect(x,y,w,h); } }
    /* AERIAL PERSPECTIVE, BY DISTANCE — ONE FUNCTION FOR THE WHOLE ROAD.
       Everything mixes toward the scene's own FOG_RGB with distance, the colour the sky and
       the haze band already use. The first version faded the near road by n/drawDist — 82%
       sky by the hundredth segment — and never fogged the far ribbon at all, so the road
       went nearly white and then snapped back to bare tarmac: a hard seam straight across
       the screen, the "two tone road". Fog is now 1-e^(-n/K) of the SEGMENT DISTANCE, used
       by both loops, so the two halves meet at one colour and it keeps thickening all the
       way to the horizon. 32 buckets, cached. */
    const FOGRGB=FOG_RGB.split(',').map(Number), FOG_MAX=0.78, FOG_K=180;
    const _fogCache=new Map();
    function fogged(col,n){
      const b=Math.round((1-Math.exp(-Math.max(0,n)/FOG_K))*31);
      const key=col+'|'+b; let v=_fogCache.get(key); if(v) return v;
      const c=parseInt(col.slice(1),16), f=b/31*FOG_MAX;
      const r=Math.round(((c>>16)&255)*(1-f)+FOGRGB[0]*f);
      const g=Math.round(((c>>8)&255)*(1-f)+FOGRGB[1]*f);
      const bl=Math.round((c&255)*(1-f)+FOGRGB[2]*f);
      v='#'+((1<<24)+(r<<16)+(g<<8)+bl).toString(16).slice(1);
      _fogCache.set(key,v); return v; }
    /* the average of two palette colours — what alternating bands look like from far off */
    const mixHex=(a,b)=>{ const x=parseInt(a.slice(1),16), y=parseInt(b.slice(1),16);
      const m=sh=>Math.round((((x>>sh)&255)+((y>>sh)&255))/2);
      return '#'+((1<<24)+(m(16)<<16)+(m(8)<<8)+m(0)).toString(16).slice(1); };
    const VERGE=0.24;
    const FAR={road:mixHex(LIGHT.road,DARK.road), rumble:mixHex(LIGHT.rumble,DARK.rumble),
               verge:mixHex(LIGHT.verge,DARK.verge), wear:mixHex(LIGHT.roadWear,DARK.roadWear)};
    /* ===== ROADSIDE PROPS — one drawing, at every distance =====
       Props used to stop at drawDist (100 bands, a third of the way to the horizon) and
       fade in there by ALPHA — fine for a 0.19-wide tree, a field of see-through ghosts
       once trees were the size of trees. Now a prop is drawn the same way near and far:
       near ones inside the band loop (with its clip), far ones collected by the far-road
       loop out to their kind's range, and every one takes the ROAD'S OWN fog by distance
       (fogAt is fogged()'s curve), so it arrives out of the haze instead of out of nothing. */
    const fogAt=n=>(1-Math.exp(-Math.max(0,n)/FOG_K))*FOG_MAX;
    let _treeFlip=null;
    const treeFlip=tr=>{ if(_treeFlip&&_treeFlip.w===tr.width) return _treeFlip.c;
      const c=document.createElement('canvas'); c.width=tr.width; c.height=tr.height; const g=c.getContext('2d');
      g.translate(c.width,0); g.scale(-1,1); g.drawImage(tr,0,0); _treeFlip={c,w:tr.width}; return c; };
    function drawPropSp(sx,sy,hw,sp,n){ const fog=fogAt(n);
      if(sp.p==='tree'||sp.p==='parktree'){ const tr=sgTex('tree'); if(!tr) return;
        const dw=hw*(sp.p==='tree'?1.1:0.78)*(0.85+sp.k*0.35), dh=dw*(tr.height/tr.width);
        if(dw>8){ cx.fillStyle='rgba(0,0,0,.18)'; cx.beginPath(); cx.ellipse(sx,sy,dw*0.3,dw*0.08,0,0,7); cx.fill(); }
        GPS.blit(cx,sp.v?treeFlip(tr):tr,sx-dw/2,sy-dh,dw,dh,fog,FOG_RGB); return; }
      const t=GPS.tex(sp.p,sp.v,WORLD), dw=t.bw*hw, dh=t.bh*hw;
      GPS.blit(cx,t.cv,sx-dw/2,sy-dh,dw,dh,fog,FOG_RGB); }
    /* STRIPS run along the road instead of standing at a point — a farm fence, a bridge
       railing — drawn band by band between each band's near and far edge, so they bend with
       the road, and faded out by the end of drawDist, where they are a pixel thick. (A
       canyon WALL was a strip once: flat bands with seams and a hard end; the canyon is
       painted sandstone formations now.) */
    function drawStrip(kind,x1,y1,w1,x2,y2,w2,n,si){
      const fade=n>60?Math.max(0,(100-n)/40):1; if(fade<=0.02) return;
      const isF=kind==='fence', o=isF?1.62:1.36, col=fogged(isF?'#F2EFE8':'#A9B2C6',n), a0=cx.globalAlpha; cx.globalAlpha=a0*fade;
      for(const sd of [-1,1]){ const ax=x1+sd*o*w1, bx=x2+sd*o*w2;
        for(const h of (isF?[0.13,0.25]:[0.16,0.3])) poly(ax,y1-h*w1, bx,y2-h*w2, bx,y2-(h+0.028)*w2, ax,y1-(h+0.028)*w1, col);
        if(si%(isF?2:3)===0){ const pw=0.035*w1, ph=(isF?0.3:0.34)*w1; cx.fillStyle=col; cx.fillRect(ax-pw/2,y1-ph,pw,ph); } }
      cx.globalAlpha=a0; }
    const farItems=[];                       // far props, collected near-to-far, drawn far-to-near
    function drawBG(){
      const hz=horizonY;
      const sky=sgTex(SKY);
      if(sky){
        // A backdrop belongs BEHIND and ABOVE the horizon. The painting's own sky band
        // (its top ~68%, i.e. sky + skyline/hills) is cropped and mapped onto the area
        // above the horizon; the ground below is OUR gradient. Drawing the whole painting
        // full-height put its bottom edge mid-screen — a hard seam straight across the road.
        /* THE PAINTING OWNS THE SKY; THE GROUND IS LEVEL AND OURS.
           An earlier pass let the painting run 42% of the way down the ground under a
           see-through gradient, hoping the far field could BE the picture. It cannot:
           every painting's own ground-line sits at a different height (and moves with
           the canvas aspect), so the road ribbon converging on OUR projection horizon
           rode up over the painted hills and read as floating into the air. Now the
           painting is cropped to strictly ABOVE the horizon and the ground below it is
           opaque and level — and because the road genuinely converges to a point AT
           that line (the projected far ribbon in draw()), there is no cut for a lid
           to cause: road tip, ground edge and painting base all meet on one line. */
        const par=Math.sin(pos/2600)*16 - playerX*26;         // gentle parallax
        const groundH=Ht-hz;
        const srcH=sky.height*0.68, iw=Wd*1.12;
        try{ cx.drawImage(sky, 0,0, sky.width,srcH, -(iw-Wd)/2 + par*0.35, 0, iw, hz+2); }catch(e){}
        const gg=cx.createLinearGradient(0,hz,0,Ht);
        gg.addColorStop(0,  hx(LIGHT.grass,1.14));            // lit at the horizon
        gg.addColorStop(0.5,hx(LIGHT.grass,1.0));
        gg.addColorStop(1,  hx(LIGHT.grass,0.86));            // shaded at the bumper
        cx.fillStyle=gg; cx.fillRect(0,hz,Wd,groundH);
        if(NIGHT){   // neon city: let the skyline bleed a glow onto the ground
          const ng=cx.createLinearGradient(0,hz-30,0,hz+120);
          ng.addColorStop(0,'rgba(150,220,255,.30)'); ng.addColorStop(1,'rgba(150,220,255,0)');
          cx.fillStyle=ng; cx.fillRect(0,hz-30,Wd,150);
        }
        // atmospheric haze across the join, so the painting and our ground read as one distance
        /* A whisper of haze at the join and nothing more — the painting is meant to be
           SEEN, not washed out. The road reaching a true vanishing point (the wedge in
           draw()) is what removes the cut; haze was never the right tool for it. */
        const hb=cx.createLinearGradient(0,hz-14,0,hz+26);
        hb.addColorStop(0,'rgba('+FOG_RGB+',0)');
        hb.addColorStop(.5,'rgba('+FOG_RGB+',.22)');
        hb.addColorStop(1,'rgba('+FOG_RGB+',0)');
        cx.fillStyle=hb; cx.fillRect(0,hz-14,Wd,40);
        return;
      }
      const sway=Math.sin(pos/2600)*34 - playerX*26;
      const g=cx.createLinearGradient(0,0,0,hz); g.addColorStop(0,'#3E7FD6'); g.addColorStop(.6,'#7FB8EC'); g.addColorStop(1,'#DEEFFB');
      cx.fillStyle=g; cx.fillRect(0,0,Wd,hz);
      const sx=Wd*0.72, sy=hz*0.42;
      const sg=cx.createRadialGradient(sx,sy,3,sx,sy,95); sg.addColorStop(0,'rgba(255,251,224,.95)'); sg.addColorStop(.5,'rgba(255,238,170,.4)'); sg.addColorStop(1,'rgba(255,238,170,0)');
      cx.fillStyle=sg; cx.fillRect(0,0,Wd,hz);
      cx.fillStyle='rgba(255,252,236,.96)'; cx.beginPath(); cx.arc(sx,sy,20,0,7); cx.fill();
      function ridge(baseY,amp,col,seed){ cx.fillStyle=col; cx.beginPath(); cx.moveTo(-40,hz);
        for(let i=-1;i<=13;i++){ const xx=Wd*i/12+sway*(amp/46); cx.lineTo(xx, baseY-amp*Math.abs(Math.sin(i*0.8+seed))); }
        cx.lineTo(Wd+40,hz); cx.closePath(); cx.fill(); }
      ridge(hz-10,60,'#B9D2DE',0.2); ridge(hz-4,48,'#93B9CB',0.5); ridge(hz,34,'#6FA487',1.7);
      cx.fillStyle='rgba(255,255,255,.88)';
      for(let i=0;i<5;i++){ const cxp=((i*Wd/4 + pos/48) % (Wd+140))-70, cyp=hz*0.26+(i%3)*17;
        cx.beginPath(); cx.ellipse(cxp,cyp,28,12,0,0,7); cx.ellipse(cxp+24,cyp+4,21,10,0,0,7); cx.ellipse(cxp-22,cyp+5,18,9,0,0,7); cx.fill(); }
      cx.fillStyle='#5FAE55'; cx.fillRect(0,hz,Wd,Ht-hz);
      const hg=cx.createLinearGradient(0,hz-18,0,hz+18); hg.addColorStop(0,'rgba(233,246,255,0)'); hg.addColorStop(.5,'rgba(233,246,255,.6)'); hg.addColorStop(1,'rgba(233,246,255,0)');
      cx.fillStyle=hg; cx.fillRect(0,hz-18,Wd,36);
    }
    const hzY=()=>horizonY;
    /* _vis is written only for bands inside this frame's draw range, so a band the camera
       jumped past keeps last time's true. Anything placed by band (rivals, hazards, boxes)
       checks the band was visited THIS frame, or a jump leaves ghosts drawn at old positions. */
    let _frameN=0;
    function draw(){ _frameN++;
      drawBG();
      const posm=pos%trackLen;
      const base=segs[Math.floor(posm/segLen)%segs.length]; const basePct=(posm%segLen)/segLen;
      let x=0, dx=-(base.curve*basePct), maxy=Ht;
      let _lastSeg=null;                  // the furthest road band actually drawn
      _join=null;
      /* camLag, not playerX — see CAM_FOLLOW. Welding the camera to the kart drew it
         dead centre no matter where it was, which is what "it drives itself" was. */
      const camX=camLag*roadW;
      for(let n=0;n<drawDist;n++){ const seg=segs[(base.index+n)%segs.length];
        const looped=seg.index<base.index; const cz=posm-(looped?trackLen:0);
        project(seg.p1, camX - x,        camH, cz);
        project(seg.p2, camX - x - dx,   camH, cz);
        x+=dx; dx+=seg.curve;
        seg._vis=false; seg._clip=maxy; seg._far=n; seg._vf=_frameN;   // _vis is only true for bands THIS frame visited — see _frameN
        if(seg.p1.camera.z<=camDepth || seg.p2.screen.y>=seg.p1.screen.y || seg.p2.screen.y>=maxy) continue;
        seg._vis=true; maxy=seg.p2.screen.y;
        const s1=seg.p1.screen, s2=seg.p2.screen, c=seg.color;
        /* AERIAL PERSPECTIVE ON THE GRASS. The alternating bands are the speed cue and
           they have to stay, but painted at a flat 0.62 all the way to the vanishing
           point they read as corduroy laid over the picture — hard-edged stripes from
           the bumper to the hills, which is most of what "the graphics look flat" is.
           Fade the band out with distance and the ground gradient underneath takes
           over: stripes where they sell speed, a painted field where they would only
           sell stripes. The untextured branch stays opaque — there it IS the ground. */
        if(sgTex(SKY)){
          const gA=Math.max(0,Math.min(1,(s1.y-horizonY)/((Ht-horizonY)*0.52)));
          if(gA>0.01){ cx.globalAlpha=0.62*gA; poly(0,s1.y, 0,s2.y, Wd,s2.y, Wd,s1.y, c.grass); cx.globalAlpha=1; }
        }
        else poly(0,s1.y, 0,s2.y, Wd,s2.y, Wd,s1.y, c.grass);
        /* WATER where the zone has it — one side for a lakeshore, both for a bridge. Opaque,
           and faded with distance the way the grass is, so it gives way to the ground. */
        if(seg.water && c.water){ const gW=Math.max(0,Math.min(1,(s1.y-horizonY)/((Ht-horizonY)*0.45)));
          if(gW>0.01){ const wc=fogged(c.water,n), a=seg.water===2?1.42:1.62, b=40; cx.globalAlpha=gW;
            for(const sd of (seg.water===2?[-1,1]:[seg.water])) poly(s1.x+sd*a*s1.w,s1.y, s2.x+sd*a*s2.w,s2.y, s2.x+sd*b*s2.w,s2.y, s1.x+sd*b*s1.w,s1.y, wc);
            cx.globalAlpha=1; } }
        /* A VERGE. Outside the rumble a real circuit has a strip of worn ground before
           the grass proper — run-off, dust, the bit everyone puts two wheels on. Without
           it the tarmac met an unbroken green plane in one hard line, and a flat field is
           the largest area of flat colour in the frame. Two small opaque polys a segment,
           right where the eye already is. It was 0.46 of a road-width and olive-grey, which
           on a phone read as a second, paler ground beside the road; it is a shoulder now. */
        if(s1.w>6){ const v1=s1.w*VERGE, v2=s2.w*VERGE, R1=s1.w*1.18, R2=s2.w*1.18, vc=fogged(c.verge,n);
          poly(s1.x-R1-v1,s1.y, s2.x-R2-v2,s2.y, s2.x-R2,s2.y, s1.x-R1,s1.y, vc);
          poly(s1.x+R1+v1,s1.y, s2.x+R2+v2,s2.y, s2.x+R2,s2.y, s1.x+R1,s1.y, vc); }
        const r1=s1.w*0.18, r2=s2.w*0.18;
        poly(s1.x-s1.w-r1,s1.y, s2.x-s2.w-r2,s2.y, s2.x-s2.w,s2.y, s1.x-s1.w,s1.y, fogged(c.rumble,n));
        poly(s1.x+s1.w+r1,s1.y, s2.x+s2.w+r2,s2.y, s2.x+s2.w,s2.y, s1.x+s1.w,s1.y, fogged(c.rumble,n));
        poly(s1.x-s1.w,s1.y, s2.x-s2.w,s2.y, s2.x+s2.w,s2.y, s1.x+s1.w,s1.y, fogged(c.road,n));
        /* THE RACING LINE. Two strips of tarmac worn darker where every kart has been,
           which is the detail that stops a road reading as a painted grey ribbon: it
           gives the surface a history and the eye something to track through a bend.
           Drawn only while the band is wide enough to be more than a smear, and only ~6
           levels darker than the tarmac: at 14 it read as a second colour of road. */
        if(s1.w>14){ const RL=0.46, rw1=s1.w*0.115, rw2=s2.w*0.115, wl=fogged(c.roadWear,n);
          poly(s1.x-s1.w*RL-rw1,s1.y, s2.x-s2.w*RL-rw2,s2.y, s2.x-s2.w*RL+rw2,s2.y, s1.x-s1.w*RL+rw1,s1.y, wl);
          poly(s1.x+s1.w*RL-rw1,s1.y, s2.x+s2.w*RL-rw2,s2.y, s2.x+s2.w*RL+rw2,s2.y, s1.x+s1.w*RL+rw1,s1.y, wl); }
        /* a solid white edge line inside each rumble — real tracks have one, and it is
           what makes the road's WIDTH readable at speed instead of a grey mass */
        if(s1.w>10){ const el=fogged('#F4F2EA',n), e1=s1.w*0.022, e2=s2.w*0.022, EO=0.93;
          poly(s1.x-s1.w*EO-e1,s1.y, s2.x-s2.w*EO-e2,s2.y, s2.x-s2.w*EO+e2,s2.y, s1.x-s1.w*EO+e1,s1.y, el);
          poly(s1.x+s1.w*EO-e1,s1.y, s2.x+s2.w*EO-e2,s2.y, s2.x+s2.w*EO+e2,s2.y, s1.x+s1.w*EO+e1,s1.y, el); }
        if(c.lane){ const lw1=s1.w*0.03, lw2=s2.w*0.03; poly(s1.x-lw1,s1.y, s2.x-lw2,s2.y, s2.x+lw2,s2.y, s1.x+lw1,s1.y, fogged(c.lane,n)); }
        // checkered finish strip
        if(Math.abs(seg.index*segLen-FINVIS)<segLen*2){ const cw=(s1.w*2)/10;
          for(let k=0;k<10;k++){ cx.fillStyle=(k%2)?'#111':'#EEE'; cx.fillRect(s1.x-s1.w+k*cw,s1.y-3,cw,6); } }
        _lastSeg={x:s2.x,y:s2.y,w:s2.w,c:c}; _join=_lastSeg;
      }
      /* THE ROAD MEETS THE HORIZON AT A POINT — BY PROJECTION, NOT BY A WEDGE.
         drawDist segments end ~108px short of the horizon and still ~165px wide; that
         stump against the backdrop was the cut. The first fix closed it with one
         STRAIGHT wedge to a vanishing point, which reads as a grey pyramid the moment
         the road curves — the wedge ignored the bend the segments had been drawing.
         This carries on the real projection instead: keep accumulating the track's own
         curve past drawDist (six additions a segment — the expensive part of a segment
         is drawing it, not projecting it) and emit a band only when it advances a whole
         screen pixel. ~110 polygons for a road that genuinely bends with the track all
         the way down to a sub-pixel sliver at the horizon. */
      if(_lastSeg){
        /* ONE colour set for the whole far ribbon, and it is the AVERAGE of the light and
           dark bands: out here a band is a sliver covering several segments, so inheriting
           the alternation strobed the distant road ~15x a second — but plain LIGHT is not
           what the eye sees either (red-and-white kerb far off reads pink, not white). Fogged
           by the same fogged(col,n) as the near road, and it carries the same verge, edge
           lines and racing line while they are wide enough to see, so nothing stops at the
           join. */
        const c=FAR;
        let pxD=_lastSeg.x, pwD=_lastSeg.w, pyD=_lastSeg.y;
        let n=drawDist; farItems.length=0;
        while(pyD>horizonY+1 && n<6000){
          const seg=segs[(base.index+n)%segs.length];
          if(n<1800 && seg.sprites.length){ const z1=(n-basePct)*segLen, s1=camDepth/z1, hw1=s1*roadW*Wd/2;
            for(let q=0;q<seg.sprites.length;q++){ const sp=seg.sprites[q]; if(sp.kind!=='prop'||n>=sp.far) continue;
              farItems.push({t:0,sx:Wd/2+s1*(x-camX)*Wd/2+hw1*sp.off,sy:horizonY+s1*camH*Ht/2,hw:hw1,sp,n}); } }
          const xf=x+dx;
          x+=dx; dx+=seg.curve; n++;
          const z=(n-basePct)*segLen;            // far edge of the band just entered
          const sc=camDepth/z;
          const y=horizonY + sc*camH*Ht/2;       // camera.y is -camH: the road rises TOWARD the horizon from below
          if(pyD-y<1) continue;                  // sub-pixel step: accumulate, draw later
          const xs=Wd/2 + sc*(xf-camX)*Wd/2, w=sc*roadW*Wd/2;
          /* no grass band out here — the ground gradient (and the painting through it)
             already owns the far field, and ~110 alpha-blended full-width polys a frame
             is what pushed p99 from 17ms to 33. Rumble stops once it is a sliver. */
          if(w>3){ const r1=pwD*0.18, r2=w*0.18, rc=fogged(c.rumble,n);
            const V1=pwD*1.18, V2=w*1.18, g1=pwD*VERGE, g2=w*VERGE, vc=fogged(c.verge,n);
            poly(pxD-V1-g1,pyD, xs-V2-g2,y, xs-V2,y, pxD-V1,pyD, vc);
            poly(pxD+V1+g1,pyD, xs+V2+g2,y, xs+V2,y, pxD+V1,pyD, vc);
            poly(pxD-pwD-r1,pyD, xs-w-r2,y, xs-w,y, pxD-pwD,pyD, rc);
            poly(pxD+pwD+r1,pyD, xs+w+r2,y, xs+w,y, pxD+pwD,pyD, rc); }
          poly(pxD-pwD,pyD, xs-w,y, xs+w,y, pxD+pwD,pyD, fogged(c.road,n));
          if(w>14){ const RL=0.46, a1=pwD*0.115, a2=w*0.115, wl=fogged(c.wear,n);
            poly(pxD-pwD*RL-a1,pyD, xs-w*RL-a2,y, xs-w*RL+a2,y, pxD-pwD*RL+a1,pyD, wl);
            poly(pxD+pwD*RL-a1,pyD, xs+w*RL-a2,y, xs+w*RL+a2,y, pxD+pwD*RL+a1,pyD, wl); }
          if(w>10){ const el=fogged('#F4F2EA',n), e1=pwD*0.022, e2=w*0.022, EO=0.93;
            poly(pxD-pwD*EO-e1,pyD, xs-w*EO-e2,y, xs-w*EO+e2,y, pxD-pwD*EO+e1,pyD, el);
            poly(pxD+pwD*EO-e1,pyD, xs+w*EO-e2,y, xs+w*EO+e2,y, pxD+pwD*EO+e1,pyD, el); }
          pxD=xs; pwD=w; pyD=y;
        }
        // whatever sub-pixel sliver remains, closed to its own point
        if(pyD>hzY()) poly(pxD-pwD,pyD, pxD,hzY(), pxD,hzY(), pxD+pwD,pyD, fogged(c.road,n));
        /* the far props, far to near; only the last stretch fades, where they are a few
           pixels of near-fog colour anyway */
        for(let i=farItems.length-1;i>=0;i--){ const it=farItems[i];
          cx.globalAlpha=Math.max(0,Math.min(1,(it.sp.far-it.n)/(it.sp.far*0.15)));
          drawPropSp(it.sx,it.sy,it.hw,it.sp,it.n); }
        cx.globalAlpha=1;
      }
      const order=[];
      for(let n=drawDist-1;n>=0;n--){ const seg=segs[(base.index+n)%segs.length];
        if(!seg._vis) continue;
        const sc=seg.p1.screen;
        seg.sprites.forEach(sp=>{ order.push({y:sc.y,scale:sc.scale,sx:sc.x+sc.w*(sp.off||0),sy:sc.y,t:sp.kind,sp:sp,w2:sc.w,k:sp.k||0,clip:seg._clip,far:seg._far}); });
        if(seg.strip){ const s2=seg.p2.screen;
          order.push({y:sc.y,t:'strip',kind:seg.strip,x1:sc.x,y1:sc.y,w1:sc.w,x2:s2.x,y2:s2.y,w2:s2.w,si:seg.index,clip:seg._clip,far:seg._far}); } }
      hazards.forEach(hh=>{ const seg=segs[hh.seg]; if(seg&&seg._vis&&seg._vf===_frameN){ const sc=seg.p1.screen; order.push({y:sc.y,scale:sc.scale,sx:sc.x+sc.w*hh.off,sy:sc.y,t:hh.kind||'oil',hw:sc.w,clip:seg._clip,far:seg._far}); } });
      items.forEach(it=>{ if(it.gone) return; const seg=segs[it.seg]; if(seg&&seg._vis&&seg._vf===_frameN){ const sc=seg.p1.screen; order.push({y:sc.y,scale:sc.scale,sx:sc.x+sc.w*it.off,sy:sc.y,t:'item',it:it,clip:seg._clip,far:seg._far}); } });
      /* A RIVAL IS DRAWN WHERE IT IS, NOT AT THE NEAR EDGE OF ITS BAND. Snapped to p1, a
         rival hopped one band (200 units) at a time — at the speeds rivals pass you that
         is a visible jump several times a second. Depth is linear in camera space inside
         a band, so interpolate there and project, which is exact. */
      rivals.forEach(r=>{ const zm=r.z%trackLen, si=Math.floor(zm/segLen)%segs.length, seg=segs[si]; r._sy=null;
        if(!seg||!seg._vis||seg._vf!==_frameN) return;
        const f=(zm-si*segLen)/segLen, a=seg.p1.camera, b=seg.p2.camera, cz2=a.z+(b.z-a.z)*f; if(cz2<=camDepth) return;
        const sc=camDepth/cz2, sx=Wd/2+sc*(a.x+(b.x-a.x)*f)*Wd/2+sc*roadW*Wd/2*r.x, sy=horizonY-sc*(a.y+(b.y-a.y)*f)*Ht/2;
        r._sx=sx; r._sy=sy;
        order.push({y:sy,scale:sc,sx:sx,sy:sy,t:'rival',r:r,clip:seg._clip,far:seg._far}); });
      order.sort((a,b)=>a.y-b.y);
      order.forEach(o=>{ if(o.t!=='prop' && o.t!=='strip' && (o.far||0)>95) return;   // beyond this they are sub-pixel; props carry on in the far loop
        const hw=o.scale*roadW*Wd/2;            // the road's half-width at this depth, px
        const w=Math.max(6,hw*0.11);
        /* A POST NEEDS NO CLIP PATH. It is a few pixels wide and sits on the verge, so it
           can never spill over nearer road the way a tree can — and there are forty of
           them a frame. save + rect + clip + restore forty times was most of what the
           marker posts cost: p99 27.1ms with, 18.9 without, for an identical picture. */
        if(o.t==='post'){
          if((o.far||0)>66) return;              // sub-pixel and shimmering out here anyway
          cx.globalAlpha=Math.max(0,Math.min(1,(66-(o.far||0))/22));
          /* a slim white post with a red reflector band, and a shadow thrown along the
             ground so it is planted rather than floating */
          const ph=hw*POST_H, pw2=Math.max(1,hw*POST_H*0.086), bx=o.sx, by=o.sy;
          cx.fillStyle='rgba(30,40,25,.20)';
          cx.beginPath(); cx.ellipse(bx+pw2*0.7,by,pw2*1.9,pw2*0.7,0,0,7); cx.fill();
          cx.fillStyle=fogged('#F7F5EE',o.far||0);
          cx.fillRect(bx-pw2/2,by-ph,pw2,ph);
          cx.fillStyle=fogged('#D8452F',o.far||0);
          cx.fillRect(bx-pw2/2,by-ph*0.86,pw2,Math.max(1,ph*0.17));
          cx.globalAlpha=1; return; }
        cx.save(); cx.beginPath(); cx.rect(0,0,Wd,o.clip||Ht); cx.clip();
        cx.globalAlpha=(o.t==='prop'||o.t==='strip')?1:Math.max(0,Math.min(1,(95-(o.far||0))/25));
        if(o.t==='prop'){ drawPropSp(o.sx,o.sy,hw,o.sp,o.far||0); }
        else if(o.t==='strip'){ drawStrip(o.kind,o.x1,o.y1,o.w1,o.x2,o.y2,o.w2,o.far||0,o.si); }
        else if(o.t==='oil'){ const oil=sgTex('oil');
          if(oil){ const ow=hw*OIL_W, oh=ow*(oil.height/oil.width); try{ cx.drawImage(oil,o.sx-ow/2,o.sy-oh*0.62,ow,oh); }catch(e){} }
          else { cx.fillStyle='rgba(18,16,24,.78)'; cx.beginPath(); cx.ellipse(o.sx,o.sy-w*0.1,w*0.95,w*0.32,0,0,7); cx.fill();
            cx.fillStyle='rgba(150,110,210,.55)'; cx.beginPath(); cx.ellipse(o.sx-w*0.22,o.sy-w*0.16,w*0.34,w*0.11,0,0,7); cx.fill();
            cx.fillStyle='rgba(90,200,255,.35)'; cx.beginPath(); cx.ellipse(o.sx+w*0.25,o.sy-w*0.06,w*0.22,w*0.07,0,0,7); cx.fill(); } }
        else if(o.t==='cop'){ const cop=sgTex('cop');
          if(cop){ const cw=hw*COP_W, ch2=cw*(cop.height/cop.width); try{ cx.drawImage(cop,o.sx-cw/2,o.sy-ch2*0.9,cw,ch2); }catch(e){}
            // flashing roof light-bar
            const on=(Math.floor(pos/90)%2)===0; cx.globalAlpha*=0.9;
            cx.fillStyle=on?'#FF3B4D':'#3B7BFF'; cx.beginPath(); cx.ellipse(o.sx,o.sy-ch2*0.86,cw*0.105,cw*0.047,0,0,7); cx.fill(); cx.globalAlpha=Math.max(0,Math.min(1,(95-(o.far||0))/25)); }
          else { cx.fillStyle='#20222B'; rrp(o.sx-w*0.5,o.sy-w*0.8,w,w*0.8,w*0.16); cx.fill();
            cx.fillStyle='#EDEDED'; cx.fillRect(o.sx-w*0.5,o.sy-w*0.5,w,w*0.22);
            const on=(Math.floor(pos/90)%2)===0; cx.fillStyle=on?'#FF3B4D':'#3B7BFF'; cx.fillRect(o.sx-w*0.22,o.sy-w*0.92,w*0.44,w*0.12); } }
        else if(o.t==='item'){ const s=Math.max(14,hw*BOX_W/1.9), yy=o.sy-w*1.25-Math.sin(pos/180+o.it.k)*4;
          cx.save(); cx.translate(o.sx,yy); cx.rotate(Math.sin(pos/300+o.it.k)*0.12);
          const halo=cx.createRadialGradient(0,0,s*0.2,0,0,s*1.5);
          halo.addColorStop(0,'rgba(140,230,255,.5)'); halo.addColorStop(1,'rgba(140,230,255,0)');
          cx.fillStyle=halo; cx.beginPath(); cx.arc(0,0,s*1.5,0,7); cx.fill();
          cx.fillStyle='rgba(0,0,0,.16)'; cx.beginPath(); cx.ellipse(0,w*1.15,s*0.5,s*0.16,0,0,7); cx.fill();
          const box=sgTex('item-box');
          if(box){ const bw=s*1.9, bh=bw*(box.height/box.width); try{ cx.drawImage(box,-bw/2,-bh/2,bw,bh); }catch(e){} }
          else {
            const ig=cx.createLinearGradient(0,-s,0,s); ig.addColorStop(0,'#8BE7FF'); ig.addColorStop(1,'#2E9BD6');
            cx.fillStyle=ig; rrp(-s/2,-s/2,s,s,s*0.22); cx.fill();
            cx.strokeStyle='#fff'; cx.lineWidth=Math.max(1.5,s*0.06); cx.stroke();
            cx.fillStyle='rgba(255,255,255,.35)'; rrp(-s/2+2,-s/2+2,s-4,s*0.3,s*0.16); cx.fill();
            cx.fillStyle='#fff'; cx.font='800 '+Math.round(s*0.78)+'px Fraunces,serif'; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText('?',0,s*0.04);
            cx.textAlign='left'; cx.textBaseline='alphabetic'; }
          cx.restore(); }
        else { const r=o.r, kw=w*(KART_W/0.11), sp=r.spin>0;
          kartDraw(cx,o.sx,o.sy,kw,{style:r.kart,body:r.col,driver:r.sprite?sgImg(r.sprite):null,glyph:r.sprite?null:r.glyph,
            yaw:sp?Math.sin(bumpT*14)*0.9:Math.sin(bumpT*0.9+r.ph*6)*0.12, wheel:(wheelPh+r.ph)%1, t:bumpT+r.ph*9,
            lift:-Math.sin(bumpT*8.5+r.ph*7)*0.25});
          if(sp){ cx.font='700 '+Math.round(kw*0.4)+'px serif'; cx.textAlign='center'; cx.fillText('💫',o.sx,o.sy-kw*1.25); cx.textAlign='left'; } }
        cx.globalAlpha=1; cx.restore();
      });
      /* THE KART IS DRAWN WHERE IT IS. Its offset from centre is measured in the same
         projection as the road — hwK is the road's half-width at the kart's line — so
         "half a road-width right of the middle" is half a road-width on screen, and a
         kart on the grass is drawn on the grass. It is KART_W of the road wide, the same
         scale the rivals are drawn at, so a rival alongside is the same size as you.
         It no longer ROTATES: a turn is the kart yawing (SB_KART_ART), not the picture
         tilting. */
      /* THE KART'S SIZE IS A CONSTANT. It used to come from _nearW, the width of the
         nearest road band — and the nearest band changes every time one scrolls past
         (46 times a second flat out), so the kart grew and snapped back by 4.5% on every
         band: the "shaking". The road's half-width at a screen line is exact and fixed
         (flat road: scale = (y-horizon)*2/(camH*Ht)), so size and offset come from that. */
      const hwAt=y=>((y-horizonY)*2/(camH*Ht))*roadW*Wd/2;
      const py=Ht-hwAt(Ht)*KART_W*0.13, hwK=hwAt(py), pw=hwK*KART_W;
      const px=Wd/2 + (playerX-camLag)*hwK;
      _kartPx=px; _kpy=py; _kpw=pw;       // for the feel probe, and where the puffs leave from
      const vfk=v/maxV, rough=offGrass&&v>1?(Math.sin(bumpT*23)*1.1+Math.sin(bumpT*37)*0.6):0;
      kartDraw(cx,px,py,pw,{style:KART,body:opts.tint||null,driver:avImg(heroKart),
        yaw:yawS, roll:-yawS*0.07+Math.max(-1,Math.min(1,push/2.5))*0.03,
        lift:-(Math.sin(bumpT*9)*0.3+Math.sin(bumpT*5.7)*0.2)*vfk+rough,
        wheel:wheelPh, brake:braking&&v>maxV*0.3, boost:boostT>0, t:bumpT, lod:false});
      /* the puffs sit in front of the kart: they are leaving it toward the camera */
      parts.forEach(q=>{ const a=q.a*(q.life/q.max); if(a<=0.01) return;
        cx.globalAlpha=a; cx.drawImage(puffTex(q.col),q.x-q.r*1.6,q.y-q.r*1.6,q.r*3.2,q.r*3.2); });
      cx.globalAlpha=1;
      if(shieldT>0){ cx.strokeStyle='rgba(120,205,255,.85)'; cx.lineWidth=3; cx.beginPath(); cx.ellipse(px,py-pw*0.6,pw*0.66,pw*0.72,0,0,7); cx.stroke();
        cx.fillStyle='rgba(150,215,255,.14)'; cx.fill(); }
      /* SPEED YOU CAN SEE. The HUD read 115 and the picture read parked: nothing on
         screen changed between half throttle and flat out, so there was no reason to
         feel fast and no reason to lift. Two cheap terms, both keyed to v/maxV and both
         silent below ~55% so slow driving stays clean:
           STREAKS rake outward from the vanishing point — the air going past;
           the VIGNETTE tightens, which is what tunnel vision at speed actually feels
           like and costs one gradient.
         Boost rides the same code at full strength rather than being its own effect. */
      const vff=Math.max(0, (v/maxV-0.55)/0.45), spd=boostT>0?1:Math.min(1,vff);
      if(spd>0.02){
        const vx=_lastSeg?_lastSeg.x:Wd/2, vy=horizonY;
        /* CLIPPED TO THE GROUND. Radiating from the vanishing point puts half the rays
           in the sky, where they read as scratches on the lens or contrails over a
           painted landscape — the backdrop is the one part of this scene that was
           already beautiful and the last thing to rake lines across. Air rushing past
           belongs on the ground plane, so that is where they are drawn. */
        cx.save(); cx.beginPath(); cx.rect(0,horizonY+2,Wd,Ht-horizonY); cx.clip();
        cx.globalAlpha=0.30*spd;
        cx.strokeStyle=boostT>0?'rgba(255,245,205,.9)':'rgba(255,255,255,.75)';
        cx.lineWidth=Math.max(1.4,Wd*0.0022);
        /* PERIPHERAL ONLY. Rays drawn all the way round the vanishing point crossed the
           middle of the field as long diagonals — scratches on the grass, not air. Real
           motion is felt at the EDGES of vision, so a streak is kept only if it ends out
           in the outer third, and it is short. Nothing is drawn through the part of the
           screen the player is actually reading. */
        const N=boostT>0?18:14, EDGE=Wd*0.29;
        for(let i=0;i<N;i++){ const a=(i/N)*Math.PI*2+pos*0.00006;
          const r0=Wd*(0.30+0.06*((i*7)%3)), r1=r0+Wd*(0.07+0.13*spd);
          const ex=vx+Math.cos(a)*r1, ey=vy+Math.sin(a)*r1*0.72;
          if(Math.abs(ex-Wd/2)<EDGE || ey<horizonY+4) continue;
          cx.beginPath();
          cx.moveTo(vx+Math.cos(a)*r0, vy+Math.sin(a)*r0*0.72);
          cx.lineTo(ex,ey); cx.stroke(); }
        cx.restore();
        const vg=cx.createRadialGradient(Wd/2,Ht*0.52,Wd*(0.40-0.10*spd), Wd/2,Ht*0.52,Wd*0.78);
        vg.addColorStop(0,'rgba(12,10,26,0)'); vg.addColorStop(1,'rgba(12,10,26,'+(0.30*spd).toFixed(3)+')');
        cx.fillStyle=vg; cx.fillRect(0,0,Wd,Ht);
      }
      /* the near field sits closest to the camera and under the kart's own shadow;
         without this the bottom of the frame is the same flat value as the middle
         distance and the whole ground plane floats */
      const nearG=cx.createLinearGradient(0,Ht*0.72,0,Ht);
      nearG.addColorStop(0,'rgba(24,26,16,0)'); nearG.addColorStop(1,'rgba(24,26,16,.20)');
      cx.fillStyle=nearG; cx.fillRect(0,Ht*0.72,Wd,Ht*0.28);
      if(spinFlashT>0){ cx.save(); cx.globalAlpha=Math.min(0.5,spinFlashT); cx.fillStyle='#2A1E14'; cx.fillRect(0,0,Wd,Ht); cx.restore(); }
      hudT+=0.016; if(hudT>0.15){ hudT=0; updateHud(); }
      if(mode==='count'&&countT>0){ cx.save(); cx.textAlign='center';
        cx.font='800 54px Fraunces,serif'; cx.fillStyle='#fff'; cx.strokeStyle='rgba(20,20,50,.6)'; cx.lineWidth=7;
        const n=Math.ceil(countT*3/1.0); const txt=countT<0.33?'GO!':String(Math.ceil(countT*3));
        cx.strokeText(txt,Wd/2,Ht*0.42); cx.fillText(txt,Wd/2,Ht*0.42); cx.restore(); }
    }
    /* the position marker wears the chosen racer's face, not a generic bee */
    const meMark=(function(){ try{ const s=window.SB_AVATAR&&window.SB_AVATAR(HERO,20); return s?('<span class="sg-pb-av">'+s+'</span>'):'🐝'; }catch(e){ return '🐝'; } })();
    /* position bar: everyone's progress at a glance */
    function updateHud(){
      const ahead=rivals.filter(r=>r.z>pos).length; const place=ahead+1;
      host.querySelector('#sg-pos').innerHTML=['🥇 1st','🥈 2nd','🥉 3rd','4th','5th'][place-1]+' <i>/ '+(CFG.rivals+1)+'</i>';
      host.querySelector('#sg-lap').textContent='Lap '+Math.min(CFG.laps,lap)+'/'+CFG.laps;
      host.querySelector('#sg-spd').textContent='💨 '+Math.round(v/maxV*180);
      const pb=host.querySelector('#sg-pb');
      let dots='<i class="sg-pb-road"></i><b class="sg-pb-flag">'+GP_FLAG()+'</b>';
      rivals.forEach((r,i)=>{ const pct=Math.min(99,r.z/TOTAL*100);
        dots+='<span class="sg-pb-dot" style="left:'+pct.toFixed(1)+'%;top:'+(i%2?72:28)+'%;background:'+r.col+'" title="'+r.name+'">'+r.glyph+'</span>'; });
      dots+='<span class="sg-pb-dot me" style="left:'+Math.min(99,pos/TOTAL*100).toFixed(1)+'%">'+meMark+'</span>';
      pb.innerHTML=dots;
    }

    /* ---- loop ---- */
    let last=0;
    function frame(ts){ if(over) return; const dt=Math.min(0.05,(ts-last)/1000)||0.016; last=ts;
      if(mode==='count' && !paused){ countT-=dt; if(countT<=0){ mode='race'; } }
      if(mode==='race' && !paused) update(dt);
      draw(); requestAnimationFrame(frame); }
    /* Puffs are spawned where the kart was DRAWN (last frame's px/py/pw), so they leave
       from the pipes and the tyres, then drift toward the camera and fade. */
    let _kpy=0, _kpw=0;
    /* a puff is a soft cloud, not a disc: one radial-gradient sprite per colour, built once */
    const _puffTex={};
    function puffTex(col){ if(_puffTex[col]) return _puffTex[col];
      const pc=document.createElement('canvas'); pc.width=pc.height=64; const g2=pc.getContext('2d');
      const rg=g2.createRadialGradient(32,32,0,32,32,32);
      rg.addColorStop(0,'rgba('+col+',1)'); rg.addColorStop(0.45,'rgba('+col+',.7)'); rg.addColorStop(1,'rgba('+col+',0)');
      g2.fillStyle=rg; g2.fillRect(0,0,64,64); return (_puffTex[col]=pc); }
    function puff(x,y,vx,vy,r,gr,life,col,a){ if(parts.length<110) parts.push({x,y,vx,vy,r,gr,life,max:life,col,a}); }
    function kartFx(dt){
      for(let i=parts.length-1;i>=0;i--){ const q=parts[i]; q.life-=dt; if(q.life<=0){ parts.splice(i,1); continue; }
        q.x+=q.vx*dt; q.y+=q.vy*dt; q.r+=q.gr*dt; q.vx*=0.97; }
      if(!_kpw) return; const vf=v/maxV, P=_kpw, X=_kartPx, Y=_kpy;
      const rate=(r)=>Math.random()<r*dt;
      if(vf>0.05 && rate(boostT>0?34:10+vf*8)) [-0.08,0.08].forEach(k=>puff(X+k*P,Y-0.11*P,(Math.random()-0.5)*P*0.3,P*(0.5+Math.random()*0.4),P*0.04,P*0.16,0.45,boostT>0?'255,190,120':'225,225,232',boostT>0?0.4:0.28));
      const onVerge=Math.abs(playerX)>0.9;
      if(vf>0.08 && onVerge && rate(34)) [-1,1].forEach(k=>puff(X+k*0.37*P,Y-0.03*P,k*P*(0.3+Math.random()*0.5),P*(0.7+Math.random()*0.6),P*0.06,P*0.34,0.6,DUST,0.5));
      if(braking && vf>0.45 && rate(26)) [-1,1].forEach(k=>puff(X+k*0.37*P,Y-0.02*P,k*P*0.2,P*(0.6+Math.random()*0.4),P*0.05,P*0.28,0.5,'245,245,248',0.45));
    }
    function update(dt){
      boostT=Math.max(0,boostT-dt); if(boostT===0) boostMul=1; shieldT=Math.max(0,shieldT-dt); spinFlashT=Math.max(0,spinFlashT-dt);
      const seg=segs[Math.min(segs.length-1,Math.floor(pos/segLen))];
      /* Steering was halved in an earlier tuning pass to stop a tap leaping across the
         road. It overshot: at 1.1 a full crossing took 1.8 SECONDS of holding, which is
         what "it's just self-driving, it's not gonna let me swerve" describes. Back to
         2.2 — the road crosses in 0.9s, a tap still nudges, and the kart answers. */
      const dxs=dt*2.2*Math.max(0.42,v/maxV);
      playerX+=steer*dxs;
      /* THE ROAD PUSHES YOU OUT — WHILE IT BENDS, AND ONLY THEN.
         For a while the push had MEMORY: a bend built up a sideways slide that outlived it,
         with a 2.4s half-life. Measured in the simulator: an unsteered kart moved 0.17
         road-half-widths a second ON STRAIGHTS, a kart parked in the grass kept being shoved
         sideways, and a counter-steer at a standstill lost to the stored slide for most of a
         second. Play-tested in one line: "the car is veering in all random directions". It
         was — the push you felt belonged to a bend you had already left.
         So the push has no memory. It is the bend under the kart NOW, times speed squared,
         times PULL. What that model has to prove is that it is not self-driving — the reason
         memoryless was dropped the first time is that a weak push pendulums across
         alternating bends and never leaves the road. PULL is set so it cannot: hands-off,
         every difficulty is in the grass by the first sector. SQUARED is what makes the brake
         the answer to a corner (lifting to 80% cuts the push by a third), and what makes a
         kart that has stopped in the grass steerable straight back out.
         Against a child who reacts 300ms late and steers back only once clearly drifting,
         grass time fell 9.6→5.9% on easy, 13.5→6.4% medium, 16.7→7.7% hard, 20.4→11% champ. */
      const vf=v/maxV;
      push=(seg.curve||0)*vf*vf*PULL;
      playerX-=push*dt;
      playerX=Math.max(-1.2,Math.min(1.2,playerX));
      /* the kart's LOOK: nose into the steer (not a card tilting), treads rolling with the
         road, springs working harder the faster you go and hard on the grass */
      yawS += (steer*0.85 - yawS)*(1-Math.pow(0.5,dt/0.09));
      wheelPh = (wheelPh + (v/maxV)*dt*5.5)%1; bumpT+=dt;
      kartFx(dt);
      camLag += ((playerX*CAM_FOLLOW)-camLag)*(1-Math.pow(0.5, dt/CAM_HALF));
      const offRoad=(playerX<-0.95||playerX>0.95);
      if(offRoad){
        // the grass rolls the kart to a FULL STOP — no throttle off the tarmac; steering
        // still works at a standstill, so you steer back on and pull away again
        v=Math.max(0, v-(maxV/0.9)*dt);
        if(!offGrass){ offGrass=true; spinFlashT=Math.max(spinFlashT,0.3); try{flash('🌿 Off the track — steer back on!');}catch(_){} }
      } else if(braking){
        offGrass=false;
        /* a real lift, not a tap: down to ~46% in about a second, which is what a
           curve-5 bend wants. It never stops the kart — a brake that could park you
           on the racing line would be a way to hide from the race. */
        v=Math.max(maxV*0.34, v-(maxV/1.05)*dt);
      } else {
        offGrass=false;
        v=Math.min(maxV*boostMul, v+accel*dt);   // tarmac: accelerate up to top speed
      }
      const pm=pos%trackLen;
      // tol ≈ half a kart-width in lane units — so a hit needs a real overlap, matching what you see
      const CATCH=0.34;
      if(shieldT<=0){ hazards.forEach(h=>{ if(h.hit) return; const hz2=h.seg*segLen; let d=Math.abs(pm-hz2); d=Math.min(d,trackLen-d);
        if(d<segLen*0.9 && Math.abs(playerX-h.off)<CATCH && v>maxV*0.25){ h.hit=true; setTimeout(()=>{h.hit=false;},1400);
          if(h.kind==='cop'){ v*=0.5; spinFlashT=0.5; try{flash('🚓 Pulled over — the cops!');}catch(_){} }
          else { v*=0.55; spinFlashT=0.5; try{flash('🛢️ Slipped on oil!');}catch(_){} } } }); }
      /* THE BOX IS SWEPT, NOT SAMPLED. This used to ask "is the box inside a 1.6-segment
         window THIS frame?", which is a point test against a fixed window and therefore
         frame-rate dependent: at 60fps the kart covers 0.77 of a segment per frame and you
         get two chances, but a 100ms hitch — measured, they happen — carries it 4.6
         segments and straight past the window with no chance at all. That is the reported
         "the box didn't trigger", and it is the same bug as the reported lag.
         Now it asks "did we CROSS the box between the last frame and this one?", which is
         true however long the frame took. */
      const _prevPm=pm;
      pos+=v*dt;
      const _pm2=pos%trackLen;
      const _wrapped=_pm2<_prevPm;                    // crossed the start/finish this frame
      items.forEach(it=>{ if(it.gone) return; const iz=it.seg*segLen;
        const crossed=_wrapped ? (iz>_prevPm || iz<=_pm2) : (iz>_prevPm && iz<=_pm2);
        if(crossed && Math.abs(playerX-it.off)<CATCH){ it.gone=true; spellGate(); } });
      const nl=1+Math.floor(pos/trackLen);
      if(nl>lap&&nl<=CFG.laps){ lap=nl; items.forEach(it=>it.gone=false); try{flash('🏁 Lap '+lap+' of '+CFG.laps+'!');}catch(_){ } }
      if(pos>=TOTAL){ over=true; return finish(); }
      rivals.forEach(r=>{ r.spin=Math.max(0,r.spin-dt); r.slow=Math.max(0,r.slow-dt);
        let rs=r.spd; if(r.spin>0) rs*=0.28; else if(r.slow>0) rs*=0.55;
        const gap=pos-r.z; rs+= gap>segLen*12?maxV*0.07: gap<-segLen*12?-maxV*0.06:0;
        r.z+=Math.max(0,rs)*dt; if(r.z>=TOTAL) r.fin=true;
        r.x+= (Math.sin((r.z+r.name.length*99)/1400)*0.6 - r.x)*dt*0.6; });
    }
    /* A race that ends by calling done() hands the child straight back to the app's
       generic text card — no placing, no words, nothing to read. The finish IS the
       race, and this one did not have one. */
    function finish(){ unbind();
      const place=1+rivals.filter(r=>r.fin).length;
      const win=place===1, score=(6-place)*250+Math.round(pos/segLen);
      const stars=place===1?3:place===2?2:place===3?1:0;
      const ORD=['','1st','2nd','3rd','4th','5th','6th'];
      const el=host.querySelector('#sg-card'); if(!el){ done({win,score,stars}); return; }
      el.innerHTML=SGUI.result({ win, stars, score, scoreLabel:'points', words:gpRound,
        title: (ORD[place]||(place+'th'))+' across the line' });
      el.style.display='grid'; SGUI.bind(el);
      el.querySelector('#sg-again').onclick=()=>{ el.style.display='none'; el.innerHTML=''; beeGrandPrix(host,opts,done); };
      el.querySelector('#sg-cont').onclick=()=>{ el.style.display='none'; el.innerHTML=''; done({win,score,stars}); }; }

    /* ---- how to play ---- */
    host.style.position='relative';
    const intro=document.createElement('div'); intro.className='sg-howto';
    intro.innerHTML='<div class="sg-howto-card">'+
      '<div class="sg-howto-h">Bee Grand Prix</div>'+
      '<div class="sg-howto-sub">One epic race to the finish against the Unspelling’s crew — the Smudge, Glitch and Vex are on the grid!</div>'+
      '<ol class="sg-howto-steps">'+
      '<li><b>Steer</b> with the two round buttons, or the <b>arrow keys</b> — dodge the oil slicks and the cops.</li>'+
      '<li><b>The ⊗ button is the brake</b> (or <b>↓</b>). Flat out the big bends will throw you into the grass — lift for those, and you keep the road.</li>'+
      '<li>Drive into a <b>? box</b> — the race pauses while you <b>spell the word</b>.</li>'+
      '<li>Spelling it right <b>unlocks a power-up</b> into your slot — tap the slot (or Space) to fire it when you need it!</li>'+
      '<li>Watch the <b>track bar up top</b> to see where every racer is. First to the flag wins ⭐⭐⭐.</li>'+
      '</ol>'+
      '<button class="sg-rbtn go sg-howto-go" id="sg-howgo">To the grid! →</button></div>';
    host.appendChild(intro);
    intro.querySelector('#sg-howgo').onclick=()=>{ intro.remove(); countT=1.0; mode='count'; };
    /* launched from the start menu, which already explained the race — and a race that
       waited for the phone to turn has no click left to skip this with */
    if(opts.autoGo){ intro.remove(); countT=1.0; mode='count'; }
    renderHold();
    if(window.SB_DEBUG) window._race={ state:()=>({pos,TOTAL,trackLen,lap,mode,held:held&&held.id,place:1+rivals.filter(r=>r.z>pos).length,v,over,paused,land:LAND,size:[Wd,Ht],rivScr:rivals.map(r=>r._sy==null?null:[r._sx,r._sy,r.z]),x:playerX,push,drift:push,steer,camLag,yaw:yawS,puffs:parts.length,kart:{x:_kartPx,y:_kpy,w:_kpw},join:_join&&{x:_join.x,y:_join.y,w:_join.w},dpr,screenX:_kartPx,mid:Wd/2,braking,vf:v/maxV,
      curveAhead:(function(){ const i=Math.floor(pos/segLen); let c=0;
        for(let k=6;k<26;k++){ const g=segs[(i+k)%segs.length]; if(g) c+=g.curve||0; } return +(c/20).toFixed(2); })()}),
      /* the size of everything, in road half-widths — what tests/gp-scale.cjs audits */
      scale:()=>{ const tr=sgTex('tree'), kinds={};
        ZONES.list.forEach(nm=>{ const z=ZONES.z[nm]; (z.props||[]).concat(z.lamps?[{k:'lamp',off:[1.62,1.62]}]:[]).forEach(r=>{
          let w,h,f; if(r.k==='tree'||r.k==='parktree'){ const s0=r.k==='tree'?1.1:0.78; w=s0*1.2; h=tr?s0*(tr.height/tr.width):null; f=0.15; }
          else { let bw=0,bh=0,ft=0, hmin=1e9; for(let v=0;v<GP_VAR[r.k];v++){ const b=GPS.box(r.k,v,WORLD); bw=Math.max(bw,b.bw); bh=Math.max(bh,b.bh); hmin=Math.min(hmin,b.bh); ft=Math.max(ft,b.foot); } w=bw; h=[hmin,bh]; f=ft; }
          const k=kinds[r.k]||(kinds[r.k]={w,h,foot:f,offMin:9,zones:[]}); k.offMin=Math.min(k.offMin,r.off[0]); k.zones.push(nm); }); });
        const counts={}; ZONES.list.forEach(nm=>counts[nm]={bands:0,dense:!!ZONES.z[nm].dense,kinds:{}});
        segs.forEach(sg=>{ const c2=counts[sg.zone]; c2.bands++; sg.sprites.forEach(sp=>{ if(sp.kind==='prop') c2.kinds[sp.p]=(c2.kinds[sp.p]||0)+1; }); });
        /* the closest any PLACED prop's footprint comes to the road's centre line */
        let clear={d:9,kind:null}; segs.forEach(sg=>sg.sprites.forEach(sp=>{ if(sp.kind!=='prop') return;
          const ft=(sp.p==='tree'||sp.p==='parktree')?0.15:sp.p==='lamp'?0.2:GPS.box(sp.p,sp.v,WORLD).foot, d=Math.abs(sp.off)-ft;
          if(d<clear.d) clear={d,kind:sp.p}; }));
        return { world:WORLD, zones:ZONES.list.slice(), cycle:zoneCycle.slice(), runs:runs.map(r=>r.name), kinds, counts, clear,
                 kartW:KART_W, kartH:KART_W*1.15, rivalW:KART_W, copW:COP_W, oilW:OIL_W, boxW:BOX_W, postH:POST_H, catchR:0.34, verge:1.42 }; },
      pace:(i,dz,x)=>{ const r=rivals[i]; if(r){ r.z=pos+dz; if(x!=null) r.x=x; } },
      rivZ:()=>rivals.map(r=>Math.round(r.z)),
      toZone:(nm,into)=>{ const r=runs.find(q=>q.name===nm); if(!r) return false; pos=(r.a+(into==null?Math.min(30,(r.b-r.a)>>2):into))*segLen; return true; },
      steerTo:(x)=>{playerX=x; camLag=x*CAM_FOLLOW;}, jump:(z)=>{pos=z;}, grant:(i)=>{held=POWERS[i||0];renderHold();},
      setV:(f)=>{v=maxV*f;}, curveHere:()=>(segs[Math.floor((pos%trackLen)/segLen)]||{}).curve||0,
      /* handling probes: park the kart at the start of a long straight, or just inside the
         held part of a tight bend — first-lap positions, measured from the track itself */
      toStraight:(minLen)=>{ minLen=minLen||90; let run=0; for(let i=0;i<segs.length;i++){ run=(segs[i].curve===0)?run+1:0;
          if(run>=minLen){ pos=(i-minLen+1)*segLen; return true; } } return false; },
      /* the end of a tight bend that runs out onto a long straight — where a slide with
         memory shows itself: the push you feel belongs to a bend you have already left */
      toBendExit:(minC,minRun)=>{ minC=minC||3; minRun=minRun||55;
        for(let k=41;k<segs.length;k++){ if(segs[k].curve!==0||segs[k-1].curve===0) continue;
          let run=0; while(k+run<segs.length&&segs[k+run].curve===0) run++;
          let peak=0; for(let q=k-40;q<k;q++) peak=Math.max(peak,Math.abs(segs[q].curve));
          if(run>=minRun&&peak>=minC){ pos=(k-14)*segLen; return Math.sign(segs[k-14].curve)||Math.sign(segs[k-20].curve); } } return 0; },
      toBend:(minC)=>{ minC=minC||3; for(let i=40;i<segs.length;i++){ if(Math.abs(segs[i].curve)>=minC && Math.abs(segs[i-1].curve)<minC){ pos=i*segLen; return segs[i].curve; } } return 0; },
      toBox:()=>{ const pm=pos%trackLen, it=items.find(x=>!x.gone&&x.seg*segLen>pm+segLen*10);   // capture tooling: line up the next ? box
        if(it){ pos+= (it.seg-8)*segLen - pm; playerX=it.off; } },
      toHaz:(kind)=>{ const pm=pos%trackLen, h=hazards.find(x=>!x.hit&&(!kind||x.kind===kind)&&x.seg*segLen>pm+segLen*12);   // capture tooling: line up the next hazard
        if(h){ pos+= (h.seg-9)*segLen - pm; playerX=h.off; } },
      clearBoxes:()=>{ items.forEach(i=>i.gone=true); },                 // capture tooling: no unplanned spell gates
      gateNow:()=>{ const pm=pos%trackLen, it=items.find(x=>x.seg*segLen>pm+segLen*14);   // capture tooling: summon ONE gate ahead
        if(it){ it.gone=false; pos+= (it.seg-8)*segLen - pm; playerX=it.off; } } };
    requestAnimationFrame(frame);
    return { destroy(){ over=true; unbind(); } };
  }

  function whackAMoth(host, opts, done){
    const diff=opts.diff||'medium';
    const CFG=calmCFG({easy:{words:6,up:1500,time:90},medium:{words:8,up:1200,time:90},hard:{words:9,up:950,time:85},champ:{words:10,up:800,time:80}}[diff]);
    const words=pool(CFG.words+2).filter(w=>w.w.length<=9); let wi=0, cur=null, li=0, t=CFG.time, doneWords=0, over=false;
    const wmRound=[]; let wmClean=true;    // the round's words, and whether this one was swatted clean
    const art=(window.SGART&&SGART.ready());
    const mothArt=art?SGART.sprite('grey-moth',{cls:'sg-mothimg'}):'🦋';
    const plate=art?SGART.plateForWorld(opts.world||'Hive'):'';
    host.innerHTML='<div class="sg-hud"><span id="sg-w">Word 1/'+CFG.words+'</span><span id="sg-time"></span></div>'+
      '<div class="sg-target" id="sg-target"></div><div id="sg-wmean" class="sg-cardmean"></div><div class="sg-mothstage"><div class="sg-moth-bg">'+plate+'</div><div class="sg-molegrid" id="sg-grid"></div></div>'+
      '<div id="sg-card"></div>';   // this engine had nowhere to draw a result screen
    const grid=host.querySelector('#sg-grid');
    for(let i=0;i<12;i++){ const c=document.createElement('button'); c.className='sg-cell'; c.dataset.i=i; grid.appendChild(c); }
    function newWord(){ if(wi>=words.length||doneWords>=CFG.words){ over=true; finish(true); return; }
      cur=words[wi++]; li=0; wmClean=true; renderTarget();
      const mn=host.querySelector('#sg-wmean'); if(mn){ const m=meaningText(cur); mn.textContent=m?('💡 '+m):''; }
      try{ say(cur.w); }catch(e){} }
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
      if(ch===cur.w[li]){ li++; if(li>=cur.w.length){ wmRound.push({w:cur.w,ok:wmClean}); doneWords++; try{flash('✓ '+cur.w.toUpperCase());}catch(_){} newWord(); } else renderTarget(); }
      else { wmClean=false; t-=3; try{flash('Wrong moth! −3s');}catch(_){} } };
    const popT=setInterval(pop, 520);
    const tick=setInterval(()=>{ if(over){ clearInterval(tick); clearInterval(popT); return; } t--;
      host.querySelector('#sg-time').textContent='⏱ '+t+'s';
      if(t<=0){ over=true; clearInterval(tick); clearInterval(popT); finish(doneWords>=CFG.words); } },1000);
    newWord();
    /* No result screen at all: the round ended and the child was handed back to the
       app's generic text card, with no list of what they had just spelled. */
    function finish(win){ const score=doneWords*100+t*2, stars=win?(t>25?3:t>10?2:1):0;
      const el=host.querySelector('#sg-card'); if(!el){ done({win,score,stars}); return; }
      el.innerHTML=SGUI.result({ win, stars, score, scoreLabel:'points', words:wmRound,
        title: win?'Every moth swatted':'Out of time' });
      el.style.display='grid'; SGUI.bind(el);
      el.querySelector('#sg-again').onclick=()=>{ el.style.display='none'; el.innerHTML=''; whackAMoth(host,opts,done); };
      el.querySelector('#sg-cont').onclick=()=>{ el.style.display='none'; el.innerHTML=''; done({win,score,stars}); }; }
    return { destroy(){ over=true; clearInterval(popT); clearInterval(tick); } };
  }


  /* ---------- ENGINE F · SPELL-SHIELD (boss duel vs The Smudge) ---------- */
  function spellShield(host, opts, done){
    const diff=opts.diff||'medium';
    /* The per-word clock IS this game's word rate: a child who never answers gets
       one word every t seconds and no more. At t=12 that is 5 a minute, under the
       6/min floor — and the floor exists precisely for the child who is stuck.
       Shortened so the worst case still clears it with headroom. */
    const CFG=calmCFG({easy:{hexes:6,t:10},medium:{hexes:8,t:9},hard:{hexes:9,t:8},champ:{hexes:10,t:7}}[diff]);
    const words=pool(CFG.hexes+6).filter(w=>w.w.length>=4&&w.w.length<=10);
    let phase=1, hexes=0, broken=0, wi=0, over=false, cur=null, timer=null, started=false;
    let combo=0, best=0, tLeft=0;
    const round=[];                       // what the child actually spelled, for the result screen
    const art=(window.SGART&&SGART.ready());
    const foe=opts.foe||'smudge-swarm';
    const plate=art?SGART.plateForWorld(opts.world||'Hive Gates'):'';
    /* The boss used to fall back to the literal string '🦋🦋🦋<br>🦋🦋🦋🦋'. Seven
       butterfly emoji, rendered as a different picture on every platform, standing in
       for the antagonist of the game. A drawn swarm costs nothing and is the same
       swarm everywhere. */
    const bossArt=art?SGART.sprite(foe,{cls:'sg-bossimg'}):SS_SWARM();
    host.innerHTML='<div class="sg-boss"><div class="sg-boss-bg">'+plate+'</div>'+
      '<div class="sg-ss-hud"><span class="sg-ss-phase" id="sg-ssph">The wall</span>'+
      '<span class="sg-ss-combo" id="sg-sscb"></span></div>'+
      '<div class="sg-bossface" id="sg-bf">'+bossArt+'</div>'+
      '<div class="sg-shieldwall" id="sg-sw"></div>'+
      '<div class="sg-duel"><div class="sg-ss-timer" id="sg-dt"></div>'+
      '<div id="sg-scramble" class="sg-scramble"></div>'+
      '<div id="sg-dmean" class="sg-cardmean"></div>'+
      '<div class="sg-inrow"><input id="sg-di" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="type the word">'+
      '<button class="sg-rbtn go" id="sg-dgo">Cast</button></div>'+
      '</div></div><div id="sg-card"></div>';
    const sw=host.querySelector('#sg-sw');
    /* A shield is a drawn hexagon, not the ⬡ glyph. The glyph cannot hold a colour
       ramp, cannot crack, and lands at a different weight in every font. */
    function wall(){ sw.innerHTML=Array.from({length:CFG.hexes},(_,i)=>
      '<svg class="sg-hexs'+(i<hexes?' up':'')+'" viewBox="0 0 32 36" width="30" height="34" aria-hidden="true">'+
      '<path d="M16 1.5l12.6 7.3v14.4L16 34.5 3.4 27.2V8.8z" fill="'+(i<hexes?'#F0B429':'none')+'" '+
      'fill-opacity="'+(i<hexes?'.92':'0')+'" stroke="'+(i<hexes?'#8A5B00':'currentColor')+'" stroke-width="2" '+
      'stroke-linejoin="round" opacity="'+(i<hexes?1:.3)+'"/>'+
      (i<hexes?'<path d="M16 6l8 4.6v9.2L16 24.4 8 19.8v-9.2z" fill="#FFD874" fill-opacity=".55"/>':'')+
      '</svg>').join('');
      sw.setAttribute('aria-label', hexes+' of '+CFG.hexes+' shields forged'); }
    function scramble(w){ const a=w.split(''); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
      const s2=a.join(''); return s2===w?scramble(w):s2; }
    function paintTimer(){ const el=host.querySelector('#sg-dt');
      if(el) el.innerHTML=SGUI.ring(tLeft/CFG.t, tLeft); }
    function paintCombo(){ const el=host.querySelector('#sg-sscb');
      if(el) el.textContent = combo>=2 ? (combo+' in a row') : ''; }
    function shakeBoss(){ const bf=host.querySelector('#sg-bf'); if(!bf) return;
      bf.classList.remove('hurt'); void bf.offsetWidth; bf.classList.add('hurt'); }
    function next(){
      if(over) return;
      if(phase===1 && hexes>=CFG.hexes){ phase=2; host.querySelector('#sg-bf').classList.add('dive');
        const ph=host.querySelector('#sg-ssph'); if(ph) ph.textContent='By ear alone — 3 to win';
        try{flash('The Smudge dives! Three words by ear alone.');}catch(_){} }
      cur=words[wi++]; if(!cur){ finish(true); return; }
      tLeft=CFG.t;
      const sc=host.querySelector('#sg-scramble');
      if(phase===1){ sc.textContent=scramble(cur.w.toLowerCase()); sc.classList.remove('byear'); }
      else { sc.textContent='listen'; sc.classList.add('byear'); }
      const mn=host.querySelector('#sg-dmean'); if(mn){ const m=meaningText(cur); mn.textContent=m?m:''; }
      try{ say(cur.w); }catch(e){}
      paintTimer();
      clearInterval(timer);
      timer=setInterval(()=>{ if(over){ clearInterval(timer); return; } tLeft--; paintTimer();
        if(tLeft<=0){ clearInterval(timer); hit(); } },1000);
    }
    /* `logIt` false when cast() has already recorded the miss — otherwise every wrong
       answer lands in the round twice and the result screen reads "3 of 11 spelled"
       over a list with each miss printed side by side with itself. */
    function hit(logIt){ if(logIt!==false && cur) round.push({w:cur.w,ok:false});
      combo=0; paintCombo(); shakeBoss();
      if(phase===1&&hexes>0){ hexes--; wall(); } broken++;
      try{flash('A shield hex shatters.');}catch(_){}
      if(broken>=4){ finish(false); return; }
      next(); }
    function finish(win){ if(over) return; over=true; clearInterval(timer);
      const stars = win ? (broken===0?3:broken<=2?2:1) : 0;
      const score = hexes*100 + (phase===2?300:0) + best*25;
      const el=host.querySelector('#sg-card'); if(!el){ done({win,score,stars}); return; }
      el.innerHTML=SGUI.result({ win, stars, score, scoreLabel:'points', words:round,
        title: win ? (phase===2?'The Smudge is driven off':'The wall holds') : 'The wall is breached' });
      el.style.display='grid'; SGUI.bind(el);
      el.querySelector('#sg-again').onclick=()=>{ el.style.display='none'; el.innerHTML=''; spellShield(host,opts,done); };
      el.querySelector('#sg-cont').onclick=()=>{ el.style.display='none'; el.innerHTML=''; done({win,score,stars}); }; }
    const inp=host.querySelector('#sg-di');
    let p2right=0;
    function cast(){ if(over||!started) return;
      const ok=sameSpelling(inp.value,cur.w); wlog(cur,ok); round.push({w:cur.w,ok});
      inp.value=''; try{inp.focus();}catch(e){}
      clearInterval(timer);
      if(ok){ combo++; best=Math.max(best,combo); paintCombo();
        if(phase===1){ hexes++; wall(); try{flash('Shield hex forged'+(combo>=3?(' — '+combo+' in a row!'):''));}catch(_){} }
        else { p2right++; try{flash('The Quill fires! '+p2right+'/3');}catch(_){}
          if(p2right>=3){ finish(true); return; } } }
      else { hit(false); return; }
      if(!over) next(); }
    inp.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); cast(); } };
    host.querySelector('#sg-dgo').onclick=cast;
    /* A start card, which this game never had — it used to drop a child straight into
       a boss fight with no idea what the hexagons were for. */
    function howto(){ const el=host.querySelector('#sg-card');
      el.innerHTML=SGUI.howto({ title:'Spell Shield', art:SS_SWARM(74),
        sub:'The Smudge is at the Hive Gates. Spell to raise the wall before it breaks through.',
        steps:[ 'Unscramble the word and type it — every correct spelling forges one shield hex',
                'Forge all '+CFG.hexes+' and the Smudge dives: three more words, by ear alone',
                'Four misses and the wall is breached — the clock is '+CFG.t+' seconds a word' ],
        go:'Raise the wall' });
      el.style.display='grid';
      el.querySelector('#sg-howgo').onclick=()=>{ el.style.display='none'; el.innerHTML='';
        started=true; try{inp.focus();}catch(e){} wall(); next(); }; }
    wall(); paintCombo(); howto();
    return { destroy(){ over=true; clearInterval(timer); } };
  }
  /* The swarm, drawn: three ranks of moths closing on the gate. Used as the boss
     fallback and as the start card's art, so both say the same thing. */
  function SS_SWARM(size){ size=size||96;
    const m=(x,y,sc,o)=>'<g transform="translate('+x+','+y+') scale('+sc+')" opacity="'+o+'">'+
      '<ellipse cx="0" cy="0" rx="3.1" ry="5.2" fill="#4A4270"/>'+
      '<path d="M-1.6-2.4C-9-8-13 0-7.4 3.4-3.6 5.6-1.6 2.6-1.6-.6z" fill="#8A83A8"/>'+
      '<path d="M1.6-2.4C9-8 13 0 7.4 3.4 3.6 5.6 1.6 2.6 1.6-.6z" fill="#8A83A8"/>'+
      '<path d="M-1-5.4l-2.4-3M1-5.4l2.4-3" stroke="#4A4270" stroke-width="1" stroke-linecap="round"/></g>';
    return '<svg viewBox="0 0 120 80" width="'+size+'" height="'+(size*0.67)+'" aria-label="the Smudge swarm">'+
      m(24,22,1.5,.55)+m(58,16,1.7,.7)+m(94,24,1.4,.5)+
      m(16,50,1.8,.85)+m(46,44,2.2,1)+m(78,50,1.9,.9)+m(106,46,1.5,.6)+
      '</svg>'; }

  /* ---------- ENGINE I · WORD SNAKE (steer Bizzy to spell in order) ---------- */
  function wordSnake(host, opts, done){
    const COLS=15, ROWS=11, CELL=Math.max(28,Math.min(58, Math.floor(Math.min(innerWidth-20,1120)/COLS), Math.floor((innerHeight-310)/ROWS)));
    const world=opts.world||'meadow', diff=opts.diff||'medium';
    const CFG=calmCFG({easy:{words:3,tick:210},medium:{words:4,tick:185},hard:{words:5,tick:160},champ:{words:6,tick:140}}[diff]);
    const feed=wordFeed(CFG.words+8,w=>w&&w.w&&/^[a-z]+$/i.test(w.w)&&w.w.length>=3&&w.w.length<=8);
    host.innerHTML='<div class="sg-hud"><span id="sg-score">0</span><span id="sg-word"></span><span id="sg-lives"></span></div>'+
      '<canvas id="sg-cv"></canvas>'+
      '<div class="sg-dpad" id="sg-dpad"><button class="sg-dbtn" data-d="up" aria-label="Up">▲</button>'+
      '<div class="sg-dmid"><button class="sg-dbtn" data-d="left" aria-label="Left">◀</button>'+
      '<button class="sg-dbtn" data-d="down" aria-label="Down">▼</button>'+
      '<button class="sg-dbtn" data-d="right" aria-label="Right">▶</button></div></div><div id="sg-card"></div>';
    const cv=host.querySelector('#sg-cv'); const BW=COLS*CELL, BH=ROWS*CELL;
    const dpr=Math.min(2.5,window.devicePixelRatio||1);
    cv.width=Math.round(BW*dpr); cv.height=Math.round(BH*dpr);
    cv.style.width=BW+'px'; cv.style.height=BH+'px';
    const cx=cv.getContext('2d'); cx.setTransform(dpr,0,0,dpr,0,0);
    let snake,dir,ndir,word='',spelled=0,tiles=[],wordsDone=0,score=0,lives=3,over=false,bonk=0,tick=CFG.tick,loop=null,fx=[],tongueT=0,streak=0,cleanWord=true;
    const snRound=[];                      // the round's words, for the result screen
    /* the snake game IS a snake — coloured to the worn Serpent-pack avatar, else garden green */
    const SERP_PAL={noodle:['#5FBE5A','#86D97F','#D6F0B8','#2C6E2C'],sunny:['#E9963C','#FFC07A','#FFDFB0','#9A5410'],
      cobra:['#3E8D5C','#69B984','#DDF0BE','#1F5A38'],python:['#9A824C','#C2A972','#E9DBB4','#5A4620'],
      rattler:['#B99154','#DDBA80','#EEDCB0','#6E4E24'],viper:['#6E9A3E','#97C066','#DCEAB0','#3E5A20'],
      boa:['#8A6AB8','#B39AD8','#E6D9F0','#4A3072'],mamba:['#4A4A58','#6E6E80','#B8B8C4','#22222E'],
      seasnake:['#2E9FB8','#5CC4D8','#BEEAF0','#14607A'],naga:['#C9A227','#F0D064','#F5E7B0','#7A5A10']};
    const wornSkin=(function(){ const a=opts.hero||((typeof heroAv==='function')&&heroAv()); return SERP_PAL[a]||(a==='titanoboa'?['#4E7F41','#74AC60','#DCEBC8','#2C4A24']:a==='vasuki'?['#63499E','#9179CE','#E6D9F5','#3A2560']:null); })();
    // evolution ladder: the snake grows from a garden snake up to VASUKI as words are spelled
    const EVO_PAL=[['#5FBE5A','#86D97F','#D6F0B8','#2C6E2C'],['#3E8D5C','#69B984','#DDF0BE','#1F5A38'],
      ['#9A824C','#C2A972','#E9DBB4','#5A4620'],['#2E9FB8','#5CC4D8','#BEEAF0','#14607A'],
      ['#C9A227','#F0D064','#F5E7B0','#7A5A10'],['#63499E','#9179CE','#E6D9F5','#3A2560']];
    const tintPal=(opts.tint&&!wornSkin)?tintPalette(opts.tint):null;   // player's chosen colour
    let PAL=wornSkin||tintPal||EVO_PAL[0], evo=null, snakeStage=0, unlocked=false;
    function occupied(x,y,extra){ for(let i=0;i<snake.length;i++) if(snake[i].x===x&&snake[i].y===y) return true;
      for(let i=0;i<(extra||[]).length;i++) if(extra[i].x===x&&extra[i].y===y) return true; return false; }
    function layoutWord(){ word=feed.next().w; spelled=0; tiles=[];
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
    const shake=SGFX.shake(), motes=SGFX.motes(22,BW,BH);
    function spawnSplash(txt){ const cw=COLS*CELL, ch=ROWS*CELL;
      SGFX.spark(fx,cw/2,ch/2,22,['#F0B429','#FF7FB0','#8FA0F5','#4FC98A'],{speed:3.8,up:1});
      SGFX.ring(fx,cw/2,ch/2,'255,209,63',{grow:7});
      if(txt) SGFX.say(fx,cw/2,ch/2-4,txt,'#1F8A52'); shake.hit(5); }
    function loseLife(){ lives--; setHud(); shake.hit(12);
      try{ const h=snake[0]; SGFX.spark(fx,h.x*CELL+CELL/2,h.y*CELL+CELL/2,16,['#E0553C','#FF9C7A','#FFD24D'],{speed:4.2}); }catch(e){}
      if(lives<=0){ finish(false); return; }
      bonk=3; const cxm=Math.floor(COLS/2), cym=Math.floor(ROWS/2); snake=[{x:cxm,y:cym},{x:cxm-1,y:cym},{x:cxm-2,y:cym}]; dir={x:1,y:0}; ndir={x:1,y:0}; }
    function step(){ if(over) return; dir=ndir; const h=snake[0], nx=(h.x+dir.x+COLS)%COLS, ny=(h.y+dir.y+ROWS)%ROWS;
      for(let i=0;i<snake.length-1;i++) if(snake[i].x===nx&&snake[i].y===ny){ loseLife(); return; }
      snake.unshift({x:nx,y:ny}); let grew=false;
      for(let t=0;t<tiles.length;t++){ if(tiles[t].x===nx&&tiles[t].y===ny){
        if(tiles[t].idx===spelled){ spelled++; score+=15; grew=true;
          SGFX.spark(fx,tiles[t].x*CELL+CELL/2,tiles[t].y*CELL+CELL/2,9,['#FFE9A8','#F0B429','#FFFFFF'],{speed:2.6,decay:0.05,rx:2.6,ry:3.4});
          SGFX.ring(fx,tiles[t].x*CELL+CELL/2,tiles[t].y*CELL+CELL/2,'255,233,168',{grow:5,decay:0.06,lw:3});
          tiles.splice(t,1);
          if(spelled>=word.length){ snRound.push({w:word,ok:cleanWord}); wordsDone++; score+=40;
            // streak: a whole word eaten in order without a wrong bite pays a rising bonus
            if(cleanWord){ streak++; if(streak>=2) score+=streak*12; } else streak=0; cleanWord=true;
            spawnSplash((streak>=2?('🔥 '+streak+'× '):'✓ ')+word.toUpperCase());
            try{ if(typeof addCoins==='function') addCoins(10); }catch(e){}
            // EVOLVE: grow the snake through the forms up to Vasuki (the achievable endpoint)
            const ns=Math.min(5, Math.round(wordsDone/CFG.words*5));
            if(ns!==snakeStage){ snakeStage=ns; if(!wornSkin) PAL=EVO_PAL[ns]; if(evo) evo.set(ns, ()=>onVasuki(), 5); }
            if(tick>110) tick-=8; layoutWord(); } else renderWord(); }
        else { bonk=2; shake.hit(6); cleanWord=false; streak=0;
          SGFX.spark(fx,nx*CELL+CELL/2,ny*CELL+CELL/2,8,['#E0553C','#FF9C7A'],{speed:2.4,decay:0.05}); } break; } }
      if(!grew) snake.pop(); setHud(); }
    function roundRect(x,y,w,h,r){ cx.beginPath(); cx.moveTo(x+r,y); cx.arcTo(x+w,y,x+w,y+h,r); cx.arcTo(x+w,y+h,x,y+h,r); cx.arcTo(x,y+h,x,y,r); cx.arcTo(x,y,x+w,y,r); cx.closePath(); }
    function draw(){
      shake.begin(cx);
      cx.clearRect(-40,-40,BW+80,BH+80);
      const T=Date.now();
      // the painted garden, not a green gradient with dots on it
      if(!drawWorld(cx,opts.world||'forest',0,0,BW,BH)){
        const bg=cx.createLinearGradient(0,0,0,BH); bg.addColorStop(0,'#4E7A46'); bg.addColorStop(1,'#2E5230');
        cx.fillStyle=bg; cx.fillRect(0,0,BW,BH); }
      SGFX.scrim(cx,BW,BH,0.30);
      SGFX.drawMotes(cx,motes,BW,BH,T);
      cx.strokeStyle='rgba(255,255,255,.07)'; cx.lineWidth=1;
      for(let gx=1;gx<COLS;gx++){ cx.beginPath(); cx.moveTo(gx*CELL,0); cx.lineTo(gx*CELL,BH); cx.stroke(); }
      for(let gy=1;gy<ROWS;gy++){ cx.beginPath(); cx.moveTo(0,gy*CELL); cx.lineTo(BW,gy*CELL); cx.stroke(); }
      /* letter tiles: real objects with a lit face and a shadow, and the one the
         snake needs next carries its own light so the eye finds it instantly */
      cx.textAlign='center'; cx.textBaseline='middle';
      for(let t=0;t<tiles.length;t++){ const tl=tiles[t], px=tl.x*CELL, py=tl.y*CELL, isNext=tl.idx===spelled;
        if(isNext) SGFX.orb(cx,px+CELL/2,py+CELL/2,CELL*0.30,'rgba(255,243,196,.85)','rgba(240,180,41,.35)',T/300);
        SGFX.tile(cx,px+3,py+3,CELL-6,CELL-6,CELL*0.20,
          isNext?'#FFE9A8':'rgba(252,247,236,.97)', isNext?'#E8A81C':'rgba(219,208,187,.97)',
          isNext?'rgba(140,86,6,.55)':'rgba(120,104,76,.35)');
        cx.fillStyle=isNext?'#4A3306':'#6A5C40'; cx.font='800 '+Math.floor(CELL*0.54)+'px Sono, monospace';
        cx.fillText(tl.ch.toUpperCase(),px+CELL/2,py+CELL/2+1); }
      cx.textAlign='left'; cx.textBaseline='alphabetic';
      // ===== the snake — connected scaled body + a snake head (coloured to the worn Serpent avatar) =====
      const cc=(s)=>({x:s.x*CELL+CELL/2, y:s.y*CELL+CELL/2});
      // wrap-aware: skip segment links that jump across an edge, so the body reads clean
      const near=(a,b)=>Math.abs(a.x-b.x)<=CELL*1.5 && Math.abs(a.y-b.y)<=CELL*1.5;
      // body as a thick rounded stroke through the segment centres (outline then fill), tail tapers
      const pts=snake.map(cc);
      // a solid rounded body ball at every segment cell — so a segment that sits alone
      // across the wrap seam still reads as a snake chunk, not a stray pill
      for(let i=snake.length-1;i>=1;i--){ const p=pts[i], r=CELL*(0.40-(i/snake.length)*0.10);
        cx.fillStyle=PAL[3]; cx.beginPath(); cx.arc(p.x,p.y,r+1.5,0,7); cx.fill();
        cx.fillStyle=PAL[0]; cx.beginPath(); cx.arc(p.x,p.y,r,0,7); cx.fill(); }
      // draw the tube segment by segment; a pair that straddles the wrap seam is drawn as two
      // stubs running OFF the shared edge, so a wrapping snake still reads as one continuous body
      const drawRun=(w,col)=>{ cx.strokeStyle=col; cx.lineWidth=w; cx.lineCap='round'; cx.lineJoin='round';
        for(let i=1;i<pts.length;i++){ const a=pts[i-1], b=pts[i];
          if(near(a,b)){ cx.beginPath(); cx.moveTo(a.x,a.y); cx.lineTo(b.x,b.y); cx.stroke(); }
          else if(Math.abs(a.x-b.x)>Math.abs(a.y-b.y)){ const L=a.x<b.x?a:b, R=a.x<b.x?b:a;
            cx.beginPath(); cx.moveTo(L.x,L.y); cx.lineTo(-CELL*0.5,L.y); cx.stroke();
            cx.beginPath(); cx.moveTo(R.x,R.y); cx.lineTo(BW+CELL*0.5,R.y); cx.stroke(); }
          else { const T=a.y<b.y?a:b, B=a.y<b.y?b:a;
            cx.beginPath(); cx.moveTo(T.x,T.y); cx.lineTo(T.x,-CELL*0.5); cx.stroke();
            cx.beginPath(); cx.moveTo(B.x,B.y); cx.lineTo(B.x,BH+CELL*0.5); cx.stroke(); } } };
      drawRun(CELL*0.86, PAL[3]);              // dark outline
      drawRun(CELL*0.66, PAL[0]);              // body colour
      cx.globalAlpha=0.5; drawRun(CELL*0.26, PAL[1]); cx.globalAlpha=1;   // glossy centre highlight — rounds the tube
      // belly highlight + scale dots along the body
      cx.fillStyle=PAL[1];
      for(let i=1;i<snake.length;i++){ const p=cc(snake[i]), t=1-(i/snake.length)*0.5;
        cx.globalAlpha=0.5*t; cx.beginPath(); cx.arc(p.x,p.y,CELL*0.12,0,7); cx.fill(); }
      cx.globalAlpha=1;
      // head
      const hd=snake[0], hcx=hd.x*CELL+CELL/2, hcy=hd.y*CELL+CELL/2;
      cx.save(); cx.translate(hcx,hcy); cx.rotate(Math.atan2(dir.y,dir.x));
      if(bonk>0){ cx.fillStyle='rgba(229,83,61,.5)'; cx.beginPath(); cx.arc(0,0,CELL*0.5,0,7); cx.fill(); bonk--; }
      tongueT+=0.2;
      // Gemini painted head for the default garden-green snake; procedural head keeps
      // recolouring correctly for the evolved / worn-skin palettes (gold naga, blue seasnake).
      const headTex=(!wornSkin && snakeStage===0)?sgTex('snake-head'):null;
      if(headTex){ const hw2=CELL*1.22, hh2=hw2*(headTex.height/headTex.width);
        try{ cx.drawImage(headTex,-hw2*0.42,-hh2/2,hw2,hh2); }catch(e){} }
      else {
        const hw=CELL*0.62, hh=CELL*0.46;
        cx.fillStyle=PAL[3]; cx.beginPath(); cx.ellipse(2,0,hw+2,hh+2,0,0,7); cx.fill();      // outline
        const hg=cx.createLinearGradient(0,-hh,0,hh); hg.addColorStop(0,PAL[1]); hg.addColorStop(1,PAL[0]);
        cx.fillStyle=hg; cx.beginPath(); cx.ellipse(2,0,hw,hh,0,0,7); cx.fill();               // head
        const tl=CELL*(0.28+0.12*Math.max(0,Math.sin(tongueT)));
        cx.strokeStyle='#E23B57'; cx.lineWidth=Math.max(1.5,CELL*0.05); cx.lineCap='round';
        cx.beginPath(); cx.moveTo(hw,0); cx.lineTo(hw+tl,0); cx.moveTo(hw+tl,0); cx.lineTo(hw+tl+CELL*0.09,-CELL*0.07); cx.moveTo(hw+tl,0); cx.lineTo(hw+tl+CELL*0.09,CELL*0.07); cx.stroke();
        const ex=hw*0.15, ey=hh*0.55, er=CELL*0.11;
        [[ex,-ey],[ex,ey]].forEach(e=>{ cx.fillStyle='#fff'; cx.beginPath(); cx.arc(e[0],e[1],er,0,7); cx.fill();
          cx.fillStyle='#241A0C'; cx.beginPath(); cx.arc(e[0]+er*0.3,e[1],er*0.55,0,7); cx.fill();
          cx.fillStyle='#fff'; cx.beginPath(); cx.arc(e[0]-er*0.2,e[1]-er*0.3,er*0.25,0,7); cx.fill(); });
        cx.fillStyle=PAL[3]; [[hw*0.8,-hh*0.3],[hw*0.8,hh*0.3]].forEach(n=>{ cx.beginPath(); cx.arc(n[0],n[1],CELL*0.03,0,7); cx.fill(); });
      }
      cx.restore();
      SGFX.run(cx,fx);
      SGFX.vignette(cx,BW,BH,0.36);
      shake.end(cx);
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
      win=win||unlocked;                                   // reaching Vasuki counts as a win, even if you tangle later
      const fb=host.querySelector('.sg-finishbtn'); if(fb) fb.remove();
      const form=(SG_EVO.snake.forms[snakeStage]||[])[2]||'Grass Snake';
      const stars=win?(unlocked?3:lives>=3?3:lives===2?2:1):0; const el=host.querySelector('#sg-card');
      if(!el){ done({win,score,stars}); return; }
      el.innerHTML=SGUI.result({ win, stars, score, scoreLabel:'points', words:snRound,
        title: unlocked?'Became VASUKI':win?'Words spelled':'Tangled out', sub:'Evolved to '+form });
      el.style.display='grid'; SGUI.bind(el);
      el.querySelector('#sg-again').onclick=()=>{ el.style.display='none'; el.innerHTML=''; wordSnake(host,opts,done); };
      el.querySelector('#sg-cont').onclick=()=>{ el.style.display='none'; el.innerHTML=''; done({win,score,stars}); };
    }
    // the achievable endpoint: the snake becomes VASUKI — next chapter unlocks, but play goes on
    function onVasuki(){ if(unlocked) return; unlocked=true;
      try{ if(opts.onUnlock) opts.onUnlock(3); }catch(e){}
      spawnSplash('🌌 VASUKI!');
      const fb=document.createElement('button'); fb.className='sg-finishbtn'; fb.textContent='Finish ⭐';
      fb.onclick=()=>finish(true); host.appendChild(fb); }
    evo=sgEvo(host,'snake');
    if(wornSkin){
      // a PICKED snake wears its own name — the evolution ladder's labels don't apply to a fixed skin
      const nm={noodle:'Noodle',sunny:'Sunny',cobra:'Cobra',python:'Python',rattler:'Rattler',viper:'Viper',
        boa:'Boa',mamba:'Mamba',seasnake:'Sea Snake',naga:'Naga',titanoboa:'Titanoboa',vasuki:'Vasuki'}[opts.hero]||'Serpent';
      const chip=host.querySelector('.sg-evochip'); if(chip) chip.innerHTML='🐍 <b>'+nm+'</b>';
      evo={ set(stage,onUnlock,uAt){ const u=(uAt!=null)?uAt:5; if(stage>=u&&onUnlock) onUnlock(3); } };  // keep the Vasuki unlock, skip chip rewrites
    } else evo.set(0);
    reset(); frame._t=tick; loop=setInterval(frame,tick); draw();
    return { destroy(){ over=true; if(loop){ clearInterval(loop); loop=null; } removeEventListener('keydown',key); } };
  }

  /* ---------- ENGINE J · COMB CATCHER (catch the falling letters in order) ---------- */
  function combCatcher(host, opts, done){
    const Wd=Math.min(innerWidth-16,1120), Ht=Math.max(320,innerHeight-280);
    const world=opts.world||'meadow', diff=opts.diff||'medium';
    const CFG=calmCFG({easy:{words:4,fall:1.3,rate:1.1},medium:{words:5,fall:1.7,rate:0.95},hard:{words:6,fall:2.1,rate:0.82},champ:{words:7,fall:2.5,rate:0.72}}[diff]);
    const feed=wordFeed(CFG.words+6,w=>w&&w.w&&/^[a-z]+$/i.test(w.w)&&w.w.length>=3&&w.w.length<=9);
    let curW=null;
    host.innerHTML='<div class="sg-hud"><span id="sg-cc-w">Word 1/'+CFG.words+'</span><span id="sg-cc-lives"></span></div>'+
      '<div class="sg-target" id="sg-cc-slots"></div><div id="sg-cc-mean" class="sg-cardmean"></div>'+
      '<canvas id="sg-cv"></canvas>'+
      '<div class="sg-lanebtns"><button class="sg-dbtn" data-d="left" aria-label="Left">◀</button><button class="sg-dbtn" data-d="right" aria-label="Right">▶</button></div>'+
      '<div id="sg-card"></div>';
    const cv=host.querySelector('#sg-cv');
    const dpr=Math.min(2.5,window.devicePixelRatio||1);
    cv.width=Math.round(Wd*dpr); cv.height=Math.round(Ht*dpr);
    cv.style.width=Wd+'px'; cv.style.height=Ht+'px';
    const cx=cv.getContext('2d'); cx.setTransform(dpr,0,0,dpr,0,0);
    let word='',spelled=0,drops=[],basket=Wd/2,vx=0,wordsDone=0,lives=3,over=false,dropT=0,bonk=0,score=0,loop=null,last=0;
    const ccRound=[]; let ccClean=true;    // the round's words, and whether this one was caught clean
    const BW=64;
    function layout(){ curW=feed.next(); word=curW.w.toLowerCase(); spelled=0; drops=[]; ccClean=true;
      host.querySelector('#sg-cc-slots').innerHTML=word.split('').map((ch,i)=>'<span class="sg-tl'+(i<spelled?' done':i===spelled?' next':'')+'">'+(i<spelled?ch.toUpperCase():'•')+'</span>').join('');
      const mn=host.querySelector('#sg-cc-mean'); if(mn){ const m=meaningText(curW); mn.textContent=m?('💡 '+m):''; }
      try{ say(word); }catch(e){} }
    function renderSlots(){ host.querySelector('#sg-cc-slots').innerHTML=word.split('').map((ch,i)=>'<span class="sg-tl'+(i<spelled?' done':i===spelled?' next':'')+'">'+(i<spelled?ch.toUpperCase():'•')+'</span>').join(''); }
    function setHud(){ host.querySelector('#sg-cc-w').textContent='Word '+(wordsDone+1)+'/'+CFG.words; host.querySelector('#sg-cc-lives').textContent='❤'.repeat(Math.max(0,lives)); }
    function spawn(){ // 60% chance the needed letter, else a decoy; never let the queue starve the needed letter
      const need=word[spelled]; const wantNeed=Math.random()<0.6 || !drops.some(d=>d.ch===need);
      const ch=wantNeed?need:String.fromCharCode(97+Math.floor(Math.random()*26));
      drops.push({x:26+Math.random()*(Wd-52),y:-20,ch,vy:CFG.fall*(0.85+Math.random()*0.4)}); }
    function step(dt){ if(over) return;
      basket=Math.max(BW/2,Math.min(Wd-BW/2,basket+vx*dt*0.35));
      dropT+=dt/1000; if(dropT>=CFG.rate){ dropT=0; spawn(); }
      for(let i=drops.length-1;i>=0;i--){ const d=drops[i]; d.y+=d.vy;
        if(d.y>Ht-40 && Math.abs(d.x-basket)<BW/2+12){        // caught
          drops.splice(i,1);
          if(d.ch===word[spelled]){ spelled++; score+=15; renderSlots();
            SGFX.spark(fx,d.x,d.y,8,['#FFE9A8','#F0B429','#FFFFFF'],{speed:2.4,decay:0.055,rx:2.4,ry:3.2});
            if(spelled>=word.length){ ccRound.push({w:word,ok:ccClean}); wordsDone++; score+=40; spawnSplash(); try{ if(typeof addCoins==='function') addCoins(8); }catch(e){}
              if(wordsDone>=CFG.words){ finish(true); return; } layout(); setHud(); } }
          else { bonk=3; }                                    // wrong letter — no penalty beyond the miss
        } else if(d.y>Ht){ drops.splice(i,1);
          if(d.ch===word[spelled]){ ccClean=false; lives--; bonk=3; shake.hit(10);
            SGFX.spark(fx,d.x,Ht-36,10,['#E0553C','#FF9C7A'],{speed:3});
            setHud(); if(lives<=0){ finish(false); return; } } }   // let the needed letter fall past → lose a heart
      }
    }
    let fx=[]; const shake=SGFX.shake(), motes=SGFX.motes(20,Wd,Ht), trail=SGFX.trail();
    function spawnSplash(){
      SGFX.spark(fx,basket,Ht-30,18,['#F0B429','#FF7FB0','#8FA0F5','#FFE9A8'],{speed:3.6,up:1});
      SGFX.ring(fx,basket,Ht-30,'255,209,63',{grow:7}); shake.hit(5); }
    function draw(){
      shake.begin(cx);
      cx.clearRect(-40,-40,Wd+80,Ht+80);
      const T=Date.now();
      if(!drawWorld(cx,world,0,0,Wd,Ht)){ cx.fillStyle='#4C7A54'; cx.fillRect(0,0,Wd,Ht); }
      SGFX.scrim(cx,Wd,Ht,0.26);
      SGFX.drawMotes(cx,motes,Wd,Ht,T);
      /* a falling letter is a lit capsule with a tail, and the one you need next
         carries its own light — you should be able to pick it out mid-fall */
      cx.textAlign='center'; cx.textBaseline='middle';
      for(const d of drops){ const need=d.ch===word[spelled];
        cx.save(); cx.globalAlpha=.30; cx.fillStyle=need?'#F0B429':'#FFF7E2';
        cx.beginPath(); cx.ellipse(d.x,d.y-16,5,13,0,0,7); cx.fill(); cx.restore();
        if(need) SGFX.orb(cx,d.x,d.y,13,'rgba(255,243,196,.9)','rgba(240,180,41,.4)',T/280);
        SGFX.tile(cx,d.x-15,d.y-15,30,30,10,
          need?'#FFE9A8':'rgba(252,247,236,.97)', need?'#E8A81C':'rgba(214,203,182,.97)',
          need?'rgba(140,86,6,.55)':'rgba(120,104,76,.3)');
        cx.fillStyle=need?'#4A3306':'#6A5C40'; cx.font='800 16px Sono,monospace';
        cx.fillText(d.ch.toUpperCase(),d.x,d.y+1); }
      cx.textAlign='left'; cx.textBaseline='alphabetic';
      // basket = Bizzy sprite
      const bi=sgImg('bizzy-side-fly')||avImg(heroAv()); const by=Ht-32;
      if(bonk>0){ cx.fillStyle='rgba(229,83,61,.5)'; cx.beginPath(); cx.arc(basket,by,26,0,7); cx.fill(); bonk--; }
      let bd=false; if(bi){ try{ cx.drawImage(bi,basket-24,by-24,48,48); bd=true; }catch(e){} }
      if(!bd){ cx.fillStyle='#F0B429'; cx.beginPath(); cx.arc(basket,by,20,0,7); cx.fill(); }
      SGFX.run(cx,fx);
      SGFX.vignette(cx,Wd,Ht,0.34);
      shake.end(cx);
    }
    function frame(){ if(over){ if(loop){clearInterval(loop);loop=null;} return; } const now=Date.now(), dt=Math.min(50,now-last); last=now;
      try{ step(dt); if(!over) draw(); }catch(e){} }
    const key=e=>{ if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A'){ vx=-6; e.preventDefault(); } else if(e.key==='ArrowRight'||e.key==='d'||e.key==='D'){ vx=6; e.preventDefault(); } };
    const keyup=e=>{ if(['ArrowLeft','ArrowRight','a','A','d','D'].includes(e.key)) vx=0; };
    addEventListener('keydown',key); addEventListener('keyup',keyup);
    const pad=host.querySelector('.sg-lanebtns');
    const hold=(dir)=>{ vx=dir*6; }; const rel=()=>{ vx=0; };
    pad.addEventListener('pointerdown',e=>{ const b=e.target.closest('[data-d]'); if(b){ hold(b.dataset.d==='left'?-1:1); e.preventDefault(); } },{passive:false});
    pad.addEventListener('pointerup',rel); pad.addEventListener('pointerleave',rel);
    cv.addEventListener('pointerdown',e=>{ const r=cv.getBoundingClientRect(); basket=Math.max(BW/2,Math.min(Wd-BW/2,(e.clientX-r.left)*(Wd/r.width))); });
    cv.addEventListener('pointermove',e=>{ if(e.buttons){ const r=cv.getBoundingClientRect(); basket=Math.max(BW/2,Math.min(Wd-BW/2,(e.clientX-r.left)*(Wd/r.width))); } });
    function finish(win){ over=true; if(loop){clearInterval(loop);loop=null;} removeEventListener('keydown',key); removeEventListener('keyup',keyup);
      const stars=win?(lives>=3?3:lives===2?2:1):0; const el=host.querySelector('#sg-card');
      if(!el){ done({win,score,stars}); return; }
      el.innerHTML=SGUI.result({ win, stars, score, scoreLabel:'points', words:ccRound,
        title: win?'Every word caught':'Out of catches' });
      el.style.display='grid'; SGUI.bind(el);
      el.querySelector('#sg-again').onclick=()=>{ el.style.display='none'; el.innerHTML=''; combCatcher(host,opts,done); };
      el.querySelector('#sg-cont').onclick=()=>{ el.style.display='none'; el.innerHTML=''; done({win,score,stars}); };
    }
    layout(); setHud(); last=Date.now(); loop=setInterval(frame,1000/60); draw();
    return { destroy(){ over=true; if(loop){clearInterval(loop);loop=null;} removeEventListener('keydown',key); removeEventListener('keyup',keyup); } };
  }

  /* ---------- ENGINE K · STAGE RHYTHM (letter notes on the beat) ---------- */
  function stageRhythm(host, opts, done){
    const diff=opts.diff||'medium';
    const CFG=calmCFG({easy:{words:4,fall:2.4,gap:950},medium:{words:5,fall:3.0,gap:800},hard:{words:6,fall:3.6,gap:680},champ:{words:7,fall:4.2,gap:580}}[diff]||{words:5,fall:3.0,gap:800});
    const words=fillWords(CFG.words,3,8);
    if(!words.length){ done({win:true,score:0,stars:1}); return; }
    const art=(window.SGART&&SGART.ready());
    const plate=art?SGART.plateForWorld(opts.world||'Stage'):'';
    host.innerHTML='<div class="sg-hud"><span id="sg-rw">🎵 1/'+CFG.words+'</span><span id="sg-rh"></span><span id="sg-rs">0</span></div>'+
      '<div class="sg-rhythm" id="sg-rst"><div class="sg-rhythm-bg">'+plate+'</div>'+
        '<div class="sg-rlanes" id="sg-rl">'+[0,1,2,3].map(l=>'<div class="sg-rlane" data-l="'+l+'"><span class="sg-rkey">'+['D','F','J','K'][l]+'</span></div>').join('')+'</div>'+
        '<div class="sg-rhit" id="sg-rhit"></div></div>'+
      '<div class="sg-rword"><button class="sg-sbtn" id="sg-rsay" aria-label="Hear the word">'+iconSVG('volume',18)+'</button><span id="sg-rslots"></span></div>'+
      '<div class="sg-race-mean" id="sg-rmean"></div><div id="sg-card"></div>';
    const stage=host.querySelector('#sg-rst'), laneEl=host.querySelector('#sg-rl');
    let wi=0, li=0, hearts=4, score=0, notes=[], over=false, loop=null, spawnT=0, beatT=0;
    const srRound=[]; let srClean=true;    // the round's words, and whether this one was played clean
    function cur(){ return words[wi]||words[words.length-1]||{w:'honey'}; }   // never index past the end
    function need(){ return cur().w.toLowerCase()[li]; }
    function renderSlots(){ const w=cur().w.toLowerCase();
      host.querySelector('#sg-rslots').innerHTML=w.split('').map((ch,ix)=>'<span class="sg-slot'+(ix<li?' fill':ix===li?' next':'')+'">'+(ix<li?ch.toUpperCase():'')+'</span>').join('');
      host.querySelector('#sg-rh').textContent='❤'.repeat(Math.max(0,hearts));
      host.querySelector('#sg-rs').textContent='⭐ '+score; }
    function newWord(){ li=0; srClean=true; const w=cur();
      host.querySelector('#sg-rw').textContent='🎵 '+(wi+1)+'/'+CFG.words;
      host.querySelector('#sg-rmean').innerHTML=meaningHTML(w);
      renderSlots(); try{ say(w.w); }catch(e){} }
    function spawn(){ const needed=Math.random()<0.55;
      let ch=need(); if(!needed){ do{ ch=String.fromCharCode(97+Math.floor(Math.random()*26)); }while(ch===need()); }
      const el=document.createElement('div'); el.className='sg-rnote'+(art?'':' plain'); el.textContent=ch.toUpperCase();
      const lane=Math.floor(Math.random()*4); el.style.left=(lane*25+12.5)+'%';
      stage.appendChild(el); notes.push({el,lane,ch,y:-8}); }
    function bopLane(l){ if(over) return;
      const H=stage.clientHeight, zone=notes.filter(n=>n.lane===l&&n.y>H-96&&n.y<H-10);
      if(!zone.length) return;
      const n=zone.sort((a,b)=>b.y-a.y)[0];
      if(n.ch===need()){ n.el.classList.add('pop'); setTimeout(()=>n.el.remove(),180); notes=notes.filter(x=>x!==n);
        li++; score+=15; try{ if(typeof sfx==='function') sfx('correct'); }catch(e){}
        if(li>=cur().w.length){ srRound.push({w:cur().w,ok:srClean}); score+=40; wi++;
          try{ flash('🎶 '+words[wi-1].w.toUpperCase()+' — the marquee glows!'); }catch(e){}
          if(wi>=CFG.words){ finish(true); return; }
          newWord(); } else renderSlots(); }
      else { n.el.classList.add('bad'); setTimeout(()=>n.el.remove(),220); notes=notes.filter(x=>x!==n);
        srClean=false; hearts--; renderSlots(); try{ if(typeof sfx==='function') sfx('wrong'); }catch(e){}
        if(hearts<=0) finish(false); } }
    function frame(){ if(over) return;
      const H=stage.clientHeight; spawnT+=16.7; beatT+=16.7;
      if(spawnT>=CFG.gap){ spawnT=0; spawn(); }
      if(beatT>=CFG.gap){ beatT=0; const hit=host.querySelector('#sg-rhit');
        if(hit){ hit.classList.remove('pulse'); void hit.offsetWidth; hit.classList.add('pulse'); } }
      for(const n of [...notes]){ n.y+=CFG.fall; n.el.style.top=n.y+'px';
        if(n.y>H){ n.el.remove(); notes=notes.filter(x=>x!==n);
          if(n.ch===need()){ srClean=false; hearts--; renderSlots();
            try{ flash('The note slipped past — listen again!'); }catch(e){}
            if(hearts<=0){ finish(false); return; } } } } }
    const key=e=>{ if(over) return; const map={d:0,f:1,j:2,k:3,ArrowLeft:0,ArrowDown:1,ArrowUp:2,ArrowRight:3,'1':0,'2':1,'3':2,'4':3};
      const l=map[e.key.length===1?e.key.toLowerCase():e.key]; if(l!==undefined){ bopLane(l); e.preventDefault(); } };
    addEventListener('keydown',key);
    laneEl.addEventListener('pointerdown',e=>{ const ln=e.target.closest('.sg-rlane'); if(ln) bopLane(+ln.dataset.l); });
    host.querySelector('#sg-rsay').onclick=()=>{ try{ say(cur().w); }catch(e){} };
    /* No result screen at all: the marquee went dark and the child was handed back to
       the app's generic text card, with no list of what they had just played. */
    function finish(win){ over=true; if(loop){clearInterval(loop);loop=null;} removeEventListener('keydown',key);
      const stars=win?(hearts>=4?3:hearts>=2?2:1):0;
      const el=host.querySelector('#sg-card'); if(!el){ done({win,score,stars}); return; }
      el.innerHTML=SGUI.result({ win, stars, score, scoreLabel:'points', words:srRound,
        title: win?'The marquee is lit':'Out of hearts' });
      el.style.display='grid'; SGUI.bind(el);
      el.querySelector('#sg-again').onclick=()=>{ el.style.display='none'; el.innerHTML=''; stageRhythm(host,opts,done); };
      el.querySelector('#sg-cont').onclick=()=>{ el.style.display='none'; el.innerHTML=''; done({win,score,stars}); }; }
    newWord(); loop=setInterval(frame,1000/60);
    return { destroy(){ over=true; if(loop){clearInterval(loop);loop=null;} removeEventListener('keydown',key); } };
  }

  /* ---------- ENGINE L · CONSTELLATION CONNECT (draw words in the sky) ---------- */
  function constellationConnect(host, opts, done){
    const diff=opts.diff||'medium';
    const CFG=calmCFG({easy:{n:4},medium:{n:5},hard:{n:6},champ:{n:7}}[diff]||{n:5});
    const words=fillWords(CFG.n,3,8);
    if(!words.length){ done({win:true,score:0,stars:1}); return; }
    const art=(window.SGART&&SGART.ready());
    const plate=art?SGART.plateForWorld(opts.world||'Cosmos'):'';
    let wi=0, li=0, misses=0, hints=3, over=false, starsPos=[];
    host.innerHTML='<div class="sg-hud"><span id="sg-cw">✨ 1/'+CFG.n+'</span><span id="sg-cm"></span><button class="sg-hintbtn" id="sg-chint">💡 ×3</button></div>'+
      '<div class="sg-consky" id="sg-csky"><div class="sg-consky-bg">'+plate+'</div>'+
        '<svg class="sg-conlayer" id="sg-csvg" viewBox="0 0 100 62" preserveAspectRatio="none"><polyline id="sg-cline" points=""/></svg>'+
        '<div id="sg-cstars"></div></div>'+
      '<div class="sg-rword"><button class="sg-sbtn" id="sg-csay" aria-label="Hear the word">'+iconSVG('volume',18)+'</button><span id="sg-cslots"></span></div>'+
      '<div class="sg-race-mean" id="sg-cmean"></div>';
    const sky=host.querySelector('#sg-csky'), starsEl=host.querySelector('#sg-cstars'), line=host.querySelector('#sg-cline');
    function cur(){ return words[wi]||words[words.length-1]||{w:'honey'}; }   // never index past the end
    function renderSlots(){ const w=cur().w.toLowerCase();
      host.querySelector('#sg-cslots').innerHTML=w.split('').map((ch,ix)=>'<span class="sg-slot'+(ix<li?' fill':ix===li?' next':'')+'">'+(ix<li?ch.toUpperCase():'')+'</span>').join('');
      host.querySelector('#sg-cm').textContent=misses?('✖'.repeat(Math.min(misses,8))):''; }
    function scatter(){ const w=cur().w.toLowerCase(); starsPos=[];
      const chars=w.split('').map((ch,ix)=>({ch,ix,decoy:false}));
      let d=0; while(d<2){ const c=String.fromCharCode(97+Math.floor(Math.random()*26));
        if(!w.includes(c)){ chars.push({ch:c,ix:-1,decoy:true}); d++; } }
      const pts=[];
      for(const c of chars){ let x,y,tries=0;
        do{ x=8+Math.random()*84; y=8+Math.random()*46; tries++; }
        while(tries<60&&pts.some(p=>Math.hypot(p.x-x,p.y-y)<13));
        pts.push({x,y}); c.x=x; c.y=y; starsPos.push(c); }
      starsEl.innerHTML=starsPos.map((s,i)=>'<button class="sg-constar" data-i="'+i+'" style="left:'+s.x+'%;top:'+(s.y/62*100)+'%"><span class="sg-conglow"></span>'+s.ch.toUpperCase()+'</button>').join('');
      line.setAttribute('points',''); }
    function newWord(){ li=0; const w=cur();
      host.querySelector('#sg-cw').textContent='✨ '+(wi+1)+'/'+CFG.n;
      host.querySelector('#sg-cmean').innerHTML=meaningHTML(w);
      scatter(); renderSlots(); try{ say(w.w); }catch(e){} }
    starsEl.onclick=e=>{ if(over) return; const bt=e.target.closest('.sg-constar'); if(!bt) return;
      const s=starsPos[+bt.dataset.i]; const w=cur().w.toLowerCase();
      if(bt.classList.contains('on')) return;
      if(s.ch===w[li]&&!s.decoy){ bt.classList.add('on');
        const p=line.getAttribute('points'); line.setAttribute('points',p+(p?' ':'')+s.x.toFixed(1)+','+s.y.toFixed(1));
        li++; renderSlots(); try{ if(typeof sfx==='function') sfx('correct'); }catch(e){}
        if(li>=w.length){ sky.classList.remove('lit'); void sky.offsetWidth; sky.classList.add('lit');
          try{ flash('🌌 '+w.toUpperCase()+' — the constellation shines!'); }catch(e){}
          wi++; if(wi>=CFG.n){ finish(true); return; } setTimeout(newWord,900); } }
      else { misses++; bt.classList.remove('shake'); void bt.offsetWidth; bt.classList.add('shake');
        renderSlots(); try{ if(typeof sfx==='function') sfx('wrong'); }catch(e){}
        if(misses>=8){ finish(false); return; }
        try{ flash('Not that star — listen once more!'); }catch(e){} try{ say(cur().w); }catch(e){} } };
    host.querySelector('#sg-chint').onclick=()=>{ if(over||hints<=0) return; hints--;
      host.querySelector('#sg-chint').textContent='💡 ×'+hints;
      const w=cur().w.toLowerCase();
      const i=starsPos.findIndex((s,ix)=>{ if(s.decoy||s.ch!==w[li]) return false;
        const bt=starsEl.querySelector('[data-i="'+ix+'"]'); return bt&&!bt.classList.contains('on'); });
      const bt=starsEl.querySelector('[data-i="'+i+'"]'); if(bt){ bt.classList.add('hintpulse'); setTimeout(()=>bt.classList.remove('hintpulse'),1600); } };
    host.querySelector('#sg-csay').onclick=()=>{ try{ say(cur().w); }catch(e){} };
    function finish(win){ over=true;
      done({win, score:wi*100+hints*50-misses*10, stars:win?(hints>=2&&misses<=2?3:hints>=1?2:1):0}); }
    newWord();
    return { destroy(){ over=true; } };
  }

  /* ---------- ENGINE M · TYPE BLASTER (arcade dictation shooter) ---------- */
  function typeBlaster(host, opts, done){
    const diff=opts.diff||'medium';
    const CFG=calmCFG({easy:{n:5,v:0.09},medium:{n:6,v:0.115},hard:{n:7,v:0.14},champ:{n:8,v:0.165}}[diff]||{n:6,v:0.115});
    const words=fillWords(CFG.n,3,9);
    if(!words.length){ done({win:true,score:0,stars:1}); return; }
    const art=(window.SGART&&SGART.ready());
    const plate=art?SGART.plateForWorld(opts.world||'Arcade'):'';
    /* Both fallbacks used to be emoji escapes — a 👾 for the foe and a 🐝 for the
       cannon. The two things a player looks at most became a different picture on
       every platform whenever the WebP failed to load. Drawn instead. */
    const foeSvg='<img src="app-art/gart/glitch.webp" class="sg-tbimg sg-tbglitch" alt="glitch" '
      +'onerror="this.outerHTML=window.TB_GLITCH();">';
    const beeSvg='<img src="app-art/gart/bee-fly.webp" alt="bee" '
      +'onerror="this.outerHTML=window.TB_BEE();">';
    let wi=0, li=0, shield=3, score=0, foeY=0, over=false, loop=null, combo=0, best=0;
    let wordPerfect=true, danger=false, started=false;
    const round=[];                       // the round, for a result screen that shows the words
    host.innerHTML='<div class="sg-hud sg-tb-hud">'+
        '<span class="sg-tb-wave" id="sg-tw">1<i>/'+CFG.n+'</i></span>'+
        '<span class="sg-tb-shield" id="sg-tsh"></span>'+
        '<span class="sg-tb-combo" id="sg-tc"></span>'+
        '<span class="sg-tb-score" id="sg-ts">0</span></div>'+
      '<div class="sg-tbstage" id="sg-tbs"><div class="sg-tbstage-bg">'+plate+'</div>'+
        '<div class="sg-tbfoe" id="sg-tbf">'+foeSvg+'<div class="sg-tbslots" id="sg-tbslots"></div></div>'+
        '<div class="sg-tbbeam" id="sg-tbbeam"></div>'+
        '<div class="sg-tbshield" id="sg-tbshieldbar"></div>'+
        '<div class="sg-tbcannon">'+beeSvg+'</div></div>'+
      '<div class="sg-rword"><button class="sg-sbtn" id="sg-tsay" aria-label="Hear the word">'+iconSVG('volume',18)+'</button><span class="sg-race-mean" id="sg-tmean"></span></div>'+
      '<div class="ss-key sg-tbkey" id="sg-tkey"></div><div id="sg-card"></div>';
    const stage=host.querySelector('#sg-tbs'), foe=host.querySelector('#sg-tbf'), beam=host.querySelector('#sg-tbbeam');
    const rows=['qwertyuiop','asdfghjkl','zxcvbnm'];
    host.querySelector('#sg-tkey').innerHTML=rows.map(r=>'<div class="ss-krow">'+r.split('').map(ch=>'<button class="ss-kb" data-k="'+ch+'">'+ch+'</button>').join('')+'</div>').join('');
    function cur(){ return words[wi]||words[words.length-1]||{w:'honey'}; }   // never index past the end
    /* Drawn shield pips, not the 🛡 glyph repeated three times. A pip can empty and
       animate; a glyph can only be present or absent, at whatever weight the
       platform's emoji font decides. */
    function shieldPips(){ return [0,1,2].map(i=>
      '<svg class="sg-pip'+(i<shield?' up':'')+'" viewBox="0 0 20 22" width="17" height="19" aria-hidden="true">'+
      '<path d="M10 1.4l7.6 3v7.2c0 4.6-3.2 7.6-7.6 9-4.4-1.4-7.6-4.4-7.6-9V4.4z" '+
      'fill="'+(i<shield?'#2FB39E':'none')+'" fill-opacity="'+(i<shield?'.9':'0')+'" '+
      'stroke="'+(i<shield?'#0E8A78':'currentColor')+'" stroke-width="1.8" stroke-linejoin="round" '+
      'opacity="'+(i<shield?1:.3)+'"/></svg>').join(''); }
    function renderSlots(){ const w=cur().w.toLowerCase();
      host.querySelector('#sg-tbslots').innerHTML=w.split('').map((ch,ix)=>'<span class="sg-slot'+(ix<li?' fill':'')+'">'+(ix<li?ch.toUpperCase():'')+'</span>').join('');
      host.querySelector('#sg-tsh').innerHTML=shieldPips();
      host.querySelector('#sg-tc').textContent=combo>=2?(combo+'x'):'';
      host.querySelector('#sg-ts').textContent=score; }
    function newWord(){ li=0; foeY=0; wordPerfect=true; const w=cur();
      host.querySelector('#sg-tw').innerHTML=(wi+1)+'<i>/'+CFG.n+'</i>';
      host.querySelector('#sg-tmean').innerHTML=meaningHTML(w);
      foe.style.top='0%'; renderSlots(); try{ say(w.w); }catch(e){} }
    function zap(){ beam.classList.remove('fire'); void beam.offsetWidth; beam.classList.add('fire');
      foe.classList.remove('hitfx'); void foe.offsetWidth; foe.classList.add('hitfx'); }
    function type(ch){ if(over||!started) return; const w=cur().w.toLowerCase();
      if(ch===w[li]){ li++; score+=15; foeY=Math.max(0,foeY-7); zap(); renderSlots();
        try{ if(typeof sfx==='function') sfx('correct'); }catch(e){}
        if(li>=w.length){ score+=50; round.push({w:cur().w,ok:wordPerfect}); wlog(cur(),wordPerfect);
          if(wordPerfect){ combo++; best=Math.max(best,combo); if(combo>=2){ score+=combo*10; } } else combo=0;
          foe.classList.add('boom'); stage.classList.remove('sg-tb-danger'); danger=false;
          try{ flash(combo>=2?(combo+'x combo — '+w.toUpperCase()):(w.toUpperCase()+' — glitch zapped')); }catch(e){}
          wi++; if(wi>=CFG.n){ finish(true); return; }
          setTimeout(()=>{ foe.classList.remove('boom'); newWord(); },650); } }
      else { score=Math.max(0,score-5); foeY+=3; wordPerfect=false; combo=0; renderSlots();
        foe.classList.remove('gloatfx'); void foe.offsetWidth; foe.classList.add('gloatfx');
        try{ if(typeof sfx==='function') sfx('wrong'); }catch(e){} } }
    function frame(){ if(over||!started) return;
      if(foe.classList.contains('boom')) return;
      foeY+=CFG.v; foe.style.top=Math.min(78,foeY)+'%';
      const d=foeY>=58; if(d!==danger){ danger=d; stage.classList.toggle('sg-tb-danger',d); }
      if(foeY>=78){ shield--; foeY=0; foe.style.top='0%'; danger=false; stage.classList.remove('sg-tb-danger');
        stage.classList.remove('breach'); void stage.offsetWidth; stage.classList.add('breach');
        renderSlots(); try{ flash('The firewall took a hit — keep spelling'); }catch(e){}
        if(shield<=0){ round.push({w:cur().w,ok:false}); finish(false); return; } } }
    const kb=e=>{ if(over) return; if(/^[a-zA-Z]$/.test(e.key)){ type(e.key.toLowerCase()); e.preventDefault(); } };
    addEventListener('keydown',kb);
    host.querySelector('#sg-tkey').onclick=e=>{ const bt=e.target.closest('.ss-kb'); if(bt) type(bt.dataset.k); };
    host.querySelector('#sg-tsay').onclick=()=>{ try{ say(cur().w); }catch(e){} };
    function finish(win){ if(over) return; over=true;
      if(loop){clearInterval(loop);loop=null;} removeEventListener('keydown',kb);
      const stars=win?(shield>=3?3:shield===2?2:1):0;
      const el=host.querySelector('#sg-card'); if(!el){ done({win,score,stars}); return; }
      el.innerHTML=SGUI.result({ win, stars, score, scoreLabel:'points', words:round,
        title: win ? (best>=3?'Firewall held — '+best+'x best combo':'Firewall held') : 'The glitch broke through' });
      el.style.display='grid'; SGUI.bind(el);
      el.querySelector('#sg-again').onclick=()=>{ el.style.display='none'; el.innerHTML=''; typeBlaster(host,opts,done); };
      el.querySelector('#sg-cont').onclick=()=>{ el.style.display='none'; el.innerHTML=''; done({win,score,stars}); }; }
    function howto(){ const el=host.querySelector('#sg-card');
      el.innerHTML=SGUI.howto({ title:'Type Blaster', art:TB_GLITCH(64),
        sub:'A glitch is falling on the hive firewall. Every letter you get right fires the cannon and drives it back.',
        steps:[ 'Hear the word, then type it — your keyboard or the keys on screen',
                'Each correct letter pushes the glitch back; a wrong one lets it drop',
                'Spell a whole word with no mistakes to keep the combo alive',
                'Three shields. Let it reach the floor three times and the firewall falls' ],
        go:'Man the cannon' });
      el.style.display='grid';
      el.querySelector('#sg-howgo').onclick=()=>{ el.style.display='none'; el.innerHTML='';
        started=true; newWord(); }; }
    renderSlots(); howto(); loop=setInterval(frame,1000/60);
    return { destroy(){ over=true; if(loop){clearInterval(loop);loop=null;}
      removeEventListener('keydown',kb); } };
  }
  /* The glitch and the cannon bee, drawn — the img fallbacks and the start card's
     art come from here, so a child meets the same creature in both places. */
  function TB_GLITCH(size){ size=size||90;
    return '<svg viewBox="0 0 64 64" width="'+size+'" height="'+size+'" class="sg-tbimg" aria-label="the glitch">'+
      '<rect x="12" y="16" width="40" height="30" rx="7" fill="#7C5CFF"/>'+
      '<rect x="8" y="24" width="6" height="12" rx="2" fill="#5B3FD6"/><rect x="50" y="24" width="6" height="12" rx="2" fill="#5B3FD6"/>'+
      '<rect x="18" y="8" width="4" height="9" rx="2" fill="#5B3FD6"/><rect x="42" y="8" width="4" height="9" rx="2" fill="#5B3FD6"/>'+
      '<circle cx="24" cy="29" r="5" fill="#fff"/><circle cx="40" cy="29" r="5" fill="#fff"/>'+
      '<circle cx="25" cy="30" r="2.4" fill="#241E4E"/><circle cx="41" cy="30" r="2.4" fill="#241E4E"/>'+
      '<path d="M22 38h20" stroke="#241E4E" stroke-width="3" stroke-linecap="round"/>'+
      '<rect x="14" y="44" width="36" height="3" fill="#FF6BA6" opacity=".7"/>'+
      '<rect x="14" y="20" width="36" height="2" fill="#2FB39E" opacity=".6"/></svg>'; }
  function TB_BEE(size){ size=size||54;
    return '<svg viewBox="0 0 48 40" width="'+size+'" height="'+(size*0.83)+'" aria-label="the bee cannon">'+
      '<ellipse cx="14" cy="12" rx="11" ry="7" fill="#EDE9F7" opacity=".75"/>'+
      '<ellipse cx="34" cy="12" rx="11" ry="7" fill="#EDE9F7" opacity=".75"/>'+
      '<ellipse cx="24" cy="24" rx="15" ry="11" fill="#F0B429"/>'+
      '<path d="M16 15.5a15 11 0 0 0-1.2 17M26 13.6a15 11 0 0 0 0 20.8" stroke="#241E4E" stroke-width="4" fill="none"/>'+
      '<circle cx="36" cy="21" r="2.2" fill="#241E4E"/>'+
      '<path d="M34 6l3-4M40 9l4-3" stroke="#241E4E" stroke-width="2" stroke-linecap="round"/></svg>'; }
  W().TB_GLITCH=TB_GLITCH; W().TB_BEE=TB_BEE;

  /* wordHive, spotlightSimon and constellationConnect are NOT exported. Measured at
     40s each: wordHive and spotlightSimon asked for ZERO words, constellationConnect
     spoke one word seventeen times, which is repetition, not practice — and it had no
     keyboard path either. They are unreachable rather than deleted so the measurement
     that condemned them can be re-run against the source if the pacing is ever fixed. */
  W().SB_SAGA_ENGINES = { honeycombRun, keepFlying, beeGrandPrix, whackAMoth, spellShield, unscrambleStars, wordSnake, combCatcher, stageRhythm, typeBlaster };


  /* ---------- ENGINE G · SPOTLIGHT SIMON (memory sequence) ---------- */
  function spotlightSimon(host, opts, done){
    const diff=opts.diff||'medium';
    const CFG=calmCFG({easy:{seqs:4,start:3},medium:{seqs:6,start:3},hard:{seqs:6,start:4},champ:{seqs:7,start:5}}[diff]);
    const feed=wordFeed(CFG.seqs+5,w=>w&&w.w&&w.w.length>=CFG.start&&w.w.length<=9);
    let si=0, seq=null, showing=false, tapIdx=0, over=false, misses=0;
    const art=(window.SGART&&SGART.ready());
    const plate=art?SGART.plateForWorld(opts.world||'Stage'):'';
    // a colourful light-show: each tile owns a colour + a pentatonic note
    const TILECOL=['#FF6B8B','#FFC24D','#4FD08A','#4FB8F0','#B47CF0','#F08CD0','#66E0C8','#FF9E5E'];
    const TILEFREQ=[392,440,494,523,587,659,698,784];
    let _actx=null;
    function note(fr){ try{ _actx=_actx||new (window.AudioContext||window.webkitAudioContext)();
      const o=_actx.createOscillator(),g=_actx.createGain(); o.type='triangle'; o.frequency.value=fr;
      o.connect(g); g.connect(_actx.destination); const t=_actx.currentTime; g.gain.setValueAtTime(0.0001,t);
      g.gain.exponentialRampToValueAtTime(0.16,t+0.02); g.gain.exponentialRampToValueAtTime(0.0001,t+0.34);
      o.start(t); o.stop(t+0.36); }catch(e){} }
    function lightTile(t,hold){ if(!t) return; const c=t.dataset.col||'#FFD873';
      t.classList.add('lit'); t.style.background=c; t.style.boxShadow='0 0 26px 4px '+c+', inset 0 0 18px rgba(255,255,255,.5)';
      note(+t.dataset.fr||440); setTimeout(()=>{ t.classList.remove('lit'); t.style.background=''; t.style.boxShadow=''; }, hold||200); }
    host.innerHTML='<div class="sg-hud"><span id="sg-seq">Song 1/'+CFG.seqs+'</span><span id="sg-miss"></span></div>'+
      '<div class="sg-stage"><div class="sg-stage-bg">'+plate+'</div><div class="sg-tiles" id="sg-tiles"></div></div>'+
      '<div class="sg-simonprompt" id="sg-sp"></div><div id="sg-card"></div>';
    function newSeq(){
      if(si>=CFG.seqs){ over=true; finale(()=>done({win:true,score:CFG.seqs*120-misses*20,stars:misses===0?3:misses<=2?2:1})); return; }
      const w=feed.next(); seq={w:w.w.toLowerCase(),i:0,d:(w.d||w.def||'')};
      const tiles=host.querySelector('#sg-tiles'); tiles.innerHTML='';
      const letters=[...new Set(seq.w.split(''))];
      while(letters.length<8){ const c=String.fromCharCode(97+Math.floor(Math.random()*26)); if(!letters.includes(c)) letters.push(c); }
      letters.sort(()=>Math.random()-0.5).forEach((ch,idx)=>{ const t=document.createElement('button');
        t.className='sg-stile'; t.textContent=ch.toUpperCase(); t.dataset.ch=ch;
        t.dataset.col=TILECOL[idx%TILECOL.length]; t.dataset.fr=TILEFREQ[idx%TILEFREQ.length]; tiles.appendChild(t); });
      showSeq();
    }
    async function showSeq(){
      showing=true; tapIdx=0;
      host.querySelector('#sg-sp').textContent='👀 Watch the spotlights…';
      await new Promise(r=>setTimeout(r,700));
      // tempo ramps up as the songs get longer — a livelier show, round by round
      const lit=Math.max(230,520-si*36), gap=Math.max(90,160-si*10);
      for(const ch of seq.w){ if(over) return;
        const t=[...host.querySelectorAll('.sg-stile')].find(x=>x.dataset.ch===ch);
        lightTile(t,lit); await new Promise(r=>setTimeout(r,lit+gap)); }
      showing=false;
      host.querySelector('#sg-sp').textContent='🎯 Your turn — repeat it!';
    }
    function finale(cb){ // curtain call: run the marquee lights before the win banner
      const tiles=[...host.querySelectorAll('.sg-stile')]; if(!tiles.length){ cb(); return; }
      try{ if(typeof SGFX!=='undefined'&&SGFX.scrim) SGFX.scrim(host,'#FFE9A8'); }catch(_){}
      let k=0; const iv=setInterval(()=>{ lightTile(tiles[k%tiles.length],180); k++;
        if(k>=tiles.length*2){ clearInterval(iv); tiles.forEach(t=>lightTile(t,520)); setTimeout(cb,620); } }, 110);
    }
    host.querySelector('#sg-tiles').onclick=e=>{
      const t=e.target.closest('.sg-stile'); if(!t||showing||over) return;
      if(t.dataset.ch===seq.w[tapIdx]){ lightTile(t,200); tapIdx++;
        if(tapIdx>=seq.w.length) recall(); }
      else { misses++; host.querySelector('#sg-miss').textContent='✖'.repeat(misses);
        if(misses>=4){ over=true; done({win:false,score:si*60,stars:0}); return; }
        try{flash('Off-beat! Watch again…');}catch(_){} showSeq(); } };
    function recall(){ // the sequence WAS a word — now spell it blind
      const el=host.querySelector('#sg-card');
      el.innerHTML='<div class="sg-cardbox"><b>🌟 That was a word! Spell it from memory</b>'+meaningHTML({w:seq.w,d:seq.d})+'<div class="sg-inrow"><input id="sg-ci" autocomplete="off" autocapitalize="off"><button class="sg-rbtn go" id="sg-cgo">Sing</button></div></div>';
      el.style.display='grid';
      [...host.querySelectorAll('.sg-stile')].forEach(t=>t.style.visibility='hidden');
      const inp=el.querySelector('#sg-ci'); inp.focus();
      function submit(){
        const ok=inp.value.trim().toLowerCase()===seq.w; wlog({w:seq.w},ok);
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
    const CFG=calmCFG({easy:{n:8},medium:{n:12},hard:{n:12},champ:{n:14}}[diff]);
    /* fillWords, not one filtered pool() draw: a single batch can come back short (or
       empty) at bands where diffRange shifts the corpus to longer, rarer words, which
       is the hollow-field bug the other nine engines already avoid. */
    const words=fillWords(CFG.n,4,9).filter(w=>/^[a-z]+$/.test(w.w));
    let i=0, hints=3, over=false, speedBonus=0, wordStart=0;
    const usRound=[]; let usClean=true;    // the round's words, and whether this one was solved clean
    const art=(window.SGART&&SGART.ready());
    const plate=art?SGART.plateForWorld(opts.world||'Cosmos'):'';
    host.innerHTML='<div class="sg-hud"><span id="sg-c">⭐ 1/'+CFG.n+'</span><span id="sg-sp">⚡ 0</span><span id="sg-h">💡 ×3</span></div>'+
      '<div class="sg-sky"><div class="sg-sky-bg">'+plate+'</div><div class="sg-stars" id="sg-stars"></div><div class="sg-answer" id="sg-ans"></div></div>'+
      '<div class="sg-simonprompt"><button class="sg-hintbtn" id="sg-hint">💡 Zib\u2019s hint</button></div>'+
      '<div id="sg-card"></div>';   // this engine had nowhere to draw a result screen
    function scr(w){ const a=w.split(''); do{ a.sort(()=>Math.random()-0.5); }while(a.join('')===w); return a; }
    function newWord(){ 
      if(i>=words.length){ usFinish(true); return; }
      const w=words[i].w.toLowerCase(); const letters=scr(w); usClean=true;
      host.querySelector('#sg-c').textContent='⭐ '+(i+1)+'/'+CFG.n;
      const st=host.querySelector('#sg-stars'); st.innerHTML='';
      letters.forEach(ch=>{ const s=document.createElement('button'); s.className='sg-star'; s.textContent=ch.toUpperCase(); s.dataset.ch=ch; st.appendChild(s); });
      host.querySelector('#sg-ans').innerHTML=w.split('').map(()=>'<span class="sg-slot"></span>').join('');
      wordStart=Date.now();
      try{ say(words[i].w); }catch(e){}
    }
    let picked=[];
    function pickStar(s){ if(!s||s.disabled||over||i>=words.length) return;
      /* i can sit PAST the last word for the beat between a solve and the next
       word arriving (setTimeout), and a key or a tap in that window read words[i].w
       off undefined. `over` is not yet true there, so it is not enough on its own. */
      const w=words[i].w.toLowerCase();
      if(s.dataset.ch===w[picked.length]){ s.disabled=true; s.classList.add('set');
        const slot=host.querySelectorAll('.sg-slot')[picked.length]; slot.textContent=s.textContent; slot.classList.add('fill');
        picked.push(s.dataset.ch);
        if(picked.length===w.length){ usRound.push({w:w,ok:usClean});
          // speed bonus: solve fast for extra stars + a shooting-star pop
          const el=Date.now()-wordStart, bonus=el<3200?30:el<6000?15:0;
          if(bonus){ speedBonus+=bonus; host.querySelector('#sg-sp').textContent='⚡ '+speedBonus;
            try{ if(typeof sfx==='function') sfx('coin'); }catch(_){}
            try{flash('⚡ Fast solve! +'+bonus);}catch(_){} }
          else { try{flash('🌌 Constellation restored!');}catch(_){} }
          i++; picked=[]; setTimeout(newWord,600); } }
      else { usClean=false; s.classList.add('no'); setTimeout(()=>s.classList.remove('no'),300); } }
    host.querySelector('#sg-stars').onclick=e=>{ pickStar(e.target.closest('.sg-star')); };
    // TYPE to unscramble too: a letter key picks the matching star (keyboard = first-class)
    const usKey=e=>{ if(over) return; const t=e.target;
      if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable)) return;
      if(!/^[a-zA-Z]$/.test(e.key)) return;
      const ch=e.key.toLowerCase(), star=[...host.querySelectorAll('.sg-star')].find(x=>!x.disabled&&x.dataset.ch===ch);
      if(!star) return; e.preventDefault();
      pickStar(star); };
    addEventListener('keydown',usKey);
    /* This engine ended INSIDE newWord() with a bare done(): the last constellation
       lit and the child was handed straight back to the app's generic text card. */
    function usFinish(win){ if(over && usFinish.ran) return; over=true; usFinish.ran=true;
      const score=CFG.n*100+hints*50+speedBonus, stars=hints>=2?3:hints===1?2:1;
      const el=host.querySelector('#sg-card'); if(!el){ done({win,score,stars}); return; }
      el.innerHTML=SGUI.result({ win, stars, score, scoreLabel:'points', words:usRound,
        title:'Every constellation restored', sub: speedBonus?('⚡ '+speedBonus+' speed bonus'):'' });
      el.style.display='grid'; SGUI.bind(el);
      el.querySelector('#sg-again').onclick=()=>{ el.style.display='none'; el.innerHTML=''; unscrambleStars(host,opts,done); };
      el.querySelector('#sg-cont').onclick=()=>{ el.style.display='none'; el.innerHTML=''; done({win,score,stars}); }; }
    host.querySelector('#sg-hint').onclick=()=>{ if(hints<=0||over||i>=words.length) return; hints--;
      host.querySelector('#sg-h').textContent='💡 ×'+hints;
      const w=words[i].w.toLowerCase(); const need=w[picked.length];
      const s=[...host.querySelectorAll('.sg-star')].find(x=>!x.disabled&&x.dataset.ch===need);
      if(s){ s.classList.add('lit'); setTimeout(()=>s.classList.remove('lit'),900); } };
    newWord();
    return { destroy(){ over=true; removeEventListener('keydown',usKey); } };
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
    const CFG=calmCFG({easy:{n:6},medium:{n:8},hard:{n:10},champ:{n:12}}[diff]||{n:8});
    const words=fillWords(CFG.n,3,12);
    if(!words.length){ done({win:true,score:0,stars:1}); return; }
    const art=(window.SGART&&SGART.ready());
    const plate=art?SGART.plateForWorld(opts.world||'Meadow'):'';
    // canonical bee-fly hero + purple moth foe (consistent with the other games); SGART/emoji fallback
    const heroSvg='<img src="app-art/gart/bee-fly.webp" class="ss-sprite ss-img" alt="hero" '
      +"onerror=\"this.replaceWith(Object.assign(document.createElement('span'),{className:'ss-emoji',textContent:'\\uD83D\\uDC1D'}))\">";
    const foeSvg='<img src="app-art/gart/moth.webp" class="ss-sprite ss-img" alt="foe" '
      +"onerror=\"this.replaceWith(Object.assign(document.createElement('span'),{className:'ss-emoji',textContent:'\\uD83E\\uDD8B'}))\">";
    host.innerHTML=
      '<div class="ss-wrap">'+
        '<div class="ss-bg" id="ss-bg">'+plate+'</div>'+
        '<div class="ss-stage">'+
          '<div class="ss-hero">'+heroSvg+'</div>'+
          '<div class="ss-foe" id="ss-foe">'+foeSvg+'</div>'+
        '</div>'+
        '<div class="ss-meterwrap"><div class="ss-meter"><div class="ss-meter-fill" id="ss-fill"></div></div><span class="ss-mlbl" id="ss-mlbl">0 / '+words.length+'</span><span class="ss-lives" id="ss-lives"></span></div>'+
        '<div class="ss-panel">'+
          '<div class="ss-prompt"><button class="ss-say" id="ss-say" aria-label="Hear the word">'+iconSVG('volume',18)+'</button><span class="ss-hint" id="ss-hint"></span><button class="ss-skip" id="ss-skip" title="Skip this word (costs a life)">⏭ Skip</button></div>'+
          '<div class="ss-slots" id="ss-slots"></div>'+
          '<div class="ss-key" id="ss-key"></div>'+
        '</div>'+
      '</div>'+
      '<div id="sg-card"></div>';   // this engine had nowhere to draw a result screen
    let i=0, typed='', over=false, misses=0, ssCombo=0, lives=3; const MAXLIVES=5;
    const scRound=[]; let scClean=true;    // the round's words, and whether this one went clean
    const bg=host.querySelector('#ss-bg'), foeEl=host.querySelector('#ss-foe'), heroEl=host.querySelector('.ss-hero'),
          fill=host.querySelector('#ss-fill'), slotsEl=host.querySelector('#ss-slots'), mlbl=host.querySelector('#ss-mlbl');
    const livesEl=host.querySelector('#ss-lives');
    function renderLives(){ if(livesEl) livesEl.textContent='❤'.repeat(Math.max(0,lives)); }
    renderLives();
    if(foeEl) foeEl.style.transition='right .6s cubic-bezier(.3,1.4,.5,1), transform .3s';
    if(heroEl) heroEl.style.transition='left .6s cubic-bezier(.3,1.4,.5,1)';
    function grey(p){ bg.style.filter='grayscale('+(0.92*(1-p)).toFixed(2)+') brightness('+(0.9+0.12*p).toFixed(2)+')'; }
    grey(0);
    const rows=['qwertyuiop','asdfghjkl','zxcvbnm'];
    host.querySelector('#ss-key').innerHTML=rows.map(r=>'<div class="ss-krow">'+r.split('').map(ch=>'<button class="ss-kb" data-k="'+ch+'">'+ch+'</button>').join('')+'</div>').join('')+
      '<div class="ss-krow"><button class="ss-kb ss-kwide" data-k="back">⌫</button><button class="ss-kb ss-kwide ss-kgo" data-k="enter">Enter</button></div>';
    /* renderSlots is also called from a setTimeout 420ms after a wrong answer, which can
       land AFTER the last word was solved and i walked past the end. The guards on type /
       commit / skipWord do not cover a callback already in flight. */
    function renderSlots(flashWrong){ if(i>=words.length) return; const w=words[i].w.toLowerCase();
      slotsEl.innerHTML=w.split('').map((ch,ix)=>{ const on=ix<typed.length;
        return '<span class="ss-slot'+(on?' fill':'')+(flashWrong?' wrong':'')+'">'+(on?typed[ix].toUpperCase():'')+'</span>'; }).join(''); }
    function newWord(){ if(i>=words.length){ over=true; return win(); }
      typed=''; scClean=true; const w=words[i];
      /* meaningText masks the headword; using w.d raw printed the answer in the
         hint of a game whose whole task is to spell it */
      const _mt=meaningText(w);
      host.querySelector('#ss-hint').textContent=_mt?('“'+_mt.slice(0,88)+'”'):'Spell the word you hear';
      renderSlots(); try{ say(w.w); }catch(e){} }
    function sparkle(){ const fx=document.createElement('div'); fx.className='ss-burst'; foeEl.appendChild(fx); setTimeout(()=>fx.remove(),720); }
    function commit(){ if(over||i>=words.length) return; const w=words[i].w.toLowerCase();
      if(typed.toLowerCase()===w){ scRound.push({w:w,ok:scClean}); i++; const p=i/words.length; ssCombo++;
        fill.style.width=Math.round(p*100)+'%'; grey(p); mlbl.textContent=i+' / '+words.length;
        // the duel: the moth is driven back toward the edge and the hero advances as colour returns
        try{ if(foeEl) foeEl.style.right=(4+p*24)+'%'; if(heroEl) heroEl.style.left=(4+p*15)+'%'; }catch(_){}
        foeEl.classList.remove('recoil'); void foeEl.offsetWidth; foeEl.classList.add('recoil'); sparkle();
        try{ if(typeof sfx==='function') sfx('correct'); }catch(e){}
        try{ flash(ssCombo>=2?('🔥 '+ssCombo+'× — '+w.toUpperCase()+' drives it back!'):('✨ '+w.toUpperCase()+' — the colour rushes back!')); }catch(e){}
        // milestone: every 3rd word restored wins a life back
        if(i%3===0 && i<words.length && lives<MAXLIVES){ lives++; renderLives(); try{ flash('❤ Milestone — extra life!'); }catch(e){} }
        /* CLOSE THE ROUND THE INSTANT IT IS WON, not 700ms later when newWord() gets
           round to noticing. For that beat `i` sat past the last word while `over` was
           still false, so every `if(over) return` guard in the engine was open and any
           key, tap or in-flight callback read words[i].w off undefined. Three separate
           call sites were patched individually before it was clear they were all the
           same 700ms window. */
        if(i>=words.length) over=true;
        setTimeout(newWord,700);
      } else { scClean=false; misses++; typed=''; ssCombo=0; lives--; renderLives();
        renderSlots(true); setTimeout(()=>renderSlots(),420);
        slotsEl.classList.remove('shake'); void slotsEl.offsetWidth; slotsEl.classList.add('shake');
        foeEl.classList.remove('gloat'); void foeEl.offsetWidth; foeEl.classList.add('gloat');
        if(lives<=0){ return lose(); }
        try{ flash('💔 The Unspelling holds — listen again.'); }catch(e){} try{ say(words[i].w); }catch(e){}
      } }
    function skipWord(){ if(over||i>=words.length) return;
      if(lives<=1){ try{ flash('Not enough lives to skip — spell it!'); }catch(e){} return; }
      lives--; renderLives(); ssCombo=0; typed='';
      scRound.push({w:words[i].w,ok:false}); scClean=true;
      words.push(words.splice(i,1)[0]);   // the skipped word waits at the back — you WILL meet it again
      try{ flash('⏭ Skipped — it will come back around. −❤'); }catch(e){}
      newWord(); }
    /* Both endings called done() and left it there: the finale played and the child
       was handed back to the app's generic text card, never seeing the words. */
    function scEnd(win,score,stars){
      const el=host.querySelector('#sg-card'); if(!el){ done({win,score,stars}); return; }
      el.innerHTML=SGUI.result({ win, stars, score, scoreLabel:'points', words:scRound,
        title: win?'The scene is whole again':'The colour fades' });
      el.style.display='grid'; SGUI.bind(el);
      el.querySelector('#sg-again').onclick=()=>{ el.style.display='none'; el.innerHTML=''; spellScene(host,opts,done); };
      el.querySelector('#sg-cont').onclick=()=>{ el.style.display='none'; el.innerHTML=''; done({win,score,stars}); }; }
    function lose(){ over=true; removeEventListener('keydown',kb);
      try{ flash('🌑 The colour fades… the moth wins this round.'); }catch(e){}
      setTimeout(()=>scEnd(false, i*60, 0), 700); }
    function type(ch){ if(over||i>=words.length) return;   /* i can sit PAST the last word for the beat between a solve and the next
       word arriving (setTimeout), and a key or a tap in that window read words[i].w
       off undefined. `over` is not yet true there, so it is not enough on its own. */
      const w=words[i].w.toLowerCase();
      if(typed.length<w.length){ typed+=ch; renderSlots(); if(typed.length===w.length) setTimeout(commit,180); } }
    function back(){ if(over) return; typed=typed.slice(0,-1); renderSlots(); }
    const kb=e=>{ if(over) return; const k=e.key;
      if(/^[a-zA-Z]$/.test(k)){ type(k.toLowerCase()); e.preventDefault(); }
      else if(k==='Backspace'){ back(); e.preventDefault(); }
      else if(k==='Enter'){ if(!over&&i<words.length&&typed.length===words[i].w.length) commit(); e.preventDefault(); } };
    addEventListener('keydown',kb);
    host.querySelector('#ss-key').onclick=e=>{ const bt=e.target.closest('.ss-kb'); if(!bt) return;
      const k=bt.dataset.k; if(over||i>=words.length) return;
      if(k==='back') back(); else if(k==='enter'){ if(typed.length===words[i].w.length) commit(); } else type(k); };
    host.querySelector('#ss-say').onclick=()=>{ try{ if(i<words.length) say(words[i].w); }catch(e){} };
    host.querySelector('#ss-skip').onclick=skipWord;
    function win(){ removeEventListener('keydown',kb);
      // finale: the moth is banished off-screen and the world snaps to full colour
      try{ grey(1); if(bg) bg.style.filter='none';
        if(foeEl){ foeEl.style.transition='right .8s ease-in, transform .8s ease-in, opacity .8s'; foeEl.style.right='-30%'; foeEl.style.transform='rotate(40deg) scale(.7)'; foeEl.style.opacity='0'; }
        if(heroEl) heroEl.style.left='42%';
        flash('🏆 The scene is whole again — the moth is banished!');
      }catch(e){}
      setTimeout(()=>scEnd(true, words.length*100-misses*15, misses===0?3:misses<=2?2:1), 900); }
    newWord();
    return { destroy(){ over=true; removeEventListener('keydown',kb); } };
  }
  W().SB_SAGA_ENGINES = Object.assign(W().SB_SAGA_ENGINES||{}, { spellScene });


  /* The story controller (map / board / dialogue beats / CH_META / ACTS) was removed
     with the "Great Unspelling" story. The 14 engines above ARE the arcade now, played
     straight via app3 arcadePlay; SB_SAGA_ENGINES and the shared SGFX kit stay. */

})();
