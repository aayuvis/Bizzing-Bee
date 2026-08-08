import json, base64, os, re, glob

def standalone(body_html, title_fallback="Deck"):
    """Wrap the deck fragment in a real HTML document.
    The artifact host supplies its own <head>; a downloaded file has none, so without
    this it renders in quirks mode and guesses the encoding (mojibake on mobile)."""
    m = re.search(r'<title>(.*?)</title>', body_html, re.S)
    title = m.group(1).strip() if m else title_fallback
    if m:
        body_html = body_html[:m.start()] + body_html[m.end():]
    head_end = body_html.index('<div class="wrap">')
    head_bits, rest = body_html[:head_end], body_html[head_end:]
    return ('<!DOCTYPE html>\n<html lang="en">\n<head>\n'
            '<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            f'<title>{title}</title>\n'
            f'{head_bits}</head>\n<body>\n{rest}\n</body>\n</html>\n')

S = '/tmp/claude-0/-home-user-Bizzing-Bee/4e23cfba-e7d7-5db3-a77c-4dd0a1079ba5'
h = open(f'{S}/bb.html').read()

# Only embed boards the deck actually references, and only the 900px web encodes —
# full-size plates blow past mobile Safari's decoded-bitmap ceiling.
wanted = set(re.findall(r'img:"([A-Za-z0-9_]+)"', h))
imgs = {}
for k in sorted(wanted):
    p = f'{S}/scratchpad/jpg-web/{k}.jpg'
    if os.path.exists(p):
        imgs[k] = 'data:image/jpeg;base64,' + base64.b64encode(open(p, 'rb').read()).decode()
missing = sorted(wanted - set(imgs))
if missing:
    print('MISSING boards:', missing)

anchor = '<script>\nconst WORDS = ['
assert anchor in h, "anchor not found — injection would have silently no-opped"
blob = '<script>window.__IMG__=' + json.dumps(imgs) + ';</script>\n'
h = h.replace(anchor, blob + anchor, 1)
assert 'window.__IMG__=' in h

open(f'{S}/bb-artifact.html', 'w', encoding='utf-8').write(h)
open(f'{S}/bb-final.html', 'w', encoding='utf-8').write(standalone(h, "Bizzing Bee — Why Spell"))
print(f'boards embedded: {len(imgs)}/{len(wanted)} | deck MB {len(h)/1048576:.2f}')
