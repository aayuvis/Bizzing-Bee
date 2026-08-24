/* The Coach's rulebook must cover every trap the app can actually report.

   missTraps() clusters a child's misses into TRAP_DEFS plus three origin keys, and the
   Coach page looks each one up in SB_COACH_RULES. A trap with no rule is a silent hole:
   the page just drops that row, and the one pattern catching the child most is the one
   they hear nothing about. Same for TRAP_CONCEPT_RE, which decides "concepts to revise". */
const fs = require('fs'), path = require('path');
const app = fs.readFileSync(path.join(__dirname, '..', 'app3.js'), 'utf8');
global.window = {};
require(path.join(__dirname, '..', 'coach-rules.js'));
const R = window.SB_COACH_RULES;

// the keys missTraps() can emit: TRAP_DEFS + the three origins it adds by hand
const defs = app.match(/const TRAP_DEFS=\[([\s\S]*?)\];/)[1];
const keys = [...defs.matchAll(/\['([a-z]+)',/g)].map(m => m[1]).concat(['french', 'greek', 'latin']);
const conceptRe = app.match(/const TRAP_CONCEPT_RE=\{([\s\S]*?)\};/)[1];

let bad = 0;
const ok = (c, m) => { console.log((c ? '  OK   ' : '  FAIL ') + m); if (!c) bad++; };

console.log(`traps missTraps can report: ${keys.join(' ')}\n`);
keys.forEach(k => {
  const r = R[k];
  ok(!!r, `${k.padEnd(8)} has a coaching rule`);
  if (!r) return;
  ok(!!(r.label && r.mistake && r.rule && r.check), `${k.padEnd(8)} rule is complete (label/mistake/rule/check)`);
  ok((r.egs || []).length >= 3, `${k.padEnd(8)} has ${(r.egs || []).length} worked examples (want 3+)`);
  ok(new RegExp(`(^|[,{\\s])${k}:`).test(conceptRe), `${k.padEnd(8)} maps to concept chapters`);
});
// the trickAnal families the word chips are labelled from must all be reachable
const cls = new Set(Object.values(R).flatMap(r => r.cls || []));
['silent', 'fr', 'gk', 'end', 'dbl', 'vow', 'epon', 'hom'].forEach(f =>
  ok(cls.has(f), `trickAnal family "${f}" is claimed by some rule`));

console.log(bad ? `\n${bad} FAILED` : `\nall ${keys.length} traps are coached`);
process.exit(bad ? 1 : 0);
