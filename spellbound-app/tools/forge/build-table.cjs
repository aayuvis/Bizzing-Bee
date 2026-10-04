#!/usr/bin/env node
/* build-table.cjs — Word Forge's morpheme table, assembled from CITED sources, never typed.

   Two steps, because the etymological source is not in this repo and must not be:

   1. EXTRACT (needs the source on disk, once):
        node tools/forge/build-table.cjs --extract <etymonline-dump-dir> [--etymwn <etymologies.json>]
      <etymonline-dump-dir> holds ety.json + word.txt (the offline Online Etymology Dictionary
      dump shipped in the npm package `etymolo`, brotli-decompressed). For every library word that
      contains one of the 30 roots it keeps a SHORT excerpt of that word's entry (and of one entry
      it points to with "see …"), the entry's URL, and — when given — the Etymological Wordnet
      relations for the word (de Melo 2014, via the `ety` package's etymologies.json). Writes
      forge-review/evidence.json. That file is what the owner reads; nothing else is kept.

   2. BUILD (offline, repeatable):
        node tools/forge/build-table.cjs
      Reads tools/forge/spec.json (WHERE each meaning is stated), concepts-data.js (the meanings
      themselves), the word library (the word must be one the speller can hear and practise) and
      forge-review/evidence.json (the cited etymology). A row is kept only when ALL of these hold:
        - the word splits into parts from the inventory (a root's own forms from its chapter, and
          prefixes/suffixes whose meaning a concepts-data chapter states), joining back to the word
          exactly, with any e-drop / y→i shown (forge-core.js join());
        - the cited entry names the root's Latin/Greek etymon AND glosses it with the root's meaning
          (e.g. *credere* "to believe") — a coincidence of letters (at+TEN+tion, from *tendere*
          "to stretch") fails here;
        - a prefix in the word is named in the cited entry (in-, com, ex, ad-…), and for in-/im-/
          il-/ir- the entry's own gloss decides "not" or "into";
        - the Etymological Wordnet, where it has the word, does not contradict the origin;
        - the word is in the library, has a definition, and passes the app's safety regex.
      Rows that fail go out, with the reason, into forge-review/dropped.json.
      Writes forge-data.js (signedOff:false — only the owner flips it) and forge-review/index.html.

   Nothing in this file states a meaning, an origin or a split. If a row is wrong, the fix is in
   the source it cites or in spec.json's pointer to a chapter — never a hand edit of the output. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const APP = path.resolve(__dirname, '..', '..');
const CORE = require(path.join(APP, 'forge-core.js'));
const SPEC = JSON.parse(fs.readFileSync(path.join(__dirname, 'spec.json'), 'utf8'));
const EVID = path.join(APP, 'forge-review', 'evidence.json');
const PER_ROOT = 10;

/* ---------------------------------------------------------------- the app's own data */
function loadApp() {
  const win = { console }; win.window = win; win.document = {};
  const ctx = vm.createContext(win);
  for (const f of ['words-data.js', 'words-extra.js', 'words-patch.js', 'words-data-2.js', 'concepts-data.js', 'voice-words.js'])
    vm.runInContext(fs.readFileSync(path.join(APP, f), 'utf8'), ctx, { filename: f });
  if (typeof win.SB_WORDS_PATCH === 'function') win.SB_WORDS_PATCH();
  const app3 = fs.readFileSync(path.join(APP, 'app3.js'), 'utf8');
  const m = app3.match(/\nconst SB_UNSAFE_RE=(\/.*\/i);/);
  if (!m) throw new Error('build-table: SB_UNSAFE_RE not found in app3.js');
  const UNSAFE = vm.runInNewContext(m[1]);
  const WORD = Object.create(null);
  win.SB_DATA.nsf.forEach((r, i) => { if (r && r.w && !WORD[r.w]) WORD[r.w] = Object.assign({ _i: i }, r); });
  /* the 128k library, for a root the served corpus cannot fill — every word in it has a clip */
  const FULL = Object.create(null);
  try { vm.runInContext(fs.readFileSync(path.join(APP, 'words-full.js'), 'utf8'), ctx, { filename: 'words-full.js' });
    JSON.parse(win.SB_FULL).forEach(r => { if (r && r.w && !WORD[r.w] && !FULL[r.w]) FULL[r.w] = Object.assign({ _i: 1e6, _full: 1 }, r); }); } catch (e) {}
  const HELD = new Set((win.SB_WORDS_HELD || []).map(String));
  const VOICED = new Set(String(win.SB_WVOICE || '').split('|'));
  return { WORD, FULL, CH: win.SB_CONCEPTS.chapters, UNSAFE, HELD, VOICED, GLOSS_OK: win.SB_GLOSS_OK };
}

