/* THE BEE CIRCUIT'S DATA — cut from the script, every line where the script has it, safe, speakable, true to the cast
   (circuit/BEE-CIRCUIT.md §3.2, §10, §13 tests 8, 10, 11, 12; AMENDMENTS.md 3) — @check

   circuit-data.js (window.SB_CIRCUIT_DATA) is GENERATED from circuit/script.json by tools/circuit/build-data.cjs. This
   holds it to the script and to the rules a line on a child's screen must keep:
     GENERATED   the file is exactly what the tool writes now (never hand-edited).
     ONLY WHAT IS SHOWN   no author section (authorNotes, changes, fairPlay, ownerQuestions, status, build prose), no
                 cast role, no portrait's clearedBy, no *Note / note field, no case theme / planted / clueOnScreen /
                 puzzle answer, no season-2 seeds — and no long author-only sentence of the script anywhere in the file
                 (the mystery's spoilers stay out of the page).
     SAME PATH   every on-screen line (SB_CIRCUIT.keys()) reads, at its path, exactly what the script says there; and
                 every on-screen line of the script (rounds' pieces, the turn, Team Night, the accusation, the Hive Post,
                 the slot lines, the cases' scenes, the visitors' cards) is a key.
     §10 VISITORS a visitor stands at a stop only when a word on that stop's OWN list (trail-map-data.js, every band) is
                 theirs; at most one per stop; a visitor with no such stop stands nowhere; visitorFor(stop) answers it.
     TEST 8      every key is a non-empty line the device can speak (it has letters, no markup, no raw {slot} once
                 filled) and is at most 60 words — one 390 px screen (the browser half, measuring each line and each
                 delivered piece at 390 × 844, is tests/circuit-post.cjs). No clip is needed: lines are read by the
                 device voice on a tap (amendment 3).
     TEST 10     circuit.js holds no text input: no <input, <textarea, <select, contenteditable or prompt() (the DOM
                 half is tests/circuit-post.cjs).
     TEST 11     the ten rivals' names, ages and tells are Mock Bee's (mockbee.js BOTS — Suki is 'snowfox' since 14 Oct),
                 and Ravenmere's five are BEE-CIRCUIT.md §4.2's, in the cast and the Team Night roster.
     TEST 12     every line passes the kid-safe list (no headword of its families, no under-eleven word, no gloss-level
                 phrase), the stigma list (SB_KID_SAFE.stigma, the page's own scan) and app3's SB_UNSAFE_RE. (CORE_STRIKE is
                 not a text list: it strikes HEADWORDS from the corpus — "come", "nov" — that are ordinary in a sentence.)
   SB_ROOT=<dir> runs against another tree (a scratch root of symlinks with one file replaced).
   PROVED BY BREAKING (scratch root of symlinks, ONE file replaced, SB_ROOT; circuit/BUILD-core.md has the record):
     - circuit-data.js hand-edited ("Nine rounds" → "Ten rounds") → 2 fail (GENERATED; SAME PATH at rounds[0].pieces.inv);
     - circuit-data.js carrying Vale's cast role ("… She is V. …") → 3 fail (GENERATED; the author field; the spoiler scan);
     - circuit-data.js with Psyche moved to a Storm stop whose list does not hold "psychology" → 2 fail (GENERATED; §10);
     - mockbee.js with Suki back as 'panda' → 1 fails (TEST 11);
     - circuit-data.js with "stupid" in Pip's Round II note → 3 fail (GENERATED; SAME PATH; TEST 12 names the word);
     - circuit.js with an <input> on the Suspect Board → 1 fails (TEST 10).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/circuit-data.cjs                                       */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const APP = path.resolve(__dirname, '..');
const ROOT = process.env.SB_ROOT ? path.resolve(process.env.SB_ROOT) : APP;
const { harness } = require('./circuit-mail.cjs');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const some = (a, n) => (a.length ? ' — ' + a.slice(0, n || 5).join(' | ') + (a.length > (n || 5) ? ' … (' + a.length + ')' : '') : '');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const S = JSON.parse(read('circuit/script.json'));
const get = (o, p) => { let cur = o; for (const k of String(p).replace(/\[(\d+)\]/g, '.$1').split('.')) { if (cur == null) return undefined; cur = cur[k]; } return cur; };
const leaves = (o, p, out) => { out = out || []; if (typeof o === 'string') out.push({ p, s: o }); else if (Array.isArray(o)) o.forEach((x, i) => leaves(x, p + '[' + i + ']', out)); else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) leaves(v, p ? p + '.' + k : k, out); return out; };

