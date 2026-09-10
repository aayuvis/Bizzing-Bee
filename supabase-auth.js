/* supabase-auth.js — real accounts, re-backing window.SB_AUTH.

   WHY THERE IS NO SDK HERE
     This app has no bundler and never will. Supabase's auth and data APIs are
     ordinary REST, so plain fetch is not a workaround — it is the correct client
     for a no-build app, and it costs nothing at boot.

   WHAT THIS FILE DOES AND DOES NOT CHANGE
     It replaces the four methods that talk to storage: signUp, signIn, signOut,
     current. Every screen already calls SB_AUTH.*() and none of them know or care
     what is underneath, which is the whole reason the swap is this small.

     It does NOT touch the child profiles. Children never authenticate. What lands
     here is one adult's email and a session token, and nothing else.

   IF ANYTHING IS NOT CONFIGURED, THIS FILE DOES NOTHING AT ALL. auth.js keeps its
   local implementation, the app behaves exactly as it does today, and no request
   is made. That is deliberate: the offline promise is not conditional on a backend
   being reachable, or existing.  */
(function () {
  if (!window.SB_CLOUD_ON || !window.SB_CLOUD_ON()) return;   // local mode, untouched

  var CFG = window.SB_CFG;
  var SESS = 'sb_session_v2';          // {access_token, refresh_token, expires_at, user}
  var LOCAL = window.SB_AUTH;          // kept as the offline fallback

  function api(path, opts) {
    opts = opts || {};
    var h = { 'apikey': CFG.anon, 'Content-Type': 'application/json' };
    if (opts.token) h['Authorization'] = 'Bearer ' + opts.token;
    var ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var t = ctrl ? setTimeout(function () { ctrl.abort(); }, CFG.timeoutMs || 6000) : null;
    return fetch(CFG.url.replace(/\/+$/, '') + path, {
      method: opts.method || 'GET',
      headers: h,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: ctrl ? ctrl.signal : undefined,
    }).then(function (r) {
      if (t) clearTimeout(t);
      return r.text().then(function (txt) {
        var j = null; try { j = txt ? JSON.parse(txt) : null; } catch (e) {}
        if (!r.ok) {
          var msg = (j && (j.error_description || j.msg || j.message || j.error)) || ('HTTP ' + r.status);
          throw new Error(msg);
        }
        return j;
      });
    }, function (e) {
      if (t) clearTimeout(t);
      throw new Error(e && e.name === 'AbortError' ? 'The network is slow — try again' : 'No connection');
    });
  }

  function saveSession(s) {
    try {
      localStorage.setItem(SESS, JSON.stringify({
        access_token: s.access_token, refresh_token: s.refresh_token,
        expires_at: Date.now() + ((s.expires_in || 3600) * 1000),
        user: { id: s.user.id, email: s.user.email },
      }));
    } catch (e) {}
  }
  function readSession() {
    try { return JSON.parse(localStorage.getItem(SESS) || 'null'); } catch (e) { return null; }
  }

  /* The session is refreshed in the background, never on the critical path. A child
     opening the app must not wait on a token endpoint to reach a word. */
  function refreshIfStale() {
    var s = readSession();
    if (!s || !s.refresh_token) return;
    if (Date.now() < (s.expires_at || 0) - 120000) return;         // still good
    api('/auth/v1/token?grant_type=refresh_token', { method: 'POST',
      body: { refresh_token: s.refresh_token } })
      .then(function (r) { if (r && r.access_token) saveSession(r); })
      .catch(function () { /* offline: keep using what we have */ });
  }

  var CLOUD = {
    /* Synchronous, because every caller expects it to be. Reads the cached session
       rather than the network — which also means the parent stays signed in on a
       plane, exactly as they should. */
    current: function () {
      var s = readSession();
      if (!s || !s.user) return null;
      refreshIfStale();
      return { id: s.user.id, email: s.user.email, name: s.user.email, role: 'parent' };
    },
    isAuthed: function () { return !!this.current(); },
    /* No admin role over the network. The local console governed on-device data and
       had a seeded admin/admin credential; against a real database that is a door,
       so cloud mode simply does not have one. */
    isAdmin: function () { return false; },

    signOut: function () {
      var s = readSession();
      try { localStorage.removeItem(SESS); } catch (e) {}
      if (s && s.access_token) {
        api('/auth/v1/logout', { method: 'POST', token: s.access_token }).catch(function () {});
      }
    },

    /* signUp/signIn return a PROMISE here, where the local version returned a value.
       app3.js's doSignIn/doSignUp are updated to handle both, so a build with no
       backend configured keeps working unchanged. */
    signUp: function (email, pw, name) {
      email = String(email || '').trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return Promise.resolve({ error: 'That email does not look right' });
      if (String(pw || '').length < 8) return Promise.resolve({ error: 'Use at least 8 characters' });
      return api('/auth/v1/signup', { method: 'POST', body: { email: email, password: pw } })
        .then(function (r) {
          if (r && r.access_token) { saveSession(r); return { user: CLOUD.current() }; }
          /* Email confirmation is on: there is no session yet, and saying so plainly
             beats a spinner that never resolves. */
          return { pending: true, message: 'Check your email to confirm the account' };
        })
        .catch(function (e) { return { error: e.message }; });
    },

    signIn: function (email, pw) {
      email = String(email || '').trim().toLowerCase();
      return api('/auth/v1/token?grant_type=password', { method: 'POST',
        body: { email: email, password: pw } })
        .then(function (r) { saveSession(r); return { user: CLOUD.current() }; })
        .catch(function (e) {
          /* A wrong password and a dead network are different problems and must not
             wear the same message — one is the parent's to fix, the other is not. */
          var m = /Invalid login|invalid_grant|credential/i.test(e.message)
            ? 'That email or password is not right' : e.message;
          return { error: m };
        });
    },

    changePassword: function (_old, next) {
      var s = readSession();
      if (!s) return Promise.resolve({ error: 'Sign in first' });
      if (String(next || '').length < 8) return Promise.resolve({ error: 'Use at least 8 characters' });
      return api('/auth/v1/user', { method: 'PUT', token: s.access_token, body: { password: next } })
        .then(function () { return { ok: true }; })
        .catch(function (e) { return { error: e.message }; });
    },

    resetPassword: function (email) {
      return api('/auth/v1/recover', { method: 'POST', body: { email: String(email || '').trim().toLowerCase() } })
        .then(function () { return { ok: true }; })
        .catch(function (e) { return { error: e.message }; });
    },

    listUsers: function () { return []; },       // no admin console against real data
    token: function () { var s = readSession(); return s && s.access_token; },
    isCloud: true,
  };

  window.SB_AUTH = CLOUD;
  window.SB_AUTH_LOCAL = LOCAL;                  // kept for migration off the old store
})();
