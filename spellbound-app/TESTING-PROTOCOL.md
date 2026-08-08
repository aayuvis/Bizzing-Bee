# Bizzing Bee — Testing Protocol (refined 2026-07-23)

The how-to that pairs with `TESTING-PERSONAS.md`. Defines what to test, in what order, on what
devices, how to judge pass/fail, and how to log and release. Reusable every cycle.

> **What changed from the prior protocol** — the app has moved on, so this revision updates:
> voice is now **all Google TTS** (the Kokoro "two-tone" concern is retired for words); there are
> **14 saga engines** (added stageRhythm, constellationConnect, typeBlaster, spellScene); games have
> **evolution/unlock endpoints** (reach the champion form → next chapter unlocks, play continues);
> the **Word Coach** practice card **auto-advances** (correct→complete→next, wrong→revision→next)
> and its Learn cards carry Complete / Mark-for-revision (no Next); the **top nav auto-hides only in
> the Word Coach**; there are **new avatar packs** (Serpent, Big Beasts) and **collectible avatar
> cards** (hero/villain); and definition **masking now covers inflected forms** ("plural of ▁▁").
> The **automated harness (§10)** is rewritten to codify the real globals.

---

## 1. Scope & environments
Test on **every axis that changes behavior**:
- **Input:** touch-only (tablet/phone) **and** keyboard (laptop). Every game must pass on both.
- **Device/size:** small phone (≤390 px), tablet (~768–1024 px), laptop (≥1280 px). Portrait + landscape.
- **Host:** `file://` (bundled/offline), **GitHub Pages** (`aayuvis.github.io/...`, voice streams from
  raw.githubusercontent via `voice-cdn.js`), and **bizzingbee.com** once live (verify the host check).
- **Theme:** Light + White + Dusk.
- **Network:** online, and airplane mode (streamed word audio breaks; bundled app works).

## 2. Test types (each cycle, in order)
1. **Smoke** (5 min) — boots, 0 console errors, home + one game + settings load.
2. **Functional** — every feature does what it claims (§7).
3. **Persona/UAT** — the 6 kids + 4 parents, in character.
4. **Regression** — re-run §8 after ANY code change.
5. **Accessibility** — text-size/voice-speed/read-aloud/motion/contrast (Liam + §7). *Note current gaps.*
6. **Performance** — corpus load; canvas frame-rate on low-end.
7. **Content QA** — spelling/pronunciation/definition correctness + **masking** (§7).
8. **Safety/security** — PIN, purchases, data, back-trap.

## 3. Cycle / phases
- **Phase 0 – Build:** `node -c` every changed `.js`; app boots headless with **0 pageerror/console.error**.
- **Phase 1 – Smoke:** blocker here → stop, fix, restart.
- **Phase 2 – Functional + Content:** §7.
- **Phase 3 – Persona/UAT:** 10 sessions, logged.
- **Phase 4 – Regression + cross-device + hosting:** §8 on phone/tablet/laptop and live host.
- **Phase 5 – Triage + fix + re-test.**
- **Phase 6 – Sign-off:** §9.

## 4. Entry / exit criteria
- **Entry:** syntax-clean; boots with no pageerror; test build on a reachable URL.
- **Exit (ship):** 0 blockers, 0 majors (or an accepted, logged waiver); every persona answers
  "come back = yes" or has a logged reason; §8 green on all 3 sizes; voice + definitions
  content-verified; PIN/purchase verified; masking regression green.

## 5. Severity
| Severity | Definition | Examples |
|---|---|---|
| **Blocker** | Can't proceed / data loss / unsafe | game unplayable by touch; spend without PIN; crash; **wrong spelling of a target word** |
| **Major** | Core value broken for a persona | mispronounced word; wrong/missing definition; a game with no keyboard support; dead-end; **meaning leaks the spelling**; promised feature absent for its persona (e.g. alt senses, a11y controls) |
| **Minor** | Works but awkward | misaligned button; confusing copy; missing example sentence |
| **Polish** | Cosmetic | spacing, color, timing |

**Rule:** anything touching **spelling, pronunciation, or a definition** is at least **Major**.

## 6. Pass/fail
A feature **passes** only if it works **touch-only AND keyboard-only**, on **all 3 sizes**, in
**Light+White+Dusk**, with **0 console error**, and a real persona completes it **unaided**.
"Renders on my laptop" is not a pass.

## 7. Functional & content checklists

**Onboarding / profile**
- [ ] New user → name + avatar + world, by touch; also by keyboard. Age drives difficulty.
- [ ] Parent can adjust age/goal/milestone behind PIN.