/* WHERE a meaning is stated → {text, cite}. Reads the chapter; types nothing. */
function meaningOf(CH, sp) {
  const ch = CH[sp.ch]; if (!ch) throw new Error('no chapter ' + sp.ch);
  const head = 'concepts-data.js · chapter ' + sp.ch + ' “' + ch.title + '”';
  const how = sp.mean || (sp.card ? 'cardRoot' : sp.body ? 'bodyRoot' : 'title');
  if (how === 'title') { const m = ch.title.match(/\(([^)]+)\)/); if (!m) throw new Error('title has no meaning: ' + ch.title); return { text: m[1].trim(), cite: head + ' (title)' }; }
  if (how === 'cardRoot' || how === 'card') {
    const re = new RegExp(sp.card || sp.re, 'i');
    for (const k of ch.cards) { const m = k.title.match(re); if (m) return { text: m[1].trim(), cite: head + ' · card “' + k.title + '”' }; }
    throw new Error('no card ' + re + ' in ' + ch.title);
  }
  if (how === 'bodyRoot' || how === 'body') {
    const re = new RegExp(sp.bodyRe || sp.re); const k = ch.cards.find(c => c.title === sp.body);
    if (!k) throw new Error('no card “' + sp.body + '” in ' + ch.title);
    const m = k.body.match(re); if (!m) throw new Error('no ' + re + ' in card ' + sp.body);
    return { text: m[1].trim(), cite: head + ' · card “' + k.title + '”' };
  }
  if (how === 'concept') { const m = ch.concept.match(new RegExp(sp.re)); if (!m) throw new Error('no ' + sp.re + ' in concept of ' + ch.title); return { text: m[1].trim(), cite: head + ' (opening line)' }; }
  throw new Error('unknown meaning locator ' + how);
}
const lc = s => String(s || '').toLowerCase();
const norm = s => lc(s).normalize('NFD').replace(/[̀-ͯ]/g, '');
const short = t => String(t).split(/\s*\/\s*/)[0].replace(/\s+/g, ' ').trim().toLowerCase();

/* ---------------------------------------------------------------- the inventory */
function inventory(A) {
  const roots = SPEC.roots.map(r => Object.assign({}, r, { mean: meaningOf(A.CH, r) }));
  const affixes = [];
  for (const a of SPEC.affixes) {
    const m = meaningOf(A.CH, a);
    a.forms.forEach(f => affixes.push({ s: f, k: a.kind, fam: a.fam, mean: m, glossOnly: !!a.glossOnly, famForms: a.forms }));
  }
  const rules = {};
  for (const k of Object.keys(SPEC.rules)) {
    const r = SPEC.rules[k], ch = A.CH[r.ch], card = ch && ch.cards.find(c => c.title === r.card);
    if (!card) throw new Error('rule card missing: ' + r.card);
    rules[k] = { cite: 'concepts-data.js · chapter ' + r.ch + ' “' + ch.title + '” · card “' + card.title + '”', text: card.body };
  }
  return { roots, affixes, rules };
}

/* Every split of a word into [pre]{0,1} root (root){0,1} [suf]{0,2}, 2–4 parts, that joins back
   exactly (with e-drop / y→i where they apply). */
function splits(w, INV) {
  const out = [];
  const pres = INV.affixes.filter(a => a.k === 'pre'), sufs = INV.affixes.filter(a => a.k === 'suf');
  const rootForms = []; INV.roots.forEach(r => r.forms.forEach(f => rootForms.push({ s: f, k: 'root', id: r.id, root: r })));
  function rec(acc) {
    const parts = acc.map(p => p.s), kinds = acc.map(p => p.k);
    const j = CORE.join(parts, kinds).word;
    if (j === w && acc.length >= 2 && acc.some(p => p.k === 'root')) { out.push(acc.slice()); }
    if (acc.length >= 4 || !w.startsWith(j.slice(0, Math.max(0, j.length - 1)))) return;
    const nRoot = acc.filter(p => p.k === 'root').length, last = acc[acc.length - 1];
    const cands = [];
    if (!acc.length) pres.forEach(p => cands.push(p));
    if (!last || last.k === 'pre' || (last.k === 'root' && nRoot < 2)) rootForms.forEach(r => cands.push(r));
    if (last && (last.k === 'root' || (last.k === 'suf' && acc.filter(p => p.k === 'suf').length < 2))) sufs.forEach(s => cands.push(s));
    for (const c of cands) {
      const nx = acc.concat([c]);
      const jj = CORE.join(nx.map(p => p.s), nx.map(p => p.k)).word;
      /* the last part may still lose an e / y at the next joint, so allow one letter of slack */
      const head = jj.slice(0, jj.length - 1);
      if (w.startsWith(head) && jj.length <= w.length + 1) rec(nx);
    }
  }
  rec([]);
  return out;
}

