# Eponyms — work in progress

Goal: a 1,000-entry eponym bank feeding two things — an `eponyms` tag on the
spelling library, and a new trivia chapter where each card carries the word's
origin story.

## Where it stands

`eponyms-master.json` — **804 of 1,000 entries.** Every record has this shape:

```json
{"e":"sideburns","src":"Ambrose Burnside","who":"American Civil War general (1824-1881)",
 "why":"His side whiskers were called burnsides; the halves were later swapped.",
 "mean":"Strips of facial hair grown down the sides of the face",
 "cat":"Clothing","kind":"person","lv":2,"story":"…40 words…","_todo":[]}
```

`_todo` lists the fields still owed on that record. Filter on it to find work.

| Group | Count | State |
|---|---|---|
| Original master (from the CSV) | 442 | src/who/why/mean/cat present; **`story`, `lv`, `kind` owed** |
| Enriched bare entries | 296 | complete except `kind` on 222 of them |
| New accessible eponyms | 66 | complete |
| **Still to write from scratch** | **196** | to reach 1,000 |

## Field meanings

- `e` the eponym; `src` the person/place it came from; `who` one line on who they were
- `why` the causal link — why this name attached to this thing
- `mean` the modern meaning; `cat` subject category
- `kind` `person` | `place` | `other` (`other` = not truly an eponym, e.g. *petunia*,
  *meerschaum*, *chintz*, *mohair*, *claret*, *gingham*, *porter*). Keep these —
  they make good "which of these is **not** named after a person?" questions.
- `lv` difficulty 1–5, matching the trivia band system in `CLAUDE.md`
- `story` ~40 words, the card back. Origin narrative, not a definition.
- `skip:true` marks entries excluded from kid-facing cards (currently only *Priapic*).

## What's left, in order

1. **196 new eponyms.** Weight them to **levels 1–3** — the bank is still
   top-heavy (current spread of the 362 written: lv1×10, lv2×26, lv3×72,
   lv4×126, lv5×128). The original CSV skewed hard to Medicine and Physics.
   Untapped accessible veins: brand names (*jacuzzi*, *biro*, *thermos*,
   *linoleum*, *tarmac*, *plimsoll*), carriages (*pullman*, *hansom*, *landau*,
   *brougham*), hats (*stetson*, *homburg*, *trilby*, *bowler*, *borsalino*),
   toys and games (*frisbee*, *slinky*, *rubik*, *lego*), food dishes
   (*melba*, *beef wellington*, *eggs benedict*, *caesar salad*, *bellini*),
   place-words (*bolivia*, *colombia*, *philippines*, *tasmania*, *seychelles*),
   and more mathematics (*euler*, *markov*, *mandelbrot*, *abelian*).
2. **442 stories + levels** for the original CSV rows.
3. **`kind`** on the 222 enriched entries that lack it.

## Then the integration (not started)

- **Spelling library**: 382 of the 553 single-token eponyms already exist in
  `words-full.js` (128,067 words) — those just need `t:["eponyms"]` added to the
  existing `t` array. 171 single-token eponyms are absent and would need full new
  word records (definition, sentence, respelling, tier) **plus voice clips**,
  which needs Google TTS and the `GKEY` env var. 185 entries are multiword
  (*Hodgkin Lymphoma*) and can never be spelling words — trivia only.
- **Trivia chapter**: register an `eponyms` theme, add a `TT_COL` colour and a
  glossy-sticker icon in `trivia-icons.js`, generate leveled questions with
  `story` on the card back, re-run `pipeline/sb-merge.js` then `sb-shard.js`,
  verify headlessly, bump the `?v=` stamp, deploy.

## Accuracy notes

Brand and food etymologies are folklore-dense — the earlier trivia audit found a
21% defect rate in that category. Several stories here are deliberately hedged
because the origin is genuinely disputed: *mayonnaise* (Mahón vs Bayonne),
*gauze* (Gaza vs Arabic), *organdy* (Urgench), *oscar* (three rival claimants).
Keep the hedge; don't tidy it into false certainty. `bogus` and `teflon` were
dropped from the candidate list for exactly this reason — disputed and
not-an-eponym respectively.
