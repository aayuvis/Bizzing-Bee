# Spellbound — Design Requirements (v3, current build)

Hand-off for rebuilding the **full Spellbound web app** in Claude. This supersedes the original `DESIGN-SYSTEM.md` where they differ. Read this **delta section first** — it lists every requirement that has changed since the first handoff — then the full current spec below it.

Spellbound is a spelling-bee trainer for one real user: **Ahana**, ~9, preparing for the **North South Foundation National Finals (31 Jul 2026)**. Single-file, mobile-first, fully offline after first load.

---

## 0. WHAT CHANGED (delta from original handoff) — read this first

| Area | Was (v1) | **Now (v3)** |
|---|---|---|
| **Theme count** | 11 themes + legacy Sunset/Forest | **Exactly 8 themes.** See §2. |
| **Themes removed** | — | Blossom, Bromic Orange, Masters of the Universe, Sunset, Forest (all deleted, tokens gone). |
| **Theme added** | — | **Spellbound** — the brand skin (violet + gold bee identity). |
| **Theme renamed** | Aurora | **Galaxy** (everywhere: switcher, label, nomenclature, tweak). Internal id stays `aurora`. |
| **Default skin** | Marquee | **Spellbound** (brand-first). |
| **Anime ranks** | Naruto names | **Demon Slayer corps** nomenclature (Mizunoto → Hashira). |
| **Light/Dark** | Dark-only (deep aubergine) | **No dark mode.** Two grounds: **Light** (tinted paper, default) + **White** (pure white). Toggle lives top-left of the masthead. See §6. |
| **Levels** | 8-rung rank ladder (text only) | **10-form evolution per theme**, each level its own **animated emblem** that visually evolves egg→final. New nomenclature per theme. See §5. |
| **Brand logo** | none | **Bee mascot wordmark**, fixed gold/violet, top-left of masthead — does NOT recolor per theme. See §4. |
| **Per-theme logo** | none | Each theme has its own **animated sub-logo** shown beside the live-theme label. See §4. |
| **Radius** | mixed 8–16px | **Unified ~13px** on cards/tiles/inputs/buttons (frames 20/15, pills 999). Tighter, more modern. |
| **Elevation** | flat | Subtle **3D bottom-lip** on stat boxes, concept tiles, buttons, current rank rung (gentler than Duolingo). |
| **Rank & Evolution** | two cards (RankLadder + In-Motion) | **One merged card** — animated evolution ladder with current form highlighted. |

Everything below is the full current spec incorporating these.

---

## 1. Identity

The default skin is now **Spellbound** — the brand identity: a friendly **bee mascot** on a violet-and-gold palette. The bee is the product's face; the spelling word is still the "headliner on stage," but the master identity is the bee, not the playbill.

- **Mood:** warm, magical, encouraging, kid-readable — never clinical, never babyish.
- **Signature elements:** (1) the **bee mascot** wordmark; (2) the **hero word** under test, large display face with a soft glow; (3) the **per-theme animated sub-logo** + **evolving level emblem**.
- **Audience:** a gifted 9-year-old + a parent/coach.

### Theming model (unchanged in principle)
Every visual is driven by CSS custom properties on `<html data-theme="…">`. A theme is a remap of the **same token names**; components never hardcode color. Switching theme re-skins palette, display font, level nomenclature, sub-logo, and evolution emblems — **no layout change**. Mode (`light` / `white`) is an orthogonal switch applied on top of any theme.

---

## 2. Themes — exactly 8

Order, label, internal id, signature accents, sub-logo concept:

| # | Label | id | Accent A | Accent B | Sub-logo (animated) |
|---|---|---|---|---|---|
| 1 | **Spellbound** *(default, brand)* | `spellbound` | `#7C5CFF` violet | `#FFC83D` gold | the bee mascot, cycling moods |
| 2 | **Marquee** | `marquee` | `#E8B23A` brass | `#211734` aubergine | spotlight beam onto a twinkling footlight star |
| 3 | **Galaxy** | `aurora` | `#7C5CFF` violet | `#36D1FF` cyan | tilted, spinning Milky-Way spiral disc |
| 4 | **Anime** *(Demon Slayer)* | `anime` | `#FF4D8D` pink | `#36E2FF` cyan | scenic katana-glint circle |
| 5 | **Science** | `science` | `#22B814` green | `#16BEDC` cyan | bubbling flask / orbiting electron |
| 6 | **Origami** | `origami` | `#D9694A` terracotta | `#5F8A6B` sage | folding paper crane |
| 7 | **Pixel** | `pixel` | `#12B59C` teal | `#FF5D9E` pink | blinking 8-bit sprite |
| 8 | **Avatar** *(elemental)* | `avatar` | `#F3A13C` amber | `#2FA7D8` blue | four elements orbiting a core |

