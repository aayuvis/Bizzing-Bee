/* MY FEED — THE SCREEN (FAMILY-STANDARD §6a), in Chromium, over http.                       @check

   shell      checkShell(page, {phone, bee:true}) — the family's own measurement of Bee's chrome
              (tests/lib/family/shell-check.mjs, vendored byte for byte) — returns [] on Home,
              desktop and phone, light and dark, with SIX tabs: … Play · My Feed, My Feed last
   screen     #/feed: the page head, about twenty cards each saying why, then the finished card
              last, pointing at Continue; no likes, views or streaks; no sound before a tap;
              nothing wider than a 390px phone; the My Feed tab is the lit one
   level      the feed is the child's region: nothing above the next one, and a child further
              along the road gets different "now" cards
   due        a word whose mastery record slipped, its gap over, is the FIRST card, and says so
   play       a question by KEYBOARD: a wrong answer holds ("Not this time — it is …" + Continue)
              and pays nothing; by TOUCH: a right answer pays one coin through the wallet, once —
              the same card answered again on a later visit pays nothing
   keys       j / k and the arrows move card to card
   groups     #/feed loads only the level indexes the child can be shown and the body chunks its
              session's cards live in — never the whole feed
   routes     every card's route opens the real screen it names (all of them)
   contrast   axe colour-contrast on #/feed in every world, in light, white and dusk
   pin        the grown-up's switch (behind the PIN) takes the tab and the ☰ row away, #/feed
              says it is off, and the choice survives a reload
   demo       ?demo shows a sample feed and leaves the real household's storage untouched
   Tests BEHAVIOUR through the app's globals (state, app, SB_FEED, BZ_FEED) — never source text,
   so it holds on the minified deploy tree. Port 5120 (SB_FEED_PORT overrides).
   Proved by breaking (2 Oct 2026), each put back: the tab drawn whatever the switch says → "leaves the
   tabs" and "survives a reload" fail; every body chunk fetched at the door → both "only the groups its
   session needs" fail (39 of 39); focus left where render() drops it → the three keyboard checks fail;
   the feed's text inks left at the world's muted/accent → contrast fails in anime, science and avatar.
   Run: node tests/feed-screen.cjs        (FEED_ROUTES=n opens only the first n routes; FEED_DEBUG=1) */
'use strict';
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const { serve } = require('./lib/serve.cjs');
const SRC = process.env.SRC || path.resolve(__dirname, '..');
const PORT = +(process.env.SB_FEED_PORT || 5120);
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const wait = ms => new Promise(r => setTimeout(r, ms));

const kidOf = (o) => Object.assign({ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 0, lists: { journey: { xp: 12 } }, activeList: 'journey',
  missed: [], unlockedThemes: ['spellbound'], trail: { lap: 1, done: { u1: { 1: 90 } }, chk: {}, seen: {}, st: {}, elap: 1, edone: {}, echk: {} } }, o || {});
const seedOf = (mode, kid) => ({ theme: 'spellbound', mode: mode || 'light', pin: '2468', activeIdx: 0, children: [kid || kidOf()] });

