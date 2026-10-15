/* THE BEE CIRCUIT'S HALLS ON A SIMULATED CLOCK (circuit/BEE-CIRCUIT.md §3.5, §13 tests 6; script.json build rules
   hall-fields, scripted-outcomes, no-placing) — node, ~20 s (10 seeds; HALL_SEEDS=50 is the rule's full 50-seed run, ~3 min)

   mockbee.js runs in a node VM against the real word data, with app3's globals stubbed, a FAKE CLOCK underneath
   (eight minutes of bee in milliseconds) and a stub of window.SB_CIRCUIT that records every call — the Circuit
   itself (circuit.js) is another file's; the integrator re-runs this against the real one. Each hall is opened the
   way the Atlas opens it, app.mbOpen({venue, family, seed}), and played by bots at the microphone:
     win     spells every word, asks nothing
     out     spells round one, then misses its first word after it (and every word after)
     random  types random letters
     silent  types nothing at all

   What it holds (each line names the rule):
     TABLES      mockbee's hall table, fields, venues and headliners are script.json's, to the id
     FIELDS      hall-fields: for every band and round the seated field is fields[band][n] plus the child; Vesper
                 is never seated before Round IX; the invitation's chairs are kept (I: Pip 2, Nova 3 · III: Rafi 4
                 · IV: Mira 1 · IX: Vesper 1); in Round V the child sits beside Kwame; Dax seated in IX in every band
     SCRIPT      scripted-outcomes, on every seed, band and bot: I Pip blurts and is forgiven, then misses his first
                 word after round one and sits down for good · II Theo uses every request on one turn and spells it
                 right, and asks the part of speech on several words, never twice on one · III Rafi among the last
                 three or at the cap · IV Mira asks the origin every turn, thunder on her Greek-first word, told
                 Greek · V Kwame's first word after round one is reconnaissance, missed by one s, and he leaves at
                 once · VI Ines and Kwame both in the last three · VII triskaidekaphobia to Suki, five requests, origin
                 'English', right — and never dealt to the child · VIII Dax right in round one, a miss later, never at
                 the cap, a cut to the result · IX the lights go out halfway with Dax (and Pip) standing, Dax's next
                 turn a definition request, every rival turn after it a request, Vesper asks the origin and her tell
                 is never read again, Vesper outlasts every other rival, and the championship word goes as the
                 script says
     PLACING     no-placing: the letter is placed against the round's letter-writer (Nova in Round I); a child at the
                 cap counts above, and Rounds I–VIII never end in a title shared with that headliner (the headliner's
                 forced last miss is in the log first)
     WORDS       every word through nextWords; 60 / 25 / 15 (the region's words, the revision pile, one band up) —
                 the region's words lead the child's words when the stops hand over enough of them
     PAY (§13 t6) the random and silent bots earn 0 coins in every hall; the winning bot earns only answer coins
                 and the contest event, and the finish card says what the ledger took; nothing pays for finishing
     REPORT      SB_CIRCUIT.onHall(act, {place, of, words, missed, replay, …}) once per finished hall, after
                 lazyNeed('circuit'), in the shape circuit.js reads (words[].asks, asks counted as build[slots] says —
                 "Say it again" included — asked[], headPlace, above, spelled, lastMissed); a quit hall reports nothing;
                 a build with no SB_CIRCUIT plays the same
     RANDOM      not one Math.random() call in any hall
   Exported for tests/circuit-team.cjs: world, drive, hall (the harness).

   Proved by breaking — MB_SRC=<a scratch copy of mockbee.js with ONE change> (the tree never touched), HALL_SEEDS=4,
   each watched to fail:
     Pip never sits down after round one ............................... SCRIPT I fails (24 of 216 halls)
     Kwame's slip one n short, not one s ................................ SCRIPT V's slip check fails — and FIRST it did
                                                                          not: the check only asked that he missed; it now
                                                                          reads what the stage showed ("reconnaisance")
     Vesper seated in Round VIII (8–10) ................................. TABLES and FIELDS fail
     the cap never forcing the headliner's last miss .................... both CAP checks fail
     the contest event paid for finishing (no podium test) .............. both PAY checks fail (random/silent earn 10)
     no family words in the draw (60% → 0) .............................. WORDS fails (0 + 5 of 20)
     a quit hall reporting ............................................... REPORT fails
     SB_CIRCUIT called without lazyNeed('circuit') first ................ REPORT fails (216 of 216)
     a rival's word decided by Math.random() ............................ both RANDOM checks and "no SB_CIRCUIT plays the
                                                                          same" fail
     "Say it again" left out of the asks count ........................... the asks check fails (5 over 5 words, not 15)
     the headliner's place left out of the report ....................... the shape check fails (every hall)
   Run: node tests/circuit-halls.cjs                                                                         */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const APP = path.resolve(__dirname, '..');
const SRC = process.env.MB_SRC || path.join(APP, 'mockbee.js');
const SEEDS = +process.env.HALL_SEEDS || 10;
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean);
const on = k => !ONLY.length || ONLY.indexOf(k) >= 0;

