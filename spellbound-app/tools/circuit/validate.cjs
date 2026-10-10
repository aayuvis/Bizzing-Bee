/* Validates spellbound-app/circuit/script.json against the brief's rules and the app's data. */
const fs = require('fs');
const path = require('path');
const APP = path.resolve(__dirname, '..', '..');
const S = JSON.parse(fs.readFileSync(process.argv[2] || path.join(APP, 'circuit/script.json'), 'utf8'));
const fails = [], warns = [];
const fail = (m) => fails.push(m), warn = (m) => warns.push(m);

// app data
global.window = {};
require(path.join(APP, 'trail-data.js'));
require(path.join(APP, 'concepts-data.js'));
const ACTS = window.SB_TRAIL.honey.acts.map((a) => a.id);
const CH = window.SB_CONCEPTS.chapters;
const src = fs.readFileSync(path.join(APP, 'mockbee.js'), 'utf8');
const botsSrc = src.slice(src.indexOf('const BOTS = ['), src.indexOf('];', src.indexOf('const BOTS = [')) + 2);
const BOTS = [];
for (const m of botsSrc.matchAll(/\{ id: '([a-z]+)'[\s\S]*?name: '([^']+)', age: (\d+)[\s\S]*?tell: '([^']+)' \}/g)) BOTS.push({ id: m[1], name: m[2], age: +m[3], tell: m[4] });
if (BOTS.length !== 10) fail('parsed ' + BOTS.length + ' BOTS, expected 10');

// cast integrity
for (const b of BOTS) {
  const c = S.cast[b.id];
  if (!c) { fail('cast missing ' + b.id); continue; }
  if (c.name !== b.name) fail(`cast ${b.id} name ${c.name} != ${b.name}`);
  if (c.age !== b.age) fail(`cast ${b.id} age ${c.age} != ${b.age}`);
  if (c.tell !== b.tell) fail(`cast ${b.id} tell "${c.tell}" != "${b.tell}"`);
}
const needCast = ['pronouncer', 'vale', 'barnaby', 'sage', 'tullia', 'bolt', 'hazel', 'salty', 'ratchet', 'dash', 'duchess', 'sloane', 'ash', 'aria', 'arjun', 'mei'];
for (const k of needCast) if (!S.cast[k]) fail('cast missing ' + k);
for (const [k, c] of Object.entries(S.cast)) for (const f of ['name', 'age', 'tell', 'role']) if (!(f in c)) fail(`cast ${k} lacks ${f}`);
if (S.cast.vale.age !== 16) fail('Vale must be 16');

// rounds
const PIECES = ['inv', 'prog', 'drama', 'laugh', 'suspense', 'above', 'below', 'v', 'dax', 'pip', 'pipWord', 'cliff', 'clue'];
const SUSPECTS = ['vesper', 'pronouncer', 'ratchet', 'dax', 'vale'];
if (S.rounds.length !== 9) fail('rounds != 9');
let pieceCount = 0;
S.rounds.forEach((r, i) => {
  if (r.n !== i + 1) fail('round n order at ' + i);
  if (r.act !== ACTS[i]) fail(`round ${r.n} act ${r.act} != ${ACTS[i]}`);
  if (!CH[r.lessonGi] || CH[r.lessonGi].title !== r.lesson) fail(`round ${r.n} lesson "${r.lesson}" != chapter ${r.lessonGi} "${CH[r.lessonGi] && CH[r.lessonGi].title}"`);
  for (const h of r.headliners) if (!BOTS.find((b) => b.id === h)) fail(`round ${r.n} headliner ${h} not a BOT`);
  for (const p of PIECES) if (!(p in r.pieces)) fail(`round ${r.n} missing piece ${p}`);
  for (const k of Object.keys(r.pieces)) if (!PIECES.includes(k) && !['beeFileFakeTip', 'progNote'].includes(k)) warn(`round ${r.n} extra piece key ${k}`);
  const pw = r.pieces.pipWord || {};
  if (!pw.word || !pw.real) fail(`round ${r.n} pipWord lacks word/real`);
  if (!String(r.pieces.pip||'').toLowerCase().includes(pw.word)) fail(`round ${r.n} pip note does not use its word`);
  const cl = r.pieces.clue || {};
  if (!cl.id || !cl.text || !Array.isArray(cl.suspects) || !cl.suspects.every((s) => SUSPECTS.includes(s))) fail(`round ${r.n} clue malformed`);
  if (r.pieces.beeFileFakeTip && !/everyone knows/.test(r.pieces.dax)) fail(`round ${r.n} fake tip without a dax tip line`);
  if (!r.pieces.v.trim().endsWith('— V.')) fail(`round ${r.n} V. note not signed`);
  pieceCount += Object.keys(r.pieces).filter((k) => k !== 'progNote').length;
});
// above/below parity checks that matter
if (!/Far Shore/.test(S.rounds[4].pieces.above) || !/Far Shore/.test(S.rounds[4].pieces.below)) fail('Kwame letters must both plant the Far Shore');
if (!/French/.test(S.rounds[4].pieces.above) || !/French/.test(S.rounds[4].pieces.below)) fail('Kwame letters must both name French');
for (const r of [S.rounds[7]]) if (!/Mostly Suki/.test(r.pieces.above) || !/Mostly Suki/.test(r.pieces.below)) fail('Dax apology both versions');
if (!/violet pen was mine/.test(S.rounds[8].pieces.above) || !/violet pen was mine/.test(S.rounds[8].pieces.below)) fail('Vesper pen both versions');

