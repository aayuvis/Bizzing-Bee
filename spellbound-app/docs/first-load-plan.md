# First load: where it stands, and the plan to ≤ 400 KB of JavaScript (road to 4.5, P1.13)

The P1 exit gate says **first-load JS is ≤ 400 KB gzip**. This file records the measurement on 10 Oct 2026, says
exactly what this batch moved, and sets out the plan for the rest: app3.js split by screen, and the boot word shard
taken off the first screen. The next step can work straight from it. The ratchet that holds the gains is
`tests/first-load.cjs`. The app3 numbers come from `node tools/app3-split-map.cjs`, a read-only analysis.

## Outcome (10 Oct 2026): done — 369 KB of JavaScript on both first screens

The three steps below landed in order, each committed on its own (CLAUDE.md "Road to 4.5, P1 — the boot word tier is
lazy" and "Road to 4.5, P1 — the app3 split" carry the rules). `tests/first-load.cjs` now holds **400 KB as a hard line
for both screens** beside its ratchet.

| | before | step 1 | step 2 | step 3 |
|---|---:|---:|---:|---:|
| new visitor, JS gz / total | 905 / 1184 | 554 / 833 | 411 / 691 | **369** / 649 |
| returning speller, JS gz / total | 980 / 1276 | 629 / 909 | 487 / 782 | **369** / 665 |

**Where the code disagreed with this plan, and what was done instead:**
- *Step 1, "words1 fetched at DOMContentLoaded on Home (like FIRST)".* That is inside the measured window (everything
  sent until 4 s of quiet) and would have counted the 353 KB it removes. The bundle is FIRST on the idle queue (the
  first tap) and in every group a word is read through; a tap, an address or the end of setup that needs words waits
  for it (the hive loader).
- *Step 1, "the ladder with homIndex fixed to the shipped sounds-data.js".* Measured on the build before: a returning
  speller's first render had no `SB_HOM` (sounds-data.js is lazy), and it scored every boot record then, for the visit.
  The ladder is generated with NO homophone bonus, and `trickSeal` scores the tier the same way when it lands — so the
  ladder and every list order are what children have been climbing.
- *Step 1, the curriculum file.* The ladder (25 KB gz) is not on a first screen at all: Home never reads it once its
  dead list counts are deleted (`viewHome` computed fourteen locals it never printed — that, not the cards, was the
  first-paint read of every boot record). It rides in the `words1` bundle as `curriculum-ladder.js`; only the stages and
  the word of the hour's seed (~17 KB gz) are a boot script.
- *Step 1, the word of the hour.* The seed is ~150 words a band, as planned (the full band pools are 174 KB gz), cut
  evenly from each pool; so the hour's word differs from the old build's. Every other card on Home is byte-identical.
- *Step 1, not in the plan:* the Journey's Scripps sprinkle depended on load timing (a child ON the journey never had
  it); it is pinned off. `words-data.js` keeps its `window.SB_DATA={…}` form — boot-lazy makes SB_DATA one object that
  an assignment merges into — because five tools rewrite that file in that form.
- *Step 2, "unreached (audit before moving)".* A node nothing reaches stays in app3.js, and so does everything it names
  (iterated) — otherwise app3 would name a lazy file's code. Shared came to ~11 KB gz. app3.js went 307 → 165 KB gz
  (minified); the seven lazy files are ~157 KB gz between them.
- *Step 2, the pop-ups.* overlays() reaches its lazy pop-ups through `scrDraw(group, () => viewX())` behind their flags
  (two moved their flag check out to the call site); a bare function argument would be read before the file exists.
- *Step 2, not in the plan:* an engine whose host view moved to a lazy file must not land before it. gym.js's `open()`
  starts a round as soon as its group is in and its keys reach only DOM on the page, so the `gym` group carries
  `scrShared` + `scrGames` (spelling-gym T3 caught a lost Enter; screens-lazy §3 holds it).
- *Not in the plan, found by the suite:* more doors fetch more files at once after the split, and a door of a dozen
  scripts froze Chromium mid-frame one run in four (its script-streaming parse starved a three-worker pool). boot-lazy
  now keeps at most two scripts in flight, in order (`addScript`).
