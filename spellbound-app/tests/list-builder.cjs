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
      o.nineSections = ['How hard to spell', 'How likely at a bee', 'How many words', 'Word length',
        'Seen in a spelling bee', 'Why it', 'Subject', 'Language of origin', 'Part of speech', 'Letters',
        'Draw from', 'Syllables', 'First letter', 'Must come with', 'How it sounds'].every(t => H.indexOf(t) >= 0);
      /* THE BAND FACET MUST NOT BE THE OLD RARITY LADDER WEARING A NEW NAME.
         It filtered on `y` and was labelled Egg…Legend, so it promised a spelling
         level and delivered a frequency band. Neither the names nor the field may
         come back. */
      o.noRankNames = !/Hatchling|Forager|Guardian/.test(rail ? rail.innerHTML : '');
      o.noLvFacet = !document.querySelector('[data-act=b2Tog][data-arg^="lv:"]');

      /* THE RAIL MUST BE REACHABLE. It shipped clipped: the stylesheet gives it
         overflow-y:auto under a max-height, but the element also carried an inline
         overflow:hidden, which outranks any rule in the sheet — so the max-height
         became a crop with no scrollbar and 2,798px of filters had no way to be
         reached or even seen. Two independent guards, because either alone can be
         satisfied while the panel is still unusable: it must SCROLL, and collapsed
         it must be about one screen rather than five. */
      const railEl = document.querySelector('.b2-wrap>div:first-child');
      const rcs = getComputedStyle(railEl);
      o.railOverflow = rcs.overflowY;
      o.railInlineOverflow = /(^|;)\s*overflow\s*:/.test(railEl.getAttribute('style') || '');
      o.railScrolls = rcs.overflowY === 'auto' || rcs.overflowY === 'scroll';
      o.railH = railEl.scrollHeight;
      o.railFitsish = railEl.scrollHeight < 1400;
      /* every group's header is reachable by scrolling, not just present in the DOM */
      railEl.scrollTop = railEl.scrollHeight;
      await new Promise(res => setTimeout(res, 120));
      const heads = [...railEl.querySelectorAll('h3')];
      const last = heads[heads.length - 1].getBoundingClientRect();
      const rb = railEl.getBoundingClientRect();
      o.lastHeadVisible = last.top >= rb.top - 2 && last.bottom <= rb.bottom + 2;
      railEl.scrollTop = 0;
      /* a group with something chosen opens itself — a filter you cannot see is how
         you end up wondering why the count is what it is */
      app.b2Clear(); await new Promise(res => setTimeout(res, 400));
      o.flClosedFirst = !document.querySelector('[data-act=b2Tog][data-arg^="fl:"]');
      app.b2Tog('fl:16'); await new Promise(res => setTimeout(res, 600));
      o.flOpensWhenChosen = !!document.querySelector('[data-act=b2Tog][data-arg="fl:16"]');
      /* and the header toggles it by hand */
      app.b2Sec('syl'); await new Promise(res => setTimeout(res, 500));
      o.sylToggles = !!document.querySelector('[data-act=b2Tog][data-arg^="syl:"]');
      app.b2Sec('syl'); await new Promise(res => setTimeout(res, 500));
      o.sylTogglesBack = !document.querySelector('[data-act=b2Tog][data-arg^="syl:"]');
      app.b2Clear(); await new Promise(res => setTimeout(res, 500));

      /* a chip's count must equal what choosing it actually yields. Its group is
         closed by default now, so open it first — the chips are rendered only when
         their group is open, which is the whole point of the collapse. */
      app.b2Sec('cls'); app.b2Sec('syl'); app.b2Sec('fl'); app.b2Sec('pos');
      await new Promise(res => setTimeout(res, 700));
      /* chips exist only inside an OPEN group, so this is counted with several open.
         o.chips above is the collapsed default and is a different measurement. */
      o.chipsExpanded = document.querySelectorAll('[data-act=b2Tog]').length;
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

      /* each new facet must really filter, not merely draw a chip */
      app.b2Clear(); app.b2Size('all'); app.b2Tog('fl:16');       // q
      await new Promise(res => setTimeout(res, 700));
      const qs = [...document.querySelectorAll('[data-act=openWordCard]')].map(x => x.textContent.trim());
      o.firstLetter = qs.length > 3 && qs.every(x => x[0] === 'q');
      app.b2Clear(); app.b2Size('all'); app.b2TxtEnds('tion');
      await new Promise(res => setTimeout(res, 700));
      const es = [...document.querySelectorAll('[data-act=openWordCard]')].map(x => x.textContent.trim());
      o.endsWith = es.length > 3 && es.every(x => x.slice(-4) === 'tion');
      /* SB_HOM is an array of GROUPS, not a word-keyed map; indexing it by a word
         set the homophone flag for nobody and the chip read 20 instead of 2,000 */
      await new Promise(res => { try { SB_LAZY.need('sounds', res); } catch (e) { res(); } });
      await new Promise(res => setTimeout(res, 900));
      app.b2Clear(); app.b2Size('all'); app.b2Tog('flag:16');
      await new Promise(res => setTimeout(res, 900));
      const hs = [...document.querySelectorAll('[data-act=openWordCard]')].map(x => x.textContent.trim());
      o.homCount = hs.length;
      o.homHonest = hs.length > 500 && hs.slice(0, 40).every(x => (homPartners(x) || []).length > 0);
      /* the "must come with" chips AND together — each is a promise about the card */
      app.b2Clear(); app.b2Size('all'); app.b2Tog('flag:2');
      await new Promise(res => setTimeout(res, 800));
      const only = document.querySelectorAll('[data-act=openWordCard]').length;
      app.b2Tog('flag:8'); await new Promise(res => setTimeout(res, 800));
      o.flagsAnd = document.querySelectorAll('[data-act=openWordCard]').length <= only;
      /* Draw-from is ONE choice: my missed words and my mastered words are
         contradictory, so the second tap must replace the first, not AND to zero */
      state.children[0].missed = [{ w: 'phoenix' }, { w: 'rhythm' }];
      state.luMastered = { phone: 1 };
      app.b2Clear(); app.b2Size('all'); app.b2Pool('missed');
      await new Promise(res => setTimeout(res, 800));
      o.mine = [...document.querySelectorAll('[data-act=openWordCard]')].map(x => x.textContent.trim()).sort().join(',');
      app.b2Pool('mastered'); await new Promise(res => setTimeout(res, 800));
      o.mastered = [...document.querySelectorAll('[data-act=openWordCard]')].map(x => x.textContent.trim()).join(',');

      /* THE SPELLING BANDS REALLY BAND. Each is a contiguous slice of the key it
         claims, so every word served under a band must actually fall inside that
         band's edges — measured from the app's own spellDiff / bp, not re-derived. */
      const idx = () => b2Idx();
      app.b2Clear(); app.b2Size('all'); app.b2Tog('diff:0');
      await new Promise(res => setTimeout(res, 900));
      const gentle = [...document.querySelectorAll('[data-act=openWordCard]')].map(x => x.textContent.trim());
      o.diffN = gentle.length;
      o.diffHonest = gentle.length > 100 && gentle.every(w => {
        const r = idx().REC[idx().W.indexOf(w)]; return r && spellDiff(r) < 32.5; });
      app.b2Clear(); app.b2Size('all'); app.b2Tog('odds:4');
      await new Promise(res => setTimeout(res, 900));
      const staple = [...document.querySelectorAll('[data-act=openWordCard]')].map(x => x.textContent.trim());
      o.oddsN = staple.length;
      o.oddsHonest = staple.length > 0 && staple.every(w => {
        const r = idx().REC[idx().W.indexOf(w)]; return r && (+r.bp || 0) >= 85; });
      /* the two bands are DIFFERENT questions, not one dressed twice — a hard word
         is often a long shot at a bee, so the sets must not coincide */
      app.b2Clear(); app.b2Size('all'); app.b2Tog('diff:4'); app.b2Tog('odds:4');
      await new Promise(res => setTimeout(res, 900));
      o.bandsIndependent = document.querySelectorAll('[data-act=openWordCard]').length < staple.length;

      /* SUBJECT IS SUBJECTS ONLY. The flat list ranked by count put olatin, ooldeng,
         ofrench and ogreek at the top — origin families, already covered by the
         facet directly below, crowding out the subjects the facet is for. */
      app.b2Clear(); app.b2Sec('tag'); await new Promise(res => setTimeout(res, 600));
      const tagArgs = [...document.querySelectorAll('[data-act=b2Tog][data-arg^="tag:"]')]
        .map(x => x.textContent.trim().split(/\s+/)[0]);
      o.noOriginTags = !tagArgs.some(t => /^(olatin|ooldeng|ofrench|ogreek|onordic|eponyms)$/.test(t));
      /* ...and o-words that are REAL subjects survive: a /^o/ prefix rule would eat
         ocean, optics, orbits and occupations along with the origin families. */
      o.keptOWords = !!document.querySelector('[data-act=b2TGrp][data-arg="earth"]');
      /* a group narrows the chips on offer and surfaces what the count-ranked list hid */
      app.b2TGrp('med'); await new Promise(res => setTimeout(res, 700));
      const medTags = [...document.querySelectorAll('[data-act=b2Tog][data-arg^="tag:"]')]
        .map(x => x.textContent.trim().split(/\s+/)[0]);
      o.medGroup = ['medicine', 'anatomy', 'pharmacy', 'disease'].every(t => medTags.indexOf(t) >= 0);
      o.medNarrows = medTags.length && medTags.every(t => tagArgs.indexOf(t) >= 0 || true)
        && !medTags.some(t => /^(sports|poetry|music)$/.test(t));
      /* origin families group 214 strings, including the compounds and case variants */
      app.b2TGrp(''); app.b2Sec('orig'); app.b2OGrp('rom'); await new Promise(res => setTimeout(res, 800));
      const romOrig = [...document.querySelectorAll('[data-act=b2Tog][data-arg^="orig:"]')]
        .map(x => x.textContent.trim().split(/\s+\d/)[0]);
      o.romGroup = romOrig.indexOf('Latin') >= 0 && romOrig.indexOf('French') >= 0
        && !romOrig.some(x => /^(Greek|Old English|Arabic)$/.test(x));
      app.b2OGrp('');

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

      /* CLICKING A RESULT OPENS THAT WORD. openWordCard serves two callers — the
         Word of the Hour tile, which passes nothing, and the builder, which passes
         the word in data-arg. The handler declared no parameter, so it dropped the
         argument and called wordOfHour() every time: every result in the builder
         opened the SAME card, and since the button still showed the tapped word the
         card looked wrong rather than broken. Check several, because the first one
         happening to be the hour's word would hide it. */
      /* bldCreate() above lands on Practice, so the builder is no longer on screen —
         reopen it or there are no result buttons to click and the check passes
         vacuously, which is worse than failing. */
      app.openBuilder(); await new Promise(res => setTimeout(res, 700));
      app.b2Clear(); app.b2Size('all'); app.b2TxtStarts('ph');
      await new Promise(res => setTimeout(res, 900));
      o.woh = (wordOfHour() || {}).w;
      o.cards = [];
      for (const i of [0, 1, 2, 5, 40]) {
        app.wordCardClose(); await new Promise(res => setTimeout(res, 220));
        /* set() re-renders, so a button captured before a click is detached — the
           list must be re-queried every round or the clicks land on nothing */
        const btns = [...document.querySelectorAll('[data-act=openWordCard][data-arg]')];
        if (!btns[i]) continue;
        const label = btns[i].textContent.trim();
        btns[i].click(); await new Promise(res => setTimeout(res, 420));
        o.cards.push({ clicked: label, got: (state.wordCard || {}).w, def: !!(state.wordCard || {}).d });
      }
      app.wordCardClose(); await new Promise(res => setTimeout(res, 220));
      /* the tile that passes no argument must still get the hour's word */
      app.openWordCard(); await new Promise(res => setTimeout(res, 300));
      o.wohStillWorks = (state.wordCard || {}).w === o.woh;
      app.wordCardClose(); await new Promise(res => setTimeout(res, 250));
      app.b2Clear(); await new Promise(res => setTimeout(res, 300));

      /* and it is reachable from Pick your words, not only the Library tile */
      app.coachSetupOpen(); await new Promise(res => setTimeout(res, 700));
      o.inPickYourWords = /Build your own list/.test(document.body.innerHTML);
      return o;
    });
    r.errs = errs; out[tag] = r; await pg.close();
  }
  await b.close();
  const d = out.desktop, m = out.phone;
  ok(d.nineSections, 'all fifteen filter groups are on the page');
  ok(d.railScrolls, 'the filter rail actually scrolls (overflow-y: ' + d.railOverflow + ')');
  ok(!d.railInlineOverflow, 'and carries no inline overflow to outrank the stylesheet');
  ok(d.railFitsish, 'collapsed, the rail is about one screen not five (' + d.railH + 'px)');
  ok(d.lastHeadVisible, 'the last group\u2019s header can be scrolled to');
  ok(d.flClosedFirst, 'a group with nothing chosen starts closed');
  ok(d.flOpensWhenChosen, 'and opens itself the moment something in it is chosen');
  ok(d.sylToggles && d.sylTogglesBack, 'a group header opens and closes by hand');
  ok(m.railScrolls && m.railFitsish, 'and the same holds on a phone (' + m.railH + 'px)');
  ok(d.noRankNames, 'the Egg/Hatchling rank names are gone from the rail');
  ok(d.noLvFacet, 'and nothing filters on `y` (rarity) under a spelling-level label');
  ok(d.diffHonest, 'every word in the Gentle band really has spellDiff < 32.5 (' + d.diffN + ' words)');
  ok(d.oddsHonest, 'every Bee-staple word really has bp >= 85 (' + d.oddsN + ' words)');
  ok(d.bandsIndependent, 'difficulty and bee-odds are different questions, not one twice');
  ok(d.noOriginTags, 'Subject offers subjects, not the origin-family tags');
  ok(d.keptOWords, 'and the o-words that are real subjects survived the cut');
  ok(d.medGroup, 'Medicine & the body collects medicine + anatomy + pharmacy + disease');
  ok(d.romGroup, 'Romance groups Latin and French without Greek or Old English');
  ok(d.firstLetter, 'the A–Z first-letter chips really filter');
  ok(d.endsWith, '"ends with" really filters');
  ok(d.homHonest, 'the homophone chip finds real homophones (' + d.homCount + ', every one with a partner)');
  ok(d.flagsAnd, 'the "must come with" chips AND together rather than widening');
  ok(d.mine === 'phoenix,rhythm', 'Draw from → my missed words serves exactly those');
  ok(d.mastered === 'phone', 'and tapping mastered REPLACES it rather than ANDing to nothing');
  ok(d.chips >= 8, 'the groups open by default draw their chips (' + d.chips + ' collapsed)');
  ok(d.chipsExpanded > 40, 'and opening more groups draws theirs (' + d.chipsExpanded + ')');
  ok(!d.emoji && !m.emoji, 'not one emoji — the icons are the app’s own SVG set');
  ok(d.svgs >= 3, 'and the SVG icons are actually rendered (' + d.svgs + ')');
  ok(d.claimed === d.actual, 'A CHIP\'S COUNT IS HONEST — claimed ' + d.claimed + ', got ' + d.actual);
  ok(d.pill === 1, 'choosing one shows one removable pill');
  ok(d.startsWorks, '"starts with" really filters');
  ok(d.rangeSane, 'the length sliders cannot invert into an impossible range');
  ok(d.saved, 'the builder saves a list of exactly the chosen size');
  ok(d.savedLabel === 'Guard list', 'under the name the child typed');
  ok(d.becomesActive, 'and that list becomes the active one');
  ok(d.cards.length >= 4 && d.cards.every(c => c.got === c.clicked),
     'clicking a result opens THAT word\u2019s card, not the word of the hour ('
     + d.cards.map(c => c.clicked + '\u2192' + c.got).join(', ') + ')');
  ok(d.cards.length >= 4 && d.cards.every(c => c.def), 'and each card carries the real record, not a bare stub');
  ok(d.cards.some(c => c.clicked !== d.woh), 'the check is meaningful \u2014 results differ from the hour\u2019s word (' + d.woh + ')');
  ok(d.wohStillWorks, 'and the Word of the Hour tile, which passes no argument, still works');
  ok(d.inPickYourWords && m.inPickYourWords, 'it is reachable from Pick your words');
  ok(!d.sideways && !m.sideways, 'no sideways scroll on desktop OR phone');
  ok(!d.errs.length && !m.errs.length, 'no page errors' + (d.errs[0] ? ' — ' + d.errs[0] : ''));
  console.log(fails ? '\n' + fails + ' FAILED' : '\nall good');
  process.exit(fails ? 1 : 0);
})();
