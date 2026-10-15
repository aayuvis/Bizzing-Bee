# The Bee Circuit, build step 9 — the Reasoning Rounds (build notes)

Brief: `circuit/BEE-CIRCUIT.md` §11 and §14 step 9 ("after the analogy release"), the laws in §2, `circuit/AMENDMENTS.md`
(no new voice clips: the device voice reads every line). The analogy content is released (`window.SB_ANL_RELEASED=true`,
three review rounds, `tests/analogy-release.cjs`), so step 9 is unblocked.

Files: `analogy.js` (the whole build — the section "THE REASONING ROUNDS"), `tests/analogy-halls.cjs`,
`tests/analogy-halls-stage.cjs`, this note. Nothing else was touched: no store step, no `app3*.js`, `mockbee.js`,
`family-shell.js`, `index.html` or `CLAUDE.md` edit. First load is unchanged (analogy.js is the lazy `analogy` group).

## What a child sees

- **A hall pin on every region board** — a lectern-and-bell medallion drawn in code (52px, 48px on a narrow board),
  labelled "Mock Analogy Bee" where the stops are labelled. Each sits on a quiet spot of its painting, clear of every
  stop: Twin Ponds the cottage row, Orchard Hill the bee-hives, Workshop Valley the water-wheel, Bridge Peaks the rope
  bridge (`HALLS[...].at`, in the board's 1600×900 space — repaint a map, re-place its hall). Under the board, a **hall
  bar**: "<Region> Hall · Mock Analogy Bee · Best finish: 2nd", and once a hall has been played, **"Theo's notebook"**.
  A hall opens with its region's board (a region not yet open has no pin); nothing waits on a hall.
- **A hall is the Mock Analogy Bee**, unchanged in its rules: the same lobby ("Take the stage", Enter), one analogy a
  round, round one a warm-up, a miss sits you down, the rivals' calls decided by a hash, the same finish. What makes it a
  hall: the region's level (the bee's Easy/Medium/Hard/Champ map exactly onto the regions' first levels 1/3/5/7, so the
  pool is `bandIds(…, 'easy'|'medium'|'hard'|'champ')` and the analogies start at the region's level and climb as the
  bee's do), the title ("Twin Ponds Hall", "Ponds Hall" on a phone), the seats, and the way back (the region's board).
  On the 'hive' plate like the bee (P3.1).
