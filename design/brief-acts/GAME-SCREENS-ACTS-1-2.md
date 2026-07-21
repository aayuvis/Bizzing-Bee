# GAME SCREEN VISUAL BRIEF — ACTS I–II · THE 12 COMPOSED PLAY SCREENS
### "Bizzy and the Great Unspelling" · what the player actually sees, assembled
*Child of `../CLAUDE-DESIGN-BRIEF-SAGA.md` (§0 art direction is LAW), `DESIGN-BRIEF-ACT-1.md`, `DESIGN-BRIEF-ACT-2.md` (asset filenames referenced, never re-specced) and `../QUEST-SAGA-DESIGN.md` (mechanics). This brief specifies COMPOSITION ONLY: zone layout, the five illustrated screenshot moments per game, juice timing, phase transforms, readability law.*

---

## G0 · GLOBAL SCREEN LAW (applies to all 12 games)
- **Canvases:** landscape 16:9 (1600×900 reference) and portrait phone 9:19.5 (390×844 reference). Diagrams below use `%` of the short/long axis. **Safe area:** 4% inset all sides landscape; portrait respects notch (top 6%) and home bar (bottom 4%). No HUD or tappable element outside safe area.
- **THE SPELL-CARD STANDARD (Moment c of every game):** every `card-spell-*` / `panel-*` opens center-screen at 60% width (landscape) / 92% width (portrait), squircle frame, ink outline. Behind it the playfield stays FULLY VISIBLE but dimmed by a **Deep `#4A32A8` scrim at 45% opacity — NEVER desaturated** (grey means unspelled; a paused world is dark, not grey). Playfield motion freezes mid-pose (moths mid-flap, tiles mid-tumble) so the world visibly waits. Card entry: scale 0.85→1.02→1.0 over 220ms ease-out; exit on correct: card converts to the game's reward FX and flies to its meter (350ms).
- **SHARED JUICE CONSTANTS** (referenced below as [TAP][POP][SHAKE][BLOOM][GREY]):
  - **[TAP]** any pressed element: squash to 92% in 60ms, release overshoot 104% 90ms, settle 60ms.
  - **[POP]** correct feedback: element scales 1.0→1.25→1.0 (180ms) + `fx-letter-restore-sparkle` + 8 honey `#F0B429` particles arcing up 400ms.
  - **[SHAKE]** wrong/impact: 200ms screen shake, 4px amplitude decaying, plus `#C43D5A` flash ring 150ms on the offending element. Never a full-screen red flash.
  - **[BLOOM]** word/round complete: `fx-recolor-bloom` radial saturation wipe from the completion point, 600ms.
  - **[GREY]** danger encroachment: `fx-grey-creep` from the game's canonical grey edge (per act briefs), 2% per second while danger persists, healing at 4%/s when resolved.
- **READABILITY LAW (baseline, tightened per game):** the target word ≥ 32px Sono cap-height landscape / 28px portrait, always on a solid wax-cream `#FFE9B8` or ink plate — never naked over parallax. Timer and lives readable at arm's length: ≥ 40px icons. Any letter the player must act on gets an ink outline + drop shadow so it survives busy backdrops. HUD contrast ≥ 4.5:1 against its plate.
- **VICTORY BURST STANDARD (Moment e):** stars punch in one at a time (star 1 at 0ms, 2 at 250ms, 3 at 500ms, each [POP] + chord), then the act gem (`gem-act1-amber-hex` / Act II star gem) descends into its slot with a 400ms bounce; confetti (existing) behind; playfield visible beneath at full restored color — the win screen sits ON the re-colored world, never on a void.

Diagram key: `═` HUD band · `─` soft zone edge · `▓` playfield · `☺` character anchor · `※` input zone note.

---

## 1 · HONEYCOMB RUN (Ch 1 · Pac-Man maze · `bg-meadow-dawn`)
**LANDSCAPE** — playfield owns **78%** of screen area.
```
╔═[hud-maze-timer 3:00]══════[hud-nectar-counter]═╗ 8%
║ ▓▓▓▓▓▓▓▓▓▓ hex maze, centered, 4:3 ▓▓▓▓▓▓▓▓▓▓ ║
║ ▓ meadow mid-layer visible in side gutters    ▓ ║ 84%
║ ▓        ☺ bizzy-top (maze center start)      ▓ ║
║ ▓  ※ whole playfield = swipe zone (4-dir)     ▓ ║
╚═[cursor-swipe-arrows, first play, bottom-ctr]═══╝ 8%
```
**PORTRAIT** — maze fills width, playfield **72%**.
```
╔[hud-maze-timer]──[hud-nectar-counter]╗ 10%
║ ▓▓▓ hex maze, square, full width ▓▓▓ ║
║ ▓▓▓      ☺ bizzy-top center      ▓▓▓ ║ 72%
║ ▓▓▓ meadow layers crop to slivers▓▓▓ ║
║ ※ thumb swipe pad (grass strip)      ║ 18%
╚══════ home-bar safe area ════════════╝
```
**FIVE MOMENTS**
- `screen-honeycomb-run-a` ROUND START: full-color center ring of hex cells around Bizzy, outer two rings already grey `#C7C0B6`; three moths patrolling the grey rim; one golden-flower bud (f1) glinting two cells away; swipe arrows pulsing; dawn light raking from the right.
- `screen-honeycomb-run-b` ACTIVE: Bizzy jelly-powered (gold aura) mid-corridor, two flee-state moths scattering ahead, a trail of 5 re-bloomed cells behind her still sparkling, nectar counter mid-tick, timer at 1:42 (honeycomb cell half-drained).
- `screen-honeycomb-run-c` WORD MOMENT: `card-spell-golden` open per G0 — behind the Deep scrim the maze holds: a moth frozen one cell from Bizzy (stakes visible), the tapped golden flower at f2 half-open directly under the card, its gold light leaking up onto the card's lower edge.
- `screen-honeycomb-run-d` DANGER: 0:12 on the timer (cell nearly empty, rim flashing), moths converging from three corridors, [GREY] creeping one ring inward, Bizzy cornered — but one lit golden flower visible top-left (the readable escape).
- `screen-honeycomb-run-e` VICTORY: per G0 standard over the fully re-bloomed maze — every cell wax-cream, golden flowers at f3 ringing Bizzy, moths gone, `fx-moth-poof` dust settling at the edges.
**JUICE** — swipe: Bizzy leans 8° into turn + 2-frame hover speedup (instant). Nectar dot eaten: dot [POP] small (100ms) + counter tick bounce. Cell re-bloom: `tile-hex-rebloom` 3-frame (240ms) rippling outward one cell per 60ms. Royal jelly: full-screen honey vignette pulse 300ms + moths flip to flee frames with [SHAKE]-lite (2px). Moth touch (fail): [SHAKE] + Bizzy spin-out 400ms + one ring re-greys.
**READABILITY** — timer honeycomb ≥ 48px; moths must read against BOTH grey and color cells (their `#575046` ink outline guarantees it); the golden flower is always the brightest object on screen — nothing else may use its bloom gold at full saturation.

