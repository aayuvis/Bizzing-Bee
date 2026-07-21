# DESIGN BRIEF — ACT IV · THE GREY SEA (Chapters 19–24)
### "Bizzy and the Great Unspelling" · art-production brief for Claude Design
*Child of `/design/CLAUDE-DESIGN-BRIEF-SAGA.md` — the master brief's §0 art direction is LAW. This file adds chapter-level production detail only; where anything here seems to conflict with the master, the master wins.*

---

## ACT-WIDE COLOR LAW — "SATURATION IS THE CREW"
The Grey Sea is the one act played INSIDE the villain's palette. Everything environmental lives in the grey family (`#A39B8E` core, shifted warm `#B3A796` for paper-wave highlights, cool `#8A867F` for depths and shadow). This is the ONE place grey blankets the frame — because here grey is diegetic: the sea is un-inked paper, words drained out of it.
**What retains full saturation, always, no exceptions:**
1. **The crew** — Bizzy honey `#F0B429`, every ally in their library colors. They are the last ink in the world; the eye must find them instantly in any shot.
2. **True words** — any correctly spelled word, letter tile, buoy word, Old Word, or counsel line renders in Honey/Deep (`#F0B429`/`#4A32A8`) with the sticker shine. False/lure words get a *counterfeit* gold (`#E8C97A`, no ink outline, no shine highlight — beautiful but flat; see Ch 23).
3. **Villain accents** — Vex crimson `#C43D5A` appears only as distant sails/banners; Gnash's rank-stripes in Ch 24.
4. **Ghost-lamp light** (Ch 22) — a desaturation *exception* color: pale lantern cyan `#B8E6F0` at low opacity, because the departed spellmasters are memory, not ink.
Everything else — waves, cliffs, sky, shelves, camps — stays grey. Victory FX in this act = local saturation blooms (radial wipe from §5 FX set), never a full re-color; the Sea does not heal until Act VI.
**Delivery:** every backdrop as layered SVG; the few saturated elements on separate top layers so the app can pulse them.

## ACT-WIDE SHARED ASSETS (build once, reused 19–24)
- `grey-sea-backdrop.svg` (2400×1350, 3 parallax layers: far paper-swell / mid wave-rows / near foam-curl; waves drawn as torn-paper edges with faint *un-inked ruled lines* — this sea used to have words on it)
- `grey-sea-parallax-far/mid/near.svg` — the same three layers as loop-tileable strips (each 2048×512) for flight/runner engines
- `crew-raft.svg` (1024×512) — a raft lashed from giant letter-planks (the letters' ink almost gone; only Bizzy's patch-repairs are saturated honey). Idle bob = 2-frame group `f1/f2`.
- `vex-sail-silhouette.svg` (512×512) — distant crimson sail, the act's recurring dread accent
- `story-gem-act4.svg` — wave-drop gem (master §3.2), locked/earned states

---

# CHAPTER 19 · THE ONE-EYED GATEKEEPER — *Riddle of Nobody*
Engine: **RIDDLE DUEL** (riddle/trivia bank wrapper). Odyssey beat: the giant beaten by wordplay.

### 1 · SCENE & BACKDROP
`gatekeeper-strait-arena.svg` (2400×1350, layered). The strait mouth: two grey paper-cliff jaws closing on a slot of sea; the Gatekeeper's cliff-side perch center-right. Sky = flat grey with one torn hole of pale light behind the mantis (backlights him, keeps him readable as silhouette-first). Foreground: the crew-raft (saturated crew aboard = the only color). Carved into the cliff face: the names of everyone he has eaten, all in grey strike-through lettering — one blank slab left ominously empty (this is where NOBODY gets carved). Deliver the blank slab as its own layer `carve-slab`.

### 2 · CAST ON SCREEN
- **THE GATEKEEPER (NEW villain, per master §1.2 note in Ch 19 row + §8 casting):** giant grey mantis, one huge lidded eye (iris = a faded letter "O"), raptorial arms folded like a judge's sleeves, mandibles that grind when thinking. Sticker style, ink outline — but his duotone is grey-on-grey; ONLY his eye's inner ring may hold a dim honey glint (he still hungers for words). Views: `gatekeeper-idle.svg` (1024×1024, 2-frame breathing sway), `gatekeeper-ponder.svg` (head tilt, claw to chin), **`gatekeeper-roar.svg` — NEW POSE: mandibles flared wide, eye squeezed shut, forelimbs thrown up; 3-frame group (f1 inhale rear-back / f2 full flare + spittle flecks / f3 hold with tremble)**, `gatekeeper-defeated.svg` (slumped, eye half-lidded, almost puzzled — beaten, not hurt).
- Bizzy: dialogue portraits determined / worried / triumphant (existing set). `bizzy-answer-step.svg` (512×512) — one NEW pose: stepping forward off the raft prow, wing-tips up, chin out (used each answer round).
- Crew on raft: existing avatars + cheer poses; Echo `echo-perch-speak` for hint beats.

