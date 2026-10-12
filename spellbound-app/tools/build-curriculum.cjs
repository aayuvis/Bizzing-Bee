#!/usr/bin/env node
/* HOME'S CURRICULUM AS GENERATED DATA (road to 4.5, P1.13 step 1 — first-load JS ≤ 400 KB gzip).

   words-data.js (the boot word tier, ~353 KB gz) used to be a boot script because Home's first render built the
   curriculum from it: the 20 default stages (defaultStages), the Bizzing Bee Journey ladder (journeySorted, via
   mastDueWords → wordIndex) and the word of the hour (wohPool). It is lazy now (boot-lazy group `words1`), so what
   that first render computed is written here, ONCE, by app3's own code over the boot tier — never typed:

     stages   the 20 default stages as words, = buildDefaultStages(boot tier) — stage 1 leads with app2's WORDS;
     ladder   the Journey order as words, = buildJourneySorted(boot tier), scored as a returning speller's first
              render scored it: with NO homophone bonus (SB_HOM is in sounds-data.js, lazy, and had not landed);
     woh      the word of the hour's seed: per band 1–4, every SEED_STEP-th word of the pool wohBandPool gives over the
              boot tier with the band file not yet loaded (each record's own ceiling) — the pool that render drew from,
              in its order, thinned to at most SEED_MAX a band — each as [word, meaning, respelling], what the tile
              shows (the meaning to its 85th character: the tile's trunc(d, 84) reads no further). The whole pools are 174 KB gz (5,955 words); the thinned seed is the price of a first screen.

   Two files: curriculum-data.js (stages + woh, a BOOT script — the demo household and the tile read them before
   any word file) and curriculum-ladder.js (the ladder, 25 KB gz, which nothing on a first screen reads: it rides
   in boot-lazy's `words1` bundle with the boot tier it maps onto).

   The boot tier is loaded the way the page loads it: words-data.js, words-extra.js, words-patch.js (its QC pass runs
   at the end of the file), then kid-safe.js and wordband.js, in one window-shaped context. app3's functions come out
   of the app source through tools/app3-closure.cjs (the roots and every top-level name they use), and app2's WORDS
   by its literal. Two hand-offs app3 makes by statement, not declaration, are made here by name: window.SB_UNSAFE_RE
   and window.SB_CORE_STRIKE (kid-safe.js reads both).

   tests/curriculum.cjs rebuilds and compares (node, data gate), and checks the page agrees in a browser.

     node tools/build-curriculum.cjs           write curriculum-data.js
     node tools/build-curriculum.cjs --check   exit 1 if curriculum-data.js is not what this would write
     node tools/build-curriculum.cjs --stats   print the sizes                                                      */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), zlib = require('zlib');
const { closure } = require('./app3-closure.cjs');
const APP = path.resolve(__dirname, '..');
const OUT = path.join(APP, 'curriculum-data.js'), OUT_LADDER = path.join(APP, 'curriculum-ladder.js');
const SEED_MAX = 160;   // words a band in the word of the hour's seed
/* the tile prints trunc(d, 84), which reads no further than character 85 (more than 84 → cut at 84): the seed carries that much */
const WOH_D = 84;
const BOOT = ['words-data.js', 'words-extra.js', 'words-patch.js'];
const ROOTS = ['buildDefaultStages', 'buildJourneySorted', 'wohBandPool', 'SB_UNSAFE_RE', 'CORE_STRIKE', 'CORE_CUT', 'nkey'];
let ts; for (const p of ['typescript', '/opt/node22/lib/node_modules/typescript']) { try { ts = require(p); break; } catch (e) {} }

/* a top-level `const NAME = <literal>` of a shipped file, evaluated alone */
function literal(file, name) {
  const src = fs.readFileSync(path.join(APP, file), 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  for (const st of sf.statements) if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations)
    if (ts.isIdentifier(d.name) && d.name.text === name) return vm.runInNewContext('(' + d.initializer.getText(sf) + ')', {});
  throw new Error('build-curriculum: no ' + name + ' in ' + file);
}

