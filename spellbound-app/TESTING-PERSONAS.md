# Bizzing Bee — Tester Personas

The companion to [`TESTING-PROTOCOL.md`](TESTING-PROTOCOL.md), which has referenced this
file in three places since July 2026 without it existing. The protocol says *what* to test
and in what order; this says *who* is testing, what each of them is for, and how a finding
gets written down.

> **Provenance, so nobody has to guess which of these is real.**
> Six personas are **ESTABLISHED**: they are driven end-to-end by
> [`tests/ux-personas.cjs`](tests/ux-personas.cjs) on every release sweep, at the exact
> viewports listed. Where this file and that file disagree, the code wins — it is the one
> that actually runs.
> **Liam** is named in the protocol (§2.5) as the accessibility persona but has never been
> written down anywhere; he is reconstructed here from what §7 actually checks.
> The protocol calls for **6 kids + 4 parents = 10 sessions** (§3 Phase 3, §11). Six exist.
> The last three are marked **PROPOSED** and are a starting point to accept, edit or throw
> out — they are not agreed, and nothing depends on them yet.

---

## 1. Why personas at all

The headless suite answers *does it work*. It cannot answer *would a nine-year-old come
back tomorrow*, and that is the question this product lives on. Every persona therefore
ends their session on one question:

> **"Would you open this again tomorrow?"** — and if no, *why not*, in their words.

The protocol's exit criterion (§4) is that **every persona answers yes, or has a logged
reason**. A persona who says no and whose reason is not in the log is a failed sign-off,
not a soft finding.

**Test in character.** The point of a persona is to stop the tester using their own
knowledge of the app. Maya cannot read the word "Continue". Ravi will not read a how-to
card. Daniel does not know what an Advanced Pack is. If the tester finds themselves
thinking *"well, obviously you tap there"*, that is the finding.

---

## 2. The children

### Maya · 6 · phone (390×844) · ESTABLISHED
**Age band 5–7 · brand new · cannot reliably read UI text.**

The youngest the app admits. She is below the stated 8–15 audience on purpose: she is the
test of whether the *front door* is passable by someone who cannot read it. She taps
pictures, not words, and she will tap the biggest brightest thing on screen regardless of
what it says.

- **Drives:** first boot on a cold `localStorage`, the landing page, account creation,
  the whole of onboarding, the phone tab bar.
- **She is the reason we check:** the privacy notice is linked on the landing screen *and*
  at the point of collection; an empty name is refused; skipping the world pick is refused
  with a friendly toast rather than a dead end; the nav tabs are reachable at 390px.
- **Her failure mode:** a screen whose only way forward is a word. Log it MED at minimum.
- **Do not:** read the buttons aloud to her. If she can't find it, it isn't findable.

### Ahana · 9 · tablet (834×1112) · ESTABLISHED
**Age band 8–10 · the core user · touch only, no keyboard.**

The speller the app was built for. She is on the World Atlas, walking stops, and she is
the one whose verdict actually matters — this is the persona the product is aimed at, so
a "no" from her is a release blocker rather than a data point.

- **Drives:** the Atlas map, a stop card, Meet-the-words, Practice, the quiz gate,
  the living-country layer (landmarks, heroes, pokes, caches).
- **She is the reason we check:** a fresh stop card says exactly how to qualify (70% in a
  real session); the deck, the drill and the gate all work by touch alone; nothing needs a
  keyboard; the map never says how long the road is.
- **Her failure mode:** not knowing what the game wants. She does not experiment for long.
- **Do not:** let her use a keyboard, even if one is attached.

### Ravi · 12 · desktop (1280×900) · ESTABLISHED
**Age band 11–13 · here for the Arcade · will not read instructions.**

He is the stress test on the games. He opens every tile, skips every how-to card he can,
mashes keys, and quits anything that isn't immediately legible. He is why the arcade has
per-game difficulty rather than one global dial.

- **Drives:** the Arcade hub, every game tile and its setup menu, at least one full round
  of each engine, on **keyboard** — then the same game again on touch.
- **He is the reason we check:** every game has both keyboard *and* touch controls (this
  is a hard rule, and a game failing it is MAJOR); a game says what it wants before it
  starts; a round ends on a screen that shows the words.
- **His failure mode:** a game he can't tell he is losing. The Grand Prix's camera bug
  (Sep 2026 — the kart drawn dead centre no matter where it was) is exactly his finding:
  *"the car drives itself, I don't have to take any action."*
- **Do not:** explain a game to him. Ever.

### Sofia · 15 · desktop (1280×900) · ESTABLISHED
**Age band 14–18 · competition-minded · reads everything.**

The oldest speller, preparing seriously. She is the test of whether the app has a ceiling —
whether there is anything here for someone who is already good. She reads definitions,
checks etymology, and will notice a wrong one.

- **Drives:** the Library, the book shelf and a volume in the reader, Concepts, the
  Champion ladder, Ultra / the Advanced Rounds, the IPA trainer.
- **She is the reason we check:** the shelf's spines are real and tappable; advanced
  content gates on the add-on and says so rather than hiding; the hardest words are
  actually reachable; IPA and the friendly respelling agree with each other.
- **Her failure mode:** running out of road, or finding a word the app has wrong. Anything
  touching a spelling, a pronunciation or a definition is **at least Major** (protocol §5).
- **Do not:** hand her the easy lists.

### Liam · 10 · tablet · RECONSTRUCTED (named in protocol §2.5, never written down)
**Age band 8–10 · the accessibility pass.**

Runs the app with the assistive settings on and the OS motion preference set to reduce. He
exists to keep the gap list honest: the protocol's §7 says to verify **present-vs-missing**,
so his session is as much an inventory as a test.

