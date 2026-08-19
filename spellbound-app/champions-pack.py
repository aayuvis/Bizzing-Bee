#!/usr/bin/env python3
"""champions-pack.py — avatar art for the Spelling Champions pack.

    python3 champions-pack.py --all

Five children who won a national spelling bee between 1908 and 1928, drawn in the same
chibi register as the rest of the collection and dropped into `avatars/` as 384px RGBA
webp, which is what avatars.js expects.

ON DRAWING REAL PEOPLE. The film these come from refuses to generate a picture of any of
these children, because there it would sit beside genuine Library of Congress photographs
and a viewer could not tell which was the document. An avatar is the opposite case: the
pack already carries Marie Curie, Gandhi, Florence Nightingale and Martin Luther King Jr.
in exactly this style, nobody mistakes a chibi sticker for a photograph, and the convention
is established. These are characters inspired by real champions, not claimed likenesses,
and none of them is drawn from a specific photograph.
"""
import base64, json, os, ssl, sys, time, urllib.request
import concurrent.futures as cf
import numpy as np
from PIL import Image

KEY = open(os.environ.get('GKEY_FILE', '/root/.gkey')).read().strip()
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'avatars')
MODEL = os.environ.get('NB_MODEL', 'gemini-3-pro-image')
CTX = ssl.create_default_context(cafile='/root/.ccr/ca-bundle.crt')

STYLE = (
    'A cute chibi-style collectible sticker character, full body head to toe, standing and '
    'facing the viewer, big friendly eyes, soft clean cel shading, warm golden-brown and '
    'cream palette with a fine darker outline, gentle sparkle accents. Charming and '
    'wholesome, drawn for a childrens app. Small head-to-body ratio like a collectible '
    'blind-box figure. The whole character is inside the frame with room around it. '
    'THE ENTIRE BACKGROUND IS FLAT PURE MAGENTA (hex FF00FF), one solid uniform field with '
    'nothing in it: no ground, no shadow, no scenery, no glow, no border, no vignette. '
    'ABSOLUTELY NO TEXT, NO LETTERING, NO NAMES, NO NUMBERS anywhere in the image.'
)

SLOTS = {
    'bolden': (
        'A cheerful African-American schoolgirl of about thirteen from 1908, in a simple '
        'high-necked cotton pinafore dress and buttoned boots, her hair in two neat plaits '
        'with ribbons, holding up a round gold medal on a ribbon with both hands and smiling '
        'proudly.'),
    'neuhauser': (
        'A cheerful boy of about eleven from 1925, in knee breeches, a buttoned waistcoat, a '
        'necktie and long socks, hair neatly parted, holding a tall coral-and-gold gladiolus '
        'flower stem taller than himself.'),
    'pbell': (
        'A cheerful girl of about thirteen from 1926, in a 1920s drop-waist dress of vivid '
        'cherry-pink with a wide collar and a matching hair ribbon, holding a small posy of '
        'cherries, smiling.'),
    'lucas': (
        'A cheerful boy of about thirteen from 1927, in a tweed jacket, short trousers and a '
        'flat cap, holding a thick leather-bound book under one arm and a small wooden gavel '
        'in the other hand.'),
    'brobinson': (
        'A cheerful girl of about thirteen from 1928, in a plain drop-waist dress with a '
        'sailor collar and a bobbed haircut with a hair clip, holding a small speckled hen '
        'egg carefully in cupped hands, looking determined and pleased.'),
}


def key_to_webp(slug, raw):
    """Magenta -> alpha, trim, square-pad, and save as 384px RGBA webp like the rest of the
    pack. The key colour is sampled from the corners because the model does not reliably
    land on the exact magenta it is asked for."""
    tmp = f'{OUT}/{slug}-raw.png'
    open(tmp, 'wb').write(raw)
    im = Image.open(tmp).convert('RGBA')
    a = np.asarray(im).astype(np.int16)
    h, w = a.shape[:2]
    kc = np.median(np.stack([a[0, 0, :3], a[0, w - 1, :3], a[h - 1, 0, :3], a[h - 1, w - 1, :3]]), axis=0)
    dist = np.sqrt(((a[:, :, :3] - kc) ** 2).sum(axis=2))
    alpha = np.clip((dist - 60.0) / (145.0 - 60.0), 0, 1)
    out = a.copy()
    out[:, :, 3] = (alpha * 255).astype(np.int16)
    edge = (alpha > 0.02) & (alpha < 0.98)
    if edge.any():
        f = alpha[edge][:, None]
        px = out[:, :, :3][edge].astype(np.float32)
        out[:, :, :3][edge] = np.clip((px - kc * (1 - f)) / np.maximum(f, 0.15), 0, 255)
    im2 = Image.fromarray(out.astype(np.uint8), 'RGBA')
    bb = im2.getbbox()
    if bb:
        im2 = im2.crop(bb)
    # square canvas, character centred, a little breathing room — matches the existing files
    side = int(max(im2.size) * 1.06)
    pad = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    pad.paste(im2, ((side - im2.width) // 2, (side - im2.height) // 2), im2)
    pad = pad.resize((384, 384), Image.LANCZOS)
    pad.save(f'{OUT}/{slug}.webp', 'WEBP', quality=92, method=6)
    os.remove(tmp)
    kept = 100.0 * (np.asarray(pad)[:, :, 3] > 8).mean()
    return f'OK    {slug:12} 384x384  {kept:.0f}% opaque  {os.path.getsize(f"{OUT}/{slug}.webp")//1024}KB'


def gen(slug, retries=4):
    body = {'contents': [{'parts': [{'text': STYLE + ' ' + SLOTS[slug]}]}],
            'generationConfig': {'responseModalities': ['IMAGE'],
                                 'imageConfig': {'aspectRatio': '1:1', 'imageSize': '2K'}}}
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
                    return key_to_webp(slug, base64.b64decode(p['inlineData']['data']))
            return f'NOIMG {slug:12} finish={d.get("candidates",[{}])[0].get("finishReason","?")}'
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 503) and attempt < retries - 1:
                time.sleep(20 * (attempt + 1)); continue
            return f'ERR   {slug:12} HTTP {e.code}'
        except Exception as e:
            if attempt < retries - 1: time.sleep(10); continue
            return f'ERR   {slug:12} {type(e).__name__}: {e}'
    return f'ERR   {slug:12} exhausted'


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('-')]
    if '--all' in sys.argv:
        args = [s for s in SLOTS if not os.path.exists(f'{OUT}/{s}.webp')]
    if not args:
        for s in SLOTS:
            print(f"  {'HAVE' if os.path.exists(f'{OUT}/{s}.webp') else '    '}  {s}")
        sys.exit(0)
    with cf.ThreadPoolExecutor(max_workers=5) as ex:
        for r in ex.map(gen, args):
            print(r)
