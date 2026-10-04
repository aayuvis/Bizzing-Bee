/* THE ARCADE HUB HAS NO BLANK SPACE (2 Oct 2026, owner: "dont like the blank space in the game hub") — @check

   - no section headings ("The games — pick your level on each", "More to play" are gone)
   - Bee Grand Prix and Honeycomb Run are LARGE painted tiles beside the Mock Bee and the
     Bizzillionaire ladder: four large tiles, all the same height, both paintings load
   - one game grid with fixed columns (4, or 2 on a phone) and a tile count that fills every row
   - no small tile is hollow (the per-game level is one chip on the picture, not a two-row
     strip that stretched its row and left a gap above the Play button in the others)
   - (audit v4 G9) each game the child has scored in shows their own best on its tile, quietly —
     "Best 1,240" — and a game they have not scored in shows none; no "beat it" on any tile
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/arcade-hub.cjs                       */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const SEED = { theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0,
  children: [{ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 40, lists: { journey: { xp: 12 } }, activeList: 'journey' }] };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || (fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined) });
  const errs = [];
  for (const vp of [{ n: 'desktop', w: 1180, h: 900, cols: 4 }, { n: 'phone', w: 390, h: 844, cols: 2, m: true }]) {
    const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: !!vp.m, hasTouch: !!vp.m });
    await ctx.addInitScript(s => { try { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_splash', '0'); localStorage.setItem('sb_arc_best', JSON.stringify({ beeGrandPrix: 1240, typeBlaster: 87 })); localStorage.setItem('t_seed', '1'); } } catch (e) {} }, SEED);
    const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(vp.n + ': ' + e.message));
    await pg.goto('file://' + ROOT + '/index.html'); await pg.waitForTimeout(2500);
    await pg.evaluate(() => { state.screen = 'app'; app.setNav('games'); }); await pg.waitForTimeout(1500);
    const r = await pg.evaluate(async () => {
      const heroes = [...document.querySelectorAll('.arc-hero')];
      const imgs = heroes.map(h => h.querySelector('.arc-hero-img')).filter(Boolean).map(e => (getComputedStyle(e).backgroundImage.match(/url\("?([^")]+)"?\)/) || [])[1]);
      const loaded = await Promise.all(imgs.map(u => new Promise(res => { const i = new Image(); i.onload = () => res(i.naturalWidth > 0); i.onerror = () => res(false); i.src = u; })));
      const grid = document.querySelector('.arc-grid');
      const tiles = grid ? [...grid.children] : [];
      const cols = grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length : 0;
      /* CELLS, not tiles (4 Oct 2026, games spec §4.2): the Spelling Gym card spans two columns — one card
         in for Beat the Buzzer and Magic Squares — which is the "wider tile rather than a hole" rule */
      const cells = tiles.reduce((a, t) => { const cs = getComputedStyle(t); return a + (+((/span (\d+)/.exec(cs.gridColumnStart + ' ' + cs.gridColumnEnd) || [])[1]) || 1); }, 0);
      const rows = grid ? new Set(tiles.map(t => Math.round(t.getBoundingClientRect().top))).size : 0;
      /* a hollow tile: the gap between the end of its words and the top of its Play button */
      const gaps = tiles.map(t => { const bl = t.querySelector('.arc-tile-blurb'), cta = t.querySelector('.arc-cta'); if (!bl || !cta) return -1;
        return Math.round(cta.getBoundingClientRect().top - bl.getBoundingClientRect().bottom); });
      const txt = document.body.innerText;
      return { titles: heroes.map(h => h.querySelector('.arc-hero-title').textContent.trim()), heights: heroes.map(h => Math.round(h.getBoundingClientRect().height)),
        painted: heroes.filter(h => h.querySelector('.arc-hero-img')).map(h => h.querySelector('.arc-hero-title').textContent.trim()), loaded,
        sech: document.querySelectorAll('.arc-sech').length + (/The games — pick your level|More to play/.test(txt) ? 1 : 0),
        cols, n: tiles.length, cells, rows, gaps, smallGP: tiles.some(t => /Bee Grand Prix|Honeycomb Run/.test(t.textContent)),
        strips: document.querySelectorAll('.arc-diff').length, chips: [...document.querySelectorAll('.arc-lvl')].map(e => e.getAttribute('aria-label')),
        best: Object.fromEntries([...document.querySelectorAll('.arc-hero, .arc-grid > *')].map(t => { const ti = t.querySelector('.arc-hero-title, .arc-tile-title');
          const m = (t.innerText || '').match(/Best [\d,]+/); return [ti ? ti.textContent.trim() : '?', m ? m[0] : '']; })),
        pressure: [...document.querySelectorAll('.arc-hero, .arc-grid > *')].filter(t => /beat (it|your|that)|new record|can you beat|try to beat|to beat/i.test(t.innerText)).length };
    });
    const T = vp.n;
    ok(r.sech === 0, `${T}: no section headings on the hub`);
    ok(JSON.stringify(r.titles) === JSON.stringify(['Mock Spelling Bee', 'Who Wants to Be a Bizzillionaire', 'Bee Grand Prix', 'Honeycomb Run']), `${T}: four large tiles — ${r.titles.join(' · ')}`);
    ok(new Set(r.heights).size === 1, `${T}: the large tiles are all one height (${r.heights.join(', ')})`);
    ok(r.painted.join() === 'Bee Grand Prix,Honeycomb Run' && r.loaded.length === 2 && r.loaded.every(Boolean), `${T}: the race and the maze wear their paintings, and both load`);
    ok(!r.smallGP, `${T}: the race and the maze are not repeated as small tiles`);
    ok(r.cols === vp.cols && r.n > 0 && r.cells % r.cols === 0 && r.rows === r.cells / r.cols, `${T}: ${r.n} small tiles (${r.cells} cells) in ${r.cols} columns and ${r.rows} rows — every row full, no blank cells`);
    ok(r.gaps.every(g => g >= 0 && g <= 60), `${T}: no small tile is hollow (≤ three lines of slack) — words to Play button ${Math.max(...r.gaps)}px at most (${r.gaps.join(', ')})`);
    ok(r.strips === 0 && r.chips.length >= 1 && r.chips.every(a => /Word level for .+: \w+\. Tap for \w+/.test(a)), `${T}: the word level is one labelled chip per game, not a strip (${r.chips.length})`);
    ok(r.best['Bee Grand Prix'] === 'Best 1,240' && r.best['Type Blaster'] === 'Best 87' && r.best['Word Snake'] === '' && r.best['Honeycomb Run'] === '' && !r.pressure,
      `${T}: a game's tile shows the child's own best where they have one (Grand Prix ${r.best['Bee Grand Prix'] || '—'}, Type Blaster ${r.best['Type Blaster'] || '—'}), none where they have not, and no "beat it" anywhere`);
    /* the chip really steps the level */
    const step = await pg.evaluate(() => { const ch = document.querySelector('.arc-lvl'); if (!ch) return null; const before = ch.textContent.trim(); ch.click(); return { before, after: (document.querySelector('.arc-lvl') || {}).textContent.trim() }; });
    ok(step && step.before !== step.after, `${T}: tapping the chip steps the level (${step && step.before} → ${step && step.after})`);
    await ctx.close();
  }
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
