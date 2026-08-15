#!/usr/bin/env python3
"""Generate lightweight transparent game-element sprites with Gemini (Nano Banana)
and post-process to small alpha WebP for canvas games. Never prints the API key.

Gemini returns an OPAQUE png, so each sprite is generated on a solid pure-white
field and the background is removed by flood-fill FROM THE EDGES (so white inside
the sprite — a bee's eye, a highlight — is kept). Output is autocropped, downscaled
to a small max side, and saved as WebP with alpha in app-art/gart/.

Usage:  NB_MODEL=gemini-3-pro-image python3 voice/pipeline/game-sprites.py kart oil item-box
        (no args = generate every sprite in SPRITES)
"""
import json, sys, base64, os, time, urllib.request, ssl, io, collections
from PIL import Image

KEY = open(os.environ.get('GKEY_FILE', '/root/.gkey')).read().strip()
MODEL = os.environ.get('NB_MODEL', 'gemini-3-pro-image')
CTX = ssl.create_default_context(cafile='/root/.ccr/ca-bundle.crt')
OUT = '/home/user/Bizzing-Bee/spellbound-app/app-art/gart'
os.makedirs(OUT, exist_ok=True)

STYLE = ("Cute modern mobile-game sprite in a clean, bold, friendly cartoon style: "
         "thick soft outline, smooth cel shading with a soft rim highlight, bright saturated "
         "candy colours, simple readable silhouette that stays clear at small size, gentle and "
         "kid-friendly. ONE single object, fully inside the frame with a little margin, centred. "
         "Studio-lit on a SOLID PURE WHITE (#FFFFFF) background — no scenery, no ground line, "
         "no drop shadow, no gradient, no vignette, nothing but flat white around the subject. "
         "No text, no numbers, no lettering of any kind. ")

# name -> (aspect_ratio, max_side_px, prompt)
SPRITES = {
    # ---- Bee Grand Prix ----
    'kart':      ('1:1', 320, "A friendly cartoon go-kart racing buggy viewed from DIRECTLY BEHIND and slightly above, as if "
                              "a chase camera is following it down the track — you see the BACK of the kart: the rear spoiler, "
                              "twin exhaust pipes, the two big rear tyres and the back of an EMPTY driver seat (no driver); the "
                              "nose of the kart points away from the viewer into the distance. Honeycomb-yellow and black "
                              "bee-striped bodywork, glossy, rounded and toy-like."),
    'kart-red':  ('1:1', 320, "A friendly cartoon go-kart racing buggy viewed from DIRECTLY BEHIND and slightly above (chase-cam "
                              "rear view): you see the back of the kart, rear spoiler, twin exhausts, two big rear tyres and the "
                              "back of an EMPTY seat (no driver), nose pointing away into the distance. Glossy crimson-red "
                              "bodywork with a white racing stripe, rounded and toy-like."),
    'oil':       ('1:1', 200, "A glossy dark spilled oil slick puddle for a racing game hazard, an irregular shiny black-and-"
                              "purple blob with a rainbow sheen and a small warning look, top-down, cartoon."),
    'item-box':  ('1:1', 200, "A floating mystery item box power-up for a racing game: a rounded glowing golden cube with a "
                              "big white question mark carved into its face, sparkles around it, honeycomb texture, cartoon."),
    # ---- Keep Flying ----
    'honeypot':  ('1:1', 170, "A cute little honey pot: a round amber clay jar full of glossy golden honey with a honey "
                              "dipper and a drip over the rim, a tiny wooden lid tag, glossy and collectible, cartoon."),
    'pillar':    ('3:4', 260, "A tall friendly obstacle pillar for a side-scrolling flappy-style game: a chunky rounded "
                              "honeycomb-and-wax column with soft rounded ends, warm golden beeswax texture, cartoon, "
                              "a single vertical pillar standing upright."),
    'coin':      ('1:1', 130, "A shiny round golden game coin with a honeycomb hexagon stamped in the centre, bright and "
                              "collectible, soft rim light, cartoon."),
    'tree':      ('3:4', 200, "A single cute rounded cartoon tree with a full leafy green canopy in soft layered blobs and a "
                              "short chunky brown trunk, gentle shading, storybook style, standing upright."),
    # ---- Word Snake ----
    'snake-head':('1:1', 180, "A cute friendly cartoon snake head seen from top-down and FACING RIGHT (the snout points to the "
                              "right edge), bright grass-green with a soft lighter-green jaw, two big round friendly eyes on top "
                              "of the head looking forward, tiny nostrils, a small red forked tongue flicking out to the right, "
                              "smooth glossy rounded shading, no body — just the head."),
}

