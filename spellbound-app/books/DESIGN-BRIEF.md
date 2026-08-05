# BIZZING BEE — The Library · Claude Design Brief

**For:** Claude Design (illustration, character art, book art direction)
**Deliverable:** art direction, character sheets, world plates and a full template kit for
a **17-book graphic-novel-style study library** for young competitive spellers.
**Companion product:** the Bizzing Bee app — same universe, same cast, same design
tokens. The books should feel like the app came to paper.
**Reference material in the repo:** working generated versions of all 18 books
(`books/book-01.html … book-17.html`, ~970 pages) show every page type with real
content flowed in. They are the floor, not the ceiling — your job is to take them from
"handsome generated workbook" to "graphic novel a kid picks up on purpose."

---

## 1. The product

Bizzing Bee is a spelling-bee training universe for kids 8–15: an offline-first app with
a 122-chapter concept course, a 43-chapter Advanced Pack, 128,000 recorded words, a
story saga with playable games, and a cast of bee characters. The Library brings that
curriculum to print: fifteen course volumes (ten general, five advanced) plus two
collections (similes & idioms; quotable quotes). Content — chapters, definitions,
puzzles, quotes — is **generated into the pages from live app data**, so the design
must be delivered as a *template kit and asset library* the generator can flow content
into, not as hand-laid one-off spreads.

**Tone:** warm, funny, confident, coach-like. Never clinical, never worksheet-grey.
Reference shelf: Brain Quest, Usborne, DK, Highlights — with the energy of a Saturday-
morning cartoon.

## 2. How these kids learn — ten principles every page must obey

These are field results from the app, not guesses. Design to them.

