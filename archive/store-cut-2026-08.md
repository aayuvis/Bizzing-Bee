# Store cut — 31 Aug 2026

The store was trimmed to make every shelf strong: **8 worlds** (4×2 grid, the Hive
free and default, the rest bought with coins) and **avatar packs of exactly 8**
rendered as one row each. Nothing was deleted — everything removed from the app is
archived *in place* in the codebase and can be revived by reversing the flags below.

## Worlds removed from the store (4)

| id | label | where its code still lives |
|---|---|---|
| `marquee` | Spotlight | scene in worlds4.js `build()`, theme CSS in worlds4.css, EVO ladder, `sgw-stage` art, splash art `sgw-stage.jpg` |
| `serpent` | Serpent's Lair | worlds4.js scene + ladder + CSS (its `W` entry is commented out at the top of worlds4.js) |
| `origami` | Origami | worlds4.js scene (the self-folding crane), theme CSS, EVO ladder |
| `pixel` | Arcade | worlds4.js scene, theme CSS, EVO ladder |

**To revive a world**: re-add its entry to `THEMES` (app2.js) or the `W` array
(worlds4.js), restore it to the splash `T` table in index.html, and remove it from
the `GONEW` boot-migration map in app3.js. Its scene, ladder, music config and CSS
never left.

**Migration shipped with the cut** (app3.js boot): owners of a coin-bought removed
world (`serpent`/`origami`/`pixel`) are refunded the full 400 coins once; a save
whose active theme was removed falls back to the Hive; Spotlight (which was free)
is re-homed without a refund.

The eight live worlds: spellbound (The Hive, default) · aurora (Galaxy) ·
anime (Blade) · science (Lab) · avatar (Elements) · godly (God's Abode) ·
race (Race Zone) · dino (Dino Era).

## Avatars retired from the store (75 of 217)

All 217 definitions and their art stay in `avatars.js` / `avatars/*.webp`.
`SB_AVATARS.list` is now the 142 **live** avatars (what the store, the drops and
the collection count read); `SB_AVATARS.all` + `byId` still carry everyone, so:
- a child who owns a retired avatar keeps it and can keep wearing it;
- book/reader volume mascots, mock-bee rivals and any other in-app reference
  (Stage Pack faces are used heavily there) keep rendering.

**To revive an avatar**: delete its id from the `ARCH` set in avatars.js (and give
it a home via the `MOVE` map if its old pack is gone).

Retired packs: **Stage Pack** (popcorn re-homed to Vibe), **Arcade Pack** (rainbow
re-homed to Turbo), **Wildhearts Pack** (hoppy + fawn to Critter Crew, pegasus to
Legends). **Dino + Serpent merged** into the Reptilian Pack (trice, noodle, raptor,
stego, bronto, cobra, rexking, naga). **Gods Pack split** into European Gods
(thor, poseidon, athena, hades, apollo, loki, zeus, odin) and Indian Gods
(hanuman, lakshmi, rama, krishna, shiva, ganesha, durga, saraswati); the five gods
outside both (freya, ra, anubis, isis, amaterasu) are archived — enough for a
future "World Gods" pack.

Spelling Champions stays at 6 — they are real historical bee champions and we do
not invent real people to fill a row.

Full retired list: see the `ARCH` set in avatars.js (grouped and commented per pack).
