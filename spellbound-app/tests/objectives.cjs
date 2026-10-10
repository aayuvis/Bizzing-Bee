/* "I CAN…" OBJECTIVES — DERIVED FROM THE STOPS, MOVED ONLY BY EVIDENCE (road to 4.5, P1.10). @check

   objectives.js groups each region's stops by their concept chapter's category and gives each group one
   "I can…" sentence. This test holds that to the data and to the evidence rule:
     1. DERIVED, NOT WRITTEN FROM MEMORY. Recomputed here independently from trail-data.js and the chapters:
        the same groups, every one of the 128 stops in exactly one objective of its own region, at least one
        objective per region. Every example a sentence gives (its brackets) appears in a title of one of its
        own stops — an objective cannot promise a pattern its stops do not teach — and no sentence is left
        over for a category no stop has.
     2. LINKED TO ITS STOPS AND GAMES. Every objective names its stops (which exist and open through the
        stop opener) and the two drills each stop runs on its words — Practice and Quiz — both real actions.
     3. MOVED ONLY BY EVIDENCE. The state is read from the mastery record and nothing else: nine words
        mastered on evidence is "started", ten is "secure", a miss that drops one takes it back out the same
        moment; a legacy mark (from before evidence) counts for nothing; a word of another objective, or of
        no objective, moves nothing; walking stops, time and coins are not inputs at all.
   Run: node tests/objectives.cjs                                                                     */
'use strict';
const fs = require('fs'), path = require('path');
const APP = path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const g = {};
for (const f of ['trail-data.js', 'concepts-data.js', 'trail-map-data.js', 'objectives.js']) new Function('window', fs.readFileSync(path.join(APP, f), 'utf8'))(g);
const O = g.SB_OBJ, T = g.SB_TRAIL, CH = g.SB_CONCEPTS.chapters, MAP = g.SB_TRAIL_MAP;
ok(O && T && CH.length > 100 && MAP, 'objectives.js, the trail, the chapters and the word map all load');
const objs = O.build(T, CH);
ok(objs.length >= 9, `${objs.length} objectives built (floor 9 — one a region at the least)`);

/* 1 — the same grouping, recomputed here */
const units = {}; T.honey.units.forEach(u => { units[u.id] = u; });
const catOf = u => String(((u.neu ? u.chapter : CH[u.gi]) || {}).category || 'Other').split(' — ')[0].trim();
const want = []; for (const a of T.honey.acts) { const seen = {}; for (const id of a.units) { const c = catOf(units[id]); if (!(c in seen)) { seen[c] = want.length; want.push({ act: a.id, cat: c, stops: [] }); } want[seen[c]].stops.push(id); } }
ok(want.length === objs.length && want.every((w, i) => objs[i].act === w.act && objs[i].cat === w.cat && objs[i].stops.join() === w.stops.join()),
  `the ${objs.length} objectives are exactly each region's stops grouped by their chapter category, in road order`);
const where = {}; objs.forEach(o => o.stops.forEach(s => { (where[s] = where[s] || []).push(o.id); }));
const all = T.honey.units.map(u => u.id);
ok(all.length === 128 && all.every(id => (where[id] || []).length === 1), `every one of the ${all.length} stops is in exactly one objective`);
ok(objs.every(o => { const a = T.honey.acts.find(x => x.id === o.act); return a && o.stops.every(s => a.units.includes(s)); }), "every objective's stops are in its own region");
ok(T.honey.acts.every(a => objs.some(o => o.act === a.id)), 'every region has at least one objective');
const exBad = [];
for (const o of objs) {
  const ex = O.examples(o.can);
  const titles = o.stops.map(s => String(units[s].title).toLowerCase()).join(' | ');
  if (!/^I can /.test(o.can)) exBad.push(o.id + ': does not start "I can"');
  if (!ex.length) exBad.push(o.id + ': gives no example');
  ex.forEach(e => { if (titles.indexOf(e.toLowerCase()) < 0) exBad.push(o.id + ': "' + e + '" is in none of its stop titles'); });
  if (!O.plain(o.can) || /[()]/.test(O.plain(o.can))) exBad.push(o.id + ': no plain sentence for the child');
}
ok(!exBad.length, 'every "I can…" gives examples, and every example is in a title of one of its own stops' + (exBad.length ? ' — ' + exBad.slice(0, 4).join(' | ') : ''));
const cats = new Set(objs.map(o => o.cat));
const orphan = Object.keys(O.CAN).filter(k => !cats.has(k));
ok(!orphan.length && objs.every(o => O.CAN[o.cat]), 'every category has its sentence and no sentence is left over' + (orphan.length ? ' — orphans: ' + orphan.join(', ') : ''));

