/* Turn eponyms-master.json into (a) trivia questions for the `eponyms` theme and
   (b) a patch list for the spelling library. Re-run after every batch of new
   entries — it is idempotent and derives everything from the master file.

   Question shape matches the rest of the bank: {th,lv,ty,q,c:[...],f} with c[0]
   always correct (the UI shuffles). `f` carries the origin story, which is the
   whole point of the chapter.

   Usage:  node eponyms/build-eponyms.js            (writes out-eponyms.json)
           node eponyms/build-eponyms.js --report   (counts only, writes nothing) */
const fs = require('fs');
const path = require('path');
const DIR = __dirname;

const master = JSON.parse(fs.readFileSync(path.join(DIR, 'eponyms-master.json'), 'utf8'));
const ready = master.filter(m => m.story && m.lv && !m.skip);

const norm = s => String(s || '').trim();
const bare = s => norm(s).replace(/\s*\([^)]*\)\s*/g, '').trim();   // drop "(1820-1890)"
const lower = s => norm(s).toLowerCase();

/* ---- distractor pools -------------------------------------------------------
   Same category first, then same level, then anywhere. Never returns a value
   equal (case-insensitively) to the right answer or to another distractor. */
function pick(n, right, all, seedIdx) {
  const out = [], used = new Set([lower(right)]);
  let i = 0;
  for (const cand of all) {
    if (out.length >= n) break;
    const v = norm(cand);
    if (!v || used.has(lower(v))) continue;
    if (i++ < seedIdx % Math.max(1, all.length - n)) continue;   // vary across questions
    used.add(lower(v)); out.push(v);
  }
  for (const cand of all) {                                       // top up if starved
    if (out.length >= n) break;
    const v = norm(cand);
    if (!v || used.has(lower(v))) continue;
    used.add(lower(v)); out.push(v);
  }
  return out.length === n ? out : null;
}

function poolsFor(m, idx) {
  const sameCat = ready.filter(x => x.cat === m.cat && x.e !== m.e);
  const sameLv = ready.filter(x => x.lv === m.lv && x.e !== m.e);
  const any = ready.filter(x => x.e !== m.e);
  const order = [...sameCat, ...sameLv, ...any];
  return {
    words: pick(3, m.e, order.map(x => x.e), idx),
    srcs: pick(3, bare(m.src), order.map(x => bare(x.src)), idx + 7),
    means: pick(3, m.mean, order.map(x => x.mean), idx + 13),
  };
}

const Q = [];
let dropped = { dup: 0, leak: 0, thin: 0 };
/* A clue that contains its own answer is worthless, and it happens constantly
   here because so many eponyms ARE the person's surname (Babbitt, Medusa,
   Cassandra). Check every mc before keeping it. */
