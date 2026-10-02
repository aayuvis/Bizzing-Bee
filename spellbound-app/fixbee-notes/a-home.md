# FIX-BEE batch A — first run, Home, navigation, the family top bar, the Hive, demo

Branch `fixbee-a-home`. Rows: A3 (+ N5's "accounts optional"), B1/B2/B3, B6, B7 + O4, O3, demo
(§14). Everything family-shaped lives in one new file, **`family-shell.js`**, so app3.js only
calls into it; the Hive drop-in is ported as **`bizzing-activity.js`**. Both load `defer`
immediately before app3.js. No voice or audio files were generated.

## The shape, in one paragraph
`family-shell.js` holds five things that every Bizzing app does the same way: the ONE next
step (`SB_NEXT_STEP()` / `app.goNext`), the hash router (`boot`, `afterRender`, `onPop`,
`applyRoute`), the Hive feed (activity minutes + milestone snapshots), the household (the
child switcher and the per-child word book) and demo mode. It is loaded before app3, so
nothing in it touches `state`/`app`/`active` at load time — only at call time. app3 calls
`SB_SHELL.install(); SB_SHELL.boot(); SB_SHELL.startActivity()` in `init()` (where the old
back-button trap was) and `SB_SHELL.afterRender()` at the end of `render()`, just before
`save()`.

## A3 — Time to first learning (and N5: accounts optional locally)
- **"Start free" goes straight to setup.** `app.goSignup` opened an email + password form
  whose answers were never stored anywhere — a toll gate with nothing behind it and the
  slowest part of the road to the first word. It now opens onboarding step 0. The auth
  screen still exists behind "I already have an account". `onbBack` on step 0 returns to the
  landing page, not the form. Landing copy: "Start free — no sign-up →", and the risk card
  reads "No account needed to start".
- **No invented child.** `doAuth` in sign-in mode on an empty device conjured "Ahana, level 9,
  a 12-day streak". It now sets a speller up instead (onboarding + a one-line flash).
- **Finishing setup drops the child into the first Atlas stop's lesson.** `onbNext`'s last
  step calls `app.goNext()` after `_finishOnb`. `nextStep()` marks an untouched stop
  (`c.trail.st[uid:lap]` has no `l`/`w`/`p`/`q`, and `SB_TRAIL_HASLESSON`) as `lesson:true`,
  and `goNext` opens the stop and then `trailLesson()` once the concept course has landed
  (`lazyNeed('concepts')`). Zero taps after "Start spelling →"; the brief's bound is three.
- **The splash stays away all of the first day.** `_finishOnb` writes `kid.fr = SB_SHELL.ymd()`
  (local date) and the inline splash script returns early when the active child's `fr` is
  today. A returning child sees it from the next day; legacy children (no `fr`) see it as
  before, so `tests/worlds-splash.cjs` is untouched. The welcome is a welcome BACK.
- **"Find your level" is a choice in setup, not a call to action on Home.** It was already on
  the last setup step (`startLevelTest`, which finishes setup and asks the first word at
  once); the home band strip's calibrating CTA (sheening `startLevelTest`) is gone — the strip
  is a quiet `setNav('beeband')` link whose text says "Still finding it — keep spelling". The
  Bee Band page keeps its own "Take the 3-minute placement" button. `ltGo` and `ltSkip` go on
  through `app.goNext()` instead of to Home.
- The COPPA notice is still on the name step (asserted).
- Guard: **`tests/first-run.cjs`** (15 asserts; real clicks, counted). Break-proof: with
  `goSignup` back on the form, 2 FAIL and the walk aborts; with `goNext` removed from the
  finish, the seeded sign-in, `ltSkip` → Home and the first-day splash skip disabled, 4 FAIL;
  with the Home placement CTA restored, 1 FAIL.
- Re-score **3 → 4** (the done-when is met with zero taps; it stays a 4 because the first
  thing is a lesson card whose narration still needs a tap, not a question).

## B1 / B2 / B3 — Home: one Continue, a progress strip, Continue above the fold
- **The look is unchanged.** Same three rows, same cards, same art. Only the buttons moved.
- **ONE next step.** `SB_NEXT_STEP()` (family-shell) is built on `SB_TRAIL_NEXT` and adds
  `ready`, `label`, `pct` and `lesson`. Home (`viewHome`), the drawer's first "jump back in"
  row (it was "Continue practising · Stage N" — a second, disagreeing next), the end of
  onboarding, the end of placement and `#/continue` all go through `app.goNext`, which reads
  it again at the tap. `viewHome`'s Continue card is `data-act="goNext"` in every state (it
  used to carry `nx.go/nx.arg` or `openTrail`). The only other reader of `SB_TRAIL_NEXT` is
  `viewProgress`, which displays the Atlas and offers no next step; the test fails on any
  third reader.
