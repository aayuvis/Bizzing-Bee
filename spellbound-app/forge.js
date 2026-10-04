/* forge.js — WORD FORGE (games spec §5.1), on the Play tab in for Spell Scene.
   Promise: spell any word, even one you have never seen, by knowing its parts.

   A screen in the shell (nav 'forge', #/forge, app.openForge in app3.js), drawn into #fg-host by
   render() exactly like Daily Buzz: the game's state lives HERE, so a render that rebuilds #root
   only re-draws the same moment (mount() is idempotent). The HUD carries .sg-hud, so flash()
   paints its toast instead of rebuilding the app under a game.

   Rules live in forge-core.js (join, racks, reasons, grading — shared with the build and the
   tests); the words are forge-data.js, a CITED table the owner signs off. The card and the route
   stay shut while SB_FORGE.signedOff is false, except in testing mode (devUnlock), for review.

   Levels (SB_LEVEL key 'wordForge'):
     Easy   exact parts as tiles                     — practice: no coins (tiles alone never pay)
     Medium parts + family decoys (-able/-ible…)     — 1 coin per first-forge right, paid at the
                                                       round's end only if the round reaches 50%
                                                       (a random placer lands under 5%; it earns 0)
     Hard   root fixed; prefix/suffix from decoys;   — 1 coin per word forged right first time AND
            then spell it from memory                   spelt right
     Champ  no tiles: spell it, then mark the parts  — 1 coin per word spelt and split right
   Mastery (the Codex): a root is mastered when three different words containing it are SPELT
   right (typed — Hard or Champ; picking tiles never masters) on a later day than they were first
   spelt. addCoins('mastery') fires once per root, only from that record (c.forge.codex). */
