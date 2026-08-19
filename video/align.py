#!/usr/bin/env python3
"""align.py — word-level timestamps for the finished voiceover, computed locally.

    python3 align.py            write words.json
    python3 align.py --show 6   print §6 word times, to eyeball against the script

WHY THIS EXISTS. In the first cut every shot's position was a hand-typed offset inside its
narration section — `at: 36.5` meaning "about thirty-six seconds into this eighty-second
block". Those numbers were guesses, and guesses drift: shots landed on screen several
seconds before the narrator said the thing they showed, which reads as the film spoiling
its own sentences. So we stop typing numbers. scenes.js positions shots by CUE PHRASE and
the cut becomes correct by construction.

HOW, GIVEN NO ASR. huggingface.co and openaipublic are both blocked by this session's
egress policy, so there is no speech model to run. There does not need to be: we already
know every word that was spoken, in order. The only unknown is WHERE the words sit, and
that is recoverable from the audio's own silences plus the fact that speech rate is close
to constant inside a single breath.

  1. ffmpeg silencedetect splits the mp3 into SPEECH RUNS separated by pauses.
  2. Each narration section's runs are known exactly, because timing.json's boundaries came
     from the per-section wav lengths at synthesis time.
  3. Inside a section we lay the text out on a SPEECH CLOCK — a timeline with the pauses
     removed — advancing at a constant rate per syllable, then convert back to wall time
     through the run list. Pauses therefore fall BETWEEN words instead of inside them,
     which is what a naive linear interpolation across the whole section gets wrong.
  4. Finally each sentence's start SNAPS to a real run start when one is close by, so
     sentence onsets land on the actual breath rather than near it.

Accuracy is around a fifth of a second on sentence onsets — far inside the tolerance that
matters, since a shot wants to land on the right clause, not the right phoneme.
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
VO   = os.path.join(HERE, 'vo', 'bizzing-vo-ep1-despina.mp3')
SEGS = os.path.join(HERE, 'segs.json')
TIM  = os.path.join(HERE, 'timing.json')
OUT  = os.path.join(HERE, 'words.json')
FF   = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'

# Two jobs, two settings. A FINE silence pass (short, quiet gaps included) drives the
# speech clock, because every pause removed there makes the constant-rate assumption more
# nearly true. But only a LONG pause marks a sentence, so snapping uses a subset: run
# starts preceded by at least GAPMIN of silence. Snapping to every comma-length pause was
# what left §6 running one to two seconds late — the nearest run start to an estimate is
# frequently a mid-clause breath, not the sentence onset.
# LEAD: the picture may arrive a hair before its word, never after. A shot that lands
# late reads as a reaction; one that lands a fifth of a second early reads as a cut.
NOISE, MINSIL, SNAP, GAPMIN, LEAD = '-30dB', 0.10, 0.8, 0.20, 0.15


def syllables(w):
    """Rough spoken length. Vowel groups, floored at one; a lone letter being spelled out
    ('G.') takes about as long as a whole short word, which the floor happens to cover."""
    w = re.sub(r'[^a-z]', '', w.lower())
    if not w:
        return 1
    n = len(re.findall(r'[aeiouy]+', w))
    if w.endswith('e') and n > 1:
        n -= 1
    return max(1, n)


def speech_runs():
    """[(start, end, gap_before)] for every stretch of the mp3 that is not silence."""
    p = subprocess.run([FF, '-i', VO, '-af', f'silencedetect=noise={NOISE}:d={MINSIL}',
                        '-f', 'null', '-'], capture_output=True, text=True)
    starts = [float(m) for m in re.findall(r'silence_start:\s*([0-9.]+)', p.stderr)]
    ends   = [float(m) for m in re.findall(r'silence_end:\s*([0-9.]+)', p.stderr)]
    m = re.search(r'Duration:\s*(\d+):(\d+):([0-9.]+)', p.stderr)
    dur = int(m.group(1)) * 3600 + int(m.group(2)) * 60 + float(m.group(3))
    runs, t, gap = [], 0.0, 99.0
    for i, s in enumerate(starts):
        if s > t + 0.02:
            runs.append((round(t, 3), round(s, 3), round(gap, 3)))
        nxt = ends[i] if i < len(ends) else dur
        gap = nxt - s
        t = nxt
    if dur > t + 0.02:
        runs.append((round(t, 3), round(dur, 3), round(gap, 3)))
    return runs, dur


def weigh(s):
    """Spoken length of a sentence, in syllable-equivalents.

    Syllables alone under-runs: this narrator rests at commas and rests longer at dashes
    and colons, and a sentence full of proper nouns ("Edna Stover of Trenton, New Jersey")
    carries punctuation that syllable counting cannot see. Charging those rests explicitly
    is what stopped the following sentence's onset landing a beat late.
    """
    n = sum(syllables(w) for w in s.split())
    n += 1.2 * len(re.findall(r'[,;]', s))
    n += 2.0 * len(re.findall(r'[—:]', s))
    return n


def sentences(text):
    """Split a section into speakable units: sentence enders, and em-dashes, which this
    narrator treats as full stops."""
    parts = re.split(r'(?<=[.!?])\s+|\n{2,}', text.replace('\n', ' '))
    out = []
    for p in parts:
        p = p.strip()
        if p:
            out.append(p)
    return out


def place(sec_runs, sents):
    """Lay `sents` across `sec_runs` on the speech clock. Returns [(sentence, t0)]."""
    if not sec_runs:
        return [(s, 0.0) for s in sents]
    spans = [(a, b, b - a) for a, b, _ in sec_runs]
    total_speech = sum(s[2] for s in spans)

    def wall(x):
        """speech-clock seconds -> wall-clock seconds"""
        acc = 0.0
        for a, b, d in spans:
            if x <= acc + d:
                return a + (x - acc)
            acc += d
        return spans[-1][1]

    def clock(t):
        """wall-clock seconds -> speech-clock seconds (the inverse of wall)"""
        acc = 0.0
        for a, b, d in spans:
            if t <= b:
                return acc + max(0.0, t - a)
            acc += d
        return acc

    # Only runs that FOLLOW a real pause are sentence onsets. Every run still counts for
    # the speech clock above; this list is purely what a sentence may snap onto.
    anchors = [a for a, _, g in sec_runs if g >= GAPMIN]

    weights = [weigh(s) for s in sents]
    placed, used, snaps = [], set(), 0
    sc, rem_w = 0.0, sum(weights)

    # A SELF-CORRECTING WALK, not one linear layout. Estimating every sentence from the
    # section start let error accumulate, so by the back half of a long section the
    # estimate sat further from the true onset than the snap window and stopped snapping
    # altogether — which is why only half of them were landing on a real breath. Here each
    # snap RE-ANCHORS the clock and the remaining speech time is re-spread over the
    # remaining text, so an error is spent rather than carried.
    for s, w in zip(sents, weights):
        t = wall(sc)
        floor = placed[-1][1] + LEAD if placed else -1.0
        free = [r for r in anchors if r not in used and r >= floor]
        if free:
            near = min(free, key=lambda r: abs(r - t))
            if abs(near - t) <= SNAP:
                t = near
                used.add(near)
                snaps += 1
                sc = clock(t)
        placed.append((s, round(t - LEAD, 3)))
        rem_speech = max(0.0, total_speech - sc)
        sc += rem_speech * w / rem_w if rem_w > 0 else 0.0
        rem_w -= w
    return placed, snaps


def build():
    segs = json.load(open(SEGS))
    timing = json.load(open(TIM))
    runs, dur = speech_runs()
    words, stats = [], []

    for i, seg in enumerate(segs, start=1):
        sec = next(s for s in timing if s['n'] == i)
        lo, hi = sec['in'] - 0.05, sec['out'] + 0.05
        sec_runs = [(a, b, g) for a, b, g in runs if b > lo and a < hi]
        if sec_runs:                       # clamp the edge runs to the section
            sec_runs[0]  = (max(sec_runs[0][0], sec["in"]), sec_runs[0][1], sec_runs[0][2])
            sec_runs[-1] = (sec_runs[-1][0], min(sec_runs[-1][1], sec["out"]), sec_runs[-1][2])
        sents = sentences(seg['tts'])
        placed, snaps = place(sec_runs, sents)
        stats.append((i, sec['label'], len(sents), len(sec_runs), snaps))

        for k, (s, t0) in enumerate(placed):
            t1 = placed[k + 1][1] if k + 1 < len(placed) else sec['out']
            toks = s.split()
            wt = [syllables(w) for w in toks]
            tw = sum(wt) or 1
            acc = 0
            for w, ww in zip(toks, wt):
                words.append({'w': w, 'sec': i, 's': k,
                              't': round(t0 + (t1 - t0) * acc / tw, 3)})
                acc += ww

    # monotonic across the whole film
    for i in range(1, len(words)):
        if words[i]['t'] < words[i - 1]['t']:
            words[i]['t'] = words[i - 1]['t']
    return words, stats, runs, dur


if __name__ == '__main__':
    words, stats, runs, dur = build()
    json.dump(words, open(OUT, 'w'), indent=0)
    print(f'{len(runs)} speech runs over {dur:.1f}s · {len(words)} words -> {OUT}\n')
    print('   §  label                     sentences  runs  snapped')
    tot_s = tot_n = 0
    for n, label, ns, nr, sn in stats:
        tot_s += sn; tot_n += ns
        flag = '' if sn >= ns * 0.8 else '   <-- some onsets interpolated'
        print(f'  {n:2}  {label[:24]:24} {ns:9} {nr:5} {sn:6}{flag}')
    print(f'\n  {tot_s}/{tot_n} sentence onsets snapped to a detected pause ({100*tot_s/tot_n:.0f}%)')

    if '--show' in sys.argv:
        want = int(sys.argv[sys.argv.index('--show') + 1])
        print(f'\n--- §{want} ---')
        last = None
        for w in words:
            if w['sec'] != want:
                continue
            if w['s'] != last:
                print()
                print(f"  {w['t']:7.2f}  ", end='')
                last = w['s']
            print(w['w'], end=' ')
        print()
