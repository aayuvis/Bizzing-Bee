# 03 — Bizzing Bee documentaries: handover

**Audience:** a Claude Code session picking up the Bizzing Bee YouTube channel cold, with
none of the conversation that produced episode one. Read `CLAUDE.md` and
[02-production-brief.md](02-production-brief.md) first — everything they say still binds
except where §7 records an explicit owner override. This document covers what is
*different* about the Bizzing Bee films and what it cost to learn.

**You are the video-generating session.** Everything you build — pipeline, plates, scenes,
and the finished masters — commits back into **this** repo (`aayuvis/Bizzing-Videos`). The
Bizzing Bee app repo is where episode one happened to be built; it is not where the films
live. Do not leave a master behind in the app repo.

**Two repos, and you need both attached.** The app repo `aayuvis/bizzing-bee` holds the
champion avatars, the word data and `spellbound-app/champions-pack.py`. This repo holds the
films. A session with only one of them can read but not publish across the boundary — the
git proxy refuses to inject a credential for a repo that is not a source. Ask for both at
session start.

**Status at handover:** episode one, *Before the Bee: 1908, 1925, and the First Four
Champions*, is finished — 124 shots, 8:31, five review passes. The pipeline that made it
lives in the **Bizzing Bee** repo under `video/`, not here. Moving it here is job one and
§7 says how.

**Read §7 before you touch anything else.** It carries the one rule in `CLAUDE.md` that the
owner has overridden, and getting that wrong costs a re-render.

---

## 1. This is a different kind of film, and the difference matters

The three films in `films/` are **story films**: a narrated Panchatantra or Jataka tale, a
small cast of animals, a rig primitive per film that makes one structural fact impossible to
get wrong. Bizzing Bee's are **documentaries**: real people, real dates, real photographs
from the Library of Congress and the Smithsonian sitting in the same cut as generated
illustration.

That changes the central risk. In a story film the thing that embarrasses you is a
*continuity* failure — the geese let go of the stick. In a documentary it is a
**provenance** failure: a viewer cannot tell which images are evidence and which are
drawings, and a generated portrait captioned with a real person's name is a fabrication
presented as a document. On a children's history channel that is unrecoverable.

So the two rules from `CLAUDE.md` gain a third, which is absolute:

> **3. No generated picture of a real person, ever.** Not Marie Bolden, not Frank
> Neuhauser, not Edna Stover. Where a person has no free photograph, the film carries them
> TYPOGRAPHICALLY, or from behind, or as an app avatar — never as a synthesised face
> presented as a likeness.

Two corollaries that took a review round each:

- **Nothing generated may read as a photograph.** Every plate is openly a drawing: inked
  line, flat inks, visible hand. That is not taste, it is what stops a generated image being
  mistaken for archive footage when it sits four seconds away from a real one.
- **A generated map may carry no lettering.** Ask for the landmass alone and place every
  city dot in code from real latitude and longitude. A model's own map labels cannot be
  trusted, and an unverifiable label beside four genuine archive plates is the same failure
  in smaller type.

The one sanctioned exception is the app's **collectible avatars**. They are unmistakably
stylised characters, the audience already meets them in Bizzing Bee, and the pack has
carried real historical figures (Curie, Gandhi, Nightingale, King) since long before the
films. Episode one uses them wherever a champion is named. A chibi sticker is not a claimed
likeness; a rendered face would be.

---

## 2. The one idea worth copying: **the audio is the clock, to the word**

`CLAUDE.md` already says the audio is the clock. Episode one pushes that much further, and
this is the single most valuable thing to carry forward.

**Version one positioned every shot by a hand-typed offset** inside its narration section —
`at: 36.5`, meaning "about thirty-six seconds into this eighty-second block". Those numbers
were guesses, and guesses drift. The GLADIOLUS letter-drop — the shot the entire film exists
for — was typed at **258.3s** when the narrator does not begin spelling until **285.1s**.
Twenty-seven seconds. Smaller versions of the same error ran through the rest, which is why
the first cut kept showing you a thing several seconds before the sentence that explains it.

**No shot carries a time now. Each carries a CUE** — a phrase the narrator actually says:

```js
{ s:6, cue:'The word is gladiolus', type:'spell', word:'GLADIOLUS' },
{ s:6, cue:'Frank grew gladioli',   type:'gladiolus' },
```