## 2 · KEEP FLYING (Ch 2 · flappy · `bg-open-sky` 3-layer parallax)
**LANDSCAPE** — playfield owns **86%**.
```
╔═[hud-pot-counter 10 pips]════[hud-secret-trail]═╗ 8%
║ ▓ thorn-wall ▓▓▓▓ flight corridor ▓▓▓▓ thorn ▓ ║
║ ▓   ☺ bizzy-side-fly LOCKED at 30% from left  ▓ ║ 86%
║ ▓   scroll → · honey-pot shelves drift left   ▓ ║
║ ▓ ※ ENTIRE screen = tap-to-flap               ▓ ║
╚══[hud-altitude-fuel, vertical, right edge 6%]═══╝
```
**PORTRAIT** — the tall corridor is flappy's native shape; playfield **92%**.
```
╔[hud-pot-counter]──[hud-secret-trail]╗ 8%
║ ▓ thorn caps from top ─ scroll →  ▓f║
║ ▓  ☺ bizzy-side-fly @25% height   ▓u║
║ ▓  honey-pot shelves drift left   ▓e║ 92%
║ ▓  thorn columns from bottom      ▓l║
║ ▓ ※ ENTIRE screen = tap-to-flap   ▓ ║
╚═════[hud-altitude-fuel = right rail]╝
```
**FIVE MOMENTS**
- `screen-keep-flying-a` ROUND START: Bizzy hovering at anchor, first honey-pot waiting on its cloud shelf mid-screen, thorn walls parting ahead, Smudge face cameo faint at 40% on the far LEFT edge behind her — flight direction reads instantly as "away from the face, into color."
- `screen-keep-flying-b` ACTIVE: flap-burst frame with `fx-flap-puff`, wind-gust ribbon crossing, a cloud-letter glyph "R" drifting in the mid layer, 4/10 pots banked, one greyed re-queued pot drifting back into the stream behind.
- `screen-keep-flying-c` WORD MOMENT: `card-spell-pot` per G0 — Bizzy frozen PERCHED on the pot's rim (landed state, rim glow) beneath the card; parallax layers halted mid-scroll; the grey wedge visibly paused at the left third.
- `screen-keep-flying-d` DANGER: fuel gauge under 20% flashing, Bizzy in stall droop-frame falling below the shelf line, thorn tips `#C43D5A` inches from her wings, [GREY] wedge swollen past mid-screen, the face cameo sharpened.
- `screen-keep-flying-e` VICTORY: per G0 on the 10th banked pot — Bizzy + optional bumble-cling perched, `smudge-face-retreat` breaking apart in the distance, forward sky saturated to full, all 10 pips lit gold.
**JUICE** — tap: [TAP] on Bizzy + flap-burst held 1 frame + 6px rise snap. Pot banked: `fx-honey-splash` 4-frame + pip flies from pot to counter (300ms arc). Cloud-letter collected: glyph [POP] + trail dot lights with a chime. Thorn graze: [SHAKE] + feather-petal puff + fuel gauge chunk drains with a glug (250ms). Stall: 300ms slow-motion dip (0.6× speed) so the fail is readable, not cheap.
**READABILITY** — fuel gauge fill vs glass ≥ 3:1 plus honey color coding; cloud-letter glyphs must NOT resemble banked UI letters (they stay puffy, no plate); thorn tips always crimson-tipped so hazards are color-coded even at max scroll speed.

