/* THE BEE CIRCUIT'S MAIL — the season reaches its end on every path, fairly, and never expires (circuit/BEE-CIRCUIT.md
   §13 tests 3, 4 and 5; build rules story-order, clue-cards-ride-mail, slots, no-placing, bee-file-button) — @check

   circuit.js runs here in a vm beside the generated circuit-data.js, with app3's names stubbed (state, active, save,
   say, addMiss) and app3's OWN trick classifier (trickAnal / spellDiff, cut from app3.js by tools/app3-closure.cjs), so
   the {weak} slot reads the families the page reads. Bots play the season through the API the other Circuit builds call
   (onHallOpen, onHall, onTeamNight, onRegionDone, onLevelUp, act, caseUpdate):
     3  MAIL NEVER EXPIRES: a season delivered, the clock moved on 365 days, every reader and hook called — nothing is
        removed, reordered or rewritten; reading a piece only marks it read.
     4  BRANCHING: a careful bot (wins, asks, accuses right first time, Team Night last) and twenty random bots (random
        places and letters, random hook order including replays, Team Night before OR after naming V., wrong guesses,
        either turn choice, any closing reply) all reach the Team Night coda, and every thread's final piece is
        delivered on every path (Dax's captain's postcard, the closing letter and the sting, Vesper's letter and the
        tiebreaker, Pip's last word, Theo's 1,977, Kwame at the turn). The dax.helped choice changes ONE line only.
     5  FAIR PLAY: on every path, when naming V. first opens, every V. clue card (script fairPlay.vClues) and the three
        clearing cards are already in the mail — no case touched; Dax's clearing (his notes and his card) arrives with
        Round VIII's mail, before Round IX's invitation; V. cannot be named before Round IX's mail, and a wrong name
        delivers nothing.
     STORY ORDER: a hall waits on the previous hall's mail; a hall played out of order holds its story until then; Team
        Night played first holds the sting (and the coda after it) until the closing letter, and no Team Night line names
        Vale before it; a case pin is available only after its trigger round's mail, and opens late after the next one.
     SLOTS: no raw {token} reaches a piece; a child with no misses reads the round's "No weak spot yet." advice; a child
        who never asks reads "You guess instead of asking."; a child who asked on every miss never does; {missed} prints
        the word as spelled (Wednesday, capital W); {asked} is the hall's count.
     L6: above/below is the child's place against the headliner (r.above, else r.headPlace, else a win).
     BEE FILE: one tap files every missed word once (addMiss(…, 'mark'), Mock Bee's own filing); a second tap files
        nothing; a hall with no miss has no button; replays add a bee file and keep the best stamp; the story never repeats.
     L11 / no chance: circuit.js pays nothing (no addCoins / payG / spendCoins) and a whole season runs with Math.random
        throwing.
   module.exports = { harness, careful, randomBot } — tests/circuit-store.cjs and circuit-data.cjs use the harness.
   SB_ROOT=<dir> runs against another tree (a scratch root of symlinks with one file replaced).
   PROVED BY BREAKING (each in a scratch root, one file replaced, the tree never touched — see circuit/BUILD-core.md):
     - circuit.js mail filtered by age (`o.mail = o.mail.filter(m => now() - m.at < 300 days)` in norm) → test 3 fails;
     - circuit.js cascade without the story-order wait (deliver a hall's story on its own result) → story order and
       test 5 (Round VII's invitation before Round VI's V. note) fail;
     - circuit.js delivering Team Night's held lines at Team Night → story order fails ("names Vale before");
     - circuit.js dropping clue2 from DEFAULT_ORDER → test 5 fails (ratchet-cleared not delivered);
     - circuit.js turn.scene rendering the chosen label as well as the line → test 4's "one line only" fails;
     - circuit.js `file` action without its filed flag → the bee-file "second tap files nothing" fails;
     - circuit.js fill() returning the raw token when no value → the slot checks fail.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/circuit-mail.cjs                                       */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const APP = path.resolve(__dirname, '..');
const ROOT = process.env.SB_ROOT ? path.resolve(process.env.SB_ROOT) : APP;