- **Exactly one filled primary.** The Continue card's Start/Continue is the only control on
  Home painted in the action colour; the journey card's Practise stays an outline button; the
  placement CTA left Home. The test MEASURES this in light, white and dusk on a desktop and a
  phone: a control counts when it, or a part of it that carries a label, has the action (or
  accent) background — a progress bar's fill does not count.
- **One progress strip beside Continue** (`.sb-home-where`): the region (`nx.act`), a
  `role=progressbar` bar for how far along the tier (`aria-valuenow` = `pct`, no total printed
  — the no-big-totals rule) and the level words (`SB_SHELL.levelWords(c)`, which reads
  `beeBand`/`bandStage`). The stop's sub-line no longer repeats the region.
- **Continue above the fold on a phone.** Below 640px `.sb-home-r1` and `.sb-home-r2` become
  `display:contents` and Continue is ordered straight under the greeting (index.html, by
  `nth-child`, so the `cardHold` placeholders order too). At 390×844 the button's bottom is
  654px against a 776px tab bar; it used to be ~1040px.
- **Double escaping fixed on Home.** `trunc()` already escapes; every `esc(trunc(…))` in
  `viewHome` printed `&amp;` ("Vowels &amp; Magic E"). They are `trunc(…)` now.
- Guard: **`tests/home-continue.cjs`** (44 asserts: two children × desktop/phone × three looks,
  anatomy, the shared function three ways, and a static scan for stray `SB_TRAIL_NEXT`
  readers). Break-proof: Practise painted primary + Home reading the frontier itself + the
  drawer back on "Continue practising" + no strip + the phone order removed → **25 FAIL**.
- `tests/nav-hive-band.cjs` asserted the placement sheen. The brief reverses it, so it now
  asserts there is NO sheen and NO placement CTA on Home (comment in the test says why);
  watched to fail with the CTA restored (2 FAIL).
- Re-scores: **B1 3 → 4**, **B2 2 → 4**, **B3 3 → 4**. Not a 5: Home still carries seven cards
  of equal shape, and the Atlas's own "Next stop →" after a cleared stop walks `seq()` rather
  than calling `SB_NEXT_STEP` (it is the same order, so it agrees at the frontier; on a replay
  it means "the stop after this one", which is a map control, not a next step).

## B6 — Navigation and back
- **State is mirrored into the hash after every render** (`afterRender` → `syncHash`): a new
  route is `pushState`d, a route reached by Back is `replaceState`d. Routes: `#/home`,
  `#/atlas`, `#/atlas/<course>/<act>`, `#/atlas/ultra[/<i>]`, `#/stop/<unit>[/words|/quiz]`,
  `#/check/<course>|<id>`, `#/concepts[/<i>]`, `#/hive[/<tab>]`, `#/practice`,
  `#/practice/drill`, `#/library`, `#/play[/game]`, `#/grownups`, `#/progress`, `#/level`,
  `#/settings`, `#/welcome`, `#/setup/<step>`, `#/signin`, and `#/<nav>` for the rest.
- **`popstate` maps a route back through the openers a tap uses** (`applyRoute`), so an
  address can never skip a lock (`#/stop/u40` stays shut). Screens that need live sub-state
  restore to their parent (`train` → Practice, `leveltest` → Home, a quiz → its region): a
  drill is never resumed from history, and leaving one stops it (`leaveDrill`: arcade/bizz
  overlays, game timer, typing, `state.game`).
