/* PRIVACY BY CONSTRUCTION (FIX-BEE N5, family standard §15) — every request the app makes
   goes to a host privacy.html names, and none of them carries the child.

   privacy.html promises no analytics, no trackers, no advertising, and nothing sent anywhere
   unless a parent switches cloud backup on. That is a claim about the CODE, so it is held
   here by watching the network rather than by reading the policy:

   · The app is served as a HOSTED build would be (an http origin that is not localhost, so
     voice-cdn.js streams word clips from raw.githubusercontent exactly as on Pages), then
     walked: the opening page, a returning speller's Home, the Atlas, Practice with a word
     played, the Library, the book reader, the Arcade, Settings, the parent zone.
   · Every request is recorded and none leaves the machine (route() answers them all
     locally). A host not on NAMED fails the test — add a host here only after privacy.html
     names it, with a new effective date.
   · No request URL or body carries the child's name, and the saved profile holds only what
     the brief allows: a first name, an age band (+ its midpoint), an avatar — no birthday,
     email, photo, phone or location field.
   · index.html loads no external script and names no tracker.
   Run: node tests/privacy-requests.cjs                                                    */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const { serve } = require('./lib/serve.cjs');
const SRC = process.env.SRC || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };

/* The named exceptions — each one is disclosed in privacy.html §5/§6. */
const NAMED = {
  'raw.githubusercontent.com': 'word audio clips (GitHub, privacy.html §6)',
  'aayuvis.github.io': 'the printed books\' cover art, on the books site (GitHub Pages, privacy.html §6)',
};
const HOST = 'bee.test';            // a hosted origin (not localhost) mapped to the local server
const NAME = 'Zephyrine';           // a name no app string contains, so any hit is the child's

const seed = { theme: 'spellbound', mode: 'light', premium: false, activeIdx: 0, pin: '1234',
  children: [{ name: NAME, age: 9, ageBand: '8-10', avatar: 'bizzy', theme: 'spellbound', coins: 50, xp: 40, level: 3,
    lists: { default: { xp: 30 } }, activeList: 'default', missed: [], unlockedThemes: ['spellbound'] }] };