### 3 · SPRITES & ANIMATIONS
- `gatekeeper-eye-blink.svg` — separable eye element (512×512), 3 frames: open / half / shut. The app re-composites it over any body pose.
- `riddle-scroll-frame.svg` (1200×700 UI frame) — a scroll of the same un-inked paper as the sea, ink-outline curls, riddle text renders in Fraunces inside; grey wax seal bearing the one-eye sigil.
- `name-morsel.svg` (256×128) — a chewed word-shape the mantis flicks toward his mouth on WRONG answers, 2 frames (whole / bitten). Grey, naturally.
- `nobody-carve-fx.svg` (1024×512, 4-frame group) — the finale FX: f1 chisel-spark on blank slab, f2 letters N-O-B gouged (grey dust), f3 full NOBODY carved and *flooding with honey ink* (the only saturation event of the chapter), f4 afterglow ring. Sono letterforms.

### 4 · GAME-FIELD ASSETS
- Answer tiles: reuse app letter-tile kit (Sono, honey/deep) — true tiles saturated per Color Law.
- `round-pip-eye.svg` (64×64) — round counter pips shaped as tiny closed eyes that OPEN per round won.
- Timer: honey-drip on scroll edge (reuse comb-fill meter styling from Ch 4).
- Assist state: Echo hint bubble frame (reuse dialogue frame, small).

### 5 · STORYBOARD TABLEAUX (deliver as wide 2400×1350 stills)
- `c19-tab-1-approach.svg` — raft dwarfed in the strait mouth; the eye opens in the cliff shadow (first reveal: the cliff WAS the mantis).
- `c19-tab-2-duel.svg` — mid-duel over-the-shoulder: scroll glowing between tiny Bizzy and the vast pondering head.
- **`c19-tab-3-nobody` — THE NOBODY CARVE, shot-by-shot (3-panel strip, 2400×800 each):** (a) the mantis demands a name, claw hovering over the blank slab, Bizzy small but lit; (b) close on the slab as NOBODY is carved — grey dust, then honey ink floods the letters (sync `nobody-carve-fx` f3); (c) the roar pose mid-"NOBODY BEAT ME!", gate-cliffs cracking open behind him, crew cheering in full color below.
- `c19-tab-4-passage.svg` — raft slipping through the opened jaws; the Gatekeeper defeated-pose watching, one honey glint in his eye.

### 6 · FX & TRANSITIONS
Wrong answer: grey-creep flash on the scroll edge + name-morsel flick. Right answer: letter-restore sparkle (§5 FX set) confined to the tile row. Chapter out-transition: the cliff-jaws part as a vertical wipe revealing open Grey Sea.

### 7 · AUDIO CUE SHEET (Kokoro per master §8; Gatekeeper = bm_lewis, pitch −5, cave reverb)
| id | speaker | line intent |
|---|---|---|
| c19-x1 | Gatekeeper | challenge issued — "answer wrong, and I eat your name" |
| c19-x2 | Bizzy (af_heart) | accepts, steadier than she feels |
| c19-x3 | Gatekeeper | mid-duel taunt after a near-miss |
| c19-x4 | Echo (af_nicole) | wordplay hint, doubled echo tail |
| c19-x5 | Gatekeeper | "…your NAME, little speller." |
| c19-x6 | Bizzy | "Nobody." (dry, alone, no reverb) |
| c19-x7 | Gatekeeper | the roar: "NOBODY beat me! NOBODY!" |
| c19-x8 | Bumble (am_michael) | cheer button — relief laugh |
SFX: stone-grind mandibles · chisel carve ×3 · gate-crack rumble · riddle-scroll unfurl. Sting: Unspelling drone under duel, resolves to respell chime on the carve.

---

# CHAPTER 20 · THE TAILWIND SATCHEL
Engine: **KEEP FLYING — wind variant** (flappy engine reuse). Odyssey beat: bag of winds squandered by doubt. Theme: trust.

### 1 · SCENE & BACKDROP
Reuses `grey-sea-parallax-far/mid/near` strips. Add `tailwind-sky-band.svg` (2048×512 overlay strip): when tailwind is active, faint honey wind-lines score the grey sky; on the betrayal they recolor to bruise-grey and reverse direction — deliver both directions as layer variants (`tail` / `head`). Distant `vex-sail-silhouette` appears in the final third: the crew opened the bag *within sight of safe harbor* (the Odyssey sting).

### 2 · CAST ON SCREEN
- `bizzy-side-fly` (existing 4-frame) + NEW variant `bizzy-side-fly-strain.svg` — same 4 frames redrawn leaning hard forward, antennae flattened, for headwind flight. Must read as identical character (master §0).
- The doubting crewmate: **Waggle** (existing avatar; light-set rule). NEW pose `waggle-doubt-clutch.svg` (512×512) — hugging the satchel, eyes sideways; and `waggle-shame.svg` — post-burst, wings drooped. Dialogue portrait (existing).
- Crew cameo portraits for the pre-flight gift scene; ghost-lamp master #1 silhouette makes the gift (fore-shadowing Ch 22 — see inconsistency log).

