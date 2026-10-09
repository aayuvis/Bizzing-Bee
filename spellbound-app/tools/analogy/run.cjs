#!/usr/bin/env node
/* run.cjs — build the analogy engine end to end and report what it can make, per Bee level.

     node tools/analogy/run.cjs            relations → word map → items → analogy-review/
     node tools/analogy/run.cjs --sample N   N items in the review sheet (default 180)

   Writes analogy-review/stats.json (every count the report quotes) and analogy-review/index.html
   (a stratified sample for a person to judge). analogy-review/ is a review sheet like
   forge-review/: it is never deployed, and nothing in the app reads it. */
'use strict';
const fs = require('fs'), path = require('path');
const { load, APP } = require('./data.cjs');
const { build } = require('./relations.cjs');
const { train } = require('./embed.cjs');
const { compose, fnv } = require('./compose.cjs');

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const N = +arg('--sample', 180);
const OUT = path.join(APP, 'analogy-review');
const log = (...a) => console.log(...a);

const t0 = Date.now();
const D = load();
const R = build(D);
log('words', D.W.size, '· relation rows', R.E.length, '·', ((Date.now() - t0) / 1000).toFixed(1) + 's');
const EMB = train(D, R.X, (m) => log('  map', m));
log('word map', EMB.vocab.length, 'words from', EMB.meta.tokens, 'tokens of Bee text');
const { items, stats } = compose(D, R, EMB);
log('items', items.length, '·', ((Date.now() - t0) / 1000).toFixed(1) + 's');

/* ---- counts ---- */
const LV = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const rels = [...new Set(R.E.map((e) => e[2]))];
const relRows = {};
for (const e of R.E) relRows[e[2]] = (relRows[e[2]] || 0) + 1;
const table = (k) => {
  const t = {};
  for (const rel of rels) t[rel] = LV.map((L) => (stats.get(rel + '|' + L) || {})[k] || 0);
  return t;
};
const tot = (t) => LV.map((_, i) => Object.values(t).reduce((a, r) => a + r[i], 0));
const T = { pairs: table('pairs'), familiar: table('familiar'), cores: table('cores'), confusing: table('confusing'), stemmed: table('stemmed') };
const slot = [0, 0, 0, 0, 0];
for (const it of items) slot[it.answer]++;

/* ---- the "neural map alone" test: B − A + C on Bee's own pairs ---- */
const offs = {};
for (const rel of rels) {
  const prs = R.E.filter((e) => e[2] === rel && EMB.has(e[0]) && EMB.has(e[1])).map((e) => [e[0], e[1]]);
  if (prs.length < 40) continue;
  let hit = 0, top5 = 0, n = 0;
  for (let i = 0; i < 150; i++) {
    const p = prs[fnv(rel + i) % prs.length], q = prs[fnv(rel + 'q' + i) % prs.length];
    if (new Set([...p, ...q]).size < 4) continue;
    const r = EMB.offset(p[0], p[1], q[0], 5).map((x) => x[0]);
    n++; if (r[0] === q[1]) hit++; if (r.includes(q[1])) top5++;
  }
  offs[rel] = { n, top1: +(hit / n).toFixed(3), top5: +(top5 / n).toFixed(3) };
}

/* coverage: of the familiar base-form words at each level, how many can be the C of an item */
const X = R.X;
const elig = LV.map(() => 0), covered = LV.map(() => 0), asC = new Set(items.map((it) => it.c));
const FAMQ = require('./compose.cjs').FAM;
for (const [w, x] of D.W) {
  if (X.infl(w) || (EMB.freq.get(w) || 0) < FAMQ[x.y] || w.length > 14) continue;
  elig[x.y - 1]++;
  if (asC.has(w)) covered[x.y - 1]++;
}
const S = {
  built: new Date().toISOString().slice(0, 10),
  words: D.W.size, relationRows: relRows, wordMap: { words: EMB.vocab.length, tokens: EMB.meta.tokens },
  levels: LV, ...Object.fromEntries(Object.entries(T).map(([k, t]) => [k, { byRel: t, total: tot(t) }])),
  items: items.length, confusingItems: items.filter((x) => x.strong).length, olderOnly: items.filter((x) => x.older).length,
  answerSlots: slot, vectorOffset: offs,
  coverage: { familiarBaseWords: elig, usableAsC: covered },
};
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'stats.json'), JSON.stringify(S, null, 1));

