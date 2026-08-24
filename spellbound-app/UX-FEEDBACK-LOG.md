# UX feedback log — August 2026

Every item posted in the play-testing round, what was done with it, and what is still
open. Ordered as posted. Live on **www.bizzingbee.com** at asset stamp `20260824c`.

**Legend** — ✅ done and deployed · 🟡 partly done · ❓ parked on a question · ⬜ not started

---

## 1 · Settings — Sign out was buried ✅ *(and it was worse than reported)*

> "Under Settings > Sign out button was difficult to find as it was deep in the settings
> pop up. Do you think the different section under settings should be in accordion…"

**What I found.** Not a placement problem. There were **two** controls labelled "Sign out",
and the big red one at the foot of Settings — the one you eventually found — **does not sign
anyone out**: `app.signOut` only returns to the landing screen. The real one, `app.doSignOut`
(`SB_AUTH.signOut()`), was a 12.5px chip wedged between "Admin console" and a privacy link.

**Done.** The foot button is renamed "← Exit to the start screen" with a line explaining what
it does and where the real one is. The account action now reads "Sign out of *your@email*".

**❓ Open — the accordion.** I did not restructure. An accordion costs a click on *every*
setting to solve one, and the defect turned out to be a mislabelled button. Questions:
- With sign-out now correct at the top, is the sheet still hard to scan?
- If yes: collapse only the two long sections (Look & feel, Sound & voice) and leave the
  rest open, or accordion everything?
- Should the sheet remember which section was last open?

---

## 2 · Practice — "Complete" wording and no obvious next step 🟡❓

> "Instead of 'complete' should it say mark complete similar to mark for revision… I was on
> this page and didn't know what to do next."

**Done — the "what next" half.** A wrong answer now holds with an explicit **"Next word →"**
button beside the spelling (Enter still advances). That was the real complaint underneath.

**❓ Open — the relabel. I could not confirm which screen you meant.** In the code, `Complete`
appears as a *pattern status chip*; the **Revisions** page says "mark it complete once it
sticks"; and Practice's own source comment says "no manual marking in Practice". So:
- Which screen had the button — Practice, or Revisions? A screenshot settles it.
- If "Mark complete" and "Mark for revision" sit side by side, which is the primary action?
- On Revisions, "complete" removes the word from the list. Should it confirm first?

**Where I pushed back.** I would take "Mark complete" but not the "next" / "ready for next"
framing — that collapses *state* into *navigation*, and they should stay separate.

---

## 3 · Train the words — the answer flashed past ✅ *(differently from what was asked)*

> "…shows the answer for a very short duration… ideally should be there for 4 secs, or there
> should be ability to add to revision list from there."

**Confirmed in code.** Wrong answers auto-advanced after **2,200ms**; "Show answer" after 2,400ms.

**Done.** A wrong answer now **holds until dismissed** — no timer at all — with the correct
spelling on screen and a Next button. "Show answer" holds too: you asked to see it, so it
should not be snatched back. Words are already auto-added to the revision pile on a miss.

**Why not the 4 seconds you asked for.** A fixed delay that suits a struggling speller
irritates a fast one. **❓ Open:** does the hold feel right, or do you want it to move on by
itself? If so — always, or only when `calmMode` is off? (That toggle already exists: "Games
run gentler — slower pace, no time pressure".)

---

## 4 · Search bar ✅ *(no action — logged as a "don't break this")*

> "love the search bar to search any word just like a dictionary. Keeps user in the ecosystem"

Recorded as a regression guard. Nothing changed.

---

## 5 · World Atlas — no movement, and it did not still the background ✅🟡

> "I didn't see the dino's moving today… should there not be moving animation in world atlas?"
> and later: "clicking on word atlas is not freezing the background as it did with practice
> and library."

**Done — the freeze.** `FOCUS_NAVS` is the list of screens that switch focus on (music off,
world held still). The Atlas was **missing from it**, so the world went on moving behind the
map while it stopped behind Library. Practice and the new Coach were missing for the same
reason. Added: `trail`, `coach`, `train`, `quest`, `coachdesk`, `ipatrain`. Verified per tab.

**A correction worth stating.** When you earlier asked to "freeze the world in Word Atlas to
make it render faster", I built `mapPoints` memoisation — a real **272×** win (1,224µs →
4.5µs per render) and worth keeping — but it was **not what you asked for**. This is.

