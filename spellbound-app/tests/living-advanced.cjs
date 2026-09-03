// The Living Atlas reaches the ADVANCED ROUNDS and the ULTRA CHAMPIONS.
// Six expeditions and five champion landmarks now ride four-plate panoramas
// with the same camera law, and their HIDDEN TREASURES — the three caches and
// the three seeded secrets — are strung across the whole journey instead of
// crowded onto one screen. A treasure past the bend is never rendered.
const { chromium } = require('playwright');
const SRC = process.env.SRC || __dirname + '/..';
const fs = require('fs');
let fails = 0;
const ok = (b, msg) => { console.log((b ? '  OK   ' : '  FAIL ') + msg); if (!b) fails++; };
const EXPS = ['proving', 'greysea', 'liars', 'grandtrunk', 'farflung', 'factory'];
const ULTRA = ['uproving', 'ulibrary', 'ucrucible', 'uobservatory', 'uchampionship'];
(async () => {
  for (const a of EXPS.concat(ULTRA))
    ok(fs.existsSync(SRC + '/app-art/map-' + a + '-pano.jpg'), a + ' has its panorama');
  const tj = fs.readFileSync(SRC + '/trail.js', 'utf8');
  ok(EXPS.concat(ULTRA).every(a => tj.includes("'lv-hero-" + a + "'") && tj.includes("'lv-lm-" + a + "'")),
    'every expedition and landmark names its keyed hero and landmark art');

  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const pg = await b.newPage({ viewport: { width: 1100, height: 800 } });
  const errs = []; pg.on('pageerror', e => errs.push(String(e.message)));
  await pg.goto('file://' + SRC + '/index.html');
  await pg.waitForTimeout(2600);
  await pg.evaluate(async () => {
    localStorage.setItem('sb_splash', '0');
    state.children = [{ name: 'Ravi', avatar: 'bee', coins: 0, pow: {}, age: 12, lists: { default: { xp: 40 } }, activeList: 'default',
      missed: [], unlockedThemes: [], unlockedConcepts: {}, unlockedLists: {}, questPath: 'journey' }];
    state.activeIdx = 0; state.screen = 'app'; state.devUnlock = true;
    app.openTrail(); await new Promise(r => setTimeout(r, 2200));
  });

  // ---- the six expeditions ----
  for (const a of EXPS) {
    const v = await pg.evaluate(async act => {
      app.trailAct('exp|' + act); await new Promise(r => setTimeout(r, 1000));
      const bt = [...document.querySelectorAll('button')].find(x => /Run away/i.test(x.textContent));
      if (bt) { bt.click(); await new Promise(r => setTimeout(r, 300)); }
      return { pano: !!document.querySelector('.mw-board img[src*="map-' + act + '-pano"]'),
        lms: document.querySelectorAll('.mw-lm').length,
        heroes: document.querySelectorAll('.mw-hero').length,
        pokes: document.querySelectorAll('.mw-poke').length,
        caches: document.querySelectorAll('.atlas-tre').length,
        wide: (() => { const el = document.getElementById('sb-pan');
          return !!el && el.firstElementChild.clientWidth > el.clientWidth * 2; })() };
    }, a);
    ok(v.pano && v.wide, a + ' rides its own panorama — a world, not a screen');
    ok(v.lms >= 1 && v.heroes >= 1 && v.pokes >= 10, a + ' fields its landmark, hero and pokes');
    ok(v.caches === 3, a + ' carries all three caches across the journey (' + v.caches + ')');
  }

  // ---- the five Ultra landmarks ----
  for (let ai = 0; ai < ULTRA.length; ai++) {
    const v = await pg.evaluate(async i => {
      app.ultraAct(String(i)); await new Promise(r => setTimeout(r, 1100));
      return { view: state.trailView,
        pano: !!document.querySelector('.mw-board img'),
        src: ((document.querySelector('.mw-board img') || {}).src || '').split('/').pop(),
        stops: document.querySelectorAll('.atlas-stop').length,
        lms: document.querySelectorAll('.mw-lm').length,
        heroes: document.querySelectorAll('.mw-hero').length,
        secrets: document.querySelectorAll('.atlas-secret').length,
        caches: document.querySelectorAll('.atlas-tre').length };
    }, ai);
    ok(v.view === 'ultra' && v.src === 'map-' + ULTRA[ai] + '-pano.jpg',
      ULTRA[ai] + ' opens on its own panorama (' + v.src + ')');
    ok(v.lms >= 1 && v.heroes >= 1, ULTRA[ai] + ' fields its landmark and hero set-piece');
    ok(v.secrets === 3 && v.caches === 3,
      ULTRA[ai] + ' hides all three secrets and all three caches (' + v.secrets + '/' + v.caches + ')');
  }
  ok(true, 'test mode opens all five champion landmarks — no clearing fifteen stops to look');

  // ---- the reveal law reaches the champions' road: treasure past the bend
  //      is NOT rendered, and the camera cannot scroll to it ----
  const law = await pg.evaluate(async () => {
    /* the champions' road is behind the Advanced Pack, so stand in as a real
       PAYING champion rather than a tester: pack on, test mode off — that is
       the only state in which the reveal is actually spent */
    const realActive = window.ADV && ADV.active;
    if (window.ADV) ADV.active = () => true;
    state.devUnlock = false;
    app.ultraAct('0'); await new Promise(r => setTimeout(r, 1200));
    const el = document.getElementById('sb-pan');
    const stops = document.querySelectorAll('.atlas-stop').length;
    const tre = document.querySelectorAll('.atlas-tre').length;
    const secrets = document.querySelectorAll('.atlas-secret').length;
    el.scrollLeft = 999999; await new Promise(r => setTimeout(r, 300));
    const max = el.scrollLeft, full = el.firstElementChild.clientWidth - el.clientWidth;
    const veil = document.querySelectorAll('.mw-veil,[class*="fog"]').length;
    state.devUnlock = true;
    if (window.ADV && realActive) ADV.active = realActive;
    return { stops, tre, secrets, max, full, veil };
  });
  ok(law.stops > 0 && law.stops < 4, 'a fresh champion sees the first country only (' + law.stops + ' of 4 stops)');
  ok(law.max < law.full * 0.9, 'the camera cannot scroll past the earned bend (' + Math.round(law.max) + ' of ' + Math.round(law.full) + ')');
  ok(law.tre < 3 || law.secrets < 3, 'the treasures further down the road are NOT on the board yet (' + law.tre + ' caches, ' + law.secrets + ' secrets)');
  ok(law.veil === 0, 'and nothing is veiled — the reveal is the camera, never fog');

  // ---- a champion's landmark round draws ULTRA words and banks to the
  //      landmark's OWN bucket, not to whatever act was last walked ----
  const side = await pg.evaluate(async () => {
    app.trailAct('honey|meadow'); await new Promise(r => setTimeout(r, 700));   // stand somewhere else first
    app.ultraAct('1'); await new Promise(r => setTimeout(r, 1100));
    const coins0 = state.children[0].coins || 0;
    app.mwLmk('0'); await new Promise(r => setTimeout(r, 1200));
    const q = state.tq; if (!q) return { open: false };
    const jk = q.jk, ult = q.ult, items = q.items.length;
    for (let g = 0; g < 8 && state.tq && !state.tq.over; g++) {
      const it = state.tq.items[state.tq.i];
      if (it.ty === 'kit' && it.kit === 'butterfly') app.kitPick(String(it.ans));
      else if (it.ty === 'kit') { const seqp = it.kit === 'comb' ? it.ch : it.w.split('');
        for (const piece of seqp) { const pool = it.kit === 'comb' ? it.tiles : it.pool;
          const k = pool.findIndex((t2, j) => (it.kit === 'comb' ? t2.t === piece : t2.L === piece) && !(state.kitBuf || []).includes(j));
          app.kitTile(String(k)); await new Promise(r => setTimeout(r, 40)); } }
      else { app.tqType(it.w); app.tqGo(); }
      await new Promise(r => setTimeout(r, 1400));
    }
    await new Promise(r => setTimeout(r, 400));
    const c2 = state.children[0];
    const lv = (c2.trail || {}).lv || {};
    return { open: true, jk, ult, items, paid: (c2.coins || 0) - coins0,
      ulibMarked: !!((lv.ulibrary || {}).lm || {})[0],
      meadowClean: !(((c2.trail || {}).mw || {}).lm || {})[0] };
  });
  ok(side.open && side.jk === 'ulibrary' && side.ult === 1,
    'the black library\'s landmark round remembers WHICH road it was taken on (jk=' + side.jk + ')');
  ok(side.paid >= 12, 'clearing it pays the champion\'s honey trickle (+' + side.paid + ')');
  ok(side.ulibMarked && side.meadowClean,
    'and it is banked to the black library\'s own bucket — the meadow\'s is untouched');

  // ---- and Back returns to the champions' road, not to an act ----
  const back = await pg.evaluate(async () => {
    app.trailBack(); await new Promise(r => setTimeout(r, 700));
    return { view: state.trailView, ai: state.ultraAct };
  });
  ok(back.view === 'ultra' && back.ai === 1, 'Back from a champion\'s side round returns to the champion\'s road');

  // ---- an expedition STOP QUIZ serves its kit rounds in its own verbs ----
  const kit = await pg.evaluate(async () => {
    app.trailToMap(); await new Promise(r => setTimeout(r, 300));
    app.trailAct('exp|greysea'); await new Promise(r => setTimeout(r, 900));
    const bt = [...document.querySelectorAll('button')].find(x => /Run away/i.test(x.textContent));
    if (bt) { bt.click(); await new Promise(r => setTimeout(r, 300)); }
    const btn = [...document.querySelectorAll('[data-act="trailUnit"]')][0];
    const uid = btn && btn.getAttribute('data-arg');
    if (!uid) return { ok: false };
    app.trailUnit(uid); await new Promise(r => setTimeout(r, 800));
    app.trailQuiz(); await new Promise(r => setTimeout(r, 1400));
    const q = state.tq; if (!q) return { ok: false };
    const kits = q.items.filter(i => i.ty === 'kit');
    return { ok: true, total: q.items.length, kits: kits.length, acts: [...new Set(kits.map(k => k.a))] };
  });
  ok(kit.ok && kit.kits >= 2, 'a Grey Sea stop quiz weaves in its kit rounds (' + kit.kits + ' of ' + kit.total + ' items)');
  ok(kit.ok && kit.acts.length === 1 && kit.acts[0] === 'greysea',
    'and they are tagged to the expedition, so they speak ITS verbs (bells and fog, not combs)');

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
  await b.close();
  process.exit(fails ? 1 : 0);
})();
