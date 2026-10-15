# The Bee Circuit — build notes: the core (steps 2, 4 and 5)

`circuit/BEE-CIRCUIT.md` §14 steps 2 (state, hooks, the Hive Post shelf), 4 (letters, bee files, stamps, postcards) and 5
(the Dax arc's mail, the Suspect Board), under `circuit/AMENDMENTS.md` and the 14 Oct decisions in `review/REPORT.md`.
The halls (trail.js), the cases (`SB_CIRCUIT_CASES`) and Team Night's mode (mockbee.js) are other builds; they call in
here through `window.SB_CIRCUIT`.

## What was built

| file | what |
|---|---|
| `tools/circuit/build-data.cjs` | writes `circuit-data.js` from `circuit/script.json`; `--check` compares |
| `circuit-data.js` | GENERATED. `window.SB_CIRCUIT_DATA` — every on-screen line at the path it has in the script (69 KB, 22.7 KB gz) |
| `circuit.js` | `window.SB_CIRCUIT`: the per-child record, the mail engine, the Hive Post, the moment card (64 KB, 19.4 KB gz) |
| `store.js` | one new step, `v11_to_v12` (schema 12) |
| `boot-lazy.js` | REG `circuitData` + `circuit`, GROUP `circuit`, DEPS `circuit: ['circuitData']`, both on IDLE (before `sync`) |
| `app3-me.js` | the Collection's fourth tab, "Hive Post" (drawn envelope), and one action, `hivePost` |
| `app3.js` | `hivePost` added to `SCR_ACTS.scrMe` — nothing else |
| `tests/circuit-data.cjs`, `circuit-mail.cjs`, `circuit-store.cjs` | node, `@check` (the data gate) |
| `tests/circuit-post.cjs` | browser (Playwright) |

Nothing was added to `index.html` or the first screen: `circuit-post.cjs` checks that neither file is fetched at boot,
and `first-load.cjs` passes unchanged.

## What circuit-data.js holds (and does not)

Same paths as the script, so a review row, a mail key and a test all name one line the same way
(`rounds[1].pieces.v`, `teamNight.beats.sting`, `cases[2].safeLine` …). Arrays are kept whole (no index shifts).

- `season`, `fiction`, `signoffs.inv`
- `cast[id] = {name, age, tell}` — never a role
- `suspectBoard.portraits[] = {id, label, why, labelAfterRound?, labelAfter?}` — never clearedBy, never `answer`
- `rounds[] = {n, act, venue, headliners, alsoSeated?, technique, lesson, lessonGi, vWhere, order?, nightBefore?, pieces}`
  (pieces without `progNote`)
- `turn = {round, scene, choice:{key, labels, line}, kwame, dax, notesIntro, notes, daxOnNotes, apologies}`
- `cases[]` without `theme`, `planted`, `clueOnScreen`, `safeLineNote`, `engine`; `puzzle` without `homeLanguageNote`, `answer`
- `teamNight = {act, venue, challenge, beats, ravenmereRoster, roster (no lecternNote), callerCategories (no why)}`
- `accusation` (no `opens`), `hivePost` (no `postcardNote`), `slotLines`
- `visitors[] = {act, figure, word, kind, card, stop, sources:[{type, ref}]}` and `visitorAt: {stopId: visitorIndex}`
- `rules` — the machine half of `script.build`: `storyOrder.holds`, `hallFields.{fields, invNamedUnseated}`,
  `outcomes[] = {round, word?, lines}`, `slots[name] = {usedAt, fallback}`, `caseOrigins.{libraryNonGreek, choicesExclude}`

**Stop Visitors (§10).** A visitor stands at a stop only when a word on that stop's own list (`trail-map-data.js`, every
band) is theirs; at most one per stop; where two could stand at one stop, the one whose region it is wins, then the
script's order. The script's `act` is where a figure belongs thematically, but the words sit on other regions' lists
(atlas, hermetic, panic, hypnosis and diesel and newton are all on u93, a Junkyard stop), so the rule, not the act,
places them: **10 of 26 visitors stand somewhere** — u11 Echo, u16 Iris, u21 Mars, u23 Tantalus, u48 Psyche, u56 Adolphe
Sax, u93 Rudolf Diesel, u103 Vulcan, u105 the Titans, u119 Fortuna. January, June and the four weekdays are on no list.

## The API, exactly as implemented (`window.SB_CIRCUIT`)

