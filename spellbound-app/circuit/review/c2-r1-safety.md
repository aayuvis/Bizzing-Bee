# Bee Circuit Season 1: review lens 1 (safety and tone), cycle 2

**What was reviewed:** the 122 on-screen paths listed in `review/changed-paths.json`. Each was read in context in `circuit/script.json`, and old and new text were compared against commit `446920bcc`. The review also read the script's new `build`, `ownerQuestions` and `slotLines`.

**Reviewed against:**
- BEE-CIRCUIT.md §0–§5 (L4 in particular)
- AMENDMENTS.md 1–5
- the rules for a child's screen in `spellbound-app/CLAUDE.md`
- Bizzing India `docs/05-editorial-policy.md` §1–§2

**Rows:** `c2-r1-safety.json`.

## Counts

| verdict | rows |
|---|---|
| pass | 117 |
| fix | 5 |
| fail | 0 |
| **total** | **122** |

Every fix_text is 60 words or fewer; the longest is 58. No changed line breaks the rules for a child's screen:
- no streaks, paywall copy, "ask a grown-up", random reward, frown or engagement bait;
- no violence or weapon idioms;
- no joke about anyone's body or illness.

## The cycle-1 safety fixes: all 13 survived

| # | path | how it was handled | state now |
|---|---|---|---|
| 1 | `teamNight.beats.stingAfter` | applied | word for word. Refined again below (fix 4). |
| 2 | `accusation.closingLetter` | applied | word for word, 60 words |
| 3 | `cases[2].safeLine` | applied | word for word. `suspects[2].secret` and `cast.hazel.role` now agree with it. |
| 4 | `cases[2].reveal[2]` | applied | word for word |
| 5 | `teamNight.beats.drama.8-10` | merged | "Sloane raises an eyebrow" kept inside lens 3's "Dax takes one call himself" |
| 6 | `teamNight.beats.drama.11-15` | merged | as above |
| 7 | `cases[4].puzzle.items[2].why` | applied | word for word |
| 8 | `cases[4].reveal[2]` | applied | word for word. Dash owns up. |
| 9 | `rounds[4].pieces.pip` | merged | loyal coda word for word. The word is now *unflappable*. |
| 10 | `rounds[3].pieces.below` | merged | no exclamation and no presumed word: `{missed}` plus "Next time". |
| 11 | `cases[1].reveal[3]` | applied | word for word |
| 12 | `cases[3].reveal[5]` | applied | word for word |
| 13 | `visitors[5].card` | merged | opens "To the ancient Greeks" |

The conditions attached in cycle 1 also held:
- **The safeLine order** is now `build[id=case-scenes]`, a test proved by breaking.
- **Dax's Suspect Board line** no longer reads "the villain".
- **The Season 2 condition** is recorded in `teamNight.season2Seeds[1]`.

Several changes from the other lenses improve safety as a side effect:
- **Round V's invitation** no longer names Dax's warning.
- **Ines's below letter** is warmer: "The quiet letters beat you" became "Listen for the quiet letters next time".
- **Suki's below letter** is warmer too: "You held your breath on the hard one" became "You'll spell {missed} next time".
- **`levellingMiss`** has the reformed Dax steady the child after a miss. This is the best tone line in the cycle.

## The five fixes, in priority order

### 1. `slotLines.weak.byRound.2`: a false rebuke

**Problem.** Under `build[id=slots]`, the fallback prints only in two cases:
- the child has no miss yet, or
- every miss was "plain", which means the child asked the Pronouncer's Chair on it, since an unasked miss counts as `noask`.

So "You guess instead of asking." reaches exactly the children who asked. Every child who gets it is told off for the one thing they did right.

**Replacement:** `No weak spot yet. Ask anyway.`

Rendered: *"No weak spot yet. Ask anyway. Tonight the list will lie to you. Read it twice. — V."*

### 2. `slotLines.weak.byRound.5`: unearned criticism

**Problem.** This is the same fault, milder. A child with no weak spot is told "You skip the suffix." with no evidence for it.

