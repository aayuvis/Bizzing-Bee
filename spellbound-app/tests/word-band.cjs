/* THE WORD BANDS — ONE MODEL, INSIDE THE ONE DOOR (the 4.5 brief, P1.1–P1.6 and P1.11, 10 Oct 2026) — @check

   The audit saw Easy serve adult words ("premiers", "microbial", "bel", "throes"), the feed and the word of the
   hour ignore the child's band, and every game choose its own window. Now every served word has a band 1–4
   (wordband-data.js, cut by tools/wordband/build.cjs from tools/wordband/formula.cjs), every child has a band
   (SB_BAND.child: age band, Atlas region, recent accuracy), and every pool that puts a word in front of a child
   draws through it — inside nextWords, the one door (owner, 10 Oct 2026). This runs the real code:

     data      wordband-data.js is exactly what the formula says today (every word recomputed), the per-record
               half of the formula is wordband.js's own (one copy), every band is deep enough to play, each word
               on a sourced grade list sits at or below its list's band, every word sits at or below its record's
               own ceiling (what the page uses before the file lands), the Atlas floors are the grade map's
     words     premiers, microbial, bel, throes, racially and maggots are each above band 1
     child     the four bands from the age band; the Atlas raising an 8–10 child who reached The Sprints; recent
               accuracy moving a band up and down
     door      nextWords cut out of app3.js by its own first and last lines and run over the served corpus with the
               real kid-safe.js, wordband.js and the band file: for a child of each band, 1,000 Easy draws for the
               Spelling Gym (the in-round climb running −1/0/+1), Word Lore, Bee Grand Prix (its origin asks too),
               Type Blaster, the Mock Bee and a Theme Journey draw, and 1,000 words of Daily Bee's day lists — 0 above the
               child's band, and the six words never — then Medium, Hard and Champ for the record
     games     the Analogies clock and the Mock Analogy Bee (analogy.js run in a sandbox) at the same rule; Champ
               Dictation's hard list keeps nothing on Easy and falls back to the door
     hour      the word of the hour (app3's own code) for 1,000 hours a band: in the child's band, never above
     feed      My Feed (bee-feed.js run in a sandbox over the built cards): every word card carries its word's
               band, a child's pool holds nothing above their band, and the top band's sessions are mostly
               top-band words (P1.5); the feed's levels are the Atlas's regions read from the same source (P1.11)
     wiring    every game's lazy group brings the band file; wordband.js is a boot script and reads no corpus
   Prints the distribution per game and band.

   Proved by breaking (10 Oct 2026, each applied, run and put back by a script; failing checks in brackets):
     · nwPool returning its pool without nwBand()              → 4 fail [door: band-3/4 words on Easy for every
                                                                  game · the six words drawn from the child's own
                                                                  words · the band window moves the draw · wiring]
     · SB_BAND.win giving Easy the window 1 … band             → 2 fail [door: anzac… on Easy at band 2 · the Mock
                                                                  Analogy Bee on Easy above band 1]
     · nwDaily keyed on the age band's y-window again          → 2 fail [vocalists (band 3) at band 1 · Daily Bee
                                                                  14/1000 in band at band 1]
     · bee-feed.js pool() without its band filter              → 2 fail [feed: sound-alike cards above band 1 ·
                                                                  wiring]
     · wohPool(b) by band ≤ b instead of == b                  → 2 fail [hour: 560/1000 in band at band 2 · wiring]
     · analogy.js startClock without bandIds()                 → 1 fail [the wiring check names the clock]
     · throes moved by hand from band 3 to band 1 in the file  → 3 fail [the stamp · "throes 1→3" · throes drawn
                                                                  on Easy]
   Run: node tests/word-band.cjs   (~1 minute: about 900 calls into the real door)                          */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const some = (a) => (a.length ? ' — ' + a.slice(0, 12).join(' ') + (a.length > 12 ? ' …(' + a.length + ')' : '') : '');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SIX = ['premiers', 'microbial', 'bel', 'throes', 'racially', 'maggots'];

