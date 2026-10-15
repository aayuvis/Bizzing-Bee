/* circuit.js — THE BEE CIRCUIT'S CORE (circuit/BEE-CIRCUIT.md §3–§9, build steps 2, 4, 5; AMENDMENTS.md overrides).

   A spelling season told on top of the Word Atlas. This file is the season's STATE, its MAIL and the HIVE POST that
   shows it. The halls (trail.js), the cases (SB_CIRCUIT_CASES) and Team Night's mode (mockbee.js) are other files;
   they call in here, always guarded (`window.SB_CIRCUIT && …`) after lazyNeed('circuit'). Lazy: boot-lazy group
   `circuit` = circuit-data.js (window.SB_CIRCUIT_DATA, GENERATED from circuit/script.json by
   tools/circuit/build-data.cjs) + this file. Nothing of it is on the first screen.

   THE RULES IT KEEPS (each has a test: tests/circuit-*.cjs)
     - Story text comes ONLY from SB_CIRCUIT_DATA, at the path it has in the script. This file writes no story line;
       its own words are chrome (a tab's name, "Read aloud", "Next"). A {slot} is filled from the child's own bee
       file, frozen when the piece is delivered, and falls back to the script's own fallback: never a raw token.
     - L2: mail never expires, and nothing here locks a stop, a region, a game or a word. Halls wait on halls
       (build rule story-order), which is a story beat waiting on a story beat.
     - L6: above/below letters are chosen by the child's place against the headliner; nothing else depends on it.
     - L7: no free text anywhere — every choice (the turn, the board's pins, the accusation, the closing reply) is a
       pre-written line. There is no text input in this file.
     - L9: every Hive Post page carries the fiction line.
     - L11: nothing here pays. Mail, visitors, stamps and finishing pay nothing (no addCoins in this file).
     - Per child (c.circuit, store.js step v11_to_v12), saved only through app3's save() → SB_STORE; ?demo
       (window.SB_DEMO) writes nothing at all. Nothing is transmitted (supabase-sync's allow-list does not carry it).
     - No Math.random: every choice here is the child's or the script's.
     - Keyboard AND touch: every control is a <button>; Esc, ← and → work in the reader and on the moment card.

   THE API (window.SB_CIRCUIT) — the contract the other Circuit builds call
     state(c)                  the child's record, made if missing (written only when a hook saves)
     onHallOpen(act)           a hall's pin first shows (leg 4 reached, hallUnlocked true): its invitation and programme
     onHall(act, r)            a hall's result. r = {place, of, words:[{w, ok, asks?}], missed:[w], replay,
                               above? (bool: the child finished above the headliner), headPlace?, asked?, asks?,
                               spelled?, lastMissed?} — asks per word as a count or the Chair's request list, or
                               r.asked = [{w, ok, asks:[…]}] (mockbee's g.mine); r.asked/r.asks as a bare total.
                               Records halls[act], delivers the round's story mail (story order), the bee file, the
                               stamp, and makes the case whose `after` is this round available.
     onTeamNight(r)            r = {place, of, words:[{w, ok, asks?}], calls:{right, of}, replay, levelMiss?, lectern?, band?}
     onRegionDone(act)         the guide's postcard (three of the child's own words from that region's stops)
     onLevelUp(level)          a diary line
     boardExtras(act)          HTML a region board drops in its overlay: the envelope (mail waiting; no count) and the
                               cases' pins (SB_CIRCUIT_CASES.pins). Also where a waiting moment card is shown.
     mailWaiting(c)            any unread mail
     open(tab, unitId?)        opens the Hive Post: 'mail' | 'board' | 'visitors' | 'stamps' (visitors + a stop: that
                               stop's visitor first) — openVisitor(unitId) is the same for a stop card's Visitor line
     hallFiled(act, c?)        the Mock Bee recap filed this hall's misses: its latest bee file reads "On your revision pile"
     line(path)                a line by its path in the data, slots filled with the script's fallbacks
     visitorFor(unitId)        the Stop Visitor standing at an Atlas stop, or null (§10)
     caseState(c, id)          a case's record {state:'unseen'|'open'|'solved', hints} or null (not yet available)
     caseUpdate(c, id, patch)  the cases build writes {state, hints} through here
     caseLate(c, id)           the case is opened after its next round's mail: open with its lateLine
     hallUnlocked(act, c)      story order: Round N waits on Round N−1's mail ('team' waits on Round IX's)
     teamOpen(c)               Team Night may open (Round IX's mail is in)
     accuseOpen(c)             the accusation may be made (Round IX's mail is in, V. not yet named)
     chip(c)                   the Atlas chip's words (Season 1, or Season 2: Ravenmere once the coda is in)
     keys()                    every on-screen line's path in SB_CIRCUIT_DATA (test 8)
     act(arg)                  the Hive Post's actions (app3-me.js `hivePost` hands them here)
     postHTML(c)               the Hive Post tab (app3-me.js viewCollection draws it) */
