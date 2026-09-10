#!/usr/bin/env python3
"""One full-page painted plate per SECTION divider in the poems companion.

WHY
  The section openers were a centred title over a flat gradient with the book's
  cartoon mascot stamped underneath and a scenery band along the foot. In a book
  whose poem pages are each carrying a bespoke painting, that read as a
  placeholder — and the mascot in particular is a sprite from the eight-year-old
  half of the library, which is not who reads Ozymandias.

  So each part now gets a full-bleed plate of its own: the divider IS the
  artwork, and the part number, the title and the standfirst sit on it.

KEYING
  'sc-' + the section key used in books/mkbooks.js. Eight parts:
  shakespeare, speeches, epics, sonnets, haiku, limericks, byheart, prose.
  Keyed on the section NAME, never on its position, for the same reason the
  poem plates are keyed on title — reordering the arc must not reassign the art.

SHAPE
  Portrait 3:4 rather than the poem pages' 16:9, because these fill a whole
  leaf. The top half is asked to stay calm: that is where the type lands. The
  page also lays a gradient scrim over it, so the plate may be richer and
  darker than a poem ground — this one is meant to stop you.

USAGE  python3 voice/pipeline/section-art.py [key ...]      (default: all eight)
       NB_MODEL=gemini-3-pro-image python3 ...              (quota is per-model)
"""
import base64, json, os, ssl, sys, time, urllib.request, urllib.error

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__)))), 'books', 'art')
MODEL = os.environ.get('NB_MODEL', 'gemini-3.1-flash-image')
CTX = ssl.create_default_context(cafile='/root/.ccr/ca-bundle.crt')

# Painted and cinematic — a divider is allowed to be the loudest page in the
# part it opens. The only hard constraints are the calm upper band for type and
# the blank-surfaces rule, which every plate in this library shares because the
# model will otherwise invent misspelled English on any book, banner or sign.
# Two things had to be said in the negative after the first pass came back.
# "Frontispiece in a fine hardback" got read as an actual framed plate, so the
# armchair arrived inside a painted gilt picture frame with a mount. And "keep
# the top third calm" got read as an instruction to leave a flat grey rectangle
# there, which printed as a hard seam a third of the way down two of the eight.
# The scene has to run continuously into that space, not stop and hand over.
STYLE = ('Painted illustration on a grand scale, rich and cinematic: real depth, dramatic light '
         'and weather, a full but muted palette, visible brush and ink. The feel of a great '
         'frontispiece in a fine hardback anthology — not a poster, not a cartoon, not a picture '
         'book. Drawn with true proportion and dignity. The scene must FILL the whole canvas and '
         'run right off all four edges: NO picture frame, NO painted border, NO mount or matting, '
         'NO vignette edge, NO margin of any colour. The upper part of the picture must be part '
         'of the SAME CONTINUOUS SCENE as the rest — deep sky, mist, dark ceiling or high '
         'shadow that fades gradually and evenly into the scene below, with NO flat band, NO '
         'blank rectangle and NO hard horizontal seam anywhere. It should simply be quieter and '
         'less detailed up there, never separate. ABSOLUTELY NO TEXT, NO LETTERING, NO WRITING, '
         'NO LABELS, NO NUMBERS, NO SIGNAGE — every page, banner, shield, scroll and sign in the '
         'picture is COMPLETELY BLANK. ')

