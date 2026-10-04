/* family-shell.js — Bizzing Bee's half of the Bizzing family standard (FIX-BEE, Oct 2026).

   Five things every Bizzing app does the same way, kept in one file so they can be read
   together and so app3.js only has to call into them:

     1. THE NEXT STEP. `SB_NEXT_STEP()` is the ONE reading of "what should this child do
        next". Home's Continue card, the drawer and the Hive's `#/continue` deep link go there
        through `app.goNext` — the Atlas, on the child's region with their stop selected — and
        the end of onboarding and of placement through `app.goStep`, straight into it; both
        read the same next step, so no two screens can ever offer next steps that disagree. It
        is built on trail.js's `SB_TRAIL_NEXT` (the Atlas frontier) and adds the one thing the
        frontier does not know: an untouched stop opens on its LESSON, because the why comes
        before the drill.
     2. THE HASH. `state` is mirrored into `location.hash` after every render, and `popstate`
        maps the hash back onto the same openers the buttons use (so a deep link can never
        skip a lock). History has a ROOT entry under the first screen: backing onto it pushes
        the app straight back, which is what "back never leaves the app" means on a phone.
     3. THE HIVE. Active minutes go to `bizzing.activity` through the family drop-in
        (bizzing-activity.js, ported); milestones — an Atlas stop or region cleared, a new
        spelling level, a list stage mastered — are noticed after each render by comparing a
        small per-child snapshot (`c.hiveMs`), so every road to a milestone counts once.
     4. THE HOUSEHOLD. The child switcher in the top bar, and the per-child word book: the
        mastered-word map, the SRS boxes and the coach history used to be one household-wide
        object, so a second child inherited the first one's mastery. They now travel with the
        child (`c._lu`, `c._srs`, `c._chist` while that child is not the active one).
     5. DEMO. `?demo` runs a sample child inside a storage SANDBOX installed by the inline
        script at the top of <body>: every storage read and write goes to memory, so the
        real household, `bizzing.activity` and `bizzing.wallet` are never read or written.

   Loaded before app3.js. Everything that touches app3's globals (`state`, `app`, `active`,
   `render`…) does so at call time, never at load time. */
