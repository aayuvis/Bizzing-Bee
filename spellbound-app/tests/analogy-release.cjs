/* THE ANALOGY RELEASE IS HELD TO THE REVIEW LEDGER — node, joins the deploy's data gate.       @check

   Owner, 10 Oct 2026 (the road to 4.5, decisions §1.2 and P0.4): "an item ships only with three passes" and
   "a test must fail if any item without three passes can be reached without tester mode". Every analogy surface
   (the tab, its lessons, Against the Clock, Mock Analogy Bee, the Link Finder, My Feed's analogy cards) reads the
   items in analogy-data.js, and ONE line decides whether a child can reach them: `window.SB_ANL_RELEASED=false;`
   in app3.js (tests/analogy-gate.cjs holds the surfaces to that line in the browser). This holds the line:
     1. it is assigned exactly once in the shipped code, to a literal true or false
     2. while it is true, every item in analogy-data.js carries three passes in
        analogy-review/analogy-review.json (rounds 1, 2 and 3 each end on "pass"; a missing ledger is zero)
     3. the rule itself, on made-up items, so a change to the checker cannot quietly make it pass everything:
        released with an unreviewed item fails; with two passes fails; a later fail undoes a pass; a pass for an
        item that has since changed (its `sig`) does not count; three passes ship; gated ships nothing
   The rule and the ledger's shape are in tests/lib/analogy-release.cjs.
   Proved by breaking (10 Oct 2026): `window.SB_ANL_RELEASED=true;` in app3.js with the ledger as it stands (none)
   → check 2 fails naming all 1,592 items; a second `window.SB_ANL_RELEASED=false;` in analogy.js → check 1 fails;
   `unreviewedReachable` made to return [] → check 3 fails five times; a full ledger with item 1 (sibling:sister) failed
   in round 1 and the flag true → check 2 fails naming item 1 alone.
   Run: node tests/analogy-release.cjs                                                                    */
'use strict';
const path = require('path');
const R = require('./lib/analogy-release.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };

const res = R.check(ROOT);
const f = res.flag;
ok(f.sites.length === 1 && /^app3\.js:/.test(f.sites[0]) && (f.value === true || f.value === false),
  `the release is ONE line, a literal true or false (${f.sites.join(', ') || 'not found'} → ${f.value})`);
ok(!res.bad.length, f.value === true
  ? `released: every one of the ${res.total} items carries three passes in the review ledger` + (res.bad.length ? ` — ${res.bad.length} do not (${res.bad.slice(0, 8).join(', ')}${res.bad.length > 8 ? ', …' : ''})` + (res.ledger.missing ? '; there is no ledger yet' : '') : '')
  : `gated (SB_ANL_RELEASED=${f.value}): no analogy item reaches a child without tester mode, so none needs a pass yet (${res.total} items, ledger ${res.ledger.missing ? 'not yet written' : res.ledger.rows.length + ' rows'})`);

/* 3 — the rule on made-up items */
const items = { a: ['synonym', 1, 'big', 'large', 'tiny|s'], b: ['antonym', 2, 'hot', 'cold', 'warm|a'] };
const pass = (item, round, extra) => Object.assign({ item, round, verdict: 'pass', reason: 'ok' }, extra || {});
const all3 = (id) => [pass(id, 1), pass(id, 2), pass(id, 3)];
const U = (released, rows) => R.unreviewedReachable({ released, items, rows });
ok(U(true, all3('a')).join() === 'b', 'released with one item unreviewed: that item is named');
ok(U(true, [...all3('a'), pass('b', 1), pass('b', 2)]).join() === 'b', 'two passes are not three');
ok(U(true, [...all3('a'), ...all3('b'), { item: 'b', round: 2, verdict: 'fail', reason: 'second answer' }]).join() === 'b', 'a later fail in a round takes that round\'s pass away');
ok(U(true, [...all3('a'), ...all3('b').map((r) => Object.assign(r, { sig: JSON.stringify(['antonym', 2, 'hot', 'cold', 'cool|a']) }))]).join() === 'b',
  'a pass for the item as it USED to be (its sig) does not count for the item as it is now');
ok(U(true, [...all3('a'), ...all3('b').map((r) => Object.assign(r, { sig: JSON.stringify(items.b) }))]).length === 0, 'three passes on every item, sig matching: it ships');
ok(U(true, []).length === 2 && U(false, []).length === 0, 'no ledger is zero passes; gated, nothing is reachable to need one');

console.log(fails ? `\n${fails} FAILED` : '\nall good');
process.exit(fails ? 1 : 0);
