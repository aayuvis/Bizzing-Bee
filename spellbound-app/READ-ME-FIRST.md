# Spellbound — how to open it (no coding needed)

This folder is the **working Spellbound app**. You don't need to install anything.

## The easy way (try this first)
1. Open **Finder** and go into this `spellbound-app` folder.
2. **Double-click `index.html`.**
3. It opens in your web browser (Safari or Chrome). That's the app. 🎉

Everything is saved on your computer automatically as you use it (your speller's
profile, theme, progress). To hear words spoken, turn your Mac volume up — the app
uses your browser's built-in voice.

## If double-clicking shows a blank page
Some Mac browsers block local files. Here's a 30-second fix using the Terminal:

1. Open **Terminal** (press `Cmd`+`Space`, type "Terminal", hit Return).
2. Copy–paste this line and press Return:

   ```
   cd ~/Downloads/spellbound-app && python3 -m http.server 8000
   ```

   *(If the folder isn't in Downloads, drag the folder onto the Terminal window
   right after typing `cd ` to fill in the correct location.)*

3. Open your browser and go to:  **http://localhost:8000**
4. When you're done, go back to Terminal and press `Control`+`C` to stop it.

## What's inside (for reference)
- `index.html` — the page you open.
- `app.js`, `app2.js`, `app3.js` — the program.
- `words-data.js` — the fast core word library (~40,000 high-probability bee words, loaded on open).
- `words-full.js` — the **entire 128,040-word library** (loads only when you open
  "Entire library" in Word Coach — a one-time few-second load). Keep it in this folder.
- `concepts-data.js` — the 110 concept chapters (real data).
- `lessons-data.js` — the 100 Word Journeys etymology lessons.
- `voice/` — the bundled narration clips (one small MP3 per explainer scene) plus
  `voice-manifest.js`, which tells the app which clips exist and how long each runs.

Keep all of these files together in the same folder.

## What the app does
- **Sign up → set up a speller** (name, age, a buddy, a "world" theme, a daily goal).
- **The Spellbound Journey** is the default path, and it's one simple ladder:
  **Word → Set (24 words) → Level → Champ → Library.**
  - **Levels 1–20 = "Spellbound Champ":** the ~1,600 highest-value bee words, ramped
    easy→hard. Master a Level's words **or pass its Champ Challenge** to climb. Reach
    **Level 20** and your speller is a **Spellbound Champ** (the character evolves the whole
    way up).
  - **Levels 21+ = "The Champion's Library":** the rest of the 40,000 words, for the
    multi-year long game (Premium). A small **"Library explored"** meter tracks total words
    mastered. Self-paced — every word waits its turn, nothing is skipped.
- **Champ Challenge** (the accelerator) — a quick quiz you **configure**: *timed*
  (beat-the-clock) or a *set number*, at a difficulty you choose. **Pass the "This Level"
  challenge to test out** and jump straight to the next Level. Reachable from the Level
  panel or the **Arcade**.
- **Word Coach** is the main training hub. The top row is a clean quick-switch
  (**Spellbound Journey · your selected list · Tricky review · My missed words · + Lists**);
  every other list (North South Finals, origin lists, your custom words…) lives in
  **Setup & lists**. **Every list climbs the same Level ladder** (master a Level → level up),
  and you can **rename any list** (tap the ✏️ next to its name). Inside a list there's a **Revise** tab
  (study words with meanings, one card at a time) and a **Practice** tab (it reads a word
  aloud, your child types it, instant feedback), plus a live **heatmap** and **Written**
  and **Oral elimination** rounds.
- **Arcade** — a 6-game arcade that makes practice feel like play:
  - **Buzz of the Day** — 10 mixed words, typed; the daily warm-up.
  - **Beat the Buzzer** — spell as many as you can in 60 seconds.
  - **Boss Battle** — defeat a boss using your toughest/missed words (HP bar + lives).
  - **Meaning Match** — pick the word that fits a meaning *or* a spoken sentence.
  - **Spot the Spelling** — choose the correctly-spelled word among realistic look-alikes.
  - **Origin Detective** — guess each word’s language of origin.
- **🔥 Daily streak** — a calendar on the Home screen tracks every day practised, with
  bonus coins at 3, 7, 14 and 30-day milestones.
  Every correct word earns **🪙 coins**, with sound effects and confetti for streaks
  and level-ups. (A gentle "so close — one letter off!" nudges near-misses.) Each child
  has a memory log so games keep serving **fresh words** — a word won't come back until
  ~150 others have been played. In *Finish the Sentence* the answer word is **beeped out**
  of the spoken sentence so the audio never gives it away.
