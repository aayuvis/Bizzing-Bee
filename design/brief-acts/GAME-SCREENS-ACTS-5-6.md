# GAME SCREEN VISUAL BRIEF — ACTS V–VI + SIDE ROADS
### "Bizzy and the Great Unspelling" · the COMPOSED screens — what the player actually sees
*Complements the per-act asset briefs (DESIGN-BRIEF-ACT-5/6.md): those list parts; this specifies assemblies. Master art direction (CLAUDE-DESIGN-BRIEF-SAGA.md §0) is LAW: squircle sticker characters, ink outlines, duotone shading; Fraunces/Hanken Grotesk/Sono only. Honey `#F0B429` · Deep `#4A32A8` · Villain crimson `#C43D5A`. **Grey `#A39B8E` appears ONLY as unspelling — never as neutral UI chrome.** Finale screens show restoration, never destruction.*

**Global screen laws (apply to every game below):**
- Landscape 16:9 is the design master; portrait 9:16 restacks (playfield keeps ≥60% of height, HUD collapses to top strip + bottom input). Safe margins 4% all edges.
- HUD chrome is Honey/Deep sticker panels on soft drop shadows; input line always Sono; never place UI text over grey backdrop zones without a Deep scrim squircle.
- Every screenshot filename below is a composed key-mock deliverable at 1920×1080 (landscape master).

---

## 1 · VAULT LOCKS / TAPASYA (Ch 25 — championship spelling shrine)

### 1.1 SCREEN COMPOSITION
```
LANDSCAPE (playfield 55% ctr)          PORTRAIT
┌────────────────────────────────┐     ┌──────────────┐
│ NIGHT 3 ◐   [🔓🔓🔒🔒🔒] rail  │     │ NIGHT ◐ rail │
│  snow / shrine backdrop        │     │  shrine      │
│   ┌──────────────────────┐     │     │ ┌──────────┐ │
│   │  STONE LOCK PANEL    │     │     │ │ LOCK     │ │
│   │  seal · word · input │     │     │ │ PANEL    │ │
│   └──────────────────────┘     │     │ └──────────┘ │
│ bizzy-meditate ⌂brazier  seals │     │ input / kbd  │
└────────────────────────────────┘     └──────────────┘
```
Lock panel = 720×480 stone+paper squircle, dead center. Five-lock rail top-center; night chip top-left (Fraunces). Bizzy meditates lower-left in the brazier's Honey pool; altar with seal sockets lower-right. No timer — pressure is the mountain, not a clock.

### 1.2 THE FIVE MOMENTS
- `screen-tapasya-a` — Night 1: 80% cold blue frame, lock panel lit only by brazier spill, all five rail locks sealed, snow falling through the UI gaps.
- `screen-tapasya-b` — Mid-dictation: word chip "silent letters" glowing on the panel, typed letters landing as chiseled stone glyphs; Bizzy's breath-cloud visible.
- `screen-tapasya-c` — Lock 3 turning: dial mid-spin (f3), Honey cracks racing across the silent-K seal in `forging`; snow steaming where the light lands.
- `screen-tapasya-d` — Seal burst: radial Honey shockwave washing the whole panel, seal medallion flying to its altar socket, rail lock popping open.
- `screen-tapasya-e` — Night 5 complete: all five seals ringed around Bizzy, the only warm-dominant frame; UI chrome faded to 40% to let the tableau breathe.

### 1.3 JUICE SPEC
- Keystroke: stone-chisel tick, 40ms glyph pop (scale 1.0→1.12→1.0). Correct word: dial turn 600ms with 4 tumbler clicks at 150ms intervals.
- Seal forge: cracks spread 900ms → burst flash 120ms white → shockwave ring 400ms → medallion arc-flight to socket 500ms ease-in. Chime = one scale step higher per night.
- Miss: dial shudders 200ms (2px), NO grey — snow flurry gust instead; word re-queued.

### 1.4 PHASES — five nights: identical layout, moon phase advances, valley grey creeps one ridge higher per night in the backdrop (stakes without mechanics).
### 1.5 READABILITY — snow particles never cross the lock panel; input glyphs min 48px Sono; brazier light guarantees 7:1 contrast on panel text; grey exists only in the distant valley band.

---

## 2 · THE GREAT LEAP (Ch 26 — charge-and-release + letter-ring flight)

