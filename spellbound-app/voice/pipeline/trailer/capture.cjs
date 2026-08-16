/* Capture real Bee Grand Prix gameplay for the trailer — 1920x1080 webm clips. */
const { chromium } = require('playwright');
const fs=require('fs');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const OUT='/tmp/vid/clips'; fs.mkdirSync(OUT,{recursive:true});
const BASE='http://localhost:8991/index.html';
const CHROME='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const KID={name:'Ahana',age:11,theme:'spellbound',avatar:'bizzy',goal:15,coins:1240,band:3,lists:{},missed:[]};

async function record(name, fn){
  const b=await chromium.launch({executablePath:CHROME});
  const ctx=await b.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1,
    recordVideo:{dir:OUT,size:{width:1920,height:1080}}});
  const p=await ctx.newPage();
  p.on('pageerror',e=>console.log('  pageerror:',e.message.slice(0,90)));
  await p.goto(BASE,{waitUntil:'load'});
  await sleep(7000);
  await p.evaluate((k)=>{ window.SB_DEBUG=true;
    state.children=[k]; state.activeIdx=0; ensureLists(active());
    state.screen='app'; state.nav='games'; state.mode='light'; state.devBannerOff=true;
    window.__lastSay=null; const _s=window.say; window.say=function(w){ if(typeof w==='string') window.__lastSay=w; try{return _s.apply(this,arguments);}catch(e){} };
    render(); }, KID);
  await sleep(400);
  try{ await fn(p); }catch(e){ console.log('  DRIVE ERR '+name+':', e.message.slice(0,120)); }
  const path=await p.video().path();
  await ctx.close(); await b.close();
  fs.renameSync(path, OUT+'/'+name+'.webm');
  console.log('  saved', name+'.webm', Math.round(fs.statSync(OUT+'/'+name+'.webm').size/1024)+'KB');
}

const go=async p=>{ await p.evaluate(()=>{ const g=document.querySelector('#sg-howgo'); if(g) g.click(); }); };
const launch=async (p,opts)=>{ await p.evaluate((o)=>{ app.arcadePlay('beeGrandPrix',Object.assign({fromMenu:true},o)); },opts); await sleep(500); await go(p); };
const steerTap=async(p,key,ms)=>{ await p.keyboard.down(key); await sleep(ms); await p.keyboard.up(key); };

