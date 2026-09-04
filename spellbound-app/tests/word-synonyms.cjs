// The synonym layer: 1-2 one/two-word meanings per word.
//
// The rule that matters is that a synonym is for the sense the bank teaches —
// each was drawn with the word's own definition in hand — and that a word with
// no honest short equivalent carries none. A wrong synonym is worse than a
// missing one, so absence is a valid answer and is not counted as a gap.
const fs = require('fs');
const SRC = process.env.SRC || __dirname + '/..';
let fails = 0;
const ok = (b, msg) => { console.log((b ? '  OK   ' : '  FAIL ') + msg); if (!b) fails++; };

const g = {};
new Function('window', fs.readFileSync(SRC + '/word-synonyms.js', 'utf8'))(g);
const S = g.SB_SYN;
ok(S && typeof S === 'object', 'word-synonyms.js defines SB_SYN');
const keys = Object.keys(S);
ok(keys.length > 40000, 'it carries a real layer — ' + keys.length + ' words with a synonym');

let selfRef = 0, infl = 0, tooLong = 0, empty = 0, odd = 0;
for (const w of keys) {
  const v = S[w];
  if (!Array.isArray(v) || !v.length) { empty++; continue; }
  const lw = w.toLowerCase();
  for (const s of v) {
    if (typeof s !== 'string') { odd++; continue; }
    if (s === lw) selfRef++;
    if (s.startsWith(lw.slice(0, Math.max(4, lw.length - 3)))) infl++;
    if (s.trim().split(/\s+/).length > 2) tooLong++;
    if (!/^[a-z][a-z '\-]*$/.test(s)) odd++;
  }
}
ok(selfRef === 0, 'no synonym is just its own headword (' + selfRef + ')');
ok(infl === 0, 'nor an inflection of it (' + infl + ')');
ok(tooLong === 0, 'every synonym is one or two words (' + tooLong + ')');
ok(odd === 0, 'no stray characters or non-strings (' + odd + ')');
ok(empty === 0, 'the shipped file holds only words that HAVE one — the rest are simply absent');

// a spot check that the sense is the bank's sense, not another one
const spot = { abject: 'miserable', panacea: 'cure-all', derisively: 'mockingly' };
for (const [w, want] of Object.entries(spot))
  ok((S[w] || []).includes(want), w + ' reads as "' + want + '" (' + JSON.stringify(S[w] || []) + ')');

// wired in, and NOT in the boot path
const boot = fs.readFileSync(SRC + '/boot-lazy.js', 'utf8');
const app3 = fs.readFileSync(SRC + '/app3.js', 'utf8');
const idx = fs.readFileSync(SRC + '/index.html', 'utf8');
ok(/syn: 'word-synonyms\.js'/.test(boot), 'registered with the lazy loader');
ok(/card: \[[^\]]*'syn'/.test(boot), 'and loaded with the word card group');
ok(/function synsFor/.test(app3) && /synsHTML\(w\.w\)/.test(app3), 'the word card shows them');
ok(!/src="word-synonyms\.js/.test(idx), 'and it is NOT a boot script');

console.log(fails ? '\n' + fails + ' FAILED' : '\nall good');
process.exit(fails ? 1 : 0);
