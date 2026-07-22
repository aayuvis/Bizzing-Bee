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
- **All word/concept audio is Kokoro** (one consistent voice). Never mix in device TTS as a
  "fix" — rebuild the clip instead (see Voice below). Device TTS is only the silent fallback
  for words with no clip.
- **Never leak the target spelling** in on-screen meaning/definition text (it's masked).
- Games must look **professional** (not boxy/1990s). Use the delivered Claude Design art
  (`SAGA_ART`/`WORLD_ART`/`SB_AVATAR`); hand-drawn canvas is fine when richly shaded.
- **Never** put a real model identifier in commits, PRs, code, or any pushed artifact.

## Architecture map
- `app3.js` — main app: home, practice, settings, avatars, and the **voice layer**
  (`wordClip`/`deviceSpeak`/`WV_BAD`) + the **Word Voice Tester** (`viewVoiceTest`).
- `saga2.js` — the story mode "Bizzy & the Great Unspelling": `ACTS` (6), `CH_META`
  (chapters), and `SB_SAGA_ENGINES` (10 playable engines). `map()` renders acts→chapters
  with stars; `game()` runs one; `beats()` plays dialogue.
- `saga-script.js` — dialogue: `SB_SAGA_SCRIPT[key] = {title, world, intro/win/lose:
  [[speaker, "line", "audioKey"]]}`. `audioKey` → `voice/d/<key>.mp3` (clips optional).
- `voice-words.js` — `SB_WVOICE`, pipe-joined manifest of ~41,143 voiced word keys.
- `voice-review.js` — `SB_VOICE_REVIEW` (Re-review queue) + `SB_VOICE_PRIORITY`.
- `voice-cdn.js` — on `*.github.io`, rewrites `voice/…` → raw.githubusercontent of `main`.
- Saga engines: `engine(host, opts, done)` → `done({win, score, stars})`.

## Adding a saga chapter
1. Append to `CH_META`: `{n, act, title, world, engine, opts, script}` (sequential `n`).
2. Add a `SB_SAGA_SCRIPT[script]` block (format above).
3. Ensure the `world` label resolves in `WMAP`/`SGART.plateForWorld` (else it falls back).
4. Reuse an engine (honeycombRun, keepFlying, beeGrandPrix, wordHive, whackAMoth,
   spellShield, spotlightSimon, unscrambleStars, wordSnake, combCatcher) or author a new one
   (keyboard+touch!). Words come from `pool(n)` by difficulty.
- **Current gap:** Acts II/III/V/VI have ~1 chapter each; fill each act to ~5 (see
  `WIP-HANDOFF.md` if present, or ask the user).

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

## Verify (headless)
- `node -c app3.js && node -c saga2.js && node -c voice-review.js` after edits.
- Playwright: chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`,
  `NODE_PATH=/opt/node22/lib/node_modules`, module `playwright`. Load
  `file://…/index.html`, drive engines via `window.SB_SAGA_ENGINES`, assert no pageerror.

## Ship
- Commit to `main`. GitHub Pages serves from **`gh-pages`** (app minus `voice/`); voice is
  served from `main` via `voice-cdn.js`. Update the 4 changed app files onto `gh-pages` via
  a `git worktree`; leave mp3s on `main`. Verify a raw voice URL returns 200.
- Commit trailer:
  ```
  Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01QWsiRQxQMXwKsQoppGtYWa
  ```
