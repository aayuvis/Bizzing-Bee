/* THE BOOT WORD TIER IS LAZY, AND NOTHING A CHILD SEES CHANGES (road to 4.5, P1.13 step 1 — first-load JS ≤ 400 KB).

   words-data.js + words-extra.js + words-patch.js (~368 KB gz) are boot-lazy's `words1` bundle now, not boot scripts.
   Home draws from SB_CURRICULUM (curriculum-data.js, generated — tests/curriculum.cjs holds it to app3's own algorithm).
   Here, in a browser, served gzipped and minified as deploy ships it:
     1. A RETURNING SPELLER'S HOME fetches no word file and draws every card (no page error); when the tier lands
        (asked for here, as the first tap's idle queue would) Home is the SAME — the word of the hour, the greeting,
        "You are here", the second card and the ribbon do not rewrite themselves.
     2. THE LIVE CURRICULUM: once the tier is in, defaultStages() and journeySorted() are the generated words mapped onto
        the page's own records — the very objects buildDefaultStages / buildJourneySorted pick from the loaded tier —
        every boot record is scored (trickSeal), and the second shard lands after it, in order.
     3. A TAP BEFORE THE TIER WAITS, THEN RUNS: with words-data.js held back on the wire, a tap on Today's ten shows
        the hive loader, nothing else can be tapped, and Today opens with its words once the tier lands. The shell's
        own controls (the drawer) answer at once.
     4. AN ADDRESS BEFORE THE TIER WAITS TOO: a reload on #/practice lands on the Word Gym with its words.
     5. SETUP ENDS ON A WORD: a new visitor walks the landing and onboarding without the tier; the first word is one
        of app3's own ten (firstWord reads the word index — with no tier it would always be "bee").
     6. file:// loads the bundle too (the three files run in order).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/words-lazy.cjs
   PROVED by breaking (each put in, watched to fail, taken out): wohPool without the seed (3: a card holding, the hour's
   word and the rest of Home rewriting); the seed's respelling dropped from the tile (1); no tap gate (1); the tier not
   scored when it lands (1); the seal with the homophone index in hand (1); the bundle inserted async, out of order (3:
   the stages, the ladder, the second shard's order); the end of setup not waiting (1 — the first word was "bee").   */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const { serve } = require('./lib/serve.cjs');
const { booted, until, lazy } = require('./lib/wait.cjs');
const SRC = process.env.SRC || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 40, lists: { default: { xp: 30 } }, activeList: 'default',
  trail: { lap: 1, chk: { '1:meadow:4': 1 }, st: {}, seen: {}, done: Object.fromEntries([...Array(5)].map((_, i) => ['u' + (i + 1), { 1: 1 }])) },
  mast: { ability: { b: 1, due: 0, d: 1, ok: 1, n: 1 } }, missed: [{ w: 'rhythm', n: 1, ts: Date.now() - 3 * 864e5 }], fr: '2026-01-01' };
const seedHH = (k) => ({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [k] });
const WORD_FILES = /\/(words-data|words-extra|words-patch|curriculum-ladder)\.js/;

