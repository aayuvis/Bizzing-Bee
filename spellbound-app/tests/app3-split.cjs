/* APP3 IS SPLIT BY SCREEN, AND THE CORE NEVER REACHES PAST ITS DOORS (road to 4.5, P1.13 step 2). @check

   app3.js keeps the first screens, the shell, the action table and every name another file reads by bare name; each
   screen's own code lives in a lazy app3 file (app3-library.js, app3-gym.js, app3-grownups.js, app3-games.js,
   app3-me.js, app3-tools.js, and app3-shared.js under them) that boot-lazy fetches at the screen's door. A name in a
   lazy file does not exist until its file has run, so the rules are structural, and this reads every file's syntax
   tree (the TypeScript compiler's parser; nothing is added to the app) to hold them:
     1. FILES: every lazy file is "use strict" first, is no <script> tag in index.html, is registered in boot-lazy
        (REG), and its group carries app3-shared.js before it (DEPS) and the boot word tier where its screens read words.
     2. ONE HOME PER NAME: no top-level name is declared in two app3 files, and no action is defined twice.
     3. THE CORE'S DOORS: app3.js names a lazy file's top-level name ONLY inside a door — viewApp's dispatch chain on a
        nav SCR_NAV sends to that file's group (the guard above the chain holds the screen until it is in), or the
        arrow handed to scrDraw(group, () => fn()) for that group (a bare fn argument is read before scrDraw runs).
        Anywhere else it would throw before the file landed.
     4. THE LAZY FILES' REACH: a screen file names app3's names, app3-shared.js's and its own — never another screen
        file's; app3-shared.js names only app3's and its own. (Each runs after app3.js; shared runs before the rest.)
     5. NO OTHER FILE reaches into a lazy file by bare name: every other shipped script, saga-art/, and index.html's
        inline scripts (they run before any door has opened).
     6. THE ACTIONS: each lazy file's Object.assign(app, {…}) defines exactly the actions SCR_ACTS names for its group,
        none of them is also in app3's own table, and every SCR_NAV / scrDraw group is a real lazy group.
   The browser half (every lazy screen opens from a cold page by its address and its tab, over http and file://, a tap
   on a stub waits and runs) is tests/screens-lazy.cjs.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/app3-split.cjs
   PROVED by breaking (each put in, watched to fail, taken out): the word card's pop-up drawn outside scrDraw (1: §3,
   viewWordCardPop named at app3.js); a bare viewSetDeck handed to scrDraw instead of an arrow (1: §3); ttListClose
   left out of SCR_ACTS (1: §6); app3-me.js calling viewBuilder (1: §4); viewBuilder declared in app3-gym.js too (1:
   §2); app3-me.js put back in index.html (1: §1); scrLib's DEPS on scrShared deleted (1: §1).                    */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const APP = process.env.SB_ROOT || path.resolve(__dirname, '..');
let ts; for (const p of ['typescript', '/opt/node22/lib/node_modules/typescript']) { try { ts = require(p); break; } catch (e) {} }
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const read = (f) => fs.readFileSync(path.join(APP, f), 'utf8');
const some = (a) => (a.length ? ' — ' + a.slice(0, 6).join(' · ') + (a.length > 6 ? ' … (' + a.length + ')' : '') : '');
if (!ts) { console.log('  FAIL needs the typescript package (its parser): /opt/node22/lib/node_modules/typescript'); process.exit(1); }

const LAZY = fs.readdirSync(APP).filter((f) => /^app3-[a-z0-9-]+\.js$/.test(f)).sort();
const parse = (f) => { const src = read(f); return { f, src, sf: ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS) }; };
const P = { 'app3.js': parse('app3.js') }; LAZY.forEach((f) => { P[f] = parse(f); });

