#!/usr/bin/env node
/* apply-review.cjs — what the three agent-review rounds decided, applied (owner, 10 Oct 2026: "an item ships only with
   three passes. Failed items are fixed or dropped, then re-run through all three rounds").

     node tools/analogy/apply-review.cjs plan   after cycle 1: every unit round 3 FIXED (wrong options dropped, a
                                                wrong-sense gloss hidden, lesson or card wording rewritten) or PASSED
                                                over an earlier fail goes to cycle 2 — written, changed, to
                                                analogy-review/rounds2/units.json for all three rounds again
     node tools/analogy/apply-review.cjs ship   after cycle 2: a unit ships only with a pass in rounds 1, 2 AND 3 of
                                                one cycle; everything else is dropped. Writes analogy-review/
                                                analogy-review.json (the ledger the gate test reads), REPORT.md, and
                                                analogy-data.js cut down to what shipped

   Nothing is chosen by chance and nothing is re-generated: the items, their ids and their words are the ones the
   reviewers read. A gloss is shown only where a reviewer read it as the answer's gloss and did not hide it. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const APP = path.resolve(__dirname, '..', '..'), DIR = path.join(APP, 'analogy-review');
const R1 = path.join(DIR, 'rounds'), R2 = path.join(DIR, 'rounds2');
const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
function rowsOf(dir, cycle) { const rows = []; if (!fs.existsSync(dir)) return rows;
  for (const f of fs.readdirSync(dir).filter((f) => /^v\d-\d+\.json$/.test(f)).sort()) { const round = +f[1];
    for (const v of read(path.join(dir, f))) rows.push({ item: v.unit, round, verdict: v.verdict, reason: v.reason || '', cycle,
      ...(v.drop && v.drop.length ? { drop: v.drop } : {}), ...(v.gloss === 'hide' ? { gloss: 'hide' } : {}), ...(v.fix_text ? { fix_text: v.fix_text } : {}) }); }
  return rows; }
const byUnit = (rows) => { const P = {}; for (const r of rows) { (P[r.item] = P[r.item] || {})[r.round] = r; } return P; };
const three = (p) => !!(p && p[1] && p[2] && p[3] && p[1].verdict === 'pass' && p[2].verdict === 'pass' && p[3].verdict === 'pass');
process.env.REVIEW_CYCLE = '1';
const units1 = () => { delete require.cache[require.resolve('./review.cjs')]; return require('./review.cjs').units(); };
const cmd = process.argv[2];

if (cmd === 'plan') {
  const rows = rowsOf(R1, 1), P = byUnit(rows), U = units1();
  const missing = U.filter((u) => !(P[u.unit] || {})[3] && !three(P[u.unit])).length;
  if (U.some((u) => !(P[u.unit] || {})[1] || !(P[u.unit] || {})[2] || !(P[u.unit] || {})[3])) { console.log('cycle 1 is not complete: every unit needs rounds 1, 2 and 3 (' + missing + ' without round 3)'); process.exit(1); }
  const next = [], tally = { ship: 0, drop: 0, fixed: 0, recheck: 0 };
  for (const u of U) { const p = P[u.unit], r3 = p[3];
    if (three(p)) { tally.ship++; continue; }
    if (r3.verdict === 'fail') { tally.drop++; continue; }
    const v = Object.assign({}, u, { cycle1: r3.verdict === 'fix' ? 'fixed in round 3: ' + r3.reason : 'passed by round 3 over an earlier fail: ' + r3.reason });
    if (r3.verdict === 'fix') { tally.fixed++;
      if (u.kind === 'item') { if (r3.drop) v.wrong = u.wrong.filter((w) => !r3.drop.includes(w)); if (r3.gloss === 'hide') { v.gloss = ''; v.glossHidden = true; } }
      else if ((u.kind === 'text' || u.kind === 'card') && r3.fix_text) v.text = r3.fix_text; }
    else tally.recheck++;
    next.push(v); }
  fs.mkdirSync(R2, { recursive: true });
  fs.writeFileSync(path.join(R2, 'units.json'), JSON.stringify(next, null, 1));
  /* round 2 of cycle 2 builds its blind stems only from pairs that shipped in cycle 1 */
  fs.writeFileSync(path.join(R2, 'stems-ok.json'), JSON.stringify(U.filter((u) => u.kind === 'stem' && three(P[u.unit])).map((u) => u.unit), null, 1));
  console.log('cycle 1: ' + tally.ship + ' ship with three passes, ' + tally.drop + ' dropped; cycle 2 gets ' + next.length + ' (' + tally.fixed + ' fixed, ' + tally.recheck + ' to re-check unchanged)');
}

