#!/usr/bin/env python3
"""Paint the Library's bookshelf — one blank spine per volume.

WHY THE SPINES CARRY NO LETTERING
  The reference for this shelf is a hand-drawn row of picture-book spines with the
  titles lettered on them. An image model letters convincingly and spells badly, and
  this is a spelling app: a shelf of beautifully drawn, subtly misspelled titles is
  the single worst thing we could put on that page. So the model paints the SPINE and
  HTML sets the TYPE over it. That also keeps the titles selectable, translatable,
  crisp at any zoom, and correct forever without regenerating art.

  Every prompt therefore forbids text the way the book pipeline learned to — by
  enumerating what "no text" means, because "no text" alone is read as "no title"
  and the model still letters something onto the object.

WHAT EACH IMAGE IS
  One upright book spine, seen straight on, in the volume's own accent colour (read
  from mkbooks.js, so the shelf agrees with the actual covers), on a plain background
  that is knocked out to alpha afterwards. The middle of the spine is deliberately
  left as clean flat colour: that is where the title goes.

  Output: app-art/spines/<slug>.png   (run from spellbound-app/)
      GKEY_FILE=/root/.gkey python3 voice/pipeline/spine-art.py
"""
import base64, json, os, random, re, ssl, sys, threading, time, urllib.error, urllib.request
from io import BytesIO
from concurrent.futures import ThreadPoolExecutor

from PIL import Image

KEY = open(os.environ.get('GKEY_FILE', '/root/.gkey')).read().strip()  # never printed
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
APP = os.path.join(ROOT, 'spellbound-app') if os.path.isdir(os.path.join(ROOT, 'spellbound-app')) else ROOT
OUT = os.path.join(APP, 'app-art', 'spines')
CTX = ssl.create_default_context(cafile='/root/.ccr/ca-bundle.crt')
H = int(os.environ.get('NB_H', '520'))   # shipped spine height in px

# The image quota is per-MODEL, so workers round-robin across models rather than
# queueing on one. More workers on one model would just contend for the same quota.
#
# gemini-3.1-flash-image is listed first and repeated because it is the only one of
# the three that reliably reads "spine" as the narrow edge of a book. On the first
# run the other two drew the FRONT COVER ten times out of twenty-three — a perfectly
# good book, face-on, at four times the width a spine can be. That is not a prompt
# that needs more adjectives; it is a model difference, so the odds are stacked here
# and the result is measured below rather than trusted.
MODELS = (os.environ.get('NB_MODELS')
          or 'gemini-3.1-flash-image,gemini-3.1-flash-image,gemini-3-pro-image').split(',')
WORKERS = int(os.environ.get('NB_WORKERS', '4'))
# A spine is much taller than it is wide. Anything squarer than this is a cover.
MAX_RATIO = float(os.environ.get('NB_MAX_RATIO', '0.28'))

NOTEXT = ("ABSOLUTELY NO TEXT ANYWHERE ON THE SPINE: no title, no author, no publisher, "
          "no captions, no labels, no numbers, no roman numerals, no monograms, no initials, "
          "no lettering of any alphabet, and no marks that resemble writing. Every surface "
          "that could carry writing is left as clean flat colour. ")

STYLE = ("Hand-drawn children's-bookshop illustration: confident hand-inked outline of slightly "
         "uneven weight, flat gouache colour inside the line, a little paper texture, no gradients, "
         "no photorealism, no 3D rendering. The charm of a drawing made by a person. ")


def prompt_for(v, band):
    """One upright spine. `band` varies the decoration so a row of 23 does not read as
    23 copies of one drawing — the reference shelf's appeal is that no two spines match."""
    deco = {
        'plain':  "the spine is plain flat colour with a single thin darker rule near the top and another near the bottom",
        'bands':  "the spine has two broad horizontal bands, one near the top and one near the bottom, in a darker shade of the same colour",
        'dots':   "the spine carries a neat vertical column of small circles near the very bottom, in assorted colours, like a publisher's device",
        'stripe': "the spine has a narrow vertical stripe of a darker shade running its full height along one edge",
        'block':  "the lower third of the spine is a solid block of a deeper shade, with a clean straight edge where the two colours meet",
        'crown':  "the spine has a small simple decorative motif near the very top only — a tiny star or a tiny leaf — and is otherwise plain",
    }[band]
    return (
        f"A single upright hardback book spine standing vertically, seen straight on, face-on, flat to camera. "
        f"The spine is tall and narrow. Its colour is exactly the hex colour {v['a']}, with any shading in a "
        f"deeper tone of that same hue. {deco.capitalize()}. "
        f"The MIDDLE two thirds of the spine is left completely clean and empty — flat undecorated colour with "
        f"nothing drawn on it at all. "
        f"{NOTEXT}"
        f"{STYLE}"
        f"The book stands alone, centred, upright, with nothing else in the picture. Plain flat WHITE background, "
        f"pure white, no shadow on the background, no floor, no shelf, no other books, no hands, no border, no frame."
    )


