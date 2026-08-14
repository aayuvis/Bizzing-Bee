#!/usr/bin/env node
/* Capture REAL screenshots of the app for the landing page.
   The landing page was showing painted world backdrops — the art the games are drawn
   ON, with no game on it. To a child that is eight pictures of empty scenery. This
   drives the actual app and photographs what it actually looks like.
   Output: app-art/shots/*.jpg  (run from spellbound-app/)
      python3 -m http.server 8991
      NODE_PATH=/opt/node22/lib/node_modules /opt/node22/bin/node qa/shots.cjs   */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'app-art', 'shots');
const BASE = process.env.BASE || 'http://localhost:8991/index.html';
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const KID = { name:'Ana', age:11, theme:'spellbound', avatar:'bizzy', goal:15, coins:1240,
  level:6, tier:'regional', addons:{advanced:1}, questPath:'coach', lists:{},
  missed:['liaison','rhythm'], xp:8200, streak:12 };

/* A screenshot must show the PRODUCT, not the scaffolding around it. Two things were
   in every frame of the first run: the amber "still being built" banner, and the
   first-run Advanced tour card, which sat over the whole mock bee. Both are real and
   both are correct in the app; neither belongs in a picture of it. */
const seed = p => p.evaluate(k => {
  state.children=[k]; state.activeIdx=0; ensureLists(state.children[0]);
  state.devUnlock=true; state.premium=true; state.screen='app'; state.mode='light';
  state.devBannerOff = true;                       // no build banner in the shot
     // no first-run tour card
  state.advAnnounced = true;
  try { const c = active(); c.advAnnounced = true; c.badgesSeen = 1; } catch(e) {}
  state.settingsOpen = false; state.showTiers = false; state.pinDlg = null;
  render();
}, KID);

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: CHROME });
  const ctx = await b.newContext({ viewport:{ width:1180, height:820 }, deviceScaleFactor:2 });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('  pageerror:', e.message.slice(0,90)));
  await p.goto(BASE, { waitUntil:'load' });
  await p.waitForTimeout(6500);
  await seed(p);

  const shot = async (name, ms=900, clip=null) => {
    await p.waitForTimeout(ms);
    await p.evaluate(() => { state.devBannerOff = true; document.querySelectorAll('.sb-boot').forEach(e => e.remove()); });
    await p.waitForTimeout(120);
    const f = path.join(OUT, name + '.jpg');
    await p.screenshot({ path:f, type:'jpeg', quality:82, clip: clip||undefined });
    const kb = Math.round(fs.statSync(f).size/1024);
    console.log(`  ${name.padEnd(20)} ${kb}KB`);
  };

  /* ---- 1. the word card: the single most self-selling screen in the app ---- */
  await p.evaluate(() => {
    state.nav='coach'; try{ ensureCoachWords(); }catch(e){}
    try{ state.coachTab='cards'; }catch(e){} render();
  });
  await p.waitForTimeout(1200);
  const card = await p.evaluate(() => {
    const el=[...document.querySelectorAll('#root *')]
      .filter(e=>{const r=e.getBoundingClientRect(); return r.width>320&&r.width<760&&r.height>380;})
      .sort((a,b)=>b.getBoundingClientRect().height-a.getBoundingClientRect().height)[0];
    if(!el) return null; const r=el.getBoundingClientRect();
    return { x:Math.max(0,r.x-8), y:Math.max(0,r.y-8), width:Math.min(r.width+16,1180), height:Math.min(r.height+16,820) };
  });
  await shot('card', 300, card);

  /* ---- 2. the mock bee, mid-round ---- */
  await p.evaluate(async () => {
    state.nav='mockbee'; render(); await new Promise(r=>setTimeout(r,300));
    try{ app.mbStart(); }catch(e){}
  });
  await shot('mockbee', 3200);

  /* ---- 3. the journey, mapped ---- */
  await p.evaluate(() => { state.nav='trail'; state.trailAct=null; render(); });
  await shot('atlas', 1800);

  /* ---- 4. the collection ---- */
  await p.evaluate(() => { state.nav='collection'; render(); });
  await shot('collection', 1400);

  /* ---- 5. the games, actually being played ----
     Each engine is mounted full-bleed and driven past its how-to card, then given a
     couple of seconds to reach a frame with something happening in it. */
  /* The arcade's eight games (matches SB_ARCADE_GAMES), so the landing shows what a
     child can actually play — not the culled Whack-a-Moth / Comb Catcher. */
  const GAMES = [
    ['beeGrandPrix','hive'], ['honeycombRun','meadow'], ['typeBlaster','arcade'],
    ['keepFlying','sky'], ['wordSnake','forest'], ['unscrambleStars','cosmos'],
    ['spotlightSimon','stage'], ['spellScene','homecoming'],
  ];
  for (const [eng, world] of GAMES) {
    const ok = await p.evaluate(async ({eng, world}) => {
      document.querySelectorAll('#shotHost').forEach(e=>e.remove());
      const host=document.createElement('div'); host.id='shotHost';
      host.style.cssText='position:fixed;inset:0;z-index:99999;background:#241E33';
      document.body.appendChild(host);
      try { SB_SAGA_ENGINES[eng](host, {diff:'easy', world, onUnlock(){}}, ()=>{}); }
      catch(e){ return 'threw '+e; }
      await new Promise(r=>setTimeout(r,700));
      const go=host.querySelector('#sg-howgo, .sg-howto-go'); if(go) go.click();
      await new Promise(r=>setTimeout(r,250));
      for(let i=0;i<14;i++){
        host.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));
        window.dispatchEvent(new KeyboardEvent('keydown',{key:' ',bubbles:true}));
        window.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
        await new Promise(r=>setTimeout(r,110));
      }
      return 'ok';
    }, {eng, world});
    if (ok !== 'ok') { console.log(`  ${eng}: ${ok}`); continue; }
    await shot('game-' + eng, 1500);
    await p.evaluate(()=>{ const h=document.getElementById('shotHost'); if(h) h.remove(); });
  }

  await b.close();
  const files = fs.readdirSync(OUT).filter(f=>f.endsWith('.jpg'));
  const kb = files.reduce((s,f)=>s+fs.statSync(path.join(OUT,f)).size,0)/1024;
  console.log(`\n  ${files.length} shots, ${Math.round(kb)}KB total in app-art/shots/`);
})();
