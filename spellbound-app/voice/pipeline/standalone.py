#!/usr/bin/env python3
"""Build a ONE-FILE copy of a book: every image and font inlined as a data URI.

For sending someone a book. It opens from a downloads folder with no server, no
sibling art/ directory and no network — which the published HTML cannot do,
because it links out to ../fonts and art/.

The images are re-encoded on the way in. The shipped plates are print-grade
(1400px), and base64 adds a third on top of whatever they weigh, so inlining
them untouched makes a 13MB file to read a poem in. A reading copy is not a
printing copy: --max caps the long edge and --q sets JPEG quality.

  standalone.py book-lines.html out.html [--max 900] [--q 68]
"""
import sys, os, re, base64, io
from PIL import Image

BOOKS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'books')

def enc_img(path, maxw, q):
    im = Image.open(path)
    keep_alpha = im.mode in ('RGBA', 'LA', 'P') and 'transparency' in im.info or im.mode == 'RGBA'
    if im.size[0] > maxw:
        im = im.resize((maxw, round(im.size[1] * maxw / im.size[0])), Image.LANCZOS)
    buf = io.BytesIO()
    if keep_alpha:
        im.convert('RGBA').save(buf, 'PNG', optimize=True)      # cutouts keep their alpha
        return 'image/png', buf.getvalue()
    im.convert('RGB').save(buf, 'JPEG', quality=q, optimize=True, progressive=True)
    return 'image/jpeg', buf.getvalue()

def build(src, dst, maxw=900, q=68):
    html = open(os.path.join(BOOKS, src), encoding='utf-8').read()
    stats = {'img': 0, 'img_before': 0, 'img_after': 0, 'font': 0, 'font_bytes': 0, 'dup': 0, 'missing': []}

    # Each distinct picture is embedded ONCE. Encoding every occurrence separately
    # made a 14MB file out of a book with seven unique images in it — the cast
    # volumes reuse the same mascot up to nine times a page set. The first
    # occurrence carries the data and is tagged; later ones carry only the tag,
    # and a two-line script points them at it. Without JavaScript the book still
    # shows every distinct image, just not the repeats.
    seen = {}
    def do_img(m):
        rel = m.group(2)
        p = os.path.join(BOOKS, rel)
        if not os.path.exists(p):
            stats['missing'].append(rel); return m.group(0)
        if rel in seen:
            stats['dup'] += 1
            return f'{m.group(1)}="" data-a="{seen[rel]}"'
        key = str(len(seen))
        seen[rel] = key
        mime, data = enc_img(p, maxw, q)
        stats['img'] += 1
        stats['img_before'] += os.path.getsize(p)
        stats['img_after'] += len(data)
        return (f'{m.group(1)}="data:{mime};base64,{base64.b64encode(data).decode()}" '
                f'data-src="{key}"')

    # art/, ../avatars/, and anything else relative — NOT just art/. The first
    # cut missed ../avatars/*.png and produced a "self-contained" file that still
    # reached outside itself for the mascots.
    html = re.sub(r'(src|href)="((?!data:|https?:|#)[^"]+\.(?:png|jpg|jpeg|svg|webp))"', do_img, html)

    def do_font(m):
        rel = m.group(1)
        p = os.path.normpath(os.path.join(BOOKS, rel))
        if not os.path.exists(p):
            stats['missing'].append(rel); return m.group(0)
        d = open(p, 'rb').read()
        stats['font'] += 1; stats['font_bytes'] += len(d)
        return "url('data:font/woff2;base64,%s')" % base64.b64encode(d).decode()

    html = re.sub(r"url\('(\.\./fonts/[^']+)'\)", do_font, html)
    # a one-file book is for reading; the review widget needs a server
    html = html.replace('<body>', '<body data-standalone="1">')
    html = html.replace('</body>', '''<script>
/* repeats point at the one embedded copy */
(function(){var m={};document.querySelectorAll('img[data-src]').forEach(function(i){m[i.dataset.src]=i.src;});
document.querySelectorAll('img[data-a]').forEach(function(i){var s=m[i.dataset.a];if(s)i.src=s;});})();
</script></body>''')
    open(dst, 'w', encoding='utf-8').write(html)
    return stats

if __name__ == '__main__':
    a = sys.argv[1:]
    maxw, q = 900, 68
    while '--max' in a: i = a.index('--max'); maxw = int(a[i+1]); del a[i:i+2]
    while '--q' in a:   i = a.index('--q');   q = int(a[i+1]);   del a[i:i+2]
    src, dst = a[0], a[1]
    st = build(src, dst, maxw, q)
    sz = os.path.getsize(dst)
    print(f"{src} -> {os.path.basename(dst)}  {sz/1048576:.1f} MB "
          f"({st['img']} images {st['img_before']/1048576:.1f}->{st['img_after']/1048576:.1f}MB, "
          f"{st['font']} fonts, {st['dup']} repeats linked)"
          + (f"  MISSING {len(st['missing'])}" if st['missing'] else ""))
