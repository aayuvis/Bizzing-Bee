# Eponyms — complete

A 1,000-entry eponym bank feeding two things — an `eponyms` word list on the
spelling library, and a trivia chapter where every card carries the word's
origin story.

## Where it stands — DONE

`eponyms-master.json` — **1,000 of 1,000 entries, every one complete.** Record shape:

```json
{"e":"sideburns","src":"Ambrose Burnside","who":"American Civil War general (1824-1881)",
 "why":"His side whiskers were called burnsides; the halves were later swapped.",
 "mean":"Strips of facial hair grown down the sides of the face",
 "cat":"Clothing","kind":"person","lv":2,"story":"…40 words…","_todo":[]}
```

`_todo` is empty on every record. Level spread: lv1×30, lv2×109, lv3×246,
lv4×308, lv5×307.

| Output | Count | Where |
|---|---|---|
| Trivia questions | **4,093** | `trivia-q1..5.js`, theme `eponyms` |
| Word-list words tagged | **671** | `t:["eponyms"]` in `words-data.js` **and** `words-full.js` |
| New word records authored | **124** | `eponyms/lib-add-85.json`, `eponyms/lib-add-40.json` |
| Records lifted 128k → 40k core | **313** | core is now 40,902 words |

### Where each surface lives

- **Word list**: `SB_THEMES.themes` in `themes-data.js` carries an `eponyms` entry
  (`label: "Named After Someone"`, cluster `mind`). `themeWords('eponyms')`
  returns the tagged words, so it rides the same Level ladder as every other list.
  Its glyph is in the `M` map inside `themeArtSVG()` in `app3.js`.
- **Trivia chapter**: grouped under **Word chapters**, not World — the
  `wordThemes` array in `viewTrivTrain` (`app3.js`) includes `'eponyms'`.
  Icon in `trivia-icons.js`, colour in `TT_COL`.

### The ~90 entries deliberately kept out of the spelling library

Coined derived adjectives — *Kochian, Ismenean, Clothoic, Avicennaian, Buffonian*
and about eighty-five more — are **trivia-only on purpose**. They are not
dictionary headwords and would lower the quality of the spelling library. Any
future pass that adds words should apply the same test: lowercase common noun,
adjective or verb attested in a standard dictionary.

## Field meanings

- `e` the eponym; `src` the person/place it came from; `who` one line on who they were
- `why` the causal link — why this name attached to this thing
- `mean` the modern meaning; `cat` subject category
- `kind` `person` | `place` | `other` (`other` = not truly an eponym, e.g. *petunia*,
  *meerschaum*, *chintz*, *mohair*, *claret*, *gingham*, *porter*). Keep these —
  they make good "which of these is **not** named after a person?" questions.
- `lv` difficulty 1–5, matching the trivia band system in `CLAUDE.md`
- `story` ~40 words, the card back. Origin narrative, not a definition.
- `skip:true` marks entries excluded from kid-facing cards.

## Still owed

**Voice clips for the 124 new spelling words.** `deviceSpeak` falls back to
browser speech synthesis when `wordClip()` returns null, so the words are usable
today; a Google TTS pass (env `GKEY`) would give them library-quality audio and
should bump `SB_VOICE_VER`.

## Rebuild and redeploy (the whole loop, four commands)

Run from `spellbound-app/` after adding entries to `eponyms-master.json`:

```sh
node eponyms/build-eponyms.js                 # master -> out-eponyms.json + library-patch.json
cp eponyms/out-eponyms.json out-eponyms.json && node pipeline/sb-merge.js && rm out-eponyms.json
node pipeline/sb-shard.js                     # rebuilds trivia-data.js + trivia-q1..5.js
sed -i 's/?v=OLD/?v=NEW/g' index.html         # bump the cache stamp
```

**Before re-merging, strip the previous eponym questions** or they double up:

```js
const T=JSON.parse(fs.readFileSync('trivia-all.json','utf8'));
T.questions=T.questions.filter(q=>q.th!=='eponyms');
fs.writeFileSync('trivia-all.json',JSON.stringify(T));
```

Then the library tag pass (idempotent — re-run it, it only touches completed entries),
then deploy `app3.js index.html trivia-icons.js trivia-data.js trivia-q1..5.js
words-full.js` to `gh-pages` via a worktree.

## Two things to know about the data

- **`alias_of`** marks a short form that duplicates a longer term — `petri` vs
  `Petri Dish`, `richter` vs `Richter Scale`, twelve pairs in all. Both stay in the
  bank (the short form is the spelling word), but only the long form generates
  questions, or the chapter asks the same thing twice.
- **Question phrasing is Mastermind style**: describe the source by role, never by
  name. *"Which word meaning 'extreme strictness' comes from an Athenian lawmaker?"*
  — not naming Draco, who is the answer. The generator drops any clue containing its
  own answer (131 currently), so a badly-shaped template fails loudly rather than
  shipping a giveaway.
