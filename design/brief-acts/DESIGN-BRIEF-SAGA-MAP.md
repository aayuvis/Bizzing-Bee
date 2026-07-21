# DESIGN BRIEF — THE SAGA MAP & PLAYER PROGRESSION
### "Where am I in the story?" — the connective tissue of all 36 chapters + 3 Side Roads.
*The map is itself a portrait of the war: everything Bizzy has saved is in color; everything ahead sleeps under grey mist. Progress IS re-coloring the world.*

## 1 · THE SAGA MAP SCREEN — `map-saga-master.svg` (2400×1350, layered; pans vertically on phone)
One continuous painted journey, top-to-bottom (or left-to-right landscape), through six act-lands:
- **Act I land — The Meadow & Hive** (honey golds): meadow edge → hive gates.
- **Act II land — The Worlds Ring** (each world a small vignette isle: stage marquee, star field, dojo roof, lab dome, pond, arcade canyon).
- **Act III land — The Carnival & the Wilds** (too-bright tent, rain-grey exile road, dreamy lotus hollow, siren rocks).
- **Act IV land — The Grey Sea** (paper waves, one-eye cliff, strait, drowned library glow, golden-deer forest edge, locust fields).
- **Act V land — The Ascent** (shrine mountain, leap cliff, half-built bridge of stones, spiral fortress, lantern camp).
- **Act VI land — The Engine & Home** (grey machine cathedral, war field, and at the very end: the Meadow again, in the richest color on the map).
**The Golden Path**: a ribbon (`map-path-gilded.svg`, honey with ink edge) winds through all lands, drawn ONLY as far as the player has cleared — ahead of the current node it becomes a faint dotted grey stitch (`map-path-dotted.svg`). Side Roads branch off as visibly smaller looping trails (S1 off Act IV's end, S2/S3 off Act III's end) with their own mini-gates.
**The Grey Mist**: unreached lands sit under `map-mist-layer.svg` (soft grey fog, 60% opacity, slow drift loop, 2-frame). Clearing an act triggers the mist-part reveal (§5). Cleared lands are FULL color — over a session the map visibly heals top to bottom. Deliver every act-land in color + grey-misted state (separable layers).
**The Grey Tide (villain mirror)**: a thin desaturation waterline (`map-greytide.svg`) creeps at the map's edges during Acts III–V story beats (scripted positions per chapter, not player-driven) — Vex's advance made visible. It recedes fully in Act VI. Subtle: never covers the path.

## 2 · NODES — the 39 stops
Hex stickers on the path, 88×96px at 1×, sticker gloss + ink outline:
- `node-locked.svg` — grey wax hex, faint number, under mist. No glow.
- `node-current.svg` — full-color hex, honey pulse ring (1.6s loop), and **Bizzy herself standing on it** (`map-bizzy-here.svg`, 64px, 2-frame idle bob + occasional wing flick). THE "you are here." Never a pin, always the character.
- `node-cleared.svg` — colored hex with 1–3 star pips embossed; a tiny vignette of that chapter's world inside the hex.
- `node-boss.svg` — larger (112×120), villain-crimson wax seal rim; cleared boss nodes show the villain's emblem CRACKED.
- `node-finale.svg` (Ch 29/30 + 35/36) — deep-purple rim, radiant once cleared.
- `node-sideroad.svg` — round (not hex) token: kart wheel (S1), beat note (S2), wisp flame (S3).
- Gem pip: each cleared node wears its Story Gem at the corner (`gem-act[1-6].svg` from master §3, 22px).
**Act Gates**: between lands, `gate-act[1-6].svg` — medallion arches (110px) matching the six gem designs; locked = grey stone, cleared = gilded + lit. Tapping a gate shows the act title card.

