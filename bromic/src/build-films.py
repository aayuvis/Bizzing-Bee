import json, os, time, threading, urllib.request, urllib.error, subprocess
import imageio_ffmpeg

S = '/tmp/claude-0/-home-user-Bizzing-Bee/4e23cfba-e7d7-5db3-a77c-4dd0a1079ba5/scratchpad'
K = open(f'{S}/.gkey').read().strip()
B = "https://generativelanguage.googleapis.com/v1beta"
MODEL = "veo-3.1-generate-preview"
OUT = f'{S}/video'; os.makedirs(OUT, exist_ok=True)
FF = imageio_ffmpeg.get_ffmpeg_exe()

LOOK = ("Cinematic, shot on ARRI Alexa, anamorphic lens, shallow depth of field, restrained muted colour "
        "grade, architectural-digest production design. Dry deadpan comedy played completely straight — "
        "no mugging, no exaggerated expressions. No on-screen text, no captions, no logos. ")
WARM = ("A long sleek matte-black linear radiant heater mounted flush overhead glows amber and the whole "
        "space fills with warm golden light. ")

# (key, clip A prompt, clip B prompt)
FILMS = [
("01_mushroom",
 LOOK+"Slow push in. A pristine luxury outdoor kitchen and lounge terrace at dusk, cold blue light, dead "
 "leaves on the stone. Dead centre of the huge empty terrace, one cheap small mushroom-shaped propane patio "
 "heater. Three adults in heavy winter coats huddle pressed shoulder to shoulder within one metre of it, "
 "holding wine glasses, shivering slightly. Everything else — the outdoor kitchen, the twelve-seat table, "
 "the built-in sofa — is empty. Audio: cold wind, faint hiss of gas, distant muffled laughter from indoors. "
 "No music, no speech.",
 LOOK+WARM+"Same luxury terrace, now full of life: fourteen well-dressed adults in shirtsleeves and light "
 "knitwear eating and laughing at the long table and sprawled across the built-in sofa. Camera slowly pulls "
 "back to reveal the full space in use. Audio: warm ambient conversation and laughter, then a dry deadpan "
 "narrator says calmly, \"Get Bromic.\" No music."),
("02_pizza_oven",
 LOOK+"Night, freezing. A man alone in a thick puffer jacket and beanie stands beside a large expensive "
 "wood-fired pizza oven on a beautiful modern terrace, holding a pizza peel, breath visible. He watches "
 "through large glass doors as his family and friends eat pizza inside the warm bright kitchen without him. "
 "Slow static wide shot. Audio: crackling fire, cold wind, muffled laughter through glass. No music, no speech.",
 LOOK+WARM+"The same terrace. The man, now in shirtsleeves, slides a pizza onto a long table surrounded by "
 "twelve friends in light clothing eating outdoors together, delighted. Audio: laughter, cutlery, then a dry "
 "deadpan narrator says calmly, \"Get Bromic.\" No music."),
("03_snowbirds",
 LOOK+"Grey overcast morning. An elegant retired couple in their late sixties in winter coats load suitcases "
 "into the boot of a large SUV in the driveway of their beautiful modern home. Behind them through a side "
 "gate, their immaculate empty terrace and outdoor lounge. They are leaving. Slow wide shot. Audio: car boot "
 "closing, wind, distant traffic. No music, no speech.",
 LOOK+WARM+"Night. The same retired couple, now in light clothing, sit outdoors on their own beautiful "
 "terrace with friends around a long table, wine poured, completely comfortable. They never left. Audio: warm "
 "conversation, glasses, then a dry deadpan narrator says calmly, \"Get Bromic.\" No music."),
("04_big_game",
 LOOK+"Interior night. Twenty-two adults crammed uncomfortably shoulder to shoulder into a living room, all "
 "facing one modest wall-mounted television. Camera slowly pushes past them, through large glass doors, to "
 "the covered outdoor lounge beyond — a huge outdoor television, a bar, deep sofas, completely dark, dry and "
 "empty. Audio: muffled crowd noise from the TV, cramped room tone, then silence outside. No music, no speech.",
 LOOK+WARM+"Night. The covered outdoor lounge with its huge outdoor television is packed with twenty-two "
 "adults in light clothing watching a game, drinks raised, cheering at a big play. Audio: a big cheer, then a "
 "dry deadpan narrator says calmly, \"Get Bromic.\" No music."),
("05_coastal",
 LOOK+"A stunning modern beach house deck overlooking the ocean at five in the evening. A strong sea breeze "
 "lifts napkins and hair. Guests in coats hurriedly gather plates and glasses and retreat indoors, "
 "abandoning a beautifully set outdoor table mid-meal. Wide cinematic shot, blue hour. Audio: hard wind, "
 "surf, chairs scraping, a door sliding shut. No music, no speech.",
 LOOK+WARM+"The same beach house deck at dusk. Guests in light linen sit calmly at the same beautifully set "
 "table, palms moving in the wind behind them, completely unaffected. Audio: surf, wind in the palms, calm "
 "conversation, then a dry deadpan narrator says calmly, \"Get Bromic.\" No music."),
("06_fire_pit",
 LOOK+"Night, high overhead wide shot looking straight down. Six adults in heavy coats sit in a tight ring "
 "of low stools around a small fire pit, faces lit orange, backs in darkness. In perfect silent unison they "
 "all rotate 180 degrees to warm their backs. Just outside the ring, a large expensive modern outdoor "
 "sectional sofa sits completely empty. Audio: crackling fire, cold wind, no conversation. No music, no speech.",
 LOOK+WARM+"Night. The same six adults, now in light clothing, sprawled comfortably across the large modern "
 "outdoor sectional sofa, relaxed and talking, the fire pit forgotten. Audio: easy conversation and laughter, "
 "then a dry deadpan narrator says calmly, \"Get Bromic.\" No music."),
("07_punch_list",
 LOOK+"Cold grey daylight. A custom home builder in a quarter-zip and a well-dressed client in their fifties "
 "stand on a beautiful newly finished covered terrace during a final walkthrough. The client looks down at a "
 "clipboard and writes one more line at the bottom of the list. The builder watches, resigned. Slow push in "
 "on the builder's face. Audio: pen on paper, wind, distant construction. No music, no speech.",
 LOOK+WARM+"Evening. The same terrace, now warm and full — the client hosting twelve people at a long table, "
 "delighted. The builder stands at the edge of frame, quietly pleased. Audio: warm party ambience, then a dry "
 "deadpan narrator says calmly, \"Specify heat. Get Bromic.\" No music."),
("08_square_footage",
 LOOK+"Dusk, cold grey light. A builder and a client stand on a large finished covered terrace, the builder "
 "gesturing across the empty space as if measuring it, holding rolled plans. The terrace is beautiful, "
 "expensive and completely unused, some furniture still wrapped in plastic. Slow wide tracking shot. Audio: "
 "wind, plastic sheeting flapping, footsteps on stone. No music, no speech.",
 LOOK+WARM+"Evening. The same terrace fully furnished, unwrapped and packed with people dining and talking, "
 "clearly a room of the house. Audio: full room ambience, then a dry deadpan narrator says calmly, "
 "\"Six hundred more square feet. Get Bromic.\" No music."),
("09_forty_covers",
 LOOK+"Night. An upscale restaurant terrace beautifully set with forty empty seats, roped off with a velvet "
 "rope, cold and dark, a menu board fluttering. Camera tracks slowly past the empty terrace to reveal, "
 "through glass, the packed warm golden interior dining room with a queue of people waiting near the door. "
 "Audio: cold wind outside, muffled busy restaurant noise through glass. No music, no speech.",
 LOOK+WARM+"Night. The same restaurant terrace, now warm and completely full — forty covers seated, served, "
 "eating, staff moving between tables. Audio: busy restaurant ambience, then a dry deadpan narrator says "
 "calmly, \"Forty more covers. Get Bromic.\" No music."),
("10_heater_graveyard",
 LOOK+"A hotel back-of-house storeroom crammed with fifteen mismatched dented rusting mushroom-shaped patio "
 "heaters and propane gas bottles stacked haphazardly — ten years of accumulated cheap fixes. Harsh "
 "fluorescent light, concrete floor. Camera tracks slowly along the row like a museum exhibit. Audio: "
 "fluorescent hum, a gas bottle knocking, footsteps on concrete. No music, no speech.",
 LOOK+WARM+"A beautiful full hotel courtyard terrace at night, guests dining comfortably, sleek linear "
 "heaters glowing overhead, not a single mushroom heater or gas bottle in sight. Audio: warm courtyard "
 "ambience, then a dry deadpan narrator says calmly, \"Stop buying it twice. Get Bromic.\" No music."),
]

