# The Bee Circuit — build step 6: the five Surprise Stops

Built on `claude/amazing-knuth-4aemgz` @ 21816fcbd, beside the core (`circuit.js`, `SB_CIRCUIT`), which was built in
parallel. Everything here is lazy and stands on the contract in the brief; what the integrator must wire is at the end.

## What was built

| file | what |
|---|---|
| `circuit-cases.js` | the case runner — `window.SB_CIRCUIT_CASES` = `pins(act[, {pts, now}])`, `place()`, `open(id)`, `close()`, `drop()`, `peek()`, `cases()`; the action `app.caseOpen(id)`. It reads and writes the season only through the core: `caseState` (null = not yet available: no pin, nothing opens), `caseUpdate`, `caseLate` |
| `circuit-cases-data.js` | GENERATED — the five cases, the cast's names and tells, and each item's own library record (for the rivals' hints) |
| `tools/circuit/build-cases.cjs` | the generator (`--check` compares); refuses a case it cannot run |
| `boot-lazy.js` | `circuitCases` only: REG (one bundle, data then code), GROUP (`words1`, `saga2`, itself), DEPS (`['circuit']`), IDLE (last) |
| `tests/circuit-cases.cjs` | browser: the eight sections below |
| `tests/circuit-cases-data.cjs` | node, `@check`: generated, every word from the script, the build rules, the source rules, lazy, pay above chance |

## The format, as it plays (§7)

1. **Cold open** — two panels cut by CSS from the region's own painting (`app-art/map-<act>.webp`, night-tinted; no new
   art), a clock drawn in code with the case's `clock` line, the impossible thing drawn in code (a list sheet, a glass bell
   case, a packed bag, an empty book stand, a fallen envelope), and the fiction line. A case opened after its next round's
   mail is in (the core's `caseLate`) says its `lateLine` first; Case 3 says its `safeLine` before anything after that (amendment 2).
2. **Scene** — the three `taps` (a short opening of each line until looked at, then the whole line; all three before the
   puzzle — one of them is the planted clue), and the suspects: name and, where the cast gives one, the tell. Never a secret.
3. **Puzzle** — the script's own 8–12 items on the engine the case names, each with a clock (60 s; Calm × 1.5):
   Case 1 Spot the Error (the printed word over the whole list, type it as it should be printed — `color` printed is
   right, as is `colour`); Case 2 the Warm-up's typed spelling from the definition (`case2-spelling-engine`); Case 3
   Origins' sort by home language (options = the case's own languages minus `choicesExclude`); Case 4 Roots (Word Forge is
   not signed off): the four parts' meanings, then the four words typed from their meanings; Case 5 Spot the Error over
   the statements — tap the misspelt word (then type it right) or "All spelled right". The puzzle's board (the list, the
   trail, S-T-R-A-I-T, the parts, the statements found true and untrue) builds as it goes.
4. **Escalation** — its card, once, when half the items are done.
5. **Accusation** — the story's `falseSolution`, the clue board (taps, escalation, Case 4's repeated clue card, the
   puzzle's board), the suspects, three choices. A wrong one: the script's `lookAgain`, struck, and the right clue glows
   (`GLOW` in the generator, with its reasons); a second wrong one leaves the right choice alone and glowing (L6).