### 3 · SPRITES & ANIMATIONS
- **`tailwind-satchel.svg`** (master artifact §3.4; 512×512 sticker): stitched cloud-leather bag, honey-thread stitching (saturated — it is a true gift), seams visibly straining, a tiny wind-swirl escaping one eyelet. States as sibling groups: `normal` / `straining` (2-frame bulge pulse) / **`burst`** — flap thrown open, stitches popped, a spiral of wind tearing out.
- `satchel-burst-fx.svg` (1024×1024, 4-frame): f1 seam-pop sparks · f2 white-grey vortex unspooling from the mouth · f3 full-screen-reaching spiral arms · f4 dissipating shreds + limp empty bag.
- `wind-streak-tail.svg` / `wind-streak-head.svg` (each 512×128, 3-frame flow loop): tailwind streaks = soft honey-tinted, flowing left→right; headwind = grey-white, jagged leading edge, right→left. Per-frame: streak forms / stretches / frays.
- `honey-pot.svg` (existing sticker, reuse) — pots are saturated checkpoints (true-word stops per flappy spec).

### 4 · GAME-FIELD ASSETS
- Thorn-wall obstacles reskinned as `paper-crag.svg` (512×1024 top/bottom pair) — torn grey paper spires.
- Wind meter UI: `wind-gauge.svg` (400×120) — an arrow of layered streaks that flips tail/head; honey when tail, grey when head.
- Progress bar: raft-to-harbor mini-map strip with the scripted blow-back marker.

### 5 · STORYBOARD TABLEAUX
- `c20-tab-1-gift.svg` — lantern-lit gifting: the satchel passed to the crew, honey stitching glowing, harbor lights a faint warm dot on the horizon.
- **`c20-tab-2-betrayal` — THE SATCHEL OPENING, shot-by-shot (4-panel strip, 2400×800 each):** (a) mid-flight, harbor CLOSE — Waggle at the raft's rear, clutch pose, whisper-thought bubble: *"what if it's treasure they're hiding from us?"*; (b) EXTREME CLOSE on thumbs under the flap, one stitch popping — a single honey thread snapping frame-center; (c) the burst — vortex erupting, crew tumbling, harbor dot ripped away to frame-edge as streaks reverse; (d) aftermath — empty bag in Waggle's hands, shame pose, Bizzy's hand on his shoulder, NOT anger (theme: trust broken then mended).
- `c20-tab-3-headwind.svg` — the grind back: whole crew hauling as one against grey streaks, all saturation clustered in their straining bodies.
- `c20-tab-4-harbor.svg` — arrival the hard way; Waggle sets the re-stitched satchel down; one honey thread glows.

### 6 · FX & TRANSITIONS
Mid-run scripted reversal: full-screen `satchel-burst-fx` → parallax layers visibly run backward for 3 s (author strips loop-reversible) → wind-streak layer swap tail→head. Fail-forward per flappy rules (pot re-queues). Out-transition: streaks calm to stillness — first calm frame of the act.

### 7 · AUDIO CUE SHEET
| id | speaker | line intent |
|---|---|---|
| c20-x1 | Ghost-lamp master (am_adam, −5%, + light cave verb) | the gift: "every fair wind we ever knew — spend it whole" |
| c20-x2 | Bizzy | trust brief to crew: nobody opens it |
| c20-x3 | Waggle (af_sarah kid-chain) | the doubt, whispered |
| c20-x4 | Waggle | the gasp as it bursts |
| c20-x5 | Bizzy | mid-headwind rally — "then we fly the long way. Together." |
| c20-x6 | Waggle | apology at harbor |
| c20-x7 | Bizzy | forgiveness — theme line on trust |
SFX: seam-creak loop while straining · stitch-pop · vortex roar (reversed-cymbal build) · headwind buffet loop · harbor bell. Sting: leap-charge riser reused inverted for the burst.

---

# CHAPTER 21 · BETWEEN THE WHIRLPOOL AND THE CLAW — *Strait Run*
Engine: **DINO DASH → STRAIT RUN** (auto-runner reuse: duck the claw, jump the whirlpool, zig-zag safe line, buoy word-checkpoints).

### 1 · SCENE & BACKDROP
`strait-shelf-backdrop.svg` (2048×1024 loop strip ×3 parallax): a narrow rock shelf hugging the right cliff of the strait. ABOVE: overhang shadow where the Claw nests — show pale scratch-gouges on the cliff (its strike history = readable telegraph zone). BELOW-LEFT: the sea surface torn into the Whirlpool's rim. All grey; wet shelf highlights in warm-grey `#B3A796`. Distant exit: a slot of pale light (goal read).

