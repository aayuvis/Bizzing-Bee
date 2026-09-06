/* THE SETS — a stop's words in rounds of the act's size, marked done one by one.

   The owner's ask: "it should show you have done set one, practise set 2, and it
   should mark S1 S2 S3 S4 S5 on the card and grey out what's not done." Three
   things have to hold for that to mean anything, and each has already been got
   wrong once:

   1. A SET IS A FIXED SLICE. The old rotation advanced a free-running offset by
      however many words came back, so once a pool was not an exact multiple of the
      round size the slices drifted and "set 3" was different words each visit.
   2. THE COUNT COMES FROM THE POOL, WHICH IS LAZY. Opening a stop before
      trail-map-data.js landed counted the chapter's ten teaching words and drew
      ONE chip on a four-set stop, then never corrected itself.
   3. ONE SET AT THE GATE OPENS THE NEXT STOP. Finishing them all is a star, never
      a toll — a child must never be trapped at a stop to move on. */
const { chromium } = require('playwright');
const SRC = require('path').resolve(__dirname, '..');
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
    const out = {}, c = state.children[0];
    const first = SB_TRAIL_NEXT(); const uid = first.arg;
    out.stop = uid;

    /* the count is the pool cut by the act's round size, and it is never a promise
       the pool cannot keep */
    /* the pools are lazy — ask for them the way the stop card does */
    app.trailUnit(uid); await new Promise(res => setTimeout(res, 900));
    const S = SB_TRAIL_SETS(uid); out.sets = S.sets; out.gate = S.gate;
    /* THE SETS ARE CUT FROM THE STOP'S WHOLE LIST, NOT FROM ONE LAP'S BAND.
       Cut from the lap-1 band, a 75-word Meadow stop offered four sets and
       seventy-nine of the 128 stops offered exactly one. */
    const P = (window.SB_TRAIL_MAP || {})[uid] || {};
    const pool = (P[1] || []).concat(P[2] || [], P[3] || []);
    out.poolLoaded = pool.length > 0;
    out.countMatchesPool = S.sets === Math.max(1, Math.min(5, Math.ceil(pool.length / 15)));
    out.neverOverFive = S.sets <= 5 && S.sets >= 1;
    out.fiveInTheMeadow = S.sets === 5;
    /* and it is not one lucky stop: every Meadow stop that holds five rounds of
       words must offer five sets */
    let five = 0, meadow = 0;
    for (const u of (SB_TRAIL.honey.units || [])) {
      if (u.act !== 'meadow') continue;
      const p = (window.SB_TRAIL_MAP || {})[u.id] || {};
      const nAll = (p[1] || []).length + (p[2] || []).length + (p[3] || []).length;
      if (nAll >= 75) { meadow++; if ((SB_TRAIL_SETS(u.id) || {}).sets === 5) five++; }
    }
    out.meadowRich = meadow; out.meadowFive = five;

    /* the card draws one chip per set, each tappable and carrying its index */
    app.trailUnit(uid); await new Promise(res => setTimeout(res, 500));
    const chips = [...document.querySelectorAll('[data-act=trailPractice][data-arg]')];
    out.chips = chips.length;
    out.chipArgs = chips.map(x => x.getAttribute('data-arg')).join(',');
    out.chipsMatchSets = chips.length === S.sets;
    out.labelsS1 = /<button[^>]*data-arg="0"[^>]*>S1/.test(document.body.innerHTML.replace(/\n/g, ''));

    /* A SET IS A FIXED SLICE: opening set 3 twice serves the same words */
    app.trailPractice('2'); await new Promise(res => setTimeout(res, 400));
    const first3 = (state.sessionWords || []).map(x => x.w).join('|');
    out.setSize = (state.sessionWords || []).length;
    app.trailPractice('2'); await new Promise(res => setTimeout(res, 400));
    const again3 = (state.sessionWords || []).map(x => x.w).join('|');
    out.sameSetSameWords = !!first3 && first3 === again3;
    /* and a DIFFERENT set is different words */
    app.trailPractice('0'); await new Promise(res => setTimeout(res, 400));
    const set1 = (state.sessionWords || []).map(x => x.w).join('|');
    out.setsAreDistinct = !!set1 && set1 !== first3;

    /* playing a set records against THAT set */
    state.trailReturn = uid; state.trailCourse = 'honey';
    app.trailPractice('1'); await new Promise(res => setTimeout(res, 400));
    SB_TRAIL_PRACTICED(uid, 12, 15);
    const rec = (c.trail.st || {})[uid + ':1'] || {};
    out.recordedOnSet2 = (rec.ss || {})[1] === 80;
    out.otherSetsUntouched = !((rec.ss || {})[0] > 0) && !((rec.ss || {})[2] > 0);
    const S2 = SB_TRAIL_SETS(uid);
    out.playedOne = S2.played === 1 && S2.cleared === 1;

    /* ONE set at the gate opens the next stop — the rest are stars, not a toll */
    const after = SB_TRAIL_NEXT();
    out.oneSetUnlocks = after && after.arg !== uid;
    out.notAllSetsDone = S2.cleared < S2.sets;

    /* the card marks it: one cleared chip, the others still owed */
    app.trailUnit(uid); await new Promise(res => setTimeout(res, 400));
    const h = document.body.innerHTML;
    out.showsCleared = /1\/\d cleared/.test(h);
    out.pointsAtNextSet = /Practise set \d of \d/.test(h);
    return out;
  });
  await pg.close(); await b.close();

  ok(r.poolLoaded, 'the lazy word pool is loaded before the card counts its sets');
  ok(r.sets >= 1 && r.neverOverFive, 'the first stop reports ' + r.sets + ' set(s), never more than five');
  ok(r.countMatchesPool, 'the count is the WHOLE STOP cut by the act round size, not one lap band');
  ok(r.fiveInTheMeadow, 'the first Meadow stop offers its five sets, not four');
  ok(r.meadowRich > 0 && r.meadowFive === r.meadowRich,
    'and every Meadow stop holding five rounds of words offers five (' + r.meadowFive + '/' + r.meadowRich + ')');
  ok(r.chipsMatchSets, 'the card draws one chip per set (' + r.chips + ' chips / ' + r.sets + ' sets)');
  ok(r.chipArgs === [...Array(r.sets).keys()].join(','), 'each chip carries its own set index (' + r.chipArgs + ')');
  ok(r.labelsS1, 'and they are labelled S1, S2, S3…');
  ok(r.setSize > 1, 'a set serves a real round (' + r.setSize + ' words)');
  ok(r.sameSetSameWords, 'THE SAME SET IS THE SAME WORDS every time it is opened');
  ok(r.setsAreDistinct, 'and a different set is different words');
  ok(r.recordedOnSet2, 'a played set records its score against THAT set');
  ok(r.otherSetsUntouched, 'and leaves the other sets untouched');
  ok(r.playedOne, 'the stop reports 1 set played and cleared');
  ok(r.oneSetUnlocks, 'ONE set at the gate opens the next stop');
  ok(r.notAllSetsDone, 'even though the other sets are still owed — they are stars, not a toll');
  ok(r.showsCleared, 'the card marks how many sets are cleared');
  ok(r.pointsAtNextSet, 'and names the next set still owed');
  ok(!errs.length, 'no page errors' + (errs.length ? ' — ' + errs[0] : ''));
  console.log(fails ? '\n' + fails + ' FAILED' : '\nall good');
  process.exit(fails ? 1 : 0);
})();
