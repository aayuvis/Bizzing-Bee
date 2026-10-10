/* A SEEDED BAD WORD CANNOT REACH THE SPELLING GYM, WORD LORE OR THE ANALOGY ATLAS (the 4.5 brief, P0.7) — @check

   tests/word-door.cjs proves there is ONE door (no game reads the corpus except through nextWords) and that
   the kid-safe list holds as data. This proves the door SHUTS, by running it: the real nextWords (app3.js,
   cut out by its own first and last lines and run in a sandbox), the real kid-safe.js beside the page's own
   SB_UNSAFE_RE and CORE_STRIKE, over the whole served corpus with bad words SEEDED into it, at every level
   and purpose the Gym and Lore draw with, for an eight-year-old and a twelve-year-old.

     seeds     stigma headwords (cripple, lunatic, nutter, freak, invalid, spastic, midget, gypped), a clean
               headword whose GLOSS is stigmatising ("a person who is crippled", "suffers from autism",
               "escaped from the mental hospital") — put in every band a level window can reach
     control   with kid-safe.js taken away, the same door DOES serve the seeds: they are reachable, so their
               absence below is the list's doing and not a level window's
     door      no seed, and no served record the stigma list names (headword or gloss), in any pool — drill,
               gate, contest, lore, daily — at any level, for either age; `racially`, `maggot`, `maggots` are
               served to the twelve-year-old and never to the eight-year-old (kid-safe.js `young`: 11–15 only,
               never struck — they are still library records)
     Gym       gym.js draws through nextWords (purposes drill, review, a theme) and its own typable()/queue
               filter asks kidSafe — read from the source
     Lore      lore.js pool()/draw() go through nextWords with purpose 'lore'; its trivia filter (safeTriv, cut
               out of lore.js and run) refuses a question whose prompt, option or fact is on the stigma list,
               or whose quoted word or single-word option fails kidSafe
     Analogy   analogy.js (run in a sandbox) refuses an item any of whose words fails kidSafe — a seeded
               item, and the real items that ask an eight-year-old about murder — and every pool it asks from
               (a stop, a level check, the clock, the Mock Analogy Bee, Meet the words) goes through that filter
     feed      My Feed's analogy cards (the same items) hold to the same rule: no word no game may serve, and
               an under-eleven word bands the card 11–13 and up
   Proved by breaking (10 Oct 2026, in a scratch copy of the tree, each put back): kid-safe.js's stigma family
   renamed away and its whyAll stigma line removed → "door" fails 4 times (27 seeded glosses at both ages;
   committal, neurotic, paralytic, bahuvrihi); `racially` taken off `young` → the age-8 check fails;
   analogy.js itemsFor without safeIds → the Analogy wiring check names itemsFor; safeTriv's stigma line
   removed → the Lore check fails (fact, option, prompt all kept); build-feed's analogy kidSafe filter removed
   and the feed rebuilt → the feed-analogy check fails (aq-154, aq-jp, aq-9z, aq-fd, aq-ra).
   Run: node tests/word-door-seeded.cjs                                                            */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { scan } = require('./lib/js-scan.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const some = (a) => (a.length ? ' — ' + a.slice(0, 10).join(' ') + (a.length > 10 ? ' …(' + a.length + ')' : '') : '');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

const app3 = read('app3.js');
const lit = (start, end) => { const i = app3.indexOf(start); return app3.slice(i + start.length, app3.indexOf(end, i)); };
const UNSAFE = vm.runInNewContext('(' + lit('const SB_UNSAFE_RE=', ';\n') + ')');
const STRIKE = vm.runInNewContext('new Set([' + lit('const CORE_STRIKE = new Set([', ']);') + '])');
const C = require(path.join(ROOT, 'tools', 'feed-corpus.cjs')).load();
const KS = require(path.join(ROOT, 'tools', 'stigma.cjs')).load(ROOT);

/* ---- the seeds ---- */
const SEED_WORDS = ['cripple', 'lunatic', 'nutter', 'freak', 'invalid', 'spastic', 'midget', 'gypped'];
const SEED_GLOSS = [['zzglossa', 'a person who is crippled'], ['zzglossb', 'a child who suffers from autism'], ['zzglossc', 'someone who escaped from the mental hospital']];
const seeds = [];
for (const y of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
  SEED_WORDS.forEach((w) => seeds.push({ w, d: 'a seeded test record, ordinary in every other way', s: 'A seeded sentence.', p: 'X', o: 'Latin', y, ps: 'noun', t: [] }));
  SEED_GLOSS.forEach(([w, d]) => seeds.push({ w: w + 'abcdefghi'[y - 1], d, s: 'A seeded sentence.', p: 'X', o: 'Latin', y, ps: 'noun', t: [] }));   // letters only: the door serves no headword with a digit
}
const seedKey = (w) => SEED_WORDS.includes(w) || /^zzgloss/.test(w);

/* ---- the door, cut out of app3.js by its own first and last lines, run over corpus + seeds ---- */
const A = app3.indexOf('let _corpusBands = null;'), B = app3.indexOf('window.nextWords=nextWords;');
ok(A > 0 && B > A, 'app3.js still holds the door between `let _corpusBands` and `window.nextWords=nextWords`');
const DOOR = app3.slice(A, B + 'window.nextWords=nextWords;'.length);
function door(withList, age, band) {
  const child = { age, band, gameDiff: 'auto', gameLog: [], ageBand: age < 11 ? '8-10' : '11-13' };
  const W = { console, Math, Object, Set, Map, Array, String, Number, RegExp, JSON, Date };
  W.window = W; vm.createContext(W);
  W.SB_DATA = { nsf: C.DATA.concat(seeds) };
  W.SB_UNSAFE_RE = UNSAFE; W.SB_CORE_STRIKE = STRIKE; W.SB_WORDS_HELD = C.win.SB_WORDS_HELD || [];
  if (withList) vm.runInContext(read('kid-safe.js'), W, { filename: 'kid-safe.js' });
  Object.assign(W, { active: () => child, state: { missedWords: [] }, nkey: (w) => String(w || '').toLowerCase().trim(),
    sample: (a, n) => (n ? a.slice(0, n) : a.slice()), safeWord: (w) => !!(w && w.w),
    beeBand: (c) => ({ band: (c || child).band }), ageBandOf: (c) => ({ lo: (c || child).age, k: (c || child).ageBand }),
    gameWords: () => [], themeOf: () => null, themeWords: () => [], wordIndex: () => null, mastDay: () => 0 });
  vm.runInContext(DOOR, W, { filename: 'app3.js (the door)' });
  return { W, child };
}
const PURPOSES = ['drill', 'gate', 'contest', 'lore', 'daily'], LEVELS = ['auto', 'easy', 'medium', 'hard', 'champ'];
function served(withList, age) {
  const got = new Set();
  for (const band of [2, 5, 8]) { const { W, child } = door(withList, age, band);
    for (const purpose of PURPOSES) for (const level of LEVELS) {
      const pool = purpose === 'daily' ? W.nextWords(child, 400, { purpose }) : W.nextWords.pool(child, { purpose, level, key: 'gym/x' });
      pool.forEach((r) => got.add(r.w)); } }
  return got;
}
const ctl = served(false, 8);
const ctlMiss = SEED_WORDS.concat(['zzglossaa', 'zzglossbb', 'zzglosscc']).filter((w) => !ctl.has(w));
ok(!ctlMiss.length, 'control: without kid-safe.js the door DOES serve the seeds — they are reachable at these levels' + some(ctlMiss));
for (const age of [8, 12]) {
  const got = served(true, age);
  ok(got.size > 2000, `age ${age}: the door serves ${got.size} words across ${PURPOSES.length} purposes × ${LEVELS.length} levels × 3 bands`);
  const bad = [...got].filter(seedKey);
  ok(!bad.length, `age ${age}: no seeded stigma word or stigmatising gloss reaches any pool` + some(bad));
  const lib = [...got].filter((w) => { const r = C.WORD[w]; return KS.stigmaHit(w, true) || (r && r.d && KS.stigmaHit(r.d)) || (KS.why({ w }, 99) === 'stigma'); });
  ok(!lib.length, `age ${age}: no served record the stigma list names (headword or gloss) reaches any pool` + some(lib));
  const young = ['racially', 'maggot', 'maggots'].filter((w) => got.has(w));
  if (age < 11) ok(!young.length, 'age 8: racially, maggot and maggots never reach an eight-year-old' + some(young));
  else ok(young.length >= 2, `age 12: they are still served from eleven (${young.join(', ')}) — not struck`);
}
ok(['racially', 'maggot', 'maggots'].every((w) => C.WORD[w] && !STRIKE.has(w)), 'racially, maggot and maggots are still library records and on no strike list');

/* ---- the Gym: through the door, and its own filters ask kidSafe ---- */
const gym = read('gym.js');
ok(/W\.nextWords\(c, Math\.max\([^)]*\), \{ purpose: o\.purpose \|\| 'drill'/.test(gym) && /W\.nextWords\(c, 10, \{ purpose: 'review' \}\)/.test(gym) && /W\.nextWords\.pool\(kid\(\), \{ purpose: 'drill', theme:/.test(gym),
  'Gym: words come through nextWords (drill, review, a theme)');
ok(/const typable = w => [^\n]*kidSafeW\(w\)/.test(gym) && /!kidSafeW\(w\)/.test(gym) && /W\.kidSafe\(w\)/.test(gym), 'Gym: typable() and the review queue ask kidSafe for every word');

/* ---- Word Lore: through the door, and safeTriv run on seeded questions ---- */
const lore = read('lore.js');
ok(/nextWords\.pool\(active\(\), o\)/.test(lore) && /purpose: 'lore'/.test(lore) && /nextWords\(active\(\), n, o\)/.test(lore), 'Lore: pool() and draw() go through nextWords with purpose lore');
{
  const a = lore.indexOf('const QUOTED = '), b = lore.indexOf('function trivDraw(');
  ok(a > 0 && b > a, 'Lore: safeTriv is where it was');
  const { W } = door(true, 8, 5); const K = W.SB_KID_SAFE;
  W.W = W; W.kidSafe = (w) => K.check(w, 8); W.kidOK = (w) => W.kidSafe(w);
  vm.runInContext(lore.slice(a, b) + ';this.__safe = safeTriv;', W);
  const q = (o) => Object.assign({ th: 'words', q: 'Which word means “glad”?', c: ['happy', 'sad', 'tall', 'wet'], f: 'Glad and happy are near.' }, o);
  const verdicts = {
    clean: W.__safe(q({})), fact: W.__safe(q({ f: 'He was a lunatic about trains.' })), option: W.__safe(q({ c: ['happy', 'a crippled man', 'tall', 'wet'] })),
    prompt: W.__safe(q({ q: 'Which word means “glad”, said of a crazy person?' })), quoted: W.__safe(q({ q: 'What does “stupid” mean?' })) };
  ok(verdicts.clean && !verdicts.fact && !verdicts.option && !verdicts.prompt && !verdicts.quoted, 'Lore: safeTriv keeps a clean question and refuses one with a stigmatising fact, option, prompt or quoted word — ' + JSON.stringify(verdicts));
}

/* ---- the Analogy Atlas: analogy.js in a sandbox, a seeded item, and every pool wired to the filter ---- */
{
  const anl = read('analogy.js');
  const S = scan(anl), body = (name) => { const f = S.fns.find((x) => x.name === name); return f ? anl.slice(f.open, f.close) : ''; };
  const wired = ['itemsFor', 'startClock', 'beePool', 'wordsView'].filter((n) => !/safeIds\(/.test(body(n)));
  ok(!wired.length, 'Analogy: a stop, a level check, the clock, the Mock Analogy Bee and Meet the words all ask safeIds' + some(wired));
  for (const age of [8, 12]) {
    const W = { console }; W.window = W; vm.createContext(W);
    Object.assign(W, { document: { head: { appendChild() {} }, createElement: () => ({}), getElementById: () => null, querySelector: () => null },
      addEventListener() {}, state: {}, app: {}, active: () => ({ age, anl: {} }) });
    vm.runInContext(read('analogy-data.js'), W, { filename: 'analogy-data.js' });
    const D = W.SB_ANALOGY;
    D.items.zzseed1 = ['same', 1, 'cripple', 'lame', 'happy|a', 'sad|a', 'tall|a'];
    D.items.zzseed2 = ['same', 1, 'glad', 'happy', 'lunatic|a', 'sad|a', 'tall|a'];
    D.items.zzseed3 = ['same', 1, 'glad', 'happy', 'maggots|a', 'sad|a', 'tall|a'];
    /* the review (10 Oct) cut every real item about murder, so one is seeded: the filter must still refuse it */
    D.items.zzseed4 = ['same', 1, 'glad', 'happy', 'murder|a', 'sad|a', 'tall|a'];
    D.regions[0].stops[0].items.push('zzseed1', 'zzseed2', 'zzseed3', 'zzseed4');
    vm.runInContext(read('kid-safe.js'), W, { filename: 'kid-safe.js' });
    W.SB_UNSAFE_RE = UNSAFE; W.SB_CORE_STRIKE = STRIKE;
    W.kidSafe = (w, c) => W.SB_KID_SAFE.check(w, (c || {}).age || age);
    vm.runInContext(read('analogy.js'), W, { filename: 'analogy.js' });
    const all = Object.keys(D.items), keep = new Set(W.SB_ANL._safeIds(all));
    const murder = all.filter((id) => D.items[id].slice(2).some((x) => String(x).split('|')[0] === 'murder'));
    ok(!keep.has('zzseed1') && !keep.has('zzseed2'), `Analogy, age ${age}: a seeded item with a stigma word as C, answer or wrong answer is never asked`);
    if (age < 11) ok(!keep.has('zzseed3') && murder.includes('zzseed4') && murder.every((id) => !keep.has(id)), `Analogy, age 8: an item with maggots, and the ${murder.length} items about murder (one seeded), are never asked`);
    else ok(keep.has('zzseed3'), 'Analogy, age 12: the item with maggots is asked from eleven');
    ok(keep.size >= all.length - 20, `Analogy, age ${age}: the filter guards without gutting the Atlas — ${keep.size} of ${all.length} items stand`);
  }
  /* My Feed's analogy cards are the same items: none carries a word no game may serve, and one with a word
     held back under eleven is banded 11–13 and up */
  const F = { console }; F.window = F; vm.createContext(F); const FD = path.join(ROOT, 'feed');
  vm.runInContext(fs.readFileSync(path.join(FD, 'feed-meta.js'), 'utf8'), F);
  Object.values(F.SB_FEED_META.body).forEach((f) => vm.runInContext(fs.readFileSync(path.join(FD, f), 'utf8'), F));
  const idxBands = {}; Object.values(F.SB_FEED_META.index).forEach((f) => vm.runInContext(fs.readFileSync(path.join(FD, f), 'utf8'), F));
  Object.values(F.SB_FEED_IDX).forEach((rows) => rows.forEach((r) => { idxBands[r[0]] = r[F.SB_FEED_META.keys.indexOf('bands')]; }));
  const G = C.ANL.gloss || {}, why = (x, a) => KS.why({ w: x, d: G[x] || (C.WORD[x] || {}).d || '' }, a);
  const aq = Object.entries(F.SB_FEED_BODY).filter(([id]) => /^aq-/.test(id));
  const words = (c) => c.play.opts.concat([(c.play.q.match(/ as (\S+) is to …$/) || [])[1]]).filter(Boolean);
  const never = aq.filter(([, c]) => words(c).some((x) => why(x, 99))).map(([id]) => id);
  const young = aq.filter(([id, c]) => words(c).some((x) => why(x, 8)) && (idxBands[id] || []).includes('8-10')).map(([id]) => id);
  ok(aq.length > 1000 && !never.length && !young.length, `Analogy: none of ${aq.length} feed analogy cards carries a word no game may serve, and none with an under-eleven word reaches a younger band` + some(never.concat(young)));
}

console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
