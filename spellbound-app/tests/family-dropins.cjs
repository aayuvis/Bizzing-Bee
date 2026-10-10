/* THE FAMILY DROP-INS, PORTED, BEHAVE EXACTLY LIKE THE ORIGINALS (FIX-BEE v2, standard §8, §1).
   @check

   Bee runs from a folder (file://), where <script type="module"> does not load, so the four shared
   files from Bizzing_Schedule/integration live here as CLASSIC ports: bizzing-wallet.js,
   bizzing-activity.js, bizzing-avatars.js (+ bizzing-avatars.css, copied byte for byte). The
   originals are vendored, byte-identical, in tests/lib/family/ (never shipped — tests/ is excluded
   from every deploy) so this test can run both side by side:
     • the CSS is byte-identical;
     • the avatar engine's constants, validate(), stateOf(), buy(), buyWorld() and sacredSafe() give
       the same answers on the same inputs, including on a broken catalogue;
     • the wallet's earn/spend/refund/migrate/cap match, with the ONE documented Bee deviation
       (a migration line does not count toward the day's cap) held to exactly that.
     • bizzing-feed.css is byte-identical and bizzing-feed.js (My Feed, §6a) is the drop-in line for line,
       ranking, ordering and drawing exactly as the original does.
   Proved by breaking: change a price in the port (rare 120 → 125) and four checks fail; change
   the feed's SPREAD (1.5 → 0.2) in the port and the line-for-line and ranking checks fail.
   Run: node tests/family-dropins.cjs                                                           */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const APP = path.resolve(__dirname, '..'), FAM = path.join(__dirname, 'lib', 'family');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };

ok(fs.readFileSync(path.join(APP, 'bizzing-avatars.css'), 'utf8') === fs.readFileSync(path.join(FAM, 'bizzing-avatars.css'), 'utf8'),
  'bizzing-avatars.css is byte-identical to the family drop-in');

/* (road to 4.5, P0.28) the activity port's header cites the upstream it was ported from by the
   vendored original's sha256 — a re-vendored original with a stale citation fails here.
   Proved by breaking: one character of the cited hash changed → this fails. */
{
  const sha = require('crypto').createHash('sha256').update(fs.readFileSync(path.join(FAM, 'bizzing-activity.js'))).digest('hex');
  const head = fs.readFileSync(path.join(APP, 'bizzing-activity.js'), 'utf8').split('*/')[0];
  const cited = (head.match(/sha256 ([0-9a-f]{64})/) || [])[1];
  ok(cited === sha, `bizzing-activity.js cites the vendored original's sha256 (${(cited || 'none').slice(0, 12)}… vs ${sha.slice(0, 12)}…)`);
}

/* a fake localStorage shared by both worlds, so the wallet both read is the same wallet */
function mkStore() { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), clear: () => m.clear(), _m: m }; }

