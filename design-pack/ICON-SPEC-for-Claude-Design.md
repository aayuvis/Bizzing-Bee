# Bizzing Bee — Full Illustrated Icon Set — spec + Claude Design prompt

Bizzing Bee is an offline spelling-bee trainer for kids 7–14 (primary speller ~9) + parents. It already ships 150 collectible **avatars** that are fun, candy-coloured, glossy sticker illustrations with a soft ink outline. **The app's icons don't match that energy — they read flat and monotone.** This doc lists **every icon in the app** with a description, plus a ready-to-paste prompt.

---

## ⭐ PROMPT FOR CLAUDE DESIGN (paste this)

> Design a cohesive set of **fun, multi-colour, glossy "sticker" icons** for my kids' spelling app **Bizzing Bee**, matching the personality of my existing collectible avatars: candy-coloured, chubby rounded forms, a soft **deep-plum ink outline (`#2A1B4A`, ~2.5px)**, a white gloss highlight across the upper third, a gentle contact shadow, slight top-down light. NOT flat line-icons and NOT a single hue with a white glyph — **each icon is a tiny multi-colour illustration** (2–4 candy colours), with a spark of personality (a small face or sparkle where it fits). A bee / honey-gold / hexagon motif may garnish but not clutter.
>
> **Deliver** one file `icons-art.js` exposing `window.SB_ICON_ART = { <key>: '<svg viewBox="0 0 64 64">…</svg>', … }` with one entry per key in the list below. Each SVG must be **self-contained full colour** (do not rely on `currentColor`), transparent background, ≤ ~2.5 KB, legible on both light (`#F6F3FF`) and dark (`#1A1030`) cards (add a 1px light inner keyline if the dark outline would vanish on dark mode). Design at 64px; icons are shown in-app at 14–54px, so they must read down to ~20px. Keep one consistent outline weight, corner rounding and gloss angle across the whole family. Also produce a **contact-sheet preview** (all icons, light + dark) so I can check consistency.
>
> The most-used icon is `coin`: make it a **fat glossy GOLD coin** (gold gradient `#FFD24D→#F0A93C`, bright rim, big shine, a little **bee or star embossed** in the middle) — unmistakably a shiny gold coin, never a flat "moon" disc.
>
> Full key list, usage and per-icon illustration notes follow.

---

## Art direction (match the avatars)
- **Sticker style:** self-contained mini-illustration, ~2.5px soft ink outline (`#2A1B4A`), everything rounded, nothing thin/spiky.
- **Multi-colour:** 2–4 saturated candy colours per icon. Joyful, Pixar-sticker / Duolingo energy.
- **Gloss + dimension:** white highlight upper third, soft inner bottom shade, faint contact shadow.
- **Personality:** a tiny face or sparkle where it fits (smiling bulb, winking coin).
- **Reads at 20px.** Chunky forms, generous negative space.

## Technical delivery
- Inline **SVG**, `viewBox="0 0 64 64"`, full colour baked in, transparent bg, ≤2.5KB each.
- `window.SB_ICON_ART = { key: '<svg>…' }` in `icons-art.js`, one per key below.
- Light + dark card legible. Sizes in use: 14, 20, 26, 34, 40, 46, 54px.

---

## TIER 1 — Hero feature icons (big tiles — most important)

| key | used for | illustration |
|---|---|---|
| `learn` | Explore ▸ Learn hub | Open **storybook**, violet cover `#7C5CFF`, cream pages, gold bookmark ribbon, a sparkle lifting off. |
| `train` | Explore ▸ Train hub | **Bullseye/dartboard** (teal `#13A892` + red + cream) with a dart in the centre + motion ticks. |
| `play` | Explore ▸ Play / Arcade | Chunky **game controller**, coral `#F0703C`, glossy red/blue/yellow buttons, teal D-pad. |
| `questJourney` | Quest ▸ Bizzing Bee Journey | Gold **trophy cup** on a violet base `#7C5CFF`, star on the cup, big shine. |
| `questTheme` | Quest ▸ Theme Journey | Brass **compass** over a small blue-green globe, red/white needle, magenta `#B14FC4`. |
| `questOwn` | Quest ▸ My Own List | Yellow **pencil ticking a checkbox** on a teal `#13A892` notepad. |
| `advanced` | Advanced Mode | **Graduation cap** (mortarboard), deep violet `#5B3FA6`, gold tassel + star. |
| `spellingQuest` | Arcade ▸ Spelling Quest | Rolled **treasure map**, parchment, red dotted path + purple X, compass rose. |
| `beeTrivia` | Arcade ▸ Bee Trivia | **Lightbulb with a happy face**, amber `#C8791B`, radiating light, question-mark filament. |
| `magicSquares` | Arcade ▸ Magic Squares | **3×3 grid of gem tiles**, violet `#B14FC4`, one lit/lifted, sparkle. |
| `champChallenge` | Arcade ▸ Champ Challenge | **Lightning bolt bursting from a star**, gold `#C8901B`, spark lines. |
| `beatBuzzer` | Arcade ▸ Beat the Buzzer | Red **stopwatch with a cheeky face**, pink `#E8458C`, motion swoosh. |
| `wordQuiz` | Arcade ▸ Word Quiz | **Clipboard checklist**, teal `#13A892`, three green checks + pencil. |
| `bossBattle` | Arcade ▸ Boss Battle | Friendly **cartoon dragon/boss head** with a small crown, deep purple `#7B52E0`, big eyes. |
| `spellingDuel` | Arcade ▸ Spelling Duel | **Two crossed cartoon swords** with a spark, crimson `#C43D5A`, rounded blades. |
| `ultraJourney` | Advanced ▸ Ultra Champions Journey | Snowy **mountain peak** with a summit flag + winding dotted path, violet `#7C5CFF`. |
| `mockBee` | Advanced ▸ Mock Spelling Bee | **Winner's podium** (1-2-3) with a gold rosette/medal, gold `#C8901B`. |
| `advTips` | Advanced ▸ Tips & Tricks | **Wise owl with glasses** (or brain + lightbulb), teal `#13A892`, insight sparkle. |
| `advGames` | Advanced ▸ Advanced Games | Controller with a **gold star badge**, pink `#E8458C`. |
| `memoryMatch` | Advanced Games ▸ Memory Match | **Two flipping cards** revealing a matching pair (star on each), pink `#E8458C`. |
| `rapidDictation` | Advanced Games ▸ Rapid Dictation | **Stopwatch over a speech bubble / keyboard**, pink `#E8458C`, sound waves. |

