import re,json,sys
def words(path,start,stop):
    t=open(path).read()
    t=t.split(start,1)[1].split(stop,1)[0]
    toks=re.split(r'\s{2,}|\n',t)
    out=[]
    for tok in toks:
        tok=tok.strip()
        if not tok or tok.startswith('#'): continue
        out.append(tok)
    return out
y34=words('dl/uk/p16.txt','years 3 and 4','Notes and guidance')
y56=words('dl/uk/p23.txt','years 5 and 6','\n\n\n\n') 
print(len(y34),y34); print(len(y56),y56)
json.dump({'y34':y34,'y56':y56},open('dl/uk/wordlists.json','w'),ensure_ascii=False)
