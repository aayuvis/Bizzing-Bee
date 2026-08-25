// The Atlas stop always tells you what to do next, practice is the gate, stars
// grade the rest. Play-tested complaint: "I completed all the words but I am not
// told what I need to do to qualify for the next round."
//   star 1  practice >= 70%  -> OPENS THE NEXT STOP
//   star 2  read the chapter        star 3  reach the last word card
//   star 4  pass the quiz           star 5  ace the quiz (90% / 95% exp)
const { chromium } = require('playwright');
const SRC = process.env.SRC || __dirname + '/..';
let fails = 0;
const ok = (b, msg) => { console.log((b ? '  OK   ' : '  FAIL ') + msg); if (!b) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const pg = await b.newPage({ viewport: { width: 900, height: 820 } });
  const errs = []; pg.on('pageerror', e => errs.push(String(e.message)));
  await pg.goto('file://' + SRC + '/index.html'); await pg.waitForTimeout(2500);
  const r = await pg.evaluate(async () => {
    state.children = [{ name: 'T', avatar: 'bee', coins: 0, pow: {}, age: 10, lists: { default: { xp: 10 } }, activeList: 'default',
      missed: [], unlockedThemes: ['spellbound'], unlockedConcepts: {}, unlockedLists: {}, questPath: 'journey',
      trail: { lap: 1, done: {}, chk: {}, seen: {}, elap: 1, edone: {}, echk: {} } }];
    state.activeIdx = 0; state.screen = 'app';
    await new Promise(res => SB_LAZY.need('atlas', res));
    await new Promise(res => setTimeout(res, 400));
    const out = {};
    const first = SB_TRAIL_NEXT(); out.firstStop = first && first.title; out.firstArg = first && first.arg;

    // open the first stop: the card must point at Practice-70 as the next move
    app.trailUnit(first.arg);
    await new Promise(res => setTimeout(res, 300));
    const html = document.body.innerHTML;
    out.saysPractice70 = /70% right to open the next stop/.test(html);
    out.noQuizGateLine = !/The quiz is the gate/.test(html);
    out.showsStars = /★/.test(html);

    // a 2-word 100% session is NOT a pass...
    SB_TRAIL_PRACTICED(first.arg, 2, 2);
    out.tinySessionIgnored = SB_TRAIL_NEXT().arg === first.arg;
    // ...a real session at 80% IS: the frontier moves to the next stop
    SB_TRAIL_PRACTICED(first.arg, 8, 10);
    const after = SB_TRAIL_NEXT();
    out.unlockedNext = after && after.arg !== first.arg;
    const c = state.children[0];
    out.starAfterPractice = ((c.trail.st || {})[first.arg + ':1'] || {}).p === 80;

    // a worse later session must not lower the best
    SB_TRAIL_PRACTICED(first.arg, 5, 10);
    out.bestSticks = ((c.trail.st || {})[first.arg + ':1'] || {}).p === 80;

    // the card now points at the QUIZ as the next star
    app.trailUnit(first.arg);
    await new Promise(res => setTimeout(res, 200));
    out.nextIsQuiz = /Pass the Quiz/.test(document.body.innerHTML);

    // legacy save: a quiz-passed stop (doneMap pct only) still counts as passed + starred
    const second = SB_TRAIL_NEXT();
    c.trail.done[second.arg] = { 1: 87 };
    const third = SB_TRAIL_NEXT();
    out.legacyUnlocks = third && third.arg !== second.arg;
    app.trailUnit(second.arg);
    await new Promise(res => setTimeout(res, 200));
    // legacy 87%: practice star (quiz pass proves the words) + quiz-pass star, not the 90% ace
    out.legacyStars = /★★/.test(document.body.innerHTML);

    // THE BUG THAT PROMPTED ALL THIS: finishing the last word must record BY ITSELF —
    // the child who then leaves via the nav bar (never tapping Done) was never
    // recorded, and the stop card sent them back to Practice forever.
    const fresh = SB_TRAIL_NEXT();
    if (fresh && fresh.kind === 'unit') {
      state.trailReturn = fresh.arg; state.trailCourse = 'honey';
      state.sessionWords = Array.from({ length: 10 }, (_, i) => ({ w: 'w' + i }));
      state.gi = 9; state.sessionRight = 9; state.sessionDone = 10;
      state.sessionOver = false; state.nav = 'train';
      app.next();                                   // last word answered -> session over
      out.completionRecords = ((c.trail.st || {})[fresh.arg + ':1'] || {}).p === 90;
      out.summaryBanner = /next Atlas stop is open/.test(document.body.innerHTML);
      state.trailReturn = null;
    } else { out.completionRecords = out.summaryBanner = 'skipped(checkpoint)'; }
    return out;
  });
  ok(r.firstStop, 'the Atlas serves a first stop (' + r.firstStop + ')');
  ok(r.saysPractice70, 'the fresh stop card says: practice, 70%, opens the next stop');
  ok(r.noQuizGateLine, 'the old "quiz is the gate" line is gone');
  ok(r.showsStars, 'the card shows the star ladder');
  ok(r.tinySessionIgnored, 'a 2-word session cannot unlock anything, whatever its score');
  ok(r.unlockedNext, 'a 10-word session at 80% unlocks the next stop');
  ok(r.starAfterPractice, 'best practice % is recorded on the stop (80)');
  ok(r.bestSticks, 'a worse later session never lowers the best');
  ok(r.nextIsQuiz, 'once unlocked, the card points at the quiz for the next star');
  ok(r.legacyUnlocks, 'an old save with only a quiz % still counts as passed');
  ok(r.legacyStars, 'and still shows its earned stars');
  ok(r.completionRecords === true || r.completionRecords === 'skipped(checkpoint)',
     'finishing the last word records the score by itself — no Done tap needed (' + r.completionRecords + ')');
  ok(r.summaryBanner === true || r.summaryBanner === 'skipped(checkpoint)',
     'the finish screen says the next Atlas stop is open');
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
  await b.close();
  process.exit(fails ? 1 : 0);
})();
