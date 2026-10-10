# Bee Circuit Season 1: review lens 1, safety and tone

**Script:** `circuit/script.json` (DRAFT, overrides in AMENDMENTS.md, 10 Oct 2026)
**Rows:** `r1-safety.json`, one row for every on-screen line.
**Read against:** BEE-CIRCUIT.md §0–§2, §4, §5 and §12.1 (L3, L4, L8, L9) · AMENDMENTS.md 1–5 · `spellbound-app/CLAUDE.md`'s child-screen rules · Bizzing India `docs/05-editorial-policy.md` §1–§2.

## Counts

| verdict | rows |
|---|---|
| pass | 434 |
| fix | 13 |
| fail | 0 |
| **total** | **447** |

**What counts as on screen here:**
- `fiction` and `signoffs.inv`
- every cast `tell` (as Mock Bee shows it)
- every round's `technique`
- every string under `rounds[].pieces`, including the `pipWord`, `beeFileFakeTip` and `clue.text` fields
- the whole of `turn`
- every case's title, place, clock, impossible, safeLine, suspect secrets, false solution, escalation, puzzle text and items, accusation choices, look-again, reveal, clue and last chill
- Team Night's challenge, beats, call labels and the Ravenmere roster's tells and specialities
- the accusation
- the Hive Post
- all 26 visitor cards

Author-facing fields were not given rows: every `*Note`, `role`, `theme`, `engine`, `planted`, `clueOnScreen`, `opens`, `rules`, `season2Seeds`, `suspectBoard`, `fairPlay` and `changes`.

**L8 holds.** The longest on-screen line is 58 words (`rounds[0].pieces.inv`). Every fix_text is 60 words or fewer.

**L3 and L9 hold.** There is no magic and no world to save, and the fiction label is present.

**Nothing on a child's screen breaks these rules:**
- no streaks
- no paywall copy
- no "ask a grown-up"
- no random reward
- no frown
- no engagement bait

The cliffhangers ask nothing of the child and set no timer.

## Overall

The script is in good shape for this lens, and the owner's amendments did their work:
- **V. is safe in the present day.** The children are told in the first invitation that the Committee knows who writes the letters. The Pronouncer says it again on every path in Round IX. The reveal says it a third time.
- **Kwame is safe.** "The Pronouncer says he's safe" is in the Round V cliff, before the case opens.
- **No adult asks a child to keep a secret.** The only secrets are a teen's, kept by adults (the Pronouncer keeps Vale's name, Hazel keeps Kwame's destination), and two between peers (Ines's coaching, Mei's note).
- **Every Dax wrong is answered on screen within L4:**
  - Nova and Mira correct his tips on the spot.
  - Theo's calm public question goes unanswered.
  - His gloat at Kwame gets no laugh and a turned back.
  - The Pronouncer gives him a quiet first warning.
  - The Committee reads a formal warning aloud.
  - He ends up alone on the dock and at the Arch.
- **Mocking never works:** nobody laughs, listeners stop listening, he loses the round.
- **The reform is earned** over four steps (the turn, Case 5, his first question, the captaincy). Theo and Suki state his record to his face first.
- **The visitor cards are respectful and historical.** They state uncertainty plainly and never use "myth" to mean "false".

The 13 fixes are small. Three of them matter most:
1. **`teamNight.beats.stingAfter`**: the safety net under the one beat that brings back a writer no adult knows.
2. **`accusation.closingLetter`**: the same pattern, in Vale's backstory.
3. **`cases[2].safeLine` and `cases[2].reveal[2]`**: Kwame tells a grown-up himself before he leaves.

## Every fix, with the reason

### 1. `teamNight.beats.stingAfter` (highest priority)

**Problem.** The sting brings back exactly what amendment 1 removed: a note-writer whom no adult knows reaches a child. The Pronouncer's surprise tells the child that no grown-up knows who it is. He is present and says "together, and in the open", which is right. One sentence more makes the safe behaviour explicit without touching the hook.

**Replacement:**
> The Pronouncer, quietly: 'Then next season we find out who. Together, and in the open. Any note you ever get, you can show me.'

### 2. `accusation.closingLetter`

**Problem.** This is the line a child is most likely to take as the model. As written, an unidentified writer sends notes to an 8-year-old after every round, and no adult appears anywhere in that story. The pattern survives in the backstory. One clause puts the adults back in the frame and keeps "I never found out who".

