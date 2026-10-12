/* EVERY SCREEN OPENS FROM A COLD PAGE, ITS CODE ARRIVING AT ITS DOOR (road to 4.5, P1.13 step 2 — the app3 split).

   app3.js keeps the first screens and the shell; each screen's own code lives in a lazy app3 file that boot-lazy
   fetches at the screen's door (tests/app3-split.cjs holds the structure). Here, in a browser, from a COLD page every
   time — a returning speller's Home, nothing tapped, no lazy file in — served gzipped and minified as deploy ships it:
     1. EVERY LAZY SCREEN BY ITS NAV: for each nav in SCR_NAV, app.setNav(nav) (the opener a tab and the drawer call)
        draws the hive loader while its file lands, then the screen itself — no loader left, no page error, and the
        file it needed (and only through boot-lazy) is in.
     2. BY ITS ADDRESS: the #/… routes family-shell's applyRoute maps to lazy screens land there from a cold load.
     3. A STUB: a lazy screen's opener called from a cold page (as a route, a search place, a key or another file calls
        it — Home's own buttons are app3's) loads its file and runs; the coins chip's wallet sheet (scrDraw, app3-me.js)
        opens on the first tap; so does the word of the hour's card (app3-library.js). AN ENGINE NEVER OPENS AHEAD OF
        ITS SCREEN: the Spelling Gym's mode called from a cold page, its screen file held back on the wire, is "ready"
        only once its card is on the screen, and Enter starts it (gym.js keys go to its DOM only while that is on the
        page — spelling-gym T3 caught a lost Enter when the engine landed first). ONE BIG FILE AT A TIME: a door asking
        for a dozen files streams the big data one file at a time and the rest as before — so a screen's code never waits
        behind the word shards (all at once froze the page — hash-nav §6, one run in four).
     4. file:// — the same doors open under file:// (the Library tab, the Word Gym, the report card's PIN).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/screens-lazy.cjs
   PROVED by breaking (each put in, watched to fail, taken out): viewApp's guard switched off (2: every nav threw
   "viewX is not defined", every address missed); vocab left out of SCR_NAV (1: #/vocab); a stub that loads its file
   but never runs the action (1: the Theme Journey never opened); the wallet sheet drawn without scrDraw (1: a page
   error); the `gym` group without scrShared + scrGames (1: "ready" with no card on the screen, Enter lost);
   boot-lazy's big-data cap lifted to 99 (2: five big files streaming at once, and the Word Gym's code then landed
   after the etymology); every file counted as big data (1: the Word
   Gym's code landed after the second word shard).                                                                 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const { serve } = require('./lib/serve.cjs');
const { booted, until } = require('./lib/wait.cjs');
const SRC = process.env.SRC || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 40, lists: { default: { xp: 30 } }, activeList: 'default', questPath: 'journey',
  trail: { lap: 1, chk: {}, st: {}, seen: {}, done: { u1: { 1: 1 }, u2: { 1: 1 } } }, fr: '2026-01-01', missed: [] };
const HH = { theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [KID] };

(async () => {
  const srv = await serve(SRC, { minify: process.env.MINIFY !== '0' });
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  const cold = async (url, opts) => {
    const ctx = await b.newContext(Object.assign({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' }, opts || {}));
    /* testing unlock (Settings → Grown-ups → Testing tools): the plan locks a free child meets are the screens' own rule,
       not the door's — with them open every screen can be reached and drawn */
    await ctx.addInitScript(hh => { try { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify(hh)); localStorage.setItem('sb_splash', '0'); localStorage.setItem('sb_devunlock', '1'); localStorage.setItem('t_seed', '1'); } } catch (e) {} }, HH);
    const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(url.replace(/^.*\//, '') + ': ' + e.message));
    const files = []; pg.on('request', r => { const m = /\/(app3-[a-z-]+\.js)/.exec(r.url()); if (m) files.push(m[1]); });
    await pg.goto(url); await booted(pg);
    return { ctx, pg, files };
  };
  const settled = (pg, nav) => until(pg, (nav) => (!nav || state.nav === nav) && !state.wordsWait && !document.querySelector('#root .sb-hive') && document.querySelector('#root').innerText.length > 40, nav, 30000);

  /* 1 — every lazy screen by its nav */
  const probe = await cold(srv.url + 'index.html');
  const SCR = await probe.pg.evaluate(() => ({ nav: SCR_NAV, cold: Object.keys(SB_LAZY.reg).filter(n => /^scr/.test(n) && SB_LAZY.state(n)) }));
  ok(!SCR.cold.length && !probe.files.length, 'a cold Home has fetched no lazy app3 file' + (probe.files.length ? ' — ' + probe.files.join(', ') : ''));
  await probe.ctx.close();
  const SKIP = { parent: 'the PIN (§2)', sq: 'retired (draws the games)', trivia: 'retired (draws the games)', firstword: 'needs a child in setup (words-lazy §5)',
    leveltest: 'opened by startLevelTest', levelup: 'opened by a finished level', train: 'opened by a session (§3: coach)' };
  const bad1 = [], good1 = [];
  for (const [nav, grp] of Object.entries(SCR.nav)) {
    if (SKIP[nav]) continue;
    const { ctx, pg, files } = await cold(srv.url + 'index.html');
    /* the games with an engine of their own open through their opener, which fetches it (setNav alone draws their shell) */
    const OPENER = { daily: 'openDailyBee', dailybuzz: 'openDailyBuzz', gym: 'openGym', forge: 'openForge' };
    /* a door that throws (a lazy view named before its file is in) is a named failure, not a crashed test */
    const loader = await pg.evaluate(([nav, op]) => { try { if (op) app[op](); else app.setNav(nav); } catch (e) { return 'threw: ' + e.message; } return !!document.querySelector('#root .sb-hive'); }, [nav, OPENER[nav]]);
    if (typeof loader === 'string') { bad1.push(nav + ' ' + loader); await ctx.close(); continue; }
    const done = await settled(pg, nav === 'gym' || nav === 'games' ? null : nav);
    const r = await pg.evaluate((g) => ({ nav: state.nav, ready: SB_LAZY.ready(g), hive: !!document.querySelector('#root .sb-hive'), len: document.querySelector('#root').innerText.length }), grp);
    if (!done || !r.ready || r.hive) bad1.push(nav + ' (' + grp + ': ' + JSON.stringify(r) + ')'); else good1.push(nav + (loader ? '' : '·'));
    if (!files.length) bad1.push(nav + ' fetched no app3 file');
    await ctx.close();
  }
  ok(!bad1.length, `every lazy screen opens from a cold Home by its nav — the hive loader, then the screen (${good1.length}: ${good1.join(' ')})` + (bad1.length ? ' — ' + bad1.slice(0, 5).join(' | ') : ''));

  /* 2 — by its address */
  const ROUTES = { '#/practice': ['coach', 'quest'], '#/vocab': ['vocab'], '#/quotes': ['quotes'], '#/typing': ['typing'], '#/ipatrain': ['ipatrain'], '#/trivtrain': ['trivtrain'],
    '#/progress': ['progress'], '#/shop': ['shop'], '#/hive/avatars': ['collection'], '#/play': ['games'], '#/library': ['explore'] };
  const bad2 = [];
  for (const [hash, navs] of Object.entries(ROUTES)) {
    const { ctx, pg } = await cold(srv.url + 'index.html' + hash);
    const done = await until(pg, (navs) => navs.includes(state.nav) && !state.wordsWait && !document.querySelector('#root .sb-hive'), navs, 30000);
    if (!done) bad2.push(hash + ' → ' + (await pg.evaluate(() => state.nav)));
    await ctx.close();
  }
  ok(!bad2.length, `every address to a lazy screen lands on it from a cold load (${Object.keys(ROUTES).join(' ')})` + (bad2.length ? ' — ' + bad2.join(' | ') : ''));

  /* 3 — a tap on a stub */
  {
    const { ctx, pg, files } = await cold(srv.url + 'index.html');
    /* Home's own buttons are app3's (a door on Home is never a stub); a stub is what a route, a search place, a key or
       another file calls — here, a Theme Journey's opener, called as any of them would */
    const tid = await pg.evaluate(() => { const t = themeDefs()[0]; return t && t.id; });
    const stub = await pg.evaluate(() => !!(app.openTheme && app.openTheme._scr));
    await pg.evaluate((id) => app.openTheme(id), tid);
    const theme = await until(pg, (id) => state.nav === 'themes' && state.themeSel === id && !document.querySelector('#root .sb-hive') && !app.openTheme._scr, tid, 30000);
    ok(stub && theme && files.includes('app3-library.js'), `a call on a stub (app.openTheme("${tid}")) fetches app3-library.js and then runs: the Theme Journey opens, the stub replaced`);
    await pg.evaluate(() => app.setNav('home')); await until(pg, () => state.nav === 'home');
    await pg.click('#root [data-act="openWallet"]').catch(() => pg.evaluate(() => app.openWallet()));
    const wallet = await until(pg, () => !!document.querySelector('.bz-sheet-ov'), null, 30000);
    ok(wallet && files.includes('app3-me.js'), 'the coins chip opens the wallet sheet on the first tap — its drawing (app3-me.js) lands and draws');
    await pg.evaluate(() => app.closeWallet());
    await pg.click('#root .sb-home-woh');
    const card = await until(pg, () => !!state.wordCard && !!document.querySelector('[data-act="wordCardClose"]'), null, 30000);
    ok(card && files.includes('app3-library.js'), "the word of the hour's card opens (its pop-up is app3-library.js's)");
    await ctx.close();
  }
  {
    const { ctx, pg } = await cold(srv.url + 'index.html');
    /* the screen file slow on the wire, the engine quick: the order a phone on a bad line can see */
    await pg.route(/app3-games\.js/, async (r) => { await new Promise((res) => setTimeout(res, 1500)); await r.continue(); });
    await pg.evaluate(() => app.openGym('sprint'));
    const seen = await pg.evaluate(() => new Promise((res) => { const t0 = Date.now(); const k = () => { let p = null; try { p = SB_GYM.peek(); } catch (e) {}
      if (p && p.phase === 'ready') return res({ ready: true, card: !!document.querySelector('#gym-host [data-g="start"]') });
      if (Date.now() - t0 > 30000) return res({ ready: false }); setTimeout(k, 5); }; k(); }));
    await pg.keyboard.press('Enter');
    const started = await until(pg, () => SB_GYM.peek().phase === 'answer', null, 5000);
    ok(seen.ready && seen.card && started, `an engine never opens ahead of its screen: a Spelling Gym mode from a cold page, its screen file slow, is "ready" only with its card on the screen, and Enter starts it (${JSON.stringify(seen)}, started ${started})`);
    await ctx.close();
  }
  {
    /* ONE BIG FILE AT A TIME (boot-lazy HEAVY_MAX): a door that asks for a dozen files — the drill's card and audio
       groups and the Word Gym's screen file — streams the big data one file at a time, the rest as it comes. With all of
       it streaming at once Chromium's parse workers starved each other and the page froze mid-frame (hash-nav §6, one
       run in four). */
    const { ctx, pg } = await cold(srv.url + 'index.html');
    /* the big data, by file: the word shards, etymology, senses, synonyms, the voice index (boot-lazy HEAVY) */
    const BIG = /\/(words-data(-2|-s)?|words-lore|word-alternates|word-synonyms|voice-words|quotes-lib|figurative-data|lessons-data|adv-concepts-data|concepts-data)\.js/;
    const live = new Set(); let max = 0, total = 0, big = 0;
    pg.on('request', (r) => { if (r.resourceType() === 'script') { total++; if (BIG.test(r.url())) { live.add(r); big++; max = Math.max(max, live.size); } } });
    const end = (r) => live.delete(r); pg.on('requestfinished', end); pg.on('requestfailed', end);
    const got = await pg.evaluate(() => new Promise((res) => { const seen = []; addEventListener('sb-lazy', (e) => seen.push(e.detail));
      SB_LAZY.need(['card', 'audio', 'scrGym'], () => res({ seen, done: ['words1', 'sents', 'words2', 'scrShared', 'scrGym'].every((n) => SB_LAZY.state(n) === 'done') })); }));
    ok(total >= 8 && big >= 5 && max <= 1 && got.done, `a door that asks for ${total} scripts at once (${big} of them big data) streams the big data one file at a time (most seen at once: ${max}), and every one lands`);
    /* the lanes: the screen's own code streams beside the big data, never behind it */
    const at = (n) => got.seen.indexOf(n);
    ok(at('scrGym') >= 0 && at('words2') >= 0 && at('scrGym') < at('words2') && at('scrGym') < at('lore'),
      `the Word Gym's code lands before the 14 MB second word shard and the etymology it was asked for after (${got.seen.join(' ')})`);
    await ctx.close();
  }

  /* 4 — file:// */
  {
    const { ctx, pg } = await cold('file://' + SRC + '/index.html');
    await pg.evaluate(() => app.setNav('explore'));
    const lib = await settled(pg, 'explore');
    await pg.evaluate(() => app.openCoach());
    const gym = await until(pg, () => (state.nav === 'coach' || state.nav === 'quest') && !document.querySelector('#root .sb-hive'), null, 30000);
    await pg.evaluate(() => app.setNav('parent'));
    const pin = await until(pg, () => !!state.pinDlg, null, 10000);
    for (const k of '1234') await pg.evaluate(k => app.pinKey(k), k);
    const rc = await until(pg, () => state.nav === 'progress' && state.progTab === 'parent' && !document.querySelector('#root .sb-hive'), null, 30000);
    ok(lib && gym && pin && rc, 'under file:// the doors open too: the Library, the Word Gym, the report card behind the PIN');
    await ctx.close();
  }

  ok(!errs.length, 'no page errors' + (errs.length ? ' — ' + errs.slice(0, 4).join(' | ') : ''));
  await b.close(); await srv.close();
  console.log(fails ? `\n${fails} FAILED` : '\nevery screen opens from a cold page, its code arriving at its door');
  process.exit(fails ? 1 : 0);
})();
