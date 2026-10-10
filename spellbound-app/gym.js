/* gym.js — THE SPELLING GYM (games spec §4.2 + §4.2.1, 4 Oct 2026).

   ONE hub card on the Play tab replaces Beat the Buzzer, Magic Squares and Word Quiz's spelling
   rounds. The hub's name is the owner's to choose, so it is read from window.SB_HUB_NAMES.gym and
   never typed here (the default name is only the fallback). The Practice tab is the WORD Gym — a
   different thing; nothing here renames it.

   Seven modes, in a FIXED order (simplest first, never reordered by play):
     Warm-up · Sprint · Champ Dictation · Spot the Error · Squares · Word Doctor · Level Challenge

   The rules every mode keeps (§4.2 "Across all modes"):
     · words come through nextWords (purpose 'drill'; Word Doctor 'review') — the guarded fallback is
       the old gameWordsD + pickFresh, filtered kid-safe;
     · the library a mode needs is LOADED BEFORE ANY CLOCK STARTS (a timed mode waits on its ready
       card with Start disabled; the old loading modal sat over a running clock);
     · an empty Enter is never an answer;
     · a held miss (SGUI.miss, or the app's own miss panel) PAUSES every clock until Continue;
     · adaptive within a round: 3 right in a row → the next word from tier +1, 2 misses → tier −1,
       and a small chip says which level the words are coming from;
     · one clock: real time at a fixed step (sgLoop, or the same shape here), and the timer PATCHES
       textContent in place — the view is never re-rendered each second (phone keyboard focus);
     · every mode runs inside the stage (SGUI.stage, or a tiny token-gradient fallback) on the gym
       plate — no white form card;
     · the level per mode is SB_LEVEL('gym/<mode>'), and SB_LEVEL.after runs once at round end;
     · pay per §6: payG per right (Champ Dictation: at most 20 a round), Squares pays addCoins('stop')
       per claimed square and NOTHING per answer, the Level Challenge pays addCoins('contest') only at
       its 80% pass. Nothing is paid for finishing, and no Math.random() decides anything paid.

   The module keeps its own DOM (EL) and re-attaches it into the shell's #gym-host after every app
   render, so a toast, a lazy file landing or a coin never wipes a half-typed word.
   Guards: tests/spelling-gym.cjs (T1 T2 T3 T9 T11 T13 T14 T15, Word Doctor's later-day discharge)
   and tests/gym-clock.cjs (T4: Sprint at 4x CPU throttle takes a real 60 s). */
