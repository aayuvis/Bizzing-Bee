#!/usr/bin/env python3
"""Road to 4.5, P3 (art and the first session): the art slots the P3 rows draw, cut from the app's own
paintings today and paintable later. ONE manifest: tools/art/p3-prompts.json.

Every slot is a WebP at a fixed path and a fixed pixel size — the size it is DRAWN at (CLAUDE.md, "Shipped art is
sized to how it is drawn, not to how it came out of the model"): a My Feed band is 720x240 (a 3:1 band, 560 CSS px
wide at most, 358 on a phone), a world tile 480x240 (the 2:1 band of a world card, ~240 CSS px), Home's tip and
quote vignettes 128x128 (64 CSS px). The code names only those paths, so a slot is never missing:

  --cut      (no network) cuts every slot's FALLBACK from the reused painting it names (a box in fractions of the
             source, an optional "tone" [brightness, colour] lift), resizes it to the slot, and writes the WebP. This is what ships today: the app is complete
             before any bespoke painting exists. Re-run after a source painting changes.
  --paint    paints the slots that carry a "prompt" into RAW PNGs (one call each). Nothing is served yet.
  --webp     converts painted RAW PNGs into the served WebP at the slot's size, REPLACING the cut in place.

DESTRUCTIVE AND CUMULATIVE TOOLS NEED AN EXPLICIT SUBSET: --cut and --webp rewrite served files, so each takes slot
ids (or --all, and says so out loud before it does everything). --paint takes ids or --all as well.

THE KEY. Read ONLY from the GKEY environment variable, at call time, and sent ONLY as the x-goog-api-key header —
never printed, logged, written to a file, put in a URL or passed on a command line. There is no key-file fallback.
--paint with no GKEY stops before any request.

THE PROMPTS. Every prompt is wrapped in the manifest's "style" and its "never" clause: no lettering of any kind (an
image model letters convincingly and spells badly, and this is a spelling app), no people, no logos or brand marks.
tests/p3-art.cjs holds every prompt to that clause, every slot to its path and size, and this file to the key rule.

Usage:  p3-gen.py --list                    the slots, their sizes, and which have a prompt
        p3-gen.py --cut  <id …> | --all     write the reused cuts (no network)
        GKEY=… p3-gen.py --paint <id …> | --all   paint RAW PNGs for the slots that carry a prompt
        p3-gen.py --webp <id …> | --all     serve the painted RAW PNGs, replacing the cuts
Env:    ART_MODELS (comma list, tried in order; default: tools/art/gen.py's list), ART_RAW (raw PNG folder, default
        <tmp>/sb-p3-raw)
After --webp: node tests/p3-art.cjs && node tests/asset-budget.cjs (the app-art ratchet still holds).
"""
import base64
import io
import json
import os
import ssl
import sys
import tempfile
import time
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.dirname(os.path.dirname(HERE))
MANIFEST = os.path.join(HERE, 'p3-prompts.json')
RAW = os.environ.get('ART_RAW', os.path.join(tempfile.gettempdir(), 'sb-p3-raw'))
def models():
    """ART_MODELS, or the stage plates' own list in tools/art/gen.py — the two generators ask the same painters, and the
    list is kept in one place"""
    env = os.environ.get('ART_MODELS')
    if env:
        return [m for m in env.split(',') if m]
    import importlib.util
    spec = importlib.util.spec_from_file_location('sb_stage_gen', os.path.join(HERE, 'gen.py'))
    g = importlib.util.module_from_spec(spec); spec.loader.exec_module(g)
    return list(g.MODELS)
CA = '/root/.ccr/ca-bundle.crt'
QUALITY = 80          # the house rule (tools/art/webp.py, tools/art/gen.py): q80, method 6
MAX_BYTES = {720: 60 * 1024, 480: 30 * 1024, 128: 10 * 1024}   # per slot width; quality steps down until it fits


def load():
    with open(MANIFEST, encoding='utf-8') as f:
        return json.load(f)


def pick(M, args):
    ids = [a for a in args if not a.startswith('--')]
    if '--all' in args:
        print(f'--all: every slot ({len(M["slots"])})', flush=True)
        return M['slots']
    if not ids:
        sys.exit('name the slots to touch (ids from --list), or --all')
    by = {s['id']: s for s in M['slots']}
    bad = [i for i in ids if i not in by]
    if bad:
        sys.exit('unknown slot: ' + ', '.join(bad))
    return [by[i] for i in ids]


def save_webp(im, slot):
    """resize to the slot (cover: centre-crop to its aspect first) and write the WebP at q80, stepping down only if
    a slot would outgrow its byte ceiling"""
    from PIL import Image
    W, H = slot['size']
    im = im.convert('RGB')
    r, R = im.width / im.height, W / H
    if abs(r - R) > 1e-3:
        if r > R:
            w = round(im.height * R); x = (im.width - w) // 2; im = im.crop((x, 0, x + w, im.height))
        else:
            h = round(im.width / R); y = (im.height - h) // 2; im = im.crop((0, y, im.width, y + h))
    im = im.resize((W, H), Image.LANCZOS)
    dst = os.path.join(APP, slot['out'])
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    cap = MAX_BYTES.get(W, 60 * 1024)
    q = QUALITY
    while True:
        buf = io.BytesIO(); im.save(buf, 'WEBP', quality=q, method=6)
        if buf.tell() <= cap or q <= 50:
            break
        q -= 5
    with open(dst, 'wb') as f:
        f.write(buf.getvalue())
    return dst, buf.tell(), q


