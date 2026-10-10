/* placement.js — THE PLACEMENT STEP (road to 4.5, P1.7 / P1.8; owner decision, 10 Oct 2026).

   WHAT THE OWNER DECIDED, AND WHAT IT MEANS HERE.
     · Onboarding keeps ONE decision per step. Placement is its OWN step, offered to the 10+ age bands
       (AGE_BANDS 11–13 and 14–18), between the age band and the buddy. Its one decision is WHERE TO START.
     · It is adaptive and asks TWELVE words, then RECOMMENDS a start — the entry stop of a region of the
       Word Atlas — with one region easier and one harder beside it. The child chooses; the suggestion is
       preselected so it is one tap on Continue.
     · It never changes the Atlas: not the route, the stops, their order or the rule that opens them. It
       only chooses where Continue starts (trail.js's START LINE, `c.trail.start`). Stops before the start
       are not marked walked — no evidence is invented — they stay open behind the child, and Tier 2 still
       needs every stop of Tier 1 walked.
     · It writes no mastery, no coins, no band: a measurement is not practice. The twelve answers are kept
       only as the placement's own record on the child (`c.trail.start`: suggested, chosen, n, right) for
       the grown-ups' report card.

   THE ENGINE (pure, deterministic, no Math.random — tests/placement.cjs drives it with bots of known level).
     A level L is a START REGION, 0 (the Meadow) … 8 (the Big Stage): the child can already spell the
     regions before L, and not yet L. Each item is one of region q's own words at its place on the road
     (placement-data.js, cut by tools/build-placement.cjs). The chance of a right answer under level L:
       q < L  0.85 · q = L  0.40 · q = L+1  0.15 · beyond  0.10
     — a slip below the level and a lucky word above it are both expected, so one surprise moves the
     estimate a little and never all the way. The next region asked is the one whose answer is expected
     to leave the least uncertainty about L (expected posterior entropy), at most MAX_PER times a region.
     After twelve words the suggestion is the most likely L (ties to the easier). The prior leans towards
     the age band's usual start but is broad, so twelve answers outweigh it.

   KEYBOARD AND TOUCH: a text box (Enter submits, typing is the answer), "Hear it again" (also the R key
   from anywhere on the step), the foot's primary button ("Next word" — an empty box counts as "don't
   know"), and a quiet "Skip — start at the beginning". Every control is a real button.
   Never the answer on screen: the meaning is shown only if it does not contain the word (the build already
   refuses any meaning carrying the word's first five letters), and no right/wrong is shown word by word —
   the words missed are listed with their spellings only after the twelfth. */
