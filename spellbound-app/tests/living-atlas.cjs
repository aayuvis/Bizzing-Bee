// The Living Atlas — every Honey act carries the Meadow's machinery: its own
// four-plate panorama, the camera reveal, one landmark side round, one hero
// set-piece, the wanderer, pokes, the daily seed, and the kit rounds spoken
// in the country's OWN verbs (mosaics in the forum, shelves in the library).
// Progress buckets are PER ACT: a landmark day in the library must never
// mark the meadow's, and vice versa.
const { chromium } = require('playwright');
const SRC = process.env.SRC || __dirname + '/..';
const fs = require('fs');
let fails = 0;
const ok = (b, msg) => { console.log((b ? '  OK   ' : '  FAIL ') + msg); if (!b) fails++; };
const ACTS = ['library', 'forum', 'storm', 'roots', 'strait', 'junkyard', 'sprints', 'stage'];
(async () => {
  // ---- the art ships: a pano and keyed sprites for every act ----
  for (const a of ACTS) {
    ok(fs.existsSync(SRC + '/app-art/map-' + a + '-pano.jpg'), a + ' has its panorama (map-' + a + '-pano.jpg)');
  }
  ok(ACTS.every(a => {
    const t = fs.readFileSync(SRC + '/trail.js', 'utf8');
    return t.includes("'lv-hero-" + a + "'") || t.includes("'lv-lm-" + a + "'");
  }), 'every act names its keyed sprite art in the LIV table');

  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const pg = await b.newPage({ viewport: { width: 1100, height: 800 } });
  const errs = []; pg.on('pageerror', e => errs.push(String(e.message)));
  await pg.goto('file://' + SRC + '/index.html');
  await pg.waitForTimeout(2600);
  await pg.evaluate(async () => {
    localStorage.setItem('sb_splash', '0');
    state.children = [{ name: 'Milo', avatar: 'bee', coins: 0, pow: {}, age: 10, lists: { default: { xp: 10 } }, activeList: 'default',
      missed: [], unlockedThemes: [], unlockedConcepts: {}, unlockedLists: {}, questPath: 'journey' }];
    state.activeIdx = 0; state.screen = 'app'; state.devUnlock = true;
    app.openTrail();
    await new Promise(r => setTimeout(r, 2200));
  });

  // ---- every act boards its pano with the full living layer (test mode) ----
  for (const a of ACTS) {
    const v = await pg.evaluate(async act => {
      app.trailAct('honey|' + act); await new Promise(r => setTimeout(r, 900));
      const bt = [...document.querySelectorAll('button')].find(x => /Run away/i.test(x.textContent));
      if (bt) { bt.click(); await new Promise(r => setTimeout(r, 300)); }
      return {
        pano: !!document.querySelector('.mw-board img[src*="map-' + act + '-pano"]'),
        lms: document.querySelectorAll('.mw-lm').length,
        heroes: document.querySelectorAll('.mw-hero').length,
        pokes: document.querySelectorAll('.mw-poke').length,
        wander: !!document.querySelector('.mw-wander'),
        wx: !!document.querySelector('.mw-wx'),
        twinks: document.querySelectorAll('.mw-twink').length,
      };
    }, a);
    ok(v.pano, a + ' rides its own panorama');
    ok(v.lms >= 1 && v.heroes >= 1, a + ' fields its landmark and hero (' + v.lms + ' lm, ' + v.heroes + ' hero)');
    ok(v.pokes >= 10 && v.wander && v.wx, a + ' has pokes (' + v.pokes + '), the wanderer and today\'s weather');
    ok(v.twinks >= 3, a + ' twinkles (' + v.twinks + ')');
  }

  // ---- the strait's lighthouse hero is ANCHORED: halo on the painting ----
  const anch = await pg.evaluate(async () => {
    app.trailAct('honey|strait'); await new Promise(r => setTimeout(r, 700));
    const h = document.querySelector('.mw-hero.anch');
    return { there: !!h, halo: !!(h && h.querySelector('.mw-lm-halo')), img: !!(h && h.querySelector('img')) };
  });
  ok(anch.there && anch.halo && !anch.img, 'the strait\'s painted lighthouse IS the hero — halo + label, no sprite duplicate');

  // ---- the reveal law holds off-meadow: a child who just FINISHED the
  //      meadow arrives in the library and sees its first stretch, windowed ----
  const freshLeg = await pg.evaluate(async () => {
    // walk the whole meadow for real-shaped data: units are sequential (u1…),
    // a checkpoint stands after every 4th (id 'meadow:4', 'meadow:8', …)
    app.trailAct('honey|meadow'); await new Promise(r => setTimeout(r, 700));
    const mwStops = document.querySelectorAll('.atlas-stop').length;
    const mwChks = document.querySelectorAll('.atlas-stop.chk').length;
    const units = mwStops - mwChks;
    const c = state.children[0]; c.trail = c.trail || {};
    c.trail.done = {}; for (let i = 1; i <= units; i++) c.trail.done['u' + i] = { 1: 85 };
    c.trail.chk = {}; for (let k = 4; k <= units; k += 4) c.trail.chk['1:meadow:' + k] = 80;
    state.devUnlock = false;
    app.trailBack(); await new Promise(r => setTimeout(r, 200));
    app.trailAct('honey|library'); await new Promise(r => setTimeout(r, 1100));
    const stops = document.querySelectorAll('.atlas-stop').length;
    const all = 15;
    const sign = (document.querySelector('.mw-sign span') || {}).textContent || '';
    state.devUnlock = true;
    c.trail.done = {}; c.trail.chk = {};
    return { stops, all, sign };
  });
  ok(freshLeg.stops >= 2 && freshLeg.stops < freshLeg.all, 'arriving in the library shows its first stretch, not the act (' + freshLeg.stops + ' of ' + freshLeg.all + ' stops)');
  ok(/Reading Halls|Ink Gardens|Grand Archive|Front Steps/.test(freshLeg.sign), 'the bend teases the library\'s OWN next country (' + freshLeg.sign.trim() + ')');

  // ---- a landmark side round in the library, spoken in library verbs ----
  const lm = await pg.evaluate(async () => {
    app.trailAct('honey|library'); await new Promise(r => setTimeout(r, 600));
    const c = state.children[0]; const coins0 = c.coins || 0;
    app.mwLmk('0'); await new Promise(r => setTimeout(r, 1100));
    const q = state.tq; if (!q || q.side !== 0) return { open: false };
    const themed = /Shelve|volume/i.test(document.body.textContent);
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
    return { open: true, pure: true, themed, over: state.tq.over, paid: (c2.coins || 0) - coins0,
      libMarked: !!((((c2.trail || {}).lv || {}).library || {}).lm || {})[0],
      meadowClean: !((((c2.trail || {}).mw || {}).lm || {})[0]) };
  });
  ok(lm.open && lm.pure, 'the Card Catalogue opens a KIT-ONLY side round');
  ok(lm.themed, 'and it speaks LIBRARY verbs — shelves and volumes, not combs');
  ok(lm.over && lm.paid >= 12, 'clearing it pays the honey trickle (+' + lm.paid + ')');
  ok(lm.libMarked && lm.meadowClean, 'the visit is remembered in the LIBRARY\'s own bucket — the meadow\'s is untouched');

  // ---- a second act keeps a separate bucket the same day ----
  const sep = await pg.evaluate(async () => {
    app.trailAct('honey|forum'); await new Promise(r => setTimeout(r, 600));
    app.mwLmk('0'); await new Promise(r => setTimeout(r, 1100));
    const q = state.tq; if (!q || q.side !== 0) return { open: false };
    const themed = /paving stones|tablet|mosaic/i.test(document.body.textContent);
    return { open: true, themed,
      forumClean: !((((state.children[0].trail || {}).lv || {}).forum || {}).lm || {})[0] };
  });
  ok(sep.open && sep.themed, 'the Oracle Fountain opens its round in ROMAN verbs');
  ok(sep.forumClean, 'and the forum\'s bucket is its own — unmarked until the round is won');

  // ---- a storm catch round wears the glyph card, not the meadow butterfly ----
  const glyph = await pg.evaluate(async () => {
    app.trailBack(); await new Promise(r => setTimeout(r, 300));
    app.trailAct('honey|storm'); await new Promise(r => setTimeout(r, 600));
    app.mwLmk('0'); await new Promise(r => setTimeout(r, 1100));
    const q = state.tq; if (!q) return { open: false };
    const body = document.body.textContent;
    return { open: true, orb: /storm orb/i.test(body),
      noWings: !document.querySelector('.kit-fly svg') };
  });
  ok(glyph.open && glyph.orb && glyph.noWings, 'the storm\'s catch round is STORM ORBS — no meadow butterflies in the tempest');

  // ---- the hero challenge pays into the act's own bucket ----
  const hero = await pg.evaluate(async () => {
    app.trailBack(); await new Promise(r => setTimeout(r, 300));
    app.trailAct('honey|junkyard'); await new Promise(r => setTimeout(r, 700));
    app.mwHero('0'); await new Promise(r => setTimeout(r, 1600));
    const q = state.tq;
    return { open: !!(q && q.hero === 0), one: q && q.items.length === 1,
      line: q && /rattles a word apart/.test(q.heroLine || '') };
  });
  ok(hero.open && hero.one && hero.line, 'the junkyard\'s scrap tower answers a tap with its own one-word challenge');

  // ---- the meadow still plays exactly as piloted ----
  const mw = await pg.evaluate(async () => {
    app.trailBack(); await new Promise(r => setTimeout(r, 300));
    app.trailAct('honey|meadow'); await new Promise(r => setTimeout(r, 800));
    return {
      pano: !!document.querySelector('.mw-board img[src*="map-meadow-pano"]'),
      butter: document.querySelectorAll('.mw-butter').length,
      bees: document.querySelectorAll('.mw-workbee').length,
      heroes: document.querySelectorAll('.mw-hero').length,
      lms: document.querySelectorAll('.mw-lm').length,
    };
  });
  ok(mw.pano && mw.butter >= 3 && mw.bees >= 3, 'the meadow keeps its butterflies and worker bees (only the meadow has them)');
  ok(mw.heroes === 4 && mw.lms === 4, 'the meadow keeps all four heroes and four landmarks');

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
  await b.close();
  process.exit(fails ? 1 : 0);
})();