(function () {
  'use strict';
  const W = window;

  /* ------------------------------------------------------------------ the modes */
  const MODES = [
    { id: 'warmup', title: 'Warm-up', icon: 'flame', promise: 'Ten words. No clock. Hints on hand.', n: 10, hints: true, adapt: true },
    { id: 'sprint', title: 'Sprint', icon: 'timer', promise: 'Sixty seconds. Spell all you can.', clock: 60, adapt: true },
    { id: 'dictation', title: 'Champ Dictation', icon: 'bolt', promise: 'Ninety seconds of the hardest words.', clock: 90, cap: 20, adapt: true, adv: true },
    { id: 'spot', title: 'Spot the Error', icon: 'search', promise: 'Find the misspelt word, then fix it.', n: 10, adapt: true },
    { id: 'squares', title: 'Squares', icon: 'grid', promise: 'Spell 4 of 5 to claim a square.' },
    { id: 'doctor', title: 'Word Doctor', icon: 'heart', promise: 'Your missed words: diagnose, then cure.' },
    { id: 'challenge', title: 'Level Challenge', icon: 'trophy', promise: '8 of 10 at the next level moves you up.', n: 10 }
  ];
  const BY = {}; MODES.forEach(m => { BY[m.id] = m; });
  /* the names the Play card shows for a best ("Best 9/10 · Warm-up") live in app3 (SB_HUB_MODES.gym), so
     the card can name a mode before this file has loaded; the hub reads the same table */
  try { const T = (W.SB_HUB_MODES || {}).gym || {}; MODES.forEach(m => { if (T[m.id]) m.title = T[m.id]; }); } catch (e) {}
  const LV = ['easy', 'medium', 'hard', 'champ'];
  const LV_NAME = { auto: 'Auto', easy: 'Easy', medium: 'Medium', hard: 'Hard', champ: 'Champ' };
  const hubName = () => { let n = ''; try { n = W.SB_HUB_NAMES && W.SB_HUB_NAMES.gym; } catch (e) {} return n || 'Spelling Gym'; };

  /* ------------------------------------------------------------------ small helpers */
  const E = s => (typeof esc === 'function' ? esc(s) : String(s == null ? '' : s));
  const EA = s => (typeof escA === 'function' ? escA(s) : E(s).replace(/"/g, '&quot;'));
  const ic = (n, s) => { try { return iconSVG(n, s || 18); } catch (e) { return ''; } };
  const K = w => String((w && w.w) || w || '').toLowerCase().trim();
  const kid = () => { try { return active(); } catch (e) { return null; } };
  const persist = () => { try { save(); } catch (e) {} };
  const touch = () => { try { return W.matchMedia('(pointer:coarse)').matches; } catch (e) { return false; } };
  const today = () => { try { return mastDay(); } catch (e) { const d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000); } };
  /* the gym's own corner of the child's record: bests, the last mode, which modes were ever played,
     the Word Doctor's ward, the typed form of a miss, and (fallback only) the per-mode level */
  function gs() { const c = kid() || {}; const g = c.gym || (c.gym = {});
    g.best = g.best || {}; g.seen = g.seen || {}; g.lv = g.lv || {}; g.typo = g.typo || {}; return g; }
  /* presentation-only randomness, seeded (never a reward, a grade or a word's fate) */
  function hash(s) { let h = 2166136261 >>> 0; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
  function rng(seed) { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  function shuffled(a, seed) { const r = rng(seed), o = a.slice(); for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = o[i]; o[i] = o[j]; o[j] = t; } return o; }
  const say1 = (w, rate) => { try { say(w, rate); } catch (e) {} };
  const live = t => { try { if (W.SB_LIVE && SB_LIVE.say) SB_LIVE.say([t]); } catch (e) {} };
  const sound = k => { try { sfx(k); } catch (e) {} };

  /* ------------------------------------------------------------------ levels (SB_LEVEL contract) */
  function lvResolve(l) { if (LV.indexOf(l) >= 0) return l;
    let band = 4; try { band = beeBand(kid()).band; } catch (e) {}
    return band <= 3 ? 'easy' : band <= 6 ? 'medium' : band <= 8 ? 'hard' : 'champ'; }
  const shiftLv = (l, t) => LV[Math.max(0, Math.min(LV.length - 1, LV.indexOf(lvResolve(l)) + (t | 0)))];
  /* the tiny local stand-in until g-found's SB_LEVEL is merged: the owner's rule, nothing more —
     50% or more keeps the level, under 50% drops one (floor Easy), a hand-set level sticks */
  const FB = {
    get(k) { const r = gs().lv[k]; return (r && r.level) || 'auto'; },
    set(k, l) { const L = gs().lv; L[k] = { level: l, history: (L[k] && L[k].history) || [] }; persist(); },
    after(k, pct) { const L = gs().lv; const r = L[k] || (L[k] = { level: 'auto', history: [] });
      r.history = (r.history || []).concat([pct]).slice(-10); let dropped = false;
      if (pct < 50) { const i = LV.indexOf(lvResolve(r.level)); if (i > 0) { r.level = LV[i - 1]; dropped = true; } else r.level = 'easy'; }
      const h = r.history; persist();
      return { level: r.level, dropped, offerUp: h.length >= 2 && h[h.length - 1] >= 80 && h[h.length - 2] >= 80 }; },
    chip(k, label) { const l = FB.get(k);
      return '<button class="gym-lvl" data-g="lvl" data-arg="' + EA(k) + '" aria-label="' + EA('Level for ' + (label || k) + ': ' + LV_NAME[l] + '. Tap to change') + '">' + LV_NAME[l] + ' ▾</button>'; }
  };
  const LVL = () => (W.SB_LEVEL && typeof W.SB_LEVEL.get === 'function') ? W.SB_LEVEL : FB;
  const lvKey = m => 'gym/' + m;
  const lvGet = m => { try { return LVL().get(lvKey(m)) || 'auto'; } catch (e) { return 'auto'; } };
  const lvChip = m => { try { return LVL().chip ? LVL().chip(lvKey(m), BY[m].title) : ''; } catch (e) { return ''; } };

  /* ------------------------------------------------------------------ words */
  function kidSafeW(w) { try { if (typeof W.kidSafe === 'function') return !!W.kidSafe(w); } catch (e) {}
    try { return typeof safeWord !== 'function' || safeWord(w); } catch (e) { return true; } }
  const typable = w => !!(w && w.w && /^[a-z]+$/i.test(w.w) && w.w.length >= 3 && kidSafeW(w));
  /* n words at a level and tier, through the one door (nextWords). The level is handed over the
     way every game hands it today — c.gameDiff for the duration of the draw — and put back. */
  function draw(n, o) { o = o || {}; const c = kid(); if (!c) return []; const keep = c.gameDiff; let out = [];
    try {
      c.gameDiff = lvResolve(o.level);
      if (typeof W.nextWords === 'function') {
        try { out = W.nextWords(c, Math.max(n * 3, 6), { purpose: o.purpose || 'drill', tier: o.tier || 0, minLen: 3 }) || []; } catch (e) { out = []; } }
      if (!out.length && typeof gameWordsD === 'function') {
        c.gameDiff = shiftLv(o.level, o.tier); out = pickFresh(gameWordsD(o.needSent ? { needSent: true } : {}), Math.max(n * 4, 12)); }
    } finally { c.gameDiff = keep; }
    out = out.filter(typable).filter(w => !o.need || o.need(w)).filter(w => !(o.skip && o.skip.has(K(w))));
    out = out.slice(0, n); out.forEach(w => { try { logGameWord(K(w)); } catch (e) {} });
    return out; }
  /* Champ Dictation is Rapid Dictation's hard list: the 130k library ranked trickiest-first
     (advanced.js hardPool, read through ADV.pool()). The level picks a window of that ranking
     (Champ is its top 2,000) and the tier moves it one step. */
  const CHAMP_WIN = { champ: [0, 2000], hard: [0, 6000], medium: [3000, 9000], easy: [6000, 12000] };
  function champDraw(level, tier, skip) { let P = []; try { if (W.ADV && typeof ADV.pool === 'function') P = ADV.pool() || []; } catch (e) {}
    if (!P.length) return draw(1, { level: 'champ', tier, skip });
    const [lo, hi] = CHAMP_WIN[shiftLv(level, tier)];
    let slice = P.slice(lo, hi).filter(w => typable(w) && !skip.has(K(w)));
    /* the word bands (the 4.5 brief, P1.2): the hard list keeps only the words inside this child's window for the
       level — a dictionary-tail word is band 4, so on Easy (band 1) nothing passes and the word comes through the
       door below, never from the championship list */
    try { if (W.SB_BAND && typeof SB_BAND.pick === 'function') slice = SB_BAND.pick(kid(), slice, 0, { level: lvResolve(level), tier: tier }) || []; } catch (e) {}
    if (!slice.length) return draw(1, { level: level, tier, skip });
    const pick = (typeof pickFresh === 'function' ? pickFresh(slice, 1) : slice.slice(0, 1));
    pick.forEach(w => { try { logGameWord(K(w)); } catch (e) {} }); return pick; }

  /* ------------------------------------------------------------------ loading BEFORE the clock */
  function libReady(mode) {
    if (mode === 'dictation') { let st = ''; try { st = _fullState; } catch (e) {} return st === 'loaded'; }   // the library's own loader state
    return true; }
  function loadLib(mode, cb) {
    let n = 2; const one = () => { if (--n === 0) cb(); };
    try { if (typeof lazyNeed === 'function') lazyNeed(mode === 'spot' || mode === 'warmup' ? ['arcade', 'sents', 'lore'] : ['arcade', 'sents'], one); else one(); } catch (e) { one(); }
    if (mode !== 'dictation' || libReady('dictation')) { one(); return; }
    /* loadFullLibrary returns early (without its callback) while a load is already running, so
       the door watches the library itself rather than trusting one callback */
    try { if (typeof loadFullLibrary === 'function') loadFullLibrary(() => {}); } catch (e) {}
    let tries = 0; const t = setInterval(() => { tries++;
      let st = ''; try { st = _fullState; } catch (e) {}
      if (libReady('dictation') || st === 'error' || tries > 1200) { clearInterval(t); one(); } }, 100); }

  /* ------------------------------------------------------------------ the clock */
  /* REAL TIME, held by a miss card, a hidden tab or the Settings sheet. The seconds left are read off
     performance.now() — never summed from clamped frame steps — so a long frame (a word drawn from the
     library, a phone at 4x slower) costs the child nothing: a 60-second round is 60 real seconds.
     The frames only paint it (sgLoop when the engine kit is in, a plain rAF otherwise). One gap over a
     second is a suspended device, not play, and counts as one second at most. */
  function clock(secs, onTick, onEnd) {
    if (W.SGUI && typeof SGUI.clock === 'function') {
      const el = document.createElement('span'); el.id = 'gym-clock'; el.className = 'sg-st-n'; el.textContent = String(Math.ceil(secs));
      const C = { total: secs, el, held: false, over: false, t0: performance.now(), t1: 0 };
      const k = SGUI.clock(secs, { el, onTick: () => { try { onTick(C); } catch (e) {} }, onEnd: () => { C.over = true; C.t1 = performance.now(); onEnd(); } });
      Object.defineProperty(C, 'left', { get: () => k.left() });
      C.hold = v => { C.held = !!v; k.hold(!!v); }; C.stop = () => { C.over = true; k.stop(); }; C.add = x => k.add(x);
      return C; }
    const C = { left: secs, total: secs, held: false, over: false, used: 0, last: performance.now(), t0: performance.now(), t1: 0 };
    const paused = () => { if (C.held || document.hidden) return true; try { return !!(state.settingsOpen || state.pinDlg); } catch (e) { return false; } };
    const tick = () => { if (C.over) return; const now = performance.now(); const d = Math.min(1000, now - C.last); C.last = now;
      if (!paused()) C.used += d;
      C.left = Math.max(0, secs - C.used / 1000);
      try { onTick(C); } catch (e) {}
      if (C.left <= 0) { C.over = true; C.t1 = now; stopLoop(); setTimeout(onEnd, 0); } };
    const vis = () => { C.last = performance.now(); }; document.addEventListener('visibilitychange', vis);
    let stopLoop;
    if (typeof W.sgLoop === 'function') { const L = W.sgLoop(() => {}, tick); stopLoop = () => { try { L.stop(); } catch (e) {} }; }
    else { let raf = 0; const f = () => { raf = requestAnimationFrame(f); tick(); }; raf = requestAnimationFrame(f); stopLoop = () => cancelAnimationFrame(raf); }
    /* a backstop for a page with no frames at all (a background tab that is somehow still "visible") */
    const iv = setInterval(tick, 250);
    const stop0 = stopLoop; stopLoop = () => { stop0(); clearInterval(iv); document.removeEventListener('visibilitychange', vis); };
    C.hold = v => { tick(); C.held = !!v; C.last = performance.now(); };
    C.stop = () => { C.over = true; stopLoop(); };
    return C; }

  /* ------------------------------------------------------------------ the round */
  let R = null;        // the live round (null on the hub)
  let EL = null;       // the gym's own DOM, re-attached into #gym-host after every app render
  let KEYS = null;     // the on-screen keyboard handle
  let VIEW = 'hub';    // hub | ready | play | done | board | ward | locked
  let lastH = null;    // the last picture painted into EL (anything written around paint() clears it)

  function stop() { try { if (R && R.clock) R.clock.stop(); } catch (e) {} if (KEYS) { try { KEYS.destroy(); } catch (e) {} KEYS = null; }
    if (R) R.phase = 'gone'; R = null; }

  function newRound(mode) { const m = BY[mode];
    return { mode, m, key: lvKey(mode), level: lvResolve(lvGet(mode)), tier: 0, streak: 0, misses: 0, asked: 0, right: 0, paid: 0,
      log: [], seen: new Set(), cur: null, phase: 'answer', hint: 0, e0: (typeof earnedSoFar === 'function' ? earnedSoFar() : 0), bonus: 0, t0: Date.now() }; }

  function open(mode) {
    stop(); mode = BY[mode] ? mode : null;
    try { state.game = null; } catch (e) {}
    state.gymMode = mode;
    if (!mode) VIEW = 'hub';
    else if (BY[mode].adv && !advOn()) VIEW = 'locked';
    else if (mode === 'squares') { VIEW = 'board'; R = boardRound(); }
    else if (mode === 'doctor') { VIEW = 'ward'; R = wardRound(); }
    else { VIEW = 'ready'; R = newRound(mode); R.phase = 'loading'; loadLib(mode, () => { if (!R || R.mode !== mode || R.phase !== 'loading') return; R.phase = 'ready';
        if (!BY[mode].clock && mode !== 'challenge') begin(); else paint(); }); }
    try { if (state.nav !== 'gym' || state.screen !== 'app') { state.screen = 'app'; state.nav = 'gym'; } } catch (e) {}
    try { scrollTo(0, 0); } catch (e) {}
    paint(); try { render(); } catch (e) {} }
  function advOn() { try { return typeof advModeOn === 'function' && !!advModeOn(); } catch (e) { return false; } }

  /* Start (tap or Enter on the ready card): the words are already in hand */
  function begin() { if (!R || (R.phase !== 'ready' && R.phase !== 'done')) return;
    const mode = R.mode; if (R.phase === 'done') { R = newRound(mode); if (!libReady(mode)) { R.phase = 'loading'; VIEW = 'ready'; paint(); loadLib(mode, () => { if (R && R.mode === mode) { R.phase = 'ready'; begin(); } }); return; } }
    if (mode === 'challenge') R.level = chTarget();
    R.phase = 'answer'; VIEW = 'play'; R.started = performance.now();
    nextItem();
    if (R.m.clock) { const secs = R.m.clock * (W.SB_CALM ? 1.5 : 1);
      R.clock = clock(secs, paintClock, () => finish()); seatClock(); } }

  /* the next word: adaptive tier, never a repeat inside the round */
  function nextItem() { if (!R) return; R.hint = 0;
    if ((R.m.n && R.asked >= R.m.n)) { finish(); return; }
    let w = null;
    if (R.mode === 'dictation') w = champDraw(R.level, R.tier, R.seen)[0];
    else if (R.mode === 'spot') { const s = spotItem(); if (s) { R.spot = s; w = s.w; } }
    else w = draw(1, { level: R.mode === 'challenge' ? R.level : R.level, tier: R.m.adapt ? R.tier : 0, skip: R.seen })[0];
    if (!w) { if (!R.asked) { R.phase = 'empty'; paint(); return; } finish(); return; }
    R.cur = w; R.seen.add(K(w)); R.phase = R.mode === 'spot' ? 'tap' : 'answer';
    paint();
    if (R.mode !== 'spot') setTimeout(() => { if (R && R.cur === w) say1(w.w); }, 220);
    live(R.mode === 'spot' ? 'Find the word that is spelt wrong.' : ('Word ' + (R.asked + 1) + (R.m.n ? ' of ' + R.m.n : '') + '. Listen, then spell it.')); }

  /* the word level the next draw comes from, for the chip */
  const tierLevel = () => R ? shiftLv(R.level, R.m.adapt ? R.tier : 0) : 'medium';
  function adapt(ok) { if (!R || !R.m.adapt) return;
    if (ok) { R.misses = 0; if (++R.streak >= 3) { R.streak = 0; R.tier = Math.min(1, R.tier + 1); } }
    else { R.streak = 0; if (++R.misses >= 2) { R.misses = 0; R.tier = Math.max(-1, R.tier - 1); } } }

  /* pay per §6 — the ONLY place a gym answer pays */
  function payRight() { if (!R) return;
    if (R.mode === 'squares') return;                             // Squares pays a claimed square, never an answer
    if (R.mode === 'dictation' && R.paid >= (R.m.cap || 20)) return;  // Champ Dictation: at most 20 a round
    const n = (typeof payG === 'function') ? payG(R) : 0; if (n) R.paid++; }

  /* one typed answer. An empty Enter is never an answer. */
  function submit(raw) { if (!R || R.phase !== 'answer' || !R.cur) return;
    const typed = String(raw == null ? '' : raw).trim();
    if (!typed) { nudge(); return; }
    const w = R.cur, ok = (typeof sameSpelling === 'function') ? sameSpelling(typed, w.w) : typed.toLowerCase() === K(w);
    R.asked++; R.log.push({ w: w.w, ok });
    try { logBand(w, ok); } catch (e) {}
    if (ok) { R.right++; sound('correct'); payRight(); try { markMastered(K(w)); } catch (e) {} try { clearMiss(w.w); } catch (e) {} }
    else { sound('wrong'); recordMiss(w, typed); }
    adapt(ok);
    if (R.mode === 'squares') return squareAnswered(ok, typed);
    if (R.mode === 'doctor') return cureAnswered(ok, typed);
    if (ok) { R.flash = true; nextItem(); }
    else miss(w, typed, () => nextItem()); }
  function recordMiss(w, typed) { try { addMiss(w); } catch (e) {}
    const c = kid(); const k = K(w);
    try { const e = (c.missed || []).find(x => K(x) === k); if (e) e.t = typed; } catch (e) {}
    try { const T = gs().typo; T[k] = String(typed).slice(0, 40); const ks = Object.keys(T); if (ks.length > 300) delete T[ks[0]]; } catch (e) {} }

  /* A MISS HOLDS. The word, letter by letter, and why — and every clock waits until Continue. */
  function miss(w, typed, then) { if (!R) return; R.phase = 'miss'; if (R.clock) R.clock.hold(true);
    if (KEYS) { try { KEYS.destroy(); } catch (e) {} KEYS = null; }
    paint();
    const host = EL && EL.querySelector('.gym-card');
    const go = () => { if (!R || R.phase !== 'miss') return; R.phase = 'answer'; if (R.clock) R.clock.hold(false); detach(); then(); };
    let detach = () => {};
    say1(w.w);
    if (host && W.SGUI && typeof SGUI.miss === 'function') { try { lastH = null; SGUI.miss(host, w, typed, { onContinue: go }); return; } catch (e) {} }
    lastH = null;
    if (host) host.innerHTML = missHTML(w, typed);
    /* Enter or tap continues — wired on the next tick, so the Enter that submitted cannot also dismiss */
    setTimeout(() => { const kd = e => { if (e.key === 'Enter' && !e.repeat) { e.preventDefault(); go(); } };
      document.addEventListener('keydown', kd, true); detach = () => document.removeEventListener('keydown', kd, true);
      const b = EL && EL.querySelector('[data-g="cont"]'); if (b) { b.onclick = go; try { b.focus({ preventScroll: true }); } catch (e) {} } }, 0); }
  function missHTML(w, typed, head) { let panel = '';
    try { panel = missFeedbackHTML(w, typed, head ? { head } : {}); } catch (e) { panel = '<div class="sb-miss"><b>' + E(w.w) + '</b></div>'; }
    return panel + '<button class="gym-btn go" data-g="cont">Continue →</button>'; }
  function nudge() { const n = EL && EL.querySelector('.gym-nudge'); if (n) { n.textContent = 'Type the word first, then Enter.'; } }

  /* the end of a round: the level rule, the best, the record — never a coin for finishing */
  function finish() { if (!R || R.phase === 'done' || R.phase === 'gone') return;
    if (R.clock) { R.clock.stop(); R.ended = performance.now(); }
    if (KEYS) { try { KEYS.destroy(); } catch (e) {} KEYS = null; }
    R.phase = 'done'; VIEW = 'done';
    const asked = R.mode === 'spot' ? Math.max(R.asked, R.m.n || 0) : R.asked;
    const pct = asked ? Math.round(R.right / asked * 100) : 0;
    R.pct = pct;
    if (R.mode === 'challenge') { R.pass = asked >= (R.m.n || 10) && pct >= 80;
      if (R.pass) { try { R.bonus = (R.bonus || 0) + addCoins('contest'); } catch (e) {} promote(R.level); } }
    else if (asked) { try { R.lv = LVL().after(R.key, pct) || null; } catch (e) { R.lv = null; } }
    const g = gs(); g.seen[R.mode] = 1; g.last = R.mode;
    /* the best goes where the Play card and the bests migration read it: SB_BESTS['gym/<mode>'] —
       right of asked, or right alone for a timed round (of: null); Word Doctor's is cures of patients */
    const of = R.m.clock ? null : R.mode === 'doctor' ? (R.patients || []).length : asked;
    if (asked || R.mode === 'doctor') putBest(R.mode, R.mode === 'doctor' ? (R.cures || 0) : R.right, of);
    if (R.mode === 'challenge' && R.pass) g.passed = R.level;
    R.coins = (typeof earnedSoFar === 'function' ? earnedSoFar() : 0) - R.e0;
    try { logActivity('gym', hubName() + ' · ' + R.m.title, { done: asked, right: R.right, coins: R.coins }, R.log.filter(x => !x.ok).map(x => x.w)); } catch (e) {}
    persist();
    if (pct >= 80) { sound('win'); try { burstConfetti(90); } catch (e) {} } else sound('level');
    paint(); }

  /* ------------------------------------------------------------------ Level Challenge: the way up */
  function chTarget() { const cur = lvResolve(lvGet('challenge')); return LV[Math.min(LV.length - 1, LV.indexOf(cur) + 1)]; }
  /* a pass moves the gym up: the Challenge's own level, and every mode below it (a level the child
     set higher by hand stays where they put it) */
  function promote(to) { const L = LVL(); const ti = LV.indexOf(to);
    MODES.forEach(m => { const k = lvKey(m.id); let cur = 'auto'; try { cur = L.get(k); } catch (e) {}
      if (m.id === 'challenge' || LV.indexOf(lvResolve(cur)) < ti) { try { L.set(k, to); } catch (e) {} } }); }

  /* ------------------------------------------------------------------ Spot the Error */
  /* a wrong spelling a child might really write: the library's recorded misspelling first, then
     one honest slip (a dropped double, a doubled letter, ie/ei, a vowel swap), chosen by a seed */
  function misspell(w) { const s = K(w);
    if (w.m && K(w.m) !== s && /^[a-z]+$/i.test(w.m)) return String(w.m).toLowerCase();
    const r = rng(hash(s)); const cands = [];
    const dbl = s.match(/([b-df-hj-np-tv-z])\1/); if (dbl) cands.push(s.replace(dbl[0], dbl[1]));
    if (/ie/.test(s)) cands.push(s.replace('ie', 'ei')); else if (/ei/.test(s)) cands.push(s.replace('ei', 'ie'));
    for (let i = 1; i < s.length - 2; i++) if (/[bcdfglmnprst]/.test(s[i]) && s[i] !== s[i + 1] && s[i] !== s[i - 1] && /[aeiou]/.test(s[i - 1])) { cands.push(s.slice(0, i + 1) + s[i] + s.slice(i + 1)); break; }
    const vi = [...s].map((ch, i) => /[aeiou]/.test(ch) && i > 0 && i < s.length - 1 ? i : -1).filter(i => i >= 0);
    if (vi.length) { const i = vi[Math.floor(r() * vi.length)]; const sub = { a: 'e', e: 'a', i: 'e', o: 'a', u: 'o' }[s[i]]; cands.push(s.slice(0, i) + sub + s.slice(i + 1)); }
    const ok = cands.filter(x => x && x !== s); return ok.length ? ok[Math.floor(r() * ok.length)] : null; }
  function spotItem() { if (!R) return null;
    const hasSent = w => { if (!w.s || w.s.length > 160) return false; try { return new RegExp('\\b' + K(w) + '\\b', 'i').test(w.s); } catch (e) { return false; } };
    for (let t = 0; t < 4; t++) {
      const ws = draw(6, { level: R.level, tier: R.tier, skip: R.seen, needSent: true, need: hasSent });
      for (const w of ws) { const bad = misspell(w); if (!bad) continue;
        const re = new RegExp('\\b' + K(w) + '\\b', 'i'); const m = re.exec(w.s); if (!m) continue;
        const keepCase = m[0][0] === m[0][0].toUpperCase() ? bad[0].toUpperCase() + bad.slice(1) : bad;
        const before = w.s.slice(0, m.index), after = w.s.slice(m.index + m[0].length);
        const toks = []; const push = (txt, isBad) => { txt.split(/(\s+)/).forEach(p => { if (!p) return; if (/^\s+$/.test(p)) { toks.push({ sp: p }); return; }
          const mm = /^([^A-Za-z']*)([A-Za-z'][A-Za-z'\-]*)([^A-Za-z']*)$/.exec(p);
          if (mm) toks.push({ pre: mm[1], t: mm[2], post: mm[3], bad: !!isBad }); else toks.push({ sp: p }); }); };
        push(before); push(keepCase, true); push(after);
        return { w, bad, toks }; } }
    return null; }
  function spotTap(i) { if (!R || R.phase !== 'tap' || !R.spot) return; const tok = R.spot.toks[i]; if (!tok || tok.sp) return;
    R.tapped = i;
    if (tok.bad) { R.phase = 'answer'; paint(); say1(R.cur.w); return; }
    /* the wrong word was tapped: the error was not found, so the item is over — the misspelt word is
       shown, then the word as it should be, and it holds until Continue */
    const w = R.cur; R.asked++; R.log.push({ w: w.w, ok: false }); sound('wrong'); recordMiss(w, R.spot.bad); adapt(false);
    miss(w, R.spot.bad, () => nextItem()); }

  /* ------------------------------------------------------------------ Squares */
  const BAND_RANK = { '6-7': 0, '8-10': 1, '11-15': 2 };
  /* §1.2: these three wait for the 11–15 band, whatever the theme data says (minBand wins when set) */
  const GATED = { pharmacy: '11-15', war: '11-15', disease: '11-15' };
  function childBand() { const c = kid() || {}; if (c.ageBand && BAND_RANK[c.ageBand] != null) return c.ageBand; const a = c.age || 9; return a <= 7 ? '6-7' : a <= 10 ? '8-10' : '11-15'; }
  function themeOpen(t) { try { if (typeof W.SB_THEME_OPEN === 'function') return !!W.SB_THEME_OPEN(t, kid()); } catch (e) {}
    const need = t.minBand || GATED[t.id]; return !need || BAND_RANK[childBand()] >= (BAND_RANK[need] || 0); }
  /* a theme's words come through the one door too: nextWords with the theme (it gates minBand, keeps the
     level window and the kid-safe filter); nextWords.pool reads the same pool without drawing from it */
  function themeList(t, level) { let ws = [];
    try { if (typeof W.nextWords === 'function' && typeof W.nextWords.pool === 'function') ws = W.nextWords.pool(kid(), { purpose: 'drill', theme: t.id, level: lvResolve(level), minLen: 3 }) || []; } catch (e) {}
    return ws.filter(typable); }
  function boardRound() { const r = newRound('squares'); r.phase = 'board'; r.claimed = 0; r.lines = 0; r.lineSet = {};
    let defs = []; try { defs = themeDefs() || []; } catch (e) {}
    const g = gs(); g.boards = (g.boards || 0) + 1;
    const ok = defs.filter(t => themeOpen(t) && themeList(t, r.level).length >= 10);
    r.board = shuffled(ok, hash(today() + ':' + g.boards)).slice(0, 9).map(t => ({ id: t.id, label: t.label, done: false, best: 0, tried: 0 }));
    return r; }
  function squareOpen(i) { if (!R || R.mode !== 'squares' || R.phase !== 'board') return; const cell = R.board[i]; if (!cell || cell.done) return;
    const t = (themeDefs() || []).find(x => x.id === cell.id); if (!t) return;
    let ws = themeList(t, R.level).filter(w => !R.seen.has(K(w)));
    ws = (typeof pickFresh === 'function' ? pickFresh(ws, 5) : ws.slice(0, 5));
    if (ws.length < 5) { flashMsg('Not enough words in that square yet'); return; }
    ws.forEach(w => { R.seen.add(K(w)); try { logGameWord(K(w)); } catch (e) {} });
    R.cell = i; R.cellQ = ws; R.cellI = 0; R.cellRight = 0; VIEW = 'play';
    R.cur = ws[0]; R.phase = 'answer'; paint(); setTimeout(() => { if (R && R.cur === ws[0]) say1(ws[0].w); }, 220); }
  function squareAnswered(ok, typed) { if (ok) R.cellRight++;
    const next = () => { R.cellI++; if (R.cellI < R.cellQ.length) { R.cur = R.cellQ[R.cellI]; R.phase = 'answer'; paint(); const w = R.cur; setTimeout(() => { if (R && R.cur === w) say1(w.w); }, 200); return; } squareDone(); };
    if (ok) next(); else miss(R.cur, typed, next); }
  const LINES = [[0, 1, 2, 'Row 1'], [3, 4, 5, 'Row 2'], [6, 7, 8, 'Row 3'], [0, 3, 6, 'Column 1'], [1, 4, 7, 'Column 2'], [2, 5, 8, 'Column 3'], [0, 4, 8, 'A diagonal'], [2, 4, 6, 'The other diagonal']];
  function squareDone() { const cell = R.board[R.cell]; cell.tried++; cell.best = Math.max(cell.best, R.cellRight);
    const won = R.cellRight >= 4; R.celeb = []; R.cellWon = won;
    if (won && !cell.done) { cell.done = true; R.claimed++;
      try { R.bonus = (R.bonus || 0) + addCoins('stop'); } catch (e) {}   // a claimed square is a finished round: 'stop', and nothing per answer
      LINES.forEach(L => { const id = L.slice(0, 3).join(''); if (!R.lineSet[id] && L.slice(0, 3).every(j => R.board[j].done)) { R.lineSet[id] = 1; R.lines++; R.celeb.push(L[3]); } });
      if (R.celeb.length) { sound('win'); try { burstConfetti(110); } catch (e) {} } else { sound('level'); } }
    else sound('lose');
    R.phase = 'board'; VIEW = 'board'; R.cur = null;
    if (R.board.every(c => c.done)) { finish(); return; }
    paint(); }

  /* ------------------------------------------------------------------ Word Doctor (§4.2.1) */
  const TYPES = [['double', 'Doubled letter'], ['silent', 'Silent letter'], ['vowel', 'Vowel sound (schwa)'], ['suffix', 'Suffix'], ['sound', 'A sound with several spellings']];
  const TYPE_WHY = {
    double: 'A letter in this word comes twice — or it does not, and it was doubled. The short vowel before it is the clue.',
    silent: 'This word has a letter you cannot hear. Say it the "spelling way" to keep the silent letter in.',
    vowel: 'An unstressed vowel sounds like "uh" — the schwa — so the ear cannot tell you which vowel to write.',
    suffix: 'The ending is the tricky part: endings that sound alike, like -able and -ible or -ance and -ence, are spelt differently.',
    sound: 'One sound, several spellings — like f and ph, or c, k and ck. This word uses the less obvious one.'
  };
  /* the true type of THIS child's mistake, from what they typed against the word (missWhy finds
     where the letters differ); without a recorded attempt, the library's own common misspelling,
     then the word's trickiest feature */
  function docType(w, typed) { let t = typed; if (!t && w.m && K(w.m) !== K(w)) t = String(w.m);
    let k = null;
    try { if (t && typeof missWhy === 'function') k = (missWhy(w, t) || {}).k; } catch (e) {}
    if (!k || k === 'plain') { try { k = { dbl: 'double', silent: 'silent', end: 'endings' }[trickAnal(w).cls] || k; } catch (e) {} }
    return { double: 'double', silent: 'silent', endings: 'suffix', schwa: 'vowel' }[k] || 'sound'; }
  /* four options, always the true type, in the fixed order — so where it sits says nothing */
  function docOptions(w, type) { const others = TYPES.filter(x => x[0] !== type); const drop = others[hash(K(w)) % others.length][0];
    return TYPES.filter(x => x[0] !== drop); }
  function ward() { const g = gs(); const D = g.doc || (g.doc = { ward: {}, rec: {}, day: -1, seen: [] });
    D.ward = D.ward || {}; D.rec = D.rec || {}; D.seen = D.seen || []; const d = today(); if (D.day !== d) { D.day = d; D.seen = []; } return D; }
  function wardRound() { const r = newRound('doctor'); r.phase = 'ward'; const D = ward(), d = today(), c = kid() || {};
    const room = Math.max(0, 10 - D.seen.length); const q = [], have = new Set(D.seen);
    const add = (w, src) => { const k = K(w); if (!k || have.has(k) || D.rec[k] || q.length >= room || !kidSafeW(w) || !/^[a-z]+$/i.test(w.w || '')) return; have.add(k); q.push(Object.assign({}, w, { _src: src })); };
    /* patients treated on an earlier day come back first: they are the ones who can go home */
    Object.keys(D.ward).filter(k => D.ward[k].cur != null && D.ward[k].cur < d).forEach(k => add(D.ward[k].rec || { w: D.ward[k].w }, 'back'));
    Object.keys(D.ward).filter(k => D.ward[k].cur == null).forEach(k => add(D.ward[k].rec || { w: D.ward[k].w }, 'ward'));
    let rev = [];
    try { if (typeof W.nextWords === 'function') rev = W.nextWords(c, 10, { purpose: 'review' }) || []; } catch (e) { rev = []; }
    if (!rev.length) { /* fallback: the child's own missed words, the ones whose Leitner check is up first */
      const M = c.mast || {}; const due = x => { const m = M[K(x)]; return !m || !(m.b >= 1) || d >= (m.due || 0); };
      rev = (c.missed || []).slice().sort((a, b) => (due(b) - due(a)) || ((b.ts || 0) - (a.ts || 0))).filter(due); }
    rev.forEach(w => add(w, 'new'));
    r.patients = q; r.pi = 0; r.cures = 0; return r; }
  function patientRec(w) { const D = ward(); const k = K(w); const c = kid() || {};
    let typed = ''; try { const e = (c.missed || []).find(x => K(x) === k); typed = (e && e.t) || gs().typo[k] || ''; } catch (e) {}
    const p = D.ward[k] || (D.ward[k] = { w: w.w, adm: today(), cur: null, t: typed, rec: { w: w.w, d: w.d || '', s: w.s || '', m: w.m || '', o: w.o || '', y: w.y || 3 } });
    if (typed && !p.t) p.t = typed; p.k = docType(Object.assign({}, p.rec, w), p.t); return p; }
  function docStart() { if (!R || R.mode !== 'doctor') return; if (!R.patients.length) return;
    R.pi = 0; R.asked = 0; docNext(); }
  function docNext() { if (!R) return; if (R.pi >= R.patients.length) { finish(); return; }
    const w = R.patients[R.pi]; R.cur = w; R.pat = patientRec(w); R.opts = docOptions(w, R.pat.k); R.dpick = null;
    const D = ward(); if (D.seen.indexOf(K(w)) < 0) D.seen.push(K(w)); R.pat.seen = today(); persist();
    R.phase = 'diag'; VIEW = 'play'; paint(); setTimeout(() => { if (R && R.cur === w) say1(w.w); }, 220);
    live('Patient ' + (R.pi + 1) + ' of ' + R.patients.length + '. What went wrong?'); }
  function docPick(i) { if (!R || R.phase !== 'diag') return; const o = R.opts[+i]; if (!o) return; R.dpick = o[0];
    const right = o[0] === R.pat.k; sound(right ? 'correct' : 'wrong');
    if (right) { R.phase = 'diagok'; paint(); setTimeout(() => { if (R && R.phase === 'diagok') { R.phase = 'answer'; paint(); say1(R.cur.w); } }, 1100); return; }
    /* a wrong diagnosis holds: the true type and why, until Continue */
    R.phase = 'diagno'; paint();
    setTimeout(() => { const go = () => { document.removeEventListener('keydown', kd, true); if (R && R.phase === 'diagno') { R.phase = 'answer'; paint(); say1(R.cur.w); } };
      const kd = e => { if (e.key === 'Enter' && !e.repeat) { e.preventDefault(); go(); } };
      document.addEventListener('keydown', kd, true); const b = EL && EL.querySelector('[data-g="cont"]'); if (b) { b.onclick = go; try { b.focus({ preventScroll: true }); } catch (e) {} } }, 0); }
  /* THE CURE, and the family's later-day rule: spelt right today treats the patient; spelt right on a
     LATER day than the last treatment discharges them to the Recovered ward. Never the same day. */
  function cureAnswered(ok, typed) { const p = R.pat, d = today(), k = K(R.cur), D = ward();
    if (ok) { R.cures++;
      if (p.cur != null && p.cur < d) { D.rec[k] = { w: p.w, adm: p.adm, out: d }; delete D.ward[k]; R.out = (R.out || 0) + 1; R.verdict = 'out'; }
      else { p.cur = d; R.verdict = 'treated'; }
      persist(); R.phase = 'cured'; paint();
      setTimeout(() => { if (R && R.phase === 'cured') { R.pi++; docNext(); } }, 1400); return; }
    p.cur = null; p.t = typed; persist();
    miss(R.cur, typed, () => { R.pi++; docNext(); }); }

  /* ------------------------------------------------------------------ the stage */
  /* the painted plate comes with SB_PLATE (the engine kit ships the paintings and the function
     together); without it the stage wears its token gradient, and never asks for a file that 404s */
  function plate(name) { return name; }   // the kit takes a plate's NAME and swaps day/night itself
  /* the centre of the HUD: Back, the title (and its chips), and a spacer as wide as Back, so the title sits
     on the stage's centre line and the two stats either side stay the same width (T15) */
  const centre = (bk, title) => '<div class="gym-cline">' + (bk || '<span class="gym-spacer" aria-hidden="true"></span>') + '<div class="gym-ctitle">' + title + '</div><span class="gym-spacer" aria-hidden="true"></span></div>';
  function stage(o) { const hud = o.hud || {}; const c = centre(hud.back, hud.center || '');
    if (W.SGUI && typeof SGUI.stage === 'function') { try { return SGUI.stage({ plate: o.plate, name: 'gym', cls: 'gym-st', label: hubName(), hud: { left: hud.left, center: c, right: hud.right },
        play: '<div class="gym-fill">' + (o.play || '') + '</div>', controls: o.controls || '' }); } catch (e) {} }
    let url = ''; try { if (o.plate && typeof W.SB_PLATE === 'function') url = W.SB_PLATE(o.plate) || ''; } catch (e) {}
    return '<div class="gym-stage"' + (url ? ' style="--gym-plate:url(\'' + EA(url) + '\')"' : '') + '><div class="gym-hud">' +
      '<div class="gym-hl">' + (hud.left || '') + '</div><div class="gym-hc">' + c + '</div><div class="gym-hr">' + (hud.right || '') + '</div></div>' +
      '<div class="gym-play"><div class="gym-fill">' + (o.play || '') + '</div></div><div class="gym-ctl">' + (o.controls || '') + '</div></div>'; }
  const back = (label, g) => '<button class="gym-back" data-g="' + g + '" aria-label="Back to ' + EA(label) + '" title="Back to ' + EA(label) + '"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5 8 12l7 7"/></svg></button>';
  /* a HUD stat in the kit's own markup (number, then its label), so both sides of the HUD are one shape */
  const stat = (n, l, id) => '<span class="sg-st-ic">' + ic(l === 'seconds' ? 'timer' : l === 'coins today' ? 'coin' : 'check', 18) + '</span><span class="sg-st-n"' + (id ? ' id="' + id + '"' : '') + '>' + n + '</span><span class="sg-st-t">' + E(l) + '</span>';
  function coinsToday() { try { const c = kid(); if (W.SB_DEMO || !W.BZ_WALLET) return 0; const who = walletWho(c); if (!who) return 0;
      const d0 = new Date(); d0.setHours(0, 0, 0, 0);
      return BZ_WALLET.ledger(who).filter(x => x.a === BEE_APP && x.n > 0 && x.why !== 'migrated' && x.t >= d0.getTime()).reduce((a, x) => a + x.n, 0); } catch (e) { return 0; } }
  function getBest(id) { try { if (W.SB_BESTS) return W.SB_BESTS.get('gym/' + id); } catch (e) {} return (gs().best || {})[id] || null; }
  function putBest(id, right, of) { try { if (W.SB_BESTS) return W.SB_BESTS.put('gym/' + id, right, of); } catch (e) {}
    const B = gs().best, o = B[id], r = x => x.of ? x.right / x.of : x.right; const n = { right, of, at: Date.now() };
    if (!o || r(n) > r(o)) B[id] = n; persist(); }
  function bestText(id) { const g = gs();
    if (id === 'doctor') { const n = Object.keys((g.doc && g.doc.rec) || {}).length; return n ? n + ' recovered' : ''; }
    if (id === 'challenge' && g.passed) return 'Passed ' + LV_NAME[g.passed];
    const b = getBest(id); if (!b || !b.right) return '';
    return 'Best ' + (b.of ? b.right + '/' + b.of : b.right); }

  /* ------------------------------------------------------------------ painting */
  function el() { if (EL) return EL; EL = document.createElement('div'); EL.className = 'gym-root'; bind(EL); css(); return EL; }
  function paint() { if (!EL) return; let h = '';
    try { h = VIEW === 'hub' ? hubView() : VIEW === 'locked' ? lockedView() : VIEW === 'board' ? boardView() : VIEW === 'ward' ? wardView() : modeView(); }
    catch (e) { try { console.error(e); } catch (_) {} h = stage({ plate: plate('gym'), hud: { back: back(hubName(), 'hub'), center: '' }, play: '<div class="sg-panel gym-card">Something went wrong here.</div>' }); }
    /* the same picture is not painted twice: an app render (a lazy file landing) re-mounts the gym, and
       a hub repainted on every one would never hold still under a finger or a screenshot */
    if (h === lastH && EL.firstChild) { size(); return; }
    lastH = h; EL.innerHTML = h; size();
    try { if (W.SGUI && typeof SGUI.stageFit === 'function') SGUI.stageFit(); } catch (e) {}   // a new stage element is fitted to the shell at once
    if (KEYS) { try { KEYS.destroy(); } catch (e) {} KEYS = null; }
    const inp = EL.querySelector('.gym-in');
    if (inp && R && R.phase === 'answer') {
      const kh = EL.querySelector('.gym-keys');
      if (kh && (touch() || (W.SGUI && typeof SGUI.keys === 'function'))) KEYS = keys(kh, inp);
      if (!touch()) { try { inp.focus({ preventScroll: true }); } catch (e) {} }
    }
    seatClock();
    const end = EL.querySelector('.sg-endcard'); if (end) { try { SGUI.bind(end); } catch (e) {}
      const a = end.querySelector('#sg-again'), b = end.querySelector('#sg-cont');
      if (a) a.onclick = () => again(); if (b) b.onclick = () => app.openGym(); try { (a || b).focus({ preventScroll: true }); } catch (e) {} } }
  function again() { if (!R) return; const mode = R.mode; if (mode === 'squares' || mode === 'doctor') { open(mode); return; } R.phase = 'done'; begin(); }

  function hubView() { const c = kid() || {}; const g = gs();
    const tiles = MODES.map(m => { const locked = m.adv && !advOn(); const best = bestText(m.id);
      return { id: m.id, title: m.title, promise: locked ? 'Comes with the Advanced Pack' : m.promise, art: '<span class="gym-art">' + ic(m.icon, 30) + '</span>', best, isNew: !g.seen[m.id], last: g.last === m.id, locked }; });
    const hud = { back: back('Play', 'play'), left: stat(goodDays(c), 'good days'), right: stat(coinsToday(), 'coins today') };
    if (typeof W.SB_HUB === 'function') { try { const h = W.SB_HUB({ key: 'gym', title: hubName(), plate: plate('gym'), modes: tiles, last: g.last || '' });
        /* the kit's hub has no way back drawn on it: Back goes beside the title, a spacer opposite */
        const i = h.indexOf('<h1 class="sg-st-title">'), j = h.indexOf('</h1>', i);
        return i < 0 || j < 0 ? h : h.slice(0, i) + centre(hud.back, h.slice(i, j + 5)) + h.slice(j + 5); } catch (e) {} }
    const grid = tiles.map(t => '<div class="gym-tile' + (t.id === 'challenge' ? ' wide' : '') + (t.locked ? ' locked' : '') + '">' +
      '<button class="gym-tile-go" data-act="hubMode" data-arg="gym/' + t.id + '" aria-label="' + EA(t.title + '. ' + t.promise) + '">' +
      '<span class="gym-tile-art">' + t.art + (t.isNew ? '<i class="gym-new" aria-label="new"></i>' : '') + '</span>' +
      '<span class="gym-tile-t">' + E(t.title) + (t.last ? ' <small class="gym-lastm">last played</small>' : '') + '</span>' +
      '<span class="gym-tile-p">' + E(t.promise) + '</span>' +
      (t.best ? '<span class="gym-tile-b">' + E(t.best) + '</span>' : '') + '</button>' +
      (t.locked || t.id === 'doctor' ? '' : '<span class="gym-tile-lv">' + lvChip(t.id) + '</span>') + '</div>').join('');
    return stage({ plate: plate('gym'), hud: Object.assign({ center: '<h1 class="sg-st-title gym-title">' + E(hubName()) + '</h1>' }, hud), play: '<div class="gym-hub">' + grid + '</div>', controls: '' }); }
  function goodDays(c) { try { return goodDaysThisWeek(c); } catch (e) { return 0; } }

  function hudFor(extraRight) { const m = R.m;
    const left = stat(R.mode === 'squares' ? R.claimed + '/9' : R.mode === 'doctor' ? (R.cures || 0) : R.right, R.mode === 'squares' ? 'squares' : R.mode === 'doctor' ? 'cured' : 'right');
    const chip = '<span class="gym-lvl static">' + LV_NAME[R.level] + '</span>' + (m.adapt && VIEW === 'play' ? '<span class="gym-tier" title="Where the next word comes from">Words: ' + LV_NAME[tierLevel()] + '</span>' : '');
    const center = '<h1 class="sg-st-title gym-title">' + E(m.title) + '</h1><div class="gym-chips">' + chip + '</div>';
    let right = extraRight;
    if (right == null) {
      if (m.clock) { const left2 = R.clock ? Math.ceil(R.clock.left) : Math.round(m.clock * (W.SB_CALM ? 1.5 : 1)); right = stat('<span id="gym-clock">' + left2 + '</span>', 'seconds'); }
      else if (m.n) right = stat(Math.min(R.asked + (/^(answer|tap)$/.test(R.phase) ? 1 : 0), m.n) + '/' + m.n, 'word');
      else right = stat(R.lines || 0, 'lines'); }
    return { back: back(hubName(), 'hub'), left, center, right }; }
  /* the round's clock element is ONE node all round: every repaint seats it back where the HUD asks */
  function seatClock() { const C = R && R.clock; if (!C || !C.el || !EL) return; const ph = EL.querySelector('#gym-clock'); if (ph && ph !== C.el) ph.replaceWith(C.el); }
  function paintClock(C) { const e = (C && C.el) || (EL && EL.querySelector('#gym-clock')); if (!e) return; const s = String(Math.ceil(C.left)); if (e.textContent !== s) e.textContent = s;
    const bar = EL.querySelector('.gym-bar > i'); if (bar) bar.style.transform = 'scaleX(' + Math.max(0, C.left / C.total).toFixed(4) + ')'; }

  function modeView() { const m = R.m;
    if (R.phase === 'loading' || R.phase === 'ready') { if (R.mode !== 'challenge') R.level = lvResolve(lvGet(R.mode));
      const lines = { sprint: 'The clock starts when you press Start. A miss stops it while you read the word.', dictation: 'Ninety seconds of championship words. Up to 20 coins a round.', challenge: 'Ten words at ' + LV_NAME[chTarget()] + '. Spell 8 right and every mode in the gym moves up to ' + LV_NAME[chTarget()] + '.' };
      const ready = R.phase === 'ready';
      const play = '<div class="sg-panel gym-card gym-ready"><div class="gym-big-ic">' + ic(m.icon, 46) + '</div><h3>' + E(m.title) + '</h3><p>' + E(lines[R.mode] || m.promise) + '</p>' +
        (R.mode !== 'challenge' ? '<div class="gym-readylv">Level ' + lvChip(R.mode) + '</div>' : '') +
        '<button class="gym-btn go" data-g="start" ' + (ready ? '' : 'disabled aria-disabled="true"') + '>' + (ready ? 'Start →' : 'Getting the words ready…') + '</button></div>';
      return stage({ plate: plate('gym'), hud: hudFor(), play, controls: '' }); }
    if (R.phase === 'empty') return stage({ plate: plate('gym'), hud: hudFor(''), play: '<div class="sg-panel gym-card"><p>No words at this level yet — try another level.</p><button class="gym-btn go" data-g="hub">Back to the gym</button></div>', controls: '' });
    if (R.phase === 'done') return stage({ plate: plate('gym'), hud: hudFor(''), play: doneCard(), controls: '' });
    if (R.mode === 'doctor') return doctorPlay();
    const w = R.cur || {}; const clockBar = m.clock ? '<div class="gym-bar" aria-hidden="true"><i></i></div>' : '';
    let card = '';
    if (R.mode === 'spot' && R.spot) {
      const toks = R.spot.toks.map((t, i) => t.sp ? E(t.sp) : (E(t.pre) + '<button class="gym-tok' + (R.phase !== 'tap' && t.bad ? ' bad' : '') + '" data-g="tok" data-arg="' + i + '"' + (R.phase === 'tap' ? '' : ' disabled') + '>' + E(t.t) + '</button>' + E(t.post))).join('');
      card = '<div class="sg-panel gym-card gym-spot" data-live-prompt>' + clockBar + '<p class="gym-ask">' + (R.phase === 'tap' ? 'One word is spelt wrong. Tap it.' : 'Now type it the right way.') + '</p><p class="gym-sent">' + toks + '</p>' +
        (R.phase === 'answer' ? inputHTML() : '') + '</div>';
    } else {
      const def = w.d ? (typeof blankHTML === 'function' ? blankHTML(w.d.length > 110 ? w.d.slice(0, 108).replace(/\s+\S*$/, '') + '…' : w.d, w.w) : '') : '';
      const hints = m.hints ? hintHTML(w) : '';
      card = '<div class="sg-panel gym-card" data-live-prompt>' + clockBar +
        (R.mode === 'squares' ? '<p class="gym-ask">' + E(R.board[R.cell].label) + ' · ' + (R.cellI + 1) + ' of 5</p>' : '') +
        '<button class="gym-hear" data-g="hear" aria-label="Hear the word">' + ic('volume', 30) + '<span>Hear it</span></button>' + toolsHTML() +
        (def ? '<p class="gym-def">' + def + '</p>' : '') + hints + inputHTML() + '</div>'; }
    return stage({ plate: plate('gym'), hud: hudFor(), play: card, controls: controlsHTML() }); }
  function inputHTML() { const t = touch();
    return '<input class="gym-in" data-fkey="gymIn" aria-label="Type the word" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" ' +
      (t ? 'inputmode="none" readonly ' : '') + 'placeholder="type the word"><div class="gym-nudge" aria-live="polite"></div>'; }
  /* the controls row: the on-screen keys (a phone) and Enter. On a phone the keyboard's own ⏎ is Enter, so
     the row is the keys alone and sits in the stage's bottom 38%; Slowly and Hint live on the card */
  const kitKeys = () => !!(W.SGUI && typeof SGUI.keys === 'function');
  function controlsHTML() { if (!R || R.phase !== 'answer') return '';
    const row = (touch() && kitKeys()) ? '' : '<div class="gym-acts"><button class="gym-btn go" data-g="enter">Enter ' + ic('arrow', 16) + '</button></div>';
    return '<div class="gym-keys"></div>' + row; }
  function toolsHTML() { if (!R || R.phase !== 'answer') return '';
    const t = (R.mode === 'spot' ? '' : '<button class="gym-pill" data-g="slow">' + ic('volume', 15) + ' Slowly</button>') +
      (R.m.hints ? '<button class="gym-pill" data-g="hint">' + ic('bulb', 15) + ' Hint</button>' : '');
    return t ? '<div class="gym-tools">' + t + '</div>' : ''; }
  /* graduated hints, least to most: the sentence, then the letter count, then the first letter —
     never the word */
  function hintHTML(w) { const n = R.hint | 0; if (!n) return ''; const out = [];
    if (n >= 1) out.push(w.s ? '<p class="gym-hint">' + (typeof blankHTML === 'function' ? blankHTML(w.s, w.w) : '') + '</p>' : '<p class="gym-hint">No sentence for this one.</p>');
    if (n >= 2) out.push('<p class="gym-hint">' + w.w.length + ' letters</p>');
    if (n >= 3) out.push('<p class="gym-hint">It starts with <b>' + E(w.w[0].toLowerCase()) + '</b></p>');
    return out.join(''); }
  function doneCard() { const m = R.m; const asked = R.mode === 'spot' ? Math.max(R.asked, m.n || 0) : R.asked;
    let title = m.title + ' done', sub = R.right + ' of ' + asked + ' right';
    if (R.mode === 'challenge') { title = R.pass ? 'Challenge passed!' : 'Not this time'; sub = R.pass ? 'The gym moves up to ' + LV_NAME[R.level] + '.' : 'You need 8 of 10. Try again when you are ready.'; }
    if (R.mode === 'squares') { title = R.board.every(c => c.done) ? 'The whole board!' : 'Board finished'; sub = R.claimed + ' square' + (R.claimed === 1 ? '' : 's') + ' · ' + R.lines + ' line' + (R.lines === 1 ? '' : 's') + ' · ' + R.right + ' of ' + R.asked + ' right'; }
    if (R.mode === 'doctor') { title = 'Rounds done'; sub = (R.cures || 0) + ' of ' + R.patients.length + ' cured' + (R.out ? ' · ' + R.out + ' went home' : ''); }
    if (R.lv && R.lv.dropped) sub += '. ' + (R.lv.line || ('Let’s warm up on ' + LV_NAME[R.lv.level] + '. You can move back up any time.'));
    const coins = Math.max(0, R.coins | 0);
    let html = '';
    if (W.SGUI && typeof SGUI.result === 'function') html = SGUI.result({ title, sub, stars: R.pct >= 90 ? 3 : R.pct >= 70 ? 2 : R.pct >= 50 ? 1 : 0, score: coins, scoreLabel: ' Bizzing coins', words: R.log, win: R.pct >= 50, contLabel: 'Back to the gym' });
    else html = '<div class="sg-panel gym-card sg-endcard"><h3 class="sg-end-h">' + E(title) + '</h3><p class="sg-end-sub">' + E(sub) + '</p><p>+' + coins + ' coins</p><div class="gym-acts"><button class="gym-btn" id="sg-again">Play again</button><button class="gym-btn go" id="sg-cont">Back to the gym</button></div></div>';
    if (R.lv && R.lv.offerUp && R.mode !== 'challenge') html += '<button class="gym-btn up" data-act="hubMode" data-arg="gym/challenge">Ready for ' + LV_NAME[chTarget()] + '? Take the Level Challenge</button>';
    return html; }

  function lockedView() { const m = BY[state.gymMode] || BY.dictation;
    const play = '<div class="sg-panel gym-card gym-ready"><div class="gym-big-ic">' + ic(m.icon, 46) + '</div><h3>' + E(m.title) + '</h3><p>' + E(m.promise) + '</p><p class="gym-quiet">' + ic('lock', 15) + ' Comes with the Advanced Pack</p>' +
      '<button class="gym-btn" data-act="openAdvanced">Show a grown-up</button></div>';
    return stage({ plate: plate('gym'), hud: { back: back(hubName(), 'hub'), center: '<h1 class="sg-st-title gym-title">' + E(m.title) + '</h1>', left: '', right: '' }, play, controls: '' }); }

  function boardView() { if (R.phase === 'done') return modeView();
    const cells = R.board.map((c, i) => '<button class="sg-panel gym-sq' + (c.done ? ' done' : '') + '" data-g="sq" data-arg="' + i + '" aria-label="' + EA(c.label + (c.done ? ', claimed' : c.tried ? ', best ' + c.best + ' of 5' : '')) + '">' +
      '<span>' + E(c.label) + '</span>' + (c.done ? ic('check', 22) : c.tried ? '<small>best ' + c.best + '/5</small>' : '') + '</button>').join('');
    let note = '';
    if (R.cellWon != null) note = R.celeb && R.celeb.length ? '<p class="gym-celeb">' + R.celeb.map(x => E(x) + ' — a line!').join(' ') + '</p>' : R.cellWon ? '<p class="gym-celeb">Square claimed!</p>' : '<p class="gym-quiet">' + R.cellRight + ' of 5 — you need 4 to claim it. Try that square again any time.</p>';
    const play = '<div class="gym-board-wrap">' + note + '<div class="gym-board">' + cells + '</div></div>';
    return stage({ plate: plate('gym'), hud: hudFor(), play, controls: R.asked ? '<div class="gym-acts"><button class="gym-btn" data-g="endboard">Finish the board</button></div>' : '' }); }

  function wardView() { if (R.phase === 'done') return modeView(); const D = ward(); const nRec = Object.keys(D.rec).length;
    const list = R.patients.length ? R.patients.map(w => '<li>' + ic('heart', 14) + '<span>' + (w._src === 'back' ? 'Back for a check-up' : 'New patient') + '</span></li>').join('') : '';
    const play = '<div class="sg-panel gym-card gym-ward"><div class="gym-big-ic">' + ic('heart', 40) + '</div><h3>The clinic</h3>' +
      (R.patients.length ? '<p>' + R.patients.length + ' patient' + (R.patients.length === 1 ? '' : 's') + ' today — words you missed. Find what went wrong, then cure it. A patient goes home when you spell the word right on a later day.</p><ul class="gym-pts">' + list + '</ul><button class="gym-btn go" data-g="docgo">See the first patient →</button>'
        : '<p>No patients today. Words you miss anywhere in the app come here when it is time to look at them again.</p>') +
      '<p class="gym-quiet">Recovered ward: ' + nRec + '</p></div>';
    return stage({ plate: plate('clinic'), hud: hudFor(stat(R.patients.length, 'today')), play, controls: '' }); }
  function doctorPlay() { const w = R.cur || {}, p = R.pat || {}, ph = R.phase;
    const head = '<p class="gym-ask">Patient ' + (R.pi + 1) + ' of ' + R.patients.length + (p.cur != null && p.cur < today() ? ' · back for a check-up' : '') + '</p>' +
      '<button class="gym-hear" data-g="hear" aria-label="Hear the word">' + ic('volume', 30) + '<span>Hear it</span></button>' +
      (p.t && ph === 'diag' ? '<p class="gym-def">You wrote <b class="gym-typo">' + E(p.t) + '</b>.</p>' : ph === 'diag' ? '<p class="gym-def">You missed this word before.</p>' : '');
    let body = '', ctl = '';
    if (ph === 'diag') body = '<p class="gym-ask">What went wrong?</p><div class="gym-dx">' + R.opts.map((o, i) => '<button class="gym-btn dx" data-g="dx" data-arg="' + i + '">' + E(o[1]) + '</button>').join('') + '</div>';
    else if (ph === 'diagok') body = '<p class="gym-celeb">' + ic('check', 18) + ' Yes — ' + E(TYPES.find(x => x[0] === p.k)[1].toLowerCase()) + '.</p><p class="gym-def">' + E(TYPE_WHY[p.k]) + '</p>';
    else if (ph === 'diagno') body = '<div class="sb-miss gym-dxmiss"><b>It was: ' + E(TYPES.find(x => x[0] === p.k)[1]) + '</b><p>' + E(TYPE_WHY[p.k]) + '</p></div><button class="gym-btn go" data-g="cont">Continue →</button>';
    else if (ph === 'answer') { body = '<p class="gym-ask">The cure: type the word.</p>' + toolsHTML() + inputHTML(); ctl = controlsHTML(); }
    else if (ph === 'cured') body = R.verdict === 'out' ? '<p class="gym-celeb">' + ic('check', 18) + ' Cured — and spelt right on a later day. Off to the Recovered ward!</p>' : '<p class="gym-celeb">' + ic('check', 18) + ' Treated. Spell it right on another day and it goes home.</p>';
    const card = '<div class="sg-panel gym-card gym-doc" data-live-prompt>' + head + body + '</div>';
    return stage({ plate: plate('clinic'), hud: hudFor(stat((R.pi + 1) + '/' + R.patients.length, 'patient')), play: card, controls: ctl }); }

  /* ------------------------------------------------------------------ keyboard + touch */
  /* the on-screen keyboard for touch (SGUI.keys when it is there; this tiny one until then) —
     keys at least 44px tall, inside the stage's controls, never under the tab bar */
  function keys(host, inp) { const on = { onKey: ch => { inp.value += ch; clearNudge(); }, onBack: () => { inp.value = inp.value.slice(0, -1); }, onEnter: () => submit(inp.value) };
    if (W.SGUI && typeof SGUI.keys === 'function') { try { return SGUI.keys(host, on); } catch (e) {} }
    const rows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
    host.innerHTML = rows.map((r, i) => '<div class="gym-krow">' + (i === 2 ? '<button class="gym-k wide" data-k="back" aria-label="Delete">⌫</button>' : '') + [...r].map(ch => '<button class="gym-k" data-k="' + ch + '">' + ch + '</button>').join('') + (i === 2 ? '<button class="gym-k wide go" data-k="enter" aria-label="Enter">↵</button>' : '') + '</div>').join('');
    const h = e => { const b = e.target.closest('[data-k]'); if (!b) return; e.preventDefault(); const k = b.getAttribute('data-k');
      if (k === 'back') on.onBack(); else if (k === 'enter') on.onEnter(); else on.onKey(k); };
    host.addEventListener('click', h);
    return { destroy() { host.removeEventListener('click', h); host.innerHTML = ''; } }; }
  function clearNudge() { const n = EL && EL.querySelector('.gym-nudge'); if (n && n.textContent) n.textContent = ''; }
  function bind(root) {
    root.addEventListener('click', e => { const b = e.target.closest('[data-g]'); if (!b || !root.contains(b)) return; const g = b.getAttribute('data-g'), a = b.getAttribute('data-arg');
      if (g === 'hub') { app.openGym(); return; }
      if (g === 'play') { app.openGames(); return; }
      if (g === 'start') { begin(); return; }
      if (g === 'hear') { if (R && R.cur) say1(R.cur.w); return; }
      if (g === 'slow') { if (R && R.cur) say1(R.cur.w, 0.6); return; }
      if (g === 'hint') { if (R && R.m.hints && R.phase === 'answer') { R.hint = Math.min(3, (R.hint | 0) + 1); const v = (EL.querySelector('.gym-in') || {}).value || ''; paint(); const i = EL.querySelector('.gym-in'); if (i) i.value = v; } return; }
      if (g === 'enter') { const i = EL.querySelector('.gym-in'); submit(i ? i.value : ''); return; }
      if (g === 'tok') { spotTap(+a); return; }
      if (g === 'sq') { squareOpen(+a); return; }
      if (g === 'endboard') { if (R && R.mode === 'squares' && R.phase === 'board') finish(); return; }
      if (g === 'docgo') { docStart(); return; }
      if (g === 'dx') { docPick(+a); return; }
      if (g === 'lvl') { const k = a; const cur = FB.get(k); const order = ['auto'].concat(LV); FB.set(k, order[(order.indexOf(cur) + 1) % order.length]);
        if (R && R.key === k && (R.phase === 'ready' || R.phase === 'loading')) R.level = lvResolve(FB.get(k)); paint(); return; }
    });
    root.addEventListener('keydown', e => { const t = e.target;
      if (t && t.classList && t.classList.contains('gym-in') && e.key === 'Enter') { e.preventDefault(); submit(t.value); return; }
      if (t && t.classList && t.classList.contains('gym-in')) { clearNudge(); }
    });
  }
  /* desktop: Enter on a ready card starts; the number keys 1–4 pick a diagnosis */
  document.addEventListener('keydown', e => { try {
    if (!EL || !EL.isConnected || state.nav !== 'gym' || e.ctrlKey || e.metaKey || e.altKey || state.pinDlg || state.settingsOpen) return;
    if (!R) return;
    if (e.key === 'Enter' && R.phase === 'ready' && !(e.target && e.target.closest && e.target.closest('button'))) { e.preventDefault(); begin(); return; }
    if (R.phase === 'diag' && /^[1-4]$/.test(e.key)) { e.preventDefault(); docPick(+e.key - 1); return; }
    if (R.phase === 'answer' && touch() && !(W.SGUI && typeof SGUI.keys === 'function')) { const i = EL.querySelector('.gym-in'); if (!i) return;
      if (/^[a-z]$/i.test(e.key)) { i.value += e.key.toLowerCase(); e.preventDefault(); } else if (e.key === 'Backspace') { i.value = i.value.slice(0, -1); e.preventDefault(); } else if (e.key === 'Enter') { e.preventDefault(); submit(i.value); } }
  } catch (_) {} });
  const flashMsg = t => { try { flash(t); } catch (e) {} };

  /* ------------------------------------------------------------------ the host */
  function size() { try { if (!EL || !EL.parentNode) return; const host = EL.parentNode;
      if (EL.querySelector('.sb-stage')) { if (host.style.height) host.style.height = ''; return; }
      const r = host.getBoundingClientRect();
      const rootEl = document.getElementById('root'); const z = parseFloat(getComputedStyle(rootEl).zoom) || 1;
      const bar = document.querySelector('nav.sb-tabbar'); const bb = bar && getComputedStyle(bar).display !== 'none' ? bar.getBoundingClientRect() : null;
      const bottom = (bb && bb.height > 0 && bb.top < innerHeight) ? bb.top : innerHeight;
      const top = r.top + (W.scrollY || 0) - (W.scrollY || 0);
      const h = Math.max(360, Math.floor((bottom - top - 8) / z));
      if (Math.abs((parseFloat(host.style.height) || 0) - h) > 1) host.style.height = h + 'px';
      /* the shell is at least 100dvh tall INSIDE #root's zoom, i.e. 9% taller than the screen, which
         is a scroll on every page; the gym's play must not scroll, so its page is exactly one screen */
      if (z !== 1) for (let a = host.parentNode; a && a !== rootEl; a = a.parentNode) if (a.style && a.style.minHeight) a.style.minHeight = (innerHeight / z) + 'px'; } catch (e) {} }
  addEventListener('resize', () => { if (EL && EL.isConnected) size(); });
  function mount(host) { const e = el(); if (e.parentNode !== host) host.appendChild(e);
    if (!e.innerHTML || VIEW === 'hub' || (R && (R.phase === 'ready' || R.phase === 'board' || R.phase === 'ward'))) paint(); else size();
    const i = e.querySelector('.gym-in'); if (i && !touch() && R && R.phase === 'answer' && document.activeElement !== i) { try { i.focus({ preventScroll: true }); } catch (_) {} } }

  function css() { if (document.getElementById('gym-css')) return; const s = document.createElement('style'); s.id = 'gym-css'; s.textContent = `
.gym-host{position:relative;width:100%;max-width:1280px;margin:0 auto}
.gym-fill{width:100%;height:100%;min-height:0;display:grid;place-items:center;container-type:size}
.gym-cline{display:flex;align-items:center;justify-content:center;gap:8px;min-width:0}
.gym-ctitle{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:0}
.gym-spacer{flex:none;width:44px;height:44px}
.gym-st .sg-st-c{max-width:min(62cqw,560px)}
.gym-root .sg-hub-grid.n7 .sg-hub-art{width:clamp(36px,9cqh,72px)}
.gym-art{display:grid;place-items:center;width:100%;height:100%;color:var(--treasure-deep,#8A5B00)}
.gym-art svg{width:58%;height:58%}
[data-mode="dusk"] .gym-art{color:var(--treasure,#F0B429)}
@container sgstage (max-width:640px){ .gym-root .sb-stage .sg-st-c{max-width:58cqw} .gym-cline{gap:3px} .gym-ctitle .sg-st-title{max-width:100%;font-size:14.5px;padding:6px 8px}
  .gym-root .gym-back,.gym-root .gym-spacer{width:40px;height:40px} }
.gym-stage .sg-st-n{font-family:var(--display);font-size:18px;font-weight:800;font-variant-numeric:tabular-nums}.gym-stage .sg-st-t{font-size:11.5px;color:var(--muted);font-weight:700}
.gym-stage .sg-st-ic{display:grid;place-items:center}
.sb-content:has(> .sb-gympage){padding-bottom:0!important}
.gym-root{--gym-act:linear-gradient(180deg,color-mix(in srgb,var(--action,var(--accent)) 82%,#fff),var(--action,var(--accent)) 55%,color-mix(in srgb,var(--action,var(--accent)) 84%,#000))}
.gym-root{height:100%}
.gym-stage{position:relative;height:100%;display:grid;grid-template-rows:auto minmax(0,1fr) auto;border-radius:20px;overflow:hidden;isolation:isolate;color:var(--text);
  background:var(--gym-plate,none) center/cover no-repeat,linear-gradient(100deg,rgba(255,240,210,.10),rgba(60,30,0,.10) 50%,rgba(255,240,210,.10)),radial-gradient(150% 130% at 50% 0%,#F7DDA6 0%,#E7B66E 34%,#B97A3E 66%,#7A4A26 100%)}
[data-mode="dusk"] .gym-stage{background:var(--gym-plate,none) center/cover no-repeat,linear-gradient(100deg,rgba(150,130,255,.08),rgba(0,0,0,.10) 50%,rgba(150,130,255,.08)),radial-gradient(150% 130% at 50% 0%,#3B2F5E 0%,#2A2148 36%,#1C1633 66%,#120E22 100%)}
.gym-hud{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:10px;padding:8px 12px;background:linear-gradient(90deg,color-mix(in srgb,var(--bz-card,var(--bg2)) 78%,transparent),color-mix(in srgb,var(--bz-card,var(--bg2)) 92%,transparent) 50%,color-mix(in srgb,var(--bz-card,var(--bg2)) 78%,transparent));backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.gym-hl{display:flex;align-items:center;gap:10px;justify-self:stretch;min-width:0}
.gym-hr{display:flex;align-items:center;gap:10px;justify-content:flex-end;min-width:0;text-align:right}
.gym-hc{text-align:center;min-width:0}
.gym-title{margin:0;font-family:var(--display);font-weight:800;font-size:clamp(17px,2.4vw,22px);line-height:1.1}
.gym-chips{display:flex;gap:6px;justify-content:center;margin-top:4px;flex-wrap:wrap}
.gym-stat{display:inline-flex;flex-direction:column;line-height:1.05;font-variant-numeric:tabular-nums}
.gym-stat b{font-family:var(--display);font-size:20px}.gym-stat small{font-size:11px;color:var(--muted);font-weight:700}
.gym-back{flex:none;display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;padding:0;border-radius:999px;background:color-mix(in srgb,var(--surface2,#fff) 80%,transparent);border:1px solid var(--line);font-weight:800;font-size:13px;color:var(--text)}
.gym-play{display:grid;place-items:center;padding:12px;min-height:0;overflow:auto;container-type:size}
.gym-stage .sg-endcard{background:color-mix(in srgb,var(--bz-card,var(--bg2)) 88%,transparent);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid color-mix(in srgb,var(--line) 70%,transparent);box-shadow:0 10px 30px rgba(40,20,0,.18);max-width:min(560px,100%)}
.gym-ctl{padding:8px 12px 10px;display:flex;flex-direction:column;align-items:center;gap:8px;background:linear-gradient(90deg,color-mix(in srgb,var(--bz-card,var(--bg2)) 55%,transparent),color-mix(in srgb,var(--bz-card,var(--bg2)) 80%,transparent) 50%,color-mix(in srgb,var(--bz-card,var(--bg2)) 55%,transparent));backdrop-filter:blur(6px)}
.gym-ctl:empty{display:none}
.gym-card{position:relative;width:min(560px,100%);min-height:min(52%,340px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;border-radius:22px;padding:clamp(14px,3vw,24px);text-align:center}
.gym-stage .gym-card,.gym-stage .gym-sq{background:linear-gradient(165deg,color-mix(in srgb,var(--bz-card,var(--bg2)) 94%,transparent),color-mix(in srgb,var(--bz-card,var(--bg2)) 80%,transparent));-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid color-mix(in srgb,var(--line) 70%,transparent);box-shadow:0 10px 30px rgba(40,20,0,.18)}
.gym-card h3{margin:0;font-family:var(--display);font-size:22px}.gym-card p{margin:0;line-height:1.5}
.gym-big-ic{width:72px;height:72px;border-radius:20px;display:grid;place-items:center;background:var(--gym-act);color:var(--action-ink,#fff)}
.gym-hear{display:inline-flex;align-items:center;gap:10px;min-height:56px;padding:10px 22px;border-radius:999px;background:var(--gym-act);color:var(--action-ink,#fff);font-weight:800;font-size:17px;box-shadow:var(--edge)}
.gym-def{color:var(--text);font-size:15px;max-width:34em}.gym-hint{font-size:14px;color:var(--muted)}
.gym-ask{font-weight:800;color:var(--muted);font-size:13px;letter-spacing:.02em}
.gym-in{width:min(420px,100%);text-align:center;padding:12px;border-radius:14px;background:var(--surface);border:2px solid var(--line);color:var(--text);font-family:var(--entry,inherit);font-weight:800;font-size:clamp(20px,5vw,28px);letter-spacing:.08em;outline:none}
.gym-in:focus{border-color:var(--action,var(--accent))}
.gym-nudge{min-height:1em;font-size:12.5px;font-weight:700;color:var(--muted)}
.gym-acts{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.gym-btn{min-height:44px;padding:10px 18px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:14px;display:inline-flex;align-items:center;gap:7px;justify-content:center}
.gym-btn.go{background:var(--gym-act);color:var(--action-ink,#fff);border-color:transparent;box-shadow:var(--edge)}
.gym-btn[disabled]{opacity:.6}
.gym-btn.up{margin-top:10px}
.gym-tools{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.gym-pill{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:6px 14px;border-radius:999px;background:color-mix(in srgb,var(--surface2,#fff) 85%,transparent);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:13px}
@container sgstage (max-width:640px){ .gym-root .sg-hub-grid.n7 .sg-hub-promise{display:none} }
.gym-keys{width:min(560px,100%);display:flex;flex-direction:column;gap:6px}
.gym-krow{display:flex;gap:4px;justify-content:center}
.gym-k{flex:1 1 0;min-width:0;max-width:52px;height:44px;border-radius:9px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:18px;text-transform:lowercase}
.gym-k.wide{flex:1.5 1 0;max-width:72px}.gym-k.go{background:var(--gym-act);color:var(--action-ink,#fff)}
.gym-bar{position:absolute;left:14px;right:14px;top:8px;height:5px;border-radius:9px;background:color-mix(in srgb,var(--line) 70%,transparent);overflow:hidden}
.gym-bar>i{display:block;height:100%;background:var(--action,var(--accent));transform-origin:left center}
.gym-lvl{display:inline-flex;align-items:center;min-height:28px;padding:3px 10px;border-radius:999px;background:var(--chip,var(--surface2));border:1px solid var(--line);font-weight:800;font-size:12px;color:var(--text)}
.gym-tier{display:inline-flex;align-items:center;padding:3px 9px;border-radius:999px;font-size:11.5px;font-weight:800;color:var(--muted);border:1px dashed var(--line)}
.gym-hub{width:min(980px,100%);display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;align-content:center}
.gym-tile{position:relative;display:flex;flex-direction:column;border-radius:18px;background:linear-gradient(165deg,color-mix(in srgb,var(--bz-card,var(--bg2)) 94%,transparent),color-mix(in srgb,var(--bz-card,var(--bg2)) 78%,transparent));backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid color-mix(in srgb,var(--line) 70%,transparent);box-shadow:0 6px 18px rgba(40,20,0,.14)}
.gym-tile.wide{grid-column:1/-1}
.gym-tile-go{display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto auto;column-gap:12px;row-gap:3px;text-align:left;padding:14px 14px 12px;color:var(--text);flex:1}
.gym-tile-art{grid-row:1/4;position:relative;width:54px;height:54px;border-radius:16px;display:grid;place-items:center;background:var(--gym-act);color:var(--action-ink,#fff)}
.gym-tile.locked .gym-tile-art{background:var(--surface2);color:var(--muted)}
.gym-new{position:absolute;top:-3px;right:-3px;width:12px;height:12px;border-radius:50%;background:#E8458C;border:2px solid var(--bg2,#fff)}
.gym-tile-t{font-family:var(--display);font-weight:800;font-size:16px}.gym-lastm{font-size:11px;color:var(--muted);font-weight:700}
.gym-tile-p{font-size:12.5px;color:var(--muted);line-height:1.4}.gym-tile-b{font-size:12px;font-weight:800;color:var(--text)}
.gym-tile-lv{position:absolute;top:10px;right:10px}
.gym-board-wrap{display:flex;flex-direction:column;align-items:center;gap:10px;width:min(540px,100%)}
.gym-board{width:min(480px,100cqw - 24px,100cqh - 64px);display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.gym-sq{aspect-ratio:1;border-radius:14px;padding:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;text-align:center;font-weight:800;font-size:clamp(11px,2.6vw,14px);line-height:1.2;color:var(--text)}
.gym-sq.done{background:linear-gradient(165deg,color-mix(in srgb,var(--good) 80%,#fff),var(--good) 60%,color-mix(in srgb,var(--good) 85%,#000));color:#fff;border-color:transparent}.gym-sq small{font-size:11px;color:var(--muted)}
.gym-celeb{font-family:var(--display);font-weight:800;font-size:17px;color:var(--good)}
.gym-quiet{font-size:13px;color:var(--muted);font-weight:700;display:inline-flex;gap:6px;align-items:center}
.gym-sent{font-size:clamp(17px,2.6vw,21px);line-height:2;max-width:32em}
.gym-tok{display:inline;padding:2px 5px;margin:0 1px;border-radius:7px;border:1px dashed color-mix(in srgb,var(--line) 90%,transparent);background:transparent;color:var(--text);font:inherit;min-height:34px}
.gym-tok.bad{background:color-mix(in srgb,var(--bad) 18%,transparent);border-color:var(--bad)}
.gym-dx{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;width:100%}
.gym-dxmiss{text-align:left;padding:12px 14px;border-radius:14px;background:var(--surface);border:1.5px solid var(--line)}
.gym-pts{list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:6px;justify-content:center}.gym-pts li{display:inline-flex;gap:5px;align-items:center;font-size:12.5px;font-weight:700;padding:4px 10px;border-radius:999px;background:var(--surface2)}
.gym-typo{font-family:var(--mono,monospace);text-decoration:line-through;color:var(--bad)}
.gym-ready .gym-readylv{display:flex;gap:8px;align-items:center;font-weight:800;font-size:13px}
@media (max-width:719px){.gym-hub{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.gym-tile-go{grid-template-columns:1fr;padding:10px 10px 9px}.gym-tile-art{grid-row:auto;width:40px;height:40px;border-radius:12px}.gym-tile-p{display:none}.gym-tile.wide .gym-tile-p{display:block}
  .gym-stat b{font-size:17px}.gym-stat small{font-size:10px}.gym-back{min-width:44px;justify-content:center;padding:6px 8px}.gym-back-l{display:none}.gym-card{min-height:0}.gym-hud{gap:6px;padding:6px 8px}
  .gym-hc .gym-title{font-size:17px}.gym-lvl,.gym-tier{font-size:10.5px;padding:2px 7px;min-height:0}}
@media (prefers-reduced-motion:reduce){.gym-stage *{animation:none!important;transition:none!important}}
[data-motion="off"] .gym-stage *{animation:none!important;transition:none!important}
`; document.head.appendChild(s); }

  /* ------------------------------------------------------------------ the doors */
  W.SB_HUB_OPEN = W.SB_HUB_OPEN || {};
  W.SB_HUB_OPEN.gym = id => app.openGym(id);
  if (typeof app.hubMode !== 'function') app.hubMode = arg => { const p = String(arg || '').split('/'); const f = (W.SB_HUB_OPEN || {})[p[0]]; if (typeof f === 'function') f(p[1]); };
  W.SB_GYM = {
    open, mount, stop, MODES: MODES.map(m => m.id),
    live: () => !!(R && /^(answer|tap|miss|diag|diagno)$/.test(R.phase) && VIEW === 'play'),
    /* for the tests: what is on screen and where the round stands — never drawn */
    peek: () => R ? { mode: R.mode, phase: R.phase, view: VIEW, word: R.cur && R.cur.w, asked: R.asked, right: R.right, level: R.level, tier: R.tier,
      left: R.clock ? R.clock.left : null, held: R.clock ? R.clock.held : null, t0: R.started || null, t1: R.ended || null, pct: R.pct, lv: R.lv, pass: R.pass,
      bad: R.spot ? R.spot.toks.findIndex(t => t.bad) : -1, claimed: R.claimed, board: R.board ? R.board.map(c => c.done) : null,
      pat: R.pat ? { k: R.pat.k, cur: R.pat.cur, opts: R.opts && R.opts.map(o => o[0]) } : null, patients: R.patients ? R.patients.length : null, coins: R.coins } : { view: VIEW },
    hubName, docType, misspell, TYPES: TYPES.map(t => t[0]),
    /* for the tests only: bring a timed round's end close (the clock itself is what T4 measures) */
    _clock: s => { const C = R && R.clock; if (!C || C.over) return; if (C.add) C.add(-Math.max(0, C.left - (+s || 0))); else C.used = Math.max(C.used, (C.total - (+s || 0)) * 1000); }
  };
})();
