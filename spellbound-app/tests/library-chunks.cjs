/* THE 130k LIBRARY IN LETTERED CHUNKS (road to 4.5, P1.12 — "split words-full.js into lettered lazy chunks;
   dictionary lookups < 1 s") — @check

   words-full.js + words-hard.js stay the SOURCE; the page reads words-full/ (tools/library-chunks.cjs) through
   library.js. A copy is a thing that can drift, so this holds the copy to its source and the page's reader to both:
     1. GENERATED, NEVER TYPED: words-full/ is byte for byte what the tool writes from the two sources today — a
        hand edit, a stale chunk after a library change, or a stray file fails.
     2. THE SAME LIBRARY: library.js itself (run here in a sandbox, chunks fed through a fake boot-lazy) rebuilds
        words-full.js's array and words-hard.js's array EXACTLY — every record, in order.
     3. THE CUT IS A PARTITION BY HEADWORD: bounds rise strictly; each record sits in the chunk its key's bound
        names; a chunk never spans two first letters; and for every headword and every two- and three-letter
        prefix in the library, namesFor() returns chunks that hold ALL of its words; and the LOOKUP — one chunk,
        chunkFor() — holds every headword exactly and the first word of every start (it cannot come back empty).
     4. A LOOKUP IS LIGHT: every chunk, minified and gzipped as the deploy ships it, is ≤ 220 KB, the index ≤ 24 KB,
        library.js ≤ 4 KB — the bytes a Finder lookup pays, against the 11.8 MB of the old single file.
     5. A CHILD SEES THE SAME WORDS EITHER WAY: app3's own two doors, cut out of app3.js and run here — fullAdopt
        (the whole library) and fullChunk (one chunk) — give the same records in the same order (the strike lists,
        CORE_FIX, the stigma pass and the shard's merge cover the lettered door exactly as they cover the whole one).
     6. WIRING: nothing shipped fetches words-full.js or words-hard.js; boot-lazy registers the index and the
        reader (not on the idle queue, not in index.html); app3's loader and both searches go through SB_LIB;
        both deploy scripts leave the two sources out, delete any live copy, and count the chunk tree.
   Proved by breaking (each put back after): a hand edit in one chunk's definition (3 fail: generated, the core
   comes back, the lettered door); library.js rebuilding in letter order instead of the index's (2 fail: core and
   shard come back); a bound inside a letter nudged one letter on (2 fail: generated, the lookup's one chunk); CAP
   raised to 1.3 MB and the chunks re-cut (1 fails: 326 KB > 220); fullChunk without hardInto, so a lookup misses
   the championship words (1 fails: "a 1622 vs 1651 …"); app3 writing a words-full.js script tag again (1 fails).
   Run: node tests/library-chunks.cjs                                                                    */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), zlib = require('zlib');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const some = (a) => (a.length ? ' — ' + a.slice(0, 6).join(' · ') + (a.length > 6 ? ' …' : '') : '');
const T = require(path.join(ROOT, 'tools', 'library-chunks.cjs'));
const DIR = path.join(ROOT, T.OUT);

/* ---- 1. generated, never typed ---- */
const want = T.build(ROOT);
const have = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => /\.js$/.test(f)) : [];
const differ = Object.keys(want).filter((f) => !have.includes(f) || fs.readFileSync(path.join(DIR, f), 'utf8') !== want[f]);
const stray = have.filter((f) => !(f in want));
ok(!differ.length && !stray.length, `words-full/ is what tools/library-chunks.cjs writes from words-full.js + words-hard.js (${Object.keys(want).length} files)`
  + some(differ.map((f) => f + ' differs').concat(stray.map((f) => f + ' is stray'))));

