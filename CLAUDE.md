# CLAUDE.md — Bizzing Bee

Read this first. It sets how to work on this repo and how the app is built.

## Working style (the user's pace)
- **Work autonomously.** Move through the whole request list without stopping to confirm
  routine steps. Only stop when a decision is genuinely the user's (a real fork, a
  destructive/outward-facing action, missing info you can't infer).
- **Multitask.** Kick long jobs (voice synthesis, large tests) into the **background** and
  keep working while they run. Make independent edits/searches **in parallel** in one turn.
- **Bias to action, then verify.** Prefer doing over asking. After a change, verify
  headlessly (below), don't ask the user to check.
- **Batch + ship.** Group related edits into one commit with a clear message; keep going.
- **Keep reasoning tight.** Act when you have enough; don't over-deliberate.
- Speed knobs for the session: `/model` → Opus 4.8, `/fast` on, and accept routine
  Bash/Edit permissions once so you're not re-prompted.

## What this is
**Bizzing Bee** — a **vanilla-JS, no-build, offline** spelling-bee trainer for kids 8–15
(originally ~9yo Ahana on a tablet). No React, no bundler. Everything is `window.*` globals;
UI is `state` → `render()` string-template rendering; clicks dispatch via `data-act`
handlers. App lives in this folder; open `index.html` to run.

## Hard rules (do not violate)
- **Every game needs BOTH keyboard AND touch/tablet controls.** Non-negotiable.
- **Word audio is Google Cloud TTS** (voice `en-US-Neural2-F`, rate 0.95, MP3 24kHz) as of
  2026-07-23 — the whole word library was migrated off Kokoro (which had persistent
  pronunciation artifacts, worst on French-origin words). `WV_BAD` is empty. To fix a
  flagged word: re-gen just that word via Google TTS (SSML `<phoneme>` for deterministic
  pronunciation), overwrite `voice/w/<slug>.mp3` (slug = `word.replace(/[^a-z0-9]/g,'-')`),
  add it to `SB_VOICE_REVIEW`, bump `SB_VOICE_VER`. Needs a Google TTS API key (env `GKEY`).
- **Saga dialogue / concept audio stays Kokoro** — the `voice/pipeline/` scripts + the
  `kokoro-model-v1` GitHub release are kept for regenerating those (`voice/d/<key>.mp3`).
