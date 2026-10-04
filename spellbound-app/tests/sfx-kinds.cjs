/* T10 — NO UNKNOWN sfx() KIND (games spec §1.6, 4 Oct 2026) — @check

   sfx(kind) (app2.js) plays one of a fixed set of tones and says NOTHING for a kind it does not know:
   Mock Bee called sfx('right') on every right answer and the child heard silence where the cheer
   should be. The valid kinds are read from sfx() itself (every `kind==='…'` branch), so a new tone
   is added in one place and this test follows it. Every literal kind passed to sfx() in any shipped
   file must be one of them; the offenders are listed by file and line.
   Proved by breaking: put sfx('right') back at app3.js's Spelling Duel and this fails on that line.
   Run: node tests/sfx-kinds.cjs                                                                 */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };

const app2 = fs.readFileSync(path.join(ROOT, 'app2.js'), 'utf8');
const def = app2.indexOf('function sfx(kind)');
ok(def >= 0, 'sfx(kind) is defined in app2.js');
const body = app2.slice(def, app2.indexOf('\n}', def));
const KINDS = new Set([...body.matchAll(/kind\s*===\s*'([a-z]+)'/g)].map(m => m[1]));
ok(KINDS.size >= 7 && ['correct', 'wrong', 'coin', 'win', 'lose', 'level', 'tick'].every(k => KINDS.has(k)),
  'the valid kinds are read from sfx() itself: ' + [...KINDS].join(', '));

/* every shipped script (data files carry no calls, but scanning them costs nothing) */
const files = fs.readdirSync(ROOT).filter(f => /\.js$/.test(f));
const bad = []; let calls = 0;
for (const f of files) {
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const re = /(^|[^\w.$])sfx\(/g; let m;
  while ((m = re.exec(src))) {
    const start = m.index + m[0].length; let depth = 1, i = start, q = null;
    for (; i < src.length && depth; i++) { const ch = src[i];
      if (q) { if (ch === '\\') i++; else if (ch === q) q = null; continue; }
      if (ch === "'" || ch === '"' || ch === '`') q = ch; else if (ch === '(') depth++; else if (ch === ')') depth--; }
    const arg = src.slice(start, i - 1);
    if (/^\s*kind\s*$/.test(arg)) continue;                       // the definition's own parameter
    /* a literal compared against (id==='free' ? … : …) is a condition, not a kind */
    const kinds = arg.replace(/[=!]==?\s*('[^']*'|"[^"]*")/g, '').replace(/('[^']*'|"[^"]*")\s*[=!]==?/g, '');
    const lits = [...kinds.matchAll(/'([^'\\]*)'|"([^"\\]*)"/g)].map(x => x[1] != null ? x[1] : x[2]);
    if (!lits.length) continue; calls++;
    const line = src.slice(0, m.index).split('\n').length;
    lits.filter(k => !KINDS.has(k)).forEach(k => bad.push(`${f}:${line} sfx('${k}')`));
  }
}
ok(calls > 50, `read ${calls} sfx() calls with a literal kind across ${files.length} files`);
ok(!bad.length, 'no unknown sfx() kind' + (bad.length ? ' — ' + bad.join(' · ') : ''));
console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
