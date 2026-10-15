/* THE SURPRISE STOPS' DATA AND RULES, FROM THE SOURCE (The Bee Circuit, BEE-CIRCUIT.md §7, §13; build step 6) — @check

   circuit-cases-data.js is GENERATED (tools/circuit/build-cases.cjs) from circuit/script.json and the served library;
   circuit-cases.js is the runner. This holds, in node:
     1. GENERATED: the file is exactly what the tool writes today (a hand edit, a script change or a library change not
        re-run fails here), and the tool's own refusals are empty.
     2. EVERY WORD FROM THE SCRIPT: every story string the data carries is a string of circuit/script.json's cases (or the
        cast's name and tell, or the fiction line) — nothing typed; no cast role (author-facing: it spoils the mystery).
        Every option a pick offers is a string the case itself names; exactly one is right.
     3. THE BUILD RULES: Case 3 offers no Ask Kwame and no language choicesExclude bars; Case 2's items carry their authored
        Greek (the runner's Mira reads it, never the library's o); the cases are the script's own authored items.
     4. THE SOURCE: no Math.random, no text input (input / textarea / contenteditable), no storage of its own (the core's
        API only), no coin but addCoins('answer'), no streak or run, no corpus read.
     5. LAZY: boot-lazy registers circuitCases as one bundle (data, then code), in a group with the engine kit, after the
        core (DEPS) and on the idle queue; index.html names neither file (first load does not grow).
     6. PAY IS ABOVE CHANCE: for each case, a uniform guesser's expected coins under the pick rule (60% of a case's picks
        right first time, at least 3, before any pick pays) — printed, and never more than chance would give.
   Proved by breaking (15 Oct 2026; each a scratch root of symlinks with ONE file replaced, SB_ROOT=<scratch>):
     · one tap's line hand-edited in the data → "exactly what the tool writes" and "every story string … c1.taps[1]" fail;
     · Ask Kwame added to Case 3's hints in the data → "exactly what the tool writes" and "no Ask Kwame" fail;
     · Math.random in the clock, an <input> before the typed box, addCoins('contest') at Done → the three source checks;
     · circuitCases taken off the idle queue → the lazy check; circuit-cases.js put in index.html → the first-load check.
   Section 6 is the rule's own arithmetic (the browser's random bot is what guards the code: picks paid at once → it
   earns 2 in Case 3 and 2 in Case 4).
   Run: node tests/circuit-cases-data.cjs                                                                            */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; return !!b; };
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

/* ---- 1. generated */
console.log('\n1. Generated, never edited');
const tool = require(path.join(ROOT, 'tools', 'circuit', 'build-cases.cjs'));
const C = tool.corpus(), built = tool.build(C), bad = tool.check(built, C);
const cur = read('circuit-cases-data.js');
ok(cur === tool.text(built), 'circuit-cases-data.js is exactly what tools/circuit/build-cases.cjs writes from the script and the library');
ok(!bad.length, 'the tool refuses nothing (five cases, 8–12 items, three taps, a lateLine, one right option, kid-safe at 8)' + (bad.length ? ' — ' + bad.join(' · ') : ''));
const D = (() => { const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(cur, ctx); return ctx.window.SB_CIRCUIT_CASES_DATA; })();

