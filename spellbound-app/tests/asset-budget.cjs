/* THE ASSET BUDGET (road to 4.5, P1.14 — "plates to WebP/AVIF, lazy below the fold; asset budget in the test") — @check

   The v5 audit found "WebP small art, JPEG plates": 111 painted plates (24.5 MB) shipped as JPEG, and nothing held
   the art's weight at all. tools/art/webp.py turned every one into a WebP (q80, a 35 dB floor against its source,
   never heavier than it was — 24.5 MB → ~15.5 MB; why not AVIF is in its header). This holds what that bought:
     1. PLATES ARE WEBP. No JPEG under app-art/ but the declared social card (tools/art/webp.py SOCIAL_CARDS — a
        link preview's og:image, which not every crawler reads as WebP), and no shipped script, stylesheet or page
        names an app-art JPEG — except index.html's og:image / twitter:image naming that card.
     2. NO PLATE OUTGROWS ITS PLACE. Every raster under app-art/ ≤ 700 KB (the Atlas panoramas are the widest
        paintings, 5234 px, and the heaviest at ~680 KB), and the folder as a whole is a RATCHET: lower it when art
        gets lighter, never raise it to let a heavier plate in (slim or convert it — tools/art/webp.py).
     3. EVERY NAMED PLATE SHIPS. Every app-art path written out in shipped code, and every plate name the Atlas's
        panoramas (trail.js) and the analogy maps (analogy.js ART) list, is a file in app-art/.
     4. LAZY BELOW THE FOLD. Every <img> of a raster plate under app-art/ in shipped code carries loading="lazy" (or
        the landing's own data-lsrc loader) — unless ABOVE names it, with the reason it must not wait.
   The first screens' image bytes are held by tests/first-load.cjs (its `img` ceiling) — the same budget measured as
   a phone pays it.
     5. A REPLACED PLATE DOES NOT LINGER: both deploy scripts mirror app-art/ to the source after the copy.
   Proved by breaking (each put back after): a JPEG plate restored beside its WebP (1 fails); trail.js asking for
   '.jpg' again (1 and 3 fail); a panorama re-encoded at q95 (2 fails three ways: 1,419 KB, and both ratchets); an
   analogy map renamed (3 fails); the Library tiles' loading="lazy" removed (4 fails); the mirror loop taken out of
   deploy-prod.sh (5 fails).
   Run: node tests/asset-budget.cjs                                                                           */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
const ART = path.join(ROOT, 'app-art');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const some = (a) => (a.length ? ' — ' + a.slice(0, 6).join(' · ') + (a.length > 6 ? ` … (${a.length})` : '') : '');
const KB = 1024, MB = 1024 * 1024;
/* THE RATCHET (10 Oct 2026, after the conversion): app-art/ was 31.0 MB at the commit before, 22.1 MB after.
   Lowered 13 Oct 2026 (road to 4.5, P3 art): the five hive splash plates the drawn SVG comb replaced (437 KB of WebP,
   220 KB of SVG — worlds-splash holds them cut) went, the P3 art slots came in (22 cuts, 337 KB: tools/art/p3-gen.py),
   18.58 / 21.83 MB measured; the ceilings kept ~300 KB for the eleven bespoke paintings that replace cuts in place.
   Lowered 14 Oct 2026: the eleven paintings landed (feed plates 319 → 286 KB, Home's vignettes 6.8 → 6.3 KB — lighter
   than the cuts they replaced), 18.59 / 21.84 MB measured; the ceilings now sit ~60 KB above what ships. */
const CEIL = { plate: 700 * KB, raster: 18.65 * MB, folder: 21.9 * MB };

const walk = (d, out = []) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, out); else out.push(p); } return out; };
const files = walk(ART).map((f) => ({ rel: path.relative(ROOT, f).split(path.sep).join('/'), size: fs.statSync(f).size }));
const raster = files.filter((f) => /\.(webp|png|jpe?g|avif|gif)$/i.test(f.rel));

