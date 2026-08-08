import json,os,base64,urllib.request,urllib.error,threading,time
K=open('.gkey').read().strip()
JPG='jpg'; OUT='board'
KEEP=("Keep the exact same location, same camera position, same lens, same framing, same architecture and "
"same furniture as the reference image, matched precisely so the two shots cut together. Photorealistic "
"cinematic film still, no text, no logos. Change only this: ")
WARM=("the space is now warm — a long sleek matte-black linear radiant heater is mounted flush overhead "
"glowing soft amber, and the whole space is lit in warm golden light. ")
P=[("01a_mushroom_before","01b_mushroom_after",KEEP+WARM+"Remove the cheap mushroom patio heater completely. The terrace is now full: fourteen well-dressed adults in shirtsleeves and light knitwear eating and laughing at the long dining table and sprawled across the built-in sofa."),
   ("02a_pizza_before","02b_pizza_after",KEEP+WARM+"The same man is now in shirtsleeves with no coat, sliding a pizza from the same oven onto a table surrounded by twelve friends in light clothing eating outdoors together, delighted."),
   ("03a_snowbird_before","03b_snowbird_after",KEEP+WARM+"The suitcases and the SUV are gone. The same retired couple, now in light clothing with no coats, are setting a long outdoor table for friends at the same house. They never left."),
   ("04a_biggame_before","04b_biggame_after",KEEP+WARM+"Reverse the situation: the covered outdoor lounge with the huge outdoor television is now packed with twenty-two adults in light clothing watching the game and cheering, while the interior living room behind is empty and dark."),
   ("05a_coastal_before","05b_coastal_after",KEEP+WARM+"The same guests, now in light linen with no coats, sit calmly and comfortably at the same beautifully set outdoor table. Nobody is retreating indoors. The breeze still moves the plants but the people are unaffected."),
   ("06a_spec_before","06b_spec_after",KEEP+"the same architect is now confident and mid-explanation, and the screen now shows a warm golden evening render of the terrace with sleek linear overhead heaters glowing amber and people dining outdoors in light clothing. The same client nods, convinced."),
]
lock=threading.Lock()
def run(t):
    src,dst,pr=t
    sp=f"{JPG}/{src}.jpg"
    if not os.path.exists(sp):
        with lock: print("no src",src); return
    b64=base64.b64encode(open(sp,'rb').read()).decode()
    payload={"contents":[{"parts":[{"inlineData":{"mimeType":"image/jpeg","data":b64}},{"text":pr}]}],
             "generationConfig":{"responseModalities":["IMAGE"],"imageConfig":{"aspectRatio":"16:9"}}}
    for a in range(3):
        try:
            req=urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image:generateContent",
              data=json.dumps(payload).encode(),headers={"Content-Type":"application/json","X-goog-api-key":K})
            d=json.load(urllib.request.urlopen(req,timeout=260))
            c=d.get("candidates")
            if not c:
                with lock: print("blocked",dst,json.dumps(d)[:120]); return
            for p in c[0]["content"]["parts"]:
                if "inlineData" in p:
                    open(f"{OUT}/{dst}.png","wb").write(base64.b64decode(p["inlineData"]["data"]))
                    with lock: print("MATCHED",dst); return
            with lock: print("noimg",dst)
        except urllib.error.HTTPError as e:
            with lock: print("retry",a,dst,e.code,e.read()[:80].decode().replace("\n"," "))
            time.sleep(20*(a+1))
        except Exception as e:
            with lock: print("retry",a,dst,str(e)[:80]); time.sleep(20*(a+1))
    with lock: print("FAIL",dst)
sem=threading.Semaphore(2)
def w(t):
    with sem: run(t)
ts=[threading.Thread(target=w,args=(t,)) for t in P]
for t in ts: t.start()
for t in ts: t.join()
print("DONE")
