# Bee Circuit Season 1: review round 2 (accuracy)

Reviewer: lens 2 of 3 (accuracy). Script: `circuit/script.json`, reviewed as of 10 Oct 2026. Row-level verdicts are in `r2-accuracy.json`. The script was not edited.

## Counts

| | rows |
|---|---|
| Total rows | **822** (700 on-screen lines; 122 author-facing fields and source citations, checked anyway) |
| pass | **809** (216 of these are story lines with no factual claim) |
| fix | **13** |
| fail | **0** |

A row is one string leaf of the script, plus the cast ages. Identifiers (ids, act keys, roster ids, booleans, `right` indexes) are not lines and have no rows. The four excluded sections (`authorNotes`, `suspectBoard`, `fairPlay`, `changes`) were read for context only.

## How this was checked, and its limit

- **WebFetch could not reach any host in this session.** Etymonline, Merriam-Webster, Wikipedia, Wiktionary, Britannica, Collins, BIPM and spellingbee.com all failed DNS lookup, and Bash egress was refused by the proxy.
- **Every web check therefore went through domain-scoped WebSearch** (for example `allowed_domains: etymonline.com, merriam-webster.com`). The search returned the named page and quoted it. The URLs in `sources` are the pages those searches returned and quoted. No verdict rests on memory.
- **This is one step weaker than opening each page.** Once fetch works, re-check the 13 fixes and the Case 3 donor languages against the live pages.
- **App facts were checked against the files themselves:** `mockbee.js` (BOTS, BANDS, round-one rule), `trail-data.js` and `trail.js` (act order and titles, venues, hosts), `concepts-data.js` (lesson titles), `words-data.js` and `words-data-2.js` (53,511 served words) and `eponyms/eponyms-master.json`.

## The 13 fixes

