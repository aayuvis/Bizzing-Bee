// The free journey's word mapping — trail-map-data.js.
//
// This file decides which words a child actually practises at each of the 128
// Honey stops, so a fault in it is not a cosmetic bug: it is a word that does
// not teach the lesson, or a word the app cannot say, or a word that should
// never have been in front of a nine-year-old.
//
// The failure this suite exists to catch is a VACUOUS PASS. An earlier check
// computed "stops with no words" inside an `if (SB_TRAIL_MAP)` that never ran,
// and duly reported none. So every assertion below is preceded by a floor on
// the thing it inspects: if the map fails to load, the counts collapse and the
// suite fails loudly instead of congratulating itself on an empty set.
const fs = require('fs');
const SRC = process.env.SRC || __dirname + '/..';
let fails = 0;
const ok = (b, msg) => { console.log((b ? '  OK   ' : '  FAIL ') + msg); if (!b) fails++; };
const nk = s => String(s == null ? '' : s).toLowerCase().trim();

const load = (file, g) => { new Function('window', fs.readFileSync(SRC + '/' + file, 'utf8'))(g); return g; };

// ---- the map loads and is the size it claims to be ----
const g = load('trail-map-data.js', {});
const MAP = g.SB_TRAIL_MAP;
ok(MAP && typeof MAP === 'object', 'trail-map-data.js defines SB_TRAIL_MAP');
if (!MAP) { console.log('\n1 FAILED'); process.exit(1); }

const stops = Object.keys(MAP);
let total = 0, byWord = Object.create(null);
for (const id of stops) for (const lap of ['1', '2', '3'])
  for (const w of (MAP[id][lap] || [])) { total++; (byWord[nk(w)] || (byWord[nk(w)] = [])).push(id); }

ok(stops.length >= 120, stops.length + ' stops carry words (a real map has 128)');
ok(total >= 15000, total.toLocaleString() + ' word placements (the built map carries ~19,800)');

// ---- every Honey stop is served, on every lap ----
// Laps cap difficulty absolutely (CLAUDE.md), so a stop with an empty lap is a
// child opening a round and finding nothing to spell.
const T = load('trail-data.js', {}).SB_TRAIL;
const units = T.honey.acts.flatMap(a => a.units);
ok(units.length >= 120, units.length + ' Honey units declared in trail-data.js');
const missing = units.filter(u => !MAP[u]);
ok(!missing.length, 'every Honey unit has a word list' + (missing.length ? ' — missing ' + missing.slice(0, 8).join(',') : ''));
const emptyLap = units.filter(u => MAP[u] && ['1', '2', '3'].some(l => !(MAP[u][l] || []).length));
ok(!emptyLap.length, 'every unit serves all three laps' + (emptyLap.length ? ' — thin: ' + emptyLap.slice(0, 8).join(',') : ''));

// ---- every mapped word is one the app can actually serve ----
// A word in the map that is not in the served corpus cannot be spoken, defined
// or drilled: the stop silently comes up short by exactly that many words.
const d = { SB_DATA: null };
new Function('window', fs.readFileSync(SRC + '/words-data.js', 'utf8'))(d);
new Function('window', fs.readFileSync(SRC + '/words-data-2.js', 'utf8'))(d);
const corpus = Object.create(null);
for (const e of d.SB_DATA.nsf) if (e && e.w) corpus[nk(e.w)] = e;
const corpusN = Object.keys(corpus).length;
ok(corpusN >= 50000, corpusN.toLocaleString() + ' words in the served corpus');
const orphans = Object.keys(byWord).filter(w => !corpus[w]);
ok(!orphans.length, 'every mapped word is in the served corpus'
  + (orphans.length ? ' — ' + orphans.length + ' orphans, e.g. ' + orphans.slice(0, 10).join(', ') : ''));

// ---- nothing struck from the library may reach a stop ----
// words-patch.js splices these out of SB_DATA on every boot. The map is built
// from a snapshot of the library, so it can name a word the runtime has since
// removed — which is the shape the contamination took last time.
const patch = fs.readFileSync(SRC + '/words-patch.js', 'utf8');
const struck = new Set();
for (const m of patch.matchAll(/'([a-z-]{3,})'/g)) struck.add(m[1]);
ok(struck.size >= 40, struck.size + ' words are struck by words-patch.js');
const leaked = Object.keys(byWord).filter(w => struck.has(w));
ok(!leaked.length, 'no word struck from the library is mapped to a stop'
  + (leaked.length ? ' — ' + leaked.join(', ') : ''));

// A named floor, so a rewritten words-patch cannot quietly empty the set above.
const NEVER = ['kaffir', 'hottentot', 'negress', 'coolie', 'redskin', 'chinaman',
  'eskimo', 'gypsy', 'rape', 'rapist', 'porn', 'pornography', 'molest', 'ravish'];
const named = NEVER.filter(w => byWord[w]);
ok(!named.length, 'no named slur or sexual-violence word is mapped' + (named.length ? ' — ' + named.join(', ') : ''));

// ---- Roman numerals are not words ----
// xiv, xxii, lxx: two to five letters, band 1, and they teach a speller nothing.
// The test is the SHAPE plus the cardinal gloss, never the shape alone — `mix`,
// `dix` and `cli` all read as numerals and are all real headwords.
const ROMAN = /^(?=[mdclxvi]{2,})m{0,4}(cm|cd|d?c{0,3})(xc|xl|l?x{0,3})(ix|iv|v?i{0,3})$/;
const numerals = Object.keys(byWord).filter(w => ROMAN.test(w)
  && /^(the cardinal number that is|being\s+\w+\s+more than)\b/i.test(String((corpus[w] || {}).d || '')));
ok(!numerals.length, 'no Roman numeral is mapped to a stop' + (numerals.length ? ' — ' + numerals.join(', ') : ''));
ok(!!corpus['mix'] && !numerals.includes('mix'), 'the numeral rule spares mix, which is a real word');

// ---- a word may serve a couple of stops, not a dozen ----
// Repetition across chapters is allowed and even wanted; a word appearing in
// ten stops means a rule matched far too widely and the lists have gone generic.
const overused = Object.entries(byWord).filter(([, ids]) => new Set(ids).size > 3);
ok(overused.length < total * 0.01, 'almost no word serves more than three stops — '
  + overused.length + ' do' + (overused.length ? ', e.g. ' + overused.slice(0, 5).map(([w, i]) => w + '×' + new Set(i).size).join(', ') : ''));

console.log(fails ? '\n' + fails + ' FAILED' : '\nall good');
process.exit(fails ? 1 : 0);
