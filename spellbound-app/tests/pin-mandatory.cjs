/* THE GROWN-UP PIN STANDS IN FRONT OF EVERY PLAN SCREEN (FIX-BEE, Oct 2026).

   The PIN was optional and off by default, so on most devices a child reached the plan sheet
   in two taps. Now: no plan sheet and no paywall draws until a grown-up has passed the PIN —
   and with no PIN yet, the gate asks them to choose one, twice, then carries on. The guard is
   in render(), where the sheet is drawn, so it holds however the sheet was asked for: this test
   asks four different ways, including by writing the state flag directly.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/pin-mandatory.cjs                    */
const { chromium } = require('playwright');
const path = require('path');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const seed = { theme: 'spellbound', mode: 'light', premium: false, activeIdx: 0, pin: null,
  children: [{ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'bizzy', theme: 'spellbound', coins: 50, xp: 40, level: 3 }] };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => require('fs').existsSync(p)) });
  const ctx = await b.newContext({ viewport: { width: 900, height: 1000 } });
  await ctx.addInitScript(s => { try { if (!localStorage.getItem('sb_t_seeded')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_t_seeded', '1'); } } catch (e) {} }, seed);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + path.resolve(__dirname, '..') + '/index.html'); await pg.waitForTimeout(2800);
  await pg.evaluate(() => { state.screen = 'app'; state.nav = 'home'; render(); });

  const look = () => pg.evaluate(() => ({ tiers: !!state.showTiers, pay: !!state.showPaywall, dlg: state.pinDlg && { make: !!state.pinDlg.make, first: !!state.pinDlg.first, label: state.pinDlg.label },
    closer: !!document.querySelector('[data-act="closeTiers"],[data-act="closePaywall"]'), pin: state.parentPin }));
  const type = async d => { for (const k of d) await pg.evaluate(k => app.pinKey(k), k); };
  const reset = () => pg.evaluate(() => { state.pinDlg = null; state.showTiers = false; state.showPaywall = false; state._planOk = false; render(); });

  /* ---- 1. no PIN on the device: every way in meets "choose a PIN" ---- */
  const ways = { 'openTiers()': () => app.openTiers(), 'goPaywall()': () => app.goPaywall(),
    'an upsell (openUpsell)': () => openUpsell('plan', 'a test', 'regional'), 'state.showTiers=true; render()': () => { state.showTiers = true; render(); } };
  for (const [name, fn] of Object.entries(ways)) {
    await reset(); await pg.evaluate(`(${fn.toString()})()`);
    const r = await look();
    ok(!r.closer && r.dlg && r.dlg.make, `${name}: no plan screen draws — a grown-up is asked to choose a PIN first`); }

  /* ---- 2. choosing: typed twice, a mismatch starts over, a match carries on to the sheet ---- */
  await reset(); await pg.evaluate(() => app.openTiers());
  await type('1234'); let r = await look();
  ok(r.dlg && r.dlg.first && !r.pin, 'after the first four digits it asks for them again, and nothing is saved yet');
  await type('9999'); r = await look();
  ok(r.dlg && r.dlg.make && !r.dlg.first && !r.pin && !r.closer, 'a mismatch saves nothing, opens nothing, and starts over');
  await type('1234'); await type('1234'); r = await look();
  ok(r.pin === '1234' && !r.dlg && r.tiers && r.closer, 'a match saves the PIN and carries on to the plan sheet (asked once, not twice)');
  ok(await pg.evaluate(() => { const s = JSON.parse(localStorage.getItem('sb_saas_v2') || '{}'); return s.pin === '1234'; }), 'and the PIN is saved with the device');

  /* ---- 3. with a PIN: the sheet waits for it; a wrong one opens nothing ---- */
  await reset(); await pg.evaluate(() => app.goPaywall()); r = await look();
  ok(r.dlg && !r.dlg.make && !r.closer, 'with a PIN set, the paywall waits behind it');
  await type('0000'); r = await look();
  ok(!r.closer && r.dlg, 'a wrong PIN opens nothing');
  await type('1234'); r = await look();
  ok(r.pay && r.closer && !r.dlg, 'the right PIN opens it');
  await pg.evaluate(() => { state.showPaywall = false; render(); state.showTiers = true; render(); }); r = await look();
  ok(!r.closer && r.dlg, 'closing the sheet ends the pass — the next one asks again');

  /* ---- 4. the parent zone and the testing tools are grown-up only; Settings is not locked shut ---- */
  await reset(); await pg.evaluate(() => app.setNav('parent')); r = await look();
  ok(r.dlg && !r.dlg.make, 'the parent zone asks for the PIN');
  await reset(); await pg.evaluate(() => { state.parentPin = null; app.toggleDevUnlock(); }); r = await look();
  ok(r.dlg && r.dlg.make && !(await pg.evaluate(() => state.devUnlock)), 'the testing unlock asks a grown-up to choose a PIN first, and does not switch on');
  await reset(); await pg.evaluate(() => { state.parentPin = null; state.settingsOpen = false; app.setNav('settings'); }); r = await look();
  ok(!r.dlg && await pg.evaluate(() => !!state.settingsOpen), "with no PIN yet, Settings still opens — it holds the child's own sound and text size");
  const noRemove = await pg.evaluate(() => !/leave empty to remove|PIN removed/.test(app.pinSetup.toString()));
  ok(noRemove, 'there is no way to remove the PIN, only to change it');

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
