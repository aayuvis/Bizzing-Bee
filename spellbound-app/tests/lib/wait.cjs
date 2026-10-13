/* WAIT ON STATE, NOT ON TIME — the helpers the browser tests share.

   A fixed sleep before an assertion is a bet that the machine is as fast as it was the day
   the test was written. On a shared box running a deploy, another agent's suite and this
   one, it loses: seven tests passed alone and failed in the full run (audit v4, R5). Each
   helper here waits for the condition the next line actually needs, and returns false
   (never throws) when it does not arrive, so the assertion after it is what fails — with
   its own message, not a timeout's.

     booted(pg)              the app has run: every deferred script, `app` and `state`
                             defined, and #root drawn (what the old 2.8s sleep stood for)
     until(pg, fn, arg, ms)  page.waitForFunction that answers true/false
     lazy(pg, group)         SB_LAZY.need(group) has called back — the files are in
     frames(pg, n)           n animation frames have been painted (n >= 2: one to run the
                             frame's callbacks, one to know its pixels are on the canvas)
     still(pg)               the page holds still for measuring: transitions and animations
                             off, so a colour or a box read is the final one, never mid-fade
     quietRender(pg, ms)     the app has not redrawn for `ms` (300): a lazy file that lands redraws the
                             whole app (boot-lazy softRender, 140 ms after it lands), so a screen read
                             the moment its own files are in can be read mid-redraw — a plate not yet
                             repainted reads as white (road to 4.5, P1.13: mockbee-stage, one-row)
     raceTime(pg, secs)      the Grand Prix has simulated `secs` of RACE time — see below
   A test that runs a long sequence inside one page.evaluate defines the same `until` there as
   a local `U(fn, ms)`; a function cannot be handed into the page as a closure.

   RACE TIME. A test that holds a key for 300ms of WALL time and then reads the kart is reading
   the scheduler: on a loaded machine the race and the wall clock part company. raceTime waits
   on the race's OWN clock — window._race.state().raceT, the seconds the engine has simulated —
   and resolves when the race itself has moved on `secs`. Only a page without the debug handle
   falls back to counting frames, clamped at RACE_DT_MAX the way the engine's loop clamps them.
   10 Oct 2026 (P0.18, "gp-handling" red in the full suite): this used to ALWAYS count frames at
   a 50ms clamp, left over from the race's old `frame(ts)` loop. The race had moved to the engine
   kit's sgLoop (up to 0.1 s a frame then, 0.25 s now), so on frames over 50ms the race ran ahead
   of the count — "0.7 s of race" was up to twice that, the kart reached the next bend, and "out of
   a bend and onto a straight, the kart holds its line" failed with "(left the straight!)". It
   fails that way under an 8× CPU throttle with the frame count, and passes reading raceT.      */
