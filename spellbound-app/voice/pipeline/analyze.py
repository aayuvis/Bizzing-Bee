import json, os, subprocess, sys
import numpy as np, soundfile as sf
FF = subprocess.check_output(['python3','-c','import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).decode().strip()
W = 'spellbound-app/voice/w'
TMP = '.voicebuild/tmp'; os.makedirs(TMP, exist_ok=True)

def decode(path):
    wav = os.path.join(TMP, os.path.basename(path).replace('.mp3','.wav'))
    subprocess.run([FF,'-y','-loglevel','error','-i',path,'-ar','24000','-ac','1',wav],check=True)
    d,sr = sf.read(wav); os.remove(wav); return d,sr

def envelope(d, sr, hop_ms=5):
    hop=int(sr*hop_ms/1000)
    n=len(d)//hop
    return np.array([np.sqrt(np.mean(d[i*hop:(i+1)*hop]**2)) for i in range(n)]), hop_ms

def analyze(word):
    p=os.path.join(W, word+'.mp3')
    if not os.path.exists(p): return {'w':word,'missing':True}
    d,sr=decode(p)
    env,hop=envelope(d,sr)
    peak=env.max() if len(env) else 0
    if peak==0: return {'w':word,'silent':True}
    th=peak*0.045     # activity threshold
    act=env>th
    idx=np.where(act)[0]
    dur=len(d)/sr
    first,last=(int(idx[0]),int(idx[-1])) if len(idx) else (0,0)
    # segments of activity separated by >=70ms of silence
    segs=[]; s=None; gap=0
    for i,a in enumerate(act):
        if a:
            if s is None: s=i
            gap=0
        else:
            if s is not None:
                gap+=1
                if gap*hop>=70: segs.append((s,i-gap)); s=None; gap=0
    if s is not None: segs.append((s,len(act)-1))
    seginfo=[{'t0':round(a*hop/1000,3),'t1':round(b*hop/1000,3),
              'peak':round(float(env[a:b+1].max()/peak),3),
              'ms':int((b-a)*hop)} for a,b in segs]
    return {'w':word,'dur':round(dur,3),'sr':sr,'peak':round(float(peak),4),
            'act0':round(first*hop/1000,3),'act1':round(last*hop/1000,3),
            'nseg':len(segs),'segs':seginfo}

flags=json.load(open('.voicebuild/voice-flags.json'))['words']
out=[analyze(f['w']) for f in flags]
for f,o in zip(flags,out): o['heard']=f['h']
json.dump(out, open('.voicebuild/flag-analysis.json','w'), indent=1)
for o in out:
    print(o['w'], '| heard:', o.get('heard'), '| dur', o.get('dur'), '| segs', o.get('nseg'),
          '|', ' '.join(f"[{s['t0']}-{s['t1']} pk{s['peak']} {s['ms']}ms]" for s in o.get('segs',[])))