/* ---------------------------------------------------------------- the harness */
let TRICK_SRC = null;
function trickSrc() {
  if (TRICK_SRC == null) { const { closure } = require(path.join(APP, 'tools/app3-closure.cjs')); TRICK_SRC = closure(['trickAnal', 'spellDiff']); }
  return TRICK_SRC;
}
const KID = (name, band) => ({ name, age: band === '11-13' ? 12 : 9, ageBand: band || '8-10', avatar: 'fox', missed: [], mast: {}, trail: { lap: 1, done: {}, st: {} } });
function harness(o) {
  o = o || {};
  const clock = { t: o.t || Date.UTC(2026, 9, 15, 12) };
  const RealDate = Date;
  class FD extends RealDate { constructor(...a) { if (a.length) super(...a); else super(clock.t); } static now() { return clock.t; } }
  const S = { children: o.children || [KID('Ahana')], activeIdx: 0 };
  const log = { save: 0, say: [], render: 0, addMiss: [] };
  const ctx = {
    console, Date: FD, setTimeout: () => 0, state: S,
    active: () => S.children[S.activeIdx], save: () => { log.save++; }, render: () => { log.render++; }, say: (t) => { log.say.push(String(t)); },
    addMiss: (w, mark) => { log.addMiss.push([w.w, mark]); const c = S.children[S.activeIdx]; (c.missed = c.missed || []).unshift({ w: w.w }); },
    wordIndex: () => ({}), app: { openCollection() { S.nav = 'collection'; } }
  };
  if (o.demo) ctx.SB_DEMO = true;
  ctx.window = ctx;
  vm.createContext(ctx);
  if (o.noRandom) vm.runInContext('Math.random = function () { throw new Error("Math.random was called"); };', ctx);
  vm.runInContext(trickSrc() + '\nwindow.SB_TRICK = { anal: trickAnal, diff: spellDiff };', ctx, { filename: 'app3-closure' });
  if (o.trail) { ctx.SB_TRAIL = o.trail.T; ctx.SB_TRAIL_MAP = o.trail.M; }
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'circuit-data.js'), 'utf8'), ctx, { filename: 'circuit-data.js' });
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'circuit.js'), 'utf8'), ctx, { filename: 'circuit.js' });
  const C = ctx.SB_CIRCUIT, D = ctx.SB_CIRCUIT_DATA;
  const kid = () => S.children[S.activeIdx];
  const keysOf = () => C.state().mail.map((m) => m.key);
  const textOf = (key) => { const i = C.state().mail.findIndex((m) => m.key === key); return i < 0 ? null : C.piece(null, i).text; };
  return { C, D, S, log, clock, ctx, kid, keysOf, textOf, acts: D.rounds.map((r) => r.act) };
}
/* a seeded generator for the random bots (the bots may roll dice; the app may not) */
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const WORDS = ['knife', 'phantom', 'rhythm', 'separate', 'ballet', 'Wednesday', 'reconnaissance', 'cereal', 'chorus', 'listen'];

