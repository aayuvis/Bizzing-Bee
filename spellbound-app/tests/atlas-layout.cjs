/* THE ATLAS FITS A PHONE — @check
   No label on another, nothing clipped, a card that stays on screen, a moth that fits, and
   a locked continent with a real door.

   Four owner-reported faults from the 3 Oct screenshot sweep, each measured here:
   1. The overview at 390x844: nine two-line region chips on a 358x200 painting sat on each
      other, the top row's numerals (VIII) were cut off by the board's edge, and the avatar
      medallion covered the Roman Forum's count. A narrow board now shows medallions only,
      each centred on its own point, and a KEY under it names every region (trail.js
      atlasKey, index.html .atlas-wrap container queries). Wide boards are as they were.
   2. The stop callout on a region's panorama ran off the right edge of a phone ("Clear the
      earlier stops firs"). popFit() slides it into the visible window of the panning board.
   3. The paid continents are ONE QUIET LINE (owner, 4 Oct 2026; audit v4 C5). Two locked
      panels (Advanced Rounds, Ultra — "Show a grown-up" + "Look at the map" over blurred
      boards) became one sentence under the Honey map, "More continents come with the Advanced
      Pack". No paid board, no peek, no price, and never the words "ask a grown-up" (FIX-BEE v2
      T3). A tester or a pack holder still sees all three continents and no line.
      UPDATED 10 Oct 2026 — the owner (the road to 4.5, P0.29): "Remove the last 'Show a grown-up'
      doors from the child Atlas; one quiet line in the Parent Zone." The line used to carry one
      "Show a grown-up" button; now it is words only and holds NO control, and the door lives in
      the Parent Zone (trust-v2 holds that). An address into a paid continent still meets the
      grown-up PIN, never the pack. Proved by breaking (10 Oct 2026): the button put back in
      advLine → the line check and the "words only" check fail (2).
   4. The road sign at a region's earned edge is never cut by a phone's window (audit v4 §4).
   5. A region's board says what it teaches (audit v4 D2), read from its own stops.
   8. A region board ZOOMS (road to 4.5, P3.28): two fingers on a phone, the − / + buttons, the + / − / 0 keys and a
      trackpad's pinch (Ctrl + the wheel) grow the painting around the point under them; the window keeps its height and
      the page is never zoomed; the markers keep their size and a 44px hit area; the stop card still fits the window; the
      window never passes the earned edge; a region opens as drawn. Proved by breaking (13 Oct 2026): the hit area's
      ::after hidden → the 44px check fails; the camera clamp measured against a doubly-zoomed width → the earned-edge
      check fails; the point under the fingers not kept → "stays put" fails (its tolerance was 3% and let that through
      — it is 0.5% now, the gesture holding to 0.0%).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/atlas-layout.cjs */
const { chromium } = require('playwright');
const SRC = process.env.SRC || __dirname + '/..';
let fails = 0;
const ok = (b, msg) => { console.log((b ? '  OK   ' : '  FAIL ') + msg); if (!b) fails++; };

/* every visible board on the page: which marks overlap, which leave the board */
const GEOM = () => {
  const vis = r => r.width > 0 && r.height > 0;
  const inter = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
  const out = [];
  document.querySelectorAll('.atlas-board').forEach((bd, bi) => {
    const B = bd.getBoundingClientRect(); if (!vis(B)) return;
    /* a board under its lock panel is not being read — only what a child can see counts */
    const lock = bd.parentElement && bd.parentElement.parentElement && bd.parentElement.parentElement.querySelector(':scope > [style*="inset:0"]');
    if (lock) return;
    const items = [];
    bd.querySelectorAll('.atlas-pin').forEach((p, i) => {
      const name = p.getAttribute('title') || i;
      const d = p.querySelector('.atlas-dot'), ch = p.querySelector('.atlas-chip');
      if (d) { const r = d.getBoundingClientRect(); if (vis(r)) items.push({ k: 'medallion', name, r, pin: i }); }
      if (ch && getComputedStyle(ch).display !== 'none') { const r = ch.getBoundingClientRect(); if (vis(r)) items.push({ k: 'label', name, r, pin: i }); }
    });
    bd.querySelectorAll(':scope > span').forEach(s => { if (getComputedStyle(s).display === 'none' || getComputedStyle(s).position !== 'absolute') return;
      const r = s.getBoundingClientRect(); if (!vis(r)) return; items.push({ k: 'caption', name: 'caption', r, pin: -1 });
      const rg = document.createRange(); rg.selectNodeContents(s); const rs = [...rg.getClientRects()].filter(x => x.height > 1);
      for (let a = 0; a < rs.length; a++) for (let c = a + 1; c < rs.length; c++) if (Math.abs(rs[a].top - rs[c].top) > 1 && inter(rs[a], rs[c])) { out.push('board ' + bi + ': the caption\'s lines overlap'); a = c = 1e9; } });
    for (const it of items) { const r = it.r;
      if (r.left < B.left - 1 || r.right > B.right + 1 || r.top < B.top - 1 || r.bottom > B.bottom + 1) out.push('board ' + bi + ': ' + it.k + ' "' + it.name + '" is cut off by the board edge'); }
    for (let a = 0; a < items.length; a++) for (let b = a + 1; b < items.length; b++) {
      const A = items[a], C = items[b]; if (A.pin === C.pin && A.pin !== -1) continue;
      if (inter(A.r, C.r)) out.push('board ' + bi + ': ' + A.k + ' "' + A.name + '" overlaps ' + C.k + ' "' + C.name + '"'); }
  });
  return out;
};

