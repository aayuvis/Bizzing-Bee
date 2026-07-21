# DESIGN BRIEF — ACT II · THE WORLD TOUR (Chapters 7–12)
### Art-production brief for Claude Design · "Bizzy and the Great Unspelling"
*Child of `../CLAUDE-DESIGN-BRIEF-SAGA.md` (§0 art direction is LAW) and `../QUEST-SAGA-DESIGN.md` (mechanics). Squircle sticker characters, ink outlines, duotone cheer shading. **Grey `#A39B8E` family means UNSPELLED — never neutral.** All backdrops 1600×900 layered SVG, color + grey layers separable. Sprites = SVG frame groups `f1…fN` (or @2x transparent PNG strip). Type: Fraunces / Hanken Grotesk / Sono only.*

**Act II palette anchors:** Stage amber `#F0A82A` · Cosmos cyan `#36D1FF` · Dojo red `#D8342C` + dojo gold `#E8B93C` (proposed hexes — dojo tokens unhexed in master) · Lab green `#9BE34D` · Arcade pink `#FF5D9E` on arcade deep `#12234A` · app Honey `#F0B429` · Deep `#4A32A8` · Villain crimson `#C43D5A` · Unspelled grey `#A39B8E`.

**Recurring across all six chapters:** Bizzy portrait emotion set (already specced in master §1.1) appears in every dialogue scene — no new Bizzy views needed in Act II except where flagged. Every recruited champion needs the master-brief light set: cheer pose, grey-faded variant (programmatic desat OK), one dialogue portrait.

---

## CHAPTER 7 · STAGE WORLD — "The Show Must Go On" · SPOTLIGHT SIMON

### 7.1 Scene & Backdrop — `env-stage.svg` (1600×900)
Layers back→front (parallax roles for the story pan; game view is static):
- `L1-house-dark` — theatre house walls, warm near-black `#2A1608`, distant balconies. Parallax 0.1.
- `L2-curtains` — grand red curtains `#B5322F` w/ amber `#F0A82A` fringe + gold rope tassels. Parallax 0.3.
- `L3-marquee-arch` — proscenium arch, marquee bulbs (each bulb a separable `<circle>` for lit/dead states), amber glow haloes. Parallax 0.6.
- `L4-stage-floor` — polished boards, honey-amber sheen `#F0A82A`→`#C77E12` gradient, footlight strip. Parallax 1.0 (game plane).
- `L5-spotlight-beams` — 3 overlay cones, amber at 30% opacity, animatable rotation pivots at the batten. Top overlay.
**Grey state** `env-stage-grey.svg`: same layers; curtains and boards desat to `#A39B8E`/`#8C857A`, marquee bulbs DEAD (grey glass, no halo), Melody's sheet music stand holds visibly blank staves. Grey creeps from stage-left edge (the Blackout arrives sideways like a curtain).
**Game-field variant** `field-stage-simon.svg`: bottom two-thirds = the 3×3 stage-tile grid zone, uncluttered; footlights frame the HUD.

### 7.2 Cast on Screen
- **Melody** — dialogue portrait; cheer; grey-faded; NEW pose `melody-conduct-freeze.svg`: mid-song, baton up, notes greying out of the air around her (chapter-opening shock beat).
- **Maestro** — dialogue portrait; cheer; grey-faded; NEW pose `maestro-baton-point.svg`: baton aimed at a stage tile (he "conducts" the Simon sequence — used in tutorial frame).
- **Bizzy** — portrait set (determined/worried/triumphant reused).

### 7.3 Sprites & Animations
- `stage-tile.svg` — 160×160 squircle stage tile, Sono letter centered. States as sibling groups: `idle` (amber board), `lit` (spotlight hit: white-hot core, amber bloom ring), `pressed` (squash 92%, 1 frame), `correct-pulse` (3 frames: bloom out), `wrong-flicker` (2 frames: grey flash `#A39B8E`), `hidden` (letter blanked to "?" — memory-spell phase).
- `spotlight-beam.svg` — 4-frame sweep loop (400×900): cone swings 12°, dust motes drift in beam. Loop.
- `marquee-bulb.svg` — 2-frame twinkle (32×32): full glow / 80% glow. Loop, staggered per bulb.
- `melody-note-restore.svg` — 3-frame one-shot (64×64): grey note → half-color → full amber note w/ sparkle. Plays over the backdrop per completed word.
- `curtain-sweep.svg` — 6-frame one-shot (1600×900): curtains close/open — chapter intro + victory reveal.

