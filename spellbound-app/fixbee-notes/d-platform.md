# FIX-BEE batch D — platform (N3 tests & gates, N1 offline/PWA, N2 first-load weight, L5 accessibility, N5 privacy)

Branch `fixbee-d-platform`. Written in CLAUDE.md's voice so it can be folded in: the reason
before the rule, the number before the claim.

---

## N3 — Tests & gates: `npm test`, `npm run check`, CI, and a deploy that waits for them

**What changed.**
- `spellbound-app/package.json` (devDependencies only: `playwright` 1.56.1 — pinned to the
  Chromium build this machine has, `/opt/pw-browsers/chromium-1194` — `axe-core`, `esbuild`).
  `npm install` in `spellbound-app/`; `node_modules/` is gitignored and excluded from both
  deploys, as are `package.json`/`package-lock.json`.
- `tests/lib/run.cjs` is the runner. **Discovery is a glob** — every top-level `tests/*.cjs`
  and `tests/*.js` is a test unless it is in `SKIP` with a reason (`ux-personas.cjs`: it writes
  a report to an old session's scratchpad and has no exit code). Helpers live in `tests/lib/`,
  which is not globbed. A file that requires playwright is a BROWSER test, anything else a
  NODE test; node tests run first (a broken data file fails in seconds), then browsers ONE AT
  A TIME (several tests measure time; parallel made them flaky, not faster). Per-test timeouts
  (`TIMEOUT`, default 300s; `result-screen` 1200s because it plays eleven engines for 70s
  each). Each test's output goes to `tests/build/logs/<name>.log`; the run ends with a table,
  the last 15 lines of every failure, and exit 1 on any failure.
- `npm run check` (`--check`) is the **deploy gate**: the node data lints, no default login,
  the PIN, privacy, first-load, offline, the axe pass, loading-state, header-search, tts-once.
  ~3.5 minutes here. A new test joins it either by being added to `CHECK` or by carrying an
  `@check` comment line — so a batch adding a guard does not have to edit the runner.
- `--root <tree>` runs against another tree (copies `tests/` beside it, removes it after);
  `--browser-only` skips the node tests, which read SOURCE text and data and cannot run on a
  minified tree; `--root` also skips, by name (`SOURCE_TEXT`), the nine browser tests that
  assert on source text (see the minified-tree run below). `node tests/lib/run.cjs
  header-search reader` runs a subset by name.
- **Every test's launch line** is now
  `process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => require('fs').existsSync(p))`
  — the env var, else this machine's pinned build if it exists, else `undefined`, which is
  Playwright's own browser (CI). Only the launch line was edited. The runner also exports
  `SB_CHROME` (resolved the same way, falling back to `playwright.chromium.executablePath()`),
  so a test written as `process.env.SB_CHROME || '<path>'` works in CI too.
- `.github/workflows/bee-tests.yml` (repo root): on every push except `gh-pages*`, `npm ci`,
  `npx playwright install --with-deps chromium`, `npm run check`, then the full `npm test`
  (75-minute cap; the full run is ~20 minutes here). The checkout is sparse and partial —
  `voice/w` (1.4GB of word clips) and `books/art` are not fetched; no test reads them, and the
  word clips 404 locally by design.
- `deploy-prod.sh` / `deploy-internal.sh`: **step 0b** runs `npm run check` on the source
  before anything is copied and dies on failure ("Nothing was copied or pushed"); **step 3b**
  minifies the copy (N2); **step 3c** runs the browser half of the check again *against the
  deploy tree* (`--root`, `--browser-only`) and dies on failure, removing the tests it put
  there. Every existing assertion — the CNAME inversion, `.nojekyll`, the stamp match, asset
  references, the art-tree counts, the 24 book stubs, the 250MB budget — is untouched and
  still runs after these steps. There is deliberately no switch to skip the gate.

**Gotchas.**
- **`/home/user/bizzing-bee-staging` exists on this machine** — `deploy-internal.sh` with no
  `STG_DIR` will push. To exercise the gate safely, run it with `STG_DIR=/nonexistent`: it
  stops at step 2 ("no clone") after the gate has run.
- Two tests are FLAKY ON THE BASE COMMIT, measured: `result-screen.cjs` (`combCatcher — "Out of
  catches" · 0 words listed BUT lasted 15s` failed the base full run, passed the final one) and
  `gp-handling.cjs` (pixel seams and the steering window move with machine load: the base
  snapshot run alone failed `city: … 46 RGB across the join`; this branch alone passed once and
  failed once on the same lines). Neither is caused here; both want their thresholds looked at
  by whoever owns the Grand Prix.
- A test that relies on the idle queue having fetched something will now fail: the queue waits
  for a tap (N2). Nine tests needed one line each to ask for their data first (Cross-batch
  edits, below) — and that is the pattern for every new test.
- Under load (four agents on four cores) `gp-handling` and `worlds-splash` each failed once in a
  full run and passed alone; both measure time. Re-run a timing test alone before believing it.
- `deploy-*.sh` now also exclude `fixbee-notes/` (internal notes, like CLAUDE.md, do not belong
  on a public URL).

**Guard and break-proof.** See the table at the end.

**Re-score N3: 4** — every test runs from one command, CI runs on every push, and both deploys
refuse on red. Not 5: CI has not run yet (nothing is pushed from here) and the full suite has a
pre-existing failure.

---

## N1 — Offline / PWA

**What changed.**
- `sw.js`. **The `?v=` stamp is the only version number**: index.html registers
  `sw.js?v=<stamp>` (read from `SB_ASSET_V` at load), the worker names its cache
  `bee-core-<stamp>`, and activation deletes every other `bee-core-*`. The deploy that bumps the
  stamp (one sed over index.html) therefore installs a new worker and a fresh cache; there is
  no second number to forget.
  - **Pages (navigations) network-first**, falling back to the cached document — index.html is
    no-store on purpose and stays that way online.
  - **Same-origin assets cache-first** in the stamp's cache (scripts and CSS are stamped and
    immutable under it; art, fonts and data are kept as fetched and refreshed by the next stamp).
  - **Audio cached as heard, never ahead.** A media element asks for `Range: bytes=0-` and a
    206 cannot be stored, so the worker fetches the clip whole (no Range), stores it and answers
    with it. Word clips from raw.githubusercontent are fetched in `cors` mode (it sends
    `Access-Control-Allow-Origin: *`) so the stored copy is a real response, not an opaque one
    that Chrome pads to megabytes of quota; they live in `bee-voice`, capped at 1,500, which
    survives stamps because the clip URL carries `SB_VOICE_VER`. 128k clips are never
    precached. Offline, a clip never heard fails and the app's existing device-speech fallback
    speaks it — the same path a missing clip has always taken.
  - Same-origin narration (`voice/c*`, `voice/a*`) goes through the same whole-clip path. A
    200 answered to a range request plays fine; a SEEK inside a long clip may restart it. The
    app plays narration scene by scene, start to end, so nothing seeks today.
  - **Warm-up.** The first visit is not under the worker's control (it installs after load),
    so the page posts the URLs it already fetched (`performance.getEntriesByType('resource')`)
    and the worker copies them in — out of the HTTP cache, so nearly free. **Audio is left out
    of the warm-up**: a media element's fetch is not reusable from the HTTP cache, and warming
    it downloaded the splash's 126KB twice (measured).
