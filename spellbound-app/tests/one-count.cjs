/* ONE COUNT FOR EVERY COLLECTION (audit v4 H2 / A2) — @check

   The same collection printed a different number on every screen: Quotes 1,200 (a figure
   typed into the Library tile) / 135 (the boot file, counted before the library landed) /
   5,189; Trivia 31,147 / 6,604 / 12,462 (whatever level shards were in memory at the time);
   Idioms 2,350 / 2,370; the opening page sold "211 characters … none for sale" against a
   catalogue of 96 that the Shop sells for coins; and Home said "stop 8 of 11" beside a Meadow
   pin on the Atlas that said 13. Every screen now asks SB_COUNT (app3.js), which asks the live
   data. This loads the screens and holds every printed figure to it:
     1. the few figures the opening page cannot count live (SB_FACTS) equal their own files,
        and nothing the page DOES hold is typed there any more;
     2. the opening page: avatars, arcade games, evolution forms and trivia read SB_COUNT, the
        games it shows are the games the arcade has, and avatars are never "not for sale";
     3. the static mirror in index.html (for crawlers) says the same figures;
     4. in the app, a collection still on its way prints NO number (never a partial one), and
        once in, quotes / idioms / trivia agree on the Library, their own page, Progress,
        the Arcade and the trivia hub — the hub's figure does not move as shards land;
     5. Home's stop count is the Atlas's: the badge and the strip name the same stop, and on
        all three tiers every region's count on Home equals its pin on the Atlas.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/one-count.cjs */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const URL = 'file://' + ROOT + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const num = s => +String(s).replace(/[^0-9]/g, '');
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const asNum = s => { const i = WORDS.indexOf(String(s).toLowerCase()); return i >= 0 ? i : num(s); };
const all = (re, t) => [...t.matchAll(re)].map(m => m[1]);
const same = (label, got, want) => ok(got.length > 0 && got.every(v => v === want),
  `${label}: ${got.length ? [...new Set(got)].join(' / ') : 'NOT FOUND'} — one count, ${want}`);

/* ---- 1. SB_FACTS holds only what the opening page cannot count, and holds it right ---- */
const src = fs.readFileSync(path.join(ROOT, 'app3.js'), 'utf8');
const fm = src.match(/const SB_FACTS = (\{[\s\S]*?\n\});/);
const FACTS = fm ? vm.runInNewContext('(' + fm[1] + ')') : {};
const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
['concepts-data.js', 'adv-concepts-data.js', 'scripps-data.js', 'lessons-data.js', 'adv-tips-data.js']
  .forEach(f => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx));
const fileN = { conceptsFree: ctx.SB_CONCEPTS.chapters.length, conceptsAdv: ctx.SB_ADV_CONCEPTS.chapters.length,
  scripps: ctx.SB_SCRIPPS.length, journeys: ctx.SB_LESSONS.lessons.length, techniques: ctx.SB_ADV_TIPS.length };
for (const k in fileN) ok(FACTS[k] === fileN[k], `SB_FACTS.${k} is its file's own count — ${FACTS[k]} vs ${fileN[k]}`);
['avatars', 'engines', 'evoForms', 'trivia', 'triviaThemes', 'packs'].forEach(k =>
  ok(!(k in FACTS), `SB_FACTS no longer types "${k}" (the page holds that data; SB_COUNT counts it)`));
