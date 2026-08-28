// The in-app book reader: a spine opens living cards instead of shipping the child
// off to the books site. Word taps open the full word card with audio, Try-it pops a
// meaning quiz, notes persist per chapter, the print edition stays one pill away,
// and advanced volumes honour the Advanced Pack gate.
const { chromium } = require('playwright');
const SRC = process.env.SRC || __dirname + '/..';
const fs = require('fs');
let fails = 0;
const ok = (b, msg) => { console.log((b ? '  OK   ' : '  FAIL ') + msg); if (!b) fails++; };
(async () => {
  // the books' OWN art leads the pages: chapter opener plates, per-poem plates,
  // the volume divider — with the world banner as the never-a-hole fallback
  const rsrc = fs.readFileSync(SRC + '/reader.js', 'utf8');
  ok(/-ch' \+ pad2\(i \+ 1\) \+ '-opener\.jpg'/.test(rsrc), 'chapter spreads ask for their own painted opener plate');
  ok(/'pp-' \+ String/.test(rsrc), 'poem pages ask for their own bespoke plate (pp-<slug>)');
  ok(/-divider\.jpg'/.test(rsrc), 'the notes page wears the volume divider');
  ok(/this\.dataset\.f=1;this\.src=/.test(rsrc), 'a missing plate falls back to the world banner, never a hole');
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const pg = await b.newPage({ viewport: { width: 1100, height: 900 } });
  const errs = []; pg.on('pageerror', e => errs.push(String(e.message)));
  await pg.goto('file://' + SRC + '/index.html'); await pg.waitForTimeout(2600);
  const r = await pg.evaluate(async () => {
    const out = {}; const W = ms => new Promise(res => setTimeout(res, ms));
    state.children = [{ name: 'R', avatar: 'bee', coins: 0, pow: {}, age: 11, lists: { default: { xp: 10 } }, activeList: 'default',
      missed: [], unlockedThemes: ['spellbound'], unlockedConcepts: {}, unlockedLists: {}, questPath: 'journey',
      trail: { lap: 1, done: {}, chk: {}, seen: {}, elap: 1, edone: {}, echk: {} } }];
    state.activeIdx = 0; state.screen = 'app'; state.devUnlock = true;
    const c = state.children[0];

    // ---- a spine opens IN the app ----
    app.openBook('book-01');
    await new Promise(res => { const t0 = Date.now();
      (function w2() { if ((state.nav === 'reader' && window.SB_READER) || Date.now() - t0 > 20000) res(); else setTimeout(w2, 250); })(); });
    await W(400);
    out.inApp = state.nav === 'reader' && state.readerBook === 'book-01';
    out.home = /Lift-Off!/.test(document.body.textContent) && document.querySelectorAll('[data-act="readerCh"]').length > 3;
    out.printPill = !!document.querySelector('[data-act="readerPrint"]');
    out.cover = !!document.querySelector('img[src*="b01-cover"]');

    // ---- a chapter is PAGED spreads: one at a time, art-led, never a wall ----
    app.readerCh(0); await W(300);
    out.spread = /Chapter 1 of/.test(document.body.textContent) && /page 1 of \d+/.test(document.body.textContent);
    out.banner = !!document.querySelector('img[src*="-opener"], img[src*="app-art/w-"]');
    out.chrome = !!document.querySelector('.coach-card .coach-glimmer') && document.querySelectorAll('.coach-card [data-act="readerPg"]').length >= 2;
    out.walker = !document.querySelector('.rd-walk');   // the walking mascot was cut: too distracting
    out.paced = !document.querySelector('[data-act="readerWord"]');   // words wait on their own page
    const pg0 = state.readerPg || 0;
    app.readerPg('next'); await W(200);
    out.turns = (state.readerPg || 0) === pg0 + 1;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })); await W(150);
    out.keysTurn = (state.readerPg || 0) === pg0;
    let guard = 0;
    while (!document.querySelector('[data-act="readerWord"]') && guard++ < 14) { app.readerPg('next'); await W(120); }
    const chips = document.querySelectorAll('[data-act="readerWord"]');
    out.chips = chips.length >= 4 && chips.length <= 10;   // capped per page
    app.readerWord(chips[0].getAttribute('data-arg')); await W(250);
    out.wordCard = !!state.wordCard && !!document.querySelector('[data-act="wordCardClose"]');
    app.wordCardClose ? app.wordCardClose() : (state.wordCard = null, render()); await W(150);

    // ---- Try it: four meaning questions from THIS chapter, a coin per correct ----
    app.readerTry(); await W(200);
    out.tryUp = !!state.readerQuiz && document.querySelectorAll('[data-act="readerAns"]').length === 4;
    const coins0 = c.coins; const mastered0 = JSON.stringify(state.luMastered);
    for (let g = 0; g < 4 && state.readerQuiz && !state.readerQuiz.over; g++) {
      const z = state.readerQuiz; const q = z.qs[z.i];
      app.readerAns(String(q.opts.indexOf(q.ok))); await W(1100);
    }
    out.tryPays = c.coins === coins0 + 4 && state.readerQuiz && state.readerQuiz.over;
    out.noSpellWrites = JSON.stringify(state.luMastered) === mastered0;
    app.readerTryClose(); await W(120);

    // ---- notes persist, and surface on the TOC ----
    app.readerNote('remember: say, spell, say'); await W(120);
    out.noteSaved = (c.readerNotes || {})['book-01:0'] === 'remember: say, spell, say';
    app.readerDone(); await W(250);
    out.advanced2 = state.readerCh === 1 && (c.readerRead['book-01'] || {})[0] === 1;
    app.readerCh(''); await W(250);
    out.tocNote = document.body.innerHTML.indexOf('📝') >= 0 && /✓/.test(document.body.textContent);

    // ---- the poems companion: one whole piece per page, with its hard words ----
    app.openBook('book-lines'); await W(600);
    app.readerCh(0); await W(300);
    app.readerPg('next'); await W(250);
    out.poems = /Shakespeare|Wordsworth|Dickinson|Frost|Henley|Kipling/i.test(document.body.textContent) && !!document.querySelector('[data-act="readerSayHard"]');
    // ---- the quiz companion says honestly: paper book, print it / play trivia ----
    app.openBook('book-quiz'); await W(300);
    out.quizBook = /paper/.test(document.body.textContent) && !!document.querySelector('[data-act="readerPrint"]') && !!document.querySelector('[data-act="openGames"]');

    // ---- an advanced volume honours the pack gate ----
    state.devUnlock = false;
    app.openBook('book-12'); await W(300);
    out.advLocked = /Advanced Pack/.test(document.body.textContent) && document.querySelectorAll('[data-act="readerCh"]:not([disabled])').length === 0;
    state.devUnlock = true;
    app.openBook('book-12'); await W(300);
    app.readerCh(0); await W(250);
    out.advOpens = /Chapter 1 of/.test(document.body.textContent);

    // ---- back walks reader -> volume -> Library ----
    app.readerBack(); await W(150); out.backVol = state.readerCh == null && state.nav === 'reader';
    app.readerBack(); await W(150); out.backLib = state.nav === 'explore';
    return out;
  });
  ok(r.inApp, 'a spine opens the reader IN the app');
  ok(r.home, 'the volume home shows the title and a real table of chapters');
  ok(r.printPill, 'the print edition stays one pill away');
  ok(r.cover, 'the cover art comes from the books repo artwork');
  ok(r.spread, 'a chapter opens on its first SPREAD with a page count');
  ok(r.banner, 'every spread leads with painted art');
  ok(r.chrome, 'the spread wears the practice deck\'s coach-card chrome with edge rails');
  ok(r.walker, 'NO mascot walks the page (play-tested as too distracting)');
  ok(r.paced, 'the opener is paced — the words wait on their own page');
  ok(r.turns && r.keysTurn, 'Next and the arrow keys turn the pages');
  ok(r.chips, 'the words page holds 4-10 tappable word tiles, never a wall');
  ok(r.wordCard, 'tapping a word opens the full word card (with audio)');
  ok(r.tryUp, 'Try it pops four meaning questions from this chapter');
  ok(r.tryPays, 'right answers pay a coin each and the round completes');
  ok(r.noSpellWrites, 'reading and trying writes NO spelling progress');
  ok(r.noteSaved, 'notes save per child, per chapter');
  ok(r.advanced2, 'Done marks the chapter read and moves to the next');
  ok(r.tocNote, 'the TOC shows the note and the read tick');
  ok(r.poems, 'Lines Worth Keeping renders whole pieces with hard-word chips');
  ok(r.quizBook, 'The Long Quiz is honest: print it, or play trivia in the Arcade');
  ok(r.advLocked, 'an advanced volume is locked without the pack');
  ok(r.advOpens, 'and opens with it');
  ok(r.backVol && r.backLib, 'back retraces chapter → volume → Library');
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
  await b.close();
  process.exit(fails ? 1 : 0);
})();
