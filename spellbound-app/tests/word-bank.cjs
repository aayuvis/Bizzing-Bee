// The championship shard and the 130,000-word claim.
//
// Two things this guards that are easy to get wrong. First, every record in
// words-hard.js must obey the house rules the rest of the bank obeys: the
// definition must never leak the spelling, the sentence must actually use the
// word, and both must be safe for a ten-year-old. Second — and this is the one
// that would be a real misrepresentation — the shard ships NO recorded voice
// clips, so the LIBRARY may claim 130,000 while the VOICE claims must stay at
// the 128,000 that are genuinely recorded.
const fs = require('fs');
const SRC = process.env.SRC || __dirname + '/..';
let fails = 0;
const ok = (b, msg) => { console.log((b ? '  OK   ' : '  FAIL ') + msg); if (!b) fails++; };

const CORE = 128197;   // SB_FULL as generated, before the shard

/* The hazard this suite exists to prevent is not a missing file — it is a
   CLAIM without the words behind it. So the two states are checked as a pair:
   either the shard is here and the surfaces may say 130,000, or the shard is
   not here and nothing may say it. Claiming it without shipping it is the
   failure, and it fails loudly below. */
const SHARD = SRC + '/words-hard.js';
const app3pre = fs.readFileSync(SRC + '/app3.js', 'utf8');
const claims130 = /130,000-word library|find any of 130,000 words/.test(app3pre);
if (!fs.existsSync(SHARD)) {
  ok(!claims130, 'no surface claims 130,000 words while the championship shard is unbuilt');
  console.log('  ..    the shard is not built yet — the 130,000 checks wait for it');
  console.log(fails ? '\n' + fails + ' FAILED' : '\nall good');
  process.exit(fails ? 1 : 0);
}

// ---- the shard parses and is big enough to justify the claim ----
const g = {};
(function () { new Function('window', fs.readFileSync(SHARD, 'utf8'))(g); })();
const H = g.SB_HARD;
ok(Array.isArray(H), 'words-hard.js defines SB_HARD as an array');
ok(H.length >= 130000 - CORE, 'the shard carries enough to reach 130,000 — ' + H.length
  + ' new words on top of ' + CORE + ' = ' + (CORE + H.length));

// ---- every record obeys the house rules ----
const BAD = /\b(kill|dead|death|blood|corpse|sex|drug|drunk|suicide|rape|weapon|murder|slave|naked)\b/i;
let leaks = 0, unused = 0, unsafe = 0, short = 0, malformed = 0;
const seen = new Set(); let dupes = 0;
for (const r of H) {
  if (!r || !r.w || !r.d || !r.s) { malformed++; continue; }
  const w = String(r.w).toLowerCase();
  if (seen.has(w)) dupes++; seen.add(w);
  if (w.length < 7) short++;
  const stem = w.slice(0, Math.max(5, w.length - 3));
  if (String(r.d).toLowerCase().includes(stem)) leaks++;
  if (!String(r.s).toLowerCase().includes(w)) unused++;
  if (BAD.test(r.d) || BAD.test(r.s)) unsafe++;
}
ok(malformed === 0, 'every record has a word, a definition and a sentence');
ok(leaks === 0, 'no definition leaks its own spelling (' + leaks + ')');
ok(unused === 0, 'every sentence actually uses its word (' + unused + ')');
ok(unsafe === 0, 'every definition and sentence is safe for a child (' + unsafe + ')');
ok(short === 0, 'every word is a genuinely long one, 7 letters or more (' + short + ')');
ok(dupes === 0, 'no word appears twice inside the shard (' + dupes + ')');

// ---- and none of them is already in the core (that would inflate nothing) ----
// read from the shipped core rather than a scratch file, so this guard still
// means something on a fresh clone
const core = {};
(function () { new Function('window', fs.readFileSync(SRC + '/words-full.js', 'utf8'))(core); })();
const coreArr = typeof core.SB_FULL === 'string' ? JSON.parse(core.SB_FULL) : core.SB_FULL;
ok(Array.isArray(coreArr) && coreArr.length === CORE,
  'the core library is the ' + CORE + ' words this claim was computed from (got ' + coreArr.length + ')');
