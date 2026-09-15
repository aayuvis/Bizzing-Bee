# Asset Library

Every image and vector across the Bizzing repos, in one page you can open with no
server and no network.

    node tools/asset-library/scan.cjs          # walk + execute + thumbnail  → build/manifest.json
    node tools/asset-library/build-library.cjs # → build/library.html (self-contained)

`build/` is generated and gitignored. Rebuild it; don't commit it.

## Why it is not a `find` command

Art lives here in three shapes and only the first is on disk as art:

| shape | example | found by |
|---|---|---|
| **Image file** | `app-art/*.png`, `books/art/*.jpg` | walking the tree |
| **Vector file** | `art/kit/*.svg` | walking the tree |
| **Built in code** | `SB_AVATAR_ART.honeypot`, `WORLD_ART.meadow`, `GATTU('happy')` | **running the module** |

The third is the reason this exists. `saga-art/worlds-art.js` builds each plate
procedurally — seeded RNG, shared gradient and filter builders, `reg(id, svg)` into
`{vb, svg}` records. `icons-art.js` hangs its 88 icons off a *function*, not an object.
`avatars-art.js` interpolates `window.SB_MASCOT` into its own strings at load time.
`GATTU` is a function of mood.

None of that SVG exists in the source. It is the output of a program, so the scanner
executes the art modules in headless Chromium and harvests what they actually produce:
snapshot `Object.keys(window)`, inject one file, diff, then walk whatever is new for
anything SVG-shaped — strings, object values, `{vb, svg}` records, properties on a
function, and functions called with a few likely arguments. **Nothing is hardcoded**,
so a new art file is picked up with no change here.

That found **538 vectors invisible to any file scan**, against 724 `.svg` files.

## Things worth knowing

- **Inner markup gets a frame.** Most harvested art is a bare `<defs>`/`<g>` meant to be
  dropped into the app's own `<svg>`. It renders as nothing alone, so the scanner wraps it
  — using the record's real viewBox where there is one. The library flags those, because
  the frame is the scanner's, not the asset's.
- **Big vectors keep a thumbnail and a path, not their markup.** 408 of them are over
  12KB and together they outweigh every raster thumbnail combined; one kit tile is 653KB.
- **Thumbnails come from the browser**, not Pillow or ImageMagick — neither is installed.
  Bytes are read in node, handed to the page as a `data:` URI, drawn to a canvas, read back
  as WebP. `data:` and not `file://` on purpose: a `file://` image taints the canvas and
  `toDataURL` then throws.
- **`bizzing-bee-staging` is skipped.** It is a published copy of Bizzing-Bee, so counting
  it would double every asset and point anyone reusing art at a build output.
- **161 duplicates are folded** into one entry each, with the other locations listed.

## Knobs

    --root DIR        where the repos live            (default /home/user)
    --thumb 64        thumbnail longest edge, px
    --quality 0.5     WebP quality
    --keep-markup     bytes above which markup is shed (default 12000)
    --no-thumbs       manifest only, much faster

Thumbnail size and `--keep-markup` are the two dials that decide the page weight: at
64px / 0.5 / 12KB the whole library is 13.7MB, which fits in one page.
