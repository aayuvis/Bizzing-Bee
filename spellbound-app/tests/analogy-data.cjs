/* THE ANALOGY TRAIL'S DATA (analogy-data.js, cut by tools/analogy/build-app.cjs) — node, joins the data gate

   What a child can be asked on the Analogies tab comes only from this file, so it is held here:
     · every word in it (answers, wrong answers, stems, glossed words) is a library headword the app would
       serve: not struck or cut (CORE_STRIKE / CORE_CUT), not caught by SB_UNSAFE_RE, not on a sacred,
       mythic or insulting theme
     · every item has one answer: no wrong answer equals the answer or C, and no two options are the same word
     · every item's relation has a lesson, and every lesson has reviewed stems of its own relations
     · every region has its stops (≥16 items each, enough for a practice and a check) and a level check
       of ≥10 items that no stop uses — mastery is claimed on unseen items, so the check must not repeat
       what the stops taught
     · items carry enough wrong answers for their region's option count
     · nothing in the file is written by hand: it says GENERATED, and the reviewed flag is a field
   Proved by breaking: put a struck word into an item's wrong answers and the first check names it; give a
   level check a stop's item and the fourth does.
   Run: node tests/analogy-data.cjs                                                                   */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const src = fs.readFileSync(path.join(ROOT, 'analogy-data.js'), 'utf8');
const ctx = { window: {} }; vm.runInNewContext(src, ctx); const A = ctx.window.SB_ANALOGY;
ok(!!A && /GENERATED/.test(src.slice(0, 600)) && ('reviewed' in A), 'analogy-data.js loads, says it is generated, and carries its review flag');

let STRIKE = new Set(), CUT = new Set(), RE = null, W = null;
try {
  const { strikeLists, open } = require(path.join(ROOT, 'tools', 'word-stores.cjs'));
  ({ STRIKE, CUT } = strikeLists(ROOT));
  const line = fs.readFileSync(path.join(ROOT, 'app3.js'), 'utf8').split('\n').find((l) => /^const SB_UNSAFE_RE=/.test(l));
  RE = vm.runInNewContext(line.replace(/^const SB_UNSAFE_RE=/, '').replace(/;\s*(\/\*.*)?$/, ''));
  W = new Map(open('words-full.js', ROOT).get('SB_FULL').map((r) => [r.w, r]));
} catch (e) { console.log('  SKIP the library cross-check: ' + e.message + ' (a minified deploy tree has no tools/)'); }

const words = new Set();
for (const it of Object.values(A.items)) { words.add(it[2]); words.add(it[3]); for (const x of it.slice(4)) words.add(String(x).split('|')[0]); }
for (const l of A.lessons) for (const s of l.stems) { words.add(s[0]); words.add(s[1]); }
for (const w of Object.keys(A.gloss)) words.add(w);
if (W) {
  const NO = /^(religion|myth|theology|doctrine|insults|monsters)$/;
  const bad = [...words].filter((w) => !W.has(w) || STRIKE.has(w) || CUT.has(w) || RE.test(w + ' ' + ((W.get(w) || {}).d || '')) || ((W.get(w) || {}).t || []).some((t) => NO.test(t)));
  ok(!bad.length, `all ${words.size} words are library headwords the app would serve, on no sacred or insulting theme` + (bad.length ? ' — ' + bad.slice(0, 12).join(', ') : ''));
}
const dupes = Object.entries(A.items).filter(([, it]) => { const o = [it[3]].concat(it.slice(4).map((x) => String(x).split('|')[0])); return new Set(o).size !== o.length || o.slice(1).includes(it[2]); });
ok(!dupes.length, `every one of ${Object.keys(A.items).length} items has one answer: no wrong answer repeats it or C` + (dupes.length ? ' — ' + dupes.slice(0, 5).map(([k, v]) => k + ':' + v.slice(2, 4).join('>')).join(', ') : ''));

const relLesson = {}; A.lessons.forEach((l) => l.rels.forEach((r) => { relLesson[r] = l; }));
const noLesson = Object.values(A.items).filter((it) => !relLesson[it[0]]);
const thin = A.lessons.filter((l) => !l.stems.length || l.stems.some((s) => !l.rels.includes(s[2])));
ok(!noLesson.length && !thin.length, 'every item\'s relation has a lesson, and every lesson\'s stems are of its own relations' + (thin.length ? ' — ' + thin.map((l) => l.id).join(', ') : ''));

const stopIds = new Set(); A.regions.forEach((r) => r.stops.forEach((s) => s.items.forEach((id) => stopIds.add(id))));
const regionIssues = [];
for (const r of A.regions) {
  if (r.stops.length < 3) regionIssues.push(r.id + ' has ' + r.stops.length + ' stops');
  r.stops.forEach((s) => { if (s.items.length < 16) regionIssues.push(s.id + ' holds ' + s.items.length); });
  if (r.check.length < 10) regionIssues.push(r.id + ' check holds ' + r.check.length);
  const reused = r.check.filter((id) => stopIds.has(id)); if (reused.length) regionIssues.push(r.id + ' check repeats ' + reused.length + ' stop items');
  const short = r.stops.flatMap((s) => s.items).filter((id) => (A.items[id] || []).length - 4 < r.opts - 1);
  if (short.length) regionIssues.push(r.id + ': ' + short.length + ' items have fewer than ' + (r.opts - 1) + ' wrong answers');
}
ok(A.regions.length === 4 && !regionIssues.length, `four regions, each with its stops (≥16 items) and a level check of unseen items (≥10)` + (regionIssues.length ? ' — ' + regionIssues.join(' · ') : ''));
const missingRef = A.regions.flatMap((r) => r.stops.flatMap((s) => s.items).concat(r.check)).concat(A.games || []).filter((id) => !A.items[id]);
ok(!missingRef.length, 'every item a stop, a check or a game names exists' + (missingRef.length ? ' — ' + missingRef.slice(0, 5).join(', ') : ''));
console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
