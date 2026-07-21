# DESIGN BRIEF — ACT I · THE SCATTERING (Chapters 1–6)
### "Bizzy and the Great Unspelling" · art-production brief for Claude Design
*Companion to `CLAUDE-DESIGN-BRIEF-SAGA.md` (master art direction — binding) and `QUEST-SAGA-DESIGN.md` (mechanics). Dialogue beats reference `spellbound-app/saga-script.js` audioKeys.*

---

## ACT-WIDE PRODUCTION NOTES (read before any chapter)
- **Style law:** Blooket-style squircle characters, bold ink sticker outline, duotone cheer shading — must match the shipped avatar library exactly. Artifacts/pickups = glossy sticker style (gradient body, single shine highlight, soft colored drop shadow, ink outline).
- **Palette law:** Honey `#F0B429` · Deep `#4A32A8` · Villain crimson `#C43D5A`. **Grey is never neutral — grey MEANS unspelled.** Unspelled grey family, light→dark: `#C7C0B6` → `#A39B8E` → `#7A7267` → `#575046`. Any grey in Act I art must be one of these four.
- **Backdrop delivery:** every backdrop = **1600×900 layered SVG**, layers named `sky` / `mid` / `near` / `game-field`, each layer separable for parallax. Every backdrop ships with a **grey-state variant as additional layers** (`grey-sky`, `grey-mid`, `grey-near` …) so the app can animate a wipe between states — do NOT bake grey into the color layers.
- **Sprites:** SVG frame groups named `f1…fN` inside one file, or horizontal PNG sheet @2x on transparent. Target render sizes below are @1x logical px; deliver @2x.
- **Type:** Fraunces (display), Hanken Grotesk (body/UI), Sono (letter tiles). No new faces, ever.
- **Act I gem:** amber hexagon design (`gem-act1-amber-hex.svg`, states: empty-slot / earned / earned-sparkle overlay). One gem per chapter, six total, matching the app gem style.
- **Shared Act I FX kit** (referenced per chapter, build once): `fx-recolor-bloom` (radial saturation wipe, 6-frame), `fx-grey-creep` (edge desaturation crawl, 6-frame), `fx-letter-restore-sparkle` (4-frame one-shot), `fx-letter-dissolve` (4-frame one-shot), confetti (exists in app — reuse).
- **Priority:** everything in this file is P0 per master brief §7.

---

## CHAPTER 1 · ESCAPE FROM THE MEADOW OF CHALLENGES
*Game: HONEYCOMB RUN (Pac-Man maze). World: Meadow. Script keys c1-n1 … c1-b4.*

### 1. SCENE & BACKDROP — `bg-meadow-dawn.svg` (1600×900, layered)
- **`sky` layer (slowest parallax):** dawn gradient, peach `#FFD9A0` at horizon → pale blue `#BFE8FF` above; a low honey-gold sun disc `#F0B429` with soft glow; two flat cloud bands `#FFF9EE`.
- **`mid` layer:** rolling meadow hills in leaf green `#58BF6B` / deeper green `#2E9E53`; the signature **name-labeled flowers** — oversized daisy/rose/tulip heads (petal pink `#FF8FB5`, honey `#F0B429`, tulip red `#E8564F`) each with a small hanging wooden name-tag (Sono lettering: ROSE, DAISY, TULIP…).
- **`near` layer (fastest parallax):** foreground grass tufts and clover silhouettes in dark green `#1F7A3D`, framing bottom corners only — must not intrude on play area.
- **`game-field` layer:** a flat-lit hex-maze plane (see §4) sitting center-frame, slight top-down 3/4 tilt, honeycomb path cells in wax cream `#FFE9B8` with comb-brown `#8A5A24` walls.
- **GREY STATE (required):** greying enters **from the top-left sky corner and the outer maze ring inward** (the attack arrives at dawn from above). Order: (1) `grey-sky` — sky desaturates to `#C7C0B6` with the sun dimming to `#A39B8E`; (2) `grey-mid` — flowers grey to `#A39B8E` petals / `#7A7267` stems and **every name-tag goes BLANK** (tags stay, lettering removed — this is the story hook, c1-n1/c1-b1); (3) outer maze cells pre-greyed to `#C7C0B6` fill / `#7A7267` walls (gameplay re-colors them ring by ring). `near` grass greys last, only at 50% edge creep per master §2.

### 2. CAST ON SCREEN
- **Bizzy** — `bizzy-top` maze puck (top-down slight 3/4, 2-frame hover — master §1.1); dialogue portraits: **determined** (c1-b2), **worried** (c1-b1), **happy/triumphant** (c1-b3). All from the Bizzy portrait emotion set.
- **The Smudge** — voice only in dialogue (c1-s1) + its moths on-field; dialogue frame uses a **`smudge-whisper-portrait`** — NEW: a loose half-formed moth-cluster face, greys `#A39B8E`/`#575046` on dark, eyes as two brighter smudges (deliberately not yet the full swarm-face; the reveal is saved for Ch 2/6).
- **Narrator** — no art; narrator lines use the plain dialogue frame.

