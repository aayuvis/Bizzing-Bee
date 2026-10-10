/* root-leak.cjs — a ROOT question that gives its answer away (the 4.5 brief, P0.34, 10 Oct 2026).

   The audit played Word Lore's Roots and saw "Inside “triangle” sits the piece “angulus”. What does that
   piece mean?" with `angle` among the options — the answer printed inside the question. The feed's old
   leak check asked only whether the WHOLE answer sat in the prompt, and skipped the word-part questions
   altogether, so `capacity` under “incapacitated” / “capacitas”, `human` under “dehumanization” and
   `to know` under “knowledge” all passed it: a root is a Latin or Greek FORM of the answer, never the
   answer spelled out. The rule here is the stem:

     a root question (wroots: "built on the root…", wbreak: "sits the piece…", "break … into pieces")
     LEAKS when a content word of its right answer (four letters or more, not "that", "with"…) has its
     first five letters inside the word or root the prompt quotes — case-insensitive — and in none of the
     wrong options (a stem every option shares singles nothing out).

   Only the QUOTED part of the prompt is read: the template around it ("The word … is built on the root …
   What does that root mean?") would otherwise make `word` and `root` leak in every question.

   leak(q) → the leaking stem, or null. Used by tools/root-leaks.cjs (drops them from the bank),
   tools/build-feed.cjs (never cuts one into a card) and the tests (tests/root-leaks.cjs,
   tests/feed-content.cjs). The people-in-words themes (wstories, eponyms) are NOT root questions: a word
   named after Odysseus looks like Odysseus by design; that is a separate call, left to the owner. */
'use strict';
const THEMES = ['wroots', 'wbreak'];
const STOP = new Set(['that', 'this', 'with', 'from', 'which', 'what', 'have', 'having', 'been', 'into', 'used', 'made', 'make',
  'being', 'their', 'them', 'they', 'there', 'where', 'when', 'some', 'such', 'than', 'then', 'also', 'very', 'more', 'most',
  'other', 'each']);
const QUOTE = /[“"]([^”"]+)[”"]/g;
function quoted(text) { const out = []; let m; QUOTE.lastIndex = 0; while ((m = QUOTE.exec(String(text || '')))) out.push(m[1]); return out.join(' ').toLowerCase(); }
const stems = (answer) => (String(answer || '').toLowerCase().match(/[a-z]+/g) || []).filter((t) => t.length >= 4 && !STOP.has(t)).map((t) => t.slice(0, 5));
function leak(q) {
  if (!q || THEMES.indexOf(q.th) < 0 || !Array.isArray(q.c) || !q.c[0]) return null;
  const hay = quoted(q.q); if (!hay) return null;
  const wrong = q.c.slice(1).map((x) => String(x).toLowerCase());
  return stems(q.c[0]).find((s) => hay.includes(s) && !wrong.some((w) => w.includes(s))) || null;
}
module.exports = { leak, THEMES, stems, quoted };
