# CLAUDE DESIGN BRIEF — "BIZZY AND THE GREAT UNSPELLING"
### The 36-chapter saga for Bizzing Bee · complete asset & art direction brief
*Everything needed to bring the saga to life. Characters come from the existing 150-avatar library; this brief lists every NEW view, motion sheet, environment, artifact and UI surface required.*

---

## 0 · ART DIRECTION (matches the shipped app — do not restyle)
- **Character style:** Blooket-style squircle characters, bold ink sticker outline, duotone cheer shading — exactly as the existing avatar library (`avatars-art.js`). New views of existing characters MUST read as the same character.
- **Icon/artifact style:** glossy full-color sticker illustration (as the shipped SB_ICON_ART set): gradient body, single shine highlight, soft colored drop shadow, ink outline.
- **Palette:** app tokens. Honey `#F0B429` · Deep `#4A32A8` · Villain crimson `#C43D5A` · plus each world's accent (hive gold, stage amber, cosmos cyan `#36D1FF`, dojo red, lab green `#9BE34D`, arcade pink `#FF5D9E`, origami paper, elements teal, turbo scarlet…). **The Unspelling = desaturation**: grey (`#A39B8E` family) is the villain's color; victory = saturation returning. Never use grey as a neutral in saga art — grey MEANS unspelled.
- **Type:** locked system — Fraunces (display), Hanken Grotesk (body/UI), Sono (letter tiles). No new faces.
- **Format:** SVG strongly preferred (app is vector, offline, zoom-safe). Sprite motion = SVG frame groups (frame-1…frame-N) or a horizontal PNG sheet @2x on transparent. Name files exactly as specified per asset.
- **Tone:** warm, brave, funny-around-the-edges. Peril is real but never gory; the scariest thing in this world is *forgetting*.

## 0.5 · EPIC THEME MAP (themes only — no named characters from the epics)
| Source | Theme borrowed | Where it lands |
|---|---|---|
| **Odyssey** | The long way home (nostos) | the whole spine; Ch 36 homecoming |
| | Siren song — beautiful, false | Ch 16: nearly-right words sung sweetly |
| | Lotus-eaters — forgetting | Ch 15: the meadow that erases letters |
| | The one-eyed giant beaten by wordplay ("Nobody") | Ch 19: the Gatekeeper riddled into defeat |
| | Bag of winds squandered by doubt | Ch 20: the Tailwind Satchel opened early |
| | Between whirlpool and claw | Ch 21: the narrow strait run |
| | Counsel from the departed | Ch 22: the Sunken Library of old spellmasters |
| | Return unrecognized; the bow only the hero can string | Ch 33: the Bow of Spelling recognition |
| **Mahabharata** | The rigged dice game; everything staked and lost | Ch 13: Vex's carnival table |
| | Unjust exile of the righteous | Ch 14: the crew banished on forged words |
| | Kin on the other side; the despair before battle | Glitch traitor arc; Ch 29 counsel |
| | Counsel on duty before war (Gita-like, secularized) | Ch 29: Panda Sensei's quiet chapter |
| | Austerity earns the divine weapon | Ch 25: Tapasya → the five Astra Words |
| | The spiral formation you only know how to enter | Ch 28: the Chakravyuha maze |
| | Far-sight narration of the battle | Scopey's vision frames in Act VI |
| **Ramayana** | The golden deer — a lure that splits the party | Ch 23: True-or-Lure |
| | The beloved taken to the enemy's island | Melody held in the Engine (Ch 17→34) |
| | The small one's impossible leap, carrying a token | Ch 26: the Great Leap + Ring Token |
| | The bridge built stone by stone by every ally | Ch 27: the Bridge of Names |
| | Captivity turned into fire | Ch 26 escape sequence |
| | The ten-headed adversary | Ch 31: the Ten-Headed Word-Eater |
| | Trial by fire that proves truth | Ch 35: words walk through fire |
| | The return and the lamp-lit welcome | Ch 36: every world lights up |

