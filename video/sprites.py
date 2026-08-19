#!/usr/bin/env python3
"""sprites.py — cut-out vehicles and figures that MOVE across the illustrated plates.

    python3 sprites.py            list slots and what is on disk
    python3 sprites.py --all      generate whatever is missing

WHY. The street plates are handsome but frozen: a theatre with carriages and early motor
cars at the kerb reads as a photograph of a moment rather than a moment. There is no
generative video in this pipeline (deliberately — see the production brief), so the traffic
is composited instead: each vehicle is drawn ONCE as an isolated sprite, keyed to
transparency, and then translated across the plate by the same frame-stepped animation
system as everything else.

TWO THINGS THIS FILE MUST GET RIGHT.

1. **Isolation.** Every sprite is generated on a flat pure-magenta field and keyed out.
   Magenta because nothing in this film's palette — indigo, honey, gold, cream — is
   anywhere near it, so the key cannot eat the artwork. A white or cream background would
   take the cream out of the drawing with it.

2. **Register.** These sit ON TOP of the Gemini plates and must be indistinguishable in
   style: same ink line, same three or four flat inks, same restraint. A sprite in a
   different drawing style is worse than no sprite at all.

The `plates.py` rules still bind: no real person, nothing photographic.
"""
import base64, json, os, ssl, subprocess, sys, time, urllib.request
import concurrent.futures as cf

KEY = open(os.environ.get('GKEY_FILE', '/root/.gkey')).read().strip()
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'images')
MODEL = os.environ.get('NB_MODEL', 'gemini-3-pro-image')
CTX = ssl.create_default_context(cafile='/root/.ccr/ca-bundle.crt')
FF = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'

KEYCOL = '0xFF00FF'

STYLE = (
    'Hand-inked editorial illustration in a mature graphic-novel register. Fine, even, '
    'confident ink line. Three or four flat inks only — deep indigo, warm gold, paper '
    'cream. Clearly a DRAWING and never photographic. Historical American subject, drawn '
    'with restraint, never whimsical, never cartoonish. '
    'The subject is shown COMPLETELY ISOLATED, in strict flat SIDE VIEW, centred, whole, '
    'and not cropped at any edge. '
    'THE ENTIRE BACKGROUND IS FLAT PURE MAGENTA (hex FF00FF) — a single solid uniform '
    'magenta field with absolutely nothing else in it: no ground, no shadow, no scenery, '
    'no floor line, no gradient, no texture, no border, no vignette. Magenta must not '
    'appear anywhere inside the subject itself. '
    'NO TEXT, NO LETTERING, NO NUMBERS, NO SIGNAGE anywhere. '
    'Any human figures are small, turned away, or in silhouette, with no readable face.'
)

SLOTS = {
    'sprite-carriage': (
        'A single horse-drawn closed carriage of about 1905 with one dark horse in harness, '
        'in strict side view, facing LEFT, whole vehicle and whole horse visible, a small '
        'driver figure up on the box seen from the side in silhouette.', '16:9'),

    'sprite-motorcar-1908': (
        'A single early American brass-era open touring motor car of about 1908 in strict '
        'side view, facing LEFT: high narrow wheels with spokes, open body, folded top, '
        'large round headlamp. Empty, nobody driving it.', '16:9'),

    'sprite-motorcar-1925': (
        'A single 1920s American open touring motor car in strict side view, facing RIGHT, '
        'top folded down, running board, spoked wheels. Two small figures seated inside, '
        'seen from the side in near silhouette with no readable faces.', '16:9'),

    'sprite-cart': (
        'A single flat open horse-drawn delivery cart of about 1910 with one horse in '
        'harness, strict side view, facing RIGHT, whole cart and whole horse visible, '
        'stacked plain crates on the cart bed. No driver.', '16:9'),
    # Review note: "nobody had made it national" wants an actual map of the United States,
    # and the cold open wants a small 1908-style map inset locating Cleveland. Generated as a
    # silhouette with NO lettering: every city dot and label in the film is placed in code
    # from real coordinates, because a generated map's own labels cannot be trusted and this
    # one sits beside four genuine archive photographs.
    'sprite-usmap': (
        'A map of the contiguous United States shown as ONE single flat filled silhouette of '
        'the whole landmass, seen straight on from directly above, complete and correct in '
        'outline with the Atlantic and Pacific coasts, the Gulf of Mexico, Florida, Texas, '
        'the Great Lakes and Maine all clearly readable. Faint thin internal lines suggest '
        'state boundaries. Deep indigo fill with a fine warm gold outline. No Alaska, no '
        'Hawaii, no compass, no border, no frame, no graticule, and absolutely NO text or '
        'labels of any kind anywhere.', '16:9'),

    # §06, 3:47 — the museum hall is seated and still; a few figures crossing the aisle give
    # the room a pulse without pretending the audience itself is animated.
    'sprite-walkers': (
        'Three American adults of about 1925 in overcoats and hats, WALKING, shown together '
        'in strict side view facing RIGHT, mid-stride, whole bodies from hat to shoe, seen '
        'from the side so no face is readable. Plain dark clothing.', '16:9'),
}


