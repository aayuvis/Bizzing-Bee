#!/usr/bin/env node
/* THE FIVE SURPRISE STOPS, CUT FROM THE SCRIPT (The Bee Circuit, BEE-CIRCUIT.md §7, build step 6).

   circuit-cases.js (the case runner, lazy group `circuitCases`) reads ONE data file, circuit-cases-data.js
   (window.SB_CIRCUIT_CASES_DATA), and this writes it. Nothing in it is typed here:
     · every line a child sees is a string from circuit/script.json — cases[] (cold open, taps, suspects, puzzle,
       escalation, accusation, reveal, last chill), the cast's names and tells (never cast.*.role: authorNotes say
       roles spoil the mystery), and the rounds' acts (which hall triggers a case pin, which makes it "late");
     · every hint a rival gives comes from the item's OWN record in the served library (its definition, sentence,
       origin and etymology line, loaded the way the page loads them: tools/feed-corpus.cjs), except where the
       script's build rules say the AUTHORED field wins (build[id=case-origins-authored]: Case 2's Greek, Case 3's
       home language, Case 4's parts);
     · the items are exactly the script's authored items (build[id=case-origins-authored], [id=case2-spelling-engine];
       authorNotes allow a same-pattern swap "through pick()", and this build takes none: each case's reveal is
       about ITS words — the parrot's dropped letters, S-T-R-A-I-T, three-and-ten fear, the three wrong endings).
   The page never reads the corpus for a case (tests/word-door.cjs); the record text it needs rides here, and
   tests/circuit-cases.cjs rebuilds this file and fails on any difference, so it cannot drift from the library.

   The few things decided HERE (not story text — which button a case offers, which clue glows) are the tables
   HINTS and GLOW below, each with its reason.

     node tools/circuit/build-cases.cjs           write spellbound-app/circuit-cases-data.js
     node tools/circuit/build-cases.cjs --check   exit 1 if the file is not what this would write  */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const APP = path.resolve(__dirname, '..', '..');
const OUT = path.join(APP, 'circuit-cases-data.js');
const SCRIPT = path.join(APP, 'circuit', 'script.json');

/* THE HINT BUTTONS EACH CASE OFFERS, in the order they stand (and the order a miss opens them). The brief's table
   (§7): Theo — definition and sentence · Mira — origin · Rafi — the root split · Nova — says it twice, slowly ·
   Suki — "Breathe out" (+30 s) · Ines — the loanword's home language · Kwame — prefix, root and suffix. A rival is
   left out of a case where:
     · they are missing from it (build[id=case-scenes]: no Ask Kwame in Case 3 — he is the one who is gone);
     · their answer IS the item's answer (Case 3: Mira's origin and Rafi's etymology name the home language, which is
       what the child is sorting by; Ines alone gives it, as the build rule says, and an item told that way is shown,
       not paid);
     · the story has them hiding the very thing (Case 4: Mira's secret is that she is unsure of one part, kai);
     · they have nothing from the record to say (Kwame's prefix/root/suffix exists only as Case 4's authored parts;
       Ines's home language only in Case 3; Rafi's split only where the record's etymology line splits the word).
   A button whose rival has nothing for THIS item is not drawn (Mock Bee's Pronouncer's Chair rule). */
const HINTS = {
  c1: ['scopey', 'astro', 'beaker', 'koi', 'snowfox'],
  c2: ['scopey', 'astro', 'koi', 'snowfox'],
  c3: ['scopey', 'koi', 'melody', 'snowfox'],
  c4: ['scopey', 'beaker', 'samurai', 'koi', 'snowfox'],
  c5: ['scopey', 'astro', 'beaker', 'koi', 'snowfox']
};
const KIND = { scopey: 'def', astro: 'origin', beaker: 'roots', koi: 'twice', snowfox: 'breathe', melody: 'home', samurai: 'parts' };

/* THE CLUES THAT GLOW on a wrong accusation ("not quite, look again" and the right clue glows, §7.5): the things on
   screen BEFORE the accusation that point at the right choice — tapN is cases[].taps[N], esc the escalation card,
   clue the case's repeated clue card, puzzle the puzzle's own board (the sorted languages, the untrue statements). */