async function boot(b, W, H) {
  const pg = await b.newPage({ viewport: { width: W, height: H }, isMobile: W < 700, hasTouch: W < 700 });
  const errs = []; pg.on('pageerror', e => errs.push(String(e.message)));
  await pg.goto('file://' + SRC + '/index.html'); await pg.waitForTimeout(2400);
  await pg.evaluate(async () => {
    try { SB_STORE.set('splash', '0'); } catch (e) {}
    Math.random = () => 0.9;      // steadies the chest rolls while measuring
    /* REWRITTEN 4 Oct 2026 (games spec §4.7): the moth comes on every third return to a region,
       counted, not on a roll — so Math.random no longer keeps it away. While measuring, each visit
       is made a FIRST visit (the counts are cleared), and the first visit never meets the moth. */
    for (const k of ['trailAct', 'ultraAct']) { const real = app[k]; app[k] = a => { try { if (!window.__mothOn && active().trail) active().trail.ambV = {}; } catch (e) {} return real(a); }; }
    state.children = [{ name: 'Ravi', avatar: 'bizzy', coins: 0, pow: {}, age: 10, lists: { default: { xp: 10 } }, activeList: 'default',
      missed: [], unlockedThemes: ['spellbound'], unlockedConcepts: {}, unlockedLists: {}, questPath: 'journey' }];
    state.activeIdx = 0; state.screen = 'app';
    await new Promise(res => SB_LAZY.need('atlas', res));
  });
  return { pg, errs };
}
const atlas = (pg, mode, dev) => pg.evaluate(async ([mode, dev]) => {
  state.devUnlock = !!dev; state.atlasPeek = null; app.setMode(mode); app.trailToMap();
  await new Promise(r => setTimeout(r, 700)); }, [mode, dev]);

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => require('fs').existsSync(p)) });

  /* ---------- 1. the overview on a phone ---------- */
  for (const W of [360, 390]) {
    const { pg, errs } = await boot(b, W, 844);
    const bad = [];
    for (const mode of ['light', 'white', 'dusk']) for (const dev of [0, 1]) {
      await atlas(pg, mode, dev);
      (await pg.evaluate(GEOM)).forEach(x => bad.push(mode + (dev ? '+all boards' : '') + ': ' + x));
    }
    ok(!bad.length, W + 'px, light/white/dusk, all three continents: no label on another, nothing cut off, the avatar on nothing'
      + (bad.length ? ' — ' + bad.length + ': ' + bad.slice(0, 4).join(' | ') : ''));
    await atlas(pg, 'light', 1);
    const key = await pg.evaluate(() => {
      const wraps = [...document.querySelectorAll('.atlas-wrap')];
      return wraps.map(w => { const pins = [...w.querySelectorAll('.atlas-pin')].map(p => p.dataset.act + '|' + p.dataset.arg);
        const rows = [...w.querySelectorAll('.atlas-key-i')].filter(r => r.getBoundingClientRect().height >= 40);
        const k = w.querySelector('.atlas-key');
        return { shown: !!k && getComputedStyle(k).display !== 'none', pins: pins.length,
          same: rows.length === pins.length && rows.every((r, i) => (r.dataset.act + '|' + r.dataset.arg) === pins[i].replace(/^openAdvanced/, 'ultraAct')),
          named: rows.every(r => /\S{3}/.test(r.querySelector('b').textContent) && /stops|ahead|cleared|mapped|behind/.test(r.textContent)),
          chips: [...w.querySelectorAll('.atlas-chip')].filter(c => getComputedStyle(c).display !== 'none').length }; });
    });
    ok(key.length === 3 && key.every(k => k.shown && k.same && k.named && !k.chips),
      W + 'px: each board drops its chips and lists every region in a key underneath — same door, a name and a count, a 40px+ row (' + JSON.stringify(key.map(k => k.pins)) + ')');
    const tap = await pg.evaluate(async () => { const r = document.querySelector('.atlas-key-i[data-arg="honey|forum"]'); r.click();
      await new Promise(res => setTimeout(res, 300)); const o = { view: state.trailView, act: state.trailAct }; app.trailToMap(); return o; });
    ok(tap.view === 'act' && tap.act === 'forum', W + 'px: a key row opens its region (' + JSON.stringify(tap) + ')');

    /* ---------- 2. the stop callout stays inside the window, first to last stop ---------- */
    const pops = [];
    for (const [act, dev] of [['meadow', 0], ['meadow', 1], ['junkyard', 1], ['stage', 1]]) {
      const r = await pg.evaluate(async ([act, dev]) => {
        /* (10 Oct 2026, P0.18) wait for the board to be REAL — its painting loaded, the card drawn, two frames for
           the camera and the refit — never a fixed sleep: the audit's "Junkyard stop card 162–485" was a card
           fitted to the sliver of board drawn before the painting landed, read after 650ms on a loaded machine */
        const raf = () => new Promise(res => requestAnimationFrame(() => requestAnimationFrame(res)));
        const settle = async (pop) => { const t0 = performance.now(); while (performance.now() - t0 < 15000) { const i = document.querySelector('#sb-pan img');
            if ((!i || (i.complete && i.naturalWidth > 0)) && (!pop || document.querySelector('.atlas-pop'))) break; await raf(); } await raf(); await raf(); };
        state.devUnlock = !!dev; app.trailAct('honey|' + act); await settle(false);
        const args = [...document.querySelectorAll('.atlas-stop')].map(e => +e.dataset.arg);
        const pick = [0, 1, Math.floor(args.length / 2), args.length - 2, args.length - 1].filter((v, i, a) => v >= 0 && a.indexOf(v) === i);
        const out = [];
        for (const k of pick) { app.trailPick(args[k]); await settle(true);
          const p = document.querySelector('.atlas-pop'), pan = document.getElementById('sb-pan');
          if (!p) { out.push(act + ' stop ' + (k + 1) + ': no callout'); continue; }
          const pr = p.getBoundingClientRect(), wr = pan.getBoundingClientRect();
          const L = Math.max(0, wr.left), R = Math.min(innerWidth, wr.right);
          if (pr.left < L - 1 || pr.right > R + 1 || pr.top < wr.top - 1 || pr.bottom > wr.bottom + 1)
            out.push(act + ' stop ' + (k + 1) + '/' + args.length + ': card ' + Math.round(pr.left) + '–' + Math.round(pr.right) + ' in a window ' + Math.round(L) + '–' + Math.round(R)); }
        return { n: pick.length, out }; }, [act, dev]);
      pops.push(r);
    }
    const off = pops.flatMap(p => p.out);
    ok(pops.every(p => p.n >= 2) && !off.length, W + 'px: the stop card stays inside the visible map for the first, middle and last stops of a long panorama'
      + (off.length ? ' — ' + off.slice(0, 3).join(' | ') : ''));
    /* the road sign at the earned edge is never cut by the window (audit v4 §4: "clipped at the
       right edge ('cl')"): pan the board across, and at every stop it is wholly in or wholly out */
    const sign = await pg.evaluate(async () => {
      state.devUnlock = false; app.trailToMap(); app.trailAct('honey|meadow'); await new Promise(res => setTimeout(res, 900));
      const pan = document.getElementById('sb-pan'); const out = { seen: 0, steps: 0, cut: [] };
      if (!pan || !pan.querySelector('.mw-sign')) return out;
      const max = pan.scrollWidth - pan.clientWidth;
      for (let x = 0; x <= max + 40; x += 37) {
        pan.scrollLeft = x; pan.dispatchEvent(new Event('scroll'));
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); out.steps++;
        const sg = pan.querySelector('.mw-sign'); if (!sg) continue;
        const r = sg.getBoundingClientRect(), w = pan.getBoundingClientRect();
        const L = Math.max(0, w.left), R = Math.min(document.documentElement.clientWidth, w.right);
        if (r.right > L + 1 && r.left < R - 1) out.seen++;
        if ((r.left < R - 1 && r.right > R + 1) || (r.left < L - 1 && r.right > L + 1)) out.cut.push(Math.round(pan.scrollLeft) + ': ' + Math.round(r.left) + '–' + Math.round(r.right) + ' in ' + Math.round(L) + '–' + Math.round(R));
      }
      return out; });
    ok(sign.seen >= 2 && !sign.cut.length, W + 'px: the road sign at the earned edge is never cut by the window as the board pans (' + sign.steps + ' camera stops, sign in view at ' + sign.seen + ')'
      + (sign.cut.length ? ' — cut at ' + sign.cut.slice(0, 3).join(' | ') : ''));
    /* D2: each region's board says what it teaches — read from its own stops, never authored per region */
    const master = await pg.evaluate(async () => { const out = [];
      for (const act of ['meadow', 'forum', 'stage']) {
        app.trailToMap(); app.trailAct('honey|' + act); await new Promise(res => setTimeout(res, 500));
        const el = document.querySelector('.atlas-master'); const A = SB_TRAIL.honey.acts.find(a => a.id === act);
        const lap = (active().trail || {}).lap || 1; const U = Object.fromEntries(SB_TRAIL.honey.units.map(u => [u.id, u]));
        const ts = A.units.map(id => U[id]).filter(u => (u.laps || [u.lap || 1]).includes(lap)).map(u => String(u.title).split(' — ')[0].replace(/\s*\([^)]*\)\s*$/, '').trim());
        const want = 'What you’ll master here: ' + ts.slice(0, 3).join(', ') + (ts.length > 3 ? ' and ' + (ts.length - 3) + ' more' : '');
        const r = el && el.getBoundingClientRect();
        out.push({ act, got: el ? el.textContent.trim() : null, want, fits: !!r && r.left >= 0 && r.right <= innerWidth + 0.5 }); }
      return out; });
    const mbad = master.filter(m => m.got !== m.want || !m.fits);
    ok(!mbad.length, W + 'px: a region\'s board says what it teaches, from its own stops ("' + (master[0] && master[0].got) + '")' + (mbad.length ? ' — ' + JSON.stringify(mbad[0]) : ''));
    /* the moth and the chest: their cards fit the phone, ✕ included (94vw under #root's zoom did not) */
    const dlg = await pg.evaluate(async () => { const W2 = ms => new Promise(r => setTimeout(r, ms)); const out = {};
      const R = Math.random; state.devUnlock = false;
      /* the third return to the Forum: the counted moth arrives (first visit + two returns already made) */
      window.__mothOn = true; active().trail.ambV = { forum: 3 };
      app.trailToMap(); app.trailAct('honey|forum'); await W2(1900);
      const fit = sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect();
        return r.left >= 0 && r.right <= innerWidth + 0.5 && r.top >= 0 && r.bottom <= innerHeight + 0.5; };
      out.moth = fit('[data-trap="villain"]'); out.x = fit('[data-trap="villain"] [aria-label="Close"]'); app.villFlee(); await W2(150);
      Math.random = () => 0.8; app.trailTre('forum:0'); await W2(250); out.chest = fit('[data-act="treClose"] > [data-act="popKeep"]'); app.treClose();
      Math.random = R; window.__mothOn = false; return out; });
    ok(dlg.moth && dlg.x && dlg.chest, W + 'px: the moth\'s card, its ✕ and a chest\'s card are wholly on screen ' + JSON.stringify(dlg));
    ok(!errs.length, W + 'px: no page errors' + (errs.length ? ': ' + errs[0] : ''));
    await pg.close();
  }

  /* ---------- desktop and tablet stay as they were where the chips fit ---------- */
  for (const [W, labelled] of [[1280, ['aw-honey', 'aw-exp', 'aw-ultra']], [768, ['aw-honey', 'aw-ultra']]]) {
    const { pg } = await boot(b, W, 900);
    await atlas(pg, 'light', 1);
    const res = { geom: await pg.evaluate(GEOM), wraps: await pg.evaluate(() => [...document.querySelectorAll('.atlas-wrap')].map(w => ({ cls: w.className.split(' ')[1],
      chips: [...w.querySelectorAll('.atlas-chip')].every(c => getComputedStyle(c).display !== 'none'),
      key: getComputedStyle(w.querySelector('.atlas-key')).display !== 'none' }))) };
    const want = res.wraps.every(w => labelled.includes(w.cls) ? (w.chips && !w.key) : (!w.chips && w.key));
    ok(want && !res.geom.length, W + 'px: ' + labelled.join(', ') + ' keep their labelled chips and no key; the rest switch to the key; nothing overlaps'
      + (res.geom.length ? ' — ' + res.geom.slice(0, 3).join(' | ') : '') + ' ' + JSON.stringify(res.wraps));
    if (W === 768) {   // and every width a tablet or a narrow window can be, both looks
      const bad = [];
      for (const mode of ['light', 'dusk']) { await atlas(pg, mode, 1);
        for (const w of [641, 680, 720, 800, 880, 960, 1040]) { await pg.setViewportSize({ width: w, height: 900 }); await pg.waitForTimeout(120);
          (await pg.evaluate(GEOM)).forEach(x => bad.push(mode + ' ' + w + 'px: ' + x)); } }
      ok(!bad.length, '641–1040px: no label on another and nothing cut off at any tablet width' + (bad.length ? ' — ' + bad.slice(0, 3).join(' | ') : ''));
    }
    await pg.close();
  }

  /* ---------- 3. the paid continents are one quiet line, with one door ---------- */
  {
    const { pg, errs } = await boot(b, 390, 844);
    await atlas(pg, 'light', 0);
    const d = await pg.evaluate(async () => {
      const W = ms => new Promise(r => setTimeout(r, ms)); const o = {};
      const t = (document.querySelector('.sb-content') || document.body).innerText;
      o.price = /\$\s?\d|\/\s*yr|per year/i.test(t); o.askWords = /ask a grown-up/i.test(t);
      const lines = [...document.querySelectorAll('.atlas-more')], doors = [...document.querySelectorAll('[data-act="atlasAdvDoor"]')];
      o.lines = lines.length; o.doors = doors.length; o.boards = document.querySelectorAll('.atlas-board').length;
      o.peek = document.querySelectorAll('[data-act="atlasPeek"]').length;
      o.said = lines.length === 1 && /^More continents come with the Advanced Pack$/.test(lines[0].innerText.replace(/\s+/g, ' ').trim());
      /* words only (owner, 10 Oct 2026): no control in the line, no grown-up door anywhere on the child's Atlas */
      o.door = !!lines[0] && !lines[0].querySelector('button,a,[data-act]') && !/Show a grown-up/i.test(t);
      const bd = document.querySelector('.atlas-board'); o.under = !!(bd && lines[0] && lines[0].getBoundingClientRect().top >= bd.getBoundingClientRect().bottom);
      o.paidNames = /Ultra Champions|THE LAST CONTINENT|90% GATES|Advanced Rounds/.test(t);
      /* an address into a paid continent still meets the grown-up PIN, never the pack (atlasAdvDoor) */
      state.pinDlg = null; location.hash = '#/atlas/exp/proving'; await W(900); o.pin = !!state.pinDlg; o.noSheet = !state.showTiers; state.pinDlg = null; app.openTrail(); await W(400);
      /* a tester sees all three continents and no line */
      state.devUnlock = true; render(); await W(300);
      o.devBoards = document.querySelectorAll('.atlas-board').length; o.devLine = document.querySelectorAll('.atlas-more').length; state.devUnlock = false; render();
      return o; });
    ok(d.lines === 1 && d.said && d.under, 'a free child\'s Atlas says ONE quiet line under the map — "More continents come with the Advanced Pack" ' + JSON.stringify(d));
    ok(d.door && d.doors === 0, 'the line is words only: no "Show a grown-up", no door on the child\'s Atlas (owner, 10 Oct 2026 — it is one quiet line in the Parent Zone)');
    ok(d.boards === 1 && !d.peek && !d.paidNames, 'and draws no paid continent: one board, no "Look at the map", no Advanced Rounds or Ultra heading');
    ok(d.pin && d.noSheet, 'an address into a paid continent (#/atlas/exp/proving) meets the grown-up PIN — the pack is drawn only behind it');
    ok(d.devBoards === 3 && d.devLine === 0, 'a tester (or a pack holder) still sees all three continents, and no line (' + d.devBoards + ' boards)');
    ok(!d.price && !d.askWords, 'no price and no "ask a grown-up" on the child\'s Atlas (FIX-BEE v2 T3)');
    ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
    await pg.close();
  }
  /* ---------- 8. a region board zooms (road to 4.5, P3.28): a pinch, the − / + buttons, the keys ---------- */
  {
    const settle = async (pg) => pg.evaluate(async () => { const raf = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      const t0 = performance.now(); while (performance.now() - t0 < 15000) { const i = document.querySelector('#sb-pan img'); if (i && i.complete && i.naturalWidth > 0) break; await raf(); } await raf(); await raf(); });
    const Z = (pg) => pg.evaluate(() => { const pan = document.getElementById('sb-pan'), bd = pan && pan.firstElementChild, img = bd && bd.querySelector('img');
      const sds = [...document.querySelectorAll('#sb-pan .atlas-stop .atlas-sd')].map(e => Math.round(e.getBoundingClientRect().width));
      return { w: img ? Math.round(img.getBoundingClientRect().width) : 0, h: pan ? Math.round(pan.getBoundingClientRect().height) : 0, sd: sds.join(','),
        pct: ((document.querySelector('.act-zoom-n') || {}).textContent || '').trim(), scale: (window.visualViewport || { scale: 1 }).scale }; });
    const fracAt = (pg, x) => pg.evaluate(([x]) => { const pan = document.getElementById('sb-pan'); const r = pan.getBoundingClientRect(); return (pan.scrollLeft + x - r.left) / pan.firstElementChild.offsetWidth; }, [x]);
    /* a phone: two fingers */
    { const { pg, errs } = await boot(b, 390, 844);
      await pg.evaluate(() => { state.devUnlock = false; app.trailToMap(); app.trailAct('honey|meadow'); }); await settle(pg);
      const z0 = await Z(pg);
      const box = await pg.evaluate(() => { const r = document.getElementById('sb-pan').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      const frac0 = await fracAt(pg, box.x);
      const cdp = await pg.context().newCDPSession(pg);
      const touch = (type, d) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: box.x - d, y: box.y, id: 1 }, { x: box.x + d, y: box.y, id: 2 }] });
      await touch('touchStart', 30); for (let d = 34; d <= 60; d += 4) { await touch('touchMove', d); await pg.waitForTimeout(16); } await touch('touchEnd', 0);
      await pg.waitForTimeout(400); await settle(pg);
      const z1 = await Z(pg), frac1 = await fracAt(pg, box.x);
      const ratio = z1.w / z0.w;
      ok(ratio > 1.8 && ratio < 2.1 && Math.abs(z1.h - z0.h) <= 2 && z1.scale === 1 && /^(19|20)\d%$/.test(z1.pct),
        `390px: a pinch (fingers 60 → 120px apart) grows the painting ${ratio.toFixed(2)}× (${z0.w} → ${z1.w}px, the bar says ${z1.pct}), the window keeps its height (${z0.h} → ${z1.h}) and the page itself is not zoomed (${z1.scale})`);
      ok(Math.abs(frac1 - frac0) < 0.005, `390px: the point between the fingers stays put (${(frac0 * 100).toFixed(1)}% → ${(frac1 * 100).toFixed(1)}% of the board)`);
      ok(z1.sd === z0.sd && z0.sd.length > 0, `390px: the stop markers keep their size while the painting grows (${z0.sd})`);
      /* every marker's hit area is 44px: probes 20px out from a marker's centre land on that marker, never on the bare board */
      const hits = await pg.evaluate(async () => { const out = { n: 0, bare: [] }; const pan = document.getElementById('sb-pan');
        app.trailShut(); await new Promise(r => setTimeout(r, 60));   /* no card over the road while it is probed */
        /* zoomed, the road runs past the window both ways: bring each stop into view (as a child pans to it), then probe it */
        for (const st0 of [...document.querySelectorAll('#sb-pan .atlas-stop')]) { const arg = st0.dataset.arg;
          const p2 = document.getElementById('sb-pan'), st = p2.querySelector('.atlas-stop[data-arg="' + arg + '"]'); if (!st) continue;
          p2.scrollTop = Math.max(0, st.offsetTop - p2.clientHeight / 2); p2.scrollLeft = Math.max(0, st.offsetLeft - p2.clientWidth / 2);
          await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
          const w = p2.getBoundingClientRect(), r = st.querySelector('.atlas-sd').getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          if (cx < w.left + 24 || cx > w.right - 24 || cy < w.top + 24 || cy > w.bottom - 24) continue; out.n++;
          for (const [dx, dy] of [[20, 0], [-20, 0], [0, 20], [0, -20]]) { const e = document.elementFromPoint(cx + dx, cy + dy);
            if (e && (e.classList.contains('act-board') || e.tagName === 'IMG' || (e.closest && e.closest('svg') && !e.closest('.atlas-stop')))) out.bare.push(arg + '@' + dx + ',' + dy); } }
        return out; });
      ok(hits.n >= 2 && !hits.bare.length, `390px zoomed: every marker in view answers a tap 20px from its centre — a 44px target (${hits.n} markers${hits.bare.length ? '; bare board at ' + hits.bare.slice(0, 4).join(' ') : ''})`);
      /* the stop card still fits the window, zoomed */
      const pop = await pg.evaluate(async () => { const raf = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        const args = [...document.querySelectorAll('.atlas-stop')].map(e => +e.dataset.arg); const out = [];
        for (const a of [args[0], args[Math.floor(args.length / 2)], args[args.length - 1]]) {
          /* the window first turned AWAY from the stop (zoomed, the board is twice the window's height): the pick must bring
             the stop and its card into view (trail.js azAfter, _azOwed) — panTo only ever moves the camera sideways */
          const pn = document.getElementById('sb-pan'), sp = pn && pn.querySelector('.atlas-stop[data-arg="' + a + '"]');
          if (sp) { pn.scrollTop = sp.offsetTop > pn.scrollHeight / 2 ? 0 : pn.scrollHeight; pn.dispatchEvent(new Event('scroll')); await raf(); }
          app.trailPick(a);
          /* wait on the state, not a sleep (a lazy file landing re-renders the board, and its painting can be a beat behind):
             the board laid out, the camera brought to the stop, the card still for two frames running */
          let prev = '', same = 0;
          for (let i = 0; i < 90 && same < 2; i++) { await raf(); const p0 = document.querySelector('.atlas-pop'), pn = document.getElementById('sb-pan'), b0 = pn && pn.firstElementChild;
            const r0 = p0 && b0 && b0.offsetWidth >= pn.clientWidth ? p0.getBoundingClientRect() : null;
            const k = r0 ? [Math.round(r0.left), Math.round(r0.top), Math.round(pn.scrollLeft), Math.round(pn.scrollTop)].join() : '';
            if (k && k === prev) same++; else same = 0; prev = k; }
          await new Promise(r => setTimeout(r, 120)); await raf();
          const p = document.querySelector('.atlas-pop'), pan = document.getElementById('sb-pan'); if (!p) { out.push('no card'); continue; }
          const pr = p.getBoundingClientRect(), wr = pan.getBoundingClientRect(); const L = Math.max(0, wr.left), R = Math.min(innerWidth, wr.right);
          if (pr.left < L - 1 || pr.right > R + 1 || pr.top < wr.top - 1 || pr.bottom > wr.bottom + 1) out.push(a + ': ' + Math.round(pr.left) + '–' + Math.round(pr.right) + ' / ' + Math.round(pr.top) + '–' + Math.round(pr.bottom) + ' in ' + Math.round(L) + '–' + Math.round(R) + ' / ' + Math.round(wr.top) + '–' + Math.round(wr.bottom)); }
        return { out, z: (document.querySelector('.act-zoom-n') || {}).textContent }; });
      ok(!pop.out.length, `390px zoomed (${pop.z}): the stop card stays inside the window for the first, middle and last stops${pop.out.length ? ' — ' + pop.out.join(' | ') : ''}`);
      /* the reveal law holds zoomed: the window never passes the earned edge */
      const rv = await pg.evaluate(async () => { const raf = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        let pan = document.getElementById('sb-pan'); pan.scrollLeft = 1e6; pan.dispatchEvent(new Event('scroll')); await new Promise(r => setTimeout(r, 80));
        /* a lazy file landing in that wait re-renders the board (it once measured a detached one: NaN%): measure the board
           on the page, once it is laid out and its camera is back */
        for (let i = 0; i < 60; i++) { pan = document.getElementById('sb-pan'); const b0 = pan && pan.firstElementChild; if (b0 && b0.offsetWidth > pan.clientWidth && pan.scrollLeft > 0) break; await raf(); }
        /* the sign hangs 1.2% short of the earned edge (trail.js livLayer): the edge is its left + 1.2 */
        const bd = pan.firstElementChild, sg = pan.querySelector('.mw-sign'); return { right: (pan.scrollLeft + pan.clientWidth) / bd.offsetWidth, edge: sg ? (parseFloat(sg.style.left) + 1.2) / 100 : null }; });
      /* and it REACHES the edge: a window that stayed short (a camera lost on a render) is not the reveal law holding */
      ok(rv.edge != null && rv.right <= rv.edge + 0.005 && rv.right >= rv.edge - 0.02, `390px zoomed: panning to the far right stops at the earned edge (${(rv.right * 100).toFixed(1)}% of the board, edge ${rv.edge != null ? (rv.edge * 100).toFixed(1) : '—'}%)`);
      /* the − button, by a tap; a region opens as drawn */
      await pg.tap('.act-zoom [data-arg="out"]'); await pg.waitForTimeout(300); const z2 = await Z(pg);
      await pg.evaluate(() => { app.trailToMap(); app.trailAct('honey|meadow'); }); await settle(pg); const z3 = await Z(pg);
      ok(z2.w < z1.w && z2.w > z0.w && z3.w === z0.w && z3.pct === '100%', `390px: a tap on − steps it back (${z1.w} → ${z2.w}px), and the region opens as drawn next time (${z3.w}px, ${z3.pct})`);
      const btn = await pg.evaluate(() => [...document.querySelectorAll('.act-zoom button')].map(e => { const r = e.getBoundingClientRect(); return Math.round(Math.min(r.width, r.height)) + ':' + e.getAttribute('aria-label'); }));
      ok(btn.length === 2 && btn.every(x => +x.split(':')[0] >= 44 && /Zoom (in|out)/.test(x)), `390px: the − and + buttons are 44px and named (${btn.join(', ')})`);
      /* the same pinch when the render that ENDS it draws the board before its painting is laid out — a fresh <img> can be
         a beat behind, from the cache too, and under load it was: the camera put back on a board with no width was clamped
         to 0, read back as the camera, and the window landed on the board's left edge (5.6% → 2.9%, one full-suite run in
         three). The painting is held back for that one render here, so every run is the slow machine. Proved by breaking:
         trail.js azStep/azAfter putting the camera back at once (before azLaid) → fails, 5.6% → 2.9%. */
      const box2 = await pg.evaluate(() => { const r = document.getElementById('sb-pan').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      const g0 = await fracAt(pg, box2.x);
      const touch2 = (type, d) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: box2.x - d, y: box2.y, id: 1 }, { x: box2.x + d, y: box2.y, id: 2 }] });
      await touch2('touchStart', 30); for (let d = 34; d <= 60; d += 4) { await touch2('touchMove', d); await pg.waitForTimeout(16); }
      await pg.evaluate(() => { const R = window.__R = window.render; window.render = function () { const out = R.apply(this, arguments);
        const i = document.querySelector('#sb-pan img'); if (i && !window.__held) { window.__held = 1; const s = i.getAttribute('src'); i.removeAttribute('src'); setTimeout(() => i.setAttribute('src', s), 150); }
        return out; }; });
      await touch2('touchEnd', 0); await pg.waitForTimeout(400); await settle(pg);
      const held = await pg.evaluate(() => { window.render = window.__R; return !!window.__held; }), g1 = await fracAt(pg, box2.x), z4 = await Z(pg);
      ok(held && /^(19|20)\d%$/.test(z4.pct) && Math.abs(g1 - g0) < 0.005, `390px: and when the render that ends the pinch draws the board before its painting is in, the point still stays put (${(g0 * 100).toFixed(1)}% → ${(g1 * 100).toFixed(1)}%, ${z4.pct}${held ? '' : ', the painting was never held'})`);
      /* …and when a render lands in the MIDDLE of the pinch (a lazy file arriving) and draws the board before its painting
         is in: the moves after it must start from the camera KEPT, not from the new board's 0,0 — under load the first
         pinch above went 5.6% → 4.0% and 5.6% → 2.9% in two runs of three. That render is forced here, its painting held
         back, so every run meets it. Proved by breaking: trail.js azLive reading the new board's scroll (not the kept
         camera) → fails. */
      await pg.evaluate(() => app.atlasZoom('fit')); await pg.waitForTimeout(300); await settle(pg);
      const h0 = await fracAt(pg, box2.x); let mv = 0;
      await touch2('touchStart', 30);
      for (let d = 34; d <= 60; d += 4) { await touch2('touchMove', d);
        if (++mv === 3) await pg.evaluate(() => { window.__held = 0; const R = window.render;
          window.render = function () { const out = R.apply(this, arguments); const i = document.querySelector('#sb-pan img');
            if (i && !window.__held) { window.__held = 1; const s = i.getAttribute('src'); i.removeAttribute('src'); setTimeout(() => i.setAttribute('src', s), 150); } return out; };
          render(); window.render = R; });
        await pg.waitForTimeout(16); }
      await touch2('touchEnd', 0); await pg.waitForTimeout(400); await settle(pg);
      const held2 = await pg.evaluate(() => !!window.__held), h1 = await fracAt(pg, box2.x), z5 = await Z(pg);
      ok(held2 && /^(19|20)\d%$/.test(z5.pct) && Math.abs(h1 - h0) < 0.005, `390px: and when a render lands in the middle of the pinch, before its painting is in, the point still stays put (${(h0 * 100).toFixed(1)}% → ${(h1 * 100).toFixed(1)}%, ${z5.pct}${held2 ? '' : ', the painting was never held'})`);
      ok(!errs.length, '390px zoom: no page errors' + (errs.length ? ': ' + errs[0] : ''));
      await pg.close(); }
    /* a desktop: the keys and a trackpad's pinch */
    { const { pg, errs } = await boot(b, 1280, 900);
      await pg.evaluate(() => { state.devUnlock = false; app.trailToMap(); app.trailAct('honey|forum'); }); await settle(pg);
      const a0 = await Z(pg); await pg.keyboard.press('+'); await pg.waitForTimeout(200); await pg.keyboard.press('='); await pg.waitForTimeout(250);
      const a1 = await Z(pg); await pg.keyboard.press('-'); await pg.waitForTimeout(250); const a2 = await Z(pg);
      await pg.keyboard.press('0'); await pg.waitForTimeout(250); const a3 = await Z(pg);
      ok(a1.pct === '156%' && Math.abs(a1.w / a0.w - 1.5625) < 0.03 && a2.pct === '125%' && a3.pct === '100%' && a3.w === a0.w,
        `1280px: + and = zoom in (${a1.pct}, ${a0.w} → ${a1.w}px), − steps out (${a2.pct}), 0 shows the whole board (${a3.pct})`);
      const r = await pg.evaluate(() => { const b = document.getElementById('sb-pan').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
      await pg.mouse.move(r.x, r.y); await pg.keyboard.down('Control'); await pg.mouse.wheel(0, -240); await pg.keyboard.up('Control'); await pg.waitForTimeout(500);
      const a4 = await Z(pg);
      ok(a4.w > a0.w * 1.5 && a4.scale === 1, `1280px: a trackpad's pinch (Ctrl + the wheel) zooms the board, not the page (${a0.w} → ${a4.w}px)`);
      ok(!errs.length, '1280px zoom: no page errors' + (errs.length ? ': ' + errs[0] : ''));
      await pg.close(); }
  }

  await b.close();
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
