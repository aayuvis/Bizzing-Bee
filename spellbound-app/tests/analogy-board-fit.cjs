/* analogy-board-fit.cjs — every stop on every Analogy Atlas board lies inside its board (analogy.js mapView, "a stop is
   placed on the road but never past the board's edge", 15 Oct 2026).

   Why: the board is a 16:9 painting with `overflow:hidden`, and a stop sits on its road wherever the road runs. Orchard
   Hill's road ends near the top, so its level check sat 18px below the board's top at 390 and the board cut off the top
   of its medallion and of its 44px circle (BUILD-reasoning.md item 2 — touch-targets.cjs measures only Twin Ponds' board,
   so nothing caught it); at 768 Bridge Peaks' first label ran 2px off the left. The stops are now clamped by their own
   half-size (the medallion and its focus ring on a narrow board, the label too on a wide one).

   For each of the four regions, at 360, 390, 768 and 1280 wide (light):
     1. every stop's medallion, with its 6px focus ring, lies inside the board;
     2. on a narrow board (labels hidden) the 44px circle round the medallion's centre lies inside the board too;
     3. on a wide board every label lies inside the board;
     4. no two stops' medallions overlap (a clamp must not stack two stops on one place).

   Proved by breaking (15 Oct 2026; a scratch root of symlinks with ONE file — analogy.js — replaced, the test run with
   SB_ROOT on it):
     · analogy.js as it was before the clamp (left/top straight from the road) → 8 fail: Orchard's level check at 360,
       390 and 768 (its ring 8.6–15px past the top, and its 44px circle on both phones), Orchard's Word families ring at
       360 and Bridge Peaks' Same meaning ring at 360 and 390 (past the top and the left — the first probe, without the
       ring, missed these two), and Bridge Peaks' Same meaning label 2.2px off the left at 768;
     · the narrow board's half-size cut to 16px (`.anl-stop{--hx:16px;--hy:16px}`) → 6 fail (the phones' rows above);
     · every stop's place set to one corner (`--x:0%;--y:0%`) → 16 fail (the overlap, every board at every width).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/analogy-board-fit.cjs                                         */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const W = require('./lib/wait.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const REGIONS = ['ponds', 'orchard', 'workshop', 'peaks'];
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'fox', theme: 'spellbound', coins: 0, lists: {}, unlockedThemes: ['spellbound'] };

const measure = (pg) => pg.evaluate(() => {
  const B = document.querySelector('.anl-board').getBoundingClientRect(), R = 6, out = { ring: [], c44: [], label: [], over: [], n: 0 };
  const inside = (r) => r.l >= B.left - 0.5 && r.r <= B.right + 0.5 && r.t >= B.top - 0.5 && r.b <= B.bottom + 0.5;
  const meds = [];
  document.querySelectorAll('.anl-board .anl-stop').forEach((s) => { out.n++;
    const name = s.getAttribute('aria-label'), m = s.querySelector('.anl-med').getBoundingClientRect();
    const cx = m.left + m.width / 2, cy = m.top + m.height / 2;
    if (!inside({ l: m.left - R, r: m.right + R, t: m.top - R, b: m.bottom + R })) out.ring.push(name + ` (top ${(m.top - R - B.top).toFixed(1)}, left ${(m.left - R - B.left).toFixed(1)})`);
    const l = s.querySelector('.anl-lab'), shown = l && l.getClientRects().length && getComputedStyle(l).display !== 'none';
    if (!shown && !inside({ l: cx - 22, r: cx + 22, t: cy - 22, b: cy + 22 })) out.c44.push(name);
    if (shown) { const lr = l.getBoundingClientRect(); if (!inside({ l: lr.left, r: lr.right, t: lr.top, b: lr.bottom })) out.label.push(name + ` (left ${(lr.left - B.left).toFixed(1)}, right ${(B.right - lr.right).toFixed(1)})`); }
    meds.push({ name, m }); });
  for (let i = 0; i < meds.length; i++) for (let j = i + 1; j < meds.length; j++) { const a = meds[i].m, b = meds[j].m;
    if (a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5) out.over.push(meds[i].name + ' / ' + meds[j].name); }
  out.W = Math.round(B.width); out.H = Math.round(B.height); return out; });

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  for (const w of [360, 390, 768, 1280]) {
    const phone = w < 500;
    const ctx = await b.newContext({ viewport: { width: w, height: phone ? 844 : 900 }, isMobile: phone, hasTouch: phone });
    await ctx.addInitScript((k) => { if (!localStorage.getItem('t_seed')) {
      localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [k] }));
      localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } }, KID);
    const pg = await ctx.newPage(); pg.on('pageerror', (e) => errs.push(w + ': ' + e.message));
    await pg.goto('file://' + ROOT + '/index.html'); await W.booted(pg);
    /* the tab is behind the analogy gate: open it as a tester (tests/analogies.cjs does the same) */
    await pg.evaluate(() => { state.tester = true; return new Promise((r) => SB_LAZY.need(['analogy'], r)); });
    for (const r of REGIONS) {
      await pg.evaluate((r) => app.openAnalogies(r), r);
      await W.until(pg, (r) => state.nav === 'analogy' && state.anl && state.anl.reg === r && state.anl.v === 'map' && !!document.querySelector('.anl-board .anl-stop'), r, 30000);
      const m = await measure(pg), T = `${w} · ${r} (${m.W}×${m.H}, ${m.n} stops)`;
      ok(m.n >= 4 && !m.ring.length, `${T}: every medallion and its focus ring lie inside the board` + (m.ring.length ? ' — ' + m.ring.join(', ') : ''));
      if (phone) ok(!m.c44.length, `${T}: every stop's 44px circle lies inside the board` + (m.c44.length ? ' — ' + m.c44.join(', ') : ''));
      if (!phone) ok(!m.label.length, `${T}: every label lies inside the board` + (m.label.length ? ' — ' + m.label.join(', ') : ''));
      ok(!m.over.length, `${T}: no two stops' medallions overlap` + (m.over.length ? ' — ' + m.over.slice(0, 3).join(', ') : ''));
    }
    await ctx.close();
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