**Saga "Bizzy & the Great Unspelling" (14 engines)**
- [ ] Map: acts → 31 chapters, lock state + **star ratings**; replay-to-improve.
- [ ] Each engine — Honeycomb Run, Long Sky (keepFlying), **Bee Grand Prix**, Word Hive,
      Whack-a-Moth, Spell Shield (boss), Spotlight Simon, Unscramble Stars, Word Snake,
      Comb Catcher, **Stage Rhythm, Constellation Connect, Type Blaster, Spell Scene** —
      **start → understand (how-to shown) → finish → stars**, by **both** input modes.
- [ ] **Evolution / unlock endpoint:** the hero visibly evolves as you progress; reaching the
      champion form (e.g. Word Snake → **Vasuki**) **unlocks the next chapter but play continues**.
      Evolution chip shows the current form from the start.
- [ ] **Bee Grand Prix:** steer ◀▶ (keys/drag/touch), power-ups fire on correct spell, ❓ boxes,
      laps/finish/placement correct, car goes straight when unsteered.
- [ ] **Long Sky:** hold-to-float (touch) / Space (key); calm beat after a spell; not too hard.
- [ ] No dead-ends; a wrong answer always offers a path forward.

**Word Coach (practice) — NEW behavior**
- [ ] Practice card **auto-advances**: correct → marked **complete** → next; wrong → **saved for
      revision** → next; **no click required**. Enter/Check both work.
- [ ] Complete / Mark-for-revision buttons show only when idle (skip/defer) or after Show answer.
- [ ] **Learn** cards carry Complete / Mark-for-revision, **no Next button** (Back kept); concept
      cards + single-word preview keep normal Next navigation.
- [ ] Top nav is **always visible on desktop** — no screen and no mode may collapse it or
      hide it behind a hover. (Under 640px it is replaced by the bottom tab bar, which is
      the intended mobile layout, not a collapse.)
- [ ] Today's bee tip shows **Bizzy at the end** in the **selected world's font**.
- [ ] Long words (e.g. *supercalifragilisticexpialidocious*) wrap inside the card, no overflow.