`build()` resolves each cue against a word-level transcript, derives every duration from the
next shot, and **throws on a cue the narrator never says**. Re-record a line and the film
re-times itself for free. Mistype a cue and the render refuses to start. It is the
`scenes.json`-invariant idea from `CLAUDE.md` applied to time instead of geometry: there is
no field for a timestamp, so a wrong timestamp is not a mistake anyone can make.

### Getting word-level times with no speech model

`huggingface.co` and `openaipublic` are both blocked by the session egress policy, so there
is no Whisper to run. **There does not need to be.** Every word that was spoken is already
known; only its position is not. `video/align.py` recovers positions from the audio itself:

1. `ffmpeg silencedetect` splits the mix into **speech runs**.
2. Each narration section's runs are known exactly, because `timing.json` came from the
   per-section wav lengths at synthesis time.
3. Inside a section the text is laid on a **speech clock** — a timeline with the pauses
   removed — advancing at a constant rate per syllable, then converted back to wall time
   through the run list. Pauses therefore fall *between* words rather than inside them.
4. Each sentence onset **snaps to a real breath** when one is near, and every snap
   **re-anchors** the clock so error is spent rather than carried.

Two settings do two different jobs and must not be merged: a *fine* silence pass drives the
clock (every pause removed makes the constant-rate assumption truer), while only pauses
longer than `GAPMIN` are valid sentence anchors. Snapping to comma-length pauses is what left
§6 running one to two seconds late.

Accuracy: **±0.5s on sentence onsets, ~1s mid-sentence.** Verified, not assumed — see §6.

The payoff beyond timing: the nine letters of G-L-A-D-I-O-L-U-S land on the nine *spoken*
letters, 0.226s apart, because those timestamps are ordinary tokens in the transcript.

---

## 3. Where episode one's pipeline lives

All of it is in the **Bizzing Bee** repo (`aayuvis/Bizzing-Bee`), branch
`claude/apply-bundle-push-p0sl6r`, under `video/`:

| file | what it does |
|---|---|
| `ep-origins-first-four-bees.md` | the script; header carries the two factual warnings |
| `prep.py` | script → `segs.json` (spoken forms: years to words, letters spaced) |
| `tts.py` | Gemini TTS per section → wav |
| `timing.json` | per-section in/out, from the synthesised lengths |
| `align.py` | → `words.json`, every spoken word with a timestamp |
| `verify_align.py` | cuts clips at computed times and has them transcribed blind |
| `plates.py` | 32 illustrated plates (Gemini image), with the honesty rules in its docstring |
| `sprites.py` | cut-out vehicles/figures/map, magenta-keyed to transparency |
| `sfx.py` | the only sound effects, synthesised |
| `film/scenes.js` | **the film as data** — 124 shots, cue-timed |
| `film/shotrender.js` | one shot → DOM; all the drawn animation |
| `film/shot.html` | the stage, fonts, tokens |
| `film/render.cjs` | assertions, frame-stepping, `--still`, `--slice`, `--resume` |
| `film/assemble.sh` | concat + mux + checks |
| `film/finish.sh` | re-render stale shots, then assemble |

Rendering is frame-stepped, never recorded: every animation is paused and its `currentTime`
set per frame, so two runs are identical and there are no dropped frames. **Nothing may
depend on wall-clock time, `setTimeout` or `requestAnimationFrame`** — every moving thing is
a CSS animation or a Web Animations API animation. SVG SMIL (`<animate>`) is invisible to
`document.getAnimations()` and must never be used.

---

## 4. The traps, each of which cost a round

**Wait for images to DECODE, not for two animation frames.** Plates are 2752px PNGs of three
to five megabytes; two `requestAnimationFrame`s is not long enough to decode one. A shot
whose picture had not arrived rendered as fireworks over black. `await
Promise.all([...document.images].map(i => i.decode()))`. This also removes a blank *first*
frame at the head of every plate shot — the same bug one frame wide, and far harder to
notice.

**`set -o pipefail` plus `ffmpeg -i` is a silent killer.** `ffmpeg -i` with no output file
exits non-zero *by design*; under `pipefail` that aborts the script, and because the caller
pipes the log to `tail`, it leaves no trace. It stopped one build right after the concat and
another right before the length check. Guard every such helper with `|| true`. The `head -1`
SIGPIPE variant did the same thing earlier.

**A generator whose failure mode is "delete everything" is worse than no generator.**
`avatar-manifest.js` globbed `.png`; the art had become `.webp`; running it wrote `{}` and
un-painted all 211 avatars in one line. Rebuilt to accept either extension and to **refuse a
manifest that shrinks** unless forced.

