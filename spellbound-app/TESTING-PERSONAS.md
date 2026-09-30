# Tester Personas for a Learning App

A reusable set of testing personas for any full-scale learning product — a spelling
trainer, a maths course, a language app, a finance simulator. The personas are defined by
**the job they do in testing**, not by the subject being taught, so the same cast works
across products and across releases.

The companion to [`TESTING-PROTOCOL.md`](TESTING-PROTOCOL.md), which says *what* to test
and in what order. This says *who* tests, what each of them is for, what only they can
catch, and how a finding gets written down. §8 instantiates the cast for Bizzing Bee.

---

## 1. What personas are for

An automated suite answers **does it work**. No suite answers the four questions a
learning product actually lives or dies on:

| The question | Who can answer it |
|---|---|
| Did they **learn** anything, or only score? | a learner over several sessions |
| Would they **come back tomorrow**? | the learner, unprompted |
| Can a learner who is **struggling** find a way through? | the below-level learner |
| Do the product's **claims** survive contact with a grown-up? | the buyer, the guardian, the educator |

Every session therefore closes on the same question — **"would you open this again
tomorrow, and if not, why not"** — recorded in the persona's own words. A "no" whose
reason is not in the log is a failed sign-off, not a soft finding.

**Test in character.** The value of a persona is that it stops the tester using their own
knowledge of the product. If the tester catches themselves thinking *"well, obviously you
tap there"* — that is the finding, and it should be written down before it is rationalised
away.

---

## 2. The axes that generate the cast

Personas are not invented; they are sampled. Pick your product's real spread on each axis
and cover the extremes, because the middle takes care of itself.

| Axis | Why it changes the product's behaviour |
|---|---|
| **Ability vs the content** | below level / at level / above level. The app must be usable, honest and non-shaming at all three. |
| **Reading ability** | a learner who cannot read the *interface* is a different product from one who can. |
| **Language at home** | if nobody at home speaks the language of instruction, the app's audio/explanations are the only source of truth. |
| **Motivation** | chose this / was made to do this. Coerced learners find every escape hatch and every dark pattern. |
| **Continuity** | first run / returning after a lapse / long-term with a lot of history. Each exercises different code and different feelings. |
| **Access** | device class, screen size, input mode, shared device, connectivity, data cost. |
| **Accessibility** | assistive settings, motion sensitivity, low vision, motor precision, attention. |
| **Adult role** | buyer / guardian / educator. Different questions, different powers, different legal rights. |

A cast of 8–12 covering these extremes is enough for any learning product. Fewer than six
and you are not covering the spread; more than twelve and the sessions stop happening.

---

## 3. The learners

Each learner owns a set of checks nobody else will catch. The **owns** line is the reason
that persona exists — if you cut the persona, you cut those checks.

### L1 · The pre-reader
*Below the stated age floor. Cannot reliably read interface text. Taps pictures.*

The test of whether the **front door** is passable by someone who cannot read it. They tap
the biggest, brightest thing regardless of what it says.

**Owns:** first run on cleared storage · sign-up and onboarding · whether any step's only
affordance is a word · whether a required choice is refused kindly rather than dead-ending
· whether the privacy notice appears at the point of collection · navigation at the
smallest supported screen.
**Failure mode:** a screen whose only way forward is text.
**Rule:** never read the buttons aloud to them. If they can't find it, it isn't findable.

### L2 · The core learner
*Exactly the target age and level. The product was built for them.*

Their verdict is the release verdict. A "no" from L2 is a blocker, not a data point.

**Owns:** the main learning loop end to end · whether a task says what it wants before it
starts · whether the reward for doing it is legible · the primary input mode, exclusively
(if the product claims touch, they never touch a keyboard).
**Failure mode:** not knowing what the activity wants. They do not experiment for long.

### L3 · The struggling learner
*Below level for their age. Gets things wrong, repeatedly, on purpose.*

