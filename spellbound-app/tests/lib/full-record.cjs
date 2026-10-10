#!/usr/bin/env node
/* THE DEPLOY'S READING OF THE FULL-SUITE RECORD (P0.18, 10 Oct 2026: "deploy.sh refuses to publish on any red").

   tests/lib/run.cjs writes tests/build/last-full.json whenever it runs the WHOLE suite (see its header).
   Both deploy scripts ask this file one question — "is there a green whole-suite run for exactly the tree
   I am about to publish?" — and refuse unless the answer is yes:

     node tests/lib/full-record.cjs <tree>     silent, exit 0     the record is green and is for <tree>
                                               one line, exit 3   why not (missing, red, another tree, …)
     node tests/lib/full-record.cjs            the same question for HEAD's spellbound-app tree, said out
                                               loud either way — for a person asking "can I deploy?"
   SB_FULL_RECORD overrides the record's path (tests/deploy-gate.cjs uses it; nothing else should).

   The owner's 4 Oct decision stands beside this, not instead of it: the deploy still runs its fast data
   gate (`run.cjs --node-only`) on the tree it copies. The full suite takes ~100 minutes, so it is not run
   BY the deploy; the deploy only refuses to publish a tree it has never seen pass. */
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const APP = path.resolve(__dirname, '..', '..');
const REC = process.env.SB_FULL_RECORD || path.join(APP, 'tests', 'build', 'last-full.json');

function verdict(tree) {
  let j;
  try { j = JSON.parse(fs.readFileSync(REC, 'utf8')); }
  catch (e) { return 'no full-suite record (' + path.relative(APP, REC) + ') — run the whole suite on this commit first: `npm test` (node tests/lib/run.cjs, no names)'; }
  const when = j.at ? ' (' + j.at + ')' : '';
  if (!j.tree) return 'the full-suite record names no tree' + (j.why ? ' (' + j.why + ')' : '') + ' — run `npm test` from a git checkout';
  if (j.tree !== tree) return 'the last full run' + when + ' tested tree ' + String(j.tree).slice(0, 12) + ' (commit ' + String(j.commit || '?').slice(0, 9) + '), not the tree being deployed (' + String(tree).slice(0, 12) + ') — run `npm test` on this commit';
  if (j.stable === false) return 'the last full run on this tree' + when + ' saw the files change while it ran, so it certifies nothing — run `npm test` again';
  if (!(j.failed === 0 && j.passed > 0 && j.passed === j.total)) return 'the last full run on this tree' + when + ' was RED: ' + j.failed + ' of ' + j.total + ' failed — ' + (j.failedTests || []).slice(0, 8).join(', ');
  return '';
}
module.exports = { verdict, REC };

if (require.main === module) {
  let tree = process.argv[2];
  const asked = !tree;
  if (!tree) {
    try { const pre = execFileSync('git', ['rev-parse', '--show-prefix'], { cwd: APP }).toString().trim().replace(/\/$/, '');
      tree = execFileSync('git', ['rev-parse', 'HEAD:' + pre], { cwd: APP }).toString().trim(); }
    catch (e) { console.log('not a git checkout — cannot name the tree to check'); process.exit(2); }
  }
  if (!/^[0-9a-f]{40,64}$/.test(tree)) { console.log('usage: node tests/lib/full-record.cjs [<tree hash>]'); process.exit(2); }
  const why = verdict(tree);
  if (why) { console.log(why); process.exit(3); }
  if (asked) console.log('green: the whole suite passed on this tree (' + tree.slice(0, 12) + ')');
  process.exit(0);
}