/* the boot tier and app3's own code, in one window-shaped context — as the page has them at Home's first render */
function context() {
  const win = { console }; win.window = win; win.document = {};
  const ctx = vm.createContext(win);
  for (const f of BOOT.concat(['kid-safe.js', 'wordband.js'])) vm.runInContext(fs.readFileSync(path.join(APP, f), 'utf8'), ctx, { filename: f });
  win.WORDS_LITERAL = literal('app2.js', 'WORDS');
  vm.runInContext('const WORDS = window.WORDS_LITERAL;\n' + closure(ROOTS) + '\nwindow.SB_UNSAFE_RE = SB_UNSAFE_RE; window.SB_CORE_STRIKE = CORE_STRIKE;', ctx, { filename: 'app3-closure' });
  return { win, ctx };
}

function build() {
  const { win, ctx } = context();
  const nsf = win.SB_DATA.nsf;
  const run = (expr) => vm.runInContext(expr, ctx);
  win._NSF = nsf;
  const stages = run('buildDefaultStages(window._NSF)').map((s) => s.words.map((w) => w.w));
  const ladder = run('buildJourneySorted(window._NSF)').map((w) => w.w);
  const woh = {};
  for (const b of [1, 2, 3, 4]) { const pool = run('wohBandPool(window._NSF,' + b + ',window.SB_BAND,false)'); const k = Math.max(1, Math.ceil(pool.length / SEED_MAX));
    woh[b] = pool.filter((e, i) => i % k === 0).map((e) => [e.w, e.d.length > WOH_D ? e.d.slice(0, WOH_D + 1) : e.d, e.p]); }
  return { n: nsf.length, stages, ladder, woh };
}

function write(C) {
  const say = (what) => '/* ' + what + ' — GENERATED by tools/build-curriculum.cjs from the boot word tier (words-data.js +\n' +
    '   words-extra.js + words-patch.js) with app3\'s own code. Never edit it by hand: change the words or the algorithm and\n' +
    '   re-run the tool; tests/curriculum.cjs rebuilds and compares. Road to 4.5, P1.13 step 1: what a returning speller\'s\n' +
    '   first render used to compute, so Home draws without the boot tier (boot-lazy `words1`). */\n';
  const data = say('curriculum-data.js — the 20 default stages and the word of the hour\'s seed') +
    'window.SB_CURRICULUM=Object.assign(window.SB_CURRICULUM||{},{"v":1,"n":' + C.n + ',\n"stages":' + JSON.stringify(C.stages) +
    ',\n"woh":{' + [1, 2, 3, 4].map((b) => '"' + b + '":' + JSON.stringify(C.woh[b])).join(',\n') + '}});\n';
  const ladder = say('curriculum-ladder.js — the Journey ladder (lazy, in the words1 bundle)') +
    '(window.SB_CURRICULUM=window.SB_CURRICULUM||{}).ladder=' + JSON.stringify(C.ladder) + ';\n';
  return { data, ladder };
}

if (require.main === module) {
  const C = build(); const T = write(C);
  if (process.argv.includes('--stats') || process.argv.includes('--check')) {
    const gz = (s) => (zlib.gzipSync(s, { level: 6 }).length / 1024).toFixed(1);
    console.log(`boot tier ${C.n} records · stages ${C.stages.map((s) => s.length).join(',')} · ladder ${C.ladder.length} · woh ${[1, 2, 3, 4].map((b) => b + ':' + C.woh[b].length).join(' ')}`);
    console.log(`curriculum-data.js ${(Buffer.byteLength(T.data) / 1024).toFixed(1)} KB raw · ${gz(T.data)} KB gz; curriculum-ladder.js ${(Buffer.byteLength(T.ladder) / 1024).toFixed(1)} KB raw · ${gz(T.ladder)} KB gz`);
  }
  if (process.argv.includes('--check')) {
    const bad = [[OUT, T.data], [OUT_LADDER, T.ladder]].filter(([f, t]) => !fs.existsSync(f) || fs.readFileSync(f, 'utf8') !== t);
    if (bad.length) { console.error(bad.map(([f]) => path.basename(f)).join(', ') + ' NOT what tools/build-curriculum.cjs writes — re-run it'); process.exit(1); }
    console.log('curriculum-data.js and curriculum-ladder.js are current'); process.exit(0);
  }
  if (!process.argv.includes('--stats')) { fs.writeFileSync(OUT, T.data); fs.writeFileSync(OUT_LADDER, T.ladder); console.log('wrote curriculum-data.js and curriculum-ladder.js'); }
}
module.exports = { build, write, context, OUT, OUT_LADDER, BOOT, SEED_MAX };
