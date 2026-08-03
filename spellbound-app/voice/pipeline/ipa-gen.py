"""IPA transcriptions for the Sound Alphabet trainer (SB_IPA in sounds-data.js).
nsf words ranked by bee probability, intersected with CMUdict (pip install cmudict),
ARPABET converted to IPA with syllable stress marks, topped up so every teaching symbol
has >=6 example words. Emits /tmp/ipa.json; sounds-build.js folds it into sounds-data.js."""
import json, os, cmudict, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(['node', '--max-old-space-size=4096', '-e', '''
const fs=require("fs");global.window=global;
eval(fs.readFileSync("''' + HERE + '''/../../words-data.js","utf8"));
const out=SB_DATA.nsf.filter(r=>/^[a-z]+$/i.test(r.w)).map(r=>[r.w.toLowerCase(),r.bp||0]);
fs.writeFileSync("/tmp/nsf-bp.json",JSON.stringify(out));
'''], check=True)
NSF = json.load(open('/tmp/nsf-bp.json'))
D = cmudict.dict()

V = {'AA':'ɑ','AE':'æ','AO':'ɔ','AW':'aʊ','AY':'aɪ','EH':'ɛ','EY':'eɪ','IH':'ɪ','IY':'i',
     'OW':'oʊ','OY':'ɔɪ','UH':'ʊ','UW':'u'}
C = {'CH':'tʃ','DH':'ð','HH':'h','JH':'dʒ','NG':'ŋ','SH':'ʃ','TH':'θ','Y':'j','ZH':'ʒ',
     'B':'b','D':'d','F':'f','G':'ɡ','K':'k','L':'l','M':'m','N':'n','P':'p','R':'r',
     'S':'s','T':'t','V':'v','W':'w','Z':'z'}
ON2 = {('S','T'),('S','P'),('S','K'),('S','M'),('S','N'),('S','L'),('S','W'),('T','R'),('P','R'),
       ('K','R'),('B','R'),('G','R'),('D','R'),('F','R'),('TH','R'),('SH','R'),('P','L'),('B','L'),
       ('K','L'),('G','L'),('F','L'),('K','W'),('P','Y'),('B','Y'),('K','Y'),('F','Y'),('M','Y'),('HH','Y')}
ON3 = {('S','T','R'),('S','P','R'),('S','K','R'),('S','P','L'),('S','K','W')}

def parse(ph):
    return [('v', p[:-1], int(p[-1])) if p[-1].isdigit() else ('c', p, None) for p in ph]

def syllables(ps):
    out = []; i = 0
    while i < len(ps):
        syl = []
        while i < len(ps) and ps[i][0] == 'c': syl.append(ps[i]); i += 1
        if i < len(ps): syl.append(ps[i]); i += 1
        j = i; cons = []
        while j < len(ps) and ps[j][0] == 'c': cons.append(ps[j]); j += 1
        if j < len(ps) and cons:
            names = tuple(c[1] for c in cons); keep = len(cons)
            for k in (3, 2, 1):
                if len(cons) >= k and (k == 1 or (k == 2 and names[-2:] in ON2) or (k == 3 and names[-3:] in ON3)):
                    keep = len(cons) - k; break
            syl.extend(cons[:keep]); i += keep
        elif j >= len(ps):
            syl.extend(cons); i += len(cons)
        out.append(syl)
    return out

def vph(v, s):
    if v == 'AH': return 'ʌ' if s == 1 else 'ə'
    if v == 'ER': return 'ər'
    return V.get(v, 'ə')

def ipa(ph):
    ps = parse(ph); parts = []
    for syl in syllables(ps):
        stress = next((s for t, v, s in syl if t == 'v' and s in (1, 2)), 0)
        mark = 'ˈ' if stress == 1 else ('ˌ' if stress == 2 else '')
        parts.append(mark + ''.join((vph(v, s) if t == 'v' else C.get(v, v.lower())) for t, v, s in syl))
    return ''.join(parts)

ranked = sorted(NSF, key=lambda x: -x[1])
out = {}
for w, bp in ranked:
    if len(out) >= 800: break
    if w in D and 3 < len(w) < 15: out[w] = ipa(D[w][0])
SYMS = ['ə','æ','ɑ','ɛ','ɪ','i','ʊ','u','ʌ','ɔ','eɪ','aɪ','oʊ','aʊ','ɔɪ','ər','θ','ð','ʃ','ʒ','tʃ','dʒ','ŋ','j']
for s in SYMS:
    have = sum(1 for v in out.values() if s in v)
    if have < 6:
        for w, bp in ranked:
            if w in out or w not in D or not 3 < len(w) < 15: continue
            t = ipa(D[w][0])
            if s in t: out[w] = t; have += 1
            if have >= 6: break
json.dump(out, open('/tmp/ipa.json', 'w'), ensure_ascii=False)
print('words:', len(out))