**The most important persona in a learning product and the one most often missing.** Every
other persona tests the success path. This one tests what failure feels like, and failure
is where learners leave.

**Owns:** what happens on a wrong answer, and on the fourth wrong answer in a row · whether
difficulty adapts down, and whether the adaptation is visible or silent · whether there is
a way to get help, skip, or see the answer without shame · whether the copy on failure is
encouraging without being dishonest · whether the product ever tells a child they are
behind · whether a "streak" or a goal ring punishes a bad day.
**Failure mode:** a wall with no door. Log any dead end here as **Blocker**, not Major —
a learner who cannot proceed has lost the product, not a feature.

### L4 · The advanced learner
*Above level. Already good. Reads everything and checks it.*

The test of whether the product has a **ceiling**. They will find the content error.

**Owns:** whether the hardest content is reachable and sufficient · whether advanced
material gates honestly (says it is locked and why, rather than hiding) · correctness of
every fact, definition, pronunciation, date or figure on their path · whether two
representations of the same thing agree with each other.
**Rule:** anything touching the correctness of taught content is **at least Major**,
whatever else the severity table says. A learning product that teaches something wrong has
done worse than fail — it has done harm and charged for it.

### L5 · The accessibility learner
*Runs with assistive settings on and the OS motion preference set to reduce.*

Half inventory, half test: the protocol should verify **present-vs-missing** and keep a
standing gap list rather than re-raising the same absences every cycle.

**Owns:** every assistive setting the product ships (text size, audio speed, read-aloud,
themes, contrast) actually working · visible keyboard focus and a sane tab order · input
target sizes · whether motion genuinely *stops* under reduced-motion rather than freezing
mid-animation · whether flags land on the document root so everything inherits them.
**Standing gap list:** log known-missing affordances every cycle without re-raising them as
new. Typical: dyslexia-friendly font, in-app high contrast, in-app reduced-motion toggle,
timer-off / calm mode, captioning of spoken content.

### L6 · The second-language learner
*Nobody at home speaks the language of instruction. Shared or low-end device, metered data.*

If the product's pitch is "every word is spoken" or "explained simply", this persona is the
only one who tests that claim under the conditions where it matters — because there is no
adult to fall back on.

**Owns:** whether recorded audio or explanation is sufficient *alone* · pronunciation
quality on unfamiliar names and loanwords · locale: currency, number grouping, date format,
name order · offline behaviour, and whether the app says what is unavailable rather than
silently failing · payload size on a metered connection · a shared device with more than
one learner profile.

### L7 · The returning learner
*Used it for a fortnight, stopped for a month, comes back.*

Nobody tests re-entry, and re-entry is where retention is actually won or lost.

**Owns:** whether the app remembers them · whether it opens on "here's where you were" or
on a guilt-trip about the broken streak · whether spaced review surfaces what they have
forgotten rather than restarting them or shoving them forward · whether a long-dormant
profile still loads (data migration across versions) · whether progress survived an app
update.

### L8 · The coerced learner
*Was made to use this. Actively looking for the way out.*

The adversarial persona. They will find the skip button, the way to farm the reward without
doing the work, and the thing that feels like a punishment.

**Owns:** whether any activity can be passed without learning (mash, guess, skip, wait out
a timer) · whether the reward economy can be gamed · whether anything shames or pressures
(streak loss, countdowns, "you're falling behind") · whether the product respects a decision
to stop.

---

## 4. The adults

### A1 · The configurer
*Sets it up, then wants it to be quiet. Does not use the product themselves.*

**Owns:** settings end to end, every control exercised twice (a toggle lights, a choice
cycles, neither errors) · account and profile management · adding and removing a learner ·
whether anything in settings can spend money · whether the safety gate actually holds.

### A2 · The reporter
*Wants to know whether it is working. Must be tested against weeks of seeded history —
an empty report proves nothing.*

