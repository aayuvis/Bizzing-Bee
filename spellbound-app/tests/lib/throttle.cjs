/* CPU THROTTLING FOR ANY TEST — `node tests/lib/run.cjs --cpu 4 <name>` (or SB_CPU_THROTTLE=4).

   A test that passes alone and fails in the full run is waiting on TIME rather than on STATE:
   a fixed sleep that was long enough on an idle machine is not long enough on a loaded one.
   The way to find those before the suite does is to run the test slowed down on purpose.

   Preloaded with `node --require tests/lib/throttle.cjs <test>` (run.cjs does this for --cpu),
   it wraps Playwright so that every page any test opens — browser.newPage, context.newPage,
   a popup — is slowed by Chromium's own CPU throttle (CDP Emulation.setCPUThrottlingRate,
   the DevTools "4x slowdown") BEFORE the test gets the page back, so its first goto is
   already slow. No test has to know. Rate 1 (or unset) leaves Playwright untouched.        */
'use strict';
const RATE = +process.env.SB_CPU_THROTTLE || 0;
if (RATE > 1) {
  const Module = require('module');
  const orig = Module.prototype.require;
  const done = new WeakSet();
  const slow = async page => {
    if (!page || done.has(page)) return page; done.add(page);
    try { const s = await page.context().newCDPSession(page); await s.send('Emulation.setCPUThrottlingRate', { rate: RATE }); } catch (e) {}
    return page;
  };
  const wrapCtx = ctx => {
    if (!ctx || ctx.__sbThrottled) return ctx; ctx.__sbThrottled = true;
    const np = ctx.newPage.bind(ctx);
    ctx.newPage = async (...a) => slow(await np(...a));
    ctx.on('page', p => { slow(p); });     // popups and pages opened by the page itself
    return ctx;
  };
  const wrapBrowser = b => {
    if (!b || b.__sbThrottled) return b; b.__sbThrottled = true;
    const nc = b.newContext.bind(b), np = b.newPage.bind(b);
    b.newContext = async (...a) => wrapCtx(await nc(...a));
    b.newPage = async (...a) => { const p = await np(...a); wrapCtx(p.context()); return slow(p); };
    return b;
  };
  let patched = false;
  Module.prototype.require = function (id) {
    const m = orig.apply(this, arguments);
    if (!patched && (id === 'playwright' || id === 'playwright-core') && m && m.chromium) {
      patched = true;
      const ch = m.chromium, launch = ch.launch.bind(ch), persist = ch.launchPersistentContext.bind(ch);
      ch.launch = async (...a) => wrapBrowser(await launch(...a));
      ch.launchPersistentContext = async (...a) => { const c = wrapCtx(await persist(...a)); c.pages().forEach(slow); return c; };
      if (!process.env.SB_CPU_QUIET) console.log(`  [cpu throttled ${RATE}x]`);
    }
    return m;
  };
}