**Workers load the scene graph once, at start.** Anything edited mid-render is invisible to
them, so a shot they already produced is *stale rather than broken* — it silently carries the
old definition into the concat. Track what changed and re-render exactly those (`finish.sh`).

**Concatenating whatever is on disk ships a film with a hole in it.** A worker that dies
leaves its slice missing and `-c copy` joins the rest without complaint. Check the count
against the scene graph before joining, and name what is missing.

**A derived file that comes out larger than its master** is the trap `CLAUDE.md` records;
quality-target the preview (`-crf`), never bitrate-pin it.

**Sample the corner colour when keying, do not assume the magenta you asked for.** Two of six
sprites came back on a soft mauve. A fixed-colour key leaves those fully opaque, which
composites over the plate as a solid rectangle rather than failing loudly.

**Overscan generated plates 3.5%.** Several come back with a faint painted paper edge despite
the prompt forbidding it; at 2752px wide the crop is still a downscale. Never on archive
photographs, where it eats picture.

**`pkill -f <pattern>` kills your own shell** when the shell's command line contains the
pattern. Kill by PID.

**Encode review copies STEREO.** A 28 MB review cut was reported as having no audio. The
audio was there — a blind transcription read the narration back word for word — but it was
**mono** AAC, and several embedded players drop a mono track silently rather than
downmixing it. `-ac 2 -ar 44100`, always, on anything a human will watch in a chat window
or a browser. Note the shape of this bug: the file was correct by every measurement and
wrong in the only way that mattered, which is why §6 exists.

**Never claim a deploy is live from inside the container.** `bizzingbee.com` and the
`github.io` fallback both return 000 here while `github.com` answers — the egress policy
does not allow them. Verify the *branch*, and say plainly that you did not see the site
serve it.

---

## 5. Sound: one decision worth inheriting

There is no sound library in this environment, so effects are synthesised in `sfx.py`. Two
beds shipped — typewriters under the newspaper office, a rotary-press rumble under the press
hall — mixed roughly 20 dB under the narration.

**The firecracker cue was cut, and the reason generalises.** Eight blind listening passes
were run on it, each on the bed alone so the narration could not mask it:

> dense volley → *"finger snapping in a rhythmic beat"* · more body → *"a mechanical
> typewriter"* · pitched → *"drumming"* · reverbed → *"shaking a spray paint can"* · deep
> boom → **"automatic gunfire"** · single spaced report → **"firing a gun"** · softened with
> sparkle → **"a gun being racked"**

A short loud unpitched impact simply **is** the sound of a gunshot, and no amount of sparkle
over it changes what the transient says. On a channel made for children that association is
not worth a background effect nobody asked to hear. The parade plays on its picture alone.
A licensed recording would drop straight in; synthesis is the wrong tool for that one cue.

Two lessons under that: a clean sine ring makes a click bed read as **music** (pitch plus a
regular pulse is a tune), and a fixed loop period makes a volley read as a **beat**. And
`amix` halves every input by default — `normalize=0`, or the voice quietly drops 6 dB.

---

## 6. Verify by listening and looking, never by assertion alone

The assertions catch what you thought to assert. Three checks caught what nobody would have:

- **Alignment** — cut a clip at each computed time and have it transcribed **blind**, then
  check whether the expected phrase *starts* the clip. Position matters, not presence: a
  phrase appearing three words in means you are early; absent while later words are present
  means late. A set-membership test scores those identical.
- **Sound** — describe a clip blind. "Upbeat instrumental background music" is how you learn
  your typewriters have pitch.
- **Stills** — `render.cjs --still 34@0.6`. Every visual fault in four review rounds was
  found by looking, not by a check.

**And know when the tool is lying.** Asked to identify near-silent clips, the model reported
a rooster and a birdsong in two windows that measure `-inf`. Fall back to levels for
presence, and use listening only for *identity*.

---

## 7. Moving it here

Episode one's pipeline is a second renderer, and `CLAUDE.md` says **one renderer per film**
for good reason. Do not merge the two blindly. Suggested shape:

1. `films/bb-before-the-bee/` — `scenes.js`, the script, `timing.json`, `words.json`,
   `released.json`. Plates and sprites under `plates/` as the other films do.
2. `pipeline/align.py`, `pipeline/verify-align.py`, `pipeline/sfx.py` — these are
   general-purpose and every future documentary wants them.
