/* word-stores.cjs — read and rewrite the JSON literals the word stores are made of, ROUND-TRIP SAFE.

   Every word store is a classic script whose data line is `window.SB_X = <JSON>;` (or the shard's
   `window.SB_DATA.nsf.push.apply(window.SB_DATA.nsf, <JSON>);`, or words-full.js's JSON *string*
   holding JSON). open() parses each such line and refuses the file unless JSON.stringify gives the
   line back byte for byte — so an edit touches only the records it changes, and the header
   comments, the line order and every other record stay exactly as they were.

     const o = open('words-data-2.js');   o.parts → [{ name, v }]  (v is live: edit it in place)
     o.save();                                                     (writes only if something changed)

   Used by tools/strike-served.cjs and tools/clean-glosses.cjs. Node only; never shipped. */
'use strict';
const fs = require('fs'), path = require('path');
const APP = path.resolve(__dirname, '..');

const LINE = /^(window\.SB_DATA\.nsf\.push\.apply\(window\.SB_DATA\.nsf, |window\.SB_[A-Z_0-9]+ ?= ?)(.*?)(\);?|;?)\s*$/;
function open(file, root) {
  const p = path.join(root || APP, file), text = fs.readFileSync(p, 'utf8'), lines = text.split('\n'), parts = [];
  lines.forEach((ln, i) => {
    if (ln.length < 2 || !/^window\.SB_/.test(ln)) return;
    const m = ln.match(LINE); if (!m) return;
    const push = /push\.apply/.test(m[1]);
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

module.exports = { open, strikeLists, APP };
