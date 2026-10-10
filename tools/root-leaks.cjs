#!/usr/bin/env node
/* root-leaks.cjs — delete the root questions that give their answer away (the 4.5 brief, P0.34, 10 Oct 2026).

   The rule is tools/root-leak.cjs's (a content word of the right answer whose first five letters sit inside
   the word or root the prompt quotes, and in no wrong option): "Inside “triangle” sits the piece “angulus”
   → angle", "“incapacitated” … “capacitas” → capacity", "“knowledge” … “cnawan” → to know". They are
   DELETED, not reworded — rewording a generated question is writing one — from wherever the bank holds
   them (the word bank trivia-words.js; the level shards, with byLevel following, if a root question ever
   lands there; and trivia-all.json), and each is written to qc-trivia-leaks.json. Word Lore's Roots mode
   draws only from the bank, and the feed is cut from it, so this is the one place they go.

   Idempotent. Then: node tools/build-feed.cjs, node tests/root-leaks.cjs.
   Run: node tools/root-leaks.cjs [--dry]                                                              */
'use strict';
const fs = require('fs'), path = require('path');
const { openTrivia, APP } = require('./word-stores.cjs');
const { leak } = require('./root-leak.cjs');
const DRY = process.argv.includes('--dry');
const LEDGER = path.join(APP, 'qc-trivia-leaks.json');
const led = fs.existsSync(LEDGER) ? JSON.parse(fs.readFileSync(LEDGER, 'utf8')) : {};
const L = { note: 'Root questions that printed their answer (the 4.5 brief, P0.34, 10 Oct 2026): a content word of the right answer whose ' +
  'first five letters sit inside the word or root the prompt quotes, and in no wrong option (tools/root-leak.cjs). Deleted by ' +
  'tools/root-leaks.cjs from the served bank and trivia-all.json, never reworded. Re-run it after any regeneration of trivia-words.js.',
  deleted: led.deleted || [] };
const T = openTrivia(), drop = new Set();
for (const { q, file } of T.all()) { const s = leak(q); if (!s) continue;
  drop.add(q.id); L.deleted.push({ id: q.id, file, th: q.th, lv: q.lv, stem: s, q: q.q, answer: q.c[0] }); }
const out = T.drop(drop);
if (!DRY) { T.save(); fs.writeFileSync(LEDGER, JSON.stringify(L, null, 1) + '\n'); }
const by = {}; L.deleted.slice(L.deleted.length - drop.size).forEach((e) => { by[e.th] = (by[e.th] || 0) + 1; });
console.log((DRY ? '[dry] ' : '') + 'root-leaks: ' + drop.size + ' deleted ' + JSON.stringify(by) + ' — per file ' + JSON.stringify(out) + ' — byLevel ' + JSON.stringify(T.byLevel()));