/* 2 — linked to stops and games */
const trailSrc = fs.readFileSync(path.join(APP, 'trail.js'), 'utf8');
ok(objs.every(o => o.games.join() === 'practice,quiz') && /app2\.trailPractice\s*=/.test(trailSrc) && /app2\.trailQuiz\s*=/.test(trailSrc) && /app2\.trailUnit\s*=/.test(trailSrc),
  "every objective links to its stops (opened by trailUnit) and to each stop's Practice and Quiz — real actions in trail.js");

/* 3 — moved only by evidence */
const ix = O.index(objs, MAP, T, CH);
const byObj = {}; for (const k in ix) (byObj[ix[k]] = byObj[ix[k]] || []).push(k);
ok(objs.every(o => (byObj[o.id] || []).length >= O.SECURE_AT), `every objective has at least ${O.SECURE_AT} words to be secure on (fewest: ${Math.min(...objs.map(o => (byObj[o.id] || []).length))})`);
const T0 = 20000;
const M = (b, extra) => Object.assign({ b, due: T0 + 5, d: T0 - 1, ok: b, n: Math.max(1, b), mt: 1 }, extra || {});
const pre = objs.find(o => o.id === 'forum:latin-prefixes'), suf = objs.find(o => o.id === 'forum:latin-suffixes');
const pw = byObj[pre.id].slice(0, 12), sw = byObj[suf.id].slice(0, 12);
const st = mast => O.evidence(mast, objs, ix);
let E = st({});
ok(objs.every(o => E[o.id].status === 'none' && E[o.id].mastered === 0), 'no record: every objective is "not started"');
const nine = {}; pw.slice(0, 9).forEach(w => { nine[w] = M(2); });
E = st(nine);
ok(E[pre.id].mastered === 9 && E[pre.id].status === 'started', `nine words mastered on evidence: "${E[pre.id].status}" (${E[pre.id].mastered})`);
const ten = Object.assign({}, nine, { [pw[9]]: M(2) });
E = st(ten);
ok(E[pre.id].status === 'secure' && E[suf.id].status === 'none', `the tenth makes it "secure" — and moves no other objective (${E[suf.id].status})`);
const slipped = Object.assign({}, ten, { [pw[0]]: M(1, { lp: 1, miss: 1 }) });
E = st(slipped);
ok(E[pre.id].status === 'started' && E[pre.id].mastered === 9 && E[pre.id].slipped === 1, 'a miss that drops one word below mastery takes the objective back out of "secure" at once');
const legacy = {}; pw.forEach(w => { legacy[w] = M(2, { leg: 1 }); });
E = st(legacy);
ok(E[pre.id].mastered === 0 && E[pre.id].status === 'none', `${pw.length} legacy marks (from before evidence) count for nothing`);
const once = {}; pw.forEach(w => { once[w] = M(1); });
E = st(once);
ok(E[pre.id].status === 'started' && E[pre.id].mastered === 0 && E[pre.id].learning === pw.length, 'right once (box 1) on twelve words: started, nothing mastered');
const stranger = { zzzzzz: M(4), 'not-a-word': M(3) };
E = st(stranger);
ok(objs.every(o => E[o.id].status === 'none'), 'words outside every objective move nothing');
ok(O.evidence.length === 3 && !/trail|coins|minutes|activity|xp\b|done/.test(O.evidence.toString().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')),
  'evidence() takes the mastery record, the objectives and the word index — nothing about stops walked, time, XP or coins');

console.log(fails ? `\n${fails} FAILED` : '\nall good');
process.exit(fails ? 1 : 0);