/* the careful bot: every hall in order, wins, asks, reads everything, chooses, names V. first time, Team Night last */
function careful(h, opt) {
  opt = opt || {};
  const { C, acts } = h; const watch = opt.watch || (() => {});
  acts.forEach((a, i) => {
    C.onHallOpen(a); watch('open ' + a);
    C.onHall(a, { place: 1, of: 7, above: true, words: WORDS.slice(0, 4).map((w) => ({ w, ok: true, asks: 3 })), missed: [] }); watch('hall ' + a);
    if (i === 7 && opt.helped != null) C.act('dax|' + opt.helped);
    if (opt.teamFirst && i === 8) { C.onTeamNight({ place: 1, of: 2, words: [{ w: 'listen', ok: true, asks: 1 }], calls: { right: 8, of: 9 } }); watch('team'); }
  });
  h.C.state().mail.forEach((m, i) => C.act('read|' + i));
  C.act('accuseon'); C.act('accuse|vale'); watch('accuse');
  C.act('closing|' + (opt.closing || 0));
  if (!opt.teamFirst) { C.onTeamNight({ place: 1, of: 2, words: [{ w: 'listen', ok: true, asks: 1 }], calls: { right: 8, of: 9 } }); watch('team'); }
}
/* a random bot: plays only what is open (as the halls build lets it), in a random order, with replays and stray hooks */
function randomBot(h, seed, watch) {
  const R = rng(seed); const { C, acts } = h; watch = watch || (() => {});
  const pick = (a) => a[Math.floor(R() * a.length)];
  const result = () => { const of = 4 + Math.floor(R() * 6); const place = 1 + Math.floor(R() * of);
    const words = WORDS.slice(0, 2 + Math.floor(R() * 5)).map((w) => ({ w, ok: R() < 0.6, asks: Math.floor(R() * 4) }));
    const r = { place, of, words, missed: words.filter((x) => !x.ok).map((x) => x.w), replay: false };
    const style = R(); if (style < 0.4) r.above = R() < 0.5; else if (style < 0.7) r.headPlace = 1 + Math.floor(R() * of); return r; };
  let named = false, teamPlayed = false; const teamFirst = R() < 0.5;
  for (let step = 0; step < 400; step++) {
    const open = acts.filter((a) => C.hallUnlocked(a));
    const moves = [];
    open.forEach((a) => moves.push(() => { C.onHallOpen(a); C.onHall(a, result()); return 'hall ' + a; }));
    moves.push(() => { C.onLevelUp(2 + Math.floor(R() * 20)); return 'level'; });
    moves.push(() => { C.onRegionDone(pick(acts)); return 'region'; });
    moves.push(() => { const o = C.state(); if (o.mail.length) C.act('read|' + Math.floor(R() * o.mail.length)); return 'read'; });
    if (C.state().mail.some((m) => m.key === 'turn.scene') && R() < 0.5) moves.push(() => { C.act('dax|' + (R() < 0.5)); return 'dax'; });
    if (C.teamOpen() && (!teamFirst || !teamPlayed) && (teamFirst || named)) moves.push(() => { teamPlayed = true; const r = result(); r.calls = { right: Math.floor(R() * 6), of: 6 }; C.onTeamNight(r); return 'team'; });
    if (C.accuseOpen()) moves.push(() => { const s = pick(['vesper', 'pronouncer', 'ratchet', 'dax', 'vale']); C.act('accuseon'); C.act('accuse|' + s); if (s === 'vale') named = true; return 'accuse ' + s; });
    if (named && C.state().closing == null) moves.push(() => { C.act('closing|' + Math.floor(R() * 3)); return 'closing'; });
    watch(pick(moves)());
    if (named && teamPlayed && C.state().mail.some((m) => m.key === 'teamNight.beats.coda')) break;
  }
}

module.exports = { harness, careful, randomBot, rng, KID, WORDS };
if (require.main !== module) return;

let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const S = JSON.parse(fs.readFileSync(path.join(ROOT, 'circuit/script.json'), 'utf8'));
const clueKey = (D, id) => { for (let i = 0; i < D.rounds.length; i++) for (const k of ['clue', 'clue2']) { const c = D.rounds[i].pieces[k]; if (c && c.id === id) return 'rounds[' + i + '].pieces.' + k; } return null; };
const FINALS = ['teamNight.beats.daxPostcard', 'accusation.closingLetter', 'teamNight.beats.sting', 'teamNight.beats.stingAfter', 'teamNight.beats.finalWord',
  'rounds[8].pieces.pip', 'rounds[8].pieces.dax', 'turn.kwame', 'turn.notes', 'teamNight.beats.mei', 'teamNight.beats.coda'];

