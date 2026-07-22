import subprocess, sys, os
import numpy as np, soundfile as sf
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
W='spellbound-app/voice/w'
PAD_MS=120
for word in sys.argv[1:]:
    p=os.path.join(W,word+'.mp3')
    wav='/dev/shm/tt.wav'
    subprocess.run([FF,'-y','-loglevel','error','-i',p,'-ar','24000','-ac','1',wav],check=True)
    d,sr=sf.read(wav)
    hop=int(sr*0.005)
    n=len(d)//hop
    env=np.sqrt(np.convolve(d*d,np.ones(hop)/hop,'same'))[::hop][:n]
    peak=env.max(); act=env>peak*0.045
    idx=np.where(act)[0]; a1=int(idx[-1])
    cut=min(len(d), (a1*hop)+int(sr*PAD_MS/1000))
    trimmed=d[:cut]
    # 25ms fade-out
    f=int(sr*0.025)
    if len(trimmed)>f: trimmed[-f:]*=np.linspace(1,0,f)
    sf.write('/dev/shm/tt2.wav', trimmed, sr)
    subprocess.run([FF,'-y','-loglevel','error','-i','/dev/shm/tt2.wav','-codec:a','libmp3lame','-b:a','48k','-ar','24000','-ac','1',p],check=True)
    print(word,'trimmed: %0.3fs -> %0.3fs'%(len(d)/sr,len(trimmed)/sr))
