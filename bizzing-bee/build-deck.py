import json, base64, sys
S='/tmp/claude-0/-home-user-Bizzing-Bee/4e23cfba-e7d7-5db3-a77c-4dd0a1079ba5'
art=json.load(open(f'{S}/bbart.json'))
imgs={k:'data:image/svg+xml;base64,'+base64.b64encode(v.encode()).decode() for k,v in art.items()}
h=open(f'{S}/bb.html').read()
anchor='<script>\nconst WORDS = ['
assert anchor in h, "anchor not found — injection would have silently no-opped"
blob='<script>window.__IMG__='+json.dumps(imgs)+';</script>\n'
h=h.replace(anchor, blob+anchor, 1)
assert 'window.__IMG__=' in h
open(f'{S}/bb-final.html','w').write(h)
print('boards embedded:',len(imgs),'| deck KB',len(h)//1024)
