# Bizzing Numbers + the 5-Pack Platform — Build Plan

_Follows PLATFORM-OPPORTUNITIES.md. This is the "how", including the architecture fork._

## The five packages

| Pack | Readiness anchor | Status |
|---|---|---|
| 🐝 **Bizzing Bee** — Spelling | Scripps / school & regional spelling bees | **Live** |
| 🔢 **Bizzing Numbers** — Maths | Math Olympiad (AMC 8, MATHCOUNTS, Kangaroo, IMO/NSTSE) | Next |
| 🧠 **Bizzing Minds** — General Knowledge | Jeopardy / quiz-bowl | ~40% built (`trivia-data.js`) |
| 🌍 **Bizzing World** — Geography | iGeo / National Geographic Bee | Cheap to build |
| 🗣️ **Bizzing Tongues** — Languages | CEFR A2–B1 ("Level 3") for select languages | Most expensive |

**Anchoring every pack to a named competition is the single best decision here.** "Math Olympiad readiness" sells to a parent in a way "maths practice" never will — it turns a nice-to-have into a credential path, justifies the price, and gives the adaptive engine a *target* to measure against.

---

## 1. The architecture fork (the actual question)

> *"Should it sit as a master selector at top, and then all the games / concepts / training tools change for numbers?"*

**Master selector: yes. "Everything changes": no — and forcing that would break the product.**

Audit of what actually transfers:

| Layer | Transfers? | Notes |
|---|---|---|
| Arcade game engines (racer, flappy, maze, whack, catcher, blaster, shield, simon, constellation, rhythm…) | ✅ **Fully** | They only need `prompt → answer`. Several are *better* for maths than spelling (see §3). |
| Metagame — avatars, coins, packs, streaks, badges, evolution | ✅ **Fully, and must be SHARED** | This is the retention engine. One wallet, one collection across all packs. |
| Adaptive core — Bee Band, spaced repetition, mastery, traps | ✅ **Mechanics** | But skill is **per-pack** (Band 7 spelling ≠ Band 7 maths). |
| Parent dashboard, weekly report, PIN, tiers/auth | ✅ **Fully** | One report covering every enrolled subject. |
| Saga / story mode | ✅ **Shell** | Same 31-chapter spine; each pack supplies its own item pool. |
| Voice layer | ⚠️ **Partial** | Central to Spelling/Readers/Tongues; useful for maths word problems & accessibility; near-irrelevant for Geography. |
| **Input widget** (letter tiles) | ❌ | Maths needs a **numpad**, Geography needs **map/flag multiple-choice**, GK needs **buzzer-style MCQ**. |
| Concepts, Quotes, Idioms, Phonics | ❌ | Genuinely English-specific. Each pack brings *its own* Learn/Train content. |

### The abstraction that makes this work: an **Item Contract**

Every pack registers itself and exposes items in one shape. This is the whole refactor:

```js
window.SB_PACKS.register({
  id:'numbers', label:'Bizzing Numbers', anchor:'Math Olympiad',
  color:'#3D7DF0', icon:'calc',
  input:'numpad',                  // numpad | tiles | choice | map
  bands:[...],                     // the readiness ladder for THIS pack
  item(level, opts){               // <- the ONLY thing engines consume
    return { id, prompt:{text, audio?, art?}, answer:'56',
             accept:['56'], choices:[…], hint, teach, tags:['times-7'] };
  },
  learn:[…], train:[…], revise:[…] // this pack's Supercharge hubs
});
```

Once every engine consumes `pack.item()` instead of `gameWordsD()`, **a new subject is a data+config pack, not a new app.** That single change is the platform.

### UX shape (recommended)

- **Parent enrols the child in packs** (Settings → Account, PIN-gated). A 9-year-old might have Spelling + Numbers.
- **A compact pack switcher in the header** flips context; Home, Practice, Arcade and Supercharge all follow the active pack.
- **The metagame bar never changes** — coins, avatar, streak stay visible across packs. Coins earned in Numbers buy an avatar worn in Spelling. *This is the point.*
- **Progress screen gets a per-pack tab** plus one combined parent view.

---

## 2. Bizzing Numbers — the product

### Curriculum (Math-Olympiad shaped, ages 8–15)
1. **Fluency** — times tables, mental arithmetic, number bonds _(the daily drill; where the racer/flappy games live)_
2. **Number theory** — primes, factors, multiples, divisibility, remainders
3. **Patterns & logic** — sequences, series, puzzle reasoning
4. **Geometry** — angles, perimeter/area, shapes, symmetry
5. **Combinatorics & probability** — counting, arrangements, simple odds
6. **Word problems** — multi-step reasoning _(uses the voice layer — read aloud)_