- **Present, and must work:** Text size (Normal/Large), Voice speed (Slow/Normal),
  Read-aloud, Dusk and White themes, Playful/Focused, visible keyboard focus, answer-box
  autofocus, hotkeys.
- **Known gaps — log every cycle until built, do not re-raise as new:** dyslexia-friendly
  font; in-app high-contrast; an in-app reduced-motion toggle (only the OS
  `prefers-reduced-motion` is honoured today); timer-off / calm mode.
- **He is the reason we check:** the accessibility flags land on `<html>`, not on `#root`;
  every flashing ambient system actually *stops* under reduced motion rather than freezing
  mid-flash.

### PROPOSED · a sixth child — the one with no English at home
Age band 8–10, tablet, a household where English is the second language and a parent
cannot help with pronunciation. The app's whole pitch is that **every word is spoken**, and
nobody currently tests the case where that recording is the only source of truth. Would
also cover: currency set to ₹, lakh/crore grouping, and the offline path (bundled audio
works, streamed word audio does not).

*Not agreed. Say yes and I'll write them properly; say no and the count drops to five.*

---

## 3. The grown-ups

### Priya · parent · desktop · ESTABLISHED
**Sets the thing up and then wants it to be quiet.**

She is the settings and safety pass. She does not play; she configures, checks, and leaves.

- **Drives:** Settings end to end — every quick tile toggled twice (must not error, and a
  *choice* tile must advance rather than light up), the account card, the age band, the
  themes.
- **She is the reason we check:** the PIN gate holds; a choice tile cycles and a toggle
  lights; nothing in Settings can spend money; the Advanced Pack sits inside Account and
  not beside it pretending to be the plan.

### Daniel · parent · desktop · ESTABLISHED
**Wants to know whether it is working. Seeded with a fortnight of history.**

The reporting pass. His session runs against two weeks of fabricated activity and a list of
missed words, because an empty report proves nothing.

- **Drives:** the Parent Zone behind the PIN, Progress & reports, the weekly report, the
  word heatmap, the 30-day targets, the missed-word list.
- **He is the reason we check:** the report reflects real activity; nothing leaves the
  device; a report says what was *learned*, not how long the app was open.
- **His failure mode:** a dashboard of usage. If the only number is minutes, that is the
  finding.

### PROPOSED · a third parent — the buyer
The one who has not paid yet. Walks the plans sheet, the Advanced Pack pitch, and a real
purchase flow: does the price appear before the commitment, is the flow parent-only behind
the PIN, is there any path from a child's screen to a payment form (there must not be), and
does a declined card leave the account in a sane state.

### PROPOSED · a fourth parent — the one exercising their rights
Consent, export and deletion. Grants cloud consent, checks what actually leaves the device,
withdraws it and confirms the upload is **deleted** rather than merely stopped, then deletes
a speller entirely. COPPA and the DPDP Act both give a parent this right and `privacy.html`
claims the app offers it, so somebody should be checking the claim is true.

*Neither is agreed. Both are the two riskiest untested paths in the product.*

---

## 4. Session shape

Each session is one persona, one device, one sitting. Fifteen to thirty minutes.

1. **Set the scene.** State the persona out loud, and the device and input mode. Set the
   currency and locale if they are not the default.
2. **Start cold** where the persona demands it — Maya always starts on a cleared
   `localStorage`; everyone else may start seeded.
3. **Follow their goal, not a script.** The bullets above are what the session must *cover*,
   not an order to click in. A persona who wanders somewhere unplanned has found something.
4. **Narrate.** Say what you expect before you tap. The gap between expectation and result
   is the finding, and it disappears if you tap first and rationalise after.
5. **Log as you go** (§5). A friction you decide to write up later is a friction you forget.
6. **Close on the question:** would you open this again tomorrow, and why not.

**Order matters.** Run the §10 headless harness *before* any persona session (protocol
§11) — a persona hitting a bug the harness would have caught is a wasted session, and
wasted sessions are why the persona pass gets skipped.

---

## 5. Logging a finding

One row per finding. Severity per protocol §5; the rule that anything touching **spelling,
pronunciation or a definition is at least Major** applies here without exception.

| # | Persona | Device / input | Screen | What I expected | What happened | Severity | Repro | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | Ravi·12 | desktop / keyboard | Grand Prix | steering to move the car | car stayed dead centre, road slid | Major | every bend | fixed 20260928a |

- **Device / input is not optional.** "A game with no keyboard support" is Major, and the
  only way that gets caught is if the input mode is on every row.
- **What I expected, before what happened.** A row with only the second half is a bug
  report; a row with both is a design finding.
- **Repro** in the persona's terms, not the developer's. "Every bend", not "when
  `seg.curve > 3`".
- **Friction is a finding.** A thing that worked but took four tries is Minor, and four
  Minors in the same place is a Major nobody has written down yet.

### The three findings that are not bugs
Keep these separate from the severity ladder — they are the ones that change the product
rather than fix it:

- **Confusion** — the persona did not know what the screen wanted. Log the screen and the
  sentence they said out loud.
- **Boredom** — they disengaged. Log where, and how long in.
- **"No" to tomorrow** — their reason, verbatim. This is the only finding that can fail a
  release on its own.

---

## 6. Keeping this file honest

- `tests/ux-personas.cjs` is the authority on the six established personas. If a persona's
  viewport, name or journey changes there, change it here in the same commit.
- A PROPOSED persona is either promoted (written up properly, and added to the harness if
  it can be automated) or deleted. It does not sit here for a year looking like policy.
- The protocol's §3 and §11 both say **10 sessions**. Until the three proposals are settled
  that number is wrong; either agree them or change the protocol to seven.
