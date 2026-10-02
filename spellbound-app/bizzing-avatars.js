/* bizzing-avatars.js — CLASSIC-SCRIPT PORT of the family avatar engine (FAMILY-STANDARD §8).

   Ported from aayuvis/Bizzing_Schedule, integration/bizzing-avatars.js at 7f9647e. The original
   is an ES module, and <script type="module"> does not load over file://, which is how Bizzing
   Bee runs — so the exports hang on window.BZ_AVATARS instead and `spend`/`balance` come from
   window.BZ_WALLET (Bee's port of bizzing-wallet.js). The logic and every constant are the
   original's, line for line; TIERS and SHAPE are frozen so no caller can reprice a tier.
   tests/family-dropins.cjs runs this port and the original side by side and fails on any
   difference. If the engine changes upstream, re-port it from there; never edit this copy.

   Each app keeps its OWN 96 avatars (12 packs × 8). What is shared is the engine: the four
   tiers, their prices and colours, the shape of a pack, how a face is unlocked, and the night
   glow (bizzing-avatars.css).

     BZ_AVATARS.validate(CATALOGUE)                          // [] or a list of what is wrong
     BZ_AVATARS.stateOf(av, { owned, worlds, plan, milestones, who })  // what the card says
     BZ_AVATARS.buy('bee', 'Anaya', av, ctx)                 // pays through BZ_WALLET
     BZ_AVATARS.buyWorld('bee', 'Anaya', 3, ctx)             // 240 coins opens world 3

   A catalogue entry: { id, name, pack: 1..12, tier: 'common'|'rare'|'epic'|'legendary', art,
   world?: n, milestone?: { id, label }, real?, about?, sacred? }. Ownership stays in Bee's own
   household (c.avOwned); this file never writes it. */
(function () {
  'use strict';
  const W = () => window.BZ_WALLET;
  const spend = (...a) => (W() ? W().spend(...a) : false);
  const balance = (who) => (W() ? W().balance(who) : 0);

  const TIERS = Object.freeze({
    common:    Object.freeze({ label: 'Common',    price: 0,   colour: '#7B8794' }),
    rare:      Object.freeze({ label: 'Rare',      price: 120, colour: '#3D7DF0' }),
    epic:      Object.freeze({ label: 'Epic',      price: 250, colour: '#B14FC4' }),
    legendary: Object.freeze({ label: 'Legendary', price: 500, colour: '#F0B429' }),
  });
  const PACKS = 12;
  const PER_PACK = 8;
  const SHAPE = Object.freeze({ common: 2, rare: 3, epic: 2, legendary: 1 });
  const FREE_WORLDS = 2;
  const WORLD_PRICE = 240;
  const worldOf = (av) => (Number.isInteger(av.world) ? av.world : Math.ceil(av.pack / 2));
  const has = (x, id) => (x instanceof Set ? x.has(id) : Array.isArray(x) && x.includes(id));
  const worldOpen = (n, ctx = {}) => n <= FREE_WORLDS || ctx.plan === 'family' || has(ctx.worlds, n);

  function validate(cat) {
    const err = [];
    if (!Array.isArray(cat)) return ['catalogue is not a list'];
    if (cat.length !== PACKS * PER_PACK) err.push(`${cat.length} avatars, need ${PACKS * PER_PACK}`);
    const ids = new Set();
    for (const a of cat) {
      if (!a || !a.id) { err.push('an avatar has no id'); continue; }
      if (ids.has(a.id)) err.push(`${a.id}: duplicate id`);
      ids.add(a.id);
      if (!(a.tier in TIERS)) err.push(`${a.id}: unknown tier ${a.tier}`);
      if (!Number.isInteger(a.pack) || a.pack < 1 || a.pack > PACKS) err.push(`${a.id}: pack ${a.pack} out of 1–${PACKS}`);
      if (!a.name) err.push(`${a.id}: no name`);
      if (!a.art) err.push(`${a.id}: no art`);
      if (a.real && !a.about) err.push(`${a.id}: a real person needs a one-line about`);
      if ('price' in a && a.price !== TIERS[a.tier]?.price) err.push(`${a.id}: price ${a.price} is not the ${a.tier} price`);
      if ('world' in a && !(Number.isInteger(a.world) && a.world >= 1)) err.push(`${a.id}: world ${a.world} is not a world number`);
      if (a.tier === 'legendary' && !(a.milestone && a.milestone.id && a.milestone.label)) err.push(`${a.id}: a legendary must name its milestone`);
    }
    for (let p = 1; p <= PACKS; p++) {
      const inPack = cat.filter((a) => a && a.pack === p);
      if (inPack.length !== PER_PACK) err.push(`pack ${p}: ${inPack.length} avatars, need ${PER_PACK}`);
      for (const [t, n] of Object.entries(SHAPE)) {
        const got = inPack.filter((a) => a.tier === t).length;
        if (got !== n) err.push(`pack ${p}: ${got} ${t}, need ${n}`);
      }
    }
    return err;
  }

  /* What the card shows. ctx = { owned: ids, worlds: world numbers bought, plan: 'free'|'family', milestones: ids, who } */
  function stateOf(av, ctx = {}) {
    const t = TIERS[av.tier];
    const base = { tier: av.tier, label: t.label, colour: t.colour, price: t.price };
    if (av.tier === 'common' || has(ctx.owned, av.id)) return { ...base, state: 'owned', say: av.tier === 'common' ? 'Free for everyone' : 'Yours' };
    if (!worldOpen(worldOf(av), ctx)) return { ...base, state: 'world', world: worldOf(av), say: 'Opens with its world' };
    if (av.tier === 'legendary' && !has(ctx.milestones, av.milestone.id)) return { ...base, state: 'milestone', say: `First: ${av.milestone.label}` };
    const short = ctx.who ? Math.max(0, t.price - balance(ctx.who)) : 0;
    return { ...base, state: 'buy', say: short ? `${t.price} coins · ${short} more to go` : `${t.price} coins`, short };
  }

  /* Pays through the family wallet. Returns true if paid; the app then records ownership. */
  function buy(app, who, av, ctx = {}, now = Date.now()) {
    const s = stateOf(av, { ...ctx, who });
    if (s.state !== 'buy' || s.short) return false;
    return spend(app, who, s.price, `avatar:${av.id}`, now);
  }

  /* Opens world n (3–6) for 240 coins. Returns true if paid; the app records the world as open. */
  function buyWorld(app, who, n, ctx = {}, now = Date.now()) {
    if (!Number.isInteger(n) || n < 1 || worldOpen(n, ctx)) return false;
    return spend(app, who, WORLD_PRICE, `world:${n}`, now);
  }

  /* A sacred figure is never drawn as a villain: call with the ids of any villain packs. */
  function sacredSafe(cat, villainPacks = []) {
    return cat.filter((a) => a.sacred && villainPacks.includes(a.pack)).map((a) => `${a.id}: a sacred figure in a villain pack`);
  }

  window.BZ_AVATARS = Object.freeze({ TIERS, PACKS, PER_PACK, SHAPE, FREE_WORLDS, WORLD_PRICE,
    worldOf, worldOpen, validate, stateOf, buy, buyWorld, sacredSafe });
})();