/* ---- 1. plates are WebP ---- */
const tool = fs.readFileSync(path.join(ROOT, 'tools', 'art', 'webp.py'), 'utf8');
const SOCIAL = new Set(((tool.match(/SOCIAL_CARDS = \{([^}]*)\}/) || [])[1] || '').match(/'[^']+'/g).map((s) => s.slice(1, -1)));
const jpegs = files.filter((f) => /\.jpe?g$/i.test(f.rel) && !SOCIAL.has(f.rel)).map((f) => f.rel);
ok(SOCIAL.size >= 1 && [...SOCIAL].every((s) => fs.existsSync(path.join(ROOT, s))), `the social card${SOCIAL.size > 1 ? 's' : ''} ${[...SOCIAL].join(', ')} — the one JPEG kept, for link previews`);
ok(!jpegs.length, `no JPEG plate under app-art/ (${raster.length} raster files)` + some(jpegs));
const SHIPPED = fs.readdirSync(ROOT).filter((f) => /\.(js|css|html)$/.test(f) && !/^words-(full|hard)\.js$/.test(f) && f !== 'backend.html')
  .concat(['saga-art', 'feed'].flatMap((d) => fs.existsSync(path.join(ROOT, d)) ? fs.readdirSync(path.join(ROOT, d)).filter((f) => /\.(js|css)$/.test(f)).map((f) => d + '/' + f) : []));