/* ---------------- the data, loaded once ---------------- */
const DATA = (() => {
  const ctx = { window: null }; ctx.window = ctx; vm.createContext(ctx);
  for (const f of ['words-data.js', 'words-data-2.js', 'words-data-s.js', 'coach-rules.js', 'sounds-data.js', 'nsf-vocab26-data.js']) {
    try { vm.runInContext(fs.readFileSync(path.join(APP, f), 'utf8'), ctx, { filename: f }); } catch (e) { console.log('  (could not load ' + f + ': ' + e.message + ')'); }
  }
  const S = ctx.SB_SENT_BOOT || [];
  const by = new Map(); (ctx.SB_DATA.nsf || []).forEach(r => { if (r && r.w && !by.has(r.w)) by.set(r.w, r); });
  for (const [w, s] of S) { const r = by.get(w); if (r && !r.s && s) r.s = s; }
  ctx.BY = by;
  return ctx;
})();
const HOMS = (() => { const m = new Map(); for (const grp of (DATA.SB_HOM || [])) for (const w of grp) m.set(w, grp.filter(x => x !== w)); return m; })();
/* nextWords as the door draws for these purposes, on its OWN seeded generator (the bee's Math.random count stays the
   bee's): a y window per level, one tier up or down, the caller's filter; 'review' is the child's own pile. Every
   call is logged, so WORDS can see that nothing reached the bee any other way. */
const BY_Y = (() => { const by = {}; for (const w of DATA.SB_DATA.nsf || []) { if (!w || !w.w || !w.d || w.d.length <= 4 || !/^[a-z]{3,}$/.test(w.w)) continue;
  (by[w.y || 3] = by[w.y || 3] || []).push(w); } return by; })();
const Y_OF = { easy: [1, 3], medium: [3, 5], hard: [4, 7], champ: [6, 9], auto: [1, 6] };
const WIN = {};
function mkNextWords(seed, log, review) {
  let a = seed >>> 0; const r = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return (c, n, o) => { o = o || {}; log.push(o);
    let pool;
    if (o.purpose === 'review') pool = review.slice();
    else { const band = (c && c.ageBand) || '8-10';
      const lv = Y_OF[o.level] ? o.level : band === '5-7' ? 'easy' : band === '8-10' ? 'medium' : 'hard';
      const t = Math.max(-1, Math.min(1, o.tier | 0)); const lo = Math.max(1, Y_OF[lv][0] + t), hi = Math.min(9, Y_OF[lv][1] + t);
      pool = WIN[lo + '-' + hi] || (WIN[lo + '-' + hi] = [].concat(...Array.from({ length: hi - lo + 1 }, (_, i) => BY_Y[lo + i] || []))); }
    const keep = w => (typeof o.filter !== 'function' || o.filter(w)) && (!o.needDef || (w.d && w.d.length > 4));
    const out = []; const seen = new Set(); let guard = 0;
    /* the door filters, then samples; sampling first and filtering what it meets is the same draw, faster — and when
       the filter is narrow the whole pool is filtered after all */
    while (out.length < n && pool.length && guard++ < 300) { const w = pool[Math.floor(r() * pool.length)]; if (!seen.has(w.w) && keep(w)) { seen.add(w.w); out.push(w); } }
    if (out.length < n) { const rest = pool.filter(w => !seen.has(w.w) && keep(w)); guard = 0;
      while (out.length < n && rest.length && guard++ < n * 40) { const w = rest[Math.floor(r() * rest.length)]; if (!seen.has(w.w)) { seen.add(w.w); out.push(w); } } }
    return out; };
}

