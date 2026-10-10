import sys,re,json
import xml.etree.ElementTree as ET
t=ET.parse(sys.argv[1]); out=[]
for it in t.getroot().iter('LearningStandardItem'):
    code=(it.findtext('.//StatementCode') or '')
    st=(it.findtext('.//Statement') or '').strip()
    uri=it.findtext('RefURI') or ''
    m=re.match(r'CCSS\.ELA-Literacy\.(L|RF)\.([3-8])\.(\d+)([a-z])?$',code)
    if m: out.append((code,uri,st))
for c,u,s in out: print(c,'|',u,'|',s)
