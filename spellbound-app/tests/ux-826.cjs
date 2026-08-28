// Amrita's 8.25/8.26 sweep, pinned: the Atlas quiz says its word and moves on by
// itself; a Challenge miss SHOWS the correct word; Daily Buzz lingers on a miss;
// a new session resets the Card view (the shows-X-says-Y mismatch); the quick
// practice row is three tiles with an honest word-picker label.
const { chromium } = require('playwright');
const SRC = process.env.SRC || __dirname + '/..';
const fs = require('fs');
let fails = 0;
const ok = (b, msg) => { console.log((b ? '  OK   ' : '  FAIL ') + msg); if (!b) fails++; };
(async () => {
  const src = fs.readFileSync(SRC + '/app3.js', 'utf8');
  ok(/missPause\(last\?gFinishBuzz:null, 3600\)/.test(src), 'Daily Buzz holds a miss on screen 3.6s');
  ok(/g\.fmt==='time'\?1600:2400/.test(src), 'a Challenge miss pauses to show the word (shorter when timed)');
  ok(/Saved for revision/.test(src.slice(src.indexOf("Look &amp; listen"))), 'the miss reveal says the word is saved for revision');

  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const pg = await b.newPage({ viewport: { width: 1100, height: 900 } });
  const errs = []; pg.on('pageerror', e => errs.push(String(e.message)));
  await pg.goto('file://' + SRC + '/index.html'); await pg.waitForTimeout(2600);
  const r = await pg.evaluate(async () => {
    const out = {}; const W = ms => new Promise(res => setTimeout(res, ms));
    state.children = [{ name: 'T', avatar: 'bee', coins: 0, pow: {}, age: 10, lists: { default: { xp: 10 } }, activeList: 'default',
      missed: [], unlockedThemes: ['spellbound'], unlockedConcepts: {}, unlockedLists: {}, questPath: 'journey',
      trail: { lap: 1, done: {}, chk: {}, seen: {}, elap: 1, edone: {}, echk: {} } }];
    state.activeIdx = 0; state.screen = 'app'; state.devUnlock = true; state.sound = false; // no real audio in CI

    // spy on the word audio: every clip goes through an Audio element
    const saidWords = []; const RealAudio = window.Audio;
    window.Audio = function (src) { saidWords.push(String(src || '')); const a = { play: () => Promise.resolve(), pause: () => {} };
      Object.defineProperty(a, 'onerror', { set() {}, get() { return null; } }); return a; };

    // ---- a fresh session resets the Card view (the shows-X-says-Y mismatch) ----
    state.cardIdx = 7; state.coachCardView = false;
    state.sessionWords = [{ w: 'alpha', d: '' }, { w: 'beta', d: '' }, { w: 'gamma', d: '' }];
    app.startTrain(); await W(500);
    out.cardReset = state.cardIdx === 0 && state.gi === 0;
    app.exitTrain && app.exitTrain(); await W(200);

    // ---- quick practice row: three tiles, honest labels ----
    state.nav = 'coach'; state.coachMode = null; state.luTab = 'revise'; render(); await W(200);
    const tiles = ['startBuzz', 'startOral', 'coachSetupOpen'].map(a => document.querySelector(`[data-act="${a}"]`));
    out.rowThree = tiles.every(Boolean) && !document.querySelector('[data-act="startWritten"]');
    out.pickLabel = [...document.querySelectorAll('[data-act="coachSetupOpen"]')].some(el => /Pick your words/.test(el.textContent || ''));

    // ---- Atlas quiz: auto-say on a spell item, auto-advance after answering ----
    await new Promise(res => SB_LAZY.need('atlas', res)); await W(300);
    const R = Math.random; Math.random = () => 0.9;
    app.trailAct('honey|meadow'); await W(250);
    const uid = document.querySelector('[data-act="trailUnit"]').getAttribute('data-arg');
    app.trailUnit(uid); await W(250);
    app.trailQuiz(); await W(900);
    const q2 = state.tq; out.quizUp = !!q2 && !q2.over;
    // walk to the first spell item, answering MCQs; watch for auto-advance on the way
    let spellSaid = false, autoAdvanced = false, guard = 0;
    while (state.tq && !state.tq.over && guard++ < 20) {
      const it = state.tq.items[state.tq.i]; const at = state.tq.i;
      if (it.ty === 'spell') {
        spellSaid = saidWords.some(s => s.indexOf(String(it.w).toLowerCase().replace(/[^a-z0-9]/g, '-')) >= 0);
        app.tqInput(it.w); app.tqSpell();
      } else { app.tqPick(String(it.ans)); }
      await W(1850);   // > the 1100ms right-answer timer + the 450ms auto-say beat
      if (state.tq && !state.tq.over && state.tq.i > at) autoAdvanced = true;
      if (state.tq && state.tq.over) break;
      if (spellSaid) { /* proven — finish fast */ }
    }
    out.spellSaid = spellSaid;
    out.autoAdvanced = autoAdvanced;
    Math.random = R; window.Audio = RealAudio; state.tq = null; state.trailView = null;
    return out;
  });
  ok(r.cardReset, 'a new session resets Card view to card 1 (display always matches the voice)');
  ok(r.rowThree, 'quick practice is three tiles — Written folded away');
  ok(r.pickLabel, 'the old "Setup" tile now says "Pick your words"');
  ok(r.quizUp, 'the Atlas quiz opens');
  ok(r.spellSaid, 'a spell item SAYS its word without a tap');
  ok(r.autoAdvanced, 'an answered item advances by itself — no double Enter');
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
  await b.close();
  process.exit(fails ? 1 : 0);
})();
