/* WORD FORGE — the table and its rules (games spec §5.1: WF1, WF2, WF4, "every row has a source";
   the signed-off flag). @check

   The morpheme table must come from a CITED etymological source, never typed from memory, and the
   owner signs it off (forge-data.js `signedOff`; forge-review/index.html is the sheet). This holds:
     SOURCES  every row links its Online Etymology Dictionary entry; every part cites where its
              meaning is stated — a concepts-data chapter that really has that title, or the entry's
              own gloss; every root quotes the entry text that names it, and that text is in the
              evidence file (forge-review/evidence.json) the build was made from.
     WF2      the parts rebuild the word exactly, and a joint that changes spelling (e-drop, y→i)
              says so; the Champ boundaries cut the word back into its parts.
     WF4      every wrong tile the game can deal, in every slot, at Medium and Hard, gets a reason
              that names the part placed AND the part needed — and a family decoy quotes the rule
              (-able/-ible, assimilation, -or after a Latin root, the root's other form, the Latin
              or Greek form of the word).
     WF1      a random placer solves under 5% of Medium forges, and over 300 seeded rounds it earns
              0 coins (forge-core's roundPay: Medium pays only at half a round; Easy never — tiles
              alone); a random typist spells nothing at Hard/Champ. A perfect player does get paid,
              so the zero is the gate and not a dead pay path.
     T5       no Math.random in the game or its rules; the mastery coin has one call site.
   The screen half (the card and #/forge stay shut while unsigned; T14/T15; keys and touch) is
   tests/forge-game.cjs.
   Run: node tests/forge-data.cjs                                                               */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const src = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const MIN = /^\s*\/\*/.test(src('forge-core.js')) ? false : true;   // a minified deploy tree drops the comments

const win = {}; win.window = win;
vm.runInNewContext(src('forge-data.js'), win, { filename: 'forge-data.js' });
vm.runInNewContext(src('concepts-data.js'), win, { filename: 'concepts-data.js' });
const F = win.SB_FORGE, CH = win.SB_CONCEPTS.chapters;
const coreWin = {}; coreWin.window = coreWin;
vm.runInNewContext(src('forge-core.js'), coreWin, { filename: 'forge-core.js' });
const C = coreWin.SB_FORGE_CORE;
const rows = F.rows;

/* ------------------------------------------------------------------ the flag */
console.log('\n1. Sign-off');
ok(typeof F.signedOff === 'boolean', `signedOff is a real flag (${F.signedOff}) — the owner's line; the screen test holds the card shut while it is false`);
ok(F.sources && /etymonline\.com/.test(F.sources.etymology) && /concepts-data/.test(F.sources.meanings), 'the table names its sources (the etymological dictionary and the app chapters)');

/* ------------------------------------------------------------------ sources */
console.log('\n2. Every row has a source');
ok(rows.length >= 140, `the table holds ${rows.length} sourced rows (ratchet: 140; spec slice 300 — what the sources could support is in forge-review/dropped.json)`);
const rootIds = new Set(F.roots.map(r => r.id));
let noEntry = [], badPart = [], badCite = [], badRoot = [];
const citeOk = t => { const m = /chapter (\d+) “(.+?)”/.exec(t); return !!(m && CH[+m[1]] && CH[+m[1]].title === m[2]); };
F.roots.forEach(r => { if (!citeOk(r.cite)) badCite.push('root ' + r.id); });
for (const r of rows) {
  if (!r.src || r.src.entry !== 'https://www.etymonline.com/word/' + encodeURIComponent(r.w)) noEntry.push(r.w);
  if (!r.src || !Array.isArray(r.src.parts) || r.src.parts.length !== r.parts.length) { badPart.push(r.w); continue; }
  r.src.parts.forEach((c, k) => {
    if (c.m >= 0) { if (!citeOk(F.cites[c.m])) badCite.push(r.w + ' ' + c.part); }
    else if (!(r.kinds[k] === 'pre' && c.said)) badCite.push(r.w + ' ' + c.part + ' (no chapter and no quoted gloss)');
    if (r.kinds[k] === 'root' && !c.said) badPart.push(r.w + ' ' + c.part + ' (root quotes nothing)');
  });
  if (!r.roots.length || !r.roots.every(id => rootIds.has(id))) badRoot.push(r.w);
}
ok(!noEntry.length, `every row links its own etymology entry (${noEntry.slice(0, 5).join(', ') || 'all ' + rows.length})`);
ok(!badPart.length, `every part of every row carries a citation, and every root quotes the entry (${badPart.slice(0, 5).join(', ') || 'none missing'})`);
ok(!badCite.length, `every meaning cite names a real concepts-data chapter by its exact title (${badCite.slice(0, 5).join(' | ') || 'all resolve'})`);
ok(!badRoot.length, `every row's roots are on the root list (${badRoot.slice(0, 5).join(', ') || 'yes'})`);
const EVP = path.join(ROOT, 'forge-review', 'evidence.json');
if (fs.existsSync(EVP)) {
  const EV = JSON.parse(fs.readFileSync(EVP, 'utf8')).words, missing = [];
  const textOf = w => { const e = EV[w]; return e ? [e.ex].concat((e.hops || []).map(h => h.ex)).join(' ') : ''; };
  for (const r of rows) {
    if (!EV[r.w]) { missing.push(r.w + ' (no evidence)'); continue; }
    for (const c of r.src.parts) {
      if (!c.said) continue;
      const via = /glossed in ([a-z]+):/.exec(c.said);
      const terms = [...c.said.matchAll(/\*([^*]+)\*/g)].map(m => m[1]);
      const hay = textOf(r.w) + (via ? ' ' + textOf(via[1]) : '');
      terms.forEach(t => { if (hay.indexOf(',' + t + ',') < 0) missing.push(r.w + ': *' + t + '*'); });
    }
  }
  ok(!missing.length, `every quoted term is in the cited text the build kept (${missing.slice(0, 5).join(' | ') || 'all found'})`);
} else console.log('  SKIP evidence cross-check: forge-review/ is not in this tree (it never deploys)');

