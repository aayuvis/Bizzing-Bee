/* A DICTIONARY LOOKUP IN UNDER A SECOND (road to 4.5, P1.12 — "split words-full.js into lettered lazy chunks;
   dictionary lookups < 1 s"). The v5 audit timed the whole-library load at 114 s under load: the Word Finder could
   not find one word outside the served corpus until 45 MB had arrived. Now a lookup fetches its letter's chunk.

   Measured as a phone pays for it: served gzipped and MINIFIED as the deploy ships it (tests/lib/serve.cjs), at
   390×844 with a 4× CPU throttle and a "fast 4G" network (9 Mbps down, 60 ms latency, Chromium's own emulation).
     1. the Word Finder, opened, has the library's index and reader in hand (the door asks for them)
     2. three words that are in the 130k library but NOT the served corpus — one from each of the three HEAVIEST
        chunks, so this is the worst a lookup pays — each typed into the Finder: the median shows in < 1 s (none
        over 1.5 s: one slow frame on a loaded test machine is not a slow lookup, three are), each lookup fetched
        exactly ONE chunk — the one library.js names for it — and never words-full.js or words-hard.js; typed
        letter by letter a word fetches at most two
     3. the header search finds a library-only word from its third letter (a suggestion row for it)
     4. "Load the whole library" rebuilds SB_FULL as the page always built it: the same count as app3's own
        filter over words-full.js + words-hard.js (computed here in node), the same first and last words in the
        same order, the shard merged (`_hard`), and the Ultra road (hardPool) and the Whole Hive list read it
     5. file:// still works: the Finder looks the same word up from a folder opened on disk
     6. no page errors
   Proved by breaking (each put back after): library.js's chunkFor pointed one chunk late (3 fail: the Finder's
   lookups never show, nor the header search's, nor file://'s); the whole library rebuilt in letter order instead of
   the index's (1 fails: "in the same order").
   Run: node tests/dictionary.cjs                                                                         */
