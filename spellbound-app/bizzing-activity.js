/* bizzing-activity.js — CLASSIC-SCRIPT PORT of the Bizzing family drop-in.

   Ported from aayuvis/Bizzing_Schedule, integration/bizzing-activity.js at commit d42455e
   (branch claude/amazing-knuth-4aemgz). The original is an ES module, and
   <script type="module"> does not load over file://, which is how Bizzing Bee runs — so the
   two exports are hung on window.BZ_ACTIVITY instead. The logic and every constant are the
   original's, unchanged; only `export` and the optional-catch bindings differ. If the drop-in
   changes upstream, re-port it from there rather than editing this copy.

   USE (one line, after the app knows which child is playing):
       BZ_ACTIVITY.trackActivity('bee', () => activeChildName());

   WHAT IT RECORDS — and nothing else:
       { a: 'bee', d: '2026-09-27', t: 1020, m: 18, who: 'Anaya' }
     app id, local date, start minute, ACTIVE minutes, the child's first name.
   It lives under the storage key 'bizzing.activity' on this device (Bee reaches it through
   store.js, its storage seam — the only change from the family drop-in). Every Bizzing app
   is served from aayuvis.github.io, so Schedule reads the same key. It is never
   sent anywhere: no network call exists in this file.

   WHAT COUNTS AS ACTIVE: the tab is visible AND the child touched, clicked, typed
   or scrolled in the last two minutes. A game left open on the table does not
   rack up time — Schedule would otherwise tell a parent a child practised for
   three hours when they watched TV beside it.

   Sessions older than 120 days, and anything past 4,000 entries, are trimmed.
   Spec: docs/02-activity-contract.md (in Bizzing_Schedule). */
(function () {
  'use strict';
  const KEY = 'bizzing.activity';
  const IDLE = 2 * 60 * 1000, TICK = 15 * 1000, GAP = 5 * 60 * 1000, KEEP_DAYS = 120, MAX = 4000;
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  function load() {
    try { const o = JSON.parse(SB_STORE.getKey(KEY) || 'null'); return o && Array.isArray(o.s) ? o : { v: 1, s: [] }; } catch (e) { return { v: 1, s: [] }; }
  }
  function store(o) {
    const cutoff = ymd(new Date(Date.now() - KEEP_DAYS * 864e5));
    o.s = o.s.filter((x) => x.d >= cutoff).slice(-MAX);
    try { SB_STORE.setKey(KEY, JSON.stringify(o)); } catch (e) {}
  }

  function trackActivity(app, getName = () => null) {
    if (typeof window === 'undefined' || !/^(bee|maths|geography|india|finance)$/.test(app)) return () => {};
    let lastInput = Date.now(), activeMs = 0, lastTick = Date.now(), session = null, lastActive = 0;
    const poke = () => { lastInput = Date.now(); };
    const EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'];
    EVENTS.forEach((e) => addEventListener(e, poke, { passive: true, capture: true }));

    const tick = () => {
      const now = Date.now(), dt = now - lastTick;
      lastTick = now;
      if (document.visibilityState !== 'visible' || now - lastInput > IDLE || dt > TICK * 3) return;
      activeMs += dt;
      if (activeMs < 60000) return;          // write whole minutes only
      activeMs -= 60000;
      const o = load(), d = new Date(), who = (getName() || '').trim() || undefined;
      // continue the session if it is the same app, child and day, and < 5 min since last active
      if (!session || now - lastActive > GAP || session.d !== ymd(d) || session.who !== who) {
        session = { a: app, d: ymd(d), t: d.getHours() * 60 + d.getMinutes(), m: 0, ...(who ? { who } : {}) };
        o.s.push(session);
      } else {
        const i = o.s.findIndex((x) => x.a === session.a && x.d === session.d && x.t === session.t && x.who === session.who);
        if (i >= 0) session = o.s[i]; else o.s.push(session);
      }
      session.m += 1;
      lastActive = now;
      store(o);
    };
    const timer = setInterval(tick, TICK);
    return () => { clearInterval(timer); EVENTS.forEach((e) => removeEventListener(e, poke, { capture: true })); };
  }

  /* A milestone — a band, world, stop or mastery reached — for Hive goals and the
     grown-ups' report. m is 0 so it never counts as minutes. */
  function trackMilestone(app, who, ev, label) {
    if (typeof window === 'undefined' || !/^(bee|maths|geography|india|finance)$/.test(app)) return;
    if (!/^(band|world|stop|mastery)$/.test(ev)) return;
    const d = new Date(), o = load();
    o.s.push({ a: app, d: ymd(d), t: d.getHours() * 60 + d.getMinutes(), m: 0, ev, label: String(label).slice(0, 80), ...(who ? { who: who.trim() } : {}) });
    store(o);
  }

  window.BZ_ACTIVITY = { trackActivity: trackActivity, trackMilestone: trackMilestone, KEY: KEY };
})();