- index.html `<head>`: `<link rel="manifest" href="manifest.json">`, apple-touch-icon, and the
  registration script — **only on http(s), never under file://**, and only 1.2s after `load`
  so it never competes with the first screen.
- `manifest.json`: standalone, `start_url`/`scope` `./`, theme `#7c5cff` (= the page's
  `<meta theme-color>`), background `#f3efff` (the app's light ground). It is `.json`, not
  `.webmanifest`, so the deploy scripts' asset-reference grep covers it.
- `icons/` — 192, 512, maskable 512, apple-touch 180, all rendered by `tools/pwa-icons.cjs`
  from `../brand/bizzing-bee-icon.svg` (the mascot over the brand purple; no lettering, per
  brand/README.md). The maskable cut scales the bee to 80% so its half-diagonal sits inside the
  40% safe circle Android crops to.

**Guard.** `tests/offline-pwa.cjs`: the manifest validates (sizes read from the PNG header, not
the manifest's word), a first visit installs + takes control + warms a `bee-core-<stamp>` cache
holding the page and app3.js, a planted stale `bee-core-*` cache is deleted; then **the context
goes offline AND the server is shut** (offline emulation alone may not cover a worker's own
fetches) and a reload boots to Home with the speller's name on it; a profile-less visitor gets
the opening page; under file:// nothing registers.

**Re-score N1: 4** — installable and offline after one visit. Not 5: offline covers what was
fetched; a screen never opened online (e.g. the Atlas's concept course) still needs a connection
the first time, and no "available offline" indicator tells a parent which is which.

---

## N2 — First-load weight

**Measured** (tests/first-load.cjs over `tests/lib/serve.cjs`, which gzips like Pages; phone
390×844; everything sent from navigation until 4s of silence, no interaction):

| | before (base, unminified) | after |
|---|---|---|
| new visitor (opening page) | 12.34 MB, 108 requests, JS 11,657 KB | **1.73 MB**, 57 requests, JS 1,219 KB |
| returning speller (Home) | 12.20 MB, 103 requests, JS 11,657 KB | **1.71 MB**, 53 requests, JS 1,219 KB |

(KB = server-counted gzip body + 300 bytes of headers per response. Unminified, the after
figures are 1.93 / 1.91 MB with 1,417 KB of JS — minification is worth ~200 KB. The audit's
41MB/29MB are the same loads uncompressed: localhost serves raw bytes. One thing headless
cannot see: on a real phone Chrome fetches one manifest icon to judge installability —
`icon-192.png` is 40 KB, `icon-512.png` 213 KB; they are full-colour PNGs because nothing on
this machine quantises PNG.)

**Levers, largest first.**
1. **The idle queue waits for the child** (`boot-lazy.js` `afterLoad`). It used to start at
   `load` and pull every file in `IDLE` — 34MB raw, ~10MB on the wire: the second word shard
   (4.5MB gz), etymology (2.1MB), alternate senses (0.9MB)… whether or not the screen that reads
   them was ever opened. Now `FIRST` (`trail`, the Atlas frontier behind Home's journey card) is
   fetched after load; everything else starts on the first pointerdown/keydown/touchstart/wheel,
   and never on its own under Save-Data. `need()` is unchanged — doors still load on demand.
2. **Minify a COPY at deploy** (`tools/minify.cjs`, esbuild: whitespace, syntax, local names).
   app3.js 382 → 277 KB gz. **Decision:** the source stays no-build and readable — the deploy
   scripts minify the tree they are about to push, then run the browser check against THAT tree
   (step 3c). esbuild does not rename the top-level names of a classic script, which is what
   every cross-file bare name (`app`, `state`, `render`) needs; output stays UTF-8 so emoji are
   not escaped. first-load.cjs measures the source served through the same transform.
3. **The arcade engines left the boot path** — `saga-art/*.js`, `saga-art-dom.js`, `saga2.js`,
   ~110KB gz, none of it on Home. boot-lazy `arcade` group, loaded in order through a new `DEPS`
   table (async scripts otherwise run in arrival order). **Doors**: `app.arcadePlay`,
   `app.arcadeMenu`, `app.dbgSaga` are wrapped in boot-lazy at DOMContentLoaded (`app` is a
   top-level const in app3 — a bare name by then) so a tap loads the engines first; app3.js did
   not have to change.
4. **The vector avatar art left the boot path** — `avatars-art.js`, 52KB gz, is only SB_AVATAR's
   fallback for an id with no painting, and all 217 have one (`SB_AVATAR_PNG`). Idle queue.
5. **The book-spine warm-up waits for a tap** (app3 `warmSpines` trigger) — 23 PNGs, ~360KB,
   for a shelf on another tab; the worker keeps them afterwards.
6. **Doors for the data the idle queue used to hide.** With nothing prefetched, three screens
   turned out to read lazy data they never asked for:
   - **the Atlas** draws every stop's sets through `chOf()`, which resolves `gi`/`ai`/`sa` refs
     through SB_CONCEPTS, **SB_ADV_CONCEPTS** (the Advanced Rounds are drawn, locked or not) and
     SB_SOUTHASIA. Opened before those landed it threw in `setsOf` (`chOf(u).words` of
     undefined) — a latent bug on any slow phone before this change, a certain one after it;
     caught by the privacy walk. `advConcepts` joined the `atlas` group and `TRAIL.view` holds
     the hive loader until `trail`, `concepts`, `southasia` and `advConcepts` are in.
   - **`loadConcepts()`** fell back to `fetch('concepts.json')` — a file that does not exist; a
     CORS error under file:// — whenever the course was not in yet. It now asks boot-lazy for
     `concepts` and lets the existing sb-lazy listener finish the job.
   - **KICKS** (boot-lazy): `openBuilder`, `openFinder`, `openTraps` start their data at the
     door but draw at once and redraw as files land (unlike DOORS, which hold the action). The
     header search asks for `words` on focus.

**The test is a RATCHET**, not the family target, because the target is not met and the gate
must stay green: `CEILING` (new visitor 1,800 KB / returning 1,780 KB total, JS 1,260 KB) fails
the test; the family target (1,500 KB / 400 KB JS) is printed every run with the gap. Lower the
ceilings as levers land; never raise them to let a change through. It also fails on any word
clip or narration fetched at boot, any big data shard on the first screen, and any request to
another host.

**What still stands between this and the family budget — measured, with the reason each is
not done here.**
- **`words-data.js`, 594 KB gz of the 1,219 KB of JS.** The obvious move — a few-hundred-word
  boot sample, the 8,000 arriving after — is NOT safe yet, for two reasons found while trying it:
  (a) **app.js line 8 snapshots the global: `const SB_DATA = window.SB_DATA || …`.** Every bare
  `SB_DATA` in app3 reads that const, so a lazy file that *assigns* `window.SB_DATA` is invisible
  to the app; a lazy core tier must APPEND to the existing array (as words-data-2.js does).
  (b) **`defaultStages()` and `journeySorted()` are built once from whatever `SB_DATA.nsf` holds
  at first render** (`chunk = floor(pool.length/20)`), and the sb-lazy listener does not reset
  them — so the 20-stage default track and the Journey's levels are *defined by* the 8,000-word
  boot tier. Shrinking it changes the child's curriculum. It needs those memos reset on the core
  tier's arrival (an app3 edit in the listener) and Home's stage card held until then.
- **app3.js, 277 KB minified.** Needs a code split; four batches are editing it today.
- **The opening splash's sound and art**: a returning speller's load fetches `brand-open.mp3` +
  `hive-buzz.mp3` (126 KB) and `sgw-hive.jpg` + `hive-bee-fly.svg` (88 KB) at boot. That is the
  inline splash script (batch A's, A3). Without it Home would measure ~1.49 MB — under 1.5 MB.
- **The opening page's screenshots and avatar row** (`app-art/shots/*.jpg` 254 KB, eight avatar
  thumbs 84 KB) load eagerly on a new visitor's first screen; they want `loading="lazy"` in the
  landing template (batch A).
- Today's bee tip on Home reads the concept course for a young speller; it now shows its shimmer
  until the first tap (it used to arrive with the idle queue a few seconds in). A fallback to
  `SB_TIPS.young` while the course is lazy would close it (home is batch A's).

**Re-score N2: 3** — from 12.3 MB to 1.7 MB and data lazy per route, with a test holding it. The
family budget (1.5 MB / 400 KB JS) is not met, and the two biggest remaining pieces need app3
work this batch could not do in parallel with three others.

---

## L5 — Accessibility

**Guard.** `tests/a11y-axe.cjs` injects axe-core (devDependency) and runs WCAG 2.1 A+AA over
Home, the Word Atlas, Practice, the Library, the Arcade and Settings (opened over Home), in
light / white / dusk, at 390×844 and 1280×900 — 36 passes. It also checks what axe cannot see in
a snapshot: Tab moves a VISIBLE ring (outline ≥1.5px or a ring shadow) onto each of the first
eight controls on Home; and with `prefers-reduced-motion` nothing on Home runs a CSS animation
longer than a blink. Findings are keyed `rule|screen|look`; anything not in `KNOWN` fails, and a
KNOWN entry that no longer occurs is reported as stale.

**Fixed** (`a11y.css`, a new file loaded last in `<head>` so it wins the cascade and stays out of
index.html's 2,000-line style block that four batches edit; plus three app3 attributes):
- **Focus**: index.html already drew `:focus-visible`, but dozens of inputs carry INLINE
  `outline:none` (the header search, settings numbers, date pickers), which beats any rule that
  is not `!important`. Tabbing into the header search showed nothing.
- **White chips on colour** (Arcade "Play" `.arc-cta`, Library `.lib-go`): amber 3.4:1, pink 2.8,
  teal 3.0. The colours are the tiles' identity, so the type carries a tight dark halo instead
  (axe reads text-shadow; so does the eye).
- **Spine titles**: ink() chooses white or near-black against each volume's colour — but the
  colour was only in the PNG; the button behind it was transparent. `--a` on `.bk-sp` (libShelf)
  puts the spine colour under the art: invisible when it loads, a readable spine when it fails.
- **Dusk's accent** (#9B82F2) is used as TEXT on dusk surfaces (3.2–3.8:1) and as a FILL under
  white text (3.1:1). No single violet passes both; the two uses are split by mixing the world's
  own accent — lifted 45% toward white for type, sunk 38% toward black for fills — through
  `color-mix`, so it works in every world. The templates write these colours inline (158
  `color:var(--accent)`, 108 accent fills with white type in app3), so the dusk rules use
  attribute selectors (`[style*="color:var(--accent)"]`). **That is a stopgap**: the real fix is
  an `--accent-ink` / `--on-accent` token pair used by the templates. The top nav already uses
  the design system's `--action-ink`; three dusk worlds (spellbound, galaxy, blade) never set it.
- **Sign out**: `--bad` as small text — 4.3:1 light, 2.5:1 dusk — given its own reds.
- **Labels** (Settings, app3): the three daily-target number fields, the milestone date and the
  device-voice `<select>` had no accessible name.
- Reduced motion was already right (index.html's global `prefers-reduced-motion` rule and the
  in-app `data-motion="off"` switch); the test now holds it. Icon-only buttons on these six
  screens all have names (axe `button-name` passes).

**KNOWN, for the orchestrator after merge** (in-app3 areas other batches own):
- `color-contrast|practice|light/white/dusk` — **batch C (Practice)**: the path tiles' "Choose
  this path / Continue" chips are white 12.5px on the path colour (`p.col`: teal #13A892 3.0:1,
  violet #7C5CFF 4.3:1), inline in the practice-paths template (app3 ~8800). Fix: a dark text
  halo like `.arc-cta`'s, or darker chip fills.
- Not measured by this test (theme coverage): the dusk rules above are world-agnostic, but only
  the Hive world is walked. The light accent #7C5CFF itself is 4.35:1 under white text — under
  AA for type below 18.66px bold; it passes today only because most such type is large.

**Re-score L5: 4** — automated, three looks × two widths, focus and motion asserted, contrast
clean outside one known chip. Not 5: dusk contrast leans on attribute selectors until the
templates get an ink token, and only one world is walked.

---

## N5 — Privacy by construction

**Guard.** `tests/privacy-requests.cjs` serves the app as a HOSTED origin (`bee.test` mapped to
the local server, so voice-cdn.js streams word clips from raw.githubusercontent exactly as on
Pages), routes every request (none leaves the machine; off-origin ones get a 404), and walks:
the opening page, a returning speller's Home, the Atlas, Practice with a word played, the
Library, a book in the reader, the Arcade, Settings, the parent zone. It fails on any host not in
`NAMED` (raw.githubusercontent.com; aayuvis.github.io for the reader's cover art), on any named
host privacy.html does not mention, on the child's name in any URL or body, on any POST, on a
saved profile with a birthday/email/photo/phone/location field, and on an external `<script>`
or tracker string in index.html.

**privacy.html** (effective date → **2 October 2026**; edits confined to §6 and the date line so
batch A's bizzing.activity sentence merges cleanly): §6 now names the hosts the app contacts
and adds "The offline copy" — what the service worker keeps on the device, that it is the app
and not information about the child, that nothing is fetched ahead beyond what the app loaded,
and how to clear it.

**Re-score N5: 4** — every request on a full walk is to a named host, nothing carries the child,
nothing is posted, the policy names what it must. (Accounts optional on the landing page is
batch A's.)

---

## Cross-batch edits (smallest possible; listed so the merge can check them)
- `app3.js` (Library/boot, ~line 3690): the spine warm-up trigger moved from idle-after-boot to
  the first pointerdown/keydown.
- `app3.js` `libShelf()` upright spine: `--a:${b.a}` added to the button's style.
- `app3.js` `viewSettings()`: `aria-label` on the target number inputs, the milestone date input
  and the device-voice select.
- `trail.js` `TRAIL.view`: holds `hiveLoader` until `trail`/`concepts`/`southasia` are ready.
- `app3.js` `loadConcepts()`: asks boot-lazy for the course instead of fetching a concepts.json
  that does not exist.
- Tests touched beyond the launch line, each with a comment saying why: `gp-handling`, `gp-kart`,
  `gp-world`, `gp-landscape`, `result-screen`, `atlas-alive` (wait for the lazy `arcade` group),
  `header-search` (wait for `words` after focusing), `back-pill` (wait for `atlas`),
  `list-builder` (wait for `themes`+`lists`), `loading-state` (have the concept course in hand
  before forcing the waiting state — the lazy load would otherwise resolve it mid-case).
  **The pattern for any test written from now on:** a test that reads lazy data must ask for it
  (`await pg.evaluate(() => new Promise(r => SB_LAZY.need('<group>', r)))`) — the idle queue no
  longer runs unless the page sees a pointerdown/keydown/touchstart/wheel, and `page.evaluate`
  is none of those. (`page.click` and `keyboard.press` are.)
- index.html: no change to the inline splash script, the `app3.js` tag or the line before it.

## Tests added, and each one broken once

Every break put the OLD behaviour back in the worktree, ran the test alone, and restored the
file from a saved copy (`cmp`-identical, and `git diff` clean afterwards).

| test | the break | result |
|---|---|---|
| `tests/lib/run.cjs` (the runner) | a new `tests/zz-break.cjs` that exits 1, never registered anywhere | discovered by the glob, reported FAIL, run exit code 1 |
| `deploy-internal.sh` gate | `SB_TEST_TIMEOUT=1` (every check test times out), `STG_DIR=/nonexistent-staging` | `ABORT: npm run check FAILED … Nothing was copied or pushed.` — stopped at 0b, before step 1. Green: 15/15 in 195s, then on to step 1 and the (intended) missing-clone stop at 2 |
| `tests/first-load.cjs` | boot-lazy starts the idle queue at `load` again (the old behaviour) | **6 FAILED** — 11.8 MB / 11.3 MB of JS on both first screens, and the data-shard list (words-data-2, words-lore, concepts-data, voice-words, quotes-lib…) |
| `tests/offline-pwa.cjs` | the service worker is not registered (index.html) | **6 FAILED** — no worker, no stamp cache, no warm-up, no stale-cache cleanup, offline reload boots nothing |
| `tests/privacy-requests.cjs` | a `fetch('https://stats.example.com/collect')` in `<head>` | **1 FAILED** — `UNNAMED: stats.example.com` (contacted on the new-visitor and home steps) |
| `tests/a11y-axe.cjs` | a11y.css unlinked | **3 FAILED** — no focus ring on the header search (phone + desktop), 11 new rule×screen×look violations |
| `tests/a11y-axe.cjs` (motion) | index.html's global `prefers-reduced-motion` rule emptied | **2 FAILED** — w4-bgdrift, w4-gleam, w4-hexglow-day, w4-motes, sb-bee-bob running under reduce |

**The minified deploy tree** (`tools/minify.cjs` over a copy made with the deploy's own tar
exclusions): the deploy's step-3c subset passes 8/8 (`loading-state` skipped — it reads app3's
text). A FULL browser run against it failed only source-text assertions — living-* (comments and
quoted art keys in trail.js), reader (a quoted path), ux-826 (quoted timings), loading-state,
result-screen (an engine's `toString` must contain `SGUI.result`, a local that minification
renames; all eleven engines still ENDED on their result screens), telemetry (backend.html is
never deployed) — and atlas-alive, which opened a game through the new lazy door inside 400ms
(fixed: it waits for the engines). Those nine are skipped by `--root`, by name, with the reason.

## The full suite, sequentially, at the end (`npm test`, 2 Oct 2026, this branch)

52 passed, 1 failed (`gp-handling` — the base-flaky seam check above), 1 skipped
(`ux-personas`, a report), 1,155 s. The base commit, same runner: 48 passed, 1 failed
(`result-screen`), 1,043 s. New tests on this branch: `first-load`, `offline-pwa`,
`privacy-requests`, `a11y-axe` (and the runner itself). `npm run check`: 15/15 in 195 s.
