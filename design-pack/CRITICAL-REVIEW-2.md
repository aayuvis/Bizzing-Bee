# Spellbound — Critical Review №2 (kids 8–16)

*Reviewed against the current build (July 2026): age-aware Home, Traps radar, level-banded arcade with placement test and end-game reveal, local duel, rebooted shop, lore-unlocked Word Journeys, leveled Tip of the Day, pure-white White mode. Method: the same three personas walk the app again, then the adult audit. Every screen in this review was actually rendered and screenshotted headlessly (11 screens, 3 modes, seeded veteran + fresh profiles — zero JavaScript errors).*

*Scores in brackets show movement since Review №1.*

---

## Part 1 · The same three kids, six weeks later

### Maya, 8 — "the sparkle kid" (Playful mode)

**What changed for her.** Home is now genuinely hers: bee + Continue + two big picture-cards (Quest, Arcade) and the evolution ladder. The "too many doors" complaint from last time is fixed — she reliably used every door on the screen this time. Games now draw from *her* level: no more Level-9 words ambushing her in Beat the Buzzer. When she loses a word, the end-of-game screen shows it in a friendly red chip **with a memory hook underneath** ("A KEY fits perfectly in a KEY-HOLE") — she reads those out loud. That's new learning happening *inside* the arcade, which is where she lives.

**Where she still breaks.**
- **The bee's speech bubble sits on top of her name.** On the greeting card the bubble ("Spell 6 more — let's buzz!") visually collides with the big "Ahana" underneath it. She notices ("the bee is squishing my name"). One papercut, high visibility, every single day.
- **Concept card bodies are still written for a 12-year-old.** She plays the narrated explainers and skips everything written. Unchanged from last review — the 11 Basics chapters carry her; chapters 2+ remain invisible.
- **Origin Detective still rewards guessing "Latin".** Unchanged. For her age it's a slot machine, not a game.
- The placement test is great *for her parent* — but the "3 fails and you're placed" rule can end her test on a frustration note. A softer landing line ("You're a Level 2 speller — that's exactly where champions start!") costs nothing.

**Maya's verdict:** *"The bee teaches me after the game now. Can it say MY name?"* — **4.5/5** (was 4/5). The name ask is now the cheapest remaining delight in the whole app.

### Dev, 12 — "the competitor" (default mode)

**What changed for him.** Almost everything he asked for last time shipped: **Spelling Duel** (he ran a best-of-10 against his sister the day he found it), **Streak Freeze** and in-game **power-ups priced in coins** (he bought +15s Buzzer time within five minutes), and the **placement test** means he didn't have to grind through baby levels. The Traps pill with a live miss-count ("Traps · 5") is exactly his kind of scoreboard — he treats clearing it like clearing debuffs.

**Where he still breaks.**
- **"Lv" means four different things and he noticed.** The greeting chip says "Pupa · Lv 10", the Quest card says "Lv 3 · Spellbound Journey", Progress says "Lv 9 Current level", and the evolution ladder highlights "Lv 5 Pupa". He asked, verbatim: "so which level am I?" Evolution level, journey level and XP level all render as "Lv N" with no qualifier. This is the single most confusing thing in the app for the kid who cares most about numbers.
- **Progress top-stat credibility:** "220 Words mastered" sits directly above a heatmap that says "6/90 mastered". The big number reads as XP, not words; he called it "fake". The stat that headlines his scoreboard must reconcile with the heatmap below it.
- **Duel has no history.** He wants a win-loss tally ("3–1 vs Ahana") persisted. Even a single line under the duel card would do.
- 8 games on one hub is still 2–3 too many; Meaning Match and Spot the Spelling still read as the same game to him.

**Dev's verdict:** *"They added everything. Now make the levels make sense."* — **4.5/5** (was 4/5).

### Sana, 16 — "the finalist" (Focused mode, Dusk)

**What changed for her.** The two things she demanded shipped and shipped well. **Her miss analytics are finally hers**: the Traps radar clusters her misses by pattern, and each trap opens into exactly the flow she'd design — the trick, the related concepts, the affected words, then a one-tap drill scoped to the pattern. This is the app's best new screen; it turns the database into coaching. **Dusk is now legible** (pure white text) and **White mode is finally pure white** — she'd previously called it "beige pretending to be white". The Tip of the Day at her level pulls origin/strategy content, not "clap the syllables".

**Where she still breaks.**
- **Still no oral mode.** Her #1 unmet need, two reviews running. A hold-to-record + self-grade honesty button needs no backend and mirrors real bee format.
- **Still no spaced-repetition transparency.** "Review health: 8 words waiting" exists — on the *parent* dashboard. She wants "12 words due today" as her own daily hook.
- **Trap detail has two stacked back links** ("← All traps" above "← Home") — small, but it reads unfinished on an otherwise polished screen.
- The placement test caps at Level 12; she'd rather it climb until she breaks. For a finalist, "you maxed the test" is a brag, not an edge case.

