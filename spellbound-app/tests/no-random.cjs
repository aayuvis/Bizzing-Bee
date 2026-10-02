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
ok(spendCalls.length === 1 && /r\.price/.test(spendCalls[0]), 'the ONE coin purchase is an avatar at its printed price (' + spendCalls.join(' | ') + ')');

const seed = (tier) => ({ theme: 'spellbound', mode: 'light', premium: false, activeIdx: 0, pin: '1234',
  children: [{ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'bizzy', theme: 'spellbound', coins: 300, tier,
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

  /* ---- 1. every rare card names its unlock — on a plan that opens every pack ---- */
  const A = await boot('regional');
  await A.pg.evaluate(() => { state.screen = 'app'; state.collTab = 'avatars'; app.openCollection(); });
  await A.pg.waitForTimeout(900);
  const cards = await A.pg.evaluate(() => { const c = active(); const out = { tiles: 0, ruled: 0, bad: [], priced: 0, epicPriced: 0 };
    for (const a of SB_AVATARS.list) { if (a.rarity === 'free' || avOwned(c, a.id)) continue; out.tiles++;
      const btn = document.querySelector('[data-act="showAvCard"][data-arg="' + a.id + '"]'); const tile = btn && btn.parentElement;
      const rule = tile && tile.querySelector('.av-rule'); const t = rule ? rule.innerText : '';
      if (/^(Spell [\d,]+ words right|Master [\d,]+ words?|Finish \d+ Atlas stops?|Reach Level \d+|Master \d+ concepts?)/m.test(t) || /Comes with the plan/.test(t)) out.ruled++;
      else out.bad.push(a.id + ':' + t.slice(0, 40));
      if (/Bizzing|🪙|\d+\s*$/.test(t) && tile.querySelector('[data-act="buyAvatar"]')) { out.priced++; if (a.rarity !== 'rare') out.epicPriced++; } }
    return out; });
  ok(cards.tiles > 80 && cards.ruled === cards.tiles, `every one of ${cards.tiles} unowned rare/epic/legendary cards names how it is won (${cards.ruled})` + (cards.bad.length ? ' — ' + cards.bad.slice(0, 3).join(', ') : ''));
  ok(cards.priced > 20 && cards.epicPriced === 0, `${cards.priced} Rares also show a fixed coin price; no Epic or Legendary is for sale (${cards.epicPriced})`);
  const pop = await A.pg.evaluate(() => { const a = SB_AVATARS.list.find(x => x.rarity === 'legendary' && !avOwned(active(), x.id));
    app.showAvCard(a.id); const ov = document.querySelector('.avc-ov'); const t = ov ? ov.innerText : ''; if (ov) ov.remove(); return t; });
  ok(/Reach Level|Master|Finish|Spell|Comes with the plan/.test(pop), 'the trading card itself says how it is won, under the card');

  /* ---- 2. a free plan: packs say "comes with the plan" — and ask for a grown-up, not money ---- */
  const F = await boot('free');
  await F.pg.evaluate(() => { state.screen = 'app'; state.collTab = 'avatars'; app.openCollection(); });
  await F.pg.waitForTimeout(900);
  const fr = await F.pg.evaluate(() => { const t = document.body.innerText;
    const plan = [...document.querySelectorAll('.av-rule')].filter(e => /Comes with the plan/.test(e.innerText)).length;
    return { plan, price: /\$\s?\d|\/(yr|year|mo|month)\b/.test(t), odds: /\bodds\b|\bdrops?\b|surprise|\d+(\.\d+)?\s?%/i.test(t) }; });
  ok(fr.plan > 50 && !fr.price, `a free child sees ${fr.plan} "comes with the plan" cards and no price in money`);
  ok(!fr.odds, 'and no odds, drops or surprises anywhere on the Avatars tab');
  const ask = await F.pg.evaluate(() => { state.pinDlg = null; state.showTiers = false; const el = document.querySelector('[data-act="askPlan"]'); if (el) el.click();
    return { pin: !!state.pinDlg, sheet: !!document.querySelector('[data-act="closeTiers"]') }; });
  ok(ask.pin && !ask.sheet, 'tapping a plan lock asks for a grown-up (the PIN), never shows the child a price');
  await F.pg.evaluate(() => { state.pinDlg = null; state.showTiers = false; render(); });

  /* ---- 3. chance cannot change any outcome: stub Math.random two ways and compare ---- */
  const run = (pg, r) => pg.evaluate(async (r) => {
    const real = Math.random; Math.random = () => r;
    const c = active(); const w0 = BZ_WALLET.balance(c.name); const own0 = Object.keys(c.avOwned || {}).sort().join();
    try {
      app.buyPack('hive');                                         // the old lottery door
      for (let i = 0; i < 40; i++) c.lists.default.xp++;           // evidence a milestone reads
      grantAvatarMilestones(true);
      try { app.trailTre('meadow:0'); } catch (e) {}                // a cache
      const g = state.treG ? state.treG.kind : null; state.treG = null;
      const out = { coins: BZ_WALLET.balance(c.name) - w0, own: Object.keys(c.avOwned || {}).sort().join(), own0, treKind: g,
        rules: SB_AVATARS.list.slice(0, 40).map(a => (avRule(a, c) || {}).text).join('|') };
      return out;
    } finally { Math.random = real; } }, r);
  const lo = await run(A.pg, 0.0001);
  const A2 = await boot('regional');
  const hi = await run(A2.pg, 0.9999);
  ok(lo.coins === hi.coins && lo.own === hi.own && lo.rules === hi.rules && lo.treKind === hi.treKind,
    `with Math.random at 0.0001 and at 0.9999 the outcome is the same — coins ${lo.coins}/${hi.coins}, avatars ${lo.own === hi.own ? 'same' : 'DIFFER'}, cache ${lo.treKind}/${hi.treKind}`);
  ok(lo.own !== lo.own0, 'and the milestone path really did give something (so the comparison is not of two empty runs)');

  /* ---- 4. coins buy a cosmetic at its printed price, never content ---- */
  /* a FREE child — on a plan every world and chapter is already open, which would prove nothing */
  /* the course is a boot-lazy file since FIX-BEE N2: ask for it and wait, or there is no chapter to try */
  await F.pg.evaluate(() => new Promise(r => { if (window.SB_LAZY) SB_LAZY.need('concepts', () => { try { state.conceptData = null; state.conceptLoading = false; loadConcepts(); } catch (e) {} r(); }); else r(); }));
  const shop = await F.pg.evaluate(() => { const c = active(); const W = () => BZ_WALLET.balance(c.name);
    window.confirm = () => true; const out = {};
    const lockedW = THEMES.find(t => !isThemeUnlocked(t.id)); const w0 = W();
    if (lockedW) { app.buyTheme(lockedW.id); out.world = { coins: W() - w0, opened: isThemeUnlocked(lockedW.id) }; }
    loadConcepts(); const ci = (state.conceptData || []).findIndex((ch, i) => !ch.adv && !isConceptUnlocked(i)); const w1 = W();
    if (ci >= 0) { app.buyConcept(ci); out.concept = { coins: W() - w1, opened: isConceptUnlocked(ci) }; }
    out.kept = { race: isThemeUnlocked('race'), ch60: Object.keys(c.unlockedConcepts || {}).length > 0 && Object.keys(c.unlockedConcepts).every(k => isConceptUnlocked(+k))   /* boot re-indexes old unlocks (cN shift), so read them back */, nebula: avOwned(c, 'nebula') };
    return out; });
  ok(shop.world && shop.world.coins === 0 && !shop.world.opened, 'a locked world cannot be bought with coins — it names its Level instead');
  ok(shop.concept && shop.concept.coins === 0 && !shop.concept.opened, 'a locked concept chapter cannot be bought with coins');
  /* the cosmetic: a Rare in a pack the plan opens */
  const buy = await A.pg.evaluate(() => { const c = active(); const W = () => BZ_WALLET.balance(c.name); window.confirm = () => true; const out = {};
    const rare = SB_AVATARS.list.find(a => a.rarity === 'rare' && !avOwned(c, a.id) && avRule(a, c).kind === 'milestone');
    const epic = SB_AVATARS.list.find(a => a.rarity === 'epic' && !avOwned(c, a.id) && avRule(a, c).kind === 'milestone');
    const w2 = W(); app.buyAvatar(rare.id); out.rare = { paid: w2 - W(), price: rare.price, own: avOwned(c, rare.id) };
    const w3 = W(); app.buyAvatar(epic.id); out.epic = { paid: w3 - W(), own: avOwned(c, epic.id) };
    return out; });
  Object.assign(shop, buy);
  ok(shop.rare.paid === shop.rare.price && shop.rare.own, `a Rare avatar is bought at exactly its printed price (${shop.rare.paid} of ${shop.rare.price})`);
  ok(shop.epic.paid === 0 && !shop.epic.own, 'an Epic is not for sale at any price — it is won by its milestone');
  ok(shop.kept.race && shop.kept.ch60 && shop.kept.nebula, 'nothing already bought is taken away: a coin-bought world, chapter and legendary stay');

  /* the Worlds tab and the Concepts library show no price on anything locked */
  await F.pg.evaluate(() => { state.collTab = 'worlds'; app.openCollection(); }); await F.pg.waitForTimeout(500);
  const wt = await F.pg.evaluate(() => [...document.querySelectorAll('[data-act="buyTheme"]')].map(e => e.innerText).join(' || '));
  ok(wt.length && /Reach Level \d+/.test(wt) && !/🪙|Unlock ·|\b400\b/.test(wt), 'locked worlds say which Level opens them, and carry no price');

  for (const E of [A, F, A2]) await E.ctx.close();
  await b.close();
  const errs = [...A.errs, ...F.errs, ...A2.errs];
  ok(!errs.length, errs.length ? 'page errors: ' + errs.slice(0, 3).join(' | ') : 'no page errors');
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
