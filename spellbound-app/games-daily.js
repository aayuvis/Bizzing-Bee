/* ============================================================
   Bizzing Bee — DAILY BEE (games spec §5.2, 4 Oct 2026). In for Daily Buzz.

   One word a day, SPOKEN, never shown. The child types guesses of the same length and every
   letter comes back with a SHAPE as well as a colour — ● right place · ◐ in the word ·
   ○ not in it — six tries, and it ALWAYS ends with the word: said again, its meaning, its
   origin, a sentence, and "Add to revision" when it got away. Daily Buzz drew five blank
   squares over a list of 300 fixed words and never said the word at all; this one teaches it.

   THE WORD is deterministic per date AND band: nextWords(child, 1, {purpose:'daily'}) when the
   foundations have it, else an FNV hash of "<date>|<lo>-<hi>" over this child's band of the
   corpus (diffRange at the Daily Bee's level), kid-safe, letters only, 4–8 long. The pick waits
   for the whole served corpus (the `daily` lazy group), so the same date and band give the same
   word whatever else has loaded; today's word is then kept on the child (c.dbee) so a deploy or a
   level change after the first try never swaps it mid-game.

   PAY: one `answer` coin when solved, once a day, nothing for a miss — a random guesser earns 0
   (tests/daily-bee.cjs DB3). SB_LEVEL.after('dailyBee', solved?1:0) once a day.
   NEVER SHOWN BEFORE THE END: the word lives in c.dbee and in this closure; nothing on screen,
   no attribute and no live line carries it until the round is over (tests/daily-bee.cjs).

   IT LIVES IN THE SHELL (audit v4 N2): nav 'daily', #/daily, the family top bar and tabs around
   the engine kit's stage (SGUI.stage, SGUI.keys) on the morning-hive plate. app3 renders an empty #db-host; after every app render mount() draws the
   stage again from the state kept on the child and here (the letters being typed), so a
   re-render never loses a word half-typed. Keys reach it only while it is the screen and nothing
   is typed into a field or open over it. Lazy: boot-lazy's `daily` group brings this file, the
   kit (saga2.js) and the corpus at the door (app.openDailyBee).
   ============================================================ */
