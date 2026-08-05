# Bizzing Bee Library — anime art generation pack (Nano Banana / DaVinci prompts)

The books ship today with the BB ANIME SVG engine as their art layer. This pack
is the upgrade path: every full-page illustration, generated externally at true
anime quality, slot-for-slot compatible with the current layouts.

## How many images are needed

| Page type | Count | Size @300dpi | Reuse strategy |
|---|---|---|---|
| Front covers (ensemble keyframe) | **17** | 2550×3300 | unique per volume |
| World divider pages | **17** | 2550×3300 | unique per volume |
| Chapter storyboard openers | **165** | 2175×2500 | unique per chapter (template + variables) |
| Back-of-book cast posters | **15** | 2550×3300 | unique per volume |
| Theme hero half-pages (Vol. 17) | **12** | 2550×1650 | unique per theme |
| World scenery strips | **36 unique** (12 worlds × 3 registers) | 2175×360 | reused across ~445 placements |
| Character model sheets (Bizzy, Vex) | **2** | 2048×2048 | reference images for every other generation |
| **Total unique generations** | **264** | | |

Generate the two model sheets FIRST and attach them as reference images to
every subsequent prompt — that is what keeps Bizzy and Vex on-model across
264 images.

## Master style block (prepend to every prompt)

> Painterly Japanese anime illustration, theatrical key-frame quality: soft
> cel shading with two-tone shadows, volumetric golden light and god rays,
> painterly gradient skies with layered cumulus clouds, drifting particle
> weather (petals / fireflies / embers), rim-lit characters with soft glowing
> auras, depth of field with blurred foreground elements, rich saturated
> color grading. Inspired by the look of Studio Ghibli backgrounds and
> Kimetsu no Yaiba lighting. NO text, NO letters, NO watermarks unless the
> prompt asks for letter tiles. Family-friendly, kids' educational book.
> Aspect and framing exactly as specified.

## Character model sheets (generate first, reuse as references)

**BIZZY (hero of all 17 books)**
> Character model sheet, front + three-quarter + flying pose. A round chibi
> honeybee heroine: glossy gradient-gold body, two curved chocolate-brown
> stripes, huge sparkling anime eyes with white catchlights, tiny pink blush,
> two curled black antennae with bobble tips, four glassy translucent
> blue-white wings with delicate veins, tiny stinger, warm confident smile.
> Clean white background, consistent proportions, cel-shaded.

**VEX (the word-moth villain)**
> Character model sheet, front + lurking pose. A sleek wisteria-purple moth
> antagonist, kid-friendly menace: dark violet ragged wings with lighter
> gradient panels trailing sparkling dust, slim indigo body, narrow amber
> lantern-glow eyes under angry brows, tiny smirk, two thin antennae with pale
> bobbles. Elegant, mischievous, never gory. Clean white background,
> cel-shaded.

## The 12 worlds (scene vocabulary — insert per prompt)

| World | Scene description |
|---|---|
| the Meadow | rolling green flower meadow, oversized pink/gold/violet flowers, red-cap mushrooms, distant soft hills, sakura petals drifting |
| the Great Library | towering warm-lit bookshelf canyons, stacked giant books, floating paper, wisteria light falling between shelves |
| the Roman Forum | marble columns and arches at golden hour, laurel garlands, warm stone, drifting leaves |
| the Storm of Elements | floating crystals, hex clouds, a single dramatic lightning bolt, wind-blown sparks |
| the Root Kingdoms / Engine Room | brass gears, copper pipes, steam wisps, amber work-lights, ember particles |
| the Paper Mountains | origami mountain folds, paper cranes gliding, clean warm paper tones |
| the Wide Strait | teal sea, striped lighthouse, small sailboat, gulls, sea-spray sparkle |
| the Word Junkyard | whimsical mounds of letters and tires, springs, a crooked signpost, warm dusty light |
| the Vibe | neon rings, floating music notes, equalizer bars glowing in violet dusk |
| the Big Stage | crossing spotlight beams, glittering dust, a lone microphone stand, deep red curtain darkness |
| the Proving Ground | training banners on poles, tents, worn earth, determined golden-hour light |
| the Grey Sea | fog banks over still water, a red buoy with a lantern, a far lighthouse halo, giant faint schwa (ə) shapes in the mist |

## Register (the maturity dial — pick per volume)

- **Register 1 (Vols 1–4):** bright daylight, fat clouds, saturated candy
  colors, everything round and cheerful.
- **Register 2 (Vols 5–10, 16):** golden hour, longer shadows, grounded warm
  grading.
