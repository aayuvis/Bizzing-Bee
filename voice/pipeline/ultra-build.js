/* Build books/ultra-chapters.js — the two Ultra volumes.

   The Ultra continent's curriculum is SB_ADV_TIPS: 36 authored champion
   techniques, split 9/9/9/9 across memory, speed, roots and tactics. Each tip
   carries a hook, four or five steps, a worked example and a drill — a real
   chapter's worth of teaching, but no words. This script gives each one twelve
   words to practise it ON, chosen to SUIT the technique rather than taken off
   the top of a pile: the chunking chapter gets the longest words in the library,
   the assimilation chapter gets doubled prefixes, the French chapter gets French
   words. Everything else falls through to the next block of the hardest words.

   Words are real: definition, sentence, pronunciation, hook and origin all come
   from the app library. Only the framing prose is authored, and it is composed
   from the tip's own hook / steps / example / drill rather than invented twice.

   Run:  node voice/pipeline/ultra-build.js
   Out:  books/ultra-chapters.js  ->  window.SB_ULTRA = { mind: [...], method: [...] } */
const fs = require('fs');
const A = '/home/user/Bizzing-Bee/spellbound-app/';
global.window = {};
require(A + 'words-data.js'); require(A + 'words-data-2.js');
require(A + 'adv-tips-data.js');
const nsf = (window.SB_DATA && window.SB_DATA.nsf) || [];
const TIPS = window.SB_ADV_TIPS || [];
if (TIPS.length !== 36) { console.error('expected 36 tips, got', TIPS.length); process.exit(1); }

/* WHICH words belong on the last continent.

   The first cut of this used (w.y >= 5) — the top difficulty band — and produced
   dictionary dregs: conventionnel, irrelievable, intrapipette, supportress,
   suffocateth. In a 41,000-word library the highest difficulty score is where the
   obscure long tail lives, not where the hard COMPETITION words live.

   The real signal is the tier tag. 29,013 words carry one, but 25,067 of those
   are 'Open' — the bulk dictionary. The curated set is the other tiers: Senior,
   North South Finals, Advanced, Junior, Primary. Ultra takes the top three. */