### 3. SPRITES & ANIMATIONS
- `bizzy-top.svg` — 2 frames (f1 hover-low, f2 hover-high, wings blurred discs), loop, 64×64. States: normal / **jelly-powered** (honey-gold aura ring added as overlay layer, not a redraw).
- `grey-moth.svg` — 2 frames (f1 wings up, f2 wings down), loop, 48×48, body `#A39B8E`, wing dust `#C7C0B6`, ink outline. States: **patrol** (default) / **flee** (same frames + wide scared eyes variant group `flee-f1/f2`, tinted toward `#575046`, used 6s after royal jelly).
- `golden-flower.svg` — 3 frames: **f1 bud** (closed, grey `#A39B8E` with one gold sliver), **f2 bloom** (half-open, gold spreading), **f3 bloomed** (full honey `#F0B429` + petal pink), one-shot on correct spell, 72×72, + `fx-letter-restore-sparkle` overlay on f3.
- `royal-jelly.svg` — 2 frames (glow pulse in/out), loop, 40×40, glossy violet-white pellet, Deep `#4A32A8` rim light.
- `nectar-dot.svg` — static, 20×20, honey `#F0B429` glossy dot; **grey variant** `#A39B8E` for dots sitting in still-grey cells.
- `meadow-flower-sway.svg` — environmental: 2-frame gentle sway for the mid-layer flower heads, loop, used sparingly (3 instances max).

### 4. GAME-FIELD ASSETS
- `tile-hex-path.svg` (wax cream, walkable) · `tile-hex-wall.svg` (comb brown) · `tile-hex-path-grey.svg` / `tile-hex-wall-grey.svg` (grey family) · `tile-hex-rebloom.svg` (mid-transition cell, 3-frame grey→color, one-shot — the "ring of grey cells turns to color" beat).
- `hud-nectar-counter.svg` — honey-drop icon + Sono numerals frame.
- `hud-maze-timer.svg` — 3:00 survival timer as a draining honeycomb cell.
- `card-spell-golden.svg` — the 10s spell-card frame (golden flower motif corners, Sono tile slots, honey timer arc).
- `cursor-swipe-arrows.svg` — 4-direction swipe hint chrome (first-play only).

### 5. STORYBOARD TABLEAUX (single illustrated frames)
1. **"The flowers forgot"** (c1-n1 → c1-b1): dawn meadow, Bizzy hovering close to a drooping rose, reading its **blank name-tag**; her expression worried; warm dawn light from the right, grey creep visibly entering top-left sky.
2. **"He will eat them all"** (c1-s1): same meadow gone half-grey; a loose cloud of moths above, hinting at a face; Bizzy small in lower frame, fists up, backlit by the dimming sun.
3. **WIN — "Words fix it"** (c1-b3): Bizzy mid-air above the maze as a **radial ring of hex cells blooms from grey to color** around her; golden flowers at f3; her face triumphant; light source = the re-colored ring itself.
4. **LOSE-RETRY** (c1-b4): Bizzy backed against a comb wall, moths crowding the frame edges in grey; she takes a breath — determined, not scared; one small golden flower still lit beside her (hope anchor).

### 6. FX & TRANSITIONS
- FX: `fx-recolor-bloom` (on every correct spell-card), `fx-grey-creep`, `fx-letter-restore-sparkle`, `fx-moth-poof` (4-frame grey dust burst when a moth flees off-board).
- **Signature transition:** chapter opens with a **grey-creep wipe IN** over the full-color meadow (the attack, timed to c1-n1); victory exits on a **re-color bloom OUT** from Bizzy's position to full frame.

### 7. AUDIO CUE SHEET
- Stings/loops (synth kit): `sting-meadow-theme` (world 8-bar sting, plays on chapter card) · `drone-unspelling` (under intro grey-creep and whenever moths swarm) · `loop-maze-chase` (gameplay bed) · `chime-respell` (rising 5-note, on every golden-flower bloom) · `sting-gem-award`.
- Dialogue: intro c1-n1, c1-b1, c1-s1, c1-b2 → gameplay → win c1-b3, c1-n2 → (on fail) c1-b4.

---

## CHAPTER 2 · THE LONG SKY
*Game: KEEP FLYING (flappy/dino hybrid). World: Open Sky. Script keys c2-n1 … c2-bu4.*

### 1. SCENE & BACKDROP — `bg-open-sky.svg` (1600×900, layered, 3-layer flight parallax per master §2)
- **`sky` layer (slowest):** high-noon blue gradient `#6FC7F2` → `#BFE8FF`; distant flat cloud shapes `#FFF9EE`; on the far horizon behind the scroll direction, the **Smudge swarm-face background cameo** — a huge, faint moth-cloud face in `#A39B8E` at 40% opacity, always at the left screen edge (it chases; it never leads).
- **`mid` layer:** mid-distance cloud banks with soft honey rim-light `#F0B429`, drifting cloud-letter glyphs (see sprites).
- **`near` layer (fastest):** foreground wisps + the **thorn walls** — bramble columns in thorn brown `#6B4A2F` with `#C43D5A` thorn tips (a subtle first Vex-color foreshadow), scrolling right→left.
- **`game-field` layer:** clear flight corridor; honey pots ride on small cloud shelves.
- **GREY STATE (required):** grey follows the Smudge — creep enters **from the left edge outward in a wedge behind the face cameo**. Order: (1) left third of `sky` desaturates to `#C7C0B6`; (2) `mid` clouds in the wedge go `#A39B8E` and cloud-letter glyphs in grey zones lose their letterforms (blank puffs); (3) thorn walls already in the wedge darken to `#575046`. The right (forward) edge always stays full color — flying forward is flying into color. Win state: the face cameo layer swaps to a `smudge-face-retreat` variant (face breaking apart, per c2-bu3).

