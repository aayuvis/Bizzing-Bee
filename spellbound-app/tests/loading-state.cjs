/* A screen that waits for its data shows the HIVE FILLING, not a blank flash or a bare
   line of text. The boot screen fills a comb while the app starts; the Concepts library
   printed "Loading chapters…" and Trivia Training rendered a page head with an empty body,
   both of which read as a different product than the one that just started up.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/loading-state.cjs */
const { chromium } = require('playwright');
const root = require('path').resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  const pg = await b.newPage({ viewport: { width: 1180, height: 900 } });
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await pg.goto('file://' + root + '/index.html');
  await pg.waitForTimeout(3000);
  await pg.evaluate(() => { state.children=[{name:'T',avatar:'bee',coins:900,pow:{},age:9,
    lists:{default:{xp:30}},activeList:'default',missed:[],unlockedThemes:['spellbound'],
    unlockedConcepts:{},unlockedLists:{},questPath:'journey'}];
    state.activeIdx=0; state.screen='app'; state.devUnlock=true; });

  // force each screen into its waiting state and look at what is on it
  const cases = [
    ['concepts', () => { state.conceptData=null; state.conceptLoading=true; app.setNav('concepts'); }],
  ];
  for (const [name, setup] of cases) {
    await pg.evaluate(setup); await pg.waitForTimeout(900);
    const r = await pg.evaluate(() => {
      const h = document.querySelector('.sb-hive');
      const txt = (document.querySelector('.sb-content') || document.body).innerText.trim();
      return { hive: !!h, cells: document.querySelectorAll('.sb-hive-cell').length,
        anim: h ? getComputedStyle(document.querySelector('.sb-hive-cell')).animationName : null,
        bodyLen: txt.length, bare: /^Loading[^\n]*$/i.test(txt) };
    });
    if (!r.hive) errs.push(name + ': no hive loader while waiting (body ' + r.bodyLen + ' chars' + (r.bare ? ', bare text' : '') + ')');
    else {
      if (r.cells !== 10) errs.push(name + ': hive has ' + r.cells + ' cells (want 10)');
      if (r.anim !== 'sb-boot-fill') errs.push(name + ': cells animate with ' + r.anim + ', not the boot fill');
      console.log('  ' + name.padEnd(11) + ' hive loader, ' + r.cells + ' cells, ' + r.anim);
    }
  }
  /* Trivia Training's empty branch cannot be forced from outside — ttThemes() is a
     module-scope function reading a lazily-loaded bank — so this one is asserted from the
     SOURCE, the way tests/arcade-geometry.js does. It used to render a page head with an
     empty body, which is the blank flash that was reported. */
  const src = require('fs').readFileSync(require('path').resolve(__dirname, '..', 'app3.js'), 'utf8');
  if (!/if\(!ths\.length\) return[\s\S]{0,220}hiveLoader\(/.test(src))
    errs.push('viewTrivTrain still renders an empty body while its bank loads');
  else console.log('  trivtrain   hive loader (source-asserted: its bank cannot be stubbed from outside)');
  if (/Loading chapters…/.test(src)) errs.push('the bare "Loading chapters…" text is still in the source');

  // Reduce motion stills the comb rather than leaving it blank
  const rm = await pg.evaluate(async () => { if (!state.a11yMotion) app.toggleReduceMotion();
    await new Promise(r => setTimeout(r, 600));
    const c = document.querySelector('.sb-hive-cell');
    const out = c ? { anim: getComputedStyle(c).animationName, bg: getComputedStyle(c).backgroundColor } : null;
    if (state.a11yMotion) app.toggleReduceMotion();
    return out; });
  if (rm && rm.anim !== 'none') errs.push('Reduce motion leaves the comb animating (' + rm.anim + ')');
  if (rm && /rgba\(0, 0, 0, 0\)/.test(rm.bg)) errs.push('Reduce motion leaves the comb invisible');
  await b.close();
  console.log(errs.length ? 'FAIL\n' + errs.join('\n') : 'PASS — waiting screens fill the hive, and it stills rather than vanishes under Reduce motion');
  process.exit(errs.length ? 1 : 0);
})();
