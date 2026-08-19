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


def click(rnd, hard=1.0):
    """A typebar hitting paper: a very short noise transient with a little metal in it."""
    n = int(SR * 0.05)
    t = np.arange(n) / SR
    env = np.exp(-t * 190)
    body = np.random.default_rng(int(rnd() * 1e9)).normal(0, 1, n) * env
    ring = np.sin(2 * np.pi * (1400 + rnd() * 900) * t) * np.exp(-t * 260) * 0.35
    return (body * 0.7 + ring) * hard


def bell(rnd):
    """The carriage-return bell, sparingly."""
    n = int(SR * 0.8)
    t = np.arange(n) / SR
    f = 2100 + rnd() * 120
    return (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2.01 * t)) * np.exp(-t * 7) * 0.5


def bang(rnd):
    """A firecracker: broadband crack over a short low thump."""
    n = int(SR * 0.42)
    t = np.arange(n) / SR
    crack = np.random.default_rng(int(rnd() * 1e9)).normal(0, 1, n) * np.exp(-t * 46)
    thump = np.sin(2 * np.pi * (78 + rnd() * 40) * t) * np.exp(-t * 22) * 0.7
    return crack * 0.9 + thump


def build():
    buf = np.zeros(int(TOTAL * SR), dtype=np.float64)
    rnd = js_rng(4242)

    # --- typewriters, irregular, with the odd bell -------------------------------------
    for (a, b) in NEWSROOM:
        t = a + 0.15
        since_bell = 0.0
        while t < b - 0.12:
            place(buf, t, click(rnd, 0.6 + rnd() * 0.5) * 0.30)
            gap = 0.055 + rnd() * 0.20
            if rnd() < 0.10:
                gap += 0.25                      # a pause for thought
            t += gap
            since_bell += gap
            if since_bell > 2.2 and rnd() < 0.35:
                place(buf, t, bell(rnd) * 0.12)
                since_bell = 0.0
                t += 0.35

    # the pressroom keeps a low mechanical rumble rather than clicks
    for (a, b) in PRESSROOM:
        n = int((b - a) * SR)
        t = np.arange(n) / SR
        rum = (np.sin(2 * np.pi * 46 * t) * 0.5 + np.sin(2 * np.pi * 92.7 * t) * 0.25)
        rum *= (0.75 + 0.25 * np.sin(2 * np.pi * 5.5 * t))
        fade = np.minimum(1.0, np.minimum(t / 0.4, (b - a - t) / 0.4))
        place(buf, a, rum * fade * 0.05)

    # --- firecrackers, timed to the bursts drawn on screen ------------------------------
    r = js_rng(PARADE_SHOT_IDX + 91)
    starts = []
    for _ in range(9):
        r(); r()                                  # cx, cy — consumed to keep the order
        delay = r() * (PARADE_DUR * 900) / 1000.0  # ms in the renderer, seconds here
        for _ in range(12):
            r()                                   # each spark's length
        starts.append(delay)
    a, b = PARADE
    for d in starts:
        t = d
        while t < (b - a) - 0.15:                 # the burst animation loops every 1.25s
            place(buf, a + t + 0.06, bang(rnd) * (0.16 + rnd() * 0.12))
            t += 1.25
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
