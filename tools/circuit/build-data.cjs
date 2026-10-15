#!/usr/bin/env node
/* THE BEE CIRCUIT'S DATA, CUT FROM THE SCRIPT (circuit/BEE-CIRCUIT.md §3.2, build step 2).

   circuit/script.json is the whole season as data and the ONLY source of story text: it was written, reviewed by three
   lenses for three cycles, and signed off (circuit/review/REPORT.md). The app never reads it. It reads circuit-data.js
   (window.SB_CIRCUIT_DATA, boot-lazy group `circuit`), which this writes — never edit that file by hand: change the
   script, re-run this, and tests/circuit-data.cjs (which rebuilds and compares) goes green again.

   WHAT GOES IN is what the app shows and what its code needs, and nothing else:
     - every on-screen line, at the SAME PATH it has in the script (rounds[1].pieces.v, teamNight.beats.sting,
       accusation.closingLetter …), so a review row, a mail key and a test name one line the same way everywhere;
       arrays are kept whole, so an index never shifts;
     - the cast's names, ages and tells (never a role: roles are author notes and spoil the mystery);
     - `rules`: the machine half of script.build — who sits in each hall, the forced words, the slots and their
       fallbacks, the lines held until the accusation, the cases' authored origins (never a rule's prose, why or test);
     - `visitors` with the STOP each one stands at (§10): a visitor stands at a stop only when a word on that stop's own
       list (trail-map-data.js, every band) is theirs; at most one per stop. Where two could stand at one stop, the one
       whose region it is wins, then the script's order. `visitorAt` maps a stop to its visitor's index.
   WHAT STAYS OUT: authorNotes, status, changes, fairPlay, ownerQuestions, visitorsNote, build's prose, every *Note and
   note field, cast roles, portraits' clearedBy, cases' theme / planted / clueOnScreen / engine prose / puzzle.answer,
   teamNight.opens / rules / season2Seeds / callerCategories[].why, accusation.opens, the round and turn pointers
   ("see top-level …"), and visitors' datesNote.

     node tools/circuit/build-data.cjs           write circuit-data.js
     node tools/circuit/build-data.cjs --check   exit 1 if circuit-data.js is not what this would write
   SB_ROOT=<dir> builds from another tree (a test's scratch root). */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const APP = process.env.SB_ROOT ? path.resolve(process.env.SB_ROOT) : path.resolve(__dirname, '..', '..');

const omit = (o, keys) => { const r = {}; for (const k of Object.keys(o || {})) if (!keys.includes(k)) r[k] = o[k]; return r; };
const pick = (o, keys) => { const r = {}; for (const k of keys) if (o && o[k] !== undefined) r[k] = o[k]; return r; };
const clone = (x) => JSON.parse(JSON.stringify(x));

function load(root) {
  root = root || APP;
  const S = JSON.parse(fs.readFileSync(path.join(root, 'circuit/script.json'), 'utf8'));
  const w = {}; w.window = w;
  vm.runInNewContext(fs.readFileSync(path.join(root, 'trail-data.js'), 'utf8'), w, { filename: 'trail-data.js' });
  vm.runInNewContext(fs.readFileSync(path.join(root, 'trail-map-data.js'), 'utf8'), w, { filename: 'trail-map-data.js' });
  return { S, T: w.SB_TRAIL, M: w.SB_TRAIL_MAP };
}

/* §10: the stop each visitor stands at — read from the stops' own lists, never typed */
function placeVisitors(S, T, M) {
  const actOf = {};
  for (const a of T.honey.acts) for (const u of a.units) actOf[u] = a.id;
  const order = T.honey.acts.flatMap((a) => a.units);   // the Atlas order, so the tie-break is stable
  const stopOfWord = {};
  for (const u of order) for (const b of Object.keys(M[u] || {}).sort()) for (const w of M[u][b] || []) {
    const k = String(w).toLowerCase(); if (!(k in stopOfWord)) stopOfWord[k] = u;
  }
  const candidates = {};   // stop -> [visitor index]
  S.visitors.forEach((v, i) => { const u = stopOfWord[String(v.word).toLowerCase()]; if (u) (candidates[u] = candidates[u] || []).push(i); });
  const at = {}, stopOf = {};
  for (const u of order) {
    const c = candidates[u]; if (!c) continue;
    const own = c.filter((i) => S.visitors[i].act === actOf[u]);
    const i = (own.length ? own : c)[0];
    at[u] = i; stopOf[i] = u;
  }
  return { at, stopOf };
}

