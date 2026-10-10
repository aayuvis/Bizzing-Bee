/* NOTHING THE APP SERVES HURTS SOMEONE FOR A DISABILITY, THEIR MENTAL HEALTH, THEIR ETHNICITY OR THEIR BODY
   (the 4.5 brief, P0.11–P0.13, 10 Oct 2026) — @check

   THE LIST is kid-safe.js's SB_KID_SAFE.stigma, read through tools/stigma.cjs — one list, one matcher, the
   same one the page's kidSafe() asks. This greps everything a child is shown as a sentence or a fact:

     list       the brief's terms are on it (cripple(s/d), lunatic, dumb in both senses, spastic, retarded,
                psycho, maniac, crazy and insane said OF a person, freak, lame the insult, deaf and dumb,
                lowercase mongol, invalid the person, handicapped, wheelchair-bound, suffers from <a
                disability>, mental the insult, midget, gyp/gypped…) and ordinary senses are NOT (drives me
                crazy, an invalid argument, the horse came up lame, the Mongol Empire, mad at his brother, a
                dwarf planet, press mute, the root psycho-, Looney Tunes, a freak storm, dumbbell, retards
                your fall, suffered from indigestion)
     sentences  every served example sentence: the shards at rest (words-data.js, words-data-2.js), SB_DATA as
                the page builds it (words-patch run), the boot tier's words-data-s.js — and the 130,000-word
                library as the page builds it (app3's fixCore run, kid-safe.js beside it), which DOES still
                hold some at rest (so the check proves fixCore is doing the work)
     chapters   every chapter word's `ex`: the free course, South Asia, the Advanced Pack
     trivia     every question's prompt, options and fact, all five level shards and the word bank; byLevel
                still matches the shards
     feed       no My Feed card carries one in anything it shows; the "cripples" sentence card is gone
     ledger     qc-stigma-fixes.json records every change, and each recorded sentence is really gone
     games      every served record whose headword or gloss is on the list fails kidSafe at every age —
                no game can put it on screen (tests/word-door-seeded.cjs runs the door itself)
   Proved by breaking (10 Oct 2026, in a scratch copy of the tree, each put back): the commit-before's
   words-data-2.js, words-data-s.js, words-patch.js, concepts-data.js, adv-concepts-data.js and trivia files
   → 7 fail (shards at rest, as built, boot tier, both chapter checks, trivia, ledger); the build's stigma
   drop removed and the feed rebuilt → "feed" fails (ws-dumb, ws-lunatic, wh-egomaniac, hs-97); fixCore's
   stigma line removed → the library check fails (67 sentences); the cripple family taken off the list →
   "the brief's terms" fails; kid-safe.js's stigma line in whyAll removed → "games" fails (committal,
   neurotic, paralytic, bahuvrihi…); the headword read WITH the cased forms → "the people's name" fails.
   Run: node tests/stigma.cjs                                                                       */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const some = (a) => (a.length ? ' — ' + a.slice(0, 8).join(' · ') + (a.length > 8 ? ' …(' + a.length + ')' : '') : '');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const S = require(path.join(ROOT, 'tools', 'stigma.cjs')), K = S.load(ROOT);
const hit = (t) => K.stigmaHit(t);
const cut = (t) => String(t).slice(0, 70);

/* ---- the list ---- */
const MUST = ['the tragic spectacle of cripples', 'a crippled man', 'cripple', 'a crippling fear', 'the townspeople thought him a lunatic',
  'he stared dumbly', 'deaf and dumb', 'the dumbness of the plan', 'a spastic', 'a retarded child', 'they are retards', 'you psycho',
  'like maniacs', 'he is crazy', 'a crazy person', "she's insane", 'the insane were locked away', 'a lame excuse', 'that is so lame',
  'a mongol', 'her invalid mother', 'the face of the invalid.', 'the handicapped', 'wheelchair-bound', 'confined to a wheelchair',
  'she suffers from autism', 'suffering from severe psychoses', 'a mental case', 'a mental hospital', 'the midgets', 'he gypped me',
  'gyp', 'a freak with markings', 'performers labelled as freaks', 'a leper colony', 'the gypsies roamed', 'an Eskimo canoe',
  'a nutter', 'a madman', 'the madwoman in the attic', 'a mongoloid', 'mentally retarded', 'a harelip'];
const MUST_NOT = ['the noise drives me crazy', 'an invalid argument', 'declare it invalid', 'the horse came up lame', 'the Mongol Empire',
  'the Mongols', 'he was mad at his brother', 'a dwarf planet', 'press the mute button', 'psycho- = mind', 'psycho + pathy = psychopathy',
  'Looney Tunes', 'The Hunchback of Notre-Dame', 'a freak storm', 'a dumbbell', 'dumbfounded', 'it retards your fall',
  'suffered from indigestion', 'the insanity defence', 'a maddening puzzle', 'Dumbo the elephant', 'the dumbo octopus',
  'The Imaginary Invalid', 'Gypsy and Traveller families', "The Bacup 'Nutters' dance", 'an egomaniac', 'mental arithmetic'];
