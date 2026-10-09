/* compose.cjs — turn the relation table into analogy items, A : B :: C : ?, one Bee level at a time.

   A CORE is one answer pair C → D in one relation. An ITEM is a core plus a stem pair A → B in the
   same relation and the wrong answers. A core is worth an item only if all of this holds:

   - every word is one the app would serve (data.cjs), is a base form (not "dogs", not "dug"), is
     not on a sacred, mythic or insulting theme, and is familiar for its level: seen at least
     FAM[level] times in Bee's own text;
   - the level is Bee's own word level (`y`, 1–9): the item's level is the highest of C, D and
     every option, and the stem is easier still (both words at level ≤ 4 and well known);
   - there are enough wrong answers, built by recipe rather than drawn at random:
       assoc     the words Bee's word map puts closest to C — what a child's ear pairs with C
       other     a word tied to C by a DIFFERENT relation (a synonym of C when the stem is an
                 antonym) — the right family, the wrong link
       sibling   another member of D's category, or another word C's relation reaches
       form      D's own word family in another part of speech ("frigidity" for "frigid")
   - the single-answer check passes: no wrong answer stands in the stem's relation to C, is a
     synonym of D, or is a form of C or D. This is checked against the whole table, both ways.

   Confusing = the strongest assoc trap is at least as close to C as the answer is. That is the
   item a child gets wrong by association, which is the skill the module trains.

   Option order is a pure function of the item id (`order`), so authoring cannot drift answers
   into one slot. Nothing here calls Math.random. */
'use strict';

const FAM = { 1: 25, 2: 25, 3: 25, 4: 12, 5: 12, 6: 12, 7: 8, 8: 8, 9: 8 };
const MAXLEN = 14;                    // a contest word, not a chemistry term
const STEM_FAM = 40;
const NO_TAGS = new Set(['religion', 'myth', 'theology', 'doctrine', 'insults', 'monsters', 'folklore', 'magic', 'brewing', 'distilling', 'viticulture']);
const NO_WORDS = new Set(('beer wine whiskey whisky brandy vodka rum gin ale stout lager liquor cocktail sake champagne ' +
  'mash malt booze tipsy drunk drunken hangover sexism molotov liqueur trump').split(' '));
const OLDER_TAGS = new Set(['war', 'weapons', 'disease', 'pharmacy', 'crime', 'toxicology', 'military']);
const SYMMETRIC = new Set(['synonym', 'antonym']);
/* a wrong answer must be a word worth choosing between: not a little function word, not a form of
   another headword, and never from a subject a children's game should not use as a decoy */
const FILLER = new Set(('has have had was were is are be been being do does did get got then than inside keep someone something ' +
  'anyone everyone thing things very also just only even still such some any each every many much more most other another ' +
  'into onto upon about above below over under after before again ever never always often yes no not').split(' '));
const NO_TRAP_TAGS = new Set(['politics', 'war', 'weapons', 'crime', 'disease', 'pharmacy', 'religion', 'myth', 'insults', 'toxicology', 'military']);

