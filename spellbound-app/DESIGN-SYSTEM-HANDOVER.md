# Bizzing Bee — Design System Handover

A complete, portable spec of the Bizzing Bee visual + interaction language, written so it can
be fed back into a design system (or into Claude as design context). Covers UX patterns,
type, color, worlds, iconography, avatars, cards, game rendering, motion, print, accessibility,
audio, economy, and content/tone rules. File references point at where each thing lives so a
change can be traced.

**Product:** an offline, vanilla-JS spelling-bee trainer for kids ~8–15. No build, no
framework. Everything is `window.*` globals; UI is `state → render()` string-template
rendering; clicks dispatch via `data-act` handlers. The feel target is **playful, premium,
tactile — never boxy or "1990s dialog".**

---

## 1 · Foundational principles

1. **One system, many worlds.** A child picks a "world" (theme). The world changes the display
   font, the accent color, a background motif, the hero art, and an evolving mascot — but the
   information architecture, body font, spacing, and component grammar never move. Worlds are
   *skins over a stable skeleton*.
2. **Tactile & rounded.** Big radii (10–24px), soft layered shadows, press/pop micro-motion,
   gentle tilts (±2–3°). Nothing is a flat rectangle with a hairline; every surface has paper,
   edge, and a little life.
3. **Warm, encouraging tone.** Copy is short, kind, second-person, emoji-punctuated but not
   emoji-spammed. Mistakes are "saved for revision," never "WRONG."
4. **Kid-legible.** Large tap targets (min ~38–44px), high contrast text, generous line-height,
   and an Easy-Read accessibility mode.
5. **Everything earns.** Coins, karma, avatars, worlds, badges — progress is felt constantly
   but never pay-walled behind real money in the core loop.

---

## 2 · Architecture (how design is expressed in code)

- `state` (one big object) → `render()` writes `root.innerHTML` from string templates → the DOM
  is fully re-rendered each change. Focus/selection are preserved across renders.
- **Dispatch:** every interactive element carries `data-act="handlerName"` (+ optional
  `data-arg`). A single delegated click listener calls `app[handlerName](arg)`. Inputs use
  `data-inp`; keydown uses `data-key`. (`app3.js` ~ `callAct`, root listeners.)
- **Overlays/modals** are appended after the main view by `overlays()` (`app3.js`) — paywall,
  pack reveal, settings pop-up, celebrations, toasts.
- **Files:** `app3.js` (main app, ~everything UI), `saga2.js` (story mode + game engines),
  `avatars.js` (avatar registry + `SB_AVATAR` renderer), `avatars-art.js` (per-avatar 120×120
  SVG), `avatar-cards.js` (trump-card data + HTML), `tokens.css` (design tokens), `index.html`
  (global CSS, keyframes, hero/pack/coach-card lighting).

---

## 3 · Color tokens

Tokens live in `tokens.css` on `[data-theme]`, with three **modes** on `[data-mode]`:
`light` (tinted paper), `white` (pure paper), `dusk` (dark). Legacy alias var names
(`--bg1/--bg2/--accent/--text/--good/--bad/--surface/--glow`) are mapped onto the v2 tokens for
the app's JS.

**Core roles**
| Token | Role |
|---|---|
| `--action` (`--accent`) | buttons, links, active nav, focus — the world's signature color |
| `--action-ink` | text/glyph on an action surface (usually `#fff`, dark on gold worlds) |
| `--tint` (`--bg1`) | page background (light mode) |
| `--tint-deep` (`--bg3`) | background edge / deep fills |
| `--paper` (`--bg2`) | card/surface background |
| `--ink` (`--text`) | primary text |
| `--muted` | secondary text |
| `--line` | hairline borders |
| `--surface`, `--surface2` | subtle inset fills (ink @ 4% / 7% light; white @ 6% / 10% dusk) |
| `--chip` | `color-mix(--action 12%, transparent)` — tinted pills |
| `--glow` (`--sh-raised`) | the standard raised-card shadow |

