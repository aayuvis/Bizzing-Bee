# Review round 3: fair play and continuity

**Script:** `circuit/script.json` (status: DRAFT). **Lens:** fair play and continuity (BEE-CIRCUIT.md §12.3). The other two lenses were not read.
**Read against:** BEE-CIRCUIT.md (laws §2, tests §13, threads §5, rounds §6, cases §7, Team Night §8), AMENDMENTS.md, `mockbee.js` (the cast, the bands, the Pronouncer's Chair), `trail-data.js` (region order) and `tools/circuit/validate.cjs`. The validator exits 0 with 2 warnings, and both warnings are on `visitorsNote`, which is author-facing.
**Verdicts:** `review/r3-fairplay.json` has one row per on-screen line (430), plus 15 rows with path `season`.

## Counts

| | pass | fix | fail |
|---|---|---|---|
| On-screen lines (430) | 373 | 57 | 0 |
| Season rows (15) | 8 | 7 | 0 |

Line counts include the rows that pass but depend on a build fix. Those reasons point to the season row on scripted hall outcomes: Rounds I, III, V, VI, VII, VIII and IX drama; Round IX's invitation, laugh, dax line and below letter; Round III's cliff, which depends on Round IV's invitation fix.

**Nothing fails.** The mystery is fair, and every problem below can be fixed with a line or a build rule.

## Verdict in one paragraph

**The mystery is fair.** A careful 10-year-old who reads every on-screen line can name Vale before the accusation, using only cards that arrive with the hall mail on every path. A strong hunch is possible at Round III; it is certain at Round VII. The red herring is fair: the Pronouncer never lies on screen, nothing frames him, and the upright hand and "It isn't mine to tell" clear him on every path. Ages and timeline add up: 8 + eight seasons = 16; she has been runner for three seasons; Vesper is 15 and was champion last year. Kwame's safety is told in the same line that empties his room. The adults are openly involved from the first invitation. Dax's arc is sound: every wrong has an on-screen consequence that reaches every path, and the reform is earned across five beats.

The problems are in the joins: between the script and how Mock Bee actually runs, between the rounds' order and the Atlas, and inside Case 2's puzzle.

## Top concerns (in priority order)

1. **Scripted hall outcomes against a seeded Mock Bee** (season row). The drama lines state what rivals do: Pip sits down in round two, Kwame misses *reconnaissance*, Suki gets the unheard word first, Dax fades, and Vesper outlasts everyone else in the final. Mock Bee will not produce any of these unless the hall forces them. The fields also clash with the lines:
   - The 11–15 field seats Vesper in Rounds I–VIII, but her chair is empty all season.
   - Round IX's lines put Dax, Theo and Pip at the microphone, and every band's field lacks at least one of them.
   - The 6–7 field has no Dax, yet Round V's invitation says "Dax spells today".

   The hall runner needs a per-round script for the word, the miss, who survives and who is seated. This is the biggest build item the script implies, and nothing in the brief or the validator covers it.
2. **Story order** (season row). A hall opens on reaching its leg 4, and halls are optional (L2), so a child can get Round N's invitation, or play its hall, before playing Round N−1. That breaks:
   - Round VI's note arriving before Round VII's announcement (owner decision b, and the Round VII card's claim);
   - two cliffs;
   - Round I's "a venue you haven't reached".

   Fix: hold each invitation and hall until the previous hall's mail is delivered. That is a hall waiting on a hall, not a stop, region, game or word, so L2 still holds.
3. **Case 2 is the one broken puzzle.** It has four item faults:
   - *rhythm* is spelled R-H-Y-T-H-M in Round IV's bee file, just before the case asks for it;
   - "a group singing together" is also *choir*;
   - *echo* and *psychology* are printed with these same definitions on the Storm visitor cards;
   - the brief promises ph/ch/y, which *onomatopoeia* doesn't use.

   Around the puzzle: the clock puts Kwame's Root Throne round 30 minutes from the Eye of the Storm. The last chill's V. prediction ("the bell will ring twice tonight") is the only one in the season that never comes true. That last chill also contradicts the case's own reveal ("if the lock never worked" after "The lock never worked. Bolt admits it."). And the engine is a pick-the-language quiz while the puzzle asks for spelling.
4. **Ratchet's clearing card is delivered only in Case 4**, against the authors' own rule that clue cards ride the hall mail (test 5). Fix: a version built only from Round VII's on-screen misprints, sent with Round VII's mail.
5. **Two cliffs quote invitations that don't say what they quote.**
   - Round III's cliff says the Storm invitation names Vesper as "already qualified"; Round IV's invitation doesn't.
   - Round VI's cliff says the Junkyard invitation shows the Circuit table; Round VII's invitation doesn't.
6. **Lines that state what the child did**, which the app doesn't know:
   - "You asked three questions", "You asked one question", "You asked for the origin twice";
   - "You beat me on circumference", "Phantom with an f!";
   - "The quiet letters beat you", "You held your breath";
   - V.'s "You guess instead of asking" and "You skip the suffix".

   The last two matter most, because Round IV's card tells the child "V. always knows your weak spot". Brief §5B fills that weakness from the bee file. The script hard-codes it. Add a `{weak}` slot.
7. **Team Night needs four changes.**
   - Plant the roster rule (the tiebreaker may go to anyone) before the match, not at the moment it is used.
   - Make the scripted wrong call Dax's own, because the child is the caller.
   - Add a line for missing the levelling word.
   - Set one grading rule for origins that name two languages ("Latin, from Greek"), since Rafi and Mira share the 8–10 lectern.
8. **The runner is invisible in Rounds IV and VI**, but Round IX's V. note asks "who was there every single round?". One plain-sight beat in each round fixes it.

## The clue chain, as a child meets it

**Main path** is what every child gets with the hall mail. *(Case)* marks a beat inside an optional Surprise Stop. A ✓ means the beat points at Vale.

| When | What the child sees | Points at | Notes |
|---|---|---|---|
| **Round I** · Meadow | Invitation: letters signed V. are a Circuit tradition; the Committee knows who writes them. The runner stands at the Pronouncer's elbow (laugh) and lays a programme on every chair (suspense). V.: "Say it back…". **Card:** Note 1 was on your chair; it quotes the Pronouncer. Board: five portraits. | Pronouncer / runner ✓ | Fair two-way start. The board's "why" lines for Vesper, Ratchet and the runner name things from later rounds (fixes). |
| **Round II** · Library | Runner refills the water (laugh). Framed programme: **"Vale Penrallow, aged 8, placed last"**, eight seasons back. V.: "the list will lie". **Card:** "Another V." | Vale ✓ | The name the child will need later. |
| *(Case 1)* | The runner fixes the last line **left-handed, slanting left**; the Pronouncer signs upright. A V. note on the press. | runner ✓ | Repeated on every path by Round III's card. |
| **Round III** · Forum | Runner hands out the late programmes (laugh). Violet pen on your chair (Vesper). **Card:** the runner's left hand slants like every V. note; the Pronouncer's is upright; the violet pen. | runner ✓, clears Pronouncer | **First strong pointer.** Cliff: the RESERVED chair is Vesper's (needs Round IV's invitation fix). |
| **Round IV** · Storm | **Card:** V. knows your weak spot, and so does the bee file. The Pronouncer writes it; the runner carries it. | Pronouncer / runner ✓ | The runner is absent from the round's lines (fix: laugh). The card relies on V.'s notes really naming the weak spot (`{weak}` slot). |
| *(Case 2)* | The runner's key turns and does nothing. A V. note inside the bell case. | runner ✓ | Round V's card carries the keys to every path. |
| **Round V** · Roots | The runner holds the door for Kwame. **Card:** two keys open the case, one on the Committee's ring and one on the runner's lanyard, unless the lock is broken. | runner ✓ (fair ambiguity) | |
| *(Case 3)* | The runner pins up the ferry timetable. | runner (plain sight) | |
| **Round VI** · Strait | Vesper: "Not me. I don't write notes." V.: **"Next round, a word none of you has heard. Its parts have."** **Card:** is Vesper telling the truth? | clears Vesper (weakly) | The runner is absent (fix: laugh). Vesper's letter needs a reason to deny (fix: Pip's rumour). |
| **Round VII** · Junkyard | The invitation announces the unheard word, after V. did. Ratchet's programme misprints. **"Thank you, Vale,"** to the runner. **Card:** V. knew first; the list is sealed in front of only the Pronouncer and the runner; **"Her name is Vale. She's sixteen."** | **Vale ✓✓** | **8 + eight seasons = 16. A careful 10-year-old can name her here.** Needs story order (Round VI's mail before this invitation). |
| *(Case 4)* | A V. card folded at the very page. The runner's arrival log. Ratchet-cleared card. | runner ✓, clears Ratchet | The Ratchet card must also ride Round VII's mail (fix). |
| **Round VIII** · Sprints | The runner takes the tape down; a card underneath in the slanting hand. Turn: Dax's stack of V. notes. **Card:** Dax cleared. Cliff: a V. note on the back of the gold invitation. | runner ✓, clears Dax | |
| *(Case 5)* | The runner carries the envelope in. The Pronouncer: "knows who V. is, promised not to say". | runner ✓ | Round IX's card carries the secret to every path. |
| **Round IX** · Stage | The runner carries in the championship envelope. Vesper: "The violet pen was mine." V.: **"who was there every single round?"** **Card:** the Pronouncer, "It isn't mine to tell." | runner ✓, clears Vesper and Pronouncer | Only the runner and the Pronouncer were at every round, and the upright hand has already cleared him. |
| **Accusation** | Wrong picks get a look-again tied to evidence. Vesper's look-again cites only her own denial (fix: cite the slant). | | Resolves by elimination at worst. |

