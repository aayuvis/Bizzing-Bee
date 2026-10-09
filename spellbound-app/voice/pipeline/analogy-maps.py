#!/usr/bin/env python3
"""The Analogy Trail's four region maps, in the Atlas's own painted language.

Same contract as act-maps.py (whose style, geometry and generator this reuses): a bird's-eye map with
an OPEN BAND of ground sweeping across it in a lazy S, the scenery in the pockets — because the app
strokes its own road across the picture and hangs the stops off it. No lettering, no people.

Usage:  analogy-maps.py --all        generate the four
        analogy-maps.py --jpeg       resize to served JPEGs (app-art/anl-*.jpg)
"""
import base64
import json
import os
import ssl
import sys
import time
import urllib.request

# The key comes from the environment (GKEY, set in the cloud environment's settings) and
# falls back to the key file. Never print it; it goes only in the x-goog-api-key header.
KEY = (os.environ.get('GKEY') or open(os.environ.get('GKEY_FILE', '/root/.gkey')).read()).strip()
OUT = '/home/user/Bizzing-Bee/spellbound-app/app-art'
MODEL = os.environ.get('NB_MODEL', 'gemini-3.1-flash-image')
CTX = ssl.create_default_context(cafile='/root/.ccr/ca-bundle.crt')

STYLE = ('Painterly Japanese anime illustration, soft cel shading with two-tone shadows, '
         'volumetric light, rich colour grading, in the spirit of Studio Ghibli backgrounds. '
         'Family-friendly children\'s book art, warm and inviting. Full-bleed edge to edge, '
         'no border, no frame, and ABSOLUTELY NO TEXT, NO LETTERING, NO LABELS, NO NUMBERS '
         'anywhere in the image. No people, no characters, no faces. ')

# The geometry contract. The app strokes its own route across the picture and
# hangs the stop medallions off it, so what the art has to supply is ROOM: an
# open serpentine band of ground with the scenery pushed to the edges.
GEO = ('Composition, follow exactly: this is a bird\'s-eye region map seen from high above at a '
       'slight three-quarter angle. A wide OPEN BAND of plain walkable ground — bare earth, short '
       'grass, sand or worn stone — must sweep across the picture in a long lazy S: entering at the '
       'BOTTOM-LEFT, running right across the lower third, curving up and doubling back to the LEFT '
       'across the middle, then curving up again and running right to leave at the TOP-RIGHT. That '
       'band must stay clear and uncluttered along its whole length, with nothing tall standing in '
       'it. All of the scenery, buildings and detail sit in the pockets BETWEEN the sweeps of the '
       'band and around the edges of the picture. ')

# Two or three hidden caches per map, painted so the app's chest markers land on
# something that was already there rather than floating on empty paint.
CACHE = ('Tucked away in the far corners of the picture, well off the open band and half hidden '
         'behind the scenery, place two or three small forgotten caches — a little wooden chest, a '
         'stone cairn, a half-buried clay pot — each with a faint warm glow, as if waiting to be '
         'found. Keep them small and secondary. ')

DAY = 'Warm golden-hour light, long soft shadows, gentle mist in the low ground. '
DUSK = ('Cold blue dusk over the whole scene with warm lantern or firelight pooling inside the '
        'scenery, low mist, restrained palette. ')
NIGHT = ('Deep night under a clear starfield, cold moonlight over the ground and warm gold glow '
         'inside the scenery, restrained night palette with gold accents. ')

# ---- the Analogy Trail: four regions, one per Bee level band (tools/analogy/lessons.json) ----
REGIONS = {
    'anl-ponds': DAY + 'Twin Ponds: two still, round ponds lying side by side like a pair of mirrors, each reflecting the '
                 'sky. Around the open band: matching pairs of weeping willows on either bank, paired stepping stones, '
                 'two small arched wooden footbridges that mirror each other, water lilies, tall reeds, a pair of swans, '
                 'dragonflies over the water.',
    'anl-orchard': DAY + 'Orchard Hill: a gently terraced hillside orchard. Around the open band: neat rows of apple and pear '
                   'trees heavy with fruit, wicker baskets of sorted fruit, a small potter\'s shed with clay pots drying on '
                   'shelves, a wooden windmill for grinding flour, bales of sheep\'s wool on a cart, beehives at the edge.',
    'anl-workshop': 'Late golden-hour light turning to amber, warm glows inside buildings. Workshop Valley: a valley of small '
                    'craft workshops. Around the open band: a blacksmith\'s forge glowing orange, a carpenter\'s yard with '
                    'stacked planks and a sawhorse, a weaver\'s loom under a canvas awning, a baker\'s brick oven with a '
                    'smoking chimney, tools hanging neatly on racks, a turning waterwheel on a stream.',
    'anl-peaks': 'Clear high-altitude light, crisp blue sky, a sea of soft clouds below. Bridge Peaks: tall rocky mountain '
                 'peaks rising out of the clouds. Around the open band: peaks linked to each other by long rope-and-timber '
                 'suspension bridges, plain coloured pennants on the bridge ropes with no symbols on them, a stone beacon '
                 'tower glowing on the highest summit, pine trees clinging to the cliffs, an eagle soaring.',
}

SLOTS = {k: (GEO + v + ' ' + CACHE, '16:9') for k, v in REGIONS.items()}


def gen(slug, retries=4):
    prompt, aspect = SLOTS[slug]
    body = {'contents': [{'parts': [{'text': STYLE + prompt}]}],
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
                    raw = base64.b64decode(p['inlineData']['data'])
                    open(f'{OUT}/{slug}.png', 'wb').write(raw)
                    return f'OK {slug} {len(raw)//1024}KB'
            return f'NOIMG {slug} finish={d.get("candidates",[{}])[0].get("finishReason","?")}'
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 503) and attempt < retries - 1:
                time.sleep(20 * (attempt + 1)); continue
            return f'ERR {slug} {e.code}'
        except Exception as e:
            if attempt < retries - 1: time.sleep(10); continue
            return f'ERR {slug} {type(e).__name__}'
    return f'ERR {slug} exhausted'


def jpeg():
    """PNG -> a 1376px JPEG the app can actually serve. Same size the continent
       maps use, so one CSS rule covers every board."""
    from PIL import Image
    for s in SLOTS:
        src = f'{OUT}/{s}.png'
        if not os.path.exists(src):
            continue
        im = Image.open(src).convert('RGB')
        im = im.resize((1376, round(1376 * im.height / im.width)), Image.LANCZOS)
        for q in (82, 76, 70, 64):
            im.save(f'{OUT}/{s}.jpg', 'JPEG', quality=q, optimize=True, progressive=True)
            if os.path.getsize(f'{OUT}/{s}.jpg') <= 190 * 1024:
                break
        print(s, im.size, os.path.getsize(f'{OUT}/{s}.jpg') // 1024, 'KB', flush=True)
        os.remove(src)




if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    args = sys.argv[1:]
    if not args:
        print('\n'.join(SLOTS)); sys.exit(0)
    if args == ['--jpeg']:
        jpeg(); sys.exit(0)
    todo = list(SLOTS) if args == ['--all'] else args
    for s in todo:
        print(gen(s), flush=True)
