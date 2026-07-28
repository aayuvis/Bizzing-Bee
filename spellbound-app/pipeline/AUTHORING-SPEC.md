# Bizzing Bee trivia authoring spec

You are writing quiz questions for a kids' (ages 8–15) spelling-bee training app.
Output is a JSON array written to your assigned output file. NOTHING else goes in that file.

## Question object format (exact keys, no extras)
{"th":"<theme-id>","lv":<1-5>,"ty":"mc","q":"<question text>","c":["<CORRECT>","<wrong>","<wrong>","<wrong>"],"f":"<one-line fun fact / explanation>"}

- `c[0]` MUST be the correct answer. The app shuffles choices at display time.
- `ty` is "mc" (4 choices) for ~90% of questions; "tf" for the rest — for "tf" use exactly
  `"c":["True","False"]` or `"c":["False","True"]` (correct first!) and phrase `q` as a statement.
- `f` is a one-sentence fascinating fact expanding on the answer (max ~140 chars). Always include it.
- Do NOT include an `id` field — ids are assigned at merge time.
- Plain ASCII quotes inside strings must be escaped properly; the file must parse with JSON.parse.

## The five levels — segment by age group AND cognitive reach
- lv 1 · ages 7–8: single concrete fact, everyday words, short sentences. ("Which animal says 'moo'?")
- lv 2 · ages 9–10: core school knowledge, simple comparisons, common word meanings.
- lv 3 · ages 11–12: richer vocabulary, two-step reasoning, well-known Greek/Latin roots.
- lv 4 · ages 13–14: abstract concepts, less-common words, deeper etymology, precise distinctions.
- lv 5 · age 15+ / champion: competition-grade — obscure but verifiable facts, advanced vocabulary,
  layered word origins, tricky near-miss distractors.
A strong lv-5 question would stump most adults; a lv-1 question is answerable by a young child.
NEVER write a babyish question at lv 3+. Difficulty must come from knowledge depth, not trick wording.

## Content mix — THIS IS ESSENTIAL
For every level, write roughly:
- ~55% knowledge trivia about the theme (facts, science, geography, history of the topic), and
- ~45% WORD-focused questions rooted in the theme — the "world of spelling" flavour:
  * word origins/etymology ("The word 'dinosaur' comes from Greek words meaning…?")
  * root/prefix/suffix meanings ("The root 'hydro' in 'hydrophone' means…?")
  * precise word meanings ("A person who studies birds is called a…?")
  * word-formation and cousins ("Which word shares its Latin root with 'aquarium'?")
  * collective nouns, young-animal names, term-of-art vocabulary for the theme.
Spread both kinds across ALL five levels (easy word questions exist too: "A baby cat is called a…?").

## Quality bars
- Every fact must be TRUE and verifiable. If you are not sure, do not write it.
- Distractors must be plausible (same category as the answer) but unambiguously wrong.
- Kid-safe: no violence/gore details, no adult topics, positive tone.
- Vary question stems — do not start 50 questions with "Which of these".
- No duplicates: read the provided existing-questions file for your theme first and avoid
  repeating any of those questions OR their obvious rephrasings. Also no near-duplicates
  within your own output.
- Keep `q` under ~110 characters where possible.

## Output procedure
Build the array in chunks: append batches of ~50 questions to your output file using bash
heredocs or a series of Write/appends, then FINISH by making sure the file is one valid JSON
array (starts with [, ends with ], comma-separated). Validate at the end with:
  node -e "const a=JSON.parse(require('fs').readFileSync('<outfile>','utf8')); console.log(a.length)"
Fix any parse error before finishing. Your final message: just report the count per level.

## Etymology style (IMPORTANT — matches the app's established voice)
For word-origin questions, NEVER ask "Which language gave us the word X?" — that phrasing
is banned. Instead make the ROOT MEANING or the WORD BREAKDOWN the question itself:
- "The word 'dinosaur' is built from Greek words meaning…?" → "terrible + lizard"
- "The root 'therm' in 'thermometer' means…?" → "heat"
- "'Breakfast' literally means…?" → "breaking the night's fast"
The source language belongs in the `f` fact line as secondary colour ("From Greek deinos
+ sauros…"), not in the question or the choices.

## Top-tier bar (lv4 & lv5) — contest grade, non-negotiable
Model lv4 on the middle-to-upper ladder of "Who Wants to Be a Millionaire", and lv5 on
national quiz-contest / quiz-bowl finals. Concretely:
- Difficulty must come from LAYERED OR RARE KNOWLEDGE, never from trick wording or
  ambiguity. A great lv5 question is crystal clear and still stumps most adults.
- All four distractors must be plausible to a smart adult — same category, same era,
  same order of magnitude — separable only by really knowing the answer.
- Prefer questions whose answer unlocks a story; the `f` line should feel like a reward
  ("Yes — and here's the amazing part…").
- Draw on ladder classics: named phenomena and laws, historic firsts, precise
  superlatives, term-of-art vocabulary, origins of technical terms, eponyms (things
  named after people), exact-but-rounded verifiable figures.
- Every fact must survive an encyclopedia check. When in doubt, cut and write another.

## Breadcrumb style for the hardest questions (lv5, and the best of lv4)
Top-level trivia is NOT direct recall — it is a short STORY told in breadcrumbs: two or
three clues from completely different angles (a historical incident, a word origin, an
everyday detail) that only merge at the very end into one hard-to-guess answer.
Examples of the shape:
- "A melted chocolate bar in an engineer's pocket, a name that literally means 'small
  wave', and the favourite frequency of water molecules all point to which kitchen
  machine?" → Microwave oven
- "A Hungarian doctor mocked for blaming 'cadaverous particles', a maternity ward with a
  deadly reputation, and a plea for handwashing that cost him his career converge on
  which pioneer?" → Ignaz Semmelweis
- "The number 1729 on a taxi's plate, two letters posted from Madras to Cambridge, and a
  lost notebook rediscovered in 1976 all point to which mathematician?" → Srinivasa Ramanujan
- "A lighthouse-keeper's daughter, a night rescue in a rowboat, and a Victorian media
  frenzy made which woman one of history's first celebrity heroines?" → Grace Darling
Rules: each breadcrumb must be independently TRUE and verifiable; order clues
hardest-first so the answer clicks only on the last one; the clues must come from
DIFFERENT angles (never three rephrasings of one fact). Write at least HALF of lv5 in
this style (the rest stay contest-grade direct); sprinkle it into lv4 too. Breadcrumb
questions may run longer — up to ~200 characters.

## Toughness calibration (added at pause)
The lv5 bar is 5x TOUGHER than a typical "hard" pub-quiz question. If a clue names the
answer's most famous fact (Voyager: golden record; Einstein: E=mc2), it is TOO EASY for
lv5 — use the answer's second- and third-most-obscure true facts instead, and save the
famous fact for the reward line `f`. Test: a well-read adult should get an lv5 right
well under half the time. Kids need challenge — do not protect them from difficulty.