def gen(slug, retries=4):
    prompt, aspect = SLOTS[slug]
    body = {'contents': [{'parts': [{'text': STYLE + ' ' + prompt}]}],
            'generationConfig': {'responseModalities': ['IMAGE'],
                                 'imageConfig': {'aspectRatio': aspect, 'imageSize': '2K'}}}
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
                    raw = base64.b64decode(p['inlineData']['data'])
                    open(f'{OUT}/{slug}-raw.png', 'wb').write(raw)
                    return key(slug)
            return f'NOIMG {slug:24} finish={d.get("candidates",[{}])[0].get("finishReason","?")}'
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 503) and attempt < retries - 1:
                time.sleep(20 * (attempt + 1)); continue
            return f'ERR   {slug:24} HTTP {e.code}'
        except Exception as e:
            if attempt < retries - 1: time.sleep(10); continue
            return f'ERR   {slug:24} {type(e).__name__}'
    return f'ERR   {slug:24} exhausted'


def key(slug):
    """Background -> alpha, then trim to the artwork.

    The key colour is SAMPLED from the corners rather than assumed to be FF00FF. The model
    does not always land on the exact hex it was asked for -- one of these four came back on
    a soft mauve -- and a fixed-colour key silently leaves the whole background opaque, which
    then composites over the plate as a solid rectangle. Sampling cannot miss.

    Two thresholds: everything within NEAR of the key is cut, and the band out to FAR is
    faded proportionally, which removes the ring of blended pixels around the ink line that
    a hard key leaves behind as a coloured halo.
    """
    import numpy as np
    from PIL import Image
    src, dst = f'{OUT}/{slug}-raw.png', f'{OUT}/{slug}.png'
    im = Image.open(src).convert('RGBA')
    a = np.asarray(im).astype(np.int16)
    h, w = a.shape[:2]
    corners = np.stack([a[0, 0, :3], a[0, w - 1, :3], a[h - 1, 0, :3], a[h - 1, w - 1, :3]])
    kc = np.median(corners, axis=0)

    dist = np.sqrt(((a[:, :, :3] - kc) ** 2).sum(axis=2))
    NEAR, FAR = 60.0, 145.0
    alpha = np.clip((dist - NEAR) / (FAR - NEAR), 0, 1)
    out = a.copy()
    out[:, :, 3] = (alpha * 255).astype(np.int16)

    # Un-blend the surviving edge pixels away from the key colour, or the sprite keeps a
    # rim of background tint that reads as a coloured outline once it is over the plate.
    edge = (alpha > 0.02) & (alpha < 0.98)
    if edge.any():
        f = alpha[edge][:, None]
        px = out[:, :, :3][edge].astype(np.float32)
        out[:, :, :3][edge] = np.clip((px - kc * (1 - f)) / np.maximum(f, 0.15), 0, 255)

    im2 = Image.fromarray(out.astype(np.uint8), 'RGBA')
    bb = im2.getbbox()
    if bb:
        im2 = im2.crop(bb)
    im2.save(dst)
    os.remove(src)
    kept = 100.0 * (np.asarray(im2)[:, :, 3] > 8).mean()
    return f'OK    {slug:24} {im2.width}x{im2.height}  key=rgb{tuple(int(v) for v in kc)}  {kept:.0f}% opaque'


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('-')]
    if '--all' in sys.argv:
        args = [s for s in SLOTS if not os.path.exists(f'{OUT}/{s}.png')]
    if not args:
        for s in SLOTS:
            print(f"  {'HAVE' if os.path.exists(f'{OUT}/{s}.png') else '    '}  {s}")
        sys.exit(0)
    with cf.ThreadPoolExecutor(max_workers=4) as ex:
        for r in ex.map(gen, args):
            print(r)
