# Spellbound — Design Pack (critical review + enhancement plan)

*Prepared for a design-quality pass. Audience: kids 8–16 (primary speller ~9) + parents. Benchmark bar: 15five's calm-SaaS polish, Duolingo's kid-magnetism, Linear's finesse, Headspace's warmth. Screenshots 01–10 in this folder show current state (Spellbound theme, Light + White modes).*

---

## 1 · What the app gets right (keep these)

- **A real token foundation exists**: `--display/--body/--mono/--entry` fonts, semantic colors (`--accent/--good/--bad/--muted/--chip/--surface2`), 8 themes + Light/White modes. Most kid apps never get this far.
- **The mascot is an asset.** The bee has genuine charm, multiple emotions, and now presents lessons. Duolingo's entire brand is built on exactly this — lean in harder.
- **Cover-card language** (colored panel + texture + white line-art emblem + body below) is a distinctive, ownable pattern — the Themes and Arcade grids (05, 08) are the best screens in the app.
- **Motion has intent**: per-game choreographed scenes, semantic theme motions, the roaming presenter bee. This is above the bar for the category.

The problem is not the ingredients. It is **consistency, restraint, and finish** — the last 15% that separates "nice hobby app" from "product a 12-year-old shows her friends."

---

## 2 · Critical findings (be-harsh mode)

### A. The radius zoo — no geometric system
Actual corner radii in production markup: **5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 99px**. Fourteen values. 15five ships with ~4. Every ad-hoc radius reads as visual noise the eye can't name but *feels*.
**Fix:** a 4-step radius scale — `--r-sm:8px` (chips, inputs), `--r-md:12px` (buttons, tiles), `--r-lg:16px` (cards), `--r-pill:999px`. Delete every other value.

### B. The shadow zoo — five elevation dialects
`inset 0 -3px 0 rgba(0,0,0,.06)` (pressed-clay), `0 2px 6px` (float), `0 0 0 1px var(--line)` (ring), `var(--glow)`, and one-off `0 8px 22px` promos. Cards on one screen mix three dialects (03: dock uses inset, heatmap uses inset, level panel uses ring+float).
**Fix:** one elevation scale — `--e0` ring only, `--e1` resting card, `--e2` hover/raised, `--e3` modal — plus the inset "clay" style reserved **exclusively** for pressable buttons (it's a great kid-friendly button treatment; it's wrong on static cards).

### C. Typography has no scale, only sizes
Found in the wild: 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 16, 16.5, 17, 17.5, 18, 18.5, 19, 20, 22, 24, 26, 28, 46px. **Twenty-six sizes.** Best-in-class systems use 7–9. The half-pixel sizes (11.5, 12.5, 13.5…) are the tell of eyeballed-per-screen typography.
**Fix:** a modular scale — 11 / 12 / 13 / 14 / 16 / 18 / 22 / 28 / 40 — mapped to roles (`caption / meta / body-sm / body / lead / h3 / h2 / h1 / hero`), each with a fixed line-height and weight. Kids' reading comfort improves measurably with a consistent 14–16px body and 1.5 line-height; several dense panels (Parent analytics tips, concept cards) currently drop to 12.5/13.5 body text, which is adult-dashboard sizing, not kids' sizing.

### D. Emoji vs. drawn icons — two icon languages fighting
The app went "design-first SVG icons" (good, and the iconSVG set is clean) but emoji still leak into chrome: 🖨 ⏸ ▶ ✕ ⋯ 🔄 ⚡ 🛒 ✏️ 🪙 ★ ▾. Emoji render differently on every OS, can't take `currentColor`, and visually clash with the 2.3-stroke line icons beside them.
**Fix:** zero emoji in chrome. Add `print, pause, play, close, more, refresh` to iconSVG. Emoji are allowed in exactly two places: celebration copy ("Level up! 🎉") and content authored for kids.

### E. Inline styles are the design system's ceiling
~95% of styling is inline `style="…"` in template strings. Consequences visible in the shots: the same "chip" is built 9 slightly-different ways; hover states exist only where someone remembered a class; dark/White-mode contrast bugs appear per-screen (10 shows several `rgba(0,0,0,.06)` insets that vanish on White). No design pass can stick until repeated patterns become **classes**: `.card, .card--cover, .btn, .btn--primary, .btn--clay, .chip, .tile, .meter, .modal`. This is the single highest-leverage engineering-for-design change, and it also shrinks app3.js meaningfully.

### F. Color: the accent does too many jobs
`--accent` (purple) is simultaneously: primary action, selected state, progress fill, link, decorative icon tint, focus ring, and info badge. When everything is purple, nothing is. 15five's discipline: one brand hue, **one** action hue, neutrals do the rest; Duolingo: green = go, blue = info, gold = reward, red = danger — kids learn the grammar in a day.
**Fix:** split roles — `--action` (buttons/links), `--selected` (chips/tabs), `--progress` (meters can stay accent), `--reward` (gold, already exists as coins — formalize it), `--info`. Two screens to retest after: Coach (03) and Progress (09), which are currently 70% purple by area.

