# BIZZING BEE — Book Series · Claude Design Brief (v2)

**For:** Claude Design (illustration + book art direction)
**Deliverable:** art direction, character sheets, world plates and a template kit for a
**17-book graphic-novel-style study library** — 15 course volumes (already generated as
working v1s in `books/`) plus 2 collection books. The books must feel like the app came
to paper: same tokens, same cast, same worlds.
**Working v1s to react to:** `books/book-01.html … book-15.html` (801 pages, print-true,
generated from live app data by `books/mkbooks.js`). Claude Design's job is to take these
from "handsome generated workbook" to "graphic novel a kid picks up on purpose."

---

## 1. What changed since brief v1 — and why

The original brief imagined 6 generic workbooks. Since then the app shipped a 122-chapter
concept course, a 43-chapter Advanced Pack, a trickiness model, 200 avatar SVGs, 31 saga
chapters with world art, 5,174 quotes and a 2,374-entry figurative bank. The books are now
**generated from that data** — so the design system must be a *template kit the generator
can flow content into*, not hand-laid spreads. Fifteen volumes exist; two collections join
them. One decision supersedes v1: **the books use the app's design tokens** (lavender
paper `#f3efff`, white cards, line `#ddd4f2`, chip `#e6defc`, treasure gold `#F0B429`,
ink `#241E33`), not the cream/honey palette of brief v1 — side-by-side testing made the
cream pages read as generic print; the lavender system reads unmistakably as Bizzing Bee.
Honey/treasure stays as the highlight color (Bee Breaks, reward moments).

## 2. What we've learned in the app about how kids actually learn (design to these)

1. **Concept-first beats list-first.** Every chapter is ONE Big Idea that explains a whole
   family of words, then a "pro move" (how a champion thinks on stage), then cards, then
   drill. Kids retain the family, not the list. Pages must lead with the idea in the
   guide's voice, never with a word table.
2. **Difficulty = trickiness, not rarity.** The app ramps by *why a spelling is hard*
   (silent letters, sound-alike endings, French/Greek patterns, name-based spellings) and
   clusters concept-mates together. Book sections should do the same — a spread on "the
   softening h" teaches ten words at once.
3. **Hand + mouth beat eyes.** Write-in lines with "say it, spell it OUT LOUD, then write
   it" are the core interaction. Every practice element needs a physical action.
4. **Sneaky practice works.** The Arcade proves kids drill happily inside a game. Every
   chapter ends in a puzzle (crossword / word search / scramble) built from that chapter's
   words. Keep the answer key behind a "no peeking" flap-style page.
5. **Small rewards, visible progress.** Coins-per-correct and the tap-to-reveal heatmap
   drive sessions. Paper equivalents: circle-the-bubble Big Lists, sticker spots,
   per-chapter "I own this" badges, a progress path on the section divider.
6. **The 80% gate + revisit loop.** Mastery is "pass, then win back what you missed."
   Mini-checks should route kids back ("missed one? It's waiting on page 12").
7. **Distraction is a feature.** Bee Break boxes (a quote, a simile, an idiom with its
   meaning) are the most-liked page element in testing — a legitimate breather that still
   feeds vocabulary. Keep one per spread-pair, never two.
8. **Voice: coach, not worksheet.** Short, punchy, funny, imperative. "Don't argue with
   French. Memorize it." Contractions everywhere. Nothing clinical, nothing greeting-card.
9. **Both notations.** Words carry the friendly respelling (`ih-ruh-FYOO-tuh-buhl`) AND
   IPA (`ˌɪrəˈfjutəbəl`) — kids meet IPA in real study lists, so the books normalize it.
10. **Audio is one tap away.** Every word in the books has real recorded audio in the app.
    Pages reference it ("hear it in Word Coach"); a QR per chapter is a plus.

## 3. Series structure — 17 books, one system

