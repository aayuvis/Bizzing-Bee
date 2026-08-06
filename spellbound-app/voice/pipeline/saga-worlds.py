#!/usr/bin/env python3
"""One painted play-field backdrop per saga world.

The engines draw their gameplay onto a canvas over a backdrop, and that backdrop
was the flat vector WORLD_ART plate — a few dozen filled paths. Next to the
painted act boards the child has just walked across, it reads as a diagram. So
each world gets a painting.

A play-field backdrop is NOT a map. Its job is to sit UNDER a maze, a snake, a
flappy corridor or a falling-letters field and stay legible while sprites move
over it, so every one of these is prompted the same way: straight-on, deep,
uncluttered through the middle, with the detail pushed to the top and the bottom
edges, and painted a stop or two darker and less saturated than the act boards so
a gold bee reads against it at a glance.

Usage:  saga-worlds.py                 list the slots
        saga-worlds.py sgw-meadow ...  generate the named slots
        saga-worlds.py --all           generate whatever is missing
        saga-worlds.py --jpeg          resize every PNG to a served JPEG
"""
import base64
import json
import os
import ssl
import sys
import time
import urllib.request

KEY = open(os.environ.get('GKEY_FILE', '/root/.gkey')).read().strip()
OUT = '/home/user/Bizzing-Bee/spellbound-app/app-art'
MODEL = os.environ.get('NB_MODEL', 'gemini-3.1-flash-image')
CTX = ssl.create_default_context(cafile='/root/.ccr/ca-bundle.crt')

STYLE = ('Painterly Japanese anime illustration, soft cel shading, volumetric light, in the spirit '
         'of Studio Ghibli backgrounds. Family-friendly children\'s book art. Full-bleed edge to '
         'edge, no border, no frame, and ABSOLUTELY NO TEXT, NO LETTERING, NO LABELS, NO NUMBERS, '
         'NO WRITING, NO SIGNAGE anywhere — every sign, screen, book and banner in the picture is '
         'BLANK. No people, no characters, no faces, no insects. ')

# The contract that makes a painting usable as a play field.
FIELD = ('Composition, follow exactly: a straight-on view into depth, like a stage set seen from '
         'the audience. The MIDDLE of the picture — the whole central band, top to bottom through '
         'the centre — must be OPEN, simple and uncluttered: far distance, haze, sky, still water '
         'or plain ground, with nothing detailed or high-contrast in it. All of the interesting '
         'detail sits along the TOP edge and the BOTTOM edge of the picture only. The palette is '
         'deliberately RESTRAINED and a little darker than daylight — deep, soft, low-contrast, '
         'atmospheric — so that small bright objects moving across the middle of this picture would '
         'stand out sharply against it. Nothing in the image is bright yellow or gold. ')

WORLDS = {
    'meadow': 'A deep summer flower meadow at golden hour. Along the bottom edge: tall grasses, '
              'clover and poppies in silhouette. Along the top edge: the underside of a cherry tree '
              'in blossom and a soft warm sky. The middle is open hazy field receding to a far hedge.',
    'sky': 'High open sky above a sea of cloud at dawn. Along the bottom edge: the tops of towering '
           'cumulus catching first light. Along the top edge: thin cirrus and the last stars. The '
           'middle is clear, deep, empty air.',
    'hive': 'The inside of a great honeycomb hall, seen straight on. Along the bottom edge: waxen '
            'hexagonal cells and a comb floor. Along the top edge: the vaulted comb ceiling with '
            'warm light seeping between the cells. The middle is deep dim golden-brown air.',
    'stage': 'A grand theatre seen from the stage looking out. Along the bottom edge: the lip of the '
             'stage and a row of dimmed footlights. Along the top edge: heavy velvet curtains and a '
             'rigging bar of lamps. The middle is the dark empty auditorium receding into shadow.',
    'carnival': 'A fairground at dusk seen straight on. Along the bottom edge: trodden grass, rope '
                'and tent pegs. Along the top edge: strings of small lanterns and the curve of a '
                'big top. The middle is open, misty fairground receding to a far ferris wheel in '
                'silhouette.',
    'cosmos': 'Deep space seen straight on. Along the bottom edge: the dark curve of a planet\'s '
              'limb. Along the top edge: a slow band of violet and teal nebula. The middle is '
              'clear, dark, star-scattered void.',
    'dojo': 'A training hall seen from the mat looking out through open shoji doors. Along the '
            'bottom edge: worn tatami and a raked sand border. Along the top edge: dark beams and '
            'a paper ceiling. The middle is the open doorway onto a misty bamboo grove.',
    'lab': 'A quiet laboratory seen straight on. Along the bottom edge: a workbench of copper pipes '
           'and glass flasks in shadow. Along the top edge: a rack of dim bulbs and coiled tubing. '
           'The middle is deep, cool, empty air with faint drifting vapour.',
    'pond': 'A still lily pond at blue hour, seen straight on across the water. Along the bottom '
            'edge: lily pads and the near bank in silhouette. Along the top edge: overhanging '
            'willow. The middle is flat dark water reflecting a pale sky.',
    'lotus': 'A wide lotus lake in soft dusk. Along the bottom edge: broad lotus leaves and closed '
             'buds. Along the top edge: distant hills and low mist. The middle is calm open water.',
    'forest': 'Deep old woodland seen straight on down a clearing. Along the bottom edge: moss, '
              'ferns and fallen logs. Along the top edge: a dense dark canopy with light shafts '
              'coming through. The middle is open misty clearing receding into the trees.',
    'arcade': 'The inside of a dim arcade at night. Along the bottom edge: a carpeted floor and the '
              'bases of cabinets. Along the top edge: a low ceiling with dark neon tubing. The '
              'middle is a deep, empty aisle receding into blue shadow.',
    'flyway': 'A long river valley from the air at dawn. Along the bottom edge: patchwork fields and '
              'hedgerows in shadow. Along the top edge: a soft banded sky. The middle is open hazy '
              'air over a winding river.',
    'homecoming': 'Rolling farmland at sunrise with a great honeycomb hive far off. Along the bottom '
                  'edge: hay bales and a stone wall. Along the top edge: streamers of morning cloud. '
                  'The middle is open misty fields with the hive small on the horizon.',
}

SLOTS = {'sgw-' + k: (FIELD + v, '16:9') for k, v in WORLDS.items()}


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
    """PNG -> a 1200px JPEG. Smaller than the boards: this one sits behind moving
       sprites at 60fps and is never looked at directly."""
    from PIL import Image
    for s in SLOTS:
        src = f'{OUT}/{s}.png'
        if not os.path.exists(src):
            continue
        im = Image.open(src).convert('RGB')
        im = im.resize((1200, round(1200 * im.height / im.width)), Image.LANCZOS)
        for q in (80, 74, 68, 62):
            im.save(f'{OUT}/{s}.jpg', 'JPEG', quality=q, optimize=True, progressive=True)
            if os.path.getsize(f'{OUT}/{s}.jpg') <= 150 * 1024:
                break
        print(s, im.size, os.path.getsize(f'{OUT}/{s}.jpg') // 1024, 'KB', flush=True)
        os.remove(src)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    want = sys.argv[1:]
    if not want:
        print(len(SLOTS), 'slots:', ' '.join(SLOTS)); sys.exit(0)
    if want == ['--jpeg']:
        jpeg(); sys.exit(0)
    if want == ['--all']:
        want = [s for s in SLOTS if not os.path.exists(f'{OUT}/{s}.jpg')]
        print(len(want), 'to generate', flush=True)
    for s in want:
        if s in SLOTS:
            print(gen(s), flush=True)
