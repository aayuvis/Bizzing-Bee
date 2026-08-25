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
- **A failed clip fires TWICE — guard every fallback.** A media element whose source
  404s fires `error` on the element AND rejects the promise from `play()`. Wiring the
  device-TTS fallback to both (`a.onerror=tts; a.play().catch(tts)`) made the app say
  the word twice, which is what a word with no working recording sounded like on every
  hosted build (those stream each clip from raw.githubusercontent, so a word listed in
  `SB_WVOICE` whose file isn't on `main` lands here). `deviceSpeak` and `sayAlt` now
  latch a flag; `deviceSpeak` also checks `_wvAudio` identity so a slow failure cannot
  talk over a word the child has already tapped since. Guard: `tests/tts-once.cjs`.
  mockbee's `aqPump` has the same two-wire shape but its `miss` is a `Set.add`, so it
  is idempotent — leave it.
- `advanced.js` + `adv-concepts-data.js` — the **Advanced Pack** ($299/yr add-on, gated by
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
  across the bar (`flex:1` each). **My Hive is NOT a tab** — the **coins pill** in the
  header is its door (that is where coins are spent) and it heads the drawer. It briefly
  had a sixth tab; that crowded the phone bar and put a collection beside the five things
  a speller actually does. The old round Bizzy button that used to open it is deleted.
  Progress is not a tab either. `navIcon` still carries a `hive` glyph if one is wanted.
- **The header search is a real BAR, not a button** (`.sb-hsearch` / `.sb-hsug`). Type in
  it, a Google-style list drops under it, ↑/↓ walk it, Enter opens the Finder on the query
  and a tapped suggestion opens that word's card. Three things make it work:
  (1) the render loop's `data-fkey` focus/caret restore, which is why typing survives a
  full re-render on every keystroke; (2) **`suggestWords(q,n)`, NOT `finderResults`** —
  the latter sweeps both pools exhaustively to rank hits, fine for one screen but this
  runs on every keystroke on every screen, so `suggestWords` breaks out the moment it has
  n prefix matches; (3) the dropdown **never closes on blur** — blur fires before the
  click that picks a suggestion, so closing there would kill the very tap the list exists
  for. It closes on pick, Enter, Escape, nav change, and a capture-phase click outside —
  and that last one renders on `setTimeout(…,0)`, because re-rendering during capture
  detaches the element the click is still travelling towards. Guard:
  `tests/header-search.cjs`. The Atlas has **no sub-nav** — the tab is the map, and the
  only chrome on it is the Revise / My traps pill pair. The Library is its own tab again
  (every explore-family nav lights it). My Hive is not a tab: the **Bizzy button** in the
  header opens it. The mobile bar carries the same six (Atlas / Stats are the short labels).
  Both bars draw from `navIcon(key)` — one duotone set on the 24-grid, not the old mix of
  illustrated and line glyphs. The Library is **eight painted tiles, four across**
  (`app-art/lib-*.jpg`); the shelf and tool row-lists are gone because every one of those
  destinations is reachable from its own home.
- **Testing mode opens the Atlas too.** The Atlas gates on the *frontier* (sequential
  progress), not on entitlement, so `devOn()` (Settings → Unlock everything) now bypasses
  the frontier check in `trailUnit`/`trailChk`, the Advanced-Rounds course check, the act
  card's locked state and the Ultra gate. Without it, "unlock everything" left every stop
  after your own shut.
- **Every Atlas entry point sets `nav`.** `trailUnit`, `trailChk`, `trailAct` and
  `trailToMap` all set `nav:'trail', screen:'app'` so a stop or a region can be opened from
  Home, Progress or a concept page. `trailBack` retraces: stop → region → map (it used to
  stop at the region because `trailAct` was never cleared).
- **Ultra has a curriculum**, not just pins: 5 landmarks x 4 stops (`ULTRA_PINS`,
  `ultraStopsOf`). Each stop teaches one champion technique from `SB_ADV_TIPS` (36
  authored) and drills its own 24-word block **sampled across** its band of `ADV.pool()`
  — a contiguous slice reads as dictionary dregs once the difficulty score flattens.
  Progress lives at `c.ultra.done`; `ultraTrain` hands the block to Practice.
- **There is NO takeover when the Advanced Pack unlocks.** It used to open a sixteen-step
  guided tour (`ADV_TOUR`, `advTourCard`, `adv-tour-shots.js`) full-screen the instant the
  pack went live. Wrong twice over: it interrupted the exact moment the parent had paid to
  reach, and it *described* five features instead of letting the child meet them. All of it
  is deleted — the data, the card, the timer, the five `advTour*`/`advReveal*` actions and
  the lazy registration. The unlock is a confetti burst and a one-line `flash`; the five
  surfaces announce themselves where they live. If a "what's new" is ever wanted again it
  belongs in Settings, opened on purpose — not over the screen.
- **Testing unlock overrides entitlements, and now says so.** `SB_ENT.hasAddon` returns
  true for everything under dev unlock, which made the Advanced Pack switch look dead and
  plan changes look ignored. The Advanced card swaps its switch for a "Testing unlock is
  on" pointer, and the plans sheet carries a banner. Advanced is still gated by the add-on
  alone — never by tier or premium.
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
- **The Bee Band pill lives on HOME, under the daily-goal rings** — not in the header any
  more (Aug 2026, with the top-right icons cleared). The rings card is itself a `<button>`,
  so the band cannot nest inside it: card and pill are SIBLINGS in one flex column.
  `tests/nav-hive-band.cjs` asserts no `button button` anywhere, because a nested button
  is invalid and the inner one silently never fires.
- **"Find your level" SHEENS, it does not flash.** It used to pulse a shadow ring outward
  and hop the pill 1.5px twice every four seconds, on a card a speller is trying to read.
  Only `sb-band-sheen` survives — a highlight travelling across the tile, no movement.
- **One thing is called a Level: the BEE BAND, and it is your spelling level.** (Reversed
  Aug 2026.) There used to be three: a Bee Band pill reading "Word difficulty 3", a rank
  pill reading "Level 1 · Egg", and **Karma** — which turned out to be two different
  quantities sharing a name, one of them (`c.karma`) written in two places and read by
  nothing, while the app's explainer described the other (the sum of per-list `xp`).
  Now: the header carries **one** pill, `bandStage(band).n + ' · Level ' + band`, wearing
  the evolution emblem for that band (`bandArt`), opening **`nav:'beeband'`** — a page that
  says what the stage means and exactly what moves it. `BAND_STAGE` holds the nine names
  (Egg · Hatchling · Forager · Worker · Scout · Ranger · Guardian · Champion · Legend).
  The word **Karma is gone from the app**; the three `karma*` achievement **ids** stay
  because they are storage keys and renaming them would re-lock earned badges. Per-list
  ladders still read **Stage**; `overallLevel` is still deleted; the evolution forms still
  live in My Hive, which is where a collection belongs.
- **The band is evidence only — never time on the app.** `diffRange()` reads it to choose
  which corpus slice every game serves, so a band inflated by hours played would hand a
  child words they cannot spell. Time is rewarded by **coins**, which are spendable and
  therefore have a job. Say this on any screen that explains the band.
- **ONE concept-first guided journey.** The Journey tab IS the Word Map
  (nav 'trail'): one continuous map of 9 base acts followed by **The Advanced Rounds**
  (the 6 expeditions, unit ids `x*`), which render locked with a **$299/yr** Advanced
  Pack CTA until `ADV.active()`. Course is derived from the unit id prefix
  (`state.trailCourse`, set by `trailUnit`/`trailChk`; checkpoint args are
  `"course|actId:n"`). A "Chapter shelf" button on the map opens the Concepts library,
  which ALSO stays listed in Library → Learn (the user wants both routes).
  Practice (old Word Coach, nav 'coach') keeps the classic drill paths via the
  "Practice paths" chooser (nav 'quest'); its list catalogue is collapsed into four
  group cards (My Words / The Champion Ladder / Word Origins / Tricky Words —
  `grp` fields in `coachCatalog`, `state.catGroup` opens one; keys unchanged).
  My Hive is ONE page (`viewCollection`) with three tabs — Badges (artifacts ride along at
  the foot of it) / Avatars / Worlds. `hiveBar` is deleted: with the Store gone, Worlds merged in as a tab and the
  bee moved out, a section bar over a single destination was noise. The Worlds tab carries
  the painted `worldHeroCard` grid the standalone picker had; a locked world is greyed and
  its coin price sits UNDER the tile, not as a badge over the artwork. `viewWorlds` and
  nav `'worlds'` are deleted; `app.openWorlds` survives as a redirect to the Worlds tab.
- **"Your bee" hangs off the Bee Band, not the Hive.** nav `'evolution'` is still its own
  page, reached from `viewBeeBand` (the header pill) — the two ladders belong side by side,
  because the whole point is that the bee is a collection and the band is the level. The
  Hive no longer links to it at all.
- **The Advanced Pack is a paid ADD-ON and level never grants it.** `advModeOn`'s fallback
  — the branch that runs before `advanced.js` loads, which is exactly when Practice draws
  the Ultra pill — used to return true for `lvl>=12 || band>=7 || state.premium`, handing
  the pack free to any child who levelled into it and to everyone on Premium. advanced.js
  had it right all along ("READINESS ... never grants access"); `advModeOn` now mirrors its
  `advUnlocked()`: devUnlock, `SB_ENT.hasAddon('advanced')`, `c.advOn`, `c.advPaid`.
  Readiness lives in the new `advReadyOn()` and only changes the pitch. The Ultra pill is
  now always visible: locked it reads "Ultra · Advanced Pack" (or "you're ready — unlock"
  when `advReadyOn`) and taps to `ultraUpsell`. Hiding it made the pack unsellable while
  the gate made it unpaid-for. Guard: `tests/hive-nav.cjs`.
- **There is no Store. A thing is bought where it lives.** `viewShop()` and `state.shopTab`
  are deleted. The Store sold avatars, worlds, concepts and word lists that all already
  had a home, so the same avatar pack was purchasable from two screens under two
  different rules (the Store showed "Open a pack" to everyone; the Collection checked
  the plan first — `app.buyPack` bounced the free tap to the upsell anyway, so the
  Collection's rule was the honest one and is the one that survived). Now:
  `buyPack` + the drop-odds panel live in Collection → Avatars, `buyTheme` on the world
  in `viewWorlds`, `buyConcept` in the Concepts library (via `openConcept`, which routes
  a locked chapter to it). `app.openShop` / `openShopAvatars` survive ONLY as redirects
  to the Collection so old deep links don't dead-end.
- **Artifacts are won, never bought** (`ART_DEFS` / `grantArt` / `grantStageArt`).
  `buyPower` is deleted. This mattered: the Store was the ONLY source of Boss Shield,
  Letter Reveal, Time Warp and Streak Freeze, so deleting the shop without an earn path
  would have killed four live game mechanics. Earn routes: a per-list stage-up in
  `gainXp()` grants one of shield/reveal/time (rotating on `rankXp() % 3`), and a 7/14/30-day
  streak in `markActiveToday()` grants a Streak Freeze. `c.freezes` holds the freeze (the
  streak code reads it there); `c.pow` holds the rest. Bee Cheer is gone too (removed with
  the accessories) — `app.beeCheer` no longer exists.
- **Word lists are not sold for coins.** `buyList` is deleted; `app.lockedList` opens the
  plan sheet where the list stands. `isListUnlocked` still reads `c.unlockedLists`, so
  anyone who bought a list under the old coin price keeps it. `COST` is now `{theme, concept}`.
  Guards: `tests/hive-store.cjs` and `tests/buy-where-it-lives.cjs`.
- **Artifacts live at the FOOT of the Badges tab.** Both are proof of play — a badge
  records what you did, an artifact is what you won for doing it — so the Hive has three
  tabs, not four. `collTab==='artifacts'` falls back to `'badges'` so an old stored key
  still lands. The Hive header carries no avatar count; **Print my cards** is a pill beside
  the purse, shown only while the Avatars tab is open (it was a full-width banner).
- **ONE back control: `backPill` / `window.SB_BACK`.** There were thirty-odd bespoke
  "← Home" links, each in whatever weight and colour its screen used, and over artwork they
  all but disappeared. `pageHead(title, meta, sub, right, backAct, backLabel, backArg, icon)`
  lays every screen out the same way: **pill hard left, the screen's name and icon CENTRED
  against the page, actions hard right** — a `1fr auto 1fr` grid, because a flex row with
  `margin-left:auto` drifts as the right-hand side changes width. Stacks below 620px
  (`.sb-phead` in index.html). trail.js aliases the same helper as `bpill` in its dark
  variant (`SB_BACK(act,label,arg,true)`) for headers drawn over artwork — never
  reimplement it there. Carousel "← Back / ← Prev" controls inside a deck (`figNav`,
  `vocNav`, `qNav`, `ttNav`, `conceptPrev`, `lessonStepPrev`, `journeyPagePrev`) are a
  DIFFERENT control and deliberately keep their own shape. Guard: `tests/back-pill.cjs`.
- **Bee-style accessories are DELETED** (`AV_ACCS`/`avAccSVG`/`beeAccSVG`/`mascotAcc`, and
  `avatarSVG`'s third argument). They were stickers drawn at fixed coordinates in the bee's
  120×120 space — crown at the top, moustache across the middle — so they worked on the bee
  and collided with everything else: the gods already wear crowns and haloes, the real
  people are drawn as people. An overlay that suits 1 of 217 avatars is not a feature. A
  boot migration refunds the full purchase price and flashes once. `mascotAcc` was also
  called from `trivia.js` — check other files when removing an app3 helper. Bee Cheer went
  with them. Guard: `tests/no-accessories.cjs`.
- **Settings is quick TILES, not rows** (`.sb-qgrid` / `.sb-qtile`, index.html). Look & feel
  and Sound & voice were two sections of look-alike rows a parent had to read end to end;
  they are one grid of ten tap-to-change tiles. Two kinds, and the distinction is the
  borrowed phone idea: a TOGGLE lights up (accent ground, white ink) when on; a CHOICE
  never lights and shows the current option, advancing on tap via `data-arg` (no new
  actions needed — `choice()` computes the next value). The Advanced Pack is folded INSIDE
  Account & subscription; it used to be a card directly beneath, where a parent looking for
  the plan found two things that both looked like the plan. The Buddy row is gone — it was
  read-only and could only tell you to go to the Hive. Guard: `tests/settings-tiles.cjs`.
- **AGE IS A RANGE, NOT A NUMBER, and the name is a DISPLAY name.** Onboarding and Settings
  ask for one of four bands (`AGE_BANDS`: 5–7 / 8–10 / 11–13 / 14–18) — never a birthday-exact
  age. `c.ageBand` is the value of record; **`c.age` is still written as the band MIDPOINT**,
  which is why all eight existing readers (`ttBand`, `diffRange`, `ageMode`, `parentSignals`,
  the weekly report…) needed no change. Legacy profiles carry a bare `c.age` and are read
  through `bandForAge`. Guard: `tests/onboarding-age.cjs`.
- **Never show a speller how long the road is.** The Atlas said `0/102 stops` on Home, in
  the drawer (`atlasSub`) and above the map (`tierBar` in trail.js). 102 is a mountain, not
  a map, and the bar beside it already said the same thing — the bar stays, the total goes,
  and the words beside it now say where you are (`tierWord`). COLLECTION counts are the
  exception and must keep their totals: `24/217 avatars`, `3/80 badges` are a sticker album,
  where the count is the whole appeal. Guard: `tests/no-big-totals.cjs`.
- **The Arcade is 'Bizzy's Great Spelling Arcade'** (`gamesHub()`), and difficulty is
  chosen PER GAME, not once for the whole room. The old global My-level/Easy/Medium/
  Hard/Champ pill row is gone (it was redundant, and did nothing for games that carry
  their own level like Trivia). Word games use `gtile()`: the card is one Play button,
  a difficulty strip below it is separate buttons (a button can't nest a button).
  `c.gameDiffBy[type]` remembers each game's choice; `gameDiffFor(c,type)` reads it;
  `playGame` copies it into the live `c.gameDiff` on launch (the same trick champTen
  used) so the mid-play engines that read `c.gameDiff` see the right level.
  The arcade's engine games are PLAYABLE DIRECTLY (SB_ARCADE_GAMES + app.arcadePlay):
  each tile shows its painted play-field (app-art/sgw-<world>.jpg) and
  mounts its SB_SAGA_ENGINES engine in a self-managed fullscreen overlay (.arc-play,
  appended to <body>), DECOUPLED from saga2's story machinery — so removing the story
  (task 46) leaves the arcade working. CRITICAL: the engines key their config by
  easy/medium/hard/champ and THROW on 'auto' (CFG['auto'].time) — the saga only ever
  passed the four concrete levels. arcadePlay resolves a tile's 'auto' to a concrete
  level from the speller's band before the engine sees it.
  SECOND arcade-only gotcha, fixed in QC: the four letter-typing engines (typeBlaster,
  stageRhythm, constellationConnect, spellScene) drew ONE small `pool(n+k)` batch and
  filtered it to short words (3-8/3-9/3-12 letters); if that single draw yielded zero
  passing words they instant-"won" on a BLANK host. It only bit at some bands because
  `diffRange` shifts the corpus slice: Band 6 'medium' = corpus y-bands [5,7], a rarer/
  longer slice where only ~12% of a draw is 3-9 letters, so ~35% of typeBlaster launches
  came up empty (Band 4 'medium' = [3,5], 0%). Fix: `fillWords(n,min,max)` in saga2.js
  keeps drawing fresh `pool()` batches (deduped) until it has n words, so the field is
  never hollow; pickFresh backfills used words so it always terminates. Verified 0% empty
  across bands 2/4/6/8/9 and all games mount at bands 2/6/9.
  CULLED 14 -> 8 on a fun x learning index: kept beeGrandPrix, honeycombRun, typeBlaster,
  keepFlying, wordSnake, unscrambleStars, spotlightSimon, spellScene — eight distinct feels
  (Race/Maze/Speed/Flight/Arcade/Puzzle/Memory/Scene), weighted to games that make the
  child PRODUCE the spelling. Dropped the redundant select/catch-given-letters cluster
  (whackAMoth, combCatcher, constellationConnect, wordHive) and two lowest-learning
  novelties (spellShield — duplicated typeBlaster's spell-fast-under-threat; stageRhythm —
  timing crowded out recall). wordSnake was kept by user request as a fun-dexterity anchor.
  The dropped ENGINES stay in saga2.js (still exported), so a re-add is one line in
  SB_ARCADE_GAMES. Still to do: a Bizzillionaire
  Bizzillionaire (app.openBizz + SB_BIZZ_LADDER) is a 15-rung money-ladder quiz over
  the 31k trivia bank — a self-managed overlay (.bz-play), DOM-driven, no engine.
  Rungs 1-3 draw lv1 … rungs 13-15 draw lv5 (_bizzLevelOf) — the difficulty RAMP.
  Questions are drawn RANDOMLY from the whole level pool (not a fixed index) and every
  id asked is remembered across plays in localStorage `sb_bizz_seen` (_bizzSeen), so a
  second/third/tenth playthrough serves NEW questions; a level is only recycled once its
  entire bank is exhausted. Answer order is a real Fisher-Yates shuffle so the correct
  slot moves every play. two safe havens (5, 10);
  three one-shot lifelines (50:50 / Ask Bizzy = the question's `f` fact / Skip). c[0]
  is the correct answer in the bank; the overlay shuffles its own A-D order. COINS
  REWARD THE CLIMB, not the money (which is exponential flavour): ~12/rung, +150 to
  finish, capped 400 — busting at rung 6 pays 72, not 0. Bizzillionaire is a HERO tile
  at the top of the arcade (alongside the Mock Spelling Bee), NOT one of the eight game
  tiles — it stays there.
  DONE: the story is fully removed. saga2.js's 360-line story controller (map/board/
  beats/CH_META/ACTS/SAGA_MAP, 166KB->144KB) is deleted; saga-script.js (dialogue) and
  saga-music.js (SAGA_MUSIC — the story's bed; the LIVE world music is SB_W4_MUSIC in
  worlds4.js, untouched) and the 6 app-art/saga-act*.jpg board images are gone. KEPT,
  because the engines' drawWorld fallback needs them: saga-art-dom.js + saga-art/
  saga-map.js (WORLD_ART / SAGA_ART) and the sgw-<world>.jpg play-fields. The only
  SAGA2 reference left is a guarded parent-analytics read that degrades to 0.
  Arcade holds exactly 7 surfaces: Saga, Spelling Quest (whose season map carries the
  classic Boss Battle quick fight — `sqBoss`), Daily Buzz, Bee Trivia, Magic Squares,
  Beat the Buzzer (modes: Sprint / Warm-Up / Level Challenge / Duel / ◆ Rapid
  Dictation) and Word Quiz (+ ◆ Memory Match). Curriculum lives in `trail-data.js`
  (`SB_TRAIL`: 9 acts / 128 Honey units incl. 6 inline Trickster chapters; 6 expeditions / 54 units), word pools in `trail-map-data.js` (**lazy-loaded** by the engine — never
  add it to index.html). Regenerate both with `voice/pipeline/trail-build.js`.
- **A stop resolves its chapter three ways** (`chOf` in trail.js): `gi` -> `SB_CONCEPTS`,
  `ai` -> `SB_ADV_CONCEPTS`, `sa` -> **`SB_SOUTHASIA`** (`southasia-data.js`, lazy, in the
  `atlas` and `advanced` groups), plus `neu` units that carry their chapter inline. `sa`
  is **Expedition IV - The Grand Trunk Road** — the 11 South Asian chapters shared with
  Volume 14 of the book series (`books/southasia-chapters.js` is the authoring copy;
  keep the two in step). That file is **append-only**: units point in by index.
  Its chapters carry their own narration script inline as `ch.sc`, which `conceptAnim`
  now prefers over the index-keyed `SB_CSCRIPT`/`SB_ADV_CSCRIPT` tables. Expedition word
  lists fill any missing definition/sentence/pronunciation from the word library, so a
  book chapter that ships without example sentences still drills with them.
- **Every act and expedition has its OWN painted map** (`app-art/map-<actId>.jpg`, 15 of
  them, plus `map-u*` for the five Ultra landmarks — built by
  `voice/pipeline/act-maps.py`). A region used to open the 880x244 scenery STRIP its
  world used for banners, so acts sharing a world opened the same picture. `ACT_MAP` in
  trail.js carries, per map, the route traced along the road the painter drew and the
  three caches they tucked into its corners — both in the picture's own 0-100 space for
  x AND y, because the board is drawn `preserveAspectRatio="none"`. These are MEASURED by
  eye against each painting; regenerating a map means re-tracing its route. `mapPoints()`
  spreads n stops along the route by arc length (2 at Tier I, 22 at Tier III) and clamps
  every marker off the board edge. Stops are HTML pins (`.atlas-stop`), not SVG, so they
  keep a real size at any board width; the board pans horizontally at 42px per stop, so a
  22-stop act is comfortable on a phone and never moves on a desktop.
- **Hidden caches**: three per map at `ACT_MAP[act].t`, gated at a quarter / half /
  three-quarters of the act's stops, paying 20/30/50 coins once each (`c.trail.tre`,
  `app.trailTre`). Deliberately NO xp — rank comes from spelling, and a chest that moved
  your level would be a way to skip the work.
- **World tiles** (My Hive -> Worlds) carry a one-sentence definition of the PLACE
  (`WORLD_ABOUT` in app3.js) and an animated band (`.wh-fx` + one keyframe each in
  index.html). They used to print the rank ladder's first and last form under every
  card, which said nothing true: the rank keeps the same ten forms in every world.
- **The ambient bees fly** (`w4-beeline` + a `.w4-flutter` wrapper at wingbeat speed,
  worlds4.css). One element cannot carry two durations, so the crossing and the wingbeat
  live on different elements. `w4-fly` alone read as floating.
- **Top-nav icons are coloured** (`NAV_TINT`) — five places, not five grey glyphs. The
  ACTIVE desktop tab passes `plain` so the glyph falls back to currentColor: the pill
  behind it is already the accent.
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

## Accounts & cloud backup (Supabase)
- **Four files, and three of them do nothing until two values are pasted in.**
  `sb-config.js` holds the project URL + anon key (blank = the app is exactly as it was:
  offline, no account, zero requests). `auth.js` is the local scaffold; `supabase-auth.js`
  re-backs `window.SB_AUTH` with real auth when configured; `supabase-sync.js` is the
  backup layer. **No SDK, no CDN script tag** — Supabase's auth and REST APIs are plain
  HTTP and `fetch` is the correct client for a no-build app. `supabase-schema.sql` is the
  whole database; paste it into the SQL editor.
- **`supabase-sync.js` is registered in `boot-lazy.js` (`sync` / group `cloud`), never in
  index.html.** It is last on the idle queue: a child must reach a word without waiting on
  anything that talks to a network, and a family that never makes an account should never
  pay for the file. Every entry point goes through `app.cloudNeed(cb)` because a parent can
  open the card before the file lands.
- **A child's real name and age NEVER leave the device**, and that is enforced twice over.
  `shred()` is an **allow-list** (`PROGRESS_KEYS`) so a field added to the child object next
  year is not silently uploaded, and the schema has **no column** for either — a column that
  does not exist cannot be filled in by a careless commit. `rebuild()` deletes both again on
  the way back, so a legacy blob cannot smuggle them in. There is a headless assertion that
  greps the serialized `shred()` output for the name and the age.
- **`children.display_name` is derived from the AVATAR, not from `c.name`.** The app has one
  name field and its onboarding asks for "first name or nickname", so most families type the
  real one; a column called display_name is a standing invitation to put it there. `label()`
  answers that invitation with "Fox"/"Panda". Restore tells spellers apart on avatar + level
  + date, and asks the parent for the name and age **on the device**.
- **Three gates, all of which must be true before one byte moves**: configured
  (`SB_CLOUD_ON`), signed in (`SB_AUTH.token()`), and **consented** (`SB_SYNC.consented()`).
  Consent is a screen, not a switch — it is the one moment a parent decides something about
  their child leaves the device — reached only from the Parent Zone behind the PIN, and it is
  recorded both locally and on `accounts.consent_at` so it survives a wiped device.
  Withdrawing it **deletes** what was uploaded; it does not merely stop uploading.
- `save()` calls `SB_SYNC.queue()` last and wrapped: save() fires on nearly every
  interaction, so the push is coalesced (4s) and can never break the local write above it.
- **Conflicts are last-write-wins per child, deliberately.** Merging two divergent progress
  blobs invents a history neither device had. `fetchAll()` therefore never touches local
  state — it returns candidates and the restore sheet decides.
- **Deleting a speller exists now** (`askDelSpeller` → `delSpeller`, two taps, in the Parent
  Zone). It has to: COPPA gives a parent the right to delete, and `privacy.html` has always
  claimed the app offered one. It deletes the cloud row too.
- **`privacy.html` is updated BEFORE any network feature ships, with a new effective date.**
  The Aug 2026 rewrite fixed a policy that had gone self-contradictory — half of it described
  cloud backup while §3 still said "we operate no server that could receive it" and §8 still
  warned the password was only scrambled locally. If you touch sync, re-read the whole policy
  for claims that the change has just made false; they are load-bearing.

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

## The Arcade's competition game
- **Spelling Quest is gone** (`quest.js` deleted, its `sq*` actions with it). Its slot is
  the **Mock Spelling Bee** (`mockbee.js`, `window.MOCKBEE`, nav `'mockbee'`): eleven
  spellers, a drawn number, one word a round, miss and you sit down. Ten rivals each have
  an age, a `lvl` they are comfortable at, `nerve`, a `spec` origin and a `tell`; whether
  one gets a word is `BASE + spec + (lvl - hardness)*SPREAD - press*(1-nerve)*PRESS`, so
  the round does the killing, not the bot. **Round one eliminates nobody** because the
  announcer says so; an all-miss round runs again; the **final two play full championship
  rules** (a miss does not end it — the rival must take that word AND the next, and
  fumbling either puts the other speller back on their feet), and after three further
  segments it goes to sudden death so the bee always terminates.
- **It runs in the Scripps shape: SEGMENTS, not a flat ladder of rounds.** Every segment is
  the same three parts, in this order — `spell` (oral, one word each), `vocab` (a four-way
  meaning question), `lightning` (the 90-second spell-off, everybody at once, lowest score
  out). `roundAt(n, liveN)` derives the part from `n % 3` and the stage from `n / 3`, and
  the stage ALSO jumps when the field collapses, because calling it "Quarterfinals" while
  three people fight for a title reads as a bug. Stages: Preliminaries → Quarterfinals →
  Semifinals → Finals.
- **The meaning round reuses the app's own question.** `vocQuestion()` wraps
  `vocBuildCheck()` from app3 — the same 4-option question the Vocabulary section asks, so
  the child meets what they practised and there is one implementation. The bee widens the
  DISTRACTOR POOL itself rather than changing that shared function: `gameWordsD()` is
  scoped to the child's band (~180 words at level four), and three level-four definitions
  against a championship word give the answer away on register alone. `vocPool()` prefers
  `SB_VOCAB26` (997 words, all with definitions — the actual national vocabulary list).
  **A meaning answered right must never call `logBand` or `markMastered`** — knowing a
  meaning is not spelling a word, and the Vocabulary section has a headless test pinning
  that separation down.
- **Rivals have a `voc` skill distinct from `skill`.** Authored per speller, because that
  is the whole point of the round: Dax can spell words he could not define, Theo asks for
  the definition every time and remembers it. Reusing `skill` would make the vocabulary
  round a repeat of the spelling one instead of something that reorders the field.
- **The spell-off ranks, it does not merely eliminate**, so it is the round that breaks a
  tie between two spellers who never miss. Rivals are simulated at the bell rather than
  animated — eleven progress bars ticking at once is noise, and the child has ninety
  seconds of their own to spend. It takes exactly one speller, and takes nobody when only
  two are left: the last two are decided on words, not on a race.
- **The bee keeps its own word list.** `corpusSlice` by `y` band puts dictionary tail on a
  championship stage (`abidingness` is a y-5 word). `beeList()` takes the ~4,650 words the
  library tags as real competition words (`nt` — the finals lists and the Primary/Junior/
  Advanced/Senior tiers), ranks them once, and each round takes a percentile window: pie →
  hobbit → dogma → oregano → melee → dhole → harmattan → benthamite. It rebuilds when the
  corpus grows under it, like every other memoised pool.

## flash() must never rebuild the app while a game is on screen
- `flash()` called `render()`, which rebuilds the whole app DOM from ~1MB of template
  strings — and `scheduleToast` called it AGAIN 2.2s later when the toast cleared. The
  arcade games run in their own fullscreen overlay appended to `<body>` and flash
  constantly (every lap, hazard, power-up, fizzled box), so every message cost two full
  app rebuilds under a game trying to hold 60fps. **Measured in the Grand Prix: 12 root
  rebuilds and a p99 frame of 33.4ms over five seconds; with the fix, 0 rebuilds and a
  p99 of 16.8ms.** `_gameOverlayUp()` detects `.arc-play` / `.bz-play` / `.sg-hud` and
  `_paintToast()` writes the toast straight into the DOM instead. This is what "it's very
  laggy" was, and it is the same bug as a missed item box (below).
- **A pickup test must be SWEPT, not sampled.** The Grand Prix asked "is the box inside a
  1.6-segment window THIS frame?" — a point test against a fixed window, and therefore
  frame-rate dependent. At 60fps the kart covers 0.77 segments a frame and gets two
  chances; a 100ms hitch carries it 4.6 segments and straight past. It now asks "did we
  CROSS the box between the last frame and this one?", which holds however long the frame
  took, with a wrap case for the start/finish line.
- **Grand Prix steering was halved in an earlier pass and overshot.** At 1.1 a full road
  crossing took 1.8 SECONDS of holding, which is what "it's just self-driving" describes.
  2.2 crosses in 0.9s and a tap still only nudges.
- **THE KART GOES STRAIGHT; THE ROAD TURNS AWAY UNDER IT — and for a long time it did not,
  for three compounding reasons.** The authored curves were softened 30% (`curve*=0.7`),
  the drift coefficient was a gentle `0.4`, and **`centri` — the centrifugal push, the
  whole reason a bend throws a car wide — was declared on the `maxV` line and NEVER USED**
  (one occurrence in the whole file). Measured: the hardest bend pushed 1.40 road-units/s
  against 2.20 of steering, so 64% of the wheel held the line and the road never threatened
  to lose you. Now the curves are unsoftened (up to 5) and the push is
  `curve * (v/maxV)² * dt * centri` — squared, because that is what centrifugal force does:
  the hardest bend flat out takes 77% of the wheel, the same bend at half throttle takes
  19%, so lifting off is a real option. Guard: `tests/arcade-geometry.js` asserts centri is
  APPLIED and not merely declared, and pins the drift-to-steer ratio.
- **Honeycomb movement is time-based and on requestAnimationFrame.** `step()` used
  `sp/60` — a fixed distance PER FRAME on the assumption every frame is 1/60s — while the
  loop was the only `setInterval(1000/60)` left in saga2.js, free-running against the
  display refresh. Uneven frames therefore moved the bee unevenly: play-tested as "not
  moving smoothly, it's jumping". `step(ent,sp,dt)` now takes real elapsed seconds (clamped
  so a hitch cannot teleport through a wall) and the loop is rAF like every other engine.
- **Each Atlas region's cache is its OWN object** (`TRE_KIT` in trail.js): a wild honeycomb
  in the Meadow, a buried amphora in the Forum, a pressed bookmark in the Library, a
  bottled charge in the Storm. Same mechanic, same gating, same payout — but the thing you
  find belongs to the place and the message names it instead of saying "Cache found". A
  region with no entry falls back to a plain cache: a wrong object is worse than a plain
  one.

## The two word-games must keep the WORD in front of the player
Both were play-tested as "it stopped being about spelling", and both had the same shape of
bug: the collectible that TRIGGERS a word was placed without regard to where the player
actually is. Guard for both: `tests/arcade-geometry.js`, which parses the real constants
out of saga2.js so a retune cannot quietly undo them.
- **Keep Flying — a pickup goes at the MIDPOINT of the line between two consecutive gaps.**
  Not at a random height (the original bug: honey flush against a pillar, spell it or
  crash) and not 170px past one tower at THAT tower's gap height either — which was my
  first fix, sounded right, and played badly. A flappy bee cannot hold a height: taking one
  meant threading gap N, HOLDING that line for a second, then climbing or diving to gap N+1
  at a different random height. Three precise manoeuvres for one word. The bee's real path
  is the line between the two gaps, so the pickup sits on it. That is why a pickup is placed
  when tower N+1 spawns, not tower N — only then are both ends known (`prevTower`).
- **Everything a tower places MUST drift at `CFG.speed`.** Hearts were on `CFG.speed*0.8`
  while the geometry that placed them moved at 1x, so a heart laid on the lane slid off it.
  The comment above the placement code claimed "everything drifts at CFG.speed"; hearts did
  not, and the first test never checked the drift rate.
- **Honeycomb Run — moths do not breed.** A 16%-per-second spawn up to `CFG.moths+6`
  saturated EVERY difficulty at 8–11 chasers inside 38 seconds (easy 51 open cells / 8
  moths), which erased the tuned per-difficulty counts and turned the round into evasion.
  One late arrival at the halfway mark, once. And the flower — the only way to spell in that
  game — used to pick a uniformly random open cell every 9s, often the far corner past a
  moth; `placeFlower()` now puts it 2–6 cells from the BEE, never on a moth, re-seeded every
  3s. A timed-out round also needs `spelled>=2`, so a round spent dodging is not a round won.

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

## The saga is painted, and so are the games
- **Six painted act boards** (`app-art/saga-act1-6.jpg`, `voice/pipeline/saga-maps.py`) on
  the Atlas contract: an open band bottom-left → right → back left → top-right, scenery in
  the pockets. `SAGA_MAP` in saga2.js holds each act's route, **measured by eye against its
  own painting** in 0-100 space for x AND y; regenerating a board means re-tracing it.
  `map()` is the act picker (locked acts wear the grey Unspelling filter), `board(n)` is
  the painted board — chapters walked along the route by arc length, boss ringed red,
  finale violet, Bizzy riding the frontier pin. A tap selects, a second tap plays.
- **The dialogue, the difficulty dial and the game frame all wear the act's painting**, not
  the flat vector plate — you should not step off an oil painting onto a diagram.
- **`SGFX` is the shared canvas render kit** (saga2.js). Hexes, lit tiles, glowing orbs,
  sparks, rings, rising text, ambient motes, motion trails, screen shake, scrim+vignette.
  Fix how a pickup glows once and five games change. `drawWorld` prefers the **painted play
  field** (`app-art/sgw-<world>.jpg`, `voice/pipeline/saga-worlds.py`) and keeps the vector
  plate as fallback — a play field is composed open and low-contrast through the middle,
  detail at the top and bottom edges, a stop darker than daylight.
- Watch the temporal dead zone when adding kit state to an engine: `const motes=SGFX.motes(w,h)`
  placed above the `const BW=...` it reads throws at construction and kills the engine
  silently (the frame loop swallows render errors, but not that one).

## Home must not rewrite itself
- The word of the hour, the quote of the hour, the bee tip and the Atlas "next stop" all
  pick deterministically from data that **arrives in shards after boot**, so the first
  paint picked from a quarter of the library and a second later the card silently changed.
  `settled(key, period, pick)` pins a pick for its hour or day — allowed to come from a
  smaller pool, not allowed to change while the child is looking at it. `cardHold(label,h)`
  holds a card's space with a shimmer when its data has not landed at all, so the row
  cannot reflow. Any new home card that picks from lazy data needs both.

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
- **EVERY `<script src>` in index.html carries `defer`, and it must stay that way.** All 42
  were plain blocking, which made the parser stop and restart 42 times: DOMContentLoaded
  **2952ms**, first contentful paint **716ms**. Adding `defer` to all of them — not one byte
  less JS — gave DCL **792ms** and FCP **228ms**, a 3.5x improvement. Execution order is
  preserved for deferred classic scripts, so the icons -> app -> app3 -> trail chain is
  unaffected; only parsing stops being blocked.
  - **An inline script that CALLS into a deferred one must wait for `DOMContentLoaded`.**
    `try{SB_ICON_MOTION()}catch(e){}` ran at parse time, before any deferred script existed,
    and its own try/catch would have swallowed the failure and silently left icon motion off.
    Inline scripts that merely SET a global (`window.SB_ASSET_V`) are fine where they are —
    they run earlier, which is what their readers need.
  - Measure with the resource-timing harness, not by eye: `paints`, `domContentLoadedEventEnd`
    and per-resource transfer sizes. Note localhost serves uncompressed, so byte figures there
    are ~3-4x the gzipped reality on Pages; the parse/execute time is the honest part.
- Boot is **5.03MB across 42 files**; `words-data.js` alone is 2.3MB of it (46%) and `app3.js`
  1.0MB. The next real lever, if boot needs to get faster again, is a smaller first word
  shard (`voice/pipeline/words-shard.js`) and moving the saga/mockbee/advanced/trail cluster
  (~800KB, none of it needed for Home's first paint) into `boot-lazy` groups.
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
- Avatars: full-size art is **WebP q=95** in `avatars/<id>.webp` (29.6MB of PNG -> 7.1MB,
  76% off, no visible loss — the encoder only touches outline-edge pixels and the app
  downscales a 384px source to <=150px anyway). `avatars/s/` holds 192px **PNG** thumbs
  (WebP measured ~2% LARGER at that size, so thumbs stay PNG). `avSrc` in avatars.js
  picks `.webp` above 96px and `s/<id>.png` at or below. `avatar-thumbs.py` reads the
  `.webp` source now and still writes PNG thumbs. Full-size PNGs are DELETED from the
  repo — regeneration works from the WebP. Convert new avatar art to WebP q=95 before
  committing, then run avatar-thumbs.py.
- **The book series** (`books/`, one generator: `books/mkbooks.js`, run from the repo
  root) is **19 numbered volumes plus 2 standalone companions / 1,707 pages**.
  Vols 1-10 build from `SB_CONCEPTS`, 11-16 from `SB_ADV_CONCEPTS`, and four are AUTHORED
  from their own chapter files: **14** (`books/southasia-chapters.js`), **17 "Named After
  Someone"** — the eponyms, `books/eponym-chapters.js`, every word pulled from the app's
  eponym-tagged library (`t:['eponyms']`, 731 words) and each carrying an `after` line
  naming the person it came from — and **18/19, the two Ultra volumes**
  (`books/ultra-chapters.js`, regenerate with `voice/pipeline/ultra-build.js`) built from
  the 36 champion techniques in `SB_ADV_TIPS`, twelve words each chosen to SUIT the
  technique. An authored volume sets `authored:true` and `src` to name its source.
- **A volume has THREE identities** and they no longer agree: `vol.n` is the series
  number printed on the cover, `slugOf(vol)` is the file name, `artOf(vol)` is the art
  prefix. The two collections left the series to become **companions** (`companion:true`,
  `book-similes.html` / `book-champion.html`, no number, their own shelf section under
  the numbered grid); the eponym volume is 17 but keeps the `b19` art it was generated
  with. `REG(vol)` is the maturity dial: 1 bright, 2 golden hour, 3 dusk (advanced),
  **4 = the two Ultra volumes**.
- **Word type in the practice hive scales with the headword** (`--wsz`, set per word from
  its length). A 45-letter word at the old flat 23pt was four inches of type in a
  three-inch column and took the whole spread with it.
- The shelf shows the REAL cover — masthead, kicker, title, tag and fact pills composed
  over the cover art in `cqw` units — not the naked illustration. Art slots live in
  `books/design-system/NANOBANANA-ALL.md`, generated by `voice/pipeline/book-art-gen.py`
  (`NB_MODEL=gemini-3.1-flash-image` when the pro image model is busy). **`NB_STYLE=mature`**
  swaps the house Ghibli style for a lighter graphic-novel register — hand-inked line,
  three or four flat inks, darks only where the drawing needs weight, generous negative
  space — for the advanced half of the library. Its first cut was a dark ensemble
  keyframe per volume and read as grim, busy and machine-made; the advanced **covers are
  subject-led** instead (the world map, the road, the microphone, the flat-lay kit) with
  no cast at all. Forbidding text takes more than saying "no text": the model reads that
  as "no title" and will still letter country names onto a map, so the rule enumerates
  labels, place names, signage, numbers and lettering on objects.
- **Cover type follows the art, measured not guessed.** `voice/pipeline/cover-ink.py`
  writes `books/art/cover-ink.json` from the luminance of each cover's top band; mkbooks
  reads it and flips the masthead, title, tagline and both scrims between white-on-dark
  and ink-on-light (`inkKit()` / `.bkc.on-light`). Re-run it whenever cover art changes.
  The tagline gets its own white chip on light covers — it sits mid-cover on top of the
  drawing, where a text shadow is not enough.
- **Four companions now**, not two: `book-similes`, `book-champion`, plus
  **`book-lines` "Lines Worth Keeping"** (poems, speeches, sonnets, haiku, limericks and
  long prose quotes, all public domain, printed whole, each carrying its own bee-worthy
  words; `books/poem-chapters.js`) and **`book-quiz` "The Long Quiz"** (275pp — a general round
  then a hyper-speciality round, twenty-five times; generals drawn at build time from the
  app bank at levels 3-5, specialities authored in `books/trivia-rounds.js`; four formats
  in rotation — MC, written answers with the key at the back, crossword, letter square).
  The trivia shards do **not** export an array: each calls `SB_TRIVIA._add(lv, [...])`, so
  a reader has to supply that method and collect what it is handed.
- **Everything printed in `book-lines` must be PUBLIC DOMAIN, and the book says so in
  its own preamble.** In practice: first published **1928 or earlier**, or a work of the
  US federal government (17 U.S.C. §105 — a sitting President's official address counts;
  a private citizen's speech does not, however famous). Three pieces shipped briefly and
  had to be pulled — Dylan Thomas 1951, the close of King's "I Have a Dream" 1963, and
  Churchill's "we shall fight on the beaches" 1940. Check the FIRST-PUBLICATION year, not
  the author's death; and audit with a one-liner over `p.y` before every release.
- **Art in `book-lines` is keyed per PIECE, on a slug of its title** (`pieceSlug()` in
  mkbooks.js, mirrored by `voice/pipeline/poem-art.py`). Never key it on position — adding
  one poem shifts every index after it and index-keyed art silently re-attaches to the
  wrong poem. A piece with no bespoke plate falls back to its themed one, so the art can
  be generated in batches without the book ever being broken in between. The Python side
  asks **node** to evaluate `poem-chapters.js` rather than regex-scraping it: a regex
  found 66 of 90 (the haiku put `t:` and `th:` on one line, the speeches on two) and the
  two slug lists drifted apart in silence.
- **Splicing pieces into `poem-chapters.js`: normalise to exactly ONE comma.** A removal
  leaves a trailing comma; the next splice adds another; `[a, , b]` is a **sparse array
  hole** that reads as `undefined` and crashes any `for...of` over the pieces. It hid
  through two integrity checks because they used `forEach`, which silently skips holes —
  count by index instead.
- **The image-generation quota is per-MODEL**, so `poem-art.py` runs its workers
  round-robined across three models rather than queueing on one. More *agents* would not
  help — they contend for the same quota. `NB_WORKERS` / `NB_MODELS` tune it.
- **Bulk verbatim poetry trips the output content filter**, intermittently and regardless
  of public-domain status — inside subagents too. Batches of ~5 pieces mostly get through
  and a retry of a blocked batch usually succeeds; batches of 15 never did. Author the
  poetry sections in small batches and expect to retry.
- **The part dividers are the artwork** (`sectionDivider()` + `voice/pipeline/section-art.py`,
  keyed `sc-<section>` on the section NAME, never its position). Two prompt traps, both
  paid for twice: "frontispiece in a fine hardback" gets read as an actual **framed plate**
  and comes back inside a painted gilt frame with a mount, and "keep the top third calm"
  gets read as an instruction to leave a **flat grey rectangle** there, which prints as a
  hard seam a third of the way down. Say both in the negative — no frame, no mount, no
  border, and one *continuous* scene that is merely quieter at the top.
- **Overscan to hide a painted edge belongs on a wrapper, not on the image.** A `transform`
  on a child still counts towards the parent's `scrollHeight` even under `overflow:hidden`,
  so `scale(1.045)` on the `<img>` made all eight dividers report 24px of overflow. Put the
  image in a `position:absolute; inset:0; overflow:hidden` frame and scale it inside that.
- **A CSS comment inside the mkbooks template literal must close on its own line.** Editing
  prose into a `/* … */` block and leaving the old `*/` behind closes the comment early;
  the remaining prose is then invalid CSS that silently swallows the *next* rule. That is
  what made `.sc-frame` above render as a `position:static` zero-height div.
- **The mascot avatars belong to the general volumes, not to the advanced companions.**
  `avatar(vol.av, …)` on a `book-lines` page — the how-it-works opener, the part openers,
  the margin pages — reads as a picture book to the twelve-year-old the volume is for. Same
  for `worldStrip()`: it is drawn in the app's soft anime register and it prints the folio
  unreadably on top of itself. Both are gone from that book; do not add them back.
- World art: `app-art/w-<world>-r<2|3>.jpg` (26 banners) is cut from the book series'
  strips by `voice/pipeline/app-banners.py`. The Word Atlas, the theme pages and the
  home Atlas tile all draw from it — one visual language with the books.

## The Library's book shelf, and the drawn spines
- The books are a **shelf of 23 spines above the tiles** (`libShelf()` in app3.js), not a
  tile among tiles. `SB_SHELF` is the ordered list; **`s` (the file name) is the ONLY one
  of a volume's three identities that may build a URL** — `n` is the printed number and
  `art` is the art prefix, and they disagree (17 is `book-17.html` with `b19` art; the
  companions have no number). The table was read out of `mkbooks.js` via `slugOf`/`artOf`
  and cross-checked against the `books/*.html` redirect stubs; all 23 matched both ways.
- **Two levels of click, for free.** The shelf carries `data-act="openBooks"` and each
  spine `data-act="openBook"`; app3's handler resolves `closest('[data-act]')`, so a spine
  wins on its own hit area and the shelf catches the wood and the gaps. `openBook`
  validates the slug against `SB_SHELF` rather than pasting it into a URL.
- **Spine art carries NO lettering** (`voice/pipeline/spine-art.py`, 23 PNGs in
  `app-art/spines/`). An image model letters convincingly and spells badly, and this is a
  spelling app — so the model paints the spine and HTML sets the type over it. Titles stay
  correct, selectable and crisp, and a re-render never needs new art.
  - Only **`gemini-3.1-flash-image`** reliably reads "spine" as the narrow edge of a book;
    the other two drew the front COVER 10 times in 23. The script MEASURES the aspect and
    retries outside **`[MIN_RATIO, MAX_RATIO]` = [0.095, 0.185]** rather than trusting it.
    The first run accepted 0.126–0.28 — a 17px book beside a 46px one — and that spread was
    most of why the shelf read as scruffy AND why type spilled off the narrow spines.
  - The band has moved twice and BOTH corrections mattered: 0.28 (too loose, accepted
    covers) -> 0.185 (too slender — the books read as thin card and thirteen of them left a
    third of the shelf empty) -> **0.17-0.30**, which fills 89% of the row. A real hardback
    spine is roughly a quarter of its height.
  - The style prompt says **"fine, even, confident ink line"** and forbids a cartoon in the
    negative (no thick wobbly outline, no childish doodle, no bouncy uneven shapes). The
    first cut was drawn with a heavy wobble and read as a picture book.
  - **A spine reads as real because it is the curved back of a cylinder.** The prompt asks
    for a highlight down the centre and deeper tone at both long edges, plus the details a
    bound book actually has — a striped **headband** at head and tail, raised **hubs**, a
    pasted paper **label**, stamped **rules**, a **quarter-bound** join, a colophon. Eight
    such bindings rotate, so no two books on the shelf are the same object. Without that
    shading the drawings were clean but flat: a coloured rectangle, not a book.
  - Quantise the PNGs to **160 colours, not 64** — 64 banded the very spine shading that
    sells the roundness.
  - The Gemini key lives at **`/root/.gkey`** (mode 600, `GKEY_FILE` overrides). It is the
    newer `AQ.`-prefixed format, not `AIza…`, and goes in the `x-goog-api-key` header.
- **`window.SB_SPINE_R` in app3.js holds every spine's MEASURED width/height**, written by
  the script to `app-art/spines/ratios.json` and **baked into the source** — no build step
  and `file://` support mean a runtime fetch for 23 numbers would be a request and a new
  failure mode. **Regenerate that block whenever the spine art changes.**
- **Spine geometry is derived, never tabulated, in BOTH directions.** Type is sized by the
  smaller of: the title's character count (so a long title fits end to end) and **the
  spine's own measured width** (so a vertical line of letters is never thicker than the
  book it is printed on). Sizing on length alone let the letters paint out over both edges
  of the thinnest spines onto the shelf behind — and a box-vs-image geometry check could
  not see it, because the box and the image are the same width by construction. The
  divisor is **the shortest row any layout uses (150px, the phone's two shelves)**, not the
  desktop row: sizing against the taller row measured clean on desktop and clipped four
  titles on a phone.
- **Title ink is chosen by CONTRAST, not by a luminance threshold** (`ink()`): compute the
  WCAG ratio for white and for near-black against the spine colour and keep the better. A
  single cut-off fixed the yellow and orange and left a cluster of mid-tone golds at about
  1.8:1 — technically past the line, actually unreadable. Every spine now clears 4.35:1.
  `cover-ink.py` does the same job for the book covers.
- The row height IS the book height: `.bk-books` 180px desktop, `.bk-row` 150px phone.
  Stacks are **five** books — against a 180px row a 3-high stack left a conspicuous
  rectangle of empty shelf above it. With the thicker spines the row fills 89% of its
  width, leaving ~59px at each end, which reads as shelf rather than as a gap.
- `--bh` is a **percentage of the row and must never exceed 100** — the row is
  `align-items:flex-end` with no clipping, so a 110% book grows up out of the box and
  pushes the shelf into the heading above it.
- Leaning books need their own side margin or they lie across the neighbour's title.
- **Two shelves below 720px.** The row is authored as two halves that `display:contents`
  re-joins into one row on wider screens — one source of markup, no duplicated list.
- A mobile override of equal specificity only wins by **source order**: the phone block
  sits after the base `.lib-*` rules, because declared above them its `display:none` and
  `font-size` were quietly beaten by the base rules.

## The Atlas is a journey on scenery, not a painting with pins
- **THE PAINTING RUNS NEAR FULL AND THE FOG MEANS SOMETHING.** (Reversed Aug 2026 after
  play-testing.) The map used to be held at `opacity:.6` / `saturate(.78)` — dusk `.5`,
  high-contrast `.34` — so the route and pins could read over it. Testers named exactly
  what that produced: regions "fading away", "an unwanted translucent layer", "weird fog"
  on art that is already painted misty. It was the right problem solved in the wrong
  place: dimming a whole picture to make two things on top of it legible.
  Now `opacity:.97 / saturate(1.08) contrast(1.05)` (dusk `.92`), and **legibility lives on
  the things that need it** — the route paths carry their own `drop-shadow(var(--rt-sh))`
  on the overview as well as the act board, and every `.atlas-pin` sits on a radial scrim
  ring (`::before`, theme-aware). **High contrast bolds the route rather than dimming the
  art** — taking the picture to 34% was the fog complaint applied hardest to the people
  who need it least.
  **Fog is reserved for a region you have NOT REACHED**, and it goes on the PIN
  (`.atlas-pin.locked`), not the board — a board is never wholly locked, its stops are.
- **`.atlas-board`'s own background is load-bearing.** It was a near-black `#241E33`, so
  lowering the image's opacity *darkened* the map instead of calming it. It is a paper tone
  now; only dusk keeps a dark ground.
- **Ambient motion is per REGION, keyed to what the place is** (`ACT_AMB` + `ambLayer()` in
  trail.js, `.atlas-amb` in index.html): bees over the Meadow, dust in the Library and the
  Forum, driven rain in the Storm, spores off the Root Kingdoms, spray on the Strait,
  sparks off the Junkyard. Pure CSS — two gradient layers drifting on long loops, nothing
  added to the boot budget and no video. It sits at `z-index:1`, BELOW the route and pins,
  takes no pointer, and **disappears entirely** under Reduce motion (`display:none`, not
  merely slower). A region with no `ACT_AMB` entry gets nothing: a wrong motif reads worse
  than none. Guard: `tests/atlas-contrast.cjs`.
- **Route ink is theme-tokened** (`--rt-guide` / `--rt-walk` / `--rt-sh` on `.atlas-board`).
  The strokes were white-on-dark, correct over a full-strength painting and the faintest
  marks on screen over a dimmed one. Light and white get a drawn-road brown; dusk keeps the
  original glow. Both the overview route and the act board read the same tokens.
- The advanced band's scrim dropped from a near-black wash to a light violet tint: over a
  42% painting the old weight just made mud.

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
- **The Pages site has a size budget, and blowing it is silent.** GitHub's "pages build and
  deployment" job aborts at a ten-minute deploy timeout, and when it does the site keeps
  serving the last good commit — the push succeeds, the build succeeds, nothing anywhere
  says the app did not update. It happened at 555MB: three shipped builds in a row never
  went live and a deleted game went on appearing in the Arcade for hours. Keep the site
  **under ~250MB**. If a deploy "did nothing", check the run's conclusion before you blame
  the browser (incognito showing the old build is the tell that it is not cache).
  Site weight today: **183MB** — voice 53MB, avatars 33MB, app-art 7.6MB. It was 256MB,
  over the line, until the books moved off it (below).
- **The books are NOT on this site any more.** They are published from
  `aayuvis/bizzing-bee-books` → https://aayuvis.github.io/bizzing-bee-books/ , by
  `books/deploy-books-repo.sh` run from `spellbound-app/`. This branch keeps 24 redirect
  stubs under `books/` so old links still land. Do not copy `books/*.html` or `books/art`
  onto gh-pages again — that is the 73MB that put the site over budget.
  The GENERATOR STAYS HERE: `mkbooks.js` reads ten app data files, volumes 1-16 are
  generated from app data, and `books/art` is 488 plates that cost real image quota and
  cannot be reproduced. Only the published output lives in the other repo, and a
  books-only session cannot rebuild anything.
  Publishing needs a session with BOTH repos as sources, or the git proxy refuses to
  inject a credential. The gh-pages commit there carries a `Built from <branch>@<sha>`
  trailer, and the script aborts if `mkbooks.js` lacks `sectionDivider`/`indexPages` —
  both because the books were published four times from a clone eight commits stale, and
  the script ran perfectly every time.
- **Book PDFs are not in git.** They were 214MB of files generated from HTML that is
  already complete; the shelf opens the HTML. Regenerate on demand; `.gitignore` keeps
  them out. Do not re-add them to the repo or to gh-pages.
- **Deleting a generated artifact does not un-commit it, and the repo grew to 3.4GB
  proving it.** The PDFs were removed and gitignored, and every version of every one of
  them stayed in history: **1.63GB across 197 blobs on paths no branch referenced**, plus
  188MB of `books/art` PNG intermediates from the same habit. They were purged with
  `git filter-repo --invert-paths` in Aug 2026 (all six branches rewritten and
  force-pushed; every branch's root tree SHA came out **identical**, so only commit SHAs
  moved). GitHub's reported size lags — its GC is asynchronous and can take days — but a
  fresh clone drops immediately, because a clone only ever sends reachable objects.
  The rule that follows: an artifact regenerated by a script belongs in `.gitignore`
  **before** its first commit, never after.
- **`gc.auto` is 0 in this repo's local config, so nothing is ever packed automatically.**
  That is deliberate — auto-gc pauses on a 130k-file working tree are painful — but it
  means loose objects accumulate forever, and a loose object gets zlib and **no delta**.
  455 versions of `app3.js` were each stored in full: 136,865 loose objects / 3.34GB,
  which is how `.git` came to be *larger* than the remote. Run `git gc` by hand every so
  often; it took 4.0GB → 2.9GB on its own, with no history change and nothing to push.
- **Shipped art is sized to how it is drawn, not to how it came out of the model.**
  `voice/pipeline/art-slim.py` (`--dry` measures first) holds the rule: full-size avatars
  384px RGBA, book plates 1400px at q78. The 640px avatars were ~360KB each and nothing
  ever painted one above about 200px. Re-run it after any art drop, then
  `voice/pipeline/avatar-thumbs.py`.
- **index.html declares itself uncacheable** (`no-store`) while every asset it points at
  carries a `?v=` stamp and caches forever. Without that, a browser holding an old
  document keeps requesting the old stamps and a shipped change stays invisible.
- Commit to `main`. GitHub Pages serves from **`gh-pages`** (app minus `voice/`); voice is
  served from `main` via `voice-cdn.js`. Update the changed app files onto `gh-pages` via
  a `git worktree`; leave mp3s on `main`. Verify a raw voice URL returns 200.
- **Cache busting (do BOTH every deploy):** bump the `?v=` stamp on every asset URL in
  `index.html` (one `sed -i 's/?v=OLD/?v=NEW/g'`) so devices never run stale JS, and bump
  `SB_VOICE_VER` in `voice-review.js` whenever voice clips changed.
- **The site is `www.bizzingbee.com`, and a `CNAME` file is what makes that true.**
  GitHub writes `CNAME` onto `gh-pages` when you set the custom domain in Settings.
  The deploy here is `git push -f origin HEAD:gh-pages` from a worktree, which replaces
  the whole branch — so a worktree without that file **silently unsets the domain** and
  the site falls back to the github.io URL with no error anywhere. `CNAME` therefore
  lives in the SOURCE `spellbound-app/` and is copied across on every deploy, exactly
  like `index.html`. Never delete it, and `git fetch` + reset the worktree to
  `origin/gh-pages` before deploying if anything may have changed the branch from the
  GitHub side.
- **Bump the stamp in the SOURCE `index.html`, not in the gh-pages worktree.** Bumping it
  only in the worktree leaves the branch a stamp behind, and the next deploy that copies
  `index.html` across silently reverts the stamp BACKWARDS — devices then keep serving the
  build they already have. It has happened once. Check with
  `diff <(sed s/OLD/S/g index.html) <(sed s/NEW/S/g /tmp/ghp8/index.html)`: the two must
  differ by nothing but the stamp.
- Commit trailer:
  ```
  Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01QWsiRQxQMXwKsQoppGtYWa
  ```

## Video production — a failed experiment, and its lessons (Aug 2026)
Two YouTube videos were built from in-app assets (`voice/pipeline/trailer/`) and both
were rejected — storyline, graphics and voice. The lessons are the point; do not repeat
the attempt with the same inputs.
- **TTS cannot perform.** Kokoro is a pronunciation voice; commentary/let's-play formats
  are mostly voice energy, and synthetic enthusiasm reads as uncanny. Any narrated video
  needs a HUMAN voice track first — write the script, let the user record it, build
  around it. Never ship TTS narration as entertainment.
- **Choreographed drama is fake drama.** Setbacks staged through debug hooks (toHaz/
  gateNow teleports), a "rule" that was never at risk, a comeback that couldn't fail —
  scripted stakes with no real uncertainty read hollow on sight. Real content needs real
  play (genuine winnable/losable runs) or genuinely authored narrative craft.
- **A screen recording is not footage.** The game reads well in hand; at 1080p passive
  viewing it is a fixed camera, small sprites and app chrome. Text overlays are not
  production value. If footage must come from the app, it needs a purpose-built
  cinematic mode (no HUD, dynamic camera), not a capture of the play surface.
- **QC the bar, not the storyboard.** Every check verified "frame X at time Y", never
  "would anyone watch this?" Judge a 15-second test cut against real videos in the
  genre BEFORE building the full length — and show the user that cut first.
- What survives: the capture/assembly tooling works (Playwright recordVideo drifts
  seconds past wall-clock — cut against extracted frames; clearBoxes() before racing
  segments; single-frame inputs into zoompan). Useful for QC reels and dev demos —
  not for audience-facing video.

### Narration: Gemini TTS (Aug 2026) — the "TTS can't perform" verdict was about Kokoro
- **Gemini TTS is a different class of tool** and is worth auditioning before writing off
  synthetic narration. `models/gemini-2.5-pro-preview-tts` (also `2.5-flash` and
  `3.1-flash-tts-preview`) takes a **style instruction prepended to the text** and ~30
  prebuilt voices. Same `/root/.gkey`, `x-goog-api-key` header,
  `generativelanguage.googleapis.com/v1beta/models/<m>:generateContent` with
  `responseModalities:["AUDIO"]` + `speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName`.
  The separate **Cloud TTS API (texttospeech.googleapis.com) 401s on this key** — it is not
  enabled; do not waste time on it.
- **It returns raw PCM, not a container**: `audio/L16;codec=pcm;rate=24000`, base64 in
  `inlineData`. Write a 44-byte WAV header yourself or every player rejects it.
- **The style prompt controls pace, and it is dangerously literal.** Asking for an
  "unhurried" documentary read produced **7.0s** for an eleven-word line — the user's first
  note was that it was too slow. Naming the pace explicitly and *forbidding* the failure
  mode ("natural, brisk conversational pace… do NOT slow down, do NOT add long dramatic
  pauses, do NOT sound solemn") brought the same line to **4.8s** with no loss of warmth.
  Prompt the tempo, don't fix it afterwards with `atempo`.
- Audition voices by generating **one identical line across a shortlist** and normalising
  them (`loudnorm=I=-16:TP=-1.5`) so the comparison is voice, not level.
