/* TEAM NIGHT ON A SIMULATED CLOCK (circuit/BEE-CIRCUIT.md §8.2, §13 tests 6 and 7; script.json teamNight and
   build[team-night]) — node, ~20 s

   mockbee.js's team mode in a node VM (the harness is tests/circuit-halls.cjs's: real word data, app3 stubbed, a fake
   clock, a recording stub of window.SB_CIRCUIT). Team Night is opened as the Atlas opens it, app.mbOpen({team:true}),
   and played by bots in the caller's chair:
     careful    asks the Pronouncer (the definition on the older lectern, then the origin) and calls from what the
                answers say, as a child is taught to; spells its own words right
     random     taps a random call and types random letters (the second try's answer: Continue)
     silent     calls the first thing on the list and types nothing
     shaky      careful, but misses the levelling word on its first try and once on its second
   What it holds:
     ROSTER     Ravenmere's five are script.json's (names, ages, tells); the lecterns and the caller categories are
                script.json's; Ravenmere wear existing, retired avatar art — every face draws (avatars.js), none is a
                sacred figure, none is a face or stand-in a Circuit rival wears, and a child wearing one of them
                meets that speller in a stand-in face
     OUTCOME    §13 t7: the Circuit wins on every seed, in every band, whoever plays — narrowly: Ravenmere lead after
                every one of their words (by one or two), the score is one behind before the levelling word, the child's
                levelling word always counts (it levels the score, a miss included: the second try ends right), Sloane
                misses the tiebreaker and Vesper, called to it, spells it after three questions
     CALLS      a call is graded on the first language the Pronouncer names ("French, from Latin" scores French only);
                every called word has exactly one right call at its lectern; a right call sends it to that seat; a call
                changed before Send is graded as the new call; "Needs questions" is offered only at the older lectern;
                every third Circuit word is the child's own
     DRAMA      the drama word is Greek-first at the younger lectern (6–7 and 8–10) and French-first at the older, never
                Latin-first, so the captain's Latin call is wrong; he asks the origin, re-calls it to Mira / Ines, and it
                is spelled right
     SECOND TRY the levelling word is one the child's record shows mastered; only it ever gets the second try (teammates'
                misses never spend it); the help is asked of that lectern's teammates only, one more after each miss,
                then the answer
     PAY (t6)   a random and a silent caller earn 0 coins; the careful one earns an answer coin for each of its own words
                right first time and the contest event once (merit ≥ 70%); the finish card says what the ledger took
     REPLAY     against the second team: Ravenmere never lead after their own word, the Circuit wins by one or more,
                no drama, no tiebreaker
     REPORT     SB_CIRCUIT.onTeamNight({place, of, words, calls:{right, of}, replay, levelMiss, lectern, …}) once, after
                lazyNeed('circuit'); levelMiss says whether the levelling word was missed first (circuit.js picks the
                levelling or levellingMiss beat by it)
     RANDOM     not one Math.random() call
   Proved by breaking — MB_SRC=<a scratch copy of mockbee.js with ONE change> (the tree never touched), TEAM_SEEDS=6,
   each watched to fail:
     the levelling word's second try ending wrong ........................ OUTCOME ×2, SECOND TRY, REPORT fail
     Ravenmere allowed a lead of three (d ≥ 3 → miss) .................... four OUTCOME checks fail
     the contest event on any night of four items (no 70% merit) ........ both PAY checks fail
     Sloane wearing Nova's face (koi) .................................... ROSTER fails
     no "Needs questions" for a homophone at the older lectern .......... both CALLS checks fail
     the second team free to lead in a replay ............................ REPLAY fails (margins down to -7)
     every teammate's help open at once (the action unguarded) .......... the escalation check fails — and FIRST it did
                                                                          not: the check counted only the enabled buttons;
                                                                          it now asks the action itself for a help not yet open
     a teammate's word decided by Math.random() .......................... RANDOM fails (422 calls)
     levelMiss always false .............................................. both new REPORT checks fail
   Run: node tests/circuit-team.cjs                                                                         */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { world, DATA } = require('./circuit-halls.cjs');
