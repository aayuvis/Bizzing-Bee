/* DAILY BEE (games spec §5.2, 4 Oct 2026) — one word a day, spoken, never shown, found in six tries
   with a SHAPE on every letter, and it always ends with the word. In for Daily Buzz, on #/daily.

   What this holds:
     DB1  the same date and band give the same word — the pure pick, twice, and the GAME's word in two
          fresh pages; different bands give different words.
     DB2  the stage passes T14 and T15 in dark mode (and light), at 1280×800 and 390×844:
          T14  no flat-colour region over 6% of the stage; no pure white or black over 2%;
          T15  HUD stats of one width, gutters and the centre line within 4px, no vertical scroll
               during play, no control under the tab bar, letter keys ≥ 40px tall on a phone.
          g-engine's own T14/T15 helpers are used when tests/lib has them (guarded); else the
          measurements here, which read the screenshot's pixels in the page.
     DB3  a random guesser earns 0 coins over 30 simulated days (the clock is moved a day at a time,
          six random tries each, every day ends with the word on screen); SB_LEVEL.after('dailyBee')
          is told 0 once a day. A solver earns exactly 1 a day, and a reload does not pay it again.
     the route: the Play banner opens #/daily inside the shell, Back returns to #/play with nothing
          left standing, the typed address opens it again.
     shapes: ● right place · ◐ in the word · ○ not in it — on the board and on the keys.
     never shown: the word is in no element, attribute or live line before the round ends (and IS
          there after it, so the check can see it).
   Every check here was watched failing with its fault put back (see the commit message).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/daily-bee.cjs                          */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const W = require('./lib/wait.cjs');
const URL = 'file://' + path.resolve(__dirname, '..') + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 0, band: 3, bandSeed: 3,
  lists: { journey: { xp: 30 } }, activeList: 'journey' };
/* the engine kit's stage checks, when its branch has landed them (contract: T14/T15 helpers) */
let KIT = null;
for (const n of ['stage-check.cjs', 'stage.cjs', 'stage-checks.cjs']) { const f = path.join(__dirname, 'lib', n); if (!KIT && fs.existsSync(f)) { try { KIT = require(f); } catch (e) { KIT = null; } } }

async function open(b, o) {
  o = o || {};
  const vp = o.vp || { width: 1180, height: 900 }, phone = vp.width < 500;
  const ctx = await b.newContext({ viewport: vp, isMobile: phone, hasTouch: phone, reducedMotion: 'reduce' });
  const kid = Object.assign({}, KID, o.kid || {});
  await ctx.addInitScript(([k, mode]) => { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode, pin: '1234', activeIdx: 0, children: [k] })); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } }, [kid, o.mode || 'light']);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  if (o.time) await pg.clock.setFixedTime(o.time);
  await pg.goto(URL + (o.hash || '')); await W.booted(pg);
  return { ctx, pg, errs };
}
/* open the Daily Bee and wait for today's board (or its end card) */
async function bee(pg, how) {
  await pg.evaluate(h => { if (h === 'route') location.hash = '#/daily'; else app.openDailyBee(); }, how || 'tap');
  return W.until(pg, () => !!document.querySelector('#db-host .db-grid, #db-host #db-end') && !!(active().dbee && active().dbee.word), null, 60000);
}
const word = pg => pg.evaluate(() => active().dbee.word);
async function typeWord(pg, s) { for (const ch of s) await pg.keyboard.press(ch); await pg.keyboard.press('Enter'); }
/* a guess with all three states: the first letter right, the next one shifted, the rest not in the word */
function crafted(w) {
  const notIn = 'zqxjvkwyfbhpmgu'.split('').find(ch => !w.includes(ch));
  let near = null; for (let i = 2; i < w.length; i++) if (w[i] !== w[1] && w[i] !== w[0]) { near = w[i]; break; }
  return w[0] + (near || notIn) + notIn.repeat(w.length - 2);
}

