/* Settings: the FIVE family sections (FIX-BEE v2, family standard §5), a display name and an age RANGE.
   The quick-tile grid of Aug 2026 was replaced by the family's five sections — Me · Sound & music ·
   Look · Comfort · Grown-ups — so every Bizzing app's Settings reads the same. What this file kept
   from the tile era, because it is still true: nobody is asked for an exact age (four bands, the
   value of record, with c.age written as the band's midpoint so old readers keep working); there is
   a Display name; no Buddy row; a back pill; nothing overflows on a phone; a switch switches and the
   Look choice moves through all three looks. The Advanced Pack and the plan live behind the PIN in
   Grown-ups (trust-v2 checks that half).
   Run: node tests/settings-tiles.cjs */
const { chromium } = require('playwright');
const root = require('path').resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => require('fs').existsSync(p)) });
  const errs = [];
  for (const vp of [{ width: 1180, height: 1400, n: 'desktop' }, { width: 390, height: 1400, n: 'phone' }]) {
    const pg = await b.newPage({ viewport: { width: vp.width, height: vp.height } });
    pg.on('pageerror', e => errs.push(vp.n + ' pageerror: ' + e.message));
    await pg.goto('file://' + root + '/index.html');
    await pg.waitForTimeout(2800);
    await pg.evaluate(() => { state.children = [{ name: 'T', avatar: 'bee', coins: 900, pow: {}, age: 9,
      lists: { default: { xp: 30 } }, activeList: 'default', missed: [], unlockedThemes: ['spellbound'],
      unlockedConcepts: {}, unlockedLists: {}, questPath: 'journey' }];
      state.parentPin = state.parentPin || '2468';
      state.activeIdx = 0; state.screen = 'app'; state.devUnlock = false; app.setNav('settings'); });
    await pg.waitForTimeout(800);

    const r = await pg.evaluate(() => { const ov = document.getElementById('sb-set-ov') || document.body; return {
      secs: [...ov.querySelectorAll('.bz-set-sec h3')].map(h => h.textContent.replace(/\s+/g, ' ').trim()),
      txt: ov.innerText,
      ow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      ageSlider: !!document.querySelector('[data-inp="profAge"]'),
      backPill: !!ov.querySelector('button[aria-label^="Back to"], [data-act="closeSettings"]'),
    }; });
    const want = ['Me', 'Sound & music', 'Look', 'Comfort', 'Grown-ups'];
    if (r.secs.length !== 5 || !want.every((w, i) => (r.secs[i] || '').includes(w))) errs.push(vp.n + ': sections are ' + r.secs.join(' · '));
    if (r.ow) errs.push(vp.n + ': H-OVERFLOW');
    if (r.ageSlider) errs.push(vp.n + ': the exact-age slider is still there');
    if (/Buddy/.test(r.txt)) errs.push(vp.n + ': the Buddy row is still in Settings');
    if (!/Display name/.test(r.txt)) errs.push(vp.n + ': no "Display name" label');
    if (!r.backPill) errs.push(vp.n + ': no way back out of Settings');

    const act = await pg.evaluate(async () => {
      const W = () => new Promise(r => setTimeout(r, 250)); const out = {};
      const calm = () => document.querySelector('[data-act="toggleCalm"]');
      const before = !!state.calmMode; calm().click(); await W(); out.toggled = !!state.calmMode !== before; calm().click(); await W();
      const modes = [];
      for (const v of ['light', 'white', 'dusk']) { const t = document.querySelector('[data-act="setModePref"][data-arg="' + v + '"]'); if (t) { t.click(); await W(); } modes.push(document.documentElement.getAttribute('data-mode')); }
      out.modes = modes;
      document.querySelector('[data-act="setModePref"][data-arg="light"]').click(); await W();
      /* the age range is a grown-up's setting: through the PIN */
      app.setGrownOpen(); await W(); for (const k of state.parentPin) app.pinKey(k); await W();
      out.bands = [...document.querySelectorAll('[data-act="setAgeBand"]')].length;
      const btn = document.querySelector('[data-act="setAgeBand"][data-arg="11-13"]'); if (btn) { btn.click(); await W(); }
      out.checked = [...document.querySelectorAll('[data-act="setAgeBand"][aria-checked="true"]')].length;
      out.ageLabel = /Age range/.test((document.getElementById('sb-set-ov') || document.body).innerText);
      const c = state.children[0]; out.band = c.ageBand; out.age = c.age;
      return out;
    });
    if (!act.toggled) errs.push(vp.n + ': the Calm mode switch did not switch');
    if (new Set(act.modes).size !== 3) errs.push(vp.n + ': the Look choice did not move through three looks — ' + act.modes.join(','));
    if (act.bands !== 4) errs.push(vp.n + ': ' + act.bands + ' age bands (want 4)');
    if (act.checked !== 1) errs.push(vp.n + ': ' + act.checked + ' age bands selected (want 1)');
    if (!act.ageLabel) errs.push(vp.n + ': no "Age range" label behind the PIN');
    if (act.band !== '11-13') errs.push(vp.n + ': age band stored as ' + act.band);
    if (act.age !== 12) errs.push(vp.n + ': c.age midpoint is ' + act.age + ' (want 12, so old readers still work)');
    await pg.close();
  }
  await b.close();
  console.log(errs.length ? 'FAIL\n' + errs.join('\n') : 'PASS — five family sections, a switch that switches, three looks, age is a range with a working midpoint');
  process.exit(errs.length ? 1 : 0);
})();