**⬜ Open — the ambient animation itself.** Not started. Questions:
- Is it the dinosaurs specifically you expected moving, or ambient motion generally?
- Anything I add must switch off under the existing **Reduce motion** accessibility toggle —
  confirm that is fine.

---

## 6 · Arcade flight — honey by the wall, honey vs coins ✅ *(one bug, not two)*

> "…either coins or honey but given honey prompted the spelling word it should not be
> competing… at times honey came just next to the wall so it was a do or die situation."

**Root cause.** Towers, pots, coins and hearts each picked their own random height with no
idea where the others were. Both symptoms, one omission.

**Done.** Collectibles are now **placed by a tower** — centred on that tower's gap and set
down 170px past the pillar, in air the bee is already flying through. Everything drifts at
one speed, so what is centred at spawn is still centred on arrival. Coins and hearts stand
aside while a pot is pending or live. `tests/flight-geometry.js` parses the real difficulty
constants out of the source and proves the invariant at all four levels, so a later retune
cannot quietly undo it.

---

## 7 · Arcade — no correct spelling after a miss, no list of words practised ✅

> "when I don't get the word correct why don't I see the correct spelling… can there be a way
> to see the word trained during the arcade games in one place after the game over message."

**Done.** Engines record every word and whether it was spelled right (`SB_WORDLOG`, cleared
per round). The result card lists them **missed first**, each with its meaning, a speaker
button, and one-tap **Revise**.

**❓ Open — the "today" half.** You also said *"see all your practiced word during game today"*.
That is a different, larger feature: a daily log across sessions, not a per-round one.
- Do you want it?
- Should it live inside Revisions, or on its own screen?

---

## 8 · Arcade — Pac-Man arrow responsiveness ✅

**Confirmed.** A turn was accepted only within one step of a cell centre, so an arrow pressed
a moment late was dropped in silence and you waited out a whole corridor.

**Done.** A **reverse** now takes effect immediately, and a turn entered while approaching a
junction is accepted early with the bee pulled up to the corner — standard arcade cornering.

---

## 9 · Hamburger — too much, and how to reach Learn/Train ✅

> "I was wondering how else to go to learn and train section which I later found under
> library" · "clean up the hamburger… it has a lot"

**Done.** Eighteen rows over six headings became **twelve**, with seven long-tail
destinations folded into a **"More ways to train"** disclosure, and **Coach** added near the
top.

**❓ Open — the Learn/Train discoverability itself.** You found it eventually, which makes
this an information-architecture question rather than a bug, and one session is not enough to
move navigation. Add a shortcut in the hamburger *pointing at* Library (cheap, reversible),
or wait for a second test?

---

## 10 · An AI coach ✅ *(built — as rules, not AI, at your direction)*

> "Should there be in future AI coach?" → then: "the coach should not be an AI coach… can
> there be hardcoded rules and coaching based on that. we already have a word trap."

**Done.** `coach-rules.js` — no model, no network, nothing generated, the same discipline as
the parent tips ("picked by analytics rules, never AI"). For each of the ten traps: the
mistake in the child's terms, the rule, a check to run at the microphone, worked examples.

Then, after your two follow-ups — *"boring looking… no flow… no graphics"* and *"dead
spaces… address it with dynamic tiles"* — it was rebuilt:

- **Every trap is a character**, cast meaningfully: a ghost for silent letters, an echo for
  doubles, a shapeshifting fox for sound-alikes, Gutenberg for words made from names.
