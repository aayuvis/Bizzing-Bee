#!/usr/bin/env node
/* app3-split-map.cjs — what in app3.js belongs to which screen (road to 4.5, P1.13: "first-load JS ≤ 400 KB gzip:
   app3.js split by screen"). READ-ONLY: it measures and prints; it moves nothing. The plan it feeds is
   docs/first-load-plan.md.

   How it decides. app3.js is parsed (the TypeScript compiler's parser, which reads plain JS; no build step is
   added to the app). Every top-level declaration is a node — a function, a const/let, or one PROPERTY of the
   `app` action table — weighed raw, minified (esbuild, as deploy ships it) and as its share of app3's gzip. Edges:
     · a node names another top-level name in its code;
     · a node's template text carries data-act="x" / data-inp="x" / data-key… → the app.x action it dispatches to;
     · viewApp's `S.nav==='k' … content=viewK()` chain gives each SCREEN its root view.
   CORE is everything reachable from what the first paint and the shell run: the init IIFE, render(), viewApp's own
   shell code, viewHome, viewLanding, viewOnboarding — plus every top-level name ANOTHER shipped file reads by bare
   name (family-shell.js, trail.js, gym.js… call into app3 directly, so those must stay where a bare name can see
   them, or move behind a stub). A SCREEN's own weight is what only it reaches; SHARED is what two or more
   non-core screens reach. Run: node tools/app3-split-map.cjs [--json out.json]
   SINCE THE SPLIT (P1.13 step 2, 10 Oct 2026) app3.js IS the core: the screens' code lives in app3-*.js (CLAUDE.md "Road
   to 4.5, P1 — the app3 split"), so this measures what is left in the first load's app3 — and a screen that shows up
   here as movable is a candidate for its family's lazy file. tests/app3-split.cjs holds the split's rules.          */
'use strict';
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const APP = path.resolve(__dirname, '..');
let ts; for (const p of ['typescript', '/opt/node22/lib/node_modules/typescript']) { try { ts = require(p); break; } catch (e) {} }
if (!ts) { console.error('needs the typescript package (its parser) — /opt/node22/lib/node_modules/typescript'); process.exit(2); }
const { minifyJs } = require('./minify.cjs');
const SRC = fs.readFileSync(path.join(APP, 'app3.js'), 'utf8');
const sf = ts.createSourceFile('app3.js', SRC, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);

/* ---- nodes ---- */
const nodes = new Map();   // name -> {name, start, end, kind}
const add = (name, node, kind) => { if (!nodes.has(name)) nodes.set(name, { name, start: node.getStart(sf), end: node.end, kind, node }); };
let stmtN = 0;
for (const st of sf.statements) {
  if (ts.isFunctionDeclaration(st) && st.name) add(st.name.text, st, 'fn');
  else if (ts.isVariableStatement(st)) {
    for (const d of st.declarationList.declarations) {
      if (ts.isIdentifier(d.name) && d.name.text === 'app' && d.initializer && ts.isObjectLiteralExpression(d.initializer)) {
        for (const p of d.initializer.properties) if (p.name && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name))) add('app.' + p.name.text, p, 'act');
      } else if (ts.isIdentifier(d.name)) add(d.name.text, st.declarationList.declarations.length === 1 ? st : d, 'var');
    }
  } else add('(stmt ' + (++stmtN) + ' @' + sf.getLineAndCharacterOfPosition(st.getStart(sf)).line + ')', st, 'stmt');
}
const top = new Set([...nodes.keys()].filter((k) => !k.startsWith('(')));

