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
    homeArt: 'sb_home_art',   /* the pictures Home's first screen showed last time: index.html's parse-time peek preloads them (audit v4 B6) */
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
    },
    /* v8 → v9: the grown-up PIN is kept salted and hashed, never as its digits (audit v4 Q1). A
       household that holds the four digits has them replaced by their record (pinMake below);
       the same four digits still open the gate. */
    function v8_to_v9(b) {
      if (b.pin != null && b.pin !== '' && !isPinRec(b.pin)) b.pin = pinMake(String(b.pin));
      else if (b.pin === '') b.pin = null;
      return b;
    },
    /* v9 → v10: a level is the CHILD's, per game and per hub mode (games spec §1.7): c.levels[key] =
       {level, history:[pct…]}, kept by app3's SB_LEVEL. Seeded from the old per-game choice
       (c.gameDiffBy) so nobody's chosen level resets; the games that left the Play tab hand theirs to
       the hub modes that took their place (Beat the Buzzer → Spelling Gym's Sprint and Warm-up, Magic
       Squares → Squares, Word Quiz → Word Lore's Meanings). gameDiffBy stays — the engines read it. */
    function v9_to_v10(b) {
      var MAP = { beat: ['gym/sprint', 'gym/warmup'], magic: ['gym/squares'], wordquiz: ['lore/meanings'] };
      var OK = { auto: 1, easy: 1, medium: 1, hard: 1, champ: 1 };
      (b.children || []).forEach(function (ch) { if (!ch) return;
        if (!ch.levels || typeof ch.levels !== 'object' || Array.isArray(ch.levels)) ch.levels = {};
        var by = (ch.gameDiffBy && typeof ch.gameDiffBy === 'object') ? ch.gameDiffBy : {};
        Object.keys(by).forEach(function (k) { var lv = by[k]; if (!OK[lv] || lv === 'auto') return;
          (MAP[k] || [k]).forEach(function (key) { if (!ch.levels[key]) ch.levels[key] = { level: lv, history: [] }; }); }); });
      return b;
    },
    /* v10 → v11: a child's bests follow their games into the hubs (games spec §3.1, T12). The cards
       that left (Beat the Buzzer, Magic Squares, Word Quiz, Bee Trivia) kept no best of their own —
       the record is the child's activity log (c.activity: kind, done, right) and Bee Trivia's
       c.trivia.clockBest — so each new home starts at the best the child already set there, not at 0:
       Beat the Buzzer → gym/sprint · its Warm-Up → gym/warmup · Magic Squares → gym/squares · Spot the
       Spelling → gym/spot · Meanings and Vocabulary → lore/meanings · Origins → lore/origins · Idioms and
       Similes → lore/idioms · Bee Trivia, its Squares and its Beat the Clock → both lore/ and hive/
       (one card split in two, so both halves inherit it). c.bests[key] = {right, of, at, from}; a
       timed best has of:null. An existing better best is never overwritten. app3's SB_BESTS reads it. */
    function v10_to_v11(b) {
      var KIND = { beat: [['gym/sprint', 0]], buzz: [['gym/warmup', 1]], magic: [['gym/squares', 1]], spell: [['gym/spot', 1]],
        meaning: [['lore/meanings', 1]], vocab: [['lore/meanings', 1]], origin: [['lore/origins', 1]], idiom: [['lore/idioms', 1]], simile: [['lore/idioms', 1]] };
      var TRIV = { 'Bee Trivia': [['lore/roots', 1], ['hive/classic', 1]], 'Trivia Squares': [['lore/squares', 1], ['hive/squares', 1]],
        'Trivia \u2014 Beat the Clock': [['lore/clock', 0], ['hive/clock', 0]] };
      function ratio(x) { return x.of ? x.right / x.of : x.right; }
      function put(ch, key, right, of, at, from) { right = +right || 0; if (right <= 0) return;
        var n = { right: right, of: of ? +of : null, at: at || 0, from: from }, o = ch.bests[key];
        if (!o || ratio(n) > ratio(o) || (ratio(n) === ratio(o) && (n.of || 0) > (o.of || 0))) ch.bests[key] = n; }
      (b.children || []).forEach(function (ch) { if (!ch) return;
        if (!ch.bests || typeof ch.bests !== 'object' || Array.isArray(ch.bests)) ch.bests = {};
        (Array.isArray(ch.activity) ? ch.activity : []).forEach(function (e) { if (!e || !e.kind) return;
          var to = e.kind === 'trivia' ? TRIV[e.label] : KIND[e.kind]; if (!to) return;
          to.forEach(function (t) { put(ch, t[0], e.right, t[1] ? (e.done || null) : null, e.ts, e.kind === 'trivia' ? e.label : e.kind); }); });
        var cb = ch.trivia && +ch.trivia.clockBest; if (cb) { put(ch, 'lore/clock', cb, null, 0, 'trivia.clockBest'); put(ch, 'hive/clock', cb, null, 0, 'trivia.clockBest'); } });
      return b;
    }
  ];

  /* ---------------------------------------------------------------- the grown-up PIN
     Stored SALTED AND HASHED (audit v4 Q1): "p1$<salt>$<rounds>$<hash>", the hash being SHA-256
     over salt + ":" + PIN, then re-hashed with the salt <rounds> times. A household blob, a backup
     file or a peek at storage shows that record and never the digits. It is synchronous on
     purpose — pinGate checks on the fourth keystroke and carries straight on — and written out
     here in plain JS because SubtleCrypto's digest is asynchronous and is not offered to every
     page opened from file://. Four digits are 10,000 guesses whatever the hash, so this keeps
     the PIN out of sight; it does not make it a lock, and the dialog still says so.
     A record is made by pinMake, checked by pinCheck, and saveHousehold never writes the
     digits even if a caller hands them over (a PIN set directly in state, as tests do). */
  var PIN_ROUNDS = 1000;
  var K256 = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
  function sha256hex(str) {
    var u = unescape(encodeURIComponent(String(str))), bytes = [], i, t;
    for (i = 0; i < u.length; i++) bytes.push(u.charCodeAt(i));
    var bits = bytes.length * 8; bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    for (i = 7; i >= 0; i--) bytes.push(i >= 4 ? 0 : (bits >>> (i * 8)) & 0xff);
    var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19], W = new Array(64);
    for (var o = 0; o < bytes.length; o += 64) {
      for (t = 0; t < 16; t++) W[t] = (bytes[o + 4 * t] << 24) | (bytes[o + 4 * t + 1] << 16) | (bytes[o + 4 * t + 2] << 8) | bytes[o + 4 * t + 3];
      for (t = 16; t < 64; t++) { var x = W[t - 15], y = W[t - 2];
        W[t] = (W[t - 16] + (((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3)) + W[t - 7] + (((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10))) | 0; }
      var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (t = 0; t < 64; t++) {
        var T1 = (h + (((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))) + ((e & f) ^ (~e & g)) + K256[t] + W[t]) | 0;
        var T2 = ((((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
        h = g; g = f; f = e; e = (d + T1) | 0; d = c; c = b; b = a; a = (T1 + T2) | 0; }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    return H.map(function (v) { return ('0000000' + (v >>> 0).toString(16)).slice(-8); }).join('');
  }
  var PIN_RE = /^p1\$([0-9a-f]{16,64})\$(\d{1,6})\$([0-9a-f]{64})$/;
  function isPinRec(v) { return typeof v === 'string' && PIN_RE.test(v); }
  function pinDigest(pin, salt, rounds) { var h = sha256hex(salt + ':' + pin); for (var i = 1; i < rounds; i++) h = sha256hex(salt + h); return h; }
  function pinSalt() { var s = '', i, r = null;
    try { r = new Uint8Array(16); (window.crypto || window.msCrypto).getRandomValues(r); } catch (e) { r = null; }
    for (i = 0; i < 16; i++) s += ('0' + ((r ? r[i] : Math.floor(Math.random() * 256)) & 255).toString(16)).slice(-2);
    return s; }
  function pinMake(pin) { var salt = pinSalt(); return 'p1$' + salt + '$' + PIN_ROUNDS + '$' + pinDigest(String(pin), salt, PIN_ROUNDS); }
  /* the digits typed against what is kept. A bare-digits value can only be in memory (a test, or
     a state written before the next save) and is compared as it is; storage never holds one. */
  function pinCheck(pin, rec) {
    if (rec == null || rec === '' || pin == null) return false;
    var m = PIN_RE.exec(String(rec)); if (!m) return String(rec) === String(pin);
    return pinDigest(String(pin), m[1], +m[2]) === m[3]; }
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
    /* a PIN still held as digits (a household or a restored backup from before v9) is written
       back as its record at once, rather than waiting for the next save() */
    loadHousehold: function () { var raw = rget(KEYS.household); if (raw == null) return null; var b; try { b = JSON.parse(raw); } catch (e) { return null; }
      var plain = b && b.pin != null && b.pin !== '' && !isPinRec(b.pin);
      b = migrate(b);
      if (plain && !READ_ONLY && b && isPinRec(b.pin)) rset(KEYS.household, JSON.stringify(b));
      return b; },
    saveHousehold: function (b) { if (READ_ONLY || !b) return false; b.sv = SCHEMA;
      if (b.pin != null && b.pin !== '' && !isPinRec(b.pin)) b.pin = pinMake(String(b.pin));   // never the digits
      return rset(KEYS.household, JSON.stringify(b)); },
    pinMake: pinMake, pinCheck: pinCheck, isPinRec: isPinRec, sha256: sha256hex,
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