**Semantic accents (stable across worlds)**
- Mastered / correct: `--good` = `--mastered` `#35B573` (dusk brightens).
- Wrong / fix: `--bad` = `--fix` `#E06158`.
- Treasure / revise / coins: `--treasure` honey `≈#F0B429`, deep text `--treasure-deep #8A5B00`,
  tint `color-mix(--treasure 16–18%, transparent)`. **Revision UI is always this amber.**

**Level color ramp** (`LC(y)` in `app3.js`, used by flashcards/level badges), by difficulty y:
`≤1 #35B6E8→#1E8FC4 · 2 #6C7CF0→#4F5CD8 · 3 #9B5CF0→#7C3FD8 · 4 #E45CB0→#C43A92 ·
5 #F0913C→#D4711C · 6+ #E8503E→#C43222`.

**Rarity colors** (`avatars.js` `RAR`): Starter `#7B8794` · Rare `#3D7DF0` · Epic `#B14FC4` ·
Legendary `#F0B429`.

**Dusk (dark mode) is per-world.** Every world has its own night palette tinted toward its hue
(`tokens.css`, the `[data-theme="X"][data-mode="dusk"]` block): purple / gold / blue / crimson /
teal / rust / navy / cyan — not one shared indigo. White ink throughout.

---

## 4 · Typography

Font roles (`tokens.css`):
- `--ui` = **Hanken Grotesk** — "everything else" (body, UI, buttons). This is the workhorse.
- `--body` = `--ui`; `--entry` = `--ui` (the spell-input box).
- `--display` = **per-world heading font** (800 weight, headings only).
- `--mono` = **Sono** — *letters only*: spelling tiles + word chips (monospace clarity).

**Global default (important):** `html { font-family: var(--body) }` in `index.html`, and a broad
`body,input,button,…{font-family:inherit}` rule, so **no element can fall back to browser
serif.** Role fonts override locally. When adding UI, don't set a font unless it's a heading
(`--display`), a letter tile (`--mono`), or the spell box (`--entry`).

**Per-world display fonts:** spellbound `Fraunces` (serif) · spotlight `Righteous` · galaxy
`Baloo 2` · blade `Bangers` · lab `Quicksand` · origami `Fredoka` · arcade `Bungee` · elements
`Comfortaa`. (Legacy ids marquee/aurora/anime/science/pixel/avatar alias these.) Fonts are
self-hosted (`fonts/fonts.css`).

**Type scale (typical):** page title 20–24px/800 display; card title 15–17px/800 display; body
13–15px/500–700 ui; meta/caption 11–12px/650–800 ui; the practiced word 22–38px/800 display;
letter tiles clamp(19–28px)/700 entry with `letter-spacing:.14em; text-transform:lowercase`.

**Accessibility font:** Easy-Read mode swaps `--display/--body/--entry` to Verdana and adds
letter/word-spacing + 1.65 line-height (`[data-font="easy"]`).

---

## 5 · Worlds / themes system

Eight worlds. Each supplies: a display font, `--action` + palette, a **background motif**
(`[data-theme]::before` repeating pattern — bulbs, stars, graph grid, weave, folds, pixels, dots),
a **hero card** (`WORLD_HERO` in `app3.js`: gradient/photo bg + tag + tiny SVG art + ink), and an
**evolution ladder** (`EVO` — 10 named forms the mascot grows through as the child levels up,
e.g. Egg → Queen Bee). A soft world-accent wash sits over every page
(`[data-theme]::after`, radial gradients of `--action`/`--treasure`).

Modes: `light` (tinted), `white` (pure paper, motif at 7%), `dusk` (dark, per-world). The mode
switcher cycles these. `data-size` (`normal`/`large`) zooms the whole app (`#root{zoom}`).

---

## 6 · Iconography