All hooks act on the ACTIVE child (`active()`), save through app3's `save()` (never under `window.SB_DEMO`), and are safe
to call twice (a piece is delivered once, by key).

| call | does | returns |
|---|---|---|
| `state(c?)` | the child's record, made empty if missing (nothing saved by reading) | the record |
| `onHallOpen(act)` | a hall's pin first shows (leg 4 reached and `hallUnlocked`): delivers its invitation and programme | `true` if mail was added |
| `onHall(act, r)` | a hall's result. `r = {place, of, words:[{w, ok, asks?}], missed:[w], replay?, above?, headPlace?, asked?, asks?, spelled?, lastMissed?}` — a word's requests as a count or the Chair's list, or `r.asked = [{w, ok, asks:[…]}]` (mockbee's `g.mine`, the shape the halls build sends); `{asked}` is the sum of `asks.length` (the script's rule), a bare total (`r.asked`/`r.asks` as a number) only when no word carries its own. Records `halls[act]`; delivers the invitation/programme if missed; the round's story mail **when story order allows** (else it waits, and arrives the moment the previous hall's mail does); a bee file; the stamp (once); and makes available the case whose `after` is this round. Queues a moment. | `{first, story}` |
| `onTeamNight(r)` | `r = {place, of, words:[{w, ok, asks?}], calls:{right, of}, replay?, levelMiss?, lectern?, band?}` (the drama line is the lectern's: `r.lectern`, else `r.band`, else the child's age band; 6–7 plays 8–10). Team Night's beats (once, after Round IX's mail), a bee file with origin-calling accuracy, the stamp; the sting, its answer, Mei and the coda only after the accusation's closing letter. | `{first, story}` |
| `onRegionDone(act)` | the host's postcard with three of the child's own words, spelled right, from that region's stops (needs `SB_TRAIL_MAP`; asks `SB_TRAIL_NEEDMAP` if it is not in; sent only when three exist) | `true` if sent |
| `onLevelUp(level)` | a diary line, `hivePost.diary[(level − 2) mod 10]`, once per level | `true` if added |
| `boardExtras(act)` | HTML for a region board: the envelope `<button class="hp-env" data-act="hivePost" data-arg="open">` while mail is unread (no count), then `SB_CIRCUIT_CASES.pins(act)`. Also shows a waiting moment card. The envelope is `position:fixed` (bottom-right, above the phone tab bar): the halls build drops this string inside the PANNING board (`actBoard`'s layer), where an absolute envelope would ride off-screen with the painting; no ancestor of the board has a transform, so fixed holds. | string |
| `mailWaiting(c?)` | any unread piece | bool |
| `open(tab?, unitId?)` | opens the Hive Post (`'mail'`, `'board'`, `'visitors'`, `'stamps'`) via `state.collTab='post'` + `app.openCollection()`; `('visitors', stop)` puts that stop's visitor first | — |
| `openVisitor(unitId)` | = `open('visitors', unitId)` — the halls build's stop-card "Visitor" line calls it | — |
| `hallFiled(act, c?)` | Mock Bee's recap tapped "Add missed words to revision" in a Circuit hall (the halls build calls it from `mbAddMissed`): that hall's latest bee file reads "On your revision pile" | bool |
| `line(path)` | a line by its path, slots filled with the script's fallbacks (the halls build announces Team Night from these) | string |
| `visitorFor(unitId)` | the visitor standing at that stop, or `null` | `{act, figure, word, kind, card, stop, sources}` |
| `caseState(c, id)` | `{state:'unseen'\|'open'\|'solved', hints, …the cases build's own fields}` — or `null` while the case is not yet available | |
| `caseUpdate(c, id, patch)` | merges `{state, hints}` (validated: a solved case stays solved, hints a whole number) and the cases build's own fields (`at`, `res`, `seen`, `tr`, `pp`, `solvedAt`, `sticker`, `acc`, `dismissed`, …) as plain JSON, a field at a time — a name of letters and digits, no string over 64 characters (no free text can be one), the whole record under 4 KB; an unknown id is refused (`null`); solving queues a moment | the record |
| `caseLate(c, id)` | the next round's mail is in: open with the case's `lateLine` | bool |
| `hallUnlocked(act, c?)` | story order: Round 1 always; Round N once Round N−1's mail is in; `'team'` once Round IX's | bool |
| `teamOpen(c?)` | = `hallUnlocked('team')` | bool |
| `accuseOpen(c?)` | Round IX's mail is in and V. is not yet named | bool |
| `chip(c?)` | `'The Bee Circuit · Season 1'`, or `'The Bee Circuit · Season 2: Ravenmere'` once the coda is in | string |
| `keys()` | every on-screen line's path in the data (770) | array |
| `act(arg)` | the Hive Post's actions (below) | — |
| `postHTML(c?)` | the Hive Post tab's HTML | string |
| also | `data()`, `at(path)`, `fill(path, d)`, `lineHTML(path)`, `piece(c, i)` ({kind, label, html, text}), `sequence(c)`, `moments()`, `showMoment()`, `ensureStyle()` — for the tests and the other builds | |

`act(arg)` verbs (`data-act="hivePost" data-arg="verb|…"`): `open|tab`, `view|mail|board|visitors|stamps`, `read|i`,
`back`, `say|i`, `sayvis|i`, `sayclue|id`, `saywrong`, `pip|i`, `file|i`, `lesson|gi` (opens `#/concepts/<gi>` through
family-shell's route, so the lock holds), `dax|true|false`, `closing|j`, `pin|clueId`, `pinto|clueId|suspect`, `pindone`,
`accuseon`, `accuseoff`, `accuse|suspect`.

## State (per child, `c.circuit`, store step v11 → v12)

```
{ v:1, season:1,
  halls:  { <act>|team: { done:<first finish ms>, best:{place, of}, last:{place, of, at},
                         first:{place, of, at, above, log:{words, asked, beat, spelled?}, band?, levelMiss?} } },
  cases:  { c1:{ state:'unseen'|'open'|'solved', hints:n, …} },   // present = available ('unseen' until the cases build opens it); … = the cases build's own small fields
  mail:   [ { key, at, read, d? } ],                                 // never removed; d freezes a piece's slot fills / bee file
  board:  { suspects:{ vesper:[], pronouncer:[], ratchet:[], dax:[], vale:[] }, accused:null|'vale' },   // pins are clue ids
  dax:    { helped:null|true|false },
  closing:null|0|1|2 }
```
Two deliberate additions to §3.3, both inside its shape: `board.suspects.vale` (the script's fifth portrait) and a
`first` result on a hall (a hall played out of order delivers its story later from its first result). Mail keys are the
data's paths (`rounds[3].pieces.below`, `turn.apologies[1]`, `teamNight.beats.drama.11-15`, `accusation.closingLetter`,
`hivePost.postcards.storm`) plus `bee.<act|team>.<n>`, `stamp.<act|team>` and `diary.<level>`.

**Story order in a round's mail**: invitation, programme (both at the pin, `onHallOpen`), then drama, laugh, suspense, the
letter (above or below), V., Dax, the corridor tip checked (Rounds II and IV, its own card), Pip, cliff, clue (and Round
VII's clue2), then the bee file and the stamp. Round V follows its script `order`. Round VIII: drama, Dax, laugh,
suspense, the turn (scene with the choice, Kwame, Dax, Dax's V. notes), Dax's letter, the three apologies, V., Pip,
cliff, clue. Round IX: …, letter, V., Pip, cliff (= Team Night's challenge), clue — then naming V. opens.

**Slots** are filled when a piece is delivered and frozen in its `d`: `{asked}` (the sum of `words[].asks`, or `r.asked`),
`{missed}` (the hall's last miss, as spelled), `{spelled}` (the hardest right by `SB_TRICK.diff`), `{weak}` (every hall
so far, each missed word once: `asks === 0` → noask, else its trick family; plain never ranked; the most frequent, a tie
to the most recent), `{w1..w3}` (postcards). No value → the script's own fallback; a raw token never reaches the screen.

## The Hive Post

Collection → Hive Post (`#/hive/post`). Every view carries the fiction line (L9). **Mail** lists chapters (a round, Team
Night, "Who is V.?", postcards and diary) in the order they first arrived, a drawn dot on unread ones, and "Read the next
new piece"; the **reader** shows one piece a screen with Read aloud (device speech via app3's `say()`, no clip),
previous / next (also ← →), All mail (also Esc). The invitation carries the Pronouncer's upright signoff; V.'s notes and
her closing letter slant left (`.hp-vhand`); Vesper's letters are violet; the sting and Mei's note are pencil. Pip's
word is a button: a tap shows and says its real meaning and adds it to "Pip's words" (on the Stamps view). The **bee
file** shows the place, the words spelled (drawn ticks and crosses), the one that beat the child with its family's line
from `slotLines.weak.byFamily`, the round's technique and its lesson (a button to the chapter), Team Night's origin calls,
and **one** button, "Add missed words to revision" → `addMiss(record, 'mark')` per missed word — exactly what
mockbee.js's `mbAddMissed` does (it cannot be called itself: it reads `state.mb`, the bee in progress) — then "On your
revision pile". The **Suspect Board**: five portraits (rivals' faces through `MOCKBEE.rivals`, a drawn figure for the
rest; the runner unnamed until Round VII's mail), the clue cards the mail has delivered, "Pin" → the five labels as
buttons (toggle, `aria-pressed`), and "Name V." once `accuseOpen` (a wrong name shows its own `lookAgainBy` line; the
right one delivers the reveal and the closing letter, whose three replies are buttons). The **Visitors' Book** shows the
visitors at stops the child has walked (the trail's own rule: a quiz pass, or Practice ≥ 70), with sources folded away.
**Stamps**: ten drawn stamps (nine halls + Team Night) with the best place, each opening its latest bee file.

**The moment card** (`.hp-moment`, outside `#root`, `data-trap`, `role="dialog"`) shows over the board the next time
`boardExtras` is called after a round, Team Night, a solved case, a postcard or a level-up — only the newest, only this
child's. "Open the Hive Post", Read aloud, Close; Esc closes (and nothing under it hears the Esc); a route change closes it.

CSS is injected once (`#hp-style`, prefix `hp-` — the cases build uses `cc-`), on the app's tokens; text on the accent is
the design system's `--action` / `--action-ink` pair (a11y.css darkens the ink in dusk). No emoji: every mark is an
inline SVG drawn here.

## Tests (each proved by breaking; the harness and the output are below)

| test | holds | |
|---|---|---|
| `circuit-data.cjs` (node, @check) | GENERATED; only what is shown (no author field, no author-only sentence: the spoilers stay out); same path as the script, both ways; §10 visitors; **8** (770 keys speakable, ≤ 60 words); **10** (no input in circuit.js); **11** (Mock Bee's BOTS incl. snowfox, Ravenmere vs §4.2, every seat a cast member); **12** (kid-safe families, under-eleven words, gloss phrases, the stigma scan, SB_UNSAFE_RE) | PASS |
| `circuit-mail.cjs` (node, @check) | **3** (365 days: nothing removed, reordered or rewritten); **4** (2 careful + 20 random paths reach the coda with every thread's last piece; the coda last; dax.helped changes one line); **5** (26 paths: all seven V. clues + three clearings in the mail when naming opens; Dax cleared with Round VIII before Round IX's invitation; no early or wrong naming delivers); story order (incl. out-of-order halls, Team Night first, cases' availability and lateness, the cases build's own fields kept and bounded); slots; L6; the bee file's one tap; replays; postcards and diary; pays nothing; no Math.random | PASS |
| `circuit-store.cjs` (node, @check) | **13**: the step (fresh, repair, keep, idempotent, the v1 walk, one shape with circuit.js), per-child isolation, ?demo saves nothing, storage only via store.js, nothing transmitted, not in the cloud allow-list | PASS |
| `circuit-post.cjs` (browser) | not on the first screen; the tab and `#/hive/post`; **L9** everywhere; **8/9** every delivered piece and every one of the 770 lines fits 390 × 844; Read aloud says the piece; 44 px, no emoji, **10** no input on every view, the moment card and the envelope; touch flows (Pip, the turn, pins, naming, the reply, the bee file, the envelope); keyboard (Tab/Enter, ← →, Esc, the moment card's focus, trap, Esc, Enter); **13** a ?demo season leaves the real storage clean; axe A/AA light + dusk | PASS |

**Proved by breaking** — `core-brkall.py` (session scratchpad): a scratch root of symlinks to `spellbound-app/` with ONE
file replaced by a copy carrying one edit, the test run with `SB_ROOT` pointing at it; the tree never touched. Every
break below was watched to fail (counts are the FAIL lines):

- circuit-mail: mail filtered by age → 2; no story-order wait → 2; held lines at Team Night → 3; clue2 dropped → 1;
  the turn printing its label too → 1; `file` without its flag → 1; fill() printing the raw token → 4; caseUpdate keeping
  only {state, hints} (the cases build's `dismissed` lost) → 1; caseUpdate copying every field unchecked → 1.
- circuit-store: v11_to_v12 out of STEPS → 5; the step replacing an existing record → 1; one record for every child → 3;
  persist() without the SB_DEMO guard → 1.
- circuit-data: hand-edited data → 2; Vale's role in the data → 3; Psyche moved to a stop without her word → 2; Suki
  back as 'panda' in mockbee.js → 1; "stupid" in Pip's note → 3; an `<input>` on the board → 1.
- circuit-post: the fiction line off the reader → 1; the corridor tip back inside the bee file → 1 (705 px > 672); the
  reader's controls at 36 px → 1 (then a tap times out); Read aloud saying the label → 1; a `<textarea>` on the board → 1;
  Escape not heard → 1; index.html's demo sandbox without its storage swap → 1. Two first versions could not fail and
  were fixed: the bee file's intro back in the open still fits (that break was replaced), and the ?demo check's probe
  page was re-seeded by the context's own init script (it skips storage-probe.html now). The screen height is now
  measured below the sticky top bar (672 px at 390 × 844, not 776).

Existing tests run on this build: the data gate `node tests/lib/run.cjs --node-only` (47 pass, 0 fail), app3-split,
screens-lazy, store-seam, first-load, trust-v2, hud-emoji, touch-targets, back-pill (see the commit message for the run).

## For the integrator — what other builds must wire

1. **trail.js / mockbee.js (HALLS)** — checked against that build's worktree on 15 Oct: it calls `boardExtras`,
   `hallUnlocked`, `state`, `chip`, `onHall` (with `above`, `asked: [{w, ok, asks}]`, `asks`, `spelled`, `lastMissed` —
   all read here), `onTeamNight`, `hallFiled`, `line`, `openVisitor`/`open('visitors', id)` and `visitorFor` — every one
   exists. **Still to wire there**: `SB_CIRCUIT.onHallOpen(act)` when a hall's pin first shows (leg 4 reached and
   `hallUnlocked`) — without it the invitation and programme arrive with the result instead; and
   `onRegionDone(act)` when a region is walked end to end (the guide's postcard).
2. **app3.js (level-up)**: nothing calls `onLevelUp(level)` yet — the one place a level rises (gainXp) should, guarded,
   after `lazyNeed('circuit')`. This build could not edit app3.js beyond the `SCR_ACTS` line.
3. **Cases**: `caseState` / `caseUpdate` / `caseLate`; a case exists in `cases` (state `'unseen'`) from its trigger
   round's mail; `SB_CIRCUIT_CASES.pins(act)` is dropped into `boardExtras`. Clue cards ride the round mail already.
4. **Team Night (mockbee.js)**: `onTeamNight({place, of, words, calls:{right, of}, levelMiss?, band?})`; gate the pin on
   `SB_CIRCUIT.teamOpen()`. `levelMiss` chooses `levellingMiss` (default: the last word was missed); `band` defaults to
   the child's age band (6–7 plays the 8–10 lectern).
5. **A Hive Post tap made before the word tier lands is held for it** (app3 `tapAct` holds every action not in
   `WORDLESS`); adding `hivePost` to `WORDLESS` in app3.js would let the post answer at once (it reads no word).

## Decisions taken here

- **The envelope floats** (`position:fixed`, bottom-right above the tab bar) rather than sitting absolute in the board:
  the halls build puts the extras inside the panning painting (see the API table).

- The **invitation and programme** arrive at the hall's pin; everything else of a round arrives with its result.
- **Dax's corridor tip, checked** is its own card right after his tip (the bee file was too tall to hold it on one phone
  screen); its heading is the script's `beeFileFakeTipIntro`.
- **The turn's choice** sits on the turn's first card; the rest of the turn arrives whether or not the child chooses
  (Dax's clearing must reach every path); only `turn.choice.line[helped]` depends on it.
- **The sting, its answer, Mei's note and the coda** wait together for the closing letter, so the coda is always last.
- **Moments live in memory** (not in the record — §3.3's shape has no place for them): a reload before the board drops a
  moment, never mail.
- **The Visitors' Book** shows met visitors in full and one quiet line for the rest ("n of 10 met").
- The bee file's fallback for "why it beat you": nothing for a plain-family word (advice is never a diagnosis).

## Left

- The wiring above (onHallOpen, asks/above, the non-panning layer, onRegionDone, onLevelUp).
- Screenshots of the Hive Post and the Suspect Board for the definition of done are the integrator's with the halls in.
- The Visitors' cards are step 8's (the accuracy re-check with opened pages, `ownerQuestions[id=accuracy-reverify]`).