def gen(model, prompt):
    body = json.dumps({
        'contents': [{'parts': [{'text': prompt}]}],
        'generationConfig': {'responseModalities': ['IMAGE'],
                             'imageConfig': {'aspectRatio': '9:16'}},
    }).encode()
    req = urllib.request.Request(
        f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent',
        data=body, headers={'x-goog-api-key': KEY, 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, context=CTX, timeout=180) as r:
        d = json.loads(r.read().decode())
    for cand in d.get('candidates', []):
        for part in cand.get('content', {}).get('parts', []):
            if 'inlineData' in part:
                return base64.b64decode(part['inlineData']['data'])
    raise RuntimeError('no image in response: ' + json.dumps(d)[:200])


def knockout(png):
    """Trim to the drawn spine and knock the white page out to alpha, so one set of
    art sits correctly on the light, white AND dusk backgrounds. A spine that shipped
    with its white page baked in would show as a white card in dusk."""
    im = Image.open(BytesIO(png)).convert('RGBA')
    px = im.load()
    w, h = im.size
    # near-white -> transparent, with a soft edge so the inked outline keeps its bite
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            m = min(r, g, b)
            if m > 244:
                px[x, y] = (r, g, b, 0)
            elif m > 228:
                px[x, y] = (r, g, b, int((m - 228) / 16 * 0 + (244 - m) / 16 * 255))
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    # a spine is tall and narrow; cap the height and let width follow
    tw = max(1, int(im.width * (H / im.height)))
    return im.resize((tw, H), Image.LANCZOS)


BANDS = ['plain', 'bands', 'dots', 'stripe', 'block', 'crown']
lock = threading.Lock()
done = {'n': 0, 'fail': []}


def one(i, v):
    path = os.path.join(OUT, v['slug'] + '.png')
    if os.path.exists(path) and not os.environ.get('NB_FORCE'):
        with lock:
            done['n'] += 1
        return
    band = BANDS[i % len(BANDS)]
    last = ''
    for attempt in range(3):
        model = MODELS[(i + attempt) % len(MODELS)]
        try:
            raw = gen(model, prompt_for(v, band))
            im = knockout(raw)
            ratio = im.width / im.height
            if ratio > MAX_RATIO:
                # a front cover, not a spine — retry on another model rather than ship it
                last = f'drew a cover (ratio {ratio:.2f} > {MAX_RATIO})'
                raise ValueError(last)
            im = im.convert('P', palette=Image.ADAPTIVE, colors=64)
            im.save(path, 'PNG', optimize=True)
            with lock:
                done['n'] += 1
                print(f"  {v['slug']:<14} {band:<7} {model:<24} {im.width}x{im.height} "
                      f"{os.path.getsize(path)//1024}KB", flush=True)
            return
        except urllib.error.HTTPError as e:
            last = f'HTTP {e.code} {e.read().decode()[:90]}'
        except ValueError as e:
            last = str(e)[:120]
        except Exception as e:
            last = str(e)[:120]
        time.sleep(2 + attempt * 3 + random.random())
    with lock:
        done['fail'].append(f"{v['slug']}: {last}")
        print(f"  {v['slug']:<14} FAILED  {last}", flush=True)


def main():
    os.makedirs(OUT, exist_ok=True)
    vols = json.load(open(sys.argv[1]))
    print(f'{len(vols)} spines -> {OUT}  ({WORKERS} workers over {len(MODELS)} models)', flush=True)
    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        list(ex.map(lambda a: one(*a), list(enumerate(vols))))
    print(f"\ndone: {done['n']}/{len(vols)}")
    if done['fail']:
        print('failures:')
        for f in done['fail']:
            print('  ' + f)
        sys.exit(1)


if __name__ == '__main__':
    main()
