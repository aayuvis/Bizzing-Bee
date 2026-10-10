/* wordband.js — ONE WORD-BAND MODEL (the 4.5 brief, P1.1–P1.6, 10 Oct 2026). window.SB_BAND.

   THE WORDS. Every word has a band — 1 (ages 8–9) · 2 (10–11) · 3 (12–13) · 4 (14–15). wordband-data.js (lazy,
   boot-lazy `wordband`) carries each band, written by tools/wordband/build.cjs from tools/wordband/formula.cjs:
   the library's rarity band y (frequency), length, affixes (morphology) and the SOURCED grade lists in
   grade-map/. Nothing is typed per word. A word the file does not list is band 4: no evidence, never Easy.
   The formula's per-record half lives HERE (local) and formula.cjs runs this very file for it, so there is one
   copy of every constant. Because the affix term is capped and a grade list only lowers a band, a record carries
   its own CEILING (bounds): until wordband-data.js lands, of() answers with that ceiling — careful, never low.

   THE CHILD. child(c) is the ONE difficulty model the games, My Feed and the word of the hour share (P1.4):
     age      the low end of the age band in the word bands' own ages (5–7 and 8–10 → 1, 11–13 → 2, 14–18 → 4)
              — the low end, as kid-safe.js reads it: an 11–13 child is eleven until shown otherwise;
     Atlas    the Word Atlas region the child has reached sets a floor — the grade map (grade-map.json, sourced
              per region) puts The Sprints and The Big Stage at US Grades 6–8 (band 2), every earlier region at
              Grades 3–5 (band 1); the floors ride in wordband-data.js (`atlas`), cut from the map by the build;
     accuracy the last 120 graded answers (c.attempts, the evidence the Bee Band reads), once there are 30: 90% or
              better moves the band up one, under 60% down one.
     band = clamp(max(age, Atlas floor) + accuracy step, 1, 4)

   ONE DOOR (owner, 10 Oct 2026: "the band model lives INSIDE nextWords — there is no second door"). pick() is the
   brief's pick(child, pool, n): it FILTERS a pool it is handed and never reads the corpus, so tests/word-door.cjs
   still sees one door. nextWords (app3 nwPool / nwDaily), the word of the hour, bee-feed.js and analogy.js call
   it; tools/build-feed.cjs tags each card with its word's band at build time.

   A LEVEL IS A WINDOW OF BANDS (win): easy → band 1 only, at or below every child's band (P1.1: "Easy draws only
   band-1 words") · auto → 1 … band · medium → band−1 … band · hard → band … band+1 · champ → band+1 … 4.
   THE IN-ROUND CLIMB STAYS (3 right → tier +1, 2 misses → tier −1): a tier moves the window a band; where it
   cannot move (Easy never rises above 1; nothing below 1 or above 4) it takes the trickier or gentler half of the
   window by spelling trickiness (SB_TRICK.diff), so the climb is felt on Easy too and never leaves band 1.
   Review (a child's own missed and due words) is not band-filtered: a word is due because it was met.
   Guard: tests/word-band.cjs (node, the deploy's data gate). */
