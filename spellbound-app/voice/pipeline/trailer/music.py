#!/usr/bin/env python3
"""Upbeat royalty-free-by-construction chiptune bed for the trailer (~100s, 132 BPM).
Square-wave arps over a triangle bass and noise hats, C-major I-V-vi-IV, soft-clipped."""
import numpy as np, soundfile as sf

SR = 44100
BPM = 132
BEAT = 60/BPM              # 0.4545s
BAR = BEAT*4
N_BARS = 56                # ~101.8s
DUR = N_BARS*BAR
t_total = int(DUR*SR)

def note_hz(semi):          # semitones from C4
    return 261.63 * 2**(semi/12)

# chords (semitones from C4): C, G, Am, F
CHORDS = [[0,4,7],[7,11,14],[9,12,16],[5,9,12]]
BASS   = [0,7,9,5]          # roots

def env(n, a=0.008, r=0.10):
    e = np.ones(n)
    an, rn = int(a*SR), int(r*SR)
    if an: e[:an] = np.linspace(0,1,an)
    if rn and rn < n: e[-rn:] *= np.linspace(1,0,rn)
    return e

def square(f, dur, vol=0.16, duty=0.5):
    n = int(dur*SR); t = np.arange(n)/SR
    return vol*np.sign(np.sin(2*np.pi*f*t) - np.cos(np.pi*duty))*env(n)

def tri(f, dur, vol=0.30):
    n = int(dur*SR); t = np.arange(n)/SR
    return vol*(2/np.pi)*np.arcsin(np.sin(2*np.pi*f*t))*env(n, r=0.18)

def hat(dur, vol=0.05):
    n = int(dur*SR)
    e = np.exp(-np.arange(n)/(0.02*SR))
    rng = np.random.default_rng(7)
    return vol*rng.uniform(-1,1,n)*e

def kick(dur, vol=0.5):
    n = int(dur*SR); t = np.arange(n)/SR
    f = 110*np.exp(-t*30)+45
    return vol*np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*9)

mix = np.zeros(t_total)
def put(x, at):
    i = int(at*SR); j = min(t_total, i+len(x))
    if i < t_total: mix[i:j] += x[:j-i]

rng = np.random.default_rng(3)
for bar in range(N_BARS):
    t0 = bar*BAR
    ch = CHORDS[bar % 4]; root = BASS[bar % 4]
    fade = min(1.0, bar/2)                     # 2-bar soft intro
    outro = 1.0 if bar < N_BARS-2 else max(0.0, (N_BARS-bar)/2)
    g = fade*outro
    # bass: root eighth notes, octave down
    for k in range(8):
        put(tri(note_hz(root-12), BEAT/2*0.92, 0.30*g), t0+k*BEAT/2)
    # arp: 16th-note square through the chord (up-down)
    seq = [0,1,2,1]*4
    for k in range(16):
        semi = ch[seq[k] % 3] + (12 if k % 8 >= 4 else 0)
        put(square(note_hz(semi), BEAT/4*0.9, 0.11*g), t0+k*BEAT/4)
    # lead: a sparse counter-melody every other bar
    if bar % 2 == 1:
        for k, semi in enumerate([ch[2]+12, ch[1]+12, ch[0]+12, ch[1]+12]):
            put(square(note_hz(semi), BEAT*0.8, 0.07*g, duty=0.3), t0+k*BEAT)
    # drums
    for k in range(4):
        put(kick(0.14, 0.40*g), t0+k*BEAT)
    for k in range(8):
        put(hat(0.06, (0.055 if k % 2 else 0.035)*g), t0+k*BEAT/2)

# final resolve chord
for semi in [0,4,7,12]:
    put(square(note_hz(semi), 2.2, 0.10), DUR-2.4)
put(tri(note_hz(-12), 2.2, 0.28), DUR-2.4)

mix = np.tanh(mix*1.15)*0.85          # soft clip + headroom
sf.write('/tmp/vid/music.wav', mix, SR)
print('music.wav', round(DUR,1), 's')
