# The Teacher's Corner and My Homework (15 Oct 2026) — notes for CLAUDE.md

Owner: "build the teacher's corner too … ensure this is for a teacher to guide the students … generate mock word lists and
assign to the student … assign tasks to complete based on where they are … also assign concepts to complete … this then goes
in a homework to do the student in a separate top nav left of the search bar which takes the speller to my homework section
which has a similar look and feel as the app (tabs are the homework concepts, homework atlas concepts, homework wordlist,
history) but only tracks homework … completion in homework applies as completion in main app … also captured in progress
report". The same day: "Concepts - teacher can assign concepts beyond the lock too."

The integrator moves this into CLAUDE.md as a "READ FIRST" section. The rules a later session keeps:

- **TWO LAZY SCREEN FILES, ONE RECORD.** `app3-teach.js` (boot-lazy `scrTeach`, nav `teacher`, `#/teacher`) is the
  grown-up's; `app3-homework.js` (`scrHw`, nav `homework`, `#/homework[/concepts|atlas|words|history]`) is the speller's
  AND the home of the record's reading: `window.SB_HW` (add / remove / sync / report / items / openCount / …). Both follow
  the app3 split exactly (`"use strict"`, REG + GROUP + DEPS on `scrShared` + IDLE, `SCR_NAV`, `SCR_GROUP`, one `SCR_ACTS`
  line each). The Corner's group carries `scrHw` (it writes through SB_HW); every other reader (family-shell's top-bar
  button, the report card) reaches SB_HW only through `window.SB_HW`, guarded, and falls back (the button to the recorded
  `done`; the report card asks for `scrHw` and draws "Loading homework…").
- **THE RECORD** (per child, created on the first assignment — no store step): `c.hw = {items, seq, run?, keep?}`. An item is
  `{id, kind:'words'|'stop'|'concept', ref, t, at, due, done, res, by:'grown-up'}` plus: words `words:[{w,d,s,p,y,h}]`,
  `got:[…]`, `src`; stop `chk`, `crs`, `lap`, `act`; concept `adv`, `grant`. Dates are local `YYYY-MM-DD`. `run` is the word
  list being spelled (resumes at its word, like `c.today`). Saved with the household (`save()`); `?demo` writes nothing (the
  sandbox). **Not in `PROGRESS_KEYS`** (supabase-sync.js) — deliberately: the cloud is a launch blocker, homework is a
  grown-up's local assignment that changes nothing a backup needs (its effects — mastery, the trail, the misses — already
  travel in `mast` / `trail`), and "never upload more than before" holds. It carries no name or age.
- **COMPLETION IS DERIVED FROM THE MAIN APP'S OWN RECORDS** — doing it in homework IS doing it in the app, and the other
  way round: a stop is done when trail-home.js's own `passedNode` says it is walked on the item's lap (Practice at the gate,
  or the quiz; or the lap moved on); a chapter when it was read to its last card (`c.cRead`, below) or its words are
  mastered (conceptStat's rule, read from that child's `c.mast`); a word list when every word was spelled right once IN
  HOMEWORK (`got`). `SB_HW.sync(c)` writes the day it is first seen done onto the item (`done`) — so History and the report
  card can say when, and whether it was on time; the top bar's button calls it on every render once the file is in, so a
  stop walked on the Atlas is recorded the moment the bar redraws. A done item never becomes undone.
