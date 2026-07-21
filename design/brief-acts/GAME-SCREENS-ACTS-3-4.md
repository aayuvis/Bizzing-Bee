# GAME SCREEN VISUAL BRIEF — ACTS III–IV · THE 12 COMPOSED SCREENS
### "Bizzy and the Great Unspelling" · what the player actually SEES, assembled
*Companion to `CLAUDE-DESIGN-BRIEF-SAGA.md` (§0 art direction = LAW), `DESIGN-BRIEF-ACT-3.md` / `DESIGN-BRIEF-ACT-4.md` (asset filenames referenced below), `QUEST-SAGA-DESIGN.md` (mechanics). Those briefs spec the PARTS; this one specs the ASSEMBLED FRAME — zone layout, the five canonical screenshots per game, juice timing, scripted phases, readability law.*

**Global law (do not restyle):** sticker/squircle style, bold ink outline, duotone shading. Honey `#F0B429` · Deep `#4A32A8` · Villain crimson `#C43D5A`. **Grey `#A39B8E` family means UNSPELLED — never neutral.** Type: Fraunces (titles) / Hanken Grotesk (HUD text) / Sono (letter tiles). All HUD chips are squircles with ink outline on a 12px soft shadow.
**Shared HUD grammar:** pause squircle always top-left corner · progress fixture always top edge · spell/answer input always lower third · dialogue portraits slide in from the side rails, never over the input row. Landscape is primary (diagrams below); portrait reflows stack HUD→playfield→input vertically, playfield never below 55% of screen height.
**Act IV saturation census (per Act-4 brief Color Law):** in Ch 19–24 the frame is grey EXCEPT: (1) crew sprites/portraits in full library color, (2) true words + solved tiles in Honey/Deep with sticker shine, (3) villain accents (crimson sails, Gnash stripes, lure counterfeit-gold `#E8C97A`), (4) ghost-lamp cyan `#B8E6F0`. Anything else saturated is a bug.
**Screenshot naming:** `screen-<game>-a` round start · `-b` active play · `-c` the word moment · `-d` danger · `-e` victory burst (Dice of Fate: `-e` = the scripted LOSS tableau).

---

