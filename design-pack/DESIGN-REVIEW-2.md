# Bizzing Bee — Deep Design Review №2 (post-fixes · four personas · adoption & engagement hooks)

*Method: fresh headless sweep with two profiles — a brand-new family (no saved data, walked from the landing page through onboarding to day-one screens) and a 12-day veteran — on desktop and 390px phone. All five fixes from Review №1 re-verified programmatically. Zero JavaScript errors. Personas: Maya 8, Dev 12, Sana 16, and new this round: **Priya, the parent** — the one who decides whether the app gets installed, stays installed, and gets paid for.*

---

## Part 1 · Review №1 fixes — all five verified landed

| Fix | Status |
|---|---|
| Mobile chrome (tab bar, cycle button, nowrap wordmark) | ✅ scrollWidth 390/390; tab nav works; cycle steps Light→White→Dusk |
| Compact Band banner <480px | ✅ explainer hidden on phone |
| Consistency pass (drawer Level, 0% suppression, dup Band tile) | ✅ drawer reads "Pupa · 120 coins"; only Quest says "Level" |
| Concepts hub topic-first covers | ✅ Basics/Prefixes/Roots heroes, family colors, Ch-chips |
| Labeled week bars + card migration | ✅ counts on bars; 15 cards on `.sb-card` |

The phone experience is transformed: the bottom tab bar reads like a native app, and the Concepts hub finally scans by color and topic.

---

## Part 2 · Four personas

