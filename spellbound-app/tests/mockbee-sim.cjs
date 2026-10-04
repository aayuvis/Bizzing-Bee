/* THE MOCK BEE ON A SIMULATED CLOCK (games spec §4.1, 4 Oct 2026) — @check

   mockbee.js runs here in a node VM against the real word data, the real Coach rulebook and the
   real alternate pronunciations, with app3's globals stubbed and a FAKE CLOCK underneath —
   setTimeout and Date.now are the simulation's, so eight minutes of bee take a few milliseconds
   and every bee is the same bee on every machine. Bots sit at the microphone:

     perfect-keen     spells every word, writes along every rival's word in 3 s
     perfect-passive  spells every word, never touches a write-along (waits every window out)
     random           types random letters
     silent           types nothing at all — every turn runs out its clock

   What it holds:
     CAP      a perfect speller's bee ends inside 8 minutes — median AND worst, every band, both
              kinds of perfect, Bee and Champ (it ran past 704 s before) — and the perfect speller
              takes first place (alone, or sharing it if time is called).
     SIZE     the field and the rounds are the band's: 6–7 four rivals / three rounds, 8–10 six /
              four, 11–15 eight / five, then sudden death.
     CHAIR    the six requests in a fixed order; a request with no answer on file is never drawn;
              no answer, strip line or rendered turn ever contains the word; each request costs
              exactly 3 s of the 30 s turn clock (an answered question asked again costs
              nothing; Say it again costs every time) and a turn spent asking runs out and is
              graded.
     STRIP    Hard and Champ show the thinking strip from coach-rules.js; Easy does not.
     PAY      the random and silent bots earn 0 coins; finishing pays nothing; the perfect
              speller earns one coin per word right plus the contest event at a podium, and the
              finish card says exactly what the ledger took.
     FAMILY   only the profile child is paid and only the profile child's progress moves; the
              guests' names are never written to the household, a device key or a backup.
     OUT      Finish now ends the bee at once and calls no one else to the microphone for the
              child; Watch the rest runs at 2× with no write-along windows.
     RANDOM   not one Math.random() call from start to finish of a bee (T5).
     LEVEL    SB_LEVEL.after('mockbee', right ÷ given) is called once at the end of a Bee.
     SFX      every sfx() kind the bee asks for exists (sfx('right') was a silent no-op).

   Proved by breaking (MB_SRC=<a broken copy> node tests/mockbee-sim.cjs): see the commit.
   Run: node tests/mockbee-sim.cjs                                                           */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const APP = path.resolve(__dirname, '..');
const SRC = process.env.MB_SRC || path.join(APP, 'mockbee.js');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };

/* ---------------- the data, loaded once ---------------- */
const DATA = (() => {
  const ctx = { window: null }; ctx.window = ctx; vm.createContext(ctx);
  for (const f of ['words-data.js', 'words-data-2.js', 'words-data-s.js', 'coach-rules.js', 'sounds-data.js', 'nsf-vocab26-data.js']) {
    try { vm.runInContext(fs.readFileSync(path.join(APP, f), 'utf8'), ctx, { filename: f }); } catch (e) { console.log('  (could not load ' + f + ': ' + e.message + ')'); }
  }
  /* sentences of the boot shard ride in their own file (boot-lazy's AFTER.sents) */
  const S = ctx.SB_SENT_BOOT || [];
  const by = new Map(); (ctx.SB_DATA.nsf || []).forEach(r => { if (r && r.w && !by.has(r.w)) by.set(r.w, r); });
  for (const [w, s] of S) { const r = by.get(w); if (r && !r.s && s) r.s = s; }
  return ctx;
})();
const VALID_SFX = new Set(['correct', 'wrong', 'coin', 'win', 'lose', 'level', 'tick']);
const has = (txt, w) => new RegExp('(^|[^a-z])' + String(w).toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^a-z])', 'i').test(String(txt || ''));
const textOf = html => String(html || '').replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ');