- **Never leak the target spelling** in on-screen meaning/definition text (it's masked).
- **Never collapse or hide the desktop top nav.** No screen, no mode, no hover-reveal.
  Focus mode may switch off the music and still the background, but the nav tabs stay
  visible. (Below 640px the top nav is replaced by the fixed bottom tab bar — that is the
  intended mobile layout, not a collapse.)
- Games must look **professional** (not boxy/1990s). Use the delivered Claude Design art
  (`SAGA_ART`/`WORLD_ART`/`SB_AVATAR`); hand-drawn canvas is fine when richly shaded.
- **Never** put a real model identifier in commits, PRs, code, or any pushed artifact.

## Architecture map
- `app3.js` — main app: home, practice, settings, avatars, and the **voice layer**
  (`wordClip`/`deviceSpeak`/`WV_BAD`) + the **Word Voice Tester** (`viewVoiceTest`).
- `saga2.js` — the story mode "Bizzy & the Great Unspelling": `ACTS` (6), `CH_META`
  (31 chapters), and `SB_SAGA_ENGINES` (13 playable engines incl. stageRhythm,
  constellationConnect, typeBlaster, spellScene). `map()` renders acts→chapters
  with stars; `game()` runs one; `beats()` plays dialogue. Progress is the v2
  done-set model in `localStorage['sb_saga2']` (v1 saves auto-migrate).
- `saga-script.js` — dialogue: `SB_SAGA_SCRIPT[key] = {title, world, intro/win/lose:
  [[speaker, "line", "audioKey"]]}`. `audioKey` → `voice/d/<key>.mp3` (clips optional).
- `voice-words.js` — `SB_WVOICE`, pipe-joined manifest of 128,491 voiced word keys — every word in
  both `words-data.js` (40,907) and `words-full.js` (128,196) has a clip.
- `voice-review.js` — `SB_VOICE_REVIEW` (Re-review queue) + `SB_VOICE_PRIORITY`.
- `voice-cdn.js` — on `*.github.io`, rewrites `voice/…` → raw.githubusercontent of `main`.
  Concept narration (`voice/c*`, `voice/a*`) is exempt: it is bundled on `gh-pages` and
  served same-origin, so it never depends on those clips reaching `main`.
- `advanced.js` + `adv-concepts-data.js` — the **Advanced Pack** ($49.99/yr add-on, gated by
  `SB_ENT.hasAddon('advanced')` only). `SB_ADV_CONCEPTS` holds **43 expert chapters** in
  four categories, `SB_ADV_CSCRIPT` their 258 narrated scenes. These live entirely outside
  `state.conceptData`, so they cannot leak into the free 121-chapter course. Narration is
  **`am_michael` @0.95** (a coach register) at `voice/a<chapter>-<scene>.mp3`, indexed by
  chapter position — so **never reorder `SB_ADV_CONCEPTS.chapters`**, or every clip
  mismaps. Append only. Durations live in `voice-adv-manifest.js`.
  Regenerate the data file from authored prose with the tier scripts + `advbuild.js`
  (session scratchpad): drill words are looked up from the word libraries at build time,
  so no chapter can list a word the speller cannot practise. See `ADVANCED-CONCEPTS.md`
  for the curriculum map and two data-quality warnings about the `o` and `r` fields.
- Saga engines: `engine(host, opts, done)` → `done({win, score, stars})`.
- `trivia.js` — the Arcade quiz (`STV`); `app3.js` holds Trivia Training
  ("Know the World of Words", `viewTrivTrain`).

## Difficulty = spelling trickiness, not rarity
- **A "difficult" word is one whose spelling the sound does not give away** — silent
  letters, sound-alike endings, donor-language patterns, name-based spellings — not a
  rare or long one. `trickAnal(w)` (app3.js) scores this from the word itself plus its
  recorded common misspelling, and names the concept family (`epon/silent/fr/gk/end/
  dbl/vow/plain`). `spellDiff(w)` is the ramp key: trickiness dominates; rarity `y` and
  length are minor terms. Exposed as `window.SB_TRICK` for other files (advanced.js
  `hardWord` uses it — the Ultra Champions Journey is trickiest-first, not longest-first).
- The Bizzing Bee Journey ramps its Levels by `spellDiff`, and `clusterLevel` sits
  concept-mates together inside each Level (study order `TRICK_RANK`: phonics-adjacent
  first, story-words last). Any new difficulty ramp or "hardest" selection should use
  `spellDiff`/`trickScore`, not `y`/length alone.
- **Eponyms are clustered by the donor language of the name** (`eponymStages`): the
  "Named After Someone" list's Levels ARE the clusters (Greek myth, Latin & Roman,
  French, Italian & Spanish, German & Nordic, English & Celtic, World names) — a Greek
  hero's name and a French inventor's name break in different places. The eponym `o`
  field is reliable for this; the blends warning in ADVANCED-CONCEPTS.md is about blends.
- Word cards show a "why tricky" chip (`trickLabel`); named stages surface their label
  in the coach dock.

## Homonyms, alternate pronunciations & diacritics (`sounds-data.js`)
- `SB_HOM` = homophone groups (curated bee classics ∪ a filtered sweep of all 130k
  pronunciations — same normalized `p`, definition-dissimilar, spelling-variant pairs
  excluded). `SB_ALT_PRON[word]={a,b,s,n}` = both written pronunciations, a speakable
  respelling for TTS, and a note (heteronym meanings or "both are correct").
  `SB_DIACRITICS[word]={m,n}` = the true marked spelling and the mark's name.
  Regenerate with the session build script (`sounds-build.js` pattern), never by hand.
- Runtime: `homIndex()/homPartners()/altPron()/diacritic()` in app3.js. **Lookups must
  stay prototype-safe** (`Object.create(null)` / `hasOwnProperty`) — "constructor" is a
  real library word and will phantom-match a plain object.
- Word cards render three extra rows: sounds-like partners ("ask for the meaning"),
  both written pronunciations + a **second voice button** (`sayAlt`), and the full-dress
  diacritic spelling ("plain letters are accepted at the bee").
- `sayAlt` plays `voice/ap/<slug>.mp3` (Google TTS, **not yet generated — needs `GKEY`**;
  clips belong on `main` like word clips, the voice-cdn Audio wrapper resolves them) and
  falls back to device TTS reading the speakable respelling until the clips exist.
