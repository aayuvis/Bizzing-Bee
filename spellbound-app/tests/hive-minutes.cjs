/* A ONE-MINUTE DRILL IS IN THE HIVE (road to 4.5, P0.32 / P0.33).

   The family drop-in (bizzing-activity.js) writes WHOLE minutes on a 15-second tick, so a child who
   drilled for a minute and then left had nothing in bizzing.activity — the audit read 0 minutes after
   a one-minute drill. Bee now flushes the leftover when the page is hidden (visibilitychange) or left
   (pagehide), rounded to the nearest minute, and starts a fresh count at the child's next real input
   (family-shell.js, THE HIVE). The drop-in itself is not touched.

   This drives a REAL drill — Bee's 10-word warm-up, every word typed on the keyboard and entered —
   on Playwright's clock (page.clock), so a minute takes a moment rather than a minute:
     1. a 55-second drill writes nothing by itself (the drop-in's whole-minute rule — measured here,
        not assumed, because that is the bug);
     2. hiding the tab (visibilitychange → hidden) flushes it: bizzing.activity holds 1 minute, in the
        drop-in's own shape {a:'bee', d, t, m, who} and under the child's name;
     3. nothing is written twice: back on the tab, a 70-second drill (the drop-in writes its own minute
        at 60 s) and hiding again leave exactly 2 — the leftover 10 s rounds to nothing;
     4. coming back to a tab is not a touch: a shown tab nobody touches for three minutes adds nothing;
     5. LEAVING the page — a real pagehide, by navigating away — flushes a 40-second drill: 3;
     6. ?demo writes nothing to the real feed, however long it is drilled and however it is left.
   Headless Chromium cannot hide a tab, so (2) and (3) set document.visibilityState and fire the
   event the way a browser does; (5) is a real navigation.
   Proved by breaking: with the two flush listeners removed, 7 fail (nothing is flushed, and the boot's
   own count is never stopped); with the drop-in's tracker left running after a flush, 6 fail (two
   trackers count every minute twice — 8 where there should be 2).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/hive-minutes.cjs                          */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..') + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const SEED = { theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [
  { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 0, xp: 40, level: 3,
    lists: { default: { xp: 30 } }, activeList: 'default' }] };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p)) });
  const ctx = await b.newContext({ viewport: { width: 1000, height: 900 } });
  await ctx.clock.install();
  await ctx.addInitScript(s => { try { if (!localStorage.getItem('t_hm')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_hm', '1'); } } catch (e) {} }, SEED);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  const boot = async u => { await pg.goto(u || URL); await pg.waitForTimeout(2500);
    return pg.evaluate(() => typeof state !== 'undefined' && state.screen === 'app' && !!window.BZ_ACTIVITY); };
  const feed = () => pg.evaluate(() => { try { return JSON.parse(localStorage.getItem('bizzing.activity') || 'null'); } catch (e) { return null; } });
  const mins = async () => ((await feed()) || { s: [] }).s.filter(x => x.a === 'bee').reduce((t, x) => t + (x.m || 0), 0);
  /* what a browser does when a tab is hidden or shown: the property changes, then the event fires */
  const show = v => pg.evaluate(v => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => v });
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => v === 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); }, v);
  /* drill for `secs`: every 5 s a word is typed on the keyboard and entered, as a child would */
  const drill = async secs => { let right = 0;
    for (let t = 0; t < secs; t += 5) {
      /* a round's end (or a stage-up) puts up a celebration; the drill closes it and plays on */
      const w = await pg.evaluate(() => { if (state.celebrate) { state.celebrate = null; render(); }
        let g = state.game; if (!g || g.status === 'done' || !g.list) { app.playGame('buzz'); render(); g = state.game; }
        return g && g.list && !g.wait ? g.list[g.i].w : null; });
      const box = await pg.$('input[data-key="gKey"]');
      if (w && box) { await box.focus(); await pg.keyboard.type(w); await pg.keyboard.press('Enter'); right++; }
      else await pg.keyboard.press('Shift');
      await pg.clock.runFor(5000);
    }
    return right; };

  ok(await boot(), 'the app boots with the family drop-in loaded (window.BZ_ACTIVITY)');
  /* start from a clean feed and a stopped count: hide once (which flushes whatever the boot's own
     two-minute window held), then empty the key — test code may; the app never does */
  await show('hidden'); await pg.evaluate(() => localStorage.removeItem('bizzing.activity')); await show('visible');
  const t0 = await pg.evaluate(() => Date.now()); await pg.clock.pauseAt(t0 + 1000);

  /* ---- 4. a shown tab nobody touches adds nothing ---- */
  await pg.clock.runFor(3 * 60 * 1000);
  ok(await mins() === 0, `back on the tab with nobody touching it: three minutes add nothing (${await mins()})`);

  /* ---- 1 + 2. a 55-second drill: nothing by itself, one minute once the tab is hidden ---- */
  await pg.evaluate(() => { app.playGame('buzz'); render(); });
  const r1 = await drill(55);
  const before = await mins();
  ok(r1 >= 8 && before === 0, `a 55-second drill (${r1} words typed and entered) writes no minute by itself — the drop-in's whole-minute rule (${before})`);
  await show('hidden');
  const f2 = await feed(), after = await mins();
  ok(after === 1, `hiding the tab flushes it: bizzing.activity now holds 1 minute (${after})`);
  const line = ((f2 || { s: [] }).s.filter(x => x.m > 0).pop()) || {};
  ok(line.a === 'bee' && line.who === 'Ahana' && /^\d{4}-\d\d-\d\d$/.test(line.d) && Number.isInteger(line.t) && line.t >= 0 && line.t < 1440 && line.m === 1
    && Object.keys(line).every(k => ['a', 'd', 't', 'm', 'who'].includes(k)), 'in the drop-in\'s own shape, under the child\'s name: ' + JSON.stringify(line));

  /* ---- 3. nothing twice: 70 s more — the drop-in writes its minute at 60 s, the leftover 10 s rounds to 0 ---- */
  await show('visible');
  await drill(70);
  const mid = await mins();
  await show('hidden');
  const twice = await mins();
  ok(mid === 2 && twice === 2, `a 70-second drill then a hide: the drop-in's own minute, and the leftover 10 s is not counted again (${mid} → ${twice}, want 2)`);
  await show('visible');

  /* ---- 5. leaving the page: a real pagehide ---- */
  await drill(40);
  const pre = await mins();
  await pg.goto('about:blank');
  await boot();
  const left = await mins();
  ok(pre === 2 && left === 3, `a 40-second drill and then leaving the page (pagehide) is recorded: ${pre} → ${left}, want 3`);

  /* ---- 6. ?demo writes nothing to the real feed ---- */
  await boot(URL + '?demo');
  await pg.evaluate(() => { try { app.playGame('buzz'); render(); } catch (e) {} });
  await drill(70);
  await show('hidden'); await show('visible');
  await pg.goto('about:blank');
  await boot();
  ok(await mins() === 3, `a ?demo drill, hidden and left, adds nothing to the real feed (${await mins()})`);

  await b.close();
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  console.log(fails ? `\n${fails} FAILED` : '\nall good — a one-minute drill reaches the Hive, once');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
