/* RIGHT ANSWERS ADVANCE; WRONG ANSWERS HOLD UNTIL TAPPED, AND SAY WHY (FIX-BEE D3, family
   standard §6).

   The audit saw '✗ Not quite — it's "army". Saved for revision' and a frowning bee, and the
   Atlas quiz moved on by itself 3.2s after a miss. Now every graded spelling surface shows the
   word letter by letter against what the child wrote, names the concept family that explains
   THAT miss (missWhy), and waits for Next. The mascot is never sad.

   FIX2 (3 Oct): and NOTHING COVERS THE PANEL — no toast is visible over it on any of these
   surfaces, at a desktop and on a phone (the near-miss "So close" toast sat across the diff).

   Driven for real on: the practice card, the Atlas quiz gate (a spell item and a concept MCQ),
   the Mock Spelling Bee at the microphone, a typed game card (Daily Buzz) and a multiple-choice
   game card (Word Quiz · Spellings). Each: right advances, wrong holds (checked after 4s, longer
   than any old timer) and shows why, Next moves on.
   Every step waits for the STATE it needs (`U`, below) — the screen drawn, the panel up, the
   card moved on — never for a guessed number of milliseconds. The 4s holds stay: they are the
   check that nothing moves on by itself.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/answer-feedback.cjs               */
