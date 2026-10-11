/* formula.cjs — THE WORD-BAND FORMULA (the 4.5 brief, P1.1: "every word gets a band (8–9 / 10–11 / 12–13 /
   14–15) from frequency rank, sourced grade-list membership, length and morphology").

   score(record, ctx) is used by tools/wordband/build.cjs to write wordband-data.js and by tests/word-band.cjs to
   prove the shipped file is still what this formula says. Nothing here is typed per word: every input is a field
   the library already carries or a list the repo already holds with its source.

   THE INPUTS (nothing invented — no frequency list and no grade list is typed here):
     y        FREQUENCY: the library's own rarity band (1 = the commonest words … 9 = the rarest), on every
              record. It is the only frequency measure the repo holds; app3's spelling-bands note calls it "a
              frequency band", and the games' levels have always ramped on it.
     length   letters in the headword.
     morph    MORPHOLOGY: the word's own affixes, found against the served library — an inflection (-s, -es, -ed,
              -ing, -er/-est on an adjective) or a clear prefix (un-, dis-, non-, mis-, pre-, over-, under-, anti-,
              inter-, super-, sub-; in-/im-/il-/ir- on an adjective) is a light layer, a derivational suffix (-ly,
              -ness, -ment, -ful, -less, -able/-ible, -ity, -al/-ial, -ous, -ive, -ion, -er/-or, -ist, -ism,
              -ize/-ise, -ic, -ship, -hood, -dom) a full one. A layer counts only when what is left is a headword
              the library holds, and layers stack (racially = race → racial → racially).
     lists    SOURCED GRADE LISTS (grade-map/grade-map.json, each document fetched and cited there): the words of
              an Atlas stop that England's statutory spelling lists name (English Appendix 1, Years 3–4 and Years
              5–6) and the example words the Common Core names in a grade's standard (L.3.4b … L.8.4b). A word on
              one of them is AT MOST that list's band — sourced evidence beats an estimate. The age a school year
              means is the brief's own alignment (P1.9: US grade 3–8 / UK Year 4–9 for ages 8–15, so grade g is
              age g+5 and Year y is age y+4).
   NOT inputs, on purpose: the competition tiers (`nt` Primary/Junior/Senior/Advanced, the North South finals
   lists, the Scripps winning words) and spelling trickiness (trickAnal / spellDiff). They say how hard a word is
   to SPELL — the Scripps list holds knack and therapy — and the app's own rule is that spelling difficulty is what
   a game's level and its in-round climb choose INSIDE a band ("Difficulty = spelling trickiness, not rarity").
   The band says whether a child of that age meets the word at all.

   THE SCORE (in rarity-band units, so a plain common word scores its own y). The per-record half — y, length and
   the short-word term — lives in wordband.js (SB_BAND.local), because the page needs it too; this file adds the
   two terms that need the whole library:
     S = y
       + 0.25 × letters over 7 (at most +1.5)
       + short: three letters or fewer outside the commonest band (y ≥ 2) +1 — measured in the library, not
         assumed: the short rare words are clipped forms, titles, units and abbreviations (bel, bey, ems, pax,
         sol, var, wen …), which is what makes them rare
       + morph: 0.25 per inflection or prefix layer, 0.5 per derivational layer (at most +1.25)
     band = 1 if S < 2.5 · 2 if S < 4 · 3 if S < 5.5 · else 4
     then a word on a sourced grade list is at most that list's band (Years 3–4 → 1, Years 5–6 → 2, CCSS grade g
     → the band of age g+5).
   Because the affix term is bounded and a list only ever LOWERS a band, every record carries its own ceiling:
   band ≤ cut(local + 1.25) — SB_BAND.bounds(), which the page uses before wordband-data.js has landed (the word of
   the hour, which is on Home's first screen and may not wait for a lazy file). tests/word-band.cjs holds the
   ceiling to every word.
   A word the served library does not hold (the 130k dictionary tail, a Champ Dictation word) has NO entry and
   reads as band 4 — the careful default: a word with no evidence is never an Easy word. */
'use strict';
const fs = require('fs'), path = require('path');