lock = threading.Lock()
def log(*a):
    with lock: print(*a, flush=True)

import re as _re
def strip_speech(p):
    p=_re.sub(r'then a dry deadpan narrator says calmly, "[^"]*\."', 'no speech.', p)
    p=_re.sub(r',?\s*then a dry deadpan narrator[^.]*\.', ' no speech.', p)
    return p

def submit(prompt):
    prompt = strip_speech(prompt)
    body = {"instances":[{"prompt":prompt}],
            "parameters":{"aspectRatio":"16:9","durationSeconds":8}}
    for a in range(5):
        try:
            r = urllib.request.Request(f"{B}/models/{MODEL}:predictLongRunning",
                data=json.dumps(body).encode(),
                headers={"Content-Type":"application/json","X-goog-api-key":K})
            return json.load(urllib.request.urlopen(r, timeout=180))["name"]
        except urllib.error.HTTPError as e:
            msg = e.read()[:120].decode()
            log("  submit retry", a, e.code, msg)
            time.sleep(30*(a+1))
        except Exception as e:
            log("  submit retry", a, str(e)[:100]); time.sleep(30*(a+1))
    return None

def wait(name, tag):
    for i in range(90):
        try:
            r = urllib.request.Request(f"{B}/{name}", headers={"X-goog-api-key":K})
            d = json.load(urllib.request.urlopen(r, timeout=60))
            if d.get("done"):
                if "error" in d: log("  op error", tag, str(d["error"])[:140]); return None
                gv = d.get("response",{}).get("generateVideoResponse",{})
                if "generatedSamples" not in gv:
                    log("  FILTERED", tag, str(gv.get("raiMediaFilteredReasons",""))[:120]); return None
                return gv["generatedSamples"][0]["video"]["uri"]
        except Exception as e:
            log("  poll", tag, str(e)[:80])
        time.sleep(15)
    log("  timeout", tag); return None

