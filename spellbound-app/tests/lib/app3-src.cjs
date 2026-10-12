/* APP3'S SOURCE, WHEREVER THE SPLIT PUT IT (road to 4.5, P1.13 step 2 — the app3 split).

   app3.js keeps the first screens, the shell and the action table; each screen's own code moved, verbatim, into a lazy
   file (app3-shared.js, app3-library.js, app3-gym.js, app3-grownups.js, app3-games.js, app3-me.js, app3-tools.js —
   CLAUDE.md "Road to 4.5, P1 — the app3 split"). A test that reads app3's code AS TEXT — "the app types this string
   once", "every 'Often misspelled' line goes through realMiss()", a function's body — reads it here:
     all(root)        app3.js and every lazy file, in the order the page runs them (one text, files joined by "\n")
     files(root)      [[name, text], …] the same, file by file — for a check that must name the file it found a thing in
     fileOf(root, n)  the file that declares top-level function / const / let / var `n` (or an action `n:` in a table)
     body(root, n)    `function n(` to the next top-level `function` in ITS file — '' when there is none
   A slice between two anchors still belongs in the one file that holds both (indexOf on all() would run across files).
   Run nothing: this is a helper.                                                                                  */
'use strict';
const fs = require('fs'), path = require('path');
const ORDER = ['app3.js', 'app3-shared.js', 'app3-library.js', 'app3-gym.js', 'app3-grownups.js', 'app3-games.js', 'app3-me.js', 'app3-tools.js'];
function names(root) {
  const extra = fs.readdirSync(root).filter((f) => /^app3-[a-z0-9-]+\.js$/.test(f) && !ORDER.includes(f)).sort();
  return ORDER.concat(extra).filter((f) => fs.existsSync(path.join(root, f)));
}
const files = (root) => names(root).map((f) => [f, fs.readFileSync(path.join(root, f), 'utf8')]);
const all = (root) => files(root).map(([, t]) => t).join('\n');
function fileOf(root, n) {
  const re = new RegExp('(^|\\n)(function ' + n + '\\(|(const|let|var) ' + n + '\\s*=|\\s+' + n + '\\s*:)');
  const hit = files(root).find(([, t]) => re.test(t)); return hit ? hit[0] : null;
}
function body(root, n) {
  for (const [, t] of files(root)) { const i = t.indexOf('\nfunction ' + n + '(');
    if (i >= 0) { const j = t.indexOf('\nfunction ', i + 10); return t.slice(i + 1, j < 0 ? t.length : j); } }
  return '';
}
module.exports = { all, files, fileOf, body, ORDER };
