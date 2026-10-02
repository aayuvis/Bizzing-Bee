/* FIRST-LOAD BUDGET (FIX-BEE N2, family standard §11) — measured the way a phone pays for it.

   The audit measured ~41MB on a desktop first load (29MB on a phone). Most of that was not
   the first screen at all: the idle queue in boot-lazy.js fetched every data file the app
   owns (the 15MB second word shard, 6MB of etymology, 4.4MB of alternate senses…) the moment
   the page went quiet, whether or not the child ever opened the screen that reads them.

   THE BUDGET (family standard §11):
     · first screen ≤ 1.5 MB transferred on a phone
     · initial JavaScript ≤ 400 KB gzipped
     · data and art lazy per route — no word clip, no data shard the screen does not use
   Measured here at 390×844 (a phone), over tests/lib/serve.cjs, which gzips like Pages —
   localhost and file:// both serve uncompressed and overstate everything 3-4x — and serves
   the JS minified exactly as deploy-*.sh ships it (tools/minify.cjs). Bytes are the
   server's own count of what it sent (+300 a response for headers), for everything from
   navigation until nothing has been sent for 4s, with no interaction — so a service
   worker's warm-up fetches count too. `RAW=1` also prints the unminified figure. Two first screens: a NEW visitor (no profile: the opening page) and
   a RETURNING speller (a profile on the device: Home).

   It measures the tree it is pointed at: SRC=<dir> (a deploy tree, which is minified by
   deploy-*.sh) — by default the source folder. `REPORT=1` prints every resource.
   Run: node tests/first-load.cjs                                                         */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const { serve } = require('./lib/serve.cjs');
const SRC = process.env.SRC || path.resolve(__dirname, '..');
const KB = 1024, MB = 1024 * 1024;
/* THE FAMILY TARGET (standard §11), reported every run with the gap still to close. */
const TARGET = { total: 1.5 * MB, js: 400 * KB };
/* THE RATCHET — what this build is held to, and the only figures that fail the test. Set
   from the measurement after FIX-BEE N2 (2 Oct 2026) with ~4% headroom; lower them as each
   remaining lever lands (see fixbee-notes/d-platform.md), never raise them to make a
   change pass. Before N2 a first load was 12.3MB gzipped (~41MB as the audit measured it,
   uncompressed); after it, ~1.7MB with 1.22MB of JavaScript.
     What stands between this and the target, measured:
     · words-data.js, the 8,000-word boot tier: 594KB of the 1,219KB of JS. Sharding it
       smaller means re-keying app3's curriculum memos (defaultStages, journeySorted…),
       which are built ONCE from whatever SB_DATA holds at first render.
     · app3.js: 277KB minified — needs a code split, i.e. app3 changes.
     · the opening splash's audio and art (126KB + 88KB) on a returning speller's load,
       and the opening page's screenshots and avatar row (~340KB) on a new visitor's. */
/* FIX-BEE v2 (2 Oct 2026) lowered it: the boot tier's sentences moved to words-data-s.js (−200KB),
   the landing's screenshots all lazy (−250KB), and the opening splash became opt-in — the family
   standard has no load screens for now (−240KB of its audio and art). Both first screens are now
   ~1.27MB: the 1.5MB family target is MET. The 400KB JS target is not: words-data.js (354KB) and
   app3.js (288KB) are what is left. */
const CEILING = { 'new visitor': { total: 1330 * KB, js: 1050 * KB }, 'returning speller': { total: 1330 * KB, js: 1050 * KB } };
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const seed = { theme: 'spellbound', mode: 'light', premium: false, activeIdx: 0, pin: '1234',
  children: [{ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'bizzy', theme: 'spellbound', coins: 50, xp: 40, level: 3,
    lists: { default: { xp: 30 } }, activeList: 'default', missed: [], unlockedThemes: ['spellbound'] }] };

