// The Learn card view keeps a REAL Next button. Complete / Mark-for-revision record
// the word; Next just moves on — browsing the deck must never require a verdict.
// Regression guard: the selfMark footer twice shipped with only "pick one to continue".
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
    state.children = [{ name: 'T', avatar: 'bee', coins: 0, pow: {}, age: 10, lists: { default: { xp: 10 } }, activeList: 'default',
      missed: [], unlockedThemes: ['spellbound'], unlockedConcepts: {}, unlockedLists: {}, questPath: 'journey',
      trail: { lap: 1, done: {}, chk: {}, seen: {}, elap: 1, edone: {}, echk: {} } }];
    state.activeIdx = 0; state.screen = 'app'; state.devUnlock = true;

    // ---- Practice → Learn: Next exists and advances WITHOUT recording anything ----
    state.nav = 'coach'; state.luTab = 'revise'; state.coachCardView = false; state.reviseIdx = 0; render(); await W(200);
    const nextBtn = document.querySelector('[data-act="reviseNav"][data-arg="next"]');
    out.hasNext = !!nextBtn && /Next/.test(nextBtn.textContent);
    out.hasBack = !!document.querySelector('[data-act="reviseNav"][data-arg="prev"]');
    out.hasMarks = !!document.querySelector('[data-act="flashMark"]');
    const mastered0 = JSON.stringify(state.luMastered), missed0 = (active().missed || []).length;
    if (nextBtn) nextBtn.click(); await W(150);
    out.advances = (state.reviseIdx || 0) === 1;
    out.noWrites = JSON.stringify(state.luMastered) === mastered0 && (active().missed || []).length === missed0;
    document.querySelector('[data-act="reviseNav"][data-arg="prev"]').click(); await W(150);
    out.backs = (state.reviseIdx || 0) === 0;

    // ---- last card: Next becomes a disabled "All done" instead of vanishing ----
    const N = (state.sessionWords && state.sessionWords.length) || (typeof LEVEL_WORDS !== 'undefined' ? LEVEL_WORDS.length : 1);
    state.reviseIdx = N - 1; render(); await W(150);
    const last = document.querySelector('[data-act="reviseNav"][data-arg="next"]');
    out.lastDone = !!last && /All done/.test(last.textContent) && /pointer-events:none/.test(last.getAttribute('style') || '');
    state.reviseIdx = 0;

    // ---- the Atlas "Meet the words" screen: exactly ONE Back and ONE Next ----
    await new Promise(res => SB_LAZY.need('atlas', res)); await W(300);
    const R = Math.random; Math.random = () => 0.9;
    app.trailAct('honey|meadow'); await W(250);
    const firstUnit = (document.querySelector('[data-act="trailUnit"]') || {}).getAttribute
      ? document.querySelector('[data-act="trailUnit"]').getAttribute('data-arg') : null;
    if (firstUnit) { app.trailUnit(firstUnit); await W(250); app.trailWords(); await W(400); }
    out.atlasView = state.trailView === 'words';
    out.atlasNext = document.querySelectorAll('[data-act="trailWordNav"][data-arg="next"]').length === 1;
    out.atlasBack = document.querySelectorAll('[data-act="trailWordNav"][data-arg="prev"]').length === 1;
    const i0 = state.trailWordIdx || 0;
    const an = document.querySelector('[data-act="trailWordNav"][data-arg="next"]');
    if (an) an.click(); await W(150);
    out.atlasAdvances = (state.trailWordIdx || 0) === Math.min(i0 + 1, (state.trailWordsN || 1) - 1);
    Math.random = R;
    return out;
  });
  ok(r.hasNext, 'Practice → Learn shows a Next button');
  ok(r.hasBack && r.hasMarks, 'Back and the Complete/⚑ marks are still there beside it');
  ok(r.advances, 'Next advances the card');
  ok(r.noWrites, 'and records NOTHING — no mastery, no revise entry');
  ok(r.backs, 'Back returns to the previous card');
  ok(r.lastDone, 'the last card wears a disabled "All done ✓"');
  ok(r.atlasView, 'the Atlas Meet-the-words screen opens');
  ok(r.atlasNext && r.atlasBack, 'it has exactly ONE Next and ONE Back (no doubled row)');
  ok(r.atlasAdvances, 'and its Next walks the deck');
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
  await b.close();
  process.exit(fails ? 1 : 0);
})();