/* ---------------- one hall world: a VM with a fake clock ---------------- */
function world(opts) {
  opts = opts || {};
  let now = Date.UTC(2026, 9, 15, 18, 0, 0) + (opts.t0 || 0);
  let seq = 0; const timers = [];
  const setT = (fn, ms) => { const id = ++seq; timers.push({ id, at: now + Math.max(0, +ms || 0), fn }); return id; };
  const clearT = id => { const i = timers.findIndex(t => t.id === id); if (i >= 0) timers.splice(i, 1); };
  const FakeDate = class extends Date { constructor(...a) { if (a.length) super(...a); else super(now); } static now() { return now; } };
  const ledger = [], sfxs = [], band = [], mastered = [], missed = [], gameLog = [], doors = [], circ = [], lazy = [];
  let randomCalls = 0;
  const child = { name: 'Ahana', age: opts.age || 9, ageBand: opts.ageBand || '8-10', avatar: opts.avatar || 'panda', coins: 0, mast: opts.mast || {} };
  const mem = {};
  const review = (opts.review || []).map(w => DATA.BY.get(w)).filter(Boolean);
  const ctx = {
    console, Math: Object.create(Math), JSON, Object, Array, String, Number, Set, Map, RegExp, Promise, Error, isNaN, parseInt,
    Date: FakeDate, setTimeout: setT, clearTimeout: clearT,
  };
  ctx.Math.random = () => { randomCalls++; return Math.random(); };
  ctx.window = ctx;
  Object.assign(ctx, {
    SB_DATA: DATA.SB_DATA, SB_COACH_RULES: DATA.SB_COACH_RULES, SB_ALT_PRON: DATA.SB_ALT_PRON, SB_HOM: DATA.SB_HOM, SB_VOCAB26: DATA.SB_VOCAB26,
    state: { nav: 'home', screen: 'app', voiceRate: 1, calmMode: false, children: [child] },
    app: {},
    document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] },
    addEventListener: () => {}, scrollTo: () => {},
    Audio: class { constructor(src) { this.src = src; } play() { setT(() => this.onended && this.onended(), 1100); return Promise.resolve(); } pause() {} },
    SpeechSynthesisUtterance: class { constructor(t) { this.text = t; } },
    speechSynthesis: { speak: u => setT(() => u.onend && u.onend(), 650), cancel: () => {} },
    active: () => child,
    save: () => {},
    render: () => { ctx._renders = (ctx._renders || 0) + 1; ctx._html = ctx.MOCKBEE ? ctx.MOCKBEE.view() : ''; },
    addCoins: ev => { const n = { answer: 1, stop: 5, contest: 10, mastery: 20 }[ev] || 0; if (n) ledger.push(ev); return n; },
    payG: g => { const n = ctx.addCoins('answer'); if (g) g.bonus = (g.bonus || 0) + n; return n; },
    sfx: k => sfxs.push(k), burstConfetti: () => {},
    logBand: (w, okk) => band.push([w.w, okk]), markMastered: k => mastered.push(k), mastEvidence: (k, o) => { if (!o) missed.push(k); },
    mastIsMastered: r => !!(r && r.b >= 2),
    addMiss: (w, mark) => missed.push('pile:' + w.w + ':' + mark),
    logGameWord: k => gameLog.push(k), recentGameKeys: () => new Set(),
    nkey: w => String(w || '').toLowerCase().trim(),
    sameSpelling: (a, b) => String(a || '').toLowerCase().trim() === String(b || '').toLowerCase().trim(),
    maskTxt: (t, w) => String(t || '').replace(new RegExp(String(w).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig'), '_____'),
    missFeedbackHTML: () => '<div class="sb-miss"></div>',
    esc: s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
    escA: s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
    iconSVG: () => '<svg></svg>', SB_AVATAR: id => '<img src="avatars/' + id + '.webp">', fmtN: n => String(n),
    wordClip: t => 'voice/w/' + t + '.mp3', gameWordsD: () => [], vocBuildCheck: () => null,
    nextWords: mkNextWords(4242 + (opts.t0 || 0), doors, review),
    homPartners: w => HOMS.get(String(w).toLowerCase()) || [],
    altPron: w => { const o = DATA.SB_ALT_PRON || {}; const k = String(w).toLowerCase(); return Object.prototype.hasOwnProperty.call(o, k) ? o[k] : null; },
    SB_STORE: { getJSON: (k, d) => (k in mem ? JSON.parse(mem[k]) : d), setJSON: (k, v) => { mem[k] = JSON.stringify(v); } },
    SB_TRICK: { diff: w => String(w.w || '').length + (w.y || 3) },
    lazyNeed: (what, cb) => { lazy.push(what); if (cb) cb(); },
  });
  if (opts.circuit !== false) ctx.SB_CIRCUIT = {
    onHall: (act, r) => circ.push({ fn: 'onHall', act, r: JSON.parse(JSON.stringify(r)), lazyFirst: lazy[lazy.length - 1] === 'circuit' }),
    onTeamNight: r => circ.push({ fn: 'onTeamNight', r: JSON.parse(JSON.stringify(r)), lazyFirst: lazy[lazy.length - 1] === 'circuit' }),
    hallFiled: act => circ.push({ fn: 'hallFiled', act }),
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(SRC, 'utf8'), ctx, { filename: 'mockbee.js' });
  const W = {
    ctx, A: ctx.app, S: ctx.state, child, ledger, sfxs, band, mastered, missed, doors, circ, lazy, mem,
    get now() { return now; }, get random() { return randomCalls; },
    run(cond, limit) {
      const end = now + (limit || 40 * 60 * 1000);
      while (timers.length && !(cond && cond())) {
        timers.sort((a, b) => a.at - b.at || a.id - b.id);
        const t = timers.shift(); if (t.at > end) { timers.unshift(t); break; }
        now = Math.max(now, t.at);
        t.fn();
      }
      return cond ? !!cond() : true;
    },
    later: (ms, fn) => setT(fn, ms),
  };
  return W;
}

/* ---------------- the bots at the microphone ---------------- */
function drive(W, kind, o) {
  o = o || {};
  const { A, S } = W; let last = '';
  let rs = 977 + (o.t0 || 0); const rndL = () => { rs = (rs * 16807) % 2147483647; return 'abcdefghijklmnopqrstuvwxyz'[rs % 26]; };
  const wrong = w => { let s = ''; for (let i = 0; i < Math.max(3, String(w).length); i++) s += rndL(); return s === w ? s + 'q' : s; };
  const tick = () => {
    const g = S.mb;
    if (!g || g.view === 'result') return;
    const key = [g.phase, g.round, g.turn, g.clock && g.clock.tok, g.c9 && g.c9.mode, g.atMic && g.atMic.n].join('|');
    if (key !== last) {
      last = key;
      const ph = g.phase;
      if (ph === 'me') {
        const w = g.word.w;
        const miss = kind === 'random' || kind === 'silent' || (kind === 'out' && g.round >= 1 && !g.c9) || (o.missC9 && !!g.c9);
        if (o.ask) o.ask.forEach(k => A.mbAsk(k));                                   /* the Pronouncer's Chair, first */
        W.later(3000, () => { if (S.mb !== g || g.phase !== 'me') return; A.mbType(kind === 'silent' ? '' : miss ? wrong(w) : w); A.mbSpell(); });
      } else if (ph === 'meDone' && g.hold) W.later(1500, () => A.mbGoOn());
      else if (ph === 'outChoice') W.later(1200, () => (o.out === 'watch' ? A.mbWatch() : A.mbFinishNow()));
    }
    W.later(100, tick);
  };
  W.later(100, tick);
}
const ACTS = ['meadow', 'library', 'forum', 'storm', 'roots', 'strait', 'junkyard', 'sprints', 'stage'];
const AGE = { '6-7': ['5-7', 6], '8-10': ['8-10', 9], '11-15': ['11-13', 12] };
function hall(o) {
  const [ab, age] = AGE[o.band || '8-10'];
  const W = world({ ageBand: ab, age, t0: o.t0 || 0, circuit: o.circuit, review: o.review, avatar: o.avatar });
  W.A.mbOpen({ venue: o.act, family: o.family || [], seed: o.seed, replay: o.replay });
  const lobby = W.S.mb;
  W.A.mbStart();
  const g0 = W.S.mb;
  if (o.quitAt) { W.run(() => W.S.mb && W.S.mb.round >= o.quitAt, 10 * 60 * 1000); W.A.mbQuit(); return { W, g: g0, lobby, quit: true }; }
  drive(W, o.bot || 'win', o);
  const start = W.now;
  W.run(() => !W.S.mb || W.S.mb.view === 'result', 60 * 60 * 1000);
  return { W, g: W.S.mb, g0, lobby, ms: W.now - start };
}
module.exports = { world, drive, hall, DATA, ACTS, AGE };
if (require.main !== module) return;

