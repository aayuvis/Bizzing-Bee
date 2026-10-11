# Review cycle 2, lens 3: fair play and continuity

**Script:** `circuit/script.json` (cycle 1 applied). **Scope:** the 122 on-screen paths in `review/changed-paths.json`, each read in context, plus the 11 `build` entries and the 6 `ownerQuestions`.
**Read against:**
- `review/r3-fairplay.md` (cycle 1), `review/applied.json`, BEE-CIRCUIT.md and AMENDMENTS.md;
- `mockbee.js`: BOTS, BANDS, the Pronouncer's Chair, the announcer's SAY pools, `botTurn`;
- `app3.js` `trickAnal`, `trail-data.js`, `trail-map-data.js`, `concepts-data.js`, and the word library.

**Verdicts:** `review/c2-r3-fairplay.json` has 141 rows: 122 paths, 11 `build:<id>` rows and 8 `season` rows.

**Validator:** `node spellbound-app/tools/circuit/validate.cjs` exits 0, with the same two author-facing warnings as before (both on `visitorsNote`). Every fix text below was applied to a scratch copy of the script, and the validator still exits 0 on it.

## Counts

| | pass | fix | fail |
|---|---|---|---|
| Changed on-screen paths (122) | 109 | 13 | 0 |
| Build entries (11) | 3 | 8 | 0 |
| Season rows (8) | 3 | 5 | 0 |

**Nothing fails.** Cycle 1's edits hold the mystery together:
- Ratchet's clearing card now rides Round VII's mail.
- The runner appears in all nine rounds.
- V.'s new Case 2 note is paid off on screen.
- Every cliff now quotes something that actually exists.

What is left is mostly in the joins between the script, the build and the app.

## Top concerns, in priority order

1. **Team Night can spoil the mystery before the accusation.** `teamNight.beats.sting` has Vale read the note and say "That isn't mine", which names her as V. Team Night opens "once Round IX is done", and the accusation opens "after Round IX's mail". So a child can play Team Night first and be told the answer before naming V.
   - **Fix:** hold `sting` and `stingAfter` until the accusation's closing letter. This is a story beat waiting on a story beat, which L2 allows. Added to `build:story-order`.
2. **Case 2's microphone item is printed in every hall.**
   - Mock Bee's announcer calls rivals "…to the microphone." It opens with "one microphone", and the game card says the same.
   - Round I's lesson example reads "Step up to the microphone".
   - That is the clue's own context ("a speller speaks into"). **Swap the item for megaphone:** it is in the library, appears nowhere in the script or in Mock Bee, and is first an Atlas stop in the Roots, after the Storm.
3. **Case 3's reveal contradicts the team's own screens.** "The grown-ups knew he was safe all along; only the team didn't." But Round V's cliff and the case's own safeLine both told the team he was safe. What the team didn't know was *where*.
4. **Round VIII's invitation no longer names Dax.** Round VII's cliff reads "The Finish Arch invitation: Dax's own round", and Round VIII's dax line says "His home hall". The validator only checks cliffs that contain a quoted string, so this slipped through. **Fix:** name him; he is seated in every band.
5. **Slots.**
   - The `{weak}` fallbacks ("You guess instead of asking", "You skip the suffix") fire only for children whose bee file shows no weak spot. That is exactly where the claim is false, and it makes Round IV's card ("So does the bee file") visibly untrue for them. Make the fallbacks advice instead.
   - `{missed}`, `{spelled}` and the postcards' `{w1}`–`{w3}` are printed lower case. 104 library words are capitalised (Wednesday, January, Thursday…), so the app would print "ask where wednesday came from". Print the library's own spelling instead.
6. **Outcomes the build still doesn't force:**
   - **Round VII:** which word is the unheard word. Case 4 fixes it as *triskaidekaphobia*.
   - **Round IX:** Dax and Pip being on their feet when the lights go out, which their microphone lines need.
   - Smaller ones are listed under `build:scripted-outcomes`.
7. **Case 2 can't be fully solved in the 6–7 band.** The heel-marks point at Dax only if the child knows he "rocks on his heels". At 6–7, Dax is not seated in Rounds I–IV, and no line names his tell before the case. **Fix:** each suspect card shows that suspect's tell.
8. **Team Night's re-call isn't in the rules.** `callRules` now says "one second try a night" on screen, so Dax's re-call in the drama reads as the team's second try, and then `levellingMiss` breaks the same rule. **Fix:** name the re-call as its own rule.

## The clue chain as a child meets it now

**Main path** is what every child receives with the hall mail; *(Case)* rows are optional. ✓ marks a beat that points at Vale.

