/* VIEW ALL CARDS — the whole set, read at once, from the top of Practice.

   Practice hands one card at a time. That is right for drilling and wrong for
   getting your bearings: a child part-way through a set had no way to see what
   the set held without walking every card of it. The owner asked for a button on
   top that opens all the cards in the set as toggled pop-up cards.

   Four things this pins, each of which is a way the screen could look finished
   and not be:
   1. IT IS THE SET, WHOLE. As many cards as the drill is serving, in that order.
   2. A CARD OPENS. Collapsed it is a headword; open it carries the meaning, the
      sentence, both speaker buttons and the chips — the real card, not a label.
   3. THE ICONS ARE REAL. iconSVG falls back to the GRID glyph for any name it
      does not carry, silently, so asking for 'chevronDown' (which lives in the
      other icon set) draws a little grid on every row and nothing complains.
   4. IT READS, IT DOES NOT SCORE. Opening a card must not mark a word mastered
      or missed — the drill owns that, and a reading surface that quietly moved
      progress would make the heatmap lie. */
const { chromium } = require('playwright');
const SRC = require('path').resolve(__dirname, '..');
let fails = 0;
const ok = (b, msg) => { console.log((b ? '  OK   ' : '  FAIL ') + msg); if (!b) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const out = {};
  for (const [w, h, tag] of [[1100, 900, 'desktop'], [390, 844, 'phone']]) {
    const pg = await b.newPage({ viewport: { width: w, height: h } });
    const errs = []; pg.on('pageerror', e => errs.push(String(e.message)));
    await pg.goto('file://' + SRC + '/index.html'); await pg.waitForTimeout(2600);
    const r = await pg.evaluate(async () => {
      state.children = [{ name: 'T', avatar: 'bee', coins: 0, pow: {}, age: 10, lists: { default: { xp: 10 } },
        activeList: 'default', missed: [], unlockedThemes: ['spellbound'], unlockedConcepts: {},
        unlockedLists: {}, questPath: 'journey',
        trail: { lap: 1, done: {}, chk: {}, seen: {}, elap: 1, edone: {}, echk: {} } }];
      state.activeIdx = 0; state.screen = 'app';
      await new Promise(res => SB_LAZY.need('atlas', res));
      await new Promise(res => setTimeout(res, 500));
      const o = {}, uid = SB_TRAIL_NEXT().arg;

      /* open a real set out of a real stop */
      app.trailUnit(uid); await new Promise(res => setTimeout(res, 900));
      app.trailPractice('0'); await new Promise(res => setTimeout(res, 700));
      o.words = (state.sessionWords || []).length;
      const H0 = document.body.innerHTML;
      o.button = /data-act="deckOpen"/.test(H0);
      o.buttonLabel = (() => { const el = document.querySelector('[data-act=deckOpen]');
        return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; })();

      app.deckOpen(); await new Promise(res => setTimeout(res, 500));
      o.rows = document.querySelectorAll('[data-act=deckTog]').length;
      o.wholeSet = o.rows === o.words;
      /* every headword in the drill is on a row, in the drill's own order */
      const rowWords = [...document.querySelectorAll('[data-act=deckTog]')]
        .map(x => x.textContent.replace(/\s+/g, ' ').trim().replace(/^\d+\s*/, ''));
      o.sameOrder = (state.sessionWords || []).every((x, i) => (rowWords[i] || '').indexOf(x.w) === 0);
      o.collapsed = !document.querySelector('[data-act=deckSay]');
      o.sideways = document.documentElement.scrollWidth > window.innerWidth + 1;

      /* a card opens into the real card */
      const before = JSON.stringify({ m: state.luMastered, s: state.children[0].missed });
      app.deckTog(1); await new Promise(res => setTimeout(res, 450));
      const card = document.querySelectorAll('[data-act=deckSay]').length;
      o.opensOne = card === 1;
      const H = document.body.innerHTML;
      o.hasSlow = document.querySelectorAll('[data-act=deckSaySlow]').length === 1;
      o.hasMeaning = /Sentence\./.test(H) || (state.sessionWords[1] && !state.sessionWords[1].s);
      o.hasGo = document.querySelectorAll('[data-act=deckGo]').length === 1;
      /* several may stand open, so two words can be read against each other */
      app.deckTog(2); await new Promise(res => setTimeout(res, 400));
      o.multiOpen = document.querySelectorAll('[data-act=deckSay]').length === 2;
      app.deckAll(); await new Promise(res => setTimeout(res, 600));
      o.openAll = document.querySelectorAll('[data-act=deckSay]').length === o.words;
      app.deckAll(); await new Promise(res => setTimeout(res, 500));
      o.closeAll = document.querySelectorAll('[data-act=deckSay]').length === 0;

      /* IT READS, IT DOES NOT SCORE */
      o.noScoring = JSON.stringify({ m: state.luMastered, s: state.children[0].missed }) === before;

      /* SVG only, and no icon fell back to the grid glyph. iconSVG's fallback is
         M.grid, so a name it does not carry draws a grid and says nothing —
         count the grids and there must be exactly the one on the button. */
      app.deckTog(0); await new Promise(res => setTimeout(res, 450));
      const sheet = document.querySelector('[data-act=deckClose]');
      const inner = sheet ? sheet.innerHTML : '';
      o.emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u.test(inner);
      o.svgs = sheet ? sheet.querySelectorAll('svg').length : 0;
      const gridBody = (iconSVG('grid', 99).match(/focusable="false"[^>]*>([\s\S]*)<\/svg>/) || [, ''])[1];
      o.gridKnown = gridBody.length > 10;
      /* only the "View all cards" button legitimately wears a grid, and it is
         outside this sheet — so inside the sheet the count must be zero */
      o.strayGrids = gridBody ? (inner.split(gridBody).length - 1) : -1;

      /* and it hands the child back to the drill at that word */
      app.deckGo(3); await new Promise(res => setTimeout(res, 500));
      o.closesOnGo = !state.deckOpen && state.cardIdx === 3;
      return o;
    });
    r.errs = errs; out[tag] = r; await pg.close();
  }
  await b.close();
  const d = out.desktop, m = out.phone;
  ok(d.button && m.button, 'Practice carries a View all cards button on top');
  ok(/^View all \d+ cards$/.test(d.buttonLabel), 'and it names the count (' + d.buttonLabel + ')');
  ok(d.words > 1, 'the stop served a real set (' + d.words + ' words)');
  ok(d.wholeSet, 'the deck holds one row per card in the set (' + d.rows + '/' + d.words + ')');
  ok(d.sameOrder, 'in the drill’s own order');
  ok(d.collapsed, 'the rows start collapsed — it opens as a list, not a wall');
  ok(d.opensOne, 'tapping a row opens THAT card');
  ok(d.hasSlow, 'an open card carries both the speaker and the slow speaker');
  ok(d.hasMeaning, 'and the meaning and sentence, not just the headword');
  ok(d.hasGo, 'with a way back into the drill at that word');
  ok(d.multiOpen, 'two cards may stand open at once, to be read against each other');
  ok(d.openAll && d.closeAll, 'Open all / Close all does both');
  ok(d.noScoring, 'READING A CARD SCORES NOTHING — no mastered, no missed');
  ok(d.closesOnGo, 'Go to this card closes the deck at that card');
  ok(!d.emoji && !m.emoji, 'not one emoji in the sheet');
  ok(d.svgs >= 4, 'the icons are the app’s own SVGs (' + d.svgs + ')');
  ok(d.gridKnown, 'the grid glyph is identifiable, so the next check means something');
  ok(d.strayGrids === 0, 'NO ICON FELL BACK TO THE GRID GLYPH (' + d.strayGrids + ' stray)');
  ok(!d.sideways && !m.sideways, 'no sideways scroll on desktop OR phone');
  ok(!d.errs.length && !m.errs.length, 'no page errors' + (d.errs[0] ? ' — ' + d.errs[0] : ''));
  console.log(fails ? '\n' + fails + ' FAILED' : '\nall good');
  process.exit(fails ? 1 : 0);
})();
