"""Drop stray secondary figures from generated avatars: keep the largest
connected opaque region (the hero) plus anything of comparable size that
touches its bounding box, delete small floating islands, then re-crop and
re-centre. Runs on the saved PNGs — no regeneration needed."""
import glob, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

SIZE = 640
changed = 0
for f in sorted(glob.glob('avatars/*.png')):
    im = Image.open(f).convert('RGBA')
    a = np.array(im)
    solid = a[:, :, 3] > 120
    lbl, n = ndimage.label(solid)
    if n <= 1:
        continue
    sizes = ndimage.sum(solid, lbl, range(1, n + 1))
    hero = int(np.argmax(sizes)) + 1
    big = sizes.max()
    # keep the hero and any island at least 22% its size (dual-pose art), drop specks
    keep = {i + 1 for i, s in enumerate(sizes) if s >= big * 0.22}
    if len(keep) == n:
        continue
    mask = np.isin(lbl, list(keep))
    # feather: also keep semi-transparent pixels adjacent to kept regions
    grown = ndimage.binary_dilation(mask, iterations=3)
    a[:, :, 3] = np.where(grown, a[:, :, 3], 0)
    out = Image.fromarray(a)
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    side = int(max(out.size) * 1.08)
    canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    canvas.paste(out, ((side - out.width) // 2, (side - out.height) // 2))
    canvas.resize((SIZE, SIZE), Image.LANCZOS).save(f, optimize=True)
    changed += 1
    print('cleaned', os.path.basename(f), f'({n} regions → {len(keep)})')
print('total cleaned:', changed)
