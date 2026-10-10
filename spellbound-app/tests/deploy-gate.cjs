/* THE DEPLOY REFUSES A TREE THE WHOLE SUITE HAS NOT PASSED (P0.18, 10 Oct 2026) — @check

   "deploy.sh refuses to publish on any red." The full suite takes ~100 minutes, so the deploys keep the
   owner's fast data gate (4 Oct) and ADD a refusal: tests/lib/run.cjs records every whole-suite run in
   tests/build/last-full.json, naming the git tree it tested, and both deploy scripts refuse unless that
   record is green and names the tree being published. This test runs the real pieces in a throwaway git
   repository — the real runner, the real record reader, the real deploy scripts stopped at their gate
   (DEPLOY_GATE_ONLY=1) — so nothing here can reach a remote:

     1. the runner: a whole-suite run writes the record for HEAD's tree; a red run records red; a run of
        named tests leaves the record alone; a run on uncommitted files names the tree those files become
        once committed, and says it was dirty;
     2. both deploy scripts: no record, a red record, another tree's record and a tree that changed under
        its run are each refused before anything is copied; a dirty spellbound-app is refused even with the
        override; a green record for this tree passes; DEPLOY_ACCEPT_RED=1 passes a red one LOUDLY and
        writes it to tests/build/deploy-overrides.log;
     3. the gate stands in each script before the step that copies the build or touches a remote.
   Run: node tests/deploy-gate.cjs                                                                       */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync, spawnSync } = require('child_process');