/* ---------------- what each hall must show ---------------- */
const S = require(path.join(APP, 'circuit', 'script.json'));
const BR = id => S.build.find(b => b.id === id);
const FIELDS = BR('hall-fields').fields;
const has = (g, k, f) => (g.hallLog || []).some(e => e.k === k && (!f || f(e)));
const seat = (g, id) => (g.field.find(s => s.kind === 'bot' && s.bot.id === id) || {}).n;
const me = g => g.field.find(s => s.kind === 'me');
const bot = (g, id) => g.field.find(s => s.kind === 'bot' && s.bot.id === id);
const placeOf = (g, s) => (g.places.find(x => x.s === s) || {}).place;

if (on('TABLES')) {
  const W = world({}); const C = W.ctx.MOCKBEE.circuit;
  const halls = C.halls(), fields = C.fields();
  const rows = S.rounds.map(r => { const h = halls[r.act] || {}; const sameVenue = String(h.venue || '').replace(/’/g, "'") === r.venue;
    return h.n === r.n && sameVenue && JSON.stringify(h.head) === JSON.stringify(r.headliners) && JSON.stringify(h.also || []) === JSON.stringify(r.alsoSeated || []); });
  ok(rows.every(Boolean) && Object.keys(halls).join() === S.rounds.map(r => r.act).join(), 'TABLES: nine halls in the Atlas order; each round\'s act, venue, headliners and alsoSeated are script.json\'s');
  const fbad = []; for (const b of Object.keys(FIELDS)) for (const n of Object.keys(FIELDS[b])) if ((fields[b] || {})[n] && fields[b][n].join() !== FIELDS[b][n].join()) fbad.push(b + '/' + n);
  ok(!fbad.length && Object.keys(fields).join() === Object.keys(FIELDS).join(), 'TABLES: the hall fields are build[hall-fields].fields, every band and round' + (fbad.length ? ' — ' + fbad.join(', ') : ''));
  const cast = S.cast; const bots = W.ctx.MOCKBEE.faces().map(f => f.id);
  const tells = W.ctx.MOCKBEE.rivals().every(r => cast[r.id] && cast[r.id].name === r.name && cast[r.id].age === r.age);
  ok(tells && bots.every(id => cast[id]), 'TABLES: every rival a hall seats is the script\'s cast — names and ages unchanged');
}

if (on('FIELDS')) {
  const bad = []; let n = 0;
  for (const band of Object.keys(AGE)) for (const act of ACTS) for (let s = 0; s < 3; s++) {
    const W = world({ ageBand: AGE[band][0], age: AGE[band][1], t0: s });
    W.A.mbOpen({ venue: act, seed: 100 + s }); W.A.mbStart(); const g = W.S.mb; n++;
    const r = S.rounds.find(x => x.act === act).n;
    const ids = g.field.filter(x => x.kind === 'bot').map(x => x.bot.id).sort().join();
    if (ids !== FIELDS[band][r].slice().sort().join()) bad.push(`${band} ${act}: seated ${ids} vs ${FIELDS[band][r].join()}`);
    if (r < 9 && bot(g, 'goldlegend')) bad.push(`${band} ${act}: Vesper seated before Round IX`);
    if (!me(g) || g.field.length !== FIELDS[band][r].length + 1) bad.push(`${band} ${act}: the child is not seated once`);
    const chairs = { 1: { pixel: 2, koi: 3 }, 3: { beaker: 4 }, 4: { astro: 1 }, 9: { goldlegend: 1 } }[r] || {};
    for (const [id, c] of Object.entries(chairs)) if (seat(g, id) !== c) bad.push(`${band} ${act}: ${id} in chair ${seat(g, id)}, not ${c}`);
    if (r === 5 && Math.abs(me(g).n - seat(g, 'samurai')) !== 1) bad.push(`${band} roots: the child (chair ${me(g).n}) is not beside Kwame (chair ${seat(g, 'samurai')})`);
    if (r === 9 && !bot(g, 'comet')) bad.push(`${band} stage: Dax not seated`);
    const own = W.ctx.MOCKBEE.bands()[band].ids; const top = Math.max(...own.map(id => W.ctx.MOCKBEE.rivals().find(x => x.id === id) && 0 || 0));
    W.A.mbQuit();
  }
  ok(!bad.length, `FIELDS: ${n} halls (3 bands × 9 rounds × 3 seeds): the seated field is fields[band][n] plus the child, Vesper only in IX, the invitations' chairs kept, the child beside Kwame in V, Dax in every final` + (bad.length ? ' — ' + bad.slice(0, 4).join(' · ') : ''));
}

