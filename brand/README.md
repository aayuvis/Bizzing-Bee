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