/* ---------------- one bee world: a VM with a fake clock ---------------- */
function world(opts) {
  opts = opts || {};
  let now = Date.UTC(2026, 9, 4, 18, 0, 0) + (opts.t0 || 0);
  let seq = 0; const timers = [];
  const setT = (fn, ms) => { const id = ++seq; timers.push({ id, at: now + Math.max(0, +ms || 0), fn }); return id; };
  const clearT = id => { const i = timers.findIndex(t => t.id === id); if (i >= 0) timers.splice(i, 1); };
  const FakeDate = class extends Date { constructor(...a) { if (a.length) super(...a); else super(now); } static now() { return now; } };
  const ledger = [], sfxs = [], band = [], mastered = [], missed = [], gameLog = [], stores = [], saves = [], levelCalls = [];
  let randomCalls = 0;
  const child = { name: 'Ahana', age: opts.age || 9, ageBand: opts.ageBand || '8-10', avatar: 'panda', coins: 0, mbDiff: opts.mbDiff };
  const mem = {};
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
    save: () => { saves.push(JSON.stringify({ children: ctx.state.children })); },
    render: () => { ctx._renders = (ctx._renders || 0) + 1; ctx._html = ctx.MOCKBEE ? ctx.MOCKBEE.view() : ''; },
    addCoins: ev => { const n = { answer: 1, stop: 5, contest: 10, mastery: 20 }[ev] || 0; if (n) ledger.push(ev); return n; },
    payG: g => { const n = ctx.addCoins('answer'); if (g) g.bonus = (g.bonus || 0) + n; return n; },
    sfx: k => sfxs.push(k), burstConfetti: () => {},
    logBand: (w, okk) => band.push([w.w, okk]), markMastered: k => mastered.push(k), mastEvidence: (k, o) => { if (!o) missed.push(k); },
    addMiss: (w, mark) => missed.push('pile:' + w.w + ':' + mark),
    logGameWord: k => gameLog.push(k), recentGameKeys: () => new Set(),
    nkey: w => String(w || '').toLowerCase().trim(),
    sameSpelling: (a, b) => String(a || '').toLowerCase().trim() === String(b || '').toLowerCase().trim(),
    maskTxt: (t, w) => String(t || '').replace(new RegExp(String(w).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig'), '_____'),
    missFeedbackHTML: () => '<div class="sb-miss"></div>',
    esc: s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
    escA: s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
    iconSVG: () => '<svg></svg>', SB_AVATAR: id => '<img src="avatars/' + id + '.webp">', fmtN: n => String(n),
    wordClip: t => 'voice/w/' + t + '.mp3', corpusSlice: () => [], gameWordsD: () => [], vocBuildCheck: () => null,
    homPartners: w => { const g = (DATA.SB_HOM || []).find(x => x.indexOf(String(w).toLowerCase()) >= 0); return g ? g.filter(x => x !== String(w).toLowerCase()) : []; },
    altPron: w => { const o = DATA.SB_ALT_PRON || {}; const k = String(w).toLowerCase(); return Object.prototype.hasOwnProperty.call(o, k) ? o[k] : null; },
    SB_STORE: { getJSON: (k, d) => (k in mem ? JSON.parse(mem[k]) : d), setJSON: (k, v) => { mem[k] = JSON.stringify(v); stores.push(k + '=' + mem[k]); } },
  });
  if (opts.level) ctx.SB_LEVEL = { get: () => opts.level, set: () => {}, after: (k, pct) => { levelCalls.push([k, pct]); return { level: opts.level, dropped: pct < .5 }; }, chip: () => '<button data-act="levelChip">L</button>' };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(SRC, 'utf8'), ctx, { filename: 'mockbee.js' });
  const A = ctx.app, S = ctx.state;
  const W = {
    ctx, A, S, child, ledger, sfxs, band, mastered, missed, stores, saves, levelCalls, mem,
    get now() { return now; }, get random() { return randomCalls; },
    /* run the clock until cond() or the limit (simulated ms) */
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
  const rndL = () => 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  const wrong = w => { let s = ''; for (let i = 0; i < Math.max(3, String(w).length); i++) s += rndL(); return s === w ? s + 'q' : s; };
  const answer = w => kind.startsWith('perfect') ? w : kind === 'random' ? wrong(w) : '';
  const tick = () => {
    const g = S.mb;
    if (!g || g.view === 'result') return;
    const key = [g.phase, g.round, g.turn, g.clock && g.clock.tok, g.wr && g.wr.i, g.bolt && g.bolt.i, g.vq && g.vq.w && g.vq.w.w, g.atMic && g.atMic.n].join('|');
    if (key !== last) {
      last = key;
      const ph = g.phase;
      if (ph === 'me') {
        const human = g.atMic && g.atMic.kind === 'player' && !g.atMic.profile;
        const w = g.word.w;
        if (o.missRound != null && g.round === o.missRound && !human) W.later(2500, () => { A.mbType('zzzz'); A.mbSpell(); });
        else if (o.asks && !human) { o.asks.forEach((k, i) => W.later(500 + i * 200, () => A.mbAsk(k))); W.later(4000, () => { A.mbType(answer(w)); A.mbSpell(); }); }
        else if (kind !== 'silent' || human) W.later(4000, () => { A.mbType(human ? ((o.guestMiss === g.atMic.name && g.round >= 1) ? 'zz' : w) : answer(w)); A.mbSpell(); });
      } else if (ph === 'meDone' && g.hold) W.later(2000, () => A.mbGoOn());
      else if (ph === 'vmeDone' && g.hold) W.later(2000, () => A.mbGoOn());
      else if (ph === 'practice' && kind === 'perfect-keen') { const w = g.word.w; W.later(3000, () => { A.mbPracType(w); A.mbPracSkip(); }); }
      else if (ph === 'pass') W.later(1500, () => A.mbReady());
      else if (ph === 'outChoice') W.later(1500, () => (o.out === 'watch' ? A.mbWatch() : A.mbFinishNow()));
      else if (ph === 'vme') { const q = g.vq; W.later(3000, () => A.mbVocPick(String(kind.startsWith('perfect') ? q.choices.indexOf(q.answer) : (q.choices.indexOf(q.answer) + 1) % 4))); }
    }
    if (g.phase === 'written' && g.wr && !g.wr._b) { g.wr._b = 1; const step = () => { const gg = S.mb; if (!gg || gg.phase !== 'written' || !gg.wr) return;
      A.mbWrType(answer(gg.words[gg.wr.i].w)); A.mbWrGo(); W.later(3000, step); }; W.later(3000, step); }
    if (g.phase === 'bolt' && g.bolt && !g.bolt._b) { g.bolt._b = 1; const step = () => { const gg = S.mb; if (!gg || gg.phase !== 'bolt' || !gg.bolt) return;
      A.mbBoltType(answer(gg.words[gg.bolt.i % gg.words.length].w)); A.mbBoltGo(); W.later(3000, step); }; W.later(3000, step); }
    W.later(100, tick);
  };
  W.later(100, tick);
}
function bee(o) {
  const W = world(o);
  W.A.mbOpen(o.mode || 'bee');
  if (o.family) { const P = o.family; P.forEach((p, i) => { if (i === 0) return; W.A.mbFamAdd && i > 1 && W.A.mbFamAdd(); }); P.forEach((p, i) => { if (i > 0) { W.A.mbFamName(i + '|' + p.name); W.A.mbFamBand(i + '|' + p.band); } }); }
  const start = W.now;
  W.A.mbStart();
  const g0 = W.S.mb;
  drive(W, o.bot || 'perfect-keen', o);
  W.run(() => !W.S.mb || W.S.mb.view === 'result', 60 * 60 * 1000);
  /* the length is the simulated clock's own reading, from the tap on Take the stage to the result */
  return { W, g: W.S.mb, g0, ms: W.now - start };
}
const median = a => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