(async () => {
  const srv = await serve(SRC, { minify: process.env.MINIFY !== '0' });
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  const ctxFor = async (kid, opts) => {
    const ctx = await b.newContext(Object.assign({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' }, opts || {}));
    if (kid) await ctx.addInitScript(hh => { try { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify(hh)); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } } catch (e) {} }, seedHH(kid));
    return ctx;
  };

  /* ---- 1. Home without the tier, and when it lands ---- */
  {
    const ctx = await ctxFor(KID); const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push('home: ' + e.message));
    const asked = []; pg.on('request', r => { if (WORD_FILES.test(r.url())) asked.push(r.url().replace(/^.*\//, '').replace(/\?.*/, '')); });
    await pg.goto(srv.url + 'index.html');
    await booted(pg);
    await until(pg, () => !!document.querySelector('#root .sb-here') && !!document.querySelector('#root .sb-home-woh') && !document.querySelector('#root .sb-greet-hold'), null, 20000);
    await pg.waitForTimeout(2500);
    const before = await pg.evaluate(() => ({ st: SB_LAZY.state('words1'), n: SB_DATA.nsf.length,
      woh: (document.querySelector('#root .sb-home-woh') || {}).outerHTML, greet: (document.querySelector('#root .sb-home-greet') || {}).outerHTML,
      r2: (document.querySelector('#root .sb-home-r2') || {}).outerHTML, hold: document.querySelectorAll('#root .sb-hold').length }));
    ok(!asked.length && before.st == null && before.n === 0, `a returning speller's Home asks for no word file and holds no record (asked: ${asked.join(', ') || 'none'}, nsf ${before.n})`);
    ok(before.woh && before.greet && before.r2 && !before.hold, 'every card on Home is drawn — the word of the hour (from the seed), the hello, "You are here", the second card and the ribbon; no card is holding');
    await lazy(pg, 'words1'); await pg.waitForTimeout(600);
    const after = await pg.evaluate(() => ({ st: SB_LAZY.state('words1'), n: SB_DATA.nsf.length,
      woh: (document.querySelector('#root .sb-home-woh') || {}).outerHTML, greet: (document.querySelector('#root .sb-home-greet') || {}).outerHTML,
      r2: (document.querySelector('#root .sb-home-r2') || {}).outerHTML }));
    ok(after.st === 'done' && after.n > 7000, `the tier lands as one bundle (${after.n} records)`);
    ok(after.woh === before.woh, 'the word of the hour does not rewrite itself when the tier lands');
    ok(after.greet === before.greet && after.r2 === before.r2, 'nor does the hello, "You are here", the second card or the ribbon');

    /* ---- 2. the live curriculum ---- */
    const live = await pg.evaluate(() => {
      const C = SB_CURRICULUM, nsf = SB_DATA.nsf;
      const ds = defaultStages(), algo = buildDefaultStages(nsf);   /* (sorts by y/length only: no score is computed here) */
      const js = journeySorted(), ja = buildJourneySorted(nsf);
      return { stagesKeys: JSON.stringify(ds.map(s => s.words.map(w => w.w))) === JSON.stringify(C.stages),
        stagesObj: ds.every((s, i) => s.words.length === algo[i].words.length && s.words.every((w, j) => w === algo[i].words[j])),
        ladKeys: JSON.stringify(js.map(w => w.w)) === JSON.stringify(C.ladder), ladObj: js.length === ja.length && js.every((w, i) => w === ja[i]),
        thin: ds.some(s => s.words.some(w => !w.d)), n: js.length };
    });
    ok(live.stagesKeys && live.stagesObj && !live.thin, 'defaultStages() is the generated curriculum on the page\'s own records — the very objects buildDefaultStages picks');
    ok(live.ladKeys && live.ladObj, `journeySorted() is the generated ladder on the page's own records — the very objects buildJourneySorted orders (${live.n})`);
    const two = await pg.evaluate(() => new Promise(r => SB_LAZY.need('words2', () => r({ n: SB_DATA.nsf.length, first: SB_DATA.nsf[0].w, ok: SB_CURRICULUM.stages[1].every(w => SB_DATA.nsf.some(x => x.w === w)) }))));
    ok(two.n > 40000 && two.first === 'ability', `the second shard lands AFTER the tier, appended (${two.n} records, the first is still the tier's "${two.first}")`);
    await ctx.close();
  }

  /* ---- 2b. the scores: the homophone groups land FIRST, then the tier — every boot record is scored the moment the tier
     lands (trickSeal), with no homophone bonus, as Home's first render always scored them ---- */
  {
    const ctx = await ctxFor(KID); const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push('seal: ' + e.message));
    await pg.goto(srv.url + 'index.html'); await booted(pg);
    await pg.addScriptTag({ url: srv.url + 'sounds-data.js' });
    const r = await pg.evaluate(() => new Promise(res => { const hom = Array.isArray(window.SB_HOM) && SB_HOM.length;
      SB_LAZY.need('words1', () => { const nsf = SB_DATA.nsf, H = homIndex();
        res({ hom, n: nsf.length, sealed: nsf.filter(w => w.w && w._tk).length, homs: nsf.filter(w => w.w && H[nkey(w.w)]).length, homCls: nsf.filter(w => w._tk && w._tk.cls === 'hom').length }); }); }));
    ok(r.hom > 100 && r.n > 7000 && r.sealed === r.n && r.homs > 100 && r.homCls === 0,
      `every boot record is scored the moment the tier lands, with no homophone bonus although SB_HOM landed first (${r.sealed}/${r.n} scored, ${r.homs} homophones, ${r.homCls} scored as one)`);
    await ctx.close();
  }

  /* ---- 3. a tap before the tier ---- */
  {
    const ctx = await ctxFor(KID); const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push('tap: ' + e.message));
    let release; const gate = new Promise(r => { release = r; });
    await pg.route(/\/words-data\.js/, async route => { await gate; route.continue(); });
    await pg.goto(srv.url + 'index.html'); await booted(pg);
    await until(pg, () => !!document.querySelector('#root [data-act="openDrawer"]'));
    await pg.click('#root [data-act="openDrawer"]');
    const drawer = await until(pg, () => state.drawerOpen === true, null, 3000);
    ok(drawer, 'the shell answers at once before the tier — the drawer opens (it reads no word)');
    await pg.evaluate(() => app.closeDrawer && app.closeDrawer());
    await until(pg, () => !!document.querySelector('#root [data-act="openToday"]'));
    await pg.click('#root [data-act="openToday"]');
    const held = await until(pg, () => state.wordsWait === true && !!document.querySelector('.sb-words-wait .sb-hive') && state.nav === 'home', null, 3000);
    ok(held, "a tap on Today's ten before the tier is HELD: the hive loader covers the screen, Home stays under it");
    await pg.mouse.click(640, 450).catch(() => {});
    release();
    const ran = await until(pg, () => state.nav === 'today' && !state.wordsWait && SB_LAZY.ready('words1') && ((active().today || {}).ws || []).length > 0, null, 30000);
    const today = await pg.evaluate(() => { const c = active(); return { nav: state.nav, ws: ((c.today || {}).ws || []).length, defs: ((c.today || {}).ws || []).every(w => typeof w === 'string' || (w && w.w)) }; });
    ok(ran && today.ws >= 1, `…and runs the moment the tier lands: Today's ten opens with ${today.ws} words`);
    await ctx.close();
  }

  /* ---- 4. an address before the tier ---- */
  {
    const ctx = await ctxFor(KID); const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push('route: ' + e.message));
    await pg.goto(srv.url + 'index.html#/practice'); await booted(pg);
    const gymOk = await until(pg, () => (state.nav === 'coach' || state.nav === 'quest') && SB_LAZY.ready('words1') && !state.wordsWait, null, 30000);
    const nwords = await pg.evaluate(() => { try { return stageWords(activeListKey()).filter(w => w.d).length; } catch (e) { return -1; } });
    const nav = await pg.evaluate(() => state.nav);
    ok(gymOk && nwords > 0, `a reload on #/practice waits for the tier and lands on the Word Gym (${nav}) with its words (${nwords} with meanings)`);
    await ctx.close();
  }

  /* ---- 5. setup ends on a word ---- */
  {
    const ctx = await ctxFor(null, { viewport: { width: 430, height: 900 } }); const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push('setup: ' + e.message));
    const asked = []; pg.on('request', r => { if (WORD_FILES.test(r.url())) asked.push(Date.now()); });
    await pg.goto(srv.url + 'index.html'); await booted(pg);
    await pg.waitForTimeout(1500);
    const landAsked = asked.length;
    await pg.evaluate(() => { app.startFree ? app.startFree() : set({ screen: 'onboarding', onbStep: 0 }); });
    await until(pg, () => state.screen === 'onboarding');
    await pg.evaluate(() => { state.draft.name = 'Mira'; state.draft.ageBand = '8-10'; state.draft.age = 9; });
    for (let i = 0; i < 8; i++) { const done = await pg.evaluate(() => { if (state.screen !== 'onboarding') return true; app.onbNext(); return false; }); if (done) break; await pg.waitForTimeout(150); }
    const fw = await until(pg, () => state.nav === 'firstword' && state.fw && SB_LAZY.ready('words1'), null, 30000);
    const w = await pg.evaluate(() => state.fw && state.fw.w);
    ok(!landAsked, 'the opening page asks for no word file');
    ok(fw && ['bee', 'sun', 'hop', 'map', 'cup', 'jam', 'fox', 'web', 'hat', 'pen'].includes(w) && w === (['bee', 'sun', 'hop', 'map', 'cup', 'jam', 'fox', 'web', 'hat', 'pen'].filter(x => x)[4 % 10]),
      `setup ends on the first word, picked as before from the word index (Mira → "${w}")`);
    await ctx.close();
  }

  /* ---- 6. file:// ---- */
  {
    const ctx = await b.newContext(); await ctx.addInitScript(hh => { try { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify(hh)); localStorage.setItem('t_seed', '1'); } } catch (e) {} }, seedHH(KID));
    const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push('file: ' + e.message));
    await pg.goto('file://' + SRC + '/index.html'); await booted(pg);
    const r = await pg.evaluate(() => new Promise(res => SB_LAZY.need('words1', () => res({ n: SB_DATA.nsf.length, patched: typeof SB_WORDS_PATCH === 'function', lad: (SB_CURRICULUM.ladder || []).length }))));
    ok(r.n > 7000 && r.patched && r.lad > 7000, `under file:// the bundle loads in order (${r.n} records, the patch and the ladder in)`);
    await ctx.close();
  }

  ok(!errs.length, 'no page errors' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); await srv.close();
  console.log(fails ? `\n${fails} FAILED` : '\nthe boot word tier is lazy, and nothing a child sees changed');
  process.exit(fails ? 1 : 0);
})();
