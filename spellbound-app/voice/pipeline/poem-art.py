#!/usr/bin/env python3
"""One bespoke plate per PIECE for the poems companion (book-lines).

WHY
  The book first shipped with sixteen plates, one per subject (`th`). With
  ninety pieces that meant the same painting turned up five or six times, which
  is the one thing an anthology cannot do.

KEYING
  The slug is derived from the piece's TITLE and must match pieceSlug() in
  books/mkbooks.js exactly:
      'pp-' + title.toLowerCase().replace(/[^a-z0-9]+/g,'-')
                   .replace(/^-+|-+$/g,'').slice(0,44)
  Deliberately NOT the piece's index: adding one poem shifts every index after
  it, and index-keyed art silently re-attaches itself to the wrong poem.

SCENES
  books/art/poem-scenes.json maps slug -> a one-line scene description. Any
  piece without an entry falls back to a scene built from its subject, and any
  piece with no plate at all falls back in mkbooks to the themed plate — so
  this can be run in batches and the book is never broken in between.

USAGE
  python3 voice/pipeline/poem-art.py            # generate everything missing
  python3 voice/pipeline/poem-art.py --list     # show what is missing, generate nothing
  python3 voice/pipeline/poem-art.py --limit 20 # generate at most 20 this run
  NB_MODEL=gemini-3-pro-image python3 ...       # quota is per-model, so switch on 429
Resumable: a slug whose .jpg already exists is skipped.
"""
import base64, json, os, re, ssl, sys, time, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'books', 'art')
CHAPTERS = os.path.join(ROOT, 'books', 'poem-chapters.js')
SCENES = os.path.join(ROOT, 'books', 'art', 'poem-scenes.json')
MODEL = os.environ.get('NB_MODEL', 'gemini-3.1-flash-image')
CTX = ssl.create_default_context(cafile='/root/.ccr/ca-bundle.crt')

STYLE = ('Hand-inked illustration with soft watercolour washes, a light and airy register, '
         'three or four muted inks, generous negative space, darks only where the drawing needs '
         'weight. Delicate, literary, the feel of a fine printed anthology — not a poster and not '
         'a cartoon. The image must stay CALM and LOW-CONTRAST through its middle so that text '
         'can sit over it. ABSOLUTELY NO TEXT, NO LETTERING, NO WRITING, NO LABELS, NO NUMBERS, '
         'NO SIGNAGE — every page, book, banner and sign in the picture is COMPLETELY BLANK. '
         'No people, no faces, no characters — imply presence instead (an empty chair, a moored '
         'boat, footprints, a lit window). ')

# fallback when a piece has no authored scene: its subject, painted straight
THEME = {
 'sea': 'A grey-green sea under a wide pale sky, a far headland, spray along the lower edge.',
 'night': 'A deep blue night sky thick with small stars, a thin moon, dark low hills along the bottom edge.',
 'forest': 'Tall old trees in soft mist, ferns and moss below, light falling in pale shafts between trunks.',
 'stage': 'Heavy velvet curtains drawn back on an empty stage, a row of unlit footlights, dust in one beam.',
 'war': 'A quiet field at dawn with long grass and a broken fence, low mist, a distant line of bare trees.',
 'snow': 'Snow falling through dark bare woodland at dusk, deep untouched drifts, one narrow track.',
 'flower': 'A drift of wild flowers and long grass beside still water, blossom branches leaning in.',
 'ruin': 'A colossal fallen stone statue half buried in desert sand, wind-scoured dunes to the horizon.',
 'city': 'Slate rooftops and chimney pots in soft rain, a spire in the haze, wet cobbles below.',
 'road': 'Two paths dividing in an autumn wood, leaf litter underfoot, yellow leaves thick overhead.',
 'bird': 'A single dark bird on a bare branch against a pale winter sky, a few loose feathers drifting.',
 'water': 'A still lily pond at blue hour, broad flat leaves, reeds at the near edge, sky reflected flat.',
 'fire': 'A forge glowing in a dim workshop, hammer and anvil in silhouette, sparks rising into the dark.',
 'mountain': 'A high pale mountain range above a sea of cloud, one small stone cairn on a foreground ridge.',
 'library': 'A quiet reading alcove at night, tall shelves of BLANK-spined books, one lamp, a night window.',
 'dawn': 'A wide flat estuary at first light, a low pink and gold sky, water in long still bands.',
}