/* ---- 2. library.js rebuilds both sources exactly ---- */
const sandbox = () => { const c = { console: { log() {}, warn() {}, error() {} } }; c.window = c; c.self = c; vm.createContext(c); return c; };
const src = sandbox();
vm.runInContext(read('words-full.js'), src, { filename: 'words-full.js' });
vm.runInContext(read('words-hard.js'), src, { filename: 'words-hard.js' });
const CORE = JSON.parse(src.SB_FULL), HARD = src.SB_HARD;
const P = sandbox(); const loads = [];
P.SB_LAZY = { reg: {}, st: {}, state(n) { return this.st[n] || null; },
  need(names, cb) { [].concat(names).forEach((n) => { const f = this.reg[n]; if (!f) return; loads.push(f);
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), P, { filename: f }); this.st[n] = 'done'; }); if (cb) cb(); } };
vm.runInContext(fs.readFileSync(path.join(DIR, 'index.js'), 'utf8'), P, { filename: 'words-full/index.js' });
vm.runInContext(read('library.js'), P, { filename: 'library.js' });
const LIB = P.SB_LIB, IX = P.SB_FULL_IX;
let got = null; LIB.all((c, h) => { got = { c, h }; });
ok(got && got.c && got.h, `SB_LIB.all() rebuilt the library from ${loads.length} chunks`);
ok(got && got.c && got.c.length === CORE.length && JSON.stringify(got.c) === src.SB_FULL,
  `the core comes back as words-full.js holds it — ${CORE.length} records, same records, same order`);
ok(got && got.h && JSON.stringify(got.h) === JSON.stringify(HARD), `the championship shard comes back as words-hard.js holds it — ${HARD.length} records, same order`);

/* ---- 3. a partition by headword, and lookups that cannot miss ---- */
const nkey = T.nkey;
const chunkOf = new Map();   // record object -> chunk file
for (const f of IX.f) { const p = LIB.part(f); for (const r of p.core.concat(p.hard)) chunkOf.set(nkey(r.w), (chunkOf.get(nkey(r.w)) || []).concat(f)); }
const rising = IX.b.every((b, i) => i === 0 || IX.b[i - 1] < b);
ok(rising && IX.b[0] === '' && IX.b.length === IX.f.length, `${IX.f.length} chunks, their lowest headwords rising strictly from the start of the alphabet`);
const at = (k) => { let i = 0; while (i + 1 < IX.b.length && IX.b[i + 1] <= k) i++; return i; };
const misplaced = [], spans = [], dup = [];
for (const [k, fs_] of chunkOf) { if (fs_.length > 1 && new Set(fs_).size > 1) dup.push(k); if (IX.f[at(k)] !== fs_[0]) misplaced.push(k + ' in ' + fs_[0] + ', bounds say ' + IX.f[at(k)]); }
IX.f.forEach((f, i) => { const p = LIB.part(f); const firsts = new Set(p.core.concat(p.hard).map((r) => { const k = nkey(r.w); return k >= '{' ? '{' : k[0]; }));
  if (firsts.size > 1 && i > 0) spans.push(f + ' (' + [...firsts].join('') + ')'); });
ok(!misplaced.length && !dup.length, `every one of ${chunkOf.size} headwords sits in the chunk its key's bound names` + some(misplaced.concat(dup)));
ok(!spans.length, 'no chunk spans two first letters (each is a letter, or a stretch of one)' + some(spans));
const byPrefix = (n) => { const m = new Map(); for (const [k, f] of chunkOf) { if (k.length < n) continue; const p = k.slice(0, n); if (!m.has(p)) m.set(p, new Set()); m.get(p).add(f[0]); } return m; };
const lookMiss = [], oneMiss = [], allMiss = []; let wkeys = 0, wide = 0, nPre = 0;
const keysBy = new Map(); for (const k of chunkOf.keys()) for (const n of [2, 3, 4]) if (k.length >= n) { const p = k.slice(0, n); if (!keysBy.has(p)) keysBy.set(p, []); keysBy.get(p).push(k); }
for (const n of [2, 3, 4]) for (const [p, need] of byPrefix(n)) { nPre++; const names = new Set(LIB.namesFor(p) || []);
  for (const f of need) if (!names.has(f)) lookMiss.push(p + '→' + f);
  /* the LOOKUP is one chunk: it holds the alphabetically first word with that start, and every one when they all live there */
  const one = LIB.chunkFor(p), ks = keysBy.get(p).slice().sort();
  if (chunkOf.get(ks[0])[0] !== one) oneMiss.push(p + ' (first is ' + ks[0] + ')');
  if (need.size === 1 && !need.has(one)) allMiss.push(p); if (need.size > 1) wide++; }
