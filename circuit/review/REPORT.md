# The Bee Circuit, Season 1 — the script review report

Step 1 of the build brief (`circuit/BEE-CIRCUIT.md` + `circuit/AMENDMENTS.md`): the season written as data
(`circuit/script.json`), reviewed by three independent agent lenses, fixed, and reviewed again until every lens
signed off. This report is for the owner; nothing in it is on a child's screen, and nothing of the Circuit is built
into the app yet (that is steps 2–9, after the 4.5 P0 and P1 gates).

## The verdict

**Ready for the build, as far as the three lenses go.** After three cycles, no lens fails a single line, and every
remaining fix was applied. Eight questions below are yours; none blocks the build, but four of them change what a
child sees.

## What is in the script

9 rounds (one per Atlas region, in the Atlas order), 5 Surprise Stops (cases), the turn (Round VIII), Team Night,
the accusation, the Hive Post (postcards, diary, bee file), 26 Stop Visitor cards, and — never on screen —
`build` (12 rules the hall must enforce, each with its test), `ownerQuestions`, `fairPlay`, `suspectBoard` and a
`changes` log of every edit with the review row that asked for it. Every on-screen line is ≤ 60 words.
`tools/circuit/validate.cjs` holds the script to the app's own data (Mock Bee's cast, the concept titles, the Atlas
order, the word library) and to 21 groups of rules from the reviews; each rule was proved by breaking a copy of the
script. It reports **0 FAIL**.

The mystery is fair: a careful ten-year-old who reads every card can name Vale by Round VII ("Her name is Vale.
She's sixteen."), from cards that ride the round mail — so a child who skips a Surprise Stop still gets every clue.
The Pronouncer is a fair red herring: he never lies on screen and two cards clear him.

## How it was reviewed

Three lenses, each blind to the others in its cycle:
1. **Safety and tone** — violence, fear, bullying, respect, adults openly involved, nothing sacred mocked.
2. **Accuracy** — every fact checked against a named source; every app fact against the app's files.
3. **Fair play and continuity** — the clue chain, one answer per puzzle, no answer printed early, no line that
   assumes how the child placed.

A cycle's fixes were applied (merged where two lenses touched one line, never weakening a safety fix), and the
changed lines went through all three lenses again.

| cycle | lines reviewed | safety | accuracy | fair play |
|---|---|---|---|---|
| 1 | every line (≈445) | 434 pass · 13 fix · 0 fail | 809 pass · 13 fix · 0 fail (822 rows) | 373 pass · 57 fix · 0 fail, + 7 season fixes |
| 2 | 122 changed | 117 pass · 5 fix · 0 fail | 123 pass · 12 fix · 0 fail | 109 pass · 13 fix · 0 fail, + 8 build · 5 season fixes |
| 3 | 40 changed | 40 pass (1 build fix) | 39 pass · 1 fix | 36 pass · 4 fix (3 build) |

Every fix in every cycle is applied (`review/applied.json`, `review/applied-c2.json`, and the cycle-3 entry in
`changes`). Each lens's full findings: `review/r1-safety.md`, `r2-accuracy.md`, `r3-fairplay.md` (cycle 1),
`c2-r*.md` (cycle 2), `c3.md` (cycle 3).

## The fixes that mattered

**Safety.** Every note-writer is known to an adult: the Pronouncer says "Any note you ever get, you can show me, or
any grown-up you trust"; Vale's closing letter puts the Committee in her own story ("a Circuit tradition even
then"). Kwame tells Hazel himself where he is going, and the child is told he is safe before his room is empty.
Team Night's sting happens while the Committee clears the hall, never in an empty building. The only sneer on the
rival team moved off its one Indian-named speller. Pip apologises for the bell; Dash owns his mistake.

**Accuracy.** Mercator died in 1594; his son Rumold published the *Atlas* in 1595, named for a legendary King Atlas
of Mauretania. Hypnosis was named from the Greek word for sleep, not after the god. Two false rules were removed
("real parts make a real word"; "loanwords keep their home spelling"). Case 2's items were rebuilt (megaphone,
xylophone, cylinder, chorus) so each is Greek, has one answer, and is printed nowhere earlier — Mock Bee's own
announcer says "microphone", so it went. Round III teaches the trans-/per- lesson the child has reached, with
"transfer". Every word the script asks for is in the library (unflappable, reliable, cafe, tantalize).

