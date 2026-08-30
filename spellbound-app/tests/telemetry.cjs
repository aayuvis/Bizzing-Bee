// The research rig: SB_TM records NOTHING until a grown-up arms it; armed, it logs
// taps (viewport-%), screens, heartbeats, errors, session outcomes and the smiley
// pulse — with no name, no age, no typed words — on the device only. backend.html
// (the never-deployed operator console) parses the export and lights its dashboards.
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
    state.activeIdx = 0; state.screen = 'app'; state.nav = 'home';
    localStorage.setItem('sb_tm_on', '0'); localStorage.setItem('sb_tm_log', '[]'); render(); await W(200);

    // ---- unarmed: taps leave no trace ----
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 300, clientY: 300 }));
    await W(600);
    out.unarmedSilent = JSON.parse(localStorage.getItem('sb_tm_log') || '[]').length === 0 && !SB_TM.on();

    // ---- armed: taps carry %, screen and the control they hit ----
    SB_TM.arm(true); await W(100);
    const btn = document.querySelector('[data-act]');
    const bb = btn.getBoundingClientRect();
    btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: bb.x + 4, clientY: bb.y + 4 }));
    SB_TM.rec({ k: 'sess', r: 8, d: 10, lbl: 'Test list' });
    await W(600);
    let log = SB_TM.list();
    const tap = log.find(e => e.k === 'tap');
    out.tapShape = !!tap && tap.x > 0 && tap.x <= 100 && tap.y > 0 && tap.y <= 100 && tap.nav === 'home' && !!tap.act;
    out.sessShape = log.some(e => e.k === 'sess' && e.r === 8 && e.d === 10);
    out.armMark = log.some(e => e.k === 'arm');

    // ---- the smiley pulse rides the session summary while armed ----
    state.sessionOver = true; state.sessionWords = [{ w: 'test', d: '' }]; state.nav = 'train'; state.tmReacted = false; render(); await W(200);
    out.pulse = document.querySelectorAll('[data-act="tmReact"]').length === 3;
    app.tmReact('love'); await W(200);
    out.reactLogged = SB_TM.list().some(e => e.k === 'react' && e.v === 'love');
    out.pulseOnce = !document.querySelector('[data-act="tmReact"]');

    // ---- the export carries events but never the child ----
    const dump = SB_TM.export();
    out.exportShape = !!dump && JSON.parse(dump).events.length > 2;
    out.noChild = dump.indexOf('SecretName') < 0 && !/"age"/.test(dump);
    // and switching capture off silences it again
    SB_TM.arm(false);
    const n0 = SB_TM.count();
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 200, clientY: 200 })); await W(600);
    out.disarmSilent = SB_TM.count() === n0;
    state.sessionOver = false; state.nav = 'home'; render();
    return { out, dump };
  });
  ok(r.out.unarmedSilent, 'unarmed, the recorder writes NOTHING');
  ok(r.out.tapShape, 'armed, a tap logs viewport-%, the screen, and the control it hit');
  ok(r.out.sessShape && r.out.armMark, 'session outcomes and the arm moment are logged');
  ok(r.out.pulse, 'the 😍🙂😕 pulse appears on the session summary while armed');
  ok(r.out.reactLogged && r.out.pulseOnce, 'a tapped smiley is logged once and the pulse retires');
  ok(r.out.exportShape, 'export produces a parseable sb-research bundle');
  ok(r.out.noChild, 'the export carries NO name and NO age (COPPA)');
  ok(r.out.disarmSilent, 'switching capture off silences it immediately');

  // ---- the operator console parses the bundle and lights up ----
  const pg2 = await b.newPage({ viewport: { width: 1200, height: 900 } });
  await pg2.goto('file://' + SRC + '/backend.html'); await pg2.waitForTimeout(600);
  const c = await pg2.evaluate(dump => { BK.load(dump);
    const o = { events: BK.events.length, overview: document.body.textContent.indexOf('events') >= 0 };
    BK.tab = 'heatmap'; render(); drawHeat();
    o.canvas = !!document.querySelector('#hm');
    BK.tab = 'actions'; render();
    o.actions = /Most-used controls/.test(document.body.textContent);
    BK.tab = 'testing'; render();
    o.testing = /never deployed/i.test(document.body.textContent);
    return o; }, r.dump);
  ok(c.events > 2 && c.overview, 'backend.html ingests the export and shows the overview');
  ok(c.canvas, 'the heatmap canvas renders');
  ok(c.actions, 'the actions dashboard ranks controls');
  ok(c.testing, 'the Testing tab documents the rig and its never-deployed rule');
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
  await b.close();
  process.exit(fails ? 1 : 0);
})();
