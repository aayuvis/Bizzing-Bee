/* BIZZING COINS: ONE FAMILY WALLET, PAID ONLY FOR LEARNING (FIX-BEE Harmonise, FAMILY-STANDARD §1).

   Bee coins were a purse on the child that forty-odd call sites topped up with whatever
   number felt right — 400 for a quiz ladder, 250 for a mock bee, 300 for a 30-day streak,
   30 for poking the right patch of grass, and a plan's "start coins" for a grown-up's card.
   Now c.coins is a MIRROR of localStorage['bizzing.wallet'] (bizzing-wallet.js, the
   Bizzing_Schedule drop-in), and addCoins takes an EVENT, not an amount.

   What this proves, by playing the app rather than poking the helper:
     1. the old purse moves into the wallet 1:1, ONCE — the page is reloaded twice;
     2. a real game round pays one coin per right word and nothing for finishing;
     3. every ledger line the app writes is a standard event at its standard amount;
     4. the 100-a-day cap holds;
     5. a bare number pays nothing, so an invented payout fails safe;
     6. Test coins and ?demo never write the family wallet; a plan grants no coins;
     7. no call site anywhere passes an amount;
     8. (audit v4 K9) the wallet history is one line per sitting — "+13 · from 13 right answers" —
        while purchases and the one-off migration stay lines of their own.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/wallet-coins.cjs                  */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const APP = path.resolve(__dirname, '..');
const EARN = { answer: 1, stop: 5, contest: 10, mastery: 20 };

const seed = { theme: 'spellbound', mode: 'light', premium: false, activeIdx: 0, pin: '1234',
  children: [{ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'bizzy', theme: 'spellbound', coins: 250,
    unlockedThemes: ['spellbound', 'aurora'], xp: 40, level: 3, lists: { default: { xp: 40 }, journey: { xp: 10 } } }] };

