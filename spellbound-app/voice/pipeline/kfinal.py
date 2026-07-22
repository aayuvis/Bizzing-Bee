# FINAL verified synthesis: all 40,672 words, uniform 0.95+dot, safe trim,
# fsync + decode-back verification so container restarts cannot corrupt output.
import os,sys,json,re,time,tempfile,subprocess
os.environ["OMP_NUM_THREADS"]="2"
import numpy as np, soundfile as sf
import espeakng_loader
from phonemizer.backend.espeak.wrapper import EspeakWrapper
EspeakWrapper.set_library(espeakng_loader.get_library_path())
try: EspeakWrapper.set_data_path(espeakng_loader.get_data_path())
except Exception: pass
import imageio_ffmpeg; FF=imageio_ffmpeg.get_ffmpeg_exe()
from kokoro_onnx import Kokoro
SHARD=int(sys.argv[1]); N=int(sys.argv[2])
OUT="/home/claude/repo/spellbound-app/voice/w"
DONE=f"done_v{SHARD}.txt"
seen=set(open(DONE).read().split("\n")) if os.path.exists(DONE) else set()
words=[w for i,w in enumerate(json.load(open("wv_words.json"))) if i%N==SHARD and w not in seen]
k=Kokoro("voice/kokoro.onnx","voice/voices.bin")
fn=lambda w: re.sub(r'[^a-z0-9]','-',w)
def envelope(a,sr):
    p=np.abs(a).max()
    if p<=0: return None
    idx=np.where(np.abs(a)>0.03*p)[0]
    if not len(idx): return None
    b=a[idx[0]:idx[-1]+1]
    fl=int(0.01*sr); n=len(b)//fl
    if n<6: return None
    r=np.array([np.sqrt(np.mean(b[i*fl:(i+1)*fl]**2)) for i in range(n)])
    return r/r.max()
def verify(path,ref,sr):
    try:
        with tempfile.NamedTemporaryFile(suffix=".wav",delete=False) as tf: wav=tf.name
        r=subprocess.run([FF,"-y","-loglevel","error","-i",path,wav],capture_output=True)
        if r.returncode!=0: os.unlink(wav); return False
        a,sr2=sf.read(wav,dtype='float32'); os.unlink(wav)
        if a.ndim>1: a=a.mean(axis=1)
        if abs(len(a)/sr2 - len(ref)/sr) > 0.12: return False
        e1=envelope(a,sr2); e2=envelope(ref,sr)
        if e1 is None or e2 is None: return False
        n=min(len(e1),len(e2))
        def rs(v):
            i=np.linspace(0,len(v)-1,n); return np.interp(i,np.arange(len(v)),v)
        c=float(np.corrcoef(rs(e1),rs(e2))[0,1])
        return c>0.55
    except Exception: return False
t0=time.time(); done=0; log=open(DONE,"a")
for w in words:
    try:
        s,sr=k.create(w+".",voice="af_heart",speed=0.95,lang="en-us")
        a=np.asarray(s,dtype=np.float32)
        m=float(np.max(np.abs(a)))
        if m<=0: print(f"v{SHARD} EMPTY {w}",flush=True); log.write(w+"\n"); log.flush(); continue
        a=a*(0.95/m)
        idx=np.where(np.abs(a)>0.004)[0]
        if len(idx): a=a[max(0,idx[0]-int(0.08*sr)):min(len(a),idx[-1]+int(0.10*sr))]
        a=np.concatenate([np.zeros(int(0.14*sr),dtype=np.float32),a,np.zeros(int(0.16*sr),dtype=np.float32)])
        with tempfile.NamedTemporaryFile(suffix=".wav",delete=False) as tf: sf.write(tf.name,a,sr); wav=tf.name
        p=f"{OUT}/{fn(w)}.mp3"; br="48k" if len(w)<=7 else "32k"
        ok=False
        for attempt in range(3):
            tmp=p+".tmp.mp3"
            subprocess.run([FF,"-y","-loglevel","error","-i",wav,"-ar","24000","-ac","1","-b:a",br,"-codec:a","libmp3lame",tmp],check=True)
            fd=os.open(tmp,os.O_RDONLY); os.fsync(fd); os.close(fd)
            os.replace(tmp,p)
            dfd=os.open(OUT,os.O_RDONLY); os.fsync(dfd); os.close(dfd)
            if verify(p,a,sr): ok=True; break
        os.unlink(wav)
        if not ok: print(f"v{SHARD} VERIFYFAIL {w}",flush=True)
        log.write(w+"\n"); log.flush(); done+=1
        if done%500==0: print(f"v{SHARD}: {done} @ {done/(time.time()-t0):.2f}/s",flush=True)
    except Exception as e: print(f"v{SHARD} ERR {w}: {e}",flush=True)
print(f"v{SHARD} ALLDONE {done}",flush=True)
