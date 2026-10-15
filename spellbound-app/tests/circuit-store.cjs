/* THE BEE CIRCUIT'S STATE — one record per child, made by a store step, kept on the device (circuit/BEE-CIRCUIT.md §3.3,
   §13 test 13) — @check

   store.js runs here in a vm exactly as the page runs it (a fake localStorage behind it), and circuit.js through the
   harness in tests/circuit-mail.cjs:
     MIGRATION   store.js's new step v11_to_v12 gives every child c.circuit = {v:1, season:1, halls, cases, mail, board:
                 {suspects:{vesper, pronouncer, ratchet, dax, vale}, accused}, dax:{helped}, closing}; a record already there
                 keeps everything valid in it (its mail, its pins) and a field of the wrong shape is replaced; nothing else
                 on the child moves; a v11 household runs exactly that step, a v1 household every step in order, and a
                 second load runs nothing and changes nothing. The step's record is the one circuit.js makes for a child
                 added later (one shape).
     ISOLATION   two children: a season played by one leaves the other's record empty, its halls shut, its envelope
                 quiet; the second child's season leaves the first's mail as it was; the Hive Post's own view follows
                 the child (a reader open for one is not open for the other).
     ?demo       under window.SB_DEMO a whole season is played and save() is never called — nothing is written (the
                 browser half, a real ?demo page leaving the real storage untouched, is tests/circuit-post.cjs).
     DEVICE ONLY storage only through store.js (circuit.js names no localStorage / sessionStorage / indexedDB), nothing
                 transmitted (no fetch, XHR, beacon or socket in circuit.js; supabase-sync's allow-list does not carry
                 `circuit`).
   SB_ROOT=<dir> runs against another tree.
   PROVED BY BREAKING (scratch root, one file replaced; circuit/BUILD-core.md has the record):
     - store.js without v11_to_v12 → the migration checks fail (no record, steps end at v10_to_v11);
     - store.js's step resetting an existing record (ch.circuit = {} always) → "keeps everything valid" fails;
     - circuit.js keeping one shared record (rec() returning a module-level object) → isolation fails;
     - circuit.js's persist() without its SB_DEMO guard → the ?demo check fails (save called).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/circuit-store.cjs                                     */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.env.SB_ROOT ? path.resolve(process.env.SB_ROOT) : path.resolve(__dirname, '..');
const { harness, careful, KID } = require('./circuit-mail.cjs');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };

/* store.js in a vm, as the page runs it */
function store(seed) {
  const mem = Object.assign({}, seed || {});
  const ls = { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; }, key: (i) => Object.keys(mem)[i] || null, get length() { return Object.keys(mem).length; } };
  const ctx = { console, URLSearchParams, setTimeout: () => 0, location: { hash: '', search: '', pathname: '/index.html' }, history: { state: null, replaceState() {} } };
  ctx.window = ctx; ctx.localStorage = ls;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'store.js'), 'utf8'), ctx, { filename: 'store.js' });
  return { S: ctx.SB_STORE, mem };
}
const BLANK = { v: 1, season: 1, halls: {}, cases: {}, mail: [], board: { suspects: { vesper: [], pronouncer: [], ratchet: [], dax: [], vale: [] }, accused: null }, dax: { helped: null }, closing: null };
const sameShape = (a) => JSON.stringify(a) === JSON.stringify(BLANK);