| When | On screen | Points at | Notes |
|---|---|---|---|
| **Round I** · Meadow | The invitation calls letters signed V. a Circuit tradition, and says the Committee knows who writes them. The runner lays a programme on every chair and stands at the Pronouncer's elbow. **Card:** Note 1 was on your chair before the post came, and it quotes "Say it back." | Pronouncer / runner ✓ | Dax's postcard and cliff now hold on every path (story order). |
| **Round II** · Library | The runner refills the water. Framed programme: **"Vale Penrallow, aged 8, placed last"**, eight seasons back. V. note: `{weak}` + "the list will lie". | Vale ✓ | `{weak}` now comes from the bee file (fallback: see the slots fix). |
| *(Case 1)* | Taps: Sage's programme, a green feather, Theo's cards. Reveal: the runner fixes the list left-handed, slanting left; the Pronouncer signs upright. | runner ✓ | Round III's card repeats it on every path. |
| **Round III** · Forum | The runner hands out the late programmes. Violet pen. **Card:** the runner's hand slants left like every V. note; the Pronouncer's is upright; the violet pen. | runner ✓, clears Pronouncer | First strong pointer. The cliff's quote now exists in Round IV's invitation. |
| **Round IV** · Storm | The runner turns a page at the Pronouncer's elbow (new). Pip jumps at the thunder (new, every path). **Card:** V. knows your weak spot; the Pronouncer writes the bee file; the runner carries it. | Pronouncer / runner ✓ | True once `{weak}` names it. |
| *(Case 2)* | Taps: the empty case, Bolt's programme, Pip's bundled jumper. Escalation: heel-marks rocked back and forth. Reveal: the runner's key does nothing. Last chill: "The bell will ring on time. Not everyone wants it to. — V." | runner ✓ | Fair in 8–15. At 6–7 it needs Dax's tell on his suspect card. Microphone item: swap. |
| **Round V** · Roots | "The bell is back." The runner holds the door. **Card:** keys on the Committee's ring and on the runner's lanyard, unless the lock is broken. | runner ✓ (fair ambiguity) | |
| *(Case 3)* | Kwame's safety comes first. The runner pins up the ferry timetable. | runner (plain sight) | Reveal[2] fix. |
| **Round VI** · Strait | The runner moves the programmes (new). Vesper: "Pip is telling everyone I'm V. Not me." V.: "Next round, a word none of you has heard." | clears Vesper (weakly) | Vesper's letters must not slant left (build fix). |
| **Round VII** · Junkyard | The invitation announces the unheard word, after V. did. "Thank you, Vale." **Card:** V. knew first; only the Pronouncer and the runner see the sealed list; "Her name is Vale. She's sixteen." **Card 2 (new):** Ratchet misspells, and V. never does. | **Vale ✓✓**, clears Ratchet | A careful 10-year-old can name her here. |
| *(Case 4)* | Taps: the misprinted programme, the table, the empty stand. V. card folded at the page; the runner's log. | runner ✓ | Repeats card 2. |
| **Round VIII** · Sprints | The runner takes the tape down; a card in the slanting hand. Turn: Dax's stack of V. notes. **Card:** Dax cleared. | runner ✓, clears Dax | The invitation should name Dax (fix). |
| *(Case 5)* | The runner carries the envelope in and the new one out. The Pronouncer knows who V. is. | runner ✓ | Round IX's card carries it to every path. |
| **Round IX** · Stage | The runner carries in the new envelope (every path). Vesper: "The violet pen was mine." V.: **"who was there every single round?"** **Card:** "It isn't mine to tell." | clears Vesper and Pronouncer | Only the runner and the Pronouncer appear in all nine rounds (validator check 8), and the upright hand has already cleared him. |
| **Accusation** | Every look-again cites evidence that is on screen on the main path (Vesper's now cites the slant). | | Resolves by elimination at worst. |
| **Team Night** | The sting: Vale and the Pronouncer, "That isn't mine." | | Must wait for the accusation (top concern 1). |

**Clearings, now all on the main path:**
- Vesper: Rounds VI and IX, and her look-again.
- Ratchet: Round VII, card 2.
- Dax: Round VIII.
- The Pronouncer: Rounds III and IX.

**The red herring stays fair.** The Pronouncer never lies on screen, and nothing frames him. Every reason to suspect him is true: the initial, "Say it back", the ring key, the sealed list, the only dressing-room key.

## Every fix

### Lines (13)

| Path | Problem | Fix text |
|---|---|---|
| `rounds[1].pieces.drama` | "A second left" is more than the build forces ("time left"). A hall can show 9 s left. | Theo asks every question the Pronouncer's chair holds about one word, and spells it perfectly with seconds left on the clock. The speller two seats down falls asleep. |
| `rounds[7].pieces.inv` | No longer names Dax. Round VII's cliff and Round VIII's "His home hall" both depend on it. | The Finish Arch, where everyone starts fast and not everyone finishes that way. Seated: Dax, fastest in round one. The Committee notes that one speller has received a formal warning and will spell under observation. |
| `cases[1].escalation` | At 6–7 the child has never seen Dax's tell before this case. | Keep the line. The fix is in `build:case-scenes`: suspect cards show each suspect's tell. |
| `cases[1].puzzle.items[8].clue` | Microphone is printed on every hall screen, in the clue's own context. | a cone you shout through, so your voice carries to the far end of a field |
| `cases[1].puzzle.items[8].word` | As above. | megaphone |
| `cases[1].puzzle.items[8].greek` | Follows the swap. Source it in place of microphone (accuracy-reverify). | megas (great) + phone (sound) |
| `cases[2].reveal[2]` | The team was told he was safe (Round V's cliff, the safeLine). | Hazel nods. Kwame told her where he was going, and she told the Pronouncer the minute he left. The grown-ups knew where he was all along; only the team didn't. |
| `teamNight.beats.callRules` | "One second try" on screen makes Dax's re-call read as the team's second try, and `levellingMiss` then breaks the rule. | The Pronouncer, before the first word: 'Three more Team Bee rules. The first language I name is the call: French, from Latin, is a French word. A call may be changed until the speller says a letter. And each team has one second try at a spelling a night.' |
| `teamNight.beats.levellingMiss` | "You breathe out, ask everything" says what the child did. | One letter slips. Dax, from the bench: 'Breathe out. Second try. Ask anything you need.' This time it ends right, and the score is level. |
| `teamNight.beats.sting` | Names Vale as V., and can come before the accusation. | Keep the text. The fix is the ordering rule in `build:story-order`. |
| `hivePost.beeFileIntro` | "The one that beat you" asserts a miss that a winner's bee file doesn't have. | The bee file: the Pronouncer's scouting report, for you and anyone you show it to. Every word you spelled in this round and, if one beat you, why it did and the technique that would have caught it. Missed words go to your revision pile. |
| `slotLines.weak.byRound.2` | The fallback asserts a weakness to exactly the children whose bee file has none. | Ask before you spell. |
| `slotLines.weak.byRound.5` | As above. | Never skip the suffix. |

### Build entries (8 fix, 3 pass)

**`story-order` (fix).**
- Add: the sting and stingAfter wait for the accusation's closing letter.
- Add: a case opened after its next round's mail starts with one line naming its night, so its URGENT clock reads as then (cases never expire).

**`scripted-outcomes` (fix).**
- **Round 7:** name the word as *triskaidekaphobia*, the word Case 4 disputes, and show Suki's five chair requests. The library gives its origin as "English", which can be reconciled with Case 4's "every part is Greek" but sits oddly beside Mira's certainty.
- **Round 9, Dax and Pip:** both are standing at the blackout where they are seated, and Dax's next turn shows a definition request.
- **Round 9, other rivals:** their turns after the blackout show a request ("everyone's way"). Mock Bee's bots never ask, so the hall must add this.
- **Round 9, Vesper:** the announcer never reads her "does not ask for anything" tell again once she has asked. If she misses before the child, the child spells the championship word and finishes above either way.
- **Round 8:** the "cuts straight to the result card" behaviour needs a rule.

**`slots` (fix).**
- Print the library's own spelling and capitals, never lower case.
- `{weak}` fallbacks are advice, never a diagnosis.

**`no-placing` (fix).**
- Extend the rule from "a count, word or miss" to claimed actions as well.
- Three unchanged Round IX lines claim the child asked: the V. note ("You asked everything tonight"), Vesper's above ("You beat me by asking") and Vesper's below ("You asked everything all season"). Gate them on the chair log, or reword them. Suggested V. note: "Ask everything. Then ask one more: who was there every single round? — V."

**`case2-spelling-engine` (fix).** `cases[1].engineKey` still says `lore/origins`, and circuit-data.js is generated from the script. Point it at the spelling engine, or set it to null, and have the validator fail on `lore/origins`.

**`case-scenes` (fix).**
- Suspect cards show each suspect's tell.
- The reveal renders every secret its lines don't already state. Dax's "Not my problem", which Dax's apology quotes, reaches no screen today.
- Name Case 3's safeLine as the one deliberate early secret.
- No "Ask Kwame" in Case 3, since he is missing.

**`team-night` (fix).**
- A call may change before the first letter, for the child too.
- The second try is reserved for the levelling word, and simulated teammates never spend it.
- Its help comes from teammates at that band's lectern ("Ask Mira" is impossible at 11–15).

**`signoff-upright` (fix).**
- Vesper's letters are drawn not slanting left, because her look-again now depends on it.
- Dax's cards don't slant left either.
- The sting's pencil note is visibly unlike V.'s hand.

**Pass:**
- `hall-fields`: buildable, and the validator enforces it. Round IX's "every speller you have met will be in the hall" needs a visible audience at 6–7.
- `case-origins-authored`: covers the new items; megaphone is Greek in the library, so the swap adds no conflict.
- `clue-cards-ride-mail`: every card and clearing is on the main path.

### Season rows

**Pass:**
- Clue chain.
- Red herring.
- Other owner questions: keep Dax's board line; the sting must wait for the accusation; source megaphone.

**Fix:**
- **Continuity:** Case 3 reveal, Round VIII invitation, sting order.
- **Answers printed earlier:** microphone. The standard applied: a word the child studied on a stop or in a lesson is recall, not a leak (chorus, hyphen, physics, cylinder). Text the season prints in the clue's own context is a leak. Add Mock Bee's announcer pools and card text to `validate.cjs`'s "seen" set.
- **Slot lines.**
- **Build sufficiency** (the unforced outcomes above).
- **Round IX recommendation** (below).

## Slot lines, every value

| Line | Values checked | Result |
|---|---|---|
| Round II V. note `{weak}` | all 9 family clauses | Each reads as a sentence before "Tonight the list will lie to you." |
| Round V V. note `{weak}` | all 9 family clauses | Each reads between "Parts first, then the whole." and "And when a strong one breaks…". |
| Round V `{weak}` fallback | byRound default | Asserts a weakness (fix). |
| Round II above/below `{asked}` | 0 and any count | Reads true. |
| Round III above `{spelled}` | "still to come" fallback | Reads. |
| Round IV below `{missed}` | "a word" fallback | Reads. |
| Round VII below `{missed}` | "the hard one" fallback | Reads. |
| `{missed}`, `{spelled}`, `{w1}`–`{w3}` | capitalised library words | Misprinted lower case (build fix). |

`trickAnal` in `app3.js` has exactly the classes `slotLines.weak.byFamily` covers, plus `plain`, which falls back.

**Invitations:** each names only rivals seated in every band; Round IV names Vesper as not seated, on purpose. With the Round VIII fix, every invitation names its headliner. **No changed line assumes a placing.**

## Owner question `round9-unseated-lines`: recommendation

**Neither keep the decision as it stands nor seat the whole Circuit.** Instead:
- **Seat Dax in every band's final** (Round IX alsoSeated: `comet`). This adds one seat, and only in the 6–7 band.
- **Voice Theo's reply from "somewhere in the dark".** The invitation says every speller the child has met is in the hall, so the line is true whether he is seated or not.
- **Give Pip a line that needs no seat:** "Pip, in the dark: 'Good. Now nobody can see me jump.'" It pays off his Round IV fear of thunder.
- **Force Dax and Pip standing at the blackout** where they are seated, and **delete micLines.**

Why:
- **As decided, Dax's first question reaches only 11–15.** That question:
  - pays off V.'s note to him in the turn ("Ask one question. Just one.");
  - pays off Case 5's last chill ("I don't ask." "Neither did I.");
  - sets up Team Night's "asks the Pronouncer the language of origin".

  At 8–10 Dax is already seated; only Theo's reply keeps the line out.
- **Seating the whole Circuit costs too much.** It puts 10 rivals into a 6–7 bee that Mock Bee sizes at 4 (and 8–10 at 6), against the 8-minute cap those fields were sized for. Every extra seat is one more rival the hall must force out before Vesper, and a six-year-old watches roughly 2.5 times the turns.
- **The narrower change is cheap.** It costs one seat in one band, plus the forced survival these lines need anyway.

## What validate.cjs could add

- Mock Bee's SAY pools and card text in the "printed before the case" set. That would have caught microphone.
- A cliff that names "the X invitation" must find the round's headliner named in that invitation. That would have caught Round VIII.
- No `slotLines.weak.byRound` clause starts with "You ".
- `cases[1].engineKey !== 'lore/origins'`.
- Team Night's sting is ordered after the accusation (a story-order check in the §13 test 5 bot).