- **Line icons:** `iconSVG(name,size,strokeWidth)` in `app2.js` — 24×24 viewBox, `currentColor`,
  **2.1 round stroke**, round joins. One consistent family (home, gear, volume, target, book,
  bulb, crown, spark, bolt, alert, print, cart, coin, search, …). Never mix stroke weights.
- **Illustrated/sticker icons:** `SB_ICON(name,{size})` + `SB_ICON_ART` — glossy candy-chip
  tiles with a white glyph, top shine, inner bevel, colored drop shadow (used for nav + big
  wayfinding tiles). `iconTile(name,color,{size,radius})` wraps a glyph on a solid color chip
  with a press edge and playful tilt.
- **Custom inline glyphs** for one-offs (built like the line family, `currentColor`): tortoise
  (slow-audio), stacked-cards (card view). Keep new ones to the same 24×24 / 2–2.4 stroke look.
- **Mascot:** `mascotSVG(mood, body, accent)` in `app.js` — **Bizzy the bee**, 240×270 viewBox,
  moods: happy/excited/love/sleepy/oops/think/wow. Bizzy is the brand character (also the
  favicon, drawn as a compact data-URI). Purple stripes `#3A2A8C`, gold body `#FFC23D`, pink
  cheeks `#FF7FBE`, pupil `#2B1B5E`.

---

## 7 · Avatars (collectible characters)

**Registry:** `avatars.js` → `window.SB_AVATARS = {list, packs, rarities, byId}`. Currently
**201 avatars across 20 packs.** Each avatar: `{id, name, pack, rarity}`. Packs carry
`{id,label,world,c1,c2}`.

**Renderer:** `SB_AVATAR(id, size, opts)` wraps a **120×120** inner SVG (from `SB_AVATAR_ART[id]`
in `avatars-art.js`) with a per-pack **ink outline** (drop-shadow "sticker" edge; dusk uses a
white/legendary glow). Rarity glow scales with size.

**Art formulas (two families):**

- **Portrait formula** (World Changers pack — real people): 120×120 viewBox; radial-gradient
  garment; a *sculpted face path* (never a plain circle) with ears, nose shading, jaw shadow;
  neck + sloped shoulders; white-dot eyes with `#2E455C` pupils (closed-arc exception for
  meditative figures); pink cheeks `#FF9EB8`; gold sparkles `#FFC83D`; a per-character prop +
  environment. Built via a shared `base(o)`/`fig(o)` composer.