// fair play: every V. clue before the accusation, at least 6 pointing at vale
const valeClues = S.rounds.filter((r) => r.pieces.clue && r.pieces.clue.suspects.includes('vale')).map((r) => r.n);
if (valeClues.length < 6) fail('fewer than 6 clue cards point at vale: ' + valeClues);
const pinned = new Set(S.rounds.map((r) => r.pieces.clue && r.pieces.clue.id));
for (const v of S.fairPlay.vClues) if (!pinned.has(v.clue)) fail('fairPlay names a clue not delivered in a round: ' + v.clue);
const allText = JSON.stringify(S.rounds);
if (!/Vale Penrallow, aged 8, placed last/.test(allText)) fail('programme line missing');
if (!/Thank you, Vale/.test(S.rounds[6].pieces.laugh)) fail('Vale named in plain sight in r7');

// cases
if (S.cases.length !== 5) fail('cases != 5');
for (const c of S.cases) {
  for (const f of ['id', 'after', 'title', 'engine', 'theme', 'clock', 'impossible', 'suspects', 'falseSolution', 'planted', 'escalation', 'puzzle', 'accusation', 'reveal', 'lastChill']) if (!(f in c)) fail(`case ${c.id} lacks ${f}`);
  const a = c.accusation;
  if (a.choices.length !== 3 || a.right < 0 || a.right > 2) fail(`case ${c.id} accusation shape`);
  const n = c.puzzle.items.length;
  if (n < 8 || n > 12) fail(`case ${c.id} has ${n} puzzle items (8–12)`);
}
const c1 = S.cases[0].puzzle.items;
if (c1.length !== 12) fail('case 1 needs twelve items');
if (!c1.find((x) => x.bothCorrect && x.correct.includes('colour') && x.correct.includes('color'))) fail('case 1 colour/color both-correct missing');
for (const x of c1) if (!x.bothCorrect) { // the misprint must be the correct word minus letters, in order
  let i = 0; for (const ch of x.correct) if (ch === x.printed[i]) i++;
  if (i !== x.printed.length) fail(`case 1 ${x.printed} is not ${x.correct} with letters dropped`);
}
const c3 = S.cases[2].puzzle.items;
const singles = c3.filter((x) => c3.filter((y) => y.home === x.home).length === 1).map((x) => x.home[0]).join('');
if (singles !== 'STRAIT') fail('case 3 acrostic spells ' + singles);
const twice = [...new Set(c3.filter((x) => c3.filter((y) => y.home === x.home).length === 2).map((x) => x.home))];
if (twice.join() !== 'French') fail('case 3 shared language is ' + twice);
const c4w = S.cases[3].puzzle.items.filter((x) => x.part).map((x) => x.part).join('');
if ('triskaidekaphobia' !== c4w.replace('tris', 'tris')) { if (!S.cases[3].puzzle.word.startsWith('triskaideka')) fail('case 4 word'); }
if (S.cases[3].puzzle.items.filter((x) => x.part).map((x) => x.part).join('') !== 'triskaidekaphobia') fail('case 4 parts do not join to the word: ' + c4w);
for (const x of S.cases[4].puzzle.items) {
  if (!x.statement.includes(x.word)) fail('case 5 statement lacks its word ' + x.word);
  if ((x.word === x.correct) !== x.ok) fail('case 5 ok flag wrong for ' + x.word);
  if (!/(ance|ence|able|ible|ant|ent)$/.test(x.correct)) fail('case 5 ending not one of the six: ' + x.correct);
}
// Case 2 definitions must not contain the answer
for (const x of S.cases[1].puzzle.items) if (x.clue.toLowerCase().includes(x.word)) fail('case 2 clue leaks ' + x.word);