## 1 · DICE OF FATE (Ch 13 · board game) — `screen-dice-*`
### 1.1 SCREEN COMPOSITION
Landscape (playfield = board 60%):
```
+--------------------------------------------------------------+
| [pause] [coin-stack-drain HUD]        [round pips 1-6]  ~8%  |
|   VEX vex-dealer (upper-center, behind table)          ~14%  |
| +--------- board-carnival 12-tile loop -----------+  crew    |
| |   dice throw circle · dice-pair-roll ·          |  cheer   |
| |   board-pawn-bizzy on current tile              |  rail    |
| +-------------------------------------------------+  ~12%   |
|  wager-card-frame modal (rises over board on wager tiles)    |
+--------------------------------------------------------------+
```
Portrait: Vex + coin HUD top 20% · board (rotated to tall oval) 55% · wager-card-frame docks bottom 25%. Crew rail collapses to 3 reaction portraits under Vex.
HUD assets: `coin-stack-drain` (top-left, live stake count) · `stake-chip` slot on the wager card · round pips styled as tiny dice faces. Backdrop `env-carnival` L1–L3 behind everything, 10–15% hotter than app norm.
### 1.2 THE FIVE MOMENTS
- **`screen-dice-a` (round start):** wide on the blazing tent; board empty-center, dice at rest crisp (f6); Vex's charming portrait keyed upper-right, hand fanning the dice; Bizzy's pawn at tile 1; coin stack full honey; crew cheer rail wide-eyed. `fx-glamour-shimmer` sparkling across the valance.
- **`screen-dice-b` (active play):** dice mid-rattle (dice-pair-roll f2, motion smear) inside the gold throw circle; pawn mid-hop between tiles; two coin stacks pushed onto a wager tile; crew rail mid-cheer; string bulbs twinkling.
- **`screen-dice-c` (the word moment):** `wager-card-frame` dominant center — velvet frame, stake-chip seated, Sono tile row half-typed, honey-drip timer at 60%; board dimmed 30% behind; Vex leaning in, eyes in shadow (the T2 lighting tell).
- **`screen-dice-d` (danger):** timer drip at last 2s, drip gone crimson; typed row showing one wrong letter shaking; Vex's smile a notch too wide; a single grey moth-in-box trap tile glinting in the board's corner — foreshadow, not threat.
- **`screen-dice-e` (THE LOSS — replaces victory):** hard-cut composite of act-brief T4+T5: background snapped to the carnival grey-state layer, `dice-loaded-reveal` f3 huge in the throw circle, `vex-hand-palm` f2 open showing the third die, `coin-stack-drain` f4 empty circles, crew despair portraits (`bumble/melody/waggle/pixel-pal-despair`) in a broken row, Bizzy heartbroken center. NO victory FX exist in this game's build — the confetti asset is never loaded.
### 1.3 JUICE SPEC
- Dice tap→rattle: 700ms loop f1–f4, settle f5–f6 120ms, result pip pop +15% scale 90ms.
- Pawn hop per tile: 220ms squash/stretch, landing dust puff 100ms; wager tile landing = table-cloth ripple 300ms + card rise 350ms ease-out.
- Correct letter: tile ink-stamps 80ms + coin-clink; word complete: stake doubles with coin-fountain arc 600ms, crew rail cheer bounce 400ms.
- Wrong letter: tile wobble 150ms ×2, timer drip loses 1s with a crimson flash 120ms.
- LOADED reveal: `fx-loaded-flash` 1 frame (50ms white) → grey-layer hard cut 0ms → 1200ms of stillness (all idle loops FROZEN — absence of juice IS the juice) → `fx-coin-sweep` 900ms.
### 1.4 PHASES (scripted loss)
R1–R2 small stakes, player wins (words from easy pool) → R3–R4 stakes doubled, crew rail fills, glamour shimmer +20% → R5 "everything on the table": all coins auto-pushed center (player cannot decline — Bizzy's hand moves in cutscene) → R6 the roll runs f1–f4 twice as long, THEN `dice-loaded-reveal` f1–f3; result ignores physics. Loss is unconditional; stars are awarded for words spelled, screen `-e` holds 3s, iris-out through a die pip.
### 1.5 READABILITY RULES
Board tiles ≥128px art at 1x; the active tile always rim-lit honey. Wager card text never overlaps Vex. Grey appears ONLY on trap-tile icons pre-reveal; post-reveal grey floods everything except the crew and Bizzy — the cast stays saturated even in defeat (they are not unspelled, only robbed). Timer readable at arm's length: drip column ≥24px wide.

---

## 2 · WORD LADDER (Ch 14 · exile gorge) — `screen-ladder-*`
### 2.1 SCREEN COMPOSITION
Landscape (playfield = ladder rail 55%):
```
+--------------------------------------------------------------+
| [pause]  ladder 1/4 chip      [Crane fold-assist chip]  ~8%  |
| env-gorge-exile: storm sky L1 / gorge walls L2               |
|      | rope |  ladder-plank ×7 slots  | rope |               |
|      |      crew figures descending behind Bizzy      |      |
|  fx-rain layer over all                                ~62%  |
|  [ CAT ] -> [ C _ T ] Sono word-entry row              ~18%  |
+--------------------------------------------------------------+
```
Portrait: sky band 12% · ladder rail centered 60% (planks larger) · entry row + assist chip bottom 28%. Rain-drip-tile loops down both screen edges.
HUD: changed-letter highlights honey, unchanged stay ink (per act brief 14.4); ladder count chip top-center; Crane emblem assist top-right.
### 2.2 THE FIVE MOMENTS
- **`screen-ladder-a`:** top of the gorge — first plank set (full-color honey wood, word carved), six blank grey-outline planks descending into rain-mist; crew clustered at the top rung, small; the hive's last light a warm sliver at frame top.
- **`screen-ladder-b`:** mid-ladder — three planks set, one folding-in at 45° mid-crease; Bizzy on the lowest set plank, crew single-file above; rain streaking diagonally; entry row showing COT→DOT with the changed O glowing honey.
- **`screen-ladder-c`:** close framing on the entry row: the one changed letter mid-swap, honey glow blooming off it, the target word ghosted faint at the ladder's foot — the whole gorge dims 20% behind the row.
- **`screen-ladder-d`:** invalid step — `ladder-plank-wobble` mid-shake, plank unfolding, Bizzy gripping the rope, rain gusting harder (rain layer speed ×1.5); Crane's assist chip pulsing as the offered save.
- **`screen-ladder-e`:** the fourth ladder complete — all seven planks set and glowing, a warm plank-lit path through the rain; crew stepping down in a line; Bizzy paused, looking back UP at the vanished light (victory burst here is quiet: `fx-word-restore-sparkle` along every plank, 900ms cascade top→bottom — this act ends losing; even wins are wistful).
### 2.3 JUICE SPEC
- Valid step: plank folds-in 300ms (paper crease sound), sets with a carve-stamp 150ms + restore sparkle 400ms; crew figures step down 250ms stagger (60ms per member).
- Invalid: wobble 2×150ms, plank unfolds 250ms, no penalty flash — the gorge itself is punishment enough.
- Letter change input: swap flip 120ms; honey highlight fade-in 200ms.
- Crane assist: paper-fold whoosh 350ms, last plank refolds in reverse.
- Ladder complete: rain briefly parts (layer opacity 40%→15%, 800ms) then closes.
### 2.4 PHASES
Four ladders, word lengths 4→7; each completed ladder scrolls the camera one gorge-tier lower (parallax shift 600ms) and adds one rain layer. No boss — the scripted beat is the OPENING: the accusation scene (`env-hive-court-accusation`, `forged-letter-prop`, `queen-sorrow`) plays as tableaux T1–T3 before ladder 1; `fx-seal-crack` on the forgery read.
### 2.5 READABILITY RULES
Rain never crosses the entry row (masked out under it). Grey-outline blank planks vs set honey planks must differ in VALUE, not just hue (blank ≈ 60% luminance). The storm sky is the act's one sanctioned grey-family sky — do not let set planks or crew drift toward it; crew saturation full at all times. Changed-letter highlight is the single brightest element on screen.

---

## 3 · FADING WORDS (Ch 15 · memory-erase) — `screen-fading-*`
### 3.1 SCREEN COMPOSITION
Landscape (playfield = lotus-pad word stage 58%):
```
+--------------------------------------------------------------+
| [pause] 12 lotus-bud progress row        [wake-meter]   ~10% |
| env-lotus-meadow L1-L3 · perfume haze L4 drifting            |
|        lotus-pad platform (tilting ±2°)                      |
|        [ B E A U T I F U L ] Sono row, letters dissolving    |
|        perfume-ribbon crossing right-to-left           ~58%  |
| soft-focus retype row [ B E A _ _ _ _ _ _ ]            ~22%  |
+--------------------------------------------------------------+
```
Portrait: bud row 8% · wake-meter (Capy portrait alert→drowsy→rooted) docks upper-right 10% · pad + word 55% · retype keys bottom 27%.
HUD: 12 `lotus-bloom` buds top edge (bloom = done, `lotus-grey` = failed-recoverable); wake-meter is Capy's sliding portrait strip — story pressure, not a fail timer.
### 3.2 THE FIVE MOMENTS
- **`screen-fading-a`:** the word lands whole — full Sono row crisp on the pad, meadow at maximum prettiness, one perfume ribbon idling far back; all 12 buds closed; Capy's wake-meter at "alert", tail up.
- **`screen-fading-b`:** letters at mixed dissolve states — two intact, three at `fx-letter-dissolve` f2 (serifs lifting as petal-flecks), one at f4 ghost; flecks drifting up-left on the current; retype row half-filled, restored letters re-inked crisp.
- **`screen-fading-c`:** close on ONE letter at f3 — half-gone, flecks streaming — as the player's matching keypress fires the reverse playback: dissolve running BACKWARD, petal-flecks flying home into the letterform. The chapter's thesis in one frame: remembering is un-dissolving.
- **`screen-fading-d`:** danger = the meadow winning — three ribbons crossing at once, word row mostly ghosts, vignette breathing inward, Capy's meter at "rooted" with `capy-rooted` petals settling; `bizzy-shake-awake` half-body surging in from frame-left pulling his paw; two buds already lotus-grey.
- **`screen-fading-e`:** twelfth bud blooms — all 12 open along the top in a 3-frame cascade; the haze layer TEARS like tissue (exit FX) revealing hard-edged treeline; colors snap to app-normal saturation; crew upright and awake, Capy mid-shake-off, petals falling away. The only crisp confetti: `fx-word-restore-sparkle` ×12.
### 3.3 JUICE SPEC
- Word spawn: fade-in 400ms, pad tilt settles 300ms.
- Dissolve tick: per-letter f1→f4 over 2.5s early game, ramping to 1.2s by word 10 (ribbon count 1→3 signals the ramp).
- Correct keypress: reverse-dissolve 350ms + soft chime; full word: pad glow pulse 500ms, bud bloom 450ms, haze recedes 5% for 1s.
- Wrong key: key puffs a petal 150ms (no shake — nothing here is harsh; wrongness is SOFT, that's the trap).
- Bud fail: drain to lotus-grey 600ms, Capy meter slides one notch 400ms.
### 3.4 PHASES
Words 1–4 single ribbon, slow erasure · 5–8 two ribbons + vignette breathing begins · 9–12 three ribbons, fastest erasure, Capy meter active (scripted: he hits "rooted" at word 10 regardless — the `bizzy-shake-awake` beat is story, cleared by finishing words 11–12). No fail state ends the chapter; lotus-grey buds re-queue until 12 bloom.
### 3.5 READABILITY RULES
The retype row is the ONLY hard-edged element in a soft world — keep its keys at full ink outline while everything else blooms out of focus. Letter ghosts (f4) must stay legible as "something was here": 20% opacity grey, never 0%. Honey lotus-hearts are the palette anchor — at least three visible in every frame so honey never leaves the screen. Ribbons pass BEHIND the word row, never over it.

---

## 4 · SIREN SONG (Ch 16 · three-singer audio duel) — `screen-siren-*`
### 4.1 SCREEN COMPOSITION
Landscape (playfield = ribbon lanes + moonpath 60%):
```
+--------------------------------------------------------------+
| [pause]  10 note-glyph buoy pips    [earplug-sticker ×2] ~8% |
| env-siren-shore: three rock spires, singer-sway on each      |
|   song-ribbon ×3 arcing down toward the boat (tap lanes)     |
|   each ribbon carrying its Sono spelling            ~60%     |
| moonpath: type-through row [ s e p a r a t e ]      ~20%     |
| crew boat rail foreground (Melody, Echo perch)      ~12%     |
+--------------------------------------------------------------+
```
Portrait: singers compress to upper 40% (spires closer together), ribbons steepen; type row mid 20%; boat rail bottom. Earplug stickers dock right edge.
HUD: buoy pips = `siren note-glyph` stickers bobbing along top; `earplug-sticker` shows available/used states.
### 4.2 THE FIVE MOMENTS
- **`screen-siren-a`:** three white-rimmed silhouettes mid-sway, three ribbons unfurling with three spellings of the same word (*separate / seperate / seperete*), moonpath still, crew transfixed at the rail, Echo perched. All rims WHITE — no tell yet.
- **`screen-siren-b`:** mid-pick — one lane finger-highlighted, ribbons undulating (letters riding the wave, x-height locked), `melody-hears-false` portrait keyed at the rail with one finger raised toward the flat voice; two buoys already lit honey.
- **`screen-siren-c`:** correct pick — the true ribbon looping into its `ribbon-crown` halo then flowing down INTO the type row on the moonpath; the two false ribbons still harmonizing across the background (passing behind the row); typed letters lighting honey as they match the crowned spelling.
- **`screen-siren-d`:** danger — a false ribbon picked: `ribbon-shatter` mid-crack, sugar-glass letter-shards raining into the sea; both false singers swaying HARDER, their ribbons brightening (distraction spikes when you're wrong); moonpath shimmer frozen.
- **`screen-siren-e`:** tenth buoy lights — both false singers in `singer-slump` (folded umbrellas), ribbons shattered, the true singer's rim resolved full honey, her final ribbon crowning Bizzy at the prow as the boat slips past; ten honey buoys strung like fairy lights across the top.
### 4.3 JUICE SPEC
- Ribbon glow pulses on sung syllables (0.5s sync markers, per act brief).
- Lane tap: lane lifts 6px 120ms + rim brightens; correct pick: crown loop 500ms → ribbon-flow to row 400ms + warm bell; wrong pick: shatter 450ms + glass-chime rain 600ms, one buoy chance lost (word re-queues).
- Type-through: correct letter 80ms ink-stamp; wrong letter: the two background ribbons SWELL +20% opacity 300ms (audio + visual distraction is the punishment).
- Earplug use: drag to a singer 250ms, singer freezes + ribbon desaturates 400ms (squash to "used" state).
- Rim resolution: after 3 correct picks, rims crossfade white→true colors over 800ms (honey center / crimson + grey flankers) — earned, never announced.
### 4.4 PHASES
Words 1–3: rims white, tempo slow · 4–7: rims resolved, false ribbons gain their subtle tells (letters too tight / baseline 2px off), harmonies denser · 8–10: singers swap spires between words (400ms silhouette hop — position can't be memorized, only the VOICE and the SPELLING). No boss; the finale is the chorus breaking (moment `-e`).
### 4.5 READABILITY RULES
Ribbons never occlude the type row. Letterforms on ribbons keep locked x-height through undulation — legibility beats liquidity. The tells (spacing, baseline, missing shine) must survive at 1x on a tablet: minimum ribbon letter size 28px. Cold-silver moonpath is a sanctioned near-grey (moonlight lying about color); everything on the boat stays fully saturated. Grey-tinged false ribbon must not read as "unspelled environment" — keep it ribbon-shaped, luminous, clearly an object.

---

## 5 · SILENT MAZE (Ch 17 · stealth night variant) — `screen-silentmaze-*`
### 5.1 SCREEN COMPOSITION
Landscape (playfield = maze 72% — biggest field in the act; stealth needs room):
```
+--------------------------------------------------------------+
| [pause]      hud-bizzy-letters B-I-Z-Z-Y chips        ~10%  |
| env-quiet-night maze field                                   |
|   [light-radius mask ~160px around bizzy-top]                |
|   locust-trooper patrols + vision-cone wedges                |
|   golden-flower-night buds at detours · exit ember lantern   |
|                                                        ~72%  |
| (no score · no timer · night spell-card modal on flower)~18% |
+--------------------------------------------------------------+
```
Portrait: letter chips shrink to 48px, maze fills 78%; spell-card slides up from bottom.
**HOW IT DIFFERS FROM HONEYCOMB RUN (Ch 1) — the delta spec:** same hex-maze engine, inverted dress. (1) Palette: meadow daylight → night-blue paths `#2A2154` on indigo `#1E1440`; (2) VISIBILITY: full-field view → feathered light-radius mask, 12% luminance beyond; (3) SCORE HUD (nectar counter, pellet timer) → REMOVED, replaced by the five `hud-bizzy-letters` name chips — identity is the score; (4) enemies: wandering grey moths you outrun → `locust-trooper` patrols with crimson `vision-cone` wedges you must not touch; (5) pickups: nectar dots everywhere → NOTHING on paths; only five `golden-flower-night` buds; (6) the re-bloom ring FX on spell success → letter-chip relight + grey edge receding one ring; (7) maze edges are `#A39B8E` static-flecked — the exit is literally the edge of the grey.
### 5.2 THE FIVE MOMENTS
- **`screen-silentmaze-a`:** establishing (act tableau T4 as gameplay): tiny light circle in vast ink, one chip lit (B), four faded ghosts; three crimson cones sweeping distant corridors; the exit lantern a single ember point far upper-right.
- **`screen-silentmaze-b`:** mid-sneak — Bizzy's puck pressed to a wall shadow, a trooper's cone sweeping past one hex away, her light-radius contracted −30px; a golden bud faintly visible at the cone's far side.
- **`screen-silentmaze-c`:** the word moment — night spell-card open (ink field, honey text) over a bloomed golden flower; the maze holds at 30% dim behind; on completion the third Z chip relights with letter-restore sparkle, the light-radius widens +20px.
- **`screen-silentmaze-d`:** SPOTTED — `vision-cone-alert` hard-edged at 40% fill locked on Bizzy, screen edges pulsing crimson, her chips flickering (`fx-name-flicker`), auto-retreat to the last dark alcove mid-dash.
- **`screen-silentmaze-e`:** the fireflies — `firefly-lantern-ring` blooming around Bizzy, all five flowers visible in the widened warm light, B-I-Z-Z-Y fully lit and flaring together, grey maze edges receding one full ring; the exit arch now clearly readable. Warmth as victory.
### 5.3 JUICE SPEC
- Movement: hex-step 140ms, light mask trails 60ms behind (light has inertia).
- Mask breathing: ±6px with wing idle (2s period); cone proximity: snap −30px over 200ms, recover 800ms.
- Cone sweep: 2-frame shimmer loop 600ms; alert snap: 100ms fill jump + single low horn.
- Chip relight: sparkle 500ms + one rising respell-chime note (five notes across the chapter).
- Spotted: crimson edge pulse 3×250ms, auto-return glide 600ms — no death anim, no fail screen.
- Flower bloom on light-touch: 3-frame 400ms, soft bell.
### 5.4 PHASES
Zone 1 (2 patrols, wide corridors, flower 1) → Zone 2 (4 patrols with `locust-scan` pause-turns, flowers 2–3) → Zone 3 (6 patrols, static-flecked edges closing in, flowers 4–5). Scripted: the RAID prologue (tableaux T1–T3, net-drop, empty bedrolls) precedes play; the firefly rescue triggers when flower 5 is solved regardless of position — ring expands past screen → white → Ch 18 black.
### 5.5 READABILITY RULES
Inside the light-radius: full color, ink outlines. Outside: 12% luminance silhouettes — but cone wedges ALWAYS render at full alpha even in darkness (danger is never hidden). Chips at top stay legible against night sky: each chip carries its own soft glow plate. Zero numerals anywhere on this screen — the only "score" a child reads is her name coming back.

---

## 6 · STARBREAKER (Ch 18 · breakout vs Void) — `screen-starbreaker-*`
### 6.1 SCREEN COMPOSITION
Landscape (playfield = vault + sky 75%):
```
+--------------------------------------------------------------+
| [pause] target word (Sono)   boss bar: 8 constellation pips  |
|            VOID void-maw (top center, spiral idling)   ~14%  |
|   grey-brick vault: 8 clusters × 5-8 bricks            ~30%  |
|   (relit constellations stamp into sky behind/above)         |
|            ball-spark in flight                        ~34%  |
|      comet-paddle (bottom, Comet grinning at left tip) ~10%  |
| crew silhouette ledge (bottom corners)  Astro/Zib rail ~12%  |
+--------------------------------------------------------------+
```
Portrait: void-maw shrinks 20%, vault compresses to 6 columns, paddle zone unchanged (thumb-reach). Target word docks above the vault, boss pips vertical on the right edge.
HUD: target word top-left in Sono honey; 8 pips on ink-outline boss bar; multi-ball counter beside it. Backdrop `env-void-arena` — the sky itself is the scoreboard.
### 6.2 THE FIVE MOMENTS
- **`screen-starbreaker-a`:** the wall of stolen sky — full grey brick vault under a starless near-black; void-maw idling, one last letter-star spiraling in; Comet stretched into paddle form below, tail shimmering cyan; crew tiny backlit silhouettes on the ledge; all 8 pips dark.
- **`screen-starbreaker-b`:** mid-rally — ball-spark ricocheting, two bricks in shatter-frames with letters lifting free as glowing tiles, one letter-star mid-flight to its constellation slot; active cluster rim-glowing faint cyan; 3 pips lit; two constellations already drawn in the sky in `#36D1FF`.
- **`screen-starbreaker-c`:** the word moment — the active cluster's last brick shatters, its letters assembling the target word in mid-air (Sono, honey) before the `constellation-relight` stroke-dash draw begins across the sky; void-maw mid-**recoil**, spiral stuttering.
- **`screen-starbreaker-d`:** ball loss — void-maw **gulp** (mouth +15%), ball-spark spiraling INTO the maw; Comet's tail mid-flick respawning a new ball; no life counter anywhere — Void just gloats; the empty sky region above feels heavier.
- **`screen-starbreaker-e`:** the eighth relight — sky FULL of drawn, named constellations (Fraunces labels), radial saturation blooms overlapping; void-maw in **collapse**, inverting to the small grey `void-token-end` rolling to a stop below; Bizzy's portrait pitying, not gloating; crew silhouettes now front-lit by their own sky.
### 6.3 JUICE SPEC
- Paddle hit: squash frame 80ms + tail shimmer pulse; ball speed-lines above 1.2× base speed.
- Brick crack: 60ms hairline; shatter: 3 frames 240ms + letter-lift 400ms + 2px screen-shake 100ms + deep glass-crack chime.
- Letter-star flight to slot: 500ms arc with twinkle trail.
- Constellation relight: stroke-draw ~1200ms → flare 300ms + local saturation bloom 600ms + full 5-note respell chime run; one instrument joins the score.
- Gulp: 350ms mouth widen + swallowed-star slurp; recoil: spiral stutter 500ms.
- Multi-ball: prism split flash 200ms cyan, balls in `ball-multi` cyan.
### 6.4 PHASES (Void)
P1 (clusters 1–3): maw idle-hunger only; standard ball. P2 (clusters 4–6): maw gulps stray balls faster (gravity tug within 120px of the top) and exhales a slow drift-pull on the ball every 8s (telegraph: spiral brightens 400ms first). P3 (clusters 7–8): the two remaining clusters orbit-slide slowly along the vault row; multi-ball guaranteed from each relight. Collapse is automatic on pip 8 — defeat without destruction, the token rolls out for tableau T3, then T4's bitter star-rise plays (grey tide on the horizon → Act IV title).
### 6.5 READABILITY RULES
Ball never smaller than 24px, always with flicker tail against the dark. Brick letters at 45% ink so the WORD, shown in the HUD, stays the instruction — bricks are the ammunition, not the reading task. Cyan is Cosmos accent, honey is player agency (ball/paddle grip), grey is Void's hoard: keep the three families unmixed. The relit sky must never distract from the live ball — constellations render at 70% opacity while a ball is in flight, 100% between rounds.

---

## 7 · RIDDLE OF NOBODY (Ch 19 · Gatekeeper riddle duel) — `screen-nobody-*`
### 7.1 SCREEN COMPOSITION
Landscape (playfield = scroll + answer 50%; this is a DUEL — faces matter):
```
+--------------------------------------------------------------+
| [pause]   round-pip-eye ×7 (closed eyes opening)        ~8%  |
| gatekeeper-strait-arena: cliff jaws + torn-light hole        |
|     GATEKEEPER (right 40%, gatekeeper-idle/ponder)           |
|  carve-slab layer visible on cliff face              ~42%    |
| riddle-scroll-frame (left-center): Fraunces riddle text      |
|   honey-drip timer on scroll edge                    ~28%    |
| crew-raft rail: Bizzy bizzy-answer-step + Echo | answer tiles|
|   Sono letter-tile row (honey/deep)                  ~22%    |
+--------------------------------------------------------------+
```
Portrait: Gatekeeper's head + eye upper 35% (body cropped — the EYE is the character) · scroll mid 35% · tiles + raft rail bottom 30%.
Act IV grey law: arena all grey; saturated = crew on raft, answer tiles, the dim honey glint in the mantis eye.
### 7.2 THE FIVE MOMENTS
- **`screen-nobody-a`:** the reveal — the cliff's eye OPENING (the cliff WAS the mantis), raft dwarfed in the strait mouth, carved struck-through names across the rock, one blank slab ominously lit; all seven eye-pips closed; the scroll unfurling.
- **`screen-nobody-b`:** mid-duel — `gatekeeper-ponder` (claw to chin, mandibles grinding), riddle text glowing on un-inked paper, three answer tiles placed, honey-drip at 50%; Echo's hint bubble small at the rail; four eye-pips open.
- **`screen-nobody-c`:** the word moment — `bizzy-answer-step` off the raft prow, chin out, her completed answer row flaring with letter-restore sparkle confined to the tiles; the Gatekeeper's eye at half-blink (surprise); one more pip opening.
- **`screen-nobody-d`:** wrong answer — `name-morsel` (bitten frame) flicked toward the grinding mandibles, grey-creep flashing along the scroll edge, the blank slab pulsing faintly (whose name goes there?); Bizzy's worried portrait keyed; crew shrunk against the raft rail.
- **`screen-nobody-e`:** the NOBODY carve — composite of the 3-panel strip: `nobody-carve-fx` f3 mid-frame, NOBODY flooding with honey ink on the slab (the chapter's ONLY saturation event on stone), `gatekeeper-roar` f2 mid-"NOBODY BEAT ME!", cliff-jaws cracking open in a vertical seam of pale light, crew cheering full-color below.
### 7.3 JUICE SPEC
- Scroll unfurl: 600ms paper roll + wax-seal wobble.
- Tile place: 90ms snap + faint stone-tick; correct answer: sparkle 400ms + one eye-pip opens 250ms (lid lift) + mandible-grind STOPS 1s (his silence = your point).
- Wrong: morsel flick 500ms arc + bite frame 120ms + grey-creep flash 300ms — no name is actually eaten (tone law), the morsel is a word-shape.
- Ponder loop: head tilt 2-frame 1.2s; eye blink via separable `gatekeeper-eye-blink` every 4–7s randomized.
- Carve finale: chisel-spark 200ms ×3 → letters gouge 800ms → honey flood 600ms → roar 3 frames over 900ms with 4px screen-shake + gate-crack rumble.
### 7.4 PHASES
R1–R3 warm-up riddles (picture-adjacent, short) · R4–R6 wordplay proper, drip timer 20% faster, ponder pose swaps to lean-forward · R7 the demand: "your NAME" — free-type row replaces tiles; any input is overridden by the scripted N-O-B-O-D-Y auto-complete as Bizzy's voice says it dry and close (c19-x6); then carve → roar → `gatekeeper-defeated` slump watching the raft pass, one honey glint in his eye.
### 7.5 READABILITY RULES
The Gatekeeper is grey-on-grey by design — his silhouette must therefore carry him: keep the torn-light hole behind him at all times so he reads edge-first. Riddle text ≥ 20px Fraunces on the scroll, never over texture busier than 10% contrast. Answer tiles are the frame's saturation anchor; nothing else honey except his eye-glint. The blank slab stays in-frame in every wide shot — the question the whole chapter is walking toward.

---

## 8 · TAILWIND SATCHEL FLIGHT (Ch 20 · wind-reversal flappy) — `screen-tailwind-*`
### 8.1 SCREEN COMPOSITION
Landscape (playfield = flight corridor 78%):
```
+--------------------------------------------------------------+
| [pause] wind-gauge (arrow flips tail/head)  pot count  ~8%   |
| grey-sea-parallax far/mid/near + tailwind-sky-band           |
|    bizzy-side-fly ->        paper-crag pairs (top/bottom)    |
|    honey-pot checkpoints on wave crests                      |
|    wind-streak-tail flowing L->R                       ~78%  |
| raft-to-harbor progress strip w/ blow-back marker      ~14%  |
+--------------------------------------------------------------+
```
Portrait: corridor rotates priorities — crags tighten vertically, gauge docks top-right, progress strip stays bottom. Spell-card modal (standard frame) rises from the pot on landing.
Saturated: Bizzy, honey pots, satchel, honey wind-lines, harbor dot. Grey: sea, sky, crags, headwind streaks.
### 8.2 THE FIVE MOMENTS
- **`screen-tailwind-a`:** launch — satchel lashed to the raft below (straining state, honey stitches glowing), `wind-gauge` full tail, honey wind-lines scoring the grey sky, first pot ahead on a paper-swell; harbor a faint warm dot on the progress strip's far end.
- **`screen-tailwind-b`:** cruise — Bizzy mid wing-cycle riding visible tail-streaks, three pots banked (flags up), crags parting ahead; Waggle's small clutch-pose visible at the raft's rear on the near parallax layer — the doubt planted in the scenery.
- **`screen-tailwind-c`:** pot landing — spell-card open over the pot, word half-typed, tail-streaks slow-drifting behind the card; correct completion pours honey fuel (pot glow + altitude lift).
- **`screen-tailwind-d`:** THE REVERSAL — full-screen `satchel-burst-fx` f3: vortex arms reaching, parallax layers visibly running BACKWARD, harbor dot ripped toward frame-edge, wind-gauge arrow slamming to head-grey, `bizzy-side-fly-strain` fighting jagged right-to-left streaks; `vex-sail-silhouette` on the horizon watching.
- **`screen-tailwind-e`:** harbor the hard way — the final pot banked at the quay, streaks calming to stillness (first calm frame of the act), Waggle setting down the re-stitched satchel with one glowing honey thread, Bizzy's hand on his shoulder; progress strip complete. Quiet victory: single warm bell, no confetti storm.
### 8.3 JUICE SPEC
- Wing tap: 4-frame beat, +8px lift 100ms; strain variant beats read heavier (frame hold +30ms).
- Pot land: bob 200ms + card rise 300ms; word correct: honey-pour 500ms + banked flag pop 150ms; miss: altitude sag 400ms, pot re-queues (never a dead end).
- Reversal event: seam-creak loop 2s (straining) → stitch-pop 150ms → burst f1–f4 over 1.4s → parallax reverse 3000ms → streak layer swap 400ms crossfade. Input locked 1.2s during burst (scripted, brief).
- Headwind: constant −20% forward drift, gust buffets 300ms every 5–8s (telegraph: streak brightens 200ms first).
- Crag near-miss: paper-flutter 250ms on the crag edge, no damage.
### 8.4 PHASES (the wind reversal)
Third 1 — TAILWIND: generous gaps, +15% scroll speed, 4 pots. Scripted midpoint — THE BURST (unconditional, fires after pot 4 regardless of skill; the loss is Waggle's, not the player's — messaging in the aftermath card). Third 2 — BLOWN BACK: 3s reverse scroll cutscene, two previously-passed crags return. Third 3 — HEADWIND GRIND: strain sprite, drift penalty, 4 pots re-earned + 2 new; gauge stays grey until the quay, where it fades to still.
### 8.5 READABILITY RULES
Wind DIRECTION must be readable in one glance from three cues that always agree: gauge arrow, streak flow direction, Bizzy's sprite (normal vs strain). Honey tail-streaks vs grey-white jagged head-streaks differ in shape AND color (color-blind safe). The burst is loud but the vortex must never fully hide Bizzy: she stays in the top 30% of the frame during the event. Harbor dot is the only warm light on the horizon line — never add others.

---

## 9 · STRAIT RUN (Ch 21 · claw-above / whirlpool-below runner) — `screen-strait-*`
### 9.1 SCREEN COMPOSITION
Landscape (playfield = shelf corridor 80%):
```
+--------------------------------------------------------------+
| [pause]  buoy pips ×N          exit-light distance chip ~8%  |
| overhang shadow + scratch-gouges  <- CLAW ZONE (duck)        |
|   strait-claw on gooseneck · claw-telegraph pebbles          |
|        bizzy-run on shelf tiles ->                    ~80%   |
|   shelf-flat/gap/ramp/crumble tiles                          |
| whirlpool-spiral rim below-left <- POOL ZONE (jump)          |
| (crew raft tiny + saturated on mid parallax)          ~12%   |
+--------------------------------------------------------------+
```
Portrait: same vertical stack compressed; claw nests just under the HUD, whirlpool rim rides the bottom bezel — the player's thumb zones ARE the danger zones.
Saturated field objects: Bizzy and `strait-buoy` checkpoints ONLY. Everything else warm/cool grey per Color Law.
### 9.2 THE FIVE MOMENTS
- **`screen-strait-a`:** the thread between — run start on the wet shelf, claw cocked in overhang shadow (drip falling), whirlpool arms turning lazily below, first buoy visible ahead with its word-slate, exit slot of pale light far right; raft poling in behind.
- **`screen-strait-b`:** full flow — Bizzy mid-run, one crumble tile falling away behind her, `claw-telegraph` pebbles + shadow-blob directly ahead (0.8s warning), `bizzy-run-glance-up` head composited — she SEES it coming.
- **`screen-strait-c`:** buoy checkpoint — auto-run pauses at the buoy, standard spell-card open on its slate, whirlpool churning below the card; on correct: banked flag up, local saturation bloom on the buoy, respell chime.
- **`screen-strait-d`:** the double bind — claw at f2 full slam (motion smear, rock chips) exactly as the whirlpool `surge` state rises toward the shelf: Bizzy mid-duck-into-jump chain in the one safe pocket between them; radial pull-blur one frame on the pool side; `spray-splash` bursting grey.
- **`screen-strait-e`:** through the slot — the exit light widening to fill frame-right, buoy flags up all along the passed shelf, Bizzy tumble-landing into open water light, crew raft sliding through the jaws behind her, laughing breathless (c21-x5). Saturation bloom stays LOCAL to buoys + crew — the sea does not heal.
### 9.3 JUICE SPEC
- Duck: 100ms drop, held while pressed; jump: 350ms arc with wing-flutter apex.
- Claw telegraph: pebbles + shadow 800ms before f1→f2 strike (strike itself 180ms) + deep clack + 3px shake 120ms + rock-chip burst 300ms.
- Whirlpool surge telegraph: rim rise 600ms + churn pitch-up; miss pull: radial blur 1 frame + drag −15% speed 500ms.
- Crumble tile: crack 200ms after claw hit, falls 400ms later (chain hazard).
- Buoy bank: flag pop 150ms + bell + bloom 500ms; checkpoint restart: buoy flash 300ms, Bizzy tumble-lands back at it 500ms — no death animation ever.
- Near-miss either hazard: spray-splash 300ms + Bizzy glance-frame 150ms.
### 9.4 PHASES
Stretch 1: hazards alternate singly (learn each telegraph) · Stretch 2: overlapping telegraphs, crumble tiles appear, safe line begins zig-zagging shelf-edge to cliff-hug · Stretch 3: claw strike rate ×1.5 + surge rate ×1.5, gaps between them tighten to the duck-jump chain (moment `-d` is a scripted setpiece here, survivable by holding the safe pocket). No boss; the strait itself is the boss.
### 9.5 READABILITY RULES
Telegraphs are LAW: nothing strikes without its 0.6–0.8s tell, and tells live in the zone they threaten (pebbles fall where the claw lands; the rim rises where the pool pulls). Bizzy's honey silhouette must pop against warm-grey shelf at all times — shelf highlights stay ≤ `#B3A796`. The swallowed grey letters circling the whirlpool drain are texture, not tasks: 30% opacity max. Exit light always visible at frame right as the goal-read, even mid-chaos.

---

## 10 · SUNKEN LIBRARY WORD SAFARI (Ch 22 · word-search grid) — `screen-safari-*`
### 10.1 SCREEN COMPOSITION
Landscape (playfield = catalog slab 55% + ledger rail):
```
+--------------------------------------------------------------+
| [pause]   found 4/10 chip        [Echo hear-it chip]   ~8%   |
| sunken-library-backdrop: drowned stacks, letter-plankton     |
|  +--- catalog-slab-grid 8x8 ---+   library-ledger      |     |
|  | carved barnacled letters    |   (10 Old Words,      |     |
|  | trace = honey stroke        |    lamp icons)  ~20%  |     |
|  +------------------------------+                       |     |
|  ghost-lamp masters hover at lamp-pools           ~72% total |
| dialogue frame (ghost-master crops) rises on each find ~20%  |
+--------------------------------------------------------------+
```
Portrait: ledger converts to a horizontal chip-strip under the HUD; slab fills 65%; masters appear behind/above the slab; counsel dialogue bottom-docks.
Light logic: grey stacks + pale surface-glow; ghost-lamp cyan `#B8E6F0` pools; found letters re-ink honey. Bizzy's puck traces the slab.
### 10.2 THE FIVE MOMENTS
- **`screen-safari-a`:** the descent settles — Bizzy's puck alighting on the great fallen slab, 8×8 carved letters weathered grey, plankton-letters drifting and parting around her; ledger waterlogged at the rail, all ten lamp icons dark; one lamp-pool glowing faintly in the stacks.
- **`screen-safari-b`:** mid-trace — honey stroke with ink outline dragging across five cells, traced letters brightening under it; two words already re-inked honey on the slab; two ledger lamps lit; a summoned master (B, open-book lantern) hovering at his pool watching.
- **`screen-safari-c`:** the find — `old-word-reveal` mid-chain: barnacles cracking (f1) into honey ink flood (f2), the word lifting off the slab as a glowing strip arcing toward a lamp-pool where `ghost-lamp-summon` f2 condenses a robed silhouette from plankton; the counsel line begins in the dialogue frame.
- **`screen-safari-d`:** danger (gentle here — the act's breath chapter): a wrong trace fizzling in grey bubble-puff while the plankton layer thickens and dims the slab 15% (the library "clouding"); the season-timer lamp on the ledger guttering low; Scopey's ring glimmering un-opened at the rail — something is waiting to be seen.
- **`screen-safari-e`:** ten lamps — all three masters hovering in a half-circle, ten honey word-strips floating between them, every ledger lamp lit: the brightest frame of the act (still only cyan + honey on grey). Center: `scopey-vision-ring` iris-open showing `melody-captive` on the locust wagon rolling toward a machine skyline — victory and gut-punch in one composed frame.
### 10.3 JUICE SPEC
- Trace: stroke follows finger at 0ms lag, cells brighten 60ms each; release-correct: barnacle crack 250ms → ink flood 350ms → strip lift-and-arc 700ms → summon chain 1200ms (f1–f4) + low-passed respell chime.
- Release-wrong: fizzle 300ms grey bubbles, no penalty beyond the clouding tick.
- Master speak: lantern flare 300ms + robe-hem letters brighten; dialogue frame slide 250ms.
- Plankton: 2-frame shimmer loop, parts around the puck within 48px (engine mask).
- Vision ring: brass iris-wipe open 600ms + focus-tick rotation; interior keyed art crossfades 400ms.
- Ten-lamp finale: masters brighten in sequence 3×400ms, word-strips orbit-drift, ring opens center 800ms.
### 10.4 PHASES
Words 1–3: horizontals/verticals only, Master A summoned · 4–7: diagonals + reversals join, Masters B/C rotate in, plankton density +25% · 8–10: longest Old Words, slab dims between finds (clouding), Echo's hear-it-in-a-sentence chip glows as the nudge. Scripted: after word 10, the vision-ring sequence (Scopey debut) plays uninterrupted, then the masters gutter out one by one — last light is Bizzy's own glow (chapter out).
### 10.5 READABILITY RULES
Slab letters ≥ 36px carved Sono; barnacle texture never exceeds 15% contrast over a letterform. Three light families, never mixed: cyan = memory (masters, pools), honey = truth found (traced words, ledger lamps), pale surface-glow = ambient. Plankton stays behind the trace layer. Inside the vision ring is the ONLY place `melody-captive`'s saturated colors appear — the ring frames the stakes.

---

## 11 · TRUE-OR-LURE (Ch 23 · golden-deer sorting) — `screen-lure-*`
### 11.1 SCREEN COMPOSITION
Landscape (playfield = sort lanes 70%):
```
+--------------------------------------------------------------+
| [pause] wildflower-bud round pips     [lures-caught jar] ~8% |
| forest-edge-grey: scroll-trunks, mist, lure-glint layer      |
|  true-gate                                    lure-gate      |
|  (rough honey wood,   <- creatures leap ->  (ornate flat-    |
|   wildflower at foot)    across center       gold filigree)  |
|  flank-banner word on each creature (Sono)            ~70%   |
| Fawn + Bizzy portraits rail · sort-lane-arrows        ~22%   |
+--------------------------------------------------------------+
```
Portrait: gates move to bottom-left/bottom-right thumb corners; creatures leap down the vertical center; jar and pips share the top strip.
Field saturation: crew rail, true-word-creatures (honey/Deep + ink + shine), honey wildflowers. The deer and lure-gate wear counterfeit-gold `#E8C97A` — flat, outline-less, shine-less BY LAW.
### 11.2 THE FIVE MOMENTS
- **`screen-lure-a`:** first sight — a golden-word-deer at leap apex spanning the frame, letter-mane streaming, its flank-banner reading a plausible misspelling; crew silhouettes turning as one below; Fawn alone unturned, ears back; both gates waiting; mist glinting with hung lures.
- **`screen-lure-b`:** the stream — a humble true-word-creature (crouch frame) and a shimmer-sweeping deer mid-field at once, banners readable; player flicking the true one toward the rough honey gate; two wildflower pips bloomed; one flat-gold scrap already in the jar.
- **`screen-lure-c`:** the read — close framing on a flank-banner as the player hesitates: the word ALMOST right, the creature's glint sweep deliberately too smooth (no shine node), Fawn's portrait keyed with her tell line — the gameplay IS this look.
- **`screen-lure-d`:** danger — a lure flicked to the TRUE gate by mistake: the lure-gate snaps hungrily across the field in protest, grey-creep pulsing on the HUD, the deer mid-`reveal-as-fake` f3 — letterforms unraveling into a grey moth-scatter (Smudge callback) erupting over the recoiling crew.
- **`screen-lure-e`:** clean sweep — final round cleared: true critters gathered calm in the honey clearing looking back, all wildflower pips bloomed, the jar full of flat-gold scraps; then the scripted MASTERWORK deer (largest, most golden) bounding into the treeline with half the party turning after it, Bizzy's arm out mid-shout — the victory burst tears along the treeline (paper-rip wipe) into Ch 24. Triumph and cliff-hanger share the frame.
### 11.3 JUICE SPEC
- Creature spawn: leap 4-frame across 1.6–2.2s (window shrinks per round); banner locks horizontal during flight.
- Flick: 120ms launch + trail; TRUE gate accept: warm swing 250ms + saturation bloom + bud bloom 400ms + soft true-critter step sfx (humanized timing).
- LURE caught (flicked to lure-gate): reveal-as-fake f1–f4 over 1s + moth-scatter 600ms + scrap drop to jar 400ms + quantized-bell death of its chime.
- Wrong sort: gate snap 200ms + grey-creep HUD pulse 300ms; the creature escapes (re-queued), no pile-up.
- Fawn tell assist (after 2 misses): inset gait-diagram card slides in 300ms, pauses spawns 2s.
### 11.4 PHASES
Round 1 — meaning is obvious: real words vs invented words, slow leaps · Round 2 — plausible misspellings, banners smaller, deer shimmer brighter (beauty ramps as truth thins) · Round 3 — champ read: near-twin pairs of the SAME word (separate/seperate energy), audio-only option (banner hidden) for champs, lure-glints in the mist multiply. Scripted post-round: the masterwork-deer party-split (`party-split-marker` chip stamps onto the act map) — unstoppable, story-driven.
### 11.5 READABILITY RULES
The counterfeit tells are curriculum — protect them: NO ink outline, NO shine highlight, flat `#E8C97A` on every false thing (deer, lure-gate filigree, glints), while every true thing carries full sticker DNA. Banners ≥ 30px Sono, locked upright through the leap. Never let mist exceed 20% opacity over a banner. The two gates must be tellable by SHAPE alone at thumbnail size: rough asymmetric wood vs too-perfect symmetry.

---

## 12 · SENTENCE FORGE (Ch 24 · idiom rebuild + Gnash camps) — `screen-forge-*`
### 12.1 SCREEN COMPOSITION
Landscape (playfield = forge rack + camp 60%):
```
+--------------------------------------------------------------+
| [pause] camp pips A-B-C   boss bar (3 phase pips)      ~8%   |
| locust-camp-backdrop: bale-stacks, cage-towers, swarm sky    |
|   patrol-timer-sweep wedges crossing the yard                |
|   GNASH gnash-march patrolling the mid-ground          ~44%  |
| forge-anvil + forge-rack: idiom word-slots             ~26%  |
|   [once][upon][ a ][____][time] + key-word spell socket      |
| idiom-scrap tray (draggable grey scraps) · Bumble cage ~22%  |
|   corner: word-cage w/ name-spell-lock B-U-M-B-L-E           |
+--------------------------------------------------------------+
```
Portrait: camp scene compresses to upper 35%; rack centers 30%; scrap tray thumb-bottom 35%; the cage docks upper-right, always visible — the WHY of the level.
Saturated: crew, forged idioms (post-`forged` state), bright anvil sparks, rescue-key icon, Gnash's rank-stripes (crimson accent), coal glow. Scraps and camp: grey.
### 12.2 THE FIVE MOMENTS
- **`screen-forge-a`:** camp A at dusk — stripped sentence-rows to the horizon, dull crimson forge coals, cage-towers silhouetted; Bumble's cage pin-lit far upper-right; the rack empty; six chewed scraps in the tray; Gnash mid-march cycle on inspection, troopers snapped straight; one patrol wedge sweeping.
- **`screen-forge-b`:** rebuild in progress — three scraps slot-snapped (ink partially returned), two still grey in the tray, the key-word socket empty and pulsing; a patrol wedge nearing the rack (drag frozen while lit); Bumble cracking jokes from the cage (dialogue chip, c24-x4).
- **`screen-forge-c`:** the forge — key word typed into the socket: the full idiom re-lights honey/Deep with a sticker shine-sweep along its length as the anvil's sparks flip from dull to BRIGHT honey — the villain's tool turned good, in one flash.
- **`screen-forge-d`:** danger — GNASH ROAR: `gnash-roar` f2 forward-lunge filling the mid-ground, legible sentence-spit flying ("…once upon…", "…the end…"), the swarm-curtain crashing down behind him, every patrol wedge snapping toward the rack, placed scraps rattling loose one slot; Bizzy flattened behind a word-bale.
- **`screen-forge-e`:** the break — B-U-M-B-L-E sockets full on the cage door, letter-bars springing straight and SATURATING one by one, cage in `broken` state, `bumble-freed-burst` mid-tackle-hug at Bizzy, Gnash's stuck sentence-fragments pulling free of his teeth and flying to the rack (grey→honey mid-flight), swagger-stick snapped. Frame-corner, quiet under the joy: the EMPTY second cage with Melody's ribbon on a bar — the burst never fully covers it.
### 12.3 JUICE SPEC
- Scrap drag: lifts 8px + soft shadow 80ms; slot-snap: 120ms + partial re-ink 200ms; wrong slot: refusal wobble 150ms, scrap floats back 300ms.
- Key-word letters: 80ms stamps; idiom forged: shine-sweep 600ms + respell chime + bright-spark fountain 500ms.
- Patrol sweep: wedge crosses rack zone every 9s (camp A) → 6s (C); caught mid-drag: scrap drops, wedge flare 300ms, Gnash bark — no other penalty.
- Roar setpiece: swarm-curtain 3-frame drop 700ms + 4px shake 200ms + spit-scraps arc 600ms + one slot shaken loose (retrievable).
- Name-lock letter: socket fill 150ms + cage-letter sproing per freed bar 250ms; full name: burst-open 700ms + hug 500ms at 100% saturation.
- Camp cleared: swarm-curtain wipe to next camp 900ms.
### 12.4 PHASES (Gnash camps)
CAMP A — 3 idioms, single slow patrol, Gnash marches background only. CAMP B — 4 idioms, two crossing patrols, Gnash inspects the RACK itself every 45s (hands off during his 3s pass); first roar setpiece on camp clear. CAMP C — 4 idioms + the cage: patrols fastest, the final "idiom" is the name-lock (B-U-M-B-L-E, spelled aloud with c24-x5 letter-by-letter audio); second roar on discovery — too late. Post-break scripted beats: the empty cage close-up (everything desaturates except ribbon + Bizzy), then Vex's descent, offer, refusal (`vex-flight` + cold-fury portrait, c24-x10–x12) over the swarm-curtain. Award `story-gem-act4`.
### 12.5 READABILITY RULES
Scrap text legible even chewed: tear-patterns never cross more than one letter per scrap. State ladder must read at a glance — shredded (grey, chewed) → placed (half-ink) → forged (full honey/Deep + shine): three distinct value steps. Patrol wedges render over everything except modals. Gnash never occludes the rack while input is live. The empty second cage keeps a 5% reserved frame corner in every camp-C composition — the audience should feel it before Bizzy finds it.

---

## APPENDIX · SCREEN DELIVERY
- 60 composed screens total: 12 games × `-a…-e`, named `screen-<game>-<letter>.svg`, 2400×1350 landscape masters; portrait variants only where the layout materially reflows (dice, siren, forge — deliver `-p` sisters), else the app reflows live zones.
- Every screen is a COMPOSITION of act-brief assets — no new characters, props, or backdrops may be invented at this layer; missing parts go on the act-brief change log instead.
- QA passes per screen: (1) §0 style law, (2) grey census (Act IV: crew / true words / villain accent / lamp-cyan only), (3) input zone unobstructed, (4) one focal point per frame, (5) all HUD text Hanken ≥ 16px @1x, tiles Sono ≥ 28px.
