# Bizzing Bee · The Library — Handover for Claude Code

**What this is.** The implementation contract for the 17-volume print library. The design system
lives next to this file as `BookLibrary.dc.html` (12 print-true 8.5 × 11 sheets — shelf, grid,
type, colour, cast, furniture, chapter loop, page templates, voice, print). This document is the
part you build from: tokens as CSS custom properties, class contracts, content budgets, asset id
conventions, generator integration, and the audit rules.

**Sources of truth, in order.** `uploads/DESIGNBRIEF.md` (the brief — wins on every conflict) →
this handover → `BookLibrary.dc.html` (visual reference). App tokens are non-negotiable: the books
are the app on paper.

**Do not change the app.** `spellbound-app/` is shipped and correct. The books *consume* its data
and art (`avatars-art.js`, `cover-art.js`, `icons-art.js`, `concept-scripts.js`, word/quote/simile
banks). If a book needs art the app doesn't have, it gets drawn into the book asset library —
never by editing app files.

---

## 1. Tokens

Drop this in `books/css/tokens-book.css` and import it first. Values are the app's; the additions
are print-only roles.

```css
:root{
  /* app surfaces — identical to the product */
  --paper:#f3efff; --card:#ffffff; --hairline:#ddd4f2;
  --chip:#e6defc; --chip-ink:#4a3aa0;
  --ink:#241E33; --muted:#6b6482;
  --treasure:#F0B429; --treasure-tint:#FFF3D6; --treasure-deep:#8A5B00;

  /* colour grammar — meaning, never decoration */
  --right:#3DA85C; --right-deep:#1F6B39;   /* correct, done, mastered */
  --tricky:#E8546A; --tricky-deep:#C43D5A; /* tricky, careful, Vex */
  --listen:#2E8FB8; --listen-deep:#1C6486; /* audio, say it out loud */
  --listen-tint:#E4F1F8;

  /* per-volume, set on <body data-vol="3"> */
  --accent:#E06A3C; --accent-deep:#A8431F;

  /* geometry */
  --r-chip:4pt; --r-card:8pt; --r-panel:14pt; --r-pill:999px;
  --panel-stroke:2.5pt; --gutter-panel:.12in;
  --sh-screen:0 3px 10px rgba(108,79,224,.07);
  --sh-press:3pt 4pt 0 rgba(36,30,51,.12);

  /* page */
  --trim-w:8.5in; --trim-h:11in; --bleed:.125in;
  --safe:.5in; --safe-bind:.75in; --baseline:14pt;
}
```

### Volume accents

`data-vol` on `<body>` selects the pair. General volumes are saturated; advanced (11–15) are
deliberately deeper and greyer — that's the "older sibling" signal.

| Vol | Title | Guide id | World | accent | accent-deep |
|---|---|---|---|---|---|
| 1 | Lift-Off! | `honeypot` | meadow / hive | `#FFC23D` | `#C8791B` |
| 2 | The Rulebook | `waggle` | library | `#6C4FE0` | `#4A3AA0` |
| 3 | Latin Launchers | `bumble` | Roman forum **(new plate)** | `#E06A3C` | `#A8431F` |
| 4 | Greek Lightning | `star` | elements | `#2E8FB8` | `#1C6486` |
| 5 | Endings That Win | `diva` | stage | `#E8458C` | `#A82563` |
| 6 | Root Camp: Latin | `drone` | engine | `#C08A3E` | `#8A5B00` |
| 7 | Root Camp: Greek | `clover` | origami / temple | `#13A892` | `#0A6B5D` |
| 8 | The World Tour | `nectar` | strait | `#3E63D6` | `#26409A` |
| 9 | Subject Sprints | `lumen` | junkyard | `#F0A93C` | `#B4711A` |
| 10 | Word Personalities | `jester` | vibe | `#B14FC4` | `#7A2F8C` |
| 11 | The Playbook (ADV) | `queenhive` | warfield → stage | `#D6353F` | `#8E1D26` |
| 12 | Schwa Country (ADV) | `blossom` | greysea | `#7E8AA0` | `#4C566B` |
| 13 | Letters Behaving Badly (ADV) | `propolis` | junkyard | `#B8562F` | `#7A3418` |
| 14 | Far-Flung Words (ADV) | `mic` | strait / world map | `#0E8A78` | `#075C50` |
| 15 | The Word Factory (ADV) | `maestro` | engine | `#5B6BA8` | `#364475` |
| 16 | As Busy as a Bee | `popcorn` | all worlds, one per section | `#3DA85C` | `#1F6B39` |
| 17 | Say It Like a Champion | `melody` | stage / sky | `#7C3F9E` | `#4E2166` |

Guide ids resolve against `window.SB_AVATAR_ART`. Verify `star` and `mic` against the shipped
roster before wiring — the rest are confirmed in `hive.js` / `stage.js`.

---

## 2. Type

Three faces plus the tile face, all SIL OFL, all self-hosted from `books/fonts/`. Copies sit in
`templates/book-library/fonts/`.