const APP = path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const SEEDS = +process.env.TEAM_SEEDS || 12;
const S = require(path.join(APP, 'circuit', 'script.json'));
const TN = S.teamNight;
const AGE = { '6-7': ['5-7', 6], '8-10': ['8-10', 9], '11-15': ['11-13', 12] };
/* a child with a record: forty words mastered on evidence (box 2+), the way the bee file would show them */
const MAST = (() => { const m = {}; (DATA.SB_DATA.nsf || []).filter(w => w && w.w && /^[a-z]{4,9}$/.test(w.w) && (w.y || 3) <= 4 && w.d && w.d.length > 8).slice(300, 340).forEach(w => { m[w.w] = { b: 2, due: 0, ok: 3, n: 3 }; }); return m; })();

function night(o) {
  const [ab, age] = AGE[o.band || '8-10'];
  const W = world({ ageBand: ab, age, t0: o.t0 || 0, avatar: o.avatar, circuit: o.circuit });
  W.child.mast = o.mast === false ? {} : MAST;
  W.A.mbOpen({ team: true, seed: o.seed, replay: o.replay });
  W.A.mbStart();
  const g = W.S.mb; const { A } = W; let last = '';
  let rs = 1237 + (o.seed || 0); const r = n => { rs = (rs * 16807) % 2147483647; return rs % n; };
  const wrong = w => { let s = ''; for (let i = 0; i < Math.max(3, w.length); i++) s += 'abcdefghijklmnopqrstuvwxyz'[r(26)]; return s === w ? s + 'q' : s; };
  const lev = { first: 0, second: 0 };
  const tick = () => {
    if (W.S.mb !== g || g.view === 'result' || (o.stopAtLevel && g.phase === 'me' && g.st && g.st.kind === 'level')) return;
    const key = [g.phase, g.i, g.tlev && g.tlev.misses, g.tlev && g.tlev.second, g.tlev && g.tlev.shown].join('|');
    if (key !== last) {
      last = key;
      const st = g.st, kind = o.bot;
      if (g.phase === 'tCall') {
        const opts = W.ctx.MOCKBEE.circuit.calls().filter(x => x[g.lect]).map(x => x.call);
        let pick;
        if (kind === 'careful' || kind === 'shaky') {
          if (g.lect === '11-15') A.mbAsk('def');
          if (W.ctx.MOCKBEE.chair(st.w).some(c => c.k === 'org')) A.mbAsk('org');
          W.ctx.render(); const html = W.ctx._html;
          const org = (W.ctx.MOCKBEE.chair(st.w).find(c => c.k === 'org') || {}).answer || '';
          const f = W.ctx.MOCKBEE.circuit.firstLang(org).toLowerCase();
          const call = /sounds like another word/.test(html) ? 'Needs questions' : !f ? "Nobody's heard it"
            : ({ greek: 'Greek', latin: 'Latin', french: 'French', 'old english': 'Old English' })[f] || 'Steady beat';
          pick = opts.indexOf(call);
          if (o.change) { A.tnPick((pick + 1) % opts.length); }
        } else pick = kind === 'random' ? r(opts.length) : 0;
        W.later(800, () => { A.tnPick(pick); A.tnSend(); });
      } else if (g.phase === 'me') {
        const w = st.w.w, L = g.tlev;
        if (L && L.shown) W.later(600, () => A.tnLevelOn());
        else {
          let t = kind === 'silent' ? '' : kind === 'random' ? wrong(w) : w;
          if (kind === 'shaky' && L && !L.second && !lev.first) { lev.first = 1; t = wrong(w); }
          else if (kind === 'shaky' && L && L.second && !lev.second) { lev.second = 1; t = wrong(w); if (o.help) A.tnHelp(W.ctx.MOCKBEE.circuit.lectern()[g.lect][0]); }
          W.later(1500, () => { A.mbType(t); A.mbSpell(); });
        }
      } else if (g.phase === 'meDone' && g.hold) W.later(900, () => A.mbGoOn());
    }
    W.later(100, tick);
  };
  W.later(100, tick);
  W.run(() => W.S.mb !== g || g.view === 'result' || (o.stopAtLevel && g.phase === 'me' && g.st && g.st.kind === 'level'), 60 * 60 * 1000);
  return { W, g };
}
/* the log's c and r: the score after a Ravenmere word, before the child's word is counted */

