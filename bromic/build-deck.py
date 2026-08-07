import os,base64,json,re
S='/tmp/claude-0/-home-user-Bizzing-Bee/4e23cfba-e7d7-5db3-a77c-4dd0a1079ba5'
J=f'{S}/scratchpad/jpg'
imgs={}
for f in sorted(os.listdir(J)):
    if f.endswith('.jpg'):
        imgs[f[:-4]]='data:image/jpeg;base64,'+base64.b64encode(open(f'{J}/{f}','rb').read()).decode()
html=open(f'{S}/deck.html').read()
vids={}
for k,ext,mime in (('01_mushroom','mp4','video/mp4'),('01_mushroom_webm','webm','video/webm')):
    vp=f'{S}/scratchpad/video/01_mushroom_web.{ext}'
    if os.path.exists(vp):
        vids[k]=f'data:{mime};base64,'+base64.b64encode(open(vp,'rb').read()).decode()
blob=('<script>window.__IMG__='+json.dumps(imgs)+';window.__VID__='+json.dumps(vids)+';</script>\n')
html=html.replace('<script>\nconst PLATES',blob+'<script>\nconst PLATES',1)
open(f'{S}/deck-final.html','w').write(html)
print('imgs',len(imgs),'size MB',round(len(html)/1048576,2))
