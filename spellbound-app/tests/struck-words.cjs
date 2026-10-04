/* STRUCK WORDS NEVER REACH A CHILD, AND THE OWNER'S WORD DECISIONS HOLD (audit v4, 4 Oct 2026) — @check

   CORE_STRIKE and CORE_CUT (app3.js) say which words are not to be put in front of a child. fixCore
   applied them to the 130k library, but the SERVED shards still held 164 of them at rest — idiot,
   moron, cretin, imbecile, mongolism, negro, gypsy, midget, cripple, eskimo, hottentot… — kept out
   of SB_DATA only by words-patch.js's partial copy of the list, and still offered by every store it
   does not touch: `idiot` was the "means" chip on 29 other words, `boche` a "sounds like" partner.
   tools/strike-served.cjs deleted them where they live. Then the owner decided the words under
   review: six more deleted (retard, retards, idiots, idiotic, moronic, imbeciles), sixteen KEPT
   with kind glosses (autism, heathen, lunatic, dumb, pygmy…). This holds all of it:

     shards     no struck word in words-data.js / words-data-2.js at rest, nor in SB_DATA as the page
                builds it (words-patch run), nor a sentence for one in words-data-s.js
     stores     no lore, alternate or synonym entry keyed on one, no synonym chip that IS one, no
                homophone partner, pronunciation, diacritic or IPA entry, no Atlas stop pool listing one
     search     the 130k library as the page builds it (safeWord + fixCore, core + championship shard,
                read out of app3.js) holds none — with search's other source, SB_DATA, that is all of it
     decided    the owner's deletions are absent from every store, the library file and the voice
                index; each rewritten word is still served, its gloss is the SAME in the shard and the
                library, passes the gloss check, and does not carry the old wording
     feed       no My Feed card is keyed on, titled with or quotes a struck, deleted or held word
     hour       the word-of-the-hour pool (app3 wohPool, read out of app3.js) holds nothing struck,
                nothing held, no gloss that fails SB_GLOSS_OK, nothing above rarity band 6
     held       SB_WORDS_HELD (words-patch.js) is the ONE list for words awaiting a decision: put a
                word there and the feed and the word of the hour must drop it

   To add a decision: a deletion goes in CORE_STRIKE (+ words-patch REMOVE), then
   `node tools/strike-served.cjs` and `node tools/build-feed.cjs`, then DELETED below; a rewrite goes
   in CORE_FIX + words-patch DEF + the shards at rest, then REWRITTEN below. A word not yet decided
   goes in SB_WORDS_HELD. dike is the one struck word deliberately served (an embankment).
   Proved by breaking (4 Oct 2026): the base commit's shards → shards/stores/feed fail; autism back to
   its old gloss → decided fails; 'autism' put in SB_WORDS_HELD without a rebuild → feed fails;
   wohFit's gloss test removed → hour fails.
   Run: node tests/struck-words.cjs                                                             */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const some = (a) => (a.length ? ' — ' + a.slice(0, 10).join(' ') + (a.length > 10 ? ' …(' + a.length + ')' : '') : '');

/* the decisions */
const DELETED = ['retard', 'retards', 'idiots', 'idiotic', 'moronic', 'imbeciles', 'cretins', 'morons'];
const CONFIRMED = ['idiot', 'moron', 'cretin', 'imbecile', 'mongolism', 'negro', 'negroes', 'negroid', 'gypsy', 'gipsy',
  'midget', 'cripple', 'eskimo', 'hottentot'];                                // the audit's examples, served at rest until 4 Oct
const REWRITTEN = {                                                           // word → what the old gloss said
  autism: /abnormal absorption|inability to treat others/i, autistic: /affected with autism/i,
  schizophrenia: /^a severe mental disorder$/i, schizophrenic: /afflicted/i,
  heathen: /your god/i, heathens: /your god/i, infidel: /your god/i, infidels: /your god/i,
  lunatic: /^an insane person$/i, lunatics: /^an insane person$/i, maniac: /^an insane person$/i,
  insane: /mental derangement/i, pygmy: /unusually small individual/i, dumb: /slow to learn|intellectual acuity/i,
  hysteria: /violent mental agitation/i, hysterical: /pertaining to hysteria/i };
const SERVED_KEEP = new Set(['dike']);

/* app3's strike lists and library filter, read out of the source the page runs */
const app3 = fs.readFileSync(path.join(ROOT, 'app3.js'), 'utf8');
const A = { window: {} }; vm.createContext(A);
vm.runInContext(app3.slice(app3.indexOf('const SB_UNSAFE_RE'), app3.indexOf('function mergeHard(')) +
  ';this.__={safeWord,fixCore,CORE_STRIKE,CORE_CUT,CORE_FIX};', A);
const { safeWord, fixCore, CORE_STRIKE, CORE_CUT, CORE_FIX } = A.__;
const STRUCK = new Set([...CORE_STRIKE, ...CORE_CUT].map((w) => String(w).toLowerCase()).filter((w) => !SERVED_KEEP.has(w)));
DELETED.forEach((w) => ok(CORE_STRIKE.has(w), `CORE_STRIKE names the deleted "${w}"`));
const GONE = new Set([...STRUCK, ...DELETED]);
const gone = (w) => GONE.has(String(w || '').toLowerCase());

