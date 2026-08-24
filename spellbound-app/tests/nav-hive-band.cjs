/* My Hive is a nav tab; the Bee Band sits on Home under "Coach speaks"; nothing flashes.
   The Hive used to be reached only through a small round face in the top-right, which
   read as a profile menu rather than a place. The band pill left the header with it.
   "Find your level" pulsed a shadow ring and hopped 1.5px twice every four seconds —
   now it only sheens.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/nav-hive-band.cjs */
const { chromium } = require('playwright');
const root = require('path').resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  for (const vp of [{width:1180,height:1000,n:'desktop'},{width:390,height:844,n:'phone'}]) {
    const pg = await b.newPage({ viewport: { width: vp.width, height: vp.height } });
    pg.on('pageerror', e => errs.push(vp.n + ' pageerror: ' + e.message));
    await pg.goto('file://' + root + '/index.html');
    await pg.waitForTimeout(2800);
    // a speller who has NOT taken the placement — the calibrating state
    await pg.evaluate(() => { state.children=[{name:'T',avatar:'bee',coins:900,pow:{},age:9,
      lists:{default:{xp:2}},activeList:'default',missed:[],unlockedThemes:['spellbound'],
      unlockedConcepts:{},unlockedLists:{},questPath:'journey'}];
      state.activeIdx=0; state.screen='app'; app.setNav('home'); });
    await pg.waitForTimeout(900);

    const r = await pg.evaluate(() => {
      const tabs = [...document.querySelectorAll('[data-act="setNav"][data-arg]')]
        .filter(e => e.closest('.sb-topnav') || e.closest('.sb-tabbar'))
        .map(e => e.dataset.arg);
      const band = document.querySelector('[data-act="startLevelTest"],[data-act="setNav"][data-arg="beeband"]');
      const rings = document.querySelector('[data-act="openCoachDesk"]');
      const out = { tabs, txt: document.body.innerText,
        ow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
        hiveTab: tabs.includes('collection'),
        roundFace: !!document.querySelector('.sb-hdr-ico.round'),
        bandInHeader: !!(band && band.closest('header, .sb-hdr, [class*="hdr"]')),
        nestedButton: !!document.querySelector('button button') };
      if (band && rings) { const br = band.getBoundingClientRect(), rr = rings.getBoundingClientRect();
        out.bandBelowRings = br.top >= rr.bottom - 2;
        out.bandOnHome = true;
        const cs = getComputedStyle(band);
        out.bandAnim = cs.animationName;
        const af = getComputedStyle(band, '::after');
        out.sheen = af.animationName; }
      return out;
    });
    if (!r.hiveTab) errs.push(vp.n + ': My Hive is not a nav tab');
    if (r.roundFace) errs.push(vp.n + ': the round Bizzy button is still in the header');
    if (!r.bandOnHome) errs.push(vp.n + ': the Bee Band is not on Home');
    if (r.bandBelowRings === false) errs.push(vp.n + ': the band is not below the rings card');
    if (r.nestedButton) errs.push(vp.n + ': a button is nested inside a button (invalid, and the inner one will not fire)');
    if (r.ow) errs.push(vp.n + ': H-OVERFLOW on Home');
    if (!/Coach speaks/.test(r.txt)) errs.push(vp.n + ': the rings card does not say "Coach speaks"');
    if (/what Bizzy makes of it/.test(r.txt)) errs.push(vp.n + ': the old vague wording survived');
    if (r.bandAnim && r.bandAnim !== 'none') errs.push(vp.n + ': the band tile still animates itself (' + r.bandAnim + ') — it should only sheen');
    if (r.sheen !== 'sb-band-sheen') errs.push(vp.n + ': the sheen is missing (::after animation = ' + r.sheen + ')');

    // the tab actually opens the Hive
    await pg.evaluate(() => { const t=[...document.querySelectorAll('[data-act="setNav"][data-arg="collection"]')]
      .find(e => e.closest('.sb-topnav') || e.closest('.sb-tabbar')); if (t) t.click(); });
    await pg.waitForTimeout(600);
    if (await pg.evaluate(() => state.nav) !== 'collection') errs.push(vp.n + ': the Hive tab did not open the Hive');
    await pg.close();
  }
  await b.close();
  console.log(errs.length ? 'FAIL\n' + errs.join('\n') : 'PASS — Hive is a tab, band sits under Coach speaks on Home, and it sheens rather than flashes');
  process.exit(errs.length ? 1 : 0);
})();
