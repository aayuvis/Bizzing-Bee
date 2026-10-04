#!/usr/bin/env node
/* The test runner — `npm test` (everything) and `npm run check` (the deploy gate).

   WHY IT EXISTS. The app grew ~50 test files with no runner: each one was run by hand,
   with a Chromium path typed into it, and "the tests pass" meant "the ones somebody
   remembered to run passed". This runs ALL of them, one at a time, and says which failed.

   DISCOVERY IS A GLOB, NOT A LIST. Every tests/*.cjs, tests/*.js and tests/*.mjs is a test unless it is
   in SKIP below with a reason. A new test is picked up the moment it lands; nobody has to
   remember to register it. Helpers live in tests/lib/ (this folder), which is not globbed.

   TWO KINDS. A file that requires playwright is a BROWSER test; anything else is a NODE
   test (data-lint, word-bank, trail-map, arcade-geometry…). Node tests are cheap and run
   first, so a broken data file fails in seconds rather than after twenty browser tests.

   ONE BROWSER AT A TIME. Browser tests share the machine with whatever else is running and
   several of them measure timing; running them in parallel made them flaky, not faster.

   THE CHECK SUBSET (`--check`) is what a deploy waits on. It must stay under ~5 minutes,
   so it is the guards that protect the trust rules and the first screen: the node data
   lints, no default login, the grown-up PIN, privacy (no third-party hosts), the boot
   budget, offline, and the a11y pass. A test can also opt itself in with a comment line
   containing `@check` — so a batch adding a guard does not have to edit this file.

   Usage:
     node tests/lib/run.cjs                 every test
     node tests/lib/run.cjs --check         the deploy gate
     node tests/lib/run.cjs header-search reader     only tests whose name contains one of these
     node tests/lib/run.cjs --root <dir>    run against another tree (a deploy tree): the
                                            tests folder is copied into it for the run and
                                            removed afterwards — "test the tree you pushed"
     --browser-only                         skip the node tests (they read SOURCE text and
                                            data, which a minified deploy tree no longer is)
     --node-only                            only the node tests: the word data, the lists, the
                                            counts — the deploy's data gate (owner, 4 Oct 2026)
     --cpu <n>                              slow every page down n times (Chromium's own CPU
                                            throttle, tests/lib/throttle.cjs) — how a test that
                                            sleeps instead of waiting is caught BEFORE a loaded
                                            machine catches it; timeouts are scaled to match
     --repeat <n>                           run the picked tests n times (a flake is a rate)
   Env: SB_CHROME overrides the browser; SB_TEST_TIMEOUT (seconds) overrides every timeout;
   SB_CPU_THROTTLE is the same as --cpu. */
'use strict';
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');

const HERE = path.resolve(__dirname, '..');            // spellbound-app/tests
const APP = path.resolve(HERE, '..');                  // spellbound-app

/* Not tests. Each needs a reason a person can check. */
const SKIP = {
  'ux-personas.cjs': 'a persona walk-through that WRITES A REPORT (no pass/fail exit code, and its output path is an old session\'s scratchpad) — run it by hand when you want the report',
};

/* Tests that assert on SOURCE TEXT — a comment, a quoted constant, a function's
   toString — as well as on behaviour. Against a minified deploy tree (--root) those
   assertions fail by construction (comments are gone, 'x' becomes "x", locals are
   renamed), so --root skips them; their behavioural halves were proved against the
   source, and a full browser run of the minified tree on 2 Oct 2026 showed every one of
   these failing ONLY on its source-text lines. */
const SOURCE_TEXT = {
  'loading-state.cjs': 'viewTrivTrain asserted from app3.js text',
  'living-advanced.cjs': 'art keys read from trail.js text', 'living-atlas.cjs': 'art keys read from trail.js text',
  'living-cast.cjs': 'cast table read from trail.js text', 'living-meadow.cjs': 'comments read from trail.js',
  'reader.cjs': 'art paths read from reader.js text', 'ux-826.cjs': 'timings read from app3.js text',
  'result-screen.cjs': "engines' toString must contain SGUI.result (a renamed local in minified code)",
  'telemetry.cjs': 'drives backend.html, which is never deployed',
};

/* Known-slow tests get a longer leash. Seconds. Everything else gets DEFAULT_TIMEOUT.
   Times are from the full sequential run on a shared 4-core box; the limit is ~2.5x that. */
const DEFAULT_TIMEOUT = 300;
const TIMEOUT = {
  'ux-826.cjs': 900,
  'living-cast.cjs': 900,
  'living-atlas.cjs': 900,
  'living-advanced.cjs': 900,
  'gp-handling.cjs': 600,
  'gp-world.cjs': 600,
  'gp-kart.cjs': 600,
  'champion-expedition.cjs': 600,
  'mobile-layout.cjs': 600,
  'reader.cjs': 600,
  'a11y-axe.cjs': 600,
  'feed-screen.cjs': 900,      // every card route (thousands of word cards) and 24 world × look contrast passes
  'result-screen.cjs': 1200,   // 70s per engine, eleven engines
  'console-clean.cjs': 900,    // three full walks (44 routes, 20 actions each); 262s in a full run, over 300 under load
  'games-bots.mjs': 1800,      // every game and hub mode x three bots (games spec §8); ran past 300s on 4 Oct 2026
};

