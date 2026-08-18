# Bromic Heating — PowerPoint Design System

**Handover for a Claude session.** Everything needed to build a Bromic deck is in this folder. Self-contained — no other project files required.

```
powerpoint-handover/
  POWERPOINT-HANDOVER.md     ← this file
  Bromic Sample Deck.html    ← working 6-slide reference. Copy it and replace content.
  assets/
    bromic-logo-dark.png     on light slides
    bromic-logo-white.png    on dark slides
    bromic-flame.png         mark alone
```

**Fastest path:** open `Bromic Sample Deck.html`, copy the `<style>` block verbatim, replace the slide content. The CSS *is* the spec.

---

## 1. Canvas

| | |
|---|---|
| Aspect | 16:9 |
| Size | 13.333 × 7.5 in = **1280 × 720 px @ 96 dpi** |
| Left / right margin | 0.38 in · **36 px** |
| Background | `#FFFFFF` (content slides) · `#0E0F11` (cover / section breaks only) |
| Body text colour | `#231F20` |

Build every slide as a `1280 × 720` `position:relative` div with `overflow:hidden`. Position furniture absolutely — this is a deck, not a responsive web page.

## 2. Colour

Nine colours run the whole deck. Hardcode these hex values.

**Structure & accent**

| Role | Hex | Where |
|---|---|---|
| Deck ink | `#231F20` | Titles, body, Next-Steps bar, chart baseline |
| **Ember 500** | `#EF4123` | **Brand primary.** Accent rule, live data series, title highlight |
| Ember 600 / 400 | `#CC3315` / `#F46A4A` | Icon glyph on soft fill · accent on dark backgrounds |
| Ember 100 | `#FBE0D8` | Icon tiles, soft fills |
| Bromic Black | `#0E0F11` | Cover / full-bleed fields only |
| Steel 500 | `#71777D` | Axis labels, captions, secondary detail |
| Steel 400 / 300 | `#969CA2` / `#BCC1C5` | Page numbers · **comparison / prior-year bars** |
| Steel 200 / 100 / 50 | `#DDE0E2` / `#EFF1F2` / `#F6F7F8` | Dividers · row rules · panel fills |