/* ---------------- SCRIPT, PLACING, PAY, REPORT: every hall, band, bot and seed ---------------- */
const runs = [];
if (on('SCRIPT') || on('PLACING') || on('PAY') || on('REPORT') || on('RANDOM')) {
  for (const act of ACTS) for (const band of Object.keys(AGE)) for (const bt of ['win', 'out']) for (let s = 0; s < SEEDS; s++) {
    const r = hall({ act, band, bot: bt, seed: 7000 + s * 131 + ACTS.indexOf(act), t0: s, review: ['separate', 'necessary', 'rhythm', 'believe', 'library'] });
    runs.push(Object.assign({ act, band, bot: bt, s }, r));
  }
  console.log(`       played ${runs.length} halls (${ACTS.length} rounds × 3 bands × 2 bots × ${SEEDS} seeds)`);
}
const fl = (pred) => runs.filter(x => !pred(x));
const say = (bad) => bad.length ? ' — ' + bad.slice(0, 4).map(x => `${x.act}/${x.band}/${x.bot}/${x.s}`).join(' · ') + ` (${bad.length} of ${runs.length})` : '';
const of = act => runs.filter(x => x.act === act);
if (on('SCRIPT')) {
  const done = fl(x => x.g && x.g.view === 'result');
  ok(!done.length, 'SCRIPT: every hall plays to its result card' + say(done));
  let b;
  b = of('meadow').filter(x => !(has(x.g, 'blurt', e => e.round === 0) && has(x.g, 'pipOut', e => e.round >= 1) && !bot(x.g, 'pixel').in && bot(x.g, 'pixel').hist[0] === false && bot(x.g, 'pixel').gone));
  ok(!b.length, 'SCRIPT I: Pip blurts his round-one word and is forgiven, then misses his first word after round one and sits down for good' + say(b));
  /* Theo's turns at the microphone (a rival resolved at once, after the child chose Finish now, is not a turn on screen) */
  b = of('library').filter(x => { const L = x.g.hallLog || []; const all = L.find(e => e.k === 'theoAll'); const turns = L.filter(e => e.k === 'turn' && e.who === 'scopey');
    return !(all && all.asks.length === all.of && all.of >= 3 && has(x.g, 'theoRight') && turns.length >= 1 && turns.every(e => e.asks.filter(k => k === 'ps').length === 1)); });
  ok(!b.length, 'SCRIPT II: Theo uses every request the Chair holds on one turn and spells it right; on every turn of his at the microphone he asks the part of speech, never twice on one word' + say(b));
  b = of('forum').filter(x => !(has(x.g, 'rafiLast3') || bot(x.g, 'beaker').in));
  ok(!b.length, 'SCRIPT III: Rafi is among the last three rivals standing, or stands at the end' + say(b));
  b = of('storm').filter(x => { const L = x.g.hallLog || []; const turns = L.filter(e => e.k === 'turn' && e.who === 'astro'); const th = L.find(e => e.k === 'thunder');
    return !(th && has(x.g, 'miraGreek', e => e.origin === 'Greek' && e.w === th.w) && turns.length >= 1 && turns.every(e => e.asks.includes('org')) && turns.some(e => e.w === th.w && e.ok)); });
  ok(!b.length, 'SCRIPT IV: Mira asks the origin on every turn; thunder on her Greek-first word, and she is told Greek and spells it' + say(b));
  b = of('roots').filter(x => { const k = bot(x.g, 'samurai'); const e = (x.g.hallLog || []).find(z => z.k === 'kwameCrack');
    return !(e && e.w === 'reconnaissance' && e.round >= 1 && !k.in && k.gone && x.g.mine.every(m => m.w !== 'reconnaissance')); });
  ok(!b.length, 'SCRIPT V: Kwame\'s first word after round one is reconnaissance; he misses it and leaves the field at once (never brought back)' + say(b));
  { const seen = of('roots').map(x => (x.g.hallLog || []).find(e => e.k === 'turn' && e.who === 'samurai' && e.w === 'reconnaissance' && !e.sim)).filter(Boolean);
    const bad = seen.filter(e => e.ok || e.said !== 'reconnaisance');
    ok(seen.length > 0 && !bad.length, `SCRIPT V: on stage his slip is "reconnaisance" — the word missed by one s, as the round says (${seen.length} halls watched it${bad.length ? '; ' + bad.slice(0, 3).map(e => e.said).join(', ') : ''})`); }
  const slip = (() => { const r = of('roots')[0]; return r && r.g && r.g.cs && r.g.cs.words.crack ? 'ok' : 'none'; })();
  b = of('strait').filter(x => !(has(x.g, 'inesKwameLast3') || (bot(x.g, 'melody').in && bot(x.g, 'samurai').in)));
  ok(!b.length, 'SCRIPT VI: Ines and Kwame are both standing when the field is down to its last three rivals (or both stand at the end)' + say(b));
  b = of('junkyard').filter(x => { const e = (x.g.hallLog || []).find(z => z.k === 'sukiAsks');
    return !(e && e.w === 'triskaidekaphobia' && e.asks.join() === 'def,sent,ps,org,alt' && /English/.test(e.origin) && has(x.g, 'sukiRight', z => z.w === 'triskaidekaphobia') && x.g.mine.every(m => m.w !== 'triskaidekaphobia')); });
  ok(!b.length, 'SCRIPT VII: triskaidekaphobia goes to Suki — five requests (definition, sentence, part of speech, origin, alternate pronunciation), origin English, spelled right — and never to the child' + say(b));
  b = of('sprints').filter(x => { const d = bot(x.g, 'comet'); const r0 = (x.g.hallLog || []).filter(e => e.k === 'daxRoundOne');
    return !(r0.length && has(x.g, 'daxFade') && has(x.g, 'cut') && !(x.g.co && d.in)); });
  ok(!b.length, 'SCRIPT VIII: Dax spells his round-one word, misses in a later round, never stands at the cap, and the hall cuts to the result card' + say(b));
  b = of('stage').filter(x => { const L = x.g.hallLog || []; const bo = L.find(e => e.k === 'blackout'); const pipSeated = !!bot(x.g, 'pixel');
    if (!bo || !bo.standing.includes('comet') || (pipSeated && !bo.standing.includes('pixel'))) return true;
    const after = L.slice(L.indexOf(bo));
    const rivalTurns = after.filter(e => e.k === 'darkAsk').length;
    if (!has(x.g, 'daxDef') || !has(x.g, 'vesperAsks', e => e.asks.includes('org'))) return true;
    /* every other rival out before Vesper */
    const V = bot(x.g, 'goldlegend'); const pv = placeOf(x.g, V);
    if (x.g.field.some(s => s.kind === 'bot' && s !== V && placeOf(x.g, s) < pv)) return true;
    if (x.g.co) return true;   /* no co-champions in Round IX */
    return rivalTurns < 1; });
  ok(!b.length, 'SCRIPT IX: the lights go out halfway with Dax (and Pip, where seated) standing; Dax\'s next turn is a definition request, Vesper asks the language of origin, she outlasts every other rival, and there are no co-champions' + say(b));
  /* after the blackout every rival turn shows a request: count the rival spellings after it against the requests */
  b = of('stage').filter(x => { const g = x.g; const L = g.hallLog || []; const i = L.findIndex(e => e.k === 'blackout'); if (i < 0) return true;
    return L.slice(i).some(e => e.k === 'turn' && e.dark && !e.asks.length); });
  ok(!b.length, 'SCRIPT IX: after the blackout every rival turn on the stage shows at least one Pronouncer\'s Chair request' + say(b));
  /* Vesper's tell is never read again once she has asked */
  b = of('stage').filter(x => (x.g.hallLog || []).some(e => e.k === 'vesperCalled' && e.asked && e.tell));
  ok(!b.length, 'SCRIPT IX: once Vesper has asked, the announcer never reads her tell ("does not ask for anything") again' + say(b));
  b = of('stage').filter(x => { const g = x.g; const V = bot(g, 'goldlegend'), m = me(g);
    const vmiss = has(g, 'vesperMiss'), cap = has(g, 'capChampWord');
    if (x.bot === 'out') return !(!g.meWon && g.champ === V);          /* the child went out first: Vesper wins */
    if (vmiss) return !(g.meWon && has(g, 'champWord', e => e.who === 'me'));   /* Vesper missed first: the child spells it and finishes above */
    if (cap) return !has(g, 'champWord');                                   /* the cap: the championship word decides it */
    return !(g.meWon || g.champ === V); });
  ok(!b.length, 'SCRIPT IX: the championship word goes as the script says — the child out first: Vesper wins; Vesper missing first: the child spells it and finishes above; the cap: the child\'s word decides it' + say(b));
}
if (on('PLACING')) {
  const bad = runs.filter(x => { const g = x.g, r = g.report; if (!r) return true; const H = S.rounds.find(z => z.act === x.act);
    const letter = x.act === 'meadow' ? 'koi' : H.headliners[0];
    if (r.letter !== letter) return true;
    const L = bot(g, letter), m = me(g);
    const expect = g.meWon || placeOf(g, m) < placeOf(g, L);
    if (r.above !== expect) return true;
    if (H.n <= 8 && g.co && L.in && m.in) return true;                      /* never a title shared with the letter-writer */
    if (H.n <= 8 && g.co && m.in && has(g, 'capOut') && !(g.hallLog.findIndex(e => e.k === 'capOut') < g.hallLog.findIndex(e => e.k === 'result'))) return true;
    return false; });
  ok(!bad.length, 'PLACING: above/below is the child against the letter\'s headliner (Nova in Round I); a child standing at the end is above; Rounds I–VIII never share a title with that headliner' + say(bad));
  const caps = runs.filter(x => has(x.g, 'capOut'));
  console.log(`       the cap rule fired in ${caps.length} halls (${[...new Set(caps.map(x => x.act))].join(', ') || 'none'})`);
}
if (on('CAP')) {
  /* time called on purpose: the clock is moved to 15 s before the cap the moment the letter-writer and the child are
     both standing after round one (Round IX: after the lights go out, with Vesper and the child standing) */
  const CAP = 8 * 60 * 1000; const rows = [];
  for (const act of ACTS) for (const band of Object.keys(AGE)) for (const variant of act === 'stage' ? ['win', 'missC9'] : ['win']) {
    const W = world({ ageBand: AGE[band][0], age: AGE[band][1], t0: 3 });
    W.A.mbOpen({ venue: act, seed: 4100 + ACTS.indexOf(act) }); W.A.mbStart(); const g = W.S.mb;
    drive(W, 'win', { missC9: variant === 'missC9' });
    const H = S.rounds.find(z => z.act === act); const letter = act === 'meadow' ? 'koi' : H.headliners[0];
    const ready = () => g.view === 'stage' && g.phase === 'call' && me(g).in && bot(g, letter).in && (act === 'stage' ? g.dark : g.round >= 1);
    const got = W.run(() => ready() || g.view === 'result', 60 * 60 * 1000);
    if (!ready()) { rows.push({ act, band, variant, skipped: 1 }); continue; }
    g.t0 = W.now - (CAP - 15000);
    W.run(() => g.view === 'result', 60 * 60 * 1000);
    const L = g.hallLog; const iOut = L.findIndex(e => e.k === 'capOut'), iRes = L.findIndex(e => e.k === 'result');
    rows.push({ act, band, variant, g, L, iOut, iRes, letter, r: g.report });
  }
  const played = rows.filter(x => !x.skipped);
  const capBad = played.filter(x => x.act !== 'stage').filter(x => !(x.iOut >= 0 && x.iOut < x.iRes && x.L[x.iOut].who === x.letter && !bot(x.g, x.letter).in && x.r.above && !(x.g.co || []).some(s => s.kind === 'bot' && s.bot.id === x.letter)));
  ok(played.length >= 20 && !capBad.length, `CAP: Rounds I–VIII, time called with the child and the letter's headliner standing — the headliner takes one more word and misses it first, so the title is never shared with them and the letter is "above" (${played.filter(x => x.act !== 'stage').length} halls)` + (capBad.length ? ' — ' + capBad.map(x => x.act + '/' + x.band).join(', ') : ''));
  const nine = played.filter(x => x.act === 'stage');
  const nineBad = nine.filter(x => { const g = x.g; const cw = x.L.find(e => e.k === 'champWord' && e.who === 'me');
    if (!x.L.some(e => e.k === 'capChampWord') || g.co || !cw) return true;
    return x.variant === 'win' ? !(cw.ok && g.meWon && x.r.above) : !(!cw.ok && x.L.some(e => e.k === 'champWord' && e.who === 'goldlegend' && e.ok) && g.champ && g.champ.bot && g.champ.bot.id === 'goldlegend' && !x.r.above); });
  ok(nine.length >= 4 && !nineBad.length, `CAP: Round IX, time called with Vesper and the child standing — no co-champions; the championship word goes to the child: right, above and the title; missed, Vesper spells it and takes it, below (${nine.length} halls)` + (nineBad.length ? ' — ' + nineBad.map(x => x.band + '/' + x.variant).join(', ') : ''));
  const r8 = played.filter(x => x.act === 'sprints');
  ok(r8.length && r8.every(x => !bot(x.g, 'comet').in), 'CAP: Round VIII — Dax never stands at the cap');
}
if (on('PAY')) {
  const pr = [];
  for (const act of ACTS) for (const bt of ['random', 'silent']) { const r = hall({ act, band: '8-10', bot: bt, seed: 31 + ACTS.indexOf(act) }); pr.push(Object.assign({ act, bt }, r)); }
  const paid = pr.filter(x => x.W.ledger.length || x.g.pay);
  ok(!paid.length, `PAY (§13 t6): a random and a silent speller earn 0 coins in every hall (${pr.length} halls)` + (paid.length ? ' — ' + paid.map(x => x.act + '/' + x.bt + ' ' + x.W.ledger.join('+')).join(', ') : ''));
  const odd = runs.filter(x => x.W.ledger.some(e => e !== 'answer' && e !== 'contest'));
  const ans = runs.filter(x => x.W.ledger.filter(e => e === 'answer').length !== x.g.mine.filter(m => m.ok).length);
  const card = runs.filter(x => x.g.pay !== x.W.ledger.filter(e => e === 'answer').length + 10 * x.W.ledger.filter(e => e === 'contest').length);
  const cont = runs.filter(x => { const c = x.W.ledger.filter(e => e === 'contest').length; const given = x.g.mine.length, right = x.g.mine.filter(m => m.ok).length;
    const podium = given > 0 && right / given >= .7 && x.g.place <= 3 && x.g.place < x.g.field.length; return c !== (podium ? 1 : 0); });
  ok(!odd.length && !ans.length && !card.length && !cont.length, `PAY (§13 t6): the winning and the out bots earn only answer coins (one a word right) and the contest event exactly when Mock Bee pays it (the podium at 70%); the finish card says what the ledger took` + say(odd.concat(ans, card, cont)));
}
if (on('REPORT')) {
  const bad = runs.filter(x => { const c = x.W.circ.filter(e => e.fn === 'onHall'); if (c.length !== 1) return true; const r = c[0].r;
    return !(c[0].act === x.act && c[0].lazyFirst && r.place === x.g.place && r.of === x.g.field.length && Array.isArray(r.words) && r.words.length === x.g.mine.length && Array.isArray(r.missed) && typeof r.replay === 'boolean' && Array.isArray(r.log)); });
  ok(!bad.length, 'REPORT: every finished hall calls SB_CIRCUIT.onHall(act, {place, of, words, missed, replay, …}) once, after lazyNeed(\'circuit\')' + say(bad));
  /* what circuit.js reads (BUILD-core.md): each word's Chair requests, their sum the script's way (build[slots]: the sum of
     g.mine[].asks.length — "Say it again" is a request), the headliner's place, the hardest word right, the last miss */
  const shape = runs.filter(x => { const c = x.W.circ.find(e => e.fn === 'onHall'); if (!c) return true; const r = c.r, M = x.g.mine;
    const sum = M.reduce((t, m) => t + (m.asks || []).length, 0), miss = M.filter(m => !m.ok);
    return !(r.words.every((w, j) => w.w === M[j].w && w.ok === M[j].ok && w.asks === (M[j].asks || []).length) && r.asks === sum
      && Array.isArray(r.asked) && r.asked.reduce((t, a) => t + a.asks.length, 0) === sum && r.headPlace === r.letterPlace && typeof r.above === 'boolean'
      && r.lastMissed === (miss.length ? miss[miss.length - 1].w : '') && (M.some(m => m.ok) ? M.some(m => m.ok && m.w === r.spelled) : r.spelled === '')); });
  ok(!shape.length, 'REPORT: the shape circuit.js reads — words[{w, ok, asks}], asks = the sum of their Chair requests, asked[], headPlace, above, spelled, lastMissed' + say(shape));
  const ak = hall({ act: 'library', band: '8-10', bot: 'win', seed: 7, ask: ['say', 'def', 'say'] }); const akr = (ak.W.circ.find(e => e.fn === 'onHall') || {}).r || {};
  const per = ak.g.mine.map(m => (m.asks || []).join());
  ok(ak.g.mine.length > 0 && per.every(p => p === 'say,def,say') && akr.asks === 3 * ak.g.mine.length && (akr.words || []).every(w => w.asks === 3),
    `REPORT: a child who asks "Say it again" twice and the definition once on each word is told as three requests a word (build[slots]: the sum of g.mine[].asks.length) — ${akr.asks} over ${ak.g.mine.length} words`);
  const q = hall({ act: 'forum', band: '8-10', bot: 'win', seed: 5, quitAt: 1 });
  ok(q.W.circ.filter(e => e.fn === 'onHall').length === 0 && q.W.S.nav === 'trail' && q.W.S.trailAct === 'forum' && q.W.S.trailView === 'act', 'REPORT: a hall left before its finish reports nothing, and Leave lands on the region\'s board');
  const a = hall({ act: 'storm', band: '8-10', bot: 'win', seed: 99 }), b2 = hall({ act: 'storm', band: '8-10', bot: 'win', seed: 99, circuit: false });
  ok(a.g.places.map(x => x.place + ':' + x.s.n).join() === b2.g.places.map(x => x.place + ':' + x.s.n).join() && b2.g.view === 'result', 'REPORT: with no SB_CIRCUIT on the page a hall plays exactly the same, and simply tells nobody');
  const rp = hall({ act: 'meadow', band: '8-10', bot: 'win', seed: 3, replay: true });
  ok(rp.W.circ[0] && rp.W.circ[0].r.replay === true, 'REPORT: a replayed hall says so (replay: true)');
}
if (on('WORDS')) {
  /* the mix of one draw of twenty, before a word is played: a region whose stops hold 400 words the bee's own window
     would never reach (y 7, so only the region's draw can deal them), and a revision pile of ten */
  const fam = (DATA.SB_DATA.nsf || []).filter(w => w && w.w && /^[a-z]{4,12}$/.test(w.w) && w.y === 7 && w.d && w.d.length > 8).slice(0, 400).map(w => w.w);
  const rev = (DATA.SB_DATA.nsf || []).filter(w => w && w.w && /^[a-z]{4,10}$/.test(w.w) && w.y === 2 && w.d && w.d.length > 8).slice(50, 60).map(w => w.w);
  const W = world({ ageBand: '8-10', age: 9, review: rev });
  W.A.mbOpen({ venue: 'library', family: fam, seed: 12 }); W.A.mbStart();
  const dealt = W.ctx.MOCKBEE.draw(20, 1);
  const famN = dealt.filter(w => fam.includes(w.w)).length, revN = dealt.filter(w => rev.includes(w.w)).length;
  ok(dealt.length === 20 && famN === 12 && revN === 5, `WORDS: a hall's draw is 60% the region's own words and 25% the revision pile (${famN} + ${revN} of ${dealt.length}), the rest one band up`);
  ok(W.doors.some(o => o.purpose === 'contest' && o.tier === 1 && o.filter) && W.doors.some(o => o.purpose === 'review'), 'WORDS: one band up is the next tier (tier +1) through the door, and the pile is the door\'s review');
  const src = fs.readFileSync(SRC, 'utf8');
  ok(!/corpusSlice\(|corpusBands\(|SB_DATA\s*\.nsf|SB_FULL\b|words-full/.test(src.slice(src.indexOf('THE BEE CIRCUIT: A REGIONAL ROUND'))), 'WORDS: the Circuit\'s code reads no corpus itself (tests/word-door.cjs holds the whole file)');
}
if (on('RANDOM')) {
  const calls = runs.reduce((t, x) => t + x.W.random, 0);
  ok(calls === 0, `RANDOM: not one Math.random() call in ${runs.length} halls (${calls})`);
  const a = hall({ act: 'roots', band: '11-15', bot: 'win', seed: 77 }), b = hall({ act: 'roots', band: '11-15', bot: 'win', seed: 77 });
  ok(a.g.places.map(x => x.place + x.s.n).join() === b.g.places.map(x => x.place + x.s.n).join() && a.ms === b.ms, 'RANDOM: the same seed is the same hall, rival for rival');
}
console.log(fails ? `\n${fails} FAILED` : '\nall good');
process.exit(fails ? 1 : 0);
