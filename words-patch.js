/* words-patch.js — QC content patch (2026-07-25)
   Loads AFTER words-data.js + words-extra.js and edits SB_DATA.nsf in place:
   • removes non-word sexual-slang neologisms and malformed prefix fragments,
   • rewrites graphic/adult example sentences to kid-safe ones,
   • rewrites definitions that leaked the target spelling.
   Reviewable, additive, and non-destructive to the generated core file. */
/* Exposed as SB_WORDS_PATCH so it can be re-applied to a later shard: the core
   library boots as an easy first tier and words-data-2.js appends the rest, and
   those records need the same QC pass. Idempotent by construction. */
window.SB_WORDS_PATCH = function () {
  var D = window.SB_DATA;
  if (!D || !Array.isArray(D.nsf)) return;
  var nk = function (s) { return String(s == null ? '' : s).toLowerCase().trim(); };

  // 1) Remove: coined sexual-slang neologisms, malformed prefix fragments, a broken self-referential entry.
  var REMOVE = {};
  ['sexhibition', 'sex-texting', 'sexualizable', 'unsexualized', 'fauxmosexual',
   'nymphomaniacs', 'encephalize-', 'triskaideka-', 'committeth'
  ].forEach(function (w) { REMOVE[nk(w)] = 1; });

  // 2) Rewrite graphic/adult example sentences (word kept so the fill-in-the-blank masker still works).
  var SENT = {
    grotesquely: 'The old oak was grotesquely twisted into strange, gnarled shapes.',
    heinously:  'In the story the villain schemed so heinously that the whole town cheered when the hero stopped him.',
    viscerally: 'The fans reacted viscerally, gasping all at once at the last-second goal.',
    sensitively:'The teacher sensitively helped the nervous new student feel welcome.',
    allegedly:  'The puppy allegedly buried the missing sock somewhere in the garden.'
  };

  // 3) Rewrite spelling-leak definitions (target word must NOT appear in the definition text).
  var DEF = {
    halcyon:       'calm, peaceful and happy; often used of a golden, carefree time.',
    cuckoo:        'a grey European bird known for its two-note call and for laying eggs in other birds’ nests.',
    graham:        'a coarsely ground whole-wheat flour, or the slightly sweet cracker made from it.',
    maiden:        'a young unmarried woman; also means the very first of its kind, as in a first voyage.',
    insulate:      'to cover or surround something so heat, cold, sound or electricity cannot pass through easily.',
    cranberry:     'a small, round, sour red berry that grows on a low shrub in wet, boggy ground.',
    idle:          'not active or in use; resting, or running slowly without doing real work.',
    domino:        'a small flat tile marked with dots, used in a tile-matching game; also a knock-on chain reaction.',
    contradictory: 'saying the opposite; describing two statements that cannot both be true at once.',
    demonstrable:  'able to be clearly shown or proven to be true.',
    agglutinate:   'to firmly stick or fuse separate parts together into a single mass.',
    sufficience:   'the state of having as much as is needed; enough of something.',
    conjecture:    'an opinion or guess formed on little or no proof; to guess from scanty evidence.',
    lubricate:     'to apply oil or grease so parts slide and move smoothly with less friction.',
    empty:         'holding nothing inside; containing no contents at all.'
  };

  var removed = 0, sPatched = 0, dPatched = 0;
  for (var i = D.nsf.length - 1; i >= 0; i--) {
    var e = D.nsf[i]; if (!e || !e.w) continue; var w = nk(e.w);
    if (REMOVE[w]) { D.nsf.splice(i, 1); removed++; continue; }
    if (SENT[w]) { e.s = SENT[w]; sPatched++; }
    if (DEF[w])  { e.d = DEF[w];  dPatched++; }
  }
  // (debug) window.__wordsPatch = {removed:removed, sPatched:sPatched, dPatched:dPatched};
};
window.SB_WORDS_PATCH();
