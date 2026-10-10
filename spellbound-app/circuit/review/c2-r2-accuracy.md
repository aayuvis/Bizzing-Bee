# Bee Circuit Season 1: review cycle 2, lens 2 (accuracy)

**Reviewer:** lens 2 of 3 (accuracy), cycle 2.
**Script:** `circuit/script.json`, reviewed as of 10 Oct 2026. Row-level verdicts are in `c2-r2-accuracy.json`. The script was not edited.

## Counts

| | changed paths (122) | extra rows (13) | total (135) |
|---|---|---|---|
| pass | 112 | 11 | **123** |
| fix | 10 | 2 | **12** |
| fail | 0 | 0 | **0** |

The 13 extra rows are:
- `rounds[4].pieces.pipWord.real`: the word changed under this meaning, so it is checked as part of the Pip change.
- `visitors[20].sources[0].ref`: cycle-1 fix 13.
- The 11 `build` entries.

All 13 cycle-1 fixes were re-checked. Each row carries `cycle1Fix: n`.

Methods across the 135 rows:

| Method | Rows |
|---|---|
| Web search | 39 |
| App data | 47 |
| No factual claim | 49 |

## How this was checked, and its limit

**Fetch still fails in this session.** I tried WebFetch on these pages, and each one returned `getaddrinfo ENOTFOUND`:
- etymonline.com/word/xylophone
- en.wikipedia.org/wiki/Xylophone
- merriam-webster.com/dictionary/xylophone

`curl` through the proxy got `CONNECT tunnel failed, response 403`.

**Every web check therefore used domain-scoped WebSearch**, restricted to etymonline.com, merriam-webster.com, wikipedia.org, britannica.com, wiktionary.org, perseus.tufts.edu, theoi.com and spellingbee.com. The URLs in `sources` are the pages those searches returned and quoted. This is the same one-step-weaker method as cycle 1. The owner question `accuracy-reverify` stays open until a session can open pages.

**App facts were checked against the files:**
- `mockbee.js`: BOTS, BANDS, CHAIR, Q_COST, record(), mbAddMissed.
- `app3.js`: trickAnal, TRICK_LABELS, spellDiff.
- `concepts-data.js`, `trail-data.js` and `trail.js`.
- `words-data.js` and `words-data-2.js`: 53,511 words, loaded with node.
- `eponyms/eponyms-master.json`.
- `gym.js` and `lore.js`.

`tools/circuit/validate.cjs` runs clean (FAIL 0).

## The 12 fixes

