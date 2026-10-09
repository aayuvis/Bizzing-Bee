# The analogy engine

Builds `A : B :: C : ?` items out of Bizzing Bee's own words. No outside lexicon, no outside word
vectors, no model at play time. It is the engine behind the proposed Analogies mode (Word Lore)
and the WordMasters meet plan; nothing in the app reads it yet.

```
node tools/analogy/run.cjs        # ~3 min cold (trains the word map), ~2.5 min warm
```

Writes `analogy-review/` — `stats.json` (every number below), `sample.json` + `index.html` (a
stratified sample for a person to judge) and `judged.json` (the verdicts). Like `forge-review/`
it is **never deployed** (both deploy scripts exclude it). The word-map cache lives in the system
temp folder, never in the app tree a deploy copies.

## The parts

| file | does | built from |
|---|---|---|
| `data.cjs` | the only door into the word stores; drops struck, unsafe, people and places | words-full, word-synonyms, word-alternates, words-lore |
| `lex.cjs` | lemmas, inflections (incl. past forms read off the gloss), the head noun of a phrase | the library's own parts of speech |
| `relations.cjs` | the relation table, each row with the rule and evidence that made it | definitions + the synonym file |
| `embed.cjs` | Bee's word map (skip-gram, 100-d) — **traps and distance only, never relations** | 4.6M tokens of Bee's own text |
| `compose.cjs` | cores, wrong answers by recipe, the single-answer check, stems, option order | all of the above |

**Relations** (13): synonym, antonym, degree, kind, part, material, function, cause, and the word
family (agent, action, quality, relating, able). Each is read from a definition pattern or the
synonym file, never typed. The one editorial table is `KID_CATS` — which categories a child can
name — and it holds no sacred category.

**Why the word map does not decide relations:** on Bee's own table the vector offset
(B − A + C) finds D at top-1 only **1–4%** of the time across all thirteen relations (top-5 ≤ 14%).
It knows that *cool* sits near *chilly, breezy, hot, humid* — which is exactly what makes a good
wrong answer, and exactly why it cannot say which of them is the right one.

**Wrong answers** come by recipe: `assoc` (what a child's ear pairs with C), `other` (tied to C by
a different relation), `sibling` (same category), `form` (D's family in the wrong part of
speech). The single-answer check refuses any option the table links to C by the stem's relation,
any synonym of D, any form of C or D, and any word that one of them is defined by.

**Levels** are Bee's own `y` (1–9): an item sits at the highest level of its words; stems are
level ≤ 3 and very common. Familiarity is counted in Bee's own text (`FAM`), so a level-9 word
must still be a word a child can meet.

## What it measures (see stats.json; numbers move with the library)

Built 9 Oct 2026 from 119,467 usable headwords → 54,762 relation rows → **15,019 cores** (a
core is one answer pair C → D with fair wrong answers; an item is a core plus a stem).

| Bee level | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | total |
|---|---|---|---|---|---|---|---|---|---|---|
| cores built | 376 | 1,839 | 1,968 | 3,490 | 3,250 | 1,621 | 1,607 | 692 | 176 | **15,019** |
| usable as built (review rates) | 245 | 1,192 | 1,286 | 2,289 | 2,129 | 1,058 | 1,049 | 452 | 113 | **~9,800** |
| usable after one wrong answer is swapped | 306 | 1,493 | 1,606 | 2,856 | 2,658 | 1,319 | 1,310 | 565 | 142 | **~12,300** |
| familiar base words that can be C | 55% | 55% | 54% | 50% | 46% | 39% | 29% | 25% | 17% | |

- **Confusing**: in 91% of cores the strongest associate is at least as close to C as the answer is.
- **Review** (`judged.json`, 171 items, stratified): 117 usable, 13 need one wrong answer swapped,
  41 wrong. By relation: word-family relations 89–93% (action, relating), function 90%, cause 75%,
  degree 73%, agent 72%, synonym 67% (83% with a swap), antonym 61%, kind and material 50%, part
  47%. The usable rows are the per-relation rates applied to each level's cores. Stems were judged
  apart from cores, and most need replacing (below).
- **Mix**: synonyms are 89% of cores; categories 7.5%; everything else 3.5%.
- Answer slots a–e come out 3,099 / 3,055 / 3,139 / 3,208 / 2,446 (e is short because some items
  have four options).
- A core takes any stem of its relation, so with ~30 reviewed stems each the engine can print a
  few hundred thousand distinct items. The honest unit is the core: that is the number of
  different things a child can be asked.

## What it cannot do yet

- **Everyday opposites and degree ladders are thin.** Bee's definitions rarely say "cold: not
  hot", and its levels put the un-/in-/dis- words at 8–9 because they spell late. The engine
  builds 139 antonym cores (~85 usable) and 20 degree cores. The contest leans on both, so these need a
  reviewed seed table (opposites, ladders like warm → hot → scorching, part–whole, function,
  characteristic, symbol), drafted offline and approved by a person.
- **Stems need a reviewed bank.** The engine's own stem choice is the weakest part of an item
  (EMIT : EMISSION for every action noun; SUB : SPLIT). ~30 reviewed stems per relation fixes
  every item at once, because a stem is reused across thousands of cores.
- **Synonyms are ~90% of the yield.** Fine for practice volume, wrong for contest balance; the
  meet plan should draw by relation, not by availability.
- Item difficulty cannot be learned from children (Bee promises no analytics): expert ratings and
  pilot parents' reported scores.
