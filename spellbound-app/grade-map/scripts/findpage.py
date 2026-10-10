import sys,re
from pypdf import PdfReader
r=PdfReader(sys.argv[1])
pats=sys.argv[2:]
texts=[re.sub(r'\s+',' ',p.extract_text() or '') for p in r.pages]
for pat in pats:
    hits=[i+1 for i,t in enumerate(texts) if pat in t]
    print(repr(pat),hits)