for (const k of chunkOf.keys()) { if (LIB.chunkFor(k) !== chunkOf.get(k)[0]) oneMiss.push(k); wkeys++; }
ok(!lookMiss.length, `namesFor() answers every two-, three- and four-letter start (${nPre}) with the chunks that hold all its words` + some(lookMiss));
ok(!oneMiss.length && !allMiss.length, `a lookup is ONE chunk and cannot come back empty: chunkFor() holds every headword (${wkeys}) exactly, and for every start the first word with it — all of them for the ${nPre - wide} starts that live in one chunk (${wide} wide starts like "non" show their first chunk until the next letter)` + some(oneMiss.concat(allMiss)));

/* ---- 4. a lookup is light ---- */
const { minifyJs } = require(path.join(ROOT, 'tools', 'minify.cjs'));
const gz = (t, name) => zlib.gzipSync(minifyJs(t, name), { level: 6 }).length;
let worst = 0, worstF = '', total = 0;
for (const f of IX.f) { const n = gz(fs.readFileSync(path.join(DIR, f + '.js'), 'utf8'), f + '.js'); total += n; if (n > worst) { worst = n; worstF = f; } }
const ixGz = gz(fs.readFileSync(path.join(DIR, 'index.js'), 'utf8'), 'index.js'), libGz = gz(read('library.js'), 'library.js');
const oldGz = zlib.gzipSync(read('words-full.js'), { level: 6 }).length;
ok(worst <= 220 * 1024, `the largest chunk is ${(worst / 1024).toFixed(0)} KB gzipped (${worstF}) — ceiling 220 KB`);
ok(ixGz <= 24 * 1024 && libGz <= 4 * 1024, `the index is ${(ixGz / 1024).toFixed(1)} KB and library.js ${(libGz / 1024).toFixed(1)} KB gzipped`);
console.log(`  ..    a lookup pays ≤ ${((worst + ixGz + libGz) / 1024).toFixed(0)} KB; the whole library ${(total / 1048576).toFixed(1)} MB in ${IX.f.length} chunks (words-full.js alone was ${(oldGz / 1048576).toFixed(1)} MB in one)`);

/* ---- 5. a child sees the same words through either door ---- */
/* app3's OWN two doors, run here: fullAdopt (the whole library: fullClean, then mergeHard → hardInto) and fullChunk
   (one chunk: fullClean, then hardInto), cut out of app3.js from `function mergeHard(` to `function fullLooking(` */
