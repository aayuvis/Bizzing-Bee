# Bizzing Bee — Avatar Redesign Brief (for Claude Design)

**Project:** Bizzing Bee Design System (claude.ai/design project `399239ae-0ac9-42db-9cd9-6ed89bcc3ea2`)
**Deliverable:** 80 redesigned collectible avatars ("blooks") that plug straight back into the app.
**Audience:** spellers age 6–14. Benchmark: **Blooket blooks** — kids trade, covet, and identify with them.

---

## 1. Why we're redoing them

Play-test verdict on the current set: *"not interesting or engaging except the bee."*
The current avatars are objects-with-faces (a magnet with eyes, a flask with a smile). The bee
mascot works because it is a **character**: it has a face with big expressive eyes, a body pose,
signature details (wings, antennae, stripes), and it looks like it could star in a cartoon.
Every avatar needs to clear that same bar.

### What "good" means here (acceptance criteria per avatar)
1. **Character, not object.** If the design is a thing (a die, a droplet, a joystick), it must be
   *personified*: limbs or wings or a posture, an expression with intent (smug, sleepy, mischievous,
   heroic), not just two dots and a smile stamped on a shape.
2. **Readable at 34 px.** Avatars render as small as 34×34 in pickers. The face and one signature
   detail must survive that size. Test every design at 34 px before accepting it.
3. **Distinct silhouette.** Within a pack, each of the 10 avatars must be identifiable by outline
   alone (no two "rounded square with ears" twins).
4. **Rarity must be visible.** A legendary should *feel* legendary next to a free one: richer
   palette, gold accents, aura/sparkle effects, crown or equivalent. Free ones are charming but
   simple; epic adds costume/props; legendary adds glow/ornament.
5. **Expression variety.** Across a pack use at least 4 different expressions/moods
   (happy, determined, mischievous, sleepy, starstruck, cool…). No pack of ten identical smiles.
6. **Kid-cute + cool.** Big heads, big eyes, small bodies read cute; asymmetry, props, attitude
   read cool. Both, not either.

---

## 2. The roster (do not rename ids — the app keys on them)

8 packs × 10 avatars. Rarity: `free` (starter), `rare` (120 coins), `epic` (250), `legendary` (500, exactly one per pack).

### Hive Pack — bees & garden (accents #6C4FE0 / #FFC23D)
| id | name | rarity | character intent |
|---|---|---|---|
| bizzy | Bizzy Bee | free | **Keep. This is the mascot and the quality bar.** |
| honeypot | Honey Pot | free | round honey-pot critter, sticky drip hair, blissful grin |
| bumble | Bumble | rare | chunky fluffy bee, tiny wings that clearly can't lift it, unbothered |
| waggle | Waggle | rare | dancing bee mid-waggle, motion lines, headphones |
| drone | Drone Dan | rare | sleepy worker bee with tool belt, heavy eyelids |
| clover | Clover | rare | lucky clover sprite, winking, one leaf as a cowlick |
| blossom | Blossom | epic | flower-fairy face framed by petals, rosy cheeks |
| nectar | Nectar | epic | droplet imp with a straw, cheeky |
| propolis | Propolis | epic | little bee knight with hexagon shield, determined |
| queenhive | Hive Queen | legendary | regal queen bee, crown, cape, golden aura |

### Stage Pack — theatre & music (#9C6A08 / #F7E9C8)
star (Center Star, free) confident star performer taking a bow · mic (Big Mic, rare) retro microphone crooner · maestro (Maestro, rare) conductor with baton mid-flourish · jester (Jester, rare) grinning jester, bells · lumen (Lumen the Light, rare) spotlight robot on tripod legs · diva (Diva, epic) sunglasses, feather boa · popcorn (Popcorn, epic) popcorn box buddy, kernels popping · melody (Melody, epic) singing note-sprite · encore (Encore, epic) starstruck fan with glow sticks · goldlegend (Gold Legend, legendary) living golden trophy, laurel, shine.

### Cosmos Pack — space (#4A5BD4 / #36D1FF)
luna (Luna, free) sleepy moon kid with nightcap · astro (Astro, rare) astronaut with reflective visor · comet (Comet, rare) speeding comet with flame hair · rocket (Rocket Rae, rare) grinning rocket, window face · alien (Zib the Alien, rare) three-eyed friendly alien · saturn (Saturn, epic) planet with hula-hoop rings · blackhole (Void, epic) mysterious dark orb, star freckles · supernova (Supernova, epic) exploding star, wild energy · ufo (Saucer, epic) saucer with a tiny pilot peeking · nebula (Nebula Drake, legendary) cosmic dragon, galaxy-gradient scales.

### Dojo Pack — martial arts (#C43D5A / #FFD23F)
panda (Panda Sensei, free) wise panda with headband · ninja (Shadow Ninja, rare) masked, only eyes visible · samurai (Samurai, rare) helmet + topknot, stern-cute · neko (Lucky Neko, rare) beckoning cat, gold coin charm · bamboo (Bamboo, rare) bamboo sprout doing a kick · kitsune (Kitsune, epic) sly fox spirit, swirling tails · oni (Oni Grin, epic) tiny friendly demon, big grin, horns · koi (Koi, epic) leaping koi with splash · starsteel (Star Steel, epic) shuriken spinner character · dragonmaster (Dragon Master, legendary) dragon sensei with beard, scroll.

