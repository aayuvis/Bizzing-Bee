/* library.js — the 130k library, a letter at a time (road to 4.5, P1.12).

   words-full.js (45 MB) and words-hard.js (1.5 MB) stay the SOURCE in the repo — every tool and data test reads
   them — but the page never fetches either any more. tools/library-chunks.cjs cuts them into words-full/: an index
   (SB_FULL_IX: each chunk's lowest headword, its file, and the order of both source arrays) and 86 chunks of
   ≤ ~200 KB gzipped, each "a letter, or a stretch of one". This file is the only reader of those chunks:

     SB_LIB.namesFor(q)     every chunk whose headwords could start with q (complete: what a whole-prefix scan needs)
     SB_LIB.chunkFor(q)     the ONE chunk at q's place in the alphabet — it holds q itself if the library has it,
                            and the alphabetically first words that start with q
     SB_LIB.forKey(q, cb)   {core, hard, names} — the RAW records of chunkFor(q), in source order — or null while
                            it loads (cb runs when it is in; every load re-renders through boot-lazy as well). A
                            LOOKUP IS ONE CHUNK: "non" starts ~10,000 headwords across four chunks, and a lookup
                            shows the first of them; the next letter typed narrows it to its own chunk.
     SB_LIB.looking(q)      true while a lookup for q is on its way
     SB_LIB.all(cb)         every chunk, then cb(core, hard): the two source arrays rebuilt EXACTLY — same records,
                            same order — so the Finder's ranking, the Whole Hive list and hardPool see what
                            words-full.js holds. A count that does not match the index refuses (cb(null)).

   It hands back raw records only. app3 owns what a child may see — safeWord, fixCore and the championship
   shard's merge (fullAdopt / fullChunk) — so the strike lists still cover every way in.

   Chunks go through boot-lazy (SB_LAZY.need with a registered name), so they carry the ?v= stamp, fire
   `sb-lazy`, re-render, and the service worker keeps every chunk it has seen for offline use. Loaded by the
   `library` group (index first) at the door of the Finder, the header search and loadFullLibrary. */
(function () {
  'use strict';
  var parts = {};                                   // file name -> {core, hard}, parsed once
  var asked = {};                                   // file name -> true once a load has been asked for
  var nkey = function (w) { return String(w == null ? '' : w).toLowerCase().trim(); };   // app3's nkey
  var IX = function () { var I = window.SB_FULL_IX; return I && I.b && I.f ? I : null; };

  /* the last chunk whose lowest headword is <= key */
  function at(key) {
    var b = IX().b, lo = 0, hi = b.length - 1;
    while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (b[mid] <= key) lo = mid; else hi = mid - 1; }
    return lo;
  }
  function namesFor(q) {
    var I = IX(); q = nkey(q); if (!I || !q) return null;
    return I.f.slice(at(q), at(q + '￿') + 1);
  }
  function chunkFor(q) { var I = IX(); q = nkey(q); return I && q ? I.f[at(q)] : null; }
  function reg(name) {
    var k = 'wf:' + name;
    try { if (window.SB_LAZY && !SB_LAZY.reg[k]) SB_LAZY.reg[k] = 'words-full/' + name + '.js'; } catch (e) {}
    return k;
  }
  /* parse a landed chunk once; the JSON strings are dropped after, so the text is not held twice */
  function part(name) {
    if (parts[name]) return parts[name];
    var C = window.SB_FULLC && window.SB_FULLC[name]; if (!C) return null;
    var p; try { p = { core: JSON.parse(C.c || '[]'), hard: JSON.parse(C.h || '[]') }; } catch (e) { return null; }
    try { delete window.SB_FULLC[name]; } catch (e) {}
    return (parts[name] = p);
  }
  var landed = function (name) { return !!(parts[name] || (window.SB_FULLC && window.SB_FULLC[name])); };
  function need(names, cb) {
    names.forEach(function (n) { asked[n] = true; });
    if (window.SB_LAZY) SB_LAZY.need(names.map(reg), cb); else if (cb) cb();
  }

  function forKey(q, cb) {
    var one = chunkFor(q); if (!one) return null;
    var names = [one];
    var missing = names.filter(function (n) { return !landed(n); });
    if (missing.length) { need(missing, cb || null); return null; }
    var core = [], hard = [];
    names.forEach(function (n) { var p = part(n); if (p) { core = core.concat(p.core); hard = hard.concat(p.hard); } });
    return { core: core, hard: hard, names: names };
  }
  function looking(q) {
    var one = chunkFor(q); if (!one) return false;
    var names = [one];
    return names.some(function (n) { return asked[n] && !landed(n) && (!window.SB_LAZY || SB_LAZY.state('wf:' + n) !== 'done'); });
  }

  /* rebuild a source array from its run-length order: [chunk, count, chunk, count, …] */
  function rebuild(I, seq, key, want) {
    var out = [], ptr = {};
    for (var i = 0; i < seq.length; i += 2) {
      var n = I.f[seq[i]], p = part(n); if (!p) return null;
      var arr = p[key], from = ptr[n] || 0, k = seq[i + 1];
      if (from + k > arr.length) return null;
      for (var j = 0; j < k; j++) out.push(arr[from + j]);
      ptr[n] = from + k;
    }
    return out.length === want ? out : null;
  }
  var whole = null;
  function all(cb) {
    var I = IX(); if (!I) { if (cb) cb(null, null); return; }
    if (whole) { if (cb) cb(whole.core, whole.hard); return; }
    need(I.f.slice(), function () {
      var core = rebuild(I, I.seq, 'core', I.n), hard = core && rebuild(I, I.hseq, 'hard', I.h);
      if (core && hard) whole = { core: core, hard: hard };
      else { try { console.warn('library.js: the chunks do not rebuild the library their index describes'); } catch (e) {} }
      if (cb) cb(whole ? whole.core : null, whole ? whole.hard : null);
    });
  }

  window.SB_LIB = { namesFor: namesFor, chunkFor: chunkFor, forKey: forKey, looking: looking, all: all, part: part,
    loaded: function () { return Object.keys(parts).length; }, ix: IX };
})();
