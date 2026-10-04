/* T16 — THE CARD COUNT NEVER GOES UP (games spec §3.1 and §8; owner decision 1: one in, one out) — @check

   The Play tab draws SB_PLAY_CARDS (app3.js) and nothing else. GAMES-LEDGER.md is its record:
     · the registry holds no more cards than the ledger's count, and that count is never above the
       thirteen the tab had before the rule (4 Oct 2026)
     · every card in the registry has a row in the ledger, and its door matches
     · every card that came IN names what went OUT, and each of those is a row in the Out table
     · nothing in the Out table is back in the registry, or back in the arcade's engine list
       (SB_ARCADE_GAMES), which is a card by another name
   Proved by breaking: add {k:'wordSnake',…} back to SB_PLAY_CARDS and three checks fail; add a card
   with no ledger row and two fail.
   Run: node tests/games-ledger.cjs                                                              */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };

const app3 = fs.readFileSync(path.join(ROOT, 'app3.js'), 'utf8');
const block = (name) => { const i = app3.indexOf('const ' + name + ' = ['); if (i < 0) return ''; return app3.slice(i, app3.indexOf('\n];', i)); };
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const reg = [...strip(block('SB_PLAY_CARDS')).matchAll(/\{\s*k:'(\w+)',\s*door:'(\w+)'/g)].map(m => ({ k: m[1], door: m[2] }));
const arcade = [...strip(block('SB_ARCADE_GAMES')).matchAll(/\{\s*k:'(\w+)'/g)].map(m => m[1]);
ok(reg.length >= 5, `read the Play tab registry: ${reg.map(r => r.k).join(', ')}`);

const L = fs.readFileSync(path.join(ROOT, 'GAMES-LEDGER.md'), 'utf8');
const sec = name => { const i = L.indexOf('\n## ' + name); if (i < 0) return ''; const j = L.indexOf('\n## ', i + 4); return L.slice(i, j < 0 ? L.length : j); };
const count = +((sec('Count').match(/Cards: \*\*(\d+)\*\*/) || [])[1] || NaN);
const before = +((sec('Count').match(/Before [^:]*: \*\*(\d+)\*\*/) || [])[1] || NaN);
const rows = t => t.split('\n').filter(l => /^\| `\w+`/.test(l)).map(l => l.split('|').slice(1, -1).map(x => x.trim()));
const cards = Object.fromEntries(rows(sec('Cards')).map(r => [r[0].replace(/`/g, ''), { door: r[2].toLowerCase(), status: r[3], out: [...r[4].matchAll(/`(\w+)`/g)].map(m => m[1]) }]));
const out = Object.fromEntries(rows(sec('Out')).map(r => [r[0].replace(/`/g, ''), r]));

ok(count > 0 && before === 13 && count <= before, `the ledger counts ${count} cards, never more than the ${before} before the rule`);
ok(reg.length <= count, `the registry holds ${reg.length} cards, within the ledger's ${count}`);
const missing = reg.filter(r => !cards[r.k]), wrongDoor = reg.filter(r => cards[r.k] && cards[r.k].door !== r.door);
ok(!missing.length && !wrongDoor.length, 'every card in the registry has its row, in the same door' + (missing.length ? ' — no row: ' + missing.map(r => r.k).join(', ') : '') + (wrongDoor.length ? ' — door differs: ' + wrongDoor.map(r => r.k).join(', ') : ''));
const ins = reg.filter(r => cards[r.k] && /^in\b/.test(cards[r.k].status));
const unnamed = ins.filter(r => !cards[r.k].out.length || cards[r.k].out.some(k => !out[k]));
ok(ins.length >= 1 && !unnamed.length, `each card that came in names what went out, and each is in the Out table (${ins.map(r => r.k + ' ← ' + cards[r.k].out.join('+')).join('; ')})` + (unnamed.length ? ' — not named: ' + unnamed.map(r => r.k).join(', ') : ''));
const back = reg.filter(r => out[r.k]).map(r => r.k).concat(arcade.filter(k => out[k]));
ok(!back.length, 'nothing that went out is back — in the registry or the arcade engine list' + (back.length ? ': ' + back.join(', ') : ''));
const orphan = arcade.filter(k => !reg.some(r => r.k === k));
ok(!orphan.length, `every arcade engine entry is a card on the tab (${arcade.join(', ')})` + (orphan.length ? ' — not a card: ' + orphan.join(', ') : ''));
console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
