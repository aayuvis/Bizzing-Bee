# DESIGN BRIEF — ACT VI · THE WAR FOR EVERY WORD (Chapters 31–36)
### Art-production brief for Claude Design · "Bizzy and the Great Unspelling"
*Master art direction (CLAUDE-DESIGN-BRIEF-SAGA.md §0) is law: Blooket-style squircle characters, ink sticker outlines, duotone cheer shading, glossy sticker artifacts, locked type (Fraunces/Hanken Grotesk/Sono), SVG-first with sprite frames as sibling groups `f1…fN`. **Grey `#A39B8E` family is NEVER neutral — grey means unspelled.** Victory is saturation returning. Restoration, not destruction: Vex ends by REMEMBERING, not by being annihilated. Only existing library characters + the defined villains appear. Sizes below are @1x design px; deliver SVG (PNG sheets @2x only where noted).*

**Act palette:** Villain crimson `#C43D5A` + Engine grey `#A39B8E` vs. Honey `#F0B429` + Deep `#4A32A8`; each world's accent returns as it re-colors. Act VI gem = **flame**.

---

## CHAPTER 31 · THE TEN-HEADED WORD-EATER (● TEN HEADS multi-mode boss)

### SCENE & BACKDROP
- `war-field-wide.svg` (2400×1080, 3 parallax layers): grey plain before the Engine cathedral; allied army silhouettes left (warm-rim-lit), locust/static ranks right (grey). Engine looms center-back, letter-streams still being sucked into it.
- `ten-headed-arena.svg` (1920×1080): battle platform at the Engine's foot; the Word-Eater tower center-right, cracked grey ground with half-erased words etched in it. Deliver with separable grey layer per master spec (this arena starts ~80% grey; small warm pockets around the crew).

### CAST ON SCREEN
- Bizzy (determined portrait; `bizzy-side-fly` in-game), Bumble, Melody (freed but frail — reuse portrait at 70% saturation, NOT grey), Panda Sensei, Pixel Pal, Comet, Beat Bot, Crane, Brainiac, Echo — one ally cameo per head duel, matched to mode (see GAME-FIELD).
- Scopey `scopey-vision` between rounds: far-sight ring frames narrating the wider battle (Mahabharata far-sight beat). NOTE: Scopey needs a base dialogue portrait — he is absent from the §1.1 crew list (flagged inconsistency).
- Villains: the TEN-HEADED WORD-EATER (Engine war-form), background General Gnash marching silhouette, static-sprite and locust-trooper mobs at the field edges. Vex does NOT appear in ch31 — he is saved for 32/35.