### Maya, 8 — the day-one child
Her first home screen contains one perfect hook and one wasted one. The perfect one: **"5 XP to Hatchling."** Five correct words and her egg hatches — a first-session win she can reach in three minutes, with confetti. This is the single best adoption mechanic in the app and it exists by accident of the XP curve. Protect it, and stage it: the hatch moment should be *the* day-one ritual.
The wasted one: the most prominent element on her first home is a banner saying **"Bee Band: calibrating…"** — the app's first headline to a new child is "we don't know anything about you yet." An 8-year-old reads that as a shrug. Day one, that banner should be an invitation instead: *"Find your Bee Band — a 3-minute quest →"*.
Also: her Playful home has **no Tip of the Day** (it's focused-mode only) — fine editorially, but it means the under-11 home has no daily-changing content except the goal number. Something must change every day on the screen a daily-habit app shows a child.

### Dev, 12 — the competitor
His engagement peaks are level-clears — and the celebration card (bee, "Level 6 unlocked!", lore tease, "Screenshot this card to share it!") is genuinely strong. But his *other* peak is silent: **a Bee Band promotion has no moment.** He grinds to prove Band 5, the number quietly changes on a banner, and nothing celebrates the single most meaningful achievement in the new system. Band-up deserves the full celebration treatment — arguably more than a level-clear, because it's *proven skill*, not attendance.
Duel still keeps no win–loss history (second review running). And the streak chip shows "0-day streak" on day one — leading a brand-new kid with a zero. Hide the chip until streak ≥ 1.

### Sana, 16 — the finalist
The chrome overhaul reads as native on her phone; the cycle button is the right call. Her remaining asks are unchanged and now stand out *because* the design debt around them cleared: no oral/mic mode, no "due today" queue. From a pure design lens she flags one thing this round: the landing page's **"4.9 ★ parents"** claim — the app has no store listing; an invented rating is the kind of tell she distrusts an app over. Replace with something true ("Built with a national finalist" / "100% offline — your words never leave the device").

### Priya, the parent — NEW, and she found the worst bug in the app
Priya signs her daughter up, pokes around for two minutes, and opens the Parent dashboard. She sees:
- **"Why now: no practice in 999 days"** — a sentinel value leaking straight into coaching copy. On day one. This single string torpedoes the dashboard's authority — if the app is wrong about *999 days*, why believe its readiness signals?
- **Four red 0% tiles** (Consistency 0%, Accuracy 0%, Coverage 0%, Readiness 0%) and one green **"Review health 100%"** (of zero words). Cold-start states rendered as alarms and false comfort. The dashboard is scoring a child who hasn't started, and scoring her *badly*.
- The **Coach's corner leads with "Re-engage"** advice for a child who joined ten minutes ago.
What she needed instead was a welcome state: *"Maya hasn't practised yet. Signals appear after the first session — here's what you'll see."* One conditional, total trust preserved.
What Priya *loves*: "All computed on this device — no internet, no AI" (exactly the reassurance a parent wants in 2026), the weekly report button, print, and the finals countdown. The trust foundation is strong — it's the cold start that betrays it.

---

## Part 2b · The boys' bench — Arjun 8, Kabir 16 (Dev, 12, already spoke for them)

### Arjun, 8 — announces his evolution form out loud at dinner
- **The Queen Bee problem.** The default world's ladder — the one every new family lands in — ends at **Queen Bee**. Arjun says "I'm a Grub!" with pride, but a meaningful share of 8-year-old boys will stall at aspiring to become a *Queen*. Every other world already solves this (Master, Arcade, Galaxy, Eureka, Elemental — all neutral); it's only the default world, where the youngest and least-committed users start, that carries the risk. Two fixes, either works: a line of hive lore right on the ladder — *"every hive is ruled by its Queen — the strongest, most protected bee alive"* — turning the name into a flex; or a final-form title choice (Queen Bee / Monarch of the Hive). Do not silently rename it for everyone — Maya loves it.
- **The accessory shop has nothing he covets.** Golden Crown, Scarlet Bow, Star Halo — three ornaments. Where are the flight goggles, the cape, the lightning bolt, the tiny headphones? Cosmetics are how 8-year-old boys spend; the current catalog is styled for exactly half of them.
- **Onboarding pre-selects the cute purple world.** Blade, Arcade and Lab are right there, but the default is already highlighted, and 8-year-olds accept defaults. Make world choice an active tap with nothing pre-selected — every child ends up in a world that feels *chosen*, which is worth more retention than any default.
- What already works for him: Boss Battle framing, the duel, coins, the trophy-case cover art. The bee itself is not a problem — round, big-eyed mascots are gender-neutral at this age; it's the *aspiration ladder* and the *shop*, not the mascot.

### Kabir, 16 — indistinguishable from Sana, by design
At sixteen the app's gender coding has essentially vanished: Focused mode quiets the mascot, Dusk + Blade/Lab worlds carry the aesthetic, Band tiers speak pure competition ("State & National"), and his asks are identical to Sana's (mic mode, due-today queue, Band-up celebration). That's the correct outcome — a design that needs no male variant at 16 because the personality dials (world, mode, age) already cover it. The one thing he'd add: the share-card celebration is the right brag mechanic, and the missing **Band-promotion card** matters even more to him than to Dev — proven rank is the thing his group chat respects.

**Pattern across ages:** the app's gender-neutrality is strong *except* where the default world funnels everyone at the start — its endpoint name and its shop catalog. Fix those two and the funnel is neutral end-to-end.

## Part 3 · Adoption funnel audit (minute 0 → day 1)

**Landing page: strong.** Real hero copy, live demo card (word + streak + form), "Start free →", "No card to start." This is a credible commercial front door. Two blemishes: the invented 4.9★ rating (above), and the demo card is static — it *looks* tappable; letting a visitor actually spell `iridescent` right on the landing page would be the cheapest conversion win available.
**Onboarding: good bones.** Name/age → world picker (the app's most premium screen) → optional placement. The placement test is the right kind of optional — but its entry copy undersells the payoff. It sets Band + games + quest start *and* skips grinding; say so in one line.
**First session: the funnel's strongest link, unstaged.** Path chooser on first Practice tap (good — three clear doors), then ~5 words to Hatchling. But nothing *tells* the child the egg is about to hatch. Add one line of bee-bubble on day one: "Spell 5 words and I hatch!" — then the existing celebration does the rest.
**Day-one dead zones:** calibrating banner (Maya), zero-streak chip (Dev), parent dashboard alarms (Priya) — all cold-start rendering problems, all fixable with conditionals, no new systems needed.

## Part 4 · Engagement loop audit (day 2 → day 30)

| Cadence | Existing hooks | Verdict |
|---|---|---|
| Daily | Goal ring · streak chip · Tip of the Day (focused only) · revenge round · bee-day countdown | Solid for 12+; Playful home has no daily-changing content |
| Weekly | Parent weekly report · week bars (now labeled) · streak rewards (3/7/14/30) | Good; report is the parent ritual — consider a "report day" nudge chip |
| Milestone | Level-clear celebration + lore unlock + share prompt | Excellent — best-in-class moment |
| Milestone | **Band promotion — NO moment** | The biggest engagement gap in the app |
| Long arc | Evolution (10 forms) · 100 lore tales · 121 concepts · 52 themes · shop cosmetics | Deep; well-teased ("Next up:" lock lines are good hunger mechanics) |

The lore tease in the Story vault ("Next up: The Proto-Indo-European Mother Tongue — clear a Level to open it") is exactly the right pattern — visible, named, locked, one action away. Apply the same pattern to the *next* Band tier and the *next* evolution form on their respective screens.

---

## Scorecard (movement since Review №1)
| Facet | Desktop | Phone |
|---|---|---|
| Layout & hierarchy | ★★★★☆ | ★★★★☆ ↑↑ |
| Consistency | ★★★★★ ↑ | ★★★★☆ ↑ |
| Information design | ★★★★☆ ↑ | ★★★★☆ ↑ |
| **Day-1 adoption** | ★★★☆☆ | ★★★☆☆ |
| **Day-30 engagement** | ★★★★☆ | ★★★★☆ |
| Trust (parent) | ★★☆☆☆ — the 999 days | ★★☆☆☆ |

## Top 6 moves, in order
1. **Parent cold-start welcome state** — kill "999 days", replace day-zero alarm tiles and "Re-engage" advice with a warm "signals appear after the first session" panel. This is a trust P0.
2. **Band promotion celebration** — full celebration card ("Band 5 — Regional Ready! Proven, not given."), confetti, share prompt. The system's proudest number currently changes in silence.
3. **Day-one staging**: banner becomes a placement invitation; bee bubble announces "5 words and I hatch!"; streak chip hidden at zero.
4. **Playful-home daily content**: a kid-phrased tip/word-fact of the day (the pool exists — reuse `tipOfDay` with the basics band and simpler framing).
5. **Landing honesty + interactivity**: drop the invented 4.9★, make the demo card actually spellable.
6. **Neutralize the default-world funnel**: hive-lore line under Queen Bee (or a title choice at the final form), 3 gear-coded accessories (goggles, cape, bolt), and no pre-selected world in onboarding.

*Bottom line: the design system is now consistent from desktop to phone, and the mid-game engagement loops are genuinely strong — the celebration-and-lore ladder would be at home in a top-tier kids app. The soft spots are the two edges of the lifecycle: the first ten minutes (cold-start states that read as alarms or shrugs) and the proudest milestone (Band promotion) passing without applause. All five recommended moves are conditionals and copy on existing systems — a day of work for the highest-leverage retention gains left.*