- Coach catalogue lists: `homophones` / `altpron` / `diacritics`, built by `soundLists()`
  which rebuilds once the 128k library loads (hardPool pattern). Homonym words carry the
  `hom` trick class, so they cluster together inside journey Levels.
- **The Sound Alphabet — IPA trainer** (Supercharge → Train, `nav:'ipatrain'`): a Learn
  grid of 24 IPA symbols + the stress mark (`IPA_SOUNDS`) with spoken bee-word samples,
  then three 10-question drills — read a transcription and pick the word, pick the true
  transcription (decoys via confusable-pair swaps in `ipaDecoys`), find the word carrying
  a sound. `SB_IPA` (sounds-data.js, regenerate with `voice/pipeline/ipa-gen.py`) holds
  800+ bee words converted from CMUdict. Audio is the library's Google-TTS clips via
  `say()`. Keyboard 1–4/R/Enter + touch; a coin per correct; no spelling-progress writes.
- **Every word card shows IPA** beside the friendly respelling: `ipaOf(w,p)` prefers the
  exact `SB_IPA` entry and otherwise derives IPA from the `p` respelling with `pToIPA`
  (98.6% agreement with CMU on the exact set; where they differ the card follows `p`,
  which is the point — the two notations on a card must agree with each other).

## The Word Map (`trail.js` + `trail-data.js`) — the Journey tab
- **Five tabs: Home · World Atlas · Practice · Library · Play**, spread evenly
  across the bar (`flex:1` each). The Atlas has **no sub-nav** — the tab is the map, and the
  only chrome on it is the Revise / My traps pill pair. The Library is its own tab again
  (every explore-family nav lights it). My Hive is not a tab: the **Bizzy button** in the
  header opens it. The mobile bar carries the same six (Atlas / Stats are the short labels).
  Both bars draw from `navIcon(key)` — one duotone set on the 24-grid, not the old mix of
  illustrated and line glyphs. The Library is **eight painted tiles, four across**
  (`app-art/lib-*.jpg`); the shelf and tool row-lists are gone because every one of those
  destinations is reachable from its own home.
- **Progress is not a tab** — it opens from Settings → Progress & reports (and the drawer).
  It reads rank → the World Atlas (tier, act, stops) → Practice (Stage + mastery) → this
  week → word difficulty → the 30-day targets → the word heatmap: the same order and the
  same words the rest of the app uses.
- **Worlds live in My Hive** (`viewWorlds`, `hiveBar` segment), not in Settings — a world is
  a look you own. Settings is four headed sections (Your speller · Progress & reports ·
  Look & feel · Sound & voice) plus a collapsed Testing drawer.
- **Header tools are one size, one shape** (`.sb-hdr-ico`): the rank pill (fixed ladder,
  beside Search), karma, coins, then appearance / hive / settings. The appearance button
  does double duty — a tap cycles Light → White → Dusk (debounced 230ms), a **double-tap
  toggles focus** in whichever look is on, so there is no separate focus button. Double-tap
  actions go through `data-dbl` and the `dblclick` dispatcher.
- **Three continents, one journey**: Honey (three tiers) → the Expedition → **Ultra
  Champions** (`ultraBoard`, `app-art/atlas-ultra.jpg`, five landmarks). Ultra's word
  list is unchanged and still special-cased in `rawListWords`/`ultraStages`, but it is no
  longer in `coachCatalog` — the map is the way in, the list is the training ground.
- **An act is a painting with a road across it**, never a checklist. `ROADS[world]` holds
  one measured cubic per world; `roadPoints()` places N stops along it by arc length, so
  the same curve serves 2 stops at Tier I and 22 at Tier III. Long acts pan sideways and
  auto-scroll to the frontier. `trailPick` selects, `trailTrain` hands the stop's words
  to Practice, `SB_TRAIL_TAUGHT(gi)` answers the reverse question for concept pages.
- **One thing is called a Level: your rank.** Per-list ladders read **Stage** everywhere;
  `overallLevel` is deleted; the header pill says **Word difficulty**, not Bee Band.
