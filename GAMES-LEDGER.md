# GAMES-LEDGER — one in, one out

Owner decision, 4 Oct 2026 (games spec §3.1): **no games for the sake of it.** A new card enters the Play
tab only by replacing one that leaves, and the total never goes up. A new **mode** inside a hub is allowed
only if it replaces a weaker mode in that hub (record it in the hub's own section below).

This file is read by `tests/games-ledger.cjs` (T16, `@check`): the Play tab's registry (`SB_PLAY_CARDS`
in `app3.js`) may not hold more cards than the count below, every card in it needs a row here, every card
that came **in** names what went **out**, and nothing that went out may come back without a new row.

To add a card: write its row with the key it replaces, move that key to **Out**, lower or keep the count —
then add the line to `SB_PLAY_CARDS`. In that order.

## Count

Cards: **11**

Before 4 Oct 2026: **13** — Mock Spelling Bee · Bizzillionaire · Bee Grand Prix · Honeycomb Run · Daily Buzz ·
Beat the Buzzer · Magic Squares · Word Quiz · Bee Trivia · Type Blaster · Word Snake · Unscramble Stars ·
Spell Scene.

The spec's §0 and §3.1 say "13 to 10"; counted card by card the lineup was nine on 4 Oct, with Unscramble
Stars' slot held empty for Sound Paths. On 5 Oct 2026 the owner brought **Daily Buzz** back into that slot
("we need the guess the word of the day game back" — "its own card again" — "come back as it was"): ten.
The count here is the cards, not the round number.

