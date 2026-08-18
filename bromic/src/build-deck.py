import os,base64,json,re

def standalone(body_html, title_fallback="Deck"):
    """Wrap the deck fragment in a real HTML document.
    The artifact host supplies its own <head>; a downloaded file has none, so without
    this it renders in quirks mode and guesses the encoding (mojibake on mobile)."""
    import re
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

S='/tmp/claude-0/-home-user-Bizzing-Bee/4e23cfba-e7d7-5db3-a77c-4dd0a1079ba5'
J=f'{S}/scratchpad/jpg-web'   # mobile-safe: 900px, q72
html=open(f'{S}/deck.html').read()
# Only embed boards this deck actually references — the scratchpad also holds the
# Bizzing Bee boards, and sweeping the whole folder bloated the file by ~2.7MB.
# A board ships iff its exact key appears as a quoted string somewhere in the deck.
import re as _re
wanted = set(_re.findall(r'"([A-Za-z0-9_]+)"', html))
imgs = {}
for f in sorted(os.listdir(J)):
    if not f.endswith('.jpg'):
        continue
    k = f[:-4]
    if k in wanted:
        imgs[k] = 'data:image/jpeg;base64,' + base64.b64encode(open(f'{J}/{f}', 'rb').read()).decode()
vids={}
blob=('<script>window.__IMG__='+json.dumps(imgs)+';window.__VID__='+json.dumps(vids)+';</script>\n')
html=html.replace('<script>\nconst PLATES',blob+'<script>\nconst PLATES',1)
open(f'{S}/deck-artifact.html','w',encoding='utf-8').write(html)   # fragment for the artifact host
open(f'{S}/deck-final.html','w',encoding='utf-8').write(standalone(html, "Extend the Moment — Bromic"))  # full document for download
print('imgs',len(imgs),'size MB',round(len(html)/1048576,2))
