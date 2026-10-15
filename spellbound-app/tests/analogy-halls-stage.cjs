/* THE REASONING ROUNDS ON SCREEN — the halls on the kit's stage, the pins on the boards, Theo's notebook on a phone
   (circuit/BEE-CIRCUIT.md §11 and §13 test 9; analogy.js "THE REASONING ROUNDS")

   1  T14 / T15 (tests/lib/stage-check.cjs, exactly as tests/analogy-stage.cjs holds the Mock Analogy Bee): every hall
      screen — the lobby, a turn, a result, the finish — of all four halls at 390×844 light and 1280×800 dusk, and Twin
      Ponds' at 390×844 dusk and 1280×800 light: the stage is THE stage over the bee's 'hive' plate, the card a kit
      panel with the paper grain, the way back in the HUD; the HUD mirrored, the title on the centre line, no page
      scroll, no control under the tab bar, a phone's controls in the bottom 38%, no flat region over 6%, pure white and
      black ≤ 2%.
   2  THE PINS. On every region board, at 390 and at 1280, the hall pin lies inside the board and overlaps no stop
      (the stop's medallion and, on a wide board, its label; the pin's own label too).
   3  44px. At 390×844 (touch), tests/touch-targets.cjs's own measure (the 44px circle on each control hit-tested at
      eight points, all landing on the control): EVERY control on the hall's lobby, turn, result and finish and on a
      notebook page; on each region board the hall's three controls (the pin, the hall bar, the notebook button), and
      no stop's 44px circle lands on any of them — the overlay takes nothing from a stop. (The boards' own stops are
      the Atlas's, measured by touch-targets.cjs on Twin Ponds; Orchard Hill's level check, 18px from the board's top at
      390, has the top of its circle clipped by the board — before the halls and apart from them; see BUILD-reasoning.)
   4  FITS 390. Nothing spills sideways on a board, a hall screen or a notebook page (scrollWidth ≤ 390).
   5  NO EMOJI in a control, a HUD or a board (tests/hud-emoji.cjs's scan: Chromium's Extended_Pictographic, © ® ™ aside)
      on each board, each hall screen and each notebook page, phone and desktop.
   Proved by breaking (15 Oct 2026; each break a scratch root of symlinks with ONE file — analogy.js — replaced, the tree
   untouched, the test run with SB_ROOT on it and watched to fail; the counts are the FAIL lines):
     · the kit card on a solid paper (`.anl-kit .anl-card.sg-panel{background:var(--paper)}`) → 100 fail (the grain, T14's
       flat region and pure white, on the hall screens of every look);
     · Twin Ponds' pin put on its first stop (at: [192, 725]) → 5 fail (the overlap at all four looks, and the stop's 44px
       circle landing on the pin);
     · the pin's medallion and button shrunk to 34px → 4 fail ("anl:hall:… 37×37" on all four boards);
     · the hall bar laid out without wrapping at a fixed 520px → 4 fail (every board 583px wide at 390);
     · a 🔔 in the pin's label and the bar's title → 10 fail (every board: the bar on the phone, both on the desktop).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/analogy-halls-stage.cjs                                    */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const W = require('./lib/wait.cjs');
const SC = require('./lib/stage-check.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
const URL = 'file://' + ROOT + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const REGIONS = ['ponds', 'orchard', 'workshop', 'peaks'];
const KEPT = { n: 1, done: 1, best: 2, last: 2 };
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 0, lists: { journey: { xp: 30 } }, activeList: 'journey',
  anl: { stops: {}, regs: { ponds: { walk: '2026-10-1' }, orchard: { walk: '2026-10-1' }, workshop: { walk: '2026-10-1' } }, seen: {}, bee: {}, n: 0,
    halls: { ponds: KEPT, orchard: KEPT, workshop: KEPT, peaks: KEPT } } };

