#!/usr/bin/env python3
"""Decide, per cover, whether its type should be white or ink.

The cover composition — masthead, kicker, title, tagline, fact pills — was
written for the original covers, which are dark saturated illustrations: white
type over a dark scrim reads perfectly on those. The advanced volumes are now
light, calm, three-ink drawings, and the same treatment greys out the art and
leaves a white title floating on a pale background.

So it is measured rather than guessed. This writes the average luminance of the
band where the masthead and title sit, and of the strip where the fact pills sit,
and mkbooks.js picks the ink from it. Re-run whenever cover art is regenerated:

    python3 voice/pipeline/cover-ink.py
"""
import glob
import json
import os
from PIL import Image, ImageStat

ART = '/home/user/Bizzing-Bee/spellbound-app/books/art'
OUT = os.path.join(ART, 'cover-ink.json')

# Above this, a white title stops holding its own even over a scrim.
LIGHT_AT = 170

def band(im, a, b):
    w, h = im.size
    return ImageStat.Stat(im.crop((0, int(h * a), w, int(h * b)))).mean[0]

data = {}
for f in sorted(glob.glob(os.path.join(ART, 'b*-cover.jpg'))):
    key = os.path.basename(f).split('-')[0]
    im = Image.open(f).convert('L')
    top, bottom = band(im, 0, 0.34), band(im, 0.83, 1.0)
    data[key] = {'top': round(top, 1), 'bottom': round(bottom, 1),
                 'ink': 'dark' if top > LIGHT_AT else 'light'}
    print(f'{key}  top {top:6.1f}  bottom {bottom:6.1f}  -> {data[key]["ink"]} type')

json.dump(data, open(OUT, 'w'), indent=1, sort_keys=True)
print('wrote', OUT, '—', sum(1 for v in data.values() if v['ink'] == 'dark'), 'light covers')
