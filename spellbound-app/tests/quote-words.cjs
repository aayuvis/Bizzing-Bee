/* WORDS IN QUOTES — each quote is shown through one of its words and that word's origin, FROM THE LIBRARY       @check
   (road to 4.5, P3.21; rubric H6 — "Quotes … add little to spelling"). The owner's line: reframe the Quotes tool as
   word-origin quotes, or retire it if that cannot be sourced — never fill a source from memory.
   What this holds, in node, from app3-library.js's quoteWord run over the boot word tier and the shipped quotes:
     · nearly every quote gets a word (≥ 90%), and every word chosen is IN its quote, as a whole word;
     · every word is a boot-tier library record that carries an origin, and the origin a card prints is that record's
       own `o` — nothing typed;
     · a quote's own highlighted word (its `hard` list) wins whenever the library holds it with an origin;
     · the choice is deterministic, and cut from the boot tier only: the second word shard landing does not change it;
     · the quotes' attributions are still unsourced, and nothing added a source (data-lint's UNSOURCED_MAX ratchet
       holds the count; this checks no `src` was invented on the way);
     · the Quotes page leads with the word panel and its origin.
   Proved by breaking: the longest-word fallback reading the WHOLE corpus (words2 appended) → "the second shard does not
   change it" fails; the origin printed from a typed map instead of the record → "the record's own o" fails; the hard
   word passed over → "its own highlighted word wins" fails.
   Run: node tests/quote-words.cjs                                                                                */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.env.SRC || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const lib3 = read('app3-library.js'), app3 = read('app3.js');
const A = lib3.indexOf('let _qWordIx=null'), Z = lib3.indexOf('// render a quote\'s text', A);
ok(A > 0 && Z > A, 'app3-library.js carries quoteWord (the word a quote is shown through)');
const ctx = { window: {}, console };
ctx.window = ctx; vm.createContext(ctx);
ctx.SB_DATA = {};
for (const f of ['words-data.js', 'words-extra.js']) vm.runInContext(read(f), ctx);
ctx.SB_TIER1_N = ctx.SB_DATA.nsf.length;   /* what app3's words1 listener records */
for (const f of ['quotes.js', 'quotes-lib.js']) vm.runInContext(read(f), ctx);
vm.runInContext((app3.match(/^const nkey = .*$/m) || [''])[0] + '\nconst wordsIn=()=>true;\n' + lib3.slice(A, Z) + '\n;window.__Q={quoteWord};', ctx);
const Q = ctx.SB_QUOTES, qw = ctx.__Q.quoteWord;
const boot = new Map(); ctx.SB_DATA.nsf.forEach((r) => { if (r && r.w && !boot.has(r.w.toLowerCase())) boot.set(r.w.toLowerCase(), r); });

const got = Q.map((x) => ({ x, r: qw(x) }));
const withW = got.filter((g) => g.r);
ok(withW.length / Q.length >= 0.9, `${withW.length} of ${Q.length} quotes (${Math.round(withW.length / Q.length * 100)}%) are shown through a word of their own`);
const notIn = withW.filter(({ x, r }) => !new RegExp('(^|[^A-Za-z])' + r.w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![A-Za-z])', 'i').test(x.q));
ok(!notIn.length, `every word chosen is in its quote, as a whole word (${notIn.length} not)${notIn.length ? ' — ' + notIn.slice(0, 3).map((g) => g.r.w).join(', ') : ''}`);
const notLib = withW.filter(({ r }) => { const b = boot.get(r.w.toLowerCase()); return !b || b !== r || !r.o; });
ok(!notLib.length, `every word is a boot-tier library record with an origin, and the origin is the record's own o (${notLib.length} not)`);
const hardMiss = got.filter(({ x, r }) => { const hs = (x.hard || []).map((h) => (typeof h === 'string' ? h : h && h.w)).filter(Boolean);
  const first = hs.find((h) => { const b = boot.get(h.toLowerCase()); return b && b.o; }); return first && (!r || r.w.toLowerCase() !== first.toLowerCase()); });
ok(!hardMiss.length, `a quote's own highlighted word wins whenever the library holds it with an origin (${hardMiss.length} passed over)`);

/* deterministic, and the second word shard does not move it */
const before = got.map((g) => (g.r ? g.r.w : '')).join('|');
vm.runInContext(read('words-data-2.js'), ctx);
vm.runInContext('_qWordIx=null; _qWordOf=new WeakMap();', ctx);   /* both caches cleared: the choice is made again, over the grown corpus */
const after = Q.map((x) => { const r = vm.runInContext('(function(x){ return quoteWord(x); })', ctx)(x); return r ? r.w : ''; }).join('|');
ok(ctx.SB_DATA.nsf.length > ctx.SB_TIER1_N && after === before, `the second word shard (${ctx.SB_DATA.nsf.length - ctx.SB_TIER1_N} more words) does not change a single quote's word`);

/* nothing sourced from memory on the way */
ok(Q.every((x) => !x.src), 'the quotes carry no invented source (their attributions stay unsourced; data-lint\'s UNSOURCED_MAX ratchet holds the count)');
const view = lib3.slice(lib3.indexOf('function viewQuotes('), lib3.indexOf('function viewIpaTrain('));
ok(/const qw=quoteWord\(x\)/.test(view) && /class="q-word"/.test(view) && /esc\(qw\.o\)/.test(view) && view.indexOf('${qwPanel}') > 0,
  'the Quotes page leads with the word panel: the word, and the record\'s origin (and its etymology line once the lore lands)');
console.log('  sample: ' + withW.slice(0, 5).map(({ x, r }) => `${r.w} (${r.o}) — "${x.q.slice(0, 32)}…"`).join(' · '));

console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
process.exit(fails ? 1 : 0);
