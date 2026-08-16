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
    'kart':      ('1:1', 300, "VIEW FROM BEHIND AND ABOVE. A small cute cartoon go-kart driving directly AWAY from the viewer up "
                              "a track, seen from a high chase camera looking down after it. A racing driver sits in the kart, seen "
                              "ONLY FROM BEHIND: we see the smooth rounded back of a glossy RACING HELMET (honeycomb-yellow with a "
                              "thin dark centre stripe) and a hint of the driver's shoulders in a racing suit. IMPORTANT: the "
                              "driver is a generic human racer in a plain helmet — NOT a bee, NOT an animal, NO antennae, NO wings, "
                              "NO ears, no face, nothing but the smooth back of a helmet. Below and around, from this high-behind "
                              "angle we look down onto: the seat, a low rear wing across the top, twin chrome exhaust pipes at the "
                              "back centre, and two chunky black rear tyres splayed left and right. The kart's nose points away up "
                              "the track into the distance. A strict tail-on rear view, symmetric and level, glossy cheerful cartoon."),
    'kart-red':  ('1:1', 300, "A friendly cartoon go-kart DRIVING AWAY from the viewer, straight tail-on rear view from a chase "
                              "camera directly behind at track level. ONLY the BACK is visible: the back of the headrest/seat-back "
                              "(cockpit hidden, NOT visible), a rear wing across the top, twin chrome exhausts low and centred, two "
                              "big rear tyres splayed left and right, nose pointing away into the distance. Glossy crimson-red "
                              "bodywork with a white centre stripe, rounded and toy-like. Symmetric, centred, level (not tilted)."),
    'oil':       ('1:1', 200, "A glossy dark spilled oil slick puddle for a racing game hazard, an irregular shiny black-and-"
                              "purple blob with a rainbow sheen and a small warning look, top-down, cartoon."),
    'kart-rocket':('1:1', 300, "A friendly cartoon RACING kart DRIVING AWAY from the viewer, strict tail-on rear view from a chase "
                              "camera directly behind at track level. ONLY the BACK is visible: the back of the headrest/seat-back "
                              "(cockpit hidden, NOT visible), a tall swept rear wing across the top, twin glowing blue jet-exhausts "
                              "low and centred, two big rear tyres splayed left and right, a sleek pointed nose tapering away into the "
                              "distance. Glossy electric-blue bodywork with a white lightning stripe, aerodynamic and toy-like. "
                              "Symmetric, centred, level (not tilted)."),
    'kart-buggy':('1:1', 300, "A friendly chunky cartoon OFF-ROAD dune-buggy kart DRIVING AWAY from the viewer, strict tail-on rear "
                              "view from a chase camera directly behind at track level. ONLY the BACK is visible: the back of a roll-"
                              "cage and seat-back (cockpit hidden, NOT visible), a spare-tyre on the back, twin stubby exhausts low "
                              "and centred, and two HUGE knobbly off-road rear tyres splayed wide left and right, nose pointing away "
                              "into the distance. Glossy lime-green bodywork with black trim, rugged rounded and toy-like. Symmetric, "
                              "centred, level (not tilted)."),
    'kart-cruiser':('1:1', 300, "A friendly rounded VINTAGE cartoon kart DRIVING AWAY from the viewer, strict tail-on rear view from a "
                              "chase camera directly behind at track level. ONLY the BACK is visible: the rounded back of a bubble "
                              "seat-back (cockpit hidden, NOT visible), a small curved rear fender, one chrome exhaust low and centred, "
                              "two rounded whitewall rear tyres splayed left and right, a bulbous rounded tail pointing away into the "
                              "distance. Glossy grape-purple bodywork with a cream stripe, cute retro bubble shape, toy-like. Symmetric, "
                              "centred, level (not tilted)."),
    'cop':       ('1:1', 300, "A cartoon POLICE PATROL CAR DRIVING AWAY from the viewer, strict tail-on rear view from a chase camera "
                              "directly behind at track level. ONLY the BACK is visible: the rear windscreen, tail-lights, a roof "
                              "light-bar with a red and a blue dome lit up and glowing, two rear tyres, nose pointing away into the "
                              "distance. Glossy black-and-white patrol livery, rounded friendly cartoon shape, toy-like. Symmetric, "
                              "centred, level (not tilted). A little comic urgency but not scary."),
    'speedbump': ('3:2', 240, "A cartoon yellow-and-black striped SPEED BUMP hump lying across a road, seen from a low chase camera "
                              "from behind and slightly above, a wide rounded raised ridge spanning left to right with bold diagonal "
                              "hazard stripes and a soft shadow under its front edge, glossy cartoon, a single speed bump centred."),
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
    'cactus':    ('3:4', 200, "A single cute cartoon saguaro desert cactus standing upright: a chunky rounded green cactus with two "
                              "raised arms, a few tiny spines and a small pink flower on top, soft cel shading, warm desert storybook "
                              "style, a single cactus."),
    'building':  ('3:4', 240, "A single cute cartoon CITY SKYSCRAPER at night standing upright, seen straight on: a tall narrow tower "
                              "with rows of small warm glowing yellow windows, a flat roof with a little antenna, deep indigo-blue walls, "
                              "a soft neon cyan-and-pink glow along its edges, glossy cartoon, a single building. No readable text or "
                              "signage lettering."),
    # ---- Keep Flying: characters ----
    'bee-fly':   ('1:1', 200, "A round chibi cartoon honeybee heroine flying, seen from a gentle three-quarter side view facing RIGHT, "
                              "wings up mid-beat. Glossy gradient-gold body with two soft chocolate-brown stripes, a small black "
                              "stinger, huge sparkling friendly eyes with catchlights, a tiny pink blush, two curled black antennae "
                              "with bobble tips, and four glassy translucent blue-white veined wings. Warm confident smile, soft cel "
                              "shading with a rim highlight, bright and toy-like, a single bee facing right."),
    'moth':      ('1:1', 190, "A small kid-friendly cartoon moth villain seen from the front with wings spread, gently mischievous "
                              "not scary. Dark wisteria-violet ragged wings with lighter gradient panels trailing a little sparkling "
                              "dust, a slim indigo fuzzy body, narrow amber lantern-glow eyes under small angry brows, a tiny smirk, "
                              "and two thin antennae with pale bobble tips. Soft glossy cel shading, a single moth centred."),
    # ---- Word Snake ----
    'snake-head':('1:1', 180, "A cute friendly cartoon snake head seen from top-down and FACING RIGHT (the snout points to the "
                              "right edge), bright grass-green with a soft lighter-green jaw, two big round friendly eyes on top "
                              "of the head looking forward, tiny nostrils, a small red forked tongue flicking out to the right, "
                              "smooth glossy rounded shading, no body — just the head."),
    # ---- Type Blaster ----
    'glitch':    ('1:1', 200, "A cute-but-mischievous cartoon glitch monster for a kids' typing game — a chunky rounded blob "
                              "creature made of glitchy purple and teal pixel-blocks with a few offset colour-channel edges, two "
                              "big round mischievous eyes, a little jagged grin, small stubby arms, floating menacingly. Playful, "
                              "not scary, glossy cartoon."),
}

