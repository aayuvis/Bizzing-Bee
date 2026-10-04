/* T5 — NO Math.random() IN A REWARD, GRADE, POWER-UP OR ENCOUNTER PATH (games spec §1.3, §8) — @check

   FAMILY-STANDARD: no random reward anywhere. tests/no-random.cjs holds the Shop and the avatar cards
   (chance cannot change what a purchase or a milestone gives); this holds the GAMES, from the source:
   every Math.random() call in a shipped script is placed in the function around it
   (tests/lib/js-scan.cjs), and it fails when that call is
     · reward     — in a function (under ~3,000 characters, i.e. not a whole engine) that pays coins:
                    addCoins( or payG(
     · grade      — in a function that judges an answer (grade…, check…, submit…, answer…, score…)
     · power-up   — on a line that picks a power (POWERS[…], "power-up")
     · encounter  — anywhere inside an ambush, an encounter, a villain, a rival or a bot's turn (bot…),
                    where chance decides what the child meets or whether a rival beats them
   A seeded pick is fine for presentation (spec §1.3); Math.random is not. Offenders are listed by
   file, line and function, with the owner who is changing that code today.
   Proved by breaking: a `Math.random()<.5 ? addCoins('answer') : 0` in Magic Squares' finish names
   magicFinishCell.
   Run: node tests/no-random-rewards.cjs                                                        */
'use strict';
const fs = require('fs'), path = require('path');
const { scan, chain } = require('./lib/js-scan.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const DATA = /^(words-|voice-|trivia-q|trivia-words|trivia-data|trivia-icons|adv-|concepts-data|concept-scripts|lessons-data|story-data|figurative-data|nsf-|scripps-data|sounds-data|southasia-data|trail-data|trail-map-data|themes-data|theme-lore|tips-data|quotes|icons|avatars-art|avatar-|cover-art|game-art|kid-safe|word-|saga-art)/;
/* presentation-only randomness that sits inside one of those paths, each with its reason (none today) */
const ALLOW = {};
const GRADE = /^(grade|judge|check|submit|answer|score|verdict)|(Grade|Answer|Submit|Judge|Verdict)/;
const ENC = /ambush|encounter|villain|^bot[A-Z]|rival/i;
const files = fs.readdirSync(ROOT).filter(f => /\.js$/.test(f) && !DATA.test(f));
const bad = []; let calls = 0, paying = 0;
for (const f of files) {
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const S = /Math\.random\(|addCoins\(|payG\(/.test(src) ? scan(src) : null; if (!S) continue;
  const lines = src.split('\n');
  const re = /Math\.random\(/g; let m;
  while ((m = re.exec(src))) {
    if (S.inComment(m.index)) continue; calls++;
    const ch = chain(S, m.index).filter(x => x.name !== '(anon)'); const inner = ch[0];
    const ln = src.slice(0, m.index).split('\n').length, text = lines[ln - 1];
    const why = [];
    if (inner && inner.close - inner.open <= 3000 && /\b(addCoins|payG)\(/.test(src.slice(inner.open, inner.close))) why.push('reward');
    if (inner && GRADE.test(inner.name)) why.push('grade');
    if (/\bPOWERS?\b|power-?ups?\b/i.test(text)) why.push('power-up');
    const enc = ch.find(x => ENC.test(x.name)); if (enc) why.push('encounter (' + enc.name + ')');
    if (!why.length) continue;
    const key = f + ':' + (inner ? inner.name : '(top)'); if (ALLOW[key]) continue;
    bad.push(`${f}:${ln} ${inner ? inner.name : '(top)'}() — ${why.join(', ')}`);
  }
  paying += (src.match(/\b(addCoins|payG)\(/g) || []).length;
}
ok(calls > 50 && paying > 40, `read ${calls} Math.random() calls and ${paying} coin payments in ${files.length} shipped scripts`);
/* who is changing the code each offender sits in (4 Oct 2026, the games rebuild) */
const OWNER = f => /^mockbee\.js/.test(f) ? ' [Mock Bee — rivals resolved from their profiles, §4.1]' : /^saga2\.js:\d+ spellGate/.test(f) ? ' [Grand Prix — the deterministic power-up table, §2.4]' : /^trail\.js/.test(f) ? ' [Atlas encounters, §4.7]' : '';
ok(!bad.length, 'no Math.random() in a reward, grade, power-up or encounter path' + (bad.length ? ' — ' + bad.map(x => x + OWNER(x)).join(' · ') : ''));
console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