'use strict';
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), vm = require('vm');
const { serve } = require('./lib/serve.cjs');
const { booted, until } = require('./lib/wait.cjs');
const ROOT = process.env.SRC || path.resolve(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const seed = { theme: 'spellbound', mode: 'light', premium: false, activeIdx: 0, pin: '1234',
  children: [{ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'bizzy', theme: 'spellbound', coins: 50, xp: 40, level: 3,
    lists: { default: { xp: 30 } }, activeList: 'default', missed: [], unlockedThemes: ['spellbound'] }] };

/* ---- what the page should build, computed from the SOURCES with app3's own filter ---- */
const sandbox = () => { const c = { console: { log() {}, warn() {}, error() {} } }; c.window = c; c.self = c; vm.createContext(c); return c; };
const S = sandbox(); vm.runInContext(read('words-full.js'), S); vm.runInContext(read('words-hard.js'), S);
const app3 = read('app3.js'), A = sandbox();
vm.runInContext(read('kid-safe.js'), A);
vm.runInContext(app3.slice(app3.indexOf('const SB_UNSAFE_RE'), app3.indexOf('function mergeHard(')) + app3.slice(app3.indexOf('function hardInto('), app3.indexOf('function fullWords(')) + ';this.__={fullClean,hardInto};', A);
const whole = A.__.fullClean(JSON.parse(S.SB_FULL)); const hardN = A.__.hardInto(whole, S.SB_HARD);
const WANT = { n: whole.length, hard: hardN, first: whole.slice(0, 15).map((r) => r.w), last: whole.slice(-15).map((r) => r.w) };
const served = new Set(require(path.join(ROOT, 'tools', 'feed-corpus.cjs')).load().DATA.map((r) => String(r.w).toLowerCase().trim()));
/* library-only words a child may see: plain letters, 9+ long, deterministic (alphabetical first in their start) */
const pick = (start) => whole.map((r) => String(r.w).toLowerCase()).filter((k) => k.startsWith(start) && /^[a-z]{9,}$/.test(k) && !served.has(k)).sort()[0];
/* the Finder's words come from the three HEAVIEST chunks (gzipped), so the timings below are the worst a lookup pays */
const IXC = sandbox(); vm.runInContext(read('words-full/index.js'), IXC); const IX = IXC.SB_FULL_IX;
const zlib = require('zlib');
const heavy = IX.f.map((f, i) => ({ f, i, gz: zlib.gzipSync(read('words-full/' + f + '.js'), { level: 6 }).length })).sort((a, b) => b.gz - a.gz).slice(0, 3);
const inChunk = (h) => (k) => k >= IX.b[h.i] && (h.i + 1 >= IX.b.length || k < IX.b[h.i + 1]);
const keys = whole.map((r) => String(r.w).toLowerCase());
const LOOK = heavy.map((h) => ({ h, w: keys.filter((k) => inChunk(h)(k) && /^[a-z]{9,}$/.test(k) && !served.has(k)).sort()[0] }));
const WORD = LOOK[0].w, WORD2 = pick('zy') || pick('xy');
ok(LOOK.every((x) => x.w) && !!WORD2, `library-only words to look up: ${LOOK.map((x) => `"${x.w}" (chunk ${x.h.f}, ${(x.h.gz / 1024).toFixed(0)} KB gz)`).join(', ')} in the Finder, "${WORD2}" in the header search`);

async function phone(b, url, net) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.addInitScript((s) => { try { if (!localStorage.getItem('sb_t_seeded')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_t_seeded', '1'); } } catch (e) {} }, seed);
  const pg = await ctx.newPage(); pg.errs = []; pg.on('pageerror', (e) => pg.errs.push(e.message));
  pg.reqs = []; pg.on('request', (r) => pg.reqs.push(r.url()));
  const cdp = await ctx.newCDPSession(pg);
  if (net) {
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 60, downloadThroughput: 9e6 / 8, uploadThroughput: 1.5e6 / 8 });
  }
  await pg.goto(url, { waitUntil: 'load' });
  pg.cdp = cdp; pg.ctx = ctx;
  return pg;
}
const lib = (u) => (u.match(/words-full\/([^/?]+)\.js/) || [])[1];

(async () => {
  const srv = await serve(ROOT, { minify: true });
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find((p) => fs.existsSync(p)) });

  /* ---- 1–3, over http, as a phone ---- */
  const pg = await phone(b, srv.url + 'index.html', true);
  ok(await booted(pg, 60000), 'a returning speller boots to Home');
  await pg.evaluate(() => app.openFinder());
  ok(await until(pg, () => window.SB_LAZY && SB_LAZY.ready('library') && !!window.SB_LIB, null, 20000), 'opening the Word Finder brings the library index and its reader (and nothing else of the library)');
  const before = pg.reqs.length;
  ok(!pg.reqs.some((u) => /words-full\.js|words-hard\.js/.test(u)) && !pg.reqs.some((u) => lib(u) && lib(u) !== 'index'), 'no chunk has been fetched yet');
  const times = [], one = [];
  for (const L of LOOK) {
    const want = await pg.evaluate((w) => SB_LIB.chunkFor(w), L.w);
    /* the test server minifies and gzips a file the first time it is asked for it (Pages serves the finished bytes
       at once), so ask it for the chunk first — the timing below is then the phone's, not the server's */
    await new Promise((res) => require('http').get(srv.url + 'words-full/' + want + '.js', { headers: { 'accept-encoding': 'gzip' } }, (r) => { r.resume(); r.on('end', res); }).on('error', res));
    const from = pg.reqs.length, t0 = Date.now();
    await pg.fill('[data-inp="finderQ"]', L.w);
    const shown = await until(pg, (w) => !!document.querySelector('[data-act="finderPick"][data-arg="' + w + '"]'), L.w, 15000);
    times.push(shown ? Date.now() - t0 : Infinity);
    const fetched = pg.reqs.slice(from).map(lib).filter(Boolean);
    one.push(fetched.length === 1 && fetched[0] === want ? '' : `${L.w}: ${fetched.join(', ') || 'none'} (want ${want})`);
  }
  const med = times.slice().sort((a, b) => a - b)[1];
  ok(med < 1000 && Math.max(...times) < 1500, `a library-only word shows in the Finder ${times.join(' / ')} ms after it is typed — median ${med} ms (a phone: 4× CPU, 9 Mbps, 60 ms) — ceiling 1000 ms, none over 1500`);
  ok(one.every((x) => !x), `each lookup fetched ONE chunk, the one library.js names for it` + (one.some(Boolean) ? ' — ' + one.filter(Boolean).join(' · ') : ''));
  ok(!pg.reqs.some((u) => /words-full\.js|words-hard\.js/.test(u)), 'and never words-full.js or words-hard.js');
  /* letter by letter: every prefix of a word lands in at most two chunks */
  await pg.fill('[data-inp="finderQ"]', '');
  const b2 = pg.reqs.length;
  await pg.click('[data-inp="finderQ"]'); await pg.keyboard.type('constellation', { delay: 30 });
  await until(pg, () => !!document.querySelector('[data-act="finderPick"][data-arg="constellation"]'), null, 15000);
  const typed = [...new Set(pg.reqs.slice(b2).map(lib).filter(Boolean))];
  ok(typed.length >= 1 && typed.length <= 2, `typed letter by letter, "constellation" fetched ${typed.length} chunk(s): ${typed.join(', ')}`);

  /* the header search, from the third letter */
  await pg.evaluate(() => app.setNav('home'));
  await pg.click('.sb-hsearch input');
  await pg.keyboard.type(WORD2.slice(0, 5), { delay: 30 });
  const sug = await until(pg, (w) => [...document.querySelectorAll('.sb-hsug-row .sb-hsug-w')].some((e) => e.textContent.trim().toLowerCase() === w), WORD2, 15000);
  ok(sug, `the header search suggests "${WORD2}" (a library-only word) from "${WORD2.slice(0, 5)}"`);

  /* ---- 4. the whole library, rebuilt as it always was ---- */
  await pg.cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await pg.cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  await pg.keyboard.press('Escape');
  await pg.evaluate(() => { app.openFinder(); state.finderQ = 'zzzzqx'; render(); });
  await until(pg, () => !!document.querySelector('[data-act="finderLoadFull"]'), null, 10000);
  /* the chunks stream ONE AT A TIME (boot-lazy WF_MAX, 15 Oct 2026): count the chunk scripts in flight while the whole
     library comes in — 86 at once froze the page for good (spelling-gym T13, Champ Dictation, beside busy loops) */
  await pg.evaluate(() => { const H = document.head, add = H.appendChild.bind(H); window.__wf = { now: 0, max: 0, n: 0 };
    H.appendChild = function (el) { if (el && el.tagName === 'SCRIPT' && /words-full\/(?!index)/.test(el.src || '')) { const w = window.__wf; w.n++; w.now++; w.max = Math.max(w.max, w.now);
        /* counted done as the loader's own handler starts (it frees the slot and starts the next chunk inside itself) */
        const done = () => { if (!el.__wfDone) { el.__wfDone = 1; w.now--; } };
        const ol = el.onload, oe = el.onerror; el.onload = function () { done(); return ol && ol.apply(this, arguments); }; el.onerror = function () { done(); return oe && oe.apply(this, arguments); }; }
      return add(el); }; });
  const tFull = Date.now();
  await pg.click('[data-act="finderLoadFull"]');
  const loaded = await until(pg, () => { try { return _fullState === 'loaded' && Array.isArray(window.SB_FULL); } catch (e) { return false; } }, null, 120000);
  await pg.evaluate(() => new Promise((r) => SB_LAZY.need('advanced', r)));   // advanced.js (hardPool) is lazy since P1.13
  const full = await pg.evaluate(() => ({ n: SB_FULL.length, hard: SB_FULL._hard, first: SB_FULL.slice(0, 15).map((r) => r.w), last: SB_FULL.slice(-15).map((r) => r.w),
    adv: (window.ADV && ADV.pool) ? ADV.pool().length : -1, hive: (coachCatalog().find((c) => c.key === 'all') || {}).count, err: (document.body.innerText.match(/Couldn.t load[^\n]*/) || [''])[0] }));
  ok(loaded, `"Load the whole library" finishes (${((Date.now() - tFull) / 1000).toFixed(1)} s unthrottled, ${full.n} words)`);
  const wf = await pg.evaluate(() => window.__wf);
  ok(wf.n >= 40 && wf.max === 1, `its chunks stream one at a time — ${wf.n} chunk scripts, never more than ${wf.max} in flight (boot-lazy WF_MAX; 86 at once froze the page)`);
  ok(full.n === WANT.n && full.hard === WANT.hard, `SB_FULL is the library app3's filter makes of the two sources: ${full.n} words (want ${WANT.n}), ${full.hard} from the championship shard (want ${WANT.hard})`);
  ok(JSON.stringify(full.first) === JSON.stringify(WANT.first) && JSON.stringify(full.last) === JSON.stringify(WANT.last), 'in the same order — the first and last fifteen words are words-full.js\'s and the shard\'s');
  ok(full.adv > 1000 && full.hive === full.n, `the Ultra road reads it (hardPool ${full.adv}) and the Whole Hive lists it (${full.hive})`);
  ok(!pg.reqs.some((u) => /words-full\.js|words-hard\.js/.test(u)), 'the whole library came in chunks too — never the 45 MB file');
  const errs1 = pg.errs.slice();
  await pg.ctx.close();

  /* ---- 5. file:// ---- */
  const fp = await phone(b, 'file://' + ROOT + '/index.html', false);
  await booted(fp, 60000);
  await fp.evaluate(() => app.openFinder());
  await until(fp, () => window.SB_LAZY && SB_LAZY.ready('library'), null, 20000);
  await fp.fill('[data-inp="finderQ"]', WORD);
  ok(await until(fp, (w) => !!document.querySelector('[data-act="finderPick"][data-arg="' + w + '"]'), WORD, 20000), `from a folder on disk (file://) the Finder looks "${WORD}" up the same way`);
  const errs2 = fp.errs.slice();
  await fp.ctx.close();

  ok(!errs1.length && !errs2.length, 'no page errors' + (errs1.concat(errs2).length ? ' — ' + errs1.concat(errs2).slice(0, 3).join(' | ') : ''));
  await b.close(); await srv.close();
  console.log(fails ? `\n${fails} FAILED` : '\na lookup is a letter, not the library');
  process.exit(fails ? 1 : 0);
})();