const GLOW = {
  c1: ['tap0', 'tap1'],             // a typesetter and a parrot at the press; the perch and the green feather
  c2: ['tap2', 'esc'],              // Pip's bundled jumper under his seat; the rocked heel-marks behind the curtain
  c3: ['tap0', 'esc', 'puzzle'],    // "to the Far Shore to fix…"; one boat left; S-T-R-A-I-T and French twice
  c4: ['tap1', 'tap2', 'clue'],     // Suki seventh, Dax eighth; the book taken whole; Ratchet cannot spell
  c5: ['tap1', 'tap2', 'puzzle']    // the empty hook (a spare key out); Duchess on a high shelf; whose lines were untrue
};

/* the fields of a library record a hint may read (never `m`, the recorded misspelling) */
const REC_FIELDS = ['d', 's', 'o', 'r', 'h', 'ps'];
const fnv = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

function corpus() {
  const { load } = require('../feed-corpus.cjs');
  const C = load();
  vm.runInContext(fs.readFileSync(path.join(APP, 'kid-safe.js'), 'utf8'), C.win, { filename: 'kid-safe.js' });
  return C;
}

/* each item's kind, the words that answer it, and the word whose record its hints read */
function items(c, k) {
  const P = c.puzzle;
  if (k === 0) return P.items.map(x => ({ k: 'fix', shown: x.printed, ans: [].concat(x.correct), why: x.why, both: !!x.bothCorrect, rw: [].concat(x.correct)[0] }));
  if (k === 1) return P.items.map(x => ({ k: 'spell', clue: x.clue, ans: [x.word], greek: x.greek, rule: x.rule, rw: x.word }));
  if (k === 2) {
    const langs = [...new Set(P.items.map(x => x.home))];
    const ex = (B('case-origins-authored').choicesExclude) || {};
    return P.items.map(x => ({ k: 'sort', shown: x.word, ans: [x.home], opts: langs.filter(l => (ex[x.word] || []).indexOf(l) < 0).sort(), rw: x.word }));
  }
  if (k === 3) {
    /* a part's options are meanings this case itself names: all four parts' meanings (the word is decoded from
       them together, three-and-ten fear) and two of its four words' part meanings, chosen by a hash of the part —
       never Math.random, the same every build — sorted, so a slot never says which is right */
    const partMeans = [...new Set(P.items.filter(x => x.part).map(x => x.meaning))];
    const wordMeans = [...new Set(P.items.flatMap(x => x.part ? [] : (x.parts || []).map(p => String(p).split(':').slice(1).join(':').trim())))].filter(m => partMeans.indexOf(m) < 0);
    return P.items.map(x => {
      if (x.part) {
        const two = wordMeans.map(m => ({ m, h: fnv(x.part + '|' + m) })).sort((a, b) => a.h - b.h || (a.m < b.m ? -1 : 1)).slice(0, 2).map(o => o.m);
        return { k: 'part', shown: x.part, ans: [x.meaning], opts: partMeans.concat(two).sort(), lang: x.language, from: x.from, rw: P.word };
      }
      return { k: 'build', clue: x.meaning, ans: [x.word], parts: x.parts, rw: x.word };
    });
  }
  return P.items.map(x => ({ k: 'stmt', who: x.who, said: x.statement, word: x.word, ans: [x.correct], ok: !!x.ok, why: x.why || '', rw: x.ok ? x.word : x.correct }));
}
let S = null;
const B = id => (S.build || []).find(b => b.id === id) || {};

function build(C) {
  C = C || corpus();
  S = JSON.parse(fs.readFileSync(SCRIPT, 'utf8'));
  const R = S.rounds.map(r => r.act);
  const recs = {}, castKeys = new Set();
  const rec = w => { const r = C.WORD[w]; if (!r) throw new Error('build-cases: the library has no "' + w + '"');
    const lore = C.LORE[String(w).toLowerCase()] || [];
    const o = {}; REC_FIELDS.forEach(f => { const v = f === 'r' ? (r.r || lore[0]) : f === 'h' ? (r.h || lore[1]) : r[f]; if (v) o[f] = String(v); });
    return o; };
  const cases = S.cases.map((c, k) => {
    const its = items(c, k);
    its.forEach(it => { if (!recs[it.rw]) recs[it.rw] = rec(it.rw); });
    (c.suspects || []).forEach(s => { if (S.cast[s.who]) castKeys.add(s.who); });
    (HINTS[c.id] || []).forEach(h => castKeys.add(h));
    const o = { id: c.id, after: c.after, trig: R[c.after - 1], next: R[c.after] || null, act: c.act, title: c.title, place: c.place,
      engine: c.engineKey, lateLine: c.lateLine, clock: c.clock, impossible: c.impossible, taps: c.taps,
      suspects: c.suspects, falseSolution: c.falseSolution, escalation: c.escalation,
      puzzle: { brief: c.puzzle.brief, rule: c.puzzle.rule || '', card: c.puzzle.card || '', items: its },
      accusation: c.accusation, reveal: c.reveal, lastChill: c.lastChill,
      hints: HINTS[c.id], glow: GLOW[c.id] };
    if (c.safeLine) o.safeLine = c.safeLine;
    if (c.clue) o.clue = c.clue.text;
    return o;
  });
  const cast = {}; [...castKeys].sort().forEach(k => { const x = S.cast[k]; cast[k] = { name: x.name, tell: x.tell || '' }; });
  return { v: 1, fiction: S.fiction, kinds: KIND, cast, recs, cases };
}

