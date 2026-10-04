/* NO RAW WORDNET ON A CARD (audit v4, H3/E10: "1,193 of 53,705 served definitions start with a
   (domain) label and 221 with 'is …'") — @check

   tools/clean-glosses.cjs fixed four mechanical faults in the served shards at rest, without
   changing a meaning: a leading "(law)" label became "in law, …" (or moved to the end, for a usage
   note), the cut-off "is …" opening went where what follows reads as a definition, WordNet's `of'
   quote marks became ‘of’, and a lost quotation credit ("…; - Morris Fishbein") was cut. This holds
   the result against SB_DATA AS THE PAGE BUILDS IT (words-patch.js run, through tools/feed-corpus),
   and against words-patch.js's own SB_GLOSS_OK, the check My Feed and the word of the hour use.
   It is a RATCHET: the five "is …" glosses no mechanical fix reads well for (burns, codeine,
   hippopotamus, vanilla, poinsettia) wait for a person, and so does levantine, whose label hides a
   people named as such from data-lint's proper-noun rule; the ceilings may only fall.
   The chapter word meanings (concepts-data.js) and the trivia meaning options (trivia-words.js) were
   cleaned the same way and are held the same way, below.
   Proved by breaking (4 Oct 2026): the base commit's shards → four checks fail; a "(law)" put back
   on one gloss → the label check fails; the base commit's concepts-data.js / trivia-words.js → the
   chapter and trivia checks fail.
   Run: node tests/gloss-clean.cjs                                                              */
'use strict';
const path = require('path');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const GLOSS_MAX = 6, LABEL_MAX = 1;   // the five "is …" below, and levantine — left for a person (tools/clean-glosses.cjs LEAVE)

const C = require(path.join(ROOT, 'tools', 'feed-corpus.cjs')).load();
const D = C.DATA.filter((r) => r && typeof r.d === 'string');
const OK = C.win.SB_GLOSS_OK;
ok(D.length > 50000 && typeof OK === 'function', `read ${D.length} served glosses, and words-patch.js's SB_GLOSS_OK`);
const by = (re) => D.filter((r) => re.test(r.d)).map((r) => r.w);
const show = (a) => (a.length ? ' — ' + a.slice(0, 8).join(' ') : '');
let a;
a = by(/^\s*\(/); ok(a.length <= LABEL_MAX, `at most ${LABEL_MAX} gloss opens with a "(domain)" label (${a.length})` + show(a));
a = by(/`/); ok(a.length === 0, 'no gloss carries WordNet\'s `quote\' marks' + show(a));
a = by(/;\s*-\s*[A-Z]/); ok(a.length === 0, 'no gloss ends on a quotation\'s lost credit' + show(a));
a = by(/^\s*(is|are)\s/i); ok(a.length <= 5, `at most 5 glosses open "is …" (${a.length})` + show(a));
a = D.filter((r) => !OK(r.d)).map((r) => r.w); ok(a.length <= GLOSS_MAX, `at most ${GLOSS_MAX} fail SB_GLOSS_OK (${a.length})` + show(a));
/* the checker itself: each fault it exists to see, and a clean gloss */
ok(!OK('(law) a gift of property') && !OK('is an outfit for a bride') && !OK("comfortable (`comfy' is informal)") &&
   !OK('warding off; - Victor Schultze') && !OK('an elaborate public spectacle', 'spectacle') && OK('in law, a gift of personal property by will', 'bequest'),
   'SB_GLOSS_OK refuses each fault and passes a clean gloss');
/* what the fix wrote reads as it should: spot checks */
const g = (w) => (C.WORD[w] || {}).d || '';
ok(/^in law, /.test(g('bequest')) && /^in Judaism, /.test(g('mitsvah')) && /\(usually followed by ‘to’\)$/.test(g('averse')) && /^gruesome/.test(g('macabre')) &&
   /‘comfy’ is informal/.test(g('comfortable')) && g('verily') === 'in truth; certainly',
   'the label became words, the note moved to the end, "is" went, the quotes curled, the credit was cut');

/* the same four faults in the other two places a raw gloss reached a child: the free course's
   chapter word meanings (a lesson's "Meet the words" step and its feed card) and the options of the
   word-meaning trivia questions (each option is some word's gloss). One "is …" chapter gloss
   (vanilla) and 11 trivia options (codeine, hippopotamus, poinsettia, read as "is called/used …")
   wait for a person, as in the shards. Ratchets: the ceilings may only fall. */
const CH_MAX = 1, TQ_MAX = 11;
const fs = require('fs'), vm = require('vm');
const X = { console: { log() {} } }; X.window = X; X.SB_TRIVIA = { questions: [], themes: [], byLevel: {} }; vm.createContext(X);
for (const f of ['concepts-data.js', 'trivia-words.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), X, { filename: f });
const chDefs = X.SB_CONCEPTS.chapters.flatMap((ch) => (ch.words || []).filter((x) => typeof x.def === 'string' && x.def.trim()).map((x) => [x.w, x.def]));
a = chDefs.filter(([, d]) => !OK(d)).map(([w]) => w);
ok(chDefs.length > 1500 && a.length <= CH_MAX, `chapter word meanings: at most ${CH_MAX} of ${chDefs.length} fail the check (${a.length})` + show(a));
const opts = X.SB_TRIVIA.questions.filter((q) => q.th === 'wmeaning').flatMap((q) => q.c.map((o) => [q.id, o]));
a = opts.filter(([, o]) => !OK(o)).map(([id, o]) => id + ' ' + o.slice(0, 30));
ok(opts.length > 10000 && a.length <= TQ_MAX, `trivia meaning options: at most ${TQ_MAX} of ${opts.length} fail the check (${a.length})` + show(a));
ok(X.SB_TRIVIA.questions.filter((q) => q.th === 'wmeaning').every((q) => new Set(q.c.map((o) => o.toLowerCase())).size === q.c.length),
  'and every meaning question still has four different options');

console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
