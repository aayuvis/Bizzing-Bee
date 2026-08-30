/* telemetry.js — SB_TM, the on-device research recorder. OFF BY DEFAULT.
   There is NO hosted backend for Bizzing Bee and there must never be one that
   receives child data: privacy.html promises nothing is transmitted, and this
   file keeps that promise. When a grown-up arms "Research capture" in
   Settings → Testing tools, the recorder logs INTERACTION events — taps (as
   viewport-percent coordinates for heatmaps), the screen they landed on, the
   data-act they hit, screen-time heartbeats, JS errors, session opens and the
   optional end-of-session reaction — to localStorage on THIS device only.
   Nothing personal is ever written: no name, no age, no words typed.
   The log exports as sb-research.json and is read by backend.html, the
   operator console that lives in the repo and is NEVER deployed to the site.
   Contract: SB_TM.on() / arm(bool) / rec(ev) / list() / clear() / export(). */
(function () {
  var KEY = 'sb_tm_log', SW = 'sb_tm_on', CAP = 12000;
  var buf = null, sid = Date.now().toString(36);
  function ls(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function on() { return ls(SW) === '1'; }
  function load() { if (buf) return buf; try { buf = JSON.parse(ls(KEY) || '[]'); } catch (e) { buf = []; } return buf; }
  var _wt = null;
  function write() { clearTimeout(_wt); _wt = setTimeout(function () {
    try { localStorage.setItem(KEY, JSON.stringify(load())); } catch (e) {
      /* full: drop the oldest half and try once more */
      try { buf = load().slice(-Math.floor(CAP / 2)); localStorage.setItem(KEY, JSON.stringify(buf)); } catch (e2) {}
    } }, 400); }
  function nav() { try { return (typeof state !== 'undefined' && state) ? String(state.screen === 'app' ? (state.nav || '?') : state.screen) : '?'; } catch (e) { return '?'; } }
  function rec(ev) { if (!on()) return;
    var b = load(); ev = ev || {};
    ev.t = Date.now(); ev.s = sid; if (!ev.nav) ev.nav = nav();
    b.push(ev); if (b.length > CAP) b.splice(0, b.length - CAP);
    write(); }

  /* taps: viewport-PERCENT coordinates so heatmaps survive every screen size */
  document.addEventListener('pointerdown', function (e) { if (!on()) return; try {
    var el = e.target && e.target.closest ? e.target.closest('[data-act]') : null;
    rec({ k: 'tap', x: Math.round(e.clientX / innerWidth * 1000) / 10, y: Math.round(e.clientY / innerHeight * 1000) / 10,
      w: innerWidth, h: innerHeight, act: el ? String(el.getAttribute('data-act')).slice(0, 40) : '' });
  } catch (err) {} }, { capture: true, passive: true });

  /* errors — the single most valuable event on a tester's tablet */
  window.addEventListener('error', function (e) { try {
    rec({ k: 'err', m: String(e.message || '').slice(0, 200), f: String(e.filename || '').split('/').pop().slice(0, 60), l: e.lineno || 0 }); } catch (err) {} });

  /* screen-time heartbeat: one beat per 5 visible seconds on whatever screen is up */
  setInterval(function () { try { if (on() && document.visibilityState === 'visible') rec({ k: 'hb' }); } catch (e) {} }, 5000);
  setTimeout(function () { try { rec({ k: 'open', v: String(window.SB_ASSET_V || '').replace('?v=', ''), w: innerWidth, h: innerHeight }); } catch (e) {} }, 1200);

  window.SB_TM = {
    on: on,
    arm: function (v) { try { localStorage.setItem(SW, v ? '1' : '0'); } catch (e) {} if (v) { buf = load(); rec({ k: 'arm' }); } },
    rec: rec,
    list: function () { return load().slice(); },
    count: function () { return load().length; },
    clear: function () { buf = []; try { localStorage.setItem(KEY, '[]'); } catch (e) {} },
    export: function () { var b = load(); if (!b.length) return null;
      return JSON.stringify({ exported: new Date().toISOString(), device: innerWidth + 'x' + innerHeight, events: b }); }
  };
})();