---

## 1 · THE CAST

### 1.1 Heroes (existing avatars — new views required, listed per character)
**BIZZY (protagonist — biggest asset load)**
- `bizzy-side-fly` sprite: side view, 4-frame wing cycle (up/mid/down/mid), for flight + race games
- `bizzy-run` sprite: 4-frame run cycle, side view (runner, maze uses top-down puck below)
- `bizzy-top` maze puck: top-down, slight 3/4, 2-frame hover
- `bizzy-leap` : crouched charge pose + stretched leap pose + tumble land (Ch 26)
- Portrait emotion set (dialogue): determined / happy / worried / heartbroken / **faded** (letters visibly missing from her wing-name) / triumphant
- `bizzy-quill`: hero pose holding the Stinger Quill aloft (finale key art)
**Crew (per member — light set):** existing avatar art is the base; need per character: (a) **cheer pose** (arms up), (b) **grey-faded variant** — *can be generated programmatically via desaturation filter; only draw bespoke if the pose changes*, (c) dialogue portrait (one). Characters: Bumble, Waggle, Drone Dan, Hive Queen, Melody, Maestro, Astro, Comet, Zib, Panda Sensei, Shadow Ninja, Beaker, Brainiac, Zoomies, Capy, Pixel Pal, Joy Stick, Crane, Golden Crane, Beat Bot, Pengu, Boba, Rexy, Raptor, Wisp, Fae, Crystal, Monarch, Echo, Fawn, Breeze, Ember, Droplet, Zappy, Griff, Nessie, Pegasus, Hoppy.
**Special views:**
- Melody `melody-captive`: held in a static-cage, defiant not helpless
- Echo `echo-perch-speak`: beak open mid-sentence (idiom hint UI)
- Panda Sensei `sensei-counsel`: seated, lantern-lit (Ch 29 key art)
- Scopey `scopey-vision`: telescope eye projecting a vision ring (far-sight frame)
- Hoppy `hoppy-leap`: mid-bound (Ch 26 cameo)
- **Karts (Ch 22, 25, 32):** Rally, Turbo, Nitro, Crash as side-view karts with drivers, 2-frame wheel spin + drift-spark variant; plus Bizzy in a borrowed kart `bizzy-kart`.

### 1.2 Villains (NEW designs — same sticker style, villain palette)
- **VEX** — hornet. Sleek, elegant, crimson-and-black with gold pinstripes (he loves beautiful things, including words). NOT hulking — precise. Views: portrait (charming smile / cold fury), full standing with cane-stinger, `vex-flight` 4-frame, `vex-duel` casting pose (letters swirling from his hand, greying as they leave), defeated-softened portrait (Ch 35 — he *remembers*).
- **THE SMUDGE** — moth-cloud: dozens of grey moths forming one face when they swarm. Views: swarm-face, scatter burst, single `grey-moth` enemy sprite (2-frame flap).
- **GLITCH** *(existing arcade avatar — corrupted variant)* — `glitch-corrupt`: his pixel body half-dissolved into static, one eye replaced by a grey token. Portrait: gleeful / doubtful (he wavers in Ch 32).
- **VOID** *(existing cosmos avatar — empowered variant)* — `void-maw`: event-horizon mouth open, star-letters spiraling in.
- **GENERAL GNASH** — NEW: locust general, drill-sergeant posture, mandible underbite, sentence-fragments stuck in his teeth. Standing + marching sprite + portrait.
- **THE STATIC** — the Engine's voice: a screen-shaped ghost of white noise wearing a broken crown of letters. Idle shimmer (2-frame), scream pose.
- **THE TEN-HEADED WORD-EATER (Ch 31)** — the Engine's war-form: a tower of machinery sprouting ten snake-neck heads, each head themed to a challenge type (dictionary-jaw, scramble-tongue, question-mark eye, metronome head, keyboard teeth…). Needs: full boss tableau + each head as a separable element + severed/regrow states + the hidden **core head** (small, grey, almost sad).
- **Mob enemies:** grey moth (have above), `locust-trooper` (2-frame march), `static-sprite` (arcade invader, 2-frame), patrol vision-cone glow (UI element).

