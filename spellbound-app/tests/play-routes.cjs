/* THE ARCADE OVERLAY HAS AN ADDRESS (games spec §1.6, T9, 4 Oct 2026)

   Bee Grand Prix, Type Blaster and Honeycomb Run play in a fullscreen overlay appended to
   <body> (app3 arcadePlay), outside the string render — so the screen under it never changed
   its route, #/play/<game> did not exist, and Back had nothing to step back from. Now:
     - #/play/grandprix · #/play/blaster · #/play/honeycomb open the game through arcadePlay
       (the same door a tap uses), and the address reads that while it is up;
     - Back from the game lands on the Play door (#/play) with the overlay gone;
     - a game opened by a tap pushes its address, and its own "← Arcade" button leaves it
       without leaving an entry behind that Back would reopen.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/play-routes.cjs                    */
'use strict';
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const { booted, until } = require('./lib/wait.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const SEED = { theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0,
  children: [{ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 40, lists: { journey: { xp: 12 } }, activeList: 'journey' }] };
const GAMES = [['grandprix', 'beeGrandPrix'], ['blaster', 'typeBlaster'], ['honeycomb', 'honeycombRun']];

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || (fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined) });
  const ctx = await b.newContext({ viewport: { width: 1180, height: 820 } });
  await ctx.addInitScript(s => { try { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } } catch (e) {} }, SEED);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + ROOT + '/index.html');
  ok(await booted(pg), 'the app boots');
  await pg.evaluate(() => { location.hash = '#/play'; });
  ok(await until(pg, () => state.nav === 'games' && location.hash === '#/play'), '#/play opens the Play door');
  const hash = () => pg.evaluate(() => location.hash);
  for (const [slug, k] of GAMES) {
    /* typed address → the game */
    await pg.evaluate(s => { location.hash = '#/play/' + s; }, slug);
    const up = await until(pg, ([s]) => { const el = document.querySelector('.arc-play'); return !!el && el.getAttribute('data-route') === 'play/' + s
      && location.hash === '#/play/' + s && !!document.querySelector('#arc-host') && document.querySelector('#arc-host').children.length > 0; }, [slug], 20000);
    ok(up, `#/play/${slug} opens ${k} in the arcade overlay and the address reads #/play/${slug} (${await hash()})`);
    /* Back → the door, the game gone */
    await pg.evaluate(() => history.back());
    const back = await until(pg, () => !document.querySelector('.arc-play') && location.hash === '#/play' && state.nav === 'games', null, 10000);
    ok(back, `Back from ${slug} returns to the Play door with the game closed (${await hash()})`);
    /* a tap pushes the address; ← Arcade leaves it without an entry Back would reopen */
    await pg.evaluate(k => app.arcadePlay(k), k);
    ok(await until(pg, ([s]) => location.hash === '#/play/' + s && !!document.querySelector('.arc-play'), [slug]), `a tap on ${k} puts #/play/${slug} in the address`);
    await pg.evaluate(() => document.querySelector('#arc-back').click());
    ok(await until(pg, () => !document.querySelector('.arc-play') && location.hash === '#/play' && state.nav === 'games', null, 10000),
      `${k}'s own ← Arcade lands on #/play (${await hash()})`);
    await pg.evaluate(() => history.back());
    await until(pg, () => location.hash !== '#/play', null, 3000);
    const reopened = await pg.evaluate(() => !!document.querySelector('.arc-play'));
    ok(!reopened, `Back after ← Arcade does not reopen ${k}`);
    await pg.evaluate(() => { location.hash = '#/play'; });
    await until(pg, () => state.nav === 'games' && location.hash === '#/play');
  }
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