### 2. CAST ON SCREEN
- **Bizzy** — `bizzy-side-fly` sprite (4-frame wing cycle up/mid/down/mid, master §1.1); portraits: determined (c2-b1), happy (c2-b2).
- **Bumble** — dialogue portrait (panicked for c2-bu1 — reuse base portrait + worried brows variant), **cheer pose** (c2-bu3); **NEW pose this chapter: `bumble-cling`** — Bumble gripping Bizzy's rear legs mid-flight, eyes squeezed, used in the rescue tableau and as an optional trailing rider on the flight sprite (single static overlay, 56×56, pinned behind `bizzy-side-fly`).
- **The Smudge** — swarm-face background cameo (environment layer, above) + narrator setup c2-n1. No dialogue portrait this chapter.

### 3. SPRITES & ANIMATIONS
- `bizzy-side-fly.svg` — 4 frames (wing up / mid / down / mid), loop, 96×72. States: normal / **flap-burst** (frame-2 held + speed lines, on tap) / **stall** (droop pose, single frame, on miss altitude-loss).
- `thorn-wall.svg` — static column segments (top and bottom caps + repeatable middle), 120px wide, with 2-frame `thorn-quiver` idle (1px sway), loop.
- `honey-pot.svg` — 3 states: **waiting** (gold pot on cloud shelf, glossy), **landed** (Bizzy-perched rim glow), **banked** (pot lit, small flag with checkmark). Plus **re-queued** state (pot greyed `#A39B8E`, drifting back into the stream — "never a dead end"). 64×64.
- `cloud-letter-glyph.svg` — puffy cloud shaped as a single letter (deliver A–Z as one file with 26 groups), white `#FFF9EE` with `#BFE8FF` shading, 56×56; the hidden-bonus trail spells a secret word for a gem.
- `wind-gust.svg` — 3-frame streak ribbon, one-shot, 200×60, white 60% opacity.
- `smudge-face-bg.svg` — 2-frame shimmer (features drift), loop, rendered ~500×400 at 40% opacity; + `smudge-face-retreat` 3-frame break-apart, one-shot (win).

### 4. GAME-FIELD ASSETS
- `hud-pot-counter.svg` — 10 pot pips (empty/banked) across the top.
- `hud-altitude-fuel.svg` — honey-fuel vertical gauge, honey `#F0B429` fill in a glass tube.
- `card-spell-pot.svg` — the honey-pot spell-word stop card (pot motif frame, Sono slots).
- `hud-secret-trail.svg` — subtle 3-dot hint chrome that lights when a cloud-letter is collected.

### 5. STORYBOARD TABLEAUX
1. **"A cloud of moths shaped itself into a face"** (c2-n1): wide sky shot, tiny Bizzy flying right, the enormous grey swarm-face forming at frame left; the meadow far below already grey; lighting cold on the left, warm on the right.
2. **"My wings forgot the word for FLAP!"** (c2-bu1 → c2-b1): Bumble tumbling, wings limp, letters F-L-A-P sparkling into place along his wing edges as Bizzy dives to grab him — `fx-letter-restore-sparkle` at each letter; Bizzy's face determined.
3. **MID — the rescue hold** (c2-bu2): `bumble-cling` pose — Bumble hanging on, astonished ("Who ARE you?"), Bizzy grinning forward, thorn walls blurring past.
4. **WIN — "I'm with you. To the end."** (c2-bu3): the two bees perched on the 10th banked honey pot, the swarm-face breaking apart in the far distance, forward sky fully saturated; Bumble's cheer pose, Bizzy's happy portrait; golden hour light.
5. **LOSE-RETRY** (c2-bu4): the pair on a low cloud, ruffled but grinning, pots still glinting ahead in the stream.

### 6. FX & TRANSITIONS
- FX: `fx-flap-puff` (2-frame wing burst on tap), `fx-honey-splash` (4-frame, on pot bank), `fx-letter-restore-sparkle` (FLAP beat), `fx-grey-creep` (left-edge wedge).
- **Signature transition:** IN — horizontal **wind-streak wipe** left→right (fleeing the meadow); OUT — re-color bloom radiating from the 10th honey pot.

### 7. AUDIO CUE SHEET
- `sting-sky-theme` · `loop-flight-wind` (gameplay bed) · `drone-unspelling` (ducked under the face cameo, swells when grey wedge grows) · `chime-respell` (each pot banked) · `sting-secret-found` (cloud-letter trail complete) · `sting-gem-award`.
- Dialogue: intro c2-n1, c2-bu1, c2-b1, c2-bu2, c2-b2 → win c2-bu3, c2-n2 → (fail) c2-bu4.

---

## CHAPTER 3 · THE ELDERS' TEST: BEE GRAND PRIX
*Game: BEE GRAND PRIX (side-view racer, 3 laps, rubber-band AI). World: Hive approach. Script keys c3-q1 … c3-w3.*