/* top-level declarations, and the actions each file defines */
const decl = {}, acts = {};
for (const [f, { sf }] of Object.entries(P)) {
  decl[f] = new Map(); acts[f] = new Set();
  for (const st of sf.statements) {
    if (ts.isFunctionDeclaration(st) && st.name) decl[f].set(st.name.text, st);
    else if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) {
      if (ts.isIdentifier(d.name)) decl[f].set(d.name.text, st);
      if (ts.isIdentifier(d.name) && d.name.text === 'app' && d.initializer && ts.isObjectLiteralExpression(d.initializer))
        d.initializer.properties.forEach((p) => p.name && acts[f].add(p.name.text));
    }
    /* Object.assign(app, { … }) in a lazy file */
    if (ts.isExpressionStatement(st) && ts.isCallExpression(st.expression) && /^Object\.assign$/.test(st.expression.expression.getText(sf))
      && st.expression.arguments[0] && st.expression.arguments[0].getText(sf) === 'app' && ts.isObjectLiteralExpression(st.expression.arguments[1]))
      st.expression.arguments[1].properties.forEach((p) => p.name && acts[f].add(p.name.text));
  }
}
/* the core's tables, read by evaluating their literals */
const lit = (name) => { const st = decl['app3.js'].get(name); if (!st) return null; const d = st.declarationList.declarations.find((x) => x.name.text === name);
  return vm.runInNewContext('(' + d.initializer.getText(P['app3.js'].sf) + ')', {}); };
const SCR_ACTS = lit('SCR_ACTS') || {}, SCR_NAV = lit('SCR_NAV') || {}, SCR_GROUP = lit('SCR_GROUP') || {};
const lazyBoot = read('boot-lazy.js');
const G = { addEventListener() {}, dispatchEvent() {} };
new Function('window', 'document', 'navigator', 'requestAnimationFrame', 'CustomEvent', lazyBoot)(G, { readyState: 'loading', addEventListener() {}, querySelector() { return null; } }, {}, () => {}, function () {});
const REG = G.SB_LAZY.reg, GROUP = G.SB_LAZY.group;
const regOf = {}; for (const [k, v] of Object.entries(REG)) if (typeof v === 'string' && /^app3-/.test(v)) regOf[v] = k;
const fileOfReg = {}; for (const [f, k] of Object.entries(regOf)) fileOfReg[k] = f;
const SHARED = 'app3-shared.js';

/* 1 — files */
const html = read('index.html');
const tags = [...html.matchAll(/<script[^>]*\ssrc="([^"?]+)/g)].map((m) => m[1]);
ok(LAZY.length >= 6 && LAZY.includes(SHARED), 'the lazy app3 files: ' + LAZY.join(', '));
ok(LAZY.every((f) => /^"use strict";/.test(P[f].src)), 'each lazy file is strict, like app3.js (its first line)');
ok(!tags.some((t) => /^app3-/.test(t)) && tags.includes('app3.js'), 'index.html loads app3.js and none of the lazy files');
const missReg = LAZY.filter((f) => !regOf[f]);
ok(!missReg.length, 'boot-lazy registers every lazy file (REG)' + some(missReg));
const lazyDeps = /var DEPS = (\{[\s\S]*?\});/.exec(lazyBoot); const DEPS = lazyDeps ? vm.runInNewContext('(' + lazyDeps[1] + ')', {}) : {};
const noShared = LAZY.filter((f) => f !== SHARED && !((DEPS[regOf[f]] || []).includes(regOf[SHARED])));
ok(!noShared.length, 'every screen file runs after app3-shared.js (DEPS)' + some(noShared));
const scrGroups = Object.keys(SCR_GROUP);
const badGroup = scrGroups.filter((g) => !(GROUP[g] || []).includes(g) && !(GROUP[g] || []).some((n) => fileOfReg[n]));
ok(scrGroups.length >= 6 && !badGroup.length, 'every SCR_GROUP is a boot-lazy group that fetches its file' + some(badGroup));
const wordless = ['scrMe'];
const noWords = scrGroups.filter((g) => !wordless.includes(g) && !(GROUP[g] || []).includes('words1'));
ok(!noWords.length, 'every screen group that reads words carries the boot word tier (all but ' + wordless.join(', ') + ')' + some(noWords));
const idle = (/var IDLE = (\[[\s\S]*?\]);/.exec(lazyBoot) || [])[1] || '[]';
const notIdle = LAZY.filter((f) => !vm.runInNewContext(idle, {}).includes(regOf[f]));
ok(!notIdle.length, 'every lazy file is on the idle queue — offline after the first tap' + some(notIdle));

