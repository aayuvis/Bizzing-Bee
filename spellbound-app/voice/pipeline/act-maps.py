#!/usr/bin/env python3
"""One painted sub-map per act.

The Atlas has three continent maps. Tapping a region used to open a 880x244
scenery STRIP with the stops laid along it — the same strip the act banner used,
which is why two acts that share a world looked identical (roots and factory are
both the engine; junkyard and liars are both the junkyard).

Every act and expedition gets its own map now: 15 acts plus the 5 Ultra
landmarks. Each is a bird's-eye region map in the same painted language as the
continent maps, and each is prompted to keep an OPEN BAND of walkable ground
across the middle, because the app draws its own route across it and places the
stops along that route. The scenery clusters around the edges; the road is the
app's, so the pins can never drift off it however the painter interpreted the
brief.

Usage:  act-maps.py                 list the slots
        act-maps.py map-meadow ...  generate the named slots
        act-maps.py --all           generate whatever is missing
        act-maps.py --jpeg          resize every PNG to a served JPEG
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

# ---- the nine acts of the Honey continent ----
ACTS = {
    'meadow': DAY + 'A rolling green flower meadow. In the pockets around the open band: cherry-blossom '
              'trees in full bloom, giant candy-swirl flowers on tall stems, clusters of red-capped '
              'mushrooms, a little stone well, drifting petals and a few fat bumblebees.',
    'library': DAY + 'A canyon made of enormous stacked books. Around the open band: cliffs of towering '
               'bookshelves, colossal leather volumes leaning against each other, wisteria spilling '
               'over the shelves, brass reading lamps on iron stands, loose pages drifting on the air.',
    'forum': DAY + 'A ruined marble Roman forum on warm honey-coloured stone. Around the open band: rows '
             'of fluted columns, a broken triumphal arch, laurel garlands, a dry fountain, cypress '
             'trees, fallen capitals softened by moss.',
    'storm': 'Bright storm light, shafts of sun between towering clouds, cool pastel palette with warm '
             'rim light. A high plateau in the sky. Around the open band: floating pastel crystals of '
             'every size, hexagonal storm clouds stacked like slabs, one clean fork of lightning, '
             'sheets of falling rain lit from behind, small islands of wet rock.',
    'roots': DAY + 'A brass engine room half sunk into a green hillside. Around the open band: huge '
             'interlocking gears, copper pipework, riveted boilers venting steam, glass pressure '
             'dials, ivy climbing the machinery, one great flywheel turning.',
    'strait': DAY + 'A wide teal sea strait seen from the headland. Around the open band: a red-and-white '
              'striped lighthouse on a rocky point, a small sailboat heeling in the wind, fishing '
              'nets on frames, tide pools, wheeling gulls, a wooden jetty on stilts.',
    'junkyard': DAY + 'A cheerful, friendly junkyard. Around the open band: soft mounds of colourful '
                'scrap, stacks of tires, coiled springs, a crooked signpost with blank arrow boards, '
                'an old bathtub full of flowers, a rusted bicycle, dandelions everywhere.',
    'sprints': DAY + 'A range of origami paper mountains with crisp visible folds. Around the open band: '
               'folded paper peaks in pastel papers, gliding paper cranes, a paper forest, a stream '
               'of blue folded paper, tiny paper boats, scissors and a spool of thread left behind.',
    'stage': 'Deep theatre light: warm spotlights cutting through haze against near-black wings. A grand '
             'theatre built into a cliff. Around the open band: heavy deep-red velvet curtains, '
             'crossing spotlight beams, gilded proscenium carving, tiers of empty plush seats, a '
             'brass footlight row, a rope-and-pulley fly system.',
}

# ---- the six expeditions of the Advanced Rounds ----
EXPS = {
    'proving': DUSK + 'A military proving ground on worn earth. Around the open band: tall heraldic '
               'banners on poles, rows of canvas tents, straw archery targets, weapon racks, iron '
               'braziers burning, a low stone ring.',
    'greysea': DUSK + 'A still grey-violet fog sea. Around the open band: glassy water fading into fog, '
               'a red lantern buoy, the halo of a distant lighthouse, black rocks breaking the '
               'surface, a rotting mooring post, the ribs of a wrecked hull.',
    'liars': DUSK + 'A vast junkyard under a bruised sky. Around the open band: mounds of grey scrap, '
             'towers of tires, a crooked signpost with blank boards, a dead crane, oil drums, '
             'thistles growing through metal.',
    'grandtrunk': DUSK + 'The Grand Trunk Road across the northern plains of South Asia at dusk. Around '
                  'the open band: an avenue of enormous banyan trees with hanging aerial roots, '
                  'carved milestone pillars that are BLANK and unlettered — smooth bare stone with absolutely no writing, no script, no Devanagari and no characters of any alphabet on them — a bullock cart resting '
                  'under a tree, a plain domed rest-house for travellers, a stepwell, kites flying far off, a '
                  'temple spire and a minaret on the horizon.',
    'farflung': DUSK + 'A far shore of teal water at the edge of the world. Around the open band: a '
                'striped lighthouse on a headland, a tall ship at anchor with furled sails, a stone '
                'harbour wall, crab pots stacked, driftwood, a beached rowboat.',
    'factory': DUSK + 'A brass word-factory built into a cliff. Around the open band: towering gears, '
               'tall chimneys venting steam, catwalks and ladders, riveted vats, windows glowing '
               'amber, conveyor belts carrying small BLANK polished wooden tiles with nothing '
               'printed on them.',
}

# ---- the five Ultra landmarks ----
ULTRA = {
    'uproving': NIGHT + 'A torchlit champions\' training yard. Around the open band: rings of standing '
                'stones, racked banners, iron torch stands burning, weighted stone lifting blocks, '
                'a whetstone wheel.',
    'ulibrary': NIGHT + 'A library tower of black marble. Around the open band: the tower with tall lit '
                'windows, flying buttresses, floating pages caught in the updraught, iron book '
                'carts, a spiral outer stair.',
    'ucrucible': NIGHT + 'A crucible of molten gold in a rock basin. Around the open band: the glowing '
                 'basin throwing sparks upward, black volcanic rock, cooling channels of dull gold, '
                 'iron tongs and moulds, heat shimmer.',
    'uobservatory': NIGHT + 'A cliff observatory. Around the open band: a great brass telescope on a '
                    'mount aimed at the stars, a copper dome, an orrery of turning rings, star '
                    'charts pinned on boards (BLANK, no writing), a railing over the drop.',
    'uchampionship': NIGHT + 'A floodlit championship stadium built into a summit. Around the open band: '
                     'banks of floodlights on towers, tiers of seats, a single spotlit lectern on a '
                     'round dais, confetti in the air, laurel wreaths on stands, a stone archway in.',
}

SLOTS = {}
for k, v in ACTS.items():
    SLOTS['map-' + k] = (GEO + v + ' ' + CACHE, '16:9')
for k, v in EXPS.items():
    SLOTS['map-' + k] = (GEO + v + ' ' + CACHE, '16:9')
for k, v in ULTRA.items():
    SLOTS['map-' + k] = (GEO + v + ' ' + CACHE, '16:9')


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
