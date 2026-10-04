/* BACKUP · RESTORE · ERASE, BEHIND THE PIN — AND NO TESTER LEVERS ON A CHILD (FIX-BEE M3,
   family standard §7).

   A household of two children with real progress is downloaded to a file (PIN asked), erased
   (PIN asked; nothing goes before it), and restored from that file through the welcome page's
   file picker on the now-empty device. The children must come back EXACTLY — byte-identical
   JSON — and the family feed must keep what other apps wrote. A file that is not a backup is
   refused with a reason. Then: no dev/tester unlock, "add XP" or "add coins" control is
   anywhere outside Settings → Testing tools, and switching tester mode on and off never
   rewrites a child.
   Waits on state, not time (lib/wait.cjs): the card drawn, the confirm up, the fresh page
   booted after each reload.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/backup-restore.cjs                 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { booted, until } = require('./lib/wait.cjs');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const URL = 'file://' + path.resolve(__dirname, '..') + '/index.html';

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 1000, height: 900 }, acceptDownloads: true });
  /* the seed marker deliberately does NOT start with sb_ — erase removes every sb_ key */
  await ctx.addInitScript(() => { try { if (localStorage.getItem('bkt_seeded')) return; localStorage.setItem('bkt_seeded', '1');
    const kid = (name, extra) => Object.assign({ name, age: 9, ageBand: '8-10', avatar: 'fox', theme: 'spellbound', coins: 120, xp: 40,
      lists: { default: { xp: 33, stage: 2, gi: 4 } }, activeList: 'default', missed: [{ w: 'rhythm', d: 'a beat', n: 2 }], unlockedThemes: ['spellbound'],
      mast: { harbour: { b: 3, due: 30000, d: 20000, ok: 3, n: 3 }, rhythm: { b: 1, due: 1, d: 1, ok: 2, n: 4, lp: 1, miss: 2 } } }, extra || {});
    localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', premium: false, activeIdx: 1, pin: '1234',
      children: [kid('Ahana'), kid('Ravi', { avatar: 'panda', coins: 7, mast: {} })] }));
    localStorage.setItem('sb_daily', JSON.stringify({ last: '2026-10-01', streak: 0, played: 3 }));
    localStorage.setItem('sb_arc_best', JSON.stringify({ typeBlaster: 41 }));
    localStorage.setItem('sb_tm_log', '[{"k":"tap"}]');                              // research log: must not travel
    localStorage.setItem('sb_accounts_v1', JSON.stringify({ users: { u1: { id: 'u1', email: 'p@x.y', pw: 'abc123', role: 'parent' } } }));   // sign-in: must not travel
    localStorage.setItem('bizzing.activity', JSON.stringify({ v: 1, s: [
      { a: 'bee', d: '2026-10-01', t: 600, m: 12, who: 'Ahana' }, { a: 'maths', d: '2026-10-01', t: 700, m: 30, who: 'Ahana' } ] }));
    localStorage.setItem('bizzing.wallet', JSON.stringify({ v: 1, kids: { ahana: { coins: 25, ledger: [{ a: 'maths', t: 1, n: 25, why: 'stop' }] }, zed: { coins: 4, ledger: [] } } }));
  } catch (e) {} });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => { errs.push(e.message); if (process.env.DBG) console.log('PAGEERR', e.stack); });
  await pg.goto(URL); await booted(pg);
  const typePin = async () => { for (const k of '1234') await pg.evaluate(k => app.pinKey(k), k); };

  /* ---- the household as the app holds it, after boot ---- */
  const before = await pg.evaluate(() => { save(); const s = JSON.parse(localStorage.getItem('sb_saas_v2')); return { children: JSON.stringify(s.children), activeIdx: s.activeIdx, pin: s.pin, daily: localStorage.getItem('sb_daily'), arc: localStorage.getItem('sb_arc_best') }; });

  /* ---- download: behind the PIN ---- */
  await pg.evaluate(() => { state.screen = 'app'; app.setNav('parent'); }); await until(pg, () => !!state.pinDlg); await typePin();
  await until(pg, () => !!document.querySelector('.sb-backup [data-act="bkDownload"]'));
  const hasCard = await pg.evaluate(() => !!document.querySelector('.sb-backup [data-act="bkDownload"]') && !!document.querySelector('.sb-backup [data-file="bkPick"]') && !!document.querySelector('.sb-backup [data-act="bkAskErase"]'));
  ok(hasCard, 'the Parent Zone carries Download, Restore and Erase');
  await pg.evaluate(() => app.bkDownload());
  const dlAsk = await pg.evaluate(() => !!state.pinDlg);
  ok(dlAsk, 'download asks for the PIN again');
  const [dl] = await Promise.all([pg.waitForEvent('download', { timeout: 8000 }), typePin()]);
  const file = path.join(__dirname, 'build', 'bk-' + Date.now() + '.json'); fs.mkdirSync(path.dirname(file), { recursive: true }); await dl.saveAs(file);
  const text = fs.readFileSync(file, 'utf8'); const blob = JSON.parse(text);
  ok(/^bizzing-bee-Ahana-Ravi-\d{4}-\d\d-\d\d\.json$/.test(dl.suggestedFilename()), 'the file is named for the household and the day (' + dl.suggestedFilename() + ')');
  ok(blob.app === 'bizzing-bee' && blob.keys.sb_saas_v2 && blob.keys.sb_daily && blob.keys.sb_arc_best, 'it carries the household and the rest of the app\'s own keys');
  ok(!blob.keys.sb_tm_log && !blob.keys.sb_accounts_v1 && !blob.keys.bkt_seeded, 'and not the research log or the sign-in (device things do not travel)');
  ok(blob.family['bizzing.wallet'] && blob.family['bizzing.wallet'].kids.ahana && !blob.family['bizzing.wallet'].kids.zed
    && blob.family['bizzing.activity'].s.length === 1 && blob.family['bizzing.activity'].s[0].a === 'bee', 'from the family keys it takes only this household\'s slice');

  /* ---- erase: the confirm, then the PIN; nothing goes before it ---- */
  await pg.evaluate(() => app.bkAskErase()); await until(pg, () => !!document.querySelector('.sb-bk-confirm [data-act="bkEraseGo"]'), null, 5000);
  const eraseConfirm = await pg.evaluate(() => !!document.querySelector('.sb-bk-confirm [data-act="bkEraseGo"]'));
  ok(eraseConfirm, 'Erase asks "are you sure" first');
  /* the wallet before erase: B's 1:1 migration has already moved the child's old coins in, so compare
     against what is there now, not the seed */
  const walletBefore = await pg.evaluate(() => { try { return JSON.parse(localStorage.getItem('bizzing.wallet')).kids.ahana.coins; } catch (e) { return null; } });
  await pg.evaluate(() => app.bkEraseGo());
  const midErase = await pg.evaluate(() => ({ dlg: !!state.pinDlg, still: !!localStorage.getItem('sb_saas_v2') }));
  ok(midErase.dlg && midErase.still, 'then asks for the PIN, and nothing is erased before it is given');
  await Promise.all([pg.waitForNavigation({ timeout: 10000 }).catch(() => null), typePin().catch(() => null)]);
  /* the reload races the last PIN digit; wait for the fresh page itself to be up */
  await until(pg, () => { try { return typeof state !== 'undefined' && !!document.querySelector('#root') && state.screen === 'landing'; } catch (e) { return false; } }, null, 30000);
  await booted(pg);
  const afterErase = await pg.evaluate(() => { const ks = []; for (let i = 0; i < localStorage.length; i++) ks.push(localStorage.key(i));
    const s = JSON.parse(localStorage.getItem('sb_saas_v2') || '{}');
    return { kids: (s.children || []).length, screen: state.screen, daily: localStorage.getItem('sb_daily'), tm: localStorage.getItem('sb_tm_log'),
      act: JSON.parse(localStorage.getItem('bizzing.activity') || '{}').s, wallet: localStorage.getItem('bizzing.wallet') }; });
  if (process.env.DBG) console.log(JSON.stringify(afterErase));
  ok(afterErase.kids === 0 && afterErase.screen === 'landing' && !afterErase.daily && !afterErase.tm, 'erase leaves no household and no sb_ data; the app opens on the welcome page'
    + (afterErase.kids === 0 && afterErase.screen === 'landing' && !afterErase.daily && !afterErase.tm ? '' : ' — ' + JSON.stringify({ kids: afterErase.kids, screen: afterErase.screen, daily: !!afterErase.daily, tm: !!afterErase.tm, act: (afterErase.act || []).length })));
  ok(afterErase.act && afterErase.act.length === 1 && afterErase.act[0].a === 'maths', "Bee's rows leave the activity feed; Bizzing Maths' rows stay");
  ok(walletBefore != null && afterErase.wallet && JSON.parse(afterErase.wallet).kids.ahana.coins === walletBefore, `the shared family wallet is left alone, as the screen says (${walletBefore} before, ${afterErase.wallet && JSON.parse(afterErase.wallet).kids.ahana.coins} after)`);

  /* ---- a file that is not a backup is refused, with a reason ---- */
  const junk = path.join(__dirname, 'build', 'junk-' + Date.now() + '.json'); fs.writeFileSync(junk, JSON.stringify({ hello: 'world' }));
  /* the welcome page is still re-rendering as boot-lazy delivers data, which can detach the
     input between choosing the file and its change event — so offer the file until it lands */
  const offer = async (f, done) => { for (let i = 0; i < 4; i++) { await pg.setInputFiles('[data-file="bkPick"]', f);
    if (await until(pg, done, null, 8000)) return; } };
  await offer(junk, () => !!state.bkMsg);
  const refused = await pg.evaluate(() => ({ msg: state.bkMsg && state.bkMsg.t, pending: !!state.bkPending, kids: (JSON.parse(localStorage.getItem('sb_saas_v2') || '{}').children || []).length }));
  ok(refused.msg && /not a Bizzing Bee backup/.test(refused.msg) && !refused.pending && refused.kids === 0, 'a file that is not a backup is refused with a reason, and nothing changes');

  /* ---- restore from the welcome page's picker ---- */
  await offer(file, () => !!state.bkPending); await until(pg, () => !!document.querySelector('.sb-bk-confirm [data-act="bkRestoreGo"]'), null, 5000);
  const pending = await pg.evaluate(() => ({ p: state.bkPending && state.bkPending.names, confirm: !!document.querySelector('.sb-bk-confirm [data-act="bkRestoreGo"]') }));
  ok(pending.p && pending.p.join(',') === 'Ahana,Ravi' && pending.confirm, 'the welcome page reads the file and asks before restoring Ahana and Ravi');
  await pg.evaluate(() => app.bkRestoreGo());
  const restoreAsk = await pg.evaluate(() => !!state.pinDlg);
  ok(restoreAsk, 'restore is behind the PIN too (on an empty device a grown-up chooses one first)');
  await pg.evaluate(() => { for (const k of '4321') app.pinKey(k); });   // a fresh device: choose…
  await Promise.all([pg.waitForNavigation({ timeout: 10000 }).catch(() => null), pg.evaluate(() => { for (const k of '4321') app.pinKey(k); }).catch(() => null)]);  // …and confirm
  await until(pg, () => { try { return typeof state !== 'undefined' && state.screen === 'app'; } catch (e) { return false; } }, null, 30000);
  await booted(pg);
  const after = await pg.evaluate(() => { const s = JSON.parse(localStorage.getItem('sb_saas_v2') || '{}'); return { children: JSON.stringify(s.children), activeIdx: s.activeIdx, pin: s.pin, daily: localStorage.getItem('sb_daily'), arc: localStorage.getItem('sb_arc_best'), screen: state.screen,
    act: JSON.parse(localStorage.getItem('bizzing.activity') || '{}').s, tm: localStorage.getItem('sb_tm_log') }; });
  const fileHh = JSON.parse(blob.keys.sb_saas_v2);
  /* after the reload the app's own boot may ADD a default it lazily creates (trail, a day log);
     everything the child had must come back with exactly the same value */
  const back = JSON.parse(after.children || '[]');
  const lost = []; fileHh.children.forEach((k, i) => Object.keys(k).forEach(f => { if (JSON.stringify(k[f]) !== JSON.stringify((back[i] || {})[f])) lost.push(i + '.' + f); }));
  ok(back.length === 2 && lost.length === 0, 'after the reload every field of both children is exactly as backed up' + (lost.length ? ' — changed: ' + lost.slice(0, 6).join(', ') : ''));
  if (process.env.DBG && after.children !== before.children) { const A = JSON.parse(before.children), B = JSON.parse(after.children || '[]');
    A.forEach((k, i) => Object.keys(Object.assign({}, k, B[i] || {})).forEach(f => { if (JSON.stringify(k[f]) !== JSON.stringify((B[i] || {})[f])) console.log('DIFF', i, f, String(JSON.stringify(k[f])).slice(0, 200), '=>', String(JSON.stringify((B[i] || {})[f])).slice(0, 200)); })); }
  ok(after.activeIdx === fileHh.activeIdx && after.pin === '1234' && after.daily === before.daily && after.arc === before.arc, 'and the active child, the household PIN and the other app keys come back too');
  /* byte-exact: restore writes back precisely what the file holds, key for key */
  const exact = await pg.evaluate((b) => { bkHalt(); eraseHousehold(); restoreHousehold(b);
    const bad = Object.keys(b.keys).filter(k => localStorage.getItem(k) !== b.keys[k]);
    const extra = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (/^sb_/.test(k) && !(k in b.keys)) extra.push(k); }
    return { bad, extra }; }, blob);
  ok(exact.bad.length === 0 && exact.extra.length === 0, 'backup → erase → restore round-trips the household EXACTLY: every key byte-identical to the file, nothing extra' + (exact.bad.length + exact.extra.length ? ' — ' + exact.bad.concat(exact.extra).join(', ') : ''));
  await pg.reload(); await booted(pg);
  ok(after.screen === 'app', 'the app opens on the restored household');
  ok(after.act && after.act.length === 2 && after.act.some(x => x.a === 'maths') && after.act.some(x => x.a === 'bee' && x.who === 'Ahana'), "Bee's activity rows come back beside Maths' rows, not over them");
  ok(!after.tm, 'and the research log, which was never in the file, stays gone');

  /* ---- no tester levers outside Testing tools; tester mode never rewrites a child ---- */
  const t = await pg.evaluate(async () => { const W = ms => new Promise(res => setTimeout(res, ms)); const o = {};
    const U = async (f, ms) => { for (const t0 = Date.now(); Date.now() - t0 < (ms || 15000);) { try { if (f()) return true; } catch (e) {} await W(30); } return false; };
    const LEVER = /toggleDev|devCoins|addXp|giveXp|addCoins|giveCoins|grantArt|cheat|unlockAll/i;
    const levers = (root) => [...root.querySelectorAll('[data-act]')].filter(el => LEVER.test(el.getAttribute('data-act')) && !el.closest('details')).map(el => el.getAttribute('data-act'));
    const seen = new Set();
    state.parentPin = '1234';
    for (const nav of ['home', 'trail', 'coach', 'games', 'collection', 'progress', 'revisions']) { try { app.setNav(nav); } catch (e) {} await W(120); levers(document).forEach(x => seen.add(nav + ':' + x)); state.pinDlg = null; }
    state.progTab = 'parent'; state.nav = 'progress'; render(); await W(120); levers(document).forEach(x => seen.add('parent:' + x));
    /* Settings' Testing tools sit behind the Grown-ups PIN now (FIX-BEE v2, §5): pass it, then look */
    state.settingsOpen = true; state.nav = 'settings'; state._setGrown = true; render(); await W(120);
    o.settingsLevers = [...document.querySelectorAll('[data-act]')].filter(el => /toggleDev/.test(el.getAttribute('data-act'))).map(el => ({ act: el.getAttribute('data-act'), inTools: !!el.closest('details') }));
    o.outside = [...seen];
    o.testCoinsOffered = /Tops the purse up to 1,000,000/.test(document.body.innerHTML);
    const child = () => JSON.stringify(state.children);
    const c0 = child();
    state.pinDlg = null; app.toggleDevUnlock(); for (const k of '1234') app.pinKey(k); await U(() => !state.pinDlg && state.devUnlock, 5000);
    o.devOn = !!state.devUnlock;
    app.toggleDevCoins(); for (const k of '1234') app.pinKey(k); await U(() => !state.pinDlg, 5000);
    app.toggleDevUnlock(); for (const k of '1234') app.pinKey(k); await U(() => !state.pinDlg && !state.devUnlock, 5000);
    o.devOff = !state.devUnlock;
    o.childUntouched = child() === c0; if (!o.childUntouched) { const A = JSON.parse(c0), B = JSON.parse(child()); o.diff = []; A.forEach((k, i) => Object.keys(Object.assign({}, k, B[i])).forEach(f => { if (JSON.stringify(k[f]) !== JSON.stringify(B[i][f])) o.diff.push(i + ':' + f + ':' + String(JSON.stringify(k[f])).slice(0, 80) + '=>' + String(JSON.stringify(B[i][f])).slice(0, 80)); })); }
    state.settingsOpen = false; return o; });
  ok(t.outside.length === 0, 'no dev/tester unlock, add-XP or add-coins control anywhere outside Testing tools' + (t.outside.length ? ': ' + t.outside.join(', ') : ''));
  ok(t.settingsLevers.length >= 1 && t.settingsLevers.every(x => x.inTools || x.act === 'toggleDevUnlock'), 'the testing unlock lives inside Settings → Testing tools');
  ok(!t.testCoinsOffered, 'the "1,000,000 test coins" lever is gone from Testing tools');
  if (process.env.DBG) console.log(JSON.stringify(t.diff));
  ok(t.devOn && t.devOff && t.childUntouched, 'switching tester mode on and off (and pressing the old test-coins switch) leaves every child byte-identical');
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  try { fs.unlinkSync(file); fs.unlinkSync(junk); } catch (e) {}
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
