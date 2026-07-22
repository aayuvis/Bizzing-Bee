import json, os, subprocess, sys
from concurrent.futures import ProcessPoolExecutor
import numpy as np, soundfile as sf
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
W = 'spellbound-app/voice/w'

def one(fn):
    word = fn[:-4]
    p = os.path.join(W, fn)
    try:
        wav = '/dev/shm/vs_%d_%s.wav' % (os.getpid(), word.replace('/','_'))
        subprocess.run([FF,'-y','-loglevel','quiet','-i',p,'-ar','16000','-ac','1',wav],check=True,timeout=30)
        d,sr = sf.read(wav); os.remove(wav)
        hop=int(sr*0.005); n=len(d)//hop
        if n==0: return (word,-1,0,0,0,0)
        env=np.sqrt(np.convolve(d*d, np.ones(hop)/hop, 'same'))[::hop][:n]
        peak=float(env.max())
        if peak<=1e-5: return (word,-2,0,0,0,0)
        act=env>peak*0.045
        idx=np.where(act)[0]
        a0,a1=int(idx[0]),int(idx[-1])
        # segment count with 70ms gaps
        gaps=np.where(~act[a0:a1+1])[0]
        nseg=1
        if len(gaps):
            runs=np.split(gaps,np.where(np.diff(gaps)!=1)[0]+1)
            nseg=1+sum(1 for r in runs if len(r)*5>=70)
        dur=len(d)/sr
        return (word, round(dur,3), (a1-a0)*5, a0*5, int(dur*1000-a1*5), nseg)
    except Exception as e:
        return (word,-3,0,0,0,0)

if __name__=='__main__':
    files=[f for f in os.listdir(W) if f.endswith('.mp3')]
    print('scanning',len(files),'clips',flush=True)
    out={}
    with ProcessPoolExecutor(max_workers=12) as ex:
        for i,r in enumerate(ex.map(one, files, chunksize=64)):
            out[r[0]]=r[1:]
            if i%4000==0: print(i,'done',flush=True)
    json.dump(out, open('.voicebuild/scan-results.json','w'))
    print('DONE', len(out))
