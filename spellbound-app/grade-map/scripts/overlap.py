import json,re
wl=json.load(open('dl/uk/wordlists.json'))
def expand(e):
    e=e.replace('*','').strip()
    m=re.match(r'(\w+) \(–ped, –ment\)',e)
    if m: b=m.group(1); return [b,b+'ped',b+'ment']
    m=re.match(r'(\w+) \(critic \+ ise\)',e)
    if m: return [m.group(1)]
    out=[]
    for part in e.split('/'):
        m=re.match(r'(\w+)\((\w+)\)',part)
        if m: out+= [m.group(1), m.group(1)+m.group(2)]
        else: out.append(part)
    return [o.lower() for o in out]
US={'favourite':'favorite','centre':'center','criticise':'criticize','recognise':'recognize','programme':'program','marvellous':'marvelous','neighbour':'neighbor'}
def forms(lst):
    s={}
    for e in lst:
        for f in expand(e):
            s[f]=e
            if f in US: s[US[f]]=e
    return s
Y34=forms(wl['y34']); Y56=forms(wl['y56'])
CC={'telegraph':'L.4.4b','photograph':'L.4.4b/L.5.4b','autograph':'L.4.4b','photosynthesis':'L.5.4b','audience':'L.6.4b','auditory':'L.6.4b','audible':'L.6.4b','belligerent':'L.7.4b','bellicose':'L.7.4b','rebel':'L.7.4b','precede':'L.8.4b','recede':'L.8.4b','secede':'L.8.4b','agreeable':'L.3.4b','disagreeable':'L.3.4b','comfortable':'L.3.4b','uncomfortable':'L.3.4b','careless':'L.3.4b','preheat':'L.3.4b','company':'L.3.4c','companion':'L.3.4c','sitting':'L.3.2e','smiled':'L.3.2e','cries':'L.3.2e','happiness':'L.3.2e'}
trail=json.load(open('dl/../work/trail.json')) if False else json.load(open('work/trail.json'))
res={}
for a in trail:
    for s in a['stops']:
        ws=[w.lower() for w in s['words']]
        r={'n':len(ws),'y34':sorted({w for w in ws if w in Y34}),'y56':sorted({w for w in ws if w in Y56}),'cc':sorted({w+':'+CC[w] for w in ws if w in CC})}
        res[s['unit']]=r
        if r['y34'] or r['y56'] or r['cc']: print(a['act'],s['unit'],s['title'][:40],'| n=',r['n'],'| Y3-4:',r['y34'],'| Y5-6:',r['y56'],'| CC:',r['cc'])
json.dump(res,open('work/overlap.json','w'),indent=0)