const C = require(path.join(ROOT, 'tools', 'feed-corpus.cjs')).load();   // the corpus, loaded as the page loads it
const app3 = read('app3.js');
/* app3's strike lists, read out of the source the page runs */
const A0 = { window: {} }; vm.createContext(A0);
vm.runInContext(app3.slice(app3.indexOf('const SB_UNSAFE_RE'), app3.indexOf('function mergeHard(')) + ';this.__={SB_UNSAFE_RE,CORE_STRIKE,CORE_CUT};', A0);
const { SB_UNSAFE_RE, CORE_STRIKE, CORE_CUT } = A0.__;
/* the page's band model, on the page's corpus window */
function withBand(W) {
  vm.runInContext(read('wordband.js'), W, { filename: 'wordband.js' });
  vm.runInContext(read('wordband-data.js'), W, { filename: 'wordband-data.js' });
  return W.SB_BAND;
}
const PW = C.win; vm.createContext(PW); const S = withBand(PW);

/* ================================================================ 1. the data */
const BUILD = require(path.join(ROOT, 'tools', 'wordband', 'build.cjs')), F = require(path.join(ROOT, 'tools', 'wordband', 'formula.cjs'));
const { out } = BUILD.compute(ROOT), fresh = BUILD.encode(out, ROOT), SH = PW.SB_WORDBAND;
ok(S.ready() && SH.n === fresh.n && SH.v === fresh.v, `wordband-data.js is what the formula says today (${SH.n} words, v ${SH.v}${SH.v === fresh.v ? '' : ' — fresh v ' + fresh.v + ': run node tools/wordband/build.cjs'})`);
ok(BUILD.stamp(SH.b, SH.atlas) === SH.v && [1, 2, 3].every((b) => SH.b[b].split('|').length === SH.counts[b]) && !SH.b[1].split('|').some((w) => SH.b[2].indexOf('|' + w + '|') >= 0),
  'the shipped lists are the ones it was stamped with — a hand edit to the file changes its stamp');
const off = []; out.forEach((s, w) => { if (S.of(w) !== s.band) off.push(w + ' ' + S.of(w) + '→' + s.band); });
ok(!off.length, `every one of the ${out.size} words reads the band the formula gives it` + some(off));
ok([1, 2, 3, 4].every((b) => SH.counts[b] >= 5000), 'every band is deep enough to play: ' + [1, 2, 3, 4].map((b) => 'band ' + b + ' ' + SH.counts[b]).join(' · '));
const fsrc = read('tools/wordband/formula.cjs');
ok(/PB\.local\(r\)/.test(fsrc) && !/LEN_STEP\s*=\s*0/.test(fsrc) && /K\.CUT/.test(read('wordband.js')), 'the formula\'s per-record half is wordband.js\'s own (formula.cjs runs the page file; no second copy of a constant)');
const anchors = F.gradeAnchors(ROOT), badA = [];
anchors.forEach((a, w) => { const s = out.get(w); if (s && s.band > a.band) badA.push(w + ' ' + s.band + '>' + a.band); });
ok(anchors.size >= 40 && !badA.length, `each of the ${anchors.size} words on a sourced grade list (England's statutory lists, the Common Core's example words — grade-map.json) is at or below its list's band` + some(badA));
const ceil = []; const seen = new Set();
for (const r of C.DATA) { const k = String(r.w || '').toLowerCase(); if (!k || seen.has(k)) continue; seen.add(k); if (S.of(k) > S.bounds(r).hi) ceil.push(k); }
ok(!ceil.length, `every word is at or below its own record's ceiling — the page's careful answer before the file lands (${seen.size} records)` + some(ceil));
ok(JSON.stringify(SH.atlas) === JSON.stringify(F.atlasFloors(ROOT)) && SH.atlas.sprints === 2 && SH.atlas.meadow === 1, 'the Atlas floors are the grade map\'s: ' + JSON.stringify(SH.atlas));

/* ================================================================ 2. the six words */
const six = SIX.map((w) => { const s = out.get(w); return { w, band: s ? s.band : null, s }; });
ok(six.every((x) => x.band >= 2), 'the six words the audit saw on Easy are each above band 1: ' + six.map((x) => x.w + ' ' + x.band + ' (S ' + (x.s && x.s.S) + (x.s && x.s.layers.length ? ', ' + x.s.layers.map((l) => l.rule + '>' + l.stem).join(' ') : '') + ')').join(' · '));