/* ---- generated ---- */
const prevRoot = process.env.SB_ROOT; process.env.SB_ROOT = ROOT;
delete require.cache[require.resolve(path.join(APP, 'tools/circuit/build-data.cjs'))];
const tool = require(path.join(APP, 'tools/circuit/build-data.cjs'));
const fileText = read('circuit-data.js');
ok(tool.build(ROOT) === fileText, 'circuit-data.js is exactly what tools/circuit/build-data.cjs writes from circuit/script.json (never hand-edited)');
if (prevRoot == null) delete process.env.SB_ROOT; else process.env.SB_ROOT = prevRoot;

const h = harness(); const D = h.D, C = h.C;
const keys = C.keys();

/* ---- only what is shown ---- */
{
  const bad = [];
  for (const sec of ['authorNotes', 'changes', 'fairPlay', 'ownerQuestions', 'status', 'visitorsNote', 'build']) if (sec in D) bad.push(sec);
  (function walk(o, p) {
    if (Array.isArray(o)) return o.forEach((x, i) => walk(x, p + '[' + i + ']'));
    if (!o || typeof o !== 'object') return;
    for (const [k, v] of Object.entries(o)) {
      const q = p ? p + '.' + k : k;
      if (/^(clearedBy|note|planted|clueOnScreen|season2Seeds|toTheChild|opens|datesNote|theme|answer)$/.test(k) || /Note$/.test(k) || (k === 'role' && /^cast\./.test(q))) bad.push(q);
      walk(v, q);
    }
  })(D, '');
  ok(!bad.length, 'no author field reaches the page (roles, clearedBy, notes, planted, themes, answers, season-2 seeds…)' + some(bad));
  const shownText = keys.map((k) => get(D, k)); const shown = new Set(shownText);
  const onScreen = (t) => shown.has(t) || shownText.some((x) => x.includes(t));   /* a review quoting a line is not a spoiler */
  const author = leaves(S.authorNotes, 'authorNotes').concat(leaves(S.fairPlay, 'fairPlay'), leaves(S.changes, 'changes'), leaves(S.ownerQuestions, 'ownerQuestions'),
    Object.entries(S.cast).map(([k, c]) => ({ p: 'cast.' + k + '.role', s: c.role })), S.suspectBoard.portraits.map((x, i) => ({ p: 'portraits[' + i + '].clearedBy', s: x.clearedBy || '' })))
    .filter((x) => x.s && x.s.length >= 24 && (x.s.match(/\s/g) || []).length >= 4 && !onScreen(x.s));   /* sentences, not paths */
  const leak = author.filter((x) => fileText.includes(JSON.stringify(x.s).slice(1, -1)) || x.s.split(/(?<=[.!?])\s+/).some((sn) => sn.length >= 30 && !onScreen(sn) && fileText.includes(JSON.stringify(sn).slice(1, -1))));
  ok(author.length > 300 && !leak.length, `no author-only sentence of the script is in the file (${author.length} checked — the spoilers stay out)` + some(leak.map((x) => x.p)));
}