## 3 · BEE GRAND PRIX (Ch 3 · side racer · `bg-grandprix-track`)
**LANDSCAPE** — playfield owns **70%** (the word-card stream earns its band).
```
╔═[hud-wordcard-stream ← cards slide in]══════════╗ 14%
║═[hud-lap-counter]══[hud-position-flag]══════════║ 6%
║ ▓ track ribbon, 4 racers stacked in depth     ▓ ║
║ ▓   ☺ bizzy-side-fly at 35% from left         ▓ ║ 70%
║ ▓ ※ tap track = burn nitro · tap card = spell ▓ ║
╚═[hud-nitro-pips ×3, bottom-left]════════════════╝ 10%
```
**PORTRAIT** — word cards dock at the thumb; playfield **62%**.
```
╔[lap]──[position-flag]──[nitro-pips]╗ 12%
║ ▓ track ribbon, 2.5 depth lanes  ▓ ║
║ ▓  ☺ bizzy-side-fly @35% left    ▓ ║ 62%
║ ▓  rivals jockey in depth        ▓ ║
║ ▓ ※ tap track zone = burn nitro  ▓ ║
╠═[hud-wordcard-stream — enlarged,   ╣ 18%
║   ※ thumb-reach spell answers]     ║
╚════════════════════════════════════╝
```
**FIVE MOMENTS**
- `screen-grand-prix-a` ROUND START: all four at `banner-start-finish`, Waggle's goggles glinting, Drone Dan tucked, Bumble waving, countdown "3" as a giant Fraunces comb numeral center-screen, first word card already sliding into the stream.
- `screen-grand-prix-b` ACTIVE: lap 2, Bizzy drafting Drone Dan through a `flower-arch` (boost-lit), nitro pips 2/3 banked, pollen cloud looming, position flag flipping 3rd→2nd with a whoosh streak.
- `screen-grand-prix-c` WORD MOMENT: no full card — THE STREAM IS THE WORD UI: the active card enlarges 130% in-band with Sono tile slots while the race RUNS BENEATH at full speed (this game's word moment is uniquely live; scrim only tints the stream band). Bizzy's eyes-forward, racers mid-jockey below.
- `screen-grand-prix-d` DANGER: final lap, Waggle half a length ahead crossing into frame-right, Bizzy pollen-slowed (mustard puff clinging, speed lines dead), zero nitro pips, finish banner visible small on the horizon — everything says "answer a card NOW."
- `screen-grand-prix-e` VICTORY: per G0 over the finish banner — Bizzy breaking the checkered ribbon mid-nitro-flame, rivals blurred behind, drone-dan-salute inset portrait, petals raining with the confetti.
**JUICE** — nitro fire: `fx-nitro-burst` + camera FOV kick (track stretches 4% for 200ms) + speed lines 500ms. Correct card: card converts to a flame pip that arcs into the nitro HUD (350ms) [POP]. Overtake: position flag flip 150ms + rival wobble. Pollen hit: `fx-pollen-poof` + controls-heavy feel shown as droop 500ms. Arch pass: `fx-drift-sparks` + arch boost-glow 300ms.
**READABILITY** — word-card letters ≥ 36px even at stream size (cards are the gameplay); position flag numeral ≥ 56px Fraunces; Bizzy's silhouette must stay separable from rivals at full blur — she alone carries the honey-flame trail color.

## 4 · WORD HIVE (Ch 4 · anagram builder · `bg-queens-hall`)
**LANDSCAPE** — playfield (rack + answer + comb) owns **60%**; the hall is scenery above.
```
╔═[honey-timer-drip]═════[meter-comb-fill 20]═════╗ 10%
║  hall + Queen's dais visible (no play here)     ║ 30%
║─[list-found-words, left rail 18%]───────────────║
║ ▓ [row-answer-build — letters land here]      ▓ ║ 22%
║ ▓ [rack-honeycomb: THUNDERSTORM tiles]        ▓ ║ 28%
╚═[chip-word-length]═══※ drag or type════════════╝ 10%
```
**PORTRAIT** — rack grows for thumbs; playfield **60%**.
```
╔ hall banner — Queen watches (scenery)╗ 15%
╠[honey-timer]──[meter-comb-fill 20]═══╣ 10%
║ ▓ [row-answer-build]  [found-chip] ▓ ║ 15%
║ ▓                                  ▓ ║
║ ▓  rack-honeycomb — tiles ≥64px    ▓ ║ 45%
║ ▓  ※ drag or type                  ▓ ║
╚═[chip-word-length]═══════════════════╝ 15%
```
Found-words list collapses to a count chip that expands on tap.
**FIVE MOMENTS**
- `screen-word-hive-a` ROUND START: THUNDERSTORM materializing tile by tile into the rack (staggered 80ms drops), Queen riddling portrait in the dialogue frame just clearing, window shafts lighting the empty answer row like an invitation, comb meter 0/20 gleaming.
- `screen-word-hive-b` ACTIVE: tile "S" in lifted state under Bizzy-hand cursor with `fx-letter-lift-glow`, STORM half-built in the answer row, found-list showing 7 words, three comb cells mid-fill, honey timer drop elongating.
- `screen-word-hive-c` WORD MOMENT: this game IS the word — so the moment is the BANK: `fx-word-bank-pour` mid-flow, THUNDER's letters melting to honey and pouring diagonally into the comb meter while the rack waits lit beneath; no scrim, the pour is the spectacle.
- `screen-word-hive-d` DANGER: timer drop stretched thin and trembling, comb at 17/20 with three dark cells conspicuous, the leftmost hall window fully grey behind — the world pressing in; a rejected tile mid red-shake.
- `screen-word-hive-e` VICTORY: per G0 as the 20th cell overfills — honey spilling out of the meter frame, Queen approving-warm portrait inset, rack tiles all spent-glow, gold light flooding the inlay ring where Bizzy stands.
**JUICE** — tile lift: [TAP] + shadow grows + halo (immediate). Tile placed: soft comb click, 80ms settle. Word banked: `chime-word-bank` pitch-step + pour FX 5-frame + comb cell 3-frame fill [POP]. Reject: `fx-reject-shake` 2-frame + chip-word-length pulses once (teaching, not punishing). Duplicate: found-list entry flashes and bounces (300ms) — shows WHY.
**READABILITY** — rack tiles ≥ 56px Sono, answer row ≥ 48px; the comb meter must be countable at a glance (20 discrete cells, never a smooth bar); timer legible as SHAPE (drop thinness) not just number — pre-readers included.

## 5 · WHACK-A-MOTH (Ch 5 · whack-a-mole · `bg-hive-nursery-night`)
**LANDSCAPE** — playfield owns **74%**.
```
╔═[hud-target-word: B_Z_Y slots]══[hud-time-chip]═╗ 10%
║═[hud-round-counter 8 pips]══════════════════════║ 6%
║ ▓  grid-nursery-comb 3×3 (→4×4), centered     ▓ ║
║ ▓  crib glows warm along bottom edge          ▓ ║ 74%
║ ▓  ※ each cell = tap target ≥120px            ▓ ║
╚══[mallet-soft tracks touch/cursor]══════════════╝ 10%
```
**PORTRAIT** — grid full-width; playfield **78%**.
```
╔═[hud-target-word ≥40px letters]═════╗ 12%
║ ▓  grid-nursery-comb, square,     ▓ ║
║ ▓  full width — cells ≥96px       ▓ ║
║ ▓  ※ every cell = tap target      ▓ ║ 78%
║ ▓  crib glows along bottom edge   ▓ ║
╠═[hud-round-counter]──[hud-time-chip]╣ 10%
╚═════════════════════════════════════╝
```
**FIVE MOMENTS**
- `screen-whack-a-moth-a` ROUND START: dark nursery, nightlight rings warming the 9 cells, target word "BUZZ" in empty slots, one moth p1-emerging cheekily from the center cell, mallet resting bottom-right, crib glows breathing.
- `screen-whack-a-moth-b` ACTIVE: three moths up at once — p2 hover carrying "U" (the right one), a decoy "Q", and a golden moth flashing in the corner; mallet mid-bop on the "U" with radial impact lines; word at B-U; grey rims creeping on occupied cells.
- `screen-whack-a-moth-c` WORD MOMENT: word complete beat — the four caught letter cards arc via `letter-card-drop` into the HUD slots which flare gold in order (staggered 100ms), moths ducked away, one crib glow re-warming; per G0 the field holds under a light Deep scrim for the 800ms celebration.
- `screen-whack-a-moth-d` DANGER: time chip nearly drained + flashing, five moths up at once in 4×4, one crib glow dimmed to `#C7C0B6` (the stake made visible), the letter mobile above half-grey, wrong-bop crimson ring just fading.
- `screen-whack-a-moth-e` VICTORY: per G0 over the quiet grid — all cribs warm, moths gone, mallet resting, 8/8 pips gold… and per the act brief, the faint regathered smiling face `#A39B8E` in the upper dark (the player sees; heroes don't).
**JUICE** — bop hit: p3 squash + `fx-bop-stars` + [TAP] on the cell + mallet 2-frame (total 220ms). Wrong bop: `fx-wrong-bop` crimson ring + time chip tick-down flash + moth blows a raspberry frame (300ms — funny, not scary). Golden moth: `fx-golden-burst` + slow-mo 200ms at 0.5×. Moth escape (untouched): cell grey rim +1 with a whisper hiss. Word done: [BLOOM] from the last-hit cell.
**READABILITY** — the carried letter card ≥ 40px on wax-cream belly plate — readable during the 2-frame flap; target word slots always show WHICH letter is next (next slot pulses); grey rims must never make a cell look un-tappable.

## 6 · SPELL-SHIELD (Ch 6 · BOSS · `bg-hive-gates-arena`)
**LANDSCAPE** — playfield owns **68%**; the boss owns the sky.
```
╔═[hud-boss-bar + 2 phase pips]═══[hud-gate-timer]╗ 10%
║ ▓ ☺ smudge-swarm-face fills upper 45% of sky  ▓ ║
║ ▓   word-clots arc down from the face         ▓ ║ 68%
║ ▓ [arch-shield-sockets: 9-hex wall over gate] ▓ ║
║ ▓        ☺ bizzy on the apron, center-low     ▓ ║
╚═[panel-unscramble-type ※ tiles + typed row]═════╝ 22%
```
**PORTRAIT** — the face LOOMS taller — use it; playfield **60%**.
```
╔[hud-boss-bar +pips]──[hud-gate-timer]╗ 10%
║ ▓ ☺ smudge-swarm-face fills sky    ▓ ║ 35%
║ ▓   word-clots arc down            ▓ ║
║ ▓ [arch-shield-sockets 9-hex wall] ▓ ║ 25%
║ ▓    ☺ bizzy small on the apron    ▓ ║
╠═[panel-unscramble-type / dictation]══╣ 30%
║  ※ scrambled tiles ≥56px + typed row ║
╚══════════════════════════════════════╝
```
**FIVE MOMENTS**
- `screen-spell-shield-a` ROUND START: the full arena tableau — swarm-face coalescing at 20× Bizzy's size, sky already `#575046`, one shield hex pre-glowing in its socket beside her (hope anchor), gate crest full Deep, boss bar sliding in.
- `screen-spell-shield-b` ACTIVE: a word-clot tumbling mid-arc toward an empty socket, panel showing its scrambled tiles half-solved, two hexes SET and glossy, one cracked, defender silhouettes on the ramparts, face in attack follow-through.
- `screen-spell-shield-c` WORD MOMENT: the CONVERT — a solved clot mid-transformation (3-frame) into a shield hex, letters orbiting into place with `fx-shield-form`, the face recoiling blown-open behind it; panel cleared and breathing; this is the loop's money frame.
- `screen-spell-shield-d` DANGER: gate timer crest draining toward `#7A7267`, 3 hexes shattered (fragments still glowing), face in dive silhouette growing frame-fast, rampart defenders faded to `#C7C0B6`, panel urgent-rimmed — one unsolved clot seconds from the wall.
- `screen-spell-shield-e` VICTORY: per G0 but staged — `bizzy-quill` hero pose as the quill-lance letter-stream arcs into the scattering face (`defeat-scatter`), THEN stars/gem over the re-coloring arena, sky clearing top-down, Sting's defect portrait sliding in before the gem lands.
**PHASES** — **P1 WAVES:** face at top, clots arc in, panel = unscramble+type. **P1→P2 transform (on 2nd pip):** face compresses, screen-wide [SHAKE] 400ms, sky darkens one grey step, the panel SWAPS to `panel-dictation` (speaker icon, blank slots — audio only), the wall locks, and the Stinger Quill rises into Bizzy's hand with a 600ms glow ramp. **P2 DIVE:** face plunges in 2-frame dive loops between the 3 dictation words; each correct word = `quill-fire` lance + face recoil + boss bar chunk.
**JUICE** — clot solved: convert 3-frame + [POP] + `chime-respell`. Hex hit: crack overlay + [SHAKE]. Hex shattered: 4-frame burst, fragments fall with 500ms gravity. Dictation correct: quill charge 300ms riser → lance beam 250ms → face recoil with 6px screen kick. Gate timer tick under 20%: heartbeat vignette (amber, 1Hz — never grey).
**READABILITY** — scrambled tiles ≥ 48px; during P2 the blank dictation slots must be HUGE (≥ 64px) since audio is the prompt and eyes are on the diving face; boss bar phase pips readable at all times; Bizzy always rimmed in honey light against the grey storm.

## 7 · SPOTLIGHT SIMON (Ch 7 · memory · `env-stage` / `field-stage-simon`)
**LANDSCAPE** — playfield owns **66%**.
```
╔═[hud-word-banner, top center]═══════════════════╗ 10%
║═[hud-sequence-dots 3→9]═════[powerup-replay]════║ 8%
║ ▓  tile-grid-frame 3×3 stage tiles, centered  ▓ ║
║ ▓  spotlight-beams sweep from upper battens   ▓ ║ 66%
║ ▓  ※ each tile = tap target · cursor-spot     ▓ ║
╚══ footlight strip + curtains frame the grid ════╝ 16%
```
**PORTRAIT** — playfield **60%**; marquee arch drops out, bulbs migrate to the grid frame corners.
```
╔══[hud-word-banner, full width]══════╗ 12%
║  curtain slivers ─ house dark       ║ 14%
║ ▓  tile-grid-frame 3×3, square,   ▓ ║
║ ▓  full width · beams from above  ▓ ║ 60%
║ ▓  ※ tiles = tap targets          ▓ ║
╠[hud-sequence-dots]──[powerup-replay]╣ 14%
╚═════════════════════════════════════╝
```
**FIVE MOMENTS**
- `screen-spotlight-simon-a` ROUND START: dark house, ONE beam finding the center tile as its letter blazes (sequence step 1 playing), Maestro's baton-point inset lower-left, sequence dots showing 1/3, marquee bulbs half-dead awaiting relight.
- `screen-spotlight-simon-b` ACTIVE: player mid-echo — third tile in `pressed` squash under the cursor-spot ring, two previous tiles still carrying faint correct-pulse rings, beams parked on their marks, dots 3/5 filled.
- `screen-spotlight-simon-c` WORD MOMENT: `overlay-memory-phase` per G0 — vignette dims the stage, ALL tiles flip to `hidden` "?", the word banner alone stays lit ("Now spell it!" plate below), one beam circling the grid hunting; the memory-spell is staged as a solo under one spotlight.
- `screen-spotlight-simon-d` DANGER: 9-length sequence, a `wrong-flicker` tile mid grey-flash, stage-left curtain edge greying [GREY], two marquee bulbs popping OUT, Melody's faded variant glimpsed in the wings — one more miss ends the show.
- `screen-spotlight-simon-e` VICTORY: per G0 with `curtain-sweep` opening on full color — every marquee bulb popping alive L→R in a chain, Melody + Maestro cheer poses flanking Bizzy center-stage, beams crossed overhead like a premiere.
**JUICE** — sequence playback: each tile `lit` 400ms + its `sfx-tile-tone` (the sequence is a melody); gap 150ms. Player tap: [TAP] + tone + correct-pulse 3-frame. Wrong: wrong-flicker (tile-only grey scanline, never full screen) + dissonant tone + sequence dots shudder 200ms. Sequence complete: bulb-pop chain, one bulb per 80ms + rising arpeggio. ENCORE used: marquee sticker stamps down with [POP], sequence replays at 0.8×.
**READABILITY** — tile letters ≥ 72px (the whole game is reading tiles at distance); lit-vs-idle tile contrast must survive the amber wash (white-hot core mandatory); sequence dots countable — max 9, never a bar.

## 8 · UNSCRAMBLE THE STARS (Ch 8 · anagram · `env-cosmos` / `field-cosmos-stars`)
**LANDSCAPE** — playfield owns **80%** (sky IS the board).
```
╔═[hud-constellation-counter 12 pips]═════════════╗ 8%
║ ▓  upper sky: socket-ring layout (bg-socket-  ▓ ║
║ ▓  layouts) + constellation-line ghost        ▓ ║ 64%
║ ▓  ☺ astro-jetpack-hover near first socket    ▓ ║
║ ▓  ※ drag stars tray→socket, full-field       ▓ ║
╠═[hud-word-scramble-rack: letter-stars in tray]══╣ 20%
╚═════════[overlay-starsight chip, corner]════════╝ 8%
```
**PORTRAIT** — playfield **86%**; socket layouts use portrait-safe variants (stacked taller than wide).
```
╔[hud-constellation-counter 12 pips]══╗ 8%
║ ▓  sky: socket rings + line ghost ▓ ║
║ ▓  (stacked vertical layouts)     ▓ ║ 62%
║ ▓  ☺ astro hovers near socket 1   ▓ ║
║ ▓  ※ drag stars tray → socket     ▓ ║
╠═[hud-word-scramble-rack ≥72px stars]╣ 24%
╚═[overlay-starsight chip, corner]════╝ 6%
```
**FIVE MOMENTS**
- `screen-unscramble-stars-a` ROUND START: the scrambled word "EEB" twinkling wrong in the sky sockets' ghost positions, tray rising from the planet rim with three letter-stars, Zib's antenna-signal bumper fading out, one shooting star crossing.
- `screen-unscramble-stars-b` ACTIVE: a letter-star mid-`drag` on a light-thread from the tray, halo bright, its target socket-ring spinning faster in anticipation, two stars already `glow`-locked, nebula breathing behind.
- `screen-unscramble-stars-c` WORD MOMENT: the completion — `constellation-line` self-drawing between the locked stars into the bee figure, cyan→white along the stroke, the whole starfield lifting brightness 10%; tray empty and dark below — all eyes up. (No card; the sky is the card.)
- `screen-unscramble-stars-d` DANGER: soft-fail game — danger is WRONGNESS: a star mid `wrong-bounce` red-shift ejecting from a socket, the half-built line-art collapsing back to dashes, the upper-left starless void patch (Ch 18 seed) conspicuously nearer this round.
- `screen-unscramble-stars-e` VICTORY: per G0 wide — 12 completed constellations glowing as creatures across the sky, counter full, Astro/Comet/Zib cheer poses on the planet rim looking up, stars/gem framed inside a new brightest constellation.
**JUICE** — star grab: `sfx-star-grab` + halo + 4px lift shadow (instant). Settle: 3-frame overshoot-squash + ring flash + rising pling on a scale (each correct letter steps the scale — the word ends on the tonic). Wrong socket: 2-frame red-shift + eject arc 300ms + socket-ring sympathy wobble. Constellation done: line self-draw 800ms + white bloom + `sfx-constellation-chord`. Star-sight: cyan lens flare 400ms, two sockets flash their letters 3× at 500ms intervals.
**READABILITY** — letter on the star body ≥ 44px, white rim mandatory against nebula; socket rings visible at 30% ambient (dashed white); the CURRENT scramble always echoed small in the counter band so players never lose the target among 12 layouts.

## 9 · LETTER SLICE (Ch 9 · fruit-ninja · `env-dojo` / `field-dojo-slice`)
**LANDSCAPE** — playfield owns **82%**.
```
╔═══[hud-combo-meter, brush fill, top-right]══════╗ 8%
║ ▓ [hud-target-word-scroll, LEFT rail 12%]     ▓ ║
║ ▓   central air-space: tiles arc up from mat  ▓ ║
║ ▓   ☺ sensei-single-finger, lower-left corner ▓ ║ 82%
║ ▓   ※ full-field swipe = blade (cursor-trail) ▓ ║
╚══ launch mat + launcher-mat-puff, bottom ═══════╝ 10%
```
**PORTRAIT** — playfield **80%**; arcs run taller, tiles hang 15% longer at apex (tuning, same assets).
```
╔[target-word-scroll, HORIZONTAL]─[combo]╗ 12%
║ ▓  full-height air-space           ▓   ║
║ ▓  tiles arc high off the mat      ▓   ║
║ ▓  ☺ sensei chip, lower-left       ▓   ║ 80%
║ ▓  ※ full-field swipe = blade      ▓   ║
╚══ launch mat + mat puffs, bottom ══════╝ 8%
```
**FIVE MOMENTS**
- `screen-letter-slice-a` ROUND START: dojo at dawn hush, target scroll unfurling with the word in grey ink awaiting slices, first three tiles mid-launch off the mat with dust puffs, one wearing the gold `target-glint`, Sensei's single raised claw.
- `screen-letter-slice-b` ACTIVE: air full of `spin-fly` tumbling tiles, the swipe-arc `slash-fx` mid-carve through the glinting "R", both `slice-halves` separating with clean ink cut-faces, ×3 combo banner slamming in, taiko-tempo visual pulse on the mat edge.
- `screen-letter-slice-c` WORD MOMENT: word completed — the scroll's letters flash grey→inked in order (staggered 90ms), `dojo-bell` mid-swing, tiles cleared, a single petal falling through the emptied air; per G0 a light Deep scrim holds the dojo for the 900ms beat.
- `screen-letter-slice-d` DANGER: a `bomb-moth` flapping dead-center on a collision course with an active swipe trail, its static-bomb glinting warning pulses, combo meter one miss from empty, two wrong-slice cracked tiles falling desaturated.
- `screen-letter-slice-e` VICTORY: per G0 — re-inked scrolls hanging whole behind, Sensei tying the honey-gold headband on Bizzy, Ninja cheer, bell mid-ring, stars punched into the shoji screen like brush stamps.
**JUICE** — slice hit: `sfx-slice-shing` pitch-rising through the word + gold chip sparks at cut point + halves tumble with 2-frame each + micro hit-stop 40ms (makes cuts feel sharp). Wrong slice: `wrong-thunk` + grey crack overlay + combo meter brush-drains 200ms. Bomb-moth hit: 3-frame static puff + 200ms [SHAKE] — no fire ever. Combo tier: banner slam 2-frame + subtle 2-frame gold screen-flash. Slow-mo (Focus): petal-fall overlay, world at 0.33× for 3s, trail stays full-speed.
**READABILITY** — tile letters ≥ 52px readable through 4-frame tumble (letter never rotates past 30° off vertical — the TILE spins, the glyph counter-rotates); the target-glint gold edge is the only gold shimmer airborne; scroll's next-letter is always the brightest ink on the rail.

## 10 · WORD TETRIS (Ch 10 · falling letters · `env-lab` / `field-lab-tetris`)
**LANDSCAPE** — playfield (the well) owns **58%**; lab flanks are scenery + right rail UI.
```
╔══[hud-formula-card, top-left]═══════════════════╗ 10%
║ scenery ▓▓ THE WELL (8 cols, centered) ▓▓ rail  ║
║ shelves ▓  overlay-danger-line at top  ▓ [next- ║
║ + coils ▓  falling tile + column ghost ▓ tube]  ║ 80%
║         ▓ ※ tap col = move · swipe↓ = drop ▓ [burettes]
╚══[flask-fill, bottom-right, fed by clears]══════╝ 10%
```
**PORTRAIT** — the well goes full-width; playfield **68%**.
```
╔[next-tube ↔]──[burettes]──[formula ▸]╗ 12%
║ ▓  THE WELL — 8 cols, full width   ▓ ║
║ ▓  danger-line stripe at top       ▓ ║
║ ▓  falling tile + column ghost     ▓ ║ 68%
║ ▓ ※ tap L/R halves = shift ·       ▓ ║
║ ▓   swipe down = drop         [flask]║
╚═══════ flask docks btm-right ════════╝ 20%
```
Formula card collapses to a tappable chip (▸ expands); the flask overlaps the well frame — it is the trophy, keep it visible.
**FIVE MOMENTS**
- `screen-word-tetris-a` ROUND START: empty well etched with faint green grid, first tile wobbling at the top with its column ghost below, next-tube showing 3 letters, flask at 0% cradled by beaker-flask-catch pose, one emergency lamp green in the grey-tending lab.
- `screen-word-tetris-b` ACTIVE: stack four rows high, a falling "E" mid soft-drop-streak, a horizontal "FIZZ_" one letter from complete, a gold formula-glint tile pulsing in the stack, coil idle arcs, burettes 6/15 ticked.
- `screen-word-tetris-c` WORD MOMENT: the clear — completed word's tiles lighting L→R in reading order (100ms stagger), liquefying, `droplet-pour` streaming diagonally into the flask as `coil-arc-clear` jumps the well; the well pauses 600ms under light Deep scrim for the pour.
- `screen-word-tetris-d` DANGER: stack breaching the `overlay-danger-line` (hazard stripe pulsing), a `garbage-grey` cracked row locked mid-stack, green heartbeat vignette (per act brief — never grey), next-tube showing three awkward consonants, flask stalled at 60%.
- `screen-word-tetris-e` VICTORY: per G0 — flask at 100% glowing, cork-pop green firework, chalk wall re-writing itself crisply behind, Beaker + Brainiac cheer, stars landing as graduated marks on the flask itself.
**JUICE** — tile lock: 3-frame land-squash + rivet clunk + 2px well shudder. Move: 60ms slide with 1-frame lean. Word clear: liquefy 4-frame + pour + `sfx-word-liquefy` glug-chime + flask fill-state tick [POP]. Formula word: `sfx-formula-fanfare` + gold ripple across the whole stack 400ms. No-word row lock: `smoke-poof-wrong` small grey puff (the one permitted grey FX — it reads as loss). Danger line: stripe pulse 1Hz + music layer tenses.
**READABILITY** — tile letters ≥ 40px at 8-column width; formed-word detection must be VISIBLE pre-clear (candidate letters underline-glow as they align); danger line always visible above the stack; garbage tiles unmistakably cracked + letterless so kids never try to clear them.

## 11 · WORD SNAKE (Ch 11 · snake · `env-critter` / `field-critter-snake`)
**LANDSCAPE** — playfield owns **76%**.
```
╔═[hud-target-word-fence, top ctr]═[flowerpots ×10]╗ 10%
║ ▓ border trellis (blooms fill it) frames grid ▓ ║
║ ▓  16×9 lawn grid · letter-pickups scattered  ▓ ║
║ ▓  ☺ snake winds through, letters on its body ▓ ║ 76%
║ ▓  ☺ capy-soak-watch, pond corner (idle)      ▓ ║
╚═══════※ swipe anywhere = turn (4-dir)══════════╝ 14%
```
**PORTRAIT** — grid re-tiles 9×14 (same tile art); playfield **74%**.
```
╔═[hud-target-word-fence, full width]═╗ 12%
║ ▓ trellis border ─ [flowerpots as ▓ ║
║ ▓  9×14 lawn grid    side column] ▓ ║
║ ▓  ☺ snake winds, letters on body ▓ ║ 74%
║ ▓  ☺ capy pond corner (idle)      ▓ ║
║ ※ clear swipe strip (4-dir)         ║ 14%
╚═════════════════════════════════════╝
```
**FIVE MOMENTS**
- `screen-word-snake-a` ROUND START: grey-tinged garden, short 3-segment snake blinking center-grid, letters of "SEED" scattered as seed-packets with the "S" in green target-glow, fence plank showing S-E-E-D unstamped, trellis bare, Zoomies sniff-pointing from the border.
- `screen-word-snake-b` ACTIVE: 8-segment snake mid-turn, its body literally spelling G-A-R-D along the segments, head in chomp frame on the "E", a wrong "Q" packet sitting innocently in the path ahead, two trellis flowers already bloomed, pond ripples.
- `screen-word-snake-c` WORD MOMENT: word complete — snake curled in its `happy` closed-eye grin, body spelling GARDEN, a bloom-chain running the trellis border (staggered one-shots) as color spills into the beds; grid holds 900ms, no scrim needed — the border IS the celebration.
- `screen-word-snake-d` DANGER: long snake boxed between its own tail and the hedge (warn-wall-hedge flashing), the needed "N" packet across the grid, head one cell from tail, dizzy-shrink threat looming — pathing panic made visible.
- `screen-word-snake-e` VICTORY: per G0 over the full-bloom garden — pond re-blued, Capy floating with Bizzy on his belly, Zoomies motion-streak circling, the snake wearing a bloom hat, all 10 pots filled, stars nested in the trellis corners.
**JUICE** — correct chomp: 2-frame chomp + `eaten-burst` sprout pop + rising-pitch `sfx-chomp` + new lettered segment [POP]s on. Wrong chomp: dizzy 2-frame + `tail-shrink-pop` seed puff (small, grey — loss reads) + slide-whistle down. Turn: head leads 1 frame, body follows with 40ms/segment ripple (the snake feels liquid). Word done: bloom chain, one flower per 120ms + `sfx-bloom-chime`. Near-wall: hedge flash 2Hz within 2 cells.
**READABILITY** — letters on packets ≥ 40px; the NEXT letter's green halo is the only green glow on the field; letters on body segments are flavor — never required reading at speed; snake head eyes always point travel direction (direction readable from a glance).

## 12 · SPACE TYPER (Ch 12 · BOSS typing shooter · `env-arcade` / `field-arcade-typer`)
**LANDSCAPE** — playfield owns **64%** inside the `bezel-frame` (we play INSIDE the cabinet).
```
╔═[hud-boss-bar-glitch +3 pips]═══[hud-wave-cnt]══╗ 10%
║ ▓ bezel ── static-sprite ranks, upper 2/3 ─── ▓ ║
║ ▓  word-plates hang under each sprite         ▓ ║ 64%
║ ▓  ☺ glitch teleports in the rank gaps        ▓ ║
║ ▓ ☺ bizzy-cabinet-rail + zap rail, lower 1/3  ▓ ║
╠═[hud-typing-echo strip above Bizzy]═════════════╣ 6%
╚═※ hardware kbd / on-screen kbd (portrait) ══════╝ 20%
```
**PORTRAIT** — playfield **52%** (acceptable for a typing game); bezel slims to corner curvature only.
```
╔[boss-bar-glitch +3 pips]─[wave-cnt]╗ 10%
║ ▓  static-sprite ranks + plates  ▓ ║
║ ▓  ☺ glitch in the rank gaps     ▓ ║ 45%
║ ▓  cabinet floor line            ▓ ║
║ ▓ ☺ bizzy-cabinet-rail + zap rail▓ ║ 7%
╠═[hud-typing-echo strip]════════════╣ 6%
║ ※ on-screen keyboard, arcade-skin, ║ 32%
║   keys ≥44px w/ pressed states     ║
╚════════════════════════════════════╝
```
**FIVE MOMENTS**
- `screen-space-typer-a` ROUND START: neon arcade blazing through the bezel, wave 1's rank of `static-sprite-a` shuffling in carrying short word-plates, the Master Token pulsing in its heart-vault atop the score rail, Bizzy's rail-cart hovering, CRT power-on line still fading.
- `screen-space-typer-b` ACTIVE: mid-wave — a sprite's plate reading "AR**CADE**" half-claimed (typed letters honey-gold, rest grey), zap-beam mid-bolt from the quill-blaster, a neighbor sprite de-rezzing into pink/gold pixels, ranks one descend-step lower, typing-echo showing "ARC".
- `screen-space-typer-c` WORD MOMENT: `overlay-scramble-alert` per G0 — Glitch mid-lob, the scramble-bomb spinning center-screen, pink alarm frame up, unscramble slot row awaiting input, the frozen ranks and neon visible behind the Deep scrim; highest-stakes card in Act II.
- `screen-space-typer-d` DANGER: a `static-sprite-c` elite in `landed-alarm` red-pink flash at the cabinet floor line, floor crack state 2, boss bar pips at 3rd phase, neon layer (L3) visibly desaturating live, Glitch grinning from the gap — one more landing loses the cabinet.
- `screen-space-typer-e` VICTORY: DIVERGES from G0 by design — stars/gem play over the arcade at full blaze for 1.5s… then the vault SHATTERS mid-confetti (`sb-c12-04` beat), Glitch's token-grab, look-back, teleport-line collapse, and CRT power-OFF to a dying dot. The win screen itself is the betrayal stage. Gem lands in silence on black. (Bittersweet per act brief — do not soften.)
**PHASES** — **P1 (pip 1):** sprite-a ranks only, no Glitch. **P2 (pip 2):** transform — scanline sweep, Glitch teleports in, bombs begin, sprite-b ranks join, `loop-typer-battle` +1 layer, his face-plate on the boss bar corrupts one step. **P3 (pip 3):** sprite-c elites, faster descent, neon gutters between waves, Glitch face-plate fully static, bombs come in pairs. Each phase shift = 400ms scanline wash + rank re-deal.
**JUICE** — keystroke hit: plate letter flips grey→gold [POP]-small (80ms) + typed-echo tick. Word complete: `zap-beam` 2-frame + sprite `zapped` 3-frame de-rez, letters flying off as gold sparks + score-pop pixels. Wrong key: typing-echo shudder + dull thunk (no penalty flash on the sprite — keep eyes on plates). Bomb deflect: letters snap into order 4-frame + orb re-colors + boomerangs at Glitch with [SHAKE] on his hit. Sprite lands: floor crack + red-pink flash + 300ms [SHAKE].
**READABILITY** — word-plates ≥ 36px and NEVER overlap (rank spacing enforced); typed-vs-untyped letters must differ in BOTH color and weight (gold+bold vs grey — the one sanctioned UI grey, it means unclaimed = unspelled, on-theme); the scramble-bomb's jumbled letters ≥ 44px; on-screen keyboard letters ≥ 28px with pressed states.

---

## G9 · CROSS-GAME CONSISTENCY CHECKLIST
- Playfield share: HONEYCOMB 78 · FLYING 86 · PRIX 70 · HIVE 60 · WHACK 74 · SHIELD 68 · SIMON 66 · STARS 80 · SLICE 82 · TETRIS 58 · SNAKE 76 · TYPER 64 (landscape). Anything under 58% needs sign-off.
- Every Moment-c keeps the game world visible behind the word interaction (Deep scrim, never grey, never opaque) — the world waits for the word; that IS the fantasy.
- Every Moment-d expresses danger via the game's OWN color (crimson tips, red-pink flash, amber heartbeat) plus at most one [GREY] creep from the chapter's canonical edge; no generic red vignette.
- Every Moment-e sits on the restored-color world per the G0 victory standard; the sole exception is `screen-space-typer-e` (scripted betrayal).
- Deliver the five moments per game as flat 1600×900 frames named exactly `screen-<game>-a.svg` … `-e.svg`; portrait recomposition ships as layout spec only (this doc), not separate art.
