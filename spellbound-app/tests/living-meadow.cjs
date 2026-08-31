// The Living Meadow — Act I pilot of the Living Atlas.
// The reveal law: the road is revealed by the CAMERA (a scroll clamp — the
// future is off the canvas), never by fog. Legs of 3-4 stops, a teased bend,
// place-true KIT rounds inside the stop quizzes, landmarks with side rounds,
// a daily seed (bloom / wanderer / weather), the half-blind fork pair, and
// the child's own avatar on the road. devUnlock (test mode) opens everything.
const { chromium } = require('playwright');
const SRC = process.env.SRC || __dirname + '/..';
const fs = require('fs');
let fails = 0;
const ok = (b, msg) => { console.log((b ? '  OK   ' : '  FAIL ') + msg); if (!b) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const pg = await b.newPage({ viewport: { width: 1100, height: 800 } });
  const errs = []; pg.on('pageerror', e => errs.push(String(e.message)));
  await pg.goto('file://' + SRC + '/index.html');
  await pg.waitForTimeout(2600);
  await pg.evaluate(async () => {
    localStorage.setItem('sb_splash', '0');
    state.children = [{ name: 'Zoe', avatar: 'bee', coins: 0, pow: {}, age: 10, lists: { default: { xp: 10 } }, activeList: 'default',
      missed: [], unlockedThemes: [], unlockedConcepts: {}, unlockedLists: {}, questPath: 'journey' }];
    state.activeIdx = 0; state.screen = 'app';
    app.openTrail();
    await new Promise(r => setTimeout(r, 2600));
    app.trailAct('honey|meadow');
    await new Promise(r => setTimeout(r, 800));
    const bt = [...document.querySelectorAll('button')].find(x => /Run away/i.test(x.textContent));
    if (bt) { bt.click(); await new Promise(r => setTimeout(r, 400)); }
  });

  // ---- the unrolling road: a fresh child sees ONE leg, never the act ----
  const fresh = await pg.evaluate(() => ({
    pano: !!document.querySelector('.mw-board img[src*="map-meadow-pano"]'),
    stops: document.querySelectorAll('.atlas-stop').length,
    sign: (document.querySelector('.mw-sign span') || {}).textContent || '',
    hint: (document.querySelector('.mw-sign i') || {}).textContent || '',
    lms: document.querySelectorAll('.mw-lm').length,
    wander: !!document.querySelector('.mw-wander'),
    bloom: !!document.querySelector('.mw-bloom'),
    wx: !!document.querySelector('.mw-wx'),
    rider: !!document.querySelector('.atlas-rider'),
    header: /of 13/.test((document.querySelector('.atlas-pop') || { textContent: '' }).textContent),
    wide: (() => { const el = document.getElementById('sb-pan');
      return el && el.firstElementChild.clientWidth > el.clientWidth * 2; })(),
  }));
  ok(fresh.pano, 'the Meadow rides its four-plate PANORAMA (map-meadow-pano.jpg)');
  ok(fresh.stops >= 3 && fresh.stops <= 5, 'a fresh child sees ONE leg — ' + fresh.stops + ' stops, not 13');
  ok(/Lollipop Grove/.test(fresh.sign) && /clear the road/.test(fresh.hint), 'the bend is TEASED: a signpost names the next leg (' + fresh.sign.trim() + ')');
  ok(fresh.lms === 1 && fresh.wander, 'leg one carries its landmark, and the wanderer stands somewhere in earned country');
  ok(fresh.bloom && fresh.wx, 'the daily seed painted today: a bonus bloom on a stop and the day\'s weather');
  ok(fresh.rider, 'the child\'s own avatar rides the road');
  ok(fresh.header, 'position stays legible — the stop card still says "of 13"');
  ok(fresh.wide, 'the board is far wider than the camera — a world, not a screen');

  // ---- the camera clamp IS the reveal: you cannot scroll into the future ----
  const clamp = await pg.evaluate(async () => {
    const el = document.getElementById('sb-pan');
    el.scrollLeft = 999999;
    await new Promise(r => setTimeout(r, 250));
    const max = el.scrollLeft; const bd = el.firstElementChild.clientWidth;
    return { max, bd, frac: (max + el.clientWidth) / bd };
  });
  ok(clamp.frac < 0.33, 'the camera clamps at the earned edge (' + Math.round(clamp.frac * 100) + '% of the world reachable) — off-canvas, never fog');

  // ---- no fog: nothing on the board is veiled or darkened ----
  ok(await pg.evaluate(() => !document.querySelector('.atlas-board .fog, .atlas-board [class*="veil"]')),
    'no veil element anywhere on the board — the reveal law holds');

  // ---- test mode: devUnlock opens EVERYTHING, without spending the reveal ----
  const dev = await pg.evaluate(async () => {
    state.devUnlock = 1; render(); await new Promise(r => setTimeout(r, 400));
    const out = { stops: document.querySelectorAll('.atlas-stop').length,
      lms: document.querySelectorAll('.mw-lm').length,
      sign: !!document.querySelector('.mw-sign'),
      rvKept: !((state.children[0].trail || {}).mw || {}).rv };
    state.devUnlock = 0; render(); await new Promise(r => setTimeout(r, 400));
    out.backTo = document.querySelectorAll('.atlas-stop').length;
    return out;
  });
  ok(dev.stops === 13 && dev.lms === 4 && !dev.sign, 'TEST MODE: devUnlock shows all 13 stops and all 4 landmarks, no signpost');
  ok(dev.rvKept && dev.backTo === fresh.stops, 'test mode peeks without SPENDING the reveal — off again, the child\'s leg returns');

  // ---- clearing the leg unrolls the road (reward beat) ----
  const unroll = await pg.evaluate(async () => {
    const c = state.children[0]; c.trail = c.trail || {};
    c.trail.done = { u1: { 1: 85 }, u2: { 1: 85 }, u3: { 1: 85 }, u4: { 1: 85 } };
    render(); await new Promise(r => setTimeout(r, 700));
    return { stops: document.querySelectorAll('.atlas-stop').length,
      rv: ((c.trail || {}).mw || {}).rv || 0,
      sign: (document.querySelector('.mw-sign span') || {}).textContent || '' };
  });
  ok(unroll.stops > fresh.stops, 'clearing the leg UNROLLS the road — ' + unroll.stops + ' stops now stand');
  ok(unroll.rv >= 1, 'the reveal is remembered (rv=' + unroll.rv + ')');
  ok(/Mushroom Hollow|Hive Gates/.test(unroll.sign), 'and the NEXT bend is teased (' + unroll.sign.trim() + ')');

  // ---- the kit rounds: place-true mechanics inside the real quiz ----
  const kits = await pg.evaluate(async () => {
    state.devUnlock = 1;   // test mode: open any stop for the kit audit
    const seen = new Set(); let items = 0;
    for (let t2 = 0; t2 < 6 && seen.size < 3; t2++) {
      app.trailUnit('u5'); await new Promise(r => setTimeout(r, 200));
      app.trailQuiz(); await new Promise(r => setTimeout(r, 900));
      const q = state.tq; if (!q) continue;
      items = q.items.length;
      q.items.forEach(x => { if (x.ty === 'kit') seen.add(x.kit); });
      app.trailBack(); await new Promise(r => setTimeout(r, 150));
    }
    return { kinds: [...seen], items };
  });
  ok(kits.kinds.length === 3, 'all three meadow kits appear across quizzes: ' + kits.kinds.join(', '));

  // a butterfly answered right scores exactly like a classic item
  const bf = await pg.evaluate(async () => {
    app.trailUnit('u5'); await new Promise(r => setTimeout(r, 200));
    app.trailQuiz(); await new Promise(r => setTimeout(r, 900));
    const q = state.tq; const ki = q.items.findIndex(x => x.ty === 'kit' && x.kit === 'butterfly');
    if (ki < 0) return { skip: true };
    q.i = ki; q.picked = null; render(); await new Promise(r => setTimeout(r, 200));
    const before = q.score;
    app.kitPick(String(q.items[ki].ans)); await new Promise(r => setTimeout(r, 100));
    return { scored: state.tq.score === before + 1, right: state.tq.right === true,
      flies: document.querySelectorAll('.kit-fly').length };
  });
  ok(bf.skip || (bf.scored && bf.right && bf.flies === 3), 'Butterfly Catch: three butterflies, the true spelling scores (+1)');

  // the comb builder assembles the word from its pieces
  const cb = await pg.evaluate(async () => {
    const q = state.tq; if (!q) return { skip: true };
    const ki = q.items.findIndex(x => x.ty === 'kit' && x.kit === 'comb');
    if (ki < 0) return { skip: true };
    q.i = ki; q.picked = null; state.kitBuf = null; render(); await new Promise(r => setTimeout(r, 200));
    const it = q.items[ki]; const before = q.score;
    for (const piece of it.ch) { const k = it.tiles.findIndex((t2, j) => t2.t === piece && !(state.kitBuf || []).includes(j));
      app.kitTile(String(k)); await new Promise(r => setTimeout(r, 60)); }
    return { scored: state.tq.score === before + 1, right: state.tq.right === true };
  });
  ok(cb.skip || (cb.scored && cb.right), 'Comb Builder: tapping the pieces in order fills the comb and scores');
  await pg.evaluate(() => { app.trailBack(); });

  // ---- a landmark opens a SIDE round: kit-only, honey, no stars ----
  const lm = await pg.evaluate(async () => {
    app.trailAct('honey|meadow'); await new Promise(r => setTimeout(r, 500));
    const c = state.children[0]; const coins0 = c.coins || 0;
    app.mwLmk('0'); await new Promise(r => setTimeout(r, 1100));
    const q = state.tq; if (!q || q.side !== 0) return { open: false };
    // answer every kit item correctly through the real handlers
    for (let g = 0; g < 8 && !state.tq.over; g++) {
      const it = state.tq.items[state.tq.i];
      if (it.ty !== 'kit') return { open: true, pure: false };
      if (it.kit === 'butterfly') app.kitPick(String(it.ans));
      else { const seqp = it.kit === 'comb' ? it.ch : it.w.split('');
        for (const piece of seqp) { const pool = it.kit === 'comb' ? it.tiles : it.pool;
          const k = pool.findIndex((t2, j) => (it.kit === 'comb' ? t2.t === piece : t2.L === piece) && !(state.kitBuf || []).includes(j));
          app.kitTile(String(k)); await new Promise(r => setTimeout(r, 40)); } }
      await new Promise(r => setTimeout(r, 1400));
    }
    await new Promise(r => setTimeout(r, 400));
    const c2 = state.children[0];
    return { open: true, pure: true, over: state.tq.over, paid: (c2.coins || 0) - coins0,
      marked: !!(((c2.trail || {}).mw || {}).lm || {})[0],
      stars: !((c2.trail || {}).st || {}).u1q };
  });
  ok(lm.open && lm.pure, 'the Beehive landmark opens a KIT-ONLY side round');
  ok(lm.over && lm.paid >= 12, 'clearing it pays the honey trickle (+' + lm.paid + ')');
  ok(lm.marked, 'and the landmark remembers today\'s visit (once a day)');

  // ---- the wanderer: one tap, one word, a little honey ----
  const wd = await pg.evaluate(async () => {
    await new Promise(r => setTimeout(r, 300));
    app.trailAct('honey|meadow'); await new Promise(r => setTimeout(r, 500));
    const c = state.children[0]; const coins0 = c.coins || 0;
    if (!document.querySelector('.mw-wander')) return { there: false };
    app.mwWander(); await new Promise(r => setTimeout(r, 900));
    return { there: true, paid: (state.children[0].coins || 0) - coins0,
      gone: !document.querySelector('.mw-wander') };
  });
  ok(!wd.there || (wd.paid === 8 && wd.gone), 'Barnaby pays his 8 honey and wanders off until tomorrow');

  // ---- the fork pair: both spurs open together; the dared one pays a chest ----
  const fork = await pg.evaluate(async () => {
    const c = state.children[0];
    c.trail.done = { u1: { 1: 85 }, u2: { 1: 85 }, u3: { 1: 85 }, u4: { 1: 85 }, u5: { 1: 85 }, u6: { 1: 85 } };
    c.trail.chk = { '1:c1': 80, '1:c2': 80 };
    // find the checkpoint ids actually in the meadow seq and pass everything before the pair
    render(); await new Promise(r => setTimeout(r, 500));
    const nows = [...document.querySelectorAll('.atlas-stop.now')].length;
    const tags = [...document.querySelectorAll('.mw-spurtag')].map(x => x.textContent);
    return { nows, tags };
  });
  ok(fork.tags.length === 2 && /knoll/.test(fork.tags.join()) && /bridge/.test(fork.tags.join()),
    'the fork wears its two spur tags — the dark mushroom knoll and the petal bridge');
  ok(fork.nows >= 1, 'the road stays walkable around the fork (' + fork.nows + ' open)');

  // ---- the stop card folds on a map tap, returns on a pin tap, and never
  //      hangs off the camera's earned edge ----
  const card = await pg.evaluate(async () => {
    app.trailAct('honey|meadow'); await new Promise(r => setTimeout(r, 500));
    const bt = [...document.querySelectorAll('button')].find(x => /Run away/i.test(x.textContent));
    if (bt) { bt.click(); await new Promise(r => setTimeout(r, 300)); }
    const had = !!document.querySelector('.atlas-pop');
    app.trailShut(); await new Promise(r => setTimeout(r, 300));
    const folded = !document.querySelector('.atlas-pop');
    const pin = document.querySelector('.atlas-stop'); if (pin) pin.click();
    await new Promise(r => setTimeout(r, 300));
    const backAgain = !!document.querySelector('.atlas-pop');
    // pick the stop nearest the earned edge: its card must anchor leftward
    const pins = [...document.querySelectorAll('.atlas-stop')];
    const last = pins[pins.length - 1]; last.click();
    await new Promise(r => setTimeout(r, 300));
    const pop = document.querySelector('.atlas-pop');
    const anchored = pop && /calc\(-100%/.test(pop.style.getPropertyValue('--tx'));
    // and the card's box actually fits inside the reachable world
    const el = document.getElementById('sb-pan'); el.scrollLeft = 999999;
    await new Promise(r => setTimeout(r, 250));
    const pr = pop.getBoundingClientRect(), er = el.getBoundingClientRect();
    return { had, folded, backAgain, anchored, fits: pr.right <= er.right + 2 };
  });
  ok(card.had && card.folded, 'a tap on the open map FOLDS the stop card away');
  ok(card.backAgain, 'a pin tap brings it back');
  ok(card.anchored && card.fits, 'the card near the earned edge anchors leftward and fits on the reachable canvas');

  // ---- the LIFE layer: butterflies, petals, glints, painted landmark art,
  //      and a dozen pokeable painted things ----
  const life = await pg.evaluate(async () => {
    state.devUnlock = 1; render(); await new Promise(r => setTimeout(r, 500));
    const out = {
      butter: document.querySelectorAll('.mw-butter').length,
      petals: document.querySelectorAll('.mw-petalfall').length,
      twinks: document.querySelectorAll('.mw-twink').length,
      pokes: document.querySelectorAll('.mw-poke').length,
      lmImgs: document.querySelectorAll('.mw-lm-a img[src*="mw-lm-"]').length,
      ghostless: !document.querySelector('.mw-lm.done[style*="grayscale"]') };
    /* the boing class lands synchronously inside mwPoke; a deferred render can
       rebuild the pin after, so the check is immediate */
    app.mwPoke('5');
    out.boing = !!document.querySelector('.mw-poke.boing');
    out.burst = !!document.querySelector('.mw-burst');
    await new Promise(r => setTimeout(r, 250));
    state.devUnlock = 0;
    return out;
  });
  ok(life.butter >= 4 && life.petals >= 10 && life.twinks >= 6,
    'the meadow LIVES — ' + life.butter + ' butterflies, ' + life.petals + ' falling petals, ' + life.twinks + ' glints');
  ok(life.pokes >= 10, life.pokes + ' painted things are POKEABLE');
  ok(life.boing && life.burst, 'a poke boings and sheds a sparkle burst');
  ok(life.lmImgs === 4, 'all four landmarks wear their PAINTED sprites (no more flat icons)');
  const crit = await pg.evaluate(async () => {
    state.devUnlock = 1; render(); await new Promise(r => setTimeout(r, 500));
    const out = { workbees: document.querySelectorAll('.mw-workbee img[src*="hive-bee-fly"]').length,
      birds: document.querySelectorAll('.mw-bird').length,
      seeds: document.querySelectorAll('.mw-seed').length,
      wisps: document.querySelectorAll('.mw-wisp').length,
      water: document.querySelectorAll('.mw-water').length,
      pulse: !!document.querySelector('.atlas-stop.now .atlas-sd') };
    state.devUnlock = 0;
    return out;
  });
  ok(crit.workbees >= 3 && crit.birds >= 2 && crit.seeds >= 5 && crit.wisps >= 3,
    'creatures with BEHAVIOUR: ' + crit.workbees + ' worker bees on gather loops, ' + crit.birds + ' birds crossing, '
    + crit.seeds + ' seeds drifting, ' + crit.wisps + ' mist wisps');
  ok(crit.water >= 4, 'the brook glitters along its painted course (' + crit.water + ' water glints)');
  ['mw-lm-beehive', 'mw-lm-well', 'mw-lm-arch', 'mw-lm-oak'].forEach(f =>
    ok(fs.existsSync(SRC + '/app-art/' + f + '.svg'), f + '.svg ships'));

  // ---- source pins ----
  const tj = fs.readFileSync(SRC + '/trail.js', 'utf8');
  ok(/THE LIVING MEADOW/.test(tj) && /reveal law/i.test(tj), 'the Living Meadow section and its reveal law are documented in trail.js');
  ok(/mwSeed/.test(tj) && /deterministic/.test(tj), 'the daily seed is deterministic (child + date, offline)');
  ok(fs.existsSync(SRC + '/app-art/map-meadow-pano.jpg'), 'the panorama plate ships');
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
  await b.close();
  process.exit(fails ? 1 : 0);
})();
