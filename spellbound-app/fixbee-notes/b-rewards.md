# FIX-BEE batch B — rewards, currency, locks, the one level (2 Oct 2026)

Rows: J2 no streaks · I3 no random rewards · I4 medals from evidence · C4 gating · C6 one
visible level · Harmonise: Bee coins → Bizzing coins. Each section says what changed, where,
why, the guard and how it was proved by breaking it, and an honest re-score.

## Currency — Bee coins retire into Bizzing coins (Harmonise, standard §1)

- **`bizzing-wallet.js` is the family drop-in ported as a CLASSIC script** (`window.BZ_WALLET`),
  from Bizzing_Schedule `integration/bizzing-wallet.js` @ d42455e. Logic and constants are the
  drop-in's line for line, with two deliberate differences, both marked in the file: `EARN` is
  frozen (a module's exported object could be rewritten by a caller), and **the `migrated` ledger
  line does not count toward the daily cap**. In the drop-in it did, so a child whose old purse
  was 100+ could earn nothing at all on migration day — found by `tests/wallet-coins.cjs` on its
  first run. **Report this upstream**: `app/test/wallet.mjs` in Bizzing_Schedule does not catch
  it, and every other app's migration has the same freeze.
- **`c.coins` is a MIRROR of the wallet**, so the forty-odd readers of `c.coins` needed no change.
  The wallet is the only place a balance moves (`addCoins` / `spendCoins` in app3.js).
- **`addCoins(EVENT)` takes an event, never an amount**: `'answer'` 1 · `'stop'` 5 · `'contest'` 10
  · `'mastery'` 20, capped by the wallet at 100 a day. A NUMBER pays nothing — a payout invented
  tomorrow fails safe instead of quietly paying — and it returns what was actually paid, which is
  what every toast and finish screen now shows (`+'+_p+' 🪙'`, never the asked-for amount).
  `payG(g)` pays a game's right answer AND adds it to `g.bonus`, the number its finish screen
  shows; `earnedSoFar()` lets the arcade result show what really arrived.
- **`walletSync(c)` migrates once**: `c.walletV` on the child plus the wallet's own `migrated`
  receipt, so neither a reload nor a restored backup pays twice. It runs at boot AFTER the
  GONEW / accessory / Aurora refunds (money handed back is the child's and moves with the rest),
  and lazily on the first earn/spend for a child injected at runtime (most tests do that). A
  renamed child is followed to the new name (`c.walletWho`). Known edge: two children with the
  same first name share a wallet — that is the standard's key, and the family server fixes it.
- **Never written**: in `?demo` (`window.SB_DEMO` — batch A sets it; a sample child's coins stay
  local) and under **Test coins** (`c.devCoins`: earning pays 0, spending comes out of the
  1,000,000 test purse, switching off shows the wallet's balance). Testing mode
  (`devUnlock`) does not grant avatars from packs it opened (`grantAvatarMilestones` returns).
- **A plan grants no coins.** `SB_ENT.setTier` used to top a child's purse up to 400 / 1,500 the
  first time a paid tier was set — a grown-up's payment becoming spending money. `startCoins` is
  0 in every tier and the grant is deleted (pricing.js). The legacy million-coin reset now floors
  at 0, not 400.
- **Every payout was routed** (grep `addCoins(` — `tests/wallet-coins.cjs` fails on any call that
  is not a standard event literal):
  - right answers → `'answer'`: Practice, the classic games (via `payG`), oral rounds, meaning
    match, vocab practice, IPA trainer, fig decks quiz, trivia `grade()`, reader Try-it, advanced
    sprint/mock/dictation/memory pairs, the saga engines' spelled words (were 20/10/8 each), the
    Daily Buzz solve (was 30–70), a hero challenge (was 5), a cache's trivia question (was 10), a
    freed buddy (was 12), each Bizzillionaire rung climbed.
  - a round finished → `'stop'`: an Atlas stop, ONCE per stop per lap whichever door finished it
    (`payStop` in trail.js — Practice at PGATE now pays too; the quiz alone used to), a landmark
    side round (was 12), the Cartographer's Gate and the crown relic (were 20 / 40), a vocabulary
    set or idiom deck (5), a typing test or lesson (was wpm/2 up to 40), a Magic Squares cell.
  - a contest → `'contest'`: a mock spelling bee (was 15–250 by placing), Champ Challenge passed,
    the advanced mock, a duel (was 8/12; the Ultra rival 25), Bizzillionaire topped (was up to 400).
  - mastery → `'mastery'`: a list stage-up (`gainXp`, was 4), a concept or lesson mastered
    (`celebratePattern`, was 20/15), a whole Atlas tier walked (`lapUp`, was nothing).
  - **removed**: streak rewards, "5 in a row" bonuses (Practice +5, trivia +3), every game's
    finish bonus (a win is partly reflexes), Trivia Squares lines, Magic Squares lines, flown-
    through coins in Keep Flying, a game-stage unlock (15), the daily bloom's double pay, the
    fork chest (25), the word-wisp (8), Barnaby the wanderer (8), the buried trove (30), the
    lucky poke (2), the hidden caches (20/30/50 — they still open, still give a game, a chapter or
    a question, and which one is fixed by the cache index, not a roll), selling avatars, "I know
    it" self-marks in the advanced scan, and flipping a training card.
- Visible currency is named **Bizzing coins** where it is named (purse chips' title, the Hive
  pill's label, the level page, the avatar explainer, Settings → Test coins, the plan copy).
- **privacy.html** gained a paragraph on the family wallet (key, what it holds — the first name
  in lower case, balance, ledger — that other Bizzing apps in the same browser read it, that it
  never leaves the device), and its effective date moved to **2 October 2026**. Batch A's
  activity feed will want the same section; expect a one-line merge on the date.
- Guard: **`tests/wallet-coins.cjs`** (19 asserts) — source scan; migration 1:1 including a
  refund, reload twice, mirror; a real 10-word round pays one per right word and nothing for
  finishing; every ledger line standard; numbers/streak/login/time pay 0; the cap; Test coins,
  `?demo` and a plan never touch the wallet.
- Re-score: **4**. Not 5 because the wallet is still localStorage (family server pending) and the
  shared-name edge is real.

## J2 — No streaks

- `markActiveToday()` only records the day (`c.daysPlayed`). `STREAK_REWARDS`, the run counter,
  the freeze use, the 3/7/14/30 payouts and the Streak Freeze grant are deleted. **Good days this
  week** (`goodDaysThisWeek`, Monday–Sunday, as the Hive counts them) replaces every streak number:
  the streak card is `goodDaysCard()` ("Nothing expires. A day off costs nothing."), the Practice
  stat, Progress, the grown-ups' child list, the coach signals (`goodDays`). The weekly printed
  report already had "Days practised" and lost its "Day streak" box.
- The **Streak Freeze artifact is retired** (`ART_DEFS`, `artCount`, `grantArt`). `c.freezes` stays
  in old saves and is read by nothing; "Well Stocked" no longer counts it (earned ones stay earned).
- The Daily Buzz counts solved days, never a run (games-daily.js); its "streak" stat is "solved".
- Copy: the streak pill on Practice and on the Daily Buzz banner, "keep the streak rolling",
  "Sign in to keep your streak going", the plan's "Progress and streaks", the grown-ups' data list,
  trivia's "Streaks pay bonus coins", and five parent tips ("a visible chain kids can't bear to
  break", "Weekends are where streaks die") are rewritten. "N right in a row" inside a round stays —
  the standard asks for exactly that kind of specific praise — but pays nothing extra.
- Old `c.streak` / `c.streakRewards` / `c.streakBest` are left untouched in the save; only the
  retired-medal check reads them (`streakBest`, never the live counter).
- Guard: **`tests/no-streaks.cjs`** (13 asserts) — seeds a child one day from the 30-day reward
  with two freezes and a Daily Buzz run; marking the day moves nothing and pays nothing; 14
  screens (child and grown-up, PIN passed) show no streak copy; the Daily Buzz shows none; and the
  comment-stripped source of every code file carries no streak copy or mechanics.
- Re-score: **5**.

## I3 — No random rewards (rarity stays)

- **Packs and drop odds are gone**: `PACK_WEIGHTS`, `PACK_COST`, `packCost`, `packOdds`,
  `oddsPanel`, `buyPack`'s draw, the reel and reveal overlays, `toggleOdds`, `packSkip/Close/Wear`,
  and selling (`sellAvatar`, `sellDupes`, the spares bar). `app.buyPack` survives only as a
  redirect to the Avatars tab.
- **Every avatar names how it is won** — `avRule(a,c)`, printed on the tile (`.av-rule`) and under
  the trading card in `showAvCard`:
  - Starter → yours from the start.
  - a pack the child's plan does not include → **"Comes with the plan — ask a grown-up"** (a plan
    lock; tapping asks for the PIN, never shows a price). This keeps the paid-plan rares.
  - a pack the plan includes → a **named learning milestone**, fixed per avatar by its place in the
    roster (`AV_LADDER`: Rares rotate words-right / Atlas stops / words mastered / Level; Epics
    mastered / right / concepts / stops; Legendaries Level / mastered / concepts / stops, each
    harder down the roster). `grantAvatarMilestones()` gives it the moment the evidence is there,
    once, with a line — from `checkNewBadges` (every finished session) and on opening the Hive.
  - **a Rare can also be bought outright at its printed price** (120) — the ONE coin purchase in
    Bee, a cosmetic at a fixed price with a confirm. Epics and Legendaries are never for sale.
- **Decision worth a look by the owner**: the brief's literal rule is "milestone or plan". Without
  a priced cosmetic, Bee's shop would sell nothing at all and coins would only ever accumulate in
  Bee; the standard forbids buying "by chance", not at a fixed price. So the Rare card names its
  milestone AND its price. Deleting the `price` branch in `avRule` makes it milestone-only.
- **Worlds open on the Level ladder** (`WORLD_LEVEL`: Blade 3, Lab 5, Elements 7, God's Abode 9,
  Race Zone 10, Dino Era 11 — the ONE visible level, so only right answers open a world), as well
  as by the plan as before. `buyTheme` no longer spends; tapping a locked world says which Level
  opens it.
- **Concept chapters open on the Atlas**: `isConceptUnlocked` asks `SB_TRAIL_OPEN(gi)` — the stop
  that teaches the chapter is passed on any lap or at/behind the frontier — besides Basics, the
  plan and Premium's half. A chapter not on the Atlas comes with the plan. `buyConcept` keeps its
  name (callers use it) but goes to the Atlas region or the PIN, never spends.
- **Nothing bought is taken away**: `unlockedThemes`, `unlockedConcepts`, `unlockedLists` and owned
  avatars all still answer. `COST` stays only because the boot refunds repay that exact price.
- Guard: **`tests/no-random.cjs`** (17 asserts) — no draw/odds/selling/coin-priced content in the
  comment-stripped source; the only `spendCoins` call is the avatar's printed price; all 107
  unowned rare+ cards on a full plan name their rule, 33 Rares show a price and no Epic/Legendary
  does; the trading card shows the rule; a free child sees "comes with the plan" and the PIN, no
  money, no odds; **Math.random stubbed at 0.0001 and 0.9999 gives identical coins, avatars, rules
  and cache contents**; a locked world and chapter cannot be bought; a Rare costs exactly its
  price; an Epic cannot be bought; a coin-bought world, chapter and legendary stay.
- Re-score: **4** (5 if the owner signs off the Rare price decision above).

## I4 — Medals from evidence

- The shelf is **Medals** (the tab key is still `'badges'`). New evidence medals: **Atlas** —
  First Stop / Trailblazer / Pathfinder / Cartographer (1/10/25/60 stops, `SB_TRAIL_STOPS(c)`
  counts every stop passed on any lap or course); **Traps** — Trap Spotted / Trap Breaker /
  Trap Master / Untrappable (1/10/50/150 words once missed and later spelled right: `clearMiss`
  records `c.trapsBeaten[word]` when the word was on the revision pile). Concepts mastered and
  words spelled right (`karma*` ids, kept as storage keys) were already there.
- **Retired, not re-locked**: the six streak medals move to a "Kept from before" group that is
  shown ONLY where already earned (`badgesSeen`, a claimed `streakRewards`, or `streakBest`) —
  never shown locked, never celebrated, never earnable again (nothing moves `c.streak`).
- **Earned stays earned**: `badgeDefs()` returns `done:true` for anything in `badgesSeen`, so a
  medal never greys out when its live evidence falls (mastery is re-checked now — batch C).
- Each medal is **celebrated once** (`checkNewBadges` writes `badgesSeen`; the first run seeds
  silently; retired ones are never celebrated).
- Band medals read "word difficulty"; the Levels medals read Stage (the Journey's stages) and
  "Reach Level 3 — your bee hatches" for First Hatch.
- Guard: **`tests/medals.cjs`** (15 asserts) — a hundred days in a row with no evidence earn
  nothing; a miss earns nothing; the miss later spelled right earns Trap Spotted once; a finished
  stop earns First Stop once; 100 words right earns Hundred Club; a reload re-celebrates nothing;
  falling evidence keeps the medal; a child who never had a streak medal is never shown one; a
  child who had three keeps those three and sees none of the other three.
- Re-score: **4** — the medallion art is the existing `badgeArtSVG`, not new family-medallion art.

## C4 — Gating: learning locks vs plan locks, never a price

- `lockChip(kind, text)`: a **learning** lock (`data-lock="learn"`: path icon, accent ink, dashed
  edge) names the learning that opens it; a **plan** lock (`data-lock="plan"`: padlock, grey,
  solid) says it comes with the plan and to ask a grown-up. Used on avatar tiles and packs, world
  tiles, concept cards and the big concept card, word-list covers, the Word journeys shelf.
- `app.askPlan(feature)` opens the plan sheet, which the grown-up PIN already guards where it is
  drawn — so a child tapping a plan lock meets the PIN pad.
- **Every child-facing price is gone**: the Atlas's "Unlock · $299/yr →" (three places in
  trail.js), the advanced gate's "$299/year" and its button, Practice's "🔒 $299/yr" pill, the
  chapter shelf's "$299/yr", the advanced banner, Progress's quest card, a theme page, Settings'
  Advanced line, the coin prices on worlds and chapters. Prices stay on the plan sheet and the
  paywall (behind the PIN). The paywall no longer says "earn coins for the rest".
- A capped list's toast says "Stage 5 cleared — more stages come with the plan (ask a grown-up)"
  instead of "go Premium to keep leveling 👑".
- Guard: **`tests/locks.cjs`** (9 asserts) — walks 16 free-plan child screens, finds 160 locks
  (chips and padlock icons, by the icon's own SVG), and fails on any money on a child's screen, any
  price on a lock, any lock that does not name its opener, and learning/plan locks drawn the same;
  then taps a locked world (names its Level), a locked chapter (goes to its Atlas stop) and a plan
  lock (the PIN, not the sheet).
- Re-score: **4** — the Atlas's own stop locks ("clear the earlier stops first") are unchanged
  and fine; the "Advanced Pack" chips are plan locks by wording but not yet `lockChip`s.

## C6 — One visible level

- **`oneLevel(c)`** (also `window.SB_ONE_LEVEL` for batch A's header pill): `rankOf` — words
  spelled right anywhere, through the existing curve — wearing the bee form for that level
  (`Level 6 · Pupa`). It moves only in `gainXp`, which only a right answer calls; it never falls.
- The **Bee Band stays underneath as "word difficulty"**: the level page (`nav:'beeband'`, now
  "Your level") shows the one level with its progress to the next, what moves it, and a "How hard
  your words are — this is not a level" panel with the difficulty bar; the nine stage names and
  their rung list are gone from view. The coach page and the grown-ups' card say "word
  difficulty N of 9". "Your bee" is the level, drawn — its page no longer says the bee is "a
  collection, not a level".
- Home's level strip (inside the rings card — position unchanged) shows the one level; while the
  band is still calibrating it still shows batch A's "Find your level" call untouched.
- Practice's per-list ladder reads **Stage** again everywhere it had drifted to "Level" (stage
  labels, the dock, "Stage N of 20 to Champ", the stage-cleared celebration, the challenge).
  Stage (a list's place) and Tier (which pass of the Atlas) are POSITIONS on two paths, never a
  rank; B3 (batch A) puts the position on home, which is fine.
- Guard: **`tests/one-level.cjs`** (9 asserts) — one `.sb-one-level` meter on home; every "Level N"
  on home and header is oneLevel's; no band / bee form / "spelling level" shown as a rank; the
  level page calls difficulty "not a level"; 240 clock ticks, coins earned and spent, a cache, a
  wisp, a poke and a won arcade race move it by 0; three right and two wrong move it exactly 3.
- Re-score: **4** — Trivia keeps its own study "Level 1–5" (a question-difficulty pick, not a rank).

## Proved by breaking it (each break restored and `cmp`-identical afterwards)

| break put back | test | failures |
|---|---|---|
| migration with no receipt (no `walletV`, no wallet guard) | wallet-coins | 5 |
| a bare number pays again + `addCoins(12)` on the Atlas | wallet-coins | 2 |
| no daily cap | wallet-coins | 1 |
| Test coins write the real wallet | wallet-coins | 3 (first attempt: 0 — the cap had already been reached, so a refused write looked like no write; the test now checks Test coins and `?demo` BEFORE the cap) |
| a plan grants start coins again | wallet-coins | 1 |
| the "day streak" stat back on Practice | no-streaks | 2 |
| a new day moves the streak, pays and toasts "🔥 30-day streak!" | no-streaks | 6 |
| a cache rolls what it holds (`Math.random`) | no-random | 1 |
| a world bought with coins again | no-random | 2 |
| an Epic card loses its rule | no-random | 1 |
| a medal celebrates every time | medals | 3 |
| days in a row earn medals (`daysPlayed`) | medals | 2 |
| streak medals shown, locked, to everyone | medals | 3 |
| a coin price back on locked worlds | locks | 3 |
| "$299/yr" back on the Atlas's Advanced Rounds | locks | 2 (first attempt: 0 — the edit went into `viewMap`, a fallback the map never draws; re-broken in `viewAtlas`) |
| plan locks drawn dashed like learning locks | locks | 1 |
| home shows the band as the level again | one-level | 1 |
| time on the app moves the level | one-level | 1 |
| a cache moves the level | one-level | 1 |

## Test runs (after the last change)

New: wallet-coins, no-streaks, no-random, medals, locks, one-level — all green.
Existing, green: hive-store, buy-where-it-lives, hive-nav, no-accessories, aurora-refund,
no-big-totals, nav-hive-band, atlas-alive, champion-expedition, living-meadow, living-atlas,
living-advanced, living-cast, result-screen, reader, mobile-layout, pin-mandatory, arcade-geometry,
coach-rules, atlas-contrast, atlas-sets, atlas-stars, back-pill, bug-sidebar, coach-rings,
data-lint, header-search, learn-next, list-builder, loading-state, long-words, no-default-login,
onboarding-age, onboarding-layout, set-deck, settings-tiles, sign-out, telemetry, trail-map,
tts-once, ux-826, word-bank, word-synonyms.
- **Flakes under load, not regressions**: `living-atlas` / `living-cast` open the Atlas 2.6s after
  boot and can beat the lazy concepts shard (~2.6s on a loaded machine) — failed once each under
  four agents' load, passed alone, and the base commit has the same race. `hive-store` once caught
  the `concepts.json` fetch fallback (loadConcepts before the shard lands, from file://); the
  medal shelf and avatar evidence now only read chapters already in memory, so they never trigger
  that fetch. `header-search` failed once on a detached element and passed alone.
- `ux-personas` exits 1 on base and here alike: it writes to a hard-coded scratchpad path from
  another session. Same six findings either way (batch D's runner should fix the path).
- `gp-*` and `worlds-splash`/`shelf-art` were not re-run: nothing in them changed (the Grand Prix
  engine pays no coins; the wallet does not touch the splash or the shelf).

## Existing tests deliberately updated (the brief reverses what they asserted)

- `hive-store.cjs` — the odds panel is now a failure, not a requirement; the tab label is Medals.
- `no-big-totals.cjs` — the collection totals are read from the app (the medal shelf is 82 now,
  not 80).
- `buy-where-it-lives.cjs` — a locked chapter must NOT ask for coins; it goes to its Atlas stop or
  the PIN.
- `hive-nav.cjs` — a locked world's tag below the art is its Level lock, and carries no price.
- `atlas-alive.cjs`, `champion-expedition.cjs`, `living-meadow.cjs`, `living-atlas.cjs`,
  `living-advanced.cjs`, `living-cast.cjs` — payouts are the standard's (cache question 1, freed
  buddy 1, wisp 0, duel 10, gate 5, landmark round 5, hero 1, wanderer 0, trove 0).

## Cross-batch edits (smallest possible)

- `index.html`: one script tag, `bizzing-wallet.js`, immediately before app3.js (D owns loading).
- Home (A): only the CONTENT of the level strip inside the rings card (label, art, aria) — the
  calibrating branch is untouched.
- Practice (C): `addCoins(1)` → `addCoins('answer')` in the answer handler and the 5-in-a-row toast
  without coins (two lines near `streakRight`); `clearMiss` records a trap beaten (one line);
  per-list "Level" labels → "Stage".
- Parent zone report (C): the "Day streak" box removed from the printed weekly report, the
  grown-ups' child list column, and the band line reads "Word difficulty".
- `supabase-sync.js` still lists `streak` in `PROGRESS_KEYS` — harmless (nothing writes it now);
  left alone because it is the backup allow-list.

## Not done, and why

- The wallet's migration-day cap bug lives in the family drop-in too; fixed here only.
- Two children with the same first name share a wallet (the standard's key).
- New medal ART in the family medallion style — needs art; the shelf uses `badgeArtSVG`.
- No audio was generated (owner's instruction).
