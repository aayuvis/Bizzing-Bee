/* ONE PAY PATH — never pay for finishing (games spec §1.3, §6) — @check

   Coins come only through the family events, and a game earns them for what a child DID: `answer`
   for a word or answer right, `contest` at a PASS MARK (70% right, a podium, a won ladder, a duel
   won), `stop` for a Squares square, `mastery` from the later-day mastery record. The bug this
   guards is the commonest one in the audit: a `contest` coin paid when a round merely ENDS (Mock Bee
   paid 10 at any finish; the Spelling Duel paid both players for reaching the end; the Advanced
   mock paid below its own pass mark). Read from the source with tests/lib/js-scan.cjs:
     · every addCoins('contest') sits behind a condition on its own statement — `if (won…)`,
       `pass ? … : 0`, `pct >= 70 && …` — naming a pass, a win, a podium or a percentage
     · no addCoins call passes a number (a bare number pays nothing and hides a wage)
     · payG and addCoins('answer') are the only per-answer pay; a game file names no other event
       than the four
   Offenders are listed by file, line and function.
   Proved by breaking: put the duel's `addCoins('contest')` back at its finish and it is named.
   Run: node tests/pay-path.cjs                                                                   */
'use strict';
const fs = require('fs'), path = require('path');
const { scan, enclosing } = require('./lib/js-scan.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const DATA = /^(words-|voice-|trivia-q|trivia-words|trivia-data|trivia-icons|adv-|concepts-data|concept-scripts|lessons-data|story-data|figurative-data|nsf-|scripps-data|sounds-data|southasia-data|trail-data|trail-map-data|themes-data|theme-lore|tips-data|quotes|icons|avatars-art|avatar-|cover-art|game-art|kid-safe|word-|saga-art|bizzing-wallet)/;
const PASS = /\b(won|win|wins|pass|passed|pct|podium|place|placing|top3|score|right)\b[^;]*?(>=|>|===|\?|&&)|\b(if|&&|\?)\s*\(?\s*!?\s*[\w.]*\b(won|win|pass|passed|podium|top3)\b/i;
const files = fs.readdirSync(ROOT).filter(f => /\.js$/.test(f) && !DATA.test(f));
const finishPay = [], numberPay = [], oddEvent = []; let contests = 0, calls = 0;
for (const f of files) {
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8'); if (!/addCoins\(/.test(src)) continue;
  const S = scan(src); const re = /(^|[^\w.$])addCoins\(\s*([^)]*)\)/g; let m;
  while ((m = re.exec(src))) {
    const at = m.index + m[1].length; if (S.inComment(at)) continue;
    if (/function\s+$/.test(src.slice(Math.max(0, at - 12), at))) continue;     // the definition
    calls++;
    const arg = m[2].trim(), ln = src.slice(0, at).split('\n').length, fn = (enclosing(S, at, true) || {}).name || '(top)';
    if (/^\d/.test(arg)) numberPay.push(`${f}:${ln} ${fn}() addCoins(${arg})`);
    const ev = (arg.match(/^['"](\w+)['"]$/) || [])[1];
    if (ev && !/^(answer|stop|contest|mastery)$/.test(ev)) oddEvent.push(`${f}:${ln} ${fn}() '${ev}'`);
    if (ev !== 'contest') continue; contests++;
    /* the statement the call sits in: back to the previous ; { or } that is not inside parentheses */
    let i = at, depth = 0; while (i > 0) { const ch = src[i - 1]; if (ch === ')') depth++; else if (ch === '(') { if (depth) depth--; else { i--; continue; } } else if (!depth && (ch === ';' || ch === '{' || ch === '}')) break; i--; }
    const stmt = src.slice(i, at + m[0].length - m[1].length);
    /* an `if (…)` that opens the block the call is in counts as its condition */
    const blockHead = src.slice(Math.max(0, i - 160), i + 1);
    const guarded = PASS.test(stmt) || /if\s*\([^)]*\b(won|win|pass|passed|podium|pct|top3)\b[^)]*\)\s*\{?\s*(try\s*)?\{?\s*$/.test(blockHead);   // `if (R.pass) { try {` too (gym.js, 4 Oct)
    if (!guarded) finishPay.push(`${f}:${ln} ${fn}() — "${stmt.replace(/\s+/g, ' ').trim().slice(-70)}"`);
  }
}
ok(calls > 40 && contests >= 4, `read ${calls} addCoins calls, ${contests} of them 'contest'`);
const OWNER = x => /^mockbee\.js/.test(x) ? ' [Mock Bee pays contest for the top 3 only, §4.1/§6]' : '';
ok(!finishPay.length, "every 'contest' coin sits behind a pass mark, a win or a podium — none for finishing" + (finishPay.length ? ' — ' + finishPay.map(x => x + OWNER(x)).join(' · ') : ''));
ok(!numberPay.length, 'no addCoins call passes a bare number' + (numberPay.length ? ' — ' + numberPay.join(' · ') : ''));
ok(!oddEvent.length, 'every event named is one of the four (answer · stop · contest · mastery)' + (oddEvent.length ? ' — ' + oddEvent.join(' · ') : ''));
console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