**Status — RAG only** (fill / text pairs, taken from the client's real VCP deck)

| Status | Fill | Text |
|---|---|---|
| On track | `#C1F0C8` | `#067140` |
| Watch | `#FCEFD6` | `#8A5E12` |
| At risk | `#F7D6D4` | `#C00000` |
| Context | `#C0E6F5` | `#04698C` |

Two hard rules: **one ember emphasis per slide** — the single number or phrase the audience must remember. And **RAG colours signal status only** — never decoration, never a chart palette.

## 3. Type

**Arial** for everything. Helvetica Neue is the acceptable Mac substitute. Stack:

```css
font-family: Arial, 'Helvetica Neue', 'Liberation Sans', sans-serif;
```

Figures in tables and chart values may use `'IBM Plex Mono', Menlo, monospace`. Never for prose.

Two weights only — **700** for titles, lead-ins and numbers; **400** for everything else. No italics, no light weights, no other family.

| Role | Size | Weight | Notes |
|---|---|---|---|
| Slide title | 24 pt / 30 px | 700 | line-height 1.16, **max 2 lines** |
| Sub-head / driver lead | 14 pt / 13.5 px | 700 | |
| Panel & chart label | 10.5 pt / 11 px | 700 | UPPERCASE, letter-spacing `.08em` |
| Body | 10 pt / 13 px | 400 | line-height 1.45, sentence case |
| Secondary detail | 9 pt / 11.5 px | 400 | `#5A6066`, line-height 1.4 |
| Chip / micro-label | 9 pt | 700 | UPPERCASE, `.06em` |
| Footer / source | 7 pt / 9 px | 400 | `#969CA2` |

Never below 9 pt. Never above 24 pt except a cover.

**Titles are conclusions, not topics.** "Revenue" is a topic. "Revenue triples to A$251M by FY2030" is a title. Write the title first, then build the slide to prove it.

## 4. Slide furniture — exact positions

Six repeating parts. Copy these numbers exactly; consistency across slides is the whole point.

### Section tab — `left:0; top:0`, flush to the corner, height 26px
Ember number chip (30px wide, `#EF4123`, white bold 12px) + ink name plate (`#231F20`, white 600 12px, padding `0 14px`).

### Title zone — `left:36px; top:33px`, box `1190 × 90px`
24pt (30px) bold, line-height 1.16, `#231F20`. Wrap the one key phrase in a span coloured `#EF4123`.

> **Non-negotiable:** the title zone never moves and never grows. If the headline won't fit two lines at 24pt, **cut words** — do not shrink the type or push the rule down.

### Accent rule — `left:48px; top:118px`, `535 × 3px`, `#EF4123`
Short, not full width. Sits under the title, indented 12px past the title's left edge.

### Body field — `top:140px` to `bottom:118px`, margins 36px, column gap 34px
Default split is 50/50: **evidence left, implication right.** Chart or table on the left; drivers, findings or consequences on the right.

### Next Steps kicker — `left:36px; right:36px; bottom:30px`
`#231F20` bar, padding `13px 20px`, flex row: ember-400 (`#F46A4A`) tag `NEXT STEPS` at 10px/700/`.16em` caps → one action sentence at 13px/600 white → ember arrow pushed right.

**Every content slide ends with one.** One sentence naming a decision, an owner, or a next move.

### Footer — `bottom:6px`
Logo left at `left:36px` (height 15px) · source line at 9px `#BCC1C5` · page number right at 9px `#969CA2`.

## 5. Charts

- Live/current series **ember**; comparison, prior-year or context series **steel-300** (`#BCC1C5`). Two colours maximum in a series set.
- Value labels **directly on the bars** (13px/700, 19px above the bar top). Then drop the y-axis, gridlines and legend.
- Baseline: `2px solid #231F20`. Category labels below at 11px/600 `#71777D`.
- Bars: `flex:1` in a flex row with `gap:18px`, `max-width:58px`, `border-radius:2px 2px 0 0`.
- Cite the source in the footer at 7–9pt on any slide carrying data.
- A CAGR / delta callout sits top-right of the chart area as a `#C1F0C8`/`#067140` pill.

## 6. Layout library — pick one, don't invent

1. **Cover** — black field, white title, ember rule, date + audience bottom-left, white logo.
2. **Agenda** — numbered sections down the left half; the current section in ember.
3. **Statement** — one claim, single full-width evidence panel beneath it.
4. **Metric row** — 3–4 stat panels across, mono figures, RAG chips.
5. **Chart + drivers** — the workhorse. Chart left, 3–4 driver rows right. *(Slide 4 of the sample.)*
6. **Two-up compare** — today vs. target; light panel left, `#231F20` panel right.
7. **2 × 2 matrix** — positioning, prioritisation, effort/impact. Ember marks Bromic's position.
8. **Roadmap / table** — rows by horizon with an ember spine down the left edge.

## 7. Do / Don't

**Do**
- Write the title as the conclusion, then build the slide to prove it.
- End every content slide with a Next Steps kicker naming a decision or owner.
- Keep one ember emphasis per slide.
- Grey out comparison bars so the ember series reads instantly.
- Label values directly on bars; drop gridlines and legends.
- Cite sources at 7pt in the footer on any data slide.
- Define RAG thresholds once, up front.

**Don't**
- Shrink the title, move the title zone, or run to three lines.
- Add gradients, drop shadows, bevels or SmartArt.
- Use more than two colours in a chart series set.
- Colour anything green or red unless it is genuinely a status signal.
- Nest bullets, or write a bullet longer than two lines.
- Mix fonts. Arial, plus mono for figures — nothing else.
- Stretch, recolour or busy-background the logo.

## 8. Icons

Lucide, monochrome, via UMD:

```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
<script>lucide.createIcons();</script>
```

Usage: `<i data-lucide="trending-up"></i>` — 18px inside a 34px `#FBE0D8` tile with `#CC3315` glyph, or 20px white/ember inline. **No emoji, ever.**

## 9. Brand context

Bromic Heating — global leader in **premium infrared outdoor heating**. Architectural, engineered, warm-minimal. Tagline **Extend The Moment**. Deck voice: direct, quantified, action-forward — consulting register, no marketing adjectives, no hedging. Every claim carries a number or a source.

## 10. If you need PowerPoint out the other end

Build the HTML deck first to this spec, then export. The layout is absolutely positioned with real text nodes, so an editable export maps cleanly to native PowerPoint text boxes and shapes; hand-drawn chart bars are plain divs and survive as rectangles. Flag any `<canvas>` or SVG diagram for rasterised export instead.
