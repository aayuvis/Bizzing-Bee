/* THE ANALOGY GATE — nothing analogy reaches a child until the content is released; a tester (behind the PIN) sees all of it.

   Owner, 10 Oct 2026 (the road to 4.5, decision §1.2 and P0.4/P0.5): the analogy content was written by Claude and is
   reviewed by three independent agent rounds; "until all three rounds pass: the Analogies tab, the lessons, Mock Analogy
   Bee and Word Forge stay behind tester mode (?tester=1). A test must fail if any item without three passes can be
   reached without tester mode." The release is ONE line, `window.SB_ANL_RELEASED=false;` (app3.js, above NAV_TABS).

   A CHILD (no tester mode), by tap AND by typed address:
     · no Analogies tab on the desktop bar or the phone bar
     · no Mock Analogy Bee card on Play; the Library has no Link Finder banner; search offers neither as a place
     · #/analogies, a region, a lesson, #/analogies/clock, #/anlbee, #/links, #/links/<word>, #/links/link/<lesson> —
       typed into a running app or opened cold — land on Home (the Library for #/links), draw no analogy screen and
       fetch no analogy file; the openers and the stale taps (app.openAnlBee, app.playCard('mockAnalogy'),
       app.setNav('analogy')…) do the same
     · Home's second journey card is never the Analogy Atlas
     · My Feed: no `analogy` card in the pool a session is ranked from, nor in the session shown
     · ?tester=1 typed by a child meets the grown-up PIN, not the content: cancelled or wrong, nothing opens and tester
       mode stays off
   A TESTER (?tester=1, then the PIN): the address asked for opens (#/anlbee), tester mode is kept on the device and the
   query leaves the address bar; then every surface above is there — the tab after Word Atlas, the Play card, the
   Link Finder banner, typed #/analogies/clock and #/links/big, analogy cards in the feed's pool, the Analogy Atlas as
   Home's second card — and switching tester mode off (Settings, or ?tester=0) shuts them again.
   THE RELEASE (node, tests/lib/analogy-release.cjs — also tests/analogy-release.cjs in the data gate): if the line is
   ever true, every item in analogy-data.js must carry three passes in analogy-review/analogy-review.json.
   Proved by breaking (10 Oct 2026), each run recorded: `window.SB_ANL_RELEASED=true;` with the ledger as it stands
   (none) → the release check fails naming all 1,592 items (the child half then stands down, and the three "switched
   off" checks fail — released content stays open): 4 fail; NAV_TABS drawing Analogies whatever the gate says → both
   bar checks and the cancelled / wrong-PIN / switched-off checks: 6 fail; bee-feed.js's pool() unfiltered → the feed
   check (an `analogy` card in the session): 1 fails; family-shell.js's askTester switching tester mode on without
   pinGate → the PIN checks: 4 fail; playCardShown showing Mock Analogy Bee to everyone → the Play card, the Compete
   row, the stale tap and the search place: 4 fail.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/analogy-gate.cjs                                         */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const W = require('./lib/wait.cjs');
const R = require('./lib/analogy-release.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
const URL = 'file://' + ROOT + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 0, lists: { journey: { xp: 30 } }, activeList: 'journey', missed: [],
  trail: { lap: 1, done: { u1: { 1: 90 } }, chk: {}, seen: {}, st: { 'u1:1': { l: 1, w: 1, p: 90 } }, elap: 1, edone: {}, echk: {} } };
const ANL_NAV = ['analogy', 'anlbee', 'anltool'];

