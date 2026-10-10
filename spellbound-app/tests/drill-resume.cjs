/* AN UNFINISHED DRILL RESUMES AT ITS CARD (road to 4.5, P1.15).

   The audit saw Continue reopen the right stop with "14 done" kept, but never the card: leave an Atlas drill
   for Home, close the tab or reload, and the words, the card and the score were gone. Now the drill is kept on
   the child while it is unfinished (app3 `c.resume`), and Continue — Home's, the drawer's and #/continue —
   goes back to THAT card: the same words in the same order, the same score. Here, on a phone:
     · a child opens the Meadow's second stop and spells three words (typed, Enter);
     · leaves for Home, and RELOADS the page;
     · Home's Continue reopens the drill at card four — the same word, the same list, three done;
     · #/continue typed as an address does the same;
     · resuming scores nothing (the evidence was written when each card was answered);
     · a sibling does not inherit it; the drill finished, Continue goes back to the map;
     · a record a fortnight old is left alone, and Continue goes to the map.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/drill-resume.cjs                                   */
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..') + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const KID = (name, extra) => Object.assign({ name, age: 9, ageBand: '8-10', avatar: 'koi', theme: 'spellbound', coins: 0, lists: { journey: { xp: 12 } }, activeList: 'journey',
  trail: { lap: 1, done: { u1: { 1: 90 } }, chk: {}, seen: {}, st: { 'u1:1': { l: 1, w: 1, p: 90 } }, elap: 1, edone: {}, echk: {} } }, extra || {});

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  await ctx.addInitScript(k => { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: k })); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } }, [KID('Mira'), KID('Ravi')]);
  const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(URL); await pg.waitForTimeout(2500);
  await pg.evaluate(() => new Promise(r => SB_LAZY.need(['atlas', 'words'], r)));
  /* open the stop's drill the way its card's "Train these words" does */
  await pg.evaluate(() => { app.trailUnit('u2'); app.trailTrain('u2'); });
  await pg.waitForFunction(() => state.nav === 'train' && Array.isArray(state.sessionWords) && state.sessionWords.length > 5 && !!document.querySelector('[data-inp="onType"]'), null, { timeout: 15000 });
  const words = await pg.evaluate(() => state.sessionWords.map(w => w.w));
  for (let i = 0; i < 3; i++) {
    const w = await pg.evaluate(() => state.sessionWords[state.gi].w);
    await pg.fill('[data-inp="onType"]', w); await pg.press('[data-inp="onType"]', 'Enter');
    await pg.waitForFunction(n => state.gi === n, i + 1, { timeout: 5000 }).catch(() => {});
  }
  const mid = await pg.evaluate(() => ({ gi: state.gi, w: state.sessionWords[state.gi].w, done: state.sessionDone, right: state.sessionRight, rec: active().resume, mast: JSON.stringify(active().mast || {}) }));
  ok(mid.gi === 3 && mid.done === 3 && mid.right === 3, `three words spelled, on card four ("${mid.w}")`);
  ok(mid.rec && mid.rec.u === 'u2' && mid.rec.gi === 3 && mid.rec.ws.join() === words.join(), 'the unfinished drill is kept on the child: its stop, its words in order, its card');
  /* leave for Home, and reload */
  await pg.tap('.sb-tabbar [data-act="setNav"][data-arg="home"]'); await pg.waitForTimeout(400);
  await pg.reload(); await pg.waitForTimeout(2600);
  await pg.waitForFunction(() => !!document.querySelector('.sb-content [data-act="goNext"]'), null, { timeout: 10000 });
  await pg.tap('.sb-content [data-act="goNext"]');
  await pg.waitForFunction(() => state.nav === 'train' && Array.isArray(state.sessionWords), null, { timeout: 15000 }).catch(() => {});
  await pg.waitForTimeout(400);
  const back = await pg.evaluate(() => ({ nav: state.nav, gi: state.gi, w: state.sessionWords && state.sessionWords[state.gi] && state.sessionWords[state.gi].w, list: (state.sessionWords || []).map(x => x.w).join(), done: state.sessionDone, right: state.sessionRight, ret: state.trailReturn,
    shown: !!document.querySelector('[data-inp="onType"]'), mast: JSON.stringify(active().mast || {}) }));
  ok(back.nav === 'train' && back.gi === 3 && back.w === mid.w && back.list === words.join() && back.ret === 'u2' && back.shown,
    `after leaving and a reload, Home's Continue reopens the drill at card four — the same word ("${back.w}"), the same list, the same stop`);
  ok(back.done === 3 && back.right === 3, `the score so far comes back with it (${back.right} of ${back.done})`);
  ok(back.mast === mid.mast, 'resuming writes no evidence of its own');
  /* #/continue as a typed address */
  await pg.evaluate(() => app.setNav('home')); await pg.waitForTimeout(300);
  await pg.goto(URL + '#/continue'); await pg.waitForTimeout(3000);
  const viaLink = await pg.evaluate(() => ({ nav: state.nav, gi: state.gi, w: state.sessionWords && state.sessionWords[state.gi] && state.sessionWords[state.gi].w }));
  ok(viaLink.nav === 'train' && viaLink.gi === 3 && viaLink.w === mid.w, `#/continue goes back to the same card (${viaLink.w})`);
  /* a sibling does not inherit it */
  const sib = await pg.evaluate(() => { app.setNav('home'); SB_SHELL.switchChild ? SB_SHELL.switchChild(1) : app.selectChild(1); return { who: active().name, has: !!SB_RESUME() }; });
  ok(sib.who === 'Ravi' && !sib.has, 'the other child has no drill to resume — it is kept per child');
  await pg.evaluate(() => { SB_SHELL.switchChild ? SB_SHELL.switchChild(0) : app.selectChild(0); });
  await pg.waitForTimeout(300);
  /* finish the drill: nothing is left to resume, and Continue goes to the map */
  await pg.evaluate(() => app.goNext()); await pg.waitForFunction(() => state.nav === 'train', null, { timeout: 10000 }).catch(() => {});
  for (let i = 0; i < 40 && await pg.evaluate(() => state.nav === 'train' && !state.sessionOver); i++) {
    const w = await pg.evaluate(() => state.sessionWords[state.gi].w);
    await pg.fill('[data-inp="onType"]', w); await pg.press('[data-inp="onType"]', 'Enter');
    const gi = await pg.evaluate(() => state.gi);
    await pg.waitForFunction(n => state.gi !== n || state.sessionOver, gi, { timeout: 5000 }).catch(() => {});
  }
  const fin = await pg.evaluate(() => ({ over: state.sessionOver, rec: !!active().resume }));
  ok(fin.over && !fin.rec, 'once the drill is finished, nothing is left to resume');
  await pg.evaluate(() => app.setNav('home')); await pg.waitForTimeout(300);
  await pg.tap('.sb-content [data-act="goNext"]'); await pg.waitForTimeout(2000);
  ok(await pg.evaluate(() => state.nav === 'trail' && state.trailView === 'act'), 'and Continue goes back to the map, on the child\'s stop');
  /* a fortnight-old record is left alone */
  const old = await pg.evaluate(() => { const c = active(); c.resume = { u: 'u2', crs: 'honey', lbl: 'x', ws: ['cat', 'city', 'goat'], gi: 1, r: 1, d: 1, ok: ['cat'], no: [], at: Date.now() - 15 * 864e5 }; save(); return !!SB_RESUME(); });
  await pg.evaluate(() => app.setNav('home')); await pg.waitForTimeout(300);
  await pg.tap('.sb-content [data-act="goNext"]'); await pg.waitForTimeout(2000);
  ok(!old && await pg.evaluate(() => state.nav === 'trail'), 'a drill left more than a fortnight ago is not resumed — Continue goes to the map');
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
