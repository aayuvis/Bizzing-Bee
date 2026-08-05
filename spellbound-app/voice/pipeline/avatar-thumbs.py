#!/usr/bin/env python3
"""Small-size avatar renditions for the app.

The painted avatars are 640px so they hold up on a poster or a 150px collection
tile, but the app draws most of them at 34-116px — a 348KB PNG per chip is the
single biggest render cost on a busy screen. This writes a 192px rendition of
every avatar into avatars/s/, which SB_AVATAR serves whenever the requested
size is small. Transparency and the alpha edge are preserved, so the CSS
drop-shadow outline still traces the character.
"""
import glob
import os

from PIL import Image

SRC = '/home/user/Bizzing-Bee/spellbound-app/avatars'
OUT = os.path.join(SRC, 's')
SIZE = 192

os.makedirs(OUT, exist_ok=True)
tot_in = tot_out = n = 0
for path in sorted(glob.glob(f'{SRC}/*.png')):
    slug = os.path.basename(path)
    im = Image.open(path).convert('RGBA')
    im = im.resize((SIZE, SIZE), Image.LANCZOS)
    # quantise to a 255-colour palette + alpha: cartoon art has few real colours,
    # so this is visually lossless at 192px and roughly 8x smaller than RGBA.
    dst = f'{OUT}/{slug}'
    im.quantize(colors=255, method=Image.FASTOCTREE).save(dst, optimize=True)
    if os.path.getsize(dst) > os.path.getsize(path):      # never ship a bigger file
        im.save(dst, optimize=True)
    tot_in += os.path.getsize(path)
    tot_out += os.path.getsize(dst)
    n += 1

print(f'{n} thumbs at {SIZE}px: {tot_in/1048576:.1f}MB -> {tot_out/1048576:.1f}MB '
      f'({100*tot_out/max(1,tot_in):.0f}%), avg {tot_out//max(1,n)//1024}KB')