/* ================================================================ 3. children */
const AGE = app3.slice(app3.indexOf('const AGE_BANDS=['), app3.indexOf('function setAgeBand('));
const att = (n, acc) => Array.from({ length: n }, (_, i) => ({ b: 3, ok: i < Math.round(n * acc) ? 1 : 0, wt: 1 }));
/* the units of the Word Atlas up to (not including) a region: a child who has walked them is IN that region */
const roadTo = (actId) => { const ns = PW.SB_TRAIL_ROAD.nodes(PW.SB_TRAIL, 'honey', 1), d = {}; for (const n of ns) { if (n.act === actId) break; if (n.kind === 'unit') d[n.u.id] = 1; } return d; };
const KIDS = {
  1: { name: 'Band One', ageBand: '8-10', age: 9 },
  2: { name: 'Band Two', ageBand: '11-13', age: 12 },
  3: { name: 'Band Three', ageBand: '11-13', age: 12, attempts: att(40, 0.95) },
  4: { name: 'Band Four', ageBand: '14-18', age: 16 } };
let cur = KIDS[1];
vm.runInContext(AGE + ';this.ageBandOf=ageBandOf;', PW);
PW.active = () => cur;
const checks = [[KIDS[1], 1, '8–10'], [KIDS[2], 2, '11–13'], [KIDS[3], 3, '11–13 with 95% of 40 answers right'], [KIDS[4], 4, '14–18'],
  [{ ageBand: '8-10', age: 9, trail: { done: roadTo('sprints'), lap: 1 } }, 2, '8–10 who has reached The Sprints'],
  [{ ageBand: '11-13', age: 12, attempts: att(40, 0.45) }, 1, '11–13 with 45% of 40 answers right'],
  [{ ageBand: '14-18', age: 16, attempts: att(20, 0.2) }, 4, '14–18 with only 20 answers (too few to move)']];
const got = checks.map(([c, want, what]) => { const ch = S.child(c); return { what, want, band: ch.band, ok: ch.band === want }; });
ok(got.every((g) => g.ok), 'the child\'s band — age band, Atlas region, recent accuracy: ' + got.map((g) => g.what + ' → ' + g.band + (g.ok ? '' : ' (want ' + g.want + ')')).join(' · '));

/* ================================================================ 4. the door, run */
const A = app3.indexOf('let _corpusBands = null;'), B = app3.indexOf('window.nextWords=nextWords;');
ok(A > 0 && B > A, 'app3.js still holds the door between `let _corpusBands` and `window.nextWords=nextWords`');
const DOOR = app3.slice(A, B + 'window.nextWords=nextWords;'.length);
const TRICK = app3.slice(app3.indexOf('let _homIdx=null;'), app3.indexOf('window.SB_TRICK=') ) + 'window.SB_TRICK={diff:spellDiff};';
/* a seeded shuffle: the sample is spread, and the same on every run */
let seed = 7; const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296; };
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const DW = { console, Math, Object, Set, Map, Array, String, Number, RegExp, JSON, Date };
DW.window = DW; vm.createContext(DW);
DW.SB_DATA = { nsf: C.DATA }; DW.SB_HOM = PW.SB_HOM || []; DW.SB_TRAIL = PW.SB_TRAIL; DW.SB_TRAIL_ROAD = PW.SB_TRAIL_ROAD;
DW.SB_UNSAFE_RE = SB_UNSAFE_RE; DW.SB_CORE_STRIKE = CORE_STRIKE; DW.SB_WORDS_HELD = PW.SB_WORDS_HELD || [];
vm.runInContext(read('kid-safe.js'), DW, { filename: 'kid-safe.js' });
/* the list's answer for a record and an age never changes inside one run: remember it, so 1,000 draws a band take
   seconds (the door asks kidSafe of every word in its window on every call) */
{ const K0 = DW.SB_KID_SAFE.check.bind(DW.SB_KID_SAFE), KM = new WeakMap();
  DW.SB_KID_SAFE.check = (w, age) => { if (!w || typeof w !== 'object') return K0(w, age); let m = KM.get(w); if (!m) KM.set(w, (m = {}));
    return m[age] !== undefined ? m[age] : (m[age] = K0(w, age)); }; }