Ten course volumes over the 122 general chapters, five larger Advanced volumes over the
43 expert chapters, two collections. Every volume owns an accent color, a texture (the
app's cover-card families: rings / stripes / dots / grid / diag / cross), a **guide
avatar** from the app's cast, and a **world** from the saga plates.

| Vol | Title | Content | Guide | Suggested world plate |
|---|---|---|---|---|
| 1 | Lift-Off! | Bee basics (11 ch) | Honeypot | Meadow / hive |
| 2 | The Rulebook | Rules & word formation (12) | Waggle | Library |
| 3 | Latin Launchers | Latin prefixes (15) | Bumble | Roman forum (new plate) |
| 4 | Greek Lightning | Greek & number prefixes (10) | Star | Elements |
| 5 | Endings That Win | Suffixes & closers (13) | Diva | Stage / spotlight |
| 6 | Root Camp: Latin | Latin roots (11) | Drone | Engine / workshop |
| 7 | Root Camp: Greek | Greek roots (10) | Clover | Origami / temple |
| 8 | The World Tour | French, Italian, Celtic loans (15) | Nectar | Strait / voyage |
| 9 | Subject Sprints | Subject vocabulary (17) | Lumen | Junkyard-of-everything |
| 10 | Word Personalities | Personality themes (8) | Jester | Vibe |
| 11 | The Playbook (ADV) | Bee-day procedure + orthography (9) | Queen Hive | Warfield → stage |
| 12 | Schwa Country (ADV) | The vanishing vowel (7) | Blossom | Greysea (fog = schwa!) |
| 13 | Letters Behaving Badly (ADV) | Doubles, silents, liars (7) | Propolis | Junkyard |
| 14 | Far-Flung Words (ADV) | Origins beyond the big four (11) | Mic | Strait / world map |
| 15 | The Word Factory (ADV) | How words are built (9) | Maestro | Engine |
| 16 | **As Busy as a Bee** | The simile & idiom collection | Bizzy + full cast | All worlds, one per section |
| 17 | **Say It Like a Champion** | The quotable-quotes collection | Bizzy + real-people portraits (stylized, non-likeness) | Stage / sky |

## 4. The graphic-novel direction (the heart of this brief)

The course already contains its own storyboards: **every chapter has a 6-scene narrated
script** (`concept-scripts.js` / `SB_ADV_CSCRIPT`) with per-scene **moods** (happy, think,
oops, excited, love) and visual payloads (word breakdowns, glyphs, lists). Claude Design
turns those scenes into **comic panels**:

- **Chapter opener = a one-page comic strip** (3–5 panels). The guide avatar walks the
  scene beats: mood drives the pose, the scene's `show` payload becomes the panel's
  blackboard/prop, the `say` text compresses into speech bubbles. The oops-scene is the
  villain moment (a word that bites); the excited-scene is the win.
- **Recurring antagonist:** Vex (from the saga) personifies the trap — silent letters,
  schwa, the sound-alike ending. Vex loses on every spread. Kids should root against him.
- **Panel grammar:** rounded 14pt panels on the lavender paper, gutters 0.12in, warm ink
  outlines consistent with the avatar art's construction; bubbles use the app's white
  card + line token with the tail style already in v1's how-to page.
- **The guide is present on every spread** — full pose on openers and puzzle pages, a
  small "corner cameo" (head + one gesture) on practice pages. Needs a **pose sheet per
  guide** (greet, point, think, cheer, uh-oh, fly, read, thumbs-up) matching the existing
  120×120 avatar construction so print art and app art are one family.
- **Worlds:** each volume's sections sit in its world plate (see table). Section dividers
  are full-bleed world spreads with the guide traveling through; practice pages take only
  a light footer strip of the world so work space stays clean.

## 5. Format & print specs (proven in v1)

- Trim 8.5×11in; bleed 0.125in; safe margin 0.5in, binding side 0.75in.
- v1 pages are print-true HTML (`@page` sized, backgrounds forced) rendered to PDF —
  the same pipeline must accept Claude Design's art as SVG/CSS assets. **Deliver art as
  layered SVG** (not flattened raster) wherever possible so the generator can place it.
- Full CMYK for offset; the working PDFs are RGB for digital/Canva. A B/W-safe,
  no-bleed home-printer variant remains a requirement.
- Page-fit is enforced by an automated audit (no element may exceed the 11in page) —
  templates must declare their maximum content budget (e.g. practice card ≤ 1.35in tall).

## 6. Type & color

- Display: **Baloo 2 800**. Sub-labels/kickers: **Fredoka 600** (letterspaced caps).
  Body: **Hanken Grotesk** (the app's body face; replaces v1-brief's Nunito). All OFL,
  already bundled in `fonts/`.
- Tokens (from the app, already in the v1 CSS): paper `#f3efff` · card `#fff` · line
  `#ddd4f2` · chip `#e6defc`/`#4a3aa0` · ink `#241E33` · muted `#6b6482` · treasure
  `#F0B429`/tint `#FFF3D6`/deep `#8A5B00` · per-volume accent pairs in §3.
- Dyslexia-considerate: left-aligned, generous leading, letterspacing ~.02em, no
  justified text; body ≥ 10pt print (younger-band variants set larger).

## 7. Page furniture & template kit (extend the proven v1 set)

Existing templates to art-up (keep their content budgets): cover, how-to ("Five moves,
no fluff" + guide speech bubble), chapter opener (Big Idea / Pro Move / sticky cards →
becomes the comic strip page + a condensed idea panel), **Practice Hive** write-in cards,
**Rapid Round** one-liners, **Puzzle pages** (crossword with numbered grid + masked-def
clues; 13×13 word search; scramble & rescue), **Bee Break** boxes, **Big List** with
circle bubbles, answer key ("No peeking until you've tried"), colophon.
New furniture wanted from Claude Design: section-divider world spreads, sticker/reward
sheet, "I own this chapter" badge row, progress path, spot-illustrations for ~40 recurring
concepts (silent letters, schwa, doubling, the softening h, eponym portrait frame…).

## 8. Book 16 — *As Busy as a Bee* (the simile & idiom collection)

- **Source:** `figurative-data.js` — 350 similes + 2,024 idioms, each with meaning (`m`),
  origin story (`os`), origin language and context. This is a **reader**, not a workbook.
- **Structure:** similes first (the full 350, they're the stars), then a curated "idiom
  hall of fame" (~400 best by kid-appeal), grouped by theme (animals, food, weather,
  body, sports…). Every entry: the phrase big, meaning one line, origin story two lines,
  and room for art.
- **Graphic treatment:** each spread illustrates 2–3 entries literally-vs-figuratively —
  the comedy of "raining cats and dogs" drawn literally in a panel, with the guide
  reacting. This is the most illustration-dense book in the series.
- **Games:** match-the-halves (phrase ↔ meaning), "finish the simile," draw-your-own box.
- **Fun voice rule:** origin stories are told as one-breath campfire facts.

## 9. Book 17 — *Say It Like a Champion* (the quotable-quotes collection)

- **Source:** `quotes-lib.js` — 5,174 kid-safe quotes with author, role (`who`), category
  (`c`: perseverance, courage, curiosity…) and a written-for-kids meaning (`m`).
- **Structure:** ~12 themed chapters (one per category), each opening with a comic beat
  of the guide facing that theme (nerves before a bee round = the courage chapter).
  Curate ~25 quotes per chapter — biggest names and clearest lines win. Every quote:
  the line set large, author + role, and the meaning as a "what it means for spellers"
  strip. End each chapter with "your turn": lined space to write the reader's own line.
- **Art:** stylized, non-likeness portrait spots (silhouette/emblem style — a lightbulb
  for Edison), so no likeness/publicity issues. Quotes themselves are short factual
  attributions; keep sources historical/public figures as the data already does.
- **Games:** "who said it?" match; fill-the-missing-word on famous lines.

## 10. Content pipeline (what flows vs what's drawn)

The generator (`books/mkbooks.js`) flows all text content from live app data — chapters,
words, definitions, hooks, respellings, quotes, similes — with seeded, reproducible
puzzle generation and automated page-fit auditing. **Claude Design delivers assets, not
final pages:** pose sheets, world plates, spot illustrations, panel frames, furniture —
as SVG with stable ids. The generator places them. Sample spreads (2–3 per book type)
should be hand-composed first to set the bar, then we encode them as templates.

## 11. Licensing & compliance (unchanged, load-bearing)

- Definitions, sentences, hints and lesson scripts are **original to this project**; any
  WordNet-derived alternate meanings carry Princeton WordNet attribution on the credits
  page. No dictionary text.
- Fonts are SIL OFL (see `LICENSES-THIRD-PARTY.md`). All art must be original.
- Every book carries the non-affiliation colophon: not affiliated with, sponsored by, or
  endorsed by Scripps, the North South Foundation, or Merriam-Webster; competition names
  appear only to describe what the material relates to.
- Quotes: verify attribution against the curated library; public figures, short quotes,
  with original commentary — keep it that way.

## 12. What Claude Design delivers

1. Style guide v2 (this brief realized on the app tokens) with do/don'ts.
2. **Pose/expression sheets for the 15 guides + Bizzy + Vex**, matched to the existing
   avatar construction.
3. **World plates** for the 17 volumes (reuse/extend saga art; new: Roman forum).
4. **Comic panel kit**: frames, bubbles, mood glyphs, sound-effect lettering.
5. Template kit for every page type in §7–§9 (SVG/CSS, content budgets declared).
6. 2–3 finished sample spreads for: a course chapter, an Advanced chapter, a simile
   spread (Book 16), a quote chapter opener (Book 17).
7. 17 covers + section-divider art + sticker/badge sheet.
8. Print-spec sheet + home-print recipe.

## 13. Success criteria

- A parent mistakes it for a Scholastic/Usborne title; a kid opens it because the comic
  pulled them in, then does a page of drills without noticing.
- The 17 books read as one unmistakable series, and as the same universe as the app.
- Vex is somebody's favorite character by book 3.
- Print-ready, licensing-clean, and every page still passes the automated fit audit.