# Reference images attached per sprite so a character stays on-model.
BEES = '/home/user/Bizzing-Bee/spellbound-app/books/art/bizzy-sheet.png'
REFS = {}   # kart driver is a helmet-from-behind now (works for any chosen avatar), no face reference needed

# Opaque full-frame backdrops (NOT alpha-cut). name -> (aspect, max_side, prompt)
BACKDROPS = {
    'fly-sky': ('16:9', 1280, "A bright cheerful daytime SKY backdrop for a side-scrolling cartoon flying game, painted in a soft "
                             "Studio-Ghibli storybook style: a clear blue sky graded from deeper blue at the top to pale near the "
                             "horizon, a warm friendly sun with a soft glow, several big fluffy white cumulus clouds at different "
                             "heights, and a low band of soft green rolling hills with a couple of distant trees along the very "
                             "bottom. The whole middle of the frame is OPEN, uncluttered sky (so game obstacles draw on top). "
                             "ABSOLUTELY NO characters, NO bees, NO birds, NO creatures, NO text — only sky, sun, clouds and a "
                             "thin strip of hills. Warm, inviting, full-bleed edge to edge, no border, no frame."),
    'gp-sky': ('16:9', 1280, "A bright cheerful sunny countryside racing backdrop for a cartoon kart game, painted in a soft "
                             "Studio-Ghibli storybook style: a clear blue sky with a warm sun and a few soft fluffy white "
                             "clouds up top, gentle rolling blue-green hills along the horizon, and bright green grassy fields "
                             "below. Composed with an OPEN, uncluttered centre and lower-middle (no road, no track, no cars, "
                             "no path) so a race track can be drawn on top; all the detail — clouds, sun, hills, a few distant "
                             "trees — sits toward the top and the far sides. ABSOLUTELY NO vehicles, NO karts, NO cars, NO "
                             "people, NO animals, NO creatures, NO characters of any kind anywhere — only an empty peaceful "
                             "landscape of sky, clouds, hills and grass. Warm, inviting, full-bleed edge to edge, no border, "
                             "no frame, no text of any kind."),
    'gp-sunset': ('16:9', 1280, "A warm SUNSET DESERT-CANYON racing backdrop for a cartoon kart game, painted in a soft Studio-Ghibli "
                             "storybook style: a glowing amber-and-rose evening sky graded from deep orange at the horizon to violet "
                             "up top, a big low golden sun with soft rays, tall red-rock mesas and canyon buttes in silhouette along "
                             "the sides and horizon, and warm sandy desert flats below. Composed with an OPEN, uncluttered centre and "
                             "lower-middle (no road, no track, no path) so a race track can be drawn on top; all the detail sits toward "
                             "the top and far sides. ABSOLUTELY NO vehicles, NO people, NO animals, NO characters anywhere — only an "
                             "empty warm desert of sky, sun, mesas and sand. Warm, inviting, full-bleed edge to edge, no border, no "
                             "frame, no text of any kind."),
    'gp-city': ('16:9', 1280, "A NIGHT NEON CITY racing backdrop for a cartoon kart game, painted in a soft Studio-Ghibli storybook "
                             "style but at night: a deep indigo starry sky, a big soft moon, a friendly cartoon skyline of tall city "
                             "buildings with warm glowing windows and a few bright neon signs (no readable letters) along the sides and "
                             "horizon, gentle bokeh glows. Composed with an OPEN, uncluttered centre and lower-middle (no road, no "
                             "track, no path) so a race track can be drawn on top; all the detail — towers, moon, neon — sits toward the "
                             "top and far sides. ABSOLUTELY NO vehicles, NO people, NO animals, NO characters anywhere, NO readable "
                             "text or letters — only an empty glowing night city skyline. Cheerful, inviting, full-bleed edge to edge, "
                             "no border, no frame."),
}

BG_STYLE = ("Full-scene painted illustration in a soft Studio-Ghibli storybook style, cheerful and warm, gentle "
            "cel shading and soft light. A COMPLETE edge-to-edge SCENE that fills the entire frame (not an object, "
            "not a sticker, not on a white background). No characters, no text. ")

def gen_png(prompt, aspect, style=None, refs=None, retries=3):
    parts = []
    for rp in (refs or []):
        with open(rp, 'rb') as f:
            parts.append({'inline_data': {'mime_type': 'image/png', 'data': base64.b64encode(f.read()).decode()}})
    parts.append({'text': (style if style is not None else STYLE) + prompt})
    body = {'contents': [{'parts': parts}],
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
        raw = gen_png(prompt, aspect, refs=REFS.get(name))
        if not raw:
            print('FAIL', name); continue
        im = process(raw, mx)
        path = f'{OUT}/{name}.webp'
        im.save(path, 'WEBP', quality=88, method=6)
        kb = os.path.getsize(path) / 1024
        print(f'OK {name} {im.size[0]}x{im.size[1]} {kb:.1f}KB -> {path}')

if __name__ == '__main__':
    main()
