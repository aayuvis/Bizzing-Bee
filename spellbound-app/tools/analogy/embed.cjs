/* embed.cjs — Bee's own word map: skip-gram with negative sampling, trained on Bee's own text.

   The corpus is every definition (with its headword in front, so a word is pulled toward the
   words that define it), every example sentence, every alternate sense and every origin note in
   the library. Nothing else. Tokens are folded to their base form through lex.infl so "dogs"
   and "dog" are one point.

   What the map is FOR: finding the word a child's ear pairs with C (the tempting wrong answer),
   and measuring how far apart two pairs are (near or far domain). What it is NOT for: deciding
   that two words stand in a relation. Measured on Bee's own relation table, the vector offset
   (B − A + C) finds D only rarely; relations come from relations.cjs.

   Deterministic: a fixed seed, a fixed corpus order, one thread. Cached in the system temp folder (never
   committed, never inside the app folder a deploy copies), keyed on the corpus size so a
   changed library retrains. */
'use strict';
const fs = require('fs'), path = require('path');

const DIM = 100, WIN = 5, NEG = 5, EPOCHS = 4, MINC = 3, LR0 = 0.03, SUB = 1e-4;
const CACHE = process.env.ANALOGY_CACHE || path.join(require('os').tmpdir(), 'bee-analogy-cache');   // outside the app tree: a deploy copies the tree

