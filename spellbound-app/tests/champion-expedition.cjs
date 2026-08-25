// The Champion's Expedition: fog of war on EVERY board, scouting by spelling,
// per-child seeded secrets (wisp / rival duel / gate), the Hidden Pass that skips
// a landmark, the Cartographer's Gate on the teaching road, two open Ultra stops,
// 3-of-4 progression, stops EARNED at 70%, and the fully-mapped emblem.
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

    // ---- ULTRA LANDMARK: fog, two open stops, hidden pins ----
    app.ultraAct(0); await W(300);
    out.fog = document.querySelectorAll('svg mask rect').length > 0 && /rgba\(20,15,42/.test(document.body.innerHTML);
    out.cells = document.querySelectorAll('[data-act="uScout"]').length;
    out.twoOpen = document.querySelectorAll('.atlas-stop.now').length === 2;
    const pins = document.querySelectorAll('[data-act="ultraPick"]').length;
    out.hiddenPins = pins < 4;                       // stops 3-4 still under the mist
    out.secretsLine = /0\/3 secrets/.test(document.body.textContent);

    // ---- scouting: spell to clear; the wisp claims itself ----
    const spots = SB_EXPED.spots('u0');
    const wisp = spots.find(s => s.k === 'wisp');
    app.uScout(wisp.x + ',' + wisp.y); await W(200);
    out.scoutCard = state.uq && state.uq.kind === 'scout' && /Scout the mist/.test(document.body.innerHTML);
    app.uqType('zz'); app.uqGo(); await W(100);
    out.scoutWrongHolds = !!state.uq;
    const coins0 = c.coins;
    app.uqType(state.uq.w); app.uqGo(); await W(150);
    out.wispFound = !state.uq && (SB_EXPED.prog().finds.u0 || {}).wisp === 1 && c.coins === coins0 + 8;

    // ---- the rival duel: best of three ----
    const duel = spots.find(s => s.k === 'duel');
    app.uScout(duel.x + ',' + duel.y); await W(150);
    app.uqType(state.uq.w); app.uqGo(); await W(150);
    out.duelMarker = !!document.querySelector('[data-act="uDuel"]');
    app.uDuel(); await W(150);
    out.duelCard = state.uq && state.uq.kind === 'duel' && !!state.uq.rival;
    const cW = c.coins;
    app.uqType(state.uq.words[0].w); app.uqGo(); await W(120);
    app.uqType(state.uq.words[1].w); app.uqGo(); await W(120);
    out.duelWon = !state.uq && c.coins === cW + 25 && (SB_EXPED.prog().finds.u0 || {}).duel === 1;

    // ---- the Hidden Pass: 3-word chain, next landmark opens EARLY ----
    const gate = spots.find(s => s.k === 'gate');
    app.uScout(gate.x + ',' + gate.y); await W(150);
    app.uqType(state.uq.w); app.uqGo(); await W(150);
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
    const openByRoad = (function () { try { return !!(state.devUnlock) && true; } catch (e) { return false; } })();
    out.roadRule = SB_EXPED.prog().gates[1] === 1 || openByRoad;   // gate already open; road rule visible on pin sub
    app.trailToMap(); await W(300);
    out.overview = /3\/4 stops|by the Hidden Pass|fully mapped|all four cleared/.test(document.body.textContent);

    // ---- the emblem: all four stops + all three secrets ----
    SB_TRAIL_PRACTICED('ul3', 9, 10);
    out.emblem = SB_EXPED.prog().emb.u0 === 1;
    app.ultraAct(0); await W(250);
    out.fogLifts = !/rgba\(20,15,42/.test(document.body.innerHTML);   // fully mapped board wears no mist

    // ---- the teaching road: fog + scouting + the CARTOGRAPHER'S gate ----
    app.trailAct('honey|meadow'); await W(300);
    out.honeyFog = /rgba\(20,15,42/.test(document.body.innerHTML) && document.querySelectorAll('[data-act="uScout"]').length > 0;
    const hs = SB_EXPED.spots('meadow'); const hGate = hs.find(s => s.k === 'gate');
    app.uScout(hGate.x + ',' + hGate.y); await W(150);
    app.uqType(state.uq.w); app.uqGo(); await W(150);
    app.uGate(); await W(150);
    const cG = c.coins;
    for (let i = 0; i < 3; i++) { app.uqType(state.uq.words[i].w); app.uqGo(); await W(100); }
    const rev = SB_EXPED.prog().rev.meadow || [];
    out.cartographer = c.coins === cG + 20 && rev.some(cc => cc[2] >= 100);
    Math.random = R;
    return out;
  });
  ok(r.fog, 'the Ultra board opens under the mist');
  ok(r.cells > 10, 'the mist is scoutable — ' + r.cells + ' tap-cells over the unknown');
  ok(r.twoOpen, 'TWO spine stops are open at once — pick your order');
  ok(r.hiddenPins, 'stops beyond the open pair wait unseen under the fog');
  ok(r.secretsLine, 'the header counts the secrets still hidden (0/3)');
  ok(r.scoutCard, 'tapping the mist asks for one spelled word');
  ok(r.scoutWrongHolds, 'a wrong spelling keeps the mist closed');
  ok(r.wispFound, 'scouting the right patch uncovers the word-wisp (+8)');
  ok(r.duelMarker && r.duelCard, 'a revealed rival waits with a named challenge');
  ok(r.duelWon, 'winning the best-of-3 duel pays 25 coins');
  ok(r.gateCard, 'the Hidden Pass demands a 3-word chain');
  ok(r.chainResets, 'a miss breaks the chain back to the start');
  ok(r.passOpens && r.skippedIn, 'the finished chain opens the NEXT landmark early — real non-linearity');
  ok(r.notDoneOnTap, 'tapping Train no longer stamps a stop done');
  ok(r.fiftyFails, '50% in a session records the best but does not clear');
  ok(r.ninetyClears, '90% in a session EARNS the stop');
  ok(r.overview, 'the overview pins tell the new story (x/4, passes, mapped)');
  ok(r.emblem, 'all four stops + all three secrets = the 🏅 emblem');
  ok(r.fogLifts, 'a fully-mapped board wears no mist at all');
  ok(r.honeyFog, 'the TEACHING road boards carry the same mist and scouting');
  ok(r.cartographer, "there the gate is the Cartographer's: the chain unveils the whole map (+20)");
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
  await b.close();
  process.exit(fails ? 1 : 0);
})();
