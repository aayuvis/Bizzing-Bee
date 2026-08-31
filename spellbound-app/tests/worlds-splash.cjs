// Worlds & the opening splash. Every world backdrop must be RICH — the play-test
// line was "Dino Era is fantastic, others are boring / have no background" — the
// lab's pouring flask must pour from its MOUTH, and the app opens on a 6-second
// world splash (art, name, honey bar, tap-to-skip) that first-run, reduced motion
// and the Settings switch can all silence.
const { chromium } = require('playwright');
const SRC = process.env.SRC || __dirname + '/..';
const fs = require('fs');
let fails = 0;
const ok = (b, msg) => { console.log((b ? '  OK   ' : '  FAIL ') + msg); if (!b) fails++; };
(async () => {
  const w4 = fs.readFileSync(SRC + '/worlds4.js', 'utf8');
  ok(/rotate\(-38 96 30\)/.test(w4) && !/rotate\(38 96 30\)/.test(w4),
    'the pouring flask tilts mouth-DOWN (the pour-from-the-bottom bug stays dead)');
  ok(/M80 16 q-4 40 -7 80/.test(w4), 'and the stream falls from the lip, into the catch beaker');

  const idx0 = fs.readFileSync(SRC + '/index.html', 'utf8');
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

  // ---- scene richness: count real elements in every world layer ----
  const pg = await b.newPage({ viewport: { width: 1100, height: 900 } });
  const errs = []; pg.on('pageerror', e => errs.push(String(e.message)));
  await pg.goto('file://' + SRC + '/index.html'); await pg.waitForTimeout(2600);
  const counts = await pg.evaluate(async () => {
    const W = ms => new Promise(res => setTimeout(res, ms));
    state.children = [{ name: 'T', avatar: 'bee', coins: 0, pow: {}, age: 10, lists: { default: { xp: 10 } }, activeList: 'default',
      missed: [], unlockedThemes: [], unlockedConcepts: {}, unlockedLists: {}, questPath: 'journey',
      trail: { lap: 1, done: {}, chk: {}, seen: {}, elap: 1, edone: {}, echk: {} } }];
    state.activeIdx = 0; state.screen = 'app'; state.nav = 'home';
    const out = {};
    for (const w of ['godly', 'race', 'dino', 'anime', 'science', 'spellbound', 'aurora', 'avatar']) {
      state.theme = w; SB_W4_SYNC(); await W(120);
      const bg = document.querySelector('.w4-bg');
      out[w] = bg ? bg.children.length : 0;
    }
    state.theme = 'spellbound'; SB_W4_SYNC();
    return out;
  });
  // the Aug-31 EIGHT, with Blade/Race/Lab held to their strengthened bar
  const MIN = { godly: 25, race: 23, dino: 30, anime: 28, science: 28, spellbound: 20, aurora: 30, avatar: 25 };
  Object.entries(MIN).forEach(([w, n]) =>
    ok(counts[w] >= n, w.padEnd(10) + ' backdrop carries ' + counts[w] + ' elements (>= ' + n + ')'));

  // ---- the splash: rich open for a returning child, gone in all the right cases ----
  const seed = JSON.stringify({ theme: 'dino', children: [{ name: 'T' }] });
  const pg2 = await b.newPage({ viewport: { width: 1100, height: 900 } });
  await pg2.addInitScript(s => { localStorage.setItem('sb_saas_v2', s); localStorage.removeItem('sb_splash'); }, seed);
  await pg2.goto('file://' + SRC + '/index.html'); await pg2.waitForTimeout(700);
  await pg2.waitForTimeout(1300);   // past DOMContentLoaded, so the credits beat has landed
  const s1 = await pg2.evaluate(() => { const d = document.querySelector('#sb-splash'); return {
    up: !!d, world: d && /Dino Era/.test(d.textContent), art: d && !!d.querySelector('img[src*="sgw-meadow"]'),
    noBar: d && !d.querySelector('.spl-bar'), tap: d && /tap anywhere/.test(d.textContent),
    letters: d ? d.querySelectorAll('.spl-logo b').length : 0,
    comet: d && !!d.querySelector('.spl-comet'), trail: d && !!d.querySelector('.spl-trail path'),
    sheen: d && !!d.querySelector('.spl-sheen'), bars: d && !!d.querySelector('.spl-bars'),
    noAvatars: d && !d.querySelector('#spl-star') && !d.querySelector('#spl-cast'),
    tagline: d && /prehistoric/i.test(d.textContent),
    tune: d && /createOscillator/.test(document.body.innerHTML) === false }; });
  ok(s1.up, 'the title sequence rises on open for a returning child');
  ok(s1.world, 'the episode card names the child\'s own world (Dino Era)');
  ok(s1.art, 'it plays over the world\'s painted play-field');
  ok(s1.letters >= 10, 'the title pops in letter by letter (' + s1.letters + ' letters)');
  ok(s1.comet && s1.trail, 'a light-streak traces the arc with its luminous trail (the cartoon bee is retired)');
  ok(s1.sheen && s1.bars, 'the wordmark carries a sheen pass and the frame wears letterbox bars');
  ok(s1.noAvatars, 'NO avatar cast or starring block — the painted world is the star');
  ok(s1.tagline, 'the world speaks in its own words (the tagline)');
  ok(s1.noBar && s1.tap, 'no loading bar — just tap-to-skip (the bar was cut on request)');
  const dino = await pg2.evaluate(() => { const d = document.querySelector('#sb-splash'); return {
    marked: d && d.classList.contains('w-dino'),
    jaws: d ? d.querySelectorAll('.spl-jaw').length : 0,
    maw: d && !!d.querySelector('.spl-maw'), dusk: d && !!d.querySelector('.spl-duskveil'),
    stars: d ? d.querySelectorAll('.spl-nightstar').length : 0,
    scene: d && !!d.querySelector('#spl-cast2') }; });
  ok(dino.marked, 'Dino Era wears its own staging class');
  ok(dino.jaws === 2 && dino.maw, 'the T-rex jaws close around the frame over the deep-red maw');
  ok(dino.dusk && dino.stars >= 12, 'day falls to dark — dusk veil + ' + dino.stars + ' stars coming out');
  ok(dino.scene, 'the world-cast stage is mounted for the borrowed scenery');
  const bite = await pg2.evaluate(() => { const d = document.querySelector('#sb-splash'); return {
    eyes: d && !!d.querySelector('.spl-eyes'),
    flash: d && !!d.querySelector('.spl-snapflash') }; });
  ok(bite.eyes, 'predator eyes flare in the dark before the roar');
  ok(bite.flash, 'the SNAP lands with a blink of white');
  const plates = await pg2.evaluate(() => { const d = document.querySelector('#sb-splash'); return {
    top: d && !!d.querySelector('.spl-jawtop img[src$="dino-jaw-top.svg"]'),
    bot: d && !!d.querySelector('.spl-jawbot img[src$="dino-jaw-bot.svg"]') }; });
  ok(plates.top && plates.bot, 'the painted jaws are transparent SVGs closing OVER the world');
  ok(fs.existsSync(SRC + '/app-art/dino-jaw-top.svg') && fs.existsSync(SRC + '/app-art/dino-jaw-bot.svg')
    && /image\/webp/.test(fs.readFileSync(SRC + '/app-art/dino-jaw-top.svg', 'utf8').slice(0, 400)),
    'both plates ship as alpha-keyed SVGs in app-art');
  ok(/spl-veildim/.test(idx0) && /brightness\(1\.6\)/.test(idx0), 'the day opens BRIGHT before dusk takes it');
  const cast2 = await pg2.evaluate(() => { const c = document.querySelector('#spl-cast2'); return c ? {
    raptors: c.querySelectorAll('.w4-raptor').length, brach: c.querySelectorAll('.w4-brachio,.w4-brachstill').length,
    pteros: c.querySelectorAll('.w4-ptero').length, trees: c.querySelectorAll('.w4-tree').length,
    ferns: c.querySelectorAll('.w4-fern').length, recreated: document.querySelectorAll('#sb-splash .spl-dino').length } : null; });
  ok(cast2 && cast2.raptors >= 2 && cast2.brach >= 2 && cast2.pteros >= 2 && cast2.trees >= 3 && cast2.ferns >= 2,
    'the cast is the WORLD\'S OWN art, borrowed verbatim (raptors, brachios, pteros, trees, ferns)');
  ok(cast2 && cast2.recreated === 0, 'no recreated stand-in dinos remain');
  // the GATE: the show holds silent until the invitation is answered
  const hold = await pg2.evaluate(() => { const d = document.querySelector('#sb-splash'); const g = d && d.querySelector('.spl-gate');
    return { kb: d && d.classList.contains('kb'), gate: g ? g.textContent : '', shown: g && getComputedStyle(g).display !== 'none' }; });
  ok(!hold.kb && hold.shown, 'the show HOLDS on the gate — no .kb, no cinematic, until the tap');
  ok(/100 million years/.test(hold.gate), 'the gate speaks the world\'s own invitation (' + hold.gate + ')');
  await pg2.mouse.down(); await pg2.mouse.up(); await pg2.waitForTimeout(500);
  const going = await pg2.evaluate(() => { const d = document.querySelector('#sb-splash');
    return { up: !!d, kb: d && d.classList.contains('kb'), gateGone: d && getComputedStyle(d.querySelector('.spl-gate')).display === 'none' }; });
  ok(going.up && going.kb && going.gateGone, 'the gate tap STARTS the show — .kb lands, the gate bows out, the splash stays up');
  await pg2.mouse.down(); await pg2.mouse.up(); await pg2.waitForTimeout(1000);
  ok(await pg2.evaluate(() => !document.querySelector('#sb-splash')), 'a second tap skips straight in');
  const idx = fs.readFileSync(SRC + '/index.html', 'utf8');
  ok(/brand-open\.mp3/.test(idx) && /BIZZING BEE brand sound/.test(idx),
    'the Bizzing Bee BRAND CUE opens every world\'s load');
  ok(/dino-roar\.mp3/.test(idx) && /hive-buzz\.mp3/.test(idx) && /armSting/.test(idx),
    'the world stingers take over at the close — the roar at the jaw SNAP, the buzz as the cell seals');
  ok(fs.existsSync(SRC + '/app-art/brand-open.mp3') && fs.existsSync(SRC + '/app-art/dino-roar.mp3')
    && fs.existsSync(SRC + '/app-art/hive-buzz.mp3'), 'all three pre-rendered sounds ship in app-art');
  ok(/starts clock, cinematic and sound together/.test(idx) && /born=Date\.now\(\); d\.classList\.add\('kb'\)/.test(idx),
    'the gate tap starts clock, cinematic and sound together — autoplay policy can never mute the show');
  ok(/spl-slam/.test(idx) && /spl-mawpulse/.test(idx),
    'the frame still slams and the maw pulses at the snap');

  // ---- THE HIVE's own opening: comb, swarm, and the honey that takes the frame ----
  const seedH = JSON.stringify({ theme: 'spellbound', children: [{ name: 'T' }] });
  const pgH = await b.newPage({ viewport: { width: 1100, height: 900 } });
  await pgH.addInitScript(s => { localStorage.setItem('sb_saas_v2', s); localStorage.removeItem('sb_splash'); }, seedH);
  await pgH.goto('file://' + SRC + '/index.html'); await pgH.waitForTimeout(2000);
  const hv = await pgH.evaluate(() => { const d = document.querySelector('#sb-splash'); return {
    up: !!d, marked: d && d.classList.contains('w-hive'),
    honey: d ? d.querySelectorAll('.spl-honey').length : 0,
    top: d && !!d.querySelector('.spl-honeytop img[src$="hive-honey-top.svg"]'),
    bot: d && !!d.querySelector('.spl-honeybot img[src$="hive-honey-bot.svg"]'),
    bees: d ? d.querySelectorAll('.spl-bee').length : 0,
    fly: d && !!d.querySelector('.spl-bee img.b-fly[src$="hive-bee-fly.svg"]'),
    sit: d && !!d.querySelector('.spl-bee img.b-sit[src$="hive-bee-sit.svg"]'),
    comb: d && !!d.querySelector('.spl-combzoom img[src$="hive-comb-wall.webp"]'),
    cell: d && !!d.querySelector('.spl-cellin img[src$="hive-cell.webp"]'),
    bloom: d && !!d.querySelector('.spl-goldflash'), amb: d && !!d.querySelector('.spl-ambveil'),
    hex: d ? d.querySelectorAll('.spl-hexcell').length : 0,
    swarm: d ? d.querySelectorAll('.spl-swarmdot').length : 0,
    cast: d && !!d.querySelector('#spl-cast2'),
    world: d && /The Hive/.test(d.textContent), tag: d && /home sweet hive/.test(d.textContent) }; });
  ok(hv.up && hv.marked, 'the Hive wears its own staging class (w-hive)');
  ok(hv.world && hv.tag, 'the episode card says The Hive, not a duplicate of the wordmark');
  ok(hv.honey === 2 && hv.top && hv.bot, 'painted honey DRIPS over the world — curtain hanging above, pool holding low');
  ok(/translateY\(-26%\)/.test(idx0) && /spl-hang/.test(idx0), 'the pot never closes — the curtain descends to a hang and sways there');
  ok(hv.bees === 3 && hv.fly && hv.sit, 'three painted honeybees fly in and land, wings swapping from mid-beat to folded');
  ok(hv.comb && hv.cell, 'the honey-filled hexagon wall and the cell interior are staged for the dive');
  ok(hv.bloom && hv.amb, 'the arrival bloom and the amber vignette are staged');
  ok(hv.hex >= 12, 'the comb crystallizes cell by cell (' + hv.hex + ' cells)');
  ok(hv.swarm >= 10, 'the swarm streams through as the buzz peaks (' + hv.swarm + ' bees)');
  const hvCast = await pgH.evaluate(() => { const c = document.querySelector('#spl-cast2'); return c ? {
    comb: !!c.querySelector('.w4o-comb'), glow: !!c.querySelector('.w4o-hiveglow'),
    bees: c.querySelectorAll('.w4o-bee img[src$="hive-bee-fly.svg"]').length,
    rise: c.querySelectorAll('.w4o-rise').length } : null; });
  ok(hvCast && hvCast.comb && hvCast.glow && hvCast.bees >= 2 && hvCast.rise >= 6,
    'the cast keeps the world\'s comb, glow and rising gold — crossed by the painted bee on the beeline');
  ok(fs.existsSync(SRC + '/app-art/hive-honey-top.svg') && fs.existsSync(SRC + '/app-art/hive-honey-bot.svg')
    && /image\/webp/.test(fs.readFileSync(SRC + '/app-art/hive-bee-fly.svg', 'utf8').slice(0, 400))
    && fs.existsSync(SRC + '/app-art/hive-comb-wall.webp') && fs.existsSync(SRC + '/app-art/hive-cell.webp'),
    'honey plates, bee sprites and both comb plates all ship in app-art');
  ok(/spl-goldshift/.test(idx0) && /honey cell sealing/.test(idx0),
    'the day turns to gold, and the buzz stinger is timed to the honey cell sealing');
  const bug = await pgH.evaluate(() => { const d = document.querySelector('#sb-splash'); const t = d && d.querySelector('.spl-logo-t');
    return { text: !!(t && /Bizzing/.test(t.textContent) && /Bee/.test(t.textContent) && /™/.test(t.textContent)),
      ico: !!document.querySelector('#spl-bico2 svg'),
      noCorner: d && !d.querySelector('.spl-brand') }; });
  ok(bug.text && bug.ico, 'the centre wordmark IS the brand lockup — mascot + italic Bizzing™ Bee at title size');
  ok(bug.noCorner, 'the duplicate top-right corner lockup is retired');
  await pgH.mouse.down(); await pgH.mouse.up(); await pgH.waitForTimeout(400);
  await pgH.mouse.down(); await pgH.mouse.up(); await pgH.waitForTimeout(1000);
  ok(await pgH.evaluate(() => !document.querySelector('#sb-splash')), 'gate tap then skip tap dismisses the hive opening');

  // ---- the OTHER SIX worlds each own their opening: world class, staging,
  //      close gesture, and a stinger of their own wired to the close ----
  const SIX = {
    aurora: { cls: 'w-aur', sting: 'aurora-shimmer', probes: { curtains: ['.spl-aurcurt', 2], bloom: ['.spl-aurbloom', 1], stars: ['.spl-twinkle', 20] } },
    anime: { cls: 'w-blade', sting: 'blade-shing', probes: { slash: ['.spl-slash', 1], shutters: ['.spl-shut', 2], petals: ['.spl-petal', 10], pagoda: ['.spl-pagsil', 1] } },
    science: { cls: 'w-lab', sting: 'lab-zap', probes: { liquid: ['.spl-liquid', 1], flash: ['.spl-labflash', 1], bubbles: ['.spl-lbub', 10], big: ['.spl-lbig', 5] } },
    avatar: { cls: 'w-elem', sting: 'elements-fuse', probes: { orbs: ['.spl-orb', 4], fuse: ['.spl-fuse', 1], auras: ['.spl-aura', 4] } },
    godly: { cls: 'w-gods', sting: 'gods-thunder', probes: { doors: ['.spl-door', 2], seam: ['.spl-doorseam', 1], flash: ['.spl-godflash', 1], cast: ['#spl-cast2', 1] } },
    race: { cls: 'w-race', sting: 'race-rev', probes: { gantry: ['.spl-gantry', 1], lamps: ['.spl-glamp', 4], wall: ['.spl-speedwall', 1], cars: ['.spl-racecar', 2] } },
  };
  for (const [theme, spec] of Object.entries(SIX)) {
    const pgW = await b.newPage({ viewport: { width: 1100, height: 900 } });
    await pgW.addInitScript(t => localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: t, children: [{ name: 'T' }] })), theme);
    await pgW.goto('file://' + SRC + '/index.html'); await pgW.waitForTimeout(900);
    const got = await pgW.evaluate(ps => { const d = document.querySelector('#sb-splash'); const g = d && d.querySelector('.spl-gate'); return {
      cls: d ? d.className : '', gate: g ? g.textContent : '', counts: Object.fromEntries(Object.entries(ps).map(([k, [sel]]) =>
        [k, d ? d.querySelectorAll(sel).length : 0])) }; }, spec.probes);
    const short = Object.entries(spec.probes).filter(([k, [, n]]) => got.counts[k] < n).map(([k, [, n]]) => k + '=' + got.counts[k] + '<' + n);
    ok(got.cls.includes(spec.cls), theme.padEnd(8) + ' wears its own cut (' + spec.cls + ')');
    ok(/^tap to /.test(got.gate), theme.padEnd(8) + ' gate invites in its own words (' + got.gate + ')');
    ok(!short.length, theme.padEnd(8) + ' staging is fully cast' + (short.length ? ' — MISSING ' + short.join(', ') : ''));
    ok(fs.existsSync(SRC + '/app-art/' + spec.sting + '.mp3'), theme.padEnd(8) + ' stinger ships (' + spec.sting + '.mp3)');
    await pgW.close();
  }
  ok(/aurora:6\.75/.test(idx0) && /science:5\.55/.test(idx0) && /race:6\.35/.test(idx0),
    'every world has its CLOSE on the audio clock — the stinger lands on the fold, the boil-over, the green light');

  // ignored entirely, the gate falls through to the app on its own (~10s)
  const pg3 = await b.newPage({ viewport: { width: 900, height: 700 } });
  await pg3.addInitScript(s => localStorage.setItem('sb_saas_v2', s), seed);
  await pg3.goto('file://' + SRC + '/index.html');
  await pg3.waitForTimeout(400);
  const upEarly = await pg3.evaluate(() => !!document.querySelector('#sb-splash'));
  await pg3.waitForTimeout(10800);
  ok(upEarly && await pg3.evaluate(() => !document.querySelector('#sb-splash')), 'left alone, the unanswered gate falls through by itself (~10s)');

  // no world borrows another's close — the lab gets no jaws, no honey
  const pgS = await b.newPage();
  await pgS.addInitScript(() => localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'science', children: [{ name: 'T' }] })));
  await pgS.goto('file://' + SRC + '/index.html'); await pgS.waitForTimeout(600);
  ok(await pgS.evaluate(() => { const d = document.querySelector('#sb-splash');
    return !!d && !d.classList.contains('w-dino') && !d.querySelector('.spl-jaw')
      && !d.classList.contains('w-hive') && !d.querySelector('.spl-honey')
      && !d.querySelector('.spl-door') && !d.querySelector('.spl-gantry'); }),
    'no world borrows another\'s close — jaws, honey, doors, gantry stay home');

  // silenced by the Settings switch, and never over onboarding
  const pg4 = await b.newPage();
  await pg4.addInitScript(s => { localStorage.setItem('sb_saas_v2', s); localStorage.setItem('sb_splash', '0'); }, seed);
  await pg4.goto('file://' + SRC + '/index.html'); await pg4.waitForTimeout(500);
  ok(await pg4.evaluate(() => !document.querySelector('#sb-splash')), 'sb_splash=0 silences it');
  const pg5 = await b.newPage();
  await pg5.goto('file://' + SRC + '/index.html'); await pg5.waitForTimeout(500);
  ok(await pg5.evaluate(() => !document.querySelector('#sb-splash')), 'first run (no children) never hides onboarding behind it');
  ok(await pg.evaluate(() => typeof app.toggleSplash === 'function'), 'Settings carries the Opening splash switch');
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
  await b.close();
  process.exit(fails ? 1 : 0);
})();
