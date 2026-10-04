/* THE FAMILY TOP BAR AND THE CHILD SWITCHER (FIX-BEE B7 + O4, family standard §3/§5).

   `[⬡ back to Hive] [App name] ………… [theme] [🔒 grown-ups] [avatar ▾]` — 56px, the same order
   in every Bizzing app, with Bee's own tools (menu, search bar, coins pill) in the middle.
     · the order and the 56px line are measured on a desktop and on two phones, with no
       sideways scroll; the desktop top nav and the phone tab bar are both still there;
     · ⬡ points at the Hive and hides only while a drill word is live;
     · 🔒 asks for the grown-up PIN and then opens the grown-ups area;
     · the avatar opens "Children in this household": one tap switches, no PIN, and the
       switch NEVER MIXES DATA — coins, word lists, the Atlas trail, the avatar and the
       mastered-word book stay with their own child, across switches and a reload. (The
       mastered-word map used to be household-wide, so a second child inherited the first
       one's mastery; it travels with the child now.)
     · Settings and the appearance button keep working from their new places.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/family-topbar.cjs                     */
const { chromium } = require('playwright');
const path = require('path');
const { booted, until, frames } = require('./lib/wait.cjs');
const URL = 'file://' + path.resolve(__dirname, '..') + '/index.html';
const HIVE = 'https://aayuvis.github.io/Bizzing_Schedule/';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const TR = (done) => ({ lap: 1, done, chk: {}, seen: {}, st: {}, elap: 1, edone: {}, echk: {} });
/* mastery is per child on its evidence record (c.mast, FIX-BEE D5): box 2+ = mastered */
const DAY = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
const M2 = (ws) => Object.fromEntries(ws.map(w => [w, { b: 2, due: DAY + 30, d: DAY - 3, ok: 2, n: 2 }]));
const SEED = { theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [
  { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 120, lists: { journey: { xp: 30, stage: 2 } }, activeList: 'journey', trail: TR({ u1: { 1: 90 }, u2: { 1: 85 } }), mast: M2(['cat', 'dog', 'ship']) },
  { name: 'Ravi', age: 12, ageBand: '11-13', avatar: 'froggy', theme: 'aurora', coins: 7, lists: { journey: { xp: 2 } }, activeList: 'journey', trail: TR({}), mast: M2(['sun']) } ] };