/* ---------------- ROSTER ---------------- */
{
  const W = world({}); const C = W.ctx.MOCKBEE.circuit;
  const rav = C.raven();
  ok(JSON.stringify(rav.map(r => [r.id, r.name, r.age, r.tell])) === JSON.stringify(TN.ravenmereRoster.map(r => [r.id, r.name, r.age, r.tell])), 'ROSTER: Ravenmere\'s five are script.json\'s — ids, names, ages and tells');
  ok(JSON.stringify(C.lectern()) === JSON.stringify(TN.roster.lectern), 'ROSTER: the two lecterns are script.json\'s (the younger: Nova, Rafi, Mira, Suki; the older: Ines, Kwame, Theo, Vesper)');
  const cats = C.calls().map(x => [x.call, x['8-10'], x['11-15']]);
  const want = TN.callerCategories.map(x => [x.call, x['8-10'], x['11-15']]);
  ok(JSON.stringify(cats) === JSON.stringify(want), 'ROSTER: the caller categories and the seat each one sends a word to are script.json\'s');
  /* the faces: avatars.js, as the page runs it */
  const ac = { window: null, console }; ac.window = ac; vm.createContext(ac); vm.runInContext(fs.readFileSync(path.join(APP, 'avatars.js'), 'utf8'), ac);
  const A = ac.SB_AVATARS; const byId = id => A.all.find(a => a.id === id);
  const rivals = W.ctx.MOCKBEE.faces().map(f => f.id); const rivAlts = W.ctx.MOCKBEE.rivals('zzz').map(r => r.face);
  const alts = ['germy', 'luna', 'atom', 'wisp', 'rocket', 'saturn', 'robo', 'fae', 'ninja', 'crystal'];
  const faces = rav.flatMap(r => [r.own, r.alt]);
  const bad = faces.filter(f => !byId(f) || byId(f).sacred || !A.archived.has(f) || rivals.includes(f) || alts.includes(f));
  const SACREDISH = /god|goddess|deity|buddha|naga|vasuki|amaterasu|anubis|isis|ra$|freya/i;
  ok(!bad.length && new Set(faces).size === 10 && faces.every(f => !SACREDISH.test(f) && !SACREDISH.test(byId(f).name)), `ROSTER: Ravenmere wear existing retired art (${rav.map(r => r.name + ' ' + r.own).join(', ')}) — every face and stand-in draws, none sacred, none a Circuit rival's face or stand-in, ten different` + (bad.length ? ' — ' + bad.join(', ') : ''));
  const clash = rav.filter(r => { const W2 = world({ avatar: r.own }); return W2.ctx.MOCKBEE.circuit.raven().find(x => x.id === r.id).face !== r.alt; });
  ok(!clash.length, 'ROSTER: a child wearing a Ravenmere speller\'s face meets that speller in their stand-in');
}

/* ---------------- the nights ---------------- */
const runs = [];
for (const band of Object.keys(AGE)) for (const bot of ['careful', 'random', 'silent', 'shaky']) for (let s = 0; s < SEEDS; s++) {
  const n = night({ band, bot, seed: 900 + s * 37, t0: s }); runs.push(Object.assign({ band, bot, s }, n));
}
console.log(`       played ${runs.length} nights (3 bands × 4 callers × ${SEEDS} seeds)`);
const say = bad => bad.length ? ' — ' + bad.slice(0, 4).map(x => `${x.band}/${x.bot}/${x.s}`).join(' · ') + ` (${bad.length} of ${runs.length})` : '';
let b;
b = runs.filter(x => !(x.g.view === 'result' && x.g.won && x.g.score.c > x.g.score.r));
ok(!b.length, `OUTCOME (§13 t7): the Circuit wins on every seed, in every band, whoever calls (${runs.length} nights)` + say(b));
b = runs.filter(x => x.g.margin !== 1);
ok(!b.length, 'OUTCOME: narrowly — by one, decided by the tiebreaker' + say(b));
b = runs.filter(x => { const L = x.g.tlog; return L.filter(e => e.k === 'rav').some(e => !(e.r - e.c >= 1 && e.r - e.c <= 2)); });
ok(!b.length, 'OUTCOME: Ravenmere lead after every one of their regulation words, by one or two' + say(b));
b = runs.filter(x => { const g = x.g; const i = g.steps.findIndex(st => st.kind === 'level'); const L = g.tlog;
  const before = L.filter(e => e.i === i - 1 && /^(rav)$/.test(e.k)).pop(); const lv = L.filter(e => e.i === i && e.k === 'level').pop();
  return !(before && before.r === before.c + 1 && lv && lv.ok && lv.c + 1 === lv.r); });
