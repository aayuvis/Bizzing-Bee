/* circuit-cases.js — THE FIVE SURPRISE STOPS of The Bee Circuit (circuit/BEE-CIRCUIT.md §7, build step 6).

   Lazy (boot-lazy group `circuitCases`: this file and its generated data, circuit-cases-data.js, which
   tools/circuit/build-cases.cjs cuts from circuit/script.json and the served library). Nothing here is on a first
   screen. It reads the season's state only through the core (window.SB_CIRCUIT: caseState / caseUpdate / caseLate),
   which keeps it behind store.js; it never touches storage itself.

     SB_CIRCUIT_CASES.pins(act[, {pts}])  HTML for a region board: a red-sealed URGENT pin, between two ordinary
                                          stops, for each case the core holds a record for (it makes one, 'unseen',
                                          when the case's trigger round's mail is in) and which is not
                                          solved-and-dismissed. Optional, never expires, never gates (L2).
     SB_CIRCUIT_CASES.place([root])       puts the pins between their two stops once the board is laid out (the
                                          stops' own left/top) — pins() asks for it on the next frame by itself
     SB_CIRCUIT_CASES.open(id)            the case runner, in its own overlay with an address (#/case/<id>)
     SB_CIRCUIT_CASES.close()             leaves it as Back does (steps back over its own history entry)
     SB_CIRCUIT_CASES.drop()              takes it away without touching history (a route that has already moved on)
     SB_CIRCUIT_CASES.peek()              read-only state for the tests' bots (never drawn)

   THE FORMAT (§7): 1 cold open — two panels cut from the region's own painting, a drawn clock and the case's
   clock line (a late open says its lateLine first; Case 3 says its safeLine before anything else after it) ·
   2 the scene — three things to look at (one is the clue planted earlier) and the suspects, each with the
   tell the cast gives them, never a secret · 3 the puzzle — the script's own 8–12 items on the engine the case
   names (Spot the Error, the Warm-up's typed spelling, Origins' sort by language, Roots' parts, Spot the Error
   over statements), each with a clock (Ask Suki adds 30 s) · 4 the escalation, halfway · 5 the accusation —
   three choices; a wrong one says the script's "Not quite. Look again.", is struck, and the right clue glows;
   a second wrong one leaves the right one shown (L6: a case always resolves) · 6 the staged reveal, then every
   suspect's secret · 7 the last chill, and the team photo for the Hive Post.

   THE RULES IT KEEPS
     · Every story word on screen is a script.json string (the data file); the rest is the few words a control
       needs. Nothing here writes or rewords a line.
     · Hints are rivals, each a real bee question answered from the item's OWN record (or the authored field the
       script's build rules name), masked like Mock Bee's Pronouncer's Chair — the answer is never in a hint. A
       rival with nothing for an item has no button for it.
     · A MISS HOLDS: the first two on an item hold on a card that never shows the answer and opens the next hint
       (hints escalate); the third holds on the app's own miss card (SGUI.miss / SGUI.missQ) with the answer
       shown. Nothing moves on until Continue. Never the answer before it is answered or shown — in no text node
       and no attribute.
     · PAY (L11): one coin, addCoins('answer'), per FIRST-TRY right answer, and nothing for finishing. A typed
       spelling pays at once (a guess cannot type a word). A PICKED answer (a language, a meaning, "All spelled
       right") pays only above chance, as Word Lore pays its picks (lore.js owed/settle): nothing until the case
       holds 60% of its picks right first time, then the backlog and one per right after — so a random tapper
       earns nothing. An item already answered never pays again (the record is the case's own, through the core),
       and a hint that IS the answer (Ines's home language) makes the item told, not paid. No Math.random anywhere.
     · No text input: letters come from the keyboard or the kit's on-screen keys (SGUI.keys). Keyboard AND touch
       for every control; 44px targets; one live region (data-live-prompt → SB_LIVE.scan); reduced motion
       respected; no emoji in a control.
   Guards: tests/circuit-cases.cjs (browser) and tests/circuit-cases-data.cjs (node). */
