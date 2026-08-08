import json, os, base64, urllib.request, urllib.error, threading, time
from PIL import Image

S = '/tmp/claude-0/-home-user-Bizzing-Bee/4e23cfba-e7d7-5db3-a77c-4dd0a1079ba5/scratchpad'
K = open(f'{S}/.gkey').read().strip()
URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image:generateContent"
for d in ('board', 'jpg', 'jpg-web'):
    os.makedirs(f'{S}/{d}', exist_ok=True)

# Warm, honest, cinematic — the opposite of stocky edtech. Children framed wide or from
# behind so no board reads as a casting portrait of a real minor.
PHOTO = ("Warm cinematic editorial photograph, 35mm, soft natural motivated light, shallow depth of field, "
"honest documentary family feel, rich but natural colour, photorealistic, ultra detailed, 8k, "
"no text, no captions, no logos, no watermarks, no legible writing anywhere. "
"Children are framed wide, from behind or in profile — never a close-up portrait face-on. ")

ILLO = ("Children's picture-book illustration, gouache and coloured-pencil texture, warm honey-gold and deep "
"violet palette, charming and characterful, hand-made not corporate, high detail, "
"no text, no logos, no watermarks. ")

SHOTS = [
# ---- WHY SPELL: the platform films -------------------------------------------------
("WS1_arsenal", PHOTO +
 "A vast dim armoury hall, rack upon rack of small wooden drawers and shelves stretching away into "
 "darkness like an arsenal, each shelf holding rows of small blank pale tiles. In the foreground, "
 "seen from behind, a lone figure in a good suit stands at a lectern in a single shaft of warm light, "
 "reaching out to take exactly one tile from a rack. Monumental, cinematic, wide symmetrical shot."),
("WS2_interview", PHOTO +
 "A modern glass-walled interview room, shot wide from outside through the glass. At an identical table, "
 "two equally sharp, equally likeable candidates in their twenties are seen in the same room in two "
 "moments: one sits mid-sentence with an open confident gesture and the panel leaning in; the other sits "
 "with hands folded, mouth closed, searching for a word, the panel politely waiting. Cool daylight, "
 "restrained corporate palette, deadpan and fair to both."),
("WS3_toast", PHOTO +
 "A warm wedding reception at night in a marquee strung with festoon lights. A man stands mid-speech "
 "holding a champagne glass, seen from behind over the shoulders of the seated tables. Every single face "
 "at the long tables is turned toward him, genuinely rapt, several laughing. Golden candlelight, "
 "wide shot, affectionate and alive."),
("WS4_pitch", PHOTO +
 "A suburban front-yard lemonade stand on a bright summer afternoon. A nine-year-old girl, seen in "
 "profile, stands behind the crate table mid-argument with one hand raised making a point. Four adult "
 "neighbours stand in a loose semicircle, wallets already out, genuinely persuaded and amused. "
 "Warm afternoon light, wide documentary shot."),
("WS5_creator", PHOTO +
 "A single twelve-year-old boy, alone in his own bedroom at night, sitting cross-legged on the floor and "
 "seen from behind and slightly to the side over his shoulder. He is talking animatedly, one hand raised "
 "mid-explanation, to a smartphone clamped on a small tripod in front of him with a cheap ring light. No "
 "adults and no other children anywhere in the frame. The bedroom is ordinary, messy and lived-in with a "
 "single bed and posters. Warm lamplight, shallow depth of field, intimate and unglamorous, no screen "
 "content visible."),
("WS6_comeback", PHOTO +
 "A school corridor at end of day. A small girl, seen in profile, stands calmly facing two taller "
 "children, mid-sentence, entirely composed. The taller children have stopped, caught out, one almost "
 "smiling. Cool overcast light through high windows, wide shot, kind rather than cruel."),
("WS7_metaphor", PHOTO +
 "A kitchen table covered in a genuinely complicated diagram on a large sheet of paper, and beside it a "
 "simple arrangement of everyday objects — an orange, a lamp, a coin — set out to explain the same thing. "
 "A pair of adult hands and a pair of child's hands rest on either side. Overhead shot looking straight "
 "down, warm evening light, no legible writing."),
("WS8_kit", PHOTO +
 "An honest overhead flat-lay on weathered pale wood, shot straight down, arranged like expedition kit: "
 "a pair of worn leather walking boots, a canvas backpack, a rolled map, a compass, a water bottle — and "
 "laid out among them in the same neat rows, a set of small blank pale wooden tiles treated as equipment. "
 "Natural daylight, soft shadow, editorial still life, no writing on any tile."),
# ---- CORE: the competitive circuit --------------------------------------------------
("C1_fortnight", PHOTO +
 "A kitchen wall calendar seen at a slight angle in warm morning light, the last fourteen squares marked "
 "with small hand-drawn symbols and a circle around the final one. On the counter below, a stack of "
 "well-used flashcards, a kitchen timer and a mug. Shallow depth of field, quiet and domestic, "
 "no legible writing."),
("C2_french", PHOTO +
 "A close-up of a child's ear and the edge of their jaw in profile, wearing one large over-ear headphone "
 "cup, eyes just out of frame, concentrating hard. Beside them on the desk sits a small plastic smart "
 "speaker, out of focus. Low warm desk light, very shallow depth of field, intimate and serious."),
("C3_oral", PHOTO +
 "A school hall stage seen from the wings. A child stands alone in profile at a standing microphone in a "
 "hard spotlight, composed, hands at their sides, facing a dark auditorium. In the foreground, out of "
 "focus, an abandoned laptop sits open on a chair. Cinematic, high contrast, wide shot."),
("C4_plateau", PHOTO +
 "A child asleep face-down on a desk in the late evening, seen from the side and above, head on folded "
 "arms beside a closed workbook and a cold cup of tea. A parent's hand rests lightly on their shoulder, "
 "the parent otherwise out of frame. Warm low lamplight, tender, shallow depth of field."),
# ---- APP ---------------------------------------------------------------------------
("BB01_dinner", PHOTO +
 "A family dinner table at night. A father in his forties sits with a fork paused halfway to his mouth, "
 "brow furrowed, completely stumped and quietly delighted. Across the table his nine-year-old daughter, "
 "seen from behind and side-on, sits calmly waiting. The mother is laughing into her hand. Warm domestic "
 "lamplight, wide shot."),
("BB02_groupchat", PHOTO +
 "A man in his forties standing in a kitchen at night staring at his phone with a defeated expression, "
 "one hand on the counter. Behind him through a doorway a child sits cross-legged on a sofa with a "
 "tablet, entirely relaxed. Warm lamplight, wide shot, shot from the side, no screen content visible."),
("BB03_scrabble", PHOTO +
 "Overhead shot looking straight down at a generic wooden word-tile board game on a coffee table "
 "mid-game, one very long word laid across it. Four pairs of adult hands rest motionless around the "
 "board; one small pair of child's hands is folded neatly. Warm evening lamplight, game night, "
 "no legible letters."),
("BB04_autocorrect", PHOTO +
 "Over-the-shoulder close-up of a child's hands typing on a tablet at a kitchen table, screen glowing "
 "blank and out of focus, an adult's hand hovering nearby about to point and hesitating. Warm morning "
 "light, shallow depth of field, no legible text on screen."),
("BB05_tunnel", PHOTO +
 "Interior of a car in the middle of the night, shot from the front passenger seat looking back into the "
 "rear seats. Every window is pitch black — total darkness outside, no streetlights, nothing visible at "
 "all. A nine-year-old child sits alone in the back seat absorbed in a tablet held on their lap, their "
 "face lit only by the pale glow of the screen from below. Everything else in the car is nearly black. "
 "Night interior, very high contrast, single-source lighting, cinematic, no screen content legible."),
("BB06_wallchart", PHOTO +
 "A child's bedroom wall covered floor to ceiling in hundreds of small blank paper cards pinned in neat "
 "rows, like a vast collection. A small figure stands at the bottom of the wall looking up, seen from "
 "behind. Warm lamplight, wide symmetrical shot, quietly monumental, no legible writing."),
("BB07_voice", PHOTO +
 "A child wearing large over-ear headphones at a desk with a tablet, seen in profile, eyes closed, "
 "mouthing a word carefully. Warm low light, shallow depth of field, intimate and serious."),
("BB08_parentteacher", PHOTO +
 "A primary school classroom after hours. A teacher sits on one side of a small low table, two parents on "
 "tiny children's chairs opposite, mid-conversation. The teacher leans forward, curious and impressed, "
 "gesturing with an open hand. Warm late-afternoon light through classroom windows, wide shot."),
# ---- BOOKS -------------------------------------------------------------------------
("BB09_spine", PHOTO +
 "Extreme close-up still life of a single thin hardback children's PICTURE BOOK standing upright, shot "
 "side-on so the SPINE faces the camera and fills the frame. The spine is deeply cracked, creased and "
 "softened with pale white stress lines from hundreds of readings, the cloth fraying at the head and "
 "tail, the corners bumped and rounded, a frayed ribbon bookmark trailing out of the pages. It rests on "
 "a wooden bedside table under a warm lamp. Macro detail on the worn spine texture, very shallow depth "
 "of field, tender, no text or lettering anywhere on the book."),
("BB10_cast", ILLO +
 "An ensemble hero illustration: a friendly round cartoon bee character and its crew of insect friends "
 "standing shoulder to shoulder in a sunlit meadow of enormous flowers, storybook adventure poster "
 "composition, honey-gold light, characterful and warm."),
("BB11_firstword", PHOTO +
 "A very young child standing on a kitchen chair at a family breakfast table, arms out mid-sentence, "
 "clearly saying something long and impressive. Two adults look at each other in amused astonishment. "
 "Warm morning light, wide shot, seen slightly from behind the child."),
("BB12_bedtime", ILLO +
 "A cosy children's bedroom at night in warm lamplight: a stack of picture books on the bedside table, a "
 "tablet resting on top of the stack, and a small round cartoon bee character perched on the very top "
 "like a mascot. Honey-gold and deep violet, tender and inviting."),
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