/* ---------------------------------------------------------------- the cited text */
/* The dump writes italics as ,term, and glosses as "…". Tokenise into text / term / gloss. */
function tokens(s) {
  const out = []; let i = 0, buf = '';
  const flush = () => { if (buf) { out.push({ t: 'text', v: buf }); buf = ''; } };
  while (i < s.length) {
    const c = s[i];
    if (c === '"') { const j = s.indexOf('"', i + 1); if (j < 0) { buf += s.slice(i); break; } flush(); out.push({ t: 'gloss', v: s.slice(i + 1, j).replace(/[,.;]\s*$/, '') }); i = j + 1; continue; }
    if (c === ',' && (i === 0 || /[\s(\[+]/.test(s[i - 1])) && s[i + 1] && !/\s/.test(s[i + 1])) {
      const j = s.indexOf(',', i + 1), q = s.indexOf('"', i + 1);
      if (j > 0 && (q < 0 || j < q) && j - i < 50) { flush(); out.push({ t: 'term', v: s.slice(i + 1, j) }); i = j + 1; continue; }
    }
    buf += c; i++;
  }
  flush();
  return out;
}
/* the paragraph that carries the etymology: the entry up to its first blank line, sense list or
   "Related Entries", clipped at a sentence end near 520 characters */
function excerptOf(raw) {
  let s = String(raw || '');
  const rel = s.indexOf(',Related Entries,'); if (rel >= 0) s = s.slice(0, rel);
  /* paragraphs up to and including the first that says where the word came FROM */
  const paras = s.split(/\n\s*\n/); let acc = '';
  for (const p of paras) { acc += (acc ? ' ' : '') + p.trim(); if (/\bfrom\b/.test(p) || acc.length > 400) break; }
  s = acc;
  if (s.length > 520) { const cut = s.lastIndexOf('. ', 520); s = s.slice(0, cut > 200 ? cut + 1 : 520); }
  return s.trim();
}
const pretty = s => s.replace(/(^|[\s(\[+]),([^,"]{1,49}),/g, '$1*$2*');
const etyUrl = w => 'https://www.etymonline.com/word/' + encodeURIComponent(w);

function extract(dumpDir, etymwnPath) {
  const A = loadApp(), INV = inventory(A);
  const arr = JSON.parse(fs.readFileSync(path.join(dumpDir, 'ety.json'), 'utf8'));
  const keys = fs.readFileSync(path.join(dumpDir, 'word.txt'), 'utf8').split('\n');
  const IX = Object.create(null); keys.forEach((k, i) => { if (!(k in IX)) IX[k] = i; });
  let WN = null; if (etymwnPath) WN = JSON.parse(fs.readFileSync(etymwnPath, 'utf8')).eng || null;
  const ev = {};
  const words = Object.keys(A.WORD).concat(Object.keys(A.FULL)).filter(w => /^[a-z]+$/.test(w) && w.length >= 4 && w.length <= 16);
  let n = 0;
  for (const w of words) {
    if (!splits(w, INV).length) continue;
    const i = IX[w]; if (i == null) continue;
    const ex = excerptOf(arr[i]); if (!ex) continue;
    const e = { url: etyUrl(w), ex };
    /* one "see …" hop, for an entry that defers its etymology to a relative */
    /* the entries it points at: "(see X)" first, then any plain English word it is built from */
    const see = [...ex.matchAll(/\(see ,([a-z]+),/g)].map(m => m[1]);
    const terms = tokens(ex).filter(t => t.t === 'term' && /^[a-z]+$/.test(t.v)).map(t => t.v);
    const hops = [...new Set(see.concat(terms))].filter(h => h !== w && IX[h] != null && (A.WORD[h] || A.FULL[h]));
    if (hops.length) e.hops = hops.slice(0, 3).map(h => ({ w: h, url: etyUrl(h), ex: excerptOf(arr[IX[h]]) }));
    if (WN && WN[w]) e.wn = WN[w].map(o => { const k = Object.keys(o)[0]; return o[k] + ':' + k; });
    ev[w] = e; n++;
  }
  const out = {
    _: 'Evidence for Word Forge rows: short excerpts quoted for verification, each with the URL of its entry. Source: Douglas Harper, Online Etymology Dictionary (etymonline.com), read from the offline dump in the npm package etymolo@1.0.18. Cross-check: Etymological Wordnet (Gerard de Melo, 2014; CC BY-SA 3.0, from Wiktionary), via the ety@1.4.0 package. Built by tools/forge/build-table.cjs --extract.',
    words: ev
  };
  fs.mkdirSync(path.dirname(EVID), { recursive: true });
  fs.writeFileSync(EVID, JSON.stringify(out, null, 0).replace(/\},"/g, '},\n"'));
  console.log('extract: ' + n + ' words with a citable entry → ' + path.relative(APP, EVID));
}

/* ---------------------------------------------------------------- checking one split */
const LANG = { Latin: /\blatin\b/, Greek: /\bgreek\b/ };
let CONFIRM = Object.create(null);
const PRE_CANON = { im: 'in', il: 'in', ir: 'in', con: 'com', col: 'com', cor: 'com', co: 'com',
  ac: 'ad', af: 'ad', ag: 'ad', al: 'ad', an: 'ad', ap: 'ad', ar: 'ad', as: 'ad', at: 'ad', a: 'ad',
  ef: 'ex', e: 'ex', suc: 'sub', suf: 'sub', sug: 'sub', sup: 'sub', sus: 'sub', sur: 'sub', abs: 'ab', sym: 'syn', dif: 'dis', di: 'dis', tra: 'trans' };
function langBefore(tk, i) {
  const t = tk[i - 1]; if (!t || t.t !== 'text') return null;
  const m = t.v.match(/\b(Latin|Greek)\b[^,;]{0,12}$/); return m ? m[1] : null;
}
function glossAfter(tk, i) {
  for (let j = i + 1; j < tk.length && j <= i + 2; j++) {
    if (tk[j].t === 'gloss') return tk[j].v;
    if (tk[j].t === 'text' && /\S/.test(tk[j].v.replace(/[()]/g, '').replace(/\b(from|the|of|past participle|present participle|infinitive|stem|neuter|plural|genitive|form)\b/g, '').trim())) return null;
  }
  return null;
}
function checkRow(w, sp, e, INV, A) {
  const texts = [{ w, url: e.url, ex: e.ex }].concat(e.hops || []);
  const why = [];
  const used = new Set();
  const out = { parts: [], kinds: [], means: [], fams: [], roots: [], cites: [], etym: null, origin: null };
  const rootsHere = sp.filter(p => p.k === 'root');
  /* origin: the classical language of the (first) root */
  out.origin = rootsHere[0].root.lang;
  for (const p of sp) {
    if (p.k === 'root') {
      const r = p.root; let hit = null;
      for (const t of texts) {
        const nx = norm(t.ex);
        const langOk = LANG[r.lang].test(nx) || (r.alsoLang && LANG[r.alsoLang].test(nx));
        const tk = tokens(t.ex);
        for (let i = 0; i < tk.length && !hit; i++) {
          if (tk[i].t !== 'term' || /^\*/.test(tk[i].v)) continue;   /* a PIE root (*ten-) is not a part of the word */
          const term = norm(tk[i].v).replace(/[^a-z-]/g, '');
          if (term === w || !r.stems.some(st => term.includes(st))) continue;
          /* a word-forming element (photo-, -graph) is the dictionary's own entry for the root:
             its language is the one the root's chapter states, so the entry need not repeat it */
          const element = /^-|-$/.test(term) || r.forms.includes(term);
          if (!langOk && !element) continue;
          const g = glossAfter(tk, i); if (!g) continue;
          if (r.keys.some(k => norm(g).includes(k))) hit = { term: tk[i].v, gloss: g, t, element, lang: langBefore(tk, i) };
        }
        if (hit) break;
      }
      /* An entry that builds the word from a word-forming element ("see micro- + -scope") names
         the part without glossing it; the element's meaning is then taken from another cited
         entry that DOES gloss it (CONFIRM, collected over the whole evidence file). Only a
         hyphenated element qualifies — a bare Latin verb that merely shares letters (tendere in
         attention) never does. */
      if (!hit && CONFIRM[r.id]) {
        for (const t of texts) {
          const tk = tokens(t.ex);
          /* the element must BE the part (bio-, -logy, chrono- = chron + o), not merely start with it (mitra-) */
          const el = tk.find(x => { if (x.t !== 'term' || /^\*/.test(x.v) || !/^-|-$/.test(x.v)) return false;
            const b = norm(x.v).replace(/-/g, ''); return r.forms.includes(b) || r.forms.some(f => b === f + 'o'); });
          if (el) { hit = { term: CONFIRM[r.id].term, gloss: CONFIRM[r.id].gloss, t, via: CONFIRM[r.id], named: el.v }; break; }
        }
      }
      if (!hit) { why.push('root ' + r.id + ': the cited entry does not name a ' + r.lang + ' form with ' + r.stems.join('/') + ' glossed ' + r.keys.join('/')); continue; }
      if (hit.via) used.add(hit.via.url);
      used.add(hit.t.url);
      if (!out.etym && !hit.via && (hit.lang === r.lang || (r.alsoLang && hit.lang === r.alsoLang)) && !/^-|-$/.test(hit.term)) { out.etym = hit.term; out.origin = hit.lang; }
      const alts = r.mean.text.split(/\s*\/\s*/).map(x => x.toLowerCase());
      const said = alts.find(a => norm(hit.gloss).includes(norm(a).slice(0, Math.max(4, a.length - 1))));
      out.parts.push(p.s); out.kinds.push('root'); out.means.push(said || alts[0]); out.fams.push(null);
      if (out.roots.indexOf(r.id) < 0) out.roots.push(r.id);
      out.cites.push({ part: p.s, meaning: r.mean.cite, evidence: hit.t.url, said: hit.via ? 'named as *' + hit.named + '*; glossed in ' + hit.via.w + ': *' + hit.term + '* "' + hit.gloss + '"' : '*' + hit.term + '* "' + hit.gloss + '"' });
    } else if (p.k === 'pre') {
      const canon = PRE_CANON[p.s] || p.s; let hit = null;
      for (const t of texts) {
        const tk = tokens(t.ex);
        for (let i = 0; i < tk.length && !hit; i++) {
          if (tk[i].t !== 'term') continue;
          const term = norm(tk[i].v).replace(/[^a-z]/g, '');
          if (term === p.s || term === canon || (p.fam === 'pre' && term === 'prae')) hit = { term: tk[i].v, gloss: glossAfter(tk, i), t };
        }
        if (hit) break;
      }
      if (!hit) { why.push('prefix ' + p.s + '-: not named in the cited entry'); continue; }
      if (p.glossOnly && !hit.gloss) { why.push('prefix ' + p.s + '-: the entry names it without saying which in- it is'); continue; }
      used.add(hit.t.url);
      const m = hit.gloss ? short(hit.gloss.split(/,|;/)[0]) : short(p.mean.text);
      out.parts.push(p.s); out.kinds.push('pre'); out.means.push(m); out.fams.push(p.fam);
      out.cites.push({ part: p.s + '-', meaning: hit.gloss ? 'the cited entry' : p.mean.cite, evidence: hit.t.url, said: '*' + hit.term + '*' + (hit.gloss ? ' "' + hit.gloss + '"' : '') });
    } else {
      /* an agent / doctrine / -ness suffix is real only at the END of a word built on a word:
         contain+er, biology+ist — not the -er inside generous (generosus) or miter (mitra) */
      if (['or', 'ist', 'ism', 'ness'].includes(p.fam)) {
        const last = sp[sp.length - 1] === p;
        const all = texts.map(t => t.ex).join(' ');
        const named = new RegExp(',-' + p.s + ',|agent noun', 'i').test(all);
        const base = w.slice(0, w.length - p.s.length);
        const baseWord = !!(A.WORD[base] || A.FULL[base] || A.WORD[base + 'e'] || A.FULL[base + 'e']);
        if (!last || !(named || baseWord)) { why.push('suffix -' + p.s + ': not a ' + p.fam + ' suffix here (not final, or the base is not a word and the entry does not name it)'); continue; }
      }
      out.parts.push(p.s); out.kinds.push('suf'); out.means.push(short(p.mean.text)); out.fams.push(p.fam);
      out.cites.push({ part: '-' + p.s, meaning: p.mean.cite });
    }
  }
  /* the Etymological Wordnet must not contradict the root's language */
  if (e.wn && e.wn.length) {
    const langs = e.wn.map(x => x.split(':')[0]);
    const lat = langs.some(l => /^(lat|la|ita|fra|frm|fro|xno|spa|por|enm|eng|ang)$/.test(l)), grc = langs.some(l => /^(grc|gre|ell|lat|la|fra|frm|eng)$/.test(l));
    if (out.origin === 'Latin' && !lat && langs.includes('grc')) why.push('Etymological Wordnet gives Greek, not Latin');
    if (out.origin === 'Greek' && !grc) why.push('Etymological Wordnet gives ' + langs.join('/') + ', not Greek');
  }
  out.used = [...used];
  return why.length ? { why } : out;
}

/* ---------------------------------------------------------------- build */
function build() {
  const A = loadApp(), INV = inventory(A);
  if (!fs.existsSync(EVID)) throw new Error('no evidence file — run with --extract first');
  const EV = JSON.parse(fs.readFileSync(EVID, 'utf8')).words;
  /* one cited gloss per root, from the first entry (alphabetically) that names its etymon AND
     glosses it with the root's meaning — used only for words built from a word-forming element */
  CONFIRM = Object.create(null);
  for (const w of Object.keys(EV).sort()) {
    const e = EV[w];
    for (const r of INV.roots) { if (CONFIRM[r.id]) continue;
      const tk = tokens(e.ex), nx = norm(e.ex);
      if (!(LANG[r.lang].test(nx) || (r.alsoLang && LANG[r.alsoLang].test(nx)))) continue;
      for (let i = 0; i < tk.length; i++) { if (tk[i].t !== 'term' || /^\*/.test(tk[i].v)) continue;
        const term = norm(tk[i].v).replace(/[^a-z-]/g, ''); if (!r.stems.some(st => term.includes(st)) || term === w) continue;
        const g = glossAfter(tk, i); if (g && r.keys.some(k => norm(g).includes(k))) { CONFIRM[r.id] = { w, url: e.url, term: tk[i].v, gloss: g }; break; } } }
  }
  const byRoot = Object.create(null), dropped = [];
  const chapterWords = Object.create(null);
  SPEC.roots.forEach(r => (A.CH[r.ch].words || []).forEach(x => { chapterWords[x.w] = 1; }));
  for (const w of Object.keys(EV).sort()) {
    const rec = A.WORD[w] || A.FULL[w];
    const drop = why => dropped.push({ w, why });
    if (!rec) { drop('not in the library'); continue; }
    if (!rec.d) { drop('no definition in the library'); continue; }
    if (A.UNSAFE.test(w) || A.UNSAFE.test(rec.d) || A.HELD.has(w)) { drop('fails the app\'s safety list'); continue; }
    const sps = splits(w, INV);
    let best = null, whys = [];
    for (const sp of sps.sort((a, b) => a.length - b.length || b.filter(p => p.k === 'root').reduce((n, p) => n + p.s.length, 0) - a.filter(p => p.k === 'root').reduce((n, p) => n + p.s.length, 0))) {
      const r = checkRow(w, sp, EV[w], INV, A);
      if (r.why) { whys.push(sp.map(p => p.s).join('+') + ': ' + r.why.join('; ')); continue; }
      best = r; break;
    }
    if (!best) { drop(whys.slice(0, 3).join(' | ') || 'no split'); continue; }
    best.w = w; best.rec = rec; best.inChapter = !!chapterWords[w];
    const home = best.roots[0];
    (byRoot[home] = byRoot[home] || []).push(best);
  }
  /* ten per root: the chapter's own words first, then the core shard's easier words, then shorter */
  const rows = [];
  for (const r of SPEC.roots) {
    const tier = x => x.rec._full ? 2 : x.rec._i < 8000 ? 0 : 1;
    const list = (byRoot[r.id] || []).sort((a, b) => (b.inChapter - a.inChapter) || tier(a) - tier(b) || (a.rec.y || 0) - (b.rec.y || 0) || a.w.length - b.w.length || (a.w < b.w ? -1 : 1));
    list.slice(0, PER_ROOT).forEach(x => rows.push(finish(x, INV, A)));
    list.slice(PER_ROOT).forEach(x => dropped.push({ w: x.w, why: 'sourced, but past the ' + PER_ROOT + '-word slice for ' + r.id + ' (kept for the 2,000-word table)' }));
  }
  write(rows, dropped, INV, A);
}

/* confusables: the other forms of a part's family (or a root's other forms), and which rule the
   game may quote when a child picks one */
function finish(x, INV, A) {
  const conf = {}, rules = {}, confMeanings = {};
  x.parts.forEach((s, i) => {
    const k = x.kinds[i];
    let sib = [];
    if (k === 'root') { const r = INV.roots.find(r => r.id === (x.roots.length > 1 ? INV.roots.find(q => q.forms.includes(s)) || {} : {}).id) || INV.roots.find(r => r.forms.includes(s) && x.roots.includes(r.id)); sib = r ? r.forms.filter(f => f !== s) : []; if (sib.length) rules[i] = 'form'; }
    else {
      const fam = INV.affixes.filter(a => a.fam === x.fams[i]);
      sib = fam.map(a => a.s).filter(f => f !== s && f.length > 1);
      if (sib.length) {
        if (x.fams[i] === 'able') rules[i] = 'able';
        else if (x.fams[i] === 'or') rules[i] = 'or';
        else if (k === 'pre' && ['in', 'com', 'ad', 'sub', 'ex', 'syn', 'dis'].includes(x.fams[i])) rules[i] = 'assim';
        else rules[i] = 'ety';
      }
      fam.forEach(a => { if (a.s !== s) confMeanings[a.s] = short(a.mean.text); });
    }
    /* a family decoy is offered only when its reason is TRUE of this word */
    sib = sib.filter(f => {
      if (rules[i] === 'able') { const rp = x.parts[x.kinds.indexOf('root')]; const whole = !!A.WORD[rp]; return (s === 'ible') === !whole; }
      if (rules[i] === 'or') return s === 'or' && x.origin === 'Latin';
      if (rules[i] === 'ety') return x.etym && norm(x.etym).includes(s.replace(/^(.*?)(ous)$/, '$1')) && !norm(x.etym).includes(f);
      if (rules[i] === 'assim') return true;
      if (rules[i] === 'form') return true;
      return false;
    });
    if (sib.length) conf[i] = sib; else delete rules[i];
  });
  const j = CORE.join(x.parts, x.kinds);
  return {
    w: x.w, parts: x.parts, kinds: x.kinds, partMeanings: x.means, fams: x.fams, roots: x.roots,
    origin: x.origin, etym: x.etym, confusable: conf, confMeanings, rules,
    changes: j.changes, d: x.rec.d, y: x.rec.y || 0, voiced: A.VOICED.has(x.w) ? 1 : 0, lib: x.rec._full ? 'full' : 'served',
    src: { entry: etyUrl(x.w), used: x.used, parts: x.cites }
  };
}

function write(rows, dropped, INV, A) {
  const meta = {
    version: 1, signedOff: false, built: new Date().toISOString().slice(0, 10),
    note: 'The owner signs this table off (spec §5.1). While signedOff is false the Word Forge card stays hidden; testing mode shows it for review.',
    sources: {
      etymology: 'Douglas Harper, Online Etymology Dictionary — https://www.etymonline.com/ (each row links its own entry)',
      crossCheck: 'Etymological Wordnet, Gerard de Melo (2014), CC BY-SA 3.0, mined from Wiktionary — via the ety 1.4.0 package',
      meanings: 'concepts-data.js — the app\'s own Latin/Greek prefix, suffix and root chapters (each part cites its chapter and line)',
      words: 'the served word library (words-data.js / words-data-2.js) — every row is a word the speller can hear and practise'
    },
    roots: INV.roots.map(r => ({ id: r.id, forms: r.forms, lang: r.lang, mean: short(r.mean.text), meanFull: r.mean.text, cite: r.mean.cite })),
    rules: Object.fromEntries(Object.entries(INV.rules).map(([k, v]) => [k, v.cite]))
  };
  const body = 'window.SB_FORGE=' + JSON.stringify(Object.assign(meta, { rows: [] })).replace(/"rows":\[\]\}$/, '"rows":[\n' + rows.map(r => JSON.stringify(r)).join(',\n') + '\n]}') + ';\n';
  const head = '/* forge-data.js — Word Forge\'s morpheme table. GENERATED by tools/forge/build-table.cjs from cited\n   sources; never edit by hand. Each row\'s src names the etymology entry it was checked against\n   and the concepts-data chapter that states each part\'s meaning. The owner\'s sign-off is the\n   signedOff flag — the only line a person changes here. Review sheet: forge-review/index.html. */\n';
  fs.writeFileSync(path.join(APP, 'forge-data.js'), head + body);
  fs.writeFileSync(path.join(APP, 'forge-review', 'dropped.json'), JSON.stringify(dropped, null, 0).replace(/\},\{/g, '},\n{'));
  fs.writeFileSync(path.join(APP, 'forge-review', 'index.html'), review(rows, meta, dropped));
  const per = {}; rows.forEach(r => { per[r.roots[0]] = (per[r.roots[0]] || 0) + 1; });
  console.log('build: ' + rows.length + ' rows over ' + Object.keys(per).length + ' roots; dropped ' + dropped.length);
  console.log('  per root: ' + SPEC.roots.map(r => r.id + ' ' + (per[r.id] || 0)).join(' · '));
}

const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const em = s => esc(s).replace(/\*([^*]+)\*/g, '<i>$1</i>');
function review(rows, meta, dropped) {
  const EV = JSON.parse(fs.readFileSync(EVID, 'utf8')).words;
  const byRoot = {}; rows.forEach(r => { (byRoot[r.roots[0]] = byRoot[r.roots[0]] || []).push(r); });
  const sec = meta.roots.map(rt => {
    const list = byRoot[rt.id] || [];
    return `<section id="r-${rt.id}"><h2><span class="rt">${esc(rt.forms.join(' / '))}</span> <span class="mn">${esc(rt.meanFull)}</span> <span class="lg">${rt.lang}</span> <span class="ct">${list.length} words</span></h2>
<p class="cite">Meaning: ${esc(rt.cite)}</p>
<table><thead><tr><th>#</th><th>Word</th><th>Parts → meanings</th><th>Origin</th><th>Confusable</th><th>Source (what it says)</th><th>OK?</th></tr></thead><tbody>
${list.map((r, i) => { const ev = EV[r.w] || {};
  return `<tr><td>${i + 1}</td><td><b>${esc(r.w)}</b><div class="d">${esc(r.d)}</div></td>
<td>${r.parts.map((p, k) => `<span class="pt ${r.kinds[k]}">${esc(r.kinds[k] === 'pre' ? p + '-' : r.kinds[k] === 'suf' ? '-' + p : p)}</span> <span class="pm">${esc(r.partMeanings[k])}</span>`).join(' + ')}
${r.changes.length ? '<div class="chg">' + r.changes.map(c => esc(CORE.changeNote(c))).join('; ') + '</div>' : ''}
<div class="pc">${r.src.parts.map(c => esc(c.part) + ': ' + esc(c.meaning)).join('<br>')}</div></td>
<td>${esc(r.origin)}${r.etym ? ' <i>' + esc(r.etym) + '</i>' : ''}</td>
<td>${Object.keys(r.confusable).map(k => esc(r.parts[k]) + ' ≠ ' + esc(r.confusable[k].join(', ')) + ' <span class="ru">(' + esc(r.rules[k]) + ')</span>').join('<br>') || '—'}</td>
<td><a href="${esc(r.src.entry)}" target="_blank" rel="noopener">etymonline: ${esc(r.w)}</a>${(r.src.used || []).filter(u => u !== r.src.entry).map(u => ` · <a href="${esc(u)}" target="_blank" rel="noopener">${esc(decodeURIComponent(u.split('/').pop()))}</a>`).join('')}
<blockquote>${em(pretty(ev.ex || ''))}</blockquote>${(ev.hops || []).filter(h => (r.src.used || []).includes(h.url)).map(h => `<blockquote class="hop">${esc(h.w)}: ${em(pretty(h.ex))}</blockquote>`).join('')}
${ev.wn ? '<div class="wn">Etymological Wordnet: ' + esc(ev.wn.join(', ')) + '</div>' : ''}
<div class="said">${r.src.parts.filter(c => c.said).map(c => esc(c.part) + ' ← ' + em(c.said)).join('<br>')}</div></td>
<td class="ok">☐</td></tr>`; }).join('\n')}
</tbody></table></section>`; }).join('\n');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Word Forge table review</title><meta name="robots" content="noindex">
<style>
:root{--bg:#fbf7ef;--ink:#2a2116;--mut:#6d604f;--line:#e2d6c2;--acc:#a8650c;--pre:#2f6f9f;--root:#9a4d0b;--suf:#5b7d2a;color-scheme:light dark}
@media (prefers-color-scheme:dark){:root{--bg:#1d1913;--ink:#f1e8da;--mut:#b5a891;--line:#3c3428;--acc:#f0b429;--pre:#8cc3ec;--root:#f3a35b;--suf:#b4d67a}}
body{background:var(--bg);color:var(--ink);font:14px/1.5 system-ui,sans-serif;margin:0;padding:16px;max-width:1400px;margin:auto}
h1{font-size:22px;margin:0 0 6px}h2{font-size:17px;margin:28px 0 4px;display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}
.rt{color:var(--root);font-weight:900}.mn{font-weight:600}.lg,.ct{color:var(--mut);font-size:13px;font-weight:600}
.cite,.pc,.wn,.ru,.d{color:var(--mut);font-size:12px}.cite{margin:0 0 8px}
table{width:100%;border-collapse:collapse}th,td{border-top:1px solid var(--line);padding:7px 6px;vertical-align:top;text-align:left}
th{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--mut)}
.pt{font-weight:800}.pt.pre{color:var(--pre)}.pt.root{color:var(--root)}.pt.suf{color:var(--suf)}.pm{color:var(--mut)}
blockquote{margin:4px 0;padding:4px 8px;border-left:3px solid var(--line);font-size:12.5px}.hop{opacity:.85}
.chg{color:var(--acc);font-size:12px;font-weight:700}.said{font-size:12px;margin-top:3px}.ok{font-size:18px;text-align:center}
.box{border:1px solid var(--line);border-radius:10px;padding:12px 14px;margin:10px 0}a{color:var(--acc)}
@media (max-width:760px){table,thead,tbody,tr,td,th{display:block}thead{display:none}td{border:0;padding:3px 0}tr{border-top:1px solid var(--line);padding:8px 0}}
</style></head><body>
<h1>Word Forge — morpheme table for sign-off</h1>
<p>${rows.length} words over ${meta.roots.length} roots, built ${esc(meta.built)} by <code>tools/forge/build-table.cjs</code>. Status: <b>${meta.signedOff ? 'SIGNED OFF' : 'NOT SIGNED OFF — the game card is hidden'}</b>.</p>
<div class="box"><b>How to sign off.</b> Read each row against its source (the link opens the entry; the quote under it is the part of the entry the check matched). Tick the rows that are right. Strike any that are wrong and say why — the fix goes into the source pointer or the build, never a hand edit. When every row is ticked, set <code>signedOff:true</code> at the top of <code>forge-data.js</code> (the only line a person changes there) and commit it with your name.<br><br>
<b>Sources.</b> ${Object.values(meta.sources).map(esc).join('<br>')}<br><br>
<b>What each row had to pass.</b> The word splits into parts from the inventory and joins back exactly; the cited entry names the root's ${'Latin/Greek'} form with a gloss that matches the root's meaning; any prefix is named in the entry (and in-/im-/il-/ir- carry the entry's own gloss, "not" or "into"); the Etymological Wordnet does not contradict the origin; the word is in the library with a definition and passes the safety list. ${dropped.length} candidates failed and are listed in <code>dropped.json</code> with the reason.<br><br>
<b>Confusables</b> are the decoys Medium deals. Each carries the rule the game quotes when a child picks it: <i>able</i> = the -able/-ible rule (${esc(meta.rules.able)}); <i>assim</i> = prefix assimilation; <i>or</i> = -or after a Latin root; <i>form</i> = the root's other spelling; <i>ety</i> = the word's Latin or Greek form shows the letter.</div>
<p>${meta.roots.map(r => `<a href="#r-${r.id}">${esc(r.forms[0])}</a>`).join(' · ')}</p>
${sec}
</body></html>
`;
}

const argv = process.argv.slice(2);
if (argv[0] === '--extract') { const i = argv.indexOf('--etymwn'); extract(argv[1], i > 0 ? argv[i + 1] : null); }
else if (require.main === module) build();
module.exports = { tokens, excerptOf, splits, checkRow, inventory, loadApp, meaningOf };