const src = {}; for (const f of SHIPPED) src[f] = fs.readFileSync(path.join(ROOT, f), 'utf8');
const jpgRefs = [];
for (const [f, t] of Object.entries(src)) {
  t.split('\n').forEach((ln, i) => {
    /* an app-art JPEG by path, or a plate-name literal / template that ends in .jpg */
    if (!/\.jpe?g\b/i.test(ln)) return;
    /* an app-art path; a bare plate name ('map-forum.jpg'); or, on a line that builds an app-art path, a template
       ending (${x}.jpg, + '.jpg'). The reader's book plates ('-opener.jpg' on the books site) are not app-art. */
    const art = /app-art/.test(ln);
    const hits = (ln.match(/app-art\/[^'"`\s)]*\.jpe?g|['"`][a-z0-9][a-z0-9-]*\.jpe?g['"`]/gi) || []).concat(art ? (ln.match(/\}\.jpe?g|\+ ?'\.jpe?g'/gi) || []) : []);
    for (const h of hits) {
      const social = f === 'index.html' && /<meta (property="og:image"|name="twitter:image")/.test(ln) && [...SOCIAL].some((s) => ln.includes(s));
      if (!social) jpgRefs.push(f + ':' + (i + 1) + ' ' + h);
    }
  });
}
ok(!jpgRefs.length, 'no shipped script, stylesheet or page asks for an app-art JPEG (the og:image card aside)' + some(jpgRefs));

/* ---- 2. no plate outgrows its place; the folder is a ratchet ---- */
const big = raster.filter((f) => f.size > CEIL.plate).map((f) => f.rel + ' ' + (f.size / KB).toFixed(0) + ' KB');
const heaviest = raster.slice().sort((a, b) => b.size - a.size)[0];
ok(!big.length, `every raster plate ≤ ${CEIL.plate / KB} KB (heaviest: ${heaviest.rel}, ${(heaviest.size / KB).toFixed(0)} KB)` + some(big));
const rTot = raster.reduce((t, f) => t + f.size, 0), fTot = files.reduce((t, f) => t + f.size, 0);
ok(rTot <= CEIL.raster, `app-art/'s raster art is ${(rTot / MB).toFixed(2)} MB — ceiling ${(CEIL.raster / MB).toFixed(1)} MB`);
ok(fTot <= CEIL.folder, `app-art/ as a whole is ${(fTot / MB).toFixed(2)} MB in ${files.length} files — ceiling ${(CEIL.folder / MB).toFixed(1)} MB`);

/* ---- 3. every named plate ships ---- */
const have = new Set(files.map((f) => f.rel));
const missing = [];
for (const [f, t] of Object.entries(src)) for (const m of t.matchAll(/app-art\/([A-Za-z0-9_\/.-]+\.(?:webp|png|svg|jpe?g|mp3))/g)) if (!have.has('app-art/' + m[1]) && !/^https?:/.test(t.slice(Math.max(0, m.index - 30), m.index).split(/['"`]/).pop())) missing.push(f + ': app-art/' + m[1]);
const named = [];
for (const m of src['trail.js'].matchAll(/img: '([a-z0-9-]+-pano\.webp)'/g)) named.push(m[1]);
for (const m of src['analogy.js'].matchAll(/img: '(anl-[a-z]+\.webp)'/g)) named.push(m[1]);
for (const n of named) if (!have.has('app-art/' + n)) missing.push('named plate ' + n);
ok(named.length >= 24 && !missing.length, `every app-art path in shipped code, and the ${named.length} plates the Atlas panoramas and analogy maps name, is in app-art/` + some([...new Set(missing)]));

/* ---- 4. lazy below the fold ---- */
/* Each entry: a file and a snippet of the <img> tag, and why it must load at once. */
const ABOVE = [
  ['app3-library.js', 'app-art/spines/', 'the Library shelf (app3-library.js since the P1.13 split) is the top of its screen (loading="eager" on purpose: CLAUDE.md, "A WHOLE FOLDER OF SHIPPED ART CAN VANISH")'],
  ['app3.js', "atlas-map.webp'}", 'Home\'s "You are here" card is above the fold on every width (home-first-paint preloads it)'],
  ['analogy.js', 'ART[id].img', 'the region map IS the Analogy Atlas screen'],
  ['trail.js', 'sb-vill-moth', 'the moth is drawn only when it appears, in view'],
  ['index.html', 'spl-art', 'the opening splash is the whole screen'],
  ['saga2.js', 'tb-glitch', 'a sprite inside a running game'],
  ['saga2.js', 'ss-sprite', 'a sprite inside a running game'],
];
const eager = [];
for (const [f, t] of Object.entries(src)) {
  for (const m of t.matchAll(/<img\b[^>]*>/g)) {
    const tag = m[0];
    if (!/app-art\//.test(tag) || /\.svg\b/.test(tag)) continue;        // SVG sprites are drawings, not plates
    if (/loading=["']?(lazy|\$\{)/.test(tag) || /data-lsrc=/.test(tag)) continue;      // lazy, or chosen per call (eager only when it is the hero)
    const why = ABOVE.find(([af, snip]) => af === f && tag.includes(snip));
    if (!why) eager.push(f + ':' + t.slice(0, m.index).split('\n').length + ' ' + tag.slice(0, 70));
  }
}
ok(!eager.length, `every plate <img> below the fold waits (loading="lazy" or data-lsrc); ${ABOVE.length} named exceptions load at once, each with its reason` + some(eager));

/* ---- 5. a replaced plate does not linger on the site ---- */
/* the deploy extracts over the live branch and never deletes, so the 111 JPEGs this replaced would have stayed on
   gh-pages for good (24.5 MB) — both scripts mirror app-art/ (and words-full/) to the source after the copy */
for (const f of ['deploy-prod.sh', 'deploy-internal.sh']) {
  const t = fs.readFileSync(path.join(ROOT, f), 'utf8');
  ok(/for d in app-art words-full; do\n\s*\[ -d "\$(WT|STG)\/\$d" \] \|\| continue[\s\S]{0,240}\[ ! -e "\$SRC\/\$d\/\$rel" \][\s\S]{0,40}rm -f "\$f"/.test(t) && t.indexOf('mirror the source') < t.indexOf('3b. Minify the copy'),
    `${f} mirrors app-art/ to the source after the copy, before minifying (a replaced plate does not stay on the site)`);
}

console.log(fails ? `\n${fails} FAILED` : '\nthe art is WebP, in budget, shipped, and lazy where it can wait');
process.exit(fails ? 1 : 0);
