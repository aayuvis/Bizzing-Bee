import sys
from pypdf import PdfReader
r=PdfReader(sys.argv[1]); a,b=int(sys.argv[2]),int(sys.argv[3])
for i in range(a-1,b):
    print(f"\n######## PAGE {i+1}")
    print(r.pages[i].extract_text(extraction_mode="layout"))
