import json,re,html
def norm(t):
    t=html.unescape(re.sub(r'<[^>]+>','',t))
    t=t.replace('–','-').replace('‘',"'").replace('’',"'").replace('“','"').replace('”','"').replace(' ',' ')
    t=t.replace('"','').replace("'",'')
    t=re.sub(r'-\s*\n\s*','-',t)
    return re.sub(r'\s+',' ',t).lower()
corpus=''
for f in ['dl/us/ccss-extract.txt','dl/uk/app1.txt','dl/uk2/ks12.txt','dl/uk2/ks3.txt','dl/cbse/sec-english.txt']:
    corpus+=' '+norm(open(f).read())
# also layout text of app1 for table cells
import subprocess
corpus+=' '+norm(subprocess.run(['venv/bin/python','-I','scripts/pdflayout.py','dl/uk/app1.pdf','1','26'],capture_output=True,text=True).stdout)
corpus+=' '+norm(open('dl/us/l6.txt').read()) if False else ''
d=json.load(open('grade-map.json'))
s=json.dumps(d,ensure_ascii=False)
frags=set(re.findall(r"'([^']{12,}?)'",s))
bad=[]
for fr in sorted(frags):
    n=norm(fr).strip(' .')
    # allow ellipsis: check each piece
    pieces=[p.strip(' .,') for p in n.split('...') if len(p.strip(' .,'))>3]
    if not all(p in corpus for p in pieces): bad.append(fr)
print(len(frags),'quoted fragments;',len(bad),'not found verbatim:')
for b in bad: print(' -',b)