(function () {
  'use strict';
  const W = window;
  const DATA = () => W.SB_CIRCUIT_CASES_DATA || null;
  const CASES = () => (DATA() && DATA().cases) || [];
  const caseOf = id => CASES().find(c => c.id === id) || null;
  const CORE = () => W.SB_CIRCUIT || null;
  const kid = () => { try { return active(); } catch (e) { return null; } };
  const E = s => String(s == null ? '' : s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const ic = (n, s) => { try { return iconSVG(n, s || 18); } catch (e) { return ''; } };
  const say1 = (t, rate) => { try { say(t, rate); } catch (e) {} };
  const key = w => String(w || '').toLowerCase().trim();
  const coarse = () => { try { return W.matchMedia('(pointer:coarse)').matches; } catch (e) { return false; } };
  const calm = () => { try { return !!(W.SB_CALM || (typeof state !== 'undefined' && state.calmMode)); } catch (e) { return false; } };
  const ITEM_SECS = 60;   // a case's clock, an item at a time; Calm gives half as much again, Ask Suki 30 s more
  const RIVALS = ['scopey', 'astro', 'beaker', 'koi', 'snowfox', 'melody', 'samurai'];

  /* ------------------------------------------------------------------ the season's state, through the core */
  function halls(c) { try { const C = CORE(); const s = C && C.state ? C.state(c) : null; return (s && s.halls) || {}; } catch (e) { return {}; } }
  const hallDone = (c, act) => { const h = halls(c)[act]; return !!(h && h.done); };
  function cst(c, id) { try { const C = CORE(); const s = C && C.caseState ? C.caseState(c, id) : null; return s || {}; } catch (e) { return {}; } }
  function upd(c, id, patch) { try { const C = CORE(); if (C && C.caseUpdate) C.caseUpdate(c, id, patch); } catch (e) {} }
  const shown = (c, k) => { const s = cst(c, k.id); return !(s.state === 'solved' && s.dismissed); };
  /* a case is AVAILABLE once the core holds its record (caseState is null until the trigger round's mail is in); a
     core without caseState falls back to the trigger round's hall being done. LATE is the core's own answer (its next
     round's mail is in), or, without caseLate, the next round's hall being done. */
  function avail(c, k) { try { const C = CORE(); if (C && C.caseState) return C.caseState(c, k.id) != null; } catch (e) { return false; } return hallDone(c, k.trig); }
  function isLate(c, k) { try { const C = CORE(); if (C && C.caseLate) return !!C.caseLate(c, k.id); } catch (e) { return false; } return !!(k.next && hallDone(c, k.next)); }

  /* ------------------------------------------------------------------ 1. THE PIN on a region board */
  const SEAL = '<svg class="cc-seal" viewBox="0 0 48 48" width="40" height="40" aria-hidden="true" focusable="false">' +
    '<path d="M24 3l4.2 3.1 5.2-.4 2.4 4.6 4.7 2.2-.3 5.2 3.1 4.3-3.1 4.3.3 5.2-4.7 2.2-2.4 4.6-5.2-.4L24 45l-4.2-3.1-5.2.4-2.4-4.6-4.7-2.2.3-5.2L4.7 26 7.8 21.7l-.3-5.2 4.7-2.2 2.4-4.6 5.2.4z" fill="url(#cc-wax)" stroke="#5E0B12" stroke-width="1.4"/>' +
    '<defs><radialGradient id="cc-wax" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#E2464E"/><stop offset=".6" stop-color="#B0161F"/><stop offset="1" stop-color="#7A0C14"/></radialGradient></defs>' +
    '<circle cx="24" cy="24" r="12.5" fill="none" stroke="#F6C9B8" stroke-opacity=".55" stroke-width="1.6"/>' +
    '<path d="M24 15.5v10.5" stroke="#FFE9DC" stroke-width="3.4" stroke-linecap="round"/><circle cx="24" cy="31.4" r="2.2" fill="#FFE9DC"/></svg>';
  function pinHTML(k, xy) {
    const at = xy ? 'left:' + xy.x.toFixed(2) + '%;top:' + xy.y.toFixed(2) + '%' : '';
    return '<button type="button" class="cc-pin' + (xy ? '' : ' cc-unplaced') + '" data-act="caseOpen" data-arg="' + E(k.id) + '" data-cc-pin="' + E(k.id) + '"' +
      (at ? ' style="' + at + '"' : '') + ' aria-label="' + E('Surprise Stop, urgent: ' + k.title) + '" title="' + E(k.title) + '">' + SEAL +
      '<span class="cc-pin-tag" aria-hidden="true">URGENT</span></button>';
  }
  /* between two ordinary stops: the stop the child stands on and the one before it (both on screen when the board
     opens on the child), else the middle of the region */
  function pair(list, now) { const n = list.length; if (n < 2) return null; let j = now >= 0 ? now - 1 : Math.floor(n / 2) - 1; j = Math.max(0, Math.min(n - 2, j)); return [j, j + 1]; }
  const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  function pins(act, o) {
    o = o || {}; const c = kid(); if (!c) return '';
    const ks = CASES().filter(k => k.act === act && avail(c, k) && shown(c, k));
    if (!ks.length) return '';
    let xy = null;
    if (Array.isArray(o.pts) && o.pts.length > 1) { const p = pair(o.pts, typeof o.now === 'number' ? o.now : -1); if (p) xy = mid(o.pts[p[0]], o.pts[p[1]]); }
    if (!xy) queuePlace();
    return ks.map(k => pinHTML(k, xy)).join('');
  }
  let _placeRaf = 0;
  function queuePlace() { if (_placeRaf) return; try { _placeRaf = requestAnimationFrame(() => { _placeRaf = 0; place(); }); } catch (e) { _placeRaf = 0; } }
  function place(root) {
    try {
      (root || document).querySelectorAll('.cc-pin').forEach(pin => {
        const board = pin.closest('.act-board') || document.querySelector('.act-board'); if (!board) return;
        const stops = [...board.querySelectorAll(':scope > .atlas-stop')];
        const pts = stops.map(s => ({ x: parseFloat(s.style.left), y: parseFloat(s.style.top) })).filter(p => isFinite(p.x) && isFinite(p.y));
        if (pin.parentElement !== board) board.appendChild(pin);
        let xy = null; const p = pair(pts, stops.findIndex(s => s.classList.contains('now')));
        if (p) xy = mid(pts[p[0]], pts[p[1]]); else if (pts.length === 1) xy = { x: Math.min(96, pts[0].x + 4), y: pts[0].y };
        if (!xy) return;
        pin.style.left = xy.x.toFixed(2) + '%'; pin.style.top = xy.y.toFixed(2) + '%'; pin.classList.remove('cc-unplaced');
      });
    } catch (e) {}
  }

  /* ------------------------------------------------------------------ 2. THE RUNNER */
  let R = null, KEYS = null, CLOCK = null;
  const it = () => R && R.k.puzzle.items[R.i];
  const recOf = x => { const D = DATA(); return (D && D.recs && D.recs[x.rw]) || {}; };
  const castName = w => { const D = DATA(); const x = D && D.cast[w]; return x ? x.name : (String(w || '').charAt(0).toUpperCase() + String(w || '').slice(1)); };
  const castTell = w => { const D = DATA(); const x = D && D.cast[w]; return x ? x.tell : ''; };
  const TYPED = { fix: 1, spell: 1, build: 1 };
  const PICKED = { sort: 1, part: 1 };
  const isPick = x => !!(PICKED[x.k] || (x.k === 'stmt' && x.ok));
  const res = () => (R && R.st.res) || {};
  const resolved = i => !!res()[i];
  const nItems = () => R.k.puzzle.items.length;
  const doneCount = () => R.k.puzzle.items.filter((x, i) => resolved(i)).length;

  /* masking, as Mock Bee's Pronouncer's Chair masks: app3's maskTxt, then the word and any form of it, then its stem */
  const reEsc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function mask(t, words, whole) {
    let s = String(t || '');
    (words || []).forEach(w => { w = String(w || ''); if (!w) return;
      if (whole) { s = s.replace(new RegExp('\\b' + reEsc(w) + '\\b', 'ig'), '▁▁▁'); return; }
      try { if (typeof maskTxt === 'function') s = maskTxt(s, w); } catch (e) {}
      s = s.replace(new RegExp(reEsc(w) + '[a-z]*', 'ig'), '▁▁▁');
      const st = w.toLowerCase().replace(/(ies|es|s|ed|ing)$/, '');
      if (st.length >= 4 && st !== w.toLowerCase()) s = s.replace(new RegExp('\\b' + reEsc(st) + '[a-z]*', 'ig'), '▁▁▁'); });
    return s;
  }
  /* what a rival says for this item: '' when they have nothing (no button), and `told` when it IS the answer */
  function hintFor(x, rival) {
    const D = DATA(), kind = D && D.kinds[rival], r = recOf(x), words = x.ans.concat([x.rw, x.word || '']).filter(Boolean);
    const m = t => mask(t, isPick(x) ? x.ans : words, isPick(x)), mr = t => mask(mask(t, [x.rw]), isPick(x) ? x.ans : [], true);
    if (kind === 'def') { const t = [r.d, r.s].filter(Boolean).map(isPick(x) ? mr : m).join(' — '); return t ? { t } : null; }
    if (kind === 'origin') { if (x.k === 'spell') return x.greek ? { t: m(x.greek) } : null; return r.o && !isPick(x) ? { t: m(r.o) } : null; }
    if (kind === 'roots') { if (x.k === 'part' || isPick(x)) return null; return r.r && /[+=]/.test(r.r) ? { t: m(r.r) } : null; }
    if (kind === 'parts') return x.k === 'build' && x.parts ? { t: m(x.parts.join(' · ')) } : null;
    if (kind === 'home') return x.k === 'sort' ? { t: x.ans[0], told: true } : null;
    if (kind === 'twice') return { t: '', say: x.k === 'part' ? x.shown : x.k === 'sort' ? x.shown : (x.k === 'stmt' && x.ok ? x.word : x.ans[0]) };
    if (kind === 'breathe') return { t: 'Breathe out.', secs: 30 };
    return null;
  }
  const hintsOf = x => (R.k.hints || []).map(rv => ({ rv, h: hintFor(x, rv) })).filter(o => o.h);
  /* the rival a miss opens next: one with words not yet open, then Nova saying it twice, slowly — never the one whose
     answer IS the answer (Ines), never Suki's time (a hold already stops the clock) */
  const ESCALATE = { def: 1, origin: 1, roots: 1, parts: 1 };
  function escalate() { const x = it(); if (!x) return null; const hs = hintsOf(x), K = o => DATA().kinds[o.rv], shut = o => R.ui.open.indexOf(o.rv) < 0;
    const nx = hs.find(o => ESCALATE[K(o)] && shut(o)) || hs.find(o => K(o) === 'twice' && shut(o));
    if (!nx) return null;
    R.ui.open.push(nx.rv);
    if (K(nx) === 'twice') { say1(nx.h.say, 0.6); setTimeout(() => { if (R && it() === x) say1(nx.h.say, 0.6); }, 1700); }
    return nx; }

  function open(id) {
    const k = caseOf(id); if (!k) return false;
    const go = () => { const c = kid(); if (!c || !CORE() || !CORE().caseUpdate || !avail(c, k)) return; start(c, k); };
    try { if (W.SB_LAZY) { SB_LAZY.need('circuit', () => SB_LAZY.need('circuitCases', go)); return true; } } catch (e) {}
    go(); return true;
  }
  function start(c, k) {
    if (!avail(c, k)) return;
    stop(true);
    const st0 = cst(c, k.id);
    const first = { state: st0.state === 'solved' ? 'solved' : 'open' };
    if (!st0.at) first.at = Date.now();
    if (!st0.res) first.res = {};
    if (!st0.seen) first.seen = { taps: [0, 0, 0], esc: 0 };
    upd(c, k.id, first);
    R = { id: k.id, k, c, st: cst(c, k.id), late: isLate(c, k), step: 'cold', i: 0, ui: freshUI(), coins: 0, wrong: [], rv: 0, log: [] };
    if (R.st.state === 'solved' && !R.st.dismissed) R.step = 'reveal';
    const el = document.createElement('div');
    el.className = 'arc-play cc-play'; el.setAttribute('data-route', 'case/' + k.id); el.setAttribute('data-trap', 'case');
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Surprise Stop: ' + k.title);
    el.innerHTML = '<div class="arc-play-top cc-top"><button type="button" class="arc-play-back cc-back" data-cc="back">' + ic('arrowLeft', 16) + '<span>Back</span></button>' +
      '<span class="arc-play-name cc-name">' + E(k.title) + '</span><span class="cc-urgent">URGENT</span></div><div class="arc-play-host cc-host"></div>';
    document.body.appendChild(el);
    R.el = el; R.host = el.querySelector('.cc-host');
    el.addEventListener('click', onClick);
    addEventListener('keydown', onKey, true);
    try { if (W.SB_SHELL && SB_SHELL.sync) SB_SHELL.sync(); } catch (e) {}
    try { if (W.SB_W4_MUSIC) SB_W4_MUSIC.sync(); } catch (e) {}
    mark(R.step); paint();
  }
  const freshUI = () => ({ typed: '', misses: 0, open: [], told: false, after: false, tap: -1, phase: '', said: {}, addSecs: 0, picked: -1, first: null });
  function stop(quiet) {
    if (CLOCK) { try { CLOCK.stop(); } catch (e) {} CLOCK = null; }
    if (KEYS) { try { KEYS.destroy(); } catch (e) {} KEYS = null; }
    removeEventListener('keydown', onKey, true);
    if (R && R.el) { try { R.el.remove(); } catch (e) {} }
    R = null;
  }
  /* leave: Back, Esc and Done step back over the overlay's own history entry (as ← Arcade does); a route that moved
     on (Back pressed in the browser, a new address) only takes the overlay away */
  function close(how) {
    if (!R) return; const wasId = R.id;
    stop();
    if (how !== 'pop') { try { if (W.SB_SHELL && SB_SHELL.leaveOverlay) { SB_SHELL.leaveOverlay(); } else if (typeof render === 'function') render(); } catch (e) {} }
    else setTimeout(() => { try { if (!R && typeof render === 'function') render(); } catch (e) {} }, 0);   // the shell applies the route; the board redraws without the pin's old state
    try { if (W.SB_W4_MUSIC) SB_W4_MUSIC.sync(); } catch (e) {}
    return wasId;
  }
  /* THE BROWSER'S BACK. The shell's popstate handler (registered at boot, so it runs before any listener of this lazy
     file) applies the route it lands on and then re-syncs the address — and with the overlay still on the page it reads
     the overlay's route and writes #/case/<id> straight back over the entry Back landed on. The arcade's overlay escapes
     that only because the shell's leaveDrill() closes it first. So the overlay goes BEFORE the traversal: the Navigation
     API's navigate event fires ahead of popstate. Where there is none, popstate takes it away and puts the address of the
     screen under it back on the entry (the integrator's one line in family-shell's leaveDrill makes both unnecessary —
     circuit/BUILD-cases.md). */
  const routeIs = u => { try { return new URL(u, location.href).hash.replace(/^#\/?/, '') === 'case/' + R.id; } catch (e) { return false; } };
  try { if (W.navigation && typeof navigation.addEventListener === 'function') navigation.addEventListener('navigate', e => { if (R && !routeIs(e.destination && e.destination.url)) close('pop'); }); } catch (e) {}
  addEventListener('popstate', e => { if (!R) return;
    const off = !routeIs(location.href) || !(e.state && e.state.ov); if (!off) return;
    close('pop');
    try { if (W.SB_SHELL && SB_SHELL.routeOf) history.replaceState(e.state, '', '#/' + SB_SHELL.routeOf()); } catch (x) {} });
  function mark(step) { if (R) R.log.push(step); }
  function save1(patch) { if (!R) return; upd(R.c, R.id, patch); R.st = cst(R.c, R.id); }

  /* ------------------------------------------------------------------ drawing */
  const CLOCK_SVG = '<svg class="cc-clock" viewBox="0 0 40 40" width="34" height="34" aria-hidden="true" focusable="false"><circle cx="20" cy="20" r="17" fill="#FFF8E8" stroke="#3B2A12" stroke-width="2.4"/>' +
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => { const a = i * Math.PI / 6; return '<line x1="' + (20 + 13.5 * Math.sin(a)).toFixed(1) + '" y1="' + (20 - 13.5 * Math.cos(a)).toFixed(1) + '" x2="' + (20 + 15.5 * Math.sin(a)).toFixed(1) + '" y2="' + (20 - 15.5 * Math.cos(a)).toFixed(1) + '" stroke="#3B2A12" stroke-width="' + (i % 3 ? 1.2 : 2.2) + '"/>'; }).join('') +
    '<line x1="20" y1="20" x2="20" y2="10" stroke="#3B2A12" stroke-width="2.6" stroke-linecap="round"/><line x1="20" y1="20" x2="27" y2="22" stroke="#3B2A12" stroke-width="2.2" stroke-linecap="round"/>' +
    '<g class="cc-hand"><line x1="20" y1="22" x2="20" y2="6.5" stroke="#B0161F" stroke-width="1.2" stroke-linecap="round"/></g><circle cx="20" cy="20" r="1.8" fill="#B0161F"/></svg>';
  /* the impossible thing, drawn in code for the second panel (no generated art) */
  const THING = {
    c1: '<rect x="22" y="8" width="56" height="72" rx="3" fill="#FBF4E2" stroke="#4A3A22" stroke-width="2"/>' + [20, 30, 40, 50, 60, 70].map((y, i) => '<path d="M30 ' + y + 'h' + (14 + (i * 7) % 12) + 'm6 0h' + (12 - i % 3 * 2) + '" stroke="#4A3A22" stroke-width="2.6" stroke-linecap="round"/>').join(''),
    c2: '<path d="M30 74V40a20 20 0 0 1 40 0v34" fill="rgba(210,236,255,.35)" stroke="#E8F4FF" stroke-width="2.4"/><rect x="24" y="74" width="52" height="8" rx="2" fill="#6B4A2A" stroke="#3B2A12" stroke-width="1.6"/><rect x="60" y="52" width="8" height="10" rx="2" fill="none" stroke="#C9A24A" stroke-width="2"/>',
    c3: '<rect x="14" y="60" width="72" height="16" rx="3" fill="#6B4A2A" stroke="#3B2A12" stroke-width="1.6"/><path d="M34 60V44a6 6 0 0 1 6-6h20a6 6 0 0 1 6 6v16" fill="#3E6E8E" stroke="#1E3A4E" stroke-width="2"/><path d="M42 38v-6h16v6" fill="none" stroke="#1E3A4E" stroke-width="2.4"/>',
    c4: '<path d="M30 80l10-34h20l10 34" fill="none" stroke="#6B4A2A" stroke-width="3"/><path d="M34 46h32l-4-8H38z" fill="#8A6236" stroke="#3B2A12" stroke-width="1.6"/><rect x="38" y="30" width="24" height="8" fill="none" stroke="#E8DCC0" stroke-width="1.6" stroke-dasharray="3 2"/>',
    c5: '<path d="M18 74l32-20 32 20z" fill="#EFE3C4" stroke="#4A3A22" stroke-width="2"/><rect x="18" y="54" width="64" height="20" fill="#E4D3A8" stroke="#4A3A22" stroke-width="2"/><path d="M18 54l32 14 32-14" fill="none" stroke="#4A3A22" stroke-width="1.6"/><circle cx="50" cy="66" r="4" fill="#B0161F"/>'
  };
  const plate = k => 'app-art/map-' + k.act + '.webp' + (W.SB_ASSET_V ? '?v=' + W.SB_ASSET_V : '');
  const face = (w, s) => { if (RIVALS.indexOf(w) >= 0 || w === 'pixel' || w === 'comet' || w === 'goldlegend') { try { if (W.SB_AVATAR) return '<span class="cc-face" aria-hidden="true">' + SB_AVATAR(w, s || 30) + '</span>'; } catch (e) {} }
    return '<span class="cc-face cc-mono" aria-hidden="true">' + E(castName(w).replace(/^the /i, '').charAt(0).toUpperCase()) + '</span>'; };
  const readBtn = (t, lbl) => '<button type="button" class="cc-read" data-cc="read" data-say-i="' + R.ui.sayN + '" aria-label="' + E(lbl || 'Read aloud') + '" title="Read aloud">' + ic('volume', 18) + '</button>';
  /* a line's quoted V. note is in the runner's hand: it slants left (build[id=signoff-upright]) */
  const line = t => E(t).replace(/'([^']{3,200}? — V\.)'/g, '\'<span class="cc-vhand">$1</span>\'');
  const card = (cls, inner, live) => '<div class="sg-panel cc-card ' + (cls || '') + '"' + (live ? ' data-live-prompt="' + E(live) + '"' : '') + '>' + inner + '</div>';
  const btn = (act, label, arg, cls, extra) => '<button type="button" class="cc-btn ' + (cls || '') + '" data-cc="' + act + '"' + (arg != null ? ' data-arg="' + E(arg) + '"' : '') + (extra || '') + '>' + label + '</button>';
  const goBtn = (act, label) => btn(act, E(label) + ' <span class="sg-kbd" aria-hidden="true">Enter</span>', null, 'go cc-primary');
  const coinStat = () => '<span class="cc-stat">' + ic('coin', 16) + '<b data-cc-coins>' + (R.coins | 0) + '</b></span>';
  function stage(o) {
    const hud = { left: o.left != null ? o.left : '<span class="cc-stat">' + CLOCK_SVG + '</span>', center: o.center || '', right: o.right != null ? o.right : coinStat() };
    const html = (W.SGUI && SGUI.stage) ? SGUI.stage({ name: 'case-' + R.id, plate: plate(R.k), cls: 'cc-stage cc-' + R.step, region: false, hud, play: '<div class="cc-scroll">' + o.play + '</div>', controls: o.controls || '', label: R.k.title })
      : '<section class="sb-stage cc-stage cc-' + R.step + '"><div class="sg-st-play"><div class="cc-scroll">' + o.play + '</div></div><div class="sg-st-ctl">' + (o.controls || '') + '</div></section>';
    return html;
  }
  let SAYS = [];
  function sayable(t) { R.ui.sayN = SAYS.length; SAYS.push(t); return readBtn(t); }

  function paint() {
    if (!R || !R.host || R.answerUp) return;   // the shared miss card is up on this stage: a repaint would take it away

    if (KEYS) { try { KEYS.destroy(); } catch (e) {} KEYS = null; }
    SAYS = []; R.ui.sayN = 0;
    const V = VIEW[R.step] || VIEW.cold;
    const o = V();
    R.host.innerHTML = stage(o);
    R.focus = o.focus || null;
    if (o.keys) mountKeys();
    if (R.step === 'item') { const x = it(); if (x && !resolved(R.i) && !R.ui.after) armClock(); else holdClock(true); }
    else holdClock(true);
    try { if (W.SGUI && SGUI.stageFit) SGUI.stageFit(); } catch (e) {}
    focusNow();
    live();
  }
  function live() { try { if (W.SB_LIVE && SB_LIVE.scan && R && R.el) SB_LIVE.scan(R.el); } catch (e) {} }
  function focusNow() { if (!R) return; const f = R.focus ? R.el.querySelector(R.focus) : R.el.querySelector('.cc-primary:not([disabled])');
    if (f) { try { f.focus({ preventScroll: true }); } catch (e) {} } }

  /* step 1: the cold open */
  function viewCold() {
    const k = R.k, c1 = [];
    if (R.late) c1.push('<p class="cc-late" data-cc-line="lateLine">' + line(k.lateLine) + '</p>');
    if (k.safeLine) c1.push('<p class="cc-safe" data-cc-line="safeLine">' + line(k.safeLine) + '</p>');
    c1.push('<p class="cc-place" data-cc-line="place">' + line(k.place) + '</p>');
    const all = [R.late ? k.lateLine : '', k.safeLine || '', k.place, k.clock, k.impossible].filter(Boolean).join(' ');
    const play = '<div class="cc-panels">' +
      '<figure class="cc-panel p1" style="background-image:url(\'' + plate(k) + '\')"><div class="cc-cap">' + c1.join('') + '</div>' +
        '<div class="cc-clockrow" data-cc-line="clock">' + CLOCK_SVG.replace('width="34" height="34"', 'width="52" height="52"') + '<p>' + line(k.clock) + '</p></div></figure>' +
      '<figure class="cc-panel p2" style="background-image:url(\'' + plate(k) + '\')"><svg class="cc-thing" viewBox="0 0 100 90" width="120" height="108" aria-hidden="true" focusable="false">' + (THING[k.id] || '') + '</svg>' +
        '<div class="cc-cap"><p data-cc-line="impossible">' + line(k.impossible) + '</p></div></figure></div>' +
      '<p class="cc-fiction">' + E(DATA().fiction) + '</p>';
    return { center: '<span class="cc-chip">' + E(k.place) + '</span>', play: '<div data-live-prompt="' + E(all) + '">' + play + '</div>' + '<div class="cc-readrow">' + sayable(all) + '</div>',
      controls: goBtn('next', 'Look closer') };
  }
  /* step 2: the scene — three things to look at, and the suspects (name and tell, never a secret) */
  const teaser = t => { const m = /^(.*?)[:.,]/.exec(String(t)); return (m && m[1].length >= 8 ? m[1] : String(t)).trim(); };
  function suspectsHTML(glow) {
    return '<div class="cc-sus" data-clue="suspects">' + R.k.suspects.map(s => '<div class="cc-su sg-panel" data-who="' + E(s.who) + '">' + face(s.who, 30) +
      '<span><b>' + E(castName(s.who)) + '</b>' + (castTell(s.who) ? '<i>' + E(castTell(s.who)) + '</i>' : '') + '</span></div>').join('') + '</div>';
  }
  function viewScene() {
    const k = R.k, seen = (R.st.seen && R.st.seen.taps) || [0, 0, 0], n = seen.filter(Boolean).length;
    const taps = k.taps.map((t, i) => {
      const on = !!seen[i];
      return '<button type="button" class="cc-tap' + (on ? ' on' : '') + '" data-cc="look" data-arg="' + i + '" data-clue="tap' + i + '" aria-expanded="' + on + '">' +
        '<span class="cc-tapn">' + (i + 1) + '</span><span class="cc-tapt">' + (on ? line(t) : E(teaser(t))) + '</span>' + (on ? '' : '<span class="cc-tapic">' + ic('search', 18) + '</span>') + '</button>'; }).join('');
    const prompt = n < 3 ? 'Look closer: tap all three.' : 'You have looked at all three.';
    return { center: '<span class="cc-chip">' + n + ' / 3</span>',
      play: card('cc-scene', '<p class="cc-ask">' + E(prompt) + '</p><div class="cc-taps">' + taps + '</div>', prompt) + suspectsHTML(),
      controls: btn('next', 'To the puzzle <span class="sg-kbd" aria-hidden="true">Enter</span>', null, 'go cc-primary', n < 3 ? ' disabled' : ''),
      focus: n < 3 ? '[data-cc="look"]:not(.on)' : null };
  }
  /* step 3a: the puzzle's brief (the card or the rule it gives) */
  function viewBrief() {
    const P = R.k.puzzle;
    const t = [P.brief, P.rule].filter(Boolean).join(' ');
    return { center: '<span class="cc-chip">' + doneCount() + ' / ' + nItems() + '</span>',
      play: card('cc-brief', (P.card ? '<div class="cc-note">' + line(P.card) + '</div>' : '') + '<p>' + line(P.brief) + '</p>' + (P.rule ? '<p class="cc-rule">' + line(P.rule) + '</p>' : '') + sayable(t), t),
      controls: goBtn('next', doneCount() ? 'Carry on' : 'Start') };
  }
  /* the puzzle's own board: what has been worked out so far (also a clue on the accusation) */
  function boardHTML() {
    const k = R.k, its = k.puzzle.items, r = res();
    if (k.id === 'c1') return '<div class="cc-list" data-clue="puzzle">' + its.map((x, i) => '<span class="cc-li' + (i === R.i && R.step === 'item' ? ' cur' : '') + (r[i] ? ' done' : '') + '">' + E(r[i] ? x.ans[0] : x.shown) + '</span>').join('') + '</div>';
    if (k.id === 'c3') return '<div class="cc-acro" data-clue="puzzle">' + its.map((x, i) => '<span class="cc-ac' + (r[i] ? ' done' : '') + '"><b>' + (r[i] ? E(x.ans[0].charAt(0)) : '') + '</b><i>' + E(x.shown) + (r[i] ? ' · ' + E(x.ans[0]) : '') + '</i></span>').join('') + '</div>';
    if (k.id === 'c4') return '<div class="cc-parts" data-clue="puzzle">' + its.filter(x => x.k === 'part').map((x, i) => '<span class="cc-pt' + (r[i] ? ' done' : '') + '"><b>' + E(x.shown) + '</b><i>' + (r[i] ? E(x.ans[0]) : '?') + '</i></span>').join('') + '</div>';
    if (k.id === 'c5') return '<div class="cc-stmts" data-clue="puzzle">' + its.map((x, i) => r[i] ? '<span class="cc-sm ' + (x.ok ? 'true' : 'untrue') + '"><b>' + E(castName(x.who)) + '</b> ' + (x.ok ? TICK : CROSS) + '<i>' + E(x.said) + '</i></span>' : '').join('') + '</div>';
    return '<div class="cc-trail" data-clue="puzzle" aria-hidden="true">' + its.map((x, i) => '<span class="cc-dot' + (r[i] ? ' done' : '') + (i === R.i && R.step === 'item' ? ' cur' : '') + '"></span>').join('') + '</div>';
  }
  const TICK = '<svg viewBox="0 0 16 16" width="15" height="15" aria-label="true" role="img"><path d="M3 8.6l3.2 3L13 4.6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const CROSS = '<svg viewBox="0 0 16 16" width="15" height="15" aria-label="untrue" role="img"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';

  /* step 3b: one item */
  function tokens(s) { const out = []; String(s).split(/(\s+)/).forEach(p => { if (!p) return; if (/^\s+$/.test(p)) { out.push({ sp: p }); return; }
      const m = /^([^A-Za-z']*)([A-Za-z'][A-Za-z'\-]*)([^A-Za-z']*)$/.exec(p); if (m) out.push({ pre: m[1], t: m[2], post: m[3] }); else out.push({ sp: p }); }); return out; }
  const stmtToks = x => tokens(x.said).filter(t => t.t);
  function askOf(x) {
    if (x.k === 'fix') return 'Type it as it should be printed.';
    if (x.k === 'spell' || x.k === 'build') return 'Spell it.';
    if (x.k === 'sort') return 'Its home language?';
    if (x.k === 'part') return 'What does this part mean?';
    if (x.k === 'stmt') return R.ui.phase === 'type' ? 'Now type it the right way.' : 'Tap the word that is spelt wrong, or choose All spelled right.';
    return '';
  }
  const typing = x => !!x && !R.ui.after && !resolved(R.i) && (TYPED[x.k] || (x.k === 'stmt' && R.ui.phase === 'type'));
  function promptHTML(x) {
    const at = 'Item ' + (R.i + 1) + ' of ' + nItems() + '. ';
    if (x.k === 'fix') return { h: '<div class="cc-lbl">The list says</div><div class="cc-big cc-printed">' + E(x.shown) + '</div>', l: at + 'The list says ' + x.shown + '.' };
    if (x.k === 'spell' || x.k === 'build') return { h: '<div class="cc-lbl">' + (x.k === 'spell' ? 'Clue' : 'Meaning') + '</div><div class="cc-clue">' + line(x.clue) + '</div>', l: at + x.clue + '.' };
    if (x.k === 'sort' || x.k === 'part') return { h: '<div class="cc-big">' + E(x.shown) + '</div>', l: at + x.shown + '.' };
    if (x.k === 'stmt') {
      const ts = stmtToks(x); let j = 0;
      const body = tokens(x.said).map(t => t.sp ? ' ' : (E(t.pre) + (R.ui.phase === 'type' || R.ui.after || resolved(R.i) ? '<span class="cc-tokx' + (j++ === R.ui.tap ? ' bad' : '') + '">' + E(t.t) + '</span>'
        : '<button type="button" class="cc-tok" data-cc="tok" data-arg="' + (j++) + '">' + E(t.t) + '</button>') + E(t.post))).join('');
      return { h: '<div class="cc-lbl">' + face(x.who, 22) + E(castName(x.who)) + '</div><p class="cc-said">' + body + '</p>', l: at + castName(x.who) + ': ' + x.said, n: ts.length };
    }
    return { h: '', l: at };
  }
  function hintsHTML(x) {
    const hs = hintsOf(x); if (!hs.length) return { b: '', o: '' };
    const D = DATA();
    const b = '<div class="cc-hints" role="group" aria-label="Ask a rival">' + hs.map(o => { const used = R.ui.open.indexOf(o.rv) >= 0 && D.kinds[o.rv] !== 'twice';
      return '<button type="button" class="cc-hint" data-cc="hint" data-arg="' + o.rv + '"' + (used || (D.kinds[o.rv] === 'breathe' && R.ui.addSecs) ? ' disabled' : '') + '>' + face(o.rv, 22) + '<span>Ask ' + E(castName(o.rv)) + '</span></button>'; }).join('') + '</div>';
    const op = R.ui.open.map(rv => { const o = hs.find(z => z.rv === rv); if (!o) return '';
      const kind = D.kinds[rv]; const t = kind === 'twice' ? 'Says it twice, slowly.' : o.h.t;
      return '<div class="cc-said-h" data-rival="' + rv + '"><b>' + E(castName(rv)) + '</b> ' + E(t) + (o.h.secs ? ' <span class="cc-plus">+' + o.h.secs + ' s</span>' : '') + '</div>'; }).join('');
    return { b, o: op };
  }
  function typedHTML() { const t = R.ui.typed;
    return '<div class="cc-typed" tabindex="-1" data-cc-typed aria-label="Your spelling: ' + E(t.split('').join(' ') || 'nothing yet') + '">' + (t ? t.split('').map(ch => '<span>' + E(ch) + '</span>').join('') : '') + '<span class="cc-caret" aria-hidden="true"></span></div>'; }
  function afterHTML(x) {
    const code = res()[R.i];
    const head = code === 1 ? 'Right, first time.' : code === 2 ? 'Right.' : 'Here it is.';
    let info = '';
    if (x.k === 'fix') info = x.ans.join(' · ') + (x.why ? ' — ' + x.why : '');
    else if (x.k === 'spell') info = x.ans[0] + ' — ' + x.greek + ' (' + x.rule + ')';
    else if (x.k === 'sort') info = x.shown + ' — ' + x.ans[0];
    else if (x.k === 'part') info = x.shown + ': ' + x.ans[0] + ' — ' + x.lang + ', ' + x.from;
    else if (x.k === 'build') info = x.ans[0] + ' — ' + x.parts.join(' · ');
    else if (x.k === 'stmt') info = x.ok ? x.said : (x.ans[0] + (x.why ? ' — ' + x.why : ''));
    return '<div class="cc-after ' + (code === 3 ? 'shown' : 'ok') + '"><b>' + (code === 3 ? '' : TICK) + E(head) + '</b><p>' + E(info) + '</p></div>';
  }
  function viewItem() {
    const x = it(); if (!x) return viewBrief();
    const p = promptHTML(x), hh = hintsHTML(x), done = R.ui.after || resolved(R.i), typ = typing(x);
    const ask = done ? '' : askOf(x);
    const body = boardHTML() + card('cc-item', p.h + (ask ? '<p class="cc-ask">' + E(ask) + '</p>' : '') + (typ ? typedHTML() : '') + (done ? afterHTML(x) : hh.o), done ? null : p.l + ' ' + ask) +
      (done ? '' : hh.b);
    let ctl = '';
    if (done) ctl = goBtn('next', 'Next');
    else if (x.opts) ctl = '<div class="cc-opts" role="group" aria-label="Choices">' + x.opts.map((o, i) => '<button type="button" class="cc-opt' + (R.ui.picked === i ? ' no' : '') + '" data-cc="pick" data-arg="' + i + '"><span class="cc-n" aria-hidden="true">' + (i + 1) + '</span>' + E(o) + '</button>').join('') + '</div>';
    else if (x.k === 'stmt' && R.ui.phase !== 'type') ctl = btn('fine', 'All spelled right <span class="sg-kbd" aria-hidden="true">0</span>', null, 'cc-fine');
    else if (typ && !coarse()) ctl = '<div class="cc-row">' + btn('clear', ic('close', 16) + ' Clear') + btn('check', 'Check <span class="sg-kbd" aria-hidden="true">Enter</span>', null, 'go cc-primary') + '</div>';
    return { left: '<span class="cc-stat cc-ring" data-cc-ring>' + CLOCK_SVG + '</span>', center: '<span class="cc-chip">' + (R.i + 1) + ' / ' + nItems() + '</span>',
      play: body, controls: ctl + (typ && coarse() ? '<div class="cc-keys" data-cc-keys></div>' : ''), keys: typ && coarse(),
      focus: done ? null : typ ? '[data-cc-typed]' : x.opts ? '.cc-opt' : x.k === 'stmt' ? '.cc-tok' : null };
  }
  /* step 4: the escalation */
  function viewEsc() {
    const t = R.k.escalation;
    return { center: '<span class="cc-chip">' + doneCount() + ' / ' + nItems() + '</span>', play: card('cc-esc', '<p class="cc-big-line" data-clue="esc">' + line(t) + '</p>' + sayable(t), t), controls: goBtn('next', 'Continue') };
  }
  /* step 5: the accusation — the case board, the story's false solution, three choices */
  function clueTiles(glowing) {
    const k = R.k, g = id => glowing && k.glow.indexOf(id) >= 0 ? ' cc-glow' : '';
    return '<div class="cc-board">' + k.taps.map((t, i) => '<div class="cc-clue sg-panel' + g('tap' + i) + '" data-clue="tap' + i + '">' + line(t) + '</div>').join('') +
      '<div class="cc-clue sg-panel' + g('esc') + '" data-clue="esc">' + line(k.escalation) + '</div>' +
      (k.clue ? '<div class="cc-clue sg-panel' + g('clue') + '" data-clue="clue">' + line(k.clue) + '</div>' : '') +
      '<div class="cc-clue sg-panel cc-pz' + g('puzzle') + '">' + boardHTML() + '</div></div>';
  }
  function viewAccuse() {
    const k = R.k, A = k.accusation, w = R.wrong, glowing = w.length > 0;
    const head = w.length ? A.lookAgain : 'What happened?';
    const chs = A.choices.map((t, i) => { const out = w.indexOf(i) >= 0, ans = w.length >= 2 && i === A.right;
      return '<button type="button" class="cc-choice' + (out ? ' out' : '') + (ans ? ' cc-glow' : '') + '" data-cc="accuse" data-arg="' + i + '"' + (out ? ' disabled aria-disabled="true"' : '') + '><span class="cc-n" aria-hidden="true">' + (i + 1) + '</span>' + E(t) + '</button>'; }).join('');
    return { center: '<span class="cc-chip">' + E(k.title) + '</span>',
      play: card('cc-false', '<p>' + line(k.falseSolution) + '</p>') + clueTiles(glowing) + suspectsHTML(),
      controls: '<p class="cc-ask cc-acc-h" data-live-prompt="' + E(head) + '">' + E(head) + '</p><div class="cc-choices" role="group" aria-label="What happened?">' + chs + '</div>',
      focus: '.cc-choice:not([disabled])' };
  }
  /* step 6: the staged reveal, a line at a time; then every suspect's secret */
  function viewReveal() {
    const k = R.k, L = k.reveal, n = Math.min(R.rv, L.length);
    const lines = L.slice(0, n + 1).map((t, i) => '<p class="cc-rv' + (i === n ? ' now' : '') + '" data-cc-line="reveal' + i + '">' + line(t) + '</p>').join('');
    const secrets = R.rv >= L.length ? '<div class="cc-secrets">' + k.suspects.map(s => '<div class="cc-su sg-panel" data-secret="' + E(s.who) + '">' + face(s.who, 30) + '<span><b>' + E(castName(s.who)) + '</b><i>' + line(s.secret) + '</i></span></div>').join('') + '</div>' : '';
    const cur = R.rv >= L.length ? k.suspects.map(s => castName(s.who) + ': ' + s.secret).join(' ') : L[n];
    return { center: '<span class="cc-chip">' + E(k.title) + '</span>', play: card('cc-reveal', lines + sayable(cur), cur) + secrets, controls: goBtn('next', 'Next') };
  }
  /* step 7: the last chill, and the team photo for the Hive Post */
  function viewChill() {
    const t = R.k.lastChill, team = ['scopey', 'astro', 'beaker', 'koi', 'snowfox', 'melody', 'samurai'].filter(w => !(R.id === 'c3' && w === 'samurai'));
    return { center: '<span class="cc-chip">' + E(R.k.title) + '</span>',
      play: card('cc-chill', '<p class="cc-big-line">' + line(t) + '</p>' + sayable(t), t) +
        '<div class="cc-photo" role="img" aria-label="Team photo, kept in your Hive Post"><span class="cc-photo-in">' + team.map(w => face(w, 34)).join('') + '</span><span class="cc-photo-cap">' + ic('sticker', 15) + ' Team photo · Hive Post</span></div>',
      controls: goBtn('done', 'Done') };
  }
  const VIEW = { cold: viewCold, scene: viewScene, brief: viewBrief, item: viewItem, esc: viewEsc, accuse: viewAccuse, reveal: viewReveal, chill: viewChill };

  /* ------------------------------------------------------------------ the clock (an item at a time) */
  function armClock() {
    const x = it(); if (!x) return;
    if (CLOCK && CLOCK._i === R.i) { CLOCK.hold(false); ringPaint(); return; }
    if (CLOCK) { try { CLOCK.stop(); } catch (e) {} CLOCK = null; }
    if (!W.SGUI || !SGUI.clock) return;
    const secs = ITEM_SECS * (calm() ? 1.5 : 1);
    CLOCK = SGUI.clock(secs, { onTick: () => ringPaint(), onEnd: () => timeUp() });
    CLOCK._i = R.i; CLOCK._t = secs; ringPaint();
  }
  function holdClock(v) { if (CLOCK) { try { CLOCK.hold(v); } catch (e) {} } }
  function ringPaint() { try { if (!R || !CLOCK) return; const el = R.el.querySelector('[data-cc-ring]'); if (!el) return;
    const left = Math.max(0, CLOCK.left()), s = Math.ceil(left - 1e-9), tot = CLOCK._t + (CLOCK._add || 0);
    el.innerHTML = SGUI.ring(left / tot, s); el.setAttribute('aria-label', s + ' seconds left'); } catch (e) {} }
  function timeUp() { if (!R || R.step !== 'item' || R.ui.after || resolved(R.i) || R.hold) return; if (CLOCK) CLOCK._i = -1; CLOCK = null;
    const x = it(); if (typing(x) && R.ui.typed) { submit(); return; } attempt(false, ''); }

  /* ------------------------------------------------------------------ playing an item */
  function mountKeys() { const host = R.el.querySelector('[data-cc-keys]'); if (!host || !W.SGUI || !SGUI.keys) return;
    KEYS = SGUI.keys(host, { touch: true, physical: false, onKey: ch => typeKey(ch), onBack: () => typeKey('⌫'), onEnter: () => submit() }); }
  function typeKey(ch) { if (!R || R.hold || !typing(it())) return;
    if (ch === '⌫') R.ui.typed = R.ui.typed.slice(0, -1); else if (/^[a-z]$/.test(ch) && R.ui.typed.length < 24) R.ui.typed += ch;
    const t = R.el.querySelector('[data-cc-typed]'); if (t) t.outerHTML = typedHTML(); else paint();
    const f = R.el.querySelector('[data-cc-typed]'); if (f && !coarse()) { try { f.focus({ preventScroll: true }); } catch (e) {} } }
  function submit() { if (!R || R.hold || R.step !== 'item') return; const x = it(); if (!typing(x)) return;
    const t = key(R.ui.typed); if (!t) { const n = R.el.querySelector('.cc-ask'); if (n) n.textContent = 'Type the word first, then Enter.'; return; }
    attempt(x.ans.some(a => key(a) === t), t); }
  function pick(i) { if (!R || R.hold || R.step !== 'item') return; const x = it(); if (!x || !x.opts || R.ui.after || resolved(R.i)) return;
    const o = x.opts[+i]; if (o == null) return; R.ui.picked = +i; attempt(x.ans.indexOf(o) >= 0, o); }
  function tok(j) { if (!R || R.hold || R.step !== 'item') return; const x = it(); if (!x || x.k !== 'stmt' || R.ui.phase === 'type' || R.ui.after || resolved(R.i)) return;
    const ts = stmtToks(x); const t = ts[+j]; if (!t) return;
    if (!x.ok && key(t.t) === key(x.word)) { R.ui.tap = +j; R.ui.phase = 'type'; R.ui.typed = ''; paint(); return; }
    attempt(false, t.t); }
  function fine() { if (!R || R.hold || R.step !== 'item') return; const x = it(); if (!x || x.k !== 'stmt' || R.ui.phase === 'type' || R.ui.after || resolved(R.i)) return;
    attempt(!!x.ok, 'All spelled right'); }
  /* one answer: right resolves; a miss holds (the answer shown only on the third) */
  function attempt(ok, given) {
    const x = it(), first = R.ui.first == null;
    if (first) { R.ui.first = ok && !R.ui.misses && !R.ui.told; triedMark(); }
    const typed = TYPED[x.k] || (x.k === 'stmt' && !x.ok);
    if (typed && first) { try { const rec = Object.assign({ w: x.ans[0] }, recOf(x)); if (typeof logBand === 'function') logBand(rec, ok); } catch (e) {} }
    if (ok) {
      if (typed && R.ui.first) { try { if (typeof markMastered === 'function') markMastered(key(x.ans[0])); if (typeof clearMiss === 'function') clearMiss(x.ans[0]); } catch (e) {} }
      try { if (W.SGUI && SGUI.ding) SGUI.ding('lore', true); } catch (e) {}
      resolve(R.ui.first ? 1 : 2); return;
    }
    try { if (W.SGUI && SGUI.ding) SGUI.ding('lore', false); } catch (e) {}
    if (typed && !R.ui.misses) { try { if (typeof addMiss === 'function') addMiss(Object.assign({ w: x.ans[0] }, recOf(x))); } catch (e) {} }
    R.ui.misses++;
    if (R.ui.misses >= 3) { showAnswer(x, given); return; }
    holdCard(x, given, escalate());
  }
  /* misses one and two: a card that holds, never with the answer, opening the next rival's hint */
  function holdCard(x, given, nx) {
    R.hold = true; holdClock(true);
    paint(); holdClock(true);
    const st = R.el.querySelector('.sb-stage') || R.host;
    const D = DATA(); const h = nx ? hintsOf(x).find(o => o.rv === nx.rv) : null;
    const tried = given && given !== 'All spelled right' && typing(x) ? '<div class="cc-tried">' + E(String(given)) + '</div>' : '';
    const w = document.createElement('div'); w.className = 'sg-misswrap cc-hold';
    w.innerHTML = '<div class="sg-misscard sb-miss" role="dialog" aria-modal="true" aria-labelledby="cc-hold-h"><div class="sg-miss-h" id="cc-hold-h" data-live-prompt>Not yet. Have another go.</div>' + tried +
      (h ? '<div class="sg-mwhy" data-rival="' + h.rv + '"><span class="sg-mwhy-ic">' + face(h.rv, 22) + '</span><span><b>' + E(castName(h.rv)) + '</b> — ' + E(h.h.t || 'Says it twice, slowly.') + '</span></div>' : '') +
      '<div class="cc-tries">' + (3 - R.ui.misses) + (3 - R.ui.misses === 1 ? ' more try before the answer is shown.' : ' more tries before the answer is shown.') + '</div>' +
      '<button type="button" class="sg-rbtn go sg-miss-go" data-cc="holdgo">Continue <span class="sg-kbd" aria-hidden="true">Enter</span></button></div>';
    st.appendChild(w); R.holdAt = performance.now();
    const b = w.querySelector('[data-cc="holdgo"]'); try { b.focus({ preventScroll: true }); } catch (e) {}
    live(); void D;
  }
  function holdGo() { if (!R || !R.hold) return; if (performance.now() - (R.holdAt || 0) < 250) return;
    R.hold = false; const w = R.el.querySelector('.cc-hold'); if (w) w.remove();
    R.ui.typed = ''; R.ui.picked = -1; if (it() && it().k === 'stmt' && R.ui.phase === 'type' && !it().ok) R.ui.phase = 'type';
    paint(); }
  /* the third miss: the app's own miss card, the answer shown, held until Continue */
  function showAnswer(x, given) {
    R.hold = true; holdClock(true); paint(); holdClock(true);
    const host = R.el.querySelector('.cc-item') || R.host;
    const then = () => { if (!R) return; R.answerUp = false; R.hold = false; resolve(3); };
    try {
      if (W.SGUI && SGUI.miss && (TYPED[x.k] || (x.k === 'stmt' && !x.ok))) {
        const rec = Object.assign({}, recOf(x), { w: x.ans[0] }); if (x.k === 'spell') rec.o = 'Greek';   /* Case 2 shows the authored Greek, never the library's o */
        R.answerUp = true; SGUI.miss(host, rec, x.k === 'stmt' && R.ui.phase !== 'type' ? x.word : String(given || ''), { onContinue: then }); live(); return; }
      if (W.SGUI && SGUI.missQ) {
        const q = x.k === 'stmt' ? x.said : x.shown, a = x.k === 'stmt' ? 'All spelled right' : x.ans[0];
        const f = x.k === 'part' ? x.lang + ': ' + x.from : '';
        R.answerUp = true; SGUI.missQ(host, { q, a, f }, String(given || ''), { onContinue: then }); live(); return; }
    } catch (e) {}
    then();
  }
  /* an item once tried (or told by a hint) is never a first try again — leaving and coming back does not reset it */
  function triedMark() { const tr = (R.st && R.st.tr) || {}; if (tr[R.i]) return; save1({ tr: Object.assign({}, tr, { [R.i]: 1 }) }); }
  function resolve(code) {
    const i = R.i, x = it(); const r = Object.assign({}, res()); r[i] = code;
    save1({ res: r });
    if (code === 1) pay(x);
    R.ui.after = true; R.hold = false;
    if (CLOCK) { try { CLOCK.stop(); } catch (e) {} CLOCK = null; }
    paint();
  }
  /* PAY: a typed first-try right pays at once; picks pay only above chance (Word Lore's rule) */
  function pay(x) {
    if (!isPick(x)) { coin(); return; }
    const its = R.k.puzzle.items, picks = its.map((y, i) => [y, i]).filter(([y]) => isPick(y));
    const gate = Math.max(3, Math.ceil(picks.length * 0.6)), right = picks.filter(([, i]) => res()[i] === 1).length;
    const owed = right >= gate ? right : 0; let pp = R.st.pp | 0;
    while (pp < owed) { pp++; coin(); }
    save1({ pp });
  }
  function coin() { let n = 0; try { n = addCoins('answer'); } catch (e) {} R.coins += n | 0;
    const el = R.el && R.el.querySelector('[data-cc-coins]'); if (el) el.textContent = String(R.coins); }
  function nextItem() {
    if (!R) return; const n = nItems();
    let j = -1; for (let q = 0; q < n; q++) if (!resolved(q)) { j = q; break; }
    R.ui = freshUI();
    if (j < 0) { go('accuse'); return; }
    R.i = j; if ((R.st.tr || {})[j]) R.ui.first = false;
    if (!(R.st.seen && R.st.seen.esc) && doneCount() >= Math.ceil(n / 2)) { go('esc'); return; }
    go('item');
  }
  function go(step) { if (!R) return; R.step = step; mark(step); paint(); }

  /* ------------------------------------------------------------------ the steps' buttons */
  function next() {
    if (!R || R.hold) return;
    const s = R.step;
    if (s === 'cold') { go('scene'); return; }
    if (s === 'scene') { const seen = (R.st.seen && R.st.seen.taps) || []; if (seen.filter(Boolean).length < 3) return; go('brief'); return; }
    if (s === 'brief') { nextItem(); return; }
    if (s === 'item') { if (R.ui.after || resolved(R.i)) nextItem(); else if (typing(it())) submit(); return; }
    if (s === 'esc') { save1({ seen: Object.assign({}, R.st.seen || {}, { esc: 1 }) }); go('item'); return; }
    if (s === 'reveal') { if (R.rv < R.k.reveal.length) { R.rv++; paint(); } else go('chill'); return; }
  }
  function look(i) { if (!R || R.step !== 'scene') return; i = +i; if (!(i >= 0 && i < 3)) return;
    const seen = ((R.st.seen && R.st.seen.taps) || [0, 0, 0]).slice(); seen[i] = 1;
    save1({ seen: Object.assign({}, R.st.seen || {}, { taps: seen }) }); paint(); }   /* focus: the next unlooked thing, then the way on */
  function accuse(i) { if (!R || R.step !== 'accuse') return; i = +i; const A = R.k.accusation;
    if (R.wrong.indexOf(i) >= 0 || !(i >= 0 && i < A.choices.length)) return;
    if (i === A.right) {
      if (R.st.state !== 'solved') save1({ state: 'solved', solvedAt: Date.now(), sticker: 'team', acc: R.wrong.slice() });
      R.rv = 0; go('reveal'); return; }
    R.wrong.push(i); paint();
    try { const g = R.el.querySelector('.cc-glow'); if (g && g.scrollIntoView) g.scrollIntoView({ block: 'nearest' }); } catch (e) {} }
  function done() { if (!R) return; save1({ dismissed: true }); close('done'); }
  function hint(rv) {
    if (!R || R.hold || R.step !== 'item') return; const x = it(); if (!x || R.ui.after || resolved(R.i)) return;
    const o = hintsOf(x).find(z => z.rv === rv); if (!o) return;
    const kind = DATA().kinds[rv];
    if (R.ui.open.indexOf(rv) < 0) R.ui.open.push(rv);
    save1({ hints: (R.st.hints | 0) + 1 });
    if (o.h.told) { R.ui.told = true; triedMark(); }
    if (kind === 'twice') { say1(o.h.say, 0.6); setTimeout(() => { if (R && it() === x) say1(o.h.say, 0.6); }, 1700); }
    if (kind === 'breathe' && !R.ui.addSecs) { R.ui.addSecs = o.h.secs; try { if (CLOCK && CLOCK.add) { CLOCK.add(o.h.secs); CLOCK._add = (CLOCK._add || 0) + o.h.secs; } } catch (e) {} }
    paint();
  }

  /* ------------------------------------------------------------------ input: one handler for taps and clicks… */
  function onClick(e) {
    const b = e.target.closest('[data-cc]'); if (!b || !R || !R.el.contains(b) || b.disabled) return;
    const a = b.getAttribute('data-cc'), arg = b.getAttribute('data-arg');
    if (a === 'back') { close('back'); return; }
    if (a === 'holdgo') { R.holdAt = 0; holdGo(); return; }
    if (R.hold) return;
    if (a === 'read') { const t = SAYS[+b.getAttribute('data-say-i')]; if (t) say1(t, 0.95); return; }
    if (a === 'next') next(); else if (a === 'look') look(arg); else if (a === 'pick') pick(arg); else if (a === 'tok') tok(arg);
    else if (a === 'fine') fine(); else if (a === 'check') submit(); else if (a === 'clear') { R.ui.typed = ''; paint(); }
    else if (a === 'hint') hint(arg); else if (a === 'accuse') accuse(arg); else if (a === 'done') done();
  }
  /* …and one for the keyboard. While the case is up the screen under it never sees a key (Tab moves inside it: the
     overlay is a [data-trap] layer). The shared miss card owns the keys while it is up. */
  function onKey(e) {
    if (!R || !R.el || !R.el.isConnected) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (W.SGUI && SGUI.held) return;
    const k = e.key; if (k === 'Tab') return;
    e.stopImmediatePropagation();
    const t = e.target, onBtn = !!(t && t.closest && t.closest('button') && R.el.contains(t));
    if (k === 'Escape') { e.preventDefault(); if (R.hold) { R.holdAt = 0; holdGo(); } else close('back'); return; }
    if (R.hold) { if (k === 'Enter' || k === ' ') { if (onBtn) return; e.preventDefault(); if (!e.repeat) holdGo(); } else if (k.length === 1) e.preventDefault(); return; }
    if ((k === 'Enter' || k === ' ') && onBtn && !(t.matches && t.matches('[data-cc-typed]'))) return;   // a focused control presses itself
    const x = R.step === 'item' ? it() : null;
    if (x && typing(x)) {
      if (/^[a-z]$/i.test(k)) { e.preventDefault(); typeKey(k.toLowerCase()); return; }
      if (k === 'Backspace') { e.preventDefault(); typeKey('⌫'); return; }
      if (k === 'Enter') { e.preventDefault(); if (!e.repeat) submit(); return; }
      return;
    }
    if (/^[0-9]$/.test(k)) {
      const n = +k;
      if (R.step === 'scene' && n >= 1 && n <= 3) { e.preventDefault(); look(n - 1); return; }
      if (R.step === 'accuse' && n >= 1 && n <= 3) { e.preventDefault(); accuse(n - 1); return; }
      if (x && !R.ui.after && !resolved(R.i)) {
        if (x.opts && n >= 1) { e.preventDefault(); pick(n - 1); return; }
        if (x.k === 'stmt') { e.preventDefault(); if (n === 0) fine(); else tok(n - 1); return; }
      }
      return;
    }
    if (k === 'Enter') { e.preventDefault(); if (e.repeat) return;
      if (R.step === 'chill') { done(); return; }
      next(); return; }
  }

  /* ------------------------------------------------------------------ the look (lazy: this file's own sheet) */
  const CSS = `
.cc-pin{position:absolute;z-index:4;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:1px;min-width:48px;min-height:58px;padding:2px 3px 3px;border:0;border-radius:12px;background:rgba(255,248,232,.92);box-shadow:0 4px 14px rgba(40,6,6,.45),0 0 0 2px #B0161F;cursor:pointer}
.cc-pin.cc-unplaced{visibility:hidden}
.cc-pin:focus-visible{outline:3px solid #fff;outline-offset:2px}
.cc-pin-tag{font:800 9.5px/1 var(--display,system-ui);letter-spacing:.08em;color:#fff;background:#9B1219;border-radius:4px;padding:2px 4px}
.cc-pin .cc-seal{animation:cc-throb 2.4s ease-in-out infinite}
@keyframes cc-throb{50%{transform:scale(1.07)}}
.cc-play .cc-top{gap:10px}
.cc-back{display:inline-flex;align-items:center;gap:6px;min-height:44px}
.cc-urgent{margin-left:auto;flex-shrink:0;font:800 11px/1 var(--display,system-ui);letter-spacing:.1em;color:#fff;background:#9B1219;border-radius:6px;padding:5px 8px}
.sb-stage.cc-stage{background:linear-gradient(180deg,rgba(14,10,34,.50),rgba(14,10,34,.80)),var(--sg-plate-d,none) center/cover no-repeat,#1B1630}
:root[data-mode="dusk"] .sb-stage.cc-stage{background:linear-gradient(180deg,rgba(8,6,22,.58),rgba(8,6,22,.84)),var(--sg-plate-n,none) center/cover no-repeat,#130F24}
.cc-stage .sg-st-region{display:block;overflow:hidden}
.cc-scroll{height:100%;width:100%;max-width:880px;margin:0 auto;overflow:auto;overscroll-behavior:contain;display:flex;flex-direction:column;gap:10px;padding:4px 2px 8px;box-sizing:border-box}
.cc-stat{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 12px;border-radius:999px;background:color-mix(in srgb,var(--paper,#fff) 86%,transparent);color:var(--text);font:800 15px/1 var(--display,system-ui)}
.cc-ring .sg-ring{width:40px;height:40px}.cc-ring .sg-ring-n{font-size:14px}
.cc-chip{display:inline-block;max-width:100%;padding:8px 12px;border-radius:999px;background:color-mix(in srgb,var(--paper,#fff) 86%,transparent);color:var(--text);font:800 13px/1.1 var(--display,system-ui);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cc-card{padding:14px 16px;color:var(--text);line-height:1.5;font-size:15.5px;position:relative}
.cc-card p{margin:0 0 6px}
.cc-panels{display:grid;grid-template-columns:1fr;gap:10px}
@media (min-width:760px){.cc-panels{grid-template-columns:1fr 1fr}}
.cc-panel{position:relative;margin:0;min-height:150px;border-radius:14px;overflow:hidden;background-size:220% auto;background-position:22% 30%;box-shadow:0 8px 24px rgba(0,0,0,.4),inset 0 0 0 3px rgba(255,248,232,.85);display:flex;flex-direction:column;justify-content:flex-end;filter:saturate(.8)}
.cc-panel.p2{background-position:80% 72%;align-items:center}
.cc-panel::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,8,30,.25),rgba(10,8,30,.62));pointer-events:none}
.cc-panel>*{position:relative}
.cc-thing{margin:8px auto 0;filter:drop-shadow(0 3px 6px rgba(0,0,0,.6))}
.cc-cap{margin:8px;padding:9px 12px;border-radius:10px;background:color-mix(in srgb,var(--paper,#fff) 90%,transparent);color:var(--text);font-size:15px;line-height:1.45}
.cc-cap p{margin:0 0 5px}.cc-cap p:last-child{margin:0}
.cc-late{font-style:italic;color:var(--muted)}
.cc-safe{font-weight:700}
.cc-place{font:800 15px/1.3 var(--display,system-ui)}
.cc-clockrow{display:flex;align-items:center;gap:10px;margin:0 8px 8px;padding:8px 12px;border-radius:10px;background:color-mix(in srgb,var(--paper,#fff) 90%,transparent);color:var(--text);font-size:14.5px;line-height:1.4}
.cc-clockrow p{margin:0}
.cc-clock .cc-hand{transform-origin:20px 20px;animation:cc-tick 60s steps(60) infinite}
@keyframes cc-tick{to{transform:rotate(360deg)}}
.cc-fiction{margin:0;color:#EDE6FF;font-size:12px;text-align:center;opacity:.9}
.cc-readrow{display:flex;justify-content:center}
.cc-read{display:inline-grid;place-items:center;width:44px;height:44px;border-radius:12px;border:1px solid var(--line);background:color-mix(in srgb,var(--paper,#fff) 90%,transparent);color:var(--text);cursor:pointer;flex-shrink:0}
.cc-card .cc-read{float:right;margin:-4px -6px 4px 8px}
.cc-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;min-width:44px;padding:0 18px;border-radius:12px;border:1px solid var(--line);background:var(--paper,#fff);color:var(--text);font:800 15px/1.1 var(--display,system-ui);cursor:pointer}
.cc-btn.go{background:var(--action,var(--accent));color:var(--action-ink,#fff);border-color:transparent;min-width:200px}
.cc-btn[disabled]{opacity:.55;cursor:default}
.cc-row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.cc-ask{margin:6px 0;font-weight:800}
.sg-st-ctl .cc-ask{margin:0;padding:7px 14px;border-radius:999px;background:color-mix(in srgb,var(--paper,#fff) 92%,transparent);color:var(--text)}
.cc-taps{display:flex;flex-direction:column;gap:8px}
.cc-tap{display:flex;align-items:flex-start;gap:10px;width:100%;min-height:52px;padding:10px 12px;border-radius:12px;border:1.5px dashed var(--line);background:color-mix(in srgb,var(--paper,#fff) 94%,transparent);color:var(--text);text-align:left;font:600 14.5px/1.45 var(--sans,system-ui);cursor:pointer}
.cc-tap.on{border-style:solid;border-color:color-mix(in srgb,var(--accent) 45%,var(--line))}
.cc-tapn{flex:none;display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:var(--chip,#EEE);font:800 13px/1 var(--display,system-ui)}
.cc-tapt{flex:1;min-width:0}
.cc-tapic{flex:none;color:var(--muted)}
.cc-sus{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
.cc-su{display:flex;align-items:center;gap:9px;padding:8px 10px;color:var(--text);font-size:13.5px;line-height:1.35}
.cc-su b{display:block;font-family:var(--display,system-ui)}
.cc-su i{display:block;font-style:normal;color:var(--muted)}
.cc-face{flex:none;display:grid;place-items:center;width:34px;height:34px;border-radius:50%;overflow:hidden;background:var(--chip,#EEE)}
.cc-face img,.cc-face svg{width:100%;height:100%}
.cc-mono{font:800 15px/1 var(--display,system-ui);color:var(--text)}
.cc-note{margin:0 0 8px;padding:10px 12px;border-radius:8px;background:#FFF9EA;color:#2A2010;font:600 15px/1.5 var(--display,system-ui);transform:rotate(-.6deg);box-shadow:0 2px 6px rgba(0,0,0,.18)}
.cc-rule{color:var(--muted)}
.cc-lbl{display:flex;align-items:center;gap:7px;font:800 11.5px/1.2 var(--sans,system-ui);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.cc-lbl .cc-face{width:24px;height:24px}
.cc-big{font:800 clamp(26px,7vw,40px)/1.15 var(--display,system-ui);margin:4px 0;word-break:break-word}
.cc-printed{font-family:Georgia,'Times New Roman',serif;letter-spacing:.04em}
.cc-clue{font:700 17px/1.45 var(--display,system-ui);margin:4px 0}
.cc-said{margin:6px 0;font-size:16.5px;line-height:2.3}
.cc-tok{min-height:44px;min-width:44px;margin:0 1px;padding:0 6px;border-radius:9px;border:1px solid var(--line);background:color-mix(in srgb,var(--paper,#fff) 96%,transparent);color:var(--text);font:600 16px/1 var(--sans,system-ui);cursor:pointer}
.cc-tokx.bad{color:var(--bad);text-decoration:line-through 2px}
.cc-typed{display:flex;flex-wrap:wrap;align-items:center;gap:3px;min-height:48px;padding:6px 10px;margin:6px 0;border-radius:12px;border:2px solid color-mix(in srgb,var(--accent) 50%,var(--line));background:color-mix(in srgb,var(--paper,#fff) 96%,transparent);font:800 24px/1 var(--mono,ui-monospace,monospace);color:var(--text);outline:none}
.cc-typed:focus-visible{box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 40%,transparent)}
.cc-caret{width:2px;height:26px;background:var(--accent);animation:cc-blink 1s steps(2) infinite}
@keyframes cc-blink{50%{opacity:0}}
.cc-hints{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.cc-hint{display:inline-flex;align-items:center;gap:7px;min-height:44px;padding:0 12px 0 6px;border-radius:999px;border:1px solid var(--line);background:color-mix(in srgb,var(--paper,#fff) 92%,transparent);color:var(--text);font:800 13.5px/1 var(--display,system-ui);cursor:pointer}
.cc-hint .cc-face{width:30px;height:30px}
.cc-hint[disabled]{opacity:.5;cursor:default}
.cc-said-h{margin-top:7px;padding:8px 10px;border-radius:10px;background:var(--chip,#F3EEFF);font-size:14.5px;line-height:1.45}
.cc-plus{font-weight:800;color:var(--good)}
.cc-after{margin-top:8px;padding:10px 12px;border-radius:12px;font-size:15px;line-height:1.45}
.cc-after b{display:flex;align-items:center;gap:6px;font-family:var(--display,system-ui)}
.cc-after p{margin:4px 0 0}
.cc-after.ok{background:color-mix(in srgb,var(--good) 14%,transparent)}
.cc-after.shown{background:color-mix(in srgb,var(--treasure,#F0B429) 16%,transparent)}
.cc-opts{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;max-width:560px}
.cc-opt,.cc-choice{display:flex;align-items:center;gap:9px;min-height:48px;padding:8px 12px;border-radius:12px;border:1px solid var(--line);background:var(--paper,#fff);color:var(--text);font:700 15px/1.3 var(--sans,system-ui);text-align:left;cursor:pointer}
.cc-n{flex:none;display:grid;place-items:center;width:24px;height:24px;border-radius:7px;background:var(--chip,#EEE);font:800 12px/1 var(--display,system-ui)}
.cc-choices{display:flex;flex-direction:column;gap:8px;width:100%;max-width:640px}
.cc-choice.out{opacity:.5;text-decoration:line-through;cursor:default}
.cc-fine{min-width:220px}
.cc-list{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px}
.cc-li{padding:5px 4px;border-radius:7px;background:color-mix(in srgb,var(--paper,#fff) 88%,transparent);color:var(--text);font:600 13px/1.2 Georgia,serif;text-align:center;overflow:hidden;text-overflow:ellipsis}
.cc-li.cur{box-shadow:0 0 0 2px var(--accent)}.cc-li.done{color:var(--good);font-weight:800}
.cc-acro{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px}
.cc-ac{display:flex;flex-direction:column;align-items:center;padding:4px;border-radius:8px;background:color-mix(in srgb,var(--paper,#fff) 88%,transparent);color:var(--text)}
.cc-ac b{font:800 20px/1.1 var(--display,system-ui);min-height:22px}.cc-ac i{font-style:normal;font-size:11.5px;color:var(--muted);text-align:center}
.cc-parts{display:flex;flex-wrap:wrap;justify-content:center;gap:4px}
.cc-pt{display:flex;flex-direction:column;align-items:center;padding:5px 9px;border-radius:8px;background:color-mix(in srgb,var(--paper,#fff) 88%,transparent);color:var(--text)}
.cc-pt b{font:800 17px/1.1 var(--display,system-ui)}.cc-pt i{font-style:normal;font-size:12px;color:var(--muted)}
.cc-stmts{display:flex;flex-direction:column;gap:4px}
.cc-sm{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;padding:4px 8px;border-radius:8px;background:color-mix(in srgb,var(--paper,#fff) 88%,transparent);color:var(--text);font-size:12.5px}
.cc-sm.untrue{color:var(--bad)}.cc-sm.true{color:var(--good)}.cc-sm i{font-style:normal;color:var(--text)}
.cc-trail{display:flex;gap:6px;justify-content:center;padding:4px}
.cc-dot{width:12px;height:12px;border-radius:50%;background:rgba(255,248,232,.35);border:2px solid rgba(255,248,232,.7)}
.cc-dot.done{background:#F0B429}.cc-dot.cur{box-shadow:0 0 0 3px rgba(255,248,232,.55)}
.cc-board{display:flex;flex-direction:column;gap:8px}
.cc-clue{padding:10px 12px;color:var(--text);font-size:14px;line-height:1.45}
.cc-false{font-style:italic}
.cc-glow{box-shadow:0 0 0 3px #F0B429,0 0 18px 4px rgba(240,180,41,.75)!important;animation:cc-glow 1.6s ease-in-out infinite}
@keyframes cc-glow{50%{box-shadow:0 0 0 3px #F0B429,0 0 8px 1px rgba(240,180,41,.4)}}
.cc-big-line{font:700 17px/1.5 var(--display,system-ui)}
.cc-rv{opacity:.72;font-size:14.5px}.cc-rv.now{opacity:1;font:700 16.5px/1.5 var(--display,system-ui)}
.cc-secrets{display:grid;grid-template-columns:1fr;gap:8px}
.cc-vhand{display:inline-block;transform:skewX(12deg);font-family:'Segoe Print','Bradley Hand',cursive;color:#3B2F8F}
:root[data-mode="dusk"] .cc-vhand{color:#C9C0FF}
.cc-photo{align-self:center;display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 12px 8px;background:#FFFDF6;border-radius:6px;box-shadow:0 8px 22px rgba(0,0,0,.45);transform:rotate(-2deg)}
.cc-photo-in{display:flex;gap:2px;padding:8px;background:linear-gradient(180deg,#3B4C78,#22304F);border-radius:3px}
.cc-photo-cap{display:inline-flex;align-items:center;gap:5px;font:800 12px/1 var(--display,system-ui);color:#2A2010}
.cc-tried{margin:2px 0 6px;font:800 20px/1.2 var(--mono,ui-monospace,monospace);color:var(--bad);text-decoration:line-through}
.cc-tries{margin-top:10px;color:var(--muted);font-size:13.5px}
.cc-keys{width:100%}
@media (prefers-reduced-motion:reduce){.cc-pin .cc-seal,.cc-clock .cc-hand,.cc-glow,.cc-caret{animation:none!important}}
:root[data-motion="off"] .cc-pin .cc-seal,:root[data-motion="off"] .cc-clock .cc-hand,:root[data-motion="off"] .cc-glow,:root[data-motion="off"] .cc-caret{animation:none!important}
@container sgstage (max-width:640px){.cc-btn.go{min-width:min(100%,260px)}.cc-opts{grid-template-columns:1fr 1fr}.cc-card{padding:12px 13px;font-size:15px}}
`;
  try { if (!document.getElementById('cc-css')) { const s = document.createElement('style'); s.id = 'cc-css'; s.textContent = CSS; document.head.appendChild(s); } } catch (e) {}

  /* the opener is an app action, so a pin is a data-act like every other control on a board (keyboard: it is a button) */
  try { if (typeof app === 'object' && app) Object.assign(app, { caseOpen: id => { open(id); } }); } catch (e) {}

  function peek() {
    if (!R) return null; const x = it();
    return { id: R.id, step: R.step, i: R.i, n: nItems(), late: R.late, hold: !!R.hold, held: !!(W.SGUI && SGUI.held), after: !!R.ui.after, misses: R.ui.misses, phase: R.ui.phase,
      kind: x ? x.k : null, ans: x ? x.ans.slice() : null, opts: x && x.opts ? x.opts.slice() : null, ok: x ? !!x.ok : null, word: x ? (x.word || null) : null,
      toks: x && x.k === 'stmt' ? stmtToks(x).map(t => t.t) : null, typed: R.ui.typed, coins: R.coins, wrong: R.wrong.slice(), rv: R.rv, log: R.log.slice(),
      right: R.k.accusation.right, choices: R.k.accusation.choices.length, res: Object.assign({}, res()), glow: R.k.glow.slice(), secs: CLOCK ? CLOCK.left() : null };
  }
  W.SB_CIRCUIT_CASES = { pins, place, open, close: () => close('back'), drop: () => close('pop'), peek, cases: () => CASES().map(k => ({ id: k.id, act: k.act, trig: k.trig, next: k.next, title: k.title })) };
})();