const miss = MUST.filter((t) => !hit(t)), over = MUST_NOT.filter((t) => hit(t));
ok(K.stigma && K.stigma.words.length > 50 && typeof S.hit === 'function', `the list is kid-safe.js's (${K.stigma.words.length} words, ${K.stigma.phrases.length} phrases), read through tools/stigma.cjs`);
ok(!miss.length, `the brief's terms are on it — ${MUST.length} probes` + some(miss));
ok(!over.length, `ordinary senses are not — ${MUST_NOT.length} probes` + some(over));

/* ---- served sentences ---- */
const sandbox = () => { const c = { console: { log() {}, warn() {}, error() {} } }; c.window = c; c.self = c; vm.createContext(c); return c; };
const raw = sandbox();
for (const f of ['words-data.js', 'words-data-2.js']) vm.runInContext(read(f).replace(/try\{ if\(window\.SB_WORDS_PATCH\)[^\n]*/, ''), raw, { filename: f });
let bad = raw.SB_DATA.nsf.filter((r) => r && r.s && hit(r.s)).map((r) => r.w + ': ' + cut(r.s));
ok(raw.SB_DATA.nsf.length > 40000 && !bad.length, `sentences: none of ${raw.SB_DATA.nsf.length} shard records at rest carries one` + some(bad));
const C = require(path.join(ROOT, 'tools', 'feed-corpus.cjs')).load();
bad = C.DATA.filter((r) => r && r.s && hit(r.s)).map((r) => r.w + ': ' + cut(r.s));
ok(!bad.length, `sentences: nor SB_DATA as the page builds it (${C.DATA.length} records, words-patch run)` + some(bad));
bad = (C.win.SB_SENT_BOOT || []).filter((p) => hit(p[1])).map((p) => p[0] + ': ' + cut(p[1]));
ok((C.win.SB_SENT_BOOT || []).length > 5000 && !bad.length, `sentences: nor the boot tier's ${C.win.SB_SENT_BOOT.length} in words-data-s.js` + some(bad));
/* the 130k library: at rest it still holds some; the page's fixCore takes them out as it loads */
{
  const app3 = read('app3.js'), L = sandbox();
  vm.runInContext(read('kid-safe.js'), L, { filename: 'kid-safe.js' });
  vm.runInContext(app3.slice(app3.indexOf('const SB_UNSAFE_RE'), app3.indexOf('function mergeHard(')) + ';this.__={safeWord,fixCore};', L);
  const F = sandbox(); for (const f of ['words-full.js', 'words-hard.js']) vm.runInContext(read(f), F, { filename: f });
  const core = typeof F.SB_FULL === 'string' ? JSON.parse(F.SB_FULL) : F.SB_FULL, hard = F.SB_HARD || [];
  const atRest = core.concat(hard).filter((r) => r && r.s && hit(r.s)).length;
  const lib = L.__.fixCore(core.filter(L.__.safeWord)).concat(L.__.fixCore(hard.filter(L.__.safeWord)));
  bad = lib.filter((r) => r.s && hit(r.s)).map((r) => r.w + ': ' + cut(r.s));
  const kept = lib.filter((r) => r && r.w === 'spectacle').length === 1 && lib.some((r) => r.w === 'lunatic' && !r.s);
  ok(lib.length > 125000 && atRest > 0 && !bad.length && kept, `sentences: the library as the page builds it (${lib.length} words) carries none — fixCore took ${atRest} out of the file as it loaded, and kept their words` + some(bad));
}

/* ---- chapters ---- */
{
  const T = sandbox();
  for (const f of ['concepts-data.js', 'southasia-data.js', 'adv-concepts-data.js']) vm.runInContext(read(f), T, { filename: f });
  const chs = (x) => (Array.isArray(x) ? x : Object.values(x || {}));
  const all = [['course', T.SB_CONCEPTS.chapters], ['southasia', chs(T.SB_SOUTHASIA)], ['advanced', T.SB_ADV_CONCEPTS.chapters]];
  bad = []; let n = 0;
  all.forEach(([k, list]) => list.forEach((ch, i) => (ch.words || []).forEach((x) => { if (!x || !x.ex) return; n++; if (hit(x.ex)) bad.push(k + ' ' + i + ':' + x.w + ': ' + cut(x.ex)); })));
  ok(n > 500 && !bad.length, `chapters: none of ${n} chapter-word sentences (the course, South Asia, the Advanced Pack) carries one` + some(bad));
  const sp = T.SB_CONCEPTS.chapters[76] && (T.SB_CONCEPTS.chapters[76].words || []).find((x) => x.w === 'spectacle');
  ok(sp && !/cripple/i.test(sp.ex || ''), 'chapters: the audit\'s "the tragic spectacle of cripples" is gone from its chapter (the word stays)');
}

/* ---- trivia ---- */
{
  const T = sandbox(), TQ = []; T.SB_TRIVIA = { questions: TQ, themes: [], byLevel: {}, _add: (lv, a) => TQ.push(...a) };
  for (const f of ['trivia-words.js', 'trivia-q1.js', 'trivia-q2.js', 'trivia-q3.js', 'trivia-q4.js', 'trivia-q5.js']) vm.runInContext(read(f), T, { filename: f });
  const ALL = T.SB_TRIVIA.questions === TQ ? TQ : TQ.concat(T.SB_TRIVIA.questions);
  bad = [];
  ALL.forEach((q) => { [['prompt', q.q], ['fact', q.f]].concat((q.c || []).map((o, i) => ['option ' + i, o])).forEach(([k, t]) => { if (t && hit(t)) bad.push(q.id + ' ' + k + ': ' + cut(t)); }); });
  ok(ALL.length > 37000 && !bad.length, `trivia: no prompt, option or fact of ${ALL.length} questions (five level shards and the word bank) carries one` + some(bad));
  const lvN = {}; TQ.forEach((q) => { lvN[q.lv] = (lvN[q.lv] || 0) + 1; });
  const TD = sandbox(); vm.runInContext(read('trivia-data.js').replace(/\bdocument\b/g, 'undefined'), TD);
  ok([1, 2, 3, 4, 5].every((l) => lvN[l] === TD.SB_TRIVIA.byLevel[l]), 'trivia: byLevel still matches the shards — ' + JSON.stringify(lvN));
}

/* ---- the feed ---- */
{
  const F = sandbox(), FD = path.join(ROOT, 'feed');
  vm.runInContext(fs.readFileSync(path.join(FD, 'feed-meta.js'), 'utf8'), F);
  Object.values(F.SB_FEED_META.body).forEach((f) => vm.runInContext(fs.readFileSync(path.join(FD, f), 'utf8'), F));
  const cards = Object.entries(F.SB_FEED_BODY);
  bad = cards.filter(([, c]) => hit(S.cardText(c))).map(([id, c]) => id + ': ' + hit(S.cardText(c)));
  ok(cards.length > 10000 && !bad.length, `feed: none of ${cards.length} cards carries one in anything it shows` + some(bad));
  ok(!F.SB_FEED_BODY['wx-spectacle'] || !/cripple/i.test(F.SB_FEED_BODY['wx-spectacle'].body), 'feed: the "cripples" sentence card the audit saw is gone');
  const man = JSON.parse(read('tools/feed-manifest.json'));
  ok(typeof man.stigmaDropped === 'number', `feed: the build counts what the stigma list dropped (${man.stigmaDropped} this build)`);
}

/* ---- the ledger ---- */
{
  const L = JSON.parse(read('qc-stigma-fixes.json'));
  const n = ['sentencesDeleted', 'chapterExDeleted', 'triviaDeleted', 'triviaFactsTrimmed'].map((k) => (L[k] || []).length);
  ok(n[0] >= 30 && n[1] >= 1 && n[2] >= 1 && n[3] >= 1 && /never|no new text/i.test(L.note), `ledger: qc-stigma-fixes.json records ${n[0]} sentences, ${n[1]} chapter sentences, ${n[2]} trivia questions and ${n[3]} trimmed facts`);
  const byW = {}; raw.SB_DATA.nsf.forEach((r) => { byW[r.w] = r; });
  const boot = new Map((C.win.SB_SENT_BOOT || []).map((p) => [p[0], p[1]]));
  const built = {}; C.DATA.forEach((r) => { if (r && r.w && !built[r.w]) built[r.w] = r; });
  bad = (L.sentencesDeleted || []).filter((e) => (e.store === 'words-data-s.js' ? boot.get(e.w) === e.s
    : (built[e.w] || {}).s === e.s || (e.store !== 'words-patch.js' && (byW[e.w] || {}).s === e.s))).map((e) => e.store + ':' + e.w);
  ok(!bad.length, 'ledger: every sentence it records as deleted is really gone — from its store, and from the record as the page builds it' + some(bad));
}

/* ---- games: the list sits at the door ---- */
{
  const app3 = read('app3.js'), W = sandbox();
  W.SB_UNSAFE_RE = vm.runInNewContext('(' + app3.slice(app3.indexOf('const SB_UNSAFE_RE=') + 19, app3.indexOf(';\n', app3.indexOf('const SB_UNSAFE_RE='))) + ')');
  vm.runInContext(read('kid-safe.js'), W, { filename: 'kid-safe.js' });
  const KK = W.SB_KID_SAFE;
  /* a headword is lowercase, so it is read without the cased forms (K.stigmaHit(w, true)): `mongol` the people
     stays a word a game may ask, the lowercase slur in a sentence does not */
  const named = C.DATA.filter((r) => r && r.w && (KK.stigmaHit(r.w, true) || (r.d && hit(r.d))));
  bad = named.filter((r) => KK.check(r, 8) || KK.check(r, 14)).map((r) => r.w);
  ok(named.length >= 5 && !bad.length, `games: all ${named.length} served records the list names by headword or gloss fail kidSafe at 8 and at 14` + some(bad));
  ok(['mongol', 'mongols'].every((w) => C.WORD[w] && KK.check(C.WORD[w], 8)), 'games: the people\'s name (mongol, mongols — "a member of the nomadic peoples of Mongolia") is not the slur, and stays');
}

console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