/* The deploy gate. Fast, and each one guards a promise made to a parent. */
const CHECK = [
  'data-lint.cjs', 'word-bank.cjs', 'word-synonyms.cjs', 'trail-map.cjs', 'coach-rules.js',
  'arcade-geometry.js',
  'no-default-login.cjs', 'pin-mandatory.cjs', 'privacy-requests.cjs', 'first-load.cjs',
  'offline-pwa.cjs', 'a11y-axe.cjs', 'loading-state.cjs', 'header-search.cjs', 'tts-once.cjs',
];

const args = process.argv.slice(2);
const flag = f => args.includes(f);
const opt = f => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const CHECK_ONLY = flag('--check');
const BROWSER_ONLY = flag('--browser-only');
const NODE_ONLY = flag('--node-only');
const ROOT = opt('--root') ? path.resolve(opt('--root')) : null;
const CPU = +(opt('--cpu') || process.env.SB_CPU_THROTTLE || 0);
const REPEAT = Math.max(1, +(opt('--repeat') || 1));
const filters = args.filter((a, i) => !a.startsWith('--') && !['--root', '--cpu', '--repeat'].includes(args[i - 1]));

/* The browser: SB_CHROME if set; else the machine's pinned Chromium if it exists; else
   whatever Playwright installed (that is the CI path — `npx playwright install chromium`).
   Exported in the child's env, so a test that only reads SB_CHROME works everywhere too. */
function chromePath() {
  if (process.env.SB_CHROME) return process.env.SB_CHROME;
  const pinned = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
  if (fs.existsSync(pinned)) return pinned;
  try { const p = require(resolvePlaywright()).chromium.executablePath(); if (p && fs.existsSync(p)) return p; } catch (e) {}
  return '';
}
function resolvePlaywright() {
  for (const base of [path.join(APP, 'node_modules'), '/opt/node22/lib/node_modules']) {
    const p = path.join(base, 'playwright');
    if (fs.existsSync(p)) return p;
  }
  return 'playwright';
}