function fnv(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; }
function order(id, n) {                       // a permutation of 0..n-1 fixed by the id
  const a = [...Array(n).keys()];
  let h = fnv(id);
  for (let i = n - 1; i > 0; i--) { h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; const j = h % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function compose(D, R, EMB, opts) {
  opts = opts || {};
  const { W } = D, X = R.X;
  const ps = (w) => (W.get(w) || {}).ps;
  const lvl = (w) => (W.get(w) || {}).y || 9;
  const fq = (w) => EMB.freq.get(w) || 0;
  const tagsOf = (w) => (W.get(w) || {}).t || [];
  const ALLOW = opts.allow || new Set();       // hand-written seed words: trusted as written ("scared" is not "scar"+ed)
  const ROLE = opts.role || new Map();         // edge → the part of speech D plays in it (seed rows say so)
  /* every part of speech a word is recorded with: its own and its alternate senses' — Bee keeps one
     ps per headword, and for everyday words it is often the rarer one ("cold" is filed as a noun) */
  const POS = (w) => { const x = W.get(w); if (!x) return new Set(); const s = new Set([x.ps]); for (const a of x.alt || []) s.add(String(a.p || '').replace(/^plural\s+/, '')); return s; };
  const ok = (w) => W.has(w) && (ALLOW.has(w) || !X.infl(w)) && w.length <= MAXLEN && !NO_WORDS.has(w) && !tagsOf(w).some((t) => NO_TAGS.has(t))
    && !/like$/.test(w) && !(/^(?:non|un|in|dis)/.test(w) && fq(w) < 20);       // coinages: "melonlike", "nonresistor"
  const GL = new Map();
  const gl = (w) => { if (!GL.has(w)) GL.set(w, new Set(X.tokens(X.gloss((W.get(w) || {}).d || '')).map((t) => X.lemma(t) || t))); return GL.get(w); };
  const glossTie = (a, b) => gl(a).has(b) || gl(b).has(a);      // one word defines the other: too close to be wrong
  const familiar = (w, L) => fq(w) >= FAM[Math.max(1, Math.min(9, L))];
  const stemShare = (a, b, k) => a.slice(0, k) === b.slice(0, k);

  /* indexes over the whole table: by relation, by word, and any-link for the guard */
  const OUT = new Map(), LINK = new Map(), BYREL = new Map();
  const put = (m, k, v) => { if (!m.has(k)) m.set(k, new Set()); m.get(k).add(v); };
  for (const [a, b, rel] of R.E) {
    put(OUT, rel + '|' + a, b);
    if (SYMMETRIC.has(rel)) put(OUT, rel + '|' + b, a);
    put(LINK, a, b); put(LINK, b, a);
    if (!BYREL.has(rel)) BYREL.set(rel, []);
    BYREL.get(rel).push([a, b]);
    if (SYMMETRIC.has(rel)) BYREL.get(rel).push([b, a]);
  }
  const out = (rel, a) => OUT.get(rel + '|' + a) || new Set();
  const synOf = (w) => { const s = new Set(out('synonym', w)); for (const x of D.SYN.get(w) || []) s.add(x); return s; };
  const family = (w) => {
    const s = new Set();
    for (const rel of ['quality', 'action', 'relating', 'agent', 'able']) {
      for (const x of out(rel, w)) s.add(x);
    }
    for (const x of LINK.get(w) || []) if (stemShare(x, w, Math.min(5, w.length - 1))) s.add(x);
    return s;
  };
  const members = new Map();                 // category → its members (for kind siblings)
  for (const [a, b] of BYREL.get('kind') || []) put(members, b, a);

  /* stems: well-known pairs per relation, easiest first */
  const STEMS = new Map();
  for (const [rel, pairs] of BYREL) {
    const st = pairs.filter(([a, b]) => ok(a) && ok(b) && lvl(a) <= 3 && lvl(b) <= 3 && fq(a) >= STEM_FAM && fq(b) >= STEM_FAM
      && a.length >= 3 && b.length >= 3 && EMB.has(a) && EMB.has(b) && !stemShare(a, b, 4));
    st.sort((x, y) => (fq(y[0]) + fq(y[1])) - (fq(x[0]) + fq(x[1])) || (x[0] + x[1] < y[0] + y[1] ? -1 : 1));
    STEMS.set(rel, st.slice(0, 300));
  }
  const mid = (a, b) => {
    const M = EMB.M, n = EMB.DIM, ia = EMB.id.get(a), ib = EMB.id.get(b), v = new Float32Array(n);
    for (let d = 0; d < n; d++) v[d] = M[ia * n + d] + M[ib * n + d];
    let z = 0; for (let d = 0; d < n; d++) z += v[d] * v[d]; z = Math.sqrt(z) || 1;
    for (let d = 0; d < n; d++) v[d] /= z;
    return v;
  };
  const dot = (u, v) => { let s = 0; for (let d = 0; d < u.length; d++) s += u[d] * v[d]; return s; };

  const NEAR = new Map();
  const headword = (t) => W.has(t);              // one function, so the word map caches its pool once
  const nearOf = (c) => { if (!NEAR.has(c)) NEAR.set(c, EMB.near(c, 40, headword)); return NEAR.get(c); };

  const items = [], stats = new Map();
  const bump = (rel, L, k) => { const key = rel + '|' + L; if (!stats.has(key)) stats.set(key, {}); const s = stats.get(key); s[k] = (s[k] || 0) + 1; };
  const rels = opts.rels || [...BYREL.keys()];
  const done = new Set();
  for (const rel of rels) {
    const stemList = STEMS.get(rel) || [];
    for (const [c, d] of BYREL.get(rel) || []) {
      if (!ok(c) || !ok(d) || done.has(rel + c + '>' + d)) continue;
      done.add(rel + c + '>' + d);
      const L0 = Math.max(lvl(c), lvl(d));
      bump(rel, L0, 'pairs');
      const seeded = ROLE.has(rel + '|' + c + '|' + d);
      if (!seeded && (!familiar(c, L0) || !familiar(d, L0))) continue;
      bump(rel, L0, 'familiar');
      if (!EMB.has(c)) continue;
      // the single-answer guard: anything the relation reaches from C, D's synonyms, C's and D's families
      const bad = new Set([c, d, ...out(rel, c), ...synOf(d), ...family(c), ...family(d)]);
      for (const x of out(rel, d)) if (SYMMETRIC.has(rel)) bad.add(x);
      const wantPs = ROLE.get(rel + '|' + c + '|' + d) || ps(d);
      const fits = (t, L) => ok(t) && !bad.has(t) && !FILLER.has(t) && !tagsOf(t).some((g) => NO_TRAP_TAGS.has(g))
        && !(/(?:ing|ed|s)$/.test(t) && X.baseOf(t) && !ALLOW.has(t)) && (ROLE.size ? POS(t).has(wantPs) && ps(t) !== 'adverb' : ps(t) === wantPs) && lvl(t) <= Math.max(L, lvl(c)) && familiar(t, L)
        && !stemShare(t, c, 4) && !stemShare(t, d, 4) && t.length <= d.length * 2 + 2 && d.length <= t.length * 2 + 2
        && !glossTie(t, c) && !glossTie(t, d);
      const cd = EMB.has(d) ? EMB.cos(c, d) : 0;
      const traps = [];
      const take = (t, kind, s) => { if (!traps.find((x) => x.w === t)) traps.push({ w: t, kind, s: s == null ? (EMB.has(t) ? EMB.cos(c, t) : 0) : s }); };
      for (const [t, s] of nearOf(c)) { if (traps.filter((x) => x.kind === 'assoc').length >= 2) break; if (fits(t, L0)) take(t, 'assoc', s); }
      // other relation: a word tied to C, but not by this relation
      for (const [r2, list] of [['synonym', out('synonym', c)], ['antonym', out('antonym', c)], ['kind', out('kind', c)], ['part', out('part', c)], ['material', out('material', c)], ['function', out('function', c)], ['degree', out('degree', c)]]) {
        if (r2 === rel) continue;
        for (const t of list) if (fits(t, L0)) { take(t, 'other:' + r2); break; }
        if (traps.some((x) => x.kind.startsWith('other'))) break;
      }
      // sibling: another member of D's category (kind), or another target of the same relation
      if (rel === 'kind') { for (const t of members.get(c) || []) { if (fits(t, L0)) { take(t, 'sibling'); break; } } }
      else { const sib = [...(members.get((out('kind', d).values().next() || {}).value) || [])].sort(); for (const t of sib) if (fits(t, L0)) { take(t, 'sibling'); break; } }
      // form: D's family in another part of speech — wrong part of speech on purpose, so not via fits()
      for (const t of family(d)) { if (t !== d && t !== c && !family(c).has(t) && ok(t) && !POS(t).has(wantPs) && lvl(t) <= L0 + 1 && familiar(t, L0)) { traps.push({ w: t, kind: 'form', s: 0 }); break; } }
      // top up with further associates
      for (const [t, s] of nearOf(c)) { if (traps.length >= 4) break; if (fits(t, L0)) take(t, 'assoc', s); }
      if (traps.length < 3 && !(seeded && opts.keepSeeds)) continue;
      const opts4 = traps.slice(0, 4);
      const L = Math.max(L0, ...opts4.map((x) => lvl(x.w)));
      bump(rel, L, 'cores');
      const best = Math.max(...opts4.filter((x) => x.kind === 'assoc').map((x) => x.s), -1);
      const strong = EMB.has(d) && best >= cd;
      if (strong) bump(rel, L, 'confusing');
      // stem: same relation, shares no word, easier; near domain at low levels, far at high ones
      const cv = EMB.has(d) ? mid(c, d) : null;
      const cands = stemList.filter(([a, b]) => a !== c && a !== d && b !== c && b !== d && !opts4.some((x) => x.w === a || x.w === b) && lvl(a) <= L && lvl(b) <= L
        && ps(a) === ps(c) && ps(b) === ps(d));
      if (!cands.length && !opts.noStem) continue;   // the app takes its stems from lessons.json (noStem)
      bump(rel, L, 'stemmed');
      let pick = cands.length ? cands[fnv(c + '>' + d) % Math.min(cands.length, 12)] : null;
      if (cv && cands.length) {
        const scored = cands.slice(0, 120).map((p) => [p, dot(cv, mid(p[0], p[1]))]).sort((x, y) => y[1] - x[1]);
        const at = L <= 3 ? 0 : L <= 6 ? Math.floor(scored.length / 3) : scored.length - 1;
        pick = scored[Math.min(at, scored.length - 1)][0];
      }
      const id = rel + ':' + c + '>' + d;
      const choices = [d, ...opts4.map((x) => x.w)];
      const perm = order(id, choices.length);
      const shown = perm.map((i) => choices[i]);
      items.push({
        id, rel, L, stem: pick, c, d, options: shown, answer: shown.indexOf(d),
        traps: opts4.map((x) => [x.w, x.kind, +x.s.toFixed(3)]), cd: +cd.toFixed(3), strong,
        older: [c, d, ...choices].some((w) => tagsOf(w).some((t) => OLDER_TAGS.has(t))),
        cstems: cands.length,
      });
    }
  }
  return { items, stats, STEMS };
}

module.exports = { compose, order, fnv, FAM };