const have = new Set(coreArr.map(r => String(r && r.w || '').toLowerCase()));
let already = 0;
for (const r of H) if (have.has(String(r.w).toLowerCase())) already++;
ok(already === 0, 'not one of them was already in the core library (' + already + ')');
ok(coreArr.length + H.length >= 130000,
  'core + shard clears 130,000 — ' + (coreArr.length + H.length) + ' words in the library');

// ---- no word in the shard is a plural of another word in it ----
// A fuzzy near-miss check was tried first and rejected: it flags genuinely
// distinct pairs (anemograph/anemography, candombe/candomble) as loudly as it
// flags mistakes, so it cannot be a gate. Singular-and-its-own-plural is
// objective, and it is the redundancy that actually occurred.
const shardSet = new Set(H.map(r => String(r.w).toLowerCase()));
const infl = [];
for (const w of shardSet)
  for (const suf of ['s', 'es'])
    if (shardSet.has(w + suf)) infl.push(w + '/' + w + suf);
ok(infl.length === 0, 'no shard word is just the plural of another'
  + (infl.length ? ' — ' + infl.slice(0, 5).join(', ') : ''));

// ---- nor merely the plural of a word the core already has ----
// Three shard words end in s without being plurals of the core word they
// resemble: magnetohydrodynamics and toponymics are field names standing beside
// adjectives, and ephemerides is the plural of ephemeris while the core's
// ephemerid is an insect. They are named here so the rule stays strict.
const NOT_PLURALS = new Set(['magnetohydrodynamics', 'toponymics', 'ephemerides',
  'synergetics', 'hydroponics']);   // field names standing beside adjectives
const echoes = [];
for (const w of shardSet) {
  if (NOT_PLURALS.has(w)) continue;
  for (const suf of ['s', 'es'])
    if (w.endsWith(suf) && have.has(w.slice(0, -suf.length))) { echoes.push(w); break; }
}
ok(echoes.length === 0, 'no shard word is merely the plural of a core word'
  + (echoes.length ? ' — ' + echoes.slice(0, 6).join(', ') : ''));

/* A fuzzy "one letter from a core headword" gate was tried and removed. Greek
   and Latin morphology puts real words one letter apart constantly — chondrite
   and achondrite, stomatology and somatology — so it flags good words as loudly
   as bad ones. The real defence against a coined or misspelt entry is the
   verification pass that produced this file: every word no lexicon recognised
   was checked against a named dictionary, and 62 were struck out, including
   crystalluminescence, a misspelling of crystalloluminescence in the same
   batch. That is a process guarantee, not something a regex can re-derive. */

// ---- no slur reaches a child ----
// SB_UNSAFE_RE is a list of specific strings and caught 22 of the 210 entries
// whose own definition calls them an offensive term; boche, kraut, jap, mick,
// paddy, fag, dyke, redskin, coolie and 179 others were reachable as spelling
// words. The filter now matches what the data says ABOUT ITSELF.
ok(/SLUR_DEF/.test(app3pre) && /fixCore/.test(app3pre),
  'the library filters entries their own definitions call an offensive term');
/* Read the REAL pattern and the REAL tables out of app3.js rather than copying
   them here. A copy is what let the plural bug live: the suite asserted a
   pattern it had been given, not the one that ships. */
