/* forge-core.js — Word Forge's rules, with no screen in them (spec §5.1).
   One file the game, the table builder (tools/forge/build-table.cjs) and the tests
   (tests/forge-data.cjs) all run, so the join a child sees, the join the build checked and the
   join the test proves are the same function. Nothing here picks at random: decoys, word order
   and the "random bot" in the tests are seeded, so a round is reproducible.

   A row (forge-data.js) is:
     { w, parts:['in','cred','ible'], kinds:['pre','root','suf'], partMeanings:[…],
       fams:['in',null,'able'], roots:['cred'], origin:'Latin', etym:'incredibilis',
       confusable:{ '2':['able'] }, rules:{ '2':'able' }, src:{…} }
   A part is joined to the next exactly as written, except for the two changes English makes
   at a joint and the game SHOWS (WF2):
     e-drop — a root ending in a silent e loses it before a vowel   (phone + ic → phonic)
     y → i  — a root or suffix ending consonant + y turns the y to i (happy + ness → happiness)
   Prefixes never change here: an assimilated prefix (im-, ac-, col-) is its own tile, because
   that is the spelling a child has to choose, and the reason card says why it changed. */
(function (root) {
  'use strict';
  var VOW = /^[aeiou]/;

  /* parts: strings or {s,k}; kinds optional. → {word, changes:[{at, from, to, rule}]} */
  function join(parts, kinds) {
    var out = '', changes = [];
    for (var i = 0; i < parts.length; i++) {
      var p = String(typeof parts[i] === 'object' ? parts[i].s : parts[i]);
      var k = kinds ? kinds[i] : (typeof parts[i] === 'object' ? parts[i].k : 'root');
      var nx = parts[i + 1] != null ? String(typeof parts[i + 1] === 'object' ? parts[i + 1].s : parts[i + 1]) : null;
      var piece = p;
      if (nx != null && k !== 'pre') {
        if (/[^aeiou]e$/.test(p) && p.length > 2 && VOW.test(nx)) { piece = p.slice(0, -1); changes.push({ at: i, from: p, to: piece, rule: 'e-drop' }); }
        else if (/[^aeiou]y$/.test(p) && !/^i/.test(nx)) { piece = p.slice(0, -1) + 'i'; changes.push({ at: i, from: p, to: piece, rule: 'y-i' }); }
      }
      out += piece;
    }
    return { word: out, changes: changes };
  }
  function changeNote(c) {
    if (c.rule === 'e-drop') return c.from + ' drops its e before a vowel: ' + c.to;
    if (c.rule === 'y-i') return c.from + ' turns its y to i: ' + c.to;
    return '';
  }

  /* A seeded generator (mulberry32) — presentation and test bots only, never a reward path. */
  function rng(seed) {
    var a = (seed >>> 0) || 1;
    return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function shuffled(arr, seed) { var a = arr.slice(), r = rng(seed); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* Tiles for a row at a level. Each tile: {s, m, k, real:slot|-1}. Never random: the seed is
     the word and the round, so the same word on the same round deals the same rack.
     Easy   — exactly the parts.
     Medium — the parts + decoys from the SAME family as a part (-able/-ible, -ance/-ence, the
              forms of one root, in-/im-/il-/ir-); a two-part word gets four, a longer word two,
              so a random placement lands under 5% (WF1).
     Hard   — the root is fixed on the anvil; the other slots choose from the parts + family
              decoys + other prefixes/suffixes from the table.
     Champ  — no tiles (the child types, then marks the parts). */
  function rack(row, level, table, seed) {
    var parts = row.parts.map(function (s, i) { return { s: s, m: row.partMeanings[i], k: row.kinds[i], real: i }; });
    if (level === 'easy') return shuffled(parts, hash(row.w + '|' + seed));
    if (level === 'champ') return [];
    var have = {}; row.parts.forEach(function (s) { have[s] = 1; });
    var fam = [];
    Object.keys(row.confusable || {}).forEach(function (slot) {
      (row.confusable[slot] || []).forEach(function (s) { if (!have[s]) { have[s] = 1; fam.push({ s: s, m: (row.confMeanings && row.confMeanings[s]) || row.partMeanings[+slot], k: row.kinds[+slot], real: -1, fam: +slot }); } });
    });
    var others = [];
    (table || []).forEach(function (r) { if (r === row) return;
      r.parts.forEach(function (s, i) { if (have[s] || r.kinds[i] === 'root') return;
        if (row.kinds.indexOf(r.kinds[i]) < 0) return;
        have[s] = 1; others.push({ s: s, m: r.partMeanings[i], k: r.kinds[i], real: -1 }); }); });
    others = shuffled(others, hash(row.w + '#' + seed));
    var want = level === 'hard' ? Math.max(4, 6 - row.parts.length + 2) : (row.parts.length <= 2 ? 4 : 2);
    var dec = shuffled(fam, hash(row.w + '*' + seed)).slice(0, want);
    for (var i = 0; dec.length < want && i < others.length; i++) dec.push(others[i]);
    var tiles = parts.concat(dec);
    if (level === 'hard') tiles = tiles.filter(function (t) { return t.k !== 'root' || t.real < 0; });
    return shuffled(tiles, hash(row.w + '@' + seed));
  }
  /* the slots a level leaves open (Hard fixes the roots on the anvil) */
  function openSlots(row, level) {
    return row.parts.map(function (s, i) { return i; }).filter(function (i) { return !(level === 'hard' && row.kinds[i] === 'root'); });
  }

  var KIND = { pre: 'a prefix — it goes at the front', suf: 'a suffix — it goes at the end', root: 'the root — it carries the meaning' };

  /* Why a part in a slot is wrong — matched to the error (WF4). Every branch names the part the
     child placed AND the part the word needs, and the family branches quote the rule the app
     teaches (concepts-data chapter, cited in the row) or the word's own Latin or Greek form. */
  function reason(row, slot, placed) {
    var want = row.parts[slot], p = String(placed && placed.s != null ? placed.s : placed);
    if (p === want) return '';
    var wk = row.kinds[slot], fam = row.fams && row.fams[slot];
    var inRow = row.parts.indexOf(p);
    if (inRow >= 0) {
      return '*' + p + '* is ' + (KIND[row.kinds[inRow]] || 'in this word') + '. Here it is ' + order(row) + '.';
    }
    var conf = (row.confusable && row.confusable[slot]) || [];
    if (conf.indexOf(p) >= 0) {
      var rule = row.rules && row.rules[slot];
      var etym = row.etym ? (row.origin === 'Greek' ? 'Greek ' : 'Latin ') + '*' + row.etym + '*' : '';
      if (rule === 'able') {
        var rp = row.parts[row.kinds.indexOf('root')];
        return want === 'ible'
          ? '*' + rp + '* is a ' + (row.origin || 'Latin') + ' root that cannot stand alone as a word, so *-ible*, not *-' + p + '*.'
          : '*' + rp + '* is a whole word on its own, so *-able*, not *-' + p + '*.';
      }
      if (rule === 'ety' && etym) return 'This word comes from ' + etym + ' — its spelling keeps *' + want + '*, not *' + p + '*.';
      if (rule === 'assim') {
        var nx = row.parts[slot + 1] || '';
        return 'Before *' + nx.charAt(0) + '*, the prefix is spelt *' + want + '-*, not *' + p + '-* (the prefix changes its last letter to fit the root).';
      }
      if (rule === 'or') return '*' + row.parts[row.kinds.indexOf('root')] + '* is a Latin root, so the doer ends *-or*, not *-' + p + '*.';
      if (rule === 'form') return 'The root takes its *' + want + '* form in this word, not *' + p + '*' + (etym ? ' — from ' + etym : '') + '.';
      if (etym) return 'This word comes from ' + etym + ', so it is *' + want + '*, not *' + p + '*.';
      return 'Both say the same sound, but this word is spelt with *' + want + '*, not *' + p + '*.';
    }
    var pm = placed && placed.m ? placed.m : '', pk = placed && placed.k;
    var WHERE = { pre: 'the front', root: 'the middle', suf: 'the end' }, WHAT = { pre: 'prefix', root: 'root', suf: 'suffix' };
    /* a look-alike of ANOTHER part of this word, dropped in the wrong slot */
    for (var j = 0; j < row.parts.length; j++) {
      if (j !== slot && ((row.confusable && row.confusable[j]) || []).indexOf(p) >= 0)
        return '*' + p + '* is a ' + WHAT[row.kinds[j]] + ' (like *' + row.parts[j] + '*) — it would go at ' + WHERE[row.kinds[j]] + '. This slot needs *' + want + '* ("' + row.partMeanings[slot] + '").';
    }
    /* the wrong KIND of part for this slot */
    if (pk && pk !== wk) return '*' + p + '* is a ' + WHAT[pk] + ' — it goes at ' + WHERE[pk] + '. This slot needs the ' + WHAT[wk] + ' *' + want + '* ("' + row.partMeanings[slot] + '").';
    /* un- and in- both mean "not": the language decides (concepts-data, chapter "un- (not / reverse action)", card "un- vs in-") */
    var inFam = { 'in': 1, im: 1, il: 1, ir: 1 };
    if (wk === 'pre' && ((p === 'un' && inFam[want]) || (inFam[p] && want === 'un')))
      return want === 'un' ? '*un-* is the English "not"; this word is English-built, so *un-*, not *' + p + '-*.'
        : '*un-* is the Old English "not"; *' + want + '-* is the Latin one, and this word comes from Latin' + (row.etym ? ' *' + row.etym + '*' : '') + ', so *' + want + '-*.';
    return '*' + p + '*' + (pm ? ' means "' + pm + '"' : ' is not part of this word') + '; this word needs *' + want + '* ("' + row.partMeanings[slot] + '")' + (row.etym ? ' — it comes from ' + (row.origin || 'Latin') + ' *' + row.etym + '*' : '') + '.';
  }
  function order(row) { return row.parts.map(function (s, i) { return (row.kinds[i] === 'pre' ? s + '-' : row.kinds[i] === 'suf' ? '-' + s : s); }).join(' + '); }
  function mean(row) { return row.partMeanings.join(' + '); }

  /* Grade a forge: placed[slot] = part string (or null). → {ok, wrong:[{slot, part, reason}]} */
  function grade(row, placed) {
    var wrong = [];
    for (var i = 0; i < row.parts.length; i++) {
      var p = placed[i];
      if (p == null || p === '') { wrong.push({ slot: i, part: null, reason: 'This slot is still empty — the word has ' + row.parts.length + ' parts.' }); continue; }
      var s = p.s != null ? p.s : p;
      if (s !== row.parts[i]) wrong.push({ slot: i, part: s, reason: reason(row, i, p) });
    }
    return { ok: !wrong.length, wrong: wrong };
  }

  /* The meanings combined, for the right-forge beat: "not + believe + capable of being = incredible" */
  function combine(row) { return row.partMeanings.join(' + ') + ' = ' + row.w; }

  /* Champ: the child types the word, then marks where the parts break. cuts = indices in the
     word where a new part starts. Right when every boundary of the row's join is marked. */
  function boundaries(row) {
    var j = join(row.parts, row.kinds), at = 0, out = [];
    for (var i = 0; i < row.parts.length - 1; i++) {
      var piece = row.parts[i];
      j.changes.forEach(function (c) { if (c.at === i) piece = c.to; });
      at += piece.length; out.push(at);
    }
    return out;
  }

  /* PAY (spec §6: "per first-forge right; never tiles alone"). The one place that decides it.
     payNow(level)  — coins the moment a word resolves right: Hard and Champ, where the child SPELLS it.
     roundPay(level, rights, n) — coins at the round's end: Medium pays its first-forge rights only
       when the round reaches half (§1.7's bar), because a random placer can land a word by luck but
       never half a round; Easy (the exact parts, in some order) never pays — that is tiles alone. */
  function payNow(level) { return level === 'hard' || level === 'champ'; }
  function roundPay(level, rights, n) { return level === 'medium' && n > 0 && rights / n >= 0.5 ? rights : 0; }

  var API = { payNow: payNow, roundPay: roundPay, join: join, changeNote: changeNote, rack: rack, openSlots: openSlots, reason: reason, grade: grade,
    combine: combine, boundaries: boundaries, rng: rng, hash: hash, shuffled: shuffled, order: order };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (root) root.SB_FORGE_CORE = API;
})(typeof window !== 'undefined' ? window : null);