/* ---- same path ---- */
{
  const off = keys.filter((k) => get(S, k) !== get(D, k));
  ok(keys.length > 600 && !off.length, `every on-screen line (${keys.length} keys) reads at its path exactly what the script says there` + some(off));
  const want = [].concat(
    leaves(S.fiction, 'fiction'), leaves(S.signoffs.inv, 'signoffs.inv'),
    S.suspectBoard.portraits.flatMap((x, i) => ['label', 'why', 'labelAfter'].filter((k) => x[k]).map((k) => ({ p: 'suspectBoard.portraits[' + i + '].' + k }))),
    S.rounds.flatMap((r, i) => leaves(r.pieces, 'rounds[' + i + '].pieces').filter((x) => !/\.(progNote|id|suspects\[\d+\])$/.test(x.p))),
    ['scene', 'kwame', 'dax', 'notesIntro', 'daxOnNotes'].map((k) => ({ p: 'turn.' + k })), leaves(S.turn.notes, 'turn.notes'), leaves(S.turn.choice.labels, 'turn.choice.labels'), leaves(S.turn.choice.line, 'turn.choice.line'),
    S.turn.apologies.flatMap((a, i) => [{ p: 'turn.apologies[' + i + '].text' }, { p: 'turn.apologies[' + i + '].reply' }]),
    leaves(S.teamNight.beats, 'teamNight.beats'), [{ p: 'teamNight.challenge' }],
    leaves(S.accusation, 'accusation').filter((x) => !/\.(opens|right|suspects\[\d+\])$/.test(x.p)),
    leaves(S.hivePost, 'hivePost').filter((x) => !/postcardNote$/.test(x.p)), leaves(S.slotLines, 'slotLines'),
    S.visitors.map((v, i) => ({ p: 'visitors[' + i + '].card' })),
    S.cases.flatMap((c, i) => ['title', 'place', 'lateLine', 'clock', 'impossible', 'safeLine', 'falseSolution', 'escalation', 'lastChill'].filter((k) => c[k]).map((k) => ({ p: 'cases[' + i + '].' + k }))
      .concat(leaves(c.taps, 'cases[' + i + '].taps'), leaves(c.reveal, 'cases[' + i + '].reveal'), leaves(c.accusation.choices, 'cases[' + i + '].accusation.choices'),
        c.suspects.map((x, j) => ({ p: 'cases[' + i + '].suspects[' + j + '].secret' })), ['brief', 'card', 'rule'].filter((k) => c.puzzle[k]).map((k) => ({ p: 'cases[' + i + '].puzzle.' + k })))));
  const K = new Set(keys); const miss = want.map((x) => x.p).filter((p) => !K.has(p));
  ok(want.length > 350 && !miss.length, `every on-screen line of the script (${want.length}) is a key of the data` + some(miss));
}

/* ---- §10 visitors ---- */
{
  const w = {}; w.window = w; vm.createContext(w);
  vm.runInContext(read('trail-data.js'), w); vm.runInContext(read('trail-map-data.js'), w);
  const M = w.SB_TRAIL_MAP; const listOf = (u) => Object.values(M[u] || {}).flat().map((x) => String(x).toLowerCase());
  const placed = D.visitors.map((v, i) => ({ v, i })).filter((x) => x.v.stop);
  const bad = placed.filter(({ v }) => !listOf(v.stop).includes(v.word.toLowerCase())).map(({ v }) => v.figure + '@' + v.stop);
  ok(placed.length >= 5 && !bad.length, `${placed.length} visitors stand at a stop, each where a word on that stop's own list is theirs` + some(bad));
  const stops = placed.map((x) => x.v.stop);
  ok(new Set(stops).size === stops.length, 'at most one visitor per stop');
  const allStops = Object.keys(M);
  const homeless = D.visitors.filter((v) => !v.stop && !allStops.some((u) => listOf(u).includes(v.word.toLowerCase()) && !stops.includes(u)));
  ok(homeless.length === D.visitors.filter((v) => !v.stop).length, 'a visitor stands nowhere only when no free stop lists their word (January, June and the weekdays are on no list)');
  ok(placed.every(({ v, i }) => D.visitorAt[v.stop] === i && C.visitorFor(v.stop) === D.visitors[i]) && C.visitorFor('u1') === null && Object.keys(D.visitorAt).length === placed.length,
    'visitorFor(stop) answers the stop\'s visitor, and null where there is none');
  ok(D.visitors.every((v) => Array.isArray(v.sources) && v.sources.length && v.sources.every((s) => s && typeof s.ref === 'string' && s.ref)), 'every visitor card keeps its sources');
}

/* ---- test 8: every key a line the device can speak, ≤ 60 words ---- */
{
  const bad = [];
  for (const k of keys) {
    const s = C.fill(k, null);
    if (!s.trim()) bad.push(k + ' empty'); else if (!/[A-Za-z]/.test(s)) bad.push(k + ' has no letters');
    if (/[<>]|\{[A-Za-z0-9]+\}/.test(s)) bad.push(k + ' markup or a raw slot');
    if (s.trim().split(/\s+/).length > 60) bad.push(k + ' ' + s.trim().split(/\s+/).length + ' words');
  }
  ok(!bad.length, `all ${keys.length} keys are non-empty lines the device can speak, each ≤ 60 words (one phone screen)` + some(bad));
}