# Opaque full-frame backdrops (NOT alpha-cut). name -> (aspect, max_side, prompt)
BACKDROPS = {
    'gp-sky': ('16:9', 1280, "A bright cheerful sunny countryside racing backdrop for a cartoon kart game, painted in a soft "
                             "Studio-Ghibli storybook style: a clear blue sky with a warm sun and a few soft fluffy white "
                             "clouds up top, gentle rolling blue-green hills along the horizon, and bright green grassy fields "
                             "below. Composed with an OPEN, uncluttered centre and lower-middle (no road, no track, no cars, "
                             "no path) so a race track can be drawn on top; all the detail — clouds, sun, hills, a few distant "
                             "trees — sits toward the top and the far sides. ABSOLUTELY NO vehicles, NO karts, NO cars, NO "
                             "people, NO animals, NO creatures, NO characters of any kind anywhere — only an empty peaceful "
                             "landscape of sky, clouds, hills and grass. Warm, inviting, full-bleed edge to edge, no border, "
                             "no frame, no text of any kind."),
}

BG_STYLE = ("Full-scene painted illustration in a soft Studio-Ghibli storybook style, cheerful and warm, gentle "
            "cel shading and soft light. A COMPLETE edge-to-edge SCENE that fills the entire frame (not an object, "
            "not a sticker, not on a white background). No characters, no text. ")

def gen_png(prompt, aspect, style=None, retries=3):
    body = {'contents': [{'parts': [{'text': (style if style is not None else STYLE) + prompt}]}],
            'generationConfig': {'responseModalities': ['IMAGE'],
                                 'imageConfig': {'aspectRatio': aspect}}}
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
                    return base64.b64decode(p['inlineData']['data'])
            return None
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 503) and attempt < retries - 1:
                time.sleep(20 * (attempt + 1)); continue
            print('  http', e.code, e.read().decode()[:160]); return None
        except Exception as e:
            if attempt < retries - 1: time.sleep(10); continue
            print('  err', type(e).__name__); return None
    return None

def cut_bg(im, tol=26, feather=True):
    """Flood-fill near-white from the 4 edges to transparent; keeps interior whites."""
    im = im.convert('RGBA')
    w, h = im.size
    px = im.load()
    def near_white(t):
        return t[0] >= 255 - tol and t[1] >= 255 - tol and t[2] >= 255 - tol
    seen = bytearray(w * h)
    dq = collections.deque()
    for x in range(w):
        for y in (0, h - 1):
            dq.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            dq.append((x, y))
    while dq:
        x, y = dq.popleft()
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        r, g, b, a = px[x, y]
        if not near_white((r, g, b)):
            continue
        px[x, y] = (r, g, b, 0)
        if x > 0: dq.append((x - 1, y))
        if x < w - 1: dq.append((x + 1, y))
        if y > 0: dq.append((x, y - 1))
        if y < h - 1: dq.append((x, y + 1))
    # soften the cut edge one pixel so it isn't a hard jaggy line
    if feather:
        from PIL import ImageFilter
        alpha = im.split()[3].filter(ImageFilter.GaussianBlur(0.6))
        im.putalpha(alpha)
    return im

def process(raw, max_side):
    im = Image.open(io.BytesIO(raw)).convert('RGBA')
    im = cut_bg(im)
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    w, h = im.size
    scale = min(1.0, max_side / max(w, h))
    if scale < 1.0:
        im = im.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)
    return im

def process_backdrop(raw, max_side):
    im = Image.open(io.BytesIO(raw)).convert('RGB')
    w, h = im.size
    scale = min(1.0, max_side / max(w, h))
    if scale < 1.0:
        im = im.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)
    return im

def main():
    want = sys.argv[1:] or (list(SPRITES) + list(BACKDROPS))
    for name in want:
        if name in BACKDROPS:
            aspect, mx, prompt = BACKDROPS[name]
            raw = gen_png(prompt, aspect, style=BG_STYLE)
            if not raw:
                print('FAIL', name); continue
            im = process_backdrop(raw, mx)
            path = f'{OUT}/{name}.webp'
            im.save(path, 'WEBP', quality=82, method=6)
            print(f'OK {name} {im.size[0]}x{im.size[1]} {os.path.getsize(path)/1024:.1f}KB (backdrop) -> {path}')
            continue
        if name not in SPRITES:
            print('skip (unknown)', name); continue
        aspect, mx, prompt = SPRITES[name]
        raw = gen_png(prompt, aspect)
        if not raw:
            print('FAIL', name); continue
        im = process(raw, mx)
        path = f'{OUT}/{name}.webp'
        im.save(path, 'WEBP', quality=88, method=6)
        kb = os.path.getsize(path) / 1024
        print(f'OK {name} {im.size[0]}x{im.size[1]} {kb:.1f}KB -> {path}')

if __name__ == '__main__':
    main()
