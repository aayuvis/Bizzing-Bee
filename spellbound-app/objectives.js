/* objectives.js — "I CAN…" OBJECTIVES, AND THE GRADE MAP ON THE REPORT CARD (road to 4.5, P1.9 / P1.10).

   ONE OBJECTIVE PER CONCEPT FAMILY OF A REGION, DERIVED — NEVER WRITTEN FROM MEMORY.
   Every Atlas stop points at a concept chapter (SB_CONCEPTS.chapters[gi], or its inline chapter for the
   Trickster stops), and every chapter names its own `category` ("Latin Prefixes", "Greek Root Families"…).
   A region's objectives are its stops grouped by that category (the part before " — "), in road order:
   22 objectives over the nine regions, every stop in exactly one. The only authored words are the "I can…"
   sentence per category (CAN below), and tests/objectives.cjs holds each to its stops: the sentence must
   carry a word of the category, and every example it gives in brackets must appear in one of its own
   stops' titles. An objective cannot promise a pattern its stops do not teach.

   LINKED TO ITS STOPS AND ITS GAMES. `stops` are the unit ids; `games` are the two drills every stop runs
   on its own words — the stop's Practice (the set drill, which opens the next stop at 70%) and its Quiz.
   Nothing else draws an objective's words by name (the arcade games draw by the child's band), so nothing
   else is claimed.

   MOVED ONLY BY EVIDENCE. An objective's state is read from the child's mastery record (c.mast — right on
   two separate days, FIX-BEE D5) over the words of its stops' pools (trail-map-data.js, every band) and
   its chapters' own teaching words, and from nothing else: not stops walked, not time, not self-marks,
   not legacy marks (`leg`). SECURE = SECURE_AT words mastered on that record; a miss that drops a word
   below mastery takes it back out of the count the same moment, because the count is recomputed from the
   record on every read. There is no stored "secure" flag to go stale.

   WHERE IT SHOWS. Child: quiet lines under the region board's "What you'll master here" (trail.js
   masterLine → SB_OBJ.boardLines) — the sentence, a tick when secure, never a total. Grown-up: the report
   card in the Parent Zone (behind the PIN) — every region's objectives with their evidence and their stops,
   and the GRADE MAP (grade-map-data.js, built from grade-map/grade-map.json by tools/build-grade-map.cjs):
   US grade · UK year · CBSE class per region and per stop, each with its sources; a row that could not be
   sourced says "not mapped".

   Lazy: in boot-lazy's `atlas` group (the board reads it) and `curriculum` (the report card).
   Pure parts (build / index / evidence / status) take their inputs and are exercised by node tests. */
