/* app3-closure.cjs — run app3's OWN code in node, without its page (road to 4.5, P1.13).

   A generated file that claims to be "what app3 computes" is only honest if it is computed by app3's own source,
   not by a copy of it. This reads the shipped app source files (app3.js and the files the split moved its code
   into), parses them with the TypeScript compiler's parser (plain JS, no build step is added to the app), and
   returns the source text of the top-level declarations a set of ROOT names needs — the roots and every top-level
   name they use, transitively, in source order. tools/build-curriculum.cjs evaluates that text in a window-shaped
   vm context beside the boot word tier; tests/curriculum.cjs does the same and compares.

   Only declarations come along (functions, const/let/var). Top-level statements (listeners, window.* hand-offs)
   do not; a caller that needs one of their effects sets it itself, by name.

     const { closure } = require('./app3-closure.cjs');
     const src = closure(['buildDefaultStages', 'buildJourneySorted']);   // a script to run in a vm            */
'use strict';
const fs = require('fs'), path = require('path');
const APP = path.resolve(__dirname, '..');
let ts; for (const p of ['typescript', '/opt/node22/lib/node_modules/typescript']) { try { ts = require(p); break; } catch (e) {} }

/* the files app3's code lives in (app3.js first; the split's lazy files after it, if they exist) */
const FILES = ['app3.js'].concat(fs.readdirSync(APP).filter((f) => /^app3-[a-z0-9-]+\.js$/.test(f)).sort());

function parse() {
  if (!ts) throw new Error('app3-closure: needs the typescript package (its parser) — /opt/node22/lib/node_modules/typescript');
  const decls = new Map();   // name -> {file, start, end, text, refs:Set}
  for (const f of FILES) {
    const src = fs.readFileSync(path.join(APP, f), 'utf8');
    const sf = ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    for (const st of sf.statements) {
      const names = [];
      if (ts.isFunctionDeclaration(st) && st.name) names.push(st.name.text);
      else if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name)) names.push(d.name.text);
      if (!names.length) continue;
      const rec = { file: f, start: st.getStart(sf), end: st.end, text: src.slice(st.getStart(sf), st.end), node: st, names };
      for (const n of names) if (!decls.has(n)) decls.set(n, rec);
    }
  }
  const all = new Set(decls.keys());
  for (const rec of new Set(decls.values())) {
    const refs = new Set();
    const walk = (x) => {
      if (ts.isIdentifier(x) && all.has(x.text)) {
        const par = x.parent;
        if (!(par && ts.isPropertyAccessExpression(par) && par.name === x) && !(par && ts.isPropertyAssignment(par) && par.name === x)) refs.add(x.text);
      }
      ts.forEachChild(x, walk);
    };
    walk(rec.node);
    rec.refs = refs;
  }
  return decls;
}

/* the source of every declaration `roots` needs, in file and source order */
function closure(roots) {
  const decls = parse();
  const need = new Set(); const st = [...roots];
  while (st.length) { const k = st.pop(); const d = decls.get(k); if (!d) { if (roots.includes(k)) throw new Error('app3-closure: no top-level ' + k); continue; }
    if (need.has(d)) continue; need.add(d); for (const r of d.refs) st.push(r); }
  return [...need].sort((a, b) => FILES.indexOf(a.file) - FILES.indexOf(b.file) || a.start - b.start).map((d) => d.text).join('\n');
}

module.exports = { closure, FILES };
