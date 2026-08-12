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
# A spine is much taller than it is wide. Anything squarer than MAX is a cover; anything
# thinner than MIN is a bookmark. The FIRST run accepted 0.126 to 0.28 — a 17px book
# beside a 46px one — and that spread is most of why the shelf read as scruffy AND why
# the type spilled off the narrow ones. The band is tight now and enforced by measurement.
MAX_RATIO = float(os.environ.get('NB_MAX_RATIO', '0.30'))
# Thickness. The band went 0.28 -> 0.185 -> and now UP to 0.17-0.30, because slender was
# the wrong correction: at ~0.14 the books read as thin card, and thirteen of them left a
# third of the shelf empty at either end. A real hardback spine is roughly a quarter of
# its height. 0.30 is still unmistakably a spine — the covers this check exists to reject
# came back at 0.37-0.57.
MIN_RATIO = float(os.environ.get('NB_MIN_RATIO', '0.17'))

NOTEXT = ("ABSOLUTELY NO TEXT ANYWHERE ON THE SPINE: no title, no author, no publisher, "
          "no captions, no labels, no numbers, no roman numerals, no monograms, no initials, "
          "no lettering of any alphabet, and no marks that resemble writing. Every surface "
          "that could carry writing is left as clean flat colour. ")

# Two corrections live in this string. The first cut was drawn with a thick wobbly outline
# and read as a cartoon. The second was clean but FLAT — a coloured rectangle, not a book.
# What makes a spine read as real is that it is the curved back of a cylinder: a soft
# highlight down its centre, a little shade at both long edges, and the small physical
# details a bound book actually has (headband, hubs, stamped rules, cloth weave).
STYLE = ("Illustration of a REAL cloth-bound hardback book, drawn with the care of a "
         "bookbinder's catalogue. A fine, even, confident ink line. THE SPINE IS THE CURVED "
         "BACK OF A BOOK, NOT A FLAT RECTANGLE: soft vertical shading with a subtle highlight "
         "running down the centre of the spine and a little deeper tone along both long edges, "
         "so it reads as rounded. Visible cloth weave or fine leather grain in the colour. "
         "A small striped HEADBAND at the very top and the very bottom where the binding shows. "
         "Slight honest wear at the head and tail. "
         "NOT a cartoon: no thick wobbly outline, no childish doodle, no bouncy uneven shapes, "
         "no flat featureless block of colour, no photorealism, no 3D render, no cast shadow "
         "on the background. ")


def prompt_for(v, band):
    """One upright spine. `band` varies the decoration so a row of 23 does not read as
    23 copies of one drawing — the reference shelf's appeal is that no two spines match."""
    # Eight real bindings, so no two books on the shelf are the same object. These are
    # things an actual hardback has, not decoration invented for the picture.
    deco = {
        'hubs':   "an antique binding: four RAISED HORIZONTAL BANDS (hubs) across the spine dividing it "
                  "into panels, with a thin stamped rule above and below each hub",
        'label':  "a modern cloth binding with a small rectangular paper LABEL pasted near the top, "
                  "its edges slightly uneven, the rest plain cloth",
        'rules':  "a plain cloth binding with two fine stamped RULES near the top and two near the "
                  "bottom, nothing between them",
        'quarter':"a QUARTER-BOUND book: the lower third in a distinctly darker cloth with a clean "
                  "straight horizontal join where the two materials meet",
        'colophon':"a plain cloth binding with a small publisher's COLOPHON near the tail — a neat "
                  "vertical column of tiny circles in assorted colours",
        'gilt':   "a handsome binding with a single wide GILT PANEL outlined in a thin gold rule in the "
                  "upper third, the rest plain cloth",
        'ridges': "a plain binding with three narrow ridges close together near the tail only",
        'worn':   "a well-read cloth binding, slightly faded down one long edge, with a soft bumped "
                  "corner at the tail and a single stamped rule at the head",
    }[band]
    return (
        f"A single upright hardback book spine standing vertically, seen straight on, face-on, flat to camera. "
        f"THE SPINE IS A SUBSTANTIAL HARDBACK, about four times taller than it is wide — a proper "
        f"thick book, not a slim pamphlet and not a flat card. Its colour is exactly the hex colour {v['a']}, with any shading in a "
        f"deeper tone of that same hue. {deco.capitalize()}. "
        f"The MIDDLE two thirds of the spine is left clean and empty — no decoration at all there, "
        f"just the cloth and its shading, because a title will be printed over it. "
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


BANDS = ['hubs', 'label', 'rules', 'quarter', 'colophon', 'gilt', 'ridges', 'worn']
lock = threading.Lock()
done = {'n': 0, 'fail': []}
RATIOS = {}


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
            if ratio > MAX_RATIO or ratio < MIN_RATIO:
                # a front cover or a bookmark, not a spine — retry rather than ship it
                last = f'ratio {ratio:.3f} outside [{MIN_RATIO}, {MAX_RATIO}]'
                raise ValueError(last)
            im = im.convert('P', palette=Image.ADAPTIVE, colors=160)  # 64 banded the spine shading
            im.save(path, 'PNG', optimize=True)
            with lock:
                RATIOS[v['slug']] = round(ratio, 4)
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
    # The client needs each spine's true width to size its title; measure every file on
    # disk, not just the ones this run drew, so a partial run still writes a full map.
    for v in vols:
        f = os.path.join(OUT, v['slug'] + '.png')
        if os.path.exists(f):
            im = Image.open(f)
            RATIOS[v['slug']] = round(im.width / im.height, 4)
    with open(os.path.join(OUT, 'ratios.json'), 'w') as fh:
        json.dump(RATIOS, fh, indent=1, sort_keys=True)
    print(f"\nratios.json written ({len(RATIOS)} spines, "
          f"{min(RATIOS.values()):.3f}-{max(RATIOS.values()):.3f})")
    print(f"done: {done['n']}/{len(vols)}")
    if done['fail']:
        print('failures:')
        for f in done['fail']:
            print('  ' + f)
        sys.exit(1)


if __name__ == '__main__':
    main()