- **Coins & the Shop.** Coins are earned in Games, Word Coach **and** Concepts, then spent
  in the **🛒 Shop** (tap your coin balance in the top bar): **Worlds** (themes), **Word
  lists**, and **Concepts**, plus a ⚡ level boost. (Sound can be turned off in Settings.)
- **Levels get harder as you climb.** Early levels come quickly to draw kids in, then each
  level needs more XP than the last (a near-exponential curve), so progress stays earned.
- **What's free vs paid:**
  - **Free:** 2 worlds, Level-Up to Level 5, and the free word lists. Concepts are locked —
    but anything can be **earned with coins**.
  - **Premium:** 4 worlds, levels past 5 on every list, premium word lists, and **half of
    the 110 concepts** unlocked — the rest unlock with coins.
- **Parent dashboard** keeps a full **activity log** — every game, practice and coach
  session at a glance, and you can **tap any row to see exactly which words were missed**.
  A **"Words to revise"** card collects every miss (with how many times) and a one-tap
  **Revise** button drills them. Misses are saved per child across sessions. The **🖨️
  Weekly report** button opens a clean one-page summary (days practised, streak, words
  mastered, top misses, finals countdown) you can **print or Save as PDF** to email.
- **Concepts** — 110 spelling-pattern chapters with worked examples and word lists; level
  up from easy patterns to harder ones. Card 1 of every chapter is a **▶ animated explainer
  taught by the Spellbound bee** — the bee presents beside the lesson (hopping while it talks
  and changing expression scene to scene) and actually **explains the concept**, not just the
  pattern: it gives the meaning, then breaks real words into their parts — *"ef- plus the Latin
  fervere, to boil, gives effervescent — boiling out, bubbling over."* Each script is written
  from that chapter's own teaching data (its roots, morpheme breakdowns and spelling traps), so
  nothing is invented. **Each explainer is narrated** by a warm, natural American-English voice;
  the audio is pre-recorded and **bundled in the app** (the `voice/` folder), so it plays
  instantly, fully offline — no internet, no robotic browser voice. Every scene's animation is
  timed to its narration. (If a clip is ever missing, it quietly falls back to the browser voice.)
- **Theme Journeys** — the third pillar: learn words by the **worlds they live in**. 50+
  themes in 8 clusters (Human Body & Medicine, Astronomy, Culinary Arts, Mythology, Law,
  Fabrics & Fashion…), each self-assembled from the word database by matching definitions —
  so a theme can hold anywhere from 135 to 2,400 real bee words. Pick 3–5 themes you love
  (they join your Practice top bar), and each becomes its own Level ladder that ramps
  easy→hard. Mastery flows back into every other list. The Arcade's **Magic Squares**
  game turns themes into a bingo board: a 3×3 grid of 9 themes, 5 questions per square
  (spell-it or pick-the-meaning) — ace 4 of 5 to claim a square, and earn bonus coins for
  every row, column and diagonal, with a mega celebration for blacking out the board.
- **Word Journeys** (Premium) — a 100-lesson program on the **history & geography of words**:
  10 units from Proto-Indo-European roots through Latin, Greek, the Norman invasion, world
  borrowings and championship linguistics. Each lesson tells the story behind the spellings,
  shows five real words with pronunciation + etymology, and a **"Practise these →"** button
  that drills them — plus Decode/Trace/Build activities to do with a grown-up.
- **Progress & Parent** dashboards, **8 themes**, **Light/White** modes, and a finals
  countdown.
- **Design feedback** (Settings → *Design feedback*) — a built-in tool to review all 80
  evolution character tiles: tap any tile to rate it (Keep / Tweak / Redo) and add a note,
  then **Export** to copy the notes out. Handy for refining the art.

> **Free vs Premium.** Free play covers the Default list up to **Level 5**, plus your
> review, missed-words, custom and Daily-Buzz lists. **Premium** unlocks levels beyond 5
> and every other list (North South Finals, Champions, origin lists, and more).

> Note: the "Smart list with AI" button needs an online AI service that isn't wired into
> this offline build, so it shows a friendly "unavailable" message — every other feature
> works fully offline. The word library here is a large, real subset; the original
> product's full ~128k-word library would be dropped in the same `words-data.js` shape.
