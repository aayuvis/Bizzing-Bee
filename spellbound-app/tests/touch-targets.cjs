/* EVERY CONTROL IS A 44px TARGET ON A PHONE (audit v4 P3; road to 4.5, P3.10 / P3.11) — @check

   Measured the way a thumb meets it, not by the box the CSS draws: for EVERY interactive element on
   the named screens at 390×844 (touch), the 44px circle centred on it is hit-tested at eight points on
   its edge (elementFromPoint, so an invisible hit area counts, rounded corners are honoured, and a
   neighbour lying over it does not). Every point must land on the control itself.

   EVERY control means every one: the tab bar's tabs and the family top bar are measured too (they were
   left out), and a control that cannot be centred on the screen after it is scrolled into view (it sits
   so near an edge that its 44px circle would leave the screen) FAILS as "too near the edge" instead of
   being skipped. Nineteen screens (the brief asks for twelve): the eleven of audit v4, and the games
   P3.10 named — a Spelling Gym round (Spot the Error's tokens), the Word Lore hub (its level chips) and a
   Lore round (its Back), Daily Buzz (its keys), the Analogy Atlas, an analogy round, the Mock Analogy Bee
   and the Mock Spelling Bee.

   EXEMPT, each for a stated reason that is still true (and listed when the test runs):
     · the ⬡ Hive button and the search row of the family top bar — pinned by the family's shell-check
       (tests/lib/family/shell-check.mjs REF.phone: ⬡ [14,9,37,37] four pixels from ☰ [55,9,37,37], the
       search row 41px tall). Two 44px targets cannot both fit 41px apart; the ☰ takes the room (P3.11:
       "☰ included") and the ⬡ keeps its pinned box. Every other top-bar control is measured (was: the
       whole bar exempt — untrue for ☰, the coins, the theme, the lock, the child switcher and the logo,
       whose phone boxes the shell-check does not pin);
     · (no longer: Daily Buzz's ten-across letter keys — measured since 4 Oct 2026);
     · the Atlas overview's region medallions on a narrow board — the 44px key rows under the board
       are the same doors (atlasKey; WCAG's "equivalent" exception);
     · links inside a sentence (WCAG's inline exception).
   Proved by breaking (13 Oct 2026, the fault put back in a scratch copy and the test watched to fail):
     · the ☰'s hit area taken out (a11y.css): "openDrawer Menu 37×37" fails on all nineteen screens;
     · Spot the Error's tokens back to min-height 34px (gym.js): the gym round fails on its word tokens (37px);
     · the level chip's hit area taken out (a11y.css §6): the Play tab fails on every card's chip (59×25).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/touch-targets.cjs                       */
const { chromium } = require('playwright');
const path = require('path');
const W = require('./lib/wait.cjs');
const URL = 'file://' + path.resolve(__dirname, '..') + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 400, lists: { journey: { xp: 30 } }, activeList: 'journey',
  missed: [{ w: 'necessary', n: 1, ts: Date.now() }] };
