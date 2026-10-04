/* THE GROWN-UP PIN STANDS IN FRONT OF EVERY PLAN SCREEN (FIX-BEE, Oct 2026).

   The PIN was optional and off by default, so on most devices a child reached the plan sheet
   in two taps. Now: no plan sheet and no paywall draws until a grown-up has passed the PIN —
   and with no PIN yet, the gate asks them to choose one, twice, then carries on. The guard is
   in render(), where the sheet is drawn, so it holds however the sheet was asked for: this test
   asks four different ways, including by writing the state flag directly. And (FIX2) the pad
   types from a keyboard as well as by touch, in both modes.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/pin-mandatory.cjs                    */
const { chromium } = require('playwright');
const path = require('path');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const SB_STORE_REC = /^p1\$[0-9a-f]{16,64}\$\d+\$[0-9a-f]{64}$/;   // store.js's PIN record: "p1$<salt>$<rounds>$<sha-256>"
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
  ok(r.pin && !r.dlg && r.tiers && r.closer, 'a match saves the PIN and carries on to the plan sheet (asked once, not twice)');
  /* (audit v4 Q1) it is kept salted and hashed: not the digits, in memory or on the device */
  const kept = await pg.evaluate(() => { const s = JSON.parse(localStorage.getItem('sb_saas_v2') || '{}');
    return { mem: state.parentPin, disk: s.pin, raw: localStorage.getItem('sb_saas_v2'), ok: SB_STORE.pinCheck('1234', s.pin), no: SB_STORE.pinCheck('1243', s.pin), again: SB_STORE.pinMake('1234') }; });
  ok(SB_STORE_REC.test(kept.disk) && kept.disk === kept.mem && kept.ok && !kept.no, 'and the PIN is saved with the device — as a salted hash that 1234 opens and 1243 does not');
  ok(!/"pin":"1234"/.test(kept.raw) && !/1234/.test(kept.disk) && kept.again !== kept.disk, 'the digits are nowhere in what is stored, and the same PIN hashes differently with a new salt');

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

  /* ---- 5. (FIX2 #7) the pad types from a keyboard, choosing a PIN and entering one ----
     Top-row digits and the numpad, Backspace takes one back, Escape cancels; Enter outside the
     pad presses nothing hidden under it, and a digit never also lands in a box beneath. */
  const where = () => pg.evaluate(() => ({ nav: state.nav, tab: state.progTab, dlg: state.pinDlg && { typed: state.pinDlg.typed, make: !!state.pinDlg.make, first: !!state.pinDlg.first, wrong: !!state.pinDlg.wrong }, pin: state.parentPin }));
  const press = async ks => { for (const k of ks) await pg.keyboard.press(k); };
  await reset(); await pg.evaluate(() => { state.settingsOpen = false; state.parentPin = null; state.devUnlock = false; state.progTab = 'me'; state.screen = 'app'; app.setNav('home'); app.setNav('parent'); });
  await press(['Digit4', 'Numpad3', 'Digit9', 'Backspace', 'Digit2', 'Numpad1']);
  let k1 = await where();
  await press(['Numpad4', 'Digit3', 'Numpad2', 'Digit1']);
  let k2 = await where();
  ok(k1.dlg && k1.dlg.make && k1.dlg.first && !k1.pin && !k2.dlg && SB_STORE_REC.test(k2.pin || '') && k2.nav === 'progress' && k2.tab === 'parent',
    'choosing a PIN by keyboard: top row and numpad type, Backspace takes one back, typed twice it is saved and the parent zone opens');
  await pg.evaluate(() => { state.progTab = 'me'; app.setNav('home'); });
  await pg.evaluate(() => { const i = document.querySelector('.sb-hsearch input,input'); if (i) i.focus(); app.setNav('parent'); });
  await press(['Digit7']);
  const under = await pg.evaluate(() => [...document.querySelectorAll('input')].map(i => i.value).join(''));
  await press(['Enter']); k1 = await where();
  ok(k1.dlg && k1.dlg.typed === '7' && !/7/.test(under) && k1.nav === 'home', `entering it: a digit types into the PIN and nowhere else, and Enter outside the pad presses nothing (${JSON.stringify(k1.dlg)})`);
  await press(['Escape']); k1 = await where();
  await pg.evaluate(() => app.setNav('parent')); await press(['0', '0', '0', '0']); k2 = await where();
  await press(['Numpad4', 'Numpad3', 'Numpad2', 'Numpad1']); const k3 = await where();
  ok(!k1.dlg && k1.nav === 'home' && k2.dlg && k2.dlg.wrong && !k3.dlg && k3.nav === 'progress' && k3.tab === 'parent',
    'Escape cancels; a wrong PIN typed by keyboard opens nothing; the right one, on the numpad, opens the parent zone');

  /* ---- 6. (audit v4 Q1) a household that kept the four digits (before v9) is migrated once ---- */
  { const old = { sv: 8, theme: 'spellbound', mode: 'light', premium: false, activeIdx: 0, pin: '1357', children: seed.children };
    const c2 = await b.newContext({ viewport: { width: 900, height: 1000 } });
    await c2.addInitScript(s => { try { if (!localStorage.getItem('sb_t_seeded')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_t_seeded', '1'); } } catch (e) {} }, old);
    const p2 = await c2.newPage(); p2.on('pageerror', e => errs.push(e.message));
    await p2.goto('file://' + path.resolve(__dirname, '..') + '/index.html'); await p2.waitForTimeout(2800);
    const m = await p2.evaluate(() => ({ ran: SB_STORE.migrated(), disk: JSON.parse(localStorage.getItem('sb_saas_v2')).pin, mem: state.parentPin }));
    /* 4 Oct 2026 (games foundations): steps v9→v10 (levels) and v10→v11 (bests) now follow v8→v9, so
       a pre-v9 household runs v8_to_v9 FIRST and once, then the later steps — no longer v8_to_v9 alone */
    ok(m.ran[0] === 'v8_to_v9' && m.ran.filter(x => x === 'v8_to_v9').length === 1 && SB_STORE_REC.test(m.disk) && m.disk === m.mem, `a pre-v9 household runs v8_to_v9 once and stores the record at once, not the digits (${m.ran.join()})`);
    await p2.evaluate(() => { state.screen = 'app'; state.progTab = 'me'; app.setNav('home'); app.setNav('parent'); });
    for (const k of '1357') await p2.evaluate(k => app.pinKey(k), k);
    const opened = await p2.evaluate(() => state.nav === 'progress' && state.progTab === 'parent' && !state.pinDlg);
    ok(opened, 'and its old PIN, 1357, still opens the parent zone');
    await p2.reload(); await p2.waitForTimeout(2600);
    const m2 = await p2.evaluate(() => ({ ran: SB_STORE.migrated(), disk: JSON.parse(localStorage.getItem('sb_saas_v2')).pin }));
    ok(m2.ran.length === 0 && m2.disk === m.disk, 'a second boot migrates nothing and keeps the same record');
    await c2.close(); }

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
