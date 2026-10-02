/* MUSIC IN EVERY PART OF THE APP, COMPOSED IN CODE (FIX-BEE v2, FAMILY-STANDARD §11).   @check

   • ten loops — Home, the games, and one per world (8) — each 60–90 s, written out (a fixed score:
     the same bar plays the same notes every time, whatever Math.random says);
   • not in the first load: music.js arrives through boot-lazy after the first tap;
   • the right loop for the screen: Home → home, the Arcade → games, the Atlas → the world's own;
     the working screens (Practice and the Library) stay quiet, as Bee always has;
   • level = the ONE volume (SB_VOL, default 40%), its own Music switch, off in Calm mode,
     ducked under a word, stopped when the tab is hidden;
   • music/CREDITS.md names the source and the licence of every loop.
   Proved by breaking: make the score random, drop the hidden-tab stop, or put music.js in
   index.html — the matching check fails.                                                       */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const SRC = process.env.SRC || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const seed = { theme: 'race', mode: 'light', premium: false, activeIdx: 0, pin: '2468',
  children: [{ name: 'Tune', age: 9, ageBand: '8-10', avatar: 'bizzy', theme: 'race', coins: 0, xp: 10, unlockedThemes: ['race'],
    lists: { default: { xp: 10 } }, activeList: 'default', questPath: 'journey', missed: [], trail: { lap: 1, done: {}, chk: {}, seen: {}, elap: 1, edone: {}, echk: {} } }] };

const idx = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
ok(!/src="music\.js/.test(idx), 'music.js is not in index.html — it is never part of the first load');
const credits = path.join(SRC, 'music', 'CREDITS.md');
ok(fs.existsSync(credits) && /composed in code for Bizzing/i.test(fs.readFileSync(credits, 'utf8')), 'music/CREDITS.md names the source: composed in code for Bizzing');

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p)),
    args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 1100, height: 850 } });
  await ctx.addInitScript(s => { try { if (!localStorage.getItem('sb_t_seeded')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_t_seeded', '1'); localStorage.setItem('sb_splash', '0'); } } catch (e) {} }, seed);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + SRC + '/index.html'); await pg.waitForTimeout(2600);
  await pg.evaluate(() => { state.screen = 'app'; state.nav = 'home'; render(); });
  ok(!(await pg.evaluate(() => !!window.SB_MUSIC)), 'before any tap, the music file has not been fetched');
  await pg.mouse.click(600, 400); await pg.waitForTimeout(1500);
  const W = ms => pg.waitForTimeout(ms);
  ok(await pg.evaluate(() => !!window.SB_MUSIC), 'after the first tap it arrives through boot-lazy');

  const sc = await pg.evaluate(() => { const S = SB_MUSIC.SCORE; const ids = Object.keys(S);
    const lens = ids.map(k => SB_MUSIC.loopSecs(k));
    const real = Math.random; Math.random = () => 0.001; const a = SB_MUSIC._bar('race', 5); Math.random = () => 0.999; const z = SB_MUSIC._bar('race', 5); Math.random = real;
    return { ids, lens, same: JSON.stringify(a) === JSON.stringify(z) && a.length > 4, distinct: new Set(ids.map(k => JSON.stringify(SB_MUSIC._bar(k, 2)))).size }; });
  ok(sc.ids.length === 10 && ['home', 'games', 'spellbound', 'aurora', 'anime', 'science', 'avatar', 'godly', 'race', 'dino'].every(k => sc.ids.includes(k)), 'ten loops: Home, the games and all eight worlds');
  ok(sc.lens.every(s => s >= 60 && s <= 90), 'every loop is 60–90 s: ' + sc.lens.map(s => s.toFixed(0)).join(' · '));
  ok(sc.same, 'the score is written, not rolled: bar 5 of Race Zone is the same notes whatever Math.random returns');
  ok(sc.distinct === 10, 'and the ten loops are ten different pieces of music');

  const where = async (fn) => { await pg.evaluate(fn); await W(900); return pg.evaluate(() => SB_MUSIC.playing()); };
  ok(await where(() => app.setNav('home')) === 'home', 'Home plays the Home loop');
  ok(await where(() => app.openTrail && app.openTrail()) === 'race', 'the Atlas plays the world\'s own loop (Race Zone)');
  ok(await where(() => app.openGames()) === 'games', 'the Arcade plays the games loop');
  ok(await where(() => app.openCoach()) === null, 'Practice stays quiet — the working screens are still');
  await pg.evaluate(() => app.setNav('home')); await W(700);

  const lv = await pg.evaluate(() => ({ pct: SB_VOL.pct(), on: SB_VOL.musicOn() }));
  ok(lv.pct === 40 && lv.on, 'music is on at the default 40% volume');
  ok(await where(() => { state.calmMode = true; render(); }) === null, 'Calm mode turns the music off');
  await pg.evaluate(() => { state.calmMode = false; render(); }); await W(800);
  ok(await where(() => { SB_VOL.setMusic(false); }) === null, 'the Music switch turns it off');
  await pg.evaluate(() => SB_VOL.setMusic(true)); await W(800);
  ok(await where(() => { SB_VOL.setMuted(true); }) === null, 'Mute (one tap in ☰) silences it');
  await pg.evaluate(() => SB_VOL.setMuted(false)); await W(800);
  ok(await pg.evaluate(() => SB_MUSIC.playing()) === 'home', 'and it comes back');

  const duck = await pg.evaluate(async () => { const S = window.SB_VOL; S.duck(700); await new Promise(r => setTimeout(r, 120)); const a = S.ducked(); await new Promise(r => setTimeout(r, 800)); return { during: a, after: S.ducked() }; });
  ok(duck.during && !duck.after, 'it ducks under a word or an effect and comes back up');
  const hid = await pg.evaluate(async () => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); document.dispatchEvent(new Event('visibilitychange'));
    await new Promise(r => setTimeout(r, 300)); const p = SB_MUSIC.playing(); const st = SB_MUSIC.ctx() && SB_MUSIC.ctx().state;
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' }); document.dispatchEvent(new Event('visibilitychange')); await new Promise(r => setTimeout(r, 500));
    return { p, st, back: SB_MUSIC.playing() }; });
  ok(hid.p === null && hid.st !== 'running', 'a hidden tab stops it (context ' + hid.st + ')');
  ok(hid.back === 'home', 'and showing the tab again brings it back');

  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good');
  process.exit(fails ? 1 : 0);
})();
