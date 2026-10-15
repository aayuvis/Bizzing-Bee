/* quiz-opts-fit.cjs — on a phone, every answer of every Word Lore question is a whole 44px target: nothing lies over it
   (lore.js, the phone rule for `.qz-opt`, 15 Oct 2026).

   Why: full run 19 failed touch-targets once on a Word Lore round — an answer 368×61 whose top did not take a tap. The
   answers sit in the kit stage's control row, which a phone holds to the bottom 38% (saga2.css `.sg-st-ctl{max-height:
   38cqh}`, the thumb band T15 measures). Four answers that each wrap to two lines stood 265px tall in a 234px row at
   390×844; the row is bottom-aligned, so the list ran 31px up out of it and the play region above lay over the first
   answer's top 14px — a tap there landed on nothing. Probed: 18 of 250 Meanings questions (7%) at 390. touch-targets
   meets one random question, so it caught it one run in many. The phone rule now sets the answers tighter (min-height
   44px, padding 5px 10px, line-height 1.22): four two-line answers fit the row (≤ 214px), and none is cut further.

   The page's Math.random is seeded (as games-bots.mjs seeds it), so the same rounds are drawn every run. At 390×844
   (touch), for ROUNDS rounds of Meanings, Idioms and Roots, every question:
     1. every answer's 44px circle, hit-tested at eight points, lands on the answer (nothing over it, nothing clipped);
     2. the answer list does not start above its control row (no list running up into the play region).
   Proved by breaking (15 Oct 2026; a scratch root of symlinks with lore.js replaced, SB_ROOT): the phone rule as it was
   (`min-height:46px;padding:8px 11px`) → 5 fail: Meanings 11 answers covered and 39 lists above their row (up to 17px),
   Idioms 1 covered and 25 above, Roots 1 above. (~30 s.)
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/quiz-opts-fit.cjs                                             */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const W = require('./lib/wait.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
const ROUNDS = +process.env.ROUNDS || 8;
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 400, lists: { journey: { xp: 30 } }, activeList: 'journey' };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => { let s = 0x5eed01; Math.random = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; });
  await ctx.addInitScript((k) => { if (!localStorage.getItem('t_qf')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [k] })); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_qf', '1'); } }, KID);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
  await pg.goto('file://' + ROOT + '/index.html'); await W.booted(pg);
  await pg.evaluate(() => new Promise((r) => SB_LAZY.need(['words1', 'quizhubs', 'arcade', 'sents', 'fig', 'lore'], r)));
  await pg.evaluate(() => Promise.all([1, 2, 3, 4, 5].map((lv) => new Promise((r) => ttNeed(lv, r)))));
  await pg.addStyleTag({ content: W.STILL });   /* measure the layout, not a flip caught mid-way */
  for (const mode of ['meanings', 'idioms', 'roots']) {
    let n = 0, two = 0; const covered = [], above = [];
    for (let k = 0; k < ROUNDS; k++) {
      await pg.evaluate((m) => app.openLore(m), mode);
      const up = await W.until(pg, () => state.qz && state.qz.phase === 'play' && !!document.querySelector('.qz-opt'), null, 30000);
      if (!up) { covered.push('round ' + k + ' never opened'); break; }
      const nq = await pg.evaluate(() => state.qz.qs.length);
      for (let i = 0; i < nq; i++) {
        const r = await pg.evaluate(async (i) => { const g = state.qz; g.i = i; g.picked = null; g.held = false; g.qAt = 0; render();
          await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
          const word = ((g.qs[i] || {}).word || {}).w || ('#' + i);
          const out = { cov: [], above: null, two: 0 }; const opts = [...document.querySelectorAll('.qz-opt:not(.gone)')];
          const list = document.querySelector('.qz-opts'), row = list && list.closest('.sg-st-ctl');
          if (list && row && list.getBoundingClientRect().top < row.getBoundingClientRect().top - 0.5) out.above = word + ' (' + Math.round(row.getBoundingClientRect().top - list.getBoundingClientRect().top) + 'px above its row)';
          for (const e of opts) { e.scrollIntoView({ block: 'center', inline: 'center' }); await new Promise((r) => requestAnimationFrame(r));
            const q = e.getBoundingClientRect(), cx = (q.left + q.right) / 2, cy = (q.top + q.bottom) / 2; const ot = e.querySelector('.qz-ot'); if (ot && ot.getBoundingClientRect().height / (parseFloat(getComputedStyle(ot).lineHeight) || 17) > 1.5) out.two++;
            const pts = [[-15, -15], [0, -21], [15, -15], [-21, 0], [21, 0], [-15, 15], [0, 21], [15, 15]];
            const miss = pts.map(([dx, dy]) => [dx, dy, document.elementFromPoint(cx + dx, cy + dy)]).filter(([, , h]) => !(h && (h === e || e.contains(h))));
            if (miss.length) { const [dx, dy, h] = miss[0]; out.cov.push(word + ': "' + e.textContent.trim().slice(1, 24) + '" ' + Math.round(q.width) + '×' + Math.round(q.height) + ' at ' + dx + ',' + dy + ' → ' + (h ? h.tagName.toLowerCase() + '.' + String(h.className || '').split(' ')[0] : 'nothing')); } }
          window.scrollTo(0, 0); return out; }, i);
        n++; two += r.two ? 1 : 0; covered.push(...r.cov); if (r.above) above.push(r.above);
      }
      await pg.evaluate(() => { try { app.qzBack(); } catch (e) {} });
    }
    ok(n >= ROUNDS * 5 && !covered.length, `${mode}: every answer of ${n} questions (${two} with an answer on two lines) is a whole 44px target at 390×844` + (covered.length ? ` — ${covered.length} covered: ` + covered.slice(0, 3).join(' | ') : ''));
    ok(!above.length, `${mode}: no answer list runs up out of its control row` + (above.length ? ` — ${above.length}: ` + above.slice(0, 3).join(' | ') : ''));
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
