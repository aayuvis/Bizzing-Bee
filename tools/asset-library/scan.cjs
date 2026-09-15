#!/usr/bin/env node
/* ============================================================================
   ASSET LIBRARY — scanner
   ----------------------------------------------------------------------------
   WHY THIS EXISTS

   Art in the Bizzing repos is expensive and invisible at the same time. The book
   plates "cost real image quota and cannot be reproduced"; the avatars were
   re-cut once because nobody could see what already existed. Yet there is no way
   to look at it: it lives in six repos, in three different storage shapes, and
   most of it is not in a file at all.

   THE PART THAT MAKES A NAIVE SCAN WRONG

   Three shapes, and only the first is findable with `find`:

     1. FILES        art/*.png, *.svg — ordinary assets on disk.
     2. SVG IN JS    icons-art.js holds 88 icons as strings... assigned as
                     PROPERTIES ON A FUNCTION (`var A = function(name){...};
                     window.SB_ICON_ART = A; Object.assign(A, {learn:'<svg…>'})`).
                     Enumerating window globals alone finds a function and stops.
     3. COMPUTED     saga-art/worlds-art.js builds each plate procedurally —
                     seeded RNG, shared filter/gradient builders, `reg(id, svg)`
                     into `{vb, svg}` records. bizzingindia's GATTU is a function
                     of mood. avatars-art.js interpolates window.SB_MASCOT into
                     its own strings at load time.

   You cannot get shape 3 by reading source, because the SVG does not exist in
   the source — it is the OUTPUT OF A PROGRAM. So this scanner does the only
   thing that can be correct: it EXECUTES the art modules in a headless browser
   and harvests what they actually produce.

   HOW IT FINDS THINGS WITHOUT BEING TOLD

   No hardcoded list of globals. It snapshots `Object.keys(window)`, injects one
   art file, and diffs — whatever is new is what that file defines. Then it walks
   each new value for anything SVG-shaped: strings, object values, `{vb, svg}`
   records, properties hanging off a function, and functions called with a small
   set of likely arguments. Add an art file tomorrow and it is picked up with no
   change here.

   THUMBNAILS WITHOUT AN IMAGE LIBRARY

   There is no Pillow and no ImageMagick in this environment, so rasters are
   thumbnailed by the browser that is already running: read bytes in node, hand
   them to the page as a data: URI, draw to a canvas, read back WebP. Data URIs
   are used rather than file:// on purpose — a file:// image taints the canvas
   and toDataURL then throws.

   USAGE
     node tools/asset-library/scan.cjs [--root DIR] [--out DIR]
                                       [--thumb 96] [--quality 0.62] [--no-thumbs]
   ==========================================================================*/
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const ROOT = arg('--root', '/home/user');
const OUT = arg('--out', path.join(__dirname, 'build'));
const THUMB = +arg('--thumb', 96);
const QUALITY = +arg('--quality', 0.62);
const NO_THUMBS = argv.includes('--no-thumbs');
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

/* Repos that are DEPLOY MIRRORS of another repo are skipped: bizzing-bee-staging
   is a published copy of Bizzing-Bee, so counting it would double every asset and
   send anyone reusing art to a build output rather than to its source. */
const SKIP_REPOS = new Set(['bizzing-bee-staging']);
const SKIP_DIRS = new Set(['.git', 'node_modules', 'build', 'dist', '.design-sync', 'archive']);
const RASTER = /\.(png|jpe?g|webp|gif|avif)$/i;

const log = (...a) => console.log(...a);
const bytes = n => n >= 1e6 ? (n / 1e6).toFixed(1) + 'MB' : n >= 1e3 ? Math.round(n / 1e3) + 'KB' : n + 'B';

/* ---------------------------------------------------------------- 1. FILES */
function walk(dir, hit) {
  let ents = [];
  try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
  for (const e of ents) {
    if (e.name.startsWith('.') && e.name !== '.well-known') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(p, hit); }
    else if (e.isFile()) hit(p);
  }
}

