#!/usr/bin/env python3
"""Bake a page's CSS image effects into the plate, and ship it plain.

WHY. Any CSS effect on an image — opacity, filter, transform — makes Chromium
rasterise that image into the PDF at full page size and throw the JPEG away. The
poetry companion puts a full-page ground behind every poem at `opacity:.42;
filter:saturate(.88)`, 130 of them, and its PDF came out at 143MB. With the
effects removed and the same pictures embedded as JPEGs it is 30MB. Same
pixels, a fifth of the file.

It is the same lesson as the scrim that would not composite in print: an effect
the browser computes at paint time is an effect an unknown rasteriser may
compute differently, or expensively, or not at all. Where the effect is fixed
and known, do it once here and serve an ordinary opaque image.

MODES
  ground <a> <sat>   composite over paper at alpha a, saturation sat  (.pm-ground)
  veil   <ramp>      vertical paper ramp: marg | open                 (.lb-*-art)
  dark   scrim       the divider's dark ramp, so white type reads      (.sc-scrim)
  crop   <factor>    centre-crop, replacing transform:scale(f)        (.sc-art)

--max N caps the long edge; a plate seen through 58% paper does not need the
resolution of one seen at full strength.
"""
import sys, os
from PIL import Image, ImageEnhance

ART = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'books', 'art')
PAPER = (243, 239, 255)          # --paper #f3efff

RAMPS = {'marg': [(0.00, .93), (0.45, .87), (0.75, .80), (1.00, .76)],
         'open': [(0.00, .72), (0.34, .90), (0.66, .90), (1.00, .74)],
         # .sc-scrim — the dark ramp a part divider carries under its white title
         'scrim': [(0.00, .78), (0.26, .62), (0.52, .10), (0.66, .06), (1.00, .62)]}
INK = (16, 12, 26)               # the scrim colour on a divider

def _open(slug):
    for ext in ('jpg', 'png'):
        p = os.path.join(ART, f'{slug}.{ext}')
        if os.path.exists(p):
            return p, Image.open(p).convert('RGB')
    return None, None

def _ramp_mask(size, ramp):
    """a vertical alpha ramp as an L-mask, built one row at a time"""
    w, h = size
    m = Image.new('L', (1, h))
    px = m.load()
    for y in range(h):
        t = y / max(1, h - 1)
        f = ramp[-1][1]
        for i in range(len(ramp) - 1):
            (a, av), (b, bv) = ramp[i], ramp[i + 1]
            if a <= t <= b:
                k = 0 if b == a else (t - a) / (b - a)
                f = av + (bv - av) * k
                break
        px[0, y] = int(round(f * 255))
    return m.resize((w, h))

def bake(slug, mode, arg1=None, arg2=None, maxw=None, out=None, q=80):
    src, im = _open(slug)
    if im is None:
        print(f'MISSING {slug}'); return 0, 0
    before = os.path.getsize(src)
    if mode == 'crop':
        f = float(arg1); w, h = im.size
        cw, ch = int(w / f), int(h / f)
        im = im.crop(((w - cw) // 2, (h - ch) // 2, (w - cw) // 2 + cw, (h - ch) // 2 + ch))
    else:
        if mode == 'ground':
            alpha, sat = float(arg1), float(arg2)
            if sat != 1.0:
                im = ImageEnhance.Color(im).enhance(sat)
            paper = Image.new('RGB', im.size, PAPER)
            im = Image.blend(paper, im, alpha)          # C-speed, not a python loop
        elif mode == 'veil':
            paper = Image.new('RGB', im.size, PAPER)
            im = Image.composite(paper, im, _ramp_mask(im.size, RAMPS[arg1]))
        elif mode == 'dark':
            ink = Image.new('RGB', im.size, INK)
            im = Image.composite(ink, im, _ramp_mask(im.size, RAMPS[arg1]))
    if maxw and im.size[0] > maxw:
        im = im.resize((maxw, round(im.size[1] * maxw / im.size[0])), Image.LANCZOS)
    dst = os.path.join(ART, f'{out or slug}.jpg')
    im.save(dst, 'JPEG', quality=q, optimize=True)
    after = os.path.getsize(dst)
    if src.endswith('.png') and os.path.exists(src) and dst != src:
        os.remove(src)
    return before, after

if __name__ == '__main__':
    a = sys.argv[1:]
    maxw = None; q = 80; suffix = None
    while '--max' in a: i = a.index('--max'); maxw = int(a[i+1]); del a[i:i+2]
    while '--q' in a:   i = a.index('--q');   q = int(a[i+1]);   del a[i:i+2]
    while '--suffix' in a: i = a.index('--suffix'); suffix = a[i+1]; del a[i:i+2]
    mode = a[0]
    nargs = {'ground': 2, 'veil': 1, 'crop': 1, 'dark': 1}[mode]
    args = a[1:1+nargs]; slugs = a[1+nargs:]
    tb = ta = 0
    for s in slugs:
        b, af = bake(s, mode, *(args + [None, None])[:2], maxw=maxw,
                     out=(s + suffix) if suffix else None, q=q)
        tb += b; ta += af
    print(f'{len(slugs)} plates: {tb/1048576:.1f}MB -> {ta/1048576:.1f}MB '
          f'({100*(tb-ta)/tb if tb else 0:.0f}% off)')