/* ---- test 10: no text input in circuit.js ---- */
{
  const src = read('circuit.js').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  const hits = [/<input/i, /<textarea/i, /<select/i, /contenteditable\s*=|\[contenteditable|setAttribute\(\s*['"]contenteditable/i, /\bprompt\s*\(/].filter((re) => re.test(src)).map(String);
  ok(!hits.length, 'circuit.js holds no text input (L7: every choice is a pre-written line)' + some(hits));
}

/* ---- test 11: cast integrity ---- */
{
  const mb = read('mockbee.js');
  const botsSrc = mb.slice(mb.indexOf('const BOTS = ['), mb.indexOf('];', mb.indexOf('const BOTS = [')) + 2);
  const BOTS = [...botsSrc.matchAll(/\{ id: '([a-z]+)'[\s\S]*?name: '([^']+)', age: (\d+)[\s\S]*?tell: '([^']+)' \}/g)].map((m) => ({ id: m[1], name: m[2], age: +m[3], tell: m[4] }));
  const off = BOTS.filter((b) => !D.cast[b.id] || D.cast[b.id].name !== b.name || D.cast[b.id].age !== b.age || D.cast[b.id].tell !== b.tell).map((b) => b.id);
  ok(BOTS.length === 10 && !off.length && BOTS.some((b) => b.id === 'snowfox' && b.name === 'Suki'), 'the ten rivals\' names, ages and tells are Mock Bee\'s own (Suki is snowfox)' + some(off));
  const brief = read('circuit/BEE-CIRCUIT.md'); const sec = brief.slice(brief.indexOf('### 4.2'), brief.indexOf('## 5.'));
  const RAV = [];
  for (const line of sec.split('\n').filter((l) => l.startsWith('| **'))) { const c = line.split('|').map((x) => x.trim());
    (/Lindqvist/.test(c[1]) ? ['ash', 'aria'] : [c[1].match(/\*\*(\w+)\*\*/)[1].toLowerCase()]).forEach((id) => RAV.push({ id, age: +c[2], tell: c[3] })); }
  const roff = RAV.filter((r) => { const c = D.cast[r.id], o = D.teamNight.ravenmereRoster.find((x) => x.id === r.id); return !c || c.age !== r.age || c.tell !== r.tell || !o || o.age !== r.age || o.tell !== r.tell; }).map((r) => r.id);
  ok(RAV.length === 5 && !roff.length, 'Ravenmere\'s five match BEE-CIRCUIT.md §4.2 in the cast and the Team Night roster' + some(roff));
  const seat = (id) => !!D.cast[id];
  ok(D.rounds.every((r) => r.headliners.every(seat) && (r.alsoSeated || []).every(seat)) && Object.values(D.rules.hallFields.fields).every((b) => Object.values(b).every((f) => f.every(seat))),
    'every headliner and every seat in every hall is a cast member');
}

/* ---- test 12: kid-safe and stigma ---- */
{
  const { load } = require(path.join(APP, 'tools/stigma.cjs')); const K = load(ROOT);
  const { closure } = require(path.join(APP, 'tools/app3-closure.cjs'));
  const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(closure(['SB_UNSAFE_RE']) + '\nwindow.U = SB_UNSAFE_RE;', ctx);
  const BLOCK = new Set(Object.values(K.words).flat()), YOUNG = new Set(K.young.words), DEF = new RegExp(K.defs.join('|'), 'i');
  const lines = keys.map((k) => ({ k, s: C.fill(k, null) }));
  const hits = [];
  for (const { k, s } of lines) {
    const words = (s.toLowerCase().match(/[a-z][a-z'-]*/g) || []).map((x) => x.replace(/'s$/, '').replace(/^'|'$/g, ''));
    for (const w of words) { if (BLOCK.has(w)) hits.push(k + ': "' + w + '" (kid-safe ' + Object.keys(K.words).find((f) => K.words[f].includes(w)) + ')'); if (YOUNG.has(w)) hits.push(k + ': "' + w + '" (under eleven)'); }
    const sg = K.stigmaHits(s); if (sg.length) hits.push(k + ': stigma "' + sg[0].hit + '"');
    if (ctx.U.test(s)) hits.push(k + ': SB_UNSAFE_RE');
    if (DEF.test(s)) hits.push(k + ': a kid-safe phrase "' + s.match(DEF)[0] + '"');
  }
  ok(lines.length > 600 && !hits.length, `all ${lines.length} Circuit lines pass the kid-safe list, the stigma list and SB_UNSAFE_RE` + some(hits, 8));
}

console.log(fails ? `\n${fails} FAILED` : '\nthe Circuit\'s data is the script\'s, where the script has it, and every line is safe to read aloud to a child');
process.exit(fails ? 1 : 0);
