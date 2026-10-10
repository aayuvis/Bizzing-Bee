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
  for (const k of Object.keys(r.pieces)) if (!PIECES.includes(k) && !['beeFileFakeTip', 'progNote', 'clue2'].includes(k)) warn(`round ${r.n} extra piece key ${k}`);
  const c2 = r.pieces.clue2;
  if (c2 && (!c2.id || !c2.text || !Array.isArray(c2.suspects) || !c2.suspects.every((s) => SUSPECTS.includes(s)))) fail(`round ${r.n} clue2 malformed`);
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
const pinned = new Set(S.rounds.flatMap((r) => [r.pieces.clue, r.pieces.clue2].filter(Boolean).map((c) => c.id)));
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
    if (/^(build|ownerQuestions)\b/.test(p)) return;   // never rendered: no screen to fit
    const words = o.trim().split(/\s+/).filter(Boolean).length;
    if (words > longest.n) longest = { n: words, p };
    const authorSection = /^(changes|fairPlay)\b/.test(p);
    if (words > 60) (AUTHOR.test(key) || authorSection ? warn : fail)(`${words} words at ${p}`);
    if (o.length > 420 && !authorSection) warn(`${o.length} chars at ${p}`);
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

/* ==================================================================================================
   Review cycle 1 (r3-fairplay.md, "what this review adds", and the decisions taken on all three lenses).
   Each check below was proved by breaking a copy of the script once (see circuit/review/applied.json).
   ================================================================================================== */
const getPath = (o, p) => { let cur = o; for (const k of p.replace(/\[(\d+)\]/g, '.$1').split('.')) { if (cur == null) return undefined; cur = cur[k]; } return cur; };
const strs = (o) => typeof o === 'string' ? [o] : Array.isArray(o) ? o.flatMap(strs) : o && typeof o === 'object' ? Object.values(o).flatMap(strs) : [];
const OFFSCREEN = /^(authorNotes|fairPlay|changes|build|ownerQuestions|status|visitorsNote)\b/;
const leaves = [];   // every string leaf with its path
(function walk(o, p) {
  if (typeof o === 'string') return leaves.push({ p, s: o });
  if (Array.isArray(o)) return o.forEach((x, i) => walk(x, p + '[' + i + ']'));
  if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) walk(v, p ? p + '.' + k : k);
})(S, '');
const screenLeaves = leaves.filter((l) => !OFFSCREEN.test(l.p));
const mainPath = (p) => !p.startsWith('cases');
const build = Array.isArray(S.build) ? S.build : [];
const B = (id) => build.find((b) => b.id === id);

// 1. The build entries the script relies on exist, each with a rule, the review rows it answers, and a test.
for (const id of ['story-order', 'hall-fields', 'scripted-outcomes', 'slots', 'no-placing', 'case-origins-authored', 'case-scenes', 'team-night', 'clue-cards-ride-mail']) {
  const b = B(id);
  if (!b) { fail('build lacks ' + id); continue; }
  if (typeof b.rule !== 'string' || !b.rule || typeof b.test !== 'string' || !b.test || !Array.isArray(b.why) || !b.why.length) fail(`build ${id} needs rule, why[] and test`);
}
const outc = (B('scripted-outcomes') || {}).outcomes || [];
for (const r of S.rounds) if (!outc.find((o) => o.round === r.n)) fail(`build scripted-outcomes has no entry for round ${r.n}`);

// 2. No answer word is printed on screen before its case asks for it (earlier mail, earlier cases, the
//    Hive Post and Suspect Board, which can arrive any time, visitor cards up to the case's region, and
//    the case's own lines before the puzzle). Case 3's answers are languages and French is its plant.
const ACT_I = (a) => ACTS.indexOf(a);
const answersOf = (c, i) => i === 0 ? c.puzzle.items.filter((x) => !x.bothCorrect).map((x) => x.correct)
  : i === 1 ? c.puzzle.items.map((x) => x.word)
  : i === 3 ? c.puzzle.items.filter((x) => x.word).map((x) => x.word)
  : i === 4 ? c.puzzle.items.filter((x) => !x.ok).map((x) => x.correct) : [];
const anytime = [S.fiction, (S.signoffs || {}).inv, ...strs(S.hivePost), ...strs(S.slotLines || {}),
  ...((S.suspectBoard || {}).portraits || []).flatMap((p) => [p.label, p.why, p.labelAfter].filter(Boolean))].map((s) => ({ p: 'anytime', s }));
