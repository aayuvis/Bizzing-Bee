/* bee-feed.js — My Feed, Bee's half (FAMILY-STANDARD §6a). Lazy: boot-lazy's `feed` group
   brings it with the family engine (bizzing-feed.js, BZ_FEED) and the list of card groups
   (feed/feed-meta.js, cut by tools/build-feed.cjs); the groups themselves come per session at the door of #/feed — none of it is on the first screen.

   What this file decides, and nothing else:
     · the child's LEVEL — the Word Atlas region their next stop is in, the same place Home's
       progress strip names beside Continue — and each region's name for "Coming up on …";
     · the SIGNALS: the stop they are at, the stop they just finished, the region they are in,
       each with its plain-words why;
     · what is DUE: a word whose mastery record slipped and whose gap is over (c.mast, the
       Leitner record), and a revision-pile word missed on an earlier day;
     · today's session, kept per child (c.feed) through the Store seam: the cards shown and on
       which day, and which questions have paid. Nothing leaves the device.
   The engine (feedFor, order, feedCard, feedEnd, bindFeedKeys) is the family's, unchanged.

   What the feed never does: count views, likes or streaks; play a sound before a tap; pay for
   scrolling. Only a right answer to a card's question pays, once, as the standard 'answer'
   (addCoins → BZ_WALLET.earn). Reading a card is not evidence: nothing here writes c.mast. */
