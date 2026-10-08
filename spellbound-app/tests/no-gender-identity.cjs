/* NO GENDER-IDENTITY WORDS OR MEANINGS (owner, 8 Oct 2026: "for trans remove the meaning 'defines a
   person whos gender differ from what is defined at birth' — this is controversial… we dont want such
   words or meanings… audit the entire word list" — "dont just block the words… delete them") — @check

   39 records were DELETED from every store, the 130k library file included: transgender, transgenderism,
   transsexual(s), transsexuality, transvestite(s), cissexual(ity), bigender(ed), agendered, ambigender(ed),
   genderfluid, intergender, multigender(ed), nongender(ed), ungender(ed), antigender, postgenderism,
   nontransgender(ed), nontranssexual, antitranssexual, transfeminism, transfolk, transman, transwoman,
   kathoey, sexship, nonfemale, androgynously, omnisexual(ity), nonheteronormative — with their lore, alternate senses, voice
   index and French-voice entries, and their recorded clips. `trans` stays, with only its first sense.
   This holds all of that, scans the TEXT of every shipped store for the meaning, and holds the library
   filter (SB_UNSAFE_RE) to refusing the family by headword and by definition while sparing gender (the
   grammar word), transition, transatlantic, transport, engender, androgynous and agenda.
   THE SAME DAY, ASKED, THE OWNER CHOSE "Delete them all" FOR SEXUAL-ORIENTATION WORDS: 58 more records
   (lesbian(s), lesbianism, homosexual(s), homosexuality, homophobia, homophobic, heterosexual(s), bisexual(s),
   gays, gayness, gaydar, gayborhood, homonormative, heteronormative, Polari… and their forms), with their
   lore, synonyms, alternate senses, voice entries and clips. Kept with their everyday sense only: gay (cheerful,
   at rest AND in words-patch DEF, which had served "…also, attracted to people of the same sex"), straight
   (served as "a heterosexual person" until now), queer (strange, odd), pouf(s) (a footstool), dike (an
   embankment); out/outing/fairy/pansies/beard lost those senses in SB_ALT; "excommunicate(d)" were
   re-sentenced. Kept on purpose: asexual/ambisexual (biology), sapphic, sappho, Lesbos, homophone(s).
   Proved by breaking (8 Oct 2026): run against the commit before the deletion (SB_ROOT) → the headword,
   text, trans and clip checks fail; the filter's additions removed from app3.js → both filter checks fail.
   Run: node tests/no-gender-identity.cjs                                                        */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const some = (a) => (a.length ? ' — ' + a.slice(0, 10).join(' ') + (a.length > 10 ? ' …(' + a.length + ')' : '') : '');

const GONE = ['agendered', 'ambigender', 'ambigendered', 'androgynously', 'antigender', 'antitranssexual', 'bigender', 'bigendered',
  'cissexual', 'cissexuality', 'genderfluid', 'intergender', 'kathoey', 'multigender', 'multigendered', 'nonfemale', 'nongender',
  'nongendered', 'nontransgender', 'nontransgendered', 'nontranssexual', 'postgenderism', 'sexship', 'transfeminism', 'transfolk',
  'transgender', 'transgenderism', 'transman', 'transsexual', 'transsexuality', 'transsexuals', 'transwoman', 'ungender', 'ungendered',
  'transvestite', 'transvestites', 'omnisexual', 'omnisexuality', 'nonheteronormative'];
const ORIENT = ['gayville', 'polari', 'antihomophobic', 'antihomosexual', 'antihomosexuality', 'antilesbian', 'bisexual', 'bisexuality',
  'bisexuals', 'gaybait', 'gayborhood', 'gayby', 'gaydar', 'gaydom', 'gayish', 'gaymer', 'gayness', 'gaynesses', 'gays', 'gaysian', 'gaytopia',
  'heteronormative', 'heteronormatively', 'heteropatriarchy', 'heterosexual', 'heterosexualist', 'heterosexuality', 'heterosexually',
  'heterosexualness', 'heterosexuals', 'homonationalism', 'homonormative', 'homonormatively', 'homophile', 'homophobia', 'homophobic',
  'homosexual', 'homosexuality', 'homosexuals', 'lesbian', 'lesbianhood', 'lesbianic', 'lesbianish', 'lesbianism', 'lesbianization',
  'lesbianize', 'lesbianness', 'lesbians', 'lesbianship', 'lesbigay', 'nongay', 'nonheterosexual', 'nonhomophobic', 'nonhomosexual',
  'nonlesbian', 'nonqueer', 'queers', 'yestergay', 'celesbian', 'nonbisexual'];
