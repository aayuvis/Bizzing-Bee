# Episode 1 — production plan

**Film:** *Before the Bee: 1908, 1925, and the First Four Champions*
**Runtime:** 8:22.3 · **VO:** `vo/bizzing-vo-ep1-despina.mp3` (Despina, −16 LUFS) · **1920×1080 / 24fps**

---

## 0. Inherited constraints

From `15-video-production-brief.md` (the sibling property's, learned expensively). Adopted
here, with two deliberate departures noted in §6.

- **No generative video.** Stills and sprites, composited locally. Generative *image* models
  are in; generated *motion* is out.
- **HTML/CSS shot pages → headless Chromium, frame-stepped** (`getAnimations()` paused,
  `currentTime` set per frame). Re-rendering after a note costs zero API calls.
- **The audio is the clock.** Shot durations come from the narration, never the reverse.
  §1 below is the spine and it is already measured — nothing in this film is a guess.
- **No generated lettering in a shot.** All type is composited afterwards in Fraunces 800 /
  Hanken (the app's own faces, in `spellbound-app/fonts/`).
- **Assert what a viewer would complain about** — see §5.

---

## 1. The spine (measured from the render — do not re-derive)

| # | Section | In | Out | Len |
|---|---|---|---|---|
| 01 | COLD OPEN — Marie Bolden | 0:00.0 | 0:25.6 | 25.6s |
| 02 | TITLE | 0:26.1 | 0:31.6 | 5.5s |
| 03 | WHERE BEES COME FROM | 0:32.1 | 1:29.8 | 57.7s |
| 04 | 1908 | 1:30.3 | 2:47.6 | 77.3s |
| 05 | WHY 1925 STILL MATTERS | 2:48.0 | 3:41.4 | 53.3s |
| 06 | THE 1925 FINAL | 3:41.8 | 4:55.1 | 73.3s |
| 07 | WHAT HAPPENED TO FRANK | 4:55.6 | 5:36.3 | 40.7s |
| 08 | 1926 | 5:36.8 | 6:23.6 | 46.8s |
| 09 | 1927 | 6:24.0 | 6:43.4 | 19.4s |
| 10 | 1928 | 6:43.9 | 7:14.2 | 30.3s |
| 11 | WHAT HAPPENED TO THEM | 7:14.6 | 7:45.1 | 30.5s |
| 12 | CLOSE | 7:45.5 | 8:22.3 | 36.8s |

Machine-readable: `timing.json`. **0.45s of silence sits between every section** — cut
transitions there, never mid-sentence.

---

## 2. Structural decision: the title does NOT open the film

**There is no pre-roll branded sting.** The film opens cold on Marie Bolden, and the title
lands at **0:26** — on the line *"Everybody will tell you the first National Spelling Bee was
1925. It wasn't."*

That is not a stylistic preference. A branded intro before the hook is the single most
reliable way to lose a first-time viewer in the opening ten seconds, and §01 *is* the hook —
a thirteen-year-old on a stage in 1908 with a team refusing to spell against her. The title
then arrives as a **payoff** to a contradiction the viewer is already holding, which is the
strongest possible place to put it.

§02 is 5.5s — exactly the length a title animation should be.

---

## 3. Shot list

Motion discipline throughout: **one move per shot, never reversing**, 3–8% travel over the
shot's length. A Ken Burns move that changes direction reads as a mistake. Slowest move on
the longest shot.

### §01 COLD OPEN · 0:00.0–0:25.6 · *"Cleveland, Ohio. June, 1908…"*

| In | Shot | Asset | Motion |
|---|---|---|---|
| 0:00.0 | Black → theatre interior, house lights | `hippodrome-*` or period theatre plate | slow push in, 4% |
| 0:06.5 | A single empty spot on a stage floor | plate detail crop | hold, very slow drift |
| 0:11.0 | Marie Bolden — **portrait if the agent found one; otherwise a period-typographic card**, see §4 | — | slow rise |
| 0:17.5 | New Orleans / segregation-era beat — **restraint required**, see §6.2 | period press or typographic | static, hard cut in |
| 0:22.0 | Return to the stage; hold for "she earned her place" | as 0:06.5 | settle, motion stops |

**Motion stops on the last line of the cold open.** Stillness on "If you don't like it, go
home" does more than any move.

### §02 TITLE · 0:26.1–0:31.6 — **ANIM A4 + A1**

Full-frame honeycomb field (the banner's, reused). `1925` sets in Fraunces 800 — then
**strikes through and drops away**, replaced by `1908`. Title resolves beneath:
**BEFORE THE BEE**. Bizzing™ Bee mark bottom-right, small.

The whole idea of the film is one number being replaced by another. Show exactly that.

### §03 WHERE BEES COME FROM · 0:32.1–1:29.8

| In | Shot | Asset |
|---|---|---|
| 0:32.1 | Noah Webster portrait | `noah-webster-portrait-1833-herring-npg` |
| 0:41.0 | The blue-backed speller — cover, then a spread | Webster's *American Spelling Book* |
| 0:52.0 | **ANIM A6 — "colour→color"**: the U lifts out and falls away; "centre"→"center" swaps R and E | built |
| 1:04.0 | Frontier schoolhouse at night, windows lit | period photo/engraving |
| 1:14.0 | Interior — a crowded schoolroom | period engraving |
| 1:22.0 | Hold on the room | — |

A2 (the letter animation) is the film's signature and this is its first, gentle appearance —
so the big one at §06 reads as a return, not a novelty.

### §04 1908 · 1:30.3–2:47.6 — **the longest section, needs the most cuts**

| In | Shot | Note |
|---|---|---|
| 1:30.3 | NEA convention / Cleveland 1908 exterior | |
| 1:38.0 | Hippodrome Theater | |
| 1:46.0 | **ANIM A5 — city ribbon**: team cities light along a period US map | Cleveland last |
| 1:58.0 | Spellers on stage, wide | |
| 2:08.0 | **ANIM A1 — the perfect card**: Cleveland's roster, errors ticking up beside every name except one | *the section's hero beat* |
| 2:22.0 | Marie Bolden — the strongest image available | hold long |
| 2:34.0 | The gold medal — **ANIM A7**: struck, then it fades to an empty outline | pays off "nobody knows where it is" |
| 2:42.0 | Guinness/first-in-the-world card | type only |

### §05 WHY 1925 STILL MATTERS · 2:48.0–3:41.4

Newsroom, press, a masthead. **ANIM A5 at 3:12** — nine newspapers light across the map, then
the counter runs to **2,000,000** and collapses to **9**. Big number → tiny number is the
section's whole argument.

### §06 THE 1925 FINAL · 3:41.8–4:55.1 — **THE HERO SEQUENCE**

| In | Shot | |
|---|---|---|
| 3:41.8 | US National Museum exterior | `us-national-museum-exterior-*` |
| 3:50.0 | Coolidge portrait / handshake line | `calvin-coolidge-photo-c1924-ulmann-npg` |
| 4:00.0 | Interior, the hall | `us-national-museum-interior-*` |
| 4:10.0 | Two children left — silhouetted figures on the honeycomb ground | |
| 4:18.0 | **ANIM A1 — GLADIOLUS** letters land one at a time as spoken | |
| 4:31.0 | **ANIM A2 — the Y**: `G L A D I O L` then **Y** lands, turns red, cracks and falls | **the film's peak** |
| 4:38.0 | Beat of black. Silence in the mix. | |
| 4:42.0 | The word rebuilds — **U** lands gold in the Y's place | |
| 4:49.0 | Gladiolus flower, botanical plate, blooming into frame | |

**This is the shot the film exists for.** Everything else can be competent; this has to be
beautiful. Budget accordingly.

### §07 WHAT HAPPENED TO FRANK · 4:55.6–5:36.3

Parade → a patent document, dense type, slow push → a slow cross-dissolve chain suggesting
decades → **close on gladioli in a garden, present day, hold to the end of the section.**
Motion stops again. The last line is "He was still growing gladioli"; the picture should
already be there when it lands.

### §08 1926 · 5:36.8–6:23.6

Prize card **$500 → $1,000** (A4 counter). Field **9 → 25** as 25 hex cells filling.
Pauline Bell. **ANIM A6 — CERISE**, the word setting in its own colour against a 1920s
department-store plate. Close on a single unnamed girl in the group shot — that is Betty
Robinson, and the film does not say so yet.

### §09 1927 · 6:24.0–6:43.4 — shortest section, **maximum two shots**

Dean Lucas / an Ohio schoolroom, then **ABROGATE** setting over a Prohibition-era press
image. Do not cram; 19.4s is two shots.

### §10 1928 · 6:43.9–7:14.2

Return to the *identical framing* used for Betty in §08 — the visual rhyme is the payoff.
Then **ANIM A1 ×2**: `KNACK` lands, holds, clears; `ALBUMEN` lands. Then the LoC White House
photograph, which is the one place we have the real people in the real room.

### §11 WHAT HAPPENED TO THEM · 7:14.6–7:45.1

Four portraits in sequence, each fading to a plain card as the narration says the record
stops. Marie's card last, and it holds on the **empty medal outline** from §04.
**No motion at all in this section.** It is about absence.

### §12 CLOSE · 7:45.5–8:22.3

Four winning words assemble as cards — *gladiolus · cerise · abrogate · albumen* — then
`guetapens` sets beside `knack` at the same size, which makes the "it got harder" point
without a word of explanation. Return to the 1908 stage. Last frame: the Bizzing™ Bee mark,
`www.bizzingbee.com`, and the AI-disclosure line.

**Bizzy appears only here.** He is in the app so he is allowed on the channel (Rule 1), but a
mascot walking through a segregation-era history would be a serious tonal error.

---

## 4. Assets

### 4.1 In hand — 21 files, all CC0, verified valid (`images/MANIFEST.md`, 488 lines)

Sourced from **Smithsonian Open Access via its public S3 mirror**
(`smithsonian-open-access.s3-us-west-2.amazonaws.com`), which was the only route the egress
proxy permitted. Every record was filtered on an explicit `CC0` flag, so nothing
rights-unknown is in the set.

| Group | Files | Best of them |
|---|---|---|
| Webster / the speller | 6 | The **actual 1821 *American Spelling Book*** — cover and pages. Plus *"Noah Webster – The Schoolmaster of the Republic"*, a chromolithograph with the blue speller in frame |
| Schoolroom | 3 | *The Village School* (c.1870 lithograph, master asleep, pupils rioting) |
| Coolidge / 1920s | 4 | Ulmann photograph c.1924; 1926 Model T |
| **The venue** | 5 | **Two c.1920 interiors of the Arts & Industries Building** — the National Museum, where all four bees were held |
| Lindbergh | 2 | Spirit of St. Louis + cockpit |
| Gladiolus | 1 | Herbarium specimen sheet |

**Three content caveats — do not mis-caption:**
- The Spirit of St. Louis shots are **modern museum photographs** of the 1927 aircraft, not
  1927 press photos.
- The building **exteriors are 1880s**; only the **interiors are c.1920**. Use the interiors
  for the bee hall.
- The gladiolus is a **pressed 1932 Central European herbarium specimen** — not an American
  garden flower and not in bloom. See §4.3.

### 4.2 ⚠️ BLOCKING — the bee photographs, which must be fetched by hand

**No photograph of any spelling bee was obtained.** Every known image is Library of Congress
held, and `loc.gov` — along with archives.gov, NYPL, Internet Archive, Wikimedia Commons,
BHL, PICRYL and Openverse — is blocked by this session's egress proxy for both `curl` and
WebFetch. This is an environment limit, not an availability one: **the images are public
domain and take two minutes to download from an ordinary browser.**

Download these four and drop them in `video/images/`:

| Item | What it shows |
|---|---|
| `loc.gov/item/94509235/` | Coolidge with the seven 1925 finalists |
| `loc.gov/item/2016888806/` | Everett Sanders congratulating Betty Robinson, 1928 |
| `loc.gov/pictures/item/hec2013004930/` | Coolidge and Betty Robinson, 1928 |
| `loc.gov/pictures/item/2016890661/` | The 1928 winners with Coolidge — Doig, Robinson, Gray |

LoC states **"No known restrictions on publication"** for these. **One caveat:** item
`2016888806` is credited to **Harris & Ewing**, not the National Photo Company — read the
rights advisory on its own item page rather than assuming it matches the others.

Until these land, **§10 has no photograph of the real people in the real room**, which is
that section's whole payoff.

### 4.3 Still needed

1. **Marie C. Bolden portrait — the highest-value missing asset.** Not found, and it may not
   exist in any free collection. If none is available, §01 and §04 carry her
   **typographically**. **Never use an unidentified period photograph of a Black child as if
   it were her.** That error ends a channel's credibility and is not recoverable.
2. **Hippodrome Theater, Cleveland, c.1908** — not found.
3. **Gladiolus in bloom.** The herbarium sheet is a pressed, dried specimen; §06 calls for a
   flower blooming into frame. Two honest options: generate a botanical plate in house style,
   **or** rewrite the shot to use the specimen sheet — which is arguably the better image, and
   truer to a film about a boy who grew them. Decide before building §06.
4. 1920s newsroom / press. *(The agent deliberately declined 19th-century brass patent models
   here rather than pass them off as the Courier-Journal pressroom — the right call.)*
5. 1920s department store or a `cerise` fashion plate (Cooper Hewitt's CC0 plates stop at 1888).
6. 1920s classroom photograph; 1929 crash.

**Generated (Gemini image, app house style):** honeycomb fields and transition cells, the
word-card furniture, the medal, and era backgrounds where no period image exists. Generated
plates carry **no lettering** — type is composited.

---

## 5. Assertions (`--check`, before a frame renders)

Per Rule 5. A failure is an exit code, not something someone has to notice.

```
shot durations sum to each section's narration length, ±1 frame
no shot < 2.0s                          → no strobing
every letter animation's final string == its target, character for character
    ← THE one for this film. A spelling channel misspelling a word on screen
      is the most embarrassing failure available to us.
every type layer has an explicit z-index above its scrim      (brief §5.5)
every still is referenced in images/MANIFEST.md with a rights line
    → an unrightsed frame is a takedown
title card built with -loop 1 -t <s>, never a bare -i         (brief §5.4)
preview render measurably smaller than the master             (brief §5.11)
```

---

## 6. Two deliberate departures from the sibling brief

**6.1 "Made for Kids" and comments.** The brief mandates Made-for-Kids and comments off. That
is right for narrated Panchatantra films aimed at young children. **This film is not that** —
it is a history documentary pitched at 10+ and at parents. Made-for-Kids would disable
comments, end screens and notifications on a channel whose growth depends on them. This is a
per-channel legal call with FTC exposure and should be decided with counsel, not inherited.

**6.2 Editorial: the 1908 racial history.** The brief's rule is *never make the video braver
than the text*. Here the text is already direct — the New Orleans team refused, Cleveland
told them to leave, a Black thirteen-year-old out-spelled the country. **Do not soften it in
pictures and do not sensationalise it.** No lynching-era imagery, no shock cuts. The
restraint is: state it, hold on her, move on. She is the hero of the sequence, not the
subject of a tragedy.

---

## 7. Build order

1. Reconcile `images/MANIFEST.md`; commission the gaps in §4.
2. Build the **six animation primitives** (A1 letter-drop, A2 wrong-letter, A4 counter/year,
   A5 map ribbon, A6 word card, A7 medal) as standalone HTML pages with their assertions.
   These are the fixed cost of the whole channel — every future episode reuses them.
3. Author `scenes.json` against `timing.json`.
4. `--check`.
5. Render **§06 alone**, watch it, fix, then render the rest.
6. Sample the finished film across its length, not first-and-last frames.

Render is ~4 min/shot at 1080p24 and parallelises across shots. **Add per-shot caching before
episode 2** — the sibling project flags its absence as the difference between a 5-minute and
a 45-minute iteration.