---

## 2 · THE WORLD — environments (one wide backdrop + one game-field variant each)
Each world backdrop in two states: **full color** and **greying** (50% desaturated with grey creep at the edges — deliver as layered SVG so the app can animate the wipe).
1. Meadow of Challenges (flowers with name-labels; labels blank in grey state)
2. The Hive (honeycomb city, Queen's hall)
3. Open Sky (cloud layers, thorn brambles) — flight parallax: 3 layers
4. Stage World (marquee theatre)
5. Cosmos (constellation sky — constellations as connect-the-dot letter stars)
6. Dojo (paper-screen hall, bell tower)
7. Lab (glass, coils, giant flask)
8. Critter Pond & Garden
9. Arcade (cabinet canyon, token rivers)
10. Origami Gorge (paper cliffs, foldable bridges)
11. Vibe Studio (beat highway stage)
12. Dino Valley (three runner zones: scrub / cliffs / nest)
13. Enchanted Forest (glow flora, the Guardian's grove)
14. Wildhearts Flyway (migration sky-river)
15. Elements Crossroads (four seasons colliding)
16. Turbo Junkyard Circuit (track tileset: straight, curve, drift zone, ramp, oil slick)
**New saga locales:**
17. **Vex's Carnival** (Ch 13) — too-bright tent, rigged glamour, dice table
18. **The Lotus Meadow** (Ch 15) — dreamy, oversaturated pastels (dangerously pretty)
19. **The Siren Shore** (Ch 16) — three singer-silhouettes on rocks (abstract, alluring, wrong)
20. **The Grey Sea** (Act IV) — desaturated ocean of un-inked paper waves
21. **The Gatekeeper's Strait** (Ch 19/21) — one-eyed silhouette cliff + whirlpool/claw strait
22. **The Sunken Library** (Ch 22) — drowned shelves, ghost-lamps, floating letters like plankton
23. **The Engine** (Acts V–VI) — cathedral of grey machinery eating letter-streams; interior floors for maze/tetris hybrid; the core chamber
24. **The Chakravyuha** (Ch 28) — top-down spiral fortress-maze, gates like closing petals
25. **The War Field** (Act VI) — grey plain before the Engine, army silhouettes both sides
26. **The Panorama** (Ch 34–36) — one wide mural of ALL worlds side by side, deliverable in grey + color layers, revealed slice by slice in the finale

---

## 3 · ARTIFACTS (sticker-style, used in UI/inventory/story)
1. **The Stinger Quill** — Bizzy's weapon: a golden quill-stinger. States: normal / glowing / grey-dimmed.
2. **Story Gems** — 36 total; six act designs (I amber hex, II star, III broken-die, IV wave-drop, V bridge-stone, VI flame) in the app gem style.
3. **The Master Token** — the Arcade's stolen heart-coin (Glitch's price).
4. **The Tailwind Satchel** — Odyssey bag-of-winds: stitched cloud-leather bag, straining at the seams; open/burst state.
5. **The Ring Token** — the recognition token Bizzy carries on the Leap (a tiny hive-seal ring). Given/glowing states.
6. **The Five Astra Words** — five seal-medallions earned in Tapasya (silent-K seal, double-L seal, root-🌿 seal, homophone-mask seal, schwa-drop seal) — each a lock-and-burst state (they detonate as word-power in the finale).
7. **Setu Stones** — bridge stones each stamped with a friend's emblem (15 emblems needed — reuse pack icons).
8. **The Lantern of Meaning** — Fae's lantern; lit/unlit.
9. **The Bow of Spelling** (Ch 33) — a great bow strung with a ribbon of letters; unstrung/strung/drawn.
10. Gameplay stickers: honey pot, golden flower (bloom 3-frame), royal jelly pellet, nectar dot, shield hex, egg + baby-dino hatch (3-frame), letter-star, paper plank, beat-note letter tile, dice pair (normal + LOADED reveal state), lotus flower, siren note-glyph, oil slick, item box, horn/shield/magnet pickups, grey brick + lit constellation, campfire, counsel lantern, fire ring (Ch 35), victory lamp string (Ch 36).

---

## 4 · THE 36 CHAPTERS (theme · beat · game · assets)
*Games marked ● are new engines; ○ reuse an engine already specced. Full mechanical specs live in QUEST-SAGA-DESIGN.md — asset needs listed here.*

### ACT I · THE SCATTERING (1–6) — the call
1. **Escape from the Meadow** ● Honeycomb Run (Pac-Man). *Assets:* meadow maze tileset (hex cells color+grey), bizzy-top, grey-moth, golden flower bloom, royal jelly.
2. **The Long Sky** ● Keep Flying (flappy). *Assets:* sky parallax ×3, bizzy-side-fly, thorn walls, honey pot, cloud-letter glyphs, Smudge swarm-face background cameo.
3. **The Elders' Test** ● Bee Grand Prix (racer). *Assets:* meadow track strip, bumble/waggle/drone side-fly sprites (2-frame), pollen cloud, flower arch, nitro flame.
4. **The Queen's Riddle** ● Word Hive (anagram builder). *Assets:* Queen's hall backdrop, honeycomb letter rack, comb-fill meter, Hive Queen portrait.
5. **Whack-the-Moths** ● Whack-a-Moth. *Assets:* nursery comb grid, moth pop-up (3 poses), golden moth, soft mallet cursor.
6. **BOSS: The Smudge** ● Spell-Shield. *Assets:* hive gates arena, Smudge swarm-face (attack/recoil), shield hex build states, Sting defect cameo portrait.

### ACT II · THE WORLD TOUR (7–12) — allies
7. **The Show Must Go On** ● Spotlight Simon. *Assets:* stage floor tile grid, spotlight beams, Melody/Maestro portraits + cheer.
8. **The Scrambled Constellations** ● Unscramble the Stars. *Assets:* cosmos sky, draggable letter-star, constellation line-draw styles ×12, Astro/Comet/Zib.
9. **The Thousand Cuts** ● Letter Slice (fruit-ninja). *Assets:* dojo hall, flying letter tile (+slice halves!), bomb-moth, slash FX, combo banner, Sensei/Ninja.
10. **The Falling Formula** ● Word Tetris. *Assets:* lab well frame, letter tile (falling/locked/clearing), flask fill states, Beaker/Brainiac.
11. **The Hungry Garden** ● Word Snake. *Assets:* garden grid, snake head/body/tail (happy), letter pickups, flower border growth, Zoomies/Capy.
12. **BOSS: Glitch's Betrayal** ● Space Typer. *Assets:* arcade cabinet-view battlefield, static-sprite ranks, glitch-corrupt (teleport in/out), scramble-bomb, Master Token steal beat art.

### ACT III · THE DICE AND THE EXILE (13–18) — the fall *(Mahabharata/Odyssey)*
13. **The Rigged Game** ● **DICE OF FATE** *(new engine: board game)* — a bright carnival board; roll dice to advance; land on word-wager tiles: stake coins on spelling under pressure; you WIN round after round — until the scripted final roll reveals the **loaded dice** and the table takes everything (coins restored later; the loss is story). *Assets:* carnival tent, game board (12 tiles: wager/trap/bonus), dice pair + LOADED reveal, Vex dealer pose, crew despair portraits.
14. **The Banishment** ○ Word Ladder. Elders, deceived by Vex's forged letters, exile the crew — the ladder is the long walk out, each rung a step into the wild. *Assets:* hive court (accusation scene), forged-letter prop, gorge ladder planks, rain layer.
15. **The Lotus Meadow** ● **FADING WORDS** *(new engine: memory-erase)* — words appear fully, then the meadow's perfume erases letters one by one; retype each word complete before it's gone entirely. 12 words, erasure speeding up. Leaving means WANTING to remember — story beat where a crew member almost stays. *Assets:* dreamy pastel meadow, lotus bloom, letter-dissolve FX, "drowsy" crew portrait variants (2–3 characters).
16. **The Siren Chorus** ● **SIREN SONG** *(new engine: true/false audio)* — three singer-silhouettes each sing a spelling of the same word (one true, two nearly-right: *seperate / separate / seperete*). Pick the true voice, then type it while the false ones harmonize distractingly. 10 words. Wax-earplug power-up mutes one false singer. *Assets:* siren shore, three singer silhouettes with song-ribbons (each ribbon carries its spelling), earplug sticker.
17. **The Quiet Night** ○ Silent Maze (stealth). Vex's raid — Bumble AND Melody taken; Bizzy's name fades. *Assets:* night maze palette, light-radius mask, locust-trooper + vision cone, B-I-Z-Z-Y HUD letters (lit/faded), firefly rescue tableau.
18. **BOSS: Void Eats the Sky** ○ Starbreaker (breakout). *Assets:* dark cosmos arena, grey brick set, paddle (Comet's tail!), constellation relight FX, void-maw.

### ACT IV · THE GREY SEA (19–24) — the odyssey
19. **The One-Eyed Gatekeeper** ● **RIDDLE OF NOBODY** *(riddle duel)* — the giant grey mantis eats the names of those who answer wrong. Rounds of wordplay riddles (from the trivia/riddle bank); final beat: he demands your name — you type **NOBODY**, and his roar "NOBODY beat me!" frees the gate (wordplay wins where force can't). *Assets:* strait cliff arena, Gatekeeper (one-eye mantis, roar pose), riddle scroll frame, "NOBODY" stone-carve FX.
20. **The Tailwind Satchel** ○ Keep Flying (wind variant). The Sunken Library's gift: a satchel of tailwinds. Mid-flight, a doubting crewmate opens it — winds reverse, progress blown back (scripted), finish against headwinds. Theme: trust. *Assets:* satchel normal/burst, wind streak FX (tail/head), grey sea parallax.
21. **Between the Whirlpool and the Claw** ○ Dino Dash engine → **STRAIT RUN**: auto-run a narrow shelf — claw strikes from above (duck), whirlpool pulls from below (jump), the safe line zig-zags. Buoy checkpoints carry spell-words. *Assets:* strait shelf tileset, claw (strike anim 2-frame), whirlpool spiral, buoy.
22. **The Sunken Library** ○ Word Safari (grid). Counsel of the departed spellmasters: find the ten Old Words hidden in the drowned shelves; each found word summons a ghost-lamp master who speaks one line of counsel. Scopey's far-sight frame debuts. *Assets:* sunken library grid backdrop, ghost-lamp master (generic robed silhouette ×3 variants), scopey-vision ring frame.
23. **The Golden Deer** ○ Storm Sort → **TRUE OR LURE**: golden word-creatures leap past; sort TRUE words from beautiful FAKES (plausible misspellings, invented words). The prettiest are false — that's the lesson. A scripted lure splits the party pre-boss. *Assets:* golden word-deer creature (leaping, shimmer), true/lure gates, forest edge.
24. **BOSS: Gnash and the Sentence Fields** ○ Sentence Forge (idioms). Rescue: Bumble freed; Melody moved to the Engine. *Assets:* locust camp set, cage (broken/intact), gnash marching + roar, shredded-idiom scraps.

### ACT V · THE BRIDGE AND THE LEAP (25–30) — the ascent *(Ramayana/Gita)*
25. **The Tapasya** ○ Vault Locks → reframed: five nights of discipline at a mountain shrine; each lock a themed hard set from Ahana's weak patterns; each opened lock forges one **Astra Word** seal. *Assets:* mountain shrine (night, snow), five Astra seals (locked/burst), meditation Bizzy pose.
26. **The Great Leap** ● **THE LEAP** *(new engine: charge-and-release physics)* — Bizzy alone must cross the Grey Sea in ONE leap to reach Melody: hold to charge (power arc preview), release to launch, steer mid-air through a trail of letter-rings that spell the message she carries; landing quality = letters delivered. Then the escape: a short burning-bright flight sequence out (captivity → fire). Delivers the Ring Token. *Assets:* leap cliff, charge arc UI, letter-ring trail, engine-island approach, melody-captive receiving ring tableau, escape glow trail.
27. **The Bridge of Names** ● **BRIDGE BUILDER** *(cooperative medley)* — the army reaches the shore; the sea can only be crossed by a bridge of named stones. Rapid-fire mixed micro-challenges (spell/unscramble/sort/type, 20–30s each); every success = ONE friend flies in and sets THEIR stone (their emblem stamps it) — the bridge visibly grows with every friend's contribution until it spans the screen. The whole-cast moment. *Assets:* shore-to-Engine wide scene, 15 emblem-stamped Setu stones, per-friend stone-carry poses (reuse cheer pose + stone overlay).
28. **The Chakravyuha** ● Spiral Maze *(maze variant)* — the Engine's outer defense: a spiral that closes behind you. One-way petal gates; you know the way IN (the entry path is shown once, Simon-style) but not out. Reach the heart — then the scripted trap springs, and the FULL CREW smashes in from outside (the lesson: never send one in alone). *Assets:* spiral fortress tileset, petal gate (open/sealed), entry-path preview overlay, crew breach tableau.
29. **The Counsel** ● **REFLECTION** *(quiet chapter — deliberately low intensity)* — eve of war; Bizzy can't bear that Glitch — a friend — stands opposite. Panda Sensei, by lantern light: duty is not hatred; you fight the Unspelling, not the unspelled. Gameplay: ten "counsel words" (courage, mercy, duty, doubt, friend…) — hear, learn meaning, spell, each lighting one lantern. *Assets:* lantern-lit camp, sensei-counsel scene, ten hanging lanterns (unlit/lit), Glitch doubtful portrait (intercut).
30. **BOSS: The Siege Begins — The Static** ○ Type-Storm. *Assets:* engine gates arena, static scream states, falling gate beats.

### ACT VI · THE WAR FOR EVERY WORD (31–36) — the face-off
31. **The Ten-Headed Word-Eater** ● **TEN HEADS** *(multi-mode boss)* — the Engine's war-form: each head attacks in a different mode (spell / unscramble / trivia / idiom / type / rhythm / sort / ladder / memory / wordle-guess) — short 30–45s duels. Severed heads REGROW unless the core head (its true name, hidden until 9 fall) is struck last with a dictation word. Scopey's far-sight frames narrate the wider battle between rounds. *Assets:* full boss tableau (listed in cast), 10 head close-ups, regrow FX, core-head reveal.
32. **THE FACE-OFF, PART I** ○ scripted (kart charge → collapsing-hall flight → unwinnable duel). Glitch hesitates at the trigger — and fires anyway. Grey-out. *"to be continued…"* *Assets:* war-field charge scene, collapsing hall parallax, vex-duel casting, portrait-fade sequence (whole cast greying one by one), black card.
33. **The Bow of Spelling** ● **RECOGNITION** *(the bow test)* — Bizzy wakes in the grey Hive; nobody knows her (her name is gone from every mind). The elders' relic: a great bow strung with a ribbon of letters that only the true speller can string. String it by spelling the five **Astra Words** from Ch 25 — dictation, no retries shown to onlookers — each word tightening the ribbon until the bow SINGS her name and every eye remembers. *Assets:* grey hive court, the Bow (unstrung/strung/drawn/singing), crowd recognition wave (grey→color across the crowd).
34. **THE RESPELLING** ○ grand medley — each correct challenge respells one friend into existence (portrait re-colors + theme sting): maze → flight → race → Simon → slice → quiz. Glitch is respelled LAST — by Pixel Pal's plea and Bizzy's word. *Assets:* void stage, per-friend respell burst FX, glitch-restored portrait.
35. **The Trial of Fire** ● **FIRE DUEL** *(final duel)* — Vex, alone, all masks off. Ten championship dictation words; each true word walks through a fire ring and douses it, re-coloring a panel of the world panorama; a miss re-lights one ring (never resets all). The tenth word — **TOGETHER** — breaks the Engine, and Vex's own words return to him: he remembers loving them. No destruction; restoration. *Assets:* core chamber, ten fire rings (lit/doused), panorama panels (grey/color ×10), vex-softened portrait, Engine release burst.
36. **The Homecoming** ● **VICTORY LAP** *(celebration)* — nostos: a gentle flight across every re-colored world as lamps light in each (Ramayana's welcome of lights, secularized as festival lamps); friends wave from their homes; no fail state — a playable credits sequence ending at the Meadow where it began, flowers wearing their names again. Saga badge **"Every Word Ever"** + gem shelf completes. *Assets:* panorama flight path, lamp strings per world, full-cast wave tableaux, badge art, credits frame for all 150 avatars.

---

## 5 · UI CHROME
- **Saga Map:** one winding golden path across six act-lands (meadow→worlds→carnival/exile→grey sea→bridge/mountain→war field→home), 36 hex nodes (locked/current/cleared ★1-3), act medallion arches, grey-mist covering un-reached lands that recedes as you clear.
- **Chapter card:** world label, engine tag chip, star row, gem slot. **Dialogue frame:** portrait left, name plate (Sono), text (Hanken), beat dots. **Boss bar:** ink-outline health bar with head/phase pips. **Gem shelf:** 6 act rows × 6 gems + badge center. **Choice wheel** (Ch 26 gauntlet-style pot choices): five art-icons (spell/trivia/idiom/type/unscramble).
- **FX set:** re-color bloom (radial saturation wipe), grey-creep (edge desaturation), letter-dissolve, letter-restore sparkle, confetti (exists), respell burst, drift sparks, on-beat pulse ring.

## 6 · AUDIO CUES (authored in-app with existing sound kit; listed for completeness)
Per-world 8-bar theme stings ×15 · Vex motif (elegant, minor, 4 notes) · Unspelling drone (grey noise swell) · respell chime (rising 5-note) · siren trio harmony (one voice subtly flat) · dice rattle/reveal sting · leap charge riser + wind rush · bridge stone thunk-chord (adds a note per stone — the bridge builds a melody) · ten-head sting per mode · recognition bow "sings her name" glissando · homecoming lamp bell.

## 7 · DELIVERY & PRIORITY
- **P0 (Act I ship):** Bizzy view set, grey-moth, maze/sky/track/hall backdrops (color+grey layers), Smudge, gameplay stickers batch 1, saga map, dialogue frame, gems Act I.
- **P1 (Acts II–III):** world game-field backdrops 4–11, Glitch-corrupt, carnival + dice set, lotus/siren sets, night maze set, void-maw.
- **P2 (Acts IV–V):** Grey Sea suite (Gatekeeper, strait, library, deer), leap/bridge/spiral/counsel suites, Astra seals, karts.
- **P3 (Act VI):** Ten-Headed tableau, war field, Bow, fire rings, panorama (grey+color layers — the single most important art piece of the saga), homecoming lamps, credits frame.
- SVG layered files, named as specified; sprite frames as sibling groups `f1…fN`; every environment delivered with its grey layer separable.
