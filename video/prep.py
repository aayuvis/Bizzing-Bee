import re, json
src=open('/home/user/Bizzing-Bee/video/ep-origins-first-four-bees.md').read()
body=src.split('## SCRIPT',1)[1]
# split on the [0:00 — LABEL] beat markers
parts=re.split(r'\*\*\[(\d+:\d+)\s*—\s*([^\]]+)\]\*\*', body)
segs=[]
for i in range(1,len(parts),3):
    ts, label, text = parts[i], parts[i+1].strip(), parts[i+2]
    text=re.sub(r'^\*[^*\n]+\*$','',text,flags=re.M)      # drop *stage directions* on their own line
    text=re.sub(r'\*\*|\*|_','',text)                      # strip md emphasis
    text=text.replace('*[END]*','').replace('[END]','')
    text=re.sub(r'\n{2,}','\n\n',text).strip()
    if text: segs.append({'ts':ts,'label':label,'text':text})

def spoken(t):
    # Letters meant to be read one at a time: G–L–A–D–I–O–L–U–S -> "G. L. A. D. ..."
    t=re.sub(r'\b(?:[A-Z][–\-—]){2,}[A-Z]\b', lambda m:' '.join(c+'.' for c in re.split(r'[–\-—]',m.group())), t)
    # years -> words, so the model never reads "1925" as "one thousand nine hundred..."
    yrs={'1783':'seventeen eighty-three','1908':'nineteen oh eight','1925':'nineteen twenty-five',
         '1926':'nineteen twenty-six','1927':'nineteen twenty-seven','1928':'nineteen twenty-eight',
         '1929':'nineteen twenty-nine','1934':'nineteen thirty-four','1940':'nineteen forty',
         '1941':'nineteen forty-one','1988':'nineteen eighty-eight','2011':'twenty eleven'}
    for k,v in yrs.items(): t=re.sub(r'\b'+k+r'\b',v,t)
    t=t.replace('—',' — ').replace('  ',' ')
    return t.strip()

for s in segs: s['tts']=spoken(s['text'])
json.dump(segs, open('/tmp/claude-0/-home-user-Bizzing-Bee/6bb49a64-31ad-56cd-aca3-221a5aa4d9ee/scratchpad/segs.json','w'), indent=1)
words=sum(len(s['tts'].split()) for s in segs)
print(f"{len(segs)} sections, {words} words  (~{words/150:.1f} min at 150wpm)\n")
for s in segs: print(f"  [{s['ts']}] {s['label'][:28]:30} {len(s['tts'].split()):4}w")
print('\n--- sample prep check (section 1) ---'); print(segs[0]['tts'][:300])
print('\n--- letter-spelling check ---')
for s in segs:
    if 'G. L. A' in s['tts'] or 'K. N. A' in s['tts']: print(' ', [l for l in s['tts'].split('\n') if '. ' in l and l.strip()[:2].isupper()][:2])