const vm = require('vm');
/* the page's half of the formula — wordband.js run as the page runs it, so there is one copy of every constant */
function pageBand(app) {
  const win = { console, Object, Math, String, Set }; win.window = win; vm.createContext(win);
  vm.runInContext(fs.readFileSync(path.join(app || path.resolve(__dirname, '..', '..'), 'wordband.js'), 'utf8'), win, { filename: 'wordband.js' });
  return win.SB_BAND;
}
const PB = pageBand();
const BANDS = [null, { n: 1, ages: '8–9' }, { n: 2, ages: '10–11' }, { n: 3, ages: '12–13' }, { n: 4, ages: '14–15' }];
const { CUT, MORPH } = PB.K;
const W = { infl: MORPH.infl, pre: MORPH.pre, deriv: MORPH.deriv }, MORPH_CAP = MORPH.cap;
/* age → band (the four bands' own ages) */
const bandForAge = PB.AGE_BAND;

/* ---- morphology ---- */
const K = (s) => String(s || '').toLowerCase();
function cands(w, adj) {
  const out = [], add = (s, kind, rule) => { if (s && s.length >= 3 && s !== w) out.push([s, kind, rule]); };
  const L = w.length, dbl = (s) => (s.length >= 3 && s[s.length - 1] === s[s.length - 2] ? s.slice(0, -1) : null);
  /* inflections */
  if (/ies$/.test(w) && L > 4) add(w.slice(0, -3) + 'y', 'infl', '-ies');
  if (/(ss|x|z|ch|sh|o)es$/.test(w)) add(w.slice(0, -2), 'infl', '-es');
  if (/[^su]s$/.test(w) && !/(is|us|ss)$/.test(w)) add(w.slice(0, -1), 'infl', '-s');
  if (/ied$/.test(w) && L > 4) add(w.slice(0, -3) + 'y', 'infl', '-ied');
  if (/ed$/.test(w) && L > 4) { const b = w.slice(0, -2); add(b, 'infl', '-ed'); add(b + 'e', 'infl', '-ed'); add(dbl(b), 'infl', '-ed'); }
  if (/ing$/.test(w) && L > 5) { const b = w.slice(0, -3); add(b, 'infl', '-ing'); add(b + 'e', 'infl', '-ing'); add(dbl(b), 'infl', '-ing'); }
  if (/(er|est)$/.test(w) && L > 5) { const b = w.replace(/(er|est)$/, ''); [b, b + 'e', dbl(b), /i$/.test(b) ? b.slice(0, -1) + 'y' : null].forEach((s) => s && out.push([s, 'infl?', '-er/-est'])); }
  /* derivational suffixes */
  const D = [['ally', ['']], ['ily', ['y']], ['ly', ['', 'le']], ['iness', ['y']], ['ness', ['']], ['ment', ['']], ['fully', ['']], ['ful', ['']],
    ['less', ['']], ['ability', ['able']], ['ibility', ['ible']], ['able', ['', 'e']], ['ible', ['', 'e']], ['ity', ['', 'e']], ['ical', ['ic']],
    ['ial', ['', 'e']], ['al', ['', 'e']], ['ious', ['y', '', 'e']], ['ous', ['', 'e']], ['ive', ['', 'e']], ['ation', ['e', '']], ['ion', ['', 'e']],
    ['ier', ['y']], ['er', ['', 'e']], ['or', ['', 'e']], ['ist', ['', 'e']], ['ism', ['', 'e']], ['ize', ['', 'e']], ['ise', ['', 'e']], ['ic', ['', 'e']],
    ['ship', ['']], ['hood', ['']], ['dom', ['']]];
  for (const [suf, ends] of D) {
    if (!w.endsWith(suf) || L - suf.length < 3) continue;
    const b = w.slice(0, -suf.length);
    ends.forEach((e) => add(b + e, 'deriv', '-' + suf));
    if (/^(er|ing|ed)$/.test(suf) === false && /^(er|or|ist)$/.test(suf)) add(dbl(b), 'deriv', '-' + suf);
  }
  /* prefixes (the stem must be a real word of four letters or more) */
  for (const p of ['un', 'dis', 'non', 'mis', 'pre', 'over', 'under', 'anti', 'inter', 'super', 'sub']) if (w.startsWith(p) && L - p.length >= 4) add(w.slice(p.length), 'pre', p + '-');
  if (adj) for (const p of ['in', 'im', 'il', 'ir']) if (w.startsWith(p) && L - p.length >= 4) out.push([w.slice(p.length), 'pre-adj', p + '-']);
  return out;
}
/* the affix layers of w, outermost first: [{stem, kind, rule}] — each stem a headword the library holds */
function layers(w, idx, depth) {
  w = K(w); depth = depth || 0; if (depth >= 3) return [];
  const rec = idx.get(w), adj = !!(rec && /adjective/.test(String(rec.ps || '')));
  for (const [s, kind0, rule] of cands(w, adj)) {
    const r = idx.get(s); if (!r) continue;
    let kind = kind0;
    if (kind === 'infl?') { if (!/adjective/.test(String(r.ps || ''))) continue; kind = 'infl'; }
    if (kind === 'pre-adj') { if (!/adjective/.test(String(r.ps || ''))) continue; kind = 'pre'; }
    return [{ stem: s, kind, rule }].concat(layers(s, idx, depth + 1));
  }
  return [];
}

