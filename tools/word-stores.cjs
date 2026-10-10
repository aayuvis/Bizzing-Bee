/* word-stores.cjs — read and rewrite the JSON literals the word stores are made of, ROUND-TRIP SAFE.

   Every word store is a classic script whose data line is `window.SB_X = <JSON>;` (or the shard's
   `window.SB_DATA.nsf.push.apply(window.SB_DATA.nsf, <JSON>);`, the trivia word bank's
   `window.SB_TRIVIA.questions=window.SB_TRIVIA.questions.concat(<JSON>);`, or words-full.js's JSON *string*
   holding JSON). open() parses each such line and refuses the file unless JSON.stringify gives the
   line back byte for byte — so an edit touches only the records it changes, and the header
   comments, the line order and every other record stay exactly as they were.

     const o = open('words-data-2.js');   o.parts → [{ name, v }]  (v is live: edit it in place)
     o.save();                                                     (writes only if something changed)

   The trivia LEVEL SHARDS are the same shape with another head — `SB_TRIVIA._add(<level>,<JSON>);` — and
   openTrivia() below keeps the whole bank in step: the five shards, the word bank, the canonical
   trivia-all.json (not shipped) and trivia-data.js's byLevel counts.

   Used by tools/strike-served.cjs, tools/clean-glosses.cjs and tools/stigma-fix.cjs. Node only; never shipped. */
'use strict';
const fs = require('fs'), path = require('path');
const APP = path.resolve(__dirname, '..');

