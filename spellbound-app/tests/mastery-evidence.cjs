/* MASTERY COMES FROM EVIDENCE, AND IT DECAYS (FIX-BEE D5, family standard §6).

   markMastered used to set luMastered[word]=true on the first right answer, from anywhere, for
   ever — and a "Complete" button on a card did the same. Now a word is mastered only when it
   is spelled right on two separate days, a day or more apart (Leitner boxes on the child,
   c.mast); a mastered word comes due again; a miss drops it; and nothing the child can tap
   to say "I know it" writes anything that counts.

   This test drives the real practice card (type → Check) and moves the clock with Date.now:
     · one right answer does not master; a second one the same day does not either
     · right on day 1 and again after the gap does
     · time travel past the due date makes it due again (and the Revisions page offers the check)
     · a miss drops it, and the report calls it "slipped"
     · the self-marks — card "Got it", Revisions "Complete", the card-deck swipe, the Ultra
       scan's "Know it", completeWord — change nothing that counts
     · two children never share a record; the household's old luMastered is carried over as
       "not yet re-checked"; a vocabulary check writes nothing to spelling
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/mastery-evidence.cjs              */
const { chromium } = require('playwright');
const path = require('path');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const kid = (name, extra) => Object.assign({ name, age: 9, ageBand: '8-10', avatar: 'bizzy', theme: 'spellbound', coins: 50, xp: 0,
  lists: { default: { xp: 3 } }, activeList: 'default', missed: [], unlockedThemes: ['spellbound'] }, extra || {});
