/* reload-seal.cjs — an erase or a restore reloads with a SEAL (store.js "the reload seal", 13 Oct 2026).

   Why: P3's full run caught Chromium starting the page an erase reloads into on storage from BEFORE the erase —
   the old household back on screen, and its first save would have written it over the erase (backup-restore,
   "erase leaves no household"). The reload now carries its intent: the seal is written last, the address says
   ?bk=<seal>, and a document that cannot see that seal yet writes nothing and reloads again.

   1. A STALE arrival (?bk= with no seal in storage, which is what a lagging browser hands the page): the page
      holds — no write reaches storage while it does — reloads again (?bkt= counts), and after SEAL_TRIES gives
      up, takes both out of the address, and the household is untouched.
   2. A SEALED arrival: one document, the seal deleted, ?bk= gone from the address, the hash route kept.
   3. The real door: Erase everything (Parent Zone, PIN) reloads through ?bk=, lands on the welcome page with no
      household, and leaves no seal behind.
   Every document records itself in window.name (it survives navigation in a tab): 'D<bkt><b?>' per document,
   'W<op>:<key>' for a write made while SB_STORE.held().

   Proved by breaking (13 Oct 2026, each in a scratch root of symlinks with store.js or app3.js replaced, SEAL_ROOT=…):
     the hold never set (a stale page carries on)            → 1 fails (1 document, it never reloaded)
     rset ignoring HOLD (the stale page writes)               → 1 fails (held writes)
     the seal left in storage after a sealed arrival          → 2 fail (§2 seal, §3 seal)
     erase reloading plainly (location.reload, no seal)       → 1 fails (§3 no ?bk= arrival)
   Run: node tests/reload-seal.cjs                                                                                */
'use strict';
const { chromium } = require('playwright');
const fs = require('fs'), os = require('os'), path = require('path');
const { booted, until } = require('./lib/wait.cjs');
const ROOT = process.env.SEAL_ROOT || path.resolve(__dirname, '..');
const URL0 = 'file://' + ROOT + '/index.html';
let fails = 0; const ok = (c, m) => { console.log((c ? '  OK   ' : '  FAIL ') + m); if (!c) fails++; };