On 9 Oct 2026 the owner added **Mock Analogy Bee** beside Mock Spelling Bee in Compete ("an analogy based mock
spelling bee game that we can call mock analogy bee … shrinking mock spelling bee banner to half"): eleven. It came
in by the owner's decision, not in a slot that went out, so its status reads "added" and it names no Out row. Its
home is the new Analogies tab (`analogy.js`, `#/anlbee`); Against the Clock for analogies lives in that tab, not on
the Play tab.

## Cards

| Key | Card | Door | Status | Out (what it came in for) |
|---|---|---|---|---|
| `mockbee` | Mock Spelling Bee (with Family Bee night) — a half banner since 9 Oct 2026 | Compete | kept | — (Family Bee night is a mode, in for the Spelling Duel) |
| `mockAnalogy` | Mock Analogy Bee — the other half banner (`analogy.js`, `#/anlbee`) | Compete | added (owner, 9 Oct 2026) | — (an owner addition: the count went from 10 to 11). The 4.5 brief (P0.27) asked to enter it against Hive Mind; the owner chose on 10 Oct to leave Hive Mind as it is and keep this as an owner exception. Behind tester mode until the analogy review's three rounds pass and the owner releases it |
| `gym` | Spelling Gym (name from `SB_HUB_NAMES`) | Train | in | `beat`, `magic`, `wordquiz` (its spelling rounds) |
| `lore` | Word Lore (name from `SB_HUB_NAMES`) | Train | in | `trivia` (word themes), `wordquiz` (meaning, origin and idiom rounds), `bizz` |
| `hive` | Hive Mind (name from `SB_HUB_NAMES`) | Train | in | `trivia` (general themes) |
| `dailyBee` | Daily Bee | Train | in | `daily` |
| `beeGrandPrix` | Bee Grand Prix | Play | kept | — |
| `typeBlaster` | Type Blaster (Spell Scene merged in) | Play | kept | — |
| `honeycombRun` | Honeycomb Run | Play | kept | — |
| `wordForge` | Word Forge (hidden until `SB_FORGE.signedOff`; the testing unlock shows it) | Play | in | `spellScene` |
| `dailyBuzz` | Daily Buzz — back 5 Oct 2026, as it was (`daily-buzz.js`, `#/buzz`; no level chip) | Play | in | `unscrambleStars` (its slot, held for Sound Paths until the owner gave it to Daily Buzz). The 4.5 brief (P0.26) asked to merge it into Daily Bee; the owner chose on 10 Oct to keep both |

Not in the registry: **Sound Paths** (`soundPaths`, Play). Its reserved slot (Unscramble Stars') went to Daily Buzz
on 5 Oct 2026, so when its alignment data is ready it comes in only by naming a card that goes out.

## Out

| Key | Card | Left | Why | Where it went |
|---|---|---|---|---|
| `beat` | Beat the Buzzer | 4 Oct 2026 | three drill cards trained the same skill (owner's merge) | Spelling Gym · Warm-up, Sprint, Level Challenge |
| `magic` | Magic Squares | 4 Oct 2026 | same | Spelling Gym · Squares |
| `wordquiz` | Word Quiz | 4 Oct 2026 | its spelling rounds belong where words are produced, its knowledge rounds with word knowledge | Spelling Gym · Spot the Error; Word Lore · Meanings, Origins, Idioms & Similes |
| `trivia` | Bee Trivia | 4 Oct 2026 | split in two with distinct names (owner) | Word Lore (word themes), Hive Mind (general themes) |
| `bizz` | Who Wants to Be a Bizzillionaire | 4 Oct 2026 | a ladder of word questions is a Word Lore mode | Word Lore · Ladder |
| `daily` | Daily Buzz | 4 Oct 2026 | Daily Bee teaches the word; Daily Buzz never said it | Daily Bee — and on 5 Oct 2026 the owner brought Daily Buzz back as it was, as its own card (`dailyBuzz`, above), beside Daily Bee |
| `spellScene` | Spell Scene | 4 Oct 2026 | duplicated Type Blaster (owner); its best ideas move in | Type Blaster; its card slot to Word Forge |
| `unscrambleStars` | Unscramble Stars | 4 Oct 2026 | too basic: all the letters are given, a random tapper scored 96% | its slot: Daily Buzz (5 Oct 2026) |
| `wordSnake` | Word Snake | 4 Oct 2026 | the glowing next tile spelled the word for the child | — (no replacement) |
| `memoryMatch` | ◆ Memory Match (Advanced add-on) | 4 Oct 2026 | it paid for luck | Spelling Gym · Word Doctor (a mode, not a card) |
| `rapidDictation` | ◆ Rapid Dictation (Advanced add-on) | 4 Oct 2026 | a duplicate | Spelling Gym · Champ Dictation |
| `advMock` | Advanced Mock Rounds (Advanced add-on) | 4 Oct 2026 | a duplicate | Mock Spelling Bee · Champ |
| `duel` | Spelling Duel (inside Beat the Buzzer) | 4 Oct 2026 | rebuilt as a bee | Mock Spelling Bee · Family Bee night |

## Bests and levels that moved

Store steps `v9_to_v10` (levels) and `v10_to_v11` (bests) in `store.js` carry each child's level and best from
a card that left to its new home (`tests/bests-migration.cjs`, T12): `beat` → `gym/sprint` (and its Warm-Up →
`gym/warmup`), `magic` → `gym/squares`, Spot the Spelling → `gym/spot`, Meanings / Vocabulary → `lore/meanings`,
Origins → `lore/origins`, Idioms / Similes → `lore/idioms`, Bee Trivia → `lore/roots` + `hive/classic`, its Squares →
`lore/squares` + `hive/squares`, its Beat the Clock → `lore/clock` + `hive/clock`.

## Modes (one in, one out inside a hub)

A hub records its modes here as it ships; a new mode names the weaker mode it replaces.

| Hub | Mode | In for |
|---|---|---|
| Spelling Gym | Warm-up | Beat the Buzzer's 10-Word Warm-Up (and the Word Gym tab's Daily Buzz quick action) |
| Spelling Gym | Sprint | Beat the Buzzer's 60-Second Sprint |
| Spelling Gym | Champ Dictation | Rapid Dictation (add-on) |
| Spelling Gym | Spot the Error | Word Quiz's Spellings round |
| Spelling Gym | Squares | Magic Squares |
| Spelling Gym | Word Doctor | Memory Match (add-on) |
| Spelling Gym | Level Challenge | Beat the Buzzer's Stage Challenge |
| Mock Spelling Bee | Family Bee night | Spelling Duel |