## TIER 2 — Explore destinations (list-row icons)

| key | used for | illustration |
|---|---|---|
| `concepts` | Concepts | **Honeycomb** with one lit cell, teal `#0E8A78`, tiny bee. |
| `journeys` | Word Journeys | **Ancient scroll + quill**, terracotta `#C25A2E`, wax seal. |
| `figurative` | Idioms & Sayings | **Speech bubble with a rain cloud + umbrella** inside (idiom made literal), ochre `#9C6A08`. |
| `themes` | Theme Journeys | **Artist's palette** + brush with colour blobs, magenta `#B14FC4`. |
| `vocab` | Vocabulary | **Book + magnifier**, blue `#2E8FB8`. |
| `typing` | Typing Trainer | **Keyboard** with a couple of keys popping, indigo `#5B3DD6`. |
| `traps` | Your Traps | **Shield with a caution spark**, red `#C4453C`. |
| `listBuilder` | List Builder | **Sliders/knobs** building a list, deep teal `#0E8A78`. |

## TIER 3 — Currency & core nav (friendly, a touch simpler but same family)

| key | used for | illustration |
|---|---|---|
| `coin` ⭐ | coins everywhere (14–54px) | **Fat glossy gold coin**, gradient `#FFD24D→#F0A93C`, bright rim, big shine, embossed **bee/star**. Never a flat moon. |
| `karma` | Karma points | **Violet 4-point sparkle** with a soft glow `#7C5CFF`. |
| `home` | nav | Cosy **house** with a honey-gold roof. |
| `practice` | nav | Happy tilted **pencil**, violet. |
| `explore` | nav | **Compass**, teal. |
| `arcade` | nav | Small **controller**, coral. |
| `store` | nav | **Shopping bag/cart** with a bee tag, gold. |
| `progress` | nav | Rising **bar chart** + sparkle, green. |
| `collection` | nav / My Collection | **Crown**, gold. |
| `search` | top bar | Friendly **magnifier**, violet. |
| `settings` | drawer / settings | **Gear** with a soft face, slate. |

## TIER 4 — Utility & control icons (2-tone family: base colour + lighter tint + ink outline)

These don't need full illustration but must share the rounded, glossy family look so nothing clashes. One or two colours each is fine.

`check` (green check in a soft disc) · `close`/`x` · `plus` · `menu` (3 rounded bars) · `lock` (padlock, rounded shackle) · `play` · `pause` · `retry` (circular arrow) · `printer` · `speaker`/`volume` · `mute` · `mic` · `calendar` · `star` · `heart` · `flame`/`fire` (streaks) · `timer` (stopwatch) · `bolt` (lightning) · `trophy` · `target` · `bulb` · `swords` · `book` · `grid` · `list` · `tile` (a single tilted letter tile) · `sliders` · `sprout` (growth/level) · `steps` (a rising path) · `compass` · `crown` · `bee` (the mascot bee, honey-gold + violet wings) · `hive` (honeycomb hive) · `users` (two friendly heads — parent zone) · `chart` · `palette` · `eye` / `eyeoff` · `link` · `alert` (rounded warning) · `upload` · `arrowLeft` · `arrowRight` · `chevronDown` · `sparkle`

## In-app scale reference (so padding/weight are right)
- Feature tiles: **46–54px**, the illustration is the focal point.
- Game chips: **40px** in a 2-col grid with a label beneath.
- Explore rows: **38px** at the row's left.
- Nav bar: **~22px** — Tier 3/4 must stay legible tiny.
- Coin: **14–16px** in pills AND larger in the Store — must read at both.

## Deliverable checklist
1. `icons-art.js` → `window.SB_ICON_ART = { <key>: '<svg 0 0 64 64>…', … }` covering **every key above** (Tiers 1–4).
2. One consistent family: outline weight, corner rounding, gloss angle.
3. Light + dark legibility verified.
4. Contact-sheet preview (all icons, light + dark).

Once delivered we wire `SB_ICON_ART(name)` into the hub tiles, game chips, quest paths and Advanced Mode (dropping the coloured gloss tile since each icon carries its own colour). We keep the current mono `SB_ICON` set as the fallback for anything not yet illustrated.