'use strict';
async function until(pg, fn, arg, ms) {
  return pg.waitForFunction(fn, arg === undefined ? null : arg, { timeout: ms || 15000, polling: 50 }).then(() => true, () => false);
}
async function booted(pg, ms) {
  return until(pg, () => { try { return document.readyState === 'complete' && typeof app === 'object' && typeof state === 'object'
    && !!document.querySelector('#root') && document.querySelector('#root').children.length > 0; } catch (e) { return false; } }, null, ms || 30000);
}
async function lazy(pg, group) {
  return pg.evaluate(g => new Promise(r => SB_LAZY.need(g, r)), group);
}
async function frames(pg, n) {
  return pg.evaluate(n => new Promise(r => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n || 2);
}
const STILL = '*,*::before,*::after{transition:none!important;animation:none!important}';
async function still(pg) { await pg.addStyleTag({ content: STILL }); }
async function quietRender(pg, ms) {
  return pg.evaluate((ms) => new Promise((res) => { const r0 = window.render; if (typeof r0 !== 'function') return res(false);
    let last = performance.now(); const t0 = last;
    window.render = function () { last = performance.now(); return r0.apply(this, arguments); };
    const k = () => { const now = performance.now(); if (now - last >= ms || now - t0 > 8000) { window.render = r0; res(now - last >= ms); } else setTimeout(k, 40); }; k(); }), ms || 300);
}
const RACE_DT_MAX = 0.25;   // sgLoop's clip: a frame counts at most 0.25 s (saga2.js)
async function raceTime(pg, secs) {
  return pg.evaluate(([secs, cap]) => new Promise(r => {
    const clock = () => { try { const R = window._race; const t = R && R.state ? +R.state().raceT : NaN; return isFinite(t) ? t : NaN; } catch (e) { return NaN; } };
    const t0 = clock();
    if (!isNaN(t0)) { const f = () => { const t = clock(); if (isNaN(t) || t - t0 >= secs) r(isNaN(t) ? secs : t - t0); else requestAnimationFrame(f); }; requestAnimationFrame(f); return; }
    let acc = 0, last = null;
    const f = ts => { if (last != null) acc += Math.min(cap, (ts - last) / 1000); last = ts; if (acc >= secs) r(acc); else requestAnimationFrame(f); };
    requestAnimationFrame(f); }), [secs, RACE_DT_MAX]);
}
/* storageSettled(ctx, n, ms, at, want): wait until the browser holds what the page wrote, BEFORE a reload. Chromium hands a
   page's localStorage writes to the browser process asynchronously, and a reload made before they land can start the new
   document on storage that is EMPTY (pin-mandatory read "0 keys of 5" on disk, 13 Oct 2026) or one write short
   (daily-bee: the solver's coin gone after the reload, the same day) — a persistent profile makes it rarer, not
   impossible. A second page in the same context reads the browser's copy (same origin, a blank page that writes
   nothing), so when it holds n keys — and, given `want()` (the page's own digest, re-read each time because the page may
   still be writing), the same digest — the reload will too. Waits on state, never on a sleep. It is a wait, NOT a
   witness: once in six pin-mandatory runs at --cpu 4 the probe saw only the keys seeded before boot for the whole 8 s
   while the reloaded page started on every key — a test asserts what the NEW document started on, never this. */
const DIGEST = () => { let h = 2166136261; const ks = Object.keys(localStorage).sort();
  for (const k of ks) { const v = k + '\u0000' + localStorage.getItem(k) + '\u0001'; for (let i = 0; i < v.length; i++) { h ^= v.charCodeAt(i); h = Math.imul(h, 16777619); } }
  return ks.length + ':' + (h >>> 0).toString(36); };
async function storageSettled(ctx, n, ms = 8000, at, want) {
  const probe = await ctx.newPage();
  try {
    /* over http the probe must share the page's origin: the served tree's own copy of this file (the test servers serve
       spellbound-app, and a navigation is network-first in sw.js, so it is fetched, not answered with index.html) */
    const http = at && /^https?:/.test(at);
    await probe.goto(http ? new URL('tests/lib/storage-probe.html', at).href : 'file://' + require('path').resolve(__dirname, 'storage-probe.html'));
    const t0 = Date.now(); let seen = [], dg = '', w = '';
    while (Date.now() - t0 < ms) {
      [seen, dg] = await probe.evaluate((D) => [Object.keys(localStorage), (0, eval)(D)()], '(' + DIGEST + ')');
      w = want ? await want() : '';
      if (seen.length >= n && (!want || dg === w)) { storageSettled.last = { seen }; return true; }
      await new Promise((r) => setTimeout(r, 50));
    }
    storageSettled.last = { seen, digest: dg, page: w };
    return false;
  } finally { await probe.close(); }
}
/* reloadSettled(page, opts): the reload every test makes — first the page goes idle (a write queued behind a busy
   main thread is not sent yet), then the browser holds every key the page holds, with the same values (storageSettled
   on the page's own context and origin), then page.reload(opts). Returns false (and still reloads) only if they never
   settle, so a test that asserts its starting storage can say why. */
async function reloadSettled(page, opts) {
  /* capped from Node: a test on Playwright's installed clock (hive-activity) fakes requestIdleCallback and its timeout too */
  await Promise.race([page.evaluate(() => new Promise((r) => (window.requestIdleCallback || setTimeout)(() => r(), { timeout: 3000 }))).catch(() => {}),
    new Promise((r) => setTimeout(r, 3000))]);
  const n = await page.evaluate(() => { window.__probeWrites = 0; addEventListener('storage', () => { window.__probeWrites++; }); return localStorage.length; }).catch(() => 0);
  const want = () => page.evaluate((D) => (0, eval)(D)(), '(' + DIGEST + ')').catch(() => '');
  /* no shortcut for an empty page: a page that has just removed every key must wait for the removals too (the digest) */
  const ok = await storageSettled(page.context(), n, 8000, page.url(), want);
  /* the probe is a page of the test's context, so the context's init scripts run in it too. One that seeds on what it
     does not find (feed-screen's keys on sessionStorage, which a new tab never has) would write over the very storage
     being kept — the page hears that as a 'storage' event from another document, and the reload stops here, loudly. */
  const wrote = await page.evaluate(() => window.__probeWrites || 0).catch(() => 0);
  if (wrote) throw new Error(`reloadSettled: the context's init scripts wrote storage ${wrote}× in the probe page — make them skip storage-probe.html`);
  reloadSettled.last = storageSettled.last;
  /* NEVER SETTLED = the broken storage link (CLAUDE.md, 13 Oct): the page's renderer holds writes the browser never got,
     and a reload that lands in another process would start on old storage. The page's storage is the truth the test
     made; carry it to the browser, exactly, through the probe tab (whose link works) — every key the page holds, at its
     value, and nothing it does not — and say so. Still returns false: a test that must not trust this reload (trust-v2)
     starts again; the rest reload onto what the page really left. */
  if (!ok) {
    const snap = await page.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; }).catch(() => null);
    if (snap) {
      const at = page.url(), probe = await page.context().newPage();
      try {
        await probe.goto(/^https?:/.test(at) ? new URL('tests/lib/storage-probe.html', at).href : 'file://' + require('path').resolve(__dirname, 'storage-probe.html'));
        const fixed = await probe.evaluate((s) => { let n = 0; for (const k of Object.keys(localStorage)) if (!(k in s)) { localStorage.removeItem(k); n++; }
          for (const k in s) if (localStorage.getItem(k) !== s[k]) { localStorage.setItem(k, s[k]); n++; } return n; }, snap);
        console.log(`  note reloadSettled: the browser never held what the page wrote (a broken storage link) — ${fixed} key(s) carried to it from the page before the reload`);
      } finally { await probe.close(); }
    }
  }
  await page.reload(opts);
  return ok;
}

module.exports = { until, booted, lazy, frames, still, quietRender, storageSettled, reloadSettled, STILL, raceTime, RACE_DT_MAX };
