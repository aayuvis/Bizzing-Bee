# BB ANIME — the Bizzing Bee Library's cinematic art language (v5)

This document is the design-system record of how the Library renders characters
and scenes. The implementation is `bb-anime.js` (this folder) — a dependency of
`books/mkbooks.js` and reusable anywhere the brand needs staged character art.

## Why it exists

v4 staged the avatars as flat 120×120 icons inside ink-bordered comic boxes.
The v5 direction: **Japanese-anime staging** — painterly light, weather, depth
and acting — while keeping the avatars themselves (they are the brand). The fix
is not redrawing 211 characters; it is **staging** them like cels:

1. **A sky that acts.** Six graded skies (`day / gold / dusk / night / storm /
   blush`) map to scene mood: `oops → storm`, `excited → gold`, `think →
   dusk/night`, `love → blush`. God rays wedge out of every light source.
2. **A world that recedes.** Three silhouette depths of landscape per world
   (12 worlds), over a ground that keeps its world colour in daylight and
   falls into silhouette as the hour grows late.
3. **Weather that drifts.** Per-world particle systems — sakura petals,
   wisteria, embers, paper cranes, snow, fireflies — with three oversized
   blurred foreground particles for depth of field.
4. **A character that is lit.** `figure()` composites any avatar with:
   a blurred contact shadow, a two-layer aura in the avatar's own palette
   (screen-blended so it glows), and a soft white rim crescent on the key-light
   side. `palette()` extracts each avatar's two loudest saturated colours from
   its art, so all 211 glow in their own light.
5. **Cel clouds.** Flat-bottomed cumulus with a tinted underside, scaled to the
   frame (small panels get small skies).

## The register dial (1 → 3)

Books mature as the reader does. One integer drives it everywhere:

| | Reg 1 (Vols 1–4) | Reg 2 (Vols 5–10, 16) | Reg 3 (Vols 11–15, 17) |
|---|---|---|---|
| Neutral hour | daylight | daylight | golden hour / night |
| Ground | full world colour | dimmed 32% | silhouette 68% |
| Panel corners | 16pt, playful tilt | 16pt, level | 6pt, level, letterboxed openers |
| SFX stamps | UH-OH! / GOT IT! | same | none |
| Clouds | 4, fat | 4 | 2, sparse |
| Vignette | 20% | 20% | 38% |
| Copy voice | warm, simple | grounded coach | straight-talking, no confetti |

## Where it's used in the books

- **Covers & dividers** — full-page keyframes (guide centred, letter tiles in
  the sky, letterboxed at reg 3).
- **Storyboard openers** — four `plate()` panels (400×368) with the caption as
  a subtitle bar (`.an-cap`), speaker name-tagged. The speaking role rotates
  through the volume's drafted cast; **Vex only ever lurks** in the storm
  panel — the villain never delivers the coaching line.
- **Portrait chips** (`portrait()`) — glassy bokeh discs with rim light, used
  for margins, hosts, cast pages, and the two collection volumes.
- **Cast poster** — back-of-book group keyframe (guide + four crew).
- **Vex** — redesigned in `vex()`: wisteria-gradient moth, lantern eyes,
  dust-trailing ragged wings. Menace without gore.

## The cast system

`draftCast()` in mkbooks.js drafts nine avatars per volume from packs affined
to its world (`WORLD_PACKS`), preferring avatars unused by earlier volumes, so
the series walks (nearly) the whole 211-avatar collection. Cast members host
puzzle pages and checkpoints and take storyboard lines. `PACK_ROLE` gives each
pack a one-line personality for cast pages.

## v6 — full-page cinema (feedback round)

Direct feedback drove four structural upgrades, all in `bb-anime.js` v2:

1. **`storyboard()` — no boxes.** The chapter opener is ONE continuous canvas
   (725×830): a single sky gradient that morphs through the four moments'
   moods, soft radial mood-washes that blend into each other, one world
   ground, and a winding dotted path connecting the moments (the Word Map's
   own motif). Captions are HTML overlays floated in CLEAR sky on the
   opposite side of each figure — text never sits on a character.