| # | Path | Problem | Fix (in the script's voice) | Key sources |
|---|---|---|---|---|
| 1 | `rounds[2].lesson` | The title is exact (gi 71), but "fer" is unit u68 in **Act V**, and Round III is Act III. This is the only round whose named lesson the child has not reached yet (brief §3.5, L5). | **Owner decision.** Suggested: `trans- / per- (across / through)` (Forum u36), with Rafi's word changed from circumference to **transfer** (trans- "across" + ferre "carry"). That word is in the library and keeps the "fer means carry" teaching. Rafi's `above` and `below` letters would change to match. | concepts-data.js, trail-data.js; [etymonline transfer](https://www.etymonline.com/word/transfer), [M-W transfer](https://www.merriam-webster.com/dictionary/transfer) |
| 2 | `rounds[3].pieces.below` | "Phantom with an f! Ask where it came from…" implies the origin answer gives the ph. English had **fantum/fantosme from Old French**, and the ph was restored from Greek *phantasma* in the late 16th century. The app's library gives phantom's origin as **French**, so asking would not produce "Greek". | "Phantom with an f! It goes back to Greek phantasma, and English put the Greek ph back. Ask where it came from, all the way back, and the word tells you its rules. — Mira" | [etymonline phantom](https://www.etymonline.com/word/phantom), [M-W phantom](https://www.merriam-webster.com/dictionary/phantom) |
| 3 | `rounds[4].pieces.pipWord.word` | **imperturbable is not in the served library.** Pip's "real meaning a tap away" has no entry to open. The meaning itself is correct. | **Owner decision.** Add the word to the library, or accept a tap that shows only a definition. The turnip joke needs this word. | words-data*.js; [M-W imperturbable](https://www.merriam-webster.com/simple/imperturbable) |
| 4 | `rounds[5].technique` | "Loanwords keep their home spelling" is stated as a rule, and Case 3 contradicts it: yogurt, samovar, hummus and catamaran are transliterated or respelled. | "Loanwords **often** keep their home spelling. Ask the language, then listen for the letters it hides, often at the end." | [Wikipedia Loanword](https://en.wikipedia.org/wiki/Loanword), [English orthography](https://en.wikipedia.org/wiki/English_orthography) |
| 5 | `cases[1].puzzle.brief` | "A word built in Greek" is not true of every answer. Acrophobia was coined in Italian in 1887 by Andrea Verga, and M-W says English borrowed it from Italian *acrofobia*. Psychology and chronology are New Latin coinages. Also, **onomatopoeia has no ph, ch or y**: its Greek mark is **oe**, the Latin rendering of Greek οι. The puzzle is not affected. | "A trail of definitions. Each answer is built from Greek parts and keeps Greek's spellings: ph for f, ch for k, y for i, oe for oi. Spell it right and it opens the next hiding place." | [etymonline acrophobia](https://www.etymonline.com/word/acrophobia), [M-W acrophobia](https://www.merriam-webster.com/dictionary/acrophobia), [etymonline psychology](https://www.etymonline.com/word/psychology), [Romanization of Greek](https://en.wikipedia.org/wiki/Romanization_of_Greek) |
| 6 | `cases[3].puzzle.brief` | "If every part is real and means what it should, the word is real" teaches a false rule. Real parts do not make a real word; recorded use does. Triskaidekaphobia is real because dictionaries record it: M-W gives first use c.1909, Etymonline gives 1908, and M-W links the 1908 use to Isador Coriat's book. | "The disputed word means 'fear of the number thirteen'. Rebuild it from its Greek parts, then build four more like it. If every part is real and adds up to that meaning, the word was built properly. Then find where the dictionary's page went." The plot holds: reveal[1] finds the folded page. | [M-W](https://www.merriam-webster.com/dictionary/triskaidekaphobia?pronunciation=&lang=en_us&file=triska02.wav), [etymonline](https://www.etymonline.com/word/triskaidekaphobia), [M-W Word of the Day](https://www.merriam-webster.com/word-of-the-day/triskaidekaphobia-2019-10-13) |
| 7 | `visitors[0].card` (Atlas) | The card implies Mercator named his book after the Titan who holds up the sky. Mercator himself said he named it for **Atlas, "King of Mauritania, a learned philosopher, mathematician, and astronomer"**. One bibliographic note says the 1595 frontispiece shows the king, and the Titan-with-globe image came later. | "To the ancient Greeks, Atlas was a Titan who held up the sky. Later tellings made him a wise king of Mauretania who studied the stars. In 1595 Gerardus Mercator named his book of maps Atlas in that king's honour, and the word came to mean any book of maps." | [Crouch Rare Books](https://crouchrarebooks.com/browse/the-first-edition-of-the-first-atlas-to-be-so-named/?print=pdf), [Wikipedia Atlas (mythology)](https://en.wikipedia.org/wiki/Atlas_(mythology)#King_of_Mauretania), [Britannica atlas](https://www.britannica.com/topic/atlas-maps#ref21651), [LoC 1595 Duisburg](https://www.loc.gov/item/map55000728/) |
| 8 | `visitors[5].word` | The library and `eponyms-master.json` both spell it **tantalize**. §10 shows a visitor only where its word is on a stop's list, so with "tantalise" **this visitor can never appear**. Both spellings are correct English. | `tantalize` | words-data*.js, eponyms-master.json |
| 9 | `visitors[5].card` | Same spelling issue. The facts are correct (Odyssey 11; Tantalus in Hades; the water drains away and the wind lifts the fruit). | "…To tantalize is to keep what someone wants just out of reach." | [Theoi Odyssey 11](https://www.theoi.com/Text/HomerOdyssey11.html), [etymonline tantalize](https://www.etymonline.com/word/tantalize) |
| 10 | `visitors[6].card` (Hypnos) | Braid did not name hypnotism "after" the god: he formed it from Greek *hypnos*, "sleep" (Etymonline). "In 1843 … named" is also disputed. Etymonline dates neuro-hypnotism to 1842 and hypnotism to 1843 and credits Braid. Wikipedia says d'Hénin de Cuvillers coined the hypn- terms around 1820 and Braid only popularised them, though Wikipedia flags that claim [citation needed]. | "To the ancient Greeks, Hypnos was the god of sleep. In the 1840s the Scottish surgeon James Braid made the word hypnotism popular, from hypnos, the Greek word for sleep, believing it was a kind of sleep. It isn't, but the name stuck, and hypnosis followed." | [etymonline hypnotism](https://www.etymonline.com/word/hypnotism), [Wikipedia Hypnosis](https://en.wikipedia.org/wiki/Hypnosis), [Britannica hypnosis](https://www.britannica.com/science/hypnosis) |
| 11 | `visitors[12].card` (Vulcan) | "Italian named burning mountains after him" takes one side of a disagreement. Etymonline says Italian *vulcano*. M-W says "Italian or Spanish; Italian vulcano, **from Spanish volcán**". | "To the ancient Romans, Vulcan was the god of fire and the forge. His Latin name, Vulcanus, became the word for a burning mountain in Italian and Spanish, and English borrowed it: volcano." | [etymonline volcano](https://www.etymonline.com/word/volcano), [M-W volcano](https://www.merriam-webster.com/dictionary/volcanoes) |
| 12 | `visitors[19].card` (Frigg) | "They still argue about it" reads as if Friday's namesake were unsettled. It is not: Old English *frīgedæg* clearly names Frige. What scholars still debate is whether Frigg and Freyja were once one goddess. | "…The Roman day of Venus became her day: Friday. Freyja, a goddess of love, matches Venus more closely, and scholars still debate whether the two were once one goddess." | [etymonline Friday](https://www.etymonline.com/word/Friday), [Wikipedia Friday](https://en.wikipedia.org/wiki/Friday), [Wikipedia Frigg](https://en.wikipedia.org/wiki/Frigg) |
| 13 | `visitors[20].sources[0].ref` (citation) | Gibbon's sandwich line is right, but the day is disputed. The Oxford Companion to Food gives 24 Nov 1762; the OED citation and The Word Histories give 14 Nov. The on-screen card says only "by 1762", which is correct. | Cite the month, or check the 1841 edition of the journal. | [ckbk/Oxford Companion](https://app.ckbk.com/reference/food77337c19s001e066), [Grammarphobia](https://grammarphobia.com/blog/2013/11/sandwich.html) |

## The claims the brief singled out, and what they came to

- **Case 3 loanwords** (the author wrote these mostly from memory): **all correct** as "the language English borrowed each one from".
  - safari: Swahili. yogurt: Turkish. samovar: Russian. hummus: Arabic. piano: Italian. catamaran: Tamil (OED). café and ballet: both French.
  - **S-T-R-A-I-T holds**, in the note's order, and French is the pair.
  - The library's origin fields agree with all eight.
  - **Risk:** by *ultimate* origin, safari is Arabic, ballet is Italian and café is Turkish or Arabic, and the puzzle breaks. The brief's on-screen definition is what keeps it fair. It must stay, and the "Ask Ines" hint must give the immediate donor.
- **Case 1 silent letters:** all eleven are verified, ten from M-W's A–Z silent-letter article and foreign from M-W's pronunciation ˈfȯr-ən. **colour/color:** both correct. M-W credits Webster's 1828 dictionary with the deliberate u-less American spellings.
- **Case 2:** all ten answers come from Greek and every gloss checks. Only the brief's wording needed fixing (fix 5).
- **Case 4:** treis, kai, deka, treiskaideka and New Latin -phobia are all as M-W gives them. Decathlon, trilogy, pentagon and octopus all check. Only the "real parts, real word" rule needed fixing (fix 6).
- **Case 5:** all ten statements check. confidant vs confident is right (M-W). dependable and importance are the correct forms of the two deliberate misspellings.
- **Greek spelling rule (Round IV):** accurate as hedged with "often". φ→ph, χ→ch and υ→y are the traditional Latin transliterations. The rhythm fake tip and its correction are both right.
- **Fake tips:** both (seperate, rhithm) are corrected on screen and by the bee-file truth line. separate is from Latin *separare* (se- + parare).
- **Pip:** eight deliberate misuses and one correct use. Every `real` meaning matches M-W.
- **Scripps practice:**
  - The speller's six requests and "the Pronouncer has to answer" match the 2026 Scripps rules.
  - Saying the word before and after spelling is expected, but leaving it out does not disqualify a speller.
- **Units:**
  - **newton**: the 9th CGPM (1948), Resolution 7, adopted the name (NIST SP 330, BIPM).
  - **curie**: named in Brussels in 1910, by the radium standards committee meeting alongside the radiology congress, in honour of Pierre. Some took it to honour Marie too. The card states this correctly.
- **Months and days:** June (Ovid, *Fasti* 6, three goddesses and no verdict), January, March and martial, Tuesday, Wednesday (its silent d is in M-W's list) and Thursday are all correct.
- **People:** Sax (1814–1894; patent 28 June 1846) and Diesel (1858–1913; patent 1892; working engine 1897) check.
  - Sandwich: 1718–1792; first use 1762 (Gibbon); the Grosley story is unproven; Rodger, 1993.
  - Cardigan: 1797–1868; the first use is dated between 1856 and 1868 depending on the source, so "by the 1860s" holds; he did not invent it.
  - Newton: 1643–1727 New Style; the author's note on the Old Style date is correct.
- **Gods** (Hermes and hermetic, Iris, Echo, Pan, Psyche, the Titans, Ceres, Fortuna, Mercury): all check against Etymonline, M-W and Britannica, and all are framed as what the ancients believed.
  - Optional for Echo: Wikipedia notes that the "repeat only the last words" curse may be Ovid's own invention. "Later retold by Ovid" is not wrong, but "in the Roman poet Ovid's telling" would be tighter.
- **"Penrallow":** two searches, one of them extended, found **no real person, brand, company or author** of that name. Results only returned Penhallow, a Cornish hamlet and surname with a different spelling. "Ravenmere Academy" also matched nothing real. Low risk.
- **App facts:**
  - All ten rivals' names, ages and tells match `mockbee.js` BOTS exactly.
  - Specialities, the round-one forgiveness rule and field sizes (5, 7 or 9 spellers) match.
  - Venues match `trail.js`, and the nine host names match the region guides.
  - All nine lesson titles are exact matches in `concepts-data.js`. The Finish Arch is in the eighth region.
  - The Team Night caller logic matches the specs.

## For the owner to decide

1. **The app's library contradicts the Greek trail on its own engine.**
   - Case 2 runs on Word Lore · Origins, but the served library gives non-Greek origins for five of its ten words: **hyphen "English", chorus "Latin", echo "Latin", psychology "French", rhythm "Latin"**.
   - The library also has **phantom "French"** and **triskaidekaphobia "English"**.
   - If the engine or the "Ask Mira / Ask the Pronouncer" hint reads `o`, the season contradicts itself on screen.
   - The script is right and the library is the problem. Fix the library's origins for these words, or have the case show the authored origin.
2. **Words the script uses that the served library lacks:**
   - **imperturbable** (Pip, fix 3).
   - **dependable** (Case 5's correct answer).
   - **café** (the library has *cafe*).
   - **tantalise** (the library has *tantalize*, fix 8).
3. **The Round III lesson is two acts ahead** (fix 1): accept it, or switch to trans-/per- with transfer.
4. **A `note` key that is on screen.** `authorNotes` says "every *Note / note field is author-facing; never render them", but `cases[2].puzzle.note` is **Kwame's on-screen note** (the eight loanwords). A renderer that follows the rule literally will hide the puzzle. Rename the key, or exempt it.
5. **The Ravenmere twins' tell** reads "spells in step with a twin, one letter each" in the script and "spell in unison, one letter each" in §4.2. The script's wording is more coherent, but test 11 compares against §4.2, so pick one.
6. **Re-verify the fixes against the live pages once WebFetch works.** This session could only search, not fetch.
