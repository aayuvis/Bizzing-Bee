/* t3-quiet-locks.cjs — FIX-BEE v2 T3: a locked plan item on a child's screen is quiet ("Comes with the family
   plan"), never "ask a grown-up". The browser guards (trust-v2, atlas-layout, avatars-engine) read the screens
   they walk; this reads every shipped script, so a lock line on a screen no walk reaches is held too. — @check

   Allowed, by name: the PIN dialog's own instruction (it IS the grown-up's door, "Ask a grown-up to enter the
   4-digit PIN"), and the Advanced Pack sales page in advanced.js, which the PIN guards before it is drawn.
   Comments are not screens and are stripped first.
   Proved by breaking (10 Oct 2026): the concept chapter's old "Ask a grown-up about it." put back → 1 fail;
   the Ultra chip's "Ask a grown-up" put back → 1 fail. */
'use strict';
const fs = require('fs'), path = require('path');
const APP = path.resolve(__dirname, '..');
let fails = 0; const ok = (c, m) => { console.log((c ? '  OK   ' : '  FAIL ') + m); if (!c) fails++; };

const ALLOW = [/Ask a grown-up to enter the 4-digit PIN/i];
const BEHIND_PIN = new Set(['advanced.js']);   // the sales page asks for the PIN first (FIX-BEE v2 T3)
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1');

const hits = [];
for (const f of fs.readdirSync(APP).filter((f) => /\.js$/.test(f) && fs.statSync(path.join(APP, f)).isFile())) {
  if (BEHIND_PIN.has(f)) continue;
  strip(fs.readFileSync(path.join(APP, f), 'utf8')).split('\n').forEach((l, i) => {
    if (!/ask a grown-up/i.test(l)) return;
    if (ALLOW.some((re) => re.test(l))) return;
    hits.push(f + ':' + (i + 1) + ' ' + (l.match(/.{0,50}ask a grown-up.{0,30}/i) || [''])[0].trim());
  });
}
ok(!hits.length, 'no shipped script prints "ask a grown-up" on a child\'s screen' + (hits.length ? ':\n       ' + hits.join('\n       ') : ''));
console.log(fails ? '\n' + fails + ' FAILED' : '\nall good');
process.exit(fails ? 1 : 0);
