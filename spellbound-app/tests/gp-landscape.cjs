/* ON A PHONE THE GRAND PRIX RACES SIDEWAYS — AND NOBODY PICKS A CHAMPION FIRST.

   Two asks, one afternoon: "on mobile run the racing game in landscape mode, tell the user
   to turn their phone", and "don't ask for champion choice at the beginning of the game".
   Driven as a phone would drive it — touch, a coarse pointer, held upright, then turned:
     1. the start menu has no hero row; the race uses the speller's own buddy;
     2. upright, the race does not start: "Turn your phone sideways" and no canvas;
     3. turned, it starts by itself (the menu already explained it), fits the screen, and
        no control sits on the road — they live in the gutters either side;
     4. turned upright mid-race, it PAUSES under the same card (the track does not move);
     5. turned back, it resumes on a countdown.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/gp-landscape.cjs                */
const { chromium } = require('playwright');
const path = require('path');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => require('fs').existsSync(p)) });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => { window.SB_DEBUG = true; try { if (!localStorage.getItem('seeded')) {
    localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', activeIdx: 0,
      children: [{ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 100, unlockedThemes: ['spellbound'], xp: 40, level: 3,
                   arcGame: { beeGrandPrix: { av: 'luna', diff: 'auto', opts: {} } } }] }));
    localStorage.setItem('seeded', '1'); localStorage.setItem('sb_splash', '0'); } } catch (e) {} });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + path.resolve(__dirname, '..') + '/index.html'); await pg.waitForTimeout(4500);
  ok(await pg.evaluate(() => matchMedia('(pointer:coarse)').matches), 'the page sees a phone (coarse pointer)');

  /* 1 — NO CHAMPION CHOICE. (The saved menu choice says 'luna'; the buddy is 'panda'.) */
  await pg.evaluate(() => { state.devBannerOff = true; render(); arcadeMenu('beeGrandPrix'); }); await pg.waitForTimeout(900);
  const menu = await pg.evaluate(() => ({ heroRow: !!document.querySelector('#arcm-avs'), preview: !!document.querySelector('#arcm-prev'),
    karts: document.querySelectorAll('#arcm-gr-kart .arcm-opt').length, start: !!document.querySelector('#arcm-go') }));
  ok(!menu.heroRow && !menu.preview, 'the start menu asks for no champion — no hero row, no hero preview');
  ok(menu.karts === 5 && menu.start, `and still offers the kart, the track and Start (${menu.karts} karts)`);
  await pg.evaluate(() => document.querySelector('#arcm-go').click()); await pg.waitForTimeout(1200);

  /* 2 — UPRIGHT: ASK, DON'T RACE */
  const up = await pg.evaluate(() => ({ turn: (document.querySelector('.arc-play .sg-turn') || {}).textContent || '', canvas: !!document.querySelector('.arc-play #sg-cv') }));
  ok(/turn your phone sideways/i.test(up.turn) && !up.canvas, `held upright the race waits and says "${up.turn.slice(0, 26)}…"`);
  const chip = await pg.evaluate(() => { const i = document.querySelector('.arc-play .arc-play-av img'); return i ? i.src.split('/').pop() : ''; });
  ok(/panda/.test(chip), `the driver is the speller's own buddy, not a stale menu pick (${chip || 'none'})`);

  /* 3 — TURNED: IT STARTS, FITS, AND THE ROAD IS CLEAR OF CONTROLS */
  await pg.setViewportSize({ width: 844, height: 390 }); await pg.waitForTimeout(2600);
  const land = await pg.evaluate(() => { const s = window._race && window._race.state(); const cv = document.querySelector('.arc-play #sg-cv');
    if (!s || !cv) return null; const r = cv.getBoundingClientRect();
    const btn = [...document.querySelectorAll('.arc-play .sg-sbtn')].map(x => x.getBoundingClientRect());
    const onRoad = btn.filter(q => q.left < r.right - 1 && q.right > r.left + 1 && q.top < r.bottom - 1 && q.bottom > r.top + 1).length;
    return { mode: s.mode, land: s.land, r: [r.left, r.top, r.right, r.bottom].map(Math.round), vw: innerWidth, vh: innerHeight, onRoad, nBtn: btn.length,
             turn: !!document.querySelector('.arc-play .sg-turn') }; });
  ok(land && land.land && !land.turn && (land.mode === 'count' || land.mode === 'race'), `turned sideways the race starts by itself (${land && land.mode})`);
  ok(land && land.r[0] >= 0 && land.r[2] <= land.vw && land.r[3] <= land.vh + 1, `and the road fits the screen — ${land && land.r.join(',')} in ${land && land.vw}×${land && land.vh}`);
  ok(land && land.nBtn >= 3 && land.onRoad === 0, `no steering control sits on the road (${land && land.onRoad} of ${land && land.nBtn} overlap)`);
  await pg.waitForTimeout(1200);

  /* 4 — UPRIGHT MID-RACE: PAUSED */
  await pg.setViewportSize({ width: 390, height: 844 }); await pg.waitForTimeout(700);
  const p0 = await pg.evaluate(() => window._race.state()); await pg.waitForTimeout(700); const p1 = await pg.evaluate(() => window._race.state());
  const card = await pg.evaluate(() => !!document.querySelector('.arc-play .sg-turn-wrap .sg-turn'));
  ok(p0.paused && card && p0.pos === p1.pos, `turned upright mid-race it pauses under the same card (track moved ${Math.round(p1.pos - p0.pos)})`);

  /* 5 — TURNED BACK: A COUNTDOWN, THEN RACING */
  await pg.setViewportSize({ width: 844, height: 390 }); await pg.waitForTimeout(500);
  const r1 = await pg.evaluate(() => ({ s: window._race.state(), card: !!document.querySelector('.arc-play .sg-turn') }));
  await pg.waitForTimeout(1400); const r2 = await pg.evaluate(() => window._race.state());
  ok(!r1.s.paused && !r1.card && r1.s.mode === 'count' && r2.mode === 'race' && r2.pos > r1.s.pos, `turned back it counts down and races on (${r1.s.mode} → ${r2.mode})`);

  await b.close();
  ok(!errs.length, errs.length ? 'page errors: ' + errs[0] : 'no page errors');
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