6. **Staged reveal** — a line at a time, then every suspect's secret (`case-scenes`: every secret by the end).
7. **Last chill** — and the team photo (drawn from the rivals' faces), recorded for the Hive Post on solve.

## Decisions (and why)

- **Exactly the authored items, at every band.** `case-origins-authored` and `case2-spelling-engine` name the items, and
  every reveal is about its own words (the parrot's dropped letters, S-T-R-A-I-T, three-and-ten fear, the three wrong
  endings). authorNotes *allow* a same-pattern swap through `pick()`; none is taken. Every case word passes the kid-safe
  list at 8 (the generator refuses otherwise).
- **No runtime corpus read.** The hints need each item's record (definition, sentence, origin, etymology line). The
  generator bakes them in from the corpus loaded as the page loads it (`tools/feed-corpus.cjs`) — the My Feed precedent —
  and the node test rebuilds and compares, so the copy cannot drift. `word-door` sees no read.
- **Hints are rivals, from the record, masked** as Mock Bee's Pronouncer's Chair masks (app3 `maskTxt`, then the word and
  any form of it, then its stem; a picked answer by whole word). A rival with nothing for an item has no button. Per case
  (`HINTS` in the generator, reasons there): no Ask Kwame in Case 3 (he is missing); no Mira or Rafi in Case 3 (their
  origin is the answer — Ines gives it, as the build rule says, and an item told that way is right but never paid); no
  Mira in Case 4 (her secret is her doubt about *kai*); Kwame only where Case 4 authors the parts. Case 2's Mira prints
  the authored Greek; for *hyphen* the Greek IS the word, so it is masked like any definition that names its word
  (the authored text is shown in full once the item is answered). Ask Suki: "Breathe out." and +30 s.
- **A miss holds; the answer only on the third.** "After three misses the answer is shown" and the shared miss card
  always shows the answer, so the first two misses hold on a card drawn in the kit's own classes (`sg-misswrap`,
  `sb-miss`, Continue by Enter or tap, keys swallowed, the clock held) that never shows the answer and opens the next
  rival's hint (words first, then Nova saying it twice); the third holds on `SGUI.miss` / `SGUI.missQ` with the answer.
  A clock that runs out is a miss on what is typed, and holds the same way.
- **Pay (L11): one coin, `addCoins('answer')`, per first-time right answer; nothing for finishing.** A TYPED spelling pays
  at once (a guess cannot type a word). A PICKED answer (a language, a meaning, "All spelled right") pays only above
  chance — Word Lore's own rule for picks (`lore.js` `owed`/`settle`): nothing until 60% of the case's picks (at least 3)
  are right first time, then the backlog and one per right after. So the random bot earns 0 and the careful child earns
  one per item. An item once tried (or told) is never a first try again, even after leaving and coming back (`tr`), and a
  resolved item is never asked again — no second pay.
- **Evidence.** A typed item writes what a drill writes: `logBand` on the first try, `markMastered` + `clearMiss` on a
  first-time right, `addMiss` on its first miss. A pick writes nothing (picking is not spelling).
