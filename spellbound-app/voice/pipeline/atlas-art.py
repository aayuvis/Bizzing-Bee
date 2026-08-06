#!/usr/bin/env python3
"""Painted art for the Word Atlas map and the Library tiles.

The Atlas is called an atlas, so it should be one: a single illustrated world map
whose regions ARE the acts of the journey, with a road running through them. The
map is generated once at a size the app can serve (1600px wide, ~250KB), and the
clickable regions are then placed against what the painter actually drew — which
means looking at the result and tuning coordinates, not hoping a prompt lands a
landmark on a pixel.

Library tiles get their own painted headers rather than a gradient and an icon.

Usage:  atlas-art.py                 list the slots
        atlas-art.py atlas-map ...   generate the named slots
        atlas-art.py --all           generate whatever is missing
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

STYLE = ('Painterly Japanese anime illustration, soft cel shading with two-tone shadows, '
         'volumetric light, rich colour grading, in the spirit of Studio Ghibli backgrounds. '
         'Family-friendly children\'s book art, warm and inviting. Full-bleed edge to edge, '
         'no border, no frame, and ABSOLUTELY NO TEXT, NO LETTERING, NO LABELS anywhere. ')

# A bird's-eye fantasy continent. The regions are named so the painter gives each
# one a distinct silhouette; the road is specified because the app draws its route
# markers along it.
ATLAS = (
    'A hand-painted bird\'s-eye fantasy world map of one whole continent, seen from high above at a '
    'slight three-quarter angle, floating on a soft cream ocean. A single golden dirt road enters at the '
    'BOTTOM-LEFT corner and winds in a long lazy S all the way to the TOP-RIGHT corner, passing through '
    'nine clearly separated landmark regions spaced evenly along it, each region a distinct island-like '
    'cluster of scenery with generous empty ground between them: '
    '(1) bottom-left, a green flower meadow with cherry-blossom trees, giant candy-swirl flowers and red '
    'mushrooms; (2) a canyon of enormous stacked books and towering bookshelves with wisteria; '
    '(3) a marble Roman forum of columns, arches and laurel garlands on warm stone; '
    '(4) floating pastel crystals and hexagonal storm clouds with one lightning bolt; '
    '(5) centre, a brass engine room of huge interlocking gears, copper pipes and drifting steam, half '
    'sunk into a hillside; (6) a teal sea strait with a striped lighthouse on a headland and a small '
    'sailboat; (7) a whimsical junkyard of friendly mounds of scrap, tires, springs and a crooked signpost; '
    '(8) origami paper mountains with crisp folds and gliding paper cranes; '
    '(9) top-right, a grand theatre stage with crossing spotlight beams and deep red curtains, built into '
    'a cliff. Small drifting letter tiles float over the whole map like confetti. A decorative compass '
    'rose in one empty ocean corner. Warm golden-hour light across the whole continent, gentle mist in '
    'the low ground between regions. Painted, tactile, storybook-atlas feel.'
)

LIB = {
    'lib-concepts': 'A cosy reading nook inside a canyon of enormous stacked books, warm lamplight, floating pages, '
                    'a honeycomb of glowing hexagonal shelves each holding one open book. No characters.',
    'lib-themes': 'A wide overhead spread of many small themed worlds side by side like a patchwork quilt — a coral reef, '
                  'a spice market, a night sky, a violin, a pyramid, a rose garden — stitched together with golden thread. No characters.',
    'lib-vocab': 'A pair of enormous ornate brass scales in soft light, one pan holding a single glowing carved word-block, '
                 'the other holding a small floating picture of its meaning, balanced perfectly. No characters.',
    'lib-figurative': 'A whimsical scene where sayings have come literally true in mid-air: a raining cat and dog made of cloud, '
                      'a silver lining on a cloud, a bull inside a china shop, all floating over a pastel meadow. No characters.',
    'lib-trivia': 'A grand quiz hall of warm wood and brass, a spotlit lectern, a wall of glowing question-mark lanterns, '
                  'floating cards showing tiny globes and laurel wreaths. No characters.',
    'lib-ipa': 'A close, warm still life of an antique brass microphone on a velvet cloth, with delicate gold sound waves '
               'rippling through the air around it and a scattering of small blank polished wooden tiles beside it. '
               'The tiles are COMPLETELY BLANK with nothing carved or printed on them. No characters, no writing, '
               'no letters, no symbols of any alphabet anywhere in the image.',
    'lib-typing': 'A cheerful chunky mechanical keyboard seen at a low three-quarter angle, keys glowing warm amber, letter tiles '
                  'leaping up off the keys in a joyful arc, soft workshop light. No characters.',
}

SLOTS = {'atlas-map': (ATLAS, '16:9')}
for k, v in LIB.items():
    SLOTS[k] = (v, '3:2')


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


# The Advanced Rounds get their own map: the same continent language at dusk, five
# regions, so the locked half of the journey reads as somewhere you have not been yet.
ATLAS_ADV = (
    'A hand-painted bird\'s-eye fantasy world map of a smaller, harsher continent at dusk, seen from high '
    'above at a slight three-quarter angle, floating on a deep indigo ocean. A pale stone road enters at the '
    'BOTTOM-LEFT and winds to the TOP-RIGHT through five clearly separated landmark regions spaced evenly '
    'along it, with generous empty ground between them: (1) bottom-left, a military proving ground of tall '
    'banners on poles, tents and worn earth lit by lanterns; (2) a still grey-violet fog sea with a red '
    'lantern buoy and a distant lighthouse halo; (3) centre, a vast junkyard of scrap mounds, tires and a '
    'crooked signpost under a bruised sky; (4) a far shore of teal water with a striped lighthouse and a '
    'small ship at anchor; (5) top-right, a brass word-factory of huge gears, chimneys and drifting steam, '
    'windows glowing amber. Cold moonlight over the whole continent, warm lantern glow inside each region, '
    'low mist between them. A decorative compass rose in one empty ocean corner. Painted, tactile, '
    'storybook-atlas feel, restrained dusk palette.'
)
SLOTS['atlas-adv'] = (ATLAS_ADV, '16:9')


# The champions' continent: the third and last map, unlocked at the top of the
# Advanced Rounds. Five regions, night, and a stadium at the end of the road.
ATLAS_ULTRA = (
    'A hand-painted bird\'s-eye fantasy world map of a small dramatic island continent at night under a '
    'clear starfield, seen from high above at a slight three-quarter angle, floating on a black-violet '
    'ocean lit by moonlight. A road of pale gold light enters at the BOTTOM-LEFT and climbs to the '
    'TOP-RIGHT through five clearly separated landmark regions spaced evenly along it, with generous dark '
    'ground between them: (1) bottom-left, a torchlit training yard of stone rings and racked banners; '
    '(2) a library tower of black marble with tall lit windows and floating pages; (3) centre, a vast '
    'crucible of molten gold in a rock basin, sparks rising; (4) a cliff observatory with a brass telescope '
    'aimed at the stars; (5) top-right, a floodlit championship stadium built into the summit, a single '
    'spotlit lectern at its centre, confetti in the air. A laurel wreath motif worked into one empty ocean '
    'corner. Cold starlight over the whole island, warm gold glow inside each region, thin mist in the low '
    'ground. Painted, tactile, storybook-atlas feel, restrained night palette with gold accents.'
)
SLOTS['atlas-ultra'] = (ATLAS_ULTRA, '16:9')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    want = sys.argv[1:]
    if not want:
        print('slots:', ' '.join(SLOTS)); sys.exit(0)
    if want == ['--all']:
        want = [s for s in SLOTS if not os.path.exists(f'{OUT}/{s}.png') and not os.path.exists(f'{OUT}/{s}.jpg')]
        print(len(want), 'to generate', flush=True)
    for s in want:
        if s in SLOTS:
            print(gen(s), flush=True)
