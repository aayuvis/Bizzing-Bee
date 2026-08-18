# Extend the Moment — Bromic brand campaign

> **Open `Extend-the-Moment-Deck.html`.** That is the finished deck, ~5 MB, with all 57 mood
> boards embedded — works offline, no network.
>
> **Open it in a real browser** (Safari, Chrome, Edge), not a file-preview pane. iOS Quick
> Look and most email previews block JavaScript, and the deck is interactive — tone switches,
> expand-to-brief, the before/after turns — so in a preview pane it will look empty or dead.
> On a phone: share the file to Safari, or use the hosted link below.
>
> Everything in `src/` is build machinery. `src/deck.source.html` is the template with
> **no images in it**; assets are injected at build time. Opening it directly shows an
> asset-less deck.

| File | What it is |
|---|---|
| `EXTEND-THE-MOMENT-CAMPAIGN.md` | Concept evaluation, strategic reframe, six executions, channel plan, measurement, risk register |
| `EXTEND-THE-MOMENT-TWELVE-MORE.md` | Twelve further concepts pushed harder on comedy, plus two trade additions |
| `EXTEND-THE-MOMENT-20-CONCEPTS.md` | 20 culturally-tagged concepts for US + AUS, with a summary grid and shortlist |
| **`Extend-The-Moment.pptx`** | **PowerPoint deck — 33 slides, image-led, built to the Bromic design system** |
| **`Extend-the-Moment-Deck.html`** ← open this one | **Standalone deck — every image and the film embedded as data URIs. Open it anywhere, offline, no network.** |
| `EXTEND-THE-MOMENT-THE-RECEIPT.md` | Second format — the inverted price stack, in type and as priced photography, with legal guidance |
| `EXTEND-THE-MOMENT-TRADE-COMMERCIAL.md` | Tier 2 — 5 builder + 5 commercial concepts with full campaign briefs |
| `boards/` | 35 AI-generated mood board frames (Gemini `gemini-3-pro-image`), 1200px JPEG |

**Published deck:** https://claude.ai/code/artifact/b84bd3c2-c832-4407-9ef6-ee69107e3596

Mood boards are tonal references for direction only — lighting, staging, casting age and comic
register. They are not storyboards or final frames, and depict no real product.

## The PowerPoint deck

`Extend-The-Moment.pptx` — 33 slides, 7.3 MB, 16:9 (13.333 × 7.5 in).

Built to the supplied **Bromic Heating design system** (`ppt/design-system/`): Arial
throughout, ember `#EF4123` as the single accent, Bromic black `#0E0F11` for cover and
section fields, the flame mark and both logo lockups.

It is a **visual** deck, not a specification one — the mood boards run full-bleed and the
writing sits on them:

| Slides | |
|---|---|
| Cover + the problem | Black fields, the flame, the category's "same ad" argument |
| 01 · The films | Six plates, each as a cold frame carrying the line and a warm frame carrying the endline |
| 02 · The Receipt | Four receipts as full-slide typography, the punch line in ember |
| 03 · Priced scenes | Four photographs with live price pins positioned from the campaign's own coordinates |
| 04 · The concept bank | 32 concepts, then 12 for builders, architects and commercial operators |
| Close | The 4%-of-the-build argument, resolving to Extend The Moment |

Rebuild with `node src/build-pptx.js` (needs `pptxgenjs`). `src/render-pptx.py` renders the
generated file to PNGs for visual checking — LibreOffice cannot load `.pptx` in this
environment, so that script reads the real deck with `python-pptx` and draws it with Pillow.