const SLUR_DEF = new RegExp(/const SLUR_DEF = \/(.+?)\/i;/.exec(app3pre)[1], 'i');
const tbl = (from, to) => app3pre.slice(app3pre.indexOf(from), app3pre.indexOf(to));
const STRIKE = new Set(tbl('const CORE_STRIKE', '/* ---- definitions').match(/'([a-z]+)'/g).map(s => s.slice(1, -1)));
const OKSET = new Set(tbl('const SLUR_OK', 'function fixCore').match(/'([a-z]+)'/g).map(s => s.slice(1, -1)));
const FIXD = {};
for (const m of tbl('const CORE_FIX', '/* ---- slurs').matchAll(/^ {2}([a-z]+): '([^']+)'/gm)) FIXD[m[1]] = m[2];

let slurs = 0;
for (const r of coreArr) if (r && r.d && SLUR_DEF.test(r.d)) slurs++;
ok(slurs > 0, 'the raw core still contains them (' + slurs + ') — so the filter is doing real work');

/* THE PLURAL BUG. The first pattern required a singular noun after the marker
   ("offensive term"), and the generated glosses are written in the plural
   ("offensive terms for", "(slang) offensive names for"). It let motherfucker,
   assholes, honky, whitey and Zionazi through. Assert the plural directly, so
   tightening the noun list back to singulars fails here. */
for (const t of ['(slang) offensive names for a White man', 'offensive terms for a person',
                 'derogatory terms for women', 'pejorative terms for an insane asylum'])
  ok(SLUR_DEF.test(t), 'the pattern reads the PLURAL gloss: "' + t.slice(0, 34) + '…"');

// ---- run the real filter and check both directions on real records ----
const live = new Set();
for (const r of coreArr) {
  if (!r || !r.w) continue;
  const k = String(r.w).toLowerCase();
  if (STRIKE.has(k)) continue;
  const d = Object.prototype.hasOwnProperty.call(FIXD, k) ? FIXD[k] : r.d;
  if (d && !OKSET.has(k) && SLUR_DEF.test(d)) continue;
  live.add(k);
}
/* Every one of these has a definition that admits what the word is, so the
   pattern is what removes them. Five of them — motherfucker, assholes, honky,
   whitey, Zionazi — were reachable until the plural was allowed above. */
const mustGo = ['niggers', 'motherfucker', 'assholes', 'honky', 'honkies', 'whitey',
  'punani', 'slutbag', 'jap', 'kraut', 'chink', 'coolie', 'redskin', 'popery',
  'niggerish', 'niggerism', 'niggerlips', 'boche', 'dyke', 'fag', 'mick', 'darkie'];
const reach = mustGo.filter(w => live.has(w));
ok(reach.length === 0, 'no slur whose definition admits it reaches a child'
  + (reach.length ? ' — REACHABLE: ' + reach.join(', ') : ''));

/* A SECOND CLASS EXISTS AND IS NOT YET GATED. 41 slurs and obscenities carry a
   neutral or invented gloss — "squaw: an American Indian woman", "cocklicker: a
   person who tends cockle shells", "encunt: enclosed within a hollow" — so no
   pattern can reach them and only naming them would. They are not struck here
   because striking words by judgement is the owner's call, not this suite's;
   they are in the review sheet awaiting that decision. This assertion records
   the size of the gap rather than hiding it, and should be replaced by a real
   removal check once the decision comes back. */
const PENDING = ['squaw', 'squaws', 'abo', 'abos', 'mulatto', 'niggery', 'niggerless',
  'niggerese', 'niggerize', 'niggerlike', 'blowjob', 'boobage', 'cocklicker', 'cuntass',
  'encunt', 'fuckity', 'kinderwhore', 'shitbag', 'shithead', 'slut', 'teledildonics',
  'titty', 'twat', 'unfuck', 'bollocks'];
const stillOpen = PENDING.filter(w => live.has(w));
console.log('  ..    ' + stillOpen.length + ' of ' + PENDING.length
  + ' neutrally-glossed entries still reachable — awaiting the owner\'s decision');
ok(true, 'the second class is surfaced, not silently accepted');