- **ONE concept-first guided journey.** The Journey tab IS the Word Map
  (nav 'trail'): one continuous map of 9 base acts followed by **The Advanced Rounds**
  (the 5 expeditions, unit ids `x*`), which render locked with a **$49.99/yr** Advanced
  Pack CTA until `ADV.active()`. Course is derived from the unit id prefix
  (`state.trailCourse`, set by `trailUnit`/`trailChk`; checkpoint args are
  `"course|actId:n"`). A "Chapter shelf" button on the map opens the Concepts library,
  which ALSO stays listed in Library → Learn (the user wants both routes).
  Practice (old Word Coach, nav 'coach') keeps the classic drill paths via the
  "Practice paths" chooser (nav 'quest'); its list catalogue is collapsed into four
  group cards (My Words / The Champion Ladder / Word Origins / Tricky Words —
  `grp` fields in `coachCatalog`, `state.catGroup` opens one; keys unchanged).
  My Hive = Collection + Evolution + Store behind one lit tab (`hiveBar`).
  Arcade holds exactly 7 surfaces: Saga, Spelling Quest (whose season map carries the
  classic Boss Battle quick fight — `sqBoss`), Daily Buzz, Bee Trivia, Magic Squares,
  Beat the Buzzer (modes: Sprint / Warm-Up / Level Challenge / Duel / ◆ Rapid
  Dictation) and Word Quiz (+ ◆ Memory Match). Curriculum lives in `trail-data.js`
  (`SB_TRAIL`: 9 acts / 128 Honey units incl. 6 inline Trickster chapters; 5 expeditions / 43 units), word pools in `trail-map-data.js` (**lazy-loaded** by the engine — never
  add it to index.html). Regenerate both with `voice/pipeline/trail-build.js`.
- Unit loop: Learn (opens the concept chapter; `state.trailReturn` routes `conceptBack`
  back to the unit) → Meet the words (wordFlash) → Practice (feeds `startTrain`) →
  **Quiz gate**: 15 mixed items (4 concept MCQs from `unit.qs` where `c[0]` is always
  correct, 8 spell-it with audio, 3 meaning MCQs). Hard gate 80% (90% Advanced Rounds);
  fails go to a revise round; pass pays 15 coins. Checkpoints every 4th unit are mixed
  quizzes with no new words. Progress on the child at `c.trail`
  (`{lap,done,chk,seen,elap,edone,echk}`).
- **Laps cap difficulty absolutely**: band 1/2/3 = global spellDiff terciles; family
  units serve their lap's band slice (+ their chapter's teaching words), lesson units
  teach once on their pinned lap. Finishing every stop advances the lap (max 3).
- `app` is a top-level `const` (global lexical scope, **not** `window.app`) — extension
  scripts like trail.js must reference the bare identifier.
- **`window.SB_TRAIL_NEXT()`** is the one public reading of the frontier: `{title, sub,
  act, world, done, total, lap, allDone, go, arg}`, or `null` until trail-data.js lands.
  Home's "Next on your journey" card and the Atlas tile both quote it, so the stop count
  is the tier's count (`seq()` filters by lap) and never disagrees between cards. Home
  renders an invitation while it is null; boot-lazy's softRender fills it in.
  `trailUnit`/`trailChk` set `nav:'trail'` themselves so a stop opens from anywhere.

## Home is three rows
1. **Who you are today** — the greeting/mascot card, the Daily goal rings, Your rank
   (emblem + `EVO[theme][formIdx(heroLevel)]`, so the number, the art and the name all
   come from one ladder and the card cannot disagree with the Evolution tab).
2. **What to do next** — the Atlas's next stop beside the four "Keep going" tiles
   (`.sb-home-r2` / `.sb-home-tiles` in index.html; one column below 900px).
3. **Today's reading** — the bee tip, Word of the hour, Quote of the hour.
- The words step is the coach card view (selfMark wordFlash → flashMark writes luMastered / missed; requires state.sessionWords). exitTrain and conceptBack both honour state.trailReturn. Trickster chapters (neu units) have no narration yet — browser TTS covers them;
  when recording, append to `SB_CONCEPTS` (append-only) and switch units to `gi` refs.

## Vocabulary progression (separate from spelling)
- Vocab has its **own ladder**, stored on the child at `c.vocab` and **never** on
  `c.lists[key]`. Shape: `{lv, revise, seen, cur, carry, last}`, all keyed by deck
  (`mix`/`easy`/`medium`/`hard`/`champ`/`th:<id>`/`list:<catalogue key>`), so each deck
  levels independently.