function corpus(D, X) {
  const S = [];
  const fold = (t) => { const b = X.infl(t); return b && b !== t ? b : t; };
  const toks = (s) => X.tokens(s).filter((t) => /^[a-z][a-z'-]*$/.test(t)).map(fold);
  for (const [w, x] of D.W) {
    S.push([w].concat(toks(x.d)));
    if (x.s) S.push(toks(x.s));
    for (const a of x.alt) S.push([w].concat(toks(a.d)));
  }
  for (const [w, lines] of D.LORE) for (const l of [].concat(lines)) S.push([w].concat(toks(l)));
  return S;
}

function rng(seed) {
  let s = seed >>> 0;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

function train(D, X, log) {
  const S = corpus(D, X);
  const cnt = new Map();
  let total = 0;
  for (const s of S) for (const t of s) { cnt.set(t, (cnt.get(t) || 0) + 1); total++; }
  const key = S.length + ':' + total;
  const f = path.join(CACHE, 'emb-' + DIM + '.json');
  const fb = path.join(CACHE, 'emb-' + DIM + '.bin');
  if (fs.existsSync(f) && fs.existsSync(fb)) {
    const meta = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (meta.key === key) {
      const buf = fs.readFileSync(fb);
      return pack(meta.vocab, new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4), meta);
    }
  }
  const vocab = [...cnt].filter(([, c]) => c >= MINC).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).map(([t]) => t);
  const id = new Map(vocab.map((t, i) => [t, i]));
  const V = vocab.length, freq = vocab.map((t) => cnt.get(t));
  const N = freq.reduce((a, b) => a + b, 0);
  // unigram^0.75 table for negatives
  const TS = 1 << 24, table = new Int32Array(TS);
  let z = 0; for (const c of freq) z += Math.pow(c, 0.75);
  for (let i = 0, j = 0, acc = Math.pow(freq[0], 0.75) / z; j < TS; j++) {
    table[j] = i;
    if (j / TS > acc && i < V - 1) { i++; acc += Math.pow(freq[i], 0.75) / z; }
  }
  const keep = freq.map((c) => { const r = c / N; return Math.min(1, (Math.sqrt(r / SUB) + 1) * SUB / r); });
  const R = rng(20261009);
  const W0 = new Float32Array(V * DIM), W1 = new Float32Array(V * DIM);
  for (let i = 0; i < W0.length; i++) W0[i] = (R() - 0.5) / DIM;
  const ids = S.map((s) => Int32Array.from(s.map((t) => (id.has(t) ? id.get(t) : -1)).filter((i) => i >= 0)));
  const totalSteps = EPOCHS * N;
  let done = 0;
  const g = new Float32Array(DIM);
  const sig = (x) => (x > 6 ? 1 : x < -6 ? 0 : 1 / (1 + Math.exp(-x)));
  for (let ep = 0; ep < EPOCHS; ep++) {
    const t0 = Date.now();
    for (const sent of ids) {
      const kept = [];
      for (const i of sent) if (R() < keep[i]) kept.push(i);
      for (let p = 0; p < kept.length; p++) {
        const lr = Math.max(LR0 * 1e-4, LR0 * (1 - done / totalSteps));
        done++;
        const b = 1 + Math.floor(R() * WIN);
        const wi = kept[p] * DIM;
        for (let q = Math.max(0, p - b); q < Math.min(kept.length, p + b + 1); q++) {
          if (q === p) continue;
          const ci = kept[q] * DIM;
          g.fill(0);
          for (let n = 0; n <= NEG; n++) {
            let o, label;
            if (n === 0) { o = ci; label = 1; } else { const k = table[Math.floor(R() * TS)]; if (k * DIM === ci) continue; o = k * DIM; label = 0; }
            let dot = 0;
            for (let d = 0; d < DIM; d++) dot += W0[wi + d] * W1[o + d];
            const e = (label - sig(dot)) * lr;
            for (let d = 0; d < DIM; d++) { g[d] += e * W1[o + d]; W1[o + d] += e * W0[wi + d]; }
          }
          for (let d = 0; d < DIM; d++) W0[wi + d] += g[d];
        }
      }
    }
    if (log) log('epoch ' + (ep + 1) + '/' + EPOCHS + ' ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
  }
  for (let i = 0; i < V; i++) {
    let n = 0; for (let d = 0; d < DIM; d++) n += W0[i * DIM + d] ** 2;
    n = Math.sqrt(n) || 1; for (let d = 0; d < DIM; d++) W0[i * DIM + d] /= n;
  }
  fs.mkdirSync(CACHE, { recursive: true });
  const meta = { key, vocab, freq, tokens: total, sentences: S.length };
  fs.writeFileSync(f, JSON.stringify(meta));
  fs.writeFileSync(fb, Buffer.from(W0.buffer));
  return pack(vocab, W0, meta);
}

function pack(vocab, M, meta) {
  const id = new Map(vocab.map((t, i) => [t, i]));
  const freq = new Map(vocab.map((t, i) => [t, meta.freq[i]]));
  const cos = (a, b) => {
    const i = id.get(a), j = id.get(b);
    if (i === undefined || j === undefined) return null;
    let s = 0; for (let d = 0; d < DIM; d++) s += M[i * DIM + d] * M[j * DIM + d];
    return s;
  };
  const POOL = new Map();
  function near(w, k, filter) {
    const i = id.get(w);
    if (i === undefined) return [];
    const top = [];
    const pool = filter ? (POOL.get(filter) || POOL.set(filter, vocab.map((t, j) => (filter(t) ? j : -1)).filter((j) => j >= 0)).get(filter)) : null;
    const n = pool ? pool.length : vocab.length;
    for (let q = 0; q < n; q++) {
      const j = pool ? pool[q] : q;
      if (j === i) continue;
      let s = 0; for (let d = 0; d < DIM; d++) s += M[i * DIM + d] * M[j * DIM + d];
      if (top.length < k || s > top[top.length - 1][1]) { top.push([vocab[j], s]); top.sort((a, b) => b[1] - a[1]); if (top.length > k) top.pop(); }
    }
    return top;
  }
  /* B − A + C, best k (the "neural map alone" test) */
  function offset(a, b, c, k) {
    const ia = id.get(a), ib = id.get(b), ic = id.get(c);
    if ([ia, ib, ic].includes(undefined)) return [];
    const q = new Float32Array(DIM);
    for (let d = 0; d < DIM; d++) q[d] = M[ib * DIM + d] - M[ia * DIM + d] + M[ic * DIM + d];
    const top = [];
    for (let j = 0; j < vocab.length; j++) {
      if (j === ia || j === ib || j === ic) continue;
      let s = 0; for (let d = 0; d < DIM; d++) s += M[j * DIM + d] * q[d];
      if (top.length < k || s > top[top.length - 1][1]) { top.push([vocab[j], s]); top.sort((x, y) => y[1] - x[1]); if (top.length > k) top.pop(); }
    }
    return top;
  }
  return { vocab, M, DIM, id, freq, cos, near, offset, meta, has: (w) => id.has(w) };
}

module.exports = { train, DIM };
