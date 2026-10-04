/* HOME'S PICTURES ARRIVE WITH ITS WORDS (audit v4 B6: "Desk-dusk Home first paint: avatar and
   journey banners blank for ~6 s").

   Home's avatar and its two painted journey plates were asked for only when Home was drawn — after
   ~1MB of script — and lazily; the "Next on your journey" card waited for trail-data.js, which was
   fetched only after `load` plus an idle slice. On a phone network the words sat over empty frames
   for seconds (measured here at 1.6 Mbit/s, 150 ms: ~4.3 s from words to the last picture).
   Now, for a speller who has been here before:
     1. each Home render notes the pictures its first screen showed (device key homeArt, via the
        store) — only those on screen, only from avatars/ and app-art/;
     2. next visit, index.html's parse-time peek preloads exactly those, so they are fetched
        alongside the scripts and are on screen when the words first paint;
     3. Home's first-screen pictures are not loading="lazy" (a lazy image above the fold waits);
     4. trail-data.js is asked for at DOMContentLoaded when Home is what the first render drew,
        not after `load`;
     5. a new visitor (no household) and ?demo preload nothing — the first-load budget is untouched.
   Measured over tests/lib/serve.cjs (gzip, minified like a deploy) with Chrome's network throttle,
   the HTTP cache cleared between visits (the device's storage kept).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/home-first-paint.cjs                  */
const { chromium } = require('playwright');
const path = require('path');
const { serve } = require('./lib/serve.cjs');
const SRC = process.env.SRC || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 40, lists: { journey: { xp: 30 } }, activeList: 'journey',
  trail: { lap: 1, chk: { '1:meadow:4': 1, '1:meadow:8': 1 }, st: {}, seen: {}, done: Object.fromEntries([...Array(11)].map((_, i) => ['u' + (i + 1), { 1: 1 }])) } };

