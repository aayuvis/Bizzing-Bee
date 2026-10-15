/* analogy-bridge.cjs — every sentence the Analogies build from a lesson's bridge template reads as English: no "the a",
   no "the an", no "a a" — @check

   Why (15 Oct 2026, found by the Reasoning Rounds batch): bridge() put "a/an" before a word even where the template
   already had "the" in front of it — "The {A} is part of the {B}" read "The a blade is part of the a knife", "We use the
   {A} to {B}" read "We use the a pen to write": 41 live items, on screen in practice, the bridge step and the Link Finder.
   bridge() now adds an article only where the template has none (analogy.js `put`).

   This runs analogy.js's OWN `an`, `put` and `bridge` (cut from the file, not copied) over every item's pair and every
   lesson stem, with the lesson's own template, and fails on a doubled article.
   Proved by breaking (15 Oct 2026): bridge() put back as it was (an(a) / an(b) always) → fails (80 sentences with "the a"/"the an", items and stems);
   `put` ignoring the template's article → fails the same way.
   Run: node tests/analogy-bridge.cjs                                                                           */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.env.AB_ROOT || path.resolve(__dirname, '..');
let fails = 0; const ok = (c, m) => { console.log((c ? '  OK   ' : '  FAIL ') + m); if (!c) fails++; };
const src = fs.readFileSync(path.join(ROOT, 'analogy.js'), 'utf8');
const line = (n) => { const i = src.indexOf(n); if (i < 0) return ''; return src.slice(i, src.indexOf('\n', i)); };
const fn = (n) => { const i = src.indexOf(n); if (i < 0) return ''; let d = 0, j = src.indexOf('{', i);
  for (; j < src.length; j++) { if (src[j] === '{') d++; else if (src[j] === '}' && --d === 0) break; } return src.slice(i, j + 1); };
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'analogy-data.js'), 'utf8'), ctx);
vm.runInContext([line('const an ='), line('const put ='), 'const cap = (x) => x ? x[0].toUpperCase() + x.slice(1) : x;',
  line('const s3 ='), fn('function s3('), fn('function bridge('), 'this.bridge = bridge;'].filter(Boolean).join('\n'), ctx);
ok(typeof ctx.bridge === 'function', 'analogy.js bridge() runs from its own source');
const D = ctx.window.SB_ANALOGY, rels = {};
(D.lessons || []).forEach((L) => (L.rels || []).forEach((r) => { rels[r] = L; }));
const out = [];
for (const it of Object.values(D.items)) { const L = rels[it[0]]; if (L && L.bridge) out.push(ctx.bridge(L.bridge, it[2], it[3], it[0])); }
for (const L of D.lessons || []) for (const st of (L.stems || [])) out.push(ctx.bridge(L.bridge, st[0], st[1], st[2] || (L.rels || [])[0]));
const bad = out.filter((s) => /\b(the|a|an)\s+(a|an)\s/i.test(s));
ok(out.length > 1000, `built ${out.length} bridge sentences from ${Object.keys(D.items).length} items and the lessons' stems`);
ok(!bad.length, 'no sentence doubles an article' + (bad.length ? ` — ${bad.length}: ` + bad.slice(0, 4).join(' | ') : ''));
console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
