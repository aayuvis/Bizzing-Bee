# DESIGN BRIEF — ACT V · THE BRIDGE AND THE LEAP (Chapters 25–30)
### Production brief for Claude Design · "Bizzy and the Great Unspelling" · Ramayana/Gita act
*Master art direction (CLAUDE-DESIGN-BRIEF-SAGA.md §0) is law: Blooket-style squircle characters, bold ink sticker outline, duotone cheer shading; glossy sticker artifacts; Fraunces/Hanken Grotesk/Sono only; SVG layered files, sprite frames as sibling groups `f1…fN`. **Grey (`#A39B8E` family) is NEVER neutral — grey means unspelled.** Every environment ships with its grey layer separable. Priority tier: P2 (leap/bridge/spiral/counsel suites, Astra seals per §7).*

**Act V palette spine:** Honey `#F0B429` and Deep `#4A32A8` carry the heroes; villain crimson `#C43D5A` and unspelled grey `#A39B8E` own the Engine. Act V's emotional arc runs cold→warm: snow-blue shrine (25) → grey sea void (26) → dawn-gold bridge (27) → sodium-grey spiral (28) → lantern amber night (29) → storm-lit gates (30). Act V story gem = **bridge-stone** design (§3.2 of master).

**Cast rule:** only existing library characters + defined villains (The Static, locust-trooper, static-sprite, Glitch-corrupt, Vex cameo silhouette). No new named characters.

---

## CHAPTER 25 · THE TAPASYA — mountain shrine, five Astra seals
*Engine: Vault Locks reframed — five nights of discipline; each opened lock forges one Astra Word seal.*

### 25.1 SCENE & BACKDROP — `env-shrine-night.svg`
- **Layers (back→front):** L1 star-field with faint letter-constellations (Deep `#4A32A8` sky, near-black `#1E1440` at zenith); L2 snow peaks, moonlit rim `#8FA8E8`; L3 the shrine terrace — dojo-world architecture (paper screens, curved eaves) but stone, half-buried in snow; L4 falling-snow particle layer (app-animated, deliver 12 flake glyphs); L5 foreground snowdrift vignette.
- **Shrine focal:** a five-lobed stone altar, one lobe per Astra seal, each lobe with an empty seal-socket that glows Honey when its lock opens.
- **Palette:** cold blues/violets warmed ONLY by Bizzy's small brazier (Honey `#F0B429` pool of light ~30% of frame). Snow is blue-white `#DCE6F7`, never grey — reserve `#A39B8E` for the distant valley below, visibly unspelled at the backdrop's bottom edge (the world she left).
- **Grey-state layer:** valley grey creeps two ridges higher (stakes rising night over night); shrine itself never greys.

### 25.2 CAST ON SCREEN
- **Bizzy — NEW pose `bizzy-meditate.svg`:** seated cross-style on a snow-dusted mat, wings folded flat (first time ever shown folded), eyes closed, antennae relaxed; Stinger Quill laid across her lap. Duotone shading keyed to brazier light from her left. Squircle silhouette must still read as Bizzy at 96px.
- **Bizzy portrait:** *determined* (existing) + one NEW *serene* portrait variant (soft closed-eye smile) for night-count interstitials.
- **No crew on screen** (solitude is the point). Optional distant firefly dots = the crew's camp far below (2–3 amber pixels, no character art).

### 25.3 SPRITES & ANIMATIONS
- `astra-seal-silentk.svg`, `astra-seal-doublell.svg`, `astra-seal-root.svg`, `astra-seal-homophone.svg`, `astra-seal-schwa.svg` — 128×128 sticker medallions, states as sibling groups: `locked` (stone-grey?? NO — locked = cold blue-slate `#5B6B8C` with dark ink runes, per grey law), `forging` (Honey cracks spreading, 3 frames f1–f3), `burst` (fully lit, radiant Honey/white, single shine highlight). Iconography: silent-K = a K with a finger-to-lips wisp; double-L = twin pillars; root = 🌿 sprig cradling letters; homophone = two masks sharing one mouth; schwa = an upside-down e as a falling drop caught in a hand.
- `shrine-lock.svg` — 96×96 vault lock dial (reuse Ch 23-era Vault Lock art if shipped; restyle rim to stone), states `sealed/turning(f1–f4)/open`.
- `brazier-flame.svg` — 64×96, 3-frame flicker loop.
- `snowfall-flakes.svg` — 12 flake glyphs 8–16px for the particle layer.
- `bizzy-meditate-breathe` — 2-frame idle (shoulder rise/fall, brazier flame sway), frames as groups on `bizzy-meditate.svg`.

### 25.4 GAME-FIELD ASSETS
- Lock panel frame (stone + paper-screen border, 720×480 safe area) hosting the existing spelling-input UI; five-lock progress rail across the top (lock icons: sealed→open).
- Night counter chip "NIGHT 1…5" in Fraunces, moon-phase icon advancing per lock.
- Weak-pattern tag chips (Sono) — silent letters / doubles / roots / homophones / schwa — one per lock, matching each seal's icon.