[/1,200 lines/, /2,350 phrases/, /2,000 phrases/, /none for sale/i, /Not one of them for/, /fmtN\(all\.length\)\+' from famous/]
  .forEach(re => ok(!re.test(src), `nothing in app3.js types ${re}`));

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p)) });
  const errs = [];
  const counts = pg => pg.evaluate(() => Object.fromEntries(Object.keys(SB_COUNT).map(k => [k, SB_COUNT[k]()])));

  /* ---- 2. the opening page ---- */
  const lp = await b.newPage({ viewport: { width: 1280, height: 900 } });
  lp.on('pageerror', e => errs.push('landing: ' + e.message));
  await lp.goto(URL);
  await lp.waitForFunction(() => typeof state !== "undefined" && state.screen === 'landing' && typeof SB_COUNT === 'object' && (window.SB_ARCADE_GAMES || []).length, null, { timeout: 30000 });
  /* worlds4.js registers three worlds after app3's first paint, so the evolution count waits
     for it (no number, never "50 … five worlds") and arrives with the next render */
  await lp.waitForFunction(() => window.SB_W4 && /\d+\s+evolution forms/.test(document.body.innerText), null, { timeout: 20000 }).catch(() => {});
  await lp.waitForTimeout(300);
  const C = await counts(lp);
  const TRIV = Math.floor(C.trivia / 1000) * 1000;
  ok(C.avatars === 96 && C.games > 0 && C.evoForms > 0 && C.trivia > 30000, `the live counts are in hand — ${C.avatars} avatars, ${C.games} games, ${C.evoForms} forms, ${C.trivia} trivia`);
  const land = await lp.evaluate(() => ({ t: document.body.innerText,
    shown: [...document.querySelectorAll('figure b')].map(e => e.textContent.trim()),
    live: SB_ARCADE_GAMES.map(g => g.n) }));
  const t = land.t;
  same('landing — avatars ("N characters", "N collectibles")', all(/(\d[\d,]*)\s+(?:characters\b|collectibles)/g, t).map(num), C.avatars);
  same('landing — arcade games', all(/\b(\d+|One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve)\s+(?:arcade|word|distinct) games/gi, t)
    .concat(all(/full arcade: (\d+) games/g, t)).map(asNum), C.games);
  same('landing — evolution forms', all(/(\d[\d,]*)\s+evolution forms/g, t).map(num), C.evoForms);
  same('landing — trivia questions (a floor)', all(/(\d[\d,]*)\s+trivia questions/g, t).map(num), TRIV);
  ok(!/none for sale|not one of them for\s*sale/i.test(t), 'the opening page never says avatars are not for sale (the Shop sells them for coins)');
  /* (follow-up) packs, odds and drops are gone (FIX-BEE v2): nothing on the page may sell them,
     and the collectibles section says what is true — four tiers, fixed coin prices, no chance */
  ok(!/pack drops?|open a pack|drop odds|golden reveal/i.test(t), 'the opening page sells no pack drops (packs and odds are gone)');
  ok(/Common, Rare, Epic and Legendary/.test(t) && /Nothing is drawn at random/.test(t), 'it names the four rarity tiers and says nothing is random');
  /* the two word claims, each one number: the library, and the part of it with a recorded voice */
  same('landing — the library ("over N words and serious bee preparation", the add-on, the table)',
    all(/(?:over|Over) ([\d,]+) words and serious bee/g, t).concat(all(/library of over ([\d,]+) words/g, t), all(/Over ([\d,]+) · [\d,]+ graded/g, t)).map(num), C.library);
  same('landing — the recorded voice ("N words recorded / in one real recorded voice")',
    all(/(?:over|Over) ([\d,]+) words (?:recorded in a real|in one real recorded|are recorded in a real)/g, t).map(num), C.voiced);
  ok(land.shown.length === land.live.length && land.shown.every(n => land.live.includes(n)),
    `the games it shows are the arcade's own — [${land.shown.join(', ')}] vs [${land.live.join(', ')}]`);
  await lp.close();

  /* ---- 3. the static mirror for crawlers says the same ---- */
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  same('index.html mirror — games', all(/\b(\w+) (?:word|distinct) games/gi, html).map(asNum), C.games);
  same('index.html mirror — trivia questions', all(/(\d[\d,]*) trivia questions/gi, html).map(num), TRIV);
  same('index.html mirror — the recorded voice', all(/Over ([\d,]+) words (?:spoken aloud|are recorded in a real|in one real recorded)/g, html).map(num), C.voiced);
  same('index.html mirror — the library', all(/library of over ([\d,]+) words/g, html).concat(all(/Over ([\d,]+) · [\d,]+ graded/g, html)).map(num), C.library);

  /* ---- 4. in the app ---- */
  const pg = await b.newPage({ viewport: { width: 1280, height: 900 } });
  pg.on('pageerror', e => errs.push('app: ' + e.message));
  await pg.goto(URL + '?demo');
  await pg.waitForFunction(() => typeof state !== "undefined" && state.screen === 'app' && typeof SB_COUNT === 'object', null, { timeout: 30000 });
  await pg.waitForTimeout(600);
  const tile = (re) => pg.evaluate(src => { const re = new RegExp(src, 'i'); const el = [...document.querySelectorAll('.lib-tile')].find(e => re.test(e.textContent)); return el ? el.textContent.replace(/\s+/g, ' ') : ''; }, re);
  const body = () => pg.evaluate(() => document.body.innerText);
  const go = async (fn, ms) => { await pg.evaluate(fn); await pg.waitForTimeout(ms || 500); };

  // before the libraries land: no number at all — never the 135 the boot file holds
  const early = await pg.evaluate(() => ({ q: SB_COUNT.quotes(), f: SB_COUNT.idioms() }));
  await go(() => app.setNav('explore'));
  const eq = await tile('Quotes'), ef = await tile('Idioms');
  if (early.q == null) ok(!/\d/.test(eq.replace(/^.*Quotes & Poems/, '')), `Library: the Quotes tile prints no number while the library is on its way — "${eq.slice(0, 80)}"`);
  if (early.f == null) ok(!/\d/.test(ef.replace(/^.*Idioms & Similes/, '')), `Library: the Idioms tile prints no number while the library is on its way — "${ef.slice(0, 80)}"`);
  await go(() => { location.hash = '#/quotes'; }, 150);
  const qEarly = all(/(\d[\d,]*) from famous people/g, await body()).map(num);
  ok(qEarly.every(n => n !== 135), `#/quotes never counts the boot file (135) — saw [${qEarly.join(', ') || 'no number yet'}]`);

  await pg.evaluate(() => new Promise(r => SB_LAZY.need(['quotes', 'figurative'], r)));
  await pg.waitForTimeout(500);
  const C2 = await counts(pg);
  ok(C2.quotes > 4000 && C2.idioms > 2000, `the libraries are in — ${C2.quotes} quotes, ${C2.idioms} idioms`);
  await go(() => app.setNav('explore'));
  const lq = await tile('Quotes'), lf = await tile('Idioms'), lt = await tile('Trivia');
  await go(() => { location.hash = '#/quotes'; }, 700);
  const pq = all(/(\d[\d,]*) from famous people/g, await body()).map(num);
  await go(() => { location.hash = '#/progress'; }, 700);
  const prq = all(/(\d[\d,]*) to explore/g, await body()).map(num);
  await go(() => { location.hash = '#/figurative'; }, 700);
  const pf = all(/(\d[\d,]*) phrases/g, await body()).map(num);
  same('Quotes — Library tile, #/quotes, Progress', all(/(\d[\d,]*) lines/g, lq).map(num).concat(pq, prq), C2.quotes);
  same('Idioms — Library tile, #/figurative', all(/(\d[\d,]*) phrases/g, lf).map(num).concat(pf), C2.idioms);
  await go(() => app.openGames(), 1200);
  const arc = all(/(\d[\d,]*) questions/g, await body()).map(num);
  await go(() => app.openTrivia(), 400);
  const hub1 = all(/(\d[\d,]*) questions/g, await body()).map(num);
  await pg.waitForFunction(() => (SB_TRIVIA.questions || []).length > 0, null, { timeout: 30000 }).catch(() => {});
  await pg.waitForTimeout(800);
  const hub2 = all(/(\d[\d,]*) questions/g, await body()).map(num);
  const inMem = await pg.evaluate(() => SB_TRIVIA.questions.length);
  same(`Trivia — Library tile, Arcade tile, the hub before and after ${inMem} questions landed`,
    all(/(\d[\d,]*) questions/g, lt).map(num).concat(arc, hub1.filter(n => n !== 10), hub2.filter(n => n !== 10)), TRIV);

  /* ---- 5. Home's stop is the Atlas's stop ---- */
  await go(() => app.setNav('home'), 700);
  const home = await pg.evaluate(() => { const c = document.querySelector('.sb-home-next'); return c ? c.textContent.replace(/\s+/g, ' ') : ''; });
  const badge = (home.match(/stop (\d+) · Tier/) || [])[1], strip = home.match(/stop (\d+) of (\d+)/) || [];
  ok(badge && strip[1] && badge === strip[1], `Home's badge and strip name the same stop — "stop ${badge}" / "stop ${strip[1]} of ${strip[2]}"`);
  await go(() => app.openTrail(), 1500);
  const pinNow = await pg.evaluate(() => { const p = [...document.querySelectorAll('.atlas-pin')].find(e => /Meadow/.test(e.getAttribute('aria-label') || ''));
    return p ? p.getAttribute('aria-label') : ''; });
  const pm = pinNow.match(/(\d+)\/(\d+) stops/) || [];
  ok(strip[2] && pm[2] && strip[2] === pm[2], `the Meadow on Home and on the Atlas — Home "of ${strip[2]}", Atlas "${pm[1]}/${pm[2]} stops"`);
  /* the second region, where the whole road's index (stop 14) and the region's (stop 1) part */
  const lib = await pg.evaluate(async () => {
    const c = active(); const T = c.trail; const act = SB_TRAIL.honey.acts[0]; let n = 0;
    act.units.forEach(id => { const u = SB_TRAIL.honey.units.find(x => x.id === id); if (!(u.laps || [u.lap || 1]).includes(1)) return;
      T.done[id] = { 1: 90 }; n++; if (n % 4 === 0) T.chk['1:' + act.id + ':' + n] = 90; });
    app.setNav('home'); await new Promise(r => setTimeout(r, 400));
    const home = (document.querySelector('.sb-home-next') || {}).textContent || '';
    app.openTrail(); await new Promise(r => setTimeout(r, 400));
    const pin = [...document.querySelectorAll('.atlas-pin')].map(e => e.getAttribute('aria-label') || '').find(l => /Great Library/.test(l)) || '';
    return { home: home.replace(/\s+/g, ' '), pin };
  });
  const lb = (lib.home.match(/stop (\d+) · Tier/) || [])[1], ls = lib.home.match(/stop (\d+) of (\d+)/) || [], lpin = lib.pin.match(/(\d+)\/(\d+) stops/) || [];
  ok(/Great Library/.test(lib.home) && lb === ls[1] && ls[2] === lpin[2] && +ls[1] === +lpin[1] + 1,
    `in the Great Library Home's badge, strip and the Atlas pin agree — "stop ${lb}" / "stop ${ls[1]} of ${ls[2]}" / pin "${lpin[1]}/${lpin[2]}"`);
  for (const lap of [1, 2, 3]) {
    const r = await pg.evaluate(async lap => {
      const c = active(); const was = c.trail.lap; c.trail.lap = lap; state.trailCourse = 'honey'; app.openTrail(); render();
      await new Promise(res => setTimeout(res, 300));
      const pins = {}; [...document.querySelectorAll('.atlas-pin')].forEach(e => { const m = (e.getAttribute('aria-label') || '').match(/^\S+ (.+), (\d+)\/(\d+) stops$/); if (m) pins[m[1]] = +m[3]; });
      const out = [];
      for (const act of SB_TRAIL.honey.acts) {
        const name = ((act.title || '').split('·').slice(1).join('·').trim() || act.title).replace(/^The\s+/i, '');
        const u = act.units.map(id => SB_TRAIL.honey.units.find(x => x.id === id)).find(u => u && (u.laps || [u.lap || 1]).includes(lap));
        const rp = u ? regionPos({ kind: 'unit', arg: u.id, lap }) : null;
        out.push({ name, home: rp ? rp.of : null, atlas: pins[name] == null ? null : pins[name] });
      }
      c.trail.lap = was; return out;
    }, lap);
    const bad = r.filter(x => x.home !== x.atlas);
    ok(r.length === 9 && !bad.length, `Tier ${lap}: every region's count on Home is its Atlas pin's — ` +
      (bad.length ? bad.map(x => `${x.name} Home ${x.home} / Atlas ${x.atlas}`).join('; ') : r.map(x => x.name.split(' ')[0] + ' ' + x.atlas).join(', ')));
  }
  await b.close();
  ok(!errs.length, 'no page errors' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
  console.log(fails ? `\n${fails} FAILED` : '\nPASS — one count for every collection, the same on every screen');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