/* ---- 2. every word from the script */
console.log('\n2. Every word from the script');
const S = JSON.parse(read('circuit/script.json'));
const strs = o => typeof o === 'string' ? [o] : Array.isArray(o) ? o.flatMap(strs) : o && typeof o === 'object' ? Object.values(o).flatMap(strs) : [];
const stray = [];
D.cases.forEach((c, k) => {
  const src = S.cases[k], pool = new Set(strs(src));
  ['title', 'place', 'lateLine', 'clock', 'impossible', 'safeLine', 'falseSolution', 'escalation', 'lastChill'].forEach(f => { if (c[f] != null && !pool.has(c[f])) stray.push(c.id + '.' + f); });
  c.taps.forEach((t, i) => { if (t !== src.taps[i]) stray.push(c.id + '.taps[' + i + ']'); });
  c.reveal.forEach((t, i) => { if (t !== src.reveal[i]) stray.push(c.id + '.reveal[' + i + ']'); });
  c.suspects.forEach((s, i) => { if (s.who !== src.suspects[i].who || s.secret !== src.suspects[i].secret) stray.push(c.id + '.suspects[' + i + ']'); });
  if (JSON.stringify(c.accusation) !== JSON.stringify(src.accusation)) stray.push(c.id + '.accusation');
  ['brief', 'rule', 'card'].forEach(f => { if (c.puzzle[f] && c.puzzle[f] !== src.puzzle[f]) stray.push(c.id + '.puzzle.' + f); });
  if (c.clue && c.clue !== src.clue.text) stray.push(c.id + '.clue');
  c.puzzle.items.forEach((x, i) => {
    const vals = []; ['shown', 'clue', 'why', 'greek', 'rule', 'said', 'word', 'lang', 'from', 'who'].forEach(f => { if (x[f]) vals.push([f, x[f]]); });
    x.ans.forEach(a => vals.push(['ans', a])); (x.parts || []).forEach(p => vals.push(['parts', p]));
    vals.forEach(([f, v]) => { if (!pool.has(v)) stray.push(c.id + ' item ' + (i + 1) + ' ' + f + ' "' + v + '"'); });
    /* a part's meaning options: meanings this case names (whole strings, or the meaning half of an authored "part: meaning") */
    if (x.opts) x.opts.forEach(o => { if (!pool.has(o) && !strs(src.puzzle.items).some(s => s.split(':').slice(1).join(':').trim() === o)) stray.push(c.id + ' item ' + (i + 1) + ' option "' + o + '"'); });
  });
});
Object.entries(D.cast).forEach(([k, x]) => { const s = S.cast[k]; if (!s || s.name !== x.name || (s.tell || '') !== x.tell) stray.push('cast.' + k); });
if (D.fiction !== S.fiction) stray.push('fiction');
ok(!stray.length, `every story string the data carries is circuit/script.json's own (${D.cases.length} cases, ${Object.keys(D.cast).length} cast names and tells)${stray.length ? ' — ' + stray.slice(0, 6).join(' · ') : ''}`);
const roles = Object.values(S.cast).map(c => c.role).filter(Boolean);
ok(!/"role"/.test(cur) && !roles.some(r => cur.indexOf(JSON.stringify(r).slice(1, -1)) >= 0), 'no cast role is in the data (author-facing: roles name V.)');
const oneRight = D.cases.flatMap(c => c.puzzle.items.filter(x => x.opts && x.opts.filter(o => x.ans.indexOf(o) >= 0).length !== 1).map(x => c.id + ':' + x.shown));
ok(!oneRight.length, 'every pick offers exactly one right option' + (oneRight.length ? ' — ' + oneRight.join(', ') : ''));

/* ---- 3. the build rules */
console.log('\n3. The script\'s build rules');
const B = id => S.build.find(b => b.id === id) || {};
const c3 = D.cases[2], ex = B('case-origins-authored').choicesExclude || {};
ok(c3.id === 'c3' && c3.hints.indexOf('samurai') < 0 && c3.hints.every(h => D.cast[h]), `Case 3 offers no Ask Kwame (build[id=case-scenes]): ${c3.hints.map(h => D.cast[h].name).join(', ')}`);
const exHit = c3.puzzle.items.flatMap(x => (ex[x.shown] || []).filter(l => x.opts.indexOf(l) >= 0).map(l => x.shown + ':' + l));
ok(Object.keys(ex).length >= 5 && !exHit.length, 'no Case 3 item offers a language choicesExclude bars (safari, cafe, ballet, piano, catamaran)' + (exHit.length ? ' — ' + exHit.join(', ') : ''));
const g2 = D.cases[1].puzzle.items.filter((x, i) => x.greek !== S.cases[1].puzzle.items[i].greek);
ok(D.cases[1].engine === 'gym/warmup' && !g2.length && D.cases[1].puzzle.items.every(x => x.k === 'spell'), 'Case 2 is typed spelling (the Warm-up, never a Word Lore quiz) and every item carries its authored Greek');
const same = D.cases.every((c, k) => c.puzzle.items.length === S.cases[k].puzzle.items.length);
ok(same, 'every case plays exactly the script\'s authored items (' + D.cases.map(c => c.puzzle.items.length).join(' · ') + ')');
const acts = D.cases.map(c => c.act);
ok(new Set(acts).size === acts.length && D.cases.every(c => c.trig && S.rounds.some(r => r.act === c.trig && r.n === c.after)), 'one case to a board, each triggered by its own round\'s hall (' + D.cases.map(c => c.id + ' after ' + c.trig).join(', ') + ')');