**Owns:** whether reporting reflects real activity · **whether the report describes
learning or merely usage** (if the headline number is minutes-in-app, that is the finding)
· whether claims in the report are supported by what was actually measured · whether the
data shown matches the data the product says it collects.

### A3 · The buyer
*Has not paid yet.* The most commercially important untested path in most products.

**Owns:** price visible before commitment · what is free and what is not, stated honestly ·
the purchase flow completing, and failing gracefully on a declined card · no path from a
learner's screen to a payment form · no dark pattern in the cancel or downgrade path ·
whether the upgrade pitch is honest about what it adds.

### A4 · The rights-holder
*Exercises consent, export and deletion.*

Every product serving minors makes legal promises (COPPA, GDPR-K, DPDP and their
equivalents) and publishes them in a policy. Somebody has to check the promises are true.

**Owns:** what actually leaves the device, verified rather than assumed · consent being a
deliberate act, not a pre-ticked box · **withdrawal deleting what was uploaded, not merely
stopping further upload** · export producing something real · deleting a learner actually
deleting them · the privacy policy's claims matching the code's behaviour, clause by clause.
**Rule:** a policy claim the code does not honour is a **Blocker**.

### A5 · The educator *(only if the product is sold to institutions)*
*Runs a cohort of thirty, not a child of one.*

**Owns:** bulk enrolment · a class view that is usable at thirty rows · assigning work ·
whether per-learner data is visible to the right adults and no others · roster changes
mid-term · whether the product works on whatever the institution actually has.

---

## 5. Session shape

One persona, one device, one sitting. Fifteen to thirty minutes.

1. **State the persona out loud**, with device, input mode, locale and connectivity.
2. **Start from the right place** — L1 and L7 always start cold or from seeded history
   respectively; the rest may start seeded.
3. **Follow the persona's goal, not a script.** The **owns** lines are what the session
   must cover, not an order to click in. A persona wandering somewhere unplanned has found
   something.
4. **Narrate before you tap.** Say what you expect to happen. The gap between expectation
   and result is the finding, and it evaporates if you tap first and rationalise after.
5. **Log as you go.** A friction you plan to write up later is a friction you forget.
6. **Close on the question:** would you open this again tomorrow, and why not.

**Run the automated suite first.** A persona session spent hitting a bug the harness would
have caught is a wasted session, and wasted sessions are why the persona pass quietly stops
happening.

**Multi-session personas.** L3 and L7 cannot be judged in one sitting — learning and
re-entry are longitudinal. Give them at least three sessions across a week, seeded to
represent elapsed time.

---

## 6. Logging a finding

One row per finding. Severity per the protocol; the correctness rule in L4 overrides it
upward, never downward.

| # | Persona | Device / input / locale | Screen | What I expected | What happened | Severity | Repro | Status |
|---|---|---|---|---|---|---|---|---|

- **Device, input mode and locale are not optional.** "No keyboard support" and "breaks in
  ₹" are only ever caught because those columns are on every row.
- **Expectation before outcome.** A row with only the outcome is a bug report. A row with
  both is a design finding.
- **Repro in the persona's words**, not the developer's — "every bend", not "when
  `curve > 3`".
- **Friction is a finding.** Something that worked but took four tries is Minor; four
  Minors in one place is a Major nobody has written down yet.

### Three findings that are not bugs
Keep these out of the severity ladder — they change the product rather than fix it.

- **Confusion** — the persona did not know what the screen wanted. Log the screen and the
  sentence they said aloud.
- **Boredom** — they disengaged. Log where, and how far in.
- **"No" to tomorrow** — their reason, verbatim. The only finding that can fail a release
  on its own.

---

## 7. The checks that are specific to *learning* products

These cut across personas and are easy to omit because no persona complains about them
directly. Assign each to a named persona or they will not get tested.