- **Back never leaves the app.** `boot()` turns the first history entry into a ROOT sentinel;
  backing onto it pushes Home (or the welcome page) straight back on. Layers close before a
  screen goes: the arcade overlay, the child menu, the drawer, the PIN dialog, the plan
  sheet. Settings is a pop-up with its own route — Back closes it onto the screen beneath
  WITHOUT re-running that screen's opener (which would reset a quiz under it).
- **Deep links:** any route on load is applied after the first paint; `#/continue` runs
  `goNext`. A reload therefore lands where the child was (tests that reload and then look at
  Home must go Home first).
- **`?from=hive`:** the ⬡ becomes a "← back to my day" chip to the Hive (short "← my day" on a
  phone; the wordmark yields at ≤560px, the hex at ≤400px). Hidden inside a drill.
- The old trap (`pushState({sb:1})` + "Back always goes Home") is deleted.
- Guard: **`tests/hash-nav.cjs`** (15 asserts, real taps and real `goBack`). Break-proof:
  routing off → 3 FAIL then the walk falls out of the app to about:blank; root guard off →
  "three more Backs never leave" FAIL (about:blank); drawer close, Settings close and both
  drill hides off → 4 FAIL.
- Re-score **3 → 4**. Inner sub-state (a concept's card index, coach tabs, the Hive's scroll)
  is not in the route, so Back from inside a deck goes to the previous screen, not the
  previous card.

## B7 + O4 — the family top bar and the child switcher
- **`[⬡] [☰] [Bizzing Bee] [search……] [coins] [theme] [🔒] [avatar ▾]`.** The family's own
  pieces are drawn by family-shell (`hiveBtn`, `lockBtn`, `kidBtn`, `kidMenu`) and placed in
  `viewApp`'s header row (`.sb-fam-bar`). The menu button stays next to ⬡ (Bee's drawer is
  how a phone reaches Search, Revision and Sign out). The header search bar's internals are
  untouched; the coins pill keeps its markup (≤400px it loses its crown and some padding so
  the line fits a 360px phone). The appearance button is the [theme] slot and keeps
  tap-to-cycle / double-tap-focus. **Settings moved into the avatar menu** (and stays in the
  drawer); the bar's own settings icon is gone.
- **56px.** `#root` is zoomed 1.09, so the line is 6.5px + 38px + 6.5px CSS on a desktop and
  8.5px + 34px + 8.5px on a phone (55.6px measured). The brand button's default padding made
  the line 40px tall until `.sb-fam-brand{padding:0;height:38px}`.
- **⬡** links to `https://aayuvis.github.io/Bizzing_Schedule/` and hides only while a drill
  word is live (`SB_SHELL.inDrill()`: a practice drill, placement, an Atlas quiz, a written/
  oral/challenge coach round, a classic game past its menu (`phase` mode/pick/setup) and before
  its result (`status` board/result/done/over), the mock bee on stage, an arcade overlay).
- **🔒** is `setNav('parent')` — the existing mandatory PIN gate.
- **avatar ▾** opens "Children in this household": every child, one tap, no PIN
  (`app.famSwitch` → `switchChild`), plus "My page" (My Hive), Settings and "+ Add a child"
  (behind the PIN). The menu belongs to the route it was opened on (`state.famMenu` holds
  that route), so any navigation puts it away; Escape and the scrim close it too.
- **Switching never mixes data.** Coins, lists, the trail and the avatar were already on the
  child. The mastered-word map, SRS boxes and coach history were HOUSEHOLD-wide
  (`state.luMastered`/`coachSrs`/`coachHistory`, saved as top-level `lu`/`srs`/`chist`), so a
  second child inherited the first one's mastery. They now travel with the child:
  `bookOut(c)` stores the active child's copy on the child (`c._lu`, `c._srs`, `c._chist`) and
  `bookIn(c)` brings the next child's back and deletes it from the child, so the active child
  never carries a stale copy and the top-level keys keep meaning "the active child's". A child
  from before the split (no `_lu`) gets a COPY of the shared book once — nothing anyone
  earned is lost — and the two copies never touch again. `selectChild`, `_finishOnb` (a new
  child starts empty) and `delSpeller` all go through it. `switchChild` also clears every
  running-session field so a drill cannot carry across.