/* ================= CAP and SIZE ================= */
const CAP = 8 * 60 * 1000;
const SIZES = { '5-7': [4, 3], '8-10': [6, 4], '11-13': [8, 5], '14-18': [8, 5] };
for (const [ab, [rv, rd]] of Object.entries(SIZES)) {
  const r = bee({ ageBand: ab, bot: 'perfect-keen', t0: 7 });
  const bots = r.g.field.filter(s => s.kind === 'bot').length;
  ok(bots === rv && r.W.ctx.MOCKBEE.roundAt(rd, r.g).sudden === 1 && r.W.ctx.MOCKBEE.roundAt(rd - 1, r.g).sudden === 0,
    `SIZE: age band ${ab} → ${bots} rivals, sudden death after ${rd} rounds`);
}
const capRows = [];
for (const ab of ['5-7', '8-10', '11-13']) for (const bot of ['perfect-keen', 'perfect-passive']) for (const mode of ['bee', 'champ']) {
  const ms = [], won = [], co = [];
  for (let i = 0; i < 9; i++) {
    const r = bee({ ageBand: ab, bot, mode, t0: 1000 * i + 37 * i * i });
    ms.push(r.ms); won.push(r.g.place === 1); co.push(!!r.g.co);
  }
  capRows.push({ ab, bot, mode, med: median(ms), max: Math.max(...ms), won: won.filter(Boolean).length, co: co.filter(Boolean).length });
}
for (const c of capRows) console.log(`       ${c.mode.padEnd(5)} ${c.ab.padEnd(5)} ${c.bot.padEnd(15)} median ${(c.med / 1000).toFixed(0)}s  worst ${(c.max / 1000).toFixed(0)}s  first ${c.won}/9  co-champions ${c.co}/9`);
ok(capRows.every(c => c.med <= CAP), 'CAP: a perfect speller\'s bee has a median under 8 minutes in every band, keen or passive, Bee and Champ');
ok(capRows.every(c => c.max <= CAP), 'CAP: and no bee of the ' + capRows.length * 9 + ' runs past 8 minutes');
ok(capRows.every(c => c.won === 9), 'CAP: the perfect speller finishes first every time (alone, or sharing it when time is called)');
ok(capRows.filter(c => c.mode === 'bee').every(c => c.co <= 2), 'CAP: in Bee, time is rarely called — sudden death decides it (≤2 co-champion finishes in 9)');