function scanFiles(repoDir, repo) {
  const rasters = [], svgs = [];
  walk(repoDir, p => {
    const rel = path.relative(repoDir, p);
    let st; try { st = fs.statSync(p); } catch (e) { return; }
    if (RASTER.test(p)) rasters.push({ repo, rel, bytes: st.size, kind: 'raster' });
    else if (/\.svg$/i.test(p)) {
      let src = ''; try { src = fs.readFileSync(p, 'utf8'); } catch (e) { return; }
      /* an .svg that is not markup is a stub or a lockfile artefact, not art */
      if (!/<svg[\s>]/i.test(src)) return;
      svgs.push({ repo, rel, bytes: st.size, kind: 'svg', svg: src });
    }
  });
  return { rasters, svgs };
}

/* ------------------------------------------------- 2. COMPUTED SVG HARVEST */
/* Which JS files are worth executing. Cheap filter first (name), then content:
   a file that mentions <svg or <path many times is art whatever it is called. */
function artCandidates(repoDir) {
  const out = [];
  walk(repoDir, p => {
    if (!/\.(js|mjs)$/i.test(p)) return;
    if (/\.min\.js$/i.test(p)) return;
    let st; try { st = fs.statSync(p); } catch (e) { return; }
    if (st.size > 12e6) return;                 // a words shard is not art
    let src = ''; try { src = fs.readFileSync(p, 'utf8'); } catch (e) { return; }
    const marks = (src.match(/<(svg|path|circle|ellipse|polygon)\b/gi) || []).length;
    const named = /(art|icon|avatar|mascot|sprite|cover|world|badge)/i.test(path.basename(p));
    if (marks >= 4 || (named && marks >= 1)) out.push({ p, rel: path.relative(repoDir, p), marks, named });
  });
  /* Load order matters: a file that interpolates another's globals (avatars-art.js
     reads window.SB_MASCOT) must run after it. Nothing declares a dependency, so
     approximate it — files that DEFINE a lot and reference little go first. */
  out.sort((a, b) => (b.named ? 1 : 0) - (a.named ? 1 : 0) || b.marks - a.marks);
  return out;
}

const HARVEST = function () {
  /* runs in the page */
  const isSvg = s => typeof s === 'string' && s.length > 24 &&
    /<(svg|g|path|circle|rect|defs|ellipse|polygon|polyline|use)\b/i.test(s);
  const MAX = 400000;
  const seen = window.__seenKeys;
  const out = [];
  /* MOST HARVESTED ART IS NOT A COMPLETE <svg>. worlds-art.js stores inner markup
     beside the viewBox it was drawn for ({vb, svg}); avatars-art.js stores a bare
     <defs>/<g> meant to be dropped into the app's own frame. Inner markup renders
     as nothing on its own, so wrap it here — with the real viewBox when the record
     carries one, and a flag when it does not, so the viewer can say the frame was
     assumed rather than pretend the asset is exactly this. */
  const push = (name, svg, via, vb) => {
    if (!isSvg(svg) || svg.length > MAX) return;
    const whole = /^\s*<svg[\s>]/i.test(svg);
    out.push({
      name: String(name).slice(0, 80), via,
      svg: whole ? svg : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb || '0 0 100 100'}">${svg}</svg>`,
      wrapped: whole ? 0 : 1, vb: whole ? '' : (vb || ''),
    });
  };
  /* A few argument shapes cover every generator in these repos: no-arg, a mood or
     id string, and an index. Anything that throws is simply not a generator. */
  const ARGS = [undefined, 'happy', 'default', 0, 1];
  const tryFn = (fn, label) => {
    for (const a of ARGS) {
      let r; try { r = a === undefined ? fn() : fn(a); } catch (e) { continue; }
      if (isSvg(r)) { push(label, r, 'fn'); return true; }
    }
    return false;
  };
  const news = Object.keys(window).filter(k => !seen.has(k));
  for (const g of news) {
    let v; try { v = window[g]; } catch (e) { continue; }
    if (isSvg(v)) { push(g, v, 'global'); continue; }
    if (typeof v === 'function') {
      tryFn(v, g);
      /* THE icons-art.js SHAPE: the icons are properties hanging off the function
         itself. A walk that only looks at objects finds a function and gives up. */
      for (const k of Object.getOwnPropertyNames(v)) {
        if (['length', 'name', 'prototype', 'caller', 'arguments'].includes(k)) continue;
        let x; try { x = v[k]; } catch (e) { continue; }
        if (isSvg(x)) push(g + '.' + k, x, 'fnprop');
        else if (x && typeof x === 'object' && isSvg(x.svg)) push(g + '.' + k, x.svg, 'fnprop');
      }
      continue;
    }
    if (v && typeof v === 'object') {
      for (const k of Object.keys(v)) {
        let x; try { x = v[k]; } catch (e) { continue; }
        if (isSvg(x)) push(g + '.' + k, x, 'obj');
        /* the worlds-art.js shape: {vb, svg} — inner markup plus its viewBox */
        else if (x && typeof x === 'object' && isSvg(x.svg)) push(g + '.' + k, x.svg, 'obj', x.vb);
        else if (typeof x === 'function') tryFn(x, g + '.' + k + '()');
      }
    }
  }
  news.forEach(k => seen.add(k));
  return out;
};

