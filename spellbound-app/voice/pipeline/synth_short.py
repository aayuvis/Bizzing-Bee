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
done=0; t0=time.time()
for w in words:
    try:
        # a leading article-free period helps prosody; short words get a gentle pad so
        # initial plosives / final vowels are never trimmed off.
        s,sr=k.create(w+".",voice="af_heart",speed=0.92,lang="en-us")
        a=np.asarray(s,dtype=np.float32); m=float(np.max(np.abs(a)))
        if m<=0: print("EMPTY",w,flush=True); continue
        a=a*(0.95/m)
        idx=np.where(np.abs(a)>0.0035)[0]
        if len(idx): a=a[max(0,idx[0]-int(0.10*sr)):min(len(a),idx[-1]+int(0.12*sr))]
        a=np.concatenate([np.zeros(int(0.13*sr),dtype=np.float32),a,np.zeros(int(0.15*sr),dtype=np.float32)])
        with tempfile.NamedTemporaryFile(suffix=".wav",delete=False) as tf: sf.write(tf.name,a,sr); wav=tf.name
        p=f"{OUT}/{fn(w)}.mp3"; tmp=p+".tmp.mp3"
        subprocess.run([FF,"-y","-loglevel","error","-i",wav,"-ar","24000","-ac","1","-b:a","48k","-codec:a","libmp3lame",tmp],check=True)
        fd=os.open(tmp,os.O_RDONLY); os.fsync(fd); os.close(fd); os.replace(tmp,p); os.unlink(wav)
        done+=1
        if done%50==0: print(f"{done}/{len(words)} @ {done/(time.time()-t0):.1f}/s",flush=True)
    except Exception as e: print("ERR",w,e,flush=True)
print("DONE",done,"of",len(words),flush=True)