const seed = { theme: 'spellbound', mode: 'light', premium: false, activeIdx: 0, pin: '1234', lu: { 'older': true, 'legacy': true },
  children: [kid('Ahana'), kid('Ravi')] };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 1000, height: 900 } });
  await ctx.addInitScript(s => { try { if (!localStorage.getItem('sb_t_seeded')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_t_seeded', '1'); } } catch (e) {} }, seed);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + path.resolve(__dirname, '..') + '/index.html'); await pg.waitForTimeout(2800);

  const r = await pg.evaluate(async () => {
    const W = ms => new Promise(res => setTimeout(res, ms)); const o = {};
    const RN = Date.now.bind(Date); window.__off = 0; Date.now = () => RN() + window.__off; const DAY = 864e5;
    const W1 = { w: 'harbour', d: 'a sheltered place where ships can stay', s: 'The boats rested in the ________.' };
    const W2 = { w: 'knight', d: 'a soldier on horseback', s: 'The ________ bowed.' };
    const spell = async (typed, word) => { state.sessionWords = [word || W1, W2]; app.startTrain(); await W(120);
      state.typed = typed; app.check(); await W(80); };
    const rec = k => { const r = (active().mast || {})[k]; return r ? JSON.parse(JSON.stringify(r)) : null; };
    state.activeIdx = 0; state.screen = 'app'; render();

    /* ---- the old household luMastered was carried over, flagged, on each child ---- */
    o.legacy = !!(rec('legacy') && rec('legacy').leg && rec('legacy').b >= 2) && !!(state.children[1].mast.legacy && state.children[1].mast.legacy.leg);
    o.legacyStillShows = !!state.luMastered.legacy;
    o.legacyNotRetained = SB_REPORT_CARD(active()).mastery.retained === 0 && SB_REPORT_CARD(active()).mastery.carried === 2;

    /* ---- one right answer does not master ---- */
    await spell('harbour');
    o.oneRight = rec('harbour'); o.oneRightLu = !!state.luMastered.harbour;
    await spell('harbour');
    o.twoSameDay = rec('harbour'); o.twoSameDayLu = !!state.luMastered.harbour;

    /* ---- right again after the gap does ---- */
    window.__off = 1 * DAY + 3600e3;
    await spell('harbour');
    o.dayTwo = rec('harbour'); o.dayTwoLu = !!state.luMastered.harbour;
    o.dueNow = mastIsDue(rec('harbour'));
    o.retainedAfter = SB_REPORT_CARD(active()).mastery.retained;

    /* ---- time travel past the due date: it comes due again, and Revisions offers the check ---- */
    window.__off = 5 * DAY;
    o.dueLater = mastIsDue(rec('harbour')) && mastDueWords(active()).some(w => w.w === 'harbour');
    o.stillMasteredWhileDue = !!state.luMastered.harbour;
    app.setNav('revisions'); await W(150);
    o.dueCard = !!document.querySelector('.sb-mastdue [data-act="mastRecheck"]');
    app.mastRecheck(); await W(150);
    o.recheckServes = state.nav === 'train' && (state.sessionWords || []).some(w => w.w === 'harbour');
    state.gi = (state.sessionWords || []).findIndex(w => w.w === 'harbour'); state.status = 'idle';
    state.typed = 'harbour'; app.check(); await W(80);
    o.recheckRight = rec('harbour');

    /* ---- a miss drops it ---- */
    window.__off = 6 * DAY;
    await spell('harbor');
    o.afterMiss = rec('harbour'); o.afterMissLu = !!state.luMastered.harbour;
    o.slipped = SB_REPORT_CARD(active()).mastery.slipped.map(x => x.w);

    /* ---- the self-marks change nothing that counts ---- */
    /* what COUNTS: the evidence record, mastery, each list's xp and stage, the Bee Band's evidence,
       and the session score. (Where the drill is up to — gi — is navigation, not a count.) */
    const snap = () => JSON.stringify({ mast: active().mast, lu: state.luMastered,
      lists: Object.fromEntries(Object.entries(active().lists || {}).map(([k, v]) => [k, { xp: v.xp || 0, stage: v.stage || 0 }])),
      attempts: active().attempts, band: active().band, xp: active().xp, right: state.sessionRight, done: state.sessionDone });
    state.sessionWords = [W2, W1]; state.nav = 'coach'; state.luTab = 'revise'; state.reviseIdx = 0; render(); await W(100);
    const s0 = snap();
    app.flashMark('done|reviseNav|knight');
    o.flashDone = snap() === s0;
    state.gi = 0; state.status = 'idle'; const s1 = snap();
    app.completeWord();
    o.completeWord = snap() === s1;
    active().missed = [{ w: 'knight', d: '', n: 1 }]; const s2 = snap();
    app.reviseComplete('knight');
    o.reviseComplete = snap() === s2;
    state.sessionWords = [W2, W1]; state.cardIdx = 0; const s3 = snap();
    app.cardAdvance('next'); app.cardAdvance('revise');
    o.cardSwipe = snap() === s3;
    const s4 = snap();
    try { state.adv = { mode: 'scan', words: [W2, W1], all: [W2, W1], bi: 0, i: 0, know: [], gaps: [], drillIdx: 0, right: 0 }; ADV.scanMark(true); } catch (e) { o.scanErr = String(e); }
    o.ultraScan = JSON.parse(snap()).mast && JSON.stringify(JSON.parse(snap()).mast) === JSON.stringify(JSON.parse(s4).mast) && JSON.stringify(state.luMastered) === JSON.stringify(JSON.parse(s4).lu);
    state.adv = null;
    o.noSelfMarkMastery = !rec('knight') || (rec('knight').b === 0);

    /* ---- recognition never moves a box up ---- */
    window.__off = 9 * DAY; markMastered('mosaic', 'mc'); window.__off = 11 * DAY; markMastered('mosaic', 'mc');
    o.mcNeverMasters = rec('mosaic') && rec('mosaic').b === 0 && !state.luMastered.mosaic;

    /* ---- two children never share a record ---- */
    const aHarbour = rec('harbour');
    app.selectChild(1); await W(80);
    o.siblingClean = !rec('harbour') && !state.luMastered.harbour && !state.luMastered.mosaic;
    app.selectChild(0); await W(80);
    o.backToFirst = JSON.stringify(rec('harbour')) === JSON.stringify(aHarbour);

    /* ---- a vocabulary check writes nothing to spelling (the separation CLAUDE.md requires) ---- */
    const v0 = JSON.stringify({ mast: active().mast, lists: active().lists, lu: state.luMastered, missed: active().missed, att: active().attempts });
    const qs = vocBuildCheck([{ w: 'harbour', d: 'a sheltered place for ships', y: 3 }, { w: 'meadow', d: 'a field of grass', y: 2 }, { w: 'thunder', d: 'the loud sound after lightning', y: 2 }]);
    state.vocCheck = { deck: 'mix', mode: 'check', qs, i: 0, picked: null, ok: null, right: 0, missed: [], done: false };
    for (let i = 0; i < qs.length; i++) { app.vocPick(String((i % 2) ? 0 : 1)); app.vocNext(); }
    o.vocabSeparate = JSON.stringify({ mast: active().mast, lists: active().lists, lu: state.luMastered, missed: active().missed, att: active().attempts }) === v0;
    state.vocCheck = null;

    /* ---- it is saved with the child ---- */
    save(); const disk = JSON.parse(localStorage.getItem('sb_saas_v2'));
    o.persisted = !!(disk.children[0].mast && disk.children[0].mast.harbour);
    Date.now = RN; return o;
  });

  ok(r.legacy, 'the old household luMastered is carried onto each child as box 2, flagged "not yet re-checked"');
  ok(r.legacyStillShows, 'so nothing the child already saw as mastered disappears on the update');
  ok(r.legacyNotRetained, 'but the report does not count carried-over words as retained (2 carried, 0 retained)');
  ok(r.oneRight && r.oneRight.b === 1 && !r.oneRightLu, 'one right answer does not master (box 1, not in luMastered)');
  ok(r.twoSameDay && r.twoSameDay.b === 1 && !r.twoSameDayLu, 'a second right answer the SAME day does not either — practice, not evidence');
  ok(r.dayTwo && r.dayTwo.b === 2 && r.dayTwoLu, 'right again on a later day masters it (box 2, in luMastered)');
  ok(r.dayTwo && !r.dueNow && r.retainedAfter === 1, 'and it is not due straight away; the report now counts 1 retained');
  ok(r.dueLater && r.stillMasteredWhileDue, 'past the due date it comes due again (still mastered while due)');
  ok(r.dueCard, 'the Revisions page offers "ready for a check"');
  ok(r.recheckServes, 'and the check serves that word in the practice card');
  ok(r.recheckRight && r.recheckRight.b === 3, 'a right re-check moves it further out (box 3)');
  ok(r.afterMiss && r.afterMiss.b === 1 && !r.afterMissLu && r.afterMiss.lp === 1, 'a miss drops it out of mastery (box 1, one lapse)');
  ok(r.slipped && r.slipped.indexOf('harbour') >= 0, 'and the report lists it as slipped since mastered');
  ok(r.flashDone, 'the card "Got it" self-mark changes nothing that counts');
  ok(r.completeWord, 'completeWord changes nothing that counts');
  ok(r.reviseComplete, 'Revisions "Complete" changes nothing that counts');
  ok(r.cardSwipe, 'the card-deck swipes change nothing that counts');
  ok(r.ultraScan && !r.scanErr, 'the Ultra scan\'s "Know it" masters nothing' + (r.scanErr ? ' (' + r.scanErr + ')' : ''));
  ok(r.noSelfMarkMastery, 'no self-mark ever moved a word up a box');
  ok(r.mcNeverMasters, 'picking the right spelling from options (recognition) never moves a box up, even days apart');
  ok(r.siblingClean && r.backToFirst, 'a second child never sees the first child\'s mastery, and switching back restores it');
  ok(r.vocabSeparate, 'a vocabulary check leaves mast, lists, luMastered, missed and attempts byte-identical');
  ok(r.persisted, 'the evidence record is saved on the child');
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
