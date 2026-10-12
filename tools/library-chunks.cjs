#!/usr/bin/env node
/* THE 130k LIBRARY IN LETTERED CHUNKS (road to 4.5, P1.12 — "split words-full.js into lettered lazy chunks;
   dictionary lookups < 1 s").

   words-full.js is one 45 MB line (the generated core, a JSON string) and words-hard.js the 1.5 MB championship
   shard. The page used to fetch BOTH whole before the Word Finder could look up a single word that is not in the
   served corpus — the v5 audit timed the full load at 114 s under load. Those two files stay the SOURCE: every
   tool and data test reads them, and nothing here changes a record. This tool cuts them into `words-full/`:

     words-full/index.js     SB_FULL_IX — the chunk bounds, the file names, and the ORDER of both source arrays
                             (run-length pairs [chunk, count, …]), so the whole library reassembles in exactly the
                             order words-full.js holds it (the Finder's ranking, the Whole Hive list and hardPool
                             all read that order).
     words-full/<lo>.js      one chunk: every headword k with  lo ≤ k < (the next chunk's lo), as two JSON strings
                             — `c` the core records, `h` the championship shard's — each in its source order.

   THE CUT. A headword's key is the page's own nkey (lower case, trimmed). Keys are grouped by first letter (a–z;
   any key at or past '{' — élan, étagère, … — goes to `accents`); a letter over CAP is split by its next letter,
   recursively, and the pieces are packed back together in order up to CAP. A chunk never crosses a first letter,
   so every chunk is "a letter, or a stretch of one". CAP (bytes of chunk data) keeps a chunk under ~200 KB on the
   wire, which is what makes a lookup fast: the Finder fetches the index (~10 KB gz) and the chunk(s) covering what
   was typed — never the library.

   Nothing is typed by hand: the chunks are what this writes from the two sources, byte for byte, and
   tests/library-chunks.cjs rebuilds and compares. Change words-full.js or words-hard.js → re-run this.

     node tools/library-chunks.cjs          write words-full/
     node tools/library-chunks.cjs --check  exit 1 if words-full/ is not exactly what this would write
     node tools/library-chunks.cjs --stats  print the plan, write nothing                                        */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto'), zlib = require('zlib');
const APP = path.resolve(__dirname, '..');
const OUT = 'words-full';
const CAP = 750000;           // bytes of chunk data (the two JSON-string literals) — ≤ ~200 KB gzipped
const MAX_DEPTH = 4;          // a prefix this long is never split again (no 4-letter stem is near CAP)
const INTL = '{';             // the first code unit after 'z': every key from here on is the `accents` chunk
const nkey = (w) => String(w || '').toLowerCase().trim();   // app3's nkey — the Finder searches by it

function readSources(root) {
  const R = root || APP;
  const fullTxt = fs.readFileSync(path.join(R, 'words-full.js'), 'utf8');
  const hardTxt = fs.readFileSync(path.join(R, 'words-hard.js'), 'utf8');
  const w = {};
  new Function('window', fullTxt)(w);
  new Function('window', hardTxt)(w);
  const core = typeof w.SB_FULL === 'string' ? JSON.parse(w.SB_FULL) : w.SB_FULL;
  const hard = w.SB_HARD;
  if (!Array.isArray(core) || !core.length) throw new Error('words-full.js does not define SB_FULL as a list of records');
  if (!Array.isArray(hard) || !hard.length) throw new Error('words-hard.js does not define SB_HARD as a list of records');
  const v = crypto.createHash('sha1').update(fullTxt).update('\0').update(hardTxt).digest('hex').slice(0, 12);
  return { core, hard, v };
}

/* the size a record adds to its chunk: its JSON, escaped once more inside the string literal, plus a comma */
const weigh = (r) => JSON.stringify(JSON.stringify(r)).length - 1;

/* split a run of keyed records sharing `prefix` into ordered atoms, each under CAP where a deeper prefix allows */
function atoms(prefix, items) {
  const size = items.reduce((t, x) => t + x.n, 0);
  if (size <= CAP || prefix.length >= MAX_DEPTH) return [{ lo: prefix, items, size }];
  const by = new Map();
  for (const x of items) { const c = x.k.length > prefix.length ? x.k[prefix.length] : ''; if (!by.has(c)) by.set(c, []); by.get(c).push(x); }
  const out = [];
  for (const c of [...by.keys()].sort()) {
    const sub = by.get(c);
    if (c === '') out.push({ lo: prefix, items: sub, size: sub.reduce((t, x) => t + x.n, 0) });
    else out.push(...atoms(prefix + c, sub));
  }
  return out;
}