async function settle(pg) {
  await pg.evaluate(async () => { const st = document.querySelector('.sb-stage'); if (!st) return;
    const m = /url\(["']?([^"')]+)["']?\)/.exec(getComputedStyle(st).backgroundImage || ''); if (!m) return;
    await new Promise(r => { const i = new Image(); i.onload = r; i.onerror = r; i.src = m[1]; });
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); });
}
async function stageCheck(pg, label, mode) {
  await settle(pg);
  const s = await pg.evaluate(() => { const st = document.querySelector('.sb-stage'); if (!st) return null; const card = st.querySelector('.anl-card');
    return { kit: st.classList.contains('anl-kit') && !!st.closest('.anl-page'), hall: st.classList.contains('anl-hallst'), bg: getComputedStyle(st).backgroundImage,
      panel: !!card && card.classList.contains('sg-panel') && /svg/.test(getComputedStyle(card).backgroundImage), back: !!st.querySelector('.sg-st-side.l .anl-back'), ctl: st.querySelectorAll('.sg-st-ctl button').length }; });
  ok(!!s && s.kit && s.hall, `${label}: a hall, drawn on the engine kit's stage`);
  if (!s) return;
  ok(new RegExp('stage/hive-' + (mode === 'dusk' ? 'night' : 'day') + '\\.webp').test(s.bg), `${label}: the bee's hive plate for ${mode}, through SB_PLATE`);
  ok(s.panel && s.back && s.ctl >= 1, `${label}: a kit panel with the paper grain, the way back in the HUD, the controls in their row (${s.ctl})`);
  const still = await pg.addStyleTag({ content: SC.STILL }); await W.frames(pg, 2);
  const g = await SC.geometry(pg); await still.evaluate(e => e.remove());
  SC.report(ok, label, g, await SC.pixels(pg), { play: true });
}
/* tests/touch-targets.cjs's measure, on the screen as it stands. `only` narrows WHICH controls are measured (a CSS
   selector), never how: on a board that is the hall's own controls — every stop's 44px circle is then checked for
   landing on a hall control instead (stopsFree), so the overlay is held to taking nothing from a stop. A control
   replaced mid-walk (a lazy file's re-render) sends the walk round again, as touch-targets does. */
async function targets(pg, only) {
  let r = null;
  for (let tries = 0; tries < 3; tries++) { await W.quietRender(pg, 500);
    r = await pg.evaluate(async (only) => {
    const SEL = 'button, a[href], [data-act], input, select, textarea, [role="button"], summary';
    const why = e => e.matches('.sb-fam-hive') ? 'hive' : e.closest('.sb-hsearch') ? 'search' : (e.tagName === 'A' && e.closest('p') && e.closest('p').textContent.trim().length > e.textContent.trim().length + 12) ? 'inline link' : '';
    const els = [...document.querySelectorAll(SEL)].filter(e => !e.closest('[aria-hidden="true"]') && !(e.parentElement && e.parentElement.closest(SEL)) && !e.disabled
      && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).pointerEvents !== 'none' && (!only || e.matches(only)));
    const out = []; let n = 0, detached = 0;
    for (const e of els) { if (why(e)) continue; n++;
      if (!e.isConnected) { detached++; continue; }
      e.scrollIntoView({ block: 'center', inline: 'center' }); await new Promise(r => requestAnimationFrame(r));
      if (!e.isConnected) { detached++; continue; }
      const q = e.getBoundingClientRect(); let cx = (q.left + q.right) / 2, cy = (q.top + q.bottom) / 2;
      const vl = Math.max(0, q.left), vr = Math.min(innerWidth, q.right), vt = Math.max(0, q.top), vb = Math.min(innerHeight, q.bottom);
      if (vr - vl >= 44 && vb - vt >= 44 && (q.width > innerWidth || q.height > innerHeight)) { cx = (vl + vr) / 2; cy = (vt + vb) / 2; }
      const label = (e.getAttribute('data-act') || e.tagName.toLowerCase()) + ':' + (e.getAttribute('data-arg') || '') + ' "' + ((e.getAttribute('aria-label') || e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 20)) + '" ' + Math.round(q.width) + '×' + Math.round(q.height);
      if (cx < 22 || cx > innerWidth - 22 || cy < 22 || cy > innerHeight - 22) { out.push(label + ' (too near the edge)'); continue; }
      const pts = [[-15, -15], [0, -21], [15, -15], [-21, 0], [21, 0], [-15, 15], [0, 21], [15, 15]];
      if (pts.some(([dx, dy]) => { const h = document.elementFromPoint(cx + dx, cy + dy); return !(h && (h === e || e.contains(h))); })) out.push(label); }
    window.scrollTo(0, 0); return { n, out, detached }; }, only || null);
    if (!r.detached) break; }
  if (r.detached) r.out.push(r.detached + ' controls replaced while measured (the screen never settled)');
  return r;
}
/* no stop's 44px circle lands on a hall control (the pin, the bar) */
const stopsFree = (pg) => pg.evaluate(async () => { const out = [];
  for (const s of document.querySelectorAll('.anl-board .anl-stop')) { s.scrollIntoView({ block: 'center', inline: 'center' }); await new Promise(r => requestAnimationFrame(r));
    const m = s.querySelector('.anl-med') || s, q = m.getBoundingClientRect(), cx = (q.left + q.right) / 2, cy = (q.top + q.bottom) / 2;
    const pts = [[-15, -15], [0, -21], [15, -15], [-21, 0], [21, 0], [-15, 15], [0, 21], [15, 15], [0, 0]];
    if (pts.some(([dx, dy]) => { const h = document.elementFromPoint(cx + dx, cy + dy); return h && h.closest('.anl-hall, .anl-hallbar'); })) out.push(s.getAttribute('aria-label')); }
  window.scrollTo(0, 0); return out; });
