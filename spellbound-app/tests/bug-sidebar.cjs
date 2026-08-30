// 🐞 The report-a-bug sidebar: a quiet edge tab on every app screen, a slide-in
// panel, reports saved to localStorage on the DEVICE (never on a child, never
// transmitted — COPPA), with technical context only, plus copy/export for parents.
const { chromium } = require('playwright');
const SRC = process.env.SRC || __dirname + '/..';
let fails = 0;
const ok = (b, msg) => { console.log((b ? '  OK   ' : '  FAIL ') + msg); if (!b) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const pg = await b.newPage({ viewport: { width: 1100, height: 900 } });
  const errs = []; pg.on('pageerror', e => errs.push(String(e.message)));
  await pg.goto('file://' + SRC + '/index.html'); await pg.waitForTimeout(2600);
  const r = await pg.evaluate(async () => {
    const out = {}; const W = ms => new Promise(res => setTimeout(res, ms));
    state.children = [{ name: 'SecretName', avatar: 'bee', coins: 0, pow: {}, age: 9, lists: { default: { xp: 10 } }, activeList: 'default',
      missed: [], unlockedThemes: ['spellbound'], unlockedConcepts: {}, unlockedLists: {}, questPath: 'journey',
      trail: { lap: 1, done: {}, chk: {}, seen: {}, elap: 1, edone: {}, echk: {} } }];
    state.activeIdx = 0; state.screen = 'app'; state.nav = 'home'; localStorage.removeItem('sb_bugs'); render(); await W(200);

    // ---- the tab is there, quiet, on the app shell ----
    out.tab = !!document.querySelector('.sb-bug-tab');
    document.querySelector('.sb-bug-tab').click(); await W(250);
    out.panel = !!document.querySelector('.sb-bug-panel') && /stays.*on this device|on this device/i.test(document.querySelector('.sb-bug-panel').textContent);

    // ---- categories, typing, saving ----
    app.bugCat('looks'); await W(120);
    app.bugType('the shelf renders one book at a time');
    app.bugSave(); await W(200);
    const list = JSON.parse(localStorage.getItem('sb_bugs') || '[]');
    out.saved = list.length === 1 && list[0].cat === 'looks' && /shelf renders/.test(list[0].txt);
    out.context = list[0].nav === 'home' && !!list[0].sz && 'v' in list[0];
    out.noChildData = !/SecretName|"age"/.test(localStorage.getItem('sb_bugs'));
    out.cleared = (state.bugTxt || '') === '';
    out.listed = /shelf renders one book/.test(document.querySelector('.sb-bug-panel').textContent);

    // ---- empty save refuses, delete works ----
    app.bugSave(); await W(120);
    out.refuseEmpty = JSON.parse(localStorage.getItem('sb_bugs')).length === 1;
    app.bugDel('0'); await W(150);
    out.deleted = JSON.parse(localStorage.getItem('sb_bugs')).length === 0;

    // ---- reports are DEVICE-level: not on the child, so save() never uploads them ----
    out.notOnChild = !('bugReports' in state.children[0]) && !JSON.stringify(state.children[0]).includes('shelf renders');

    // ---- closes on the scrim, tab hidden off the app shell ----
    app.bugToggle(); await W(150);
    out.closes = !document.querySelector('.sb-bug-panel');
    state.screen = 'welcome'; render(); await W(150);
    out.offShell = !document.querySelector('.sb-bug-tab');
    state.screen = 'app'; render();
    return out;
  });
  ok(r.tab, 'a quiet 🐞 tab rides the right edge of every app screen');
  ok(r.panel, 'it opens a sidebar that says reports stay on this device');
  ok(r.saved, 'a report saves with its category and text');
  ok(r.context, 'technical context rides along: screen, version, viewport');
  ok(r.noChildData, 'NO child data is stored — no name, no age (COPPA)');
  ok(r.cleared && r.listed, 'the box clears and the report shows in the list');
  ok(r.refuseEmpty, 'an empty report is refused');
  ok(r.deleted, 'a report can be deleted');
  ok(r.notOnChild, 'reports are device-level — never on the child object cloud sync could touch');
  ok(r.closes, 'the panel closes');
  ok(r.offShell, 'the tab stays off the welcome/onboarding screens');
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
  await b.close();
  process.exit(fails ? 1 : 0);
})();