const DS = withBand(DW);
/* the child's own words (gameWords): six of them are the audit's six, which the band must still keep off Easy */
const PERSONAL = SIX.map((w) => C.WORD[w]).filter(Boolean).concat(shuffle(C.DATA.filter((r) => r && /^[a-z]+$/.test(r.w))).slice(0, 30));
Object.assign(DW, { active: () => cur, state: { missedWords: [] }, nkey: (w) => String(w || '').toLowerCase().trim(), sample: (a, n) => (n ? shuffle(a).slice(0, n) : shuffle(a)),
  safeWord: (w) => !!(w && w.w), beeBand: (c) => ({ band: (c || cur).band || 2 }), gameWords: () => PERSONAL.slice(), wordIndex: () => null, mastDay: () => 0,
  themeOf: (id) => (id === 'zz' ? { id: 'zz', name: 'A seeded theme' } : null), themeWords: (id) => (id === 'zz' ? THEME.slice() : []),
  SB_LEVEL: { get: (key) => ((cur.levels || {})[key] || {}).level || 'auto' } });
vm.runInContext(AGE + ';this.ageBandOf=ageBandOf;', DW);
vm.runInContext(TRICK, DW, { filename: 'app3.js (trickiness)' });
vm.runInContext(DOOR, DW, { filename: 'app3.js (the door)' });
const THEME = shuffle(C.DATA.filter((r) => r && /^[a-z]+$/.test(r.w) && r.d && r.d.length > 4)).slice(0, 400);
const bandOf = (w) => DS.of(w);
const typable = (w) => w && /^[a-z]+$/i.test(w.w) && w.w.length >= 3 && DW.kidSafe(w, cur);
/* each game's own call into the door, as its source makes it (the wiring checks below read those lines) */
const GAMES = {
  'Spelling Gym': (lv, i) => { cur.gameDiff = lv; return DW.nextWords(cur, N, { purpose: 'drill', tier: TIER(i), minLen: 3 }).filter(typable); },
  'Word Lore': (lv) => { cur.levels = { 'lore/meaning': { level: lv } }; return DW.nextWords(cur, N, { purpose: 'lore', key: 'lore/meaning' }); },
  'Bee Grand Prix': (lv, i) => { cur.levels = { beeGrandPrix: { level: lv } }; const o = i % 2 ? { origin: /Greek/, tier: 1 } : {};
    return DW.nextWords(cur, N, Object.assign({ purpose: 'gate', key: 'beeGrandPrix' }, o)); },
  'Type Blaster': (lv) => { cur.gameDiff = lv; const L = { easy: [3, 6], medium: [4, 8], hard: [5, 10], champ: [6, 12] }[lv]; return DW.nextWords(cur, N, { purpose: 'drill', minLen: L[0], maxLen: L[1] }); },
  'Mock Bee': (lv) => { cur.levels = { mockbee: { level: lv } }; return DW.nextWords(cur, N, { purpose: 'contest', key: 'mockbee' }); },
  'Theme Journey': (lv, i) => { cur.gameDiff = lv; return shuffle(DW.nextWords.pool(cur, { purpose: 'drill', theme: 'zz', tier: TIER(i) })).slice(0, N); },
  /* games-daily.js dailyList(): the day's list of 24, read until a word fits the board — 1,000 words is 42 days */
  'Daily Bee': (lv, i) => DW.nextWords(cur, 24, { purpose: 'daily', minLen: 4, maxLen: 8, lemmaOnly: true, date: '2026-' + String(1 + (i % 12)).padStart(2, '0') + '-' + String(1 + Math.floor(i / 12)).padStart(2, '0') }) };
const LV = ['easy', 'medium', 'hard', 'champ'];
/* 50 words a call (a game asks for 6–24; the door's filters are the same whatever n is), and the in-round climb's
   three tiers in turn for the Gym and a theme — so the Easy check covers a round that climbs */