/* ---- the lists ---- */
/* grade-map.json → word → {band, why}: the sourced anchors (the lowest band any list gives a word) */
function gradeAnchors(app) {
  const g = JSON.parse(fs.readFileSync(path.join(app, 'grade-map', 'grade-map.json'), 'utf8'));
  const src = Object.fromEntries((g.sources || []).map((s) => [s.id, s]));
  const out = new Map();
  const put = (w, band, why, source) => { w = K(w); const o = out.get(w); if (!o || band < o.band) out.set(w, { band, why, source }); };
  (g.regions || []).forEach((r) => (r.stops || []).forEach((st) => {
    const ev = st.word_evidence || {};
    (ev.uk_y3_4_statutory_list || []).forEach((w) => put(w, bandForAge(4 + 4), 'England statutory spelling list, Years 3–4', 'uk-app1'));
    (ev.uk_y5_6_statutory_list || []).forEach((w) => put(w, bandForAge(6 + 4), 'England statutory spelling list, Years 5–6', 'uk-app1'));
    (ev.ccss_example_words || []).forEach((x) => { const m = String(x).match(/^([a-z]+):L\.(\d)\./i); if (m) put(m[1], bandForAge(+m[2] + 5), 'Common Core L.' + m[2] + ' example word', 'ccss-l' + m[2]); });
  }));
  out.forEach((v) => { if (!src[v.source]) throw new Error('wordband: grade-map source ' + v.source + ' is not in grade-map.json sources'); });
  return out;
}

/* grade-map.json → act id → the band of the region's FIRST mapped US grade (age g+5), or 0 when the map says
   "not mapped". A child who has reached a region is at least that band (wordband.js child()). */
function atlasFloors(app) {
  const g = JSON.parse(fs.readFileSync(path.join(app, 'grade-map', 'grade-map.json'), 'utf8'));
  const out = {};
  (g.regions || []).forEach((r) => { const m = String((r.us && r.us.grade) || '').match(/^Grades? (\d)/); out[r.act] = m ? bandForAge(+m[1] + 5) : 0; });
  return out;
}

/* ---- the score ---- */
function score(r, ctx) {
  const w = K(r.w), loc = PB.local(r), lay = layers(w, ctx.idx);
  const morph = Math.min(MORPH_CAP, lay.reduce((s, l) => s + W[l.kind], 0));
  const anchor = ctx.anchors.get(w) || null;
  const S = loc.S + morph;
  let band = PB.cut(S), rule = 'score';
  if (anchor && anchor.band < band) { band = anchor.band; rule = 'grade list'; }
  return { w, band, S: Math.round(S * 100) / 100, terms: { y: loc.y, len: loc.len, short: loc.short, morph }, layers: lay, anchor, rule };
}
function context(app, records) {
  const idx = new Map(); for (const r of records) { if (r && r.w) { const k = K(r.w); if (!idx.has(k)) idx.set(k, r); } }
  return { idx, anchors: gradeAnchors(app) };
}
module.exports = { BANDS, CUT, W, MORPH_CAP, PB, pageBand, bandForAge, layers, gradeAnchors, atlasFloors, score, context };
