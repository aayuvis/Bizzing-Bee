/* THE PLAY TAB IS THE LINEUP, AND IT HAS NO BLANK SPACE — @check
   (2 Oct 2026, owner: "dont like the blank space in the game hub"; REWRITTEN 4 Oct 2026 for the games
   spec §3.1 lineup — owner decision 1, "one in, one out". The old version pinned four large tiles
   (Mock Bee, Bizzillionaire, Grand Prix, Honeycomb) over one grid with no headings; the lineup replaces
   that hub on purpose, so this test was rewritten deliberately, not loosened. The rules it kept:
   every row full, large painted tiles for the flagships, no hollow tile, the child's own best and no
   "beat it", one level chip per card that really steps.)
   (5 Oct 2026, owner: "we need the guess the word of the day game back" — "its own card again" — "come back
   as it was". Rewritten deliberately, not loosened: Daily Buzz is in the Play door again and out of GONE, and
   it carries NO level chip — its word is the same for every child, as it was — so the chip check now holds
   every other card to a labelled chip, holds Daily Buzz to none, and fails if any other card drops its chip
   the same way.)

   - three doors in order — Compete · Train · Play — and the cards in SB_PLAY_CARDS, in that order:
     Mock Spelling Bee (and Mock Analogy Bee beside it, two half banners since 9 Oct 2026 — ONLY in tester mode since 10 Oct,
     see below) · the three hubs (named from SB_HUB_NAMES, never typed) and Daily Bee · Bee Grand
     Prix, Type Blaster, Honeycomb Run, Daily Buzz (Word Forge only when its table is signed)
   (10 Oct 2026, owner — the road to 4.5, decision §1.2/P0.4: "until all three rounds pass: the Analogies tab, the
   lessons, Mock Analogy Bee and Word Forge stay behind tester mode". Updated deliberately, not loosened: a child's
   Compete door is Mock Spelling Bee alone, filling the row; a tester's is the two half banners, and both are measured.
   Proved by breaking: Mock Analogy Bee shown to everyone → the child's lineup, hub names and full-row checks: 5 fail.)
   - none of the cards that left: Bizzillionaire, Beat the Buzzer, Magic Squares, Word Quiz,
     Bee Trivia, Word Snake, Unscramble Stars, Spell Scene
   - every row of every door is full at 1180 (4 columns) and 390 (2), with Word Forge hidden AND shown
   - the flagships are large painted tiles (Mock Bee half its row on a desktop, the whole row on a phone, the Grand Prix two columns, its
     painting loads); cards in a row are one height; no small tile is hollow
   - a level chip on every card (SB_LEVEL.chip), labelled, and a tap steps it — except Daily Buzz, which has none
   - a card says "Coming" exactly when its opener is not on the page yet
   - (audit v4 G9) a game the child has scored in shows their best, quietly; none where they have not
   - renaming a hub (SB_HUB_NAMES) renames its card
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/arcade-hub.cjs                       */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const { booted, until, still } = require('./lib/wait.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const SEED = { theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0,
  children: [{ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 40, lists: { journey: { xp: 12 } }, activeList: 'journey' }] };
