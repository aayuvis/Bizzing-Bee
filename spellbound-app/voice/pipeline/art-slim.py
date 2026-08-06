#!/usr/bin/env python3
"""Bring the shipped art down to the size it is actually displayed at.

GitHub Pages stopped being able to deploy this site: the "pages build and
deployment" job kept reaching its ten-minute limit and aborting, so three
shipped builds in a row never reached the live app and a game deleted from the
source went on appearing in the Arcade. The site was 555MB. Dropping the
generated PDFs took it to 295MB and it still timed out.

The rest of the weight is art that is far larger than anything ever draws it:

  avatars/<id>.png   640x640 RGBA, ~360KB each, 211 of them. The app serves
                     avatars/s/ below 96px and these above it — so the largest
                     they are ever painted is a couple of hundred pixels, and in
                     the books they sit in a 0.34in box. 384px is generous for
                     both, and keeps the alpha the cutouts need.

  books/art/*        illustration plates re-encoded straight out of the image
                     model at whatever quality it produced. Re-encoding at a
                     sane quality with a sane maximum width is invisible at
                     print size and roughly halves them.

Nothing is cropped and nothing changes shape; every file keeps its name, so no
markup anywhere needs to know this ran.

Usage:  art-slim.py --dry     measure what it would save
        art-slim.py           do it
"""
import glob
import os
import sys
from PIL import Image

APP = '/home/user/Bizzing-Bee/spellbound-app'
AV_PX = 384          # full-size avatars: the app never paints one larger
ART_PX = 1400        # book plates: a full-bleed page at 300dpi is ~2550px, but
                     # these are printed inside boxes, never full-bleed at size
ART_Q = 78

DRY = '--dry' in sys.argv


def do(path, resize_to, quality=None):
    """Returns (before, after). Writes in place unless DRY."""
    before = os.path.getsize(path)
    try:
        im = Image.open(path)
    except Exception:
        return before, before
    fmt = (im.format or '').upper()
    w, h = im.size
    if max(w, h) > resize_to:
        s = resize_to / max(w, h)
        im = im.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS)
    tmp = path + '.tmp'
    try:
        if fmt == 'PNG' and im.mode in ('RGBA', 'LA', 'P'):
            im.convert('RGBA').save(tmp, 'PNG', optimize=True)
        elif fmt == 'PNG':
            im.convert('RGB').save(tmp, 'PNG', optimize=True)
        else:
            im.convert('RGB').save(tmp, 'JPEG', quality=quality or ART_Q,
                                   optimize=True, progressive=True)
    except Exception:
        if os.path.exists(tmp):
            os.remove(tmp)
        return before, before
    after = os.path.getsize(tmp)
    # never make a file bigger
    if after >= before:
        os.remove(tmp)
        return before, before
    if DRY:
        os.remove(tmp)
    else:
        os.replace(tmp, path)
    return before, after


def run(label, files, px, q=None):
    b = a = 0
    n = 0
    for f in files:
        x, y = do(f, px, q)
        b += x; a += y
        if y < x:
            n += 1
    print(f'{label:16} {len(files):4d} files  {b/1e6:7.1f} MB -> {a/1e6:7.1f} MB'
          f'   ({n} rewritten, saved {(b-a)/1e6:.1f} MB)', flush=True)
    return b - a


if __name__ == '__main__':
    os.chdir(APP)
    saved = 0
    saved += run('avatars', sorted(glob.glob('avatars/*.png')), AV_PX)
    saved += run('books/art', sorted(f for f in glob.glob('books/art/*')
                                     if f.lower().endswith(('.jpg', '.jpeg', '.png'))), ART_PX)
    print(f'\n{"WOULD SAVE" if DRY else "SAVED"} {saved/1e6:.1f} MB')
