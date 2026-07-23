# Bizzing Bee — Deep Test Findings · 2026-07-23

Automated + static deep test of the current build (branch `claude/apply-bundle-push-p0sl6r`),
run headless (Chromium/Playwright, `file://`) plus source analysis. Personas taken as-is from
`TESTING-PERSONAS.md`; protocol refined in `TESTING-PROTOCOL.md`.

**Headline:** the app is in strong shape. 0 boot errors, all 14 saga engines construct and
render, no layout overflow at any size, the whole voice library is present as one Google
voice, purchases/PIN are gated, and definition masking is now effectively leak-proof
(incl. inflected "plural of / past tense of" entries). The real gaps are **accessibility
controls** and the **absent alternate-senses layer** — both persona-blocking, neither a crash.

---

## What was tested (automated evidence)

| Area | Method | Result |
|---|---|---|
| Boot / console | load `file://`, capture pageerror + console.error | **0 errors** |
| Navigation | render all 8 tabs (home, coach, games, explore, shop, progress, collection, settings) | **8/8 render**, non-trivial content |
| Saga engines | instantiate all 14 via `SB_SAGA_ENGINES`, run 450 ms, sample canvas | **14/14 construct, 0 throws**; 5 canvas engines draw non-blank pixels |
| Input modes | static scan of the 5 canvas engines for key + touch handlers | **all 5 have keydown AND pointer/touch**; DOM engines use focusable `data-act` buttons (both modes) |
| Layout | 380 / 820 / 1366 px × {home,coach,games,progress} | **no horizontal overflow anywhere** |
| Theme | render in Light / White / Dusk | **all 3 render** |
| Voice files | disk check of short-word gauntlet + tricky words | `sit pole six who salmon feats cog tomb arc horror giraffe receipt pneumonia` → **all present** (41,652 clips) |
| Definition masking | 1,557-word sample of the 40,465-word corpus; blank then leak-scan | **0 leaks** (def + sentence) |
| Inflected masking | all **100** "plural of / past tense of X" entries | **0 real leaks** after fix (was 2) |
| Definition quality | 2,024-word sample | 82% have example sentence · 0% too-short · 1% technical phrasing |
| Purchases | stub `window.confirm`, call buyTheme(locked)/buyPower/buyList | **all 3 require confirm** |
| Parent PIN | set PIN, attempt Settings + Parent zone as kid | **both gated** (pin dialog blocks) |

---

## Findings (severity-ranked)

### MAJOR — 1. No alternate-senses / WordNet layer
The personas (Priya, Sofia) and the old protocol assume a "WordNet alternate-defs layer" with
a second sense for homographs. The corpus schema has **no such field** — entries carry a single
`d` (definition) plus `w,s,p,o,y,bp,m,sy,nt,ps,r,h,t`. Automated alt-sense detection = **0%**.
- *Impact:* a competitive prepper / ESL learner asking "what else can this word mean?" gets one
  sense only. The single definitions are rich and clean, but the multi-sense promise isn't met.
- *Fix options:* (a) drop the alt-sense claim from the protocol/marketing, or (b) add a `d2`/`alt`
  field for the ~few-thousand common homographs and surface it under the meaning.

### MAJOR (for Liam) — 2. Accessibility controls are thin
Settings offers **Background (Light/White/Dusk), Text size (Normal/Large), Voice speed
(Slow/Normal), Read-aloud, Style (Playful/Focused), Sound toggle**. Missing vs. the persona
brief:
- **No dyslexia-friendly font** option.
- **No in-app high-contrast** mode (Dusk/White help but aren't a true high-contrast pass).
- **No in-app reduced-motion toggle** — motion only calms if the *OS* `prefers-reduced-motion`
  is set (honored via CSS media query). A kid can't turn it off inside the app.
- **No "remove time pressure" / timer-off** — some engines (Whack-a-Moth, racer pace) are timed;
  there's no global calm-mode.
- *Impact:* Liam (dyslexia) can enlarge text and pick Dusk, but can't set a dyslexia font, force
  high contrast, kill motion, or remove timers from inside the app.
- *Fix:* add a small Accessibility block in Settings: font choice (system / dyslexia), high-contrast
  toggle (`data-contrast`), reduced-motion toggle (sets a class the animations respect), timer-off.

### MINOR — 3. ~18% of entries have no example sentence
82% of sampled entries carry `s` (a sentence); ~18% don't. Sofia/educator value examples.
- *Fix:* backfill sentences for the high-frequency slice, or hide the "Sentence" toggle when absent
  (it already no-ops gracefully).

### MINOR / POLISH — 4. Masking edge cases
After this cycle's fix, inflected clues mask the root everywhere (`plural of ▁▁`, and any later
mention of the root). Residual: a base that ends in `-is/-us/-ss` (rare, e.g. an obscure plant)
can keep the *stem* rule from firing, though the "of X" pointer still blanks the primary mention.
No leak found in the 100-entry pointer set after the fix. Keep an eye on Latin `-is` plurals.

### INFO — 5. Offline / hosting behavior (by design)
On GitHub Pages/`bizzingbee.com`, word audio streams from `raw.githubusercontent` via
`voice-cdn.js`. **Airplane mode breaks streamed voice**; the rest of the app (words, games, UI)
is bundled and works. This is expected — flag it in release notes, not a bug.

---

## Regression re-confirmations (this session's recent work)
- **Word Coach practice** auto-advances: correct → marked complete → next; wrong → saved for
  revision → next; no click needed. Verified (gi advances, mastered/missed recorded).
- **Word Coach Learn cards** carry Complete / Mark-for-revision, no Next button; concept &
  single-word previews keep normal navigation.
- **Top nav** collapses (hover-reveal) **only** in the Word Coach; home/games/etc. stay normal.
- **Bee tip** shows Bizzy at the end in the selected world's font.
- **Arcade word quiz** meaning prompt is now masked (was raw).

---

## Per-persona verdict

| Persona | Come back? | Most likely to quit over | Would love most |
|---|---|---|---|
| **Ahana 9 (iPad)** | **Yes** | nothing blocking; a game she can't parse by touch would be it (none found) | avatar packs + evolving snake/Big Beasts |
| **Marcus 8 (Android)** | **Yes** | text-heavy intros on a couple of DOM games | clear single Google voice, big buttons |
| **Priya 11 (laptop)** | **Yes, with reservation** | **no alternate meanings / roots depth** (Finding 1) | NSF lists + auto-advance drill |
| **Diego 13 (phone)** | **Yes** | if the racer felt babyish (it doesn't — power-ups/villains) | Bee Grand Prix embedded spelling |
| **Sofia 15 (ESL)** | **Partial** | **missing second senses** + 18% no example (Findings 1, 3) | clean, non-technical definitions |
| **Liam 10 (dyslexia)** | **Partial** | **no dyslexia font / contrast / motion / timer controls** (Finding 2) | Dusk mode + Large text + Read-aloud |
| Coach parent | Yes | a wrong definition (none found) | masked meanings, accuracy, printables |
| Busy parent | Yes | a spend without PIN (none — all gated) | PIN + purchase confirm verified |
| Anxious parent | Yes | a dead-end (none found; wrong→revision, not failure) | gentle auto-advance, no harsh copy |
| Educator/ESL | Partial | no alternate senses (Finding 1) | original, clean, attributed definitions |

**Ship recommendation:** no blockers. Address Finding 2 (accessibility) before claiming the
accessibility persona, and Finding 1 (alt senses) before claiming multi-sense depth — or adjust
the claims. Everything else is green.