- **Register 3 (Vols 11–15, 17):** dusk or night, letterboxed cinematic
  framing, restrained palette, moonlight or stage light, moody but never dark.

## Templates

**T1 — COVER (17×).** `[STYLE] + [BIZZY ref] + [VEX ref if advanced]`
> Full-page vertical book cover scene in [WORLD], [REGISTER lighting]. Bizzy
> flies front and center mid-action with motion streaks, surrounded by
> [GUIDE + 3 CREW — describe each avatar briefly], all rim-lit. Dozens of
> small white letter tiles rain and float through the whole scene at various
> depths, some motion-blurred. Dense layered composition like a Beast Academy
> cover: foreground props from the world, characters at three depths, sky
> drama above. Leave the top 25% calmer for the title, and darken the bottom
> 12% for credits. [Advanced volumes: Vex lurking small in an upper corner.]

**T2 — DIVIDER (17×).** Same as T1 but a single welcoming vista of the world,
Bizzy and the guide small and centered-low walking INTO the scene, top half
open sky for the "WELCOME TO…" heading.

**T3 — OPENER (165×).** One per chapter; fill variables from the manifest.
> Tall vertical anime montage, one continuous painterly canvas, NO panel
> borders: the sky morphs top-to-bottom through four moments —
> [MOOD1 → MOOD2 → MOOD3 → MOOD4] (mood → lighting: happy=clear day,
> think=violet dusk, oops=storm greys with Vex lurking, excited=golden burst,
> love=pink glow). Four characters staged alternately right/left down the
> page: [SPEAKER LIST — always Bizzy first]. A faint winding dotted path
> connects them. [WORLD] scenery and colored props across the bottom. Clear
> empty sky areas beside each character (captions are typeset there later).

**T4 — POSTER (15×).** Group keyframe: Bizzy center-large, guide plus three
crew fanned around at depths, world at golden hour/dusk per register, petals
or fireflies, top 20% open for the title.

**T5 — THEME HERO (12×, Vol. 17).** Half-page wide: Melody the songbird
avatar on the Big Stage under one spotlight, mood matched to the theme
(courage / kindness / humor…), open left third for the quote.

**T6 — WORLD STRIP (36×).** Ultra-wide thin band (6:1): the world's horizon
line with two or three signature props and particle weather, [REGISTER
lighting]. No characters. These tile across hundreds of pages.

## Per-volume variables

| Vol | World | Register | Guide | Face |
|---|---|---|---|---|
| 1 Lift-Off! | Meadow | 1 | Honeypot | Fredoka |
| 2 The Rulebook | Great Library | 1 | Waggle | Fraunces |
| 3 Latin Launchers | Roman Forum | 1 | Bumble | Fraunces |
| 4 Greek Lightning | Storm of Elements | 1 | Star | Comfortaa |
| 5 Endings That Win | Big Stage | 2 | Diva | Righteous |
| 6 Root Camp: Latin | Engine Room | 2 | Drone | Quicksand |
| 7 Root Camp: Greek | Paper Mountains | 2 | Clover | Fredoka |
| 8 The World Tour | Wide Strait | 2 | Nectar | Baloo 2 |
| 9 Subject Sprints | Word Junkyard | 2 | Lumen | Bungee |
| 10 Word Personalities | The Vibe | 2 | Jester | Righteous |
| 11 The Playbook | Proving Ground | 3 | Queen Hive | Bangers |
| 12 Schwa Country | Grey Sea | 3 | Blossom | Fraunces |
| 13 Letters Behaving Badly | Word Junkyard | 3 | Propolis | Bungee |
| 14 Far-Flung Words | Wide Strait | 3 | Mic | Baloo 2 |
| 15 The Word Factory | Engine Room | 3 | Maestro | Quicksand |
| 16 As Busy as a Bee | Meadow | 2 | Popcorn | Fredoka |
| 17 Say It Like a Champion | Big Stage | 3 | Melody | Righteous |

Chapter-level variables for the 165 openers (world visited, mood sequence,
speaking cast) are generated by `mkbooks.js` — each opener's world follows the
12-world ring starting from the volume's home world, and the mood sequence is
the chapter script's scene moods in order (first scene, then think / oops /
excited where present).

## Integration note

When the generated art arrives, each art slot in `mkbooks.js` (cover ensemble
SVG, opener storyboard SVG, divider/poster SVGs, `worldStrip`) is one function
call — swap its return for an `<img src="art/…">` with identical geometry and
the layouts, captions and type do not move.