ok(!b.length, 'OUTCOME: the score is one behind before the levelling word, and the child\'s levelling word always counts — it levels the score, missed first or not' + say(b));
b = runs.filter(x => { const L = x.g.tlog; const tb = L.find(e => e.k === 'tbRav'); const t = L.find(e => e.k === 'tiebreak'); const w = L.find(e => e.k === 'won');
  return !(tb && !tb.ok && tb.who === 'sloane' && t && t.to === 'goldlegend' && t.asks.length === 3 && w); });
ok(!b.length, 'OUTCOME: the tiebreaker — Sloane misses, the captain calls it to Vesper, she asks three questions and spells it' + say(b));

/* ---------------- CALLS ---------------- */
{
  const W = world({}); const C = W.ctx.MOCKBEE.circuit;
  const fr = { w: 'zzzq', o: 'French, from Latin', d: 'x' };
  ok(C.firstLang('French, from Latin') === 'French' && C.classify(fr, '8-10') === 'French' && C.classify({ w: 'qq', o: 'Latin/Greek' }, '8-10') === 'Latin' && C.classify({ w: 'qq', o: '' }, '11-15') === "Nobody's heard it",
    'CALLS: a call is graded on the first language the Pronouncer names — "French, from Latin" is French, never Latin');
}
b = runs.filter(x => x.g.steps.filter(st => st.kind === 'call').some(st => { const opts = x.W.ctx.MOCKBEE.circuit.calls().filter(c => c[x.g.lect]).map(c => c.call);
  return opts.filter(c => c === st.cls).length !== 1 || x.W.ctx.MOCKBEE.circuit.classify(st.w, x.g.lect) !== st.cls; }));
ok(!b.length, 'CALLS: every called word has exactly one right call at its lectern, the one its data gives' + say(b));
b = runs.filter(x => x.bot === 'careful' && x.g.calls.some(c => !c.right));
ok(!b.length, 'CALLS: a caller who asks the Pronouncer and calls by what the answers say is right every time' + say(b));
b = runs.filter(x => { const ws = x.g.steps.filter(st => st.side === 'c' && !st.tb).map(st => st.kind); return ws.some((k, i) => (i + 1) % 3 === 0 && k !== 'own' && !(i + 1 === 8)); });
ok(!b.length, 'CALLS: every third Circuit word is the child\'s own to spell' + say(b));
b = runs.filter(x => x.g.lect === '8-10' && x.g.calls.some(c => c.call === 'Needs questions'));
ok(!b.length && runs.some(x => x.g.lect === '11-15' && x.g.steps.some(st => st.cls === 'Needs questions')), 'CALLS: "Needs questions" is offered only at the older lectern (and there it is a real call)');
{
  const ch = night({ band: '8-10', bot: 'careful', seed: 4242, change: true });
  ok(ch.g.calls.length && ch.g.calls.every(c => c.right), 'CALLS: a call changed before Send is graded as the new call (the careful caller first marks the wrong one, then changes it)');
  /* a right call sends the word to its seat */
  const sent = runs.filter(x => x.bot === 'careful').every(x => x.g.tlog.filter(e => e.k === 'team').every(e => { const c = x.W.ctx.MOCKBEE.circuit.calls().find(cc => cc[x.g.lect] === e.who); return !!c; }));
  ok(sent, 'CALLS: a called word goes to the seat its call names');
}

