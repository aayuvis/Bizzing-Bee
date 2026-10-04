#!/usr/bin/env node
/* clean-glosses.cjs — three MECHANICAL faults in the served definitions, fixed at rest without
   rewriting a single meaning (audit v4, H3/E10: "Raw WordNet everywhere else").

   1. WordNet's quote marks. It writes `of' for ‘of’, so a card read "(`comfy' is informal)".
      Every pair becomes curly quotes; a backtick that is not half of a pair is left and counted.
   2. A leading "(domain)" label — "(law) a person who…", "(usually plural) …". A field of study, a
      faith, a place or an era becomes plain words in front: "in law, a person who…", "in Judaism,
      …", "in the Middle Ages, …" — the label is CONTEXT the meaning needs (a "(baseball) hit" is not
      any hit), so it is kept, only moved out of the brackets. Any other label (a usage note, "of
      soil", "often followed by ‘of’") goes to the END in its brackets, so the gloss opens on the
      meaning. A gloss whose remainder does not open on a word is left alone and listed.
   3. A gloss that opens "is …" / "are …" — a sentence with its subject cut off ("is an outfit…").
      The verb goes when what follows reads as a definition ("an outfit…", "to grind…", "having…");
      where it would not ("is called the river horse…", "is used as a sedative…") it is left and listed.

   4. A quotation's credit with the quotation gone: "having little emotion; - Nordhoff & Hall",
      "in truth; certainly; - Ps 37:3". WordNet printed an example and its source; the example was
      dropped and the "; - Source" tail was left behind. The tail goes.

   Over the served shards (words-data.js, words-data-2.js) — the records a child is set, searched
   and shown — the free course's chapter word meanings (concepts-data.js) and the options of the
   word-meaning trivia questions (trivia-words.js), each of which is some word's gloss. Idempotent: a
   second run changes nothing. The guard is tests/gloss-clean.cjs.
   Run: node tools/clean-glosses.cjs [--dry] [--list]                                            */
'use strict';
const { open } = require('./word-stores.cjs');
const DRY = process.argv.includes('--dry'), LIST = process.argv.includes('--list');

/* a field, faith, art or study: "(law) X" → "in law, X" */
const FIELD = new Set(('law|baseball|Judaism|anatomy|music|biology|Islam|mathematics|chemistry|botany|medicine|sports|folklore|' +
  'physics|computer science|philosophy|genetics|statistics|astronomy|geology|architecture|logic|meteorology|American football|' +
  'psychology|geometry|football|physiology|linguistics|Hinduism|ophthalmology|golf|ballet|electronics|boxing|astrology|psychiatry|' +
  'physics and chemistry|Jewish folklore|dentistry|economics|biochemistry|Christianity|criminal law|anthropology|theology|fencing|' +
  'microbiology|heraldry|Hinduism and Buddhism|surgery|Irish folklore|prosody|Italian cuisine|psychoanalysis|mineralogy|archeology|' +
  'rhetoric|Scottish folklore|polo|cricket|photography|rugby|grammar|chess|poker|poetry|mountaineering|Christian theology|' +
  'neuroscience|pharmacology|paleontology|pathology|ecology|art|communication theory|sociology|Scandinavian folklore|accounting|' +
  'horseshoes|embryology|German mythology|European mythology|film|ethics|histology|mythology|virology|Jungian psychology|' +
  'spiritualism|Zen Buddhism|Zoroastrianism|phonology|cosmology|bridge|plate tectonics|digital communication|dressage|radiology|' +
  'ornithology|sport|India|ancient Rome|ancient Greece|writing').split('|'));
/* the same, but English wants "the": "(Middle Ages) X" → "in the Middle Ages, X" */
const FIELD_THE = new Set(['military', 'Middle Ages', 'Roman Catholic Church', 'Roman Catholic and Eastern Orthodox Church',
  'West Indies', 'United Kingdom', '19th century']);
/* labels that already say "in …" */
const IN_ALREADY = /^in (India|India and Malaysia|various countries)$/;
/* left exactly as they are, for a person: levantine's gloss is "(formerly) a native or inhabitant
   of the Levant" — a people named as such, which data-lint's proper-noun rule refuses once the label
   stops hiding it from that rule's ^-anchored patterns. Whether the word goes (the proper-noun
   cleanup) or takes its fabric sense is an editorial call, not a mechanical one. */
const LEAVE = new Set(['levantine']);
/* after "is"/"are", these do not open a definition */
const IS_KEEP = new Set(['called', 'used', 'sometimes', 'as', 'on', 'also', 'when', 'where', 'what', 'how', 'for', 'by', 'at']);