/* ---- edges ---- */
const ACT = /data-(?:act|inp|key|dbl|chg)="([A-Za-z0-9_$]+)"/g;
for (const n of nodes.values()) {
  const refs = new Set();
  const walk = (x) => {
    if (ts.isIdentifier(x) && top.has(x.text) && x.text !== n.name) {
      const par = x.parent;   // skip property names (o.foo) and object keys
      if (!(par && ts.isPropertyAccessExpression(par) && par.name === x) && !(par && ts.isPropertyAssignment(par) && par.name === x)) refs.add(x.text);
    }
    if (ts.isPropertyAccessExpression(x) && ts.isIdentifier(x.expression) && x.expression.text === 'app' && nodes.has('app.' + x.name.text)) refs.add('app.' + x.name.text);
    if ((ts.isStringLiteral(x) || ts.isNoSubstitutionTemplateLiteral(x) || ts.isTemplateHead(x) || ts.isTemplateMiddle(x) || ts.isTemplateTail(x))) {
      for (const m of x.text.matchAll(ACT)) if (nodes.has('app.' + m[1])) refs.add('app.' + m[1]);
    }
    ts.forEachChild(x, walk);
  };
  walk(n.node);
  n.refs = refs;
}

/* ---- weights ---- */
const minAll = minifyJs(SRC, 'app3.js'), gzAll = zlib.gzipSync(minAll, { level: 6 }).length;
let minSum = 0;
for (const n of nodes.values()) { const t = SRC.slice(n.start, n.end); n.raw = Buffer.byteLength(t);
  let m = t; try { m = minifyJs(n.kind === 'act' ? 'x={' + t + '}' : t, n.name); } catch (e) {} n.min = Buffer.byteLength(m); minSum += n.min; }
for (const n of nodes.values()) n.gz = gzAll * n.min / minSum;   // a node's share of app3's gzip, by its minified share