if (cmd === 'ship') {
  const rows1 = rowsOf(R1, 1), rows2 = rowsOf(R2, 2), P1 = byUnit(rows1), P2 = byUnit(rows2), U = units1();
  const c2 = fs.existsSync(path.join(R2, 'units.json')) ? read(path.join(R2, 'units.json')) : [];
  const c2by = {}; c2.forEach((u) => { c2by[u.unit] = u; });
  const shipped = {}, ledger = [], dropped = [];
  for (const u of U) {
    /* a unit that went through cycle 2 is decided by cycle 2: new evidence is never ignored */
    if (!c2by[u.unit] && three(P1[u.unit])) { shipped[u.unit] = u; ledger.push(...rows1.filter((r) => r.item === u.unit)); continue; }
    if (c2by[u.unit] && three(P2[u.unit])) { shipped[u.unit] = c2by[u.unit]; ledger.push(...rows2.filter((r) => r.item === u.unit)); continue; }
    const last = c2by[u.unit] ? rows2.filter((r) => r.item === u.unit) : rows1.filter((r) => r.item === u.unit);
    ledger.push(...last); dropped.push({ unit: u.unit, why: (last.filter((r) => r.verdict !== 'pass').pop() || {}).reason || 'not three passes' }); }
  fs.writeFileSync(path.join(DIR, 'analogy-review.json'), JSON.stringify(ledger, null, 1) + '\n');
  /* analogy-data.js, cut to what shipped */
  const ctx = { window: {} }; const src = fs.readFileSync(path.join(APP, 'analogy-data.js'), 'utf8'); vm.runInNewContext(src, ctx); const A = ctx.window.SB_ANALOGY;
  const items = {}, gloss = {};
  for (const [id, it] of Object.entries(A.items)) { const s = shipped['item:' + id]; if (!s) continue;
    const recipe = {}; it.slice(4).forEach((x) => { const [w, k] = String(x).split('|'); recipe[w] = k || 'a'; });
    items[id] = [it[0], it[1], it[2], it[3]].concat(s.wrong.map((w) => w + '|' + (recipe[w] || 'a')));
    if (!s.glossHidden && A.gloss[it[3]]) gloss[it[3]] = A.gloss[it[3]]; }
  A.lessons.forEach((L) => { ['title', 'idea', 'bridge', 'spot', 'trap'].forEach((f) => { const s = shipped['lesson:' + L.id + ':' + f]; if (s) L[f] = s.text; });
    L.stems = (L.stems || []).filter((_, i) => shipped['stem:' + L.id + ':' + i]); });
  const lessonsOk = A.lessons.every((L) => ['title', 'idea', 'bridge', 'spot', 'trap'].every((f) => shipped['lesson:' + L.id + ':' + f]));
  A.regions.forEach((r) => { r.stops.forEach((st) => { st.items = st.items.filter((id) => items[id]); }); r.check = r.check.filter((id) => items[id]); });
  A.games = (A.games || []).filter((id) => items[id]);
  A.items = items; A.gloss = gloss;
  A.review = { ledger: 'analogy-review/analogy-review.json', shipped: Object.keys(items).length, lessonsOk };
  A.reviewed = lessonsOk;
  const head = src.slice(0, src.indexOf('window.SB_ANALOGY'));
  fs.writeFileSync(path.join(APP, 'analogy-data.js'), head + 'window.SB_ANALOGY = ' + JSON.stringify(A) + ';\n');
  /* the deity cards that shipped */
  const cards = read(path.join(DIR, 'deity-cards.json')); const cardOut = {};
  ['shiva', 'zeus'].forEach((k) => { const s = shipped['card:' + k]; if (s) cardOut[k] = s.text; });
  fs.writeFileSync(path.join(DIR, 'deity-cards-shipped.json'), JSON.stringify(cardOut, null, 1) + '\n');
  const thin = []; A.regions.forEach((r) => { r.stops.forEach((st) => { if (st.items.length < 16) thin.push(st.id + ' ' + st.items.length); }); if (r.check.length < 10) thin.push(r.id + ' check ' + r.check.length); });
  console.log('shipped ' + Object.keys(shipped).length + ' units (' + Object.keys(items).length + ' items); dropped ' + dropped.length + '; lessons all reviewed: ' + lessonsOk + '; cards: ' + Object.keys(cardOut).join(', ') + (thin.length ? '\nthin: ' + thin.join(' · ') : ''));
  fs.writeFileSync(path.join(DIR, 'dropped.json'), JSON.stringify(dropped, null, 1) + '\n');
}
/* REPORT.md — what the owner releases on: counts per round and cycle, every fix, every unit dropped, and why */
if (cmd === 'ship' || cmd === 'report') {
  const rows1 = rowsOf(R1, 1), rows2 = rowsOf(R2, 2), U = units1();
  const c2 = fs.existsSync(path.join(R2, 'units.json')) ? read(path.join(R2, 'units.json')) : [];
  const led = read(path.join(DIR, 'analogy-review.json')); const dropped = read(path.join(DIR, 'dropped.json'));
  const cnt = (rows, round) => { const r = rows.filter((x) => x.round === round); const c = {}; r.forEach((x) => { c[x.verdict] = (c[x.verdict] || 0) + 1; }); return r.length + ' (' + Object.entries(c).map(([k, v]) => v + ' ' + k).join(', ') + ')'; };
  const kinds = (list) => { const k = {}; list.forEach((u) => { const t = String(u.unit || u).split(':')[0]; k[t] = (k[t] || 0) + 1; }); return Object.entries(k).map(([a, b]) => b + ' ' + a + (b === 1 ? '' : 's')).join(', '); };
  const shippedIds = new Set(); const P = byUnit(led); Object.keys(P).forEach((id) => { if (three(P[id])) shippedIds.add(id); });
  const fixes = rows1.filter((r) => r.round === 3 && r.verdict === 'fix');
  const L = [];
  L.push('# Analogy content review — the round-3 report', '');
  L.push('The owner releases the Analogies tab, its lessons, Mock Analogy Bee, Against the Clock, the Link Finder and My Feed\'s analogy cards on this report (brief 4.5, decision 2). Until then they are reachable only in tester mode.', '');
  L.push('**How it was reviewed.** Three independent agent rounds over every unit — ' + U.length + ' units: ' + kinds(U) + '. Round 1 saw the answer and judged uniqueness, accuracy and kid-safety. Round 2 was a different agent that solved every item BLIND (the item as a child meets it, options shuffled, no answer, no link name) and never saw round 1. Round 3, a third agent, adjudicated every disagreement and re-checked passes. A unit ships only with a pass in rounds 1, 2 and 3 of one cycle. Units round 3 fixed (wrong options dropped, a wrong-sense gloss hidden, wording rewritten) or passed over an earlier fail went through all three rounds again (cycle 2); anything without three passes there was dropped. Ledger: `analogy-review.json` ({item, round, verdict, reason, cycle}); every sheet and verdict is in `rounds/` and `rounds2/`.', '');
  L.push('**The four known faults were caught in round 1:** sibling:sister as a synonym (item:1), the "ass" option (item:5g, item:xl), censure/reproach (item:ow) and cache/archive (item:xc) — round 1\'s prompt did not need fixing.', '');
  L.push('## Counts', '', '| | round 1 | round 2 (blind) | round 3 |', '|---|---|---|---|');
  L.push('| cycle 1 | ' + cnt(rows1, 1) + ' | ' + cnt(rows1, 2) + ' | ' + cnt(rows1, 3) + ' |');
  if (rows2.length) L.push('| cycle 2 | ' + cnt(rows2, 1) + ' | ' + cnt(rows2, 2) + ' | ' + cnt(rows2, 3) + ' |');
  L.push('', '**Shipped: ' + shippedIds.size + ' units** (' + kinds([...shippedIds]) + '). **Dropped: ' + dropped.length + '** (' + kinds(dropped) + ').', '');
  L.push('Round 2 scoring: in cycle 1 a blind item failed on a different pick, a second defensible answer, an unsafe word OR any written worry (stricter than the brief; round 3 adjudicated every one). From cycle 2 the brief\'s own rule: a different pick, a second defensible answer or an unsafe word fails, and a worry passes to round 3 as a note. 11 cycle-2 items first shown with an empty A:B pair were solved again on a fair sheet (`rounds2/superseded-b2-1.json`).', '');
  L.push('## Every fix (round 3, cycle 1)', '', '| unit | dropped options | gloss | why |', '|---|---|---|---|');
  fixes.forEach((r) => L.push('| ' + r.item + ' | ' + (r.drop || []).join(', ') + ' | ' + (r.gloss === 'hide' ? 'hidden' : '') + ' | ' + String(r.reason).replace(/\|/g, '/').replace(/\n/g, ' ').slice(0, 220) + ' |'));
  const tf = rows1.filter((r) => r.round === 3 && r.fix_text); if (tf.length) { L.push('', '### Wording rewritten', ''); tf.forEach((r) => L.push('- **' + r.item + '**: ' + r.fix_text)); }
  L.push('', '## Every unit dropped', '', '| unit | why |', '|---|---|');
  dropped.forEach((d) => L.push('| ' + d.unit + ' | ' + String(d.why).replace(/\|/g, '/').replace(/\n/g, ' ').slice(0, 240) + ' |'));
  L.push('', '## For the owner', '', '- Round 2 of cycle 1 failed the Shiva card on principle (a living, worshipped god as a "Legendary" collectible beside a historical pantheon), not on its words. Its words passed. The avatar\'s place in the packs is your decision (10 Oct: Shiva and Zeus stay, each with a respectful card); the reviewers were told not to judge it, and this note is here so you see the concern.', '- The data shown to a child is exactly what shipped: `analogy-data.js` was cut to the shipped items (same ids and words the reviewers read), with a gloss only where a reviewer read it and kept it.');
  fs.writeFileSync(path.join(DIR, 'REPORT.md'), L.join('\n') + '\n');
  console.log('wrote analogy-review/REPORT.md (' + L.length + ' lines)');
}
if (!['plan', 'ship', 'report'].includes(cmd)) console.log('usage: apply-review.cjs plan | ship | report');
