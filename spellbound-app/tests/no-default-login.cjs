/* NO DEFAULT LOGIN, ANYWHERE (FIX-BEE, Oct 2026).

   auth.js shipped a seeded account — admin / admin — and signing in with it opened a console
   that could set any child's plan. A default credential is a door everyone already holds the
   key to. This fails if any login works on a fresh device, if a device that still carries the
   old seed keeps it after a boot, or if the console can be reached without the grown-up PIN.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/no-default-login.cjs                */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const ROOT = path.resolve(__dirname, '..');
const CREDS = [['admin', 'admin'], ['admin', 'password'], ['admin', '1234'], ['admin', 'admin123'], ['root', 'root'],
  ['test', 'test'], ['demo', 'demo'], ['guest', 'guest'], ['user', 'user'], ['administrator', 'administrator'], ['tester', 'tester']];

(async () => {
  /* ---- 1. the source: nothing that creates an account on its own ---- */
  for (const f of ['auth.js', 'supabase-auth.js']) {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    ok(!/seeded\s*:\s*true/.test(src), `${f} creates no seeded account`);
    ok(!/digest\(\s*['"][^'"]+['"]\s*\)/.test(src), `${f} hashes no literal password (a hard-coded credential)`);
  }

  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const url = 'file://' + ROOT + '/index.html';
  const errs = [];
  const open = async (init) => {
    const ctx = await b.newContext({ viewport: { width: 900, height: 1000 } });
    if (init) await ctx.addInitScript(init);
    const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(url); await pg.waitForTimeout(2600); return { ctx, pg };
  };

  /* ---- 2. a fresh device has no accounts, and no common pair signs in ---- */
  { const { ctx, pg } = await open();
    const r = await pg.evaluate(C => ({ users: SB_AUTH.listUsers().length,
      ins: C.filter(([e, p]) => { const x = SB_AUTH.signIn(e, p); return x && x.user; }).map(c => c.join('/')),
      admin: SB_AUTH.isAdmin() }), CREDS);
    ok(r.users === 0, `a fresh device holds no accounts (${r.users})`);
    ok(r.ins.length === 0, r.ins.length ? `default logins work: ${r.ins.join(', ')}` : `none of ${CREDS.length} default username/password pairs signs in`);
    ok(r.admin === false, 'nobody is an admin');
    /* the console is behind the grown-up PIN, not a password */
    const acct = await pg.evaluate(() => { app.setNav('settings'); const t = document.body.textContent;
      return { open: !!state.settingsOpen && /Account & subscription/.test(t), admin: /Admin console/.test(t) }; });
    ok(acct.open && !acct.admin, acct.open ? 'the parent-facing account card no longer offers an "Admin console" sign-in' : 'Settings did not open to check the account card');
    const gate = await pg.evaluate(() => { state.settingsOpen = false; state.pinDlg = null; app.openAdmin(); return { dlg: !!state.pinDlg, make: !!(state.pinDlg && state.pinDlg.make), screen: state.screen }; });
    ok(gate.dlg && gate.make && gate.screen !== 'admin', 'the support console asks a grown-up to set a PIN before it opens');
    await ctx.close(); }

  /* ---- 3. a device that still carries the seed loses it, and its session ---- */
  { const { ctx, pg } = await open(() => { try { if (localStorage.getItem('sb_t_seeded')) return;
      localStorage.setItem('sb_accounts_v1', JSON.stringify({ users: {
        admin: { id: 'admin', email: 'admin', name: 'Administrator', role: 'admin', pw: 'x', created: 0, seeded: true },
        'mum@example.com': { id: 'mum@example.com', email: 'mum@example.com', name: 'Mum', role: 'parent', pw: 'y', created: 1 } } }));
      localStorage.setItem('sb_session_v1', JSON.stringify({ id: 'admin' }));
      localStorage.setItem('sb_t_seeded', '1'); } catch (e) {} });
    const r = await pg.evaluate(() => ({ users: SB_AUTH.listUsers().map(u => u.id), cur: SB_AUTH.current(), admin: SB_AUTH.isAdmin(),
      signin: !!(SB_AUTH.signIn('admin', 'admin') || {}).user }));
    ok(r.users.indexOf('admin') < 0, `the seeded admin is purged from an old device (${JSON.stringify(r.users)})`);
    ok(r.users.indexOf('mum@example.com') >= 0, "a real parent's account is kept");
    ok(r.cur === null && !r.admin, 'the session that was signed into it is ended');
    ok(!r.signin, 'and admin / admin no longer signs in there either');
    await ctx.close(); }

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