- **The Vocabulary section wears the Word Coach shell**: the same List Dock (one big
  "now studying" tile with a progress ring, small tiles to switch, "+ Add a list"), the
  same three-tab bar (Cards / Practise / Check), the same all-words panel. It lands
  straight on a list — there is no separate deck-picker screen.
- **One chooser, two sections.** `state.vocPick` puts `coachSetup()` into vocabulary mode:
  its cards dispatch `vocSelectList` instead of `selectList` and report the vocabulary set.
  Selection writes **`c.vocabList`, never `c.activeList`** — choosing what to study for
  meaning must not change what is being trained for spelling. In vocabulary mode
  `listCoverCard` also avoids `getList()`, which lazily creates spelling-list records.
- **Any list can be studied as vocabulary.** `vocListCats()` maps `coachCatalog()` — the
  curated lists, NSF tiers, origin lists, plus List Builder / pasted / AI lists — keeping
  only words that carry a meaning, and only lists with **8+** of them (below that a fair
  4-option quiz cannot be built). They appear under "Your word lists" in the picker as
  `list:<key>` decks and are sorted hardest-first.
- **The heatmap** (`vocHeatmap`, under the dock) mirrors the coach's "Live progress":
  anonymized coloured tiles with a tap-to-reveal eye toggle; revealed chips jump to that
  card. It draws from `v.known`/`v.miss` (+ the revision queue), which every answered
  question updates in any mode — knowledge display only; the gate still moves only on a
  graded check. It never reads or writes `luMastered`/`missedWords`.
- **Three modes share one 4-option multiple-choice screen** (`state.vocCheck.mode`):
  `practice` — replayable, pays a coin + karma per correct answer, but scores nothing and
  neither locks nor unlocks anything; `check` — the graded run that applies the gate;
  `revise` — only the words the last check missed.
- Flow: study a set of **`VOC_SET` (50)** words → **Check what you've learned** (one
  meaning MCQ per word) →
  `VOC_PASS` (**0.8**) or better unlocks the next set of NEW words. Below it, the missed
  words go to `revise[deck]` and `vocNewSet` refuses to serve new words, diverting to a
  revision round instead. A word leaves the queue the first time it is answered correctly
  in a revision round, so the loop always terminates.
- Passing with a few wrong still progresses; those go to `carry[deck]` and are seeded into
  the next set rather than dropped. `seen[deck]` keeps new sets genuinely new.
- **The check must never touch spelling progress.** It does not call `markMastered`,
  `addMiss` or `gainXp`, so a vocabulary session cannot move the spelling stage, spelling
  XP or the Bee Band. If you add scoring to vocab, keep that separation — there is a
  headless test that snapshots `lists`/`xp`/`band`/`luMastered`/`missed` around a full
  vocab session and asserts it is byte-identical.

## Privacy / COPPA
- `privacy.html` is the app's **COPPA online notice** (16 CFR Part 312). It is linked
  "clearly and prominently" from four places — keep all four working: the **home screen
  footer**, the **onboarding name/age step** (the point of collection), **Settings**
  (account card), and the **Parent Zone** (privacy card).
- The policy's claims are load-bearing facts about the codebase: **no analytics/trackers,
  no external scripts, no accounts, nothing transmitted** — child name/age/progress live
  in localStorage only. The headless suite greps index.html for external scripts and
  tracker strings; if you add any network feature, update `privacy.html` FIRST (and its
  effective date), and re-check COPPA notice/consent duties before shipping.
- Hosting IPs (GitHub Pages / raw.githubusercontent) are disclosed in the policy under
  COPPA's "support for internal operations" exception.
- Before any **commercial launch**: the policy must carry the operator's full legal name,
  mailing address and phone (placeholder noted in §1), and if real payments are added the
  purchase flow must stay parent-only (behind the PIN) with notice/consent revisited.

## Trivia: levels, sharding, and the authoring pipeline
- **Five levels, one band per speller.** `ttBand(c)` (app3.js) picks 1–5: base from age
  (≤8→1, ≤10→2, ≤12→3, ≤14→4, else 5), shifted by spelling `heroLevel`, then nudged by
  recent per-band accuracy (`c.trivia.bands[lv]={r,d}`, fed by `ttBandRecord` from
  `grade()` in trivia.js). `c.ttLvSel` 1–5 pins a level manually; 0 = automatic.
  `STV.autoLv()` defers to the same function, so training and Arcade always agree.
