/* THE LIST BUILDER — nine facets, live counts, and a list at the end of it.

   The five-tap version asked five either/or questions and could not express
   "French words I keep getting wrong" or "eight-letter nouns from the finals
   lists". This one filters on nine fields at once, and every option carries the
   count it would leave — which is the whole reason to compute counts per facet
   rather than just filtering. A count that lies is worse than no count, so the
   central assertion here is that a chip's number equals what tapping it yields. */
const { chromium } = require('playwright');
const SRC = require('path').resolve(__dirname, '..');
let fails = 0;
const ok = (b, msg) => { console.log((b ? '  OK   ' : '  FAIL ') + msg); if (!b) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const out = {};
  for (const [w, h, tag] of [[1280, 900, 'desktop'], [390, 844, 'phone']]) {
    const pg = await b.newPage({ viewport: { width: w, height: h } });
    const errs = []; pg.on('pageerror', e => errs.push(String(e.message)));
    await pg.goto('file://' + SRC + '/index.html'); await pg.waitForTimeout(2600);
    const r = await pg.evaluate(async () => {
      state.children = [{ name: 'T', avatar: 'bee', coins: 0, pow: {}, age: 10, lists: { default: { xp: 10 } },
        activeList: 'default', missed: [], unlockedThemes: ['spellbound'], unlockedConcepts: {},
        unlockedLists: {}, questPath: 'journey',
        trail: { lap: 1, done: {}, chk: {}, seen: {}, elap: 1, edone: {}, echk: {} } }];
      state.activeIdx = 0; state.screen = 'app';
      app.openBuilder(); await new Promise(res => setTimeout(res, 1100));
      const o = {};
      o.sideways = document.documentElement.scrollWidth > window.innerWidth + 1;
      const rail = document.querySelector('.b2-wrap');
      /* SVG ONLY. An emoji renders as a different picture on every platform and this
         screen is dense enough to need one visual language. */
      o.emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u.test(rail ? rail.innerHTML : '');
      o.svgs = document.querySelectorAll('.b2-wrap svg').length;
      o.chips = document.querySelectorAll('[data-act=b2Tog]').length;
      const H = document.body.innerHTML;
      o.nineSections = ['Spelling level', 'How many words', 'Word length', 'Seen in a spelling bee',
        'Why it', 'Subject', 'Language of origin', 'Part of speech', 'Letters'].every(t => H.indexOf(t) >= 0);

      /* a chip's count must equal what choosing it actually yields */
      const chip = document.querySelector('[data-act=b2Tog][data-arg^="cls:"]');
      o.claimed = chip.textContent.trim().split(/\s+/).pop();
      chip.click(); await new Promise(res => setTimeout(res, 600));
      app.b2Tab('all'); await new Promise(res => setTimeout(res, 600));
      const allTab = [...document.querySelectorAll('[data-act=b2Tab]')].find(x => /Everything/.test(x.textContent));
      o.actual = allTab.textContent.trim().split(/\s+/).pop();
      o.pill = document.querySelectorAll('[data-act=b2Tog][style*="999px"]').length;

      /* text filters really filter */
      app.b2Clear(); await new Promise(res => setTimeout(res, 400));
      app.b2Size('all'); app.b2TxtStarts('ph'); await new Promise(res => setTimeout(res, 700));
      const ws = [...document.querySelectorAll('[data-act=openWordCard]')].map(x => x.textContent.trim());
      o.startsWorks = ws.length > 3 && ws.every(x => x.indexOf('ph') === 0);

      /* the two length sliders are ONE range and must never invert into a filter
         that can match nothing */
      app.b2Clear(); await new Promise(res => setTimeout(res, 300));
      app.b2WlMax(5); app.b2WlMin(12); await new Promise(res => setTimeout(res, 500));
      const B = state.b2; o.rangeSane = B.wlmin <= B.wlmax;

      /* and it still produces a saved, active list */
      app.b2Clear(); await new Promise(res => setTimeout(res, 300));
      app.b2Size(15); await new Promise(res => setTimeout(res, 400));
      app.bldNameOpen(); await new Promise(res => setTimeout(res, 300));
      app.bldName('Guard list'); app.bldCreate(); await new Promise(res => setTimeout(res, 800));
      const c = state.children[0], keys = Object.keys(c.builtLists || {});
      o.saved = keys.length === 1 && (c.builtLists[keys[0]].ws || []).length === 15;
      o.savedLabel = keys.length ? c.builtLists[keys[0]].label : null;
      o.becomesActive = c.activeList === keys[0];

      /* and it is reachable from Pick your words, not only the Library tile */
      app.coachSetupOpen(); await new Promise(res => setTimeout(res, 700));
      o.inPickYourWords = /Build your own list/.test(document.body.innerHTML);
      return o;
    });
    r.errs = errs; out[tag] = r; await pg.close();
  }
  await b.close();
  const d = out.desktop, m = out.phone;
  ok(d.nineSections, 'all nine filters are on the page');
  ok(d.chips > 20, 'the facets draw their options as chips (' + d.chips + ')');
  ok(!d.emoji && !m.emoji, 'not one emoji — the icons are the app’s own SVG set');
  ok(d.svgs >= 3, 'and the SVG icons are actually rendered (' + d.svgs + ')');
  ok(d.claimed === d.actual, 'A CHIP\'S COUNT IS HONEST — claimed ' + d.claimed + ', got ' + d.actual);
  ok(d.pill === 1, 'choosing one shows one removable pill');
  ok(d.startsWorks, '"starts with" really filters');
  ok(d.rangeSane, 'the length sliders cannot invert into an impossible range');
  ok(d.saved, 'the builder saves a list of exactly the chosen size');
  ok(d.savedLabel === 'Guard list', 'under the name the child typed');
  ok(d.becomesActive, 'and that list becomes the active one');
  ok(d.inPickYourWords && m.inPickYourWords, 'it is reachable from Pick your words');
  ok(!d.sideways && !m.sideways, 'no sideways scroll on desktop OR phone');
  ok(!d.errs.length && !m.errs.length, 'no page errors' + (d.errs[0] ? ' — ' + d.errs[0] : ''));
  console.log(fails ? '\n' + fails + ' FAILED' : '\nall good');
  process.exit(fails ? 1 : 0);
})();
