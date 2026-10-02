/* store.js — THE SEAM (FIX-BEE N4, Oct 2026).

   Every byte Bizzing Bee keeps on this device goes through here. Nothing else names
   localStorage (tests/store-seam.cjs reads every shipped file and fails on a stray), with two
   named exceptions in index.html that run at PARSE time, before any file can load: the splash
   reads two keys to decide whether to play, and ?demo swaps the storage object itself for an
   in-memory sandbox. Today the seam is localStorage; when the family server arrives it is this
   file that changes, and no caller does.

   It is the FIRST deferred script, so every file that reads storage while it loads (auth.js
   purges, worlds4.js reads the music switch, telemetry.js its arm flag) finds it in place.

   Three buckets, and the difference matters:
     household — the one blob, sb_saas_v2: the household, its children, their progress. It is
                 VERSIONED by `sv`. STEPS[n] takes it from v(n+1) to v(n+2), is one small
                 function, and never reaches backwards. A blob written by a NEWER build is never
                 written over (readOnly) — an old tab left open must not downgrade a family.
     device    — this browser's business: splash, music, focus, voice, testing unlock, bug notes,
                 research log, arcade bests… Never part of a child's record.
     family    — keys every Bizzing app shares by contract (bizzing.wallet, bizzing.activity).
                 Their shape belongs to the family standard, not to this file.
   A name that is not in KEYS throws: a new key is a decision, not an accident. */
