/* THE ECONOMY: COINS BUY LOOKS, AT ONE TABLE'S PRICES, ONCE (road to 4.5, P3.17–P3.20).            @check

   The brief's exit gate: "a week-one child has at least five things costing 20–60 coins to save for" and "coins are only
   ever spent on cosmetics, never on a word, a game or a level". The owner's call: no hats or props on avatars — the sinks
   are card frames, name plates, backgrounds and Grand Prix kart/trail skins. What this holds, in node, from the shipped
   source (the SHOP_ITEMS block of app3.js run as the page runs it, beside the real family wallet, bizzing-wallet.js):
     1. the ONE price table: every row is a look of a kind in SHOP_KINDS, which is the five looks and nothing else; every
        row carries only the fields a look has (no unlock / word / game / mode / level / list field can be added
        quietly); ids are unique per kind; a price is a whole number; a milestone row has no price;
     2. at least FIVE rows a week-one child can save for at 20–60 coins (sold for coins, no milestone first);
     3. every purchase through shopBuy debits EXACTLY its printed price ONCE — one ledger line, -price, named by the
        row — and a second buy, a short purse, a free row or a milestone row debits nothing; the row is then owned and
        worn;
     4. a purchase writes ONLY the look it bought: every other field of the child (lists, the Atlas, mastery, worlds,
        concepts, word lists, avatars) is byte-identical after it;
     5. EVERY coin spend in the shipped code is a look: each call of spendCoins / shopBuy / a wallet spend is one this
        test knows (an avatar, a world, a row of the table) — a new spend path fails here until it is named;
     6. prices are authored in ONE place: no numeric `price:` outside the table in app3*.js, saga2.js or family-shell.js,
        and the Grand Prix garage prints none (T3: no price on a child's screen outside the Shop).
   Proved by breaking (each fault put in, the test watched to fail, the fault taken out) — see CLAUDE.md
   "Road to 4.5, P3 — shell, economy, search".
   Run: node tests/shop-economy.cjs                                                                                 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.env.SRC || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

/* ---- the table, run as the page runs it ---- */
const app3 = read('app3.js');
const A = app3.indexOf('const SHOP_KINDS='), Z = app3.indexOf("/* a child's name on the plate", A);
ok(A > 0 && Z > A, 'app3.js carries the one price table (SHOP_KINDS … shopBuy)');
const store = new Map();
const ctx = { window: {}, Date, JSON, Math, Object, Array, String, Number };
ctx.window = ctx; ctx.SB_STORE = { getKey: (k) => (store.has(k) ? store.get(k) : null), setKey: (k, v) => { store.set(k, String(v)); return true; } };
ctx.active = () => { throw new Error('the table read the page\'s active child — it must use the child it is handed'); };
vm.createContext(ctx);
vm.runInContext(read('bizzing-wallet.js'), ctx);
vm.runInContext(app3.slice(A, Z) + '\n;window.__T={SHOP_KINDS,SHOP_ITEMS,SHOP_BY,shopBuy,shopOwns,shopWorn,shopWear};', ctx);
const T = ctx.__T, W = ctx.BZ_WALLET;

/* 1. every row a look, with a look's fields only */
const LOOKS = ['frame', 'plate', 'bg', 'kart', 'trail'];
const FIELDS = new Set(['k', 'id', 'name', 'price', 'about', 'col', 'ms']);
ok(T.SHOP_KINDS.length === LOOKS.length && T.SHOP_KINDS.every((k) => LOOKS.includes(k)), `SHOP_KINDS is the five looks and nothing else: ${T.SHOP_KINDS.join(', ')}`);
const badKind = T.SHOP_ITEMS.filter((x) => !T.SHOP_KINDS.includes(x.k));
ok(!badKind.length, `every row is a look of a known kind (${badKind.map((x) => x.k + ':' + x.id).join(' ') || 'all ' + T.SHOP_ITEMS.length})`);
const badField = T.SHOP_ITEMS.flatMap((x) => Object.keys(x).filter((f) => !FIELDS.has(f)).map((f) => x.k + ':' + x.id + '.' + f));
ok(!badField.length, `no row carries anything but a look's fields — no unlock, word, game, mode or level (${badField.join(' ') || 'clean'})`);
const keys = T.SHOP_ITEMS.map((x) => x.k + ':' + x.id);
ok(new Set(keys).size === keys.length, 'every row is unique (kind:id)');
const badPrice = T.SHOP_ITEMS.filter((x) => (x.ms ? x.price != null : !(Number.isInteger(x.price) && x.price >= 0)));
ok(!badPrice.length, `a sold row has a whole-number price and a milestone row has none (${badPrice.map((x) => x.k + ':' + x.id).join(' ') || 'all'})`);

