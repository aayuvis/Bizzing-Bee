# DESIGN BRIEF — ACT III · "THE DICE AND THE EXILE" (Chapters 13–18)
### Bizzy and the Great Unspelling · art-production brief for Claude Design
*Companion to `CLAUDE-DESIGN-BRIEF-SAGA.md` (master art direction — LAW) and `QUEST-SAGA-DESIGN.md` (mechanics). This act is the saga's fall: the Mahabharata dice game and exile (13–14), the Odyssey's lotus and sirens (15–16), the night raid that takes Bumble and Melody (17), and Void's dark sky (18).*

**Act-wide law (do not restyle):** Blooket-style squircle characters, bold ink sticker outline, duotone cheer shading. Artifacts = glossy sticker (gradient body, single shine, soft colored drop shadow, ink outline). Honey `#F0B429` · Deep `#4A32A8` · Villain crimson `#C43D5A` · Cosmos cyan `#36D1FF`. **Grey `#A39B8E` family is NEVER neutral — grey MEANS unspelled.** Type: Fraunces / Hanken Grotesk / Sono only. SVG layered, sprite frames as sibling groups `f1…fN` (or PNG sheet @2x transparent). Every environment ships with its grey layer separable. Act III story gem = the **broken-die** design (see master §3.2).

---

## CHAPTER 13 · THE RIGGED GAME — engine: DICE OF FATE (board game)

### 13.1 SCENE & BACKDROP — Vex's Carnival
The trap must look WONDERFUL. Too-bright, too-perfect — rigged glamour: every color 10–15% hotter than the app norm, so the eye tingles slightly. File `env-carnival.svg`, 4 layers:
- L1 sky: dusk violet `#3A2A6E` → `#C43D5A` horizon glow (villain crimson hiding in plain sight as "sunset").
- L2 tent: crimson `#C43D5A` + gold `#F0B429` pinstripe big-top, scalloped valance, string bulbs `#FFE9A8` (bulb pairs alternate 2-frame twinkle). Pennants in arcade pink `#FF5D9E` + hot teal `#2EE6C8`.
- L3 midway: prize-booth silhouettes, popcorn-light haze, oversized plush word-toys (letters as carnival prizes — foreshadowing: words as STAKES).
- L4 foreground: the dice table (see game-field) + velvet rope frame.
**Grey-state layer:** the tell. In grey state the glamour dies to `#A39B8E`/`#8C857A`, bulbs go out, pennants hang limp — deliver as separable layer; the app snaps to it at the LOADED reveal (no slow wipe here — a hard betrayal cut).

### 13.2 CAST ON SCREEN
- **Vex** `vex-dealer` (NEW pose): standing behind the table, cane-stinger tucked, one hand fanning the dice like a card sharp; charming-smile portrait for early rounds, cold-fury portrait for the reveal (both exist in master set — reuse).
- **Bizzy**: determined portrait (rounds 1–5) → worried → **heartbroken** portrait (post-reveal; master set).
- **Crew despair portraits** (NEW, one each, 512×512 squircle): `bumble-despair` (antennae flat, fists balled), `melody-despair` (hand over mouth), `waggle-despair` (hiding behind wings), `pixel-pal-despair` (screen-face showing a "!" glitch). Same character read as library art — only the expression/pose changes.
- Background rail: 4–6 crew cheer poses (existing) reacting to early wins.

### 13.3 SPRITES & ANIMATIONS
- `dice-pair-roll.svg` — 96×96 each die, sticker gloss, ivory body `#FFF6E8`, honey pips. **6 frames:** f1 tumble edge-on (motion smear arc) · f2 mid-air corner spin · f3 bounce squash on felt · f4 second bounce, pips blurred · f5 settle wobble · f6 rest, pips crisp. Loop f1–f4 during rattle; f5–f6 on result.
- `dice-loaded-reveal.svg` — 3 frames, same dice: f1 hairline crack of grey light along one seam · f2 pips REARRANGE (honey pips slide to new faces, trailing `#C43D5A` afterglow) · f3 full **loaded glow**: sickly crimson-to-grey rim light `#C43D5A`→`#A39B8E`, pips now grey. This is the heartbreak asset — make f2 legible at 96px.
- `vex-hand-palm.svg` — 2 frames, close-up sticker of Vex's hand: closed / open revealing a third hidden die (the cheat, for tableau T4).
- `coin-stack-drain.svg` — 4 frames: full honey-coin stack → half → two coins → empty felt circle with grey coin-ghost outline.
- `board-pawn-bizzy.svg` — 64×64 top-slight-3/4 Bizzy pawn, 2-frame hop (squash/stretch) for tile-to-tile movement.

