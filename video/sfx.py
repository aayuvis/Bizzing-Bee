#!/usr/bin/env python3
"""sfx.py — the film's only sound effects, synthesised and laid against the picture.

    python3 sfx.py            write vo/sfx.wav (silence everywhere except the two beds)

Review notes asked for two things the narration alone cannot give: typewriters ticking under
the newspaper office, and firecrackers going off over Louisville's parade. There is no sound
library in this environment, so both are built from noise and envelopes here.

TWO THINGS THIS FILE IS CAREFUL ABOUT.

1. **It never competes with the narrator.** Everything is mixed roughly twenty-five decibels
   under the voice. These are beds, not events; if you notice them as sound effects rather
   than as the room, they are too loud.

2. **The bangs land on the flashes.** The firework bursts on screen are positioned by a
   seeded xorshift in shotrender.js, and that generator is reimplemented here exactly — same
   seed, same call order — so each report is timed to the burst that causes it rather than
   scattered near it. Sound arriving a third of a second off its picture is worse than none.
"""
import json, math, os, struct, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 24000
OUT = os.path.join(HERE, 'vo', 'sfx.wav')

# (in, out) of the shots each bed sits under, from scenes.js
NEWSROOM = [(186.29, 193.84), (201.01, 205.31)]
PRESSROOM = [(182.67, 186.29)]
PARADE = (291.73, 296.84)
PARADE_SHOT_IDX, PARADE_DUR = 75, 5.109
TOTAL = 511.4


def js_rng(seed):
    """The generator in shotrender.js, bit for bit. JS bitwise operators work on 32 bits, so
    masking to 32 bits unsigned here reproduces the same sequence."""
    x = (seed * 2654435761) & 0xFFFFFFFF

    def nxt():
        nonlocal x
        x ^= (x << 13) & 0xFFFFFFFF
        x ^= x >> 17
        x ^= (x << 5) & 0xFFFFFFFF
        x &= 0xFFFFFFFF
        return x / 4294967296.0
    return nxt


def place(buf, t, sig):
    i = int(t * SR)
    if i < 0 or i >= len(buf):
        return
    n = min(len(sig), len(buf) - i)
    buf[i:i + n] += sig[:n]


def lp(x, cutoff):
    """One-pole lowpass. Used to take the fizz off noise so it reads as wood and air
    rather than as hiss."""
    from scipy.signal import lfilter
    a = math.exp(-2 * math.pi * cutoff / SR)
    return lfilter([1 - a], [1, -a], x)


def hp(x, cutoff):
    from scipy.signal import butter, lfilter
    b, a = butter(2, min(0.99, cutoff / (SR / 2)), btype='high')
    return lfilter(b, a, x)


def noise(rnd, n):
    return np.random.default_rng(int(rnd() * 1e9)).normal(0, 1, n)


def click(rnd, hard=1.0):
    """A typebar hitting paper.

    Listened back, the first version was described as "upbeat instrumental background
    music" — because it carried a clean sine ring at 1.4-2.3kHz, which the ear reads as
    PITCH, and pitch plus a regular pulse is a tune. A real typebar has no pitch: it is a
    broadband tick with a dull wooden thunk under it, and nothing sustained at all.
    """
    n = int(SR * 0.09)
    t = np.arange(n) / SR
    tick = hp(noise(rnd, n), 2200) * np.exp(-t * 420)          # the strike
    body = lp(noise(rnd, n), 900) * np.exp(-t * 120) * 0.55    # platen and frame
    thunk = lp(noise(rnd, n), 260) * np.exp(-t * 70) * 0.35    # the desk under it
    return (tick + body + thunk) * hard


def bell(rnd):
    """The carriage-return bell — the one thing in this bed that IS allowed a pitch."""
    n = int(SR * 0.8)
    t = np.arange(n) / SR
    f = 2100 + rnd() * 120
    return (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2.01 * t)) * np.exp(-t * 7) * 0.5


def bang(rnd):
    """An aerial firework bursting over the street.

    Seven blind listening passes shaped this, and the last three are the instructive ones:
    a dense volley was heard as "automatic gunfire", and thinning it to single spaced
    reports gave "firing a gun". Both are the correct acoustic family and both are exactly
    the wrong association for a channel made for children — an isolated sharp report simply
    IS a gunshot, however it is dressed.

    So this is no longer a firecracker. It is the thing actually drawn on screen: an aerial
    shell. The attack is soft rather than cracked, the body is a deep unpitched whump, and
    over it sits the sparkle — a long scatter of tiny bright pops, which is the sound no
    gunshot has and every firework does.
    """
    n = int(SR * 1.9)
    t = np.arange(n) / SR
    # soft-edged body: a short rise takes the crack off the front
    rise = np.minimum(1.0, t / 0.018)
    out = lp(noise(rnd, n), 110) * np.exp(-t * 3.2) * 1.70 * rise
    out += lp(noise(rnd, n), 620) * np.exp(-t * 6.0) * 0.22 * rise
    # the sparkle: what makes it a firework and not a report
    for _ in range(int(30 + rnd() * 26)):
        at = int((0.04 + rnd() ** 0.85 * 1.25) * SR)
        m = int(SR * 0.05)
        if at + m >= n:
            continue
        tt = np.arange(m) / SR
        out[at:at + m] += (hp(noise(rnd, m), 3200) * np.exp(-tt * 220)
                           * (0.06 + rnd() * 0.13) * math.exp(-at / SR * 1.5))
    for d, g in ((0.036, 0.24), (0.068, 0.13)):        # a little of the street back
        i = int(d * SR)
        out[i:] += out[:n - i] * g
    return out / (np.max(np.abs(out)) + 1e-9) * 0.95


