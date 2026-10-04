/* NOT ONE CONSOLE ERROR ON A CHILD'S WALK (FIX2 #8, 3 Oct 2026).

   An owner sweep counted console errors across the app. Every one found was a REQUEST FOR A FILE
   THE APP KNEW WAS NOT THERE: the Mock Spelling Bee asked for each of its seventeen unrecorded
   announcer lines once per bee (a 404 apiece), and its announcer went on talking — and asking —
   after the child had left the hall by the tab bar. Both are fixed at the cause in mockbee.js
   (ANN_HAVE lists the recorded lines; the queue is silent off the mockbee screen).

   This walks the app as a child and a grown-up do — Home, the Atlas, Practice, the Library, Play,
   My Hive, Settings, the parent zone behind the PIN, My Feed and a broad sample of hash routes,
   then the things done ON those screens (the drawer, the wallet, the child menu, a practice miss, a
   word card, a game, the Mock Bee and leaving it by the tab bar) — at a desktop and at a phone,
   over http (as Pages serves it) and over file:// (as it runs from a folder). It fails on ANY
   console error and ANY page error, with one documented exception: word clips under voice/w/ are
   not checked out in a working copy on purpose (they stream from `main` on the hosted site), so
   locally they 404 and the app falls back to device speech.
   It also holds mockbee's list of recorded lines to the files in voice/ann/, so the list cannot
   drift as clips are added or removed.
   Budget: 262s in a full run on 4 Oct, longer on a busier machine — the runner gives it 900s (lib/run.cjs
   TIMEOUT), because it timed out at the 300s default in a full run under load (audit v4, R5). The
   per-step pauses are its OBSERVATION windows (how long an error has to show itself), so they
   stay; the waits that stood for "the app has booted" wait for that instead.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/console-clean.cjs                   */
const { chromium } = require('playwright');
const { booted } = require('./lib/wait.cjs');
const fs = require('fs');
const path = require('path');
const { serve } = require('./lib/serve.cjs');
const ROOT = path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 40, band: 3, bandSeed: 3,
  lists: { journey: { xp: 30, stage: 1 } }, activeList: 'journey',
  trail: { lap: 1, done: { u1: { 1: 90 }, u2: { 1: 85 } }, chk: {}, seen: {}, st: { 'u1:1': { l: 1, w: 1, p: 90 }, 'u2:1': { l: 1, p: 85 } }, elap: 1, edone: {}, echk: {} } };
const ROUTES = ['home', 'atlas', 'atlas/honey/meadow', 'atlas/honey/forum', 'stop/u1', 'stop/u3', 'continue', 'practice', 'quest', 'library',
  'concepts', 'concepts/0', 'concepts/5', 'journeys', 'themes', 'figurative', 'vocab', 'quotes', 'typing', 'builder', 'traps', 'revisions',
  'trivtrain', 'ipatrain', 'play', 'trivia', 'hive', 'hive/avatars', 'hive/badges', 'hive/worlds', 'shop/avatars', 'shop/worlds', 'shop/extras',
  'level', 'evolution', 'progress', 'finder', 'word/necessary', 'help', 'adv', 'feed', 'settings', 'grownups', 'home'];
/* the one documented local gap: word clips are not in a working copy (see the header) */
const EXPECTED = u => /\/voice\/w\/[^/]+\.mp3(\?|$)/.test(u || '');

