/* WHERE ONE ROW IS PROMISED, IT IS ONE ROW (FIX2 #2 and #4, 3 Oct 2026) — @check

   1. An avatar pack holds exactly eight and renders as ONE row. The pack row was auto-fill at
      112px, so at a 1280px desktop it fit seven and every pack wrapped 7 + 1, leaving its
      Legendary alone on a row. Now: eight across wherever a pack has room (every desktop width
      measured here), four and four below that — never 7 + 1 or a ragged 3 + 3 + 2 — in My Hive
      AND the Shop, with nothing on a card spilling out of it, on a 360px phone too.
   2. The landing header is one line on a phone. At 390 and 360 "Start free" wrapped onto a line
      of its own. Now every control sits on the bar's one line, "Start free" whole and on screen.
   3. A game's header is one line on a phone (audit v4 §4): every arcade engine and Bizzillionaire.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/one-row.cjs                         */
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..') + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 40, lists: { journey: { xp: 30 } }, activeList: 'journey' };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  /* ---- 1. packs ---- */
  const WANT = { 1440: '8', 1280: '8', 1180: '8', 1024: '8', 820: '4+4', 641: '4+4', 390: '4+4', 360: '4+4' };
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(k => { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [k] })); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } }, KID);
  const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(URL); await pg.waitForTimeout(2500);
  const bad = [], spill = [];
  for (const [w, want] of Object.entries(WANT)) {
    await pg.setViewportSize({ width: +w, height: 900 });
    for (const where of ['hive', 'shop']) {
      await pg.evaluate(x => { if (x === 'hive') { state.collTab = 'avatars'; app.openCollection(); } else app.openShop('avatars'); }, where); await pg.waitForTimeout(450);
      const r = await pg.evaluate(() => {
        const rows = [...document.querySelectorAll('.bz-pack .bz-av-row')];
        const shapes = rows.map(row => { const kids = [...row.children]; const tops = [...new Set(kids.map(k => Math.round(k.getBoundingClientRect().top)))];
          return kids.length + ':' + tops.map(t => kids.filter(k => Math.round(k.getBoundingClientRect().top) === t).length).join('+'); });
        const spill = [...document.querySelectorAll('.bz-pack .bz-av')].filter(a => { const r = a.getBoundingClientRect();
          return [...a.querySelectorAll('*')].some(k => { const q = k.getBoundingClientRect(); return q.width > 0 && (q.left < r.left - 1 || q.right > r.right + 1); }); }).map(a => a.dataset.av);
        return { n: rows.length, shapes: [...new Set(shapes)], spill, ow: document.documentElement.scrollWidth > innerWidth + 1 };
      });
      const good = r.n >= 12 && r.shapes.length === 1 && r.shapes[0] === '8:' + want;
      if (!good) bad.push(`${w}px ${where}: ${r.n} packs, ${r.shapes.join(' / ')} (want 8:${want})`);
      if (r.spill.length || r.ow) spill.push(`${w}px ${where}: ${r.ow ? 'page overflows; ' : ''}${r.spill.slice(0, 4).join(', ')}`);
    }
  }
  ok(!bad.length, 'every pack is eight avatars in ONE row on a desktop (1024–1440) and 4 + 4 on a tablet or phone (820–360), in My Hive and the Shop' + (bad.length ? ' — ' + bad.slice(0, 4).join(' | ') : ''));
  ok(!spill.length, 'nothing on an avatar card spills out of it at any of those widths' + (spill.length ? ' — ' + spill.slice(0, 4).join(' | ') : ''));
  await ctx.close();

  /* ---- 2. the landing header ---- */
  const lbad = [];
  for (const w of [1280, 414, 390, 360]) {
    const c2 = await b.newContext({ viewport: { width: w, height: 800 }, hasTouch: w < 600 });
    await c2.addInitScript(() => { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } });
    const p2 = await c2.newPage(); p2.on('pageerror', e => errs.push(e.message));
    await p2.goto(URL); await p2.waitForTimeout(1800);
    const r = await p2.evaluate(() => {
      const cta = document.querySelector('[data-act="goSignup"]'); const bar = cta && cta.parentElement;
      if (!bar || state.screen !== 'landing') return { none: true };
      const ctr = el => { const q = el.getBoundingClientRect(); return (q.top + q.bottom) / 2; };
      const c0 = ctr(cta); const kids = [...bar.children].filter(k => k.getBoundingClientRect().width > 0);
      const q = cta.getBoundingClientRect();
      return { off: kids.filter(k => Math.abs(ctr(k) - c0) > 4).map(k => k.textContent.trim().slice(0, 14)), whole: q.left >= 0 && q.right <= innerWidth && q.height < 48,
        oneLine: getComputedStyle(cta).whiteSpace === 'nowrap' || cta.getClientRects().length === 1, ow: document.documentElement.scrollWidth > innerWidth + 1 };
    });
    if (r.none || r.off.length || !r.whole || r.ow) lbad.push(`${w}px: ${JSON.stringify(r)}`);
    await c2.close();
  }
  ok(!lbad.length, 'the landing header is one line at 1280, 414, 390 and 360 — "Start free" whole, on screen, beside the rest' + (lbad.length ? ' — ' + lbad.join(' | ') : ''));

  /* ---- 3. a game's header is one line on a phone (audit v4 §4) ----
     "← Arcade" broke after its arrow and "Unscramble Stars" took two lines at 360 and 390. Every
     arcade engine's bar and the Bizzillionaire bar: each part on ONE line, all of them on the bar's
     one row, nothing past the right edge, and the back button a 44px target. */
  const hbad = [];
  for (const w of [390, 360]) {
    const c3 = await b.newContext({ viewport: { width: w, height: 800 }, isMobile: true, hasTouch: true });
    await c3.addInitScript(k => { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [k] })); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } }, KID);
    const p3 = await c3.newPage(); p3.on('pageerror', e => errs.push(e.message));
    await p3.goto(URL); await p3.waitForTimeout(2500);
    await p3.evaluate(() => new Promise(r => SB_LAZY.need('arcade', r)));
    const games = await p3.evaluate(() => (window.SB_ARCADE_GAMES || []).map(g => g.k));
    const measureBar = () => p3.evaluate(() => {
      const bar = document.querySelector('.arc-play-top, .bz-top'); if (!bar) return { none: true };
      const lines = el => { const rng = document.createRange(); rng.selectNodeContents(el);
        return new Set([...rng.getClientRects()].filter(r => r.height > 1 && r.width > 1).map(r => Math.round(r.top))).size; };
      const kids = [...bar.children].filter(k => k.getBoundingClientRect().width > 0 && (k.textContent || '').trim());
      const ctr = el => { const q = el.getBoundingClientRect(); return (q.top + q.bottom) / 2; };
      const back = bar.querySelector('.arc-play-back, .bz-back').getBoundingClientRect();
      return { name: (bar.querySelector('.arc-play-name, .bz-title') || {}).textContent, wrapped: kids.filter(k => lines(k) > 1).map(k => k.textContent.trim().slice(0, 18)),
        offRow: kids.filter(k => Math.abs(ctr(k) - ctr(kids[0])) > 6).map(k => k.textContent.trim().slice(0, 18)),
        past: kids.filter(k => k.getBoundingClientRect().right > innerWidth + 0.5).map(k => k.textContent.trim().slice(0, 18)), backH: Math.round(back.height) };
    });
    for (const k of games) {
      await p3.evaluate(g => app.arcadePlay(g), k); await p3.waitForTimeout(700);
      const r = await measureBar();
      if (r.none || r.wrapped.length || r.offRow.length || r.past.length || r.backH < 44) hbad.push(`${w}px ${k}: ${JSON.stringify(r)}`);
      await p3.evaluate(() => { const x = document.querySelector('#arc-back'); if (x) x.click(); }); await p3.waitForTimeout(200);
    }
    await p3.evaluate(() => app.openBizz()); await p3.waitForTimeout(600);
    const rb = await measureBar();
    if (rb.none || rb.wrapped.length || rb.offRow.length || rb.past.length || rb.backH < 44) hbad.push(`${w}px bizzillionaire: ${JSON.stringify(rb)}`);
    /* 4 Oct 2026 (games spec §3.1): the Play tab keeps three arcade cards — Grand Prix, Type Blaster and
       Honeycomb Run (Word Snake, Unscramble Stars and Spell Scene left) — so three is the floor, not six */
    if (games.length < 3) hbad.push(`${w}px: only ${games.length} arcade engines found`);
    await c3.close();
  }
  ok(!hbad.length, 'every game header is one line at 390 and 360 — "← Arcade" and the game\'s name each whole, on the bar\'s one row, the back button 44px tall' + (hbad.length ? ' — ' + hbad.slice(0, 4).join(' | ') : ''));
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