async function harvestRepo(page, repoDir, repo) {
  const cands = artCandidates(repoDir);
  if (!cands.length) return [];
  await page.goto('about:blank');
  await page.evaluate(() => { window.__seenKeys = new Set(Object.keys(window)); });
  const all = [];
  for (const c of cands) {
    let src = ''; try { src = fs.readFileSync(c.p, 'utf8'); } catch (e) { continue; }
    try { await page.addScriptTag({ content: src }); }
    catch (e) { continue; }                      // a file that throws defines nothing
    let got = [];
    try { got = await page.evaluate(HARVEST); } catch (e) { continue; }
    for (const g of got) all.push({ repo, rel: c.rel, kind: 'computed', name: g.name, svg: g.svg,
                                     via: g.via, wrapped: g.wrapped, vb: g.vb, bytes: g.svg.length });
    if (got.length) log(`     ${c.rel.padEnd(42)} ${String(got.length).padStart(4)} svg`);
  }
  return all;
}

/* ------------------------------------------------------------ 3. THUMBNAILS */
const THUMBNAIL = function (a) {
  const [items, size, quality] = a;   // evaluate() hands over ONE argument
  return Promise.all(items.map(it => new Promise(res => {
    const img = new Image();
    img.onload = () => {
      try {
        const s = Math.min(size / img.width, size / img.height, 1);
        const w = Math.max(1, Math.round(img.width * s)), h = Math.max(1, Math.round(img.height * s));
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        res({ ok: 1, w: img.width, h: img.height, uri: c.toDataURL('image/webp', quality) });
      } catch (e) { res({ ok: 0, err: String(e.message).slice(0, 60) }); }
    };
    img.onerror = () => res({ ok: 0, err: 'decode' });
    img.src = it;
  })));
};

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif' };

/* SVG MARKUP IS KEPT ONLY WHILE IT IS SMALL ENOUGH TO BE WORTH COPYING.
   453 of the vectors are over 20KB and together they are 30MB — one kit tile is
   653KB on its own. Inlining those would make the library heavier than every
   raster thumbnail combined, to show a picture a 3KB thumbnail already shows. So
   above this threshold the library keeps the thumbnail and the path, and you open
   the file itself to use it. Below it, the markup travels and can be copied. */
const KEEP_MARKUP = +arg('--keep-markup', 12000);

/* Rasterising an SVG needs an intrinsic size: a bare viewBox with no width/height
   decodes at the browser's 300x150 default and thumbnails the wrong crop. */
function svgForRaster(svg, size) {
  let s = String(svg);
  if (!/^\s*<svg/i.test(s)) return s;
  if (!/<svg[^>]*\swidth=/i.test(s)) s = s.replace(/<svg/i, `<svg width="${size * 4}" height="${size * 4}"`);
  if (!/xmlns=/i.test(s)) s = s.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  return s;
}

