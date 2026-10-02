/* auth.js — Bizzing Bee account + auth layer.

   PHASE 1 SCAFFOLD — this is a LOCAL, client-side implementation backed by
   the device's storage (store.js). It is NOT a security boundary: a client-only login cannot truly
   protect anything, and the admin gate here only governs a local support console
   over on-device data. In Phase 2 the whole `window.SB_AUTH` object is re-backed by
   Supabase Auth (server-verified sessions, RBAC, row-level security) WITHOUT changing
   any caller — every screen talks to SB_AUTH.*(), never to storage directly.

   Model: a PARENT account owns the device's child profiles. Children never log in.
   There are NO default accounts. A seeded admin / admin login used to ship here and opened
   a console that could set any child's plan — a default credential is a door everyone
   already has the key to. `purge()` removes it from devices that still carry it, and
   tests/no-default-login.cjs fails if any default login ever exists again. The local
   support console now lives behind the grown-up PIN in Settings → Testing tools.
   Passwords are lightly hashed for storage hygiene only (NOT real security). */
(function () {
  var LS = 'sb_accounts_v1', SESS = 'sb_session_v1';

  // tiny non-cryptographic digest — storage hygiene, not protection (real hashing is server-side in P2)
  function digest(s) {
    var h = 5381, i = String(s).length;
    while (i) { h = (h * 33) ^ String(s).charCodeAt(--i); }
    return (h >>> 0).toString(16);
  }
  function load() { try { return JSON.parse(SB_STORE.getKey(LS) || 'null') || { users: {} }; } catch (e) { return { users: {} }; } }
  function save(db) { try { SB_STORE.setKey(LS, JSON.stringify(db)); } catch (e) {} }
  function norm(e) { return String(e || '').trim().toLowerCase(); }

  /* Every account the app ever created for itself, rather than for a person who typed an
     email, goes — and so does a session signed into one. */
  function purge() {
    var db = load(), gone = false;
    Object.keys(db.users).forEach(function (k) { var u = db.users[k]; if (u && (u.seeded || u.role === 'admin')) { delete db.users[k]; gone = true; } });
    if (gone) save(db);
    try { var s = JSON.parse(SB_STORE.getKey(SESS) || 'null'); if (s && !db.users[s.id]) SB_STORE.delKey(SESS); } catch (e) {}
    return db;
  }

  var SB_AUTH = {
    // ---- session ----
    current: function () { try { var s = JSON.parse(SB_STORE.getKey(SESS) || 'null'); if (!s) return null; var db = load(); var u = db.users[s.id]; return u ? { id: u.id, email: u.email, name: u.name, role: u.role || 'parent' } : null; } catch (e) { return null; } },
    isAuthed: function () { return !!this.current(); },
    isAdmin: function () { return false; },   // no account is an admin; see the header
    signOut: function () { try { SB_STORE.delKey(SESS); } catch (e) {} },

    // ---- credentials ----
    signUp: function (email, password, name) {
      var db = load(); var key = norm(email);
      if (!key || !password) return { error: 'Email and password are required.' };
      if (password.length < 6) return { error: 'Password must be at least 6 characters.' };
      if (db.users[key]) return { error: 'An account with that email already exists.' };
      db.users[key] = { id: key, email: key, name: (name || '').trim() || key.split('@')[0], role: 'parent', pw: digest(password), created: 1 };
      save(db);
      try { SB_STORE.setKey(SESS, JSON.stringify({ id: key })); } catch (e) {}
      return { user: { id: key, email: key, name: db.users[key].name, role: 'parent' } };
    },
    signIn: function (email, password) {
      var db = load(); var key = norm(email);
      var u = db.users[key];
      if (!u || u.pw !== digest(password)) return { error: 'Wrong email or password.' };
      try { SB_STORE.setKey(SESS, JSON.stringify({ id: key })); } catch (e) {}
      return { user: { id: u.id, email: u.email, name: u.name, role: u.role || 'parent' } };
    },
    changePassword: function (email, newPassword) {
      var db = load(); var u = db.users[norm(email)];
      if (!u) return { error: 'No such account.' };
      if (!newPassword || newPassword.length < 6) return { error: 'Password must be at least 6 characters.' };
      u.pw = digest(newPassword); save(db); return { ok: true };
    },

    // ---- admin helpers (local console over on-device data) ----
    listUsers: function () { var db = load(); return Object.keys(db.users).map(function (k) { var u = db.users[k]; return { id: u.id, email: u.email, name: u.name, role: u.role || 'parent' }; }); }
  };

  purge();
  window.SB_AUTH = SB_AUTH;
})();
