/* focus-keep.cjs — a background redraw keeps the keyboard focus; a redraw the child caused does not (app3 render,
   "A BACKGROUND REDRAW KEEPS THE FOCUS", 14 Oct 2026).

   Why: render() rebuilds #root, so every button is new after a redraw. A file landing in the first seconds (boot-lazy's
   softRender) took a keyboard user's focus off the button they were on and dropped it on <body> — their Enter landed
   nowhere (kudos' desktop walk caught it in full runs 6 and 8). A redraw marked SB_RENDER_SOFT now puts the focus back
   on the same control (the nth [data-act] with the same data-act and data-arg). A redraw the child CAUSED is left as it
   was: a button keeping the focus after its own click would act twice on the drills' global Enter.

   1. Focus a Home control, land a real lazy file: the soft redraw happens, and the focus is on the same control after it.
   2. Enter on it then does what the control does (the keyboard user is not lost).
   3. A redraw the child caused (render() with no soft mark) does not put the focus back.
   4. Restoring never scrolls the page (focus({preventScroll:true})).

   Proved by breaking (14 Oct 2026, scratch roots of symlinks with ONE file replaced, FK_ROOT=…):
     app3 without the restore                          → 1 and 2 fail
     the restore on every redraw (soft mark ignored)   → 3 fails
     boot-lazy not marking its redraw                  → 1 and 2 fail
   Run: node tests/focus-keep.cjs                                                                               */
'use strict';
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const { booted, until } = require('./lib/wait.cjs');
const ROOT = process.env.FK_ROOT || path.resolve(__dirname, '..');
let fails = 0; const ok = (c, m) => { console.log((c ? '  OK   ' : '  FAIL ') + m); if (!c) fails++; };
const SEED = { theme: 'spellbound', mode: 'light', premium: false, activeIdx: 0, pin: '1234',
  children: [{ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'fox', theme: 'spellbound', coins: 12, lists: {}, unlockedThemes: ['spellbound'] }] };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p)) });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(s => { try { if (!localStorage.getItem('t_fk')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_fk', '1'); } } catch (e) {} }, SEED);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + ROOT + '/index.html'); await booted(pg);
  await until(pg, () => state.screen === 'app' && state.nav === 'home' && !!document.querySelector('.sb-content [data-act="goNext"]'), null, 20000);
  /* count redraws, and which were soft */
  await pg.evaluate(() => { const r0 = window.render; window.__soft = 0; window.__hard = 0;
    window.render = function () { if (window.SB_RENDER_SOFT) window.__soft++; else window.__hard++; return r0.apply(this, arguments); }; });
  const SEL = '.sb-content [data-act="goNext"]';
  const on = () => pg.evaluate((q) => { const a = document.activeElement; return { act: a && a.getAttribute && a.getAttribute('data-act'), body: a === document.body, same: a === document.querySelector(q) }; }, SEL);

  /* 1. a real file landing while the focus is on Continue */
  const group = await pg.evaluate(() => ['buzz', 'daily', 'kudos', 'today', 'scrMe', 'scrTools'].find(g => SB_LAZY.ready && !SB_LAZY.ready(g)) || 'buzz');
  await pg.focus(SEL);
  const y0 = await pg.evaluate(() => window.scrollY);
  const soft0 = await pg.evaluate(() => window.__soft);
  await pg.evaluate((g) => { window.__landed = 0; SB_LAZY.need(g, () => { window.__landed = 1; }); }, group);
  const redrew = await until(pg, (s0) => window.__landed && window.__soft > s0, soft0, 30000);
  await pg.waitForTimeout(100);
  const after = await on();
  ok(redrew && after.act === 'goNext' && after.same, `a file landing (${group}) redraws Home softly, and the focus is still on Continue (${JSON.stringify(after)})`);
  /* 4. and the page did not move */
  ok(await pg.evaluate((y) => window.scrollY === y, y0), 'putting the focus back does not scroll the page');
  /* 2. Enter then does what Continue does */
  const nav0 = await pg.evaluate(() => state.nav);
  await pg.keyboard.press('Enter');
  const moved = await until(pg, (n) => state.nav !== n, nav0, 15000);
  ok(moved, `Enter on it then does what the control does (nav ${nav0} → ${await pg.evaluate(() => state.nav)})`);

  /* 3. a redraw the child caused does not put the focus back */
  await pg.evaluate(() => { app.setNav('home'); });
  await until(pg, () => !!document.querySelector('.sb-content [data-act="goNext"]'), null, 15000);
  await pg.focus(SEL);
  await pg.evaluate(() => { window.SB_RENDER_SOFT = 0; render(); });
  const hard = await on();
  ok(hard.body && !hard.same, `a redraw the child caused leaves the focus where render() leaves it (on <body>: ${hard.body})`);

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
