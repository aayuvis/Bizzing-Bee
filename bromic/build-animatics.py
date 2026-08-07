import json, os, base64, struct, subprocess, urllib.request, urllib.error, threading, time
import imageio_ffmpeg

S = '/tmp/claude-0/-home-user-Bizzing-Bee/4e23cfba-e7d7-5db3-a77c-4dd0a1079ba5/scratchpad'
K = open(f'{S}/.gkey').read().strip()
FF = imageio_ffmpeg.get_ffmpeg_exe()
OUT = f'{S}/animatic'; os.makedirs(OUT, exist_ok=True)
VOD = f'{S}/vo'; os.makedirs(VOD, exist_ok=True)

FILMS = [
 ("01_mushroom",   "01a_mushroom_before", "01b_mushroom_after",
  "Seventy thousand dollars of outdoor kitchen. ... Heated by an eighty-nine dollar mushroom. ... Get Bromic."),
 ("02_pizza_oven", "02a_pizza_before",    "02b_pizza_after",
  "A nine thousand dollar oven. ... Used four times a year. ... Get Bromic."),
 ("03_snowbirds",  "03a_snowbird_before", "03b_snowbird_after",
  "The Wilsons solved their outdoor heating problem. ... It cost four hundred thousand dollars. ... Get Bromic."),
 ("04_big_game",   "04a_biggame_before",  "04b_biggame_after",
  "The outdoor television cost six thousand dollars. ... Everyone is watching the small one. ... Get Bromic."),
 ("05_coastal",    "05a_coastal_before",  "05b_coastal_after",
  "Built for the view. ... Emptied by the breeze. ... Get Bromic."),
 ("06_specification","06a_spec_before",   "06b_spec_after",
  "Specify the season. ... Not just the space. ... Get Bromic."),
]

lock = threading.Lock()
def log(*a):
    with lock: print(*a, flush=True)

def tts(text, path):
    if os.path.exists(path) and os.path.getsize(path) > 20000: return True
    body = {"contents":[{"parts":[{"text":
              "Read this as a dry, calm, deadpan advertising voiceover. Unhurried, understated, "
              "never jokey, with clear pauses where marked: " + text}]}],
            "generationConfig":{"responseModalities":["AUDIO"],
              "speechConfig":{"voiceConfig":{"prebuiltVoiceConfig":{"voiceName":"Charon"}}}}}
    for a in range(4):
        try:
            r = urllib.request.Request(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent",
                data=json.dumps(body).encode(),
                headers={"Content-Type":"application/json","X-goog-api-key":K})
            d = json.load(urllib.request.urlopen(r, timeout=240))
            raw = base64.b64decode(d["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])
            hdr = (b'RIFF' + struct.pack('<I', 36+len(raw)) + b'WAVEfmt ' +
                   struct.pack('<IHHIIHH', 16, 1, 1, 24000, 48000, 2, 16) +
                   b'data' + struct.pack('<I', len(raw)))
            open(path, "wb").write(hdr + raw)
            return True
        except Exception as e:
            m = e.read()[:90].decode() if isinstance(e, urllib.error.HTTPError) else str(e)[:90]
            log("  tts retry", a, m); time.sleep(12*(a+1))
    return False

def dur(path):
    o = subprocess.run([FF,'-i',path], capture_output=True, text=True).stderr
    for l in o.split('\n'):
        if 'Duration' in l:
            t = l.split('Duration:')[1].split(',')[0].strip()
            h,m,sec = t.split(':'); return int(h)*3600+int(m)*60+float(sec)
    return 0

FPS = 25
COLD, WARM, END = 9.8, 8.8, 3.0
XF1, XF2 = 0.8, 0.5

def build(f):
    key, cold, warm, line = f
    final = f'{OUT}/{key}.mp4'
    if os.path.exists(final) and os.path.getsize(final) > 300000:
        log("skip", key); return
    vo = f'{VOD}/{key}.wav'
    if not tts(line, vo):
        log("FAIL tts", key); return
    vlen = dur(vo)
    ci, wi = f'{S}/jpg/{cold}.jpg', f'{S}/jpg/{warm}.jpg'
    if not (os.path.exists(ci) and os.path.exists(wi)):
        log("missing plate", key); return
    cf, wf = int(COLD*FPS), int(WARM*FPS)
    # push in on the cold half; pull back on the payoff
    zin  = (f"scale=2560:-2,zoompan=z='min(zoom+0.00035,1.09)':d={cf}:"
            f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1280x720:fps={FPS},setsar=1")
    zout = (f"scale=2560:-2,zoompan=z='if(eq(on,0),1.09,max(zoom-0.00040,1.0))':d={wf}:"
            f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1280x720:fps={FPS},setsar=1")
    off1 = COLD - XF1
    off2 = (off1 + WARM) - XF2
    total = off2 + END
    # back-time the VO so "Get Bromic" lands on the endcard, never truncated
    delay_s = max(1.2, total - vlen - 0.45)
    delay = int(delay_s * 1000)
    if delay_s + vlen > total - 0.2:
        log("  note", key, "VO longer than film; trimming tail silence")
    fc = (f"[0:v]{zin}[a];[1:v]{zout}[b];"
          f"[2:v]scale=1280:720,fps={FPS},setsar=1[c];"
          f"[a][b]xfade=transition=fade:duration={XF1}:offset={off1}[ab];"
          f"[ab][c]xfade=transition=fade:duration={XF2}:offset={off2}[v];"
          f"[3:a]adelay={delay}|{delay},volume=1.6,apad[au]")
    cmd = [FF,'-v','error',
           '-loop','1','-t',str(COLD),'-i',ci,
           '-loop','1','-t',str(WARM),'-i',wi,
           '-loop','1','-t',str(END),'-i',f'{S}/endcard.png',
           '-i',vo,
           '-filter_complex',fc,'-map','[v]','-map','[au]',
           '-t',str(total),
           '-c:v','libx264','-crf','19','-preset','medium','-pix_fmt','yuv420p',
           '-c:a','aac','-b:a','160k','-ar','48000','-ac','2',
           '-movflags','+faststart', final,'-y']
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        log("FFMPEG FAIL", key, r.stderr[-400:]); return
    log("FILM", key, f"{dur(final):.1f}s", os.path.getsize(final)//1024, "KB", f"(vo {vlen:.1f}s)")

sem = threading.Semaphore(3)
def w(f):
    with sem: build(f)
ts = [threading.Thread(target=w, args=(f,)) for f in FILMS]
for t in ts: t.start()
for t in ts: t.join()
print("DONE", sorted(os.listdir(OUT)))
