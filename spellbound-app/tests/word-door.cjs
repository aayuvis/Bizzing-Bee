/* T7 — NO CORPUS READ EXCEPT THROUGH nextWords; THE KID-SAFE LIST HOLDS (games spec §1.1–1.2, §8) — @check

   ONE DOOR. Every word a game asks for comes through nextWords() (app3.js), which is where kidSafe()
   and the 150-word window live. A game that reads the corpus itself — corpusSlice, corpusBands, a
   theme list, the 130k library (SB_FULL / SB_HARD / words-full / words-hard) or the served shards
   (SB_DATA.nsf) — skips both. This reads every shipped script with tests/lib/js-scan.cjs, finds each
   such read and the FUNCTION it sits in, and fails unless that function is one of the named non-game
   readers below (the door itself, search, the library loader, word lists, the Atlas…), each with its
   reason. A new game file is scanned the moment it lands; a new direct read anywhere needs a line
   here and a reason a person can check. Offenders are listed by file, line and function.

   THE LIST (kid-safe.js) as data, against the corpus loaded the way the page loads it:
     · the audit's two words, doping and stupid, fail for a nine-year-old and for a teenager
     · the v4 brief's list fails by headword (idiot · moron · cretin · retard · mongolism · negro ·
       negroid · gypsy · heathen) and its glosses fail by definition
     · 1,000 words a band (y 1–9), drawn the way corpusSlice draws them, pass kidSafe for a
       nine-year-old — and the list blocks under 2% of any band, so it guards without gutting
     · corpusBands and the picker both call it; the three gated themes carry minBand '11-15'
   Proved by breaking: (a) Magic Squares reading themeWords() again → the grep names magicCellWords;
   (b) 'stupid' taken off the insult list → the audit check fails; (c) corpusBands without
   kidSafeAll → the wiring check fails.
   Run: node tests/word-door.cjs                                                                  */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { scan, chain } = require('./lib/js-scan.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };

/* ---- 1. the grep: who reads the corpus, from which function ---- */
const DATA = /^(words-|voice-|trivia-q|trivia-words|trivia-data|trivia-icons|adv-|concepts-data|concept-scripts|lessons-data|story-data|figurative-data|nsf-|scripps-data|sounds-data|southasia-data|trail-data|trail-map-data|themes-data|theme-lore|tips-data|quotes|icons|avatars-art|avatar-|cover-art|game-art|kid-safe|word-|saga-art)/;
const DOOR = 'the door itself (games spec §1.1)';
const ALLOW = {
  'app3.js': { corpusBands: DOOR, corpusSlice: DOOR, nwIndex: DOOR, nwPool: DOOR, nwDaily: DOOR,
    mergeHard: 'loads the 130k library', fullWords: 'loads the 130k library', loadFullLibrary: 'loads the 130k library', openAdvanced: 'loads the library for the Advanced Pack',
    defaultStages: 'the Word Gym’s study lists', journeySorted: 'the Word Gym’s study lists', rawListWords: 'the Word Gym’s study lists',
    coachCatalog: 'the Word Gym’s list catalogue', catStatic: 'the Word Gym’s list catalogue', soundLists: 'the sound lists (catalogue)', ipaPool: 'the Sound Alphabet trainer', selectList: 'choosing a study list',
    themePool: 'Theme Journeys (themeDefs gates minBand)', themeWords: 'Theme Journeys (themeDefs gates minBand)', themeStat: 'Theme Journeys', viewThemeDetail: 'Theme Journeys',
    finderResults: 'search looks a word up, never serves one to spell', suggestWords: 'search suggestions look a word up', wordDB: 'search and the word card look a word up', viewFinder: 'the Word Finder', b2Idx: 'the List Builder’s index',
    wohPool: 'Home’s word of the hour (wohFit)', vocDeckWords: 'the Vocabulary section’s decks' },
  'advanced.js': { advActivate: 'loads the library when the pack switches on', hardPool: 'the Advanced Pack’s Ultra road (a course, not a Play-tab game)' },
  'trail.js': { widx: 'the Atlas’s word index (lookup by key)' },
  'family-shell.js': { sampleHousehold: 'the ?demo household' },
  'saga2.js': { wordHive: 'a retired engine’s dictionary for checking found words (not on the Play tab)' },
};
const TOK = /\b(corpusSlice|corpusBands|themeWords|fullWords)\(|\bSB_FULL\b|\bSB_HARD\b|words-full|words-hard|\bSB_DATA\s*(?:&&\s*SB_DATA)?\.nsf/g;
const files = fs.readdirSync(ROOT).filter(f => /\.js$/.test(f) && !DATA.test(f));
const bad = []; let reads = 0;
for (const f of files) {
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8'); if (!TOK.test(src)) continue; TOK.lastIndex = 0;
  const S = scan(src); let m;
  while ((m = TOK.exec(src))) {
    if (S.inComment(m.index)) continue;
    if (/function\s+$/.test(src.slice(Math.max(0, m.index - 12), m.index))) continue;   // a definition, not a read
    reads++;
    const names = chain(S, m.index).map(x => x.name).filter(x => x !== '(anon)');
    const allow = ALLOW[f] || {};
    if (!names.some(nm => allow[nm])) bad.push(`${f}:${src.slice(0, m.index).split('\n').length} ${names[0] || '(top level)'}() reads ${m[0].replace(/\($/, '')}`);
  }
}
ok(files.length > 20 && reads > 40, `read ${files.length} shipped scripts: ${reads} direct corpus reads found`);
ok(!bad.length, 'no game reads the corpus except through nextWords' + (bad.length ? ' — ' + bad.join(' · ') : ''));
const reasons = Object.values(ALLOW).flatMap(o => Object.values(o));
ok(reasons.every(r => r && r.length > 8), `each of the ${reasons.length} non-game readers carries its reason`);

/* ---- 2. the wiring ---- */
const app3 = fs.readFileSync(path.join(ROOT, 'app3.js'), 'utf8');
const body = name => { const S = scan(app3); const i = app3.indexOf('function ' + name + '('); const f = S.fns.find(x => x.open > i && x.open < i + 200); return f ? app3.slice(f.open, f.close) : ''; };
ok(/kidSafeAll\(w\)/.test(body('corpusBands')), 'corpusBands keeps only kid-safe words (the every-age half, cached for all)');
ok(/kidSafe\(w,c\)/.test(app3.slice(app3.indexOf('function nwFilters('), app3.indexOf('function nwDedupe('))), 'the picker asks kidSafe for THIS child (the age half)');
ok(/window\.nextWords=nextWords/.test(app3) && /window\.kidSafe=kidSafe/.test(app3) && /function gameWordsD\(opts\)\{[\s\S]{0,120}nextWords\.pool/.test(app3), 'nextWords and kidSafe are on window, and gameWordsD is the door’s alias');
const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
ok(/<script defer src="kid-safe\.js\?v=[^"]+"><\/script>/.test(idx) && idx.indexOf('src="kid-safe.js') < idx.indexOf('src="app3.js') && idx.indexOf('src="words-patch.js') < idx.indexOf('src="kid-safe.js'), 'kid-safe.js loads after words-patch.js and before app3.js');

/* ---- 3. the list, against the corpus as the page loads it ---- */
const C = require(path.join(ROOT, 'tools', 'feed-corpus.cjs')).load(); const W = C.win;
const lit = (start, end) => { const i = app3.indexOf(start); return app3.slice(i + start.length, app3.indexOf(end, i)); };
W.SB_UNSAFE_RE = vm.runInNewContext('(' + lit('const SB_UNSAFE_RE=', ';\n') + ')');
W.SB_CORE_STRIKE = vm.runInNewContext('new Set([' + lit('const CORE_STRIKE = new Set([', ']);') + '])');
vm.runInContext(fs.readFileSync(path.join(ROOT, 'kid-safe.js'), 'utf8'), vm.createContext(W), { filename: 'kid-safe.js' });
const K = W.SB_KID_SAFE;
ok(K && typeof K.check === 'function' && W.SB_CORE_STRIKE.size > 500, `kid-safe.js loads beside the page’s own lists (${W.SB_CORE_STRIKE.size} struck words)`);
const D = C.DATA; const by = Object.create(null);   /* 'constructor' is a library word */ D.forEach(r => { if (r && r.w && !by[r.w]) by[r.w] = r; });
const rec = w => by[w] || { w, d: '' };
ok(['doping', 'stupid'].every(w => by[w] && !K.check(rec(w), 8) && !K.check(rec(w), 12)), 'the audit’s words: doping and stupid are in the library and fail kidSafe at 9 and at 12 — ' + ['doping', 'stupid'].map(w => w + ' (' + K.why(rec(w), 8) + ')').join(', '));
const V4 = ['idiot', 'moron', 'cretin', 'retard', 'mongolism', 'negro', 'negroid', 'gypsy', 'heathen'];
const v4left = V4.filter(w => K.check(rec(w), 14));
ok(!v4left.length, 'the v4 brief’s list fails by headword at every age' + (v4left.length ? ' — passes: ' + v4left.join(', ') : ''));
const glosses = ['an abnormal absorption with the self', 'a person of subnormal intelligence', 'an offensive term for a person of mixed race', 'take drugs to improve one’s athletic performance'];
ok(glosses.every(d => !K.check({ w: 'zzword', d }, 14)), 'and its glosses fail by definition, whatever the headword');
ok(K.check(rec('meadow'), 8) && K.check(rec('chocolate'), 8) && K.check(rec('constructor') , 8) && K.check(rec('heroine'), 8), 'ordinary words pass (meadow, chocolate — "usually drunk hot" —, constructor, heroine)');
ok(!K.check(rec('whisky'), 8) && K.check(rec('whisky'), 12), 'alcohol is held back under eleven only (minBand 11-15)');
const bands = {}; for (const r of D) { if (!r || !r.w || !(r.d && r.d.length > 4) || !/^[a-z]+$/i.test(r.w)) continue; const y = Math.max(1, Math.min(9, r.y || 3)); (bands[y] = bands[y] || []).push(r); }
const rows = [];
for (let y = 1; y <= 9; y++) { const all = bands[y] || []; const kept = all.filter(r => K.checkAll(r));
  const step = kept.length / Math.min(1000, kept.length); const drawn = []; for (let i = 0; i < Math.min(1000, kept.length); i++) drawn.push(kept[Math.floor(i * step)]);
  rows.push({ y, all: all.length, blocked: all.length - kept.length, drawn: drawn.length, fail: drawn.filter(r => !K.check(r, 8)).length }); }
ok(rows.every(r => r.drawn >= Math.min(1000, r.all - r.blocked) && r.drawn >= 300), '1,000 words a band (or the whole band) drawn as corpusSlice draws them: ' + rows.map(r => 'y' + r.y + ' ' + r.drawn).join(' · '));
ok(rows.every(r => r.fail <= r.drawn * 0.01), 'and at most 1% of a draw falls to the under-eleven rule, which the picker then removes: ' + rows.map(r => r.fail).join('/'));
ok(rows.every(r => r.blocked <= r.all * 0.02), 'the list blocks under 2% of any band — it guards without gutting the library: ' + rows.map(r => (100 * r.blocked / r.all).toFixed(2) + '%').join(' · '));
const T = fs.readFileSync(path.join(ROOT, 'themes-data.js'), 'utf8');
ok(['disease', 'pharmacy', 'war'].every(id => new RegExp("\\{ id:'" + id + "', minBand:'11-15'").test(T)), 'Diseases & Symptoms, Drugs & Pharmacy and War & Weaponry carry minBand ‘11-15’');
console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
