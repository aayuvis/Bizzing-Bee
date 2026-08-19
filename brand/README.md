# Brand assets

Kept OUTSIDE `spellbound-app/` on purpose: everything under that folder is copied
onto `gh-pages` at deploy time, and the site has a size budget that has been blown
once already. These are source assets, not site assets.

## bizzing-bee-icon.svg / -800.png — YouTube channel icon

`mascotSVG('happy')` from `spellbound-app/app.js`, composed over the brand purple
with a honeycomb pattern and a honey glow.

**YouTube does not accept SVG.** Upload the PNG; the SVG is the editable source.
Spec: 800×800, under 4MB, PNG/JPG/GIF/BMP.

Two things the geometry is doing deliberately:

- **The mascot is sized against the inscribed CIRCLE, not the square.** YouTube crops
  to a circle, so the binding constraint is the artwork box's half-DIAGONAL (≤400 in
  an 800 square), not its half-width. A first cut sized to the square looked correct
  flat and had the bee's striped abdomen sliced off by the crop at every display size.
  Current box is 498×560 — half-diagonal 374, comfortably inside r=400.
- **No wordmark.** The icon renders at 24px on watch pages and 48px in comments; type
  at that size is mush. The bee alone is legible at all four sizes YouTube uses
  (240 / 98 / 48 / 24).

Regenerate: extract `mascotSVG('happy')` from a loaded `index.html`, nest it as an
inner `<svg>` with explicit x/y/width/height (it ships `width="100%" height="100%"`,
which would resolve against the outer viewport), then rasterise at 800×800.

## bizzing-bee-banner-2048.png — YouTube channel banner

2048×1152. Source: `banner-source.html` (**copy it into `spellbound-app/` to render** —
it loads `fonts/fraunces-800.woff2` and `fonts/hanken-var.woff2` by relative path, and
must not be left there, since everything in that folder ships to the site).

**YouTube crops this three different ways** and only the smallest is guaranteed visible:

| Surface | Crop |
|---|---|
| TV | full 2048×1152 |
| Desktop | 2048×423, centred |
| Mobile / all devices | **1235×338, centred — the safe area** |

The whole lockup lives inside the 1235×338 box. Everything outside it is a decorative
word field that TV and desktop reveal and mobile discards, so nothing is lost.

Two deliberate choices, both aimed at "not just for small kids":

- **Typography is the hero and the mascot is a mark, not the subject.** The bee is 118px
  against a 108px wordmark. Leading with the bee reads as a toddler app; the audience is
  8–15 *and* their parents.
- **The background is real championship words**, pulled from the app's own library by
  `spellDiff` (nt-tagged, 9–13 letters, hardest first) — `dieffenbachia`, `terpsichorean`,
  `pecksniffian`. A wall of genuinely hard words signals serious training to a parent and
  a challenge to a teenager. A first pass used the plain `nt` tag and produced `umbrella`
  and `peekaboo`, which said the opposite.

Word placement uses a real axis-aligned rectangle overlap test with a gutter. The first
version used a centre-distance heuristic and long words slid straight through each other.