### 1. SCENE & BACKDROP — `bg-grandprix-track.svg` (1600×900, layered; track strip tiles repeat horizontally)
- **`sky` layer:** clear afternoon `#BFE8FF` → cream horizon; the **Hive** as a distant honeycomb city silhouette in hive gold `#F0B429`/amber `#D98E1F` (the finish-line promise — per master §4 this is the *meadow track strip* leading to the Hive).
- **`mid` layer:** meadow hedgerows and giant labeled flowers (reuse Ch 1 flower heads, fresh arrangement), spectator bees as tiny squircle silhouettes on flower-head grandstands.
- **`near` layer:** track-side clover and fence posts of stacked comb cells, fast parallax.
- **`game-field` layer:** the **track strip** — a ribbon of packed honey-earth `#D98E1F` with wax-cream `#FFE9B8` lane lines, mild rise/dip undulation; flower arches spanning it; pollen-cloud zones puffing at track level.
- **GREY STATE (required):** this chapter is a safe zone, so grey appears only as a **thin creeping fringe on the horizon behind the racers** (the world beyond is falling). Order: (1) a low band of `grey-sky` `#C7C0B6` on the far left horizon; (2) the most distant `mid` flowers at frame edge to `#A39B8E`. Track, Hive and near layers NEVER grey in this chapter — deliver the fringe as its own `grey-fringe` layer.

### 2. CAST ON SCREEN
- **Bizzy** — `bizzy-side-fly` (racer duty); portraits: determined (c3-b1).
- **Bumble, Waggle, Drone Dan** — **side-fly racer sprites, 2-frame wing cycle each** (`bumble-side-fly`, `waggle-side-fly`, `drone-dan-side-fly`, master §4 ch3) — same silhouette language as `bizzy-side-fly` but each readable at a glance (Bumble round + eager lean; Waggle lanky + goggles-down; Drone Dan broad + tucked). Dialogue portraits: Waggle (cocky c3-w1, gobsmacked c3-w2, friendly c3-w3), Drone Dan (deadpan c3-d1, saluting-respect c3-d2 — **NEW portrait variant: `drone-dan-salute`**).
- **Hive Queen** — dialogue portrait, stern (c3-q1); reuse library portrait, no new pose.

### 3. SPRITES & ANIMATIONS
- `bumble-side-fly.svg` / `waggle-side-fly.svg` / `drone-dan-side-fly.svg` — 2 frames each (wing up/down), loop, 88×66. Each with a **nitro variant** overlay slot (flame trail behind).
- `bizzy-side-fly` — reuse Ch 2 asset; add **`bizzy-nitro` overlay** (honey-flame trail, 3-frame, loop-while-boosting, 120×40).
- `nitro-flame.svg` — the shared boost trail: 3-frame lick cycle, loop, honey `#F0B429` core / white tip, 120×40.
- `pollen-cloud.svg` — 2-frame slow billow, loop, 100×70, mustard `#E8C25A` at 80% opacity; slows racers on contact.
- `flower-arch.svg` — static arch spanning the track (two flower pylons + petal ribbon), 300×220, with a 2-frame `petal-flutter` idle; **boost-lit state** (arch glows honey when passed through).
- `spectator-wave.svg` — environmental: 2-frame tiny crowd wave on the grandstand flowers, loop.

### 4. GAME-FIELD ASSETS
- `hud-lap-counter.svg` — 3 comb-cell pips (LAP 1/2/3).
- `hud-position-flag.svg` — 1st–4th place flag chip, Fraunces numeral.
- `hud-nitro-pips.svg` — 3 flame pips (empty/banked/burning), per QUEST doc "bank nitro up to 3."
- `hud-wordcard-stream.svg` — the top-of-screen word-card conveyor frame (cards slide in from right; Sono tiles).
- `banner-start-finish.svg` — checkered wax-and-honey banner on comb posts.

### 5. STORYBOARD TABLEAUX
1. **"The Hive does not march on a child's say-so"** (c3-q1): Queen's balcony above the starting line, Queen stern in shadowed amber light; below, tiny Bizzy looking up, unbowed.
2. **The start line** (c3-w1 → c3-d1 → c3-b1): four racers hovering at the banner — Waggle smirking, Drone Dan not even looking at her, Bumble giving Bizzy a thumbs-up, Bizzy's eyes on the track: "I fly on words."
3. **MID — the THOROUGH boost** (referenced by c3-w2): Bizzy mid-air overtaking Waggle inside a flower arch, the word THOROUGH trailing behind her in honey-glow letters feeding her nitro flame; Waggle's goggles knocked askew; motion-blur mid layer.
4. **WIN — "Point the way, champion"** (c3-w2, c3-d2): finish banner; Drone Dan in his NEW salute portrait, Waggle laughing in disbelief, Bumble cheering; Bizzy modest, catching her breath; late-afternoon gold.
5. **LOSE-RETRY** (c3-w3): Waggle offering a wing-clasp rematch, friendly; nitro pips HUD visible with the "bank early" hint framed in the art.

### 6. FX & TRANSITIONS
- FX: `fx-drift-sparks` (from master FX set, on tight arch passes), `fx-nitro-burst` (4-frame one-shot on boost fire), `fx-pollen-poof` (on cloud contact), position-swap **whoosh streak**.
- **Signature transition:** IN — vertical banner-drop (start banner unfurls over the screen); OUT — checkered wipe that re-colors into the Queen's hall doorway (leads to Ch 4).