(function () {
  'use strict';
  var W = typeof window !== 'undefined' ? window : globalThis;
  var SECURE_AT = 10;   // words of an objective mastered on evidence before it reads "secure" — a design threshold, stated on screen
  var GAMES = ['practice', 'quiz'];
  /* "I can…" per chapter category. The EXAMPLES are what sits in the brackets (or after the colon), and
     every one must appear in a stop title of the objective — examples() is the one reader, and
     tests/objectives.cjs holds it. A category not listed here falls back to its own name. */
  var CAN = {
    'Spelling Bee Basics': 'I can spell a word sound by sound (sounds, syllables, letter teams, silent letters)',
    'Spelling Rules & Patterns': 'I can use spelling rules and patterns (silent kn-, ie / ei, double consonant, -ough)',
    'Word Formation': 'I can sort out tricky word families (homophones, contronyms, eponyms)',
    'Latin Prefixes': 'I can spell words that start with a Latin prefix (in-, un-, dis-, re-)',
    'Latin Suffixes': 'I can spell Latin suffixes (-tion, -sion, -ous, -able, -ible)',
    'Latin & Old English Suffixes': 'I can spell suffixes for a state or quality (-ity, -ness, -hood, -ship, -dom)',
    'Agent Suffixes': 'I can spell agent suffixes for the one who does it (-er, -or, -ist, -ian)',
    'Greek Prefixes': 'I can spell words that start with a Greek prefix (anti-, hyper-, auto-, bio-)',
    'Number Prefixes': 'I can spell number prefixes (poly-, multi-, omni-, pan-)',
    'Greek Suffixes': 'I can spell Greek suffixes (-ism, -ist, -ology)',
    'Greek Medical Suffixes': 'I can spell Greek medical suffixes (-itis, -osis, -ectomy, -scope)',
    'Greek Root Families': 'I can spell words built on Greek root families (graph, phon, path, log)',
    'Latin Root Families': 'I can spell words built on Latin root families (aud, dict, port, spec)',
    'French Loanword Patterns': 'I can spell French loanword patterns (-eau, -ette, -que)',
    'Italian Loanword Patterns': 'I can spell Italian loanword patterns (-zz, -cc, -ll, -pp)',
    'Loanword Language Groups': 'I can spell loanwords from other languages (Spanish, German, Japanese, Arabic)',
    'Trickster Concepts': 'I can spot the trickster spellings (sound twins, two-way words, sneaky spellings)',
    'Subject-Area Vocabulary': 'I can spell subject-area words (science, music, law, geography)',
    'Personality Themes': 'I can spell words about personality (self, talking, honesty, courage)',
    'Advanced Vocabulary': 'I can spell advanced vocabulary (rhetorical terms, generosity, miserliness)',
    'Advanced Spelling Strategy': 'I can use advanced spelling strategy (schwa, phonemes)',
    'Championship Level': 'I can spell championship-level words (the final 10, rare languages)'
  };
  /* the examples an "I can…" sentence gives: its bracketed list, else the list after its colon */
  function examples(can) { can = String(can || ''); var m = can.match(/\(([^)]*)\)\s*$/) || can.match(/:\s*(.+)$/);
    return m ? m[1].split(/\s*,\s*|\s+and\s+/).map(function (x) { return x.trim(); }).filter(Boolean) : []; }
  function plain(can) { return String(can || '').replace(/\s*\([^)]*\)\s*$/, '').replace(/:\s*.+$/, '').trim(); }
  var nk = function (w) { return String(w == null ? '' : w).toLowerCase().trim(); };
  var catOf = function (ch) { return String((ch && ch.category) || 'Other').split(' — ')[0].trim(); };
  var slug = function (s) { return String(s).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
  var chapterOf = function (u, chapters) { return u.neu ? u.chapter : (chapters || [])[u.gi]; };
  var shortTitle = function (t) { t = String(t || ''); var i = t.indexOf(' — '); if (i > 0) t = t.slice(0, i); return t.replace(/\s*\([^)]*\)\s*$/, '').trim(); };

  /* the objectives, derived from the trail and its chapters: [{id, act, actTitle, cat, can, stops, labels, games}] */
  function build(T, chapters) {
    if (!T || !T.honey) return [];
    var byId = {}; (T.honey.units || []).forEach(function (u) { byId[u.id] = u; });
    var out = [];
    (T.honey.acts || []).forEach(function (act) {
      var groups = [], at = {};
      (act.units || []).forEach(function (id) {
        var u = byId[id]; if (!u) return;
        var cat = catOf(chapterOf(u, chapters));
        if (!(cat in at)) { at[cat] = groups.length; groups.push({ cat: cat, stops: [], labels: [] }); }
        var g = groups[at[cat]]; g.stops.push(id); g.labels.push(shortTitle(u.title));
      });
      groups.forEach(function (g) {
        out.push({ id: act.id + ':' + slug(g.cat), act: act.id, actTitle: act.title, cat: g.cat,
          can: CAN[g.cat] || ('I can spell ' + g.cat.toLowerCase()), stops: g.stops, labels: g.labels, games: GAMES.slice() });
      });
    });
    return out;
  }
  /* word -> objective id, from every band of each stop's pool and the stop's own teaching words. The pool
     map puts every word in exactly one stop (tests/trail-map.cjs); a teaching word that is also pooled
     elsewhere keeps its pooled home, so no word counts twice. */
  function index(objs, MAP, T, chapters) {
    var ix = Object.create(null), byId = {};
    ((T && T.honey && T.honey.units) || []).forEach(function (u) { byId[u.id] = u; });
    objs.forEach(function (o) { o.stops.forEach(function (id) { var p = (MAP && MAP[id]) || {};
      ['1', '2', '3'].forEach(function (b) { (p[b] || []).forEach(function (w) { var k = nk(w); if (k && !(k in ix)) ix[k] = o.id; }); }); }); });
    objs.forEach(function (o) { o.stops.forEach(function (id) { var u = byId[id]; var ch = u && chapterOf(u, chapters);
      ((ch && ch.words) || []).forEach(function (x) { var k = nk(x && x.w); if (k && !(k in ix)) ix[k] = o.id; }); }); });
    return ix;
  }
  /* the evidence per objective, read from one mastery record: {id: {mastered, learning, slipped, tried, status}} */
  function evidence(mast, objs, ix) {
    var ev = {}; objs.forEach(function (o) { ev[o.id] = { mastered: 0, learning: 0, slipped: 0, tried: 0, status: 'none' }; });
    var M = mast || {};
    for (var k in M) { if (!Object.prototype.hasOwnProperty.call(M, k)) continue;
      var id = ix[nk(k)]; if (!id || !ev[id]) continue; var r = M[k]; if (!r || typeof r !== 'object') continue;
      if (r.leg) continue;                                   // a mark from before evidence is not evidence
      var e = ev[id]; if ((r.n || 0) > 0) e.tried++;
      if ((r.b | 0) >= 2) e.mastered++; else { if ((r.b | 0) === 1) e.learning++; if (r.lp) e.slipped++; } }
    objs.forEach(function (o) { var e = ev[o.id]; e.status = e.mastered >= SECURE_AT ? 'secure' : e.tried ? 'started' : 'none'; });
    return ev;
  }

  /* ---------------- the page side ---------------- */
  var H = function (s) { try { return W.esc(s); } catch (e) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); } };
  var _objs = null, _objsKey = '', _ix = null, _ixKey = '';
  function objs() { var T = W.SB_TRAIL, C = (W.SB_CONCEPTS && W.SB_CONCEPTS.chapters) || [];
    var key = (T ? (T.honey.units || []).length : 0) + ':' + C.length;
    if (!_objs || key !== _objsKey) { _objs = build(T, C); _objsKey = key; _ix = null; }
    return _objs; }
  function ix() { var M = W.SB_TRAIL_MAP; if (!M) return null; var o = objs(); var key = _objsKey + ':' + Object.keys(M).length;
    if (!_ix || key !== _ixKey) { _ix = index(o, M, W.SB_TRAIL, (W.SB_CONCEPTS && W.SB_CONCEPTS.chapters) || []); _ixKey = key; }
    return _ix; }
  var _askedMap = false;
  function needMap() { if (W.SB_TRAIL_MAP || _askedMap) return; _askedMap = true;
    try { if (typeof W.SB_TRAIL_NEEDMAP === 'function') W.SB_TRAIL_NEEDMAP(function () { try { W.render(); } catch (e) {} }); } catch (e) {} }
  function evFor(c) { var I = ix(); if (!I) { needMap(); return null; } return evidence((c && c.mast) || {}, objs(), I); }

  /* CHILD: quiet lines on the region board, only for objectives with a stop on the road the child is
     walking (this lap). A tick when secure; "N mastered" once there is any; never a total. */
  function boardLines(c, actId, unitIds) {
    var list = objs().filter(function (o) { return o.act === actId && (!unitIds || o.stops.some(function (s) { return unitIds.indexOf(s) >= 0; })); });
    if (!list.length) return '';
    var ev = evFor(c);
    return '<span class="atlas-can" style="display:block;margin-top:4px">' + list.map(function (o) {
      var e = ev && ev[o.id]; var mark = e && e.status === 'secure' ? ' <b class="atlas-can-ok" aria-label="secure">✓</b>' : (e && e.mastered ? ' <i style="font-style:normal;opacity:.8">· ' + e.mastered + ' mastered</i>' : '');
      /* the child's line is the sentence without its examples — the line above already names the stops */
      return '<span data-obj="' + H(o.id) + '" data-obj-state="' + (e ? e.status : 'unknown') + '" style="display:block;font-size:12px;color:var(--muted);font-weight:650;line-height:1.4">' + H(plain(o.can)) + mark + '</span>';
    }).join('') + '</span>';
  }

  /* GROWN-UP: the report card's region-by-region section — objectives with their evidence and stops, and
     the grade map with its sources. `here` is the child's region id (the report card's own reading). */
  var FWN = { us: 'US', uk: 'UK', cbse: 'CBSE' };
  var NM = /^not mapped\b/i;
  function fwLabel(r, f) { var m = r && r[f]; if (!m) return 'not mapped'; var v = f === 'us' ? m.grade : f === 'uk' ? m.year : m.class; return v || 'not mapped'; }
  function stopLabel(s) { s = String(s || ''); if (NM.test(s)) return 'not mapped'; var i = s.indexOf(':'); return (i > 0 ? s.slice(0, i) : s).trim(); }
  function stopQuote(s) { s = String(s || ''); var i = s.indexOf(':'); return i > 0 ? s.slice(i + 1).trim() : ''; }
  function reportSection(c, here) {
    var o = objs(); if (!o.length) return '';
    var G = W.SB_GRADE_MAP; var ev = evFor(c);
    var regs = {}; ((G && G.regions) || []).forEach(function (r) { regs[r.act] = r; });
    var srcs = {}; ((G && G.sources) || []).forEach(function (s) { srcs[s.id] = s; });
    var T = W.SB_TRAIL, units = {}; ((T && T.honey && T.honey.units) || []).forEach(function (u) { units[u.id] = u; });
    var chip = function (t, on) { return '<span style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:11.5px;font-weight:800;margin:2px 4px 0 0;background:' + (on ? 'var(--chip)' : 'var(--surface)') + ';border:1px solid var(--line);color:' + (on ? 'var(--accent)' : 'var(--muted)') + '">' + t + '</span>'; };
    var acts = (T && T.honey && T.honey.acts) || [];
    var rows = acts.map(function (act) {
      var mine = o.filter(function (x) { return x.act === act.id; });
      var secure = ev ? mine.filter(function (x) { return ev[x.id].status === 'secure'; }).length : 0;
      var R = regs[act.id];
      var fw = R ? Object.keys(FWN).map(function (f) { return FWN[f] + ' ' + H(fwLabel(R, f)); }).join(' · ') : 'grade map loading';
      var objHTML = mine.map(function (x) { var e = ev && ev[x.id];
        var st = !e ? chip('evidence loading') : e.status === 'secure' ? chip('Secure ✓', true) : e.status === 'started' ? chip('On the way') : chip('Not started');
        var nums = e && (e.mastered || e.learning || e.slipped) ? '<span style="font-size:12px;color:var(--muted)"> — ' + e.mastered + ' mastered' + (e.learning ? ', ' + e.learning + ' right once' : '') + (e.slipped ? ', ' + e.slipped + ' slipped' : '') + '</span>' : '';
        return '<li data-obj="' + H(x.id) + '" data-obj-state="' + (e ? e.status : 'unknown') + '" style="margin:0 0 9px;list-style:none">' + st + ' <b style="font-size:13px">' + H(x.can) + '</b>' + nums +
          '<div style="font-size:12px;color:var(--muted);line-height:1.5;margin-top:2px">Taught at ' + x.stops.length + ' stop' + (x.stops.length === 1 ? '' : 's') + ': ' +
          x.stops.map(function (id, i) { return '<button data-act="trailUnit" data-arg="' + H(id) + '" style="padding:0;background:none;border:0;color:var(--accent);font:inherit;font-weight:700;text-decoration:underline;text-underline-offset:2px;cursor:pointer;min-height:24px">' + H(x.labels[i]) + '</button>'; }).join(', ') +
          '. Practised in each stop’s Practice and Quiz.</div></li>'; }).join('');
      var gm = '';
      if (R) {
        gm = '<div style="margin-top:6px"><div style="font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin:4px 0">Where this sits in school</div>' +
          Object.keys(FWN).map(function (f) { var m = R[f] || {}; var lab = fwLabel(R, f);
            return '<div data-gm="' + f + '" style="font-size:12.5px;line-height:1.5;margin:0 0 6px"><b>' + FWN[f] + ': ' + H(lab) + '</b>' + (m.strength && !NM.test(lab) ? ' <span style="color:var(--muted)">(' + H(m.strength) + ')</span>' : '') +
              (m.why ? '<div style="color:var(--muted)">' + H(m.why) + '</div>' : '') +
              '<div style="font-size:11.5px;color:var(--muted)">Sources: ' + (m.sources || []).map(H).join(', ') + '</div></div>'; }).join('') +
          '<details style="margin-top:4px"><summary style="cursor:pointer;font-size:12.5px;font-weight:800;min-height:24px">Stop by stop (' + (R.stops || []).length + ')</summary><ul style="margin:6px 0 0;padding:0">' +
          (R.stops || []).map(function (s) { var u = units[s.unit];
            return '<li data-gm-stop="' + H(s.unit) + '" style="list-style:none;font-size:12px;line-height:1.5;margin:0 0 6px"><b>' + H(shortTitle((u && u.title) || s.title)) + '</b> — ' +
              Object.keys(FWN).map(function (f) { var lab = stopLabel(s[f]); var q = stopQuote(s[f]);
                return FWN[f] + ' <span' + (q ? ' title="' + H(q) + '"' : '') + '>' + H(lab) + '</span>'; }).join(' · ') +
              ((s.sources || []).length ? ' <span style="color:var(--muted)">[' + s.sources.map(H).join(', ') + ']</span>' : '') + '</li>'; }).join('') + '</ul></details></div>';
      }
      var open = act.id === here;
      return '<details data-region="' + H(act.id) + '"' + (open ? ' open' : '') + ' style="border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin:0 0 8px;background:var(--surface)">' +
        '<summary style="cursor:pointer;min-height:24px"><b style="font-family:var(--display);font-size:14px">' + H(act.title) + '</b>' + (open ? ' <span style="font-size:11.5px;font-weight:800;color:var(--accent)">· here now</span>' : '') +
        '<span style="display:block;font-size:12px;color:var(--muted);font-weight:650">' + (ev ? secure + ' of ' + mine.length + ' objective' + (mine.length === 1 ? '' : 's') + ' secure · ' : '') + fw + '</span></summary>' +
        '<ul style="margin:10px 0 0;padding:0">' + objHTML + '</ul>' + gm + '</details>';
    }).join('');
    var srcList = G ? '<details style="margin-top:6px"><summary style="cursor:pointer;font-size:12.5px;font-weight:800;min-height:24px">The documents behind the grade map (' + G.sources.length + ')</summary><ul style="margin:6px 0 0;padding:0">' +
      G.sources.map(function (s) { return '<li data-src="' + H(s.id) + '" style="list-style:none;font-size:12px;line-height:1.5;margin:0 0 6px"><b>' + H(s.id) + '</b> — ' + H(s.title) + '. <a href="' + H(s.url) + '" target="_blank" rel="noopener" style="color:var(--accent);word-break:break-all">' + H(s.url) + '</a>' +
        '<span style="color:var(--muted)"> · read ' + H(s.fetched) + (s.url_reachable_from_sandbox === false ? ' from a public copy (the official site could not be reached when the map was made)' : '') + '</span></li>'; }).join('') + '</ul></details>' : '';
    return '<div class="sb-rc-curriculum" style="margin-top:14px">' +
      '<div style="font-family:var(--display);font-weight:800;font-size:15px">What they can do, region by region</div>' +
      '<p style="margin:2px 0 10px;font-size:12.5px;color:var(--muted);line-height:1.5">Each “I can…” comes from the stops that teach it, and moves only on evidence: it is <b>secure</b> once ' + SECURE_AT + ' of its words are mastered (spelled right on two different days). A word that slips comes back out of the count. ' +
      'The school levels are a map, not a test result — US Common Core grade, England National Curriculum year and CBSE class, each from the documents listed below; where no document covers a stop it says “not mapped”.' + (G ? '' : ' <i>Loading the grade map…</i>') + '</p>' +
      rows + srcList + '</div>';
  }

  W.SB_OBJ = { build: build, index: index, evidence: evidence, examples: examples, plain: plain, CAN: CAN, SECURE_AT: SECURE_AT, GAMES: GAMES,
    list: objs, evFor: evFor, boardLines: boardLines, reportSection: reportSection, shortTitle: shortTitle, catOf: catOf };
  if (typeof module !== 'undefined' && module.exports) module.exports = W.SB_OBJ;
})();