- **The cast.** Seven of Mock Bee's spellers by `MOCKBEE.rivals(mine)` — names, and faces with the child's own face
  swapped for that speller's stand-in. The seven nearest the region's level, as the bee seats them; then **Theo is
  always seated, first, tagged "Headliner"**; **Rafi is seated from Workshop Valley on, and not before** ("Rafi joins at
  Workshop Valley"). Seats: Twin Ponds — Theo, Pip, Nova, Suki, Dax, Mira, Ines · Orchard Hill — Theo, Nova, Suki, Dax,
  Mira, Ines, Kwame · Workshop Valley — Theo, Rafi, Suki, Dax, Mira, Ines, Kwame · Bridge Peaks — Theo, Rafi, Dax, Mira,
  Ines, Kwame, Vesper. (A required speller outside the window takes the seat at the window's edge nearest him; a seat
  Rafi leaves goes to the next speller past the window.)
- **Pay is the bee's**: `beeFinish`'s one `contest` coin for a podium, nothing per answer, nothing for finishing — the
  same line of code, not a copy.
- **Theo's notebook**: after a hall round the finish screen's main button is "Theo's notebook" (Enter); it opens
  "Theo's notebook — <region>" at `#/analogies/<region>/notebook`, and the board keeps the button from then on. A page is
  the region's lessons in stop order, each: its icon and title, its first stem pair as word tiles, and four labelled
  lines — **The idea · Say the link · How to spot it · Watch out** (the Learn steps' own labels). "Hear it" on each lesson
  reads its sentences aloud, one utterance each, on the device voice. ← / → turn the kept pages; a tab row names them.

## Decisions (and why)

1. **Theo's notebook writes nothing new.** The frame is fixed: the title "Theo's notebook — <region>" and the four Learn
   labels. Everything else is quoted verbatim from `analogy-data.js` — the shipped, reviewed lesson text (its
   `title/idea/bridge/spot/trap` carry the three review rounds' rows; `tools/analogy/apply-review.cjs`). NOT from
   `tools/analogy/lessons.json`: that file still holds the pre-review drafts for `same.trap`, `part.bridge/spot`,
   `use.bridge/trap` and `degree.idea/bridge/trap`, and the notebook must say what the reviewers passed. The one composed
   sentence is the lesson's own `bridge` template filled with the lesson's own first stem pair through the tab's
   `bridge()` — the sentence the Learn step "Say the link" says (for Word families the Learn step speaks `FAMILY_SAYS`, a
   code string; the notebook uses the reviewed data template instead). The test holds every text on a page to the frame,
   a lesson title, a stem word, a data sentence, or that template filled with that lesson's pair.
2. **"One page per round" = one page per hall.** In the Circuit a hall IS a round (Round I · the Meadow…), and §11's
   Reasoning Rounds are the four halls. A page is kept once its hall has been played; "shown after a hall round" is the
   finish screen's main button (Enter). Before that the board has no notebook button and the address lands on the board.
3. **A hall runs in `state.anlBee` with `hall: <region>`, at nav `anlbee`** — the bee's own functions (`beeStart`,
   `beeAsk`, `beeView`, `beeKey`, `beeFinish`) branch on it, so it is literally the existing run. The plain Mock Analogy
   Bee (`openBee`) never carries `hall` and behaves exactly as before.
4. **The record is the child's `c.anl.halls[<region>] = {n, done, best, last, at}`**, created lazily the first time that
   hall starts — reads never create it, so a child who never opens a hall carries no `halls` key at all (tested). No store
   step was needed (the CORE agent is adding one; none here). `?demo` keeps it in its sandbox; a second child has none.
5. **A hall's seeds count on its own `n`**, not the tab's `rec().n`, so playing a hall never changes which stems or
   option orders the tab's next practice or check draws. The Mock Analogy Bee's own record (`c.anl.bee`: played, best,
   wins — the Play card's "Best finish") is not touched by a hall; the hall bar shows the hall's own best.
6. **Gate**: every door asks `SB_ANL_OPEN()` (app3's `anlOpen`, the tab's gate) — the pin and bar are drawn only when it
   is open, and a stale tap at a hall or a kept notebook with the release line false and no tester mode lands on Home.
   `window.SB_ANL_HALLS = false` switches the whole overlay off (the overlay test plays the same child both ways).
7. **No emoji, no generated art, no recording**: the pin, the bar's bell and the notebook icon are inline SVG drawn in
   analogy.js; the notebook speaks through `utter()` (app3) on `speechSynthesis`, sentence by sentence (a long single
   utterance is cut short by some device voices).

## Tests (both new, both proved by breaking — the breaks are listed in each file's header)

- `tests/analogy-halls.cjs` (browser, ~40 s): doors by tap, click, keyboard, the bar and the address; a closed region has
  none; the cast in all four halls (and a child wearing Theo's or Rafi's face); pay (a perfect speller: one contest event
  per hall, the card equals the ledger; a seeded random tapper over 208 halls: nothing paid off the podium, nothing but
  the podium's one contest coin ever, its podium rate under 8% — see finding 1 for why "earns 0" is not asserted); no
  answer in plain sight on every hall turn; OVERLAY (the same scripted child, two days, halls on
  vs `SB_ANL_HALLS=false`: the analogy record, wallet, every board's stops/tabs/stop card and `here()` byte-identical;
  then two halls played move no mark and not `rec().n`); the notebook (absent before, Enter from the finish, the address,
  kept on the board, verbatim-only text and completeness for all four pages, "Hear it" = exactly the lesson's sentences
  with no Audio and no mp3, ←/→); the gate; per child; `?demo`.
- `tests/analogy-halls-stage.cjs` (browser, ~50 s): T14/T15 (`tests/lib/stage-check.cjs`) on the lobby, a turn, a result
  and the finish of all four halls at 390×844 light and 1280×800 dusk, plus Twin Ponds at the other two looks; every pin
  inside its board and clear of every stop at 390 and 1280; 44px targets at 390 (every control on the hall screens and a
  notebook page; on the boards the hall's three controls, and no stop's 44px circle landing on the hall); no sideways
  spill at 390; no emoji (hud-emoji's scan) on boards, hall screens and notebook pages.
- Results (15 Oct 2026): analogy-halls 127 OK · analogy-halls-stage 741 OK · every one of the 17 breaks watched to fail
  (each test's header lists them with their counts). Kept green: `node tests/lib/run.cjs --node-only` 44 passed
  (analogy-data, analogy-release, pay-path, no-random-rewards, word-door…); analogies 53 OK, analogy-stage 735,
  analogy-gate 17, touch-targets 21, hud-emoji 181, first-load 19. `games-bots.mjs anl/clock`: T1, T2b and T6 pass; its
  T2 fails (the random bot 21/56 = 38% against a 37% ceiling) — and fails identically on the pre-halls analogy.js in a
  scratch root, so it is not the halls: the clock's items are seeded by the date (`day() + '|clock|'`), and today's
  sample sits 1% over the line. Finding 6 below.

## Findings for the integrator / owner (not fixed here)

1. **A guesser can reach the podium, so "a random bot earns 0 contest coins" is NOT asserted as asked.** Under the
   Mock Analogy Bee's own podium rule — which the brief says to keep ("pay exactly as the Mock Analogy Bee pays") — a
   random tapper lands on the podium in ~2.4% of bees (rivals who miss in the same round as the child are tied with it,
   not ahead of it), and a podium pays `contest`. The plain bee has the same property today (no games-bots driver plays
   it). Any fixed sample of N halls therefore passes or fails by its seeds: the first version of the test played eight
   halls as the day's first and passed; reordered so the perfect speller paid first, the same eight met one chance 2nd
   place and failed. Choosing the order that passes would prove nothing, so the test asserts the invariants that DO hold
   (nothing off the podium, nothing but the podium's one coin, the rate under 8% — a pay-on-finish hall reads 100%).
   Measured on 1,000 halls (250 a region, seeded):

   | podium pays when … | random tapper | a 70% speller | perfect |
   |---|---|---|---|
   | the podium (today's rule) | 2.4% | 29.8% | 100% |
   | + ≥ 1 right after the warm-up | 2.1% | 29.8% | 100% |
   | + ≥ 2 right after the warm-up | 1.6% | 29.1% | 100% |
   | + ≥ 3 right after the warm-up | 0.6% | 26.1% | 100% |
   | + ≥ 4 right after the warm-up | 0.1% | 21.4% | 99.1% |

   Word Lore's 6-of-10 floor pays a guesser ~2% of rounds, so today's rule is at the family's existing level; if the
   owner wants Circuit L11 ("contest coins on merit only") and §13 test 6 strictly, a floor of 3 in `beeFinish`
   (`const podium = b.place <= 3 && b.log.slice(1).filter((x) => x.ok).length >= 3;`) cuts the guesser to 0.6% at a
   cost of 3.7 points to a 70% speller. It changes the plain bee too (one shared line); `tests/analogies.cjs` §8's bot
   (right in rounds 1–3) would then need a fourth right answer. Not done here: it is a pay-rule change.
2. ~~**Orchard Hill's level check, at 390px**, sits 18.5px below the board's top edge, so its medallion's top 8px and the
   top 2.5px of its 44px circle are clipped by the board's `overflow:hidden` (measured with the halls switched off;
   touch-targets.cjs only measures Twin Ponds' board). Before the halls and apart from them.~~ **Fixed 15 Oct 2026
   (batch 3)**: every stop is clamped inside its board by its own half-size; `tests/analogy-board-fit.cjs` holds all four
   boards at 360, 390, 768 and 1280.
3. **`bridge()` puts an article inside "the"** for the reviewed `use` template "We use the {A} to {B}.": for a pair like
   pen/write the tab's "Yes." and miss lines read "We use the a pen to write." (36 live `function` items), and the
   reviewed part template "The {A} is part of the {B}." reads "The a blade is part of the a knife." (5 live `part`
   items, in the level checks and the games' pool). The notebook is not affected (its `use` pair
   is scissors/cut, which takes no article). A tab fix, not an overlay one — left for the owner of the tab.
4. **Routing.** A hall runs at nav `anlbee`, so its address is family-shell's `#/anlbee` (a reload opens the plain bee's
   lobby) and the Play tab is lit while it runs (family-shell `PARENT.anlbee = 'games'`). Inbound, analogy.js already
   accepts `#/analogies/<region>/hall`. To make the address and the tab follow the hall, family-shell's `baseRoute` needs
   one line — `if (n === 'anlbee' && state.anlBee && state.anlBee.hall) return 'analogies/' + state.anlBee.hall + '/hall';`
   — and the Analogies tab lit for that state (app3 `atlasTabOn` / family-shell `PARENT`). Not my files.
5. **The notebook's pages are per region, not per lesson**: a lesson taught in two regions (Same meaning in Twin Ponds,
   Orchard Hill and Bridge Peaks) appears on each of their pages, verbatim, by design (a page is that hall's recap).
6. **`games-bots.mjs anl/clock` T2 is red today, before and after the halls**: the clock's question order is seeded by
   the calendar date, so the harness's "fixed seed" sample changes every day; on 15 Oct 2026 the seeded random bot scores
   21/56 (38%) against T2's 37% ceiling. T1 (0 coins) and T2b (14.6% of perfect, ≤ 15%) hold. Pinning the page clock in
   the harness (`pg.clock.setFixedTime`) would make the sample really fixed; tests/ is shared, so it is left to the owner
   of games-bots.
