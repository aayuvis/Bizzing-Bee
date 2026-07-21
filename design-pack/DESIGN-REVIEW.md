# Bizzing Bee — Deep Design Review (UI/UX, three personas)

*Scope: pure design — layout, typography, color, consistency, responsiveness, motion, information design. Method: 17 headless screenshots across 4 worlds × 3 modes, desktop (1360px) and phone (390px), plus programmatic checks (overflow measurement, element geometry). Zero JavaScript errors across the sweep. Personas: Maya 8, Dev 12, Sana 16 — same kids as the two critical reviews.*

---

## Part 1 · The finding that outranks everything

**The app does not fit on a phone.** At 390px the page scrolls sideways: measured `scrollWidth` is 495px against a 390px screen. Three offenders, all in the chrome:

1. **The mode switcher (Light / White / Dusk)** doesn't compress — "White" is clipped at the screen edge and "Dusk" is off-screen entirely. A kid on a phone cannot reach Dusk mode at all.
2. **The top nav** runs to ~503px — Arcade, Progress and Parent are off-screen with no wrap, no scroll affordance, no overflow menu.
3. **The wordmark breaks in two** — "Bizzing / Bee" stacks on two lines next to the mascot, which reads as a layout accident, not a brand.

Everything below the chrome is actually *good* on mobile — cards stack cleanly, the coach card is excellent, the Magic Squares grid is one of the best mobile screens in the app. But the toolbar greets every phone user with clipped buttons before they see any of it. **This is the single highest-priority design fix in the app.**

---

## Part 2 · The three kids look at the design