**Replacement:**
> I placed last, my first season. Somebody wrote to me after every round, a Circuit tradition even then, and I never found out who. When I became the runner, I asked to keep it going, and the Committee said yes. Every season I write to whoever is new, and to whoever needs it. You and Dax, this year. — Vale

**For lens 3:** check this against the Season 2 seed "The Pronouncer doesn't know either". A tradition the Committee of eight seasons ago knew about does not have to mean this Pronouncer knows the second hand.

### 3. `cases[2].safeLine` and 4. `cases[2].reveal[2]`

**Problem.** A distressed 14-year-old walks out, leaves his bag, and takes a ferry across water without telling any grown-up. As written, the adults know only because Hazel happened to see him go. The fixes make telling a grown-up Kwame's own act. All plot facts are kept: Hazel told the Pronouncer at once, the grown-ups knew he was safe, and the team doesn't know where. This **refines amendment 2's wording** (see the owner items).

**`safeLine` replacement:**
> He's safe. Kwame told Hazel where he was going on his way out, and she told the Pronouncer at once, so the grown-ups know. What nobody will tell you is where.

**`reveal[2]` replacement:**
> Hazel nods. Kwame told her where he was going, and she told the Pronouncer the minute he left. The grown-ups knew he was safe all along; only the team didn't.

### 5. `teamNight.beats.drama.8-10` and 6. `teamNight.beats.drama.11-15`

**Problem.** "Arjun smirks" sneers at a teammate's wrong call in front of them. That is the mocking-a-miss L4 bars for Dax, and §12 wants Ravenmere condescending, never cruel. It also gives the team's only sneer to the one Indian-named Ravenmere speller, whose own Season 2 seed is that he respects the Circuit. For a diaspora-heavy audience that reads badly. The fix swaps it for **"Sloane raises an eyebrow."** That fits her "never smiles" tell and her condescension. Everything else in the beat is unchanged.

### 7. `cases[4].puzzle.items[2]` (the `why` field only) and 8. `cases[4].reveal[2]`

**Problem 1.** A frightened 15-year-old's brave face ("perfectly confidant") is called a "lie" in the same breath as an adult's cover-up. Anxious readers learn that hiding nerves is lying.

**Problem 2.** Dash, an adult host, tells two lies to cover his own mistake and never owns it on screen. Every other adult with a secret admits it or is put right: Bolt admits it, the printer gets glasses, Sage is forgiven. The fix has Dash own up.

**`why` replacement:**
> A confidant is a trusted friend. She means confident, and she isn't: she's nervous, and that's allowed. It's the only untrue thing she says, and it's about her nerves.

**`reveal[2]` replacement:**
> Vesper's only untrue line was about her nerves, and being nervous is allowed. Dash's were about the door, and he owns up: he went in for his stopwatch and forgot to lock it.

### 9. `rounds[4].pieces.pip`

**Problem.** This mail lands right after Kwame's public miss and walk-out. A joke that he is unflappable reads as irony at his lowest moment. It also breaks the round's own orderNote: the laugh comes before the crack, never after. The fix keeps the word and the turnip and makes the note loyal.

**Replacement:**
> Kwame is imperturbable, which means he can't be turned into a turnip. (I wrote this before the round. I'm sending it anyway. I still think so.) — Pip

### 10. `rounds[3].pieces.below`

**Problem.** "Phantom with an f!" is an exclamation at the child's own miss, which a below letter must never be. It also presumes which word the child missed.

**Replacement:**
> Phantom starts with ph, not f. Ask where a word came from and it tells you its rules: Greek words travel with their luggage. — Mira

### 11. `cases[1].reveal[3]`

**Problem.** Pip (8) takes the Committee's bell out of its case and causes the panic. The scene rewards him with ringing it and nobody mentions asking first: a behaviour a child could copy. The fix keeps the kindness and adds owning up.

**Replacement:**
> Pip says sorry for taking it without asking. The round starts on time, and the Pronouncer lets him ring the bell.

### 12. `cases[3].reveal[5]`

**Problem.** "Nobody chases him" can read as children physically chasing a boy, or as a hint that they used to. The meaning is that nobody follows him out.

**Replacement:**
> The Committee reads Dax a formal warning, aloud, at the gate. Suki's round stands. Dax leaves first, as always. This time nobody follows him out.

