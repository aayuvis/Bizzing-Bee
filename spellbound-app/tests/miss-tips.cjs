/* THE MISS TIP NAMES THE MISTAKE, NOT THE WORD'S FAMILY (road to 4.5, P1.19 — rubric E5) — @check

   The audit typed "cyclx" for "cycle" in a drill and the miss panel's tip was "Greek origins… f→ph": true of
   the word, irrelevant to the mistake. SB_MISS_ERR (coach-rules.js) now reads the mistake itself — the typed
   letters against the word's — and names its TYPE, with a tip built from the child's own letters; app3's
   missWhy asks it first and falls back to the concept family only when no rule matches.
   This runs the real classifier (coach-rules.js in a window-shaped context) over:
     · a TABLE of real typed/target pairs, each with the type it must get — the audit's own miss, the classic
       misspellings, and pairs recorded in the library itself (a word's `m` field: its common misspelling);
       most of the table must be library-recorded pairs, so the table is the children's errors, not ours;
     · every one of the ~49,000 single-word misspellings the library records: the share a rule names (a floor),
       and invariants a tip must keep whatever the pair — a Greek tip only where the letters that differ are a
       Greek spelling (ph, ch, y), ie/ei only where both spellings hold one, a double only where a double is, a
       final-e tip only when the word ends in e and the attempt does not, no "undefined" in any tip, the same
       answer twice;
     · the wiring: missWhy asks SB_MISS_ERR before the family tip, and the panel carries the type (data-err).
   Proved by breaking (10 Oct 2026), each put back after: the final-e rule removed → the table fails on the audit's
   cyclx (it became "one letter changed"), befor and exampl; the endings allowed on a two-letter stem → "gient" for
   giant is called an -ant/-ent ending; the ie/ei branch returning a plain swap → recieve, wierd, beleive, cheif
   fail; missWhy's SB_MISS_ERR call taken out → the wiring check fails.
   Run: node tests/miss-tips.cjs                                                                              */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; return b; };
const src = fs.readFileSync(path.join(ROOT, 'coach-rules.js'), 'utf8');
if (/^\S{2000,}/m.test(src.slice(0, 4000))) { console.log('  --   minified tree: miss-tips reads source text, skipped'); process.exit(0); }
const W = { console }; W.window = W; vm.createContext(W);
vm.runInContext(src, W, { filename: 'coach-rules.js' });
const F = W.SB_MISS_ERR;
ok(typeof F === 'function', 'coach-rules.js defines SB_MISS_ERR');
const C = require(path.join(ROOT, 'tools', 'feed-corpus.cjs')).load();
const WORDS = new Set(C.DATA.map((r) => String(r.w).toLowerCase()));
const REC = new Map(); C.DATA.forEach((r) => { if (r && r.w && typeof r.m === 'string') REC.set(String(r.w).toLowerCase() + '|' + r.m.toLowerCase(), 1); });
const err = (t, w, hom) => F(t, w, { isWord: (k) => WORDS.has(k), hom: hom || [] });

/* ---- 1. the table: [typed, word, type, (tip must match), (family)] ---- */
const AUDIT = [['cyclx', 'cycle', 'final-e', /silent/, 'silent']];
const CLASSIC = [
  ['comitee', 'committee', 'dbl-miss', /mm and tt/, 'double'], ['nite', 'knight', 'silent', /k and gh/, 'silent'], ['recieve', 'receive', 'ieei', /after c/i, 'ieei'],
  ['seperate', 'separate', 'vowel', /sepArate/, 'schwa'], ['hopeing', 'hoping', 'drop-e', /hope \+ ing/, 'endings'], ['lovly', 'lovely', 'keep-e', /love \+ ly/, 'endings'],
  ['visable', 'visible', 'end', /-ible/, 'endings'], ['stasion', 'station', 'end', /-tion/, 'endings'], ['neccesary', 'necessary', 'dbl-shift', /ss and one c/, 'double'],
  ['stoped', 'stopped', 'dbl-suffix', /stop → stopped/, 'double'], ['mispell', 'misspell', 'dbl-prefix', /mis \+ spell/, 'double'], ['happyness', 'happiness', 'y-i', /happy \+ ness/, 'endings'],
  ['studing', 'studying', 'keep-y', /study \+ ing/, 'endings'], ['cycel', 'cycle', 'le-el', /-le/, 'endings'], ['wierd', 'weird', 'ieei', /ei/, 'ieei'],
  ['gient', 'giant', 'vowel-team', null, 'schwa'], ['jiant', 'giant', 'soft-g', /g says j/, null], ['skool', 'school', 'ch-k', /ch says k/, 'greek'],
  ['parnter', 'partner', 'swap', /“tn” came out as “nt”/, null], ['thum', 'thumb', 'silent', /The b in thumb/, 'silent'], ['lisen', 'listen', 'silent', /The t in listen/, 'silent']];