function data(root) {
  const { S, T, M } = load(root);
  const D = {};
  D.season = S.season;
  D.fiction = S.fiction;
  D.signoffs = pick(S.signoffs, ['inv']);
  D.cast = {};
  for (const [id, c] of Object.entries(S.cast)) D.cast[id] = pick(c, ['name', 'age', 'tell']);
  D.suspectBoard = { portraits: S.suspectBoard.portraits.map((p) => pick(p, ['id', 'label', 'why', 'labelAfterRound', 'labelAfter'])) };
  D.rounds = S.rounds.map((r) => {
    const o = pick(r, ['n', 'act', 'venue', 'headliners', 'alsoSeated', 'technique', 'lesson', 'lessonGi', 'vWhere', 'order', 'nightBefore']);
    o.pieces = omit(clone(r.pieces), ['progNote']);
    return o;
  });
  D.turn = pick(clone(S.turn), ['round', 'scene', 'kwame', 'dax', 'notesIntro', 'notes', 'daxOnNotes', 'apologies']);
  D.turn.choice = pick(S.turn.choice, ['key', 'labels', 'line']);
  D.cases = S.cases.map((c) => {
    const o = omit(clone(c), ['theme', 'planted', 'clueOnScreen', 'safeLineNote', 'engine']);
    o.puzzle = omit(o.puzzle, ['homeLanguageNote', 'answer']);
    return o;
  });
  const tn = S.teamNight;
  D.teamNight = pick(clone(tn), ['act', 'venue', 'challenge', 'beats', 'ravenmereRoster']);
  D.teamNight.roster = omit(clone(tn.roster), ['lecternNote']);
  D.teamNight.callerCategories = tn.callerCategories.map((c) => omit(c, ['why']));
  D.accusation = omit(clone(S.accusation), ['opens']);
  D.hivePost = omit(clone(S.hivePost), ['postcardNote']);
  D.slotLines = clone(S.slotLines);
  const vis = placeVisitors(S, T, M);
  D.visitors = S.visitors.map((v, i) => {
    const o = pick(v, ['act', 'figure', 'word', 'kind', 'card']);
    o.stop = vis.stopOf[i] || null;
    o.sources = (v.sources || []).map((s) => pick(s, ['type', 'ref']));
    return o;
  });
  D.visitorAt = vis.at;
  const B = (id) => S.build.find((b) => b.id === id) || {};
  const slots = {};
  for (const [k, s] of Object.entries(B('slots').slots || {})) slots[k] = pick(s, ['usedAt', 'fallback']);
  D.rules = {
    storyOrder: { holds: (B('story-order').holds || []).map((h) => pick(h, ['paths', 'until'])) },
    hallFields: pick(B('hall-fields'), ['fields', 'invNamedUnseated']),
    outcomes: (B('scripted-outcomes').outcomes || []).map((o) => pick(o, ['round', 'word', 'lines'])),
    slots,
    caseOrigins: pick(B('case-origins-authored'), ['libraryNonGreek', 'choicesExclude'])
  };
  return D;
}

/* one top-level section a line, so a change to the script shows up as a change to one line of the diff */
function build(root) {
  const D = data(root);
  const body = Object.keys(D).map((k) => JSON.stringify(k) + ':' + JSON.stringify(D[k])).join(',\n');
  return '/* GENERATED by tools/circuit/build-data.cjs from circuit/script.json (the Bee Circuit, Season 1) — never edit by hand.\n'
    + '   Every on-screen line sits at the path it has in the script; tests/circuit-data.cjs rebuilds this file and compares. */\n'
    + 'window.SB_CIRCUIT_DATA={\n' + body + '\n};\n';
}

module.exports = { build, data, placeVisitors, load };

if (require.main === module) {
  const out = path.join(APP, 'circuit-data.js');
  const txt = build();
  if (process.argv.includes('--check')) {
    const cur = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '';
    if (cur !== txt) { console.log('circuit-data.js is NOT what tools/circuit/build-data.cjs writes — re-run it'); process.exit(1); }
    console.log('circuit-data.js is what the script says'); process.exit(0);
  }
  fs.writeFileSync(out, txt);
  const D = data();
  console.log(`wrote circuit-data.js — ${(txt.length / 1024).toFixed(1)} KB, ${D.rounds.length} rounds, ${D.cases.length} cases, ${D.visitors.filter((v) => v.stop).length} of ${D.visitors.length} visitors at a stop`);
}