### 7. AUDIO CUE SHEET
- `sting-hive-theme` · `loop-race-buzz` (gameplay bed, tempo rises per lap) · `sting-nitro-fire` (boost) · `chime-respell` (each correct word card) · `sting-final-lap` · `sting-gem-award`.
- Dialogue: intro c3-q1, c3-w1, c3-d1, c3-b1 → win c3-w2, c3-d2 → (fail) c3-w3.

---

## CHAPTER 4 · THE QUEEN'S RIDDLE
*Game: WORD HIVE (anagram builder — 20 words from one long word). World: Hive, Queen's hall. Script keys c4-q1 … c4-q3.*

### 1. SCENE & BACKDROP — `bg-queens-hall.svg` (1600×900, layered)
- **`sky` layer:** interior — tall stained-wax windows glowing honey `#F0B429` against deep amber hall shadow `#8A5A24`; dust motes in light shafts.
- **`mid` layer:** the hall itself — colonnade of comb pillars, royal banners in Deep `#4A32A8` with honey trim (the ONE place in Act I where Deep is the dominant accent — royalty), the Queen's dais and comb throne.
- **`near` layer:** foreground pillar edges framing left and right, slight vignette.
- **`game-field` layer:** the floor before the dais where the honeycomb letter rack sits; polished wax floor `#FFE9B8` with a Deep inlay ring.
- **GREY STATE (required):** ceremonial and interior — grey exists only in the **windows**: the world OUTSIDE the stained-wax glass slowly desaturates. Order: (1) leftmost window's glow dims from honey to `#C7C0B6`; (2) second window to 50%; the two right windows stay warm. Deliver windows as four separate glow layers (`window-glow-1…4`). Hall interior itself never greys — the Hive still stands.
- Aspect: 1600×900; the rack occupies the lower 45% — keep mid-layer detail out of that band.

### 2. CAST ON SCREEN
- **Hive Queen** — dialogue portraits: **riddling** (arch, one brow up — c4-q1), **approving-warm** (c4-q2), **gentle-correction** (c4-q3); master §4 ch4 requires the Hive Queen portrait — deliver these as one portrait with three expression variants. **NEW pose this chapter: `queen-warning`** — the Queen leaning forward off her throne, wing raised, shadow behind her hinting a hornet silhouette in `#C43D5A` (for the "he was once one of us" beat, c4-q2).
- **Bizzy** — portraits: thinking (brow-scrunch — reuse determined with hand-to-chin variant), astonished (c4-b2: "…He was a BEE?").
- **Bumble** — background presence in the hall tableau only (cheer pose, small scale); no dialogue.

### 3. SPRITES & ANIMATIONS
- `comb-letter-tile.svg` — a hex cell holding one Sono letter; states: **racked** (in the big word), **lifted** (picked up, drop shadow grows), **placed** (in the answer row), **rejected** (2-frame red-shake `#C43D5A` tint, one-shot), **spent-glow** (honey pulse when a word banks). 56×56.
- `comb-fill-cell.svg` — the progress comb: an empty wax cell that **fills with honey** on each banked word — 3-frame fill (empty / half / full-gloss), one-shot per cell, 20 cells arranged as a comb.
- `honey-timer-drip.svg` — the chapter timer: a hanging honey drop that elongates and thins as time drains, 4-frame, loop-advance, 48×96.
- `dust-mote-drift.svg` — environmental: 2-frame shimmer in the window shafts, loop, subtle.

### 4. GAME-FIELD ASSETS
- `rack-honeycomb.svg` — the 9–12 letter master-word rack: honeycomb row with Sono letters, wax-cream cells, ink outline (master §4 ch4: "honeycomb letter rack").
- `meter-comb-fill.svg` — the 20-word comb meter chrome (frame around the fill cells above), with Fraunces "20 WORDS" plate.
- `row-answer-build.svg` — the answer strip where dragged/typed letters land.
- `chip-word-length.svg` — small "3+ letters" rule chip; `list-found-words.svg` — scrolling found-word sidebar frame (Hanken).

### 5. STORYBOARD TABLEAUX
1. **"Show me a deep mind"** (c4-q1): the full hall; Queen on her throne lit by window shafts; Bizzy tiny on the inlay ring below; the word THUNDERSTORM materializing in comb cells between them; reverent scale contrast.
2. **MID — "Watch me, Your Majesty"** (c4-b1): close on Bizzy at the rack, letters lifting and swirling around her hands, STORM and THUNDER already glowing in the found-word list; her face lit from below by honey glow.
3. **WIN — the warning** (c4-q2 → c4-b2): the `queen-warning` pose — Queen leaning down, one wing extended over Bizzy; behind her throne a wall shadow of a slim **hornet with a cane** in villain crimson `#C43D5A`; Bizzy's astonished portrait; the greyed window visible in frame. *(First visual Vex foreshadow of the saga — do not show his face.)*
4. **LOSE-RETRY** (c4-q3): warm, not harsh — Queen's gentle-correction portrait; the comb meter at 18/20 with two cells un-filled catching the eye; Bizzy already reaching for the rack again.