### 25.5 STORYBOARD TABLEAUX
1. `sb-c25-arrival` — wide: Bizzy tiny on the switchback trail, shrine above, grey valley below; snow beginning.
2. `sb-c25-first-night` — close: bizzy-meditate beside the brazier, breath-cloud visible, first lock glinting.
3. `sb-c25-forge` — the third seal mid-`forging`: Honey cracks racing across it, Bizzy's face lit from below, snow steaming where light lands.
4. `sb-c25-five-lit` — all five seals hovering in a ring around Bizzy, altar sockets blazing; the ONLY warm-dominant frame of the chapter.
5. `sb-c25-departure` — dawn; Bizzy at the cliff edge looking down at the Grey Sea, seals now tiny medallions on her satchel strap. Direct setup for Ch 26.

### 25.6 FX & TRANSITIONS
- `fx-seal-burst` — radial Honey shockwave + letter-restore sparkle (reuse master FX set), 5 frames.
- Night-to-night transition: screen-wide snow-wipe left→right, moon phase turning in the corner.
- Chapter-out: match-cut from seal ring → sun rising over the Grey Sea.

### 25.7 AUDIO CUE SHEET
- `c25-x1` Bizzy (af_heart): "Five nights. Five words. I can be still that long… I think."
- `c25-x2` Bizzy: lock-open reaction per night (5 variant lines, x2a–x2e).
- `c25-x3` Bizzy (serene): "The mountain isn't testing my spelling. It's testing my staying."
- `c25-x4` Narrator (af_heart): "Austerity earns the astra. One seal each night, forged from her hardest patterns."
- SFX: wind-over-snow bed (low), brazier crackle, lock tumbler clicks ×4, seal-forge riser + burst chime (rising 5-note respell chime variant, one per seal, each a step higher — five bursts form a scale).

---

## CHAPTER 26 · THE GREAT LEAP — charge-release physics; Ring Token; burning-bright escape
*Engine: THE LEAP (new) — hold to charge (power arc preview), release, steer through letter-rings; then the escape flight.*

### 26.1 SCENE & BACKDROP
- `env-leap-cliff.svg` — launch side: dawn cliff over the Grey Sea; 3 parallax layers (sky gradient Deep→Honey at horizon; un-inked paper waves `#A39B8E`/`#BDB6AB` — the ONE place grey floods the frame, because the sea IS unspelled; cliff foreground with a spring-board rock).
- `env-engine-approach.svg` — landing side: The Engine as a cathedral of grey machinery rising from the sea — flying-buttress pistons, rose-window gear, chimneys exhaling letter-streams being swallowed downward. Crimson `#C43D5A` warning lamps are the only saturation. Deliver far/mid/near versions for the leap's approach scaling.
- `env-engine-cell.svg` — interior for the Ring tableau: a static-cage cell lit by one caged spotlight; machinery walls; a barred porthole showing free sky.
- **Grey-state:** these ARE the grey state; instead deliver a *color-intrusion* layer — everywhere Bizzy flies, a thin Honey wake temporarily saturates (app-animated trail mask).

### 26.2 CAST ON SCREEN
- **Bizzy `bizzy-leap` set (master §1.1):** three poses as one sheet — `charge` (crouched coil, wings tensed back, motion-tremble lines), `stretch` (full extension, body one diagonal line, trailing scarf of Honey light), `tumble` (roll-land ball, dust puff). Plus `bizzy-burning-bright` NEW: flight pose wrapped in a benign flame-glow aura (fire = liberation, NOT damage — flame licks are Honey/white, cheerful ink outline, no soot, no fear face).
- **Melody `melody-captive` (master §1.1):** in the static-cage, standing tall, chin up, one hand on a bar — defiant not helpless. NEW variant `melody-captive-receiving`: reaching through the bars, palm open, face breaking from defiance into recognition as the Ring Token lands.
- **Hoppy `hoppy-leap` cameo:** mid-bound beside Bizzy at the cliff (the leap-lesson beat), existing avatar + stretched-jump pose.
- Portraits used: Bizzy determined/worried/triumphant; Melody defiant (new, one) + tearful-smile (new, one).

### 26.3 SPRITES & ANIMATIONS
- `bizzy-leap.svg` — 3 pose groups (`charge`/`stretch`/`tumble`), each 128×128; `charge` has 2 sub-frames (tremble), `tumble` 3 sub-frames (impact→roll→up).
- `bizzy-burning-bright.svg` — 4-frame flame-aura flight cycle, 128×128, aura on separable layer.
- `ui-charge-arc.svg` — the charge UI: a dotted parabolic arc from Bizzy to horizon, power-graded Honey→crimson at overcharge; 96px launch-pad ring with fill sweep; wind-drift chevrons. States: `idle/charging(f1–f4 fill)/perfect-window(pulse)/released`.
- `letter-ring.svg` — 96×96 hoop of soft gold light with one Sono letter floating in it; states `ahead/passed(burst to sparkle)/missed(fades to grey and sinks)`. The ring chain spells Melody's message (word set from engine spec).
- `ring-token.svg` — 64×64 sticker: tiny hive-seal ring (hex signet, Honey metal, Deep gem). States `carried(glint loop 2f)/given(handoff sparkle)/glowing`.
- `static-cage.svg` — 256×256 cage of jittering white-noise bars (2-frame shimmer), door state `locked/shorted`.
- `escape-glow-trail.svg` — ribbon trail element, additive Honey→white, 3 taper segments.
- `grey-wave-strip.svg` — tileable paper-wave band ×3 offsets for sea parallax.