- **The overlay** is an `.arc-play` with `data-route="case/<id>"` (the shell gives it its address and history entry, as
  the arcade's), `data-trap` (Tab stays inside), outside `#root` (no render touches it). One capture key handler while it
  is up: the screen under it never sees a key (Tab excepted); the shared miss card owns the keys while it is up.
- **Words not from the script** are only what a control needs: Back, URGENT (the brief's pin), Look closer, To the
  puzzle, Start / Carry on, Check, Clear, Next, Continue, Done, "Ask <rival>", "Breathe out." (the brief), "Says it twice,
  slowly.", "All spelled right", the item prompts ("The list says", "Clue", "Meaning", "Type it as it should be printed.",
  "Spell it.", "Its home language?", "What does this part mean?", "Tap the word that is spelt wrong, or choose All spelled
  right.", "Now type it the right way."), "Look closer: tap all three.", "What happened?", "Not yet. Have another go.",
  "n more tries before the answer is shown.", "Right, first time." / "Right." / "Here it is.", "Team photo · Hive Post".
  No story line is written or reworded.
- **Reduced motion** (the device's and Calm's `data-motion="off"`): the pin's seal, the clock's hand, the glow and the
  caret are still; the stage's own rules still everything inside it.

## Tests

`tests/circuit-cases-data.cjs` (node, `@check`) and `tests/circuit-cases.cjs` (browser, ~8 min; `ONLY=careful,random,…`
runs sections). The browser test uses the real core (`circuit.js`) when it is on the page after
`SB_LAZY.need('circuit')`; without it a STUB keeps the core's contract (`circuit/BUILD-core.md`): `caseState` null until
the case's trigger round's mail is in, `caseUpdate` merging into `c.circuit.cases[id]` (a solved case stays solved),
`caseLate` = the next round's story mail is in, `boardExtras(act) → pins(act)`. Each child is seeded as the core leaves a
season after those rounds: the halls, each round's story mail (its `cliff`, read), and the `'unseen'` record of every
case those rounds trigger. The pin section injects `pins()` on every render of the board, as `boardExtras` will once
trail.js draws it.

Results, 15 Oct 2026 — on this tree (the stub core) AND on a scratch root of this tree with the real core
(`circuit.js` and its files from `c7e7484c0`, a `boot-lazy.js` carrying both registrations):

- `tests/circuit-cases.cjs`: **169 OK, 0 FAIL on each** (all eight sections in one run, ~8 min): 1 the careful bot solves each of
  the five, wallet = items (12 · 10 · 8 · 8 · 10); 2 the random bot earns 0 in all five (2 lucky first-time picks in each
  of Cases 3 and 4, under the gate); 3 always wrong: every item shown after three misses, 2 holds an item each still the
  same item 1.2 s later, every hold escalates, the answer card shows the answer, 0 coins; 4 keyboard only (Cases 5 and
  3); 5 touch only at 390×844 (Cases 2 and 4), every control a 44px target on every screen; 6 the pin (only once the core
  holds the case's record; a case with none opens nothing, even by name); 7 late (the core's `caseLate`) / safe / Ines /
  Suki / the held clock / a 6-year-old's Dax card; 8 no second pay (11 for 12 items, one missed before leaving).
- `tests/circuit-cases-data.cjs`: all green on both (in `run.cjs --node-only` on this tree: **45 passed, 0 failed**).
- The core's own `circuit-data`, `circuit-mail` and `circuit-store` (node) pass on the scratch root with this step's files.
- Existing tests this touches (boot-lazy): `first-load`, `screens-lazy`, `touch-targets`, `hud-emoji`, `live-prompts`,
  `word-door`, `no-random-rewards`, `pay-path`, `app3-split`, `question-leaks` — all pass (question-leaks once failed on
  the "feed" tab label, which this step does not draw, and passed on the rerun).

## Proved by breaking

Each fault put in a scratch root of symlinks to every entry of `spellbound-app` with ONE file replaced (`SB_ROOT=<scratch>`);
the tree was never touched. Each was watched to fail:

| break (one file) | test | what failed |
|---|---|---|
| picks paid at once, no gate (`circuit-cases.js`) | browser `random` | c3 and c4 earn 2 each |
| the answer in a `data-w` on the typed box; no glow; secrets on the suspect cards | browser `careful` | the leak (every typed case), "the right clue glows ()", the tells, "no secret before the reveal" |
| a miss resolves and moves on | browser `wrong` | 0 holds, no item ends shown — all five |
| the third miss never shows the answer | browser `wrong` | "held 5 times and never shown its answer" — all five |
| no lateLine; safeLine after the impossible; a hold not stopping the clock; Suki adding nothing | browser `late` | 4 fail |
| a 40px pin; the pin ON a stop | browser `pin` | 2 fail |
| no on-screen keys on a phone | browser `touch` | 2 fail |
| the tried mark not kept across leaving | browser `resume` | the item comes back first-time; 12 paid, not 11 |
| a tap hand-edited in the data (`circuit-cases-data.js`) | node | generated; every story string from the script |
| Ask Kwame in Case 3 (`circuit-cases-data.js`) | node | generated; no Ask Kwame |
| Math.random, an `<input>`, `addCoins('contest')` at Done (`circuit-cases.js`) | node | the three source checks |
| circuitCases off the idle queue (`boot-lazy.js`) | node | lazy |
| circuit-cases.js in `index.html` | node | first load |
| `open()` not asking whether the case is available | browser `pin` | 2 fail (Case 2 opens by name, writes a record, then pins) |
| availability read from the trigger hall, not the core's record | browser `pin` | a pin before the mail |
| lateness read from the next hall, not `caseLate` | browser `late` | the lateLine on time |

Three faults the tests found in the code on the way, each fixed: the browser's Back re-pushed `#/case/<id>` (the shell's
popstate handler runs first — now closed on `navigate`); Enter after the third digit in the scene re-pressed the third
tap (focus now moves to the next unlooked thing, then the way on); a hold escalated nothing in Case 3 once Theo was open
(Nova now comes next).

## What the integrator must wire

Built against the core's real API (branch `worktree-agent-a177fdd5fb0c47f3d`, commits `21a93a4ec` + `c7e7484c0`,
`circuit/BUILD-core.md`) and tested against it in a scratch root (this tree, with the core's `circuit.js`,
`circuit-data.js`, `store.js`, `app3.js`, `app3-me.js` and a `boot-lazy.js` carrying both registrations).