(async () => {
  const srv = await serve(SRC, { minify: process.env.MINIFY !== '0' });
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' });
  await ctx.addInitScript(k => { try { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'dusk', pin: '1234', activeIdx: 0, children: [k] }));
      localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } } catch (e) {}
    /* the moment Home's words first paint, which of its pictures are already on screen */
    const M = window._fp = {}; const tick = () => { const r2 = document.querySelector('#root .sb-home-r2');
      if (r2 && !M.text) { M.text = performance.now();
        M.atText = [...document.querySelectorAll('#root .sb-home-greet img, #root .sb-home-r2 img')].filter(i => i.getBoundingClientRect().top < innerHeight)
          .map(i => (i.complete && i.naturalWidth ? '+' : '-') + i.getAttribute('src')); }
      /* the owner's Home (4 Oct): row 2 is the "You are here" card, which holds until the Atlas lands —
         so its own pictures are read the moment IT first paints */
      const here = document.querySelector('#root .sb-home-r2 .sb-here');
      if (here && !M.card) M.card = [...document.querySelectorAll('#root .sb-home-greet img, #root .sb-here img')].filter(i => i.getBoundingClientRect().top < innerHeight)
          .map(i => (i.complete && i.naturalWidth ? '+' : '-') + i.getAttribute('src'));
      if (!M.text || !M.card) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }, KID);
  const visit = async () => {
    const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
    const cdp = await ctx.newCDPSession(pg); await cdp.send('Network.enable'); await cdp.send('Network.clearBrowserCache');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
    await pg.goto(srv.url + 'index.html', { waitUntil: 'commit' });
    await pg.waitForFunction(() => window._fp && window._fp.text && !document.querySelector('#root .sb-home-r2 .sb-hold'), null, { timeout: 45000, polling: 200 }).catch(() => {});
    await pg.waitForTimeout(600);
    const r = await pg.evaluate(() => { const nav = performance.getEntriesByType('navigation')[0]; const R = performance.getEntriesByType('resource');
      const at = re => { const e = R.find(x => re.test(x.name)); return e ? { start: Math.round(e.startTime), end: Math.round(e.responseEnd) } : null; };
      return { fp: window._fp, dcl: Math.round(nav.domContentLoadedEventStart), load: Math.round(nav.loadEventStart), app3: at(/\/app3\.js/), trail: at(/\/trail-data\.js/),
        hint: SB_STORE.getJSON('homeArt', null), links: [...document.querySelectorAll('link[rel="preload"][as="image"]')].map(l => l.getAttribute('href')),
        lazy: [...document.querySelectorAll('#root .sb-home-greet img, #root .sb-home-r2 img')].filter(i => i.getBoundingClientRect().top < innerHeight && i.loading === 'lazy').map(i => i.getAttribute('src')),
        imgs: Object.fromEntries(R.filter(x => /\/(avatars|app-art)\//.test(x.name)).map(x => [x.name.replace(/^.*?\/(avatars|app-art)\//, '$1/').replace(/\?.*/, ''), Math.round(x.startTime)])) }; });
    await pg.close(); return r;
  };

  /* ---- visit 1: no note yet; Home writes one ---- */
  const v1 = await visit();
  const onScreen = (v1.fp.atText || []).map(s => s.slice(1));
  ok(Array.isArray(v1.hint) && v1.hint.length >= 3 && v1.hint.every(u => /^(avatars|app-art)\/[a-z0-9/._-]+\.(png|webp|jpe?g)$/i.test(u)) && v1.hint.includes('avatars/panda.webp'),
    'Home notes the pictures on its first screen — the avatar and the journey plates (' + JSON.stringify(v1.hint) + ')');
  ok(!v1.lazy.length, 'none of Home\'s first-screen pictures is loading="lazy"' + (v1.lazy.length ? ' — ' + v1.lazy.join(', ') : ''));
  ok(v1.trail && v1.trail.start <= v1.dcl + 300 && v1.trail.start < v1.load, `"Next on your journey" asks for trail-data.js at DOMContentLoaded, not after load (asked ${v1.trail && v1.trail.start}ms; DCL ${v1.dcl}, load ${v1.load})`);

  /* ---- visit 2: the note is preloaded with the scripts ---- */
  const v2 = await visit();
  ok(v1.hint && v1.hint.every(u => v2.links.includes(u)) && v2.links.length === v1.hint.length, 'the next visit preloads exactly those pictures (' + v2.links.join(', ') + ')');
  const early = (v1.hint || []).filter(u => v2.imgs[u] != null && v2.app3 && v2.imgs[u] < v2.app3.end);
  ok(v1.hint && early.length === v1.hint.length, `they are fetched alongside the scripts, before app3.js has even arrived (${(v1.hint || []).map(u => u.split('/').pop() + ' @' + v2.imgs[u]).join(', ')}; app3 done @${v2.app3 && v2.app3.end})`);
  const atText = v2.fp.atText || [], atCard = v2.fp.card || [];
  ok(atText.length >= 1 && atText.every(s => s[0] === '+'), 'when Home\'s words first paint, its avatar is already there (' + atText.join(' ') + ')');
  ok(atCard.length >= 3 && atCard.every(s => s[0] === '+'), 'when the "You are here" card paints, its map and avatar are already there (' + atCard.join(' ') + ')');

  /* ---- a new visitor and ?demo preload nothing ---- */
  for (const [label, url] of [['new visitor', 'index.html'], ['?demo', 'index.html?demo']]) {
    const c2 = await b.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' });
    if (label === '?demo') await c2.addInitScript(() => { try { localStorage.setItem('sb_home_art', JSON.stringify(['app-art/w-meadow-r2.jpg'])); } catch (e) {} });
    const p2 = await c2.newPage(); p2.on('pageerror', e => errs.push(e.message));
    await p2.goto(srv.url + url); await p2.waitForTimeout(2500);
    const n = await p2.evaluate(() => document.querySelectorAll('link[rel="preload"][as="image"]').length);
    ok(n === 0, `${label}: no picture is preloaded (${n})`);
    await c2.close();
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); srv.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