/* ---- 3. mail never expires ---- */
{
  const h = harness(); careful(h);
  const before = JSON.stringify(h.C.state().mail);
  const texts = h.C.state().mail.map((m, i) => h.C.piece(null, i).text);
  h.clock.t += 365 * 86400000;
  const { C, acts } = h;
  C.state(); C.mailWaiting(); acts.forEach((a) => { C.boardExtras(a); C.hallUnlocked(a); }); C.teamOpen(); C.accuseOpen(); C.chip(); C.postHTML();
  C.visitorFor('u93'); ['mail', 'board', 'visitors', 'stamps'].forEach((v) => { C.act('view|' + v); C.postHTML(); });
  C.onHall('meadow', { place: 2, of: 6, words: [{ w: 'knife', ok: true }], missed: [] });
  const after = h.C.state().mail;
  ok(after.length > 100 && JSON.stringify(after.slice(0, JSON.parse(before).length)) === before,
    `365 days on, every piece of a season's mail is still there, in its order, unchanged (${JSON.parse(before).length} pieces; a replay only adds)`);
  ok(after.slice(0, texts.length).every((m, i) => h.C.piece(null, i).text === texts[i]), 'and every piece reads the same as the day it came (slots are frozen when delivered)');
  ok(!/expire|ttl|until/i.test(JSON.stringify(after.map((m) => Object.keys(m)))), 'no piece carries an expiry: {key, at, read, d}');
}

/* ---- 4. branching: careful and random bots reach the coda; every thread's last piece is delivered ---- */
{
  const paths = [];
  { const h = harness(); careful(h); paths.push(['careful', h]); }
  { const h = harness(); careful(h, { teamFirst: true }); paths.push(['careful, Team Night first', h]); }
  for (let s = 1; s <= 20; s++) { const h = harness(); randomBot(h, s * 7919); paths.push(['random ' + s, h]); }
  const miss = [];
  for (const [n, h] of paths) { const k = new Set(h.keysOf()); const lost = FINALS.filter((f) => !k.has(f));
    const vesper = ['rounds[8].pieces.above', 'rounds[8].pieces.below'].some((x) => k.has(x));
    if (lost.length || !vesper) miss.push(n + ': ' + lost.concat(vesper ? [] : ['Vesper\'s letter']).join(', ')); }
  ok(!miss.length, `${paths.length} paths (2 careful, 20 random) all reach the Team Night coda with every thread's final piece` + (miss.length ? ' — ' + miss.slice(0, 4).join(' | ') : ''));
  const lastIsCoda = paths.filter(([, h]) => { const k = h.keysOf().filter((x) => /^(rounds|turn|teamNight|accusation)/.test(x)); return k[k.length - 1] === 'teamNight.beats.coda'; }).length;
  ok(lastIsCoda === paths.length, `the coda is the last story piece on every path (${lastIsCoda}/${paths.length})`);
  /* dax.helped: the same season twice, the choice the only difference */
  const a = harness(), b = harness(); careful(a, { helped: true }); careful(b, { helped: false });
  const A = a.C.state().mail, B = b.C.state().mail;
  const diffs = A.map((m, i) => [m.key, a.C.piece(null, i).text, b.C.piece(null, i).text]).filter((x) => x[1] !== x[2]);
  const T = a.D.turn.choice.line;
  ok(A.length === B.length && diffs.length === 1 && diffs[0][0] === 'turn.scene' && diffs[0][1].replace(T.true, '') === diffs[0][2].replace(T.false, ''),
    'the turn\'s choice (dax.helped) changes one line only: ' + (diffs.length === 1 ? diffs[0][0] : diffs.map((d) => d[0]).join(', ')));
  ok(a.C.state().dax.helped === true && b.C.state().dax.helped === false, 'and it is kept as dax.helped true / false');
  /* the choice is pre-written (L7) and made once */
  b.C.act('dax|true'); ok(b.C.state().dax.helped === false, 'the choice cannot be changed afterwards');
}

