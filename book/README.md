# King's Playbook — Completed & Illuminated Edition

**24 Laws of Leadership for Those Who Wear the Crown** · by Aayush Vishnoi

- `kings-playbook.html` — the book as a **PDF-style pager**: opens as fixed 6in×9.6in sheets on a dark backdrop (paginated in-browser via Paged.js), every page shown in full with page numbers, a zoom toolbar (−/+, Fit width, Fit page), pinch-zoom on mobile, and the ☰ law navigator. Identical page layout on every device. Append `?nopaged` to read as a plain scrolling document instead.
- `kings-playbook.pdf` — print edition, 6in × 9.6in, 282 pages, generated from the HTML.

## What this edition contains

- The original 100-page manuscript (cover through Law 8's Sama–Dama–Dand–Bhed), transcribed **verbatim** — language preserved, production typos fixed (e.g. "CLATIRY", "OPONENT", "Hierarcy", the duplicated Own-the-Stage page, the mislabeled Vision Era dates).
- The completed remainder, written to the book's own framework: the rest of Law 8 plus Laws 9–24 across Strategy & Legacy, Execution, Network Effect, and Personal Brand — each with tagline, epigraph, story, sub-principles, framework, Be/Do/Create, and a King's Perspective.
- New front/back matter: How to Use This Book, epilogue (The Weight of the Crown), The Laws at a Glance, The Leadership Mirror self-assessment, About the Author.
- ◈ **My Story** panels are deliberate placeholders — only the author writes those.

Design language: mirrored from the original Canva edition — its embedded typefaces (Cormorant Garamond, Cardo, Noto Serif Ethiopic Condensed; Figtree standing in for Canva Sans) and its actual artwork, extracted from the source PDF: the real cover page, the Canva icon set (16 embedded originals + 8 high-res captures of the vector ones), both ornate frames, the crown, and the pendulum. The back cover is composed from the cover's own texture, corners, thin gold frame, and crown.

## Editing the book

Three ways to rewrite, by preference:

1. **`manuscript/Kings-Playbook-Manuscript.docx`** — the manuscript editing copy. The full book text with headings, taglines, epigraphs, framework label-lists, and ◈ MY STORY boxes marked *yours to write*. Open in Word or upload to Google Drive and edit as a Google Doc, with Track Changes on. Hand the edited file back and the typeset HTML + PDF are regenerated from it.
2. **Edit mode in `kings-playbook.html`** — open the book, press **✎ Edit text** in the toolbar, click into any paragraph and type in the real book design. *Apply to pages* re-flows the sheets with your changes; *Save edited copy* downloads a self-contained edited book file.
3. **`src/`** — the book's source, one file per section (`01-intro` … `08-close`). Edit any chapter file, run `python3 src/assemble.py` to rebuild the HTML, then `node src/pdf.js` for the PDF. This is also what a future Claude session edits when you describe changes in words.

The words live in one place (`src/`); the design is CSS around them — rewriting text can't break the layout.
