import sys, json, concurrent.futures as cf
sys.path.insert(0,'/tmp/claude-0/-home-user-Bizzing-Bee/6bb49a64-31ad-56cd-aca3-221a5aa4d9ee/scratchpad')
from tts import say
segs=json.load(open('/tmp/claude-0/-home-user-Bizzing-Bee/6bb49a64-31ad-56cd-aca3-221a5aa4d9ee/scratchpad/segs.json'))
STYLE=("Speak at a natural, brisk conversational pace, like a great storyteller talking to a friend. "
       "Warm, confident, engaging. Keep it moving. Do NOT slow down, do NOT add long dramatic pauses, "
       "do NOT sound solemn or ponderous.")
M="gemini-2.5-pro-preview-tts"; V="Despina"
def run(a):
    i,s=a
    return i, s['label'], say(M, V, s['tts'], STYLE, f"full/{i:02d}-"+s['label'].lower().replace(' ','-'))
with cf.ThreadPoolExecutor(max_workers=3) as ex:
    for i,lab,res in ex.map(run, list(enumerate(segs,1))):
        print(f"{i:02d} {lab[:26]:28} {res}")