const fixQuotes = (d) => d.replace(/`([^`'\n]{1,60})'/g, '‘$1’');
const CREDIT = /(?:;\s*)+-\s*[A-Z][^;]*$/;          // "; - John Milton", "; ; -Dr. Johnson"
const CREDIT_MID = /;\s*-\s*[A-Z][^;()]*(?=;)/g;     // "wordy; -T.S.Eliot; (‘ambagious’ is archaic)"
const fixCredit = (d) => { let o = d.replace(CREDIT_MID, ''); while (CREDIT.test(o)) o = o.replace(CREDIT, '').trim(); return o; };
function fixLabel(d) {
  const m = d.match(/^\s*\(([^()]{1,90})\)\s*(.*)$/);
  if (!m) return null;
  const lab = m[1].trim(), rest = m[2].trim();
  if (rest.length < 3 || !/^[A-Za-z‘]/.test(rest)) return null;             // nothing that reads as a meaning follows
  if (FIELD.has(lab)) return 'in ' + lab + ', ' + rest;
  if (FIELD_THE.has(lab)) return 'in the ' + lab + ', ' + rest;
  if (IN_ALREADY.test(lab)) return lab + ', ' + rest;
  const end = rest.match(/[.;]\s*$/);                                         // the note goes before a closing stop
  return end ? rest.slice(0, end.index) + ' (' + lab + ')' + end[0].trim() : rest + ' (' + lab + ')';
}
function fixIs(d) {
  const m = d.match(/^\s*(is|are)\s+(\S+)(.*)$/i);
  if (!m) return null;
  if (IS_KEEP.has(m[2].toLowerCase())) return null;
  return (m[2] + m[3]).trim();
}

/* the gloss stores this runs over. Each yields [record, field, its headword] for every gloss in it. */
const TARGETS = [
  /* the served shards: the records a child is set, searched and shown */
  { name: 'served shards (words-data.js, words-data-2.js)', files: ['words-data.js', 'words-data-2.js'],
    each: (o, fn) => { for (const a of o.records()) for (const r of a) if (r && typeof r.d === 'string') fn(r, 'd', r.w); } },
  /* the free course's chapter words: the meaning a lesson card and the "Meet the words" step show */
  { name: 'chapter word meanings (concepts-data.js)', files: ['concepts-data.js'],
    each: (o, fn) => { for (const ch of o.get('SB_CONCEPTS').chapters) for (const x of ch.words || []) if (x && typeof x.def === 'string') fn(x, 'def', x.w); } },
  /* the word-meaning questions: every option is some word's gloss, cut from the corpus */
  { name: 'trivia meaning options (trivia-words.js)', files: ['trivia-words.js'],
    each: (o, fn) => { for (const a of o.records()) for (const q of a) if (q && q.th === 'wmeaning' && Array.isArray(q.c)) q.c.forEach((_, i) => fn(q.c, i, null)); } },
];
const saves = [];
for (const T of TARGETS) {
  const before = { label: 0, is: 0, tick: 0, credit: 0 }, after = { label: 0, is: 0, tick: 0, credit: 0 }, changed = { quotes: 0, label: 0, is: 0, credit: 0 }, left = { label: [], is: [] };
  const count = (o, d) => { if (/^\s*\(/.test(d)) o.label++; if (/^\s*(is|are)\s/i.test(d)) o.is++; if (/`/.test(d)) o.tick++; if (/;\s*-\s*[A-Z]/.test(d)) o.credit++; };
  for (const f of T.files) {
    const o = open(f);
    T.each(o, (rec, k, w) => {
      let d = rec[k]; count(before, d);
      if (w && LEAVE.has(String(w).toLowerCase())) { count(after, d); return; }
      const q = fixQuotes(d); if (q !== d) { d = q; changed.quotes++; }
      const c = fixCredit(d); if (c !== d && c.length >= 3) { d = c; changed.credit++; }
      const l = fixLabel(d); if (l != null) { d = l; changed.label++; } else if (/^\s*\(/.test(d)) left.label.push((w || '') + ' — ' + d);
      const i = fixIs(d); if (i != null) { d = i; changed.is++; } else if (/^\s*(is|are)\s/i.test(d)) left.is.push((w || '') + ' — ' + d);
      count(after, d);
      if (d !== rec[k]) rec[k] = d;
    });
    saves.push(o);
  }
  console.log((DRY ? '[dry] ' : '') + 'clean-glosses — ' + T.name + ':');
  console.log('  opens with a (label):  ' + before.label + ' → ' + after.label + '   (' + changed.label + ' moved into words)');
  console.log('  opens with is/are:     ' + before.is + ' → ' + after.is + '   (' + changed.is + ' trimmed)');
  console.log('  carries a backtick:    ' + before.tick + ' → ' + after.tick + '   (' + changed.quotes + ' re-quoted)');
  console.log('  ends on a lost credit: ' + before.credit + ' → ' + after.credit + '   (' + changed.credit + ' tails cut)');
  if (LIST) { console.log('  left as they were — a (label):'); left.label.forEach((x) => console.log('    ' + x)); console.log('  left as they were — is/are:'); left.is.forEach((x) => console.log('    ' + x)); }
}
/* a meaning question must still have four different options after cleaning */
for (const o of saves) if (o.file === 'trivia-words.js') for (const a of o.records()) for (const q of a)
  if (q && q.th === 'wmeaning' && new Set(q.c.map((x) => x.toLowerCase())).size !== q.c.length) throw new Error('cleaning made two options of ' + q.id + ' the same');
if (!DRY) saves.forEach((o) => o.save());
