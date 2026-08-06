#!/usr/bin/env python3
"""One painted board per act of Bizzy and the Great Unspelling.

The saga's chapter select was a stacked list of rectangular buttons under a
scenery banner — six sections, thirty-one cards, no geography. The World Atlas
walks its stops along a painted region map, and the saga is the more cinematic
of the two; it should not be the one that looks like a settings page.

So each of the six acts gets its own bird's-eye board in the same painted
language as the Atlas act maps, and for the same reason: the app strokes its own
route across the picture and hangs the chapter medallions off it, so what the art
has to supply is ROOM — an open serpentine band of ground with the scenery
pushed into the pockets between the sweeps.

Two differences from the Atlas maps. The saga is a story with a villain in it,
so each board carries the Unspelling's damage — letters coming loose from the
world, colour draining where it has passed — and each board ends at its act's
boss, so the far end of the band holds something the child can see coming.

Usage:  saga-maps.py                 list the slots
        saga-maps.py saga-act1 ...   generate the named slots
        saga-maps.py --all           generate whatever is missing
        saga-maps.py --jpeg          resize every PNG to a served JPEG
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
         'Family-friendly children\'s book art, warm and inviting, adventurous rather than '
         'frightening. Full-bleed edge to edge, no border, no frame, and ABSOLUTELY NO TEXT, '
         'NO LETTERING, NO LABELS, NO NUMBERS, NO WRITING, NO SIGNAGE, NO PLACE NAMES anywhere '
         'in the image — every sign, banner, book and screen in the picture is BLANK. '
         'No people, no characters, no faces, no insects with faces. ')

# Same geometry contract as the Atlas boards: the route is the app's, so the
# medallions can never drift off it however the painter read the brief.
GEO = ('Composition, follow exactly: this is a bird\'s-eye region map seen from high above at a '
       'slight three-quarter angle. A wide OPEN BAND of plain walkable ground — bare earth, short '
       'grass, sand, worn stone or bare floor — must sweep across the picture in a long lazy S: '
       'entering at the BOTTOM-LEFT, running right across the lower third, curving up and doubling '
       'back to the LEFT across the middle, then curving up again and running right to leave at the '
       'TOP-RIGHT. That band must stay clear and uncluttered along its whole length, with nothing '
       'tall standing in it. All of the scenery, buildings and detail sit in the pockets BETWEEN the '
       'sweeps of the band and around the edges of the picture. ')

# The saga's own note: the villain has been through here.
UNSPELL = ('Somewhere in the picture, well off the open band, show the Unspelling\'s damage: a small '
           'patch where the colour has drained to grey and a few blank pale tiles have come loose and '
           'float in the air like fallen scales. Keep the tiles COMPLETELY BLANK with nothing printed '
           'on them. Keep this damage small and secondary — the world is still beautiful. ')

# Every act ends at its boss, and the child should be able to see it coming.
def END(what):
    return ('At the very TOP-RIGHT of the picture, where the open band leaves the frame, place ' +
            what + ' — larger and more imposing than anything else in the scene, clearly the place '
            'this road is leading to. ')

DAY = 'Warm golden-hour light, long soft shadows, gentle mist in the low ground. '
DUSK = ('Cold blue dusk over the whole scene with warm lantern or firelight pooling inside the '
        'scenery, low mist, restrained palette. ')
NIGHT = ('Deep night under a clear starfield, cold moonlight over the ground and warm gold glow '
         'inside the scenery, restrained night palette with gold accents. ')

ACTS = {
    # I · The Scattering — meadow into the hive gates, seven chapters
    'saga-act1': DAY + (
        'A rolling summer flower meadow rising towards a great golden honeycomb hive built into a '
        'hillside. In the pockets around the open band: cherry-blossom trees in bloom, tall '
        'candy-swirl flowers, clusters of red-capped mushrooms, a little stone well, a wooden '
        'race-track gantry, drifting petals. ') + END(
        'a huge fortified gateway of hexagonal honey-gold stone set into the hillside, its doors '
        'shut, warm amber light leaking from the seams'),

    # II · The Show Must Go On — stage and carnival, the marquee going dark
    'saga-act2': DUSK + (
        'A grand theatre district and fairground seen from above. In the pockets around the open '
        'band: a red-and-gold proscenium stage with heavy velvet curtains, footlights in a row, '
        'a striped carnival tent, a small carousel, coils of rope and sandbags, a wardrobe rail of '
        'costumes, scattered blank playbills. Half the lanterns have gone out on one side. ') + END(
        'an enormous dark orchestra pit under a towering blank marquee arch, one cold spotlight '
        'stabbing down into it and a conductor\'s empty podium at its centre'),

    # III · The Scrambled Sky — constellations come loose
    'saga-act3': NIGHT + (
        'A floating archipelago of cloud-islands high above the world, joined by the open band of '
        'pale moonlit stone. In the pockets around the band: a brass orrery of turning rings, drifting '
        'star-nets, small observatory domes, comet trails frozen mid-arc, glowing nebula mist in '
        'violet and teal, loose stars sitting on the ground like fallen lanterns. ') + END(
        'a colossal serpent constellation coiled across the sky, drawn only in lines of white stars '
        'and dark space, its head lowered towards the end of the road'),

    # IV · Into the Wilds — dojo, lab, pond, lotus, forest
    'saga-act4': DAY + (
        'Three small wild lands joined by one road, seen from above: a tiled dojo courtyard with '
        'raked sand and a bamboo grove, a hillside laboratory of copper pipes and glass flasks with '
        'coloured smoke, and a lotus pond with wooden walkways and lily pads. In the pockets around '
        'the open band: bamboo, stone lanterns, bubbling glassware, dragonflies, a mossy footbridge, '
        'a dense green thicket at the far side. ') + END(
        'a vast overgrown garden gate swallowed by a single enormous thorned vine, its leaves dark '
        'and its mouth of tangled briars open onto shadow'),

    # V · The Arcade's Heart — neon, circuitry, the last gate
    'saga-act5': NIGHT + (
        'The inside of a giant arcade cabinet seen from above, a neon circuit-board city. The open '
        'band is a wide dark circuit trace of bare board. In the pockets around it: rows of glowing '
        'arcade cabinets with BLANK screens, neon tubing in magenta and cyan, stacked speaker '
        'cabinets, coin hoppers spilling tokens, a racetrack of light, a wall of flickering firewall '
        'panels in orange. ') + END(
        'an immense boss cabinet three storeys tall, its screen a blank black void ringed with red '
        'warning lights, cables running out of it across the floor like roots'),

    # VI · Homecoming — the Unspelling broken, the hive rebuilt
    'saga-act6': DAY + (
        'The long flyway home over patchwork fields towards the golden hive, seen from above at '
        'dawn. In the pockets around the open band: hedgerows and hay bales, a windmill, flowering '
        'orchards, streamers of morning cloud, the honeycomb hive being rebuilt with fresh wax, '
        'small ladders and scaffolds against it, jars of nectar set out in rows. The colour is '
        'coming back into the land in a visible sweep. ') + END(
        'the great hive itself restored and glowing from within, its hexagonal windows lit warm '
        'gold, garlands of flowers strung across its face'),
}

SLOTS = {k: (GEO + v + UNSPELL, '16:9') for k, v in ACTS.items()}


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
    """PNG -> a 1376px JPEG the app can serve, same size as every other board."""
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