const app3 = read('app3.js');
const A = sandbox();
vm.runInContext(read('kid-safe.js'), A, { filename: 'kid-safe.js' });
const i0 = app3.indexOf('const SB_UNSAFE_RE'), i1 = app3.indexOf('function mergeHard('), i2 = app3.indexOf('function hardInto('), i3 = app3.indexOf('function fullWords('), i4 = app3.indexOf('function fullLooking(');
ok(i0 > 0 && i1 > i0 && i2 > i1 && i3 > i2 && i4 > i3, 'app3.js holds safeWord/fixCore, then mergeHard, then hardInto + fullClean, then fullWords … fullChunk, fullFor, then fullLooking');
vm.runInContext('var _wdb=null, state={};' + app3.slice(i0, i4) + ';this.__={fullAdopt,fullChunk};', A, { filename: "app3.js (the library's two doors)" });
A.SB_HARD = JSON.parse(JSON.stringify(HARD));
const whole = A.__.fullAdopt(JSON.parse(src.SB_FULL));
const part2 = (f) => { const C = sandbox(); vm.runInContext(fs.readFileSync(path.join(DIR, f + '.js'), 'utf8'), C); const x = C.SB_FULLC[f]; return { core: JSON.parse(x.c), hard: JSON.parse(x.h) }; };
A.SB_LIB = { part: part2 };
const wholeBy = {}; for (const r of whole) { const f = IX.f[at(nkey(r.w))]; (wholeBy[f] = wholeBy[f] || []).push(r); }
const unequal = [];
let n5 = 0;
for (const f of IX.f) { const v = A.__.fullChunk(f) || []; n5 += v.length;
  if (JSON.stringify(v) !== JSON.stringify(wholeBy[f] || [])) unequal.push(f + ' (' + v.length + ' vs ' + (wholeBy[f] || []).length + ')'); }
ok(whole.length > 125000 && whole._hard > 0 && n5 === whole.length && !unequal.length, `the lettered door (fullChunk) serves exactly what the whole door (fullAdopt) serves — ${whole.length} words, ${whole._hard} of them the shard's, chunk by chunk, in the same order` + some(unequal));

/* ---- 6. wiring ---- */
const shipped = fs.readdirSync(ROOT).filter((f) => /\.js$/.test(f) && !/^words-(full|hard)\.js$/.test(f));
const fetchers = shipped.filter((f) => /['"`]words-(full|hard)\.js/.test(read(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')));
ok(!fetchers.length, 'no shipped script fetches words-full.js or words-hard.js' + some(fetchers));
const idx = read('index.html'), bl = read('boot-lazy.js');
ok(!/words-full|library\.js/.test(idx), 'neither the chunks nor library.js are in index.html');
const idle = (bl.match(/var IDLE = \[([\s\S]*?)\];/) || [])[1] || '';
ok(/libIndex: 'words-full\/index\.js'/.test(bl) && /library: 'library\.js'/.test(bl) && /library: \['libIndex'\]/.test(bl) && !/libIndex|'library'/.test(idle),
  'boot-lazy registers the index and library.js (index first), and neither is on the idle queue');
const body = (name) => { const i = app3.indexOf('function ' + name + '('); return i < 0 ? '' : app3.slice(i, app3.indexOf('\nfunction ', i + 10)); };
ok(/lazyNeed\('library'/.test(body('loadFullLibrary')) && /SB_LIB\.all\(/.test(body('loadFullLibrary')) && /window\.SB_HARD=hard/.test(body('loadFullLibrary')) && /fullAdopt\(/.test(body('loadFullLibrary')),
  'loadFullLibrary asks for the library group and adopts SB_LIB.all()\'s core and shard');
ok(/fullFor\(q\)/.test(body('finderResults')) && /fullFor\(q\)/.test(body('suggestWords')) && /SB_LIB\.forKey\(q[,)]/.test(body('fullFor')),
  'the Word Finder and the header search look a word up through its own chunk (fullFor → SB_LIB.forKey)');
for (const f of ['deploy-prod.sh', 'deploy-internal.sh']) {
  const s = read(f);
  ok(/--exclude=\.\/words-full\.js/.test(s) && /--exclude=\.\/words-hard\.js/.test(s) && /rm -f "\$(WT|STG)"\/words-full\.js "\$(WT|STG)"\/words-hard\.js/.test(s) && /for d in app-art avatars words-full; do/.test(s),
    `${f}: the two sources stay off the site (excluded, and any live copy deleted) and the chunk tree is counted like the art trees`);
}

console.log(fails ? `\n${fails} FAILED` : '\nthe library is its chunks, and the chunks are the library');
process.exit(fails ? 1 : 0);
