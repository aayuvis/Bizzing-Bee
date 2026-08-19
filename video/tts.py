import json,base64,struct,sys,urllib.request,os
KEY=open('/root/.gkey').read().strip()
S='/tmp/claude-0/-home-user-Bizzing-Bee/6bb49a64-31ad-56cd-aca3-221a5aa4d9ee/scratchpad/vo'
def wav(pcm, rate=24000):
    return (b'RIFF'+struct.pack('<I',36+len(pcm))+b'WAVEfmt '+struct.pack('<IHHIIHH',16,1,1,rate,rate*2,2,16)
            +b'data'+struct.pack('<I',len(pcm))+pcm)
def say(model, voice, text, style, out):
    body={"contents":[{"parts":[{"text":style+"\n\n"+text}]}],
          "generationConfig":{"responseModalities":["AUDIO"],
            "speechConfig":{"voiceConfig":{"prebuiltVoiceConfig":{"voiceName":voice}}}}}
    req=urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
        data=json.dumps(body).encode(), headers={"x-goog-api-key":KEY,"Content-Type":"application/json"})
    try:
        r=json.load(urllib.request.urlopen(req, timeout=120))
    except urllib.error.HTTPError as e:
        return f"HTTP {e.code}: {e.read()[:300].decode(errors='replace')}"
    try:
        p=r['candidates'][0]['content']['parts'][0]['inlineData']
        pcm=base64.b64decode(p['data'])
        rate=int(p['mimeType'].split('rate=')[1]) if 'rate=' in p['mimeType'] else 24000
        open(f'{S}/{out}.wav','wb').write(wav(pcm,rate))
        return f"ok {len(pcm)/2/rate:.1f}s  {p['mimeType']}"
    except Exception as ex:
        return f"parse fail: {ex} :: {json.dumps(r)[:300]}"
if __name__=='__main__':
    print(say(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5]))