### 13. `visitors[5].card` (Tantalus; minor)

**Problem.** This is the only card that says "In Greek myth". The fix opens it like the others ("To the ancient Greeks, Tantalus was…"), keeping the house voice of amendment 4 and docs/05. The facts are unchanged.

## Weighed and passed (so the owner sees the reasoning)

- **`rounds[4].pieces.inv` names Dax's first warning in a circulated invitation**, although Case 2 had the Pronouncer say it "quietly". Passed: a public, unadorned consequence is the L4 design (the formal warning is read aloud by design). The line carries no adjective or mockery.
- **`turn.kwame`, "You said it. You were right."** It comes before Dax apologises, and an 8-year-old could read it as approving the gloat. Passed: it is the owner's verbatim line, and it means "nobody's perfect". Dax calls the gloat "wrong" two beats later, and Kwame's reply restates it as "what a team is for". Lens 3 may want to check the order.
- **`cases[4].falseSolution`, "The hall turns on her."** This is group blame on a 15-year-old. Passed: it is the story's false solution, it is corrected on screen, and Vesper closes the case with thanks.
- **`cases[0].suspects[0]`, the printer hiding that he needs glasses.** This could imply glasses are something to hide. Passed: it is a kind secret, and the reveal fixes it warmly ("The printer gets glasses").
- **`cases[2].impossible`, the empty room and the bag on the bed.** This passes only because the safeLine is shown first, before anything else. **Make that order a build test.**
- **`teamNight.beats.mei`, "Don't tell Sloane I said so."** A confidence between two children, not a secret kept from a grown-up.
- **`visitors[7]`, Psyche "won the love of Cupid".** The script's only romance. It is passing and non-physical, and fine for 8–15.
- **`visitors[4]` (Pan) and `visitors[10]` (Mars).** The goat legs, "blamed on him" and "god of war" are factual and historically framed. Amendment 5 concerns idioms, not etymology.

## For the owner

1. **Kwame tells a grown-up himself (fixes 3 and 4).** These refine amendment 2's wording from "Hazel saw Kwame leave" to "Kwame told Hazel where he was going". Every plot fact is kept, but it is your amendment, so please confirm. Without it the case still works: the adults know, but only because Hazel happened to see him leave.
2. **The sting stays your decision (amendment 1), with a condition for Season 2.** The Pronouncer's surprise means a writer no adult knows is reaching children again. Please accept the stingAfter fix (fix 1). Brief Season 2 so that the second hand resolves to someone the adults can know and approve, for example a child like Mei writing with the Committee's knowledge. **It should never resolve to an unknown adult.** The Season 2 seed's "someone not yet met" should be held to that.
3. **Ravenmere's make-up.** Two of the five antagonist-camp spellers carry Indian and Chinese names (Arjun, Mei). With the smirk moved to Sloane (fixes 5 and 6), Arjun's on-screen beats are skill only, and Mei is the kindest voice on the team. Please confirm the camp reads as you intend for the family's diaspora audience. The script itself says nothing about anyone's nationality, money or class, which is right.
4. **Norse gods as Stop Visitors.** Norse religion has practitioners today, which sits close to D9. You settled this in amendment 4, and the cards keep to it: historical framing, never calling the gods false. Recorded here so the three-round review has it on file.
5. **Outside this script, but on the same screens:**
   - **Dax's Suspect Board `why`.** If `suspectBoard.portraits[].why` renders, Dax's reads "He's the villain". That labels an 11-year-old a villain on the child's screen in an arc about reform. "He's been playing dirty" says the same thing.
   - **Mock Bee faces.** The shared cast's face ids pair Suki with `panda`/`neko` and Kwame with `samurai`/`ninja` (mockbee.js BOTS). Before the Circuit puts names and faces side by side all season, check that no face reads as an ethnic shorthand for the name.
6. **For lens 3 (fair play, not safety).**
   - **What V. knew.** `cases[3].reveal[2]` says "V. had seen the word before anyone". That sits uneasily with the list being sealed in front of two people. It also clashes with Case 5's rule that anyone seeing the word voids a round.
   - **The early hint.** Round VI's V. note hints at a property of a sealed list to competitors, before the Committee announces it. The accusation says Vale "never let one word slip", which holds only if that hint is judged harmless.
