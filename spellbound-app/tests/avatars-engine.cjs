/* 96 AVATARS, 12 × 8, THROUGH THE FAMILY ENGINE (FIX-BEE v2, FAMILY-STANDARD §7–§8).   @check

   What a child (and a parent) can rely on, checked in the running app:
     • validate(catalogue) is [] — 96 in 12 packs of 2 Common · 3 Rare · 2 Epic · 1 Legendary, every
       Legendary names its milestone, every real person has a one-line about; sacredSafe() is [] and
       no sacred figure sits in the Villains pack.
     • every card prints the ENGINE's words for its path (stateOf().say) — never "ask a grown-up".
     • a FREE child can buy: Commons are free, a Rare in world 1–2 is 120 coins, an Epic 250, a
       Legendary 500 once its milestone is met; a pack in a closed world says "Opens with its world".
     • a world opens for 240 coins through buyWorld, and opens its packs with it; the family plan
       opens every world.
     • every price on the Shop is printed, and fixed; nothing changes with Math.random.
     • an avatar from a pack that has left Bee (Turbo, Origami…) still renders for the child who owns it.
   Proved by breaking: put Naga in the Villains pack, drop a Legendary's milestone, or price a Rare at
   125 in the port — each fails here.                                                               */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const SRC = process.env.SRC || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const seed = { theme: 'spellbound', mode: 'light', premium: false, activeIdx: 0, pin: '2468',
  children: [{ name: 'Wren', age: 9, ageBand: '8-10', avatar: 'bizzy', theme: 'spellbound', coins: 0, xp: 10, level: 1,
    lists: { default: { xp: 10 } }, activeList: 'default', questPath: 'journey', missed: [], unlockedThemes: [], unlockedConcepts: {}, unlockedLists: {},
    avOwned: { turbo: 1 }, trail: { lap: 1, done: {}, chk: {}, seen: {}, elap: 1, edone: {}, echk: {} } }] };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p)) });
  const ctx = await b.newContext({ viewport: { width: 1200, height: 900 } });
  await ctx.addInitScript(s => { try { if (!localStorage.getItem('sb_t_seeded')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_t_seeded', '1'); localStorage.setItem('sb_splash', '0');
    localStorage.setItem('bizzing.wallet', JSON.stringify({ v: 1, kids: { wren: { coins: 1200, ledger: [{ a: 'maths', t: Date.now() - 864e5 * 3, n: 1200, why: 'migrated' }] } } })); } } catch (e) {} }, seed);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + SRC + '/index.html'); await pg.waitForTimeout(2800);
  await pg.evaluate(() => { state.screen = 'app'; state.nav = 'home'; window.confirm = () => true; render(); });

  /* ---- the catalogue ---- */
  const cat = await pg.evaluate(() => { const C = SB_AVATARS.catalogue();
    return { n: C.length, packs: SB_AVATARS.packs.length, v: BZ_AVATARS.validate(C), sacred: BZ_AVATARS.sacredSafe(C, SB_AVATARS.villainPacks()),
      legends: C.filter(a => a.tier === 'legendary').map(a => a.milestone && a.milestone.label), real: C.filter(a => a.real).map(a => a.id + ':' + (a.about || '').length),
      villains: SB_AVATARS.list.filter(a => a.pack === 'villains').map(a => a.id + (a.sacred ? '!' : '')),
      gone: ['turbo', 'origami', 'bigbeasts', 'elements', 'critter', 'vibe'].filter(p => SB_AVATARS.packs.some(x => x.id === p)),
      champions: SB_AVATARS.list.filter(a => a.pack === 'champions').length,
      starter: /Starter/.test(JSON.stringify(SB_AVATARS.rarities)) }; });
  ok(cat.n === 96 && cat.packs === 12 && cat.v.length === 0, `validate(catalogue) is [] — 96 avatars in 12 packs (${cat.n}, ${cat.packs}) ${JSON.stringify(cat.v.slice(0, 3))}`);
  ok(cat.sacred.length === 0 && !cat.villains.some(x => x.endsWith('!')), 'sacredSafe() is [] — no sacred figure is a villain: ' + cat.villains.join(' '));
  ok(cat.legends.length === 12 && cat.legends.every(Boolean), 'all 12 Legendaries name a learning milestone: ' + cat.legends.slice(0, 4).join(' · ') + '…');
  ok(cat.real.length >= 13 && cat.real.every(x => +x.split(':')[1] > 20), `every real person carries a one-line about (${cat.real.length})`);
  ok(!cat.gone.length && cat.champions === 8, 'Turbo, Origami, Big Beasts, Elements, Critter Crew and Vibe have left the store; Spelling Champions is 8');
  ok(!cat.starter, '"Starter" is called "Common" now');

  /* ---- every card says its path, in the engine's words ---- */
  const cards = await pg.evaluate(async () => { state.collTab = 'avatars'; app.openCollection(); await new Promise(r => setTimeout(r, 400));
    const out = { n: 0, match: 0, bad: [], plan: 0 };
    document.querySelectorAll('.bz-av[data-av]').forEach(el => { out.n++; const a = SB_AVATARS.byId[el.dataset.av]; const s = avState(a);
      const say = el.querySelector('.bz-av-say').innerText.trim(); const want = avOwned(active(), a.id) ? (a.rarity === 'free' ? 'Free for everyone' : 'Yours') : s.say;
      if (say === want) out.match++; else out.bad.push(a.id + ': ' + say + ' ≠ ' + want);
      if (/ask a grown-up|comes with the plan/i.test(el.innerText)) out.plan++; });
    return out; });
  ok(cards.n === 96 && cards.match === 96, `the Collection shows all 96, each with the engine's own words for its path (${cards.match}/${cards.n}) ${cards.bad.slice(0, 2).join(' | ')}`);
  ok(cards.plan === 0, 'no card says "ask a grown-up" or "comes with the plan"');

  /* ---- a FREE child buys ---- */
  const buy = await pg.evaluate(() => { const c = active(); const W = () => BZ_WALLET.balance('Wren'); const out = {};
    const say = id => avState(SB_AVATARS.byId[id]).say;
    out.common = say('honeypot'); out.rare1 = say('waggle'); out.rare3 = say('ninja'); out.leg = say('queenhive');
    let w = W(); app.buyAvatar('waggle'); out.rarePaid = w - W(); out.rareOwn = avOwned(c, 'waggle');
    w = W(); app.buyAvatar('blossom'); out.epicPaid = w - W();
    w = W(); app.buyAvatar('ninja'); out.closedPaid = w - W(); out.closedOwn = avOwned(c, 'ninja');
    w = W(); app.buyAvatar('queenhive'); out.legNoMs = w - W();
    c.avMs = { 'av-queenhive': 1 }; out.legSay = say('queenhive');
    w = W(); app.buyAvatar('queenhive'); out.legPaid = w - W();
    return out; });
  ok(buy.common === 'Free for everyone', 'a Common says "Free for everyone"');
  ok(/^120 coins/.test(buy.rare1) && buy.rarePaid === 120 && buy.rareOwn, `a Rare in world 1 is ${buy.rare1} — and a free child buys it for exactly 120`);
  ok(buy.epicPaid === 250, 'an Epic in an open world is exactly 250');
  ok(/^Opens with its world/.test(buy.rare3) && buy.closedPaid === 0 && !buy.closedOwn, `a Rare in a closed world says "${buy.rare3}" and cannot be bought`);
  ok(/^First: /.test(buy.leg) && buy.legNoMs === 0, `a Legendary waits for its milestone first — "${buy.leg}"`);
  ok(/^500 coins/.test(buy.legSay) && buy.legPaid === 500, 'once the milestone is met it is 500, and it is bought for exactly that');

  /* ---- worlds: 240 coins through buyWorld, and the packs open with them ---- */
  const wd = await pg.evaluate(() => { const c = active(); const W = () => BZ_WALLET.balance('Wren'); const out = {};
    out.before = ['spellbound', 'aurora', 'anime', 'dino'].map(id => isThemeUnlocked(id));
    const w = W(); app.buyWorld('anime'); out.paid = w - W(); out.open = isThemeUnlocked('anime'); out.ninja = avState(SB_AVATARS.byId.ninja).say;
    const l = BZ_WALLET.ledger('Wren').slice(-1)[0]; out.line = l.why;
    const w2 = W(); app.buyWorld('anime'); out.again = w2 - W();
    state.premium = true; out.family = ['science', 'godly', 'race', 'dino'].every(id => isThemeUnlocked(id)); state.premium = false;
    return out; });
  ok(JSON.stringify(wd.before) === '[true,true,false,false]', 'worlds 1–2 (Bizzing Bee, Galaxy) are open to everyone; 3+ are not');
  ok(wd.paid === 240 && wd.open && wd.line === 'world:3' && wd.again === 0, `Blade (world 3) opens for exactly 240 coins, once (${wd.paid}, ledger "${wd.line}")`);
  ok(/^120 coins/.test(wd.ninja), 'and its pack opens with it — Shadow Ninja is ' + wd.ninja);
  ok(wd.family, 'the family plan opens every world');

  /* ---- the Shop: every price printed, fixed; three kinds of thing to buy ---- */
  const shop = await pg.evaluate(async () => { const out = {};
    for (const t of ['avatars', 'worlds', 'extras']) { app.openShop(t); await new Promise(r => setTimeout(r, 200));
      out[t] = [...document.querySelectorAll('[data-act="buyAvatar"],[data-act="buyWorld"],[data-act="buyFrame"]')].map(e => e.innerText.replace(/\s+/g, ' ').trim()); }
    out.money = /\$\s?\d|£\s?\d|€\s?\d|\/(yr|year|mo|month)\b|ask a grown-up/i.test(document.body.innerText); return out; });
  ok(shop.avatars.length > 10 && shop.avatars.every(t => /^\d+$/.test(t)), `avatar prices are printed on every buy button (${shop.avatars.slice(0, 4).join(', ')}…)`);
  ok(shop.worlds.length >= 4 && shop.worlds.every(t => /^240 coins$/.test(t)), 'every locked world prints 240 coins');
  ok(shop.extras.length === 6 && shop.extras.every(t => /^\d+ coins$/.test(t)), 'six frames, each with its price — three kinds of thing to buy (avatars, worlds, frames)');
  ok(!shop.money, 'no real money, plan button or "ask a grown-up" anywhere in the Shop');
  const fr = await pg.evaluate(() => { const c = active(); const w = BZ_WALLET.balance('Wren'); app.buyFrame('honey'); const paid = w - BZ_WALLET.balance('Wren');
    render(); return { paid, own: frameOwned(c, 'honey'), worn: c.frame, top: !!document.querySelector('.sb-fam-kid .bz-frame-honey, .bz-dr-av .bz-frame-honey, .bz-frame-honey') }; });
  ok(fr.paid === 40 && fr.own && fr.worn === 'honey', 'a frame is bought at its printed price and worn at once');

  /* ---- an avatar from a pack that left Bee still renders for the child who owns it ---- */
  const old = await pg.evaluate(() => ({ live: SB_AVATARS.list.some(a => a.id === 'turbo'), art: !!SB_AVATAR('turbo', 64), own: avOwned(active(), 'turbo') }));
  ok(!old.live && old.art && old.own, 'Turbo left the store, and the child who owns it still has it, drawn');

  /* ---- night: the tier glows (bizzing-avatars.css + data-bz-dark) ---- */
  const glow = await pg.evaluate(async () => { app.setModePref('dusk'); state.collTab = 'avatars'; app.openCollection(); await new Promise(r => setTimeout(r, 300));
    const el = document.querySelector('.bz-av[data-tier="legendary"]'); const g = el ? getComputedStyle(el).boxShadow : ''; app.setModePref('light');
    return { dark: true, g }; });
  ok(!!glow.g && glow.g !== 'none', 'in the dark the tier glows (Legendary box-shadow: ' + glow.g.slice(0, 40) + '…)');

  /* ---- chance changes nothing ---- */
  const r = await pg.evaluate(() => { const real = Math.random; const out = [];
    for (const v of [0.0001, 0.9999]) { Math.random = () => v; out.push(SB_AVATARS.list.map(a => avState(a).say).join('|')); }
    Math.random = real; return out[0] === out[1]; });
  ok(r, 'with Math.random at 0.0001 and at 0.9999 every card says the same thing');

  /* J7: the card shows the child's own evidence — no OVR score, no invented stat bars */
  const j7 = await pg.evaluate(() => { const c = active(); const id = c.avatar || 'bizzy'; c.avEv = {};
    const before = SB_AV_CARD_HTML(id, { owned: true }); addCoins('answer'); addCoins('answer'); addCoins('stop');
    const after = SB_AV_CARD_HTML(id, { owned: true }); const ev = SB_AV_EVIDENCE(id);
    const sacred = SB_AVATARS.list.filter(a => a.pack === 'godsin').map(a => SB_AV_CARD_HTML(a.id, { owned: true })).join('');
    return { ovr: /OVR|Stamina|Coolness/.test(before + after + sacred), ev, shows: /Words spelled right with[^<]*<\/span><b class="avc-stat-v">2</.test(after), empty: /will show here/.test(before) }; });
  ok(!j7.ovr, 'no avatar card — sacred figures included — prints an OVR score or invented stat bars');
  ok(j7.empty && j7.shows && j7.ev && j7.ev.r === 2 && j7.ev.s === 1, `the card shows what the child did wearing it (${JSON.stringify(j7.ev)})`);
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good');
  process.exit(fails ? 1 : 0);
})();