**Per-theme display font swaps** (body + mono stay constant for legibility): Baloo 2 (Spellbound/Galaxy/Anime), Orbitron (Science/Pixel), Quicksand (Origami/Avatar), Fraunces (Marquee).

> IP note: Anime uses Demon Slayer corps names and Avatar uses elemental names for **private personal use**. For a shareable build, swap to IP-safe names in the nomenclature block (one-line change).

---

## 3. Color & type tokens

**Brand palette (Spellbound):** Violet `#7C5CFF` · Indigo `#3A2A8C` · Night `#1C1442` · Gold `#FFC83D` · Pink `#FF4D8D` · Lavender `#F3EFFF`.

Semantic token names are unchanged from v1 (`--bg1/2/3`, `--surface`, `--surface2`, `--line`, `--text`, `--muted`, `--accent`, `--accent2`, `--accent3`, `--good`, `--bad`, `--chip`, `--glow`). Each of the 8 themes remaps them; the full palettes live in `spellbound-tokens.css` / `.json`. **Components never hardcode color — always reference tokens.**

**Type roles:** Display `--display` (per-theme, default **Baloo 2** for brand) · Body `--body` (**Nunito** / Hanken Grotesk) · Mono `--mono` (**Space Mono**) for spelling input, letter tiles, word-list words. Brand pairing is **Baloo 2 + Nunito**.

Type scale: hero `clamp(34px,9vw,52px)` · H2 `22` · H3 `16` · body `15` · tiny `12` · mono tile `20`.

---

## 4. Logos & placement

**Master logo — the bee.** A bee-mascot wordmark sits **top-left of the masthead**. It is **brand-locked to gold/violet and does NOT recolor** when the theme changes — it is the constant identity across all skins. The bee mascot also has **6 moods** (see §7) used contextually in-app.

**Per-theme sub-logo.** Beside the **live-theme label** (the "current theme" indicator), each theme renders **its own distinct animated sub-logo** (the emblems listed in §2). This is the element that changes with the theme — it animates continuously (spin, twinkle, fold, blink, orbit, etc.) and must **stay visible in both Light and White modes** (pale emblems carry outlines / a `--slw` swap tone on white grounds).

**Placement summary:**
- Masthead top-left: fixed bee wordmark (never recolors).
- Masthead theme indicator: animated per-theme sub-logo (recolors + animates).
- Merged Rank & Evolution card: the 10 evolving level emblems (see §5).

App icons exist in brand violet/gold for launcher/installed states.

---

## 5. Levels — 10-form evolution per theme

**This replaces the old 8-rung text ladder.** Every theme has **10 levels**, and each level is a **distinct animated emblem** that visually **evolves** from a humble start to a triumphant final form (e.g. Spellbound: egg → … → queen bee). The current level is highlighted; past levels read as "achieved," future levels as upcoming.

**Nomenclature per theme (level 1 → 10):**

- **Spellbound:** Egg · Hatchling · Larva · Grub · Pupa · Cocoon · Worker · Forager · Spellbinder · Queen Bee
- **Marquee:** Spark · Flicker · Bulb · Footlight · Rising Star · Star · Featured · Headliner · Legend · Marquee
- **Galaxy:** Dust · Cloud · Moon · Planet · Spark · Star · Pulsar · Nebula · Quasar · Galaxy
- **Anime (Demon Slayer):** Mizunoto · Mizunoe · Kanoto · Kanoe · Tsuchinoto · Tsuchinoe · Hinoto · Hinoe · Kinoe · Hashira
- **Science:** Spark · Drop · Vial · Sample · Reaction · Catalyst · Compound · Formula · Theory · Eureka
- **Origami:** Sheet · Fold · Cup · Boat · Dart · Plane · Lotus · Crane · Dragon · Swan
- **Pixel:** Bit · Byte · Sprite · Pixel · Hero · Combo · Mini-Boss · Boss · High Score · Arcade
- **Avatar:** Pebble · Breeze · Gust · Droplet · Wave · Stone · Boulder · Ember · Flame · Avatar

**Emblem requirements:**
- Each of the 80 emblems (8 themes × 10 levels) is a small inline-SVG built from the theme's accents, with **stage-specific motion** (early forms wobble/crawl/drip; mid forms pulse/spin; finals soar/shine).
- The progression must be **recognizable as growth** — silhouettes get more elaborate and confident toward level 10.
- Must read clearly on **both Light and White** grounds — pale early forms (egg, paper sheet, water drop) carry a thin ink outline so they survive white.
- The canonical alignment reference is the **Evolution Board** (`Evolution Board.dc.html`): an 8×10 grid in both Light and White, used to lock visibility before wiring into the app.
- In-app, the single-theme animated ladder is the **`EvoLadder` component** (`EvoLadder.dc.html`), embedded in the merged **Rank & Evolution** card with the current form highlighted.

---

## 6. Light & White modes (no dark)

There is **no dark mode**. Two grounds, toggled top-left of the masthead, persisted:

