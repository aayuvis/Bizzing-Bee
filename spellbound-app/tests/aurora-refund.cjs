/* AURORA WAS BOUGHT, THEN GIVEN AWAY — THE BUYERS GET THEIR COINS BACK.

   Aurora became the second STARTER world on 30 Sep (onboarding offers two). Anyone who
   had already spent COST.theme on it owned a thing the app then handed out for free, so
   boot refunds it once. The receipt IS the fix: 'aurora' is dropped from unlockedThemes,
   which both records that the refund happened and makes a second payment impossible —
   and takes nothing away, because FREE_THEMES already answers isThemeUnlocked('aurora').

   The failure this catches is the one every self-clearing migration can have: a reload
   that pays again. It reloads twice and checks the purse both times.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/aurora-refund.cjs            */
const { chromium } = require('playwright');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };

const seed = (coins, themes) => ({
  theme: 'aurora', mode: 'day', premium: false, activeIdx: 0,
  children: [{ name: 'Ahana', age: 9, ageBand: '9-11', avatar: 'bizzy', theme: 'aurora',
               coins, unlockedThemes: themes, xp: 40, level: 3 }],
});

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const url = 'file://' + require('path').resolve(__dirname, '..') + '/index.html';
  const errs = [];
  /* The seed goes in through an init script, not a setItem on a live page: save() fires
     on nearly every render, so a save written into a running app is overwritten by the
     empty state before the reload can read it. Guarded by a marker so the SECOND boot
     reads what the app left behind — which is the whole point of the pay-once check. */
  const boot = async (state0) => {
    const ctx = await b.newContext({ viewport: { width: 900, height: 1000 } });
    await ctx.addInitScript(s => { try {
      if (!localStorage.getItem('sb_seeded')) {
        localStorage.setItem('sb_saas_v2', JSON.stringify(s));
        localStorage.setItem('sb_seeded', '1');
      } } catch (e) {} }, state0);
    const pg = await ctx.newPage();
    pg.on('pageerror', e => errs.push(e.message));
    const read = () => pg.evaluate(() => {
      const c = state.children[0] || {};
      return { coins: c.coins, themes: (c.unlockedThemes || []).slice(), theme: c.theme,
               owned: isThemeUnlocked('aurora'), cost: COST.theme, free: FREE_THEMES.slice() };
    });
    await pg.goto(url); await pg.waitForTimeout(3200);
    const first = await read();
    await pg.reload(); await pg.waitForTimeout(3200);
    const second = await read();
    await ctx.close();
    return { first, second };
  };

  const bought = await boot(seed(120, ['spellbound', 'aurora']));
  const a = bought.first;
  ok(a.free.indexOf('aurora') >= 0, 'Aurora is a free starter world — that is what makes this a refund');
  ok(a.coins === 120 + a.cost, `a buyer is paid back in full — 120 + ${a.cost} = ${a.coins}`);
  ok(a.themes.indexOf('aurora') < 0, 'the purchase record is cleared — ' + JSON.stringify(a.themes));
  ok(a.owned === true, 'and the world is still theirs to use (FREE_THEMES answers for it)');
  ok(a.theme === 'aurora', 'a speller sitting in Aurora is not moved out of it');
  ok(bought.second.coins === a.coins, `a second boot does not pay again — ${bought.second.coins} \u{1FA99}`);

  const never = await boot(seed(75, ['spellbound']));
  ok(never.first.coins === 75, `a speller who never bought Aurora gets nothing — ${never.first.coins} \u{1FA99}`);
  ok(never.first.owned === true, 'but can still choose it, because it is free now');

  await b.close();
  ok(!errs.length, errs.length ? 'page errors: ' + errs[0] : 'no page errors across four boots');
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
