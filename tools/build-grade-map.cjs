#!/usr/bin/env node
/* THE GRADE MAP, CUT FROM ITS SOURCED JSON (road to 4.5, P1.9 — owner decision 5, 10 Oct 2026).

   grade-map/grade-map.json is the research record: every Atlas region and stop tagged to US grade
   (Common Core L.3–8 / RF.3–5), UK year (National Curriculum Appendix 1, KS1–2, KS3) and CBSE class,
   each mapping citing documents fetched for the purpose (sources[] — title, official url, the mirror it
   was actually fetched from, sha256). Nothing in it was mapped from memory, and a stop that could not
   be sourced says "not mapped". Read grade-map/scripts/ for how it was made.

   The app is no-build and opens from file://, where fetch() of a JSON file is refused, so the page
   reads a classic-script copy: grade-map-data.js, `window.SB_GRADE_MAP`. This tool writes that copy
   and nothing else — never type into grade-map-data.js. It refuses to write a map that breaks the
   rules tests/grade-map.cjs holds (a row without a source, a source id that resolves to nothing).

     node tools/build-grade-map.cjs          write grade-map-data.js
     node tools/build-grade-map.cjs --check  exit 1 if grade-map-data.js is not what this would write

   Lazy: boot-lazy group `grademap`, fetched only by the grown-ups' report card (behind the PIN). */
'use strict';
const fs = require('fs'), path = require('path');
const APP = path.resolve(__dirname, '..');
const SRC = path.join(APP, 'grade-map', 'grade-map.json');
const OUT = path.join(APP, 'grade-map-data.js');
const FW = { us: 'ccss-', uk: 'uk-', cbse: 'cbse-' };   // a framework's claim is backed only by its own documents
const NM = /^not mapped\b/i;

/* the rules, shared with tests/grade-map.cjs: [] means the map may ship */
function problems(G) {
  const out = [];
  if (!G || !Array.isArray(G.sources) || !Array.isArray(G.regions)) return ['grade-map.json has no sources[] or regions[]'];
  const ids = new Set(), byId = {};
  for (const s of G.sources) {
    if (!s || !s.id) { out.push('a source without an id'); continue; }
    if (ids.has(s.id)) out.push('source ' + s.id + ' is listed twice');
    ids.add(s.id); byId[s.id] = s;
    for (const k of ['title', 'url', 'fetched', 'fetched_from']) if (!s[k]) out.push('source ' + s.id + ' has no ' + k);
  }
  /* a document is pinned by its own sha256, or read `via` one that is (the CCSS per-grade pages are
     statements read out of the one official XML file, which carries the hash) */
  for (const s of G.sources) if (s && s.id && !s.sha256 && !(s.via && byId[s.via] && byId[s.via].sha256)) out.push('source ' + s.id + ' has no sha256 and no `via` a hashed document');
  const resolve = (where, list) => (list || []).forEach((x) => { if (!ids.has(x)) out.push(where + ' cites an unknown source "' + x + '"'); });
  for (const r of G.regions) {
    const at = 'region ' + (r && r.act);
    for (const f of Object.keys(FW)) {
      const m = r[f];
      if (!m) { out.push(at + ' has no ' + f + ' row'); continue; }
      const label = f === 'us' ? m.grade : f === 'uk' ? m.year : m.class;
      if (!label) out.push(at + ' ' + f + ' has no grade/year/class (say "not mapped")');
      if (!Array.isArray(m.sources) || !m.sources.length) out.push(at + ' ' + f + ' row has no source');
      resolve(at + ' ' + f, m.sources);
      if (!NM.test(String(label || '')) && !(m.sources || []).some((x) => String(x).indexOf(FW[f]) === 0)) out.push(at + ' ' + f + ' claims "' + label + '" without a ' + f + ' document');
    }
    for (const s of (r.stops || [])) {
      const st = at + ' stop ' + (s && s.unit);
      if (!s || !s.unit) { out.push(at + ' has a stop with no unit'); continue; }
      resolve(st, s.sources);
      const mapped = Object.keys(FW).filter((f) => !NM.test(String(s[f] || '')));
      for (const f of Object.keys(FW)) if (typeof s[f] !== 'string' || !s[f].trim()) out.push(st + ' has no ' + f + ' text (say "not mapped")');
      if (mapped.length && !(s.sources || []).length) out.push(st + ' is mapped (' + mapped.join(', ') + ') with no source');
      for (const f of mapped) if (!(s.sources || []).some((x) => String(x).indexOf(FW[f]) === 0)) out.push(st + ' ' + f + ' claims "' + String(s[f]).slice(0, 40) + '…" without a ' + f + ' document');
    }
  }
  return out;
}

/* what the page reads: the record as it stands, minus nothing — one line of JSON */
function build(G) {
  G = G || JSON.parse(fs.readFileSync(SRC, 'utf8'));
  const bad = problems(G);
  if (bad.length) { const e = new Error('grade-map.json breaks the rules:\n  ' + bad.slice(0, 20).join('\n  ')); e.problems = bad; throw e; }
  return '/* grade-map-data.js — WRITTEN BY tools/build-grade-map.cjs from grade-map/grade-map.json. Do not edit by hand:\n' +
    '   change the sourced JSON (citing a fetched document) and run the tool. tests/grade-map.cjs holds the two equal. */\n' +
    'window.SB_GRADE_MAP=' + JSON.stringify(G) + ';\n';
}

module.exports = { build, problems, SRC, OUT, FW };

if (require.main === module) {
  let txt;
  try { txt = build(); } catch (e) { console.error(e.message); process.exit(1); }
  if (process.argv.includes('--check')) {
    const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
    if (cur !== txt) { console.error('grade-map-data.js is stale — run node tools/build-grade-map.cjs'); process.exit(1); }
    console.log('grade-map-data.js is current'); process.exit(0);
  }
  fs.writeFileSync(OUT, txt);
  console.log('wrote ' + path.relative(APP, OUT) + ' (' + txt.length + ' bytes)');
}