function discover(dir) {
  return fs.readdirSync(dir).filter(f => /\.(cjs|js|mjs)$/.test(f) && fs.statSync(path.join(dir, f)).isFile()).sort();
}
const isBrowser = src => /require\(\s*['"]playwright['"]\s*\)/.test(src);
const optsIn = src => /^\s*(\/\/|\/?\*).*@check\b/m.test(src);

let current = null;
process.on('SIGINT', () => { try { if (current) process.kill(-current.pid, 'SIGKILL'); } catch (e) {} process.exit(130); });
function runOne(dir, file, env, limit) {
  return new Promise(resolve => {
    const t0 = Date.now();
    // detached = its own process group, so a timeout takes the browser down with the test
    const pre = CPU > 1 ? ['--require', path.join(__dirname, 'throttle.cjs')] : [];
    const child = spawn(process.execPath, [...pre, path.join(dir, file)], { cwd: path.dirname(dir), env, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
    current = child;
    let out = '';
    child.stdout.on('data', d => { out += d; });
    child.stderr.on('data', d => { out += d; });
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; try { process.kill(-child.pid); } catch (e) {} child.kill('SIGKILL'); }, limit * 1000);
    child.on('close', code => {
      clearTimeout(timer); current = null;
      resolve({ code, timedOut, out, secs: (Date.now() - t0) / 1000 });
    });
  });
}

(async () => {
  /* --root: run the suite against another tree by putting the tests beside it. */
  let dir = HERE, cleanup = null;
  if (ROOT) {
    const dst = path.join(ROOT, 'tests');
    if (path.resolve(dst) !== HERE) {
      if (fs.existsSync(dst)) { console.error('refusing: ' + dst + ' already exists'); process.exit(2); }
      fs.cpSync(HERE, dst, { recursive: true, filter: s => !path.relative(HERE, s).startsWith('build') });
      cleanup = () => fs.rmSync(dst, { recursive: true, force: true });
      dir = dst;
    }
  }
  const all = discover(dir);
  let picked = all.filter(f => !SKIP[f]);
  if (CHECK_ONLY) picked = picked.filter(f => CHECK.includes(f) || optsIn(fs.readFileSync(path.join(dir, f), 'utf8')));
  if (filters.length) picked = picked.filter(f => filters.some(q => f.includes(q)));
  if (BROWSER_ONLY) picked = picked.filter(f => isBrowser(fs.readFileSync(path.join(dir, f), 'utf8')));
  if (NODE_ONLY) picked = picked.filter(f => !isBrowser(fs.readFileSync(path.join(dir, f), 'utf8')));
  const textSkipped = ROOT ? picked.filter(f => SOURCE_TEXT[f]) : [];
  if (ROOT) picked = picked.filter(f => !SOURCE_TEXT[f]);
  const missingCheck = CHECK_ONLY ? CHECK.filter(f => !all.includes(f)) : [];

  const chrome = chromePath();
  const env = Object.assign({}, process.env, {
    SB_CHROME: chrome,
    NODE_PATH: [path.join(APP, 'node_modules'), '/opt/node22/lib/node_modules', process.env.NODE_PATH || ''].filter(Boolean).join(path.delimiter),
  });
  if (ROOT) { env.SRC = ROOT; env.SHELF_SRC = ROOT; }
  if (CPU > 1) env.SB_CPU_THROTTLE = String(CPU);
  const kinds = {};
  for (const f of picked) kinds[f] = isBrowser(fs.readFileSync(path.join(dir, f), 'utf8')) ? 'browser' : 'node';
  // node tests first: a broken data file should fail in seconds, not after the browsers
  picked.sort((a, b) => (kinds[a] === kinds[b] ? 0 : kinds[a] === 'node' ? -1 : 1) || a.localeCompare(b));

  const logDir = path.join(HERE, 'build', 'logs');
  fs.mkdirSync(logDir, { recursive: true });
  if (REPEAT > 1) picked = [].concat(...Array.from({ length: REPEAT }, () => picked));
  console.log(`${CHECK_ONLY ? 'CHECK' : 'FULL'} run: ${picked.length} tests (${picked.filter(f => kinds[f] === 'node').length} node, ${picked.filter(f => kinds[f] === 'browser').length} browser), one at a time` +
    `${ROOT ? ' against ' + ROOT : ''}${CPU > 1 ? ', CPU throttled ' + CPU + 'x' : ''}\nbrowser: ${chrome || '(Playwright default)'}\nlogs: ${logDir}\n`);
  const rows = [];
  const T0 = Date.now();
  const nth = {};
  for (const f of picked) {
    nth[f] = (nth[f] || 0) + 1;
    const log = f.replace(/\.(c?js)$/, REPEAT > 1 ? '.' + nth[f] + '.log' : '.log');
    const limit = +process.env.SB_TEST_TIMEOUT || (TIMEOUT[f] || DEFAULT_TIMEOUT) * Math.max(1, CPU);
    process.stdout.write(`  ${f.padEnd(30)} ${kinds[f].padEnd(8)}`);
    const r = await runOne(dir, f, env, limit);
    fs.writeFileSync(path.join(logDir, log), r.out);
    const res = r.timedOut ? 'TIMEOUT' : r.code === 0 ? 'PASS' : 'FAIL';
    const why = res === 'PASS' ? '' : (r.timedOut ? `over ${limit}s` :
      (r.out.split('\n').filter(l => /FAIL|Error|error|✗|ISSUE|not ok/.test(l))[0] || r.out.trim().split('\n').slice(-1)[0] || '').trim().slice(0, 110));
    rows.push({ f, kind: kinds[f], res, secs: r.secs, why, log });
    console.log(`${res.padEnd(8)} ${r.secs.toFixed(1).padStart(6)}s ${why}`);
  }
  if (cleanup) cleanup();

  const bad = rows.filter(r => r.res !== 'PASS');
  const line = '-'.repeat(78);
  console.log('\n' + line + '\n  ' + 'test'.padEnd(30) + 'kind'.padEnd(9) + 'result'.padEnd(9) + 'time\n' + line);
  for (const r of rows) console.log('  ' + r.f.padEnd(30) + r.kind.padEnd(9) + r.res.padEnd(9) + r.secs.toFixed(1).padStart(6) + 's');
  for (const [f, why] of Object.entries(SKIP)) if (all.includes(f) && !CHECK_ONLY && !filters.length) console.log('  ' + f.padEnd(30) + '-'.padEnd(9) + 'SKIP'.padEnd(9) + '       ' + why.slice(0, 60) + '…');
  console.log(line);
  console.log(`  ${rows.length - bad.length} passed, ${bad.length} failed, ${((Date.now() - T0) / 1000).toFixed(0)}s total`);
  if (missingCheck.length) console.log(`  NOTE: check list names ${missingCheck.join(', ')} — not found`);
  for (const f of textSkipped) console.log(`  ${f.padEnd(30)}skipped on a deploy tree — ${SOURCE_TEXT[f]}`);
  for (const r of bad) {
    console.log(`\n--- ${r.f} (${r.res}) — last lines of ${path.join('tests/build/logs', r.log)}`);
    const out = fs.readFileSync(path.join(logDir, r.log), 'utf8').trim().split('\n');
    console.log(out.slice(-15).map(l => '    ' + l.slice(0, 200)).join('\n'));
  }
  process.exit(bad.length || !rows.length ? 1 : 0);
})();