/* ---- T14 / T15, measured ---- */
async function t14(pg) {
  if (KIT && typeof KIT.t14 === 'function') return KIT.t14(pg, '.db-wrap > *');
  /* the stage is redrawn on every app render, so it is clipped by its rectangle, not held as an element */
  const q = await pg.evaluate(() => { const r = document.querySelector('.db-wrap > *').getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; });
  const png = await pg.screenshot({ clip: q });
  return pg.evaluate(async b64 => {
    const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode();
    const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height;
    const x = cv.getContext('2d'); x.drawImage(im, 0, 0); const d = x.getImageData(0, 0, cv.width, cv.height).data;
    const H = new Map(); let white = 0, black = 0; const N = d.length / 4;
    for (let i = 0; i < d.length; i += 4) { const k = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2]; H.set(k, (H.get(k) || 0) + 1);
      if (d[i] === 255 && d[i + 1] === 255 && d[i + 2] === 255) white++; if (!d[i] && !d[i + 1] && !d[i + 2]) black++; }
    let top = 0, topK = 0; H.forEach((n, k) => { if (n > top) { top = n; topK = k; } });
    return { flat: top / N, flatColour: '#' + topK.toString(16).padStart(6, '0'), white: white / N, black: black / N };
  }, png.toString('base64'));
}
async function t15(pg) {
  if (KIT && typeof KIT.t15 === 'function') return KIT.t15(pg, '.db-wrap > *');
  return pg.evaluate(() => {
    const st = document.querySelector('.db-wrap > *').getBoundingClientRect(), mid = (st.left + st.right) / 2;
    const R = s => { const e = document.querySelector(s); return e && e.getClientRects().length ? e.getBoundingClientRect() : null; };
    const l = R('.db-stat.l'), r = R('.db-stat.r'), grid = R('.db-grid'), acts = R('.db-acts'), keys = R('#db-kb button') ? R('#db-kb') : null, title = R('.db-title');
    const gut = q => q ? Math.abs((q.left - st.left) - (st.right - q.right)) : 0;
    const ctr = q => q ? Math.abs((q.left + q.right) / 2 - mid) : 0;
    const hud = l && r ? Math.abs((l.left - st.left) - (st.right - r.right)) : 99;
    const tab = document.querySelector('nav.sb-tabbar'); const tabTop = tab && getComputedStyle(tab).display !== 'none' ? tab.getBoundingClientRect().top : innerHeight;
    const ctl = [...document.querySelectorAll('.db-wrap button')].filter(b => b.getClientRects().length);
    const under = ctl.filter(b => b.getBoundingClientRect().bottom > tabTop + 0.5 || b.getBoundingClientRect().bottom > innerHeight + 0.5).length;
    const keyH = [...document.querySelectorAll('#db-kb button')].map(b => b.getBoundingClientRect().height);
    const kbRow = document.querySelector('#db-kb .db-krow'); const keyW = kbRow ? kbRow.getBoundingClientRect().width : 0;
    return { statW: l && r ? Math.abs(l.width - r.width) : 99, hud, gutters: Math.max(gut(grid), gut(acts), gut(keys)),
      centre: Math.max(ctr(title), ctr(grid), ctr(acts), ctr(keys)), scroll: document.scrollingElement.scrollHeight - innerHeight,
      stageScroll: (() => { const s = document.querySelector('.db-wrap > *'); return s.scrollHeight - s.clientHeight; })(),
      under, keyMin: keyH.length ? Math.min(...keyH) : null, keys: keyH.length, stageH: st.height, tabTop, stageBottom: st.bottom };
  });
}

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  const DAY0 = new Date(2026, 9, 5, 10, 0, 0);   // Mon 5 Oct 2026, 10am local

  /* ---- DB1: the same date and band give the same word ---- */
  {
    let { ctx, pg, errs: e1 } = await open(b, { time: DAY0 }); errs.push(...e1);
    await W.lazy(pg, 'daily');
    const P = await pg.evaluate(() => { const ds = ['2026-10-05', '2026-10-06', '2026-11-30']; const bs = ['1-2', '3-5', '6-9'];
      const g = {}; ds.forEach(d => bs.forEach(bb => { const r = SB_DBEE.pick(d, bb); g[d + '|' + bb] = r && r.w; }));
      const again = ds.every(d => bs.every(bb => (SB_DBEE.pick(d, bb) || {}).w === g[d + '|' + bb]));
      return { g, again }; });
    const vals = Object.values(P.g);
    ok(P.again && vals.every(Boolean), 'DB1: the pick is a function of date and band — asked twice, the same nine words (' + vals.slice(0, 3).join(' ') + ' …)');
    ok(['2026-10-05', '2026-10-06', '2026-11-30'].every(d => new Set(['1-2', '3-5', '6-9'].map(bb => P.g[d + '|' + bb])).size === 3), 'DB1: different bands on one date give different words');
    ok(new Set(['2026-10-05', '2026-10-06', '2026-11-30'].map(d => P.g[d + '|3-5'])).size === 3, 'DB1: and one band on different dates gives different words');
    await bee(pg); const w1 = await word(pg); const band1 = await pg.evaluate(() => SB_DBEE.band());
    await ctx.close();
    ({ ctx, pg, errs: e1 } = await open(b, { time: DAY0 })); errs.push(...e1);
    await bee(pg); const w2 = await word(pg);
    await ctx.close();
    ({ ctx, pg, errs: e1 } = await open(b, { time: DAY0, kid: { name: 'Ravi', age: 13, ageBand: '11-13', band: 8, bandSeed: 8 } })); errs.push(...e1);
    await bee(pg); const w3 = await word(pg); const band3 = await pg.evaluate(() => SB_DBEE.band());
    await ctx.close();
    ok(w1 && w1 === w2, `DB1: the game's word is the same in two fresh pages on the same date and band (${w1} / ${w2}, band ${band1})`);
    ok(w3 && w3 !== w1 && band3 !== band1, `DB1: a child on another band gets another word (${w3}, band ${band3})`);
  }

  /* ---- shapes on every state, the word never shown before the end, and DB2 at both sizes ---- */
  for (const [vw, vh] of [[390, 844], [1280, 800]]) {
    for (const mode of ['dusk', 'light']) {
      const { ctx, pg, errs: e1 } = await open(b, { vp: { width: vw, height: vh }, mode, time: DAY0, hash: '#/play' }); errs.push(...e1);
      const tag = vw + 'px ' + (mode === 'dusk' ? 'dark' : 'light') + ': ';
      await bee(pg); await W.still(pg);
      const w = await word(pg);
      /* what the screen SHOWS or SAYS: every text node and every read attribute on the stage, the live
         region and the title. (Not script URLs or class names: today's word may be "data".) */
      const seen = () => pg.evaluate(w => { const re = new RegExp('(^|[^a-z])' + w + '(?=[^a-z]|$)', 'i'); const hits = [];
        const st = document.querySelector('.db-wrap');
        if (st) { const tw = document.createTreeWalker(st, NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) if (re.test(n.textContent)) hits.push('text: ' + n.textContent.slice(0, 60));
          st.querySelectorAll('*').forEach(e => ['aria-label', 'title', 'alt', 'data-live-prompt', 'placeholder', 'value'].forEach(a => { const v = e.getAttribute(a); if (v && re.test(v)) hits.push(a + ': ' + v.slice(0, 60)); })); }
        const live = (document.getElementById('sb-live') || {}).textContent || '';
        if (re.test(live)) hits.push('live: ' + live.slice(0, 60)); if (re.test(document.title)) hits.push('title');
        return { hits, inStage: hits.length > 0 }; }, w);
      let S = await seen();
      const atOpen = !S.inStage;
      if (mode === 'dusk') {
        const g = crafted(w); await typeWord(pg, g); await W.frames(pg, 2);
        S = await seen(); const afterGuess = !S.inStage;
        await pg.evaluate(() => render()); await W.frames(pg, 2);
        S = await seen(); const afterRender = !S.inStage;
        ok(atOpen && afterGuess && afterRender, tag + 'the word is in no text, label or live line while the round is on (open, after a try, after a re-render)' + (S.hits.length ? ' — ' + S.hits.join(' | ') : ''));
        const sh = await pg.evaluate(() => { const by = k => [...document.querySelectorAll('.db-grid .db-cell.' + k)];
          const all = (els, glyph) => els.length > 0 && els.every(c => { const s = c.querySelector('.db-sh'); return s && s.textContent === glyph; });
          const keys = k => [...document.querySelectorAll('#db-kb button')].filter(x => x.classList.contains(k) || x.classList.contains('db-k-' + k));
          return { hit: all(by('hit'), '●'), near: all(by('near'), '◐'), miss: all(by('miss'), '○'),
            labels: by('hit').concat(by('near'), by('miss')).every(c => /right place|in the word|not in it/.test(c.getAttribute('aria-label') || '')),
            kHit: keys('hit').every(x => /●/.test(x.textContent)), kNear: keys('near').every(x => /◐/.test(x.textContent)), kMiss: keys('miss').every(x => /○/.test(x.textContent)),
            kAny: keys('hit').length + keys('near').length + keys('miss').length, touch: !!document.querySelector('#db-kb button') }; });
        ok(sh.hit && sh.near && sh.miss && sh.labels, tag + 'every graded letter carries its SHAPE as well as its colour (● right place · ◐ in the word · ○ not in it), and says it (' + JSON.stringify(sh) + ')');
        if (sh.touch) ok(sh.kAny >= 3 && sh.kHit && sh.kNear && sh.kMiss, tag + 'and so does every letter key it has touched');
      } else ok(atOpen, tag + 'the word is nowhere on the stage when the board opens' + (S.hits.length ? ' — ' + S.hits.join(' | ') : ''));
      /* DB2 — measured mid-round: one try on the board, keys up */
      const A = await t14(pg), B = await t15(pg);
      ok(A.flat <= 0.06 && A.white <= 0.02 && A.black <= 0.02, tag + `T14 — largest flat colour ${(A.flat * 100).toFixed(1)}% (${A.flatColour}), pure white ${(A.white * 100).toFixed(2)}%, pure black ${(A.black * 100).toFixed(2)}%`);
      ok(B.statW <= 4 && B.hud <= 4 && B.gutters <= 4 && B.centre <= 4, tag + `T15 — HUD stats ${B.statW.toFixed(1)}px apart in width, HUD gutters ${B.hud.toFixed(1)}, board/controls gutters ${B.gutters.toFixed(1)}, centre line ${B.centre.toFixed(1)}px`);
      ok(B.scroll <= 1 && B.stageScroll <= 1 && !B.under && Math.abs(B.stageBottom - Math.min(B.tabTop, vh)) <= 2, tag + `T15 — no scroll (page ${B.scroll}px, stage ${B.stageScroll}px), no control under the tab bar (${B.under}), the stage reaches it (${Math.round(B.stageBottom)} / ${Math.round(Math.min(B.tabTop, vh))})`);
      if (vw < 500) ok(B.keys >= 26 && B.keyMin >= 40, tag + `T11 — the letter keys are on screen and ${B.keyMin && B.keyMin.toFixed(1)}px tall (≥ 40)`);
      if (mode === 'dusk') {
        /* play it out: the end always shows the word, with its meaning, origin and sentence */
        const notIn = 'zqxjvkwyfbhpmgu'.split('').find(ch => !w.includes(ch));
        for (let i = 0; i < 5; i++) await typeWord(pg, notIn.repeat(w.length));
        await W.until(pg, () => !!document.querySelector('#db-end'), null, 8000);
        const E = await pg.evaluate(w => { const e = document.querySelector('#db-end'); const t = e ? e.textContent : '';
          return { word: !!e && e.querySelector('.db-word') && e.querySelector('.db-word').textContent === w, mean: /Meaning/i.test(t), orig: /Origin/i.test(t), sent: /In a sentence/i.test(t),
            rev: !!document.querySelector('[data-db="rev"]') }; }, w);
        S = await seen();
        ok(E.word && E.mean && E.orig && E.sent && E.rev && S.inStage, tag + 'six misses end on the word itself — its meaning, origin, a sentence — with "Add to revision" (' + JSON.stringify(E) + ')');
        await pg.click('[data-db="rev"]'); await W.until(pg, () => !!document.querySelector('[data-db="rev"][disabled]'), null, 4000);
        const rv = await pg.evaluate(w => (active().missed || []).some(m => m.w === w), w);
        ok(rv, tag + '"Add to revision" puts the word on the revision pile');
      }
      await ctx.close();
    }
  }

  /* ---- DB3: a random guesser earns 0 over 30 simulated days; a solver earns 1 a day, once ---- */
  {
    const { ctx, pg, errs: e1 } = await open(b, { vp: { width: 390, height: 844 }, time: DAY0 }); errs.push(...e1);
    /* SB_LEVEL.after is recorded (the real one when the foundations have landed, else a stub) */
    await pg.evaluate(() => { window._lv = []; if (!window.SB_LEVEL) window.SB_LEVEL = { get: () => 'auto', set() {}, chip: () => '', after: () => ({ level: 'auto', dropped: false }) };
      const real = SB_LEVEL.after; SB_LEVEL.after = function (k, p) { window._lv.push([k, p]); return real.apply(this, arguments); }; });
    const coins0 = await pg.evaluate(() => { walletSync(active()); return active().coins || 0; });
    let seed = 7; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
    let ended = 0, wordsSeen = new Set();
    for (let d = 0; d < 30; d++) {
      const day = new Date(DAY0.getTime()); day.setDate(day.getDate() + d);
      await pg.clock.setFixedTime(day);
      const want = await pg.evaluate(() => todayKey());
      await pg.evaluate(() => app.openGames());
      await pg.evaluate(() => app.openDailyBee());
      await W.until(pg, k => !!(active().dbee && active().dbee.day === k && active().dbee.word) && !!document.querySelector('#db-host .db-grid'), want, 30000);
      const n = (await word(pg)).length; wordsSeen.add(await word(pg));
      for (let t = 0; t < 6; t++) { let g = ''; for (let i = 0; i < n; i++) g += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(rnd() * 26)]; await typeWord(pg, g); }
      if (await W.until(pg, () => !!document.querySelector('#db-end .db-word'), null, 5000)) ended++;
    }
    const R = await pg.evaluate(() => { walletSync(active()); return { coins: active().coins || 0, won: Object.values(active().dbee.days).filter(x => x.s).length, lv: window._lv }; });
    ok(R.coins - coins0 === 0 && R.won === 0, `DB3: a random guesser earns ${R.coins - coins0} coins over 30 simulated days (solved ${R.won})`);
    ok(ended === 30 && wordsSeen.size >= 25, `DB3: and every one of the 30 days ended on its word (${ended}), ${wordsSeen.size} different words`);
    ok(R.lv.length === 30 && R.lv.every(x => x[0] === 'dailyBee' && x[1] === 0), `DB3: SB_LEVEL.after('dailyBee', 0) once a day (${R.lv.length} calls)`);
    /* a solver: day 31, solved on the third try — exactly one coin, and a reload does not pay it again */
    const day = new Date(DAY0.getTime()); day.setDate(day.getDate() + 30); await pg.clock.setFixedTime(day);
    const want = await pg.evaluate(() => todayKey());
    await pg.evaluate(() => app.openDailyBee());
    await W.until(pg, k => !!(active().dbee && active().dbee.day === k && active().dbee.word) && !!document.querySelector('#db-host .db-grid'), want, 30000);
    const w = await word(pg); const notIn = 'zqxjvkwyfbhpmgu'.split('').find(ch => !w.includes(ch));
    await typeWord(pg, notIn.repeat(w.length)); await typeWord(pg, crafted(w)); await typeWord(pg, w);
    await W.until(pg, () => !!document.querySelector('#db-end .db-word'), null, 5000);
    const c1 = await pg.evaluate(() => { walletSync(active()); return active().coins || 0; });
    await pg.reload(); await W.booted(pg); await bee(pg, 'route');
    await W.until(pg, () => !!document.querySelector('#db-end .db-word'), null, 8000);
    const c2 = await pg.evaluate(() => { walletSync(active()); return active().coins || 0; });
    ok(c1 - R.coins === 1 && c2 === c1, `a solved day pays exactly one coin (${c1 - R.coins}) and coming back to it pays nothing more (${c2 - c1})`);
    await ctx.close();
  }

  /* ---- the route, and Back ---- */
  {
    const { ctx, pg, errs: e1 } = await open(b, { vp: { width: 390, height: 844 }, hash: '#/play', time: DAY0 }); errs.push(...e1);
    const look = () => pg.evaluate(() => { const tab = document.querySelector('nav.sb-tabbar [data-arg="games"]');
      return { h: location.hash, nav: state.nav, stage: !!document.querySelector('#root .db-wrap .db-grid, #root .db-wrap #db-end'), bar: !!document.querySelector('#root .sb-fam-bar'),
        tabbar: !!document.querySelector('#root nav.sb-tabbar'), play: !!tab && tab.getAttribute('aria-current') === 'page',
        loose: [...document.body.children].filter(e => /(^|\s)db-/.test(e.className || '')).length }; });
    await W.until(pg, () => !!document.querySelector('[data-act="openDaily"]'), null, 15000);
    await pg.click('[data-act="openDaily"]');
    await W.until(pg, () => !!document.querySelector('#root .db-wrap .db-grid'), null, 60000);
    let L = await look();
    ok(L.h === '#/daily' && L.nav === 'daily' && L.stage && L.bar && L.tabbar && L.play && !L.loose, 'the Play banner opens Daily Bee at #/daily, inside the shell (top bar, tab bar, Play marked) (' + JSON.stringify(L) + ')');
    await pg.goBack(); await W.until(pg, () => location.hash === '#/play' && state.nav === 'games', null, 8000);
    L = await look();
    ok(L.h === '#/play' && L.nav === 'games' && !L.stage && !L.loose, 'Back returns to #/play and leaves nothing of it on screen (' + L.h + ')');
    await pg.evaluate(() => { location.hash = '#/daily'; });
    await W.until(pg, () => !!document.querySelector('#root .db-wrap .db-grid'), null, 30000);
    L = await look();
    ok(L.nav === 'daily' && L.stage, 'the typed address #/daily opens it');
    await pg.click('[data-db="back"]'); await W.until(pg, () => state.nav === 'games', null, 8000);
    ok((await look()).h === '#/play', 'its own "Play" button goes back to #/play');
    await ctx.close();
  }

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