### 6. FX & TRANSITIONS
- FX: `fx-letter-lift-glow` (soft halo while a tile is held), `fx-word-bank-pour` (found word's letters melt into honey and pour into the comb meter, 5-frame one-shot), `fx-reject-shake` (tile shake, above), `fx-letter-restore-sparkle`.
- **Signature transition:** IN — the hall doors open as a center-out wipe (from Ch 3's checkered exit); OUT — the comb meter's 20th cell overfills and the honey spill wipes the screen gold.

### 7. AUDIO CUE SHEET
- `sting-hive-theme` (regal variation: `sting-hive-royal`) · `loop-hall-quiet` (soft gameplay bed) · `chime-word-bank` (per banked word, pitch rises every 5 words) · `sting-riddle-posed` (c4-q1 underscore) · `motif-vex` (**first use** — 4-note elegant minor motif, very quiet, under the c4-q2 warning) · `sting-gem-award`.
- Dialogue: intro c4-q1, c4-b1 → win c4-q2, c4-b2 → (fail) c4-q3.

---

## CHAPTER 5 · WHACK-THE-MOTHS
*Game: WHACK-A-MOTH (whack-a-mole; whack the target word's letters in order). World: Hive nursery, night. Script keys c5-bu1 … c5-b2.*

### 1. SCENE & BACKDROP — `bg-hive-nursery-night.svg` (1600×900, layered)
- **`sky` layer:** interior night — deep indigo `#2A2350` upper hall lost in shadow; two moonlit vent openings casting pale `#BFE8FF` beams.
- **`mid` layer:** the nursery — rows of capped brood cells glowing faint warm honey from within `#F0B429` at 30%; tiny sleeping larva faces peeking from a few open cells (adorable, squircle style — these are what we protect); hanging mobile of letter shapes above the cribs.
- **`near` layer:** foreground comb arches in near-black amber `#4A3210`, vignette.
- **`game-field` layer:** the **nursery comb grid** — a 3×3 (scaling to 4×4) grid of open comb cells, each a moth pop-up hole, lit by a soft nightlight ring.
- **GREY STATE (required):** the moths BRING the grey. Order: (1) any cell a moth occupies gets a creeping grey rim `#A39B8E` that fades when the moth is bopped; (2) if a word is failed, one nursery crib's inner glow dims to `#C7C0B6` (deliver crib glows as 6 separable layers); (3) full-fail state: the letter mobile above the cribs greys and its letters go blank. Win reverses all — crib glows re-warm one by one.

### 2. CAST ON SCREEN
- **Bumble** — dialogue portraits: **alarmed** (c5-bu1 — NEW variant: `bumble-alarmed`, antennae straight up, pupils tiny), relieved cheer (c5-bu2).
- **Bizzy** — portraits: determined (c5-b1), focused-encouraging (c5-b2); on-field presence is the mallet (the player's hand is Bizzy's).
- **The Smudge** — no dialogue; its presence is the moths + the closing narrator beat c5-n1 (see tableau 3).

### 3. SPRITES & ANIMATIONS
- `moth-popup.svg` — **3 poses** (master §4 ch5): **p1 emerge** (peeking from cell, wings folded), **p2 hover** (up, wings spread, carrying a Sono letter card on its belly), **p3 bonked** (squashed-squircle, stars, letter card released) — plus 2-frame flap within p2. Grey family body, letter card wax-cream. One-shot sequence per spawn, 72×72.
- `moth-golden.svg` — same 3 poses in honey-gold `#F0B429` with sparkle trim; bonus moth, rarer, 72×72.
- `mallet-soft.svg` — the cursor/touch mallet: honey-wood handle, wax-cream head with a tiny embroidered bee; **2-frame bop** (raised / squash-hit with radial impact lines), one-shot per tap, 80×80. Never looks like a weapon — it's a plush.
- `crib-glow.svg` — environmental: 2-frame warm breathing glow inside brood cells, slow loop.
- `letter-card-drop.svg` — 3-frame one-shot: released letter card arcs into the HUD word slot.

### 4. GAME-FIELD ASSETS
- `grid-nursery-comb.svg` — the pop-up grid plate (3×3 and 4×4 variants), night-lit rims.
- `hud-target-word.svg` — top word plate: Sono letter slots that fill in order as correct moths are bopped; wrong-bop state flashes `#C43D5A` and the timer chip ticks down.
- `hud-round-counter.svg` — 8 word pips (per QUEST doc: 8 words per round).
- `hud-time-chip.svg` — nursery hourglass chip (moon-sand).

### 5. STORYBOARD TABLEAUX
1. **"The Smudge's moths are in the NURSERY!"** (c5-bu1): doorway shot — Bumble bursting in silhouette against hall light, `bumble-alarmed`; beyond him the dark nursery with grey moths drifting between the glowing cribs; one moth lifting a letter from the mobile.
2. **MID — "Bop them in SPELLING ORDER"** (c5-b1): over-the-mallet view: Bizzy mid-swing on a p2 moth carrying "B", the HUD word half-filled, crib glows warm at frame bottom; comic energy, zero menace on the sleeping larvae.
3. **WIN — but the face smiled** (c5-bu2 → c5-n1): two-beat frame — foreground: Bumble and Bizzy fist-bump over the quiet grid, cribs all warm; background top: in the dark above, the moths **regathered into a faint smiling face** `#A39B8E`, unseen by the heroes. The player sees it; they don't. Dread + comfort in one image.
4. **LOSE-RETRY** (c5-b2): Bizzy blowing hair from her face, mallet over shoulder, moths cheekily mid-taunt around her; one crib glow dimmed as the stake.

### 6. FX & TRANSITIONS
- FX: `fx-bop-stars` (4-frame one-shot on hit), `fx-wrong-bop` (red `#C43D5A` ring + time-tick), `fx-golden-burst` (golden moth bonus, 5-frame), `fx-grey-rim-creep` / `fx-grey-rim-heal` (cell rims).
- **Signature transition:** IN — lights-out iris to the nightlight ring (day Hive → night nursery); OUT — **hold on the smiling face beat**: the win screen's re-color bloom is interrupted by a 1-second grey shimmer at frame top before the gem awards (sets up Ch 6).

### 7. AUDIO CUE SHEET
- `sting-hive-theme` (lullaby variation: `sting-hive-lullaby`) · `loop-nursery-tense` (gameplay bed, music-box over low pulse) · `sfx-bop` / `sfx-bop-golden` · `chime-respell` (word completed) · `drone-unspelling` (swells under c5-n1) · `sting-gem-award`.
- Dialogue: intro c5-bu1, c5-b1 → win c5-bu2, c5-n1 → (fail) c5-b2.

---

## CHAPTER 6 · BOSS: THE SMUDGE
*Game: SPELL-SHIELD (boss: unscramble-and-type to build the shield wall; final phase 3 dictation words fire the Stinger Quill). World: Hive gates. Script keys c6-s1 … c6-b3.*

### 1. SCENE & BACKDROP — `bg-hive-gates-arena.svg` (1600×900, layered)
- **`sky` layer:** storm-dark morning — bruised slate clouds (use `#575046` — the grey family IS the storm; the Smudge fills the sky) torn by shafts of defiant honey light `#F0B429`.
- **`mid` layer:** the great Hive gates — twin comb doors in amber `#D98E1F`/`#8A5A24` with the Hive crest in Deep `#4A32A8`; ramparts lined with tiny defender-bee silhouettes.
- **`near` layer:** battlefield foreground — scattered petals from the meadow blowing through (continuity), broken name-tag props half-buried.
- **`game-field` layer:** the arena apron before the gates where the shield wall builds; ground plane wax-cream, hex shield sockets faintly inscribed.
- **GREY STATE (required):** the boss arena is the act's grey climax. Order (tied to boss health, deliver as 4 stacked grey layers): (1) `grey-sky` fully desaturated at fight start (already the Smudge); (2) `grey-mid-ramparts` — defender silhouettes fade to `#C7C0B6` as the Smudge attacks land; (3) `grey-gates` — the crest's Deep `#4A32A8` drains toward `#7A7267` when the gate timer runs low; (4) `grey-near` petals. Victory reverses 4→1 with the re-color bloom. Lose state shows layers 1–3 active.

### 2. CAST ON SCREEN
- **Bizzy** — portraits: determined (c6-b1), welcoming-warm (c6-b2), resolute-after-loss (c6-b3); **key art pose `bizzy-quill`** (master §1.1 — hero pose, Stinger Quill aloft) debuts in the final phase and win tableau.
- **The Smudge** — full reveal: `smudge-swarm-face` with **attack** and **recoil** states (master §4 ch6); dialogue portrait = the swarm-face itself (hungry c6-s1, whisper-menace c6-s2).
- **Sting** — **defect cameo portrait** (master §4 ch6): a lean wasp in the library's squircle style, crossed-arms, chin up, old Vex-corps sash **torn off** and held in one hand — crimson `#C43D5A` sash detail on an otherwise hero-warm figure (c6-st1). One portrait, plus a small cheer variant for the saga map roster. *(Sting has no voice-casting row in master §8 — flagged to production; art proceeds regardless.)*
- **Bumble** — rampart background cheer (tableau only).

### 3. SPRITES & ANIMATIONS
- `smudge-swarm-face.svg` — the boss: hundreds of implied moths forming one face, ~700×500 render. States/frames: **idle** 2-frame drift-shimmer (loop) · **attack** 3-frame (face compresses → hurls a scrambled-word clot forward → follow-through scatter) one-shot · **recoil** 2-frame (face blown open, moths scattering, hole where the word hit) one-shot · **dive** 2-frame (final-phase plunge silhouette) · **defeat-scatter** 5-frame one-shot (face disintegrates outward, moths fleeing to every edge — must NOT read as death, reads as rout).
- `word-clot.svg` — the scrambled-word projectile: a tumbling knot of grey letter-tiles, 2-frame tumble, loop while in flight, 120×80; on player success it **converts** — 3-frame one-shot into a glowing shield hex.
- `shield-hex.svg` — build states (master §4 ch6): **socket** (empty inscribed hex) / **forming** (letters orbiting into place, 2-frame) / **set** (solid honey-glass hex, gloss highlight) / **cracked** (on hit) / **shattered** (4-frame one-shot). 96×84. The wall = 9 hexes in a gate-arch arrangement.
- `stinger-quill.svg` — artifact debut (master §3): golden quill-stinger, states **normal / glowing / grey-dimmed**; plus `quill-fire` 4-frame one-shot (charge glow → letter-stream lances out) for the three dictation shots, 140×48.
- `grey-moth.svg` — reuse Ch 1 sprite for loose stragglers around the arena edges.

### 4. GAME-FIELD ASSETS
- `hud-boss-bar.svg` — ink-outline boss health bar with **phase pips** (2 phases: waves / dive), per master §5 boss bar spec.
- `hud-gate-timer.svg` — the gate integrity timer: the Hive crest draining color (mirrors grey layer 3).
- `panel-unscramble-type.svg` — the answer panel: scrambled Sono tiles above, typed row below.
- `panel-dictation.svg` — final phase voice-only card: speaker icon + blank Sono slots (no letters shown — audio is the prompt).
- `arch-shield-sockets.svg` — the 9-socket wall chrome over the gates.

### 5. STORYBOARD TABLEAUX
1. **"Give usss the wordsss"** (c6-s1 → c6-b1): the full arena — the swarm-face filling the sky above the gates, Bizzy alone on the apron, one shield hex already glowing beside her; scale: she is 1/20th the face's size; her line lands because of it ("I'm exactly the size of every word I know").
2. **MID — "He knowsss your name"** (c6-s2): close push-in — the face leaning down between attack waves, whisper-shaped; behind Bizzy, her shadow on the gate shows **one letter of her wing-name flickering** (foreshadows Ch 17); cold light, single honey rim on Bizzy.
3. **The quill fires** (final phase, no line — between c6-s2 and win): `bizzy-quill` hero pose — quill aloft, a stream of glowing letters arcing up into the diving swarm-face, shield wall complete below; the single most reusable key-art frame of Act I.
4. **WIN — Sting defects** (c6-st1 → c6-b2): gates intact, sky clearing to color from the top down; Sting kneeling-to-standing before Bizzy, torn sash in hand; Bumble and defenders on the ramparts mid-cheer; warm dawn returning.
5. **WIN CODA — the ledger** (c6-n1): cut to a place we haven't seen — an elegant desk in shadow, a hornet's hand in **gold pinstripes** crossing out the word MEADOW in a ledger; `#C43D5A` cuff, cane-stinger resting against the desk; face never shown. *(Vex's true visual introduction, hands only.)*
6. **LOSE-RETRY** (c6-b3): the shattered wall's fragments still glowing at the edges; Bizzy picking up a single unbroken hex, resolute: "shields can be rebuilt."

### 6. FX & TRANSITIONS
- FX: `fx-shield-form` (letters orbit + snap), `fx-shield-shatter`, `fx-quill-lance` (letter-stream beam), `fx-swarm-scatter` (defeat), `fx-grey-creep` / `fx-recolor-bloom` (phase-tied, per backdrop grey order), `fx-letter-dissolve` (on the whispered name beat).
- **Signature transition:** IN — the Ch 5 grey shimmer completes: grey-creep crashes down over the gates like weather. OUT — the act's biggest **re-color bloom**, radiating from the fired quill to full frame, then irising to the ledger coda (which stays desaturated except the crimson and gold — the next threat).

### 7. AUDIO CUE SHEET
- `sting-boss-smudge` (boss intro) · `loop-boss-waves` / `loop-boss-dive` (phase beds) · `drone-unspelling` (constant under-layer, ducks on each shield set) · `chime-respell` (per shield hex) · `sting-quill-charge` + `sting-quill-fire` (dictation shots) · `sting-victory-act1` · `motif-vex` (over the ledger coda, c6-n1) · `sting-gem-award` + act-medallion fanfare.
- Dialogue: intro c6-s1, c6-b1 → mid c6-s2 (between phases) → win c6-st1, c6-b2, c6-n1 → (fail) c6-b3.

---

## ACT I DELIVERABLE CHECKLIST (roll-up)
| Category | Assets |
|---|---|
| Backdrops (color + grey layers, 1600×900 SVG) | `bg-meadow-dawn` · `bg-open-sky` · `bg-grandprix-track` · `bg-queens-hall` · `bg-hive-nursery-night` · `bg-hive-gates-arena` |
| Bizzy views | `bizzy-top` · `bizzy-side-fly` (+nitro overlay) · portrait emotion set · `bizzy-quill` |
| Crew/new poses | `bumble-cling` · `bumble-alarmed` · `drone-dan-salute` · `queen-warning` · Sting defect portrait (+cheer) · racer side-fly ×3 |
| Villain | `smudge-whisper-portrait` · `smudge-face-bg` (+retreat) · `smudge-swarm-face` (5 states) · `grey-moth` (patrol/flee) · Vex hands-only ledger tableau |
| Sprites/pickups | golden-flower · royal-jelly · nectar-dot · honey-pot · cloud-letter-glyphs · thorn-wall · nitro-flame · pollen-cloud · flower-arch · comb-letter-tile · comb-fill-cell · honey-timer-drip · moth-popup · moth-golden · mallet-soft · word-clot · shield-hex · stinger-quill |
| UI/game-field | per-chapter HUD sets (§4 of each chapter) · saga map Act I land · dialogue frame · `gem-act1-amber-hex` ×6 + Act I medallion |
| FX kit | recolor-bloom · grey-creep · letter-restore-sparkle · letter-dissolve · chapter one-shots (§6 of each chapter) |