**Voice (critical) — now all Google TTS**
- [ ] Every spoken word crisp + correct, **one consistent Google voice** (`en-US-Neural2-F`); no
      Kokoro remnant for words. (Saga **dialogue/concept** audio is still Kokoro — that's expected.)
- [ ] Short-word gauntlet plays clean: `sit pole six who salmon feats cog tomb arc horror`.
- [ ] Word Voice Tester (Settings): batches of 20, flag ✗ + note, export `voice-flags.json`, Re-review tab.

**Definitions / vocabulary**
- [ ] Meaning **never leaks the spelling** during a spell task — including inflected entries
      ("Plural of ▁▁", "Past tense of ▁▁", and any later mention of the root).
- [ ] Definitions correct, **kid-friendly**, example sentence present (note: ~18% currently lack one).
- [ ] **Alternate senses:** *currently absent from the schema* — test that the app doesn't promise
      what it can't show; if a `d2`/`alt` layer is added, verify it surfaces for homographs.
- [ ] Content reads as original/attributed (no copied copyrighted dictionary text — paid-app).

**Progress / practice**
- [ ] Streak, daily goal, level, accuracy update; miss log → revise list.
- [ ] Advanced Mode + NSF/official lists present & correct; custom list builder; printables.

**Avatars / collection — NEW**
- [ ] Serpent + Big Beasts packs present; rarities correct; snake skins map to Word Snake.
- [ ] Tapping an avatar opens its **collectible card** (stats, lore, one real fact, greeting);
      **villain cards render dark**; hero/villain flags correct.

**Parent dashboard**
- [ ] **PIN** gates Settings, Parent zone, and Premium; kid can't slip in.
- [ ] **Purchases require confirm** (theme/list/concept/power/pack) — no accidental spend; no ads.
- [ ] Weekly report + analytics reflect real activity; nothing leaves the device.

**Accessibility — verify present-vs-missing**
- [ ] Present: Text size (Normal/Large), Voice speed (Slow/Normal), Read-aloud, Dusk/White, Playful/Focused.
- [ ] **Gaps to log until built:** dyslexia-friendly font, in-app high-contrast, **in-app reduced-motion
      toggle** (only OS `prefers-reduced-motion` is honored today), **timer-off / calm mode**.
- [ ] Visible keyboard focus; answer-box autofocus; hotkeys.

**Performance / hosting / offline**
- [ ] Corpus load acceptable on low-end; canvas games ~smooth.
- [ ] On Pages/bizzingbee.com, audio loads (voice-cdn host check).
- [ ] Airplane mode: bundled features work; streamed word audio breaks (expected — note it).

**Visual craft — typography & iconography**

A nine-year-old spots a wrong font or a cheap icon before she spots a wrong answer. These
are not polish items; they are the first thing a child judges the app on.

- [ ] **No generic fallback faces anywhere.** Every rendered element resolves to one of the
      ten self-hosted families (or the Verdana pair in `data-font="easy"`). A screen showing
      Times/Arial/generic-monospace means a face failed to load or a rule bypassed the tokens.
- [ ] **Every face flows from a theme variable.** No hardcoded family names in app UI —
      only `var(--display)`, `var(--ui)`, `var(--body)`, `var(--mono)`, `var(--entry)`.
      Generated export/print documents are the sole exception (no tokens to inherit).
- [ ] **`--mono` (Sono) is for LETTERS ONLY** — spelling tiles, phonetic respellings, the
      typing trainer, tappable word chips. Numbers, counters, percentages, ratings and
      uppercase labels use `var(--display)` with `font-variant-numeric:tabular-nums`, so
      figures stay column-aligned while wearing the world's face.
- [ ] **Switch worlds and re-look.** Headings *and* numeric readouts must both change face
      with the theme. A card whose title changes but whose figures do not is the classic
      regression — it reads to a child as the app breaking.
- [ ] **Iconography is drawn, not typed.** No emoji as primary UI iconography (chapter
      cards, nav, tiles, buttons). Use the glossy-sticker SVG family: 64×64 viewBox, ink
      outline, one gloss highlight, contact shadow, flat fills, no gradient ids.
- [ ] **Every icon has a dark-mode story.** Outlines and contact shadows use
      `var(--ico-ink,…)` / `var(--ico-shadow,…)` so dusk swaps them; no icon relies on a
      near-black main mass, which disappears on a dark card.
- [ ] **Squint test at true size.** Icons ship at 34–40px: the silhouette must read at that
      size, and detail finer than ~2px must be removed rather than shrunk.
- [ ] Icons carry no real company logo, no real person's likeness, and no single-culture
      stand-in for a broad theme.

## 8. Regression suite (re-run after ANY change)
1. App boots, **0 console/pageerror** (headless).
2. Start + finish **one game per engine** (all 14), touch + keyboard.
3. Voice short-word gauntlet plays correctly; one consistent voice.
4. A spell task doesn't leak the word — **including a "plural of / past tense of" entry**.
5. Parent PIN + purchase confirm still gate (theme, power-up, list).
6. Difficulty picker (`setGameDiff`) changes word hardness.
7. Light/White/Dusk × phone/tablet/laptop layout intact, **no horizontal overflow**.
8. Nav + back resolve everywhere (no dead screens); the top nav never collapses.
9. Word Coach auto-advance: correct→complete→next, wrong→revision→next.
10. **Font sweep:** in ≥3 worlds × light/dusk, no element resolves to a generic family, and
    the Daily-goal figures wear the same face as the card's heading.
11. **Icon sweep:** no emoji in chapter cards or nav; every chapter icon renders its SVG in
    both light and dusk, and none vanishes against the dark card.

## 9. Release / sign-off
- [ ] Phases 0–5 complete; §4 exit met.
- [ ] Regression §8 green on phone + tablet + laptop.
- [ ] Voice + definitions content-verified for the shipping set.
- [ ] Safety (PIN, purchase, no data egress) verified.
- [ ] Live host smoke-passed incl. audio.
- [ ] Cache stamp bumped in `index.html`; `SB_VOICE_VER` bumped if clips changed; changelog written.

## 10. Headless / automated harness (fast regression)
Chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`, `NODE_PATH=/opt/node22/lib/node_modules`,
module `playwright`, load `file://…/spellbound-app/index.html`. Globals are **bare names** in page
scope (`state`, `app`, `render`, `SB_SAGA_ENGINES`, `SB_DATA`, `blankHTML`, `ensureCoachWords`,
`listWords`), not on `window`. Seed a child before driving:

```js
state.children=[{name:'T',age:9,theme:'spellbound',avatar:'bizzy',goal:10,coins:400,level:4,
  questPath:'coach',lists:{},missed:[]}];
state.activeIdx=0; ensureLists(state.children[0]); state.screen='app'; render();
```

**The harness is `qa/audit.cjs`, in the repo.** It used to be `scratchpad/deeptest*.cjs`; session
scratchpads are deleted, so by the time it was next needed it was gone and had to be rebuilt from
this prose. Run it as:

```
python3 -m http.server 8991                       # from spellbound-app/
NODE_PATH=/opt/node22/lib/node_modules /opt/node22/bin/node qa/audit.cjs
```

It sweeps 6 profiles (age 8→15, free/beginner/regional, the advanced add-on, the testing unlock, a
parent PIN) x 36 screens x 3 widths, then runs the content, money, PIN, engine, font, look,
accessibility and onboarding checks below. It exits non-zero on a blocker, and it groups a repeated
finding into one line — **one bug showing on 34 screens is one bug**, and a raw list of 320 rows
hides that.

**Four assertions that look right and are not.** Every one produced a confident false positive the
first time this harness ran; the file guards against all four and the comments say why:

1. *"a purchase must call `confirm()`"* — `buyTheme()` legitimately refuses **before** asking when
   the world is not in the child's plan: it opens the upsell and returns. The real safety property
   is **no state change without a yes**.
2. *"a game canvas must have painted after a second"* — gated engines run their frame loop but
   deliberately skip `draw()` until `started`, which the how-to card sets. `keepFlying` reads as a
   dead black canvas until that card is clicked, and paints ~3,000 colours the moment it is.
   **Dismiss the how-to before judging.**
3. *"the widest element sticking out is the culprit"* — the `.w4o-*` ambient bees are absolutely
   positioned far off-screen inside a clipped `.w4-bg`, so they have huge rects and cannot affect
   the page at all. Skip ancestors with **any** non-visible `overflow-x`, not just `auto|scroll`.
4. *"read the look off `getComputedStyle(body)`"* — dusk's dark comes from the fixed `.w4-bg` layer
   painted over body's background, so body reads **white** in dusk and the contrast maths is
   meaningless. **Measure real pixels.** Likewise text size is `#root` `zoom` (via `data-size`), not
   `font-size`, and the accessibility flags land on `<html>`, not on `#root`.

Checks:
- **Boot:** capture `pageerror` + console `error`; assert none.
- **Nav sweep:** set `state.nav` to each of the 8 tabs, `render()`, assert body text > 40 chars.
- **Engine sweep:** `SB_SAGA_ENGINES[name](host,{diff:'easy',world,onUnlock(){}},cb)` for all 14;
  assert no throw, host gets a canvas/DOM, canvas engines sample >3 distinct pixel colors.
- **Layout:** at 380/820/1366 px assert `documentElement.scrollWidth ≤ innerWidth+2`.
- **Masking:** flatten `SB_DATA` → sample ≥1,500 words; `blankHTML(d,w)` then assert the headword
  (and, for "plural/past-tense of X" entries, the base X) does **not** appear as a whole word.
- **Purchase:** stub `window.confirm`; call `app.buyTheme('aurora')`, `app.buyPower('freeze')`,
  `app.buyList('nsf_finals')`; assert each set the flag (confirm was called).
- **PIN:** set `state.parentPin='1234'`; `app.setNav('settings')`/`'parent'`; assert `state.pinDlg` set.
- **Coach auto-advance:** seed `state.sessionWords`, set `state.typed`=word, `app.check()`;
  assert `state.gi` advances and status returns to idle.
- **Font resolution:** `await document.fonts.ready`, then walk `#root *` with text and read
  `getComputedStyle(el).fontFamily`; assert the FIRST family of every element is one of the
  ten self-hosted names (or the `data-font="easy"` Verdana pair). Any other first-family —
  `Times`, `Arial`, bare `monospace`, `serif` — is a failure, not a warning. Repeat after
  `app.pickTheme()` for at least three worlds, since faces load lazily per theme.
- **Theme-font coupling:** on the Home card, assert the "Daily goal" heading and the metric
  values resolve to the *same* family, and that this family changes when the world changes.
  This catches the exact regression where a card's title follows the theme but its numbers
  stay pinned to one face.
- **Icon integrity:** for every id in `SB_TT_ICON_ART`, assert the string starts with
  `<svg viewBox="0 0 64 64"`, contains `var(--ico-ink,`, contains no `<style`, no `url(`,
  and no `id="` (ids collide when dozens are inlined on one page). Then render the chapter
  grid in light and dusk and assert each card contains an `<svg>`, not an emoji text node.
- **No stray emoji in structural UI:** assert chapter cards and the nav contain no
  emoji-range characters as their icon slot. (Emoji remain fine inside prose and flash
  messages — the rule is about iconography.)

Run §10 on every change **before** manual persona testing (Phases 0/1).

## 11. Roles & cadence
- **Per change:** author runs Phase 0–1 + §8 (the §10 harness).
- **Per feature:** §7 functional + content for the touched area.
- **Per release:** full Phases 0–6 incl. all 10 persona sessions on real devices.

## 12. Logging
Use the bug/friction template in `TESTING-PERSONAS.md`. One row per finding; include **severity**
and **input mode**. Track to closure; re-test the item + its §8 line after the fix.
