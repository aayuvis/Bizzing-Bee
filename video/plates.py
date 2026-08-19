#!/usr/bin/env python3
"""Illustrated plates for the episode-1 film, for the shots no archive could fill.

    plates.py            list the slots and what is already on disk
    plates.py <slug>...  generate the named slots
    plates.py --all      generate whatever is missing

TWO RULES THIS FILE EXISTS TO ENFORCE, both of them about honesty rather than taste.

1. **No generated picture of a real person, ever.** Not Marie Bolden, not Frank Neuhauser,
   not Edna Stover. A synthesised face presented as a historical figure is a fabrication
   dressed as a document, and on a children's history channel it is unrecoverable. Where a
   person has no free photograph, the film carries them TYPOGRAPHICALLY. There is no slot
   below for a face and there must never be one.

2. **Nothing here may read as a photograph.** Every plate is openly an illustration —
   inked line, flat inks, visible drawing. That is not a stylistic preference; it is what
   stops a generated image being mistaken for archive footage. Anything photoreal would be
   a fake primary source sitting next to four real Library of Congress photographs, and the
   viewer has no way to tell which is which.

Register is the book series' `mature` style (see CLAUDE.md), not the app's Ghibli-painterly
one — this is 1908 social history, and the children's-picture-book look would misread the
subject badly.
"""
import base64, json, os, ssl, sys, time, urllib.request
import concurrent.futures as cf

KEY = open(os.environ.get('GKEY_FILE', '/root/.gkey')).read().strip()
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'images')
MODEL = os.environ.get('NB_MODEL', 'gemini-3-pro-image')
CTX = ssl.create_default_context(cafile='/root/.ccr/ca-bundle.crt')

# Mature graphic-novel register: hand-inked, few flat inks, generous negative space.
STYLE = (
    'Hand-inked editorial illustration in a mature graphic-novel register. Fine, even, '
    'confident ink line. Three or four flat inks only, deep indigo and warm gold and paper '
    'cream, darks used only where the drawing needs weight. Generous negative space. '
    'Historical American subject, drawn with restraint and dignity, never whimsical, never '
    'cartoonish, never cute. Clearly a DRAWING and never photographic. '
    'ABSOLUTELY NO TEXT, NO LETTERING, NO LABELS, NO NUMBERS, NO SIGNAGE, NO WRITING '
    'anywhere in the image — every sign, banner, book cover and poster is BLANK. '
    'No recognisable individual faces: any figures are small, distant, turned away or in '
    'silhouette. No modern objects. The image must run FULL BLEED to all four edges: NO paper border, NO white or cream margin, NO mount, NO frame, NO torn-paper edge, NO drop shadow around the picture, NO vignette. The artwork touches every edge of the canvas. '
)

SLOTS = {
    # §01 cold open — a period theatre. NOT the Hippodrome: we have no reference for that
    # building and captioning a drawing as a named real venue would be the same fabrication
    # the header forbids. It is "a theatre in 1908", and the narration never claims more.
    'plate-theatre-stage': (
        'The interior of a large American theatre in 1908, seen from the back of the stalls '
        'looking towards the stage. A single empty pool of light on bare boards centre stage. '
        'Tiers of balconies curve away into darkness, the audience only suggested as dim '
        'shapes. Vast, hushed, and slightly intimidating. The stage light is the brightest '
        'thing in the picture by far.', '16:9'),

    'plate-theatre-spot': (
        'Close on bare wooden stage boards under a single circle of hard overhead light, seen '
        'from slightly above. Nobody in the picture. The boards are scuffed and worn. Deep '
        'darkness all around the lit circle.', '16:9'),

    # §03 — the frontier spelling school
    'plate-schoolhouse-night': (
        'A small wooden one-room American schoolhouse alone on open prairie at night, its '
        'windows glowing warm gold, deep blue snow-lit land around it and a wide starry sky '
        'above. A few horse-drawn buggies waiting outside. Distant, quiet, inviting.', '16:9'),

    'plate-schoolroom-interior': (
        'The inside of a crowded 19th-century American one-room schoolhouse in the evening, '
        'lit by oil lamps. Rows of packed wooden benches, adults and children together, all '
        'facing one end of the room where a single small figure stands. Everyone seen from '
        'behind or in silhouette, no faces readable. Warm lamplight, deep shadows.', '16:9'),

    # §05 — why a newspaper invented the national bee
    'plate-pressroom': (
        'The pressroom of a large American newspaper in the 1920s. Enormous cast-iron rotary '
        'printing presses running, paper webs streaming through them, a few small figures in '
        'shirtsleeves and aprons dwarfed by the machinery, seen from behind. Steam and ink '
        'haze in the air, hard shafts of light from high windows.', '16:9'),

    # §08 — cerise
    'plate-shopwindow-1920s': (
        'A 1920s American department-store window at dusk, seen from the pavement outside. '
        'Dress forms displaying drop-waist evening dresses, one of them a vivid cherry-pink '
        'that is the brightest colour in the picture. Plate glass with a faint reflection of '
        'the street. Elegant, commercial, modern for its moment. No people.', '16:9'),

    # §09 — abrogate
    'plate-prohibition': (
        'A stark 1920s American courtroom or civic hall interior, empty: heavy panelled '
        'timber, tall windows, rows of vacant seats, a raised bench at one end. Cold daylight '
        'raking across the floor. Institutional, sober, entirely unoccupied.', '16:9'),

    # §04 — the medal, for the A7 animation. An object, not a replica of a specific artefact.
    'plate-medal': (
        'A single round gold medal on a plain dark indigo ground, lit from the upper left, '
        'drawn straight on and centred with a lot of empty space around it. The medal face is '
        'entirely BLANK — smooth polished metal with a plain raised rim and no design, no '
        'lettering, no engraving, no portrait of any kind. A simple ribbon above it.', '1:1'),

    # §12 — the closing return
    'plate-empty-stage-dawn': (
        'A large empty American theatre auditorium in BRIGHT ORDINARY DAYLIGHT with all the '
        'house lights ON and the stage completely bare, flat and unlit. Everything evenly '
        'and plainly lit like a room being cleaned in the morning — no spotlight anywhere, '
        'no dramatic shadow, no darkness. Empty seats, dust in the air. Calm and everyday.', '16:9'),
}


def gen(slug, retries=4):
    prompt, aspect = SLOTS[slug]
    body = {'contents': [{'parts': [{'text': STYLE + prompt}]}],
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
                    open(f'{OUT}/{slug}.png', 'wb').write(raw)
                    return f'OK    {slug:26} {len(raw)//1024}KB'
            fr = d.get('candidates', [{}])[0].get('finishReason', '?')
            return f'NOIMG {slug:26} finish={fr}'
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 503) and attempt < retries - 1:
                time.sleep(20 * (attempt + 1)); continue
            return f'ERR   {slug:26} HTTP {e.code}'
        except Exception as e:
            if attempt < retries - 1: time.sleep(10); continue
            return f'ERR   {slug:26} {type(e).__name__}'
    return f'ERR   {slug:26} exhausted'


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('-')]
    if '--all' in sys.argv:
        args = [s for s in SLOTS if not os.path.exists(f'{OUT}/{s}.png')]
    if not args:
        for s in SLOTS:
            have = os.path.exists(f'{OUT}/{s}.png')
            print(f"  {'HAVE' if have else '    '}  {s}")
        sys.exit(0)
    with cf.ThreadPoolExecutor(max_workers=3) as ex:
        for r in ex.map(gen, args): print(r)