### Maya, 8 — sees shapes first, words never
- **Magic Squares is now her best screen.** The big cluster-colored theme tiles (temple, anatomy heart, fish) let her pick squares by *picture*. This is exactly how an 8-year-old navigates — more of the app should work this way.
- **The Concepts hub fails her completely.** Eleven cards that all look identical: same dark cover, same purple "Ch N" sticker, same layout. The cover art says "Ch 1", the title says "Chapter 1", the subtitle says "Basics" — the same fact twice and the useful fact (what's *inside*) demoted to 12px mono. She can't find "her" chapter without reading. Covers should lead with the topic (Basics, Prefixes, Roots) and vary in color the way the theme cards do.
- **The drawer is a wall.** Sixteen rows in one column, and only the Explore section gets colored icon chips — Training tools and Family are bare grey glyphs, so her eye has no anchors below the fold.
- The home hero row, post-redesign, is right for her: bee → big art → one button. The bubble no longer squashes her name.

### Dev, 12 — audits every number, notices every contradiction
- **The drawer says "Pupa · Level 10"** while two rows below it says "The Bizzing Bee Journey · Level 3". The old XP level — supposedly retired in the one-level-language pass — survives in the drawer identity row. He will find it in one session, and it undoes the credibility work the Band system just bought.
- **"Band 4 · 0% right at this band"** on the Progress Band card, shown when there's simply no attempt data at that band yet. A zero that means "no data" rendered identically to a zero that means "failing" is an information-design bug, not a cosmetic one.
- **The "This week" bars carry no numbers.** Seven purple rectangles with no counts, no axis, no tooltip-equivalent. He called the heatmap his scoreboard; these bars are decoration pretending to be data.
- **Band shown twice on one screen** — the stat tile says "Band 4" and the card directly beneath repeats "Band 4 · School-Bee Ready". After the "too many metrics" simplification, this adjacency reads as a leftover.
- The Quest chooser is his favorite screen and deservedly so — three saturated path covers, scannable bullet triples, one clear current-path state. It's the app's best composition.

### Sana, 16 — judges craft, mode discipline, and restraint
- **White mode is finally honest** (pure paper, wash removed) and **Dusk is legible** — both of her long-standing complaints are resolved. But in Dusk the Quest card's progress bar renders dark-on-dark (near-invisible track), and the cover-art hexagon motifs clip abruptly at the card's top edge — small tears in an otherwise disciplined mode.
- **The card type system is real but only one screen deep.** The home top row speaks with one voice (`sb-card` container, one title size, one note style) — she can see the difference immediately. Then she opens Progress and the streak calendar floats 14px squares across a full-width card with dead space everywhere; the stat tiles, band card, week card all use slightly different internal rhythms. The system exists; the migration stopped at Home.
- **The evolution ladder screen is quietly excellent** — names-only tiles, ✓/YOU markers, one explanatory sentence that finally distinguishes effort from skill. She also singles out the placement-complete screen: "Band 3 — School-Bee Ready!" with the quest start beneath is exactly the hierarchy a results screen should have.
- The onboarding world picker remains the most premium-feeling screen in the app; her one note is the mono subtitle lines wrap inconsistently between cards (one line vs two), which slightly breaks the grid's rhythm.

---

## Part 3 · Craft audit (adult eyes)

### What the system does well
- **Worlds discipline held under pressure.** Across all sweeps, the harmonized cards keep identical structure while Fraunces/Bungee/Abril swap in per world — the "worlds are worlds, not recolors" promise survives the new Band/evolution/goal layout. No competitor's kids app ships 8 worlds × 3 modes this coherently.
- **The wordmark works.** *Bizzing* italic against upright Bee reads as motion at every size — except when the mobile toolbar wraps it (see Part 1).
- **The Band banner is a good pattern on desktop**: icon tile, one title, one explainer, 9-dot scale, one link. Clear hierarchy, instant read.
- **Empty states are consistently kind** (radar-clear bee, calibrating copy).

### Design debts, ranked
| # | Finding | Severity |
|---|---|---|
| 1 | Mobile toolbar overflow: nav + mode switcher + wordmark (Part 1) | **P0** |
| 2 | Band banner on mobile wraps into a 5-line text column; needs a compact variant (title + dots, explainer hidden under 480px) | P1 |
| 3 | Drawer identity row shows retired "Level 10"; contradicts Quest Level 3 below it | P1 |
| 4 | Band card "0% right at this band" when no data exists at that band — suppress the stat until there are attempts | P1 |
| 5 | Concepts hub: triple-redundant chapter cards, no visual differentiation across 11 covers | P1 |
| 6 | "This week" bars unlabeled — add counts on/above bars | P2 |
| 7 | Band appears twice on Progress (stat tile + card) — drop the tile, keep the card | P2 |
| 8 | Streak calendar: 14px day dots lost in a full-width card; tighten to a compact centered strip | P2 |
| 9 | Drawer icon treatment inconsistent between sections; 16 undifferentiated rows | P2 |
| 10 | Dusk: quest-card progress track near-invisible; card-art motif clipping at cover top edge | P2 |
| 11 | `sb-card` system covers only the Home top row — Progress/Parent/Coach cards still hand-rolled inline styles (the Phase-2 class migration, third review running) | P2 |

### Scorecard (design only)
| Facet | Desktop | Phone |
|---|---|---|
| Layout & hierarchy | ★★★★☆ | ★★☆☆☆ |
| Typography system | ★★★★★ | ★★★☆☆ |
| Color & modes | ★★★★☆ | ★★★★☆ |
| Consistency | ★★★★☆ | ★★★☆☆ |
| Information design | ★★★☆☆ | ★★★☆☆ |
| Delight & brand | ★★★★★ | ★★★★☆ |

### Top 5 moves, in order
1. **Fix the mobile chrome**: collapse the mode switcher to an icon cycle-button under 640px, let the top nav horizontally scroll with edge-fade (or fold overflow tabs into the burger), and stop the wordmark wrapping (smaller size or logo-only at narrow widths).
2. **Compact Band banner under 480px** — icon + "Band 4 · School-Bee Ready" + dots; explainer line hidden.
3. **One-hour consistency pass**: drawer "Level 10" → evolution name only; suppress "0% right" when bandless; drop the duplicate Band stat tile.
4. **Concepts hub redesign**: category as the cover's hero word, one accent color per chapter (the cover engine already supports this — it's how themes and games covers work), chapter number as a small corner chip.
5. **Label the week bars and finish the `sb-card` migration** on Progress and Parent — the two screens parents actually see.

*Bottom line: the desktop app has crossed from "well-decorated" to "designed" — the worlds system, wordmark, and harmonized hero row are genuinely strong. The two things still selling it short are the phone toolbar, which breaks at first touch, and information screens (Progress, Concepts hub, drawer) that haven't absorbed the discipline the Home screen just learned.*