async function open(b, vp, errs) {
  const ctx = await b.newContext({ viewport: vp, hasTouch: vp.width < 640 });
  await ctx.addInitScript(s => { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } }, SEED);
  const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(URL); await booted(pg);
  await pg.evaluate(() => new Promise(r => SB_LAZY.need('atlas', r)));   // the Atlas curriculum is lazy
  await frames(pg, 2);
  return { ctx, pg };
}
const bar = pg => pg.evaluate(() => {
  const B = document.querySelector('.sb-fam-bar'); const br = B.getBoundingClientRect();
  const box = sel => { const e = B.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? { l: r.left, r: r.right, t: r.top, b: r.bottom, cy: (r.top + r.bottom) / 2 } : null; };
  const parts = { hive: box('.sb-fam-hive'), brand: box('.sb-fam-brand'), theme: box('[data-act="cycleMode"]'), lock: box('.sb-fam-lock'), kid: box('[data-act="famMenu"]'),
    search: box('.sb-hsearch input'), coins: box('[data-act="openWallet"].bz-coinchip'), menu: box('[data-act="openDrawer"]') };
  const h = parts.hive || parts.lock;
  return { parts, line: h ? Math.round((2 * (h.t - br.top) + (h.b - h.t)) * 10) / 10 : 0, sw: document.documentElement.scrollWidth, vw: innerWidth,
    href: (B.querySelector('.sb-fam-hive') || {}).href || null,
    topnav: (() => { const t = document.querySelector('.sb-topnav'); return !!t && getComputedStyle(t).display !== 'none' && t.getBoundingClientRect().height > 20; })(),
    tabbar: (() => { const t = document.querySelector('.sb-tabbar'); return !!t && getComputedStyle(t).display !== 'none'; })() };
});

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  for (const vp of [{ width: 1180, height: 900 }, { width: 390, height: 844 }, { width: 360, height: 780 }]) {
    const { ctx, pg } = await open(b, vp, errs);
    const r = await bar(pg); const p = r.parts; const n = vp.width + 'px';
    const fam = [p.hive, p.brand, p.theme, p.lock, p.kid];
    const order = fam.every(Boolean) && p.hive.r <= p.brand.l + 1 && p.brand.r <= p.theme.l && p.theme.r <= p.lock.l + 1 && p.lock.r <= p.kid.l + 1
      && [p.coins, p.menu, p.search].every(x => !x || x.r <= p.theme.l + 1 || x.t > p.kid.b);
    ok(order, `${n}: ⬡ · Bizzing Bee · …… · theme · 🔒 · avatar ▾, in that order, Bee's own tools between`);
    ok(fam.every(x => x && Math.abs(x.cy - p.hive.cy) < 3), `${n}: the family controls share one line`);
    ok(Math.abs(r.line - 56) <= 1.5, `${n}: the bar is 56px tall (${r.line})`);
    ok(r.sw <= r.vw + 1, `${n}: no sideways scroll (${r.sw} in ${r.vw})`);
    ok(!!p.search && !!p.coins, `${n}: the real search bar and the coins pill are still in the bar`);
    ok(vp.width >= 640 ? r.topnav : r.tabbar, `${n}: ${vp.width >= 640 ? 'the desktop top nav is still there' : 'the phone keeps its bottom tab bar'}`);
    if (vp.width === 1180) {
      ok(r.href === HIVE, '⬡ points at the Hive (' + r.href + ')');
      /* hidden inside a running drill, back afterwards */
      await pg.evaluate(() => app.trailUnit('u3')); await until(pg, () => state.trailUnit === 'u3');
      await pg.evaluate(() => app.trailPractice()); await until(pg, () => state.nav === 'train' && !!document.querySelector('.sb-fam-bar'), null, 20000);
      const inDrill = await pg.evaluate(() => ({ nav: state.nav, hive: !!document.querySelector('.sb-fam-hive'), lock: !!document.querySelector('.sb-fam-lock'), kid: !!document.querySelector('[data-act="famMenu"]') }));
      await pg.evaluate(() => app.setNav('home')); await until(pg, () => state.nav === 'home' && !!document.querySelector('.sb-fam-bar'));
      ok(inDrill.nav === 'train' && !inDrill.hive && inDrill.lock && inDrill.kid && await pg.evaluate(() => !!document.querySelector('.sb-fam-hive')),
        '⬡ hides while a drill word is live (the rest of the bar stays) and is back after');
      /* the grown-ups lock */
      await pg.click('.sb-fam-lock'); await until(pg, () => !!state.pinDlg, null, 5000);
      const gate = await pg.evaluate(() => ({ dlg: !!state.pinDlg, make: !!(state.pinDlg && state.pinDlg.make) }));
      await pg.evaluate(() => '1234'.split('').forEach(k => app.pinKey(k))); await until(pg, () => !state.pinDlg && state.progTab === 'parent', null, 5000);
      ok(gate.dlg && !gate.make && await pg.evaluate(() => state.progTab === 'parent' && !state.pinDlg), '🔒 asks for the grown-up PIN, then opens the grown-ups area');
      await pg.evaluate(() => app.setNav('home')); await until(pg, () => state.nav === 'home');
      /* appearance still cycles; Settings still opens, from the avatar menu */
      const m0 = await pg.evaluate(() => state.mode);
      await pg.click('[data-act="cycleMode"]'); await until(pg, m => state.mode !== m, m0, 5000);   // the tap is debounced 230ms
      ok(await pg.evaluate(m => state.mode !== m, m0), 'the theme button still cycles the look');
      await pg.click('[data-act="famMenu"]');
      await pg.click('.sb-fam-menu [data-act="famSettings"]'); await until(pg, () => !!state.pinDlg || !!state.settingsOpen, null, 5000);
      await pg.evaluate(() => '1234'.split('').forEach(k => app.pinKey(k))); await until(pg, () => !!state.settingsOpen, null, 5000);
      ok(await pg.evaluate(() => !!state.settingsOpen), 'Settings opens from the avatar menu (behind its PIN)');
      await pg.evaluate(() => app.closeSettings()); await until(pg, () => !state.settingsOpen);

      /* ---- the switcher: everyone listed, one tap, no PIN, nothing mixed ---- */
      const before = await pg.evaluate(() => { const c = state.children; return {
        a: { coins: c[0].coins, lists: JSON.stringify(c[0].lists), trail: JSON.stringify(c[0].trail), avatar: c[0].avatar },
        r: { coins: c[1].coins, lists: JSON.stringify(c[1].lists), trail: JSON.stringify(c[1].trail), avatar: c[1].avatar },
        lu: Object.keys(state.luMastered).sort().join(',') }; });
      await pg.click('[data-act="famMenu"]'); await until(pg, () => document.querySelectorAll('.sb-fam-menu [data-act="famSwitch"]').length > 0, null, 5000);
      const menu = await pg.evaluate(() => [...document.querySelectorAll('.sb-fam-menu [data-act="famSwitch"]')].map(e => e.textContent.trim()));
      ok(menu.length === 2 && /Ahana/.test(menu[0]) && /Ravi/.test(menu[1]), 'the avatar opens "Children in this household" with every child (' + menu.join(', ') + ')');
      await pg.click('.sb-fam-menu [data-act="famSwitch"][data-arg="1"]'); await until(pg, () => active().name === 'Ravi' && state.nav === 'home', null, 10000);
      const asRavi = await pg.evaluate(() => { const c = active(); return { name: c.name, pin: !!state.pinDlg, nav: state.nav, coins: c.coins, lists: JSON.stringify(c.lists), trail: JSON.stringify(c.trail),
        avatar: c.avatar, lu: Object.keys(state.luMastered).sort().join(','), theme: state.theme,
        barKid: (document.querySelector('[data-act="famMenu"]') || {}).getAttribute && document.querySelector('[data-act="famMenu"]').getAttribute('aria-label') }; });
      ok(asRavi.name === 'Ravi' && !asRavi.pin && asRavi.nav === 'home', 'one tap switches to Ravi — no PIN, back on Home');
      ok(asRavi.coins === before.r.coins && asRavi.lists === before.r.lists && asRavi.trail === before.r.trail && asRavi.avatar === 'froggy' && /Ravi/.test(asRavi.barKid) && asRavi.theme === 'aurora',
        "Ravi has Ravi's coins, word lists, Atlas trail, avatar and world — not Ahana's");
      ok(asRavi.lu === 'sun', `Ravi gets his own mastered words, not Ahana's (${before.lu} → "${asRavi.lu}")`);
      /* Ravi earns something; Ahana must not get it */
      await pg.evaluate(() => { const M = mastRec(active()); M.zebra = { b: 2, due: mastDay() + 30, d: mastDay() - 3, ok: 2, n: 2 }; mastSync(true); addCoins('stop'); active().lists.journey.xp += 9; save(); });   // coins arrive by a standard event (c.coins mirrors the wallet)
      await pg.click('[data-act="famMenu"]');
      await pg.click('.sb-fam-menu [data-act="famSwitch"][data-arg="0"]'); await until(pg, () => active().name === 'Ahana' && state.nav === 'home', null, 10000);
      const backA = await pg.evaluate(() => { const c = active(); return { name: c.name, coins: c.coins, lists: JSON.stringify(c.lists), trail: JSON.stringify(c.trail), lu: Object.keys(state.luMastered).sort().join(',') }; });
      ok(backA.name === 'Ahana' && backA.coins === before.a.coins && backA.lists === before.a.lists && backA.trail === before.a.trail && backA.lu === before.lu,
        "back on Ahana: her coins, lists, trail and mastered words are exactly as she left them — Ravi's zebra is not among them");
      await pg.reload(); await booted(pg);
      const afterReload = await pg.evaluate(() => { const r = state.children[1]; return { a: active().name, alu: Object.keys(state.luMastered).sort().join(','),
        rlu: Object.keys(r.mast || {}).filter(k => r.mast[k].b >= 2).sort().join(','), rc: r.coins }; });
      ok(afterReload.a === 'Ahana' && afterReload.alu === before.lu && afterReload.rlu === 'sun,zebra' && afterReload.rc === before.r.coins + 5,
        'after a reload each child still has their own book (' + afterReload.alu + ' | ' + afterReload.rlu + ')');
      /* adding a child is a grown-up's job */
      await pg.click('[data-act="famMenu"]');
      await pg.click('.sb-fam-menu [data-act="famAdd"]'); await until(pg, () => !!state.pinDlg, null, 5000);
      ok(await pg.evaluate(() => !!state.pinDlg && state.screen === 'app'), '"+ Add a child" waits behind the grown-up PIN');
    }
    await ctx.close();
  }
  /* ---- a household from before the split: the shared book is COPIED to each child once, so
     nothing anyone earned is lost — and from then on the two copies never touch ---- */
  {
    /* the household format before per-child mastery: one shared `lu` map, no evidence record on any child */
    const legacy = JSON.parse(JSON.stringify(SEED)); legacy.lu = { cat: true, dog: true, ship: true }; legacy.children.forEach(k => { delete k.mast; });
    const ctx = await b.newContext({ viewport: { width: 1000, height: 800 } });
    await ctx.addInitScript(s2 => { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s2)); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } }, legacy);
    const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(URL); await booted(pg);
    const r = await pg.evaluate(async () => { app.famSwitch(1); const ravi = Object.keys(state.luMastered).sort().join(',');
      markMastered('zebra'); app.famSwitch(0); const ahana = Object.keys(state.luMastered).sort().join(',');
      return { ravi, ahana }; });
    ok(r.ravi === 'cat,dog,ship' && r.ahana === 'cat,dog,ship', `legacy household: the shared book is kept by both children once (${r.ravi} | ${r.ahana}), and Ravi's new zebra stays his`);
    await ctx.close();
  }
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
