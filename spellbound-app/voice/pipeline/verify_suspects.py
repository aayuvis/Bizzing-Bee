import json, os, subprocess
from concurrent.futures import ProcessPoolExecutor
import numpy as np, soundfile as sf
import imageio_ffmpeg
FF=imageio_ffmpeg.get_ffmpeg_exe()
W='spellbound-app/voice/w'
sus=json.load(open('.voicebuild/suspects.json'))
words=sorted(set([x[0] for x in sus['trunc']]+[x[0] for x in sus['seg']]))

def one(word):
    p=os.path.join(W,word+'.mp3')
    try:
        wav='/dev/shm/vv_%d.wav'%os.getpid()
        subprocess.run([FF,'-y','-loglevel','quiet','-i',p,'-ar','16000','-ac','1',wav],check=True,timeout=30)
        d,sr=sf.read(wav); os.remove(wav)
        # absolute-threshold activity (kfinal's 0.004 trim definition)
        act=np.abs(d)>0.004
        idx=np.where(act)[0]
        if not len(idx): return (word, 0, 0.0, round(len(d)/sr,2))
        a0,a1=idx[0],idx[-1]
        span_ms=int((a1-a0)/sr*1000)
        frac=float(np.mean(np.abs(d[a0:a1+1])>0.004))
        return (word, span_ms, round(frac,3), round(len(d)/sr,2))
    except Exception:
        return (word,-1,0.0,0.0)

if __name__=='__main__':
    out={}
    with ProcessPoolExecutor(max_workers=12) as ex:
        for r in ex.map(one, words, chunksize=16):
            out[r[0]]=r[1:]
    json.dump(out, open('.voicebuild/suspects-verified.json','w'))
    letters=lambda w: len([c for c in w if c.isalpha()])
    # broken = abs-threshold speech span still absurdly short for the word
    broken=[w for w,(span,frac,dur) in out.items() if span>=0 and (span< max(160, 42*letters(w)))]
    weird=[w for w,(span,frac,dur) in out.items() if span>2600 and letters(w)<16]
    print('verified broken (span too short):',len(broken))
    print(sorted(broken)[:50])
    print('verified overlong/multi-utterance:',len(weird)); print(weird[:20])
    json.dump({'broken':sorted(broken),'overlong':sorted(weird)}, open('.voicebuild/confirmed-bad.json','w'), indent=1)