// accusation
if (S.accusation.right !== 'vale' || S.accusation.suspects.join() !== SUSPECTS.join()) fail('accusation shape');
if (S.accusation.closingChoices.length !== 3) fail('closing choices != 3');

// turn
const t = S.turn;
for (const f of ['kwame', 'dax', 'notes', 'choice', 'apologies']) if (!(f in t)) fail('turn lacks ' + f);
if (t.choice.labels.true !== 'Sit with them' || t.choice.labels.false !== 'Give them a minute') fail('turn labels');

// team night
const TN = S.teamNight;
for (const c of TN.callerCategories) for (const band of ['8-10', '11-15']) {
  const who = c[band];
  if (who === null || who === 'you') continue;
  if (!TN.roster.lectern[band].includes(who)) fail(`caller ${c.call} ${band} -> ${who} not at that lectern`);
}
const spec = { astro: /greek/, beaker: /latin/, melody: /french/, koi: /old english/, samurai: /latin|greek/ };
for (const c of TN.callerCategories) for (const band of ['8-10', '11-15']) {
  const who = c[band]; const lang = c.call.toLowerCase();
  if (spec[who] && ['greek', 'latin', 'french', 'old english'].includes(lang) && !spec[who].test(lang)) fail(`caller ${c.call} -> ${who} contradicts mockbee spec`);
}
if (TN.ravenmereRoster.length !== 5) fail('Ravenmere roster != 5');

// visitors
const KINDS = ['classical-myth', 'norse-myth', 'person'];
for (const v of S.visitors) {
  if (!KINDS.includes(v.kind)) fail('visitor kind ' + v.kind);
  if (!ACTS.includes(v.act)) fail('visitor act ' + v.act);
  if (!v.sources || !v.sources.length) fail('visitor without sources: ' + v.figure);
  if (v.kind === 'person' && !/\(\d{4}–\d{4}\)/.test(v.card)) fail('person card undated: ' + v.figure);
}

// postcards: every act, three slots
for (const a of ACTS) { const p = S.hivePost.postcards[a]; if (!p || !['{w1}', '{w2}', '{w3}'].every((s) => p.includes(s))) fail('postcard ' + a); }

// word counts and screen fit on every string the app could show
const AUTHOR = /^(role|clearedBy|note|notes?Note|why|points|by|consequence|wrong|authorNotes|status|progNote|orderNote|lecternNote|challengeNote|invNote|postcardNote|homeLanguageNote|datesNote|clueOnScreen|visitorsNote|engineKey|engine|rule|greek|answer|safe|toTheChild|turn|accusation|opens|vWhere|labelAfter|label)$/;
let strings = 0, longest = { n: 0 };
(function walk(o, p, key) {
  if (typeof o === 'string') {
    strings++;
    const words = o.trim().split(/\s+/).filter(Boolean).length;
    if (words > longest.n) longest = { n: words, p };
    if (words > 60) (AUTHOR.test(key) || p.startsWith('changes') || p.startsWith('fairPlay') ? warn : fail)(`${words} words at ${p}`);
    if (o.length > 420 && !p.startsWith('changes') && !p.startsWith('fairPlay')) warn(`${o.length} chars at ${p}`);
    return;
  }
  if (Array.isArray(o)) return o.forEach((x, i) => walk(x, p + '[' + i + ']', key));
  if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) walk(v, p ? p + '.' + k : k, k);
})(S, '', '');

// banned content
const txt = JSON.stringify(S);
for (const bad of [/gunpoint/i, /\bclaude-[a-z0-9]|\b(opus|sonnet|haiku) \d/i, /\bmagic(al)?\b/i, /\b(stupid|idiot|loser|fat|ugly)\b/i]) {
  const m = txt.match(bad); if (m) (bad.source.includes('magic') ? warn : fail)('banned/flagged text: ' + m[0]);
}
for (const r of S.rounds) for (const [k, v] of Object.entries(r.pieces)) if (typeof v === 'string' && /\bCase \d/.test(v)) fail(`on-screen 'Case n' in r${r.n}.${k}`);

console.log(JSON.stringify({ pieceCount, rounds: S.rounds.length, cases: S.cases.length, visitors: S.visitors.length, strings, longest, changes: (S.changes || []).length }, null, 0));
console.log('WARN', warns.length); warns.forEach((w) => console.log('  ' + w));
console.log('FAIL', fails.length); fails.forEach((f) => console.log('  ' + f));
process.exit(fails.length ? 1 : 0);