async function thumbnail(page, rasters, repoDir, asUri) {
  const BATCH = 24;
  let done = 0, failed = 0;
  const toUri = asUri || (r => {
    try {
      const b = fs.readFileSync(path.join(repoDir, r.rel));
      return 'data:' + (MIME[path.extname(r.rel).toLowerCase()] || 'image/png') + ';base64,' + b.toString('base64');
    } catch (e) { return ''; }
  });
  for (let i = 0; i < rasters.length; i += BATCH) {
    const slice = rasters.slice(i, i + BATCH);
    const uris = slice.map(toUri);
    let outs = [];
    try { outs = await page.evaluate(THUMBNAIL, [uris, THUMB, QUALITY]); }
    catch (e) { outs = uris.map(() => ({ ok: 0, err: 'batch' })); }
    outs.forEach((o, j) => {
      if (o && o.ok) { slice[j].thumb = o.uri; slice[j].w = o.w; slice[j].h = o.h; done++; }
      else failed++;
    });
    if ((i / BATCH) % 10 === 0) process.stdout.write(`\r     thumbs ${done}/${rasters.length}`);
  }
  process.stdout.write(`\r     thumbs ${done}/${rasters.length}${failed ? '  (' + failed + ' undecodable)' : ''}\n`);
}

/* ------------------------------------------------------------------- MAIN */
(async () => {
  const repos = fs.readdirSync(ROOT, { withFileTypes: true })
    .filter(e => e.isDirectory() && !SKIP_REPOS.has(e.name) && fs.existsSync(path.join(ROOT, e.name, '.git')))
    .map(e => e.name).sort();
  log('Repos:', repos.join(', '));
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch({ executablePath: CHROME });
  const page = await browser.newPage();
  page.on('pageerror', () => {});                // an art file that throws is data, not a crash

  const assets = [];
  for (const repo of repos) {
    const dir = path.join(ROOT, repo);
    log(`\n${repo}`);
    const { rasters, svgs } = scanFiles(dir, repo);
    log(`   files: ${rasters.length} raster, ${svgs.length} svg`);
    log(`   executing art modules…`);
    const computed = await harvestRepo(page, dir, repo);
    log(`   computed: ${computed.length} svg`);
    const vectors = svgs.concat(computed);
    if (!NO_THUMBS) {
      await page.goto('about:blank');
      if (rasters.length) await thumbnail(page, rasters, dir);
      /* Vectors get a thumbnail for the SAME reason rasters do: the grid must draw
         6,000 tiles without laying out 6,000 live SVG trees, and a 650KB kit tile
         has to be visible without shipping 650KB to show it. */
      if (vectors.length) await thumbnail(page, vectors, dir,
        v => 'data:image/svg+xml;base64,' + Buffer.from(svgForRaster(v.svg, THUMB), 'utf8').toString('base64'));
      let shed = 0;
      for (const v of vectors) {
        if (v.svg && v.svg.length > KEEP_MARKUP) { v.big = v.svg.length; delete v.svg; shed++; }
      }
      if (shed) log(`     ${shed} vectors over ${Math.round(KEEP_MARKUP / 1000)}KB kept as thumbnail + path only`);
    }
    assets.push(...rasters, ...vectors);
  }
  await browser.close();

  /* A computed SVG can be produced under two different globals (an alias, or a
     generator that returns a stored string). Same markup = same asset. */
  const seen = new Map();
  const deduped = [];
  for (const a of assets) {
    const k = a.kind === 'raster' ? a.repo + '/' + a.rel
      : a.svg ? a.svg.slice(0, 600) + a.svg.length
      : a.repo + '/' + a.rel + '#' + (a.name || '');   // markup shed: fall back to identity
    if (seen.has(k)) { seen.get(k).alsoAt = (seen.get(k).alsoAt || []).concat(`${a.repo}/${a.rel}${a.name ? '#' + a.name : ''}`); continue; }
    seen.set(k, a); deduped.push(a);
  }

  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(deduped));
  const by = k => deduped.filter(a => a.kind === k).length;
  const dupes = assets.length - deduped.length;
  log(`\n${deduped.length} assets  (raster ${by('raster')}, svg files ${by('svg')}, computed ${by('computed')}${dupes ? `, ${dupes} duplicates folded` : ''})`);
  log(`manifest: ${bytes(fs.statSync(path.join(OUT, 'manifest.json')).size)}  →  ${path.join(OUT, 'manifest.json')}`);
})();