- **THE WORD LIST IS SCORED EXACTLY AS TODAY'S TEN**: a right answer is `logBand` + `markMastered` + `clearMiss` + `gainXp` +
  ONE `addCoins('answer')`; a miss is `addMiss` and HOLDS on the shared miss panel (`missFeedbackHTML`) until Next. Nothing is
  paid for finishing a list or a round. While a word is asked: the meaning is `maskTxt`-masked, the sentence only spoken,
  the header search waits (`drillLive` / family-shell `inDrill` read `SB_HW.live()`), the prompt goes to the one live
  region (render's live condition includes nav `homework`), keys Enter / 1 / 2 / 3 and every one a button. "N of M spelled
  right"; never a run or "in a row". "Study the list" is a reading deck — words in print, scoring nothing — and cannot be
  open while a word is asked (the Word list tab shows the drill whenever a round is unfinished; "Stop for now" ends it).
- **THE CORNER IS BEHIND THE PIN.** `app.openTeacher` (core: Settings → Grown-ups and the Parent Zone have its button) passes
  a pass already made on screen (the Parent Zone, Settings' open Grown-ups, the same tick's PIN) or asks; `#/teacher` goes
  through it (family-shell `DOOR`); `state.teachOk` is the pass and viewApp clears it the moment nav is not `teacher`;
  `viewTeacher` draws a locked card without it, and every Corner action refuses outside it (`tcGuard`). Back goes to the
  Parent Zone (the pass was the PIN).
- **WHAT THE CORNER SETS, AND WHAT IT NEVER BYPASSES**
  - *Word lists* come ONLY through the word door: `nextWords.pool(child, …)` (the door's preview entry — kid-safe for THAT
    child, inside their band window): their Atlas region (the words of the stops they walked there and the one they stand
    at — `SB_TRAIL_MAP` keys narrowing the door's own pool, levels auto + hard), a level, a theme (`themeDefs` as that child
    meets them — minBand holds), or their slipped and missed words (purpose `review`). The pick is a hash of (source, its
    setting, size, the New-list counter, the word) — the same choices give the same list, never `Math.random`. The Corner's
    group carries `sents` + `words2` + `wordband`, so the corpus does not change under the grown-up between two draws.
  - *Atlas stops*: from the child's own frontier, only stops OPEN to them now (index ≤ `reach`, not walked — a placed child
    also sees the open stops behind the start line); a stop past the furthest open one is never offered and the assign
    action re-reads the list, so a stale tick cannot set it. Homework opens a stop through `trailUnit` / `trailChk`.
  - *Chapters*: every chapter. One the child has not reached on the Atlas (a LEARNING lock — `conceptLock(ci).kind ==
    'learn'`) is offered as "Ahead of <name>'s Atlas — assigning opens it for them"; assigning it writes `grant: 1` and app3's
    `isConceptUnlocked` opens it for THAT child (`hwGrant`, the active child only) — from My Homework and from the Library.
    A PLAN lock (the Advanced Pack, `ch.adv`, or the family plan) is shown as "Needs the …", disabled, refused by the assign
    action, and a grant can never open it (the Advanced Pack check returns before the grant is read). No price anywhere.
  - **Removing homework never takes a chapter away**: a granted chapter the child has opened, read or started (its words in
    `c.mast`) moves to `c.hw.keep` when its item is removed, and stays open; an untouched one goes with its item. Expiry
    removes nothing (a past-due item stays, "Not finished yet").
  - Readings that ask `active()` (the concept lock, `SB_TRAIL_OPEN`, `advModeOn`, `themeDefs`) are answered for the chosen
    child by `tcAs(c, fn)`, which swaps `state.activeIdx` synchronously (nothing renders or saves inside) and puts it back.
  - Due dates are chips (today / 3 days / a week / none); nothing is typed — titles are generated ("Words: The Meadow, 15").
  - *Resources*: a print view (`window.print()` on a print stylesheet that hides the app's chrome) of the generated list or
    any assigned one — a spelling sheet (masked meanings) and the answer key (word, respelling, meaning, sentence) — and of
    all open homework: each chapter's own text, each stop's line on the sourced grade map (grade-map-data.js, lazy). Nothing
    downloads, nothing is sent.
- **THE TOP BAR** (`SB_SHELL.hwBtn()`, drawn by app3 just before the search bar): only for a child with homework (open or in
  history) — a family without a teacher sees no change; a quiet dot while something is open, never a count; hidden in a
  drill like ⬡. Not `.sb-hdr-ico`: the family shell-check finds the look button by that class. Desk: "✎ My homework" from
  1100px, the icon below (it sits in the room the logo's `margin-right:auto` leaves; at 1280 the search keeps its 414px and
  place). Its room comes out of the search's flex-basis (190px instead of 240 while it is there, above 560px): a flex line
  wraps on the basis, not the min-width, so without that the bar wrapped at 700px (and, with the label, at 1000) — measured
  360–1280 with and without homework, the header height and the coin chip never move.
  Phone (≤560px): a 34px icon with a 44px `::before` (a11y.css), and **the logo steps aside for it** (as it does for the
  Hive's "my day" chip) — the 43px left beside the logo cannot hold a 44px target. `checkShell(bee:true)` stays [] on Home,
  desk and phone, light and dusk, with homework present (tests/homework.cjs).
- **A CHAPTER READ TO ITS LAST CARD IS RECORDED** (`conceptReadMark`, app3, after `openConcept` / `conceptNext` /
  `conceptStepGo`): `c.cRead[ci] = day`. The app had no record of a chapter read — only of its words mastered — and the brief
  asked for "done" to be recorded where the main app records concept progress, so it is the child's own record, written
  wherever the chapter is read (the Library, an Atlas stop's lesson, homework). Nothing displays it yet but homework and the
  report card; the Concepts library could.
- **THE REPORT CARD** (`reportCardHTML`, Parent Zone) has a Homework section per child: set / done / on time, words right of
  words set, stops walked, chapters read, and the open items ("was due …", never harsher). The Parent Zone carries the
  Corner's door (`[data-pz-teach]`).
- **First load**: +~1 KB gzip of JS (app3: the two openers, the grant, the read mark, the chain, the Settings row; family-shell:
  the button; index.html / a11y.css: its CSS) — 374 → 375 KB on both first screens, ceiling 377, hard line 400. Everything
  else is lazy.

## What the integrator must wire

- Move this into CLAUDE.md (a "READ FIRST" section), and add `teacher-corner` / `homework` to the browser list.
- **The concept lock grew a branch** (app3 `isConceptUnlocked` → `hwGrant`) and **three concept actions call
  `conceptReadMark`** — if another batch edits `isConceptUnlocked`, `openConcept`, `conceptNext` or `conceptStepGo`, keep both.
- `PRACTICE_NAVS` includes `homework` (its spelling is practice time on the rings); render's live condition, `drillLive` and
  family-shell `inDrill` include it.
- If the Bee Circuit adds a top-bar item, measure the phone bar again: the homework button takes the logo's place there.
- Store: no migration step was added (the field is created lazily). If the store batch wants one, it is a no-op for `hw`.

## Tests, and how each was proved by breaking

`tests/teacher-corner.cjs` (browser, ~25 s) and `tests/homework.cjs` (browser, ~60 s; a persistent profile and
`reloadSettled` for the resume). Each break: a scratch root of symlinks with ONE file replaced, the test pointed at it by
`SB_ROOT` (word-door.cjs too), the tree never touched; the lists and what failed are in each test's header — 12 breaks of
the Corner (PIN ×2, determinism, the door ×2, a locked stop, a plan chapter, the grant ×3, the answer key, the wrong child)
and 14 of My Homework (the button ×3, the search's basis, the leak, a finishing coin, a miss that moves on, no evidence, no
resume, the Atlas's walk, the chapter read, the report card, History's wording, the grant). Every one failed.

Also run green on this batch: app3-split, word-door, `node tests/lib/run.cjs --node-only` (44), first-load (375 / 377),
screens-lazy (the two navs and `#/homework/words` added), touch-targets (three screens added: My Homework, its drill, the
Corner), family-topbar, feed-screen, header-search, hash-nav, back-pill, trust-v2, pin-mandatory, live-prompts,
today-session, kudos, hud-emoji, a11y-axe.

**report-card.cjs is timing-fragile, and was before this batch**: it reads the Parent Zone 300 ms after the PIN with a
fixed sleep, while the door is still loading the boot word tier (`words1`, part of `scrGrown`'s group). Probed on the base
tree and on this one under the same load: `scrGrown` lands 3.1–3.6 s after load on both and the 300 ms is sometimes not
enough on either (base 1 of 3 probes missed it). It should wait on `.sb-report-card` (tests/lib/wait.cjs `until`) — not
changed here (not this batch's file).