### 13.4 GAME-FIELD ASSETS
- `board-carnival.svg` — 12-tile loop on crimson felt, gold tile borders. Tile faces (sticker style, 128×128): **wager** ×6 (letter-scroll icon), **trap** ×3 (moth-in-a-box icon — grey accents allowed, they're villain tiles), **bonus** ×3 (honey pot icon). Center: the dice throw circle with gold inlay.
- `wager-card-frame.svg` — the spell-under-pressure card: velvet frame, coin-stake slot at top, Sono tile row, sweating 10s honey-drip timer.
- `stake-chip.svg` — honey-coin poker chip, normal + greyed states.

### 13.5 STORYBOARD TABLEAUX (5 frames — the scripted loss, shot-by-shot)
- **T1 "Welcome, little champion"** — wide: tent interior blazing, Vex `vex-dealer` gesturing to the empty seat, crew clustered wide-eyed at the glamour. Everything slightly TOO bright.
- **T2 "The winning streak"** — mid: Bizzy mid-cheer at the table, coin stacks tall, crew cheer poses behind, Vex's charming smile — but his eyes in shadow (only lit-from-below face in the act).
- **T3 "One last roll — everything on the table"** — close on the felt: all coin stacks pushed to center, dice mid-air at `dice-pair-roll` f2, every face reflected in the table's gloss.
- **T4 "LOADED"** — extreme close: `dice-loaded-reveal` f3 full glow + `vex-hand-palm` f2 open showing the hidden die. Background snaps to the grey-state layer. No text on frame — the image is the line.
- **T5 "The table takes everything"** — wide: grey tent, `coin-stack-drain` f4 empty circles, crew despair portraits in a broken row, Bizzy heartbroken portrait center, Vex already walking away, cane tapping.

### 13.6 FX & TRANSITIONS
- `fx-glamour-shimmer` — subtle heat-haze sparkle pass over the tent (loops; it STOPS at T4 — its absence is the horror).
- `fx-loaded-flash` — one-frame white flash → hard cut to grey layer.
- `fx-coin-sweep` — coins slide to Vex's side of the felt with a grey trail.
- Chapter exit: iris-out through a die pip.

### 13.7 AUDIO CUE SHEET
- `c13-x1` Vex (am_onyx, pitch −2, dry close-mic): "Step up, step up — the table loves a clever tongue."
- `c13-x2` Bumble (am_michael, +1/+5%): "Bizzy, we're WINNING! Roll again!"
- `c13-x3` Vex: "One more roll. Everything on the table… even the words you came with."
- `c13-x4` SFX: dice rattle/reveal sting (master §6) → loaded reveal = the sting's last note detunes flat.
- `c13-x5` Vex, cold: "Loaded? Little bee — the game was never the dice."
- `c13-x6` Melody (bf_emma, plate reverb), small: "He planned this. All of it."
- Music: carnival waltz built on the Vex motif (elegant, minor, 4 notes) sped up and over-sweetened; collapses to the Unspelling drone at T4.

---

## CHAPTER 14 · THE BANISHMENT — engine: Word Ladder (exile walk)

### 14.1 SCENE & BACKDROP — Hive Court → the Gorge
Two backdrops. `env-hive-court-accusation.svg`: the Queen's hall (reuse Ch 4 geometry) but cold — honey golds dimmed toward `#B98A1F`, long shadows, the elders' bench raised, forged letters glowing faint crimson on the dais. Grey creep already eating the hall's far corners (separable grey layer, 20% in).
`env-gorge-exile.svg`, 3 layers: L1 storm sky `#4A4458`→`#6B6478` (a TRUE grey-family sky is allowed here — the wild IS half-unspelled); L2 gorge walls, wet rock with faint paper-fold texture; L3 rain layer `fx-rain` (separable, 2-frame streak offset loop). Down-and-out diagonal composition: every rung of the ladder descends.

### 14.2 CAST ON SCREEN
- **Hive Queen** portrait (existing) + NEW `queen-sorrow` portrait variant: crown lowered, eyes closed — she believes the forgery and it breaks her.
- Elder silhouettes ×3 (robed bee silhouettes, no new characters — keep abstract, backlit).
- Full crew in walking line, side view — reuse existing side/run sprites at small scale; Bizzy leads, run cycle slowed to a trudge (half-speed playback, no new frames).
- Bizzy worried portrait; Bumble despair (from 13.2, reused).

### 14.3 SPRITES & ANIMATIONS
- `forged-letter-prop.svg` — 128×128 sticker: wax-sealed scroll, seal is Vex's stinger mark in `#C43D5A`; 2 states: sealed / unrolled showing forged handwriting that visibly GREYS at the signature line.
- `ladder-plank.svg` — gorge ladder rung as a paper plank, 3 states: blank (grey `#A39B8E` outline) / folding-in (mid-crease, 45°) / set (full color honey wood, word carved in Sono). One valid word-ladder step = one plank folds and sets.
- `ladder-plank-wobble.svg` — 2-frame shake for invalid steps (no punishment art — it just wobbles and unfolds).
- `rain-drip-tile.svg` — 32×32 loopable drip for UI edges.

### 14.4 GAME-FIELD ASSETS
- Ladder rail frame: two rope verticals, plank slots ×7 (longest ladder), progress = crew figures stepping down one plank behind Bizzy per rung.
- Word-entry row in Sono tiles; changed letter highlights honey, unchanged letters stay ink.
- Assist chip: Crane's fold power icon (existing emblem) — undoes one wrong step.

### 14.5 STORYBOARD TABLEAUX (4 frames)
- **T1 "The forged proof"** — court: elder holding `forged-letter-prop` unrolled, crimson seal catching the only warm light; crew small in the vast hall.
- **T2 "The Queen turns away"** — close: `queen-sorrow`, one tear held (never falling — dignity), Bizzy's reflection tiny in the crown.
- **T3 "The gates close"** — the hive doors sealing, honey light narrowing to a line, crew silhouettes against the storm.
- **T4 "Down the ladder"** — the gorge: the word-ladder of planks descending into rain-mist, crew single-file, Bizzy pausing to look back up at the last light.

### 14.6 FX & TRANSITIONS
- `fx-seal-crack` — the wax seal splits with a crimson spark when the forgery is read aloud.
- Grey-creep on the court edges advances one notch per story beat (edge desaturation, master FX set).
- Transition out: rain streaks wipe the screen downward into Ch 15's pastel haze (rain → perfume, ominous continuity).

### 14.7 AUDIO CUE SHEET
- `c14-x1` Elder (am_adam, −5%): "The letters bear your seal, little one. Words do not lie."
- `c14-x2` Bizzy (af_heart): "But these words DO. Someone taught them to."
- `c14-x3` Hive Queen (bf_isabella, slight hall), quiet: "Until the truth spells itself… you cannot stay."
- `c14-x4` SFX: gate-boom, rain bed rises.
- `c14-x5` Bumble, softly: "Every rung is a step further from home. So spell them well."
- Music: hive theme in minor, thinned to solo voice; rain as percussion.

---

## CHAPTER 15 · THE LOTUS MEADOW — engine: FADING WORDS (memory-erase)

### 15.1 SCENE & BACKDROP — the meadow that erases
Dangerously pretty. Oversaturated dream-pastels that no other world uses — beauty as anesthesia. `env-lotus-meadow.svg`, 4 layers:
- L1 sky: cream-peach `#FFE9C9` → blush `#FFB8D9` gradient, sun a soft haloed disc (no hard light anywhere — nothing here has edges).
- L2 far meadow: lilac `#C9A8FF` and mint `#A8FFD8` grass swells, out-of-focus bloom.
- L3 lotus field: oversized lotus blooms `#FFD9EC` petals / honey `#F0B429` hearts — the ONE app-palette anchor, so Bizzy's honey reads as "the thing worth remembering."
- L4 perfume haze: drifting pollen-mist ribbons (10% white overlay, slow sine drift, separable so intensity can ramp with erasure speed).
**Grey-state:** unique rule — this meadow's grey state keeps its SHAPES pretty; only the color drains petal-by-petal `#A39B8E`. Prettiness persisting into grey = the trap made visible.

### 15.2 CAST ON SCREEN
- **Drowsy crew variants** (NEW, portrait + half-body, 3 characters): `bumble-drowsy` (lids at half, lopsided smile, a lotus petal resting on his head), `zoomies-drowsy` (curled mid-air mid-zoom, tail still wagging in sleep), `capy-drowsy` (fully horizontal in the blooms, deeply content — Capy is the one who almost STAYS; needs an extra beat pose `capy-rooted`: petals beginning to settle over him like a blanket).
- Bizzy determined portrait, plus a NEW `bizzy-shake-awake` half-body: wings buzzing hard, one hand pulling Capy's paw.
- Fae portrait (existing) for the meaning-hint line.

### 15.3 SPRITES & ANIMATIONS
- `lotus-bloom.svg` — 96×96 sticker lotus, 3-frame open (bud / half / full), petals `#FFD9EC`, heart `#F0B429`; plus `lotus-grey` single-frame drained variant.
- `fx-letter-dissolve.svg` — THE chapter FX, applied per Sono letter tile, 4 frames: f1 letter intact · f2 edges soften, serifs lift off as petal-flecks · f3 letter half-gone, flecks drifting up-left on the perfume current · f4 empty tile with a faint `#A39B8E` after-image ghost of the letter (the ghost matters — you remember THAT you knew, not WHAT you knew). Reverse playback = the retype restore.
- `perfume-ribbon.svg` — 2-frame shimmer ribbon crossing the word row right-to-left; erasure speed ramp = more ribbons.
- `petal-fall.svg` — 3-frame drifting petal for ambient loop + the Capy-blanket beat.

### 15.4 GAME-FIELD ASSETS
- Word stage: a lotus-pad platform holding the Sono word row (12 words, erasure speeding up per master §4.15); pad tilts gently — nothing is stable here.
- Retype row beneath with soft-focus keys; correct letters re-ink with `fx-letter-dissolve` reversed.
- Progress: 12 lotus buds along the top; each completed word BLOOMS one (3-frame open); failed word = bud drains to `lotus-grey` (recoverable).
- Wake-meter (story UI): Capy's portrait slowly sliding from alert → drowsy → rooted unless words keep landing.

### 15.5 STORYBOARD TABLEAUX (4 frames)
- **T1 "Oh, it's LOVELY here"** — wide: crew wading into waist-high blooms, all smiles, perfume ribbons curling around them like welcome banners.
- **T2 "…what was I saying?"** — mid: Bumble mid-sentence, his speech-bubble letters visibly at `fx-letter-dissolve` f2–f3, petals in his fur.
- **T3 "Capy roots"** — close: `capy-rooted`, petals settling over him, his smile utterly peaceful — the frame should be genuinely tempting, not creepy. That's the point.
- **T4 "Wanting to remember"** — Bizzy pulling Capy's paw (`bizzy-shake-awake`), her wing-name letters flickering but HELD, the path out of the meadow visible as the only hard-edged shape in frame.

### 15.6 FX & TRANSITIONS
- Ambient: petal-fall loop density rises through the chapter; soft vignette breathes (2% scale sine, 8s period) — the meadow is sleeping and so will you.
- `fx-word-restore-sparkle` (master FX set) on every completed retype — the ONLY crisp particle in the chapter.
- Exit transition: the haze layer tears like tissue paper as the crew breaks the treeline; colors snap back to app-normal saturation (the relief should be physical).

### 15.7 AUDIO CUE SHEET
- `c15-x1` Narrator (af_heart), hushed: "The meadow was beautiful. That was the whole trick."
- `c15-x2` Bumble, dreamy: "Five more minutes. Maybe five more… what comes after five?"
- `c15-x3` Capy (af_sarah, +2/+8%, slowed here −10% for irony), sleepy: "I could stay. Words are heavy. Petals aren't."
- `c15-x4` Fae: "Say what a word MEANS and it holds on tighter. Meaning is an anchor."
- `c15-x5` Bizzy, fierce and kind: "Capy. Your name. Spell it with me. C…"
- Music: music-box lullaby over the Unspelling drone at −18dB (the drone is UNDER the pretty the whole time); tempo imperceptibly slows 4bpm across the chapter.

---

## CHAPTER 16 · THE SIREN CHORUS — engine: SIREN SONG (true/false audio)

### 16.1 SCENE & BACKDROP — the Siren Shore
Abstract, alluring, wrong. `env-siren-shore.svg`, 4 layers:
- L1 sky: deep twilight `#4A32A8` → `#2A1E66`, stars few and smeared (this close to Void's work, the sky is already sick).
- L2 sea: ink-dark water with moonpath in cold silver `#CFD6E6` — beautiful but colorless: a grey lying about being a color (intentional edge-case use; it reads as moonlight, foreshadows falseness).
- L3 rocks: three basalt spires, one singer-silhouette atop each — pure black shapes with a single rim light each: center singer rimmed honey `#F0B429` (the TRUE voice), flankers rimmed crimson `#C43D5A` and grey `#A39B8E`. Rim colors are the eventual tell but must NOT be announced — at chapter start all three rims are white; they resolve to their true colors only as the player earns correct picks.
- L4 foreground: wave-froth cutouts, the crew's boat rail.
**Grey-state:** waves lose their froth-lines and flatten to un-inked paper (visual kin to Act IV's Grey Sea — deliberate preview).

### 16.2 CAST ON SCREEN
- Three **singer silhouettes** (NEW, abstract — not library characters, not faces): elongated squircle-bodied figures, featureless except an open-mouth notch; identical poses, 2-frame sway. Deliberately unidentifiable — the lie has no face.
- Crew on the boat rail (existing avatars, small scale): Melody with hands over ears — she KNOWS harmony, and hears the flat one; her portrait gets one NEW variant `melody-hears-false` (eyes narrowed, one finger raised: "that one").
- Bizzy determined portrait; Echo `echo-perch-speak` (existing) for hint lines.

### 16.3 SPRITES & ANIMATIONS
- `song-ribbon.svg` — THE chapter asset: a flowing ribbon of light emitted from each singer, carrying its spelling in Sono letterforms embedded along the curve (e.g. *separate / seperate / seperete*). 3-frame undulation (letters ride the wave without distorting — keep x-height locked). Three color variants: `song-ribbon-true` honey-cream `#FFE9A8` with clean letter-spacing · `song-ribbon-false-a` crimson-tinged, letters SUBTLY too close together · `song-ribbon-false-b` grey-tinged, one letter's baseline 2px off. The wrongness must be findable but never labeled.
- `ribbon-shatter.svg` — 3 frames: a false ribbon picked/muted cracks like sugar glass and rains letter-shards into the sea.
- `ribbon-crown.svg` — 2 frames: the true ribbon, on correct pick, loops itself into a halo ring before flowing to the answer row.
- `earplug-sticker.svg` — 96×96 glossy wax earplug (honey-wax gradient, single shine, ink outline), states: available / used (squashed). Power-up: mutes one false singer — that singer's ribbon desaturates fully and its sway freezes.
- `singer-sway.svg` — the 2-frame silhouette sway; plus `singer-slump` single frame (a muted/beaten singer folds like a closed umbrella).

### 16.4 GAME-FIELD ASSETS
- Pick UI: three ribbon lanes converging on the boat; tap a lane to choose a voice. 10 words per master §4.16.
- Type-through row: after a correct pick, the Sono entry row sits ON the moonpath while the two false ribbons keep harmonizing across the screen behind it (visual + audio distraction is the mechanic — ribbons pass BEHIND the row, never occlude input).
- Score fixture: ten note-glyph buoys (siren note-glyph sticker, master §3.10) bobbing in a row; each solved word lights one buoy honey.

### 16.5 STORYBOARD TABLEAUX (3 frames)
- **T1 "Three voices, one word"** — wide: the boat small on the moonpath, three ribbons arcing overhead carrying three spellings of the same word, crew transfixed.
- **T2 "Melody hears it"** — close: `melody-hears-false`, one finger up, a single crimson ribbon-letter reflected in her eye.
- **T3 "The chorus breaks"** — the two false singers slumped (`singer-slump`), their ribbons shattered mid-air, the true ribbon crowning Bizzy as the boat slips past the rocks.

### 16.6 FX & TRANSITIONS
- Ribbon glow pulses ON the sung syllables (sync markers at 0.5s intervals for the audio team).
- `fx-moonpath-shimmer` — gentle; freezes when the player is choosing (the world holds its breath).
- Exit: the moonpath grey flattens into the paper-wave horizon → smash cut to Ch 17's night palette.

### 16.7 AUDIO CUE SHEET
- `c16-x1` The Sirens (af_bella + af_nicole + af_sky layered, third voice −30 cents): the word sung three ways — ONE render per word, the detuned voice always the false pick's lane. 10 word-renders: `c16-song-01`…`c16-song-10`.
- `c16-x2` Echo (af_nicole, +3, echo tail): "Pretty isn't the same as true! True! …true!"
- `c16-x3` Melody: "Every chord tells on itself. Listen for the one that's almost right."
- `c16-x4` Bizzy: "Then we spell it RIGHT — and sing it louder."
- `c16-x5` SFX: ribbon-shatter = glass chimes falling into water; buoy light = single warm bell.
- Music: siren trio harmony (master §6 — one voice subtly flat) IS the score; no other music until the exit, where the crew's hummed hive theme takes over.

---

## CHAPTER 17 · THE QUIET NIGHT — engine: Silent Maze (stealth) · THE dark chapter

### 17.1 SCENE & BACKDROP — camp at night
`env-quiet-night.svg`: the exile camp on the gorge rim. L1 night sky deep indigo `#1E1440`, thin moon; L2 sleeping camp — bedrolls, the campfire sticker (master §3.10) burned to embers `#C43D5A`-warm coals; L3 maze field: night-blue hex paths `#2A2154` with ink shadows; L4 **light-radius mask** — a soft-edged circle of visibility around Bizzy (~160px radius at 1x), everything beyond at 12% luminance. Deliver mask as its own layer with feathered alpha.
**Grey-state:** this chapter PLAYS inside encroaching grey — the maze's far edges are already `#A39B8E` static-flecked; reaching the exit is literally walking out of the grey.

### 17.2 CAST ON SCREEN
- **Bizzy** `bizzy-top` maze puck (existing) + NEW **faded portrait** usage: her wing-name letters missing per HUD state (master portrait set has `faded`; this chapter drives it).
- **Melody** `melody-captive` (master §1.1 special view): held in a static-cage, defiant not helpless — chin up, one fist on the bars, stage-light dignity. Needs cage integration pass: `static-cage.svg`, 2-frame crackle, bars of vertical white-noise `#CFC9BF` on ink.
- **Bumble** NEW `bumble-captive`: net-wrapped, still struggling — one arm free, reaching (mirror of his eager cheer pose; hope even in capture).
- **Locust troopers** (master mob set) as patrols; **Vex** appears ONLY as a cane-tap shadow and a silhouette in T1 — do not show his face this chapter (the raid is scarier unseen).
- Fireflies (finale): simple 3-dot glow sprites, warm `#FFE9A8`.

### 17.3 SPRITES & ANIMATIONS
- `locust-trooper.svg` — existing 2-frame march (master §1.2) + NEW `locust-scan` 2-frame head-turn for patrol pause.
- `vision-cone.svg` — patrol cone UI element: 60° wedge, crimson `#C43D5A` at 18% fill, animated 2-frame sweep shimmer; state `vision-cone-alert` snaps to 40% fill + hard edge when Bizzy is spotted.
- `hud-bizzy-letters.svg` — the chapter's heart: **B-I-Z-Z-Y** as five Sono letter chips (64×64) docked top-center. States per chip: **lit** (honey `#F0B429`, soft glow) / **faded** (letter at 20% opacity grey ghost, chip rim flickering 2-frame). Chapter opens with all five faded except B; each hidden golden flower's spell-card relights one (letter-restore sparkle, master FX).
- `golden-flower-night.svg` — the five hidden flowers: closed dark bud that blooms 3-frame (reuse master golden-flower bloom, night rim-light variant) when Bizzy's light-radius touches it.
- `firefly-swarm.svg` — 4-frame drifting swarm loop; plus `firefly-lantern-ring` — the rescue formation: fireflies forming a ring of light (2-frame pulse) that pushes the dark back for the tableau.
- `net-drop.svg` — 3 frames for the raid: net silhouette falling / enveloping / cinched.

### 17.4 GAME-FIELD ASSETS
- Night maze tileset: hex path tiles (visible-in-light variant + dark variant), wall shadows, exit arch marked by a single ember lantern.
- Patrol routes: 4–6 locust troopers with vision cones; zero-points HUD (no score — pure stealth, per mechanics doc).
- Spotted state: screen edge pulses crimson, Bizzy auto-returns to last dark alcove (no fail-death; tension without punishment).
- The five golden flowers placed at risk-graded detours; spell-card frame = night variant of the standard card (ink field, honey text).

### 17.5 STORYBOARD TABLEAUX (5 frames — the raid, shot-by-shot)
- **T1 "The cane taps twice"** — near-black frame: the camp asleep, embers low; at frame right, a long shadow with a cane, two locust silhouettes flanking. The only crimson in frame is the cane's tip.
- **T2 "The nets fall"** — `net-drop` f2 over Bumble mid-leap-awake and Melody mid-cry; motion smears; the campfire scatters into sparks. Fast, cluttered, loud composition — the act's only chaotic frame.
- **T3 "Gone"** — dawn-grey stillness: two empty bedrolls, one dropped song-sheet (Melody's) and one bent antenna-band (Bumble's), Bizzy's hand entering frame to touch them. HUD letters visible: B lit, I-Z-Z-Y faded — her name began fading the moment her friends were taken.
- **T4 "Into the dark"** — gameplay establishing: tiny light-radius circle in a vast ink maze, three crimson cones sweeping, the exit lantern a distant ember point.
- **T5 "The fireflies"** — the rescue-of-hope beat (NOT the friends — hope only): Bizzy cornered in the dark, then `firefly-lantern-ring` blooming around her, five golden flowers visible at once in the widened light, her full name relit on the HUD. Warmest frame of the act's darkest chapter.

### 17.6 FX & TRANSITIONS
- Light-radius mask breathes ±6px with Bizzy's wing idle; snaps −30px for 1s when a cone passes near (fear contracts the light).
- `fx-name-flicker` — HUD chip flicker on each near-miss.
- Letter-restore sparkle on each flower solved; on the fifth, all five chips flare together and the maze's grey edges recede one ring.
- Exit: firefly ring expands past the screen edges → white → Ch 18's starless black (light handing off to its absence).

### 17.7 AUDIO CUE SHEET
- `c17-x1` SFX only, pre-raid: cricket bed, ember ticks, two cane taps. No dialogue — silence is the villain's entrance music.
- `c17-x2` Melody, cut short: "Bizzy—!" (hard gate at 0.8s).
- `c17-x3` Vex (am_onyx), unseen, almost gentle: "Sleep, little words. You won't be needing your names."
- `c17-x4` Bizzy (af_heart), whisper-close: "B. I'm still B. Hold on to the rest for me."
- `c17-x5` Fae, hushed: "Light isn't the absence of dark. It's the memory of it losing."
- `c17-x6` SFX: per-relit-letter = one rising note of the respell chime (five notes total across the chapter — the chime completes only if she completes her name).
- Music: Unspelling drone as the floor; heartbeat-muted percussion in patrol proximity; firefly finale = music-box hive theme, single hand.

---

## CHAPTER 18 · BOSS: VOID EATS THE SKY — engine: Starbreaker (breakout)

### 18.1 SCENE & BACKDROP — the dark Cosmos arena
`env-void-arena.svg`, 3 layers: L1 dead sky — near-black `#0A0820`, NO stars (the wrongness of an empty cosmos; kids know this sky should sparkle); L2 the brick vault — the wall of stolen sky (see game-field); L3 low horizon: the silhouetted crew on an asteroid ledge, tiny, watching. As constellations relight, L1 progressively repopulates: each victory stamps a constellation line-art in cosmos cyan `#36D1FF` — the backdrop is the scoreboard.
**Grey-state:** the opening state IS the grey state (bricks `#A39B8E` family); victory is the wipe. Deliver constellation overlays as 8 separable groups.

### 18.2 CAST ON SCREEN
- **VOID** `void-maw` (master §1.2): event-horizon mouth open at screen top, star-letters spiraling in. States needed: idle-hunger (2-frame slow rotation of the spiral) / **gulp** (mouth widens 15%, on ball loss) / **recoil** (spiral stutters, on constellation completed) / **collapse** (final: the maw inverts and shrinks to a single mute grey token — defeat without destruction, per tone law).
- **Comet** — the paddle IS Comet's tail: Comet visible at paddle's leading edge in a determined grin pose, NEW `comet-paddle` (side view, tail extended as the paddle body, 2-frame tail shimmer).
- **Astro & Zib** portraits on the side rail calling constellation names; Bizzy determined portrait; crew silhouette row on the ledge (existing avatars, backlit cutouts).

### 18.3 SPRITES & ANIMATIONS
- `grey-brick.svg` — 64×40 rounded brick, `#A39B8E` body, darker `#8C857A` mortar edge, embedded Sono letter at 45% ink; states: intact / cracked (hairline web) / **shattering** 3-frame (brick splits, letter lifts free as a glowing tile).
- `letter-star-lit.svg` — the freed letter becomes a letter-star (master sticker): 2-frame twinkle, flies to its constellation slot.
- `constellation-relight.svg` ×8 — line-art draw-on animation per constellation (stroke-dash reveal, ~12 frames or CSS-driveable path), each ending in a full-color flare + name label in Fraunces.
- `ball-spark.svg` — the ball: a honey `#F0B429` spark-core with 2-frame flicker tail; `ball-multi` variant in cosmos cyan for multi-ball.
- `comet-paddle.svg` — 220×48 paddle, Comet head left, tail gradient `#36D1FF`→`#4A32A8`, 2-frame shimmer; squash frame on ball contact.
- `void-token-end.svg` — the collapsed maw as a small grey token sticker (1 frame) — it rolls to a stop at Bizzy's feet in T3.

### 18.4 GAME-FIELD ASSETS
- Brick vault layout: 8 constellation clusters × 5–8 bricks, each cluster's letters spelling its displayed word; cluster frame glows faint cyan when its word is the active target.
- HUD: target word in Sono at top-left; multi-ball counter; boss bar (ink-outline, master UI) with 8 constellation pips instead of hearts.
- Ball-loss forgiveness: ball respawns from Comet's tail flick (2-frame) — no life counter, Void just gulps and gloats.

### 18.5 STORYBOARD TABLEAUX (4 frames)
- **T1 "The sky is a wall"** — reveal: the crew's ledge in the foreground, the entire sky bricked over grey, `void-maw` idling at the crown, one last letter-star spiraling into it.
- **T2 "Comet lends her tail"** — mid: Comet stretching into paddle form under Bizzy's grip, Astro pointing up at the first target cluster, cyan underlight on determined faces.
- **T3 "The maw goes quiet"** — after the 8th relight: a sky FULL of drawn constellations, `void-maw` collapse to `void-token-end` at Bizzy's feet — she doesn't stomp it; she looks at it with pity.
- **T4 "The bitter star-rise"** — the act-out: the recolored cosmos above… and on the horizon, a thin grey tide visibly swallowing the distant Meadow's direction while Vex's four-note motif plays. Victory framed small in a corner of a war still being lost. *(Bridges to Act IV's Grey Sea.)*

### 18.6 FX & TRANSITIONS
- Brick shatter = letter-restore sparkle + slight screen-shake (2px, 100ms).
- Constellation flare = radial saturation bloom (master re-color bloom) LOCAL to that sky region — the act's thesis in miniature, eight times.
- Multi-ball spawn: prism split flash in cyan.
- Act-out transition: T4's grey tide rises to fill the frame and becomes the Act IV title card's paper sea.

### 18.7 AUDIO CUE SHEET
- `c18-x1` Void (bm_lewis, −4, long dark reverb): "Bright things taste of their names. I have eaten… so many names."
- `c18-x2` Astro (am_adam, −5%): "Every star is a letter that refused to go out. Spell them home."
- `c18-x3` Comet (af_sarah, +2/+8%): "Grab my tail! First rule of comets — we ALWAYS come back around!"
- `c18-x4` SFX: brick shatter = deep glass crack + chime; relight = rising 5-note respell chime, one full run per constellation.
- `c18-x5` Void, fading: "So… loud. The little words… all still… burning."
- `c18-x6` Vex motif (instrumental sting) over T4 — no words; his four notes over the grey tide say enough.
- Music: cosmos theme rebuilt one instrument per relit constellation (starts as pulse only, ends full); final cadence undercut by the Unspelling drone re-entering for T4.

---

## ACT III DELIVERY CHECKLIST (priority P1 per master §7)
| Batch | Assets |
|---|---|
| Environments (color + grey layers) | env-carnival, env-hive-court-accusation, env-gorge-exile, env-lotus-meadow, env-siren-shore, env-quiet-night, env-void-arena |
| New character views | vex-dealer, crew despair ×4, queen-sorrow, drowsy ×3 (+capy-rooted), bizzy-shake-awake, melody-hears-false, melody-captive, bumble-captive, comet-paddle, singer silhouettes ×3 |
| Sprites/FX | dice-pair-roll (6f) + dice-loaded-reveal (3f), coin/board set, forged-letter-prop, ladder-plank set, fx-letter-dissolve (4f), lotus set, song-ribbon ×3 + shatter/crown, earplug-sticker, vision-cone, hud-bizzy-letters, firefly set, net-drop, grey-brick set, constellation-relight ×8, ball/paddle, void-maw states, void-token-end |
| Tableaux | Ch13 ×5 · Ch14 ×4 · Ch15 ×4 · Ch16 ×3 · Ch17 ×5 · Ch18 ×4 (25 frames) |
| Audio slots | c13-x1…x6 · c14-x1…x5 · c15-x1…x5 · c16-x1…x5 + song-01…10 · c17-x1…x6 · c18-x1…x6 |

*Every asset SVG-first, sticker gloss, ink outline, squircle DNA. Grey is never neutral. The act ends losing — make the losing beautiful enough that Act IV's grey sea feels earned.*