(function () {
  'use strict';
  var DAY = 864e5;
  /* THIS PAGE LOAD. Today's session is kept for the visit — leave #/feed and come back and it is the
     same twenty — but a RELOAD is a new visit and gets a new session, built with everything shown
     earlier today sinking (the engine's seen-this-week rule), so it is different cards until the
     pool runs out (audit v4, V4: a reload repeated 21 of 21). What was paid stays paid: c.feed.paid
     is per child and per card, and answer() never pays a card twice. */
  var VISIT = Date.now();
  var play = {};                 /* this visit's answers: id -> { st: 'right'|'wrong'|'shown', o } */
  var rows = {};                 /* id -> its index row, from the level indexes loaded so far */

  /* THE DATA ARRIVES IN GROUPS (tools/build-feed.cjs): feed/feed-meta.js names them; an INDEX per
     level (feed/fi<L>.js, fi0 = the level-free cards) is what the ranking reads, and the words of
     a card live in a BODY chunk (feed/fb<L>-<n>.js) fetched only when that card is on today's feed. */
  function D() { return window.SB_FEED_META || null; }
  function reg(kind, g) {
    var d = D(), f = d && d[kind][g], name = (kind === 'index' ? 'feedI' : 'feedB') + g;
    if (f && window.SB_LAZY && !SB_LAZY.reg[name]) SB_LAZY.reg[name] = 'feed/' + f;
    return name;
  }
  function decoded(g) {
    var I = window.SB_FEED_IDX && SB_FEED_IDX[g], d = D(); if (!I || !d) return null;
    if (!I._items) I._items = I.map(function (r) { var o = {}; d.keys.forEach(function (k, i) { if (r[i] != null) o[k] = r[i]; }); rows[o.id] = o; return o; });
    return I._items;
  }
  /* the index groups a child on level L can be shown: the level-free cards, every level passed, theirs and the next */
  function groupsFor(L) { var g = [0], n = D().levels.length; for (var i = 1; i <= Math.min(L + 1, n); i++) g.push(i); return g; }
  function missingIdx(L) { return groupsFor(L).filter(function (g) { return !decoded(g); }); }
  function index() { return rows; }
  function bodyOf(id) { var b = window.SB_FEED_BODY && SB_FEED_BODY[id], r = rows[id]; if (!b || !r) return null; var o = {}; for (var k in r) o[k] = r[k]; for (var k2 in b) o[k2] = b[k2]; return o; }
  function H(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); }
  function kid() { return active(); }
  function rec(c) {
    c = c || kid(); var F = c.feed;
    if (!F || typeof F !== 'object') F = c.feed = {};
    F.seen = F.seen || {}; F.paid = F.paid || {};
    return F;
  }
  function on() { return !state.feedOff; }

  /* ------------------------------------------------------------ the level: the Atlas region */
  function levelName(n) { var d = D(), l = d && d.levels[n - 1]; return l ? l.name : 'Level ' + n; }
  function levelOf(nx) {
    var d = D(); if (!d) return 1;
    if (!nx) return 1;
    var arg = String(nx.arg || '');
    if (nx.kind === 'unit' && d.units[arg]) return d.units[arg];
    var m = arg.match(/^honey\|([a-z]+):/);
    if (m) for (var i = 0; i < d.levels.length; i++) if (d.levels[i].id === m[1]) return d.levels[i].n;
    /* the Advanced Rounds come after the whole road */
    return d.levels.length;
  }
  function bandOf(c) { try { return ageBandOf(c).k; } catch (e) { return '8-10'; } }

  /* ------------------------------------------------------------ signals and what is due */
  function signals(c, nx, L) {
    var out = [];   /* the region itself needs no signal: its cards are the "now" tier, and the engine says "For <region>" */
    if (nx && nx.kind === 'unit' && !nx.allDone) out.push({ topic: 'stop:' + nx.arg, w: 5, why: 'You are at “' + nx.title + '”' });
    /* the stop finished most recently: the one before the frontier on the road, when it is done */
    try {
      var T = window.SB_TRAIL, done = (c.trail || {}).done || {};
      if (T && nx && nx.kind === 'unit') {
        var units = []; T.honey.acts.forEach(function (a) { units = units.concat(a.units); });
        var i = units.indexOf(nx.arg);
        for (var j = i - 1; j >= 0 && j >= i - 3; j--) if (done[units[j]]) {
          var u = T.honey.units.filter(function (x) { return x.id === units[j]; })[0];
          var t = String((u && u.title) || '').split(' — ')[0];
          out.push({ topic: 'stop:' + units[j], w: 4, why: 'Because you finished “' + t + '”' }); break;
        }
      }
    } catch (e) {}
    /* EVERY STOP SAYS WHICH IT IS (audit v4, V5: 16 of 20 cards read "For the Meadow"). A card from
       another stop of the child's region, or from any stop they have finished, names that stop —
       and says only what is true of it: finished, further along this road, or simply in the region.
       Light weights, so the two signals above and a slipped word still lead. */
    try {
      var T2 = window.SB_TRAIL, M = D(), dn = (c.trail || {}).done || {}, road = [];
      if (T2 && M) {
        T2.honey.acts.forEach(function (a) { road = road.concat(a.units); });
        var at = nx && nx.kind === 'unit' ? road.indexOf(nx.arg) : -1;
        T2.honey.units.forEach(function (u) {
          var lv = M.units[u.id]; if (!lv || lv > L) return;
          var t2 = String(u.title || '').split(' — ')[0];
          if (dn[u.id]) out.push({ topic: 'stop:' + u.id, w: 1, why: 'From “' + t2 + '”, a stop you finished' });
          else if (lv === L) out.push({ topic: 'stop:' + u.id, w: 0.5, why: (at >= 0 && road.indexOf(u.id) > at ? 'Further along this road: “' : 'In ' + levelName(L) + ': “') + t2 + '”' });
        });
      }
    } catch (e) {}
    /* a word the child has spelled right before (the mastery record, c.mast) — seen again on purpose */
    try {
      var MS = c.mast || {};
      Object.keys(MS).forEach(function (k) { var r = MS[k]; if (r && r.ok > 0) out.push({ topic: 'word:' + k, w: 2, why: 'A word you have spelled right before' }); });
    } catch (e) {}
    return out;
  }
  var WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function dueOf(c, now) {
    var due = {};
    /* the mastery record: a word that slipped (a miss on record) and is due again */
    try {
      var M = c.mast || {}, today = mastDay(now);
      Object.keys(M).forEach(function (k) {
        var r = M[k]; if (!r || !(r.miss > 0 || r.lp > 0)) return;
        if (!(r.b >= 1 ? today >= r.due : today > r.d)) return;
        var when = r.sl || r.at; due['word:' + k] = 'A word that slipped' + (when ? ' on ' + WD[new Date(when).getDay()] : '') + ' — its gap is over';
      });
    } catch (e) {}
    /* the revision pile: a word missed on an earlier day */
    try {
      (c.missed || []).forEach(function (m) {
        if (!m || !m.w || !m.ts || now - m.ts < DAY) return;
        var k = 'word:' + String(m.w).toLowerCase();
        if (!due[k]) due[k] = 'A word that slipped on ' + WD[new Date(m.ts).getDay()] + ' — its gap is over';
      });
    } catch (e) {}
    return due;
  }
  var KIND_WHY = { game: 'A game from the arcade', story: 'From your avatars’ stories', fun: 'From the idioms and similes shelf',
    analogy: 'From the Analogy Atlas', sounds: 'Words that sound the same', saying: 'A word with two ways to say it' };
  function extra(it) {
    if (KIND_WHY[it.kind]) return { s: 0.5, why: KIND_WHY[it.kind] };
    if (it.kind === 'play' && it.level == null) return { s: 0.5, why: 'A word story' };
    /* a question about a word that lives in a region, with no stop of its own to name */
    if (it.kind === 'play') return { s: 0.01, why: 'A question on a word from ' + levelName(it.level) };
    return null;
  }

  /* ------------------------------------------------------------ today's session */
  function session() {
    var c = kid(), F = rec(c), now = Date.now(), day = Math.floor(now / DAY);
    var nx = null; try { nx = SB_SHELL.nextStep(); if (nx && !nx.ready) nx = null; } catch (e) {}
    var L = levelOf(nx), band = bandOf(c), due = dueOf(c, now);
    var sig = JSON.stringify([L, nx && nx.arg, band, Object.keys(due).sort()]);
    if (F.day === day && F.sig === sig && F.vis === VISIT && F.ids && F.ids.length) return F.ids;
    var items = []; groupsFor(L).forEach(function (g) { items = items.concat(decoded(g) || []); });
    var list = BZ_FEED.feedFor({ items: items, band: band, now: now, signals: signals(c, nx, L), due: due, seen: F.seen,
      extra: extra, level: L, levelName: levelName });
    F.day = day; F.sig = sig; F.vis = VISIT;
    F.ids = list.map(function (x) { return { id: x.id, why: x.why, tier: x.tier, g: rows[x.id].g }; });
    list.forEach(function (x) { F.seen[x.id] = day; });
    /* the record of what was shown is kept a month, so it never grows without end */
    Object.keys(F.seen).forEach(function (k) { if (day - F.seen[k] > 30) delete F.seen[k]; });
    try { save(); } catch (e) {}
    return F.ids;
  }

  /* ------------------------------------------------------------ the screen */
  function hearBtn(it) {
    var w = it.key ? it.key.slice(5) : '';
    return '<button class="bz-btn out" data-bzf="hear" data-w="' + H(w) + '" aria-label="Hear “' + H(w) + '”">' +
      (typeof iconSVG === 'function' ? iconSVG('volume', 16, 2.2) : '') + ' Hear it</button>';
  }
  function card(x) {
    var it = bodyOf(x.id); if (!it) return '';
    var h = BZ_FEED.feedCard(it, x, play[x.id] || {});
    /* the recorded clip (voice-cdn streams it on a hosted build) — played only on a tap, beside the card's own button */
    if (it.clip) h = h.replace('<div class="bzf-row"><a ', '<div class="bzf-row">' + hearBtn(it) + '<a ');
    return h;
  }
  function view() {
    var head = pageHead('My Feed', '', 'Picked for you from across the app — about twenty, and then it ends.', null, 'goHome', 'Home', null,
      typeof navIcon === 'function' ? navIcon('feed', 20, true) : '');
    if (!on()) return '<div class="sb-feedpage">' + head + '<div class="sb-card" style="text-align:center;padding:28px 20px"><p style="margin:0 0 14px">My Feed is switched off on this device. A grown-up can switch it back on in Settings, behind the PIN.</p><button class="bz-btn" data-act="goHome">Home</button></div></div>';
    var wait = '<div class="sb-feedpage">' + head + hiveLoader('opening your feed…') + '</div>';
    if (!D() || !window.BZ_FEED) return wait;
    var nx0 = null; try { nx0 = SB_SHELL.nextStep(); if (nx0 && !nx0.ready) nx0 = null; } catch (e) {}
    var miss = missingIdx(levelOf(nx0));
    if (miss.length) { lazyNeed(miss.map(function (g) { return reg('index', g); }), function () { render(); }); return wait; }
    var ids = session(), nx = nx0;
    /* only the body chunks today's cards live in */
    var need = [];
    ids.forEach(function (x) { var g = x.g || (rows[x.id] || {}).g; if (g && !(window.SB_FEED_BODY && SB_FEED_BODY[x.id]) && need.indexOf(g) < 0) need.push(g); });
    if (need.length) { lazyNeed(need.map(function (g) { return reg('body', g); }), function () { render(); }); return wait; }
    var next = { href: '#/continue', label: nx && nx.ready && !nx.allDone ? 'Continue: ' + nx.title : 'Continue your journey', alt: { href: '#/play', label: 'Go play' } };
    return '<div class="sb-feedpage">' + head + '<div class="bzf-list" data-feed="1">' + ids.map(card).join('') + BZ_FEED.feedEnd(next) + '</div></div>';
  }

  /* a card's question: right pays once (the standard 'answer') and says why; wrong holds for Continue */
  function answer(id, o) {
    var it = bodyOf(id); if (!it || !it.play) return;
    var P = play[id] || {};
    if (P.st) return;
    if (o === 0) {
      play[id] = { st: 'right', o: o };
      var F = rec();
      if (!F.paid[id]) { F.paid[id] = Math.floor(Date.now() / DAY); try { addCoins('answer'); } catch (e) {} try { save(); } catch (e) {} }
    } else play[id] = { st: 'wrong', o: o };
  }
  /* KEYBOARD FOCUS SURVIVES A RENDER. render() rebuilds the page from strings, and other things
     re-render on their own (a lazy file landing, the hash sync), so a child answering by keyboard
     would be thrown back to <body> a moment after each answer. Where focus was inside a feed card
     before a render, it is put back on the same control (or on `want`, set by an answer) after. */
  var want = null;
  function q(id) { return '.bzf-card[data-id="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]'; }
  function spot() {
    var a = document.activeElement, c = a && a.closest && a.closest('.bzf-card[data-id]'); if (!c) return null;
    return { id: c.getAttribute('data-id'), sel: a === c ? null : (a.getAttribute('data-bzf') ? '[data-bzf="' + a.getAttribute('data-bzf') + '"]' + (a.getAttribute('data-o') != null ? '[data-o="' + a.getAttribute('data-o') + '"]' : '') : null) };
  }
  function land(f) {
    try { var c = document.querySelector(q(f.id)); if (!c) return; var t = (f.sel && c.querySelector(f.sel)) || c;
      if (t.disabled) t = c; if (document.activeElement !== t) t.focus({ preventScroll: true }); } catch (e) {}
  }
  var _render = window.render;
  if (typeof _render === 'function' && !_render._feed) {
    window.render = function () {
      var f = state.nav === 'feed' ? (want || spot()) : null;
      var out = _render.apply(this, arguments);
      if (f) land(f);
      return out;
    };
    window.render._feed = true;
  }
  function refocus(id, sel) { want = { id: id, sel: sel || null }; land(want); setTimeout(function () { want = null; }, 0); }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-bzf]'); if (!b || !b.closest('.sb-feedpage')) return;
    var a = b.getAttribute('data-bzf'), id = b.getAttribute('data-id');
    if (a === 'ans') { answer(id, +b.getAttribute('data-o')); render(); refocus(id, '[data-bzf="cont"]'); }
    else if (a === 'cont') { play[id] = { st: 'shown', o: (play[id] || {}).o }; render(); refocus(id); }
    else if (a === 'hear') { var w = b.getAttribute('data-w'); lazyNeed('audio', function () { try { deviceSpeak(w, 0.9); } catch (x) {} }); }
  });
  try { BZ_FEED.bindFeedKeys(); } catch (e) {}

  /* the two stylesheets: the family's card (byte-identical) and Bee's tokens for it */
  ['bizzing-feed.css', 'bee-feed.css'].forEach(function (f) {
    if (document.querySelector('link[data-feed-css="' + f + '"]')) return;
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = f + (window.SB_ASSET_V || ''); l.setAttribute('data-feed-css', f);
    document.head.appendChild(l);
  });

  window.SB_FEED = { view: view, levelOf: levelOf, levelName: levelName, session: session, dueOf: dueOf, signals: signals, answer: answer,
    groupsFor: groupsFor, _play: play, reset: function () { for (var k in play) delete play[k]; } };
})();