**Replacement:** `No weak spot yet. Never skip the suffix.`

Rendered: *"Parts first, then the whole. No weak spot yet. Never skip the suffix. And when a strong one breaks, the loud one gets louder. Watch. — V."*

**For lens 3:** Round IV's card says "V. always knows your weak spot". It stays true, because V. knows there is none yet.

**For the build:** rank only the named families when choosing `{weak}`. A child with more plain misses than `noask` ones should still be told about the `noask` habit.

**Add to the slots test:**
- a child with no misses gets a line that claims no weak spot;
- a child who asked on every miss never gets "guess instead of asking".

### 3. `teamNight.beats.sting`: not in an empty hall

**Problem.** Lens 3's timing fix changed "Back at the Grand Marquee" to "Later, in the **empty** Grand Marquee". That puts the child alone at night with an adult man and a 16-year-old at the moment a note from an unknown writer arrives. Amendment 1 exists to keep that grooming shape off a child's screen.

**The fix** puts other grown-ups in the room and keeps the timing fix:
- The Pronouncer is still beside the child, so he cannot be the writer.
- Nobody who might be the second hand is placed inside: Mei and Vesper stay open as suspects.

**Replacement (58 words):**
> Later, while the Committee clears the Grand Marquee, Vale and the Pronouncer are stacking chairs beside you when one more note slides under the door. A different hand, small and careful, in pencil: 'There were always two of us. — V.' Vale reads it twice. 'That isn't mine.' For the first time all season, the Pronouncer looks surprised.

### 4. `teamNight.beats.stingAfter`: widen the circle (a refinement of my own cycle-1 fix)

**Problem.** The line survived as I wrote it. On a second read, it makes one man the child's only channel for notes from an unknown writer, and he is the very adult amendment 1 was written about. Safeguarding practice names any trusted adult. "Any grown-up you trust" assumes no family shape, and it does not trip the T3 check (`/ask a grown-up/i`).

**Replacement:**
> The Pronouncer, quietly: 'Then next season we find out who. Together, and in the open. Any note you ever get, you can show me, or any grown-up you trust.'

### 5. `cases[0].taps[0]`: the parrot joke (minor; new to this lens)

**Problem.** "A typesetter who learned English from a parrot" laughs at how a person learned English. Cycle 1 passed this as `rounds[1].pieces.prog`. Seen a second time, as a tap in the case scene, it reads as a joke about English learned as an additional language. Many of this family's diaspora grandparents learned English that way. The plot only needs the parrot at the press, and the perch and feather tap already plants it.

**Replacement:**
> Sage's programme, still on the desk: 'Our press is run by a typesetter and a parrot. We are not sure which is in charge.'

**Keep the two lines matched.** `rounds[1].pieces.prog` is not on the changed list. It must change to match, or the tap misquotes it. That would make it: *"We admire Theo's curiosity. We have ordered more chairs. Our press is run by a typesetter and a parrot. We are not sure which is in charge. — Sage"*. Lens 3 should confirm that the plant is still fair.

This is the lowest priority of the five. The owner may reasonably keep the original.

## Weighed and passed

