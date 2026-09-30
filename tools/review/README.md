# tools/review — the calls that need a person

`bands-and-tags.cjs` lays out the three parts of the List Builder that are
**judgement, not arithmetic**, so someone who has run a spelling bee can argue
with them:

1. the five **difficulty band labels** (Gentle → Brutal), against the words that
   actually land in each band;
2. the five **bee-probability labels** (Long shot → Bee staple), likewise;
3. the eleven **tag groups** and eleven **origin families** — roughly 450 hand
   assignments — and, more usefully, **what landed nowhere**. A tag in no group is
   invisible in the filter rail: the words carry it and nothing can select them.

```
node tools/review/bands-and-tags.cjs     →  tools/review/build/review.html
```

It computes against the **real library in a real browser**, because the corpus is
sharded and lazy and `spellDiff` is computed at runtime — there is nothing useful
to read out of a file.

Two things it had to learn the hard way, both worth knowing before writing another
tool like it:

- **`fullWords()` is the accessor, not `wordDB()`.** The latter returns a keyed map
  and reads as an empty array if you ask it for a length.
- **`B2_DIFF` and friends are top-level `const` in app3.js**, so they live in the
  script's lexical scope and are NOT on `window` — the same trap CLAUDE.md records
  for `app`. A bare identifier inside `page.evaluate` resolves; `window.B2_DIFF` is
  `undefined`, silently.

`build/` is generated and gitignored. Re-run after any change to `B2_DIFF`,
`B2_ODDS`, `B2_TAGGRP` or `B2_ORIGRP`.
