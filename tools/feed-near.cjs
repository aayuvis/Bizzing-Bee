/* feed-near.cjs — "no two cards say ≥ 80% the same words" (owner, 2 Oct 2026), one function for
   tools/build-feed.cjs (which drops the later card of a near pair) and tests/feed-content.cjs
   (which requires none to be left).

   What a card SAYS is its title, body, example and question with its options. Similarity is the
   words two cards share over the words of the longer one (case and punctuation ignored, each word
   counted once), so a short card cannot hide inside a long one and a long one cannot be repeated
   with a word changed. Candidate pairs are those sharing one of each card's six rarest words —
   two cards that agree on 80% of their words agree on those. */
'use strict';
const textOf = (it) => [it.title, it.body, it.source, it.play && it.play.q, it.play && it.play.opts.join(' ')].filter(Boolean).join(' ');
const toks = (s) => [...new Set(String(s).toLowerCase().match(/[a-z0-9]+/g) || [])];
const LIMIT = 0.8;
function nearDup(list) {
  const T = list.map((it) => toks(textOf(it))), df = {};
  T.forEach((t) => t.forEach((w) => { df[w] = (df[w] || 0) + 1; }));
  const buckets = {}, drop = new Set(), pairs = [];
  T.forEach((t, i) => {
    const rare = t.slice().sort((x, y) => df[x] - df[y] || (x < y ? -1 : 1)).slice(0, 6);
    const cand = new Set(); rare.forEach((w) => (buckets[w] || []).forEach((j) => cand.add(j)));
    for (const j of cand) {
      const B = new Set(T[j]); let inter = 0; t.forEach((w) => { if (B.has(w)) inter++; });
      if (inter / Math.max(t.length, B.size) >= LIMIT) { drop.add(i); pairs.push([list[j].id, list[i].id]); break; }
    }
    if (!drop.has(i)) rare.forEach((w) => (buckets[w] = buckets[w] || []).push(i));
  });
  return { drop, pairs };
}
module.exports = { textOf, toks, nearDup, LIMIT };