1. **`boot-lazy.js` conflicts with the core's, and both halves stay.** The merged lines:
   - REG, after `scrTools`: the core's `circuitData: 'circuit-data.js'`, `circuit: 'circuit.js'`, then this step's
     `circuitCases: ['circuit-cases-data.js', 'circuit-cases.js']`;
   - GROUP: the core's `circuit: ['circuitData', 'circuit']` and `circuitCases: ['words1', 'saga2', 'circuitCases']`;
   - DEPS: `…, library: ['libIndex'], circuit: ['circuitData'], circuitCases: ['circuit'] }` (the core's REG key IS
     `circuit`, so this step's DEPS line needs no change);
   - IDLE: `…, 'ttIcons', 'circuitData', 'circuit', 'sync', 'circuitCases']`.
2. **The core already does its half**: `caseState` is `null` until the trigger round's story mail is in (the runner
   puts up no pin and opens nothing for such a case, even by name); `caseUpdate` keeps this step's fields (`at`, `res`,
   `tr`, `pp`, `seen`, `solvedAt`, `sticker`, `acc`, `dismissed` — names of letters, strings under 64 characters, the
   record far under 4 KB; `circuit-mail.cjs` holds it); `caseLate` decides the lateLine; `boardExtras(act)` returns the
   envelope and `SB_CIRCUIT_CASES.pins(act)`. A core without `caseState`/`caseLate` falls back to the halls (trigger
   round's hall done / next round's hall done) — one function each in circuit-cases.js, `avail` and `isLate`.
3. **The board draws `boardExtras(act)`** (the halls build, trail.js): inside `.act-board` beside the `.atlas-stop`
   buttons, on every render of the board. The core calls `pins(act)` without `{pts, now}`, so `pins()` places the pin
   itself on the next frame from the stops' own `left/top` (and moves it into `.act-board` if it was dropped elsewhere).
   `boardExtras` draws pins only once `SB_CIRCUIT_CASES` is loaded: `circuitCases` is on the idle queue and its landing
   re-renders, but a board opened before then shows no pin until it does — if that matters, ask for it at the board's
   door (`SB_LAZY.need('circuitCases')`) or add `circuitCases` to the core's `circuit` group.
   Solving a case queues the core's moment card ("Solved."), which shows the next time a board draws `boardExtras`.
4. **family-shell.js, two lines** (not this step's file):
   - `applyRoute`: `if (head === 'case' && p[1]) { lazyNeed('circuitCases', function () { SB_CIRCUIT_CASES.open(p[1]); }); return; }`
     — today a typed or forwarded `#/case/c1` lands on Home (inside a session the overlay's own address and Back work);
     an unavailable case opens nothing, so the address cannot skip story order;
   - `leaveDrill`: `try { if (window.SB_CIRCUIT_CASES && document.querySelector('.cc-play')) SB_CIRCUIT_CASES.drop(); } catch (e) {}`
     — takes the overlay away (without touching history) before a route re-syncs the address, as `arcadeClose()` does
     for the arcade. Until then the runner closes itself on the Navigation API's `navigate` event, which fires before the
     traversal (Chromium), and where there is no Navigation API on popstate, putting the screen's own address back on the
     entry (a duplicate history entry is possible there). The shell's popstate handler is registered at boot, so it runs
     before any listener of a lazy file — that is the whole reason.
5. **The Hive Post** draws the team photo for a case whose record says `sticker: 'team'` (state `solved`).
6. **Activity log.** A case writes no `logActivity` line (no hall, no round); if the parent log should show cases, add
   it at solve in `accuse()`.
7. After the merge, re-run `tests/circuit-cases.cjs` and `tests/circuit-cases-data.cjs` on the merged tree (they passed
   on the scratch root above; the results are under Tests).
