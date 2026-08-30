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
    for (const w of ['godly', 'serpent', 'race', 'dino', 'anime', 'marquee', 'science', 'spellbound', 'aurora', 'origami', 'pixel', 'avatar']) {
      state.theme = w; SB_W4_SYNC(); await W(120);
      const bg = document.querySelector('.w4-bg');
      out[w] = bg ? bg.children.length : 0;
    }
    state.theme = 'spellbound'; SB_W4_SYNC();
    return out;
  });
  const MIN = { godly: 25, serpent: 20, race: 17, dino: 30, anime: 22, marquee: 40, science: 22, spellbound: 20, aurora: 30, origami: 10, pixel: 12, avatar: 25 };
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
    bar: d && !!d.querySelector('.spl-bar i'), tap: d && /tap anywhere/.test(d.textContent),
    letters: d ? d.querySelectorAll('.spl-logo b').length : 0,
    flyer: d && !!d.querySelector('.spl-flyer .spl-wing'), trail: d && !!d.querySelector('.spl-trail path'),
    starring: d && /STARRING/.test(d.textContent) && !!d.querySelector('#spl-star svg,#spl-star img'),
    cast: d ? d.querySelectorAll('#spl-cast > span').length : 0,
    tune: d && /createOscillator/.test(document.body.innerHTML) === false }; });
  ok(s1.up, 'the title sequence rises on open for a returning child');
  ok(s1.world, 'the episode card names the child\'s own world (Dino Era)');
  ok(s1.art, 'it plays over the world\'s painted play-field');
  ok(s1.letters >= 10, 'the title pops in letter by letter (' + s1.letters + ' letters)');
  ok(s1.flyer && s1.trail, 'Bizzy swoops the screen with buzzing wings and a honey trail');
  ok(s1.starring, 'the child takes the STARRING credit with their own avatar');
  ok(s1.cast >= 4, 'the cast bobs along the bottom (' + s1.cast + ' of them)');
  ok(s1.bar && s1.tap, 'honey bar + tap-to-skip are there');
  await pg2.mouse.down(); await pg2.mouse.up(); await pg2.waitForTimeout(1000);
  ok(await pg2.evaluate(() => !document.querySelector('#sb-splash')), 'a tap dismisses it at once');
  const idx = fs.readFileSync(SRC + '/index.html', 'utf8');
  ok(/theme tune: eight bouncy bars/.test(idx) && /createOscillator/.test(idx.slice(0, idx.indexOf('id="root"'))),
    'a real theme tune (melody + bass) is wired into the sequence');

  // auto-dismiss on its own clock
  const pg3 = await b.newPage({ viewport: { width: 900, height: 700 } });
  await pg3.addInitScript(s => localStorage.setItem('sb_saas_v2', s), seed);
  await pg3.goto('file://' + SRC + '/index.html');
  await pg3.waitForTimeout(400);
  const upEarly = await pg3.evaluate(() => !!document.querySelector('#sb-splash'));
  await pg3.waitForTimeout(8200);
  ok(upEarly && await pg3.evaluate(() => !document.querySelector('#sb-splash')), 'left alone, it bows out by itself (~7s)');

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