def cut(slots):
    from PIL import Image
    for s in slots:
        fb = s['fallback']
        src = Image.open(os.path.join(APP, fb['from']))
        x0, y0, x1, y1 = fb['box']
        box = (round(x0 * src.width), round(y0 * src.height), round(x1 * src.width), round(y1 * src.height))
        im = src.crop(box).convert('RGB')
        if fb.get('tone'):          # [brightness, colour]: a play-field is painted a stop dark for sprites; a tile is not
            from PIL import ImageEnhance
            im = ImageEnhance.Color(ImageEnhance.Brightness(im).enhance(fb['tone'][0])).enhance(fb['tone'][1])
        dst, n, q = save_webp(im, s)
        print(f'CUT  {s["id"]:<18} {s["out"]}  {s["size"][0]}x{s["size"][1]}  {n // 1024} KB q{q}  from {fb["from"]}', flush=True)


def ctx():
    return ssl.create_default_context(cafile=CA) if os.path.exists(CA) else ssl.create_default_context()


def call(text, aspect):
    key = os.environ.get('GKEY', '').strip()          # read at call time, from the environment only
    if not key:
        raise RuntimeError('GKEY is not set')
    body = json.dumps({'contents': [{'parts': [{'text': text}]}],
                       'generationConfig': {'responseModalities': ['IMAGE'], 'imageConfig': {'aspectRatio': aspect}}}).encode()
    last = 'no model'
    for model in models():
        for attempt in range(3):
            req = urllib.request.Request(
                f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent',
                data=body, headers={'Content-Type': 'application/json', 'x-goog-api-key': key})
            try:
                with urllib.request.urlopen(req, timeout=300, context=ctx()) as r:
                    d = json.load(r)
                for p in d.get('candidates', [{}])[0].get('content', {}).get('parts', []):
                    if 'inlineData' in p:
                        return base64.b64decode(p['inlineData']['data']), model
                last = f'{model}: no image ({d.get("candidates", [{}])[0].get("finishReason", "?")})'
                break
            except urllib.error.HTTPError as e:          # the status only: an error body is never printed
                last = f'{model}: HTTP {e.code}'
                if e.code in (429, 500, 503) and attempt < 2:
                    time.sleep(15 * (attempt + 1)); continue
                break
            except Exception as e:
                last = f'{model}: {type(e).__name__}'
                if attempt < 2:
                    time.sleep(8); continue
                break
    raise RuntimeError(last)


def aspect_of(slot):
    W, H = slot['size']
    r = W / H
    return '21:9' if r >= 2.6 else '16:9' if r >= 1.6 else '1:1'


def paint(M, slots):
    if not os.environ.get('GKEY', '').strip():
        sys.exit('GKEY is not set — nothing was requested')
    os.makedirs(RAW, exist_ok=True)
    todo = [s for s in slots if s.get('prompt')]
    for s in slots:
        if not s.get('prompt'):
            print(f'SKIP {s["id"]:<18} no prompt (the reused painting is the art)', flush=True)
    for s in todo:
        text = M['style'] + ' ' + s['prompt'] + ' ' + M['never']
        try:
            png, model = call(text, aspect_of(s))
            with open(os.path.join(RAW, s['id'] + '.png'), 'wb') as f:
                f.write(png)
            print(f'OK   {s["id"]:<18} {len(png) // 1024} KB via {model}', flush=True)
        except Exception as e:
            print(f'ERR  {s["id"]:<18} {e}', flush=True)


def webp(slots):
    from PIL import Image
    for s in slots:
        raw = os.path.join(RAW, s['id'] + '.png')
        if not os.path.exists(raw):
            print(f'SKIP {s["id"]:<18} no painting in {RAW} (the cut stays)', flush=True)
            continue
        dst, n, q = save_webp(Image.open(raw), s)
        print(f'WEBP {s["id"]:<18} {s["out"]}  {n // 1024} KB q{q}', flush=True)


if __name__ == '__main__':
    a = sys.argv[1:]
    M = load()
    if not a or a[0] == '--list':
        for s in M['slots']:
            print(f'{s["id"]:<18} {s["out"]:<28} {s["size"][0]}x{s["size"][1]}  {"prompt" if s.get("prompt") else "cut only"}')
        print(f'{len(M["slots"])} slots, {sum(1 for s in M["slots"] if s.get("prompt"))} with a prompt')
    elif a[0] == '--cut':
        cut(pick(M, a[1:]))
    elif a[0] == '--paint':
        paint(M, pick(M, a[1:]))
    elif a[0] == '--webp':
        webp(pick(M, a[1:]))
    else:
        sys.exit(__doc__)
