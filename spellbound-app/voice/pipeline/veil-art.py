#!/usr/bin/env python3
"""Bake a page's paper veil INTO its background plate.

Why this exists. The poetry companion's threshold page and its margin pages put
type over a full-bleed plate, veiled by a translucent paper scrim. On screen
that is right. In a PDF it is not reliably right: the scrim leaves Chromium as
a shading pattern with a soft mask, and consumers disagree about compositing it
— Ghostscript 10.02.1 drops it outright, and it came back dark in a reader too.
The pages printed with the artwork at full strength under the text.

A translucent overlay is the wrong tool when the output has to survive an
unknown renderer. The veil is a fixed, known blend, so it can be done once at
build time and shipped as an OPAQUE image. No alpha, no shading, no soft mask,
nothing left for a rasteriser to get wrong: what the browser shows and what the
PDF prints are the same pixels.

Ramps mirror the CSS they replace, top to bottom, as (stop, paper_fraction).
"""
import sys, os
from PIL import Image

ART = os.path.join(os.path.dirname(__file__), '..', '..', 'books', 'art')
PAPER = (243, 239, 255)          # --paper #f3efff

RAMPS = {
    'marg': [(0.00, .93), (0.45, .87), (0.75, .80), (1.00, .76)],
    'open': [(0.00, .72), (0.34, .90), (0.66, .90), (1.00, .74)],
}

def paper_at(y, ramp):
    for i in range(len(ramp) - 1):
        (a, av), (b, bv) = ramp[i], ramp[i + 1]
        if a <= y <= b:
            t = 0 if b == a else (y - a) / (b - a)
            return av + (bv - av) * t
    return ramp[-1][1]

def veil(slug, kind):
    src = None
    for ext in ('jpg', 'png'):
        p = os.path.join(ART, f'{slug}.{ext}')
        if os.path.exists(p): src = p; break
    if not src:
        print(f'MISSING {slug}'); return False
    im = Image.open(src).convert('RGB')
    w, h = im.size
    px = im.load()
    ramp = RAMPS[kind]
    for y in range(h):
        f = paper_at(y / max(1, h - 1), ramp)
        for x in range(w):
            r, g, b = px[x, y]
            px[x, y] = (int(r + (PAPER[0] - r) * f),
                        int(g + (PAPER[1] - g) * f),
                        int(b + (PAPER[2] - b) * f))
    out = os.path.join(ART, f'{slug}-veil.jpg')
    im.save(out, 'JPEG', quality=82, optimize=True)
    print(f'OK {slug}-veil.jpg  {os.path.getsize(out)//1024}KB')
    return True

if __name__ == '__main__':
    args = sys.argv[1:]
    if not args:
        print('usage: veil-art.py <marg|open> <slug> [slug...]'); sys.exit(1)
    kind, slugs = args[0], args[1:]
    for s in slugs: veil(s, kind)
