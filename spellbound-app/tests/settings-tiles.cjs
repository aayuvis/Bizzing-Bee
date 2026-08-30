/* Settings: quick tiles, a folded Advanced Pack, a display name and an age RANGE.
   Two sections of look-alike rows (Look & feel, Sound & voice) became one grid of ten
   tap-to-change tiles. The Advanced Pack is inside Account & subscription, not a card
   beside it. Nobody is asked for an exact age, and the buddy row is gone (it could only
   tell you to go to the Hive, which is where you actually change it).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/settings-tiles.cjs */
const { chromium } = require('playwright');
const root = require('path').resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  for (const vp of [{width:1180,height:1400,n:'desktop'},{width:390,height:1400,n:'phone'}]) {
    const pg = await b.newPage({ viewport: { width: vp.width, height: vp.height } });
    pg.on('pageerror', e => errs.push(vp.n + ' pageerror: ' + e.message));
    await pg.goto('file://' + root + '/index.html');
    await pg.waitForTimeout(2800);
    await pg.evaluate(() => { state.children=[{name:'T',avatar:'bee',coins:900,pow:{},age:9,
      lists:{default:{xp:30}},activeList:'default',missed:[],unlockedThemes:['spellbound'],
      unlockedConcepts:{},unlockedLists:{},questPath:'journey'}];
      state.activeIdx=0; state.screen='app'; state.devUnlock=false; app.setNav('settings'); });
    await pg.waitForTimeout(800);

    const r = await pg.evaluate(() => ({
      tiles: document.querySelectorAll('.sb-qtile').length,
      grid: !!document.querySelector('.sb-qgrid'),
      lit: document.querySelectorAll('.sb-qtile.on').length,
      txt: document.body.innerText,
      ow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      // the pack must sit INSIDE the account card
      advInAccount: (() => { const sw = document.querySelector('[data-act="toggleAdvPack"]');
        if (!sw) return 'no switch';
        const card = sw.closest('.sb-card');
        return card && /Account/.test(card.innerText) ? true : 'outside the account card'; })(),
      bands: [...document.querySelectorAll('[data-act="setAgeBand"]')].map(e => e.textContent.trim().split('\n')[0]),
      pressed: [...document.querySelectorAll('[data-act="setAgeBand"][aria-pressed="true"]')].length,
      ageSlider: !!document.querySelector('[data-inp="profAge"]'),
      backPill: !!document.querySelector('button[aria-label^="Back to"]'),
    }));
    if (!r.grid) errs.push(vp.n + ': no tile grid');
    if (r.tiles !== 11) errs.push(vp.n + ': ' + r.tiles + ' tiles (want 11 — the Opening-splash toggle joined the grid Aug-30)');
    if (r.ow) errs.push(vp.n + ': H-OVERFLOW');
    if (r.advInAccount !== true) errs.push(vp.n + ': Advanced Pack ' + r.advInAccount);
    if (r.ageSlider) errs.push(vp.n + ': the exact-age slider is still there');
    if (r.bands.length !== 4) errs.push(vp.n + ': ' + r.bands.length + ' age bands (want 4)');
    if (r.pressed !== 1) errs.push(vp.n + ': ' + r.pressed + ' age bands selected (want 1)');
    if (/Buddy/.test(r.txt)) errs.push(vp.n + ': the Buddy row is still in Settings');
    if (/Look &amp; feel|Look & feel/.test(r.txt)) errs.push(vp.n + ': "Look & feel" section survived');
    if (/Sound & voice/.test(r.txt)) errs.push(vp.n + ': "Sound & voice" section survived');
    if (!/Display name/.test(r.txt)) errs.push(vp.n + ': no "Display name" label');
    if (!/Age range/.test(r.txt)) errs.push(vp.n + ': no "Age range" label');
    if (!r.backPill) errs.push(vp.n + ': no back pill on Settings');

    // a toggle tile actually toggles, and a choice tile actually cycles
    const act = await pg.evaluate(async () => {
      const out = {};
      const calm = () => document.querySelector('[data-act="toggleCalm"]');
      const before = calm().classList.contains('on');
      calm().click(); await new Promise(r => setTimeout(r, 250));
      out.toggled = calm().classList.contains('on') !== before;
      const modes = []; 
      for (let i = 0; i < 3; i++) { const t = document.querySelector('[data-act="setMode"]');
        modes.push(t.querySelector('.sb-qtile-v').textContent.trim());
        t.click(); await new Promise(r => setTimeout(r, 250)); }
      out.modes = modes;
      // the age band writes the band AND keeps c.age as its midpoint
      document.querySelector('[data-act="setAgeBand"][data-arg="11-13"]').click();
      await new Promise(r => setTimeout(r, 250));
      const c = state.children[0]; out.band = c.ageBand; out.age = c.age;
      return out;
    });
    if (!act.toggled) errs.push(vp.n + ': a toggle tile did not toggle');
    if (new Set(act.modes).size !== 3) errs.push(vp.n + ': the Background tile did not cycle — ' + act.modes.join(','));
    if (act.band !== '11-13') errs.push(vp.n + ': age band stored as ' + act.band);
    if (act.age !== 12) errs.push(vp.n + ': c.age midpoint is ' + act.age + ' (want 12, so old readers still work)');
    await pg.close();
  }
  await b.close();
  console.log(errs.length ? 'FAIL\n' + errs.join('\n') : 'PASS — ten quick tiles that toggle and cycle, pack folded into Account, age is a range with a working midpoint');
  process.exit(errs.length ? 1 : 0);
})();
