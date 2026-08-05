# books/art — the generated-art drop zone

Drop Nano Banana PNGs here with these exact names and re-run
`node books/mkbooks.js` — each named file replaces that slot's SVG art.
Slots without a file keep the built-in BB ANIME engine. Captions, titles and
credits are typeset by the layout ON TOP of your image, so generate with the
clear areas the prompts specify and "no text anywhere".

| Slug | Slot | Shape |
|---|---|---|
| `b01-cover.png` … `b17-cover.png` | front covers | portrait 3:4 (2550×3300) |
| `b01-divider.png` … `b17-divider.png` | world welcome pages | portrait 3:4 |
| `b01-ch01-opener.png` (per book & chapter) | storyboard openers | tall portrait (2175×2500) |
| `b01-poster.png` … `b15-poster.png` | back-of-book cast posters | portrait 3:4 |
| `strip-<world>-r<1|2|3>.png` | world bands (reused everywhere) | ultra-wide 6:1 (2175×360) |

Worlds for strips: meadow, library, forum, elements, engine, origami, strait,
junkyard, vibe, stage, warfield, greysea.

Your first five (from the chat): save as `bizzy-sheet.png` and `vex-sheet.png`
(references only, not used in layouts), `b01-cover.png`, `b01-ch01-opener.png`,
`strip-meadow-r1.png`.