def download(uri, path):
    sep = '&' if '?' in uri else '?'
    subprocess.run(["curl","-sL",f"{uri}{sep}key={K}","-o",path], check=True)
    return os.path.getsize(path) > 100000

def make(film):
    key, pa, pb = film
    final = f"{OUT}/{key}.mp4"
    if os.path.exists(final) and os.path.getsize(final) > 200000:
        log("skip", key); return
    parts = []
    for label, prompt in (("a", pa), ("b", pb)):
        p = f"{OUT}/{key}_{label}.mp4"
        if os.path.exists(p) and os.path.getsize(p) > 100000:
            parts.append(p); continue
        op = submit(prompt)
        if not op: log("FAIL submit", key, label); return
        uri = wait(op, f"{key}{label}")
        if not uri: log("FAIL wait", key, label); return
        if not download(uri, p): log("FAIL dl", key, label); return
        log("  clip", key, label, "ok")
        parts.append(p)
    parts.append(f"{S}/endcard.mp4")
    lst = f"{OUT}/{key}.txt"
    open(lst,"w").write("".join(f"file '{p if p.startswith('/') else os.path.basename(p)}'\n" for p in parts))
    subprocess.run([FF,"-v","error","-f","concat","-safe","0","-i",lst,
                    "-vf","scale=1280:720,fps=24","-c:v","libx264","-crf","20","-preset","medium","-c:a","aac","-b:a","128k","-ar","48000","-ac","2",
                    "-movflags","+faststart", final, "-y"], cwd=OUT, check=True)
    log("FILM", key, os.path.getsize(final)//1024, "KB")

sem = threading.Semaphore(3)
def w(f):
    with sem: make(f)
ts = [threading.Thread(target=w, args=(f,)) for f in FILMS]
for t in ts: t.start()
for t in ts: t.join()
print("ALL DONE", sorted(f for f in os.listdir(OUT) if f.endswith('.mp4') and '_a' not in f and '_b' not in f))
