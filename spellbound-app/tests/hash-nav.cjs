/* BACK STAYS IN THE APP, AND EVERY SCREEN HAS AN ADDRESS (FIX-BEE B6, family standard §4).

   There was no hash routing: one dummy history entry sent every Back to Home, deep links did
   not exist, and a second Back on Home left the app. Now state is mirrored into the hash after
   every render (family-shell.js) and popstate maps it back through the same openers a tap uses:
     · each main screen has its own route (#/home, #/atlas, #/stop/u1, #/practice, #/library,
       #/play, #/hive/…, #/concepts/n);
     · Back retraces them in order, closes a layer (drawer, Settings) before it leaves a screen,
       stops a drill it leaves, and at the bottom of the stack climbs back onto Home instead of
       leaving the app;
     · #/atlas and #/stop/u1 open where they say; a locked stop is NOT opened by its address;
     · #/continue lands exactly where Home's Continue goes;
     · ?from=hive shows "← back to my day", pointing at the Hive, and hides inside a drill.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/hash-nav.cjs                         */
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..') + '/index.html';
const HIVE = 'https://aayuvis.github.io/Bizzing_Schedule/';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 40, band: 3, bandSeed: 3,
  lists: { journey: { xp: 30 } }, activeList: 'journey',
  trail: { lap: 1, done: { u1: { 1: 90 }, u2: { 1: 85 } }, chk: {}, seen: {}, st: { 'u1:1': { l: 1, w: 1, p: 90 }, 'u2:1': { l: 1, p: 85 } }, elap: 1, edone: {}, echk: {} } };

