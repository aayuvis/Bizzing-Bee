// Phone layout. Every one of these was a real defect found at 390px:
//   · the Daily Buzz call to action was sliced off the right edge of its card
//   · the same coin count sat on screen twice, 110px apart
//   · the floating bug tab was pinned at 58% viewport height, on top of
//     whatever card the child was reading
//   · the arcade hero's CTA broke across two lines mid-phrase
// The shared cause is decorative art reserving a fixed slice of width at every
// screen size. On a phone the art gives way; the words never do.
const { chromium } = require('playwright');
const SRC = process.env.SRC || __dirname + '/..';
let fails = 0;
const ok = (b, msg) => { console.log((b ? '  OK   ' : '  FAIL ') + msg); if (!b) fails++; };

const CHILD = { name: 'Ravi', avatar: 'bee', coins: 240, pow: {}, age: 11,
  lists: { default: { xp: 60 } }, activeList: 'default', missed: [], unlockedThemes: [],
  unlockedConcepts: {}, unlockedLists: {}, questPath: 'journey' };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const W of [360, 390]) {
    const pg = await b.newPage({ viewport: { width: W, height: 844 }, isMobile: true, hasTouch: true });
    const errs = []; pg.on('pageerror', e => errs.push(String(e.message)));
    await pg.goto('file://' + SRC + '/index.html');
    await pg.waitForTimeout(2600);
    await pg.evaluate(async c => {
      localStorage.setItem('sb_splash', '0');
      localStorage.setItem('sb_daily', JSON.stringify({ day: 'x', streak: 7 }));
      state.children = [c]; state.activeIdx = 0; state.screen = 'app';
      app.setNav('games'); await new Promise(r => setTimeout(r, 1500));
    }, CHILD);

    // ---- the Daily Buzz box: nothing may cross its own edge ----
    const daily = await pg.evaluate(() => {
      const btn = document.querySelector('button[data-act="openDaily"]');
      if (!btn) return null;
      const br = btn.getBoundingClientRect();
      let worst = 0, who = '';
      for (const el of btn.querySelectorAll('*')) {
        // the mascot is decorative and deliberately bleeds off the corner
        if (el.closest('[aria-hidden="true"]')) continue;
        const r = el.getBoundingClientRect();
        if (!r.width) continue;
        const over = r.right - br.right;
        if (over > worst) { worst = over; who = (el.textContent || '').trim().slice(0, 22); }
      }
      return { over: Math.round(worst), who, w: Math.round(br.width) };
    });
    ok(daily, W + 'px: the Daily Buzz box is on the Play screen');
    ok(daily && daily.over <= 1,
      W + 'px: nothing in it crosses the card edge' + (daily && daily.over > 1 ? ' — "' + daily.who + '" over by ' + daily.over + 'px' : ''));

    // ---- the arcade hero: its CTA reads as one phrase ----
    const hero = await pg.evaluate(() => {
      const go = [...document.querySelectorAll('.arc-hero-cta')].map(c => {
        const btn = c.firstElementChild; if (!btn) return null;
        // a button's own box includes padding, so measure the TEXT's line boxes
        const rng = document.createRange(); rng.selectNodeContents(btn);
        const lines = new Set([...rng.getClientRects()].filter(r => r.height > 1)
          .map(r => Math.round(r.top))).size;
        return { lines, txt: (btn.textContent || '').trim().slice(0, 20) };
      }).filter(Boolean);
      return go;
    });
    ok(hero.length > 0, W + 'px: the arcade heroes are on screen');
    ok(hero.every(h => h.lines <= 1), W + 'px: no hero CTA breaks across lines ('
      + hero.map(h => h.txt + '=' + h.lines).join(', ') + ')');

    // ---- one coin count, not two ----
    const coins = await pg.evaluate(async () => {
      const count = () => [...document.querySelectorAll('*')].filter(e => {
        if (e.children.length > 1) return false;
        if (!/^\s*240\s*$/.test(e.textContent || '')) return false;
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      }).length;
      const out = { games: count() };
      app.setNav('collection'); await new Promise(r => setTimeout(r, 1200));
      out.hive = count();
      return out;
    });
    ok(coins.games <= 1, W + 'px: Play shows the coin count once (' + coins.games + ')');
    ok(coins.hive <= 1, W + 'px: My Hive shows it once too (' + coins.hive + ')');

    // ---- the bug tab keeps out of the reading band ----
    const bug = await pg.evaluate(() => {
      const t = document.querySelector('.sb-bug-tab');
      if (!t) return null;
      const r = t.getBoundingClientRect();
      const bar = document.querySelector('.sb-tabbar');
      const barTop = bar ? bar.getBoundingClientRect().top : innerHeight;
      // does it sit over any card in the middle of the screen?
      return { top: Math.round(r.top), bottom: Math.round(r.bottom), barTop: Math.round(barTop),
        band: Math.round(r.top / innerHeight * 100) };
    });
    ok(bug, W + 'px: the bug tab is present');
    ok(bug && bug.bottom <= bug.barTop + 1,
      W + 'px: it sits above the tab bar, not across the page (bottom ' + (bug && bug.bottom) + ' vs bar ' + (bug && bug.barTop) + ')');
    ok(bug && bug.band >= 75, W + 'px: and it rides the bottom strip, out of the reading band (starts at '
      + (bug && bug.band) + '% of the screen, was 58%)');

    // ---- and no screen scrolls sideways ----
    const wide = await pg.evaluate(async () => {
      const out = {};
      for (const nav of ['home', 'games', 'trail', 'coach', 'explore', 'collection']) {
        app.setNav(nav); await new Promise(r => setTimeout(r, 900));
        out[nav] = document.documentElement.scrollWidth;
      }
      out.vw = innerWidth;
      return out;
    });
    const sideways = Object.entries(wide).filter(([k, v]) => k !== 'vw' && v > wide.vw + 1);
    ok(sideways.length === 0, W + 'px: no screen scrolls sideways'
      + (sideways.length ? ' — ' + sideways.map(([k, v]) => k + '=' + v).join(', ') : ''));
    ok(errs.length === 0, W + 'px: no page errors' + (errs.length ? ': ' + errs[0] : ''));
    await pg.close();
  }
  await b.close();
  console.log(fails ? '\n' + fails + ' FAILED' : '\nall good');
  process.exit(fails ? 1 : 0);
})();