async function open(b, o) {
  o = o || {};
  const phone = !!o.phone;
  const ctx = await b.newContext(phone ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(([k, t]) => { if (!localStorage.getItem('t_seed')) {
    localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [k] }));
    localStorage.setItem('sb_splash', '0'); if (t) localStorage.setItem('sb_tester', '1'); localStorage.setItem('t_seed', '1'); } }, [KID, !!o.tester]);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(URL + (o.q || '') + (o.hash || '')); await W.booted(pg);
  await W.until(pg, () => state.screen === 'app' && !!document.querySelector('.sb-content'), null, 30000);
  return { ctx, pg, errs };
}
/* what is on screen, analogy-wise */
const seen = (pg) => pg.evaluate((AN) => ({ nav: state.nav, h: location.hash, search: location.search,
  screen: !!document.querySelector('.anl-page,.anl-board,.anl-field,.anl-tbox,.anl-stepper'),
  data: !!window.SB_ANALOGY, pin: !!document.querySelector('[data-pin-dlg]'), tester: !!state.tester,
  stored: SB_STORE.get('tester'), anlNav: AN.includes(state.nav) }), ANL_NAV);
const bars = (pg) => pg.evaluate(() => ({ desk: [...document.querySelectorAll('.sb-topnav [data-act="setNav"]')].map(x => x.getAttribute('data-arg')),
  phone: [...document.querySelectorAll('nav.sb-tabbar [data-act="setNav"]')].map(x => x.getAttribute('data-arg')) }));
/* type an address into the running app (a new history entry, as the address bar makes) and let it land */
async function typed(pg, hash) { await pg.evaluate((h) => { location.hash = h; }, hash);
  await W.until(pg, (h) => location.hash !== h || ['analogy', 'anlbee', 'anltool'].includes(state.nav), hash, 8000).catch(() => {});
  await W.frames(pg, 3); await pg.waitForTimeout(250); return seen(pg); }
const pressPin = async (pg, digits) => { for (const d of digits) await pg.keyboard.press(d); };