const { chromium } = require('playwright');
const path = require('path');
const { booted } = require('./lib/wait.cjs');
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
  await pg.goto('file://' + path.resolve(__dirname, '..') + '/index.html'); await booted(pg);

  const r = await pg.evaluate(async () => {
    const W = ms => new Promise(res => setTimeout(res, ms)); const o = {}; state.sound = false;
    /* wait for a condition, not for a time: true when it holds, false after ms (the check after it then fails with its own message) */
    const U = async (f, ms) => { for (const t0 = Date.now(); Date.now() - t0 < (ms || 15000);) { try { if (f()) return true; } catch (e) {} await W(30); } return false; };
    const RealAudio = window.Audio; window.Audio = function () { return { play: () => Promise.resolve(), pause: () => {}, set onerror(v) {}, get onerror() { return null; } }; };
    try { window.speechSynthesis.speak = () => {}; } catch (e) {}
    const TEAR = '#5EC2FF';   // the old 'oops' face drew a tear in this colour
    const missOn = () => { const m = document.querySelector('.sb-miss'); return m ? { why: m.dataset.why, cols: m.querySelectorAll('.sb-mdcol').length, txt: m.innerText } : null; };
    /* FIX2 #1: nothing covers the panel — no toast may be visible on top of it, the near-miss
       toast the practice card used to raise included, nor one raised while the panel is up */
    const covered = () => { const ms = [...document.querySelectorAll('.sb-miss')].filter(m => m.getClientRects().length); if (!ms.length) return 'no panel';
      const hit = [...document.querySelectorAll('.sb-toast')].filter(t => { if (!t.getClientRects().length || getComputedStyle(t).display === 'none' || getComputedStyle(t).visibility === 'hidden') return false;
        const r = t.getBoundingClientRect(); return ms.some(m => { const a = m.getBoundingClientRect(); return !(r.right <= a.left || r.left >= a.right || r.bottom <= a.top || r.top >= a.bottom); }); });
      if (hit.length) return 'covered by "' + hit[0].textContent.trim().slice(0, 40) + '"';
      /* and the rule that guarantees it whatever the layout: no toast shows at all while a panel is up */
      const shown = [...document.querySelectorAll('.sb-toast')].find(t => t.getClientRects().length && getComputedStyle(t).display !== 'none' && getComputedStyle(t).visibility !== 'hidden');
      return shown ? 'a toast showing beside it ("' + shown.textContent.trim().slice(0, 30) + '")' : ''; };
    /* the panel is scrolled to the foot of the screen first — where a toast is drawn — so a toast
       that showed would land on it on every surface, not only where the layout happens to put it */
    const toastOver = async () => { const now = covered(); const m = document.querySelector('.sb-miss'); if (m) m.scrollIntoView({ block: 'end' });
      flash('A message while the panel is up'); await W(80); const r = now || covered(); window.scrollTo(0, 0); return r; };

    /* ---- the mascot has no frown to give ---- */
    const strip = h => h.replace(/bc\d+/g, 'X');
    o.oopsIsKind = strip(mascotSVG('oops')) === strip(mascotSVG('think')) && strip(mascotSVG('sad')) === strip(mascotSVG('think')) && mascotSVG('oops').indexOf(TEAR) < 0;

    /* ---- 1. the practice card ---- */
    state.sessionWords = [{ w: 'committee', d: 'a group chosen to decide things' }, { w: 'knight', d: 'a soldier on horseback' }, { w: 'harbour', d: 'a place for ships' }];
    app.startTrain(); await U(() => state.nav === 'train' && state.gi === 0 && state.status === 'idle');
    state.typed = 'comitee'; app.check(); await U(() => !!missOn());
    o.pcPanel = missOn(); o.pcMood = state.mood; o.pcCover = await toastOver();
    const pcFace = (document.querySelector('[data-act="speak"]') || {}).closest ? document.querySelector('#root').innerHTML : '';
    o.pcNoTear = pcFace.indexOf(TEAR) < 0;
    o.pcNoShake = !/sb-shake/.test(document.querySelector('#root').innerHTML.split('data-act="speak"')[0].slice(-600));
    await W(4000);
    o.pcHeld = state.status === 'wrong' && state.gi === 0 && !!missOn();
    state.typed = 'knigh'; app.check(); await W(80);   // retyping does not change the panel's record of the attempt
    app.next(); await U(() => state.gi === 1 && state.status === 'idle' && !missOn(), 5000);
    o.pcNext = state.gi === 1 && state.status === 'idle' && !missOn();
    state.typed = 'nite'; app.check(); await U(() => !!missOn());
    o.pcSilent = (missOn() || {}).why;
    app.next(); await U(() => state.gi === 2 && state.status === 'idle');
    state.typed = 'harbour'; app.check(); await U(() => state.sessionOver === true || state.gi > 2, 10000);
    o.pcRightAdvances = state.sessionOver === true || state.gi > 2;

    /* ---- 2. the Atlas quiz gate ---- */
    await new Promise(res => SB_LAZY.need('atlas', res));
    app.trailAct('honey|meadow'); await U(() => !!document.querySelector('[data-act="trailUnit"]'));
    const uid = document.querySelector('[data-act="trailUnit"]').getAttribute('data-arg');
    app.trailUnit(uid); await U(() => state.trailUnit === uid); app.trailQuiz();
    await U(() => state.tq && state.tq.items && state.tq.items.some(it => it.ty === 'spell') && state.tq.items.some(it => it.ty === 'mc' || it.ty === 'mean'));
    const q2 = state.tq; let spellAt = -1, mcAt = -1;
    q2.items.forEach((it, i) => { if (spellAt < 0 && it.ty === 'spell') spellAt = i; if (mcAt < 0 && (it.ty === 'mc' || it.ty === 'mean')) mcAt = i; });
    // a spell item, wrong
    q2.i = spellAt; q2.picked = null; render(); await W(100);
    const sw = q2.items[spellAt].w; app.tqInput(sw.slice(0, -1) + (sw.slice(-1) === 'x' ? 'y' : 'x')); app.tqSpell(); await U(() => !!missOn());
    o.qgPanel = missOn(); o.qgCover = await toastOver();
    await W(4000);
    o.qgHeld = state.tq.i === spellAt && state.tq.picked != null && !!missOn();
    app.tqNext(); await U(() => state.tq.i === spellAt + 1, 5000);
    o.qgNext = state.tq.i === spellAt + 1;
    // a concept MCQ, wrong then (another) right
    const mcIt = state.tq.items[mcAt]; state.tq.i = mcAt; state.tq.picked = null; render(); await W(80);
    app.tqPick(String((mcIt.ans + 1) % mcIt.opts.length)); await W(4000);
    o.qgMcHeld = state.tq.i === mcAt && !!document.querySelector('.tq-miss');
    let rightAt = -1; state.tq.items.forEach((it, i) => { if (rightAt < 0 && i !== mcAt && (it.ty === 'mc' || it.ty === 'mean')) rightAt = i; });
    if (rightAt < 0) rightAt = mcAt;
    state.tq.i = rightAt; state.tq.picked = null; render(); await W(80);
    app.tqPick(String(state.tq.items[rightAt].ans)); await U(() => state.tq.i === rightAt + 1 || state.tq.over, 10000);
    o.qgRightAdvances = state.tq.i === rightAt + 1 || state.tq.over;
    state.tq = null; state.trailView = null;

    /* ---- 3. the Mock Spelling Bee, at the microphone ---- */
    /* The child is handed the microphone BY THE HALL. Setting phase 'me' during the draw (as
       this did) left the draw's own timer pending — it opens round one (beginRound sets the
       phase to 'call') whenever the opening line ends — and on a loaded machine that landed
       inside the 4s hold and called the next speller over a miss the hall was waiting on.
       So: let the round open, give the child the next turn, and let nextTurn call them. */
    app.mbOpen(); await U(() => state.nav === 'mockbee' && state.mb && state.mb.view === 'lobby');
    app.mbStart(); await U(() => state.mb && state.mb.view === 'stage' && state.mb.phase === 'call', 30000);
    { const m = state.mb; m.turn = m.field.filter(s => s.in).findIndex(s => s.kind === 'me'); }
    await U(() => state.mb.phase === 'me', 30000);
    const g = state.mb; g.word = { w: 'meringue', d: 'a sweet topping of whipped egg whites', y: 3 }; g.phase = 'me'; g.typed = ''; g.asked = {}; render();
    app.mbType('merang'); app.mbSpell(); await U(() => !!missOn() && state.mb.phase === 'meDone');
    o.mbPanel = missOn(); o.mbHeldPhase = state.mb.phase; o.mbCover = await toastOver();
    await W(4000);
    o.mbHeld = state.mb.phase === 'meDone' && !!state.mb.hold && !!missOn();
    app.mbGoOn(); await U(() => !state.mb.hold, 5000);
    o.mbGoesOn = !state.mb.hold;
    state.nav = 'home'; render();   // leave the hall standing: its own timers finish against a live state

    /* ---- 4. a typed game card: Daily Buzz ---- */
    app.playGame('buzz'); await U(() => state.game && state.game.type === 'buzz' && state.game.list);
    const gb = state.game; gb.list = [{ w: 'rhythm', d: 'a strong regular repeated pattern' }, { w: 'island', d: 'land with water all round' }, { w: 'harbour', d: '' }]; gb.i = 0; render();
    state.typed = 'rythm'; app.gSubmit(); await U(() => !!missOn());
    o.gbPanel = missOn(); o.gbCover = await toastOver();
    await W(4000);
    o.gbHeld = state.game.i === 0 && state.game.wait === true && !!missOn() && !!document.querySelector('[data-act="gMissGo"]');
    app.gMissGo(); await U(() => state.game.i === 1 && !state.game.wait && !missOn(), 5000);
    o.gbNext = state.game.i === 1 && !state.game.wait && !missOn();
    state.typed = 'island'; app.gSubmit(); await U(() => state.game.i === 2, 10000);
    o.gbRightAdvances = state.game.i === 2;
    app.exitGame && app.exitGame();

    /* ---- 5. a multiple-choice game card: Word Quiz · Spellings ---- */
    app.wqStart('spell'); await U(() => state.game && state.game.qs && state.game.qs.length > 1);
    const gm = state.game; const q0 = gm.qs[0]; const wrongIdx = q0.choices.findIndex(c => c !== q0.answer);
    app.gPick(String(wrongIdx)); await U(() => !!missOn());
    o.mcPanel = missOn(); o.mcCover = await toastOver();
    await W(4000);
    o.mcHeld = state.game.i === 0 && state.game.picked != null && !!document.querySelector('[data-act="gMcNext"]');
    app.gMcNext(); await U(() => state.game.i === 1 && state.game.picked == null, 5000);
    o.mcNext = state.game.i === 1 && state.game.picked == null;
    const q1 = state.game.qs[1]; app.gPick(String(q1.choices.indexOf(q1.answer))); await U(() => state.game.i === 2 || state.game.status !== 'play', 10000);
    o.mcRightAdvances = state.game.i === 2 || state.game.status !== 'play';
    window.Audio = RealAudio; return o;
  });

  ok(r.oopsIsKind, "the mascot's 'oops' and 'sad' moods draw the kind 'think' face — no tear, no frown");
  ok(r.pcPanel && r.pcPanel.why === 'double' && r.pcPanel.cols >= 9, 'practice card: a miss shows the word letter by letter and WHY (committee → double letters)');
  ok(r.pcMood === 'think' && r.pcNoTear && r.pcNoShake, 'practice card: the bee stays kind on a miss (mood think, no tear, no head-shake)');
  ok(r.pcHeld, 'practice card: the miss HOLDS (still there after 4s)');
  ok(r.pcPanel && /So close — 2 letters off/.test(r.pcPanel.txt), 'practice card: a near miss says "So close — 2 letters off" IN the panel\'s headline, where it covers nothing');
  const covers = { practice: r.pcCover, 'Atlas quiz gate': r.qgCover, 'Mock Bee': r.mbCover, 'Daily Buzz': r.gbCover, 'Word Quiz': r.mcCover };
  ok(Object.values(covers).every(v => v === ''), 'no toast is ever drawn over the letter-by-letter panel — on a miss, or raised while it is up (' + Object.entries(covers).map(([k, v]) => k + ': ' + (v || 'clear')).join(', ') + ')');
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
  /* ---- the same on a phone, where the toast sat right across the diff (390×844) ---- */
  const ctxP = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  await ctxP.addInitScript(s => { try { if (!localStorage.getItem('sb_t_seeded')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_t_seeded', '1'); } } catch (e) {} }, seed);
  const pp = await ctxP.newPage(); pp.on('pageerror', e => errs.push('phone ' + e.message));
  await pp.goto('file://' + path.resolve(__dirname, '..') + '/index.html'); await booted(pp);
  const ph = await pp.evaluate(async () => { const W = ms => new Promise(res => setTimeout(res, ms)); state.sound = false;
    const U = async (f, ms) => { for (const t0 = Date.now(); Date.now() - t0 < (ms || 15000);) { try { if (f()) return true; } catch (e) {} await W(30); } return false; };
    window.Audio = function () { return { play: () => Promise.resolve(), pause: () => {} }; }; try { window.speechSynthesis.speak = () => {}; } catch (e) {}
    const covered = () => { const ms = [...document.querySelectorAll('.sb-miss')].filter(m => m.getClientRects().length); if (!ms.length) return 'no panel';
      const hit = [...document.querySelectorAll('.sb-toast')].filter(t => { if (!t.getClientRects().length || getComputedStyle(t).display === 'none' || getComputedStyle(t).visibility === 'hidden') return false;
        const r = t.getBoundingClientRect(); return ms.some(m => { const a = m.getBoundingClientRect(); return !(r.right <= a.left || r.left >= a.right || r.bottom <= a.top || r.top >= a.bottom); }); });
      return hit.length ? 'covered by "' + hit[0].textContent.trim().slice(0, 40) + '"' : ''; };
    state.sessionWords = [{ w: 'committee', d: 'a group chosen to decide things' }, { w: 'knight', d: 'a soldier on horseback' }];
    app.startTrain(); await U(() => state.nav === 'train' && state.gi === 0 && state.status === 'idle');
    state.typed = 'comitee'; app.check(); await U(() => [...document.querySelectorAll('.sb-miss')].some(m => m.getClientRects().length));
    const onMiss = covered(); flash('A message while the panel is up'); await W(80); const raised = covered();
    /* read the moment the panel is gone: the toast lives 2.2s from when it was raised, so a
       read that waits on the clock is a read of whether the machine was quick */
    app.next(); await U(() => state.gi === 1 && !document.querySelector('.sb-miss'), 5000); const back = [...document.querySelectorAll('.sb-toast')].some(t => getComputedStyle(t).display !== 'none');
    return { onMiss, raised, back }; });
  ok(ph.onMiss === '' && ph.raised === '', `phone (390×844): no toast covers the practice card's panel, on the miss or raised after (${ph.onMiss || 'clear'} / ${ph.raised || 'clear'})`);
  ok(ph.back, 'phone: once the panel goes (Next), a toast still in its time shows again — toasts are held back, not lost');
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