const pad = (s, n) => String(s).padStart(n);
log('\nper level        ' + LV.map((L) => pad('L' + L, 7)).join('') + pad('total', 9));
for (const k of Object.keys(T)) { const r = tot(T[k]); log(k.padEnd(16) + r.map((x) => pad(x, 7)).join('') + pad(r.reduce((a, b) => a + b, 0), 9)); }
log('\ncores by relation');
for (const rel of rels.sort((a, b) => tot({ x: T.cores[b] })[0] - 0)) {
  const r = T.cores[rel]; const s = r.reduce((a, b) => a + b, 0); if (!s) continue;
  log('  ' + rel.padEnd(10) + r.map((x) => pad(x, 7)).join('') + pad(s, 9) + '   confusing ' + T.confusing[rel].reduce((a, b) => a + b, 0));
}
log('\ncoverage: familiar base words that can be C   ' + LV.map((L, i) => 'L' + L + ' ' + covered[i] + '/' + elig[i] + ' (' + Math.round(100 * covered[i] / Math.max(1, elig[i])) + '%)').join(' · '));
log('answer slots a–e', slot.join(' / '));
log('vector offset alone (top-1 / top-5):', Object.entries(offs).map(([k, v]) => k + ' ' + Math.round(v.top1 * 100) + '%/' + Math.round(v.top5 * 100) + '%').join(' · '));

/* ---- review sheet: a stratified sample (relation × level band), fixed by hash ---- */
const band = (L) => (L <= 3 ? 'L1–3' : L <= 6 ? 'L4–6' : 'L7–9');
const strata = new Map();
for (const it of items) { const k = it.rel + '|' + band(it.L); if (!strata.has(k)) strata.set(k, []); strata.get(k).push(it); }
const keys = [...strata.keys()].sort();
const per = Math.max(1, Math.ceil(N / keys.length));
const sample = [];
for (const k of keys) { const v = strata.get(k).slice().sort((a, b) => fnv(a.id) - fnv(b.id)); sample.push(...v.slice(0, per)); }
sample.sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : a.L - b.L));
fs.writeFileSync(path.join(OUT, 'sample.json'), JSON.stringify(sample, null, 1));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const L = 'abcde';
const card = (it, i) => `<li class="it" id="i${i}"><div class="meta">${esc(it.rel)} · level ${it.L}${it.strong ? ' · <b>confusing</b>' : ''}${it.older ? ' · 11+' : ''}</div>
<div class="q">${esc(it.stem[0].toUpperCase())} : ${esc(it.stem[1].toUpperCase())} :: ${esc(it.c.toUpperCase())} : ____</div>
<ol class="o">${it.options.map((o, j) => `<li class="${j === it.answer ? 'ok' : ''}">${L[j]}) ${esc(o)}${j === it.answer ? '' : ' <i>' + esc((it.traps.find((t) => t[0] === o) || [])[1] || '') + '</i>'}</li>`).join('')}</ol>
<div class="why">${esc(it.c)} → ${esc(it.d)}: ${esc((R.E.find((e) => e[0] === it.c && e[1] === it.d && e[2] === it.rel) || R.E.find((e) => e[1] === it.c && e[0] === it.d && e[2] === it.rel) || [, , , ''])[3])}</div></li>`;
fs.writeFileSync(path.join(OUT, 'index.html'), `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Analogy engine review</title><style>
body{font:15px/1.5 system-ui,sans-serif;margin:0;padding:24px 16px;background:#f6f7fb;color:#172033}main{max-width:900px;margin:auto}
h1{font-size:22px;margin:0 0 6px}p{color:#4a5468;max-width:70ch}ul{list-style:none;padding:0;display:grid;gap:10px}
.it{background:#fff;border:1px solid #d9dfea;border-radius:10px;padding:12px 14px}.meta{font-size:12px;color:#5a6478;text-transform:uppercase;letter-spacing:.06em}
.q{font:600 17px/1.4 ui-monospace,Menlo,monospace;margin:6px 0}.o{display:flex;flex-wrap:wrap;gap:6px 16px;padding:0;margin:0;list-style:none;font-family:ui-monospace,Menlo,monospace}
.o .ok{color:#1d6b3a;font-weight:700}.o i{color:#8a6a00;font-size:12px;font-style:normal}.why{font-size:12px;color:#5a6478;margin-top:6px}
</style><main><h1>Analogy engine — review sample</h1>
<p>${sample.length} items drawn evenly across relation and level band from ${items.length} the engine can build out of Bee's own words. The answer is green; each wrong answer says which recipe made it. The last line is where the relation came from. Built ${S.built}. Not deployed.</p>
<ul>${sample.map(card).join('\n')}</ul></main>`);
log('\nwrote', path.relative(APP, OUT) + '/{stats.json,sample.json,index.html}', '·', sample.length, 'sample items ·', ((Date.now() - t0) / 1000).toFixed(1) + 's');