3. Keep `film/render.cjs` distinct from `pipeline/film.js` until a second documentary exists.
   Two films is not a pipeline; the rig-primitive-per-film discipline in `CLAUDE.md` applies
   here too, and the primitive episode one contributed is **cue timing**.
4. `build/` is still never committed — intermediates are reproducible and worthless in
   history. **But the finished master now does go in git, by owner override.** See below.

### The master storage rule — CHANGED, read this

`CLAUDE.md` says *"a finished film never goes in git"* and that rule is now **overridden by
the owner for Bizzing Bee masters.** The reasoning behind the original rule was sound and
still applies to intermediates: git stores binaries whole, per version, forever, and the app
repo reached 3.4 GB learning that. What changed is the alternative — there is no external
video store attached to these sessions, `bizzingbee.com` is unreachable from the container,
and a master that lives only in an ephemeral container is a master that is gone when the
container is reclaimed. Between "in git" and "lost", the owner chose git.

**How to store one.** GitHub hard-refuses any blob over 100 MiB, so the master ships as a
byte-split, not as a video:

```bash
# split — N chosen so each part lands under ~90 MB
split -n 4 -d master.mp4 dist/ep1.part
sha256sum master.mp4 > dist/ep1.sha256

# rejoin — the parts are raw byte ranges, order matters
cat dist/ep1.part0* > master.mp4
sha256sum -c dist/ep1.sha256          # MUST pass before you trust the rejoin
```

Four rules that go with it, all of which cost something to learn:

- **Verify the round-trip before pushing, not after.** Split, rejoin into a scratch file,
  compare sha256 against the original. A part uploaded from an unverified split is a
  corrupt master nobody discovers until someone tries to watch it.
- **`split -n 4` is a byte split, not a video split.** No part is independently playable and
  that is fine. Do not "helpfully" cut the film into four playable segments instead — that
  re-encodes, and re-encoding a delivered master loses a generation for nothing.
- **One master per episode in history, not one per revision.** Push the final cut. If a
  re-cut is needed, replace the parts in a single commit; do not accumulate v1/v2/v3, which
  is precisely how the app repo grew 1.63 GB of unreachable blobs.
- **Delete the parts from the app repo.** Episode one's split briefly lived in
  `bizzing-bee:video/dist/*.bin`. That was a staging step, not a home.

`publish.sh` still publishes the 720p preview and `released.json` still records what
shipped; the master sitting beside them is an archive copy, not the deliverable.

The **cast** convention transfers directly: the Bizzing Bee champions are already app
avatars (`bolden`, `neuhauser`, `pbell`, `lucas`, `brobinson`, `stover`) in the
`champions` pack, generated by `spellbound-app/champions-pack.py`. Reach them through
`sources.js` — **never vendor a copy**, because a copy is a fork and a fork drifts. Episode
one currently copies six webp into `video/images/av/`, which is exactly the shortcut that
rule forbids; fixing it is part of the move.

---

## 8. Episode one: what it is, and what is still open

*Before the Bee: 1908, 1925, and the First Four Champions* — 8:31, 124 shots, 1920×1080/24.

Two factual warnings live in the script header and must survive any edit:

- The first **national** spelling bee was **29 June 1908**, NEA, Hippodrome Theater,
  Cleveland; Marie C. Bolden won. **1925 is the first of the *continuous* series** that
  became Scripps. That is a different claim and must be worded as such every single time.
- The 1928 champion **Betty Robinson of South Bend is not** Betty Robinson the Olympic
  sprinter. Sources conflate them.

**Known defect, needs a re-record to fix properly.** The narration says Edna Stover *"puts a
Y where the second I belongs"*. GLADIOLUS contains exactly one I, so "second" is wrong in the
script and the recording is locked. The screen shows **GLADYOLUS** — the Y in the I's place,
which is what a child hearing "glad-ee-OH-lus" writes. Re-record that line and the film
re-times itself.

**Assets:** 32 Gemini plates (`gemini-3-pro-image`, 2K), 6 keyed sprites, 8 public-domain
archive photographs (LoC / Smithsonian — check each rights statement; **Scripps' own archive
is not free to use**), 7 champion avatars. Voice is Gemini TTS, and the style prompt must
name the pace and forbid the failure mode: "unhurried" was taken literally and produced 7.0s
for an eleven-word line.

**Still open:** two LoC images are only 640×496 and soft at 1080p — re-download larger JPEGs.
The description (`EP1-DESCRIPTION.txt`) carries the AI-generation disclosure and chapter
markers; the on-screen disclosure card was removed deliberately, because that disclosure
belongs in the description and in YouTube's altered-content field at upload. Publishing
remains a human action.

