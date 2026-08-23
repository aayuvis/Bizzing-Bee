# Making a Bizzing Bee film — the process, end to end

_Written after episode one shipped and episode two's voice track was finished. Everything
here is either measured from a file in this directory or was paid for with a review round._

---

## 0. What this covers, and what it does not

There are four documents in `video/` and they do not overlap. Read this one first.

| Document | What it is for |
|---|---|
| **this file** | The **process**: the order of work, how a script is written and why they fail, the voice pipeline, and how each stage is verified. |
| `15-video-production-brief.md` | The **picture**: sprites, plates, HTML/CSS shots, anchors, depth, character drift. |
| `HANDOVER-DOCUMENTARIES.md` | Episode one's **film pipeline** as built, plus its runbook and open items. |
| `RENDER-VO.md` | Episode one's **single-voice** VO. Superseded for new work by §3 below. |

If you only take one thing: **the audio is the clock, and the script is where the film is won
or lost.** Everything downstream is craft. Nothing downstream rescues a bad script.

---

## 1. The order of work, and why it is that order

    MESSAGE  →  HOOKS  →  SCRIPT  →  VOICE  →  BLIND LISTEN  →  PICTURE  →  ASSEMBLE  →  SHIP
    ↑                                  ↑                          ↑
    cheap to change              hours to change            days to change

Cost of change rises by roughly an order of magnitude at each arrow. Episode two was written
three times because the first two attempts started at SCRIPT and skipped MESSAGE.

**Do not start writing until the message is one sentence.** Not a theme, not a topic — one
declarative sentence that every beat proves. Episode two's is:

> **Somebody reaches for a word, and afterwards the world is different.**

Write it at the top of the script file, under a `## WHAT THIS FILM IS ABOUT` heading, before
any prose. It is the thing you delete beats against.

---

## 2. Stage one — the script

This is the only stage that decides whether the film is good. Budget accordingly.

### 2.1 The failure mode is always the same: too many messages

Three drafts of episode two are on disk. They are kept deliberately — they are the evidence.

| File | Narration words | Why it failed |
|---|---|---|
| `ep-nobody-born-good-with-words.md` | 1,418 | Lessons were the spine and people were the illustrations. Backwards. |
| `ep-four-letters-on-a-plank.md` | 1,512 | Two subjects welded together; still four separate points. |
| **`ep-the-right-word.md`** | **982** | **Accepted.** One message, four stories, nothing else. |

_(Narration words only — the count `prep2.py` produces, and the only one that drives runtime.
Whole-file counts are larger and meaningless, since the accepted draft carries a long
"what was cut" section that is never spoken.)_

The fix that finally worked was **deleting whole beats, not rephrasing them**. Rephrasing
passes bought 71 words, then 53, then 12. Cutting Frederick Douglass, the
English-is-three-languages act and five one-line quotations took the script from 1,512
narration words to 982 — a 530-word cut that three rounds of rewriting could not find.

Every draft keeps a `### What was cut, and why` section. It stops the same idea being
re-proposed next episode, and it names the cut material as *future episodes* rather than
failures — Douglass is a film of his own, and it should have no app pitch anywhere in it.

### 2.2 Structure: escalate, do not enumerate

Four stories that each prove the same thing, arranged so each is larger than the last:

    a thing  →  a life  →  a country  →  what a war meant
    Čapek       Hamilton    Nehru         Lincoln
    1920        1772        1947          1863

Chronology is not the axis. **Stakes** are. A list of equally-sized examples reads as a
listicle; the same examples ordered by consequence read as an argument.

### 2.3 The narrator must never describe the film

Five separate lines in one draft had the narrator commenting on the documentary itself —
"that's the smallest story in this film", "we'll come back to that". All five were cut.

A narrator who describes the film breaks the spell twice: it admits there is a film, and it
tells the viewer how to feel about a beat instead of letting the beat do it. Search each
draft for `this film`, `this episode`, `we'll`, `as we`, `earlier` before recording.

### 2.4 Tonal collision is the trap that is hard to see

The strongest single diagnosis of the episode-two failures: forty seconds after a boy
wishes himself an animal, a narrator says "which is what a spelling bee is for". Nothing is
wrong with either sentence. Together they are grotesque.

**Test:** read the last line of a heavy beat immediately followed by the first line of the
next. If the join would embarrass you in a room, the beat does not belong in this film.