- **Teaching vs testing.** Does the product ever *teach*, or only assess and score? (L3)
- **Retention.** Is anything resurfaced after a delay, or is it all first-exposure? (L7)
- **Honest progress.** Does the progress indicator track learning, or attendance? (A2)
- **Honest difficulty.** Does adaptation respond to evidence, or to time spent? (L3, L4)
- **Assessment separated from instruction.** Is the thing that decides mastery different
  from the thing that just taught it? (L4)
- **Transfer.** Is the learner ever asked to use the skill somewhere they were not taught
  it? Practice where you learned is practice; elsewhere is evidence. (L4)
- **No shame.** Does any surface tell a learner they are behind, or punish a missed day?
  (L3, L8)
- **Data minimisation.** Is the least possible collected about a minor, by construction
  rather than by policy? (A4)
- **Content correctness.** Sampled, every cycle, by someone who knows the subject. (L4)

---

## 8. Instantiation — Bizzing Bee

> **Provenance.** Six personas are **ESTABLISHED**: driven end to end by
> [`tests/ux-personas.cjs`](tests/ux-personas.cjs) at the exact viewports listed. Where
> this file and that file disagree, **the code wins** — it is the one that runs.
> **Liam** is named in `TESTING-PROTOCOL.md` §2.5 as the accessibility persona and was
> never written down; reconstructed here from what §7 checks.
> The remaining rows are **PROPOSED** — a starting point to accept, edit or cut. The
> protocol calls for 6 kids + 4 parents = 10 sessions; six exist, so until the proposals
> are settled that number is wrong.

| Role | Bizzing Bee | Device | Status |
|---|---|---|---|
| L1 pre-reader | **Maya · 6** | phone 390×844 | ESTABLISHED |
| L2 core learner | **Ahana · 9** | tablet 834×1112, touch only | ESTABLISHED |
| L3 struggling | — | — | **PROPOSED — the biggest gap** |
| L4 advanced | **Sofia · 15** | desktop 1280×900 | ESTABLISHED |
| L5 accessibility | **Liam · 10** | tablet | RECONSTRUCTED |
| L6 second-language | — | tablet, ₹ locale, offline | PROPOSED |
| L7 returning | — | any, seeded + dormant | PROPOSED |
| L8 coerced | **Ravi · 12** | desktop, keyboard then touch | ESTABLISHED (partial — he covers the Arcade, not the escape hatches) |
| A1 configurer | **Priya** | desktop | ESTABLISHED |
| A2 reporter | **Daniel** | desktop, 14 days seeded | ESTABLISHED |
| A3 buyer | — | desktop | PROPOSED |
| A4 rights-holder | — | desktop | PROPOSED |
| A5 educator | n/a | — | not sold to institutions |

**Product-specific notes for this cast**

- Ravi is the reason every game must have **both keyboard and touch** controls — a hard
  rule here, and a game failing it is Major. His September 2026 finding is the model of
  what L8 catches: *"the car drives itself, I don't have to take any action"* — the kart
  was drawn dead centre regardless of where it actually was.
- Ahana's verdict is the release verdict; the app was built for her.
- Sofia's correctness rule bites hardest here because the subject **is** correctness: a
  wrong spelling, pronunciation or definition is Major at minimum, Blocker if it is the
  target word.
- A4 is not hypothetical: `privacy.html` claims a parent can delete their child's data,
  and nobody has ever checked the claim end to end.
- **L3 is missing entirely**, and this is a spelling product — a child who cannot spell the
  word is its central case. Nothing currently tests the fourth wrong answer in a row.

---

## 9. Keeping this honest

- Where personas are encoded in a harness, **the harness is the authority**. If a name,
  viewport or journey changes there, change it here in the same commit.
- A PROPOSED persona is either promoted — written up properly, and automated if it can be —
  or deleted. It does not sit here for a year looking like policy.
- Review the cast against §2 once a release. A product that has grown a new axis (a new
  device class, a new market, an institutional tier) has grown a persona, and the cast
  should say so before the gap is found in the wild.
