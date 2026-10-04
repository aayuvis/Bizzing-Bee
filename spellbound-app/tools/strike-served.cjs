#!/usr/bin/env node
/* strike-served.cjs — apply app3.js's strike lists to the SERVED word stores, at rest.

   CORE_STRIKE and CORE_CUT (app3.js) are decisions already made: a word on either list is not to be
   put in front of a child. fixCore() applies them to the 130k library as it loads, and words-patch.js
   splices SOME of them out of the served shards at boot — but the records stayed in the files, so the
   two lists had to be kept in step by hand, and every surface that read a store words-patch does not
   touch (the synonym chips, "sounds like" partners, the Atlas stop pools) could still show one. This
   deletes them where they live, the way the Nazi vocabulary was deleted (3 Oct 2026):

     words-data.js, words-data-2.js   the served shards — the record goes
     words-data-s.js                  its boot-tier example sentence goes with it
     words-lore.js, word-alternates.js  any entry keyed on a struck word
     word-synonyms.js                 entries keyed on one, and a struck word offered AS a synonym
                                      (`idiot` was the "means" chip on 29 other words); a list left
                                      empty goes, as the file holds only words that have one
     voice-words.js                   the voice index loses the words deleted from the shards (only
                                      those: the library's struck records keep theirs, so the
                                      "over 128,000 words spoken aloud" count stays true). The
                                      recorded clips in voice/w are NOT deleted — nothing asks for
                                      them once the index forgets them
     sounds-data.js                   homophone groups, alternate pronunciations, diacritics, IPA
     trail-map-data.js                the Atlas stop pools (a JS literal, not JSON — edited by token)

   SERVED_KEEP names the deliberate exceptions: `dike` is struck from the library but SERVED under a
   repaired gloss (an embankment) by a separate decision recorded beside CORE_STRIKE.

   Idempotent. Prints what it did. Then: node tools/build-feed.cjs, node tests/struck-words.cjs.
   Run: node tools/strike-served.cjs [--dry]                                                        */
'use strict';
const fs = require('fs'), path = require('path');
const { open, strikeLists, APP } = require('./word-stores.cjs');
const DRY = process.argv.includes('--dry');

const SERVED_KEEP = new Set(['dike']);
const { STRIKE, CUT } = strikeLists();
const S = new Set([...STRIKE, ...CUT].filter((w) => !SERVED_KEEP.has(w)));
const struck = (w) => S.has(String(w || '').toLowerCase());
const report = {};
const note = (k, n) => { report[k] = (report[k] || 0) + n; };
const saves = [];

/* the shards */
const deleted = new Set();
for (const f of ['words-data.js', 'words-data-2.js']) {
  const o = open(f), arrs = o.records();
  if (!arrs.length) throw new Error(f + ': no record array found');
  for (const a of arrs) for (let i = a.length - 1; i >= 0; i--) if (a[i] && struck(a[i].w)) { deleted.add(a[i].w.toLowerCase()); a.splice(i, 1); note(f, 1); }
  saves.push(o);
}
/* the boot tier's sentences */
{
  const o = open('words-data-s.js'), a = o.get('SB_SENT_BOOT');
  if (!Array.isArray(a)) throw new Error('words-data-s.js: no SB_SENT_BOOT');
  for (let i = a.length - 1; i >= 0; i--) if (struck(a[i][0])) { a.splice(i, 1); note('words-data-s.js', 1); }
  saves.push(o);
}
/* lore, alternates, synonyms */
for (const [f, name] of [['words-lore.js', 'SB_LORE'], ['word-alternates.js', 'SB_ALT'], ['word-synonyms.js', 'SB_SYN']]) {
  const o = open(f), m = o.get(name);
  if (!m || typeof m !== 'object') throw new Error(f + ': no ' + name);
  for (const k of Object.keys(m)) if (struck(k)) { delete m[k]; note(f + ' keys', 1); }
  if (name === 'SB_SYN') for (const k of Object.keys(m)) {
    const v = m[k]; if (!Array.isArray(v)) continue;
    const kept = v.filter((x) => !struck(x));
    if (kept.length !== v.length) { note('word-synonyms.js values', v.length - kept.length); if (kept.length) m[k] = kept; else { delete m[k]; note('word-synonyms.js emptied', 1); } }
  }
  saves.push(o);
}
/* the voice index: only what left the shards (a struck LIBRARY record keeps its entry, so the "over
   128,000 words spoken aloud" count stays true, and a chapter that still names a struck word — the
   lessons are not a word store — keeps its recorded voice). A word deleted from the library file
   too, as the owner's deletions were, is taken out of the index by hand: tests/struck-words.cjs
   names them. */
{
  const o = open('voice-words.js'), p = o.parts.find((x) => x.name === 'SB_WVOICE');
  if (!p) throw new Error('voice-words.js: no SB_WVOICE');
  const keys = p.v.split('|'), kept = keys.filter((k) => !deleted.has(k));
  note('voice-words.js', keys.length - kept.length); p.v = kept.join('|');
  saves.push(o);
}
/* homophones, alternate pronunciations, diacritics, IPA */
{
  const o = open('sounds-data.js');
  const H = o.get('SB_HOM');
  if (Array.isArray(H)) for (let i = H.length - 1; i >= 0; i--) {
    const g = H[i].filter((w) => !struck(w));
    if (g.length !== H[i].length) { note('sounds-data.js homophone words', H[i].length - g.length); if (g.length >= 2) H[i] = g; else { H.splice(i, 1); note('sounds-data.js homophone groups dropped', 1); } }
  }
  for (const name of ['SB_ALT_PRON', 'SB_DIACRITICS', 'SB_IPA']) {
    const m = o.get(name); if (!m) continue;
    for (const k of Object.keys(m)) if (struck(k)) { delete m[k]; note('sounds-data.js ' + name, 1); }
  }
  saves.push(o);
}
/* the Atlas stop pools: SB_TRAIL_MAP is a JS literal (a trailing comma keeps it from being JSON),
   so a struck word is taken out as a quoted token inside an array, with its comma (the last one in
   an array may leave a trailing comma behind, which JS reads exactly as before) */
let mapText = fs.readFileSync(path.join(APP, 'trail-map-data.js'), 'utf8'), mapN = 0;
mapText = mapText.replace(/^(window\.SB_TRAIL_MAP=)(.*)$/m, (all, head, body) => head + body.replace(/"([a-z][a-z'-]*)",?(?=[\],"])/g, (tok, w) => {
  if (!struck(w)) return tok; mapN++; return '';
}));
note('trail-map-data.js', mapN);

if (!DRY) { for (const o of saves) o.save(); if (mapN) fs.writeFileSync(path.join(APP, 'trail-map-data.js'), mapText); }
console.log((DRY ? '[dry] ' : '') + 'strike-served: ' + S.size + ' struck words (CORE_STRIKE ∪ CORE_CUT, keeping ' + [...SERVED_KEEP].join(', ') + ')');
for (const k of Object.keys(report)) console.log('  ' + k + ': ' + report[k]);
console.log('  deleted from the shards: ' + [...deleted].sort().join(' '));