### 26.4 GAME-FIELD ASSETS
- Leap HUD: charge meter (vertical honeycomb column), wind indicator flag, letters-delivered tally (Melody's message spelled out, letters lighting as rings are threaded), landing-quality star burst.
- Escape-phase HUD: simple altitude ribbon + pursuing static-sprite blips (reuse `static-sprite` enemy, 2-frame).
- Checkpoint buoy NOT used here — one leap, one arc; failure = respawn at cliff with encouragement line (`c26-x5`).

### 26.5 STORYBOARD TABLEAUX (shot-by-shot — signature sequence)
1. `sb-c26-doubt` — cliff edge, Bizzy small against the enormous grey horizon; Engine a spike on the skyline. Hoppy bounds past: scale joke, tiny bunny, huge bound.
2. `sb-c26-remember` — insert: Ring Token in Bizzy's palms, reflected in her eyes; the five Astra medallions on her strap catch light.
3. `sb-c26-charge` — low angle behind bizzy-leap `charge`: coiled, arc UI blazing overhead across the whole sky; snow of Ch 25 still dusting her shoulders.
4. `sb-c26-flight` — THE poster shot: bizzy-leap `stretch` at apex, dead center, letter-rings receding in perspective toward the Engine, her Honey wake re-inking a stripe of the sea below.
5. `sb-c26-the-ring` — inside the cell: melody-captive-receiving, ring glowing in her open palm through the bars, both faces half-lit gold; cage bars jitter but the space between the two hands is perfectly still.
6. `sb-c26-burning-bright` — the escape: bizzy-burning-bright bursting from a chimney mouth, flame-aura scattering static-sprites, Melody visible at the porthole with fist raised. Captivity → fire.

### 26.6 FX & TRANSITIONS
- `fx-arc-release` — screen shake 2px + wind-streak burst on launch.
- `fx-ring-thread` — per-ring pass: sparkle pop + the ring's letter flying to the HUD tally.
- `fx-color-wake` — saturation wipe ribbon following flight path (radial re-color bloom, masked to trail).
- `fx-ignite` — escape start: white flash 1 frame → flame-aura fade-in; NO red/orange danger tones.
- Transition out: the glow trail hand-draws the horizon line that becomes Ch 27's shoreline.

### 26.7 AUDIO CUE SHEET
- `c26-x1` Bizzy: "One leap. The whole sea. …Okay. Words have crossed wider gaps."
- `c26-x2` Hoppy (af_sarah, +2 pitch, +8% speed): "Little legs, BIG jump! You don't look down — you look THROUGH!"
- `c26-x3` Melody (bf_emma, plate reverb): "You came. Across ALL of that — you came." *(quiet, close)*
- `c26-x4` Bizzy: "Everyone's coming. This ring is a promise. Hold it where the grey can see."
- `c26-x5` Bizzy retry line: "Again. The sea is wide but it isn't ENDLESS."
- `c26-x6` The Static (af_bella, ring-mod): distant garbled alarm bark on escape trigger.
- SFX: leap charge riser + wind rush (master §6), ring chime per hoop (pentatonic ascending), cage static buzz, ignition whoosh, escape flight = bright major reprise of Bizzy's theme.

---

## CHAPTER 27 · THE BRIDGE OF NAMES — 15 Setu stones, one friend per stone
*Engine: BRIDGE BUILDER (new) — rapid micro-challenges; each success = one friend flies in and sets THEIR stone; the bridge builds a melody, one note per stone.*

### 27.1 SCENE & BACKDROP — `env-setu-shore.svg`
- **Wide scene (2× screen width, app pans as bridge grows):** left = the army's shore at dawn — warm sand, campfires, banners in every world's accent color (the one crowded-with-color frame of the act); right = the Engine island far off in grey haze; between = open grey sea where the bridge will grow.
- **Layers:** L1 dawn sky (Honey→pink `#FFB4C6`→Deep); L2 Engine silhouette + haze; L3 sea (grey paper waves — re-color band spreads outward from each placed stone ~1 stone-width); L4 bridge construction lane (empty stone sockets faintly outlined in gold dashes, 15 sockets); L5 shore crowd platform.
- **Grey-state:** sea starts fully grey; final state shows a full Honey-stone causeway with color bleeding into the water beneath every stone — deliver the re-colored sea as a 15-step mask sequence.

### 27.2 CAST ON SCREEN
- **The 15 stone-setters** (one champion per world-pack, per master §3.7 "15 emblems — reuse pack icons"): Bumble (Hive), Maestro* (Stage — *just rescued; her stone-set is the emotional beat), Astro (Cosmos), Panda Sensei (Dojo), Beaker (Lab), Zoomies (Critter), Pixel Pal (Arcade), Crane (Origami), Beat Bot (Vibe), Rexy (Dino), Wisp (Enchanted), Monarch (Wildhearts), Ember (Elements), Griff (Legends), Rally (Turbo, in-kart hover-hop gag).
- **Per-friend `<name>-stone-carry`:** master brief allows *reuse cheer pose + stone overlay* — build ONE universal carry rig: stone sprite composited under raised cheer-pose arms, plus a 2-frame flutter/hop descend. Bespoke only where cheer pose can't hold a stone: Rally (kart roof-carry), Rexy (head-balance), Crane (folded-paper sling).
- Bizzy directs from a foreground rock (existing determined pose + point gesture NEW single pose `bizzy-point.svg`, 128×128).
- Background crowd: remaining crew as small cheer-pose rank, greyscale-NOT-allowed — use each avatar's own colors at 60% scale.

### 27.3 SPRITES & ANIMATIONS
- `setu-stone-base.svg` — 96×72 rounded stone sticker, Honey-warm granite, ink outline; center recess for emblem stamp.
- `setu-emblem-<pack>.svg` ×15 (`hive/stage/cosmos/dojo/lab/critter/arcade/origami/vibe/dino/enchanted/wildhearts/elements/legends/turbo`) — 40×40 emblem chips, reuse existing pack icons re-inked to stamp style (single color + ink).
- `setu-stone-set` anim — 4 frames: hover → drop → splash-of-color shockwave → emblem stamp-glow. Splash re-colors the sea band beneath.
- `bridge-span.svg` — modular causeway segment (stone + mortar-of-light joints), 15 chained slots; deliver as one layered file with per-stone visibility groups `s1…s15`.
- `carry-flutter` universal rig — 2-frame descend loop, 128×128 bounding.
- `banner-set.svg` — 15 world-accent pennants, 32×64, 2-frame flap.

### 27.4 GAME-FIELD ASSETS
- Micro-challenge card frame (20–30s rounds): compact panel styled as a blueprint scroll; challenge-type chip (spell/unscramble/sort/type icons from existing engine iconography).
- Bridge progress bar IS the bridge itself (no abstract bar): mini-map strip of 15 sockets along the screen bottom, filling with emblems.
- Round timer: honey hourglass 48×48, 4 drain states.

### 27.5 STORYBOARD TABLEAUX (shot-by-shot — whole-cast moment)
1. `sb-c27-shore` — the army arrives: wide shore shot, 30+ avatars, banners, the impossible grey gap. Bizzy front, Ring-Token hand raised toward the Engine.
2. `sb-c27-first-stone` — Bumble sets stone 1: close on the stamp-glow, hive emblem blazing, color ring spreading in grey water; every face reflected gold.
3. `sb-c27-melody-stone` — Maestro, freshly free, sets HER stone mid-span; Maestro conducting from shore; her note rings and the bridge-melody suddenly sounds like a song (this is the audio hinge — see 27.7).
4. `sb-c27-span-grows` — time-lapse diagonal: stones 4–12 landing in sequence, friends criss-crossing the sky like a bucket brigade of light, sea re-coloring in stripes.
5. `sb-c27-completion` — the 15th stone (Rally's, comedy kart-drop) clicks in; full causeway shot shore-to-Engine, whole cast ON the bridge, Engine looming grey ahead — brave, not triumphant. Act-V-gem key art.

### 27.6 FX & TRANSITIONS
- `fx-stone-splash` — color shockwave ring in water (radial saturation wipe, master FX).
- `fx-emblem-stamp` — punch-in glow + 1-frame white pop.
- Per-round win: the summoned friend streaks in on a world-accent-colored trail.
- Transition out: camera runs the finished bridge left→right at speed, gaining the Engine gate — smash to Ch 28's top-down spiral.

### 27.7 AUDIO CUE SHEET — **the bridge builds a melody: one note per stone**
- Compose a 15-note theme (the "Setu line" — resolve it as the first 15 notes of the homecoming theme so Ch 36 rhymes). Each stone-thunk = thunk + its note sustained as a chord layer (master §6 "thunk-chord, adds a note per stone"). Stones 1–7: bare notes. Stone 8 (Maestro's, mid-span): her plate-reverb voice hums along and strings enter. Stone 15: full chord + crowd cheer.
- `c27-x1` Bizzy: "The sea says one-at-a-time. Fine. We are VERY good at one-at-a-time."
- `c27-x2` Bumble (am_michael, eager): "First stone's mine! Somebody's gotta be the brave dumb one!"
- `c27-x3` Maestro: "Every stone has a name on it. That's why it holds — the sea can't unspell a NAME that's carried."
- `c27-x4` Panda Sensei (am_adam, −12%, warm hall): "A bridge is a promise repeated fifteen times."
- `c27-x5` Rally (af_sarah kid-crew filter): "Stone delivery! Zero-to-splash in one point five!"
- `c27-x6` Bizzy, completion: "Fifteen names. One road. …Let's go get our friend's WORLD back."
- SFX: surf bed, wing-flutter passes, stamp punch, crowd swell layered per 5 stones.

---

## CHAPTER 28 · THE CHAKRAVYUHA — spiral maze, petal gates, the crew breach
*Engine: Spiral Maze variant — entry path shown once (Simon-style); one-way petal gates; scripted trap; full-crew breach rescue.*

### 28.1 SCENE & BACKDROP — `env-chakravyuha.svg` (top-down)
- **Top-down spiral fortress-maze** ringing the Engine's gatehouse: seven concentric wall rings of grey machinery (pipes, plated segments, tooth-gear ridgelines), connected by petal-gate choke points; the heart chamber glows crimson. This environment is legitimately grey-dominant (it IS the enemy's) — heroes and UI carry all saturation.
- **Layers:** L1 sea/bridge-end apron (bottom edge, still Honey — the road behind); L2 outer wall ring silhouettes with crimson lamp studs; L3 maze floor tileset; L4 gate/hazard layer; L5 rotating searchlight cones (patrol vision-cone glow, master mob UI).
- **Live behavior note for build:** rings slowly counter-rotate (deliver each ring as separable group with its own pivot).
- **Grey-state:** n/a (native grey); instead deliver `breach-state` overlay — wall sections shattered with color pouring through the cracks (used in the finale beat).

### 28.2 CAST ON SCREEN
- **Bizzy `bizzy-top`** maze puck (existing, 2-frame hover) + NEW `bizzy-top-caught` state: hover puck dimmed inside a crimson petal-cage, banging tiny fists (2-frame).
- **Enemies:** `locust-trooper` top-down patrol variant (2-frame march, 48×48) + `static-sprite` turret variant.
- **Breach tableau cast:** Bumble, Rexy (wall-smasher), Ember, Shadow Ninja, Zappy, Griff bursting through walls — reuse cheer/action poses at tableau scale; Rexy gets one NEW `rexy-smash.svg` shoulder-charge pose (128×128).
- Portraits: Bizzy worried; Bumble determined-shout (new, one).

### 28.3 SPRITES & ANIMATIONS
- `spiral-tileset.svg` — top-down machinery wall modules: straight, curve-15°, junction, cracked (pre-breach), each 64×64 on the maze grid.
- `petal-gate.svg` — 96×96 iris of five metal petals; states `open(f1–f3 blossom-out)/sealing(f1–f3 close)/sealed(locked, crimson seam glow)/shattered`. Petal shapes deliberately flower-like — the fortress mocks the meadow.
- `ui-entry-path.svg` — the Simon-style entry preview: a golden thread tracing the true route inward, drawn head with letter-beads at decision points; plays once, then fades to 3 dim breadcrumbs max.
- `searchlight-cone.svg` — 30° cone gradient, 2 intensity states (patrol/alert-crimson).
- `heart-chamber.svg` — 192×192 center piece: ringed dais + crimson core lamp; state `trap-sprung` (floor petals snap up around the dais).
- `wall-breach` anim — 4 frames: crack-glow → burst → dust → open gap with color spill.

### 28.4 GAME-FIELD ASSETS
- Path-memory HUD: thread-spool icon showing remaining recall confidence (5 beads).
- Gate challenge card: each petal gate opens on a quick word task; card styled as a stamped machine-permit (grey card, crimson stamp, Sono text).
- One-way indicators: petal-chevrons on floor pointing inward only.
- Alert meter: crimson eye icon, 3 states.

### 28.5 STORYBOARD TABLEAUX
1. `sb-c28-overhead` — full top-down reveal of the spiral, Bizzy a single gold dot at the mouth; the entry thread glowing its once-only path. Scale = dread.
2. `sb-c28-gates-close` — behind Bizzy a petal gate irises shut in 3 panels (open/half/sealed) — the "no way back" beat.
3. `sb-c28-trap` — heart chamber: bizzy-top-caught in the sprung petal-cage, crimson light, searchlights converging; her glow tiny but NOT extinguished.
4. `sb-c28-breach` — the answer shot: SIX simultaneous wall-bursts around the ring, crew silhouettes in the gaps rimmed by their world colors, Rexy mid-smash front and center. Caption law: never send one in alone.
5. `sb-c28-regroup` — crew ring around Bizzy in the wrecked heart chamber, gate to the Engine's inner door ahead; group determined stance. Sets Ch 29's eve-of-war camp just outside.

### 28.6 FX & TRANSITIONS
- `fx-petal-seal` — metallic clang flash + crimson seam pulse.
- `fx-path-fade` — golden thread evaporates as letter-sparks (memory made visible, then gone).
- `fx-breach-burst` — dust + color-spill gradient through gaps (saturation pours IN from outside — inverse of grey-creep; reuse re-color bloom masked to gap shapes).
- Transition out: crimson core lamp gutters → cut to black → a single match-strike lights Ch 29's first lantern.

### 28.7 AUDIO CUE SHEET
- `c28-x1` Bizzy: "I know the way in. …That's the trap, isn't it. Knowing HALF a thing."
- `c28-x2` The Static (af_bella, ring-mod), over-speaker taunt: "IN-in-in… no OUT. No-no-out." *(scrambled cadence)*
- `c28-x3` Bizzy, caught: "Okay. New plan. The plan where my friends ignore my brave speech and come anyway."
- `c28-x4` Bumble, breach: "NOBODY spirals our Bizzy!"
- `c28-x5` Panda Sensei, regroup: "Remember this room. Alone is how the Engine wins. Together is how words work."
- SFX: ring-rotation machine groan loop, petal clang, path-preview = music-box motif (same notes the player must "replay" spatially), trap sting (Vex motif inverted), breach = six staggered percussion hits + crowd roar.

---

## CHAPTER 29 · THE COUNSEL — the quiet chapter · EMOTIONAL CENTERPIECE
*Engine: REFLECTION — ten counsel words: hear, learn meaning, spell; each lights one lantern. Deliberately low intensity. Gita-shaped, secularized: duty is not hatred.*

### 29.1 SCENE & BACKDROP — `env-counsel-camp.svg` — **LIGHTING IS THE ART HERE**
- **Scene:** night camp in the lee of the breached Chakravyuha wall, eve of war. The Engine's silhouette fills the upper third — but OUT of focus and low-contrast; this chapter refuses to look at it.
- **Layers:** L1 night sky, few stars, no moon; L2 Engine blur silhouette (`#3A3A45`, softened edges — near-grey but blued so it reads as *night*, not unspelling; the ONLY grey `#A39B8E` in frame is a thin seam under the Engine, honest but distant); L3 camp ground + the counsel tree (a single bare tree strung with the lantern line); L4 the ten hanging lanterns; L5 seated foreground figures, rim-lit.
- **Lighting model (deliver as separable light layers):** each lantern, when lit, adds a warm pool `#F0B429`→`#FFE9B8` radial with soft falloff; the scene ships with 10 progressive lighting states — at word 1 the frame is 90% dark; at word 10 the whole camp breathes amber and the crew's sleeping forms are revealed at the edges (they were there all along — the light finds them). Faces get catchlights only from lantern side. NO cool fill except starlight rim on the Engine.
- **Grey-state:** none. This chapter never greys. That is the point.

### 29.2 CAST ON SCREEN
- **Panda Sensei `sensei-counsel` (master §1.1 key art):** seated, robe pooled, one lantern at his knee lighting him from below-left; face at rest, half-smile; one paw open upward. 192×192 hero art + 96px dialogue-scale crop.
- **Bizzy — NEW `bizzy-listen.svg`:** seated small beside him, knees hugged, wings drooped, looking up; and variant `bizzy-listen-tear` (single catchlight tear, no sobbing — kids' peril rules).
- **Glitch doubtful intercuts:** `glitch-corrupt` *doubtful* portrait (master §1.2) framed in a cold static-blue vignette — the SAME lantern warmth is absent from his frames; his intercut panels are the visual argument. NEW second intercut state `glitch-doubt-reach.svg`: his un-corrupted pixel hand half-reaching toward a tiny screen showing the lantern light.
- Background: sleeping crew lumps (silhouette shapes only, revealed by later lantern states); Melody keeping watch far left, back to camera.

### 29.3 SPRITES & ANIMATIONS
- `counsel-lantern.svg` — 64×96 paper lantern, hive-hex ribbing, hung from a cord; states `unlit` (deep blue-slate paper, visible but sleeping) / `kindling` (f1–f3: ember dot → glow bloom → full) / `lit` (2-frame breathing glow loop). Deliver ×10 as ONE file with per-lantern groups `lantern-1…lantern-10`, each stamped with its counsel word in small Sono once lit.
- **The ten counsel words** (brief names five; five proposed, flag for approval): COURAGE, MERCY, DUTY, DOUBT, FRIEND, *PATIENCE, TRUTH, FORGIVE, HOPE, TOGETHER* — note TOGETHER pre-echoes the Ch 35 finale word by design.
- `lantern-cord.svg` — catenary cord across the tree, 10 hang points.
- `sensei-counsel.svg` — pose above, 2-frame idle (breath, lantern flicker on robe).
- `firefly-drift.svg` — 6 tiny amber motes, ambient layer (the Ch 17 fireflies, returned — continuity nod).

### 29.4 GAME-FIELD ASSETS
- Counsel card: hear (speaker icon) → meaning (one gentle sentence, Hanken) → spell (existing input). Card paper = warm parchment, lantern-lit edge glow. NO timer visible. No fail sting — a miss just dims nothing; Sensei re-reads the word.
- Progress = the lantern line itself; no bars, no scores on screen (stars computed silently).
- Intercut frame: Glitch panels slide in as narrow cold letterbox strips between words 3/6/9, then withdraw.

### 29.5 STORYBOARD TABLEAUX (treat lighting as the story)
1. `sb-c29-dark-camp` — near-black frame: one unlit lantern line barely visible, Bizzy's silhouette apart from the crew, Engine seam of grey on the horizon. The saga's quietest image.
2. `sb-c29-first-light` — Sensei's match lights lantern 1: two faces appear out of darkness — his calm, hers wrecked. Composition: light occupies 10% of frame; it is enough.
3. `sb-c29-glitch-intercut` — split tableau: warm camp right, cold static-blue Glitch left in doubtful portrait, the lantern glow just barely crossing the split line to touch his frame edge. (Kin on the other side.)
4. `sb-c29-duty-not-hatred` — mid-counsel: five lanterns lit, Bizzy now sitting straighter, Sensei's open paw and the line-art of his words drifting as faint letter-motes between them.
5. `sb-c29-ten-lanterns` — final: all ten lit, camp revealed golden, sleeping friends visible everywhere, Bizzy asleep against Sensei's side, his paw shielding her wing from the night wind. Hold this frame long. Act V's emotional key art.

### 29.6 FX & TRANSITIONS
- `fx-lantern-kindle` — soft bloom, 3 frames, plus new light-layer fade-in (600ms, ease-out — nothing snaps in this chapter).
- Letter-motes: counsel word's letters drift upward from a lit lantern as fading sparks.
- Glitch intercut: 2-frame static shiver on entry/exit — the only harsh FX, kept brief.
- Transition out: dawn greys— NO. Dawn *pales* the sky (blue→pale rose); lanterns fade proudly, not sadly; cut to the war-horn of Ch 30 over the last lantern's afterglow.

### 29.7 AUDIO CUE SHEET
- `c29-x1` Bizzy: "Glitch used to save me his last token. How do I fight someone whose HIGH SCORES I know?"
- `c29-x2` Sensei: "You will not fight your friend. You will fight the forgetting that is WEARING him."
- `c29-x3` Sensei, per-word intro ×10 (`x3a–x3j`), one line of meaning each — e.g. x3a "Courage. Being scared, and spelling anyway."; x3f "Doubt. A question wearing a heavy coat. Set it down; look inside it."
- `c29-x4` Glitch (am_michael, bit-crush), intercut whispers ×3: "in-fin-ite lives… then why does it feel like z-z-zero…"
- `c29-x5` Bizzy, lantern 10: "Duty isn't hatred. …Okay. I can carry that. It's lighter than the other thing."
- `c29-x6` Sensei, close: "Sleep, little speller. Tomorrow needs you rested, not perfect."
- SFX/music: solo warm-hall koto/kalimba figure; each lit lantern adds one soft held tone (a ten-tone chord assembling — the gentle mirror of Ch 27's bridge melody); cricket bed; Glitch intercuts drop ALL music to a bit-crushed room tone for 2s.

---

## CHAPTER 30 · BOSS: THE SIEGE BEGINS — THE STATIC at the gates
*Engine: Type-Storm — unscramble-then-type under fire; final phase inverts screen colors and reverses word order.*

### 30.1 SCENE & BACKDROP — `env-engine-gates.svg`
- **Arena:** the Engine's outer gates at storm-dawn — a cliff-high double door of riveted grey plate, crowned by a broken-letter portcullis; The Static manifests ACROSS the doors as a giant screen-ghost (the doors are its face). Crimson lamps rake the field; behind the camera-side edge, the tips of the crew's banners intrude in full color (the army at Bizzy's back — keep them in frame; this siege is TOGETHER).
- **Layers:** L1 storm sky (Deep violet, letter-debris blowing like ash); L2 gate face + Static projection surface; L3 battlefield apron (bridge-stone road ending at the doors — Ch 27's stones underfoot, still Honey); L4 wave-spawn rails for word attacks; L5 banner/crew edge strip.
- **States:** `gates-intact` / `gates-cracking` (letter-shaped fissures leaking light) / `gates-falling` (final beat, one door off its hinge, white light beyond). Deliver as progressive damage groups.
- **Grey-state:** arena is villain-grey natively; victory beat floods fissures with white-gold (not full re-color — the war isn't won, only opened).

### 30.2 CAST ON SCREEN
- **THE STATIC (master §1.2):** screen-shaped ghost of white noise wearing a broken crown of letters. Required states: `idle-shimmer` (2-frame, existing spec), NEW `static-scream` set — `scream-charge` (face folds inward, noise density rising, crown letters rattling), `scream-release` (mouth = full-screen noise cone, crown letters blown off and orbiting), `staggered` (image rolls/tears like bad tracking, crown askew), `defeated-shutoff` (collapses to a single horizontal scanline dot). 512×384 boss canvas.
- **Bizzy** ground stance with Stinger Quill raised as a lightning-rod antenna (reuse `bizzy-quill` hero pose, storm-lit variant lighting layer).
- Crew edge cameos: Beat Bot + Pixel Pal flanking (typing support conceit), cheer poses, storm rim-light.
- Portraits: Bizzy triumphant; Static has NO portrait — it is never framed as a person.

### 30.3 SPRITES & ANIMATIONS
- `static-scream.svg` — states above; scream-release includes a 3-frame noise-cone sweep.
- `word-missile.svg` — scrambled-word projectile: letter cluster in a static shell, 96×48; states `incoming/unscrambled(shell cracks, letters reorder in gold)/typed-away(burst)` .
- `inverse-flash.svg` — final-phase overlay: full-screen color inversion mask + reversed-order indicator chip (mirrored arrow, Sono).
- `gate-crack.svg` — letter-shaped fissure decals ×6 (they crack in the SHAPE of letters — the doors remember what they're made of).
- `crown-letter.svg` — 8 orbiting broken crown letters, 32×32, 2-frame tumble.
- `portcullis-fall` anim — 3 frames for the falling-gate beat.

### 30.4 GAME-FIELD ASSETS
- Type-Storm HUD: wave counter (storm-cloud pips), boss bar in master ink-outline style with phase pips (3 phases: waves / scream barrages / inversion), input line in Sono with unscramble staging row.
- Danger telegraph: scream-charge vignette pulse (crimson, 2 states).
- Assist-ladder surfacing per master systems (shorter waves, slower missiles) — no bespoke art beyond a softened wave-counter chip.

### 30.5 STORYBOARD TABLEAUX
1. `sb-c30-arrival` — dawn after the counsel: the army on the stone road, gates towering, The Static's face flickering awake across them; ten tiny lantern-glows still hanging from packs (Ch 29 carried forward).
2. `sb-c30-scream` — scream-release full spread: noise-cone vs Bizzy's braced quill, her Honey glow a wedge holding the cone apart; banners horizontal in the blast wind.
3. `sb-c30-inversion` — the inverted-color phase as a tableau: negative world, Bizzy the only correctly-colored thing in frame (heroes keep their palette even inverted — deliver Bizzy exempt from the inversion mask).
4. `sb-c30-shutoff` — The Static collapsing to its scanline dot between the cracking doors; crown letters raining; crew mid-cheer-leap at frame edges.
5. `sb-c30-gates-fall` — final: one door down, white light and machine-cathedral depths beyond, the whole crew silhouetted at the threshold, Bizzy's quill raised. Act VI cliff-lead. "The siege begins" — end card.

### 30.6 FX & TRANSITIONS
- `fx-scream-shake` — 4px screen shake + chromatic-jitter edge (kept under 1s bursts; readability first — this is a typing game).
- `fx-unscramble-snap` — letters flip-sort into place with gold trail.
- `fx-inversion` — 2-frame invert flash in/out; hold-state uses the overlay mask.
- `fx-gate-light` — fissure light bleed, additive white-gold.
- Transition out: walk-in through the fallen gate into darkness → Act VI title card.

### 30.7 AUDIO CUE SHEET
- `c30-x1` The Static (af_bella, ring-mod + bit-crush): "NO. ENTRY. no-no-NO-entry-entry." *(all its lines scrambled/stuttered per casting spec — never clean speech)*
- `c30-x2` Bizzy: "You're the voice of a machine that eats words. So here — CATCH." *(phase 1 start)*
- `c30-x3` Beat Bot (kid-crew filter): "Waves incoming on the one — type on MY count!"
- `c30-x4` Bizzy, inversion phase: "Backwards, inside-out — doesn't matter. I know these words in the DARK now." *(Ch 29 callback)*
- `c30-x5` The Static, shutoff: "…entry…" *(single, small, almost a question — pity beat, 1s)*
- `c30-x6` Bizzy, gates: "For every word ever. WE'RE COMING IN."
- SFX/music: Unspelling drone at full swell under phase 1; per-wave riser; scream = filtered white-noise blast ducked under Bizzy's typing clicks (clicks stay audible = player agency); inversion = music plays its own motif reversed; victory = drone cuts dead, one beat of silence, then the 15-note Setu line reprised as brass.

---

## ACT-WIDE DELIVERY CHECKLIST
- New character poses: `bizzy-meditate` (+breathe, +serene portrait), `bizzy-leap` (charge/stretch/tumble — master-specced), `bizzy-burning-bright`, `bizzy-point`, `bizzy-listen` (+tear), `bizzy-top-caught`, `melody-captive` + `melody-captive-receiving` (+2 portraits), `hoppy-leap` (master-specced), `sensei-counsel` (master-specced), `glitch-doubtful` portrait (master-specced) + `glitch-doubt-reach`, `rexy-smash`, universal `carry-flutter` stone rig (+3 bespoke: Rally/Rexy/Crane), Bumble determined-shout portrait.
- Artifacts: 5 Astra seals (locked/forging/burst), Ring Token (carried/given/glowing), 15 Setu emblems + stone base + span, 10 counsel lanterns (unlit/kindling/lit), Act V bridge-stone gem.
- Environments: shrine night-snow, leap cliff + engine approach + cell, setu shore (2× wide, 15-step recolor masks), chakravyuha spiral (rotating ring groups + breach state), counsel camp (10 progressive light layers), engine gates (3 damage states).
- Audio: 34 dialogue slots (c25-x1…c30-x6 incl. multi-part sets), 15-note Setu melody + 10-tone lantern chord + all stings per cue sheets. All voices per master §8 casting; word pronunciations remain pure af_heart.
- OPEN QUESTION for approval: the five proposed counsel words (PATIENCE, TRUTH, FORGIVE, HOPE, TOGETHER — see 29.3).
