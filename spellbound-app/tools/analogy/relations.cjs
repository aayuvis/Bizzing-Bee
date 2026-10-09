/* relations.cjs — the relation table, read out of Bee's own definitions and synonyms.

   Every edge is (a, b, rel, why): "a REL b", and `why` names the rule and the evidence, so a
   reviewer can see where a row came from and a wrong row is fixed at its rule, never by hand.

   The relations and the evidence each one needs:
     synonym     Bee's definition-aware synonym file; same part of speech; not a form of each other
     antonym     un-/in-/im-/il-/ir-/dis-/non- + a headword whose OWN definition says "not <base>"
                 or "opposite of <base>"; -less/-ful twins; a definition that is just "not X"
     degree      "extremely/very/intensely X" (X → word: hot → scorching); "slightly X" (word → X)
     kind        the genus of a noun's definition ("small Old World songbird …" → songbird),
                 climbed until it reaches a CATEGORY — a genus at least CAT_MIN nouns share
     part        "part/section of (a) X"; member "one of a group of X"; group "a flock of X"
     material    "made of/from X"
     function    "used to/for X" (a tool and what it does: saw → cut)
     agent       teach → teacher, art → artist: a -er/-or/-ist/-ian/-ant word whose definition
                 starts "a person/one who" and names the base
     young       "young of a X" / "a young X"   (horse → foal)
     female      "female X"                     (horse → mare)
     sound       "the sound/cry made by a X"    (dog → bark)
     cause       "to cause/make (something) X"  (soothe → calm)
     quality     adjective → noun: "the quality/state of being X", or X+ness/-ity/-ence whose
                 definition names X                                  (brave → bravery)
     action      verb → noun: "the act/process of X-ing", or X+tion/-ment/-al/-ance whose
                 definition names X                                  (decide → decision)
     relating    noun → adjective: "relating to / full of / having X" (danger → dangerous)
     able        verb → adjective: "able to be X-ed" / X+able        (read → readable)

   Nothing here comes from an outside lexicon. */
'use strict';
const { makeLex } = require('./lex.cjs');

const CAT_MIN = 12;   // a genus shared by this many nouns is a category a child can name
const GENERIC = new Set(('person thing act state quality kind type form part piece member one someone something condition ' +
  'process place way group number amount period unit area object substance matter instance feeling time event ' +
  'action activity practice system set series state situation fact idea term word name use result means method ' +
  'manner degree measure portion section structure body item region point line case variety sort example class ' +
  'collection range field form other people individual genus genu family order compound branch property absence lack ' +
  'study technique position quantity trait ability style doctrine belief mass covering layer element isotope molecule ' +
  'salt cell republic capital inflammation work movement small large animal equivalent domestic thing creature member ' +
  'adult young female male stuff source product article mixture combination arrangement status level rate state ' +
  'tissue organ structure surface opening edge end side top bottom front back center middle').split(/\s+/));
/* The one editorial table in the engine: the categories a child can name. Everything else is read
   out of the definitions; this list decides only which genus words are worth asking about. No
   sacred category (god, goddess, saint, spirit…) is on it, and none may be added. */
const KID_CATS = new Set(('animal bird mammal insect fish reptile amphibian dog cat horse snake spider shellfish ' +
  'plant tree shrub flower herb grass vegetable fruit nut grain cereal mushroom vine weed ' +
  'tool instrument device machine vehicle boat ship aircraft container vessel bag box furniture utensil weapon ' +
  'garment coat hat shoe fabric cloth jewel gem stone rock mineral metal wood ' +
  'food dish bread cake cheese sauce soup drink beverage sweet dessert spice ' +
  'building house room shelter road ' +
  'game sport dance song music ball toy ' +
  'shape color colour coin ' +
  'book story poem ' +
  'storm wind cloud ' +
  'worker scientist musician writer artist athlete doctor officer soldier sailor ruler ' +
  'feeling emotion illness disease medicine liquid gas').split(/\s+/));
