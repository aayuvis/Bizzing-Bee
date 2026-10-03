/* A WORLD'S DECORATION SITS BEHIND THE CONTENT, NEVER OVER A CARD OR A CONTROL — @check

   Two owner-reported faults from the 3 Oct screenshot sweep:
   · Race Zone: the start countdown ("3 · 2 · 1 · GO!", 190px tall) and its five lights were
     position:fixed at z-index 70 — over #root (z-index 1) — so the giant digit crossed the
     Home cards on every visit and the lights sat on the coin pill in the top bar.
   · Dino Era: the dino silhouette on every card is an absolutely positioned ::after, which
     paints ABOVE the card's ordinary content, so it stood on the cards' → buttons.
   The fix is at the cause: the countdown and lights live at the backdrop's level (behind
   #root), and every world's card marks paint at z-index -1 inside a card that is its own
   stacking context (worlds4.css) — on the card's ground, under every word and button.
   This walks all eight worlds on Home at desktop and phone widths and fails on any card
   mark that would paint over the card's content, and on any world layer outside #root
   that is not behind it.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/world-decor.cjs */
const { chromium } = require('playwright');
const SRC = process.env.SRC || __dirname + '/..';
let fails = 0;
const ok = (b, msg) => { console.log((b ? '  OK   ' : '  FAIL ') + msg); if (!b) fails++; };
const WORLDS = ['spellbound', 'aurora', 'anime', 'science', 'avatar', 'godly', 'race', 'dino'];

/* For every card on screen: each drawn ::before/::after that is positioned must paint under
   the card's content — i.e. the card is a stacking context and the mark's z-index is < 0.
   Also returns which marks actually cover a control or text in their card, so a failure
   names the collision the child would see. */
