#!/usr/bin/env python3
"""App-sized world banners, cut from the book series' painted scenery strips.

The books already own 39 painted strips (13 worlds x 3 light registers) at
1584x672. The Word Atlas needs the same scenery as a wide act banner, but at a
weight a tablet can carry on a screen that shows nine of them: this crops each
strip to a 3.6:1 band and writes an 880px JPEG, about 45KB.

Register 2 (golden hour) dresses the base acts, register 3 (dusk) the Advanced
Rounds — the same maturity dial the books use, so the advanced half of the map
reads darker on sight.
"""
import os

from PIL import Image, ImageEnhance

SRC = '/home/user/Bizzing-Bee/spellbound-app/books/art'
OUT = '/home/user/Bizzing-Bee/spellbound-app/app-art'
WORLDS = ['meadow', 'library', 'forum', 'elements', 'engine', 'strait', 'junkyard',
          'vibe', 'stage', 'warfield', 'greysea', 'origami', 'grandtrunk']
W, H = 880, 244          # 3.6:1 — the act banner
os.makedirs(OUT, exist_ok=True)

n = tot = 0
for world in WORLDS:
    for reg in (2, 3):
        src = f'{SRC}/strip-{world}-r{reg}.jpg'
        if not os.path.exists(src):
            print('missing', src)
            continue
        im = Image.open(src).convert('RGB')
        # take the band across the horizon rather than the whole strip: the
        # scenery lives there and the empty sky above it would just be padding
        band_h = int(im.width / (W / H))
        top = max(0, int(im.height * 0.52) - band_h // 2)
        im = im.crop((0, top, im.width, min(im.height, top + band_h)))
        im = im.resize((W, H), Image.LANCZOS)
        # a touch more contrast so a title sits legibly on top of it
        im = ImageEnhance.Color(im).enhance(1.06)
        dst = f'{OUT}/w-{world}-r{reg}.jpg'
        im.save(dst, 'JPEG', quality=82, optimize=True, progressive=True)
        tot += os.path.getsize(dst)
        n += 1

print(f'{n} banners, {tot/1024:.0f}KB total, avg {tot//max(1,n)//1024}KB')
