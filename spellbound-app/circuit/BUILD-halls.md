# The Bee Circuit — build notes: the Halls and Team Night (build steps 3 and 7)

Brief: `circuit/BEE-CIRCUIT.md` §3.1, §3.5, §8.2, §13, §14 steps 3 and 7; `circuit/AMENDMENTS.md`; `circuit/review/REPORT.md`
(14 Oct decisions: Suki is `snowfox`; Team Night seating as written; Dax seated in every band's final); `circuit/script.json`
build rules `hall-fields`, `scripted-outcomes`, `story-order` (the pins' half), `no-placing`, `team-night`.

## What was built

### `mockbee.js` — two more doors into the same hall
- **A venue** — `app.mbOpen({venue, family, seed, replay})` (app3's lazy stub forwards the object unchanged). Every existing
  mode and call form is untouched (`mbOpen()`, `mbOpen('champ')`, `#/mockbee/family`; mockbee-sim / -stage / -faces green).
  - **The field** is `HALL_FIELDS[band][round]` (build[hall-fields].fields, derived from the band's field plus the round's
    additions — `tests/circuit-halls.cjs` holds the table to script.json) plus the child. The chairs an invitation names are
    kept (I: Pip 2, Nova 3 · III: Rafi 4 · IV: Mira 1 · IX: Vesper 1), and in Round V Kwame sits in chair 1 with the child
    beside him in chair 2 (so his first word after round one is the first turn of round two — nobody can be out yet). A
    rival from outside the band spells at the band's top skill ("the headliner's skill follows the band's curve"); names,
    ages, tells, specialities and faces never change.
  - **The words**: 60% the region's own (the `family` the Atlas hands over: the passed stops' whole lists and teaching
    words), 25% the revision pile (`purpose:'review'`), 15% one band up (`tier +1`) — all through `nextWords`; a shortfall is
    the bee's ordinary draw. The words the script names (reconnaissance, triskaidekaphobia, Mira's Greek-first word) are
    drawn once through the door and never dealt to anyone else.
  - **The plate** is the region's own panorama, `app-art/map-<act>-pano.webp`, drawn at its far end — where the painter
    put the venue (the Hive Gates … the Grand Marquee). No new art.
  - **The script** (build[scripted-outcomes]): `circForce` decides the forced turns (once per rival attempt, on stage and in
    "Finish now"), `circAsks` shows the Pronouncer's Chair requests a rival makes (Mock Bee's rivals never ask), and every
    forced event goes to `g.hallLog`. Round I: Pip blurts (no write-along; forgiven), then misses his first word after round
    one and sits down for good · II: Theo's first turn asks every request on file and is right; every turn asks the part of
    speech once · III: Rafi right while more than three rivals stand · IV: Mira asks the origin every turn; her first word is
    Greek-first, with thunder (WebAudio noise, the one effects volume, never in Calm or with sound off) and a stage flash
    (off under both Reduce motion settings) · V: reconnaissance, missed by one s, gone for good (the all-miss rule does not
    bring him back) · VI: Ines and Kwame right while more than three rivals stand · VII: triskaidekaphobia to Suki with five
    requests (origin answered "English", as the library gives it), right; never served to the child · VIII: Dax right in
    round one, a miss later (forced at the band's late round or the final two if the round has not brought it), never at the
    cap, and the hall cuts to the result card (no confetti) · IX: the lights go out at round ⌊K/2⌋ with Dax and Pip forced
    right until then; after it every rival turn shows a request, Dax's first is the definition, Vesper's the language of
    origin, and her tell is never read again; Vesper outlasts every other rival; the child out first → Vesper wins; Vesper
    missing first → the child spells the championship word and finishes above either way; the cap with both standing → no
    co-champions, the championship word to the child (right: above; missed: Vesper spells it, below).
  - **No placing / the cap** (build[no-placing]): `report.above` is the child against the letter's headliner (Nova in Round
    I). In Rounds I–VIII, time called with the child and that headliner standing → the headliner takes one more word and
    misses it first; Round VIII's Dax never stands at the cap at all.
  - **Pay** is Mock Bee's to the coin (answer per word right, the contest event on the podium at 70%, nothing for finishing).
    A hall moves neither the Mock Bee level (`SB_LEVEL.after` is the Bee's) nor the Bee's own played/won record.
  - **At the finish**: `lazyNeed('circuit', () => SB_CIRCUIT.onHall(act, r))`, once, guarded. `r` = the contract's
    `{place, of, words:[{w, ok, asks}], missed:[w], replay}` plus `above, headPlace (= letterPlace), letter, champion, co,
    asks, asked:[{w, ok, asks:[…]}], spelled (hardest right, by SB_TRICK.diff), lastMissed, round, band, seed, log` — what
    circuit.js's `hallLog` and the slots ({asked}, {missed}, {spelled}) and the placing read. **{asked} is counted the
    script's way** (build[slots]: the sum of `g.mine[].asks.length`), so "Say it again" is a request like any other — the
    first draft left it out; each word also carries its own count. Leaving before the finish reports nothing and goes back
    to the region's board.
- **Team Night** — `app.mbOpen({team:true, seed, replay})`: §8.2 as written, with the REPORT.md seating (the child + the
  band's lectern — 6–7 plays the younger one — and Dax captaining from the bench). Eight words a side, Ravenmere first; the
  Circuit's 3rd and 6th are the child's own, the 7th is the captain's drama (Latin to Rafi / Kwame, then the origin asked
  and re-called to Mira / Ines — the word Greek-first at the younger lectern, French-first at the older, preferring one
  whose origin also names Latin), the 8th is the levelling word (one the child's record shows mastered, `c.mast` box 2+,
  never a legacy mark), then the tiebreaker (Sloane misses; Vesper asks three questions and spells it).
  - **The caller**: the word is said, the Pronouncer answers (Definition, Part of speech, Origin, Sentence, Say it again,
    Alternate pronunciation — no clock); "Needs questions" is a homophone and the definition says "It sounds like another
    word"; no origin on file is "Nobody's heard it"; a language nobody at the lectern owns is "Steady beat". A call is
    graded on the first language named. 1–9 marks a call, Enter (or Send it) sends it; it may change until then.
  - **The outcome** (L6): Ravenmere's misses are drawn so they lead by one or two after each of their words and by exactly
    one before the levelling word; the levelling word always ends right (the second try: one more lectern teammate's help
    after each miss — Vesper gives none — then the answer and Continue); the Circuit wins by one. **Replay** (`replay`, or
    "Play the second team"): Ravenmere's second team never leads after its own word, the Circuit wins by one or more, no
    story beats.
  - **Pay**: an answer coin per own word right first time; the contest event once when own words + calls are ≥ 70% right
    (≥ 4 items). A second try is help, never paid, never mastery evidence.
  - **Ravenmere's faces** are existing, retired art (avatars.js ARCH, still drawn by `byId`): Sloane `swan`, the twins
    `cranefold` / `goldencrane`, Arjun `paperplane`, Mei `flutterfold`; stand-ins `fanfold`, `boatfold`, `hopfold`, `breeze`,
    `wish` when the child wears one. None sacred, none a Circuit rival's face or stand-in.
  - **At the finish**: `SB_CIRCUIT.onTeamNight({place, of, words:[{w, ok, asks}], missed, calls:{right, of, list}, replay,
    levelMiss, lectern, band, score, margin, mastered, seed, log})` — `levelMiss` (the levelling word missed first) picks
    circuit.js's levelling or levellingMiss beat, `lectern` its drama beat.
- Story text: none is written here, and **none of the script's Team Night beats is announced on the stage**. They are
  recaps that say how each word ends ("She spells it.", "This time it ends right"), so they reach the child as the
  Circuit's mail after the night (circuit.js `deliverTeam`); the stage shows only neutral game copy ("Your call", "Second
  try. Your teammates can help.", "The tiebreaker. The captain calls it to Vesper.").
- Style: the venue / Team Night CSS is injected by mockbee.js itself (`#mb-circ-css`) — index.html is untouched; nothing new
  on the first screen.

### `trail.js` — the overlay on the boards
- **Bee Hall pin ×9** — one per Honey region board, in the last leg (x 77–81.5% of the panorama, as far from the road, the
  landmark, the hero, the pokes and the caches as that strip allows: `circSpots`, computed once per region), a lectern and
  bell drawn in SVG on a gold-rimmed medallion, ≥ 56×56 hit area, "Bee Hall" label (a drawn check once played). Shown when
  the REACH is in the region's fourth leg (or past the region; any later lap; testing unlock) AND
  `SB_CIRCUIT.hallUnlocked(act, c)`; never locked once shown (replayable — `replay` is passed from `state(c).halls[act].done`).
  Not an `.atlas-stop`, not counted, opens nothing.
- **Team Night pin** on the Big Stage board, beside the hall, once `SB_CIRCUIT.teamOpen(c)` (Round IX's mail is in); a
  Circuit without `teamOpen` falls back to `halls.stage.done`.
- **The mail hooks**: `SB_CIRCUIT.onHallOpen(act)` when a hall's pin is drawn (the invitation and programme), and
  `onRegionDone(act)` for every region walked end to end (every stop and checkpoint of it on this lap's road; any later
  lap) — each told once a page per child, off the render; when one returns `true` (mail arrived) the board redraws so the
  Circuit's envelope shows.
- `SB_CIRCUIT.boardExtras(act)` dropped into every Honey board's overlay layer (same % coordinate space as the pins).
- **Atlas chip** in the overview header: `SB_CIRCUIT.chip(c)` if the Circuit offers it, else "The Bee Circuit · Season 1";
  tapping it calls `SB_CIRCUIT.open()`.
- **Visitor line** on an ordinary stop's card: `SB_CIRCUIT.visitorFor(unitId)` → "Visitor: <figure>" (string, or an object's
  `figure | name | who`) → `SB_CIRCUIT.openVisitor(id)` if it exists, else `SB_CIRCUIT.open('visitors', id)`.
- Before the Circuit is on the page nothing extra is drawn; a board asks for `lazyNeed('circuit')` once, and boot-lazy's
  own soft redraw (every landing has one) draws the pins when it lands — no second redraw of ours. A hook that delivers
  mail asks for one SOFT redraw on the next frame (`SB_RENDER_SOFT`, so the keyboard focus stays), coalesced, only while a
  board is up. Actions `hallOpen teamOpen circuitOpen visitorOpen` are on `TRAIL_ACTS` (app3.js, the only app3 change).
- Pin CSS is injected by trail.js (`#circ-pin-css`).

## The contract as used (window.SB_CIRCUIT — CORE's; always guarded, always after lazyNeed('circuit'))
Built against CORE's `circuit/BUILD-core.md` (branch worktree-agent-a177fdd5fb0c47f3d), which this branch merges to test
against the real file. Called: `onHallOpen(act)`, `onHall(act, r)`, `onTeamNight(r)`, `onRegionDone(act)`,
`hallUnlocked(act, c)`, `teamOpen(c)`, `boardExtras(act)` (its envelope is `position:fixed`, so it can ride in the panning
board's layer), `visitorFor(unitId)` (an object: `.figure` is shown), `openVisitor(unitId)` (else `open('visitors', id)`),
`open()`, `chip(c)`, `state(c)` (read as `.halls`), `hallFiled(act)` (from Mock Bee's "Add missed words to revision" in a
hall). Not called: `line(path)` (see Story text above), `onLevelUp` (app3's, not this build's). Every call is guarded: a
page without the Circuit, or a Circuit without one of these, plays the same and draws nothing extra.

## Tests
| test | kind | holds |
|---|---|---|
| `tests/circuit-halls.cjs` | node (VM, fake clock), ~20 s | TABLES, FIELDS (hall-fields), SCRIPT I–IX (scripted-outcomes, nine halls × 2 bots × 3 bands × 10 seeds = 540; `HALL_SEEDS=50` = the rule's 50, 2,700 halls, all green), PLACING + CAP (no-placing), PAY (§13 t6), REPORT (and the shape circuit.js reads), WORDS (60/25/15 through the door), RANDOM |
| `tests/circuit-team.cjs` | node (VM), ~20 s | ROSTER (+ faces), OUTCOME (§13 t7: wins on every seed, the levelling word always counts), CALLS, DRAMA, SECOND TRY, PAY (§13 t6), REPLAY, REPORT (levelMiss, lectern), RANDOM (`TEAM_SEEDS=50`: 600 nights, all green) |
| `tests/circuit-halls-board.cjs` | browser, ~7 min | OVERLAY (§13 t1), GATES (t2), STORY ORDER (+ onHallOpen, onRegionDone, teamOpen), PHONE (t9, 390×844 and desktop), FAMILY (t14), keys and touch, no emoji, no leak — against a stubbed contract — and **REAL**, against CORE's real circuit.js (skipped, with a note, on a tree without it). `ONLY=<regex of overlay, gates, phone, desk, family, real>` |

The node tests stub `SB_CIRCUIT` in the VM; the browser test injects a stub before boot (its header documents it, driven
by `window.__circCfg`) and answers circuit.js / circuit-data.js with an empty script so the real file cannot land over it;
its REAL section uses nothing stubbed. On this branch (merged with CORE): the Meadow's hall stands for a child at the
Strait and the Library's does not; the pin's `onHallOpen` delivers `rounds[0].pieces.inv` and `.prog` and the board shows
CORE's envelope; the hall played to its end (the child out in round two, Finish now) reaches `onHall` — `halls.meadow`
recorded, `bee.meadow.1` and `stamp.meadow` in the mail — and the Library's hall then stands.

### Proved by breaking (the tree never touched)
Node tests: `MB_SRC=<scratch copy of mockbee.js with ONE change>`; browser: `SB_ROOT=<scratch root of symlinks with ONE
file replaced>` and the section's `ONLY`. Every break was watched to fail; each test's header lists its own.
- **circuit-halls** (11): Pip never sits → SCRIPT I · Kwame's slip one *n* short → SCRIPT V's slip check — **which first
  passed**: the check asked only that he missed, so the stage's spelling is now logged (`said`) and read
  ("reconnaisance") · Vesper seated in VIII → TABLES + FIELDS · no cap miss → both CAP · contest paid for finishing →
  both PAY · no family words → WORDS · a quit hall reporting → REPORT · SB_CIRCUIT called without `lazyNeed` → REPORT ·
  `Math.random` in a rival's turn → RANDOM ×2 (+ "plays the same with no SB_CIRCUIT") · "Say it again" left out of the
  asks count → the asks check (5 over 5 words, not 15) · no `headPlace` → the shape check.
- **circuit-team** (9): the levelling second try ending wrong → OUTCOME ×2, SECOND TRY, REPORT · a lead of three
  allowed → OUTCOME ×4 · contest without the 70% merit → PAY ×2 · Sloane in Nova's face → ROSTER · no "Needs questions"
  → CALLS ×2 · the second team free to lead → REPLAY · every help open at once → the escalation check — **which first
  passed**: it counted enabled buttons only; it now asks `tnHelp` itself for a teammate not yet open · `Math.random` in a
  teammate's turn → RANDOM · `levelMiss` always false → REPORT ×2.
- **circuit-halls-board** (13): a pin drawn as an `.atlas-stop` → OVERLAY ×2 · the reach ignored → "exactly the reached
  regions" · `hallUnlocked` ignored → STORY ORDER · pins before the Circuit lands → OVERLAY + STORY ORDER · a stop
  refused until a hall is unlocked → GATES · a 30 px unlabelled pin → PHONE (33×33) · the chip's CSS leaking onto the
  family bar → FAMILY ×2 (checkShell: 62 px bar) · a call sent on its pick → the keys check · the word on the caller's
  card → the leak check · `onHallOpen` never told → STORY ORDER + REAL (no invitation at the pin) · `onRegionDone` told
  for every region → STORY ORDER · the Team Night pin by the Round IX record instead of `teamOpen()` → the teamOpen check
  · mockbee never telling `onHall` → both REAL checks after the hall. Its first runs also caught faults of its own: lobby
  geometry measured mid lazy-redraw, `innerText` under `text-transform`, and — on the merged tree, where more idle files
  land — a board snapshot and a pin tap racing a soft redraw (`board()` now waits for rendering to go quiet). A broken
  trail.js used to cost 27 × 30 s of waiting; a board that never draws now fails at once.

### Kept green (run here, one at a time, on the tree merged with CORE)
Node: `run.cjs --node-only` **49 / 49** (CORE's circuit-data / -mail / -store, mockbee-sim, word-door, pay-path,
no-random-rewards, app3-split …). Browser, through `run.cjs`: circuit-halls-board (all sections, REAL included),
mockbee-stage, mockbee-faces, live-prompts, hud-emoji, touch-targets, atlas-layout, living-atlas, living-meadow,
living-advanced, home-here, home-continue, feed-screen, first-load, and CORE's circuit-post.

Two things seen on the way, for whoever meets them next:
- **atlas-layout §8 ("390px zoomed: the stop card stays inside the window")** failed 4 of 10 runs on the merged tree
  while the first cut of trail.js redrew the board itself when the Circuit landed (`circKick` → `render()`), on top of
  boot-lazy's soft redraw for the same landing (the child in §8 reaches no hall, so no pin or hook was involved); it
  passed on CORE's tree. With that extra redraw gone it passed 4 runs of 4. The likely cause is a second redraw landing in
  the middle of a zoomed pick; it was not proved further, so treat a red §8 on this branch as worth a look.
- **circuit-post** (CORE's) failed once under a loaded machine — its moment card covered the envelope it then tapped —
  and passed on every rerun; its `settle` was a fixed 120 ms sleep. (Batch 3, 15 Oct 2026: it waits for rendering to go
  quiet and two frames, and passed beside four busy loops.)

## Left, and what the integrator must wire
1. **This branch merges CORE's** (worktree-agent-a177fdd5fb0c47f3d at c7e7484c0) so the halls are tested against the real
   circuit.js; merging both branches into the integration branch is a no-op for those commits. Nothing in CORE's files was
   edited here.
2. `app3.js` changed only on the TRAIL_ACTS line (`hallOpen teamOpen circuitOpen visitorOpen`); CORE changed only the
   `SCR_ACTS.scrMe` line. If another branch touched TRAIL_ACTS, merge by adding the four names.
3. **Still unwired, and not this build's files**: `SB_CIRCUIT.onLevelUp(level)` (app3's `gainXp`, per BUILD-core.md) and
   `hivePost` in app3's `WORDLESS` (so a Hive Post tap does not wait for the word tier). The cases build's pins arrive
   through `boardExtras`, which every Honey board already draws.
4. `onRegionDone` is told when a Honey board or the Atlas overview is drawn with the region walked end to end — the
   next time either is drawn after the last stop is walked, not inside the quiz itself. The postcard also needs three of
   the child's own mastered words from that region (CORE's rule), so a child with fewer gets none yet; the hook is asked
   again on the next page load.
5. ~~Not done: no games-bots driver for the halls (Mock Bee's driver covers the engine; the halls' pay is held by
   circuit-halls PAY); a Team Night REAL walk in the browser (the node test plays 204 nights against the contract, and
   circuit-mail plays Team Night's mail)~~ **Done 15 Oct 2026 (batch 3)**: `tests/bots/_hall.mjs` (hall/meadow, hall/strait,
   hall/stage in games-bots) and `tests/team-night-walk.cjs` (a whole night by touch and by keyboard against the real
   circuit.js; it found the Mock Bee's letter keys 42.7px wide at 390 — fixed). The Visitor card's content is CORE's (this
   side draws the line and calls open).