function plan(src) {
  const { core, hard, v } = src;
  /* every record, tagged with where it came from and its place there */
  const all = core.map((r, i) => ({ r, k: nkey(r && r.w), n: weigh(r), src: 'c', i }))
    .concat(hard.map((r, i) => ({ r, k: nkey(r && r.w), n: weigh(r), src: 'h', i })));
  /* group by first letter; '' for keys before 'a', '{' for keys at or after it */
  const letter = (k) => (k >= INTL ? INTL : (k[0] >= 'a' && k[0] <= 'z') ? k[0] : '');
  const groups = new Map();
  for (const x of all) { const g = letter(x.k); if (!groups.has(g)) groups.set(g, []); groups.get(g).push(x); }
  const chunks = [];
  for (const g of [...groups.keys()].sort()) {
    const items = groups.get(g);
    const parts = g === INTL || g === '' ? [{ lo: g, items, size: items.reduce((t, x) => t + x.n, 0) }] : atoms(g, items);
    let cur = null;
    for (const a of parts) {
      if (cur && cur.size + a.size <= CAP) { cur.items = cur.items.concat(a.items); cur.size += a.size; continue; }
      /* a letter's first chunk starts AT the letter, whatever its first headword is */
      cur = { lo: cur ? a.lo : g, items: a.items.slice(), size: a.size }; chunks.push(cur);
    }
  }
  /* bounds: the first chunk takes everything below its letter too, so the bounds cover every key */
  chunks[0].lo = '';
  chunks.forEach((c, i) => {
    c.file = c.lo === INTL ? 'accents' : (i === 0 ? (c.items[0].k[0] || 'a') : c.lo);
    /* source order inside a chunk: core by its index, shard by its index */
    c.core = c.items.filter((x) => x.src === 'c').sort((a, b) => a.i - b.i);
    c.hard = c.items.filter((x) => x.src === 'h').sort((a, b) => a.i - b.i);
  });
  const files = chunks.map((c) => c.file);
  if (new Set(files).size !== files.length) throw new Error('two chunks would share a file name: ' + files.join(','));
  /* the order of each source, run-length encoded over chunk numbers */
  const at = new Map(); chunks.forEach((c, ci) => c.items.forEach((x) => at.set(x, ci)));
  const rle = (src) => { const out = []; for (const x of all.filter((y) => y.src === src)) { const ci = at.get(x);
    if (out.length && out[out.length - 2] === ci) out[out.length - 1]++; else out.push(ci, 1); } return out; };
  return { v, chunks, files, bounds: chunks.map((c) => c.lo), seq: rle('c'), hseq: rle('h'), n: core.length, h: hard.length };
}

function write(p) {
  const out = {};
  const json = (arr) => JSON.stringify(JSON.stringify(arr.map((x) => x.r)));
  p.chunks.forEach((c, i) => {
    const hi = p.bounds[i + 1];
    const range = (c.lo === '' ? 'the start' : '"' + (c.lo === INTL ? 'é…' : c.lo) + '"') + ' up to ' + (hi == null ? 'the end' : '(not including) "' + (hi === INTL ? 'é…' : hi) + '"');
    out[c.file + '.js'] =
      '/* words-full/' + c.file + '.js — GENERATED by tools/library-chunks.cjs from words-full.js + words-hard.js (' + p.v + '). Never edit by hand:\n' +
      '   change the source and re-run the tool. Every headword from ' + range + ': ' + c.core.length + ' core + ' + c.hard.length + ' shard records. */\n' +
      '(window.SB_FULLC=window.SB_FULLC||{})[' + JSON.stringify(c.file) + ']={c:' + json(c.core) + ',h:' + json(c.hard) + '};\n';
  });
  out['index.js'] =
    '/* words-full/index.js — GENERATED by tools/library-chunks.cjs (' + p.v + '). Never edit by hand. The 130k library\'s chunks: b = each\n' +
    '   chunk\'s lowest key (a headword k is in chunk i when b[i] <= k < b[i+1]), f = its file, n/h = the core and shard record\n' +
    '   counts, seq/hseq = the order of words-full.js / words-hard.js as [chunk, run length, …]. library.js reads it. */\n' +
    'window.SB_FULL_IX=' + JSON.stringify({ v: p.v, n: p.n, h: p.h, b: p.bounds, f: p.files, seq: p.seq, hseq: p.hseq }) + ';\n';
  return out;
}

function build(root) { return write(plan(readSources(root))); }

module.exports = { build, plan, readSources, nkey, CAP, OUT };

if (require.main === module) {
  const mode = process.argv[2] || '';
  const p = plan(readSources());
  const files = write(p);
  const dir = path.join(APP, OUT);
  if (mode === '--stats') {
    let max = 0;
    for (const [f, t] of Object.entries(files)) { const gz = zlib.gzipSync(t, { level: 6 }).length; if (f !== 'index.js') max = Math.max(max, gz);
      console.log(f.padEnd(14) + String(t.length).padStart(10) + ' B ' + (gz / 1024).toFixed(0).padStart(6) + ' KB gz'); }
    console.log(`${p.chunks.length} chunks · ${p.n} core + ${p.h} shard records · seq ${p.seq.length / 2} runs, hseq ${p.hseq.length / 2} · largest chunk ${(max / 1024).toFixed(0)} KB gz`);
    process.exit(0);
  }
  if (mode === '--check') {
    const have = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /\.js$/.test(f)).sort() : [];
    const want = Object.keys(files).sort();
    const bad = want.filter((f) => !have.includes(f) || fs.readFileSync(path.join(dir, f), 'utf8') !== files[f]).concat(have.filter((f) => !want.includes(f)).map((f) => f + ' (stray)'));
    if (bad.length) { console.error('words-full/ is not what tools/library-chunks.cjs writes from the sources: ' + bad.slice(0, 8).join(', ') + (bad.length > 8 ? ' …' : '')); process.exit(1); }
    console.log(`words-full/ matches its sources (${want.length} files, ${p.v})`);
    process.exit(0);
  }
  fs.mkdirSync(dir, { recursive: true });
  for (const f of fs.readdirSync(dir)) if (/\.js$/.test(f) && !(f in files)) fs.unlinkSync(path.join(dir, f));
  let n = 0; for (const [f, t] of Object.entries(files)) { const fp = path.join(dir, f); if (!fs.existsSync(fp) || fs.readFileSync(fp, 'utf8') !== t) { fs.writeFileSync(fp, t); n++; } }
  console.log(`words-full/: ${p.chunks.length} chunks + index from ${p.n} core + ${p.h} shard records (${p.v}); ${n} file(s) written`);
}