- **The bank is sharded by level and lazy-loaded.** `trivia-data.js` is a ~4KB index
  (themes, `byLevel` counts, loader). Questions live in `trivia-q1.js`…`trivia-q5.js`,
  injected by `SB_TRIVIA.need(lv, cb)`; the 2.2MB generated word bank
  (`trivia-words.js`) loads as a prerequisite of the first fetch and is **not** in
  index.html. Never add it back — that was 3.5MB of boot payload.
  `SB_TRIVIA_ONLOAD` clears `_ttCache` and re-renders as shards arrive.
- **Any new screen that reads questions must gate on its level first** — call
  `ttNeed(lv, cb)` and render a waiting state, or the deck comes back empty.
- **Canonical data is `trivia-all.json`** (not shipped). Pipeline:
  author `out-<theme>.json` files → `merge.js` (schema/dedup/banned-phrasing checks,
  assigns ids, writes trivia-all.json) → `shard.js` (writes the core + five shards).
  Both scripts live with the session scratchpad; re-run `shard.js` after any merge.
- **Question shape:** `{th, lv, ty:'mc'|'tf', q, c:[…], f, id}` with **`c[0]` always the
  correct answer** (the UI shuffles). `mc` has 4 choices, `tf` has 2.
- **House style for questions:** never ask "which language gave us X" — make the root
  meaning or word breakdown the question and put the source language in `f`. lv4 is
  Millionaire-upper-ladder grade; lv5 is quiz-final grade and at least half of it is
  *breadcrumb* style (2–3 independently-true clues from different angles, hardest first,
  converging on one hard-to-guess answer). Never clue with the answer's most famous
  fact — that belongs in `f`.

## Adding a saga chapter
1. Append to `CH_META`: `{n, act, title, world, engine, opts, script}` (sequential `n`).
2. Add a `SB_SAGA_SCRIPT[script]` block (format above).
3. Ensure the `world` label resolves in `WMAP`/`SGART.plateForWorld` (else it falls back).
4. Reuse an engine (honeycombRun, keepFlying, beeGrandPrix, wordHive, whackAMoth,
   spellShield, spotlightSimon, unscrambleStars, wordSnake, combCatcher, stageRhythm,
   constellationConnect, typeBlaster, spellScene) or author a new one
   (keyboard+touch!). Words come from `pool(n)` by difficulty.
- **Status:** all six acts are built out (31 chapters). Future acts can use the spare
  `WORLD_ART` plates (dino, library, junkyard, siren, origami, elements, vibe, engine,
  greysea, strait, warfield, chakravyuha) — Vex still holds the Master Token.

## Voice: the feedback → Kokoro rebuild loop
- Parent tests words in **Settings → Word voice tester** (walks the whole library in batches
  of 20), crosses wrong ones with "how it sounded", exports **`voice-flags.json`**.
- Rebuild with Kokoro (`kokoro-onnx==0.5.0`, voice `af_heart`) → overwrite
  `voice/w/<key>.mp3` where `key = word.replace(/[^a-z0-9]/g,'-')`. Model files
  (`kokoro-v1.0.int8.onnx`, `voices-v1.0.bin`) come from the thewh1teagle/kokoro-onnx GitHub
  release — **needs github.com allowlisted; not on PyPI.** Params & scripts in
  `VOICE-PIPELINE.md`. **Match the library: 0.95× for normal words, 1.0× for ultra-short.**
- After rebuild: add words to `SB_VOICE_REVIEW`; commit `voice/w/*.mp3` + `voice-review.js`.
- You cannot audition audio here — the parent's **Re-review tab** is the quality gate.
- **Model hosting:** the model files are attached to this repo's **`kokoro-model-v1`
  release** — fetch via the GitHub API asset endpoints (in scope for any session on this
  repo); no external allowlisting needed. `WV_BAD` is empty; keep it that way by
  rebuilding defective clips rather than blocklisting.
- **Kokoro is deterministic:** re-synthesizing a flagged word with identical input text/
  speed reproduces the identical bad audio. When rebuilding a re-flagged word, change the
  input (e.g. drop the trailing "." or shift speed ±0.03) and verify the output actually
  differs (envelope correlation) before shipping — see `voice/pipeline/` QA scripts.

