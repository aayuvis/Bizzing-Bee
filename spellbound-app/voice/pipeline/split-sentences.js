/* Split the boot tier's example sentences out of words-data.js (FIX-BEE v2, R2 — first load).

   Run from spellbound-app/:  node voice/pipeline/split-sentences.js
   Re-runnable: it folds an existing words-data-s.js back in first, so running it twice, or after
   words-shard.js has rewritten words-data.js, always leaves the same two files.

   WHY. words-data.js (the 8,000 easiest words) was 557KB gzipped of a 1.7MB first load, and 46%
   of its bytes are the example sentences — which no first screen shows. Home's word of the hour,
   the stage ladder (defaultStages reads `d`, never `s`) and the Continue card need the words and
   their meanings; a sentence is only read once a card or a drill is open. So the sentences go to
   words-data-s.js, fetched first on the idle queue (after the first tap) and at the door of every
   screen that shows a card (boot-lazy GROUP words/card/lists/coach). boot-lazy's AFTER hook merges
   them onto the SAME record objects — only where a record has none, so words-patch's rewritten
   sentences win — and re-runs SB_WORDS_PATCH so its sentence QC sees the merged text.

   Format: window.SB_SENT_BOOT = [[word, sentence], …] in boot-tier order (aligned by position and
   checked by word, so a reordered shard cannot attach a sentence to the wrong word). */
const fs = require('fs');
global.window = global;
const SRC = 'words-data.js', OUT = 'words-data-s.js';
const text = fs.readFileSync(SRC, 'utf8');
const head = text.slice(0, text.indexOf('window.SB_DATA='));
eval(text);
const recs = window.SB_DATA.nsf;
if (fs.existsSync(OUT)) {   // fold back in first
  eval(fs.readFileSync(OUT, 'utf8'));
  const S = window.SB_SENT_BOOT || [];
  S.forEach((p, i) => { const r = recs[i]; if (r && p && r.w === p[0] && p[1] && !r.s) r.s = p[1]; });
}
const pairs = recs.map(r => [r.w, r.s || '']);
const stripped = recs.map(r => { const o = {}; for (const k of Object.keys(r)) if (k !== 's') o[k] = r[k]; return o; });
const rest = Object.assign({}, window.SB_DATA); rest.nsf = stripped;
fs.writeFileSync(SRC, head + 'window.SB_DATA=' + JSON.stringify(rest) + ';\n');
fs.writeFileSync(OUT, '/* words-data-s.js — the example sentences of the boot tier (words-data.js), in its order.\n' +
  '   Split out by voice/pipeline/split-sentences.js; merged by boot-lazy (AFTER.sents). Never in index.html. */\n' +
  'window.SB_SENT_BOOT=' + JSON.stringify(pairs) + ';\n');
console.log(`${recs.length} records; ${pairs.filter(p => p[1]).length} sentences moved to ${OUT}`);