- Guard: **`tests/family-topbar.cjs`** (32 asserts at 1180/390/360px). Break-proof: book swap
  removed, lock and avatar swapped, ⬡ not hidden in a drill, "+ Add a child" without the PIN,
  the bar at its old height → **10 FAIL**.
- Re-scores: **B7 3 → 5**, **O4 4 → 5**.

## O3 — Hive integration
- **`bizzing-activity.js`** is the drop-in from Bizzing_Schedule `integration/` at `d42455e`,
  ported to a classic script (`window.BZ_ACTIVITY = {trackActivity, trackMilestone}`); logic
  and constants unchanged. Note the upstream rule it keeps: opening the app counts as a touch,
  so up to two minutes may be written before the first tap.
- **Minutes:** `SB_SHELL.startActivity()` calls `trackActivity('bee', childName)` once a child
  exists — at boot, or when onboarding makes the first one. The name is read per tick, so the
  minutes follow a switch. Never in demo.
- **Milestones, each once:** after every render (debounced 200ms) `watch()` compares a small
  per-child snapshot `c.hiveMs = {crs, lap, done, title, act, all, band, st}` with the last one.
  The first look is a baseline (nothing for the past). The Atlas frontier moving writes
  `stop` ("Word Atlas stop cleared: <title> · <act>"), and leaving an act writes `world`; a
  higher non-calibrating band writes `band`; a list stage going up writes `mastery`. Diffing
  the snapshot rather than hooking call sites catches every road to a milestone (practice
  gate, quiz pass, checkpoint, testing unlock) and none of them twice.
- **Mastery** is hooked to list-stage advancement (`c.lists[k].stage`), because spaced mastery
  (batch C) does not exist on this branch. When it lands, re-point `snapOf().st` in
  family-shell to the new mastery record.
- **privacy.html** names `bizzing.activity`, says what it holds and that it never leaves the
  device; effective date moved to **2 October 2026**.
- Guard: **`tests/hive-activity.cjs`** (14 asserts, Playwright clock). Break-proof: activity not
  started, the `stop` milestone silenced, no baseline → **6 FAIL**.
- Re-score **1 → 4**. Not done here: the grown-ups pages do not yet link to the Hive's
  grown-ups page (§13) — that is the parent zone (batch C); the wallet (`bizzing.wallet`) is
  batch B's.

## Demo mode (`?demo`, standard §14)
- **A storage sandbox, not a flag.** The first lines of the inline script after `<body>`
  replace `window.localStorage` with an in-memory store when the URL carries `?demo`
  (`Object.defineProperty(window,'localStorage',{get})`, sets `window.SB_DEMO`). Every reader
  and writer on the page — save(), the drop-in, a future wallet helper — reads and writes
  memory, so the real household and the shared feeds cannot be touched by anything, including
  code that forgets to check a flag. (Bee uses no sessionStorage, IndexedDB or cookies.)
  family-shell seeds the sample into the sandbox before app3's `init()` runs.
- **The sample:** Mira, 8–10, the first seven Meadow stops and their checkpoint cleared,
  placement at level 3, 140 easy words mastered (taken from the boot word shard), three
  misses waiting, 13 days played over three weeks. Labelled "Sample" in a strip at the top of
  every screen (with "Leave the sample" → `index.html`) and in the child menu. No splash, no
  Hive minutes or milestones (the shell skips them too).
- Guard: **`tests/demo-mode.cjs`** (11 asserts). It plants a real household, real
  `bizzing.activity` and `bizzing.wallet`, plays the sample hard (a lesson, a cleared stop,
  minutes of input, a direct write to the wallet key) and compares the device's real storage
  byte for byte. Break-proof: sandbox removed, label removed → **6 FAIL** (even
  `bizzing.activity` changed — the drop-in itself has no demo guard; the sandbox is what holds).