## Boot budget (`boot-lazy.js`) — read before adding a script tag
- The app boots in ~400ms on 4.7MB of critical JS. It used to be 1417ms on 31.9MB.
  **Do not add a data file to `index.html`.** Register it in `boot-lazy.js` (REG +
  IDLE order, and a GROUP if a feature needs it) and it arrives on an idle queue
  after first paint. Call `SB_LAZY.need('<group>', cb)` at the door of the feature.
- Deferred globals get an empty **stub** in boot-lazy so a bare `SB_CONCEPTS` cannot
  ReferenceError in the gap. **Never snapshot a deferred global into a `const`** —
  that freezes the stub (app.js used to do this with SB_CONCEPTS; it no longer does).
- Every load fires an `sb-lazy` event; app3's listener drops the pools memoised while
  the data was missing (`_catStatic`, `_wIdx`, `_wohPool`, `_wdb`, `_sndCache`,
  `_themeCache`, `state.conceptData`). Add yours there if you memoise from lazy data.
- The core library is **sharded**: `words-data.js` is the easiest 8,000 words,
  `words-data-2.js` the other 32,944 (idle). `words-patch.js` is now
  `SB_WORDS_PATCH()` so its QC pass re-runs over the second shard; the words-lore
  merge is re-entrant for the same reason. Regenerate with
  `voice/pipeline/words-shard.js` and `words-lore-split.js`.
- Avatars: `avatars/s/` holds 192px renditions (9KB vs 348KB). `SB_AVATAR` serves them
  at ≤96px. Regenerate with `voice/pipeline/avatar-thumbs.py` after any avatar change.
- World art: `app-art/w-<world>-r<2|3>.jpg` (26 banners) is cut from the book series'
  strips by `voice/pipeline/app-banners.py`. The Word Atlas, the theme pages and the
  home Atlas tile all draw from it — one visual language with the books.

## Concepts is ONE library
- `state.conceptData` = free `SB_CONCEPTS.chapters` **concat** `SB_ADV_CONCEPTS.chapters`.
  Advanced is always **appended**, never interleaved — concept narration is indexed by
  position (`voice/c<i>-<n>.mp3`), so inserting anything would remap every clip.
- `isConceptUnlocked` gates `ch.adv` on the Advanced Pack alone (no coin unlock).
- The hub is **shelves = families** (`conceptChapters()` groups by `catGroup`), and a
  shelf is either free or Advanced Pack, never both. The four advanced families are
  Bee day / Deep spelling / Far origins / Word building (`ADV_FAMS`).
- Word Journeys and the champion tip deck are "also here" covers in the same grid.

## Theme Journeys teach first
- A theme opens on its authored explanation (`theme-lore.js`, one entry per theme:
  idea / how to spot it / what trips people up) and then hands over to the coach and
  the vocabulary engine through Learn · Cards · Practice · Vocab tabs.
- Themes classify by meaning (`re` against the definition, or a baked `w.t` tag) OR by
  **origin** (`ore` against `w.o`) — the origin families and the seven eponym clusters
  use the latter. `tag` + `ore` together means two conditions ("an eponym whose name is
  French"). Every new theme needs a `theme-lore.js` entry.
- A theme with fewer than `THEME_MIN` (12) words says so and offers no level ladder.

## Verify (headless)
- `node -c app3.js && node -c saga2.js && node -c voice-review.js` after edits.
- Playwright: chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`,
  `NODE_PATH=/opt/node22/lib/node_modules`, module `playwright`. Load
  `file://…/index.html`, drive engines via `window.SB_SAGA_ENGINES`, assert no pageerror.

## Ship
- Commit to `main`. GitHub Pages serves from **`gh-pages`** (app minus `voice/`); voice is
  served from `main` via `voice-cdn.js`. Update the changed app files onto `gh-pages` via
  a `git worktree`; leave mp3s on `main`. Verify a raw voice URL returns 200.
- **Cache busting (do BOTH every deploy):** bump the `?v=` stamp on every asset URL in
  `index.html` (one `sed -i 's/?v=OLD/?v=NEW/g'`) so devices never run stale JS, and bump
  `SB_VOICE_VER` in `voice-review.js` whenever voice clips changed.
- Commit trailer:
  ```
  Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01QWsiRQxQMXwKsQoppGtYWa
  ```