(function () {
  var KEYS = {
    household: 'sb_saas_v2',
    splash: 'sb_splash', music: 'sb_w4_music', sound: 'sb_sound', volume: 'sb_volume', mute: 'sb_mute', greet: 'sb_greet', focus: 'sb_w4_focus', voice: 'sb_voice',
    devunlock: 'sb_devunlock', vflags: 'sb_vflags', bugs: 'sb_bugs', evofeedback: 'sb_evofeedback',
    daily: 'sb_daily', arcBest: 'sb_arc_best', bizzSeen: 'sb_bizz_seen', mockbee: 'sb_mockbee',
    tmLog: 'sb_tm_log', tmArm: 'sb_tm_on', accounts: 'sb_accounts_v1', session: 'sb_session_v1',
    cloudSession: 'sb_session_v2', syncMeta: 'sb_sync_v1',
    wallet: 'bizzing.wallet', activity: 'bizzing.activity'
  };
  var FAMILY = { wallet: 1, activity: 1 };
  var REAL = {}; Object.keys(KEYS).forEach(function (n) { REAL[KEYS[n]] = n; });

  /* ---------------------------------------------------------------- the steps
     Each was an ad-hoc block in app3's init that guarded itself with a receipt. They run here,
     in the order they always ran, exactly once per household. They may call app3 helpers
     (nkey, mastDay) because loadHousehold() is only ever called from app3's init. */
  var THEME_PRICE = 400;   // what a world cost while worlds were sold for coins (COST.theme)
  var STEPS = [
    /* v1 → v2: the Chapter 1 insert shifted concept indices by 11; index-keyed coin unlocks move once */
    function v1_to_v2(b) {
      var now = 121; try { var C = window.SB_CONCEPTS; if (C && C.chapters && C.chapters.length) now = C.chapters.length; } catch (e) {}
      var shift = now - (b.cN || 110);
      if (shift > 0) (b.children || []).forEach(function (ch) { if (ch && ch.unlockedConcepts) { var u = {}; Object.keys(ch.unlockedConcepts).forEach(function (k) { u[+k + shift] = 1; }); ch.unlockedConcepts = u; } });
      return b;
    },
    /* v2 → v3: test coins never survive, and neither does the legacy cheat (a build that handed out
       5,000,000 coins the instant testing was switched on). Plans grant no coins, so the floor is 0. */
    function v2_to_v3(b) {
      (b.children || []).forEach(function (ch) { if (!ch) return;
        if (ch.devCoins) { ch.coins = ch.devCoinsBank || 0; ch.devCoins = 0; delete ch.devCoinsBank; }
        else if ((ch.coins || 0) >= 1000000) { ch.coins = 0; ch.coinsReset = 1; } });
      return b;
    },
    /* v3 → v4: bee-style accessories were withdrawn; whoever bought one gets the full price back */
    function v3_to_v4(b) {
      var PAID = { crown: 120, halo: 110, bow: 100, cape: 150, mustache: 100, sceptre: 180, funbrella: 160 };
      (b.children || []).forEach(function (ch) { if (!ch) return; var own = Object.keys(ch.beeAcc || {}); if (!own.length && !ch.accOn) return;
        var back = own.reduce(function (t, k) { return t + (PAID[k] || 100); }, 0);
        if (back) { ch.coins = (ch.coins || 0) + back; ch.accRefund = back; }
        delete ch.beeAcc; delete ch.accOn; });
      return b;
    },
    /* v4 → v5: the Aug-31 world cut — a coin-bought removed world is refunded, a save sitting in one
       moves to the Hive (archive/store-cut-2026-08.md) */
    function v4_to_v5(b) {
      var GONE = { marquee: 1, serpent: 1, origami: 1, pixel: 1 }, PAIDW = { serpent: 1, origami: 1, pixel: 1 };
      (b.children || []).forEach(function (ch) { if (!ch) return; var un = ch.unlockedThemes || [];
        if (un.some(function (t) { return GONE[t]; })) { var back = 0; un.forEach(function (t) { if (PAIDW[t]) back += THEME_PRICE; });
          ch.unlockedThemes = un.filter(function (t) { return !GONE[t]; });
          if (back) { ch.coins = (ch.coins || 0) + back; ch.worldRefund = (ch.worldRefund || 0) + back; } }
        if (GONE[ch.theme]) ch.theme = 'spellbound'; });
      if (GONE[b.theme]) b.theme = 'spellbound';
      return b;
    },
    /* v5 → v6: Aurora became a starter world (Sep-30); its buyers get the price back */
    function v5_to_v6(b) {
      (b.children || []).forEach(function (ch) { if (!ch) return; var un = ch.unlockedThemes || [];
        if (un.indexOf('aurora') < 0) return;
        ch.unlockedThemes = un.filter(function (t) { return t !== 'aurora'; });
        ch.coins = (ch.coins || 0) + THEME_PRICE; ch.auroraRefund = (ch.auroraRefund || 0) + THEME_PRICE; });
      return b;
    },
    /* v6 → v7: mastery from evidence (FIX-BEE D5). The household's old shared map (one right answer
       or a self-mark — no way to tell which) is carried onto EACH child as box 2 flagged `leg`, due
       today: every stage and heatmap stays as the child left it, and the report will not count it as
       retained until a re-check proves it. Skipped if any child already has a record. */
    function v6_to_v7(b) {
      var kids = b.children || []; if (!kids.length || kids.some(function (k) { return k && k.mast && typeof k.mast === 'object'; })) return b;
      var day = (typeof mastDay === 'function') ? mastDay() : Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
      var norm = (typeof nkey === 'function') ? nkey : function (w) { return String(w || '').toLowerCase(); };
      var lu = b.lu || {}; var keys = Object.keys(lu).filter(function (k) { return lu[k]; });
      kids.forEach(function (k) { if (!k) return; if (!k.mast || typeof k.mast !== 'object' || Array.isArray(k.mast)) k.mast = {};
        keys.forEach(function (w) { var key = norm(w); if (key && !Object.prototype.hasOwnProperty.call(k.mast, key)) k.mast[key] = { b: 2, due: day, d: day - 1, ok: 1, n: 1, leg: 1 }; }); });
      return b;
    },
    /* v7 → v8: worlds open by the family rule now (FIX-BEE v2, standard §7): worlds 1–2 for everyone,
       3+ with the family plan or for 240 coins. They used to open on the Level ladder too, so a world
       a child had ALREADY reached by Level is theirs to keep: it is written into unlockedThemes, which
       the new rule still honours, and nothing is charged. `worldsKept` is the receipt. */
    function v7_to_v8(b) {
      var LV = { anime: 3, science: 5, avatar: 7, godly: 9, race: 10, dino: 11 };
      (b.children || []).forEach(function (ch) { if (!ch) return; var lv = 0;
        try { lv = (typeof rankOf === 'function') ? rankOf(ch).level : 0; } catch (e) { lv = 0; }
        var un = Array.isArray(ch.unlockedThemes) ? ch.unlockedThemes.slice() : [], kept = [];
        Object.keys(LV).forEach(function (w) { if (lv >= LV[w] && un.indexOf(w) < 0) { un.push(w); kept.push(w); } });
        if (kept.length) { ch.unlockedThemes = un; ch.worldsKept = kept; } });
      return b;
    }
  ];
  var SCHEMA = STEPS.length + 1;
  var READ_ONLY = false, ran = [];

  function name(n) { if (!Object.prototype.hasOwnProperty.call(KEYS, n)) throw new Error('SB_STORE: unregistered key "' + n + '"'); return KEYS[n]; }
  function ls() { try { return window.localStorage; } catch (e) { return null; } }
  function rget(k) { try { var s = ls(); return s ? s.getItem(k) : null; } catch (e) { return null; } }
  function rset(k, v) { try { var s = ls(); if (!s) return false; s.setItem(k, String(v)); return true; } catch (e) { return false; } }
  function rdel(k) { try { var s = ls(); if (s) s.removeItem(k); } catch (e) {} }
  /* a real key the raw door may touch: one we registered, or any of Bee's own sb_ keys (backup and
     erase must reach keys an older build left behind) */
  function mine(k) { return typeof k === 'string' && (Object.prototype.hasOwnProperty.call(REAL, k) || /^sb_/.test(k)); }

  function migrate(b) {
    if (!b || typeof b !== 'object') return b;
    var v = +b.sv || 1;
    if (v > SCHEMA) { READ_ONLY = true; return b; }
    while (v < SCHEMA) { b = STEPS[v - 1](b) || b; v++; b.sv = v; ran.push('v' + (v - 1) + '_to_v' + v); }
    return b;
  }

  window.SB_STORE = {
    SCHEMA: SCHEMA, KEYS: KEYS,
    /* by NAME */
    get: function (n) { return rget(name(n)); },
    set: function (n, v) { return rset(name(n), v); },
    del: function (n) { rdel(name(n)); },
    getJSON: function (n, fb) { var r = rget(name(n)); if (r == null) return fb; try { var v = JSON.parse(r); return v == null ? fb : v; } catch (e) { return fb; } },
    setJSON: function (n, v) { return rset(name(n), JSON.stringify(v)); },
    isFamily: function (n) { name(n); return !!FAMILY[n]; },
    /* the household */
    loadHousehold: function () { var raw = rget(KEYS.household); if (raw == null) return null; var b; try { b = JSON.parse(raw); } catch (e) { return null; } return migrate(b); },
    saveHousehold: function (b) { if (READ_ONLY || !b) return false; b.sv = SCHEMA; return rset(KEYS.household, JSON.stringify(b)); },
    readOnly: function () { return READ_ONLY; },
    migrated: function () { return ran.slice(); },
    migrate: migrate,
    /* by REAL key — backup, restore and erase only. Bee's own keys and the family keys, nothing else. */
    keys: function () { var out = [], s = ls(); try { for (var i = 0; s && i < s.length; i++) { var k = s.key(i); if (mine(k)) out.push(k); } } catch (e) {} return out; },
    getKey: function (k) { if (!mine(k)) throw new Error('SB_STORE: not a Bizzing Bee key "' + k + '"'); return rget(k); },
    setKey: function (k, v) { if (!mine(k)) throw new Error('SB_STORE: not a Bizzing Bee key "' + k + '"'); if (k === KEYS.household && READ_ONLY) return false; return rset(k, v); },
    delKey: function (k) { if (!mine(k)) throw new Error('SB_STORE: not a Bizzing Bee key "' + k + '"'); rdel(k); }
  };
})();