/* ---- migration ---- */
{
  const kidA = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'fox', coins: 12, mast: { cat: { b: 2, ok: 2 } }, levels: {}, bests: {} };
  const kidB = { name: 'Ravi', age: 12, ageBand: '11-13', avatar: 'panda', levels: {}, bests: {},
    circuit: { v: 1, season: 1, halls: 'broken', mail: [{ key: 'rounds[0].pieces.inv', at: 5, read: true }], board: { suspects: { dax: ['v-chair'] } }, dax: { helped: true }, closing: 2 } };
  const hh = { sv: 11, theme: 'spellbound', pin: null, activeIdx: 0, children: [kidA, kidB, null] };
  const { S } = store({ sb_saas_v2: JSON.stringify(hh) });
  ok(S.SCHEMA >= 12, `the store is at schema v${S.SCHEMA} (the Circuit is v12)`);
  const b = S.loadHousehold();
  ok(S.migrated().join() === 'v11_to_v12' && b.sv === S.SCHEMA, 'a v11 household runs exactly one step: ' + S.migrated().join(', '));
  ok(sameShape(b.children[0].circuit), 'a child with no record gets the §3.3 record, empty: ' + JSON.stringify(b.children[0].circuit));
  const rest = (k) => { const x = Object.assign({}, k); delete x.circuit; return JSON.stringify(x); };
  ok(rest(b.children[0]) === rest(kidA) && rest(b.children[1]) === rest(kidB), 'nothing else on either child moves');
  const r = b.children[1].circuit;
  ok(r.mail.length === 1 && r.mail[0].key === 'rounds[0].pieces.inv' && r.board.suspects.dax.join() === 'v-chair' && r.dax.helped === true && r.closing === 2,
    'a record already there keeps its mail, its pins, its choice and its reply');
  ok(JSON.stringify(r.halls) === '{}' && JSON.stringify(r.cases) === '{}' && r.board.accused === null && ['vesper', 'pronouncer', 'ratchet', 'vale'].every((s) => Array.isArray(r.board.suspects[s]) && !r.board.suspects[s].length),
    'and a field of the wrong shape (halls: "broken") or missing is replaced by its empty one');
  /* saved and read back: nothing runs, nothing changes */
  S.saveHousehold(b);
  const again = store({ sb_saas_v2: JSON.stringify(b) });
  const b2 = again.S.loadHousehold();
  ok(!again.S.migrated().length && JSON.stringify(b2) === JSON.stringify(b), 'a second load runs nothing and changes nothing');
  const old = store({ sb_saas_v2: JSON.stringify({ theme: 'spellbound', children: [{ name: 'Mia', age: 8, coins: 0 }] }) });
  const b3 = old.S.loadHousehold(); const want = []; for (let v = 1; v < old.S.SCHEMA; v++) want.push('v' + v + '_to_v' + (v + 1));
  ok(JSON.stringify(old.S.migrated()) === JSON.stringify(want) && sameShape(b3.children[0].circuit), 'a household from before the seam runs every step in order, the Circuit\'s last');
  /* one shape: what circuit.js makes for a child added after the migration */
  const h = harness({ children: [{ name: 'New', age: 9, ageBand: '8-10', avatar: 'fox' }] });
  ok(sameShape(h.C.state()), 'circuit.js makes the same record for a child added later (state(c), written only when a hook saves)');
  ok(h.log.save === 0, 'and reading state() saves nothing');
}

/* ---- isolation ---- */
{
  const h = harness({ children: [KID('Ahana'), KID('Ravi', '11-13')] });
  const { C, S } = h;
  h.acts.slice(0, 4).forEach((a) => C.onHall(a, { place: 1, of: 6, above: true, words: [{ w: 'knife', ok: false, asks: 0 }] }));
  const A = S.children[0].circuit, B = S.children[1];
  ok(A.mail.length > 40 && (!B.circuit || !B.circuit.mail.length), `one child's season (${A.mail.length} pieces) leaves the other's record empty`);
  ok(C.mailWaiting(S.children[0]) && !C.mailWaiting(S.children[1]) && C.hallUnlocked('storm', S.children[0]) && !C.hallUnlocked('library', S.children[1]),
    'the envelope and the halls are each child\'s own');
  C.act('read|3');
  ok(/hp-reader/.test(C.postHTML(S.children[0])), 'the first child has a piece open in the Hive Post');
  const snap = JSON.stringify(A);
  S.activeIdx = 1;
  ok(!/hp-reader/.test(C.postHTML()) && /No mail yet/.test(C.postHTML()), 'switching child: the second child\'s Hive Post opens on its own (empty) mail, not the first child\'s reader');
  h.acts.slice(0, 2).forEach((a) => C.onHall(a, { place: 2, of: 6, above: false, words: [] }));
  ok(JSON.stringify(S.children[0].circuit) === snap && S.children[1].circuit.mail.length > 15 && S.children[1].circuit.mail.every((m) => !m.read),
    'the second child\'s season leaves the first child\'s record exactly as it was');
}

/* ---- ?demo writes nothing ---- */
{
  const d = harness({ demo: true }); careful(d);
  const n = harness(); careful(n);
  ok(d.C.state().mail.length > 100 && d.log.save === 0, `under ?demo a whole season plays (${d.C.state().mail.length} pieces, in memory) and save() is never called`);
  ok(n.log.save > 20, `outside ?demo the same season saves through app3's save() → SB_STORE (${n.log.save} saves)`);
}

/* ---- device only ---- */
{
  const src = fs.readFileSync(path.join(ROOT, 'circuit.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  ok(!/\b(localStorage|sessionStorage|indexedDB)\b/.test(src), 'circuit.js stores nothing itself: only app3\'s save() → store.js');
  ok(!/\b(fetch|XMLHttpRequest|sendBeacon|WebSocket|EventSource)\b/.test(src), 'circuit.js sends nothing anywhere');
  const sync = fs.readFileSync(path.join(ROOT, 'supabase-sync.js'), 'utf8');
  const keys = (sync.match(/var PROGRESS_KEYS = \[([\s\S]*?)\];/) || [])[1] || '';
  ok(keys.length > 50 && !/circuit/.test(keys), 'the cloud\'s allow-list (PROGRESS_KEYS) does not carry c.circuit');
}

console.log(fails ? `\n${fails} FAILED` : '\neach child keeps their own season, on this device, and ?demo writes nothing');
process.exit(fails ? 1 : 0);