(async () => {
  /* ---- THE RELEASE: the node half (the same rule the data gate runs) ---- */
  const rel = R.check(ROOT);
  ok(rel.flag.sites.length === 1 && (rel.flag.value === true || rel.flag.value === false), `the release is one line, SB_ANL_RELEASED=${rel.flag.value} (${rel.flag.sites.join(', ')})`);
  ok(!rel.bad.length, rel.flag.value === true ? `released: all ${rel.total} items carry three passes${rel.bad.length ? ` — ${rel.bad.length} do not` : ''}` : `gated: no analogy item reaches a child without tester mode, so none needs its passes yet (${rel.total} items)`);
  const released = rel.flag.value === true;

  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  try {
    if (released) {
      ok(true, 'SKIP the child half: the content is released (the release check above holds it to the ledger)');
    } else {
      /* ================= A CHILD ================= */
      let { ctx, pg, errs: e1 } = await open(b);
      let B = await bars(pg);
      ok(!B.desk.includes('analogy') && B.desk.join() === 'home,trail,explore,games,feed', `a child's desktop bar has no Analogies tab (${B.desk.join(' · ')})`);
      const home2 = await pg.evaluate(() => { const c = document.querySelector('.sb-home-second'); return c ? c.getAttribute('data-kind') + ':' + c.getAttribute('data-act') : 'none'; });
      ok(home2 === 'gym:openGym', `Home's second journey card is the Spelling Gym, never the Analogy Atlas (${home2})`);
      /* Play, by tap */
      await pg.click('.sb-topnav [data-arg="games"]'); await W.until(pg, () => !!document.querySelector('[data-card="mockbee"]'), null, 20000);
      const play = await pg.evaluate(() => ({ card: !!document.querySelector('[data-card="mockAnalogy"]'), text: /Mock Analogy|Analogy Bee/i.test(document.querySelector('.sb-content').innerText),
        reg: SB_PLAY_CARDS.some(x => x.k === 'mockAnalogy'), full: Math.round(document.querySelector('[data-card="mockbee"]').getBoundingClientRect().width), row: Math.round(document.querySelector('[data-door="compete"] .pl-grid').getBoundingClientRect().width) }));
      ok(!play.card && !play.text && play.reg, `Play shows no Mock Analogy Bee card (the card stays in the lineup's registry, unshown)`);
      ok(Math.abs(play.full - play.row) <= 2, `…and Mock Spelling Bee takes the Compete row alone, no hole beside it (${play.full}px of ${play.row}px)`);
      await pg.evaluate(() => app.playCard('mockAnalogy')); await W.frames(pg, 3);
      let S = await seen(pg);
      ok(!S.anlNav && !S.screen && S.nav === 'games', `a stale tap on the card (app.playCard) opens nothing (${S.nav})`);
      /* the Library, by tap */
      await pg.click('.sb-topnav [data-arg="explore"]'); await W.until(pg, () => !!document.querySelector('.bk-shelf'), null, 20000);
      const lib = await pg.evaluate(() => ({ band: !!document.querySelector('.lib-anlband'), text: /Link Finder/i.test(document.querySelector('.sb-content').innerText) }));
      ok(!lib.band && !lib.text, 'the Library has no Link Finder banner');
      /* search */
      const places = await pg.evaluate(() => { try { return placeIndex().map(p => p.t); } catch (e) { return ['?' + e.message]; } });
      ok(!places.some(t => /analog|link finder/i.test(t)), `search offers no analogy place (${places.length} places)`);
      /* every address, typed into the running app */
      const ADDR = ['#/analogies', '#/analogies/ponds', '#/analogies/ponds-same/learn', '#/analogies/clock', '#/anlbee', '#/links', '#/links/big', '#/links/link/same', '#/analogy', '#/anltool'];
      const bad = [];
      for (const h of ADDR) { const s = await typed(pg, h); const home = /^#\/links|^#\/anltool/.test(h) ? 'explore' : 'home';
        if (s.anlNav || s.screen || s.nav !== home || /analog|anlbee|links|anltool/.test(s.h)) bad.push(`${h} → ${s.nav} ${s.h}${s.screen ? ' (an analogy screen)' : ''}`); }
      ok(!bad.length, `${ADDR.length} typed addresses land on Home (the Library for #/links) with no analogy screen` + (bad.length ? ': ' + bad.join(' | ') : ''));
      /* the doors themselves, as a stale tap would call them */
      for (const call of ['app.openAnalogies("clock")', 'app.openAnlBee()', 'app.openAnlTool("big")', 'app.setNav("analogy")', 'app.setNav("anlbee")', 'app.setNav("anltool")']) {
        await pg.evaluate((c) => { (0, eval)(c); }, call); await W.frames(pg, 3);
        S = await seen(pg); if (S.anlNav || S.screen) bad.push(call + ' → ' + S.nav); }
      ok(!bad.length, 'the six doors (openers and setNav) open no analogy screen' + (bad.length ? ': ' + bad.join(' | ') : ''));
      S = await seen(pg);
      ok(!S.data, 'and not one analogy file was fetched (SB_ANALOGY never loaded)');
      /* the phone bar */
      e1.length && errs.push(...e1); await ctx.close();
      ({ ctx, pg, errs: e1 } = await open(b, { phone: true }));
      B = await bars(pg);
      ok(!B.phone.includes('analogy') && B.phone.length === 5, `a child's phone bar has no Analogies tab (${B.phone.join(' · ')})`);
      e1.length && errs.push(...e1); await ctx.close();
      /* addresses opened cold */
      for (const h of ['#/anlbee', '#/analogies/clock', '#/links/big']) {
        ({ ctx, pg, errs: e1 } = await open(b, { hash: h }));
        await W.until(pg, () => state.nav === 'home' || state.nav === 'explore' || ['analogy', 'anlbee', 'anltool'].includes(state.nav), null, 15000).catch(() => {});
        await pg.waitForTimeout(600); S = await seen(pg);
        ok(!S.anlNav && !S.screen && !S.data && !/analog|anlbee|links/.test(S.h), `${h} opened cold lands on ${S.nav} (${S.h}), no analogy screen`);
        e1.length && errs.push(...e1); await ctx.close();
      }
      /* My Feed */
      ({ ctx, pg, errs: e1 } = await open(b));
      await pg.evaluate(() => app.setNav('feed'));
      await W.until(pg, () => !!document.querySelector('.bzf-end') && ((active().feed || {}).ids || []).length > 0, null, 45000);
      const feed = await pg.evaluate(() => { const L = SB_FEED.levelOf(SB_SHELL.nextStep()); const pool = SB_FEED.pool(L);
        const ids = active().feed.ids.map(x => x.id); const kinds = {}; pool.forEach(it => { kinds[it.kind] = (kinds[it.kind] || 0) + 1; });
        const shown = [...document.querySelectorAll('.bzf-card a[href]')].map(a => a.getAttribute('href'));
        return { pool: pool.length, anl: kinds.analogy || 0, inSession: ids.filter(id => (pool.find(it => it.id === id) || {}).kind === 'analogy').length,
          sessionKinds: ids.map(id => (pool.find(it => it.id === id) || { kind: '?' }).kind), routes: shown.filter(h => /#\/(analogies|anlbee|links)/.test(h)).length }; });
      ok(feed.pool > 0 && feed.anl === 0 && feed.routes === 0 && !feed.sessionKinds.includes('?'), `My Feed: no analogy card in the ${feed.pool}-card pool, and none on screen (session: ${[...new Set(feed.sessionKinds)].join(', ')})`);
      e1.length && errs.push(...e1); await ctx.close();
      /* ?tester=1 typed by a child: the PIN, never the content */
      ({ ctx, pg, errs: e1 } = await open(b, { q: '?tester=1', hash: '#/anlbee' }));
      await W.until(pg, () => !!document.querySelector('[data-pin-dlg]'), null, 15000).catch(() => {});
      S = await seen(pg);
      ok(S.pin && !S.anlNav && !S.screen && S.nav === 'home', `?tester=1#/anlbee as a child: the grown-up PIN over Home, not the bee (${S.nav}, PIN ${S.pin})`);
      ok(!/tester=/.test(S.search), `the query leaves the address bar (${S.search || 'none'})`);
      await pg.keyboard.press('Escape'); await W.frames(pg, 3);
      S = await seen(pg);
      ok(!S.pin && !S.tester && S.stored !== '1' && !S.anlNav && !(await bars(pg)).desk.includes('analogy'), 'cancelled: no tester mode, no tab, no bee');
      e1.length && errs.push(...e1); await ctx.close();
      ({ ctx, pg, errs: e1 } = await open(b, { q: '?tester=1' }));
      await W.until(pg, () => !!document.querySelector('[data-pin-dlg]'), null, 15000).catch(() => {});
      await pressPin(pg, '9999'); await W.frames(pg, 4);
      S = await seen(pg);
      ok(!S.tester && S.stored !== '1' && !(await bars(pg)).desk.includes('analogy'), 'a wrong PIN: tester mode stays off');
      e1.length && errs.push(...e1); await ctx.close();
    }

    /* ================= A TESTER: ?tester=1 and the PIN ================= */
    let { ctx, pg, errs: e1 } = await open(b, { q: '?tester=1', hash: '#/anlbee' });
    await W.until(pg, () => !!document.querySelector('[data-pin-dlg]'), null, 15000).catch(() => {});
    ok(await pg.evaluate(() => !!document.querySelector('[data-pin-dlg]')), '?tester=1 asks for the grown-up PIN');
    await pressPin(pg, '1234');
    await W.until(pg, () => state.nav === 'anlbee' && !!document.querySelector('.anl-field'), null, 30000).catch(() => {});
    let S = await seen(pg);
    ok(S.tester && S.stored === '1' && S.nav === 'anlbee' && /^#\/anlbee/.test(S.h) && S.screen && !/tester=/.test(S.search), `the right PIN: tester mode on (kept on the device), and the address asked for opens — Mock Analogy Bee at ${S.h}`);
    e1.length && errs.push(...e1); await ctx.close();
    /* tester mode is kept: every surface is there, by tap and by address */
    ({ ctx, pg, errs: e1 } = await open(b, { tester: true }));
    let B = await bars(pg);
    ok(B.desk.join() === 'home,trail,analogy,explore,games,feed', `a tester's bar: Analogies right after Word Atlas (${B.desk.join(' · ')})`);
    const home2 = await pg.evaluate(() => (document.querySelector('.sb-home-second') || {}).getAttribute && document.querySelector('.sb-home-second').getAttribute('data-kind'));
    ok(home2 === 'analogy', `Home's second journey card is the Analogy Atlas for a tester with nothing due (${home2})`);
    await pg.click('.sb-topnav [data-arg="analogy"]'); await W.until(pg, () => !!document.querySelector('.anl-board .anl-stop'), null, 30000).catch(() => {});
    S = await seen(pg); ok(S.nav === 'analogy' && /^#\/analogies/.test(S.h) && S.screen, `the tab opens the Analogy Atlas (${S.h})`);
    await pg.click('.sb-topnav [data-arg="games"]'); await W.until(pg, () => !!document.querySelector('[data-card="mockAnalogy"]'), null, 20000).catch(() => {});
    await pg.click('[data-card="mockAnalogy"] button'); await W.until(pg, () => state.nav === 'anlbee' && !!document.querySelector('.anl-field'), null, 20000).catch(() => {});
    S = await seen(pg); ok(S.nav === 'anlbee' && /^#\/anlbee/.test(S.h), `the Play card opens Mock Analogy Bee (${S.h})`);
    await pg.click('.sb-topnav [data-arg="explore"]'); await W.until(pg, () => !!document.querySelector('.lib-anlband'), null, 20000).catch(() => {});
    await pg.click('.lib-anlband'); await W.until(pg, () => !!document.querySelector('.anl-tbox input'), null, 20000).catch(() => {});
    S = await seen(pg); ok(S.nav === 'anltool' && /^#\/links/.test(S.h), `the Library's Link Finder banner opens #/links (${S.h})`);
    S = await typed(pg, '#/analogies/clock'); await W.until(pg, () => !!document.querySelector('.anl-btn[data-arg="clockgo"]'), null, 10000).catch(() => {});
    ok(S.nav === 'analogy' && await pg.evaluate(() => !!document.querySelector('.anl-btn[data-arg="clockgo"]')), 'typed #/analogies/clock opens Against the Clock');
    S = await typed(pg, '#/links/big'); await W.until(pg, () => state.anlTool && state.anlTool.w === 'big', null, 10000).catch(() => {});
    ok(await pg.evaluate(() => state.nav === 'anltool' && !!state.anlTool && state.anlTool.w === 'big'), 'typed #/links/big opens the Link Finder on "big"');
    await pg.evaluate(() => app.setNav('feed'));
    await W.until(pg, () => !!document.querySelector('.bzf-end') && ((active().feed || {}).ids || []).length > 0, null, 45000).catch(() => {});
    const tf = await pg.evaluate(() => { const pool = SB_FEED.pool(SB_FEED.levelOf(SB_SHELL.nextStep())); return pool.filter(it => it.kind === 'analogy').length; });
    ok(tf > 0, `a tester's feed pool carries the analogy cards (${tf})`);
    /* off again: the Settings switch needs no PIN to turn it OFF, and the surfaces go */
    await pg.evaluate(() => app.toggleTester()); await W.frames(pg, 3);
    S = await seen(pg); B = await bars(pg);
    ok(!S.tester && S.stored === '0' && !B.desk.includes('analogy'), 'switched off: the tab goes');
    S = await typed(pg, '#/anlbee');
    ok(!S.anlNav && !S.screen, `…and #/anlbee lands on ${S.nav} again`);
    e1.length && errs.push(...e1); await ctx.close();
    /* ?tester=0 switches it off */
    ({ ctx, pg, errs: e1 } = await open(b, { tester: true, q: '?tester=0' }));
    await W.until(pg, () => !state.tester, null, 10000).catch(() => {});
    S = await seen(pg); B = await bars(pg);
    ok(!S.tester && S.stored === '0' && !B.desk.includes('analogy') && !/tester=/.test(S.search), '?tester=0 switches tester mode off, no PIN needed');
    e1.length && errs.push(...e1); await ctx.close();
  } catch (e) { ok(false, 'the walk ran to its end — ' + (e && e.message)); }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