### SPRITES & ANIMATIONS
**Boss tableau** — `word-eater-tower.svg` (900×1000): machinery trunk (pistons, gears, a hopper mouth at base eating a letter-stream) sprouting ten snake-necks. Every head is a separable group `head-01…head-10` plus `core-head` hidden inside the trunk hatch. Necks: segmented duct-pipe, ink outline, grey-crimson duotone.
**Ten head close-ups** (each 512×512 portrait for duel intro, each with a signature "filter-look" — a visual treatment echoing its baked voice filter, §8 casting):
1. `head-01-dictionary-jaw.svg` — spell mode. Open dictionary for a jaw, torn page-tongue. Look: crisp serif engraving lines (dry close-mic feel). States: idle-chomp f1–f2, attack f3, severed f4.
2. `head-02-scramble-tongue.svg` — unscramble mode. Tongue is a conveyor of shuffled tiles. Look: motion-smeared double-image (flutter tremolo). f1–f4 as above.
3. `head-03-question-eye.svg` — trivia mode. Single huge "?"-pupil eye. Look: quiz-show spotlight vignette. f1–f4.
4. `head-04-ribbon-beak.svg` — idiom mode. Scissor-beak with shredded idiom ribbons stuck in it (kin to Gnash's teeth). Look: torn-paper edges. f1–f4.
5. `head-05-keyboard-teeth.svg` — type mode. Keycap teeth that clack. Look: scanline overlay (bit-crush). f1–f4.
6. `head-06-metronome.svg` — rhythm mode. Metronome-wedge head, tick-arm tongue. Look: strobe on-beat pulse (gate). f1–f4.
7. `head-07-sorting-sieve.svg` — sort mode. Funnel-sieve skull dropping words into wrong bins. Look: split duotone halves. f1–f4.
8. `head-08-rung-neck.svg` — ladder mode. Vertebrae shaped as ladder rungs, one letter per rung. Look: step-quantized posterization. f1–f4.
9. `head-09-fogged-mirror.svg` — memory mode. Mirror face that fogs over what it shows. Look: gaussian fade at edges. f1–f4.
10. `head-10-tile-visor.svg` — wordle-guess mode. Five-slot visor of flipping green/gold/grey tiles for a face. Look: hard tile-flip shading. f1–f4.
**Shared head states on the tower:** `head-strike` (lunge, 3 frames, 220×300 per neck-head group: f1 rear-back coil, f2 full-extension snap with mode-glyph flash, f3 recoil-sway) · `head-severed` (neck stump capped with a sparking valve, 1 frame) · **regrow FX** `head-regrow` (4 frames, 260×320): f1 stump valve hisses grey steam → f2 wireframe head sketches itself in grey ink → f3 fills with flat grey → f4 snaps to full duotone. Regrow ALWAYS in grey-first order (unspelling re-asserting itself).
- `core-head-reveal.svg` (420×420, 3 frames): trunk hatch grinds open → a small, dim, ALMOST SAD grey head on a thin neck, drooping, one flickering letter (its true name's initial) caught in its mouth. No menace — pity. f1 hatch, f2 emerge, f3 look-up at Bizzy.
- `core-head-release.svg` (2 frames): struck by the dictation word — it doesn't shatter; it exhales its swallowed letters upward and closes its eyes, relieved. Restoration language, not gore.

### GAME-FIELD ASSETS
- Boss bar (master UI): 10 head pips + hidden 11th pip that appears only after 9 fall.
- Per-mode duel plates (10 × 1920×360 lower-third fields) reusing existing engine skins re-tinted Engine-grey; each duel intro slots the head close-up left + ally cameo right (spell→Bumble, unscramble→Comet, trivia→Griff, idiom→Echo, type→Pixel Pal, rhythm→Beat Bot, sort→Breeze, ladder→Crane, memory→Melody, wordle→Wisp).
- `scopey-vision-frame.svg` (1600×500): telescope-ring letterboxed vista strip; interchangeable battle vignettes ×3 (`vision-bridge-holds`, `vision-gnash-pressed`, `vision-queen-guard`).

### STORYBOARD TABLEAUX
- T31-A "The Tower Wakes" (1920×1080): letter-stream reverses INTO the hopper; ten necks unfurl in silhouette against the Engine.
- T31-B "Nine Down" : nine capped stumps steaming; crew mid-cheer FREEZES as the hatch light appears.
- T31-C "The Sad Head": Bizzy lowers her quill slightly — the core head is small and grey and tired. She spells anyway, gently.

### FX & TRANSITIONS
- Severed-head poof: grey ink-cloud + spinning letters escaping upward (never debris/gore).
- Regrow steam (grey, must read as WRONG against the master rule — this is the one place grey belongs).
- Core-release: radial re-color bloom (master FX set) seeded at the tower, un-greying a 300px ring of arena floor.
- Transition out: Scopey's vision ring irises to the war-field wide → smash-cut title card ch32.

### AUDIO CUE SHEET
- Slots: `c31-x1` Scopey (am_adam, −5%): "Hold the line — she has found its heads." · `c31-x2` per-head taunt ×10 (`c31-h01…h10`; one voice per head from full Kokoro set, per-head signature filter per §8 — e.g. h01 dry close-mic, h05 bit-crush, h06 tight gate on the tick) · `c31-x3` Scopey mid-battle vision line ×3 (`c31-v1…v3`, one per vision vignette) · `c31-x4` Bizzy pre-core: soft, no filter: "You're not a monster. You're a mouth someone built." · `c31-x5` core head, whisper-gain: its true name, half-spoken. · `c31-x6` Bumble relief whoop on release.
- Stings: ten-head sting per mode (§6) · regrow = unspelling drone stab (0.8s) · core release = respell chime, slowed 2×.

---

## CHAPTER 32 · THE FACE-OFF, PART I (○ scripted defeat)

### SCENE & BACKDROP
- `war-field-charge.svg` (3200×1080 scrolling strip): the kart charge lane across the grey plain, rutted track, banners of both armies streaming past; Engine gates ahead, growing.
- `collapsing-halls-parallax.svg` (3 layers, each 3200×1080): Engine interior — cathedral ribs of grey machinery shearing loose; letter-gutters overhead spilling dead letters like ash. Layer 3 (near) contains the falling-girder occluders.
- `core-duel-chamber.svg` (1920×1080): the Engine core — a vault of grey turbines around a dais; ONE warm light source: Bizzy herself (rim-light her in honey gold; everything else desaturates toward the walls).

### CAST ON SCREEN
- Playable: `bizzy-kart` (charge), `bizzy-side-fly` (halls), Bizzy duel stance (new pose below).
- Kart charge line: Rally, Turbo, Nitro, Crash karts flanking (existing side-view kart sprites, 2-frame wheels + drift sparks).
- VEX: `vex-duel` casting pose (letters greying as they leave his hand), portrait cold-fury.
- GLITCH `glitch-corrupt` at the Engine trigger — portrait DOUBTFUL (he wavers, §1.2) → he fires anyway.
- **Portrait-fade order (the whole cast greys one by one — reverse recruitment order, newest allies first, oldest friends last; each fade is a small grief, the last are the biggest):**
  1 Rally · 2 Turbo · 3 Nitro · 4 Griff · 5 Nessie · 6 Pegasus · 7 Breeze · 8 Ember · 9 Droplet · 10 Zappy · 11 Monarch · 12 Echo · 13 Fawn · 14 Wisp · 15 Fae · 16 Crystal · 17 Rexy · 18 Raptor · 19 Beat Bot · 20 Pengu · 21 Boba · 22 Crane · 23 Golden Crane · 24 Pixel Pal · 25 Joy Stick · 26 Zoomies · 27 Capy · 28 Beaker · 29 Brainiac · 30 Panda Sensei · 31 Shadow Ninja · 32 Astro · 33 Comet · 34 Zib · 35 Melody · 36 Maestro · 37 Hive Queen · 38 Drone Dan · 39 Waggle · 40 **Bumble** (last friend) · 41 Bizzy's final wing-letter gutters out.
  (Hoppy, Scopey, Sting fade in group 24–27 background row — see inconsistencies note.)

### SPRITES & ANIMATIONS
- `bizzy-duel-stand.svg` (256×320, 3 frames): quill raised f1 / casting f2 / staggered-back f3.
- `vex-duel-cast.svg` (300×360, 4 frames): cane-stinger flourish → letter-swirl gathers → hurl → follow-through; the swirl's letters drain to grey mid-flight (per-frame gradient shift).
- `glitch-trigger.svg` (240×280, 3 frames): hand hovering f1 / head turned away, eye-token flickering f2 / slam f3.
- `engine-fire-beam.svg` (1920×400, 3 frames): a horizontal wall of grey static light — NOT an explosion; an erasure sweep.
- `portrait-fade-tile.svg` (180×180 template): standard dialogue portrait in a squircle; animate saturation 100→0 over 8 app-driven steps + final ink-outline thinning. One template, applied to all 41 above (crew grey-faded variants are programmatic per §1.1 — bespoke art NOT needed here).
- `black-card.svg` (1920×1080): pure `#0E0C14` card; centered Fraunces italic *"to be continued…"* in 30% grey — the ONLY text allowed on it. Hold 3s. (Post-card app copy reassures the player the loss is story; stars still awarded.)

### GAME-FIELD ASSETS
- Charge phase (60s, racer engine): track strip above + item-free lane; falling banner obstacles ×3 designs (`banner-fall-a/b/c.svg`, 200×400, 2-frame flutter); locust-trooper lines break across the lane as soft hazards.
- Halls phase (90s, flappy engine): girder occluders (4 shapes, 300–700px, ink-outlined grey steel), dust-plume soft sprite (240×180, 3-frame billow), gap-light guides (thin honey shafts marking the safe line).
- Duel phase: standard spell-duel UI but the input field visibly loses letters as typed (scripted futility shader — see FX); Vex health bar pips that never decrease (the tell that this fight is story).

### STORYBOARD TABLEAUX (shot-by-shot, the defeat sequence)
- S32-1 WIDE: five karts abreast crest the ridge, army roaring behind — last full-color frame of the act's first half.
- S32-2 TRACKING: Bizzy leaps from kart to wing as the gates shatter inward.
- S32-3 INTERIOR: collapsing halls flight; grey ash-letters streak past like snow.
- S32-4 CORE: Vex, elegant, almost regretful: the duel begins. Intercut `glitch-trigger` f1–f2.
- S32-5 CLOSE: Bizzy's cast word greys in mid-air, inches from him. Vex's cold-fury portrait.
- S32-6 TRIGGER: Glitch, doubtful… fires anyway (f3). `engine-fire-beam` sweeps left→right.
- S32-7 THE FADES: portrait-fade grid (6×7) empties in the order above, 0.4s apart, accelerating; sound thins with each.
- S32-8 LAST LIGHT: Bizzy's wing-name loses its final Y; her faded portrait (existing emotion set) holds 1s.
- S32-9 BLACK CARD.

### FX & TRANSITIONS
- Grey-creep (master FX) chases the karts down the charge lane — losing ground visually all chapter.
- Futility shader: typed letters desaturate + drift upward off the input line, 300ms each.
- Fade-grid vignette: as portraits grey, the app frame ITSELF desaturates (UI chrome to 20% sat) — the only chapter allowed to grey the chrome.
- Cut to black: 12-frame iris from Bizzy's eye highlight.

### AUDIO CUE SHEET
- `c32-x1` Bumble (am_michael +1/+5%): charge cry: "For every word ever!" · `c32-x2` Rally (kid-crew chain af_sarah +2/+8%): kart-line banter, ducked · `c32-x3` Vex (am_onyx −2, dry): "You spell beautifully. It won't matter." · `c32-x4` Glitch (bit-crush, sample drops): "…I'm sorry." · `c32-x5` Bizzy, half-erased (progressive low-pass as her letters fade): "Bum…ble?" · `c32-x6` narrator (af_heart), over black: "Every story greys before dawn."
- Stings: Vex motif (elegant minor 4-note) at S32-4 · unspelling drone swells under fades, one instrument dropping per fade · total silence 2s before the black card text lands · no music out — room tone only.

---

## CHAPTER 33 · THE BOW OF SPELLING (● RECOGNITION — the bow test)

### SCENE & BACKDROP
- `grey-hive-court.svg` (1920×1080): the Queen's hall (world 2 backdrop) in FULL grey state — comb-labels blank, banners ashen; the crowd of hive avatars all grey-faded. One shaft of pale light on a stone plinth: the Bow.
- Deliver the court's re-color as a LAYERED radial wave (see FX) — art must split into ≥6 concentric crowd rings for the recognition wave.

### CAST ON SCREEN
- Bizzy — awake, unrecognized; determined→heartbroken→triumphant portrait arc. Her wing-name is blank.
- Grey crowd: Hive Queen, Bumble, Waggle, Drone Dan, Melody, Maestro + 20 background hive/library avatars (all programmatic grey variants of existing art; the point is that BUMBLE doesn't know her).
- Elders ×3: reuse ghost-lamp robed silhouettes from ch22 kit, hive-toned.
- No villains on screen; the Unspelling is present as the grey itself.

### SPRITES & ANIMATIONS
- **THE BOW** `bow-of-spelling.svg` (760×420, sticker style, gradient body + shine + ink outline). Four states as sibling groups:
  - `bow-unstrung` f1: great honey-gold limbs, the letter-ribbon coiled slack at one nock, letters grey and jumbled.
  - `bow-stringing` f2–f6: five tightening steps — ONE per Astra Word spelled (silent-K seal → double-L → root-🌿 → homophone-mask → schwa-drop, matching the ch25 seals); with each word a seal-medallion clicks onto the ribbon and a run of ribbon-letters re-colors and pulls taut.
  - `bow-strung` f7: ribbon taut, letters ordered, faint hum-glow.
  - `bow-singing` f8–f10: drawn and released with NO arrow — the ribbon vibrates, and the standing wave IS her name: B-I-Z-Z-Y rippling down the string in honey light, 3-frame oscillation.
- `bizzy-string-strain.svg` (256×320, 3 frames): brace / draw / hold — effortful but sure (only the true speller can string it).
- `elder-witness.svg` (200×260, 2 frames): robed elder, lantern raised/lowered.
- `crowd-remember-face.svg` (140×140 template, 3 frames): f1 grey blank stare → f2 blink, pupils sharpen → f3 color floods top-down + recognition smile. Applied per crowd ring.
- `bow-plinth.svg` (400×300 sticker): stone plinth with a comb-seal inlay; states normal / light-dimmed ×3 steps (the miss penalty — the plinth dims, never the crowd).

### GAME-FIELD ASSETS
- Dictation UI, hardened: no retry counter shown to onlookers (a "witness row" of grey crowd portraits along the top instead of the standard streak meter — misses dim the plinth light one step, never advance the crowd).
- Astra seal inventory strip (5 slots, seals from ch25 art, arriving lit as each word lands).
- Ribbon progress = the bow itself; no separate progress bar.

### STORYBOARD TABLEAUX
- T33-A "Nobody Knows Her": Bizzy at the hall doors; Bumble looks straight through her. The cruelest frame in the saga — keep it quiet, not monstrous.
- T33-B "The Relic": elders unveil the unstrung bow; grey ribbon-letters stir as she approaches.
- T33-C "The Fifth Word": bow-stringing f6 → strung; the hall holds its breath.
- T33-D "It Sings Her Name": bow-singing wide shot; the recognition wave rolls outward ring by ring; Bumble's face is ring 1 — he remembers FIRST.

### FX & TRANSITIONS
- Recognition wave: radial re-color bloom seeded at the bow, traveling through crowd rings 1→6 at 0.5s intervals; each ring plays `crowd-remember-face` f1→f3 as color arrives; comb-labels re-letter with restore-sparkle.
- Bizzy's wing-name relights letter by letter, synced to the name-wave on the string.
- Transition out: the sung name's ripple keeps traveling past the hall doors — match-cut to the void stage of ch34.

### AUDIO CUE SHEET
- `c33-x1` Elder (bm_lewis, hall reverb): "Only the true speller strings it." · `c33-x2` Hive Queen (bf_isabella, cool at first — she doesn't know Bizzy either): "Then let the stranger try." · `c33-x3` Astra dictation words ×5, pure af_heart (untouched, per §8) · `c33-x4` Bumble (am_michael), broken-quiet after the wave: "…Bizzy?" · `c33-x5` Bizzy: "You KNOW me. You all know me."
- Stings: five ascending harp plucks (one per Astra word, reuse respell chime notes 1–5) · **recognition bow glissando** — the "sings her name" gliss (§6), full 3s, everything else tacet · crowd murmur swell rides the wave, per-ring.

---

## CHAPTER 34 · THE RESPELLING (○ grand medley)

### SCENE & BACKDROP
- `void-stage.svg` (1920×1080): near-black unspelled nothing — NOT flat black: faint grey paper-grain and drifting dead letters like dust motes. A single warm platform under Bizzy (her light again). As friends respell in, each brings a wedge of their world's backdrop with them — deliver 12 pie-slice backdrop wedges (reuse world art, masked) that assemble around the stage.
- The Panorama (ch35's mural) appears here only as a distant grey band on the horizon — foreshadow, don't reveal.

### CAST ON SCREEN — RESPELL ORDER (each correct challenge respells one friend: portrait re-colors + theme sting; grouped by medley beat):
- **Maze beat:** 1 Bumble · 2 Waggle · 3 Drone Dan · 4 Hive Queen
- **Flight beat:** 5 Monarch · 6 Echo · 7 Fawn · 8 Breeze · 9 Ember · 10 Droplet · 11 Zappy
- **Race beat:** 12 Rally · 13 Turbo · 14 Nitro · 15 Zoomies · 16 Capy
- **Simon beat:** 17 Melody · 18 Maestro · 19 Beat Bot · 20 Pengu · 21 Boba
- **Slice beat:** 22 Panda Sensei · 23 Shadow Ninja · 24 Crane · 25 Golden Crane · 26 Rexy · 27 Raptor
- **Quiz beat:** 28 Astro · 29 Comet · 30 Zib · 31 Beaker · 32 Brainiac · 33 Wisp · 34 Fae · 35 Crystal · 36 Griff · 37 Nessie · 38 Pegasus · 39 Joy Stick · 40 Pixel Pal
- **41 GLITCH — LAST.** Pixel Pal (already restored, #40) steps forward and pleads for him; Bizzy spells the final word of the chapter — FRIEND — and Glitch respells whole: static gone, eye-token replaced by his true pixel eye.
- (Hoppy, Scopey, Sting respell silently in the quiz-beat background — see inconsistencies.)

### SPRITES & ANIMATIONS
- `respell-burst.svg` (320×320, 5 frames, template FX played on every friend): f1 grey outline of the character sketches in → f2 letters of their NAME orbit → f3 letters slam inward → f4 color floods top-down → f5 cheer pose pop + ring of sparkle in the friend's world accent. Per-friend: composite with existing avatar + cheer pose; NO bespoke redraws.
- `glitch-restored.svg` portrait (256×256): clean bright arcade colors, both true eyes, small shy smile — must read as the SAME character as `glitch-corrupt` healed, not a new design. Plus 2-frame relieved-exhale idle.
- `pixel-pal-plea.svg` (240×280, 2 frames): hand extended toward the dark, then beckoning.
- `bizzy-respeller.svg` (256×320, 2 frames): quill raised, stream of restored letters spiraling from the Stinger Quill (glowing state, §3 artifact).
- `world-wedge-arrive` (12 masked wedges, ~640×540 each): slide-and-saturate in, 4 frames each via app tween — art ships as color + grey layer pairs.

### GAME-FIELD ASSETS
- Medley HUD: 6 beat chips (maze/flight/race/Simon/slice/quiz) + a 41-slot friend tracker filling left→right (tiny squircle portraits, grey→color).
- Each beat reuses its engine's existing field kit re-lit on the void stage (platform floor only; no full backdrops until wedges arrive).

### STORYBOARD TABLEAUX
- T34-A "One Light": Bizzy alone on the platform, quill glowing — the inverse of S32-8.
- T34-B "The First Name Back": Bumble's respell-burst f4; Bizzy laugh-crying.
- T34-C "The Plea": Pixel Pal at the platform edge, hand out to a hunched static silhouette; the whole restored cast behind, silent, letting it happen.
- T34-D "Forty-One": full crew on the assembled world-wedges, Glitch in the middle, everyone leaning slightly toward him.

### FX & TRANSITIONS
- Respell burst (master FX) + per-world theme sting on every restore; sparkle color = that friend's world accent.
- Void motes: each restore converts a handful of drifting dead letters into fireflies of the friend's accent color.
- Transition out: the horizon's grey panorama band SNAPS to attention as the Engine howls — hard cut to ch35 core chamber.

### AUDIO CUE SHEET
- `c34-x1` Bizzy: "Every word we ever spelled — I still have them all." · `c34-x2` Pixel Pal (af_sarah +2/+8%): "Him too. He was ours first." · `c34-x3` Glitch (filter chain REMOVED at last syllable — bit-crush dissolving mid-line): "…you'd spell ME back?" · `c34-x4` Bizzy: "F-R-I-E-N-D. Friend."
- Stings: respell chime per friend (rising 5-note), per-world theme sting layered · chime pitch rises a semitone every 8 friends · Glitch's restore = respell chime played CLEAN after a bit-crushed false start · tutti chord on T34-D.

---

## CHAPTER 35 · THE TRIAL OF FIRE (● FIRE DUEL — final duel)

### SCENE & BACKDROP
- `core-chamber-trial.svg` (1920×1080): the ch32 core chamber transformed — turbines stalled, and TEN fire rings hovering in a shallow arc between Bizzy and Vex. Behind Vex: **THE PANORAMA**, wall-sized.
- **THE PANORAMA — `panorama-mural.svg` (5120×720, the single most important art piece of the saga).** One continuous mural of the whole journey, ten panels, delivered as TEN paired layers (grey + full color, separable, hairline gold panel seams). Left→right in journey order; each panel re-colors when its fire ring is doused:
  1. **Meadow of Challenges** — grey: blank-labeled flowers bowed / color: flowers upright wearing their names.
  2. **The Hive** — grey: dark comb windows / color: every cell lit honey-gold, Queen's hall glowing.
  3. **Open Sky & Wildhearts Flyway** — grey: empty ashen sky / color: migration sky-river of monarchs threading the clouds.
  4. **Stage World & Vibe Studio** — grey: dead marquee, silent beat highway / color: marquee bulbs chasing, note-tiles streaming.
  5. **Cosmos** — grey: starless void / color: twelve letter-constellations connected and burning cyan `#36D1FF`.
  6. **Dojo & Origami Gorge** — grey: torn paper screens, unfolded bridges / color: screens mended, bridges folding themselves across the gorge.
  7. **Lab, Arcade & Critter Pond** — grey: cold flasks, dark cabinets, dry pond / color: green `#9BE34D` fizz, pink `#FF5D9E` cabinet glow, pond blooming.
  8. **Enchanted Forest & Dino Valley** — grey: dimmed glow-flora, empty nests / color: guardian's grove alight, hatchlings running the three zones.
  9. **Elements Crossroads & Turbo Circuit** — grey: four seasons frozen mid-collision, still karts / color: seasons turning, scarlet karts mid-drift.
  10. **The Way Home** — grey: the Grey Sea, the Engine dominant / color: the sea inked blue, the Bridge of Names spanning it, the Engine already softening into a lamp-lit tower — restoration, not a ruin.
- No grey remains anywhere on the mural after panel 10 — the act's thesis in one image.

### CAST ON SCREEN
- Bizzy (quill aloft) vs. **VEX — alone, all masks off**: full standing with cane-stinger, `vex-duel` cast, and the NEW `vex-softened` portrait (below). No mobs, no other villains; the restored crew watches from the breach behind Bizzy (single group tableau, no individual sprites needed beyond ch34 assets).
- The Engine itself is the third presence: its hopper-heart visible behind the panorama wall.

### SPRITES & ANIMATIONS
- `fire-ring.svg` (300×300, sticker style): floating ring of flame. States: `lit` f1–f3 (licking loop, crimson-to-gold gradient) · `word-passing` f4 (the typed word, in Sono tiles, walking through the flames unburned — trial-by-fire proves truth) · `doused` f5–f6 (flames collapse into a ring of gold letters, then a calm ember halo). Re-light (on a miss) = f6→f1 reversed, ONE ring only, never resets all.
- `vex-softened.svg` portrait (256×256): the §1.2 defeated-softened view — shoulders down, pinstripes catching warm light for the first time, eyes on the returning letters; grief and relief, no snarl. 2-frame: watching / closing eyes.
- `vex-words-return.svg` (400×400, 4 frames): a slow spiral of small elegant words (his own, loved once) drifting back INTO his hands; each un-greys as it lands. This replaces any "defeat" animation — he remembers loving them.
- `engine-release-burst.svg` (1920×1080 overlay, 5 frames): the Engine doesn't explode — its seams open and every swallowed letter-stream pours OUT and up like dawn birds; grey shell left standing, hollow and harmless, already catching color from panel 10.
- `bizzy-final-word.svg` (256×320, 2 frames): the TOGETHER cast — quill high, both feet planted, crew's glow behind her.

### GAME-FIELD ASSETS
- Dictation UI, championship tier: 10 words; ring rack across the top mirrors ring states; panorama strip live-previews below the input (the mural IS the progress bar).
- Miss handling: re-light one ring + panorama panel de-saturates 40% (not to full grey), recoverable.

### STORYBOARD TABLEAUX (shot-by-shot, the final word)
- S35-1 WIDE: ten lit rings; Vex steps through his OWN flame-arc to face her — elegant to the last.
- S35-2..4: words 1–9 montage — each `word-passing` beat cuts to its panorama panel flushing to color; Vex flinches smaller with each, not from pain but from memory.
- S35-5 THE TENTH RING: only one flame left, framing Vex like a portrait. Dictation voice (pure af_heart, untouched): "Together."
- S35-6 CLOSE ON KEYS/TILES: T-O-G-E-T-H-E-R lands letter by letter, each keystroke echoing a friend's respell chime from ch34.
- S35-7 THE WORD WALKS: `word-passing` through the last ring — it douses to an ember halo that keeps glowing (the one ring that stays warm).
- S35-8 RELEASE: `engine-release-burst`; letters flood the chamber; panel 10 colors; Vex's words return to his hands (`vex-words-return`).
- S35-9 `vex-softened` close-up, 2s hold. `c35-x4` plays. No cage, no fall — he simply sits down among his words.
- S35-10 The crew steps forward — around him, not over him. Match-dissolve to the homecoming sky.

### FX & TRANSITIONS
- Word-through-fire shimmer: heat-haze refraction on true words, none on the flames themselves touching them.
- Panel re-color: vertical saturation wipe per panel, 0.8s, seeded bottom-up (ground remembers first).
- Ember-halo persistence: doused rings keep a faint warm rim for the rest of the scene.
- Final transition: panorama expands to fill the frame and BECOMES the ch36 flight backdrop.

### AUDIO CUE SHEET
- `c35-x1` Vex (am_onyx, dry): "I only ever wanted the words to stay." · `c35-x2` Bizzy: "They stay when they're shared." · `c35-x3` dictation words 1–10, pure af_heart (word audio NEVER filtered, §8) · `c35-x4` Vex, filter softening to near-none: "…I remember them. I remember loving them."
- Stings: Vex motif inverts to major on S35-8 · per-panel world-theme sting as each colors · TOGETHER keystrokes = the eight respell-chime notes in sequence · Engine release = the unspelling drone resolving upward into the homecoming bell's first toll.

---

## CHAPTER 36 · THE HOMECOMING (● VICTORY LAP — playable credits)

### SCENE & BACKDROP
- Flight path = the full `panorama-mural` in color (5120×720) extended with `panorama-sky-band.svg` (5120×360 upper band: dusk-to-dawn gradient left→right, festival sky). Bizzy flies left→right across all ten panels, ending at the Meadow where it began — flowers wearing their names again (nostos). No fail state; gentle drift controls.
- `meadow-home-final.svg` (1920×1080): the ch1 meadow at golden hour, every flower label lettered, the hive on the hill glowing.

### CAST ON SCREEN
- Playable: `bizzy-side-fly`, garland variant overlay `bizzy-garland.svg` (small flower crown, 64×48 attachment).
- **Full-cast wave tableaux** — one per panel, friends waving from their homes (reuse cheer poses + 2-frame wave arm overlay `wave-arm-overlay.svg`, 60×80): P1 Zoomies/Capy/Hoppy · P2 Hive Queen/Bumble/Waggle/Drone Dan/Sting · P3 Monarch/Echo/Fawn · P4 Melody/Maestro/Beat Bot/Pengu/Boba · P5 Astro/Comet/Zib · P6 Panda Sensei/Shadow Ninja/Crane/Golden Crane · P7 Beaker/Brainiac/Pixel Pal/Joy Stick/**Glitch (restored, waving — his redemption made visible)** · P8 Wisp/Fae/Crystal/Rexy/Raptor · P9 Breeze/Ember/Droplet/Zappy/Rally/Turbo/Nitro/Griff/Nessie/Pegasus · P10 **Vex, small and distant on the softened Engine-tower balcony, hand half-raised — remembered, not banished.**

### SPRITES & ANIMATIONS
- **Lamp strings per world** — `lamp-string-{world}.svg` ×10 (one per panel; 800×160 each, 3-frame light-up cascade left→right): shared string + per-world lamp shape and accent glow: P1 flower-cup lamps (meadow gold) · P2 comb-cell lanterns (hive gold) · P3 paper sky-lanterns rising (flyway orange) · P4 marquee bulb-and-note lamps (stage amber) · P5 star-lanterns on constellation wire (cosmos cyan) · P6 washi paper lanterns (dojo red / origami cream) · P7 flask fairy-lights + token-coin lamps (lab green / arcade pink) · P8 glow-flora orbs + egg-lamps (forest violet / valley green) · P9 four-season lanterns + tail-light strings (elements teal / turbo scarlet) · P10 bridge-stone beacons across the sea (deep `#4A32A8` + honey). Lamps light as Bizzy passes — the Ramayana welcome-of-lights, secularized as festival lamps.
- `badge-every-word-ever.svg` (512×512 sticker): saga badge — the Stinger Quill crossed with the Bow's letter-ribbon inside a honey-gold laurel of tiny letters, flame-gem at the crest; states: locked (grey — permitted ONLY in locked UI state) / earned-burst (4-frame).
- `gem-flame-act6.svg` (128×128): Act VI flame gem, completing the 6×6 shelf.
- `credits-frame-150.svg` (1920×1080 scrolling template): honeycomb grid of 150 squircle cells, 96×96 each, auto-filled from the avatar library, every avatar in cheer/wave; Bizzy's cell center-bottom, lit last; names in Sono beneath each cell.

### GAME-FIELD ASSETS
- Drift-flight UI: no meters — only a trail of restored letters streaming from the quill; optional touch-points over each tableau trigger the wave + that world's theme sting.
- End card slot for badge-burst + gem-shelf-complete animation (existing shelf UI).

### STORYBOARD TABLEAUX
- T36-A "First Lamps": P1 lamp-string cascade catches as Bizzy crosses the seam — the mural is ALIVE now.
- T36-B "The Balcony": P10, Vex's half-raised hand; Bizzy dips a wing. Nothing is said. (Restoration thesis, final proof.)
- T36-C "Home": landing in the meadow among named flowers; the whole crew arriving behind her along the lamp-lit path.
- T36-D "Every Word Ever": badge-burst over the meadow → credits-frame scroll begins.

### FX & TRANSITIONS
- Lamp cascade glow blooms (soft additive, per-world accent), letter-trail sparkle, petal-confetti (existing confetti recolored).
- Panel seams dissolve as she crosses each — by the meadow, the panorama is one seamless world.
- Final fade: credits frame → gem shelf complete → saga map fully golden, grey mist gone.

### AUDIO CUE SHEET
- `c36-x1` narrator (af_heart): "The long way home ends where it began — with a word, remembered." · `c36-x2` rolling friend greetings per panel (each character's cast voice/filter, one short line, ducked under music) · `c36-x3` Hive Queen: "Welcome home, Bizzy." · `c36-x4` Bizzy, final line: "Every word. Ever."
- Stings: **homecoming lamp bell** — one bell toll per lamp string, rising through a 10-note peal across the flight (§6) · each world's 8-bar theme quoted as its panel passes, stitched into one continuous medley · credits: full ensemble reprise of the respell chime · last sound: a single honey-warm bell + page-turn hush.

---

## PRODUCTION NOTES
- Every environment ships with its separable grey layer (master §7) — in Act VI the grey layers are gameplay, not variants.
- Priority inside P3: panorama-mural (grey+color ×10) FIRST, then word-eater-tower + heads, bow states, fire rings, respell burst, lamp strings, badge, credits frame.
- Programmatic desaturation covers all crowd/portrait greying (ch32/33/34); bespoke grey art only where a pose changes (core head, vex-softened, glitch-restored).
- Sprite frame delivery: SVG sibling groups `f1…fN` per master §0; PNG sheets @2x only for the two full-screen overlays (`engine-fire-beam`, `engine-release-burst`) if SVG filter cost is prohibitive.
- All spoken WORD audio (dictation targets in ch31/33/35) stays pure af_heart, zero filters — character filters apply to dialogue only (§8).

## OPEN QUESTIONS / INCONSISTENCIES FOUND (for the saga leads — this brief resolves them as noted)
1. QUEST-SAGA-DESIGN.md is the older 30-chapter/5-act plan: its Ch 29 = this act's Ch 32 (Face-Off Part I) and its Ch 30 folds the Respelling AND the final TOGETHER duel into one chapter. The 36-chapter brief splits these into Ch 34 + Ch 35 and adds Ch 31/33/36, for which NO mechanical specs exist in QUEST-SAGA-DESIGN.md. This brief follows the 36-chapter master.
2. Panorama panel count: §2 says the Panorama shows "ALL worlds side by side" (16 world environments exist) but Ch 35 specifies exactly 10 panels for 10 fire rings. Resolved here by grouping the 16 worlds into 10 journey-order panels (some panels host two worlds) — needs sign-off.
3. Scopey has voice casting (§8) and a special view (`scopey-vision`, §1.1) plus narration duty in Act VI, but is missing from the §1.1 crew list (cheer/grey/portrait set) — a base dialogue portrait must be added.
4. Sting (defects to the crew in Ch 6) and Hoppy appear in Act VI crowd/wave scenes but Sting is absent from the §1.1 crew variant list; both are slotted into background rows in ch32 fades / ch34 respells here.
5. Ch 32 fade order covers 40 named friends + Bizzy; §1.1's crew list (38 names) omits Rally/Turbo/Nitro/Crash and Sting/Scopey — the fade grid uses everyone seen on screen in the saga, so portrait tiles for the kart drivers (out of kart) may be needed or their kart portraits reused.
6. Ch 34 medley beats in the master ("maze → flight → race → Simon → slice → quiz") give 6 beats for 41 respells; distribution here (4/7/5/5/6/13+Glitch) is a proposal, not canon.
7. Master §3 artifact list gives the Bow states as "unstrung/strung/drawn"; Ch 33's beat requires the additional "singing" state specced here (f8–f10) — extension, not contradiction.
