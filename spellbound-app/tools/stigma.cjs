/* stigma.cjs — node's ONE door to the stigma list (the 4.5 brief, P0.11–P0.13, 10 Oct 2026).

   THE LIST lives in kid-safe.js (`SB_KID_SAFE.stigma`): words and phrases that hurt someone for a
   disability, their mental health, their ethnicity or their body. It lives there, not here, because the
   PAGE needs it too — kidSafe() reads it against a game word's headword and gloss, so the Spelling Gym,
   Word Lore and every other game behind the one word door cannot serve one. This module runs that file in
   a sandbox exactly as the page runs it and hands node the same scan, so there is one list and one
   matcher, never a copy that drifts:

     hit(text)    → the first stigmatising word or phrase in text, or null
     hits(text)   → every hit [{at, hit}]
     cardText(c)  → everything a My Feed card shows, joined (title, body, source, question, options, after)
     K            → SB_KID_SAFE itself (why / check / stigmaHits)

   Used by tools/build-feed.cjs (a card that matches is dropped, never edited), tools/stigma-fix.cjs (a
   served sentence that matches is removed from its record, through tools/word-stores.cjs, and written to
   qc-stigma-fixes.json) and tests/stigma.cjs (nothing served matches). */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const APP = path.resolve(__dirname, '..');

function load(root) {
  const win = { console };
  win.window = win;
  vm.createContext(win);
  vm.runInContext(fs.readFileSync(path.join(root || APP, 'kid-safe.js'), 'utf8'), win, { filename: 'kid-safe.js' });
  const K = win.SB_KID_SAFE;
  if (!K || typeof K.stigmaHits !== 'function') throw new Error('stigma: kid-safe.js carries no stigma scan');
  return K;
}
const K = load();
const hits = (t) => K.stigmaHits(t);
const hit = (t) => K.stigmaHit(t);
const cardText = (c) => [c.title, c.body, c.source].concat(c.play ? [c.play.q, c.play.after].concat(c.play.opts || []) : [])
  .filter((x) => x != null && x !== '').join(' | ');

module.exports = { K, hit, hits, cardText, load };
