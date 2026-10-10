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
module.exports = { until, booted, lazy, frames, still, STILL, raceTime, RACE_DT_MAX };
