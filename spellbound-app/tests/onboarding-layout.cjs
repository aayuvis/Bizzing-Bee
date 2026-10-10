/* THE ONBOARDING LOOKS RIGHT ON A PHONE.

   Two faults shipped at once and neither was catchable by reading the code:

     · `avatarSVG(id,70)` writes width="70" height="70" onto the <svg>/<img>. Five of
       those went into five tiles that a 430px screen can only make ~58px wide, so the
       buddies overlapped their neighbours and the fifth ran out of the card.
     · the frame was one `place-items:center` stack inside min-height:100dvh — while the
       dev banner sits ABOVE it. So: ~290px of nothing above the heading, and the
       Continue button pushed off the bottom edge.

   Geometry, not markup: every check below is measured from the live DOM at phone size,
   on every one of the five steps, and on the placement step's two screens (11+ bands). Run:
     NODE_PATH=/opt/node22/lib/node_modules node tests/onboarding-layout.cjs
   SHOT=1 also writes a PNG per step into tests/build/.                               */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const W = 430, H = 900;
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => require('fs').existsSync(p)) });
  const pg = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + path.resolve(__dirname, '..') + '/index.html');
  await pg.waitForTimeout(3500);
  if (process.env.SHOT) fs.mkdirSync(path.join(__dirname, 'build'), { recursive: true });

  const report = [];
  for (let step = 0; step <= 4; step++) {
    await pg.evaluate(s => {
      state.children = []; state.screen = 'onboarding'; state.onbStep = s;
      state.devBannerOff = false;
      state.draft = { name: 'Ahana', age: 9, ageBand: '9-11', avatar: 'bizzy', theme: 'spellbound', goal: 10 };
      render();
    }, step);
    await pg.waitForTimeout(600);
    if (process.env.SHOT) await pg.screenshot({ path: path.join(__dirname, 'build', 'onb-' + step + '.png') });

    report.push(await pg.evaluate(MEASURE));
  }
  /* (road to 4.5, P1.7) the PLACEMENT step of the 11+ bands, both of its screens: the words, and the choice */
  {
    await pg.evaluate(() => { state.children = []; state.screen = 'onboarding'; state.devBannerOff = false;
      state.draft = { name: 'Ahana', age: 12, ageBand: '11-13', avatar: 'bizzy', theme: 'spellbound', goal: 10 };
      state.onbStep = onbKeys().indexOf('place'); render(); });
    await pg.waitForFunction(() => !!(state.draft.pl && document.querySelector('[data-inp="placeType"]')), null, { timeout: 15000 });
    await pg.waitForTimeout(300);
    if (process.env.SHOT) await pg.screenshot({ path: path.join(__dirname, 'build', 'onb-place-words.png') });
    report.push(await pg.evaluate(MEASURE));
    await pg.evaluate(() => { const p = state.draft.pl; let it; while ((it = SB_PLACE.pick(p.s, SB_PLACE_DATA))) SB_PLACE.answer(p.s, SB_PLACE_DATA, it.r < 3, it.r < 3 ? it.w : ''); render(); });
    await pg.waitForFunction(() => !!document.querySelector('[data-act="placePick"]'), null, { timeout: 5000 });
    await pg.waitForTimeout(300);
    if (process.env.SHOT) await pg.screenshot({ path: path.join(__dirname, 'build', 'onb-place-choose.png') });
    report.push(await pg.evaluate(MEASURE));
    await pg.evaluate(() => { state.draft.pl.skipped = true; render(); }); await pg.waitForTimeout(400);
    if (process.env.SHOT) await pg.screenshot({ path: path.join(__dirname, 'build', 'onb-place-skipped.png') });
    report.push(await pg.evaluate(MEASURE));
  }
  function MEASURE() {
      const R = el => el.getBoundingClientRect();
      const frame = document.querySelector('.sb-onb');
      const head = document.querySelector('.sb-onb-head');
      const h2 = document.querySelector('.sb-onb-card h2');
      const next = document.querySelector('.sb-onb-next');
      const card = document.querySelector('.sb-onb-card');
      const arts = [...document.querySelectorAll('.sb-onb-avart')].map(R);
      const tiles = [...document.querySelectorAll('.sb-onb-av')].map(R);
      /* the worst horizontal overspill of anything inside the card — a child whose
         right edge is past the card's own padding box is the overlap fault */
      let spill = 0;
      if (card) { const c = R(card);
        [...card.querySelectorAll('*')].forEach(el => {
          const r = R(el); if (!r.width) return;
          spill = Math.max(spill, r.right - c.right, c.left - r.left); }); }
      let overlap = 0;
      for (let i = 0; i < arts.length; i++) for (let j = i + 1; j < arts.length; j++) {
        const a = arts[i], c = arts[j];
        overlap = Math.max(overlap, Math.min(a.right, c.right) - Math.max(a.left, c.left)); }
      let outOfTile = 0;
      arts.forEach((a, i) => { const t = tiles[i]; if (!t) return;
        outOfTile = Math.max(outOfTile, a.right - t.right, t.left - a.left, a.bottom - t.bottom, t.top - a.top); });
      return {
        headTop: head ? Math.round(R(head).top) : -1,
        cardTop: card ? Math.round(R(card).top) : -1,
        h2Top: h2 ? Math.round(R(h2).top) : -1,
        nextBottom: next ? Math.round(R(next).bottom) : -1,
        nextTop: next ? Math.round(R(next).top) : -1,
        cardW: card ? Math.round(R(card).width) : 0,
        cardH: card ? Math.round(R(card).height) : 0,
        docW: document.documentElement.scrollWidth,
        overlap: Math.round(overlap), outOfTile: Math.round(outOfTile),
        spill: Math.round(spill), tiles: tiles.length,
        tileW: tiles.length ? Math.round(tiles[0].width) : 0,
        frameH: frame ? Math.round(R(frame).height) : 0,
      };
  }
  if (process.env.SHOT) {
    await pg.setViewportSize({ width: 1280, height: 860 });
    await pg.evaluate(() => { state.onbStep = 2; render(); });
    await pg.waitForTimeout(500);
    await pg.screenshot({ path: path.join(__dirname, 'build', 'onb-desktop.png') });
  }
  await b.close();

  const names = ['name', 'age band', 'buddy', 'world', 'goal', 'placement words', 'placement choice', 'placement skipped'];
  report.forEach((r, i) => console.log(`  · ${names[i]}: heading at y=${r.h2Top}, Continue ${r.nextTop}–${r.nextBottom}, card ${r.cardW}px`));
  console.log('');

  /* 1 — THE TOP IS NOT DEAD.
     Measured on the CARD, not the heading: the fault was background showing through
     where content should be, and art above a heading is content. (A bee greeting you
     on step one pushes the words down and is the opposite of the complaint.) The
     heading still has to sit in the top four-tenths — it was at y=400. */
  const worstCard = Math.max(...report.map(r => r.cardTop));
  ok(worstCard <= H * 0.28, `no step floats its card down the screen — the lowest card starts at y=${worstCard} of ${H} (cap ${Math.round(H * 0.28)})`);
  const worstTop = Math.max(...report.map(r => r.h2Top));
  ok(worstTop <= H * 0.40, `every question is high on the screen — the lowest heading starts at y=${worstTop} (cap ${Math.round(H * 0.40)})`);

  /* 2 — AND THE CARD EARNS ITS PLACE. A 260px card in a 900px phone is the same
     complaint wearing a different hat: the gap below it is what the eye reads as
     dead. Half the space between the header and the action bar is the floor. */
  const room = r => (r.nextTop - r.cardTop);
  const thin = report.map((r,i)=>({i,fill:r.cardH/room(r)})).filter(x=>x.fill<0.5);
  ok(!thin.length, thin.length ? `step(s) ${thin.map(x=>names[x.i]).join(', ')} fill under half the screen they are given (${thin.map(x=>Math.round(x.fill*100)+'%').join(', ')})`
                               : `every card fills its screen — ${report.map(r=>Math.round(r.cardH/room(r)*100)+'%').join(' · ')}`);

  /* 2 — THE PRIMARY ACTION IS ON THE SCREEN. Sticky, so the banner costs scroll and
     never the button. */
  const off = report.filter(r => r.nextBottom > H || r.nextBottom < 0);
  ok(!off.length, off.length ? `Continue is off-screen on ${off.length} step(s) (bottom y=${off.map(r => r.nextBottom).join(', ')})`
                             : `Continue sits inside the viewport on all six steps (the five every child sees, and placement's two screens) (lowest edge y=${Math.max(...report.map(r => r.nextBottom))})`);

  /* 3 — THE BUDDIES DO NOT TOUCH. Measured art box against art box. */
  const bud = report[2];
  ok(bud.tiles === 5, `the buddy row draws five tiles — ${bud.tiles}`);
  ok(bud.overlap <= 0, bud.overlap > 0 ? `two buddies overlap by ${bud.overlap}px` : `no two buddies overlap (tile ${bud.tileW}px)`);
  ok(bud.outOfTile <= 1, bud.outOfTile > 1 ? `a buddy escapes its tile by ${bud.outOfTile}px` : 'every buddy is inside its own tile');

  /* 4 — NOTHING RUNS OUT OF THE CARD, on any step. */
  const worstSpill = Math.max(...report.map(r => r.spill));
  ok(worstSpill <= 1, worstSpill > 1 ? `something overflows its card by ${worstSpill}px` : 'nothing overflows the card on any step');
  ok(report.every(r => r.docW <= W + 1), `no horizontal page scroll (widest ${Math.max(...report.map(r => r.docW))}px of ${W})`);

  ok(!errs.length, errs.length ? 'page errors: ' + errs[0] : 'no page errors across the five steps and placement');
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