### 2 · CAST ON SCREEN
- `bizzy-run` (existing 4-frame) + existing duck/jump poses from the runner engine; add `bizzy-run-glance-up.svg` and `-glance-down.svg` single-frame heads (composited during telegraphs — she LOOKS at the danger before it strikes; kid-readable warning).
- Crew: not on field (they pole the raft in backdrop mid-layer, tiny, saturated). Rexy portrait cameo for runner-engine assist voice.

### 3 · SPRITES & ANIMATIONS
- **`strait-claw.svg`** (1024×1024): a colossal grey crab-claw on a gooseneck arm from the overhang. Per master spec: **strike anim 2-frame** — f1 cocked open (pincers wide, drip), f2 full slam-snap on the shelf (motion smear, rock chips). Plus separable `claw-telegraph` element: 3 pebbles falling + shadow blob (256×256, 2-frame) shown 0.8 s pre-strike.
- **`whirlpool-spiral.svg`** (768×768, 4-frame rotation loop): paper-sea spiraling into a throat; per-frame = 90° rotation of the spiral arms; center shows faint letters circling the drain (grey — words it has swallowed). Separable `whirlpool-surge` state: rim rises toward the shelf (the "jump now" telegraph), 2-frame.
- `strait-buoy.svg` (256×384, 2-frame bob): checkpoint buoy — the ONLY saturated field object: honey body, Deep stripe, a spell-word slate hung on it (Sono). States: waiting / banked (word stamped, small flag up).
- `shelf-crumble-tile.svg` (256×256, 3-frame): shelf edge tile that cracks/falls after claw hits (hazard variance).

### 4 · GAME-FIELD ASSETS
- Shelf tileset: `shelf-flat`, `shelf-gap`, `shelf-ramp`, `shelf-crumble` (256×256 each, torn-paper rock).
- Safe-line ribbon: faint honey dotted guide (assist mode only), `safe-line-dots.svg`.
- Checkpoint HUD: buoy pips ×N; word-card uses standard spell-card frame.
- `spray-splash.svg` (512×256, 3-frame) — grey foam burst for near-misses.

### 5 · STORYBOARD TABLEAUX
- `c21-tab-1-choice.svg` — raft halted at the fork: whirlpool left, claw-shadow right, the shelf a thread between; Bizzy pointing at the thread.
- `c21-tab-2-underclaw.svg` — low-angle: Bizzy mid-duck, the claw slamming a hand's-breadth above, honey wings flat, rock chips flying.
- `c21-tab-3-overpool.svg` — side-on: Bizzy mid-jump over the surging rim, swallowed grey letters circling below her saturated silhouette.
- `c21-tab-4-through.svg` — the exit slot of light; buoy flags up along the passed shelf; crew raft sliding through behind.

### 6 · FX & TRANSITIONS
Claw hit on shelf: screen-shake + rock-chip particle burst (grey). Buoy banked: local saturation bloom on the buoy + respell chime. Whirlpool near-miss: radial pull-blur one frame. Checkpoint restart: buoy flash, no death animation — Bizzy tumbles back to buoy (reuse tumble-land pose). Out: camera lifts from shelf to open water.

### 7 · AUDIO CUE SHEET
| id | speaker | line intent |
|---|---|---|
| c21-x1 | Bizzy | the plan — "there's a line between them; it just zig-zags" |
| c21-x2 | Rexy (kid-chain) | runner coaching cameo — duck/jump reminder |
| c21-x3 | Bizzy | mid-run gasp (near-miss bark, no words) |
| c21-x4 | Bumble | checkpoint cheer at each 3rd buoy |
| c21-x5 | Bizzy | exit line — breathing hard, laughing |
SFX: claw slam (deep clack + rumble) · pebble-tick telegraph · whirlpool churn loop (low swirl, letters whisper-gurgle) · buoy bell per checkpoint · shelf crumble. Sting: per-world 8-bar Grey Sea theme, percussive variant.

---

# CHAPTER 22 · THE SUNKEN LIBRARY
Engine: **WORD SAFARI** (word-search grid reuse). Odyssey beat: counsel from the departed. **Scopey far-sight debut.**

### 1 · SCENE & BACKDROP
`sunken-library-backdrop.svg` (2400×1350, layered): drowned shelf-stacks leaning like shipwrecks, books swollen and grey, letters drifting off pages like plankton (separable `letter-plankton` layer: tiny grey glyphs, 2-frame drift shimmer). Light: pale surface-glow from above; **ghost-lamp cyan `#B8E6F0`** pools where masters will appear. Sea-floor sand = un-inked paper pulp. The 8×8 search grid is diegetic: a great fallen CATALOG SLAB, its letters carved and barnacled.