const kid = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'fox', theme: 'spellbound', coins: 12, lists: {}, unlockedThemes: ['spellbound'] };
const SEED = { theme: 'spellbound', mode: 'light', premium: false, activeIdx: 0, pin: '1234', children: [kid] };

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sb-seal-profile-'));
  const ctx = await chromium.launchPersistentContext(dir, { viewport: { width: 1100, height: 900 },
    executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p)) });
  await ctx.addInitScript(s => { try {
    if (!/^seal:/.test(window.name)) window.name = 'seal:';
    const q = new URLSearchParams(location.search);
    window.name += 'D' + (q.get('bkt') || '0') + (q.get('bk') ? 'b' : '') + ';';
    const S = Storage.prototype, set = S.setItem, del = S.removeItem, clr = S.clear;
    const note = (op, k) => { try { if (window.SB_STORE && SB_STORE.held && SB_STORE.held()) window.name += 'W' + op + ':' + k + ';'; } catch (e) {} };
    S.setItem = function (k, v) { note('set', k); return set.call(this, k, v); };
    S.removeItem = function (k) { note('del', k); return del.call(this, k); };
    S.clear = function () { note('clear', '*'); return clr.call(this); };
    if (!localStorage.getItem('t_seal')) { set.call(localStorage, 'sb_saas_v2', JSON.stringify(s)); set.call(localStorage, 'sb_splash', '0'); set.call(localStorage, 't_seal', '1'); }
  } catch (e) {} }, SEED);
  const pg = ctx.pages()[0] || await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  const log = () => pg.evaluate(() => window.name).catch(() => '');
  const settle = async (ms) => { /* the address is clean and the app is up */
    const t0 = Date.now();
    while (Date.now() - t0 < ms) { if (!/[?&]bk/.test(pg.url())) { try { await booted(pg, 15000); if (!/[?&]bk/.test(pg.url())) return true; } catch (e) {} } await pg.waitForTimeout(150); }
    return false; };

  await pg.goto(URL0); await booted(pg);
  const before = await pg.evaluate(() => localStorage.getItem('sb_saas_v2'));

  /* ---- 1. a stale arrival holds and reloads ---- */
  await pg.evaluate(() => { window.name = 'seal:'; });
  await pg.goto(URL0 + '?bk=never-written#/play');
  const done1 = await settle(90000);
  const n1 = await log(), docs1 = (n1.match(/D\d+b?;/g) || []), held1 = (n1.match(/W[^;]+;/g) || []);
  const after1 = await pg.evaluate(() => ({ hh: localStorage.getItem('sb_saas_v2'), seal: localStorage.getItem('sb_bk_seal'), url: location.href }));
  ok(done1 && docs1.length >= 2 && docs1.filter(d => /b;$/.test(d)).length >= 2,
    `a page that arrives with ?bk= and cannot see the seal reloads again (${docs1.length} documents: ${docs1.join('')})`);
  ok(held1.length === 0, 'and writes nothing while it holds' + (held1.length ? ' — ' + held1.slice(0, 5).join('') : ''));
  ok(done1 && !/[?&]bk/.test(after1.url) && /#\/play$/.test(after1.url), `after its last try it takes ?bk= and ?bkt= out of the address and keeps the route (${after1.url.replace(/^.*index\.html/, '')})`);
  ok(after1.seal === null && JSON.parse(after1.hh).children.length === 1 && JSON.parse(after1.hh).children[0].name === JSON.parse(before).children[0].name,
    'the household is the one it was, and no seal is left');

  /* ---- 2. a sealed arrival goes straight through ---- */
  await pg.evaluate(() => { window.name = 'seal:'; localStorage.setItem('sb_bk_seal', 'abc-123'); });
  await pg.goto(URL0 + '?bk=abc-123#/play'); const done2 = await settle(30000);
  const n2 = await log(), docs2 = (n2.match(/D\d+b?;/g) || []);
  const after2 = await pg.evaluate(() => ({ seal: localStorage.getItem('sb_bk_seal'), url: location.href, nav: state.nav }));
  ok(done2 && docs2.length === 1, `a page that sees its seal is one document (${docs2.join('')})`);
  ok(after2.seal === null, 'it deletes the seal');
  ok(!/[?&]bk/.test(after2.url) && /#\/play$/.test(after2.url) && after2.nav === 'games', `and takes ?bk= out of the address before the route is read (${after2.url.replace(/^.*index\.html/, '')}, nav ${after2.nav})`);

  /* ---- 3. the real door: Erase everything ---- */
  await pg.evaluate(() => { window.name = 'seal:'; });
  await pg.goto(URL0); await booted(pg);
  await pg.evaluate(() => new Promise(r => SB_LAZY.need('scrGrown', r)));
  await pg.evaluate(() => { state.screen = 'app'; app.bkEraseGo(); });
  await until(pg, () => !!state.pinDlg, null, 10000);
  for (const k of '1234') { await pg.evaluate(k => app.pinKey(k), k).catch(() => {}); }
  await until(pg, () => false, null, 300).catch(() => {});
  const done3 = await settle(60000);
  await until(pg, () => typeof state !== 'undefined' && state.screen === 'landing', null, 20000);
  const n3 = await log(), docs3 = (n3.match(/D\d+b?;/g) || []);
  const after3 = await pg.evaluate(() => ({ hh: localStorage.getItem('sb_saas_v2'), seal: localStorage.getItem('sb_bk_seal'), url: location.href, screen: state.screen }));
  ok(docs3.some(d => /b;$/.test(d)), `the erase reloads through ?bk= (${docs3.join('')})`);
  const kids3 = after3.hh ? (JSON.parse(after3.hh).children || []).length : 0;
  ok(done3 && after3.screen === 'landing' && kids3 === 0 && !/[?&]bk/.test(after3.url), `and lands on the welcome page with no speller, the address clean (${after3.screen}, ${kids3} spellers, ${after3.url.replace(/^.*index\.html/, '') || '(no query)'})`);
  ok(after3.seal === null, 'and no seal is left behind');

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await ctx.close(); fs.rmSync(dir, { recursive: true, force: true });
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