const N = 50, TIER = (i) => [-1, 0, 1][i % 3], CLIMBS = { 'Spelling Gym': 1, 'Theme Journey': 1, 'Bee Grand Prix': 1 };
const dist = {}, above = [], sixSeen = [];
function draws(game, b, lv, n) {
  const words = [], fn = GAMES[game]; let i = 0, idle = 0;
  while (words.length < n && idle < 30) { const got = fn(lv, i++) || []; if (!got.length) idle++; words.push(...got); }
  return words.slice(0, n);
}
const t0 = Date.now();
for (const game of Object.keys(GAMES)) {
  dist[game] = {};
  for (const b of [1, 2, 3, 4]) {
    cur = Object.assign({ gameLog: [] }, KIDS[b]); cur.gameLog = [];
    const levels = game === 'Daily Bee' ? ['easy'] : LV;
    for (const lv of levels) {
      const ws = draws(game, b, lv, lv === 'easy' ? 1000 : 200), row = [0, 0, 0, 0];
      ws.forEach((w) => { row[bandOf(w) - 1]++; });
      dist[game]['b' + b + ' ' + lv] = { n: ws.length, row };
      const hi = DS.win(cur, lv, CLIMBS[game] ? 1 : 0).hi;   /* a climbing game's top tier is its ceiling; Easy's never moves */
      if (lv === 'easy' || game === 'Daily Bee') {
        ws.filter((w) => bandOf(w) > b).forEach((w) => above.push(game + '@' + b + ':' + w.w + '(' + bandOf(w) + ')'));
        if (lv === 'easy' && game !== 'Daily Bee') ws.filter((w) => bandOf(w) > 1).forEach((w) => above.push(game + '@' + b + ' easy:' + w.w));
        if (game !== 'Daily Bee') ws.filter((w) => SIX.includes(w.w)).forEach((w) => sixSeen.push(game + '@' + b + ':' + w.w));
        if (ws.length < (game === 'Theme Journey' ? 100 : 1000)) above.push(game + '@' + b + ' drew only ' + ws.length);
      } else ws.filter((w) => bandOf(w) > hi).forEach((w) => above.push(game + '@' + b + ' ' + lv + ':' + w.w));
    }
  }
}
console.log('\n  distribution — words drawn by band [b1 b2 b3 b4], per game, child band and level (' + ((Date.now() - t0) / 1000).toFixed(1) + 's):');
for (const game of Object.keys(dist)) console.log('    ' + game.padEnd(14) + Object.entries(dist[game]).map(([k, v]) => k.replace(/ (easy|medium|hard|champ)/, (m, l) => ' ' + l[0].toUpperCase()) + ' [' + v.row.join(' ') + ']').join('  '));
console.log('');
ok(!above.length, '1,000 Easy draws per band per game (Daily Bee: 1,000 words of its daily lists) — 0 words above the child\'s band, and Easy is band 1 for every child; Medium/Hard/Champ never above their own window' + some(above));
ok(!sixSeen.length, 'premiers, microbial, bel, throes, racially and maggots never appear on Easy at any band — and they were in the child\'s own words every time (Daily Bee has no Easy: its word is its own band\'s, and the check above holds it to never above the band)' + some(sixSeen));
ok(['Spelling Gym', 'Word Lore', 'Bee Grand Prix', 'Type Blaster', 'Mock Bee'].every((g) => dist[g]['b4 champ'].row[3] > dist[g]['b4 champ'].row[0] && dist[g]['b1 easy'].row[0] === 1000),
  'the band window moves the draw: band-1 Easy is all band 1, band-4 Champ is mostly band 4');
const dB = dist['Daily Bee'];
ok([1, 2, 3, 4].every((b) => dB['b' + b + ' easy'].row[b - 1] >= 950) && /window\.nextWords\(c, 24, \{ purpose: 'daily', minLen: MINL, maxLen: MAXL, lemmaOnly: true, date: date \}\)/.test(read('games-daily.js')),
  'Daily Bee draws its band\'s words (the same list for every child of a band on a date), through the call games-daily.js makes: ' + [1, 2, 3, 4].map((b) => 'band ' + b + ' ' + dB['b' + b + ' easy'].row[b - 1] + '/1000').join(' · '));
/* the brief's pick(child, pool, n) itself: a dictionary-tail list (no entry in the band file) gives Easy nothing */
cur = KIDS[2];
const tail = Array.from({ length: 300 }, (_, i) => ({ w: 'zztail' + String.fromCharCode(97 + (i % 26)) + String.fromCharCode(97 + Math.floor(i / 26)), y: 9 }));
ok(DS.pick(cur, tail, 0, { level: 'easy' }).length === 0 && DS.pick(cur, tail, 0, { level: 'champ' }).length === 300 && DS.pick(cur, C.DATA.slice(0, 2000), 5, { level: 'easy' }).length === 5,
  'pick(child, pool, n): a word with no band is band 4 — Champ Dictation\'s list gives Easy nothing (the Gym then draws through the door) and Champ all of it; n caps the pick');