/* 2 — one home per name */
const twice = [];
const all = new Map(); for (const [f, m] of Object.entries(decl)) for (const k of m.keys()) { if (all.has(k)) twice.push(k + ' (' + all.get(k) + ', ' + f + ')'); else all.set(k, f); }
ok(!twice.length, 'no top-level name is declared in two app3 files' + some(twice));
const actTwice = []; const actAt = new Map();
for (const [f, s] of Object.entries(acts)) for (const k of s) { if (actAt.has(k)) actTwice.push(k + ' (' + actAt.get(k) + ', ' + f + ')'); else actAt.set(k, f); }
ok(!actTwice.length, 'no action is defined in two app3 files' + some(actTwice));

/* references: identifiers that name a top-level declaration of ANOTHER file, outside property positions */
function refs(f, names) {
  const { sf } = P[f]; const out = [];
  const walk = (x) => {
    if (ts.isIdentifier(x) && names.has(x.text)) { const par = x.parent;
      const prop = par && ((ts.isPropertyAccessExpression(par) && par.name === x) || (ts.isPropertyAssignment(par) && par.name === x) || (ts.isMethodDeclaration(par) && par.name === x)
        || (ts.isFunctionDeclaration(par) && par.name === x) || (ts.isVariableDeclaration(par) && par.name === x) || ts.isParameter(par) || (ts.isBindingElement(par)));
      if (!prop) out.push(x); }
    ts.forEachChild(x, walk);
  };
  walk(sf); return out;
}
const lazyNames = new Map(); for (const f of LAZY) for (const k of decl[f].keys()) lazyNames.set(k, f);