GONE.push(...ORIENT);
const GONE_SET = new Set(GONE);
/* the MEANING, wherever it is written */
const TEXT = /transgender|transsexual|transvestit|cisgender|cissexual|genderqueer|genderfluid|\bbigender|\bagender|gender identit|gender expression|gender dysphoria|gender reassignment|sex reassignment|assigned (?:male |female )?at birth|(?:recorded|assigned) for (?:them|him|her) at birth|\bnon-?binary\b|\btrans (?:wom[ae]n|m[ae]n|people|person|kids?|students?|athletes?)\b|\bmisgender|\bdeadnam/i;
const TEXT_O = /homosexual|lesbian|\bbisexual|heterosexual|homophob|\bLGBT|sexual orientation|\bgay (?:men|man|woman|women|people|couple|priest|rights|community|and lesbian|marriage)\b|openly gay|same-sex (?:couple|marriage|partner)|attracted to people of the same sex|one's homosexuality/i;
const MEANS = (s) => TEXT.test(s) || TEXT_O.test(s);
const TRANS = 'across, beyond or through; on the far side of something';
const SPARE = ['gender', 'genders', 'transition', 'transitioning', 'transatlantic', 'transfer', 'transport', 'transmit', 'transept',
  'transistor', 'transshipment', 'engender', 'engendered', 'androgynous', 'androgyny', 'agenda', 'binary', 'pronoun', 'trans', 'cisalpine',
  'gay', 'gayer', 'gaily', 'gaiety', 'straight', 'queer', 'queerly', 'asexual', 'ambisexual', 'sapphic', 'sappho', 'Lesbos', 'homophone', 'homophilous', 'pouf', 'dike'];

const ctx = { console: { log() {}, warn() {}, error() {} } }; ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx;
const trivia = []; ctx.SB_TRIVIA = { _add: (lv, a) => trivia.push(...a) };
vm.createContext(ctx);
const run = (f) => { const p = path.join(ROOT, f); if (!fs.existsSync(p)) return false; vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f }); return true; };
['words-data.js', 'words-data-2.js', 'words-data-s.js', 'words-full.js', 'words-hard.js', 'words-lore.js', 'word-synonyms.js', 'word-alternates.js',
  'voice-words.js', 'voice-french.js', 'nsf-vocab26-data.js', 'trivia-q1.js', 'trivia-q2.js', 'trivia-q3.js', 'trivia-q4.js', 'trivia-q5.js'].forEach(run);

/* 1. every word record, in every store */
const full = typeof ctx.SB_FULL === 'string' ? JSON.parse(ctx.SB_FULL) : (ctx.SB_FULL || []);
let hard = ctx.SB_HARD || []; if (typeof hard === 'string') hard = JSON.parse(hard);
const recs = [];
for (const [src, arr] of [['shards', (ctx.SB_DATA || {}).nsf || []], ['library', full], ['championship', Array.isArray(hard) ? hard : []], ['vocab26', (ctx.SB_VOCAB26 || {}).words || []]])
  for (const r of arr) if (r && r.w) recs.push([src, r]);
ok(recs.length > 100000, `read ${recs.length} word records from the shards, the library, the championship shard and vocab26`);
const heads = recs.filter(([, r]) => GONE_SET.has(r.w.toLowerCase())).map(([s, r]) => s + ':' + r.w);
ok(!heads.length, 'none of the deleted words is a headword in any store' + some(heads));
const texts = recs.filter(([, r]) => ['w', 'd', 's', 'm', 'h', 'n'].some((f) => typeof r[f] === 'string' && MEANS(r[f]))).map(([s, r]) => s + ':' + r.w);
ok(!texts.length, 'no word, definition or example sentence carries a gender-identity or sexual-orientation meaning' + some(texts));
const sents = (ctx.SB_SENT_BOOT || []).filter((p) => GONE_SET.has(String(p[0]).toLowerCase()) || MEANS(p[1] || '')).map((p) => p[0]);
ok(ctx.SB_SENT_BOOT && !sents.length, 'the boot sentence file holds none of them' + some(sents));