/* ================================================================ 5. the analogy games */
{
  const W = { console }; W.window = W; vm.createContext(W);
  Object.assign(W, { document: { head: { appendChild() {} }, createElement: () => ({}), getElementById: () => null, querySelector: () => null },
    addEventListener() {}, state: {}, app: {}, active: () => cur, SB_TRAIL: PW.SB_TRAIL, SB_TRAIL_ROAD: PW.SB_TRAIL_ROAD });
  vm.runInContext(read('analogy-data.js'), W, { filename: 'analogy-data.js' });
  vm.runInContext(read('kid-safe.js'), W, { filename: 'kid-safe.js' });
  W.SB_UNSAFE_RE = SB_UNSAFE_RE; W.SB_CORE_STRIKE = CORE_STRIKE;
  W.kidSafe = (w, c) => W.SB_KID_SAFE.check(w, ((c || cur).age) || 9);
  vm.runInContext(AGE + ';this.ageBandOf=ageBandOf;', W);
  const AB = withBand(W);
  W.SB_LEVEL = { get: (key) => ((cur.levels || {})[key] || {}).level || 'auto' };
  vm.runInContext(read('analogy.js'), W, { filename: 'analogy.js' });
  const ids = Object.keys(W.SB_ANALOGY.items), bad = [], rows = [];
  for (const b of [1, 2, 3, 4]) {
    cur = Object.assign({ anl: {} }, KIDS[b]);
    const clock = W.SB_ANL._bandIds(W.SB_ANL._safeIds(ids), 'auto');
    cur.levels = { mockAnalogy: { level: 'easy' } }; const bee = W.SB_ANL._beePool();
    clock.filter((id) => W.SB_ANL._itemBand(id) > b).forEach((id) => bad.push('clock@' + b + ':' + id));
    bee.filter((id) => W.SB_ANL._itemBand(id) > 1).forEach((id) => bad.push('bee easy@' + b + ':' + id));
    if (clock.length < 8 || bee.length < 8) bad.push('band ' + b + ': clock ' + clock.length + ', bee ' + bee.length);
    rows.push('band ' + b + ': clock ' + clock.length + ' items, Easy bee ' + bee.length);
  }
  ok(!bad.length && AB.ready(), 'Analogies: Against the Clock asks no item above the child\'s band and the Mock Analogy Bee on Easy none above band 1 — ' + rows.join(' · ') + some(bad));
}

/* ================================================================ 6. the word of the hour */
{
  const a = app3.indexOf('const _pinned={};'), b = app3.indexOf('// Quote of the hour');
  ok(a > 0 && b > a, 'app3.js holds the word of the hour between `const _pinned` and the quote of the hour');
  const H = { console, Math, Object, Set, Array, String, RegExp, JSON }; H.window = H; vm.createContext(H);
  Object.assign(H, { CORE_STRIKE, CORE_CUT, SB_DATA: { nsf: C.DATA }, SB_GLOSS_OK: PW.SB_GLOSS_OK, SB_WORDS_HELD: PW.SB_WORDS_HELD || [],
    SB_TRAIL: PW.SB_TRAIL, SB_TRAIL_ROAD: PW.SB_TRAIL_ROAD, active: () => cur, SB_UNSAFE_RE, SB_CORE_STRIKE: CORE_STRIKE });
  vm.runInContext(read('kid-safe.js'), H, { filename: 'kid-safe.js' });
  vm.runInContext(AGE + ';this.ageBandOf=ageBandOf;', H);
  withBand(H);
  let T = 0; H.Date = { now: () => T };
  vm.runInContext(app3.slice(a, b) + ';this.__woh=wordOfHour;this.__pool=wohPool;', H);
  const bad = [], rows = [];
  for (const band of [1, 2, 3, 4]) {
    cur = KIDS[band]; const got = [];
    for (let h = 0; h < 1000; h++) { T = (500000 + h) * 3600000; const e = H.__woh(); if (e) got.push(e); }
    const at = got.filter((e) => S.of(e) === band).length;
    got.filter((e) => S.of(e) > band || SIX.includes(e.w)).forEach((e) => bad.push(band + ':' + e.w));
    if (got.length < 1000 || at < 1000) bad.push('band ' + band + ': ' + got.length + ' hours, ' + at + ' in band');
    rows.push('band ' + band + ' ' + at + '/1000 (pool ' + H.__pool(band).length + ')');
  }
  ok(!bad.length, 'the word of the hour, 1,000 hours a band, is always a word of the child\'s band, with the kid-gloss rule: ' + rows.join(' · ') + some(bad));
  /* before the band file lands Home reads each record's ceiling: never above, still the band's */
  const H2 = Object.assign({}, H); delete H2.SB_WORDBAND; vm.createContext(H2); H2.window = H2;
  vm.runInContext('this.SB_WORDBAND=null;', H2);
  vm.runInContext(read('wordband.js'), H2); vm.runInContext(app3.slice(a, b) + ';this.__woh=wordOfHour;', H2);
  const pre = []; for (const band of [1, 2, 3, 4]) { cur = KIDS[band]; for (let h = 0; h < 200; h++) { T = (700000 + h) * 3600000; const e = H2.__woh(); if (e && S.of(e) > band) pre.push(band + ':' + e.w); } }
  ok(!pre.length, 'and before wordband-data.js lands, by each record\'s own ceiling — still never above the band (200 hours a band)' + some(pre));
}