/* ---------------- DRAMA ---------------- */
b = runs.filter(x => { const L = x.g.tlog; const d = L.find(e => e.k === 'drama'), rc = L.find(e => e.k === 'recall'), ok2 = L.find(e => e.k === 'dramaRight');
  const older = x.g.lect === '11-15';
  return !(d && rc && ok2 && d.first === 'Latin' && d.to === (older ? 'samurai' : 'beaker') && d.origin === (older ? 'French' : 'Greek') && rc.call === (older ? 'French' : 'Greek') && rc.to === (older ? 'melody' : 'astro')); });
ok(!b.length, 'DRAMA: the drama word is Greek-first at the younger lectern (6–7 and 8–10) and French-first at the older, never Latin-first; the captain\'s Latin call to Rafi / Kwame is wrong, and his re-call to Mira / Ines is spelled right' + say(b));

/* ---------------- SECOND TRY ---------------- */
b = runs.filter(x => { const st = x.g.steps.find(s2 => s2.kind === 'level'); return !(st && st.mastered && MAST[st.w.w]); });
ok(!b.length, 'SECOND TRY: the levelling word is one the child\'s record shows mastered' + say(b));
b = runs.filter(x => { const L = x.g.tlog; const lvI = x.g.steps.findIndex(st => st.kind === 'level'); return L.some(e => (e.k === 'levelMiss' || e.k === 'secondMiss' || e.k === 'help') && e.i !== lvI); });
ok(!b.length && runs.some(x => x.g.tlog.some(e => e.k === 'team' && !e.ok)), 'SECOND TRY: only the levelling word ever takes the second try — teammates\' misses never spend it' + say(b));
{
  const sh = night({ band: '8-10', bot: 'shaky', seed: 77, help: true });
  const L = sh.g.tlog; const i = sh.g.steps.findIndex(st => st.kind === 'level');
  ok(L.some(e => e.k === 'levelMiss') && L.some(e => e.k === 'secondMiss') && L.some(e => e.k === 'level' && e.ok && e.second) && sh.g.won, 'SECOND TRY: missed on the first try and once on the second, the levelling word still ends right and the night is won');
  const html = {};
  for (const band of ['8-10', '11-15']) {
    const { W, g } = night({ band, bot: 'careful', seed: 5, stopAtLevel: true });
    W.A.mbType('zzzz'); W.A.mbSpell();                      /* the first try, missed: the second try opens */
    const order = [], early = [];
    const lect = W.ctx.MOCKBEE.circuit.lectern()[g.lect];
    for (let k = 0; k < 3; k++) { W.ctx.render(); order.push((W.ctx._html.match(/data-act="tnHelp" data-arg="\w+">/g) || []).length);
      const ahead = lect[k + 2]; if (ahead) { W.A.tnHelp(ahead); if (g.tlev.help[ahead]) early.push(ahead); }   /* the action refuses one not yet open */
      W.A.mbType('zzzz'); W.A.mbSpell(); }
    W.ctx.render(); html[band] = { h: W.ctx._html, order, early, shown: g.tlev && g.tlev.shown };
  }
  const names = h => (h.match(/data-act="tnHelp" data-arg="(\w+)"/g) || []).map(x => x.split('"')[3]);
  const y = names(html['8-10'].h), o2 = names(html['11-15'].h);
  ok(y.join() === 'koi,beaker,astro,snowfox' && o2.join() === 'melody,samurai,scopey', `SECOND TRY: the help is asked of that lectern's teammates only — the younger: ${y.join(', ')}; the older: ${o2.join(', ')} (Vesper gives none)`);
  ok(html['8-10'].order[0] === 1 && html['8-10'].order[1] === 2 && html['8-10'].shown && /The word is <b>/.test(html['8-10'].h), `SECOND TRY: one more teammate's help after each miss (${html['8-10'].order.join(' → ')} open), then the answer stands on the card`);
  const early = html['8-10'].early.concat(html['11-15'].early);
  ok(!early.length, 'SECOND TRY: a teammate whose help is not open yet gives none, by key or tap — the action refuses it, not only the button' + (early.length ? ' — ' + early.join(', ') : ''));
}