### Readiness ladder ("Number Band" 1–9)
Mirrors Bee Band: Classroom → School-contest → Regional → National/Olympiad. Same evidence-based promotion logic (prove 80%+ at a harder band), so **the adaptive code is reused, not rewritten**.

### Item bank — the good news
Maths items are **generative**, unlike the 40k hand-curated words. `7 × 8`, `is 51 prime?`, `next in 2,6,12,20…` are produced by parameterised generators with difficulty knobs. A few hundred lines of generators ≈ an effectively infinite bank. **This is the cheapest content of any pack.**
_Caveat:_ competition-style word problems and true olympiad puzzles still need hand-authoring + a curriculum consultant. Budget for that; don't fake it.

### New UI needed
- **Numpad input** (replaces letter tiles) — big touch targets, ± and fraction keys
- **Working-out scratchpad** (optional, on harder items)
- **Step-through solutions** — "show me how" after a miss, which is the real teaching moment
- Math glyph rendering (fractions, exponents) — lightweight, no LaTeX dependency needed at this level

### Engine mapping — 13 of 14 arcade engines work, several *better* than for spelling

| Engine | Numbers reskin |
|---|---|
| beeGrandPrix | Solve to boost — timed arithmetic racing |
| keepFlying | Correct answer = +1 life |
| whackAMoth | **Whack only the multiples of 7 / only the primes** — outstanding for number sense |
| stageRhythm | **Skip-counting to a beat** — genuinely the best times-tables mechanic there is |
| constellationConnect | Connect factors to their product |
| unscrambleStars | Order numbers / assemble an equation |
| combCatcher | Catch correct answers, dodge wrong |
| typeBlaster | Speed arithmetic |
| spellShield / wordHive / honeycombRun / spotlightSimon | Direct payload swap |
| Magic Squares | Already a maths game |

---

## 3. Phasing

| Phase | Work | Effort | Gate |
|---|---|---|---|
| **A — Platform core** | `SB_PACKS` registry + Item Contract; refactor engines off `gameWordsD()`; pack switcher; per-pack bands & progress; shared wallet. **Spelling becomes pack #1 with zero user-visible change.** | ~2–3 wks | Must not regress spelling |
| **B — Numbers** | Generators, numpad, step-through solutions, Number Band, 6 domains, engine reskins | ~3–4 wks | Proves the abstraction |
| **C — Minds + World** | GK is ~40% done (5,000 trivia questions exist); Geography is flags/capitals/maps + MCQ. Both are quiz-shaped → cheapest packs. | ~2–3 wks each | — |
| **D — Tongues** | Script + vocab + listening per language; **new TTS voices + native review per language** | ~6–8 wks + per-language voice cost | Highest differentiation, highest cost |

**Do Phase A before Phase B.** Building Numbers as a bolt-on without the registry means doing the refactor later against two subjects instead of one — roughly double the pain.

---

## 4. Pricing impact

Subjects become the natural pricing axis, extending the tiers already built:

- **Free** — 1 pack, limited (500 items, basic games)
- **Beginner Bee $4.99/$49.99** — 1 full pack of choice
- **Regional Speller $9.99/$99** — *rename to* **Regional Scholar** — all packs, everything unlocked
- **+$49/yr Advanced** — per pack (Advanced Spelling, Advanced Olympiad…) → this is where the add-on revenue scales

The multi-pack bundle is the single biggest ARPU lever available: same CAC, ~2× LTV.

---

## 5. Risks — stated plainly

1. **Refactor risk.** Spelling is live and working. Phase A touches the engine layer under it. Mitigation: pack registry with spelling as the default pack, behind a flag, with the full headless QC suite green before switching over.
2. **Pedagogy ≠ code.** Maths needs a real curriculum consultant, especially for olympiad-grade problems. The drill loop transfers; the *teaching sequence* does not.
3. **Brand dilution before revenue.** Bizzing Bee has **not yet proven paid conversion** — the tiers only just shipped. Do Phase A (invisible, low-risk) now, but **gate Phase B on real subscription revenue**. Building five subjects on an unvalidated funnel multiplies the loss, not the upside.
4. **Scope creep per pack.** Rule: if a pack needs its own economy, collection or metagame, it's a different company. Packs supply *items and lessons only*.
5. **"Level 3" ambiguity.** For Tongues I've assumed CEFR A2–B1. If you mean a specific national exam (e.g. an Indian state board or a Hindi Prachar Sabha level), the ladder and content change materially — worth pinning down before Phase D.

---

## 6. Recommendation

**Start Phase A now** — it's invisible to users, de-risks everything after it, and is the difference between a platform and five codebases. **Ship Numbers second, but only once the paid tiers show real conversion.** Minds and World are cheap follow-ons that make the bundle look irresistible; Tongues is the moat, and it can wait until the platform is proven.