(function () {
  'use strict';
  var W = window;
  /* the formula's constants (tools/wordband/formula.cjs reads them from here) */
  var K = { CUT: [2.5, 4, 5.5], LEN_FROM: 7, LEN_STEP: 0.25, LEN_CAP: 1.5, SHORT: 1, MORPH: { infl: 0.25, pre: 0.25, deriv: 0.5, cap: 1.25 },
    EV_MIN: 30, EV_WIN: 120, UP: 0.9, DOWN: 0.6 };
  function AGE_BAND(a) { return a <= 9 ? 1 : a <= 11 ? 2 : a <= 13 ? 3 : 4; }
  function cut(S) { return S < K.CUT[0] ? 1 : S < K.CUT[1] ? 2 : S < K.CUT[2] ? 3 : 4; }
  function key(w) { return String(w && typeof w === 'object' ? w.w : w || '').toLowerCase().trim(); }

  /* ---------------------------------------------------------------- the words */
  /* the per-record terms: y (the library's rarity band), length over seven letters, a short rare word */
  function local(r) {
    var w = key(r), y = Math.max(1, Math.min(9, +(r && r.y) || 3)), n = w.replace(/[^a-z]/g, '').length;
    var len = Math.min(K.LEN_CAP, Math.max(0, n - K.LEN_FROM) * K.LEN_STEP), short = n <= 3 && y >= 2 ? K.SHORT : 0;
    return { y: y, len: len, short: short, S: y + len + short };
  }
  /* what a record can be without the library: at least cut(local) unless a grade list lowers it, at most
     cut(local + the largest affix term) always */
  function bounds(r) { var S = local(r).S; return { lo: cut(S), hi: cut(S + K.MORPH.cap) }; }
  var map = null, mapV = '';
  function data() { var D = W.SB_WORDBAND; return D && D.b ? D : null; }
  function ready() { return !!data(); }
  function idx() {
    var D = data(); if (!D) return null;
    if (map && mapV === D.v) return map;
    var m = Object.create(null);                 /* 'constructor' is a library word: nothing on a prototype may match */
    [1, 2, 3].forEach(function (b) { String(D.b[b] || '').split('|').forEach(function (w) { if (w) m[w] = b; }); });
    map = m; mapV = D.v; return m;
  }
  /* a word's band, 1–4: the file's when it has landed (4 when it does not list the word), else the record's
     ceiling (4 for a bare string) */
  function of(w) {
    var M = idx(), k = key(w); if (!k) return 4;
    if (M) return M[k] || 4;
    return w && typeof w === 'object' && w.y != null ? bounds(w).hi : 4;
  }
  /* several words shown together (an analogy item): the highest of their bands */
  function most(ws) { var b = 1; (ws || []).forEach(function (x) { var v = of(x); if (v > b) b = v; }); return b; }

  /* ---------------------------------------------------------------- the child */
  function ageLo(c) {
    try { if (typeof ageBandOf === 'function') { var b = ageBandOf(c); if (b && b.lo) return b.lo; } } catch (e) {}
    return +(c && c.age) || 9;
  }
  /* the Word Atlas region the child is in (1–9), on the road as the board counts it; 0 before the trail lands */
  function region(c) {
    var T = W.SB_TRAIL, R = W.SB_TRAIL_ROAD; if (!T || !T.honey || !T.honey.acts || !R) return 0;
    var tr = (c && c.trail) || {}, done = tr.done || {}, acts = T.honey.acts.map(function (a) { return a.id; });
    if ((tr.lap || 1) > 1) return acts.length;   /* a later lap: the whole road has been walked once */
    var ns = R.nodes(T, 'honey', 1);
    for (var i = 0; i < ns.length; i++) if (ns[i].kind === 'unit' && !done[ns[i].u.id]) return acts.indexOf(ns[i].act) + 1;
    return acts.length;
  }
  function accuracy(c) {
    var at = ((c && c.attempts) || []).slice(-K.EV_WIN), n = 0, ok = 0;
    for (var i = 0; i < at.length; i++) { var a = at[i] || {}, wt = +a.wt || 0; n += wt; ok += (a.ok ? 1 : 0) * wt; }
    return { n: Math.round(n * 10) / 10, acc: n >= K.EV_MIN ? ok / n : null };
  }
  function child(c) {
    if (!c) { try { c = active(); } catch (e) { c = null; } }
    var age = AGE_BAND(ageLo(c)), r = region(c), D = data(), T = W.SB_TRAIL;
    var id = r && T ? (T.honey.acts[r - 1] || {}).id : '', floor = (D && D.atlas && id && +D.atlas[id]) || 0;
    var ac = accuracy(c), step = ac.acc == null ? 0 : ac.acc >= K.UP ? 1 : ac.acc < K.DOWN ? -1 : 0;
    var band = Math.max(1, Math.min(4, Math.max(age, floor) + step));
    return { band: band, age: age, region: r, floor: floor, acc: ac.acc, n: ac.n, step: step };
  }

  /* ---------------------------------------------------------------- a level's window */
  function win(c, level, tier) {
    var B = child(c).band, lv = /^(easy|medium|hard|champ)$/.test(level) ? level : 'auto', lo, hi;
    if (lv === 'easy') { lo = 1; hi = 1; }
    else if (lv === 'medium') { lo = Math.max(1, B - 1); hi = B; }
    else if (lv === 'hard') { lo = B; hi = Math.min(4, B + 1); }
    else if (lv === 'champ') { lo = Math.min(4, B + 1); hi = 4; }
    else { lo = 1; hi = B; }
    var cap = lv === 'easy' ? 1 : 4, t = Math.max(-1, Math.min(1, Math.round(+tier || 0))), half = 0;
    if (t) {
      var lo2 = Math.max(1, Math.min(cap, lo + t)), hi2 = Math.max(1, Math.min(cap, hi + t));
      if (lo2 === lo && hi2 === hi) half = t;   /* the window cannot move: the trickier / gentler half of it */
      lo = lo2; hi = hi2;
    }
    return { lo: lo, hi: hi, band: B, level: lv, half: half };
  }
  function tricky(w) { try { if (W.SB_TRICK && typeof SB_TRICK.diff === 'function') return SB_TRICK.diff(w); } catch (e) {} return String(w && w.w || '').length; }
  /* THE BRIEF'S pick(child, pool, n): the words of `pool` inside this child's window for o.level and o.tier —
     never one above it. n > 0 → the first n; 0 → all of them (nextWords samples). o.min: a window holding fewer
     widens DOWNWARD (towards band 1), never up. */
  function pick(c, pool, n, o) {
    o = o || {};
    var w = win(c, o.level, o.tier), lo = w.lo, hi = w.hi;
    var inB = function (x) { if (!x || !x.w) return false; var b = of(x); return b >= lo && b <= hi; };
    var out = (pool || []).filter(inB);
    if (o.min && out.length < o.min && lo > 1) { lo = 1; out = (pool || []).filter(inB); }
    if (w.half && out.length >= 16) {
      var s = out.map(function (x, i) { return { x: x, i: i, d: tricky(x) }; }).sort(function (a, b) { return a.d - b.d || a.i - b.i; });
      var m = Math.floor(s.length / 2), keep = (w.half > 0 ? s.slice(m) : s.slice(0, m)).map(function (e) { return e.i; }).sort(function (a, b) { return a - b; });
      out = keep.map(function (i) { return out[i]; });
    }
    return n ? out.slice(0, n) : out;
  }

  W.SB_BAND = { K: K, AGE_BAND: AGE_BAND, cut: cut, local: local, bounds: bounds, ready: ready, of: of, most: most,
    child: child, region: region, win: win, pick: pick,
    need: function (cb) { try { if (W.SB_LAZY) return SB_LAZY.need('wordband', cb); } catch (e) {} if (cb) cb(); } };
})();
