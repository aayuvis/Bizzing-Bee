/* THE ANALOGY RELEASE — the node half of the analogy gate (owner, 10 Oct 2026; the road to 4.5 §1.2, P0.4/P0.8).

   The analogy content (analogy-data.js) was written by Claude. It is reviewed by three independent agent rounds,
   every verdict a ledger row in analogy-review/analogy-review.json, and "an item ships only with three passes".
   Until then every analogy surface is reachable ONLY in tester mode, and ONE line decides that:
   `window.SB_ANL_RELEASED=false;` in app3.js. This module is what holds that line to the ledger:

     · the flag is assigned exactly once in the shipped code, to a literal true or false — a second assignment
       somewhere else, or a computed one, would be a release nobody can read off the page
     · while it is false nothing is reachable without tester mode, so nothing needs a pass
     · the moment it is true, EVERY item in analogy-data.js is reachable by any child, so every item must carry
       three passes: for each of rounds 1, 2 and 3, the LAST ledger row for that item and round says "pass"
       (a re-run after a fix overrides the round it re-ran; a later fail takes a pass away)

   THE LEDGER: analogy-review/analogy-review.json — an array of rows, or {rows:[…]}. A row is
   {item, round, verdict, reason}: `item` is the item's id in analogy-data.js (SB_ANALOGY.items), `round` 1–3,
   `verdict` "pass" or anything else. A row MAY carry `sig`, the item exactly as it was reviewed
   (JSON.stringify(SB_ANALOGY.items[id])); when it does and the item has changed since (a rebuild renumbered it,
   a wrong answer was swapped), the row does not count — a pass is for the item as it now stands. A missing or
   unreadable ledger is zero passes.

   Used by tests/analogy-release.cjs (node, the deploy's data gate) and tests/analogy-gate.cjs (browser). */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');

/* the shipped scripts: every .js at the app's root (tests, tools and generated data folders are not the app's code) */
function shippedJs(root) { return fs.readdirSync(root).filter((f) => /\.js$/.test(f) && fs.statSync(path.join(root, f)).isFile()); }

/* where the flag is set, and to what — { value: true|false|null, sites: ['file:line', …] } */
function readFlag(root) {
  const sites = []; let value = null;
  for (const f of shippedJs(root)) {
    const lines = fs.readFileSync(path.join(root, f), 'utf8').split('\n');
    lines.forEach((l, i) => {
      const code = l.replace(/\/\*.*?\*\//g, '').replace(/\/\/.*$/, '');
      const m = code.match(/SB_ANL_RELEASED\s*=(?!=)\s*([^;,)]*)/); if (!m) return;
      sites.push(f + ':' + (i + 1));
      const v = m[1].trim(); value = v === 'true' ? true : v === 'false' ? false : 'computed:' + v;
    });
  }
  return { value, sites };
}

function loadItems(root) {
  const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(root, 'analogy-data.js'), 'utf8'), ctx);
  return ctx.window.SB_ANALOGY.items;
}

/* the ledger's rows, or [] when there is none (zero passes) */
function loadLedger(root) {
  const f = path.join(root, 'analogy-review', 'analogy-review.json');
  if (!fs.existsSync(f)) return { rows: [], missing: true };
  try { const j = JSON.parse(fs.readFileSync(f, 'utf8')); const rows = Array.isArray(j) ? j : (j && Array.isArray(j.rows) ? j.rows : []); return { rows, missing: false }; }
  catch (e) { return { rows: [], missing: true, err: e.message }; }
}

/* id -> how many of rounds 1..3 end on a pass, for the item as it now stands */
function passes(items, rows) {
  const last = {};   // id|round -> verdict, in ledger order (the last row wins)
  for (const r of rows) {
    if (!r || r.item == null || !items[r.item]) continue;
    const rd = +r.round; if (!(rd >= 1 && rd <= 3)) continue;
    if (r.sig != null && r.sig !== JSON.stringify(items[r.item])) continue;   // reviewed as something else: not this item's pass
    last[r.item + '|' + rd] = String(r.verdict || '').trim().toLowerCase();
  }
  const out = {};
  for (const id of Object.keys(items)) out[id] = [1, 2, 3].filter((rd) => last[id + '|' + rd] === 'pass').length;
  return out;
}

/* the rule itself: which items a child can reach without tester mode and that lack three passes */
function unreviewedReachable({ released, items, rows }) {
  if (released !== true) return [];   // gated: no item reaches a child
  const p = passes(items, rows || []);
  return Object.keys(items).filter((id) => p[id] < 3);
}

function check(root) {
  const flag = readFlag(root), items = loadItems(root), led = loadLedger(root);
  const bad = unreviewedReachable({ released: flag.value, items, rows: led.rows });
  return { flag, items, ledger: led, bad, total: Object.keys(items).length };
}

module.exports = { readFlag, loadItems, loadLedger, passes, unreviewedReachable, check };