```css
--display:"Baloo 2";  /* 800 — titles, box titles, speech */
--kicker:"Fredoka";   /* 600 — labels, running head, caps + .10em tracking */
--body:"Hanken Grotesk"; /* variable — body, headwords at 800 w/ tabular figures */
--tile:"Sono";        /* 600 — respelling, IPA, letter tiles */
```

Eight sizes, print points. A ninth means the layout is wrong.

| pt | Role | Face |
|---|---|---|
| 44/46 | chapter title | display 800 |
| 32 | section opener / world divider | display 800 |
| 26/30 | page title | display 800 |
| 20 | headword, answer tile (`font-variant-numeric: tabular-nums`) | body 800 |
| 18/22 | guide speech, box titles | display 800 |
| 13/19.5 | body — **general floor** | body 400 |
| 11.5/17 | body — **advanced floor** | body 400 |
| 10 | furniture, answer key, credits — absolute floor | kicker / body |

Hard rules: no justified text anywhere; body never below the band floor; display face never in
running copy; all-caps never past four words; respelling **and** IPA always together, respelling
first, both in `--tile` at `--muted`.

---

## 3. Page geometry

Trim 8.5 × 11 in, bleed 0.125 in, safe 0.5 in, binding side 0.75 in. Twelve columns, 0.25 in
gutters, 14 pt baseline. Column recipes: `12` (comic opener, world divider, big list, certificate),
`6+6` (cards left / art cue right), `8+4` (bench + guide cameo rail), `4+4+4` (sorting, three-step
example). Never more than two task types on one page; a word table never opens a page.

```css
@page{size:8.5in 11in;margin:0}
.page{width:var(--trim-w);height:var(--trim-h);padding:var(--safe) var(--safe) var(--safe) var(--safe-bind);
  box-sizing:border-box;background:var(--paper);position:relative;overflow:hidden;break-after:page}
.page[data-verso]{padding-left:var(--safe);padding-right:var(--safe-bind)} /* mirror the gutter */
```

---

## 4. Class contracts and content budgets

The generator emits these class names; the audit reads the budgets. Budgets are hard maxima in
inches — exceed one and the page is rejected, not scaled.

| Class | Template | Budget |
|---|---|---|
| `.bb-strip` / `.bb-panel` | comic opener | strip block ≤ 6.4in; 3–5 panels; panel row ≤ 3.1in; gutter 0.12in |
| `.bb-bigidea` | Big Idea | ≤ 1.5in |
| `.bb-promove` | Pro Move (ink field, gold emphasis) | ≤ 1.6in; **one per chapter** |
| `.bb-sticky` | sticky word cards | 4–6 at ≤ 1.5 × 1.5in |
| `.bb-hive` / `.bb-card` | Practice Hive | card ≤ 1.35in; 4 rows × 2 cols = 8/page (advanced 16 → 2 pages) |
| `.bb-writeline` | dashed write-in line | 0.4in general / 0.32in advanced; 1pt, 100% ink |
| `.bb-rapid` / `.bb-row` | Rapid Round | row ≤ 0.42in; 2 cols × 14 = 28 max |
| `.bb-xword` | crossword | grid ≤ 6.2in square; clue col ≤ 3.4in |
| `.bb-search` | word search | 13 × 13 at 0.42in cells (5.46in); 8 directions |
| `.bb-scramble` | scramble & rescue | ≤ 2.6in |
| `.bb-break` | Bee Break (treasure tint) | ≤ 2.2in; **one per spread-pair** |
| `.bb-check` | Check Yourself (green) | ≤ 1.2in |
| `.bb-vex` | Vex Alert (coral) | ≤ 1.2in |
| `.bb-audio` | audio chip (sky pill) | ≤ 0.3in; never carries the instruction |
| `.bb-biglist` | The Big List | 4 cols × 0.28in rows = 136 entries/page |
| `.bb-key` | answer key | 10pt, no accent fields |
| `.bb-badge` / `.bb-sticker` / `.bb-path` | reward furniture | badge row ≤ 0.7in; sticker spot 1.6 × 1.6in |
| `.bb-head` / `.bb-foot` | running head / foot | 0.32in each, 10pt kicker, hairline rule |

Head: `Chapter N · Chapter name` left, page type + three-star difficulty right. Foot:
`Bizzing Bee · Volume title` left, folio right.

---

## 5. Art asset contract

Layered SVG, stable ids, declared `viewBox` — never flattened raster, so the generator can place,
tint and scale. Guides at 120 × 120 to match the app library.

```
bb-guide-{id}-{pose}     honeypot|waggle|… × full|cameo|point|think|cheer|oops
bb-vex-{pose}            scheme|pounce|backfire|sulk|respect
bb-world-{world}         library|elements|origami|junkyard|greysea|strait|engine|vibe|
                         warfield|meadow|hive|stage|forum(new)
bb-spot-{concept}        silent-e|schwa|doubling|softening-h|eponym-frame|assim-prefix|
                         french-que|…  (~40 recurring traps)
bb-sfx-{word}            bzzz|pop|uh-oh|got-it
bb-panel-{n} / bb-bubble-{round|cloud|jagged}
bb-badge-{n} / bb-sticker-{n}
```