| # | Path | Problem | Fix | Key sources |
|---|---|---|---|---|
| 1 | `visitors[0].card` (Atlas) | Cycle-1 fix 7 is right about the king, but the new sentence says "In 1595 Gerardus Mercator named his book". **Mercator died on 2 December 1594.** His son Rumold published the Atlas in 1595, after his death. The LoC catalogue says it was "left unfinished by the author … edited and published by his son, Rumold Mercator, in 1595". | "…Gerardus Mercator named his book of maps Atlas in that king's honour. It came out in 1595, the year after he died, and the word came to mean any book of maps." | [Britannica Mercator](https://www.britannica.com/biography/Gerardus-Mercator), [Wikipedia Mercator](https://en.wikipedia.org/wiki/Gerardus_Mercator), [LoC 1595 Atlas](https://www.loc.gov/item/map55000728/), [Wikipedia Rumold Mercator](https://en.wikipedia.org/wiki/Rumold_Mercator) |
| 2 | `build[id=case-origins-authored]` | **(a)** Case 2 has dropped echo, psychology and rhythm. Only three of its items (hyphen, chorus, cylinder) are non-Greek in the library, so the test's "five items read non-Greek" is stale. **(b)** Case 3's list of earlier sources to keep out of the answer choices is incomplete (details after this table). | Full replacement text is in the JSON row. The choices list becomes: **cafe**: no Italian, Turkish or Arabic. **ballet**: no Italian, Latin or Greek. **piano**: no French or Latin. **catamaran**: no Hindi or Malayalam. The test becomes "three items (hyphen, chorus, cylinder)". | [M-W café](https://www.merriam-webster.com/dictionary/caf%C3%A9), [Etymonline coffee](https://www.etymonline.com/word/coffee), [M-W ballet](https://www.merriam-webster.com/dictionary/ballet), [Etymonline ballet](https://www.etymonline.com/word/ballet), [M-W piano](https://www.merriam-webster.com/dictionary/piano), [Etymonline pianoforte](https://www.etymonline.com/word/pianoforte), [Etymonline catamaran](https://www.etymonline.com/word/catamaran), [OED catamaran](https://www.oed.com/dictionary/catamaran_n) |
| 3–7 | `cast.ash.tell`, `cast.aria.tell`, `teamNight.ravenmereRoster[1].tell`, `teamNight.ravenmereRoster[2].tell`, `teamNight.beats.ravenmere` | The text matches §4.2 (the cycle-1 decision), but it contradicts itself. M-W gives **"in unison" = "together, at the same time"**, so twins cannot spell in unison *and* take one letter each. In a spelling app the word is taught wrong. | "spell as a pair, one letter each" (in the beat: "spell as a pair, a letter each"). Change §4.2 and §8.1 in the same commit. validate.cjs reads §4.2, so it stays green. **Owner call**, since it revisits a decision. | [M-W unison](https://www.merriam-webster.com/dictionary/unison) |
| 8 | `rounds[4].pieces.pipWord.real` | The meaning ("calm; impossible to upset or fluster") was written for imperturbable and kept when the word became unflappable. M-W's learner's entry says "**not easily** upset: unusually calm in difficult situations". "Impossible" overstates it, and Kwame cracks in this round. | "calm; not easily upset or flustered" | [M-W unflappable](https://www.merriam-webster.com/simple/unflappable), [M-W flappable](https://www.merriam-webster.com/wordplay/kempt-couth-ruly-gruntled/flappable) |
| 9 | `slotLines.weak.byFamily.vow` | app3's `vow` family is ie/ei order, ough/augh and three-vowel runs (TRICK_LABELS: "Tricky vowels"). It is not schwa or unstressed vowels. "You guess the quiet vowels" misnames the error the child made. | "You mix up vowel teams like ie and ei." | app3.js:194, :222–224 |
| 10–11 | `slotLines.weak.byRound.2`, `.byRound.5` | These print only when the bee file shows **no** real miss. They state a weakness the record does not hold ("You skip the suffix."). That breaks build[id=no-placing] and makes Round IV's card ("V. always knows your weak spot") untrue for that child. | Say it as advice: "Ask. Don't guess." and "Never skip the suffix." Both read naturally inside both V. notes. | build[id=slots], build[id=no-placing], rounds[3].pieces.clue |
| 12 | `hivePost.beeFileIntro` | "Missed words go to your revision pile." In today's Mock Bee they don't, on their own: `mbAddMissed` runs from a button, and the code calls it "the child's own filing" (mockbee.js:1388, :1860). §9 says they are added, but no build entry makes that happen. | Add a build rule for §9's auto-add, or reword: "…One tap puts your missed words on your revision pile." | mockbee.js:1388–1396, :1860; BEE-CIRCUIT.md §9 |

**Details for fix 2(b), the Case 3 earlier sources:**
- **cafe:** M-W gives café from French, from Turkish *kahve*, and coffee comes from Arabic *qahwa*. Arabic is an earlier source, and it is on screen as hummus's answer.
- **ballet:** the chain runs through Latin *ballare* (M-W), and Etymonline goes back to Greek *ballizein*.
- **piano:** M-W gives Italian, short for pianoforte, ultimately from Latin *planus*. Etymonline gives "French piano (18c.), Italian piano", and French is the case's two-word answer.
- **catamaran:** Etymonline gives "from Hindi or Malayalam, from Tamil".

## The 13 cycle-1 fixes, re-checked

| # | Path | Result |
|---|---|---|
| 1 | `rounds[2].lesson` | **Holds.** The title is exact (ch. 31). Unit u36 is in Act III, Forum. transfer = trans- "across" + ferre "carry" (Etymonline, M-W). per- = "through" (Etymonline). transfer is in the library. |
| 2 | `rounds[3].pieces.below` | **Holds.** Etymonline: "the ph- was restored in English late 16c." M-W says the same. |
| 3 | `pipWord.word` | **Holds.** unflappable is in the library (y8). But its `real` meaning needs fix 8. |
| 4 | `rounds[5].technique` | **Holds.** Wikipedia (English orthography): loans are mostly kept now, but early French ones were respelled. |
| 5 | `cases[1].puzzle.brief` | **Holds.** acrophobia was coined in Italian (M-W "borrowed from Italian acrofobia"; Etymonline: Verga 1887). Classical Latin wrote οι as oe (Wikipedia). |
| 6 | `cases[3].puzzle.brief` | **Holds.** M-W gives c.1909 and Etymonline 1908; both say New Latin from Greek treiskaideka. |
| 7 | `visitors[0].card` | **New error found:** Mercator died in 1594 (fix 1 above). |
| 8 | `visitors[5].word` | **Holds.** tantalize is in the library and eponyms-master; tantalise is in neither. BEE-CIRCUIT.md §10 still says "tantalise". |
| 9 | `visitors[5].card` | **Holds.** Odyssey 11 (Theoi). Britannica: Tantalus was king of Sipylus or Phrygia, and the wind kept the fruit out of reach. M-W definition. |
| 10 | `visitors[6].card` | **Holds.** Etymonline: hypnotism 1843 (Braid); hypnosis 1850 (Etymonline) or 1876 (M-W), so "followed" is right. Britannica: hypnosis resembles sleep "only superficially". Braid was a Scottish surgeon. |
| 11 | `visitors[12].card` | **Holds.** Etymonline: from Italian. M-W: Italian from Spanish, and its volcan entry routes Spanish through Portuguese. The card picks no route. |
| 12 | `visitors[19].card` | **Holds.** Britannica: highest of the Asynjur. Etymonline: queen of heaven. M-W: frīgedæg, translating dies Veneris. Wikipedia: the common-origin debate. |
| 13 | `visitors[20].sources[0].ref` | **Holds.** 14 Nov (1841 edition, OED via Grammarphobia) vs 24 Nov (Oxford Companion via ckbk, PBS). |

**Case 3 donors, re-checked:**
- **safari:** Swahili.
- **yogurt:** Turkish.
- **samovar:** Russian.
- **hummus:** Arabic.
- **piano:** Italian, per M-W.
- **catamaran:** Tamil, per OED, Collins and Wiktionary.
- **cafe:** French.
- **ballet:** French.

S-T-R-A-I-T still holds. `cafe` is an M-W variant of café, so the spelling is correct.

## New content verified (pass)

- **xylophone** (1866): from Greek *xylon* "wood" + *phōnē* "sound" (Etymonline, M-W). "Wood sound" is right. "x for z": word-initial x is usually /z/ (Wikipedia, X).
- **chorus:** *khoros*, "band of dancers and singers", is LSJ's sense II (Perseus). Britannica: the parodos opens the play and the stasima are choral odes sung and danced between episodes. "Between the scenes" is a fair simplification.
- **microphone:** from *mikros* "small" + *phōnē* (Etymonline). Coined in the 1680s; the electrical sense dates from 1878 (M-W).
- **cylinder:** Greek *kylindros*, "a cylinder, roller, roll", from *kylindein* "to roll" (Etymonline, Wiktionary).
- **The oe note:** see cycle-1 fix 5.
- **Lesson title:** `trans- / per- (across / through)` is exact, and validate.cjs checks it.
- **Library words:** unflappable (y8), reliable (y3), cafe (y2), tantalize (y7), transfer (y1), xylophone (y7) and microphone (y5) are all in the served library. cylinder and chorus are too, but with the library origin "Latin"; the build rule covers them.
- **Team Night `callRules`:** "the first language I name is the call: French, from Latin, is a French word." This matches dictionary chain order (M-W ballet: "borrowed from French … itself borrowed from Italian"), rules[4] and both drama beats. Rafi and Mira are at the 8–10 lectern; Kwame and Ines are at 11–15.
- **Tantalus card, Mira's letter:** pass (see the cycle-1 table above).
- **Other app facts:**
  - "Écoute la fin" is correct French (Wiktionary).
  - Ballet's t is silent (M-W ba-ˈlā; Cambridge).
  - confidant means "one to whom secrets are entrusted" (M-W).
  - The six Chair requests match the 2026 Scripps suggested rules, and "Ask five" leaves out "say it again".
  - The Finish Arch is the eighth hall, and the Root Throne and Trickster's Gate are the right venues (trail.js).
  - All 27 hall-field lists match mockbee BANDS plus headliners.
  - None of the 19 V. notes has a misspelling, so the clearing card's claim holds.

## For the owner

1. **Twins' tell:** "in unison" contradicts "one letter each" (fixes 3–7). This revisits your cycle-1 choice, and §4.2 has to change with it.
2. **Catamaran donor:**
   - The homeLanguageNote says home languages follow Merriam-Webster, but **M-W's catamaran entry could not be retrieved**.
   - Etymonline gives "Hindi or Malayalam, from Tamil"; OED, Collins and Wiktionary give Tamil.
   - Open the M-W entry once fetch works. Keep Hindi and Malayalam out of the choices either way.
3. **App data outside the script:**
   - The library gives unflappable the origin "Latin". It is an English formation, 1954/1957 (M-W, Etymonline).
   - eponyms-master.json's **atlas** story still says Mercator put the sky-holding Titan on the cover in 1595. That is the claim cycle 1 corrected, so keep it out of the Visitors' Book.
   - BEE-CIRCUIT.md §10 still lists "tantalise".
4. **Re-verify with opened pages** (`ownerQuestions[id=accuracy-reverify]`): still open. This session could search but not fetch.
