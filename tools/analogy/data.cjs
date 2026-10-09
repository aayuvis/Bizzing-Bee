/* data.cjs — the analogy engine's only door into Bee's word stores.

   Everything the engine knows comes from this repo: the word library (words-full.js), the
   definition-aware synonyms (word-synonyms.js), the alternate senses (word-alternates.js) and the
   origin notes (words-lore.js). No outside lexicon. A word the app would not serve (struck, cut, or
   caught by the safety regex) never enters, so nothing downstream can propose it.

   load() → { W: Map(word → {w, y, ps, d, s, t, alt[]}), SYN: Map(word → Set), LORE: Map } */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { open, strikeLists, APP } = require('../word-stores.cjs');

function unsafeRe(root) {
  const src = fs.readFileSync(path.join(root, 'app3.js'), 'utf8');
  const line = src.split('\n').find((l) => /^const SB_UNSAFE_RE=/.test(l));
  if (!line) throw new Error('data.cjs: no SB_UNSAFE_RE in app3.js');
  return vm.runInNewContext(line.replace(/^const SB_UNSAFE_RE=/, '').replace(/;\s*(\/\*.*)?$/, ''));
}

function script(root, file) {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), ctx);
  return ctx.window;
}

function load(root) {
  root = root || APP;
  const RE = unsafeRe(root), { STRIKE, CUT } = strikeLists(root);
  const full = open('words-full.js', root).get('SB_FULL');
  const W = new Map();
  let dropped = 0;
  for (const r of full) {
    const w = String(r.w || '');
    if (!/^[a-z]+$/.test(w) || !r.d || !r.y) continue;          // analogies use plain lowercase words
    if (STRIKE.has(w) || CUT.has(w) || RE.test(w + ' ' + r.d) || (r.s && RE.test(r.s))) { dropped++; continue; }
    // a person or a place: the library's lower-cased surnames and towns ("lowell: United States poet (1819-1891)")
    if (/\(\s*(?:born |died |c\. )?\d{3,4}\s*[-–]\s*\d{2,4}\s*\)|\(born \d{3,4}\)/i.test(r.d) || /^(?:a |an )?(?:city|town|village|state|province|county|capital|river|island|country|republic|kingdom) (?:in|of|on)\b/i.test(r.d)) { dropped++; continue; }
    W.set(w, { w, y: +r.y, ps: r.ps || '', d: String(r.d), s: r.s || '', t: r.t || [], alt: [] });
  }
  const win = script(root, 'word-alternates.js');
  for (const [w, senses] of Object.entries(win.SB_ALT || {})) {
    const x = W.get(w);
    if (x) x.alt = senses.filter((a) => a && a.d && !RE.test(a.d)).map((a) => ({ p: a.p || '', d: a.d }));
  }
  const SYN = new Map();
  for (const [w, list] of Object.entries(script(root, 'word-synonyms.js').SB_SYN || {})) {
    if (!W.has(w)) continue;
    for (const s of list) {
      if (!W.has(s) || s === w) continue;
      if (!SYN.has(w)) SYN.set(w, new Set());
      SYN.get(w).add(s);
    }
  }
  const LORE = new Map(Object.entries(script(root, 'words-lore.js').SB_LORE || {}).filter(([w]) => W.has(w)));
  return { W, SYN, LORE, dropped };
}

module.exports = { load, APP };