(function () {
  'use strict';
  var CORE = function () { return window.SB_FORGE_CORE; };
  var LV = ['easy', 'medium', 'hard', 'champ'], LVN = { easy: 'Easy', medium: 'Medium', hard: 'Hard', champ: 'Champ' };
  var ROUND = 8;
  var G = null;            // the round in play
  var host = null;
  var drag = null;

  function data() { return window.SB_FORGE || { rows: [], roots: [] }; }
  function kid() { try { return active(); } catch (e) { return null; } }
  function dev() { try { return !!state.devUnlock; } catch (e) { return false; } }
  function signed() { return !!(window.SB_FORGE && SB_FORGE.signedOff); }
  function open() { return signed() || dev(); }
  function today() { try { if (typeof mastDay === 'function') return mastDay(); } catch (e) {} var d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000); }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function em(t) { return esc(t).replace(/\*([^*]+)\*/g, '<b>$1</b>'); }
  function fst(c) { c = c || kid() || {}; var f = c.forge = c.forge || {}; f.seen = f.seen || {}; f.codex = f.codex || {}; f.mastered = f.mastered || {}; f.met = f.met || {}; return f; }
  function snd(k) { try { if (typeof sfx === 'function') sfx(k); } catch (e) {} }
  function persist() { try { if (typeof save === 'function') save(); } catch (e) {} }
  function sayW(w) { try { if (typeof say === 'function') say(w); } catch (e) {} }
  function mask(d, w) { try { return typeof maskTxt === 'function' ? maskTxt(d, w) : d; } catch (e) { return d; } }
  function reduced() { try { return document.documentElement.getAttribute('data-motion') === 'off' || matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }

  /* ------------------------------------------------------------------ level */
  function autoLevel() { var c = kid() || {}; var b = c.band || 3; return b <= 2 ? 'easy' : b <= 5 ? 'medium' : b <= 7 ? 'hard' : 'champ'; }
  function level() {
    var v = null;
    try { if (window.SB_LEVEL && SB_LEVEL.get) v = SB_LEVEL.get('wordForge'); } catch (e) {}
    if (v == null) v = fst().lv || 'auto';
    return LV.indexOf(v) >= 0 ? v : autoLevel();
  }
  function chip() {
    try { if (window.SB_LEVEL && SB_LEVEL.chip) return SB_LEVEL.chip('wordForge', 'Word Forge'); } catch (e) {}
    return '<button type="button" class="fg-chip" data-fg="lvl" aria-label="Level: ' + LVN[level()] + '. Tap to change">' + LVN[level()] + '<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg></button>';
  }
  function cycleLevel() { var f = fst(); var i = LV.indexOf(level()); f.lv = LV[(i + 1) % LV.length]; persist(); }
  /* the §1.7 rule: 50% or more keeps the level, under 50% drops one (floor Easy) */
  function after(pct) {
    try { if (window.SB_LEVEL && SB_LEVEL.after) return SB_LEVEL.after('wordForge', pct) || {}; } catch (e) {}
    var f = fst(), cur = (G && G.lv) || level(), out = { level: cur, dropped: false };
    if (pct < 0.5 && cur !== 'easy') { out.level = LV[LV.indexOf(cur) - 1]; out.dropped = true; f.lv = out.level; }
    f.hist = (f.hist || []).concat([Math.round(pct * 100)]).slice(-6); persist();
    return out;
  }

  /* ------------------------------------------------------------------ words */
  function rowsFor(lv) {
    var rows = data().rows || [];
    if (lv === 'medium') { var r3 = rows.filter(function (r) { return r.parts.length >= 3 || Object.keys(r.confusable || {}).length; }); if (r3.length >= ROUND) rows = r3; }
    if (lv === 'hard') { var rh = rows.filter(function (r) { return r.kinds.some(function (k) { return k !== 'root'; }); }); if (rh.length >= ROUND) rows = rh; }
    return rows;
  }
  /* The contract door (nextWords purpose 'forge') when g-found's picker is here; otherwise the
     least-seen rows, ordered by a seed of the day and the child — never Math.random. */
  function pick(lv) {
    var rows = rowsFor(lv), by = {}; rows.forEach(function (r) { by[r.w] = r; });
    var out = [];
    try { if (typeof window.nextWords === 'function') (window.nextWords(kid(), ROUND, { purpose: 'forge' }) || []).forEach(function (rec) { var r = rec && by[rec.w]; if (r && out.indexOf(r) < 0) out.push(r); }); } catch (e) {}
    if (out.length < ROUND) {
      var f = fst(), C = CORE(), seed = C.hash((kid() && kid().name || '') + '|' + today() + '|' + (f.rounds || 0));
      var rest = rows.filter(function (r) { return out.indexOf(r) < 0; })
        .map(function (r) { return { r: r, n: f.seen[r.w] || 0, h: C.hash(r.w + seed) }; })
        .sort(function (a, b) { return a.n - b.n || a.h - b.h; });
      for (var i = 0; out.length < ROUND && i < rest.length; i++) out.push(rest[i].r);
    }
    return out;
  }

  /* ------------------------------------------------------------------ round */
  function start(lv) {
    var C = CORE(); if (!C) return;
    lv = lv || level();
    var f = fst();
    G = { lv: lv, words: pick(lv), i: 0, log: [], right: 0, owed: 0, paid: 0, phase: 'howto', seed: (f.rounds || 0) + 1, heat: 0 };
    G.bonus = 0;
    if (!G.words.length) { G.phase = 'empty'; }
    draw();
  }
  function begin() { if (!G) start(); G.phase = 'forge'; setWord(0); }
  function cur() { return G && G.words[G.i]; }
  function setWord(i) {
    var C = CORE(); G.i = i; var r = cur();
    G.tries = 0; G.hinted = false; G.typed = ''; G.cuts = {}; G.msg = null; G.fx = null; G.typeTries = 0;
    G.slots = r.parts.map(function () { return null; });
    G.rack = C.rack(r, G.lv, data().rows, G.seed).map(function (t, k) { return Object.assign({ id: k, used: false }, t); });
    if (G.lv === 'hard') r.parts.forEach(function (p, k) { if (r.kinds[k] === 'root') G.slots[k] = { s: p, m: r.partMeanings[k], k: 'root', fixed: true }; });
    G.phase = G.lv === 'champ' ? 'type' : 'forge';
    var f = fst(); f.seen[r.w] = (f.seen[r.w] || 0) + 1;
    draw();
    setTimeout(function () { if (G && cur() === r) sayW(r.w); }, 280);
  }
  function nextEmpty() { for (var k = 0; k < G.slots.length; k++) if (!G.slots[k]) return k; return -1; }
  function place(tileId, slot) {
    if (!G || G.phase !== 'forge') return;
    var t = G.rack.find(function (x) { return x.id === tileId; }); if (!t || t.used) return;
    if (slot == null || slot < 0 || G.slots[slot]) slot = nextEmpty();
    if (slot < 0) return;
    if (G.slots[slot] && G.slots[slot].fixed) return;
    t.used = true; G.slots[slot] = { s: t.s, m: t.m, k: t.k, tile: t.id }; G.msg = null; snd('tick'); draw();
  }
  function unplace(slot) {
    if (!G || G.phase !== 'forge') return;
    var s = G.slots[slot]; if (!s || s.fixed) return;
    var t = G.rack.find(function (x) { return x.id === s.tile; }); if (t) t.used = false;
    G.slots[slot] = null; draw();
  }
  function undo() { if (!G || G.phase !== 'forge') return; for (var k = G.slots.length - 1; k >= 0; k--) if (G.slots[k] && !G.slots[k].fixed) { unplace(k); return; } }

  function forge() {
    if (!G || G.phase !== 'forge') return;
    var r = cur(), C = CORE();
    if (nextEmpty() >= 0) { G.msg = { kind: 'info', text: 'Fill every slot first — this word has ' + r.parts.length + ' parts.' }; draw(); return; }
    G.tries++;
    var res = C.grade(r, G.slots);
    if (res.ok) {
      G.firstForge = G.tries === 1 && !G.hinted;
      G.phase = 'fused'; G.fx = 'fuse'; snd('correct'); draw();
      setTimeout(function () { if (!G || cur() !== r || G.phase !== 'fused') return;
        if (G.lv === 'hard') { G.phase = 'type'; G.fx = null; G.typed = ''; draw(); focusType(); return; }
        resolve(G.firstForge, true);
      }, reduced() ? 900 : 1700);
      return;
    }
    /* wrong: each misplaced part cracks back to the rack, with the reason for THAT error */
    snd('wrong');
    G.cracked = res.wrong.map(function (x) { return x.slot; });
    G.msg = { kind: 'bad', list: res.wrong.map(function (x) { return x.reason; }) };
    res.wrong.forEach(function (x) { var s = G.slots[x.slot]; if (s && !s.fixed) { var t = G.rack.find(function (q) { return q.id === s.tile; }); if (t) t.used = false; G.slots[x.slot] = null; } });
    if (G.tries >= 2) { missCard(res.wrong.map(function (x) { return x.reason; }).join(' ')); return; }
    draw();
    setTimeout(function () { if (G) { G.cracked = null; draw(); } }, 700);
  }

  function hint() {
    if (!G) return; var r = cur();
    G.hinted = true;
    if (G.phase === 'forge') {
      var k = nextEmpty(); if (k < 0) { for (k = 0; k < r.parts.length && G.slots[k] && G.slots[k].s === r.parts[k]; k++); if (k >= r.parts.length) return; unplace(k); }
      var t = G.rack.find(function (x) { return !x.used && x.s === r.parts[k]; });
      if (t) { t.used = true; G.slots[k] = { s: t.s, m: t.m, k: t.k, tile: t.id, hint: true }; }
      G.msg = { kind: 'info', text: 'Slot ' + (k + 1) + ' is *' + r.parts[k] + '* — "' + r.partMeanings[k] + '".' };
    } else if (G.phase === 'type' || G.phase === 'mark') {
      /* never the spelling: the shape of the word and what its parts mean */
      G.msg = { kind: 'info', text: r.parts.length + ' parts: ' + r.partMeanings.map(function (m) { return '"' + m + '"'; }).join(' + ') + (r.origin ? ' — from ' + r.origin : '') + '.' };
    }
    draw();
  }

  function typeKey(ch) { if (!G || G.phase !== 'type') return; if (!/^[a-z]$/i.test(ch)) return; G.typed = (G.typed + ch.toLowerCase()).slice(0, 24); drawType(); }
  function typeBack() { if (!G || G.phase !== 'type') return; G.typed = G.typed.slice(0, -1); drawType(); }
  function typeEnter() {
    if (!G || G.phase !== 'type') return;
    var r = cur(), t = (G.typed || '').trim().toLowerCase(); if (!t) return;
    if (t === r.w) {
      record(r);
      if (G.lv === 'champ') { G.phase = 'mark'; G.cuts = {}; G.caret = 1; G.msg = { kind: 'info', text: 'Right! Now mark where the parts join — tap between letters (or ← → and Space), then Check.' }; snd('correct'); draw(); return; }
      resolve(G.firstForge, true);
      return;
    }
    snd('wrong');
    missCard(typeNote(r, t), t);
  }
  /* the note for a typed miss: name the part the child's letters broke, with its meaning */
  function typeNote(r, t) {
    var C = CORE(), b = [0].concat(C.boundaries(r)).concat([r.w.length]);
    for (var k = 0; k < r.parts.length; k++) {
      var seg = r.w.slice(b[k], b[k + 1]);
      if (t.indexOf(seg) < 0) return 'The part *' + seg + '* ("' + r.partMeanings[k] + '") is where it slipped — ' + C.order(r) + '.';
    }
    return 'Built from ' + C.order(r) + '.';
  }
  function toggleCut(i) { if (!G || G.phase !== 'mark') return; if (G.cuts[i]) delete G.cuts[i]; else G.cuts[i] = 1; G.caret = i; draw(); }
  function checkCuts() {
    if (!G || G.phase !== 'mark') return;
    var r = cur(), want = CORE().boundaries(r);
    var got = Object.keys(G.cuts).map(Number).sort(function (a, b) { return a - b; });
    var ok = want.length === got.length && want.every(function (x, k) { return x === got[k]; });
    if (ok) { resolve(true, true); return; }
    G.phase = 'markwrong'; G.msg = { kind: 'bad', text: 'The parts are ' + CORE().order(r) + ' — ' + r.partMeanings.join(' + ') + '.' };
    snd('wrong'); draw();
  }

  /* a word is RESOLVED once: right on the first forge (and, from Hard up, spelt right) or not */
  function resolve(firstRight, spelt) {
    var r = cur(); if (!r || G.done === G.i) return; G.done = G.i;
    var ok = !!firstRight;
    G.log.push({ w: r.w, ok: ok });
    if (ok) {
      G.right++;
      if (CORE().payNow(G.lv)) { try { if (typeof payG === 'function') G.paid += payG(G) || 0; } catch (e) {} }
    }
    var f = fst(); r.roots.forEach(function (id) { f.met[id] = (f.met[id] || 0) + 1; });
    G.heat = G.right / Math.max(1, G.words.length);
    G.phase = 'done'; G.fx = ok ? 'fuse' : null; draw();
    persist();
  }
  function next() {
    if (!G) return;
    if (G.i + 1 < G.words.length) { setWord(G.i + 1); return; }
    finish();
  }
  function finish() {
    var pct = G.words.length ? G.right / G.words.length : 0;
    var f = fst(); f.rounds = (f.rounds || 0) + 1;
    var owed = CORE().roundPay(G.lv, G.right, G.words.length);
    for (var k = 0; k < owed; k++) { try { if (typeof payG === 'function') G.paid += payG(G) || 0; } catch (e) {} }
    G.after = after(pct);
    G.phase = 'result'; persist(); snd(pct >= 0.5 ? 'win' : 'level'); draw();
  }

  /* ------------------------------------------------------------------ the Codex (mastery) */
  function record(r) {
    var f = fst(), d = today();
    r.roots.forEach(function (id) {
      var R = f.codex[id] = f.codex[id] || {}, e = R[r.w] = R[r.w] || {};
      if (!e.f) e.f = d; else if (d > e.f && !e.l) e.l = d;
      var later = Object.keys(R).filter(function (w) { return R[w].l; }).length;
      if (later >= 3 && !f.mastered[id]) {
        f.mastered[id] = d;
        try { if (typeof addCoins === 'function') addCoins('mastery'); } catch (e2) {}
        G.newMastery = (G.newMastery || []).concat([id]);
      }
    });
    persist();
  }
  function codexHTML() {
    var f = fst(), roots = data().roots || [];
    var shelf = function (lang) {
      return '<div class="fg-shelf"><div class="fg-shelf-h">' + lang + ' roots</div><div class="fg-plaques">' + roots.filter(function (r) { return r.lang === lang; }).map(function (r) {
        var R = f.codex[r.id] || {}, later = Object.keys(R).filter(function (w) { return R[w].l; }).length, m = f.mastered[r.id], met = f.met[r.id];
        return '<div class="fg-plaque' + (m ? ' gold' : met ? ' met' : '') + '" title="' + esc(r.forms.join(' / ') + ' — ' + r.meanFull) + '"><b>' + esc(r.id) + '</b><span>' + esc(r.mean) + '</span><i>' + (m ? 'mastered' : later + ' of 3') + '</i></div>';
      }).join('') + '</div></div>';
    };
    return '<div class="fg-codex" role="dialog" aria-label="The Codex"><div class="fg-codex-h">The Codex</div>' +
      '<p class="fg-codex-sub">A root is mastered when you spell three different words with it right on a later day. Spelling counts from Hard and Champ.</p>' +
      shelf('Latin') + shelf('Greek') + '<div class="fg-row"><button type="button" class="fg-btn go" data-fg="codexClose">Back to the forge</button></div></div>';
  }

  /* ------------------------------------------------------------------ the miss card */
  function missCard(note, typed) {
    var r = cur(); G.phase = 'miss';
    var attempt = typed != null ? typed : G.slots.map(function (s) { return s ? s.s : '_'; }).join('');
    G.missNote = note; G.missTyped = attempt;
    var cont = function () { if (!G || G.phase !== 'miss') return; G.phase = 'forge'; resolve(false, false); next(); };
    draw();
    sayW(r.w);
    var h = host && host.querySelector('.fg-play');
    try {
      if (window.SGUI && typeof SGUI.miss === 'function' && h) { G.sguiMiss = true; SGUI.miss(h, r.w, attempt, { onContinue: cont, note: note.replace(/\*/g, '') }); return; }
    } catch (e) {}
    G.sguiMiss = false; G.missCont = cont; draw();
  }

  /* ------------------------------------------------------------------ drawing */
  function plate() { try { if (window.SB_PLATE) return SB_PLATE('forge'); } catch (e) {} return 'app-art/stage/forge-' + (/dusk/.test(document.documentElement.getAttribute('data-mode') || '') ? 'night' : 'day') + '.webp'; }
  function heatHTML() {
    var h = G ? Math.round((G.heat || 0) * 100) : 0;
    return '<div class="fg-heat" role="img" aria-label="Forge heat ' + h + '%"><span class="fg-stat-h">Heat</span><div class="fg-heat-bar"><i style="width:' + h + '%"></i></div><b>' + (G ? G.right : 0) + ' / ' + (G ? G.words.length : 0) + '</b></div>';
  }
  function meaningHTML() {
    var r = cur();
    if (!r || !G || G.phase === 'howto' || G.phase === 'result') return '<div class="fg-mean"><span class="fg-stat-h">Meaning</span><span class="fg-mean-t">Hear a word, forge it from its parts.</span></div>';
    return '<div class="fg-mean"><span class="fg-stat-h">Meaning' + (r.origin ? ' · from ' + esc(r.origin) : '') + '</span><span class="fg-mean-t" data-live-prompt>' + esc(mask(r.d, r.w)) + '</span></div>';
  }
  function centreHTML() {
    return '<div class="fg-title"><button type="button" class="fg-back" data-fg="back" aria-label="Back to Play"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></button><span class="fg-name">Word Forge</span>' + chip() + '</div>';
  }
  function tileHTML(t, k) {
    return '<button type="button" class="fg-tile ' + t.k + (t.used ? ' used' : '') + '" data-fg="tile" data-id="' + t.id + '" ' + (t.used ? 'disabled aria-hidden="true"' : '') + ' aria-label="' + esc(t.s + ', ' + t.m) + ' (key ' + (k + 1) + ')"><span class="fg-key">' + (k + 1) + '</span><b>' + esc(t.s) + '</b><span class="fg-tm">' + esc(t.m) + '</span></button>';
  }
  function slotHTML(s, k, r) {
    var cr = G.cracked && G.cracked.indexOf(k) >= 0;
    return '<button type="button" class="fg-slot ' + (s ? 'full ' + s.k : 'empty') + (s && s.fixed ? ' fixed' : '') + (cr ? ' crack' : '') + '" data-fg="slot" data-slot="' + k + '" aria-label="Slot ' + (k + 1) + (s ? ': ' + esc(s.s) : ', empty') + '">' +
      (s ? '<b>' + esc(s.s) + '</b><span class="fg-tm">' + esc(s.m) + '</span>' : '<span class="fg-slot-n">' + (r.kinds[k] === 'pre' ? 'front' : r.kinds[k] === 'suf' ? 'end' : 'root') + '</span>') + '</button>';
  }
  function anvilHTML() {
    var r = cur(), C = CORE(); if (!r) return '';
    var fused = G.phase === 'fused' || (G.phase === 'done' && G.log[G.log.length - 1] && G.log[G.log.length - 1].ok);
    var showWord = fused && G.lv !== 'hard' || (G.phase === 'done');
    var j = C.join(r.parts, r.kinds);
    var slots = G.phase === 'type' || G.phase === 'mark' || G.phase === 'markwrong' ? '' : '<div class="fg-slots n' + r.parts.length + (fused ? ' fused' : '') + '">' + G.slots.map(function (s, k) { return slotHTML(G.phase === 'done' ? { s: r.parts[k], m: r.partMeanings[k], k: r.kinds[k] } : s, k, r); }).join('') + '</div>';
    var beat = (fused || G.phase === 'done') ? '<div class="fg-fuse" aria-live="polite">' +
      (showWord ? '<div class="fg-word">' + esc(r.w) + '</div>' : '') +
      '<div class="fg-combine">' + esc(r.partMeanings.join(' + ')) + (showWord ? ' = <b>' + esc(r.w) + '</b>' : '') + '</div>' +
      (j.changes.length ? '<div class="fg-change">' + j.changes.map(function (c) { return esc(C.changeNote(c)); }).join(' · ') + '</div>' : '') + '</div>' : '';
    return '<div class="fg-anvil-wrap' + (G.fx === 'fuse' && !reduced() ? ' sparks' : '') + '">' + (G.msg && G.phase === 'forge' ? msgHTML() : '') + '<svg class="fg-hammer" viewBox="0 0 64 64" aria-hidden="true"><rect x="29" y="22" width="6" height="36" rx="3" fill="#7a4a22"/><rect x="14" y="8" width="36" height="16" rx="4" fill="#5b5f66"/><rect x="14" y="8" width="36" height="5" rx="2.5" fill="#8a9099"/></svg>' +
      '<div class="fg-anvil">' + slots + beat + '</div><svg class="fg-anvil-base" viewBox="0 0 200 40" aria-hidden="true" preserveAspectRatio="none"><path d="M10 4h180l-24 14h-36v18H70V18H34z" fill="#3d3a3f"/><path d="M10 4h180l-6 4H16z" fill="#6c6870"/></svg></div>';
  }
  function typeHTML() {
    var r = cur(); var coarse = false; try { coarse = matchMedia('(pointer:coarse)').matches; } catch (e) {}
    return '<div class="fg-typebox"><label class="fg-typel" for="fg-type">' + (G.lv === 'hard' ? 'Now spell it from memory' : 'Spell the word you hear') + '</label>' +
      '<input id="fg-type" class="fg-type" data-fkey="fgtype" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" inputmode="' + (coarse && window.SGUI && SGUI.keys ? 'none' : 'text') + '" value="' + esc(G.typed) + '" aria-label="Type the word">' +
      '<div class="fg-keys-host"></div></div>';
  }
  function markHTML() {
    var r = cur(), w = r.w, out = '';
    for (var i = 0; i < w.length; i++) {
      out += '<span class="fg-ml">' + esc(w[i]) + '</span>';
      if (i < w.length - 1) out += '<button type="button" class="fg-gap' + (G.cuts[i + 1] ? ' on' : '') + (G.caret === i + 1 ? ' caret' : '') + '" data-fg="cut" data-i="' + (i + 1) + '" aria-label="Split after letter ' + (i + 1) + (G.cuts[i + 1] ? ', marked' : '') + '"></button>';
    }
    var right = G.phase === 'markwrong' ? '<div class="fg-markright">' + CORE().order(r) + '</div>' : '';
    return '<div class="fg-mark" role="group" aria-label="Mark the parts">' + out + '</div>' + right;
  }
  function msgHTML() {
    if (!G || !G.msg) return '<div class="fg-msg" aria-live="polite"></div>';
    var m = G.msg;
    return '<div class="fg-msg ' + m.kind + '" aria-live="polite">' + (m.list ? m.list.map(function (t) { return '<div class="fg-why">' + em(t) + '</div>'; }).join('') : em(m.text)) + '</div>';
  }
  function playHTML() {
    if (!G || G.phase === 'empty') return '<div class="fg-card"><div class="fg-h">The forge is cold</div><p>No words are ready for this level yet.</p></div>';
    if (G.phase === 'codex') return codexHTML();
    if (G.phase === 'howto') {
      return '<div class="fg-card fg-howto"><div class="fg-h">Word Forge</div><p class="fg-sub">Spell any word, even one you have never seen, by knowing its parts.</p>' +
        '<ol class="fg-steps"><li>Hear the word and read what it means.</li><li>Drag the parts onto the anvil — or press 1–9, then Enter.</li><li>Forge! A wrong part cracks off and tells you why.</li></ol>' +
        '<p class="fg-note">' + (G.lv === 'easy' ? 'Easy is practice: the parts are all yours to place. Coins start at Medium.' : G.lv === 'medium' ? 'Medium mixes in look-alike parts. Forge most words first time to earn the round\'s coins.' : G.lv === 'hard' ? 'Hard: the root is on the anvil. Choose the front and end, then spell the word from memory.' : 'Champ: no tiles. Spell the word, then mark where its parts join.') + '</p>' +
        '<div class="fg-row"><button type="button" class="fg-btn" data-fg="codex">Codex</button><button type="button" class="fg-btn go" data-fg="begin">Start</button></div></div>';
    }
    if (G.phase === 'result') {
      var pct = G.words.length ? G.right / G.words.length : 0;
      var res = window.SGUI && SGUI.result ? SGUI.result({ title: pct >= 0.5 ? 'Well forged' : 'Keep the fire going', sub: (G.after && G.after.dropped ? 'Let\'s warm up on ' + LVN[G.after.level] + '. You can move back up any time.' : (G.lv === 'easy' ? 'Easy is practice — coins start at Medium.' : G.lv === 'medium' && pct < 0.5 ? 'Forge half the words first time to earn the round\'s coins.' : '')), stars: pct >= 0.875 ? 3 : pct >= 0.6 ? 2 : pct >= 0.4 ? 1 : 0, score: G.right, scoreLabel: 'of ' + G.words.length + ' forged first time', words: G.log, contLabel: 'Done' }) :
        '<div class="fg-card"><div class="fg-h">' + G.right + ' of ' + G.words.length + ' forged first time</div><div class="fg-row"><button id="sg-again" class="fg-btn">Play again</button><button id="sg-cont" class="fg-btn go">Done</button></div></div>';
      var mast = (G.newMastery || []).length ? '<div class="fg-mastery">Root mastered: ' + G.newMastery.map(esc).join(', ') + '</div>' : '';
      return '<div class="fg-result">' + res + mast + '<div class="fg-row"><button type="button" class="fg-btn" data-fg="codex">Codex</button></div></div>';
    }
    var r = cur();
    var body = '';
    if (G.phase === 'type') body = anvilHTML() + typeHTML();
    else if (G.phase === 'mark' || G.phase === 'markwrong') body = markHTML();
    else body = anvilHTML();
    var rack = (G.phase === 'forge' || G.phase === 'fused') && G.lv !== 'champ' ? '<div class="fg-rack" role="group" aria-label="Parts">' + G.rack.map(tileHTML).join('') + '</div>' : '';
    var miss = G.phase === 'miss' && !G.sguiMiss ? '<div class="fg-miss sb-miss" role="dialog" aria-label="Not quite"><div class="fg-h">Not quite — it is <b>' + esc(r.w) + '</b></div>' +
      '<div class="fg-miss-cmp"><span>You made</span><b>' + esc(G.missTyped) + '</b></div>' +
      '<div class="fg-miss-parts">' + r.parts.map(function (p, k) { return '<span class="fg-mp ' + r.kinds[k] + '"><b>' + esc(p) + '</b><i>' + esc(r.partMeanings[k]) + '</i></span>'; }).join('<em>+</em>') + '</div>' +
      '<div class="fg-why">' + em(G.missNote || '') + '</div><div class="fg-row"><button type="button" class="fg-btn go" data-fg="cont">Continue</button></div></div>' : '';
    var inAnvil = G.phase === 'forge' && G.msg;
    return '<div class="fg-count">Word ' + (G.i + 1) + ' of ' + G.words.length + ' · ' + LVN[G.lv] + '</div>' + body + (inAnvil ? '' : msgHTML()) + rack + miss;
  }
  function controlsHTML() {
    var p = G && G.phase;
    var b = function (act, label, go, dis) { return '<button type="button" class="fg-btn' + (go ? ' go' : '') + '" data-fg="' + act + '"' + (dis ? ' disabled' : '') + '>' + label + '</button>'; };
    if (!G || p === 'howto' || p === 'result' || p === 'codex' || p === 'empty') return '<div class="fg-ctl"></div>';
    var main = p === 'done' || p === 'markwrong' ? b('next', G.i + 1 < G.words.length ? 'Next word' : 'Finish', true)
      : p === 'type' ? b('typeOk', 'Check', true) : p === 'mark' ? b('checkCuts', 'Check parts', true) : b('forge', 'Forge', true, p !== 'forge');
    return '<div class="fg-ctl">' + b('hear', 'Hear it again') + b('hint', 'Hint', false, !(p === 'forge' || p === 'type' || p === 'mark')) + main + '</div>';
  }
  function stageHTML() {
    var hud = { left: meaningHTML(), center: centreHTML(), right: heatHTML() };
    var play = '<div class="fg-play">' + playHTML() + '</div>', ctl = controlsHTML();
    try {
      if (window.SGUI && typeof SGUI.stage === 'function') return '<div class="fg-stage-wrap fg-on-sgui">' + SGUI.stage({ plate: plate(), hud: hud, play: play, controls: ctl }) + '</div>';
    } catch (e) {}
    return '<div class="fg-stage sg-stage" style="--fg-plate:url(\'' + plate() + '\')">' +
      '<div class="fg-hud sg-hud"><div class="fg-hl">' + hud.left + '</div><div class="fg-hc">' + hud.center + '</div><div class="fg-hr">' + hud.right + '</div></div>' +
      play + ctl + '</div>';
  }

  function size() {
    if (!host) return;
    try {
      var root = document.getElementById('root'), z = parseFloat(getComputedStyle(root).zoom) || 1;
      var top = host.getBoundingClientRect().top + (window.scrollY || 0);
      var bar = document.querySelector('nav.sb-tabbar'), bh = 0;
      if (bar && getComputedStyle(bar).display !== 'none') bh = bar.getBoundingClientRect().height;
      var h = Math.max(420, (window.innerHeight - top - bh) / z);
      host.style.height = Math.floor(h) + 'px';
    } catch (e) {}
  }
  function draw() {
    if (!host || !document.body.contains(host)) { host = document.getElementById('fg-host'); if (!host) return; }
    if (!G) start();
    var active = document.activeElement, wasType = active && active.id === 'fg-type';
    host.innerHTML = stageHTML();
    if (window.SGUI && SGUI.bind) try { SGUI.bind(host); } catch (e) {}
    var ag = host.querySelector('#sg-again'), cn = host.querySelector('#sg-cont');
    if (ag) ag.onclick = function () { start(G.after && G.after.level); };
    if (cn) cn.onclick = function () { leave(); };
    var inp = host.querySelector('#fg-type');
    if (inp) {
      inp.oninput = function () { G.typed = inp.value.toLowerCase().replace(/[^a-z]/g, ''); };
      inp.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); G.typed = inp.value.toLowerCase().replace(/[^a-z]/g, ''); typeEnter(); } };
      var kh = host.querySelector('.fg-keys-host'), coarse = false; try { coarse = matchMedia('(pointer:coarse)').matches; } catch (e) {}
      if (coarse && kh && window.SGUI && SGUI.keys) { try { if (G.keys) G.keys.destroy(); G.keys = SGUI.keys(kh, { onKey: typeKey, onBack: typeBack, onEnter: typeEnter }); } catch (e) {} }
      if (wasType || G.phase === 'type') focusType();
    }
    size();
  }
  function drawType() { var inp = host && host.querySelector('#fg-type'); if (inp) inp.value = G.typed; else draw(); }
  function focusType() { setTimeout(function () { var i = host && host.querySelector('#fg-type'); if (i) { try { i.focus({ preventScroll: true }); var n = i.value.length; i.setSelectionRange(n, n); } catch (e) {} } }, 30); }

  function leave() { G = null; try { app.openGames(); } catch (e) {} }

  /* ------------------------------------------------------------------ input */
  function onClick(e) {
    var b = e.target.closest && e.target.closest('[data-fg]'); if (!b || !host || !host.contains(b)) return;
    var a = b.getAttribute('data-fg');
    e.preventDefault(); e.stopPropagation();
    if (a === 'tile') { if (drag && drag.moved) return; place(+b.getAttribute('data-id')); }
    else if (a === 'slot') unplace(+b.getAttribute('data-slot'));
    else if (a === 'forge') forge();
    else if (a === 'hint') hint();
    else if (a === 'hear') { var r = cur(); if (r) sayW(r.w); }
    else if (a === 'begin') begin();
    else if (a === 'next') next();
    else if (a === 'cont') { if (G && G.missCont) G.missCont(); }
    else if (a === 'typeOk') { var i = host.querySelector('#fg-type'); if (i) G.typed = i.value.toLowerCase().replace(/[^a-z]/g, ''); typeEnter(); }
    else if (a === 'cut') toggleCut(+b.getAttribute('data-i'));
    else if (a === 'checkCuts') checkCuts();
    else if (a === 'codex') { G.prev = G.phase; G.phase = 'codex'; draw(); }
    else if (a === 'codexClose') { G.phase = G.prev || 'howto'; draw(); }
    else if (a === 'lvl') { cycleLevel(); start(); }
    else if (a === 'back') leave();
  }
  function onKey(e) {
    if (!host || !document.body.contains(host) || !G) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (document.querySelector('[data-pin-dlg],.sb-modal-open')) return;
    var k = e.key, p = G.phase, handled = true;
    if (p === 'type') {
      if (e.target && e.target.id === 'fg-type') return;   // the input handles its own letters and Enter
      if (/^[a-z]$/i.test(k)) typeKey(k); else if (k === 'Backspace') typeBack(); else if (k === 'Enter') typeEnter(); else handled = false;
    } else if (p === 'forge') {
      if (/^[1-9]$/.test(k)) { var t = G.rack.filter(function () { return true; })[+k - 1]; if (t) place(t.id); }
      else if (k === 'Enter') forge(); else if (k === 'Backspace') undo(); else if (k === 'h' || k === 'H') hint(); else if (k === 'r' || k === 'R' || k === ' ') { var r = cur(); if (r) sayW(r.w); } else handled = false;
    } else if (p === 'mark') {
      var w = cur().w.length;
      if (k === 'ArrowRight') { G.caret = Math.min(w - 1, (G.caret || 1) + 1); draw(); } else if (k === 'ArrowLeft') { G.caret = Math.max(1, (G.caret || 1) - 1); draw(); }
      else if (k === ' ') toggleCut(G.caret || 1); else if (k === 'Enter') checkCuts(); else handled = false;
    } else if (p === 'done' || p === 'markwrong') { if (k === 'Enter' || k === ' ') next(); else handled = false; }
    else if (p === 'miss') { if (k === 'Enter' || k === ' ') { if (G.missCont) G.missCont(); else handled = false; } else handled = false; }
    else if (p === 'howto') { if (k === 'Enter') begin(); else handled = false; }
    else handled = false;
    if (handled) { e.preventDefault(); e.stopPropagation(); }
  }
  /* drag a tile to a slot (mouse, pen or finger); a tap without movement places it in the next slot */
  function onDown(e) {
    var t = e.target.closest && e.target.closest('.fg-tile'); if (!t || !host || !host.contains(t) || t.disabled) return;
    drag = { id: +t.getAttribute('data-id'), x: e.clientX, y: e.clientY, moved: false, el: null, src: t };
    try { t.setPointerCapture(e.pointerId); } catch (x) {}
  }
  function onMove(e) {
    if (!drag) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 8) return;
    if (!drag.el) { drag.moved = true; drag.el = drag.src.cloneNode(true); drag.el.classList.add('fg-ghost'); document.body.appendChild(drag.el); drag.src.classList.add('lift'); }
    drag.el.style.left = e.clientX + 'px'; drag.el.style.top = e.clientY + 'px';
    var over = slotAt(e.clientX, e.clientY); host.querySelectorAll('.fg-slot').forEach(function (s) { s.classList.toggle('over', s === over); });
  }
  function onUp(e) {
    if (!drag) return; var d = drag; drag = null;
    if (d.el) { d.el.remove(); var s = slotAt(e.clientX, e.clientY); if (s) place(d.id, +s.getAttribute('data-slot')); else draw(); drag = { moved: true }; setTimeout(function () { if (drag && drag.moved && !drag.id) drag = null; }, 0); }
  }
  function slotAt(x, y) { var els = host ? host.querySelectorAll('.fg-slot.empty') : []; for (var i = 0; i < els.length; i++) { var r = els[i].getBoundingClientRect(); if (x >= r.left - 8 && x <= r.right + 8 && y >= r.top - 8 && y <= r.bottom + 8) return els[i]; } return null; }

  var wired = false;
  function wire() {
    if (wired) return; wired = true;
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('pointermove', onMove, true);
    document.addEventListener('pointerup', onUp, true);
    document.addEventListener('pointercancel', function () { if (drag && drag.el) drag.el.remove(); drag = null; }, true);
    window.addEventListener('resize', size);
  }

  /* render() calls this after every rebuild of #root while nav is 'forge' */
  function mount(h) {
    host = h; wire(); css();
    if (!open()) { h.innerHTML = '<div class="fg-card"><div class="fg-h">Word Forge is being checked</div><p>Its word table is waiting for a grown-up to sign it off.</p></div>'; return; }
    if (!G || (G.phase === 'howto' && G.lv !== level())) start();
    draw();
  }

  /* ------------------------------------------------------------------ style (tokens only) */
  var cssDone = false;
  function css() {
    if (cssDone) return; cssDone = true;
    var s = document.createElement('style'); s.id = 'fg-css';
    s.textContent = [
      '#fg-host{position:relative;overflow:hidden;border-radius:18px}',
      /* no scroll during play (§5.0 T15): the shell content stops at the stage, and the 100dvh floor
         round the view is not inflated by #root\'s zoom */
      '.sb-forge-on .sb-content{padding-bottom:0!important;padding-top:8px!important}',
      '.sb-forge-on #root div[style*="min-height:100dvh"]{min-height:0!important}',
      '.fg-stage{position:absolute;inset:0;display:grid;grid-template-rows:auto minmax(0,1fr) auto;gap:10px;padding:12px clamp(10px,3vw,28px);color:#fff;font-family:var(--body,var(--display,system-ui,sans-serif));',
      '--fg-panel:linear-gradient(180deg,color-mix(in srgb,color-mix(in srgb,var(--paper,#fffaf0) 86%,#fff3d6) 95%,transparent),color-mix(in srgb,var(--paper,#fffaf0) 72%,transparent));',
      'background:var(--fg-plate) center/cover no-repeat,repeating-linear-gradient(115deg,rgba(255,210,140,.07) 0 3px,transparent 3px 11px),repeating-linear-gradient(25deg,rgba(0,0,0,.08) 0 2px,transparent 2px 13px),radial-gradient(30% 22% at 30% 30%,rgba(255,190,90,.25),transparent 70%),radial-gradient(28% 20% at 72% 76%,rgba(255,140,40,.22),transparent 70%),radial-gradient(60% 80% at 0% 60%,rgba(255,150,40,.55),transparent 70%),radial-gradient(60% 80% at 100% 60%,rgba(255,120,30,.5),transparent 70%),radial-gradient(90% 60% at 50% 110%,rgba(120,60,20,.9),transparent 70%),linear-gradient(180deg,#3a2414 0%,#5a3518 45%,#2a190e 100%)}',
      '.fg-on-sgui{position:absolute;inset:0}',
      /* .sg-hud is only the flag that tells flash() a game is up — none of saga2.css's white bar */
      '.fg-hud.sg-hud{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:stretch;background:none;border:0;box-shadow:none;padding:0;margin:0;max-width:none;backdrop-filter:none;border-radius:0;font:inherit;color:inherit}',
      '.fg-hl,.fg-hr{min-width:0;display:flex}.fg-hr{justify-content:flex-end}',
      '.fg-mean,.fg-heat,.fg-title{background:var(--fg-panel);backdrop-filter:blur(8px);color:var(--text,#2a2116);border-radius:14px;padding:8px 12px;box-shadow:0 2px 10px rgba(0,0,0,.18)}',
      '.fg-mean,.fg-heat{width:min(100%,340px);display:flex;flex-direction:column;gap:2px}',
      '.fg-stat-h{font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted,#6d604f)}',
      '.fg-mean-t{font-size:13.5px;line-height:1.35;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}',
      '.fg-heat-bar{height:10px;border-radius:99px;background:color-mix(in srgb,var(--text,#2a2116) 14%,transparent);overflow:hidden}.fg-heat-bar i{display:block;height:100%;background:linear-gradient(90deg,#f0b429,#ff6a1a);border-radius:99px;transition:width .4s}',
      '.fg-heat b{font-size:13px;text-align:right}',
      '.fg-title{display:flex;align-items:center;gap:8px;font-family:var(--display,inherit);font-weight:800}',
      '.fg-name{font-size:17px;white-space:nowrap}',
      '.fg-back,.fg-chip{display:inline-flex;align-items:center;gap:4px;min-height:36px;min-width:36px;justify-content:center;border:0;border-radius:99px;background:color-mix(in srgb,var(--accent,#a8650c) 16%,transparent);color:var(--text,#2a2116);font-weight:800;font-size:13px;padding:0 10px;cursor:pointer}',
      '.fg-play{min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;position:relative;width:min(100%,960px);margin:0 auto;overflow:hidden}',
      '.fg-count{font-size:12px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#ffe9c2;text-shadow:0 1px 2px rgba(0,0,0,.5)}',
      '.fg-anvil-wrap{position:relative;width:min(100%,720px);display:flex;flex-direction:column;align-items:center}',
      '.fg-hammer{position:absolute;right:4%;top:-34px;width:54px;height:54px;transform-origin:70% 90%;transform:rotate(18deg);filter:drop-shadow(0 2px 3px rgba(0,0,0,.4))}',
      '.fg-anvil-wrap.sparks .fg-hammer{animation:fg-ham .5s ease-in 2}',
      '@keyframes fg-ham{0%{transform:rotate(18deg)}50%{transform:rotate(-38deg)}100%{transform:rotate(18deg)}}',
      '.fg-anvil{width:100%;min-height:clamp(96px,20vh,200px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:14px;border-radius:18px 18px 6px 6px;background:linear-gradient(180deg,#77727a,#4a464d);box-shadow:inset 0 3px 0 rgba(255,255,255,.25),0 8px 24px rgba(0,0,0,.35)}',
      '.fg-anvil-base{width:86%;height:34px;margin-top:-1px}',
      '.fg-slots{display:flex;gap:10px;justify-content:center;width:100%;transition:gap .5s}',
      '.fg-slots.fused{gap:0}',
      '.fg-slot{flex:1;max-width:190px;min-height:78px;border-radius:12px;border:2px dashed rgba(255,255,255,.55);background:rgba(0,0,0,.18);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer;font:inherit;transition:border-radius .5s,transform .2s}',
      '.fg-slot.full{border-style:solid;background:linear-gradient(180deg,#ffd27a,#f0a531);color:#3a2205;border-color:#ffe3a3}',
      '.fg-slot.fixed{background:linear-gradient(180deg,#ffb36b,#e07a1f)}',
      '.fg-slots.fused .fg-slot{border-radius:0;border-left-width:0;border-right-width:0}.fg-slots.fused .fg-slot:first-child{border-radius:12px 0 0 12px;border-left-width:2px}.fg-slots.fused .fg-slot:last-child{border-radius:0 12px 12px 0;border-right-width:2px}',
      '.fg-slot.over{transform:scale(1.05);border-color:#fff}',
      '.fg-slot.crack{animation:fg-crack .5s}',
      '@keyframes fg-crack{0%,100%{transform:none}25%{transform:translateX(-6px) rotate(-2deg)}75%{transform:translateX(6px) rotate(2deg)}}',
      '.fg-slot b,.fg-tile b{font-size:clamp(18px,2.6vw,26px);font-weight:900;letter-spacing:.02em}',
      '.fg-tm{font-size:11.5px;font-weight:700;opacity:.85;line-height:1.15;text-align:center}',
      '.fg-slot-n{font-size:12px;font-weight:800;opacity:.7;text-transform:uppercase;letter-spacing:.06em}',
      '.fg-fuse{text-align:center;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.5)}',
      '.fg-word{font-size:clamp(26px,4vw,40px);font-weight:900;letter-spacing:.03em;color:#ffe08a}',
      '.fg-combine{font-size:14px;font-weight:700}.fg-change{font-size:13px;font-weight:800;color:#ffd08a;margin-top:2px}',
      '.fg-anvil-wrap.sparks::before,.fg-anvil-wrap.sparks::after{content:"";position:absolute;left:50%;top:40%;width:8px;height:8px;border-radius:50%;pointer-events:none;box-shadow:0 0 0 2px #ffd36b,40px -30px 0 1px #ffb03b,-46px -24px 0 1px #ffe08a,70px 10px 0 0 #ff8a2b,-74px 6px 0 0 #ffd36b,20px -54px 0 0 #fff2c4,-24px -58px 0 0 #ffb03b;animation:fg-spark .8s ease-out 2;opacity:0}',
      '.fg-anvil-wrap.sparks::after{animation-delay:.25s;transform:scale(1.4)}',
      '@keyframes fg-spark{0%{opacity:1;transform:scale(.3)}100%{opacity:0;transform:scale(1.8) translateY(-14px)}}',
      ':root[data-motion="off"] .fg-anvil-wrap.sparks::before,:root[data-motion="off"] .fg-anvil-wrap.sparks::after,:root[data-motion="off"] .fg-hammer{animation:none!important}',
      '@media (prefers-reduced-motion:reduce){.fg-anvil-wrap.sparks::before,.fg-anvil-wrap.sparks::after,.fg-hammer,.fg-slot.crack{animation:none!important}}',
      '.fg-rack{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;width:min(100%,760px)}',
      '.fg-tile{position:relative;min-width:96px;min-height:58px;padding:6px 12px 6px 18px;border-radius:12px;border:0;cursor:grab;font:inherit;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--fg-panel);color:var(--text,#2a2116);box-shadow:0 3px 0 rgba(0,0,0,.25),0 6px 14px rgba(0,0,0,.2);touch-action:none}',
      '.fg-tile.pre b{color:#2f6f9f}.fg-tile.root b{color:#9a4d0b}.fg-tile.suf b{color:#4f7a1e}',
      ':root[data-mode="dusk"] .fg-tile.pre b{color:#9ccbf0}:root[data-mode="dusk"] .fg-tile.root b{color:#ffb877}:root[data-mode="dusk"] .fg-tile.suf b{color:#bfe08f}',
      '.fg-tile.used{opacity:.25;box-shadow:none;cursor:default}.fg-tile.lift{opacity:.4}',
      '.fg-key{position:absolute;left:6px;top:4px;font-size:10px;font-weight:900;opacity:.55}',
      '.fg-ghost{position:fixed;z-index:400;pointer-events:none;transform:translate(-50%,-50%) scale(1.06)}',
      '.fg-msg{min-height:1.4em;max-width:720px;text-align:center;font-weight:700;font-size:13.5px;line-height:1.35;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.6);flex-shrink:0}',
      '.fg-msg.bad{display:flex;flex-direction:column;gap:4px}',
      '.fg-anvil-wrap>.fg-msg{position:absolute;left:4%;right:4%;top:6px;z-index:3;max-height:calc(100% - 12px);overflow:auto}',
      '.fg-msg.bad .fg-why,.fg-msg.info{background:var(--fg-panel);color:var(--text,#2a2116);text-shadow:none;border-radius:12px;padding:6px 12px;font-size:13.5px}',
      '.fg-msg.bad .fg-why{border-left:4px solid #e8458c}',
      '.fg-ctl{display:flex;gap:10px;justify-content:center;align-items:center;padding-bottom:4px}',
      '.fg-btn{min-height:48px;min-width:120px;padding:0 18px;border-radius:14px;border:0;font:inherit;font-weight:800;font-size:15px;cursor:pointer;background:var(--fg-panel);color:var(--text,#2a2116);box-shadow:0 3px 0 rgba(0,0,0,.25)}',
      '.fg-btn.go{background:linear-gradient(180deg,#ffcf5a,#f0a020);color:#3a2205}',
      '.fg-btn:disabled{opacity:.5;cursor:default}',
      '.fg-btn:focus-visible,.fg-tile:focus-visible,.fg-slot:focus-visible,.fg-gap:focus-visible{outline:3px solid #fff;outline-offset:2px}',
      '.fg-card,.fg-codex,.fg-miss,.fg-result .sg-cardbox{background:var(--fg-panel);backdrop-filter:blur(8px);color:var(--text,#2a2116);border-radius:18px;padding:18px 20px;max-width:560px;width:100%;box-shadow:0 8px 28px rgba(0,0,0,.3)}',
      '.fg-h{font-family:var(--display,inherit);font-weight:900;font-size:22px;margin-bottom:6px}',
      '.fg-sub{font-weight:700}.fg-steps{margin:8px 0 8px 18px;padding:0;line-height:1.6}.fg-note{color:var(--muted,#6d604f);font-size:13.5px}',
      '.fg-row{display:flex;gap:10px;justify-content:center;margin-top:12px;flex-wrap:wrap}',
      '.fg-miss{position:absolute;inset:auto;z-index:5}.fg-miss-cmp{display:flex;gap:8px;align-items:baseline;justify-content:center}.fg-miss-cmp b{font-size:20px;text-decoration:line-through;opacity:.7}',
      '.fg-miss-parts{display:flex;gap:6px;justify-content:center;align-items:center;margin:10px 0;flex-wrap:wrap}.fg-mp{display:flex;flex-direction:column;align-items:center;background:color-mix(in srgb,var(--accent,#a8650c) 12%,transparent);border-radius:10px;padding:4px 10px}.fg-mp b{font-size:20px}.fg-mp i{font-size:11.5px;font-style:normal}',
      '.fg-why{font-size:14px;line-height:1.45}',
      '.fg-typebox{display:flex;flex-direction:column;align-items:center;gap:6px;width:min(100%,480px)}.fg-typel{font-weight:800;color:#ffe9c2;text-shadow:0 1px 2px rgba(0,0,0,.5)}',
      '.fg-type{width:100%;font:inherit;font-size:26px;font-weight:800;letter-spacing:.06em;text-align:center;padding:10px;border-radius:14px;border:2px solid #ffd27a;background:color-mix(in srgb,var(--paper,#fffaf0) 94%,transparent);color:var(--text,#2a2116)}',
      '.fg-keys-host{width:100%}',
      '.fg-mark{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;background:var(--fg-panel);color:var(--text,#2a2116);border-radius:16px;padding:14px 10px}',
      '.fg-ml{font-size:clamp(24px,4vw,38px);font-weight:900}',
      '.fg-gap{width:22px;height:46px;border:0;background:transparent;cursor:pointer;position:relative}.fg-gap::after{content:"";position:absolute;left:50%;top:8px;bottom:8px;width:3px;margin-left:-1.5px;border-radius:2px;background:color-mix(in srgb,var(--text,#2a2116) 18%,transparent)}',
      '.fg-gap.on::after{background:#e07a1f;width:5px;margin-left:-2.5px;top:0;bottom:0}.fg-gap.caret{outline:2px dashed color-mix(in srgb,var(--accent,#a8650c) 60%,transparent);border-radius:6px}',
      '.fg-markright{font-weight:900;color:#ffe08a;text-shadow:0 1px 2px rgba(0,0,0,.5)}',
      '.fg-result{display:flex;flex-direction:column;align-items:center;gap:8px;width:100%}.fg-mastery{font-weight:900;color:#ffe08a}',
      '.fg-codex{max-width:880px;max-height:100%;overflow:auto}.fg-codex-h{font-family:var(--display,inherit);font-weight:900;font-size:22px}.fg-codex-sub{font-size:13px;color:var(--muted,#6d604f)}',
      '.fg-shelf{margin-top:10px;padding:10px;border-radius:14px;background:linear-gradient(180deg,rgba(122,74,34,.12),rgba(122,74,34,.28));border-bottom:8px solid rgba(122,74,34,.55)}',
      '.fg-shelf-h{font-weight:900;font-size:13px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px}',
      '.fg-plaques{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:8px}',
      '.fg-plaque{display:flex;flex-direction:column;align-items:center;border-radius:10px;padding:6px;border:2px dashed color-mix(in srgb,var(--text,#2a2116) 25%,transparent);opacity:.6}',
      '.fg-plaque.met{opacity:1;border-style:solid}.fg-plaque.gold{opacity:1;border-style:solid;background:linear-gradient(180deg,#ffe08a,#f0b429);color:#3a2205;border-color:#c98a08}',
      '.fg-plaque b{font-size:17px}.fg-plaque span{font-size:11.5px}.fg-plaque i{font-size:10.5px;font-style:normal;font-weight:800;opacity:.75}',
      '@media (max-width:640px){.fg-stage{gap:8px;padding:8px 10px}.fg-hud.sg-hud{grid-template-columns:1fr 1fr;grid-template-areas:"c c" "l r";gap:6px}.fg-hc{grid-area:c;display:flex;justify-content:center}.fg-hl{grid-area:l}.fg-hr{grid-area:r}.fg-title{padding:4px 8px}.fg-mean,.fg-heat{width:100%}.fg-name{font-size:15px}.fg-mean-t{font-size:12px;-webkit-line-clamp:3}.fg-heat b{font-size:12px}.fg-btn{min-width:0;flex:1;font-size:14px;padding:0 8px}.fg-tile{min-width:84px;min-height:52px}.fg-slot{min-height:64px}.fg-hammer{width:40px;height:40px;top:-26px}.fg-ctl{gap:8px}}'
    ].join('\n');
    document.head.appendChild(s);
  }

  window.SB_FORGE_UI = {
    mount: mount, open: open, signed: signed, start: start, begin: begin,
    /* the test hook: the round's state, and the same actions a tap or a key reaches */
    state: function () { return G; }, useWords: function (ws) { if (!G) start(); G.words = ws.slice(); G.log = []; G.right = 0; G.done = undefined; setWord(0); }, place: place, unplace: unplace, forge: forge, hint: hint, next: next,
    typeKey: typeKey, typeEnter: typeEnter, toggleCut: toggleCut, checkCuts: checkCuts, cur: cur
  };
})();
