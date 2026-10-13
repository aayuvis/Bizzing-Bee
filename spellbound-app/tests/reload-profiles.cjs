/* A PAGE THAT RELOADS RUNS IN A PERSISTENT PROFILE — @check (node, the data gate; ~1 s, no browser)

   THE ARTEFACT. Playwright's throwaway contexts — browser.newContext(), browser.newPage({…}) — are off the record:
   localStorage lives in memory, and on a loaded machine a reload there sometimes starts the new document on EMPTY
   storage. The test's init script finds 0 keys where the page left 5, plants the seed again, and the test reads the
   seed as the app's doing: a second migration, a refund paid twice, the same hello twice, "4 → 0" milestones, "0 kept".
   pin-mandatory measured it (10 Oct 2026, P0.18) with its reload in a loop beside six busy processes: off the record
   3 of 48 reloads empty, forced onto one renderer 2 of 24, a persistent on-disk profile 0 of 72. The cure is
   chromium.launchPersistentContext on a fresh temp dir (and `ctx.pages()[0] || await ctx.newPage()`, the context
   closed and the dir removed at the end). Seventeen tests carry it; this guard keeps the next one from forgetting.
   It is the cure the suite has, not a proven one everywhere: family-topbar's own reload, beside six busy loops at 4x,
   came back empty 2 of 30 in a persistent profile and 0 of 20 off the record (13 Oct 2026). A test that reads its
   storage back after a reload should still say what storage the new page started on (pin-mandatory, trust-v2 do).

   WHAT IT READS. Every tests/*.cjs|js|mjs (run.cjs's own glob) as CODE — comments, strings and regex literals blanked,
   so "a reload" in a comment is not one. A site is any of:
     reload   page.reload(…), and location.reload() inside a page.evaluate (the page reloading itself)
     nav      page.waitForNavigation(…) — the app navigating its own page (backup-restore's erase and restore)
     leave    page.goto('about:blank') on a page that has been somewhere — how a test leaves a page to come back
     return   a second page.goto(…) on a page that has been to a document (not one in the other arm of an if/else)
   For each, it follows the page back to the context that made it:
     the nearest binding of the page's name before the site, in a function that encloses the site (tests/lib/js-scan);
     `pg = ctx.pages()[0] || await ctx.newPage()` → the context `ctx` → ITS nearest binding;
     `pg = await b.newPage({…})` → a page that brought its own throwaway context;
     `{ ctx, pg } = await open(…)`, `A = await boot(…)` → every context that helper's body makes.
   launchPersistentContext is KEPT; newContext( and newPage({ are THROWAWAY. A helper that can make either (daily-bee's
   `open(b, { persist: true })`, and family-topbar, feed-screen, medals, p3-first-session, store-seam) is decided by its
   call: `persist: <anything but false/0/null>` among the call's arguments. A site it cannot follow fails as well —
   write it plainly, or put the file on ALLOW below with the reason.

   LIMITS, said plainly — it reads text, not a running program: a goto inside a helper that is called twice is one
   site; a helper's `persist:` is taken at its word, so its condition must be the one the reload runs under
   (family-topbar: `persist: vp.width === 1180`, and only the 1180 walk reloads); a page passed in as an argument
   cannot be followed and fails. Before it reads the suite it runs itself on nine small cases (SELF below), so a
   reader that has gone blind fails here rather than passing everything.

   Read against the tree BEFORE the conversion it fails exactly the eleven tests that were moved (aurora-refund,
   backup-restore, family-topbar, feed-screen, first-run, levels, medals, offline-pwa, p3-first-session, store-seam,
   wallet-coins) and passes the six already on disk. Proved by breaking (13 Oct 2026), each fault put in, watched, put back:
   levels.cjs back on b.newContext → 1 fails ("levels.cjs:75: reload on pg — throwaway: pg (line 31) → ctx (line 29) →
   newContext"); feed-screen's grown-up-switch block calling open() without persist → 1 fails ("feed-screen.cjs:399: reload
   on pg — throwaway: … open(…) (line 65) → called without persist — its newContext").
   Run: node tests/reload-profiles.cjs                                                                             */
'use strict';
const fs = require('fs'), path = require('path');
const { scan } = require('./lib/js-scan.cjs');
const DIR = __dirname;
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };

/* Files exempt from the rule, each with a reason a person can check. */
const ALLOW = {
  'ux-personas.cjs': 'not a test: a persona walk-through that writes a report (run.cjs SKIPs it), and its one in-page reload ' +
    'follows its own localStorage.clear() — it means to start on empty storage',
};

/* ---- the reader: code only, offsets kept ---- */
function codeOnly(src) {
  const out = src.split(''), n = src.length;
  const blank = (a, b) => { for (let k = a; k < b && k < n; k++) if (out[k] !== '\n') out[k] = ' '; };
  const KW = /^(return|typeof|case|do|else|in|of|new|delete|void|throw|await|yield)$/;
  const tmpl = []; let i = 0, depth = 0, last = '', word = '';
  const regexOK = () => !last || /[(,=:[!&|?{};+\-*%<>~^]/.test(last) || (last === 'w' && KW.test(word));
  const template = () => {          // i just inside a template's text: blank to the closing ` or the next ${
    const s = i;
    while (i < n) {
      if (src[i] === '\\') { i += 2; continue; }
      if (src[i] === '`') { blank(s, i); i++; return; }
      if (src[i] === '$' && src[i + 1] === '{') { blank(s, i); i += 2; tmpl.push(depth); depth++; return; }
      i++;
    }
    blank(s, n);
  };
  while (i < n) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') { const e = src.indexOf('\n', i), end = e < 0 ? n : e; blank(i, end); i = end; continue; }
    if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2), end = e < 0 ? n : e + 2; blank(i, end); i = end; continue; }
    if (c === "'" || c === '"') { const s = i++; while (i < n && src[i] !== c && src[i] !== '\n') { if (src[i] === '\\') i++; i++; } blank(s + 1, i); i++; last = 'v'; continue; }
    if (c === '`') { i++; template(); last = 'v'; continue; }
    if (c === '/' && regexOK()) {
      const s = i++; let cls = false;
      while (i < n && (src[i] !== '/' || cls) && src[i] !== '\n') { if (src[i] === '\\') i++; else if (src[i] === '[') cls = true; else if (src[i] === ']') cls = false; i++; }
      i++; while (/[a-z]/i.test(src[i] || '')) i++; blank(s, i); last = 'v'; continue;
    }
    if (/\s/.test(c)) { i++; continue; }
    if (/[\w$]/.test(c)) { let e = i; while (e < n && /[\w$]/.test(src[e])) e++; word = src.slice(i, e); last = 'w'; i = e; continue; }
    if (c === '{') { depth++; last = c; i++; continue; }
    if (c === '}') { depth--; if (tmpl.length && tmpl[tmpl.length - 1] === depth) { tmpl.pop(); i++; template(); last = 'v'; continue; } last = c; i++; continue; }
    last = c; i++;
  }
  return out.join('');
}