1. **Concept-first beats list-first.** Each chapter is ONE Big Idea that explains a whole
   family of words ("Latin in- assimilates — the doubled letter reveals the hidden
   prefix"), then a champion's method, then cards, then drills. Kids retain the family,
   not the list. Every chapter page leads with the idea in a character's voice; a word
   table never opens a page.
2. **Difficulty means trickiness, not rarity.** The curriculum ramps by *why* a spelling
   is hard — silent letters, sound-alike endings, French/Greek patterns, name-based
   spellings — and studies concept-mates together. Art should reinforce the concept
   family (a recurring visual motif per trap).
3. **Hand + mouth beat eyes.** The core interaction is "say it, spell it OUT LOUD, then
   write it" on a dashed line. Every practice element needs a physical action: write,
   circle, draw a line, trace.
4. **Sneaky practice works.** Kids happily drill inside a game. Every chapter ends in a
   puzzle built from that chapter's own words — crossword, word search, or scramble.
   Answer keys live in the back behind a "No peeking until you've tried" page.
5. **Small rewards, visible progress.** Paper equivalents of the app's coins and
   heatmaps: circle-the-bubble word lists, sticker spots, "I own this chapter" badges,
   a progress path across section dividers.
6. **Pass, then win back what you missed.** Mastery in the app is an 80% gate plus a
   revision loop. Mini-checks in the books route kids back ("missed one? It's waiting
   on page 12") rather than ending in a score.
7. **Distraction is a feature.** "Bee Break" boxes — a quote, a simile, or an idiom with
   its meaning — are beloved. One per spread-pair, never two; they are a breather that
   still feeds vocabulary.
8. **Coach voice.** Short, punchy, imperative, contractions everywhere. "Don't argue
   with French. Memorize it." Headlines under eight words.
9. **Two notations, side by side.** Words carry the friendly respelling
   (`ih-ruh-FYOO-tuh-buhl`) AND IPA (`ˌɪrəˈfjutəbəl`). Real study lists use phonetic
   notation, so the books normalize reading it early.
10. **Audio is one tap away.** Every word in every book has real recorded audio in the
    app. Pages reference it ("hear it in Word Coach"); chapter-level QR codes are a plus.

## 3. Series structure — 18 books, one system

Every volume owns an accent color pair, a background texture from the app's cover-card
families (rings / stripes / dots / grid / diag / cross), a **guide character** from the
app's avatar cast, and a **world** from the saga's art plates. A shelf of these must
read instantly as one series.

| Vol | Title | Content | Guide | World |
|---|---|---|---|---|
| 1 | Lift-Off! | Bee basics (11 chapters) | Honeypot | Meadow / hive |
| 2 | The Rulebook | Rules & word formation (12) | Waggle | Library |
| 3 | Latin Launchers | Latin prefixes (15) | Bumble | Roman forum *(new plate)* |
| 4 | Greek Lightning | Greek & number prefixes (10) | Star | Elements |
| 5 | Endings That Win | Suffixes & closers (13) | Diva | Stage / spotlight |
| 6 | Root Camp: Latin | Latin root families (11) | Drone | Engine / workshop |
| 7 | Root Camp: Greek | Greek root families (10) | Clover | Origami / temple |
| 8 | The World Tour | French, Italian, Celtic loanwords (15) | Nectar | Strait / voyage |
| 9 | Subject Sprints | Subject-area vocabulary (17) | Lumen | Junkyard-of-everything |
| 10 | Word Personalities | Personality themes (8) | Jester | Vibe |
| 11 | The Playbook *(ADV)* | Bee-day procedure + deep orthography (9) | Queen Hive | Warfield → stage |
| 12 | Schwa Country *(ADV)* | The vanishing vowel (7) | Blossom | Greysea — fog **is** schwa |
| 13 | Letters Behaving Badly *(ADV)* | Doubles, silents, liars (7) | Propolis | Junkyard |
| 14 | The Grand Trunk Road *(ADV)* | South Asian words in English (11) | Naga | Grand Trunk Road *(13th world)* |
| 15 | Far-Flung Words *(ADV)* | Origins beyond the big four (11) | Mic | Strait / world map |
| 16 | The Word Factory *(ADV)* | How words are built (9) | Maestro | Engine |
| 17 | As Busy as a Bee | The simile & idiom collection | Popcorn | All worlds, one per section |
| 18 | Say It Like a Champion | The quotable-quotes collection | Melody | Stage / sky |

Advanced volumes are visibly "bigger siblings": denser practice benches (16 write-in
words per chapter vs 8), deeper clue language, slightly more grown-up furniture — same
system, higher octane.

## 4. The graphic-novel system (the heart of this brief)

### 4.1 The storyboards already exist
Every course chapter ships with a **six-scene narrated script** (`concept-scripts.js`,
`SB_ADV_CSCRIPT`) — each scene has a **mood** (happy, think, oops, excited, love), a
spoken line, and a visual payload (a word breakdown, a glyph, a list). These are the
panel-by-panel storyboards:

- **Chapter opener = a one-page comic strip** (3–5 rounded panels). The volume's guide
  acts the scene beats: mood drives pose and expression, the scene's payload becomes the
  in-panel blackboard/prop, the spoken line compresses to a speech bubble. The *oops*
  scene is the villain moment; the *excited* scene is the win.
- **Vex, the recurring antagonist** (from the app's saga), personifies each trap — he IS
  the silent letter, the schwa fog, the sound-alike ending. He schemes, he fails, he
  sulks. Kids should root against him and secretly love him. He needs a full pose sheet
  (scheme, pounce, backfire, sulk, grudging respect).
- **The guide is on every spread.** Full pose on openers and puzzle pages; a small
  corner cameo (head + one gesture) on practice pages so work space stays clean.

### 4.2 Panel grammar
- Rounded panels (14pt radius) on the lavender paper; gutters ≈ 0.12 in.
- Speech bubbles use the app's white card + hairline token, tail style as in the
  existing how-to pages; shout bubbles and thought clouds as variants.
- Warm ink outlines and proportions must match the existing avatar construction
  (120×120 viewBox SVG set) so print art and app art are one family.
- Sound-effect lettering kit (BZZZ!, POP!, UH-OH!) in Baloo 2 with accent fills.

### 4.3 Worlds
Section dividers are full-bleed world spreads with the guide traveling through them;
practice pages carry only a light footer strip of the world. The saga plates (library,
elements, origami, junkyard, greysea, strait, engine, vibe, warfield…) are the base;
one new plate is commissioned in this brief (Roman forum for Vol. 3).

## 5. Design system

### 5.1 Tokens (the app's — non-negotiable)
- Paper `#f3efff` (lavender) · Card `#ffffff` · Hairline `#ddd4f2`
- Chip `#e6defc` / chip ink `#4a3aa0` · Ink `#241E33` · Muted `#6b6482`
- Treasure gold `#F0B429` / tint `#FFF3D6` / deep `#8A5B00` — reserved for Bee Breaks
  and reward moments
- Per-volume accent pairs as listed in §3; the dark "pro move" box is ink `#241E33`
  with treasure-gold emphasis.

### 5.2 Type (all SIL OFL, bundled in `fonts/`)
- **Display:** Baloo 2 (800). Big, chunky, warm.
- **Kickers / labels:** Fredoka (600), letterspaced caps.
- **Body:** Hanken Grotesk (variable) — the app's body face.
- Tabular numerals wherever kids fill answers; minimum body ≈ 10 pt print.

### 5.3 Texture
Honeycomb and the six cover-texture families at low opacity; sticker-style soft shadows
(`0 3px 10px rgba(108,79,224,.07)`); nothing flat-grey, nothing photographic.

## 6. Format & print specs

- Trim **8.5 × 11 in**; bleed 0.125 in; safe margin 0.5 in, binding side 0.75 in.
- Pages are print-true HTML rendered to PDF by the generator; an automated audit
  rejects any page whose content exceeds the 11 in height. **Templates must declare
  content budgets** (e.g., practice card ≤ 1.35 in tall, six cards per column max).
- Full CMYK for offset; RGB PDFs for digital/Canva import; a B/W-safe, no-bleed
  home-printer variant is required.
- Deliver art as **layered SVG with stable ids** (not flattened raster) so the
  generator can place, tint and scale it.

## 7. Page templates & furniture

Templates that exist and need art elevation (keep their content budgets):

1. **Cover** — volume gradient + texture, guide hero, title, three stat pucks.
2. **How-to** ("Five moves, no fluff") — guide speech bubble + numbered move cards.
3. **Chapter opener** — becomes the comic strip page (§4.1) plus a condensed Big
   Idea panel, the dark **Pro Move** box, and 4–6 sticky-note cards.
4. **Practice Hive** — 8 write-in word cards per page: headword, respelling, meaning,
   💡 memory hook, dashed write-line.
5. **Rapid Round** — compact one-liner word rows, two columns.
6. **Puzzle pages** — crossword (numbered grid, across/down clues from definitions with
   the answer masked), 13×13 word search (8 directions), scramble & rescue (unscramble
   + missing vowels). Guide hosts each.
7. **Bee Break** — treasure-tint box: quote / simile / idiom rotation.
8. **The Big List** — alphabetical, four columns, circle-the-bubble ownership marks.
9. **Answer key** — "No peeking until you've tried."
10. **Colophon** — guide sign-off + the non-affiliation note.

New furniture wanted: section-divider world spreads, sticker/reward sheet, "I own this
chapter" badge row, progress path, and **spot illustrations for ~40 recurring concepts**
(silent letters, schwa, doubling, the softening h, the eponym portrait frame, the
assimilating prefix, the French -que ending…). These spots repeat across all volumes and
become the series' iconography.

## 8. Book 16 — *As Busy as a Bee* (the simile & idiom collection)

- **Content:** all **350 similes** and a **240-idiom hall of fame**, each with a
  one-line meaning and a one-breath origin story ("From ships called icebreakers that
  crack frozen waterways…"). Guided by Popcorn. This is a reader, not a workbook.
- **The art opportunity:** this is the most illustration-dense book of the series.
  Each spread illustrates 2–3 entries **literally vs figuratively** — "raining cats and
  dogs" drawn literally in a panel while the guide holds an umbrella and an eyebrow.
- **Interactives:** match-the-halves rounds (phrase ↔ meaning), "finish the simile,"
  and **draw-it-literally pages** with big empty panels ("your masterpiece here").
- **Sections** travel through the saga worlds — animal similes in the meadow, food
  idioms in the market, weather in greysea.

## 9. Book 17 — *Say It Like a Champion* (the quotable-quotes collection)

- **Content:** twelve themed chapters — Keep Going, Be Brave, Do the Work, Back
  Yourself, Dream Big, Stay Curious, Love Learning, Imagine It, Make Things, Be Kind,
  Bring Friends, Laugh a Little — of twenty curated quotes each, drawn from a 5,174-
  quote kid-safe library. Every quote carries author, role, and a "🐝 For spellers:"
  meaning strip written for this book. Guided by Melody.
- **Chapter openers as comic beats:** the guide faces the theme (nerves before the
  microphone = Be Brave) in a short strip, then the hero quote lands full-width.
- **Portraits:** stylized, non-likeness emblem spots (a lightbulb for the inventor, a
  telescope for the astronomer) — never realistic likenesses of real people.
- **Interactives:** who-said-it match rounds and "your turn" lined pages — *"Write a
  line of your own. Sign it. Date it. Future-you will want proof."*
- Framing device: kids are collecting voices for their own bee-day — the last page is
  "your line" alongside the greats.

## 10. Content pipeline — what flows vs what's drawn

The generator (`books/mkbooks.js`, `books/mkbooks-collections.js`) flows all text from
live app data — chapters, words, meanings, hooks, respellings, IPA, quotes, similes —
with **seeded, reproducible** puzzle generation and the automated page-fit audit.
Claude Design delivers **assets, not final pages**: pose sheets, world plates, panel
frames, spot illustrations, furniture — as SVG with stable ids and declared sizes. To
set the bar, hand-compose 2–3 sample spreads per book type first; we then encode them
as templates.

## 11. Accessibility

- Dyslexia-considerate throughout: left-aligned, generous leading, ~.02em letter
  spacing, no justified text, high text/paper contrast.
- Body ≥ 10 pt print (set larger in any younger-band variant); big clear answer lines.
- A high-contrast B/W PDF variant ships alongside the color edition.

## 12. Licensing & compliance (load-bearing — do not drift)

- Definitions, sentences, hints, lesson scripts, meanings and commentary are
  **original to this project**. Any WordNet-derived alternate meanings carry Princeton
  WordNet attribution on the credits page. No dictionary text, ever.
- All fonts SIL OFL (see `LICENSES-THIRD-PARTY.md`); all art original.
- Every book carries the colophon: *Bizzing Bee is an independent study project — not
  affiliated with, sponsored by, or endorsed by the Scripps National Spelling Bee, the
  North South Foundation, or Merriam-Webster. Competition names appear only to describe
  what the practice material relates to.*
- Quotes: short lines from public/historical figures with original commentary and
  clear attribution; portrait spots are emblems, never likenesses.

## 13. Deliverables

1. **Style guide** realizing this brief on the app tokens, with do/don'ts.
2. **Pose/expression sheets** for the 15 guides + Bizzy + **Vex** (villain set),
   matched to the existing avatar construction.
3. **World plates** for all 17 volumes (extend saga art; one new: Roman forum).
4. **Comic panel kit:** frames, speech/shout/thought bubbles, mood glyphs,
   sound-effect lettering.
5. **Template kit** for every page type in §7–§9, as SVG/CSS with content budgets.
6. **Sample spreads:** a course chapter, an Advanced chapter, a simile spread, a
   quote-chapter opener (2–3 finished pages each).
7. **17 covers** + section-divider art + sticker/badge/reward sheet.
8. **Spot-illustration set** (~40 recurring concept icons).
9. Print-spec sheet + home-print recipe.

## 14. Success criteria

- A parent in a bookstore mistakes it for a Scholastic/Usborne title; a kid opens it
  because the comic pulled them in, then does a page of drills without noticing.
- All 18 books unmistakably one series — and unmistakably the same universe as the app.
- Vex is somebody's favorite character by Volume 3.
- Every page still passes the automated fit audit; print-ready and licensing-clean.

---

## Appendix — asset & data inventory (what already exists)

- **Avatar art:** 200 finished characters (`avatars-art.js`, 120×120 SVG), 15 packs.
- **World plates:** saga art for library, elements, origami, junkyard, greysea, strait,
  engine, vibe, warfield, dino, siren, chakravyuha + hive/meadow bases.
- **Curriculum:** 122 general chapters + 43 advanced, each with concept, method, cards,
  drill words (with meaning, sentence, respelling, memory hook) and a 6-scene narrated
  script with per-scene moods.
- **Word data:** 128,197-word library with definitions, sentences, respellings, IPA
  (805 exact + derived for all), common misspellings, homophone groups (1,452),
  alternate pronunciations (2,484), diacritic spellings (85).
- **Figurative bank:** 350 similes + 2,024 idioms, each with meaning + origin story.
- **Quote library:** 5,174 kid-safe quotes with author, role, category and meaning.
- **Fonts:** Baloo 2, Fredoka, Hanken Grotesk + 7 more, all OFL, bundled.
- **Generators:** seeded page generation + PDF render + page-fit audit, in `books/`.