### 2 · CAST ON SCREEN
- **Ghost-lamp spellmasters ×3 (NEW, per master: "generic robed silhouette ×3 variants")** — `ghost-master-a/b/c.svg` (768×1024 each): robed silhouettes of translucent lamp-cyan, no faces — each holds a lantern where the head-glow lives; identity via silhouette only: **A** tall/stooped with a quill-shaped staff · **B** round/kindly with an open-book lantern cage · **C** small/upright with a key-ring of tiny letters. 2-frame hover drift each; `speak` state = lantern flares + robe-hem letters brighten. They are memory, not ink: 60 % opacity, soft edge — the act's only non-crew light.
- **Scopey (special view, master §1.1):** `scopey-vision.svg` — telescope eye extended, projecting the **vision ring**: `scopey-vision-ring.svg` (1024×1024 UI frame) — a circular far-sight frame rimmed with brass ink-outline + focus ticks; interior shows keyed-in vision art. 2-frame: ring iris-open / steady shimmer. DEBUT here: the ring reveals Melody's cage being MOVED to the Engine (sets up Ch 24's gut-punch and Ch 26).
- Bizzy `bizzy-top` puck for grid tracing (existing); worried + determined portraits.
- `melody-captive` (existing special view) appears INSIDE the vision ring only.

### 3 · SPRITES & ANIMATIONS
- `old-word-reveal.svg` (per-word FX, 512×256, 3-frame): traced word's barnacles crack (f1), letters flood honey ink (f2), the word lifts off the slab as a glowing strip and arcs toward a lamp-pool (f3).
- `ghost-lamp-summon.svg` (768×1024, 4-frame): lamp-pool swirls (f1), robe silhouette condenses from letter-plankton (f2), lantern ignites (f3), settle-hover (f4). Reverse for dismiss.
- `letter-plankton.svg` (tile 512×512, 2-frame shimmer) — ambient drift layer, also parts around Bizzy's puck (engine masks).
- `catalog-slab-grid.svg` — the 8×8 grid frame (1400×1400): carved cells, Sono letters in weathered grey; FOUND letters re-ink to honey (per-cell `found` state).

### 4 · GAME-FIELD ASSETS
- Trace highlight: honey stroke with ink outline (engine standard), plus wrong-trace fizzle (grey bubble puff, 2-frame).
- Word list panel: `library-ledger.svg` (500×900) — a waterlogged ledger; each of the ten Old Words gets a lamp icon that lights when found.
- Counsel dialogue uses standard frame with ghost-master silhouette portraits (3 crops needed, 256×256).
- Echo power icon (hear-in-sentence) — existing.

### 5 · STORYBOARD TABLEAUX
- `c22-tab-1-descent.svg` — the crew raft above, Bizzy diving down a shaft of pale light toward the drowned stacks; plankton-letters parting around her (only saturation: her).
- `c22-tab-2-counsel.svg` — three lamp-glows in a half-circle around tiny Bizzy on the slab; found words hovering as honey strips between them.
- `c22-tab-3-visionring.svg` — Scopey's ring iris-open center-frame: inside, Melody's cage on a locust wagon rolling toward a machine skyline; crew faces ringed around the outside, lit by it.
- `c22-tab-4-gift.svg` — masters fading back to plankton, leaving the Tailwind Satchel's sister-gift: the tenth Old Word glowing in Bizzy's hands (see inconsistency log on satchel timing).

