// Phone layout. Every one of these was a real defect found at 390px:
//   · the Daily Buzz call to action was sliced off the right edge of its card
//   · the same coin count sat on screen twice, 110px apart
//   · the floating bug tab was pinned at 58% viewport height, on top of
//     whatever card the child was reading
//   · the arcade hero's CTA broke across two lines mid-phrase
// The shared cause is decorative art reserving a fixed slice of width at every
// screen size. On a phone the art gives way; the words never do.
const { chromium } = require('playwright');
const { booted, until, frames } = require('./lib/wait.cjs');
const { serve } = require('./lib/serve.cjs');
const SRC = process.env.SRC || __dirname + '/..';
let fails = 0;
const ok = (b, msg) => { console.log((b ? '  OK   ' : '  FAIL ') + msg); if (!b) fails++; };

const CHILD = { name: 'Ravi', avatar: 'bee', coins: 240, pow: {}, age: 11,
  lists: { default: { xp: 60 } }, activeList: 'default', missed: [], unlockedThemes: [],
  unlockedConcepts: {}, unlockedLists: {}, questPath: 'journey' };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => require('fs').existsSync(p)) });
  for (const W of [360, 390]) {
    const pg = await b.newPage({ viewport: { width: W, height: 844 }, isMobile: true, hasTouch: true });
    const errs = []; pg.on('pageerror', e => errs.push(String(e.message)));
    await pg.goto('file://' + SRC + '/index.html');
    await pg.waitForTimeout(2600);
    await pg.evaluate(async c => {
      localStorage.setItem('sb_splash', '0');
      localStorage.setItem('sb_daily', JSON.stringify({ day: 'x', streak: 7 }));
      state.children = [c]; state.activeIdx = 0; state.screen = 'app';
      app.setNav('games'); await new Promise(r => setTimeout(r, 1500));
    }, CHILD);

    // ---- every Play card: nothing may cross its own edge ----
    /* REWRITTEN 4 Oct 2026 (games spec §3.1): the Daily Buzz banner left the Play tab — Daily Bee is a
       card in the Train door now — so the rule that sliced its call to action is held for EVERY card */
    const daily = await pg.evaluate(() => {
      const cards = [...document.querySelectorAll('.pl-card')]; if (!cards.length || !document.querySelector('.pl-card[data-card="dailyBee"]')) return null;
      let worst = 0, who = '', w = 0;
      for (const card of cards) { const br = card.getBoundingClientRect(); w = Math.max(w, Math.round(br.width));
        for (const el of card.querySelectorAll('*')) {
          // the mascot is decorative and deliberately bleeds off the corner
          if (el.closest('[aria-hidden="true"]') || el.closest('.arc-hero-art')) continue;
          const r = el.getBoundingClientRect();
          if (!r.width) continue;
          const over = r.right - br.right;
          if (over > worst) { worst = over; who = card.dataset.card + ': ' + (el.textContent || '').trim().slice(0, 22); } } }
      return { over: Math.round(worst), who, w };
    });
    ok(daily, W + 'px: the Daily Bee card is on the Play screen');
    ok(daily && daily.over <= 1,
      W + 'px: nothing in a Play card crosses the card edge' + (daily && daily.over > 1 ? ' — "' + daily.who + '" over by ' + daily.over + 'px' : ''));

    // ---- the arcade hero: its CTA reads as one phrase ----
    const hero = await pg.evaluate(() => {
      const go = [...document.querySelectorAll('.arc-hero-cta')].map(c => {
        const btn = c.firstElementChild; if (!btn) return null;
        // a button's own box includes padding, so measure the TEXT's line boxes
        const rng = document.createRange(); rng.selectNodeContents(btn);
        const lines = new Set([...rng.getClientRects()].filter(r => r.height > 1)
          .map(r => Math.round(r.top))).size;
        return { lines, txt: (btn.textContent || '').trim().slice(0, 20) };
      }).filter(Boolean);
      return go;
    });
    ok(hero.length > 0, W + 'px: the arcade heroes are on screen');
    ok(hero.every(h => h.lines <= 1), W + 'px: no hero CTA breaks across lines ('
      + hero.map(h => h.txt + '=' + h.lines).join(', ') + ')');

    // ---- one coin count, not two ----
    const coins = await pg.evaluate(async () => {
      const count = () => [...document.querySelectorAll('*')].filter(e => {
        if (e.children.length > 1) return false;
        if (!/^\s*240\s*$/.test(e.textContent || '')) return false;
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      }).length;
      const out = { games: count() };
      app.setNav('collection'); await new Promise(r => setTimeout(r, 1200));
      out.hive = count();
      return out;
    });
    ok(coins.games <= 1, W + 'px: Play shows the coin count once (' + coins.games + ')');
    ok(coins.hive <= 1, W + 'px: My Hive shows it once too (' + coins.hive + ')');

    // ---- the bug tab keeps out of the reading band ----
    /* FIX-BEE v2: the bug tab exists only in testing mode — a child never sees it (trust-v2) — so
       switch testing on to measure where it sits for the grown-up who uses it. */
    const bug = await pg.evaluate(async () => { state.devUnlock = true; render(); await new Promise(r => setTimeout(r, 200));
      const t = document.querySelector('.sb-bug-tab');
      if (!t) return null;
      const r = t.getBoundingClientRect();
      const bar = document.querySelector('.sb-tabbar');
      const barTop = bar ? bar.getBoundingClientRect().top : innerHeight;
      // does it sit over any card in the middle of the screen?
      return { top: Math.round(r.top), bottom: Math.round(r.bottom), barTop: Math.round(barTop),
        band: Math.round(r.top / innerHeight * 100) };
    });
    ok(bug, W + 'px: the bug tab is present');
    ok(bug && bug.bottom <= bug.barTop + 1,
      W + 'px: it sits above the tab bar, not across the page (bottom ' + (bug && bug.bottom) + ' vs bar ' + (bug && bug.barTop) + ')');
    ok(bug && bug.band >= 75, W + 'px: and it rides the bottom strip, out of the reading band (starts at '
      + (bug && bug.band) + '% of the screen, was 58%)');

    // ---- and no screen scrolls sideways ----
    const wide = await pg.evaluate(async () => {
      const out = {};
      /* vocab: its card's four buttons made #/vocab 391px wide on a 390px phone (audit v4 §4), and the
         v5 audit measured 391 again (P0.25) — so the card is read turned over and on its Practise and
         Check tabs too, not only as it opens */
      for (const nav of ['home', 'games', 'trail', 'coach', 'explore', 'collection', 'vocab']) {
        app.setNav(nav); await new Promise(r => setTimeout(r, 900));
        out[nav] = document.documentElement.scrollWidth;
      }
      const U = async (fn, ms) => { const t0 = performance.now(); while (!fn() && performance.now() - t0 < (ms || 10000)) await new Promise(r => requestAnimationFrame(r));
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); };
      for (const [k, go, done] of [['vocab turned over', () => app.vocFlip(), () => state.vocFlip], ['vocab practise', () => app.vocSetTab('practice'), () => state.vocTab === 'practice'],
        ['vocab check', () => app.vocSetTab('check'), () => state.vocTab === 'check']]) {
        try { go(); } catch (e) {} await U(done); out[k] = document.documentElement.scrollWidth; }
      out.vw = innerWidth;
      return out;
    });
    /* against the width ASKED FOR, not innerWidth: an isMobile page that overflows widens its own
       layout viewport to fit (innerWidth read 391 on a 390 phone), so v > innerWidth never fired.
       And with NO pixel of slack (P0.25): `v > W + 1` let a 391px #/vocab through on a 390px phone,
       which is exactly the one-pixel sideways scroll the v5 audit found and this guard missed. */
    const sideways = Object.entries(wide).filter(([k, v]) => k !== 'vw' && v > W);
    ok(sideways.length === 0, W + 'px: no screen scrolls sideways'
      + (sideways.length ? ' — ' + sideways.map(([k, v]) => k + '=' + v).join(', ') : ''));
    ok(errs.length === 0, W + 'px: no page errors' + (errs.length ? ': ' + errs[0] : ''));
    await pg.close();
  }

  /* ================= P0.17 (10 Oct 2026): five screens the v5 audit found broken on a phone =================
     Each was a real screenshot at 390×844, each is measured here at 390 and 360, and each was watched to
     fail with its fault put back (see the commit). Every wait is on state (tests/lib/wait.cjs), never a sleep. */
  const KID5 = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 40, xp: 40, level: 3,
    lists: { default: { xp: 30 } }, activeList: 'default', missed: [], unlockedThemes: ['spellbound'], questPath: 'journey' };
  const open5 = async (W, url) => {
    const ctx = await b.newContext({ viewport: { width: W, height: 844 }, isMobile: true, hasTouch: true });
    await ctx.addInitScript(k => { try { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [k] }));
      localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } } catch (e) {} }, KID5);
    const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(String(e.message)));
    await pg.goto(url || 'file://' + SRC + '/index.html'); await booted(pg);
    await pg.evaluate(() => { state.screen = 'app'; app.setNav('home'); });
    return { ctx, pg, errs };
  };
  /* boxes on one screen row that must not sit on each other (a 1px kiss is allowed) */
  const OVERLAP = `(rs) => { const out = []; for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) { const a = rs[i].r, c = rs[j].r;
    if (Math.min(a.right, c.right) - Math.max(a.left, c.left) > 1 && Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top) > 1) out.push(rs[i].k + ' on ' + rs[j].k); } return out; }`;
  const p17 = [];
  for (const W of [390, 360]) {
    const { ctx, pg, errs } = await open5(W);

    /* 1. A HUB'S MODE TILES SHOW THEIR WORDS. Word Lore's seven tiles were each held to a quarter of the
          play area and its promise was cut to a 5px sliver under the level chip. Every tile of every hub:
          the art, the name, the promise and the chip row inside the tile and not on each other, and the
          promise showing all of itself (or its two clamped lines). */
    for (const [hub, go] of [['Word Lore', () => app.openLore()], ['Hive Mind', () => app.openHive()], ['Spelling Gym', () => app.openGym()]]) {
      await pg.evaluate(`(${go.toString()})()`);
      const drawn = await until(pg, () => document.querySelectorAll('.sb-stage .sg-hub-tile').length >= 3, null, 30000); await frames(pg, 3);
      const bad = await pg.evaluate(`(() => { const overlap = ${OVERLAP}; const out = [];
        const vis = e => e && e.getClientRects().length && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden';
        document.querySelectorAll('.sb-stage .sg-hub-tile').forEach(t => { const T = t.getBoundingClientRect(), name = (t.querySelector('.sg-hub-name') || {}).textContent || '?';
          const parts = [['art', '.sg-hub-art'], ['name', '.sg-hub-name'], ['promise', '.sg-hub-promise'], ['chips', '.sg-hub-meta']]
            .map(([k, s]) => ({ k, e: t.querySelector(s) })).filter(x => vis(x.e)).map(x => ({ k: x.k, e: x.e, r: x.e.getBoundingClientRect() }));
          parts.forEach(p => { const r = p.r; if (r.top < T.top - 1 || r.bottom > T.bottom + 1 || r.left < T.left - 1 || r.right > T.right + 1) out.push(name + ': its ' + p.k + ' is cut by the tile'); });
          overlap(parts).forEach(x => out.push(name + ': ' + x));
          const pr = t.querySelector('.sg-hub-promise'); if (vis(pr)) { const lh = parseFloat(getComputedStyle(pr).lineHeight) || 16;
            if (pr.clientHeight + 1 < Math.min(pr.scrollHeight, 2 * lh)) out.push(name + ': its promise shows ' + pr.clientHeight + 'px of ' + pr.scrollHeight); } });
        return out; })()`);
      if (!drawn) p17.push(W + 'px ' + hub + ': the hub never drew');
      bad.forEach(x => p17.push(W + 'px ' + hub + ': ' + x));
    }

    /* 2. A GYM MODE'S NAME IS NEVER CUT. "Spot the Error" ellipsised to "Spot the Er…" between Back and its
          mirrored spacer, with Back hard against the left stat. Every mode: the title whole, and the left
          stat, Back, the title and the right stat each clear of the others and on screen. */
    const modes = await pg.evaluate(() => Object.entries((window.SB_HUB_MODES || {}).gym || {}));
    for (const [id, title] of modes) {
      await pg.evaluate(m => app.openGym(m), id);
      const at = await until(pg, t => { const h = document.querySelector('.sb-stage .gym-title'); return !!h && h.textContent.trim() === t; }, title, 30000); await frames(pg, 3);
      const r = await pg.evaluate(`(() => { const overlap = ${OVERLAP}; const out = [];
        const h = document.querySelector('.sb-stage .gym-title'); if (!h) return ['no title'];
        if (h.scrollWidth > h.clientWidth + 1 || h.scrollHeight > h.clientHeight + 1) out.push('"' + h.textContent.trim() + '" is cut (' + h.scrollWidth + '/' + h.clientWidth + ')');
        const hud = h.closest('.sg-st-hud') || document;
        const boxes = [['left stat', '.sg-st-side.l .sg-st-stat'], ['Back', '.gym-back'], ['title', '.gym-title'], ['right stat', '.sg-st-side.r .sg-st-stat']]
          .map(([k, s]) => ({ k, e: hud.querySelector(s) })).filter(x => x.e && x.e.getClientRects().length).map(x => ({ k: x.k, r: x.e.getBoundingClientRect() }));
        boxes.forEach(x => { if (x.r.left < -0.5 || x.r.right > innerWidth + 0.5) out.push(x.k + ' runs off the screen'); });
        return out.concat(overlap(boxes)); })()`);
      if (!at) p17.push(W + 'px gym ' + id + ': "' + title + '" never drew');
      r.forEach(x => p17.push(W + 'px gym ' + title + ': ' + x));
    }

    /* 3. AN ANALOGY OPTION STAYS IN ITS BUTTON. "establishment" ran out of its half-width button in Against
          the Clock. The clock is started for real, then its question is given the four LONGEST one-word
          options the analogy data holds, and each word must sit inside its own button. (Tester mode is on
          so the clock opens whether or not the tab is behind its review gate.) */
    await pg.evaluate(() => { state.devUnlock = true; location.hash = '#/analogies/clock'; });
    await until(pg, () => !!document.querySelector('[data-act="anl"][data-arg="clockgo"]'), null, 30000);
    await pg.evaluate(() => document.querySelector('[data-act="anl"][data-arg="clockgo"]').click());
    const clock = await until(pg, () => document.querySelectorAll('.anl-opt').length >= 3, null, 30000);
    const anl = await pg.evaluate(async () => {
      const fits = () => [...document.querySelectorAll('.anl-opt')].filter(o => { const r = o.getBoundingClientRect(); const rg = document.createRange(); rg.selectNodeContents(o); const t = rg.getBoundingClientRect();
        return o.scrollWidth > o.clientWidth + 1 || t.right > r.right + 0.5 || t.left < r.left - 0.5; }).map(o => o.textContent.trim().slice(1));
      const drawn = fits();
      const words = new Set(); const A = window.SB_ANALOGY || {}; const walk = x => { if (typeof x === 'string') { const w = x.split('|')[0]; if (/^[a-z]+$/.test(w)) words.add(w); } else if (Array.isArray(x)) x.forEach(walk); };
      Object.values(A.items || {}).forEach(walk);
      const longest = [...words].sort((a, b) => b.length - a.length || (a < b ? -1 : 1)).slice(0, 4);
      const g = state.anl && state.anl.run; if (!g || !g.q) return { drawn, longest, none: true };
      g.q = Object.assign({}, g.q, { opts: longest }); render();
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      return { drawn, longest, long: fits(), n: document.querySelectorAll('.anl-opt').length };
    });
    if (!clock || anl.none) p17.push(W + 'px analogy clock: no question drew');
    if (anl.drawn.length) p17.push(W + 'px analogy clock: ' + anl.drawn.join(', ') + ' run out of their buttons');
    if (anl.long && anl.long.length) p17.push(W + 'px analogy clock, the longest words (' + anl.longest.join(', ') + '): ' + anl.long.join(', ') + ' run out of their buttons');
    await pg.evaluate(() => { state.devUnlock = false; if (state.anl) state.anl.run = null; location.hash = '#/home'; });
    await until(pg, () => state.nav === 'home', null, 15000);

    /* 4. A DRILL OPENS AT ITS TOP. Started from low on a page, the practice drill opened with its progress
          bar already above the phone's edge: the window kept the old page's scroll. Three real doors, each
          tapped after scrolling down to it: "Practise these words" at the foot of a concept chapter, the Word
          Gym's Champ Challenge button and a list in its dock. What each opens must show its top under the top
          bar. (An Atlas stop's "Train these words" is a door too, but a region page scrolls only ~80px at 844
          tall — not enough to prove anything — so the long chapter page stands for it.) */
    const inView = `(sel) => { const e = typeof sel === 'string' ? document.querySelector(sel) : sel(); if (!e) return 'not drawn';
      const r = e.getBoundingClientRect(), hd = document.querySelector('.sb-header-sticky'), tb = document.querySelector('nav.sb-tabbar');
      const top = hd ? hd.getBoundingClientRect().bottom : 0, bot = tb && tb.getClientRects().length ? tb.getBoundingClientRect().top : innerHeight;
      return r.top >= top - 1 && r.bottom <= bot + 1 ? '' : Math.round(r.top) + '–' + Math.round(r.bottom) + ' in a window ' + Math.round(top) + '–' + Math.round(bot) + ' (scrolled ' + Math.round(scrollY) + ')'; }`;
    await pg.evaluate(() => new Promise(r => SB_LAZY.need('concepts', r)));
    await pg.evaluate(() => { try { loadConcepts(); } catch (e) {} });
    await until(pg, () => (state.conceptData || []).length > 0, null, 30000);
    await pg.evaluate(() => { const D = state.conceptData; let i = D.findIndex((ch, k) => isConceptUnlocked(k) && (ch.words || []).some(x => x && x.w)); app.openConcept(Math.max(0, i)); });
    await until(pg, () => !!document.querySelector('[data-act="practiseConcept"]'), null, 20000); await frames(pg, 2);
    /* read the chapter to its foot, the way a child does, then tap Practise there */
    const scrolled = await pg.evaluate(() => { document.querySelector('[data-act="practiseConcept"]').scrollIntoView({ block: 'end' }); return Math.round(scrollY); });
    await pg.evaluate(() => document.querySelector('[data-act="practiseConcept"]').click());
    const trained = await until(pg, () => state.nav === 'train' && !!document.querySelector('.sb-train-bar'), null, 30000); await frames(pg, 2);
    const t1 = await pg.evaluate(`(${inView})('.sb-train-bar')`);
    if (!trained) p17.push(W + 'px: "Practise these words" never opened the drill');
    else if (scrolled < 100) p17.push(W + 'px: the chapter page scrolled only ' + scrolled + 'px before Practise, so the drill check proves nothing');
    else if (t1) p17.push(W + 'px: the practice drill opened with its progress bar out of view — ' + t1);
    for (const [door, sel, arrived, top] of [['the Champ Challenge', '[data-act="openChallenge"]', () => state.coachMode === 'challenge', '[data-act="chExit"], [data-act="chStart"]'],
      ['a list in the dock', '[data-act="selectList"][data-arg="journey"]', () => state.coachMode === 'hub', () => [...document.querySelectorAll('#root span')].find(e => /^Card \d+ of \d+$/.test(e.textContent.trim()))]]) {
      await pg.evaluate(() => { state.coachMode = null; app.setNav('coach'); });
      const there = await until(pg, s => !!document.querySelector(s), sel, 20000); await frames(pg, 2);
      const sy = await pg.evaluate(s => { document.querySelector(s).scrollIntoView({ block: 'center' }); return Math.round(scrollY); }, sel);
      await pg.evaluate(s => document.querySelector(s).click(), sel);
      const ok2 = await until(pg, arrived, null, 15000); await frames(pg, 2);
      const t2 = await pg.evaluate(`(${inView})(${typeof top === 'string' ? JSON.stringify(top) : top.toString()})`);
      if (!there || !ok2) p17.push(W + 'px: ' + door + ' did not open');
      else if (sy < 100) p17.push(W + 'px: the Word Gym page was not scrolled to ' + door + ' (' + sy + 'px), so the check proves nothing');
      else if (t2) p17.push(W + 'px: ' + door + ' opened with its top out of view — ' + t2);
    }
    if (errs.length) p17.push(W + 'px: page errors — ' + errs.slice(0, 2).join(' | '));
    await ctx.close();
  }

  /* 5. THE JUNKYARD'S STOP CARD STAYS ON THE PHONE when its painting arrives late ("390px Junkyard stop card
        162–485"). A panorama is as wide as its painting; the card was fitted to the sliver of board drawn
        before the painting loaded, and the camera, already at 0, never moved again to refit it. Served over
        http so the painting can be held back the way a slow phone network holds it. */
  {
    const srv = await serve(SRC);
    for (const W of [390, 360]) {
      const { ctx, pg, errs } = await open5(W, srv.url + 'index.html');
      await pg.route(/map-junkyard-pano\.jpg/, async r => { await new Promise(res => setTimeout(res, 1500)); await r.continue(); });
      await pg.evaluate(() => new Promise(r => SB_LAZY.need('atlas', r)));
      await pg.evaluate(() => { state.devUnlock = true; try { active().trail = active().trail || {}; active().trail.ambV = { junkyard: 1 }; } catch (e) {} app.trailToMap(); app.trailAct('honey|junkyard'); });
      await until(pg, () => !!document.querySelector('.atlas-stop'), null, 30000);
      await pg.evaluate(() => app.trailPick(+document.querySelector('.atlas-stop').dataset.arg));
      const landed = await until(pg, () => { const i = document.querySelector('#sb-pan img'); return !!i && i.complete && i.naturalWidth > 0 && !!document.querySelector('.atlas-pop'); }, null, 30000);
      await frames(pg, 4);
      const card = await pg.evaluate(() => { const p = document.querySelector('.atlas-pop'), pan = document.getElementById('sb-pan'); if (!p || !pan) return 'no card';
        const pr = p.getBoundingClientRect(), wr = pan.getBoundingClientRect(), L = Math.max(0, wr.left), R = Math.min(innerWidth, wr.right);
        return pr.left >= L - 1 && pr.right <= R + 1 ? '' : 'card ' + Math.round(pr.left) + '–' + Math.round(pr.right) + ' in a window ' + Math.round(L) + '–' + Math.round(R); });
      if (!landed) p17.push(W + 'px Junkyard: the painting never landed');
      else if (card) p17.push(W + 'px Junkyard, painting held back 1.5s: ' + card);
      if (errs.length) p17.push(W + 'px Junkyard: page errors — ' + errs.slice(0, 2).join(' | '));
      await ctx.close();
    }
    srv.close();
  }
  ok(!p17.length, 'P0.17 at 390 and 360: hub tiles show their words, gym titles are whole and clear, analogy words stay in their buttons, a drill opens at its top, and the Junkyard card fits once its painting lands'
    + (p17.length ? ' — ' + p17.length + ': ' + p17.slice(0, 40).join(' | ') : ''));
  await b.close();
  console.log(fails ? '\n' + fails + ' FAILED' : '\nall good');
  process.exit(fails ? 1 : 0);
})();
