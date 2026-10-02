# FIX-BEE batch C — the learning loop (D3 · D5 · M2 · M3 · D8)

Written for CLAUDE.md. Plain, specific, the reason before the rule.

## D5 — Mastery comes from evidence, and it decays

**What was wrong.** `markMastered(word)` set `state.luMastered[word]=true` on the FIRST right
answer from anywhere, and nothing ever took it back. The card's "Got it" / "Complete" buttons
and the Ultra scan's "Know it ✓" called it too, so a tap said "mastered" for ever. And
`luMastered` lived on the HOUSEHOLD, so a second child inherited the first child's mastery.

**What it is now** (`app3.js`, the block above `markMastered`):
- The record lives on the child: `c.mast[word] = {b, due, d, ok, n, at, mt, lp, sl, miss, leg}`.
  `b` is a Leitner box 0–5; `due` and `d` are **local day numbers** (`mastDay`), so "tomorrow"
  is the calendar's, not 24 hours later — a child who practises at 6pm and again at 5pm the
  next day has practised on two days.
- `mastEvidence(word, ok, kind)` is the only writer. A right recall moves the box up only when
  the word is DUE and on a NEW day (box 0→1 is the first right answer); the same word right
  twice today is practice, not evidence. `MAST_GAPS=[0,1,3,7,21,60]` days — a design
  assumption to tune against real retention, not a cited finding.
