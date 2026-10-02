/* The install icons (FIX-BEE N1) — rasterised from the brand icon, never redrawn.

   Source: ../brand/bizzing-bee-icon.svg — the mascot (app.js mascotSVG('happy')) over the
   brand purple, a honeycomb and a honey glow. It carries NO lettering on purpose (see
   brand/README.md): type at launcher size is mush, and this is a spelling app.

   Writes, into spellbound-app/icons/:
     icon-192.png, icon-512.png       purpose "any" — the brand icon as it is
     icon-maskable-512.png            purpose "maskable" — the same art with the bee scaled
                                      into the 80% safe circle, because Android crops a
                                      maskable icon to a circle, squircle or teardrop and
                                      the brand icon's bee reaches 94% of the half-width
     apple-touch-icon.png (180)       iOS ignores the manifest's icons
   Run from spellbound-app/:  node tools/pwa-icons.cjs                                   */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const APP = path.resolve(__dirname, '..');
const svg = fs.readFileSync(path.resolve(APP, '..', 'brand', 'bizzing-bee-icon.svg'), 'utf8');
const OUT = path.join(APP, 'icons');

/* The maskable cut: same background, the inner mascot <svg x y width height> shrunk about
   the centre. The brand box is 498x560 at (151,120); its half-diagonal is 374 of 400. The
   maskable safe zone is a circle of radius 0.4 x size (320 of 800), so scale 0.8 -> 300. */
function maskable(src, k) {
  return src.replace(/<svg x="([\d.]+)" y="([\d.]+)" viewBox="([^"]+)" width="([\d.]+)" height="([\d.]+)"/, (m, x, y, vb, w, h) => {
    const W = +w * k, H = +h * k, X = 400 - (400 - +x) * k, Y = 400 - (400 - +y) * k;
    return `<svg x="${X.toFixed(1)}" y="${Y.toFixed(1)}" viewBox="${vb}" width="${W.toFixed(1)}" height="${H.toFixed(1)}"`;
  });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => require('fs').existsSync(p)) });
  const jobs = [['icon-192.png', 192, svg], ['icon-512.png', 512, svg], ['apple-touch-icon.png', 180, svg], ['icon-maskable-512.png', 512, maskable(svg, 0.8)]];
  for (const [name, size, src] of jobs) {
    if (src === svg && name.includes('maskable')) throw new Error('maskable rewrite did not match the brand svg');
    const pg = await b.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    const body = src.replace(/<svg([^>]*?) width="800" height="800"/, `<svg$1 width="${size}" height="${size}"`);
    await pg.setContent(`<!doctype html><html><body style="margin:0;background:transparent">${body}</body></html>`);
    await pg.screenshot({ path: path.join(OUT, name), clip: { x: 0, y: 0, width: size, height: size }, omitBackground: true });
    await pg.close();
    console.log('  wrote icons/' + name + ' (' + size + 'px, ' + fs.statSync(path.join(OUT, name)).size + ' bytes)');
  }
  await b.close();
})();