(function () {
  'use strict';
  const D = () => window.SB_CIRCUIT_DATA || null;
  const SUSPECTS = ['vesper', 'pronouncer', 'ratchet', 'dax', 'vale'];
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
  const FACE = { vesper: 'goldlegend', dax: 'comet' };   // the portraits that have a rival's face (mockbee.js BOTS ids)

  /* ---------------------------------------------------------------- app3, read at call time (a node test runs this
     file in a vm with stubs; in the page these are app3.js's own top-level names) */
  const kid = () => { try { return typeof active === 'function' ? active() : null; } catch (e) { return null; } };
  const persist = () => { if (window.SB_DEMO) return; try { if (typeof save === 'function') save(); } catch (e) {} };
  const redraw = () => { try { if (typeof render === 'function') render(); } catch (e) {} };
  const speak = (t) => { try { if (typeof say === 'function') say(t); } catch (e) {} };
  const H = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const now = () => Date.now();
  const ordinal = (n) => { n = +n || 0; const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
  const cap = (s) => String(s || '').replace(/^\w/, (m) => m.toUpperCase());
  const lc = (w) => String(w || '').toLowerCase().trim();

  /* a line by its path in the data: rounds[1].pieces.v, teamNight.beats.drama.8-10, turn.notes[2] */
  function at(path) { let cur = D(); for (const k of String(path).replace(/\[(\d+)\]/g, '.$1').split('.')) { if (cur == null) return undefined; cur = cur[k]; } return cur; }

  /* ---------------------------------------------------------------- the record (§3.3) */
  function blank() {
    return { v: 1, season: 1, halls: {}, cases: {}, mail: [], board: { suspects: { vesper: [], pronouncer: [], ratchet: [], dax: [], vale: [] }, accused: null }, dax: { helped: null }, closing: null };
  }
  const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
  function norm(o) {
    if (o.v == null) o.v = 1; if (o.season == null) o.season = 1;
    if (!isObj(o.halls)) o.halls = {}; if (!isObj(o.cases)) o.cases = {};
    if (!Array.isArray(o.mail)) o.mail = [];
    if (!isObj(o.board)) o.board = { suspects: {}, accused: null };
    if (!isObj(o.board.suspects)) o.board.suspects = {};
    SUSPECTS.forEach((s) => { if (!Array.isArray(o.board.suspects[s])) o.board.suspects[s] = []; });
    if (!('accused' in o.board)) o.board.accused = null;
    if (!isObj(o.dax)) o.dax = { helped: null }; if (!('helped' in o.dax)) o.dax.helped = null;
    if (!('closing' in o)) o.closing = null;
    return o;
  }
  function rec(c) { if (!c || typeof c !== 'object') return null; if (!isObj(c.circuit)) c.circuit = blank(); return norm(c.circuit); }

  /* ---------------------------------------------------------------- mail */
  const has = (o, key) => o.mail.some((m) => m && m.key === key);
  function deliver(o, key, d) { if (has(o, key)) return false; const m = { key, at: now(), read: false }; if (d && Object.keys(d).length) m.d = d; o.mail.push(m); return true; }
  const P = (i, k) => 'rounds[' + i + '].pieces.' + k;
  const rounds = () => (D() ? D().rounds : []);
  const RIX = (act) => rounds().findIndex((r) => r.act === act);
  const storyDone = (o, n) => n < 1 || has(o, P(n - 1, 'cliff'));          // Round n's story mail is in
  const teamDone = (o) => has(o, 'teamNight.beats.daxPostcard');
  const solved = (o) => has(o, 'accusation.closingLetter');

  /* ---------------------------------------------------------------- the child's bee file → the slots (build[id=slots]) */
  const askN = (a) => (Array.isArray(a) ? a.length : typeof a === 'number' && isFinite(a) ? a : null);
  /* a hall's log, from what the hall reports. Per-word requests come as words[].asks (a count or the Chair's request
     list) or as r.asked = [{w, ok, asks:[…]}] (mockbee's g.mine); the slot counts them the script's way, the sum of
     asks.length (build[id=slots]); a bare total (r.asked or r.asks, a number) is used only when no word carries its own */
  function hallLog(r) {
    r = r || {};
    const per = Array.isArray(r.asked) ? r.asked : [];
    const words = (Array.isArray(r.words) ? r.words : []).filter((x) => x && x.w).map((x, j) => {
      let a = askN(x.asks);
      if (a == null) { const p = per[j] && per[j].w === x.w ? per[j] : per.find((y) => y && y.w === x.w); if (p) a = askN(p.asks); }
      return { w: String(x.w), ok: !!x.ok, asks: a };
    });
    for (const w of Array.isArray(r.missed) ? r.missed : []) if (w && !words.some((x) => !x.ok && x.w === String(w))) words.push({ w: String(w), ok: false, asks: null });
    const known = words.filter((x) => x.asks != null);
    const asked = known.length ? known.reduce((t, x) => t + x.asks, 0) : typeof r.asked === 'number' ? r.asked : typeof r.asks === 'number' ? r.asks : null;
    const miss = words.filter((x) => !x.ok);
    const log = { words, asked, beat: miss.length ? miss[miss.length - 1].w : (typeof r.lastMissed === 'string' && r.lastMissed) || null };
    if (typeof r.spelled === 'string' && r.spelled) log.spelled = r.spelled;
    return log;
  }
  const diff = (w) => { try { return window.SB_TRICK ? SB_TRICK.diff({ w }) : String(w).length; } catch (e) { return String(w).length; } };
  const trickCls = (w) => { try { return window.SB_TRICK ? SB_TRICK.anal({ w }).cls : null; } catch (e) { return null; } };
  /* a missed word's family: 'noask' when the child asked the Chair nothing on it; else its trick family; never 'plain' */
  function famOf(x) {
    const fams = ((D().slotLines || {}).weak || {}).byFamily || {};
    if (x.asks === 0) return 'noask';
    const f = trickCls(x.w); return f && f !== 'plain' && fams[f] ? f : null;
  }
  /* {weak}: every Circuit hall played so far, each missed word once; the most frequent named family, a tie to the most
     recent; none → null (the line prints its round's fallback, which is advice, never a diagnosis) */
  function weakFamily(o, extra) {
    const seen = new Set(), count = {}, last = {}; let t = 0;
    const logs = o.mail.filter((m) => /^bee\./.test(m.key) && m.d && Array.isArray(m.d.words)).map((m) => m.d.words);
    if (extra) logs.push(extra);
    for (const ws of logs) for (const x of ws) {
      if (x.ok) continue; const k = lc(x.w); if (seen.has(k)) continue; seen.add(k); t++;
      const f = famOf(x); if (!f) continue; count[f] = (count[f] || 0) + 1; last[f] = t;
    }
    let best = null; for (const f in count) if (!best || count[f] > count[best] || (count[f] === count[best] && last[f] > last[best])) best = f;
    return best;
  }
  /* the value a slot prints, or null for the script's fallback */
  function slotValue(name, o, log) {
    if (name === 'asked') return log && log.asked != null ? String(log.asked) : null;
    if (name === 'missed') return log && log.beat ? log.beat : null;
    if (name === 'spelled') { if (log && log.spelled) return log.spelled; const ok = log ? log.words.filter((x) => x.ok) : []; if (!ok.length) return null;
      return ok.slice().sort((a, b) => diff(b.w) - diff(a.w) || (a.w < b.w ? -1 : 1))[0].w; }
    if (name === 'weak') { const f = weakFamily(o, log && log.words); return f ? D().slotLines.weak.byFamily[f] : null; }
    return null;
  }
  const tokens = (s) => [...String(s || '').matchAll(/\{([A-Za-z0-9]+)\}/g)].map((m) => m[1]);
  function freeze(o, path, log) { const d = {}; for (const t of tokens(at(path))) { const v = slotValue(t, o, log); if (v != null) d[t] = v; } return d; }
  /* fill a line: the frozen value, else the script's fallback for this path — a raw {token} never reaches the screen */
  function fill(s, d, path) {
    const slots = (D().rules || {}).slots || {};
    return String(s == null ? '' : s).replace(/\{([A-Za-z0-9]+)\}/g, (m, name) => {
      if (d && d[name] != null) return d[name];
      if (name === 'weak') { const n = (String(path).match(/^rounds\[(\d+)\]/) || [])[1]; const fb = n != null && D().slotLines.weak.byRound[+n + 1]; if (fb) return fb; }
      const fb = (slots[name] || {}).fallback;
      if (typeof fb === 'string' && !/^None\b/.test(fb)) return fb.replace(/\s*\(.*$/, '').trim();
      if (fb && typeof fb === 'object' && fb[path]) return fb[path];
      return '';
    });
  }

  /* ---------------------------------------------------------------- above or below (L6, build[id=no-placing]) */
  function aboveOf(r) {
    if (!r) return false;
    if (typeof r.above === 'boolean') return r.above;
    if (r.headPlace != null && r.place != null) return +r.place < +r.headPlace;
    return +r.place === 1;
  }

  /* ---------------------------------------------------------------- the story mail, in story order */
  const DEFAULT_ORDER = ['inv', 'prog', 'drama', 'laugh', 'suspense', 'LETTER', 'v', 'dax', 'beeFileFakeTip', 'pip', 'cliff', 'clue', 'clue2'];
  const R8 = ['inv', 'prog', 'drama', 'dax', 'laugh', 'suspense', 'TURN', 'LETTER', 'APOLOGIES', 'v', 'pip', 'cliff', 'clue'];
  const R9 = ['inv', 'prog', 'drama', 'laugh', 'dax', 'suspense', 'LETTER', 'v', 'pip', 'cliff', 'clue'];
  function orderOf(i) {
    const r = rounds()[i];
    if (r.order) { const o = r.order.map((k) => (k === 'above' || k === 'below' ? 'LETTER' : k)).filter((k, j, a) => a.indexOf(k) === j); if (r.pieces.clue2 && o.indexOf('clue2') < 0) o.push('clue2'); return o; }
    return i === 7 ? R8 : i === 8 ? R9 : DEFAULT_ORDER;
  }
  function deliverOpen(o, i) { deliver(o, P(i, 'inv')); deliver(o, P(i, 'prog')); }
  function deliverStory(o, i, last) {
    const r = rounds()[i]; const log = last && last.log;
    for (const k of orderOf(i)) {
      if (k === 'LETTER') { const p = P(i, last && last.above ? 'above' : 'below'); deliver(o, p, freeze(o, p, log)); continue; }
      if (k === 'TURN') { ['turn.scene', 'turn.kwame', 'turn.dax', 'turn.notes'].forEach((p) => deliver(o, p)); continue; }
      if (k === 'APOLOGIES') { (D().turn.apologies || []).forEach((_, j) => deliver(o, 'turn.apologies[' + j + ']')); continue; }
      if (r.pieces[k] == null) continue;
      const p = P(i, k); deliver(o, p, freeze(o, p, log));
    }
    /* the case whose trigger this round is: its pin appears after this round's mail (story order) */
    (D().cases || []).forEach((cs) => { if (cs.after === i + 1 && !o.cases[cs.id]) o.cases[cs.id] = { state: 'unseen', hints: 0 }; });
  }
  const TN_BEATS = ['captaincy', 'idea', 'ravenmere', 'callRules', 'DRAMA', 'LEVEL', 'finalWord', 'after', 'daxPostcard'];
  const TN_HELD = ['sting', 'stingAfter', 'mei', 'coda'];   // story-order holds sting + stingAfter; Mei and the coda follow them
  function bandOf(c, r) {
    if (r && /^(8-10|11-15)$/.test(r.lectern || '')) return r.lectern;   /* the lectern Team Night seated (mockbee's g.lect) */
    if (r && /^(6-7|8-10|11-15)$/.test(r.band || '')) return r.band === '6-7' ? '8-10' : r.band;
    const k = c && c.ageBand; if (k === '11-13' || k === '14-18') return '11-15'; if (k === '5-7' || k === '8-10') return '8-10';
    return (+(c && c.age) || 9) >= 11 ? '11-15' : '8-10';
  }
  function deliverTeam(o, last) {
    const B = D().teamNight.beats, base = 'teamNight.beats.';
    for (const k of TN_BEATS) {
      if (k === 'DRAMA') { deliver(o, base + 'drama.' + (last.band || '8-10')); continue; }
      if (k === 'LEVEL') { deliver(o, base + (last.levelMiss ? 'levellingMiss' : 'levelling')); continue; }
      if (Array.isArray(B[k])) B[k].forEach((_, j) => deliver(o, base + k + '[' + j + ']'));
      else if (B[k] != null) deliver(o, base + k);
    }
  }
  function deliverHeld(o) { TN_HELD.forEach((k) => deliver(o, 'teamNight.beats.' + k)); }
  /* everything owed and allowed now, in story order: a hall played out of order waits for the one before it, Team
     Night waits for Round IX, and its held lines wait for the accusation's closing letter */
  function cascade(o) {
    let moved = true;
    while (moved) {
      moved = false;
      rounds().forEach((r, i) => {
        const h = o.halls[r.act];
        if (h && h.done && !storyDone(o, i + 1) && storyDone(o, i)) { deliverOpen(o, i); deliverStory(o, i, h.first || h.last); moved = true; }
      });
      const t = o.halls.team;
      if (t && t.done && !teamDone(o) && storyDone(o, rounds().length)) { deliverTeam(o, t.first || t.last || {}); moved = true; }
      if (teamDone(o) && solved(o) && !has(o, 'teamNight.beats.sting')) { deliverHeld(o); moved = true; }
    }
  }

  /* ---------------------------------------------------------------- the bee file (§9) and the stamp */
  function beeKey(o, hall) { let k = 1; while (has(o, 'bee.' + hall + '.' + k)) k++; return 'bee.' + hall + '.' + k; }
  function beeData(hall, r, log) {
    const d = { hall, place: +r.place || 0, of: +r.of || 0, words: log.words, asked: log.asked, beat: log.beat };
    if (r.calls && isFinite(+r.calls.of)) d.calls = { right: +r.calls.right || 0, of: +r.calls.of || 0 };
    return d;
  }
  /* halls[hall] = {done, best, last} (§3.3) + `first`: the first result with what its story needs (the letter, the slots,
     Team Night's band and levelling), kept so a hall played out of order can deliver its story later from it */
  function recordHall(o, hall, r, extra) {
    const res = { place: +r.place || 0, of: +r.of || 0, at: now() };
    const h = o.halls[hall];
    if (!h || !h.done) { o.halls[hall] = { done: res.at, best: { place: res.place, of: res.of }, last: res, first: Object.assign({}, res, extra || {}) }; return true; }
    h.last = res;
    if (!h.best || (res.place > 0 && (!h.best.place || res.place < h.best.place))) h.best = { place: res.place, of: res.of };
    return false;
  }

  /* ---------------------------------------------------------------- moments (a card over the board, §3.1) */
  const moments = [];
  const kidTag = () => { try { return (typeof state === 'object' && state ? (state.activeIdx || 0) : 0) + '|' + ((kid() || {}).name || ''); } catch (e) { return ''; } };
  function queueMoment(h, line) { moments.push({ h, line, who: kidTag() }); }

  /* ================================================================ THE HOOKS */
  function onHallOpen(act) {
    const c = kid(), o = rec(c); const i = RIX(act); if (!o || i < 0 || !hallUnlocked(act, c)) return false;
    const n = o.mail.length; deliverOpen(o, i); if (o.mail.length !== n) persist(); return o.mail.length !== n;
  }
  function onHall(act, r) {
    const c = kid(), o = rec(c); const i = RIX(act); if (!o || i < 0) return null;
    r = r || {};
    const log = hallLog(r);
    const first = recordHall(o, act, r, { above: aboveOf(r), log });
    if (hallUnlocked(act, c)) deliverOpen(o, i);       // the invitation and programme come first, if the pin's hook was missed
    cascade(o);                                          // the story, if story order allows it now
    deliver(o, beeKey(o, act), beeData(act, r, log));
    deliver(o, 'stamp.' + act);
    queueMoment(cap(rounds()[i].venue), 'New mail in the Hive Post.');
    persist();
    return { first, story: storyDone(o, i + 1) };
  }
  function onTeamNight(r) {
    const c = kid(), o = rec(c); if (!o || !D()) return null;
    r = r || {};
    const log = hallLog(r);
    const words = log.words, lastWord = words[words.length - 1];
    const levelMiss = typeof r.levelMiss === 'boolean' ? r.levelMiss : !!(lastWord && !lastWord.ok);
    const first = recordHall(o, 'team', r, { band: bandOf(c, r), levelMiss, log });
    cascade(o);
    deliver(o, beeKey(o, 'team'), beeData('team', r, log));
    deliver(o, 'stamp.team');
    queueMoment('Team Night', 'New mail in the Hive Post.');
    persist();
    return { first, story: teamDone(o) };
  }
  /* the guide's postcard: three of the child's own words, spelled right, from that region's stops (§9; the slot rule
     w1–w3 — printed exactly as the stop list spells them; sent only when three exist) */
  const pendingRegions = new Set();
  function regionWords(c, act) {
    const T = (window.SB_TRAIL && SB_TRAIL.honey) || (window.SB_TRAIL_HOME && SB_TRAIL_HOME.honey) || null;
    const M = window.SB_TRAIL_MAP; if (!T || !M) return null;
    const a = (T.acts || []).find((x) => x.id === act); if (!a) return [];
    const mast = (c && c.mast) || {}; const out = [], seen = new Set();
    a.units.forEach((u, ui) => Object.keys(M[u] || {}).sort().forEach((b) => (M[u][b] || []).forEach((w, wi) => {
      const k = lc(w), m = Object.prototype.hasOwnProperty.call(mast, k) ? mast[k] : null;
      if (!m || !(m.ok > 0) || m.leg || seen.has(k)) return; seen.add(k); out.push({ w: String(w), at: +m.at || 0, o: ui * 1e6 + wi });
    })));
    return out.sort((x, y) => y.at - x.at || x.o - y.o).slice(0, 3).map((x) => x.w);
  }
  function postcard(c, act) {
    const o = rec(c); const key = 'hivePost.postcards.' + act; if (!o || !D() || !D().hivePost.postcards[act] || has(o, key)) return false;
    const ws = regionWords(c, act);
    if (ws == null) { pendingRegions.add(act); if (typeof window.SB_TRAIL_NEEDMAP === 'function') { try { window.SB_TRAIL_NEEDMAP(() => { if (pendingRegions.has(act) && kid() === c) { pendingRegions.delete(act); if (postcard(c, act)) { queueMoment('A postcard', 'New mail in the Hive Post.'); persist(); } } }); } catch (e) {} } return false; }
    if (ws.length < 3) return false;
    pendingRegions.delete(act);
    deliver(o, key, { w1: ws[0], w2: ws[1], w3: ws[2] });
    return true;
  }
  function onRegionDone(act) {
    const c = kid(); if (!rec(c)) return false;
    const sent = postcard(c, act);
    if (sent) { queueMoment('A postcard', 'New mail in the Hive Post.'); persist(); }
    return sent;
  }
  function onLevelUp(level) {
    const c = kid(), o = rec(c); level = Math.floor(+level); if (!o || !D() || !(level > 1)) return false;
    const key = 'diary.' + level; if (has(o, key)) return false;
    deliver(o, key); queueMoment('Level ' + level, diaryLine(level)); persist(); return true;
  }
  const diaryLine = (level) => { const L = D().hivePost.diary; return L[((level - 2) % L.length + L.length) % L.length]; };

  /* ================================================================ QUESTIONS THE OTHER BUILDS ASK */
  function hallUnlocked(act, c) {
    const o = rec(c || kid()); if (!o || !D()) return false;
    if (act === 'team') return storyDone(o, rounds().length);
    const i = RIX(act); return i >= 0 && storyDone(o, i);
  }
  const teamOpen = (c) => hallUnlocked('team', c);
  function accuseOpen(c) { const o = rec(c || kid()); return !!o && !!D() && storyDone(o, rounds().length) && !solved(o); }
  function chip(c) { const o = rec(c || kid()); return o && has(o, 'teamNight.beats.coda') ? 'The Bee Circuit · Season 2: Ravenmere' : 'The Bee Circuit · Season 1'; }
  function caseState(c, id) { const o = rec(c || kid()); return (o && o.cases[id]) || null; }
  /* the cases build keeps its own small record beside state and hints (where a child is in a case, what was tried,
     dismissed…). Kept as plain JSON, a field at a time: a name of letters and digits, never a string longer than
     CASE_STR (no child writes free text, so nothing longer can be one), the whole record under CASE_MAX. */
  const CASE_STR = 64, CASE_MAX = 4096, CASE_KEY = /^[a-zA-Z][a-zA-Z0-9_]{0,23}$/;
  function caseSafe(v) {
    if (v === null || typeof v === 'boolean') return true;
    if (typeof v === 'number') return isFinite(v);
    if (typeof v === 'string') return v.length <= CASE_STR;
    if (Array.isArray(v)) return v.every(caseSafe);
    if (typeof v === 'object') return Object.keys(v).every((k) => k.length <= 24 && !/^(__proto__|constructor|prototype)$/.test(k) && caseSafe(v[k]));
    return false;
  }
  function caseUpdate(c, id, patch) {
    c = c || kid(); const o = rec(c); if (!o || !D() || !(D().cases || []).some((x) => x.id === id)) return null;
    const cur = o.cases[id] || { state: 'unseen', hints: 0 }, was = cur.state;
    if (patch && /^(unseen|open|solved)$/.test(patch.state || '') && !(was === 'solved' && patch.state !== 'solved')) cur.state = patch.state;
    if (patch && isFinite(+patch.hints) && patch.hints != null) cur.hints = Math.max(0, Math.floor(+patch.hints));
    if (patch && typeof patch === 'object') Object.keys(patch).forEach((k) => {
      if (k === 'state' || k === 'hints' || !CASE_KEY.test(k) || /^(constructor|prototype)$/.test(k)) return;
      const v = patch[k]; if (v === undefined || !caseSafe(v)) return;
      const was1 = cur[k]; cur[k] = JSON.parse(JSON.stringify(v));
      if (JSON.stringify(cur).length > CASE_MAX) { if (was1 === undefined) delete cur[k]; else cur[k] = was1; }
    });
    o.cases[id] = cur;
    if (was !== 'solved' && cur.state === 'solved') { const cs = D().cases.find((x) => x.id === id); queueMoment(cs.title, 'Solved.'); }
    persist(); return cur;
  }
  function caseLate(c, id) { const o = rec(c || kid()); const cs = D() && D().cases.find((x) => x.id === id); return !!(o && cs && storyDone(o, cs.after + 1)); }
  function visitorFor(unitId) { const d = D(); if (!d) return null; const i = d.visitorAt[unitId]; return i == null ? null : d.visitors[i]; }
  /* the Mock Bee recap's "Add missed words to revision" filed this hall's misses: its latest bee file says so */
  function hallFiled(act, c) {
    const o = rec(c || kid()); if (!o) return false;
    for (let i = o.mail.length - 1; i >= 0; i--) { const m = o.mail[i]; if (m.key.indexOf('bee.' + act + '.') === 0) { m.d = Object.assign({}, m.d, { filed: 1 }); persist(); return true; } }
    return false;
  }
  /* a line by its path, its slots filled with the script's fallbacks (the halls and Team Night announce from these) */
  function line(path) { const v = at(path); return typeof v === 'string' ? fill(v, null, path) : ''; }
  function mailWaiting(c) { const o = rec(c || kid()); return !!o && o.mail.some((m) => m && !m.read); }

  /* every on-screen line's path (test 8): the strings the app can show, by their place in the data */
  /* machine fields (ids, acts, keys, enum values, the rules) are data, not lines */
  const MACHINE = /^(rules|visitorAt|teamNight\.roster)\b|\.(id|act|who|to|stop|kind|type|engineKey|key|role|right|age|nightBefore)$|\.(headliners|alsoSeated|order|suspects)\[\d+\]$|callerCategories\[\d+\]\.(8-10|11-15)$/;
  function keys() {
    const out = [];
    (function walk(o, p) {
      if (typeof o === 'string') { if (!MACHINE.test(p)) out.push(p); return; }
      if (Array.isArray(o)) return o.forEach((x, i) => walk(x, p + '[' + i + ']'));
      if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) walk(v, p ? p + '.' + k : k);
    })(D(), '');
    return out;
  }

  /* ================================================================ THE PIECES — what a mail entry shows */
  const LABEL = { inv: 'Invitation', prog: 'Programme', drama: 'The round', laugh: 'A laugh', suspense: 'Suspense', above: 'Letter', below: 'Letter',
    v: 'A note signed V.', dax: 'Dax', pip: 'Pip’s note', cliff: 'Cliffhanger', clue: 'Clue card', clue2: 'Clue card' };
  function groupOf(key) {
    let m = /^rounds\[(\d+)\]/.exec(key); if (m) return 'r' + m[1];
    if (/^turn\./.test(key)) return 'r7';
    m = /^(bee|stamp)\.([a-z]+)/.exec(key); if (m) return m[2] === 'team' ? 'team' : 'r' + RIX(m[2]);
    if (/^teamNight\./.test(key)) return 'team';
    if (/^accusation\./.test(key)) return 'acc';
    return 'post';
  }
  function groupTitle(g) {
    if (g === 'team') return 'Team Night · ' + D().teamNight.venue;
    if (g === 'acc') return 'Who is V.?';
    if (g === 'post') return 'Postcards and diary';
    const i = +g.slice(1); const r = rounds()[i]; return 'Round ' + ROMAN[i] + ' · ' + r.venue;
  }
  /* a piece: {kind, label, html, text} — html is the card body, text what Read aloud says */
  function piece(o, m, idx) {
    const k = m.key; const L = [];
    const line = (s, c2) => { L.push({ s, c: c2 || '' }); };
    let label = '', kind = 'note', extra = '';
    let mm = /^rounds\[(\d+)\]\.pieces\.([a-z0-9]+)$/i.exec(k);
    if (mm) {
      const i = +mm[1], p = mm[2], r = rounds()[i], v = at(k);
      label = LABEL[p] || 'Mail'; kind = p;
      if (p === 'beeFileFakeTip') {   /* the bee file checks Dax's corridor tip (§5A): its own card, right after the tip */
        label = D().hivePost.beeFileFakeTipIntro; kind = 'bee';
        L.push({ s: v.tip, html: `<s>${H(v.tip)}</s>`, c: 'hp-small' }); line(v.truth);
      } else if (p === 'clue' || p === 'clue2') {
        line(v.text);
        extra = `<button class="hp-btn" data-act="hivePost" data-arg="pin|${H(v.id)}">${ccPinSVG()} Pin it on the board</button>`;
      } else if (p === 'pip') {
        const pw = r.pieces.pipWord, txt = fill(v, m.d, k);
        const shown = !!(m.d && m.d.tapped);
        const j = txt.toLowerCase().indexOf(String(pw.word).toLowerCase());
        const html = j < 0 ? H(txt) : H(txt.slice(0, j)) + `<button class="hp-pipw" data-act="hivePost" data-arg="pip|${idx}" aria-expanded="${shown}">${H(txt.slice(j, j + pw.word.length))}</button>` + H(txt.slice(j + pw.word.length));
        L.push({ html, s: txt });
        if (shown) line(cap(pw.word) + ': ' + pw.real, 'hp-real');
      } else {
        line(fill(v, m.d, k), p === 'v' ? 'hp-vhand' : (i === 5 && p === 'suspense') || (i === 8 && (p === 'above' || p === 'below')) ? 'hp-violet' : '');
        if (p === 'inv') line(D().signoffs.inv, 'hp-sign');
        if (p === 'v' && r.vWhere) L.unshift({ s: '', html: `<span class="hp-where">${H(cap(r.vWhere))}</span>`, quiet: 1 });
      }
      return finish();
    }
    if (k === 'turn.scene') {
      label = 'The turn'; kind = 'turn';
      const T = D().turn; line(T.scene);
      const h = o.dax.helped;
      if (h == null) extra = `<div class="hp-choices" role="group" aria-label="${H(T.scene)}">${['true', 'false'].map((b) => `<button class="hp-btn hp-choice" data-act="hivePost" data-arg="dax|${b}">${H(T.choice.labels[b])}</button>`).join('')}</div>`;
      else line(T.choice.line[String(!!h)]);
      return finish();
    }
    if (k === 'turn.kwame') { label = 'The turn'; kind = 'turn'; line('Kwame: ‘' + at(k) + '’'); return finish(); }
    if (k === 'turn.dax') { label = 'The turn'; kind = 'turn'; line('Dax: ‘' + at(k) + '’'); return finish(); }
    if (k === 'turn.notes') { label = 'The turn'; kind = 'turn'; const T = D().turn; line(T.notesIntro); T.notes.forEach((n) => line(n, 'hp-vhand')); line('Dax: ‘' + T.daxOnNotes + '’'); return finish(); }
    mm = /^turn\.apologies\[(\d+)\]$/.exec(k);
    if (mm) { label = 'Apology'; kind = 'letter'; const a = D().turn.apologies[+mm[1]]; line(a.text); line(a.reply, 'hp-reply'); return finish(); }
    if (/^teamNight\.beats\./.test(k)) {
      label = 'Team Night'; kind = 'team';
      line(fill(at(k), m.d, k), /\.(sting|mei)$/.test(k) ? 'hp-pencil' : /\.daxPostcard$/.test(k) ? 'hp-card' : '');
      return finish();
    }
    if (k === 'accusation.reveal') { label = 'The accusation'; kind = 'acc'; D().accusation.reveal.forEach((s) => line(s)); return finish(); }
    if (k === 'accusation.closingLetter') {
      label = 'A letter'; kind = 'letter'; line(D().accusation.closingLetter, 'hp-vhand');
      const ch = D().accusation.closingChoices;
      if (o.closing == null) extra = `<div class="hp-choices" role="group" aria-label="Your reply">${ch.map((s, j) => `<button class="hp-btn hp-choice" data-act="hivePost" data-arg="closing|${j}">${H(s)}</button>`).join('')}</div>`;
      else line(ch[o.closing], 'hp-reply');
      return finish();
    }
    mm = /^hivePost\.postcards\.([a-z]+)$/.exec(k);
    if (mm) { label = 'Postcard'; kind = 'postcard'; line(fill(at(k), m.d, k)); return finish(); }
    mm = /^diary\.(\d+)$/.exec(k);
    if (mm) { label = 'Diary'; kind = 'diary'; line(diaryLine(+mm[1])); return finish(); }
    mm = /^bee\.([a-z]+)\.\d+$/.exec(k);
    if (mm) return beeFile(o, m, idx, mm[1]);
    mm = /^stamp\.([a-z]+)$/.exec(k);
    if (mm) { const s = stampHTML(o, mm[1]); return { kind: 'stamp', label: 'Stamp', html: s.html, text: s.text }; }
    return { kind: 'note', label: 'Mail', html: '', text: '' };
    function finish() {
      const html = L.map((x) => x.quiet ? x.html : `<p class="hp-line ${x.c}">${x.html != null ? x.html : H(x.s)}</p>`).join('') + extra;
      return { kind, label, html, text: L.map((x) => x.s).filter(Boolean).join(' ') };
    }
  }
  function beeFile(o, m, idx, hall) {
    const d = m.d || {}, HP = D().hivePost;
    const i = RIX(hall), r = i >= 0 ? rounds()[i] : null;
    const fams = (D().slotLines.weak || {}).byFamily || {};
    const words = Array.isArray(d.words) ? d.words : [];
    const missed = words.filter((x) => !x.ok);
    const c = kid();
    const onPile = missed.length && (d.filed || missed.every((x) => ((c && c.missed) || []).some((y) => lc(y.w) === lc(x.w))));
    const beat = d.beat ? missed.find((x) => x.w === d.beat) || { w: d.beat, asks: null } : null;
    const why = beat ? (beat.asks === 0 ? fams.noask : (() => { const f = trickCls(beat.w); return f && f !== 'plain' ? fams[f] : null; })()) : null;
    const T = [], h = [];
    h.push(`<details class="hp-src"><summary>What a bee file is</summary><p class="hp-line hp-small">${H(HP.beeFileIntro)}</p></details>`); T.push(HP.beeFileIntro);
    h.push(`<p class="hp-k">${hall === 'team' ? H(cap(D().teamNight.venue)) + ' · Team Night' : H(cap(r.venue))}${d.place ? ' · ' + ordinal(d.place) + (d.of ? ' of ' + d.of : '') : ''}</p>`);
    if (words.length) {
      h.push(`<p class="hp-k">Words spelled</p><ul class="hp-chips">${words.map((x) => `<li class="hp-chip ${x.ok ? 'ok' : 'no'}">${x.ok ? ccTickSVG() : ccCrossSVG()}<span>${H(x.w)}</span><span class="hp-sr">${x.ok ? ' right' : ' missed'}</span></li>`).join('')}</ul>`);
      T.push('Words spelled: ' + words.map((x) => x.w + (x.ok ? '' : ', missed')).join('; ') + '.');
    }
    if (beat) {
      h.push(`<p class="hp-k">The one that beat you</p><p class="hp-line"><b class="hp-word">${H(beat.w)}</b>${why ? ' — ' + H(why) : ''}</p>`);
      T.push('The one that beat you: ' + beat.w + '.' + (why ? ' ' + why : ''));
      if (r) { h.push(`<p class="hp-line hp-small"><b>${H(r.technique)}</b></p><button class="hp-btn" data-act="hivePost" data-arg="lesson|${+r.lessonGi}">${ccBookSVG()} ${H(r.lesson)}</button>`); T.push(r.technique); }
    }
    if (d.calls) { h.push(`<p class="hp-k">Origin calls: ${d.calls.right} of ${d.calls.of} right</p>`); T.push('Origin calls: ' + d.calls.right + ' of ' + d.calls.of + ' right.'); }
    if (missed.length) h.push(onPile ? `<p class="hp-done">${ccTickSVG()} On your revision pile</p>`
      : `<button class="hp-btn hp-primary" data-act="hivePost" data-arg="file|${idx}">${ccPlusSVG()} Add missed words to revision</button>`);
    return { kind: 'bee', label: 'Bee file', html: h.join(''), text: T.join(' ') };
  }
  function stampHTML(o, hall) {
    const h = o.halls[hall] || {}; const b = h.best || {};
    const venue = hall === 'team' ? D().teamNight.venue : (rounds()[RIX(hall)] || {}).venue;
    const title = hall === 'team' ? 'Team Night' : 'Round ' + ROMAN[RIX(hall)];
    const place = b.place ? ordinal(b.place) + (b.of ? ' of ' + b.of : '') : '';
    return { html: `<div class="hp-stamp${h.done ? '' : ' empty'}" role="img" aria-label="${H(title + ', ' + venue + (place ? ', ' + place : ''))}">${ccHexSVG()}<span class="hp-st-v">${H(cap(venue))}</span><span class="hp-st-t">${H(title)}</span>${place ? `<span class="hp-st-p">${H(place)}</span>` : ''}</div>`,
      text: title + ', ' + cap(venue) + (place ? ', ' + place : '') + '.' };
  }

  /* ================================================================ THE HIVE POST (Collection → Hive Post) */
  const ui = { view: 'mail', open: null, pin: null, accusing: false, wrong: null, vis: null, who: '' };
  function uiFor(c) { const t = kidTag(); if (ui.who !== t) { Object.assign(ui, { view: 'mail', open: null, pin: null, accusing: false, wrong: null, vis: null, who: t }); } return ui; }
  /* the mail in the order the list shows it: chapters by first delivery, each in delivery order */
  function sequence(o) {
    const groups = [], by = {};
    o.mail.forEach((m, i) => { const g = groupOf(m.key); if (!by[g]) { by[g] = []; groups.push(g); } by[g].push(i); });
    return { groups, by, flat: groups.flatMap((g) => by[g]) };
  }
  const fictionLine = () => `<p class="hp-fiction">${H(D().fiction)}</p>`;
  function subTabs(v) {
    const T = [['mail', 'Mail'], ['board', 'Suspect Board'], ['visitors', 'Visitors’ Book'], ['stamps', 'Stamps']];
    return `<div class="hp-tabs" role="group" aria-label="Hive Post">${T.map(([k, l]) => `<button class="hp-tab" data-act="hivePost" data-arg="view|${k}" aria-pressed="${v === k}">${H(l)}</button>`).join('')}</div>`;
  }
  function postHTML(c) {
    if (!D()) return '';
    c = c || kid(); const o = rec(c); const u = uiFor(c);
    ensureStyle();
    let body;
    if (u.open != null && o.mail[u.open]) body = reader(o, u.open);
    else if (u.view === 'board') body = boardView(c, o, u);
    else if (u.view === 'visitors') body = visitorsView(c, u.vis);
    else if (u.view === 'stamps') body = stampsView(o);
    else body = mailView(o);
    return `<div class="hp-post" data-hp-view="${H(u.open != null ? 'reader' : u.view)}">${fictionLine()}${u.open != null ? '' : subTabs(u.view)}${body}</div>`;
  }
  function mailView(o) {
    if (!o.mail.length) return `<div class="hp-card"><p class="hp-line">No mail yet.</p></div>`;
    const S = sequence(o);
    const next = S.flat.find((i) => !o.mail[i].read);
    const rows = S.groups.map((g) => {
      const ix = S.by[g]; const unread = ix.some((i) => !o.mail[i].read);
      const go = ix.find((i) => !o.mail[i].read); const start = go != null ? go : ix[0];
      return `<li><button class="hp-row" data-act="hivePost" data-arg="read|${start}">${ccEnvSVG(22)}<span class="hp-row-t">${H(groupTitle(g))}</span>${unread ? '<span class="hp-dot" aria-label="new"></span>' : ''}</button></li>`;
    }).join('');
    return (next != null ? `<button class="hp-btn hp-primary hp-wide" data-act="hivePost" data-arg="read|${next}">${ccEnvSVG(18)} Read the next new piece</button>` : '')
      + `<ul class="hp-rows">${rows}</ul>`;
  }
  function reader(o, i) {
    const S = sequence(o); const pos = S.flat.indexOf(i); const g = groupOf(o.mail[i].key);
    const p = piece(o, o.mail[i], i);
    const prev = pos > 0 ? S.flat[pos - 1] : null, next = pos < S.flat.length - 1 ? S.flat[pos + 1] : null;
    const inG = S.by[g]; const gp = inG.indexOf(i) + 1;
    return `<article class="hp-reader hp-card hp-k-${H(p.kind)}" tabindex="-1" aria-label="${H(p.label)}">
      <header class="hp-rh"><span class="hp-rg">${H(groupTitle(g))}</span><span class="hp-rl">${H(p.label)} · ${gp} of ${inG.length}</span></header>
      <div class="hp-body">${p.html}</div>
      <div class="hp-ctl hp-nav">
        <button class="hp-btn hp-say" data-act="hivePost" data-arg="say|${i}" aria-label="Read aloud">${ccSpeakSVG()} Read aloud</button>
        <button class="hp-btn hp-arrow" data-act="hivePost" data-arg="read|${prev}" ${prev == null ? 'disabled' : ''} aria-label="Previous piece">${ccChevSVG(-1)}</button>
        <button class="hp-btn hp-arrow" data-act="hivePost" data-arg="read|${next}" ${next == null ? 'disabled' : ''} aria-label="Next piece">${ccChevSVG(1)}</button>
        <button class="hp-btn" data-act="hivePost" data-arg="back">All mail</button>
      </div></article>`;
  }
  /* the Suspect Board (§5B): five portraits from the script, the clue cards the mail has delivered, pins the child
     chooses from pre-written labels (L7), never scored; the accusation opens after Round IX's mail */
  function portraitLabel(o, p) { return p.labelAfterRound && storyDone(o, p.labelAfterRound) ? p.labelAfter : p.label; }
  function cluesIn(o) {
    const out = [];
    o.mail.forEach((m) => { const mm = /^rounds\[(\d+)\]\.pieces\.(clue2?)$/.exec(m.key); if (mm) out.push(at(m.key)); });
    return out;
  }
  function face(c, s, size) {
    const id = FACE[s];
    if (id && typeof window.SB_AVATAR === 'function') {
      let f = id; const mine = c && c.avatar;
      try { if (window.MOCKBEE && MOCKBEE.rivals) { const r = MOCKBEE.rivals(mine).find((x) => x.id === id); if (r && r.face) f = r.face; } } catch (e) {}
      if (f !== mine) { try { const a = window.SB_AVATAR(f, size); if (a) return a; } catch (e) {} }
    }
    return ccPersonSVG(size);
  }
  function boardView(c, o, u) {
    const ports = D().suspectBoard.portraits; const clues = cluesIn(o);
    if (u.pin) {
      const cl = clues.find((x) => x.id === u.pin);
      if (cl) return `<div class="hp-card"><p class="hp-k">Pin under</p><p class="hp-line">${H(cl.text)}</p>
        <div class="hp-choices" role="group" aria-label="Pin under">${ports.map((p) => { const on = o.board.suspects[p.id].indexOf(cl.id) >= 0;
          return `<button class="hp-btn hp-choice" data-act="hivePost" data-arg="pinto|${H(cl.id)}|${p.id}" aria-pressed="${on}">${on ? ccTickSVG() : ''} ${H(portraitLabel(o, p))}</button>`; }).join('')}
          <button class="hp-btn hp-primary" data-act="hivePost" data-arg="pindone">Done</button></div></div>`;
    }
    if (u.accusing && accuseOpen(c)) {
      const A = D().accusation;
      return `<div class="hp-card"><p class="hp-k">Who is V.?</p>
        ${u.wrong ? `<p class="hp-line hp-look" role="status">${H((A.lookAgainBy || {})[u.wrong] || A.lookAgain)}</p><button class="hp-btn" data-act="hivePost" data-arg="saywrong" aria-label="Read aloud">${ccSpeakSVG()} Read aloud</button>` : ''}
        <div class="hp-choices" role="group" aria-label="Who is V.?">${A.suspects.map((s) => { const p = ports.find((x) => x.id === s);
          return `<button class="hp-btn hp-choice hp-acc" data-act="hivePost" data-arg="accuse|${s}"><span class="hp-face">${face(c, s, 40)}</span>${H(portraitLabel(o, p))}</button>`; }).join('')}
          <button class="hp-btn" data-act="hivePost" data-arg="accuseoff">Not yet</button></div></div>`;
    }
    const cards = ports.map((p) => {
      const pins = o.board.suspects[p.id].map((id) => clues.find((x) => x.id === id)).filter(Boolean);
      return `<li class="hp-port"><span class="hp-face">${face(c, p.id, 52)}</span><span class="hp-pt"><b>${H(portraitLabel(o, p))}</b><span class="hp-small">${H(p.why)}</span>
        ${pins.length ? `<span class="hp-pins">${pins.map((x) => `<span class="hp-pin">${ccPinSVG()} ${H(x.text)}</span>`).join('')}</span>` : ''}</span></li>`;
    }).join('');
    const acc = solved(o) ? `<p class="hp-done">${ccTickSVG()} ${H(portraitLabel(o, ports.find((x) => x.id === D().accusation.right)))}</p>`
      : accuseOpen(c) ? `<button class="hp-btn hp-primary hp-wide" data-act="hivePost" data-arg="accuseon">Name V.</button>`
      : `<p class="hp-small hp-quiet">Naming V. opens after the final round.</p>`;
    const clueList = clues.length ? `<p class="hp-k">Clue cards</p><ul class="hp-rows">${clues.map((x) => `<li class="hp-clue"><p class="hp-line">${H(x.text)}</p>
      <span class="hp-cbtns"><button class="hp-btn" data-act="hivePost" data-arg="sayclue|${H(x.id)}" aria-label="Read aloud">${ccSpeakSVG()}</button><button class="hp-btn" data-act="hivePost" data-arg="pin|${H(x.id)}">${ccPinSVG()} Pin</button></span></li>`).join('')}</ul>` : '';
    return `${acc}<ul class="hp-ports">${cards}</ul>${clueList}`;
  }
  function walked(c, u) {
    const t = (c && c.trail) || {};
    if (Object.keys(((t.done || {})[u]) || {}).length) return true;
    return Object.keys(t.st || {}).some((k) => k.split(':')[0] === u && ((t.st[k] || {}).p || 0) >= 70);
  }
  function visitorsView(c, at1) {
    /* §10: a visitor stands at a stop whose own list holds their word; the book shows the ones the child has walked past,
       and the one whose stop card the child has just tapped, first */
    const V = D().visitors.map((v, i) => ({ v, i })).filter((x) => x.v.stop);
    const met = V.filter((x) => walked(c, x.v.stop) || x.v.stop === at1).sort((a, b) => (b.v.stop === at1) - (a.v.stop === at1)), left = V.length - met.length;
    return `<ul class="hp-rows">${met.map(({ v, i }) => `<li class="hp-card hp-vis"><p class="hp-k">${H(v.figure)} · <b>${H(v.word)}</b></p><p class="hp-line">${H(v.card)}</p>
          <div class="hp-ctl"><button class="hp-btn" data-act="hivePost" data-arg="sayvis|${i}" aria-label="Read aloud">${ccSpeakSVG()} Read aloud</button></div>
          ${v.sources.length ? `<details class="hp-src"><summary>Sources</summary><ul>${v.sources.map((s) => `<li>${H(s.ref)}</li>`).join('')}</ul></details>` : ''}</li>`).join('')}
      ${left ? `<li class="hp-card hp-vis empty"><p class="hp-small hp-quiet">${met.length ? 'More visitors wait' : 'Visitors wait'} at stops on the Word Atlas: ${met.length} of ${V.length} met.</p></li>` : ''}</ul>`;
  }
  function stampsView(o) {
    const halls = rounds().map((r) => r.act).concat(['team']);
    const latest = (h) => { for (let i = o.mail.length - 1; i >= 0; i--) if (o.mail[i].key.indexOf('bee.' + h + '.') === 0) return i; return null; };
    const grid = halls.map((h) => { const s = stampHTML(o, h); const b = latest(h);
      return `<li>${b != null && o.halls[h] && o.halls[h].done ? `<button class="hp-stampbtn" data-act="hivePost" data-arg="read|${b}" aria-label="${H(s.text)} Open the bee file">${s.html}</button>` : s.html}</li>`; }).join('');
    const pips = o.mail.map((m, i) => ({ m, i })).filter((x) => /\.pieces\.pip$/.test(x.m.key) && x.m.d && x.m.d.tapped);
    const pipCard = pips.length ? `<div class="hp-card"><p class="hp-k">Pip’s words</p><ul class="hp-rows">${pips.map(({ m }) => { const pw = at(m.key.replace(/\.pip$/, '.pipWord'));
      return `<li class="hp-pipitem"><b>${H(pw.word)}</b> — ${H(pw.real)}</li>`; }).join('')}</ul></div>` : '';
    /* a solved Surprise Stop leaves a team photo (§7: "a team-photo sticker for the Hive Post"; circuit-cases.js writes
       `sticker:'team'` on the case's record) — drawn in code, named by the case's own title, nothing paid */
    const photos = (D().cases || []).filter((cs) => o.cases[cs.id] && o.cases[cs.id].state === 'solved' && o.cases[cs.id].sticker === 'team');
    const photoCard = photos.length ? `<div class="hp-card"><p class="hp-k">Team photos</p><ul class="hp-photos">${photos.map((cs) =>
      `<li class="hp-photo" role="img" aria-label="${H('Team photo: ' + cs.title)}">${teamPhotoSVG()}<span>${H(cs.title)}</span></li>`).join('')}</ul></div>` : '';
    return `<ul class="hp-stamps">${grid}</ul>${photoCard}${pipCard}`;
  }
  /* a Polaroid of five heads and shoulders in the team's colours — no faces drawn, nobody a type */
  function teamPhotoSVG() {
    const C = ['#E9A23B', '#4F7CD8', '#3BA675', '#C25B9A', '#8A6DE0'];
    const people = C.map((c, i) => { const x = 14 + i * 13, y = i % 2 ? 30 : 26;
      return `<circle cx="${x}" cy="${y}" r="5.2" fill="${c}"/><path d="M${x - 7} ${y + 17} q7 -11 14 0 z" fill="${c}"/>`; }).join('');
    return `<svg viewBox="0 0 80 64" width="80" height="64" aria-hidden="true"><rect x="2" y="2" width="76" height="60" rx="4" fill="#FFFDF6" stroke="#D9CFB8"/>` +
      `<rect x="7" y="7" width="66" height="40" rx="2" fill="#F3E7C9"/>${people}</svg>`; }

  /* ================================================================ ACTIONS (app3-me.js `hivePost` → here) */
  function refocus(sel) { setTimeout(() => { try { const e = document.querySelector(sel); if (e && !e.disabled) e.focus({ preventScroll: true }); else { const r = document.querySelector('.hp-reader, .hp-post'); if (r) { r.setAttribute('tabindex', '-1'); r.focus({ preventScroll: true }); } } } catch (e) {} }, 0); }
  function toTop() { setTimeout(() => { try { const r = document.querySelector('.hp-post'); if (r && r.scrollIntoView) r.scrollIntoView({ block: 'start' }); } catch (e) {} }, 0); }
  function readAt(o, i) {
    const m = o.mail[i]; if (!m) return false;
    ui.open = i; ui.pin = null; ui.accusing = false;
    if (!m.read) { m.read = true; persist(); }
    return true;
  }
  function act(arg) {
    const c = kid(), o = rec(c); if (!o || !D()) return;
    const u = uiFor(c);
    const a = String(arg == null ? '' : arg).split('|'), v = a[0];
    if (v === 'open') { open(a[1], a[2]); return; }
    if (v === 'view') { u.vis = null; u.view = /^(mail|board|visitors|stamps)$/.test(a[1]) ? a[1] : 'mail'; u.open = null; u.pin = null; u.accusing = false; u.wrong = null; redraw(); refocus('.hp-tab[aria-pressed="true"]'); return; }
    if (v === 'read') { const i = +a[1]; if (a[1] === 'null' || !readAt(o, i)) return; redraw(); toTop(); refocus('.hp-reader .hp-say'); return; }
    if (v === 'back') { u.open = null; redraw(); refocus('.hp-row'); return; }
    if (v === 'say') { const m = o.mail[+a[1]]; if (m) speak(piece(o, m, +a[1]).text); return; }
    if (v === 'sayvis') { const vis = D().visitors[+a[1]]; if (vis && vis.stop && (walked(c, vis.stop) || vis.stop === u.vis)) speak(vis.figure + '. ' + vis.word + '. ' + vis.card); return; }
    if (v === 'sayclue') { const cl = cluesIn(o).find((x) => x.id === a[1]); if (cl) speak(cl.text); return; }
    if (v === 'saywrong') { const A = D().accusation; if (u.wrong) speak((A.lookAgainBy || {})[u.wrong] || A.lookAgain); return; }
    if (v === 'pip') { const i = +a[1], m = o.mail[i]; if (!m || !/\.pieces\.pip$/.test(m.key)) return;
      const pw = at(m.key.replace(/\.pip$/, '.pipWord')); m.d = Object.assign({}, m.d, { tapped: 1 }); persist(); redraw(); speak(pw.word + '. ' + pw.real); refocus('.hp-pipw'); return; }
    if (v === 'file') { const i = +a[1], m = o.mail[i]; if (!m || !/^bee\./.test(m.key) || !m.d || m.d.filed) return;
      const seen = new Set(); const idx = (() => { try { return typeof wordIndex === 'function' ? wordIndex() : {}; } catch (e) { return {}; } })();
      (m.d.words || []).filter((x) => !x.ok).forEach((x) => { const k = lc(x.w); if (seen.has(k)) return; seen.add(k);
        try { if (typeof addMiss === 'function') addMiss(idx[k] || { w: x.w }, 'mark'); } catch (e) {} });   /* Mock Bee's recap button does exactly this (mockbee.js mbAddMissed) */
      m.d.filed = 1; persist(); redraw(); refocus('.hp-reader .hp-say'); return; }
    if (v === 'lesson') { const gi = Math.floor(+a[1]); if (!(gi >= 0)) return; try { location.hash = '#/concepts/' + gi; } catch (e) {} return; }
    if (v === 'dax') { if (o.dax.helped != null || !has(o, 'turn.scene')) return; o.dax.helped = a[1] === 'true'; persist(); redraw(); refocus('.hp-reader .hp-say'); return; }
    if (v === 'closing') { const j = +a[1]; if (o.closing != null || !solved(o) || !(j >= 0 && j < D().accusation.closingChoices.length)) return; o.closing = j; persist(); redraw(); refocus('.hp-reader .hp-say'); return; }
    if (v === 'pin') { if (!cluesIn(o).some((x) => x.id === a[1])) return; u.view = 'board'; u.open = null; u.pin = a[1]; u.accusing = false; redraw(); toTop(); refocus('.hp-choice'); return; }
    if (v === 'pinto') { const id = a[1], s = a[2]; if (!cluesIn(o).some((x) => x.id === id) || SUSPECTS.indexOf(s) < 0) return;
      const L = o.board.suspects[s]; const j = L.indexOf(id); if (j >= 0) L.splice(j, 1); else L.push(id); persist(); redraw(); refocus('[data-arg="pinto|' + id + '|' + s + '"]'); return; }
    if (v === 'pindone') { u.pin = null; redraw(); refocus('.hp-tab[aria-pressed="true"]'); return; }
    if (v === 'accuseon') { if (!accuseOpen(c)) return; u.view = 'board'; u.accusing = true; u.wrong = null; redraw(); refocus('.hp-acc'); return; }
    if (v === 'accuseoff') { u.accusing = false; u.wrong = null; redraw(); return; }
    if (v === 'accuse') { accuse(c, a[1]); return; }
  }
  /* the accusation (§5B, staged): a wrong pick looks again with that suspect's own line; the right one delivers the
     reveal and the closing letter, and then whatever Team Night was holding for it (story-order) */
  function accuse(c, s) {
    const o = rec(c); const A = D().accusation; if (!o || !accuseOpen(c) || A.suspects.indexOf(s) < 0) return false;
    if (s !== A.right) { ui.wrong = s; redraw(); refocus('.hp-look'); speak((A.lookAgainBy || {})[s] || A.lookAgain); return false; }
    o.board.accused = s; ui.accusing = false; ui.wrong = null;
    deliver(o, 'accusation.reveal'); deliver(o, 'accusation.closingLetter');
    cascade(o); persist();
    const i = o.mail.findIndex((m) => m.key === 'accusation.reveal'); readAt(o, i); redraw(); toTop(); refocus('.hp-reader .hp-say');
    return true;
  }
  function open(tab, unitId) {
    const c = kid(); if (!rec(c)) return; const u = uiFor(c);
    u.view = /^(mail|board|visitors|stamps)$/.test(tab || '') ? tab : 'mail'; u.open = null; u.pin = null; u.accusing = false; u.wrong = null;
    u.vis = u.view === 'visitors' && unitId && visitorFor(unitId) ? unitId : null;   /* a stop's "Visitor" line opens that visitor's card */
    try { if (typeof state === 'object' && state) state.collTab = 'post'; } catch (e) {}
    try { if (typeof app !== 'undefined' && app.openCollection) app.openCollection(); else redraw(); } catch (e) { redraw(); }
    toTop();
  }

  /* ================================================================ THE BOARD: envelope, cases' pins, the moment card */
  function boardExtras(act) {
    const c = kid(); const o = rec(c); if (!o || !D()) return '';
    ensureStyle();
    if (pendingRegions.has(act)) { if (postcard(c, act)) { queueMoment('A postcard', 'New mail in the Hive Post.'); persist(); } }
    if (moments.length) setTimeout(showMoment, 80);
    const env = mailWaiting(c) ? `<button class="hp-env" data-act="hivePost" data-arg="open" aria-label="Mail in the Hive Post">${ccEnvSVG(30)}</button>` : '';
    let pins = ''; try { pins = window.SB_CIRCUIT_CASES && typeof SB_CIRCUIT_CASES.pins === 'function' ? (SB_CIRCUIT_CASES.pins(act) || '') : ''; } catch (e) {}
    return env + pins;
  }
  let _momentFrom = null;
  function closeMoment() {
    const el = document.querySelector('.hp-moment'); if (!el) return;
    el.remove(); try { if (_momentFrom && _momentFrom.isConnected) _momentFrom.focus({ preventScroll: true }); } catch (e) {} _momentFrom = null;
  }
  function showMoment() {
    if (typeof document === 'undefined' || document.querySelector('.hp-moment')) return;
    const t = kidTag();
    /* the newest moment for this child, once: a pile of cards over the board is noise (the mail holds the rest) */
    const mine = moments.filter((x) => x.who === t); moments.length = 0;
    const m = mine[mine.length - 1]; if (!m) return;
    ensureStyle();
    const el = document.createElement('div');
    el.className = 'hp-moment'; el.setAttribute('data-trap', 'hp-moment'); el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'hp-m-h');
    el.innerHTML = `<div class="hp-m-card"><span class="hp-m-art">${ccEnvSVG(56)}</span><h2 id="hp-m-h">${H(m.h)}</h2><p class="hp-line">${H(m.line)}</p>
      <div class="hp-m-row"><button class="hp-btn hp-primary" data-hp="open">Open the Hive Post</button><button class="hp-btn" data-hp="say" aria-label="Read aloud">${ccSpeakSVG()}</button><button class="hp-btn" data-hp="close">Close</button></div></div>`;
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-hp]'); if (!b) { if (e.target === el) closeMoment(); return; }
      const k = b.getAttribute('data-hp');
      if (k === 'say') { speak(m.h + '. ' + m.line); return; }
      closeMoment(); moments.length = 0;
      if (k === 'open') open('mail');
    });
    _momentFrom = document.activeElement;
    document.body.appendChild(el);
    setTimeout(() => { try { const p = el.querySelector('.hp-primary'); if (p) p.focus({ preventScroll: true }); } catch (e) {} }, 0);
  }
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('keydown', (e) => { try {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      /* the moment card is the top layer: Escape is its own, and nothing under it hears it (the moth, a chest) */
      if (document.querySelector('.hp-moment')) { if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); closeMoment(); moments.length = 0; } return; }
      const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (!document.querySelector('.hp-post') || (typeof state === 'object' && state && (state.pinDlg || state.settingsOpen || state.drawerOpen || state.walletOpen))) return;
      const R = document.querySelector('.hp-reader');
      if (e.key === 'Escape') { if (R) { e.preventDefault(); act('back'); } else if (ui.pin) { e.preventDefault(); act('pindone'); } else if (ui.accusing) { e.preventDefault(); act('accuseoff'); } return; }
      if (R && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        const b = R.querySelector(e.key === 'ArrowLeft' ? '[aria-label="Previous piece"]' : '[aria-label="Next piece"]');
        if (b && !b.disabled) { e.preventDefault(); act(b.getAttribute('data-arg')); }
      }
    } catch (_) {} }, true);
    window.addEventListener('hashchange', () => { try { closeMoment(); } catch (e) {} });
  }

  /* ================================================================ DRAWN, NEVER EMOJI (P3.7) */
  function ccEnvSVG(s) { return `<svg class="hp-ico" viewBox="0 0 48 36" width="${s}" height="${Math.round(s * .75)}" aria-hidden="true" focusable="false"><rect x="2" y="3" width="44" height="30" rx="4" fill="#FFF6DD" stroke="#8A5A00" stroke-width="2.2"/><path d="M3.5 5.5 24 21 44.5 5.5" fill="none" stroke="#8A5A00" stroke-width="2.2" stroke-linejoin="round"/><circle cx="24" cy="20" r="5.2" fill="#E5A11A" stroke="#8A5A00" stroke-width="1.6"/></svg>`; }
  function ccSpeakSVG() { return `<svg class="hp-ico" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 9.2a3.2 3.2 0 0 1 0 5.6M18.6 6.6a7 7 0 0 1 0 10.8"/></svg>`; }
  function ccChevSVG(d) { return `<svg class="hp-ico" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="${d < 0 ? 'M15 5 8 12l7 7' : 'M9 5l7 7-7 7'}"/></svg>`; }
  function ccTickSVG() { return `<svg class="hp-ico" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.4 4.4L19 7.2"/></svg>`; }
  function ccCrossSVG() { return `<svg class="hp-ico" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>`; }
  function ccPlusSVG() { return `<svg class="hp-ico" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5.5v13M5.5 12h13"/></svg>`; }
  function ccPinSVG() { return `<svg class="hp-ico" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4.2"/><path d="M12 12.2V21"/></svg>`; }
  function ccBookSVG() { return `<svg class="hp-ico" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4.5h11a2 2 0 0 1 2 2V20a1.5 1.5 0 0 0-1.5-1.5H5z"/><path d="M5 4.5v14"/></svg>`; }
  function ccHexSVG() { return `<svg class="hp-ico hp-st-hex" viewBox="0 0 40 40" width="34" height="34" aria-hidden="true" focusable="false"><path d="M20 3 35 11.5v17L20 37 5 28.5v-17z" fill="#F2C14E" stroke="#8A5A00" stroke-width="2"/><path d="M20 12 27.5 16.3v8.4L20 29l-7.5-4.3v-8.4z" fill="#FFF6DD" stroke="#8A5A00" stroke-width="1.5"/></svg>`; }
  function ccPersonSVG(s) { return `<svg class="hp-ico" viewBox="0 0 48 48" width="${s}" height="${s}" aria-hidden="true" focusable="false"><circle cx="24" cy="24" r="23" fill="#E9E3F5" stroke="#7A6A9A" stroke-width="1.5"/><circle cx="24" cy="19" r="8" fill="#7A6A9A"/><path d="M9.5 40a14.5 12 0 0 1 29 0" fill="#7A6A9A"/></svg>`; }

  /* ================================================================ THE LOOK — one sheet, injected once, on the app's tokens */
  function ensureStyle() {
    if (typeof document === 'undefined' || !document.head || document.getElementById('hp-style')) return;
    const s = document.createElement('style'); s.id = 'hp-style';
    s.textContent = `
.hp-post{max-width:720px;margin:0 auto 18px}
.hp-fiction{margin:0 0 10px;font-size:12.5px;line-height:1.45;color:var(--muted);font-style:italic}
.hp-tabs{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px}
.hp-tab{flex:1 1 calc(50% - 6px);min-height:44px;padding:8px 10px;border-radius:10px;border:1px solid var(--line);background:var(--surface2);color:var(--text);font-weight:800;font-size:13px}
.hp-tab[aria-pressed="true"]{background:var(--action,var(--accent));color:var(--action-ink,#fff);border-color:transparent}
@media (min-width:560px){.hp-tab{flex:1 1 0}}
.hp-card{background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin:0 0 12px;color:var(--text)}
.hp-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:44px;min-width:44px;padding:8px 14px;border-radius:12px;border:1px solid var(--line);background:var(--surface2);color:var(--text);font-weight:800;font-size:13.5px;line-height:1.2}
.hp-btn[disabled]{opacity:.45}
.hp-primary{background:var(--action,var(--accent));color:var(--action-ink,#fff);border-color:transparent}
.hp-wide{width:100%;margin:0 0 12px}
.hp-ico{display:block;flex-shrink:0}
.hp-rows{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.hp-row{width:100%;min-height:52px;display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;border:1px solid var(--line);background:var(--paper,var(--bg2));color:var(--text);font-weight:800;font-size:14px;text-align:left}
.hp-row-t{flex:1}
.hp-dot{width:10px;height:10px;border-radius:50%;background:var(--accent);flex-shrink:0}
.hp-line{margin:0 0 9px;font-size:15px;line-height:1.55}
.hp-small{font-size:12.5px;line-height:1.45;color:var(--muted)}
.hp-quiet{text-align:center;margin:6px 0 12px}
.hp-k{margin:10px 0 6px;font-family:var(--display);font-weight:800;font-size:13px;color:var(--text)}
.hp-reader,.hp-post{scroll-margin-top:118px}
.hp-rh{display:flex;flex-direction:column;gap:2px;margin:0 0 10px}
.hp-rg{font-family:var(--display);font-weight:800;font-size:15px}
.hp-rl{font-size:12px;color:var(--muted);font-weight:700}
.hp-body{margin:0 0 6px}
.hp-ctl{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.hp-ctl .hp-btn{flex:1 1 calc(50% - 8px)}
.hp-nav{flex-wrap:nowrap}
.hp-nav{gap:6px}
.hp-nav .hp-btn{flex:1 1 auto;padding:8px;white-space:nowrap;font-size:13px}
.hp-nav .hp-arrow{flex:0 0 48px}
.hp-sign{text-align:right;font-style:normal;font-weight:700;color:var(--muted)}
.hp-vhand{font-family:var(--display);font-size:16.5px;transform:skewX(9deg);transform-origin:left bottom;padding-left:6px}
.hp-violet{color:#5E2E91;font-weight:600}
[data-mode="dusk"] .hp-violet{color:#CDB0FF}
.hp-pencil{color:#55595F;font-size:14px;font-style:normal;border-left:3px solid #9AA0A6;padding-left:10px}
[data-mode="dusk"] .hp-pencil{color:#C9CDD2}
.hp-card .hp-reply{border-left:3px solid var(--accent);padding-left:10px}
.hp-real{background:var(--chip);border-radius:10px;padding:8px 10px}
.hp-where{display:block;font-size:12px;color:var(--muted);margin:0 0 6px}
.hp-pipw{display:inline-flex;align-items:center;min-height:44px;vertical-align:middle;padding:0 4px;border:0;background:none;color:inherit;font:inherit;text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:3px;cursor:pointer}
.hp-choices{display:grid;gap:8px;margin:8px 0 2px}
.hp-choice{width:100%;justify-content:flex-start;text-align:left}
.hp-chips{list-style:none;margin:0 0 6px;padding:0;display:flex;flex-wrap:wrap;gap:6px}
.hp-chip{display:inline-flex;align-items:center;gap:4px;padding:4px 9px;border-radius:999px;font-weight:700;font-size:13px;border:1px solid var(--line)}
.hp-chip.ok{color:var(--good)} .hp-chip.no{color:var(--bad,#B3261E)}
.hp-chip span:not(.hp-sr){color:var(--text)}
.hp-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.hp-word{font-family:var(--display);font-size:17px}
.hp-tip{border-top:1px dashed var(--line);margin-top:8px}
.hp-done{display:flex;align-items:center;gap:6px;font-weight:800;color:var(--good);margin:8px 0}
.hp-look{background:var(--chip);border-radius:10px;padding:10px 12px}
.hp-ports{list-style:none;margin:0 0 12px;padding:0;display:grid;gap:8px}
.hp-port{display:flex;gap:12px;align-items:flex-start;background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:14px;padding:12px}
.hp-face{width:52px;height:52px;flex-shrink:0;border-radius:50%;overflow:hidden;display:grid;place-items:center}
.hp-face img,.hp-face svg{width:100%;height:100%}
.hp-acc .hp-face{width:40px;height:40px}
.hp-pt{display:flex;flex-direction:column;gap:3px;min-width:0}
.hp-pins{display:flex;flex-direction:column;gap:4px;margin-top:4px}
.hp-pin{display:flex;gap:5px;font-size:12.5px;line-height:1.4;color:var(--text)}
.hp-clue{background:var(--paper,var(--bg2));border:1px solid var(--line);border-left:4px solid #E5A11A;border-radius:12px;padding:10px 12px}
.hp-cbtns{display:flex;gap:8px}
.hp-vis.empty{opacity:.75}
.hp-src summary{min-height:44px;display:flex;align-items:center;font-size:12.5px;font-weight:700;color:var(--muted);cursor:pointer}
.hp-src ul{margin:0;padding-left:18px;font-size:12px;color:var(--muted)}
.hp-stamps{list-style:none;margin:0 0 12px;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
.hp-photos{list-style:none;margin:6px 0 0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px}
.hp-photo{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:12.5px;font-weight:700;text-align:center}
.hp-stampbtn{width:100%;padding:0;border:0;background:none;color:inherit}
.hp-stamp{display:flex;flex-direction:column;align-items:center;gap:3px;min-height:118px;padding:12px 8px;border-radius:6px;background:#FFF6DD;color:#3B2A06;border:2px dashed #B07A12;text-align:center}
.hp-stamp.empty{background:transparent;color:var(--muted);border-color:var(--line);filter:grayscale(1);opacity:.7}
.hp-st-v{font-family:var(--display);font-weight:800;font-size:13.5px;line-height:1.2}
.hp-st-t{font-size:11.5px;font-weight:700}
.hp-st-p{font-size:12.5px;font-weight:800}
.hp-pipitem{font-size:14px;line-height:1.5}
/* the envelope floats over the board's window, whatever layer of the (panning) board it was dropped in: fixed, above the tab bar */
.hp-env{position:fixed;right:16px;bottom:calc(86px + env(safe-area-inset-bottom,0px));z-index:40;width:56px;height:56px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.92);border:2px solid #8A5A00;box-shadow:0 4px 14px rgba(0,0,0,.25);cursor:pointer}
@media (min-width:641px){.hp-env{bottom:28px;right:28px}}
.hp-moment{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:16px;background:rgba(18,12,30,.55)}
.hp-m-card{width:min(420px,100%);max-height:calc(100vh - 32px);overflow:auto;background:var(--paper,#fff);color:var(--text,#1d1730);border-radius:18px;padding:20px 18px;text-align:center;box-shadow:0 18px 50px rgba(0,0,0,.35)}
.hp-m-art{display:grid;place-items:center;margin:0 0 8px}
.hp-m-card h2{margin:0 0 6px;font-family:var(--display);font-size:20px}
.hp-m-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:12px}
`;
    document.head.appendChild(s);
  }

  window.SB_CIRCUIT = {
    data: D, state: (c) => rec(c || kid()), onHallOpen, onHall, onTeamNight, onRegionDone, onLevelUp,
    boardExtras, mailWaiting, open, openVisitor: (unitId) => open('visitors', unitId), visitorFor, hallFiled, line, caseState, caseUpdate, caseLate, hallUnlocked, teamOpen, accuseOpen, chip,
    keys, act, postHTML,
    /* for the tests and the cases build: what a piece shows and says, the season's order, and the moment queue */
    piece: (c, i) => { const o = rec(c || kid()); return o && o.mail[i] ? piece(o, o.mail[i], i) : null; },
    lineHTML: (path) => { const v = at(path); return typeof v === 'string' ? `<p class="hp-line">${H(fill(v, null, path))}</p>` : ''; },
    fill: (path, d) => fill(at(path), d || null, path),
    at, sequence: (c) => sequence(rec(c || kid())), moments: () => moments.slice(), showMoment, closeMoment, ensureStyle
  };
})();
