/* A LOOK A CHILD BUYS SHOWS WHERE IT APPLIES (road to 4.5, P3.17–P3.20).

   The Shop's Extras tab sells frames, name plates and backgrounds, its Grand Prix tab kart paint and trails — rows of the
   one price table (app3.js SHOP_ITEMS; prices, the wallet and "only looks" are held by tests/shop-economy.cjs). This
   holds the screens, on a phone with taps and on a desktop with the keyboard:
     · a week-one child sees at least five looks priced 20–60 coins across the two tabs, every price printed on its
       button, and "Your card" at the top of Extras previewing what they wear;
     · buying a name plate and a background (one tap, the confirm, the wallet) puts them on at once — the plate behind
       the child's name and the background behind their avatar on Home, in the ☰ menu's head and on My page's card —
       and "Wearing — take off" takes each off everywhere;
     · nothing a child does not own is ever shown on them, and no price appears on Home, the menu or My page (T3: a
       price lives in the Shop only).
   Proved by breaking: plated() ignoring what is worn → "the plate is on Home" fails; cardBg() drawing a background the
   child does not own → "nothing not owned" fails.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/shop-looks.cjs                                           */
'use strict';
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const KID = { name: 'Wren', age: 9, ageBand: '8-10', avatar: 'bizzy', theme: 'spellbound', coins: 0, fr: '2026-10-01', lists: { default: { xp: 30 } }, activeList: 'default',
  missed: [], unlockedThemes: ['spellbound'], unlockedConcepts: {}, unlockedLists: {}, questPath: 'journey', trail: { lap: 1, done: {}, chk: {}, seen: {}, st: {}, elap: 1, edone: {}, echk: {} } };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find((p) => fs.existsSync(p)) });
  const errs = [];
  for (const vp of [{ n: 'phone', width: 390, height: 844, touch: true }, { n: 'desktop', width: 1180, height: 900 }]) {
    const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: !!vp.touch, isMobile: !!vp.touch });
    await ctx.addInitScript((k) => { try { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [k] }));
      localStorage.setItem('bizzing.wallet', JSON.stringify({ v: 1, kids: { wren: { coins: 75, ledger: [{ a: 'bee', t: Date.now() - 864e5, n: 75, why: 'migrated' }] } } }));
      localStorage.setItem('t_seed', '1'); localStorage.setItem('sb_splash', '0'); } } catch (e) {} }, KID);
    const pg = await ctx.newPage(); pg.on('pageerror', (e) => errs.push(vp.n + ': ' + e.message));
    await pg.goto('file://' + ROOT + '/index.html');
    await pg.waitForFunction(() => typeof state !== 'undefined' && typeof app !== 'undefined' && state.screen, null, { timeout: 30000 });
    await pg.evaluate(() => { state.screen = 'app'; window.confirm = () => true; render(); });
    await pg.evaluate(() => new Promise((r) => SB_LAZY.need(['words1', 'scrMe', 'scrGrown'], r)));
    const press = async (sel) => { if (vp.touch) await pg.tap(sel); else { await pg.focus(sel); await pg.keyboard.press('Enter'); } await pg.waitForTimeout(300); };
    const looks = () => pg.evaluate(() => { const q = (s) => document.querySelector(s);
      return { homePlate: (q('.sb-content .sb-home-greet .bz-plate') || {}).className || '', homeBg: !!q('.sb-content .sb-home-greet .bz-bg'),
        homeBgId: ((q('.sb-content .sb-home-greet .bz-bg') || {}).className || '').match(/bz-bg-(\w+)/), price: /\d+\s*coins\b/i.test((q('.sb-content') || {}).innerText || '') }; });

    /* the Shop: five looks a week-one child can save for, priced on their buttons */
    await pg.evaluate(() => app.openShop('extras')); await pg.waitForFunction(() => !!document.querySelector('.bz-mecard'), null, { timeout: 20000 });
    const ex = await pg.evaluate(() => [...document.querySelectorAll('[data-act="buyItem"],[data-act="buyFrame"]')].map((e) => +((e.textContent.match(/(\d+)\s*coins/) || [])[1])));
    await pg.evaluate(() => app.openShop('race')); await pg.waitForTimeout(400);
    const rc = await pg.evaluate(() => [...document.querySelectorAll('[data-act="buyItem"]')].map((e) => +((e.textContent.match(/(\d+)\s*coins/) || [])[1])));
    const all = ex.concat(rc), week = all.filter((p) => p >= 20 && p <= 60);
    ok(all.every((p) => p > 0) && week.length >= 5, `${vp.n}: every look's price is printed on its button, and ${week.length} cost 20–60 coins (${week.join(', ')})`);

    /* before: nothing bought, nothing worn */
    await pg.evaluate(() => app.setNav('home')); await pg.waitForTimeout(300);
    const L0 = await looks();
    ok(!L0.homePlate && !L0.homeBg && !L0.price, `${vp.n}: before buying, Home wears no plate and no background, and prints no price`);

    /* buy a plate and a background in Extras */
    await pg.evaluate(() => app.openShop('extras')); await pg.waitForFunction(() => !!document.querySelector('[data-arg="plate:ribbon"]'), null, { timeout: 20000 });
    await press('[data-act="buyItem"][data-arg="plate:ribbon"]');
    await press('[data-act="buyItem"][data-arg="bg:meadow"]');
    const bought = await pg.evaluate(() => { const c = active(); return { cos: JSON.stringify(c.cos || {}), bal: BZ_WALLET.balance('Wren'),
      card: { plate: !!document.querySelector('.bz-mecard .bz-plate-ribbon'), bg: !!document.querySelector('.bz-mecard .bz-bg-meadow') } }; });
    ok(bought.bal === 75 - 30 - 25 && bought.card.plate && bought.card.bg, `${vp.n}: a ${vp.touch ? 'tap' : 'keypress'} buys the Purple ribbon plate (30) and the Meadow background (25) — wallet 75 → ${bought.bal} — and "Your card" wears them (${bought.cos})`);

    /* where they apply: Home, the ☰ menu's head, My page */
    await pg.evaluate(() => app.setNav('home')); await pg.waitForTimeout(300);
    const L1 = await looks();
    ok(/bz-plate-ribbon/.test(L1.homePlate) && L1.homeBgId && L1.homeBgId[1] === 'meadow' && !L1.price, `${vp.n}: Home shows them — the plate behind the name, the background behind the avatar — and still no price`);
    await pg.evaluate(() => { state.drawerOpen = true; render(); }); await pg.waitForTimeout(200);
    const dr = await pg.evaluate(() => ({ plate: !!document.querySelector('.bz-drawer .bz-dr-who .bz-plate-ribbon'), bg: !!document.querySelector('.bz-drawer .bz-dr-av.bz-bg-meadow') }));
    await pg.evaluate(() => { state.drawerOpen = false; state.progTab = 'me'; app.setNav('progress'); });
    await pg.waitForFunction(() => !!document.querySelector('.sb-content .bz-mecard'), null, { timeout: 20000 });
    const mp = await pg.evaluate(() => ({ plate: !!document.querySelector('.sb-content .bz-mecard .bz-plate-ribbon'), bg: !!document.querySelector('.sb-content .bz-mecard .bz-bg-meadow'),
      price: /\d+\s*coins\b/i.test(document.querySelector('.sb-content').innerText) }));
    ok(dr.plate && dr.bg && mp.plate && mp.bg && !mp.price, `${vp.n}: the ☰ menu's head and My page's card wear them too (menu ${dr.plate}/${dr.bg}, My page ${mp.plate}/${mp.bg}), My page prints no price`);

    /* take them off */
    await pg.evaluate(() => app.openShop('extras')); await pg.waitForFunction(() => !!document.querySelector('[data-act="wearItem"][data-arg="plate:"]'), null, { timeout: 20000 });
    await press('[data-act="wearItem"][data-arg="plate:"]'); await press('[data-act="wearItem"][data-arg="bg:"]');
    await pg.evaluate(() => app.setNav('home')); await pg.waitForTimeout(300);
    const L2 = await looks();
    ok(!L2.homePlate && !L2.homeBg, `${vp.n}: "Wearing — take off" takes each off everywhere`);

    /* nothing not owned is ever worn: a worn id with no purchase draws nothing */
    const forged = await pg.evaluate(() => { const c = active(); c.cos = { on: { plate: 'gilt', bg: 'aurora' } }; c.frame = 'rainbow'; render();
      return { any: !!document.querySelector('.sb-content .bz-plate-gilt, .sb-content .bz-bg-aurora, .bz-frame-rainbow') }; });
    ok(!forged.any, `${vp.n}: a look the child does not own is never drawn on them, even when the record names it`);
    await ctx.close();
  }
  await b.close();
  ok(!errs.length, 'no page errors' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