/* tests/hud-emoji.cjs's scan */
const emoji = (pg) => pg.evaluate(() => { const RE = /\p{Extended_Pictographic}/u, OKC = /[©®™]/;
  const emo = t => [...String(t || '')].filter(c => RE.test(c) && !OKC.test(c)).join('');
  const vis = e => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none';
  const ex = e => !!e.closest('.sb-bug-tab, .sb-bug-panel, [data-bug]'); const out = [];
  document.querySelectorAll('.sg-st-hud, .sg-hud, [class*="hud"], .anl-board, .anl-hallbar, .anl-nb').forEach(z => { if (!vis(z) || ex(z)) return;
    const tw = document.createTreeWalker(z, NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) { const e = n.parentElement; if (!e || !vis(e) || ex(e)) continue; const m = emo(n.nodeValue); if (m) out.push(m + ' "' + n.nodeValue.trim().slice(0, 24) + '"'); } });
  document.querySelectorAll('button, a[href], [data-act], [role="button"], input, select, summary').forEach(c => { if (!vis(c) || ex(c)) return;
    const m = emo([c.innerText, c.getAttribute('aria-label'), c.getAttribute('title'), c.value].filter(Boolean).join(' ')); if (m) out.push(m + ' on "' + (c.innerText || c.getAttribute('aria-label') || '').trim().slice(0, 24) + '"'); });
  return [...new Set(out)]; });
