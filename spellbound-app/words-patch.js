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

  /* EVERY LOOKUP HERE IS PROTOTYPE-SAFE, and it was not: with a plain {} the
     test `REMOVE[w]` answers TRUE for "constructor", because that is a key on
     Object.prototype. `constructor` is a real library word — app3's CORE_FIX
     even ships it a kid-safe gloss, "a person or company that builds
     something" — and this file has been quietly splicing it out of the served
     corpus on every boot. SENT and DEF carry the same flaw: SENT["constructor"]
     would have assigned the Object constructor FUNCTION as an example
     sentence. Same trap CLAUDE.md documents for homIndex. */
  // 1) Remove: coined sexual-slang neologisms, malformed prefix fragments, a broken self-referential entry.
  var REMOVE = Object.create(null);
  ['sexhibition', 'sex-texting', 'sexualizable', 'unsexualized', 'fauxmosexual',
   'nymphomaniacs', 'encephalize-', 'triskaideka-', 'committeth'
  ].forEach(function (w) { REMOVE[nk(w)] = 1; });

  // 1a) Ethnic slurs and dated exonyms, signed off 5 Sep 2026. These MUST be
  // listed here as well as in app3's CORE_STRIKE: fixCore() guards the 130k
  // library, but a child practises out of SB_DATA.nsf, and every one of these
  // was live in the served shards. They are glossed innocently — kaffir as a
  // cereal crop, hottentot as a Khoisan language, negress as "a Black woman or
  // girl" — so the SLUR_DEF pattern cannot see them. Keep the two lists in step.
  ['kaffir', 'kaffirs', 'kafir', 'kafirs', 'hottentot', 'hottentots',
   'negress', 'negresses', 'pickaninny', 'pickaninnies', 'coolie', 'coolies',
   'redskin', 'redskins', 'chinaman', 'chinamen', 'halfcaste', 'half-caste',
   'eskimo', 'eskimos', 'bushman', 'bushmen', 'gypsy', 'gypsies'
  ].forEach(function (w) { REMOVE[nk(w)] = 1; });

  // 1c) Sexual-violence and pornography glosses, signed off 5 Sep 2026. Same
  // reason as 1a: the gloss is a plain description, so SLUR_DEF never fires.
  // `rape` is struck although the bank serves only the plant sense — the app
  // says every word aloud. `ravishing` is NOT here; app3's CORE_FIX repairs it.
  ['ravish', 'ravished', 'ravisher', 'ravishment', 'ravishes',
   'porn', 'porno', 'porns', 'pornos', 'pornography', 'pornographic',
   'rape', 'raped', 'rapes', 'rapist', 'rapists',
   'molest', 'molested', 'molester', 'molesting'
  ].forEach(function (w) { REMOVE[nk(w)] = 1; });

  // 1b) Remove: Roman numerals carried as headwords — xiv, xxii, lxx and 13 more,
  // each glossed "the cardinal number that is the sum of thirteen and one". They
  // are two to five letters and rated band 1, so they surfaced near the FRONT of
  // easy word lists, and "x-i-v" teaches a speller nothing. The test is the SHAPE
  // *and* that definition, never the shape alone: `mix` reads as M-IX, `dix` as
  // D-IX (the reformer Dorothea Dix) and `cli` as C-L-I (the command-line
  // interface) — all three are real headwords a shape-only rule would delete.
  var ROMAN = /^(?=[mdclxvi]{2,})m{0,4}(cm|cd|d?c{0,3})(xc|xl|l?x{0,3})(ix|iv|v?i{0,3})$/;
  var isNumeral = function (w, d) {
    var g = String(d || '');
    // two glosses in the bank, both unmistakable: the cardinal noun form
    // ("the cardinal number that is the sum of thirteen and one") and the
    // adjective form liv carries ("being four more than fifty").
    return ROMAN.test(w) && (/^the cardinal number that is\b/i.test(g)
                          || /^being\s+\w+\s+more than\s+\w+/i.test(g));
  };

  // 2) Rewrite graphic/adult example sentences (word kept so the fill-in-the-blank masker still works).
  var SENT = Object.assign(Object.create(null), {
    grotesquely: 'The old oak was grotesquely twisted into strange, gnarled shapes.',
    heinously:  'In the story the villain schemed so heinously that the whole town cheered when the hero stopped him.',
    viscerally: 'The fans reacted viscerally, gasping all at once at the last-second goal.',
    sensitively:'The teacher sensitively helped the nervous new student feel welcome.',
    allegedly:  'The puppy allegedly buried the missing sock somewhere in the garden.'
  });

  // 3) Rewrite spelling-leak definitions (target word must NOT appear in the definition text).
  var DEF = Object.assign(Object.create(null), {
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
  });

  var removed = 0, sPatched = 0, dPatched = 0;
  for (var i = D.nsf.length - 1; i >= 0; i--) {
    var e = D.nsf[i]; if (!e || !e.w) continue; var w = nk(e.w);
    if (REMOVE[w] || isNumeral(w, e.d)) { D.nsf.splice(i, 1); removed++; continue; }
    if (SENT[w]) { e.s = SENT[w]; sPatched++; }
    if (DEF[w])  { e.d = DEF[w];  dPatched++; }
  }
  // (debug) window.__wordsPatch = {removed:removed, sPatched:sPatched, dPatched:dPatched};
};
window.SB_WORDS_PATCH();
