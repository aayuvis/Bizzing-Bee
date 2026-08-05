#!/usr/bin/env python3
"""Avatar batch generator: Nano Banana → background removal → optimized PNG in
spellbound-app/avatars/. Keeps the app's enamel-outline CSS working by making
the background genuinely transparent (flood-fill from the frame edges)."""
import json, re, sys, base64, os, time, io, urllib.request, ssl
from collections import deque
from PIL import Image
import numpy as np

KEY = open(os.environ.get('GKEY_FILE', '/root/.gkey')).read().strip()  # never hard-code the key
MD = '/home/user/Bizzing-Bee/spellbound-app/books/design-system/AVATARS-NANOBANANA.md'
OUT = '/home/user/Bizzing-Bee/spellbound-app/avatars'
MODEL = os.environ.get('NB_MODEL', 'gemini-3.1-flash-image')
CTX = ssl.create_default_context(cafile='/root/.ccr/ca-bundle.crt')
SIZE = 640

HEAD = ("Single character, centered, full body, facing the viewer, on a PLAIN SOLID WHITE background "
        "with nothing else in frame — no scenery, no props on the ground, no floor shadow, no text, "
        "no border, no frame. Premium enamel-pin / vinyl-sticker character art: glossy cel shading with "
        "clean two-tone shadows, soft rim light, bold readable silhouette, big expressive friendly anime "
        "eyes with catchlights, rounded chibi proportions with a large head. High quality, crisp, colorful, "
        "appealing to children aged 8-15. ")


def parse():
    slots = {}
    for m in re.finditer(r'^## \d+\. ([\w.-]+)\.png — square\n(.+?)(?=\n## |\Z)',
                         open(MD).read(), re.M | re.S):
        slots[m.group(1)] = ' '.join(m.group(2).split())
    return slots


def cutout(raw):
    """White background → transparent, via flood fill from the frame edges so
    white eyes and highlights inside the character survive."""
    im = Image.open(io.BytesIO(raw)).convert('RGBA')
    a = np.array(im)
    h, w = a.shape[:2]
    rgb = a[:, :, :3].astype(np.int16)
    light = (rgb.min(axis=2) > 228) & ((rgb.max(axis=2) - rgb.min(axis=2)) < 26)  # near-white
    seen = np.zeros((h, w), bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if light[y, x] and not seen[y, x]:
                seen[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if light[y, x] and not seen[y, x]:
                seen[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and light[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True; q.append((ny, nx))
    a[:, :, 3] = np.where(seen, 0, a[:, :, 3])
    im = Image.fromarray(a)
    # trim to the character, pad 4%, square, resize
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    side = int(max(im.size) * 1.08)
    canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    canvas.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
    return canvas.resize((SIZE, SIZE), Image.LANCZOS)


def gen(slug, prompt, retries=5):
    body = {'contents': [{'parts': [{'text': HEAD + prompt}]}],
            'generationConfig': {'responseModalities': ['IMAGE'],
                                 'imageConfig': {'aspectRatio': '1:1'}}}
    req = urllib.request.Request(
        f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent',
        data=json.dumps(body).encode(),
        headers={'Content-Type': 'application/json', 'X-goog-api-key': KEY})
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=300, context=CTX) as r:
                d = json.load(r)
            for p in d.get('candidates', [{}])[0].get('content', {}).get('parts', []):
                if 'inlineData' in p:
                    img = cutout(base64.b64decode(p['inlineData']['data']))
                    img.save(f'{OUT}/{slug}.png', optimize=True)
                    return f'OK {slug} {os.path.getsize(f"{OUT}/{slug}.png")//1024}KB'
            return f'NOIMG {slug}'
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 503) and attempt < retries - 1:
                time.sleep(25 * (attempt + 1)); continue
            return f'ERR {slug} {e.code}'
        except Exception as e:
            if attempt < retries - 1: time.sleep(12); continue
            return f'ERR {slug} {type(e).__name__}'
    return f'ERR {slug} exhausted'


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    slots = parse()
    want = sys.argv[1:]
    if not want:
        print('slots:', len(slots)); sys.exit(0)
    if want == ['--all']:
        want = [s for s in slots if not os.path.exists(f'{OUT}/{s}.png')]
        print(f'{len(want)} avatars remaining', flush=True)
    for slug in want:
        if slug in slots:
            print(gen(slug, slots[slug]), flush=True)