### 2.1 SCREEN COMPOSITION
```
LANDSCAPE — charge (playfield 100%)    LANDSCAPE — flight (100%)
┌────────────────────────────────┐     ┌────────────────────────────────┐
│      ···charge arc UI···  ENGINE│     │ M-E-L-O-D-Y tally    wind flag │
│     ··          ··       (far) │     │      ◯   ◯  ◯ letter-rings     │
│   ··   grey sea waves          │     │  ✦bizzy-stretch→   ◯           │
│ ▲bizzy-charge  [CHARGE █▒▒]    │     │  honey wake re-inks sea below  │
└────────────────────────────────┘     └────────────────────────────────┘
```
Portrait: arc curves steeper; charge meter becomes a bottom thumb-zone honeycomb column; flight camera pulls wider (rings enter from top-right). HUD: letters-delivered tally top-left (Melody's message, letters unlit until threaded), wind flag top-right, charge meter bottom-left only during charge.

### 2.2 THE FIVE MOMENTS
- `screen-leap-a` — Cliff dawn: Bizzy tiny lower-left, Engine a spike on the horizon, dotted arc preview blazing across the whole sky; Hoppy mid-bound cameo.
- `screen-leap-b` — Full charge: bizzy-leap `charge` trembling, meter in the perfect-window pulse, arc tip kissing the Engine; overcharge zone showing crimson.
- `screen-leap-c` — Apex: the poster screen — `stretch` pose dead center, letter-rings receding in perspective, three letters already lit in the tally, Honey wake stripe on the grey sea.
- `screen-leap-d` — Ring threaded: ring bursting to sparkle around Bizzy, its letter arcing up into the tally slot; a missed ring behind fading grey and sinking.
- `screen-leap-e` — Burning bright: escape phase, flame-aura Bizzy erupting from the chimney, static-sprite blips scattering, altitude ribbon right edge, Melody's fist at the porthole.

### 2.3 JUICE SPEC
- Charge: meter fill hum-riser; perfect-window = 3 pulses at 400ms; release = 2px shake + wind-streak burst 250ms + arc UI shatters to sparks.
- Ring thread: 80ms white pop → sparkle ring 300ms → letter flight to tally 450ms with pentatonic chime (ascending per ring). Miss: ring greys over 600ms and sinks — quiet, no sting.
- Landing: quality star-burst 1–3 stars, 500ms; tumble dust puff. Escape ignition: 1-frame white flash → aura fade-in 300ms, Honey/white only.

### 2.4 PHASES — 1 charge → 2 steered flight (rings) → 3 landing grade → 4 scripted escape flight (no fail; static blips are dodged for style points).
### 2.5 READABILITY — the sea is the ONE full-grey field in Act V; Bizzy + rings carry all saturation, so nothing else on screen may be Honey during flight; ring letters 64px Sono; wake stripe stays below the flight line, never behind rings.

---

## 3 · BRIDGE OF NAMES (Ch 27 — cooperative build medley)

### 3.1 SCREEN COMPOSITION
```
LANDSCAPE (challenge card 40% left · bridge stage 60% right)
┌────────────────────────────────────────┐   PORTRAIT: card on top half,
│ round 7/15 ⏳hourglass   friend inbound │   bridge pans beneath, socket
│ ┌────────────┐   ~~~ friend flying ~~~ │   strip stays bottom-pinned.
│ │ BLUEPRINT  │   🌊 grey sea → Engine  │
│ │ CARD spell │   ▓▓▓▓▓░░░ bridge grows │
│ └────────────┘  [◆◆◆◆◆◆◆░░░░░░░░] 15   │
└────────────────────────────────────────┘
```
Blueprint-scroll challenge card left; live bridge scene right (camera pans as span grows). Bridge progress bar IS the bridge: 15-socket mini-strip along the bottom filling with emblems. Honey hourglass 48px on the card. Shore crowd (full-color 60% avatars) bottom-left corner strip.

### 3.2 THE FIVE MOMENTS
- `screen-bridge-a` — Round 1: empty gold-dashed sockets across grey water, Bumble hovering with stone overhead, spell card live, whole army banners at the left edge.
- `screen-bridge-b` — Stone set: splash-of-color shockwave in the sea, hive emblem stamp-glow, one socket filled, sea band re-colored one stone wide.
- `screen-bridge-c` — Mid-span (stone 8): Maestro's stone, strings-enter beat; camera panned to open water, bridge trailing back to a now-half-colored sea.
- `screen-bridge-d` — Bucket brigade: three friends criss-crossing the sky with stones on accent-color trails while the current card runs — cooperative chaos, readable.
- `screen-bridge-e` — Stone 15: Rally's comedy kart-drop clicking in; full causeway shore-to-Engine, cast on the bridge, Engine grey ahead — brave, not triumphant.

### 3.3 JUICE SPEC
- Round win: card stamps "NAMED!" 150ms punch-in → summoned friend streaks in on world-accent trail 700ms → hover 300ms → stone drop 400ms → splash shockwave ring 500ms → emblem stamp 1-frame white pop + glow.
- Stone thunk-chord: thunk + its melody note sustains (15-note Setu line assembling); socket chip flips emblem-side 200ms.
- Timer-out: hourglass flips, stone stays airborne (friend circles), card re-deals — no stone is ever lost.

### 3.4 PHASES — 15 rounds in 3 camera legs (shore / open water / Engine approach); challenge mix rotates spell→unscramble→sort→type; rounds shorten 30s→20s.
### 3.5 READABILITY — one flying friend max in the card's airspace; sea re-color bands stay behind the socket strip; emblem chips 40px min; card text never overlaps the pan.

---

## 4 · CHAKRAVYUHA (Ch 28 — spiral maze with entry-path preview)

### 4.1 SCREEN COMPOSITION
```
LANDSCAPE (top-down maze 80%)          PORTRAIT
┌────────────────────────────────┐     ┌──────────────┐
│ 🧵beads ●●●○○        alert 👁  │     │ beads · eye  │
│    ╭─────── spiral ───────╮    │     │   spiral     │
│    │  ╭─ rotating rings ─╮│    │     │   (fills     │
│    │  │  ❀gates  ♥core  ││    │     │    width)    │
│    ╰──╰──────────────────╯╯    │     │ gate card ↓  │
│  [gate challenge card slides ↑]│     └──────────────┘
└────────────────────────────────┘
```
Full-frame top-down spiral, Bizzy a gold hover-puck; camera leads her inward. Thread-spool recall HUD (5 beads) top-left; crimson alert eye top-right. Petal-gate challenge cards slide up from bottom edge as machine-permits (grey card + crimson stamp — permitted grey: it's the enemy's paperwork).

### 4.2 THE FIVE MOMENTS
- `screen-chakravyuha-a` — Entry preview: whole spiral revealed, golden thread animating the once-only route, letter-beads at decision forks; Bizzy waiting at the mouth.
- `screen-chakravyuha-b` — Thread fading: route evaporating into letter-sparks, 3 dim breadcrumbs left; first petal gate blossoming open ahead.
- `screen-chakravyuha-c` — Deep in: rings visibly counter-rotating, searchlight cones sweeping, a gate irising SEALED behind Bizzy — crimson seam glow, no way back.
- `screen-chakravyuha-d` — The trap: heart chamber, bizzy-top-caught in the sprung petal-cage, three cones converging; her glow tiny but unbroken.
- `screen-chakravyuha-e` — The breach: six simultaneous wall-bursts, color pouring IN through the gaps, crew silhouettes rimmed in world accents, Rexy mid-smash.

### 4.3 JUICE SPEC
- Gate open: petal blossom f1–f3 at 120ms/frame + hydraulic sigh. Gate seal: clang flash 80ms + 3px shake + crimson seam pulse ×2.
- Correct gate word: permit card burns away in Honey 300ms. Wrong: crimson stamp SLAM 100ms, alert eye ticks up, gate stays shut, retry immediate.
- Spotted: cone snaps crimson 100ms, heartbeat vignette 2 pulses; Bizzy scurry-reset to last gate (800ms, comic not punitive).
- Breach: six staggered percussion bursts 150ms apart, saturation floods through gaps (inverse grey-creep masks).

### 4.4 PHASES — 1 preview (Simon-style, input locked) → 2 run-in through 7 rings → 3 scripted trap (controls fade out) → 4 breach cutscene-in-engine → 5 walk-out together, gates shattered.
### 4.5 READABILITY — maze is native grey by law, so Bizzy/thread/UI own ALL saturation; puck never smaller than 40px; sealed vs open gates differ by shape AND color (crimson seam vs open aperture); cones at 30% opacity max over paths.

---

## 5 · REFLECTION (Ch 29 — ten-lantern counsel · deliberately calm)

### 5.1 SCREEN COMPOSITION
```
LANDSCAPE (one still scene, 100%)      PORTRAIT: lantern line arcs over
┌────────────────────────────────┐     the top third; card floats
│   lantern line ◯◯◯●●  (tree)   │     lower-center; figures anchored
│  engine blur, out of focus     │     bottom. Nothing moves fast.
│ 🐼sensei  🐝bizzy   [campfire]  │
│   ┌─ counsel card: hear·mean·spell ─┐
│   └──────── no timer ────────────┘  │
└────────────────────────────────┘
```
The scene IS the screen: night camp, ten hanging lanterns across the tree, Sensei + Bizzy seated left-of-center. Parchment counsel card lower-third (speaker icon → meaning line → input). NO timer, NO score, NO streak meter anywhere. Progress = the lantern line itself.

### 5.2 THE FIVE MOMENTS
- `screen-reflection-a` — Near-dark: 90% black frame, unlit lantern line barely traced, match-strike about to touch lantern 1; card glows faint.
- `screen-reflection-b` — Word 2 "MERCY": kindling bloom mid-frame f2, letters drifting up from the lantern as motes; two faces now visible in the pool of light.
- `screen-reflection-c` — Glitch intercut: cold static-blue letterbox strip sliding in over the warm scene between words, doubtful portrait, lantern glow just touching the strip's edge.
- `screen-reflection-d` — Word 7: seven pools of amber overlapping, sleeping crew shapes emerging at the frame edges — the light finds them.
- `screen-reflection-e` — Ten lit: whole camp golden, Bizzy asleep at Sensei's side, card dissolved away entirely; hold.

### 5.3 JUICE SPEC (anti-juice — nothing snaps)
- Every transition ≥600ms ease-out. Keystroke: soft kalimma-pluck, letter fades in 200ms, no pop scaling.
- Correct: lantern kindles f1–f3 over 900ms, one held tone joins the ten-tone chord, letter-motes rise 2s.
- Miss: nothing dims. Card exhales (2% scale, 800ms), Sensei re-reads. Silence is the feedback.
- Glitch strips: 2-frame static shiver in/out — the only harsh cut, ≤300ms, music drops to bit-crushed room tone.

### 5.4 PHASES — none. Ten words, one lighting arc, three intercuts (after words 3/6/9). Deliberately phase-free.
### 5.5 READABILITY — text only inside the lantern-lit card (7:1 on parchment); grey `#A39B8E` limited to the horizon seam; UI chrome shrinks to the card + nothing; input font 56px (biggest of the saga — this word matters).

---

## 6 · TYPE-STORM SIEGE — THE STATIC (Ch 30)

### 6.1 SCREEN COMPOSITION
```
LANDSCAPE (battlefield 70% / input 15%) PORTRAIT: boss upper 45%,
┌────────────────────────────────┐      missiles funnel to a narrow
│ ☁☁ wave pips   BOSS BAR ▰▰▰▱  │      mid lane, input+staging
│   THE STATIC across the gates  │      docked above keyboard.
│  ⟪word missiles incoming⟫      │
│ 🐝quill-up  banners | crew edge │
│ [ staging row ] [ INPUT_____ ] │
└────────────────────────────────┘
```
Static's screen-ghost face spans the gates upper-half; word-missiles arc down spawn rails toward Bizzy lower-left. Boss bar with 3 phase pips top-center; wave pips (storm clouds) top-left. Bottom strip: unscramble staging row + Sono input line. Crew banners intrude full-color at frame edges — the army stays visible ALL fight.

### 6.2 THE FIVE MOMENTS
- `screen-typestorm-a` — Wave 1: three missiles mid-arc in static shells, first shell cracked showing gold reordering letters; gates intact, Static idle-shimmering.
- `screen-typestorm-b` — Scream telegraph: face folding inward, crown letters rattling, crimson vignette pulsing at edges, input line still calm and readable.
- `screen-typestorm-c` — Scream release: full noise-cone vs Bizzy's braced quill-wedge, banners blown horizontal, typed word half-entered — the player types THROUGH the scream.
- `screen-typestorm-d` — Inversion phase: whole screen color-negative EXCEPT Bizzy and the input strip (heroes keep their palette); reversed-order chip (mirrored arrow) glowing by the staging row.
- `screen-typestorm-e` — Shutoff: Static collapsing to a scanline dot between letter-shaped fissures leaking white-gold; one door falling; crew mid-cheer at edges.

### 6.3 JUICE SPEC
- Type-hit: letter zaps missile segment 60ms flash; word complete = shell burst 250ms + gold trail suck toward gates (your words attack the doors).
- Unscramble-snap: staging tiles flip-sort 300ms with gold trail. Scream: 4px shake bursts ≤1s, chromatic edge jitter — input strip is exempt from ALL shake (typing games protect the type).
- Gate cracks: each wave cleared etches one letter-shaped fissure with 400ms light bleed.
- Inversion flip: 2-frame invert flash, then stable held mask; audio motif plays reversed.

### 6.4 PHASES — 1 word waves (gates-intact) → 2 scream barrages between waves (gates-cracking) → 3 inversion + reversed word order (gates-falling). Boss bar pips mark each.
### 6.5 READABILITY — missiles carry max 1 word each, 5 concurrent cap; missile letters 44px min on Deep scrim; inversion mask NEVER touches staging/input; crimson telegraphs always 600ms before impact.

---

## 7 · TEN HEADS (Ch 31 — multi-mode boss; the screen re-skins per head)

### 7.1 SCREEN COMPOSITION
```
LANDSCAPE (tower 45% right · duel plate 55% lower-left)
┌────────────────────────────────┐     PORTRAIT: tower compresses to
│ BOSS BAR ●●●●●●●●●●(+?)        │     upper third (active head only
│ scopey-vision strip (between)  │     + stump count chips); duel
│ ally cameo ▣   ⚙TOWER          │     plate fills lower two-thirds.
│ ┌ per-mode duel plate ┐ heads↑ │
│ └ head close-up ▣ · field ────┘│
└────────────────────────────────┘
```
Word-Eater tower right, ten necks fanned; active head lunges toward the lower-left duel plate (1920×360 lower-third) which RE-SKINS per mode: the plate borrows that engine's existing field kit re-tinted Engine-grey, head close-up docked left, ally cameo docked right. Boss bar: 10 head pips + hidden 11th appearing after nine fall. Between duels the Scopey vision strip letterboxes across mid-frame.

### 7.2 THE FIVE MOMENTS
- `screen-tenheads-a` — Tower wakes: ten necks unfurled in silhouette, letter-stream reversing into the hopper; boss bar filling pip by pip.
- `screen-tenheads-b` — Spell duel: head-01 dictionary-jaw snapping at the plate, Bumble cameo cheering, dictation input mid-word; other nine necks swaying back.
- `screen-tenheads-c` — Regrow horror: a severed stump steaming grey, wireframe head sketching itself back (f2) while the player fights head-06's metronome strobe — the both-at-once screen.
- `screen-tenheads-d` — Vision interlude: Scopey's telescope-ring letterbox showing the bridge holding, battle vignette warm-rimmed; tower dimmed behind, breath moment.
- `screen-tenheads-e` — The sad head: nine capped stumps, hatch open, small grey core head looking up; duel plate swapped for a single soft dictation line; crew frozen mid-cheer.

### 7.3 JUICE SPEC
- Head strike telegraph: neck rear-back 400ms + mode-glyph flash; plate skin-swap = 300ms shutter-wipe in the head's filter-look (scanline for keyboard-teeth, strobe pulse for metronome…).
- Duel win: severed poof — grey ink-cloud + letters spiraling upward 600ms, stump valve caps with a clank; pip dims.
- Regrow (on a failed duel elsewhere): 0.8s drone stab, grey-first fill f1–f4 — deliberately WRONG-feeling against the color law.
- Core release: no burst — the head exhales letters upward 1.2s, closes its eyes; respell chime at half speed; 300px floor ring un-greys.

### 7.4 PHASES — ten 30–45s duels in fixed order (spell→unscramble→trivia→idiom→type→rhythm→sort→ladder→memory→wordle), Scopey visions after 3/6/9, then the core dictation. Each duel = full plate re-skin + ally swap + per-head signature look.
### 7.5 READABILITY — only ONE head animates during a duel (others idle-sway at 50% opacity); the plate's mode chip always names the rules in Hanken; the 11th pip is invisible, not greyed, until earned; core head scene strips ALL hud except the input.

---

## 8 · FACE-OFF PART I (Ch 32 — scripted defeat)

### 8.1 SCREEN COMPOSITION
```
CHARGE (racer, field 85%)   HALLS (flappy, 90%)   DUEL (spell UI)
┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│ grey-creep chases→│   │ girders ▚  ▞ dust │   │ VEX ▰▰▰▰ (never   │
│ 🏎🏎🐝🏎🏎 5 karts  │   │  🐝  honey shafts │   │  drops)   drops)  │
│ banners fall ⚑    │   │  ash-letters ❆    │   │ [input losing     │
└───────────────────┘   └───────────────────┘   │  letters...]      │
Portrait: same stack, karts single-file, duel unchanged.        └──┘
```
Three consecutive screen grammars the player already knows — racer strip, flappy halls, spell-duel — each subtly WRONG: grey-creep gains on the karts, honey light-shafts are the only guides in the halls, and the duel's Vex health pips never decrease (the tell). UI chrome itself desaturates as the sequence progresses — the only chapter allowed to grey the chrome.

### 8.2 THE FIVE MOMENTS (the defeat sequence IS the five moments)
- `screen-faceoff1-a` — The charge: five karts abreast cresting the ridge, army roaring behind, gates ahead — the last full-color gameplay frame; grey-creep already eating the track's left edge.
- `screen-faceoff1-b` — Collapsing halls: Bizzy's flight line threading girder gaps, ash-letters streaking like snow, honey shafts marking a safe line that keeps narrowing.
- `screen-faceoff1-c` — The unwinnable duel: Vex casting, letters greying as they leave his hand; the player's typed word desaturating and drifting up off the input line inches from him; his pips untouched.
- `screen-faceoff1-d` — The fades: portrait-fade grid 6×7 over the dimming core chamber, tiles greying in reverse-recruitment order 0.4s apart, accelerating; Bumble's tile last and still lit; UI at 20% saturation.
- `screen-faceoff1-e` — Black card: `#0E0C14`, Fraunces italic *"to be continued…"* in 30% grey, nothing else; held 3s. (Post-card app copy reassures: the loss is story; stars still awarded.)

### 8.3 JUICE SPEC
- Charge: normal racer juice at 80% intensity, decaying — drift sparks lose particles wave by wave; banner-fall obstacles thud soft, not crunchy.
- Halls: flap feedback intact but wind audio thins; each near-miss dims one HUD element 10%.
- Futility shader: each typed letter desaturates + floats off over 300ms — input FEELS responsive, results betray it; keystroke clicks stay crisp (agency to the last).
- Fades: one instrument drops from the mix per greyed portrait; 2s total silence before the card text lands. Cut to black: 12-frame iris from Bizzy's eye highlight.

### 8.4 PHASES — 1 kart charge 60s (soft hazards, unlosable) → 2 halls flight 90s (unlosable, checkpointed) → 3 duel (unwinnable, 3 casts then the trigger) → 4 fade grid → 5 black card. Player skill changes flavor, never outcome — never punish, never fake-fail them either: no "MISS" labels anywhere.
### 8.5 READABILITY — the wrongness must be legible, not confusing: grey-creep always enters from screen-left (the direction they came from); Vex pips visibly flash-and-hold on hits so the tell reads as story, not bug; the fade grid keeps names under tiles until the moment each greys.

---

## 9 · BOW OF SPELLING (Ch 33 — recognition dictation)

### 9.1 SCREEN COMPOSITION
```
LANDSCAPE (hall tableau 100%, UI floats)   PORTRAIT: witness row 2×3
┌────────────────────────────────┐         above the bow; input docked
│ witness row 👤👤👤👤👤👤 (grey)  │         bottom; plinth light state
│    grey hive court · crowd     │         top corner.
│      🏹 BOW on plinth (lit)    │
│  🐝    [astra seals ◈◈◇◇◇]     │
│  [ dictation input ____ ] 🔆    │
└────────────────────────────────┘
```
The Bow center-stage on its plinth in the single light shaft; grey crowd ringed behind in ≥6 concentric rings. Witness row (grey crowd portraits) replaces the streak meter top-center. Astra seal strip (5 slots, ch25 art) mid-right. Ribbon progress = the bow itself — no bar. Plinth light indicator bottom-right (3 dim steps = miss penalty; the crowd NEVER dims).

### 9.2 THE FIVE MOMENTS
- `screen-bow-a` — Nobody knows her: Bizzy small at the hall doors, all-grey crowd, blank comb-labels; the Bow a slack coil of jumbled grey letters on the plinth.
- `screen-bow-b` — First Astra word: dictation playing (speaker glyph pulsing), typed word complete, silent-K seal clicking onto the ribbon, one run of ribbon letters re-coloring taut.
- `screen-bow-c` — A miss: plinth light stepped down one notch, shadows longer, crowd unchanged — private failure, public grace; retry prompt gentle.
- `screen-bow-d` — Fifth word strung: bow-strung f7 humming, all five seals lit on the string, the hall holding its breath — the darkest-before frame.
- `screen-bow-e` — It sings her name: B-I-Z-Z-Y standing-wave rippling the string, recognition wave rolling through crowd rings 1→3, Bumble's face flooding color FIRST; her wing-name relighting letter by letter.

### 9.3 JUICE SPEC
- Dictation: word audio pure af_heart; replay button pulse every 4s idle.
- Correct: harp pluck (ascending, one per Astra word) → seal arc-flight to ribbon 500ms → ribbon-letter re-color run 800ms left-to-right → tension creak.
- Miss: plinth light dims 400ms, low woodwind breath — no buzzer, no red, crowd static.
- The singing: 3s glissando, everything else tacet; name-wave oscillation 3 frames looped; recognition wave = radial re-color bloom hopping rings at 0.5s intervals, each ring playing blink→sharpen→color-flood; crowd murmur swells per ring.

### 9.4 PHASES — 1 approach (no UI) → 2 five dictation words (bow-stringing f2–f6, one tightening step each) → 3 the draw (auto) → 4 recognition wave (playable camera drift only).
### 9.5 READABILITY — this screen is 80% grey by design, so the light shaft + bow carry all warmth; input floats on a Deep scrim; witness portraits stay 96px so their later re-coloring in ch34 callbacks reads; never show a retry counter.

---

## 10 · THE RESPELLING (Ch 34 — medley with per-friend respell bursts)

### 10.1 SCREEN COMPOSITION
```
LANDSCAPE (void stage 75% · tracker 10% · beat chips)
┌────────────────────────────────┐    PORTRAIT: tracker becomes a
│ beat chips ▣▣▢▢▢▢  41-tracker  │    2-row scroll strip; wedges
│  ▒void▒  [current beat's      │    assemble radially around a
│ wedge│ engine field on the     │    smaller platform.
│ wedge│ warm platform ]  🐝     │
│ [ input / engine controls ]    │
└────────────────────────────────┘
```
Void stage: near-black paper-grain with drifting dead letters; one warm platform hosts the CURRENT beat's engine field (maze/flight/race/Simon/slice/quiz kits, floor only — no backdrops until wedges arrive). Six beat chips top-left; 41-slot friend tracker (tiny grey squircle portraits filling to color, left→right) top-right. Restored world-wedges accumulate around the frame edges like dawn.

### 10.2 THE FIVE MOMENTS
- `screen-respelling-a` — One light: Bizzy alone on the platform, quill glowing, 41 grey tracker slots, maze beat kit materializing — the inverse of the ch32 black card.
- `screen-respelling-b` — First name back: Bumble's respell burst at full f4 color-flood, his tracker slot igniting, hive wedge sliding in saturating; Bizzy laugh-crying portrait chip.
- `screen-respelling-c` — Mid-medley: race beat running while THREE fresh friends cheer from their new wedges; tracker half-lit; void motes converting to accent-colored fireflies.
- `screen-respelling-d` — The plea: gameplay paused-in-place; Pixel Pal at the platform edge, hand out to a hunched static silhouette; 40 lit slots, one grey; the whole cast leaning in.
- `screen-respelling-e` — Forty-one: F-R-I-E-N-D landing, Glitch's burst playing CLEAN, true pixel eye returning; full wedge-ring world assembled; tutti frame.

### 10.3 JUICE SPEC — **the respell burst (template, played 41 times — it must never get old):**
- f1 grey outline sketches in (200ms, pencil scratch) → f2 NAME letters orbit (400ms, per-letter chimes) → f3 letters slam inward (120ms, bass thump + 3px shake) → f4 color floods top-down (350ms, that world's accent) → f5 cheer-pose pop + accent sparkle ring (300ms) + that friend's 8-bar theme sting stinger-note.
- Anti-fatigue: chime pitch rises a semitone every 8 friends; burst scale varies ±10% by character size; every 5th respell adds a firefly-conversion flourish; Glitch's burst = bit-crushed false-start chime, 500ms hold, then the clean chime — the only modified burst.
- Between beats: engine-kit swap via 400ms Honey shutter-wipe; wedge arrival = slide-and-saturate 600ms.

### 10.4 PHASES — six beats (maze 4 / flight 7 / race 5 / Simon 5 / slice 6 / quiz 13) then the scripted plea + final word. Difficulty stays LIGHT versions — this chapter is a victory lap with stakes, not a gauntlet.
### 10.5 READABILITY — max one respell burst at a time (queue them); tracker slots 32px min; the void's grey is villain-grey and shrinks measurably every beat — by the quiz beat the frame is ≥60% color.

---

## 11 · TRIAL OF FIRE (Ch 35 — ten fire rings + panorama re-color duel)

### 11.1 SCREEN COMPOSITION
```
LANDSCAPE (duel 55% · panorama strip 25% · input 15%)
┌────────────────────────────────┐    PORTRAIT: ring rack arcs over
│ ring rack ◉◉◉◎◎◎◎◎◎◎ (mirrors) │    the duel; panorama becomes a
│  🐝 quill      rings     VEX   │    swipeable strip above the
│   ═══ shallow arc of fire ═══  │    input; Vex upper-right.
│ [ PANORAMA live strip 10 panels]│
│ [ dictation input ________ ]   │
└────────────────────────────────┘
```
Bizzy left, Vex right, ten fire rings in a shallow arc between them; behind Vex the wall-sized Panorama. The mural IS the progress bar: a live 10-panel strip previews above the input, each panel greying/coloring with its ring. Ring rack top mirrors ring states. No health bars — nobody is being hurt here.

### 11.2 THE FIVE MOMENTS
- `screen-firetrial-a` — Ten lit: Vex stepping through his own flame-arc, elegant; ten crimson-gold rings; panorama fully grey; input waiting.
- `screen-firetrial-b` — Word-passing: word 4 in Sono tiles walking through its ring unburned, heat-haze shimmer on the letters; panel 4's marquee bulbs flushing to color bottom-up.
- `screen-firetrial-c` — A miss: one doused ring re-lighting f6→f1 reversed, its panel desaturating 40% (never full grey); Vex watching, not gloating; the other eight panels holding their color.
- `screen-firetrial-d` — The tenth ring: one flame left framing Vex like a portrait; dictation voice line "Together"; nine ember halos still warm; panorama nine-tenths ablaze with color.
- `screen-firetrial-e` — Release: Engine seams opening, letter-streams pouring OUT and up like dawn birds; panel 10 coloring; Vex's own words spiraling back into his hands — restoration, no rubble anywhere in frame.

### 11.3 JUICE SPEC — **the fire-ring douse (ten times, escalating):**
- Correct word: tiles assemble on the input 60ms/letter (each TOGETHER keystroke echoes one ch34 respell-chime note) → word lifts and WALKS 900ms through the ring with heat-haze refraction → flames collapse inward 300ms into a ring of gold letters → letters settle to a calm ember halo 400ms → panel re-color: vertical saturation wipe 0.8s seeded bottom-up (ground remembers first) + that world's theme sting.
- Escalation: each douse's letter-ring holds one more letter aloft; by ring 10 the ember halos form a complete warm arc; ring 10's halo NEVER cools.
- Miss: ring re-ignites over 700ms with a low regretful horn (not a sting), panel desat 40% recoverable; Vex flinches smaller with each success — from memory, not pain.
- Release: 5-frame seam-opening, additive white-gold, screen brightens 15%; `vex-words-return` spiral 4 frames; NO shake, NO debris.

### 11.4 PHASES — words 1–3 (warm-up tier, single panels), 4–6 (championship tier, Vex casts counter-words that grey mid-air — visual pressure only), 7–9 (his casting stops; he watches), 10 TOGETHER (scripted release + softened close-up + the crew stepping AROUND him, not over).
### 11.5 READABILITY — flames never overlap the input; walking-word tiles 56px with ink outline; panorama strip panels stay ≥170px wide in landscape; the miss state must look recoverable at a glance (40% desat ≠ unspelled grey — different hue family).

---

## 12 · HOMECOMING VICTORY LAP (Ch 36 — playable credits flight)

### 12.1 SCREEN COMPOSITION
```
LANDSCAPE (flight 100%, zero meters)   PORTRAIT: vertical drift with
┌────────────────────────────────┐     panels stacked as terraces;
│ festival sky band · sky-lanterns│     touch-points enlarge.
│ 🐝➶ letter-trail from quill     │
│ [PANORAMA panels scroll · lamps │
│  light as she passes · friends  │
│  wave at touch-points ◎ ]       │
└────────────────────────────────┘
```
The colored panorama (5120×720) + festival sky band is the whole screen; Bizzy garland-crowned drifts left→right on gentle controls. NO meters, NO score, NO fail state — the only HUD is the restored-letter trail from her quill and soft touch-point rings over each wave tableau (tap = wave + world theme sting). Credits begin only after landing.

### 12.2 THE FIVE MOMENTS (a gentle arc, ending on the named flowers)
- `screen-homecoming-a` — First lamps: crossing the P1 seam as flower-cup lamps cascade alight; the mural visibly ALIVE; letter-trail streaming.
- `screen-homecoming-b` — The hive waves: P2 comb-cell lanterns, Queen and Bumble and the whole hive row mid-wave at a triggered touch-point.
- `screen-homecoming-c` — The balcony: P10 in the distance behind — Vex small on the softened Engine-tower balcony, hand half-raised; Bizzy dipping a wing; no text, no prompt.
- `screen-homecoming-d` — The last seam: panel seams dissolving behind her — the panorama becoming one seamless world; ten lamp-strings burning down the whole horizon.
- `screen-homecoming-e` — Home: landing in the golden-hour Meadow among flowers wearing their names again; the crew arriving up the lamp-lit path; badge-burst slot ready above.

### 12.3 JUICE SPEC
- Lamp cascade: 3-frame light-up per string, one bell toll each, rising through a 10-note peal across the flight; blooms soft additive in each world's accent.
- Wave touch-point: 200ms ring pulse → 2-frame wave arms → friend's one-line greeting (ducked) → theme sting quote.
- Seam dissolve: 600ms cross-melt as she crosses each; petal-confetti drift (recolored existing confetti), never obscuring faces.
- Landing: badge-burst 4 frames + gem-flame click into the shelf; credits-frame honeycomb scrolls, cells lighting as they pass, Bizzy's cell lit last; final sound = one honey-warm bell + page-turn hush.

### 12.4 PHASES — ten panel crossings (free-order touch-points, fixed direction) → meadow landing → badge + gem → 150-avatar credits scroll (auto, skippable never — pausable yes).
### 12.5 READABILITY — zero grey anywhere on this screen (the ONLY permitted grey in ch36 is the badge's locked state, off-screen); touch-points ≥64px; drift speed capped so every tableau gets ≥3s on screen; credits names Sono 20px min.

---

## S1 · JUNKYARD KART GRAND PRIX (Side Road — full kart race)

### S1.1 SCREEN COMPOSITION
```
LANDSCAPE (track 80%)                  PORTRAIT: track window tall,
┌────────────────────────────────┐     minimap to top-right chip,
│ LAP 2/3  pos 3rd/5  🗺minimap  │     item slot bottom-left thumb
│   scrap-canyon sunset parallax │     zone.
│  🏎rival  ⬖item box  ~oil~     │
│   🐝kart → drift sparks ✧      │
│ [item slot ⬢]      [🎺 word card pops center on horn use]
└────────────────────────────────┘
```
Side-view racer strip on scrap-metal canyon sunset (turbo scarlet accents); lap/position chips top-left, hex minimap top-right, single item slot bottom-left. Horn pickup pops a WORD CARD center-screen (race keeps scrolling behind at 60% speed-blur): spell it right = turbo fire.

### S1.2 THE FIVE MOMENTS
- `screen-s1-kart-a` — Grid start: five karts under the checkered gate, Rally revving front, countdown "3" as a hubcap sign; heat shimmer off the scrap piles.
- `screen-s1-kart-b` — Drift zone: Bizzy mid-drift, spark fan, Nitro inside her line, oil slick glinting ahead.
- `screen-s1-kart-c` — Word-card turbo: card center ("SEPARATE" typed correct), turbo flame igniting, two rivals passed in the blur.
- `screen-s1-kart-d` — Ramp jump: full cast airborne over a crushed-car ramp, item boxes glittering mid-air, canyon sunset behind.
- `screen-s1-kart-e` — Podium: checkered gate, Bizzy on the top tire-stack, Turbo crew saluting — war-rigs revealed behind (the Ch 32 recruitment payoff).

### S1.3 JUICE SPEC — drift: spark fan builds 3 stages (gold→scarlet→white, 400ms each), release = mini-boost 200ms whoosh; word card: correct = card shatters into turbo flame 150ms + engine pitch-up; wrong = card fizzles, no penalty beyond no boost; oil slick: 360° spin 500ms with comic dizzy stars; item box: 100ms pop + roulette tick.
### S1.4 PHASES — 3 laps; rivals rubber-band tighter each lap; lap 3 adds a second oil line and double item boxes.
### S1.5 READABILITY — word card owns center-screen with a Deep scrim, race never obscures it; rival karts always full-saturation vs backdrop; minimap dots use driver accent colors; grey appears ONLY in the optional grey-state backdrop (story mode off-race).

---

## S2 · BEAT STUDIO (Side Road — rhythm highway)

### S2.1 SCREEN COMPOSITION
```
LANDSCAPE (highway 70%)                PORTRAIT: highway vertical
┌────────────────────────────────┐     (notes fall top→bottom to a
│  word: B-A-L-L-O-O-N  ♩=120    │     bottom hit-bar), word ribbon
│ ▁▁▁▁ 4-lane highway ▁▁▁▁      │     above, DJ booth corner chip.
│  [B]   [A]  →→ notes  [L]      │
│  ══ HIT BAR ✦ ══   combo ×8    │
│ 🤖BeatBot booth  🐧🧋 dancers    │
└────────────────────────────────┘
```
Four-lane letter-note highway scrolling right→left into a hit bar at 25% from left; target word spelled in slots across the top, letters lighting as hit. Beat Bot's DJ booth + Pengu/Boba dancers lower stage strip (they animate on YOUR combo). BPM chip top-right; combo counter by the hit bar.

### S2.2 THE FIVE MOMENTS
- `screen-s2-beat-a` — Song intro: empty highway pulsing on the beat, word slots blank, Beat Bot counting in with 4 pulse rings.
- `screen-s2-beat-b` — PERFECT hit: letter-note bursting gold on the bar, "PERFECT ×2" chip, its letter slamming into slot 3 of the word above; dancers mid-bounce.
- `screen-s2-beat-c` — Miss static: one note gone static-fuzz past the bar, its slot flickering — but the lane already carrying the re-queued letter (rhythm shield: one missed beat forgiven).
- `screen-s2-beat-d` — Full flow: 140 BPM song, notes dense, combo ×24, stage lights strobing on-beat, whole booth bouncing.
- `screen-s2-beat-e` — Song clear: word ribbon complete, disco-burst, dancers' finale pose, star rating in vinyl records.

### S2.3 JUICE SPEC — on-beat pulse ring radiates from the hit bar EVERY beat (the metronome is visual); PERFECT: 80ms gold flash + 1.15 scale pop + letter-flight 300ms; okay: soft green tick; miss: 150ms static fuzz, music NEVER stutters (the song forgives); combo milestones ×8/×16/×24 = stage light color-step + dancer move upgrade.
### S2.4 PHASES — 6 songs, 90→140 BPM; lanes used 2→3→4; later songs add hold-notes (sustained vowels).
### S2.5 READABILITY — note letters 52px Sono facing upright regardless of lane; hit-bar zone ±90ms visualized as the bar's glow width; background stage pulses ≤15% brightness so lanes stay dominant; grey only on miss-static frames (villain-flavored, 150ms max).

---

## S3 · WISP GROVE (Side Road — Wordle grid)

### S3.1 SCREEN COMPOSITION
```
LANDSCAPE (grid 45% ctr)               PORTRAIT (native best-fit):
┌────────────────────────────────┐     grid upper 55%, keyboard
│   glow-grove canopy · ✨wisp    │     lower 40%, wisp floats the
│      ┌─┬─┬─┬─┬─┐ guess 6 rows  │     seam.
│      ├─┼─┼─┼─┼─┤ flip tiles    │
│      └─┴─┴─┴─┴─┘               │
│ [ glowing on-screen keyboard ] │
└────────────────────────────────┘
```
Guess grid centered on the glow-grove backdrop (5/6/7-column variants per round); grove-skinned on-screen keyboard docked bottom; Wisp hovers grid-right, drifting closer as guesses accumulate. Feedback: green (right spot) / gold (wrong spot) / **bark-brown `#6B5744`** for absent letters — NOT `#A39B8E` grey; in this saga grey means unspelled, and a wrong guess is still a spelled word.

### S3.2 THE FIVE MOMENTS
- `screen-s3-wisp-a` — Fresh round: empty 5-wide grid glowing faint, keyboard full-lit, Wisp curious at the canopy.
- `screen-s3-wisp-b` — Row flip: five tiles flipping in sequence, two greens one gold, keyboard keys dimming to bark-brown where eliminated.
- `screen-s3-wisp-c` — The whisper: after 3 misses, Wisp spiraling down trailing sparkle, meaning-scroll unfurling ("it means: to vanish slowly…"), grid soft-dimmed behind.
- `screen-s3-wisp-d` — The solve: full green row blazing, the word's letters lifting off the grid into fireflies; Wisp delighted loop-the-loop.
- `screen-s3-wisp-e` — Round 3 (7 letters — the guardian's true name): wider grid, higher stakes glow, canopy leaning in, final row one letter from complete.

### S3.3 JUICE SPEC — tile flip: 180ms each, staggered 100ms left→right, color lands at flip apex with a wood-block tock (green = marimba note, ascending across the row); keyboard key dim: 200ms fade; whisper: 600ms sparkle descent + scroll unfurl 400ms; solve: per-tile green cascade + firefly lift 800ms + grove brightens 10%.
### S3.4 PHASES — rounds of 5 → 6 → 7 letters; keyboard letter pool expands; whisper hint arms after 3 misses each round.
### S3.5 READABILITY — tiles 88px min landscape; the three tile states differ in VALUE as well as hue (green light, gold mid, brown dark) for colorblind safety; Wisp never occludes the active row; no timer, ever.

---

## CROSS-GAME READABILITY LAWS (all screens above)
1. **Grey is a character.** `#A39B8E` on screen = the Unspelling is present. Neutral UI needs = Deep-tinted slate or bark-brown. Audit every mock against this.
2. **The input is sacred.** Whatever shakes, the type strip never does (ch30/32 exempt chrome-grey by script, never legibility).
3. **One hero motion at a time.** Bursts, respells, douses and regrows queue — never overlap two template FX.
4. **Saturation = progress** in every Act VI screen: a player who can't read yet must still see "more color = winning" at a glance.
5. **Portrait parity:** every screen ships both orientations; playfield ≥60% height in portrait; thumb-zone (bottom 25%) owns all touch inputs.
6. **Finale law:** ch35–36 mocks contain no rubble, no explosions, no defeat poses — seams open, letters fly home, lamps light. Restoration is the visual language of victory.
