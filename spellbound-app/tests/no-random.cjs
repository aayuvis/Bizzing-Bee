/* NO RANDOM REWARDS — RARITY STAYS, CHANCE GOES (FIX-BEE I3, FAMILY-STANDARD §1).

   An avatar pack was a lottery: pay a pack's price, draw 70% rare / 24% epic / 6% legendary,
   sell the repeats back for coins. A cache on the Atlas rolled which gift it held, a poke
   paid on the spot the date picked, and coins bought worlds, concept chapters and packs.

   The owner kept the rarity tiers, the trading cards and the paid-plan rares. What changed:
     • every non-starter avatar card names exactly how it is won — a learning milestone, a
       fixed coin price (Rares only), or "comes with the plan" — and the same card says the
       same thing to every child;
     • nothing anywhere draws: the outcome of every reward path is identical whatever
       Math.random returns (this test stubs it two ways and compares);
     • coins buy a COSMETIC at a printed price and never content: a locked world, chapter or
       word list cannot be had for coins, and nothing a child already bought is taken away.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/no-random.cjs                      */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const APP = path.resolve(__dirname, '..');

/* ---- the source: no draw, no odds, no pack, no coin price on content ---- */
const app3 = fs.readFileSync(path.join(APP, 'app3.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');   // comments may remember the old ways
const gone = [/PACK_WEIGHTS/, /\bpackOdds\b/, /\boddsPanel\b/, /Drop odds/i, /drop chance/i, /Open pack/i, /packRollOverlay/,
  /\bsellDupes\b/, /\bsellAvatar\b/, /spendCoins\(\s*COST\./, /Unlock this (world|concept) for/];
const left = gone.filter(rx => rx.test(app3)).map(String);
ok(!left.length, 'no pack draw, drop odds, selling or coin-priced content left in app3.js' + (left.length ? ' — ' + left.join(', ') : ''));
const spendCalls = [...app3.matchAll(/\bspendCoins\(([^)]*)\)/g)].map(m => m[1]).filter(a => !/^n, why$/.test(a));
/* FIX-BEE v2: coins buy three things, each at a FIXED printed price — an avatar (its tier's price),
   a world (240, the family WORLD_PRICE), a frame (its own price). Nothing rolled, nothing variable. */
const allowed = [/^f\.price,'frame:'\+id$/, /^s\.price,'avatar:'\+id$/, /^WORLD_PRICE_COINS,'world:'\+n$/];
ok(spendCalls.length === 3 && spendCalls.every(a => allowed.some(rx => rx.test(a.trim()))), 'coins buy only an avatar, a world or a frame, each at its printed price (' + spendCalls.join(' | ') + ')');
ok(/const WORLD_PRICE_COINS=240\b/.test(app3), 'a world costs the family price, 240 Bizzing coins');

const seed = (tier) => ({ theme: 'spellbound', mode: 'light', premium: false, activeIdx: 0, pin: '1234',
  children: [{ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'bizzy', theme: 'spellbound', coins: 1000, tier,
    unlockedThemes: ['spellbound', 'race'], unlockedConcepts: { 60: 1 }, avOwned: { nebula: 1 },
    xp: 60, level: 4, lists: { default: { xp: 60 }, journey: { xp: 20 } } }] });

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const boot = async (tier) => {
    const ctx = await b.newContext({ viewport: { width: 1100, height: 950 } });
    await ctx.addInitScript(s => { try { if (!localStorage.getItem('sb_nr_seeded')) {
      localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_nr_seeded', '1'); } } catch (e) {} }, seed(tier));
    const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.goto('file://' + APP + '/index.html'); await pg.waitForTimeout(3200);
    return { pg, ctx, errs };
  };

  /* ---- 1. every card says how it is had — a price, a world, or a named milestone; never a chance ---- */
  const A = await boot('regional');
  await A.pg.evaluate(() => { state.screen = 'app'; app.openShop('avatars'); });
  await A.pg.waitForTimeout(900);
  const cards = await A.pg.evaluate(() => { const c = active(); const out = { tiles: 0, ruled: 0, bad: [], legNamed: 0, legs: 0 };
    for (const a of SB_AVATARS.list) { if (SB_AVATARS.tierOf(a) === 'common' || avOwned(c, a.id)) continue; out.tiles++;
      const fig = document.querySelector('.sb-content .bz-av[data-av="' + a.id + '"]'); const t = fig ? (fig.querySelector('.bz-av-say') || {}).textContent || '' : '';
      if (t.trim().length > 6 && !/\bodds\b|chance|random|surprise|drop/i.test(t)) out.ruled++; else out.bad.push(a.id + ':' + t.slice(0, 40));
      if (SB_AVATARS.tierOf(a) === 'legendary') { out.legs++; if (a.milestone && t.includes(a.milestone.label.split(' ')[0])) out.legNamed++; } }
    return out; });
  ok(cards.tiles > 60 && cards.ruled === cards.tiles, `every one of ${cards.tiles} unowned rare/epic/legendary cards says how it is had (${cards.ruled})` + (cards.bad.length ? ' — ' + cards.bad.slice(0, 3).join(', ') : ''));
  ok(cards.legs >= 10 && cards.legNamed === cards.legs, `every legendary names its learning milestone (${cards.legNamed}/${cards.legs})`);

  /* ---- 2. a free child: no money price, no odds — and worlds say the plan or 240 coins ---- */
  const F = await boot('free');
  await F.pg.evaluate(() => { state.screen = 'app'; app.openShop('avatars'); });
  await F.pg.waitForTimeout(900);
  const fr = await F.pg.evaluate(() => { const t = document.querySelector('.sb-content').innerText;
    return { price: /\$\s?\d|\/(yr|year|mo|month)\b/.test(t), odds: /\bodds\b|\bdrops?\b|surprise|\d+(\.\d+)?\s?%/i.test(t),
      buys: document.querySelectorAll('.sb-content [data-act="buyAvatar"]').length }; });
  ok(!fr.price && fr.buys > 5, `a free child sees no price in money, and ${fr.buys} avatars they can buy with coins`);
  ok(!fr.odds, 'and no odds, drops or surprises anywhere in the Shop');
  await F.pg.evaluate(() => { app.openShop('worlds'); }); await F.pg.waitForTimeout(500);
  const wt = await F.pg.evaluate(() => document.querySelector('.sb-content').innerText);
  ok(/240/.test(wt) && /family plan/i.test(wt) && !/\$\s?\d/.test(wt), 'locked worlds say how they open: the family plan, or 240 Bizzing coins');

  /* ---- 3. chance cannot change any outcome: stub Math.random two ways and compare ---- */
  const run = (pg, r) => pg.evaluate(async (r) => {
    const real = Math.random; Math.random = () => r;
    const c = active(); const w0 = BZ_WALLET.balance(c.name); const own0 = Object.keys(c.avOwned || {}).sort().join();
    try {
      app.buyPack('hive');                                         // the old lottery door
      c.lists.default.xp += 1000;                                  // evidence a milestone reads (1,000 words right)
      grantAvatarMilestones(true);
      try { app.trailTre('meadow:0'); } catch (e) {}                // a cache
      const g = state.treG ? state.treG.kind : null; state.treG = null;
      const out = { coins: BZ_WALLET.balance(c.name) - w0, own: Object.keys(c.avOwned || {}).sort().join() + '|' + Object.keys(c.avMs || {}).sort().join(), own0: own0 + '|', treKind: g,
        rules: SB_AVATARS.list.slice(0, 40).map(a => (avState(a, c) || {}).say).join('|') };
      return out;
    } finally { Math.random = real; } }, r);
  const lo = await run(A.pg, 0.0001);
  const A2 = await boot('regional');
  const hi = await run(A2.pg, 0.9999);
  ok(lo.coins === hi.coins && lo.own === hi.own && lo.rules === hi.rules && lo.treKind === hi.treKind,
    `with Math.random at 0.0001 and at 0.9999 the outcome is the same — coins ${lo.coins}/${hi.coins}, avatars ${lo.own === hi.own ? 'same' : 'DIFFER'}, cache ${lo.treKind}/${hi.treKind}`);
  ok(lo.own !== lo.own0, 'and the milestone path really did record something (so the comparison is not of two empty runs)');

  /* ---- 4. coins buy at the printed price, and never content ---- */
  /* the course is a boot-lazy file since FIX-BEE N2: ask for it and wait, or there is no chapter to try */
  await F.pg.evaluate(() => new Promise(r => { if (window.SB_LAZY) SB_LAZY.need('concepts', () => { try { state.conceptData = null; state.conceptLoading = false; loadConcepts(); } catch (e) {} r(); }); else r(); }));
  const shop = await F.pg.evaluate(() => { const c = active(); const who = walletWho(c); const W = () => BZ_WALLET.balance(who);
    window.confirm = () => true; const out = {};
    const lockedW = THEMES.find(t => !isThemeUnlocked(t.id)); const w0 = W();
    if (lockedW) { app.buyWorld(lockedW.id); out.world = { paid: w0 - W(), opened: isThemeUnlocked(lockedW.id) }; }
    loadConcepts(); const ci = (state.conceptData || []).findIndex((ch, i) => !ch.adv && !isConceptUnlocked(i)); const w1 = W();
    if (ci >= 0) { try { app.buyConcept(ci); } catch (e) {} out.concept = { paid: w1 - W(), opened: isConceptUnlocked(ci) }; }
    const pick = t => SB_AVATARS.list.find(a => SB_AVATARS.tierOf(a) === t && !avOwned(c, a.id) && avState(a, c).state === 'buy');
    const rare = pick('rare'), epic = pick('epic');
    const w2 = W(); app.buyAvatar(rare.id); out.rare = { paid: w2 - W(), price: avState(rare, c).price || 120, own: avOwned(c, rare.id) };
    const w3 = W(); if (epic) app.buyAvatar(epic.id); out.epic = { paid: w3 - W(), own: epic ? avOwned(c, epic.id) : false };
    const leg = SB_AVATARS.list.find(a => SB_AVATARS.tierOf(a) === 'legendary' && !avOwned(c, a.id) && avState(a, c).state !== 'buy');
    const w4 = W(); if (leg) app.buyAvatar(leg.id); out.leg = { paid: w4 - W(), own: leg ? avOwned(c, leg.id) : true };
    out.kept = { race: isThemeUnlocked('race'), ch60: Object.keys(c.unlockedConcepts || {}).length > 0 && Object.keys(c.unlockedConcepts).every(k => isConceptUnlocked(+k)), nebula: avOwned(c, 'nebula') };
    return out; });
  ok(shop.world && shop.world.paid === 240 && shop.world.opened, `a locked world opens for exactly 240 Bizzing coins (${JSON.stringify(shop.world)})`);
  ok(shop.concept && shop.concept.paid === 0 && !shop.concept.opened, 'a locked concept chapter cannot be bought with coins — learning content is never sold');
  ok(shop.rare.paid === 120 && shop.rare.own, `a Rare avatar is bought at exactly its printed price (${shop.rare.paid} of 120)`);
  ok(shop.epic.paid === 250 && shop.epic.own, `an Epic at exactly 250 (${shop.epic.paid})`);
  ok(shop.leg.paid === 0 && !shop.leg.own, 'a Legendary is not for sale until its learning milestone is met');
  ok(shop.kept.race && shop.kept.ch60 && shop.kept.nebula, 'nothing already bought is taken away: a coin-bought world, chapter and legendary stay');

  for (const E of [A, F, A2]) await E.ctx.close();
  await b.close();
  const errs = [...A.errs, ...F.errs, ...A2.errs];
  ok(!errs.length, errs.length ? 'page errors: ' + errs.slice(0, 3).join(' | ') : 'no page errors');
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
