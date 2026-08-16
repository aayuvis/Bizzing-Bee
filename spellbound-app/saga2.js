/* Bizzing Bee — SAGA v2 · "Bizzy and the Great Unspelling" · Act I engines.
   Placeholder vector art (swaps for Claude Design drops). Words via gameWordsD/pickFresh; audio via voice/d + say(). */
(function(){
  const W=()=>window;
  function pool(n){ try{ const l=pickFresh(gameWordsD(),n)||[];
    l.forEach(w=>{ try{ if(typeof logGameWord==='function'&&w&&w.w) logGameWord(nkey(w.w)); }catch(e){} });
    return l; }catch(e){ return []; } }
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
  function meaningHTML(wobj){ const m=meaningText(wobj); return m?'<div class="sg-cardmean">💡 '+esc(m)+'</div>':''; }
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
      let svg=window.SB_AVATAR(id,512,{outline:false});   // hi-res raster: crisp on DPR canvases (was 120 - pixelated)
      if(!svg) { _avCache[id]=false; return null; }
      if(!/xmlns=/.test(svg)) svg=svg.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ');
      const img=new Image(512,512);
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
  function opt_size(t){ return String(t||'').length>10?20:26; }

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
    const diff=opts.diff||'medium';
    const world=opts.world||'meadow';   // rich Claude Design backdrop plate
    // Gameplay hardness scales the MAZE itself: bigger grid at higher levels, and a
    // staggered honeycomb wall pattern at Champion. (Spelling words still match the speller.)
    const DIM={easy:[11,9,false],medium:[13,11,false],hard:[15,11,false],champ:[17,13,true]}[diff]||[13,11,false];
    const COLS=DIM[0], ROWS=DIM[1], HEX=DIM[2];
    const CELL=Math.max(24,Math.min(104, Math.floor(Math.min(innerWidth-16,1600)/COLS), Math.floor((innerHeight-208)/ROWS)));
    function makeMaze(cols,rows,hex){ const M=[]; // 0 wall · 1 dot · 2 empty
      for(let r=0;r<rows;r++){ const row=[];
        for(let c=0;c<cols;c++){
          if(r===0||r===rows-1||c===0||c===cols-1) row.push(0);        // border wall
          else if(r%2===0){ const off=hex?((r/2)%2):0; row.push(((c+off)%2===0)?0:1); } // pillar row (staggered when hex)
          else row.push(1);                                             // open corridor
        } M.push(row); } return M; }
    const MAZE=makeMaze(COLS,ROWS,HEX);
    const CFG={easy:{moths:2,speed:2.0,target:900,time:150},medium:{moths:3,speed:2.6,target:1200,time:180},
               hard:{moths:4,speed:3.1,target:1500,time:180},champ:{moths:5,speed:3.6,target:1800,time:180}}[diff];
    // bee starts on the centre corridor row (odd row = always open)
    let scr=Math.floor(ROWS/2); if(scr%2===0) scr=Math.max(1,scr-1); let scc=Math.floor(COLS/2);
    try{ if(MAZE[scr][scc]===0) scc=Math.max(1,scc-1); MAZE[scr][scc]=2; }catch(e){}
    let bee={c:scc,r:scr,px:scc,py:scr,dir:[0,0],want:[0,0]};
    let moths=[], score=0, lives=3, t=CFG.time, jelly=null, flee=0, flower=null, flowerT=5, card=null, over=false, fx=[];
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
      el.innerHTML='<div class="sg-cardbox"><b>🌼 Spell it to bloom — earn time &amp; coins!</b><button class="sg-cardw" id="sg-cw">'+iconSVG('volume',18)+'</button>'+meaningHTML(w)+'<div class="sg-inrow"><input id="sg-ci" autocomplete="off" autocapitalize="off"><button class="sg-rbtn go" id="sg-cgo">Bloom</button></div><div id="sg-ct">12</div></div>';
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
            SGFX.spark(fx,bc*CELL+CELL/2,br*CELL+CELL/2,4,['#FFE9A8','#F0B429'],{speed:1.9,decay:0.06,rx:2,ry:2.6});
            if(dots<=0){ over=true; finish(true); return; } }          // maze cleared → win the round
          if(J.c===bc&&J.r===br&&!J.got){ J.got=true; flee=6; }
          if(flower && Math.round(flower.c)===bc && Math.round(flower.r)===br){ flower=null; spellCard(); }
          moths.forEach(m=>{ if(Math.abs(m.px-bee.px)<0.5&&Math.abs(m.py-bee.py)<0.5){
            if(flee>0){ score+=50; m.px=6;m.py=1; SGFX.ring(fx,m.px*CELL+CELL/2,m.py*CELL+CELL/2,'150,180,255',{grow:9}); }
            else { lives--; shake.hit(11); trail.clear();
              SGFX.spark(fx,bee.px*CELL+CELL/2,bee.py*CELL+CELL/2,14,['#E0553C','#FF9C7A'],{speed:4});
              bee.px=6;bee.py=5;bee.dir=[0,0];
              if(lives<=0){ over=true; finish(false); } } } });
          dotTimer+=dt/1000; if(dotTimer>=1){ dotTimer=0; t--; flowerT--; if(flowerT<=0&&!flower){ flowerT=9;
            let c,r,tries=0; do{ c=1+Math.floor(Math.random()*(COLS-2)); r=1+Math.floor(Math.random()*(ROWS-2)); }while(!open(c,r)&&++tries<50);
            flower={c,r}; }
            if(Math.random()<0.16 && moths.length<CFG.moths+6){ moths.push({c:scc,r:1,px:scc,py:1,dir:[[1,0],[-1,0]][Math.floor(Math.random()*2)]}); }  // random moth spam
            if(t<=0){ over=true; finish(score>=CFG.target); } }
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
          g.addColorStop(0,'rgba(255,214,122,.96)'); g.addColorStop(.55,'rgba(233,168,32,.94)'); g.addColorStop(1,'rgba(168,113,14,.94)');
          cx.fillStyle=g; SGFX.hex(cx,px,py,CELL*0.53); cx.fill(); cx.restore();
          cx.strokeStyle='rgba(255,243,206,.55)'; cx.lineWidth=1.4; SGFX.hex(cx,px,py,CELL*0.53); cx.stroke();
          cx.fillStyle='rgba(120,72,8,.34)'; SGFX.hex(cx,px,py,CELL*0.30); cx.fill();
        }
        else if(v===1) SGFX.orb(cx,px,py,CELL*0.10,'#FFF3C4','#F0B429',T/420+(c+r)*0.7);
      }
      if(!J.got) SGFX.orb(cx,J.c*CELL+CELL/2,J.r*CELL+CELL/2,CELL*0.24,'#FFFFFF','#FFC93F',T/260);
      if(flower){ const fi=sgImg('env-meadow'); cx.font=(CELL*0.72)+'px serif'; cx.fillText('🌼',flower.c*CELL+CELL*0.14,flower.r*CELL+CELL*0.8); }
      // moths — the delivered grey-moth sprite (blue glow when edible); vector moth as fallback
      const mi=sgImg('grey-moth'), _ph=Date.now()/90;
      moths.forEach((m,i)=>{ const mx=m.px*CELL, my=m.py*CELL;
        if(flee>0){ cx.fillStyle='rgba(120,150,255,.45)'; cx.beginPath(); cx.arc(mx+CELL/2,my+CELL/2,CELL*0.44,0,7); cx.fill(); }
        let md=false; if(mi){ try{ const s=CELL*0.96, bob=Math.sin(_ph+i)*CELL*0.03; cx.drawImage(mi,mx+(CELL-s)/2,my+(CELL-s)/2+bob,s,s); md=true; }catch(e){} }
        if(!md) drawMoth(cx,mx+CELL*0.04,my+CELL*0.04,CELL*0.92,flee>0,_ph+i); });
      // the bee leaves honey behind her, so motion has a direction you can see
      trail.push(bee.px*CELL+CELL/2, bee.py*CELL+CELL/2, 16);
      trail.draw(cx,'255,205,80',CELL*0.30);
      // bee — the delivered Bizzy sprite (flips with direction); avatar then blob as fallback
      const bi=sgImg('bizzy-side-fly')||avImg(heroAv())||avImg('bizzy'), bx=bee.px*CELL, by=bee.py*CELL; let beeDrew=false;
      if(bi){ try{ const bob=1+0.05*Math.sin(Date.now()/110), s=CELL*1.12*bob;
        cx.save(); cx.translate(bx+CELL/2,by+CELL/2);
        if(bee.dir[0]<0) cx.scale(-1,1);              // flip when flying left
        cx.drawImage(bi,-s/2,-s/2,s,s); cx.restore(); beeDrew=true; }catch(e){ try{cx.restore();}catch(_){} } }
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
    const Wd=Math.min(innerWidth-8,1600), Ht=Math.max(360,innerHeight-104);
    const diff=opts.diff||'medium', world=opts.world||'opensky';
    // Roomier gaps + gentler speeds — the towers were punishingly tight before.
    const CFG={easy:{gap:245,speed:1.95,pots:8},medium:{gap:220,speed:2.25,pots:10},
               hard:{gap:195,speed:2.6,pots:10},champ:{gap:175,speed:2.95,pots:12}}[diff];
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
    const feed=wordFeed(CFG.pots+6);
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
    const flap=e=>{ if(e.key!==' ')return; bee.vy=-5.4; e.preventDefault&&e.preventDefault(); };
    const pdown=e=>{ if(e.target.closest&&e.target.closest('#sg-card,.sg-howto'))return; holding=true; if(bee.vy>-2.4) bee.vy=-3.2; e.preventDefault&&e.preventDefault(); };
    const pup=()=>{ holding=false; };
    addEventListener('keydown',flap);
    host.addEventListener('pointerdown',pdown); addEventListener('pointerup',pup); addEventListener('pointercancel',pup);
    function spawn(){ const g=CFG.gap, y=60+Math.random()*(Ht-120-g); obs.push({x:Wd+30,y,g}); }
    function spawnMoth(){ const big=Math.random()<0.14;
      moths.push({x:Wd+40,y:60+Math.random()*(Ht-140),ph:Math.random()*7,amp:14+Math.random()*26,sp:CFG.speed*(0.9+Math.random()*0.5),s:big?54:38,big}); }
    function spawnCoins(){ const y0=70+Math.random()*(Ht-200), up=Math.random()<0.5;
      for(let i=0;i<5;i++) coins.push({x:Wd+30+i*34, y:y0+(up?-1:1)*Math.sin(i/4*Math.PI)*42, ph:i*0.7}); }
    function spawnHeart(){ hearts.push({x:Wd+30,y:80+Math.random()*(Ht-200),ph:0}); }
    function spellStop(){
      const w=feed.next(); card={w};
      const el=host.querySelector('#sg-card');
      el.innerHTML='<div class="sg-cardbox"><b>🍯 Honey pot! Spell to bank it</b><button class="sg-cardw" id="sg-cspk">'+iconSVG('volume',18)+'</button>'+meaningHTML(w)+'<div class="sg-inrow"><input id="sg-ci" autocomplete="off" autocapitalize="off"><button class="sg-rbtn go" id="sg-cgo">Bank</button></div></div>';
      el.style.display='grid'; try{ say(w.w); }catch(e){}
      const inp=el.querySelector('#sg-ci'); inp.focus();
      function submit(){ const ok=inp.value.trim().toLowerCase()===w.w.toLowerCase();
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
      if(holding) bee.vy-=0.42;
      if(GRACE){ bee.vy*=0.9; bee.y+=bee.vy; bee.y=Math.max(30,Math.min(Ht-40,bee.y)); }
      else { spawnT+=dt/1000; bee.vy+=0.10; bee.y+=bee.vy; }   // gentler gravity for easier control
      if(!gate){
        if(spawnT>2.4){ spawnT=0; spawn(); }                    // more room between towers
        if(potT<=0&&!pot){ potT=8; pot={x:Wd+30,y:80+Math.random()*(Ht-220)}; }
        if(mothT<=0){ mothT=4.8+Math.random()*3.2; spawnMoth(); } // fewer moths
        if(coinT<=0){ coinT=6+Math.random()*5; spawnCoins(); }
        if(heartT<=0){ heartT=13+Math.random()*8; if(lives<MAXLIVES) spawnHeart(); }
      } else gate.x-=CFG.speed;
      obs.forEach(o=>o.x-=CFG.speed); if(pot) pot.x-=CFG.speed;
      moths.forEach(m=>{ m.x-=m.sp; m.ph+=dt/130; m.y+=Math.sin(m.ph)*0.8*(m.amp/22); });
      coins.forEach(c=>{ c.x-=CFG.speed; c.ph+=dt/240; });
      hearts.forEach(h=>{ h.x-=CFG.speed*0.8; h.ph+=dt/300; });
      obs=obs.filter(o=>o.x>-40); moths=moths.filter(m=>m.x>-70); coins=coins.filter(c=>c.x>-30); hearts=hearts.filter(h=>h.x>-30);
      // collisions
      bee.y=Math.max(24,Math.min(Ht-26,bee.y));            // sky edges are soft — they never hurt
      if(bee.y<=24&&bee.vy<0) bee.vy=0; if(bee.y>=Ht-26&&bee.vy>0) bee.vy=0;
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
      const wf=Math.sin(t*26), s=1;
      cx.save(); cx.translate(x,y); cx.rotate(tilt);
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
      const av=avImg(heroAv());
      if(av){ try{ const bob=Math.sin(t*7)*1.3;
        cx.save(); cx.beginPath(); cx.arc(-4,-16+bob,10,0,7); cx.clip();
        cx.drawImage(av,-14,-26+bob,20,20); cx.restore();
        cx.strokeStyle='rgba(60,40,10,.5)'; cx.lineWidth=1.2;
        cx.beginPath(); cx.arc(-4,-16+bob,10,0,7); cx.stroke(); }catch(e){ try{cx.restore();}catch(_){}} }
      cx.restore();
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
    function finish(win){ cleanup();
      if(coinsGot){ try{ if(typeof addCoins==='function') addCoins(coinsGot); }catch(e){} }
      done({win,score:banked*100+coinsGot*5,stars:win?(lives>=3?3:lives===2?2:1):0}); }
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


  /* ---------- ENGINE C · BEE GRAND PRIX (pseudo-3D arcade racer) ----------
     Kids race a real perspective track. Spelling words correctly earns POWER-UPS,
     each doing something different (rocket, turbo, oil slick, gust, honey, shield).
     Steer to hug the racing line and dodge oil patches. First past the flag wins. */
  function beeGrandPrix(host, opts, done){
    // Fill the play area (the steer/hold controls are absolutely overlaid on the canvas,
    // so the canvas can take almost the whole overlay height — no dark letterbox below).
    const Wd=Math.min(innerWidth-8,1600), Ht=Math.max(340,Math.min(innerHeight-96,Math.round(Wd*0.92)));
    const diff=opts.diff||'medium';
    // one epic point-to-point run - length ~= minutes of driving; boxes pace the spelling
    const CFG=calmCFG({easy:{len:1800,laps:2,rivals:3,rival:0.84,haz:0.014,boxEvery:280},
               medium:{len:2300,laps:2,rivals:4,rival:0.90,haz:0.026,boxEvery:300},
               hard:{len:2800,laps:2,rivals:4,rival:0.96,haz:0.04,boxEvery:320},
               champ:{len:3300,laps:2,rivals:4,rival:1.02,haz:0.055,boxEvery:340}}[diff]);
    host.innerHTML=
      '<div class="sg-racehud"><div class="sg-rh-row">'+
        '<span class="sg-rh-place" id="sg-pos">1st <i>/ '+(CFG.rivals+1)+'</i></span>'+
        '<span class="sg-rh-lap" id="sg-lap">Lap 1/'+CFG.laps+'</span>'+
        '<div class="sg-posbar" id="sg-pb"><i class="sg-pb-road"></i><b class="sg-pb-flag">🏁</b></div>'+
        '<span class="sg-rh-spd" id="sg-spd"></span></div></div>'+
      '<div class="sg-race3d"><canvas id="sg-cv"></canvas>'+
      '<button class="sg-hold" id="sg-hold" aria-label="Use power-up"><span class="sg-hold-empty">?</span></button>'+
      '<div class="sg-steer"><button class="sg-sbtn" data-s="-1" aria-label="Steer left">◀</button><button class="sg-sbtn" data-s="1" aria-label="Steer right">▶</button></div></div>'+
      '<div id="sg-card"></div>';
    const cv=host.querySelector('#sg-cv');
    const dpr=Math.min(2,window.devicePixelRatio||1);
    cv.width=Math.round(Wd*dpr); cv.height=Math.round(Ht*dpr);
    cv.style.width=Wd+'px'; cv.style.height=Ht+'px';
    const cx=cv.getContext('2d'); cx.setTransform(dpr,0,0,dpr,0,0);

    /* ---- pseudo-3D track ---- */
    const segLen=200, roadW=2200, rumbleLen=3, drawDist=160, camH=5200, fov=100;   // high camera — sit well above the world, looking down onto the track
    // Elevated chase-cam: taller camera + a horizon lifted above mid-screen so you
    // look DOWN onto more of the track ahead instead of skimming it at ground level.
    const horizonY=Math.round(Ht*0.30);   // horizon high up-screen: more track visible from above
    const camDepth=1/Math.tan((fov/2)*Math.PI/180);
    sgTexPreload(['kart','kart-red','oil','item-box','gp-sky','tree']);   // Gemini kart/hazard/scene art, decoded before first frame
    const LIGHT={road:'#6C6C74',grass:'#7BC169',rumble:'#EDEDED',lane:'#FFFFFF'};
    const DARK ={road:'#64646C',grass:'#72B461',rumble:'#C7413F',lane:''};
    const segs=[];
    const lastY=()=>segs.length?segs[segs.length-1].p2.world.y:0;
    function addSeg(curve,y){ const n=segs.length;
      segs.push({index:n, curve:curve,
        p1:{world:{y:lastY(),z:n*segLen},camera:{},screen:{}},
        p2:{world:{y:y,z:(n+1)*segLen},camera:{},screen:{}},
        color:(Math.floor(n/rumbleLen)%2)?DARK:LIGHT, sprites:[]}); }
    const eI=(a,b,p)=>a+(b-a)*Math.pow(p,2), eIO=(a,b,p)=>a+(b-a)*(-Math.cos(p*Math.PI)/2+0.5);
    function road(enter,hold,leave,curve,hill){ const sY=lastY(), eY=sY+hill*segLen, tot=enter+hold+leave; let i;
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
    let si=0; while(segs.length<CFG.len){ SECTORS[si%SECTORS.length](); si++; }
    while(segs.length%rumbleLen!==0) addSeg(0,lastY());
    const trackLen=segs.length*segLen, TOTAL=trackLen*CFG.laps, FINVIS=trackLen-segLen*8;
    for(let n=10;n<segs.length;n+=6){ const side=(n%12<6)?-1:1; segs[n].sprites.push({kind:'flora',off:side*(1.15+Math.random()*0.9)}); }
    const hazards=[]; for(let n=60;n<segs.length-40;n+=Math.floor(20+Math.random()*16)){ if(Math.random()<CFG.haz*8){ hazards.push({seg:n,off:(Math.random()*1.6-0.8)}); } }
    const items=[]; for(let n=70;n<segs.length-60;n+=Math.floor(CFG.boxEvery*(0.8+Math.random()*0.5))){ items.push({seg:n,off:(Math.random()*1.1-0.55),gone:false,k:Math.random()*6}); }

    /* ---- racers: the villains ---- */
    const maxV=segLen*46, accel=maxV/4.6, offDecel=-maxV/1.6, offLimit=maxV/3.2, centri=0.32;
    let pos=0, playerX=0, v=0, over=false, mode='howto', lap=1, hudT=1; // howto -> count -> race -> spell -> done
    let boostT=0, boostMul=1, shieldT=0, spinFlashT=0, countT=0, finishedRivals=0;
    const heroKart=heroAv();
    const VILL=[
      {name:'The Smudge',col:'#8B8B96',glyph:'🦋',sprite:'smudge-swarm'},
      {name:'Glitch',    col:'#7B5CE0',glyph:'👾',sprite:'glitch-corrupt-glee'},
      {name:'Vex',       col:'#C9A227',glyph:'🐝',sprite:'vex-full'},
      {name:'The Bramble',col:'#4A7A3A',glyph:'🌿',sprite:null}];
    const rivals=[];
    for(let i=0;i<CFG.rivals;i++){ const vd=VILL[i%VILL.length];
      rivals.push({z:segLen*6*(i+1), x:(i-1.2)*0.5, spd:maxV*CFG.rival*(0.92+i*0.035),
        name:vd.name, col:vd.col, glyph:vd.glyph, sprite:vd.sprite, spin:0, slow:0, fin:false}); }

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
    const feed=wordFeed(26);
    function spellGate(){
      mode='spell';
      const w=feed.next();
      const p=POWERS[Math.floor(Math.random()*POWERS.length)];
      const el=host.querySelector('#sg-card');
      el.innerHTML='<div class="sg-cardbox"><b>🎁 Item box! Spell to unlock the power-up</b>'+
        '<button class="sg-cardw" id="sg-cspk">'+iconSVG('volume',18)+'</button>'+meaningHTML(w)+
        '<div class="sg-inrow"><input id="sg-ci" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"><button class="sg-rbtn go" id="sg-cgo">Unlock</button></div></div>';
      el.style.display='grid'; try{ say(w.w); }catch(e){}
      const inp=el.querySelector('#sg-ci'); try{inp.focus();}catch(e){}
      function submit(){ const ok=inp.value.trim().toLowerCase()===w.w.toLowerCase();
        el.style.display='none'; el.innerHTML='';
        if(ok){ held=p; renderHold();
          const uc=host.querySelector('#sg-card');
          uc.innerHTML='<div class="sg-cardbox sg-unlock"><span class="sg-unlock-ic">'+PWSVG[p.id]+'</span><b>'+p.name+' unlocked!</b><i>tap the slot (or Space) to use it</i></div>';
          uc.style.display='grid';
          setTimeout(()=>{ uc.style.display='none'; uc.innerHTML=''; resume(); },1300);
        } else { try{flash('The box fizzles… next one is coming!');}catch(_){ } resume(); } }
      inp.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); submit(); } };
      el.querySelector('#sg-cgo').onclick=submit;
      el.querySelector('#sg-cspk').onclick=()=>{ try{ say(w.w); }catch(e){} };
    }
    function resume(){ countT=1.0; mode='count'; }

    /* ---- steering ---- */
    let steer=0;
    const setSteer=s=>{ steer=s; };
    host.querySelectorAll('.sg-sbtn').forEach(b=>{ const s=+b.dataset.s;
      b.addEventListener('pointerdown',e=>{ setSteer(s); e.preventDefault&&e.preventDefault(); });
      b.addEventListener('pointerup',()=>setSteer(0)); b.addEventListener('pointerleave',()=>setSteer(0)); });
    const kd=e=>{ if(e.target&&e.target.tagName==='INPUT') return;
      if(e.key==='ArrowLeft'||e.key==='a'){ setSteer(-1); e.preventDefault(); }
      else if(e.key==='ArrowRight'||e.key==='d'){ setSteer(1); e.preventDefault(); }
      else if(e.key===' '){ fireHeld(); e.preventDefault(); } };
    const ku=e=>{ if(e.key==='ArrowLeft'||e.key==='a'||e.key==='ArrowRight'||e.key==='d') setSteer(0); };
    addEventListener('keydown',kd); addEventListener('keyup',ku);
    cv.addEventListener('pointerdown',e=>{ if(mode!=='race'&&mode!=='count') return; const r=cv.getBoundingClientRect(); setSteer((e.clientX-r.left)<Wd/2?-1:1); });
    cv.addEventListener('pointerup',()=>setSteer(0)); cv.addEventListener('pointerleave',()=>setSteer(0));

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
    function drawKart(px,baseY,w,col,rider,o){ o=o||{}; const h=w*0.82;
      cx.save(); cx.fillStyle='rgba(0,0,0,.32)'; cx.beginPath(); cx.ellipse(px,baseY-(o.kart?w*0.02:1),w*0.64,w*0.17,0,0,7); cx.fill(); cx.restore();
      if(o.boost){ const fl=w*(0.55+Math.random()*0.3); const fg=cx.createLinearGradient(0,baseY-h*0.2,0,baseY+fl);
        fg.addColorStop(0,'#FFF6C0'); fg.addColorStop(.45,'#FF9E3D'); fg.addColorStop(1,'rgba(255,80,40,0)');
        cx.fillStyle=fg; cx.beginPath(); cx.moveTo(px-w*0.24,baseY-h*0.2); cx.quadraticCurveTo(px,baseY+fl,px+w*0.24,baseY-h*0.2); cx.closePath(); cx.fill(); }
      let hd=w*0.55;
      let riderY;                          // top-left Y for the rider head, set per kart art
      const tex = o.kart ? sgTex(o.kart) : null;
      if(tex){
        // Gemini rear-view kart sprite, sized to the primitive kart's footprint (~1.15w
        // incl. wheels) so it doesn't balloon; rider seated in the cockpit.
        const kw=w*0.92, kh=kw*(tex.height/tex.width);
        // tail-on rear-view sprite: wheels + exhaust sit at the sprite's bottom edge, so
        // its bottom aligns to the ground line (tiny overlap so it doesn't hover).
        try{ cx.drawImage(tex, px-kw/2, baseY-kh*0.97, kw, kh); }catch(e){}
        hd=0; riderY=baseY;   // driver is hidden behind the seat-back — no rider drawn
      } else {
        // primitive fallback: wheels + gradient body (kept for when the sprite is absent)
        const ww=w*0.30, wh=h*0.54, wy=baseY-wh;
        [-1,1].forEach(s=>{ const wx=px+s*w*0.42;
          cx.fillStyle='#17151b'; rrp(wx-ww/2,wy,ww,wh,ww*0.34); cx.fill();
          cx.fillStyle='#39363f'; rrp(wx-ww/2+2,wy+wh*0.16,ww-4,wh*0.5,ww*0.28); cx.fill();
          cx.fillStyle='#7a7684'; cx.beginPath(); cx.ellipse(wx,wy+wh*0.4,ww*0.2,ww*0.2,0,0,7); cx.fill(); });
        const bw=w*0.9, bh=h*0.5, by=baseY-h*0.6;
        cx.fillStyle=hx(col,0.5); rrp(px-bw*0.52,by-h*0.18,bw*1.04,h*0.11,4); cx.fill();
        cx.fillStyle=hx(col,0.8); cx.fillRect(px-bw*0.4,by-h*0.18,w*0.07,h*0.2); cx.fillRect(px+bw*0.33,by-h*0.18,w*0.07,h*0.2);
        const bg=cx.createLinearGradient(0,by-bh*0.2,0,by+bh);
        bg.addColorStop(0,hx(col,1.38)); bg.addColorStop(.5,col); bg.addColorStop(1,hx(col,0.68));
        cx.fillStyle=bg; rrp(px-bw/2,by,bw,bh,w*0.18); cx.fill();
        cx.fillStyle=hx(col,0.52); rrp(px-bw/2,by+bh*0.6,bw,bh*0.42,w*0.12); cx.fill();
        cx.fillStyle='#141018'; rrp(px-bw*0.46,baseY-h*0.15,bw*0.92,h*0.12,4); cx.fill();
        cx.fillStyle=hx(col,0.42); cx.beginPath(); cx.ellipse(px,by+bh*0.12,bw*0.26,bh*0.36,0,0,7); cx.fill();
        riderY = (baseY-h*0.6)-hd*0.66;
      }
      let done_=false;
      if(rider&&rider.av){ const im=avImg(rider.av); if(im){ try{ cx.drawImage(im,px-hd/2,riderY,hd,hd); done_=true; }catch(e){} } }
      if(!done_&&rider&&rider.sprite){ const im=sgImg(rider.sprite); if(im){ try{ cx.drawImage(im,px-hd/2,riderY,hd,hd); done_=true; }catch(e){} } }
      if(!done_&&rider&&rider.glyph){ cx.font=Math.round(hd*0.8)+'px serif'; cx.textAlign='center'; cx.fillText(rider.glyph,px,riderY+hd*0.6); cx.textAlign='left'; done_=true; }
      if(!done_&&!o.kart){ cx.fillStyle='#F0B429'; cx.beginPath(); cx.arc(px,riderY+hd*0.4,hd*0.32,0,7); cx.fill(); }
      if(o.spin){ cx.font='700 '+Math.round(w*0.7)+'px serif'; cx.textAlign='center'; cx.fillText('💫',px,riderY-hd*0.1); cx.textAlign='left'; } }

    function drawBG(){
      const hz=horizonY;
      const sky=sgTex('gp-sky');
      if(sky){
        // Painted Ghibli countryside backdrop with gentle parallax; the pseudo-3D road
        // draws on top and the grass band below is dropped to low alpha so the painted
        // field and hills show through (see the grass poly in draw()).
        const par=Math.sin(pos/2600)*18 - playerX*30;
        const iw=Wd*1.14, ih=iw*(sky.height/sky.width), iy=hz-ih*0.46;
        try{ cx.drawImage(sky, -(iw-Wd)/2 + par*0.35, iy, iw, ih); }catch(e){}
        if(iy+ih<Ht){ cx.fillStyle='#8FCB6A'; cx.fillRect(0,iy+ih-1,Wd,Ht-(iy+ih)+1); }
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
    function draw(){
      drawBG();
      const posm=pos%trackLen;
      const base=segs[Math.floor(posm/segLen)%segs.length]; const basePct=(posm%segLen)/segLen;
      let x=0, dx=-(base.curve*basePct), maxy=Ht;
      const camX=playerX*roadW;
      for(let n=0;n<drawDist;n++){ const seg=segs[(base.index+n)%segs.length];
        const looped=seg.index<base.index; const cz=posm-(looped?trackLen:0);
        project(seg.p1, camX - x,        camH, cz);
        project(seg.p2, camX - x - dx,   camH, cz);
        x+=dx; dx+=seg.curve;
        seg._vis=false; seg._clip=maxy; seg._far=n;
        if(seg.p1.camera.z<=camDepth || seg.p2.screen.y>=seg.p1.screen.y || seg.p2.screen.y>=maxy) continue;
        seg._vis=true; maxy=seg.p2.screen.y;
        const s1=seg.p1.screen, s2=seg.p2.screen, c=seg.color;
        if(sgTex('gp-sky')){ cx.globalAlpha=0.30; poly(0,s1.y, 0,s2.y, Wd,s2.y, Wd,s1.y, c.grass); cx.globalAlpha=1; }
        else poly(0,s1.y, 0,s2.y, Wd,s2.y, Wd,s1.y, c.grass);
        const r1=s1.w*0.18, r2=s2.w*0.18;
        poly(s1.x-s1.w-r1,s1.y, s2.x-s2.w-r2,s2.y, s2.x-s2.w,s2.y, s1.x-s1.w,s1.y, c.rumble);
        poly(s1.x+s1.w+r1,s1.y, s2.x+s2.w+r2,s2.y, s2.x+s2.w,s2.y, s1.x+s1.w,s1.y, c.rumble);
        poly(s1.x-s1.w,s1.y, s2.x-s2.w,s2.y, s2.x+s2.w,s2.y, s1.x+s1.w,s1.y, c.road);
        if(c.lane){ const lw1=s1.w*0.03, lw2=s2.w*0.03; poly(s1.x-lw1,s1.y, s2.x-lw2,s2.y, s2.x+lw2,s2.y, s1.x+lw1,s1.y, c.lane); }
        // checkered finish strip
        if(Math.abs(seg.index*segLen-FINVIS)<segLen*2){ const cw=(s1.w*2)/10;
          for(let k=0;k<10;k++){ cx.fillStyle=(k%2)?'#111':'#EEE'; cx.fillRect(s1.x-s1.w+k*cw,s1.y-3,cw,6); } }
      }
      const order=[];
      for(let n=drawDist-1;n>=0;n--){ const seg=segs[(base.index+n)%segs.length]; if(!seg._vis) continue; const sc=seg.p1.screen;
        seg.sprites.forEach(sp=>{ order.push({y:sc.y,scale:sc.scale,sx:sc.x+sc.w*(sp.off||0),sy:sc.y,t:sp.kind,w2:sc.w,clip:seg._clip,far:seg._far}); }); }
      hazards.forEach(hh=>{ const seg=segs[hh.seg]; if(seg&&seg._vis){ const sc=seg.p1.screen; order.push({y:sc.y,scale:sc.scale,sx:sc.x+sc.w*hh.off,sy:sc.y,t:'oil',clip:seg._clip,far:seg._far}); } });
      items.forEach(it=>{ if(it.gone) return; const seg=segs[it.seg]; if(seg&&seg._vis){ const sc=seg.p1.screen; order.push({y:sc.y,scale:sc.scale,sx:sc.x+sc.w*it.off,sy:sc.y,t:'item',it:it,clip:seg._clip,far:seg._far}); } });
      rivals.forEach(r=>{ const seg=segs[Math.floor((r.z%trackLen)/segLen)%segs.length]; if(seg&&seg._vis){ const sc=seg.p1.screen; order.push({y:sc.y,scale:sc.scale,sx:sc.x+sc.w*r.x,sy:sc.y,t:'rival',r:r,clip:seg._clip,far:seg._far}); } });
      order.sort((a,b)=>a.y-b.y);
      order.forEach(o=>{ if((o.far||0)>95) return;   // beyond this sprites are sub-pixel - skip instead of shimmering
        const w=Math.max(6,o.scale*roadW*Wd/2*0.11);
        cx.save(); cx.beginPath(); cx.rect(0,0,Wd,o.clip||Ht); cx.clip();
        cx.globalAlpha=Math.max(0,Math.min(1,(95-(o.far||0))/25));
        if(o.t==='flora'){
          cx.fillStyle='rgba(0,0,0,.18)'; cx.beginPath(); cx.ellipse(o.sx,o.sy,w*0.5,w*0.14,0,0,7); cx.fill();
          const tr=sgTex('tree');
          if(tr){ const tw=w*1.5, th=tw*(tr.height/tr.width); try{ cx.drawImage(tr,o.sx-tw/2,o.sy-th,tw,th); }catch(e){} }
          else {
            cx.fillStyle='#6b4a2a'; cx.fillRect(o.sx-w*0.09,o.sy-w*0.7,w*0.18,w*0.7);
            const tg=cx.createRadialGradient(o.sx-w*0.2,o.sy-w*1.5,2,o.sx,o.sy-w*1.3,w*0.95);
            tg.addColorStop(0,'#7ED07A'); tg.addColorStop(1,'#2F8A46'); cx.fillStyle=tg;
            cx.beginPath(); cx.arc(o.sx,o.sy-w*1.35,w*0.72,0,7); cx.arc(o.sx-w*0.5,o.sy-w*0.95,w*0.5,0,7); cx.arc(o.sx+w*0.5,o.sy-w*0.95,w*0.5,0,7); cx.fill(); } }
        else if(o.t==='oil'){ const oil=sgTex('oil');
          if(oil){ const ow=w*2.1, oh=ow*(oil.height/oil.width); try{ cx.drawImage(oil,o.sx-ow/2,o.sy-oh*0.62,ow,oh); }catch(e){} }
          else { cx.fillStyle='rgba(18,16,24,.78)'; cx.beginPath(); cx.ellipse(o.sx,o.sy-w*0.1,w*0.95,w*0.32,0,0,7); cx.fill();
            cx.fillStyle='rgba(150,110,210,.55)'; cx.beginPath(); cx.ellipse(o.sx-w*0.22,o.sy-w*0.16,w*0.34,w*0.11,0,0,7); cx.fill();
            cx.fillStyle='rgba(90,200,255,.35)'; cx.beginPath(); cx.ellipse(o.sx+w*0.25,o.sy-w*0.06,w*0.22,w*0.07,0,0,7); cx.fill(); } }
        else if(o.t==='item'){ const s=Math.max(14,w*1.3), yy=o.sy-w*1.25-Math.sin(pos/180+o.it.k)*4;
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
        else { const r=o.r; drawKart(o.sx,o.sy,w*1.9,r.col,{sprite:r.sprite,glyph:r.glyph},{spin:r.spin>0,kart:'kart-red'}); }
        cx.globalAlpha=1; cx.restore();
      });
      const pw=Wd*0.20, px=Wd/2 + playerX*Wd*0.03 + steer*8, py=Ht-14;
      cx.save(); cx.translate(px,py); cx.rotate(steer*0.02);
      drawKart(0,0,pw,'#F0B429',{av:heroKart},{boost:boostT>0,kart:'kart'});
      cx.restore();
      if(shieldT>0){ cx.strokeStyle='rgba(120,205,255,.85)'; cx.lineWidth=3; cx.beginPath(); cx.ellipse(px,py-pw*0.34,pw*0.62,pw*0.5,0,0,7); cx.stroke();
        cx.fillStyle='rgba(150,215,255,.14)'; cx.fill(); }
      if(boostT>0){ cx.save(); cx.strokeStyle='rgba(255,255,255,.4)'; cx.lineWidth=2;
        for(let i=0;i<12;i++){ const a=i/12*Math.PI*2, r0=Wd*0.16, r1=Wd*0.52;
          cx.beginPath(); cx.moveTo(Wd/2+Math.cos(a)*r0, Ht*0.46+Math.sin(a)*r0*0.7); cx.lineTo(Wd/2+Math.cos(a)*r1, Ht*0.46+Math.sin(a)*r1*0.7); cx.stroke(); } cx.restore(); }
      if(spinFlashT>0){ cx.save(); cx.globalAlpha=Math.min(0.5,spinFlashT); cx.fillStyle='#2A1E14'; cx.fillRect(0,0,Wd,Ht); cx.restore(); }
      hudT+=0.016; if(hudT>0.15){ hudT=0; updateHud(); }
      if(mode==='count'&&countT>0){ cx.save(); cx.textAlign='center';
        cx.font='800 54px Fraunces,serif'; cx.fillStyle='#fff'; cx.strokeStyle='rgba(20,20,50,.6)'; cx.lineWidth=7;
        const n=Math.ceil(countT*3/1.0); const txt=countT<0.33?'GO!':String(Math.ceil(countT*3));
        cx.strokeText(txt,Wd/2,Ht*0.42); cx.fillText(txt,Wd/2,Ht*0.42); cx.restore(); }
    }
    /* position bar: everyone's progress at a glance */
    function updateHud(){
      const ahead=rivals.filter(r=>r.z>pos).length; const place=ahead+1;
      host.querySelector('#sg-pos').innerHTML=['🥇 1st','🥈 2nd','🥉 3rd','4th','5th'][place-1]+' <i>/ '+(CFG.rivals+1)+'</i>';
      host.querySelector('#sg-lap').textContent='Lap '+Math.min(CFG.laps,lap)+'/'+CFG.laps;
      host.querySelector('#sg-spd').textContent='💨 '+Math.round(v/maxV*180);
      const pb=host.querySelector('#sg-pb');
      let dots='<i class="sg-pb-road"></i><b class="sg-pb-flag">🏁</b>';
      rivals.forEach((r,i)=>{ const pct=Math.min(99,r.z/TOTAL*100);
        dots+='<span class="sg-pb-dot" style="left:'+pct.toFixed(1)+'%;top:'+(i%2?72:28)+'%;background:'+r.col+'" title="'+r.name+'">'+r.glyph+'</span>'; });
      dots+='<span class="sg-pb-dot me" style="left:'+Math.min(99,pos/TOTAL*100).toFixed(1)+'%">🐝</span>';
      pb.innerHTML=dots;
    }

    /* ---- loop ---- */
    let last=0;
    function frame(ts){ if(over) return; const dt=Math.min(0.05,(ts-last)/1000)||0.016; last=ts;
      if(mode==='count'){ countT-=dt; if(countT<=0){ mode='race'; } }
      if(mode==='race') update(dt);
      draw(); requestAnimationFrame(frame); }
    function update(dt){
      boostT=Math.max(0,boostT-dt); if(boostT===0) boostMul=1; shieldT=Math.max(0,shieldT-dt); spinFlashT=Math.max(0,spinFlashT-dt);
      const seg=segs[Math.min(segs.length-1,Math.floor(pos/segLen))]; const spdPct=v/maxV;
      v=Math.min(maxV*boostMul, v+accel*dt);
      const dxs=dt*2.2*Math.max(0.35,spdPct);
      playerX+=steer*dxs;   // no centrifugal self-drift: unsteered, the kart tracks the road straight
      if((playerX<-1||playerX>1) && v>offLimit){ v+=offDecel*dt; }
      playerX=Math.max(-2,Math.min(2,playerX));
      const pm=pos%trackLen;
      if(shieldT<=0){ hazards.forEach(h=>{ const hz2=h.seg*segLen; let d=Math.abs(pm-hz2); d=Math.min(d,trackLen-d); if(d<segLen*1.2 && Math.abs(playerX-h.off)<0.5 && v>maxV*0.3){ v*=0.55; spinFlashT=0.5; try{flash('🛢️ Slipped on oil!');}catch(_){}} }); }
      items.forEach(it=>{ if(it.gone) return; const iz=it.seg*segLen; const d=iz-pm;
        if(d>-segLen*0.4&&d<segLen*1.4 && Math.abs(playerX-it.off)<0.5){ it.gone=true; spellGate(); } });
      pos+=v*dt;
      const nl=1+Math.floor(pos/trackLen);
      if(nl>lap&&nl<=CFG.laps){ lap=nl; items.forEach(it=>it.gone=false); try{flash('🏁 Lap '+lap+' of '+CFG.laps+'!');}catch(_){ } }
      if(pos>=TOTAL){ over=true; return finish(); }
      rivals.forEach(r=>{ r.spin=Math.max(0,r.spin-dt); r.slow=Math.max(0,r.slow-dt);
        let rs=r.spd; if(r.spin>0) rs*=0.28; else if(r.slow>0) rs*=0.55;
        const gap=pos-r.z; rs+= gap>segLen*12?maxV*0.07: gap<-segLen*12?-maxV*0.06:0;
        r.z+=Math.max(0,rs)*dt; if(r.z>=TOTAL) r.fin=true;
        r.x+= (Math.sin((r.z+r.name.length*99)/1400)*0.6 - r.x)*dt*0.6; });
    }
    function finish(){ removeEventListener('keydown',kd); removeEventListener('keyup',ku);
      const place=1+rivals.filter(r=>r.fin).length;
      done({win:place===1, score:(6-place)*250+Math.round(pos/segLen), stars:place===1?3:place===2?2:place===3?1:0}); }

    /* ---- how to play ---- */
    host.style.position='relative';
    const intro=document.createElement('div'); intro.className='sg-howto';
    intro.innerHTML='<div class="sg-howto-card">'+
      '<div class="sg-howto-h">🏁 Bee Grand Prix</div>'+
      '<div class="sg-howto-sub">One epic race to the finish against the Unspelling’s crew — the Smudge, Glitch and Vex are on the grid!</div>'+
      '<ol class="sg-howto-steps">'+
      '<li>You <b>drive automatically</b> — steer with <b>◀ ▶</b> (arrows / tap the sides) and dodge 🛢️ oil.</li>'+
      '<li>Drive into a <b>? box</b> — the race pauses while you <b>spell the word</b>.</li>'+
      '<li>Spelling it right <b>unlocks a power-up</b> into your slot — tap the slot (or Space) to fire it when you need it!</li>'+
      '<li>Watch the <b>track bar up top</b> to see where every racer is. First to the flag wins ⭐⭐⭐.</li>'+
      '</ol>'+
      '<button class="sg-rbtn go sg-howto-go" id="sg-howgo">To the grid! →</button></div>';
    host.appendChild(intro);
    intro.querySelector('#sg-howgo').onclick=()=>{ intro.remove(); countT=1.0; mode='count'; };
    renderHold();
    if(window.SB_DEBUG) window._race={ state:()=>({pos,TOTAL,lap,mode,held:held&&held.id,place:1+rivals.filter(r=>r.z>pos).length,v,over}),
      steerTo:(x)=>{playerX=x;}, jump:(z)=>{pos=z;}, grant:(i)=>{held=POWERS[i||0];renderHold();} };
    requestAnimationFrame(frame);
    return { destroy(){ over=true; removeEventListener('keydown',kd); removeEventListener('keyup',ku); } };
  }

  function whackAMoth(host, opts, done){
    const diff=opts.diff||'medium';
    const CFG=calmCFG({easy:{words:6,up:1500,time:90},medium:{words:8,up:1200,time:90},hard:{words:9,up:950,time:85},champ:{words:10,up:800,time:80}}[diff]);
    const words=pool(CFG.words+2).filter(w=>w.w.length<=9); let wi=0, cur=null, li=0, t=CFG.time, doneWords=0, over=false;
    const art=(window.SGART&&SGART.ready());
    const mothArt=art?SGART.sprite('grey-moth',{cls:'sg-mothimg'}):'🦋';
    const plate=art?SGART.plateForWorld(opts.world||'Hive'):'';
    host.innerHTML='<div class="sg-hud"><span id="sg-w">Word 1/'+CFG.words+'</span><span id="sg-time"></span></div>'+
      '<div class="sg-target" id="sg-target"></div><div id="sg-wmean" class="sg-cardmean"></div><div class="sg-mothstage"><div class="sg-moth-bg">'+plate+'</div><div class="sg-molegrid" id="sg-grid"></div></div>';
    const grid=host.querySelector('#sg-grid');
    for(let i=0;i<12;i++){ const c=document.createElement('button'); c.className='sg-cell'; c.dataset.i=i; grid.appendChild(c); }
    function newWord(){ if(wi>=words.length||doneWords>=CFG.words){ over=true; finish(true); return; }
      cur=words[wi++]; li=0; renderTarget();
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
    const CFG=calmCFG({easy:{hexes:6,t:14},medium:{hexes:8,t:12},hard:{hexes:9,t:10},champ:{hexes:10,t:9}}[diff]);
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
      '<div id="sg-dmean" class="sg-cardmean"></div>'+
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
      const mn=host.querySelector('#sg-dmean'); if(mn){ const m=meaningText(cur); mn.textContent=m?('💡 '+m):''; }
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
    let snake,dir,ndir,word='',spelled=0,tiles=[],wordsDone=0,score=0,lives=3,over=false,bonk=0,tick=CFG.tick,loop=null,fx=[],tongueT=0;
    /* the snake game IS a snake — coloured to the worn Serpent-pack avatar, else garden green */
    const SERP_PAL={noodle:['#5FBE5A','#86D97F','#D6F0B8','#2C6E2C'],sunny:['#E9963C','#FFC07A','#FFDFB0','#9A5410'],
      cobra:['#3E8D5C','#69B984','#DDF0BE','#1F5A38'],python:['#9A824C','#C2A972','#E9DBB4','#5A4620'],
      rattler:['#B99154','#DDBA80','#EEDCB0','#6E4E24'],viper:['#6E9A3E','#97C066','#DCEAB0','#3E5A20'],
      boa:['#8A6AB8','#B39AD8','#E6D9F0','#4A3072'],mamba:['#4A4A58','#6E6E80','#B8B8C4','#22222E'],
      seasnake:['#2E9FB8','#5CC4D8','#BEEAF0','#14607A'],naga:['#C9A227','#F0D064','#F5E7B0','#7A5A10']};
    const wornSkin=(function(){ const a=(typeof heroAv==='function')&&heroAv(); return SERP_PAL[a]||(a==='titanoboa'?['#4E7F41','#74AC60','#DCEBC8','#2C4A24']:a==='vasuki'?['#63499E','#9179CE','#E6D9F5','#3A2560']:null); })();
    // evolution ladder: the snake grows from a garden snake up to VASUKI as words are spelled
    const EVO_PAL=[['#5FBE5A','#86D97F','#D6F0B8','#2C6E2C'],['#3E8D5C','#69B984','#DDF0BE','#1F5A38'],
      ['#9A824C','#C2A972','#E9DBB4','#5A4620'],['#2E9FB8','#5CC4D8','#BEEAF0','#14607A'],
      ['#C9A227','#F0D064','#F5E7B0','#7A5A10'],['#63499E','#9179CE','#E6D9F5','#3A2560']];
    let PAL=wornSkin||EVO_PAL[0], evo=null, snakeStage=0, unlocked=false;
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
          if(spelled>=word.length){ wordsDone++; score+=40; spawnSplash('✓ '+word.toUpperCase());
            try{ if(typeof addCoins==='function') addCoins(10); }catch(e){}
            // EVOLVE: grow the snake through the forms up to Vasuki (the achievable endpoint)
            const ns=Math.min(5, Math.round(wordsDone/CFG.words*5));
            if(ns!==snakeStage){ snakeStage=ns; if(!wornSkin) PAL=EVO_PAL[ns]; if(evo) evo.set(ns, ()=>onVasuki(), 5); }
            if(tick>110) tick-=8; layoutWord(); } else renderWord(); }
        else { bonk=2; shake.hit(6);
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
      const drawRun=(w,col)=>{ cx.strokeStyle=col; cx.lineWidth=w; cx.lineCap='round'; cx.lineJoin='round';
        cx.beginPath(); let started=false;
        for(let i=0;i<pts.length;i++){ if(i>0 && !near(pts[i],pts[i-1])){ cx.stroke(); cx.beginPath(); started=false; }
          if(!started){ cx.moveTo(pts[i].x,pts[i].y); started=true; } else cx.lineTo(pts[i].x,pts[i].y); }
        cx.stroke(); };
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
      el.innerHTML='<div class="sg-cardbox sg-endcard"><div style="font:800 26px var(--display,serif);margin-bottom:4px">'+(unlocked?'🌌 Became VASUKI!':win?'🏆 Words spelled!':'🌙 Tangled out')+'</div>'
        +'<div style="font-size:13px;color:var(--muted,#7A6E5C);margin-bottom:2px">Evolved to '+form+' · '+wordsDone+' words</div>'
        +'<div style="font-size:26px;letter-spacing:4px;margin:2px 0">'+('★'.repeat(stars)+'☆'.repeat(3-stars))+'</div>'
        +'<div style="font-size:15px;color:var(--muted,#7A6E5C);margin-bottom:12px">'+wordsDone+' word'+(wordsDone===1?'':'s')+' · ⭐ '+score+'</div>'
        +'<div class="sg-inrow" style="max-width:340px"><button class="sg-rbtn" id="sg-again">↻ Play again</button>'
        +'<button class="sg-rbtn go" id="sg-cont">'+(win?'Continue →':'Back to map')+'</button></div></div>';
      el.style.display='grid';
      el.querySelector('#sg-again').onclick=()=>{ el.style.display='none'; el.innerHTML=''; wordSnake(host,opts,done); };
      el.querySelector('#sg-cont').onclick=()=>{ el.style.display='none'; el.innerHTML=''; done({win,score,stars}); };
    }
    // the achievable endpoint: the snake becomes VASUKI — next chapter unlocks, but play goes on
    function onVasuki(){ if(unlocked) return; unlocked=true;
      try{ if(opts.onUnlock) opts.onUnlock(3); }catch(e){}
      spawnSplash('🌌 VASUKI!');
      const fb=document.createElement('button'); fb.className='sg-finishbtn'; fb.textContent='Finish ⭐';
      fb.onclick=()=>finish(true); host.appendChild(fb); }
    evo=sgEvo(host,'snake'); evo.set(0);
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
    const BW=64;
    function layout(){ curW=feed.next(); word=curW.w.toLowerCase(); spelled=0; drops=[];
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
            if(spelled>=word.length){ wordsDone++; score+=40; spawnSplash(); try{ if(typeof addCoins==='function') addCoins(8); }catch(e){}
              if(wordsDone>=CFG.words){ finish(true); return; } layout(); setHud(); } }
          else { bonk=3; }                                    // wrong letter — no penalty beyond the miss
        } else if(d.y>Ht){ drops.splice(i,1);
          if(d.ch===word[spelled]){ lives--; bonk=3; shake.hit(10);
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
      el.innerHTML='<div class="sg-cardbox sg-endcard"><div style="font:800 26px var(--display,serif);margin-bottom:4px">'+(win?'🍯 Words caught!':'🌙 Out of catches')+'</div>'
        +'<div style="font-size:26px;letter-spacing:4px;margin:2px 0">'+('★'.repeat(stars)+'☆'.repeat(3-stars))+'</div>'
        +'<div style="font-size:15px;color:var(--muted,#7A6E5C);margin-bottom:12px">'+wordsDone+' word'+(wordsDone===1?'':'s')+' · ⭐ '+score+'</div>'
        +'<div class="sg-inrow" style="max-width:340px"><button class="sg-rbtn" id="sg-again">↻ Play again</button>'
        +'<button class="sg-rbtn go" id="sg-cont">'+(win?'Continue →':'Back to map')+'</button></div></div>';
      el.style.display='grid';
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
    function cur(){ return words[wi]; }
    function need(){ return cur().w.toLowerCase()[li]; }
    function renderSlots(){ const w=cur().w.toLowerCase();
      host.querySelector('#sg-rslots').innerHTML=w.split('').map((ch,ix)=>'<span class="sg-slot'+(ix<li?' fill':ix===li?' next':'')+'">'+(ix<li?ch.toUpperCase():'')+'</span>').join('');
      host.querySelector('#sg-rh').textContent='❤'.repeat(Math.max(0,hearts));
      host.querySelector('#sg-rs').textContent='⭐ '+score; }
    function newWord(){ li=0; const w=cur();
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
        if(li>=cur().w.length){ score+=40; wi++;
          try{ flash('🎶 '+words[wi-1].w.toUpperCase()+' — the marquee glows!'); }catch(e){}
          if(wi>=CFG.words){ finish(true); return; }
          newWord(); } else renderSlots(); }
      else { n.el.classList.add('bad'); setTimeout(()=>n.el.remove(),220); notes=notes.filter(x=>x!==n);
        hearts--; renderSlots(); try{ if(typeof sfx==='function') sfx('wrong'); }catch(e){}
        if(hearts<=0) finish(false); } }
    function frame(){ if(over) return;
      const H=stage.clientHeight; spawnT+=16.7; beatT+=16.7;
      if(spawnT>=CFG.gap){ spawnT=0; spawn(); }
      if(beatT>=CFG.gap){ beatT=0; const hit=host.querySelector('#sg-rhit');
        if(hit){ hit.classList.remove('pulse'); void hit.offsetWidth; hit.classList.add('pulse'); } }
      for(const n of [...notes]){ n.y+=CFG.fall; n.el.style.top=n.y+'px';
        if(n.y>H){ n.el.remove(); notes=notes.filter(x=>x!==n);
          if(n.ch===need()){ hearts--; renderSlots();
            try{ flash('The note slipped past — listen again!'); }catch(e){}
            if(hearts<=0){ finish(false); return; } } } } }
    const key=e=>{ if(over) return; const map={d:0,f:1,j:2,k:3,ArrowLeft:0,ArrowDown:1,ArrowUp:2,ArrowRight:3,'1':0,'2':1,'3':2,'4':3};
      const l=map[e.key.length===1?e.key.toLowerCase():e.key]; if(l!==undefined){ bopLane(l); e.preventDefault(); } };
    addEventListener('keydown',key);
    laneEl.addEventListener('pointerdown',e=>{ const ln=e.target.closest('.sg-rlane'); if(ln) bopLane(+ln.dataset.l); });
    host.querySelector('#sg-rsay').onclick=()=>{ try{ say(cur().w); }catch(e){} };
    function finish(win){ over=true; if(loop){clearInterval(loop);loop=null;} removeEventListener('keydown',key);
      done({win, score, stars:win?(hearts>=4?3:hearts>=2?2:1):0}); }
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
    function cur(){ return words[wi]; }
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
    const foeSvg=(art&&SGART.has('static-sprite'))?SGART.sprite('static-sprite',{cls:'sg-tbimg'}):'<span class="sg-tbemoji">👾</span>';
    let wi=0, li=0, shield=3, score=0, foeY=0, over=false, loop=null;
    host.innerHTML='<div class="sg-hud"><span id="sg-tw">👾 1/'+CFG.n+'</span><span id="sg-tsh"></span><span id="sg-ts">0</span></div>'+
      '<div class="sg-tbstage" id="sg-tbs"><div class="sg-tbstage-bg">'+plate+'</div>'+
        '<div class="sg-tbfoe" id="sg-tbf">'+foeSvg+'<div class="sg-tbslots" id="sg-tbslots"></div></div>'+
        '<div class="sg-tbbeam" id="sg-tbbeam"></div>'+
        '<div class="sg-tbshield" id="sg-tbshieldbar"></div>'+
        '<div class="sg-tbcannon">🐝</div></div>'+
      '<div class="sg-rword"><button class="sg-sbtn" id="sg-tsay" aria-label="Hear the word">'+iconSVG('volume',18)+'</button><span class="sg-race-mean" id="sg-tmean"></span></div>'+
      '<div class="ss-key sg-tbkey" id="sg-tkey"></div>';
    const stage=host.querySelector('#sg-tbs'), foe=host.querySelector('#sg-tbf'), beam=host.querySelector('#sg-tbbeam');
    const rows=['qwertyuiop','asdfghjkl','zxcvbnm'];
    host.querySelector('#sg-tkey').innerHTML=rows.map(r=>'<div class="ss-krow">'+r.split('').map(ch=>'<button class="ss-kb" data-k="'+ch+'">'+ch+'</button>').join('')+'</div>').join('');
    function cur(){ return words[wi]; }
    function renderSlots(){ const w=cur().w.toLowerCase();
      host.querySelector('#sg-tbslots').innerHTML=w.split('').map((ch,ix)=>'<span class="sg-slot'+(ix<li?' fill':'')+'">'+(ix<li?ch.toUpperCase():'')+'</span>').join('');
      host.querySelector('#sg-tsh').textContent='🛡'.repeat(Math.max(0,shield));
      host.querySelector('#sg-ts').textContent='⭐ '+score; }
    function newWord(){ li=0; foeY=0; const w=cur();
      host.querySelector('#sg-tw').textContent='👾 '+(wi+1)+'/'+CFG.n;
      host.querySelector('#sg-tmean').innerHTML=meaningHTML(w);
      foe.style.top='0%'; renderSlots(); try{ say(w.w); }catch(e){} }
    function zap(){ beam.classList.remove('fire'); void beam.offsetWidth; beam.classList.add('fire');
      foe.classList.remove('hitfx'); void foe.offsetWidth; foe.classList.add('hitfx'); }
    function type(ch){ if(over) return; const w=cur().w.toLowerCase();
      if(ch===w[li]){ li++; score+=15; foeY=Math.max(0,foeY-7); zap(); renderSlots();
        try{ if(typeof sfx==='function') sfx('correct'); }catch(e){}
        if(li>=w.length){ score+=50; foe.classList.add('boom');
          try{ flash('💥 '+w.toUpperCase()+' — glitch zapped!'); }catch(e){}
          wi++; if(wi>=CFG.n){ finish(true); return; }
          setTimeout(()=>{ foe.classList.remove('boom'); newWord(); },650); } }
      else { score=Math.max(0,score-5); foeY+=3;
        foe.classList.remove('gloatfx'); void foe.offsetWidth; foe.classList.add('gloatfx');
        try{ if(typeof sfx==='function') sfx('wrong'); }catch(e){} } }
    function frame(){ if(over) return;
      if(foe.classList.contains('boom')) return;
      foeY+=CFG.v; foe.style.top=Math.min(78,foeY)+'%';
      if(foeY>=78){ shield--; foeY=0; foe.style.top='0%';
        stage.classList.remove('breach'); void stage.offsetWidth; stage.classList.add('breach');
        renderSlots(); try{ flash('⚡ The firewall took a hit — keep spelling!'); }catch(e){}
        if(shield<=0){ finish(false); return; } } }
    const kb=e=>{ if(over) return; if(/^[a-zA-Z]$/.test(e.key)){ type(e.key.toLowerCase()); e.preventDefault(); } };
    addEventListener('keydown',kb);
    host.querySelector('#sg-tkey').onclick=e=>{ const bt=e.target.closest('.ss-kb'); if(bt) type(bt.dataset.k); };
    host.querySelector('#sg-tsay').onclick=()=>{ try{ say(cur().w); }catch(e){} };
    function finish(win){ over=true; if(loop){clearInterval(loop);loop=null;} removeEventListener('keydown',kb);
      done({win, score, stars:win?(shield>=3?3:shield===2?2:1):0}); }
    newWord(); loop=setInterval(frame,1000/60);
    return { destroy(){ over=true; if(loop){clearInterval(loop);loop=null;} removeEventListener('keydown',kb); } };
  }

  W().SB_SAGA_ENGINES = { honeycombRun, keepFlying, wordHive, beeGrandPrix, whackAMoth, spellShield, spotlightSimon, unscrambleStars, wordSnake, combCatcher, stageRhythm, constellationConnect, typeBlaster };


  /* ---------- ENGINE G · SPOTLIGHT SIMON (memory sequence) ---------- */
  function spotlightSimon(host, opts, done){
    const diff=opts.diff||'medium';
    const CFG=calmCFG({easy:{seqs:4,start:3},medium:{seqs:6,start:3},hard:{seqs:6,start:4},champ:{seqs:7,start:5}}[diff]);
    const feed=wordFeed(CFG.seqs+5,w=>w&&w.w&&w.w.length>=CFG.start&&w.w.length<=9);
    let si=0, seq=null, showing=false, tapIdx=0, over=false, misses=0;
    const art=(window.SGART&&SGART.ready());
    const plate=art?SGART.plateForWorld(opts.world||'Stage'):'';
    host.innerHTML='<div class="sg-hud"><span id="sg-seq">Song 1/'+CFG.seqs+'</span><span id="sg-miss"></span></div>'+
      '<div class="sg-stage"><div class="sg-stage-bg">'+plate+'</div><div class="sg-tiles" id="sg-tiles"></div></div>'+
      '<div class="sg-simonprompt" id="sg-sp"></div><div id="sg-card"></div>';
    function newSeq(){
      if(si>=CFG.seqs){ over=true; done({win:true,score:CFG.seqs*120-misses*20,stars:misses===0?3:misses<=2?2:1}); return; }
      const w=feed.next(); seq={w:w.w.toLowerCase(),i:0,d:(w.d||w.def||'')};
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
      el.innerHTML='<div class="sg-cardbox"><b>🌟 That was a word! Spell it from memory</b>'+meaningHTML({w:seq.w,d:seq.d})+'<div class="sg-inrow"><input id="sg-ci" autocomplete="off" autocapitalize="off"><button class="sg-rbtn go" id="sg-cgo">Sing</button></div></div>';
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
    const CFG=calmCFG({easy:{n:8},medium:{n:12},hard:{n:12},champ:{n:14}}[diff]);
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
    const CFG=calmCFG({easy:{n:6},medium:{n:8},hard:{n:10},champ:{n:12}}[diff]||{n:8});
    const words=fillWords(CFG.n,3,12);
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
          '<div class="ss-prompt"><button class="ss-say" id="ss-say" aria-label="Hear the word">'+iconSVG('volume',18)+'</button><span class="ss-hint" id="ss-hint"></span></div>'+
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


  /* The story controller (map / board / dialogue beats / CH_META / ACTS) was removed
     with the "Great Unspelling" story. The 14 engines above ARE the arcade now, played
     straight via app3 arcadePlay; SB_SAGA_ENGINES and the shared SGFX kit stay. */

})();
