/* A tiny static server that gzips, so byte counts match GitHub Pages.

   WHY. Every first-load figure this app ever quoted was taken over file:// or a plain
   localhost server, and both hand the browser UNCOMPRESSED bytes — about 3-4x what a
   phone actually downloads from Pages, which gzips every text type. A budget measured
   that way is a budget against the wrong number. This serves text gzipped (level 6, as
   a CDN would), binary as-is, and sends Pages' own `Cache-Control: max-age=600`.

   It is also the http origin the offline and privacy tests need: a service worker will
   not register under file://, and "no third-party requests" means nothing without a
   first party.

   `{ minify: true }` serves every .js through tools/minify.cjs — the same transform the
   deploy scripts run over their copy — so a budget measured against the SOURCE folder is
   a budget on the bytes that will actually ship. `srv.log` lists every response sent
   ({path, bytes}) — the server-side count includes requests a page's own tools miss
   (a service worker's fetches).

   Use:   const { serve } = require('./lib/serve.cjs');
          const srv = await serve(rootDir, { minify: true });   // srv.url = 'http://127.0.0.1:<port>/'
          ... srv.close();
   CLI:   node tests/lib/serve.cjs [root] [port]                                         */
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), zlib = require('zlib');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8',
};
const GZ = /^(text\/|application\/(json|manifest\+json|javascript)|image\/svg)/;

function serve(root, opts) {
  if (typeof opts === 'number') opts = { port: opts };
  opts = opts || {};
  root = path.resolve(root);
  const cache = new Map();           // path -> {mtime, gz}
  const log = [];
  const minify = opts.minify ? require(path.join(__dirname, '..', '..', 'tools', 'minify.cjs')).minifyJs : null;
  const body = (file, type) => {
    const raw = fs.readFileSync(file);
    if (!minify || !/\.js$/.test(file)) return raw;
    try { return Buffer.from(minify(raw.toString('utf8'), path.basename(file))); } catch (e) { return raw; }
  };
  const server = http.createServer((req, res) => {
    let rel;
    try { rel = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch (e) { res.writeHead(400); return res.end(); }
    if (rel.endsWith('/')) rel += 'index.html';
    const file = path.join(root, rel);
    if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
    fs.stat(file, (err, st) => {
      if (err || !st.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('not found'); }
      const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
      const head = { 'Content-Type': type, 'Cache-Control': 'max-age=600', 'Last-Modified': st.mtime.toUTCString(), 'Vary': 'Accept-Encoding' };
      const gzipOk = GZ.test(type) && /\bgzip\b/.test(req.headers['accept-encoding'] || '');
      if (gzipOk) {
        let hit = cache.get(file);
        if (!hit || hit.mtime !== +st.mtime) { hit = { mtime: +st.mtime, gz: zlib.gzipSync(body(file, type), { level: 6 }) }; cache.set(file, hit); }
        res.writeHead(200, Object.assign(head, { 'Content-Encoding': 'gzip', 'Content-Length': hit.gz.length }));
        if (req.method !== 'HEAD') log.push({ path: rel, bytes: hit.gz.length, t: Date.now() });
        return res.end(req.method === 'HEAD' ? undefined : hit.gz);
      }
      const plain = minify && /\.js$/.test(file) ? body(file, type) : null;
      const len = plain ? plain.length : st.size;
      res.writeHead(200, Object.assign(head, { 'Content-Length': len, 'Accept-Ranges': 'none' }));
      if (req.method === 'HEAD') return res.end();
      log.push({ path: rel, bytes: len, t: Date.now() });
      if (plain) return res.end(plain);
      fs.createReadStream(file).pipe(res);
    });
  });
  return new Promise(resolve => server.listen(opts.port || 0, '127.0.0.1', () => {
    const p = server.address().port;
    resolve({ url: `http://127.0.0.1:${p}/`, port: p, log, close: () => new Promise(r => { server.closeAllConnections && server.closeAllConnections(); server.close(() => r()); }) });
  }));
}

module.exports = { serve };

if (require.main === module) {
  const root = process.argv[2] || path.resolve(__dirname, '..', '..');
  serve(root, +process.argv[3] || 8080).then(s => console.log('serving ' + root + ' gzipped at ' + s.url));
}
