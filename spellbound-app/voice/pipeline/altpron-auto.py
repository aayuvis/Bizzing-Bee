"""Mine genuine alternate pronunciations from CMUdict for words in the app's libraries.
Keeps a variant only when it is audibly meaningful: the primary stress moves, a
consonant differs, or a stressed vowel changes quality. Unstressed-vowel wobbles and
pure schwa-elisions are dropped. Emits written respellings in the app's house style
(hyphenated syllables, stressed syllable in caps)."""
import json, cmudict

LIB = set(open('/tmp/libwords.txt').read().split())
D = cmudict.dict()

V = {'AA':'ah','AE':'a','AH':'uh','AO':'aw','AW':'ow','AY':'eye','EH':'eh','ER':'er',
     'EY':'ay','IH':'ih','IY':'ee','OW':'oh','OY':'oy','UH':'uu','UW':'oo'}
C = {'CH':'ch','DH':'th','HH':'h','JH':'j','NG':'ng','SH':'sh','TH':'th','ZH':'zh'}

def parse(ph):
    out=[]
    for p in ph:
        if p[-1].isdigit(): out.append(('v', p[:-1], int(p[-1])))
        else: out.append(('c', p, None))
    return out

def stress_sig(ps):    return tuple(s for t,_,s in ps if t=='v')
def stressed_vowels(ps): return tuple(v for t,v,s in ps if t=='v' and s==1)
def consonants(ps):    return tuple(v for t,v,_ in ps if t=='c')

def meaningful(a, b):
    pa, pb = parse(a), parse(b)
    if consonants(pa) != consonants(pb): return True
    if stressed_vowels(pa) != stressed_vowels(pb): return True
    sa, sb = stress_sig(pa), stress_sig(pb)
    if len(sa) == len(sb) and sa != sb: return True          # stress moved
    return False                                              # elision / unstressed wobble

def syllables(ps):
    # attach onset consonants to the following vowel; split medial clusters before the last consonant
    sylls=[]; cur=[]
    vi=[i for i,p in enumerate(ps) if p[0]=='v']
    if not vi: return [ps]
    for i,p in enumerate(ps):
        cur.append(p)
        if p[0]=='v':
            # collect following consonants up to (excluding) the onset of the next vowel
            j=i+1; cons=[]
            while j<len(ps) and ps[j][0]=='c': cons.append(ps[j]); j+=1
            nxt = j<len(ps)
            take = cons[:-1] if (nxt and cons) else cons
            cur.extend(take)
            sylls.append(cur); cur=[]
    # skipped onset consonants get re-consumed by the loop; rebuild properly:
    out=[]; i=0
    while i<len(ps):
        syl=[]
        while i<len(ps) and ps[i][0]=='c': syl.append(ps[i]); i+=1
        if i<len(ps): syl.append(ps[i]); i+=1
        j=i; cons=[]
        while j<len(ps) and ps[j][0]=='c': cons.append(ps[j]); j+=1
        nxt=j<len(ps)
        keep=cons[:-1] if (nxt and len(cons)>1) else ([] if nxt else cons)
        syl.extend(keep); i+=len(keep)
        out.append(syl)
    return out

def respell(ph):
    ps=parse(ph); out=[]
    for syl in syllables(ps):
        txt=''.join((V.get(v,'uh') if t=='v' else C.get(v,v.lower())) for t,v,s in syl)
        stressed=any(t=='v' and s==1 for t,v,s in syl)
        out.append(txt.upper() if stressed else txt)
    return '-'.join(out)

auto={}
for w, prons in D.items():
    if w not in LIB or len(prons)<2: continue
    base=prons[0]
    alt=next((p for p in prons[1:] if meaningful(base,p)), None)
    if not alt: continue
    a, b = respell(base), respell(alt)
    if a==b: continue
    auto[w]={'a':a,'b':b,'s':b.lower(),'n':'also heard'}
print('meaningful alternates:', len(auto))
json.dump(auto, open('/tmp/altpron-auto.json','w'))
for k in list(auto)[:14]: print(' ', k, auto[k]['a'], '|', auto[k]['b'])
