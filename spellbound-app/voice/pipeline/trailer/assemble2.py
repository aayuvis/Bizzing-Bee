#!/usr/bin/env python3
"""Episode 1 assembly — cold open, title, choreographed race, replay, outro."""
import subprocess, os
FF='/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
V='/tmp/vid'; SRC=f'{V}/clips/ep1.webm'; SEG=f'{V}/seg2'; os.makedirs(SEG,exist_ok=True)
ENC=['-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p','-r','30','-an']
def run(a,tag=''):
    r=subprocess.run([FF,'-y','-loglevel','error']+a)
    if r.returncode: raise SystemExit('ffmpeg failed '+tag)

# (name, in, dur, [(ov, a, b)], fx) — fx: 'zoom' push-in, ('slow',f) setpts factor
SEGS=[
 ('A', 49.2, 4.3, [], None),
 ('C', 8.0, 4.4, [], None),
 ('D', 13.9, 4.7, [], None),
 ('E', 18.6, 4.0, [], None),
 ('F', 22.7, 2.4, [], None),
 ('G', 25.4, 2.5, [], None),
 ('H', 27.9, 2.8, [('rule',0.4,2.6)], None),
 ('I', 30.8, 10.6, [('champ',1.5,8.0)], None),
 ('J', 41.4, 3.4, [], None),
 ('K', 44.9, 13.1, [], 'zoom'),
 ('L', 59.5, 5.5, [], None),
 ('M', 67.2, 2.3, [], None),
 ('N', 65.6, 1.6, [('replay',0.2,3.0)], ('slow',2.0)),
]
for name,inp,dur,ovs,fx in SEGS:
    args=['-i',SRC]
    for ov,_,_ in ovs:
        odur = dur*fx[1] if isinstance(fx,tuple) else dur
        args+=['-loop','1','-t',str(odur),'-i',f'{V}/ov_{ov}.png']
    f=f'[0:v]trim=start={inp}:end={inp+dur},setpts=PTS-STARTPTS'
    if isinstance(fx,tuple): f+=f',setpts={fx[1]}*PTS'
    f+=',fps=30,scale=1920:1080'
    if fx=='zoom': f+=",zoompan=z='min(1+0.0026*on,1.11)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080"
    f+='[v0]'; cur='v0'
    for i,(ov,a,b) in enumerate(ovs):
        f+=f';[{i+1}:v]format=rgba,fade=in:st={a}:d=0.25:alpha=1,fade=out:st={b-0.3}:d=0.3:alpha=1[o{i}]'
        f+=f';[{cur}][o{i}]overlay=0:0:enable=\'between(t,{a},{b})\'[v{i+1}]'; cur=f'v{i+1}'
    run(args+['-filter_complex',f,'-map',f'[{cur}]']+ENC+[f'{SEG}/{name}.mp4'],name); print(name,'ok')

# stills: title (B, 4.0s) + outro (O, 8.0s) — single-frame zoompan
for name,src,dur,z in [('B',f'{V}/title.png',4.0,0.0006),('O',f'{V}/outro.png',8.0,0.0005)]:
    n=int(dur*30)
    run(['-i',src,'-filter_complex',
        f"[0:v]scale=2304:1296,zoompan=z='min(1+{z}*on,1.08)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s=1920x1080:fps=30[v0]",
        '-map','[v0]']+ENC+[f'{SEG}/{name}.mp4'],name); print(name,'ok')

order=['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O']
durs= [4.3,4.0,4.4,4.7,4.0,2.4,2.5,2.8,10.6,3.4,13.1,5.5,2.3,3.2,8.0]
with open(f'{SEG}/list.txt','w') as fh:
    for s in order: fh.write(f"file '{SEG}/{s}.mp4'\n")
run(['-f','concat','-safe','0','-i',f'{SEG}/list.txt','-c','copy',f'{V}/ep1video.mp4'])
starts={}; t=0
for s,d in zip(order,durs): starts[s]=t; t+=d
TOTAL=t; print('segments start:',{k:round(v,1) for k,v in starts.items()},'TOTAL',TOTAL)

VO=[('c1',0.15),('s1',starts['B']+0.4),('s2',starts['C']+1.8),('go',starts['D']+1.3),
    ('oil',starts['F']-0.5),('cop',starts['G']+0.2),('last',starts['H']+0.3),
    ('g1a',starts['I']+0.3),('g1b',starts['I']+2.6),('g1c',starts['I']+9.4),
    ('mid',starts['J']+0.4),('g2a',starts['K']+1.0),('g2b',starts['K']+6.2),('g2c',starts['K']+11.0),
    ('cl',starts['L']+0.3),('fin',starts['L']+4.2),('res',starts['M']+0.4),
    ('rep',starts['N']+0.2),('out',starts['O']+0.8)]
FX=[('whoosh',starts['B']-0.2),('skid',starts['F']+1.2),('siren',starts['G']+1.1),
    ('thud',starts['H']+0.4),('ding',starts['I']+8.0),('rocket',starts['J']+0.2),
    ('ding',starts['K']+10.2),('rocket',starts['K']+12.6),('tada',starts['M']+0.3),('whoosh',starts['O']-0.2)]
args=['-i',f'{V}/ep1video.mp4','-i',f'{V}/music.wav']
ins=[]
for nm,off in VO: ins.append((f'{V}/e_{nm}.wav',off,1.6))
for nm,off in FX: ins.append((f'{V}/fx_{nm}.wav',max(0,off),0.55))
for p,_,_ in ins: args+=['-i',p]
f=f'[1:a]atrim=0:{TOTAL},volume=0.22,afade=t=in:d=1.0,afade=t=out:st={TOTAL-2.6}:d=2.5[m]'
mix='[m]'
for i,(p,off,vol) in enumerate(ins):
    f+=f';[{i+2}:a]volume={vol},adelay={int(off*1000)}|{int(off*1000)}[x{i}]'
    mix+=f'[x{i}]'
f+=f';{mix}amix=inputs={len(ins)+1}:normalize=0,alimiter=limit=0.93,aresample=44100[aout]'
args+=['-filter_complex',f,'-map','0:v','-map','[aout]','-c:v','copy','-c:a','aac','-b:a','192k','-shortest',f'{V}/spelling-grand-prix-ep1.mp4']
run(args,'mix')
print('DONE', round(os.path.getsize(f"{V}/spelling-grand-prix-ep1.mp4")/1e6,1),'MB', TOTAL,'s')