const APP = path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'sb-deploy-gate-'));
const REPO = path.join(TMP, 'repo'), SRC = path.join(REPO, 'spellbound-app');
const git = (...a) => execFileSync('git', ['-c', 'user.email=gate@test', '-c', 'user.name=gate', ...a], { cwd: REPO, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
const put = (rel, txt) => { const p = path.join(SRC, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, txt); };
const rec = () => { try { return JSON.parse(fs.readFileSync(path.join(SRC, 'tests', 'build', 'last-full.json'), 'utf8')); } catch (e) { return null; } };
/* belt and braces: even a deploy script whose gate had been broken cannot reach a real site from here — the
   throwaway repo has no remote, and the staging clone and prod worktree it would use are empty paths in TMP */
const env = Object.assign({}, process.env, { SB_CHROME: process.env.SB_CHROME || '/bin/true', GIT_TERMINAL_PROMPT: '0',
  STG_DIR: path.join(TMP, 'no-staging-clone'), PRD_DIR: path.join(TMP, 'no-prod-worktree') });
const runner = (...a) => spawnSync(process.execPath, [path.join(SRC, 'tests', 'lib', 'run.cjs'), ...a], { cwd: SRC, env, encoding: 'utf8' });
const deploy = (script, extra) => { const r = spawnSync('bash', [path.join(SRC, script)], { cwd: SRC, env: Object.assign({}, env, { DEPLOY_GATE_ONLY: '1' }, extra || {}), encoding: 'utf8' });
  return { code: r.status, out: (r.stdout || '') + (r.stderr || '') }; };
const headTree = () => git('rev-parse', 'HEAD:spellbound-app');

try {
  /* a tiny app: the real runner and record reader, the real deploy scripts, two tests */
  fs.mkdirSync(SRC, { recursive: true }); git('init', '-q');
  for (const f of ['tests/lib/run.cjs', 'tests/lib/full-record.cjs', 'deploy-prod.sh', 'deploy-internal.sh', '.gitignore']) put(f, fs.readFileSync(path.join(APP, f), 'utf8'));
  put('index.html', '<!doctype html><title>t</title>');
  put('tests/a-pass.cjs', "console.log('ok'); process.exit(0);\n");
  put('tests/b-flip.cjs', "process.exit(require('fs').existsSync(__dirname + '/../RED') ? 1 : 0);\n");
  git('add', '-A'); git('commit', '-qm', 'base');

  /* ---------------- 1. the runner keeps the record ---------------- */
  let r = runner(); let j = rec();
  ok(r.status === 0 && j && j.tree === headTree() && j.commit === git('rev-parse', 'HEAD') && j.passed === 2 && j.failed === 0 && j.total === 2 && !j.dirty && j.stable,
    `a whole-suite run writes the record for HEAD's own tree, green (${j && JSON.stringify({ tree: String(j.tree).slice(0, 8), passed: j.passed, failed: j.failed, dirty: j.dirty })})`);
  put('RED', 'x'); git('add', '-A'); git('commit', '-qm', 'red');
  r = runner(); j = rec();
  ok(r.status !== 0 && j && j.tree === headTree() && j.failed === 1 && /b-flip\.cjs \(FAIL\)/.test((j.failedTests || []).join()), 'a red whole-suite run records RED, and names the test that failed');
  fs.rmSync(path.join(SRC, 'RED')); git('add', '-A'); git('commit', '-qm', 'green again');
  const before = JSON.stringify(rec());
  r = runner('a-pass');
  ok(r.status === 0 && JSON.stringify(rec()) === before, 'a run of named tests leaves the record alone (it proves nothing about the whole tree)');
  r = runner('--node-only');
  ok(JSON.stringify(rec()) === before, 'so does the deploy\'s own --node-only data gate');
  put('index.html', '<!doctype html><title>changed, not committed</title>');
  r = runner(); j = rec();
  const dirtyTree = j && j.tree;
  git('add', '-A'); git('commit', '-qm', 'commit what was tested');
  ok(j && j.dirty && j.passed === 2 && dirtyTree === headTree(), 'a run on uncommitted files says so, and names exactly the tree those files become once committed');

  /* ---------------- 2. both deploy scripts, stopped at their gate ---------------- */
  const GREEN = () => fs.writeFileSync(path.join(SRC, 'tests', 'build', 'last-full.json'), JSON.stringify({ commit: git('rev-parse', 'HEAD'), tree: headTree(), dirty: false, stable: true, passed: 3, failed: 0, total: 3, failedTests: [], at: new Date().toISOString() }));
  const setRec = o => fs.writeFileSync(path.join(SRC, 'tests', 'build', 'last-full.json'), JSON.stringify(Object.assign(JSON.parse(fs.readFileSync(path.join(SRC, 'tests', 'build', 'last-full.json'), 'utf8')), o)));
  for (const script of ['deploy-prod.sh', 'deploy-internal.sh']) {
    const refused = (d, re) => d.code !== 0 && re.test(d.out) && /Nothing was copied or pushed/.test(d.out) && !/Gate only/.test(d.out);
    fs.rmSync(path.join(SRC, 'tests', 'build', 'last-full.json'), { force: true });
    let d = deploy(script);
    ok(refused(d, /no full-suite record/), `${script}: no record → refused, nothing copied`);
    GREEN(); setRec({ failed: 2, passed: 1, failedTests: ['a11y-axe.cjs (FAIL)', 'gp-play.cjs (TIMEOUT)'] }); d = deploy(script);
    ok(refused(d, /was RED: 2 of 3 failed — a11y-axe\.cjs/), `${script}: a red record → refused, naming what failed`);
    GREEN(); setRec({ tree: 'f'.repeat(40) }); d = deploy(script);
    ok(refused(d, /not the tree being deployed/), `${script}: another tree's green record → refused`);
    GREEN(); setRec({ stable: false }); d = deploy(script);
    ok(refused(d, /certifies nothing/), `${script}: a record whose tree changed during its run → refused`);
    GREEN(); d = deploy(script);
    ok(d.code === 0 && /green: the whole suite passed on tree/.test(d.out) && /Gate only/.test(d.out), `${script}: a green record for exactly this tree → the deploy may go ahead`);
    put('stray.txt', 'not committed'); d = deploy(script, { DEPLOY_ACCEPT_RED: '1' });
    ok(d.code !== 0 && /uncommitted changes/.test(d.out) && /stray\.txt/.test(d.out) && !/Gate only/.test(d.out), `${script}: an uncommitted file → refused, even with DEPLOY_ACCEPT_RED=1`);
    fs.rmSync(path.join(SRC, 'stray.txt'));
    fs.rmSync(path.join(SRC, 'tests', 'build', 'deploy-overrides.log'), { force: true });
    GREEN(); setRec({ failed: 1, passed: 2, failedTests: ['gp-play.cjs (FAIL)'] }); d = deploy(script, { DEPLOY_ACCEPT_RED: '1' });
    let log = ''; try { log = fs.readFileSync(path.join(SRC, 'tests', 'build', 'deploy-overrides.log'), 'utf8'); } catch (e) {}
    ok(d.code === 0 && /DEPLOY_ACCEPT_RED=1 — PUBLISHING WITHOUT A GREEN FULL-SUITE RUN/.test(d.out) && /was RED/.test(d.out) && /Gate only/.test(d.out)
      && log.split('\n').filter(Boolean).length === 1 && log.includes(headTree().slice(0, 12)) && /gp-play/.test(log),
      `${script}: DEPLOY_ACCEPT_RED=1 passes a red record LOUDLY and writes it to tests/build/deploy-overrides.log`);
  }

  /* ---------------- 3. the gate comes before anything is copied or pushed ---------------- */
  for (const script of ['deploy-prod.sh', 'deploy-internal.sh']) {
    const s = fs.readFileSync(path.join(APP, script), 'utf8');
    const gate = s.indexOf('tests/lib/full-record.cjs'), first = Math.min(...['\ngit fetch', '\ntar ', '| tar ', 'git push', '\nrsync'].map(k => s.indexOf(k)).filter(i => i >= 0));
    ok(gate > 0 && gate < first && /OVERRIDE_NOTE/.test(s.slice(s.indexOf('commit -q -m'))), `${script}: the full-suite gate stands before the first copy or remote step, and an override is written into the deploy commit`);
  }
} finally {
  fs.rmSync(TMP, { recursive: true, force: true });
}
console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