/* the stores, as files */
const load = (files, pre) => { const c = Object.assign({ console: { log() {}, warn() {}, error() {} } }, pre || {}); c.window = c; c.self = c; vm.createContext(c);
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/try\{ if\(window\.SB_WORDS_PATCH\)[^\n]*/, ''), c, { filename: f }); return c; };
const raw = load(['words-data.js', 'words-data-2.js']);
ok(raw.SB_DATA.nsf.length > 50000, `read ${raw.SB_DATA.nsf.length} served records at rest`);
let bad = raw.SB_DATA.nsf.filter((r) => gone(r.w)).map((r) => r.w);
ok(!bad.length, 'shards: no struck or deleted word is a record in words-data.js / words-data-2.js at rest' + some(bad));
const C = require(path.join(ROOT, 'tools', 'feed-corpus.cjs')).load();     // exactly as the page loads it, words-patch run
const W = C.win;
bad = C.DATA.filter((r) => gone(r.w)).map((r) => r.w);
ok(!bad.length, `shards: none in SB_DATA as the page builds it (${C.DATA.length} records)` + some(bad));
bad = (W.SB_SENT_BOOT || []).filter((p) => gone(p[0])).map((p) => p[0]);
ok(W.SB_SENT_BOOT && !bad.length, 'shards: the boot sentence file holds none' + some(bad));

const st = load(['words-lore.js', 'word-synonyms.js', 'word-alternates.js', 'voice-words.js', 'sounds-data.js', 'trail-map-data.js']);
for (const [name, o] of [['lore', st.SB_LORE], ['alternates', st.SB_ALT], ['synonyms', st.SB_SYN]]) {
  bad = Object.keys(o || {}).filter(gone);
  ok(o && Object.keys(o).length > 10000 && !bad.length, `stores: no ${name} entry is keyed on one` + some(bad));
}
bad = []; for (const k in st.SB_SYN) for (const v of st.SB_SYN[k]) if (gone(v)) bad.push(k + '→' + v);
ok(!bad.length, 'stores: no synonym chip offers one as a meaning' + some(bad));
bad = (st.SB_HOM || []).filter((g) => g.some(gone)).map((g) => g.join('/'));
ok(st.SB_HOM && !bad.length, 'stores: no homophone group pairs a word with one' + some(bad));
for (const name of ['SB_ALT_PRON', 'SB_DIACRITICS', 'SB_IPA']) { bad = Object.keys(st[name] || {}).filter(gone); ok(!bad.length, `stores: ${name} holds none` + some(bad)); }
bad = []; for (const u in st.SB_TRAIL_MAP) for (const b in st.SB_TRAIL_MAP[u]) for (const w of st.SB_TRAIL_MAP[u][b] || []) if (gone(w)) bad.push(u + ':' + w);
ok(Object.keys(st.SB_TRAIL_MAP || {}).length > 100 && !bad.length, 'stores: no Atlas stop pool lists one' + some(bad));
const voice = new Set(String(st.SB_WVOICE || '').split('|'));
bad = DELETED.concat(CONFIRMED).filter((w) => voice.has(w));
ok(voice.size > 128000 && !bad.length, `stores: the voice index (${voice.size}) lists none of the deleted or confirmed words` + some(bad));

/* search: SB_DATA (above) and the library as the page builds it */
const full = load(['words-full.js', 'words-hard.js']);
const core = typeof full.SB_FULL === 'string' ? JSON.parse(full.SB_FULL) : full.SB_FULL;
bad = core.filter((r) => DELETED.includes(String(r.w).toLowerCase())).map((r) => r.w);
ok(!bad.length, 'search: the deleted words are gone from words-full.js itself' + some(bad));
const lib = fixCore(core.filter(safeWord)).concat(fixCore((full.SB_HARD || []).filter(safeWord)));
ok(lib.length > 125000, `search: the library as the page builds it holds ${lib.length} words`);
bad = lib.filter((r) => gone(r.w)).map((r) => r.w);
ok(!bad.length, 'search: no struck or deleted word is in it' + some(bad));

/* the rewritten words: still here, the same in both banks, clean, and off the old wording */
const libBy = {}; lib.forEach((r) => { libBy[String(r.w).toLowerCase()] = r; });
const srvBy = {}; C.DATA.forEach((r) => { srvBy[String(r.w).toLowerCase()] = r; });
const rawBy = {}; raw.SB_DATA.nsf.forEach((r) => { rawBy[String(r.w).toLowerCase()] = r; });
for (const [w, old] of Object.entries(REWRITTEN)) {
  const s = srvBy[w], l = libBy[w], r = rawBy[w];
  ok(s && l && r && s.d === l.d && r.d === s.d && s.d === CORE_FIX[w] && W.SB_GLOSS_OK(s.d, w) && !old.test(s.d),
    `decided: "${w}" is kept, one gloss everywhere — "${s ? s.d.slice(0, 64) : '(missing)'}…"`);
}
ok(!/your god/i.test(JSON.stringify([st.SB_LORE.infidels, st.SB_ALT.heathen])) && !/Neurotic|psychoneurotic/.test(JSON.stringify([st.SB_ALT.hysteria, st.SB_ALT.hysterical])),
  'decided: the lore and "other meanings" under them dropped the old wording too');