/* ---- 5. fair play ---- */
{
  const need = S.fairPlay.vClues.map((v) => v.clue).concat(['vesper-denies', 'ratchet-cleared', 'dax-cleared']);
  const bad = [];
  const check = (n, h) => { let seen = false;
    return (what) => { if (seen || !h.C.accuseOpen()) return; seen = true; const k = new Set(h.keysOf());
      const lost = need.filter((id) => !k.has(clueKey(h.D, id))); if (lost.length) bad.push(n + ' (' + what + '): ' + lost.join(', ')); }; };
  const runs = [];
  { const h = harness(); const w = check('careful', h); careful(h, { watch: w }); runs.push(['careful', h]); }
  for (let s = 1; s <= 25; s++) { const h = harness(); const w = check('random ' + s, h); randomBot(h, s * 104729, w); runs.push(['random ' + s, h]); }
  ok(need.length === 10 && need.every((id) => clueKey(runs[0][1].D, id)), 'the ten cards (seven V. clues, three clearings) all ride a round\'s mail (clue / clue2)');
  ok(!bad.length, `on ${runs.length} paths, every V. clue and clearing card is in the mail the moment naming V. opens — no case played` + (bad.length ? ' — ' + bad.slice(0, 3).join(' | ') : ''));
  const orderBad = runs.filter(([, h]) => { const k = h.keysOf(); const r9 = k.indexOf('rounds[8].pieces.inv');
    return ['rounds[7].pieces.clue', 'turn.notes', 'turn.kwame'].some((x) => { const i = k.indexOf(x); return i < 0 || (r9 >= 0 && i > r9); }); }).map(([n]) => n);
  ok(!orderBad.length, 'Dax is cleared at VIII: his notes and his card arrive with Round VIII\'s mail, before Round IX\'s invitation' + (orderBad.length ? ' — ' + orderBad.join(', ') : ''));
  /* V. cannot be named early, and a wrong name delivers nothing */
  const h = harness(); h.acts.slice(0, 8).forEach((a) => h.C.onHall(a, { place: 1, of: 6, above: true, words: [] }));
  const n0 = h.C.state().mail.length; h.C.act('accuseon'); h.C.act('accuse|vale');
  ok(!h.C.accuseOpen() && h.C.state().mail.length === n0 && h.C.state().board.accused == null, 'before Round IX\'s mail V. cannot be named (nothing delivered)');
  h.C.onHall('stage', { place: 2, of: 6, above: false, words: [] });
  const n1 = h.C.state().mail.length; h.C.act('accuseon'); h.C.act('accuse|pronouncer');
  ok(h.C.accuseOpen() && h.C.state().mail.length === n1 && /upright|straight up/.test(h.C.postHTML()), 'a wrong name delivers nothing and shows that suspect\'s own look-again line');
}

