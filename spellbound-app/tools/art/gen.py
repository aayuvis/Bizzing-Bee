#!/usr/bin/env python3
"""The game-stage plates (games spec §5.0): one painted backdrop per hub and game, in a
day and a night version, served as app-art/stage/<name>-day.webp and -night.webp and
picked by SB_PLATE(name) in saga2.js.

What a plate is for: it sits BEHIND the play. Translucent panels, a HUD and a play
object go on top of it, so the painting is composed open — a calm, low-detail centre,
mirrored left and right, with the detail pushed to the edges. No lettering of any kind
(an image model letters convincingly and spells badly, and this is a spelling app), no
people, no characters.

How the pairs stay pairs: the DAY plate is painted from text, and the NIGHT plate is
painted FROM the day plate (the image goes in as input with "the same scene at night"),
so a theme switch changes the light, not the room. blaster-grey is painted from
blaster-color the same way: the restored world and the grey "unspelt" one are one
composition.

The key is read from GKEY_FILE (default /root/.gkey) and is only ever sent as the
x-goog-api-key header. It is never printed or written anywhere.

Usage:  gen.py                       list the plates
        gen.py gym lore ...          paint the named plates (day, then night)
        gen.py --all                 paint whatever is missing
        gen.py --webp                convert every raw PNG to the served WebP
Env:    GKEY_FILE, ART_MODELS (comma list, tried in order), ART_RAW (raw PNG dir),
        ART_ONLY=day|night (one half only)
"""
import base64
import json
import os
import ssl
import sys
import tempfile
import time
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.dirname(os.path.dirname(HERE))
OUT = os.path.join(APP, 'app-art', 'stage')
RAW = os.environ.get('ART_RAW', os.path.join(tempfile.gettempdir(), 'sb-stage-raw'))
MODELS = os.environ.get('ART_MODELS', 'gemini-3-pro-image,gemini-3.1-flash-image').split(',')
CA = '/root/.ccr/ca-bundle.crt'
CTX = ssl.create_default_context(cafile=CA) if os.path.exists(CA) else ssl.create_default_context()


def key():
    with open(os.environ.get('GKEY_FILE', '/root/.gkey')) as f:
        return f.read().strip()


STYLE = ("Warm painted storybook illustration for a children's spelling app: gouache and "
         "watercolour texture, soft golden light, honey and amber tones with gentle teal and "
         "violet accents, rich but calm. Full-bleed edge to edge, no border, no frame, no "
         "vignette box. ")

# The layout contract. The app lays its own panels, HUD and play object over the middle.
LAYOUT = ("COMPOSITION, follow exactly: a wide stage backdrop seen straight on, SYMMETRIC — the "
          "left half mirrors the right half. The CENTRE of the picture (the middle sixty percent "
          "of the width and most of the height) is CALM and OPEN: soft, low-contrast, low-detail "
          "space — plain wall, floor, sky or soft light — with nothing standing in it, because "
          "game panels will sit there. All the interesting detail frames the scene along the LEFT "
          "and RIGHT edges and along the very top and bottom. ")

NEVER = ("ABSOLUTELY NO TEXT anywhere: no letters, no words, no numbers, no labels, no signs, "
         "no signage, no writing on books, spines, jars, banners, posters, boards or charts — "
         "every surface that could carry writing is plain. NO people, NO characters, NO faces, "
         "NO animals, no creatures. ")

PLATES = {
    'gym': ("A warm, friendly indoor training hall for spelling practice, built inside a giant "
            "honey-coloured hive: honey-wood floorboards, tall arched windows on both sides "
            "letting in sunlight, wall bars and coiled climbing ropes at the left and right "
            "edges, stacked wooden blocks and soft hexagonal mats, honeycomb panelling high on the "
            "walls, plain unmarked fabric pennants strung along the top. The centre is the open "
            "floor and a soft plain back wall."),
    'lore': ("A cosy round library: tall curved bookshelves rising on both the left and right "
             "edges with rolling ladders, brass reading lamps, small potted plants and a few "
             "globes on the shelves, warm wood floor, a high round window at the top centre with "
             "soft light falling into an open, quiet middle. Book spines are plain colours with "
             "no writing."),
    'hive': ("A storybook observatory under a great dome: a brass telescope and an orrery of "
             "turning rings on the left and right edges, shelves of curiosities, a celestial globe "
             "and a terrestrial globe as a mirrored pair, the dome open at the top to a soft sky "
             "of faint stars and planets, a calm open floor in the middle. Charts are blank."),
    'clinic': ("A gentle, friendly word-doctor's clinic in the style of an old apothecary: shelves "
               "of glass jars and honey bottles on both edges (all plain, no labels), bundles of "
               "drying herbs, a brass scale, a rolled bandage and a doctor's bag on a side "
               "table, potted healing plants, warm window light; a calm open middle of soft plain "
               "wall and wooden floor."),
    'forge': ("A honey-forge workshop lit from BOTH sides: a glowing forge with honey-gold fire on "
              "the left edge and a matching glowing forge on the right edge, anvils, bellows, "
              "racks of hanging tools, buckets of golden molten honey-metal, warm sparks drifting "
              "at the edges, timber beams across the top; the middle is a calm open workshop floor "
              "and plain stone wall in soft warm light."),
    'daily': ("A morning hive at sunrise: a peaceful meadow with two great golden beehives — one at "
              "the left edge and one at the right edge — framed by flowering branches and tall "
              "wildflowers, dew on the grass, a soft pale dawn sky with gentle clouds filling the "
              "calm open centre, low golden sun light."),
    'blaster-color': ("A bright storybook valley kingdom seen from a high terrace: on the left and "
                      "right edges, terraced flower gardens, little round honey-coloured towers "
                      "with hexagonal windows, fruit trees and bunting with no marks; a winding "
                      "river far below; the middle is a wide calm open sky over distant soft hills. "
                      "Full of colour."),
}

