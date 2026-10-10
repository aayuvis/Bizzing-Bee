/* THE GRADE MAP HAS A SOURCE ON EVERY ROW (road to 4.5, P1.9 — owner decision 5, 10 Oct 2026). @check

   "Cite US grade, UK Year and CBSE class, with sources[] on every row. Never map from memory. If a stop
   cannot be sourced, it says 'not mapped'." The research record is grade-map/grade-map.json; the page reads
   grade-map-data.js, written from it by tools/build-grade-map.cjs. This test holds:
     1. the page's copy IS the record (a hand edit to grade-map-data.js fails here);
     2. every row has a source: a region's US / UK / CBSE row cites at least one document, every cited id
        resolves to a listed document, every document names its official URL, where and when it was fetched,
        and a sha256 (or is read `via` one that has it); a STOP that claims a grade, year or class cites a
        document OF THAT FRAMEWORK, and a stop with no source says "not mapped" in all three;
     3. the map covers the Atlas exactly — the nine regions in road order, every one of the 128 stops in
        its region's order — so a stop added to the Atlas without a mapping fails until it says "not mapped";
     4. the rule itself works: each kind of unsourced row, planted in a copy, is caught.
   Run: node tests/grade-map.cjs                                                                   */
'use strict';
const fs = require('fs'), path = require('path');
const APP = path.resolve(__dirname, '..');
const GM = require(path.join(APP, 'tools', 'build-grade-map.cjs'));
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const load = (file, g) => { new Function('window', fs.readFileSync(path.join(APP, file), 'utf8'))(g); return g; };

const G = JSON.parse(fs.readFileSync(GM.SRC, 'utf8'));
/* floors first: an empty map passes every "each row" rule vacuously */
ok(Array.isArray(G.regions) && G.regions.length === 9 && Array.isArray(G.sources) && G.sources.length >= 10,
  `the record loads: ${G.regions && G.regions.length} regions, ${G.sources && G.sources.length} documents`);

/* 1 — the page's copy is the record */
let built = ''; try { built = GM.build(G); } catch (e) { built = 'ERR ' + e.message; }
const shipped = fs.readFileSync(GM.OUT, 'utf8');
ok(built === shipped, 'grade-map-data.js is exactly what tools/build-grade-map.cjs writes from grade-map.json' + (built === shipped ? '' : ' — run node tools/build-grade-map.cjs'));
const page = load('grade-map-data.js', {}).SB_GRADE_MAP;
ok(page && JSON.stringify(page) === JSON.stringify(G), 'the map the page reads equals the sourced record, field for field');

/* 2 — every row has a source */
const bad = GM.problems(G);
ok(bad.length === 0, 'every region row and every mapped stop cites a document of its own framework; every document is pinned' + (bad.length ? ' — ' + bad.slice(0, 5).join(' | ') : ''));
const ids = new Set(G.sources.map(s => s.id));
let rows = 0, mapped = 0, nm = 0, nmAll = 0, unsourced = 0;
const fw = { us: 0, uk: 0, cbse: 0 };
for (const r of G.regions) for (const s of r.stops) {
  rows++;
  const m = ['us', 'uk', 'cbse'].filter(f => !/^not mapped\b/i.test(s[f]));
  m.forEach(f => fw[f]++);
  if (m.length) mapped++; else nmAll++;
  nm += 3 - m.length;
  if (!s.sources.length) unsourced++;
  if (!s.sources.length && m.length) ok(false, `stop ${s.unit} is mapped (${m.join(',')}) with no source`);
  s.sources.forEach(x => { if (!ids.has(x)) ok(false, `stop ${s.unit} cites an unknown document ${x}`); });
}
ok(rows === 128, `128 stop rows (${rows})`);
console.log(`  ·   coverage: ${mapped} stops mapped to at least one framework, ${nmAll} "not mapped" in all three; ` +
  `US ${fw.us}/128 · UK ${fw.uk}/128 · CBSE ${fw.cbse}/128; ${unsourced} stops carry no source and every one of them says "not mapped"`);

/* 3 — the map covers the Atlas exactly */
const T = load('trail-data.js', {}).SB_TRAIL;
const acts = T.honey.acts;
ok(G.regions.map(r => r.act).join() === acts.map(a => a.id).join(), 'the nine regions, in road order: ' + G.regions.map(r => r.act).join(' → '));
const order = acts.every((a, i) => G.regions[i] && G.regions[i].stops.map(s => s.unit).join() === a.units.join());
ok(order, 'every region lists exactly its own stops, in the Atlas order (all 128)');

/* 4 — the rule catches each kind of unsourced row (a copy, never the record) */
const clone = () => JSON.parse(JSON.stringify(G));
const firstMapped = g => { for (const r of g.regions) for (const s of r.stops) if (!/^not mapped\b/i.test(s.us) && s.sources.length) return s; return null; };
const cases = [
  ['a mapped stop with its sources removed', g => { firstMapped(g).sources = []; }],
  ['a US claim backed only by a UK document', g => { const s = firstMapped(g); s.sources = s.sources.filter(x => !/^ccss-/.test(x)); if (!s.sources.length) s.sources = ['uk-app1']; }],
  ['a region row with no sources', g => { g.regions[3].uk.sources = []; }],
  ['a CBSE class claimed with no CBSE document', g => { g.regions[0].cbse.class = 'Class VI'; g.regions[0].cbse.sources = ['uk-app1']; }],
  ['a stop citing a document that is not listed', g => { firstMapped(g).sources.push('made-up-doc'); }],
  ['a document with no fetched-from mirror', g => { delete g.sources.find(s => s.id === 'uk-app1').fetched_from; }],
  ['a document with neither a sha256 nor a hashed `via`', g => { delete g.sources.find(s => s.id === 'ccss-xml').sha256; }],
  ['a stop with an empty CBSE text instead of "not mapped"', g => { g.regions[1].stops[0].cbse = ''; }],
];
for (const [name, plant] of cases) { const g = clone(); plant(g); const p = GM.problems(g); let threw = false; try { GM.build(g); } catch (e) { threw = true; }
  ok(p.length > 0 && threw, `caught and refused by the build: ${name}` + (p.length ? ' — "' + p[0] + '"' : '')); }

console.log(fails ? `\n${fails} FAILED` : '\nall good');
process.exit(fails ? 1 : 0);