/* ================================================================ 7. My Feed */
{
  const FD = path.join(ROOT, 'feed'), W = { console, Math, Object, Array, String, JSON, Set, Date }; W.window = W; vm.createContext(W);
  vm.runInContext(fs.readFileSync(path.join(FD, 'feed-meta.js'), 'utf8'), W);
  Object.values(W.SB_FEED_META.index).forEach((f) => vm.runInContext(fs.readFileSync(path.join(FD, f), 'utf8'), W));
  Object.values(W.SB_FEED_META.body).forEach((f) => vm.runInContext(fs.readFileSync(path.join(FD, f), 'utf8'), W));
  const keys = W.SB_FEED_META.keys, wbAt = keys.indexOf('wb'), keyAt = keys.indexOf('key'), kindAt = keys.indexOf('kind');
  const rows = [].concat(...Object.values(W.SB_FEED_IDX));
  const wrong = [], missing = [];
  rows.forEach((r) => { const k = r[keyAt]; if (k && /^word:/.test(k)) { if (r[wbAt] == null) missing.push(r[0]); else if (r[wbAt] !== S.of(k.slice(5))) wrong.push(r[0] + ' ' + r[wbAt] + '≠' + S.of(k.slice(5))); }
    if (r[kindAt] === 'analogy' && /^aq-/.test(r[0]) && r[wbAt] == null) missing.push(r[0]); });
  ok(wbAt >= 0 && !wrong.length && !missing.length, `every card about a word carries its word's band (${rows.filter((r) => r[wbAt] != null).length} of ${rows.length} cards)` + some(wrong.concat(missing)));
  /* bee-feed.js, run */
  Object.assign(W, { document: { addEventListener() {}, querySelector: () => null, createElement: () => ({ setAttribute() {} }), head: { appendChild() {} } },
    state: {}, active: () => cur, SB_TRAIL: PW.SB_TRAIL, SB_TRAIL_ROAD: PW.SB_TRAIL_ROAD, SB_ANL_OPEN: () => true });
  vm.runInContext(AGE + ';this.ageBandOf=ageBandOf;', W);
  withBand(W);
  vm.runInContext(read('bizzing-feed.js'), W, { filename: 'bizzing-feed.js' });
  vm.runInContext(read('bee-feed.js'), W, { filename: 'bee-feed.js' });
  const FEED = W.SB_FEED, bad = [], lines = [];
  for (const b of [1, 2, 3, 4]) {
    cur = KIDS[b]; const row = [0, 0, 0, 0]; let n = 0;
    for (let L = 1; L <= 9; L++) {
      const items = FEED.pool(L, b);
      items.filter((it) => it.wb && it.wb > b).forEach((it) => bad.push('pool L' + L + '@' + b + ':' + it.id));
      for (let d = 0; d < 6; d++) {
        const list = W.BZ_FEED.feedFor({ items, band: W.ageBandOf(cur).k, now: Date.UTC(2026, 9, 1 + d * 5 + L), signals: [], due: {}, seen: {}, level: L,
          extra: (it) => (it.wb && it.wb === b ? { s: 0.75 } : null), levelName: (n) => 'L' + n });
        list.forEach((x) => { const it = items.find((i) => i.id === x.id); if (it && it.wb) { row[it.wb - 1]++; n++; if (it.wb > b) bad.push('session L' + L + '@' + b + ':' + it.id); } });
      }
    }
    lines.push('band ' + b + ' [' + row.join(' ') + '] of ' + n + ' word cards');
    if (b === 4 && !(row[3] > row[2] && row[3] > row[1] + row[0])) bad.push('the top band\'s sessions are not mostly top-band words');
  }
  console.log('    My Feed (54 sessions a band, word cards by band):  ' + lines.join('  '));
  ok(!bad.length, 'My Feed holds no word card above the child\'s band, and the top band reads top-band words first (P1.5)' + some(bad));
  ok(W.SB_FEED_META.levels.map((l) => l.id).join() === PW.SB_TRAIL.honey.acts.map((a) => a.id).join() && /R = W\.SB_TRAIL_ROAD/.test(read('wordband.js')) && /R\.nodes\(T, 'honey', 1\)/.test(read('wordband.js')),
    'the feed\'s levels are the Atlas regions, in road order, and the child\'s region is read from the board\'s own road (trail-road.js) — P1.11');
}