(function () {
  'use strict';
  var HIVE_URL = 'https://aayuvis.github.io/Bizzing_Schedule/';
  var Q = ''; try { Q = location.search || ''; } catch (e) {}
  var DEMO = !!window.SB_DEMO;
  var FROM_HIVE = /[?&]from=hive(?:&|$)/.test(Q);
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var ymd = function (d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  var H = function (s) { try { return esc(s); } catch (e) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) { return '&#' + ch.charCodeAt(0) + ';'; }); } };

  /* ------------------------------------------------------------------ 1. NEXT STEP */
  function trailNext() { try { return (typeof window.SB_TRAIL_NEXT === 'function') ? window.SB_TRAIL_NEXT() : null; } catch (e) { return null; } }
  function nextStep() {
    var nx = trailNext();
    if (!nx) return { ready: false, label: 'Start', title: 'Start at the Meadow', act: 'The Word Atlas', sub: '',
      world: 'meadow', done: 0, total: 0, lap: 1, pct: 0, kind: 'unit', allDone: false, lesson: true };
    var r = {}; for (var k in nx) r[k] = nx[k];
    r.ready = true;
    r.label = nx.done ? 'Continue' : 'Start';
    r.pct = nx.total ? Math.max(0, Math.min(100, Math.round(nx.done / nx.total * 100))) : 0;
    r.lesson = false;
    if (nx.kind === 'unit' && !nx.allDone) {
      try {
        var c = active(); var rec = (((c.trail || {}).st) || {})[nx.arg + ':' + nx.lap] || {};
        var hasL = (typeof window.SB_TRAIL_HASLESSON === 'function') ? window.SB_TRAIL_HASLESSON(nx.arg) : true;
        r.lesson = hasL && !rec.l && !rec.w && !(rec.p > 0) && !(rec.q > 0);
      } catch (e) {}
    }
    return r;
  }
  /* CONTINUE GOES TO THE ATLAS (owner, 4 Oct 2026: "HOME screen should take to world atlas and
     show kids where they are"). Home's Continue, the drawer's next step and #/continue (the
     Hive's ?from=hive too) open the child's region with their stop selected and its card open,
     the camera on their avatar — the stop's Start is one tap away, and the child sees where it
     is first (trail.js trailHere: the same lock a tap on the region meets). A new speller is at
     the first region's first stop. Every stop of the tier walked: the Atlas itself, saying so. */
  function goNext() {
    var run = function () {
      var n = nextStep();
      if (n.ready && !n.allDone && n.actId && app.trailHere) { app.trailHere(n.crs + '|' + n.actId, n.node); return; }
      app.openTrail ? app.openTrail() : app.setNav('trail');
      if (n.ready && n.allDone) { try { flash('Every stop on Tier ' + n.lap + ' is walked. ✓'); } catch (e) {} }
    };
    leaveDrill();
    /* the WHOLE atlas group, not just trail-data.js: the region board reads the concept course
       and the Advanced Rounds (chOf), and one next step means one answer, whenever it is asked —
       Home's Continue once ran before the course was in and disagreed with #/continue. */
    lazyNeed('atlas', run);
  }
  /* STRAIGHT INTO THE STEP — the end of setup and of placement only. A first run still ends
     INSIDE the first lesson (FIX-BEE A3, A8): a child who has just made a speller is not shown a
     map first. The same next step as goNext; an untouched stop opens on its LESSON. */
  function goStep() {
    var run = function () {
      var n = nextStep();
      if (!n.ready || n.allDone || !app[n.go]) { app.openTrail ? app.openTrail() : app.setNav('trail'); return; }
      app[n.go](n.arg);
      if (n.lesson && state.trailView === 'unit' && state.trailUnit === n.arg && app.trailLesson) {
        /* the lesson reads the concept course, which is lazy too — the stop shows while it lands */
        lazyNeed('concepts', function () { try { if (state.trailUnit === n.arg) { try { loadConcepts(); } catch (e) {} app.trailLesson(); } } catch (e) {} });
      }
    };
    leaveDrill();
    /* the WHOLE atlas group: nextStep()'s "untouched stop opens on its lesson" reads the concept course */
    lazyNeed('atlas', run);
  }
  /* The child's place, said in words for the progress strip beside Continue. The level half is
     THE one level (SB_ONE_LEVEL, app3's oneLevel — words spelled right, worn as the bee's form);
     the Bee Band is the difficulty underneath and is never shown as a level (FIX-BEE C6). */
  function levelWords(c) {
    try { if (typeof window.SB_ONE_LEVEL === 'function') return window.SB_ONE_LEVEL(c).label;
      return ''; } catch (e) { return ''; }
  }

  /* ------------------------------------------------------------------ drills */
  /* Is a drill or game word live on screen? The ⬡ and the Hive chip hide then, so a stray
     tap cannot throw a child out of the app mid-word. */
  function inDrill() {
    try {
      var S = state;
      if (S.screen !== 'app') return false;
      if (S.nav === 'train' && !S.sessionOver) return true;
      if (S.nav === 'leveltest' && S.lt && !S.lt.done) return true;
      if (S.nav === 'trail' && S.trailView === 'quiz' && S.tq && !S.tq.over) return true;
      if (S.nav === 'coach' && /^(written|oral|challenge)$/.test(S.coachMode || '')) return true;
      /* a classic game is live once past its menu and until its result */
      if (S.game && !/^(mode|pick|setup)$/.test(S.game.phase || '') && !/^(over|done|result|board)$/.test(S.game.status || '')) return true;
      if (S.nav === 'mockbee' && S.mb && S.mb.view === 'stage') return true;
      return !!document.querySelector('.arc-play,.bz-play');
    } catch (e) { return false; }
  }
  /* What the old back-button trap did, plus the arcade overlays: a drill that is being left
     is stopped, never left running under the next screen. */
  function leaveDrill() {
    try { if (typeof arcadeClose === 'function' && document.querySelector('.arc-play,.arc-menu')) arcadeClose(); } catch (e) {}
    try { if (typeof bizzClose === 'function' && document.querySelector('.bz-play')) bizzClose(); } catch (e) {}
    try { if (typeof clearGTimer === 'function') clearGTimer(); } catch (e) {}
    try { if (typeof tyStop === 'function') tyStop(); } catch (e) {}
    try { state.game = null; state.sq = null; } catch (e) {}
  }

  /* ------------------------------------------------------------------ 2. THE HASH */
  var NAV_ROUTE = { coach: 'practice', explore: 'library', games: 'play', collection: 'hive', beeband: 'level' };
  var ROUTE_NAV = { practice: 'coach', library: 'explore', play: 'games', hive: 'collection', level: 'beeband' };
  /* Screens that draw correctly from nothing but their nav. Anything else needs live
     sub-state (a running drill, an open book) and is restored to its parent screen. */
  var RESTORABLE = { shop: 1, help: 1, home: 1, concepts: 1, coach: 1, quest: 1, explore: 1, themes: 1, figurative: 1, vocab: 1, quotes: 1,
    trivtrain: 1, ipatrain: 1, typing: 1, builder: 1, beeband: 1, coachdesk: 1, traps: 1, revisions: 1, evolution: 1,
    collection: 1, finder: 1, games: 1, trivia: 1, journeys: 1, adv: 1, progress: 1, feed: 1, daily: 1 };
  /* screens with a gated opener — an address goes through it: the trainTools plan lock
     (gateFeature) and the Advanced Pack's sales page, which asks for the PIN first (T3) */
  var DOOR = { quotes: 'openQuotes', vocab: 'openVocab', typing: 'openTyping', ipatrain: 'openIpaTrain', trivtrain: 'openTrivTrain', adv: 'openAdvanced' };
  var PARENT = { train: 'coach', levelup: 'coach', leveltest: 'home', mockbee: 'games', sq: 'games', reader: 'explore',
    debug: 'home', voicetest: 'home', evofeedback: 'home', parent: 'progress' };

  /* the route of the SCREEN, ignoring layers drawn over it */
  function baseRoute() {
    var S = state;
    if (S.screen === 'landing') return 'welcome';
    if (S.screen === 'auth') return 'signin';
    if (S.screen === 'onboarding') return 'setup/' + (S.onbStep | 0);
    if (S.screen === 'admin') return 'support';
    var n = S.nav || 'home';
    if (n === 'trail') {
      var v = S.trailView || 'map';
      if (v === 'quiz') return S.trailChk ? 'check/' + (S.trailCourse || 'honey') + '|' + S.trailChk : 'stop/' + (S.trailUnit || '') + '/quiz';
      if ((v === 'unit' || v === 'words') && S.trailUnit) return 'stop/' + S.trailUnit + (v === 'words' ? '/words' : '');
      if (v === 'act' && S.trailAct) return 'atlas/' + (S.trailActCrs || S.trailCourse || 'honey') + '/' + S.trailAct;
      if (v === 'ultra') return 'atlas/ultra' + (S.ultraAct != null ? '/' + S.ultraAct : '');
      return 'atlas';
    }
    if (n === 'concepts') {
      /* by title as well as identity: the course array is rebuilt when a shard lands, and a
         route that flickered to 'concepts' would push a history entry nobody asked for */
      if (S.conceptSel) { var i = (S.conceptData || []).findIndex(function (ch) { return ch === S.conceptSel || (ch && ch.title && ch.title === S.conceptSel.title); }); return 'concepts' + (i >= 0 ? '/' + i : ''); }
      return 'concepts';
    }
    if (n === 'collection') return 'hive' + (S.collTab ? '/' + S.collTab : '');
    if (n === 'shop') return 'shop/' + (S.shopTab || 'avatars');
    if (n === 'progress' || n === 'parent') return S.progTab === 'parent' ? 'grownups' : 'progress';
    if (n === 'train') return 'practice/drill';
    if (n === 'games' && S.game) return 'play/game';
    return NAV_ROUTE[n] || n;
  }
  function routeOf() { var o = overlayRoute(); if (o) return o; return state.settingsOpen && state.screen === 'app' ? 'settings' : baseRoute(); }
  /* THE ARCADE OVERLAY HAS AN ADDRESS (games spec §1.6, T9). The race, the blaster and the maze
     play in a fullscreen overlay app3 appends to <body>, outside the string render, so the
     screen under it never changed its route and Back had nothing to step back from. An overlay
     that carries data-route is a SCREEN to the router: its route is the address while it is up,
     its history entry is marked {ov:1}, Back from it lands where it was opened from, and
     #/play/<slug> opens it through the same arcadePlay a tap uses. */
  var PLAY_SLUG = { grandprix: 'beeGrandPrix', blaster: 'typeBlaster', honeycomb: 'honeycombRun' };
  function playRoute(k) { for (var s in PLAY_SLUG) if (PLAY_SLUG[s] === k) return 'play/' + s; return k ? 'play/' + k : null; }
  function overlayRoute() { try { var el = document.querySelector('.arc-play[data-route]'); return el ? el.getAttribute('data-route') : null; } catch (e) { return null; } }
  /* the overlay's own way out (← Arcade): step back over its entry so Back does not reopen it */
  function leaveOverlay() {
    try { if (history.state && history.state.ov) { history.back(); return; } } catch (e) {}
    syncHash(); try { render(); } catch (e) {}
  }

  var R = { last: null, booted: false, applying: false, pending: null };
  function urlFor(r) { return '#/' + r; }
  function syncHash() {
    var r = routeOf();
    if (r === R.last) return;
    try {
      var st = overlayRoute() === r ? { sb: 1, ov: 1 } : { sb: 1 };
      if (R.applying) history.replaceState(st, '', urlFor(r));
      else history.pushState(st, '', urlFor(r));
    } catch (e) {}
    R.last = r;
  }
  /* A route is a new screen, and nothing drawn over the old one survives it. #/journeys once
     left its PIN dialog standing, and every route after it changed the screen unseen
     underneath — a modal over a screen nobody could reach. Every layer goes: the PIN, the plan
     sheet and paywall, the ☰ drawer, the wallet, the child menu, the word / quote / list / deck
     pop-ups, the account sheets, a celebration card, and the avatar cards app3 draws straight
     onto <body>. A route that wants a layer (settings, a gated screen) opens its own after. */
  function dropLayers() {
    try {
      var S = state;
      S.pinDlg = null; S.showTiers = false; S.showPaywall = false; S._planOk = false;
      S.drawerOpen = false; S.walletOpen = false; S.famMenu = false;
      S.wordCard = null; S.qWord = null; S.listView = null; S.deckOpen = false; S.ttList = null;
      S.authSheet = null; S.cloudSheet = null; S.celebrate = null;
    } catch (e) {}
    try {
      [].forEach.call(document.querySelectorAll('.avc-ov'), function (ov) {
        var x = ov.querySelector('[data-avd="close"]');   // the deck holds a key listener; its own close lets it go
        if (x) x.click(); else ov.remove();
      });
    } catch (e) {}
  }
  /* Map a route back onto the openers the UI itself uses — the same gates apply. */
  function applyRoute(r) {
    var p = String(r || '').split('/'), head = p[0];
    var kids = !!(state.children && state.children.length);
    dropLayers();
    if (head === 'welcome' || head === 'signin' || head === 'setup') {
      if (state.screen === 'onboarding' && head === 'setup') { var st = Math.max(0, Math.min(state.onbStep | 0, (+p[1]) | 0)); set({ onbStep: st }); return; }
      if (state.screen === 'auth' && head === 'welcome') { set({ screen: 'landing' }); return; }
      if (!kids) { set({ screen: 'landing', nav: 'home' }); return; }
      app.setNav('home'); return;
    }
    if (!kids) { set({ screen: 'landing', nav: 'home' }); return; }
    if (state.screen !== 'app') state.screen = 'app';
    if (head !== 'settings' && state.settingsOpen) { state.settingsOpen = false; state._setOpened = false; }
    if (head === 'continue') { goNext(); return; }
    if (head === 'settings') { app.setNav('settings'); return; }
    leaveDrill();
    if (head === 'home') { app.setNav('home'); return; }
    if (head === 'atlas') {
      if (p[1] === 'ultra') { if (p[2] != null && app.ultraAct) app.ultraAct(+p[2]); else app.openTrail(); return; }
      if (p[1] && p[2]) { lazyNeed('atlas', function () { app.trailAct(p[1] + '|' + p[2]); }); return; }
      app.openTrail(); return;
    }
    if (head === 'stop' && p[1]) { lazyNeed('atlas', function () { app.trailUnit(p[1]); }); return; }
    if (head === 'check' && p[1]) {
      /* a quiz is never resumed from history — the region it belongs to opens instead */
      var cr = p[1].split('|'), act = String(cr[1] || '').split(':')[0];
      lazyNeed('atlas', function () { if (act) app.trailAct((cr[0] || 'honey') + '|' + act); else app.openTrail(); }); return;
    }
    if (head === 'concepts') {
      if (p[1] != null && p[1] !== '') { lazyNeed('concepts', function () { try { loadConcepts(); } catch (e) {} if (state.conceptData && state.conceptData[+p[1]]) app.openConcept(+p[1]); else app.setNav('concepts'); }); return; }
      app.setNav('concepts'); return;
    }
    /* a word's own card (My Feed's word cards open here): the same door as a search suggestion */
    if (head === 'word' && p[1]) { var w = decodeURIComponent(p.slice(1).join('/')); lazyNeed('words', function () { app.hqPick(w); }); return; }
    if (head === 'hive') { if (p[1]) state.collTab = p[1]; app.openCollection(); return; }
    if (head === 'shop') { app.openShop(p[1] || 'avatars'); return; }
    if (head === 'grownups') { app.setNav('parent'); return; }
    if (head === 'progress') { state.progTab = 'me'; app.setNav('progress'); return; }
    if (head === 'practice' || head === 'gym') { app.openCoach(); return; }   // the tab is the Word Gym now; #/practice stays the route
    if (head === 'play') {
      app.openGames();
      var pk = p[1] && (PLAY_SLUG[p[1]] || p[1]);
      if (pk && pk !== 'game') lazyNeed('arcade', function () { try { if (typeof app.arcadePlay === 'function') app.arcadePlay(pk); } catch (e) {} });
      return;
    }
    if (head === 'daily' && typeof app.openDailyBee === 'function') { app.openDailyBee('route'); return; }   // Daily Bee (games spec §5.2) replaces Daily Buzz here
    if (head === 'support') { app.setNav('home'); return; }
    var nav = ROUTE_NAV[head] || head;
    /* A tool behind the plan opens through ITS opener, the one its Library tile taps: setNav would
       draw the page and skip the plan lock (and the PIN in front of the plan sheet) — #/quotes,
       #/vocab, #/typing, #/ipatrain and #/trivtrain all reached a free child's screen that way, and
       #/adv drew the Advanced Pack's sales page with no PIN (audit v4). The opener also loads what
       the page reads. */
    if (DOOR[nav] && typeof app[DOOR[nav]] === 'function') { app[DOOR[nav]](); return; }
    if (RESTORABLE[nav]) { app.setNav(nav); return; }
    if (PARENT[nav]) { app.setNav(PARENT[nav]); return; }
    app.setNav('home');
  }
  /* Layers that are not screens: back closes them first and stays where it is. */
  function closeLayer() {
    try {
      if (document.querySelector('.arc-play:not([data-route]),.bz-play,.arc-menu')) { leaveDrill(); render(); return true; }
      if (menuOpen()) { state.famMenu = false; render(); return true; }
      if (state.drawerOpen) { state.drawerOpen = false; render(); return true; }
      if (state.walletOpen) { state.walletOpen = false; render(); return true; }
      if (state.pinDlg) { state.pinDlg = null; render(); return true; }
      if (state.showTiers || state.showPaywall) { state.showTiers = false; state.showPaywall = false; state._planOk = false; render(); return true; }
    } catch (e) {}
    return false;
  }
  function onPop(e) {
    if (!R.booted) return;
    var here = R.last;
    /* Every entry this app writes carries a state object; a NEW entry — an address typed, a
       link followed — carries none. Back closes a layer and stays put; a new address is
       somewhere the child asked to GO, so it is applied (applyRoute drops the layers). It
       used to be swallowed by the open layer and pushed straight back to the old route. */
    var fresh = !(e && e.state);
    if (fresh) { try { history.replaceState({ sb: 1 }, '', location.href); } catch (x) {} }
    if (!fresh && closeLayer()) { try { history.pushState({ sb: 1 }, '', urlFor(here)); } catch (x) {} return; }
    var st = (e && e.state) || {};
    var r = String(location.hash || '').replace(/^#\/?/, '');
    if (st.sbRoot || !r) {
      /* the bottom of the stack: never let the browser take the next step back out of the
         app — climb straight back onto the first screen */
      var top = (state.children && state.children.length) ? 'home' : 'welcome';
      try { history.pushState({ sb: 1 }, '', urlFor(top)); } catch (x) {}
      R.last = top;
      R.applying = true; try { applyRoute(top); } finally { R.applying = false; }
      return;
    }
    if (r === here) { if (fresh) { dropLayers(); render(); } return; }   // asked for the screen it is on: show it, uncovered
    /* the screen under a layer: closing Settings must not restart what is beneath it */
    if (state.settingsOpen && r === baseRoute()) { R.last = r; app.closeSettings(); return; }
    R.last = r;
    R.applying = true;
    try { applyRoute(r); } catch (x) {} finally { R.applying = false; }
  }
  function boot() {
    if (R.booted) return;
    var incoming = String(location.hash || '').replace(/^#\/?/, '');
    var kids = !!(state.children && state.children.length);
    var top = kids ? 'home' : 'welcome';
    try { history.replaceState({ sbRoot: 1 }, '', urlFor(top)); } catch (e) {}
    R.booted = true; R.last = null;
    addEventListener('popstate', onPop);
    /* a deep link (the Hive's #/continue, a shared #/atlas) is applied once the first
       screen has painted, through the same openers as a tap */
    if (incoming && incoming !== top && kids) R.pending = incoming;
  }
  function afterRender() {
    if (!R.booted) return;
    if (R.pending != null) {
      var r = R.pending; R.pending = null; syncHash();
      setTimeout(function () { try { applyRoute(r); } catch (e) {} }, 0);
      return;
    }
    syncHash();
    scheduleWatch();
  }

  /* ------------------------------------------------------------------ 3. THE HIVE */
  var _stopAct = null;
  function childName() { try { return (state.children && state.children.length) ? (active().name || null) : null; } catch (e) { return null; } }
  function startActivity() {
    if (DEMO || _stopAct || !window.BZ_ACTIVITY) return;
    if (!(state.children && state.children.length)) return;
    _stopAct = BZ_ACTIVITY.trackActivity('bee', childName);
  }
  function milestone(ev, label) {
    if (DEMO || !window.BZ_ACTIVITY) return;
    try { BZ_ACTIVITY.trackMilestone('bee', childName(), ev, label); } catch (e) {}
  }
  function snapOf(c) {
    var s = { v: 1 };
    var nx = trailNext();
    if (nx) { s.crs = state.trailCourse === 'exp' ? 'exp' : 'honey'; s.lap = nx.lap; s.done = nx.done; s.title = nx.title; s.act = nx.act; s.all = !!nx.allDone; }
    try { s.band = window.SB_ONE_LEVEL ? (window.SB_ONE_LEVEL(c).level | 0) : 0; } catch (e) {}   // the ONE level (C6), not the Bee Band
    try { var L = c.lists || {}; s.st = {}; for (var k in L) if (L[k] && L[k].stage) s.st[k] = L[k].stage | 0; } catch (e) {}
    return s;
  }
  var _watchT = null;
  function scheduleWatch() {
    if (DEMO || _watchT) return;
    _watchT = setTimeout(function () { _watchT = null; try { watch(); } catch (e) {} }, 200);
  }
  function watch() {
    if (DEMO || state.screen !== 'app' || !(state.children && state.children.length)) return;
    var c = active(); var now = snapOf(c); var was = c.hiveMs;
    if (!was || was.v !== 1) { c.hiveMs = now; save(); return; }     // first sight is a baseline, not a milestone
    var changed = false;
    /* the Atlas: compared only within one course, and only when its data is loaded */
    if (now.lap != null && was.lap != null && now.crs === was.crs) {
      var moved = now.lap > was.lap || (now.lap === was.lap && now.done > was.done) || (now.all && !was.all);
      if (moved) {
        milestone('stop', 'Word Atlas stop cleared: ' + (was.title || 'a stop') + (was.act ? ' · ' + was.act : ''));
        if (was.act && (now.act !== was.act || now.lap > was.lap || (now.all && !was.all))) milestone('world', 'Word Atlas region cleared: ' + was.act);
      }
    }
    if (now.band && was.band != null && now.band > (was.band || 0)) {
      var lab = ''; try { lab = window.SB_ONE_LEVEL(c).label; } catch (e) {}
      milestone('band', lab || ('Level ' + now.band));
    }
    /* mastery: a list stage whose words were all mastered (advanceStage). Since FIX-BEE D5 a word
       is mastered only on spaced evidence, so a stage advance IS evidence — nothing to re-point. */
    var ws = was.st || {}, ns = now.st || {};
    for (var k in ns) if ((ns[k] | 0) > (ws[k] | 0)) {
      var lab = k; try { lab = listLabel(k).split(' · ')[0]; } catch (e) {}
      milestone('mastery', lab + ': stage ' + ns[k] + ' mastered');
    }
    for (var f in now) if (JSON.stringify(now[f]) !== JSON.stringify(was[f])) { changed = true; break; }
    if (changed) { c.hiveMs = now; save(); }
  }

  /* ------------------------------------------------------------------ 4. THE HOUSEHOLD */
  /* The word book that used to be household-wide. Out: the active child's copy goes onto the
     child. In: the child's own copy comes back (a child with none yet, from before this
     split, keeps a copy of the shared book — nothing anyone earned is lost). */
  /* luMastered is NOT in the book: since FIX-BEE D5 each child carries an evidence record (c.mast)
     and app3's mastSync() derives luMastered from the active child's record on every switch. */
  var BOOK = [['coachSrs', '_srs'], ['coachHistory', '_chist']];
  function bookOut(c) { if (!c) return; BOOK.forEach(function (b) { c[b[1]] = state[b[0]] || {}; }); }
  function bookIn(c, fresh) {
    if (!c) return;
    BOOK.forEach(function (b) {
      if (fresh) state[b[0]] = {};
      else if (c[b[1]] !== undefined) state[b[0]] = c[b[1]] || {};
      else state[b[0]] = JSON.parse(JSON.stringify(state[b[0]] || {}));
      delete c[b[1]];
    });
  }
  function switchChild(i) {
    i = +i; var ch = state.children || [];
    if (!ch[i]) return;
    state.famMenu = false;
    if (i === state.activeIdx) { render(); return; }
    leaveDrill();
    /* nothing of one child's running session may carry into the other's */
    ['sessionWords', 'sessionListKey', 'trailReturn', 'tq', 'lt', 'wr', 'or', 'mb', 'conceptSel', 'trailUnit', 'trailChk'].forEach(function (k) { state[k] = null; });
    state.sessionOver = false; state.status = 'idle'; state.typed = ''; state.trailView = 'map'; state.coachMode = 'hub';
    app.selectChild(i);
    app.setNav('home');
    try { flash('Hi ' + (ch[i].name || 'there') + '! 🐝'); } catch (e) {}
  }

  /* ------------------------------------------------------------------ top bar pieces */
  var HEX = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.8 20 7.4v9.2L12 21.2 4 16.6V7.4z"/><path d="M12 8.2 15.3 10.1v3.8L12 15.8 8.7 13.9v-3.8z" fill="currentColor" stroke="none" opacity=".55"/></svg>';
  var LOCK = '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4.6" y="10.4" width="14.8" height="10.2" rx="2.6"/><path d="M8 10.4V7.6a4 4 0 0 1 8 0v2.8"/><circle cx="12" cy="15.4" r="1.4" fill="currentColor" stroke="none"/></svg>';
  function avatarMini(c, size) {
    var art = '';
    try { if (c.avatar && c.avatar !== 'bizzy' && c.avatar !== 'bee' && typeof window.SB_AVATAR === 'function') art = window.SB_AVATAR(c.avatar, size) || ''; } catch (e) {}
    if (!art) { try { art = mascotSVG('happy'); } catch (e) { art = ''; } }
    /* the frame the child bought and wears (the Shop's Extras) rides wherever the avatar does */
    try { if (typeof framed === 'function') return framed(art, c, size + 4); } catch (e) {}
    return art;
  }
  /* [⬡ back to Hive] — hidden only while a drill word is live. Arriving from the Hive
     (?from=hive) it carries the words "back to my day", which is the chip §4 asks for. */
  function hiveBtn() {
    if (inDrill()) return '';
    if (FROM_HIVE) return '<a class="sb-fam-hive sb-fam-day" href="' + HIVE_URL + '" aria-label="Back to my day in the Bizzing Hive">' + HEX + '<span class="sb-fam-dl">← back to my day</span><span class="sb-fam-ds">← my day</span></a>';
    return '<a class="sb-hdr-ico sb-fam-hive" href="' + HIVE_URL + '" aria-label="Back to the Bizzing Hive" title="Back to the Bizzing Hive">' + HEX + '</a>';
  }
  function lockBtn() {
    return '<button data-act="setNav" data-arg="parent" class="sb-hdr-ico sb-fam-lock" aria-label="Grown-ups — needs the PIN" title="Grown-ups (PIN)">' + LOCK + '</button>';
  }
  /* The menu belongs to the screen it was opened on: navigating anywhere (a tab, Back) puts it
     away without anyone having to remember to close it. */
  function menuOpen() { return !!state.famMenu && state.famMenu === routeOf() && state.screen === 'app'; }
  function kidBtn() {
    var c = active(); var open = menuOpen();
    return '<button data-act="famMenu" class="sb-fam-kid" aria-haspopup="menu" aria-expanded="' + (open ? 'true' : 'false') + '" aria-label="' + H((c.name || 'Speller') + ' — switch child') + '" title="Switch child">'
      + '<span class="sb-fam-kidav">' + avatarMini(c, 30) + '</span><span class="sb-fam-caret" aria-hidden="true">▾</span></button>';
  }
  function kidMenu() {
    if (!menuOpen()) return '';
    var ch = state.children || [];
    var rows = ch.map(function (k, i) {
      var on = i === state.activeIdx;
      return '<button role="menuitemradio" aria-checked="' + (on ? 'true' : 'false') + '" data-act="famSwitch" data-arg="' + i + '" class="sb-fam-row' + (on ? ' on' : '') + '">'
        + '<span class="sb-fam-rowav">' + avatarMini(k, 34) + '</span><span class="sb-fam-rown">' + H(k.name || 'Speller') + (k.sample ? ' <i>Sample</i>' : '') + '</span>'
        + (on ? '<span class="sb-fam-tick" aria-hidden="true">✓</span>' : '') + '</button>';
    }).join('');
    return '<div class="sb-fam-scrim" data-act="famMenuClose"></div>'
      + '<div class="sb-fam-menu" role="menu" aria-label="Children in this household">'
      + '<div class="sb-fam-mh">Children in this household</div>' + rows
      + '<div class="sb-fam-sep"></div>'
      + '<button role="menuitem" data-act="famMine" class="sb-fam-item">My page — avatar, badges, collection</button>'
      + '<button role="menuitem" data-act="famSettings" class="sb-fam-item">Settings</button>'
      + '<button role="menuitem" data-act="famAdd" class="sb-fam-item">+ Add a child <span>grown-ups</span></button>'
      + '</div>';
  }
  function demoBar() {
    if (!DEMO) return '';
    return '<div class="sb-demo-bar" role="note"><b>Sample</b><span>A made-up speller with a few weeks of progress, to look around. Nothing here is saved, and nothing reaches the Hive.</span><a href="index.html">Leave the sample</a></div>';
  }

  /* ------------------------------------------------------------------ 5. DEMO */
  /* A believable few weeks: the first seven Meadow stops and their checkpoint cleared, a
     placement at level 3, a hundred and forty easy words mastered, a few misses waiting. */
  function sampleHousehold() {
    var now = Date.now(), day = 864e5;
    var words = [];
    try { var nsf = (window.SB_DATA && SB_DATA.nsf) || [];
      for (var i = 0; i < nsf.length && words.length < 140; i++) { var w = nsf[i] && nsf[i].w; if (w && /^[a-z]{3,9}$/.test(w)) words.push(w); } } catch (e) {}
    var lu = {}; words.forEach(function (w) { lu[w] = true; });
    var days = []; [20, 19, 17, 16, 14, 12, 11, 9, 7, 6, 4, 2, 1].forEach(function (n) { days.push(ymd(new Date(now - n * day))); });
    var done = {}, st = {}, sc = [93, 88, 90, 84, 91, 86, 89];
    ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7'].forEach(function (u, i) { done[u] = { 1: sc[i] }; st[u + ':1'] = { l: 1, w: 1, p: sc[i], q: sc[i], ss: { 0: sc[i] } }; });
    var kid = { name: 'Mira', sample: 1, age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', goal: 10,
      level: 4, acc: 87, xp: 260, coins: 164, band: 3, bandSeed: 3, streak: 0,
      lists: { journey: { xp: 180, stage: 2 }, default: { xp: 40 } }, activeList: 'journey', questPath: 'journey',
      missed: [{ w: 'rhythm', n: 2, ts: now - 2 * day }, { w: 'necessary', n: 1, ts: now - day }, { w: 'separate', n: 1, ts: now - 4 * day }],
      unlockedThemes: [], unlockedConcepts: {}, unlockedLists: {}, pow: {}, daysPlayed: days,
      week: [14, 22, 0, 18, 25, 0, 12],
      trail: { lap: 1, done: done, chk: { '1:meadow:4': 86 }, seen: {}, st: st, elap: 1, edone: {}, echk: {} } };
    return { theme: 'spellbound', mode: 'light', premium: false, pin: null, children: [kid], activeIdx: 0, goalDone: 0, lu: lu, srs: {}, chist: {} };
  }
  if (DEMO) {
    try { SB_STORE.saveHousehold(sampleHousehold()); SB_STORE.set('splash', '0'); } catch (e) {}
  }

  /* ------------------------------------------------------------------ install */
  /* app3 calls this once its `app` object exists; the actions live here beside the code they serve */
  function install() {
    app.goNext = goNext;
    app.goStep = goStep;
    app.famMenu = function () { state.famMenu = menuOpen() ? false : routeOf(); render(); };
    app.famMenuClose = function () { if (!state.famMenu) return; state.famMenu = false; render(); };
    app.famSwitch = switchChild;
    app.famMine = function () { state.famMenu = false; app.openCollection(); };
    app.famSettings = function () { state.famMenu = false; app.goSettings(); };
    app.famAdd = function () { state.famMenu = false; pinGate(function () { app.addChild(); }, 'Add a child — grown-ups only'); };
    try { document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen()) { state.famMenu = false; render(); } }); } catch (e) {}
  }

  window.SB_SHELL = {
    HIVE_URL: HIVE_URL, demo: DEMO, fromHive: FROM_HIVE, ymd: ymd,
    nextStep: nextStep, goNext: goNext, goStep: goStep, levelWords: levelWords,
    inDrill: inDrill, leaveDrill: leaveDrill,
    routeOf: routeOf, applyRoute: applyRoute, boot: boot, afterRender: afterRender,
    sync: function () { if (R.booted) syncHash(); }, playRoute: playRoute, leaveOverlay: leaveOverlay,
    startActivity: startActivity, milestone: milestone, watch: watch,
    bookOut: bookOut, bookIn: bookIn, switchChild: switchChild,
    hiveBtn: hiveBtn, lockBtn: lockBtn, kidBtn: kidBtn, kidMenu: kidMenu, demoBar: demoBar,
    sampleHousehold: sampleHousehold, install: install
  };
  window.SB_NEXT_STEP = nextStep;
})();
