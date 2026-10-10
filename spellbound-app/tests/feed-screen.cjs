/* MY FEED — THE SCREEN (FAMILY-STANDARD §6a), in Chromium, over http.                       @check

   shell      checkShell(page, {phone, bee:true}) — the family's own measurement of Bee's chrome
              (tests/lib/family/shell-check.mjs, vendored byte for byte) — returns [] on Home,
              desktop and phone, light and dusk, with no allowance at all since 10 Oct 2026 (the road to
              4.5): five tabs for a child (Home · Word Atlas · Library · Play · My Feed) while analogies are
              gated, six in tester mode (… Word Atlas · Analogies · Library …), My Feed last, the Word Gym
              under Word Atlas, and Home's two journey cards at Bee's 547px
   screen     #/feed: the page head, about twenty cards each saying why, then the finished card
              last, pointing at Continue; no likes, views or streaks; no sound before a tap;
              nothing wider than a 390px phone; the My Feed tab is the lit one
   level      the feed is the child's region: nothing above the next one, and a child further
              along the road gets different "now" cards
   counts     every region's place card says the number its own board prints ("Stop n of N") and Home
              quotes (SB_TRAIL_NEXT().stops) — lap 1, and lap 2 re-cut by SB_FEED.lapCut (the 4.5 brief, P0.14)
   due        a word whose mastery record slipped, its gap over, is the FIRST card, and says so
   column     the page head, its subtitle and the cards start on one line, desktop and phone
   reload     a reload the same day is a new session with none of the cards just seen; what was paid
              stays paid; inside one visit the session holds; the reasons name the stop, the slip or
              the peek ("For <region>" on at most 3 of 20 — it was 16)
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
   so it holds on the minified deploy tree. Any free port (SB_FEED_PORT pins one): a fixed 5120
   meant two suites on one machine — another session's, a deploy's — collided, and the loser
   either crashed on EADDRINUSE or tested the OTHER tree's app through the winner's server.
   It waits on STATE, never on a sleep (lib/wait.cjs): the contrast pass measures with
   transitions off — body fades its colours over .35s, and the old 350ms pause read a world
   mid-fade on a loaded machine (audit v4, R5: race/light).
   Proved by breaking (2 Oct 2026), each put back: the tab drawn whatever the switch says → "leaves the
   tabs" and "survives a reload" fail; every body chunk fetched at the door → both "only the groups its
   session needs" fail (39 of 39); focus left where render() drops it → the three keyboard checks fail;
   the feed's text inks left at the world's muted/accent → contrast fails in anime, science and avatar.
   Run: node tests/feed-screen.cjs        (FEED_ROUTES=n opens only the first n routes; FEED_DEBUG=1) */
'use strict';
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const { serve } = require('./lib/serve.cjs');
const { booted, until, frames, still } = require('./lib/wait.cjs');
const SRC = process.env.SRC || path.resolve(__dirname, '..');
const PORT = +(process.env.SB_FEED_PORT || 0);
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };

const kidOf = (o) => Object.assign({ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 0, lists: { journey: { xp: 12 } }, activeList: 'journey',
  missed: [], unlockedThemes: ['spellbound'], trail: { lap: 1, done: { u1: { 1: 90 } }, chk: {}, seen: {}, st: {}, elap: 1, edone: {}, echk: {} } }, o || {});
const seedOf = (mode, kid) => ({ theme: 'spellbound', mode: mode || 'light', pin: '2468', activeIdx: 0, children: [kid || kidOf()] });