Tintable shapes use `fill="currentColor"` or `var(--accent)`; character art keeps its app colours
in every world. Outline 2.5pt at 100%, tapered ends. Flat fills plus one soft shade — no gradients,
no gloss. Characters break the panel border only on the *excited* beat.

---

## 6. Generator integration

`books/mkbooks.js` (courses) and `books/mkbooks-collections.js` (16–17) keep ownership of content;
this system supplies templates and assets.

1. **Volume config** — extend the existing per-volume record with `accent`, `accentDeep`, `guide`,
   `world`, `texture` (rings|stripes|dots|grid|diag|cross), `band` (`general|advanced|collection`).
   Emit as `<body data-vol data-band style="--accent:…;--accent-deep:…">`.
2. **Chapter opener** — read the six-scene script (`concept-scripts.js`, `SB_ADV_CSCRIPT`), map
   scene → panel: mood drives `bb-guide-{guide}-{pose}`, payload becomes the in-panel prop, line
   compresses to a bubble (≤ 14 words general / 20 advanced). The `oops` scene is the Vex panel;
   `excited` is the win. 3–5 panels — drop the weakest scenes, never squeeze six in.
3. **Practice** — 8 cards/page general, 16/chapter advanced across two pages. Card = headword
   (20pt, 800) · respelling + IPA (tile, muted) · one-line meaning · `hook:` line · write-line.
4. **Puzzles** — seeded from the chapter word list so a rebuild is byte-identical. Clues come from
   our own definitions with the answer masked. Key to the back behind the gate page.
5. **Bee Break** — rotate quote → simile → idiom, one per spread-pair. Track the cursor per volume
   so no entry repeats inside a book.
6. **Band variance** — `general` uses 13pt body, 0.4in lines, tracing/prop tiles allowed;
   `advanced` uses 11.5pt, 0.32in lines, worked example moves into the Pro Move, denser dialogue.
7. **Audit** — extend the existing page-fit check: reject if rendered content height > 10.0in
   inside the safe area, if any element exceeds its class budget, if two `.bb-break` land on one
   spread-pair, if more than two task types appear on a page, or if a `.bb-promove` is missing from
   a chapter.

Outputs from one source: **press** PDF/X-4 CMYK with bleed + marks, `--sh-press` shadows, no rich
black in text; **digital** RGB no bleed, tagged reading order, `--sh-screen`; **home** no bleed, no
accent fields, art to line only, accents to 20% grey, fits letter and A4 inside the safe area.

---

## 7. Copy rules the generator must enforce

Headlines under eight words. Instructions ≤ two sentences. Sentences ≤ 14 words (general) / 20
(advanced), active, second person. Approved praise: *nice catch · you found it · that's the tricky
one · even Vex missed that*. Never *correct · well done, student · excellent work*. Banned:
*delve · unleash · leverage · utilize · furthermore · robust · seamless · elevate · in today's
world*. Never mention AI, machines, or how the content was made. Add these to the existing lint
step so a bad string fails the build, not review.

---

## 8. Licensing

Definitions, sentences, hints, scripts and commentary original to this project. WordNet-derived
alternates carry Princeton WordNet attribution on the credits page. No dictionary text, ever. Fonts
SIL OFL, embedded and self-hosted (`LICENSES-THIRD-PARTY.md`). Quote portraits are emblems, never
likenesses. Every volume carries the non-affiliation colophon verbatim:

> Bizzing Bee is an independent study project — not affiliated with, sponsored by, or endorsed by
> the Scripps National Spelling Bee, the North South Foundation, or Merriam-Webster. Competition
> names appear only to describe what the practice material relates to.

---

## 9. Build order

1. `tokens-book.css` + `page.css` (geometry, head/foot) + the font faces.
2. Furniture kit — the seven boxes, audio chip, reward row — as CSS classes with budgets asserted
   in the audit.
3. Practice Hive and Rapid Round; regenerate one existing volume and diff page counts.
4. Comic opener from the six-scene scripts, with `bb-guide-*` placeholders until art lands.
5. Puzzle pages, then back matter (gate, key, big list, colophon).
6. Volume 16/17 collection templates.
7. Three-output pipeline + preflight.

**Still to draw** (blocks visual sign-off, not the build): Vex pose sheet (5) · 17 guide sheets,
cameo + full · Roman forum plate · ~40 concept spots · SFX lettering kit · sticker/badge sheet ·
section-divider world spreads. Ship placeholders with correct declared sizes so pagination is
final before art arrives.

---

*Borrowed from the reference deck (`uploads/Design_1.pdf`), adapted to this brief:* the 12-column
grid with a 14pt baseline and named column recipes, the whitespace law and write-line heights, the
explicit colour grammar, the hard-offset press shadow (soft blur turns to mud at 175 lpi), the
eight-size type scale with per-band floors, the voice do/don't with a banned-word list, and the
three-outputs-one-source split. Its palette, faces and six-book structure were **not** carried
over — this system runs on the app's lavender tokens, Baloo 2 / Fredoka / Hanken, and 17 volumes.
