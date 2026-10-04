/* T12 — MERGED GAMES KEEP THE CHILD'S BESTS (games spec §3.1, §8) — and §1.7's levels move with them — @check

   Four cards left the Play tab for three hubs (Beat the Buzzer, Magic Squares, Word Quiz → Spelling
   Gym and Word Lore; Bee Trivia → Word Lore and Hive Mind). Their bests were never stored as bests:
   they are in the child's activity log and in Bee Trivia's clockBest. Store steps v9→v10 (levels)
   and v10→v11 (bests) carry them to the hub modes, per child, once. This runs store.js itself in a
   window-shaped context over a v9 household, exactly as loadHousehold() does at boot:
     · each mode starts at the best the child already set (ratio for rounds, count for timed runs)
     · Bee Trivia's best goes to BOTH halves of the split; two children never share one
     · a better best already there is never overwritten; an empty child gets empty records
     · a per-game level the child chose (gameDiffBy) is their level in the new home; Auto stays Auto
     · the steps run once: a second load changes nothing
   Proved by breaking: remove v10_to_v11's activity loop and seven checks fail.
   Run: node tests/bests-migration.cjs                                                           */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };

function storeWith(blob) {
  const mem = new Map(); const localStorage = { getItem: k => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: k => mem.delete(k), key: i => [...mem.keys()][i], get length() { return mem.size; } };
  const win = { localStorage, console }; win.window = win;
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'store.js'), 'utf8'), win, { filename: 'store.js' });
  if (blob) localStorage.setItem('sb_saas_v2', JSON.stringify(blob));
  return { S: win.SB_STORE, mem };
}
const DASH = '—';
const blob = { sv: 9, theme: 'spellbound', pin: null, activeIdx: 0, children: [
  { name: 'Ahana', ageBand: '8-10', age: 9,
    gameDiffBy: { beat: 'hard', magic: 'easy', wordquiz: 'auto', typeBlaster: 'champ' },
    trivia: { clockBest: 14, right: 40 },
    activity: [
      { kind: 'beat', label: 'Beat the Buzzer', done: 22, right: 19, ts: 3 }, { kind: 'beat', label: 'Beat the Buzzer', done: 15, right: 12, ts: 2 },
      { kind: 'buzz', label: '10-Word Warm-Up', done: 10, right: 8, ts: 4 },
      { kind: 'magic', label: 'Magic Squares — Food', done: 5, right: 4, ts: 5 }, { kind: 'magic', label: 'Magic Squares — Sport', done: 5, right: 5, ts: 6 },
      { kind: 'spell', label: 'Spot the Spelling', done: 10, right: 7, ts: 7 },
      { kind: 'meaning', label: 'Meaning Match', done: 10, right: 6, ts: 8 }, { kind: 'vocab', label: 'Quiz', done: 10, right: 9, ts: 9 },
      { kind: 'origin', label: 'Origin Detective', done: 10, right: 5, ts: 10 },
      { kind: 'trivia', label: 'Bee Trivia', done: 10, right: 8, ts: 11 },
      { kind: 'trivia', label: 'Trivia Squares', done: 9, right: 6, ts: 12 },
      { kind: 'trivia', label: 'Trivia ' + DASH + ' Beat the Clock', done: 20, right: 11, ts: 13 },
      { kind: 'practice', label: 'Practice', done: 20, right: 20, ts: 14 } ] },
  { name: 'Dev', ageBand: '11-13', age: 12, bests: { 'gym/sprint': { right: 30, of: null, at: 1 } },
    activity: [{ kind: 'beat', label: 'Beat the Buzzer', done: 12, right: 10, ts: 1 }] },
  { name: 'New', ageBand: '5-7', age: 6 } ] };

const { S, mem } = storeWith(blob);
ok(S.SCHEMA >= 11, `the store is at schema v${S.SCHEMA} (levels v10, bests v11)`);
const h = S.loadHousehold();
ok(h && h.sv === S.SCHEMA && S.migrated().join(',').includes('v9_to_v10') && S.migrated().join(',').includes('v10_to_v11'), 'a v9 household runs v9→v10 and v10→v11 — ' + S.migrated().join(', '));
const [A, D, N] = h.children; const B = A.bests || {};
const is = (k, right, of) => !!B[k] && B[k].right === right && B[k].of === of;
ok(is('gym/sprint', 19, null), `Beat the Buzzer's best run (19) is Spelling Gym · Sprint's best — ${JSON.stringify(B['gym/sprint'])}`);
ok(is('gym/warmup', 8, 10), "its 10-Word Warm-Up (8/10) is Warm-up's");
ok(is('gym/squares', 5, 5), "Magic Squares' best square (5/5) is Squares'");
ok(is('gym/spot', 7, 10), "Word Quiz's Spot the Spelling (7/10) is Spot the Error's");
ok(is('lore/meanings', 9, 10) && is('lore/origins', 5, 10), "Word Quiz's Meanings (the better of 6/10 and Vocabulary's 9/10) and Origins (5/10) are Word Lore's");
ok(is('lore/roots', 8, 10) && is('hive/classic', 8, 10), "Bee Trivia's round best (8/10) goes to BOTH halves of the split — Word Lore and Hive Mind");
ok(is('lore/squares', 6, 9) && is('hive/squares', 6, 9), 'and its Trivia Squares (6/9)');
ok(is('lore/clock', 14, null) && is('hive/clock', 14, null), "and its Beat the Clock: clockBest 14 beats the logged 11");
ok(!Object.keys(B).some(k => /practice/.test(k)), 'nothing that was not a game is carried');
ok(D.bests['gym/sprint'].right === 30 && Object.keys(D.bests).length === 1, "a better best already there (Dev's 30) is not overwritten, and Dev never gets Ahana's");
ok(N.bests && !Object.keys(N.bests).length && N.levels && !Object.keys(N.levels).length, 'a child with no history gets empty records, not invented ones');
const L = A.levels || {};
ok(L['gym/sprint'] && L['gym/sprint'].level === 'hard' && L['gym/warmup'].level === 'hard' && L['gym/squares'].level === 'easy' && L.typeBlaster.level === 'champ',
  'the level a child chose moves with the game: Beat the Buzzer Hard → Sprint and Warm-up, Magic Squares Easy → Squares, Type Blaster Champ');
ok(!L['lore/meanings'] && Array.isArray(L.typeBlaster.history), 'Auto stays Auto (no record), and every level keeps a history');
/* once only */
S.saveHousehold(h);
const again = storeWith(null); again.mem.set('sb_saas_v2', mem.get('sb_saas_v2'));
const h2 = again.S.loadHousehold();
ok(JSON.stringify(h2) === JSON.stringify(h) && !again.S.migrated().length, 'the steps run once: reloading the saved household changes nothing');
console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
