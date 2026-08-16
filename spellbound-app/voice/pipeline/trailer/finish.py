import subprocess, os
FF='/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
V='/tmp/vid'; SEG=f'{V}/seg'
def run(a):
    r=subprocess.run([FF,'-y','-loglevel','error']+a)
    if r.returncode: raise SystemExit('ffmpeg failed')
order=['s1','s2','s3','s4','s5','s6','s7a','s7b','s8']
with open(f'{SEG}/list.txt','w') as fh:
    for s in order: fh.write(f"file '{SEG}/{s}.mp4'\n")
run(['-f','concat','-safe','0','-i',f'{SEG}/list.txt','-c','copy',f'{V}/video.mp4'])
TOTAL=73.5
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
print('DONE', round(os.path.getsize(f'{V}/bee-grand-prix-trailer.mp4')/1e6,1),'MB')