- **Light (default):** each theme's warm **tinted-paper** ground (not white) with its accents — the everyday look.
- **White:** **pure white** background, dark text, each theme's accents preserved but **darkened where they'd be unreadable** on white (via a `--slw` swap token). All emblems and sub-logos must stay legible.

The toggle is a two-segment control labeled **Light / White**; active segment uses the theme accent. Mode is independent of theme — any of the 8 themes works in either mode.

---

## 7. Mascot moods, iconography, motion

- **Bee mascot — 6 moods:** Happy (default/idle) · Hyped (streak/win) · Smitten (favorited) · Sleepy (night) · Oops (wrong answer) · Whoa (surprise reward). Each has a tinted backdrop chip.
- **UI icons:** one inline SVG set, 24px viewBox, `stroke: currentColor`, ~1.7 weight, round caps — re-themes for free by inheriting text color.
- **Motion (restrained):** current-level emblem + sub-logo animate continuously; confetti + a "Level Up!" celebration on promotion; interactive tiles lift `translateY(-2px)` on hover with border → accent. Flashcard decks do **not** auto-animate. Respect `prefers-reduced-motion`.
- **Elevation:** subtle **3D bottom-lip** (a darker inner bottom edge) on stat boxes, concept tiles, primary buttons, and the current rank rung — present but **gentler than Duolingo**. Otherwise surfaces sit flat with a 1px `--line` border.

---

## 8. Radius, space, elevation

- **Radius (unified):** **~13px** on cards, tiles, inputs, buttons. Device/frame mocks 20 / 15px. Pills & circles `999`. (Replaces the old mixed 8–16 scale — corners are tighter and consistent now.)
- **Spacing rhythm:** 4 / 8 / 12 / 14 / 18 / 24. Card padding 18, card gap 14.
- **Elevation:** one ambient `--glow` for modals/celebrations + the subtle bottom-lip described above.

---

## 9. Component inventory (current)

Unchanged from v1 except as noted. Shell (`.topbar` with fixed bee + mode toggle + theme indicator, `.drawer`/`.navitem`, `.card`, `.strip`/`.stat`, `.btn` + `.ghost`/`.block`/`.lg`). Journey navigation (`.topnav`/`.navtab`, `.acc` accordions). 

**Changed / new:**
- **Rank & Evolution card** (merged) — embeds `EvoLadder`: the 10 animated evolving emblems with nomenclature, current form highlighted. Replaces the separate RankLadder and "In-Motion" cards.
- **Theme picker** `.themegrid`/`.themecell` — now **8** swatches; Galaxy label (not Aurora).
- **Mode toggle** — Light / White segmented control in the masthead.
- Heatmaps (`.heatmap`/`.hmcell` states good/mid/bad/learn/new), word lists, flash-card decks (`.deck`/`.tcard`, no auto-anim), concept tiles (`.ctile` + difficulty chips), countdown to bee — all retained.

---

## 10. Screen map (unchanged)

1. Login / new player (name, age, avatar)
2. Onboarding — pick theme (1 of 8) → pick starting level
3. Home — greeting, progress, three journey tiles, streak, Rank & Evolution card
4. Journey 1 · Level-Up — evolution ladder + serpentine climb → Practice / Test / Revise / Heatmap
5. Journey 2 · Concepts — accordion stages of concept tiles + Heatmap
6. Journey 3 · Word Coach — Train / Setup / Heatmap / Parent tabs
7. Settings — player, **8-theme** grid, **Light/White** mode, word database, backup, premium

---

## 11. Voice (unchanged)

Plain, active, sentence case. Encouraging, never saccharine. Actions keep their name through the flow. Empty/error states give direction, not mood.

---

## 12. Files in this handoff

| File | What it is |
|---|---|
| `Spellbound.dc.html` | The living design-system board — masthead, all 8 themes, Light/White, merged Rank & Evolution card, components. **Primary reference.** |
| `EvoLadder.dc.html` | Single-theme animated evolution ladder (the in-app component). |
| `Evolution Board.dc.html` | 8×10 alignment grid of every level emblem, in Light + White — visibility reference. |
| `SpellboundMascot.dc.html` | The bee mascot + its 6 moods. |
| `spellbound-tokens.css` | Token layer — `:root` + all 8 `[data-theme]` palettes + Light/White primitives. |
| `spellbound-tokens.json` | Machine-readable tokens. |
| `spellbound.css` | Full extracted stylesheet (component rules). |
| `DESIGN-REQUIREMENTS.md` | This document (v3). |
| `DESIGN-SYSTEM.md` | Original v1 handoff (kept for context; this doc overrides it where they differ). |

**Data (context, not design):** `concept_chapters.json` (115 concepts), `bee_words_master.json`, `nsf_words.json` / `ahana_north_south_final.json`, plus the runtime SUPER master (~128k words, not embedded).
