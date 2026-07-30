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
- `advanced.js` + `adv-concepts-data.js` — the **Advanced Pack** ($49/yr add-on, gated by
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

## Vocabulary progression (separate from spelling)
- Vocab has its **own ladder**, stored on the child at `c.vocab` and **never** on
  `c.lists[key]`. Shape: `{lv, revise, seen, cur, carry, last}`, all keyed by deck
  (`mix`/`easy`/`medium`/`hard`/`champ`/`th:<id>`), so each deck levels independently.
- Flow: study a set of 20 → **Check what you've learned** (one meaning MCQ per word) →
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
