# Spellbound — Design System

A spelling-bee trainer built for one real user: **Ahana**, ~9, preparing for the **North South Foundation National Finals (31 Jul 2026)**. Single-file web app, mobile-first, fully offline after first load. This document is the handoff for Claude Design: identity, tokens, components, and screen map, all extracted from the shipping build.

---

## 1. Identity

The default skin is **Marquee** — a theatrical *playbill / spelling-bee stage* look. The metaphor runs through the product: the word under test is the headliner "on stage," lit by warm brass footlights against a deep aubergine house. It deliberately avoids the three AI-default looks (cream+serif+terracotta, near-black+acid-green, broadsheet hairlines).

- **Mood:** warm, lit, theatrical, encouraging — never clinical.
- **Signature element:** the **hero word on stage** — a large Fraunces word with a brass text-glow, sitting above mono "letter tiles," under a repeating marquee-bulb top border (`body::before` dotted footlights).
- **Audience:** a gifted 9-year-old + a parent/coach. Copy is plain, active, kid-readable; never babyish.

### Theming model
Every visual is driven by CSS custom properties. A theme is just a remap of the **same token names** on `<html data-theme="…">`; components never hardcode color. Switching theme re-skins the entire app — palette, fonts, rank-ladder names, and background motif — with no layout change.

Eleven live themes: **Marquee** (default), **Aurora**, **Anime** (Naruto ranks), **Blossom**, **Science**, **Origami**, **Bromic Orange**, **Masters of the Universe**, **Avatar · Airbender**, **Demon Slayer**, plus legacy **Sunset/Forest** tokens. Each theme also carries an 8-rung **rank ladder** (e.g. Demon Slayer: Lower Demon → … → Demon King) used everywhere levels appear.

---

## 2. Color tokens (semantic)

Marquee values shown; all eleven palettes live in `spellbound-tokens.css` / `.json`.

| Token | Marquee | Role |
|---|---|---|
| `--bg1` | `#181222` | Page background, top of gradient |
| `--bg2` | `#211734` | Card / surface |
| `--bg3` | `#0f0a18` | Deep wells, footer |
| `--surface` | `rgba(255,255,255,.045)` | Subtle raised fill |
| `--surface2` | `rgba(255,255,255,.075)` | Inputs, chips, nav rail |
| `--line` | `rgba(232,178,58,.18)` | Hairline borders & dividers |
| `--text` | `#f3ecdf` | Primary text (warm ivory) |
| `--muted` | `#b0a48e` | Captions / secondary |
| `--accent` | `#e8b23a` | Primary brand (brass) — buttons, active tab, current rank |
| `--accent2` | `#f0c668` | Secondary highlight |
| `--accent3` | `#fff4d6` | Tertiary / bulb glow |
| `--good` | `#5fd1a0` | Success / mastered |
| `--bad` | `#e2557a` | Error / missed |
| `--chip` | `rgba(232,178,58,.14)` | Pill / chip tint |
| `--glow` | `0 14px 50px rgba(0,0,0,.5)` | Ambient elevation |

**Heatmap state colors** derive from these: mastered → `--good`, review/in-progress → `--accent3`, learning → `--accent2`, missed → `--bad`, new/untested → `--surface`.

---

## 3. Typography

One Google Fonts import (see tokens). Three roles, plus per-theme display swaps.

| Role | Token | Marquee face | Used for |
|---|---|---|---|
| Display | `--display` | **Fraunces** (serif, opsz) | Hero word, H2/H3, rank names, stat numbers |
| Body | `--body` | **Hanken Grotesk** | Paragraphs, labels, buttons, captions |
| Mono | `--mono` | **Space Mono** | Spelling input + letter tiles + word-list words |

Per-theme display overrides: Baloo 2 (Aurora/Anime/Bromic/Slayer), Orbitron (Science/Masters), Fredoka (Blossom), Quicksand (Origami/Avatar). Body and mono stay constant for legibility.

**Type scale:** hero `clamp(34px, 9vw, 52px)` · H2 `22px` · H3 `16px` · body `15px` · tiny `12px` · mono tile `20px`. Weights: display 500–700, body 400–800.

---

## 4. Space, radius, elevation

- **Radius:** `8` (chips/tabs) · `12` (inputs, small cards) · `14` (cards — the workhorse) · `16` (pickers) · `999` (pills). Flat, de-glassed: cards use a 1px `--line` border and `--bg2` fill, **no blur, minimal shadow**.
- **Spacing rhythm:** 4 / 8 / 12 / 14 / 18 / 24. Card padding `18`, card gap `14`.
- **Elevation:** one ambient `--glow` for modals/celebrations; surfaces otherwise sit flat. Hover lifts interactive tiles `translateY(-2px)` and borders shift to `--accent`.

---

## 5. Iconography & motion

- **UI icons:** a single inline SVG set (`ICONS{}` + `icon(name)`), 24px viewBox, `stroke: currentColor`, 1.7 weight, round caps — book, pencil, mic, volume, gauge, repeat, globe, chart, blocks, trophy, upload, pulse, etc. They inherit text color, so they re-theme for free.
- **Rank icons:** emoji/unicode per theme ladder (🗡️ 👺 🌀 👑 …), shown in the climb and rank ladder.
- **Motion (restrained):** current-rank node pulses on the climb; confetti + a big "Rank Up!" card on promotion; tiles lift on hover; the marquee footlights are a static repeating-dot border. Respect `prefers-reduced-motion` when extending.

