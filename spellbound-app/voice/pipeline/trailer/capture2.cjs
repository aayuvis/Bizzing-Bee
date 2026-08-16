/* Episode 1 capture: ONE continuous champ race with choreographed drama.
   Logs EV <name> <t> — seconds relative to recording start — for exact cutting. */
const { chromium } = require('playwright');
const fs=require('fs');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const OUT='/tmp/vid/clips'; fs.mkdirSync(OUT,{recursive:true});
const CHROME='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const KID={name:'Ahana',age:11,theme:'spellbound',avatar:'bizzy',goal:15,coins:1240,band:4,lists:{},missed:[]};

(async()=>{
  const b=await chromium.launch({executablePath:CHROME});
  const ctx=await b.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1,
    recordVideo:{dir:OUT,size:{width:1920,height:1080}}});
  const t0=Date.now();
  const EV=(n)=>console.log('EV',n,((Date.now()-t0)/1000).toFixed(2));
  const p=await ctx.newPage();
  p.on('pageerror',e=>console.log('  pageerror:',e.message.slice(0,90)));
  await p.goto('http://localhost:8991/index.html',{waitUntil:'load'});
  await sleep(7000);
  await p.evaluate((k)=>{ window.SB_DEBUG=true;
    state.children=[k]; state.activeIdx=0; ensureLists(active());
    state.screen='app'; state.nav='games'; state.mode='light'; state.devBannerOff=true;
    window.__lastSay=null; const _s=window.say; window.say=function(w){ if(typeof w==='string') window.__lastSay=w; try{return _s.apply(this,arguments);}catch(e){} };
    render(); }, KID);
  await sleep(400);

  // menu: quick decisive picks (rocket kart, meadow) on CHAMP
  await p.evaluate(()=>{ arcadeMenu('beeGrandPrix'); });
  EV('menu');
  await sleep(1300);
  await p.evaluate(()=>{ const b=document.querySelector('#arcm-gr-kart [data-v="kart-rocket"]'); if(b) b.click(); });
  EV('pick_kart'); await sleep(900);
  await p.evaluate(()=>{ const b=[...document.querySelectorAll('.arcm-d')].find(x=>x.dataset.d==='champ'); if(b) b.click(); });
  EV('pick_champ'); await sleep(1000);
  await p.evaluate(()=>{ const b=document.querySelector('#arcm-go'); if(b) b.click(); });
  await sleep(2300);
  await p.evaluate(()=>{ const g=document.querySelector('#sg-howgo'); if(g) g.click(); });
  EV('countdown');
  await sleep(2300); EV('go');
  await p.evaluate(()=>{ window._race.clearBoxes(); });   // no unplanned gates — the story summons them

  const steer=async(k,ms)=>{ await p.keyboard.down(k); await sleep(ms); await p.keyboard.up(k); };

  // clean start — a good stretch of real racing
  await steer('ArrowRight',350); await sleep(1800);
  await steer('ArrowLeft',300); await sleep(1800);
  await steer('ArrowRight',250); await sleep(1600);

  // SETBACK 1: oil
  await p.evaluate(()=>{ window._race.toHaz('oil'); }); EV('oil_lined');
  await sleep(1400); EV('oil_hit'); await sleep(1400);
  // SETBACK 2: cop
  await p.evaluate(()=>{ window._race.toHaz('cop'); }); EV('cop_lined');
  await sleep(1400); EV('cop_hit'); await sleep(1200);
  // fall to LAST: drop behind the pack
  await p.evaluate(()=>{ const s=window._race.state(); window._race.jump(Math.max(0,s.pos-4200)); });
  EV('last_place'); await sleep(2600);

  // GATE 1: spell it clean → fire the earned power-up
  await p.evaluate(()=>{ window._race.gateNow(); }); EV('gate1_lined');
  for(let i=0;i<40;i++){ if(await p.evaluate(()=>!!document.querySelector('#sg-ci'))) break; await sleep(150); }
  EV('gate1_open'); await sleep(1500);
  const w1=await p.evaluate(()=>((window.__lastSay||'honey')+'').toLowerCase());
  console.log('WORD1',w1);
  await p.click('#sg-ci'); await p.keyboard.type(w1,{delay:190});
  await sleep(500); await p.click('#sg-cgo'); EV('gate1_unlock');
  await sleep(1600); await sleep(1200);
  await p.keyboard.press(' '); EV('gate1_fire');
  await sleep(3000);
  await steer('ArrowRight',300); await sleep(2200);

  // GATE 2: the near-miss — type, hesitate on a wrong letter, backspace, correct, unlock, ROCKET
  await p.evaluate(()=>{ window._race.gateNow(); }); EV('gate2_lined');
  for(let i=0;i<40;i++){ if(await p.evaluate(()=>!!document.querySelector('#sg-ci'))) break; await sleep(150); }
  EV('gate2_open'); await sleep(1600);
  const w2=await p.evaluate(()=>((window.__lastSay||'nectar')+'').toLowerCase());
  console.log('WORD2',w2);
  await p.click('#sg-ci');
  const half=Math.max(2,Math.floor(w2.length/2));
  await p.keyboard.type(w2.slice(0,half),{delay:210});
  await sleep(900);                                   // the hesitation
  const wrong=w2[half]==='e'?'i':'e';
  await p.keyboard.type(wrong,{delay:150}); EV('gate2_wrongkey');
  await sleep(1100);                                  // "wait. wait wait wait."
  await p.keyboard.press('Backspace'); await sleep(600);
  await p.keyboard.type(w2.slice(half),{delay:200});
  await sleep(500); await p.click('#sg-cgo'); EV('gate2_unlock');
  await sleep(1600); await sleep(1200);
  await p.keyboard.press(' '); EV('gate2_fire');       // ROCKET
  await sleep(3400);
  await steer('ArrowLeft',300); await sleep(2400);      // post-rocket clean racing

  // CLIMAX: sprint to the flag and cross it
  await p.evaluate(()=>{ const s=window._race.state(); window._race.jump(s.TOTAL-200*40); });
  EV('final_run');
  await sleep(800);
  await p.evaluate(()=>{ window._race.grant(1); }); await p.keyboard.press(' ');
  EV('final_boost');
  for(let i=0;i<80;i++){ if(await p.evaluate(()=>!!document.querySelector('.arc-play-result'))) break; await sleep(200); }
  EV('result');
  await sleep(3400);

  const path=await p.video().path();
  await ctx.close(); await b.close();
  fs.renameSync(path, OUT+'/ep1.webm');
  console.log('saved ep1.webm', Math.round(fs.statSync(OUT+'/ep1.webm').size/1024)+'KB');

  // ---- title + outro cards (in-app fonts) ----
  const b2=await chromium.launch({executablePath:CHROME});
  const c2=await b2.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});
  const p2=await c2.newPage();
  await p2.goto('http://localhost:8991/index.html',{waitUntil:'load'}); await sleep(7000);
  await p2.evaluate((k)=>{ state.children=[k]; state.activeIdx=0; ensureLists(active()); state.screen='app'; render(); }, KID);
  await sleep(300);
  const card=async(html,file)=>{ await p2.evaluate((h)=>{
      document.querySelectorAll('#vcard').forEach(e=>e.remove());
      const d=document.createElement('div'); d.id='vcard';
      d.style.cssText='position:fixed;inset:0;z-index:99999;display:grid;place-items:center;background:radial-gradient(120% 100% at 50% -10%,#3a2568,#241a45 55%,#15102e)';
      d.innerHTML=h; document.body.appendChild(d); },html);
    await sleep(900); await p2.screenshot({path:file}); };
  await card('<div style="text-align:center">'
    +'<div style="font-family:Fraunces,serif;font-weight:800;font-size:34px;color:#FFD873;letter-spacing:.35em;text-transform:uppercase">Episode 1</div>'
    +'<div style="font-family:Fraunces,serif;font-weight:800;font-size:96px;color:#fff;line-height:1.05;margin-top:14px">THE SPELLING<br>GRAND PRIX</div>'
    +'<div style="display:inline-block;margin-top:34px;padding:14px 34px;border-radius:14px;background:rgba(255,216,115,.14);border:2px solid rgba(255,216,115,.4);color:#FFD873;font-family:Fraunces,serif;font-weight:800;font-size:30px">CHAMP difficulty · one rule: last place = restart</div>'
    +'</div>','/tmp/vid/title.png');
  await card('<div style="text-align:center">'
    +'<div style="font-family:Fraunces,serif;font-weight:800;font-size:30px;color:rgba(255,255,255,.6);letter-spacing:.3em;text-transform:uppercase">Next episode</div>'
    +'<div style="font-family:Fraunces,serif;font-weight:800;font-size:92px;color:#fff;margin-top:10px">NEON CITY · AT NIGHT</div>'
    +'<div style="font-family:Fraunces,serif;font-weight:800;font-size:32px;color:#FFD873;margin-top:26px">Think you can beat my time?</div>'
    +'<div style="display:inline-block;margin-top:30px;padding:16px 40px;border-radius:15px;background:linear-gradient(135deg,#FFC23D,#F0803C);color:#2A1A08;font-family:Fraunces,serif;font-weight:800;font-size:30px">Play free → www.bizzingbee.com</div>'
    +'</div>','/tmp/vid/outro.png');
  await b2.close();
  console.log('cards done');
})();
