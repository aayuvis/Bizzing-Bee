import numpy as np, soundfile as sf
SR=44100
def w(name,x): sf.write(f'/tmp/vid/fx_{name}.wav', np.tanh(x)*0.9, SR); print(name)
t=lambda d: np.arange(int(d*SR))/SR
rng=np.random.default_rng(5)
# whoosh (title): noise with sweeping bandpass-ish envelope
d=t(0.9); n=rng.uniform(-1,1,len(d)); env=np.sin(np.pi*d/0.9)**2
w('whoosh', n*env*np.sin(2*np.pi*(200+900*d/0.9)*d)*0.9)
# skid (oil): downward noise chirp
d=t(0.7); n=rng.uniform(-1,1,len(d))
w('skid', n*np.exp(-d*4)*np.sin(2*np.pi*(1800-1400*d/0.7)*d))
# siren (cop): two-tone blip
d=t(1.0); f=np.where((d%0.4)<0.2, 880, 660)
w('siren', 0.6*np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-d*1.2))
# thud (last place): low kick + noise
d=t(0.5); f=90*np.exp(-d*18)+40
w('thud', np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-d*7)+0.2*rng.uniform(-1,1,len(d))*np.exp(-d*30))
# ding-riser (unlock): ascending arpeggio
x=np.zeros(int(1.1*SR))
for i,f in enumerate([523,659,784,1046]):
    dd=t(0.28); seg=0.5*np.sin(2*np.pi*f*dd)*np.exp(-dd*6); s=int(i*0.16*SR)
    x[s:s+len(seg)]+=seg
w('ding', x)
# rocket: rumble upsweep
d=t(1.4); n=rng.uniform(-1,1,len(d))
w('rocket', (0.7*np.sin(2*np.pi*(60+140*d/1.4)*d)+0.4*n)*np.sin(np.pi*d/1.4)**0.5)
# tada (win): major chord swell
d=t(1.6); x=sum(np.sin(2*np.pi*f*d) for f in [523,659,784,1046])/4
w('tada', x*np.sin(np.pi*np.minimum(d/0.25,1))*np.exp(-np.maximum(d-0.9,0)*3))