---

## 9. Your first session: a runbook

Do these in order. Steps 1–3 are cheap and everything after depends on them.

**1. Confirm you have both repos.** `git ls-remote` against `aayuvis/bizzing-bee` and
`aayuvis/Bizzing-Videos`. If either fails, stop and ask — do not start work you cannot
commit. (The MCP `add_repo` tool may return "requires approval" while plain `git clone`
through the session proxy works; try the clone before reporting a repo unreachable.)

**2. Check the API key.** `/root/.gkey`, mode 600, `GKEY_FILE` overrides. It is the newer
`AQ.`-prefixed format and goes in the `x-goog-api-key` header. Models that work:
`gemini-3-pro-image` for 2K plates, `gemini-3.6-flash` for transcription and blind
listening, `gemini-2.5-pro-preview-tts` for narration. **`gemini-2.5-flash` returns 404 for
new users** — it will tell you to move to `gemini-3.6-flash`; believe it.

**3. Check egress before planning around a download.** `github.com` and
`generativelanguage.googleapis.com` answer. `huggingface.co` 403s, `openaipublic` returns
000, and `bizzingbee.com` is unreachable. This is a policy decision, not a transient
failure: do not retry it, and do not build a plan whose critical path is a model download
from Hugging Face. That constraint is why §2's alignment is silence-based rather than ASR —
and the silence-based method turned out to be good enough, so treat the constraint as a
design input rather than a loss.

**4. Move the pipeline** per §7. Verify by re-rendering three shots of episode one — a
plate, a typographic card and the GLADIOLUS spell — and diffing them against the shipped
master's frames at the same timecodes. If cue timing survives the move, everything else has.

**5. Only then start episode two.** Write the script, get the narration, run `align.py`,
and build the scene graph against `words.json`. Never author a shot list against guessed
timestamps — §2 is the whole reason this document exists.

### Rendering: what it actually costs

124 shots at 1920×1080/24 is **about an hour on four workers**, which is what the container
gives you. Some concrete numbers to plan against:

- `node render.cjs --all --resume --slice K/4`, four processes, one per core. ~2.3
  shots/minute aggregate.
- `--resume` is what makes an eight-hour review cycle survivable: fix six shots, re-render
  six shots. Which is also why **`Math.random()` is banned** anywhere in shot rendering —
  a resumed shot must be byte-identical to the one it replaces, so all randomness comes
  from the seeded `rng(seed)`.
- Assemble and encode add roughly ten minutes on top.
- Kick the render into the background and keep working. Do not sit and poll it.

### Things the owner will ask for, based on five review rounds

Review notes arrive as a list of timecodes. They are almost always right, and they cluster:

- **Timing** — "the shot appears before the voice says it." This is the note that produced
  §2. If you get it after building cue timing, a cue phrase is matching the wrong instance.
- **Continuity of real people** — "the father mailman should be black." A documentary about
  a Black child in 1908 has to hold that continuity across every generated plate, and the
  model will not hold it for you. Check every plate against who is in the scene.
- **Motion** — "add dynamics", "the carts could be moving." The answer is SVG elements
  animated over a still plate, inside the Ken Burns wrapper so the move carries them. Not
  video generation.
- **Faces** — "the women have no face, it looks awkward." Generated crowds at distance
  come back faceless. Compose them turned away, or use an avatar.
- **Scale** — avatars sized by eye land wrong more often than not. Size against the shot,
  and check the source resolution: a 384px avatar at ~32% opaque needs to be drawn near
  560px before it reads.
- **Anything a child should not see.** Smoking in a 1920s newsroom is period-accurate and
  came out anyway. Re-generate; do not argue the history.

And one note that is *not* a defect: when CENTRE becomes CENTER the letters **transpose**.
Nothing is added, nothing is lost, and marking a letter red as an error is wrong. It took a
round to see that.

---

## Note on where this file lives

This is a **copy**. The canonical home is `aayuvis/Bizzing-Videos` at
`docs/03-bizzing-bee-documentaries.md`, committed there on branch
`claude/youtube-videos-migration-cnlvns`. It is duplicated here only because the session
that wrote it had read access to that repo but not push access — the git proxy refuses to
inject a credential for a repo that is not one of the session's sources, and a document
that exists only in an ephemeral container is a document that is already lost.

If you are reading this copy and the two have diverged, the Bizzing-Videos one wins.
Delete this file once the original is pushed.