/* the feed: no card on a struck, deleted or held word */
const HELD = new Set((W.SB_WORDS_HELD || []).map((w) => String(w).toLowerCase()));
ok(Array.isArray(W.SB_WORDS_HELD) && typeof W.SB_GLOSS_OK === 'function', 'held: words-patch.js carries SB_WORDS_HELD and SB_GLOSS_OK');
const F = { console }; F.window = F; vm.createContext(F);
const FD = path.join(ROOT, 'feed');
vm.runInContext(fs.readFileSync(path.join(FD, 'feed-meta.js'), 'utf8'), F);
Object.values(F.SB_FEED_META.index).concat(Object.values(F.SB_FEED_META.body)).forEach((f) => vm.runInContext(fs.readFileSync(path.join(FD, f), 'utf8'), F));
const cards = []; Object.values(F.SB_FEED_IDX).forEach((rows) => rows.forEach((r) => { const o = {}; F.SB_FEED_META.keys.forEach((k, i) => { if (r[i] != null) o[k] = r[i]; }); cards.push(Object.assign({}, F.SB_FEED_BODY[o.id], o)); }));
/* a card is ON a word when its key or its route names it (an idiom titled "AWOL" is not the word `awol`) */
const onWord = (c, test) => { const w = c.key ? c.key.slice(5) : '';
  return (w && test(w)) || !!(c.route && /^#\/word\//.test(c.route) && test(decodeURIComponent(c.route.slice(7)))); };
bad = cards.filter((c) => onWord(c, gone)).map((c) => c.id);
ok(cards.length > 10000 && !bad.length, `feed: none of ${cards.length} cards is on a struck or deleted word` + some(bad));
const toks = (s) => String(s || '').toLowerCase().match(/[a-z]+(?:-[a-z]+)*/g) || [];
/* in a card's TEXT only the words that cannot be innocent: `retards` is a verb in "…and retards your
   fall", `negro` is the Rio Negro, `gypsy` a moth — those are judged as headwords, above */
const INSULT = ['idiot', 'idiots', 'idiotic', 'moron', 'morons', 'moronic', 'cretin', 'cretins', 'imbecile', 'imbeciles',
  'mongolism', 'negroid', 'midget', 'midgets', 'hottentot', 'hottentots'];
bad = cards.filter((c) => [c.body, c.title, c.source, c.play && c.play.q].concat(c.play ? c.play.opts : []).some((x) => toks(x).some((t) => INSULT.includes(t)))).map((c) => c.id);
ok(!bad.length, 'feed: no card calls anyone an idiot, a moron or worse in its text' + some(bad));
bad = cards.filter((c) => onWord(c, (w) => HELD.has(w))).map((c) => c.id);
ok(!bad.length, `feed: no card is on a word held for a decision (${HELD.size} held)` + some(bad));
bad = cards.filter((c) => (c.kind === 'spotlight' || c.kind === 'word') && !W.SB_GLOSS_OK(c.body)).map((c) => c.id);
ok(!bad.length, 'feed: no meaning card carries a raw gloss' + some(bad));

/* the word of the hour, by app3's own pool */
const H = { window: W, CORE_STRIKE, CORE_CUT, SB_DATA: W.SB_DATA, SB_GLOSS_OK: W.SB_GLOSS_OK }; vm.createContext(H);
const sent = {}; (W.SB_SENT_BOOT || []).forEach(([w, s]) => { sent[w] = s; });
W.SB_DATA.nsf.forEach((r) => { if (!r.s && sent[r.w]) r.s = sent[r.w]; });          // boot-lazy merges these on the page
const a = app3.indexOf('function wohFit('), b = app3.indexOf('function wordOfHour(');
ok(a > 0 && b > a, 'hour: app3.js has wohFit and wohPool');
vm.runInContext(app3.slice(a, b) + ';this.__pool=wohPool();', H);
const pool = H.__pool || [];
ok(pool.length >= 300, `hour: the pool holds ${pool.length} words — enough for a fortnight of hours`);
bad = pool.filter((e) => gone(e.w) || HELD.has(e.w.toLowerCase())).map((e) => e.w);
ok(!bad.length, 'hour: nothing struck, deleted or held' + some(bad));
bad = pool.filter((e) => !W.SB_GLOSS_OK(e.d, e.w)).map((e) => e.w);
ok(!bad.length, 'hour: every gloss passes the check' + some(bad));
bad = pool.filter((e) => e.y > 6 || /^[A-Z]/.test(e.w)).map((e) => e.w + ':' + e.y);
ok(!bad.length && !pool.some((e) => e.w === 'schizophrenia'), 'hour: nothing above rarity band 6, no capitalised headword, no schizophrenia' + some(bad));

console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