### G. Density & hierarchy: three screens fail the squint test
- **09 Progress** — five meter cards + six tip rows + heatmap + dropdown compete at identical visual weight. Squint: it's a wall. Needs one hero number (readiness), everything else demoted into collapsed groups.
- **03 Coach** — Live progress, dock, level panel and action grid all shout equally. The child's single next action ("Practice these 24 words") should be the one unmissable element.
- **07 Concept detail** — the explainer card is beautiful, but "Read more →", progress dots, tab dots, and Practice CTA stack four horizontal purple bars within one viewport.
**Rule to adopt:** every screen declares exactly **one** primary action (filled, clay-shadow, biggest), everything else is quiet (ghost/outline). That's the 15five move: whitespace + one loud thing.

### H. Kid-appeal gaps (8–16 lens)
1. **Progression identity is under-sold.** The evolution ladder is gold but lives below the fold on Home (01). Duolingo puts the streak flame and character front-center, always. The bee/evo form should live in the top bar, permanently, at every screen.
2. **Wins are under-celebrated; mistakes over-quiet.** Confetti exists, but a mastered Level deserves a full-screen moment (badge stamp, evo shimmer, shareable "Level 7 cleared!" card a kid can screenshot). Meanwhile wrong answers show small red text — right instinct — but the "so close" near-miss nudge deserves the bee's curious face inline.
3. **8-year-olds vs 15-year-olds need different volume.** One switch — "Playful / Focused" — could scale decoration (streamers, sparkles, emoji copy) down for teens without a second design. Ship the token layer first and this becomes a 20-line theme.
4. **Empty states are dead air.** New profiles see blank heatmaps and "No misses logged yet" text. Every empty state should be the bee doing something ("nothing to review — I ate all the tricky words 🐝").

### I. Finesse misses (the Linear bar)
- Focus states: keyboard focus is browser-default on most controls — unacceptable for an app kids drive with Enter. One `:focus-visible` ring token fixes it globally.
- Transitions: some cards animate on hover, siblings don't (06 chapter cards vs 05 arcade cards). Motion tokens: `--t-fast:120ms / --t-base:200ms / --t-slow:400ms`, one easing curve, applied by class.
- Optical alignment: level chips ("L3") sit 1px low in dock tiles; the coin pill's icon/text baselines drift between top bar and shop.
- The dotted page background texture fights the card grain on dense screens; drop it below `--bg2` cards or fade it 50%.

---

## 3 · Benchmarks — what to steal

| From | Steal this | Where it lands in Spellbound |
|---|---|---|
| **15five** | Calm neutrals + ONE loud action per screen; soft display serif for headings creating instant warmth; generous 24–32px card padding everywhere | Coach & Progress declutter; consider a warmer display face for h1/h2 only |
| **Duolingo** | Color grammar (go/reward/danger/info); chunky clay buttons; mascot omnipresence; streak as identity; full-screen win moments | Button system, top-bar bee + streak, Level-clear celebration screen |
| **Linear** | Token discipline, focus rings, 3-speed motion scale, obsessive optical alignment | The finesse layer (§2-I) |
| **Headspace** | Warm gradients reserved for *moments* (not chrome); breathing room around illustration | Keep gradients for covers/celebrations, strip them from utility chrome |
| **Khan Academy** | Age-flexible tone: playful visuals, adult-respectful copy | The Playful/Focused switch |

---

## 4 · The enhancement plan (prioritized)

**Phase 1 — Token consolidation (foundation, ~1 session)**
Radius scale (4), elevation scale (4 + clay-for-buttons), type scale (9 roles), motion tokens (3 speeds, 1 easing), color-role split, `:focus-visible` ring. Mechanical find-and-replace across app*.js; zero visual redesign yet, but the app immediately looks 20% more "finished" because sameness reads as quality.

**Phase 2 — Component classes (~1 session)**
Promote the 10 repeated patterns to CSS classes (`.card .btn .chip .tile .meter .modal .cover .dock-tile .tip .stat`). Kill all chrome emoji → iconSVG. This is what makes every future design change a one-line edit instead of a 40-file sweep.

**Phase 3 — Hierarchy pass on the 3 failing screens (~1 session)**
Progress: readiness hero + collapsed groups. Coach: one primary CTA. Concept detail: merge the bar stack. Adopt the one-loud-thing rule app-wide.

**Phase 4 — Kid-magnetism (~1–2 sessions)**
Persistent top-bar bee + streak + evo form; Level-clear celebration screen (stamp + shimmer + screenshotable card); living empty states; Playful/Focused switch.

**Phase 5 — Theme richness**
Today themes swap hues. Best-in-class themes swap *worlds*: per-theme background texture, card emblem accents, celebration particles (space theme → star confetti). The cover-card language already supports this — extend it to chrome.

---

## 5 · Definition of "done" (the standard to hold)

1. Any screen, squinted: exactly one obvious action.
2. Any two screens side-by-side: same radii, same shadows, same type roles — indistinguishable authorship.
3. Tab through any screen: every stop visibly ringed.
4. A 9-year-old can name the color rules ("purple = do it, gold = treasure, green = got it").
5. A 15-year-old doesn't call it babyish in Focused mode.
6. Nothing in chrome renders differently on Mac vs Windows (no emoji).
7. Every empty state has the bee in it.

*Screenshots: 01 Home · 02 Quest chooser · 03 Word Coach · 04 List Builder · 05 Arcade · 06 Concepts · 07 Concept detail (explainer) · 08 Themes · 09 Progress · 10 Home (White mode).*
