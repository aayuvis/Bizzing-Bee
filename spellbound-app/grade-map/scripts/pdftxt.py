import sys
from pypdf import PdfReader
from pdfminer.high_level import extract_text
src,dst=sys.argv[1],sys.argv[2]
r=PdfReader(src)
print("pages",len(r.pages)); print("meta",dict(r.metadata or {}))
t=extract_text(src)
open(dst,"w").write(t)
print("chars",len(t))