/* ------------------------------------------------------------------ WF2 */
console.log('\n3. WF2 — the parts rebuild the word, changes shown');
const notJoin = rows.filter(r => C.join(r.parts, r.kinds).word !== r.w).map(r => r.w);
ok(!notJoin.length, `all ${rows.length} rows join back to their word exactly (${notJoin.slice(0, 5).join(', ') || 'none off'})`);
const e1 = C.join(['believe', 'able'], ['root', 'suf']), y1 = C.join(['happy', 'ness'], ['root', 'suf']), p1 = C.join(['pre', 'empt'], ['pre', 'root']);
ok(e1.word === 'believable' && e1.changes.length === 1 && e1.changes[0].rule === 'e-drop' && /drops its e/.test(C.changeNote(e1.changes[0])), `e-drop: believe + able = ${e1.word}, and the note says "${C.changeNote(e1.changes[0] || {})}"`);
ok(y1.word === 'happiness' && y1.changes[0] && y1.changes[0].rule === 'y-i' && /y to i/.test(C.changeNote(y1.changes[0])), `y→i: happy + ness = ${y1.word}, "${C.changeNote(y1.changes[0] || {})}"`);
ok(p1.word === 'preempt' && !p1.changes.length, 'a prefix never changes at its joint (pre + empt stays preempt)');
const withCh = rows.filter(r => r.changes && r.changes.length);
ok(withCh.every(r => r.changes.every(c => C.changeNote(c))) && withCh.every(r => JSON.stringify(C.join(r.parts, r.kinds).changes) === JSON.stringify(r.changes)),
  `the table's rows with a spelling change carry it for the screen (${withCh.map(r => r.w).join(', ') || 'none in this slice'})`);
const badCut = rows.filter(r => { const b = [0].concat(C.boundaries(r)).concat([r.w.length]); const j = C.join(r.parts, r.kinds);
  return r.parts.some((p, k) => { const ch = j.changes.find(c => c.at === k); return r.w.slice(b[k], b[k + 1]) !== (ch ? ch.to : p); }); }).map(r => r.w);
ok(!badCut.length, `Champ's boundaries cut every word back into its parts (${badCut.slice(0, 5).join(', ') || 'all'})`);

/* ------------------------------------------------------------------ WF4 */
console.log('\n4. WF4 — every wrong forge gives a matching reason');
const RULE = { able: /-ible|-able/, assim: /^Before \*/, or: /Latin root/, form: /form/, ety: null };
let dealt = 0, bad = [], famBad = [], familyDeals = 0;
for (const r of rows) {
  for (const lv of ['medium', 'hard']) {
    for (let seed = 1; seed <= 3; seed++) {
      const rack = C.rack(r, lv, rows, seed);
      for (const slot of C.openSlots(r, lv)) {
        for (const t of rack) {
          if (t.s === r.parts[slot]) continue;
          dealt++;
          const why = C.reason(r, slot, t);
          const named = s => new RegExp('\\*-?' + s + '-?\\*').test(why);
          if (!why || !named(t.s) || why.indexOf(r.parts[slot]) < 0) { bad.push(r.w + '[' + slot + '] ' + t.s + ': ' + why); continue; }
          if ((r.confusable[slot] || []).indexOf(t.s) >= 0) {
            familyDeals++;
            const rule = r.rules[slot], re = RULE[rule];
            if (!rule || (re && !re.test(why)) || (rule === 'ety' && why.indexOf(r.etym) < 0)) famBad.push(r.w + '[' + slot + '] ' + t.s + ' (' + rule + '): ' + why);
          }
        }
      }
    }
  }
  /* grade(): any placement with a wrong slot names a reason for each wrong slot */
  const swapped = r.parts.slice().reverse(), g = C.grade(r, swapped);
  if (r.parts.length > 1 && swapped.join() !== r.parts.join() && (g.ok || g.wrong.some(x => !x.reason))) bad.push(r.w + ' (grade)');
}
ok(dealt > 1000 && !bad.length, `${dealt} wrong tiles dealt across the table at Medium and Hard: each reason names the part placed and the part needed (${bad.slice(0, 3).join(' | ') || 'all do'})`);
ok(familyDeals > 50 && !famBad.length, `${familyDeals} family decoys: each reason quotes its rule (${famBad.slice(0, 3).join(' | ') || 'all do'})`);
const inc = rows.find(r => r.w === 'incredible');
if (inc) { const why = C.reason(inc, 2, { s: 'able', m: 'capable of being', k: 'suf' });
  ok(/cred\* is a Latin root that cannot stand alone/.test(why) && /-ible/.test(why), `the spec's own example: incredible with -able → "${why}"`); }