(async()=>{
  // ---- 1. START MENU: pick hero → kart → track → Start ----
  await record('menu', async p=>{
    await p.evaluate(()=>{ arcadeMenu('beeGrandPrix'); });
    await sleep(1600);
    // pick a different hero for visible change
    await p.evaluate(()=>{ const b=[...document.querySelectorAll('.arcm-av-b')][2]; if(b) b.click(); });
    await sleep(1100);
    await p.evaluate(()=>{ const b=[...document.querySelectorAll('.arcm-av-b')][4]; if(b) b.click(); });
    await sleep(1200);
    // kart: rocket
    await p.evaluate(()=>{ const b=document.querySelector('#arcm-gr-kart [data-v="kart-rocket"]'); if(b) b.click(); });
    await sleep(1300);
    // track: sunset
    await p.evaluate(()=>{ const b=document.querySelector('#arcm-gr-scene [data-v="sunset"]'); if(b) b.click(); });
    await sleep(1400);
    await p.evaluate(()=>{ const b=document.querySelector('#arcm-go'); if(b) b.click(); });
    await sleep(2600);   // engine mounts + howto visible… dismiss & count-in
    await go(p);
    await sleep(2400);
  });

  // ---- 2. SUNSET RACE: rocket kart, boost, overtakes ----
  await record('sunset', async p=>{
    await launch(p,{hero:'sunny',opts:{kart:'kart-rocket',scene:'sunset'}});
    await sleep(2200);                       // countdown → race
    await steerTap(p,'ArrowRight',450);
    await sleep(1200);
    await p.evaluate(()=>{ window._race.grant(0); });  // rocket in slot
    await sleep(700);
    await p.keyboard.press(' ');             // FIRE — boost flame + speedlines
    await sleep(2600);
    await steerTap(p,'ArrowLeft',500);
    await sleep(2200);
    await p.evaluate(()=>{ window._race.grant(1); });
    await p.keyboard.press(' ');
    await sleep(3000);
    await steerTap(p,'ArrowRight',380);
    await sleep(3000);
  });

  // ---- 3. SPELL GATE: meadow, hit a ? box, type the word, unlock, fire ----
  await record('spell', async p=>{
    await launch(p,{hero:'bizzy',opts:{kart:'kart',scene:'meadow'}});
    await sleep(2400);                        // countdown
    await steerTap(p,'ArrowLeft',350);        // a little pre-box driving (used for S3 too)
    await sleep(2400);
    await steerTap(p,'ArrowRight',400);
    await sleep(2600);
    await p.evaluate(()=>{ window._race.toBox(); });   // line up the next ? box
    // wait for the spell card to open
    for(let i=0;i<40;i++){ const open=await p.evaluate(()=>!!document.querySelector('#sg-ci')); if(open) break; await sleep(200); }
    await sleep(1600);                        // word is spoken; card readable
    const word=await p.evaluate(()=>((window.__lastSay||'honey')+'').toLowerCase());
    await p.click('#sg-ci');
    await p.keyboard.type(word,{delay:210}); // human-speed typing
    await sleep(700);
    await p.click('#sg-cgo');                 // Unlock!
    await sleep(1700);                        // unlock card moment
    await sleep(1300);                        // count-in back to race
    await p.keyboard.press(' ');              // FIRE the earned power-up
    await sleep(3200);
  });

  // ---- 4. NEON CITY: cruiser kart at night ----
  await record('city', async p=>{
    await launch(p,{hero:'boba',opts:{kart:'kart-cruiser',scene:'city'}});
    await sleep(2400);
    await steerTap(p,'ArrowRight',420);
    await sleep(2400);
    await p.evaluate(()=>{ window._race.grant(1); });
    await p.keyboard.press(' ');
    await sleep(2800);
    await steerTap(p,'ArrowLeft',420);
    await sleep(3000);
  });

  // ---- 5. FINISH: cross the line 1st + result card ----
  await record('finish', async p=>{
    await launch(p,{hero:'bizzy',opts:{kart:'kart-rocket',scene:'meadow'}});
    await sleep(2400);
    await p.evaluate(()=>{ const st=window._race.state(); window._race.jump(st.TOTAL - 200*46); });
    await sleep(1000);
    await p.evaluate(()=>{ window._race.grant(0); });
    await p.keyboard.press(' ');              // boost across the line
    // wait for the result card
    for(let i=0;i<60;i++){ const done=await p.evaluate(()=>!!document.querySelector('.arc-play-result')); if(done) break; await sleep(250); }
    await sleep(3200);                        // hold on “Nice spelling!/New record!” card
  });

  // ---- 6. ARCADE GRID: slow scroll ----
  await record('arcade', async p=>{
    await p.evaluate(()=>{ window.scrollTo(0,0); });
    await sleep(1500);
    for(let i=0;i<26;i++){ await p.mouse.wheel(0,52); await sleep(140); }
    await sleep(1200);
  });

  // ---- 7. END CARD (PNG still, styled in-app so fonts/avatars load) ----
  const b=await chromium.launch({executablePath:CHROME});
  const ctx=await b.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});
  const p=await ctx.newPage();
  await p.goto(BASE,{waitUntil:'load'}); await sleep(7000);
  await p.evaluate((k)=>{ state.children=[k]; state.activeIdx=0; ensureLists(active()); state.screen='app'; render(); }, KID);
  await sleep(300);
  await p.evaluate(()=>{
    const d=document.createElement('div');
    d.style.cssText='position:fixed;inset:0;z-index:99999;display:grid;place-items:center;background:radial-gradient(120% 100% at 50% -10%,#3a2568,#241a45 55%,#15102e)';
    d.innerHTML='<div style="text-align:center">'
      +'<div style="display:grid;place-items:center;margin:0 auto 26px;width:220px;height:220px;border-radius:50%;background:rgba(255,216,115,.12);box-shadow:0 0 0 6px rgba(255,216,115,.35)">'+SB_AVATAR('bizzy',180)+'</div>'
      +'<div style="font-family:Fraunces,serif;font-weight:800;font-size:88px;color:#fff;letter-spacing:.5px">Bizzing Bee</div>'
      +'<div style="font-family:Fraunces,serif;font-weight:800;font-size:30px;color:#FFD873;margin-top:10px">Where champions learn to spell</div>'
      +'<div style="display:inline-block;margin-top:36px;padding:18px 44px;border-radius:16px;background:linear-gradient(135deg,#FFC23D,#F0803C);color:#2A1A08;font-family:Fraunces,serif;font-weight:800;font-size:34px;box-shadow:0 10px 30px rgba(240,128,60,.45)">Play free → www.bizzingbee.com</div>'
      +'<div style="margin-top:22px;font-size:17px;color:rgba(255,255,255,.55);font-weight:700">No ads · COPPA-safe · Works offline</div>'
      +'</div>';
    document.body.appendChild(d);
  });
  await sleep(1200);
  await p.screenshot({path:'/tmp/vid/endcard.png'});
  await b.close();
  console.log('capture complete');
})();