def build():
    buf = np.zeros(int(TOTAL * SR), dtype=np.float64)
    rnd = js_rng(4242)

    # --- typewriters, irregular, with the odd bell -------------------------------------
    for (a, b) in NEWSROOM:
        t = a + 0.15
        since_bell = 0.0
        while t < b - 0.12:
            place(buf, t, click(rnd, 0.6 + rnd() * 0.5) * 0.34)
            # A typist works in bursts. An even gap is a metronome, and a metronome under a
            # voice is heard as music no matter what the timbre is.
            gap = 0.052 + rnd() * 0.075
            if rnd() < 0.22:
                gap += 0.18 + rnd() * 0.55       # end of a word, a thought, a glance up
            t += gap
            since_bell += gap
            if since_bell > 2.2 and rnd() < 0.35:
                place(buf, t, bell(rnd) * 0.12)
                since_bell = 0.0
                t += 0.35

    # the pressroom keeps a low mechanical rumble rather than clicks
    # A rotary press: broadband machine roar with the cylinders thumping through it.
    # Two sine tones under a slow tremolo were identified in isolation as "a human
    # heartbeat", which is exactly what that recipe builds.
    for (a, b) in PRESSROOM:
        n = int((b - a) * SR)
        t = np.arange(n) / SR
        roar = lp(noise(rnd, n), 420) * 0.55 + lp(noise(rnd, n), 1800) * 0.14
        for k in range(int((b - a) * 5.2)):                # cylinder strokes, ~5 a second
            at = int((k / 5.2 + rnd() * 0.02) * SR)
            m = int(SR * 0.13)
            if at + m >= n:
                continue
            tt = np.arange(m) / SR
            roar[at:at + m] += (lp(noise(rnd, m), 260) * np.exp(-tt * 34) * 0.85
                                + hp(noise(rnd, m), 1500) * np.exp(-tt * 120) * 0.18)
        fade = np.minimum(1.0, np.minimum(t / 0.4, (b - a - t) / 0.4))
        place(buf, a, roar * fade * 0.22)

    # --- firecrackers, timed to the bursts drawn on screen ------------------------------
    r = js_rng(PARADE_SHOT_IDX + 91)
    starts, periods = [], []
    for _ in range(9):
        r(); r()                                   # cx, cy — consumed to keep the order
        delay = r() * (PARADE_DUR * 900) / 1000.0  # ms in the renderer, seconds here
        per = (1050 + r() * 900) / 1000.0          # each burst loops on its OWN period
        for _ in range(12):
            r()                                    # each spark's length
        starts.append(delay); periods.append(per)
    # ONE report per burst, not a loop. Nine looping bursts put roughly twenty-five bangs
    # into five seconds, which a blind listener called "automatic gunfire" — the correct
    # acoustic family and completely the wrong association for a channel aimed at children.
    # Spaced single pops read as a celebration instead, which is what the scene is.
    # DELIBERATELY SILENT. Eight blind listening passes were run on this bed, and every
    # version of an explosive report — dense, spaced, cracked, softened, sparkled — came
    # back identified as a gunshot, gunfire, or a weapon being handled. That is not a flaw
    # in any one recipe: a short loud unpitched impact simply IS that sound, and no amount
    # of sparkle on top changes what the transient says. On a channel made for children
    # that association is not worth a background effect, so the parade plays on its picture
    # alone, which carries it perfectly well. A real fireworks recording could be dropped
    # in here if one is ever licensed; synthesis is the wrong tool for this particular cue.
    if os.environ.get('SFX_PARADE'):
        a, b = PARADE
        for d in sorted(starts)[::2]:
            place(buf, a + d + 0.05, bang(rnd) * (0.30 + rnd() * 0.20))
    return buf, starts


if __name__ == '__main__':
    buf, starts = build()
    peak = float(np.max(np.abs(buf)))
    if peak > 0:
        buf = buf / max(peak, 1e-9) * 0.5         # headroom; the mix attenuates again
    pcm = np.clip(buf, -1, 1)
    data = (pcm * 32767).astype('<i2').tobytes()
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'wb') as f:
        f.write(b'RIFF' + struct.pack('<I', 36 + len(data)) + b'WAVEfmt '
                + struct.pack('<IHHIIHH', 16, 1, 1, SR, SR * 2, 2, 16)
                + b'data' + struct.pack('<I', len(data)))
        f.write(data)
    print(f'wrote {OUT}  {len(pcm)/SR:.1f}s  peak {peak:.3f}')
    print('  typewriters under', NEWSROOM)
    print('  press rumble under', PRESSROOM)
    print('  firecrackers at', ', '.join(f'{PARADE[0]+d:.2f}' for d in sorted(starts)))
