/* Split the etymology (r) and memory-hint (h) fields out of words-data.js.

   Those two fields are 4.9MB of the 18.4MB core library and they only ever
   render on an expanded word card — never on the home screen, never in a drill
   prompt. This writes words-lore.js (word -> [r, h]) and rewrites words-data.js
   without them; boot-lazy loads the lore file on idle and merges it back into
   the same record objects, so every `w.r` / `w.h` read site keeps working.

   Idempotent: re-running on an already-split words-data.js is a no-op that
   simply rebuilds words-lore.js from whatever lore is still present. */
const fs = require('fs');
process.chdir('/home/user/Bizzing-Bee/spellbound-app');
global.window = global;

const nkey = s => String(s == null ? '' : s).toLowerCase().trim();
const before = fs.statSync('words-data.js').size;
eval(fs.readFileSync('words-data.js', 'utf8'));
const recs = window.SB_DATA.nsf;

/* Keep any lore already in a side file so a second run cannot lose it. */
const lore = fs.existsSync('words-lore.js')
  ? (eval(fs.readFileSync('words-lore.js', 'utf8')), window.SB_LORE || {})
  : {};

let moved = 0;
for (const r of recs) {
  const k = nkey(r.w);
  if (!k) continue;
  const cur = lore[k] || ['', ''];
  if (r.r) { cur[0] = r.r; delete r.r; moved++; }
  if (r.h) { cur[1] = r.h; delete r.h; moved++; }
  if (cur[0] || cur[1]) lore[k] = cur;
}
/* drop trailing empties so the payload stays tight */
for (const k of Object.keys(lore)) {
  const v = lore[k];
  if (!v[1]) v.length = v[0] ? 1 : 0;
  if (!v.length) delete lore[k];
}

fs.writeFileSync('words-data.js', 'window.SB_DATA=' + JSON.stringify(window.SB_DATA) + ';\n');
fs.writeFileSync('words-lore.js',
  '/* words-lore.js — etymology + memory hint for the core library, keyed by word.\n'
  + '   Split out of words-data.js to keep 4.9MB off the boot path; boot-lazy loads\n'
  + '   this on idle and merges [r, h] back onto the SB_DATA records in place.\n'
  + '   Regenerate with voice/pipeline/words-lore-split.js. */\n'
  + 'window.SB_LORE=' + JSON.stringify(lore) + ';\n');

const after = fs.statSync('words-data.js').size;
console.log('records', recs.length, '| fields moved', moved, '| lore keys', Object.keys(lore).length);
console.log('words-data.js', (before / 1048576).toFixed(1) + 'MB ->', (after / 1048576).toFixed(1) + 'MB',
  '| words-lore.js', (fs.statSync('words-lore.js').size / 1048576).toFixed(1) + 'MB');