SLOTS = {
 'shakespeare':
   'The empty wooden stage of an Elizabethan playhouse at dusk, seen from the yard: three tiers '
   'of galleries curving away, oak posts and painted heavens above, a single lantern lit, the '
   'open roof showing a wide pale sky. Nobody there yet. Grand, warm, expectant.',
 'speeches':
   'A plain wooden lectern alone at the front of a great hall, one shaft of daylight falling on '
   'it from a high window, hundreds of empty chairs receding into soft shadow behind. Dust in '
   'the light. Still and enormous.',
 'epics':
   'A vast plain at dawn under a towering sky of gold and storm cloud: a distant walled city on '
   'a headland, the sea beyond it, a chariot track cut through the grass in the foreground. No '
   'figures. Monumental scale, deep aerial perspective.',
 'sonnets':
   'A small stone window seat in a thick wall, leaded glass half open onto an English garden at '
   'evening, a quill and an inkpot on the sill, one candle. Intimate, quiet, precise. The room '
   'continues upward above the window into a high vaulted stone ceiling lost in soft shadow, '
   'unbroken and continuous with the wall below.',
 'haiku':
   'A misted Japanese mountain valley at first light: pale layered ridges dissolving into white '
   'sky, one crooked pine on a near rock, a thread of river far below. Enormous emptiness, three '
   'or four inks only, ink-wash restraint.',
 'limericks':
   'A crooked seaside town of leaning painted houses on a steep hill above a small harbour, '
   'bright washing lines strung between windows, gulls, a cheerful blustery sky. Warm, comic in '
   'its architecture rather than its drawing. The top third is open sky.',
 'byheart':
   'A worn armchair by a window at night with a small lamp beside it and a single open book face '
   'down on the arm, rain on the dark glass, a long view of a sleeping town beyond. Warm pool of '
   'light in a cool room. Nobody there. The room rises above the window into dim wall and '
   'ceiling, continuous and unframed.',
 'prose':
   'A long library reading room at late afternoon seen down its length: high shelves climbing '
   'into shadow on both sides, a row of green-shaded lamps down a great oak table, tall arched '
   'windows pouring gold light across the floor, a high coffered ceiling receding into soft dark '
   'at the top of the picture. Empty, reverent and vast, one continuous interior with no seam.',
}


def gen(key, retries=4):
    slug = 'sc-' + key
    body = {'contents': [{'parts': [{'text': STYLE + SLOTS[key]}]}],
            'generationConfig': {'responseModalities': ['IMAGE'],
                                 'imageConfig': {'aspectRatio': '3:4'}}}
    req = urllib.request.Request(
        f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent',
        data=json.dumps(body).encode(),
        headers={'Content-Type': 'application/json',
                 'X-goog-api-key': open('/root/.gkey').read().strip()})
    for a in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=300, context=CTX) as r:
                d = json.load(r)
            for p in d.get('candidates', [{}])[0].get('content', {}).get('parts', []):
                if 'inlineData' in p:
                    raw = base64.b64decode(p['inlineData']['data'])
                    open(f'{OUT}/{slug}.png', 'wb').write(raw)
                    return f'OK {slug} {len(raw)//1024}KB'
            return f'NOIMG {slug}'
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 503) and a < retries - 1:
                time.sleep(15 * (a + 1)); continue
            return f'ERR {slug} {e.code}'
        except Exception as e:
            if a < retries - 1:
                time.sleep(8); continue
            return f'ERR {slug} {type(e).__name__}'


def to_jpeg(key):
    """A full-page plate ships wider than a poem ground — 1500px / <=190KB."""
    from PIL import Image
    slug = 'sc-' + key
    src = f'{OUT}/{slug}.png'
    if not os.path.exists(src):
        return
    im = Image.open(src).convert('RGB')
    im = im.resize((1500, round(1500 * im.height / im.width)), Image.LANCZOS)
    for q in (80, 74, 68, 62):
        im.save(f'{OUT}/{slug}.jpg', 'JPEG', quality=q, optimize=True, progressive=True)
        if os.path.getsize(f'{OUT}/{slug}.jpg') <= 190 * 1024:
            break
    os.remove(src)


if __name__ == '__main__':
    want = [k for k in sys.argv[1:] if not k.startswith('-')] or list(SLOTS)
    print(f'{len(want)} dividers with {MODEL}', flush=True)
    for i, k in enumerate(want):
        print(f'[{i+1}/{len(want)}] {gen(k)}', flush=True)
        to_jpeg(k)
        time.sleep(1.0)
    print('done', flush=True)