/* recorded in the library as the word's common misspelling (checked below) */
const LIBRARY = [
  ['beleive', 'believe', 'ieei', /i before e/], ['cheif', 'chief', 'ieei'], ['babys', 'babies', 'y-i', /baby → babies/], ['applyed', 'applied', 'y-i', /apply \+ ed/],
  ['absolutly', 'absolutely', 'keep-e', /absolute \+ ly/], ['managment', 'management', 'keep-e', /manage \+ ment/], ['boreing', 'boring', 'drop-e', /bore \+ ing/],
  ['begining', 'beginning', 'dbl-suffix', /begin → beginning/], ['bigest', 'biggest', 'dbl-suffix'], ['accross', 'across', 'dbl-extra', /Only one c/], ['honnest', 'honest', 'dbl-extra'],
  ['acording', 'according', 'dbl-miss', /cc/], ['colaborate', 'collaborate', 'dbl-miss', /ll/], ['tommorow', 'tomorrow', 'dbl-shift'], ['reccomend', 'recommend', 'dbl-shift', /mm and one c/],
  ['ilegal', 'illegal', 'dbl-prefix', /il \+ legal/], ['autum', 'autumn', 'silent', /The n in autumn/], ['anser', 'answer', 'silent', /The w in answer/], ['brite', 'bright', 'silent', /gh/],
  ['befor', 'before', 'final-e'], ['exampl', 'example', 'final-e', /-le/], ['graf', 'graph', 'ph', /ph says f/], ['fone', 'phone', 'ph'], ['kaos', 'chaos', 'ch-k'],
  ['sistems', 'systems', 'y-i-sound', /y stands for the i sound/], ['sensus', 'census', 'soft-c', /c says s/], ['budjet', 'budget', 'soft-g'], ['attak', 'attack', 'ck', /ck/],
  ['watever', 'whatever', 'wh'], ['capcher', 'capture', 'ture', /-ture/], ['helpfull', 'helpful', 'ful', /-ful/], ['actualy', 'actually', 'whole-ly', /actual \+ ly/],
  ['lable', 'label', 'le-el', /-el/], ['acter', 'actor', 'end', /-or/], ['abilty', 'ability', 'vowel-miss', /abilIty/], ['staied', 'stayed', 'keep-y', /stay \+ ed/],
  ['abourd', 'aboard', 'vowel-team', /“oa”/], ['adpot', 'adopt', 'swap'], ['precint', 'precinct', 'missing', /precinCt/], ['falkon', 'falcon', 'sound', /“c”, not “k”/],
  ['moderater', 'moderator', 'end', /-or/], ['objectionible', 'objectionable', 'end', /-able/], ['hesitence', 'hesitance', 'end', /-ance/]];
const recorded = LIBRARY.filter(([t, w]) => REC.has(w + '|' + t));
ok(recorded.length === LIBRARY.length, `every LIBRARY row is a misspelling the library itself records (${recorded.length}/${LIBRARY.length})` + (recorded.length === LIBRARY.length ? '' : ' — not recorded: ' + LIBRARY.filter((r) => !recorded.includes(r)).map((r) => r[0] + '→' + r[1]).join(' ')));
const rows = AUDIT.concat(CLASSIC, LIBRARY); const bad = [];
for (const [t, w, type, tip, fam] of rows) { const r = err(t, w);
  const got = r ? r.t : 'null'; const tipOk = !tip || (r && tip.test(r.tip)); const famOk = fam === undefined || (r && r.fam === fam);
  if (got !== type || !tipOk || !famOk) bad.push(`${t}→${w}: ${got}${r ? ' [' + r.fam + '] “' + r.tip.slice(0, 70) + '”' : ''} (want ${type}${fam !== undefined ? ' [' + fam + ']' : ''})`); }
ok(!bad.length, `${rows.length} real pairs each get their error type and a tip about THAT mistake` + (bad.length ? ' — ' + bad.join(' · ') : ''));
ok(LIBRARY.length >= rows.length / 2, `most of the table is the library's own recorded misspellings (${LIBRARY.length} of ${rows.length})`);
const a = err('cyclx', 'cycle');
ok(!!a && !/greek|ph/i.test(a.label + ' ' + a.tip), `the audit's miss: "cyclx" for "cycle" is a dropped final e, and nothing says Greek or ph — "${a && a.label}: ${a && a.tip}"`);
ok(err('there', 'their', ['there', "they're"]).t === 'hom', 'a real word that sounds the same is named as one (their / there)');
ok(err('aksept', 'accept') === null && err('', 'cycle') === null && err('cycle', 'cycle') === null, 'a mix of mistakes, an empty answer and a right one get no type — the family tip speaks');