async function open(b, url, errs, vp) {
  const ctx = await b.newContext({ viewport: vp || { width: 1180, height: 900 } });
  await ctx.addInitScript(k => { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [k] })); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } }, KID);
  const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(url); await pg.waitForTimeout(3000);
  await pg.evaluate(() => new Promise(r => SB_LAZY.need('atlas', r)));   // the Atlas curriculum is lazy
  return { ctx, pg };
}
/* off the app entirely (Back left it) there is no `state` — report the page we landed on */
const where = pg => pg.evaluate(() => typeof state === 'undefined' ? { url: location.href, h: location.hash, screen: null } : ({ h: location.hash, url: location.href, screen: state.screen, nav: state.nav, tv: state.trailView, tu: state.trailUnit || state.trailReturn,
  drawer: !!state.drawerOpen, settings: !!state.settingsOpen, sel: !!state.conceptSel }));

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];

  /* ---- 1. every screen writes its own route, by real taps ---- */
  let { ctx, pg } = await open(b, URL, errs);
  const seen = {};
  const tab = async (arg) => { await pg.click('.sb-topnav [data-act="setNav"][data-arg="' + arg + '"]'); await pg.waitForTimeout(900); };
  seen.home = (await where(pg)).h;
  await tab('trail'); seen.atlas = (await where(pg)).h;
  await pg.evaluate(() => app.trailUnit('u3')); await pg.waitForTimeout(900); seen.stop = (await where(pg)).h;
  await tab('coach'); seen.practice = (await where(pg)).h;
  await tab('explore'); seen.library = (await where(pg)).h;
  await tab('games'); seen.play = (await where(pg)).h;
  /* the coin chip opens the wallet sheet (FIX-BEE v2, §1.1); its "Open the Shop" is a real screen with a route */
  await pg.click('.bz-coinchip'); await pg.waitForTimeout(400); await pg.click('.bz-sheet [data-act="openShop"]'); await pg.waitForTimeout(700); seen.hive = (await where(pg)).h;
  ok(seen.home === '#/home' && seen.atlas === '#/atlas' && seen.stop === '#/stop/u3' && /^#\/(practice|quest)$/.test(seen.practice)
    && seen.library === '#/library' && seen.play === '#/play' && /^#\/shop/.test(seen.hive),
    'each screen has its own route: ' + Object.values(seen).join(' '));

  /* ---- 2. Back retraces them, inside the app ---- */
  const back = async () => { await pg.goBack({ timeout: 4000 }).catch(() => null); await pg.waitForTimeout(900); return where(pg); };
  let w = await back(); const b1 = w.nav === 'games' && w.h === '#/play';
  w = await back(); const b2 = w.nav === 'explore' && w.h === '#/library';
  w = await back(); const b3 = w.nav === 'coach' || w.nav === 'quest';
  w = await back(); const b4 = w.nav === 'trail' && w.tv === 'unit' && w.tu === 'u3';
  w = await back(); const b5 = w.nav === 'trail' && w.tv === 'map';
  w = await back(); const b6 = w.nav === 'home' && w.h === '#/home';
  ok(b1 && b2 && b3 && b4 && b5 && b6, `Back walks the Shop → Play → Library → Practice → the stop → the Atlas → Home (${[b1, b2, b3, b4, b5, b6].map(x => x ? '✓' : '✗').join('')})`);
  w = await back(); w = await back(); w = await back();
  ok(w.url.indexOf('index.html') > 0 && w.screen === 'app' && w.nav === 'home', 'three more Backs on Home never leave the app (' + w.url.split('/').pop() + ')');

  /* ---- 3. a layer closes before the screen goes ---- */
  await tab('trail');
  await pg.evaluate(() => { state.drawerOpen = true; render(); }); await pg.waitForTimeout(200);
  w = await back();
  ok(!w.drawer && w.nav === 'trail', 'Back with the drawer open closes the drawer and stays on the Atlas');
  /* this household has a PIN, so Settings asks for it first */
  await pg.evaluate(() => { app.setNav('settings'); '1234'.split('').forEach(k => app.pinKey(k)); }); await pg.waitForTimeout(400);
  const hs = (await where(pg)).h;
  w = await back();
  ok(hs === '#/settings' && !w.settings && w.nav === 'trail' && w.h === '#/atlas', 'Settings is #/settings, and Back closes it onto the screen beneath (' + hs + ' → ' + w.h + ')');

  /* ---- 4. Back out of a drill stops it ---- */
  await pg.evaluate(() => app.trailUnit('u3')); await pg.waitForTimeout(700);
  await pg.evaluate(() => app.trailPractice()); await pg.waitForTimeout(1500);
  const d1 = await where(pg);
  const hiveInDrill = await pg.evaluate(() => !!document.querySelector('.sb-fam-hive'));
  w = await back();
  ok(d1.nav === 'train' && d1.h === '#/practice/drill' && w.nav === 'trail' && w.tu === 'u3' && w.h === '#/stop/u3',
    `a drill has its route (${d1.h}); Back stops it and returns to the stop (${w.h})`);
  ok(!hiveInDrill && await pg.evaluate(() => !!document.querySelector('.sb-fam-hive')), 'the ⬡ back-to-Hive hides while the drill word is live, and returns after');
  await ctx.close();

  /* ---- 5. deep links open where they say, through the same gates ---- */
  ({ ctx, pg } = await open(b, URL + '#/atlas', errs));
  w = await where(pg);
  ok(w.nav === 'trail' && w.tv === 'map' && w.h === '#/atlas', '#/atlas opens the Atlas');
  await ctx.close();
  ({ ctx, pg } = await open(b, URL + '#/stop/u2', errs));
  w = await where(pg);
  ok(w.nav === 'trail' && w.tv === 'unit' && w.tu === 'u2', '#/stop/u2 opens that stop');
  await ctx.close();
  ({ ctx, pg } = await open(b, URL + '#/stop/u40', errs));
  w = await where(pg);
  ok(!(w.tv === 'unit' && w.tu === 'u40'), 'an address cannot open a locked stop (#/stop/u40 stays shut — ' + w.h + ')');
  await ctx.close();
  ({ ctx, pg } = await open(b, URL + '#/continue', errs));
  await pg.waitForTimeout(800);
  w = await where(pg);
  const want = await pg.evaluate(() => SB_NEXT_STEP().arg);
  ok((w.nav === 'trail' || (w.nav === 'concepts' && w.sel)) && w.tu === want, `#/continue opens the Continue target directly (${w.nav} ${w.tu} = ${want})`);
  w = await back(); if (w.nav !== 'home') w = await back();
  ok(w.nav === 'home' && w.screen === 'app', 'and Back from there walks back to Home, not out to the Hive');
  await ctx.close();

  /* ---- 6. ?from=hive: the chip home to the family's day ---- */
  ({ ctx, pg } = await open(b, URL.replace('index.html', 'index.html?from=hive') + '#/continue', errs, { width: 390, height: 844 }));
  await pg.waitForTimeout(600);
  const chip = await pg.evaluate(() => { const a = document.querySelector('a.sb-fam-day'); if (!a) return null; const r = a.getBoundingClientRect();
    return { href: a.getAttribute('href'), txt: a.textContent, vis: r.width > 0 && r.top >= 0 && r.bottom <= innerHeight, ow: document.documentElement.scrollWidth > innerWidth + 1 }; });
  ok(!!chip && chip.href === HIVE && /my day/.test(chip.txt) && chip.vis && !chip.ow, '?from=hive shows "← back to my day" in the top bar, pointing at the Hive, with no overflow at 390px');
  await pg.evaluate(() => { app.trailPractice && app.trailUnit(SB_NEXT_STEP().arg); }); await pg.waitForTimeout(600);
  await pg.evaluate(() => app.trailPractice()); await pg.waitForTimeout(1500);
  ok(await pg.evaluate(() => state.nav === 'train' && !document.querySelector('a.sb-fam-day')), 'and the chip hides inside a drill');
  await ctx.close();

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
