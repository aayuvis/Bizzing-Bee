/* NO NAZI VOCABULARY (owner, 3 Oct 2026: "remove words like nazi nazism nazis" — "delete these words
   from the repo") — @check

   32 words were deleted from every store: the Nazi family (nazi, nazis, nazism, naziism, nazify…,
   denazify), the words whose meaning IS Nazism — its leaders (hitler, goebbels, speer), its
   organisations and events (gestapo, wehrmacht, kapo, anschluss, reich, reichskanzler, the falange),
   its symbol (swastika, gammadion) and its doctrine (aryan as defined here) — plus their lore,
   synonyms, alternates, voice-index entries and 35 recorded clips. Two kept words whose example
   sentence named the Nazis were re-sentenced; four trivia facts lost the mention and two questions
   that existed only to be about it were deleted.
   This holds all of that, and holds the library filter (SB_UNSAFE_RE) to catching a word that comes
   back — while sparing Ashkenazi, monazite, nadir's Arabic "nazir", the Nazirites and the Nazarene.
   Run: node tests/no-nazi-words.cjs                                                            */
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const GONE = ['nazi', 'nazis', 'nazism', 'naziism', 'nazify', 'nazifies', 'nazifying', 'nazidom', 'naziland', 'nazilike',
  'denazify', 'islamonazism', 'feminazi', 'japanazi', 'hitler', 'hitlerian', 'goebbels', 'goebbelsian', 'speer', 'speers',
  'gestapo', 'gestapos', 'wehrmacht', 'kapo', 'anschluss', 'reich', 'reichskanzler', 'falange', 'falangist',
  'swastika', 'swastikas', 'gammadion', 'aryan', 'aryans', 'aryanize'];
const GONE_SET = new Set(GONE);
const TEXT = /\bnazi(?!r)|hitler|gestapo|swastika|goebbels|wehrmacht/i;
const SPARE = ['ashkenazi', 'Ashkenazim', 'monazite', 'nazir', 'Nazirite', 'Nazarene', 'nadir', 'hitherto', 'gestate', 'Reichstag'];

const ctx = { console: { log() {}, warn() {}, error() {} } }; ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx;
const trivia = []; ctx.SB_TRIVIA = { _add: (lv, a) => trivia.push(...a) };
vm.createContext(ctx);
const run = f => { const p = path.join(ROOT, f); if (!fs.existsSync(p)) return false; vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f }); return true; };
['words-data.js', 'words-data-2.js', 'words-data-s.js', 'words-full.js', 'words-hard.js', 'words-lore.js', 'word-synonyms.js',
 'word-alternates.js', 'voice-words.js', 'nsf-vocab26-data.js', 'trivia-q1.js', 'trivia-q2.js', 'trivia-q3.js', 'trivia-q4.js', 'trivia-q5.js'].forEach(run);

/* every record anywhere in the word stores */
const recs = [];
const full = typeof ctx.SB_FULL === 'string' ? JSON.parse(ctx.SB_FULL) : (ctx.SB_FULL || []);
let hard = ctx.SB_HARD || []; if (typeof hard === 'string') hard = JSON.parse(hard);
for (const [src, arr] of [['boot+shard 2', (ctx.SB_DATA || {}).nsf || []], ['library', full], ['championship', Array.isArray(hard) ? hard : []], ['vocab26', (ctx.SB_VOCAB26 || {}).words || []]])
  for (const r of arr) if (r && r.w) recs.push([src, r]);