/* ---- screens ---- */
const vApp = SRC.slice(nodes.get('viewApp').start, nodes.get('viewApp').end);
const screens = {};
for (const m of vApp.matchAll(/S\.nav==='([a-z0-9]+)'(?:&&[^)]*)?\)\s*content\s*=\s*([^;\n]+)/g)) {
  const roots = [...m[2].matchAll(/\b(view[A-Za-z0-9]+|hiveLoader|pageHead)\(/g)].map((x) => x[1]).filter((r) => nodes.has(r) && !/^(viewHome|hiveLoader|pageHead)$/.test(r));
  if (roots.length) (screens[m[1]] = screens[m[1]] || new Set()); roots.forEach((r) => screens[m[1]].add(r));
}
const reach = (roots) => { const seen = new Set(); const st = [...roots]; while (st.length) { const k = st.pop(); if (seen.has(k) || !nodes.has(k)) continue; seen.add(k); for (const r of nodes.get(k).refs) st.push(r); } return seen; };
/* names other shipped files read by bare name: they must stay reachable without a load */
const others = fs.readdirSync(APP).filter((f) => /\.js$/.test(f) && f !== 'app3.js' && !/^(words-|voice-|trivia-q|trivia-words|concepts-data|concept-scripts|adv-concepts|figurative|lessons-data|nsf-|scripps-data|sounds-data|southasia|trail-data|trail-map|story-data|word-|quotes-lib|analogy-data|forge-data|wordband-data|grade-map-data|placement-data)/.test(f));
const ext = new Map();
for (const f of others) { const t = fs.readFileSync(path.join(APP, f), 'utf8');
  for (const k of top) { if (k.length < 4) continue; const re = new RegExp('(^|[^.\\w$])' + k.replace(/\$/g, '\\$') + '\\b'); if (re.test(t)) { if (!ext.has(k)) ext.set(k, []); ext.get(k).push(f); } } }
const stmts = [...nodes.keys()].filter((k) => k.startsWith('('));
const CORE_ROOTS = ['render', 'viewApp', 'viewHome', 'viewLanding', 'viewOnboarding', ...stmts, ...ext.keys()].filter((k) => nodes.has(k));
/* viewApp's dispatch reaches every screen; the core is viewApp WITHOUT its screen roots */
/* the sheets and pop-ups overlays() draws behind a flag, and the whole screens render() switches to, are screens too:
   each is drawn only when its flag is up, so its code can arrive when the flag goes up */
const DISPATCH = { overlays: 'overlay', render: 'screen' };
for (const [fn, tag] of Object.entries(DISPATCH)) { if (!nodes.has(fn)) continue;
  for (const r of nodes.get(fn).refs) if (/^view[A-Z]|Sheet$|Overlay$/.test(r) && !/^(viewApp|viewHome|viewLanding|viewOnboarding)$/.test(r)) (screens[tag + ':' + r] = screens[tag + ':' + r] || new Set()).add(r); }
/* one screen per root view: navs that draw the same view (games/sq/trivia, progress/parent, settings and its sheet)
   are one screen, or their code would count as "shared" between copies of itself */
{ const byRoots = {}; for (const [k, set] of Object.entries(screens)) { const id = [...set].sort().join(','); (byRoots[id] = byRoots[id] || []).push(k); }
  for (const [id, ks] of Object.entries(byRoots)) if (ks.length > 1) { const set = screens[ks[0]]; ks.forEach((k) => delete screens[k]); screens[ks.join('/')] = set; } }
const CUT = new Set(['viewApp', ...Object.keys(DISPATCH)]);
const screenRoots = new Set([...Object.values(screens)].flatMap((s) => [...s]));
const coreReach = (() => { const seen = new Set(); const st = [...CORE_ROOTS]; while (st.length) { const k = st.pop(); if (seen.has(k) || !nodes.has(k)) continue; seen.add(k);
  for (const r of nodes.get(k).refs) if (!(CUT.has(k) && screenRoots.has(r))) st.push(r); } return seen; })();
const per = {}; const owners = new Map();
/* a screen's reach stops at the core: what the core names is loaded already */
const reachOut = (roots) => { const seen = new Set(); const st = [...roots]; while (st.length) { const k = st.pop(); if (seen.has(k) || !nodes.has(k) || coreReach.has(k)) continue; seen.add(k); for (const r of nodes.get(k).refs) st.push(r); } return seen; };
for (const [nav, roots] of Object.entries(screens)) { const r = reachOut([...roots]); per[nav] = [...r].filter((k) => !coreReach.has(k)); per[nav].forEach((k) => owners.set(k, (owners.get(k) || new Set()).add(nav))); }
const sum = (ks, f) => ks.reduce((t, k) => t + nodes.get(k)[f], 0);
const KB = (b) => (b / 1024).toFixed(1);
const core = [...coreReach];
console.log(`app3.js: ${KB(Buffer.byteLength(SRC))} KB raw · ${KB(minAll.length)} KB minified · ${KB(gzAll)} KB gzip · ${nodes.size} top-level nodes (${[...nodes.values()].filter((n) => n.kind === 'act').length} app actions)`);
console.log(`CORE (first paint + shell + names other files call): ${core.length} nodes · ${KB(sum(core, 'raw'))} KB raw · ${KB(sum(core, 'gz'))} KB gz`);
console.log(`  of which kept only because another file calls them by name: ${[...ext.keys()].filter((k) => !reach(['render', 'viewApp', 'viewHome', 'viewLanding', 'viewOnboarding', ...stmts]).has(k)).length}`);
const rows = Object.entries(per).map(([nav, ks]) => { const own = ks.filter((k) => owners.get(k).size === 1); return { nav, roots: [...screens[nav]].join(','), all: ks.length, own: own.length, ownGz: sum(own, 'gz'), ownRaw: sum(own, 'raw'), allGz: sum(ks, 'gz') }; }).sort((a, b) => b.ownGz - a.ownGz);
console.log('\nSCREEN       own KB gz  (raw)    reach KB gz  root view(s)');
for (const r of rows) console.log(`  ${r.nav.padEnd(11)} ${KB(r.ownGz).padStart(7)}  (${KB(r.ownRaw).padStart(6)})  ${KB(r.allGz).padStart(9)}  ${r.roots}`);
const shared = [...owners.entries()].filter(([, s]) => s.size > 1).map(([k]) => k);
console.log(`\nSHARED by 2+ screens (not core): ${shared.length} nodes · ${KB(sum(shared, 'gz'))} KB gz`);
const unreached = [...nodes.keys()].filter((k) => !coreReach.has(k) && !owners.has(k));
console.log(`UNREACHED from any screen or the core (actions reached only by data-act strings built at run time, dead code): ${unreached.length} nodes · ${KB(sum(unreached, 'gz'))} KB gz`);
console.log('\nheaviest CORE nodes:'); core.sort((a, b) => nodes.get(b).gz - nodes.get(a).gz).slice(0, 25).forEach((k) => console.log(`  ${KB(nodes.get(k).gz).padStart(6)} KB gz  ${k}${ext.has(k) ? '   ← read by ' + ext.get(k).slice(0, 3).join(', ') : ''}`));
/* THE PAINT CORE: what drawing the first screens needs, NOT following data-act edges into the action table (an
   action runs on a tap, after paint, and can be fetched at that moment). */
/* roots: the draw path only. The top-level statements (listeners, the init block, window.* hand-offs) are weighed on
   their own: what they name runs on an event or a hand-off, which a split can wire through a stub. */
const paintRoots = ['render', 'viewApp', 'viewHome', 'viewLanding', 'viewOnboarding', ...ext.keys()].filter((k) => nodes.has(k));
console.log(`\nTOP-LEVEL STATEMENTS (listeners, init, window.* hand-offs): ${stmts.length} · ${KB(sum(stmts, 'gz'))} KB gz of their own`);
const paint = (() => { const seen = new Set(); const st = [...paintRoots]; while (st.length) { const k = st.pop(); if (seen.has(k) || !nodes.has(k)) continue; seen.add(k);
  for (const r of nodes.get(k).refs) if (!r.startsWith('app.') && !(CUT.has(k) && screenRoots.has(r))) st.push(r); } return seen; })();
const acts = [...nodes.keys()].filter((k) => k.startsWith('app.'));
const pk = [...paint];
console.log(`\nPAINT CORE (no action edges): ${pk.length} nodes · ${KB(sum(pk, 'raw'))} KB raw · ${KB(sum(pk, 'gz'))} KB gz`);
console.log(`ACTIONS (the app table, run on a tap): ${acts.length} · ${KB(sum(acts, 'gz'))} KB gz — in the paint core only if a painted thing calls one directly: ${acts.filter((k) => paint.has(k)).length}`);
const coreNotPaint = core.filter((k) => !paint.has(k) && !k.startsWith('app.'));
console.log(`CORE but not PAINT (helpers reached only through actions): ${coreNotPaint.length} nodes · ${KB(sum(coreNotPaint, 'gz'))} KB gz`);
console.log('heaviest of those:'); coreNotPaint.sort((a, b) => nodes.get(b).gz - nodes.get(a).gz).slice(0, 25).forEach((k) => console.log(`  ${KB(nodes.get(k).gz).padStart(6)} KB gz  ${k}`));
console.log('heaviest PAINT nodes:'); pk.sort((a, b) => nodes.get(b).gz - nodes.get(a).gz).slice(0, 30).forEach((k) => console.log(`  ${KB(nodes.get(k).gz).padStart(6)} KB gz  ${k}${ext.has(k) ? '   ← read by ' + ext.get(k).slice(0, 3).join(', ') : ''}`));
const out = process.argv.indexOf('--json'); if (out > 0) fs.writeFileSync(process.argv[out + 1], JSON.stringify({ gzAll, core: core.map((k) => [k, Math.round(nodes.get(k).gz)]), screens: rows, shared: shared.map((k) => [k, Math.round(nodes.get(k).gz), [...owners.get(k)]]), unreached: unreached.map((k) => [k, Math.round(nodes.get(k).gz)]), ext: [...ext.entries()] }, null, 1));