### 2.5 Length is measured, not guessed — and this is currently wrong

Runtime = `narration words ÷ wall rate`. Wall rate is words per minute **including** the
silence between cues, which is the only rate that predicts a finished track.

Measured from the files in this directory:

| | Words | Track | Speech rate | **Wall rate** |
|---|---|---|---|---|
| Episode 1 (`vo/…despina.mp3`) | 1,272 | 8:22.8 | — | **152 wpm** |
| Episode 2 (`vo2/ep2-vo.wav`) | 982 | 6:00.7 | 171 wpm | **163 wpm** |

The rates differ because episode one rendered a whole section per API call and episode two
renders a paragraph per call; the shorter requests come back faster-paced. Plausible, not
proven — but the practical rule is: **use the rate the last comparable render measured, and
re-measure after every render.**

> ### ⚠ Two live defects, both about runtime drift
>
> 1. **`ep-the-right-word.md` says `Runtime target: ~8:00`. The rendered track is 6:00.7.**
>    The header was written for a longer draft and never updated when 530 words were cut.
>    Nothing checks it, so nothing caught it.
> 2. **`prep2.py` estimates runtime at a hardcoded 152 wpm** (`~{words/152:.1f} min`), which
>    is episode one's rate. On episode two it predicts 6.5 min against an actual 6.0 — off
>    by 8%, and it will drift further as the pipeline changes.
>
> Fix both by deriving the header from the render rather than typing it. Until then, treat
> any runtime written in a script header as a wish.

### 2.6 Before recording: rights and facts

Every script carries `## RIGHTS` and `## THE FACTS (check before recording)`. Fill them in
before a single cue is rendered, because a fact corrected after the voice is cut costs a
re-render and a re-cut.

---

## 3. Stage two — the voice

`prep2.py` → `cues2.json` → `render_vo2.py` → `vo2/cue###.wav` → `vo2/ep2-vo.wav`

### 3.1 The unit is a CUE, not a section

A cue is one paragraph of narration, or one character's line. Episode one rendered a whole
section per call, so one fluffed sentence cost the whole section. A paragraph is the
smallest unit that still carries its own intonation.

`python3 render_vo2.py 12 41` re-renders exactly those two cues and reassembles. That is the
whole reason for the design.

### 3.2 Who speaks is marked in the script, and nowhere else

A line beginning `**SPEAKER:**` is a character cue. Everything else is the narrator. There
is deliberately **no second list** of who-says-what, because a second list drifts out of step
with the script it describes.

`prep2.py` exits non-zero if a `**SPEAKER:**` has no entry in `CAST`.

### 3.3 The style prompt does the acting, not the voice

Gemini TTS takes the direction as a prompt **prepended to the line**. The voice name only
sets timbre. Nearly all the character lives in the style text, and each entry names three
things: **the person, the room, and the feeling** — then forbids the failure mode that voice
is prone to.

```python
'JOSEF ČAPEK': dict(voice='Algenib', pad=(0.35, 0.60), style=(
   "You are a Czech painter in 1920, absorbed in your painting, not looking up, muttering a "
   "single word over your shoulder because your brother asked you a question. Light, "
   "offhand, barely interested — you are already back at work. Do NOT announce it, do NOT be "
   "grave, do NOT be deep, do NOT be dramatic. It is a shrug, not a revelation.")),
```

The `Do NOT` clauses are not padding. Without them the model plays everything as significant,
because significance is the default register for historical quotation.

**The narrator's direction is byte-identical to episode one's and must stay that way.** The
voice was chosen on that exact text in a twenty-voice audition; changing a word is a silent
re-audition.

### 3.4 Guest voices: use far fewer than you want

Episode two was briefed with eight voices and shipped with **two** — the narrator and Nehru.
The `CAST` table still holds seven entries and `prep2.py` prints the unused ones; that is
intentional, they are ready if a later script needs them.

The reason is the owner's, and it was right: switching voices constantly is exhausting and
makes the film feel like a radio play. **One guest voice, at the moment that most deserves
it** — an Indian voice for the minute India speaks — lands harder than seven.

A character line must be rendered with `Say exactly this line, word for word, and nothing
else:` prepended. Without it the model paraphrases quietly and plausibly. The narrator does
*not* get this instruction — it reads as stilted over long prose.

### 3.5 Text is preprocessed, never fed in raw

Four rules in `spoken()`, all learned by hearing them go wrong:

| Rule | Why |
|---|---|
| Years → words (`1863` → "eighteen sixty-three") | Otherwise read as a cardinal number. **`prep2.py` exits non-zero on any 3–4 digit number not in `YEARS`.** |
| `G–L–A–D–I–O–L–U–S` → `G. L. A. D. …` | Em-dashes are read as pauses inside one mangled word — fatal in a film about spelling. |
| `PHON` respellings (`Martin` → `Mar-tin`) | The model said "Marni". Add to the table rather than re-rolling and hoping. |
| `EMPH` capitals (`Tell THEM about`) | The model *substituted* "him" for "them" three times across two voices. Capitals read as emphasis and fixed it. |

And `clean()` strips notation **as whole lines, before** the emphasis markers come off. Strip
markdown first and `**[BIZZING BEE CARD]**` survives as a plausible one-word paragraph, and
the narrator says "BIZZING BEE CARD" out loud in the finished film.

### 3.6 Two mechanical traps

**The API returns raw PCM, not a container.** `audio/L16;codec=pcm;rate=24000`, base64 in
`inlineData`. Write the 44-byte WAV header yourself (`wav_bytes()`) or every player rejects
the file.

**Pads are a MAX, not a sum.** Each cue carries `pad=(before, after)`. The gap between two
cues is `max(base, prev.pad[1], next.pad[0])`. Both pads describe *the same silence* from
either side; adding them double-counts every join and puts a dead half-second into the film.

### 3.7 Find ffmpeg by capability, not by path

A hardcoded path cost 64 rendered cues and a dead assembly step after a container rebuild.
Worse, **Playwright ships an ffmpeg** at `/opt/pw-browsers/…/ffmpeg-linux` that exists and is
useless — built without the concat demuxer, `loudnorm`, `anullsrc` and `aresample`.

So `_ffmpeg()` probes each candidate for a filter we actually use:

```python
if b'loudnorm' in sp.run([c, '-hide_banner', '-filters'], capture_output=True).stdout:
    return c
```

Test for the capability, never for the file.

---

## 4. Stage three — verify by listening, blind

`python3 verify_voices.py`

**Nobody in this pipeline can hear.** So each rendered cue is played to a listening model
that is told *nothing* about who it is meant to be, and asked to report gender, age, accent,
tone and the words actually said. That is then compared against the casting table.

**The blindness is the whole method.** Ask "does this sound like Nehru?" and the model agrees,
because that is what models do. Ask "what accent is this?" and the answer is worth something.

This is the single most reusable idea in the pipeline. It caught four defects invisible to
the person who wrote the lines:

- `Umbriel` cast as a male voice read unmistakably **female** — and the check passed it,
  because `'male' in 'female'` is `True` in Python. Now an exact word match on
  `re.findall(r'[a-z]+', g)`.
- **"Tell HIM about the dream"** for "Tell THEM" — three times, across two voices. Changes
  who Mahalia Jackson was pointing at.
- **"Marni"** for "Martin".
- Stephen King and Josef Čapek both delivered **solemn and grave** — two lines whose entire
  job is to be thrown away. Gender and accent were correct, so an earlier version of the
  check waved them through. *A voice can be cast correctly and acted wrongly*, which is why
  `EXPECT` has a forbidden-tone column.

### What is trustworthy, and what is not

| Field | Reliability | Treatment |
|---|---|---|
| Gender, accent, words said | Stable across every re-run | **Hard failure** |
| Tone | **Not deterministic** — the same unchanged file came back "serious, solemn" then "serious, matter-of-fact" | Probed 3×, needs 2 hits, and is only a **warning** |

**Measure the level from the file before asking the model anything.** A listening model will
confabulate over near-silence — episode one had one report a rooster and birdsong in windows
measuring `-inf dBFS`. `verify_voices.py` fails a cue on `peak < -45 dBFS` without spending an
API call.

### Two spellings of one word produce neither

The text said `Robota` and the style direction said `ROBB-oh-tah`. The model rendered
"Robotka" and "Rogotha". **Removing the pronunciation hint fixed it on the first try.** Give
the model one spelling; if it is wrong, change the spelling in `PHON`, do not add a second
one alongside.

---

## 5. Stage four — the picture

Covered in full by `15-video-production-brief.md`. Only the interface matters here:

**Shots carry a cue phrase, not a timestamp.** A shot names a phrase the narrator says, and
`build()` resolves it against `words.json` to get a real time. Re-render the voice and the
picture follows; type a timestamp and it rots the moment a sentence changes.

There is deliberately **no re-timing step** at assembly. If a shot and its sentence disagree,
the fix belongs in `scenes.js`, not in a stretch filter.

---

## 6. Stage five — assemble and ship

`film/assemble.sh` → master + preview · `film/ship.sh` → `dist/` parts

Three assertions worth keeping, each of which caught a real defect:

**Count the shots against the scene graph before concatenating.** A worker that dies leaves
its slice missing, and `-c copy` joins the rest without complaint. That is how you ship a
film with a hole in it.

**Read the channel count back out of the finished file.** Mono AAC reads as *"no audio"* in
embedded players. `-ac 2 -ar 44100` on the encode, then:

```bash
ch=$("$FF" -i "$f" 2>&1 | sed -n 's/.*Audio: .*, \(mono\|stereo\).*/\1/p' | sed -n 1p)
[ "$ch" = stereo ] || { echo "FAIL: $(basename "$f") is ${ch:-missing audio}"; exit 1; }
```

This check correctly flagged the existing v2 master as mono, which is how we know it works.

**Verify the round trip before committing, not after.** GitHub hard-refuses blobs over
100 MiB, so the 351 MB master ships as four **byte ranges** — not four playable segments,
because cutting it into playable segments would re-encode and lose a generation for nothing.
`ship.sh` splits, rejoins, compares checksums, and only then writes `dist/`. A part uploaded
from an unverified split is a corrupt master nobody discovers until someone tries to watch it.

`dist/README.md` is written from the file's own measurements, so the stitch instructions
cannot describe a different number of parts than actually shipped.

### Storage

Renders are **not** in git — `vo/`, `vo2/`, shot mp4s and masters are all reproducible from
the scripts, and the repo rule is that a reproducible artifact is gitignored before its first
commit. Scripts, `cues2.json`, `words.json` and the pipeline code **are** in git.

---

## 7. Runbook

```bash
cd /home/user/Bizzing-Bee/video

# key for TTS + the listening model
export GKEY_FILE=/root/.gkey        # or put the key at that path

# 1. script -> cues.  Fails loudly on unknown years and uncast speakers.
python3 prep2.py

# 2. render.  Only what is missing; ~4 workers, the quota is per-model.
python3 render_vo2.py
python3 render_vo2.py --list        # what is on disk
python3 render_vo2.py 12 41         # re-render exactly these, then reassemble
python3 render_vo2.py --assemble    # assemble only

# 3. blind listening check on every character cue
python3 verify_voices.py            # exit 1 on a reproducible failure

# 4. picture
cd film && node render.cjs --all

# 5. master, then dist parts with a verified round trip
./assemble.sh
./ship.sh
```

**Cost and time:** rendering 52 cues on 4 workers takes roughly 6–8 minutes wall clock.
Re-rendering one cue takes seconds, which is the entire argument for cue-level granularity.

---

## 8. What is still open

1. **Runtime headers drift** (§2.5). `ep-the-right-word.md` claims ~8:00 against a measured
   6:00.7, and `prep2.py` estimates against a hardcoded 152 wpm. Derive both from the render.
2. **Episode two has no picture yet.** The voice track is finished and verified; `scenes.js`
   covers episode one only.
3. **Two Library of Congress images are 640×496** and go soft at 1080p. Named in
   `HANDOVER-DOCUMENTARIES.md`.
4. **`EP1-DESCRIPTION.txt` was corrected once already** — it claimed there were no generated
   portraits of real people, which stopped being true when champion avatars went into the
   film. Re-read it against the finished cut before publishing anything.
5. **The `CAST` table holds six unused voices.** Not a defect; `prep2.py` reports them so
   they do not rot silently.

---

## 9. The five rules, if you remember nothing else

1. **One message.** Write it as a sentence before you write prose, and delete beats against it.
2. **Delete beats, do not rephrase them.** Rephrasing bought 12 words; cutting bought 800.
3. **The audio is the clock.** Cue phrases, never timestamps. Measure runtime; do not type it.
4. **Verify blind.** Ask what it hears, never whether it matches. Measure the level first.
5. **Assert what a viewer would complain about** — a missing shot, silent audio, a corrupt
   download — and assert it against the finished file, not against the intent.