const CASE_AUTHOR = new Set(['engine', 'engineKey', 'theme', 'planted', 'clueOnScreen', 'safeLineNote', 'homeLanguageNote', 'answer', 'id', 'after', 'act']);
S.cases.forEach((c, k) => {
  const ans = answersOf(c, k); if (!ans.length) return;
  const seen = [...anytime];
  S.rounds.filter((r) => r.n <= c.after).forEach((r) => {
    seen.push(...strs(r.pieces).map((s) => ({ p: `rounds[${r.n - 1}]`, s })), { p: `rounds[${r.n - 1}].technique`, s: r.technique });
  });
  S.cases.slice(0, k).forEach((d, j) => Object.entries(d).filter(([kk]) => !CASE_AUTHOR.has(kk)).forEach(([kk, v]) => seen.push(...strs(v).map((s) => ({ p: `cases[${j}].${kk}`, s })))));
  if (c.after >= 8) seen.push(...strs(S.turn).map((s) => ({ p: 'turn', s })));
  S.visitors.filter((v) => ACT_I(v.act) <= ACT_I(c.act)).forEach((v) => seen.push({ p: 'visitors:' + v.figure, s: v.card }));
  ['title', 'place', 'clock', 'impossible', 'safeLine', 'taps', 'escalation', 'falseSolution'].forEach((kk) => seen.push(...strs(c[kk]).map((s) => ({ p: `cases[${k}].${kk}`, s }))));
  seen.push(...strs([c.puzzle.brief, c.puzzle.card, c.puzzle.rule].filter(Boolean)).map((s) => ({ p: `cases[${k}].puzzle`, s })));
  for (const w of ans) {
    const re = new RegExp('\\b' + w + '\\b', 'i');
    const hit = seen.find((x) => re.test(x.s));
    if (hit) fail(`case ${c.id} answer "${w}" is printed before the case asks it (${hit.p})`);
    if (k === 1) c.puzzle.items.forEach((x, j) => { if (x.word !== w && re.test(x.clue)) fail(`case ${c.id} clue ${j} prints another item's answer "${w}"`); });
  }
});

// 3. Every clue card rides a hall's mail: a case's clue is a repeat of a card some round delivers.
const delivered = new Map();
S.rounds.forEach((r) => [r.pieces.clue, r.pieces.clue2].filter(Boolean).forEach((c) => {
  if (delivered.has(c.id)) fail('clue card delivered twice: ' + c.id); delivered.set(c.id, c);
}));
S.cases.forEach((c) => { if (c.clue && !delivered.has(c.clue.id)) fail(`case ${c.id} clue "${c.clue.id}" is not delivered with any round's mail`); });
// the three suspects cleared by a card of their own (the Pronouncer is cleared by the shared slant card)
for (const who of ['vesper', 'ratchet', 'dax']) if (![...delivered.values()].some((c) => c.suspects.length === 1 && c.suspects[0] === who)) fail(`no round delivers a card that clears ${who}`);

// 4. Every {slot} on screen is declared in build[id=slots] with its source and fallback, at that path.
const SLOTS = (B('slots') || {}).slots || {};
const usedSlots = new Set();
for (const l of screenLeaves) for (const m of l.s.matchAll(/\{([A-Za-z0-9]+)\}/g)) {
  usedSlots.add(m[1]);
  const d = SLOTS[m[1]];
  if (!d) fail(`slot {${m[1]}} at ${l.p} is not declared in build[id=slots]`);
  else if (!(d.usedAt || []).includes(l.p)) fail(`slot {${m[1]}} at ${l.p} is missing from its usedAt`);
}
for (const [name, d] of Object.entries(SLOTS)) {
  if (!usedSlots.has(name)) fail(`slot {${name}} is declared but never used`);
  if (typeof d.source !== 'string' || !d.source || !('fallback' in d)) fail(`slot {${name}} needs a source and a fallback`);
  for (const p of d.usedAt || []) { const v = getPath(S, p); if (typeof v !== 'string' || !v.includes('{' + name + '}')) fail(`slot {${name}} usedAt ${p} does not hold the token`); }
}
if (SLOTS.weak) for (const p of SLOTS.weak.usedAt) { const n = +p.match(/rounds\[(\d+)\]/)[1] + 1; if (!getPath(S, `slotLines.weak.byRound.${n}`)) fail(`{weak} at ${p} has no slotLines.weak.byRound.${n} default`); }

