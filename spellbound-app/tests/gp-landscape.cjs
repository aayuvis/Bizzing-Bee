/* ON A PHONE THE GRAND PRIX RACES EITHER WAY UP — AND NOBODY PICKS A CHAMPION FIRST.

   1 Oct asked for landscape only ("on mobile run the racing game in landscape mode, tell the
   user to turn their phone"); 4 Oct the owner reversed it: upright must be playable without
   turning the phone. The sideways layout stays exactly as it was. Driven as a phone drives it
   — touch, a coarse pointer — upright → turned → upright:
     1. the start menu has no hero row; the race uses the speller's own buddy;
     2. UPRIGHT it starts by itself (no "turn your phone" card): the road is the top ~60% at
        the full width, the HUD floats over its sky, and every control (Steer Left, Brake,
        Steer Right, the power-up slot) sits in the thumb zone BELOW the road — on screen,
        ≥56px, none over the canvas, each the thing a finger lands on;
     3. a real touch on Steer Right steers (and lifting it lets go); the keyboard still
        steers and brakes; the spelling card opens at the TOP (the keyboard takes the bottom);
     4. TURNED mid-race it re-lays the same race out sideways — nothing restarts, nothing
        pauses, a thumb held on the wheel is let go — fits the screen with the controls in
        the gutters, off the road;
     5. turned upright again, the same race carries on in the upright layout.
   Proved by breaking (4 Oct 2026), each put back and the file cmp'd after: the old build
   (turn card, sideways only) fails 15 of 20; the steer row on the road fails "below the road";
   no letGo() on a turn fails "a held thumb is let go"; the card centred fails "at the TOP";
   a turn that resets the race fails "the same race"; the HUD in flow fails "over the sky"; a
   48px brake fails "≥56px"; buttons with pointer-events:none fail "what a finger lands on" and
   the touch check; the road at 80% fails "~60%"; the power-up slot on the brake fails
   "what a finger lands on".
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
  const cdp = await ctx.newCDPSession(pg);
  const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
  await pg.goto('file://' + path.resolve(__dirname, '..') + '/index.html'); await pg.waitForTimeout(4500);
  await pg.evaluate(() => new Promise(r => SB_LAZY.need('arcade', r)));   // the engines are lazy since FIX-BEE N2 (boot-lazy 'arcade')
  ok(await pg.evaluate(() => matchMedia('(pointer:coarse)').matches), 'the page sees a phone (coarse pointer)');

  /* 1 — NO CHAMPION CHOICE. (The saved menu choice says 'luna'; the buddy is 'panda'.) */
  await pg.evaluate(() => { state.devBannerOff = true; render(); arcadeMenu('beeGrandPrix'); }); await pg.waitForTimeout(900);
  const menu = await pg.evaluate(() => ({ heroRow: !!document.querySelector('#arcm-avs'), preview: !!document.querySelector('#arcm-prev'),
    karts: document.querySelectorAll('#arcm-gr-kart .arcm-opt').length, start: !!document.querySelector('#arcm-go') }));
  ok(!menu.heroRow && !menu.preview, 'the start menu asks for no champion — no hero row, no hero preview');
  ok(menu.karts === 5 && menu.start, `and still offers the kart, the track and Start (${menu.karts} karts)`);
  await pg.evaluate(() => document.querySelector('#arcm-go').click()); await pg.waitForTimeout(2600);
  const chip = await pg.evaluate(() => { const i = document.querySelector('.arc-play .arc-play-av img'); return i ? i.src.split('/').pop() : ''; });
  ok(/panda/.test(chip), `the driver is the speller's own buddy, not a stale menu pick (${chip || 'none'})`);

  /* the geometry of whatever layout is on screen now */
  const geo = () => pg.evaluate(() => { const s = window._race && window._race.state(); const cv = document.querySelector('.arc-play #sg-cv');
    if (!s || !cv) return { none: true, turn: !!document.querySelector('.arc-play .sg-turn') };
    const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    const c = R(cv), hud = R(document.querySelector('.arc-play .sg-racehud'));
    const ctl = [...document.querySelectorAll('.arc-play .sg-sbtn, .arc-play #sg-hold')].map(e => { const q = R(e);
      const hit = document.elementFromPoint((q.l + q.r) / 2, (q.t + q.b) / 2);
      return { ...q, name: e.getAttribute('aria-label'), mine: !!hit && (hit === e || e.contains(hit)) }; });
    const over = (q, z) => q.l < z.r - 1 && q.r > z.l + 1 && q.t < z.b - 1 && q.b > z.t + 1;
    return { mode: s.mode, land: s.land, port: s.port, pos: s.pos, hz: s.hz, c, hud, vw: innerWidth, vh: innerHeight,
      nCtl: ctl.length, onCanvas: ctl.filter(q => over(q, c)).map(q => q.name), small: ctl.filter(q => Math.min(q.w, q.h) < 56).map(q => q.name + ' ' + Math.round(q.w) + '×' + Math.round(q.h)),
      off: ctl.filter(q => q.l < 0 || q.t < 0 || q.r > innerWidth || q.b > innerHeight).map(q => q.name), covered: ctl.filter(q => !q.mine).map(q => q.name),
      below: ctl.every(q => q.t >= c.b - 1), right: ctl.find(q => q.name === 'Steer right'),
      turn: !!document.querySelector('.arc-play .sg-turn') }; });

  /* 2 — UPRIGHT: IT RACES, AND THE ROAD IS CLEAR OF THUMBS */
  const u = await geo();
  ok(!u.none && !u.turn && u.port && !u.land && (u.mode === 'count' || u.mode === 'race'), `held upright the race starts by itself — no "turn your phone" card (${u.mode}, upright layout ${u.port})`);
  ok(!u.none && Math.abs(u.c.l) <= 1 && Math.abs(u.c.r - u.vw) <= 1 && u.c.h / u.vh > 0.5 && u.c.h / u.vh < 0.66,
    `the road is the full width and the upper ~60% (${u.c && Math.round(u.c.w)}×${u.c && Math.round(u.c.h)} of ${u.vw}×${u.vh}, ${u.c && Math.round(u.c.h / u.vh * 100)}%)`);
  ok(!u.none && u.hud.t >= u.c.t && u.hud.b < u.c.t + u.hz, `the HUD floats over the sky, above the horizon (HUD ${u.hud && Math.round(u.hud.t)}–${u.hud && Math.round(u.hud.b)}, horizon at ${u.c && Math.round(u.c.t + u.hz)})`);
  ok(!u.none && u.nCtl === 4 && u.onCanvas.length === 0 && u.below, `every control sits below the road, none on it (${u.nCtl} controls, over the road: ${(u.onCanvas || []).join(', ') || 'none'})`);
  ok(!u.none && !u.small.length, `each is a thumb-sized target, ≥56px (${(u.small || ['no race']).join(', ') || 'all are'})`);
  ok(!u.none && !u.off.length && !u.covered.length, `all on screen and each is what a finger lands on (off: ${u.off && u.off.join(', ') || 'none'}; covered: ${u.covered && u.covered.join(', ') || 'none'})`);
  if (u.none) {   // nothing is racing upright — every check after this one needs a race, so they all fail here
    ['upright by touch', 'upright by keyboard', 'the spelling card at the top', 'let go on a turn', 'the same race sideways', 'fits sideways', 'gutters sideways', 'races on', 'upright again']
      .forEach(n => ok(false, n + ' — no race on screen upright'));
    await b.close(); console.log(`\n${fails} FAILED\n`); process.exit(1);
  }
  await pg.waitForTimeout(1500);

  /* 3 — UPRIGHT, BY TOUCH AND BY KEYBOARD */
  await pg.evaluate(() => { window._race.clearBoxes(); window._race.toStraight(90); window._race.steerTo(0); window._race.setV(0.6); });
  const r = (await geo()).right; const x0 = await pg.evaluate(() => window._race.state().x);
  await touch('touchStart', (r.l + r.r) / 2, (r.t + r.b) / 2); await pg.waitForTimeout(450);
  const held = await pg.evaluate(() => window._race.state()); await touch('touchEnd'); await pg.waitForTimeout(120);
  const lifted = await pg.evaluate(() => window._race.state());
  ok(held.steer === 1 && held.x > x0 + 0.1 && lifted.steer === 0, `a thumb on Steer Right steers right (x ${x0.toFixed(2)} → ${held.x.toFixed(2)}), and lifting it lets go (${lifted.steer})`);
  await pg.evaluate(() => { window._race.steerTo(0); });
  await pg.keyboard.down('ArrowLeft'); await pg.waitForTimeout(350); const kl = await pg.evaluate(() => window._race.state()); await pg.keyboard.up('ArrowLeft');
  await pg.keyboard.down('ArrowDown'); await pg.waitForTimeout(150); const kb = await pg.evaluate(() => window._race.state()); await pg.keyboard.up('ArrowDown');
  ok(kl.steer === -1 && kl.x < -0.05 && kb.braking, `the keyboard still steers (← ${kl.x.toFixed(2)}) and brakes (↓ ${kb.braking})`);
  await pg.evaluate(() => { window._race.steerTo(0); window._race.setV(0.8); window._race.gateNow(); });
  await pg.waitForFunction(() => window._race.state().mode === 'spell', null, { timeout: 5000 }).catch(() => null); await pg.waitForTimeout(300);
  const card = await pg.evaluate(() => { const c = document.querySelector('.arc-play #sg-card .sg-cardbox'); if (!c) return null; const q = c.getBoundingClientRect();
    return { t: q.top, b: q.bottom, mode: window._race.state().mode, input: !!c.querySelector('input') }; });
  ok(card && card.mode === 'spell' && card.input && card.t < 60 && card.b < 844 * 0.5, `a ? box opens the spelling card at the TOP, clear of the keyboard (${card && Math.round(card.t)}–${card && Math.round(card.b)}px)`);
  await pg.evaluate(() => { const i = document.querySelector('#sg-ci'); if (!i) return; i.value = 'zz'; i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); });
  await pg.waitForTimeout(1600);

  /* 4 — TURNED MID-RACE, WITH A THUMB ON THE WHEEL: SAME RACE, SIDEWAYS, LET GO */
  await pg.evaluate(() => { window._race.clearBoxes(); window._race.toStraight(90); window._race.steerTo(0); window._race.setV(0.6); });   // on the road, so "it races on" measures the layout, not the grass
  const before = await pg.evaluate(() => window._race.state());
  const r2 = (await geo()).right;
  await touch('touchStart', (r2.l + r2.r) / 2, (r2.t + r2.b) / 2); await pg.waitForTimeout(200);
  const heldBefore = await pg.evaluate(() => window._race.state().steer);
  await pg.setViewportSize({ width: 844, height: 390 }); await pg.waitForTimeout(900);
  const land = await geo(); const sAfter = await pg.evaluate(() => window._race.state());
  await touch('touchEnd');
  ok(heldBefore === 1 && sAfter.steer === 0 && !sAfter.braking, `a thumb held on the wheel through the turn is let go (${heldBefore} → ${sAfter.steer})`);
  ok(!land.none && land.land && !land.port && !land.turn && land.pos >= before.pos && before.pos > 0 && (land.mode === 'race' || land.mode === 'count'),
    `turned sideways it is the same race, laid out again — not restarted, not paused (pos ${Math.round(before.pos)} → ${Math.round(land.pos)}, ${land.mode})`);
  ok(!land.none && land.c.l >= 0 && land.c.r <= land.vw && land.c.b <= land.vh + 1, `and the road fits the screen — ${land.c && [land.c.l, land.c.t, land.c.r, land.c.b].map(Math.round).join(',')} in ${land.vw}×${land.vh}`);
  const steerOnRoad = await pg.evaluate(() => { const cv = document.querySelector('.arc-play #sg-cv').getBoundingClientRect();
    return [...document.querySelectorAll('.arc-play .sg-sbtn')].map(x => x.getBoundingClientRect()).filter(q => q.left < cv.right - 1 && q.right > cv.left + 1 && q.top < cv.bottom - 1 && q.bottom > cv.top + 1).length; });
  ok(!land.none && land.nCtl === 4 && steerOnRoad === 0 && !land.off.length, `sideways no steering control sits on the road — they live in the gutters (${steerOnRoad} overlap)`);
  await pg.waitForTimeout(1200);
  const moving = await pg.evaluate(() => window._race.state());
  ok(moving.mode === 'race' && moving.pos > land.pos, `and it races on (${Math.round(land.pos)} → ${Math.round(moving.pos)})`);

  /* 5 — UPRIGHT AGAIN: THE SAME RACE, UPRIGHT */
  await pg.evaluate(() => window._race.steerTo(0));
  await pg.setViewportSize({ width: 390, height: 844 }); await pg.waitForTimeout(900);
  const u2 = await geo(); await pg.waitForTimeout(700); const u3 = await pg.evaluate(() => window._race.state());
  ok(!u2.none && u2.port && !u2.turn && u2.onCanvas.length === 0 && u2.below && u3.pos > u2.pos && u2.pos >= moving.pos,
    `turned upright again it carries on, controls below the road (${Math.round(moving.pos)} → ${Math.round(u3.pos)}, ${u3.mode})`);

  await b.close();
  ok(!errs.length, errs.length ? 'page errors: ' + errs[0] : 'no page errors');
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
