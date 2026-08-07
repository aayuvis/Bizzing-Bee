#!/usr/bin/env python3
"""Re-art the two standalone companions (b17 similes, b18 champion lines).

WHY THESE OVERRIDE NANOBANANA-ALL.md
  The slot prompts in the design system name a cute mascot cast — a popcorn
  creature, a smiling honey pot, a crystal fox, a T-rex, a slime in headphones.
  Running them through a maturer STYLE preamble does nothing: the model paints
  what the prompt asks for, so the result came back cartoonier than before.
  Maturity here is SUBJECT-led, not style-led — the same lesson the advanced
  covers learned (see CLAUDE.md: the advanced covers are the world map, the
  road, the microphone, with no cast at all).

  So these sixteen slots get bespoke, cast-free subjects, painted in the warm
  register (NB_STYLE=warm in book-art-gen.py): painted rather than printed, so
  it keeps colour and light, but drawn with real structure so it stops reading
  as a picture book.

AND THE TWELVE THEME PLATES WERE ALL THE SAME PICTURE
  b18-theme01..12 were twelve variations of one songbird on one stage under one
  spotlight — the same repetition that made the poems book look machine-made.
  They are now twelve different corners of a speller's craft.

USAGE  python3 voice/pipeline/companion-art.py [slug ...]      (default: all 16)
       NB_MODEL=gemini-3-pro-image python3 ...                 (quota is per-model)
"""
import base64, json, os, ssl, sys, time, urllib.request, urllib.error

ART = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__)))), 'books', 'art')
MODEL = os.environ.get('NB_MODEL', 'gemini-3.1-flash-image')
CTX = ssl.create_default_context(cafile='/root/.ccr/ca-bundle.crt')

STYLE = ("Painterly illustration in gouache and ink: confident drawing with visible brush and "
         "line, a warm full palette that stays muted rather than bright, soft directional light "
         "and real cast shadow instead of flat cel shading, a little paper texture. Grown-up in "
         "the way a good hardback is grown-up — not a picture book, not a comic. NO people, NO "
         "faces, NO characters, NO animals with human expressions, NO mascots — objects, rooms "
         "and light only, with presence implied. One clear subject, generous negative space. "
         "Full-bleed edge to edge, no border, no frame. ABSOLUTELY NO TEXT ANYWHERE: no title, "
         "no captions, no labels, no signage, no numbers, no lettering on any object, no writing "
         "of any alphabet. Every page, spine, card and sign in the picture is COMPLETELY BLANK. ")

P = '3:4'; L = '3:2'
SLOTS = {
 # ---- b17 · As Busy as a Bee (similes and idioms) -------------------------
 'b17-cover': (P, "An overhead flat-lay on a worn oak desk, arranged like a naturalist's specimen "
   "tray: a white feather, a cucumber, a small brass bell, a magnifying glass, a gold coin, a "
   "fragment of honeycomb, a length of ribbon, a smooth river stone. Warm raking afternoon light, "
   "long soft shadows. The top quarter is calm empty desk for a title."),
 'b17-divider': (P, "A wide green meadow at golden hour seen at eye level, tall grass and clover "
   "in the foreground going soft, one distant hedgerow, high thin cloud. Utterly still and empty. "
   "The top half is calm open sky."),

 # ---- b18 · Say It Like a Champion (lines worth keeping) ------------------
 'b18-cover': (P, "A single microphone on a slim stand at the centre of a dark empty stage, lit by "
   "one warm spotlight from high left, dust turning in the beam, the edge of a heavy curtain just "
   "visible at the right. Deep quiet palette. The top quarter is calm dark air for a title."),
 'b18-divider': (P, "The stage seen from the wings: the vertical edge of a heavy curtain in dark "
   "silhouette down one side, a bright sliver of lit boards beyond, rows of empty seats dissolving "
   "into the dark house. The top half is calm and dark."),

 # twelve corners of a speller's craft — deliberately twelve DIFFERENT rooms
 'b18-theme01': (L, "A single worn wooden chair alone in an empty rehearsal room, early morning "
   "light across a bare floor. Left third calm and dark."),
 'b18-theme02': (L, "A bare stage in darkness with one hard shaft of light falling on the boards, "
   "dust turning slowly in it. Left third calm and dark."),
 'b18-theme03': (L, "A desk at night under a low lamp: a blank open notebook, a pencil, a glass of "
   "water, the window black behind. Left third calm and dark."),
 'b18-theme04': (L, "The heavy folds of a stage curtain from behind, a narrow blaze of light "
   "escaping the gap where it parts. Left third calm and dark."),
 'b18-theme05': (L, "Rows of empty velvet seats seen from the stage, house lights turned almost "
   "out, the aisle running away into the dark. Left third calm and dark."),
 'b18-theme06': (L, "A metronome and a neat stack of blank index cards on a sunlit windowsill, "
   "long shadows across the sill. Left third calm and dark."),
 'b18-theme07': (L, "An open window at dawn, a thin curtain lifting on the air, pale first light "
   "on an empty sill. Left third calm and dark."),
 'b18-theme08': (L, "A wall of small blank wooden card-drawers like a library catalogue, one drawer "
   "pulled open, warm side light. Left third calm and dark."),
 'b18-theme09': (L, "An empty stage at night lit only by a single bare ghost-light bulb on a stand, "
   "everything else in deep shadow. Left third calm and dark."),
 'b18-theme10': (L, "A coat on a hook and a packed bag by a front door before dawn, one hall lamp "
   "lit, the rest of the house dark. Left third calm and dark."),
 'b18-theme11': (L, "A close still life on dark cloth: a tuning fork, a jeweller's magnifier and a "
   "single sharpened pencil, precise raking light. Left third calm and dark."),
 'b18-theme12': (L, "A microphone alone in warm light, the curtain behind it just beginning to part "
   "on brightness. Left third calm and dark."),
}


def gen(slug, retries=4):
    aspect, prompt = SLOTS[slug]
    body = {'contents': [{'parts': [{'text': STYLE + prompt}]}],
            'generationConfig': {'responseModalities': ['IMAGE'],
                                 'imageConfig': {'aspectRatio': aspect}}}
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
                    open(f'{ART}/{slug}.png', 'wb').write(raw)
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


def to_jpeg(slug):
    """Book plates ship 1400px / <=150KB — matches voice/pipeline/art-slim.py."""
    from PIL import Image
    src = f'{ART}/{slug}.png'
    if not os.path.exists(src):
        return
    im = Image.open(src).convert('RGB')
    im = im.resize((1400, round(1400 * im.height / im.width)), Image.LANCZOS)
    for q in (80, 74, 68):
        im.save(f'{ART}/{slug}.jpg', 'JPEG', quality=q, optimize=True, progressive=True)
        if os.path.getsize(f'{ART}/{slug}.jpg') <= 150 * 1024:
            break
    os.remove(src)


if __name__ == '__main__':
    want = [s for s in sys.argv[1:] if not s.startswith('-')] or list(SLOTS)
    print(f'{len(want)} slots with {MODEL}', flush=True)
    for i, s in enumerate(want):
        print(f'[{i+1}/{len(want)}] {gen(s)}', flush=True)
        to_jpeg(s)
        time.sleep(1.0)
    print('done', flush=True)
