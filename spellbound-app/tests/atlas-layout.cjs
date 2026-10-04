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
      Pack", and one "Show a grown-up": the same PIN-gated door. No paid board, no peek, no
      price, and never the words "ask a grown-up" (FIX-BEE v2 T3). A tester or a pack holder
      still sees all three continents and no line.
   4. The road sign at a region's earned edge is never cut by a phone's window (audit v4 §4).
   5. A region's board says what it teaches (audit v4 D2), read from its own stops.
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
        state.devUnlock = !!dev; app.trailAct('honey|' + act); await new Promise(res => setTimeout(res, 900));
        const args = [...document.querySelectorAll('.atlas-stop')].map(e => +e.dataset.arg);
        const pick = [0, 1, Math.floor(args.length / 2), args.length - 2, args.length - 1].filter((v, i, a) => v >= 0 && a.indexOf(v) === i);
        const out = [];
        for (const k of pick) { app.trailPick(args[k]); await new Promise(res => setTimeout(res, 650));
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
      o.said = lines.length === 1 && /^More continents come with the Advanced Pack\s*Show a grown-up$/.test(lines[0].innerText.replace(/\s+/g, ' ').trim());
      o.door = doors.length === 1 && doors[0].tagName === 'BUTTON' && lines[0].contains(doors[0]) && /^Show a grown-up$/.test(doors[0].textContent.trim());
      const bd = document.querySelector('.atlas-board'); o.under = !!(bd && lines[0] && lines[0].getBoundingClientRect().top >= bd.getBoundingClientRect().bottom);
      o.tall = doors[0] ? Math.round(doors[0].getBoundingClientRect().height) : 0;
      o.filled = doors[0] ? getComputedStyle(doors[0]).backgroundColor : '';
      o.paidNames = /Ultra Champions|THE LAST CONTINENT|90% GATES|Advanced Rounds/.test(t);
      state.pinDlg = null; doors[0].click(); await W(300); o.pin = !!state.pinDlg; o.noSheet = !state.showTiers && state.nav === 'trail'; state.pinDlg = null; render(); await W(200);
      /* a tester sees all three continents and no line */
      state.devUnlock = true; render(); await W(300);
      o.devBoards = document.querySelectorAll('.atlas-board').length; o.devLine = document.querySelectorAll('.atlas-more').length; state.devUnlock = false; render();
      return o; });
    ok(d.lines === 1 && d.said && d.door && d.doors === 1 && d.under, 'a free child\'s Atlas says ONE quiet line under the map — "More continents come with the Advanced Pack" — with one "Show a grown-up" ' + JSON.stringify(d));
    ok(d.boards === 1 && !d.peek && !d.paidNames, 'and draws no paid continent: one board, no "Look at the map", no Advanced Rounds or Ultra heading');
    ok(d.tall >= 44, 'its one button is a 44px target (' + d.tall + 'px)');
    ok(d.pin && d.noSheet, '"Show a grown-up" opens the grown-up PIN — the pack is drawn only behind it');
    ok(d.devBoards === 3 && d.devLine === 0, 'a tester (or a pack holder) still sees all three continents, and no line (' + d.devBoards + ' boards)');
    ok(!d.price && !d.askWords, 'no price and no "ask a grown-up" on the child\'s Atlas (FIX-BEE v2 T3)');
    ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
    await pg.close();
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