## 3 · PROGRESSION SURFACES
- **The Crew Bar** — `hud-crewbar.svg`: a horizontal band (map top or chapter-brief screen) of tiny circular portraits filling left-to-right as friends are recruited (38 slots grouped by world; empty slot = grey silhouette). Tapping a portrait: their name, world, power. The captured state (Bumble/Melody, Ch 17–34): portrait shackled in static (`crewbar-captive-overlay.svg`) — the map itself aches until the rescue.
- **The Gem Shelf** — `screen-gemshelf.svg`: honeycomb display case, 6 act rows × 6 cells + 3 side-road sockets + the central badge socket ("Every Word Ever", `badge-everyword.svg`, revealed Ch 36). Empty cells show recessed grey wax.
- **The Saga Ribbon (chapter breadcrumb)** — `hud-saga-ribbon.svg`: inside any chapter/game, a slim top chip: act numeral in Sono + chapter title in Hanken + 36-tick micro progress bar with the current tick lit. Always answers "where am I" in one glance.
- **Entry tile (games grid)** — `tile-saga-entry.svg`: the app's Saga tile shows LIVE state: current act-land art as background, "Act II · Chapter 8" caption, Bizzy mini-sprite, and the map's overall % re-colored.
- **Chapter Brief screen** (pre-game): world vignette banner, chapter title (Fraunces), the crew bar, the stakes line, START button as a honey seal. `screen-chapterbrief-frame.svg`.

## 4 · STATES & DATA BINDING (for the build)
Node states map to saga progress: locked / current / cleared(stars 1–3) / boss-cracked / gem-worn. Map scroll auto-centers on the current node on open (smooth 600ms). Landscape shows ~1.5 act-lands per screen; portrait ~1 land. Pinch/scroll free-roam allowed; a "Return to Bizzy" chip (`map-recenter-chip.svg`) appears when scrolled away.

## 5 · MICRO-INTERACTIONS (the progression moments — highest juice priority)
1. **The Hop** — after a chapter win, returning to the map: the new path segment draws itself (400ms gild sweep), then Bizzy HOPS from the old node to the new one (3-frame arc + landing squash + tiny confetti puff + node pulse). This is the single most repeated reward image in the saga — make it delicious.
2. **Mist Part** — act cleared: the next land's mist splits and slides off (900ms), color saturates beneath (radial bloom), the act gate gilds and CHIMES, medallion flies to the gem shelf.
3. **Star Pop** — stars punch onto the node one-by-one (80ms apart, squash-in).
4. **Gem Flight** — the chapter gem arcs from the node to a shelf icon in the corner (600ms bezier, sparkle trail).
5. **Boss Crack** — cleared boss node: villain emblem fractures with a single ink-crack frame + dust.
6. **Grey Tide events** — scripted story moments (Ch 12, 18, 24): the tide visibly advances one notch with a low drone — the map darkens a fraction. Quiet dread, 1.5s, never blocks input.
7. **The Finale Reversal** — Ch 35–36: the entire map re-saturates land by land in journey order (the panorama moment mirrored on the map), ending with the Meadow blooming louder than anything before it.
All map motion honors prefers-reduced-motion (cuts to end states).

## 6 · ASSET DELIVERY LIST (kebab-case, SVG, layers separable)
map-saga-master (6 act-land layers, each color+grey) · map-mist-layer (2-fr) · map-path-gilded / map-path-dotted (9-patch style segments: straight, curve-L/R, branch) · map-greytide · node-locked / current / cleared / boss / finale / sideroad(×3) · map-bizzy-here (2-fr + hop 3-fr) · gate-act1..6 (locked+lit) · hud-crewbar + crewbar-captive-overlay · screen-gemshelf + gem sockets · badge-everyword · hud-saga-ribbon · tile-saga-entry (live-state template) · screen-chapterbrief-frame · map-recenter-chip · FX: gild-sweep, mist-part, star-pop, gem-flight sparkle, boss-crack, confetti-puff.
**Priority: P0** — the map ships WITH Act I; it is the first thing the player sees when entering the Saga.