const SCAN = () => {
  const out = { cards: 0, marks: 0, over: [], hits: [] };
  const inter = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0;
  document.querySelectorAll('#root .sb-card').forEach(card => {
    const cr = card.getBoundingClientRect(); if (!cr.width || !cr.height) return; out.cards++;
    const cs = getComputedStyle(card);
    const ctx = cs.isolation === 'isolate' || (cs.position !== 'static' && cs.zIndex !== 'auto') || cs.transform !== 'none' || +cs.opacity < 1 || cs.contain.includes('paint');
    for (const ps of ['::before', '::after']) {
      const s = getComputedStyle(card, ps);
      if (s.content === 'none' || s.content === 'normal' || s.display === 'none' || s.position === 'static' || s.visibility === 'hidden') continue;
      out.marks++;
      const bl = parseFloat(cs.borderLeftWidth) || 0, bt = parseFloat(cs.borderTopWidth) || 0;
      const w = parseFloat(s.width) || 0, h = parseFloat(s.height) || 0;
      const L = s.left !== 'auto' ? cr.left + bl + parseFloat(s.left) : cr.right - (parseFloat(cs.borderRightWidth) || 0) - parseFloat(s.right) - w;
      const T = s.top !== 'auto' ? cr.top + bt + parseFloat(s.top) : cr.bottom - (parseFloat(cs.borderBottomWidth) || 0) - parseFloat(s.bottom) - h;
      const box = { left: L, top: T, right: L + w, bottom: T + h };
      const under = ctx && s.zIndex !== 'auto' && +s.zIndex < 0;
      const ctl = [...card.querySelectorAll('button,a,input,[data-act],h1,h2,h3,p,b,span')].find(el => { const r = el.getBoundingClientRect(); return r.width && r.height && el.textContent.trim() && inter(box, r); });
      const tag = document.documentElement.getAttribute('data-theme') + ' ' + (card.className.split(' ')[1] || 'card') + ps;
      if (ctl) out.hits.push(tag + ' on "' + ctl.textContent.replace(/\s+/g, ' ').trim().slice(0, 18) + '"');
      if (!under) out.over.push(tag + ' (card ' + (ctx ? 'is' : 'is NOT') + ' a stacking context, mark z-index ' + s.zIndex + ')' + (ctl ? ' — covers "' + ctl.textContent.trim().slice(0, 18) + '"' : ''));
    }
  });
  /* world layers that live outside #root (the backdrop, the countdown, the lights) */
  const rz = +getComputedStyle(document.getElementById('root')).zIndex || 0;
  out.layers = [...document.body.children].filter(e => e.id !== 'root' && /(^|\s)w4-/.test(e.className || '')).map(e => {
    const z = getComputedStyle(e).zIndex; return { cls: String(e.className).split(' ')[0], z, behind: getComputedStyle(e).position !== 'static' && z !== 'auto' && +z < rz }; });
  out.rootZ = rz;
  return out;
};

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => require('fs').existsSync(p)) });
  for (const W of [1280, 390]) {
    const pg = await b.newPage({ viewport: { width: W, height: 900 }, isMobile: W < 700, hasTouch: W < 700 });
    const errs = []; pg.on('pageerror', e => errs.push(String(e.message)));
    await pg.goto('file://' + SRC + '/index.html'); await pg.waitForTimeout(2400);
    await pg.evaluate(W => {
      state.children = [{ name: 'Ravi', avatar: 'bizzy', coins: 0, pow: {}, age: 10, lists: { default: { xp: 60 } }, activeList: 'default',
        missed: [], unlockedThemes: ['spellbound', 'aurora', 'anime', 'science', 'avatar', 'godly', 'race', 'dino'], unlockedConcepts: {}, unlockedLists: {}, questPath: 'journey' }];
      state.activeIdx = 0; state.screen = 'app'; app.setNav('home');
    }, W);
    const over = [], hits = [], layersBad = []; let cards = 0, marks = 0;
    for (const t of WORLDS) for (const mode of ['light', 'dusk']) {
      await pg.evaluate(([t, mode]) => { state.theme = t; app.setMode(mode); app.setNav('home'); try { SB_W4_SYNC(); } catch (e) {} }, [t, mode]);
      await pg.waitForTimeout(t === 'race' ? 0 : 250);
      if (t === 'race' && mode === 'light') await pg.waitForSelector('.w4-countdown', { timeout: 6000 }).catch(() => {});
      const r = await pg.evaluate(SCAN);
      cards += r.cards; marks += r.marks; over.push(...r.over); hits.push(...r.hits);
      r.layers.filter(l => !l.behind).forEach(l => layersBad.push(t + ' ' + mode + ': .' + l.cls + ' z-index ' + l.z + ' vs #root ' + r.rootZ));
      if (t === 'race' && mode === 'light') {
        const cd = r.layers.filter(l => l.cls === 'w4-countdown' || l.cls === 'w4-lights');
        ok(cd.length >= 1 && cd.every(l => l.behind), W + 'px: the Race Zone countdown is on screen and sits BEHIND the app, never over a card (' + JSON.stringify(cd) + ')');
      }
    }
    ok(cards > 30 && marks > 30, W + 'px: walked Home in all eight worlds, light and dusk — ' + cards + ' cards, ' + marks + ' card marks');
    ok(!over.length, W + 'px: every world\'s card marks paint under the card\'s words and buttons' + (over.length ? ' — ' + over.length + ': ' + [...new Set(over)].slice(0, 4).join(' | ') : ''));
    ok(!layersBad.length, W + 'px: every world layer outside the app (backdrop, countdown, lights) is behind it' + (layersBad.length ? ' — ' + layersBad.slice(0, 3).join(' | ') : ''));
    if (W === 1280) console.log('       (marks that share space with content, now under it: ' + ([...new Set(hits)].slice(0, 3).join(' | ') || 'none') + ')');
    ok(!errs.length, W + 'px: no page errors' + (errs.length ? ': ' + errs[0] : ''));
    await pg.close();
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