/* ================= PAY ================= */
{
  const rr = bee({ bot: 'random', t0: 11 });
  const sl = bee({ bot: 'silent', t0: 12 });
  ok(rr.W.ledger.length === 0 && rr.g.pay === 0, `PAY: a random typist earns 0 coins (ledger ${rr.W.ledger.length}, finish card ${rr.g.pay})`);
  ok(sl.W.ledger.length === 0 && sl.g.pay === 0 && sl.g.view === 'result', 'PAY: finishing pays nothing — a bee of empty boxes ends with 0 coins');
  const pf = bee({ bot: 'perfect-keen', t0: 13 });
  const right = pf.g.mine.filter(m => m.ok).length;
  const answers = pf.W.ledger.filter(e => e === 'answer').length, contests = pf.W.ledger.filter(e => e === 'contest').length;
  ok(answers === right && right > 0 && contests === 1, `PAY: a perfect speller earns a coin per word right (${answers} for ${right}) and the contest event once at the podium (${contests})`);
  ok(pf.g.pay === answers + 10 * contests, `PAY: the finish card says what the ledger took (${pf.g.pay})`);
  const out = bee({ bot: 'perfect-keen', missRound: 1, t0: 14 });
  ok(out.W.ledger.filter(e => e === 'contest').length === 0, 'PAY: a speller out in round two gets no contest coin (place ' + out.g.place + ' of ' + out.g.field.length + ')');
}

/* ================= OUT: Finish now / Watch the rest ================= */
{
  const W = world({ t0: 21 }); W.A.mbOpen('bee'); W.A.mbStart();
  drive(W, 'perfect-keen', { missRound: 1, out: 'none' });
  W.run(() => W.S.mb.phase === 'outChoice');
  const at = W.now; const g = W.S.mb;
  const before = g.field.filter(s => s.in).length;
  W.A.mbFinishNow();
  ok(g.view === 'result' && W.now === at && g.field.filter(s => s.in).length === 1 && before > 1,
    `OUT: Finish now resolves the ${before} still standing at once, from their profiles — champion ${g.champ && g.champ.bot ? g.champ.bot.name : '?'}`);
  const W2 = world({ t0: 22 }); W2.A.mbOpen('bee'); const at2 = W2.now; W2.A.mbStart();
  let practice = 0, meTurns = 0, watching = false;
  drive(W2, 'perfect-keen', { missRound: 1, out: 'watch' });
  const spy = () => { const g2 = W2.S.mb; if (!g2) return; if (g2.watch) { watching = true; if (g2.phase === 'practice') practice++; if (g2.phase === 'me') meTurns++; } W2.later(50, spy); }; W2.later(50, spy);
  W2.run(() => W2.S.mb.view === 'result');
  ok(watching && W2.S.mb.speed === 2 && practice === 0 && meTurns === 0, `OUT: Watch the rest runs at 2× with no write-along windows and no turn for the child (${practice} windows)`);
  ok(W2.now - at2 <= CAP, 'OUT: and still ends inside the cap (' + Math.round((W2.now - at2) / 1000) + 's)');
}

