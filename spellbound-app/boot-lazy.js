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
    SB_CSCRIPT: {}, SB_ADV_CSCRIPT: {}, SB_ADV_TIPS: null,
    SB_TRAIL: null, SB_LORE: null, SB_ALT: null, SB_ALT_PRON: null,
    SB_DIACRITICS: null, SB_HOM: null, SB_IPA: null, SB_PRON: null,
    SB_QUOTES: [], SB_FIG: null, SB_LESSONS: null, SB_VOCAB26: null,
    SB_NSF500: null, SB_SCRIPPS: null, SB_WVOICE: null, SB_STORY_ARCS: null,
    SB_ADV_SHOTS: null, SB_VOICE_FRENCH: null, SB_THEME_LORE: null,
    SB_SOUTHASIA: [], SB_EPONYMS: [], SB_ULTRA: null, SB_POEMS: null
  };
  for (var k in STUB) if (!(k in window)) window[k] = STUB[k];

  /* name -> file. Order inside IDLE is the priority order: what the reader is
     most likely to reach for first comes first. */
  var REG = {
    /* the boot tier's example sentences (FIX-BEE v2, R2): words-data.js carries the words and their
       meanings; no first screen shows a sentence, so they wait here — first on the idle queue, and at
       the door of every screen that shows a card. voice/pipeline/split-sentences.js writes it. */
    sents: 'words-data-s.js',
    words2: 'words-data-2.js',          // the rest of the core library (32,944 words)
    lore: 'words-lore.js',              // etymology + memory hint, merged onto SB_DATA
    concepts: 'concepts-data.js',       // the 121-chapter course
    trail: 'trail-data.js',             // Word Atlas curriculum
    southasia: 'southasia-data.js',     // the Grand Trunk Road chapters (Expedition IV)
    sounds: 'sounds-data.js',           // homophones, alt pronunciations, diacritics, IPA
    pron: 'word-pron.js',
    alts: 'word-alternates.js',         // other senses on a word card
    syn: 'word-synonyms.js',            // 1-2 short meanings per word
    quotes: 'quotes-lib.js',
    fig: 'figurative-data.js',          // similes + idioms
    lessons: 'lessons-data.js',
    vocab26: 'nsf-vocab26-data.js',
    finals500: 'nsf-finals500-data.js',
    scripps: 'scripps-data.js',
    advConcepts: 'adv-concepts-data.js',
    advTips: 'adv-tips-data.js',
    cscript: 'concept-scripts.js',      // narration scene scripts
    voiceWords: 'voice-words.js',       // 128k clip manifest — needed on first audio
    voiceFrench: 'voice-french.js',
    story: 'story-data.js',
    themeLore: 'theme-lore.js',     // the explanation that opens every Theme Journey
    coachRules: 'coach-rules.js',   // the Coach's hardcoded rulebook — one entry per trap
    /* Cloud backup. Not on the boot path by design: a child opening the app must
       reach a word without waiting on anything that talks to a network, and a
       family that never makes an account must never pay for this file at all. It
       is fetched on the idle queue, last, and its own guards keep it inert until
       a parent has signed in AND consented. */
    sync: 'supabase-sync.js',
    /* The in-app book reader and the three authored chapter files that only the
       book volumes use. The books/ path is real on gh-pages (the deploy copies
       them beside the redirect stubs) and in the repo alike. */
    reader: 'reader.js',
    /* The arcade's engines and the art they draw with (FIX-BEE N2). ~110KB gzipped that
       only the Play tab's games use — none of it is on Home. Loaded in this order (DEPS),
       at the door of a game (app.arcadePlay / arcadeMenu, wrapped below) or on the idle
       queue once the child has done something. */
    /* The vector avatar art (FIX-BEE N2): 300KB, ~52KB gzipped, on the boot path for a
       fallback that never fires — all 217 avatars have painted art (SB_AVATAR_PNG), and
       SB_AVATAR draws the vector only for an id that does not. It arrives on the idle
       queue so the fallback still exists for any id added without a painting. */
    avatarArt: 'avatars-art.js',
    /* The music (FIX-BEE v2, standard §11): composed in code, ~9KB, never in the first load. The
       worlds4 shim asks for it after the child's first tap, when music is on. */
    music: 'music.js',
    sagaArt: 'saga-art/saga-art.js',
    sagaMap: 'saga-art/saga-map.js',
    worldsArt: 'saga-art/worlds-art.js',
    sagaDom: 'saga-art-dom.js',
    saga2: 'saga2.js',
    eponbk: 'books/eponym-chapters.js',
    ultrabk: 'books/ultra-chapters.js',
    poems: 'books/poem-chapters.js',
    /* My Feed (FAMILY-STANDARD §6a): the family's engine (classic port), the cards cut from the
       corpus by tools/build-feed.cjs, and Bee's screen. Fetched at the door of #/feed only —
       never on the idle queue, never on the first screen. */
    feedEngine: 'bizzing-feed.js',
    feedMeta: 'feed/feed-meta.js',     // names the per-level index and body groups; bee-feed.js registers and loads those
    feedView: 'bee-feed.js',
    /* Word Forge (games spec §5.1): the shared rules, the CITED morpheme table and the game. The table
       also rides the idle queue (last) so the Play lineup can read SB_FORGE.signedOff without the game. */
    forgeCore: 'forge-core.js',
    forgeData: 'forge-data.js',
    forgeUI: 'forge.js',
    /* Word Lore + Hive Mind, the two trivia hubs (games spec §4.3/§4.4): fetched at the door of a
       hub only (app.openLore / app.openHive below), never on the first screen or the idle queue. */
    loreHub: 'lore.js',
    /* The Spelling Gym (games spec §4.2): the hub and its seven modes. It stands on the arcade's
       kit (SGUI in saga2.js), so saga2 comes first; fetched at the door (app.openGym) only. */
    gym: 'gym.js',
    /* Daily Bee (games spec §5.2): the game itself, fetched at its door with the engine kit it stands on
       and the whole served corpus — the day's word is picked from it, so the same date and band give the
       same word whatever else has loaded (the end card's sentence and origin come from sents and lore) */
    dailyBee: 'games-daily.js'
  };

  /* Groups, so a caller can ask for a feature rather than a filename. */
  var GROUP = {
    words: ['sents', 'words2', 'lore'],
    card: ['sents', 'words2', 'lore', 'alts', 'syn', 'sounds', 'pron'],
    concepts: ['concepts', 'cscript'],
    advanced: ['advConcepts', 'advTips', 'southasia'],
    /* advConcepts too: the map draws the Advanced Rounds (locked or not), and a stop
       whose chapter is an `ai` ref resolves through SB_ADV_CONCEPTS — without it chOf()
       is undefined and setsOf() throws. The idle queue used to hide that. */
    atlas: ['trail', 'concepts', 'cscript', 'southasia', 'advConcepts'],
    quotes: ['quotes'],
    figurative: ['fig'],
    audio: ['voiceWords', 'voiceFrench'],
    lists: ['sents', 'words2', 'lessons', 'vocab26', 'finals500', 'scripps'],
    themes: ['sents', 'words2', 'themeLore'],
    sounds: ['sounds', 'pron'],
    coach: ['coachRules', 'concepts', 'sents', 'words2'],
    cloud: ['sync'],
    arcade: ['saga2'],
    /* everything any volume of the in-app reader can render */
    reader: ['reader', 'eponbk', 'ultrabk', 'poems', 'concepts', 'advConcepts', 'southasia', 'fig', 'quotes'],
    feed: ['feedEngine', 'feedMeta', 'feedView'],
    forge: ['saga2', 'forgeCore', 'forgeData', 'forgeUI'],
    /* the hubs draw on the shared stage kit (SGUI.stage / SB_HUB, saga2.js), so it comes too */
    quizhubs: ['loreHub', 'saga2'],
    gym: ['saga2', 'gym', 'sents'],
    daily: ['dailyBee', 'saga2', 'sents', 'words2', 'lore']   // saga2: the engine kit (SGUI.stage, SGUI.keys)
  };

  /* A file that must not run before another. load() fetches the prerequisite first and
     injects the dependant only once it has run — async scripts otherwise execute in
     whatever order they arrive. */
  var DEPS = { sagaMap: ['sagaArt'], worldsArt: ['sagaMap'], sagaDom: ['worldsArt'], saga2: ['sagaDom'], feedView: ['feedEngine', 'feedMeta'], forgeUI: ['forgeCore', 'forgeData', 'saga2'], gym: ['saga2'] };

  var IDLE = ['sents', 'words2', 'lore', 'saga2', 'concepts', 'trail', 'sounds', 'pron', 'voiceWords', 'quotes',
    'themeLore', 'fig', 'lessons', 'advConcepts', 'cscript', 'advTips', 'vocab26', 'finals500',
    'scripps', 'southasia', 'voiceFrench', 'story', 'alts', 'syn', 'coachRules', 'avatarArt', 'forgeData', 'sync'];

  var state = {};          // name -> 'loading' | 'done'
  var waiters = {};        // name -> [cb]
  var pendingRender = 0;

  /* after() hooks: work that has to happen the moment a file lands. */
  var AFTER = {
    /* Sentences land on the SAME record objects, by word and in order (words-patch may have spliced
       a record out, so position alone is not trusted), and only where a record has none — a sentence
       words-patch rewrote stays rewritten. Then the QC pass runs again over the merged text. */
    sents: function () {
      try {
        var P = window.SB_SENT_BOOT, D = window.SB_DATA; if (!P || !D || !D.nsf) return;
        var j = 0, n = D.nsf.length;
        for (var i = 0; i < P.length; i++) { var w = P[i][0], s = P[i][1]; if (!s) continue;
          for (var k = j; k < Math.min(n, j + 64); k++) { var r = D.nsf[k]; if (r && r.w === w) { if (!r.s) r.s = s; j = k + 1; break; } } }
        window.SB_SENT_MERGED = true;
        if (window.SB_WORDS_PATCH) window.SB_WORDS_PATCH();
      } catch (e) {}
    },
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

  /* Coalesce on a WINDOW, not on a frame.
     One rAF only merges files that land in the same 16ms, and the deferred set
     arrives spread over about four hundred milliseconds — so this fired fifteen
     times at boot, fifteen full rebuilds of the view, which is what made the app
     visibly jump as it opened. A short trailing window collapses that to a
     handful without making any single file's data appear late enough to notice.
     Timer + rAF together: the timer batches, the frame keeps the work off a
     layout the browser is already mid-way through. */
  var RENDER_WINDOW = 140;
  function softRender() {
    if (pendingRender) clearTimeout(pendingRender);
    pendingRender = setTimeout(function () {
      pendingRender = 0;
      requestAnimationFrame(function () {
        try { if (typeof window.render === 'function') window.render(); } catch (e) {}
      });
    }, RENDER_WINDOW);
  }

  function load(name, cb) {
    if (state[name] === 'done') { if (cb) cb(); return; }
    (waiters[name] = waiters[name] || []).push(cb || null);
    if (state[name] === 'loading') return;
    var src = REG[name];
    if (!src) { state[name] = 'done'; flush(name); return; }
    state[name] = 'loading';
    var deps = (DEPS[name] || []).filter(function (d) { return state[d] !== 'done'; });
    if (deps.length) {
      var left = deps.length;
      deps.forEach(function (d) { load(d, function () { if (--left === 0) inject(name, src); }); });
      return;
    }
    inject(name, src);
  }
  function inject(name, src) {
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
  var idle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 220); };
  var started = false;
  function start() {
    if (started) return; started = true;
    idle(pump, { timeout: 1500 });
  }

  /* WHEN THE IDLE QUEUE RUNS (FIX-BEE N2, family standard §11: "data lazy per route").
     It used to start the moment the page had loaded and pull every file in IDLE — about
     34MB, ~10MB on the wire — whether or not the child ever opened a screen that reads
     them. That was most of the audit's "29MB first load on a phone". Now:
       · FIRST is fetched after load: the little a first screen shows that is not in the
         boot scripts (the Atlas frontier behind Home's "Next on your journey").
       · the rest waits until the child DOES something — a tap, a key, a scroll. A screen
         that needs a file before then asks for it at its door with need(), as they all
         already do (setNav, startTrain, openCoach, the reader, the Atlas…).
       · on a data-saver connection (Save-Data / navigator.connection.saveData) the queue
         never runs on its own at all: files arrive only when a screen asks for them.
     need() is unaffected — it loads what it is asked for, immediately, either way. */
  var FIRST = ['trail'];
  var saveData = false;
  try { saveData = !!(navigator.connection && navigator.connection.saveData); } catch (e) {}
  var ARM = ['pointerdown', 'keydown', 'touchstart', 'wheel'];
  function onFirstAct() {
    ARM.forEach(function (ev) { window.removeEventListener(ev, onFirstAct, true); });
    start();
  }
  function afterLoad() {
    idle(function () { FIRST.forEach(function (n) { load(n); }); }, { timeout: 1500 });
    if (saveData) return;
    ARM.forEach(function (ev) { window.addEventListener(ev, onFirstAct, { capture: true, passive: true }); });
  }
  if (document.readyState === 'complete') afterLoad();
  else window.addEventListener('load', afterLoad);

  /* DOORS. A few app actions open a feature whose code is now lazy; they are wrapped
     here so the feature loads before the action runs, and nothing in app3.js had to learn
     about it. Deferred scripts have all run by DOMContentLoaded, so `app` (a top-level
     const in app3.js — a bare name, not window.app) exists by then. A tap that arrives
     before the code does simply runs when it lands. */
  var DOORS = { arcadePlay: 'arcade', arcadeMenu: 'arcade', dbgSaga: 'arcade', openLore: 'quizhubs', openHive: 'quizhubs' };
  /* KICKS start a screen's data the moment its door is opened but do NOT hold the screen:
     it draws at once from what is in hand and redraws as each file lands (every load
     re-renders). For screens that are useful before the whole library is in. */
  var KICKS = { openBuilder: ['themes', 'lists'], openFinder: 'words', openTraps: 'card' };
  document.addEventListener('DOMContentLoaded', function () {
    /* A RETURNING SPELLER'S HOME NEEDS THE ATLAS FRONTIER NOW (audit v4 B6). Home holds "Next on your
       journey" until trail-data.js lands, and after `load` + an idle slice that was seconds after the
       words were up. Every deferred script has run by this event (app3's first render included), so
       the boot JS is in: if Home is what that render drew, ask for FIRST now. (Not app3's `state` —
       inside this file that name is the loader's own.) A new visitor still waits for `load`. */
    try { if (document.querySelector('#root .sb-home-r2')) FIRST.forEach(function (n) { load(n); }); } catch (e) {}
    try {
      if (typeof app === 'undefined') return;
      Object.keys(DOORS).forEach(function (k) {
        var f = app[k]; if (typeof f !== 'function' || f._door) return;
        var g = function () {
          var a = arguments, self = this;
          if (ready(DOORS[k])) return f.apply(self, a);
          need(DOORS[k], function () { f.apply(self, a); });
        };
        g._door = true; app[k] = g;
      });
      Object.keys(KICKS).forEach(function (k) {
        var f = app[k]; if (typeof f !== 'function' || f._door) return;
        var g = function () { need(KICKS[k]); return f.apply(this, arguments); };
        g._door = true; app[k] = g;
      });
    } catch (e) {}
  });

  /* The header search suggests from the whole served corpus, most of which is the second
     word shard: ask for it the moment the box is focused, not when the first suggestion
     would already have been drawn from the boot tier alone. */
  document.addEventListener('focusin', function (e) {
    try { if (e.target && e.target.closest && e.target.closest('.sb-hsearch')) need('words'); } catch (err) {}
  }, true);

  window.SB_LAZY = { need: need, ready: ready, reg: REG, group: GROUP, start: start,
    state: function (n) { return state[n] || null; } };
})();