const BOUND_KIND = new Set('of with that which who whom whose where when while in on at for from by into used having , ; : ( ) . especially usually'.split(' '));
const DULL_VERB = new Set('give make create denote produce provide help do get put take have use show form cause indicate refer describe express mean represent designate identify signify mark be become allow enable perform'.split(' '));
const ANIMAL = new Set('animal bird mammal insect fish reptile amphibian creature beast livestock cattle fowl dog cat horse ' +
  'deer bear rodent primate ape monkey snake lizard frog whale shark songbird finch parrot owl duck goose hen chicken pig sheep goat'.split(' '));

function build(D) {
  const { W, SYN } = D;
  const X = makeLex(W);
  const E = [];                      // [a, b, rel, why]
  const seen = new Set();
  const isForm = (a, b) => X.infl(a) === b || X.infl(b) === a || (X.infl(a) && X.infl(a) === X.infl(b));
  const stemShare = (a, b, k) => a.slice(0, k || 4) === b.slice(0, k || 4);
  function add(a, b, rel, why) {
    if (!a || !b || a === b || !W.has(a) || !W.has(b)) return;
    if (isForm(a, b)) return;
    const k = a + '|' + b + '|' + rel;
    if (seen.has(k)) return;
    seen.add(k);
    E.push([a, b, rel, why]);
  }
  const base = (w) => X.infl(w) || w;
  const put = (m, k, v) => { if (!m.has(k)) m.set(k, new Set()); m.get(k).add(v); };     // relations live on the base form
  const ps = (w) => (W.get(w) || {}).ps;
  const G = new Map();                    // word → its gloss tokens
  for (const [w, x] of W) G.set(w, X.tokens(X.gloss(x.d)));
  const mentions = (w, b) => {
    const t = G.get(w) || [];
    for (const k of t) if (k === b || X.lemma(k) === b) return true;
    return false;
  };

  /* ---- synonym ---- */
  for (const [a, set] of SYN) {
    if (X.infl(a)) continue;
    for (const b of set) {
      if (X.infl(b) || ps(a) !== ps(b) || !ps(a) || stemShare(a, b, 5)) continue;
      add(a, b, 'synonym', 'syn-file');
    }
  }

  /* ---- antonym: negation prefixes, confirmed by the word's own definition ---- */
  const NEG = [['un', ''], ['in', ''], ['im', ''], ['il', ''], ['ir', ''], ['dis', ''], ['non', ''], ['non-', '']];
  for (const [w, x] of W) {
    if (X.infl(w)) continue;
    for (const [p] of NEG) {
      if (!w.startsWith(p) || w.length - p.length < 3) continue;
      const b = w.slice(p.length);
      if (!W.has(b) || X.infl(b) || ps(b) !== x.ps || x.ps === 'adverb') continue;
      const g = X.gloss(x.d);
      if (mentions(w, b))       // the gloss must name the base: "discord: lack of agreement" is not dis-+cord
        add(b, w, 'antonym', 'prefix ' + p + '- and the gloss says so');
    }
    // -less / -ful twins: careless / careful
    if (/less$/.test(w)) {
      const ful = w.replace(/less$/, 'ful');
      if (W.has(ful) && ps(ful) === x.ps) add(ful, w, 'antonym', '-ful/-less twins');
    }
    // a gloss that is just "not X" / "the opposite of X"
    const m = X.gloss(x.d).match(/^(?:not|the opposite of|opposite of)\s+(?:being\s+)?([a-z]+)\s*(?:$|[,;(.]| or )/);
    if (m) { const b = X.lemma(m[1]); if (b && ps(b) === x.ps && !stemShare(b, w, 3)) add(b, w, 'antonym', 'gloss "not ' + m[1] + '"'); }
  }

  /* ---- antonym, the everyday kind: the synonyms of a word's negation. "unhappy" is confirmed
     as the opposite of "happy" above, and Bee's synonym file says "unhappy" is "sad" — so happy
     and sad are opposites. This is where hot/cold-style pairs come from: the morphological ones
     sit at levels 8–9, because Bee levels a word by its spelling and un-words spell late. ---- */
  for (const [a, b, rel, why] of E.slice()) {
    if (rel !== 'antonym' || !/^prefix|^gloss/.test(why)) continue;
    for (const s of SYN.get(b) || []) {
      if (s === a || X.infl(s) || ps(s) !== ps(a) || stemShare(s, a, 4) || stemShare(s, b, 4)) continue;
      add(a, s, 'antonym', 'synonym of ' + b + ', the opposite of ' + a);
    }
  }

  /* ---- antonym by contrast: two definitions that are the same but for one pair of opposites.
     "hot: having a high temperature" / "cold: having a low temperature" → hot ↔ cold. The
     opposites that license it are the ones already in the table, so the rule bootstraps. ---- */
  for (let round = 0; round < 2; round++) {
    const OPP = new Map();
    for (const [a, b, rel] of E) if (rel === 'antonym') { put(OPP, a, b); put(OPP, b, a); }
    const SK = new Map();
    for (const [w, x] of W) {
      if (X.infl(w) || !/^(?:adjective|verb|noun)$/.test(x.ps)) continue;
      const t = (G.get(w) || []).filter((k) => !/^[,;:().]$/.test(k));
      if (t.length < 2 || t.length > 9) continue;
      t.forEach((k, i) => {
        if (!OPP.has(k)) return;
        const key = x.ps + '|' + t.map((q, j) => (j === i ? '*' : q)).join(' ');
        if (!SK.has(key)) SK.set(key, []);
        SK.get(key).push([w, k]);
      });
    }
    for (const list of SK.values()) {
      if (list.length < 2 || list.length > 6) continue;
      for (const [w1, k1] of list) for (const [w2, k2] of list) {
        if (w1 < w2 && (OPP.get(k1) || new Set()).has(k2) && !stemShare(w1, w2, 4)) add(w1, w2, 'antonym', 'glosses differ only by ' + k1 + '/' + k2);
      }
    }
  }

  /* ---- degree ---- */
  for (const [w, x] of W) {
    if (X.infl(w) || x.ps !== 'adjective') continue;
    const g = X.gloss(x.d);
    let m = g.match(/^(?:extremely|very|intensely|exceedingly|excessively|overly|unbearably|terribly|utterly|completely|totally) ([a-z]+)\b/);
    if (m) { const b = X.lemma(m[1]); if (b && ps(b) === 'adjective' && !stemShare(b, w, 4)) add(b, w, 'degree', 'gloss "' + g.split(' ').slice(0, 2).join(' ') + '"'); }
    m = g.match(/^(?:slightly|somewhat|mildly|a little|faintly|moderately) ([a-z]+)\b/);
    if (m) { const b = X.lemma(m[1]); if (b && ps(b) === 'adjective' && !stemShare(b, w, 4)) add(w, b, 'degree', 'gloss "' + g.split(' ').slice(0, 2).join(' ') + '"'); }
  }

  /* ---- genus (for kind) and the patterned relations ---- */
  const GENUS = new Map();           // word → head of its definition's opening phrase (unfiltered)
  const CATOF = new Map();           // word → the child-level category its opening phrase names
  const after = (toks, i) => X.head(toks, i);
  for (const [w, x] of W) {
    if (X.infl(w)) continue;
    const g = X.gloss(x.d), t = X.tokens(g);
    if (x.ps === 'noun') {
      // "a type/kind/variety/species of X" → X; otherwise the head of the opening phrase
      const m = g.match(/^(?:a |an |any )?(?:type|kind|variety|species|breed|sort|member) of (?:a |an |the )?/);
      const tt = m ? X.tokens(g.slice(m[0].length)) : t;
      const h = after(tt, 0);
      if (h && h.head !== w && ps(h.head) === 'noun' && !stemShare(h.head, w, 4)) GENUS.set(w, h.head);
      // the last category word before the phrase ends ("round yellow to orange FRUIT of …")
      for (const k of tt) {
        if (BOUND_KIND.has(k)) break;
        const l = X.lemma(k);
        if (l && KID_CATS.has(l) && l !== w && !stemShare(l, w, 4)) CATOF.set(w, l);
      }
    }
    const pat = (re, rel, dir, kindOf) => {
      const m = g.match(re);
      if (!m) return;
      const rest = X.tokens(g.slice(m.index + m[0].length));
      const b = kindOf === 'verb' ? X.verb(rest, 0) : (after(rest, 0) || {}).head;
      if (!b || b === w || stemShare(b, w, 4) || GENERIC.has(b)) return;
      if (dir > 0) add(w, b, rel, 'gloss "' + m[0].trim() + ' ' + b + '"');
      else add(b, w, rel, 'gloss "' + m[0].trim() + ' ' + b + '"');
    };
    if (x.ps === 'noun') {
      pat(/^(?:the |a |an )?(?:\w+ )?(?:part|section|segment|division) of (?:a |an |the )?/, 'part', +1);
      pat(/^(?:a |an )?(?:large |small )?(?:flock|herd|pack|swarm|school|pod|colony|troop|litter|brood|hive|crowd) of /, 'group', -1);
      pat(/\bmade (?:of|from) /, 'material', +1);
      pat(/^(?:a |an |the )?(?:young|baby|infant|newborn) (?:of (?:a |an |the )?)?/, 'young', -1);
      pat(/^(?:a |an |the )?(?:adult )?female /, 'female', -1);
      pat(/^(?:the |a |an )?(?:sound|cry|call|noise) (?:made by|of) (?:a |an |the )?/, 'sound', -1);
      if (/^.{0,45}\bused (?:to|for) /.test(g)) {
        const m = g.match(/\bused (?:to|for) /);
        const b = X.verb(X.tokens(g.slice(m.index + m[0].length)), 0);
        if (b && !DULL_VERB.has(b) && !stemShare(b, w, 4)) add(w, b, 'function', 'gloss "used to ' + b + '"');
      }
      // noun degree: "an overwhelming feeling of fear" → fear → terror
      const dm = g.match(/^(?:an? )?(?:extreme|intense|overwhelming|violent|profound) (?:feeling of |state of |sense of )?([a-z]+)\b/);
      if (dm) { const b = X.lemma(dm[1]); if (b && ps(b) === 'noun' && !GENERIC.has(b) && !stemShare(b, w, 4)) add(b, w, 'degree', 'gloss "' + dm[0] + '"'); }
      pat(/\b(?:lives|living|found|grows|growing|nests|nesting) (?:in|on|among) (?:a |an |the )?/, 'habitat', +1);
    }
    if (x.ps === 'verb') {
      const m = g.match(/^(?:to )?(?:cause|make) (?:someone |something |somebody |a person |it |them )?(?:to )?(?:be |feel |become )?([a-z]+)\b/);
      if (m) { const b = X.lemma(m[1]); if (b && ps(b) === 'adjective' && !/^(?:less|more|possible|new|different|better|worse|able|available)$/.test(b) && !stemShare(b, w, 4)) add(w, b, 'cause', 'gloss "' + m[0] + '"'); }
    }
  }

  const isAnimal = (w) => { let h = w; for (let i = 0; i < 5 && h; i++) { if (ANIMAL.has(h)) return true; h = GENUS.get(h); } return false; };

  /* ---- kind: the category the definition names, else the first category up its genus chain ---- */
  const fanIn = new Map();
  for (const h of GENUS.values()) fanIn.set(h, (fanIn.get(h) || 0) + 1);
  const isCat = (h) => KID_CATS.has(h);
  for (const [w] of GENUS) {
    // one hop only: the definition names the category, or names a word whose definition does
    // ("sparrow: small songbird…" → songbird: "…bird"). Longer chains drift: measured, they put
    // a gas under shape and a ruler under book.
    if (CATOF.has(w)) { add(w, CATOF.get(w), 'kind', 'gloss names ' + CATOF.get(w)); continue; }
    const h = GENUS.get(w), c = h && CATOF.get(h);
    if (c && c !== w && !stemShare(c, w, 4)) add(w, c, 'kind', 'genus ' + h + ' > ' + c);
  }

  for (let i = E.length - 1; i >= 0; i--) {
    const [a, b, rel] = E[i];
    const who = rel === 'habitat' ? a : (rel === 'young' || rel === 'female' || rel === 'sound' || rel === 'group') ? a : null;
    if (who && !isAnimal(who)) { seen.delete(a + '|' + b + '|' + rel); E.splice(i, 1); }
  }

  /* ---- word families: agent, quality, action, relating, able ---- */
  const SUF = [
    ['agent', 'verb|noun', /(?:er|or|ist|ian|ant|ent)$/, ['er', 'or', 'ist', 'ian', 'ant', 'ent', 'r'], /^(?:a |an )?(?:person|someone|somebody|one|worker|expert|specialist|practitioner|player)\b/],
    ['quality', 'adjective', /(?:ness|ity|ty|ence|ance|ency|ancy|cy|dom|th|ism|hood)$/, ['ness', 'ity', 'ty', 'ence', 'ance', 'ency', 'ancy', 'cy', 'dom', 'th', 'ism', 'hood'], null],
    ['action', 'verb', /(?:tion|sion|ment|al|ance|ence|ure|age|ery)$/, ['ation', 'ition', 'tion', 'sion', 'ment', 'al', 'ance', 'ence', 'ure', 'age', 'ery'], null],
    ['relating', 'noun', /(?:al|ic|ical|ous|ious|ful|y|ish|ive|ary|en|ly|like|an)$/, ['al', 'ical', 'ic', 'ous', 'ious', 'ful', 'y', 'ish', 'ive', 'ary', 'en', 'ly', 'like', 'an'], null],
    ['able', 'verb', /(?:able|ible)$/, ['able', 'ible'], null],
  ];
  const fix = (stem) => [stem, stem + 'e', stem.replace(/i$/, 'y'), stem.replace(/(.)\1$/, '$1'), stem + 'y', stem.replace(/t$/, 'te'), stem.replace(/c$/, 'ce')];
  for (const [w, x] of W) {
    if (X.infl(w)) continue;
    for (const [rel, bps, re, sufs, need] of SUF) {
      if (!re.test(w)) continue;
      const wantPs = rel === 'agent' ? 'noun' : rel === 'relating' || rel === 'able' ? 'adjective' : 'noun';
      if (x.ps !== wantPs) continue;
      for (const s of sufs) {
        if (!w.endsWith(s) || w.length - s.length < 3) continue;
        const stem = w.slice(0, -s.length);
        const b = fix(stem).find((c) => c !== w && W.has(c) && !X.infl(c) && new RegExp('^(?:' + bps + ')$').test(ps(c)));
        if (!b) continue;
        const g = X.gloss(x.d);
        if (need && !need.test(g)) continue;
        if (!mentions(w, b) && !(rel === 'quality' && /^(?:the )?(?:quality|state|condition|fact) of being\b/.test(g))) continue;
        add(b, w, rel, b + ' + -' + s + ', gloss names ' + b);
        break;
      }
    }
    // gloss-only: "the quality of being X", "the act of X-ing", "relating to X", "able to be X-ed"
    const g = X.gloss(x.d), t = X.tokens(g);
    let m;
    if (x.ps === 'noun' && (m = g.match(/^(?:the )?(?:quality|state|condition) of being /))) {
      const b = X.lemma(X.tokens(g.slice(m[0].length))[0]);
      if (b && ps(b) === 'adjective' && stemShare(b, w, 3)) add(b, w, 'quality', 'gloss "quality of being ' + b + '"');
    }
    if (x.ps === 'noun' && (m = g.match(/^(?:the )?(?:act|action|process) of /))) {
      const b = X.verb(X.tokens(g.slice(m[0].length)), 0);
      if (b && stemShare(b, w, 3)) add(b, w, 'action', 'gloss "act of ' + b + '"');
    }
    if (x.ps === 'adjective' && !/(?:ier|iest|er|est)$/.test(w) && (m = g.match(/^(?:of or )?(?:relating to|full of|having|characterized by|like|resembling) (?:a |an |the )?/))) {
      const h = after(X.tokens(g.slice(m[0].length)), 0);
      if (h && stemShare(h.head, w, 3)) add(h.head, w, 'relating', 'gloss "' + m[0].trim() + ' ' + h.head + '"');
    }
  }
  return { E, GENUS, fanIn, isCat, X };
}

module.exports = { build, CAT_MIN, KID_CATS };