/* [name, open, ready] — ready is what the screen draws once it is really there (a loader is not the screen) */
const SCREENS = [
  ['home', () => app.setNav('home'), () => !!document.querySelector('.sb-home')],
  ['atlas', () => app.setNav('trail'), () => !!document.querySelector('.atlas-board')],
  ['a region', () => { location.hash = '#/atlas/honey/meadow'; }, () => !!document.querySelector('.act-board')],
  ['practice', () => app.setNav('coach'), () => (state.nav === 'coach' || state.nav === 'quest') && !document.querySelector('.sb-content .sb-hive')],
  ['library', () => app.setNav('explore'), () => state.nav === 'explore' && !document.querySelector('.sb-content .sb-hive')],
  ['play', () => app.setNav('games'), () => !!document.querySelector('[data-card]')],
  ['my feed', () => app.setNav('feed'), () => state.nav === 'feed' && !document.querySelector('.sb-content .sb-hive')],
  ['my hive', () => app.openCollection(), () => state.nav === 'collection' && !document.querySelector('.sb-content .sb-hive')],
  ['shop', () => app.openShop('avatars'), () => state.nav === 'shop' && !document.querySelector('.sb-content .sb-hive')],
  ['vocabulary', () => app.setNav('vocab'), () => state.nav === 'vocab' && !document.querySelector('.sb-content .sb-hive')],
  ['daily bee', () => app.openDaily(), () => !!document.querySelector('#db-host .db-grid')],
  ['a spelling gym round (Spot the Error)', () => app.openGym('spot'), () => !!document.querySelector('.sb-stage .gym-tok')],
  ['the word lore hub (level chips)', () => app.openLore(), () => !!document.querySelector('.sb-stage .sg-hub-tile')],
  ['a word lore round', () => app.openLore('meanings'), () => state.qz && state.qz.phase === 'play' && !!document.querySelector('.qz-opt')],
  ['daily buzz', () => app.openDailyBuzz(), () => !!document.querySelector('.dz-keys .dz-k')],
  ['the analogy atlas', () => app.openAnalogies(), () => !!document.querySelector('.anl-board .anl-stop')],
  ['an analogy round', () => app.anl('practice'), () => !!document.querySelector('.sb-stage .anl-opt')],
  ['the mock analogy bee', () => { app.anl('leave'); app.openAnlBee(); }, () => !!document.querySelector('.sb-stage .anl-field .anl-rival')],
  ['the mock spelling bee', () => app.mbOpen(), () => !!document.querySelector('.sb-stage.mb-stage')],
  /* My Homework and the Teacher's Corner (TEACHER-HOMEWORK.md): homework set as the Corner sets it, so every screen from here
     on also measures the top bar's homework button */
  ['my homework', () => { SB_LAZY.need(['scrHw', 'words1'], () => { const c = active();
      if (!(c.hw && c.hw.items && c.hw.items.length)) SB_HW.add(c, { kind: 'words', ref: null, t: 'Words: Easy, 4', due: null,
        words: nextWords.pool(c, { purpose: 'drill', level: 'easy', needDef: true }).slice(0, 4).map((w) => ({ w: w.w, d: w.d || '', s: w.s || '', p: w.p || '' })) });
      app.openHomework('words'); }); }, () => !!document.querySelector('.hw-page [data-act="hwSpell"]')],
  ['a homework word list being spelled', () => { const it = SB_HW.items(active())[0]; app.hwSpell(it.id); }, () => !!document.querySelector('.hw-card .hw-in')],
  ["the teacher's corner", () => { state.nav = 'teacher'; state.screen = 'app'; state.teachOk = true; render(); }, () => !!document.querySelector('.tc-page [data-tc-list]')]];

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.addInitScript(k => { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [k] })); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } }, KID);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(URL); await W.booted(pg);
  const small = [], exempt = new Set();
  for (const [name, go, ready] of SCREENS) {
    await pg.evaluate(`(${go.toString()})()`);
    const drawn = await W.until(pg, ready, null, 60000);
    ok(drawn, `${name}: the screen opened`);
    if (!drawn) continue;
    await pg.waitForTimeout(700);
    /* measure a SETTLED screen: a lazy file landing re-renders it, and a control replaced mid-walk is a detached
       node with a 0×0 box (the old walk skipped those silently as "cannot be centred") — so wait for the renders to
       stop, and walk again (up to three times) if any control was replaced while it was being measured */
    let r = null;
    for (let tries = 0; tries < 3; tries++) { await W.quietRender(pg, 500);
    r = await pg.evaluate(async () => {
      const SEL = 'button, a[href], [data-act], input, select, textarea, [role="button"], summary';
      const why = e => e.matches('.sb-fam-hive') ? 'the ⬡ Hive button (pinned 4px from ☰ by the family shell-check)'
        : e.closest('.sb-hsearch') ? 'the search row (pinned 41px tall by the family shell-check)'
        : (e.matches('.atlas-pin') && e.closest('.atlas-wrap') && getComputedStyle(e.closest('.atlas-wrap').querySelector('.atlas-key') || document.body).display !== 'none') ? 'Atlas medallions (the 44px key is the same door)'
        : (e.tagName === 'A' && e.closest('p') && e.closest('p').textContent.trim().length > e.textContent.trim().length + 12) ? 'a link inside a sentence' : '';
      const els = [...document.querySelectorAll(SEL)].filter(e => !e.closest('[aria-hidden="true"]') && !(e.parentElement && e.parentElement.closest(SEL)) && !e.disabled
        && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).pointerEvents !== 'none');
      const out = [], ex = []; let detached = 0;
      for (const e of els) {
        const w = why(e); if (w) { ex.push(w); continue; }
        if (!e.isConnected) { detached++; continue; }
        e.scrollIntoView({ block: 'center', inline: 'center' }); await new Promise(r => requestAnimationFrame(r));
        if (!e.isConnected) { detached++; continue; }
        const q = e.getBoundingClientRect(); let cx = (q.left + q.right) / 2, cy = (q.top + q.bottom) / 2;
        /* a control bigger than the screen (a whole board that closes its card) is tapped where it shows: the centre of
           its visible part */
        const vl = Math.max(0, q.left), vr = Math.min(innerWidth, q.right), vt = Math.max(0, q.top), vb = Math.min(innerHeight, q.bottom);
        if (vr - vl >= 44 && vb - vt >= 44 && (q.width > innerWidth || q.height > innerHeight)) { cx = (vl + vr) / 2; cy = (vt + vb) / 2; }
        const label = (e.getAttribute('data-act') || e.tagName.toLowerCase()) + ' "' + ((e.getAttribute('aria-label') || e.textContent || e.value || '').trim().replace(/\s+/g, ' ').slice(0, 20)) + '" ' + Math.round(q.width) + '×' + Math.round(q.height);
        /* a control whose 44px circle cannot sit on the screen even scrolled into view is too near an edge */
        if (cx < 22 || cx > innerWidth - 22 || cy < 22 || cy > innerHeight - 22) { out.push(label + ' (too near the edge)'); continue; }
        /* the 44px circle centred on it: four points 21px out on the axes, four on the diagonals
           (a round 48px button is a 44px target; a 44px square test would fail it on its corners) */
        const pts = [[-15, -15], [0, -21], [15, -15], [-21, 0], [21, 0], [-15, 15], [0, 21], [15, 15]];
        const miss = pts.filter(([dx, dy]) => { const h = document.elementFromPoint(cx + dx, cy + dy); return !(h && (h === e || e.contains(h))); }).length;
        if (miss) out.push(label);
      }
      window.scrollTo(0, 0);
      return { out: [...new Set(out)], ex: [...new Set(ex)], n: els.length, detached };
    });
    if (!r.detached) break; }
    if (r.detached) r.out.push(r.detached + ' controls replaced while measured (the screen never settled)');
    r.ex.forEach(x => exempt.add(x));
    if (r.out.length) small.push(name + ': ' + r.out.slice(0, 8).join(', ') + (r.out.length > 8 ? ' …+' + (r.out.length - 8) : ''));
    console.log(`  ·    ${name}: ${r.n} controls measured${r.out.length ? ', ' + r.out.length + ' under 44px' : ''}`);
  }
  ok(!small.length, `every control on the ${SCREENS.length} screens is a 44×44 target at 390px` + (small.length ? ' — ' + small.join(' | ') : ''));
  console.log('  exempt: ' + [...exempt].join('; '));
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
