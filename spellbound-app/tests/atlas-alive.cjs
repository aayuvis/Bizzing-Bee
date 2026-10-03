// The Atlas boards are ALIVE: ambience on every board including the five Ultra
// landmarks, a music pill, chests that open onto a game / a chapter / a trivia
// question, and the rare moth ambush that only a spelled word resolves.
const { chromium } = require('playwright');
const SRC = process.env.SRC || __dirname + '/..';
let fails = 0;
const ok = (b, msg) => { console.log((b ? '  OK   ' : '  FAIL ') + msg); if (!b) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => require('fs').existsSync(p)) });
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
    // the arcade engines are lazy since FIX-BEE N2: treGame's door loads them first
    await new Promise(res => SB_LAZY.need('arcade', res));
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
      /* FIX-BEE: coins are Bizzing coins now, paid only as the family standard's events — a right answer 1, a finished round 5, a contest 10 (tests/wallet-coins.cjs). */ out.trivPays = c.coins === coins0 + 1 && /Back to the map/.test(document.body.innerHTML);
    }
    state.treG = null;

    // 4 — the ambush: once per region per day, resolved only by spelling — and it never
    //     stands in the doorway: not on a first visit, and the board always shows first
    Math.random = () => 0.05;
    app.trailAct('honey|library'); await new Promise(res => setTimeout(res, 2000));
    out.firstQuiet = !state.villain && state.trailView === 'act';
    app.trailToMap(); await new Promise(res => setTimeout(res, 100));
    app.trailAct('honey|library'); await new Promise(res => setTimeout(res, 300));
    out.mapFirst = !state.villain && state.trailView === 'act' && !!document.querySelector('.atlas-stop');
    await new Promise(res => setTimeout(res, 1700));
    out.ambushUp = !!state.villain && /moth of the Unspelling/.test(document.body.innerHTML);
    { const x = document.querySelector('[data-trap="villain"] [aria-label="Close"]'); const r = x && x.getBoundingClientRect();
      out.closeBtn = !!(r && r.width >= 24 && r.top >= 0 && r.bottom <= innerHeight && x.dataset.act === 'villFlee'); }
    const word = state.villain && state.villain.w;
    app.villType('zzz'); app.villGo(); await new Promise(res => setTimeout(res, 150));
    out.wrongHolds = !!state.villain && state.villain.wrong === 1;
    const coins1 = c.coins;
    app.villType(word); app.villGo(); await new Promise(res => setTimeout(res, 150));
    out.freed = !state.villain && c.coins === coins1 + 1;   // a right answer is one coin
    app.trailToMap(); await new Promise(res => setTimeout(res, 150));
    app.trailAct('honey|library'); await new Promise(res => setTimeout(res, 1900));
    out.onceADay = !state.villain;
    // Escape lets go of it, like every other layer
    app.trailToMap(); app.trailAct('honey|forum'); await new Promise(res => setTimeout(res, 100));
    app.trailToMap(); app.trailAct('honey|forum'); await new Promise(res => setTimeout(res, 1900));
    const up2 = !!state.villain;
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await new Promise(res => setTimeout(res, 150));
    out.escCloses = up2 && !state.villain && !document.querySelector('[data-trap="villain"]') && state.trailView === 'act';
    // walking away before it lands means it never lands
    app.trailToMap(); app.trailAct('honey|storm'); await new Promise(res => setTimeout(res, 100));
    app.trailToMap(); app.trailAct('honey|storm'); await new Promise(res => setTimeout(res, 200));
    app.trailToMap(); await new Promise(res => setTimeout(res, 1900));
    out.leftInTime = !state.villain;
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
  ok(r.trivPays !== false, 'answering it right pays one coin (a right answer) and shows the fact (' + r.trivPays + ')');
  ok(r.firstQuiet, 'a first visit to a region never springs the moth — the child meets the country');
  ok(r.mapFirst, 'on a later visit the board renders first: the moth is never in the doorway');
  ok(r.ambushUp, 'the moth ambush appears and names the deed: spell to free your buddy');
  ok(r.closeBtn, 'the ambush has a visible Close button on screen');
  ok(r.wrongHolds, 'a wrong spelling keeps the net closed (no punishment, try again)');
  ok(r.freed, 'the RIGHT spelling frees the buddy and pays one coin (a right answer)');
  ok(r.onceADay, 'a region ambushes at most once a day');
  ok(r.escCloses, 'Escape lets go of the moth and leaves the child on the board');
  ok(r.leftInTime, 'a child who walks off the board before the moth arrives is not chased by it');
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
  await b.close();
  process.exit(fails ? 1 : 0);
})();