2. **`ensemble()` — dense covers.** Beast-Academy energy: Bizzy front and
   centre in motion (motion lines), the guide + three crew at depths,
   `letterField()` raining letter tiles through the scene, `env()` placing the
   world's own colored props (flowers, book towers, columns, crystals,
   lighthouses, gears, neon) on a world-colored ground, a legibility gradient
   at the foot for the credits.
3. **Bizzy is the hero of every book.** The mascot has no SB_AVATAR_ART entry,
   so the module carries `bizzyInner()` — a cel-shaded anime Bizzy (gradient
   gold, curved stripes, glassy veined wings, keyframe eyes). Every cover,
   opener, cast page and poster leads with Bizzy; the volume guide co-stars.
4. **Worlds travel.** Chapters cycle through the 12-world ring
   (`chWorldOf`), and `worldStrip()` carries scenery onto working pages
   (checkpoints, cast, answer key, colophon) as a slim keyframe band.

**The cast speaks with the app's own lore.** `avatar-cards.js` supplies each
avatar's title, lore line, power, OVR and true fact: cast pages print them,
checkpoint hosts cite their power, and every fourth Bee Break is a cast
member's true fact. No more generic mascot chatter.

## Print constraints

- Everything is inline SVG — no rasters, no external requests; Chromium's
  `page.pdf` keeps gradients, `feGaussianBlur` filters and `mix-blend-mode:
  screen` (used for the auras).
- Filter/gradient ids are namespaced per plate (`uid`) — mandatory, a printed
  book holds hundreds of inline SVGs.
- Type floor for kids: 14.5pt body (general band), 12.5pt (advanced); nothing
  under 8.6pt anywhere.

## v8 — the Grand Trunk Road (Volume 14 inserted, series renumbered to 18)

Volume 14 is the first book authored **for the series** rather than lifted from
the app's own course: *The Grand Trunk Road — South Asian words that became
English*, 11 chapters, 112 practice words, all definitions and pronunciations
pulled from the 128k word library at build time (`books/southasia-chapters.js`,
regenerate with the session's `mksa.js`). Its storyboard scripts live on the
chapters themselves (`ch.sc`), so it does not borrow narration keys from
`SB_CSCRIPT` / `SB_ADV_CSCRIPT` and cannot collide with them.

Inserting a volume mid-series would normally reshuffle everything after it, so
two pins were added and both must be kept:

- **`vol.seedN`** — the draft seed a volume shipped with. Volumes 15–18 carry
  their old numbers as `seedN`, so their crews (and therefore their already
  painted cast pages, covers and posters) are unchanged.
- **`vol.cast`** — an explicit crew. Volume 14 pins Ganesha, Hanuman, Lakshmi,
  Vasuki, King Cobra, Python, Aryabhatta, Monarch and Lotus, and a pinned crew
  deliberately does **not** claim names in `castUsed`, so it takes nothing away
  from the volumes drafted after it. Naga guides.
- **`vol.cyc`** — an explicit chapter-world ring. The 12-world ring was left
  alone (changing its length would move every other volume's scenery); Vol. 14
  alternates its home world with five others instead.

**A 13th world: the Grand Trunk Road.** A dusty highway running to the horizon
under an enormous banyan with hanging aerial roots, carved milestones counting
down the verge, paper kites, and a temple spire and minaret on the skyline.
Registered in `worldScene`, `WORLD_NAME`, `WORLD_FACE` (Baloo 2 — the app's own
face for scripts of the subcontinent), `WORLD_PACKS` and `WORLD_BLURB`, with
its own three painted scenery strips.

Art: 17 new generations (cover, divider, poster, 11 chapter openers, 3 strips),
taking the pack to **281**. The four volumes that moved down had their art
renamed in reverse (b17→b18 first) so nothing collided.

**Hub tiles are books now.** `books/index.html` shows each volume as its painted
cover at 3:4 with a spine gradient, a volume pill, a hover lift and a PDF pill;
`.bk-meta` is a flex column with the footer row pushed to `margin-top:auto`, so
tiles in a row stay aligned however long their subtitles run.