(function () {
  'use strict';
  var W = typeof window !== 'undefined' ? window : globalThis;
  var N = 12, MAX_PER = 4;
  var P_BELOW = 0.85, P_AT = 0.4, P_UP1 = 0.15, P_UP = 0.1;
  var BANDS = { '11-13': 2, '14-18': 3 };            // where the prior leans: the Roman Forum / the Storm of Elements
  function pRight(q, L) { return q < L ? P_BELOW : q === L ? P_AT : q === L + 1 ? P_UP1 : P_UP; }
  function prior(band, R) { var m = BANDS[band] != null ? BANDS[band] : 2, p = [], t = 0;
    for (var L = 0; L < R; L++) { p[L] = Math.exp(-Math.abs(L - m) / 3); t += p[L]; }
    return p.map(function (x) { return x / t; }); }
  function H(p) { var h = 0; for (var i = 0; i < p.length; i++) if (p[i] > 0) h -= p[i] * Math.log(p[i]); return h; }
  function upd(post, q, ok) { var t = 0, out = post.map(function (x, L) { var v = x * (ok ? pRight(q, L) : 1 - pRight(q, L)); t += v; return v; });
    return out.map(function (x) { return x / t; }); }
  function regionsOf(D) { return (D && D.regions) || []; }
  /* a new run for an age band: {band, post, per[], asked[]} */
  function start(D, band) { var R = regionsOf(D).length; return { band: band, n: N, post: prior(band, R), per: regionsOf(D).map(function () { return 0; }), asked: [] }; }
  function median(post) { var a = 0; for (var i = 0; i < post.length; i++) { a += post[i]; if (a >= 0.5) return i; } return post.length - 1; }
  /* the next item: {r, i, w, d, u} — or null when the run is over */
  function pick(s, D) {
    if (!s || s.asked.length >= s.n) return null;
    var regs = regionsOf(D), best = null, bestE = Infinity, med = median(s.post);
    for (var q = 0; q < regs.length; q++) {
      if (s.per[q] >= MAX_PER || !regs[q].items[s.per[q]]) continue;
      var pr = 0; for (var L = 0; L < s.post.length; L++) pr += s.post[L] * pRight(q, L);
      var e = pr * H(upd(s.post, q, true)) + (1 - pr) * H(upd(s.post, q, false));
      if (e < bestE - 1e-9 || (Math.abs(e - bestE) <= 1e-9 && best != null && Math.abs(q - med) < Math.abs(best - med))) { bestE = e; best = q; }
    }
    if (best == null) return null;
    var it = regs[best].items[s.per[best]];
    return { r: best, i: s.per[best], w: it.w, d: it.d, u: it.u };
  }
  /* one answer: ok is the caller's comparison (the page uses sameSpelling) */
  function answer(s, D, ok, typed) {
    var it = pick(s, D); if (!it) return s;
    s.post = upd(s.post, it.r, !!ok); s.per[it.r]++;
    s.asked.push({ r: it.r, w: it.w, ok: !!ok, typed: String(typed == null ? '' : typed).slice(0, 40) });
    return s;
  }
  function done(s) { return !!s && s.asked.length >= s.n; }
  /* the suggestion: the most likely start region (ties to the easier), and how the run went */
  function result(s) { var best = 0; for (var L = 1; L < s.post.length; L++) if (s.post[L] > s.post[best] + 1e-12) best = L;
    var right = s.asked.filter(function (a) { return a.ok; }).length;
    return { rec: best, right: right, n: s.asked.length, missed: s.asked.filter(function (a) { return !a.ok; }).map(function (a) { return a.w; }) }; }
  /* the choice offered: one easier, the suggestion, one harder — never off the road */
  function options(rec, R) { return [rec - 1, rec, rec + 1].filter(function (r) { return r >= 0 && r < R; }); }
  /* the whole run, answered by a function of the item — what the bot test calls */
  function run(D, band, answerFn) { var s = start(D, band), it;
    while ((it = pick(s, D))) answer(s, D, !!answerFn(it, s.asked.length), '');
    return Object.assign(result(s), { asked: s.asked }); }

  var API = { N: N, MAX_PER: MAX_PER, pRight: pRight, prior: prior, start: start, pick: pick, answer: answer, done: done,
    result: result, options: options, run: run, BANDS: BANDS };
  W.SB_PLACE = API;
  /* node: the engine only. On the page, app3's `state` and `app` are top-level consts — global lexical
     bindings, not window properties — so they are read by their bare names. */
  if (typeof document === 'undefined' || typeof state === 'undefined' || typeof app === 'undefined') return;

  /* ============================== the step on the page ============================== */
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  var escA = function (s) { return esc(s).replace(/"/g, '&quot;'); };
  var redraw = function () { try { render(); } catch (e) {} };
  var speak = function (w) { try { say(w); } catch (e) {} };
  var icon = function (n, z) { try { return iconSVG(n, z); } catch (e) { return ''; } };
  var D = function () { return W.SB_PLACE_DATA; };
  var pl = function () { return state.draft && state.draft.pl; };
  var focusBox = function () { setTimeout(function () { try { var el = document.querySelector('[data-inp="placeType"]'); if (el) el.focus(); } catch (e) {} }, 60); };
  var sayCur = function (delay) { setTimeout(function () { try { var p = pl(); var it = p && p.s && pick(p.s, D()); if (it && state.screen === 'onboarding') speak(it.w); } catch (e) {} }, delay || 0); };
  /* called by app3 on arriving at the step (and again whenever it is drawn before this file landed) */
  function begin() {
    var S = state; if (!S.draft || !D()) return;
    var band = S.draft.ageBand;
    var p = S.draft.pl;
    /* a run is kept across Back and forth; a band changed mid-run starts again (its prior differs), a finished run is kept */
    if (!p || (p.band !== band && !done(p.s) && !p.skipped)) { p = S.draft.pl = { band: band, s: start(D(), band), typed: '', pick: null, rec: null, skipped: false }; }
    redraw();
    if (!p.skipped && !done(p.s)) { sayCur(350); focusBox(); }
  }
  function finish(p) { var r = result(p.s); p.rec = r.rec; if (p.pick == null) p.pick = r.rec; p.res = r; }
  var acts = {
    placeSay: function () { var p = pl(); var it = p && p.s && pick(p.s, D()); if (it) speak(it.w); focusBox(); },
    placeType: function (v) { var p = pl(); if (p) p.typed = v; },
    placeKey: function (e) { if (e.key === 'Enter') { e.preventDefault(); acts.placeNext(); } },
    placeNext: function () { var p = pl(); if (!p || p.skipped) return; var it = pick(p.s, D()); if (!it) return;
      var typed = String(p.typed || '').trim(); var ok = false;
      try { ok = !!typed && sameSpelling(typed, it.w); } catch (e) { ok = typed.toLowerCase() === it.w; }
      answer(p.s, D(), ok, typed); p.typed = '';
      if (done(p.s)) { finish(p); try { sfx('win'); } catch (e) {} redraw(); return; }
      redraw(); sayCur(250); focusBox(); },
    placePick: function (r) { var p = pl(); if (!p || !p.res) return; r = +r; if (options(p.rec, regionsOf(D()).length).indexOf(r) < 0) return; p.pick = r; redraw(); },
    placeSkip: function () { var p = pl(); if (!p) return; p.skipped = true; p.pick = 0; redraw(); },
    placeRedo: function () { if (!state.draft) return; state.draft.pl = null; begin(); }
  };
  Object.assign(app, acts);

  /* the R key says the word again from anywhere on the step (not while typing in the box) */
  document.addEventListener('keydown', function (e) { try {
    if (state.screen !== 'onboarding' || (typeof onbKey === 'function' && onbKey() !== 'place') || !pl() || pl().skipped || done(pl().s)) return;
    if ((e.key === 'r' || e.key === 'R') && !(e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName))) { e.preventDefault(); acts.placeSay(); }
  } catch (err) {} });

  /* the step's card, in app3's onboarding shell: {title, sub, body, next:{label, act, blocked}} */
  function view() {
    var p = pl(), regs = regionsOf(D());
    if (!p) return { title: 'Where shall we start?', sub: 'Getting your words ready…', body: '<div class="sb-pl-wait" role="status" style="padding:30px 0;text-align:center;color:var(--muted)">One moment…</div>', next: { label: 'Next word →', act: 'placeNext', blocked: true } };
    if (p.skipped) {
      return { title: 'Starting at the beginning', art: (function () { try { return avatarSVG('bizzy', 320); } catch (e) { return ''; } })(),
        sub: 'You will start at ' + esc(regs[0].name) + ', stop 1. Every region of the Word Atlas is still there to walk to.',
        body: '<div class="sb-pl-start" style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-radius:14px;background:var(--chip);margin-bottom:12px">' +
          '<span style="min-width:0"><span style="display:block;font-size:11.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)">Your start</span>' +
          '<span style="display:block;font-family:var(--display);font-weight:800;font-size:17px;line-height:1.2">' + esc(regs[0].name) + '</span>' +
          '<span style="display:block;font-size:12.5px;font-weight:650;color:var(--muted);margin-top:2px">Stop 1 · ' + esc(regs[0].entry.t) + '</span></span></div>' +
          '<p style="margin:0 0 12px;font-size:12.5px;color:var(--muted);line-height:1.5">Most stops open the next as soon as you get 70% in their Practice — a quick speller moves fast.</p>' +
          '<button class="sb-pl-redo" data-act="placeRedo" style="width:100%;min-height:48px;padding:12px 16px;border-radius:14px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:14px">Spell twelve words to find my start instead</button>',
        next: { label: 'Continue', act: 'onbNext' } };
    }
    if (!done(p.s)) {
      var it = pick(p.s, D()), k = p.s.asked.length + 1;
      var dots = ''; for (var i = 0; i < N; i++) dots += '<span style="width:7px;height:7px;border-radius:999px;background:' + (i < k - 1 ? 'var(--accent)' : i === k - 1 ? 'var(--accent)' : 'var(--surface2)') + ';' + (i === k - 1 ? 'width:18px;' : '') + '"></span>';
      return { title: 'Where shall we start?',
        sub: 'Spell twelve words and we will suggest a starting place on the Word Atlas. Miss as many as you like — you choose where to start.',
        body: '<div class="sb-pl">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px"><span class="sb-pl-count" data-live-prompt="' + escA('Word ' + k + ' of ' + N + '. Listen, then type the word you hear.') + '" style="font-size:12.5px;font-weight:800;color:var(--muted)">Word ' + k + ' of ' + N + '</span><span aria-hidden="true" style="display:flex;gap:4px;align-items:center">' + dots + '</span></div>' +
          '<button class="sb-pl-say" data-act="placeSay" aria-label="Hear the word again" style="display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:56px;border-radius:16px;background:var(--chip);color:var(--accent);font-weight:800;font-size:15px;margin-bottom:12px">' + icon('volume', 22) + ' Hear it again</button>' +
          (it && it.d ? '<p class="sb-pl-mean" style="margin:0 0 10px;font-size:13px;line-height:1.5;color:var(--text)"><span style="font-weight:800;color:var(--muted)">Meaning:</span> ' + esc(it.d) + '</p>' : '') +
          '<input data-inp="placeType" data-key="placeKey" data-fkey="placeType" value="' + escA(p.typed || '') + '" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Type the word you hear" placeholder="Type the word you hear" style="width:100%;padding:15px 16px;border-radius:14px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-size:19px;font-weight:700;outline:none">' +
          '<p style="margin:8px 0 0;font-size:12px;color:var(--muted);line-height:1.45">Not sure? Leave it empty and go on — it counts as “not yet”. Press R or the button to hear it again.</p>' +
          '<div style="text-align:center;margin-top:10px"><button class="sb-pl-skip" data-act="placeSkip" style="min-height:44px;padding:8px 12px;background:none;border:0;color:var(--muted);font-weight:700;font-size:13px;text-decoration:underline;text-underline-offset:3px">Skip — start at the beginning</button></div>' +
          '</div>',
        next: { label: 'Next word →', act: 'placeNext' } };
    }
    if (!p.res) finish(p);
    var r = p.res, opts = options(p.rec, regs.length);
    var tag = function (o) { return o === p.rec ? 'Suggested' : o < p.rec ? 'One easier' : 'One harder'; };
    var cards = opts.map(function (o) { var R = regs[o], on = p.pick === o;
      return '<button class="sb-pl-opt" data-act="placePick" data-arg="' + o + '" aria-pressed="' + (on ? 'true' : 'false') + '" style="display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;text-align:left;padding:14px 16px;border-radius:14px;background:' + (on ? 'var(--accent)' : 'var(--surface2)') + ';border:2px solid ' + (on ? 'var(--accent)' : 'transparent') + ';color:' + (on ? '#fff' : 'var(--text)') + '">' +
        '<span style="min-width:0"><span style="display:block;font-size:11.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;opacity:.85">' + tag(o) + '</span>' +
        '<span style="display:block;font-family:var(--display);font-weight:800;font-size:17px;line-height:1.2">' + esc(R.name) + '</span>' +
        '<span style="display:block;font-size:12.5px;font-weight:650;opacity:.85;margin-top:2px">Stop 1 · ' + esc(R.entry.t) + '</span></span>' +
        (on ? '<span aria-hidden="true" style="width:26px;height:26px;flex-shrink:0;border-radius:50%;background:rgba(255,255,255,.25);display:grid;place-items:center;font-weight:900">✓</span>' : '') + '</button>'; }).join('');
    var missed = r.missed.slice(0, 6);
    return { title: 'Where would you like to start?',
      sub: 'You spelled ' + r.right + ' of ' + r.n + '. We suggest ' + esc(regs[p.rec].name) + ' — or take one easier or one harder. Every region before your start stays open to walk back to.',
      body: '<div class="sb-pl-choose" style="display:grid;gap:10px">' + cards + '</div>' +
        (missed.length ? '<p class="sb-pl-missed" style="margin:14px 0 0;font-size:12.5px;color:var(--muted);line-height:1.5">Words you will meet again: ' + missed.map(function (w) { return '<b style="color:var(--text)">' + esc(w) + '</b>'; }).join(', ') + '</p>' : ''),
      next: { label: 'Continue', act: 'onbNext' } };
  }
  /* what onboarding hands to the new child — null when nothing was placed */
  function record() {
    var p = pl(); if (!p) return null; var regs = regionsOf(D());
    if (p.skipped) return { skipped: true };
    if (!p.res) return null;
    var R = regs[p.pick] || regs[0];
    return { u: R.entry.u, act: R.act, pick: p.pick, rec: p.rec, n: p.res.n, ok: p.res.right };
  }
  API.begin = begin; API.view = view; API.record = record; API.acts = acts;
})();