def pieces():
    """(slug, title, theme) for every piece, in book order.

    Evaluated by node against the real data file rather than scraped with a
    regex here. A regex went wrong immediately — the haiku put `t:` and `th:`
    on one line and the speeches put them on two, so it silently found 66 of
    90 and the Python and JS slug lists drifted out of step. Letting the same
    engine that builds the book answer the question makes the two lists equal
    by construction instead of by coincidence.
    """
    js = r"""
      global.window = {};
      eval(require('fs').readFileSync(process.argv[1], 'utf8'));
      const P = window.SB_POEMS, out = [];
      const slug = t => 'pp-' + String(t || '').toLowerCase()
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 44);
      for (const k of Object.keys(P))
        for (const p of P[k].pieces) out.push([slug(p.t), p.t, p.th || 'library']);
      process.stdout.write(JSON.stringify(out));
    """
    import subprocess
    r = subprocess.run(['node', '-e', js, CHAPTERS], capture_output=True, text=True)
    if r.returncode:
        raise SystemExit('could not read the chapters: ' + r.stderr.strip())
    return [tuple(x) for x in json.loads(r.stdout)]


def gen(slug, prompt, retries=4):
    body = {'contents': [{'parts': [{'text': STYLE + prompt}]}],
            'generationConfig': {'responseModalities': ['IMAGE'],
                                 'imageConfig': {'aspectRatio': '16:9'}}}
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
            # quota is per-model; a sustained 429 means switch NB_MODEL, not wait
            if e.code in (429, 500, 503) and a < retries - 1:
                time.sleep(15 * (a + 1)); continue
            return f'ERR {slug} {e.code}'
        except Exception as e:
            if a < retries - 1:
                time.sleep(8); continue
            return f'ERR {slug} {type(e).__name__}'


def to_jpeg(slug):
    """Book plates ship at 1200px / ~120KB — see voice/pipeline/art-slim.py."""
    from PIL import Image
    src = f'{OUT}/{slug}.png'
    if not os.path.exists(src):
        return
    im = Image.open(src).convert('RGB')
    im = im.resize((1200, round(1200 * im.height / im.width)), Image.LANCZOS)
    for q in (78, 72, 66):
        im.save(f'{OUT}/{slug}.jpg', 'JPEG', quality=q, optimize=True, progressive=True)
        if os.path.getsize(f'{OUT}/{slug}.jpg') <= 130 * 1024:
            break
    os.remove(src)


if __name__ == '__main__':
    scenes = {}
    if os.path.exists(SCENES):
        scenes = json.load(open(SCENES, encoding='utf-8'))

    all_p = pieces()
    todo = [(s, t, th) for (s, t, th) in all_p if not os.path.exists(f'{OUT}/{s}.jpg')]

    if '--list' in sys.argv:
        print(f'{len(all_p)} pieces, {len(all_p)-len(todo)} plated, {len(todo)} missing')
        print(f'{sum(1 for s,_,_ in all_p if s in scenes)} have an authored scene')
        for s, t, th in todo:
            print(('  AUTHORED ' if s in scenes else '  fallback ') + s + '  <- ' + t)
        sys.exit(0)

    if '--limit' in sys.argv:
        todo = todo[:int(sys.argv[sys.argv.index('--limit') + 1])]

    print(f'{len(todo)} to generate with {MODEL}', flush=True)
    for i, (s, t, th) in enumerate(todo):
        prompt = scenes.get(s) or THEME.get(th, THEME['library'])
        print(f'[{i+1}/{len(todo)}] {gen(s, prompt)}', flush=True)
        to_jpeg(s)
        time.sleep(1.0)
    print('done', flush=True)