const GONE = ['Bizzillionaire', 'Beat the Buzzer', 'Magic Squares', 'Word Quiz', 'Bee Trivia', 'Word Snake', 'Unscramble Stars', 'Spell Scene'];

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || (fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined) });
  const errs = [];
  for (const vp of [{ n: 'desktop', w: 1180, h: 900, cols: 4 }, { n: 'phone', w: 390, h: 844, cols: 2, m: true }]) {
    const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: !!vp.m, hasTouch: !!vp.m });
    await ctx.addInitScript(s => { try { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_splash', '0'); localStorage.setItem('sb_arc_best', JSON.stringify({ beeGrandPrix: 1240, typeBlaster: 87 })); localStorage.setItem('t_seed', '1'); } } catch (e) {} }, SEED);
    const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(vp.n + ': ' + e.message));
    await pg.goto('file://' + ROOT + '/index.html'); await booted(pg);
    await pg.evaluate(() => { state.screen = 'app'; app.setNav('games'); });
    await until(pg, () => document.querySelectorAll('.pl-door').length >= 3); await still(pg);
    const measure = () => pg.evaluate(async (GONE) => {
      const doors = [...document.querySelectorAll('.pl-door')].map(d => {
        const grid = d.querySelector('.pl-grid'); const gr = grid.getBoundingClientRect();
        const cards = [...grid.children]; const rows = {};
        cards.forEach(el => { const r = el.getBoundingClientRect(); const k = Math.round(r.top); (rows[k] = rows[k] || []).push(r); });
        const full = Object.values(rows).every(rs => { const l = Math.min(...rs.map(r => r.left)), rr = Math.max(...rs.map(r => r.right)); return Math.abs(l - gr.left) <= 2 && Math.abs(rr - gr.right) <= 2; });
        const even = Object.values(rows).every(rs => new Set(rs.map(r => Math.round(r.height))).size === 1);
        return { id: d.dataset.door, head: (d.querySelector('.pl-door-h') || {}).textContent, keys: cards.map(el => el.dataset.card), full, even, rows: Object.keys(rows).length };
      });
      const cards = [...document.querySelectorAll('.pl-card')];
      const titles = cards.map(el => (el.querySelector('.arc-hero-title, .arc-tile-title') || {}).textContent.trim());
      const gaps = [...document.querySelectorAll('.pl-grid > .arc-tile')].map(t => { const bl = t.querySelector('.arc-tile-blurb'), cta = t.querySelector('.arc-cta'); return Math.round(cta.getBoundingClientRect().top - bl.getBoundingClientRect().bottom); });
      const big = async k => { const el = document.querySelector('.pl-card[data-card="' + k + '"]'); if (!el) return null; const r = el.getBoundingClientRect(), g = el.parentElement.getBoundingClientRect();
        const img = el.querySelector('.arc-hero-img'); const u = img ? (getComputedStyle(img).backgroundImage.match(/url\("?([^")]+)"?\)/) || [])[1] : null;
        const loaded = u ? await new Promise(res => { const i = new Image(); i.onload = () => res(i.naturalWidth > 0); i.onerror = () => res(false); i.src = u; }) : null;
        return { hero: !!el.querySelector('.arc-hero'), share: r.width / g.width, painted: !!u, loaded }; };
      const coming = cards.map(el => { const k = el.dataset.card, o = SB_PLAY_CARDS.find(x => x.k === k);
        return { k, says: /\bComing\b/.test(el.innerText), live: o.arcade ? !!SB_ARCADE_GAMES.find(x => x.k === k) : typeof app[o.open] === 'function' }; });
      const best = Object.fromEntries(cards.map(el => [el.dataset.card, ((el.innerText || '').match(/Best [\d,]+/) || [''])[0]]));
      return { doors, titles, gaps, mb: await big('mockbee'), gp: await big('beeGrandPrix'), coming, best,
        chips: cards.map(el => (el.querySelector('.sb-lvchip') || {}).getAttribute ? el.querySelector('.sb-lvchip').getAttribute('aria-label') : ''),
        nolevel: cards.map(el => !!(SB_PLAY_CARDS.find(x => x.k === el.dataset.card) || {}).nolevel),
        gone: (() => { const t = document.querySelector('.sb-content, #root').innerText; return GONE.filter(n => t.includes(n)); })(),
        names: ['gym', 'lore', 'hive'].map(k => SB_HUB_NAMES[k]),
        pressure: cards.filter(t => /beat (it|your|that)|new record|can you beat|try to beat|to beat/i.test(t.innerText)).length };
    }, GONE);
    const T = vp.n; const r = await measure();
    ok(r.doors.map(d => d.id + ':' + d.head).join() === 'compete:Compete,train:Train,play:Play', `${T}: three doors in order — ${r.doors.map(d => d.head).join(' · ')}`);
    const want = { compete: ['mockbee'], train: ['gym', 'lore', 'hive', 'dailyBee'], play: ['beeGrandPrix', 'typeBlaster', 'honeycombRun', 'dailyBuzz'] };
    ok(r.doors.every(d => JSON.stringify(d.keys) === JSON.stringify(want[d.id])), `${T}: the lineup a child sees, door by door — ${r.doors.map(d => d.keys.join('/')).join(' | ')}`);
    ok(r.titles.slice(1, 4).join() === r.names.join(), `${T}: the hubs are named from SB_HUB_NAMES (${r.titles.slice(1, 4).join(', ')})`);
    ok(!r.gone.length, `${T}: none of the cards that left are on the tab` + (r.gone.length ? ' — ' + r.gone.join(', ') : ''));
    ok(r.doors.every(d => d.full), `${T}: every row of every door is full (${r.doors.map(d => d.id + ' ' + d.rows + ' row' + (d.rows > 1 ? 's' : '')).join(', ')})`);
    ok(r.doors.every(d => d.even), `${T}: the cards in a row are one height`);
    /* a child: Mock Analogy Bee is behind the analogy gate, so Mock Spelling Bee stands alone and takes its whole row */
    ok(r.mb && r.mb.hero && r.mb.share > 0.97, `${T}: a child's Mock Spelling Bee is a large tile across its whole door (${r.mb && Math.round(r.mb.share * 100)}%)`);
    /* a tester: since 9 Oct 2026 (owner: "shrinking mock spelling bee banner to half") Mock Spelling Bee is a half banner
       beside Mock Analogy Bee: a large tile half its door on a desktop, the whole row on a phone */
    await pg.evaluate(() => { state.tester = true; render(); }); await still(pg);
    const rt = await measure();
    ok(JSON.stringify(rt.doors[0].keys) === '["mockbee","mockAnalogy"]' && rt.doors.every(d => d.full) && rt.mb && rt.mb.hero && (T === 'phone' ? rt.mb.share > 0.97 : rt.mb.share > 0.45 && rt.mb.share < 0.55),
      `${T}, tester mode: Mock Spelling Bee is a large tile, half its door beside Mock Analogy Bee, every row full (${rt.doors[0].keys.join('/')}, ${rt.mb && Math.round(rt.mb.share * 100)}%)`);
    await pg.evaluate(() => { state.tester = false; render(); }); await still(pg);
    ok(r.gp && r.gp.hero && r.gp.painted && r.gp.loaded && r.gp.share > (vp.cols === 4 ? 0.45 : 0.97), `${T}: the Grand Prix is a large painted tile and its painting loads (${r.gp && Math.round(r.gp.share * 100)}% of the row)`);
    ok(r.gaps.length && r.gaps.every(g => g >= 0 && g <= 60), `${T}: no small tile is hollow (≤ three lines of slack) — words to Play button ${Math.max(...r.gaps)}px at most`);
    const keyed = r.doors.flatMap(d => d.keys), chipless = keyed.filter((k, i) => r.nolevel[i]);
    ok(r.chips.length === r.titles.length && r.chips.every((a, i) => r.nolevel[i] ? a === '' : /^Word level for .+: \w+\. Tap for \w+$/.test(a)), `${T}: a labelled level chip on every card but Daily Buzz, and none on Daily Buzz (${r.chips.filter(Boolean).length}/${r.titles.length})`);
    ok(chipless.join() === 'dailyBuzz', `${T}: Daily Buzz is the only card with no level (${chipless.join(', ') || 'none'})`);
    ok(r.coming.every(x => x.says === !x.live), `${T}: a card says "Coming" exactly when its opener is missing — coming: ${r.coming.filter(x => x.says).map(x => x.k).join(', ') || 'none'}`);
    ok(r.best.beeGrandPrix === 'Best 1,240' && r.best.typeBlaster === 'Best 87' && r.best.honeycombRun === '' && !r.pressure,
      `${T}: a game's card shows the child's own best (Grand Prix ${r.best.beeGrandPrix || '—'}, Type Blaster ${r.best.typeBlaster || '—'}), none where they have none, and no "beat it" anywhere`);
    /* the chip really steps the level, and the level is the child's (SB_LEVEL) */
    const step = await pg.evaluate(() => { const ch = document.querySelector('.pl-card[data-card="typeBlaster"] .sb-lvchip'); const before = ch.textContent.trim(); ch.click();
      return { before, after: document.querySelector('.pl-card[data-card="typeBlaster"] .sb-lvchip').textContent.trim(), rec: SB_LEVEL.LABEL[SB_LEVEL.get('typeBlaster')] }; });
    ok(step.before !== step.after && step.after.startsWith(step.rec), `${T}: tapping a chip steps the level (${step.before} → ${step.after})`);
    /* Word Forge, signed: still every row full */
    await pg.evaluate(() => { window.__forge = window.SB_FORGE; window.SB_FORGE = Object.assign(Object.create(window.SB_FORGE || null), { signedOff: true }); render(); }); await still(pg);
    const f = await measure();
    ok(f.doors.find(d => d.id === 'play').keys.includes('wordForge') && f.doors.every(d => d.full), `${T}: with Word Forge's table signed it joins Play, and every row is still full (${f.doors.find(d => d.id === 'play').keys.join('/')})`);
    /* a renamed hub */
    await pg.evaluate(() => { window.SB_FORGE = window.__forge; SB_HUB_NAMES.gym = 'Buzz Lab'; render(); });
    const rn = await pg.evaluate(() => (document.querySelector('.pl-card[data-card="gym"] .arc-tile-title') || {}).textContent);
    ok(rn === 'Buzz Lab', `${T}: renaming a hub in SB_HUB_NAMES renames its card (${rn})`);
    await ctx.close();
  }
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