(function () {
  var TRIES = 6, MINL = 4, MAXL = 8, KEY = 'dailyBee';
  var SHAPE = { hit: '●', near: '◐', miss: '○' };            // ● ◐ ○
  var SAYS = { hit: 'right place', near: 'in the word', miss: 'not in it' };
  var LV_NAME = { auto: 'Auto', easy: 'Easy', medium: 'Medium', hard: 'Hard', champ: 'Champ' };

  /* Theme tokens only (Daily Buzz painted var(--bg,#FBF7EC) and #fff panels, unreadable at dusk).
     The STAGE is the engine kit's (SGUI.stage: fixed between the shell bar and the tab bar, the
     morning-hive plate edge to edge, the HUD mirrored); this is only what goes inside it. Panels
     are translucent paper over the plate; a filled cell is a soft ramp, never a flat block (T14). */
  var css = ''
    + '.sb-content:has(>.db-host){max-width:none!important;padding:0!important}'
    /* the play area holds one centred column: the prompt, the board, the shapes' key, and the buttons */
    + '.db-play{display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;min-height:0;box-sizing:border-box}'
    + '.db-kb{width:100%}'
    + '.db-mid{display:flex;flex-direction:column;align-items:center;gap:3px;text-align:center;min-width:0}'
    + '.db-title{font:800 18px/1.1 var(--display);color:var(--text);white-space:nowrap}'
    + '.db-when{display:flex;align-items:center;gap:6px;font:700 12px/1.2 var(--ui);color:var(--muted);white-space:nowrap}'
    + '.db-lv{display:inline-flex;align-items:center;padding:2px 9px;border-radius:999px;background:color-mix(in srgb,var(--paper) 80%,transparent);border:1px solid var(--line);color:var(--text);font:800 11.5px/1.4 var(--ui)}'
    + '.sg-st-stat .db-ic{display:inline-grid;place-items:center;color:var(--treasure-deep,#8A5B00)}[data-mode="dusk"] .sg-st-stat .db-ic{color:var(--treasure,#F0B429)}'
    /* the board */
    + '.db-msg{min-height:22px;max-width:36em;margin:0 auto 8px;padding:3px 12px;border-radius:999px;font:700 13.5px/1.35 var(--ui);color:var(--text);text-align:center;background:color-mix(in srgb,var(--paper) 72%,transparent)}'
    + '.db-msg:empty{visibility:hidden}'
    + '.db-grid{--cell:52px;--gap:6px;display:grid;gap:var(--gap)}'
    + '.db-row{display:grid;grid-template-columns:repeat(var(--n),var(--cell));gap:var(--gap);justify-content:center}'
    + '.db-cell{position:relative;width:var(--cell);height:var(--cell);box-sizing:border-box;display:grid;place-items:center;border-radius:calc(var(--cell)*.2);'
    + 'font:800 calc(var(--cell)*.5)/1 var(--mono);text-transform:uppercase;color:var(--text);border:2px solid color-mix(in srgb,var(--line) 90%,var(--text) 10%);'
    + 'background:linear-gradient(180deg,color-mix(in srgb,var(--paper) 66%,transparent),color-mix(in srgb,var(--paper) 46%,transparent))}'
    + '.db-cell.cur{border-color:color-mix(in srgb,var(--action) 55%,var(--line))}'
    + '.db-cell.fill{background:linear-gradient(180deg,color-mix(in srgb,var(--paper) 94%,transparent),color-mix(in srgb,var(--paper) 78%,transparent))}'
    + '.db-cell .db-sh{position:absolute;right:calc(var(--cell)*.07);top:calc(var(--cell)*.03);font:400 calc(var(--cell)*.24)/1 var(--ui);opacity:.95}'
    + '.db-cell.hit{background:linear-gradient(180deg,color-mix(in srgb,var(--mastered) 80%,#fff),var(--mastered) 70%);border-color:var(--mastered);color:#fff}'
    + '.db-cell.near{background:linear-gradient(180deg,color-mix(in srgb,var(--medium) 78%,#fff),var(--medium) 70%);border-color:var(--medium);color:#fff}'
    + '.db-cell.miss{background:color-mix(in srgb,var(--paper) 40%,transparent);border-style:dashed;color:var(--muted)}'
    + '.db-cell.hit,.db-cell.near{text-shadow:0 1px 1px rgb(0 0 0 / .25)}'
    + '.db-cell.flip{animation:db-flip .42s ease both}'
    + '.db-row.shake{animation:db-shake .38s}'
    + '@keyframes db-flip{0%{transform:rotateX(0)}45%{transform:rotateX(90deg)}100%{transform:rotateX(0)}}'
    + '@keyframes db-shake{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}'
    + '.db-key{display:flex;justify-content:center;gap:14px;flex-wrap:wrap;margin-top:8px;font:700 12px/1.3 var(--ui);color:var(--muted)}'
    + '.db-key span{display:inline-flex;align-items:center;gap:4px}'
    /* three buttons mirrored about "Hear it again", at the foot of the play area, right above the keys */
    + '.db-acts{display:grid;grid-template-columns:1fr minmax(0,1.5fr) 1fr;gap:8px;margin:10px auto 0;width:100%;max-width:560px;flex:none}'
    + '.db-b{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:44px;padding:6px 10px;border-radius:999px;box-sizing:border-box;'
    + 'font:800 14px/1.15 var(--ui);color:var(--text);background:linear-gradient(180deg,color-mix(in srgb,var(--paper) 92%,transparent),color-mix(in srgb,var(--paper) 72%,transparent));border:1.5px solid var(--line);cursor:pointer;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}'
    + '.db-b.go{background:var(--action);color:var(--action-ink,#fff);border-color:transparent;box-shadow:var(--edge)}'
    + '.db-b[disabled]{opacity:.7;cursor:default}'
    + '.db-b svg{flex:none}'
    /* the kit's keys learn the board's shapes (tintKit) */
    + '.sg-key{position:relative}'
    + '.sg-key .db-sh{position:absolute;right:3px;top:2px;font:400 10px/1 var(--ui)}'
    + '.sg-key.db-k-hit{background:linear-gradient(180deg,color-mix(in srgb,var(--mastered) 80%,#fff),var(--mastered));color:#fff;border-color:var(--mastered)}'
    + '.sg-key.db-k-near{background:linear-gradient(180deg,color-mix(in srgb,var(--medium) 78%,#fff),var(--medium));color:#fff;border-color:var(--medium)}'
    + '.sg-key.db-k-miss{background:color-mix(in srgb,var(--paper) 36%,transparent);color:var(--muted);border-style:dashed}'
    /* the end: the word, always */
    + '.db-end{width:min(100%,560px);max-height:100%;overflow:auto;box-sizing:border-box;padding:14px 16px;border-radius:20px;text-align:center;'
    + 'background:color-mix(in srgb,var(--paper) 88%,transparent);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid var(--line);box-shadow:var(--sh-raised)}'
    + '.db-endh{font:800 15px/1.3 var(--ui);color:var(--muted);margin:0 0 8px}'
    + '.db-word{display:flex;justify-content:center;gap:5px;margin:0 0 6px}'
    + '.db-word .db-cell{--cell:40px}'
    + '.db-pron{font:700 13px var(--ui);color:var(--muted);margin-bottom:8px}'
    + '.db-facts{text-align:left;display:grid;gap:7px;margin:8px 0 2px}'
    + '.db-fact{font:500 14px/1.45 var(--ui);color:var(--text)}'
    + '.db-fact b{display:block;font:800 11px/1.3 var(--ui);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}'
    + '.db-mini{display:inline-grid;gap:3px;margin:2px auto 8px}'
    + '.db-mini .db-row{--cell:18px;--gap:3px}'
    + '.db-mini .db-cell{border-width:1px;font-size:0}.db-mini .db-cell .db-sh{position:static;font-size:11px;color:inherit}'
    + '.db-kind{margin-top:8px;font:700 13px/1.4 var(--ui);color:var(--text);background:color-mix(in srgb,var(--treasure) 18%,transparent);border-radius:12px;padding:7px 10px}'
    + '.db-wait{display:grid;place-items:center;min-height:50vh}'
    + '@media (prefers-reduced-motion:reduce){.db-cell.flip,.db-row.shake{animation:none}}'
    + '[data-a11y-motion] .db-cell.flip,[data-a11y-motion] .db-row.shake{animation:none}'
    + '@media(max-width:560px){.db-title{font-size:16px}.db-acts{gap:6px;margin-top:8px}.db-b{font-size:13px;padding:6px 8px}.db-msg{font-size:12.5px;margin-bottom:6px}.db-key{display:none}}';

  /* ------------------------------------------------------------------ the word */
  function fnv(s) { var h = 0x811c9dc5; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h >>> 0; }
  function lc(s) { return String(s == null ? '' : s).toLowerCase(); }
  /* A word a child may be asked for on a Daily Bee: letters only, 4–8 long (the board must fit a
     390px phone), a meaning to end on, a respelling, and clean — kidSafe() when the foundations
     have it, else the same gates the word of the hour uses (struck, cut, held, the gloss test). */
  /* The screen's own words. If the day's word were "listen" or "letters", the prompt above the board would
     print it — so a word the stage itself says (its copy, its labels, a weekday or a month in the date) is
     never the day's word. */
  var OWN = {};
  ('daily bee tries left good days this week letters listen then type your first right place word play hear again slowly '
    + 'enter delete letter empty level auto easy medium hard champ group getting ready today tomorrow solved meaning origin '
    + 'sentence revision added back from move time added comes ready letters monday tuesday wednesday thursday friday '
    + 'saturday sunday january february march april june july august september sept october november december').split(' ').forEach(function (x) { OWN[x] = 1; });
  function fits(e) {
    if (!e || !e.w || !e.d || !e.p || !e.s) return false;
    var w = String(e.w); if (!/^[a-z]+$/.test(w) || w.length < MINL || w.length > MAXL || OWN[w]) return false;
    if (typeof window.kidSafe === 'function') { try { return !!window.kidSafe(e); } catch (x) { return false; } }
    try { if (typeof CORE_STRIKE !== 'undefined' && CORE_STRIKE.has(w)) return false; } catch (x) {}
    try { if (typeof CORE_CUT !== 'undefined' && CORE_CUT.has(w)) return false; } catch (x) {}
    if ((window.SB_WORDS_HELD || []).indexOf(w) >= 0) return false;
    /* a word of the day is a showcase: none from the themes the spec holds back from young children
       (War & Weaponry, Drugs & Pharmacy, Diseases & Symptoms — §1.2), whoever is playing */
    var t = e.t || []; for (var j = 0; j < t.length; j++) if (t[j] === 'war' || t[j] === 'pharmacy' || t[j] === 'disease') return false;
    if (typeof window.SB_GLOSS_OK === 'function' && !window.SB_GLOSS_OK(e.d, e.w)) return false;
    return true;
  }
  var _pools = {}, _all = null, _allN = -1;
  /* a headword, not a form of one: "locals", "jumped", "racing" are the day's word only if the
     corpus has no "local", "jump", "race" to be the word instead (lemmaOnly, by the corpus itself) */
  function lemma(w) {
    var src = (window.SB_DATA && window.SB_DATA.nsf) || [];
    if (!_all || _allN !== src.length) { _all = {}; for (var i = 0; i < src.length; i++) if (src[i] && src[i].w) _all[src[i].w] = 1; _allN = src.length; }
    var A = _all;
    if (/s$/.test(w) && (A[w.slice(0, -1)] || /es$/.test(w) && A[w.slice(0, -2)] || /ies$/.test(w) && A[w.slice(0, -3) + 'y'])) return false;
    if (/ed$/.test(w) && (A[w.slice(0, -2)] || A[w.slice(0, -1)] || /ied$/.test(w) && A[w.slice(0, -3) + 'y'] || w.length > 5 && w[w.length - 3] === w[w.length - 4] && A[w.slice(0, -3)])) return false;
    if (/ing$/.test(w) && (A[w.slice(0, -3)] || A[w.slice(0, -3) + 'e'] || w.length > 6 && w[w.length - 4] === w[w.length - 5] && A[w.slice(0, -4)])) return false;
    if (/(er|est)$/.test(w) && (A[w.replace(/(er|est)$/, '')] || A[w.replace(/(r|st)$/, '')] || A[w.replace(/i(er|est)$/, 'y')])) return false;
    return true;
  }
  /* the band's words, sorted by spelling, so the pool does not depend on the order shards landed */
  function bandPool(lo, hi) {
    var src = (window.SB_DATA && window.SB_DATA.nsf) || [], k = lo + '-' + hi + '|' + src.length;
    if (_pools[k]) return _pools[k];
    var seen = {}, out = [];
    for (var i = 0; i < src.length; i++) { var e = src[i]; if (!fits(e)) continue; var y = Math.max(1, Math.min(9, e.y || 3));
      if (y < lo || y > hi || seen[e.w] || !lemma(e.w)) continue; seen[e.w] = 1; out.push(e); }
    out.sort(function (a, b) { return a.w < b.w ? -1 : a.w > b.w ? 1 : 0; });
    return (_pools[k] = out);
  }
  /* THE PICK: same date and band → same word. `band` is "lo-hi", the corpus y-range. */
  function pick(date, band) {
    var p = String(band || '').split('-'), lo = +p[0] || 1, hi = +p[1] || lo, pool = bandPool(lo, hi);
    if (!pool.length) return null;
    return pool[fnv(String(date) + '|' + lo + '-' + hi) % pool.length];
  }
  function levelNow() { try { if (window.SB_LEVEL && typeof SB_LEVEL.get === 'function') return SB_LEVEL.get(KEY) || 'auto'; } catch (e) {} return 'auto'; }
  function bandFor(c, lvl) {
    try { if (typeof diffRange === 'function') { var r = diffRange(c, lvl || 'auto'); return r[0] + '-' + r[1]; } } catch (e) {}
    return '1-3';
  }
  function today() { try { if (typeof todayKey === 'function') return todayKey(); } catch (e) {} var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function corpusReady() { try { return !window.SB_LAZY || SB_LAZY.ready('daily'); } catch (e) { return true; } }
  /* the foundations' picker when it is in (it owns the level window and the kid-safe door), else ours */
  function choose(c, date, band) {
    if (typeof window.nextWords === 'function') {
      try { var r = window.nextWords(c, 24, { purpose: 'daily', minLen: MINL, maxLen: MAXL, lemmaOnly: true, date: date }) || [];
        for (var i = 0; i < r.length; i++) if (fits(r[i])) return r[i]; } catch (e) {}
    }
    return pick(date, band);
  }
  var _byW = null, _byN = -1;
  function recOf(w) {
    var src = (window.SB_DATA && window.SB_DATA.nsf) || [];
    if (!_byW || _byN !== src.length) { _byW = {}; for (var i = 0; i < src.length; i++) { var e = src[i]; if (e && e.w && !_byW[e.w]) _byW[e.w] = e; } _byN = src.length; }
    return _byW[w] || { w: w };
  }

  /* ------------------------------------------------------------------ today's game, on the child */
  function kid() { try { return active(); } catch (e) { return null; } }
  function rec(c) {
    if (!c) return null;
    var D = c.dbee; if (!D || typeof D !== 'object') D = c.dbee = { days: {} };
    if (!D.days) D.days = {};
    var t = today();
    if (D.day !== t) { D.day = t; D.word = ''; D.key = ''; D.g = []; D.over = 0; D.won = 0; D.paid = 0; D.lv = 0; D.lvr = null; D.rev = 0; }
    return D;
  }
  /* (re)choose today's word: once a day, and again only if the level moved before the first try */
  function ensureWord(c, D) {
    var lvl = levelNow(), band = bandFor(c, lvl), key = D.day + '|' + lvl + '|' + band;
    if (D.word && (D.key === key || (D.g && D.g.length) || D.over)) return true;
    var r = choose(c, D.day, band); if (!r) return false;
    D.word = r.w; D.key = key; D.g = []; try { if (typeof save === 'function') save(); } catch (e) {}
    return true;
  }
  /* two passes, so a doubled letter is only marked as often as the word holds it */
  function grade(guess, word) {
    var n = word.length, res = [], pool = word.split(''), i;
    for (i = 0; i < n; i++) res[i] = 'miss';
    for (i = 0; i < n; i++) if (guess[i] === word[i]) { res[i] = 'hit'; pool[i] = null; }
    for (i = 0; i < n; i++) { if (res[i] === 'hit') continue; var k = pool.indexOf(guess[i]); if (k > -1) { res[i] = 'near'; pool[k] = null; } }
    return res;
  }
  function better(a, b) { var o = { miss: 0, near: 1, hit: 2 }; return (o[b] || 0) > (o[a] || 0) ? b : a; }
  /* "good days this week": days THIS week (Mon–Sun) the Daily Bee was played to its word.
     Never a run — a day off costs nothing and nothing counts consecutive days. */
  function goodDays(D) {
    var keys = []; try { keys = typeof weekDayKeys === 'function' ? weekDayKeys() : []; } catch (e) {}
    var n = 0; for (var i = 0; i < keys.length; i++) if (D.days[keys[i]]) n++; return n;
  }

  /* ------------------------------------------------------------------ screen state (between renders) */
  var host = null, cur = '', curDay = '', curKid = null, msgT = '', flipRow = -1, shakeRow = false, keysApi = null, keyOn = false, lastIn = { k: '', t: 0, s: '' }, sizeOn = false, spoke = '';

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function ico(n, sz) { try { if (typeof iconSVG === 'function') return iconSVG(n, sz || 18); } catch (e) {} return ''; }
  function sayWord(w, slow) { try { if (typeof deviceSpeak === 'function') deviceSpeak(w, slow ? 0.55 : 0.9); else if (typeof say === 'function') say(w); } catch (e) {} }
  function live(t) { try { if (t && window.SB_LIVE) SB_LIVE.say([t]); } catch (e) {} }
  function dateLabel() { try { return new Date().toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }); } catch (e) { return today(); } }
  function levelChip() {
    try { if (window.SB_LEVEL && typeof SB_LEVEL.chip === 'function') return SB_LEVEL.chip(KEY, 'the Daily Bee'); } catch (e) {}
    return '<span class="db-lv">' + esc(LV_NAME[levelNow()] || 'Auto') + '</span>';
  }
  /* THE STAGE IS THE ENGINE KIT'S (SGUI.stage, games spec §5.0): the morning-hive plate by name (the kit
     swaps day and night with the look), the HUD's stats as content the kit wraps, the play area and
     the controls row. The 'daily' lazy group carries saga2.js, so the kit is in before the board is. */
  function statIn(x) { return '<span class="db-ic sg-st-ic" aria-hidden="true">' + x.ic + '</span><span class="sg-st-n" aria-label="' + esc(x.n + ' ' + x.t) + '">' + x.n + '</span><span class="sg-st-t">' + esc(x.t) + '</span>'; }
  function kit() { return !!(window.SGUI && typeof SGUI.stage === 'function' && typeof SGUI.keys === 'function'); }
  function stage(o) {
    return SGUI.stage({ plate: 'daily', name: 'daily', label: 'Daily Bee',
      hud: { left: statIn(o.hud.left), center: '<div class="db-mid">' + o.hud.center + '</div>', right: statIn(o.hud.right) }, play: o.play, controls: o.controls });
  }

  function cellHtml(ch, st, extra) {
    var lab = ch ? ch.toUpperCase() + (st ? ', ' + SAYS[st] : '') : 'empty';
    return '<div class="db-cell' + (st ? ' ' + st : '') + (extra || '') + '" role="img" aria-label="' + lab + '">' + (ch ? esc(ch) : '')
      + (st ? '<i class="db-sh" aria-hidden="true">' + SHAPE[st] + '</i>' : '') + '</div>';
  }
  function boardHtml(D, n, mini) {
    var h = '<div class="db-grid' + (mini ? ' db-mini' : '') + '" style="--n:' + n + '" role="group" aria-label="Your tries">';
    var rows = mini ? D.g.length : TRIES;
    for (var r = 0; r < rows; r++) {
      var g = D.g[r], ev = g ? grade(g, D.word) : null, live = !g && r === D.g.length && !D.over;
      h += '<div class="db-row' + (live && shakeRow ? ' shake' : '') + '" data-r="' + r + '" aria-label="Try ' + (r + 1) + '">';
      for (var i = 0; i < n; i++) {
        if (g) h += cellHtml(g[i], ev[i], r === flipRow ? ' flip" style="animation-delay:' + (i * 80) + 'ms' : '');
        else if (live) h += cellHtml(cur[i] || '', '', ' cur' + (cur[i] ? ' fill' : ''));
        else h += cellHtml('', '', '');
      }
      h += '</div>';
    }
    return h + '</div>';
  }
  function keyState(D) {
    var ks = {}; (D.g || []).forEach(function (g) { var ev = grade(g, D.word); for (var i = 0; i < g.length; i++) ks[g[i]] = better(ks[g[i]] || 'miss', ev[i]); });
    return ks;
  }
  function endHtml(D, w, n) {
    var won = !!D.won, head = won ? 'Solved in ' + D.g.length + (D.g.length === 1 ? ' try' : ' tries') + '. Today’s word:' : 'Today’s word was:';
    var h = '<div class="db-end" id="db-end">' + boardHtml(D, n, true)
      + '<p class="db-endh" data-live-prompt="' + esc(head + ' ' + w.w + '.') + '">' + esc(head) + '</p>'
      + '<div class="db-word" aria-label="' + esc(w.w) + '">' + w.w.split('').map(function (ch) { return cellHtml(ch, won ? 'hit' : '', ''); }).join('') + '</div>'
      + (w.p ? '<div class="db-pron">' + esc(w.p) + '</div>' : '')
      + '<div class="db-facts">'
      + (w.d ? '<div class="db-fact"><b>Meaning</b>' + esc(w.d) + '</div>' : '')
      + ((w.o || w.r) ? '<div class="db-fact"><b>Origin</b>' + esc(w.o || '') + (w.o && w.r ? '. ' : '') + esc(w.r || '') + '</div>' : '')
      + (w.s ? '<div class="db-fact"><b>In a sentence</b>' + esc(w.s) + '</div>' : '')
      + nextTime(D, w)
      + '</div>';
    var L = D.lvr;
    if (L && L.dropped) h += '<div class="db-kind">' + esc(L.line || ('Let’s warm up on ' + (LV_NAME[L.level] || 'an easier level') + '. You can move back up any time.')) + '</div>';
    else if (L && L.up) h += '<div class="db-kind">Ready for ' + esc(LV_NAME[L.up] || L.up) + '? <button type="button" class="db-b" data-db="up" style="min-height:36px;margin-left:6px">Try it tomorrow</button></div>';
    return h + '</div>';
  }
  /* a missed day says how to get it next time, from the kit's own reading of the closest try against
     the word (SGUI.missKind — the miss card's note); a try too far off to read says nothing */
  function nextTime(D, w) {
    if (D.won || !D.g.length || !(window.SGUI && typeof SGUI.missKind === 'function')) return '';
    var best = D.g[0], score = -1;
    D.g.forEach(function (g) { var ev = grade(g, D.word), sc = 0; ev.forEach(function (x) { sc += x === 'hit' ? 2 : x === 'near' ? 1 : 0; }); if (sc > score) { score = sc; best = g; } });
    var k = null; try { k = SGUI.missKind(w, best); } catch (e) {}
    if (!k || !k.line || k.k === 'letters') return '';
    return '<div class="db-fact"><b>Next time</b>' + esc((k.label ? k.label + ': ' : '') + k.line) + '</div>';
  }
  function actsHtml(D) {
    var back = '<button type="button" class="db-b" data-db="back" aria-label="Back to Play">' + '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5 8 12l7 7"/></svg>Play</button>';
    var hear = '<button type="button" class="db-b go" data-db="hear">' + ico('volume', 17) + 'Hear it again</button>';
    var right;
    if (D.over && !D.won) right = D.rev ? '<button type="button" class="db-b" data-db="rev" disabled>Added to revision</button>' : '<button type="button" class="db-b" data-db="rev">Add to revision</button>';
    else right = '<button type="button" class="db-b" data-db="slow" aria-label="Hear it slowly">' + (typeof tortoiseSVG === 'function' ? tortoiseSVG(18) : '') + 'Slowly</button>';
    return '<div class="db-acts">' + back + hear + right + '</div>';
  }

  function draw() {
    if (!host || !host.isConnected) return;
    var c = kid(); if (!c) return;
    if (curKid !== c) { curKid = c; cur = ''; msgT = ''; spoke = ''; }
    if (!corpusReady() || !kit()) {
      /* the kit and the corpus are on their way (the 'daily' group); a group that could not load
         (offline, never fetched) is marked done by boot-lazy, and then the screen says so */
      var gone = corpusReady() && !kit();
      host.innerHTML = '<div class="db-wait" data-live-prompt="' + (gone ? 'The Daily Bee needs a connection the first time it opens.' : 'Getting today’s word ready.') + '">'
        + (gone ? '<p class="db-msg">The Daily Bee needs a connection the first time it opens.</p>' : (typeof hiveLoader === 'function' ? hiveLoader('getting today’s word ready…') : '<p class="db-msg">Getting today’s word ready…</p>')) + '</div>';
      if (!gone) { try { SB_LAZY.need('daily', function () { draw(); }); } catch (e) {} }
      return;
    }
    var D = rec(c);
    if (!ensureWord(c, D)) { host.innerHTML = '<div class="db-wrap">' + stage({ hud: hudFor(null), play: '<div class="db-play"><div class="db-msg">No word is ready for today. Try again in a moment.</div>' + actsHtml({ g: [] }) + '</div>', controls: '' }) + '</div>'; wire(); fit(); return; }
    var w = recOf(D.word), n = D.word.length;
    if (curDay !== D.day + '|' + D.word) { curDay = D.day + '|' + D.word; cur = ''; msgT = ''; }
    if (D.over) cur = '';
    var intro = n + ' letters. Listen, then type your first try.';
    var msg = D.over ? '' : (msgT || (D.g.length ? '' : intro));
    var play = '<div class="db-play">' + (D.over ? endHtml(D, w, n)
      : '<div class="db-msg" id="db-msg" data-live-prompt="' + esc(msg) + '">' + esc(msg) + '</div>' + boardHtml(D, n, false)
        + '<div class="db-key" aria-hidden="true"><span>' + SHAPE.hit + ' right place</span><span>' + SHAPE.near + ' in the word</span><span>' + SHAPE.miss + ' not in it</span></div>')
      + actsHtml(D) + '</div>';
    /* "Hear it again" sits right above the keys, at the foot of the play area, so on a phone the keys
       alone are the controls row and it stays in the bottom 38% of the stage */
    var controls = D.over ? '' : '<div class="db-kb" id="db-kb"></div>';
    host.innerHTML = '<div class="db-wrap">' + stage({ hud: hudFor(D), play: play, controls: controls }) + '</div>';
    flipRow = -1; shakeRow = false;
    wire(); keyboard(D); fit(); requestAnimationFrame(function () { if (host && host.isConnected) fit(); });
    /* the word is said when the board first appears after a tap, and once more at the end */
    var sayKey = D.day + '|' + D.word + '|' + (D.over ? 'end' : 'play');
    var tapped = false; try { tapped = !!state.dbeeSpeak; } catch (e) {}
    if (spoke !== sayKey && (tapped || D.over && spoke)) { spoke = sayKey; try { state.dbeeSpeak = 0; } catch (e) {} sayWord(D.word); }
    else if (!spoke) spoke = sayKey;
    try { if (typeof liveScan === 'function') liveScan(host); } catch (e) {}
  }
  var IC_TRY = '<svg viewBox="0 0 20 20" width="18" height="18"><path d="M10 2.6l6.4 3.7v7.4L10 17.4l-6.4-3.7V6.3z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="M10 6.8l2.8 1.6v3.2L10 13.2l-2.8-1.6V8.4z" fill="currentColor"/></svg>';
  var IC_SUN = '<svg viewBox="0 0 20 20" width="18" height="18"><circle cx="10" cy="10" r="3.6" fill="currentColor"/><path d="M10 2.4v2.2M10 15.4v2.2M2.4 10h2.2M15.4 10h2.2M4.6 4.6l1.5 1.5M13.9 13.9l1.5 1.5M15.4 4.6l-1.5 1.5M6.1 13.9l-1.5 1.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
  function hudFor(D) {
    var left = D ? Math.max(0, TRIES - D.g.length) : TRIES, good = D ? goodDays(D) : 0;
    return {
      left: { n: left, t: left === 1 ? 'try left' : 'tries left', ic: IC_TRY },
      center: '<div class="db-title">Daily Bee</div><div class="db-when">' + esc(dateLabel()) + ' · ' + levelChip() + '</div>',
      right: { n: good, t: good === 1 ? 'good day this week' : 'good days this week', ic: IC_SUN }
    };
  }

  /* ------------------------------------------------------------------ input */
  function input(k, src) {
    var t = (window.performance && performance.now) ? performance.now() : 0;
    /* the engine kit's keyboard may hear the real keyboard too: one key press is one letter */
    if (lastIn.k === k && lastIn.s !== src && t - lastIn.t < 40) return;
    lastIn = { k: k, t: t, s: src };
    var c = kid(); if (!c) return; var D = rec(c); if (!D.word || D.over) return;
    if (k === 'enter') return submit(c, D);
    if (k === 'back') { cur = cur.slice(0, -1); return paintCur(D); }
    if (/^[a-z]$/.test(k) && cur.length < D.word.length) { cur += k; paintCur(D); }
  }
  function paintCur(D) {
    var row = host && host.querySelector('.db-grid:not(.db-mini) .db-row[data-r="' + D.g.length + '"]'); if (!row) return draw();
    var cells = row.querySelectorAll('.db-cell');
    for (var i = 0; i < cells.length; i++) { var ch = cur[i] || ''; if (cells[i].textContent !== ch) { cells[i].textContent = ch; cells[i].className = 'db-cell cur' + (ch ? ' fill' : ''); cells[i].setAttribute('aria-label', ch ? ch.toUpperCase() : 'empty'); } }
  }
  function say(t) { msgT = t; var m = host && host.querySelector('#db-msg'); if (m) { m.textContent = t; m.setAttribute('data-live-prompt', t); } live(t); }
  function submit(c, D) {
    var n = D.word.length;
    if (cur.length < n) { shakeRow = true; say(n + ' letters, please.'); var row = host && host.querySelector('.db-grid:not(.db-mini) .db-row[data-r="' + D.g.length + '"]'); if (row) { row.classList.remove('shake'); void row.offsetWidth; row.classList.add('shake'); } return; }
    var g = cur; cur = ''; D.g.push(g); flipRow = D.g.length - 1;
    var ev = grade(g, D.word), hits = ev.filter(function (x) { return x === 'hit'; }).length, nears = ev.filter(function (x) { return x === 'near'; }).length;
    if (g === D.word) D.won = 1;
    if (D.won || D.g.length >= TRIES) finish(c, D);
    else { msgT = 'Try ' + D.g.length + ': ' + hits + ' in the right place, ' + nears + ' in the word. ' + (TRIES - D.g.length) + ' left.'; try { if (typeof save === 'function') save(); } catch (e) {} }
    draw();
  }
  /* THE END: pay once when solved (never for a miss, never for finishing), the level's round
     score once a day, the day recorded for "good days this week" */
  function finish(c, D) {
    D.over = 1; msgT = '';
    if (D.won && !D.paid) { D.paid = 1; try { D.coins = typeof payG === 'function' ? payG(null) : (typeof addCoins === 'function' ? addCoins('answer') : 0); } catch (e) {} }
    D.days[D.day] = { s: D.won ? 1 : 0, t: D.g.length };
    var ks = Object.keys(D.days).sort(); if (ks.length > 60) ks.slice(0, ks.length - 60).forEach(function (k) { delete D.days[k]; });
    if (!D.lv) { D.lv = 1;
      try { if (window.SB_LEVEL && typeof SB_LEVEL.after === 'function') { var r = SB_LEVEL.after(KEY, D.won ? 1 : 0) || {}; D.lvr = { dropped: !!r.dropped, level: r.level || '', line: r.line || '', up: r.offerUp ? (typeof r.offerUp === 'string' ? r.offerUp : nextUp(r.level)) : '' }; } } catch (e) {} }
    try { if (typeof sfx === 'function') sfx(D.won ? 'win' : 'level'); } catch (e) {}
    try { if (typeof logActivity === 'function') logActivity('daily', 'Daily Bee', { done: 1, right: D.won ? 1 : 0, coins: D.coins || 0 }, []); } catch (e) {}
    try { if (typeof save === 'function') save(); } catch (e) {}
  }
  function nextUp(l) { var o = ['easy', 'medium', 'hard', 'champ']; var i = o.indexOf(l); return i >= 0 && i < 3 ? o[i + 1] : ''; }
  function act(a) {
    var c = kid(); var D = c ? rec(c) : null;
    if (a === 'back') { try { app.openGames(); } catch (e) {} return; }
    if (!D || !D.word) return;
    if (a === 'hear') return sayWord(D.word);
    if (a === 'slow') return sayWord(D.word, true);
    if (a === 'rev' && D.over && !D.won && !D.rev) { try { addMiss(recOf(D.word), 'mark'); } catch (e) {} D.rev = 1; try { save(); } catch (e) {} live('Added to your revision pile.'); return draw(); }
    if (a === 'up' && D.lvr && D.lvr.up) { try { SB_LEVEL.set(KEY, D.lvr.up); } catch (e) {} D.lvr.up = ''; try { save(); } catch (e) {} return draw(); }
  }
  function wire() {
    if (!host) return;
    host.onclick = function (e) {
      var b = e.target.closest && e.target.closest('[data-db],[data-k]'); if (!b || !host.contains(b) || b.disabled) return;
      if (b.hasAttribute('data-db')) return act(b.getAttribute('data-db'));
      input(b.getAttribute('data-k'), 'tap');
    };
  }
  function keyboard(D) {
    if (keysApi) { try { keysApi.destroy(); } catch (e) {} keysApi = null; }
    var kb = host && host.querySelector('#db-kb'); if (!kb || D.over) return;
    /* the kit's keys: drawn on a touch screen only (the alphabet below 480px), and told not to hear the
       real keyboard itself — onKey below is the one physical path, with the board's own guards */
    try {
      keysApi = SGUI.keys(kb, { physical: false,
        onKey: function (ch) { if (!quiet()) input(lc(ch), 'kit'); },
        onBack: function () { if (!quiet()) input('back', 'kit'); },
        onEnter: function () { if (!quiet()) input('enter', 'kit'); }
      });
      tintKit(kb, D);
    } catch (e) { keysApi = null; }
  }
  /* the kit's keyboard learns the board's shapes too, by its letter keys' own text */
  function tintKit(kb, D) {
    var ks = keyState(D);
    [].forEach.call(kb.querySelectorAll('button'), function (b) { var t = lc((b.textContent || '').trim()); if (t.length !== 1 || !ks[t]) return;
      b.classList.add('db-k-' + ks[t]); b.setAttribute('aria-label', t.toUpperCase() + ', ' + SAYS[ks[t]]);
      if (!b.querySelector('.db-sh')) b.insertAdjacentHTML('beforeend', '<i class="db-sh" aria-hidden="true">' + SHAPE[ks[t]] + '</i>'); });
  }
  /* the board takes keys only while it IS the screen, with nothing open over it and nothing typed
     into a field (the top bar's search box sits right above it) */
  function quiet() {
    try { if (typeof state !== 'undefined' && (state.nav !== 'daily' || state.pinDlg || state.settingsOpen || state.drawerOpen || state.walletOpen || state.famMenu)) return true; } catch (x) {}
    var a = document.activeElement;
    return !!(a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.tagName === 'SELECT' || a.isContentEditable));
  }
  function onKey(e) {
    if (!host || !host.isConnected || quiet()) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target, k = e.key;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
    /* Enter on a focused control (Back, a tab, Hear it again) presses that control, not the word */
    if (k === 'Enter' && t && t.closest && t.closest('button,a,[role="button"]')) return;
    if (/^[a-zA-Z]$/.test(k)) input(k.toLowerCase(), 'phys');
    else if (k === 'Backspace') { e.preventDefault(); input('back', 'phys'); }
    else if (k === 'Enter') { e.preventDefault(); input('enter', 'phys'); }
  }

  /* ------------------------------------------------------------------ the board fits the stage */
  /* The kit fits the stage between the shell bar and the tab bar (stageFit); the board's cell is then
     the largest that fits the play column both ways — eight letters still fit a 390px phone. Measured
     after the kit has fitted the stage, and again on resize. */
  function fit() {
    try { if (window.SGUI && SGUI.stageFit) SGUI.stageFit(); } catch (e) {}
    try {
      var grid = host && host.querySelector('.db-grid:not(.db-mini)'), play = grid && grid.parentElement;
      if (grid && play) {
        var n = +(grid.style.getPropertyValue('--n')) || 5, gap = 6;
        var cs = getComputedStyle(play), pw = play.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        var used = 0; [].forEach.call(play.children, function (ch) { if (ch !== grid) used += ch.offsetHeight + parseFloat(getComputedStyle(ch).marginTop) + parseFloat(getComputedStyle(ch).marginBottom); });
        var ph = play.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - used;
        var cell = Math.floor(Math.min(84, (pw - (n - 1) * gap) / n, (ph - (TRIES - 1) * gap) / TRIES));
        grid.style.setProperty('--cell', Math.max(26, cell) + 'px');
      }
    } catch (e) {}
    if (!sizeOn) { sizeOn = true; window.addEventListener('resize', function () { if (host && host.isConnected) requestAnimationFrame(fit); }); }
  }

  /* ------------------------------------------------------------------ the shell's door */
  function mount(el) {
    if (!el) return;
    if (!document.getElementById('db-css')) { var st = document.createElement('style'); st.id = 'db-css'; st.textContent = css; document.head.appendChild(st); }
    host = el;
    if (!keyOn) { document.addEventListener('keydown', onKey); keyOn = true; }
    draw();
  }
  /* leaving the screen lets the keyboard go; the letters being typed wait for the child to come back */
  function close() { if (keysApi) { try { keysApi.destroy(); } catch (e) {} keysApi = null; } host = null; }
  /* the old entry point: opening it is going there */
  function open() { try { if (typeof app !== 'undefined' && app.openDailyBee) { app.openDailyBee(); return; } } catch (e) {} }
  function doneToday(c) { var D = c && c.dbee; return !!(D && D.day === today() && D.over); }
  window.SB_DAILY = { open: open, close: close, mount: mount, doneToday: doneToday };
  /* for the tests and the foundations: the pure pick, the grade, and how long today's word is */
  window.SB_DBEE = { pick: pick, grade: grade, band: function (c, l) { return bandFor(c || kid(), l || levelNow()); }, fits: fits, shapes: SHAPE,
    len: function () { var c = kid(), D = c && c.dbee; return D && D.day === today() && D.word ? D.word.length : 0; } };
})();