// 5. Every library word the script asks for is in the served library (words-data.js + words-data-2.js).
require(path.join(APP, 'words-data.js')); require(path.join(APP, 'words-data-2.js'));
const LIB = new Set(window.SB_DATA.nsf.map((r) => String(r.w).toLowerCase()));
const asked = [];
S.rounds.forEach((r, i) => asked.push([`rounds[${i}].pieces.pipWord.word`, r.pieces.pipWord.word]));
S.cases[0].puzzle.items.forEach((x, j) => [].concat(x.correct).forEach((w) => asked.push([`cases[0].puzzle.items[${j}].correct`, w])));
S.cases[1].puzzle.items.forEach((x, j) => asked.push([`cases[1].puzzle.items[${j}].word`, x.word]));
S.cases[2].puzzle.items.forEach((x, j) => asked.push([`cases[2].puzzle.items[${j}].word`, x.word]));
asked.push(['cases[3].puzzle.word', S.cases[3].puzzle.word]);
S.cases[3].puzzle.items.forEach((x, j) => { if (x.word) asked.push([`cases[3].puzzle.items[${j}].word`, x.word]); });
S.cases[4].puzzle.items.forEach((x, j) => asked.push([`cases[4].puzzle.items[${j}].correct`, x.correct]));
S.visitors.forEach((v, j) => asked.push([`visitors[${j}].word`, v.word]));
outc.forEach((o) => { if (o.word) asked.push([`build scripted-outcomes round ${o.round}`, o.word]); });
for (const [p, w] of asked) if (!LIB.has(String(w).toLowerCase())) fail(`library lacks "${w}" (${p})`);

// 6. A cliff that quotes an invitation quotes the next round's invitation.
const QUOTE = /(?:^|[\s:(])'(.+?)'(?=[\s.,;:!?)]|$)/;
S.rounds.slice(0, 8).forEach((r, i) => {
  const cl = r.pieces.cliff || '';
  if (!/invitation/i.test(cl)) return;
  const m = cl.match(QUOTE); if (!m) return;
  const q = m[1].replace(/[.,;:!?]+$/, '').toLowerCase();
  if (!String(S.rounds[i + 1].pieces.inv).toLowerCase().includes(q)) fail(`round ${r.n} cliff quotes "${m[1]}", which round ${r.n + 1}'s invitation does not say`);
});

// 7. Every line signed '— V.' is listed in fairPlay.vNotes; a prediction names lines that pay it off, one of
//    them carries its marker, and a prediction made on the main path is paid off on the main path.
const VN = (S.fairPlay && S.fairPlay.vNotes) || [];
const VSIG = /— V\.(?!\s*[A-Z][a-z])/;   // a note's signature, not the Pronouncer's '— V. Abara'
for (const l of screenLeaves) if (VSIG.test(l.s) && !VN.find((v) => v.at === l.p)) fail(`V. note at ${l.p} is not listed in fairPlay.vNotes`);
for (const v of VN) {
  const at = getPath(S, v.at);
  if (typeof at !== 'string' || !VSIG.test(at)) { fail(`fairPlay.vNotes ${v.at} is not a V. note`); continue; }
  if (v.predicts == null) continue;
  if (v.says && !at.includes(v.says)) fail(`fairPlay.vNotes ${v.at} no longer says "${v.says}": re-mark its payoff`);
  const pays = (v.paidBy || []).map((p) => ({ p, s: getPath(S, p) }));
  if (!pays.length) fail(`V. prediction at ${v.at} has no payoff`);
  for (const x of pays) if (typeof x.s !== 'string') fail(`V. payoff ${x.p} (for ${v.at}) is not a line`);
  if (v.marker && !pays.some((x) => typeof x.s === 'string' && x.s.toLowerCase().includes(v.marker.toLowerCase()))) fail(`no payoff for ${v.at} carries "${v.marker}"`);
  if (mainPath(v.at) && !pays.some((x) => mainPath(x.p) && typeof x.s === 'string' && (!v.marker || x.s.toLowerCase().includes(v.marker.toLowerCase())))) fail(`V. prediction at ${v.at} is paid off only inside an optional case`);
}

// 8. The runner is on screen in every round's mail (Round IX asks who was there every single round).
S.rounds.forEach((r) => {
  const lines = Object.entries(r.pieces).filter(([k]) => k !== 'clue' && k !== 'clue2').flatMap(([, v]) => strs(v));
  if (!lines.some((s) => /\b(runner|Vale)\b/.test(s))) fail(`round ${r.n}: the runner appears in no line`);
});