/* ---- story order ---- */
{
  const h = harness(); const { C, acts } = h;
  ok(C.hallUnlocked('meadow') && !C.hallUnlocked('library') && !C.hallUnlocked('team'), 'only Round I\'s hall is open at the start (Round II waits on Round I\'s mail)');
  acts.slice(0, 5).forEach((a) => C.onHall(a, { place: 1, of: 6, above: true, words: [] }));
  ok(!C.hallUnlocked('junkyard') && !C.onHallOpen('junkyard'), 'Round VII\'s hall and invitation wait while Round VI is unplayed (onHallOpen refuses)');
  C.onHall('junkyard', { place: 1, of: 6, above: true, words: [] });   // played out of order (a build that ignored hallUnlocked)
  let k = h.keysOf();
  ok(!k.includes('rounds[6].pieces.inv') && !k.includes('rounds[6].pieces.cliff') && k.some((x) => /^bee\.junkyard/.test(x)), 'a hall played out of order records its bee file but holds its story');
  C.onHall('strait', { place: 1, of: 6, above: true, words: [] });
  k = h.keysOf();
  ok(k.indexOf('rounds[5].pieces.v') >= 0 && k.indexOf('rounds[5].pieces.v') < k.indexOf('rounds[6].pieces.inv') && k.indexOf('rounds[2].pieces.cliff') < k.indexOf('rounds[3].pieces.inv'),
    'then both arrive in story order: Round VI\'s V. note before Round VII\'s invitation, Round III\'s cliff before Round IV\'s invitation');
  /* Team Night first: the sting waits for the closing letter */
  const t = harness(); t.acts.forEach((a) => t.C.onHall(a, { place: 1, of: 6, above: true, words: [] }));
  t.C.onTeamNight({ place: 1, of: 2, words: [{ w: 'cat', ok: true }], calls: { right: 3, of: 4 } });
  const early = t.C.state().mail.map((m, i) => ({ k: m.key, s: t.C.piece(null, i).text })).filter((x) => /^teamNight/.test(x.k));
  ok(early.length > 8 && !early.some((x) => /\bVale\b/.test(x.s)) && !t.keysOf().includes('teamNight.beats.sting') && !t.keysOf().includes('teamNight.beats.coda'),
    `Team Night played before V. is named: ${early.length} of its pieces arrive, none names Vale, the sting and the coda wait`);
  const n = t.C.state().mail.length; t.C.act('accuse|vale');
  const nk = t.keysOf().slice(n);
  ok(nk.join() === 'accusation.reveal,accusation.closingLetter,teamNight.beats.sting,teamNight.beats.stingAfter,teamNight.beats.mei,teamNight.beats.coda',
    'naming V. delivers the reveal and the closing letter, then the sting, its answer, Mei and the coda as the next mail: ' + nk.join(' → '));
  /* cases */
  const c = harness(); c.C.onHall('meadow', { place: 1, of: 6, above: true, words: [] });
  ok(c.C.caseState(null, 'c1') == null, 'Case 1 is not available before Round II\'s mail');
  c.C.onHall('library', { place: 1, of: 6, above: true, words: [] });
  ok((c.C.caseState(null, 'c1') || {}).state === 'unseen' && !c.C.caseLate(null, 'c1'), 'it is available (unseen) once Round II\'s mail is in, and on time');
  c.C.onHall('forum', { place: 1, of: 6, above: true, words: [] });
  ok(c.C.caseLate(null, 'c1'), 'once Round III\'s mail is in, it opens late (its lateLine first)');
  c.C.caseUpdate(null, 'c1', { state: 'open', hints: 2 }); c.C.caseUpdate(null, 'c1', { state: 'solved' }); c.C.caseUpdate(null, 'c1', { state: 'open' });
  ok(JSON.stringify(c.C.caseState(null, 'c1')) === '{"state":"solved","hints":2}', 'the cases build writes {state, hints}; a solved case stays solved');
  ok(c.C.caseUpdate(null, 'c9', { state: 'open' }) === null, 'a case id the script does not have is refused');
}

/* ---- slots ---- */
{
  const raw = [];
  for (let s = 1; s <= 10; s++) { const h = harness(); randomBot(h, s * 31337); h.C.state().mail.forEach((m, i) => { const p = h.C.piece(null, i); if (/\{[A-Za-z0-9]+\}/.test(p.text + p.html)) raw.push(m.key); }); }
  ok(!raw.length, 'no raw {token} in any piece on ten random seasons' + (raw.length ? ' — ' + raw.slice(0, 4).join(', ') : ''));
  const none = harness(); none.C.onHall('meadow', { place: 1, of: 6, above: true, words: [{ w: 'cat', ok: true, asks: 0 }] }); none.C.onHall('library', { place: 1, of: 6, above: true, words: [{ w: 'dog', ok: true, asks: 0 }] });
  ok(none.textOf('rounds[1].pieces.v').startsWith(none.D.slotLines.weak.byRound['2']), 'a child with no misses reads Round II\'s advice: "' + none.D.slotLines.weak.byRound['2'] + '"');
  const noask = harness(); noask.C.onHall('meadow', { place: 3, of: 6, above: false, words: [{ w: 'knife', ok: false, asks: 0 }] }); noask.C.onHall('library', { place: 3, of: 6, above: false, words: [{ w: 'listen', ok: false, asks: 0 }] });
  ok(noask.textOf('rounds[1].pieces.v').startsWith(noask.D.slotLines.weak.byFamily.noask), 'a child who never asks reads "' + noask.D.slotLines.weak.byFamily.noask + '"');
  const asked = harness(); asked.C.onHall('meadow', { place: 3, of: 6, above: false, words: [{ w: 'knife', ok: false, asks: 2 }, { w: 'listen', ok: false, asks: 1 }] }); asked.C.onHall('library', { place: 3, of: 6, above: false, words: [{ w: 'phantom', ok: false, asks: 3 }] });
  const av = asked.textOf('rounds[1].pieces.v');
  ok(!av.includes(asked.D.slotLines.weak.byFamily.noask) && av.startsWith(asked.D.slotLines.weak.byFamily.silent), 'a child who asked on every miss never reads the no-ask line; two silent-letter misses read "' + asked.D.slotLines.weak.byFamily.silent + '"');
  ok(/Questions you asked this round: 3\./.test(asked.textOf('rounds[1].pieces.below')), '{asked} is the hall\'s own count (3)');
  const wed = harness(); ['meadow', 'library', 'forum'].forEach((a) => wed.C.onHall(a, { place: 1, of: 6, above: true, words: [] }));
  wed.C.onHall('storm', { place: 4, of: 6, above: false, words: [{ w: 'Wednesday', ok: false, asks: 1 }] });
  ok(/ask where Wednesday came from/.test(wed.textOf('rounds[3].pieces.below')) && !/wednesday/.test(wed.textOf('rounds[3].pieces.below')), '{missed} prints the word as spelled: "Wednesday", never "wednesday"');
  const fb = harness(); ['meadow', 'library', 'forum'].forEach((a) => fb.C.onHall(a, { place: 1, of: 6, above: true, words: [] })); fb.C.onHall('storm', { place: 4, of: 6, above: false, words: [] });
  ok(/ask where a word came from/.test(fb.textOf('rounds[3].pieces.below')), 'with no miss in the log, {missed} prints the script\'s fallback ("a word")');
}