### 6 · FX & TRANSITIONS
Found word: `old-word-reveal` → `ghost-lamp-summon` chain (the chapter's loop IS the FX rhythm). Ten-lamp finale: all three masters + ten hovering words = the brightest frame of the act (still cyan/honey on grey — no world re-color). Vision ring: iris-wipe in/out. Chapter out: lamps gutter one by one; last light is Bizzy's own glow.

### 7 · AUDIO CUE SHEET (masters = am_adam, −5 % speed, + long soft hall; per-master pitch: A −1, B 0, C +2)
| id | speaker | line intent |
|---|---|---|
| c22-x1 | Bizzy | awe at the drowned stacks |
| c22-x2 | Master A | counsel 1 — on words outliving their speakers |
| c22-x3 | Master B | counsel 2 — on gentleness with mistakes |
| c22-x4 | Master C | counsel 3 — on the strait behind / road ahead |
| c22-x5–x11 | Masters (rotate) | one line per remaining Old Word found (7 slots) |
| c22-x12 | Scopey (am_adam professor chain) | far-sight narration — what the ring shows |
| c22-x13 | Bizzy | vow re: Melody, quiet |
| c22-x14 | Master B | parting gift line |
SFX: underwater hush bed · barnacle crack · lamp ignite (glass chime + breath) · plankton tinkle · vision-ring iris (brass slide). Sting: respell chime, submerged (low-pass) each found word.

---

# CHAPTER 23 · THE GOLDEN DEER — *True or Lure*
Engine: **STORM SORT → TRUE OR LURE** (sorter reuse). Ramayana beat: the golden lure that splits the party. Lesson: the prettiest are false.

### 1 · SCENE & BACKDROP
`forest-edge-grey.svg` (2400×1350, layered): the Grey Sea's far shore — a paper-forest edge, trunks like rolled un-inked scrolls, mist between. This is villain ground: still grey, but with counterfeit-gold `#E8C97A` glints hung in the mist like fishing lures (separable `lure-glint` layer). True clearings hold small honey wildflowers (separable, saturated — truth persists in patches). Two carved gate-arches frame the sort lanes.

### 2 · CAST ON SCREEN
- **Golden word-deer (NEW creature):** see sprites. Not a library character — a construct of the Unspelling wearing beauty; design law: gorgeous silhouette, WRONG on inspection (no ink outline, no shine highlight — the two sticker-style tells the whole app trains kids to read; its "gold" is the flat counterfeit `#E8C97A`).
- Crew: full raft party ashore; NEW pose `crew-lured-step.svg` guidance — reuse each avatar's cheer pose mirrored + head turned toward the deer (programmatic where possible; bespoke only for Bumble and Fawn, who step furthest). Fawn matters: a deer avatar watching a fake deer — stage her refusal (she KNOWS gaits; hers is real).
- Bizzy portraits: determined / worried; `bizzy-answer-step` reused at the gates.

### 3 · SPRITES & ANIMATIONS
- **`golden-word-deer.svg`** (1024×768): a deer whose body is cursive letterforms flowing into legs and antlers — the letters spell *almost*-words (bank of plausible misspellings supplied by app). States as sibling groups: **`leap`** 4-frame (gather / launch-stretch / apex with letter-mane streaming / land-melt into mist) · **`shimmer`** 2-frame overlay (counterfeit-gold glint sweep, deliberately TOO smooth — no sticker shine node) · **`reveal-as-fake`** 4-frame (f1 freeze mid-pose, glint dies · f2 letterforms unravel from the haunches like pulled thread · f3 the thread whips into a grey moth-scatter — callback to the Smudge · f4 empty mist + one falling flat-gold scrap). 
- `true-word-creature.svg` (768×512, 3-frame leap): the TRUE counterpart — smaller, plainer word-critters (correctly spelled words shaped as humble animals: honey/Deep, full ink outline + shine). Per-frame: crouch / leap / land-and-look-back. Plain but REAL is the visual thesis; make the true one lovable, not lesser.
- `lure-gate.svg` / `true-gate.svg` (512×768 each): sort gates — LURE gate ornate, counterfeit-gold filigree, slightly too symmetrical; TRUE gate rough honey wood, ink outline, a real wildflower at its foot. 2-frame accept-swing each; LURE gate's accept = a hungry snap.
- `fake-scrap.svg` (128×128) — the flat-gold scrap left after reveals; collects in a "lures caught" HUD jar.

### 4 · GAME-FIELD ASSETS
- Word banners: each creature carries its spelling on a flank-banner (Sono) — the READ is the gameplay; banner separable for difficulty modes (banner hidden = audio-only champ mode).
- `sort-lane-arrows.svg`, mist-speed lines, round pips as wildflower buds (bloom on clean rounds).
- Scripted-lure cutaway card: `party-split-marker.svg` — map chip showing Bumble's group peeling off (pre-boss story wiring into Ch 24).

### 5 · STORYBOARD TABLEAUX
- `c23-tab-1-firstsight.svg` — the deer's first leap across the full frame, crew silhouettes turning as one; Fawn alone unturned, ears back.
- `c23-tab-2-fawnknows.svg` — Fawn beside Bizzy, hoof planted: comparing frames — real deer-gait vs the too-smooth glide (small inset diagrams, kid-readable).
- `c23-tab-3-reveal.svg` — a caught lure mid-`reveal-as-fake` f3: moth-scatter erupting from the beautiful shape; crew recoil; true-word critters watching calmly from the honey clearing.
- `c23-tab-4-split.svg` — the scripted lure: a MASTERWORK deer (largest, most golden) bounding into the treeline with half the party chasing — Bumble front and center — while Bizzy shouts, arm out; storm-light on the horizon. Cliff-hanger frame into Ch 24.

### 6 · FX & TRANSITIONS
Correct sort into TRUE: saturation bloom + wildflower bud opens. Correct catch of a LURE: `reveal-as-fake` chain + moth-scatter (grey). Wrong sort: lure-gate snap + grey-creep pulse on HUD. Out-transition: the party-split — screen tears along the treeline (paper-rip wipe) as half the color exits frame right.

### 7 · AUDIO CUE SHEET
| id | speaker | line intent |
|---|---|---|
| c23-x1 | Bumble | wonder — "it's made of GOLD…" |
| c23-x2 | Fawn (kid-chain) | the tell — "real deer don't move like that" |
| c23-x3 | Bizzy | the rule — pretty isn't the same as true |
| c23-x4 | Bumble | mid-game, being fooled again (comic) |
| c23-x5 | Fawn | praise on a clean round |
| c23-x6 | Bizzy | the shout as the party splits — "BUMBLE, WAIT—" |
| c23-x7 | Vex (am_onyx, distant, off-screen) | one silken line riding the wind — he built the lure |
SFX: deer-chime gait (too regular — quantized bells) vs true-critter soft steps (humanized timing) — the AUDIO carries the same tell as the art · moth-scatter flutter · gate snap · paper-rip transition. Sting: siren-trio harmony reprise, one voice flat (Act III callback: same trick, new coat).

---

# CHAPTER 24 · BOSS — GNASH AND THE SENTENCE FIELDS
Engine: **SENTENCE FORGE** (idiom/phrase wrapper). Rescue: **Bumble freed; Melody already moved to the Engine** (per master Ch 24 — the vision from Ch 22 pays off cruelly).

### 1 · SCENE & BACKDROP
`locust-camp-backdrop.svg` (2400×1350, layered ×3 camps): the Sentence Fields — a harvested plain where sentences grew; now stripped stalk-rows of grey punctuation husks. Camp furniture: word-bale stacks (shredded idioms baled like hay), a forge-anvil where phrases are broken for parts (dull crimson coals = the only villain accent heat), watch-towers of stacked cage-crates. Sky: locust-swarm smudges. Patrol lanes readable as trampled paths. Deliver camps A/B/C as dress variants of one base.

### 2 · CAST ON SCREEN
- **GENERAL GNASH (master §1.2 — existing NEW-villain design, this act's showcase):** locust general, drill-sergeant posture, mandible underbite, sentence-fragments stuck in teeth. Views here: `gnash-stand.svg` (existing spec, 768×1024) · **`gnash-march.svg` sprite — 4-frame parade-stomp cycle (lead foot slam / weight-roll with swagger-stick swing / second slam / mandible-grind beat), side view 512×512/frame** · **`gnash-roar.svg` — NEW pose, 2-frame: f1 head back, mandibles wide, teeth-fragments rattling loose; f2 forward-lunge bellow with spit-fragments flying (they are literally bits of eaten sentences — legible scraps: "…once upon…", "…the end…")** · `gnash-defeated.svg` — swagger-stick snapped, a freed sentence-scrap fluttering off his tooth.
- **Cage states:** `word-cage.svg` (768×768) — a cage woven from bent, greyed letterforms (I-bars, O-rings, T-crossbeams). States: **`intact`** (letters locked, faint grey hum) / **`weakening`** (letters loosening as their name-word is spelled — per-letter unlock frames ×5) / **`broken`** (burst open, letterforms sprung straight and SATURATED — freed letters remember themselves). 
- **`bumble-caged.svg`** — Bumble behind letter-bars: gripping two bars, defiant grin (mirror Melody's captive attitude — this crew doesn't do helpless); `bumble-freed-burst.svg` — mid-tackle-hug at Bizzy, 100 % saturation.
- **The empty second cage** — `word-cage-empty.svg`: door hanging, one stage-ribbon of Melody's caught on a letter-bar (her saturated color note left behind). This prop IS the story beat.
- `locust-trooper` (existing 2-frame march) + patrol vision-cone glow (existing UI element). Vex: `vex-flight` cameo + cold-fury portrait for the refused-offer scene.

### 3 · SPRITES & ANIMATIONS
- **`idiom-scrap.svg` set** (12 pieces, ~256×96 each): torn phrase-fragments on grey paper — draggable word-pieces. States: `shredded` (grey, edges chewed) / `placed` (slot-snap, ink partially returns) / `forged` (full idiom re-lit honey/Deep with a sticker shine sweep). Deliver 3 decorative variants of tear-pattern so repeats don't twin.
- `forge-anvil.svg` (512×384, 2-frame): villain forge where phrases are broken — sparks DULL when breaking, BRIGHT honey when the player rebuilds on it (captured-tool-turned-good, 2 palette states).
- `patrol-timer-sweep.svg` — sweeping searchlight wedge (engine standard, grey-white).
- `name-spell-lock.svg` (768×256): the last-cage mechanic — B-U-M-B-L-E letter sockets on the cage door; per-letter fill state (freeing friends by spelling their NAMES, per engine spec).
- `swarm-curtain.svg` (2048×1024, 3-frame) — locust-swarm wall for camp transitions and Gnash's entrance.

### 4 · GAME-FIELD ASSETS
- Idiom slot-rack: `forge-rack.svg` (1400×400) — anvil-side rack with word-slots + missing-key-word spell socket.
- Camp progress: 3 tent-pips; stealth meter reuse from Ch 17 night-maze kit.
- Boss bar: ink-outline health bar with 3 camp-phase pips (UI chrome §5 standard).
- `rescue-key-icon.svg` — honey key formed from the letter B (Bumble's initial).

### 5 · STORYBOARD TABLEAUX
- `c24-tab-1-fields.svg` — the crew at the field's edge at dusk: stripped sentence-rows to the horizon, camp fires dull crimson, cage-towers silhouetted; Bumble's cage pin-lit far off.
- `c24-tab-2-gnash-inspection.svg` — Gnash marching the bale-rows (march cycle hero frame), troopers snapped to attention, a fresh idiom being fed to the forge; his teeth-fragments catching the coal light.
- `c24-tab-3-thebreak.svg` — the NAME beat: B-U-M-B-L-E sockets filling on the cage door, letterforms springing straight and saturating one by one, Bumble mid-burst-hug; Gnash's roar pose behind, too late.
- `c24-tab-4-emptycage.svg` — QUIET SHOT: Bizzy alone at the empty second cage, Melody's ribbon in her hand — the ribbon and Bizzy the only color in the frame. Scopey's ring glimmers faintly in the corner (the vision was true).
- `c24-tab-5-refusal.svg` — Vex descends on the swarm-curtain, the offer made and REFUSED: Bizzy's back to us, wings set; Vex's cold-fury portrait keyed above. Closing card carries his exit line into Act V.

### 6 · FX & TRANSITIONS
Forged idiom: shine-sweep + respell chime; camp cleared: swarm-curtain wipes to next camp. Gnash defeat: his stuck sentence-fragments pull FREE and fly to the rack (grey→honey mid-flight). Act-out transition: the empty-cage frame desaturates everything except the ribbon → smash to the Act V title card (mountain shrine silhouette). Award `story-gem-act4` wave-drop.

### 7 · AUDIO CUE SHEET (Gnash = am_onyx, pitch −1, distortion clip, snare-tight gate)
| id | speaker | line intent |
|---|---|---|
| c24-x1 | Gnash | camp address — sentences are RATIONS, troopers |
| c24-x2 | Bizzy | stealth brief to crew |
| c24-x3 | Gnash | mid-camp bark on the patrol sweep |
| c24-x4 | Bumble | from the cage — cracking jokes at his guards |
| c24-x5 | Bizzy | spelling his name aloud, letter by letter (B… U… M…) |
| c24-x6 | Bumble | the freed tackle-hug — "took you long enough!" |
| c24-x7 | Gnash | the roar — discovery |
| c24-x8 | Bizzy | at the empty cage — "…where is she." (flat, small) |
| c24-x9 | Gnash | gloat: she's gone to the Engine |
| c24-x10 | Vex (am_onyx villain chain) | the offer, silk over steel |
| c24-x11 | Bizzy | the refusal |
| c24-x12 | Vex | exit: "Then watch the last word die." |
SFX: locust-swarm bed · forge clank (dull vs bright variants) · cage-letter sproing per freed bar · march stomp (syncs `gnash-march` f1/f3) · ribbon flutter (near-silence under c24-x8). Sting: Vex motif (elegant minor 4-note) under x10–x12; Unspelling drone swells into the act-out.

---

## DELIVERY NOTES
- All files SVG, layered, sprite frames as sibling groups `f1…fN` (master §7); px sizes above are viewBox targets @1x — export sheets @2x where PNG fallback is requested.
- Priority per master §7: this act is **P2** — Grey Sea suite (Gatekeeper, strait, library, deer) leads; Ch 24 camp set can trail with Act V batch 1.
- Grey discipline QA: run every Act IV frame through the "saturation census" — if anything saturated is NOT crew / true word / villain accent / ghost-lamp cyan, it is a bug.

## INCONSISTENCY LOG (found while drafting — flagged, not resolved here; master brief treated as law throughout)
1. **QUEST-SAGA-DESIGN.md is the older 30-chapter/5-act plan.** Its Act IV (19–24: Wildhearts/Elements/Legends/Turbo/Vault/Gnash) does not match the master's 36-chapter Act IV at all. This brief follows the master; QUEST was used for engine mechanics only (Word Safari, Storm Sort, Dino Dash, Sentence Forge, trivia bank).
2. **Ch 24 rescue outcome conflicts:** QUEST Ch 24 frees "Bumble & Melody"; master Ch 24 (and Ch 17→34 arc) frees Bumble only, Melody moved to the Engine. Master followed — hence the empty-cage beat.
3. **Satchel-gift timing:** master Ch 20 calls the satchel "the Sunken Library's gift," but the Library is Ch 22 — the gift precedes the visit. Staged here as a ghost-master appearing ahead of the Library (c20-x1, c22-tab-4 sister-gift); a one-line story fix in the master would clean this up.
4. **Scopey is not in the §1.1 crew list** yet has a special view (`scopey-vision`), a §8 voice, and the Ch 22 debut. Assumed a valid library character; crew list likely just omits him.
5. **Master §1.1 karts note says "(Ch 22, 25, 32)"** — in the 36-chapter numbering, Ch 22 is the Sunken Library and Ch 25 is Tapasya; neither uses karts. Looks like stale 30-chapter numbering (karts were old Ch 22/25); true kart chapter is 32.
6. **No §8 voice row exists for the ghost-lamp spellmasters.** This brief assigns am_adam (professor chain) with per-master pitch offsets — needs a master-brief ratification line.
