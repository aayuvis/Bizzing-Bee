// The Atlas boards are ALIVE: ambience on every board including the five Ultra
// landmarks, a music pill, chests that open onto a game / a chapter / a trivia
// question, and the rare moth ambush that only a spelled word resolves.
const { chromium } = require('playwright');
const SRC = process.env.SRC || __dirname + '/..';
let fails = 0;
const ok = (b, msg) => { console.log((b ? '  OK   ' : '  FAIL ') + msg); if (!b) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const pg = await b.newPage({ viewport: { width: 1100, height: 900 } });
  const errs = []; pg.on('pageerror', e => errs.push(String(e.message)));
  await pg.goto('file://' + SRC + '/index.html'); await pg.waitForTimeout(2600);
  const r = await pg.evaluate(async () => {
    const out = {};
    state.children = [{ name: 'T', avatar: 'bee', coins: 0, pow: {}, age: 10, lists: { default: { xp: 10 } }, activeList: 'default',
      missed: [], unlockedThemes: ['spellbound'], unlockedConcepts: {}, unlockedLists: {}, questPath: 'journey',
      trail: { lap: 1, done: {}, chk: {}, seen: {}, elap: 1, edone: {}, echk: {} } }];
    state.activeIdx = 0; state.screen = 'app'; state.devUnlock = true;
    await new Promise(res => SB_LAZY.need('atlas', res)); await new Promise(res => setTimeout(res, 300));
    const c = state.children[0];
    const R = Math.random;

    // 1 — ambience on a normal board AND on an Ultra landmark
    Math.random = () => 0.9;                       // no ambush while we look around
    app.trailAct('honey|meadow'); await new Promise(res => setTimeout(res, 250));
    out.ambMeadow = !!document.querySelector('.atlas-amb.amb-bees');
    app.ultraAct(0); await new Promise(res => setTimeout(res, 250));
    out.ambUltra = !!document.querySelector('.atlas-amb.amb-motes');
    out.pill = !!document.querySelector('[data-act="atlasMusic"]');

    // 2 — the music pill genuinely toggles the world-music engine
    const on0 = SB_W4_MUSIC.on();
    app.atlasMusic(); await new Promise(res => setTimeout(res, 150));
    out.musicFlip = SB_W4_MUSIC.on() !== on0;
    app.atlasMusic(); await new Promise(res => setTimeout(res, 150));
    out.musicBack = SB_W4_MUSIC.on() === on0;

    // 3 — chests: three doors
    app.trailAct('honey|meadow'); await new Promise(res => setTimeout(res, 200));
    Math.random = () => 0.1;                       // door 1: the region's game
    app.trailTre('meadow:0'); await new Promise(res => setTimeout(res, 200));
    out.giftGame = state.treG && state.treG.kind === 'game' && /Play it/.test(document.body.innerHTML);
    app.treGame(); await new Promise(res => setTimeout(res, 400));
    out.gameOpens = !!document.querySelector('.arc-menu');
    document.querySelectorAll('.arc-menu').forEach(e => e.remove()); state.treG = null;

    Math.random = () => 0.4;                       // door 2: the chapter
    app.trailTre('meadow:1'); await new Promise(res => setTimeout(res, 200));
    out.giftLore = state.treG && state.treG.kind === 'lore' && !!state.treG.uid && /Read the chapter/.test(document.body.innerHTML);
    app.treClose();

    Math.random = () => 0.8;                       // door 3: one real trivia question
    app.trailTre('meadow:2');
    await new Promise(res => { const t0 = Date.now();
      (function wait() { if ((state.treG && state.treG.q) || !state.treG || state.treG.kind !== 'trivia' || Date.now() - t0 > 15000) res(); else setTimeout(wait, 300); })(); });
    out.giftTriv = state.treG && state.treG.kind === 'trivia' && state.treG.q && state.treG.q.opts.length === 4;
    if (out.giftTriv) {
      const coins0 = c.coins; const okIx = state.treG.q.opts.findIndex(o => o.ok);
      app.treTrivAns(okIx); await new Promise(res => setTimeout(res, 150));
      out.trivPays = c.coins === coins0 + 10 && /Back to the map/.test(document.body.innerHTML);
    }
    state.treG = null;

    // 4 — the ambush: once per region per day, resolved only by spelling
    Math.random = () => 0.05;
    app.trailAct('honey|library'); await new Promise(res => setTimeout(res, 300));
    out.ambushUp = !!state.villain && /moth of the Unspelling/.test(document.body.innerHTML);
    const word = state.villain && state.villain.w;
    app.villType('zzz'); app.villGo(); await new Promise(res => setTimeout(res, 150));
    out.wrongHolds = !!state.villain && state.villain.wrong === 1;
    const coins1 = c.coins;
    app.villType(word); app.villGo(); await new Promise(res => setTimeout(res, 150));
    out.freed = !state.villain && c.coins === coins1 + 12;
    app.trailToMap(); await new Promise(res => setTimeout(res, 150));
    app.trailAct('honey|library'); await new Promise(res => setTimeout(res, 250));
    out.onceADay = !state.villain;
    Math.random = R;
    return out;
  });
  ok(r.ambMeadow, 'the Meadow board has its bees');
  ok(r.ambUltra, 'an Ultra landmark board has ambience too (the static-worlds complaint)');
  ok(r.pill, 'a music pill sits on the board header');
  ok(r.musicFlip && r.musicBack, 'the pill genuinely toggles the world-music engine both ways');
  ok(r.giftGame, 'a chest can open onto the region\'s own arcade game');
  ok(r.gameOpens, 'and Play it really opens the game setup menu');
  ok(r.giftLore, 'a chest can open onto the region\'s library chapter');
  ok(r.giftTriv, 'a chest can hold one real 4-option trivia question');
  ok(r.trivPays !== false, 'answering it right pays 10 coins and shows the fact (' + r.trivPays + ')');
  ok(r.ambushUp, 'the moth ambush appears and names the deed: spell to free your buddy');
  ok(r.wrongHolds, 'a wrong spelling keeps the net closed (no punishment, try again)');
  ok(r.freed, 'the RIGHT spelling frees the buddy and pays 12 coins');
  ok(r.onceADay, 'a region ambushes at most once a day');
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
  await b.close();
  process.exit(fails ? 1 : 0);
})();