async function walk(b, base, vp, tag) {
  const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, hasTouch: vp.w < 600 });
  await ctx.addInitScript(k => { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [k] })); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } }, KID);
  const pg = await ctx.newPage(); const errs = []; let step = 'boot';
  pg.on('pageerror', e => errs.push(`${tag} ${step}: page error: ${e.message}`));
  pg.on('console', m => { if (m.type() !== 'error') return; const at = (m.location() || {}).url || '';
    if (EXPECTED(at)) return; errs.push(`${tag} ${step}: ${m.text().slice(0, 160)}${at ? ' @ ' + at.split('/').slice(-2).join('/') : ''}`); });
  await pg.goto(base); await booted(pg); await pg.waitForTimeout(1000);   // booted, then a second of quiet to show a boot-time error
  step = 'first tap'; await pg.mouse.click(4, 400); await pg.waitForTimeout(1200);   // starts the idle queue, as a child's first tap does
  const visited = [];
  for (const r of ROUTES) {
    step = '#/' + r;
    await pg.evaluate(r => { location.hash = '#/' + r; }, r); await pg.waitForTimeout(1000);
    if (r === 'grownups' || r === 'settings') { await pg.evaluate(() => { if (state.pinDlg) '1234'.split('').forEach(k => app.pinKey(k)); }); await pg.waitForTimeout(600); }
    visited.push(await pg.evaluate(() => state.nav));
  }
  const acts = [
    ['the drawer', () => { app.setNav('home'); state.drawerOpen = true; render(); }], ['drawer shut', () => { state.drawerOpen = false; render(); }],
    ['the wallet', () => { state.walletOpen = true; render(); }], ['wallet shut', () => { state.walletOpen = false; render(); }],
    ['the child menu', () => app.famMenu()], ['menu shut', () => app.famMenuClose()],
    ['a practice drill', () => { state.sessionWords = [{ w: 'committee', d: 'a group chosen to decide things' }, { w: 'knight', d: 'a soldier on horseback' }]; app.startTrain(); }],
    ['a miss', () => { state.typed = 'comitee'; app.check(); }], ['next word', () => app.next()],
    ['a word card', () => { app.setNav('home'); app.hqPick && app.hqPick('necessary'); }],
    ['Daily Buzz', () => { app.setNav('games'); app.playGame('buzz'); }], ['leave the game', () => { app.exitGame && app.exitGame(); app.setNav('games'); }],
    ['the Mock Bee', () => app.mbOpen()], ['take the stage', () => app.mbStart()],
    ['leave it by the tab bar', () => app.setNav('games')], ['…and wait', () => {}], ['…and wait more', () => {}],
    ['the parent zone', () => app.setNav('parent')], ['the PIN', () => '1234'.split('').forEach(k => app.pinKey(k))],
    ['the report', () => { state.progTab = 'parent'; render(); }],
  ];
  for (const [n, fn] of acts) { step = n; await pg.evaluate(`(${fn.toString()})()`).catch(e => errs.push(`${tag} ${n}: threw ${e.message.slice(0, 120)}`)); await pg.waitForTimeout(1500); }
  await ctx.close();
  return { errs, visited };
}

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const srv = await serve(ROOT);
  const runs = [
    [srv.url + 'index.html', { w: 1280, h: 860 }, 'http desktop'],
    [srv.url + 'index.html', { w: 390, h: 844 }, 'http phone'],
    ['file://' + ROOT + '/index.html', { w: 1280, h: 860 }, 'file desktop'],
  ];
  for (const [base, vp, tag] of runs) {
    const r = await walk(b, base, vp, tag);
    ok(r.visited.filter(n => n && n !== 'home').length >= ROUTES.length - 6, `${tag}: walked ${ROUTES.length} routes and ${r.visited.length ? 'the screens on them' : 'nothing'} (${[...new Set(r.visited)].length} distinct screens)`);
    ok(r.errs.length === 0, `${tag}: no console error and no page error` + (r.errs.length ? ' — ' + r.errs.length + ':\n         ' + r.errs.slice(0, 8).join('\n         ') : ''));
  }
  await b.close(); await srv.close();

  /* mockbee's recorded-line list is the folder, exactly */
  const ctx2 = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const pg = await ctx2.newPage(); await pg.goto('file://' + ROOT + '/index.html'); await booted(pg); await pg.evaluate(() => new Promise(r => SB_LAZY.need('mockbee', r)));   // mockbee.js is lazy (4 Oct 2026): fetch it, then MOCKBEE is there to ask
  const have = (await pg.evaluate(() => window.MOCKBEE && typeof MOCKBEE.annHave === 'function' ? MOCKBEE.annHave() : null)) || [];
  await ctx2.close();
  const files = fs.readdirSync(path.join(ROOT, 'voice', 'ann')).filter(f => /\.mp3$/.test(f)).map(f => f.replace(/\.mp3$/, ''));
  const missing = files.filter(f => !have.includes(f)), extra = have.filter(k => !files.includes(k));
  ok(have.length && !missing.length && !extra.length, `the Mock Bee asks only for the announcer lines that are recorded (${have.length} listed, ${files.length} in voice/ann/)` + (missing.length || extra.length ? ` — unlisted: ${missing.join(', ') || 'none'}; listed but absent: ${extra.join(', ') || 'none'}` : ''));
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
