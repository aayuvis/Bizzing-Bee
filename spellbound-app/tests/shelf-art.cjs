/* THE SHELF'S 23 SPINES ACTUALLY LOAD.

   They did not, on the live site, for seventeen days. `--exclude=./app-art/spines`
   sat in both deploy scripts, so every published build drew 23 book titles over 23
   broken images. Nothing caught it:

     · the deploy's asset-reference step greps index.html and boot-lazy.js for
       LITERAL paths, and `libShelf()` builds `app-art/spines/<slug>.png` from
       SB_SHELF at render time — there is no literal path anywhere to grep;
     · the <img> carries loading="eager" and NO onerror, so a missing file is loud
       on screen and silent everywhere else;
     · every headless test loaded the SOURCE folder, where the files have always
       been there.

   The deploy scripts now count the art trees, which catches it from the build side.
   This catches it from the app's side — a file that ships but whose path the code no
   longer asks for, or a slug table that drifts from the files on disk. Point it at a
   deploy tree with SHELF_SRC to check what was actually published:

     SHELF_SRC=/path/to/gh-pages-worktree node tests/shelf-art.cjs

   It walks the real front door — landing, account, onboarding, Library — because
   that is the only way to reach the shelf, and a break anywhere along it is worth
   knowing about too.                                                              */
const { chromium } = require('playwright');
const SRC = process.env.SHELF_SRC || require('path').resolve(__dirname, '..');
let fails = 0;
const ok = (b, msg) => { console.log((b ? '  OK   ' : '  FAIL ') + msg); if (!b) fails++; };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => require('fs').existsSync(p)) });
  const pg = await b.newPage({ viewport: { width: 1320, height: 940 } });
  const errs = [], failed = [];
  pg.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  pg.on('requestfailed', r => {
    const u = r.url();
    if (!/raw\.githubusercontent|\/voice\//.test(u)) failed.push(u.split('/').pop().slice(0, 50));
  });
  console.log('\n  tree: ' + SRC + '\n');
  await pg.goto('file://' + SRC + '/index.html');
  await pg.waitForTimeout(7000);

  const vis = 'x => x && x.offsetParent !== null';
  await pg.evaluate(() => {
    const b = [...document.querySelectorAll('a,button')].find(x => /start free/i.test(x.textContent || ''));
    if (b) b.click();
  });
  await pg.waitForTimeout(2500);
  await pg.evaluate(() => {
    const set = (el, v) => { if (!el) return; el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); };
    set([...document.querySelectorAll('input')].find(x => /email/i.test(x.type + x.placeholder + x.name)), 'parent@example.com');
    set([...document.querySelectorAll('input')].find(x => x.type === 'password'), 'hunter2hunter2');
    const go = [...document.querySelectorAll('button')].find(x => /create account/i.test(x.textContent || ''));
    if (go) go.click();
  });
  await pg.waitForTimeout(4000);

  /* onboarding is three steps and onbNext REFUSES each one until its choice is made
     — a name, then a world (the Hive only LOOKS preselected), then a daily goal. */
  for (let i = 0; i < 8; i++) {
    await pg.evaluate(() => {
      const vis = el => el && el.offsetParent !== null;
      const t = [...document.querySelectorAll('input[type=text],input:not([type])')].find(vis);
      if (t && !t.value) { t.value = 'Ahana'; t.dispatchEvent(new Event('input', { bubbles: true })); }
      const band = [...document.querySelectorAll('button,label,[role=button]')].find(x => vis(x) && /school bee age/i.test(x.textContent || ''));
      if (band) band.click();
      const world = [...document.querySelectorAll('[data-act="onbWorld"]')].find(vis);
      if (world) world.click();
      const goal = [...document.querySelectorAll('[data-act="pickGoal"]')].find(vis);
      if (goal) goal.click();
      const nx = [...document.querySelectorAll('[data-act="onbNext"]')].filter(vis).pop();
      if (nx) nx.click();
    });
    await pg.waitForTimeout(2200);
    if (await pg.evaluate(() => [...document.querySelectorAll('button,a')].some(x => /^Library$/i.test((x.textContent || '').trim())))) break;
  }
  await pg.waitForTimeout(3000);

  const home = await pg.evaluate(() => [...document.querySelectorAll('button,a')]
    .map(x => (x.textContent || '').trim())
    .filter(t => /^(Home|Word Atlas|Word Gym|Library|Play)$/.test(t)));   // the Practice tab is the Word Gym (owner, 4 Oct 2026)
  ok(new Set(home).size === 5, `the five tabs are there after onboarding — ${[...new Set(home)].join(' · ') || 'NONE'}`);

  await pg.evaluate(() => {
    const l = [...document.querySelectorAll('button,a')].find(x => x.offsetParent && /^Library$/i.test((x.textContent || '').trim()));
    if (l) l.click();
  });
  await pg.waitForTimeout(5000);

  const shelf = await pg.evaluate(() => {
    const im = [...document.querySelectorAll('img[src*="app-art/spines/"]')];
    return {
      n: im.length,
      loaded: im.filter(x => x.complete && x.naturalWidth > 0).length,
      broken: im.filter(x => x.complete && x.naturalWidth === 0).map(x => x.src.split('/').pop()).slice(0, 6),
      titles: [...document.querySelectorAll('.bk-title,.lib-spine-t')].length,
    };
  });
  await b.close();

  ok(shelf.n >= 20, `the shelf draws its spines — ${shelf.n} <img> under app-art/spines/`);
  ok(shelf.n > 0 && shelf.broken.length === 0,
    shelf.broken.length ? `${shelf.broken.length} spine image(s) failed to load: ${shelf.broken.join(', ')}`
                        : `every spine image loaded (${shelf.loaded}/${shelf.n})`);
  const art = [...new Set(failed)].filter(f => /\.(png|jpg|jpeg|webp|svg)$/i.test(f));
  ok(!art.length, art.length ? `art that 404ed on the way: ${art.slice(0, 6).join(', ')}` : 'no art 404ed anywhere on the route');
  ok(!errs.length, 'no page errors from landing to the Library' + (errs.length ? ': ' + errs[0] : ''));

  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
