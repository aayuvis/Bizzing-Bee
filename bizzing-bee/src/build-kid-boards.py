import json, os, base64, urllib.request, urllib.error, threading, time
from PIL import Image

S = '/tmp/claude-0/-home-user-Bizzing-Bee/4e23cfba-e7d7-5db3-a77c-4dd0a1079ba5/scratchpad'
K = open(f'{S}/.gkey').read().strip()
URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image:generateContent"

# Deliberately NOT the photoreal parent language. The kid campaign is game key art —
# it should look like something a nine-year-old would want on a poster.
GAME = ("Bold game key-art illustration with thick confident ink outlines, "
"duotone cheer shading, dramatic rim light, high saturation, cinematic poster composition. "
"Palette: honey gold #F0B429, deep violet #4A32A8, villain crimson #C43D5A. "
"Grey is never a neutral here — grey means DRAINED and colour means ALIVE. "
"Characters are friendly rounded cartoon insects and animals with big expressive eyes. "
"FULL BLEED: the artwork fills the entire frame edge to edge. No border, no frame, no white outline around the artwork, no rounded corners, not a sticker on a background — the scene IS the whole image. No text, no captions, no letters, no logos, no watermarks, high detail.")

SHOTS = [
("K1_thegrey", GAME +
 " Split composition of one continuous meadow: the left half is completely drained of colour — ashen "
 "grey, wilted flowers, dead sky. The right half blazes with saturated honey-gold and violet, flowers "
 "bursting open. Right at the seam stands a small brave cartoon bee with her wings spread, and a visible "
 "shockwave of colour is rushing outward from her, repainting the grey as it goes. Heroic wide shot."),
("K2_bossfight", GAME +
 " A small cartoon bee hovers defiantly in the dark facing an enormous looming moth-cloud monster made of "
 "swirling grey smoke with glowing crimson eyes. The bee is surrounded by a partly built shield of glowing "
 "golden hexagons, some hexagons still missing. Dramatic low angle, rim light, real peril but never gory."),
("K3_duel", GAME +
 " A father and his young daughter sit on a living-room sofa either side of a single tablet propped "
 "between them like a chessboard, both leaning in, competitive and laughing. Warm lamplight, cosy home, "
 "drawn in the same bold sticker illustration style. Wide shot, joyful."),
("K4_evolution", GAME +
 " A triumphant left-to-right evolution line-up of the SAME character growing through ten stages across "
 "the frame: starting tiny as an egg at far left, then a grub, then a pupa, then a small bee, growing "
 "steadily larger and grander until at the far right it is a magnificent crowned queen bee wearing a "
 "golden crown and cape. Each stage stands on a rising golden step. Clean poster line-up, honey-gold glow."),
("K5_grandprix", GAME +
 " A high-speed side-on racing shot: a small cartoon bee riding a tiny rocket-powered kart, trailing "
 "golden flame, overtaking a sneering crimson hornet villain on a dark spiked machine. Speed lines, "
 "flying sparks, a curving road disappearing into the distance. Dynamic, exhilarating, wide shot."),
("K6_packdrop", GAME +
 " A glowing treasure pack bursting open in mid-air in a dark room, brilliant golden light exploding out "
 "of the seam, and a dozen collectible character cards fanning outward through the air around it, each "
 "card showing a different rounded cartoon animal or insect character. One card in the centre glows "
 "brighter and gold than all the others. Ecstatic reveal moment, dramatic lighting."),
("K7_finalboss", GAME +
 " An enormous ancient stone door at the top of a long dark staircase, carved with a giant keyhole, "
 "glowing crimson light seeping around its edges. At the bottom of the stairs a tiny cartoon bee looks up "
 "at it, small but completely undaunted, fists clenched. Awe, scale and challenge. Wide vertical drama."),
("K8_traitor", GAME +
 " A glowing arcade-machine spirit character standing half in warm golden light and half consumed by "
 "crawling crimson corruption, turning its back on a small shocked cartoon bee who reaches out toward it. "
 "Betrayal, heartbreak, cinematic backlight, arcade cabinet glow. Emotional wide shot."),
]

lock = threading.Lock()
def log(*a):
    with lock: print(*a, flush=True)

def gen(it):
    n, pr = it
    path = f'{S}/board/{n}.png'
    if os.path.exists(path) and os.path.getsize(path) > 50000:
        log("skip", n); return
    body = {"contents": [{"parts": [{"text": pr}]}],
            "generationConfig": {"responseModalities": ["IMAGE"],
                                 "imageConfig": {"aspectRatio": "16:9"}}}
    for a in range(5):
        try:
            r = urllib.request.Request(URL, data=json.dumps(body).encode(),
                headers={"Content-Type": "application/json", "X-goog-api-key": K})
            d = json.load(urllib.request.urlopen(r, timeout=300))
            for p in d["candidates"][0]["content"]["parts"]:
                if "inlineData" in p:
                    open(path, "wb").write(base64.b64decode(p["inlineData"]["data"]))
                    log("OK", n); return
            log("no image", n, json.dumps(d)[:120])
        except Exception as e:
            m = e.read()[:90].decode() if isinstance(e, urllib.error.HTTPError) else str(e)[:90]
            log("retry", a, n, m); time.sleep(10 * (a + 1))
    log("FAIL", n)

sem = threading.Semaphore(3)
def w(i):
    with sem: gen(i)
ts = [threading.Thread(target=w, args=(i,)) for i in SHOTS]
for t in ts: t.start()
for t in ts: t.join()

ok = 0
for n, _ in SHOTS:
    p = f'{S}/board/{n}.png'
    if not os.path.exists(p): continue
    im = Image.open(p).convert('RGB')
    for wd, q, d in ((1400, 74, 'jpg'), (900, 72, 'jpg-web')):
        o = im.resize((wd, int(im.height * wd / im.width)), Image.LANCZOS)
        o.save(f'{S}/{d}/{n}.jpg', 'JPEG', quality=q, optimize=True, progressive=True)
    ok += 1
print("DONE", ok, "/", len(SHOTS))