const wide = (pg) => pg.evaluate(() => document.documentElement.scrollWidth);
/* the pin against every stop on the board: medallion boxes always; on a wide board, the labels too */
const pinClear = (pg) => pg.evaluate(() => { const B = document.querySelector('.anl-board'), P = document.querySelector('.anl-board .anl-hall'); if (!B || !P) return null;
  const box = (e) => { const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom }; };
  const parts = (e) => [...e.children].filter(x => x.getClientRects().length && getComputedStyle(x).display !== 'none').map(box);
  const hit = (a, b) => a.l < b.r - 0.5 && b.l < a.r - 0.5 && a.t < b.b - 0.5 && b.t < a.b - 0.5;
  const pin = parts(P), bb = box(B), pb = box(P);
  const over = [...B.querySelectorAll('.anl-stop')].filter(s => parts(s).some(a => pin.some(p => hit(a, p))) || hit(box(s), pb)).map(s => s.getAttribute('aria-label'));
  return { over, inside: pin.every(p => p.l >= bb.l && p.r <= bb.r && p.t >= bb.t && p.b <= bb.b), parts: pin.length }; });

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  const LOOKS = [{ n: 'phone', w: 390, h: 844, mode: 'light', all: true }, { n: 'desktop', w: 1280, h: 800, mode: 'dusk', all: true },
    { n: 'phone', w: 390, h: 844, mode: 'dusk', all: false }, { n: 'desktop', w: 1280, h: 800, mode: 'light', all: false }];
  for (const L of LOOKS) {
    const T = L.n + ' · ' + L.mode, phone = L.w < 500;
    const ctx = await b.newContext({ viewport: { width: L.w, height: L.h }, isMobile: phone, hasTouch: phone });
    await ctx.addInitScript(([k, m]) => { if (!localStorage.getItem('t_seed')) {
      localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: m, pin: '1234', activeIdx: 0, children: [k] }));
      localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } }, [KID, L.mode]);
    const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(T + ': ' + e.message));
    pg.on('console', m => { if (m.type() === 'error' && !/voice\/w\/|net::ERR_FILE_NOT_FOUND|Failed to load resource/.test(m.text())) errs.push(T + ': ' + m.text()); });
    await pg.goto(URL + '#/analogies'); await W.booted(pg);
    await pg.evaluate(() => new Promise(r => SB_LAZY.need(['analogy', 'mockbee', 'saga2'], r)));
    for (const r of L.all ? REGIONS : ['ponds']) {
      await pg.evaluate((r) => app.openAnalogies(r), r);
      await W.until(pg, (r) => state.nav === 'analogy' && state.anl.reg === r && !!document.querySelector('.anl-board .anl-hall') && !!document.querySelector('.anl-nbgo'), r, 30000);
      await W.until(pg, () => { const i = document.querySelector('.anl-board .anl-paint img'); return !i || i.complete; }, null, 15000);
      {   /* the board: the pin clear of the stops, no emoji; on the phone, 44px and no spill */
        const pc = await pinClear(pg);
        ok(!!pc && pc.inside && !pc.over.length, `${T} · ${r} board: the pin lies inside the board and clear of every stop` + (pc && pc.over.length ? ' — over ' + pc.over.join(', ') : ''));
        if (phone && L.mode === 'light') { const t = await targets(pg, '.anl-hall, .anl-hallbar button');
          ok(t.n === 3 && !t.out.length, `${T} · ${r} board: the hall's ${t.n} controls (the pin, the hall bar, the notebook) are 44px targets` + (t.out.length ? ' — ' + t.out.slice(0, 6).join(', ') : ''));
          const sf = await stopsFree(pg); ok(!sf.length, `${T} · ${r} board: no stop's 44px circle lands on the hall` + (sf.length ? ' — ' + sf.join(', ') : ''));
          ok(await wide(pg) <= 390, `${T} · ${r} board: nothing spills sideways (${await wide(pg)}px)`); }
        const em = await emoji(pg); ok(!em.length, `${T} · ${r} board: no emoji in a control or on the board` + (em.length ? ' — ' + em.join(' | ') : ''));
      }
      /* the hall: lobby, a turn, a result, the finish */
      await pg.click('.anl-board .anl-hall');
      await W.until(pg, () => state.nav === 'anlbee' && state.anlBee.phase === 'lobby' && document.querySelectorAll('.sb-stage .anl-lobby .anl-rival').length === 8, null, 20000);
      const screens = [['lobby', async () => {}],
        ['a turn', async () => { await pg.evaluate(() => app.anlBee('start')); await W.until(pg, () => state.anlBee.phase === 'turn' && !!document.querySelector('.sb-stage .anl-opt'), null, 8000); }],
        ['a result', async () => { await pg.evaluate(() => app.anlBee('pick:' + state.anlBee.q.ans)); await W.until(pg, () => state.anlBee.phase === 'result' && !!document.querySelector('.sb-stage [data-arg="next"]'), null, 8000); }],
        ['the finish', async () => { await pg.evaluate(() => { const bb = state.anlBee; bb.round = 2; bb.phase = 'turn'; bb.picked = null; app.anlBee('pick:' + ((bb.q.ans + 1) % bb.q.opts.length)); app.anlBee('next'); });
          await W.until(pg, () => state.anlBee.phase === 'done' && !!document.querySelector('.sb-stage .anl-done'), null, 8000); }]];
      for (const [nm, go] of screens) { await go(); const lab = `${T} · ${r} hall · ${nm}`;
        await stageCheck(pg, lab, L.mode);
        if (phone && L.mode === 'light') { const t = await targets(pg); ok(!t.out.length, `${lab}: all ${t.n} controls are 44px targets` + (t.out.length ? ' — ' + t.out.slice(0, 6).join(', ') : ''));
          ok(await wide(pg) <= 390, `${lab}: nothing spills sideways`); }
        if (L.mode === 'light' || L.all) { const em = await emoji(pg); ok(!em.length, `${lab}: no emoji in the HUD or a control` + (em.length ? ' — ' + em.join(' | ') : '')); } }
      /* the notebook page from the finish screen */
      await pg.click('.sb-stage .sg-st-ctl .anl-btn.main');
      await W.until(pg, (r) => state.nav === 'analogy' && state.anl.v === 'note' && state.anl.reg === r && !!document.querySelector('.anl-nb'), r, 8000);
      if (phone) { const t = await targets(pg); ok(!t.out.length, `${T} · ${r} notebook: all ${t.n} controls are 44px targets` + (t.out.length ? ' — ' + t.out.slice(0, 6).join(', ') : ''));
        ok(await wide(pg) <= 390, `${T} · ${r} notebook: nothing spills sideways (${await wide(pg)}px)`); }
      const em = await emoji(pg); ok(!em.length, `${T} · ${r} notebook: no emoji` + (em.length ? ' — ' + em.join(' | ') : ''));
    }
    await ctx.close();
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