- Re-score **A5 4 → 5**.

## Gotchas paid for in this batch
- **`trunc()` escapes.** `esc(trunc(x))` prints `&amp;`. Use `trunc` alone.
- **A test seed needs the whole trail shape** — `{lap, done, chk, seen, st, elap, edone, echk}`.
  Without `edone` the Atlas board throws "reading 'x1'" while counting the Advanced band.
- **A reload restores the route.** Tests that reload and then look at Home must go Home.
- **Inline `display` beats a stylesheet `display:none`** — the coins pill's crown span needed
  `!important`.
- **A layer drawn inside the sticky header lives in the header's stacking context** (z-index
  20): the child menu's scrim covers the bar but not the bottom tab bar, which is why the menu
  is tied to its route rather than relying on the scrim to catch every way out.

## Cross-batch edits (smallest possible, listed for the merge)
- `app.selectChild` and `app.delSpeller` (parent zone, batch C's neighbourhood): the word-book
  swap, and `delSpeller` now keeps the SAME child active when an earlier one is removed (it
  used to clamp the index, silently handing the active seat — and the household book — to
  the next child).
- `viewHome`'s greeting bubble and milestone chip lines: only the `esc(trunc())` → `trunc()`
  fix (batch B owns the streak chip beside them).
- The level words in the Continue strip read `beeBand`/`bandStage` through one function,
  `SB_SHELL.levelWords(c)` — batch B owns the level's content; re-point that one function.
- Coins pill: placement only, plus the ≤400px CSS (crown hidden, padding) so the bar fits.
- `index.html`: two script tags before app3.js (batch B adds the wallet's there too);
  `privacy.html` effective date (batch B also touches it).
- Batch C's "search disabled during a drill": `SB_SHELL.inDrill()` already answers "is a drill
  word live?" for the top bar — share it rather than writing a second definition.

## Tests on this branch
- New, all green, each watched to fail: `first-run.cjs` (15), `home-continue.cjs` (44),
  `hash-nav.cjs` (15), `family-topbar.cjs` (32), `hive-activity.cjs` (14), `demo-mode.cjs` (11).
- Updated: `nav-hive-band.cjs` (the placement sheen is reversed by the brief — it now asserts
  no sheen and no placement CTA on Home).
- The whole browser suite (54 files) was run one at a time. 46 passed first time. Under the
  machine's load (four agents, load average ~14) `gp-handling`, `gp-kart`, `header-search`,
  `hive-store`, `worlds-splash` and `result-screen` failed once each and **passed when re-run
  alone**; `result-screen` failed on a different engine each time and passed alone on this
  branch and on the base commit. `home-continue` was made to wait for the lazy Atlas data
  (a real timing dependency in the test, fixed). **`ux-personas.cjs` fails on the base commit
  too**: it writes its findings to a hard-coded scratchpad path from another session
  (ENOENT) and its onboarding walk still clicks through three steps — test-runner paths are
  batch D's.
- A test seed with a partial `c.trail` makes the Atlas throw (see Gotchas) — on the base
  commit too; it is the seed, not the app.

## Left undone, and why
- **The grown-ups pages do not link to the Hive's grown-ups page** (§13). That is the parent
  zone, batch C's; one line beside its privacy card would do it.
- **Inner sub-state is not routed** (a concept's card index, coach tabs, scroll positions).
- **The Atlas's own "Next stop →" (`trailNextFrom`, `atlasNext('next')`) walks `seq()`**, not
  `SB_NEXT_STEP` — the same order, so it agrees at the frontier; on a replay it means "the
  stop after this one", which is a map control rather than a next step. Left as it is.
- **Batch C's spaced mastery**: re-point the `mastery` milestone (`snapOf().st`) when it lands.
- **Wallet**: `bizzing.wallet` is batch B's; demo mode already sandboxes it.