/* 2. five things a week-one child can save for at 20–60 */
const week1 = T.SHOP_ITEMS.filter((x) => !x.ms && x.price >= 20 && x.price <= 60);
ok(week1.length >= 5, `a week-one child has ${week1.length} looks costing 20–60 coins to save for (≥ 5): ${week1.map((x) => x.name + ' ' + x.price).join(', ')}`);
const kinds1 = new Set(week1.map((x) => x.k));
ok(kinds1.size >= 4, `…across ${kinds1.size} kinds of look, not one shelf (${[...kinds1].join(', ')})`);

/* 3 + 4. a purchase debits exactly its price, once, and writes only the look */
const SNAP = { name: 'Wren', lists: { default: { xp: 40 } }, trail: { lap: 1, done: { u1: { 1: 90 } } }, mast: { cat: { b: 2 } }, unlockedThemes: ['spellbound'],
  unlockedConcepts: { 3: 1 }, unlockedLists: {}, avOwned: { fox: 1 }, avatar: 'fox', coins: 0, missed: [{ w: 'rhythm' }], gpStat: { right: 3, clean: 1, cups: 0 } };
const LOOK_STORES = new Set(['frames', 'frame', 'cos', 'gpGar']);
let n = 0; const bad = [];
for (const it of T.SHOP_ITEMS) {
  const key = it.k + ':' + it.id; store.clear(); W.migrateFrom('bee', 'Wren', 500);
  const c = JSON.parse(JSON.stringify(SNAP)); const before = JSON.stringify(Object.fromEntries(Object.entries(c).filter(([k]) => !LOOK_STORES.has(k))));
  const spend = (p, why) => W.spend('bee', 'Wren', p, why);
  const b0 = W.balance('Wren'), l0 = W.ledger('Wren').length;
  const r = T.shopBuy(c, key, spend);
  const b1 = W.balance('Wren'), L = W.ledger('Wren').slice(l0);
  if (it.ms || !it.price) {
    if (r.ok || b1 !== b0 || L.length) bad.push(key + ': a ' + (it.ms ? 'milestone' : 'free') + ' row was sold');
    continue;
  }
  n++;
  if (!r.ok) { bad.push(key + ': did not sell with 500 in the purse (' + r.why + ')'); continue; }
  if (b0 - b1 !== it.price) bad.push(key + ': debited ' + (b0 - b1) + ', price ' + it.price);
  if (L.length !== 1 || L[0].n !== -it.price || L[0].why !== key) bad.push(key + ': ledger ' + JSON.stringify(L));
  if (!T.shopOwns(c, it) || !T.shopWorn(c, it.k) || T.shopWorn(c, it.k).id !== it.id) bad.push(key + ': not owned and worn after the buy');
  const r2 = T.shopBuy(c, key, spend);
  if (r2.ok || W.balance('Wren') !== b1 || W.ledger('Wren').length !== l0 + 1) bad.push(key + ': a second buy charged again');
  const after = JSON.stringify(Object.fromEntries(Object.entries(c).filter(([k]) => !LOOK_STORES.has(k))));
  if (after !== before) bad.push(key + ': the buy wrote more than the look');
  /* a short purse buys nothing and owns nothing */
  store.clear(); W.migrateFrom('bee', 'Wren', it.price - 1);
  const c3 = JSON.parse(JSON.stringify(SNAP)); const r3 = T.shopBuy(c3, key, spend);
  if (r3.ok || W.balance('Wren') !== it.price - 1 || T.shopOwns(c3, it)) bad.push(key + ': a short purse bought it');
}
ok(n >= 20 && !bad.length, `every sold row (${n}) debits exactly its printed price once, owns and wears it, writes only the look; a second buy, a short purse, a free or a milestone row debit nothing${bad.length ? ' — ' + bad.slice(0, 4).join(' | ') : ''}`);

