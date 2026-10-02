/* DEMO MODE (family standard §14).

   `?demo` opens a sample child with a few weeks of believable progress, clearly labelled
   "Sample", and NEVER touches a real household or the shared feeds. It runs inside a storage
   sandbox installed before anything else on the page reads storage, so the guarantee holds
   for every writer — the app's save(), the Hive drop-in, a future wallet — not only the ones
   that remember to check a flag. This test plants a real household and real Hive feeds on the
   device, plays the sample hard (a lesson, a cleared stop, minutes of input, a direct write to
   the wallet key), and then reads the device's real storage back, byte for byte.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/demo-mode.cjs                         */
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..') + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const REAL = {
  sb_saas_v2: JSON.stringify({ theme: 'aurora', mode: 'dusk', pin: '4321', activeIdx: 0, children: [{ name: 'Zara', age: 12, ageBand: '11-13', avatar: 'froggy', theme: 'aurora', coins: 77 }] }),
  'bizzing.activity': JSON.stringify({ v: 1, s: [{ a: 'maths', d: '2026-10-01', t: 600, m: 12, who: 'Zara' }] }),
  'bizzing.wallet': JSON.stringify({ v: 1, kids: { zara: { coins: 31, ledger: [{ a: 'maths', t: 1, n: 5, why: 'stop' }] } } }) };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  await ctx.clock.install();
  /* the real device: planted once, before the first page */
  await ctx.addInitScript(r => { if (!localStorage.getItem('t_seed')) { for (const k in r) localStorage.setItem(k, r[k]); localStorage.setItem('t_seed', '1'); }
    /* and every page records what the REAL storage held before any app code ran */
    try { const raw = {}; for (const k in r) raw[k] = Storage.prototype.getItem.call(window.localStorage, k); window.__raw = raw; } catch (e) {} }, REAL);
  const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(URL.replace('index.html', 'index.html?demo')); await pg.waitForTimeout(3000);
  await pg.evaluate(() => new Promise(r => SB_LAZY.need('atlas', r)));
  await pg.evaluate(() => app.setNav('home')); await pg.waitForTimeout(400);

  const s = await pg.evaluate(() => { const c = active(); const n = SB_NEXT_STEP(); const bar = document.querySelector('.sb-demo-bar');
    const br = bar && bar.getBoundingClientRect();
    return { demo: SB_SHELL.demo, name: c.name, sample: !!c.sample, kids: state.children.length, label: bar && bar.textContent, barVis: !!br && br.height > 0 && br.top < 120,
      leave: bar && (bar.querySelector('a') || {}).getAttribute && bar.querySelector('a').getAttribute('href'),
      done: n.ready ? n.done : -1, mastered: Object.keys(state.luMastered || {}).length, days: (c.daysPlayed || []).length,
      span: (() => { const d = (c.daysPlayed || []).slice().sort(); return d.length ? Math.round((Date.parse(d[d.length - 1]) - Date.parse(d[0])) / 864e5) : 0; })(),
      splash: !!document.querySelector('#sb-splash'), menuTag: (() => { app.famMenu(); const t = (document.querySelector('.sb-fam-menu') || {}).textContent || ''; app.famMenuClose(); return t; })() }; });
  ok(s.demo && s.kids === 1 && s.name === 'Mira' && s.sample, '?demo opens one sample child (Mira), not the household on this device');
  ok(/Sample/.test(s.label || '') && s.barVis && /Sample/.test(s.menuTag), 'she is labelled "Sample" at the top of the screen and in the child menu');
  ok(s.leave === 'index.html', 'the label says how to leave the sample');
  ok(s.done >= 7 && s.mastered >= 100 && s.days >= 10 && s.span >= 14, `a few weeks of believable progress: ${s.done} Atlas stops behind her, ${s.mastered} words mastered, ${s.days} days over ${s.span} days`);
  ok(!s.splash, 'no opening splash in front of the sample');

  /* ---- play it hard ---- */
  await pg.click('.sb-content [data-act="goNext"]'); await pg.waitForTimeout(1500);
  await pg.evaluate(() => { state.trailCourse = 'honey'; const u = SB_NEXT_STEP().arg; SB_TRAIL_PRACTICED(u, 10, 10); active().coins += 50; save(); render(); });
  for (let i = 0; i < 6; i++) { await pg.mouse.click(200, 400); await pg.clock.runFor(15500); }
  await pg.evaluate(() => { try { BZ_ACTIVITY.trackMilestone('bee', 'Mira', 'stop', 'direct'); } catch (e) {}
    try { localStorage.setItem('bizzing.wallet', JSON.stringify({ v: 1, kids: { mira: { coins: 999, ledger: [] } } })); } catch (e) {} });
  const inBox = await pg.evaluate(() => ({ act: localStorage.getItem('bizzing.activity'), saas: localStorage.getItem('sb_saas_v2') }));
  ok(!inBox.act || !/"who":"Mira"[^}]*"m":[1-9]/.test(inBox.act), 'the sample writes no minutes to the Hive feed, even inside its own sandbox');

  /* ---- and the real device is exactly as it was ---- */
  const pg2 = await ctx.newPage();
  await pg2.goto('about:blank'); await pg2.goto(URL.replace('index.html', 'privacy.html')); await pg2.waitForTimeout(300);
  const raw = await pg2.evaluate(() => window.__raw);
  ok(raw && raw.sb_saas_v2 === REAL.sb_saas_v2, "the real household (Zara, her PIN, her coins) is byte-identical");
  ok(raw && raw['bizzing.activity'] === REAL['bizzing.activity'], 'bizzing.activity on the device is byte-identical — no sample minutes, no sample milestones');
  ok(raw && raw['bizzing.wallet'] === REAL['bizzing.wallet'], 'bizzing.wallet on the device is byte-identical — even a direct write from the sample went nowhere');
  /* and opening the app for real still finds Zara */
  const pg3 = await ctx.newPage(); pg3.on('pageerror', e => errs.push(e.message));
  await pg3.goto(URL); await pg3.waitForTimeout(2600);
  ok(await pg3.evaluate(() => state.children.length === 1 && active().name === 'Zara' && !SB_SHELL.demo && !document.querySelector('.sb-demo-bar')), 'without ?demo the app opens on the real child, unlabelled');

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