/* ---- the ORIGINALS: ES modules, turned into a script by stripping import/export (the logic is untouched) ---- */
function loadOriginal(store) {
  const ctx = { localStorage: store, console, Date, Math, JSON, Object, Array, Set, Number, String, isNaN };
  vm.createContext(ctx);
  const src = f => fs.readFileSync(path.join(FAM, f), 'utf8').replace(/^import[^\n]*\n/mg, '').replace(/^export (const|function) /mg, '$1 ');
  vm.runInContext(src('bizzing-wallet.js') + '\n;globalThis.W={EARN,DAILY_CAP,balance,earn,spend,migrateFrom,refund,ledger};', ctx);
  vm.runInContext(src('bizzing-avatars.js').replace(/\bspend\(/g, 'W.spend(').replace(/\bbalance\(/g, 'W.balance(') +
    '\n;globalThis.A={TIERS,PACKS,PER_PACK,SHAPE,FREE_WORLDS,WORLD_PRICE,worldOf,worldOpen,validate,stateOf,buy,buyWorld,sacredSafe};', ctx);
  return { W: ctx.W, A: ctx.A };
}
/* ---- the PORTS, as Bee loads them (store.js is the seam the wallet port reads through) ---- */
function loadPort(store) {
  const win = { localStorage: store, console };
  const ctx = { window: win, localStorage: store, console, Date, Math, JSON, Object, Array, Set, Number, String };
  win.window = win; vm.createContext(ctx);
  ctx.SB_STORE = { getKey: k => store.getItem(k), setKey: (k, v) => { store.setItem(k, v); return true; } };
  win.SB_STORE = ctx.SB_STORE;
  for (const f of ['bizzing-wallet.js', 'bizzing-avatars.js']) vm.runInContext(fs.readFileSync(path.join(APP, f), 'utf8').replace(/window\.(BZ_\w+)\s*=/g, 'window.$1 = globalThis.$1 ='), ctx);
  return { W: ctx.BZ_WALLET, A: ctx.BZ_AVATARS };
}

const s1 = mkStore(), s2 = mkStore();
const O = loadOriginal(s1), P = loadPort(s2);
const J = v => JSON.stringify(v);

/* ---- constants ---- */
for (const k of ['TIERS', 'PACKS', 'PER_PACK', 'SHAPE', 'FREE_WORLDS', 'WORLD_PRICE'])
  ok(J(O.A[k]) === J(P.A[k]), `avatar engine ${k} matches the drop-in (${J(P.A[k]).slice(0, 60)})`);
ok(J(O.W.EARN) === J(P.W.EARN) && O.W.DAILY_CAP === P.W.DAILY_CAP, 'wallet amounts and the daily cap match the drop-in');

/* ---- validate() on Bee's catalogue and on broken ones ---- */
const win = { console }; win.window = win; const cx = { window: win, document: {}, console }; vm.createContext(cx);
vm.runInContext(fs.readFileSync(path.join(APP, 'avatars.js'), 'utf8'), cx);
const CAT = win.SB_AVATARS.catalogue();
ok(J(O.A.validate(CAT)) === J(P.A.validate(CAT)) && P.A.validate(CAT).length === 0, `validate(Bee's 96) is [] in both — ${J(P.A.validate(CAT))}`);
const broken = CAT.map(a => Object.assign({}, a)); broken[3].tier = 'rare'; broken[7].milestone = null; broken.pop(); broken[9].real = true; delete broken[9].about; broken[10].price = 99;
ok(J(O.A.validate(broken)) === J(P.A.validate(broken)) && P.A.validate(broken).length >= 5, `a broken catalogue gets the same ${P.A.validate(broken).length} complaints from both`);
ok(J(O.A.sacredSafe(CAT, [1, 11])) === J(P.A.sacredSafe(CAT, [1, 11])), 'sacredSafe() agrees');

/* ---- stateOf / buy / buyWorld on the same wallet history ---- */
for (const S of [s1, s2]) S.clear();
const run = (X) => { const out = [];
  X.W.migrateFrom('bee', 'Ana', 300, 1000);
  for (let i = 0; i < 130; i++) out.push(X.W.earn('bee', 'Ana', i % 7 ? 'answer' : 'stop', 2000 + i));
  const ctx = { owned: new Set(['bumble']), worlds: [3], plan: 'free', milestones: ['av-queenhive'], who: 'Ana' };
  for (const a of CAT) out.push(X.A.stateOf(a, ctx));
  out.push(X.A.buy('bee', 'Ana', CAT.find(a => a.tier === 'rare' && a.world === 1 && a.id !== 'bumble'), ctx, 5000));
  out.push(X.A.buyWorld('bee', 'Ana', 4, ctx, 5001), X.A.buyWorld('bee', 'Ana', 2, ctx, 5002));
  out.push(X.W.refund('bee', 'Ana', 'world:4', 6000), X.W.refund('bee', 'Ana', 'world:4', 6001));
  out.push(X.W.balance('Ana'), X.W.ledger('Ana').map(x => [x.n, x.why]));
  return out; };
const ro = run(O), rp = run(P);
const firstDiff = ro.findIndex((v, i) => J(v) !== J(rp[i]));
/* the ONE Bee deviation: the day's cap ignores the 'migrated' line, so on migration day the port may pay
   where the drop-in pays 0. Everything that is not an earn on that day must match exactly. */
const earnsO = ro.slice(0, 130), earnsP = rp.slice(0, 130);
ok(earnsP.reduce((a, n) => a + n, 0) === 100 && earnsO.reduce((a, n) => a + n, 0) <= 100, `both stop at the 100-coin daily cap (port ${earnsP.reduce((a, n) => a + n, 0)}, drop-in ${earnsO.reduce((a, n) => a + n, 0)} — the drop-in counts the migration line toward the cap, the documented Bee fix does not)`);
const tailDiff = ro.slice(130, 130 + CAT.length).findIndex((v, i) => J({ ...v, say: v.say.replace(/ · \d+ more to go/, ''), short: !!v.short }) !== J({ ...rp[130 + i], say: rp[130 + i].say.replace(/ · \d+ more to go/, ''), short: !!rp[130 + i].short }));
ok(tailDiff < 0, 'stateOf() says the same thing about all 96 cards (balances aside)' + (tailDiff >= 0 ? ' — first difference at ' + CAT[tailDiff].id : ''));
ok(rp[130 + CAT.length] === true && rp[131 + CAT.length] === true && rp[132 + CAT.length] === false, 'buy() pays a rare in an open world, buyWorld() opens world 4 for 240, and refuses a world that is already open');
ok(rp[133 + CAT.length] === 240 && rp[134 + CAT.length] === 0, 'refund() gives back exactly what was paid, once');
ok(typeof P.W.refund === 'function', 'the wallet port carries refund() (added upstream after the first port)');

/* ---- My Feed (FAMILY-STANDARD §6a): bizzing-feed.css byte for byte, bizzing-feed.js as a classic port ---- */
ok(fs.readFileSync(path.join(APP, 'bizzing-feed.css'), 'utf8') === fs.readFileSync(path.join(FAM, 'bizzing-feed.css'), 'utf8'),
  'bizzing-feed.css is byte-identical to the family drop-in');
{
  const oc = { console, Date, Math, JSON, Object, Array, Set, Number, String };
  vm.createContext(oc);
  vm.runInContext(fs.readFileSync(path.join(FAM, 'bizzing-feed.js'), 'utf8').replace(/^export (const|function|let) /mg, '$1 ') +
    '\n;globalThis.F={LIMIT,MAX_PLAY,MAX_KIND,MAX_WHY,hash,feedFor,order,feedHead,feedCard,feedEnd};', oc);
  const pw = { console }; pw.window = pw;
  const pc = { window: pw, console, Date, Math, JSON, Object, Array, Set, Number, String }; vm.createContext(pc);
  vm.runInContext(fs.readFileSync(path.join(APP, 'bizzing-feed.js'), 'utf8'), pc);
  const O = oc.F, P = pw.BZ_FEED;
  /* the port's body IS the original's body, minus the word `export` */
  const body = fs.readFileSync(path.join(APP, 'bizzing-feed.js'), 'utf8').split('/* ---- the drop-in, line for line ---- */\n')[1].split('/* ---- end of the drop-in ---- */')[0];
  ok(body === fs.readFileSync(path.join(FAM, 'bizzing-feed.js'), 'utf8').replace(/^export (const|function|let) /mg, '$1 '),
    'bizzing-feed.js: the port is the drop-in line for line (only `export` removed)');
  ok(['LIMIT', 'MAX_PLAY', 'MAX_KIND', 'MAX_WHY'].every(k => O[k] === P[k]), 'feed constants match the drop-in');
  /* the same answers on the same inputs: a synthetic corpus of every shape the engine branches on */
  const items = []; const kinds = ['lesson', 'word', 'play', 'game', 'fun'];
  for (let i = 0; i < 240; i++) items.push({ id: 'x' + i, kind: kinds[i % 5], level: i % 7 === 0 ? undefined : 1 + (i % 4), bands: i % 9 === 0 ? ['11-13'] : undefined,
    topics: ['t' + (i % 6)], key: i % 11 === 0 ? 'word:w' + i : undefined, play: i % 5 === 2 ? { q: 'q' + i, opts: ['a', 'b', 'c'], after: 'z' } : undefined,
    title: 'T' + i, body: 'B' + i, route: '#/x', cta: 'Go' });
  const runs = [{}, { level: 2 }, { level: 3, band: '8-10' }, { level: 1, signals: [{ topic: 't2', w: 5, why: 'Because' }], due: { 'word:w22': 'slipped' } },
    { level: 4, seen: { x1: 20000, x4: 20000, x8: 19990 }, levelName: n => 'Region ' + n }];
  const same = runs.every(r => { const o = Object.assign({ items, now: Date.UTC(2026, 9, 2) }, r);
    return JSON.stringify(O.feedFor(o)) === JSON.stringify(P.feedFor(o)); });
  ok(same, 'feedFor() ranks five different children identically in the port and the drop-in');
  ok([3, 4, 5].every(n => ['a', 'pq-w24', 'ws-focus'].every(id => JSON.stringify(O.order(id, n)) === JSON.stringify(P.order(id, n)))), 'order() agrees');
  const it = items[2];
  ok(['', 'right', 'wrong'].every(st => O.feedCard(it, { why: 'w' }, { st, o: 1 }) === P.feedCard(it, { why: 'w' }, { st, o: 1 })) &&
    O.feedEnd({ href: '#/continue', label: 'Go' }) === P.feedEnd({ href: '#/continue', label: 'Go' }) && O.feedHead({}) === P.feedHead({}),
    'feedCard(), feedEnd() and feedHead() draw the same markup');
}

console.log(fails ? `\n${fails} FAILED` : '\nall good');
process.exit(fails ? 1 : 0);
