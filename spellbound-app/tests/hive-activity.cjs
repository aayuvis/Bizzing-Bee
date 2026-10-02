/* THE HIVE FEED (FIX-BEE O3, family standard §13).

   Bee never wrote `bizzing.activity`, so the Hive could not see a minute of it. Now the
   family drop-in (bizzing-activity.js, a classic-script port exposing BZ_ACTIVITY) records:
     · ACTIVE minutes for the active child — only after real input, whole minutes only,
       under that child's first name, and under the right name after a switch;
     · milestones, each once: an Atlas stop cleared (the frontier moving, however it moved),
       an Atlas region cleared, a new spelling level, a list stage mastered;
   and privacy.html says what the key holds and that it never leaves the device.
   Time is driven by Playwright's clock so a minute takes a moment, not a minute.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/hive-activity.cjs                     */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const URL = 'file://' + ROOT + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
/* Ahana stands on the last Meadow stop (u11): u1–u10 and both checkpoints are behind her */
const done = {}; for (let i = 1; i <= 10; i++) done['u' + i] = { 1: 88 };
const SEED = { theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [
  { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 50, band: 3, bandSeed: 3,
    lists: { journey: { xp: 30, stage: 1 } }, activeList: 'journey',
    trail: { lap: 1, done, chk: { '1:meadow:4': 90, '1:meadow:8': 90 }, seen: {}, st: {}, elap: 1, edone: {}, echk: {} } },
  { name: 'Ravi', age: 12, ageBand: '11-13', avatar: 'froggy', theme: 'spellbound', coins: 5, lists: { journey: { xp: 2 } }, activeList: 'journey',
    trail: { lap: 1, done: {}, chk: {}, seen: {}, st: {}, elap: 1, edone: {}, echk: {} } } ] };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  const ctx = await b.newContext({ viewport: { width: 1100, height: 900 } });
  await ctx.clock.install();
  await ctx.addInitScript(s => { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_splash', '0'); localStorage.removeItem('bizzing.activity'); localStorage.setItem('t_seed', '1'); } }, SEED);
  const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(URL); await pg.waitForTimeout(3000);
  await pg.evaluate(() => new Promise(r => SB_LAZY.need('atlas', r)));
  const feed = () => pg.evaluate(() => { try { return JSON.parse(localStorage.getItem('bizzing.activity') || 'null'); } catch (e) { return null; } });
  ok(await pg.evaluate(() => !!(window.BZ_ACTIVITY && BZ_ACTIVITY.trackActivity && BZ_ACTIVITY.trackMilestone)), 'the family drop-in is loaded as a classic script (window.BZ_ACTIVITY)');

  /* ---- minutes: nothing without input, then whole minutes for the active child ---- */
  /* opening the app counts as a touch (the drop-in's rule), so its own two-minute window may
     write; after that, an open tab nobody touches must add nothing */
  const total = f2 => (f2 ? f2.s : []).filter(x => x.a === 'bee').reduce((t, x) => t + (x.m || 0), 0);
  await pg.clock.runFor(3 * 60 * 1000);
  let f = await feed(); const idle0 = total(f);
  await pg.clock.runFor(5 * 60 * 1000);
  f = await feed();
  ok(idle0 <= 2 && total(f) === idle0, `five more minutes with nobody touching the app write nothing (${idle0} → ${total(f)})`);
  for (let i = 0; i < 6; i++) { await pg.mouse.click(600, 500); await pg.keyboard.press('Shift'); await pg.clock.runFor(15500); }
  f = await feed();
  const mins = f ? f.s.filter(x => x.a === 'bee' && x.m > 0) : [];
  ok(mins.length >= 1 && mins.every(x => x.who === 'Ahana' && /^\d{4}-\d\d-\d\d$/.test(x.d) && Number.isInteger(x.m)),
    'after real input, bizzing.activity holds whole active minutes for Ahana: ' + JSON.stringify(mins));

  /* ---- milestones ---- */
  const ms = async () => ((await feed()) || { s: [] }).s.filter(x => x.m === 0 && x.ev);
  await pg.evaluate(() => { app.setNav('home'); }); await pg.clock.runFor(600);      // the baseline snapshot
  ok((await ms()).length === 0, 'the first look at a child is a baseline — no milestones for the past');
  /* a real stop completion: Practice reports 10/10 on the frontier stop (u11), crossing its gate */
  await pg.evaluate(() => { state.trailCourse = 'honey'; SB_TRAIL_PRACTICED('u11', 10, 10); render(); }); await pg.clock.runFor(800);
  let m = await ms();
  const stop = m.filter(x => x.ev === 'stop'), world = m.filter(x => x.ev === 'world');
  ok(stop.length === 1 && stop[0].who === 'Ahana' && stop[0].a === 'bee' && /Ask the Right Questions/.test(stop[0].label),
    'clearing an Atlas stop writes one "stop" milestone, named: ' + JSON.stringify(stop.map(x => x.label)));
  ok(world.length === 1 && /The Meadow/.test(world[0].label), 'and it was the last stop of the Meadow, so one "world" milestone: ' + JSON.stringify(world.map(x => x.label)));
  /* a new spelling level, and a list stage mastered */
  /* the level is THE one level (oneLevel: list XP from words spelled right, FIX-BEE C6) — raise it by one */
  const target = await pg.evaluate(() => { const c = active(); const L = oneLevel(c).level + 1; c.lists.journey = c.lists.journey || {};
    let x = 0; while (levelFromXp(x).level < L) x++; const other = rankXp(c) - (c.lists.journey.xp || 0); c.lists.journey.xp = Math.max(0, x - other);
    c.lists.journey.stage = 2; render(); return L; }); await pg.clock.runFor(800);
  m = await ms();
  ok(m.filter(x => x.ev === 'band').length === 1 && new RegExp('level ' + target + '\\b', 'i').test(m.find(x => x.ev === 'band').label), 'a new level writes one "band" milestone: ' + JSON.stringify(m.filter(x => x.ev === 'band').map(x => x.label)));
  ok(m.filter(x => x.ev === 'mastery').length === 1, 'a list stage mastered writes one "mastery" milestone: ' + JSON.stringify((m.find(x => x.ev === 'mastery') || {}).label));
  /* re-rendering, reloading: nothing is counted twice */
  const n0 = m.length;
  await pg.evaluate(() => { render(); app.setNav('trail'); app.setNav('home'); }); await pg.clock.runFor(800);
  await pg.reload(); await pg.waitForTimeout(2500); await pg.evaluate(() => new Promise(r => SB_LAZY.need('atlas', r))); await pg.clock.runFor(800);
  ok((await ms()).length === n0, `renders and a reload add no milestone twice (${n0})`);

  /* ---- switching child: the minutes follow the child playing ---- */
  await pg.evaluate(() => app.famSwitch(1)); await pg.clock.runFor(400);
  for (let i = 0; i < 6; i++) { await pg.mouse.click(600, 500); await pg.clock.runFor(15500); }
  f = await feed();
  ok(f.s.some(x => x.who === 'Ravi' && x.m > 0), 'after switching, the minutes go to Ravi');
  ok(!(await ms()).some(x => x.who === 'Ravi'), "and Ravi's first look is a baseline too — he inherits none of Ahana's milestones");

  /* ---- what the policy says ---- */
  const priv = fs.readFileSync(path.join(ROOT, 'privacy.html'), 'utf8');
  ok(/bizzing\.activity/.test(priv) && /never sent\s+anywhere/.test(priv) && /Effective 2 October 2026/.test(priv), 'privacy.html names bizzing.activity, says it never leaves the device, and moved its effective date');
  const src = fs.readFileSync(path.join(ROOT, 'bizzing-activity.js'), 'utf8');
  ok(!/fetch\(|XMLHttpRequest|sendBeacon|WebSocket/.test(src), 'the drop-in has no network call in it');

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
