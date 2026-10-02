/* OFFLINE AND INSTALLABLE (FIX-BEE N1, family standard §11).

   The app promised "works offline" and did — but only when the FOLDER was opened from disk.
   Served from Pages, a phone with no signal got nothing. sw.js now keeps what the app has
   fetched, and manifest.json + icons/ make it installable.

   Proved here, over a real http origin (a service worker will not run under file://):
   1. the manifest is valid and installable: name, start_url inside scope, display
      standalone, theme colour matching the page's, PNG icons that exist at 192 and 512 and
      ARE those sizes (read from the PNG header, not the manifest's word for it), a
      maskable one, an apple-touch-icon;
   2. a first visit installs the worker, which takes control and is handed what the page
      already fetched (the warm-up), into a cache named for the ?v= stamp; a stale stamp's
      cache is deleted on activation;
   3. THEN THE NETWORK GOES — the context is set offline AND the server is shut — and a
      reload still boots to Home with the speller's name on it; the opening page boots too;
   4. under file:// nothing is registered and nothing throws.
   Run: node tests/offline-pwa.cjs                                                        */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const { serve } = require('./lib/serve.cjs');
const SRC = process.env.SRC || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const seed = { theme: 'spellbound', mode: 'light', premium: false, activeIdx: 0, pin: '1234',
  children: [{ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'bizzy', theme: 'spellbound', coins: 50, xp: 40, level: 3,
    lists: { default: { xp: 30 } }, activeList: 'default', missed: [], unlockedThemes: ['spellbound'] }] };
const pngSize = f => { const b = fs.readFileSync(f); return b.slice(1, 4).toString() === 'PNG' ? [b.readUInt32BE(16), b.readUInt32BE(20)] : null; };

