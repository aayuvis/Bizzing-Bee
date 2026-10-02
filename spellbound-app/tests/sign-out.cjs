/* "Sign out" — one action, in Settings → Grown-ups (behind the PIN since FIX-BEE v2: signing a
   family out is a grown-up's act, and the ☰ menu now follows the family order exactly, ending on
   "Back to the Hive" — family standard §3).
   There used to be two controls and neither was right. app.signOut only returned to the
   landing screen, so a button labelled "Sign out" was a lie; the REAL one (SB_AUTH.signOut)
   was a chip inside the account card, invisible unless a parent happened to be signed in —
   so a family playing offline had no sign-out at all. Renaming the first to "Exit to the
   start screen" described the mechanism honestly and answered a question nobody asks.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/sign-out.cjs */
const { chromium } = require('playwright');
const root = require('path').resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => require('fs').existsSync(p)) });
  const errs = [];
  const pg = await b.newPage({ viewport: { width: 1180, height: 1400 } });
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await pg.goto('file://' + root + '/index.html');
  await pg.waitForTimeout(3000);
  await pg.evaluate(() => { state.children=[{name:'T',avatar:'bee',coins:900,pow:{},age:9,
    lists:{default:{xp:30}},activeList:'default',missed:[],unlockedThemes:['spellbound'],
    unlockedConcepts:{},unlockedLists:{},questPath:'journey'}];
    state.parentPin=state.parentPin||'2468'; state.activeIdx=0; state.screen='app'; app.setNav('settings'); app.setGrownOpen(); for (const k of state.parentPin) app.pinKey(k); });
  await pg.waitForTimeout(700);

  const r = await pg.evaluate(() => {
    const outs = [...document.querySelectorAll('[data-act="signOut"],[data-act="doSignOut"]')];
    return { n: outs.length, labels: outs.map(e => e.textContent.trim()),
      txt: document.body.innerText,
      ow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2 };
  });
  // exactly one, and it says Sign out
  if (r.n !== 1) errs.push(r.n + ' sign-out controls in Settings (want exactly 1): ' + JSON.stringify(r.labels));
  if (!r.labels.some(l => /^Sign out$/i.test(l))) errs.push('the control reads ' + JSON.stringify(r.labels) + ', not "Sign out"');
  if (/Exit to the start screen/i.test(r.txt)) errs.push('"Exit to the start screen" survived');
  if (r.ow) errs.push('H-OVERFLOW on Settings');

  // signed OUT: it still exists, and it returns to the welcome screen
  await pg.evaluate(() => { document.querySelector('[data-act="signOut"]').click(); });
  await pg.waitForTimeout(600);
  if (await pg.evaluate(() => state.screen) !== 'landing') errs.push('Sign out did not return to the welcome screen');

  // signed IN: the same one button also signs the account out
  const signedIn = await pg.evaluate(async () => {
    if (!window.SB_AUTH || !SB_AUTH.signUp) return 'no auth scaffold';
    try { SB_AUTH.signUp('parent@example.com', 'pw123456', 'Parent'); } catch (e) {}
    if (!SB_AUTH.current()) { try { SB_AUTH.signIn('parent@example.com','pw123456'); } catch(e){} }
    if (!SB_AUTH.current()) return 'could not sign in';
    state.screen='app'; app.setNav('settings'); app.setGrownOpen(); for (const k of state.parentPin) app.pinKey(k);
    await new Promise(r => setTimeout(r, 400));
    const n = document.querySelectorAll('[data-act="signOut"],[data-act="doSignOut"]').length;
    document.querySelector('[data-act="signOut"]').click();
    await new Promise(r => setTimeout(r, 400));
    return { n, stillIn: !!SB_AUTH.current(), screen: state.screen };
  });
  if (typeof signedIn === 'string') errs.push('signed-in check skipped: ' + signedIn);
  else {
    if (signedIn.n !== 1) errs.push('signed in, Settings shows ' + signedIn.n + ' sign-out controls (want 1)');
    if (signedIn.stillIn) errs.push('Sign out left the parent account signed in');
    if (signedIn.screen !== 'landing') errs.push('signed-in Sign out landed on screen=' + signedIn.screen);
  }
  // and it is the LAST row of the hamburger
  const drawer = await pg.evaluate(async () => {
    state.screen='app'; state.children=[{name:'T',avatar:'bee',coins:9,pow:{},age:9,
      lists:{default:{xp:1}},activeList:'default',missed:[],unlockedThemes:['spellbound'],
      unlockedConcepts:{},unlockedLists:{},questPath:'journey'}];
    state.activeIdx=0; app.setNav('home'); state.drawerOpen=true; render();
    await new Promise(r => setTimeout(r, 400));
    const nav = document.querySelector('aside nav'); if (!nav) return 'no drawer';
    const btns = [...nav.querySelectorAll('button, a')];
    const last = btns[btns.length - 1];
    return { hasOut: !!nav.querySelector('[data-act="signOut"]'),
             isLast: last && /Back to the Hive/.test(last.textContent),
             label: last ? last.textContent.trim().split('\n')[0] : null };
  });
  if (typeof drawer === 'string') errs.push('drawer: ' + drawer);
  else {
    if (drawer.hasOut) errs.push('Sign out is in the hamburger — it belongs behind the PIN');
    if (!drawer.isLast) errs.push('the hamburger does not end on "Back to the Hive" (last is "' + drawer.label + '")');
  }
  await b.close();
  console.log(errs.length ? 'FAIL\n' + errs.join('\n') : 'PASS — one "Sign out", behind the PIN in Settings → Grown-ups, and it really signs out; ☰ ends on Back to the Hive');
  process.exit(errs.length ? 1 : 0);
})();