const leaks = (q, ans) => new RegExp(`\\b${ans.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i').test(q);
const add = (m, ty, q, c, extra) => {
  if (!c || c.some(x => !norm(x))) { dropped.thin++; return; }
  const seen = new Set(c.map(lower));
  if (seen.size !== c.length) { dropped.dup++; return; }           // duplicate option
  if (ty === 'mc' && leaks(q, c[0])) { dropped.leak++; return; }   // answer visible in clue
  Q.push(Object.assign({ th: 'eponyms', lv: m.lv, ty, q, c, f: m.story }, extra || {}));
};

/* Mastermind house style: describe the source by ROLE, never by name — "the Greek
   goddess of retribution", not "Nemesis". Naming the source gives the answer away
   whenever the eponym is the surname, which is most of this bank. */
const ARTICLED = /^(the|a|an|his|her|its|one|two|three|first|last)\b/i;
const PROPER = /^[A-Z][a-z]+ [A-Z]/;                    // "Mary Magdalene" — no article
/* Nationality and other proper adjectives keep their capital mid-sentence.
   Without this you get "comes from an english philosopher". */
const PROPER_ADJ = new Set(('English French German Greek Roman Italian Spanish Dutch Swedish '
  + 'Scottish Irish Welsh Athenian Spartan Byzantine Norse Trojan Cherokee American Austrian '
  + 'Russian Czech Flemish Danish Swiss Belgian Hungarian Persian Egyptian Phoenician Cretan '
  + 'Theban Chinese Japanese Indian Portuguese Polish Norwegian Finnish Turkish Arabic Hebrew '
  + 'Frankish Anglo-Saxon Tupi Malay Lenape Bohemian Sicilian Genoese Venetian Prussian Moorish '
  + 'Israelite Babylonian Assyrian Macedonian Lydian Illyrian Mycenaean Carthaginian Gaulish '
  + 'Bengali Cuban Mexican Brazilian Argentine Canadian Australian Soviet Ottoman Tuscan Neapolitan'
).split(' '));
const deCap = w => {
  const first = w.split(/[\s,\-]/)[0];
  return PROPER_ADJ.has(first) || /^[A-Z]{2,}/.test(first) ? w : w.charAt(0).toLowerCase() + w.slice(1);
};
const withArticle = w => {
  if (!w) return '';
  if (ARTICLED.test(w) || PROPER.test(w)) return w;
  return (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;
};
/* `why` sometimes ends in "?" or "!" — stripping only "." leaves "number?." */
const stripEnd = s => norm(s).replace(/[.?!;:,\s]+$/, '');
/* "A skin-tight garment worn by dancers" -> "a skin-tight garment worn by dancers" */
const shortMean = s => {
  let v = stripEnd(norm(s).split(/;|,\s+(?:also|or)\b/)[0]);
  return v.charAt(0).toLowerCase() + v.slice(1);
};

ready.forEach((m, idx) => {
  const p = poolsFor(m, idx);
  const who = bare(m.who);
  const src = bare(m.src);
  const role = withArticle(deCap(who));
  const noun = /\s/.test(m.e) ? 'name or term' : 'word';

  // 1. THE core Mastermind shape: meaning + role, source never named.
  if (p.words && who) add(m, 'mc', `Which ${noun} meaning "${shortMean(m.mean)}" comes from ${role}?`, [m.e, ...p.words]);

  // 2. word -> source.
  if (p.srcs) add(m, 'mc', `The word "${m.e}" is named after…?`, [src, ...p.srcs]);

  // 3. word -> meaning.  Skip at lv1-2 where the meaning is often obvious.
  if (p.means && m.lv >= 3) add(m, 'mc', `What does "${m.e}" mean?`, [m.mean, ...p.means]);

  // 4. person-or-place true/false, only where `kind` is known and unambiguous.
  if (m.kind === 'person' || m.kind === 'place') {
    const claim = idx % 2 === 0;                                   // alternate polarity
    const asks = claim ? 'a place' : 'a person';
    const truth = claim ? (m.kind === 'place') : (m.kind === 'person');
    add(m, 'tf', `"${m.e}" is named after ${asks}.`, truth ? ['True', 'False'] : ['False', 'True']);
  }

  // 5. breadcrumb at lv4-5: two independently true clues, hardest first, and the
  //    famous fact withheld for `f` per the house style in CLAUDE.md.
  if (m.lv >= 4 && p.words && who) {
    const why = stripEnd(m.why);
    const clue = `There was ${role}. ${why.charAt(0).toUpperCase() + why.slice(1)}. Which ${noun} grew out of it?`;
    add(m, 'mc', clue, [m.e, ...p.words]);
  }
});

/* ---- spelling-library patch -------------------------------------------------
   Single-token, alphabetic eponyms only — the library is one word per record. */
const single = ready.filter(m => /^[A-Za-z][A-Za-z'-]*$/.test(m.e));
const patch = single.map(m => ({
  w: m.e.toLowerCase(), mean: m.mean, story: m.story, cat: m.cat, lv: m.lv, src: bare(m.src),
}));

if (process.argv.includes('--report')) {
  const byLv = {}; Q.forEach(q => byLv[q.lv] = (byLv[q.lv] || 0) + 1);
  const byTy = {}; Q.forEach(q => byTy[q.ty] = (byTy[q.ty] || 0) + 1);
  console.log('master entries      :', master.length);
  console.log('story+lv ready      :', ready.length);
  console.log('questions generated :', Q.length, JSON.stringify(byLv), JSON.stringify(byTy));
  console.log('library candidates  :', patch.length);
  console.log('dropped             :', JSON.stringify(dropped));
} else {
  fs.writeFileSync(path.join(DIR, 'out-eponyms.json'), JSON.stringify(Q, null, 0));
  fs.writeFileSync(path.join(DIR, 'library-patch.json'), JSON.stringify(patch, null, 0));
  console.log('wrote out-eponyms.json:', Q.length, 'questions');
  console.log('wrote library-patch.json:', patch.length, 'words');
}