- *Step 3, "keep FIRST, on the idle queue".* `trail` was already on the idle queue; FIRST is deleted, and boot-lazy gives
  every first screen one render at DOMContentLoaded (Home used to get it from FIRST — worlds4's late worlds need it).
- *Step 3, "the Home half … into a small boot file".* The frontier arithmetic is ONE copy, `SB_TRAIL_FRONT(T)` in
  trail-home.js, which trail.js builds its helpers from; `SB_TRAIL_STOPS` moved with NEXT and HERE (avatar milestones on
  Home read it). The Library, the Word Gym and the report card carry `trail` + `trailCode` in their groups. The road is
  generated (`trail-home-data.js`, 5 KB gz, by `tools/build-trail-home.cjs`), never cut by hand; trail-home.js is ~2 KB gz.

## How it is measured

`tests/first-load.cjs` serves the tree over `tests/lib/serve.cjs`. That server gzips at level 6, as Pages does, and
serves every `.js` minified, as `deploy-*.sh` ships it. The page is a 390×844 phone, and the test counts everything
sent from navigation until nothing has gone for 4 s. That count includes the service worker's warm-up.

The test covers two first screens:

- **new visitor:** no profile, so the opening page;
- **returning speller:** Home.

For every script on each screen it now prints three sizes: **raw** (the source file), **minified** (what deploy
ships) and **gzip** (the minified bytes at level 6, which is what a phone downloads). The family target is the
gzip figure, and the test ratchets it (`CEILING.js`). It also ratchets the first screen's image bytes
(`CEILING.img`), which is the asset half of P1.14.

## Before and after this batch

| | new visitor | returning speller |
|---|---:|---:|
| **before:** total transferred | 1300 KB | 1330 KB |
| **before:** JS (gzip, as sent) | 1021 KB | 1021 KB |
| **before:** images | 83 KB | 113 KB (atlas-map.jpg) |
| **after:** total transferred | 1184 KB | 1276 KB |
| **after:** JS (gzip, as sent) | **905 KB** | **981 KB** |
| **after:** JS script bytes, raw / minified / gzip | 3906 / 3101 / 894 KB | 4192 / 3378 / 969 KB |
| **after:** images | 83 KB (avatar thumbs, PNG by rule) | 99 KB (atlas-map.webp) |
| new ceilings (`tests/first-load.cjs`) | 1210 / JS 925 / img 90 | 1305 / JS 1000 / img 105 |

The boot scripts were the 42 `<script src>` tags plus `trail-data.js`, which FIRST fetches after load:

- before: **4347.7 KB raw · 3514.8 KB minified · 1007.1 KB gzip**;
- after: **4185.4 · 3375.1 · 968.0** across 39 files.

The new visitor no longer fetches `trail-data.js` (another 75.5 KB).

### Per file, after (gzip of the minified file, level 6)

| file | raw KB | minified KB | gzip KB | on which first screen |
|---|---:|---:|---:|---|
| words-data.js | 1518.2 | 1357.4 | 353.1 | both |
| app3.js | 1402.6 | 1047.0 | 307.2 | both |
| trail-data.js | 285.9 | 276.7 | 75.5 | returning only (FIRST) |
| trail.js | 254.9 | 148.5 | 49.1 | both |
| avatar-cards.js | 55.4 | 48.5 | 20.1 | both |
| worlds4.js | 91.0 | 71.7 | 19.9 | both |
| avatars.js | 69.4 | 57.3 | 17.9 | both |
| icons-art.js | 69.3 | 68.7 | 11.4 | both |
| themes-data.js | 27.2 | 24.2 | 10.6 | both |
| app2.js | 29.9 | 24.7 | 9.9 | both |
| tips-data.js | 23.4 | 22.5 | 9.9 | both |
| app.js | 40.8 | 34.4 | 9.2 | both |
| words-patch.js | 34.3 | 22.4 | 9.1 | both |
| family-shell.js | 42.5 | 20.0 | 7.7 | both |
| quotes.js | 22.5 | 21.2 | 7.6 | both |
| words-extra.js | 17.1 | 16.4 | 6.4 | both |
| avatar-greetings.js | 14.6 | 14.3 | 5.7 | both |
| cover-art.js | 19.2 | 16.5 | 4.6 | both |
| icons.js | 17.8 | 16.1 | 4.3 | both |
| store.js · kid-safe.js | 20.3 · 19.0 | 9.0 · 9.7 | 4.0 · 4.0 | both |
| game-art.js · boot-lazy.js | 13.6 · 25.2 | 9.6 · 7.5 | 3.2 · 3.0 | both |
| 17 more under 2 KB gz each | | | 15.0 | both |

## What moved, exactly

The rule for every move: a first paint must not read it. Each one was measured with a getter on every global the
file defines, logged through Home's and the landing's first paint for four children: a new visitor, and
returning children with Bizzy, a common avatar and a legendary one. Nothing listed below was read. Each file now
reaches the page through boot-lazy (`SB_LAZY`) at its door.

- **`voice-review.js` → `voice-review-lists.js`** (−15.9 KB gz on both screens).
  - The two Word Voice Tester queues (`SB_VOICE_REVIEW`, `SB_VOICE_PRIORITY`) moved to the new file, lazy in group
    `voicetest`. The door `app.openVoiceTest` holds the screen until they land.
  - `SB_VOICE_VER` stays in `voice-review.js`, which is still a boot script. voice-cdn stamps every clip URL with
    it, so it must exist before the first word is spoken.
  - Bump the version there. Add rebuilt words to the lists file.
- **`trivia.js`** (`stv`, −6.9 KB gz). Bee Trivia has been unreachable since the games rebuild: `#/trivia` and
  `openTrivia` go to Word Lore and Hive Mind. It is lazy in group `beeTrivia`, which the trivia-bank leak check
  (`question-leaks`) asks for. `S.nav==='trivia'` already falls back to Play.
- **`trivia-icons.js`** (`ttIcons`, −6.6 KB gz). These are the chapter stickers.
  - Loaded by group `trivtrain` (door `openTrivTrain`) and by `quizhubs` (Hive Mind's tiles).
  - Also on the idle queue, so it works offline after the first tap.
- **`advanced.js`** (`adv`, −10.1 KB gz). app3 already treated `ADV` as lazy: every read is guarded, and
  `ultraUpsell` / `setNav('adv')` ask for the `advanced` group.
  - It is now in groups `advanced`, `atlas` (the Ultra road's pool), `gym` (Champ Dictation), `coach` and `lists`
    (the Ultra list), and on the idle queue.
  - The doors `openAdvanced`, `advJump`, `advGo`, `advConcept` and `arcAdvDict` wait for the code alone (group `advCode`), so they behave as they did when it was a boot script.
- **The Atlas data on the opening page** (−75.5 KB gz, new visitor only). boot-lazy's FIRST (`trail-data.js`)
  used to fire after `load` on every screen. The opening page shows no Atlas, so there FIRST now waits for the
  first tap, like the rest of the idle queue.
  - Every screen past the landing that reads the Atlas already asks for it at its door (`goStep`, `goNext` and
    placement use `lazyNeed('atlas')`).
  - A consequence that `tests/one-count.cjs` caught: the landing had been getting its post-worlds4 render (with
    "80 evolution forms across eight worlds") from that data's arrival. boot-lazy now gives the landing that
    render itself at DOMContentLoaded.
- **Not moved: `words-data.js`, the boot word shard (353 KB gz).** The reason is below, under Step 1.
- **Not moved, though no first paint reads them:**
  - `themes-data.js`: app3's catalogue memo `_catStatic` would freeze without the themes, and the `sb-lazy`
    listener does not drop it for that file.
  - `cover-art.js`: worlds4.js reads `SB_COVER_KIT` while it loads.
  - Both need small app3 or worlds4 changes, which belong to step 2.
- **Read at first paint, so they stay:**
  - `avatar-cards.js`: Home counts the deck through `SB_AV_CARD` across all 96 avatars.
  - `avatar-greetings.js` (Home's hello), `game-art.js` (the second card's mascot), `tips-data.js` (the tip),
    `quotes.js`, and `icons-art.js` (the coin icon in the bar).

`tests/first-load.cjs` fails if any of these comes back on a first screen: the voice-tester lists, trivia, the
Advanced Pack, the library (`library.js`, `words-full/`), or, on the landing, the Atlas data.

## What is left to the 400 KB target (returning speller: 969 KB of script)

| block | KB gz | why it is on the first screen |
|---|---:|---|
| `words-data.js` + `words-extra.js` + `words-patch.js` | 368.6 | app3 builds its curriculum memos from them at Home's first render (see step 1) |
| `app3.js` | 307.2 | one file: every screen's views and actions load with Home |
| `trail-data.js` + `trail.js` + `trail-road.js` | 125.1 | Home's "You are here" card (`SB_TRAIL_HERE`, `SB_TRAIL_NEXT`); FIRST fetches the data at DOMContentLoaded |
| the other 33 scripts | ~168 | the shell, avatars, worlds, icons, the wallet, the family drop-ins… |

Steps 1–3 below take off about **655 KB**. That leaves about **314 KB** for a returning speller and about
**365 KB** for a new visitor, with room to spare under 400.

## Step 1: take the boot word shard off the first screen (−368 KB gz, both screens)

**Why it could not simply be shrunk here.** A Proxy on every boot record, logged through a returning speller's
first render, shows Home touching **all 7,571 records**. It reads `w, d, y, bp, p, t, m` from each, and `o`, `sy`
and `ps` from the one word-of-the-hour record. Four callers do this:

- `defaultStages()`, via `curStage → listStages('default')` (the 20-stage default curriculum);
- `journeySorted()`, via `mastDueWords → wordIndex` (the Bizzing Bee Journey ladder, sorted by `spellDiff`);
- `wohPool(b)`, the word of the hour;
- `trickAnal`, on every record (cached as `_tk`).

All are built **once**, from whatever `SB_DATA.nsf` holds at the moment of the first call. A smaller boot shard
would change the curriculum. Splitting off fields (`o, sy, ps, nt`) would save only about 55 KB, and would make
the word-of-the-hour card rewrite itself when the fields land.

Two more problems sit in this area:

- **The ladder is already timing-dependent.** `journeySorted()` reads `homIndex()` (SB_HOM, from lazy
  `sounds-data.js`). It also reads whatever shard is loaded at its first call: a returning child builds it from the
  8,000-word tier, but a new child whose first call comes after `words-data-2.js` builds it from 41,000 words.
- **`defaultStages()` has the same exposure.** Make both into data and both problems go away.

The plan, in order:

1. **`tools/build-curriculum.cjs` → `curriculum-data.js` (generated; never typed).** It holds:
   - `SB_STAGES`: the 20 default stages as word keys, computed by `defaultStages()`'s exact algorithm over
     `words-data.js` + `words-extra.js` + `words-patch.js`, loaded the way the page loads them
     (`tools/feed-corpus.cjs`);
   - `SB_LADDER`: the journey order as keys, with `homIndex` fixed to the shipped `sounds-data.js`;
   - a small per-band seed for the word of the hour (wohFit, 5–13 letters, kid-safe at 8), about 150 words a band,
     carrying the fields the card shows.

   The test rebuilds and compares, and asserts `defaultStages()` over the shard deep-equals `SB_STAGES`. That is
   the "curriculum identical" guard. Expect about 12 KB gz, and keep it as a boot script.
2. **app3 reads the data.**
   - `defaultStages()` and `journeySorted()` return key lists when `SB_STAGES` / `SB_LADDER` are present, mapping
     keys to records through `wordDB()` once the shard is in.
   - `curStage` and `mastDueWords` need only keys and counts for Home.
   - `wohPool(b)` draws from the seed until the shard lands. It must pin its pick with `settled()`, so the card
     never rewrites.
3. **The shard leaves `index.html`.** `words-data.js`, `words-extra.js` and `words-patch.js` become one boot-lazy
   group, `words1`:
   - fetched at DOMContentLoaded on Home (like FIRST), after first paint;
   - first on the idle queue;
   - in every word door's group (`words`, `card`, `lists`, `coach`, `gym`, `daily`, `themes`, `arcade`,
     `quizhubs`, `mockbee`, `placement`).

   `app.js`'s `const SB_DATA = window.SB_DATA || {…}` must become a stub that the shard fills in place: boot-lazy
   creates `window.SB_DATA = {nsf: []}`, and `words-data.js` pushes into it the way `words-data-2.js` already does,
   so `voice/pipeline/words-shard.js` writes that form. Every memo over `SB_DATA.nsf` must key on its length or be
   dropped on `sb-lazy` `words1`:

   | memo | function |
   |---|---|
   | `_catStatic` | `catStatic` |
   | `_wIdx` | `wordIndex` |
   | `_wohPool` | `wohPool` |
   | `_wdb` | `wordDB` |
   | `_nwIdx` | `nwIndex` |
   | `_corpusBands` | `corpusBands` |
   | `_b2Idx` | `b2Idx` |
   | `_sndCache` | `soundLists` |
   | `_themeCache` | `themeWords` |

   The `sb-lazy` listener at the foot of app3 already drops most of them for `words2`. Give `words1` the same line.
4. **Tests that will notice.** `word-band` (the door and the word of the hour read `SB_DATA` at boot),
   `next-words`, `first-run` (the first word comes from the boot tier), `offline-pwa` (it asserts the boot shard
   loads from cache, so it must ask for `words1`), `home-first-paint`, `one-count`, and every test that seeds a
   child and starts a drill straight away. Each should `await SB_LAZY.need('words1')` the way `mockbee`-users await
   `mockbee`.

## Step 2: split app3.js by screen (−~165 KB gz, both screens)

`node tools/app3-split-map.cjs` parses app3.js with the TypeScript parser. It turns every top-level declaration,
and each of the 582 `app` actions, into a node, weighs each node (its share of app3's gzip, by minified size), and
draws an edge for every name it uses and every `data-act`/`data-inp` its templates dispatch to.

Roots:

- **screens:** viewApp's `S.nav` chain, plus the sheets `overlays()` draws behind a flag and the screens
  `render()` switches to;
- **CORE:** what the first paint and the shell run (`render`, viewApp's shell, `viewHome`, `viewLanding`,
  `viewOnboarding`), plus every name another shipped file calls by bare name.

The bare-name callers are the constraint. Some of them:

| name | called from |
|---|---|
| `wordFlash` | trail.js |
| `overlays` | family-shell.js |
| `viewConceptDetail` | advanced.js |
| `WORLD_HERO` | worlds4.js |
| `arcadeMenu` | boot-lazy.js |
| `arcadeResult` | saga2.js |
| `render`, `flash`, `addCoins`, `nkey`, `active`, `state` | everywhere |

Those must stay where a bare name can see them. The analysis matches names as words, so it over-counts this set,
which errs on the safe side.

| part of app3.js (307.2 KB gz) | KB gz |
|---|---:|
| PAINT CORE: render, the shell, Home, landing, onboarding, the word door, cross-file names | ~111 |
| the action table (582 `app.*` handlers; they run on a tap) | ~33 |
| screens' own code (reached by one screen only) | ~146 |
| shared by 2+ screens, not core | ~23 |
| top-level statements (listeners, init, `window.*` hand-offs) | ~5 |
| unreached statically (actions named only in run-time-built strings, dead code; audit before moving) | ~11 |

These groups overlap a little (core counts the actions that painted things call directly), so they do not sum
exactly.

**The files, in order of weight.** Do the most self-contained screens first.

| order | file | screens | own KB gz |
|---|---|---|---:|
| 1 | `app3-library.js` | Explore, List Builder, Vocabulary, Word Journeys, Theme Journeys, Concepts, Figurative, IPA trainer, Typing, Quotes, Trivia Training, Word Finder; the word-card, quote-word, deck and full-list pop-ups | 58.6 |
| 2 | `app3-gym.js` | the Word Gym: coach, quest, train, level-up, revisions, traps, coach desk, level test, bee band, first word | 39.1 |
| 3 | `app3-grownups.js` | the report card (progress/parent); the tiers, cloud and auth sheets; settings' grown-up half | 24.8 |
| 4 | `app3-games.js` | the classic in-app games under `viewGames` (typedGame, duel, magic squares, renderStage…); the gym, daily and forge views are already thin | 11.5 |
| 5 | `app3-me.js` | Collection, Shop, Evolution, the wallet sheet, Help | 6.6 |
| 6 | `app3-tools.js` | testing tools: debug, voice tester, evolution feedback, admin | 5.5 |
| 7 | `app3-shared.js` | the 23 KB that two or more of these share; or fold each piece into the file that uses it most | 23 |

**How each file goes lazy.** This is the pattern Mock Bee, the reader, analogy and the hubs already use:

- Register the file in boot-lazy `REG`, add it to a `GROUP` named for the screen, and put it on `IDLE` so it is
  offline after the first tap.
- viewApp's dispatch line becomes
  `content = window.SB_SCR_X ? SB_SCR_X.view() : (lazyNeed('x', () => render()), hiveLoader('…'))`.
- The screen's openers go in boot-lazy `DOORS`, so the code lands before the action runs.
- Actions used only by that screen move with it. Core keeps a stub,
  `app.x = (...a) => lazyNeed('x', () => app.x(...a))`, which the file replaces when it lands. The keyboard and
  `data-act` dispatchers already call through `app[name]`, so nothing else changes.

**Watch for these:**

- **Memo caches over lazy data.** Add each one to the `sb-lazy` listener.
- **Core screens that call a moved function.** Guard them with `typeof fn === 'function'`, or move the function
  to core.
- **Tests that slice app3.js by source anchors.** The anchors are:

  | test | anchors |
  |---|---|
  | word-band | `const SB_UNSAFE_RE` … `function mergeHard(`, the door between `let _corpusBands` and `window.nextWords=nextWords`, the word of the hour between `const _pinned={};` and `// Quote of the hour` |
  | struck-words, stigma, word-bank | the same strike-list anchors |
  | library-chunks, dictionary | `function hardInto(` … `function fullWords(` |
  | word-door | the corpus-read allow-list names functions per file |

  Keep the anchored code in app3.js, or move the anchor and the test's file name in one commit.
- **`tests/lib/run.cjs` SOURCE_TEXT.** List any test that reads a moved function's source.

**The budget after steps 1 and 2:**

- app3.js core: about 111 KB of paint core, plus the action stubs and the actions painted things call;
  call it ~120–140.
- returning speller: 969 − 368 − (307 − ~140) ≈ **434 KB**;
- new visitor: 894 − 368 − 167 ≈ **359 KB**.

## Step 3: Home's "You are here" without the Atlas data on the first load (−~125 KB gz, returning speller)

Home's second card draws the overview painting cropped round the child's region, their avatar on its pin, and
"Stop n of N". For that it needs:

- `SB_TRAIL_HERE(crs)` and `SB_TRAIL_NEXT()` from trail.js (49 KB);
- the curriculum from trail-data.js (75.5 KB), which FIRST fetches at DOMContentLoaded.

The plan:

- **Generate `trail-here-data.js`.** It holds what those two functions read for Home: each region's id, title,
  pin position, stop list (ids only) and the board's own stop counts (`SB_TRAIL_ROAD`, already 0.5 KB). It is
  rebuilt and compared like the other generated files, at about 4 KB gz.
- **Move the Home half of `SB_TRAIL_HERE` / `SB_TRAIL_NEXT` into a small boot file.** It reads that data, and the
  rest of trail.js joins the `atlas` group.
- **Keep the frontier arithmetic identical.** `startIdx`, `reach` and `frontier` must not change. The guard is
  `home-here.cjs` and `placement-step.cjs`, run against both the summary and the full data for every region.
- **Keep FIRST, but after paint and out of the measured window.** That means on the idle queue, not at
  DOMContentLoaded. Continue (`goNext`) already waits for the whole `atlas` group.

**After steps 1–3:** returning ≈ 969 − 368 − 167 − 125 ≈ **309 KB**; new visitor ≈ **359 KB**.

When those land, set `tests/first-load.cjs`'s `CEILING.js` at or under **400 KB**, with the family target and the
ratchet the same number.

## Smaller levers, after the three steps

These are worth doing once the three steps land, but none of them is worth doing first:

- **`avatar-cards.js` (20 KB).** Home only needs the deck count, so compute it from `SB_AVATARS` and `avOwned`.
- **`themes-data.js` (10.6 KB).** Drop `_catStatic` on its `sb-lazy` event, then make it lazy.
- **`cover-art.js` (4.6 KB).** worlds4.js reads `SB_COVER_KIT` at load.
- **`icons-art.js` (11.4 KB).** The coin icon is all Home needs; split the set.