- **The centrepiece is a picture of the mistake.** 26,879 words already carry a recorded
  common misspelling; the page now draws the word spelled right beside the way it is usually
  got wrong, with only the differing letters lit, and a dropped letter shown as a gap. The
  example comes from the child's **own** missed words.
- **It reads as a path** — Bizzy names the one thing to fix, then 1 What goes wrong → 2 The
  trick → 3 Watch it work → Beat it.
- **Dead space fixed** by giving the narrow column three tiles that earn their height (trap
  chart, four live stats, their own worst words as chips), and letting tiles take natural
  height rather than stretching to the tallest.

**Related fix.** "Concepts to revise" led nowhere — and so did the same click from the traps
page and the random-word button. `openConcept` set the chapter but never set the nav, and the
detail view only renders under `nav:'concepts'`. It now carries the nav and returns to where
it came from.

---

## 11 · Parent tips — scope had outgrown the rules ✅

> "we have added to the scope of the app after the hardcoded tips were set… analyse and
> strengthen them in if this then <tip> logic"

**Done.** `parentSignals()` now also reads word difficulty (and whether it is still
calibrating), Atlas stops cleared, the vocabulary ladder, themes picked, arcade play and the
Advanced Pack. Nine new *if-this-then* rules fire on those, including a generated tip that
names the child's own worst trap. Six new authored categories — **178 tips across 22**.

---

## 12 · Responsiveness — everything except the Atlas ❓ *not started*

> "app is fairly responsive except atlas page"

I did not touch this, because I would rather reproduce it than guess. **Questions:**
- Which device and viewport width?
- What broke — horizontal overflow, overlapping elements, or unreadable text?
- Portrait, landscape, or both?

---

## 13 · Parent gate ❓ *already built, off by default — needs your decision*

> "Going to parent should have some confirmation so that there's security… outschool asks a
> validation question… here a quick outschool video recording."

**What I found.** `pinGate()` already guards Settings, the Parent zone, purchases and
upgrade. It just does nothing when no PIN is set: `if(!pinSet()){ nextFn(); return; }`. So
this is **onboarding, not features** — nobody is ever asked to set one.

**Not done, because the shape is your call:**
- Prompt during onboarding, or **gate by default** with a challenge when no PIN exists?
- If gated by default, what is the fallback — a maths question (Outschool's approach), a
  birth year, or press-and-hold?
- Should a wrong answer do anything beyond re-asking (lockout, parent email)?
- **I cannot watch the Loom.** Describe the mechanic or paste a transcript and I will match it.

---

## Summary

| Item | State |
|---|---|
| 1 · Sign out buried | ✅ fixed (real defect was a mislabelled button) · ❓ accordion |
| 2 · "Complete" wording | 🟡 next-step added · ❓ which screen |
| 3 · Answer flashed past | ✅ now holds · ❓ is a hold right, or a timer |
| 4 · Search bar praise | ✅ logged as a regression guard |
| 5 · Atlas movement | ✅ background now stills · ⬜ ambient animation |
| 6 · Flight honey/coins/wall | ✅ fixed, with a test |
| 7 · Arcade word recap | ✅ per round · ❓ a daily "today" log |
| 8 · Pac-Man arrows | ✅ fixed |
| 9 · Hamburger clutter | ✅ 18 rows → 12 · ❓ Learn/Train IA |
| 10 · Coach | ✅ built, then redesigned twice on your notes |
| 11 · Tips vs new scope | ✅ 9 new rules, 178 tips |
| 12 · Atlas responsiveness | ❓ need the device and what broke |
| 13 · Parent gate | ❓ exists but opt-in — needs your call |

**Nine questions are waiting on you**, and the three that block real work are: which screen
the "Complete" button was on (2), what broke on the Atlas and where (12), and how the parent
gate should behave (13).