(async () => {
  const srv = await serve(SRC, { port: PORT });
  const BASE = `http://127.0.0.1:${PORT}/index.html`;
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p)) });
  const { checkShell } = await import(path.join(__dirname, 'lib', 'family', 'shell-check.mjs'));
  const errs = [];
  async function open(o) {
    o = o || {};
    const ctx = await b.newContext({ viewport: o.phone ? { width: 390, height: 844 } : { width: 1280, height: 800 }, isMobile: !!o.phone, hasTouch: !!(o.phone || o.touch),
      deviceScaleFactor: 1, colorScheme: o.dark ? 'dark' : 'light', serviceWorkers: 'block' });
    await ctx.addInitScript(s => { try { if (!sessionStorage.getItem('t_seed')) { localStorage.clear(); localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_splash', '0'); sessionStorage.setItem('t_seed', '1'); } } catch (e) {} }, o.seed || seedOf());
    /* count every sound: a clip, a speech utterance, or WebAudio starting */
    await ctx.addInitScript(() => { window.__snd = 0; const A = window.Audio; window.Audio = function () { window.__snd++; return new A(...arguments); };
      try { const sp = speechSynthesis.speak.bind(speechSynthesis); speechSynthesis.speak = u => { window.__snd++; return sp(u); }; } catch (e) {} });
    const pg = await ctx.newPage();
    pg.on('pageerror', e => errs.push(e.message.slice(0, 200)));
    await pg.goto(BASE + (o.q || '')); await wait(2600);
    return { ctx, pg };
  }
  const openFeed = async pg => { await pg.evaluate(() => app.setNav('feed')); await pg.waitForSelector('.bzf-end', { timeout: 30000 }).catch(() => {}); await wait(300); };

  /* ---- shell: Bee's chrome with six tabs, measured by the family's own check ---- */
  for (const dark of [false, true]) for (const phone of [false, true]) {
    const { ctx, pg } = await open({ phone, dark, seed: seedOf(dark ? 'dusk' : 'light') });
    await pg.evaluate(() => app.setNav('home')); await wait(600);
    const f = await checkShell(pg, { phone, bee: true });
    const tabs = await pg.evaluate(ph => [...document.querySelectorAll(ph ? 'nav.sb-tabbar button' : '.sb-topnav button')].map(x => x.textContent.trim()), phone);
    ok(!f.length, `checkShell on Home, ${phone ? 'phone' : 'desktop'}, ${dark ? 'dark' : 'light'}: [] ${f.length ? JSON.stringify(f) : ''}`);
    ok(tabs.length === 6 && /My Feed$/.test(tabs[5]) && /Play$/.test(tabs[4]), `six tabs, My Feed last: ${tabs.join(' · ')}`);
    await ctx.close();
  }

  /* ---- the screen, desktop and phone ---- */
  for (const phone of [false, true]) {
    const { ctx, pg } = await open({ phone });
    await openFeed(pg);
    const r = await pg.evaluate(() => {
      const cards = [...document.querySelectorAll('.bzf-card:not(.bzf-end)')], list = document.querySelector('.bzf-list');
      /* the feed's own words — its chrome, the reasons and the buttons — not the corpus a card quotes */
      const page = document.querySelector('.sb-feedpage').cloneNode(true);
      page.querySelectorAll('h3,.bzf-body,.bzf-src,.bzf-roman,.bzf-q,.bzf-opt,.bzf-after').forEach(x => x.remove());
      return { head: !!document.querySelector('.sb-feedpage .sb-phead h2'), n: cards.length, endLast: !!list && list.lastElementChild.classList.contains('bzf-end'),
        cont: (document.querySelector('.bzf-end a') || {}).getAttribute ? document.querySelector('.bzf-end a').getAttribute('href') : '',
        why: cards.filter(c => (c.querySelector('.bzf-why') || {}).textContent).length, text: page.textContent + ' ' + document.querySelector('.sb-header-sticky').textContent,
        snd: window.__snd, wide: document.documentElement.scrollWidth - innerWidth, nav: state.nav, hash: location.hash,
        lit: [...document.querySelectorAll('nav.sb-tabbar button[aria-current="page"]')].map(x => x.textContent.trim()) };
    });
    const where = phone ? 'phone' : 'desktop';
    ok(r.head && r.n >= 12 && r.n <= 20, `${where}: the page head and ${r.n} cards (about twenty)`);
    ok(r.endLast && r.cont === '#/continue', `${where}: the feed ends with the finished card, pointing at Continue (${r.cont})`);
    ok(r.why === r.n, `${where}: every card says why it is there`);
    ok(!/\b(likes?|followers?|views|streaks?|days in a row)\b/i.test(r.text), `${where}: no likes, views or streaks`);
    ok(r.snd === 0, `${where}: no sound before a tap (${r.snd})`);
    ok(r.nav === 'feed' && r.hash === '#/feed', `${where}: the route is #/feed`);
    /* it loaded no more than its session needs: the indexes of the levels it may show, and the body chunks its cards are in */
    const g = await pg.evaluate(() => { const got = performance.getEntriesByType('resource').map(e => e.name).filter(n => /\/feed\//.test(n)).map(n => n.split('/feed/')[1].split('?')[0]);
      const L = SB_FEED.levelOf(SB_SHELL.nextStep()), want = SB_FEED.groupsFor(L).map(x => SB_FEED_META.index[x]);
      const bodies = [...new Set(active().feed.ids.map(x => SB_FEED_META.body[x.g]))];
      return { idx: got.filter(n => /^fi/.test(n)), bod: got.filter(n => /^fb/.test(n)), want, bodies, all: Object.keys(SB_FEED_META.body).length }; });
    ok(g.idx.every(n => g.want.includes(n)) && g.bod.length === g.bodies.length && g.bod.every(n => g.bodies.includes(n)),
      `${where}: it loaded only the groups its session needs — ${g.idx.length} indexes (${g.idx.join(' ')}), ${g.bod.length} of ${g.all} body chunks`);
    if (phone) { ok(r.wide <= 0, `phone: nothing wider than 390px (${r.wide}px over)`); ok(r.lit.join() === 'My Feed', 'phone: the My Feed tab is the lit one'); }
    await ctx.close();
  }

  /* ---- level: the child's region, and a different feed further along ---- */
  {
    const done = {}; for (let i = 1; i <= 24; i++) done['u' + i] = { 1: 90 };
    const chk = {}; for (let n = 1; n <= 12; n++) { chk['1:meadow:' + n] = 90; chk['1:library:' + n] = 90; }
    const far = kidOf({ trail: { lap: 1, done, chk, seen: {}, st: {}, elap: 1, edone: {}, echk: {} } });
    const runs = [];
    for (const seed of [seedOf(), seedOf('light', far)]) {
      const { ctx, pg } = await open({ seed });
      await openFeed(pg);
      runs.push(await pg.evaluate(() => { const nx = SB_SHELL.nextStep(), L = SB_FEED.levelOf(nx), by = {}; Object.values(SB_FEED_IDX).flat().forEach(r => { by[r[0]] = { level: r[2] }; });
        const ids = active().feed.ids; return { L, name: SB_FEED.levelName(L), now: ids.filter(x => x.tier === 'now' && by[x.id].level != null).map(x => x.id),
          above: ids.filter(x => by[x.id].level > L + 1).length, lv: ids.map(x => by[x.id].level) }; }));
      await ctx.close();
    }
    ok(runs[0].L === 1 && runs[1].L > 1, `the level is the child's Word Atlas region: ${runs[0].name} (${runs[0].L}) → ${runs[1].name} (${runs[1].L})`);
    ok(runs.every(x => x.above === 0), 'nothing above the next region appears');
    ok(runs[0].now.length && runs[1].now.length && !runs[0].now.some(id => runs[1].now.includes(id)), `moving up the road changes the "now" cards (${runs[0].now.length} → ${runs[1].now.length}, none shared)`);
  }

  /* ---- due: a slipped word comes back first ---- */
  {
    const today = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 864e5);
    const ts = Date.now() - 3 * 864e5;
    const kid = kidOf({ mast: { circus: { b: 1, due: today - 1, d: today - 3, ok: 2, n: 3, miss: 1, lp: 1, sl: ts, at: ts } } });
    const { ctx, pg } = await open({ seed: seedOf('light', kid) });
    await openFeed(pg);
    const r = await pg.evaluate(() => { const c = document.querySelector('.bzf-card'); return { id: c && c.getAttribute('data-id'), why: c && c.querySelector('.bzf-why').textContent }; });
    ok(/circus/.test(r.id || '') && /slipped on \w+day — its gap is over/.test(r.why || ''), `a word that slipped comes back first: ${r.id} — "${r.why}"`);
    await ctx.close();
  }

  /* ---- play: keyboard and touch ---- */
  {
    const { ctx, pg } = await open({ touch: true });
    await openFeed(pg);
    const qs = await pg.evaluate(() => [...document.querySelectorAll('.bzf-card')].filter(c => c.querySelector('[data-bzf="ans"]')).map(c => c.getAttribute('data-id')));
    ok(qs.length >= 2, `${qs.length} questions in today's feed (at most five)`);
    ok(qs.length <= 5, 'at most five questions');
    const id = qs[0], sel = o => `.bzf-card[data-id="${id}"] [data-bzf="ans"][data-o="${o}"]`;
    const pre = await pg.evaluate(id => { const c = document.querySelector(`.bzf-card[data-id="${id}"]`); return { html: c.innerHTML, n: c.querySelectorAll('[data-bzf="ans"]').length, first: c.querySelector('[data-bzf="ans"]').getAttribute('data-o') }; }, id);
    ok(!/\bok\b|\bno\b/.test((pre.html.match(/class="bzf-opt[^"]*"/g) || []).join(' ')), 'before an answer, no option is marked');
    const c0 = await pg.evaluate(() => active().coins || 0);
    await pg.focus(sel(1)); await pg.keyboard.press('Enter'); await wait(250);
    const held = await pg.evaluate(id => { const c = document.querySelector(`.bzf-card[data-id="${id}"]`); return { text: c.innerText, cont: !!c.querySelector('[data-bzf="cont"]'), coins: active().coins || 0,
      focus: !!document.activeElement.closest(`.bzf-card[data-id="${id}"]`) }; }, id);
    ok(/Not this time — it is “/.test(held.text) && held.cont, 'keyboard: a wrong answer holds — "Not this time — it is …" and a Continue');
    ok(held.coins === c0, 'a wrong answer pays nothing');
    ok(held.focus, 'focus stays on the card, so the keyboard can carry on');
    const onCont = await pg.evaluate(() => document.activeElement.getAttribute('data-bzf'));
    ok(onCont === 'cont', 'after a wrong answer, focus sits on Continue (' + onCont + ')');
    await pg.keyboard.press('Enter'); await wait(250);
    const after = await pg.evaluate(id => { const c = document.querySelector(`.bzf-card[data-id="${id}"]`); return { cont: !!c.querySelector('[data-bzf="cont"]'), dis: [...c.querySelectorAll('[data-bzf="ans"]')].every(x => x.disabled) }; }, id);
    ok(!after.cont && after.dis, 'Continue moves on; the question stays answered');
    const id2 = qs[1];
    await pg.tap(`.bzf-card[data-id="${id2}"] [data-bzf="ans"][data-o="0"]`); await wait(300);
    const r = await pg.evaluate(id => ({ coins: active().coins || 0, text: document.querySelector(`.bzf-card[data-id="${id}"]`).innerText, ledger: BZ_WALLET.ledger(active().name).filter(x => x.n > 0).length }), id2);
    ok(r.coins === c0 + 1 && /^Right\./m.test(r.text), `touch: a right answer pays exactly one coin (${c0} → ${r.coins})`);
    await pg.evaluate(() => { app.setNav('home'); SB_FEED.reset(); }); await wait(200); await openFeed(pg);
    await pg.evaluate(id => { const x = document.querySelector(`.bzf-card[data-id="${id}"] [data-bzf="ans"][data-o="0"]`); if (x) x.click(); }, id2); await wait(300);
    ok((await pg.evaluate(() => active().coins || 0)) === c0 + 1, 'the same question answered again on a later visit pays nothing');
    /* keys */
    await pg.focus('.bzf-card'); await pg.keyboard.press('j'); await pg.keyboard.press('ArrowDown');
    const f2 = await pg.evaluate(() => [...document.querySelectorAll('.bzf-card')].indexOf(document.activeElement));
    await pg.keyboard.press('k');
    const f1 = await pg.evaluate(() => [...document.querySelectorAll('.bzf-card')].indexOf(document.activeElement));
    ok(f2 === 2 && f1 === 1, `j / k and the arrows move card to card (${f2}, then ${f1})`);
    /* the recorded clip plays only on a tap */
    const s0 = await pg.evaluate(() => window.__snd);
    const hear = await pg.evaluate(() => { const x = document.querySelector('[data-bzf="hear"]'); if (x) x.click(); return !!x; });
    if (hear) { await wait(2500); ok((await pg.evaluate(() => window.__snd)) > s0, 'a word card\'s Hear it plays the word on a tap'); }
    await ctx.close();
  }

  /* ---- routes: every card's route opens the screen it names ---- */
  {
    const { ctx, pg } = await open();
    await openFeed(pg);
    await pg.evaluate(() => new Promise(r => { const M = SB_FEED_META, names = [];
      for (const g in M.index) { SB_LAZY.reg['feedI' + g] = 'feed/' + M.index[g]; names.push('feedI' + g); }
      for (const g in M.body) { SB_LAZY.reg['feedB' + g] = 'feed/' + M.body[g]; names.push('feedB' + g); }
      SB_LAZY.need(names, r); }));
    const routes = await pg.evaluate(() => { state.devUnlock = true; return [...new Set(Object.values(SB_FEED_IDX).flat().map(r => r[0]).map(id => (SB_FEED_BODY[id] || {}).route).filter(Boolean))]; });
    const bad = [];
    const t0 = Date.now();
    /* every screen route is OPENED; of the word routes (thousands), every one must find its word in the
       library the word card is drawn from, and a spread of them — every 25th — is opened as well */
    const words = routes.filter(r => /^#\/word\//.test(r));
    await pg.evaluate(() => new Promise(r => SB_LAZY.need('words', r))); await wait(400);
    const lost = await pg.evaluate(ws => ws.filter(r => { const w = r.slice(7), db = wordDB(); return !(db.get && db.get(nkey(w))); }), words);
    ok(!lost.length, `all ${words.length} word routes name a word the library holds` + (lost.length ? ' — ' + lost.slice(0, 5).join(' ') : ''));
    const todo = routes.filter((r, i) => !/^#\/word\//.test(r) || words.indexOf(r) % 25 === 0).slice(0, +(process.env.FEED_ROUTES || 1e9));
    for (const r of todo) {
      const res = await pg.evaluate(async r => {
        const W = ms => new Promise(ok => setTimeout(ok, ms));
        location.hash = r; await W(40);
        for (let i = 0; i < 60; i++) {
          const S = state, p = r.slice(2).split('/');
          const good = p[0] === 'word' ? S.nav === 'finder' && S.finderSel && S.finderSel.w === p[1]
            : p[0] === 'stop' ? S.nav === 'trail' && S.trailUnit === p[1]
            : p[0] === 'atlas' ? S.nav === 'trail' && S.trailAct === p[2]
            : p[0] === 'play' ? S.nav === 'games' : p[0] === 'trivia' ? S.nav === 'trivia' : p[0] === 'figurative' ? S.nav === 'figurative'
            : p[0] === 'hive' ? S.nav === 'collection' : false;
          if (good && (document.querySelector('.sb-content') || {}).innerText) return true;
          await W(50);
        }
        return false;
      }, r);
      if (!res) { bad.push(r); if (process.env.FEED_DEBUG) console.log('    route failed: ' + r); }
    }
    ok(!bad.length, `all ${todo.length} of ${routes.length} routes open the screen they name (${Math.round((Date.now() - t0) / 1000)}s)` + (bad.length ? ` — ${bad.length} do not: ${bad.slice(0, 5).join(' ')}` : ''));
    await ctx.close();
  }

  /* ---- contrast: every world, light / white / dusk ---- */
  {
    const AXE = path.join(SRC, 'node_modules', 'axe-core', 'axe.min.js');
    const { ctx, pg } = await open();
    await openFeed(pg);
    await pg.addScriptTag({ path: AXE });
    const worlds = await pg.evaluate(() => THEMES.map(t => t.id));
    const viol = [];
    for (const wld of worlds) for (const mode of ['light', 'white', 'dusk']) {
      const v = await pg.evaluate(async ([wld, mode]) => {
        state.devUnlock = true; state.theme = wld; app.setModePref(mode); app.setNav('feed'); render();
        await new Promise(r => setTimeout(r, 350));
        const res = await axe.run(document.querySelector('.sb-feedpage'), { runOnly: { type: 'rule', values: ['color-contrast'] } });
        return res.violations.flatMap(x => x.nodes.map(n => n.target.join(' ') + ' ' + (n.any[0] || {}).message));
      }, [wld, mode]);
      if (v.length) viol.push(...v.map(x => `${wld}/${mode}: ${x}`));
    }
    ok(!viol.length, `#/feed passes colour contrast in all ${worlds.length} worlds × light, white, dusk` + (viol.length ? ` — ${viol.length}: ${viol.slice(0, 3).join(' | ')}` : ''));
    await ctx.close();
  }

  /* ---- pin: the grown-up's switch ---- */
  {
    const { ctx, pg } = await open();
    const before = await pg.evaluate(async () => { app.setNav('settings'); await new Promise(r => setTimeout(r, 150));
      return !!document.querySelector('#sb-set-ov [data-act="toggleFeed"]'); });
    ok(!before, 'the switch is not on the child\'s side of Settings — it waits behind the PIN');
    await pg.evaluate(async () => { app.setGrownOpen(); await new Promise(r => setTimeout(r, 100)); for (const k of '2468') app.pinKey(k); await new Promise(r => setTimeout(r, 150));
      document.querySelector('#sb-set-ov [data-act="toggleFeed"]').click(); await new Promise(r => setTimeout(r, 150)); app.closeSettings(); app.setNav('home'); });
    await wait(300);
    const gone = async () => pg.evaluate(async () => { app.openDrawer(); await new Promise(r => setTimeout(r, 150));
      const o = { tabs: [...document.querySelectorAll('.sb-topnav button, nav.sb-tabbar button')].map(x => x.textContent.trim()),
        drawer: [...document.querySelectorAll('.bz-drawer button, .bz-drawer a')].map(x => x.textContent.replace(/\s+/g, ' ').trim()) };
      app.closeDrawer && app.closeDrawer(); state.drawerOpen = false;
      location.hash = '#/feed'; await new Promise(r => setTimeout(r, 400));
      o.cards = document.querySelectorAll('.bzf-card').length; o.text = (document.querySelector('.sb-content') || {}).innerText || ''; return o; });
    let g = await gone();
    ok(!g.tabs.some(t => /My Feed/.test(t)) && !g.drawer.some(t => /^My Feed/.test(t)), 'switched off, My Feed leaves the tabs and the ☰ drawer');
    ok(g.cards === 0 && /switched off/.test(g.text), '#/feed says it is switched off and shows no cards');
    await pg.reload(); await wait(2600); g = await gone();
    ok(!g.tabs.some(t => /My Feed/.test(t)) && g.cards === 0, 'the choice survives a reload');
    await ctx.close();
  }

  /* ---- demo: a sample feed that writes nothing ---- */
  {
    const { ctx, pg } = await open({ touch: true });
    /* the browser's REAL storage (the demo sandbox wraps localStorage inside the page, so the page cannot be asked) */
    const dump = async () => { const st = await ctx.storageState(); const o = {}; st.origins.forEach(x => x.localStorage.forEach(kv => { o[x.origin + ' ' + kv.name] = kv.value; })); return o; };
    const before = await dump();
    await pg.goto(BASE + '?demo'); await wait(2600); await openFeed(pg);
    const n = await pg.evaluate(() => document.querySelectorAll('.bzf-card:not(.bzf-end)').length);
    await pg.evaluate(() => { const x = document.querySelector('[data-bzf="ans"][data-o="0"]'); if (x) x.click(); });
    await wait(300);
    const after = await dump();
    const changed = Object.keys(Object.assign({}, before, after)).filter(k => before[k] !== after[k]);
    ok(n >= 12, `?demo shows a sample feed (${n} cards)`);
    ok(!changed.length, '?demo, a question answered in it included, leaves the household untouched' + (changed.length ? ': ' + changed.join(', ') : ''));
    await ctx.close();
  }

  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); srv.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