(async () => {
  const html = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
  const ext = [...html.matchAll(/<script[^>]+src=["'](https?:)?\/\/[^"']+/gi)].map(m => m[0]);
  ok(!ext.length, 'index.html loads no external script' + (ext.length ? ' — ' + ext.join(', ') : ''));
  const trackers = html.match(/google-analytics|googletagmanager|gtag\(|fbq\(|facebook\.net|hotjar|mixpanel|segment\.com|amplitude|sentry|clarity\.ms|doubleclick/gi);
  ok(!trackers, 'index.html names no analytics or tracker' + (trackers ? ' — ' + [...new Set(trackers)].join(', ') : ''));

  const srv = await serve(SRC);
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => require('fs').existsSync(p)),
    args: [`--host-resolver-rules=MAP ${HOST} 127.0.0.1`] });
  const ORIGIN = `http://${HOST}:${srv.port}`;
  const seen = [];          // {host, url, step, post}
  let step = 'boot';
  const watch = async ctx => {
    await ctx.route('**/*', async route => {
      const r = route.request(); const u = new URL(r.url());
      if (/^(data|blob|chrome-extension):/.test(r.url())) return route.continue();
      seen.push({ host: u.host, url: r.url(), step, post: r.postData() || '' });
      if (u.origin === ORIGIN) return route.continue();
      // nothing leaves the machine: a clip answers 404 (the app falls back to device speech)
      return route.fulfill({ status: 404, body: '' });
    });
  };
  const errs = [];

  /* 1. a new visitor: the opening page */
  let ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  await watch(ctx);
  let pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
  step = 'new visitor';
  await pg.goto(ORIGIN + '/index.html'); await pg.waitForTimeout(4500);
  await ctx.close();

  /* 2. a returning speller, walked through the app */
  ctx = await b.newContext({ viewport: { width: 1180, height: 900 }, serviceWorkers: 'block' });
  await watch(ctx);
  await ctx.addInitScript(s => { try { if (!localStorage.getItem('sb_t_seeded')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_t_seeded', '1'); } } catch (e) {} }, seed);
  pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
  step = 'home';
  await pg.goto(ORIGIN + '/index.html'); await pg.waitForTimeout(4000);
  await pg.evaluate(() => { state.screen = 'app'; app.setNav('home'); });
  const tour = [
    ['atlas', () => app.setNav('trail')],
    ['practice', () => app.setNav('coach')],
    ['a word played', () => { try { app.startTrain(); } catch (e) {} SB_LAZY.need('audio', () => { try { say('necessary'); } catch (e) {} }); }],
    ['library', () => app.setNav('explore')],
    ['book reader', () => { try { app.openBook('book-01'); } catch (e) {} }],
    ['arcade', () => app.setNav('games')],
    ['settings', () => { state.pinDlg = null; app.openSettings ? app.openSettings() : app.setNav('settings'); }],
    ['parent zone', () => { state.progTab = 'parent'; state.nav = 'progress'; render(); }],
    ['home again', () => app.setNav('home')],
  ];
  for (const [name, fn] of tour) {
    step = name;
    await pg.evaluate(`(${fn.toString()})()`).catch(e => errs.push(name + ': ' + e.message));
    await pg.waitForTimeout(2200);
  }
  step = 'idle';
  await pg.mouse.click(5, 5).catch(() => {});
  await pg.waitForTimeout(3000);
  const saved = await pg.evaluate(() => { try { return JSON.parse(localStorage.getItem('sb_saas_v2') || '{}'); } catch (e) { return {}; } });
  await ctx.close(); await b.close(); await srv.close();

  /* ---- the verdicts ---- */
  const hosts = {};
  seen.forEach(r => { const k = r.host.split(':')[0] === HOST ? 'first party' : r.host; (hosts[k] = hosts[k] || new Set()).add(r.step); });
  console.log('\n  hosts contacted:');
  Object.entries(hosts).forEach(([h, s]) => console.log('    ' + h.padEnd(28) + [...s].join(', ')));
  const strangers = Object.keys(hosts).filter(h => h !== 'first party' && !NAMED[h]);
  ok(!strangers.length, 'every request goes to the app\'s own origin or a host privacy.html names' + (strangers.length ? ' — UNNAMED: ' + strangers.join(', ') : ''));
  ok(seen.filter(r => r.host.split(':')[0] === HOST).length > 20, 'the walk actually loaded the app (' + seen.length + ' requests recorded)');
  const policy = fs.readFileSync(path.join(SRC, 'privacy.html'), 'utf8');
  for (const h of Object.keys(NAMED)) ok(policy.includes(h), `privacy.html names ${h} — ${NAMED[h]}` + (hosts[h] ? ' (contacted on this walk)' : ''));
  const carries = seen.filter(r => (decodeURIComponent(r.url) + r.post).toLowerCase().includes(NAME.toLowerCase()));
  ok(!carries.length, 'no request carries the child\'s name' + (carries.length ? ' — ' + carries.map(r => r.url).slice(0, 3).join(', ') : ''));
  const posts = seen.filter(r => r.post && r.host.split(':')[0] !== HOST);
  ok(!posts.length, 'nothing is POSTed anywhere' + (posts.length ? ' — ' + posts.map(r => r.url).join(', ') : ''));
  const kid = (saved.children || [])[0] || {};
  const BANNED = /^(email|e-?mail|dob|birth|birthday|birthdate|photo|picture|phone|tel|location|address|lat|lng|geo|surname|lastName|school)$/i;
  const bad = Object.keys(kid).filter(k => BANNED.test(k));
  ok(kid.name === NAME && !bad.length, 'the saved profile holds no birthday, email, photo, phone or location field' + (bad.length ? ' — ' + bad.join(', ') : ''));
  ok(!errs.length, 'no page errors on the walk' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
  console.log(fails ? `\n${fails} FAILED` : '\nprivacy holds: own origin + named hosts only');
  process.exit(fails ? 1 : 0);
})();
