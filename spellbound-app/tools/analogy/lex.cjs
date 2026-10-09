/* lex.cjs — the small amount of English the engine needs, all of it read off Bee's own library.

   lemma(tok)   the headword a token is a form of (practices → practice, leaving → leave), or null.
                Only forms the library can vouch for: the base must be a headword, and for an
                inflection the two must share a part of speech.
   infl(w)      the base when w is an inflection of another headword (robins → robin, dug → —),
                so items can prefer the form a child meets first.
   head(toks)   the head noun of the phrase that opens toks ("small Old World songbird with a red
                breast" → songbird): modifiers are skipped by their part of speech in the library,
                and the phrase ends at the first preposition, relative word or punctuation.
   gloss(d)     a definition's first sense, lower-cased, with a leading "(golf)" label and a
                "X refers to" / "means" opener removed. */
'use strict';

const STOP = new Set(('a an the some any its their his her one\'s someone\'s something\'s your our this that these those ' +
  'each every all both either no other another such certain various several many much more most few little less ' +
  'very usually often especially typically generally').split(/\s+/));
const BOUND = new Set(('of with that which who whom whose where when while in on at for from by to into onto upon ' +
  'used having being as or and but than like especially usually typically containing consisting made formed found ' +
  'living growing native known called associated related resembling between within without after before during ' +
  'under over through along across against about around near beside behind beyond , ; : ( ) .').split(/\s+/));

