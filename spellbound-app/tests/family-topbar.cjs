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
const URL = 'file://' + path.resolve(__dirname, '..') + '/index.html';
const HIVE = 'https://aayuvis.github.io/Bizzing_Schedule/';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const TR = (done) => ({ lap: 1, done, chk: {}, seen: {}, st: {}, elap: 1, edone: {}, echk: {} });
const SEED = { theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, lu: { cat: true, dog: true, ship: true }, children: [
  { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 120, lists: { journey: { xp: 30, stage: 2 } }, activeList: 'journey', trail: TR({ u1: { 1: 90 }, u2: { 1: 85 } }) },
  { name: 'Ravi', age: 12, ageBand: '11-13', avatar: 'froggy', theme: 'aurora', coins: 7, lists: { journey: { xp: 2 } }, activeList: 'journey', trail: TR({}), _lu: { sun: true } } ] };

async function open(b, vp, errs) {
  const ctx = await b.newContext({ viewport: vp, hasTouch: vp.width < 640 });
  await ctx.addInitScript(s => { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } }, SEED);
  const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(URL); await pg.waitForTimeout(3000);
  await pg.evaluate(() => new Promise(r => SB_LAZY.need('atlas', r)));   // the Atlas curriculum is lazy
  return { ctx, pg };
}
const bar = pg => pg.evaluate(() => {
  const B = document.querySelector('.sb-fam-bar'); const br = B.getBoundingClientRect();
  const box = sel => { const e = B.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? { l: r.left, r: r.right, t: r.top, b: r.bottom, cy: (r.top + r.bottom) / 2 } : null; };
  const parts = { hive: box('.sb-fam-hive'), brand: box('.sb-fam-brand'), theme: box('[data-act="cycleMode"]'), lock: box('.sb-fam-lock'), kid: box('[data-act="famMenu"]'),
    search: box('.sb-hsearch input'), coins: box('[data-act="openCollection"]'), menu: box('[data-act="openDrawer"]') };
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
      await pg.evaluate(() => app.trailUnit('u3')); await pg.waitForTimeout(600);
      await pg.evaluate(() => app.trailPractice()); await pg.waitForTimeout(1500);
      const inDrill = await pg.evaluate(() => ({ nav: state.nav, hive: !!document.querySelector('.sb-fam-hive'), lock: !!document.querySelector('.sb-fam-lock'), kid: !!document.querySelector('[data-act="famMenu"]') }));
      await pg.evaluate(() => app.setNav('home')); await pg.waitForTimeout(400);
      ok(inDrill.nav === 'train' && !inDrill.hive && inDrill.lock && inDrill.kid && await pg.evaluate(() => !!document.querySelector('.sb-fam-hive')),
        '⬡ hides while a drill word is live (the rest of the bar stays) and is back after');
      /* the grown-ups lock */
      await pg.click('.sb-fam-lock'); await pg.waitForTimeout(300);
      const gate = await pg.evaluate(() => ({ dlg: !!state.pinDlg, make: !!(state.pinDlg && state.pinDlg.make) }));
      await pg.evaluate(() => '1234'.split('').forEach(k => app.pinKey(k))); await pg.waitForTimeout(400);
      ok(gate.dlg && !gate.make && await pg.evaluate(() => state.progTab === 'parent' && !state.pinDlg), '🔒 asks for the grown-up PIN, then opens the grown-ups area');
      await pg.evaluate(() => app.setNav('home')); await pg.waitForTimeout(300);
      /* appearance still cycles; Settings still opens, from the avatar menu */
      const m0 = await pg.evaluate(() => state.mode);
      await pg.click('[data-act="cycleMode"]'); await pg.waitForTimeout(700);
      ok(await pg.evaluate(m => state.mode !== m, m0), 'the theme button still cycles the look');
      await pg.click('[data-act="famMenu"]'); await pg.waitForTimeout(250);
      await pg.click('.sb-fam-menu [data-act="famSettings"]'); await pg.waitForTimeout(300);
      await pg.evaluate(() => '1234'.split('').forEach(k => app.pinKey(k))); await pg.waitForTimeout(300);
      ok(await pg.evaluate(() => !!state.settingsOpen), 'Settings opens from the avatar menu (behind its PIN)');
      await pg.evaluate(() => app.closeSettings()); await pg.waitForTimeout(200);

      /* ---- the switcher: everyone listed, one tap, no PIN, nothing mixed ---- */
      const before = await pg.evaluate(() => { const c = state.children; return {
        a: { coins: c[0].coins, lists: JSON.stringify(c[0].lists), trail: JSON.stringify(c[0].trail), avatar: c[0].avatar },
        r: { coins: c[1].coins, lists: JSON.stringify(c[1].lists), trail: JSON.stringify(c[1].trail), avatar: c[1].avatar },
        lu: Object.keys(state.luMastered).sort().join(',') }; });
      await pg.click('[data-act="famMenu"]'); await pg.waitForTimeout(250);
      const menu = await pg.evaluate(() => [...document.querySelectorAll('.sb-fam-menu [data-act="famSwitch"]')].map(e => e.textContent.trim()));
      ok(menu.length === 2 && /Ahana/.test(menu[0]) && /Ravi/.test(menu[1]), 'the avatar opens "Children in this household" with every child (' + menu.join(', ') + ')');
      await pg.click('.sb-fam-menu [data-act="famSwitch"][data-arg="1"]'); await pg.waitForTimeout(600);
      const asRavi = await pg.evaluate(() => { const c = active(); return { name: c.name, pin: !!state.pinDlg, nav: state.nav, coins: c.coins, lists: JSON.stringify(c.lists), trail: JSON.stringify(c.trail),
        avatar: c.avatar, lu: Object.keys(state.luMastered).sort().join(','), theme: state.theme,
        barKid: (document.querySelector('[data-act="famMenu"]') || {}).getAttribute && document.querySelector('[data-act="famMenu"]').getAttribute('aria-label') }; });
      ok(asRavi.name === 'Ravi' && !asRavi.pin && asRavi.nav === 'home', 'one tap switches to Ravi — no PIN, back on Home');
      ok(asRavi.coins === before.r.coins && asRavi.lists === before.r.lists && asRavi.trail === before.r.trail && asRavi.avatar === 'froggy' && /Ravi/.test(asRavi.barKid) && asRavi.theme === 'aurora',
        "Ravi has Ravi's coins, word lists, Atlas trail, avatar and world — not Ahana's");
      ok(asRavi.lu === 'sun', `Ravi gets his own mastered words, not Ahana's (${before.lu} → "${asRavi.lu}")`);
      /* Ravi earns something; Ahana must not get it */
      await pg.evaluate(() => { markMastered('zebra'); active().coins += 5; active().lists.journey.xp += 9; save(); });
      await pg.click('[data-act="famMenu"]'); await pg.waitForTimeout(250);
      await pg.click('.sb-fam-menu [data-act="famSwitch"][data-arg="0"]'); await pg.waitForTimeout(600);
      const backA = await pg.evaluate(() => { const c = active(); return { name: c.name, coins: c.coins, lists: JSON.stringify(c.lists), trail: JSON.stringify(c.trail), lu: Object.keys(state.luMastered).sort().join(',') }; });
      ok(backA.name === 'Ahana' && backA.coins === before.a.coins && backA.lists === before.a.lists && backA.trail === before.a.trail && backA.lu === before.lu,
        "back on Ahana: her coins, lists, trail and mastered words are exactly as she left them — Ravi's zebra is not among them");
      await pg.reload(); await pg.waitForTimeout(2600);
      const afterReload = await pg.evaluate(() => { const r = state.children[1]; return { a: active().name, alu: Object.keys(state.luMastered).sort().join(','),
        rlu: Object.keys(r._lu || {}).sort().join(','), rc: r.coins }; });
      ok(afterReload.a === 'Ahana' && afterReload.alu === before.lu && afterReload.rlu === 'sun,zebra' && afterReload.rc === before.r.coins + 5,
        'after a reload each child still has their own book (' + afterReload.alu + ' | ' + afterReload.rlu + ')');
      /* adding a child is a grown-up's job */
      await pg.click('[data-act="famMenu"]'); await pg.waitForTimeout(250);
      await pg.click('.sb-fam-menu [data-act="famAdd"]'); await pg.waitForTimeout(250);
      ok(await pg.evaluate(() => !!state.pinDlg && state.screen === 'app'), '"+ Add a child" waits behind the grown-up PIN');
    }
    await ctx.close();
  }
  /* ---- a household from before the split: the shared book is COPIED to each child once, so
     nothing anyone earned is lost — and from then on the two copies never touch ---- */
  {
    const legacy = JSON.parse(JSON.stringify(SEED)); delete legacy.children[1]._lu;
    const ctx = await b.newContext({ viewport: { width: 1000, height: 800 } });
    await ctx.addInitScript(s2 => { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s2)); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } }, legacy);
    const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(URL); await pg.waitForTimeout(2600);
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