/* 5. every coin spend in the shipped code is a look the test knows */
const shipped = fs.readdirSync(ROOT).filter((f) => /\.js$/.test(f) && !/^(words-|trivia-q|voice-|sw\.js$)/.test(f));
const KNOWN = [
  [/^function spendCoins\(/, 'the one spend door (app3.js)'],
  [/W\.spend\(BEE_APP, walletWho\(c\), n, why\|\|'bee shop'\)/, 'spendCoins → the family wallet'],
  [/spendCoins\(s\.price,'avatar:'\+id\)/, 'an avatar (the ?demo purse)'],
  [/spendCoins\(WORLD_PRICE_COINS,'world:'\+n\)/, 'a world (the ?demo purse)'],
  [/shopBuy\(c,key,spendCoins\)/, 'a row of the table (the Shop)'],
  [/^function shopBuy\(/, 'the one buy (app3.js)'],
  [/if\(!spend\(it\.price,key\)\)/, 'shopBuy pays the row\'s own price'],
  [/const spend = \(\.\.\.a\) => \(W\(\) \? W\(\)\.spend\(\.\.\.a\) : false\)/, 'the avatar engine (avatars and worlds, bizzing-avatars.js)'],
  [/function spend\(app, who, price, why, now = Date\.now\(\)\)/, 'the wallet itself'],
  [/return spend\(app, who, s\.price, `avatar:\$\{av\.id\}`, now\)/, 'the avatar engine buys an avatar at its tier price'],
  [/return spend\(app, who, WORLD_PRICE, `world:\$\{n\}`, now\)/, 'the avatar engine opens a world at its price'],
];
const unknown = [];
for (const f of shipped) {
  /* block comments go (their newlines stay, so line numbers hold): a comment describes a spend, it does not make one */
  const lines = read(f).replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).split('\n');
  lines.forEach((ln, i) => {
    const t = ln.trim(); if (/^(\*|\/\/|\/\*)/.test(t)) return;   /* a comment line describes, it does not spend */
    if (!/spendCoins\(|\bshopBuy\(|\.spend\(|\bspend\(/.test(t)) return;
    if (!KNOWN.some(([re]) => re.test(t))) unknown.push(f + ':' + (i + 1) + ' ' + t.slice(0, 90));
  });
}
ok(!unknown.length, `every coin spend in the shipped code is an avatar, a world or a row of the table (${shipped.length} files)${unknown.length ? ' — unknown: ' + unknown.slice(0, 4).join(' | ') : ''}`);

/* 6. one place for prices; the garage prints none */
const priced = [];
for (const f of ['saga2.js', 'family-shell.js'].concat(fs.readdirSync(ROOT).filter((x) => /^app3(-[a-z0-9-]+)?\.js$/.test(x)))) {
  const t = read(f); const re = /price\s*:\s*[1-9]\d*/g; let m;
  while ((m = re.exec(t))) if (!(f === 'app3.js' && m.index > A && m.index < Z)) priced.push(f + '@' + m.index);
}
ok(!priced.length, `prices are authored in one table — no numeric price outside SHOP_ITEMS (${priced.join(' ') || 'none'})`);
const saga = read('saga2.js'); const g0 = saga.indexOf('/* THE GARAGE:'), g1 = saga.indexOf('W().SB_GP=', g0);
const gar = saga.slice(g0, g1);
ok(g0 > 0 && /window\.SB_SHOP/.test(gar) && !/spendCoins|\+\s*' ?coins'|Buy ·|data-gp-buy/.test(gar),
  'the Grand Prix garage reads the table (window.SB_SHOP), spends nothing and prints no price — it opens the Shop');

console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
process.exit(fails ? 1 : 0);
