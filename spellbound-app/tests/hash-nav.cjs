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
     · #/continue lands exactly where Home's Continue goes — the Atlas, on the child's region
       with their stop selected (owner, 4 Oct 2026) — and Back from there is Home;
     · ?from=hive shows "← back to my day", pointing at the Hive, and hides inside a drill;
     · (FIX2) a typed address is never swallowed by a PIN dialog or any other layer, and
       #/journeys opens Word Journeys rather than a PIN over the screen beneath;
     · (audit v4 N2) Daily Buzz is a screen in the shell, #/daily: the top bar and tab bar around
       its board, Play marked, Back to #/play with nothing left standing, and its keys never
       steal what is typed into the search box.
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
  drawer: !!state.drawerOpen, settings: !!state.settingsOpen, sel: !!state.conceptSel, act: state.trailAct, stop: state.trailStop }));

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
  const want = await pg.evaluate(() => { const n = SB_NEXT_STEP(); return { act: n.actId, node: n.node, h: '#/atlas/' + n.crs + '/' + n.actId }; });
  ok(w.nav === 'trail' && w.tv === 'act' && w.act === want.act && w.stop === want.node && w.h === want.h, `#/continue opens where Continue goes — the Atlas region, the stop selected (${w.h} stop ${w.stop} = ${want.h} stop ${want.node})`);
  w = await back(); if (w.nav !== 'home') w = await back();
  ok(w.nav === 'home' && w.screen === 'app', 'and Back from there walks back to Home, not out to the Hive');
  await ctx.close();

  /* ---- 6. ?from=hive: the chip home to the family's day ---- */
  ({ ctx, pg } = await open(b, URL.replace('index.html', 'index.html?from=hive') + '#/continue', errs, { width: 390, height: 844 }));
  await pg.waitForTimeout(600);
  const chip = await pg.evaluate(() => { const a = document.querySelector('a.sb-fam-day'); if (!a) return null; const r = a.getBoundingClientRect();
    return { href: a.getAttribute('href'), txt: a.textContent, vis: r.width > 0 && r.top >= 0 && r.bottom <= innerHeight, ow: document.documentElement.scrollWidth > innerWidth + 1 }; });
  ok(!!chip && chip.href === HIVE && /my day/.test(chip.txt) && chip.vis && !chip.ow, '?from=hive shows "← back to my day" in the top bar, pointing at the Hive, with no overflow at 390px');
  w = await where(pg);
  ok(w.nav === 'trail' && w.tv === 'act' && w.stop === await pg.evaluate(() => SB_NEXT_STEP().node), `and ?from=hive#/continue lands on the Atlas region too, the stop selected (${w.h})`);
  await pg.evaluate(() => { app.trailPractice && app.trailUnit(SB_NEXT_STEP().arg); }); await pg.waitForTimeout(600);
  await pg.evaluate(() => app.trailPractice()); await pg.waitForTimeout(1500);
  ok(await pg.evaluate(() => state.nav === 'train' && !document.querySelector('a.sb-fam-day')), 'and the chip hides inside a drill');
  await ctx.close();

  /* ---- 7. (FIX2 #5) no screen is ever trapped under a layer ----
     #/journeys put a grown-up PIN over the Word Finder, and every address typed after it was
     swallowed by that dialog and pushed back. Word Journeys is a child's own earned tales and
     opens for them; a NEW address closes whatever layer is up and goes where it says; Back still
     closes a layer first and stays, because Back is not an address. */
  ({ ctx, pg } = await open(b, URL + '#/journeys', errs));
  const layers = () => pg.evaluate(() => ({ h: location.hash, nav: state.nav, pin: !!state.pinDlg, drawer: !!state.drawerOpen, card: !!state.wordCard, tiers: !!state.showTiers,
    modal: !!document.querySelector('[data-pin-dlg],[data-act="closeTiers"],[data-act="closePaywall"]') }));
  let L = await layers();
  ok(L.nav === 'journeys' && !L.pin && !L.modal && L.h === '#/journeys', `#/journeys opens Word Journeys for a child, with no PIN in front of it (${L.nav}${L.pin ? ', PIN up' : ''})`);
  const go = async h => { await pg.evaluate(h => { location.hash = h; }, h); await pg.waitForTimeout(1100); return layers(); };
  await pg.evaluate(() => app.setNav('parent')); await pg.waitForTimeout(250);
  const pinUp = (await layers()).pin;
  L = await go('#/atlas');
  const t1 = pinUp && L.nav === 'trail' && !L.pin && !L.modal && L.h === '#/atlas';
  L = await go('#/library');
  const t2 = L.nav === 'explore' && !L.pin && L.h === '#/library';
  ok(t1 && t2, `with a PIN dialog left open, a typed address closes it and goes there — and so does the next (${t1 ? '✓' : '✗'}${t2 ? '✓' : '✗'} ${L.h})`);
  await pg.evaluate(() => { state.drawerOpen = true; state.wordCard = { w: 'necessary' }; state.showTiers = true; render(); }); await pg.waitForTimeout(200);
  L = await go('#/play');
  ok(L.nav === 'games' && !L.drawer && !L.card && !L.tiers && !L.pin && !L.modal, 'every other layer goes with it: drawer, word card and plan sheet are gone and Play is on screen (' + JSON.stringify(L) + ')');
  await pg.evaluate(() => app.setNav('parent')); await pg.waitForTimeout(250);
  await pg.evaluate(() => { const a = document.createElement('a'); a.href = '#/play'; document.body.appendChild(a); a.click(); a.remove(); }); await pg.waitForTimeout(700);
  L = await layers();
  ok(L.nav === 'games' && !L.pin && !L.modal, 'a link to the screen already beneath the dialog uncovers it too');
  await pg.evaluate(() => app.setNav('parent')); await pg.waitForTimeout(250);
  w = await back(); L = await layers();
  ok(!L.pin && L.nav === 'games' && L.h === '#/play', 'Back with the PIN open still only closes it and stays on Play (' + L.h + ')');
  await ctx.close();

  /* ---- 8. (audit v4) an address to a gated tool meets the same lock as a tap on its tile ----
     #/quotes, #/vocab, #/typing, #/ipatrain and #/trivtrain went through setNav and drew the page
     for a free child, skipping the plan lock and the PIN in front of the plan sheet; #/adv drew
     the Advanced Pack's sales page with no PIN. Each now goes through the opener its tile taps. */
  {
    ({ ctx, pg } = await open(b, URL, errs));
    const GATED = { quotes: 'quotes', vocab: 'vocab', typing: 'typing', ipatrain: 'ipatrain', trivtrain: 'trivtrain', adv: 'adv' };
    const look = () => pg.evaluate(() => ({ nav: state.nav, pin: !!state.pinDlg, tiers: !!state.showTiers, closer: !!document.querySelector('[data-act="closeTiers"],[data-act="closePaywall"]') }));
    const calm = () => pg.evaluate(() => { state.pinDlg = null; state.showTiers = false; state.showPaywall = false; state._planOk = false; app.setNav('home'); });
    for (const tier of ['free', 'regional']) {
      await pg.evaluate(t => { active().tier = t === 'free' ? undefined : t; active().addons = {}; }, tier);
      for (const [route, nav] of Object.entries(GATED)) {
        await calm(); await pg.waitForTimeout(150);
        await pg.evaluate(r => { location.hash = '#/' + r; }, route); await pg.waitForTimeout(700);
        const r = await look();
        if (tier === 'free' || route === 'adv') ok(r.nav !== nav && r.pin && !r.closer, `${tier}: #/${route} meets the lock its tile meets — the PIN, and no ${nav} screen and no plan sheet under it (${JSON.stringify(r)})`);
        else ok(r.nav === nav && !r.pin, `${tier}: #/${route} opens its screen (${r.nav})`);
      }
    }
    await ctx.close();
  }
  /* DAILY BUZZ IS A SCREEN IN THE SHELL (audit v4 N2). It opened as a full-screen overlay with only
     "← Games" on it — no top bar, no tabs, no address — and Back left it standing over the next screen. */
  ({ ctx, pg } = await open(b, URL + '#/play', errs, { width: 390, height: 844 }));
  const daily = () => pg.evaluate(() => { const tab = document.querySelector('nav.sb-tabbar [data-arg="games"]');
    return { h: location.hash, nav: state.nav, bar: !!document.querySelector('#root .sb-fam-bar'), tabbar: !!document.querySelector('#root nav.sb-tabbar'),
      play: !!tab && tab.getAttribute('aria-current') === 'page', inRoot: document.querySelectorAll('#root #db-host .db-cell').length,
      loose: [...document.body.children].filter(e => /(^|\s)db-/.test(e.className || '')).length,
      row0: [...document.querySelectorAll('#db-host .db-row[data-r="0"] .db-cell')].map(c => c.textContent).join('') }; });
  /* 4 Oct 2026 (games spec §3.1): the Daily Buzz banner left the Play tab (Daily Bee is the Train door's
     card and takes #/daily when it lands), so the screen is opened through its opener, not the banner */
  await pg.evaluate(() => app.openDaily()); await pg.waitForTimeout(700);
  let D = await daily();
  ok(D.h === '#/daily' && D.nav === 'daily' && D.bar && D.tabbar && D.play && D.inRoot === 30 && !D.loose,
    'Daily Buzz opens as a screen in the shell — #/daily, the top bar and the tab bar around its board, Play marked, nothing drawn over the app (' + JSON.stringify(D) + ')');
  for (const k of 'cat') await pg.keyboard.press(k);
  await pg.evaluate(() => render()); await pg.waitForTimeout(150);
  D = await daily();
  ok(D.row0 === 'cat', 'letters typed on a keyboard land on the board and survive a re-render of the screen (' + D.row0 + ')');
  await pg.focus('.sb-hsearch input'); await pg.keyboard.type('dog'); await pg.waitForTimeout(150);
  const sv = await pg.evaluate(() => document.querySelector('.sb-hsearch input').value);
  D = await daily();
  ok(D.row0 === 'cat' && sv === 'dog', 'typing into the search box types into the search box, not the board (' + D.row0 + ' / ' + sv + ')');
  await pg.evaluate(() => { const i = document.querySelector('.sb-hsearch input'); i.value = ''; i.blur(); });
  await back(); D = await daily();
  ok(D.h === '#/play' && D.nav === 'games' && !D.inRoot && !D.loose, 'Back goes to #/play and leaves nothing of Daily Buzz on screen (' + D.h + ')');
  await pg.evaluate(() => { location.hash = '#/daily'; }); await pg.waitForTimeout(900);
  D = await daily();
  ok(D.nav === 'daily' && D.inRoot === 30 && D.bar && D.row0 === 'cat', 'the address #/daily opens it directly, today\'s letters still there (' + D.nav + ')');
  await ctx.close();

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