**Fair play.** The hall must force the outcomes the lines describe (Pip out in round two, Kwame's "reconnaissance",
Vesper's empty chair, Dax seated in every final), and halls open in story order — those are `build` rules with
tests, not lines. Lines that claimed what the app cannot know ("phantom with an f", "held your breath") now read the
child's own bee file through slots (`{weak}`, `{missed}`, …), and a weak-spot line with no evidence gives advice,
never a diagnosis. The sting that names Vale waits until after the accusation.

## Decided (14 Oct 2026, the owner: "COMPLETE ALL open" — the recommended answer to each)

1. Ravenmere's names stay for Season 1; in Season 2 neither Arjun nor Mei is the means of Ravenmere's unkindness.
2. **Suki is re-faced**: Snowfox, alt Wisp (Enchanted pack) — `mockbee.js` BOTS, the Grand Prix cast and the script's cast
   key (`snowfox`). Kwame's Samurai stays (lower priority).
3. The twins "spell as a pair, one letter each"; BEE-CIRCUIT.md §4.2 and §8.1 amended.
4. Team Night seating as written. 5. Dax seated in every band's final. 6. Dax's Suspect Board line kept.
7. Season 2's second hand resolves to someone the adults know and approve (recorded in `season2Seeds`).
8. App data fixed: unflappable (and unflappableness) → English in the library; the atlas story in `eponyms-master.json`
   and three trivia facts (t29330, t30404, t13451 — whose marked answer was the false claim) now say what the Visitors'
   Book says; BEE-CIRCUIT.md says *tantalize*, and §9 says one tap adds the missed words. triskaidekaphobia stays
   "English" (an English coinage from Greek parts — the script agrees).
- The accuracy re-check (opened pages, not searches) runs with the Stop Visitors review, build step 8.
Each decision is also on its `ownerQuestions` entry in `script.json` (`decision`, `decided`, `by`).

## The questions as they were asked (eight; none blocked the build)

1. **Ravenmere's names.** Two of the rival team's five carry Indian and Chinese names (Arjun, Mei). Arjun's beats are
   skill only and Mei is the kindest voice. The safety lens finds it acceptable for Season 1; for Season 2 neither
   should carry the team's unkindness. Keep?
2. **Mock Bee's faces.** Suki (the one Japanese-sounding name) wears Panda Sensei with Lucky Neko as her alternate,
   both from the Dojo pack. The safety lens recommends re-facing Suki (Kwame's Samurai/Ninja optional). This is in
   `mockbee.js`, i.e. live today, not only in the Circuit.
3. **The twins' tell.** "Spell in unison, one letter each" contradicts itself ("in unison" = together, at the same
   time — and this is a spelling app). The script says "spell as a pair, one letter each". Accept, and amend
   BEE-CIRCUIT.md §4.2/§8.1 to match?
4. **Team Night seating.** Dax captains from the bench in both bands and Suki takes his seat at 8–10, because the
   brief's §8.2 contradicts §8.1 four ways. Both reviewers hold it. Accept?
5. **Round IX.** Dax is seated in every band's final (one extra seat, only at 6–7), so every child sees his first
   question — the last step of his reform. Accept, or seat only the band's usual field?
6. **Dax's Suspect Board line** was "He's the villain"; it is now "Everyone's first guess. He's set on beating you,
   and V. knows things." Keep?
7. **Season 2.** The second note-writer must resolve to someone the adults know and approve, never an unknown adult.
   Recorded in `teamNight.season2Seeds`; please carry it into the Season 2 brief.
8. **Data outside the script** that disagrees with it: the library gives unflappable the origin "Latin" (it is an
   English formation) and triskaidekaphobia "English"; `eponyms-master.json`'s atlas story still has the Titan on
   Mercator's cover; BEE-CIRCUIT.md §10 still says "tantalise". Fix these in the app data?

## One honest limit

The accuracy lens could not open web pages in this environment in any cycle (the fetch tool failed name lookup; the
proxy refused direct requests), so every fact was verified by site-restricted search against Merriam-Webster,
Etymonline, Wiktionary, Britannica and Wikipedia, with the returned URLs cited row by row — never from memory, but
weaker than reading the page. Before launch, the facts listed in `ownerQuestions[id=accuracy-reverify]` should be
re-checked against the opened pages (Merriam-Webster's *catamaran* entry could not be retrieved at all; the other
sources give Tamil).
