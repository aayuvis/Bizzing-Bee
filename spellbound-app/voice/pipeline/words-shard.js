/* Shard the core word library into a boot tier and an idle tier.

   words-data.js is the last big thing on the boot path. The first screens only
   ever need easy words — onboarding, the home tiles, the opening journey levels,
   the theme counts — so the boot tier is the easiest 8,000 by the app's own
   difficulty ramp, and words-data-2.js carries the other ~33,000 in on the idle
   queue, appending to the same SB_DATA.nsf array.

   Difficulty here is the app's definition: how much the spelling hides from the
   sound (silent letters, sound-alike endings, donor-language patterns), with
   rarity and length as minor terms. That is spellDiff() in app3.js, reproduced
   below closely enough to rank — the exact ordering does not matter, only that
   the boot tier is genuinely the gentle end of the library.

   Re-runnable: it reads whichever of the two files exist and re-splits. */
const fs = require('fs');
process.chdir('/home/user/Bizzing-Bee/spellbound-app');
global.window = global;

const BOOT = 8000;

eval(fs.readFileSync('words-data.js', 'utf8'));
if (fs.existsSync('words-data-2.js')) {
  const tail = fs.readFileSync('words-data-2.js', 'utf8');
  const m = tail.match(/window\.SB_DATA\.nsf\.push\.apply\(window\.SB_DATA\.nsf,\s*(\[[\s\S]*\])\);/);
  if (m) window.SB_DATA.nsf = window.SB_DATA.nsf.concat(JSON.parse(m[1]));
}
const all = window.SB_DATA.nsf;

/* --- the ranking terms --- */
const SILENT = /(ough|augh|gn|kn|wr|mb$|mn$|ps|pn|pt|rh|sc[ei]|st[lm]|bt|lk|gh)/;
const ENDS = /(ance|ence|able|ible|tion|sion|cian|tian|eous|ious|ary|ery|ory|ise|ize|yse|yze|cede|ceed|sede|ail|ale)$/;
const DBL = /([bcdfglmnprst])\1/;
const VOW = /(ae|oe|eu|ie|ei|ui|uo|oi)/;
const score = r => {
  const w = String(r.w || '').toLowerCase();
  let s = 0;
  if (SILENT.test(w)) s += 26;
  if (ENDS.test(w)) s += 16;
  if (DBL.test(w)) s += 9;
  if (VOW.test(w)) s += 8;
  if (/[^a-z]/.test(w)) s += 14;                 // hyphens, spaces, diacritics
  if (r.m) s += 10;                              // a recorded common misspelling
  const o = String(r.o || '');
  if (/French|Greek|German|Norse|Dutch|Sanskrit|Hindi|Japanese|Arabic|Hebrew|Russian|Welsh|Irish|Persian|Yiddish|Malay|Maori|Hawaiian|Nahuatl/.test(o)) s += 12;
  s += Math.max(0, (r.y || 3) - 1) * 7;          // rarity band
  s += Math.max(0, w.length - 6) * 1.6;          // length, a minor term
  s -= Math.min(20, (r.bp || 0) / 6);            // bee-popularity pulls a word earlier
  return s;
};

const ranked = all.map((r, i) => ({ r, i, s: score(r) }))
  .sort((a, b) => (a.s - b.s) || (a.i - b.i));
const bootSet = new Set(ranked.slice(0, BOOT).map(x => x.i));
/* Keep the original array order inside each tier so nothing downstream that
   relies on stable ordering shifts more than it has to. */
const tier1 = [], tier2 = [];
all.forEach((r, i) => (bootSet.has(i) ? tier1 : tier2).push(r));

fs.writeFileSync('words-data.js',
  '/* words-data.js — the boot tier of the core library: the easiest ' + tier1.length + ' words by\n'
  + '   the app difficulty ramp. words-data-2.js carries the rest and boot-lazy appends\n'
  + '   it after first paint. Regenerate both with voice/pipeline/words-shard.js. */\n'
  + 'window.SB_DATA=' + JSON.stringify({ nsf: tier1 }) + ';\n');
fs.writeFileSync('words-data-2.js',
  '/* words-data-2.js — the rest of the core library (' + tier2.length + ' words), appended to\n'
  + '   SB_DATA.nsf on the idle queue. app3 drops its memoised pools when this lands and\n'
  + '   words-patch re-runs its QC pass over the new records.\n'
  + '   Regenerate with voice/pipeline/words-shard.js. */\n'
  + 'window.SB_DATA.nsf.push.apply(window.SB_DATA.nsf, ' + JSON.stringify(tier2) + ');\n'
  + 'try{ if(window.SB_WORDS_PATCH) window.SB_WORDS_PATCH(); }catch(e){}\n');

const mb = f => (fs.statSync(f).size / 1048576).toFixed(1) + 'MB';
console.log('total', all.length, '-> boot', tier1.length, '+ idle', tier2.length);
console.log('words-data.js', mb('words-data.js'), '| words-data-2.js', mb('words-data-2.js'));
console.log('boot tier sample:', tier1.slice(0, 12).map(r => r.w).join(', '));
console.log('idle tier sample:', tier2.slice(0, 12).map(r => r.w).join(', '));
