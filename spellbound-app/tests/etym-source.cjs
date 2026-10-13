/* AN ORIGIN NAMES ITS SOURCE DICTIONARY — ONLY WHERE THE DATA NAMES ONE (road to 4.5, P3.31; rubric Z1).   @check

   Of the app's etymology, only Word Forge's table (forge-data.js, generated from cited sources) names a dictionary:
   each row cites the entry it was checked against (`src.entry`), and the table names the dictionary
   (`sources.etymology`). app3's etymSource / etymSrcHTML read exactly that, so this holds, in node, from the shipped
   source run beside the shipped table:
     · every cited row's word gets a source line naming the TABLE's dictionary (not a name typed in app3 — the test
       renames it in the data and the card follows), the row's own entry, and the facts the row took from it;
     · a word with no cited row — and the library's words outside the table — get NO source line: nothing invented;
     · before the table has landed a card names nothing (and asks for it), never a guess;
     · the line is wired where a child meets an origin: the word card, the set deck and My Feed's origin cards.
   Proved by breaking: a fallback dictionary name typed into etymSrcHTML → "names none" fails; the name read from a
   constant instead of the data → "the table's own dictionary" fails; the feed's wiring removed → "wired" fails.
   Run: node tests/etym-source.cjs                                                                          */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.env.SRC || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const app3 = read('app3.js');
const A = app3.indexOf('function etymSource('), Z = app3.indexOf('/* KUDOS (road to 4.5', A);
ok(A > 0 && Z > A, 'app3.js carries etymSource / etymSrcHTML');
const line = (re) => (app3.match(re) || [''])[0];
const asked = [];
const ctx = { window: {}, render: () => {}, SB_LAZY: { need: (g, cb) => { asked.push(g); } } };
ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(line(/^const nkey = .*$/m) + '\n' + line(/^const esc = .*$/m) + '\n' + app3.slice(A, Z) + '\n;window.__E={etymSource,etymSrcHTML};', ctx);
const E = ctx.__E;

/* before the table lands: nothing, and it is asked for */
ok(E.etymSrcHTML('audible') === '' && asked.includes('forgeData'), 'before the table lands a card names nothing, and asks for the table (forgeData)');

vm.runInContext(read('forge-data.js'), ctx);
const F = ctx.SB_FORGE, cited = F.rows.filter((r) => r.src && r.src.entry);
const dict = String(F.sources.etymology).split(' — ')[0].trim();
ok(cited.length >= 100, `Word Forge's table cites ${cited.length} words, each against its own entry`);
const bad = cited.filter((r) => { const h = E.etymSrcHTML(r.w), s = E.etymSource(r.w);
  return !s || s.name !== dict || s.entry !== r.src.entry || !h.includes(dict) || !h.includes(r.src.entry.replace(/^https?:\/\/(www\.)?/, '')) || (r.origin && !h.includes(r.origin)); });
ok(!bad.length, `every cited word's card names ${dict}, its own entry and the row's origin (${cited.length - bad.length}/${cited.length})${bad.length ? ' — ' + bad.slice(0, 3).map((r) => r.w).join(', ') : ''}`);

/* nothing is invented: words with no cited row get no line */
ctx.SB_DATA = {}; vm.runInContext(read('words-data.js'), ctx);
const have = new Set(cited.map((r) => r.w.toLowerCase()));
const lib = (ctx.SB_DATA.nsf || []).filter((r) => r && r.w && !have.has(r.w.toLowerCase()));
const invented = lib.filter((r) => E.etymSrcHTML(r.w) !== '');
ok(lib.length > 5000 && !invented.length, `${lib.length} library words outside the cited table: each card names no source (${invented.length} did)${invented.length ? ' — ' + invented.slice(0, 3).map((r) => r.w).join(', ') : ''}`);
ok(E.etymSrcHTML('') === '' && E.etymSrcHTML('zzzzqq') === '', 'an unknown word names no source');

/* the name is the table's own: rename it in the data and the card follows */
F.sources.etymology = 'A Renamed Dictionary — https://example.invalid/'; delete F._srcIx;
ok(E.etymSrcHTML(cited[0].w).includes('A Renamed Dictionary') && !E.etymSrcHTML(cited[0].w).includes(dict), 'the dictionary named is the table\'s own (sources.etymology), never one typed in app3');

/* wired where a child meets an origin */
const lib3 = read('app3-library.js'), feed = read('bee-feed.js');
const card = lib3.slice(lib3.indexOf('function viewWordCardPop('), lib3.indexOf('function chevSVG('));
const deck = lib3.slice(lib3.indexOf('function setDeckCard('), lib3.indexOf('function viewSetDeck('));
/* the feed's line must reach the card it builds, not only be asked for */
const feedUses = /var src = etymSrcHTML\(lw\[1\]\); if \(src\) h = h\.replace\('<div class="bzf-row">', src \+ '<div class="bzf-row">'\)/.test(feed);
ok(/\$\{chips\}\$\{etymSrcHTML\(w\.w\)\}/.test(card) && /\$\{etymSrcHTML\(w\.w\)\}/.test(deck) && /\^lore:/.test(feed) && feedUses,
  'the source line is wired into the word card, the set deck and My Feed\'s origin cards');

console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
process.exit(fails ? 1 : 0);