/* ------------------------------------------------------------------ WF1 */
console.log('\n5. WF1 — a random placer solves under 5% at Medium and earns 0');
const rnd = C.rng(20261004);
let trials = 0, solved = 0, solved2 = 0;
const randomForge = (r, rack, filled) => {
  const slots = filled ? filled.slice() : r.parts.map(() => null);
  const free = rack.filter(t => !slots.some(s => s && s.id === t.id));
  for (let k = 0; k < slots.length; k++) if (!slots[k]) { const i = Math.floor(rnd() * free.length); slots[k] = free.splice(i, 1)[0]; }
  return slots;
};
for (const r of rows) for (let s = 0; s < 40; s++) {
  const rack = C.rack(r, 'medium', rows, s).map((t, id) => Object.assign({ id }, t));
  const p1 = randomForge(r, rack), g1 = C.grade(r, p1);
  trials++; if (g1.ok) solved++;
  else { const keep = p1.map((t, k) => g1.wrong.some(x => x.slot === k) ? null : t); if (C.grade(r, randomForge(r, rack, keep)).ok) solved2++; }
}
const rate = solved / trials, rate2 = (solved + solved2) / trials;
ok(rate < 0.05, `random placement solves ${(rate * 100).toFixed(2)}% of Medium forges on the first try (< 5%; with the second try, ${(rate2 * 100).toFixed(2)}% — which never pays)`);
let coins = 0, perfect = 0;
for (let round = 0; round < 300; round++) {
  let rights = 0;
  for (let w = 0; w < 8; w++) { const r = rows[Math.floor(rnd() * rows.length)]; const rack = C.rack(r, 'medium', rows, round).map((t, id) => Object.assign({ id }, t)); if (C.grade(r, randomForge(r, rack)).ok) rights++; }
  coins += C.roundPay('medium', rights, 8) + (C.payNow('medium') ? rights : 0);
  coins += C.roundPay('easy', 8, 8) + (C.payNow('easy') ? 8 : 0);   // Easy: even a perfect round of tiles alone pays nothing
}
ok(coins === 0, `over 300 seeded rounds the random placer earns ${coins} coins (Easy pays nothing; Medium only at half a round)`);
perfect = C.roundPay('medium', 8, 8);
ok(perfect === 8 && C.payNow('hard') && C.payNow('champ'), `a perfect Medium round is paid ${perfect}, and Hard/Champ pay a spelt word at once — the zero above is the gate, not a dead path`);
let typed = 0; for (let i = 0; i < 2000; i++) { const r = rows[i % rows.length]; let t = ''; for (let k = 0; k < r.w.length; k++) t += String.fromCharCode(97 + Math.floor(rnd() * 26)); if (t === r.w) typed++; }
ok(typed === 0, `a random typist spells ${typed} of 2000 words at Hard/Champ`);

/* ------------------------------------------------------------------ T5 / one door for coins */
console.log('\n6. No chance in a reward path; one mastery door');
/* code only: a comment that SAYS "never Math.random" is not a call */
const code = t => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"\\])\/\/.*$/gm, '$1');
const game = code(src('forge.js')), core = code(src('forge-core.js'));
ok(!/Math\.random/.test(game) && !/Math\.random/.test(core), 'no Math.random in forge.js or forge-core.js');
const mast = game.match(/addCoins\(\s*'mastery'\s*\)/g) || [], other = game.match(/addCoins\(\s*'(?!mastery')/g) || [];
ok(mast.length === 1 && !other.length && /function record\(r\)[\s\S]{0,700}addCoins\(\s*'mastery'\s*\)/.test(game), `the mastery coin has exactly one call, inside the later-day record (${mast.length} found, ${other.length} other addCoins)`);
ok((game.match(/payG\(G\)/g) || []).length === 2 && /payNow\(G\.lv\)/.test(game) && /roundPay\(G\.lv, G\.right/.test(game), 'words are paid only through payG, behind forge-core\'s payNow / roundPay');

console.log(fails ? `\n${fails} FAILED` : '\nall passed');
process.exit(fails ? 1 : 0);