function makeLex(W) {
  const ps = (w) => (W.get(w) || {}).ps || '';
  const L = new Map();
  function cand(t) {
    const out = [t];
    const add = (x) => { if (x && x.length > 1) out.push(x); };
    if (/ies$/.test(t)) add(t.slice(0, -3) + 'y');
    if (/ied$/.test(t)) add(t.slice(0, -3) + 'y');
    if (/(ches|shes|sses|xes|zes|oes)$/.test(t)) add(t.slice(0, -2));
    if (/s$/.test(t) && !/ss$/.test(t)) add(t.slice(0, -1));
    if (/ves$/.test(t)) { add(t.slice(0, -3) + 'f'); add(t.slice(0, -3) + 'fe'); }
    if (/men$/.test(t)) add(t.slice(0, -3) + 'man');
    if (/ing$/.test(t)) { const b = t.slice(0, -3); add(b); add(b + 'e'); if (/(.)\1$/.test(b)) add(b.slice(0, -1)); }
    if (/ed$/.test(t)) { const b = t.slice(0, -2); add(b); add(t.slice(0, -1)); if (/(.)\1$/.test(b)) add(b.slice(0, -1)); }
    if (/er$/.test(t)) { const b = t.slice(0, -2); add(b); add(t.slice(0, -1)); if (/(.)\1$/.test(b)) add(b.slice(0, -1)); }
    if (/ier$/.test(t)) add(t.slice(0, -3) + 'y');
    if (/iest$/.test(t)) add(t.slice(0, -4) + 'y');
    if (/est$/.test(t)) { const b = t.slice(0, -3); add(b); add(t.slice(0, -2)); if (/(.)\1$/.test(b)) add(b.slice(0, -1)); }
    return out;
  }
  /* inflection: same part of speech (plural noun, past/participle verb, comparative adjective),
     or an -ed/-ing whose base is a verb */
  function infl(w) {
    if (L.has(w)) return L.get(w);
    let base = null;
    const p = ps(w);
    for (const c of cand(w).slice(1)) {
      if (!W.has(c) || c === w) continue;
      const pc = ps(c);
      if (/s$/.test(w) && p === pc && (p === 'noun' || p === 'verb')) { base = c; break; }
      if (/(ed|ing)$/.test(w) && pc === 'verb' && (p === 'verb' || p === 'adjective')) { base = c; break; }
      if (/(ed|ing)$/.test(w) && p === 'verb' && c.length >= 3) { base = c; break; }
      if (/(er|est)$/.test(w) && p === 'adjective' && pc === 'adjective') { base = c; break; }
      if (/men$/.test(w) && c === w.slice(0, -3) + 'man' && p === pc) { base = c; break; }
    }
    if (!base) base = pastForm(w);
    L.set(w, base);
    return base;
  }
  /* a verb record whose own gloss opens with a past-tense verb ("dug: made a hole…") is a past
     form; the library rarely holds the link, so it is marked as an inflection of nothing better
     than itself — enough to keep it out of an item */
  const PAST = new Set(('made took gave went ran came saw did had said got put left felt kept held brought thought told found ' +
    'became began broke chose drew drove ate fell flew forgot froze grew hid knew lay led lost met paid rode rang rose sang ' +
    'sank sat shook shot slept spoke spent stood stole struck stung swam swore taught tore threw understood woke wore won ' +
    'wrote caught bought fought sought dug hung spun swung clung flung slung stuck dealt meant sent built lent bent burnt ' +
    'spilt spoilt dreamt learnt knelt crept swept wept').split(/\s+/));
  function pastForm(w) {
    const x = W.get(w);
    if (!x || x.ps !== 'verb') return null;
    const g = String(x.d || '').toLowerCase().replace(/^\s*\([^)]*\)\s*/, '').trim();
    const m = g.match(/^(?:simple )?(?:past|plural|present participle|past participle)(?: tense)?(?: form)? of ([a-z]+)/);
    if (m && W.has(m[1])) return m[1];
    const f = g.split(/[^a-z]+/)[0];
    if (PAST.has(f) || (/ed$/.test(f) && f.length > 4)) return w;   // a past form; its base is unknown
    return null;
  }
  /* lemma of a token found inside a definition: the headword itself if it is one (and not merely
     an inflection), else the first candidate base the library holds */
  function lemma(t) {
    if (!t) return null;
    if (W.has(t)) return infl(t) || t;
    for (const c of cand(t).slice(1)) if (W.has(c)) return infl(c) || c;
    return null;
  }
  function tokens(s) {
    return String(s).toLowerCase().replace(/[^a-z' ,;:().-]/g, ' ').replace(/([,;:().])/g, ' $1 ').split(/\s+/).filter(Boolean);
  }
  function gloss(d) {
    let g = String(d || '').split(/;/)[0].toLowerCase().trim();
    g = g.replace(/^\s*\([^)]*\)\s*/, '');
    g = g.replace(/^[a-z-]+ (?:refers to|means|is|are)\s+/, '').replace(/^means\s+/, '').replace(/^to be\s+/, '');
    return g.replace(/\s+/g, ' ').trim();
  }
  /* head noun of the leading noun phrase; returns {head, i} (i = index after the phrase) */
  function head(toks, from) {
    let i = from || 0, last = null;
    while (i < toks.length && STOP.has(toks[i])) i++;
    for (; i < toks.length; i++) {
      const t = toks[i];
      if (BOUND.has(t) || /^[,;:().]$/.test(t)) break;
      if (STOP.has(t)) continue;
      if (last && (PAST.has(t) || /ed$/.test(t))) break;      // "the pleasure FELT when…": a participle ends the phrase
      const l = lemma(t);
      if (!l) continue;
      const p = ps(l), pt = ps(t);
      if (p === 'noun' || pt === 'noun') last = (pt === 'noun' && W.has(t) ? (infl(t) || t) : l);
      else if (p === 'adjective' || p === 'adverb' || pt === 'adjective') continue;
      else if (last) break;
    }
    return last ? { head: last, i } : null;
  }
  /* first verb at the front of toks (after "to"), as a base form */
  function verb(toks, from) {
    let i = from || 0;
    while (i < toks.length && (toks[i] === 'to' || STOP.has(toks[i]))) i++;
    const t = toks[i];
    if (!t) return null;
    for (const c of cand(t)) if (W.has(c) && ps(c) === 'verb') return infl(c) || c;
    return null;
  }
  return { lemma, infl, tokens, gloss, head, verb, ps };
}

module.exports = { makeLex, STOP, BOUND };
