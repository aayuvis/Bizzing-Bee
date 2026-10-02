/* RIGHT ANSWERS ADVANCE; WRONG ANSWERS HOLD UNTIL TAPPED, AND SAY WHY (FIX-BEE D3, family
   standard §6).

   The audit saw '✗ Not quite — it's "army". Saved for revision' and a frowning bee, and the
   Atlas quiz moved on by itself 3.2s after a miss. Now every graded spelling surface shows the
   word letter by letter against what the child wrote, names the concept family that explains
   THAT miss (missWhy), and waits for Next. The mascot is never sad.

   Driven for real on: the practice card, the Atlas quiz gate (a spell item and a concept MCQ),
   the Mock Spelling Bee at the microphone, a typed game card (Daily Buzz) and a multiple-choice
   game card (Word Quiz · Spellings). Each: right advances, wrong holds (checked after 4s, longer
   than any old timer) and shows why, Next moves on.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/answer-feedback.cjs               */
const { chromium } = require('playwright');
const path = require('path');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const seed = { theme: 'spellbound', mode: 'light', premium: false, activeIdx: 0, pin: '1234',
  children: [{ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'bizzy', theme: 'spellbound', coins: 50, xp: 0, lists: { default: { xp: 3 } },
    activeList: 'default', missed: [], unlockedThemes: ['spellbound'], trail: { lap: 1, done: {}, chk: {}, seen: {}, elap: 1, edone: {}, echk: {} } }] };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 1000, height: 900 } });
  await ctx.addInitScript(s => { try { if (!localStorage.getItem('sb_t_seeded')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_t_seeded', '1'); } } catch (e) {} }, seed);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + path.resolve(__dirname, '..') + '/index.html'); await pg.waitForTimeout(2800);

  const r = await pg.evaluate(async () => {
    const W = ms => new Promise(res => setTimeout(res, ms)); const o = {}; state.sound = false;
    const RealAudio = window.Audio; window.Audio = function () { return { play: () => Promise.resolve(), pause: () => {}, set onerror(v) {}, get onerror() { return null; } }; };
    try { window.speechSynthesis.speak = () => {}; } catch (e) {}
    const TEAR = '#5EC2FF';   // the old 'oops' face drew a tear in this colour
    const missOn = () => { const m = document.querySelector('.sb-miss'); return m ? { why: m.dataset.why, cols: m.querySelectorAll('.sb-mdcol').length, txt: m.innerText } : null; };

    /* ---- the mascot has no frown to give ---- */
    const strip = h => h.replace(/bc\d+/g, 'X');
    o.oopsIsKind = strip(mascotSVG('oops')) === strip(mascotSVG('think')) && strip(mascotSVG('sad')) === strip(mascotSVG('think')) && mascotSVG('oops').indexOf(TEAR) < 0;

    /* ---- 1. the practice card ---- */
    state.sessionWords = [{ w: 'committee', d: 'a group chosen to decide things' }, { w: 'knight', d: 'a soldier on horseback' }, { w: 'harbour', d: 'a place for ships' }];
    app.startTrain(); await W(200);
    state.typed = 'comitee'; app.check(); await W(150);
    o.pcPanel = missOn(); o.pcMood = state.mood;
    const pcFace = (document.querySelector('[data-act="speak"]') || {}).closest ? document.querySelector('#root').innerHTML : '';
    o.pcNoTear = pcFace.indexOf(TEAR) < 0;
    o.pcNoShake = !/sb-shake/.test(document.querySelector('#root').innerHTML.split('data-act="speak"')[0].slice(-600));
    await W(4000);
    o.pcHeld = state.status === 'wrong' && state.gi === 0 && !!missOn();
    state.typed = 'knigh'; app.check(); await W(80);   // retyping does not change the panel's record of the attempt
    app.next(); await W(150);
    o.pcNext = state.gi === 1 && state.status === 'idle' && !missOn();
    state.typed = 'nite'; app.check(); await W(100);
    o.pcSilent = (missOn() || {}).why;
    app.next(); await W(150);
    state.typed = 'harbour'; app.check(); await W(1500);
    o.pcRightAdvances = state.sessionOver === true || state.gi > 2;

    /* ---- 2. the Atlas quiz gate ---- */
    await new Promise(res => SB_LAZY.need('atlas', res)); await W(400);
    app.trailAct('honey|meadow'); await W(250);
    const uid = document.querySelector('[data-act="trailUnit"]').getAttribute('data-arg');
    app.trailUnit(uid); await W(250); app.trailQuiz(); await W(700);
    const q2 = state.tq; let spellAt = -1, mcAt = -1;
    q2.items.forEach((it, i) => { if (spellAt < 0 && it.ty === 'spell') spellAt = i; if (mcAt < 0 && (it.ty === 'mc' || it.ty === 'mean')) mcAt = i; });
    // a spell item, wrong
    q2.i = spellAt; q2.picked = null; render(); await W(100);
    const sw = q2.items[spellAt].w; app.tqInput(sw.slice(0, -1) + (sw.slice(-1) === 'x' ? 'y' : 'x')); app.tqSpell(); await W(150);
    o.qgPanel = missOn();
    await W(4000);
    o.qgHeld = state.tq.i === spellAt && state.tq.picked != null && !!missOn();
    app.tqNext(); await W(150);
    o.qgNext = state.tq.i === spellAt + 1;
    // a concept MCQ, wrong then (another) right
    const mcIt = state.tq.items[mcAt]; state.tq.i = mcAt; state.tq.picked = null; render(); await W(80);
    app.tqPick(String((mcIt.ans + 1) % mcIt.opts.length)); await W(4000);
    o.qgMcHeld = state.tq.i === mcAt && !!document.querySelector('.tq-miss');
    let rightAt = -1; state.tq.items.forEach((it, i) => { if (rightAt < 0 && i !== mcAt && (it.ty === 'mc' || it.ty === 'mean')) rightAt = i; });
    if (rightAt < 0) rightAt = mcAt;
    state.tq.i = rightAt; state.tq.picked = null; render(); await W(80);
    app.tqPick(String(state.tq.items[rightAt].ans)); await W(1500);
    o.qgRightAdvances = state.tq.i === rightAt + 1 || state.tq.over;
    state.tq = null; state.trailView = null;

    /* ---- 3. the Mock Spelling Bee, at the microphone ---- */
    app.mbOpen(); await W(150); app.mbStart(); await W(200);
    const g = state.mb; g.word = { w: 'meringue', d: 'a sweet topping of whipped egg whites', y: 3 }; g.phase = 'me'; g.typed = ''; g.asked = {}; render(); await W(100);
    app.mbType('merang'); app.mbSpell(); await W(150);
    o.mbPanel = missOn(); o.mbHeldPhase = state.mb.phase;
    await W(4000);
    o.mbHeld = state.mb.phase === 'meDone' && !!state.mb.hold && !!missOn();
    app.mbGoOn(); await W(200);
    o.mbGoesOn = !state.mb.hold;
    state.nav = 'home'; render();   // leave the hall standing: its own timers finish against a live state

    /* ---- 4. a typed game card: Daily Buzz ---- */
    app.playGame('buzz'); await W(200);
    const gb = state.game; gb.list = [{ w: 'rhythm', d: 'a strong regular repeated pattern' }, { w: 'island', d: 'land with water all round' }, { w: 'harbour', d: '' }]; gb.i = 0; render();
    state.typed = 'rythm'; app.gSubmit(); await W(150);
    o.gbPanel = missOn();
    await W(4000);
    o.gbHeld = state.game.i === 0 && state.game.wait === true && !!missOn() && !!document.querySelector('[data-act="gMissGo"]');
    app.gMissGo(); await W(200);
    o.gbNext = state.game.i === 1 && !state.game.wait && !missOn();
    state.typed = 'island'; app.gSubmit(); await W(200);
    o.gbRightAdvances = state.game.i === 2;
    app.exitGame && app.exitGame();

    /* ---- 5. a multiple-choice game card: Word Quiz · Spellings ---- */
    app.wqStart('spell'); await W(250);
    const gm = state.game; const q0 = gm.qs[0]; const wrongIdx = q0.choices.findIndex(c => c !== q0.answer);
    app.gPick(String(wrongIdx)); await W(150);
    o.mcPanel = missOn();
    await W(4000);
    o.mcHeld = state.game.i === 0 && state.game.picked != null && !!document.querySelector('[data-act="gMcNext"]');
    app.gMcNext(); await W(200);
    o.mcNext = state.game.i === 1 && state.game.picked == null;
    const q1 = state.game.qs[1]; app.gPick(String(q1.choices.indexOf(q1.answer))); await W(1400);
    o.mcRightAdvances = state.game.i === 2 || state.game.status !== 'play';
    window.Audio = RealAudio; return o;
  });

  ok(r.oopsIsKind, "the mascot's 'oops' and 'sad' moods draw the kind 'think' face — no tear, no frown");
  ok(r.pcPanel && r.pcPanel.why === 'double' && r.pcPanel.cols >= 9, 'practice card: a miss shows the word letter by letter and WHY (committee → double letters)');
  ok(r.pcMood === 'think' && r.pcNoTear && r.pcNoShake, 'practice card: the bee stays kind on a miss (mood think, no tear, no head-shake)');
  ok(r.pcHeld, 'practice card: the miss HOLDS (still there after 4s)');
  ok(r.pcNext, 'practice card: Next moves on and clears the panel');
  ok(r.pcSilent === 'silent', 'practice card: "nite" for knight is explained as a silent letter');
  ok(r.pcRightAdvances, 'practice card: a right answer advances by itself');
  ok(r.qgPanel, 'Atlas quiz gate: a wrong spell item shows the letters and the why');
  ok(r.qgHeld, 'Atlas quiz gate: and HOLDS — no auto-advance after a miss (it used to go at 3.2s)');
  ok(r.qgNext, 'Atlas quiz gate: Next moves on');
  ok(r.qgMcHeld, 'Atlas quiz gate: a wrong concept MCQ holds and says the green one is right');
  ok(r.qgRightAdvances, 'Atlas quiz gate: a right answer still advances by itself');
  ok(r.mbPanel && r.mbHeldPhase === 'meDone', 'Mock Bee: a miss at the microphone shows the letters and the why');
  ok(r.mbHeld, 'Mock Bee: and the hall waits (no next speller called) until Continue');
  ok(r.mbGoesOn, 'Mock Bee: Continue lets the bee go on');
  ok(r.gbPanel, 'Daily Buzz: a miss shows the letters and the why');
  ok(r.gbHeld, 'Daily Buzz: and holds with a Next button (it used to move on at 3.6s)');
  ok(r.gbNext, 'Daily Buzz: Next moves on');
  ok(r.gbRightAdvances, 'Daily Buzz: a right answer advances');
  ok(r.mcPanel, 'Word Quiz (spellings): a wrong pick shows the letters and the why');
  ok(r.mcHeld, 'Word Quiz: and holds with a Next button');
  ok(r.mcNext, 'Word Quiz: Next moves on');
  ok(r.mcRightAdvances, 'Word Quiz: a right pick advances by itself');
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
