# King's Playbook — Design System

The visual language of *King's Playbook: 24 Laws of Leadership for Those Who Wear the Crown* (Aayush Vishnoi), extracted from the original Canva edition and extended for the completed book. Any future session (or human) should be able to produce new pages, decks, or companion material from this folder alone.

## Files

| Path | What it is |
|---|---|
| `tokens.css` | All design tokens: palette, framework ramp, type families/roles, page geometry, watermark opacity |
| `components.css` | Every book component, styled against the tokens |
| `assets/icons/` | The 24 law icons (Canva originals; one per law, named) |
| `assets/chrome/` | Cover art, both crowns, ornate frames (gold/silver/thin), corner filigree, navy cloth texture, pendulum |
| `assets/art/` | King's Perspective portraits and behind-text watermark portraits (WebP with alpha) |
| `previews/` | Self-contained cards per component group (also serve as claude.ai/design Design-System cards) |

## The rules of the language

1. **Typography is fixed and authentic.** Cormorant Garamond (cover display) · Noto Serif Ethiopic at `font-stretch:66%` (chapter heads, THE LAW blocks) · Cardo Italic (subtitles, story titles) · Figtree (body — stand-in for Canva Sans). Body is justified and hyphenated.
2. **White pages, royal accents.** Interiors are white with black ink. Color is spent deliberately: navy/indigo for structure (frameworks, icon boxes), gold for honor (KP headings, numerals, ornament), peach for warm banners and caution quadrants.
3. **Artwork is extracted, never redrawn.** Icons, crowns, frames, portraits all come from the source PDF. New chapters without portraits use the gold crown in the KP slot until matching art exists.
4. **Frameworks are plates.** Every diagram carries the ◆-flanked small-caps title, then one of the canonical forms: keycap step-flow (navy→indigo ramp), plaque-number ladder, stepped trapezoid pyramid, colored-meaning 2×2 (navy=commit, lavender=neutral, peach=caution), navy-rail KV table, message pills (black/navy/indigo), sealed-hub network map, jewel cards, gold-ring rule numerals.
5. **Watermarks whisper.** Behind-text portraits render at 15–22% opacity, anchored to the opening story. KP portraits render solid, centered under the gold heading.
6. **Page geometry.** 6in × 9.6in; margins 0.55/0.58/0.62in; one thought per page in the original's spirit; gold page numbers bottom-center.
7. **Chapter anatomy** (every law, in order): lawno → kicker → icon+title → tagline (sacred text) → epigraph → opening story (+watermarks) → sub-principles → framework plate(s) → ◈ MY STORY placeholder (author-only) → Be/Do/Create → THE LAW → King's Perspective with verdict line.

## Using it

- **In Claude Code:** point a session at this folder ("follow book/design-system") when producing anything in the book's brand — new chapters, a workbook, slides, landing pages.
- **In claude.ai/design:** the same files are synced as the "King's Playbook — Design System" project; browse the cards, iterate visually, and sync changes back with /design-sync.
- **In the book build:** `book/kings-playbook.html` embeds these tokens/components inline (with fonts base64-embedded); this folder is the canonical, editable source.

## Pending portraits (drop-in slots)

Laws 9–24 currently use subject-matched portraits from the original art where the chapter's figures overlap (Frederick 9, Napoleon 14, Chanakya 16, Akbar 18, Welch 20) and the law's own icon as a faint background motif elsewhere. External image sourcing is blocked by this workspace's network policy, so to upgrade any chapter to a true portrait, drop a file with the name below into `assets/art/` (sketch/engraving style, transparent or light background, ≥400px) and ask Claude to wire it — placements are already defined:

`bismarck` (10) · `prithviraj` (11) · `cincinnatus`, `mandela`, `jamsetji` (12) · `alexander` (13) · `musk` (14 opener) · `babur`, `tipu` (15) · `damani` (16 opener) · `jahangir` (17) · `harun` (19) · `genghis` (20) · `marcus-aurelius`, `buffett` (21) · `louis-xiv`, `tendulkar` (22) · `doge-venice` (23) · `maharana-pratap`, `nadella` (24) · `yi-sun-sin` (8 KP) · `merkel`, `iger` (9 opener) · `ghosn` (11 opener) · `mulally` (20 opener)
