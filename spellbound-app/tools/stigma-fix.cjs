#!/usr/bin/env node
/* stigma-fix.cjs — take stigmatising text out of what the app serves, AT REST (the 4.5 brief, P0.11–P0.13).

   The list is kid-safe.js's (read through tools/stigma.cjs — disability, mental health, ethnicity, body).
   Nothing here WRITES a word of new text. Every fix is a removal, through tools/word-stores.cjs (which
   refuses any line that does not round-trip), and every one is written to qc-stigma-fixes.json:

     served sentences   words-data.js / words-data-2.js: the record's `s` goes (the word stays, with its
                        meaning — 7,000+ served words already have no sentence); words-data-s.js: the boot
                        tier's [word, sentence] pair goes; words-patch.js: a SENT entry (a sentence the boot QC
                        pass writes over the record) goes, by its own line
     chapter sentences  concepts-data.js / adv-concepts-data.js: a chapter word's `ex` goes
     trivia             a question whose prompt or ANY option carries one is deleted — from its shard or the
                        word bank, and from trivia-all.json — and byLevel follows the shards (a wrong option
                        is shown to the child as surely as the right one, and swapping in a new distractor
                        would be writing); a FACT that carries one loses the sentences that do, and goes
                        when none is left

   The 130,000-word library (words-full.js, a 45 MB single line) is NOT rewritten here: app3's fixCore drops
   a stigmatising sentence as the library loads, the same choke point that applies the strike lists, and
   tests/stigma.cjs checks the library as the page builds it.

   Idempotent: a second run finds nothing. Then: node tools/build-feed.cjs, node tests/stigma.cjs.
   Run: node tools/stigma-fix.cjs [--dry]                                                              */
'use strict';
const fs = require('fs'), path = require('path');
const { open, openTrivia, APP } = require('./word-stores.cjs');
const S = require('./stigma.cjs');
const DRY = process.argv.includes('--dry');
const LEDGER = path.join(APP, 'qc-stigma-fixes.json');
const led = fs.existsSync(LEDGER) ? JSON.parse(fs.readFileSync(LEDGER, 'utf8')) : {};
const NOTE = 'Stigma scan, 10 Oct 2026 (the 4.5 brief, P0.11–P0.13). The list is kid-safe.js SB_KID_SAFE.stigma, read by tools/stigma.cjs; ' +
  'tools/stigma-fix.cjs made every change below and wrote no new text: a sentence that hurts someone for a disability, their mental health, ' +
  'their ethnicity or their body was REMOVED (the word keeps its meaning), a trivia question showing one in its prompt or options was deleted, ' +
  'and a trivia fact lost only the sentences that carried one. Re-run the tool after any regeneration of words-data*.js, concepts-data.js or ' +
  'the trivia bank, or these come back.';
const L = { note: NOTE, sentencesDeleted: led.sentencesDeleted || [], chapterExDeleted: led.chapterExDeleted || [],
  triviaDeleted: led.triviaDeleted || [], triviaFactsTrimmed: led.triviaFactsTrimmed || [] };
const fresh = { sentencesDeleted: 0, chapterExDeleted: 0, triviaDeleted: 0, triviaFactsTrimmed: 0 };
const log = (k, e) => { L[k].push(e); fresh[k]++; };
const saves = [];

/* served sentences */
for (const f of ['words-data.js', 'words-data-2.js']) {
  const o = open(f);
  for (const arr of o.records()) for (const r of arr) {
    if (!r || !r.s) continue; const h = S.hit(r.s); if (!h) continue;
    log('sentencesDeleted', { store: f, w: r.w, hit: h, s: r.s }); delete r.s;
  }
  saves.push(o);
}
{
  const o = open('words-data-s.js'), a = o.get('SB_SENT_BOOT');
  if (!Array.isArray(a)) throw new Error('words-data-s.js: no SB_SENT_BOOT');
  for (let i = a.length - 1; i >= 0; i--) { const h = S.hit(a[i][1]); if (!h) continue;
    log('sentencesDeleted', { store: 'words-data-s.js', w: a[i][0], hit: h, s: a[i][1] }); a.splice(i, 1); }
  saves.push(o);
}
/* words-patch.js's SENT — sentences the boot QC pass writes over a record as the page loads. It is code, not a
   JSON store, so an entry is taken out by its own line, and only when that line is exactly `word: '…',` and
   evaluates to the sentence that matched (anything else is refused, not guessed at) */
let patchText = fs.readFileSync(path.join(APP, 'words-patch.js'), 'utf8'), patchN = 0;
{
  const open0 = 'var SENT = Object.assign(Object.create(null), {', a = patchText.indexOf(open0), b = patchText.indexOf('\n  });', a);
  if (a < 0 || b < 0) throw new Error('words-patch.js: no SENT block');
  const block = patchText.slice(a, b), kept = [];
  for (const ln of block.split('\n')) {
    const m = ln.match(/^\s+([a-z]+):\s*('(?:[^'\\]|\\.)*'),?\s*$/);
    const v = m ? require('vm').runInNewContext(m[2]) : null, h = v ? S.hit(v) : null;
    if (h) { log('sentencesDeleted', { store: 'words-patch.js', w: m[1], hit: h, s: v }); patchN++; continue; }
    kept.push(ln);
  }
  if (patchN) patchText = patchText.slice(0, a) + kept.join('\n') + patchText.slice(b);
}

/* chapter sentences */
for (const [f, name] of [['concepts-data.js', 'SB_CONCEPTS'], ['adv-concepts-data.js', 'SB_ADV_CONCEPTS']]) {
  const o = open(f), D = o.get(name);
  if (!D || !Array.isArray(D.chapters)) throw new Error(f + ': no ' + name + '.chapters');
  D.chapters.forEach((ch, ci) => (ch.words || []).forEach((x) => {
    if (!x || !x.ex) return; const h = S.hit(x.ex); if (!h) return;
    log('chapterExDeleted', { store: f, chapter: ci, title: ch.title, w: x.w, hit: h, ex: x.ex }); delete x.ex;
  }));
  saves.push(o);
}
/* trivia */
const T = openTrivia();
const SENT = /[^.!?]+(?:[.!?]+["”’')]*\s*|$)/g;
const drop = new Set();
for (const { q, file } of T.all()) {
  const shown = [q.q].concat(q.c || []);
  const h = shown.map((t) => S.hit(t)).find(Boolean);
  if (h) { drop.add(q.id); log('triviaDeleted', { id: q.id, file, th: q.th, lv: q.lv, hit: h, q: q.q, c: q.c }); continue; }
  if (q.f && S.hit(q.f)) {
    const was = q.f, parts = (was.match(SENT) || [was]).filter((x) => x.trim());
    const kept = parts.filter((x) => !S.hit(x)).join('').trim();
    log('triviaFactsTrimmed', { id: q.id, file, th: q.th, hit: S.hit(was), was, now: kept || null });
    T.edit(q.id, (x) => { if (kept) x.f = kept; else delete x.f; });
  }
}
const dropped = T.drop(drop);

if (!DRY) { saves.forEach((o) => o.save()); T.save(); if (patchN) fs.writeFileSync(path.join(APP, 'words-patch.js'), patchText);
  fs.writeFileSync(LEDGER, JSON.stringify(L, null, 1) + '\n'); }
console.log((DRY ? '[dry] ' : '') + 'stigma-fix: ' + Object.entries(fresh).map(([k, n]) => k + ' ' + n).join(' · '));
if (Object.keys(dropped).length) console.log('  trivia deleted per file: ' + JSON.stringify(dropped) + ' — byLevel now ' + JSON.stringify(T.byLevel()));