/* ---- 2. every misspelling the library records ---- */
const pairs = []; C.DATA.forEach((r) => { if (r && r.w && typeof r.m === 'string' && /^[a-z]+$/.test(r.m) && /^[a-z]+$/.test(r.w) && r.m !== r.w) pairs.push([r.m, r.w]); });
const by = {}, viol = { greek: [], ie: [], dbl: [], fe: [], junk: [], same: [] }; let named = 0;
const dbl = (s) => /([b-df-hj-np-tv-z])\1/.test(s);
for (const [t, w] of pairs) { const r = err(t, w); if (!r) { by.null = (by.null || 0) + 1; continue; } named++; by[r.t] = (by[r.t] || 0) + 1;
  if (/Greek/.test(r.tip + r.label) && !/ph|ch|y/.test(w)) viol.greek.push(t + '→' + w);
  if (r.t === 'ieei' && !(/ie|ei/.test(t) && /ie|ei/.test(w))) viol.ie.push(t + '→' + w);
  if (/^dbl-/.test(r.t) && !(dbl(t) || dbl(w))) viol.dbl.push(t + '→' + w);
  if (r.t === 'final-e' && !(w.endsWith('e') && !t.endsWith('e'))) viol.fe.push(t + '→' + w);
  const said = r.tip + ' ' + r.label;   // the word itself may be "null" or "nullity": read the tip with the two spellings taken out
  if (/NaN|\[object/.test(said) || /undefined|null/.test(said.toLowerCase().split(w).join('').split(t).join(''))) viol.junk.push(t + '→' + w); }
for (const [t, w] of pairs.filter((_, i) => i % 97 === 0)) if (JSON.stringify(err(t, w)) !== JSON.stringify(err(t, w))) viol.same.push(t + '→' + w);
const share = named / pairs.length;
console.log('       types over ' + pairs.length + ' recorded misspellings: ' + Object.entries(by).sort((x, y) => y[1] - x[1]).map(([k, v]) => k + ' ' + v).join(' · '));
ok(pairs.length > 40000 && share >= 0.85, `a rule names ${(share * 100).toFixed(1)}% of the ${pairs.length} misspellings the library records (floor 85%; the rest fall back to the concept family)`);
const some = (x) => x.length ? ' — ' + x.slice(0, 8).join(' ') + (x.length > 8 ? ' …(' + x.length + ')' : '') : '';
ok(!viol.greek.length, 'a Greek tip only where the letters are a Greek spelling (ph, ch, y)' + some(viol.greek));
ok(!viol.ie.length, 'ie/ei only where both spellings hold an ie or ei' + some(viol.ie));
ok(!viol.dbl.length, 'a double-letter tip only where one of the spellings has a double' + some(viol.dbl));
ok(!viol.fe.length, 'a final-e tip only when the word ends in e and the attempt does not' + some(viol.fe));
ok(!viol.junk.length, 'no tip prints undefined, null or NaN' + some(viol.junk));
ok(!viol.same.length, 'the same pair gets the same answer twice (nothing drawn at random)' + some(viol.same));
ok(!/Math\.random/.test(src.slice(src.indexOf('window.SB_MISS_ERR'))), 'the classifier calls no Math.random');

/* ---- 3. the wiring ---- */
const app3 = fs.readFileSync(path.join(ROOT, 'app3.js'), 'utf8');
const mw = app3.slice(app3.indexOf('function missWhy('), app3.indexOf('function missFeedbackHTML('));
const iErr = mw.indexOf('SB_MISS_ERR('), iFam = mw.indexOf('const tip=(R&&R.check)');
ok(iErr > 0 && iFam > iErr && /if\(E\) return \{ k:E\.fam\|\|k\|\|'plain', err:E\.t, label:E\.label, tip:E\.tip/.test(mw), 'missWhy asks SB_MISS_ERR first and returns its label and tip; the family tip is the fallback');
ok(/class="sb-miss" data-why="\$\{escA\(why\.k\)\}" data-err="\$\{escA\(why\.err\|\|''\)\}"/.test(app3), 'the miss panel carries the error type (data-err) beside the family (data-why)');
const bl = fs.readFileSync(path.join(ROOT, 'boot-lazy.js'), 'utf8');
ok(/coachRules: 'coach-rules\.js'/.test(bl) && !/coach-rules\.js/.test(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')), 'the rulebook stays lazy: registered in boot-lazy, not a script tag on the first screen');
console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
