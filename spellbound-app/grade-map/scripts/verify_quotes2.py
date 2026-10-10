import json,re,html,subprocess
def norm(t):
    t=html.unescape(re.sub(r'<[^>]+>','',t))
    t=t.replace('–','-').replace('‘',"'").replace('’',"'").replace('“','"').replace('”','"').replace(' ',' ')
    t=t.replace('"','').replace("'",'')
    return re.sub(r'\s+',' ',t).lower()
corpus=''
for f in ['dl/us/ccss-extract.txt','dl/uk/app1.txt','dl/uk2/ks12.txt','dl/uk2/ks3.txt','dl/cbse/sec-english.txt']:
    corpus+=' '+norm(open(f).read())
lay=subprocess.run(['venv/bin/python','-I','scripts/pdflayout.py','dl/uk/app1.pdf','1','26'],capture_output=True,text=True).stdout
lay=re.sub(r' {3,}',' ',lay)
corpus+=' '+norm(lay)
corpus=re.sub(r'\s+',' ',corpus)
d=json.load(open('grade-map.json'))
strings=[]
def walk(x):
    if isinstance(x,str): strings.append(x)
    elif isinstance(x,list): [walk(i) for i in x]
    elif isinstance(x,dict): [walk(v) for k,v in x.items() if k not in ('sources','note')]
walk(d['regions'])
pat=re.compile(r"(?:(?<=[\s(:])|^)'(.+?)'(?=[\s,;.):]|$)")
frags=set()
for s in strings:
    for m in pat.finditer(s): 
        if len(m.group(1))>=8: frags.add(m.group(1))
bad=[]
for fr in sorted(frags):
    n=norm(fr).strip(' .')
    pieces=[p.strip(' .,') for p in n.split('...') if len(p.strip(' .,'))>3]
    if not all(p in corpus for p in pieces): bad.append(fr)
print(len(frags),'quoted fragments;',len(bad),'not found verbatim:')
for b in bad: print(' -',b)
