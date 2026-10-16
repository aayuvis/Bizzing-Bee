/* shelf-titles.cjs — a laid book's title shows only on its book (app3-library.js libShelf "A LAID BOOK'S TITLE WAITS FOR
   ITS BOOK", 15 Oct 2026).

   Why: the books lying flat on the Library's shelf are fixed 158×24 boxes with a white title over the spine's picture. Until
   the picture painted, the title stood on the bare shelf — light grey, 1.5:1 — and a11y-axe failed on a cold start (full
   run 22, and the first run after each container restart); a child on a slow connection saw the same. The title is now
   transparent (still the button's accessible name) until its picture has loaded once on the page.

   At 390×844 (light; the phone lays some books flat):
     1. the spine pictures held back (the route aborts them): every laid title is transparent, and axe finds no
        color-contrast violation on the shelf;
     2. the pictures let through: every laid title that has its picture shows (opacity 1), and keeps its name.
   Proved by breaking (15 Oct 2026, a scratch root with index.html replaced, SB_ROOT): the `.bk-lay:not(.in) .bk-lt` rule
   taken out → 2 fail (all 10 titles showing on the bare shelf; axe: book-08, book-18, book-champion). app3-library.js with
   no load handler on a laid book's picture (never marked `.in`) → check 2 fails (titles never show).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/shelf-titles.cjs                                             */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const W = require('./lib/wait.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const AXE = (() => { try { return require.resolve('axe-core/axe.min.js', { paths: [path.resolve(__dirname, '..', 'node_modules')] }); } catch (e) { return null; } })();
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'fox', theme: 'spellbound', coins: 0, lists: {} };

async function shelf(b, block) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  if (block) await ctx.route(/app-art\/spines\/[^/]+\.png/, (r) => r.abort());
  await ctx.addInitScript((k) => { if (!localStorage.getItem('t_st')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [k] })); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_st', '1'); } }, KID);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
  await pg.goto('file://' + ROOT + '/index.html'); await W.booted(pg);
  await pg.evaluate(() => { state.screen = 'app'; app.setMode('light'); app.setNav('explore'); });
  await W.until(pg, () => state.nav === 'explore' && document.querySelectorAll('#root .bk-lay').length > 0, null, 30000);
  return { ctx, pg, errs };
}
const titles = (pg) => pg.evaluate(() => [...document.querySelectorAll('#root .bk-lay')].map((b) => {
  const t = b.querySelector('.bk-lt'), im = b.querySelector('img');
  return { s: b.getAttribute('data-arg'), op: +getComputedStyle(t).opacity, name: (b.getAttribute('title') || '') && t.textContent.trim(), img: !!(im && im.complete && im.naturalWidth > 0) }; }));

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  /* 1. the pictures held back */
  { const { ctx, pg, errs } = await shelf(b, true);
    await W.quietRender(pg, 300); await pg.addStyleTag({ content: W.STILL }); await W.frames(pg, 2);
    const t = await titles(pg);
    ok(t.length >= 2 && t.every((x) => x.op === 0 && x.name), `with the spine pictures held back, all ${t.length} laid titles are transparent (and keep their names)` + (t.some((x) => x.op !== 0) ? ' — showing: ' + t.filter((x) => x.op !== 0).map((x) => x.s).join(', ') : ''));
    if (!AXE) ok(false, 'axe-core is not installed — run `npm install` in spellbound-app/');
    else { await pg.addScriptTag({ path: AXE });
      const v = await pg.evaluate(async () => { const r = await axe.run(document.querySelector('#root .bk-books') || document, { runOnly: { type: 'rule', values: ['color-contrast'] }, resultTypes: ['violations'] });
        return r.violations.flatMap((x) => x.nodes.map((n) => n.target.join(' '))); });
      ok(!v.length, 'axe finds no color-contrast violation on the shelf while its pictures are out' + (v.length ? ' — ' + v.slice(0, 4).join(', ') : '')); }
    ok(!errs.length, 'no page errors (held back)' + (errs.length ? ': ' + errs[0] : ''));
    await ctx.close(); }
  /* 2. the pictures let through */
  { const { ctx, pg, errs } = await shelf(b, false);
    await W.until(pg, () => [...document.querySelectorAll('#root .bk-lay img')].every((i) => i.complete), null, 20000);
    await W.quietRender(pg, 300); await W.frames(pg, 2);
    const t = await titles(pg), withImg = t.filter((x) => x.img);
    ok(withImg.length === t.length && withImg.every((x) => x.op === 1 && x.name), `with the pictures in, every one of ${t.length} laid titles shows on its book` + (withImg.some((x) => x.op !== 1) ? ' — hidden: ' + withImg.filter((x) => x.op !== 1).map((x) => x.s).join(', ') : ''));
    ok(!errs.length, 'no page errors (pictures in)' + (errs.length ? ': ' + errs[0] : ''));
    await ctx.close(); }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
