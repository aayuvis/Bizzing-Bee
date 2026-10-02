/* THE STORE SEAM (FIX-BEE N4, Oct 2026).

   Every byte Bizzing Bee keeps goes through store.js: one versioned household blob, named
   device keys, the shared family keys. This fails if:
   1. any shipped file other than store.js names localStorage — the only exceptions are the two
      PARSE-TIME inline scripts in index.html (the splash's read-only peek and the ?demo sandbox
      that replaces the storage object itself), and store.js must be the first deferred script;
   2. a household from before the seam does not run every step, in order, exactly once — the
      refunds that used to be ad-hoc blocks in init must still pay once and only once;
   3. a household written by a NEWER build is ever written over (an old tab must not downgrade
      a family), or a newer backup is restored;
   4. an unregistered key gets through.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/store-seam.cjs                       */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };

/* ---- 1. nothing reaches around the seam ---- */
const stray = fs.readdirSync(ROOT).filter(f => /\.js$/.test(f) && f !== 'store.js')
  .filter(f => /\blocalStorage\b/.test(fs.readFileSync(path.join(ROOT, f), 'utf8')));
ok(stray.length === 0, 'no shipped file but store.js names localStorage' + (stray.length ? ': ' + stray.join(', ') : ''));
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).filter(t => /\blocalStorage\b/.test(t));
/* the sandbox and the splash share one inline script at the top of <body>: it is the only one */
const both = inline.length === 1 && /defineProperty\(window,\s*'localStorage'/.test(inline[0]) && /getItem\('sb_splash'\)/.test(inline[0]);
ok(both, `index.html touches storage only in the one parse-time script that holds the ?demo sandbox and the splash's peek (${inline.length} inline scripts name it)`);
ok(inline.every(t => !/localStorage\.(setItem|removeItem|clear)\s*\(/.test(t)), "and it only reads — nothing at parse time writes around the seam");
const firstDefer = (html.match(/<script defer src="([^"?]+)/) || [])[1];
ok(firstDefer === 'store.js', 'store.js is the first deferred script (' + firstDefer + ')');

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || (fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined) });
  const URL = 'file://' + ROOT + '/index.html';
  const errs = [];
  const boot = async (blob, extra) => {
    const ctx = await b.newContext({ viewport: { width: 1000, height: 800 } });
    await ctx.addInitScript(([s, x]) => { try { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', typeof s === 'string' ? s : JSON.stringify(s)); localStorage.setItem('sb_splash', '0'); if (x) Object.keys(x).forEach(k => localStorage.setItem(k, x[k])); localStorage.setItem('t_seed', '1'); } } catch (e) {} }, [blob, extra || null]);
    const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(URL); await pg.waitForTimeout(2800); return { ctx, pg };
  };

  /* ---- 2. a household from before the seam: every step once, in order ---- */
  const legacy = { theme: 'origami', mode: 'light', pin: '1234', activeIdx: 0, cN: 121, lu: { cat: true, dog: true },
    children: [{ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'bizzy', theme: 'origami', coins: 30,
      unlockedThemes: ['spellbound', 'aurora', 'origami'], beeAcc: { crown: 1 }, lists: { default: { xp: 5 } }, activeList: 'default' }] };
  { const { ctx, pg } = await boot(legacy);
    const r = await pg.evaluate(() => { const raw = JSON.parse(localStorage.getItem('sb_saas_v2')); const c = state.children[0];
      return { ran: SB_STORE.migrated(), sv: raw.sv, schema: SB_STORE.SCHEMA, wallet: BZ_WALLET.balance('Ahana'), themes: c.unlockedThemes, theme: c.theme, top: state.theme,
        mast: Object.keys(c.mast || {}).sort().join(','), acc: !!c.beeAcc }; });
    const want = []; for (let v = 1; v < r.schema; v++) want.push('v' + v + '_to_v' + (v + 1));
    ok(JSON.stringify(r.ran) === JSON.stringify(want), 'an old household runs every step, in order: ' + r.ran.join(' → '));
    ok(r.sv === r.schema, `and is saved at the current schema (sv ${r.sv})`);
    ok(r.wallet === 30 + 120 + 400 + 400 && r.themes.join() === 'spellbound' && r.theme === 'spellbound' && r.top === 'spellbound' && !r.acc,
      `the refunds that used to be ad-hoc init blocks still pay — crown 120 + origami 400 + aurora 400 + 30 = ${r.wallet} 🪙, and a removed world moves to the Hive`);
    ok(r.mast === 'cat,dog', 'the shared mastery map is carried onto the child once (' + r.mast + ')');
    await pg.reload(); await pg.waitForTimeout(2600);
    const r2 = await pg.evaluate(() => ({ ran: SB_STORE.migrated(), wallet: BZ_WALLET.balance('Ahana') }));
    ok(r2.ran.length === 0 && r2.wallet === r.wallet, `a second boot runs nothing and pays nothing (${r2.ran.length} steps, ${r2.wallet} 🪙)`);
    await ctx.close(); }

  /* ---- 3. a household from a NEWER build is never written over ---- */
  { const newer = { sv: 999, theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, futureField: { keep: 'me' },
      children: [{ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'bizzy', theme: 'spellbound', coins: 5, lists: { default: { xp: 5 } }, activeList: 'default', mast: {} }] };
    const raw0 = JSON.stringify(newer);
    const { ctx, pg } = await boot(raw0);
    const r = await pg.evaluate(() => { const ro = SB_STORE.readOnly(); try { state.theme = 'aurora'; save(); app.setNav('home'); } catch (e) {}
      return { ro, raw: localStorage.getItem('sb_saas_v2'), toast: document.body.textContent };
    });
    await pg.waitForTimeout(1600);
    const said = await pg.evaluate(() => { const el = document.querySelector('.sb-ro'); return !!el && /newer version/.test(el.textContent); });
    ok(r.ro && r.raw === raw0, 'a household saved by a newer build is opened read-only and stays byte-identical after a save()');
    ok(said, 'and a banner that stays says why nothing is being saved');
    const refused = await pg.evaluate(() => { const blob = { app: 'bizzing-bee', kind: 'household-backup', v: 1, at: 1, keys: { sb_saas_v2: JSON.stringify({ sv: 999, children: [{ name: 'X' }] }) }, family: {} };
      return backupParse(JSON.stringify(blob)); });
    ok(refused && !refused.ok && /newer/.test(refused.why), 'a backup made by a newer build is refused, with the reason');
    await ctx.close(); }

  /* ---- 4. names are a registry, not a free-for-all ---- */
  { const { ctx, pg } = await boot({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [] });
    const r = await pg.evaluate(() => { const t = f => { try { f(); return false; } catch (e) { return true; } };
      const before = SB_STORE.get('splash'); app.toggleSplash(); const after = localStorage.getItem('sb_splash');
      return { name: t(() => SB_STORE.get('someNewThing')), key: t(() => SB_STORE.getKey('another.app')), own: !t(() => SB_STORE.getKey('sb_legacy_thing')),
        fam: !t(() => SB_STORE.getKey('bizzing.wallet')), flip: before !== after }; });
    ok(r.name && r.key, 'an unregistered name, or a key that is not Bizzing Bee’s, throws');
    ok(r.own && r.fam, "Bee's own sb_ keys (backup and erase reach old ones) and the family keys are reachable");
    ok(r.flip, 'device switches round-trip through the seam (the splash toggle)');
    await ctx.close(); }

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