(async () => {
  /* ---- 7. the source: every addCoins call names a standard event ---- */
  const srcFiles = fs.readdirSync(APP).filter(f => /\.js$/.test(f) && !/data|words|voice|trivia-q|manifest/.test(f));
  const bad = [];
  for (const f of srcFiles) {
    const src = fs.readFileSync(path.join(APP, f), 'utf8');
    for (const m of src.matchAll(/\baddCoins\(([^)]*)\)/g)) {
      const arg = m[1].trim();
      if (/^(ev|EVENT|n)$/.test(arg)) continue;                       // the definition and its doc line
      if (!/^'(answer|stop|contest|mastery)'$/.test(arg)) bad.push(f + ': addCoins(' + arg + ')');
    }
  }
  ok(!bad.length, 'every addCoins call names a standard event — ' + (bad.length ? bad.slice(0, 4).join(' · ') : srcFiles.length + ' files scanned'));
  const pricing = fs.readFileSync(path.join(APP, 'pricing.js'), 'utf8');
  ok(!/c\.coins\s*=/.test(pricing), 'pricing.js never writes a child\'s coins (a plan grants content, not coins)');

  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 1000, height: 900 } });
  await ctx.addInitScript(s => { try { if (!localStorage.getItem('sb_wc_seeded')) {
    localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_wc_seeded', '1'); } } catch (e) {} }, seed);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  const url = 'file://' + APP + '/index.html';
  const wallet = () => pg.evaluate(() => JSON.parse(localStorage.getItem('bizzing.wallet') || 'null'));
  const purse = () => pg.evaluate(() => state.children[0].coins);

  /* ---- 1. the migration: 1:1, once, after the boot refunds ---- */
  await pg.goto(url); await pg.waitForTimeout(3000);
  let w = await wallet();
  const kid = w && w.kids && w.kids.ahana;
  // the seed owned Aurora, so the Aurora refund (COST.theme) lands first and migrates with the rest
  const cost = await pg.evaluate(() => COST.theme);
  ok(!!kid && kid.coins === 250 + cost, `the purse moved into the wallet 1:1, refund included — wallet ${kid && kid.coins}, expected ${250 + cost}`);
  ok(!!kid && kid.ledger.filter(x => x.why === 'migrated').length === 1, 'one "migrated" line in the ledger');
  ok(await purse() === 250 + cost, 'c.coins is the wallet\'s mirror — ' + await purse());
  await pg.reload(); await pg.waitForTimeout(3000);
  await pg.reload(); await pg.waitForTimeout(3000);
  w = await wallet();
  ok(w.kids.ahana.coins === 250 + cost && w.kids.ahana.ledger.filter(x => x.why === 'migrated').length === 1,
    'two more reloads pay nothing more — wallet ' + w.kids.ahana.coins);
  ok(await purse() === 250 + cost, 'and the mirror still agrees after the reloads');

  /* ---- 2. a real round: Bee's 10-word warm-up, every word typed right ---- */
  const before = (await wallet()).kids.ahana.coins; const n0 = (await wallet()).kids.ahana.ledger.length;
  const round = await pg.evaluate(async () => {
    state.screen = 'app'; app.playGame('buzz'); const g = state.game; if (!g || !g.list) return { err: 'no game' };
    const n = g.list.length;
    for (let i = 0; i < n; i++) { const G = state.game; if (!G || G.status === 'done') break;
      state.typed = G.list[G.i].w; app.gSubmit(); await new Promise(r => setTimeout(r, 30)); }
    const G = state.game; return { right: G.right, status: G.status, bonus: G.bonus, n };
  });
  await pg.waitForTimeout(400);
  const after = (await wallet()).kids.ahana.coins;
  ok(round.status === 'done' && round.right === round.n, `played a full round, ${round.right}/${round.n} right`);
  const roundLines = (await wallet()).kids.ahana.ledger.slice(n0);
  const answers = roundLines.filter(x => x.why === 'answer'), others = roundLines.filter(x => x.why !== 'answer');
  /* A round pays its right answers and nothing else. A stage-up inside the round is XP, and since
     FIX-BEE v2 it pays NO mastery coin — that fires only when a Stage is mastered on evidence
     (right on two separate days), which one sitting can never show. Nothing pays for finishing. */
  ok(answers.length === round.right && answers.every(x => x.n === 1) && others.length === 0,
    `the round paid one coin per right word (${answers.length}) and nothing for finishing — other lines: ${others.map(x => x.why).join(',') || 'none'}`);
  ok(after - before === roundLines.reduce((a, x) => a + x.n, 0), `the purse moved by exactly what the ledger says (+${after - before})`);
  ok(round.bonus === answers.length, `and its finish screen shows the coins its words earned (+${round.bonus})`);

  /* ---- 3. every line the app wrote is a standard event at its amount ---- */
  const lines = (await wallet()).kids.ahana.ledger.filter(x => x.why !== 'migrated');
  const offStd = lines.filter(x => x.a !== 'bee' || !(x.why in EARN) || x.n !== EARN[x.why]);
  ok(lines.length > 0 && !offStd.length, `${lines.length} ledger lines, all standard (${offStd.length ? JSON.stringify(offStd[0]) : 'none off-standard'})`);

  /* ---- 5. amounts are not the caller's ---- */
  const r5 = await pg.evaluate(() => { const w0 = BZ_WALLET.balance('Ahana');
    const paid = [addCoins(250), addCoins(5), addCoins('streak'), addCoins('login'), addCoins('time')];
    return { paid, moved: BZ_WALLET.balance('Ahana') - w0 }; });
  ok(r5.paid.every(n => n === 0) && r5.moved === 0, 'a number, a streak, a login or time pays nothing — ' + JSON.stringify(r5.paid));
  const r5b = await pg.evaluate(() => ['answer', 'stop', 'contest', 'mastery'].map(e => addCoins(e)));
  ok(JSON.stringify(r5b) === JSON.stringify([1, 5, 10, 20]), 'the four standard events pay 1 · 5 · 10 · 20 — ' + JSON.stringify(r5b));

  /* ---- 6. Testing, ?demo and a plan never write the family wallet — checked BEFORE the cap
     is reached, or a write the cap refused would look like a write that never happened.
     (The "Test coins" purse is gone: testing never rewrites a child — FIX-BEE M3, batch C.) ---- */
  const r6 = await pg.evaluate(async () => {
    const w0 = BZ_WALLET.balance('Ahana'); const c = active(); const c0 = c.coins;
    state._planOk = true; state.parentPin = '1234';
    app.toggleDevCoins(); for (const k of '1234') app.pinKey(k);
    const afterLever = { coins: c.coins, wallet: BZ_WALLET.balance('Ahana'), dev: !!c.devCoins };
    window.SB_DEMO = true; addCoins('contest'); window.SB_DEMO = false;
    const afterDemo = BZ_WALLET.balance('Ahana');
    SB_ENT.setTier(c, 'regional'); const afterPlan = BZ_WALLET.balance('Ahana'); SB_ENT.setTier(c, 'free');
    return { w0, c0, afterLever, afterDemo, afterPlan, wEnd: BZ_WALLET.balance('Ahana') };
  });
  ok(r6.afterLever.coins === r6.c0 && r6.afterLever.wallet === r6.w0 && !r6.afterLever.dev, 'the old Test-coins switch changes nothing — no test purse, no wallet write (' + r6.c0 + ' → ' + r6.afterLever.coins + ')');
  ok(r6.afterDemo === r6.w0, 'a sample (?demo) child adds nothing to the wallet');
  ok(r6.afterPlan === r6.w0 && r6.wEnd === r6.w0, 'a paid plan adds nothing to the wallet');

  /* ---- 4. the cap: 100 per app per child per day ---- */
  const cap = await pg.evaluate(() => { let n = 0; for (let i = 0; i < 12; i++) n += addCoins('mastery');
    const today = BZ_WALLET.ledger('Ahana').filter(x => x.a === 'bee' && x.n > 0 && x.why !== 'migrated' && new Date(x.t).toDateString() === new Date().toDateString()).reduce((a, x) => a + x.n, 0);
    return { today, last: addCoins('answer') }; });
  ok(cap.today === 100 && cap.last === 0, `the day stops at 100 earned (${cap.today}), and the next right answer pays 0 (${cap.last})`);

  /* ---- 8. the history is one line per sitting (audit v4 K9) ---- */
  {
    const now = Date.now(), M = 60000, L = [];
    L.push({ a: 'bee', t: now - 300 * M, n: 250, why: 'migrated' });
    for (let i = 0; i < 3; i++) L.push({ a: 'bee', t: now - 200 * M + i * M, n: 1, why: 'answer' });       // an earlier sitting
    L.push({ a: 'bee', t: now - 120 * M, n: -120, why: 'avatar:panda' });                                  // a purchase, alone
    for (let i = 0; i < 13; i++) L.push({ a: 'bee', t: now - 30 * M + i * M, n: 1, why: 'answer' });      // today's sitting…
    L.push({ a: 'bee', t: now - 16 * M, n: 5, why: 'stop' });                                              // …with a finished round in it
    L.push({ a: 'maths', t: now - 15 * M, n: 1, why: 'answer' });                                          // a sibling app: its own line
    const coins = L.reduce((a, x) => a + x.n, 0);
    const ctx = await b.newContext({ viewport: { width: 1000, height: 900 } });
    await ctx.addInitScript(([s, w]) => { try { if (!localStorage.getItem('t_hist')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_splash', '0');
      localStorage.setItem('bizzing.wallet', JSON.stringify(w)); localStorage.setItem('t_hist', '1'); } } catch (e) {} },
      [Object.assign({}, seed, { children: [Object.assign({}, seed.children[0], { walletWho: 'ahana', coins })] }), { v: 1, kids: { ahana: { coins, ledger: L } } }]);
    const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
    await pg.goto('file://' + APP + '/index.html'); await pg.waitForTimeout(2500);
    const h = await pg.evaluate(async () => { state.walletOpen = true; render(); await new Promise(r => setTimeout(r, 200));
      const rows = [...document.querySelectorAll('.bz-sheet .bz-ledger li')].map(li => (li.querySelector('b').textContent + ' ' + li.querySelector('.bz-ledger-w').textContent).replace(/\s+/g, ' ').trim());
      state.walletOpen = false; app.openShop('avatars'); await new Promise(r => setTimeout(r, 300));
      const shop = [...document.querySelectorAll('.bz-hist .bz-ledger li')].length;
      return { rows, shop, raw: BZ_WALLET.ledger('Ahana').length }; });
    ok(h.rows[0] === '+1 a right answer' && h.rows[1] === '+5 finished a round' && h.rows[2] === '+13 from 13 right answers',
      'the history folds a sitting\'s right answers into one line — "+13 from 13 right answers" — beside its finished round and a sibling app\'s own line (' + h.rows.slice(0, 3).join(' | ') + ')');
    ok(/^−120 bought /.test(h.rows[3]) && h.rows[4] === '+3 from 3 right answers' && /^\+250 Bee coins moved/.test(h.rows[5]) && h.rows.length === 6,
      'a purchase stands alone, an earlier sitting is its own line, and the move into the family wallet is never folded (' + h.rows.slice(3).join(' | ') + ')');
    ok(h.shop === h.rows.length && h.raw === 20, `the Shop's history reads the same ${h.shop} lines, and the ledger itself is untouched (${h.raw} entries)`);
    await ctx.close();
  }

  await b.close();
  ok(!errs.length, errs.length ? 'page errors: ' + errs.slice(0, 3).join(' | ') : 'no page errors');
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