**Clearings, all on the main path except one:**
- Vesper: Round VI and Round IX letters.
- The Pronouncer: Round III and Round IX cards.
- Dax: Round VIII card.
- Ratchet: only the Case 4 card (fix).

**V.'s predictions.** Every one comes true on screen except Case 2's "the bell will ring twice tonight" (fix):
- chair → Round III;
- list → Case 1 and Round II's cliff;
- bell and thunder → Round IV, and Pip (Round IV drama fix);
- "lose more than a round" → Round V;
- "the loud one" → Case 3 and Round VII;
- unheard word → Round VII;
- rumour → Case 4 and Round VIII;
- envelope → Case 5 (and on every path once Round IX's suspense names the new envelope).

## Owner decisions

### (a) Team Night seating: **holds**, with one fix and one clarification

Brief §8.2 contradicts §8.1 four ways:
- it seats Dax at the 8–10 lectern, where no call can reach him (his mockbee spec is null, and speed isn't a language);
- it seats Suki nowhere, though §8.1 gives her "nobody's heard it";
- it seats Vesper nowhere at 8–10, though §8.1 hands her the tiebreaker;
- its Mira→Ines swap is impossible at either lectern (Mira sits only at 8–10, Ines only at 11–15).

The script's choices resolve each one:
- **Dax a bench captain in both bands.** Right. His thread is identical across bands (test 4), and "Speed is nothing. Who takes the word is everything" is how he plays, not just what he says. His line "I shouldn't spell every word" slightly undersells "spells none himself", but the idea beat says it outright.
- **Suki in his seat at 8–10.** Right. It gives "nobody's heard it" an owner at the younger lectern, pays off Round VII, and seats her under the captain who tried to strike her round.
- **The Mira→Ines moment written per band.** Right. The 11–15 version (Latin called, it's French, Kwame's hands tighten, Ines spells it) is a stronger payoff than the brief's, because French was Kwame's crack. **Clarification:** the child plays the caller, so the scripted wrong call must read as Dax's own ("Dax takes one call himself"), or it contradicts a child who called that word right. Fix text is given for both bands.
- **Vesper takes the tiebreaker by a roster rule.** It holds, and it lets her thread end in both bands. But the rule is first stated at the moment it is used, which reads as made up on the spot in the 8–10 band, where she isn't seated. **Fix:** plant "Team Bee rules: a tiebreaker may go to anyone on the roster" in the idea beat before the match (text given, 54 words).

### (b) Vale's Round VI note hinting at the unheard word before the Committee announces it: **fair, not insider cheating**

It is insider knowledge on purpose, which is exactly what makes it a clue. Round VII's card states the inference and names the only two people who could know.

In-world it gives the child no advantage:
- it carries no word, only that an unheard word is coming;
- the Committee tells every speller that in the very next invitation;
- its tip ("Its parts have") is that round's public technique.

So "never let one word slip" (accusation reveal) stays true, and the Committee-approved tradition isn't leaking the list.

**One condition:** story order. If a child reaches Round VII's invitation before Round VI's mail, the note arrives after the announcement and the card's claim ("a round before the Committee announced it") is false. See the season row on story order.

## Every fix, line by line

Each fix is in `r3-fairplay.json` with its full reason. The text below is the replacement line (60 words or fewer, in the script's voice). `{weak}` is the proposed bee-file slot (see the season rows).

### Mystery and fair play (13)

| Path | Problem | Replacement |
|---|---|---|
| `suspectBoard.portraits[0].why` | Shown from Round I, but 'Violet ink' is first planted in Round III's suspense and 'Already qualified' is Round III's cliff (the RESERVED chair 'now has a name'), so the board spoils that cliff two rounds early. Keep Round I's card to what Round I can know; the clue cards add the rest. | A V. name. Last year's champion. Silent. |
| `suspectBoard.portraits[2].why` | Shown from Round I, but 'was where the dictionary went' is Case 4, six rounds later, and it gives away Case 4's answer (Ratchet borrowed the dictionary). It also states an event the child may never see, since Case 4 is optional. | 'Borrows' things, and nobody ever sees him do it. |
| `suspectBoard.portraits[4].why` | Shown from Round I, it points at the envelopes (Rounds VII/IX, Case 5) and the keys (Round V) before any of them appear. That makes her the most singled-out portrait on day one, against the aim of hiding her in plain sight. Let the clue cards supply the specifics. | Always somewhere nobody looks. |
| `rounds[1].pieces.v` | The prediction ('the list will lie') is fair and Case 1 and the cliff pay it off. But 'You guess instead of asking' states the child's weakness as fact. Brief §5B takes it from the bee file's top error type, and Round IV's card ('V. always knows your weak spot') is only true if it does. Make it a slot, one pre-written line per error type (L7), defaulting to the authored clause. | {weak} Tonight the list will lie to you. Read it twice. — V. |
| `rounds[3].pieces.laugh` | Round IX's V. note asks 'who was there every single round?', and the answer has to be visible every round. The runner appears in no on-screen line of Round IV (or Round VI), only in this round's clue card. | Mira asks for the origin of the word 'the'. The Pronouncer answers, at length, delighted. At his elbow, the runner turns a page and waits, as if she has heard this one before. |
| `rounds[3].pieces.v` | 'Someone in this hall': the one who loses more than a round is Kwame, in the next hall (the Root Throne). Mockbee's 6–7 and 8–10 fields don't seat Kwame at the Storm. | Words keep their passports. Check them. Someone on this Circuit is about to lose more than a round. — V. |
| `rounds[4].pieces.v` | The second clause ('the loud one gets louder') fairly predicts 'not my problem' and the Round VII rumour. But 'You skip the suffix' asserts the child's weakness as fact (see rounds[1].pieces.v). Use the bee-file slot. | Parts first, then the whole. {weak} And when a strong one breaks, the loud one gets louder. Watch. — V. |
| `rounds[5].pieces.laugh` | The runner is absent from every on-screen line of Round VI, yet Round IX's V. note asks 'who was there every single round?'. | Salty applauds every word, including the wrong ones. The runner quietly moves the programmes out of splash range. |
| `rounds[5].pieces.suspense` | Vesper denies being V. unprompted. Nothing on screen tells her anyone suspects her (the Suspect Board is the child's own), so a careful child asks how she knows. Give the rumour a source: Pip is the rumour mill (thread D), and it grows thread C's rumours. | Vesper's letter, two lines: 'Pip is telling everyone I'm V. Not me. I don't write notes. — Vesper.' |
| `rounds[8].pieces.suspense` | On a path that skipped Case 5, Round VIII's 'the envelope will open before anyone opens it' is never paid off. Name the new envelope here, on every path. (The above/below branch also needs Vesper to outlast every other rival; see the season row.) | The championship word arrives in a new envelope, sealed in front of everyone last night and carried in by the runner. Finish above Vesper and it's yours to spell; finish below and it's hers. Either way, the card shows the word, its origin and the technique that cracks it. |
| `cases[1].lastChill` | Two problems. 'The bell will ring twice tonight. Listen for the second.' is a V. prediction nothing ever pays off (and Kwame's round isn't tonight); every other V. prediction comes true on screen. And 'if the lock never worked' contradicts this case's own reveal ('The lock never worked. Bolt admits it.'). Keep the fair ambiguity (who could have used it?), not the contradiction. | Inside the case, where the bell stood: a V. note. 'The bell will ring on time. Not everyone wants it to. — V.' Two people hold keys to that case. But the lock never worked, so anyone could have put it there. |
| `cases[3].clue.text` | The only card that clears Ratchet is delivered only inside this optional case. That breaks the rule that clue cards ride the hall mail (authorNotes; test 5). On the main path the misprints are shown (Round VII's programme), but the inference is never stated. Deliver a version built only on Round VII's programme with Round VII's mail; the case may repeat it. | Ratchet's programme says 'borowed' and 'evenchually'. He can't spell. V.'s notes have never had a single misprint. |
| `accusation.lookAgainBy.vesper` | It clears her only by her own denial ('she told you herself'), which is no evidence in a detective story and teaches the child to take a suspect's word. Anchor it in the slant clue that is on screen on every path (Round III's card). | Not quite. Look again: the night the list lied, one hand slanted left like every V. note, and it wasn't Vesper's. The violet pen was a gift. |

### Continuity with the app and Mock Bee (15)

| Path | Problem | Replacement |
|---|---|---|
| `rounds[0].pieces.dax` | 'From a venue you haven't reached' assumes Atlas progress. A hall opens on reaching its leg 4 and halls are optional (L2), so a child can reach the Sprints before ever playing the Meadow hall. | A postcard from the far end of the Circuit: 'Heard you got through the Meadow. The Sprints are mine. — D. (fastest in round one, ask anyone)' |
| `rounds[0].pieces.cliff` | 'You've only finished the first' asserts progress the child may already be past (same problem as the dax postcard). The fact that holds on every path is the round count. Round VIII's dax line ('his home hall') still pays it off. | The postcard's stamp is from the Finish Arch, the eighth hall on the Circuit. The Circuit has run one round. How is he already there? |
| `rounds[1].pieces.drama` | Eleven questions about one word cannot happen in Mock Bee. The Pronouncer's Chair has six requests, part of speech cannot be asked twice ('already on the card'), and each costs 3 s of a 30 s turn (mockbee.js mbAsk). A careful child who has used the chair will notice. | Theo asks every question the Pronouncer's chair holds about one word, and spells it perfectly with a second left on the clock. The speller two seats down falls asleep. |
| `rounds[1].pieces.laugh` | Mockbee blocks a second part-of-speech request on the same word, so 'for the eleventh time ... still a noun' contradicts the bee. Spread the gag across the round instead. | The Pronouncer, for the eleventh time today: 'Yes, Theo. That one is a noun too.' The runner refills his water glass without being asked. |
| `rounds[3].pieces.inv` | Round III's cliff says this invitation names Vesper 'already qualified for the Grand Marquee'. It doesn't. Brief §5C has every invitation from Round IV name her. Add the line, worded so it also explains her empty chair. | Today's weather: Greek, with a strong chance of ph. Seated in chair one: Mira, who asks every word where it was born. Already qualified for the Grand Marquee: Vesper. Her chair stays empty until then. |
| `rounds[3].pieces.drama` | Case 2's answer (Pip took the bell because thunder scares him) and Round III's 'look for the one who's scared of thunder' rest only on Pip's secret inside the optional case. Plant his fear here, on every path, so both the note and the case are fair. | Thunder hits mid-word. Mira doesn't flinch; she asks the origin, hears 'Greek', and smiles. In the front row, Pip jumps at every clap and pretends he didn't. |
| `rounds[4].pieces.inv` | 'Dax spells today' is false in the 6–7 band (mockbee seats Pip, Nova, Rafi and Suki plus the headliner). It also broadcasts by name a warning Case 2 gave 'quietly'. And nothing on the main path says the bell came back. Mirror Round VIII's 'one speller', and close the bell. | Kwame has not misspelled a word in public in two seasons. Seated beside him: you. The bell is back, and Pip will ring it. One speller here is on a first warning from the Committee. |
| `rounds[5].pieces.cliff` | Says the Junkyard invitation lists the Circuit table. rounds[6].pieces.inv does not. This line is Case 4's only motive plant, so it has to stand on its own. | The Circuit table goes up on the Junkyard gate: Suki seventh, Dax eighth, one place behind her. |
| `rounds[7].pieces.inv` | 'A speed round' promises a mode the hall doesn't run. A regional round is plain Mock Bee in a venue (§3.5), with the same 30 s turns. | The Finish Arch, where everyone starts fast and not everyone finishes that way. The Committee notes that one speller has received a formal warning and will spell under observation. |
| `hivePost.diary[1]` | Names Theo, who is first met in Round II. Level-ups aren't tied to halls, so this can land before that round, or for a child who never plays one. Either deliver it only after Round II's mail, or use the neutral line. | Level up. Somewhere, a tally of questions just went up by one. |
| `hivePost.diary[3]` | Names Nova, who is first met in Round I. Level-ups aren't tied to halls, so this can land before that round, or for a child who never plays one. Either deliver it only after Round I's mail, or use the neutral line. | Level up. Say it twice: well done, well done. |
| `hivePost.diary[4]` | Names Rafi, who is first met in Round III. Level-ups aren't tied to halls, so this can land before that round, or for a child who never plays one. Either deliver it only after Round III's mail, or use the neutral line. | Level up. Draw this one small on your palm. |
| `hivePost.diary[7]` | Names Mira, who is first met in Round IV. Level-ups aren't tied to halls, so this can land before that round, or for a child who never plays one. Either deliver it only after Round IV's mail, or use the neutral line. | Level up. Ask where every word came from. This one came from you. |
| `hivePost.diary[9]` | Names the Pronouncer, who is first met in Round I. Level-ups aren't tied to halls, so this can land before that round, or for a child who never plays one. Either deliver it only after Round I's mail, or use the neutral line. | Level up. Say it back, then spell it: the routine still works. |
| `hivePost.beeFileIntro` | 'Every word you spelled tonight': rounds run by day too (Round VII is 'by evening', Round VIII 'all morning'). Team Night is the only fixed night. | The bee file: the Pronouncer's scouting report, for you and anyone you show it to. Every word you spelled in this round, the one that beat you, why it did, and the technique that would have caught it. Missed words go to your revision pile. |

### Lines that assume what the child did (7)

| Path | Problem | Replacement |
|---|---|---|
| `rounds[1].pieces.above` | Says the child asked three questions. Mock Bee lets a child ask none, and nothing feeds this line from the chair's log (g.turnAsks). | You beat me, and I asked more questions than anyone. Imagine what you'll do with eleven. They have to answer. Questions asked this season: 212. — Theo |
| `rounds[1].pieces.below` | Says the child asked one question; it may have been none, or all six. | Next time, ask before you spell. Ask five: definition, sentence, part of speech, origin, alternate pronunciation. They have to answer. Questions asked this season: 212. — Theo |
| `rounds[2].pieces.above` | 'You beat me on circumference' assumes that word came up in the child's bee. pick() may never have served it. | You beat me. Circum means around; fer means carry: circumference is the line carried around. Split it before you spell it. Draw the next word small on your palm. — Rafi |
| `rounds[3].pieces.above` | 'You asked for the origin twice' states a count the child may not have. | You beat me. Now ask for the origin every time. Greek words travel with their luggage: ph, ch, y. — Mira |
| `rounds[3].pieces.below` | 'Phantom with an f!' tells the child they misspelled phantom, but pick() may not have served it, and the miss may have been a different word. | Next time, ask where it came from. Phantom, phrase, physics: if it's Greek, the f sound is often ph. The origin tells you the rules. — Mira |
| `rounds[5].pieces.below` | 'The quiet letters beat you' says the child's miss was a silent letter. It may have been any word. | Écoute la fin. Ballet ends in a t you never hear. Listen for the quiet letters next time: they're the loudest ones in the word. — Ines |
| `rounds[6].pieces.below` | 'You held your breath on the hard one' asserts something the app cannot know. | The hard one got you. Next time, breathe out first. Out, not in. Then ask everything. — Suki |

### Dax arc and the turn (3)

| Path | Problem | Replacement |
|---|---|---|
| `turn.kwame` | In Round V Kwame was out of the building when Dax said it (moved there for L4), so 'You said it' needs him to have heard it second-hand. Say so, or a careful child asks how he knows. | I crack too. Two seasons, gone in one word. I heard what you said in the corridor. You were right. Welcome. |
| `turn.apologies[0].reply` | Theo asks 'why me?' straight after Dax has answered exactly that. It was already his 640th question ('What made you think it was me?', Round III), so the reply ignores the apology it is replying to. Close the loop and keep the tally. | Accepted. That answers question 640. Question 1,204: same team now? — Theo |
| `turn.apologies[2].text` | Round VI shows Dax alone on the dock, 'writing something', and nothing ever says what. Pay it off here, on every path. 'Not my problem' is on screen only in Case 3, but the apology makes it self-explanatory. | I wrote this on the dock at the Far Shore and didn't send it. What I said in the corridor. And 'not my problem.' Both wrong. Sorry. — D. |

### Cases: clocks, plants and puzzles (13)

| Path | Problem | Replacement |
|---|---|---|
| `cases[0].reveal[0]` | Says 'the apprentice'. Round II's programme and the right accusation say 'the typesetter', and 'the printer' is a separate suspect. Three names for two people; tie them together. | The typesetter, the printer's apprentice, set the type from the parrot's dictation. A parrot can only say what it hears, so every letter you can't hear went missing. |
| `cases[1].clock` | Kwame's round is Round V at the Root Throne, but this case is set at the Eye of the Storm with his round '30 minutes' away. The places contradict. Keep the 30 → 15 minute clock by making it the Committee's departure. | The Committee's coach leaves for the Root Throne in 30 minutes, and Kwame's round can't start without a bell. No bell, no bee. |
| `cases[1].escalation` | The evidence against Dax (heel-marks rocked back and forth: his tell) appears only in the reveal, after the child has already accused, yet the right choice names him. Show it before the accusation. | The spare bell is missing too, and the clock jumps to 15 minutes. Behind the curtain where it stood: two deep heel-marks in the dust, rocked back and forth. |
| `cases[1].puzzle.brief` | Promises every answer is spelled by ph/ch/y. Onomatopoeia (item 2) uses none of them (its rule is 'oe'), and a child who trusts the brief will doubt a right answer. | A trail of definitions. Each answer is a word built in Greek and spelled by Greek's rules: ph for f, ch for k, y for i, and a few more. Spell it right and it opens the next hiding place. |
| `cases[1].puzzle.items[3]` | Leaked: Round IV's bee file spells R-H-Y-T-H-M letter by letter, and Round IV's corridor tip names rhythm with Mira's 'Greek. Y.', in the mail that arrives just before this case. Swap it for an unshown y/ph word, e.g. xylophone (Greek xylon, wood + phone, sound). | an instrument of wooden bars you play with small hammers |
| `cases[1].puzzle.items[6]` | Two right answers: 'a group singing together' is just as much choir, which is also ch for k and also from Greek khoros (through Latin and French). Change the clue so only chorus fits. | the part of a song that comes back after every verse |
| `cases[1].puzzle.items[8]` | The Storm visitor card for Echo says 'a sound that comes back ... echo', almost word for word this clue. The Visitors' Book can be open during the case, and Echo stands on a Storm stop before it. Swap the item, e.g. microphone (mikros, small + phone, sound; ph), which Round VII's laugh already features. | the thing a speller speaks into so the whole hall can hear |
| `cases[1].puzzle.items[9]` | The Storm visitor card for Psyche prints 'Psychology, the study of the mind', which is this clue and its answer. Swap it, e.g. cylinder (kylindros; y for i). | a solid shape like a can of beans |
| `cases[1].reveal[2]` | Once the escalation shows the heel-marks before the accusation (fix there), this line can no longer call them 'the trail's last clue'. Make it the confirmation instead. | Those heel-marks behind the curtain were Dax's, rocked back and forth the way he always stands. He hid the spare to stretch the delay. |
| `cases[2].puzzle.note` | 'Back by sundown' reads as Kwame coming back to the Root Throne, but the clock and the reveal have him signing in at the Far Shore. It sends the child the wrong way. | safari · yogurt · samovar · hummus · piano · catamaran · café · ballet. Signing in by sundown. — K. |
| `cases[4].clock` | 'Curtain up at 7:00' is the final, tomorrow evening. But the case is the night before, and its escalation at 6:15 reads as 45 minutes to curtain. Give the night its own deadline. | The Committee meets at 7:00 tonight. If anyone has seen the championship word, tomorrow's final is void. |
| `cases[4].impossible` | The answer (Duchess on a high shelf) is planted only in programme art ('planted'), and the Stage programme may not have arrived when the case opens. Put the plant on screen, before the puzzle. | At five, the runner carried the sealed envelope into a dressing room and came out; the Pronouncer locked the door. The only key stayed on his belt all night. Now the envelope lies open on the floor, and Duchess is asleep on the top shelf. |
| `cases[4].escalation` | Here the new word is 'sealed and ready' at 6:15, then the reveal has the Pronouncer seal a new word in front of everyone: it gets sealed twice. | 6:15. The Pronouncer has a new word ready to seal, but Vesper won't spell tomorrow unless her name is cleared. |

### Team Night (6)

| Path | Problem | Replacement |
|---|---|---|
| `teamNight.beats.idea` | The tiebreaker goes to Vesper by a roster rule that is first stated at the moment it is used (finalWord). In the 8–10 band she isn't at the lectern, so it reads as made up on the spot. Plant the rule here, before the match. | Dax's plan, learned from losing: 'Speed is nothing. Who takes the word is everything.' Each word goes to the speller who knows its language; the steady-beat words, the ones nobody at the lectern owns, go to you. He captains from the bench. Team Bee rules: a tiebreaker may go to anyone on the roster. |
| `teamNight.beats.drama.8-10` | The child plays the caller (rules[0]). A scripted wrong call contradicts a child who just called that word right, unless the line makes it Dax's own call. | Ravenmere leads all night. In the last round Dax takes one call himself: Latin, to Rafi. It's Greek. Arjun smirks. Rafi's finger stops on his palm. Dax doesn't panic, which is new for him. He breathes out, out not in, asks the Pronouncer the language of origin, and re-calls it to Mira. She spells it. |
| `teamNight.beats.drama.11-15` | Same as 8–10: make the wrong call Dax's own, not the child's. Kwame's French weakness (Round V) makes this a strong payoff. | Ravenmere leads all night. In the last round Dax takes one call himself: Latin, to Kwame. It's French. Arjun smirks. Kwame's hands tighten behind his back. Dax doesn't panic, which is new for him. He breathes out, out not in, asks the Pronouncer the language of origin, and re-calls it to Ines. She spells it. |
| `teamNight.beats.levelling` | There is no line for a miss. 'You spell it, and the score is level' is false if the child misspells, and a mastered word can still be missed. L6 and test 7 need a branch that keeps the child's word counting. Keep this line for a right answer and add this one for a miss. The mechanic must then give a second try, with the cases' escalating help, so it always ends right. | One letter slips. Dax, from the bench: 'Breathe out. Team Bee rules: one second try a night.' You breathe out, ask everything, and spell it right. The score is level. |
| `teamNight.beats.daxPostcard` | 'Like you said': the child never says 'steady beat' on screen; only V. and the techniques do. What the child did, in every branch, is spell the steady-beat words at Team Night. | Steady beat. You showed us how tonight. — D. (captain, ask anyone) |
| `teamNight.beats.sting` | 'Back at the Grand Marquee': Team Night is held at the Grand Marquee (teamNight.venue), so nobody has left it. | Later, in the empty Grand Marquee, Vale and the Pronouncer are stacking chairs beside you when one more note slides under the door. A different hand, small and careful, in pencil: 'There were always two of us. — V.' Vale reads it twice. 'That isn't mine.' For the first time all season, the Pronouncer looks surprised. |

## Fails

None. Every problem here can be fixed with a line or a build rule, and none breaks the mystery's fairness at the root.

## Season rows

1. **PASS.** CLUE CHAIN, fair. A careful 10-year-old can name Vale before the accusation from lines that arrive with the hall mail on every path. Round II: 'Vale Penrallow, aged 8, placed last', eight seasons back. Round III: the runner's left hand slants like every V. note, and the Pronouncer's is upright. Round V: the bell-case keys (the Committee's ring, the runner's lanyard). Round VII: 'Thank you, Vale', and only the Pronouncer and the runner see the sealed list ('Her name is Vale. She's sixteen'). Round IX: 'who was there every single round?'. A strong hunch is possible from Round III; it is certain by Round VII. No clue contradicts another once Case 2's last chill is fixed. Every V. prediction comes true on screen except Case 2's 'the bell will ring twice' (fix given).

2. **PASS.** TIMELINE adds up. Vale was 8 eight seasons ago and is 16 now (Round II, Round VII, accusation); runner for three seasons (13–16). Vesper is 15, champion last year. Kwame is 14, two seasons without a public miss. Theo's tally runs 212 → 640 → 1,204 → 1,977 in order. Day order: Round II, then Case 1 at night, then Round III at 9:00; Case 4 rules at noon after Round VII's evening; Case 5 the night before; Round IX at 7:00; Team Night the next night. Case 2's clock (wrong venue) and Case 5's clock (night before vs 45 minutes to curtain) need the fixes given.

3. **PASS.** RED HERRING, fair. The Pronouncer never lies on screen and nothing frames him. Every reason to suspect him is true ('V.' signoff, 'Say it back', reads the list, kind). He is cleared on every path by the upright hand (Round III's card) and 'It isn't mine to tell' (Round IX's card). Vesper is cleared by Round VI and Round IX (her look-again should cite the slant; fix given). Dax is cleared at Round VIII, on evidence.

4. **FIX.** CLEARINGS ON EVERY PATH. Vesper, Dax and the Pronouncer are cleared by cards that ride the hall mail. Ratchet's clearing card rides only Case 4 (cases[3].clue), so a child who skips that case never sees the inference stated. Deliver it with Round VII's mail (fix given).

5. **FIX.** SCRIPTED HALL OUTCOMES. Each round's drama states what rivals do, but Mock Bee seeds its rivals and will not produce these on its own. Round I: Pip blurts and sits down in round two. Round III: Rafi lasts deep. Round V: Kwame misses reconnaissance (an s) and walks out. Round VI: Ines and Kwame in the last rounds. Round VII: Suki gets the unheard word first and spells it. Round VIII: Dax fades. Round IX: the blackout, and Vesper outlasting every other rival whenever she finishes above the child, or her below letter's 'I won' is false. Rounds I–VIII (11–15) must leave Vesper out of the field, since her chair is empty until the final. Round IX must seat the whole Circuit: its lines put Dax, Theo and Pip at the microphone, and the 6–7, 8–10 and 11–15 fields each lack some of them. The eight-minute cap's co-champions need a line too. The hall runner needs a per-round script (forced word, miss, survival, field). Without it these lines contradict the bee the child just played.

6. **FIX.** STORY ORDER. The script assumes Round N's invitation and hall come after Round N−1's mail: Round III's cliff before Round IV's invitation, Round VI's cliff and note before Round VII's invitation, Round VII's card's 'a round before the Committee announced it', Round VIII's cliff before Round IX. But a hall opens on reaching its leg 4, and halls are optional (L2), so a child can reach Round N's invitation, or play its hall, before playing Round N−1. Either hold each invitation and hall until the previous hall's mail is delivered (a hall waiting on a hall, not a stop, region, game or word), or deliver all mail strictly in story order. The same goes for Round I's 'venue you haven't reached' (fix given).

7. **FIX.** CASE SECRETS AND SCENE TAPS. No case writes the format's step 2 (three things to tap, one of them the planted clue). Whether a case can be solved before the accusation depends on when the suspects' secrets show. Case 2 needs Pip's fear and Dax's motive before the accusation; the Round IV drama fix and the Case 2 escalation fix put them on screen. Case 5's Dash secret, shown early, is the answer and takes the clearing from Dax. Rule for the runner: secrets surface in the reveal, and the facts a child needs go in the scene taps or the escalation.

8. **FIX.** PUZZLES, one answer each. Case 1 passes (eleven restorable silent letters; colour/color accepts both). Case 3 passes under its on-screen rule (the direct donor); the answer choices must not offer the earlier source language. Case 4 and Case 5 pass. Case 2 does not: rhythm is spelled on screen just before (Round IV's bee file); chorus also fits choir; echo and psychology are printed with their clues on Storm visitor cards; and the brief's ph/ch/y promise excludes onomatopoeia (item fixes given). Case 2 also runs on 'Word Lore · Origins', a pick-the-language quiz, while its puzzle asks for spelling from a definition: it needs a spelling engine. The accusation always resolves, by elimination if nothing else. Team Night's levelling word has no miss branch (fix given).

9. **FIX.** TEAM NIGHT CALLER RULE. Many origins name two languages ('Latin, from Greek'; 'French, from Italian'), and the 8–10 lectern seats both Rafi (Latin) and Mira (Greek), so a call can have two defensible answers. Grade the call on the first language the Pronouncer names (the direct donor, as Case 3's rule already says), say so once on screen, and choose the drama words so the first-named language is the one the line says: Greek-first at 8–10, French-first at 11–15. The callers match mockbee specs otherwise (the validator checks this).

10. **FIX.** V.'S NOTES AND THE CHILD'S WEAKNESS. Brief §5B: each note names the child's weakest technique from the bee file's top error type. The script hard-codes it (Round II's 'You guess instead of asking', Round V's 'You skip the suffix'), and Round IV's card claims 'V. always knows your weak spot'. Add a {weak} slot, filled from one pre-written line per error type (L7), with the authored clause as the default. Several rival letters likewise state counts or words the child may not have (Round II above/below, Round III above, Round IV above/below, Round VI below, Round VII below); fixes are given per line. General encouragement ('You waited', 'So close', 'nearly had me') is fine.

11. **PASS.** ABOVE / BELOW PARITY. Both versions of every round letter carry their thread: Nova's rule, Theo's 212, Rafi's circum + fer and palm, Mira's ph/ch/y, Kwame's Far Shore + French, Ines's 'Écoute la fin', Suki's breath, Dax's apology ('Mostly Suki'), Vesper's pen. No round besides Round IX depends on placing, and Round IX states both branches.

12. **PASS.** DAX'S ARC. Every wrong has an on-screen consequence that reaches every path. The separate tip: Nova, at once (Round II). Blaming Theo: Theo's public question he can't answer (Round III). The rhythm tip: Mira, at once (Round IV). The bell: a first warning (Case 2, then Round V's invitation). Gloating over Kwame: Rafi turns his back (Round V). 'Not my problem': alone on the dock (Round VI). The rumour: a formal warning (Case 4, then Round VIII's invitation, 'under observation'). The reform is earned across rounds, not switched on: Round VIII's fade, then Kwame's grace, the notes and four apologies; Case 5, where he clears Vesper; Round IX, his first question; Team Night, where he owns his record, captains from the bench and doesn't panic on a wrong call.

13. **PASS.** KWAME'S SAFETY AND THE ADULTS. Safety is known before any worry: Round V's cliff raises the empty room and says he's safe in the same line, and Case 3's safe line comes first in the cold open. The adults are openly involved throughout: Round I's invitation says the Committee knows who V. is; the Pronouncer is warm and never lies; Hazel tells at once; the Committee says yes in the closing letter; 'Together, and in the open'.

14. **PASS.** OWNER DECISION (a), TEAM NIGHT SEATING: holds. Brief §8.2 contradicts §8.1. It seats Dax at the 8–10 lectern, where no call can reach him (his spec is null, and speed isn't a language). It seats Suki nowhere, though §8.1 gives her 'nobody's heard it'. It seats Vesper at 8–10 nowhere, though §8.1 gives her the tiebreaker. And its Mira→Ines swap is impossible at either lectern. The script fixes all four. Dax is a bench captain in both bands, so his thread is the same everywhere (test 4) and his idea ('Speed is nothing') is how he plays. Suki takes his seat at 8–10, owning a call and spelling under the captain who tried to strike her round. The swap is rewritten per band, and the 11–15 version pays off Kwame's French weakness. Vesper takes the tiebreaker by a roster rule. One fix: plant that rule before the match (teamNight.beats.idea), not at the moment it is used. One clarification: the scripted wrong call must be Dax's own, since the child is the caller (drama fixes).

15. **PASS.** OWNER DECISION (b), VALE'S ROUND VI NOTE: fair, not a cheat. It is insider knowledge by design, which is what makes it a clue, and Round VII's card states the inference and names the only two people who could know. In-world it gives the child no edge: it carries no word, only that an unheard word is coming, which the Committee tells every speller in the very next invitation, and its tip ('Its parts have') is that round's public technique. It is consistent with 'never let one word slip' (accusation). It needs story order (season row): if Round VII's invitation reaches a child before Round VI's mail, the note arrives after the announcement and the card's claim is false.

## What the validator already checks, and what this review adds

`tools/circuit/validate.cjs` checks, among other things:
- cast names, ages and tells against mockbee BOTS;
- every round's region order and lesson title;
- the pieces are present and V. notes are signed;
- at least six clue cards point at Vale;
- both letter versions carry the Kwame, Dax and Vesper plants;
- Case 1's misprints drop letters in order;
- Case 3 spells STRAIT, with French twice;
- Case 4's parts join to the word;
- Case 5's ok flags and endings;
- Case 2's clues don't contain their own answer;
- each Team Night caller is at that band's lectern and matches mockbee spec;
- word counts and banned terms.

It cannot see:
- whether a claimed quote matches the line it quotes (the two cliffs);
- whether an answer is printed on another screen first (rhythm in the Round IV bee file, echo and psychology on visitor cards);
- whether a clue gives two right answers (choir);
- whether a prediction is ever paid off ('ring twice');
- whether a line contradicts mockbee's rules (the 30 s / 3 s chair, the band fields, round one forgiving);
- whether a card rides only an optional case (Ratchet);
- whether a line claims what the child did;
- whether the halls can arrive out of story order.

These are the things to add to it, or to the §13 test 5 bot, when the build lands:
- each `cliff` that quotes an invitation contains a substring of it;
- no case puzzle answer appears in earlier mail or in the same region's visitor cards;
- every clue card's `id` is delivered by `rounds[]`;
- every V. note's prediction has a marked payoff;
- the hall script forces each `drama` outcome.