### 7.4 Game-Field Assets
`hud-sequence-dots.svg` (beat dots 3→9, filled/empty) · `hud-word-banner.svg` (Fraunces word slot, top center) · `tile-grid-frame.svg` (3×3 grid inlay, brass corners) · `overlay-memory-phase.svg` (dim vignette + "Now spell it!" plate) · `cursor-spot.svg` (small spotlight ring cursor/tap marker) · `powerup-replay.svg` (Melody's Memory power chip: tiny marquee "ENCORE" sticker — replays sequence once).

### 7.5 Storyboard Tableaux (deliver as flat wide frames, 1600×900)
- `sb-c7-01-blackout.svg` — Mid-performance: Melody singing, spotlight on her; stage-left HALF of frame already grey; her sheet music greys mid-page. Maestro turns, baton frozen.
- `sb-c7-02-bizzy-arrives.svg` — Bizzy in the aisle, tiny against the grand grey-creeping house; one surviving amber spotlight finds her.
- `sb-c7-03-first-relight.svg` — Bizzy on a lit tile, letter blazing under her feet; a ring of marquee bulbs re-pops to life around the proscenium.
- `sb-c7-04-encore.svg` — Victory: full color restored, curtains wide, Melody & Maestro cheer poses flanking Bizzy center-stage, confetti.

### 7.6 FX & Transitions
Spotlight iris-in (chapter transition: black frame, amber iris opens on Bizzy) · bulb-pop re-color chain (marquee bulbs relight in sequence, L→R saturation wipe) · note-sparkle particles (amber, rise + fade) · wrong-answer static flicker (brief grey scanline on the tile only — never full screen).

### 7.7 Audio Cue Sheet
`sting-stage-theme` (8-bar, existing world sting) · `loop-simon-heartbeat` (soft 90bpm pulse under sequences) · `sfx-tile-tone` ×9 (one pitch per grid tile — sequences literally play melodies) · `sfx-bulb-pop` · `sfx-curtain` · `sting-recruit-melody-maestro` (respell chime + stage flourish). Dialogue slots: `c7-x1` (Melody blackout cry), `c7-x2` (Maestro explains the tiles), `c7-x3` (mid-game encouragement), `c7-x4` (recruit pledge), `c7-x5` (act-arc hook: "the sky went dark too…"). Voices per master §8: Melody = bf_emma + plate reverb; Maestro = bm_george.

---

## CHAPTER 8 · COSMOS — "The Scrambled Constellations" · UNSCRAMBLE THE STARS

### 8.1 Scene & Backdrop — `env-cosmos.svg` (1600×900)
- `L1-deep-space` — near-black indigo `#0E1038` → `#1B1E5C` vertical gradient. Parallax 0.05.
- `L2-nebula` — soft cyan `#36D1FF` @ 18% + magenta wisp clouds. Parallax 0.15.
- `L3-starfield` — 3 point sizes, twinkle-capable circles. Parallax 0.3.
- `L4-planet-rim` — bottom arc of a small ringed planet (Astro's perch), cyan-lit rim. Parallax 0.7.
- `L5-constellation-plane` — the game plane: anchor sockets + line-art layer (empty by default). Parallax 1.0.
**Grey state** `env-cosmos-grey.svg`: nebula ashen `#A39B8E`, stars dimmed to 30% grey pinpoints, ONE constellation shown as a broken scribble of disconnected grey stars. (Note: Void's shuffle = scramble; full grey arrives in Ch 18 — this grey layer is for the app's standard wipe + Ch 18 reuse.)
**Game-field variant** `field-cosmos-stars.svg`: lower tray zone (star rack) + upper sky zone with 12 socket layouts.

### 8.2 Cast on Screen
- **Astro** — portrait; cheer; grey-faded; NEW pose `astro-jetpack-hover.svg`: hovering beside a socket, pointing (drag-tutorial frame).
- **Comet** — portrait; cheer; grey-faded; NEW pose `comet-tail-trail.svg`: streaking across frame, tail spelling a faint letter trail (Star-sight power flavor).
- **Zib** — portrait; cheer; grey-faded; NEW pose `zib-antenna-signal.svg`: antennae glowing cyan, "receiving" a scrambled word (round-intro bumper).
- **Void** — background cameo ONLY: distant `void-maw` silhouette swallowing a star at chapter open (reuse master asset, no new view).

### 8.3 Sprites & Animations
- `letter-star.svg` — 96×96 five-point star, Sono letter on the body, cyan `#36D1FF` core/white rim. States: `idle-twinkle` (2-frame, loop), `drag` (bright halo + 4-px lift shadow, 1 frame), `settle` (3-frame one-shot: overshoot into socket, squash, ring flash), `glow` (locked-in: steady white-hot + cyan rays, loop 2-frame), `wrong-bounce` (2-frame one-shot: red-shift blink + eject).
- `constellation-line.svg` ×12 styles — self-drawing stroke (dash-offset animation), cyan → white when word completes; each of the 12 words gets a distinct creature/object line-art (bee, harp, kite, fish, crown, etc. — match word list at integration).
- `socket-ring.svg` — 64×64 dashed circle, 2-frame rotate loop; `socket-ring-hint` variant pulses (Star-sight reveal).
- `shooting-star.svg` — 4-frame one-shot ambient (streak, 300×80), fires between rounds.
- `void-star-swallow.svg` — 3-frame one-shot for the intro cameo: star spirals, stretches, gone.

### 8.4 Game-Field Assets
`hud-word-scramble-rack.svg` (bottom tray, 3–9 star slots) · `hud-constellation-counter.svg` (12 mini-constellation pips) · `overlay-starsight.svg` (Zib power: 2 sockets flash their letters, cyan lens flare frame) · `line-draw-mask.svg` (reusable stroke-reveal template) · `bg-socket-layouts.svg` (12 layout groups, one per word length 4→9).

### 8.5 Storyboard Tableaux
- `sb-c8-01-nonsense-sky.svg` — Astro, Comet, Zib on the planet rim staring up: the sky's constellations spell visible gibberish ("KTIE", "EEB"); one star gets pulled toward a distant dark maw.
- `sb-c8-02-first-drag.svg` — Bizzy mid-flight hauling a glowing letter-star by a light-thread toward its socket, tongue-out effort face.
- `sb-c8-03-constellation-blooms.svg` — The completed word's line-art draws itself into a golden bee constellation; the three cosmonauts lit from above in wonder.
- `sb-c8-04-sky-restored.svg` — Wide: 12 glowing constellations; crew cheer poses on the planet rim; ONE ominous starless void patch remains upper-left (Ch 18 seed).

### 8.6 FX & Transitions
Warp-streak transition (stars stretch to lines, 400ms, into/out of chapter) · settle ring-flash particles (cyan) · constellation completion: line self-draw + white bloom + brief starfield brightness lift · Star-sight lens flare · ambient twinkle (staggered 2-frame).

### 8.7 Audio Cue Sheet
`sting-cosmos-theme` · `loop-cosmos-drift` (airy pad, sparse) · `sfx-star-grab` / `sfx-star-settle` (rising pling per correct letter, scale steps) · `sfx-constellation-chord` (word complete) · `sfx-void-swallow` (dark reverse-swell, intro only) · `sting-recruit-cosmos`. Dialogue slots: `c8-x1` (Zib's scrambled distress), `c8-x2` (Astro explains sockets), `c8-x3` (Comet mid-game), `c8-x4` (recruit), `c8-x5` (Void foreshadow). Voice gap: Astro/Comet/Zib have no row in master §8 — see inconsistencies; suggest kid-crew chain (af_sarah) for Zib pending sign-off.

---

## CHAPTER 9 · DOJO — "The Thousand Cuts" · LETTER SLICE

### 9.1 Scene & Backdrop — `env-dojo.svg` (1600×900)
- `L1-mountain-dawn` — misty peaks, dawn wash `#F6E3C8`. Parallax 0.1.
- `L2-bell-tower` — silhouetted bell tower + maple branches, deep red leaves `#D8342C`. Parallax 0.3.
- `L3-paper-screens` — shoji wall, warm paper `#F5EBD8`, dojo-gold `#E8B93C` frame lattice, one screen painted with a giant ink letter "字"-style bee glyph. Parallax 0.6.
- `L4-dojo-floor` — polished dark boards + red training mat `#D8342C` w/ gold trim (game plane). Parallax 1.0.
- `L5-hanging-scrolls` — foreground scroll pair w/ target-word calligraphy slots. Overlay.
**Grey state** `env-dojo-grey.svg`: maple leaves ash-grey, screen glyph faded to a smudge, mat bleached `#A39B8E`; incense smoke turns grey-static.
**Game-field variant** `field-dojo-slice.svg`: clear central air-space for arcing letters; mat = launch zone; scrolls host HUD.

### 9.2 Cast on Screen
- **Panda Sensei** — portrait; cheer; grey-faded; NEW pose `sensei-single-finger.svg`: one claw raised, eyes closed — "strike only the right letter" (tutorial + between-word bumper). (His Ch 29 `sensei-counsel` is a master-brief asset — do NOT duplicate here.)
- **Shadow Ninja** — portrait; cheer; grey-faded; NEW pose `ninja-blade-flash.svg`: mid-dash blur, twin afterimages, slicing a letter in half (combo-banner art).
- **Bizzy** — no new pose; her "blade" is the player's swipe (Stinger Quill glint on the trail).

### 9.3 Sprites & Animations
- `slice-letter-tile.svg` — 110×110 squircle tile, Sono letter, paper-white face w/ gold rim. States: `spin-fly` (4-frame tumble loop while airborne), `target-glint` (next-in-order letter: gold edge shimmer, 2-frame), `slice-halves` (REQUIRED: two separable half-groups `half-L`/`half-R` with clean ink-edge cut face, each with its own tumble — 2 frames per half), `wrong-slice-crack` (grey crack overlay, 1 frame), `missed-fall` (tile falls off-screen, desat 40%).
- `bomb-moth.svg` — 90×90 grey moth (reuse grey-moth head) strapped to a round static-bomb, 2-frame flap loop; `bomb-moth-burst` 3-frame one-shot (grey static puff — screen-shake, no fire).
- `slash-fx.svg` — 3-frame one-shot swipe arc: gold ink-brush stroke that thins and fades (240×80, rotatable).
- `combo-banner.svg` — brush-stroke ribbon stamps: ×2/×3/×5 tiers (gold→red escalation), 2-frame slam-in one-shot each.
- `incense-smoke.svg` — 4-frame ambient loop, thin ribbon.
- `dojo-bell.svg` — 2-frame swing, rings on word completion.

### 9.4 Game-Field Assets
`hud-target-word-scroll.svg` (vertical scroll, letters grey→inked as sliced in order) · `hud-combo-meter.svg` (brush-stroke fill) · `overlay-focus-slowmo.svg` (Sensei power: 3s slow-mo — paper-grain vignette + falling petal FX) · `cursor-blade-trail.svg` (touch/mouse trail: gold ink streak) · `launcher-mat-puff.svg` (dust puff where tiles launch).

### 9.5 Storyboard Tableaux
- `sb-c9-01-torn-scrolls.svg` — Dojo interior: training scrolls sliced by NO ONE — words falling out of them in loose grey letters; Sensei kneeling, catching one fading letter on his paw.
- `sb-c9-02-the-lesson.svg` — Sensei's raised single claw; behind him Shadow Ninja mid-air halving a letter perfectly; Bizzy watching, quill drawn like a tiny sword.
- `sb-c9-03-thousand-cuts.svg` — Gameplay apex: air full of tumbling tiles, one gold-glinting target, Bizzy's swipe-arc carving through it, halves flying, ×5 banner slamming in.
- `sb-c9-04-belt-of-words.svg` — Victory: the re-inked scrolls hang whole; Sensei ties a tiny honey-gold headband on Bizzy; Ninja cheer pose; bell mid-ring.

### 9.6 FX & Transitions
Ink-brush wipe transition (a single horizontal brush stroke paints the next scene in) · slice spark (gold chips at cut point) · petal-fall slow-mo overlay · combo screen-flash (2-frame gold, subtle) · bomb static-puff + 200ms shake.

### 9.7 Audio Cue Sheet
`sting-dojo-theme` · `loop-dojo-taiko` (sparse drum, tempo ramps per combo tier) · `sfx-slice-shing` (pitch rises through a word) · `sfx-wrong-thunk` · `sfx-bomb-static` · `sfx-bell` · `sting-recruit-dojo`. Dialogue slots: `c9-x1` (Sensei's koan), `c9-x2` (Ninja's warning about bomb-moths), `c9-x3` (combo praise), `c9-x4` (recruit), `c9-x5` (arc hook). Voice: Sensei = am_adam −12% + hall (master §8). Shadow Ninja unlisted in §8 — see inconsistencies.

---

## CHAPTER 10 · LAB — "The Falling Formula" · WORD TETRIS

### 10.1 Scene & Backdrop — `env-lab.svg` (1600×900)
- `L1-lab-wall` — deep teal-slate wall `#233240`, chalk formula scribbles (letters, not math). Parallax 0.1.
- `L2-glassware-shelf` — beakers/coils, green liquids `#9BE34D` in 3 brightness steps, bubbling caps. Parallax 0.3.
- `L3-tesla-coils` — twin coils flanking the play well, idle arc glow. Parallax 0.5.
- `L4-the-well` — the giant central glass column (game plane): rivet-framed, 8 columns wide, faint green grid etching. Parallax 1.0.
- `L5-flask-forefront` — Beaker's giant round flask, bottom-right, graduated marks (fill target). Overlay.
**Grey state** `env-lab-grey.svg`: all liquids drained to grey sludge `#A39B8E`, chalk formulas half-erased, coils dead; ONE emergency lamp still green (hope beacon).
**Game-field variant** `field-lab-tetris.svg`: the well cropped full-height; flask + next-preview tube share the right rail.

### 10.2 Cast on Screen
- **Beaker** (Bubbly Beaker) — portrait; cheer; grey-faded; NEW pose `beaker-flask-catch.svg`: arms hugging the giant flask as cleared letters pour in, goggles fogged with joy.
- **Brainiac** — portrait; cheer; grey-faded; NEW pose `brainiac-preview-point.svg`: tapping the next-letters tube with a pointer, glasses glinting (Preview power tutorial).
- **Bizzy** — no new pose; appears at well-top nudging tiles in story frames.

### 10.3 Sprites & Animations
- `lab-letter-tile.svg` — 100×100 squircle tile, Sono letter, glass-green face `#9BE34D` over dark `#233240`. States: `fall` (subtle 2-frame wobble loop), `soft-drop-streak` (motion-blur variant, 1 frame), `lock` (3-frame one-shot: land squash, rivet-clunk flash, settle matte), `clear-word` (4-frame one-shot: letters light in reading order L→R, liquefy, drain downward as green droplets), `garbage-grey` (unclearable grey tile — Unspelling pressure rows, cracked face), `formula-glint` (gold rim pulse — tile belongs to a definition-clue "formula word", 2-frame loop).
- `flask-fill.svg` — 6 fill states (0/20/40/60/80/100%), green liquid w/ bubble caps; `flask-bubble` 3-frame ambient loop; 100% state glows + cork pops (2-frame one-shot).
- `coil-arc.svg` — 2-frame idle loop; `coil-arc-clear` 3-frame one-shot (big arc jumps the well on every word clear).
- `droplet-pour.svg` — 4-frame one-shot particle set: cleared word streams into the flask.
- `smoke-poof-wrong.svg` — 2-frame grey puff when a row locks with no word.

### 10.4 Game-Field Assets
`hud-next-tube.svg` (vertical test-tube, 3 upcoming letters — Brainiac power extends visible depth) · `hud-formula-card.svg` (definition-clue card, Fraunces clue + blank slots) · `hud-word-count-burettes.svg` (15 tick marks, 3 gold for formula words) · `overlay-danger-line.svg` (top-of-well hazard stripe, pulses when stack is high) · `well-grid-frame.svg` · `cursor-column-ghost.svg` (drop-target ghost tile at 30%).

### 10.5 Storyboard Tableaux
- `sb-c10-01-drained.svg` — The Great Fizz flask empty and grey; Beaker cradling it like a sick pet; Brainiac's chalkboard word half-erased mid-equation.
- `sb-c10-02-first-fall.svg` — Bizzy atop the well, shoving the first glowing letter-tile over the edge; Beaker below with the flask, mouth open.
- `sb-c10-03-formula-clear.svg` — A completed gold formula word liquefies; coil arc leaps the well; green light floods the lab shelves back to color, shelf by shelf.
- `sb-c10-04-eureka.svg` — Flask at 100%, cork pops a green firework; Beaker & Brainiac cheer poses; the chalk wall re-writes itself in crisp letters.

### 10.6 FX & Transitions
Bubbling beaker transition (screen fills bottom-up with green bubbles, pops clear on next scene) · clear-word liquefy + droplet pour · coil arc flash · re-color: saturation floods upward from the flask (inverse of grey-creep) · high-stack heartbeat vignette (green-tinged, never grey).

### 10.7 Audio Cue Sheet
`sting-lab-theme` · `loop-lab-bubble` (perky bubbling bed, speed follows fall rate) · `sfx-tile-lock` (rivet clunk) · `sfx-word-liquefy` (glug + rising 5-note respell chime tail) · `sfx-formula-fanfare` (gold words only) · `sfx-cork-pop` · `sting-recruit-lab`. Dialogue slots: `c10-x1` (Beaker's panic gurgle), `c10-x2` (Brainiac explains the formula words), `c10-x3` (mid-game), `c10-x4` (recruit), `c10-x5` (arc hook). Voice: Brainiac = am_adam −5% (master §8 "professor-types"); Beaker unlisted — see inconsistencies.

---

## CHAPTER 11 · CRITTER POND — "The Hungry Garden" · WORD SNAKE

### 11.1 Scene & Backdrop — `env-critter.svg` (1600×900)
- `L1-sky-hedge` — soft morning sky + distant hedge wall. Parallax 0.1.
- `L2-pond` — lily pond, dragonflies, reeds; water blue-green `#7FD4C1`. Parallax 0.3.
- `L3-garden-beds` — earth beds + sprout rows, warm soil `#8A5A33`, leaf green `#6FBF44`. Parallax 0.6.
- `L4-garden-grid` — the play field: 16×9 subtle tile grid of trimmed lawn (game plane). Parallax 1.0.
- `L5-flower-border` — empty trellis border framing the grid; sockets where victory flowers will bloom. Overlay.
**Grey state** `env-critter-grey.svg`: beds turned dust-grey, pond de-blued to `#A39B8E`, flowers closed into grey buds, seed-letters scattered colorless.
**Game-field variant** `field-critter-snake.svg`: grid dominant, border trellis visible on all four sides (it fills with bloom as words complete — progress IS scenery).

### 11.2 Cast on Screen
- **Zoomies** (corgi) — portrait; cheer; grey-faded; NEW pose `zoomies-sniff-point.svg`: nose to the ground, tail up, pointing at the next letter (Sniff power UI art).
- **Capy** — portrait; cheer; grey-faded; NEW pose `capy-soak-watch.svg`: chin-deep in the pond, serene spectator, a leaf umbrella (idle corner cameo during gameplay — the calm mascot).
- **The garden snake** is a friendly NPC-avatar of the world, not a library character — styled to critter-pack duotone, grass-green w/ flower-print scales.

### 11.3 Sprites & Animations
- `snake-head.svg` — 90×90, big friendly eyes, 4 rotations (N/E/S/W supplied as groups). States: `idle-blink` (2-frame), `chomp` (2-frame one-shot on eat), `happy` (word complete: closed-eye grin + blush, 1 frame), `dizzy-shrink` (wrong letter: spiral eyes, 2-frame).
- `snake-body-seg.svg` — 80×80 rounded segment; straight + corner variants; each segment can DISPLAY an eaten letter (Sono, on-scale nameplate) — the snake literally spells the word along its body. 2-frame breathing loop.
- `snake-tail-seg.svg` — tapered tip, wag 2-frame loop; `tail-shrink-pop` one-shot (segment pops off as a seed puff on wrong eat).
- `letter-pickup.svg` — 72×72 seed-packet sticker w/ Sono letter; states: `idle-bob` (2-frame), `target-glow` (next correct letter, green halo pulse — also Sniff-power highlight), `eaten-burst` (3-frame: packet pops into sprout).
- `border-flower.svg` — 3-frame bloom one-shot (bud → open → full, honey/pink/violet variants ×3) — one blooms per completed word, filling the trellis.
- `dragonfly.svg` / `pond-ripple.svg` — 2-frame ambient loops.

### 11.4 Game-Field Assets
`hud-target-word-fence.svg` (word on a wooden fence plank, letters stamped as eaten) · `hud-word-count-flowerpots.svg` (10 pots, fill per word) · `overlay-sniff.svg` (Zoomies power: paw-print trail to next letter) · `grid-lawn-tile.svg` (2 alternating greens) · `warn-wall-hedge.svg` (edge hedge flash on near-collision).

### 11.5 Storyboard Tableaux
- `sb-c11-01-scattered-seeds.svg` — The garden grey and bare; word-seeds blowing loose; the little snake trying to herd them with its nose; Zoomies barking at the wind.
- `sb-c11-02-eat-in-order.svg` — Bizzy riding the snake's head like a mahout, pointing at the glowing next letter; letters visible along the snake's body spelling G-A-R-D…
- `sb-c11-03-border-blooms.svg` — A completed word: the snake curled proudly, body spelling GARDEN; a wave of bloom running along the trellis border; color spilling into the beds.
- `sb-c11-04-pond-party.svg` — Victory: full-bloom garden, pond re-blued, Capy floating with Bizzy on his belly, Zoomies zooming a happy circle (motion streak), snake wearing one bloom as a hat.

### 11.6 FX & Transitions
Leaf-wipe transition (leaves flurry across, settle out) · eaten-burst sprout particles · bloom chain along the border (staggered one-shots) · shrink seed-puff (grey, small — the only grey FX, reads as loss) · pond sparkle ambient.

### 11.7 Audio Cue Sheet
`sting-critter-theme` · `loop-garden-lilt` (ukulele-ish bed) · `sfx-chomp` (rising pitch per correct letter) · `sfx-wrong-bonk` + shrink slide-whistle (down) · `sfx-bloom-chime` (word complete) · `sfx-zoomies-bark` (Sniff trigger) · `sting-recruit-critter`. Dialogue slots: `c11-x1` (Zoomies' scattered-seeds alarm), `c11-x2` (Capy's one calm line), `c11-x3` (mid-game), `c11-x4` (recruit), `c11-x5` (arc hook — a moth spy watches from the hedge). Voice: Zoomies = af_sarah kid-crew chain (master §8); Capy unlisted — see inconsistencies.

---

## CHAPTER 12 · ARCADE — BOSS: "Glitch's Betrayal" · SPACE TYPER

### 12.1 Scene & Backdrop — `env-arcade.svg` (1600×900)
- `L1-cabinet-canyon` — skyline of towering arcade cabinets, marquee glows in pink `#FF5D9E` / cyan / honey on arcade deep `#12234A`. Parallax 0.1.
- `L2-token-river` — a stream of gold tokens winding between cabinets, specular glints. Parallax 0.3.
- `L3-neon-signage` — floating neon signs + pixel-cloud decals (pink `#FF5D9E` dominant). Parallax 0.5.
- `L4-cabinet-interior` — THE GAME PLANE: we are INSIDE the great mother-cabinet looking at its screen-space — scanline sheen, pixel-grid floor, side bezels. Parallax 1.0.
- `L5-vault-of-the-master-token` — background centerpiece: the Master Token enshrined in a glass heart-vault atop the score rail. Overlay (separable — it gets STOLEN).
**Grey state** `env-arcade-grey.svg`: neon dead, token river dulled to washers `#A39B8E`, cabinet screens showing static; the empty vault cracked. **This grey state doubles as the post-betrayal story backdrop.**
**Game-field variant** `field-arcade-typer.svg`: Space-Invaders framing — sprite ranks upper 2/3, Bizzy's zap-cursor rail + cabinet floor line lower 1/3, bezel HUD.

### 12.2 Cast on Screen
- **Pixel Pal** — portrait; cheer; grey-faded; NEW pose `pixelpal-reach-cry.svg`: reaching after the fleeing Glitch, pixels of his own arm trembling loose — the friendship wound (betrayal beat + seeds his Ch 34 plea).
- **Joy Stick** — portrait; cheer; grey-faded; NEW pose `joystick-grip-brace.svg`: gripping his own stick-head like a warrior planting a banner (last-stand rally frame).
- **GLITCH** — the chapter's engine. Required: existing avatar base portrait (gleeful) + master-specced `glitch-corrupt` (half-static body, grey token eye) + NEW poses:
  - `glitch-corrupt-reveal.svg` — THE transformation: 4-frame one-shot, avatar → static ripple climbs from feet → half-dissolved → grey token slots into the eye. The Act's signature image.
  - `glitch-teleport.svg` — 3-frame in/out (scanline collapse to a line, pop).
  - `glitch-bomb-throw.svg` — overarm lob pose, 2-frame.
  - `glitch-token-grab.svg` — mid-air snatch of the Master Token, grin lit from below by its glow (storyboard + steal cutscene).
  - Portrait `glitch-doubtful` is a master §1.2 asset (Ch 32) — do NOT redraw; but deliver `glitch-look-back.svg`: a single 1-frame beat of him glancing back at Pixel Pal before vanishing (plants the doubt NOW).
- **Bizzy** — portrait set incl. **heartbroken** (first use in saga).

### 12.3 Sprites & Animations
- `static-sprite.svg` — 84×84 invader: blocky grey-static critter w/ pink eye-pixels, carrying a word plate below it. **Ranks:** 3 tiers as separate files — `static-sprite-a` (2-frame arm-waggle march, short words), `static-sprite-b` (2-frame, antennae, medium words), `static-sprite-c` (2-frame, shielded chunky elite, long words). Shared states: `descend-step` (rank shuffle), `zapped` (3-frame one-shot: word letters fly off as gold sparks, sprite de-rezzes), `landed-alarm` (reaches floor: red-pink flash).
- `word-plate.svg` — attached nameplate, Sono; letters grey-out one by one AS TYPED (typed = claimed back = they turn honey-gold, remainder grey — reinforces re-spelling).
- `scramble-bomb.svg` — 72×72 spiky orb of jumbled letters orbiting a static core, 2-frame spin loop; `bomb-deflect` 4-frame one-shot (letters snap into correct order, orb re-colors, boomerangs back at Glitch); `bomb-hit` 2-frame (screen static wash if unanswered).
- `zap-beam.svg` — 2-frame one-shot vertical bolt, honey-gold w/ pink edge, from Bizzy's quill-blaster rail position.
- `master-token.svg` — master §3 artifact; deliver here with states `enshrined-glow` (2-frame pulse in vault), `stolen-arc` (streak trail comet), `in-glitch-hand` (grey-tinged — it dims when he holds it).
- `bizzy-cabinet-rail.svg` — Bizzy in a little rail-cart blaster mount, 2-frame hover; recoil frame on fire.
- `cabinet-floor-crack.svg` — 3 damage states of the floor line (sprites landing).

### 12.4 Game-Field Assets
`hud-boss-bar-glitch.svg` (ink-outline health bar, 3 phase pips, Glitch face plate that corrupts per phase) · `hud-typing-echo.svg` (typed-letter echo strip above Bizzy) · `hud-wave-counter.svg` (pixel numerals) · `overlay-scramble-alert.svg` (bomb incoming: pink alarm frame + unscramble slot row) · `overlay-extra-token.svg` (Pixel Pal retry power: gold token slot-in animation frame) · `bezel-frame.svg` (cabinet bezel w/ CRT corner curvature).

### 12.5 Storyboard Tableaux — the Betrayal beat, shot by shot
- `sb-c12-01-hero-welcome.svg` — WIDE: neon arcade at full blaze; Pixel Pal & Joy Stick greeting the crew; Glitch front and center, biggest smile in the frame, arm around Pixel Pal. (The warmth is the setup.)
- `sb-c12-02-the-whisper.svg` — CLOSE: Glitch alone at the vault, reflected in the glass; in the reflection ONLY, Vex's crimson `#C43D5A` silhouette and the offer — "infinite lives." Glitch's eye already flickering static.
- `sb-c12-03-corrupt-reveal.svg` — MID: mid-battle, Glitch phases in above the sprite ranks and TURNS — `glitch-corrupt-reveal` frame 4 held: half body static, token eye burning grey; the arcade neon gutters.
- `sb-c12-04-the-steal.svg` — THE BEAT, 3 panels in one frame (comic strip layout): (a) zap-beam shatters the vault glass mid-victory; (b) `glitch-token-grab` — the snatch, token dimming grey in his fist, Pixel Pal's reach-cry below; (c) `glitch-look-back` — the tiny hesitation — then teleport-line collapse. Empty cracked vault, one gold token spinning to rest on the floor.
- `sb-c12-05-army-realization.svg` — Aftermath: crew around the cracked vault in half-grey arcade light; on every cabinet screen behind them, the SAME image: Vex's silhouette and rank upon rank of static-sprites. Bizzy heartbroken portrait; Joy Stick's brace pose; caption space for "…he's building an ARMY."

### 12.6 FX & Transitions
CRT power-on transition (white line expands from center — chapter in) and CRT power-OFF (collapse to a dying dot — the gut-punch chapter out) · sprite de-rez particles (square pixels, pink/gold) · scanline sweep on every Glitch teleport · vault-glass shatter burst · grey-out of the neon layer (L3 desaturates live during the steal) · score-pop pixel numerals.

### 12.7 Audio Cue Sheet
`sting-arcade-theme` (chip-tune) · `loop-typer-battle` (driving chip loop, +1 intensity layer per phase) · `sfx-zap` / `sfx-sprite-derez` · `sfx-bomb-warn` + `sfx-bomb-deflect` (reversed scramble → clean chord) · `sfx-vault-shatter` · `sting-betrayal` (Glitch's cheerful motif re-played in minor, bit-crushed, decaying — MUST be the arcade theme corrupted, not new material) · `sfx-crt-off` · `sting-recruit-arcade` (deliberately muted/bittersweet). Dialogue slots: `c12-x1` (welcome banter), `c12-x2` (Glitch phase-in taunt), `c12-x3` (mid-boss), `c12-x4` (Glitch's "infinite lives" line), `c12-x5` (Pixel Pal's cry), `c12-x6` (army realization stinger), `c12-x7` (act-out narrator). Voices: Glitch = am_michael + bit-crush + sample drops (master §8); Pixel Pal / Joy Stick unlisted — see inconsistencies.

---

## DELIVERY NOTES (Act II batch = master §7 priority P1)
- File all backdrops as `env-*.svg` + `env-*-grey.svg` + `field-*.svg`; layers named exactly as listed (`L1…L5`), grey layer separable for the app's animated wipe.
- Sprite frames as sibling groups `f1…fN`; states as named groups within one file where listed.
- Every champion light set (cheer / grey-faded / portrait) per master §1.1; grey-faded may be programmatic desat unless the pose changes.
- No new type, no new characters beyond listed poses; the garden snake (Ch 11) is world-flora NPC art, not a cast addition — flagged for approval.

## INCONSISTENCIES FOUND (ground-truth cross-check)
1. **Chapter count / numbering drift:** QUEST-SAGA-DESIGN.md is a 30-chapter/5-act doc; the master brief is 36 chapters/6 acts. Act II (7–12) matches in both, but everything from Ch 13 on diverges (e.g., Ch 13 = Origami Word Ladder in QUEST vs Vex's Carnival Dice of Fate in master). Master brief treated as law per instructions.
2. **Voice-casting gaps (master §8):** no voice rows exist for Astro, Comet, Zib, Shadow Ninja, Beaker (Bubbly Beaker), Capy, Pixel Pal, or Joy Stick — all of whom speak in Act II. Slots are marked; casting needed before synthesis.
3. **Dojo palette unhexed:** master §0 lists "dojo red"/prompt says gold/red with no hex tokens. Proposed here: red `#D8342C`, gold `#E8B93C`, paper `#F5EBD8` — needs token sign-off.
4. **Naming:** QUEST doc says "Bubbly Beaker"; master brief cast list says "Beaker." Treated as the same character; filenames use `beaker-*`.
5. **Ch 12 recruitment order:** QUEST doc has Pixel Pal & Joy Stick join AFTER the betrayal within the same chapter — the recruit sting is therefore scored bittersweet, not triumphant (noted in 12.7).
6. **Cosmos grey state:** Ch 8's threat is scrambling, not full greying (full grey is Ch 18 per both docs); the grey backdrop layer is still delivered per the "every backdrop has a grey state" law and is reused in Ch 18.