(async () => {
  const srv = await serve(SRC, { port: PORT });
  const BASE = `${srv.url}index.html`;
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p)) });
  const { checkShell } = await import(path.join(__dirname, 'lib', 'family', 'shell-check.mjs'));
  const errs = [];
  async function open(o) {
    o = o || {};
    const ctx = await b.newContext({ viewport: o.phone ? { width: 390, height: 844 } : { width: 1280, height: 800 }, isMobile: !!o.phone, hasTouch: !!(o.phone || o.touch),
      deviceScaleFactor: 1, colorScheme: o.dark ? 'dark' : 'light', serviceWorkers: 'block' });
    await ctx.addInitScript(([s, t]) => { try { if (!sessionStorage.getItem('t_seed')) { localStorage.clear(); localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_splash', '0'); if (t) localStorage.setItem('sb_tester', '1'); sessionStorage.setItem('t_seed', '1'); } } catch (e) {} }, [o.seed || seedOf(), !!o.tester]);
    /* count every sound: a clip, a speech utterance, or WebAudio starting */
    await ctx.addInitScript(() => { window.__snd = 0; const A = window.Audio; window.Audio = function () { window.__snd++; return new A(...arguments); };
      try { const sp = speechSynthesis.speak.bind(speechSynthesis); speechSynthesis.speak = u => { window.__snd++; return sp(u); }; } catch (e) {} });
    const pg = await ctx.newPage();
    pg.on('pageerror', e => errs.push(e.message.slice(0, 200)));
    await pg.goto(BASE + (o.q || '')); await ready(pg);
    return { ctx, pg };
  }
  /* booted, and the Atlas frontier in hand (trail-data.js, the idle queue's FIRST file): the
     feed's level IS the child's Atlas region, so a feed drawn before it lands is drawn for
     nobody in particular — the old 2.6s pause stood for exactly this */
  const ready = async pg => { await booted(pg); await until(pg, () => { try { return SB_SHELL.nextStep().ready; } catch (e) { return false; } }, null, 30000); };
  /* the feed is open when its finished card is drawn, its two stylesheets have arrived (bee-feed.js
     adds them at the door) and the list on screen is today's session */
  const openFeed = async pg => { await pg.evaluate(() => app.setNav('feed'));
    await until(pg, () => { const end = document.querySelector('.bzf-end'), css = [...document.querySelectorAll('link[data-feed-css]')];
      const ids = (active().feed || {}).ids || [];
      return !!end && css.length >= 2 && css.every(l => !!l.sheet) && ids.length > 0 && !!document.querySelector(`.bzf-card[data-id="${ids[0].id}"]`); }, null, 30000);
    await frames(pg, 2); };

  /* ---- shell: Bee's chrome, measured by the family's own check — and NOTHING allowed ----
     The road to 4.5 (owner, 10 Oct 2026, decisions §1.1 and P0.2): "checkShell(bee:true) must return [] on desk and
     phone, light and dusk" — six tabs with the Word Gym under Word Atlas, the journey card back to 547px, the second
     journey card restored. So the two allowances this block used to carry are gone: the 4 Oct "the REF still
     describes the old two-card row" (Home has its two cards again) and the 9 Oct "7 tabs (4–6)" for the Analogies
     tab (the bar holds six at most now). A child's bar is FIVE while the analogy content is gated (Analogies stands
     only in tester mode — tests/analogy-gate.cjs), and a tester's is the six; the family's 4–6 takes both, and both
     are measured, light and dusk.
     Proved by breaking (10 Oct 2026), each run recorded: homeSecondCard dropped from Home → all eight checkShell
     passes fail ("second journey card: missing" / "second missing on phone home"); the Word Gym tab back in NAV_TABS →
     the eight tab-order checks fail and the four tester desktop/phone shells say "7 tabs (4–6)" (10 fail). */
  for (const tester of [false, true]) for (const dark of [false, true]) for (const phone of [false, true]) {
    const { ctx, pg } = await open({ phone, dark, tester, seed: seedOf(dark ? 'dusk' : 'light') });
    await pg.evaluate(() => app.setNav('home'));
    await until(pg, () => state.nav === 'home' && !!document.querySelector('.sb-fam-bar') && !!document.querySelector('.sb-content .sb-home-second')); await frames(pg, 2);
    const tabs = await pg.evaluate(ph => [...document.querySelectorAll(ph ? 'nav.sb-tabbar button' : '.sb-topnav button')].map(x => x.getAttribute('data-arg')), phone);
    const f = await checkShell(pg, { phone, bee: true });
    const where = `${tester ? 'tester, ' : ''}${phone ? 'phone' : 'desktop'}, ${dark ? 'dusk' : 'light'}`;
    ok(!f.length, `checkShell on Home, ${where}: [] ${f.length ? JSON.stringify(f) : ''}`);
    const want = tester ? 'home,trail,analogy,explore,games,feed' : 'home,trail,explore,games,feed';
    ok(tabs.join() === want, `${where}: ${tester ? 'six' : 'five'} tabs, Home first, no Word Gym, My Feed last — ${tabs.join(' · ')}`);
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
      const L = e => e ? Math.round(e.getBoundingClientRect().left) : -1;
      const subEl = [...document.querySelectorAll('.sb-feedpage *')].find(e => e.children.length === 0 && /^Picked for you/.test(e.textContent.trim()));
      return { head: !!document.querySelector('.sb-feedpage .sb-phead h2'), n: cards.length,
        lx: { head: L(document.querySelector('.sb-feedpage .sb-phead')), sub: L(subEl), list: L(list), card: L(cards[0]) }, endLast: !!list && list.lastElementChild.classList.contains('bzf-end'),
        cont: (document.querySelector('.bzf-end a') || {}).getAttribute ? document.querySelector('.bzf-end a').getAttribute('href') : '',
        why: cards.filter(c => (c.querySelector('.bzf-why') || {}).textContent).length, text: page.textContent + ' ' + document.querySelector('.sb-header-sticky').textContent,
        snd: window.__snd, wide: document.documentElement.scrollWidth - innerWidth, nav: state.nav, hash: location.hash,
        lit: [...document.querySelectorAll('nav.sb-tabbar button[aria-current="page"]')].map(x => x.textContent.trim()) };
    });
    const where = phone ? 'phone' : 'desktop';
    ok(r.head && r.n >= 12 && r.n <= 20, `${where}: the page head and ${r.n} cards (about twenty)`);
    ok(r.endLast && r.cont === '#/continue', `${where}: the feed ends with the finished card, pointing at Continue (${r.cont})`);
    ok(r.why === r.n, `${where}: every card says why it is there`);
    /* ONE COLUMN (audit v4: at 1280 the head and subtitle began at x=248 and the cards at x=336) */
    ok(Math.abs(r.lx.head - r.lx.list) <= 1 && Math.abs(r.lx.sub - r.lx.list) <= 1 && Math.abs(r.lx.card - r.lx.list) <= 1,
      `${where}: the page head, its subtitle and the cards start on one line (${r.lx.head} / ${r.lx.sub} / ${r.lx.card})`);
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

  /* ---- counts: a place card says what its region's BOARD says (the 4.5 brief, P0.14/P0.15) ----
     For each of the nine regions a child is put at its first stop — on lap 1, and on lap 2 where the region
     has lap-2 stops (the Meadow and the Library do not) — and the board
     is opened: the "Stop n of N" its own stop card prints, SB_TRAIL_NEXT().stops (Home's "Stop n of N")
     and the place card's number must all be one number. The lap-1 card is the one the build cut (read from
     feed/ here, in node); a lap-2 child sees the card re-cut for their lap by SB_FEED.lapCut. Proved by
     breaking: build-feed's place card back on units.length → the check fails with all nine regions off on lap 1 (Meadow 13 on the board, 11 on the card; the Big Stage 2 and 15). */
  {
    const FD = path.join(SRC, 'feed'), body = {};
    fs.readdirSync(FD).filter(f => /^fb\d/.test(f)).forEach(f => { const t = fs.readFileSync(path.join(FD, f), 'utf8');
      const m = t.match(/"pl-[a-z]+":\{[^}]*\}/g) || []; m.forEach(x => { const o = JSON.parse('{' + x + '}'); Object.assign(body, o); }); });
    const { ctx, pg } = await open();
    const got = await pg.evaluate(async (cards) => {
      await new Promise(r => SB_LAZY.need(['atlas', 'feed'], r));
      const out = [];
      for (const lap of [1, 2]) for (const act of SB_TRAIL.honey.acts) {
        if (!SB_TRAIL_ROAD.count(SB_TRAIL, act.id, lap)) continue;   // the Meadow and the Library have no lap-2 stops: no board to open
        const c = active(); c.trail = { lap, done: {}, chk: {}, seen: {}, st: {}, elap: 1, edone: {}, echk: {}, ambV: {} };
        for (const n of SB_TRAIL_ROAD.nodes(SB_TRAIL, 'honey', lap)) { if (n.act === act.id) break;
          if (n.kind === 'unit') c.trail.done[n.u.id] = { [lap]: 90 }; else c.trail.chk[lap + ':' + n.id] = 90; }
        state.trailCourse = 'honey'; state.villain = null;
        const nx = SB_TRAIL_NEXT();
        app.trailAct('honey|' + act.id); render();
        const pop = (document.querySelector('.atlas-pop') || {}).textContent || '';
        const m = pop.match(/Stop \d+ of (\d+)/);
        const card = cards['pl-' + act.id];
        const shown = card && (lap === 1 ? card : SB_FEED.lapCut(Object.assign({ kind: 'place' }, card)));
        const n = shown && +(String(shown.body).match(/^(\d+) stops on this road/) || [])[1];
        out.push({ act: act.id, lap, board: m ? +m[1] : null, here: nx && nx.actId === act.id ? nx.stops : null, card: n || null });
      }
      return out;
    }, body);
    const off = got.filter(x => !(x.board && x.board === x.here && x.here === x.card));
    ok(got.filter(x => x.lap === 1).length === 9 && got.length >= 15 && !off.length, `every region's place card counts its road as the board does, lap 1 and the ${got.length - 9} regions with a lap 2 (board · Home · card): ` +
      got.filter(x => x.lap === 1).map(x => x.act + ' ' + x.board + '·' + x.here + '·' + x.card).join(' ') + (off.length ? ' — OFF: ' + JSON.stringify(off.slice(0, 4)) : ''));
    await ctx.close();
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
    const card = id => `.bzf-card[data-id="${id}"]`;
    await pg.focus(sel(1)); await pg.keyboard.press('Enter');
    await until(pg, c => { const e = document.querySelector(c); return !!e && !!e.querySelector('[data-bzf="cont"]'); }, card(id), 10000);
    const held = await pg.evaluate(id => { const c = document.querySelector(`.bzf-card[data-id="${id}"]`); return { text: c.innerText, cont: !!c.querySelector('[data-bzf="cont"]'), coins: active().coins || 0,
      focus: !!document.activeElement.closest(`.bzf-card[data-id="${id}"]`) }; }, id);
    ok(/Not this time — it is “/.test(held.text) && held.cont, 'keyboard: a wrong answer holds — "Not this time — it is …" and a Continue');
    ok(held.coins === c0, 'a wrong answer pays nothing');
    ok(held.focus, 'focus stays on the card, so the keyboard can carry on');
    const onCont = await pg.evaluate(() => document.activeElement.getAttribute('data-bzf'));
    ok(onCont === 'cont', 'after a wrong answer, focus sits on Continue (' + onCont + ')');
    await pg.keyboard.press('Enter');
    await until(pg, c => { const e = document.querySelector(c); return !!e && !e.querySelector('[data-bzf="cont"]'); }, card(id), 10000);
    const after = await pg.evaluate(id => { const c = document.querySelector(`.bzf-card[data-id="${id}"]`); return { cont: !!c.querySelector('[data-bzf="cont"]'), dis: [...c.querySelectorAll('[data-bzf="ans"]')].every(x => x.disabled) }; }, id);
    ok(!after.cont && after.dis, 'Continue moves on; the question stays answered');
    const id2 = qs[1];
    await pg.tap(`.bzf-card[data-id="${id2}"] [data-bzf="ans"][data-o="0"]`);
    await until(pg, c => { const e = document.querySelector(c); return !!e && /^Right\./m.test(e.innerText); }, card(id2), 10000);
    const r = await pg.evaluate(id => ({ coins: active().coins || 0, text: document.querySelector(`.bzf-card[data-id="${id}"]`).innerText, ledger: BZ_WALLET.ledger(active().name).filter(x => x.n > 0).length }), id2);
    ok(r.coins === c0 + 1 && /^Right\./m.test(r.text), `touch: a right answer pays exactly one coin (${c0} → ${r.coins})`);
    await pg.evaluate(() => { app.setNav('home'); SB_FEED.reset(); }); await until(pg, () => state.nav === 'home'); await openFeed(pg);
    const again = await pg.evaluate(id => { const x = document.querySelector(`.bzf-card[data-id="${id}"] [data-bzf="ans"][data-o="0"]`); if (x) x.click(); return !!x; }, id2);
    if (again) await until(pg, c => { const e = document.querySelector(c); return !!e && /^Right\./m.test(e.innerText); }, card(id2), 10000);
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
    if (hear) { await until(pg, s0 => window.__snd > s0, s0, 15000); ok((await pg.evaluate(() => window.__snd)) > s0, 'a word card\'s Hear it plays the word on a tap'); }
    await ctx.close();
  }

  /* ---- reload: a new visit is a new session, and what was paid stays paid (audit v4, V4 + V5) ---- */
  {
    const { ctx, pg } = await open({ touch: true });
    await openFeed(pg);
    const one = await pg.evaluate(() => { const coins = active().coins || 0, q = [...document.querySelectorAll('.bzf-card')].find(c => c.querySelector('[data-bzf="ans"]'));
      const id = q && q.getAttribute('data-id'); if (id) q.querySelector('[data-bzf="ans"][data-o="0"]').click();
      return { id, coins, ids: active().feed.ids.map(x => x.id), whys: active().feed.ids.map(x => x.why) }; });
    await until(pg, c0 => (active().coins || 0) > c0, one.coins, 10000);
    const c1 = await pg.evaluate(() => active().coins || 0);
    ok(one.id && c1 === one.coins + 1, `a right answer pays (${one.coins} → ${c1})`);
    const fallback = one.whys.filter(w => /^For the /.test(w)).length;
    ok(fallback <= 3, `the reasons name the stop, the slip or the peek — "For <region>" on ${fallback} of ${one.whys.length} (was 16 of 20)`);
    ok(new Set(one.whys).size >= 8, `${new Set(one.whys).size} different reasons in one session`);
    await pg.reload(); await ready(pg); await openFeed(pg);
    const two = await pg.evaluate(() => ({ ids: active().feed.ids.map(x => x.id), paid: active().feed.paid }));
    const rep = two.ids.filter(id => one.ids.includes(id)).length;
    ok(two.ids.length >= 12 && rep === 0, `a reload the same day brings ${two.ids.length} cards, ${rep} of them seen before (was 21 of 21)`);
    ok(!!two.paid[one.id], 'what was paid before the reload is still on the record');
    const again = await pg.evaluate(id => new Promise(res => { const M = SB_FEED_META, g = Object.values(SB_FEED_IDX).flat().find(r => r[0] === id)[6];
      SB_LAZY.reg['feedB' + g] = 'feed/' + M.body[g]; SB_LAZY.need('feedB' + g, () => { const c0 = active().coins || 0; SB_FEED.reset(); SB_FEED.answer(id, 0); res([c0, active().coins || 0]); }); }), one.id);
    ok(again[0] === again[1], `answering it right again after the reload pays nothing (${again[0]} → ${again[1]})`);
    await pg.evaluate(() => app.setNav('home')); await until(pg, () => state.nav === 'home'); await openFeed(pg);
    const three = await pg.evaluate(() => active().feed.ids.map(x => x.id));
    ok(three.join() === two.ids.join(), 'and inside one visit the session holds: leave #/feed and come back, the same cards');
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
    await pg.evaluate(() => new Promise(r => SB_LAZY.need('words', r)));
    const lost = await pg.evaluate(ws => ws.filter(r => { const w = r.slice(7), db = wordDB(); return !(db.get && db.get(nkey(w))); }), words);
    ok(!lost.length, `all ${words.length} word routes name a word the library holds` + (lost.length ? ' — ' + lost.slice(0, 5).join(' ') : ''));
    const todo = routes.filter((r, i) => !/^#\/word\//.test(r) || words.indexOf(r) % 25 === 0).slice(0, +(process.env.FEED_ROUTES || 1e9));
    for (const r of todo) {
      const res = await pg.evaluate(async r => {
        const W = ms => new Promise(ok => setTimeout(ok, ms));
        /* polled until the screen is up, for as long as a loaded machine needs (was a 3s cap) */
        location.hash = r; await W(40);
        for (const t0 = Date.now(); Date.now() - t0 < 20000;) {
          const S = state, p = r.slice(2).split('/');
          const good = p[0] === 'word' ? S.nav === 'finder' && S.finderSel && S.finderSel.w === p[1]
            : p[0] === 'stop' ? S.nav === 'trail' && S.trailUnit === p[1]
            : p[0] === 'atlas' ? S.nav === 'trail' && S.trailAct === p[2]
            : p[0] === 'play' ? S.nav === 'games' : p[0] === 'trivia' ? S.nav === 'lore' /* 4 Oct 2026: Bee Trivia split; its word stories are Word Lore's Roots (games spec §4.3) */ : p[0] === 'figurative' ? S.nav === 'figurative'
            : p[0] === 'hive' ? S.nav === 'collection' : p[0] === 'analogies' ? S.nav === 'analogy' : false;
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
    /* resolved like tests/a11y-axe.cjs: from the installed packages first — a deploy tree (SRC under
       --root) carries no node_modules, and the deploy's browser check runs this test against it */
    const AXE = (() => { try { return require.resolve('axe-core/axe.min.js'); } catch (e) {}
      return [path.join(SRC, 'node_modules', 'axe-core', 'axe.min.js'), path.join(__dirname, '..', 'node_modules', 'axe-core', 'axe.min.js')].find(p => fs.existsSync(p)); })();
    const { ctx, pg } = await open();
    await openFeed(pg);
    await pg.addScriptTag({ path: AXE });
    await still(pg);   // transitions off: a colour is read at its final value, never mid-fade
    const worlds = await pg.evaluate(() => THEMES.map(t => t.id));
    const viol = [];
    for (const wld of worlds) for (const mode of ['light', 'white', 'dusk']) {
      const v = await pg.evaluate(async ([wld, mode]) => {
        state.devUnlock = true; state.theme = wld; app.setModePref(mode); app.setNav('feed'); render();
        /* drawn in this world and look: the root says so and two frames have painted it */
        for (const t0 = Date.now(); Date.now() - t0 < 10000;) { if (document.documentElement.getAttribute('data-theme') === wld && document.querySelector('.sb-feedpage .bzf-end')) break; await new Promise(r => setTimeout(r, 30)); }
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
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
    await pg.evaluate(() => app.setNav('settings'));
    await until(pg, () => !!document.querySelector('#sb-set-ov'));      // the sheet is drawn: now its absence of the switch means something
    const before = await pg.evaluate(() => !!document.querySelector('#sb-set-ov [data-act="toggleFeed"]'));
    ok(!before, 'the switch is not on the child\'s side of Settings — it waits behind the PIN');
    await pg.evaluate(() => app.setGrownOpen());
    await until(pg, () => !!state.pinDlg);
    await pg.evaluate(() => { for (const k of '2468') app.pinKey(k); });
    await until(pg, () => !!document.querySelector('#sb-set-ov [data-act="toggleFeed"]'));
    await pg.evaluate(() => { const x = document.querySelector('#sb-set-ov [data-act="toggleFeed"]'); if (x) x.click(); });
    await until(pg, () => state.feedOff === true, null, 10000);   // the switch has been thrown
    await pg.evaluate(() => { app.closeSettings(); app.setNav('home'); });
    await until(pg, () => state.nav === 'home' && !state.settingsOpen);
    const gone = async () => {
      await pg.evaluate(() => app.openDrawer());
      await until(pg, () => !!document.querySelector('.bz-drawer button, .bz-drawer a'));
      const o = await pg.evaluate(() => ({ tabs: [...document.querySelectorAll('.sb-topnav button, nav.sb-tabbar button')].map(x => x.textContent.trim()),
        drawer: [...document.querySelectorAll('.bz-drawer button, .bz-drawer a')].map(x => x.textContent.replace(/\s+/g, ' ').trim()) }));
      await pg.evaluate(() => { app.closeDrawer && app.closeDrawer(); state.drawerOpen = false; location.hash = '#/feed'; });
      await until(pg, () => state.nav === 'feed' && !!document.querySelector('.sb-feedpage'));
      await frames(pg, 2);
      return Object.assign(o, await pg.evaluate(() => ({ cards: document.querySelectorAll('.bzf-card').length, text: (document.querySelector('.sb-content') || {}).innerText || '' }))); };
    let g = await gone();
    ok(!g.tabs.some(t => /My Feed/.test(t)) && !g.drawer.some(t => /^My Feed/.test(t)), 'switched off, My Feed leaves the tabs and the ☰ drawer');
    ok(g.cards === 0 && /switched off/.test(g.text), '#/feed says it is switched off and shows no cards');
    await pg.reload(); await ready(pg); g = await gone();
    ok(!g.tabs.some(t => /My Feed/.test(t)) && g.cards === 0, 'the choice survives a reload');
    await ctx.close();
  }

  /* ---- demo: a sample feed that writes nothing ---- */
  {
    const { ctx, pg } = await open({ touch: true });
    /* the browser's REAL storage (the demo sandbox wraps localStorage inside the page, so the page cannot be asked) */
    const dump = async () => { const st = await ctx.storageState(); const o = {}; st.origins.forEach(x => x.localStorage.forEach(kv => { o[x.origin + ' ' + kv.name] = kv.value; })); return o; };
    /* stop the ordinary page first: since the hello waits for the Atlas (audit v4 B5) it notes the
       greeting and Home's pictures a moment after boot, and those device writes belong to it — the
       snapshot must hold only what the DEMO page could change */
    await pg.goto('about:blank');
    const before = await dump();
    await pg.goto(BASE + '?demo'); await ready(pg); await openFeed(pg);
    const n = await pg.evaluate(() => document.querySelectorAll('.bzf-card:not(.bzf-end)').length);
    const qid = await pg.evaluate(() => { const x = document.querySelector('[data-bzf="ans"][data-o="0"]'); if (!x) return null; x.click(); return x.closest('.bzf-card').getAttribute('data-id'); });
    /* answered — the card says so — before the storage is read, so a write it made would be there to see */
    if (qid) await until(pg, id => { const c = document.querySelector(`.bzf-card[data-id="${id}"]`); return !!c && /^Right\./m.test(c.innerText); }, qid, 10000);
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