/* ================= CHAIR ================= */
{
  const W = world({ t0: 31 });
  const M = W.ctx.MOCKBEE;
  const names = new Set(['pip', 'nova', 'rafi', 'suki', 'dax', 'mira', 'theo', 'ines', 'kwame', 'vesper', 'ahana']);
  const pool = (DATA.SB_DATA.nsf || []).filter(w => w && w.w && w.d && /^[a-z]{3,}$/.test(w.w) && !names.has(w.w));
  /* the words most likely to leak: their own definition or sentence quotes them */
  const risky = pool.filter(w => has(w.d, w.w) || has(w.s, w.w) || has(w.o, w.w)).slice(0, 400);
  const sample = risky.concat(pool.filter((w, i) => i % 97 === 0)).slice(0, 900);
  const ORDER = ['def', 'ps', 'org', 'sent', 'say', 'alt'];
  let leaks = [], order = true, empties = [], stripLeaks = [];
  for (const w of sample) {
    const ch = M.chair(w); const ks = ch.map(c => c.k);
    if (ks.join() !== ORDER.filter(k => ks.indexOf(k) >= 0).join()) order = false;
    for (const c of ch) { if (!c.answer || !String(c.answer).trim()) empties.push(w.w + ':' + c.k); if (has(c.answer, w.w)) leaks.push(w.w + ':' + c.k); }
    if (!w.s && ks.indexOf('sent') >= 0) empties.push(w.w + ':sent-without-sentence');
    if (!w.ps && ks.indexOf('ps') >= 0) empties.push(w.w + ':ps-without-data');
    if (!W.ctx.altPron(w.w) && ks.indexOf('alt') >= 0) empties.push(w.w + ':alt-without-data');
    for (const k of ['org', 'ps', 'def', 'sent']) { const t = M.strip(w, k); if (t && has(t, w.w)) stripLeaks.push(w.w + ':' + k); }
  }
  const withAlt = sample.filter(w => W.ctx.altPron(w.w)).length, noSent = sample.filter(w => !w.s).length;
  ok(order, 'CHAIR: the requests come in one fixed order — Definition · Part of speech · Origin · Sentence · Say it again · Alternate pronunciation');
  ok(!empties.length, `CHAIR: a request with no answer on file is never drawn (${noSent} of ${sample.length} words have no sentence, ${sample.length - withAlt} no alternate pronunciation)` + (empties.length ? ' — ' + empties.slice(0, 4).join(', ') : ''));
  ok(!leaks.length, `CHAIR: no answer contains the word, over ${sample.length} words (${risky.length} whose own definition, sentence or origin quotes them)` + (leaks.length ? ' — ' + leaks.slice(0, 4).join(', ') : ''));
  ok(!stripLeaks.length, 'CHAIR: no thinking-strip line contains the word' + (stripLeaks.length ? ' — ' + stripLeaks.slice(0, 4).join(', ') : ''));
  /* the rendered turn, every question asked, at Hard (strip on) */
  const W2 = world({ t0: 32, level: 'hard' }); W2.A.mbOpen('bee'); W2.A.mbStart();
  W2.run(() => W2.S.mb.phase === 'me');
  const g = W2.S.mb; let shown = [], rleaks = [], strips = 0;
  /* the hall's own words ("Say it again", "Spell it", a rival's name) are not a leak */
  g.word = { w: 'qqzzq', d: 'x', ps: 'noun', o: 'Latin', s: 'x' }; g.phase = 'me'; g.asked = { def: 1, ps: 1, org: 1, sent: 1 }; W2.ctx.render();
  const chrome = textOf(W2.ctx._html);
  for (const w of risky.filter(w => !has(chrome, w.w)).slice(0, 150)) {
    g.word = w; g.phase = 'me'; g.asked = { def: 1, ps: 1, org: 1, sent: 1, alt: 1 }; W2.ctx.render();
    const t = textOf(W2.ctx._html); if (has(t, w.w)) rleaks.push(w.w);
    if (/mb-strip/.test(W2.ctx._html)) strips++;
    shown.push((W2.ctx._html.match(/data-q="/g) || []).length);
  }
  ok(!rleaks.length, 'CHAIR: the turn as drawn, every request answered, never shows the word (150 risky words)' + (rleaks.length ? ' — ' + rleaks.slice(0, 4).join(', ') : ''));
  ok(strips > 0, `STRIP: at Hard the thinking strip is drawn from the Coach's rulebook (${strips} of 150 words had a matching rule)`);
  const greek = pool.find(w => /greek/i.test(w.o || '') && /ph/.test(w.w));
  ok(greek && /f→ph/.test(W2.ctx.MOCKBEE.strip(greek, 'org')), `STRIP: a Greek word's origin implies the Greek swaps ("${greek ? W2.ctx.MOCKBEE.strip(greek, 'org') : ''}")`);
  const W3 = world({ t0: 33, level: 'easy' }); W3.A.mbOpen('bee'); W3.A.mbStart(); W3.run(() => W3.S.mb.phase === 'me');
  const g3 = W3.S.mb; g3.word = greek; g3.asked = { org: 1 }; W3.ctx.render();
  ok(!/mb-strip/.test(W3.ctx._html), 'STRIP: at Easy there is no thinking strip');
  /* 3 s a question */
  const W4 = world({ t0: 34 }); W4.A.mbOpen('bee'); W4.A.mbStart(); W4.run(() => W4.S.mb.phase === 'me');
  const g4 = W4.S.mb; g4.word = pool.find(w => w.ps && w.o && w.d);
  const d0 = g4.clock.deadline; W4.A.mbAsk('def'); const d1 = g4.clock.deadline; W4.A.mbAsk('def'); const d2 = g4.clock.deadline;
  W4.A.mbAsk('org'); const d3 = g4.clock.deadline; W4.A.mbAsk('say'); W4.A.mbAsk('say'); const d4 = g4.clock.deadline;
  ok(d0 - d1 === 3000 && d1 === d2 && d2 - d3 === 3000 && d3 - d4 === 6000 && g4.clock.ms === 30000,
    `CHAIR: each request costs exactly 3 s of the 30 s clock (def −${(d0 - d1) / 1000}s, def again −${(d1 - d2) / 1000}s, origin −${(d2 - d3) / 1000}s, say ×2 −${(d3 - d4) / 1000}s)`);
  for (let i = 0; i < 6; i++) W4.A.mbAsk('say');
  const t0 = W4.now; W4.run(() => g4.phase !== 'me', 60000);
  ok(g4.phase === 'meDone' && W4.now - t0 <= 30000 - 10 * 3000 + 400, `CHAIR: a turn spent asking runs out and is graded (${((W4.now - t0) / 1000).toFixed(1)}s after the tenth request)`);
}

/* ================= FAMILY BEE NIGHT ================= */
{
  const guests = [{ name: 'Auntie Zanzibar', band: 'adult' }, { name: 'Grandpa Quixote', band: '6-7' }];
  const r = bee({ mode: 'family', family: [{}].concat(guests), bot: 'perfect-keen', guestMiss: 'Grandpa Quixote', t0: 41 });
  const g = r.g; const W = r.W;
  const players = g.field.map(s => s.kind + (s.profile ? '*' : '') + ':' + s.name);
  const mineRight = g.mine.filter(m => m.ok).length, guestRight = (g.guests || []).filter(x => x.ok).length;
  ok(g.field.length === 3 && g.field.every(s => s.kind === 'player') && g.field.filter(s => s.profile).length === 1, 'FAMILY: three players on one device, no rivals, one of them the profile child (' + players.join(', ') + ')');
  ok(guestRight > 0 && W.ledger.filter(e => e === 'answer').length === mineRight, `FAMILY: only the profile child is paid — ${mineRight} coins for their ${mineRight} words, none for the guests' ${guestRight}`);
  ok(W.band.length === g.mine.length && W.mastered.length === mineRight, 'FAMILY: only the profile child\'s words move their progress (' + W.band.length + ' logged, all theirs)');
  const written = W.stores.join('\n') + '\n' + W.saves.join('\n') + '\n' + JSON.stringify(W.child) + '\n' + JSON.stringify(W.mem);
  ok(!/Zanzibar|Quixote/.test(written), 'FAMILY: the guests\' names are never written — not the household, not a device key, not the child (' + (W.saves.length + W.stores.length) + ' writes checked)');
  const gq = g.field.find(s => s.name === 'Grandpa Quixote');
  ok(g.view === 'result' && r.ms <= CAP && !gq.in && g.places.find(x => x.s === gq).place === 3, 'FAMILY: the night ends inside the cap (' + Math.round(r.ms / 1000) + 's) with real elimination — ' + g.places.map(x => x.s.name + ' ' + x.place).join(', '));
}

/* ================= RANDOM, LEVEL, SFX ================= */
{
  let calls = 0, runs = 0;
  for (const mode of ['bee', 'champ']) for (let i = 0; i < 4; i++) { const r = bee({ mode, bot: i % 2 ? 'random' : 'perfect-passive', t0: 51 + i, level: 'medium' }); calls += r.W.random; runs++; }
  const fam = bee({ mode: 'family', family: [{}, { name: 'B', band: 'adult' }], t0: 59 }); calls += fam.W.random;
  ok(calls === 0, `RANDOM: not one Math.random() call in ${runs + 1} whole bees — rivals, slips and ties come from the bee's seed (${calls} calls)`);
  const a = bee({ bot: 'perfect-keen', t0: 61, level: 'medium' }), b = bee({ bot: 'perfect-keen', t0: 61, level: 'medium' });
  ok(a.ms === b.ms && a.g.places.map(x => x.place + x.s.n).join() === b.g.places.map(x => x.place + x.s.n).join(), 'RANDOM: the same seed is the same bee, rival for rival');
  const lv = bee({ bot: 'perfect-keen', t0: 62, level: 'hard' });
  const given = lv.g.mine.length, right = lv.g.mine.filter(m => m.ok).length;
  ok(lv.W.levelCalls.length === 1 && lv.W.levelCalls[0][0] === 'mockbee' && Math.abs(lv.W.levelCalls[0][1] - right / given) < 1e-9, `LEVEL: SB_LEVEL.after('mockbee', ${right}/${given}) once at the end of the bee`);
  const ch = bee({ mode: 'champ', bot: 'perfect-keen', t0: 63, level: 'hard' });
  ok(ch.W.levelCalls.length === 0, 'LEVEL: Champ (Finals words) never moves the Bee level');
  const sl = bee({ bot: 'silent', t0: 64, level: 'medium' });
  ok(sl.W.levelCalls.length === 1 && sl.W.levelCalls[0][1] === 0 && /warm up on/.test(sl.g.lvlNote), 'LEVEL: a bee of misses reports 0 and says the kind line ("' + sl.g.lvlNote + '")');
  const all = [].concat(a.W.sfxs, lv.W.sfxs, ch.W.sfxs, sl.W.sfxs, fam.W.sfxs);
  const bad = [...new Set(all.filter(k => !VALID_SFX.has(k)))];
  ok(all.length && !bad.length, `SFX: every sound the bee asks for exists (${all.length} calls${bad.length ? '; unknown: ' + bad.join(', ') : ''})`);
  const fin = ch.g.mine.filter(m => m.kind === 'oral' || m.kind === 'written').map(m => m.rec);
  const bee8 = bee({ bot: 'perfect-keen', t0: 65, ageBand: '14-18', level: 'champ' });
  const finalsInBee = bee8.g.mine.map(m => m.rec).filter(w => typeof w._h === 'number' ? w._h >= .78 : (w.y || 0) >= 8).length;
  ok(fin.length && fin.every(w => (typeof w._h === 'number' ? w._h >= .78 : (w.y || 0) >= 8)) && finalsInBee === 0, `WORDS: Finals words only in Champ (${fin.length} Champ words all Finals; ${finalsInBee} in a Bee at Champ level)`);
  const mineWords = a.g.mine.map(m => m.w);
  ok(new Set(mineWords).size === mineWords.length, 'WORDS: no word twice in one bee');
}

console.log(fails ? `\n${fails} FAILED` : '\nall good');
process.exit(fails ? 1 : 0);