function check(D, C) {
  /* what the runner relies on, refused here rather than found on a child's screen */
  const bad = [];
  if (D.cases.length !== 5) bad.push('five cases');
  D.cases.forEach(c => {
    const n = c.puzzle.items.length; if (n < 8 || n > 12) bad.push(c.id + ': ' + n + ' items (8–12)');
    if (!c.trig) bad.push(c.id + ': no trigger hall');
    if (!Array.isArray(c.taps) || c.taps.length !== 3) bad.push(c.id + ': three taps');
    if (!c.lateLine) bad.push(c.id + ': no lateLine');
    if ((c.hints || []).some(h => !D.cast[h] || !D.kinds[h])) bad.push(c.id + ': a hint names no rival');
    if (c.id === 'c3' && c.hints.indexOf('samurai') >= 0) bad.push('c3 offers Ask Kwame (build[id=case-scenes])');
    (c.glow || []).forEach(g => { const m = /^tap(\d)$/.exec(g); if (m ? +m[1] > 2 : !/^(esc|clue|puzzle)$/.test(g)) bad.push(c.id + ': glow ' + g); if (g === 'clue' && !c.clue) bad.push(c.id + ': glows a clue it has not got'); });
    c.puzzle.items.forEach((it, i) => {
      if (it.opts && it.opts.filter(x => it.ans.indexOf(x) >= 0).length !== 1) bad.push(c.id + ' item ' + i + ': exactly one right option');
      if (it.opts && new Set(it.opts).size !== it.opts.length) bad.push(c.id + ' item ' + i + ': options repeat');
      const r = D.recs[it.rw]; if (!r) bad.push(c.id + ' item ' + i + ': no record for ' + it.rw);
      if (C && C.win.SB_KID_SAFE && C.WORD[it.rw] && !C.win.SB_KID_SAFE.check(C.WORD[it.rw], 8)) bad.push(c.id + ': "' + it.rw + '" fails the kid-safe list at 8');
    });
  });
  const ex = B('case-origins-authored').choicesExclude || {};
  D.cases[2].puzzle.items.forEach(it => (ex[it.shown] || []).forEach(l => { if (it.opts.indexOf(l) >= 0) bad.push('c3 ' + it.shown + ' offers ' + l); }));
  return bad;
}

function text(D) {
  return '/* circuit-cases-data.js — WRITTEN BY tools/circuit/build-cases.cjs from circuit/script.json (cases, cast names and tells,\n' +
    '   the rounds\' halls) and the served library (each item\'s own record, for the rivals\' hints). Never edit by hand:\n' +
    '   tests/circuit-cases-data.cjs rebuilds it and fails on any difference. */\n' +
    'window.SB_CIRCUIT_CASES_DATA=' + JSON.stringify(D) + ';\n';
}

module.exports = { build, text, check, corpus, OUT, HINTS, GLOW, KIND };

if (require.main === module) {
  const C = corpus(), D = build(C), bad = check(D, C);
  if (bad.length) { console.error('build-cases refuses: ' + bad.join(' · ')); process.exit(1); }
  const txt = text(D);
  if (process.argv.includes('--check')) {
    const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
    if (cur !== txt) { console.error('circuit-cases-data.js is stale — run node tools/circuit/build-cases.cjs'); process.exit(1); }
    console.log('circuit-cases-data.js is current'); process.exit(0);
  }
  fs.writeFileSync(OUT, txt);
  console.log('wrote ' + path.relative(APP, OUT) + ' (' + txt.length + ' bytes)');
}