// 9. Hall fields: build's table equals mockbee's band field plus the round's headliners and alsoSeated, with
//    Vesper's chair empty until Round IX; an invitation names only rivals every band seats; Round IX's
//    microphone lines are marked for exactly the bands that seat their rival.
const HF = B('hall-fields') || {};
const MB_BANDS = {};
for (const m of src.matchAll(/'(6-7|8-10|11-15)':\s*\{[^}]*ids:\s*\[([^\]]*)\]/g)) MB_BANDS[m[1]] = m[2].match(/'([a-z]+)'/g).map((s) => s.slice(1, -1));
if (Object.keys(MB_BANDS).length !== 3) fail('could not parse mockbee BANDS');
const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
for (const [band, ids] of Object.entries(MB_BANDS)) for (const r of S.rounds) {
  const want = [...new Set([...ids, ...r.headliners, ...(r.alsoSeated || [])])].filter((id) => r.n === 9 || id !== 'goldlegend');
  if (r.n === 9 && !want.includes('goldlegend')) want.push('goldlegend');
  const got = ((HF.fields || {})[band] || {})[r.n] || [];
  if (!sameSet(want, got)) fail(`hall-fields ${band} round ${r.n} is [${got}], expected [${want}]`);
  if (r.n < 9 && got.includes('goldlegend')) fail(`Vesper is seated in round ${r.n} (${band}); her chair is empty until the final`);
}
S.rounds.forEach((r) => {
  for (const b of BOTS) {
    if (!new RegExp('\\b' + b.name + '\\b').test(r.pieces.inv)) continue;
    const ok = Object.keys(MB_BANDS).every((band) => (((HF.fields || {})[band] || {})[r.n] || []).includes(b.id)) || ((HF.invNamedUnseated || {})[r.n] || []).includes(b.id);
    if (!ok) fail(`round ${r.n} invitation names ${b.name}, whom some band does not seat`);
  }
});
for (const [p, m] of Object.entries(HF.micLines || {})) {
  const rivals = m.rivals || [];
  if (!rivals.length) fail(`micLines ${p} names no rival`);
  const want = Object.keys(MB_BANDS).filter((band) => rivals.every((id) => (((HF.fields || {})[band] || {})[9] || []).includes(id)));
  if (!sameSet(want, m.bands || [])) fail(`micLines ${p}: bands [${m.bands}] should be [${want}]`);
  if (typeof getPath(S, p) !== 'string') fail(`micLines ${p} is not a line`);
}

// 10. The Ravenmere roster matches BEE-CIRCUIT.md §4.2 (test 11): ages and tells, in the cast and the roster.
const brief = fs.readFileSync(path.join(APP, 'circuit/BEE-CIRCUIT.md'), 'utf8');
const sec42 = brief.slice(brief.indexOf('### 4.2'), brief.indexOf('## 5.'));
const RAV = [];
for (const line of sec42.split('\n').filter((l) => l.startsWith('| **'))) {
  const cells = line.split('|').map((x) => x.trim());
  const ids = /Lindqvist/.test(cells[1]) ? ['ash', 'aria'] : [cells[1].match(/\*\*(\w+)\*\*/)[1].toLowerCase()];
  ids.forEach((id) => RAV.push({ id, age: +cells[2], tell: cells[3] }));
}
if (RAV.length !== 5) fail('could not read the five Ravenmere spellers from §4.2');
for (const r of RAV) {
  const c = S.cast[r.id], ro = S.teamNight.ravenmereRoster.find((x) => x.id === r.id);
  if (!c || c.age !== r.age || c.tell !== r.tell) fail(`cast ${r.id} does not match §4.2 (${r.age}, "${r.tell}")`);
  if (!ro || ro.age !== r.age || ro.tell !== r.tell) fail(`ravenmereRoster ${r.id} does not match §4.2 (${r.age}, "${r.tell}")`);
}

// 11. No on-screen puzzle text sits under a key the author notes hide (Kwame's note is `card`), and every case
//     has its three scene taps.
S.cases.forEach((c) => {
  if ('note' in c.puzzle) fail(`case ${c.id} puzzle has a 'note' key: authorNotes hide every note field, so it would not render`);
  if (!Array.isArray(c.taps) || c.taps.length !== 3 || !c.taps.every((t) => typeof t === 'string' && t)) fail(`case ${c.id} needs three scene taps`);
});

console.log(JSON.stringify({ pieceCount, rounds: S.rounds.length, cases: S.cases.length, visitors: S.visitors.length, strings, longest, changes: (S.changes || []).length }, null, 0));
console.log('WARN', warns.length); warns.forEach((w) => console.log('  ' + w));
console.log('FAIL', fails.length); fails.forEach((f) => console.log('  ' + f));
process.exit(fails.length ? 1 : 0);
