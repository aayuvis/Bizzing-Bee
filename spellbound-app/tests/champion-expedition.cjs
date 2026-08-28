// The Champion's Expedition, post-fog: the boards stay BRIGHT (play-testing killed
// the mist — "why is the map so dark?"), and the three per-child seeded secrets sit
// visibly on every board as tappable surprises: the word-wisp gift, the rival duel,
// and the gate (Hidden Pass on Ultra / Cartographer's Gate on the teaching road).
// Plus the non-linear spine: two open stops, 3-of-4, stops EARNED at 70%, the emblem.
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
    const out = {}; const W = ms => new Promise(res => setTimeout(res, ms));
    state.children = [{ name: 'Explorer', avatar: 'bee', coins: 0, pow: {}, age: 12, lists: { default: { xp: 10 } }, activeList: 'default',
      missed: [], unlockedThemes: ['spellbound'], unlockedConcepts: {}, unlockedLists: {}, questPath: 'journey',
      trail: { lap: 1, done: {}, chk: {}, seen: {}, elap: 1, edone: {}, echk: {} } }];
    state.activeIdx = 0; state.screen = 'app'; state.devUnlock = true;
    await new Promise(res => SB_LAZY.need('atlas', res)); await W(300);
    const c = state.children[0];
    const R = Math.random; Math.random = () => 0.5;   // no ambushes/chest rolls underfoot

    // ---- ULTRA LANDMARK: bright board, two open stops, secrets in the open ----
    app.ultraAct(0); await W(300);
    out.noFog = !/rgba\(20,15,42/.test(document.body.innerHTML) && !document.querySelector('[data-act="uScout"]');
    out.twoOpen = document.querySelectorAll('.atlas-stop.now').length === 2;
    out.allPins = document.querySelectorAll('[data-act="ultraPick"]').length === 4;
    out.secretsVisible = !!document.querySelector('[data-act="uWisp"]') && !!document.querySelector('[data-act="uDuel"]') && !!document.querySelector('[data-act="uGate"]');
    out.secretsLine = /0\/3 secrets/.test(document.body.textContent);

    // ---- the wisp is a tap-gift ----
    const coins0 = c.coins;
    app.uWisp(); await W(150);
    out.wispGift = c.coins === coins0 + 8 && (SB_EXPED.prog().finds.u0 || {}).wisp === 1;
    app.ultraAct(0); await W(200);
    out.wispGone = !document.querySelector('[data-act="uWisp"]');

    // ---- the rival duel: best of three ----
    app.uDuel(); await W(150);
    out.duelCard = state.uq && state.uq.kind === 'duel' && !!state.uq.rival;
    const cW = c.coins;
    app.uqType(state.uq.words[0].w); app.uqGo(); await W(120);
    app.uqType(state.uq.words[1].w); app.uqGo(); await W(120);
    out.duelWon = !state.uq && c.coins === cW + 25 && (SB_EXPED.prog().finds.u0 || {}).duel === 1;

    // ---- the Hidden Pass: 3-word chain, next landmark opens EARLY ----
    app.uGate(); await W(150);
    out.gateCard = state.uq && state.uq.kind === 'gate';
    app.uqType('zz'); app.uqGo(); await W(100);
    out.chainResets = state.uq && state.uq.i === 0;
    for (let i = 0; i < 3; i++) { app.uqType(state.uq.words[i].w); app.uqGo(); await W(100); }
    out.passOpens = !state.uq && SB_EXPED.prog().gates[1] === 1;
    app.ultraAct(1); await W(200);
    out.skippedIn = state.trailView === 'ultra' && state.ultraAct === 1;

    // ---- stops are EARNED: Train alone marks nothing; 70% in a session does ----
    app.ultraAct(0); await W(200);
    app.ultraTrain('ul0'); await W(300);
    out.notDoneOnTap = !(SB_EXPED.prog().done || {}).ul0;
    SB_TRAIL_PRACTICED('ul0', 5, 10);               // 50% — not enough
    out.fiftyFails = !(SB_EXPED.prog().done || {}).ul0 && SB_EXPED.prog().p.ul0 === 50;
    SB_TRAIL_PRACTICED('ul0', 9, 10);               // 90% — cleared
    out.ninetyClears = (SB_EXPED.prog().done || {}).ul0 === 1;
    state.trailReturn = null; state.sessionOver = false; state.nav = 'trail'; state.trailView = 'ultra'; render();

    // ---- 3 of 4 opens the next landmark by the road too ----
    SB_TRAIL_PRACTICED('ul1', 9, 10); SB_TRAIL_PRACTICED('ul2', 9, 10);
    app.trailToMap(); await W(300);
    out.overview = /3\/4 stops|by the Hidden Pass|fully mapped|all four cleared/.test(document.body.textContent);

    // ---- the emblem: all four stops + all three secrets ----
    SB_TRAIL_PRACTICED('ul3', 9, 10);
    out.emblem = SB_EXPED.prog().emb.u0 === 1;
    app.ultraAct(0); await W(250);
    out.mappedClean = !document.querySelector('[data-act="uWisp"],[data-act="uDuel"],[data-act="uGate"]');

    // ---- the teaching road: same visible secrets; the gate is the CARTOGRAPHER'S ----
    app.trailAct('honey|meadow'); await W(300);
    out.honeyBright = !/rgba\(20,15,42/.test(document.body.innerHTML) && !document.querySelector('[data-act="uScout"]');
    out.honeySecrets = !!document.querySelector('[data-act="uWisp"]') && !!document.querySelector('[data-act="uDuel"]') && !!document.querySelector('[data-act="uGate"]');
    app.uGate(); await W(150);
    const cG = c.coins;
    for (let i = 0; i < 3; i++) { app.uqType(state.uq.words[i].w); app.uqGo(); await W(100); }
    out.cartographer = !state.uq && c.coins === cG + 20 && (SB_EXPED.prog().finds.meadow || {}).gate === 1;
    Math.random = R;
    return out;
  });
  ok(r.noFog, 'the Ultra board is BRIGHT — no mist, no scout cells');
  ok(r.twoOpen, 'TWO spine stops are open at once — pick your order');
  ok(r.allPins, 'all four stops are visible on the road');
  ok(r.secretsVisible, 'the three seeded secrets sit visibly on the board');
  ok(r.secretsLine, 'the header counts the secrets still unfound (0/3)');
  ok(r.wispGift, 'tapping the word-wisp is a surprise gift (+8)');
  ok(r.wispGone, 'a claimed wisp leaves the board');
  ok(r.duelCard, 'the rival waits with a named challenge');
  ok(r.duelWon, 'winning the best-of-3 duel pays 25 coins');
  ok(r.gateCard, 'the Hidden Pass demands a 3-word chain');
  ok(r.chainResets, 'a miss breaks the chain back to the start');
  ok(r.passOpens && r.skippedIn, 'the finished chain opens the NEXT landmark early — real non-linearity');
  ok(r.notDoneOnTap, 'tapping Train no longer stamps a stop done');
  ok(r.fiftyFails, '50% in a session records the best but does not clear');
  ok(r.ninetyClears, '90% in a session EARNS the stop');
  ok(r.overview, 'the overview pins tell the story (x/4, passes, mapped)');
  ok(r.emblem, 'all four stops + all three secrets = the 🏅 emblem');
  ok(r.mappedClean, 'a fully-mapped board carries no leftover markers');
  ok(r.honeyBright, 'the TEACHING road boards are bright too');
  ok(r.honeySecrets, 'and carry the same three visible secrets');
  ok(r.cartographer, "there the gate is the Cartographer's: the chain pays +20");
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
  await b.close();
  process.exit(fails ? 1 : 0);
})();
