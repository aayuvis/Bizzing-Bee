#!/usr/bin/env python3
"""Bizzing Bee art batch generator — drives Nano Banana (Gemini image models)
through the environment proxy, serially, saving each result under its slug in
books/art/. Reference sheets (bizzy/vex) are attached as input images wherever
the prompt mentions them. Never prints the API key."""
import json, re, sys, base64, os, time, urllib.request, ssl

KEY = open(os.environ.get('GKEY_FILE', '/root/.gkey')).read().strip()  # never hard-code the key
MD = '/home/user/Bizzing-Bee/spellbound-app/books/design-system/NANOBANANA-ALL.md'
ART = '/home/user/Bizzing-Bee/spellbound-app/books/art'
MODEL = os.environ.get('NB_MODEL', 'gemini-3-pro-image')
CTX = ssl.create_default_context(cafile='/root/.ccr/ca-bundle.crt')

STYLE = ("Painterly Japanese anime illustration, soft cel shading with two-tone shadows, "
         "volumetric light and god rays, drifting particle weather, rim-lit characters with soft glows, "
         "depth of field, rich color grading, in the spirit of Studio Ghibli backgrounds. "
         "Family-friendly children's book art. Full-bleed edge to edge, no border, no frame, NO TEXT of any kind. ")

# The advanced half of the library is read by twelve-to-fifteen-year-olds two years
# out from a national final. The house style — soft Ghibli daylight, chibi
# proportions — reads as a picture book to them, and a picture book is the one
# thing they will not carry to school. NB_STYLE=mature swaps it for a graphic-novel
# register: seinen manga ink and screentone crossed with the Spider-Verse printing
# tricks (halftone dots, offset colour channels, hard rim light). Same cast, same
# scenes, grown up. Set per run so the general volumes are never touched.
STYLE_MATURE = ("Modern graphic-novel illustration in the register of seinen manga crossed with "
                "Spider-Verse comic printing: confident hard ink linework of varying weight, dramatic "
                "low and high camera angles, deep chiaroscuro with hard-edged rim light, visible "
                "halftone and ben-day dot texture in the shadows, subtle offset colour-channel "
                "misregistration on the highlights, screentone hatching, motion smears and speed "
                "lines, cinematic letterboxed framing, a restrained near-monochrome palette lifted by "
                "one or two saturated accents. Characters drawn with real weight and grounded "
                "proportion — sharp, poised and serious, never chibi, never cute. Moody, high-contrast, "
                "the look of a graphic novel a fourteen-year-old would carry to school. Full-bleed edge "
                "to edge, no border, no frame, no gutters, no panel grid, NO TEXT of any kind. ")
if os.environ.get('NB_STYLE') == 'mature':
    STYLE = STYLE_MATURE

def parse_md():
    slots = {}
    txt = open(MD).read()
    for m in re.finditer(r'^## \d+\. ([\w.-]+)\.png — ([^\n]+)\n(.+?)(?=\n## |\n# |\Z)', txt, re.M | re.S):
        slug, shape, prompt = m.group(1), m.group(2).strip(), m.group(3).strip()
        slots[slug] = (shape, ' '.join(prompt.split()))
    return slots

ASPECT = {'square': '1:1', 'ultra-wide 6:1': '21:9', 'portrait 3:4': '3:4',
          'tall portrait': '4:5', 'landscape 3:2': '3:2'}

def gen(slug, shape, prompt, refs, retries=3):
    parts = []
    for rp in refs:
        with open(rp, 'rb') as f:
            parts.append({'inline_data': {'mime_type': 'image/png',
                                          'data': base64.b64encode(f.read()).decode()}})
    parts.append({'text': STYLE + prompt})
    body = {'contents': [{'parts': parts}],
            'generationConfig': {'responseModalities': ['IMAGE'],
                                 'imageConfig': {'aspectRatio': ASPECT.get(shape, '3:4')}}}
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
                    open(f'{ART}/{slug}.png', 'wb').write(raw)
                    return f'OK {slug} {len(raw)//1024}KB'
            fb = d.get('candidates', [{}])[0].get('finishReason', '?')
            return f'NOIMG {slug} finish={fb}'
        except urllib.error.HTTPError as e:
            err = e.read().decode()[:200]
            if e.code in (429, 500, 503) and attempt < retries - 1:
                time.sleep(20 * (attempt + 1)); continue
            return f'ERR {slug} {e.code} {err}'
        except Exception as e:
            if attempt < retries - 1: time.sleep(10); continue
            return f'ERR {slug} {type(e).__name__}'
    return f'ERR {slug} exhausted'

def refs_for(slug, prompt):
    refs = []
    if slug not in ('bizzy-sheet', 'vex-sheet'):
        if 'reference bee' in prompt and os.path.exists(f'{ART}/bizzy-sheet.png'):
            refs.append(f'{ART}/bizzy-sheet.png')
        if 'reference moth' in prompt and os.path.exists(f'{ART}/vex-sheet.png'):
            refs.append(f'{ART}/vex-sheet.png')
    return refs

if __name__ == '__main__':
    slots = parse_md()
    want = sys.argv[1:]
    if not want:
        print('slots parsed:', len(slots)); sys.exit(0)
    if want == ['--all']:
        want = [s for s in slots if not os.path.exists(f'{ART}/{s}.png')]
        print(f'{len(want)} slots remaining')
    for slug in want:
        if slug not in slots:
            print('UNKNOWN', slug); continue
        shape, prompt = slots[slug]
        print(gen(slug, shape, prompt, refs_for(slug, prompt)), flush=True)
