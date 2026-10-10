/* NO ROOT QUESTION PRINTS ITS ANSWER (the 4.5 brief, P0.34, 10 Oct 2026) — @check

   The leak rule, extended from "the whole answer is in the prompt" to ROOTS: a root question (wroots,
   wbreak — what Word Lore's Roots mode, the feed's "Which word?" / "Break it down" cards and the Ladder
   draw) leaks when a content word of its right answer has its first five letters inside the word or the
   Latin/Greek root form the prompt quotes, case-insensitive, and in none of the wrong options
   (tools/root-leak.cjs — "Inside “triangle” sits the piece “angulus”" → angle; “incapacitated” /
   “capacitas” → capacity; “knowledge” / “cnawan” → to know).

     rule      the audit's example and the rule's own shapes leak; the template ("The word … root … mean"),
               a stem every option shares, and a root that only looks like its meaning do not
     bank      no root question in the bank (the word bank and the five level shards) leaks; the audit's
               w5878 is gone; byLevel still matches the shards (a root question deleted from a level shard
               moves its count)
     ledger    qc-trivia-leaks.json records each deleted question, and none of them is served
     Lore      Roots mode draws only from that bank (lore.js ROOT_TH through trivDraw)
   The feed is held to the same rule by tests/feed-content.cjs ("every src resolves").
   Proved by breaking (10 Oct 2026, in a scratch copy of the tree, each put back): trivia-words.js from the
   commit before → 3 fail ("bank" with 89, w5878 back, "ledger" with 89 served again); the rule's stem made the
   whole answer → the "rule" probes fail (capacity, to know, practitioner, small + coat).
   Run: node tests/root-leaks.cjs                                                                   */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const some = (a) => (a.length ? ' — ' + a.slice(0, 8).join(' · ') + (a.length > 8 ? ' …(' + a.length + ')' : '') : '');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const { leak, THEMES } = require(path.join(ROOT, 'tools', 'root-leak.cjs'));

/* ---- the rule ---- */
const Q = (th, q, c) => ({ th, q, c });
const LEAK = [Q('wbreak', 'Inside “triangle” sits the piece “angulus”. What does that piece mean?', ['angle', 'horn', 'sharp point', 'title']),
  Q('wroots', 'The word “incapacitated” is built on the root “capacitas”. What does that root mean?', ['capacity', 'a slip', 'misuse', 'wine cellar']),
  Q('wroots', 'The word “knowledge” is built on the root “cnawan”. What does that root mean?', ['to know', 'tortoise', 'a running', 'pouch']),
  Q('wroots', 'Which of these words is built on a root meaning “to practice”?', ['practitioner', 'interloper', 'indubitable', 'puny']),
  Q('wbreak', 'Break “petticoat” into its two original pieces. What did those pieces mean?', ['small + coat', 'again + to rise', 'copper + stone', 'straight + to make'])];
const CLEAN = [Q('wroots', 'The word “invisibility” is built on the root “visibilis”. What does that root mean?', ['that can be seen', 'lordship', 'neck', 'fit for molding']),
  Q('wroots', 'The word “logorrhea” is built on the root “logos”. What does that root mean?', ['word', 'a slip', 'hidden', 'deputy']),
  Q('wroots', 'The word “rhizome” is built on the root “rhiza”. What does that root mean?', ['root', 'stone', 'leaf', 'river']),
  Q('wroots', 'The word “hinge” is built on the root “henge”. What does that root mean?', ['that which hangs', 'to bend', 'a cup', 'a door']),
  Q('wbreak', 'Break “oxygen” into its two original pieces. What did those pieces mean?', ['sharp + to produce', 'water + to produce', 'air + to produce', 'fire + to produce']),
  Q('wstories', 'A long adventurous journey is called an "odyssey" after which Greek hero?', ['Odysseus', 'Achilles', 'Hector', 'Jason'])];
const missed = LEAK.filter((q) => !leak(q)).map((q) => q.c[0]), over = CLEAN.filter((q) => leak(q)).map((q) => q.c[0] + ':' + leak(q));
ok(!missed.length, `the rule catches the audit's angulus → angle and the stem inside a root's Latin or Greek form (${LEAK.length} probes)` + some(missed));
ok(!over.length, `and not the template, a stem every option shares, or a people-in-words question (${CLEAN.length} probes)` + some(over));
ok(THEMES.join() === 'wroots,wbreak', 'the root themes are wroots and wbreak');

/* ---- the bank ---- */
const T = { console: { log() {}, warn() {}, error() {} } }; T.window = T; const TQ = [];
T.SB_TRIVIA = { questions: TQ, themes: [], byLevel: {}, _add: (lv, a) => TQ.push(...a) }; vm.createContext(T);
for (const f of ['trivia-words.js', 'trivia-q1.js', 'trivia-q2.js', 'trivia-q3.js', 'trivia-q4.js', 'trivia-q5.js']) vm.runInContext(read(f), T, { filename: f });
const ALL = T.SB_TRIVIA.questions === TQ ? TQ : TQ.concat(T.SB_TRIVIA.questions);
const roots = ALL.filter((q) => THEMES.includes(q.th));
const bad = roots.filter((q) => leak(q)).map((q) => q.id + ' ' + q.c[0] + ' (' + leak(q) + ')');
ok(roots.length > 2000 && !bad.length, `bank: none of ${roots.length} root questions prints its answer's stem` + some(bad));
ok(!ALL.some((q) => q.id === 'w5878'), 'bank: the audit\'s “triangle” / “angulus” → angle (w5878) is gone');
const lvN = {}; TQ.forEach((q) => { lvN[q.lv] = (lvN[q.lv] || 0) + 1; });
const TD = { console }; TD.window = TD; vm.createContext(TD); vm.runInContext(read('trivia-data.js').replace(/\bdocument\b/g, 'undefined'), TD);
ok([1, 2, 3, 4, 5].every((l) => lvN[l] === TD.SB_TRIVIA.byLevel[l]), 'bank: byLevel still matches the level shards — ' + JSON.stringify(lvN));

/* ---- the ledger ---- */
{
  const L = JSON.parse(read('qc-trivia-leaks.json')), ids = new Set(ALL.map((q) => q.id));
  const back = (L.deleted || []).filter((e) => ids.has(e.id)).map((e) => e.id);
  ok((L.deleted || []).length >= 6 && (L.deleted || []).some((e) => e.id === 'w5878') && !back.length, `ledger: qc-trivia-leaks.json records ${(L.deleted || []).length} deleted questions, and none is served` + some(back));
}

/* ---- Word Lore's Roots mode draws only from the bank ---- */
{
  const lore = read('lore.js');
  ok(/const ROOT_TH = \['wroots', 'wbreak', 'wstories', 'eponyms'\];/.test(lore) && /if \(m === 'roots'\) \{[^\n]*trivDraw\(ROOT_TH,/.test(lore) && /function trivDraw\(ths, lv, n, two\) \{ const all = T\(\)\.questions/.test(lore),
    'Lore: Roots draws its questions from the bank alone (ROOT_TH through trivDraw)');
}

console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
