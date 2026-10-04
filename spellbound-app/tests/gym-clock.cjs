/* T4 — THE SPRINT'S SIXTY SECONDS ARE SIXTY REAL SECONDS, ON A SLOW PHONE TOO (games spec §1.4, §8).

   The Spelling Gym's Sprint runs at Chromium's 4x CPU throttle (the DevTools "4x slowdown") with a
   word on screen the whole time. The round must take 60 s of wall-clock time ± 3% — a clock that
   summed clamped frame steps (dt = min(0.05, …)) or counted frames ran slow exactly when the device
   was slow, which is the bug the spec names. And the clock is PATCHED in place: the same #gym-clock
   node counts down and the answer box keeps focus all round (a view rebuilt every second drops a
   phone's keyboard).
   Proved by breaking (see the commit that added it).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/gym-clock.cjs                            */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const { booted, until } = require('./lib/wait.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
const RATE = +process.env.GYM_CPU || 4;
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 40, lists: { journey: { xp: 30 } }, activeList: 'journey' };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(k => { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [k] })); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } }, KID);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  const cdp = await ctx.newCDPSession(pg); await cdp.send('Emulation.setCPUThrottlingRate', { rate: RATE });
  await pg.goto('file://' + ROOT + '/index.html#/gym/sprint'); await booted(pg, 90000);
  const ready = await until(pg, () => window.SB_GYM && SB_GYM.peek().phase === 'ready', null, 90000);
  ok(ready, `the Sprint waits on its ready card, words loaded, with no clock running (at ${RATE}x CPU)`);
  const before = await pg.evaluate(() => SB_GYM.peek().left);
  ok(before === null, 'no clock exists before Start');
  await pg.keyboard.press('Enter');
  const t0 = Date.now();
  await until(pg, () => SB_GYM.peek().phase === 'answer', null, 10000);
  await pg.evaluate(() => { const c = document.querySelector('#gym-clock'); if (c) c.__gymMark = 1; const i = document.querySelector('.gym-in'); if (i) i.__gymMark = 1; window.__ticks = []; });
  /* sample the clock text while the round runs, without touching the page */
  const samples = [];
  for (const at of [5, 20, 40]) { await until(pg, at => SB_GYM.peek().left != null && SB_GYM.peek().left <= 60 - at, at, 70000);
    samples.push(await pg.evaluate(() => { const c = document.querySelector('#gym-clock'), i = document.querySelector('.gym-in');
      return { text: c && c.textContent, same: !!(c && c.__gymMark), inp: !!(i && i.__gymMark), focus: document.activeElement === i }; })); }
  const done = await until(pg, () => SB_GYM.peek().phase === 'done', null, 90000);
  const wall = (Date.now() - t0) / 1000;
  const inPage = await pg.evaluate(() => { const p = SB_GYM.peek(); return p.t1 && p.t0 ? (p.t1 - p.t0) / 1000 : null; });
  ok(done && Math.abs(wall - 60) <= 1.8, `T4: at ${RATE}x CPU the Sprint took ${wall.toFixed(2)} s of real time (60 ± 1.8)`);
  ok(inPage != null && Math.abs(inPage - 60) <= 1.8, `T4: and by the page's own clock, start to end, ${inPage && inPage.toFixed(2)} s`);
  ok(samples.length === 3 && samples.every(s => s.same && s.inp), `the timer is patched in place: the same clock and answer box all round (${samples.map(s => s.text).join(' → ')})`);
  ok(samples.every(s => s.focus), 'and the answer box keeps the keyboard focus while the seconds tick');
  await b.close();
  ok(!errs.length, errs.length ? 'page errors: ' + errs[0] : 'no page errors');
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