/* 2. the stores keyed on words */
for (const [name, o] of [['lore', ctx.SB_LORE], ['synonyms', ctx.SB_SYN], ['alternates', ctx.SB_ALT]]) {
  const bad = Object.keys(o || {}).filter((k) => GONE_SET.has(k.toLowerCase()) || MEANS(JSON.stringify(o[k])) || (name === 'synonyms' && (o[k] || []).some((x) => GONE_SET.has(String(x).toLowerCase()))));
  ok(o && !bad.length, `${name}: no entry for them, none offering one, none carrying the meaning` + some(bad));
}
for (const [name, v] of [['voice index', ctx.SB_WVOICE], ['French voice list', ctx.SB_VOICE_FRENCH]]) {
  const keys = new Set(String(v || '').split('|')); const bad = GONE.filter((w) => keys.has(w));
  ok(keys.size > 100 && !bad.length, `the ${name} lists none of them` + some(bad));
}
let clips = null; try { clips = cp.execSync('git ls-files voice/w', { cwd: ROOT, maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] }).toString().split('\n'); } catch (e) {}
if (clips && clips.length > 1000) { const c = clips.filter((f) => GONE_SET.has(path.basename(f, '.mp3').toLowerCase())); ok(!c.length, 'no recorded clip of them is in the repo' + some(c)); }
else console.log('  skip clips: no git index here (a deploy tree)');

/* 3. the text of everything else the app or the books print: quiz banks, quotes, idioms, lessons, chapters,
   Atlas pools, sounds, themes, the feed's cards, the book chapter files */
const tq = trivia.filter((q) => MEANS(JSON.stringify(q))).map((q) => q.id);
ok(trivia.length > 10000 && !tq.length, `no trivia question, choice or fact carries the meaning (${trivia.length} read)` + some(tq));
const QUOTED = new RegExp('"(' + GONE.join('|') + ')"', 'i');
const TEXTALL = new RegExp(TEXT.source + '|' + TEXT_O.source, 'i');
const files = fs.readdirSync(ROOT).filter((f) => /\.js$/.test(f) && !/^(app3|words-patch|words-data|words-data-2|words-data-s|words-full|words-hard|words-lore|word-synonyms|word-alternates|voice-words|voice-french|trivia-q\d)\.js$/.test(f))
  .concat(fs.existsSync(path.join(ROOT, 'feed')) ? fs.readdirSync(path.join(ROOT, 'feed')).filter((f) => /\.js$/.test(f)).map((f) => 'feed/' + f) : [])
  .concat(fs.existsSync(path.join(ROOT, 'books')) ? fs.readdirSync(path.join(ROOT, 'books')).filter((f) => /-chapters\.js$|trivia-rounds\.js$/.test(f)).map((f) => 'books/' + f) : []);
const bad = [];
for (const f of files) { const t = fs.readFileSync(path.join(ROOT, f), 'utf8'); const m = t.match(TEXTALL) || t.match(QUOTED); if (m) bad.push(f + ' (' + m[0].slice(0, 30) + ')'); }
ok(files.length > 40 && !bad.length, `no other shipped file, feed card or book chapter names one or carries the meaning (${files.length} files)` + some(bad));

/* 4. trans keeps its first sense, the same in both banks */
const byW = (src) => recs.filter(([s, r]) => s === src && r.w === 'trans').map(([, r]) => r.d);
const st = byW('shards'), lt = byW('library');
ok(st.length === 1 && lt.length === 1 && st[0] === TRANS && lt[0] === TRANS, `trans is served and kept, meaning only "${TRANS}" (shards: ${JSON.stringify(st[0] || null).slice(0, 70)}; library: ${JSON.stringify(lt[0] || null).slice(0, 70)})`);
const patch = fs.readFileSync(path.join(ROOT, 'words-patch.js'), 'utf8'), app3 = fs.readFileSync(path.join(ROOT, 'app3.js'), 'utf8');
ok(patch.includes('trans: "' + TRANS + '"') && app3.includes('trans: "' + TRANS + '"'), 'words-patch DEF and app3 CORE_FIX serve the same meaning for trans');