/* ================================================================ 8. wiring */
{
  const idx = read('index.html'), lazy = read('boot-lazy.js'), wb = read('wordband.js');
  ok(/<script defer src="wordband\.js\?v=[^"]+"><\/script>/.test(idx) && idx.indexOf('src="wordband.js') < idx.indexOf('src="app3.js') && !/wordband-data\.js/.test(idx),
    'wordband.js is a boot script before app3.js; wordband-data.js is never in index.html');
  const groups = ['arcade', 'feed', 'quizhubs', 'gym', 'mockbee', 'daily', 'analogy'].filter((g) => !new RegExp('\\b' + g + ": \\[[^\\]]*'wordband'").test(lazy));
  ok(/wordband: 'wordband-data\.js'/.test(lazy) && !groups.length, 'every game\'s lazy group and the feed\'s brings the band file (arcade, feed, quizhubs, gym, mockbee, daily, analogy)' + some(groups));
  ok(!/SB_DATA|corpusSlice|corpusBands|SB_FULL|words-full|nextWords\(/.test(wb.replace(/\/\*[\s\S]*?\*\//g, '')), 'wordband.js reads no corpus and draws no word — it filters what the one door hands it');
  const door = DOOR;
  ok(/return BW\?nwBand\(c,o,pool\):pool;/.test(door) && /if\(BW\) return nwBand\(c,o,all,10\);/.test(door) && /SB_BAND\.child\(c\)\.band/.test(door),
    'nextWords: the pool, a theme\'s pool and Daily Bee\'s word all go through the band model');
  const gym = read('gym.js'), anl = read('analogy.js'), feed = read('bee-feed.js'), bf = read('tools/build-feed.cjs');
  ok(/SB_BAND\.pick\(kid\(\), slice, 0, \{ level: lvResolve\(level\), tier: tier \}\)/.test(gym) && /if \(!slice\.length\) return draw\(1,/.test(gym), 'Champ Dictation\'s hard list is banded, and an empty window draws through the door');
  ok(/const safe = bandIds\(safeIds\(pool\), 'auto'\)/.test(anl) && /return bandIds\(safeIds\(\[\.\.\.ids\]\), L\)/.test(anl), 'the Analogies clock and the Mock Analogy Bee pools are banded');
  ok(/it\.wb >= w\.lo && it\.wb <= w\.hi/.test(feed) && /WB\.of\(it\.key\.slice\(5\)\)/.test(bf), 'My Feed filters by the band the build cut onto each card');
  ok(/if\(window\.SB_BAND\)\{ const b=wohBandNow\(\)/.test(app3) && /\(on\?B\.of\(e\):B\.bounds\(e\)\.hi\)===b/.test(app3), 'the word of the hour is picked for the child\'s band');
}

console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