(async () => {
  /* ---- 1. the manifest ---- */
  const html = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
  const link = (html.match(/<link rel="manifest" href="([^"]+)"/) || [])[1];
  ok(!!link && fs.existsSync(path.join(SRC, link)), 'index.html links a manifest that exists' + (link ? ' (' + link + ')' : ''));
  let man = {};
  try { man = JSON.parse(fs.readFileSync(path.join(SRC, link || 'manifest.json'), 'utf8')); ok(true, 'the manifest is valid JSON'); } catch (e) { ok(false, 'the manifest is valid JSON — ' + e.message); }
  ok(man.name && man.short_name && man.short_name.length <= 12, `it has a name and a short name that fits under an icon ("${man.short_name}")`);
  ok(man.display === 'standalone', 'display is standalone');
  const scope = new URL(man.scope || './', 'https://x.test/app/'), start = new URL(man.start_url || '', 'https://x.test/app/');
  ok(man.start_url != null && start.href.startsWith(scope.href), 'start_url sits inside scope');
  const themeMeta = (html.match(/<meta name="theme-color" content="([^"]+)"/) || [])[1];
  ok(man.theme_color && man.theme_color.toLowerCase() === String(themeMeta).toLowerCase(), `theme_color ${man.theme_color} matches the page's <meta theme-color> (${themeMeta})`);
  ok(/^#[0-9a-f]{6}$/i.test(man.background_color || ''), 'background_color is set (the launch splash)');
  const icons = man.icons || [];
  for (const want of [192, 512]) {
    const ic = icons.find(i => i.sizes === `${want}x${want}` && /any/.test(i.purpose || 'any') && i.type === 'image/png');
    const f = ic && path.join(SRC, ic.src); const sz = f && fs.existsSync(f) && pngSize(f);
    ok(!!sz && sz[0] === want && sz[1] === want, `a ${want}×${want} PNG icon exists and really is ${want}×${want}` + (sz ? ` (${sz.join('×')})` : ''));
  }
  const mk = icons.find(i => /maskable/.test(i.purpose || ''));
  const mks = mk && fs.existsSync(path.join(SRC, mk.src)) && pngSize(path.join(SRC, mk.src));
  ok(!!mks && mks[0] >= 512, 'a maskable icon exists for Android launchers');
  const ati = (html.match(/<link rel="apple-touch-icon" href="([^"]+)"/) || [])[1];
  ok(!!ati && fs.existsSync(path.join(SRC, ati)), 'an apple-touch-icon is linked and exists (iOS ignores the manifest\'s icons)');
  const stamp = (html.match(/SB_ASSET_V="\?v=([0-9a-z]+)"/) || [])[1];

  /* ---- 2. first visit installs and warms the worker ---- */
  const srv = await serve(SRC);
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => require('fs').existsSync(p)) });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(s => { try { if (!localStorage.getItem('sb_t_seeded')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_t_seeded', '1'); } } catch (e) {} }, seed);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(srv.url + 'index.html');
  await pg.evaluate(() => caches.open('bee-core-STALE').then(c => c.put('stale', new Response('old build'))));
  const t0 = Date.now(); let st = {};
  while (Date.now() - t0 < 30000) {
    st = await pg.evaluate(async () => {
      const keys = await caches.keys(); const core = keys.find(k => /^bee-core-/.test(k) && k !== 'bee-core-STALE');
      const n = core ? (await (await caches.open(core)).keys()).length : 0;
      const has = core ? !!(await (await caches.open(core)).match(location.href.split('#')[0].split('?')[0])) : false;
      const app3 = core ? (await (await caches.open(core)).keys()).some(r => /app3\.js/.test(r.url)) : false;
      return { ctrl: !!navigator.serviceWorker.controller, keys, core, n, has, app3, regs: (await navigator.serviceWorker.getRegistrations()).map(r => r.active && r.active.scriptURL) };
    });
    if (st.ctrl && st.has && st.app3 && st.n > 20 && !st.keys.includes('bee-core-STALE')) break;
    await pg.waitForTimeout(500);
  }
  ok(st.ctrl, 'a first visit installs the service worker and it takes control (' + (st.regs || []).join(', ') + ')');
  ok(st.core === 'bee-core-' + stamp, `its cache is named for the ?v= stamp (${st.core}, stamp ${stamp})`);
  ok(st.has && st.app3 && st.n > 20, `the warm-up put what the page had already fetched into it (${st.n} entries, the page and app3.js among them)`);
  ok(!(st.keys || []).includes('bee-core-STALE'), 'a stale stamp\'s cache is deleted when the new worker activates');
  // let the deferred idle work settle, then cut the network both ways
  await pg.waitForTimeout(1500);
  await ctx.setOffline(true); await srv.close();

  /* ---- 3. offline: the reload still boots to Home ---- */
  await pg.reload({ waitUntil: 'load' }).catch(e => errs.push('reload: ' + e.message));
  await pg.waitForTimeout(3500);
  const home = await pg.evaluate(() => ({ screen: typeof state !== 'undefined' && state.screen, nav: typeof state !== 'undefined' && state.nav,
    named: /Ahana/.test(document.body.innerText), nav5: document.querySelectorAll('[data-act="setNav"]').length, words: (window.SB_DATA && SB_DATA.nsf || []).length }))
    .catch(e => ({ err: e.message }));
  ok(home.screen === 'app' && home.nav === 'home' && home.named, `offline, a reload boots to Home with the speller's name on it (${JSON.stringify(home)})`);
  ok(home.nav5 >= 5 && home.words > 100, 'and the app is all there — the nav and the boot word shard loaded from the cache');
  const p2 = await ctx.newPage(); p2.on('pageerror', e => errs.push(e.message));
  await p2.addInitScript(() => { try { localStorage.removeItem('sb_saas_v2'); localStorage.setItem('sb_t_seeded', '1'); } catch (e) {} });
  await p2.goto('http://127.0.0.1:' + srv.port + '/index.html').catch(e => errs.push('fresh: ' + e.message));
  await p2.waitForTimeout(3000);
  const land = await p2.evaluate(() => ({ screen: typeof state !== 'undefined' && state.screen })).catch(e => ({ err: e.message }));
  ok(land.screen === 'landing', 'offline, a visitor with no profile on this device still gets the opening page (' + JSON.stringify(land) + ')');
  await ctx.close();

  /* ---- 4. file:// registers nothing ---- */
  const c2 = await b.newContext();
  const p3 = await c2.newPage(); const ferrs = []; p3.on('pageerror', e => ferrs.push(e.message));
  await p3.goto('file://' + SRC + '/index.html'); await p3.waitForTimeout(3200);
  const fr = await p3.evaluate(async () => ({ sw: !!(navigator.serviceWorker && (await navigator.serviceWorker.getRegistrations()).length) })).catch(() => ({ sw: false }));
  ok(!fr.sw && !ferrs.length, 'under file:// no worker is registered and nothing throws' + (ferrs.length ? ' — ' + ferrs[0] : ''));
  await c2.close(); await b.close();
  const real = errs.filter(e => !/Failed to fetch|NetworkError|ERR_INTERNET_DISCONNECTED|net::/.test(e));
  ok(!real.length, 'no page errors' + (real.length ? ' — ' + real.slice(0, 3).join(' | ') : ''));
  console.log(fails ? `\n${fails} FAILED` : '\noffline and installable');
  process.exit(fails ? 1 : 0);
})();