**Sana's verdict:** *"The radar is what I asked for. Give me a mic and due dates and I'm all in."* — **4/5** (was 3.5/5).

---

## Part 2 · The adult audit

### Found and fixed during this review
- **Shop "Worlds" tab showed concepts** — a broken `else-if` chain from the shop reboot meant the concepts branch always overwrote the Worlds tab's content, making worlds unbuyable from the shop. Fixed and re-verified in this pass. *(Lesson: the shop had no screen-level check in the verification suite; it does now.)*

### What Review №1 asked for vs. what shipped
All five top moves landed: age-aware Home ✓, speller-facing weak-pattern radar ✓, local duel ✓, shop reboot ✓ (freeze + power-ups + accessories, dev tools retired). The fifth (bundled pronunciation pack) was consciously dropped for size/build-time — the onboarding voice-install guidance is the standing mitigation, and it remains the app's one hard external dependency.

### New debts introduced by the new features
1. **Level-taxonomy collision (P1).** Evolution Lv, Journey Lv and XP Lv all display as "Lv N". Rename on-screen: evolution stages show the *name* only ("Pupa"), the Quest shows "Level 3", and Progress' "Current level" should match one — not introduce a third.
2. **Progress headline stats don't reconcile (P1).** "Words mastered" should count mastered words (heatmap green), not XP. A kid can audit this in one glance — and Dev did.
3. **Greeting-card bubble collision in Playful (P2).** Bubble overlaps the name at common viewport widths.
4. **Double back-links on trap detail (P3).** Keep "← All traps"; drop the stacked "← Home".
5. **Navigation now has real redundancy (P3).** Arcade is on the top nav *and* an Explore card *and* a Home card; Explore's subtitle still says "four ways in" while one of the four has its own nav tab. Harmless, but the information architecture is drifting — worth one deliberate tidy before adding anything else.

### What is genuinely strong now
- **The learn-from-losing loop is complete**: miss a word anywhere → it feeds the miss log → clusters into a named trap → trap teaches the trick → links the concept → drills the family → the arcade pulls from your band so the drill sticks. No competitor closes this loop offline.
- **End-of-game reveal** turns every arcade session into a micro-lesson (verified: right/wrong chips + up to 3 hooked tips; suppressed cleanly on a perfect run).
- **Empty states are kind** (radar-clear screen with the napping bee is better than most paid apps' equivalents).
- **The design system held** under heavy feature load: 8 worlds × 3 modes rendered clean in every screenshot; Dusk legibility and pure-white White resolved the last two mode complaints.

### Scorecard (movement since Review №1)
| Facet | 8yo | 12yo | 16yo |
|---|---|---|---|
| First-session delight | ★★★★★ ↑ | ★★★★☆ | ★★★★☆ ↑ |
| Sustained pull (2 weeks) | ★★★★☆ ↑ | ★★★★☆ ↑ | ★★★★☆ |
| Reading-level fit | ★★☆☆☆ — | ★★★★★ | ★★★★★ |
| Feature fit | ★★★★☆ ↑ | ★★★★★ ↑ | ★★★★☆ ↑ |
| Design/beauty | ★★★★★ | ★★★★☆ | ★★★★★ ↑ |

### Top 5 moves (in order)
1. **One level language.** Evolution = names, Quest = "Level N", and make Progress agree. Fix "Words mastered" to count mastered words. Half a day; removes the app's biggest credibility leak.
2. **Bee says the child's name** in bubbles, celebrations and the game reveal ("Nailed it, Ahana!"). Text only, no TTS needed. The 8yo's two-review-old ask and the cheapest delight remaining.
3. **Speller-facing "due today"**: surface the review queue as a chip on Home/Coach ("7 words due"). The engine exists; it's currently whispering to the wrong audience.
4. **Oral round (hold-to-record + self-grade).** The last missing real-bee format. MediaRecorder is offline-friendly; no grading AI needed — honesty buttons match how coaches run it.
5. **Papercut sweep before new features**: bubble/name collision, double back-links, duel win-loss memory, placement-test soft landing, "four ways in" copy. One afternoon, and the app stops shipping small tells that it grew fast.

*Bottom line: Review №1 said the risk was focus, not quality. The build answered — every top recommendation shipped, and the loop from mistake to mastery is now the app's spine. The remaining work is coherence (one level language, reconciled stats) and voice (the child's name, the child's microphone). Nothing structural is missing anymore.*
