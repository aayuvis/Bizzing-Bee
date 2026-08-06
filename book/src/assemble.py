#!/usr/bin/env python3
"""Assemble the King's Playbook HTML from its chapter sources.

Usage:  python3 assemble.py            (writes ../kings-playbook.html)
Then:   node pdf.js                    (writes ../kings-playbook.pdf; needs Playwright + Chromium)

The NN-*.html files concatenate in filename order. Edit any chapter file,
re-run this script, and the book re-flows on next open.
"""
import glob, os
here = os.path.dirname(os.path.abspath(__file__))
parts = sorted(glob.glob(os.path.join(here, '[0-9][0-9]-*.html')))
html = ''.join(open(p).read() for p in parts)
html = html.replace('/*__FONTS__*/', open(os.path.join(here, 'fonts/embedded2.css')).read())
html = html.replace('/*__PAGEDJS__*/', open(os.path.join(here, 'pagedjs.min.js')).read())
out = os.path.join(here, '..', 'kings-playbook.html')
open(out, 'w').write(html)
print('assembled', out, len(html) // 1024, 'KB from', len(parts), 'parts')