---

## 6. Component inventory

Class → role. Full rules in `spellbound.css`.

**Shell**
- `.topbar` — app bar: hamburger (`#menuBtn`), wordmark, sparkle + gear.
- `.drawer` / `.scrim` / `.navitem` / `.navlabel` / `.navsub` — slide-in nav to every journey + Word Coach sub-modes.
- `.card` — primary container. `.strip` + `.stat` (`.v`/`.k`) — 3-up stat row.
- `.btn` (+`.ghost` outline, `.block` full-width, `.lg` large), `.backlink`.

**Navigation within journeys**
- `.topnav` / `.navtab` (`.active`) — segmented top tabs (Word Coach: Train · Setup · Heatmap · Parent).
- `.headrow .navbtn` — right-aligned section action (e.g. Concepts → Heatmap).
- `.acc` / `.acchead` / `.accbody` / `.chev` — accordion stages (Concepts).
- `.phase .navbtn` — in-session "Word list" nav (before Exit).

**Journey 1 · Level-Up**
- Serpentine climb map (`mapnode`s) — 20 levels, current pulsing, cleared starred, locked/premium gated.
- `.ladder` / `.lrung` (`.cur`/`.done`) / `.ric` / `.rnm` / `.rlv` — themed rank ladder with level names.
- Flow per list: Practice → Test → Revise → Heatmap. `.stage` / `.bigword` (`.listen`) / `.hint`; `.judge` + `.chipbtn` (Again/Slow/Definition/Sentence/Origin/Roots); `.spellinput`.

**Journey 2 · Concepts**
- `.ctilegrid` / `.ctile` (`.ctt`/`.ctm`) — concept tiles with `.dchip` difficulty (`.d-easy`/`.d-med`/`.d-hard`).
- `.deck` / `.tcard` (`.kind`) / `.dots` — flash-card carousel (worked-example + 5 cards).

**Journey 3 · Word Coach**
- `.countdown` (`.num`/`.lbl`, `.past`) — days-to-bee.
- `.modegrid` / `.modecell` — Study / Written / Oral / Weak drill.
- `.readgrid` — New/Learning/Review/Mastered breakdown; `.bar` readiness.

**Cross-cutting**
- `.heatmap` (`.compact`) / `.hmcell` (`.hm-good`/`.hm-mid`/`.hm-bad`/`.hm-learn`/`.hm-new`) / `.hmlegend` — appears on **every** journey.
- `.wordlist` / `.wlrow` (`.ww`/`.wd`) — full word list views.
- `.bar` (progress), `.ring` (radial), `.reveal` (`.ok`/`.flag`) — answer feedback.

**Pickers / system**
- `.themegrid` / `.themecell` (`.sw`/`.nm`) — swatch theme picker.
- `.lvpick` / `.lvpickcell` — onboarding rank picker (age-suggested).
- `.modal`, `.toast`, `.celebrate` / `.bigcele`, `.avatarpick`, form `.fld`/`.txt`/`.spellinput`.

---

## 7. Screen map

1. **Login / new player** — name, age, avatar.
2. **Onboarding** — pick theme (world) → pick starting rank (free levels 1–5, age-suggested).
3. **Home** — greeting, progress track, three journey tiles, streak.
4. **Journey 1 · Level-Up** — rank ladder + serpentine climb → Practice/Test/Revise/Heatmap.
5. **Journey 2 · Concepts** — accordion stages of concept tiles + Heatmap tab; concept = worked example + 5 cards + practice + word list.
6. **Journey 3 · Word Coach** — Train / Setup / Heatmap / Parent tabs.
7. **Settings** — player, theme grid, word database, backup, premium toggle.

---

## 8. Voice

Plain, active, sentence case. Encouraging without being saccharine. Actions keep their name through the flow (the button says "Practise these words →", the screen that follows is the practice). Empty/error states give direction, not mood ("Set a target list in Setup to see your word heatmap").

---

## 9. Files in this handoff

| File | What it is |
|---|---|
| `spellbound.html` | The full running app — **core code** (single file: HTML + CSS + JS + embedded data). |
| `spellbound.css` | The complete stylesheet, extracted (tokens + every component rule). |
| `spellbound-tokens.css` | Just the token layer — `:root` (Marquee) + all eleven `[data-theme]` palettes + primitives. |
| `spellbound-tokens.json` | Machine-readable tokens (global, semantic w/ usage notes, per-theme) for Figma / Design import. |
| `DESIGN-SYSTEM.md` | This document. |

**Data (not design, included for context):** `concept_chapters.json` (115 concepts), `bee_words_master.json` (attested champion words), `nsf_words.json` / `ahana_north_south_final.json` (North South Finals list), and the runtime-loaded SUPER master (~128k words, not embedded).

> Note on themes: Demon Slayer / Avatar / Masters of the Universe use franchise-flavored rank names by request, for private personal use. For a shareable build, swap to the IP-safe set (Nightblade / Elements / Star Sentinel) — a one-line change in the `LADDERS` and `THEMES2` blocks.
