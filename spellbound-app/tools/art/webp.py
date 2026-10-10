#!/usr/bin/env python3
"""App art is served as WebP (road to 4.5, P1.14 — "plates to WebP/AVIF, lazy below the fold").

The painted plates in app-art/ (the Atlas boards and their panoramas, the world banners, the Library tiles, the
game play-fields, the analogy maps, the landing's screenshots) came out of the pipeline scripts as JPEG. This turns
each into a WebP beside it and deletes the JPEG, so a plate has ONE served copy.

THE RULE (one place, so a regeneration cannot drift from it):
  quality 80, method 6 — the stage plates' own setting (tools/art/gen.py) — then a FIDELITY FLOOR: the WebP is
  decoded and compared with the JPEG it came from, and if the PSNR is under 35 dB the quality steps up by 5 (to
  90 at most) until it is not; and NEVER HEAVIER: a WebP that comes out larger than its JPEG steps the quality
  down by 5 (to 60 at least) for as long as the floor still holds. Dimensions never change, so no markup has to
  know anything but the extension. Measured over the 110 plates on 10 Oct 2026: 24.5 MB of JPEG -> ~15.5 MB of WebP, every plate at
  35.7 dB or better against its source.
  WHY NOT AVIF: it was measured too (q60: ~13.5 MB, another 13% off) and Chromium (85+) and current Safari both
  decode it — but Safari only from 16 (iOS 16), and iPads that stop at iOS 15 (iPad Air 2, iPad mini 4) are
  exactly the hand-me-down tablets children use. WebP (Safari 14+) is already what the avatars and the stage
  plates rely on, so it moves the support floor nowhere. Revisit when iOS 15 is gone from the field.
  NOT TOUCHED: avatars/ (their own documented rule: full-size WebP q=95, thumbs PNG), app-art/spines/*.png
  (160-colour palette art, ~14 KB each, sized by measured ratio), the SVG sprites (already WebP inside), and
  SOCIAL_CARDS below — a link preview is fetched by crawlers that do not all read WebP, so the og:image stays
  a JPEG (and is not referenced by the app itself).

The pipeline scripts (voice/pipeline/act-maps.py, saga-worlds.py, app-banners.py, atlas-art.py, analogy-maps.py,
qa/shots.cjs) still write JPEG: run this after any of them. tests/asset-budget.cjs fails on a JPEG plate left in
app-art/, so a forgotten conversion cannot ship.

Usage:  webp.py --dry              measure every JPEG in app-art/, write nothing
        webp.py --all              convert EVERY JPEG in app-art/ (says so first) and delete them
        webp.py app-art/x.jpg ...  convert just these
"""
import glob
import io
import math
import os
import sys
from PIL import Image, ImageChops, ImageStat

APP = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
ART = os.path.join(APP, 'app-art')
Q0, QMAX, QMIN, FLOOR = 80, 90, 60, 35.0
SOCIAL_CARDS = {'app-art/lib-books.jpg'}   # index.html og:image / twitter:image


def psnr(a, b):
    st = ImageStat.Stat(ImageChops.difference(a, b))
    rms = math.sqrt(sum(x * x for x in st.rms) / len(st.rms))
    return 99.0 if rms == 0 else 20 * math.log10(255 / rms)


def trial(im, q):
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=q, method=6)
    return buf.getvalue(), psnr(im, Image.open(io.BytesIO(buf.getvalue())).convert('RGB'))


def encode(path):
    src = Image.open(path)
    src.load()
    im = src.convert('RGB')
    q = Q0
    while True:
        data, db = trial(im, q)
        if db >= FLOOR or q >= QMAX:
            break
        q += 5
    # never heavier than the JPEG it replaces: step the quality DOWN while the floor still holds
    size = os.path.getsize(path)
    while len(data) > size and q > QMIN:
        d2, db2 = trial(im, q - 5)
        if db2 < FLOOR:
            break
        data, db, q = d2, db2, q - 5
    return data, q, db


def main(argv):
    dry = '--dry' in argv
    names = [a for a in argv if not a.startswith('--')]
    if '--all' in argv or dry:
        files = sorted(glob.glob(os.path.join(ART, '**', '*.jpg'), recursive=True))
        if not dry:
            print(f'converting EVERY JPEG in app-art/ ({len(files)} files) to WebP and deleting the JPEGs')
    elif names:
        files = [os.path.abspath(n) for n in names]
    else:
        print(__doc__)
        return 2
    a = b = 0
    for f in files:
        rel = os.path.relpath(f, APP)
        if rel in SOCIAL_CARDS:
            # the social card stays a JPEG; the app's own copy is a WebP beside it
            pass
        data, q, db = encode(f)
        a += os.path.getsize(f)
        b += len(data)
        print(f'{rel:44} {os.path.getsize(f) // 1024:6} KB -> {len(data) // 1024:6} KB  q{q}  {db:.1f} dB')
        if dry:
            continue
        with open(f[:-4] + '.webp', 'wb') as fh:
            fh.write(data)
        if rel not in SOCIAL_CARDS:
            os.remove(f)
    print(f'{len(files)} plates: {a / 1048576:.2f} MB of JPEG -> {b / 1048576:.2f} MB of WebP' + (' (dry run)' if dry else ''))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