ok(recs.length > 100000, `read ${recs.length} word records from the shards, the library, the championship shard and vocab26`);
const heads = recs.filter(([, r]) => GONE_SET.has(r.w.toLowerCase())).map(([s, r]) => s + ':' + r.w);
ok(heads.length === 0, 'none of the deleted words is a headword in any store' + (heads.length ? ' — ' + heads.slice(0, 8).join(' ') : ''));
const texts = recs.filter(([, r]) => TEXT.test(r.w) || TEXT.test(r.d || '') || TEXT.test(r.s || '')).map(([s, r]) => s + ':' + r.w);
ok(texts.length === 0, 'no word, definition or example sentence names them' + (texts.length ? ' — ' + texts.slice(0, 8).join(' ') : ''));
const sents = (ctx.SB_SENT_BOOT || []).filter(p => GONE_SET.has(String(p[0]).toLowerCase()) || TEXT.test(p[1] || '')).map(p => p[0]);
ok(ctx.SB_SENT_BOOT && sents.length === 0, 'the boot sentence file holds none of them' + (sents.length ? ' — ' + sents.join(' ') : ''));
for (const [name, o] of [['lore', ctx.SB_LORE], ['synonyms', ctx.SB_SYN], ['alternates', ctx.SB_ALT]]) {
  const bad = Object.keys(o || {}).filter(k => GONE_SET.has(k.toLowerCase()) || TEXT.test(JSON.stringify(o[k])));
  ok(o && bad.length === 0, `${name}: no entry for them and none names them` + (bad.length ? ' — ' + bad.join(' ') : ''));
}
const vw = new Set(String(ctx.SB_WVOICE || '').split('|'));
const vbad = GONE.filter(w => vw.has(w));
ok(vw.size > 1000 && vbad.length === 0, 'the voice index lists none of them' + (vbad.length ? ' — ' + vbad.join(' ') : ''));
let clips = null; try { clips = cp.execSync('git ls-files voice/w', { cwd: ROOT, maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] }).toString().split('\n'); } catch (e) {}
if (clips && clips.length > 1000) { const c = clips.filter(f => GONE_SET.has(path.basename(f, '.mp3').toLowerCase())); ok(c.length === 0, 'no recorded clip of them is in the repo' + (c.length ? ' — ' + c.join(' ') : '')); }
else console.log('  skip clips: no git index here (a deploy tree)');
const tq = trivia.filter(q => TEXT.test(JSON.stringify(q))).map(q => q.id);
ok(trivia.length > 10000 && tq.length === 0, `no trivia question, choice or fact names them (${trivia.length} read)` + (tq.length ? ' — ' + tq.join(' ') : ''));
const ep = path.join(ROOT, 'books', 'eponym-chapters.js');
if (fs.existsSync(ep)) ok(!TEXT.test(fs.readFileSync(ep, 'utf8')), 'the eponyms book source does not name them');

/* the lists that name words without being word records: Atlas stop pools, lessons, the finals and
   Scripps lists, theme journeys, homophones / pronunciations / IPA. A quoted exact token is a word. */
const QUOTED = new RegExp('"(' + GONE.join('|') + ')"');
for (const f of ['trail-map-data.js', 'lessons-data.js', 'nsf-finals500-data.js', 'scripps-data.js', 'themes-data.js', 'sounds-data.js', 'southasia-data.js', 'story-data.js']) {
  const p = path.join(ROOT, f); if (!fs.existsSync(p)) continue;
  const hit = fs.readFileSync(p, 'utf8').match(QUOTED);
  ok(!hit, `${f} lists none of them` + (hit ? ' — "' + hit[1] + '"' : ''));
}

/* the library filter catches a word that comes back, by headword or by definition, and spares the innocent */
const src = fs.readFileSync(path.join(ROOT, 'app3.js'), 'utf8');
const m = src.match(/SB_UNSAFE_RE\s*=\s*(\/(?:\\.|[^\/\n])+\/[a-z]*)/);
const RE = m && vm.runInNewContext(m[1]);
const missed = RE ? GONE.filter(w => !/^(aryans?|aryanize|falang\w*|kapo|reich\w*|speers?|anschluss|islamonazism|japanazi)$/.test(w) && !RE.test(w)) : ['no regex'];
ok(RE && missed.length === 0, 'SB_UNSAFE_RE refuses the Nazi family by headword' + (missed.length ? ' — misses ' + missed.join(' ') : ''));
ok(RE && RE.test('the secret state police in Nazi Germany') && RE.test('German Nazi dictator') && RE.test('neo-Nazi'), 'SB_UNSAFE_RE refuses a word whose definition is Nazi');
const hurt = RE ? SPARE.filter(w => RE.test(w)) : ['no regex'];
ok(hurt.length === 0, 'SB_UNSAFE_RE spares ' + SPARE.join(', ') + (hurt.length ? ' — but refuses ' + hurt.join(' ') : ''));

console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
