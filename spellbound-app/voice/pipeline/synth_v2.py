import os,sys,json,re,tempfile,subprocess,time
os.environ["OMP_NUM_THREADS"]="2"
import numpy as np, soundfile as sf
import espeakng_loader
from phonemizer.backend.espeak.wrapper import EspeakWrapper
EspeakWrapper.set_library(espeakng_loader.get_library_path())
try: EspeakWrapper.set_data_path(espeakng_loader.get_data_path())
except Exception: pass
import imageio_ffmpeg; FF=imageio_ffmpeg.get_ffmpeg_exe()
from kokoro_onnx import Kokoro
OUT="/home/claude/repo/spellbound-app/voice/w"
words=json.load(open(sys.argv[1]))
k=Kokoro("voice/kokoro.onnx","voice/voices.bin")
fn=lambda w: re.sub(r'[^a-z0-9]','-',w)

def env(a,sr,win=0.012):
    w=int(win*sr); ker=np.ones(w)/w
    return np.sqrt(np.convolve(a*a,ker,mode='same'))

done=0; t0=time.time()
for w in words:
    try:
        # native speed (0.92 stretch caused the trailing-vowel "ooole" echoes),
        # let Kokoro do its own end-trim, then a light energy tidy + small pad.
        s,sr=k.create(w+".",voice="af_heart",speed=1.0,lang="en-us",trim=True)
        a=np.asarray(s,dtype=np.float32); m=float(np.max(np.abs(a)))
        if m<=0: print("EMPTY",w,flush=True); continue
        a=a*(0.95/m)
        e=env(a,sr); thr=max(e)*0.045
        idx=np.where(e>thr)[0]
        if len(idx): a=a[max(0,idx[0]-int(0.03*sr)):min(len(a),idx[-1]+int(0.05*sr))]
        a=np.concatenate([np.zeros(int(0.05*sr),dtype=np.float32),a,np.zeros(int(0.07*sr),dtype=np.float32)])
        with tempfile.NamedTemporaryFile(suffix=".wav",delete=False) as tf: sf.write(tf.name,a,sr); wav=tf.name
        p=f"{OUT}/{fn(w)}.mp3"; tmp=p+".tmp.mp3"
        subprocess.run([FF,"-y","-loglevel","error","-i",wav,"-ar","24000","-ac","1","-b:a","48k","-codec:a","libmp3lame",tmp],check=True)
        fd=os.open(tmp,os.O_RDONLY); os.fsync(fd); os.close(fd); os.replace(tmp,p); os.unlink(wav)
        done+=1
        print(f"OK {w} {len(a)/sr:.2f}s ({done}/{len(words)})",flush=True)
    except Exception as e: print("ERR",w,e,flush=True)
print("DONE",done,"of",len(words),flush=True)