async function measure(b, srv, seeded) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  if (seeded) await ctx.addInitScript(s => { try { if (!localStorage.getItem('sb_t_seeded')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_t_seeded', '1'); } } catch (e) {} }, seed);
  const pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  const off = []; pg.on('request', r => { if (!r.url().startsWith(srv.url) && !/^(data|blob):/.test(r.url())) off.push(r.url()); });
  const from = srv.log.length, t0 = Date.now();
  await pg.goto(srv.url + 'index.html', { waitUntil: 'load' });
  // quiet = the server has sent nothing for 4s (cap 25s). The server's own log is the
  // count, so a service worker's fetches are in it too.
  const lastT = () => (srv.log.length > from ? srv.log[srv.log.length - 1].t : t0);
  while (Date.now() - lastT() < 4000 && Date.now() - t0 < 25000) await pg.waitForTimeout(250);
  const screen = await pg.evaluate(() => ({ screen: state.screen, nav: state.nav }));
  await ctx.close();
  const kind = u => /\.js$/.test(u) ? 'js' : /\.css$/.test(u) ? 'css' : /\.(woff2?|ttf)$/.test(u) ? 'font' : /\.(mp3|wav|ogg)$/.test(u) ? 'audio'
    : /\.(png|jpe?g|webp|svg|gif)$/.test(u) ? 'image' : /\.html$/.test(u) ? 'doc' : 'other';
  /* +300 bytes a response for headers, which the body count leaves out */
  const rows = srv.log.slice(from).map(r => ({ short: r.path.replace(/^\//, ''), bytes: r.bytes + 300, kind: kind(r.path) }));
  const sum = k => rows.filter(r => !k || r.kind === k).reduce((t, r) => t + r.bytes, 0);
  return { rows, screen, errs, off, total: sum(), by: { doc: sum('doc'), js: sum('js'), css: sum('css'), font: sum('font'), image: sum('image'), audio: sum('audio'), other: sum('other') } };
}

const fmt = n => (n / KB).toFixed(1).padStart(8) + ' KB';

(async () => {
  /* served MINIFIED, as deploy-*.sh ships it (tools/minify.cjs over the deploy copy) */
  const srv = await serve(SRC, { minify: process.env.MINIFY !== '0' });
  const raw = process.env.RAW ? await serve(SRC) : null;
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => require('fs').existsSync(p)) });
  const out = {};
  for (const [name, seeded] of [['new visitor', false], ['returning speller', true]]) {
    const m = await measure(b, srv, seeded);
    if (raw) { const r = await measure(b, raw, seeded); console.log(`\n  (unminified, for reference: ${(r.total / KB).toFixed(0)} KB total, ${(r.by.js / KB).toFixed(0)} KB JS)`); }
    out[name] = m;
    console.log(`\n${name.toUpperCase()} — lands on ${m.screen.screen}/${m.screen.nav}, ${m.rows.length} requests, ${(m.total / MB).toFixed(2)} MB transferred`);
    console.log('  ' + Object.entries(m.by).filter(([, v]) => v).map(([k, v]) => `${k} ${(v / KB).toFixed(0)}KB`).join(' · '));
    if (process.env.REPORT) m.rows.slice().sort((a, b) => b.bytes - a.bytes).forEach(r => console.log('   ' + fmt(r.bytes) + '  ' + r.kind.padEnd(6) + r.short + (r.failed ? '  [' + r.failed + ']' : '')));
    else m.rows.slice().sort((a, b) => b.bytes - a.bytes).slice(0, 8).forEach(r => console.log('   ' + fmt(r.bytes) + '  ' + r.kind.padEnd(6) + r.short));
    const C = CEILING[name];
    ok(m.total <= C.total, `${name}: first screen ${(m.total / KB).toFixed(0)} KB transferred — ceiling ${C.total / KB} KB`);
    ok(m.by.js <= C.js, `${name}: initial JavaScript ${(m.by.js / KB).toFixed(0)} KB gzipped — ceiling ${C.js / KB} KB`);
    console.log(`  TARGET family §11: ${(m.total / KB).toFixed(0)}/${TARGET.total / KB} KB total` + (m.total > TARGET.total ? ` — ${((m.total - TARGET.total) / KB).toFixed(0)} KB to go` : ' — MET') +
      `; ${(m.by.js / KB).toFixed(0)}/${TARGET.js / KB} KB JS` + (m.by.js > TARGET.js ? ` — ${((m.by.js - TARGET.js) / KB).toFixed(0)} KB to go` : ' — MET'));
    /* The splash's own cue and stinger (app-art/*.mp3) are the opening show's, reported as
       a gap for whoever owns the splash. Any OTHER audio at boot — a word clip, narration —
       is a preload nobody asked for, and fails. */
    const audio = m.rows.filter(r => r.kind === 'audio');
    const splash = audio.filter(r => /^app-art\/[a-z0-9-]+\.mp3$/.test(r.short)), stray = audio.filter(r => !splash.includes(r));
    ok(!stray.length, `${name}: no word clip or narration fetched before the child asks for it` + (stray.length ? ' — ' + stray.map(r => r.short).join(', ') : ''));
    if (splash.length) console.log(`  GAP  the opening splash fetches its sound at boot: ${splash.map(r => r.short).join(', ')} (${(splash.reduce((t, r) => t + r.bytes, 0) / KB).toFixed(0)} KB)`);
    const shards = m.rows.filter(r => /words-data-2|words-lore|word-alternates|word-synonyms|words-full|words-hard|quotes-lib|figurative-data|concepts-data|trivia-q\d|trivia-words|voice-words|lessons-data|nsf-vocab26/.test(r.short));
    ok(!shards.length, `${name}: no data shard the first screen does not read` + (shards.length ? ' — ' + shards.map(r => r.short).join(', ') : ''));
    ok(!m.off.length, `${name}: nothing fetched from another host` + (m.off.length ? ' — ' + m.off.slice(0, 3).join(', ') : ''));
    ok(!m.errs.length, `${name}: no page errors` + (m.errs.length ? ' — ' + m.errs.slice(0, 3).join(' | ') : ''));
  }
  ok(out['new visitor'].screen.screen === 'landing' && out['returning speller'].screen.screen === 'app' && out['returning speller'].screen.nav === 'home',
    'the two first screens are the ones measured (new → landing, returning → home)');
  await b.close(); await srv.close(); if (raw) await raw.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall first-load budgets hold');
  process.exit(fails ? 1 : 0);
})();
