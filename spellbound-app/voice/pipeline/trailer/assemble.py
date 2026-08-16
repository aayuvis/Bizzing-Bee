#!/usr/bin/env python3
"""Assemble the Bee Grand Prix trailer: trim clips, burn overlays, concat, mix VO+music."""
import subprocess, os
FF='/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
V='/tmp/vid'; C=f'{V}/clips'; SEG=f'{V}/seg'; os.makedirs(SEG, exist_ok=True)
ENC=['-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p','-r','30','-an']

def run(args):
    r=subprocess.run([FF,'-y','-loglevel','error']+args)
    if r.returncode: raise SystemExit('ffmpeg failed: '+' '.join(args[:6]))

# (name, source, in_point, dur, [(overlay, start, end), ...])
SEGS=[
 ('s1', f'{C}/sunset.webm', 9.2, 6.0, [('hook1',0.3,3.0),('hook2',3.2,5.8)]),
 ('s2', f'{C}/menu.webm', 12.8, 9.0, [('menu',0.8,8.4)]),
 ('s3', f'{C}/spell.webm', 12.9, 7.5, [('race',0.8,7.0)]),
 ('s4', f'{C}/spell.webm', 20.2, 14.0, [('spell1',0.5,7.2),('spell2',7.6,13.6)]),
 ('s5', f'{C}/city.webm', 14.0, 7.0, [('worlds',0.5,6.5)]),
 ('s6', f'{C}/finish.webm', 11.0, 10.0, [('finish',1.0,9.5)]),
 ('s7a', f'{C}/arcade.webm', 9.5, 7.0, [('app1',0.5,6.6)]),
]
for name,src,inp,dur,ovs in SEGS:
    args=['-i',src]
    for ov,_,_ in ovs: args+=['-loop','1','-t',str(dur),'-i',f'{V}/ov_{ov}.png']
    f=f'[0:v]trim=start={inp}:end={inp+dur},setpts=PTS-STARTPTS,fps=30,scale=1920:1080[v0]'
    cur='v0'
    for i,(ov,a,b) in enumerate(ovs):
        f+=f';[{i+1}:v]format=rgba,fade=in:st={a}:d=0.3:alpha=1,fade=out:st={b-0.35}:d=0.35:alpha=1[o{i}]'
        f+=f';[{cur}][o{i}]overlay=0:0:enable=\'between(t,{a},{b})\'[v{i+1}]'
        cur=f'v{i+1}'
    args+=['-filter_complex',f,'-map',f'[{cur}]']+ENC+[f'{SEG}/{name}.mp4']
    run(args); print(name,'ok')

# stills with slow push-in (Ken Burns)
for name,src,dur,ovs in [
  ('s7b', '/home/user/Bizzing-Bee/spellbound-app/app-art/shots/mockbee.jpg', 5.0, [('app2',0.3,4.7)]),
  ('s8', f'{V}/endcard.png', 8.0, []),
]:
    n=int(dur*30)
    args=['-i',src]   # single-frame input: zoompan expands ONE frame to d frames (never -loop a still into zoompan)
    for ov,_,_ in ovs: args+=['-loop','1','-t',str(dur),'-i',f'{V}/ov_{ov}.png']
    f=f'[0:v]scale=2304:1296,zoompan=z=\'min(1+0.0009*on,1.13)\':x=\'iw/2-(iw/zoom/2)\':y=\'ih/2-(ih/zoom/2)\':d={n}:s=1920x1080:fps=30[v0]'
    cur='v0'
    for i,(ov,a,b) in enumerate(ovs):
        f+=f';[{i+1}:v]format=rgba,fade=in:st={a}:d=0.3:alpha=1,fade=out:st={b-0.35}:d=0.35:alpha=1[o{i}]'
        f+=f';[{cur}][o{i}]overlay=0:0:enable=\'between(t,{a},{b})\'[v{i+1}]'
        cur=f'v{i+1}'
    args+=['-filter_complex',f,'-map',f'[{cur}]']+ENC+[f'{SEG}/{name}.mp4']
    run(args); print(name,'ok')

# concat
order=['s1','s2','s3','s4','s5','s6','s7a','s7b','s8']
with open(f'{SEG}/list.txt','w') as fh:
    for s in order: fh.write(f"file '{SEG}/{s}.mp4'\n")
run(['-f','concat','-safe','0','-i',f'{SEG}/list.txt','-c','copy',f'{V}/video.mp4'])
print('video concat ok')

TOTAL=6.0+9.0+7.5+14.0+7.0+10.0+7.0+5.0+8.0   # 73.5
# audio: music bed (ducked, faded) + VO lines at offsets
VO=[('v1',0.3),('v2',6.7),('v3',15.6),('v4a',23.0),('v4b',31.6),('v5',37.0),('v6',44.0),('v7',53.9),('v8',66.2)]
args=['-i',f'{V}/video.mp4','-i',f'{V}/music.wav']
for nm,_ in VO: args+=['-i',f'{V}/{nm}.wav']
f=f'[1:a]atrim=0:{TOTAL},volume=0.34,afade=t=in:d=1.2,afade=t=out:st={TOTAL-2.6}:d=2.5[m]'
mix='[m]'
for i,(nm,off) in enumerate(VO):
    f+=f';[{i+2}:a]volume=1.55,adelay={int(off*1000)}|{int(off*1000)}[a{i}]'
    mix+=f'[a{i}]'
f+=f';{mix}amix=inputs={len(VO)+1}:normalize=0,alimiter=limit=0.93,aresample=44100[aout]'
args+=['-filter_complex',f,'-map','0:v','-map','[aout]','-c:v','copy','-c:a','aac','-b:a','192k','-shortest',f'{V}/bee-grand-prix-trailer.mp4']
run(args)
sz=os.path.getsize(f'{V}/bee-grand-prix-trailer.mp4')/1e6
print(f'DONE bee-grand-prix-trailer.mp4 {TOTAL}s {sz:.1f}MB')