/* ---------------- PAY ---------------- */
b = runs.filter(x => (x.bot === 'random' || x.bot === 'silent') && (x.W.ledger.length || x.g.pay));
ok(!b.length, `PAY (§13 t6): a random and a silent caller earn 0 coins (${runs.filter(x => x.bot === 'random' || x.bot === 'silent').length} nights)` + say(b));
b = runs.filter(x => { const own = x.g.mine.filter(m => m.kind === 'team'); const ans = x.W.ledger.filter(e => e === 'answer').length; const con = x.W.ledger.filter(e => e === 'contest').length;
  const items = own.length + x.g.calls.length, merit = items ? (own.filter(m => m.ok).length + x.g.calls.filter(c => c.right).length) / items : 0;
  return x.W.ledger.some(e => e !== 'answer' && e !== 'contest') || ans !== own.filter(m => m.ok).length || con !== (items >= 4 && merit >= .7 ? 1 : 0) || x.g.pay !== ans + 10 * con; });
ok(!b.length, 'PAY (§13 t6): an answer coin for each of the child\'s own words right first time, the contest event once at 70% merit (own words and calls), nothing else — and the finish card says what the ledger took' + say(b));
ok(runs.filter(x => x.bot === 'careful').every(x => x.W.ledger.includes('contest')), 'PAY: the careful caller earns the contest event every night');
b = runs.filter(x => x.g.tlog.some(e => e.k === 'level' && e.second) && x.g.mine.filter(m => m.kind === 'team').length !== x.g.steps.filter(st => st.side === 'c' && (st.kind === 'own' || st.kind === 'level')).length + x.g.calls.filter(c => (x.W.ctx.MOCKBEE.circuit.calls().find(cc => cc.call === c.call) || {})[x.g.lect] === 'you').length);
ok(!b.length, 'PAY: a second try is help, never a second paid answer' + say(b));

/* ---------------- REPLAY ---------------- */
const reps = [];
for (const band of Object.keys(AGE)) for (const bot of ['careful', 'random']) for (let s = 0; s < 10; s++) reps.push(Object.assign({ band, bot, s }, night({ band, bot, seed: 31 + s, replay: true })));
b = reps.filter(x => !(x.g.won && x.g.margin >= 1 && x.g.replay && !x.g.tlog.some(e => e.k === 'drama' || e.k === 'tiebreak') && x.g.tlog.filter(e => e.k === 'rav').every(e => e.r <= e.c)));
ok(!b.length, `REPLAY: against the second team the Circuit wins by one or more (margins ${[...new Set(reps.map(x => x.g.margin))].sort().join(', ')}), Ravenmere never lead after their own word, no drama, no tiebreaker` + say(b));

/* ---------------- REPORT, RANDOM ---------------- */
b = runs.filter(x => { const c = x.W.circ.filter(e => e.fn === 'onTeamNight'); if (c.length !== 1 || !c[0].lazyFirst) return true; const r = c[0].r;
  return !(r.place === 1 && r.of === 2 && Array.isArray(r.words) && r.calls && r.calls.of === x.g.calls.length && r.calls.right === x.g.calls.filter(cc => cc.right).length && r.replay === false
    && r.levelMiss === x.g.tlog.some(e => e.k === 'levelMiss') && r.lectern === x.g.lect && r.words.every(w => typeof w.asks === 'number')); });
ok(!b.length, 'REPORT: SB_CIRCUIT.onTeamNight({place:1, of:2, words, calls:{right, of}, replay, levelMiss, lectern, …}) once a night, after lazyNeed(\'circuit\')' + say(b));
ok(runs.some(x => x.W.circ.some(e => e.fn === 'onTeamNight' && e.r.levelMiss)) && runs.some(x => x.W.circ.some(e => e.fn === 'onTeamNight' && !e.r.levelMiss)), 'REPORT: levelMiss is told both ways (the shaky caller misses it first; the careful one does not)');
const quiet = night({ band: '8-10', bot: 'careful', seed: 3, circuit: false });
ok(quiet.g.won && quiet.g.view === 'result', 'REPORT: with no SB_CIRCUIT on the page Team Night plays the same and tells nobody');
const calls = runs.concat(reps).reduce((t, x) => t + x.W.random, 0);
ok(calls === 0, `RANDOM: not one Math.random() call in ${runs.length + reps.length} nights (${calls})`);
console.log(fails ? `\n${fails} FAILED` : '\nall good');
process.exit(fails ? 1 : 0);
