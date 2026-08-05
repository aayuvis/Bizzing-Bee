/* boot-lazy.js — the boot budget.

   The app used to hand the browser 31MB of synchronous JavaScript across 57
   script tags before it could draw anything. Most of that is feature data the
   home screen never touches: 5.7MB of etymology, 4.3MB of alternate senses,
   1.2MB of voice manifest, the quote library, the figurative library, the
   concept courses, the Word Atlas curriculum. Every one of those reads through
   a `window.SB_X || fallback` guard, so they can arrive after first paint
   without a single call site changing.

   Two ways in:
     SB_LAZY.need('quotes', cb)  — a feature is opening now; load it, then cb
     the idle queue                — everything else, in priority order, once
                                      the app has painted and the main thread
                                      is free

   Both are idempotent, so `need()` on something the idle queue already fetched
   is free, and a `need()` that races the queue resolves once for both callers.
   Every load re-renders, because a screen drawn before its data landed (a
   quote count of zero, a card with no etymology row) has to correct itself. */
(function () {
  var V = function () { return window.SB_ASSET_V || ''; };

  /* Empty stubs for every global that now arrives late. This file runs before
     app.js, so a bare `SB_CONCEPTS` in app3.js resolves to the window property
     rather than throwing — and when the real file assigns over it, every read
     site sees the new value, because they are all live window lookups. Anything
     that snapshots one of these into a `const` at load time would freeze the
     stub instead, which is why app.js no longer does. */
  var STUB = {
    SB_CONCEPTS: { chapters: [] }, SB_ADV_CONCEPTS: { chapters: [] },
    SB_CSCRIPT: {}, SB_ADV_CSCRIPT: {}, SB_ADV_TIPS: null, SB_ADV_TOUR: null,
    SB_TRAIL: null, SB_LORE: null, SB_ALT: null, SB_ALT_PRON: null,
    SB_DIACRITICS: null, SB_HOM: null, SB_IPA: null, SB_PRON: null,
    SB_QUOTES: [], SB_FIG: null, SB_LESSONS: null, SB_VOCAB26: null,
    SB_NSF500: null, SB_SCRIPPS: null, SB_WVOICE: null, SB_STORY_ARCS: null,
    SB_ADV_SHOTS: null, SB_VOICE_FRENCH: null
  };
  for (var k in STUB) if (!(k in window)) window[k] = STUB[k];

  /* name -> file. Order inside IDLE is the priority order: what the reader is
     most likely to reach for first comes first. */
  var REG = {
    words2: 'words-data-2.js',          // the rest of the core library (32,944 words)
    lore: 'words-lore.js',              // etymology + memory hint, merged onto SB_DATA
    concepts: 'concepts-data.js',       // the 121-chapter course
    trail: 'trail-data.js',             // Word Atlas curriculum
    sounds: 'sounds-data.js',           // homophones, alt pronunciations, diacritics, IPA
    pron: 'word-pron.js',
    alts: 'word-alternates.js',         // other senses on a word card
    quotes: 'quotes-lib.js',
    fig: 'figurative-data.js',          // similes + idioms
    lessons: 'lessons-data.js',
    vocab26: 'nsf-vocab26-data.js',
    finals500: 'nsf-finals500-data.js',
    scripps: 'scripps-data.js',
    advConcepts: 'adv-concepts-data.js',
    advTips: 'adv-tips-data.js',
    cscript: 'concept-scripts.js',      // narration scene scripts
    advTour: 'adv-tour-shots.js',
    voiceWords: 'voice-words.js',       // 128k clip manifest — needed on first audio
    voiceFrench: 'voice-french.js',
    story: 'story-data.js'
  };

  /* Groups, so a caller can ask for a feature rather than a filename. */
  var GROUP = {
    words: ['words2', 'lore'],
    card: ['words2', 'lore', 'alts', 'sounds', 'pron'],
    concepts: ['concepts', 'cscript'],
    advanced: ['advConcepts', 'advTips', 'advTour'],
    atlas: ['trail', 'concepts', 'cscript'],
    quotes: ['quotes'],
    figurative: ['fig'],
    audio: ['voiceWords', 'voiceFrench'],
    lists: ['words2', 'lessons', 'vocab26', 'finals500', 'scripps'],
    sounds: ['sounds', 'pron']
  };

  var IDLE = ['words2', 'lore', 'concepts', 'trail', 'sounds', 'pron', 'voiceWords', 'quotes',
    'fig', 'lessons', 'advConcepts', 'cscript', 'advTips', 'vocab26', 'finals500',
    'scripps', 'advTour', 'voiceFrench', 'story', 'alts'];

  var state = {};          // name -> 'loading' | 'done'
  var waiters = {};        // name -> [cb]
  var pendingRender = 0;

  /* after() hooks: work that has to happen the moment a file lands. */
  var AFTER = {
    /* The second word shard arrives with bare records, so if lore is already in
       hand it has to be merged again over the new ones. Both directions are
       covered: whichever of the two lands second re-runs the merge. */
    words2: function () { if (window.SB_LORE) AFTER.lore(); },
    /* Etymology and memory hints were split out of words-data.js to keep 5.7MB
       off the boot path. Merge them back onto the very same record objects, so
       every `w.r` / `w.h` read site in the app keeps working untouched. */
    lore: function () {
      try {
        var L = window.SB_LORE, D = window.SB_DATA;
        if (!L || !D || !D.nsf) return;
        for (var i = 0; i < D.nsf.length; i++) {
          var rec = D.nsf[i]; if (!rec || !rec.w) continue;
          var v = L[String(rec.w).toLowerCase().trim()];
          if (!v) continue;
          if (v[0] && !rec.r) rec.r = v[0];
          if (v[1] && !rec.h) rec.h = v[1];
        }
        window.SB_LORE_MERGED = true;
      } catch (e) {}
    }
  };

  function softRender() {
    /* Coalesce: the idle queue can land four files in one frame. */
    if (pendingRender) return;
    pendingRender = requestAnimationFrame(function () {
      pendingRender = 0;
      try { if (typeof window.render === 'function') window.render(); } catch (e) {}
    });
  }

  function load(name, cb) {
    if (state[name] === 'done') { if (cb) cb(); return; }
    (waiters[name] = waiters[name] || []).push(cb || null);
    if (state[name] === 'loading') return;
    var src = REG[name];
    if (!src) { state[name] = 'done'; flush(name); return; }
    state[name] = 'loading';
    var s = document.createElement('script');
    s.src = src + V();
    s.async = true;
    s.onload = function () {
      state[name] = 'done';
      if (AFTER[name]) AFTER[name]();
      /* app3.js keeps memoised pools (the catalogue, the sound lists, the word
         index) that were built while this data was still missing. It listens for
         this and drops the stale ones; the render below then rebuilds them. */
      try { window.dispatchEvent(new CustomEvent('sb-lazy', { detail: name })); } catch (e) {}
      flush(name);
      softRender();
    };
    s.onerror = function () {
      /* A missing optional file must never wedge the app: mark it done so the
         waiters run and the feature falls back to its empty-data branch. */
      state[name] = 'done';
      try { console.warn('boot-lazy: could not load ' + src); } catch (e) {}
      flush(name);
    };
    document.head.appendChild(s);
  }

  function flush(name) {
    var q = waiters[name] || []; waiters[name] = [];
    for (var i = 0; i < q.length; i++) { try { if (q[i]) q[i](); } catch (e) {} }
  }

  /* need(nameOrGroupOrArray, cb) — cb fires once everything asked for is in. */
  function need(what, cb) {
    var names = [];
    [].concat(what).forEach(function (k) {
      names = names.concat(GROUP[k] || [k]);
    });
    names = names.filter(function (n, i) { return names.indexOf(n) === i; });
    var left = names.length;
    if (!left) { if (cb) cb(); return; }
    names.forEach(function (n) {
      load(n, function () { if (--left === 0 && cb) cb(); });
    });
  }

  function ready(what) {
    var names = GROUP[what] || [what];
    for (var i = 0; i < names.length; i++) if (state[names[i]] !== 'done') return false;
    return true;
  }

  /* The idle queue: one file per idle slice so a slow tablet keeps its frames.
     Chromium and Safari differ on requestIdleCallback, hence the timeout. */
  var qi = 0;
  function pump() {
    if (qi >= IDLE.length) return;
    var name = IDLE[qi++];
    load(name, pump);
  }
  function start() {
    var idle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 220); };
    idle(pump, { timeout: 1500 });
  }
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start);

  window.SB_LAZY = { need: need, ready: ready, reg: REG, group: GROUP };
})();