/* ---- above / below (L6) ---- */
{
  const lt = (r) => { const h = harness(); h.C.onHall('meadow', r); return h.keysOf().filter((k) => /pieces\.(above|below)$/.test(k)).join(); };
  ok(lt({ place: 3, of: 6, above: true }) === 'rounds[0].pieces.above' && lt({ place: 1, of: 6, above: false }) === 'rounds[0].pieces.below', 'r.above decides the letter whatever the place');
  ok(lt({ place: 2, of: 6, headPlace: 4 }) === 'rounds[0].pieces.above' && lt({ place: 4, of: 6, headPlace: 2 }) === 'rounds[0].pieces.below', 'else the place against the headliner\'s (r.headPlace)');
  ok(lt({ place: 1, of: 6 }) === 'rounds[0].pieces.above' && lt({ place: 2, of: 6 }) === 'rounds[0].pieces.below', 'else a win reads above, anything else below');
}

/* ---- the bee file, replays and stamps ---- */
{
  const h = harness(); const { C } = h;
  C.onHall('meadow', { place: 3, of: 6, above: false, words: [{ w: 'knife', ok: false, asks: 0 }, { w: 'cat', ok: true }, { w: 'knife', ok: false }, { w: 'listen', ok: false }], missed: ['knife'] });
  const bi = C.state().mail.findIndex((m) => m.key === 'bee.meadow.1');
  ok(/Add missed words to revision/.test(C.piece(null, bi).html), 'a bee file with a miss carries "Add missed words to revision"');
  C.act('file|' + bi); const first = h.log.addMiss.slice();
  C.act('file|' + bi);
  ok(first.length === 2 && first.every((x) => x[1] === 'mark') && h.log.addMiss.length === 2, `one tap files each missed word once, as the child's own filing (${first.map((x) => x[0]).join(', ')}); a second tap files nothing`);
  ok(/On your revision pile/.test(C.piece(null, bi).html) && !/Add missed words/.test(C.piece(null, bi).html), 'and then it reads "On your revision pile"');
  C.onHall('meadow', { place: 1, of: 6, above: true, words: [{ w: 'cat', ok: true }], replay: true });
  const k = h.keysOf();
  ok(k.filter((x) => x === 'rounds[0].pieces.cliff').length === 1 && k.includes('bee.meadow.2') && k.filter((x) => x === 'stamp.meadow').length === 1,
    'a replay adds a bee file and keeps one stamp; the story does not repeat');
  const b2 = C.state().mail.findIndex((m) => m.key === 'bee.meadow.2');
  ok(!/data-arg="file\|/.test(C.piece(null, b2).html) && !/On your revision pile/.test(C.piece(null, b2).html), 'a bee file with no miss has no button');
  ok(/1st of 6/.test(C.piece(null, C.state().mail.findIndex((m) => m.key === 'stamp.meadow')).text), 'the stamp shows the best place earned (1st of 6 after a 3rd)');
  const t = harness(); t.acts.forEach((a) => t.C.onHall(a, { place: 1, of: 6, above: true, words: [] }));
  t.C.onTeamNight({ place: 1, of: 2, words: [{ w: 'cat', ok: true }], calls: { right: 5, of: 7 } });
  ok(/Origin calls: 5 of 7 right/.test(t.textOf('bee.team.1')), 'Team Night\'s bee file shows origin-calling accuracy (5 of 7)');
  t.C.onTeamNight({ place: 1, of: 2, words: [{ w: 'cat', ok: false }], calls: { right: 1, of: 7 }, replay: true });
  ok(t.keysOf().filter((x) => x === 'teamNight.beats.daxPostcard').length === 1 && t.keysOf().includes('bee.team.2'), 'a Team Night replay adds a bee file; the story does not repeat');
}

/* ---- postcards and the diary ---- */
{
  const trail = { T: { honey: { acts: [{ id: 'meadow', units: ['u1', 'u2'] }, { id: 'library', units: ['u3'] }] } }, M: { u1: { 1: ['Wednesday', 'cat'] }, u2: { 2: ['knife', 'dog'] }, u3: { 1: ['owl'] } } };
  const kid = KID('Ahana'); kid.mast = { wednesday: { ok: 1, at: 30 }, cat: { ok: 2, at: 20 }, knife: { ok: 1, at: 10 }, dog: { ok: 1, at: 99, leg: 1 }, owl: { ok: 1, at: 5 } };
  const h = harness({ trail, children: [kid] });
  ok(h.C.onRegionDone('meadow') && /Wednesday, cat and knife, all spelled/.test(h.textOf('hivePost.postcards.meadow')), 'region complete: the guide\'s postcard quotes three of the child\'s own words from that region\'s stops, as spelled (a legacy mark is not a word spelled)');
  ok(!h.C.onRegionDone('library') && !h.keysOf().includes('hivePost.postcards.library'), 'with fewer than three such words, no postcard (never a raw slot)');
  ok(!h.C.onRegionDone('meadow') && h.keysOf().filter((x) => x === 'hivePost.postcards.meadow').length === 1, 'a region\'s postcard comes once');
  h.C.onLevelUp(2); h.C.onLevelUp(12); h.C.onLevelUp(2);
  ok(h.textOf('diary.2') === h.D.hivePost.diary[0] && h.textOf('diary.12') === h.D.hivePost.diary[0] && h.keysOf().filter((x) => x === 'diary.2').length === 1, 'a level-up writes its diary line once (level 2 → the first line, and the lines come round again)');
}

/* ---- pays nothing; no chance ---- */
{
  const src = fs.readFileSync(path.join(ROOT, 'circuit.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  ok(!/\b(addCoins|payG|spendCoins|shopBuy)\s*\(/.test(src) && !/\bBZ_WALLET\b/.test(src), 'circuit.js pays nothing and spends nothing (L11: mail, visitors, stamps and finishing pay nothing)');
  let err = null; try { const h = harness({ noRandom: true }); careful(h); for (let s = 1; s <= 3; s++) randomBot(harness({ noRandom: true }), s); } catch (e) { err = e.message; }
  ok(!err && !/Math\.random/.test(src), 'a whole season, careful and random, runs with Math.random throwing' + (err ? ' — ' + err : ''));
}

console.log(fails ? `\n${fails} FAILED` : '\nthe season reaches its end on every path, fairly, and nothing in the post ever expires');
process.exit(fails ? 1 : 0);