- **Chibi formula** (Gods pack): big round head, tiny body, **huge sparkly eyes** (white oval +
  big pupil + 2 highlights), rosy cheeks, tiny nose, small smile; crown/hair/helmet on top;
  prominent signature weapon beside the tiny body (Thor's Mjölnir, Krishna's chakra, Rama's
  bow, Shiva's trishul…). Animal-headed gods (Ra falcon, Anubis jackal) swap the face for a
  cute animal head via an `animal:true` path. This is the **cute/kid-favored** direction.

**Rarity tiers** (drop + economy): Starter (free, auto-owned, 1 per pack) · Rare · Epic ·
Legendary. Prices: rare 120 / epic 250 / legendary 500 coins; sell-back at half.

**Sensitivity (non-negotiable):** venerated/real figures (Buddha, Gandhi; Rama, Krishna, Shiva)
are drawn reverently — never villainized, costume-swapped, or shown in defeat. God facts are
myth-framed ("Myth says…"); real-people facts are historically accurate. None appear in the
villains system.

---

## 8 · Cards

### 8a · Avatar trump cards (`avatar-cards.js` → `SB_AV_CARD` / `SB_AV_CARD_HTML`, CSS `.avc-*`)
A premium trading card: OVR badge, Hero/Villain + rarity chips, framed art, name, italic title,
a lore line, **four stat bars**, a **superpower** line, and an "Inspired by" fact.

- **Stats:** `Stamina ⚡ · Wisdom 🧠 · Speed 💨 · Coolness 😎`, each 0–99. Internal keys are
  `spark/wisdom/speed/grit`. Random-by-rarity by default (`TIER` bases: free 52 / rare 62 /
  epic 72 / legendary 84, spread ~14–18); **curated overrides** make real characters ring true
  (Newton/Einstein 99 Wisdom, etc.). **OVR = mean of the four.**
- **Superpower:** every card has one — hand-written for real figures/deities, else generated
  from the top stat ("Big Brain", "Quick Draw", "Ice Cool"…).
- **Hero-card lighting** (light mode, `index.html`): an opaque white **glare sweep** across the
  card (`avcSweep`), a **holographic** blend-mode shimmer border (`avcHolo`), and a **pulsing
  rarity glow** (`avcGlowPulse`). Legendaries sweep faster/gold. Villains use a screen-blend
  colored sheen. Hero cards stay **light in dark mode** on purpose.

### 8b · Coach flash card (on-screen study deck — `coachFlashCard()` in `app3.js`)
Tall **portrait** card (`.coach-card`) with a **subtle glimmer**: an animated holographic border
(masked gradient ring), a slow diagonal light sweep, and a soft pulsing accent glow — tuned per
mode (deeper glow in dusk), and **disabled under Reduce-Motion**. Left/right tap-zones + edge
labels (‹ REVISE / NEXT ›). Text must stay crisp — the glimmer is a whisper, not a strobe.

### 8c · Printable cards (`printCards` / `printAvCardsDoc` in `app3.js`)
Fixed **portrait** card size **90×125mm**, 4 per page (2×2 flex), backs mirrored `[1,0,3,2]` for
duplex. Level color from `LC()`. Flashcard front: banner (word + pronunciation) + emoji info
rows (📖 meaning, 💬 sentence, 🌍 origin, 💡 memory trick, ⚠️ misspelling) + a per-card avatar +
✏️ notes lines. Back: sunburst + confetti + Bizzy + level badge. Force `@page … portrait` and
give cards fixed mm dimensions so they stay portrait regardless of the print dialog.

---

## 9 · UX components & patterns

- **Buttons:** rounded (10–14px), 800 weight, ~13–15px. Primary = `--accent` bg + white ink +
  `--edge`/`--glow` shadow. Secondary = `--surface2` fill. Ghost = transparent + muted. Danger
  reuses `--bad`. Always a clear press affordance.
- **Pills / chips:** 999px radius, 12px/800, tinted bg (`--chip` or a semantic mix). Used for
  status ("Active ✓"), counts (Traps · 3, ⚑ Revise · 3), metadata (pronunciation, origin, part
  of speech), coins/karma.
- **Cards / sections:** `.sb-card` = paper bg, 1px `--line`, 20px radius, rest shadow. Section
  hubs use a soft `--action`-tinted gradient header with an `iconTile`.
- **Tabs:** a pill group on a `--surface2` track; active tab = raised paper pill in `--accent`.
- **Tap zones + swipe:** the card deck divides a card into left/right halves (revise/next) with
  edge affordances; swipe and ← / → arrow keys mirror the taps. Every gesture has a
  keyboard + touch equivalent (hard rule).
- **Modals / overlays** (`overlays()`): full-screen scrim (`rgba(10,8,20,.55)` + blur), a
  centered paper panel (`sb-pop` entrance), an **✕ top-right** close, and a backdrop-click
  close. The click-eater `data-act="noop"` guards inner clicks.
  - **Settings is a pop-up**, not a page: it opens over the current screen and **pauses** the
    running practice/game/session (auto-advance timer, game clock, and hotkeys all halt),
    resuming on close. Navigating elsewhere closes it.
- **Toasts:** bottom-center accent chip, `sb-pop`, auto-dismiss (`scheduleToast`).
- **Nav:** 7 destinations (Home · Practice · Explore · Arcade · Store · Progress · Collection)
  as illustrated-icon pills on desktop; a bottom tab bar on mobile; the top nav collapses to
  hover-reveal *only inside the Word Coach*.
- **Empty states:** `beeEmpty(mood, text)` — Bizzy + a kind line. Never a bare "No data."

---

## 10 · Word Coach UX flow (the core learning surface)

Header `topBar`: ← Home · **Word Coach** · Quest path · ◎ Traps(count) · ⚑ Revise(count) ·
milestone countdown. Three tabs:

1. **Learn** — a study card (`wordFlash`) with a **Card view** icon (top-left) that opens the
   swipeable **portrait deck** starting on the current word: right = next, left = mark-for-
   revision; finishing the deck offers *Practice & test* or *Revise the revision words*.
2. **Practice Spelling** — the spell test (`trainerCard`). **No manual mark buttons:** correct →
   mastered + advance; wrong (or "Show answer") → saved for revision + advance. Fully hands-free.
3. **Practice Vocabulary** — optional, **no progression**: a word + 4 meaning options (distractors
   are other words' meanings from the list). A correct pick earns **1 coin + 1 karma 🌟**.

Related: **Your Traps** (misses clustered by pattern, with drills) and **Your Revisions** (words
flagged to revise, with a *To revise* / *Revise history* tab — completed revisions move to
history and can be sent back).

**Never leak the target spelling** in on-screen meaning/sentence text — it's masked
(`blankHTML`/`maskTxt`, incl. inflected forms and "plural/past-tense of X" pointers).

---

## 11 · Game rendering

- **Story mode ("The Saga," `saga2.js`):** 6 acts / 31 chapters. `WORLD_ART` supplies richly
  shaded background **plates** (spotlight stage, galaxy, lab, arcade, dojo, dino, library…);
  `SAGA_ART` supplies characters. 13 playable **engines** — each `engine(host, opts, done)` →
  `done({win, score, stars})` — reused across chapters (honeycombRun, keepFlying, beeGrandPrix,
  wordHive, whackAMoth, spellShield, spotlightSimon, unscrambleStars, wordSnake, combCatcher,
  stageRhythm, constellationConnect, typeBlaster, spellScene). Progress is a done-set with stars.
- **Arcade** (`app3.js`): Spelling Quest, Bee Trivia, Magic Squares, Champ Challenge, Beat the
  Buzzer, Word Quiz, Boss Battle, Spelling Duel. A shared `gameShell(statusBar, inner)` frame
  (coins + exit + a themed status bar: timer/HP/streak). Timed games tick via `startGTimer`/
  `gTick` (paused by the Settings pop-up). Boss battles use HP bar + hearts + shields.
- **Rendering rule:** games must look **professional** — use the delivered art; hand-drawn
  canvas is allowed only when richly shaded (gradients, inner light, soft shadow). **Every game
  needs both keyboard AND touch controls.** Number keys 1–4 pick answers; R repeats; arrows
  drive decks.
- **Reward feedback:** `sfx(name)` (Web-Audio tones, no files), `burstConfetti(n)`, streak
  toasts, coin/karma bumps, and celebration modals (`state.celebrate`: badge/set/level).

---

## 12 · Motion & animation

Keyframes live in `index.html`. Vocabulary of motion:
- **Entrances:** `sb-pop` (scale-up settle), `sb-rise` (slide-up fade), `ca-pop/ca-sl/ca-sr/
  ca-up/ca-morph` (concept teaching steps).
- **Character life:** `sb-bee-bob/talk/pop`, mascot mood animations, world-art float.
- **Card lighting:** `avcSweep/avcHolo/avcGlowPulse` (hero cards), `coachHolo/coachSweep/
  coachGlow(+Dusk)` (coach deck), pack `pkReel/pkScan/pkDrop/pkDots` (opening animation).
- **Games:** press/squash/ring/spark/flame/ember/scan/tick families (`sb-ga-*`).
- **Discipline:** motion is quick (0.25–0.7s), eased, and purposeful. Screen sweeps stay subtle
  over text. **All animation is killed under `[data-motion="off"]`** (Reduce Motion) — always
  add new animated classes to that guard.

**Pack-opening (gacha) sequence** is the signature moment: a world-themed "Calculating your
drop…" reel (avatars scrolling behind a highlight line + a scanner bar), then the won card
**drops in** with a bounce, glow, and its drop-chance ("🎲 4% — nice roll!"). Drop odds are
inverse to rarity (70% rare · 24% epic · 6% legendary) and shown per-avatar in the store.

---

## 13 · Print system

`printDoc` (word list), `printCards` (flashcards), `printAvCardsDoc` (avatar cards). All
open a new window, write a self-contained HTML doc with its own `@page` size + print CSS,
`-webkit-print-color-adjust:exact`, and fixed-mm card sizes for reliable cut-out cards. Design
printed artifacts to be **fun and giftable** (Bizzy backs, confetti, level badges), not utility
tables.

---

## 14 · Accessibility

Settings → Accessibility toggles set root attributes:
- `data-font="easy"` — Verdana + looser spacing.
- `data-contrast="high"` — near-black/near-white ink + borders.
- `data-motion="off"` — kills all animation/transition (respect it in every new effect).
- Calm mode (`window.SB_CALM`) — softens game intensity/timers.
Plus large-text zoom (`data-size`), full keyboard control everywhere, and a device-voice picker
with a "get a nicer voice" OS guide.

---

## 15 · Audio / voice

- **Word audio:** pre-rendered Google Cloud TTS MP3s (`voice/w/<slug>.mp3`), played by
  `deviceSpeak`/`wordClip`; slow playback (tortoise button) via `playbackRate` with pitch
  preserved. Falls back to device TTS.
- **Never speak the answer** in "finish the sentence" — the target is beeped out.
- Saga dialogue/concepts use a separate voiced set. SFX are synthesized (Web Audio), never files.

---

## 16 · Economy & progression

- **Coins** — earned everywhere (correct words, games, vocab), spent on worlds/lists/concepts/
  avatar packs. **Karma 🌟** — a lighter, optional-practice reward (Practice Vocabulary), warm
  and low-stakes, never gates anything.
- **Avatar packs:** per-pack curated prices (50 → 500), a visible odds table, and the themed
  reveal animation. Duplicates never drop; owned avatars are excluded from the roll.
- **Leveling:** each list has its own Level ladder; the working set is "what you still need"
  (unmastered words), so sessions converge on level-up. Badges are earned by playing, never
  bought.

---

## 17 · Content & tone rules

- Second person, short, warm, specific. Praise effort; frame misses as revision.
- Facts are **true** (real people) or **myth-framed** (deities). Keep them kid-checkable.
- **Reverence rule** (§7) is absolute.
- Every long word must wrap inside its box (`overflow-wrap:anywhere`); never overflow.

---

## 18 · How to give feedback / evolve this system

When proposing changes, target the layer, not the instance:
- **Token change** (color/spacing/radius/shadow) → `tokens.css` + the legacy-alias block.
- **Type** → `tokens.css` font roles; remember the global `--body` default in `index.html`.
- **A world** → its `[data-theme]` palette + `::before` motif + `WORLD_HERO` + `EVO` ladder +
  dusk palette (5 touch-points, keep them in sync).
- **Avatar art** → `avatars-art.js` (follow the portrait *or* chibi formula; keep the ink
  outline + sparkle + cheeks conventions); register in `avatars.js`; card copy in
  `avatar-cards.js` (lore/fact/superpower/curated stats).
- **A card** → `.avc-*` CSS + `SB_AV_CARD_HTML` (screen), `printAvCardsDoc`/`printCards` (print).
- **Motion** → add the keyframe in `index.html` **and** the `[data-motion="off"]` guard.
- **A component** → it's a string-template + `data-act` handler in `app3.js`; match the existing
  radius/weight/shadow grammar.

**Design north star:** premium, rounded, alive; one calm skeleton dressed by joyful worlds;
generous to kids in legibility, feedback, and reward. If a screen feels like a form, it's wrong.