const TIER = /North South Finals|Senior|Advanced/;
const real = w => w && w.w && /^[a-z][a-z'-]{4,}$/i.test(w.w) && w.d && w.p;
const hard = nsf.filter(w => real(w) && TIER.test(w.nt || ''))
  .sort((x, y) => (y.y || 0) - (x.y || 0) || (y.w.length - x.w.length));
/* A widened bench for the few predicates the curated set cannot fill twelve of:
   still tier-tagged or genuinely likely, never the raw tail. */
const bench = nsf.filter(w => real(w) && !TIER.test(w.nt || '')
  && (/Junior|Primary|vocab-/.test(w.nt || '') || (w.bp || 0) >= 50))
  .sort((x, y) => (y.y || 0) - (x.y || 0) || (y.w.length - x.w.length));
console.log('curated pool', hard.length, '| bench', bench.length);

const used = new Set();
const rec = w => ({ w: w.w, say: w.p || '', def: w.d || '', ex: w.s || '', hook: w.r || w.h || '', o: w.o || '' });
/* Sample ACROSS a filtered band rather than taking a run off the front: deep in
   the library the difficulty score flattens and a contiguous slice returns
   whatever happens to sit together alphabetically. */
function drawFrom(pool, pred, n, out) {
  const band = pool.filter(w => !used.has(w.w.toLowerCase()) && pred(w));
  if (!band.length) return out;
  const step = Math.max(1, Math.floor(band.length / Math.max(1, n - out.length)));
  for (let i = 0; i < band.length && out.length < n; i += step) {
    if (used.has(band[i].w.toLowerCase())) continue;
    used.add(band[i].w.toLowerCase()); out.push(rec(band[i]));
  }
  for (let i = 0; i < band.length && out.length < n; i++) {
    if (used.has(band[i].w.toLowerCase())) continue;
    used.add(band[i].w.toLowerCase()); out.push(rec(band[i]));
  }
  return out;
}
/* curated first, the bench only if the predicate cannot fill twelve from it */
function take(pred, n) {
  const out = drawFrom(hard, pred, n, []);
  return out.length >= n ? out : drawFrom(bench, pred, n, out);
}
const O = re => w => re.test(w.o || '');
const ANY = () => true;

/* One predicate per technique, so the words earn their place beside the lesson. */
const PICK = {
  'Chunking Into Syllable Blocks': w => w.w.length >= 10,
  'Active Recall (Look, Cover, Write, Check)': w => /(.)\1/.test(w.w),
  'The Leitner Spaced-Repetition System': w => (w.bp || 0) >= 40,
  'Keyword Substitution & Acrostics': w => /^[a-z]{7,10}$/i.test(w.w),
  'Visualizing Trap Letter-Strings': w => /(ei|ie|ough|augh|eau)/i.test(w.w),
  'The Story / Link Method': w => /(ph|rh|ch)/i.test(w.w),
  'The Memory Palace (Method of Loci)': w => w.w.length >= 10,
  'Interleaving Languages & Patterns': ANY,
  'Sleep-Timed Consolidation': ANY,

  'Look-Cover-Write-Check (LCWC)': w => /^[a-z]{6,8}$/i.test(w.w),
  'Rapid Triage (Traffic-Light Marking)': ANY,
  'Column & Chunk Reading of Lists': ANY,
  'Saccade & Fixation Control': w => w.w.length >= 10,
  'Sub-vocalization Control': ANY,
  'Timed Dictation Drills': ANY,
  'Sprint-then-Review Cycles': ANY,
  'Spaced Repetition of Gap Words (Leitner)': ANY,
  'Automaticity via Morpheme Batching': w => /(tion|sion|ment|ance|ence)$/i.test(w.w),

  'Ask the Five Questions (Origin First)': ANY,
  'Read the Greek Signature': O(/greek/i),
  'Carry the Latin Toolkit': O(/latin/i),
  /* French origin is not enough — the lesson is about the endings, so the words
     have to actually carry one. */
  'Trust French Silent Endings': w => /french/i.test(w.o || '')
    && /(eau|eaux|et|ot|ais|oir|eur|ette|ique|esque|gue|que|ier|age|ance|ence)$/i.test(w.w),
  'Fingerprint the Other Languages': w => !/latin|greek|french|old english/i.test(w.o || '') && !!(w.o || '').trim(),
  'Learn Roots in Families': O(/latin|greek/i),
  'Beat the Schwa with the Root': w => /(ance|ence|able|ible|ant|ent)$/i.test(w.w),
  'Double Letters from Prefix Assimilation': w => /^(im|il|ir|in|col|cor|com|con|ac|ad|af|ag|al|ap|ar|as|at|suc|suf|sug|sup|sur)/i.test(w.w) && /(.)\1/.test(w.w),
  'Let Origin Predict the Whole Word': ANY,

  'The Legal Questions at the Mic': ANY,
  'Buying Thinking Time with the Clock': ANY,
  'Trace It in the Air or on Your Palm': w => w.w.length >= 10,
  'Defeat Homophones by Demanding the Definition': ANY,
  'The Root-Word Question': O(/latin|greek/i),
  'Systematic Guessing by Language of Origin': ANY,
  'The Retrace Rule: Never Change a Letter': ANY,
  'Stay Calm: Breathe Before the Letters': ANY,
  'Build a Two-Year Periodization Plan': ANY,
};

const CATNAME = { memory: 'Champion Memory', speed: 'Champion Speed',
  roots: 'Champion Origins', tactics: 'Championship Tactics' };
const DIFF = { memory: 'hard', speed: 'hard', roots: 'expert', tactics: 'expert' };

/* The trick block every chapter opens with, built from the tip's own steps. */
function method(t) {
  const lines = ["<div class='trick'><b>" + t.title.toUpperCase() + "</b></div>"];
  t.steps.forEach((s, i) => lines.push('<b>' + (i + 1) + '.</b> ' + s));
  if (t.example) lines.push('<b>In practice.</b> ' + t.example);
  return lines.join('\n');
}

function chapterOf(t) {
  const pred = PICK[t.title] || ANY;
  let ws = take(pred, 12);
  if (ws.length < 12) ws = ws.concat(take(ANY, 12 - ws.length));   // never ship a thin chapter
  return {
    category: CATNAME[t.cat] || 'Championship Craft',
    title: t.ic + ' ' + t.title,
    difficulty: DIFF[t.cat] || 'expert',
    concept: t.hook + ' This is one of the thirty-six techniques the last continent is built on, and it is the whole of this chapter: read it, run the drill, then use it on every list you touch afterwards.',
    method: method(t),
    cards: [
      { title: 'Why it works', body: t.hook },
      { title: 'The steps, in order', body: t.steps.map((s, i) => (i + 1) + '. ' + s).join('  ') },
      { title: 'Worked example', body: t.example || 'Run the steps on the twelve words opposite, in order, without shortcuts.' },
      { title: 'Your drill', body: t.drill || 'Take the twelve words opposite and run the technique on every one of them, out loud.' },
    ],
    words: ws,
  };
}

const byCat = c => TIPS.filter(t => t.cat === c).map(chapterOf);
const OUT = {
  /* how you get words in and get them back fast */
  mind: byCat('memory').concat(byCat('speed')),
  /* origin-first attack, and what you actually do at the microphone */
  method: byCat('roots').concat(byCat('tactics')),
};

for (const [k, arr] of Object.entries(OUT)) {
  console.log('\n==', k, arr.length, 'chapters ==');
  arr.forEach((c, i) => {
    const bare = c.words.filter(w => !w.def || !w.say);
    console.log(String(i + 1).padStart(2), c.words.length + 'w', c.cards.length + 'c',
      c.title.slice(0, 48), bare.length ? '  BARE:' + bare.map(x => x.w).join(',') : '');
  });
}
const total = OUT.mind.concat(OUT.method).reduce((a, c) => a + c.words.length, 0);
console.log('\ntotal words', total, 'unique', used.size);

const head = `/* Volumes 18 and 19 — the two Ultra volumes, generated from SB_ADV_TIPS
   (the 36 champion techniques the last continent teaches) by
   voice/pipeline/ultra-build.js. Every word is real: definition, sentence,
   pronunciation, hook and origin come from the app library, and each chapter's
   twelve words are chosen to SUIT its technique. The framing prose is composed
   from the tip's own hook / steps / example / drill. Regenerate rather than
   hand-edit. APPEND ONLY within each arm. */
`;
fs.writeFileSync(A + 'books/ultra-chapters.js',
  head + 'window.SB_ULTRA = ' + JSON.stringify(OUT, null, 1) + ';\n');
console.log('wrote books/ultra-chapters.js');
