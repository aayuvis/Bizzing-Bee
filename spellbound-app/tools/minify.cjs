/* Minify a COPY of the app for shipping — never the source (FIX-BEE N2).

   WHY HERE AND NOT A BUILD STEP. The app is no-build on purpose: open index.html and it
   runs, edit a file and reload. That stays true — the source is never touched. The deploy
   scripts copy the tree and then run this over the COPY, so what reaches a phone is
   smaller while what a developer reads is the same file it always was.

   WHAT IT DOES. Every .js in the target tree goes through esbuild's minifier: whitespace,
   syntax and LOCAL names only. esbuild does not rename top-level names of a classic
   script (there is no module format to say they are private), so every `window.*` global
   and every bare cross-file name (`app`, `state`, `render`…) survives — the whole browser
   suite is run against the minified tree before a deploy pushes, which is the proof.
   Output stays UTF-8 (`charset: 'utf8'`) so emoji in templates are not inflated to escapes.
   Not touched: index.html (the deploy asserts it is byte-identical to source), CSS, and
   anything under tests/, node_modules/ or .git/.

   Measured on app3.js: 1,265,576 → ~1,000,000 bytes, 382 → ~282 KB gzipped.

   CLI:    node tools/minify.cjs <tree>        rewrites every .js under <tree> in place
   Module: require('./minify.cjs').minifyJs(code, name) -> code                          */
'use strict';
const fs = require('fs'), path = require('path'), zlib = require('zlib');

function esbuild() {
  for (const p of [path.join(__dirname, '..', 'node_modules', 'esbuild'), 'esbuild']) {
    try { return require(p); } catch (e) {}
  }
  throw new Error('esbuild is not installed — run `npm install` in spellbound-app/');
}

function minifyJs(code, name) {
  return esbuild().transformSync(code, { minify: true, charset: 'utf8', legalComments: 'inline', sourcefile: name || 'file.js', loader: 'js' }).code;
}

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'tests') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.isFile() && /\.js$/.test(e.name)) out.push(p);
  }
  return out;
}

module.exports = { minifyJs };

if (require.main === module) {
  const root = path.resolve(process.argv[2] || '');
  if (!process.argv[2] || !fs.existsSync(path.join(root, 'index.html'))) { console.error('usage: node tools/minify.cjs <deploy tree containing index.html>'); process.exit(2); }
  if (path.resolve(__dirname, '..') === root) { console.error('refusing to minify the SOURCE tree — point this at a deploy copy'); process.exit(2); }
  let a = 0, b = 0, ga = 0, gb = 0, n = 0;
  for (const f of walk(root, [])) {
    const src = fs.readFileSync(f, 'utf8');
    let out;
    try { out = minifyJs(src, path.relative(root, f)); } catch (e) { console.error('minify failed: ' + path.relative(root, f) + ' — ' + e.message.split('\n')[0]); process.exit(1); }
    if (out.length >= src.length) continue;
    fs.writeFileSync(f, out);
    a += src.length; b += out.length; n++;
    ga += zlib.gzipSync(src).length; gb += zlib.gzipSync(out).length;
  }
  console.log(`   minified ${n} files: ${(a / 1048576).toFixed(1)}MB → ${(b / 1048576).toFixed(1)}MB raw, ${(ga / 1048576).toFixed(2)}MB → ${(gb / 1048576).toFixed(2)}MB gzipped`);
}
