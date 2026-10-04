/* EVERY CONTROL IS A 44px TARGET ON A PHONE (audit v4 P3) — @check

   Measured the way a thumb meets it, not by the box the CSS draws: for every interactive element on
   the main screens at 390×844 (touch), the 44px circle centred on it is hit-tested at eight points on
   its edge (elementFromPoint, so an invisible hit area counts, rounded corners are honoured, and a
   neighbour lying over it does not). Every point must land on the control itself.

   EXEMPT, each for a stated reason (and listed when the test runs):
     · the family top bar (.sb-header-sticky) — its 37px icons and 41px search row are pinned by the
       family's shell-check (tests/lib/family/shell-check.mjs REF.phone); changing them is a family
       decision, not Bee's;
     · Daily Bee's letter keys (Daily Buzz's until 4 Oct 2026) — ten keys across a 390px phone cannot
       each be 44 wide; they are 44+ tall, the layout every phone keyboard uses (WCAG 2.5.8's spacing
       exception);
     · the Atlas overview's region medallions on a narrow board — the 44px key rows under the board
       are the same doors (atlasKey; WCAG's "equivalent" exception);
     · links inside a sentence (WCAG's inline exception).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/touch-targets.cjs                       */
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..') + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 400, lists: { journey: { xp: 30 } }, activeList: 'journey',
  missed: [{ w: 'necessary', n: 1, ts: Date.now() }] };
const SCREENS = [
  ['home', () => app.setNav('home')], ['atlas', () => app.setNav('trail')], ['a region', () => { location.hash = '#/atlas/honey/meadow'; }],
  ['practice', () => app.setNav('coach')], ['library', () => app.setNav('explore')], ['play', () => app.setNav('games')],
  ['my feed', () => app.setNav('feed')], ['my hive', () => app.openCollection()], ['shop', () => app.openShop('avatars')],
  ['vocabulary', () => app.setNav('vocab')], ['daily bee', () => app.openDaily()]];

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.addInitScript(k => { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [k] })); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } }, KID);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(URL); await pg.waitForTimeout(2800);
  const small = [], exempt = new Set();
  for (const [name, go] of SCREENS) {
    await pg.evaluate(`(${go.toString()})()`); await pg.waitForTimeout(1700);
    /* the daily game and its corpus load lazily: measure its board, not its loader */
    if (name === 'daily bee') await pg.waitForFunction(() => !!document.querySelector('#db-host .db-grid'), null, { timeout: 60000 }).catch(() => {});
    const r = await pg.evaluate(async () => {
      const SEL = 'button, a[href], [data-act], input, select, textarea, [role="button"], summary';
      const why = e => e.closest('.sb-header-sticky') ? 'the family top bar (shell-check pins it)'
        : e.matches('.db-k') ? "Daily Bee's letter keys (ten across a phone)"
        : (e.matches('.atlas-pin') && e.closest('.atlas-wrap') && getComputedStyle(e.closest('.atlas-wrap').querySelector('.atlas-key') || document.body).display !== 'none') ? 'Atlas medallions (the 44px key is the same door)'
        : (e.tagName === 'A' && e.closest('p') && e.closest('p').textContent.trim().length > e.textContent.trim().length + 12) ? 'a link inside a sentence' : '';
      const els = [...document.querySelectorAll(SEL)].filter(e => !e.closest('[aria-hidden="true"]') && !(e.parentElement && e.parentElement.closest(SEL)) && !e.disabled
        && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).pointerEvents !== 'none' && !e.closest('nav.sb-tabbar'));
      const out = [], ex = [];
      for (const e of els) {
        const w = why(e); if (w) { ex.push(w); continue; }
        e.scrollIntoView({ block: 'center', inline: 'nearest' }); await new Promise(r => requestAnimationFrame(r));
        const q = e.getBoundingClientRect(); const cx = (q.left + q.right) / 2, cy = (q.top + q.bottom) / 2;
        if (cx < 22 || cx > innerWidth - 22 || cy < 22 || cy > innerHeight - 22) continue;   // cannot be centred on screen (a carousel's edge)
        /* the 44px circle centred on it: four points 21px out on the axes, four on the diagonals
           (a round 48px button is a 44px target; a 44px square test would fail it on its corners) */
        const pts = [[-15, -15], [0, -21], [15, -15], [-21, 0], [21, 0], [-15, 15], [0, 21], [15, 15]];
        const miss = pts.filter(([dx, dy]) => { const h = document.elementFromPoint(cx + dx, cy + dy); return !(h && (h === e || e.contains(h))); }).length;
        if (miss) out.push((e.getAttribute('data-act') || e.tagName.toLowerCase()) + ' "' + ((e.getAttribute('aria-label') || e.textContent || e.value || '').trim().replace(/\s+/g, ' ').slice(0, 20)) + '" ' + Math.round(q.width) + '×' + Math.round(q.height));
      }
      window.scrollTo(0, 0);
      return { out: [...new Set(out)], ex: [...new Set(ex)], n: els.length };
    });
    r.ex.forEach(x => exempt.add(x));
    if (r.out.length) small.push(name + ': ' + r.out.slice(0, 6).join(', ') + (r.out.length > 6 ? ' …+' + (r.out.length - 6) : ''));
    console.log(`  ·    ${name}: ${r.n} controls measured${r.out.length ? ', ' + r.out.length + ' under 44px' : ''}`);
  }
  ok(!small.length, 'every control on the main screens is a 44×44 target at 390px' + (small.length ? ' — ' + small.join(' | ') : ''));
  console.log('  exempt: ' + [...exempt].join('; '));
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