/* 3 — the core's doors */
const core = P['app3.js'];
const bad3 = [];
for (const id of refs('app3.js', new Set(lazyNames.keys()))) {
  const name = id.text, f = lazyNames.get(name), grp = regOf[f]; let p = id.parent, door = false;
  /* scrDraw('<grp>', fn) — the name is the function argument, for its own group */
  while (p && !ts.isSourceFile(p)) {
    /* scrDraw('<grp>', () => fn()) — only inside the ARROW: a bare fn argument is read before scrDraw can hold it */
    if (ts.isCallExpression(p) && p.expression.getText(core.sf) === 'scrDraw' && p.arguments[0] && ts.isStringLiteral(p.arguments[0])) {
      const fnArg = p.arguments[1]; door = !!fnArg && (ts.isArrowFunction(fnArg) || ts.isFunctionExpression(fnArg)) && id.pos >= fnArg.pos && id.end <= fnArg.end
        && (p.arguments[0].text === grp || (GROUP[p.arguments[0].text] || []).includes(grp)); break; }
    if (ts.isIfStatement(p) && /S\.nav==='([a-z0-9]+)'/.test(p.expression.getText(core.sf))) {
      const nav = /S\.nav==='([a-z0-9]+)'/.exec(p.expression.getText(core.sf))[1];
      /* the branch's own statement (thenStatement), in viewApp, on a nav the guard sends to this group */
      let fn = p; while (fn && !ts.isFunctionDeclaration(fn)) fn = fn.parent;
      if (fn && fn.name && fn.name.text === 'viewApp' && (SCR_NAV[nav] === grp || (GROUP[SCR_NAV[nav]] || []).includes(grp)) && id.pos >= p.thenStatement.pos && id.end <= p.thenStatement.end) { door = true; break; }
    }
    p = p.parent;
  }
  if (!door) bad3.push(name + ' (' + f + ') at app3.js:' + (core.sf.getLineAndCharacterOfPosition(id.getStart(core.sf)).line + 1));
}
ok(!bad3.length, 'app3.js names a lazy file\'s code only through its doors (viewApp\'s guarded chain, scrDraw)' + some(bad3));
const guard = /const _need=SCR_NAV\[S\.nav\][^;]*;\s*if\(_need&&!scrReady\(_need\)\) content=\(lazyNeed\(_need/.test(core.src);
ok(guard, 'viewApp holds a lazy screen with the hive loader until its group is in (the guard above the chain)');

/* 4 — the lazy files' reach */
const bad4 = [];
for (const f of LAZY) {
  const others = new Set([...lazyNames.entries()].filter(([, g]) => g !== f && !(f !== SHARED && g === SHARED)).map(([k]) => k));
  for (const id of refs(f, others)) bad4.push(id.text + ' (' + lazyNames.get(id.text) + ') in ' + f + ':' + (P[f].sf.getLineAndCharacterOfPosition(id.getStart(P[f].sf)).line + 1));
}
ok(!bad4.length, 'a screen file reaches only app3.js, app3-shared.js and itself; app3-shared.js only app3.js and itself' + some(bad4));

/* 5 — nobody else reaches in */
const listJs = (d) => (fs.existsSync(path.join(APP, d)) ? fs.readdirSync(path.join(APP, d)) : []).filter((f) => /\.js$/.test(f)).map((f) => path.join(d, f));
const DATA = /^(words-|voice-|trivia-q|trivia-words|concepts-data|concept-scripts|adv-concepts|figurative|lessons-data|nsf-|scripps-data|sounds-data|southasia|trail-data|trail-map|story-data|word-|quotes-lib|analogy-data|forge-data|wordband-data|grade-map-data|placement-data|curriculum-|trail-home-data)/;
const otherFiles = listJs('.').filter((f) => !/^app3/.test(path.basename(f)) && !DATA.test(path.basename(f))).concat(listJs('saga-art'));
const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n');
const bad5 = [];
for (const [f, t] of otherFiles.map((f) => [f, read(f)]).concat([['index.html (inline)', inline]])) {
  for (const k of lazyNames.keys()) { if (k.length < 4) continue; const re = new RegExp('(^|[^.\\w$\'"-])' + k.replace(/\$/g, '\\$') + '\\b(?!\\s*:)');
    if (re.test(t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1'))) bad5.push(k + ' in ' + f); }
}
ok(!bad5.length, 'no other shipped script reads a lazy app3 file\'s names by bare name' + some(bad5));

/* 6 — the actions */
const stubbed = new Map(); for (const [g, s] of Object.entries(SCR_ACTS)) for (const k of s.split(' ')) stubbed.set(k, g);
const bad6 = [];
for (const f of LAZY) { const g = regOf[f];
  for (const k of acts[f]) { if (stubbed.get(k) !== g) bad6.push(k + ' (in ' + f + ', stubbed ' + (stubbed.get(k) || 'nowhere') + ')'); if (acts['app3.js'].has(k)) bad6.push(k + ' is in app3\'s own table too'); } }
for (const [k, g] of stubbed) { const f = fileOfReg[g]; if (!f || !acts[f] || !acts[f].has(k)) bad6.push(k + ' (stubbed for ' + g + ', defined in ' + (f || 'no file') + '? no)'); }
ok(stubbed.size > 100 && !bad6.length, `every lazy action is stubbed in app3.js for its own file and defined there — ${stubbed.size} actions` + some(bad6));
const navBad = Object.entries(SCR_NAV).filter(([, g]) => !fileOfReg[g] && !(GROUP[g] || []).some((n) => fileOfReg[n]));
ok(Object.keys(SCR_NAV).length > 20 && !navBad.length, `SCR_NAV sends ${Object.keys(SCR_NAV).length} navs to real lazy groups` + some(navBad.map(([n, g]) => n + '→' + g)));

console.log(fails ? `\n${fails} FAILED` : '\napp3 is split by screen, and the core reaches its screens only through their doors');
process.exit(fails ? 1 : 0);