### Lab Pack — science (#0E8A78 / #9BE34D)
beaker (Bubbly Beaker, free) bubbling flask critter, goggles · atom (Atom, rare) electron orbits as hula rings · robo (Robo Helper, rare) friendly robot, antenna heart · magnet (Magneto Max, rare) magnet strongman flexing · germy (Germy, rare) mischievous germ blob, many hands · brainiac (Brainiac, epic) big pulsing brain, glasses · phoenix (Phoenix Flame, epic) lab-born flame bird · volt (Volt, epic) electric imp, bolt hair, charged cheeks · scopey (Scopey, epic) microscope with an eye lens · aurum (Aurum Formula, legendary) golden elixir genie rising from a flask.

### Arcade Pack — retro games (#3B6FE0 / #FF5D9E)
pixel (Pixel Pal, free) 8-bit sprite, blocky and bouncy · joy (Joy Stick, rare) joystick with boxing-glove hands · ghost (Cabinet Ghost, rare) pac-style ghost, shy smile · dpad (D-Pad, rare) d-pad ninja, cross pose · tokeny (Tokeny, rare) arcade token rolling on edge · bossbot (Boss Bot, epic) final-boss robot, crown antenna · rainbow (Rainbow Cart, epic) kart racer trailing rainbow · glitch (Glitch, epic) half-corrupted sprite, static · hiscore (1-UP, epic) leaderboard champ, "1UP" cap · neonking (Neon King, legendary) neon-outline royalty, glow lines.

### Origami Pack — folded paper (#C25A2E / #F2E9DA)
paperplane (Paper Plane, free) plane with pilot goggles · cranefold (Crane, rare) elegant paper crane · boatfold (Little Boat, rare) sailor boat, wave base · hopfold (Hop Frog, rare) coiled paper frog mid-hop · fanfold (Fan Dancer, rare) fan with face medallion, dance pose · lotusfold (Lotus, epic) serene lotus, meditating face · koifold (Paper Koi, epic) angular koi, fold lines visible · kabuto (Kabuto, epic) samurai paper helmet with eyes under the brim · flutterfold (Flutter, epic) origami butterfly, patterned wings · goldencrane (Golden Crane, legendary) gold-foil crane, light rays.
*Origami note: keep the flat-fold geometry (it's the pack identity) but give each one a face and a pose — fold lines as expression.*

### Elements Pack — earth/air/fire/water (#2E8FB8 / #9BD3B4)
pebble (Pebble, free) round stone buddy, moss hair · breeze (Breeze, free) swirl of wind with cheeks puffed · droplet (Droplet, rare) brave little raindrop · ember (Ember, rare) campfire spirit, warm grin · leafy (Leafy, rare) leaf sprite riding the wind · cloudy (Cloudy, rare) cloud with rain-boot feet · wave (Big Wave, epic) curling wave surfer · boulder (Boulder, epic) gentle giant rock, stoic · zappy (Zappy, epic) lightning bolt sprinter · elemental (Elemental Prime, legendary) all four elements orbiting one core being.

---

## 3. Technical contract (so designs upload straight into code)

The app renders avatars via `window.SB_AVATAR(id, size)` in `spellbound-app/avatars.js`, which wraps
per-avatar SVG body markup in `<svg viewBox="0 0 120 120" width=… height=…>`.

Hard requirements per avatar:
- **Canvas:** 120×120 viewBox. Keep the character inside ~8 px margins; small overshoot (antennae, sparkles) is fine — the container uses `overflow: visible`.
- **Self-contained SVG:** no external images, fonts, CSS classes, or `<use>` across files. Inline `fill`/`stroke` only.
- **Namespaced defs:** every gradient/filter id must be unique per avatar (prefix with the avatar id, e.g. `id="bizzy-g1"`), because many avatars render on one page.
- **No scripts, no animation required.** (Subtle SMIL is acceptable but must degrade gracefully.)
- **Flat vector style**, 2–3 px outlines where used; keep node counts sane (< ~60 elements each) — 80 of these ship in one JS file that must stay lightweight.
- **Works on light and dark surfaces:** avatars sit on `--surface2` tiles in light, white, and dusk modes — don't rely on the page background for the silhouette.

**Handoff format (either is fine):**
1. One file `avatars-art.js`: `window.SB_AVATAR_ART = { bizzy: '<defs>…</defs><g>…</g>', honeypot: '…', … }` (SVG inner markup keyed by id), **or**
2. 80 individual `.svg` files named `<id>.svg` with the 120×120 viewBox — we'll inline them.

Keep the existing `id` strings exactly; names/rarities/packs stay as in the roster table.

## 4. Review gates before handback
- Contact sheet of all 80 at 96 px **and** 34 px; every face readable at 34 px.
- Silhouette sheet (solid black fills): no near-duplicates within a pack.
- Rarity line-up per pack (free → legendary): visible escalation.
- The bee (`bizzy`) is the control — anything that looks flat next to it goes back for rework.
