// Every country's OWN cast. The meadow's butterflies and worker bees belong to
// the meadow; the library gets paper on the air, the storm cliffs get rain and
// bolts, the junkyard gets steam and turning pinwheels, the finish line gets
// confetti. Each country must field several systems (not the two generic ones
// it shipped with), its pokes must shed its own stuff, and each must hide ONE
// buried trove that pays once ever and then stays found.
const { chromium } = require('playwright');
const SRC = process.env.SRC || __dirname + '/..';
let fails = 0;
const ok = (b, msg) => { console.log((b ? '  OK   ' : '  FAIL ') + msg); if (!b) fails++; };

/* what each country must be able to show. Keyed on the LIV key; the value is
   the classes that country's config asks for, so a cast quietly deleted from
   the table fails here rather than going unnoticed on the board. */
const CAST = {
  meadow:        { nav: ['honey', 'meadow'],   want: ['mw-butter', 'mw-workbee', 'mw-petalfall'] },
  library:       { nav: ['honey', 'library'],  want: ['mw-page', 'mw-glow', 'mw-beam'] },
  forum:         { nav: ['honey', 'forum'],    want: ['mw-leaf', 'mw-pennant', 'mw-bird'] },
  storm:         { nav: ['honey', 'storm'],    want: ['mw-rain', 'mw-bolt', 'mw-glow'] },
  roots:         { nav: ['honey', 'roots'],    want: ['mw-glow', 'mw-leaf', 'mw-steam'] },
  strait:        { nav: ['honey', 'strait'],   want: ['mw-bird', 'mw-beam', 'mw-water'] },
  junkyard:      { nav: ['honey', 'junkyard'], want: ['mw-steam', 'mw-spark', 'mw-spin'] },
  sprints:       { nav: ['honey', 'sprints'],  want: ['mw-conf', 'mw-pennant', 'mw-bird'] },
  stage:         { nav: ['honey', 'stage'],    want: ['mw-note', 'mw-conf', 'mw-beam'] },
  proving:       { nav: ['exp', 'proving'],    want: ['mw-spark', 'mw-steam', 'mw-pennant'] },
  greysea:       { nav: ['exp', 'greysea'],    want: ['mw-rain', 'mw-beam', 'mw-water'] },
  liars:         { nav: ['exp', 'liars'],      want: ['mw-spin', 'mw-steam', 'mw-wisp'] },
  grandtrunk:    { nav: ['exp', 'grandtrunk'], want: ['mw-leaf', 'mw-pennant', 'mw-bird'] },
  farflung:      { nav: ['exp', 'farflung'],   want: ['mw-glow', 'mw-water', 'mw-bird'] },
  factory:       { nav: ['exp', 'factory'],    want: ['mw-steam', 'mw-spark', 'mw-spin'] },
  uproving:      { nav: ['ultra', 0],          want: ['mw-spark', 'mw-steam', 'mw-pennant'] },
  ulibrary:      { nav: ['ultra', 1],          want: ['mw-page', 'mw-glow', 'mw-beam'] },
  ucrucible:     { nav: ['ultra', 2],          want: ['mw-spark', 'mw-steam', 'mw-spin'] },
  uobservatory:  { nav: ['ultra', 3],          want: ['mw-star', 'mw-glow', 'mw-beam'] },
  uchampionship: { nav: ['ultra', 4],          want: ['mw-conf', 'mw-note', 'mw-pennant'] },
};

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const pg = await b.newPage({ viewport: { width: 1200, height: 820 } });
  const errs = []; pg.on('pageerror', e => errs.push(String(e.message)));
  await pg.goto('file://' + SRC + '/index.html');
  await pg.waitForTimeout(2600);
  await pg.evaluate(async () => {
    localStorage.setItem('sb_splash', '0');
    state.children = [{ name: 'Ravi', avatar: 'bee', coins: 0, pow: {}, age: 11, lists: { default: { xp: 10 } }, activeList: 'default',
      missed: [], unlockedThemes: [], unlockedConcepts: {}, unlockedLists: {}, questPath: 'journey' }];
    state.activeIdx = 0; state.screen = 'app'; state.devUnlock = true;
    app.openTrail(); await new Promise(r => setTimeout(r, 2200));
  });

  const go = async nav => pg.evaluate(async n => {
    if (n[0] === 'ultra') app.ultraAct(String(n[1]));
    else app.trailAct(n[0] + '|' + n[1]);
    await new Promise(r => setTimeout(r, 1100));
    const bt = [...document.querySelectorAll('button')].find(x => /Run away/i.test(x.textContent));
    if (bt) { bt.click(); await new Promise(r => setTimeout(r, 350)); }
  }, nav);

  // ---- every country fields ITS OWN cast, richly ----
  for (const [key, cfg] of Object.entries(CAST)) {
    await go(cfg.nav);
    const got = await pg.evaluate(w => {
      const out = {};
      w.forEach(cl => out[cl] = document.querySelectorAll('.' + cl).length);
      // how many DISTINCT life systems stand on this board at all
      const all = ['mw-butter', 'mw-petalfall', 'mw-workbee', 'mw-bird', 'mw-seed', 'mw-wisp',
        'mw-page', 'mw-leaf', 'mw-rain', 'mw-bolt', 'mw-glow', 'mw-steam', 'mw-spark',
        'mw-beam', 'mw-spin', 'mw-conf', 'mw-note', 'mw-pennant', 'mw-star', 'mw-water'];
      out._systems = all.filter(cl => document.querySelectorAll('.' + cl).length).length;
      out._pokes = document.querySelectorAll('.mw-poke').length;
      return out;
    }, cfg.want);
    const missing = cfg.want.filter(cl => !got[cl]);
    ok(!missing.length, key + ' fields its own cast (' + cfg.want.join(', ') + ')'
      + (missing.length ? ' — MISSING ' + missing.join(', ') : ''));
    ok(got._systems >= 3, key + ' is alive in more than one way — ' + got._systems + ' systems on the board');
    ok(got._pokes >= 8, key + ' keeps its pokeable things (' + got._pokes + ')');
  }

  // ---- the meadow's own creatures stay home ----
  const leak = await pg.evaluate(async () => {
    const out = {};
    for (const a of ['library', 'storm', 'junkyard', 'stage']) {
      app.trailAct('honey|' + a); await new Promise(r => setTimeout(r, 800));
      out[a] = document.querySelectorAll('.mw-butter, .mw-workbee, .mw-petalfall').length;
    }
    return out;
  });
  ok(Object.values(leak).every(n => n === 0),
    'no butterflies, bees or cherry petals outside the meadow (' + JSON.stringify(leak) + ')');

  // ---- pokes shed the COUNTRY'S own stuff, and every country has a skin ----
  const tj = require('fs').readFileSync(SRC + '/trail.js', 'utf8');
  ok(Object.keys(CAST).every(k => new RegExp("(^|[^a-z])" + k + ":\\s*\\{ g: \\[").test(tj)),
    'every one of the 20 countries has its own poke skin (what it sheds, what its prize is called)');
  const shed = await pg.evaluate(async () => {
    app.trailAct('honey|junkyard'); await new Promise(r => setTimeout(r, 900));
    app.mwPoke('1');
    const el = document.querySelector('.mw-poke[data-arg="1"]');
    const bits = [...(el ? el.querySelectorAll('.mw-burst span') : [])].map(s => s.textContent);
    return { boing: !!(el && el.classList.contains('boing')), bits };
  });
  ok(shed.boing, 'a poked thing still boings');
  ok(shed.bits.length && shed.bits.some(t => t === '⚙️'),
    'and the junkyard sheds GEARS, not meadow petals (' + shed.bits.join('') + ')');

  // ---- the buried trove: pays once, stays found, does not move with the date ----
  const trove = await pg.evaluate(async () => {
    app.trailAct('honey|forum'); await new Promise(r => setTimeout(r, 900));
    const c = state.children[0];
    const p = (c.trail.lv || {}).forum || {};
    delete p.tv;
    // find the seeded trove index the same way the handler does
    const n = document.querySelectorAll('.mw-poke').length;
    let hit = -1, paid = 0;
    const before = c.coins || 0;
    for (let i = 0; i < n; i++) {
      app.mwPoke(String(i));
      await new Promise(r => setTimeout(r, 90));
      const now = state.children[0].coins || 0;
      if (now - before >= 30) { hit = i; paid = now - before; break; }
    }
    const marked = !!(((state.children[0].trail.lv || {}).forum || {}).tv);
    // poke the same spot again — a trove is found for GOOD
    const mid = state.children[0].coins || 0;
    app.mwPoke(String(hit)); await new Promise(r => setTimeout(r, 200));
    const again = (state.children[0].coins || 0) - mid;
    return { hit, paid, marked, again };
  });
  ok(trove.hit >= 0 && trove.paid >= 30, 'one poke in the forum hides a BURIED TROVE (+' + trove.paid + ' honey)');
  ok(trove.marked, 'the trove is recorded as found');
  ok(trove.again === 0, 'and it never pays twice — the only find on the board that does not come back');
  ok(/mwFixed/.test(tj) && /WITHOUT the date/.test(tj),
    'the trove sits still until it is found (seeded off the child, never the date)');

  // ---- the reveal law still holds: nothing of the cast past the earned edge ----
  const law = await pg.evaluate(async () => {
    state.devUnlock = false;
    app.trailAct('honey|storm'); await new Promise(r => setTimeout(r, 1100));
    const bd = document.querySelector('.mw-board');
    const w = bd ? bd.clientWidth : 1;
    const far = [...document.querySelectorAll('.mw-poke, .mw-spin, .mw-beam, .mw-pennant')]
      .filter(el => parseFloat(el.style.left) > 90).length;
    state.devUnlock = true;
    return { far, w };
  });
  ok(law.far === 0, 'no part of the cast is drawn past the camera edge (' + law.far + ' beyond 90%)');

  // ---- both motion guards cover every new system ----
  const idx = require('fs').readFileSync(SRC + '/index.html', 'utf8');
  const NEW = ['mw-page', 'mw-leaf', 'mw-rain', 'mw-bolt', 'mw-glow', 'mw-steam', 'mw-spark',
    'mw-beam', 'mw-spin', 'mw-conf', 'mw-note', 'mw-pennant'];
  ok(NEW.every(cl => idx.includes('.' + cl + '{')), 'every new system is a real CSS system');
  ok(NEW.every(cl => new RegExp('data-motion="off"\\][^{]*\\.' + cl + '\\b').test(idx)
      || idx.includes(':root[data-motion="off"] .' + cl)), 'motion-off names every new system');
  ok(/prefers-reduced-motion[^}]*mw-page[^}]*mw-pennant/s.test(idx.replace(/\n/g, ' ')),
    'and so does the reduced-motion block');
  ok(/\.mw-bolt,:root\[data-motion="off"\] \.mw-rain[^}]*display:none/.test(idx)
      || /mw-bolt,[^{]*mw-rain[^{]*\{display:none\}/.test(idx),
    'the flashing systems HIDE rather than freeze mid-flash (a frozen bolt is a smear)');

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
  await b.close();
  process.exit(fails ? 1 : 0);
})();