/* 4b. the words kept for their everyday sense carry only it — at rest, and in words-patch DEF, which wins at boot */
const KEPT = { gay: /cheerful/, straight: /without a bend/, queer: /^strange, odd/, pouf: /footstool/, poufs: /footstools/, dike: /hold back water/ };
const keptBad = [];
for (const [w, want] of Object.entries(KEPT)) for (const [src, r] of recs.filter(([, x]) => x.w === w)) if (!want.test(r.d || '') || MEANS(r.d || '') || /offensive term/i.test(r.d || '')) keptBad.push(src + ':' + w + ' "' + String(r.d).slice(0, 40) + '"');
const defGay = (patch.match(/\n\s*gay: "([^"]*)"/) || [])[1];
if (defGay != null && (MEANS(defGay) || !/cheerful/.test(defGay))) keptBad.push('words-patch DEF gay "' + defGay + '"');
if (/\n\s*homosexual: "/.test(patch)) keptBad.push('words-patch DEF still defines homosexual');
ok(!keptBad.length, 'gay, straight, queer, pouf(s) and dike keep only their everyday senses' + some(keptBad));
const exc = recs.filter(([, r]) => /^excommunicated?$/.test(r.w) && /gay|partner/i.test(r.s || '')).map(([s, r]) => s + ':' + r.w);
ok(!exc.length, 'excommunicate(d) no longer carry the "gay priest" sentence' + some(exc));

/* 5. the library filter: it refuses the family by headword AND by definition, and spares the innocent */
const m = app3.match(/SB_UNSAFE_RE=(\/(?:\\.|[^\/\n])+\/[a-z]*)/);
const RE = m && vm.runInNewContext(m[1]);
const FAMILY = ['homosexual', 'homosexuals', 'lesbian', 'lesbians', 'bisexual', 'heterosexual', 'homophobia', 'homophobic', 'gaydar', 'gayborhood', 'lesbigay', 'gays', 'transgender', 'transgendered', 'transsexual', 'transsexuals', 'transvestite', 'cisgender', 'cissexual', 'genderqueer',
  'genderfluid', 'bigender', 'agender', 'nonbinary', 'non-binary', 'transwoman', 'transman', 'transwomen', 'kathoey'];
const missed = RE ? FAMILY.filter((w) => !RE.test(w)) : ['no regex'];
ok(RE && !missed.length, 'SB_UNSAFE_RE refuses the family by headword' + (missed.length ? ' — misses ' + missed.join(' ') : ''));
const DEFS = ['a person whose gender identity differs from the sex they were assigned at birth', 'assigned male at birth',
  'people who live as a gender different from the one recorded for them at birth', 'a feeling of gender dysphoria',
  'a person who is sexually attracted to both sexes (bisexual)', 'prejudice against homosexual people', 'a sexual orientation'];
const dmiss = RE ? DEFS.filter((d) => !RE.test(d)) : ['no regex'];
ok(RE && !dmiss.length, 'SB_UNSAFE_RE refuses a word whose DEFINITION carries the meaning' + some(dmiss));
const hurt = RE ? SPARE.filter((w) => RE.test(w)) : ['no regex'];
ok(!hurt.length, 'SB_UNSAFE_RE spares ' + SPARE.join(', ') + (hurt.length ? ' — but refuses ' + hurt.join(' ') : ''));
const cs = app3.slice(app3.indexOf('const CORE_STRIKE = new Set(['), app3.indexOf(']);', app3.indexOf('const CORE_STRIKE = new Set([')));
const notStruck = GONE.filter((w) => !cs.includes("'" + w + "'"));
ok(!notStruck.length, 'CORE_STRIKE names every deleted word, so a later corpus import cannot serve one' + some(notStruck));

console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