/* The other direction, and the one that matters just as much: ordinary words
   must survive. shrimp, runt, ragtag and riffraff are glossed in the core with
   their DISPARAGING sense ("disparaging terms for small people"), so a filter
   that only deletes would take four good bee words out of the library. They are
   repaired through CORE_FIX instead and must still be here — as must the
   homographs that merely look like slurs. */
const mustStay = ['shrimp', 'runt', 'ragtag', 'riffraff', 'madhouse', 'peewee', 'nuthouse',
  'retard', 'spicy', 'spices', 'japes', 'faggoting', 'chinking', 'retarding', 'gooks',
  'affront', 'euphemism', 'rude', 'obnoxious', 'innuendo', 'nefandous', 'insultment'];
const lost = mustStay.filter(w => !live.has(w));
ok(lost.length === 0, 'and no ordinary word is lost to it' + (lost.length ? ' — LOST: ' + lost.join(', ') : ''));
for (const w of ['shrimp', 'runt', 'ragtag', 'retard'])
  ok(FIXD[w] && !SLUR_DEF.test(FIXD[w]), w + ' ships the everyday meaning, not the disparaging sense');

// the live total must still clear the number every surface quotes
ok(live.size + H.length >= 130000,
  'the FILTERED library still clears 130,000 — ' + (live.size + H.length) + ' words reach a child');

// ---- the merge is idempotent and cache-aware ----
const app3 = fs.readFileSync(SRC + '/app3.js', 'utf8');
ok(/function mergeHard\(\)/.test(app3), 'fullWords() merges the shard through mergeHard()');
ok(/if\(window\.SB_FULL\._hard\) return;/.test(app3), 'and merging twice is a no-op');
const adv = fs.readFileSync(SRC + '/advanced.js', 'utf8');
ok(/_hardN === srcN/.test(adv), 'the Ultra pool rebuilds when the library GROWS, not just when it arrives');

// ---- the journey: these words form a Theme Journey of their own ----
const th = {};
(function () { const src = fs.readFileSync(SRC + '/themes-data.js', 'utf8');
  new Function('window', src)(th); })();
const champ = (th.SB_THEMES.themes || []).find(t => t.id === 'championship');
ok(!!champ, 'a Championship Words theme journey exists');
ok(champ && !champ.re, 'it needs no keyword classifier — the words carry the tag');
const tagged = H.filter(r => (r.t || []).indexOf('championship') >= 0).length;
ok(tagged === H.length, 'and every word in the shard carries that tag (' + tagged + '/' + H.length + ')');

// ---- the claims: library says 130,000, the recorded voice still says 128,000 ----
const idx = fs.readFileSync(SRC + '/index.html', 'utf8');
const pricing = fs.readFileSync(SRC + '/pricing.js', 'utf8');
ok(!/128,000-word library/.test(app3 + adv + pricing + idx),
  'no surface still offers a "128,000-word library"');
ok(/130,000-word library/.test(app3) && /130,000-word library/.test(pricing),
  'the library is offered as 130,000 words');
ok(/find any of 130,000 words/.test(app3), 'and the Word Finder searches 130,000');
// the voice is a different corpus and must not be inflated
ok(/Over 128,000 words spoken aloud/.test(idx),
  'the RECORDED VOICE claim stays at 128,000 — the shard ships no clips');
ok(/Over 128,000 words are recorded in a real neural voice/.test(idx),
  'and so does the FAQ answer about the recorded voice');
ok(/128k clip manifest/.test(fs.readFileSync(SRC + '/boot-lazy.js', 'utf8')),
  'the clip manifest is still described as what it is');

// ---- it is wired to load, and it is not in the boot path ----
ok(/words-hard\.js/.test(app3), 'the shard is fetched alongside the core library');
ok(!/src="words-hard\.js/.test(idx), 'and it is NOT a boot script — the library loads on demand');

console.log(fails ? '\n' + fails + ' FAILED' : '\nall good');
process.exit(fails ? 1 : 0);