- **`turn.kwame`** ("I heard what you said in the corridor. You were right."). This has the same order risk as in cycle 1: a young reader could take it as approving the gloat. It passes because Dax calls it "wrong" two beats later, and Kwame narrows it to "You were right about one thing."
- **`rounds[1].pieces.below` with a high `{asked}`.** "Next time, ask before you spell" slightly overlooks a child who asked a lot and still went out. That is dismissive at worst, never shaming. Optional rewording: "Keep asking before every word: …".
- **`rounds[2].pieces.above` and `hivePost.diary[4]`** ("Draw … small on your palm"). A 6–7-year-old may reach for a pen. Finger-tracing is allowed at real bees; ink on a hand is not. Rafi's tell says "traces", which would be clearer. This is optional.
- **`rounds[3].pieces.drama`** (Pip, 8, jumping at thunder). His fear is shown, not mocked. Nobody on screen laughs, and Case 2 treats it kindly.
- **`rounds[5].pieces.suspense`** (Vesper says Pip started the idea that she is V.). Pip's rumour accuses no one of wrongdoing, so it is not a Dax-style rumour under L4.
- **`cases[2].taps[0]`** ("I'm going to the Far Shore to fix…") **and `taps[1]`** (the bag on the bed). Read alone, a distressed 14-year-old leaving like this could be alarming. Both pass only because the safeLine is on screen first. Keep `build[id=case-scenes]`.
- **`cases[1].lastChill`.** The note hints that V. knew someone wanted a delay. The wrong is minor and is answered on screen, and the adults approve the letters.
- **All nine `slotLines.weak.byFamily` clauses.** Each names a habit, not a trait, and each is true whenever it prints. They are brisk but not cruel, which is V.'s voice as the brief describes it.
- **The visitor cards** (Atlas, Tantalus, Hypnos, Vulcan, Frigg). All are framed historically, with no comedy and no "myth" meaning "false". Frigg states scholarly debate plainly, as docs/05 asks.

**Residue outside the changed paths.** These are not rows; they are left for whoever edits next.
- `cases[4].puzzle.brief` still says "Every statement with a wrong ending is a lie". The `why` now softens that for Vesper.
- The `changes` entry for Case 5 still says "Vesper's only lie" and "dependible". It is author-facing and never rendered.

## Views on the owner questions (safety and respect)

**`ravenmere-names`: acceptable for Season 1 as written now.**
- Arjun's beats are skill only, and Mei is the kindest voice in the camp. The condescension sits with Sloane, and the camp loses graciously.
- One thing to weigh. Arjun is the only Indian name in the season, and he is on the rival academy's side. The child's own Circuit has none, and its ten are fixed.
- For Season 2, brief two things:
  - Neither Arjun nor Mei is ever the means by which Ravenmere is unkind. Arjun's seed ("respects the Circuit and won't say so") should pay off warmly.
  - Any new Circuit speller is a chance to reflect the diaspora on the child's own side.

**`suspect-board-dax`: keep.** "He's set on beating you" describes behaviour, not his worth, which is right for an 11-year-old in a reform arc. "V. knows things" is a weak reason for suspicion, but it is not a safety issue.

**`mockbee-faces`: yes, re-face Suki.**
- Panda Sensei and Lucky Neko on the one East-Asian-coded name is the textbook pairing to avoid. The Circuit shows it beside her name all season.
- Kwame's Samurai and Shadow Ninja are not shorthand for an Akan name. Moving him out of the Dojo pack is still tidy, but it is lower priority.
- One fact the question missed: Nova wears **Koi**, which is also from the Dojo pack (`mockbee.js` BOTS). So the Dojo pack is not only where non-white names sit. That makes Suki's pairing the real issue.
- Faces are part of Mock Bee's shared cast, whose facts the brief says never change. Re-facing therefore reaches beyond the Circuit and is the owner's call.

**`second-hand`: support, with two conditions.**
- Apply fixes 3 and 4: no empty hall, and the Pronouncer points the child to any trusted grown-up.
- Hold Season 2 to the recorded condition: the second hand resolves to someone the adults can know and approve, never an unknown adult.
- Add one more condition: the resolution never asks the child to keep the notes from their own grown-ups. Mei's "Don't tell Sloane" is fine, because it is a confidence between peers. "Don't tell anyone" would not be.

**`round9-unseated-lines`: no safety objection either way.** L4 requires Dax's reform to be earned on screen, and in every band it still is without the Round IX question:
- the turn and the apologies (Round VIII; Dax is a headliner, so he is always seated);
- Case 5;
- the captaincy debate on Team Night.

If the owner wants the beat in every band, write a variant that needs only Dax rather than seating rivals who aren't there. At 8–10 Dax is seated but Theo is not.

**`accuracy-reverify`:** this is not a safety question. When the visitor cards are re-checked, keep the respect checks for the Norse cards alongside the fact checks.