const LINE = /^(window\.SB_DATA\.nsf\.push\.apply\(window\.SB_DATA\.nsf, |window\.SB_TRIVIA\.questions=window\.SB_TRIVIA\.questions\.concat\(|SB_TRIVIA\._add\([1-5],|window\.SB_[A-Z_0-9]+ ?= ?)(.*?)(\);?|;?)\s*$/;
function open(file, root) {
  const p = path.join(root || APP, file), text = fs.readFileSync(p, 'utf8'), lines = text.split('\n'), parts = [];
  lines.forEach((ln, i) => {
    if (ln.length < 2 || !/^(window\.SB_|SB_TRIVIA\._add\()/.test(ln)) return;
    const m = ln.match(LINE); if (!m) return;
    const push = /(push\.apply\(window\.SB_DATA\.nsf, |concat\(|_add\([1-5],)$/.test(m[1]);
    if (push !== (m[3][0] === ')')) return;
    let v; try { v = JSON.parse(m[2]); } catch (e) { return; }
    const dbl = typeof v === 'string' && /^\s*[[{]/.test(v);
    if (dbl) v = JSON.parse(v);
    const ser = (x) => (dbl ? JSON.stringify(JSON.stringify(x)) : JSON.stringify(x));
    if (ser(v) !== m[2]) throw new Error(file + ':' + (i + 1) + ' does not round-trip through JSON — refusing to edit it');
    parts.push({ i, name: (m[1].match(/SB_[A-Z_0-9]+/) || [''])[0], head: m[1], tail: m[3], v, ser, was: m[2] });
  });
  return {
    file, parts, text,
    /* the record arrays of a word shard (SB_DATA's nsf, or a push.apply line) */
    records() { return parts.map((x) => (x.name === 'SB_DATA' && x.v && Array.isArray(x.v.nsf) ? x.v.nsf : x.v)).filter(Array.isArray); },
    get(name) { const x = parts.find((q) => q.name === name); return x ? x.v : undefined; },
    save() {
      let changed = 0;
      for (const x of parts) { const s = x.ser(x.v); if (s !== x.was) { lines[x.i] = x.head + s + x.tail; changed++; } }
      if (changed) fs.writeFileSync(p, lines.join('\n'));
      return changed;
    },
  };
}

/* the two strike lists, read out of app3.js by the same literal the page evaluates */
function strikeLists(root) {
  const src = fs.readFileSync(path.join(root || APP, 'app3.js'), 'utf8');
  const grab = (name) => {
    const at = src.indexOf('const ' + name + ' = new Set(');
    if (at < 0) throw new Error('word-stores: no ' + name + ' in app3.js');
    const end = src.indexOf(');\n', at);
    return new Set([...require('vm').runInNewContext(src.slice(at + ('const ' + name + ' = ').length, end + 1).replace(/\/\*[\s\S]*?\*\//g, ''))].map((w) => String(w).toLowerCase()));
  };
  return { STRIKE: grab('CORE_STRIKE'), CUT: grab('CORE_CUT') };
}

/* THE TRIVIA BANK, kept in step. A question lives in ONE served file — a level shard (trivia-q<n>.js,
   counted by trivia-data.js's byLevel) or the word bank (trivia-words.js, not counted there) — and, for
   most, in the canonical trivia-all.json too (not shipped; a few earlier deletions never reached it).
     const T = openTrivia();
     T.all()            → [{ q, file }] every served question
     T.edit(id, fn)     → fn(question) on the served copy AND the canonical one
     T.drop(ids)        → deletes them everywhere; returns how many left each file
     T.save()           → writes what changed, and rewrites byLevel from the shards' own counts — refusing
                          if byLevel did not match the shards BEFORE the edit (a count nobody can explain) */
function openTrivia(root) {
  const R = root || APP;
  const files = [1, 2, 3, 4, 5].map((n) => 'trivia-q' + n + '.js').concat(['trivia-words.js']);
  const stores = files.map((f) => { const o = open(f, R), arr = o.records()[0];
    if (!Array.isArray(arr) || !arr.length) throw new Error('word-stores: no question array in ' + f); return { f, o, arr }; });
  const allP = path.join(R, 'trivia-all.json'), allText = fs.readFileSync(allP, 'utf8'), ALL = JSON.parse(allText);
  if (JSON.stringify(ALL) !== allText) throw new Error('trivia-all.json does not round-trip through JSON — refusing to edit it');
  const dataP = path.join(R, 'trivia-data.js'), dataText = fs.readFileSync(dataP, 'utf8');
  const BY = /^(\s*byLevel:)(\{[^{}\n]*\})(,?\s*)$/m, bm = dataText.match(BY);
  if (!bm) throw new Error('word-stores: no byLevel line in trivia-data.js');
  const count = () => { const o = {}; stores.slice(0, 5).forEach((s, i) => { o[String(i + 1)] = s.arr.length; }); return o; };
  if (JSON.stringify(JSON.parse(bm[2])) !== JSON.stringify(count())) throw new Error('trivia-data.js byLevel ' + bm[2] + ' does not match the shards ' + JSON.stringify(count()) + ' before any edit — refusing');
  const canon = (id) => ALL.questions.find((x) => x.id === id);
  let allChanged = false;
  return {
    all() { return stores.flatMap((s) => s.arr.map((q) => ({ q, file: s.f }))); },
    edit(id, fn) { let n = 0; stores.forEach((s) => s.arr.forEach((q) => { if (q.id === id) { fn(q); n++; } }));
      const c = canon(id); if (c) { fn(c); allChanged = true; } return n; },
    drop(ids) { const S = ids instanceof Set ? ids : new Set(ids), out = {};
      stores.forEach((s) => { for (let i = s.arr.length - 1; i >= 0; i--) if (S.has(s.arr[i].id)) { s.arr.splice(i, 1); out[s.f] = (out[s.f] || 0) + 1; } });
      const before = ALL.questions.length; ALL.questions = ALL.questions.filter((q) => !S.has(q.id));
      if (ALL.questions.length !== before) { allChanged = true; out['trivia-all.json'] = before - ALL.questions.length; }
      return out; },
    save() {
      let changed = 0; stores.forEach((s) => { changed += s.o.save(); });
      if (allChanged && JSON.stringify(ALL) !== allText) { fs.writeFileSync(allP, JSON.stringify(ALL)); changed++; }
      const nb = JSON.stringify(count());
      if (nb !== bm[2]) { fs.writeFileSync(dataP, dataText.replace(BY, (m0, a, b, c) => a + nb + c)); changed++; }
      return changed; },
    byLevel: count,
  };
}

module.exports = { open, openTrivia, strikeLists, APP };