/* ---- 4. the source */
console.log('\n4. The runner\'s source');
const { scan } = require(path.join(ROOT, 'tests', 'lib', 'js-scan.cjs'));
const src = read('circuit-cases.js'), SC = scan(src);
const code = (re) => { const out = []; let m; re.lastIndex = 0; while ((m = re.exec(src))) if (!SC.inComment(m.index)) out.push(src.slice(0, m.index).split('\n').length); return out; };
ok(!code(/Math\.random/g).length, 'no Math.random anywhere in the runner (a reward, a grade, an option order — none of it chance)');
ok(!code(/<input|<textarea|contenteditable|createElement\(['"](input|textarea)/gi).length, 'no text input: letters come from the keyboard or the kit\'s keys (L7)');
ok(!code(/localStorage|sessionStorage|SB_STORE|indexedDB/g).length, 'no storage of its own: the season\'s state goes through the core (SB_CIRCUIT.caseUpdate), which keeps it behind store.js');
const pays = []; { const re = /addCoins\(([^)]*)\)/g; let m; while ((m = re.exec(src))) if (!SC.inComment(m.index)) pays.push(m[1].trim()); }
ok(pays.length >= 1 && pays.every(a => a === "'answer'") && !code(/payG\(|addCoins\(\s*['"](contest|stop|mastery)/g).length, `the only coin is addCoins('answer') (${pays.length} call${pays.length === 1 ? '' : 's'}) — nothing for finishing (L11)`);
ok(!code(/streak|in a row|combo/gi).length, 'no streak, run or combo');
ok(!code(/SB_DATA|corpusSlice|corpusBands|SB_FULL|SB_HARD|words-full/g).length, 'no corpus read: the items and their records ride the generated data (word-door holds the rest)');
ok(!/Case \d/.test(strs(D.cases.map(c => [c.title, c.taps, c.reveal, c.lastChill, c.escalation, c.impossible])).join(' ')), 'no on-screen string names "Case n"');

/* ---- 5. lazy */
console.log('\n5. Lazy, never first load');
const bl = read('boot-lazy.js');
const regM = /circuitCases:\s*\['circuit-cases-data\.js',\s*'circuit-cases\.js'\]/.test(bl);
const grpM = /circuitCases:\s*\[[^\]]*'saga2'[^\]]*'circuitCases'[^\]]*\]/.test(bl);
const depM = /circuitCases:\s*\['circuit'\]/.test(bl);
const idle = (bl.match(/var IDLE = \[([\s\S]*?)\];/) || [])[1] || '';
ok(regM && grpM && depM && /'circuitCases'/.test(idle), 'boot-lazy: circuitCases is one bundle (data, then code), its group carries the engine kit, it waits on the core (DEPS) and rides the idle queue');
const idx = read('index.html');
ok(!/circuit-cases/.test(idx), 'index.html names neither file: nothing of the cases is on a first screen');

/* ---- 6. pay above chance */
console.log('\n6. A guesser earns nothing');
const C_ = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; };
D.cases.forEach(c => {
  const picks = c.puzzle.items.filter(x => x.opts || (x.k === 'stmt' && x.ok));
  if (!picks.length) { console.log(`  ${c.id}: ${c.puzzle.items.length} typed items — a guess cannot type a word: 0`); return; }
  const gate = Math.max(3, Math.ceil(picks.length * 0.6));
  /* each pick's chance for a uniform guesser: 1/options (a true statement: one of its tokens or "All spelled right") */
  const ps = picks.map(x => x.opts ? 1 / x.opts.length : 1 / (x.said.split(/\s+/).length + 1));
  const p = ps.reduce((a, b) => a + b, 0) / ps.length, n = picks.length;
  let exp = 0; for (let k = gate; k <= n; k++) exp += k * C_(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  const chance = n * p;
  ok(exp < chance && exp < 0.1, `${c.id}: ${n} picks, nothing until ${gate} are right first time — a guesser's expected coins ${exp.toFixed(4)} (chance alone would give ${chance.toFixed(2)})`);
});

console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