- **Mastered = box ≥ `MAST_BOX` (2)**: right on two separate days, a day or more apart.
- **Decay = it comes due again.** After `MAST_GAPS[box]` days a mastered word is due; it still
  counts as mastered while due, and the Revisions page offers it ("N words ready for a
  check" → `mastRecheck`, served in the practice card). Right on the re-check moves it out.
- **A miss drops it**: a mastered word falls to box 1 and counts a lapse (`lp`, `sl` — the
  report's "slipped since mastered"); anything else to box 0. Re-mastering needs another day.
- **Recognition is not recall**: `kind==='mc'` (picking the right spelling — Word Quiz,
  the Atlas butterfly/comb/petal kits) never moves a box up, but a wrong pick still drops
  one. Typed answers are recall.
- **`state.luMastered` is DERIVED** (`mastSync`) from the ACTIVE child's record — nothing else
  may write it. It is rebuilt when the active child changes or a record is written (render()
  calls `mastSync()` cheaply; it only rebuilds on a new child signature), so a test that writes
  `state.luMastered` directly keeps its value until then. Every reader — `stageComplete`
  (stage-ups), concept/lesson "Mastered/Complete", heatmaps, set celebrations, the coach's
  working set — works unchanged and now means real mastery. The Bee Band never read it (it
  reads `c.attempts`), so it is untouched. `c.missed` (the revise pile) is unchanged: real
  misses still file there, and now ALSO count against the evidence record.
- **Migration** (`mastBoot`, one line in init): the first load after this change carries the
  household's old `lu` onto EVERY child as box 2 flagged `leg:1`, due today. Nothing a child
  already saw as mastered disappears (stages, labels, heatmaps hold), but the report does not
  count `leg` words as retained until a re-check proves them; any re-check clears `leg`.
  It runs only when no child in the household has a record yet, so a child added later never
  inherits a sibling's list. `save()` still writes `lu` (the active child's derived set) —
  left alone on purpose, so batch D's Store seam has one less thing to reconcile.
- **Self-marks write nothing that counts**: `flashMark('done')` only advances; `completeWord`
  only advances (it used to add a right answer to the session score too); `reviseComplete`
  moves the word off the revise pile into history (a study list) and masters nothing;
  `cardAdvance('revise')`/`reviseWord`/the arcade "add to revise" button call
  `addMiss(w,'mark')`, which files on the pile and is NOT evidence. `ADV.scanMark(true)` no
  longer masters (the +1 coin there is left exactly as it was — batch B's call).
- Real misses that now count as evidence: the practice card's wrong check and "Show answer",
  the typed games, Magic Squares, Written/Oral, the Ultra drill, the Atlas quiz gate's spell
  and kit items (new — the gate never touched spelling progress before; it records evidence
  only, it does not file on the revise pile), and the Mock Bee microphone.
- The results screen says what a spaced stage needs: "Stage 1: 3 of 24 mastered — 20 spelled
  right: spell them right again on another day and they count as mastered."
- Hive milestones: `mastMilestone` writes `trackMilestone('bee', name, 'mastery', 'N words
  mastered')` every 25 evidence-mastered words, through `window.BZ_ACTIVITY` if batch A's
  port is present (guarded; nothing happens without it).
- `supabase-sync.js` `PROGRESS_KEYS` gained `'mast'` (word keys and day numbers — nothing
  about the child), so a cloud restore keeps the evidence.

**Consequence to know.** A stage now opens on spaced mastery (or by passing the ⚡ Challenge),
so a child cannot clear a stage in one sitting any more. That is the point of the row.

Guard: `tests/mastery-evidence.cjs` (24 checks — one right answer, same-day repeat, right
after the gap, due after time travel, the Revisions re-check, a miss drops it and the report
calls it slipped, five self-marks, recognition, two children, the vocab separation, the
legacy carry-over, persistence). The vocab separation is also in `qa/audit.cjs`, whose
snapshot now includes `c.mast` (it read `c.luMastered`, which never existed on the child).

## D3 — A miss holds, shows the letters, and says why. The bee never frowns.

- `missAlign(typed, word)` — an edit-distance alignment, so a dropped letter shows as a gap
  instead of shifting every letter after it. `missWhy(word, typed)` finds the concept family
  that explains THAT miss from where the letters actually differ: a dropped k at the front is
  a silent letter, a lost m in committee is a double, a swapped ie is ie/ei, an error inside
  -able/-ence is an ending, a vowel swapped for a vowel is the schwa; otherwise the word's own
  `trickAnal` family (via `MISS_CLS_KEY`), then homophones. The rule line is the Coach
  rulebook's `SB_COACH_RULES[k].check` (lazy — `lazyNeed('coachRules')` is called on the first
  miss) or `TRAP_TIP` until it lands; the word's memory hook `w.h` follows.
- `missFeedbackHTML(word, typed, opts)` is the ONE panel (`.sb-miss`, `data-why`), used by the
  practice card (`trainerCard`, wrong and Show answer), the Atlas quiz gate (spell items and
  the three kits), the typed games (`missPause`), Word Quiz spellings, Magic Squares, the
  Ultra drill and the Mock Bee microphone. It carries a `role="img"` summary for screen
  readers (the letters are `aria-hidden` cells).
- **Wrong holds until tapped, everywhere a question is graded**: `tqAutoNext` returns on a
  miss (right still advances at 1.1s); `missPause` keeps the word up with a Next button and
  Enter (`gMissGo`, `g.fbGo`) — a timed round's clock keeps running while the child reads,
  their choice; Word Quiz (`gMcNext`, Enter/Space), Magic Squares (`magicNext`), vocab practice
  (`vocabNext`), the Ultra drill (Enter/Next) and Ultra vocab mock (`advMockVocabNext`),
  trivia quiz/clock/squares (`trvNext`), the reader's Try-it (`readerNext`), and the Mock Bee
  (`mbGoOn`, Enter — the verdict and next speller now follow the tap; split into `mbVerdict`).
  The practice card already held.
- **The mascot has no frown to give**: `mascotSVG` maps `'oops'` and `'sad'` to the kind
  `'think'` face, so no caller anywhere can draw the slanted brows and tear again. The practice
  card sets `mood:'think'` on a miss and on Show answer (was `'oops'` / `'sleepy'`) and no
  longer head-shakes the bee.
- Found on the way: quitting the Mock Bee during the opening draw left `mbStart`'s 1.4s timer
  reading `state.mb.seed` after `mbQuit` had nulled it — a page error. Guarded.
- `tests/ux-826.cjs` asserted the old 3.6s/2.4s miss timers; the brief reverses that, so its
  three source checks now pin the hold, with a comment saying why.

Guard: `tests/answer-feedback.cjs` (24 checks over the practice card, the quiz gate's spell
item and concept MCQ, the Mock Bee, Daily Buzz and Word Quiz — each: the panel and its why,
still held after 4s, Next moves on, a right answer advances; and the mascot's moods).

## M2 — The report states what the child can now do

`reportCard(c)` / `window.SB_REPORT_CARD` (one pass over the record) and `reportCardHTML(c)`,
the first card in the Parent Zone, laid out as the family report card:
- **Time** — active minutes over 7 days from `localStorage['bizzing.activity']`, rows with
  `a:'bee'`, this child's name (case/space-blind), not milestone rows. If the feed is absent
  it says so; it never invents minutes. It says time is effort, not learning.
- **Progress** — Atlas stops cleared and where the child is now (`SB_TRAIL_NEXT`; the card
  asks for the `atlas` group if the map data has not landed), and the spelling Stage.
- **Mastery** — retained (mastered on two days, `leg` excluded), new this week, by concept
  family (the families add up to the retained count), carried-over words named as such,
  due for a re-check, slipped since mastered, traps to help with (families of words with
  real misses that are not mastered), and "spelled right once, waiting for another day".
- The five usage meters are retitled **Practice habits** ("how the practice is going — the
  report card above says what has been learned"). The printed weekly report gained the same
  report-card row, and its "Words mastered" is now the evidence count (it was the old
  one-right-answer tally).

Guard: `tests/report-card.cjs` (15 checks — expected values, an independent recount in the
test, mastered = retained + carried, families sum, nothing slipped is mastered, the minutes
filter, the card's order and numbers, the printed report).

## M3 — Backup, restore, erase; no tester levers on a child

- **Parent Zone → "Backup, restore & erase"** (`backupCard`), each action asking the PIN again
  at the moment it acts (the parent zone can stay open on a shared device).
  `backupBlob()` = every `sb_*` key EXCEPT `BK_SKIP` (sign-in, session, cloud consent, the
  research log, bug reports, voice flags, tester mode) — a deny-list on purpose, unlike the
  cloud allow-list: a backup that silently drops next month's new key loses a child's work.
  Names are in it: it is the family's own file on their own device. From the shared family
  keys it takes only this household's slice (its children's wallet rows, Bee's activity rows).
- `backupParse` is strict (wrong app, newer version, no household, a non-`sb_` key → refused
  with a reason a person can act on). Restore replaces the `sb_*` keys and only ADDS missing
  family rows (never overwrites another app's newer history). Erase removes every `sb_*` key
  and Bee's activity rows for these children; the family wallet is left alone and the screen
  says so (its coins were earned across apps).
- **Halt before you write**: `bkHalt()` stubs `save` (and the sync queue) FIRST, then the work,
  then a reload — `pagehide` calls `save()`, and so does any `render()` on the way out (a
  flash). With the stub after the flash, erase "worked" and the old household was written
  straight back; the test caught it.
- A fresh or just-erased device has no Parent Zone, so the **welcome page's footer** carries
  "Restore a backup" (`bkLandingLink`, same picker, same confirm). File inputs dispatch through
  one `document` change listener on `[data-file]` that hands the File to its action.
- **Tester mode never rewrites the child**: the "1,000,000 test coins" lever is gone from
  Testing tools (the switch only appears to hand back a purse an older build banked);
  `advCheckUnlock` returns under `devUnlock` — switching testing on used to write an
  "Advanced Pack activated" activity row, `advAnnounced`, and a "day played"/streak onto the
  child. No dev/tester/XP/coin control exists outside Settings → Testing tools.
- **The Parent tab re-asks for the PIN**: `setNav('progress')` now always lands on "My
  progress" — `progTab` stayed `'parent'` after a grown-up's visit, so the child could reopen
  the Parent Zone from Progress without the PIN.
- `privacy.html` §7 lists the new rights; effective date moved to 2 October 2026.

Guard: `tests/backup-restore.cjs` (25 checks — the file and its contents, what does not
travel, the family slice, erase's confirm and PIN, nothing erased before the PIN, a refused
file, restore from the welcome page, every field back after the reload, a byte-exact restore of
every key, the family rows, no levers outside Testing tools, tester mode leaves the children
byte-identical).

## D8 — No search mid-drill; every question generated and tested

- `drillLive()` (state-based — the header renders after the view and must not read the
  previous DOM): practice card, Level-Up/coach practice, vocab practice, Written/Oral, the
  quiz gate, the vocab check, the Mock Bee stage, trivia rounds, game play, Ultra drill/scan/
  mock, the level test, the reader's Try-it, and any arcade overlay. While true the header
  search input is `disabled` with "Search waits until you answer" and a title explaining why,
  shows no suggestions, and `hqType/hqGo/hqPick/hqKey/openFinder` refuse. This is ONE
  condition added to batch A's bar; the bar itself is untouched.
- **Leaks found and fixed** (by reading every pre-attempt screen, then pinned by the generated test): Magic Squares printed the definition RAW
  before the attempt (spell items) and as the prompt (meaning items); the Ultra drill and the
  Ultra written mock printed the definition raw; the Magic Squares cell label (a theme name)
  can name the very word asked; the reader's Try-it printed the definition raw. All masked
  with `maskTxt`. Meaning options are masked against the headword on screen (vocab check,
  Word Quiz vocabulary, the quiz gate's meaning items, the Mock Bee meaning round) — a
  definition that names its own headword points straight at the answer.
- **Distinct options, one right answer**: `mcDistinct(answer, cands, n)` for every MC
  generator (vocab check, Word Quiz meanings/vocabulary/idioms, Magic Squares, quiz gate
  meanings). `buildMC('spell')` padded with `w.w.slice(0,-1)+w.w.slice(-1)+'e'` pushed
  THREE TIMES — three identical wrong options; `spellVariants()` now makes honest, distinct
  ones (a doubled letter, a dropped double, a swapped neighbour, a dropped letter).
- **Even slots**: vocab practice and the reader's Try-it used `sort(()=>Math.random()-.5)`,
  which is biased by position; both use `sample` (Fisher-Yates) now.
- `MOCKBEE.vocQ(w)` exposes the hall's meaning-question builder to the test.

Guard: `tests/question-leaks.cjs` (35 checks) — 80 real words: every word whose own
DEFINITION names it (only 5 of 55,531 served records do — blair, delhi, irving, burke, hecht —
and they are exactly the ones that caught the raw-definition screens), then ones whose
sentence names it (nearly all), then any. Every generator run many times: practice 80, quiz
gate ~108 builds / ~1,600 items over 16 stops (testing mode opens them), vocab check 1,120,
Mock Bee 80 at the microphone + 800 meaning questions, trivia 2,400 over all five levels,
game cards 3,000, Magic Squares ~1,000 generated + every sampled word on both screens, the
Ultra drill and written mock, the typed-game hint, the reader's Try-it ~600. Checks: the target
never in the visible text before the attempt, distinct options, exactly one right, answer slots
within ±6% of 25% for every generator with ≥500 four-option items, and the search condition.
**Slot evenness is genuinely random, so the floor is n≥500 and the band ±6%** (≈3.4σ at 500):
at n=300 and ±6% one of ~30 slot checks failed by chance in about one run in three.

## Proved by breaking (each: the old behaviour put back, the test run, the file restored and `cmp`'d identical)

Harness: a script applies one exact-match replacement, runs the guard alone, restores the saved
copy and `filecmp`s it. Every restore compared identical.

| break (old behaviour put back) | guard | FAILs |
|---|---|---|
| first right answer goes straight to box 2 (one right answer masters) | mastery-evidence | 2 |
| no decay: only box-1 words come due, a miss keeps a mastered box | mastery-evidence | 5 |
| card "Got it" calls `markMastered` again | mastery-evidence | 2 |
| quiz gate auto-advances 3.2s after a miss | answer-feedback | 2 |
| `mascotSVG('oops')` draws the frown again | answer-feedback | 1 |
| Daily Buzz miss moves on by timer | answer-feedback | 1 |
| report counts carried-over (self-marked) words as retained | report-card | 6 |
| report counts every app's minutes as Bee's | report-card | 3 |
| erase halts `save` after the flash (the bug the test first caught) | backup-restore | 1 |
| the 1,000,000 test-coins lever back | backup-restore | 1 |
| practice card's sentence hint unmasked | question-leaks | 1 (75 words) |
| Magic Squares meaning printed raw | question-leaks | 1 (6 words) |
| Ultra drill meaning printed raw | question-leaks | 1 (6 words) |
| Word Quiz spellings unshuffled | question-leaks | 1 (slots 100/0/0/0) |
| vocab check with the answer twice | question-leaks | 3 |
| header search left on mid-drill | question-leaks | 1 |

Two first-draft breaks did NOT fail, and that was information, not noise: unmasking the
practice card's DEFINITION changed nothing because almost no served definition names its word
(the sentence does — break that and 75 of 80 leak), and removing `mcDistinct`'s dedupe changed
nothing because the candidate pools rarely repeat. The sample was re-weighted to put the five
self-naming definitions first, and the duplicate break was moved to a real duplicate.

## The rest of the suite

Every test in `tests/` was run alone, in sequence. All pass except four that fail the same way
on the base commit (checked by running them against a copy of the tree with the base files):
`header-search.cjs` (an element handle detached by a boot re-render before the click),
`living-cast.cjs` (`Cannot read properties of undefined (reading 'words')`), `ux-personas.cjs`
(writes its findings to another session's scratchpad path), and `loading-state.cjs` (timing:
it fails whenever the concepts file lands inside its 900ms window — 1 of 3 on base). `ux-826`
was updated on purpose (above).

## Cross-batch edits (smallest possible, listed so the merge expects them)

- **A (nav / landing / header)**: one condition in the `.sb-hsearch` template (`_drill`) and
  refusals in `hqType/hqGo/hqPick/hqKey/openFinder`; `setNav('progress')` resets `progTab`
  to `'me'`; one `${bkLandingLink()}` in `landFoot()`.
- **B (coins)**: the "Test coins" Settings line and `toggleDevCoins`'s ON branch (no purse is
  ever rewritten by testing); `ADV.scanMark`'s `addCoins(1)` was left exactly as it was, but
  note it pays a coin for the child SAYING they know a word — B may want to drop it under the
  "coins for learning only" rule. Coin payouts on every other line I touched are unchanged.
- **D (render shell)**: one line in `render()` (`mastSync()`), one line in init (`mastBoot`).
  `save()` is untouched (the backup halts it by replacing `window.save`). A Store seam that
  moves `sb_saas_v2` keeps backup working as long as its keys still start with `sb_`.
- `app.js` `mascotSVG` (the oops→think mapping), `supabase-sync.js` (`'mast'`), `privacy.html`.

## Left undone, and why

- Trivia's three formats have no keyboard handler (pre-existing; every answer and the new Next
  button are real buttons, so Tab+Enter works). Not added — out of scope and A/D's a11y sweep.
- The Mock Bee's 90-second lightning round and the Ultra lightning/written mocks are timed or
  answer-at-the-end by design; they show no per-item feedback and were left so. The written
  mock's definition leak WAS fixed.
- The support console (Testing tools → Support console) can still set a child's plan tier. It
  is a support tool behind the PIN, not tester mode; left, noted.
- Stage-ups now need spaced mastery. If the owner finds that too slow for the youngest band,
  the lever is `MAST_BOX`/`MAST_GAPS`, not a second definition of "mastered".

## Re-scores (honest, 1–5)

- D3 Answer feedback: **4** — every graded surface holds and explains; the "why" is heuristic
  (zone-matching against trap patterns), good on the common shapes, generic on odd ones.
- D5 Mastery from evidence: **4** — spaced, decaying, per child, no self-mark; the re-check is
  surfaced on Revisions and the report but not yet pushed into the Continue card (A's home).
- M2 Reports learning: **4** — Time/Progress/Mastery from evidence, consistent by test; Time
  depends on batch A's feed landing.
- M3 PIN & controls: **4** — backup/restore/erase behind the PIN, round-trip proved, no tester
  levers on a child; the PIN remains a deterrent (stated).
- D8 Question testing: **4** — generated over real words across every question mode,
  leaks fixed where the test found them, every check proved by breaking; not 5 because the
  "why" panels and option texts are checked for leaks but not yet for reading level.
