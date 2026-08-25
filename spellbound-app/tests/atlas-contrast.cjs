/* The Atlas painting reads BOLD, and fog means "you cannot go there yet".
   Play-testing named it exactly: "fading away", "a translucent layer", "weird fog" on art
   that is already painted misty. The map was held at 60% opacity and desaturated (dusk
   50%, high-contrast 34%) so the route and pins could read over it — solving the right
   problem in the wrong place, by dimming the whole picture to make two things on top of
   it legible. Legibility now lives on the route (its own drop-shadow) and the pins (a
   scrim ring), and the art runs near full.
   Also: one ambient motif per REGION, below the route, gone under Reduce motion.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/atlas-contrast.cjs */
const { chromium } = require('playwright');
const root = require('path').resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  const pg = await b.newPage({ viewport: { width: 1180, height: 1000 } });
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await pg.goto('file://' + root + '/index.html');
  await pg.waitForTimeout(3400);
  await pg.evaluate(() => { state.children=[{name:'T',avatar:'bee',coins:900,pow:{},age:9,
    lists:{default:{xp:30}},activeList:'default',missed:[],unlockedThemes:['spellbound'],
    unlockedConcepts:{},unlockedLists:{},questPath:'journey',trail:{lap:1,done:{},chk:{},seen:{},elap:1,edone:{},echk:{}}}];
    state.activeIdx=0; state.screen='app'; app.openTrail(); });
  await pg.waitForTimeout(2200);

  const read = () => pg.evaluate(() => {
    const img = document.querySelector('.atlas-board>img');
    if (!img) return null;
    const cs = getComputedStyle(img);
    return { opacity: parseFloat(cs.opacity), filter: cs.filter };
  });
  const sat = f => { const m = /saturate\(([\d.]+)\)/.exec(f || ''); return m ? +m[1] : 1; };

  for (const mode of ['light', 'white', 'dusk']) {
    await pg.evaluate(m => { app.setMode(m); }, mode);
    await pg.waitForTimeout(500);
    const r = await read();
    if (!r) { errs.push(mode + ': no atlas board image'); continue; }
    if (r.opacity < 0.88) errs.push(mode + ': map art at ' + r.opacity + ' opacity — that is the fog complaint (want >= 0.88)');
    if (sat(r.filter) < 1) errs.push(mode + ': map art desaturated to ' + sat(r.filter) + ' (want >= 1)');
    console.log('  ' + mode.padEnd(6) + ' opacity ' + r.opacity + '  ' + r.filter);
  }
  // high contrast must bolden, not dim
  await pg.evaluate(() => { app.setMode('light'); if (!state.a11yContrast) app.toggleContrast(); });
  await pg.waitForTimeout(500);
  const hc = await read();
  if (hc && hc.opacity < 0.85) errs.push('high contrast dims the art to ' + hc.opacity + ' — it should bolden the route instead');
  if (hc && sat(hc.filter) < 1) errs.push('high contrast desaturates to ' + sat(hc.filter));
  console.log('  hi-con opacity ' + (hc && hc.opacity) + '  ' + (hc && hc.filter));
  await pg.evaluate(() => { if (state.a11yContrast) app.toggleContrast(); });
  await pg.waitForTimeout(400);

  // the route carries its own shadow now that it runs over full-strength art
  const route = await pg.evaluate(() => {
    const p = [...document.querySelectorAll('.atlas-board svg path')];
    return { n: p.length, shadowed: p.filter(e => /drop-shadow/.test(e.getAttribute('style') || '')).length };
  });
  if (!route.n) errs.push('no route path drawn');
  else if (!route.shadowed) errs.push(route.n + ' route paths and none carries a drop-shadow');

  // a pin sits on its own scrim ring
  const pinScrim = await pg.evaluate(() => { const p = document.querySelector('.atlas-pin');
    if (!p) return 'no pin'; return getComputedStyle(p, '::before').backgroundImage.indexOf('radial-gradient') >= 0; });
  if (pinScrim !== true) errs.push('pins have no scrim ring: ' + pinScrim);

  // ambient motion: present on a region board, region-specific, and gone under Reduce motion
  const amb = await pg.evaluate(async () => {
    app.trailAct && app.trailAct('honey|meadow');
    await new Promise(r => setTimeout(r, 900));
    const el = document.querySelector('.atlas-amb');
    const out = { onMeadow: el ? el.className : null };
    if (el) { const cs = getComputedStyle(el, '::before'); out.anim = cs.animationName; out.z = getComputedStyle(el).zIndex; }
    app.trailAct && app.trailAct('honey|forum');
    await new Promise(r => setTimeout(r, 900));
    const f = document.querySelector('.atlas-amb');
    out.onForum = f ? f.className : null;
    return out;
  });
  if (!amb.onMeadow) errs.push('no ambient layer on the Meadow');
  else if (!/amb-bees/.test(amb.onMeadow)) errs.push('the Meadow motif is ' + amb.onMeadow + ', not bees');
  if (amb.onForum && amb.onForum === amb.onMeadow) errs.push('the Forum animates identically to the Meadow — the motif is not per-region');
  if (amb.anim && amb.anim === 'none') errs.push('the ambient layer is not animating');
  if (amb.z && +amb.z > 1) errs.push('the ambient layer sits at z-index ' + amb.z + ' — it must stay below the route and pins');

  const reduced = await pg.evaluate(async () => { if (!state.a11yMotion) app.toggleReduceMotion();
    await new Promise(r => setTimeout(r, 700));
    const el = document.querySelector('.atlas-amb');
    const hidden = !el || getComputedStyle(el).display === 'none';
    if (state.a11yMotion) app.toggleReduceMotion();
    return hidden; });
  if (!reduced) errs.push('the ambient layer survives Reduce motion');

  // unreached regions recede on the OVERVIEW; the painting behind them stays bold
  const fog = await pg.evaluate(async () => {
    app.trailToMap && app.trailToMap();
    await new Promise(r => setTimeout(r, 900));
    const img = document.querySelector('.atlas-board>img');
    const lockedPins = [...document.querySelectorAll('.atlas-pin.locked')];
    return { pins: document.querySelectorAll('.atlas-pin').length,
             locked: lockedPins.length,
             dimmed: lockedPins.filter(e => /saturate\(0?\.[0-8]/.test(getComputedStyle(e).filter || '')).length,
             art: img ? parseFloat(getComputedStyle(img).opacity) : null };
  });
  if (!fog.pins) errs.push('no region pins on the overview');
  if (!fog.locked) errs.push('no region reads as unreached — the fog distinction proves nothing');
  else if (fog.dimmed !== fog.locked) errs.push(fog.dimmed + '/' + fog.locked + ' unreached regions actually recede');
  if (fog.art !== null && fog.art < 0.88) errs.push('the overview painting is dimmed to ' + fog.art + ' — fog belongs on the pins');
  console.log('  overview: ' + fog.locked + '/' + fog.pins + ' regions unreached and receding, art at ' + fog.art);

  const ow = await pg.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
  if (ow) errs.push('H-OVERFLOW on the Atlas');
  await b.close();
  console.log(errs.length ? 'FAIL\n' + errs.join('\n') : 'PASS — the painting reads bold in every mode, the route and pins carry their own legibility, and each region has its own ambient motif');
  process.exit(errs.length ? 1 : 0);
})();