NIGHT = ("Repaint THIS EXACT SCENE at night. Keep the same composition, the same camera, the same "
         "objects in the same places, the same symmetric framing and the same calm open centre. "
         "Change only the light: a deep blue-violet night, cool moonlight, and warm golden lamp, "
         "lantern or fire glow pooling inside the scenery at the edges. The centre stays calm, "
         "dark-mid-toned and uncluttered. ")

GREY = ("Repaint THIS EXACT SCENE as the same world after its colour has been forgotten: keep the "
        "same composition, the same camera, every object in the same place. Drain it to cold "
        "greys, pale stone and faded slate, flowers wilted to ash-grey, the river dull pewter, "
        "thin wisps of grey mist drifting through. Not frightening, just quiet and colourless, "
        "waiting to be restored. Do not add anything new. ")

ORDER = ['gym', 'lore', 'hive', 'clinic', 'forge', 'daily', 'blaster-color', 'blaster-grey']


def raw_path(name, half):
    return os.path.join(RAW, f'{name}-{half}.png')


def call(parts, aspect='16:9', retries=3):
    body = {'contents': [{'parts': parts}],
            'generationConfig': {'responseModalities': ['IMAGE'],
                                 'imageConfig': {'aspectRatio': aspect}}}
    data = json.dumps(body).encode()
    last = 'no model'
    for model in MODELS:
        for attempt in range(retries):
            req = urllib.request.Request(
                f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent',
                data=data, headers={'Content-Type': 'application/json', 'x-goog-api-key': key()})
            try:
                with urllib.request.urlopen(req, timeout=300, context=CTX) as r:
                    d = json.load(r)
                for p in d.get('candidates', [{}])[0].get('content', {}).get('parts', []):
                    if 'inlineData' in p:
                        return base64.b64decode(p['inlineData']['data']), model
                last = f'{model}: no image ({d.get("candidates", [{}])[0].get("finishReason", "?")})'
                break
            except urllib.error.HTTPError as e:
                last = f'{model}: HTTP {e.code}'
                if e.code in (429, 500, 503) and attempt < retries - 1:
                    time.sleep(15 * (attempt + 1)); continue
                break
            except Exception as e:  # network hiccup
                last = f'{model}: {type(e).__name__}'
                if attempt < retries - 1:
                    time.sleep(8); continue
                break
    raise RuntimeError(last)


def img_part(path):
    with open(path, 'rb') as f:
        return {'inlineData': {'mimeType': 'image/png', 'data': base64.b64encode(f.read()).decode()}}


def paint(name, half):
    os.makedirs(RAW, exist_ok=True)
    if half == 'day':
        if name == 'blaster-grey':
            src = raw_path('blaster-color', 'day')
            parts = [img_part(src), {'text': GREY + NEVER}]
        else:
            parts = [{'text': STYLE + LAYOUT + PLATES[name] + ' ' + NEVER}]
    elif name == 'blaster-grey':
        # the grey night is the COLOUR night with its colour forgotten — painting it from the
        # grey day with the night prompt brought warm lamplight back into the unspelt world
        src = raw_path('blaster-color', 'night')
        parts = [img_part(src), {'text': GREY + 'It is night: keep the night sky and the '
                                 'moon, but there is no warm light anywhere, only cold grey '
                                 'moonlight. ' + NEVER}]
    else:
        src = raw_path(name, 'day')
        parts = [img_part(src), {'text': NIGHT + NEVER}]
    png, model = call(parts)
    with open(raw_path(name, half), 'wb') as f:
        f.write(png)
    return f'OK {name}-{half} {len(png) // 1024}KB via {model}'


def webp(names=None):
    from PIL import Image
    os.makedirs(OUT, exist_ok=True)
    for f in sorted(os.listdir(RAW)):
        if not f.endswith('.png'):
            continue
        stem = f[:-4]
        if names and stem.rsplit('-', 1)[0] not in names:
            continue
        im = Image.open(os.path.join(RAW, f)).convert('RGB')
        im = im.resize((1600, round(1600 * im.height / im.width)), Image.LANCZOS)
        dst = os.path.join(OUT, stem + '.webp')
        for q in (80, 74, 68, 62, 56, 50):
            im.save(dst, 'WEBP', quality=q, method=6)
            if os.path.getsize(dst) <= 200 * 1024:
                break
        print(stem, im.size, os.path.getsize(dst) // 1024, 'KB q', q, flush=True)


if __name__ == '__main__':
    args = sys.argv[1:]
    if not args:
        print(len(ORDER), 'plates:', ' '.join(ORDER)); sys.exit(0)
    if args[0] == '--webp':
        webp(args[1:] or None); sys.exit(0)
    want = ORDER if args == ['--all'] else args
    only = os.environ.get('ART_ONLY')
    for n in want:
        for half in ('day', 'night'):
            if only and half != only:
                continue
            if args == ['--all'] and os.path.exists(raw_path(n, half)):
                continue
            try:
                print(paint(n, half), flush=True)
            except Exception as e:
                print(f'ERR {n}-{half} {e}', flush=True)
