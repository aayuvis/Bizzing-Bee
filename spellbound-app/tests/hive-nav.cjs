/* My Hive is one page: no section bar, Worlds merged in as a tiled tab, the bee moved
   to the Bee Band page. And the Ultra pill is behind the paywall — advModeOn used to
   grant the Advanced Pack to any free child at journey level 12 or Bee Band 7, which
   advanced.js's own comment says readiness must never do.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/hive-nav.cjs */
const { chromium } = require('playwright');
const root = require('path').resolve(__dirname, '..');
const child = (over) => Object.assign({ name:'T', avatar:'bee', coins:5000, pow:{}, freezes:0, streak:3,
  lists:{ default:{xp:30}, journey:{xp:0} }, activeList:'default', missed:[], unlockedThemes:['spellbound'],
  beeAcc:{}, unlockedConcepts:{}, unlockedLists:{}, questPath:'journey' }, over||{});

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  for (const vp of [{width:1180,height:900,n:'desktop'},{width:390,height:844,n:'phone'}]) {
    const pg = await b.newPage({ viewport: { width: vp.width, height: vp.height } });
    pg.on('pageerror', e => errs.push(vp.n + ' pageerror: ' + e.message));
    await pg.goto('file://' + root + '/index.html');
    await pg.waitForTimeout(2800);
    await pg.evaluate(c => { state.children=[c]; state.activeIdx=0; state.screen='app'; state.premium=false; state.devUnlock=false; }, child());

    // --- no section bar above the Hive, on any of its screens ---
    for (const [act, want] of [['openCollection','collection'], ['openEvo','evolution'], ['openWorlds','collection']]) {
      await pg.evaluate(a => app[a](), act); await pg.waitForTimeout(500);
      const r = await pg.evaluate(() => ({ nav: state.nav, tab: state.collTab,
        segs: ['openCollection','openEvo','openWorlds'].filter(a => document.querySelector('[data-act="'+a+'"]')).length,
        ow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2 }));
      if (r.nav !== want) errs.push(vp.n + ' ' + act + ' -> nav=' + r.nav);
      if (r.ow) errs.push(vp.n + ' H-OVERFLOW on ' + want);
      if (act === 'openWorlds' && r.tab !== 'worlds') errs.push(vp.n + ' openWorlds did not select the worlds tab');
    }
    // --- "Your bee" is gone from the Hive and lives on the Bee Band page ---
    await pg.evaluate(() => { state.collTab='badges'; app.openCollection(); }); await pg.waitForTimeout(400);
    if (await pg.evaluate(() => !!document.querySelector('[data-act="openEvo"]')))
      errs.push(vp.n + ' the Hive still links to Your bee');
    await pg.evaluate(() => app.setNav('beeband')); await pg.waitForTimeout(600);
    if (!await pg.evaluate(() => !!document.querySelector('[data-act="openEvo"]')))
      errs.push(vp.n + ' the Bee Band page does not reach Your bee');

    // --- Worlds tab is tiled, locked worlds greyed, price under the tile ---
    await pg.evaluate(() => { state.collTab='worlds'; app.openCollection(); }); await pg.waitForTimeout(600);
    const w = await pg.evaluate(() => {
      const buys = [...document.querySelectorAll('[data-act="buyTheme"]')];
      const grey = buys.filter(el => { const band = el.querySelector('.wh-band');
        return band && /grayscale\(1\)/.test(getComputedStyle(band).filter || band.getAttribute('style') || ''); });
      const priced = buys.filter(el => /Unlock/.test(el.innerText));
      // the price must sit BELOW the artwork, not on it
      const belowArt = buys.filter(el => { const band = el.querySelector('.wh-band');
        const tag = [...el.querySelectorAll('span')].find(s => /Unlock/.test(s.textContent));
        return band && tag && tag.getBoundingClientRect().top >= band.getBoundingClientRect().bottom - 1; });
      return { buys: buys.length, grey: grey.length, priced: priced.length, belowArt: belowArt.length,
               hero: !!document.querySelector('.wh-band') };
    });
    if (!w.hero) errs.push(vp.n + ' the Worlds tab is not the tiled hero view');
    if (!w.buys) errs.push(vp.n + ' no locked world rendered');
    if (w.grey !== w.buys) errs.push(vp.n + ' locked worlds not greyed: ' + w.grey + '/' + w.buys);
    if (w.priced !== w.buys) errs.push(vp.n + ' locked worlds missing a price: ' + w.priced + '/' + w.buys);
    if (w.belowArt !== w.buys) errs.push(vp.n + ' price is not below the tile: ' + w.belowArt + '/' + w.buys);

    // --- the Ultra pill ---
    const ultra = await pg.evaluate(() => {
      const out = {};
      const pill = () => { app.coachSetupOpen && app.coachSetupOpen(); state.coachMode=null; app.openCoach();
        return document.querySelector('[data-act="ultraUpsell"],[data-act="pickUltra"],[data-act="openAdvJourney"]'); };
      // a free child at journey level 12 / band 7 must NOT own the pack
      const c = state.children[0];
      c.lists.journey.xp = 100000; c.band = 9;
      out.readyButFree = advModeOn(c);
      out.readySignal  = advReadyOn(c);
      // a child who bought it does
      c.advOn = true; out.paidOwns = advModeOn(c); delete c.advOn;
      return out;
    });
    if (ultra.readyButFree) errs.push(vp.n + ' a free level-12 / band-9 child still gets the Advanced Pack');
    if (!ultra.readySignal) errs.push(vp.n + ' advReadyOn did not fire at level 12 / band 9');
    if (!ultra.paidOwns) errs.push(vp.n + ' a child who bought the pack does not get it');
    await pg.evaluate(() => { const c=state.children[0]; c.lists.journey.xp=0; c.band=null; delete c.advOn;
      state.vocPick=false; app.openCoach(); }); await pg.waitForTimeout(1200);
    const locked = await pg.evaluate(() => { const el=document.querySelector('[data-act="ultraUpsell"]');
      return el ? {t:el.innerText.trim()} : {t:null, nav:state.nav, mode:state.coachMode}; });
    if (!locked.t) errs.push(vp.n + ' the locked Ultra pill is not shown at all (nav=' + locked.nav + ' mode=' + locked.mode + ')');
    else if (!/Ultra/.test(locked.t)) errs.push(vp.n + ' locked Ultra pill reads: ' + locked.t);
    await pg.close();
  }
  await b.close();
  console.log(errs.length ? 'FAIL\n' + errs.join('\n') : 'PASS — one Hive page, tiled Worlds with greyed locks and prices below, bee on the band page, Ultra behind the paywall');
  process.exit(errs.length ? 1 : 0);
})();