/* one file, read once */
function reader(name, src) {
  const code = codeOnly(src), S = scan(src);
  const blocks = []; { const st = []; for (let k = 0; k < code.length; k++) { if (code[k] === '{') st.push(k); else if (code[k] === '}' && st.length) blocks.push([st.pop(), k]); } }
  const encl = k => { let best = null; for (const f of S.fns) if (f.open < k && k < f.close && (!best || f.open > best.open)) best = f; return best; };
  const sees = (k, at) => { const f = encl(k); return !f || (f.open < at && at < f.close); };   // a binding at k is in scope at `at`
  const lineOf = k => src.slice(0, k).split('\n').length;
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  /* the text of a statement's right-hand side, from `from` to its end at depth 0 */
  const rhsFrom = from => {
    let d = 0, k = from;
    for (; k < code.length; k++) {
      const c = code[k];
      if ('([{'.includes(c)) d++;
      else if (')]}'.includes(c)) { if (!d) break; d--; }
      else if (!d && (c === ';' || c === ',')) break;
      else if (!d && c === '\n') { const m = code.slice(k).match(/^\s*(\S)/); if (!m || !/[?:.|&+\-*/]/.test(m[1])) break; }
    }
    return { at: from, text: code.slice(from, k), raw: src.slice(from, k) };
  };
  /* a call's whole argument list, from its opening paren to the one that matches it */
  const argsOf = paren => { let d = 0, k = paren; for (; k < code.length; k++) { if ('([{'.includes(code[k])) d++; else if (')]}'.includes(code[k]) && !--d) break; } return src.slice(paren + 1, k); };
  /* the nearest binding of `id` before `at` that is in scope there: a declaration or assignment, a destructuring, or a parameter */
  const binding = (id, at) => {
    let best = null;
    const take = (k, rhs, kind) => { if (k < at && sees(k, at) && (!best || k > best.at)) best = { at: k, rhs, kind }; };
    for (const m of code.matchAll(new RegExp('(?<![\\w$.])' + esc(id) + '\\s*=(?![=>])', 'g'))) take(m.index, rhsFrom(m.index + m[0].length), 'bind');
    for (const m of code.matchAll(new RegExp('\\{[^{}();]*?(?<![\\w$.])' + esc(id) + '(?![\\w$])(?!\\s*:)[^{}();]*\\}\\s*=(?![=>])', 'g'))) take(m.index, rhsFrom(m.index + m[0].length), 'bind');
    for (const f of S.fns) {                      // a parameter of a function around the site
      if (!(f.open < at && at < f.close)) continue;
      const pre = code.slice(Math.max(0, f.open - 300), f.open);
      const pm = pre.match(/\(([^()]*)\)\s*(?:=>)?\s*$/) || pre.match(/([\w$]+)\s*=>\s*$/);
      if (pm && new RegExp('(?<![\\w$.:])' + esc(id) + '(?![\\w$])').test(pm[1])) take(f.open - 1, null, 'param');
    }
    return best;
  };
  const helper = nm => S.fns.find(f => f.name === nm);
  const KEPT = /launchPersistentContext\s*\(/, THROW = /\.newContext\s*\(|\.newPage\s*\(\s*\{/;
  const persistArg = raw => /\bpersist\s*:\s*(?!false\b|0\b|null\b|undefined\b|''|"")\S/.test(raw);
  /* what made the page (or context) a right-hand side names: kept | throwaway | unknown, with the way there */
  function classify(rhs, trail, depth) {
    if (!rhs) return { kind: 'unknown', why: trail.concat('it arrives as an argument').join(' → ') };
    if (depth > 6) return { kind: 'unknown', why: trail.concat('too deep').join(' → ') };
    const t = rhs.text;
    if (KEPT.test(t) && THROW.test(t)) return { kind: 'unknown', why: trail.concat('makes either kind, and nothing says which').join(' → ') };
    if (KEPT.test(t)) return { kind: 'kept', why: trail.concat('launchPersistentContext').join(' → ') };
    if (/\.newContext\s*\(/.test(t)) return { kind: 'throwaway', why: trail.concat('newContext').join(' → ') };
    if (/\.newPage\s*\(\s*\{/.test(t)) return { kind: 'throwaway', why: trail.concat('browser.newPage({…})').join(' → ') };
    if (/\bchromium\s*\.\s*launch\s*\(/.test(t)) return { kind: 'throwaway', why: trail.concat('a page from the browser itself').join(' → ') };
    let m = t.match(/([A-Za-z_$][\w$]*)\s*\.\s*(?:pages\s*\(|newPage\s*\()/);
    if (m) { const b = binding(m[1], rhs.at); return classify(b && b.rhs, trail.concat(m[1] + ' (line ' + (b ? lineOf(b.at) : '?') + ')'), depth + 1); }
    for (const c of t.matchAll(/([A-Za-z_$][\w$]*)\s*\(/g)) {
      const f = helper(c[1]); if (!f) continue;
      const body = code.slice(f.open, f.close), k = KEPT.test(body), w = THROW.test(body);
      const paren = rhs.at + c.index + c[0].length - 1, args = argsOf(paren);
      const via = trail.concat(c[1] + '(…) (line ' + lineOf(f.open) + ')');
      if (k && w) return persistArg(args) ? { kind: 'kept', why: via.concat('called with persist').join(' → ') }
        : { kind: 'throwaway', why: via.concat('called without persist — its newContext').join(' → ') };
      if (k) return { kind: 'kept', why: via.concat('launchPersistentContext').join(' → ') };
      if (w) return { kind: 'throwaway', why: via.concat('newContext').join(' → ') };
    }
    return { kind: 'unknown', why: trail.concat('"' + t.trim().replace(/\s+/g, ' ').slice(0, 60) + '"').join(' → ') };
  }
  /* the page a receiver names: `pg`, `A.pg` (follow A), `location` (the page whose evaluate this is) */
  function pageOf(recv, at) {
    if (/(^|\.)location$/.test(recv)) {
      const pre = code.slice(Math.max(0, at - 400), at), all = [...pre.matchAll(/([A-Za-z_$][\w$.]*)\s*\.\s*evaluate\s*\(/g)];
      if (!all.length) return null;
      recv = all[all.length - 1][1];
    }
    return recv.split('.')[0];
  }
  /* has the page been to a document before `at`? A previous goto on it since its binding (not about:blank, not the
     other arm of an if/else), or a binding that came from a helper which goes somewhere */
  function visited(recv, b, at) {
    if (b && b.rhs) for (const c of b.rhs.text.matchAll(/([A-Za-z_$][\w$]*)\s*\(/g)) { const f = helper(c[1]); if (f && /\.goto\s*\(/.test(code.slice(f.open, f.close))) return true; }
    const from = b ? b.at : 0;
    for (const m of code.slice(from, at).matchAll(new RegExp('(?<![\\w$.])' + esc(recv) + '\\s*\\.\\s*goto\\s*\\(', 'g'))) {
      const p = from + m.index, arg = src.slice(p + m[0].length).trimStart();
      if (/^['"]about:blank['"]/.test(arg)) continue;
      const blk = blocks.filter(([o, c]) => o < p && p < c).sort((x, y) => y[0] - x[0])[0];
      if (blk && blk[1] < at) {
        const after = code.slice(blk[1] + 1).match(/^\s*else\b\s*\{?/);
        if (after) { const eo = blk[1] + 1 + after[0].length - 1, arm = blocks.find(([o]) => o === eo); if (arm && at < arm[1]) continue; }
      }
      return true;
    }
    return false;
  }
  const sites = [];
  for (const m of code.matchAll(/([A-Za-z_$][\w$]*(?:\s*\.\s*[A-Za-z_$][\w$]*)*)\s*\.\s*(reload|waitForNavigation|goto)\s*\(/g)) {
    const recv = m[1].replace(/\s+/g, ''), how = m[2], at = m.index, arg = src.slice(at + m[0].length).trimStart();
    let kind = how === 'reload' ? 'reload' : how === 'waitForNavigation' ? 'nav' : null;
    const id = pageOf(recv, at);
    if (!id) { sites.push({ line: lineOf(at), kind: kind || 'goto', recv, verdict: { kind: 'unknown', why: 'location.reload() with no page.evaluate around it' } }); continue; }
    const b = binding(id, at);
    if (!kind) {
      if (!visited(recv, b, at)) continue;
      kind = /^['"]about:blank['"]/.test(arg) ? 'leave' : 'return';
    }
    const verdict = b ? (b.kind === 'param' ? classify(null, [id], 0) : classify(b.rhs, [id + ' (line ' + lineOf(b.at) + ')'], 0))
      : { kind: 'unknown', why: 'no binding of ' + id + ' found' };
    sites.push({ line: lineOf(at), kind, recv, verdict });
  }
  /* the suite's shared reload, wait.cjs reloadSettled(page): the page it is handed reloads */
  for (const m of code.matchAll(/\breloadSettled\s*\(\s*([A-Za-z_$][\w$]*(?:\s*\.\s*[A-Za-z_$][\w$]*)*)/g)) {
    const recv = m[1].replace(/\s+/g, ''), at = m.index, id = pageOf(recv, at);
    if (!id) { sites.push({ line: lineOf(at), kind: 'reload', recv, verdict: { kind: 'unknown', why: 'reloadSettled on no page' } }); continue; }
    const b = binding(id, at);
    const verdict = b ? (b.kind === 'param' ? classify(null, [id], 0) : classify(b.rhs, [id + ' (line ' + lineOf(b.at) + ')'], 0))
      : { kind: 'unknown', why: 'no binding of ' + id + ' found' };
    sites.push({ line: lineOf(at), kind: 'reload', recv, verdict });
  }
  return sites;
}

/* ---- the reader, tried on cases whose answer is known, before it is believed ---- */
const SELF = [
  ['a reload in a throwaway context', 'throwaway', `(async () => { const ctx = await b.newContext({}); const pg = await ctx.newPage(); await pg.goto(U); await pg.reload(); })();`],
  ['a reload in a persistent profile', 'kept', `(async () => { const ctx = await chromium.launchPersistentContext(dir, {}); const pg = ctx.pages()[0] || await ctx.newPage(); await pg.goto(U); await pg.reload(); })();`],
  ['browser.newPage({…}) reloading', 'throwaway', `(async () => { const pg = await b.newPage({ viewport }); await pg.goto(U); await pg.reload(); })();`],
  ['a helper that makes either, called with persist', 'kept', `async function open(o) { const ctx = o.persist ? await chromium.launchPersistentContext(d, {}) : await b.newContext({}); const pg = await ctx.newPage(); await pg.goto(U); return { ctx, pg }; }
    (async () => { const { ctx, pg } = await open({ persist: true }); await pg.reload(); })();`],
  ['the same helper called without it', 'throwaway', `async function open(o) { const ctx = o.persist ? await chromium.launchPersistentContext(d, {}) : await b.newContext({}); const pg = await ctx.newPage(); await pg.goto(U); return { ctx, pg }; }
    (async () => { const { ctx, pg } = await open({ touch: true }); await pg.reload(); })();`],
  ['leaving for about:blank and coming back', 'throwaway', `(async () => { const ctx = await b.newContext(); const pg = await ctx.newPage(); await pg.goto(U); await pg.goto('about:blank'); await pg.goto(U); })();`],
  ['a fresh tab that starts at about:blank is not a leave', 'none', `(async () => { const ctx = await b.newContext(); const p2 = await ctx.newPage(); await p2.goto('about:blank'); await p2.goto(P); })();`],
  ['two gotos in the two arms of an if/else are one visit', 'none', `(async () => { const ctx = await b.newContext(); const pg = await ctx.newPage(); if (x) { await pg.goto(A); } else { await pg.goto(B); } })();`],
  ['a reload named only in a comment or a string is none', 'none', `(async () => { const ctx = await b.newContext(); const pg = await ctx.newPage(); /* pg.reload() */ const s = 'pg.reload()'; await pg.goto(U); })();`],
];
for (const [what, want, src] of SELF) {
  const s = reader('self', src), got = !s.length ? 'none' : s.every(x => x.verdict.kind === s[0].verdict.kind) ? s[0].verdict.kind : 'mixed';
  ok(got === want, `the reader on a known case — ${what}: ${got}${s.length ? ' (' + s.map(x => x.kind + ': ' + x.verdict.why).join('; ') + ')' : ''}`);
}

/* ---- the suite ---- */
const files = fs.readdirSync(DIR).filter(f => /\.(cjs|js|mjs)$/.test(f) && fs.statSync(path.join(DIR, f)).isFile()).sort();
let n = 0, nf = 0;
for (const f of files) {
  const sites = reader(f, fs.readFileSync(path.join(DIR, f), 'utf8'));
  if (!sites.length) continue;
  nf++; n += sites.length;
  const bad = sites.filter(s => s.verdict.kind !== 'kept');
  if (ALLOW[f]) { console.log(`  --   ${f}: ${sites.length} site(s), exempt — ${ALLOW[f]}`); continue; }
  ok(!bad.length, `${f}: ${sites.length} site(s) (${[...new Set(sites.map(s => s.kind))].join(', ')}), every page in a persistent profile` +
    (bad.length ? '\n         ' + bad.map(s => `${f}:${s.line}: ${s.kind} on ${s.recv} — ${s.verdict.kind}: ${s.verdict.why}`).join('\n         ') : ''));
}
for (const f of Object.keys(ALLOW)) ok(files.includes(f), `the allow-list names a file that exists (${f})`);
ok(n >= 20 && nf >= 15, `the reader found the suite's reloads: ${n} sites in ${nf} files`);
console.log(fails ? `\n${fails} FAILED` : '\nall good: every page that reloads, or leaves and comes back, keeps its storage on disk');
process.exit(fails ? 1 : 0);
