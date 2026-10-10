/* analogy.js — THE ANALOGIES TAB: an atlas of links between words, its lessons, and two games.

   Owner, 9 Oct 2026: "we need a separate analogies tab next to the word gym … treat this like word
   atlas … a visual journey … lessons and words based on those lessons … practice sessions leading to
   mastery of the level", "an analogy based mock spelling bee … Mock Analogy Bee", "against the clock".

   The data is analogy-data.js (SB_ANALOGY), cut by tools/analogy/build-app.cjs from Bee's own words:
   four regions by Bee level band, a stop per lesson in each, and a level check per region drawn from
   items no stop uses. Lazy: boot-lazy group `analogy`, opened by app.openAnalogies / app.openAnlBee.

   The rules it keeps (the family's, and the games spec's):
     · a stop is Learn → Meet the words → Practice (relation first: name the link, then answer) →
       Check; a check passes at 80%. The level check opens when every stop is passed; passing it walks
       the region and opens the next; passing it again on ANOTHER DAY, on items not seen before, is
       mastery — the only thing the tab calls mastered;
     · a miss HOLDS with the right answer's link said out loud and why the chosen word tempted, until
       Continue; a right answer may move on by itself;
     · keys 1–5 or A–E pick, Enter continues, Esc leaves; every control is a button big enough to tap;
     · pay is `answer` 1 per right only from the sixth right in a round (above chance), `contest` only
       behind a pass or a podium, `mastery` only from the later-day record — nothing for finishing;
     · nothing here calls Math.random: option order, stems and rivals all come from a hash;
     · no definition is on screen while a question is open (it would give the link away). */
(function () {
  'use strict';
  const W = window;
  const D = () => W.SB_ANALOGY || null;
  const esc = (s) => (W.esc ? W.esc(s) : String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])));
  const escA = (s) => (W.escA ? W.escA(s) : esc(s));
  const ic = (n, s) => { try { return iconSVG(n, s || 18, 2.3); } catch (e) { return ''; } };
  const kid = () => { try { return active(); } catch (e) { return null; } };
  const dev = () => { try { return !!state.devUnlock; } catch (e) { return false; } };
  function day() { const t = new Date(); return t.getFullYear() + '-' + (t.getMonth() + 1) + '-' + t.getDate(); }

  /* ------------------------------------------------------------------ hashes, never chance */
  function hash(s) { let x = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
  function perm(seed, n) { const a = [...Array(n).keys()]; let h = hash(seed);
    for (let i = n - 1; i > 0; i--) { h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; const j = h % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  /* ------------------------------------------------------------------ the child's record */
  function rec() { const c = kid(); if (!c) return { stops: {}, regs: {}, seen: {}, bee: {}, n: 0 };
    const r = c.anl || (c.anl = {}); r.stops = r.stops || {}; r.regs = r.regs || {}; r.seen = r.seen || {}; r.bee = r.bee || {}; r.n = r.n || 0; return r; }
  const stopRec = (id) => { const r = rec(); return r.stops[id] || (r.stops[id] = {}); };
  const regRec = (id) => { const r = rec(); return r.regs[id] || (r.regs[id] = {}); };
  const passed = (id) => !!(rec().stops[id] || {}).pass;
  const walked = (id) => !!(rec().regs[id] || {}).walk;
  const mastered = (id) => !!(rec().regs[id] || {}).mast;
  const store = () => { try { save(); } catch (e) {} };

  /* ------------------------------------------------------------------ the data */
  const lesson = (id) => (D().lessons || []).find((l) => l.id === id) || null;
  const lessonOfRel = (rel) => (D().lessons || []).find((l) => l.rels.indexOf(rel) >= 0) || null;
  const regions = () => (D() ? D().regions : []);
  const regionById = (id) => regions().find((r) => r.id === id) || null;
  function stopById(id) { for (const r of regions()) { const s = r.stops.find((x) => x.id === id); if (s) return { r, s }; if (r.id + '-check' === id) return { r, s: null }; } return null; }
  function regionOpen(i) { if (dev() || i === 0) return true; const prev = regions()[i - 1]; return !!prev && walked(prev.id); }
  function stopOpen(r, j) { const i = regions().indexOf(r); if (!regionOpen(i)) return false; if (dev() || j === 0) return true;
    if (j >= r.stops.length) return r.stops.every((s) => passed(s.id)); return passed(r.stops[j - 1].id); }
  /* where the child is: the first open stop not yet passed, in the furthest open region */
  function here() { const R = regions(); let at = null;
    R.forEach((r, i) => { if (!regionOpen(i)) return; const j = r.stops.findIndex((s, k) => stopOpen(r, k) && !passed(s.id));
      if (j >= 0) at = { r, j }; else if (!walked(r.id)) at = { r, j: r.stops.length }; else if (!at) at = { r, j: r.stops.length }; });
    return at || (R[0] ? { r: R[0], j: 0 } : null); }

  /* ------------------------------------------------------------------ words for display */
  const cap = (s) => String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1);
  function s3(v) { v = String(v || ''); if (/(s|sh|ch|x|z|o)$/.test(v)) return v + 'es'; if (/[^aeiou]y$/.test(v)) return v.slice(0, -1) + 'ies'; return v + 's'; }
  const an = (w) => (/[^s]s$/i.test(w) ? '' : /^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;   // "scissors", not "a scissors"
  /* a lesson's bridge sentence, filled: "{A} is a kind of {B}." → "A robin is a kind of bird." */
  function bridge(tpl, a, b, rel) {
    let s = String(tpl || '');
    if (rel === 'kind' || rel === 'part' || rel === 'material' || rel === 'function') s = s.replace('{A}', an(a)).replace('{B}', rel === 'part' ? an(b) : b);
    if (rel === 'agent') s = s.replace('{B}', an(b)).replace('{As}', s3(a));
    s = s.replace('{A}', a).replace('{B}', b).replace('{As}', s3(a));
    return cap(s); }
  const FAMILY_SAYS = { action: '{B} is what you call it when you {A}.', quality: '{B} is what you have when you are {A}.',
    relating: '{B} describes something full of {A}, or like it.', able: '{B} means it can be {A}ed.' };
  function linkLine(rel, a, b) { const L = lessonOfRel(rel); if (!L) return cap(a) + ' goes with ' + b + '.';
    if (L.id === 'family' && FAMILY_SAYS[rel]) return cap(FAMILY_SAYS[rel].replace('{A}', a).replace('{B}', b));
    return bridge(L.bridge, a, b, rel); }

  /* ------------------------------------------------------------------ one question from one item */
  /* items[id] = [rel, level, C, D, "wrong|recipe", …]; a stem comes from the lesson's hand-written bank,
     never sharing a word with the item; the option order is a hash of the item and the attempt */
  function stemFor(L, rel, words, seed) { const pool = (L.stems || []).filter((x) => (x[2] || rel) === rel || L.id !== 'family');
    const ok = pool.filter((x) => words.indexOf(x[0]) < 0 && words.indexOf(x[1]) < 0);
    const P = ok.length ? ok : (L.stems || []); return P.length ? P[hash(seed) % P.length] : ['?', '?']; }
  function question(id, nOpts, seed) { const it = D().items[id]; if (!it) return null;
    const [rel, lv, c, d] = it; const wrong = it.slice(4).map((x) => { const p = String(x).split('|'); return { w: p[0], k: p[1] || 'a' }; });
    const L = lessonOfRel(rel); if (!L) return null;
    const use = wrong.slice(0, Math.max(1, Math.min(wrong.length, nOpts - 1)));
    const words = [c, d].concat(use.map((x) => x.w));
    const st = stemFor(L, rel, words, id + '|' + seed);
    const opts = [d].concat(use.map((x) => x.w)); const ord = perm(id + '#' + seed, opts.length); const shown = ord.map((i) => opts[i]);
    const why = {}; use.forEach((x) => { why[x.w] = x.k; });
    return { id, rel, lv, c, d, a: st[0], b: st[1], opts: shown, ans: shown.indexOf(d), why, lesson: L.id }; }
  /* the relation-first step: three ways the stem pair could be linked, one of them true. Every option uses the
     same plain wording (no articles, no verb endings), so the right one cannot be picked out by its polish;
     the wrong ones come from the lessons a child is most likely to confuse with this one. */
  const PLAIN = { same: '{A} means about the same as {B}.', opposite: '{A} is the opposite of {B}.', kind: '{A} is a kind of {B}.',
    part: '{A} is part of {B}.', made: '{A} is made from {B}.', use: '{A} is used to {B}.', who: '{A} is what {B} does.',
    family: '{A} and {B} are one idea doing two different jobs.', degree: '{B} is a stronger {A}.' };
  const NEAR = { same: ['opposite', 'degree', 'family'], opposite: ['same', 'degree', 'family'], degree: ['same', 'opposite', 'family'],
    kind: ['part', 'made', 'same'], part: ['kind', 'made', 'same'], made: ['part', 'kind', 'use'], use: ['who', 'made', 'kind'],
    who: ['use', 'family', 'same'], family: ['same', 'opposite', 'who'] };
  const plain = (id, a, b) => cap(String(PLAIN[id] || '').replace('{A}', a).replace('{B}', b));
  function bridgeQ(q, seed) { const near = (NEAR[q.lesson] || []).filter((id) => PLAIN[id]);
    const first = near[hash(seed + 'b1') % Math.max(1, near.length)]; const rest = near.filter((id) => id !== first);
    const second = rest[hash(seed + 'b2') % Math.max(1, rest.length)];
    const right = plain(q.lesson, q.a, q.b);
    const lines = [right].concat([first, second].filter(Boolean).map((id) => plain(id, q.a, q.b)));
    const ord = perm(seed + 'bridge', lines.length); const shown = ord.map((i) => lines[i]);
    return { lines: shown, ans: shown.indexOf(right) }; }
  /* why the chosen wrong word tempted, from the recipe that put it there */
  function tempted(q, w) { const k = q.why[w] || 'a'; const C = q.c;
    if (k === 'a') return '“' + w + '” goes with “' + C + '”, but it is not linked to it the way ' + q.a + ' is linked to ' + q.b + '.';
    if (k.indexOf('o:') === 0) { const L = lessonOfRel(k.slice(2)); return '“' + w + '” is linked to “' + C + '” another way' + (L ? ' (' + L.title.toLowerCase() + ')' : '') + ', not this way.'; }
    if (k === 's') return '“' + w + '” is the right kind of answer, but for a different pair.';
    if (k === 'f') return '“' + w + '” is in the same word family as the answer, but it does a different job.';
    return '“' + w + '” is close, but it is not the link.'; }

  /* ------------------------------------------------------------------ state */
  /* state.anl = { v: 'map'|'lesson'|'words'|'run'|'done'|'clock', reg, stop, run } — one live screen */
  const S = () => (state.anl = state.anl || { v: 'map' });
  let clockT = null;
  function stopClock() { if (clockT) { cancelAnimationFrame(clockT.raf); clockT = null; } }
  function open(sub) { stopClock(); const s = state.anl = { v: 'map' };
    const h = here(); if (h) { s.reg = h.r.id; s.stop = h.j < h.r.stops.length ? h.r.stops[h.j].id : h.r.id + '-check'; }
    if (sub === 'clock') { s.v = 'clock'; s.run = null; }
    state.nav = 'analogy'; state.screen = 'app'; state.game = null; try { render(); } catch (e) {} }
  function stop() { stopClock(); const s = state.anl; if (s && s.run && s.run.phase !== 'done') s.run.phase = 'left'; }
  const route = () => { const s = state.anl || {}; if (s.v === 'clock') return 'analogies/clock';
    if (s.stop && (s.v === 'lesson' || s.v === 'words')) return 'analogies/' + s.stop + '/' + (s.v === 'lesson' ? 'learn' : 'words');
    return 'analogies' + (s.reg ? '/' + s.reg : ''); };
  function openRoute(parts) { open(parts[0] === 'clock' ? 'clock' : null); const s = S();
    if (parts[0] && regionById(parts[0])) { s.reg = parts[0]; }
    const hit = parts[0] && stopById(parts[0]);
    if (hit) { const i = regions().indexOf(hit.r); const j = hit.s ? hit.r.stops.indexOf(hit.s) : hit.r.stops.length;
      if (stopOpen(hit.r, j)) { s.reg = hit.r.id; s.stop = parts[0]; if (parts[1] === 'learn') s.v = 'lesson'; else if (parts[1] === 'words') s.v = 'words'; } }
    try { render(); } catch (e) {} }

  /* ------------------------------------------------------------------ the one word door's list */
  /* EVERY word an item puts on screen — C, the answer and each wrong answer — passes kidSafe for THIS child
     (app3's door to kid-safe.js: its families, the stigma scan of the word and its gloss, and the under-eleven
     list). An item that fails is never asked: not in a stop, a level check, the clock or the Mock Analogy Bee
     (the 4.5 brief, P0.7 — the Atlas was asking an eight-year-old about murder). tests/word-door-seeded.cjs. */
  function itemWords(it) { return [it[2], it[3]].concat(it.slice(4).map((x) => String(x).split('|')[0])); }
  /* remembered per item for this child's age (the Bee asks the whole pool every round) */
  let okFor = '', okMemo = {};
  function itemOK(id) { const A0 = D(), it = A0 && A0.items[id]; if (!it) return false; if (typeof W.kidSafe !== 'function') return true;
    const c = kid(), key = c ? (c.age || '') + '|' + (c.ageBand || '') : '';
    if (key !== okFor) { okFor = key; okMemo = Object.create(null); }
    if (id in okMemo) return okMemo[id];
    const G = A0.gloss || {};
    return (okMemo[id] = itemWords(it).every((w) => { try { return !!W.kidSafe({ w, d: G[w] || '' }, c); } catch (e) { return true; } })); }
  const safeIds = (ids) => (ids || []).filter(itemOK);

  /* ------------------------------------------------------------------ rounds */
  const PER = { practice: 8, check: 8, level: 10 };
  function itemsFor(kind, hit, r) { const all = safeIds(hit && hit.s ? hit.s.items : r.check); const seen = rec().seen;
    const n = PER[kind] || 8; const sr = hit && hit.s ? stopRec(hit.s.id) : regRec(r.id);
    if (kind === 'practice') { const k = sr.prac = (sr.prac || 0) + 1; const off = (k * n) % Math.max(1, all.length); return [...Array(Math.min(n, all.length))].map((_, i) => all[(off + i) % all.length]); }
    /* evidence is on items this child has not answered before, wherever they can be found */
    const fresh = all.filter((id) => !seen[id]); const old = all.filter((id) => seen[id]).sort((a, b) => seen[a] - seen[b]);
    return fresh.concat(old).slice(0, n); }
  function optsFor(kind, r) { return kind === 'level' ? Math.max(4, r.opts) : kind === 'clock' ? 4 : r.opts; }
  function startRun(kind) { stopClock(); const s = S(); const hit = stopById(s.stop); const r = hit ? hit.r : regionById(s.reg); if (!r) return;
    const ids = itemsFor(kind, hit, r); const seed = day() + '|' + (rec().n++);
    s.run = { kind, ids, seed, i: 0, right: 0, asked: 0, paid: 0, e0: (W.earnedSoFar ? earnedSoFar() : 0), log: [], n: ids.length,
      opts: optsFor(kind, r), reg: r.id, stop: hit && hit.s ? hit.s.id : null, phase: kind === 'practice' ? 'bridge' : 'pick' };
    s.v = 'run'; prep(s.run); store(); render(); }
  function prep(g) { g.q = question(g.ids[g.i % g.ids.length], g.opts, g.seed + '|' + g.i); g.picked = null; g.bpick = null;
    if (g.phase === 'bridge') g.bq = bridgeQ(g.q, g.seed + '|' + g.i); }
  /* pay only above chance: nothing until a round holds 6 right, then every right (the clock: 60% and 15 asked) */
  function owed(g) { if (g.kind === 'clock') { const acc = g.asked ? g.right / g.asked : 0; if (acc < 0.6) return 0; return (g.phase === 'done' ? g.right >= 6 : g.asked >= 15) ? g.right : 0; }
    return g.right >= 6 ? g.right : 0; }
  function settle(g) { let k = owed(g) - g.paid; while (k-- > 0) { g.paid++; try { payG(g); } catch (e) {} } }
  function pickBridge(i) { const g = (S().run); if (!g || g.phase !== 'bridge' || g.bpick != null) return; g.bpick = +i;
    try { sfx(g.bpick === g.bq.ans ? 'correct' : 'wrong'); } catch (e) {}
    render(); if (g.bpick === g.bq.ans) after(g, 900, () => { g.phase = 'pick'; render(); }); }
  function pick(i) { const s = S(); const g = s.run; if (!g || g.picked != null || (g.phase !== 'pick')) return; i = +i; const q = g.q; if (!(i >= 0 && i < q.opts.length)) return;
    if (g.kind === 'clock' && g.held) return;
    const ok = i === q.ans; g.picked = i; g.asked++; if (ok) g.right++;
    g.log.push({ c: q.c, d: q.d, rel: q.rel, ok, w: q.opts[i] }); rec().seen[q.id] = Date.now();
    try { sfx(ok ? 'correct' : 'wrong'); } catch (e) {}
    if (ok) settle(g);
    if (g.kind === 'clock') { if (!ok) { clockAdd(-2000); g.held = true; } else after(g, 380, next); render(); return; }
    if (ok) after(g, 1500, next); render(); }
  function after(g, ms, fn) { const tok = g.tok = (g.tok || 0) + 1; g.go = () => { if (S().run !== g || g.tok !== tok) return; g.tok++; g.go = null; fn(); };
    setTimeout(() => { if (g.go && g.tok === tok) g.go(); }, ms); }
  function cont() { const s = S(); const g = s.run; if (!g) return;
    if (g.phase === 'done') { if (g.kind === 'clock') { s.v = 'clock'; s.run = null; render(); } else startRun(g.kind); return; }
    if (g.go) { g.go(); return; }
    if (g.phase === 'bridge' && g.bpick != null) { g.phase = 'pick'; render(); return; }
    if (g.picked == null) return;
    if (g.kind === 'clock') { g.held = false; }
    next(); }
  function next() { const s = S(); const g = s.run; if (!g || g.phase === 'done') return; g.i++;
    if (g.kind !== 'clock' && g.i >= g.n) { finish(g); return; }
    g.phase = g.kind === 'practice' ? 'bridge' : 'pick'; prep(g); render(); }
  function finish(g) { if (g.phase === 'done') return; stopClock(); g.phase = 'done'; settle(g);
    const pct = g.asked ? g.right / g.asked : 0; g.pct = pct; g.pass = pct >= 0.8;
    if (g.stop) { const sr = stopRec(g.stop); if (g.kind === 'practice') sr.pb = Math.max(sr.pb || 0, g.right);
      if (g.kind === 'check') { sr.cb = Math.max(sr.cb || 0, g.right); if (g.pass) { sr.pass = 1; sr.at = sr.at || day(); } } }
    if (g.kind === 'level') { const rr = regRec(g.reg); rr.best = Math.max(rr.best || 0, g.right);
      if (g.pass) { const pass = true; const d0 = day(); rr.days = (rr.days || []).filter((x) => x !== d0).concat([d0]).slice(-4);
        if (!rr.walk) { rr.walk = d0; g.walkedNow = true; }
        /* a pass of the level is a pass mark: one contest coin, once a day per region */
        if (pass && rr.paidDay !== d0) { try { addCoins('contest'); } catch (e) {} rr.paidDay = d0; }
        const later = (rr.days || []).length >= 2;
        if (later && !rr.mast) { rr.mast = d0; g.masteredNow = true; try { addCoins('mastery'); } catch (e) {} } } }
    if (g.kind === 'clock') { try { if (W.SB_BESTS) g.newBest = SB_BESTS.put('anl/clock', g.right, null) && g.right > 0; } catch (e) {} }
    g.coins = (W.earnedSoFar ? earnedSoFar() : g.e0 + g.paid) - g.e0;
    try { if (W.logActivity) logActivity('analogy', 'Analogies', { done: g.asked, right: g.right, coins: g.coins }, []); } catch (e) {}
    try { if (g.pass || g.newBest) { sfx('win'); burstConfetti(g.masteredNow ? 120 : 70); } else sfx('level'); } catch (e) {}
    store(); render(); }

  /* ------------------------------------------------------------------ the clock: real time, held while a miss is up */
  const CLOCK_MS = 60000;
  function startClock() { const s = S(); const h = here(); const r = h ? h.r : regions()[0]; if (!r) return;
    const lvHi = r.lv[1]; const pool = []; const A0 = D();
    regions().forEach((rg) => { if (rg.lv[0] <= lvHi) { rg.stops.forEach((st) => pool.push(...st.items)); } });
    (A0.games || []).forEach((id) => { const it = A0.items[id]; if (it && it[1] <= lvHi + 1) pool.push(id); });
    const safe = safeIds(pool); const seed = day() + '|clock|' + (rec().n++); const ord = perm(seed, safe.length).map((i) => safe[i]);
    s.run = { kind: 'clock', ids: ord, seed, i: 0, right: 0, asked: 0, paid: 0, e0: (W.earnedSoFar ? earnedSoFar() : 0), log: [], n: ord.length, opts: 4, phase: 'pick', left: CLOCK_MS, reg: r.id };
    s.v = 'run'; prep(s.run); store(); render(); runClock(s.run); }
  function clockAdd(ms) { const g = S().run; if (g) g.left = Math.max(0, g.left + ms); }
  function runClock(g) { stopClock(); let last = performance.now();
    const tick = (now) => { if (!clockT) return; clockT.raf = requestAnimationFrame(tick);
      const s = state.anl; if (state.nav !== 'analogy' || !s || s.run !== g || g.phase === 'done') { stopClock(); return; }
      const dt = Math.min(250, now - last); last = now; if (document.hidden || g.held) return;
      g.left -= dt; const el = document.getElementById('anl-time');
      if (el) { const t = Math.max(0, Math.ceil(g.left / 1000)) + 's'; if (el.textContent !== t) el.textContent = t; el.classList.toggle('low', g.left <= 10000); }
      if (g.left <= 0) { g.left = 0; finish(g); } };
    clockT = { raf: requestAnimationFrame(tick) }; }

  /* ------------------------------------------------------------------ the map: code-drawn scenery */
  /* The road runs as the Atlas's does — in from the bottom left, right along the bottom third, back left
     across the middle, out at the top right — and the scenery sits in the pockets between its sweeps.
     Positions come from a seeded hash, so a region looks the same every visit. */
  const ROAD = [[96, 810], [480, 826], [960, 768], [1360, 676], [1420, 540], [1100, 470], [660, 466], [280, 404], [210, 262], [560, 172], [1020, 180], [1500, 104]];
  function crPath(P) { let d = 'M' + P[0][0] + ' ' + P[0][1];
    for (let i = 0; i < P.length - 1; i++) { const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ' C' + c1.map(Math.round).join(' ') + ' ' + c2.map(Math.round).join(' ') + ' ' + p2.join(' '); }
    return d; }
  function crPoints(P, per) { const out = [];
    for (let i = 0; i < P.length - 1; i++) { const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
      for (let k = 0; k < per; k++) { const t = k / per, t2 = t * t, t3 = t2 * t;
        const f = (a, b, c, d) => 0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]); } }
    out.push(P[P.length - 1]); return out; }
  const ROAD_PTS = crPoints(ROAD, 24);
  /* Painted maps (voice/pipeline/analogy-maps.py → app-art/anl-<region>.jpg, 16:9 like the board). A region listed here
     shows its painting instead of the drawn scenery, and its road is the one TRACED ALONG THE PAINTED BAND, in the board's
     1600×900 space — measured by eye against the picture, exactly like the Atlas's ACT_MAP. Regenerate a map, re-trace it.
     tests/analogy-data.cjs holds every image named here to a file in app-art. */
  const ART = {
    ponds: { img: 'anl-ponds.jpg', road: [[70, 870], [200, 720], [400, 652], [700, 645], [1000, 640], [1230, 628], [1360, 540], [1390, 420], [1330, 300], [1200, 238], [950, 235], [700, 238], [450, 245], [300, 272]] },
    orchard: { img: 'anl-orchard.jpg', road: [[40, 800], [250, 748], [600, 738], [1000, 745], [1300, 712], [1410, 600], [1330, 492], [1100, 442], [750, 428], [400, 422], [220, 372], [180, 262], [300, 162], [650, 118], [1000, 112], [1300, 86], [1560, 40]] },
    workshop: { img: 'anl-workshop.jpg', road: [[60, 860], [250, 732], [550, 702], [900, 702], [1150, 660], [1220, 560], [1120, 482], [880, 442], [620, 418], [430, 392], [310, 300], [350, 196], [600, 160], [850, 215], [1050, 288], [1300, 262], [1400, 150], [1330, 50]] },
    peaks: { img: 'anl-peaks.jpg', road: [[230, 185], [130, 290], [90, 430], [150, 580], [330, 690], [600, 745], [870, 765], [1120, 722], [1330, 652], [1450, 520], [1450, 380], [1400, 230], [1380, 90]] },
  };
  const GEO = {};
  function geo(id) { if (GEO[id]) return GEO[id]; const P = (ART[id] && ART[id].road) || ROAD; const pts = crPoints(P, 24);
    const len = [0]; for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return (GEO[id] = { d: crPath(P), pts, len }); }
  function along(g, f) { const L = g.len, T = L[L.length - 1] * f; let i = L.findIndex((x) => x >= T); if (i <= 0) return g.pts[0];
    const a = g.pts[i - 1], b = g.pts[i], u = (T - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]); return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]; }
  const POCKETS = [[120, 560, 1160, 700], [1180, 250, 1580, 600], [420, 250, 1460, 400], [10, 20, 150, 330], [1120, 760, 1590, 890], [20, 470, 230, 720]];
  function rng(seed) { let s = hash(seed) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  function spots(seed, n, pocketIx, minGap) { const R = rng(seed); const out = []; let guard = 0;
    while (out.length < n && guard++ < n * 40) { const P = POCKETS[pocketIx[Math.floor(R() * pocketIx.length)]];
      const x = P[0] + R() * (P[2] - P[0]), y = P[1] + R() * (P[3] - P[1]);
      if (ROAD_PTS.some((p) => Math.hypot(p[0] - x, p[1] - y) < 92)) continue;
      if (out.some((o) => Math.hypot(o[0] - x, o[1] - y) < (minGap || 70))) continue; out.push([x, y, R()]); }
    return out.sort((a, b) => a[1] - b[1]); }
  const tree = (x, y, s, leaf, dark) => `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${s.toFixed(2)})"><rect x="-5" y="-6" width="10" height="34" rx="3" fill="#7A5232"/><circle cx="0" cy="-26" r="30" fill="${dark}"/><circle cx="-14" cy="-20" r="22" fill="${leaf}"/><circle cx="12" cy="-32" r="20" fill="${leaf}"/><circle cx="6" cy="-14" r="16" fill="${dark}" opacity=".55"/></g>`;
  function sceneFor(id) {
    if (ART[id]) return `<div class="anl-scene anl-paint"><img src="app-art/${ART[id].img}" alt="" decoding="async"></div>`;
    const R = rng(id); let sky, ground, far, mid, bits = ''; const ROAD_D = geo(id).d;
    if (id === 'ponds') { sky = ['#BFE3F2', '#FBE7C6']; ground = ['#A7D58A', '#78B86A']; far = '#9CC7A4'; mid = '#8CC27A';
      bits += [[430, 620, 150, 54], [760, 632, 140, 50]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx + 10}" ry="${ry + 8}" fill="#6FA45E"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#5FB7D6"/><ellipse cx="${x - 30}" cy="${y - 14}" rx="${rx * 0.5}" ry="${ry * 0.28}" fill="#BDE6F2" opacity=".7"/>` +
        [0, 1, 2].map((k) => `<ellipse cx="${x - 60 + k * 48}" cy="${y + 10 - k * 6}" rx="16" ry="7" fill="#3E8C4E"/><circle cx="${x - 56 + k * 48}" cy="${y + 6 - k * 6}" r="4" fill="#F7B7D2"/>`).join('')).join('');
      bits += `<path d="M596 600 q24 -30 48 0" fill="none" stroke="#9A6A3E" stroke-width="8"/><path d="M596 600 q24 -30 48 0" fill="none" stroke="#C99A62" stroke-width="3"/>`;
      spots(id + 'w', 9, [1, 2, 3, 5], 110).forEach(([x, y, r]) => { bits += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${(0.7 + r * 0.5).toFixed(2)})"><rect x="-4" y="-10" width="8" height="40" rx="3" fill="#7A5232"/><ellipse cx="0" cy="-26" rx="34" ry="26" fill="#6DB25A"/>${[-24, -12, 0, 12, 24].map((dx) => `<path d="M${dx} -20 q${dx / 6} 30 ${dx / 3} 52" stroke="#4E9447" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('')}</g>`; });
      spots(id + 'r', 16, [0, 4], 50).forEach(([x, y]) => { bits += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} l-6 -26 M${x.toFixed(0)} ${y.toFixed(0)} l2 -32 M${x.toFixed(0)} ${y.toFixed(0)} l8 -24" stroke="#4F8C3C" stroke-width="3" stroke-linecap="round"/><ellipse cx="${(x + 2).toFixed(0)}" cy="${(y - 30).toFixed(0)}" rx="3" ry="8" fill="#8A5A2B"/>`; }); }
    else if (id === 'orchard') { sky = ['#CDE7F5', '#FFE3B0']; ground = ['#C7D97A', '#93B95A']; far = '#B6CC8E'; mid = '#A2C46A';
      for (let k = 0; k < 4; k++) bits += `<path d="M0 ${520 + k * 40} q800 -60 1600 0" fill="none" stroke="#86A84E" stroke-width="3" opacity=".45"/>`;
      spots(id + 't', 16, [0, 1, 2, 5], 82).forEach(([x, y, r]) => { bits += tree(x, y, 0.75 + r * 0.4, '#79B356', '#5E9A45') + [0, 1, 2, 3].map((k) => `<circle cx="${(x - 18 + k * 12).toFixed(0)}" cy="${(y - 26 * (0.75 + r * 0.4) - (k % 2) * 12).toFixed(0)}" r="5" fill="${r > 0.5 ? '#E5483A' : '#F2C230'}"/>`).join(''); });
      bits += `<g transform="translate(1320 380)"><path d="M-26 70 L-14 -40 L14 -40 L26 70Z" fill="#E8D8B8" stroke="#8E7350" stroke-width="3"/><rect x="-8" y="30" width="16" height="40" fill="#8E5E36"/><g transform="translate(0 -40)">${[0, 90, 180, 270].map((a) => `<rect x="-6" y="-78" width="12" height="78" fill="#F4EEDC" stroke="#8E7350" stroke-width="2" transform="rotate(${a + 20})"/>`).join('')}<circle r="8" fill="#6A4A2A"/></g></g>`;
      spots(id + 'h', 4, [4], 60).forEach(([x, y]) => { bits += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})"><rect x="-18" y="-30" width="36" height="30" rx="3" fill="#F2D27A" stroke="#A9832F" stroke-width="2"/><rect x="-22" y="-36" width="44" height="8" rx="3" fill="#C99A3E"/><path d="M-14 -20h28M-14 -10h28" stroke="#A9832F" stroke-width="2"/></g>`; }); }
    else if (id === 'workshop') { sky = ['#F6C27A', '#E88B5A']; ground = ['#C9A46A', '#9B7A4A']; far = '#B98E6E'; mid = '#A98A5A';
      bits += `<path d="M1180 900 C1260 700 1480 640 1600 600 L1600 900Z" fill="#6FA8C8" opacity=".9"/>`;
      spots(id + 'b', 9, [0, 1, 2, 3], 120).forEach(([x, y, r]) => { const w = 80 + r * 40, h = 54 + r * 20;
        bits += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})"><rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" fill="#E9D3AE" stroke="#7A5A3A" stroke-width="3"/><path d="M${-w / 2 - 10} ${-h} L0 ${-h - 40} L${w / 2 + 10} ${-h}Z" fill="#B5523B" stroke="#7A3A2A" stroke-width="3"/><rect x="${-w / 4 - 10}" y="${-h + 14}" width="20" height="18" fill="#FFD27A"/><rect x="${w / 4 - 10}" y="${-h + 14}" width="20" height="18" fill="#FFD27A"/><rect x="${w / 2 - 22}" y="${-h - 34}" width="12" height="26" fill="#7A5A3A"/>${[0, 1, 2].map((k) => `<circle cx="${w / 2 - 16 + k * 10}" cy="${-h - 46 - k * 20}" r="${8 + k * 4}" fill="#EDE3D6" opacity="${0.6 - k * 0.15}"/>`).join('')}</g>`; });
      bits += `<g transform="translate(1250 760)"><circle r="56" fill="none" stroke="#6A4A2A" stroke-width="10"/>${[0, 30, 60, 90, 120, 150].map((a) => `<rect x="-4" y="-56" width="8" height="112" fill="#8A6A44" transform="rotate(${a})"/>`).join('')}<circle r="10" fill="#5A3A1A"/></g>`; }
    else { sky = ['#7FB8F0', '#DCEFFC']; ground = ['#A9B89A', '#7E9478']; far = '#A9B9D6'; mid = '#93A6B8';
      for (let k = 0; k < 14; k++) { const x = k * 125 + (k % 2) * 40, y = 780 + (k % 3) * 34; bits += `<circle cx="${x}" cy="${y}" r="${90 + (k % 4) * 18}" fill="#F7FAFD" opacity=".85"/>`; }
      spots(id + 'p', 7, [0, 1, 2, 3, 4], 170).forEach(([x, y, r]) => { const s = 0.8 + r * 0.7;
        bits += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${s.toFixed(2)})"><path d="M-90 40 L-10 -150 L20 -110 L90 40Z" fill="#8C8577"/><path d="M-10 -150 L20 -110 L90 40 L10 40Z" fill="#6E685C"/><path d="M-36 -86 L-10 -150 L14 -118 L0 -96Z" fill="#FFFFFF"/></g>`; });
      bits += `<path d="M300 300 Q520 360 760 292" stroke="#6A4A2A" stroke-width="5" fill="none"/><path d="M300 314 Q520 374 760 306" stroke="#6A4A2A" stroke-width="5" fill="none"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => { const t = k / 8; const x = 300 + 460 * t; const y = 300 + 60 * 4 * t * (1 - t) - 8 * t; return `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="10" height="18" fill="#B98A5A"/>`; }).join('')}`;
      bits += [0, 1, 2, 3].map((k) => `<path d="M${360 + k * 110} ${318 + (k % 2) * 6} l14 8 l-14 8z" fill="${['#E5483A', '#F2C230', '#3FAE6A', '#3B82F6'][k]}"/>`).join('');
      bits += `<g transform="translate(1480 120)"><rect x="-14" y="-10" width="28" height="70" fill="#C7C2B6" stroke="#6E685C" stroke-width="3"/><circle cy="-18" r="18" fill="#FFD27A"/><circle cy="-18" r="40" fill="#FFD27A" opacity=".22"/></g>`;
      spots(id + 'q', 10, [0, 2, 5], 70).forEach(([x, y, r]) => { bits += `<path d="M${x.toFixed(0)} ${(y - 50).toFixed(0)} l-16 34 h10 l-14 26 h40 l-14 -26 h10z" fill="#3E6E52"/>`; }); }
    const hills = (y, col, amp, seedK) => { const r2 = rng(id + seedK); let d = 'M0 900 L0 ' + y; for (let x = 0; x <= 1600; x += 160) d += ' Q' + (x + 80) + ' ' + (y - amp * r2()) + ' ' + (x + 160) + ' ' + (y + amp * 0.3 * (r2() - 0.5)); return `<path d="${d} L1600 900Z" fill="${col}"/>`; };
    return `<svg class="anl-scene" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs><linearGradient id="anl-sky-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient>
      <linearGradient id="anl-gr-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ground[0]}"/><stop offset="1" stop-color="${ground[1]}"/></linearGradient></defs>
      <rect width="1600" height="900" fill="url(#anl-sky-${id})"/>${hills(150, far, 70, 'f')}${hills(230, mid, 60, 'm')}
      <path d="M0 900 L0 300 Q400 250 800 290 T1600 280 L1600 900Z" fill="url(#anl-gr-${id})"/>
      ${bits}
      <path d="${ROAD_D}" fill="none" stroke="#7A5A3A" stroke-width="72" stroke-linecap="round" opacity=".18"/>
      <path d="${ROAD_D}" fill="none" stroke="#E9D2A0" stroke-width="64" stroke-linecap="round"/>
      <path d="${ROAD_D}" fill="none" stroke="#C9A86A" stroke-width="64" stroke-linecap="round" opacity=".25" stroke-dasharray="2 18"/></svg>`; }

  /* ------------------------------------------------------------------ lesson icons, drawn here */
  const LIC = {
    same: '<path d="M7 9h10M7 15h10"/>', opposite: '<path d="M4 9h12l-3-3M20 15H8l3 3"/>', kind: '<circle cx="12" cy="6" r="2.4"/><path d="M12 8.4V12M6 18v-3h12v3M12 12v3"/><circle cx="6" cy="19.5" r="1.6"/><circle cx="18" cy="19.5" r="1.6"/>',
    part: '<path d="M5 5h6v3a2 2 0 1 0 0 4v3H5zM13 5h6v10h-6v-3a2 2 0 1 1 0-4z"/>', made: '<path d="M7 4h10l-1 5a5 5 0 0 1-8 0z"/><path d="M6 20h12l-2-8H8z"/>',
    use: '<path d="M14 4l6 6-3 3-6-6zM11 7l-7 7 3 3 7-7"/>', who: '<circle cx="12" cy="8" r="3.4"/><path d="M5 20c1-4 4-6 7-6s6 2 7 6"/>',
    family: '<path d="M4 18h5v-5h5V8h5"/><circle cx="19" cy="5" r="2"/>', degree: '<path d="M4 18l5-5 4 3 7-9"/><path d="M15 7h5v5"/>',
    check: '<path d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.8z"/>' };
  const lic = (id, size) => `<svg viewBox="0 0 24 24" width="${size || 22}" height="${size || 22}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${LIC[id] || LIC.check}</svg>`;

  /* ------------------------------------------------------------------ views */
  function view() { const A0 = D(); if (!A0) return '';
    css();
    if (!state.anl) { const h = here(); state.anl = { v: 'map' }; if (h) { state.anl.reg = h.r.id; state.anl.stop = h.j < h.r.stops.length ? h.r.stops[h.j].id : h.r.id + '-check'; } }
    const s = S();
    if (s.v === 'run' && s.run) return runView(s.run);
    if (s.v === 'lesson') return lessonView();
    if (s.v === 'words') return wordsView();
    if (s.v === 'clock') return clockIntro();
    return mapView(); }
  function head(title, sub, back, backLabel, icon) {
    try { return pageHead(title, '', sub || '', W.coinChip ? coinChip() : '', back || 'goHome', backLabel || 'Home', back === 'anl' ? 'map' : null, icon || ''); }
    catch (e) { return `<h1>${esc(title)}</h1>`; } }
  function mapView() { const s = S(); const R = regions(); const reg = regionById(s.reg) || R[0]; const ri = R.indexOf(reg); const c = kid();
    const tabs = R.map((r, i) => { const on = r === reg, open = regionOpen(i);
      const st = mastered(r.id) ? 'Mastered' : walked(r.id) ? 'Walked' : open ? 'Open' : 'After ' + (R[i - 1] || {}).name;
      return `<button class="anl-rtab${on ? ' on' : ''}${open ? '' : ' locked'}" data-act="anl" data-arg="region:${escA(r.id)}" aria-pressed="${on}" ${open ? '' : 'aria-disabled="true"'}>
        <span class="anl-rname">${open ? '' : ic('lock', 12) + ' '}${esc(r.name)}</span><span class="anl-rsub">Levels ${r.lv[0]}–${r.lv[1]} · ${esc(st)}</span></button>`; }).join('');
    const nStops = reg.stops.length + 1; const g = geo(reg.id);
    const marks = []; const at = here();
    for (let j = 0; j < nStops; j++) { const isChk = j === reg.stops.length; const st = isChk ? null : reg.stops[j]; const id = isChk ? reg.id + '-check' : st.id;
      const f = 0.07 + 0.88 * (j / (nStops - 1)); const [x, y] = along(g, f); const open = stopOpen(reg, j);
      const done = isChk ? walked(reg.id) : passed(id); const L = st ? lesson(st.lesson) : null; const cur = at && at.r === reg && at.j === j;
      const label = isChk ? 'Level check' : L.title;
      marks.push(`<button class="anl-stop${done ? ' done' : ''}${open ? '' : ' locked'}${cur ? ' cur' : ''}${s.stop === id ? ' sel' : ''}${isChk ? ' chk' : ''}" style="left:${(x / 16).toFixed(2)}%;top:${(y / 9).toFixed(2)}%" data-act="anl" data-arg="stop:${escA(id)}" aria-label="${escA(label + (done ? ', passed' : open ? '' : ', locked'))}">
        <span class="anl-med">${open ? (done && !isChk ? ic('check', 20) : lic(isChk ? 'check' : st.lesson, 22)) : ic('lock', 16)}</span><span class="anl-lab">${esc(label)}</span>
        ${cur && W.SB_AVATAR && c ? `<span class="anl-me" aria-hidden="true">${SB_AVATAR(c.avatar || 'bizzy', 40)}</span>` : ''}</button>`); }
    /* the walked part of the road, solid, up to where the child stands */
    const reach = (() => { let j = 0; for (let k = 0; k < reg.stops.length; k++) if (passed(reg.stops[k].id)) j = k + 1; return walked(reg.id) ? 1 : 0.07 + 0.88 * (j / (nStops - 1)); })();
    const walkPts = g.pts.filter((p, i) => g.len[i] <= g.len[g.len.length - 1] * reach);
    const walkD = walkPts.length > 1 ? 'M' + walkPts.map((p) => p.map((v) => v.toFixed(0)).join(' ')).join(' L') : '';
    const board = `<div class="anl-board${ART[reg.id] ? ' painted' : ''}" role="group" aria-label="${escA(reg.name + ' map')}">${sceneFor(reg.id)}
      <svg class="anl-walk" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><path d="${g.d}" fill="none" stroke="#FFFFFF" stroke-width="7" stroke-dasharray="4 16" stroke-linecap="round" opacity=".9"/>${walkD ? `<path d="${walkD}" fill="none" stroke="#F2A93B" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>` : ''}</svg>
      ${marks.join('')}</div>`;
    const tabIc = (() => { try { return navIcon('analogy', 24); } catch (e) { return lic('family', 20); } })();
    return `<div class="anl-page">${head('Analogy Atlas', esc(reg.about), 'goHome', 'Home', tabIc)}
      <div class="anl-rtabs" role="group" aria-label="Regions">${tabs}</div>
      ${board}
      ${stopCard(reg)}
      ${gamesRow()}</div>`; }
  function stopCard(reg) { const s = S(); const hit = stopById(s.stop); if (!hit || hit.r !== reg) return `<div class="anl-card anl-hint">Tap a stop on the road to begin.</div>`;
    const j = hit.s ? reg.stops.indexOf(hit.s) : reg.stops.length; const open = stopOpen(reg, j);
    if (!hit.s) { const rr = regRec(reg.id);
      const line = mastered(reg.id) ? 'Mastered — passed on two different days.' : walked(reg.id) ? 'Walked. Pass it again on another day, on new questions, to master this level.' : 'Ten questions from every link in ' + reg.name + '. Get eight right to walk on.';
      return `<div class="anl-card"><div class="anl-ctop"><span class="anl-cic chk">${lic('check', 24)}</span><div><h2 class="anl-ct">Level check</h2><p class="anl-cs">${esc(line)}</p></div></div>
        ${open ? `<div class="anl-btns"><button class="anl-btn main" data-act="anl" data-arg="level">${ic('trophy', 16)} Take the level check</button></div>${rr.best ? `<p class="anl-note">Best: ${rr.best}/10</p>` : ''}`
          : `<p class="anl-lock">${ic('lock', 14)} Opens when every stop in ${esc(reg.name)} is passed.</p>`}</div>`; }
    const L = lesson(hit.s.lesson); const sr = stopRec(hit.s.id);
    return `<div class="anl-card"><div class="anl-ctop"><span class="anl-cic">${lic(L.id, 24)}</span><div><h2 class="anl-ct">${esc(L.title)}</h2><p class="anl-cs">${esc(L.idea)}</p></div></div>
      ${open ? `<div class="anl-btns"><button class="anl-btn" data-act="anl" data-arg="learn">${ic('book', 16)} Learn</button><button class="anl-btn" data-act="anl" data-arg="words">${ic('cards', 16)} Meet the words</button>
        <button class="anl-btn" data-act="anl" data-arg="practice">${ic('pencil', 16)} Practice</button><button class="anl-btn main" data-act="anl" data-arg="check">${ic('target', 16)} Check</button></div>
        <p class="anl-note">${passed(hit.s.id) ? ic('check', 13) + ' Passed' : 'Pass the check with 7 of 8 to open the next stop.'}${sr.pb ? ' · Practice best ' + sr.pb + '/8' : ''}${sr.cb ? ' · Check best ' + sr.cb + '/8' : ''}</p>`
        : `<p class="anl-lock">${ic('lock', 14)} Opens when the stop before it is passed.</p>`}</div>`; }
  function gamesRow() { const bee = rec().bee || {}; let best = ''; try { const b = W.SB_BESTS && SB_BESTS.get('anl/clock'); if (b) best = 'Best ' + b.right + ' right'; } catch (e) {}
    const ord = (n) => n + (n % 100 > 10 && n % 100 < 14 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' })[n % 10] || 'th');
    return `<h2 class="anl-h2">Play with links</h2><div class="anl-games">
      <button class="anl-game bee" data-act="openAnlBee"><span class="anl-gic">${ic('trophy', 26)}</span><span class="anl-gt">Mock Analogy Bee</span><span class="anl-gp">Your rivals, one analogy each. Miss the link and you sit down.</span>${bee.played ? `<span class="anl-gb">Best finish: ${ord(bee.best || 7)}</span>` : ''}</button>
      <button class="anl-game clk" data-act="anl" data-arg="clock"><span class="anl-gic">${ic('timer', 26)}</span><span class="anl-gt">Against the Clock</span><span class="anl-gp">Sixty seconds of analogies. A wrong link costs two seconds.</span>${best ? `<span class="anl-gb">${esc(best)}</span>` : ''}</button></div>`; }
  /* ------------------------------------------------------------------ Learn: one idea a screen, the child doing something on most
     (owner, 10 Oct 2026: "the UI is primitive and it's not step by step learning"). Eight steps from the lesson's own words and
     its hand-written stem pairs: the idea → say the link → name a link yourself → how to spot it → the trap → build an analogy
     a part at a time → try one → ready. Three steps ask; Next waits until they are answered, and a wrong pick says why and lets
     the child go on (it is a lesson, not a check — nothing is scored or paid). ← / → or Back / Next, 1–3 to pick. */
  const relOf = (L, p) => (p && p[2]) || L.rels[0];
  function tile(w, cls) { return `<span class="anl-tile${cls ? ' ' + cls : ''}">${esc(w)}</span>`; }
  function pairHTML(L, p, o) { o = o || {};
    return `<div class="anl-pair${o.cls ? ' ' + o.cls : ''}">${tile(p[0], 'a')}<span class="anl-link" aria-hidden="true"><svg viewBox="0 0 120 34" preserveAspectRatio="none"><path d="M4 26 C 34 4, 86 4, 112 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M104 15 L114 25 L100 28" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg><em>${lic(L.id, 14)} ${esc(o.label || L.title)}</em></span>${o.blank ? tile(o.blankText || '?', 'b blank') : tile(p[1], 'b')}</div>`; }
  function lessonSteps(L) { const st = (L.stems || []).filter((p) => p && p[0] && p[1]); const [p0, p1, p2, p3, p4] = st;
    const steps = [];
    steps.push({ k: 'idea', t: 'The idea', need: !!p0 });
    steps.push({ k: 'say', t: 'Say the link', need: !!p0, gate: true });
    steps.push({ k: 'name', t: 'Your turn: name the link', need: !!p1, gate: true });
    steps.push({ k: 'spot', t: 'How to spot it', need: true });
    steps.push({ k: 'trap', t: 'Watch out', need: !!L.trap });
    steps.push({ k: 'build', t: 'Build an analogy', need: !!(p2 && p3), gate: true });
    steps.push({ k: 'try', t: 'Try one', need: !!(p0 && p4 && st.length >= 5), gate: true });
    steps.push({ k: 'ready', t: 'Ready', need: true });
    return { st, steps: steps.filter((x) => x.need) }; }
  function nameOpts(L, p1) { const near = (NEAR[L.id] || []).filter((id) => PLAIN[id]).slice(0, 2);
    const lines = [plain(L.id, p1[0], p1[1])].concat(near.map((id) => plain(id, p1[0], p1[1]))); return { lines, ord: perm('learn|' + L.id + '|name', lines.length) }; }
  function tryOpts(L, st) { const p0 = st[0], target = st[st.length - 1];
    const pool = st.slice(1, -1).map((p) => p[1]).filter((w) => w !== target[1] && w !== target[0] && w !== p0[0] && w !== p0[1]);
    const opts = [target[1]].concat([...new Set(pool)].slice(0, 2)); return { target, opts, ord: perm('learn|' + L.id + '|try', opts.length) }; }
  function lessonView() { const s = S(); const hit = stopById(s.stop); if (!hit || !hit.s) { s.v = 'map'; return mapView(); }
    const L = lesson(hit.s.lesson); if (!s.ls || s.ls.stop !== hit.s.id) s.ls = { stop: hit.s.id, i: 0, pk: {} };
    const ls = s.ls; const { st, steps } = lessonSteps(L); ls.i = Math.max(0, Math.min(ls.i, steps.length - 1));
    const step = steps[ls.i]; const [p0, p1, p2, p3, p4] = st; const pk = ls.pk;
    const ll = (p) => linkLine(relOf(L, p), p[0], p[1]);
    let body = '';
    if (step.k === 'idea') body = `<p class="anl-lead">${esc(L.idea)}</p>${pairHTML(L, p0)}${p1 ? pairHTML(L, p1, { cls: 'two' }) : ''}`;
    if (step.k === 'say') { const shown = !!pk.say;
      body = `<p class="anl-lead">Every analogy starts the same way: say, in one sentence, how the first two words are linked.</p>${pairHTML(L, p0)}
        ${shown ? `<p class="anl-said" role="status">${ic('volume', 16)} ${esc(ll(p0))}</p>` : `<div class="anl-btns center"><button class="anl-btn main" data-act="anl" data-arg="ls:say">${ic('volume', 16)} Say the link</button></div>`}`; }
    if (step.k === 'name') { const { lines, ord } = nameOpts(L, p1); const v = pk.name;
      body = `<p class="anl-lead">Which sentence links these two?</p>${pairHTML(L, p1, { label: '?' })}<div class="anl-opts lines">${ord.map((j, n) => {
        const cls = v == null ? '' : j === 0 ? ' ok' : n === v ? ' no' : ' dim';
        return `<button class="anl-opt line${cls}" data-act="anl" data-arg="ls:name:${n}"${v != null ? ' disabled' : ''}><span class="anl-k">${n + 1}</span>${esc(lines[j])}</button>`; }).join('')}</div>
        ${v == null ? '' : ord[v] === 0 ? `<div class="anl-yes"><b>Yes.</b> ${esc(ll(p1))}</div>` : `<div class="anl-miss"><p><b>Not quite.</b> ${esc(ll(p1))}</p></div>`}`; }
    if (step.k === 'spot') body = `<div class="anl-tipbox">${ic('bulb', 22)}<p>${esc(L.spot)}</p></div>${p2 ? pairHTML(L, p2) + `<p class="anl-said">${esc(ll(p2))}</p>` : ''}`;
    if (step.k === 'trap') body = `<div class="anl-trapbox">${ic('alert', 22)}<p>${esc(L.trap)}</p></div>
      <p class="anl-lead">The true link is the one you can say in the sentence, every time:</p>${pairHTML(L, p0)}<p class="anl-said sm">${esc(ll(p0))}</p>`;
    if (step.k === 'build') { const b = pk.build || 0;
      body = `<p class="anl-lead">An analogy is two pairs with the <b>same</b> link. Build one, a part at a time.</p>
        <div class="anl-build"><div class="anl-brow"><span class="anl-bn">1</span>${pairHTML(L, p2)}</div>
        ${b >= 1 ? `<p class="anl-said sm">${esc(ll(p2))}</p><div class="anl-brow"><span class="anl-bn">2</span>${pairHTML(L, p3, { blank: b < 2 })}</div>` : ''}
        ${b >= 2 ? `<p class="anl-said sm">${esc(ll(p3))}</p><p class="anl-whole">${esc(p2[0])} is to ${esc(p2[1])} as ${esc(p3[0])} is to <b>${esc(p3[1])}</b>.</p>` : ''}</div>
        ${b < 2 ? `<div class="anl-btns center"><button class="anl-btn main" data-act="anl" data-arg="ls:build">${b === 0 ? 'Say the link, then bring in ' + esc(p3[0]) : 'Find the word with the same link'}</button></div>` : ''}`; }
    if (step.k === 'try') { const { target, opts, ord } = tryOpts(L, st); const v = pk.tr;
      body = `<p class="anl-lead">Your turn. Say the first link, then find the word with the same link.</p>
        <div class="anl-pairs2">${pairHTML(L, p0)}${pairHTML(L, target, { blank: v == null || ord[v] !== 0, blankText: v != null && ord[v] === 0 ? target[1] : '?' })}</div>
        <div class="anl-opts n${opts.length}">${ord.map((j, n) => { const cls = v == null ? '' : j === 0 ? ' ok' : n === v ? ' no' : ' dim';
          return `<button class="anl-opt${cls}" data-act="anl" data-arg="ls:try:${n}"${v != null ? ' disabled' : ''}><span class="anl-k">${n + 1}</span><span class="anl-ow">${esc(opts[j])}</span></button>`; }).join('')}</div>
        ${v == null ? '' : ord[v] === 0 ? `<div class="anl-yes"><b>Yes.</b> ${esc(ll(target))}</div>` : `<div class="anl-miss"><p><b>It is ${esc(target[1])}.</b> ${esc(ll(target))}</p><p class="anl-why">The first pair: ${esc(ll(p0))}</p></div>`}`; }
    if (step.k === 'ready') body = `<div class="anl-ready"><span class="anl-cic big">${lic(L.id, 30)}</span><p class="anl-lead">You know the <b>${esc(L.title.toLowerCase())}</b> link.</p>
        <ol class="anl-recap"><li>Say how the first two words are linked, in one sentence.</li><li>Say the same sentence with the third word.</li><li>Pick the word that makes it true. Watch for words that only go <i>with</i> it.</li></ol></div>
        <div class="anl-btns center"><button class="anl-btn" data-act="anl" data-arg="words">${ic('cards', 16)} Meet the words</button><button class="anl-btn main" data-act="anl" data-arg="practice">${ic('pencil', 16)} Start practice</button></div>`;
    const done = !step.gate || (step.k === 'say' ? !!pk.say : step.k === 'name' ? pk.name != null : step.k === 'build' ? (pk.build || 0) >= 2 : step.k === 'try' ? pk.tr != null : true);
    const dots = steps.map((x, n) => `<span class="anl-dot${n < ls.i ? ' done' : n === ls.i ? ' on' : ''}" title="${escA(x.t)}"></span>`).join('');
    const last = ls.i === steps.length - 1;
    return `<div class="anl-page">${head(L.title, esc(hit.r.name), 'anl', hit.r.name, lic(L.id, 20))}
      <div class="anl-card anl-lesson anl-stepper" data-step="${escA(step.k)}">
        <div class="anl-steps-top"><span class="anl-stepn">Step ${ls.i + 1} of ${steps.length}</span><span class="anl-dots" aria-hidden="true">${dots}</span></div>
        <h2 class="anl-stept" data-live-prompt="${escA(step.t)}">${esc(step.t)}</h2>
        <div class="anl-stepbody">${body}</div>
        <div class="anl-stepnav"><button class="anl-btn" data-act="anl" data-arg="ls:back"${ls.i === 0 ? ' disabled' : ''}>${ic('arrowLeft', 16)} Back</button>
          ${last ? '' : `<button class="anl-btn main" data-act="anl" data-arg="ls:next"${done ? '' : ' disabled'}>Next ${ic('arrow', 16)}</button>`}</div></div></div>`; }
  function lessonAct(v) { const s = S(); const ls = s.ls; if (!ls) return; const hit = stopById(s.stop); if (!hit || !hit.s) return;
    const L = lesson(hit.s.lesson); const { st, steps } = lessonSteps(L); const step = steps[ls.i]; const [k, n] = v.split(':');
    if (k === 'next') { const ok = !step.gate || (step.k === 'say' ? !!ls.pk.say : step.k === 'name' ? ls.pk.name != null : step.k === 'build' ? (ls.pk.build || 0) >= 2 : ls.pk.tr != null);
      if (ok && ls.i < steps.length - 1) ls.i++; }
    else if (k === 'back') { if (ls.i > 0) ls.i--; }
    else if (k === 'say') { ls.pk.say = 1; try { const p = st[0]; say(linkLine(relOf(L, p), p[0], p[1])); } catch (e) {} }
    else if (k === 'build') ls.pk.build = Math.min(2, (ls.pk.build || 0) + 1);
    else if (k === 'name' && step.k === 'name' && ls.pk.name == null) { const o = nameOpts(L, st[1]); if (!(+n >= 0 && +n < o.lines.length)) return; ls.pk.name = +n; try { sfx(o.ord[+n] === 0 ? 'correct' : 'wrong'); } catch (e) {} }
    else if (k === 'try' && step.k === 'try' && ls.pk.tr == null) { const o = tryOpts(L, st); if (!(+n >= 0 && +n < o.opts.length)) return; ls.pk.tr = +n; try { sfx(o.ord[+n] === 0 ? 'correct' : 'wrong'); } catch (e) {} }
    render(); }
  /* a word whose library meaning a reviewer read as the wrong sense for its pair shows this instead (analogy-review, glossHeld) */
  const HELD_LINE = 'More than one meaning \u2014 the link shows which one.';
  function wordsView() { const s = S(); const hit = stopById(s.stop); if (!hit || !hit.s) { s.v = 'map'; return mapView(); }
    const L = lesson(hit.s.lesson); const A0 = D(); const seen = new Set(); const list = []; const held = new Set(A0.glossHeld || []);
    for (const id of safeIds(hit.s.items)) { const it = A0.items[id]; if (!it) continue; for (const w of [it[2], it[3]]) { if (seen.has(w)) continue; seen.add(w); list.push(w); } if (list.length >= 24) break; }
    const rows = list.map((w) => `<li class="anl-word"><button class="anl-say" data-act="anl" data-arg="say:${escA(w)}" aria-label="${escA('Hear ' + w)}">${ic('volume', 16)}</button><span class="anl-ww">${esc(w)}</span><span class="anl-wd">${esc(A0.gloss[w] || (held.has(w) ? HELD_LINE : ''))}</span></li>`).join('');
    return `<div class="anl-page">${head('Meet the words', esc(L.title + ' · ' + hit.r.name), 'anl', hit.r.name, lic(L.id, 20))}
      <div class="anl-card"><p class="anl-note">The words you will link in this stop. Read each one and hear it; knowing a word is half of every analogy.</p><ul class="anl-words">${rows}</ul>
      <div class="anl-btns"><button class="anl-btn main" data-act="anl" data-arg="practice">${ic('pencil', 16)} Start practice</button></div></div></div>`; }
  function clockIntro() { let best = ''; try { const b = W.SB_BESTS && SB_BESTS.get('anl/clock'); if (b) best = 'Your best: ' + b.right + ' right.'; } catch (e) {}
    return `<div class="anl-page">${head('Against the Clock', 'Analogies', 'anl', 'Analogy Atlas', ic('timer', 20))}
      <div class="anl-card anl-center"><p class="anl-big">Sixty seconds. Name the link, pick the word. A wrong pick costs two seconds, and the clock waits while you read why.</p>
      <p class="anl-note">Questions come from the regions you have reached.${best ? ' ' + esc(best) : ''}</p>
      <div class="anl-btns"><button class="anl-btn main" data-act="anl" data-arg="clockgo">${ic('timer', 16)} Start the clock</button></div></div></div>`; }
  const KEYS = 'ABCDE';
  function runView(g) { const kindName = { practice: 'Practice', check: 'Check', level: 'Level check', clock: 'Against the Clock' }[g.kind];
    if (g.phase === 'done') return doneView(g, kindName);
    const q = g.q; if (!q) return `<div class="anl-card">This round has no questions yet.</div>`;
    const L = lesson(q.lesson);
    const top = `<div class="anl-run-top"><button class="anl-x" data-act="anl" data-arg="leave" aria-label="Leave this round">${ic('arrowLeft', 16)} ${g.kind === 'clock' ? 'Stop' : 'Map'}</button>
      <span class="anl-kind">${esc(kindName)}${g.kind === 'practice' ? ' · ' + esc(L.title) : ''}</span>
      ${g.kind === 'clock' ? `<span id="anl-time" class="anl-time" aria-live="off">${Math.ceil(g.left / 1000)}s</span>` : `<span class="anl-count">${g.i + 1} of ${g.n}</span>`}<span class="anl-right">${ic('check', 13)} ${g.right}</span></div>`;
    const stem = `<div class="anl-q" data-live-prompt="${escA(q.a + ' is to ' + q.b + ' as ' + q.c + ' is to what?')}"><span>${esc(q.a.toUpperCase())}</span><i>:</i><span>${esc(q.b.toUpperCase())}</span>${g.phase === 'bridge' ? '' : `<i>::</i><span>${esc(q.c.toUpperCase())}</span><i>:</i><span class="anl-blank">${g.picked != null ? esc(q.d.toUpperCase()) : '?'}</span>`}</div>`;
    if (g.phase === 'bridge') { const B = g.bq;
      const opts = B.lines.map((t, i) => { const st = g.bpick == null ? '' : i === B.ans ? ' ok' : i === g.bpick ? ' no' : ' dim';
        return `<button class="anl-opt line${st}" data-act="anl" data-arg="bridge:${i}"${g.bpick != null ? ' disabled' : ''}><span class="anl-k">${i + 1}</span>${esc(t)}</button>`; }).join('');
      return `<div class="anl-page anl-run">${top}<div class="anl-card">${stem}<p class="anl-ask">Step 1 · How are these two linked?</p><div class="anl-opts lines">${opts}</div>
        ${g.bpick != null && g.bpick !== B.ans ? `<div class="anl-miss"><p><b>The link:</b> ${esc(B.lines[B.ans])}</p><button class="anl-btn main" data-act="anl" data-arg="cont">Now the analogy <span class="anl-kb">Enter</span></button></div>` : ''}</div></div>`; }
    const opts = q.opts.map((o, i) => { const st = g.picked == null ? '' : i === q.ans ? ' ok' : i === g.picked ? ' no' : ' dim';
      return `<button class="anl-opt${st}" data-act="anl" data-arg="pick:${i}"${g.picked != null ? ' disabled' : ''}><span class="anl-k">${KEYS[i]}</span><span class="anl-ow">${esc(o)}</span></button>`; }).join('');
    let after = '';
    if (g.picked != null) { const ok = g.picked === q.ans; const line = linkLine(q.rel, q.c, q.d);
      after = ok ? `<div class="anl-yes"><b>Yes.</b> ${esc(line)}</div>`
        : `<div class="anl-miss" role="status"><p><b>The answer is ${esc(q.d)}.</b> ${esc(line)}</p><p class="anl-why">${esc(tempted(q, q.opts[g.picked]))}</p><p class="anl-why">The first pair: ${esc(linkLine(q.rel, q.a, q.b))}</p>
          <button class="anl-btn main" data-act="anl" data-arg="cont">Continue <span class="anl-kb">Enter</span></button></div>`; }
    return `<div class="anl-page anl-run">${top}<div class="anl-card">${stem}<p class="anl-ask">${g.kind === 'practice' ? 'Step 2 · ' : ''}Which word completes the analogy?</p>
      <div class="anl-opts n${q.opts.length}">${opts}</div>${after}
      <button class="anl-hear" data-act="anl" data-arg="hear">${ic('volume', 15)} Hear it</button></div></div>`; }
  function doneView(g, kindName) { const pct = Math.round((g.pct || 0) * 100);
    const words = g.log.map((x) => `<li class="${x.ok ? 'ok' : 'no'}">${x.ok ? ic('check', 13) : ic('close', 13)} ${esc(x.c)} → <b>${esc(x.d)}</b>${x.ok ? '' : ` <span class="anl-was">(you chose ${esc(x.w)})</span>`}</li>`).join('');
    let head2 = kindName + ': ' + g.right + (g.kind === 'clock' ? ' right' : ' of ' + g.asked);
    let line = '';
    if (g.kind === 'check') line = g.pass ? 'Passed — the next stop is open.' : 'Seven of eight passes. Practise, then check again.';
    if (g.kind === 'level') line = g.masteredNow ? 'Mastered! You passed this level on two different days.' : g.walkedNow ? 'Level passed — the next region is open.' : g.pass ? 'Passed again. Pass on another day to master it.' : 'Eight of ten passes. Practise the stops, then try again.';
    if (g.kind === 'practice') line = 'Practice keeps nothing back: check when you are ready.';
    if (g.kind === 'clock') line = g.newBest ? 'A new best!' : 'Every miss you read is a link you will see next time.';
    return `<div class="anl-page">${head(head2, esc(line), 'anl', 'Analogy Atlas', ic('star', 20))}
      <div class="anl-card"><p class="anl-big">${esc(line)}</p>${g.coins ? `<p class="anl-note">${ic('coin', 14)} +${g.coins} coins</p>` : ''}
        <ul class="anl-log">${words}</ul>
        <div class="anl-btns"><button class="anl-btn" data-act="anl" data-arg="map">${ic('arrowLeft', 16)} Back to the map</button><button class="anl-btn main" data-act="anl" data-arg="cont">${ic('retry', 16)} ${g.kind === 'clock' ? 'Play again' : 'Go again'} <span class="anl-kb">Enter</span></button></div></div></div>`; }

  /* ------------------------------------------------------------------ actions */
  function act(arg) { const s = S(); arg = String(arg || ''); const [k, v] = [arg.split(':')[0], arg.slice(arg.indexOf(':') + 1)];
    if (k === 'region') { const i = regions().findIndex((r) => r.id === v); if (i < 0 || !regionOpen(i)) { try { flash('Pass the level check before it to open ' + regions()[i].name); } catch (e) {} return; }
      s.reg = v; const r = regions()[i]; const j = r.stops.findIndex((st, x) => stopOpen(r, x) && !passed(st.id)); s.stop = j >= 0 ? r.stops[j].id : r.id + '-check'; s.v = 'map'; render(); return; }
    if (k === 'stop') { const hit = stopById(v); if (!hit) return; s.reg = hit.r.id; s.stop = v; s.v = 'map'; render();
      setTimeout(() => { try { const el = document.querySelector('.anl-card'); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {} }, 30); return; }
    const hit = stopById(s.stop);
    if (k === 'learn') { if (hit && hit.s) { s.v = 'lesson'; s.ls = null; render(); try { window.scrollTo(0, 0); } catch (e) {} } return; }
    if (k === 'ls') { lessonAct(v); return; }
    if (k === 'words') { if (hit && hit.s) { s.v = 'words'; render(); try { window.scrollTo(0, 0); } catch (e) {} } return; }
    if (k === 'practice' || k === 'check') { if (hit && hit.s) startRun(k); return; }
    if (k === 'level') { if (hit && !hit.s) startRun('level'); return; }
    if (k === 'clock') { s.v = 'clock'; s.run = null; render(); return; }
    if (k === 'clockgo') { startClock(); return; }
    if (k === 'bridge') { pickBridge(v); return; }
    if (k === 'pick') { pick(v); return; }
    if (k === 'cont') { cont(); return; }
    if (k === 'hear') { const g = s.run; if (g && g.q) try { say(g.q.a + ' is to ' + g.q.b + ', as ' + g.q.c + ' is to what?'); } catch (e) {} return; }
    if (k === 'say') { try { say(v); } catch (e) {} return; }
    if (k === 'leave' || k === 'map') { stopClock(); if (s.run && s.run.phase !== 'done') s.run.phase = 'left'; s.run = null; s.v = 'map'; render(); return; } }

  /* ------------------------------------------------------------------ keys: 1–5 / A–E pick, Enter continues, Esc leaves */
  function onKey(e) { try {
    if (state.screen !== 'app') return; const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (state.nav === 'anlbee') { beeKey(e); return; }
    if (state.nav === 'anltool') { const t = state.anlTool; if (t && t.ask && t.ask.picked == null && /^[1-3]$/.test(e.key)) { e.preventDefault(); toolAct('pick:' + (+e.key - 1)); } return; }
    if (state.nav !== 'analogy') return; const s = state.anl; if (!s) return;
    const g = s.run; const k = e.key;
    if (s.v === 'lesson' && s.ls) { const hit = stopById(s.stop); if (!hit || !hit.s) return; const step = lessonSteps(lesson(hit.s.lesson)).steps[s.ls.i] || {};
      if (k === 'ArrowRight' || k === 'Enter') { e.preventDefault(); lessonAct('next'); return; }
      if (k === 'ArrowLeft') { e.preventDefault(); lessonAct('back'); return; }
      if (/^[1-3]$/.test(k) && (step.k === 'name' || step.k === 'try')) { e.preventDefault(); lessonAct((step.k === 'name' ? 'name:' : 'try:') + (+k - 1)); }
      return; }
    if (k === 'Escape' && g && s.v === 'run') { e.preventDefault(); act('leave'); return; }
    if (k === 'Enter') { if (s.v === 'run' && g && (g.phase === 'done' || g.picked != null || g.bpick != null)) { e.preventDefault(); cont(); } else if (s.v === 'clock' && !g) { e.preventDefault(); startClock(); } return; }
    if (!g || s.v !== 'run') return;
    const n = /^[1-5]$/.test(k) ? +k - 1 : /^[a-eA-E]$/.test(k) ? KEYS.indexOf(k.toUpperCase()) : -1; if (n < 0) return;
    e.preventDefault(); if (g.phase === 'bridge') pickBridge(n); else pick(n); } catch (err) {} }
  if (!W._anlKeys) { W._anlKeys = 1; W.addEventListener('keydown', onKey); }

  /* ================================================================== MOCK ANALOGY BEE */
  /* Seven spellers and you, one analogy each a round. Round one sits nobody down. A miss after that
     and you sit down; the last speller standing wins. Whether a rival is right is a hash of the bee, the
     round and the rival — never a roll.
     THE RIVALS ARE MOCK BEE'S CAST (owner, 10 Oct 2026 — the road to 4.5, P0.9/P0.10: "Mock Analogy Bee seats come
     from MOCKBEE.rivals() — Pip, Nova, Rafi… same faces, same names everywhere"). This file used to keep its own
     seven and name them from the avatar catalogue, so the panda Mock Bee calls Suki was "Panda" here and Pip was
     "Pixel Pal". Now the seats are MOCKBEE.rivals(): Mock Bee's names, and its faces — a rival whose face is the
     child's own wears that rival's `alt`, exactly as on the Mock Bee stage. The seven are the run of the cast
     (ordered by the cast's own `lvl`) nearest the bee's level; a rival's chance on an analogy comes from the same
     profile's `voc` — how well they know what words mean — so Theo, who asks for every definition, is the one to
     beat here, and Pip, who never asks, is not. */
  const SEATS = 7;
  const skillOf = (r) => 0.72 + 0.22 * (+r.voc || 0.5);
  const LVL_LO = { easy: 1, medium: 3, hard: 5, champ: 7 };
  function beeLevel() { let L = 'auto'; try { L = W.SB_LEVEL ? SB_LEVEL.get('mockAnalogy') : 'auto'; } catch (e) {}
    if (LVL_LO[L]) return LVL_LO[L]; const h = here(); return h ? h.r.lv[0] : 1; }
  function beePool() { const A0 = D(); const ids = new Set(A0.games || []); regions().forEach((r) => { r.stops.forEach((st) => st.items.forEach((x) => ids.add(x))); r.check.forEach((x) => ids.add(x)); }); return safeIds([...ids]); }
  const B = () => state.anlBee;
  function openBee() { stopClock(); state.anlBee = { phase: 'lobby' }; state.nav = 'anlbee'; state.screen = 'app'; state.game = null; try { render(); } catch (e) {} }
  /* the seven seats: [face, name, chance, rival id] from Mock Bee's cast, for the child on screen ([] until mockbee.js is in) */
  function castFor(lo) { const c = kid(); const mine = (c && c.avatar) || 'bizzy';
    const all = (W.MOCKBEE && typeof MOCKBEE.rivals === 'function') ? MOCKBEE.rivals(mine).slice().sort((a, b) => a.lvl - b.lvl) : [];
    if (!all.length) return [];
    const from = Math.max(0, Math.min(all.length - SEATS, Math.round(((lo || beeLevel()) - 1) / 2)));
    return all.slice(from, from + SEATS).map((r) => [r.face, r.name, skillOf(r), r.id]); }
  function beeStart() { if (!castFor().length) { try { if (W.SB_LAZY) SB_LAZY.need('mockbee', () => { if (state.nav === 'anlbee') beeStart(); }); } catch (e) {} return; }
    const lo = beeLevel(); const seed = day() + '|bee|' + (rec().n++); const names = castFor(lo).map(([id, name, sk, rid]) => ({ id, rid, name, sk, out: 0 }));
    state.anlBee = { phase: 'turn', seed, lo, round: 1, field: names, me: { out: 0 }, used: {}, log: [], e0: (W.earnedSoFar ? earnedSoFar() : 0) };
    store(); beeAsk(); }
  function beeAsk() { const b = B(); const lv = Math.min(9, b.lo + Math.floor((b.round - 1) / 2)); const pool = beePool();
    const A0 = D(); const fits = pool.filter((id) => { const it = A0.items[id]; return it && !b.used[id] && it[1] >= lv - 1 && it[1] <= lv + 1 && it.length >= 7; });
    const P = fits.length ? fits : pool.filter((id) => !b.used[id]); const id = P[hash(b.seed + '|' + b.round) % Math.max(1, P.length)];
    b.used[id] = 1; b.q = question(id, b.round >= 5 ? 5 : 4, b.seed + '|' + b.round); b.picked = null; b.phase = 'turn'; render(); }
  function beePick(i) { const b = B(); if (!b || b.phase !== 'turn' || b.picked != null) return; i = +i; const q = b.q; if (!q || !(i >= 0 && i < q.opts.length)) return;
    b.picked = i; const ok = i === q.ans; b.log.push({ c: q.c, d: q.d, ok, w: q.opts[i] }); rec().seen[q.id] = Date.now();
    try { sfx(ok ? 'correct' : 'wrong'); } catch (e) {}
    /* the rivals' turn: each standing rival is right with a chance that falls as the rounds climb */
    b.calls = []; b.field.forEach((r) => { if (r.out) return; const p = r.sk - 0.035 * (b.round - 1); const right = (hash(b.seed + '|' + b.round + '|' + (r.rid || r.id)) % 1000) / 1000 < p; b.calls.push({ r, right }); });
    if (b.round > 1) { b.calls.forEach((x) => { if (!x.right) x.r.out = b.round; }); if (!ok) b.me.out = b.round; }
    const standing = b.field.filter((r) => !r.out).length + (b.me.out ? 0 : 1);
    if (standing === 0) { /* everybody missed: the round runs again, nobody sits down */ b.calls.forEach((x) => { if (x.r.out === b.round) x.r.out = 0; }); if (b.me.out === b.round) b.me.out = 0; b.again = 1; } else b.again = 0;
    b.phase = 'result'; render(); }
  function beeNext() { const b = B(); if (!b) return; if (b.phase === 'done') { beeStart(); return; } if (b.phase !== 'result') return;
    const left = b.field.filter((r) => !r.out);
    if (b.me.out) { beeFinish(); return; }
    if (!left.length) { beeFinish(); return; }
    if (b.round >= 20) { beeFinish(); return; }
    b.round++; beeAsk(); }
  /* out, or the last one standing: the rest is resolved at once from the same hash */
  function beeFinish() { const b = B(); let r = b.round;
    while (b.field.filter((x) => !x.out).length > (b.me.out ? 1 : 0) && r < 40) { r++; b.field.forEach((x) => { if (x.out) return; const p = x.sk - 0.035 * (r - 1); if ((hash(b.seed + '|' + r + '|' + (x.rid || x.id)) % 1000) / 1000 >= p) x.out = r; });
      if (!b.field.some((x) => !x.out)) { const last = b.field.filter((x) => x.out === r); last.forEach((x) => { x.out = 0; }); if (last.length === 1) break; } }
    const outAt = (x) => (x.out || 999); const myOut = b.me.out || 999;
    b.place = 1 + b.field.filter((x) => outAt(x) > myOut).length;
    b.phase = 'done'; const p = rec().bee; p.played = (p.played || 0) + 1; p.best = Math.min(p.best || 99, b.place); if (b.place === 1) p.wins = (p.wins || 0) + 1;
    /* a podium is a pass mark: one contest coin for first, second or third */
    const podium = b.place <= 3;
    if (podium) { try { addCoins('contest'); } catch (e) {} }
    b.coins = (W.earnedSoFar ? earnedSoFar() : b.e0) - b.e0;
    try { if (W.logActivity) logActivity('anlbee', 'Mock Analogy Bee', { done: b.log.length, right: b.log.filter((x) => x.ok).length, coins: b.coins }, []); } catch (e) {}
    try { if (podium) { sfx('win'); burstConfetti(b.place === 1 ? 130 : 70); } else sfx('level'); } catch (e) {}
    store(); render(); }
  function beeView() { if (!D()) return ''; css(); const b = B() || (state.anlBee = { phase: 'lobby' }); const c = kid();
    const me = c && W.SB_AVATAR ? SB_AVATAR(c.avatar || 'bizzy', 46) : '';
    const face = (id) => { try { return W.SB_AVATAR ? SB_AVATAR(id, 46) : ''; } catch (e) { return ''; } };
    const hd = (t, sub) => { try { return pageHead(t, '', sub || '', W.coinChip ? coinChip() : '', 'openAnalogies', 'Analogies', null, ic('trophy', 20)); } catch (e) { return '<h1>' + esc(t) + '</h1>'; } };
    if (b.phase === 'lobby') { const seats = castFor();
      if (!seats.length) { try { if (W.SB_LAZY) SB_LAZY.need('mockbee', () => { if (state.nav === 'anlbee') render(); }); } catch (e) {} }
      const cast = seats.map(([id, name]) => `<li class="anl-rival">${face(id)}<span>${esc(name)}</span></li>`).join('');
      const p = rec().bee; const ord = (n) => n + (n % 100 > 10 && n % 100 < 14 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' })[n % 10] || 'th');
      return `<div class="anl-page">${hd('Mock Analogy Bee', 'One analogy each, round by round')}
        <div class="anl-card anl-center"><ul class="anl-field">${cast}<li class="anl-rival me">${me}<span>You</span></li></ul>
        <p class="anl-big">Every speller gets one analogy a round. Round one is a warm-up: nobody sits down. After that, miss the link and you sit down. The last speller standing wins.</p>
        <p class="anl-note">The analogies climb a level every two rounds.${p.played ? ' Your best finish: ' + ord(p.best) + (p.wins ? ' · ' + p.wins + ' won' : '') + '.' : ''}</p>
        <div class="anl-btns"><button class="anl-btn main" data-act="anlBee" data-arg="start">${ic('trophy', 16)} Take the stage <span class="anl-kb">Enter</span></button></div>
        <p class="anl-note">${W.SB_LEVEL && SB_LEVEL.chip ? SB_LEVEL.chip('mockAnalogy', 'Mock Analogy Bee') : ''}</p></div></div>`; }
    const field = `<ul class="anl-field run">${b.field.map((r) => { const call = (b.calls || []).find((x) => x.r === r); const st = r.out && r.out < b.round ? ' sat' : (b.phase === 'result' && call) ? (call.right ? ' right' : (b.round > 1 ? ' sat now' : ' miss')) : '';
      return `<li class="anl-rival${st}">${face(r.id)}<span>${esc(r.name)}</span></li>`; }).join('')}<li class="anl-rival me${b.me.out && b.me.out < b.round ? ' sat' : ''}">${me}<span>You</span></li></ul>`;
    if (b.phase === 'done') { const ord = (n) => n + (n % 100 > 10 && n % 100 < 14 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' })[n % 10] || 'th');
      const words = b.log.map((x) => `<li class="${x.ok ? 'ok' : 'no'}">${x.ok ? ic('check', 13) : ic('close', 13)} ${esc(x.c)} → <b>${esc(x.d)}</b>${x.ok ? '' : ` <span class="anl-was">(you chose ${esc(x.w)})</span>`}</li>`).join('');
      return `<div class="anl-page">${hd(b.place === 1 ? 'Champion!' : 'You finished ' + ord(b.place), 'Mock Analogy Bee')}
        <div class="anl-card anl-center">${field}<p class="anl-big">${b.place === 1 ? 'Last speller standing.' : b.place <= 3 ? 'On the podium.' : 'Every link you missed is one you will see coming next time.'}</p>${b.coins ? `<p class="anl-note">${ic('coin', 14)} +${b.coins} coins</p>` : ''}
        <ul class="anl-log">${words}</ul><div class="anl-btns"><button class="anl-btn" data-act="openAnalogies">${ic('arrowLeft', 16)} Analogies</button><button class="anl-btn main" data-act="anlBee" data-arg="start">${ic('retry', 16)} New bee <span class="anl-kb">Enter</span></button></div></div></div>`; }
    const q = b.q; if (!q) return '';
    const opts = q.opts.map((o, i) => { const st = b.picked == null ? '' : i === q.ans ? ' ok' : i === b.picked ? ' no' : ' dim';
      return `<button class="anl-opt${st}" data-act="anlBee" data-arg="pick:${i}"${b.picked != null ? ' disabled' : ''}><span class="anl-k">${KEYS[i]}</span><span class="anl-ow">${esc(o)}</span></button>`; }).join('');
    let res = '';
    if (b.phase === 'result') { const ok = b.picked === q.ans; const sat = (b.calls || []).filter((x) => !x.right && b.round > 1).map((x) => x.r.name);
      res = `<div class="${ok ? 'anl-yes' : 'anl-miss'}"><p><b>${ok ? 'Right!' : 'The answer is ' + esc(q.d) + '.'}</b> ${esc(linkLine(q.rel, q.c, q.d))}</p>${ok ? '' : `<p class="anl-why">${esc(tempted(q, q.opts[b.picked]))}</p>`}
        <p class="anl-why">${b.again ? 'Everybody missed, so nobody sits down: the round runs again.' : b.round === 1 ? 'Warm-up round: nobody sits down.' : sat.length ? esc(sat.join(', ')) + (sat.length === 1 ? ' sits' : ' sit') + ' down.' : 'Every rival got theirs.'}</p>
        <button class="anl-btn main" data-act="anlBee" data-arg="next">${b.me.out ? 'See how it ends' : 'Next round'} <span class="anl-kb">Enter</span></button></div>`; }
    return `<div class="anl-page anl-run">${hd('Round ' + b.round, 'Mock Analogy Bee')}${field}
      <div class="anl-card"><div class="anl-q" data-live-prompt="${escA('Round ' + b.round + '. ' + q.a + ' is to ' + q.b + ' as ' + q.c + ' is to what?')}"><span>${esc(q.a.toUpperCase())}</span><i>:</i><span>${esc(q.b.toUpperCase())}</span><i>::</i><span>${esc(q.c.toUpperCase())}</span><i>:</i><span class="anl-blank">${b.picked != null ? esc(q.d.toUpperCase()) : '?'}</span></div>
      <p class="anl-ask">Your turn. Which word completes the analogy?</p><div class="anl-opts n${q.opts.length}">${opts}</div>${res}
      <button class="anl-hear" data-act="anlBee" data-arg="hear">${ic('volume', 15)} Hear it</button></div></div>`; }
  function beeAct(arg) { arg = String(arg || ''); const b = B();
    if (arg === 'start') { beeStart(); return; }
    if (arg.indexOf('pick:') === 0) { beePick(arg.slice(5)); return; }
    if (arg === 'next') { beeNext(); return; }
    if (arg === 'hear') { if (b && b.q) try { say(b.q.a + ' is to ' + b.q.b + ', as ' + b.q.c + ' is to what?'); } catch (e) {} return; } }
  function beeKey(e) { const b = B(); if (!b) return; const k = e.key;
    if (k === 'Enter') { if (b.phase === 'lobby' || b.phase === 'done') { e.preventDefault(); beeStart(); } else if (b.phase === 'result') { e.preventDefault(); beeNext(); } return; }
    if (b.phase !== 'turn') return; const n = /^[1-5]$/.test(k) ? +k - 1 : /^[a-eA-E]$/.test(k) ? KEYS.indexOf(k.toUpperCase()) : -1; if (n < 0) return; e.preventDefault(); beePick(n); }
  const beeBest = () => { const p = rec().bee || {}; if (!p.played || !p.best) return ''; const n = p.best;
    return 'Best finish: ' + n + (n % 100 > 10 && n % 100 < 14 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' })[n % 10] || 'th') + (p.wins ? ' · ' + p.wins + ' won' : ''); };

  /* ================================================================== LINK FINDER (the Library's analogy tool) */
  /* Owner, 10 Oct 2026: "we need analogy tool in the library … a full page stretch thin banner under the book series".
     Type a word, see every link the Analogy Atlas knows for it — each pair drawn as two tiles and a link, said in a
     sentence — tap the other word to walk on, or build an analogy from a link and answer it. Or browse a link by kind.
     Everything comes from analogy-data.js (the items and the lessons' hand-written pairs); nothing is scored or paid. */
  let IDX = null;
  function linkIndex() { if (IDX) return IDX; const A0 = D(); const by = {}, seen = new Set(), byLesson = {};
    const add = (a, b, rel) => { const L = lessonOfRel(rel); if (!L || !a || !b || a === b) return; const key = a + '|' + b + '|' + rel; if (seen.has(key)) return; seen.add(key);
      const x = { a, b, rel, L: L.id }; (by[a] = by[a] || []).push(x); (by[b] = by[b] || []).push(x); (byLesson[L.id] = byLesson[L.id] || []).push(x); };
    (A0.lessons || []).forEach((L) => (L.stems || []).forEach((p) => add(p[0], p[1], p[2] || L.rels[0])));
    Object.keys(A0.items).forEach((id) => { const it = A0.items[id]; add(it[2], it[3], it[0]); });
    IDX = { by, byLesson, words: Object.keys(by).sort() }; return IDX; }
  const T = () => (state.anlTool = state.anlTool || { q: '', w: null, lk: null, ask: null });
  function openTool(w) { stopClock(); const t = T(); t.ask = null; t.lk = null; if (w) { w = String(w).toLowerCase(); t.w = linkIndex().by[w] ? w : null; t.q = t.w ? '' : w; }
    state.nav = 'anltool'; state.screen = 'app'; state.game = null; try { render(); window.scrollTo(0, 0); } catch (e) {} }
  const toolRoute = () => { const t = state.anlTool || {}; return 'links' + (t.w ? '/' + encodeURIComponent(t.w) : t.lk ? '/link/' + t.lk : ''); };
  function suggest(q) { q = String(q || '').trim().toLowerCase(); if (!q) return []; const W0 = linkIndex().words; const out = [];
    for (const w of W0) { if (w.indexOf(q) === 0) { out.push(w); if (out.length >= 8) break; } } return out; }
  function pairRow(x, me) { const L = lesson(x.L);
    const tl = (w) => w === me ? `<span class="anl-tile me">${esc(w)}</span>` : `<button class="anl-tile go" data-act="anlTool" data-arg="word:${escA(w)}" aria-label="${escA('See the links of ' + w)}">${esc(w)}</button>`;
    return `<li class="anl-lrow"><div class="anl-pair sm">${tl(x.a)}<span class="anl-link" aria-hidden="true"><svg viewBox="0 0 120 34" preserveAspectRatio="none"><path d="M4 26 C 34 4, 86 4, 112 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M104 15 L114 25 L100 28" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg><em>${lic(L.id, 13)} ${esc(L.title)}</em></span>${tl(x.b)}</div>
      <p class="anl-lsay">${esc(linkLine(x.rel, x.a, x.b))}</p></li>`; }
  /* an analogy from one link: a stem pair from that lesson's bank (no shared word), the link's second word to find,
     and two second words of other pairs in the same lesson as the wrong answers — all fixed by a hash of the link */
  function makeAsk(x) { const L = lesson(x.L); const I = linkIndex(); const words = [x.a, x.b];
    const stems = (L.stems || []).filter((p) => (L.id !== 'family' || (p[2] || L.rels[0]) === x.rel) && words.indexOf(p[0]) < 0 && words.indexOf(p[1]) < 0);
    if (!stems.length) return null; const st = stems[hash('tool|' + x.a + '|' + x.b) % stems.length];
    const others = [...new Set((I.byLesson[x.L] || []).map((y) => y.b))].filter((w) => w !== x.b && w !== x.a && w !== st[0] && w !== st[1]);
    if (others.length < 2) return null; const h = hash('tool-o|' + x.a + '|' + x.b); const wrong = [others[h % others.length], others[(h >>> 8) % others.length]];
    if (wrong[0] === wrong[1]) wrong[1] = others[(h % others.length + 1) % others.length];
    const opts = [x.b].concat(wrong); const ord = perm('tool|' + x.a + '|' + x.b, opts.length);
    return { x, a: st[0], b: st[1], srel: st[2] || L.rels[0], c: x.a, opts: ord.map((i) => opts[i]), ans: ord.indexOf(0), picked: null }; }
  function toolView() { if (!D()) return ''; css(); const t = T(); const I = linkIndex(); const A0 = D();
    const hd = (() => { try { return pageHead('Link Finder', '', 'Every link the Analogy Atlas knows — type a word', '', 'setNav', 'Library', 'explore', lic('family', 20)); } catch (e) { return '<h1>Link Finder</h1>'; } })();
    const sug = t.w ? [] : suggest(t.q);
    const box = `<div class="anl-tbox"><span class="anl-tic">${ic('search', 20)}</span><input data-inp="anlToolType" data-key="anlToolKey" data-fkey="anlTool" value="${escA(t.q || '')}" aria-label="Type a word to see its links" placeholder="Type a word — big, bird, teach…" autocomplete="off" autocapitalize="off" spellcheck="false">
      ${t.q || t.w ? `<button class="anl-tclear" data-act="anlTool" data-arg="clear" aria-label="Clear">${ic('close', 16)}</button>` : ''}</div>
      ${sug.length ? `<div class="anl-sugs typed" role="listbox" aria-label="Words that start with ${escA(t.q)}">${sug.map((w) => `<button class="anl-sug" role="option" data-act="anlTool" data-arg="word:${escA(w)}">${esc(w)}</button>`).join('')}</div>` : t.q && !t.w ? `<p class="anl-note">No links for “${esc(t.q)}” yet. Try a shorter start, or browse a link below.</p>` : ''}`;
    let main = '';
    if (t.w) { const rows = (I.by[t.w] || []).slice(); const g = {}; rows.forEach((x) => { (g[x.L] = g[x.L] || []).push(x); });
      const order = (A0.lessons || []).map((l) => l.id).filter((id) => g[id]);
      const gl = A0.gloss[t.w];
      let ask = '';
      if (t.ask) { const q = t.ask; const v = q.picked;
        ask = `<div class="anl-card anl-askcard"><h3 class="anl-h3">${ic('spark', 15)} An analogy from this link</h3>
          <div class="anl-q"><span>${esc(q.a.toUpperCase())}</span><i>:</i><span>${esc(q.b.toUpperCase())}</span><i>::</i><span>${esc(q.c.toUpperCase())}</span><i>:</i><span class="anl-blank">${v != null ? esc(q.x.b.toUpperCase()) : '?'}</span></div>
          <div class="anl-opts n${q.opts.length}">${q.opts.map((o, i) => { const cls = v == null ? '' : i === q.ans ? ' ok' : i === v ? ' no' : ' dim';
            return `<button class="anl-opt${cls}" data-act="anlTool" data-arg="pick:${i}"${v != null ? ' disabled' : ''}><span class="anl-k">${i + 1}</span><span class="anl-ow">${esc(o)}</span></button>`; }).join('')}</div>
          ${v == null ? '' : `<div class="${v === q.ans ? 'anl-yes' : 'anl-miss'}"><p><b>${v === q.ans ? 'Yes.' : 'It is ' + esc(q.x.b) + '.'}</b> ${esc(linkLine(q.x.rel, q.x.a, q.x.b))}</p><p class="anl-why">The first pair: ${esc(linkLine(q.srel, q.a, q.b))}</p></div>`}</div>`; }
      main = `<div class="anl-card anl-wordhead"><div><h2 class="anl-ct">${esc(t.w)}</h2>${gl ? `<p class="anl-cs">${esc(gl)}</p>` : ''}</div>
          <button class="anl-say" data-act="anlTool" data-arg="say" aria-label="${escA('Hear ' + t.w)}">${ic('volume', 16)}</button></div>${ask}
        ${order.map((id) => { const L = lesson(id); const list = g[id].slice(0, 12);
          return `<section class="anl-lgroup"><h3 class="anl-lg">${lic(id, 16)} ${esc(L.title)} <span>${g[id].length}</span></h3><ul class="anl-lrows">${list.map((x) => pairRow(x, t.w)).join('')}</ul>
            ${makeAsk(g[id][0]) ? `<button class="anl-btn sm" data-act="anlTool" data-arg="ask:${escA(id)}">${ic('spark', 15)} Make an analogy from this link</button>` : ''}</section>`; }).join('')}`; }
    else if (t.lk) { const L = lesson(t.lk); const list = (I.byLesson[t.lk] || []).slice(0, 40);
      main = `<div class="anl-card"><div class="anl-ctop"><span class="anl-cic">${lic(L.id, 24)}</span><div><h2 class="anl-ct">${esc(L.title)}</h2><p class="anl-cs">${esc(L.idea)}</p></div></div>
        <ul class="anl-lrows">${list.map((x) => pairRow(x, null)).join('')}</ul>
        <div class="anl-btns"><button class="anl-btn" data-act="anlTool" data-arg="links">${ic('arrowLeft', 16)} Every link</button><button class="anl-btn main" data-act="openAnalogies">Learn it in the Analogy Atlas</button></div></div>`; }
    if (!t.w && !t.lk && !t.q) { const ws = I.words; const d0 = day(); const pick = [];
      for (let k = 0; pick.length < 12 && k < 60; k++) { const w = ws[hash(d0 + '|' + k) % ws.length]; if ((I.by[w] || []).length >= 2 && pick.indexOf(w) < 0) pick.push(w); }
      main = `<h2 class="anl-h2">Try a word</h2><div class="anl-sugs">${pick.map((w) => `<button class="anl-sug" data-act="anlTool" data-arg="word:${escA(w)}">${esc(w)}</button>`).join('')}</div>
        <h2 class="anl-h2">Browse a link</h2><div class="anl-lgrid">${(A0.lessons || []).map((L) => { const ex = (L.stems || [])[0] || [];
          return `<button class="anl-lcard" data-act="anlTool" data-arg="link:${escA(L.id)}"><span class="anl-cic">${lic(L.id, 20)}</span><span class="anl-lct">${esc(L.title)}</span><span class="anl-lcx">${esc((ex[0] || '') + ' → ' + (ex[1] || ''))}</span><span class="anl-lcn">${(I.byLesson[L.id] || []).length} pairs</span></button>`; }).join('')}</div>`; }
    return `<div class="anl-page">${hd}${box}${main}</div>`; }
  function toolAct(arg) { const t = T(); arg = String(arg || ''); const k = arg.split(':')[0], v = arg.slice(arg.indexOf(':') + 1);
    if (k === 'word') { t.w = linkIndex().by[v] ? v : null; t.q = ''; t.lk = null; t.ask = null; }
    else if (k === 'link') { t.lk = lesson(v) ? v : null; t.w = null; t.q = ''; t.ask = null; }
    else if (k === 'links' || k === 'clear') { t.w = null; t.lk = null; t.q = ''; t.ask = null; }
    else if (k === 'ask') { const x = (linkIndex().by[t.w] || []).find((y) => y.L === v); t.ask = x ? makeAsk(x) : null; }
    else if (k === 'pick') { if (t.ask && t.ask.picked == null && +v >= 0 && +v < t.ask.opts.length) { t.ask.picked = +v; try { sfx(+v === t.ask.ans ? 'correct' : 'wrong'); } catch (e) {} } }
    else if (k === 'say') { try { say(t.w); } catch (e) {} return; }
    render(); if (k === 'word' || k === 'link' || k === 'ask') { try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {} } }
  function toolType(v) { const t = T(); t.q = String(v || '').toLowerCase().replace(/[^a-z\- ]/g, ''); if (t.w) t.w = null; t.ask = null; t.lk = null; render(); }
  function toolKey(e) { const t = T(); if (e.key === 'Enter') { const s0 = suggest(t.q)[0]; if (s0) { e.preventDefault(); toolAct('word:' + s0); } }
    else if (e.key === 'Escape') { e.preventDefault(); toolAct('clear'); } }

  /* ------------------------------------------------------------------ styles (lazy, with the tab) */
  function css() { if (document.getElementById('anl-css')) return; const st = document.createElement('style'); st.id = 'anl-css'; st.textContent = `
.anl-page{max-width:900px;margin:0 auto}
.anl-rtabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:4px 0 12px}
@media (max-width:640px){.anl-rtabs{grid-template-columns:repeat(2,minmax(0,1fr))}}
.anl-rtab{min-height:56px;text-align:left;padding:9px 12px;border-radius:14px;border:1px solid var(--line);background:var(--paper,var(--bg2));display:grid;gap:2px;color:var(--ink,inherit)}
.anl-rtab.on{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent) inset}
.anl-rtab.locked{opacity:.62;border-style:dashed}
.anl-rname{font-family:var(--display);font-weight:800;font-size:15px;display:inline-flex;align-items:center;gap:5px}
.anl-rsub{font-size:12px;color:var(--muted)}
.anl-board{position:relative;width:100%;aspect-ratio:16/9;border-radius:20px;overflow:hidden;border:1px solid var(--line);box-shadow:var(--sh-rest,0 4px 18px rgba(0,0,0,.08));container-type:inline-size}
.anl-scene,.anl-walk{position:absolute;inset:0;width:100%;height:100%;display:block}
.anl-paint img{width:100%;height:100%;object-fit:cover;display:block}
.anl-board.painted .anl-walk{filter:drop-shadow(0 1px 2px rgba(0,0,0,.5))}
.anl-stop{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:3px;min-width:48px;min-height:48px;background:none;border:0;padding:0;cursor:pointer;z-index:2}
.anl-med{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:#FFFFFF;color:#3A2A5A;border:3px solid #F2A93B;box-shadow:0 3px 10px rgba(0,0,0,.28)}
.anl-stop.done .anl-med{background:#F2A93B;color:#FFFFFF;border-color:#FFFFFF}
.anl-stop.chk .anl-med{border-color:#7A4FD0;color:#7A4FD0}
.anl-stop.chk.done .anl-med{background:#7A4FD0;color:#FFFFFF}
.anl-stop.locked .anl-med{background:rgba(255,255,255,.72);color:#6B6478;border:2px dashed #8B8398;box-shadow:none}
.anl-stop.sel .anl-med{outline:4px solid rgba(255,255,255,.95);outline-offset:2px}
.anl-stop:focus-visible .anl-med{outline:4px solid #3B6FE0;outline-offset:2px}
.anl-lab{font-family:var(--display);font-weight:800;font-size:12px;line-height:1.1;padding:3px 8px;border-radius:999px;background:rgba(255,255,255,.92);color:#2A2140;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.18)}
@container (max-width:560px){.anl-lab{display:none}.anl-med{width:44px;height:44px}}
.anl-me{position:absolute;bottom:calc(100% - 4px);left:50%;transform:translate(-50%,0);width:40px;height:40px;filter:drop-shadow(0 3px 6px rgba(0,0,0,.35));pointer-events:none}
.anl-me svg,.anl-me img{width:100%;height:100%}
.anl-card{background:var(--paper,var(--bg2));border:1px solid var(--line);box-shadow:var(--sh-rest,none);border-radius:18px;padding:16px 18px;margin-top:12px}
.anl-hint{color:var(--muted);text-align:center}
.anl-ctop{display:flex;gap:12px;align-items:flex-start}
.anl-cic{flex:0 0 auto;width:46px;height:46px;border-radius:14px;display:grid;place-items:center;background:var(--accent);color:#FFFFFF}
.anl-cic.chk{background:#7A4FD0}
.anl-cic.big{width:64px;height:64px;border-radius:20px}
.anl-ct{font-family:var(--display);font-size:20px;margin:0}
.anl-cs{margin:4px 0 0;color:var(--muted);line-height:1.45}
.anl-btns{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.anl-btn{min-height:46px;padding:10px 16px;border-radius:999px;border:1px solid var(--line);background:var(--bg2,var(--surface));font-family:var(--display);font-weight:800;font-size:15px;display:inline-flex;align-items:center;gap:7px;color:inherit}
.anl-btn.main{background:var(--accent);border-color:var(--accent);color:#FFFFFF}
.anl-kb{font-size:11px;opacity:.75;border:1px solid currentColor;border-radius:6px;padding:1px 5px}
.anl-note{font-size:13px;color:var(--muted);margin:10px 0 0;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.anl-lock{margin:12px 0 0;color:var(--muted);display:flex;align-items:center;gap:6px}
.anl-h2{font-family:var(--display);font-size:18px;margin:22px 0 8px}
.anl-games{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
@media (max-width:560px){.anl-games{grid-template-columns:1fr}}
.anl-game{text-align:left;min-height:120px;padding:16px;border-radius:18px;border:0;color:#FFFFFF;display:grid;gap:4px;align-content:start}
.anl-game.bee{background:linear-gradient(140deg,#20385E,#16233F)}
.anl-game.clk{background:linear-gradient(140deg,#1F6E5A,#124C3E)}
.anl-gic{color:#FFD98A}.anl-gt{font-family:var(--display);font-weight:900;font-size:19px}.anl-gp{font-size:13px;opacity:.9;line-height:1.4}.anl-gb{font-size:12px;color:#FFD98A;font-weight:700}
.anl-lesson p{line-height:1.55;max-width:66ch}
.anl-big{font-size:17px;line-height:1.5;margin:0}
.anl-h3{font-family:var(--display);font-size:15px;margin:16px 0 4px;color:var(--accent);display:flex;align-items:center;gap:6px}
.anl-askcard .anl-h3{margin-top:0}
.anl-words{list-style:none;padding:0;margin:12px 0 0;display:grid;gap:6px}
.anl-word{display:grid;grid-template-columns:44px minmax(90px,auto) minmax(0,1fr);gap:10px;align-items:center;padding:6px 0;border-bottom:1px solid var(--line)}
.anl-say{width:44px;height:44px;border-radius:50%;border:1px solid var(--line);background:var(--bg2,var(--surface));display:grid;place-items:center;color:var(--accent)}
.anl-ww{font-family:var(--display);font-weight:800;font-size:16px}.anl-wd{font-size:14px;color:var(--muted);line-height:1.4}
@media (max-width:520px){.anl-word{grid-template-columns:44px minmax(0,1fr)}.anl-wd{grid-column:2}}
.anl-run-top{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.anl-x{min-height:44px;padding:8px 12px;border-radius:999px;border:1px solid var(--line);background:var(--surface);display:inline-flex;gap:6px;align-items:center;font-weight:700;color:inherit}
.anl-kind{font-family:var(--display);font-weight:800;flex:1;min-width:0}
.anl-count,.anl-right{font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums;display:inline-flex;gap:4px;align-items:center}
.anl-time{font-family:var(--display);font-weight:900;font-size:22px;color:var(--accent);min-width:3ch;text-align:right;font-variant-numeric:tabular-nums}.anl-time.low{color:var(--bad,#D33)}
.anl-q{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:8px;font-family:var(--display);font-weight:900;font-size:clamp(17px,4vw,25px);letter-spacing:.01em;margin:6px 0 4px;text-align:center}
.anl-q span{padding:8px 14px;border-radius:14px;background:color-mix(in srgb,var(--accent) 11%,var(--paper,#FFFFFF));border:2px solid color-mix(in srgb,var(--accent) 32%,transparent)}
.anl-q span:nth-of-type(n+3){background:color-mix(in srgb,#2E9E5B 11%,var(--paper,#FFFFFF));border-color:color-mix(in srgb,#2E9E5B 38%,transparent)}
.anl-q i{font-style:normal;color:var(--muted);font-weight:800}
.anl-blank{min-width:4ch;text-align:center;border-style:dashed !important}
/* Learn, one step a screen */
.anl-stepper{padding:18px 20px 16px;min-height:320px;display:flex;flex-direction:column}
.anl-steps-top{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.anl-stepn{font-size:13px;font-weight:700;color:var(--muted)}
.anl-dots{display:flex;gap:5px}.anl-dot{width:22px;height:6px;border-radius:3px;background:var(--line)}
.anl-dot.done{background:color-mix(in srgb,var(--accent) 45%,transparent)}.anl-dot.on{background:var(--accent)}
.anl-stept{font-family:var(--display);font-size:clamp(20px,3.4vw,26px);margin:10px 0 6px}
.anl-stepbody{flex:1;display:grid;align-content:start;gap:14px}
.anl-stepbody>*{animation:anl-in .3s ease both}
@keyframes anl-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.anl-stepbody>*{animation:none}}
.anl-lead{font-size:18px;line-height:1.5;margin:0;max-width:62ch}
.anl-pair{display:grid;grid-template-columns:minmax(0,1fr) minmax(84px,170px) minmax(0,1fr);align-items:center;gap:6px;max-width:640px;width:100%;margin:0 auto}
.anl-tile{font-family:var(--display);font-weight:900;font-size:clamp(19px,4.4vw,30px);text-align:center;padding:14px 10px;border-radius:18px;overflow-wrap:anywhere;
  background:color-mix(in srgb,var(--accent) 11%,var(--paper,#FFFFFF));border:2px solid color-mix(in srgb,var(--accent) 32%,transparent);box-shadow:0 3px 0 color-mix(in srgb,var(--accent) 20%,transparent)}
.anl-pair.two .anl-tile,.anl-pairs2 .anl-pair+.anl-pair .anl-tile,.anl-brow+.anl-said+.anl-brow .anl-tile{background:color-mix(in srgb,#2E9E5B 11%,var(--paper,#FFFFFF));border-color:color-mix(in srgb,#2E9E5B 38%,transparent);box-shadow:0 3px 0 color-mix(in srgb,#2E9E5B 22%,transparent)}
.anl-tile.blank{border-style:dashed !important;color:var(--muted);box-shadow:none}
.anl-link{display:grid;justify-items:center;color:var(--accent);min-width:0}
.anl-link>svg{width:100%;height:30px;display:block}
.anl-link em{font-style:normal;font-size:12px;font-weight:800;line-height:1.1;display:inline-flex;align-items:center;gap:4px;padding:4px 9px;border-radius:999px;background:color-mix(in srgb,var(--accent) 12%,transparent);white-space:nowrap;margin-top:-2px;max-width:100%}
.anl-link em svg{flex:0 0 auto}
.anl-said{margin:0 auto;max-width:640px;width:100%;font-family:var(--display);font-weight:800;font-size:18px;padding:12px 14px;border-radius:14px;background:color-mix(in srgb,var(--accent) 9%,transparent);display:flex;gap:8px;align-items:center}
.anl-said.sm{font-size:15px;padding:8px 12px;font-family:inherit;font-weight:700}
.anl-tipbox,.anl-trapbox{display:flex;gap:12px;align-items:flex-start;padding:14px 16px;border-radius:16px;font-size:17px;line-height:1.5}
.anl-tipbox p,.anl-trapbox p{margin:0}
.anl-tipbox{background:color-mix(in srgb,#3B82F6 10%,transparent);color:inherit}.anl-tipbox svg{color:#2F6FD8;flex:0 0 auto}
.anl-trapbox{background:rgba(242,169,59,.16)}.anl-trapbox svg{color:#C77800;flex:0 0 auto}
.anl-build{display:grid;gap:10px}
.anl-brow{display:grid;grid-template-columns:30px minmax(0,1fr);align-items:center;gap:8px}
.anl-bn{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:var(--accent);color:#FFFFFF;font-weight:800;font-size:14px}
.anl-whole{text-align:center;font-size:18px;margin:4px 0 0}
.anl-pairs2{display:grid;gap:12px}
.anl-ready{display:grid;justify-items:center;text-align:center;gap:10px;color:var(--accent)}
.anl-ready .anl-lead{color:var(--ink,inherit)}
.anl-recap{text-align:left;max-width:520px;margin:0;padding-left:22px;display:grid;gap:6px;font-size:16px;line-height:1.45;color:var(--ink,inherit)}
.anl-btns.center{justify-content:center}
.anl-stepnav{display:flex;justify-content:space-between;gap:10px;margin-top:18px;padding-top:14px;border-top:1px solid var(--line)}
.anl-btn[disabled]{opacity:.45;cursor:default}
@media (max-width:480px){.anl-pair{grid-template-columns:minmax(0,1fr) 64px minmax(0,1fr)}.anl-link em{font-size:0;padding:4px}.anl-link em svg{width:14px;height:14px}.anl-lead,.anl-tipbox,.anl-trapbox{font-size:16px}}
.anl-ask{text-align:center;color:var(--muted);margin:6px 0 12px}
.anl-opts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.anl-opts.n3,.anl-opts.lines{grid-template-columns:1fr}
.anl-opts.n5 .anl-opt:last-child{grid-column:1/-1}
@media (min-width:720px){.anl-opts.n3{grid-template-columns:repeat(3,minmax(0,1fr))}}
.anl-opt{min-height:52px;padding:10px 14px;border-radius:14px;border:2px solid var(--line);background:var(--bg2,var(--surface));font-family:var(--display);font-weight:800;font-size:17px;display:flex;align-items:center;gap:10px;text-align:left;color:inherit}
.anl-opt.line{font-family:inherit;font-weight:600;font-size:15px}
/* A word option never runs out of its button (P0.17: "establishment" crossed its button on a 390px
   phone in Against the Clock). The word is its own flex item that may shrink (min-width:0) and, as
   the last resort, wrap; below 560px the four words stack one to a row, as Word Lore's options do,
   so a long word has the whole card's width instead of half of it. Guard: tests/mobile-layout.cjs. */
.anl-ow{min-width:0;overflow-wrap:anywhere}
@media (max-width:560px){.anl-opts{grid-template-columns:1fr}.anl-opt{min-height:48px}}
.anl-opt:not([disabled]):hover{border-color:var(--accent)}
.anl-opt:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
.anl-opt.ok{border-color:#2E9E5B;background:rgba(46,158,91,.14)}
.anl-opt.no{border-color:#D14343;background:rgba(209,67,67,.12)}
.anl-opt.dim{opacity:.55}
.anl-k{flex:0 0 auto;width:26px;height:26px;border-radius:8px;display:grid;place-items:center;background:var(--line);font-size:13px}
.anl-yes{margin-top:12px;padding:12px 14px;border-radius:14px;background:rgba(46,158,91,.12)}
.anl-miss{margin-top:12px;padding:12px 14px;border-radius:14px;background:rgba(242,169,59,.14);display:grid;gap:4px}
.anl-miss p,.anl-yes p{margin:0;line-height:1.5}
.anl-why{color:var(--muted);font-size:14px}
.anl-miss .anl-btn{justify-self:start;margin-top:6px}
.anl-hear{margin:12px auto 0;display:flex;align-items:center;gap:6px;min-height:44px;padding:8px 14px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:inherit}
.anl-log{list-style:none;padding:0;margin:12px 0 0;display:grid;gap:5px}
.anl-log li{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.anl-log li.ok{color:#2E7D4F}.anl-log li.no{color:#B33A3A}.anl-was{color:var(--muted)}
.anl-center{text-align:center}.anl-center .anl-btns{justify-content:center}.anl-center .anl-note{justify-content:center}
.anl-field{list-style:none;padding:0;margin:8px 0 12px;display:flex;flex-wrap:wrap;justify-content:center;gap:8px}
.anl-rival{display:grid;justify-items:center;gap:2px;width:64px;font-size:12px;font-weight:700}
.anl-rival svg,.anl-rival img{width:46px;height:46px}
.anl-rival.me span{color:var(--accent)}
.anl-rival.sat{opacity:.32;filter:grayscale(1)}
.anl-rival.right span{color:#2E7D4F}.anl-rival.now span,.anl-rival.miss span{color:#B33A3A}
/* Link Finder */
.anl-tbox{display:flex;align-items:center;gap:8px;margin:6px 0 8px;padding:6px 8px 6px 14px;border-radius:999px;border:2px solid var(--line);background:var(--surface,var(--paper))}
.anl-tbox:focus-within{border-color:var(--accent)}
.anl-tic{color:var(--muted);display:grid}
.anl-tbox input{flex:1;min-width:0;min-height:44px;border:0;background:transparent;font-size:18px;font-weight:700;color:inherit;outline:none}
.anl-tclear{width:44px;height:44px;border-radius:50%;border:0;background:var(--bg2,var(--line));display:grid;place-items:center;color:inherit}
.anl-sugs{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}
.anl-sug{min-height:44px;padding:8px 16px;border-radius:999px;border:1px solid var(--line);background:var(--paper,var(--bg2));font-family:var(--display);font-weight:800;font-size:16px;color:inherit}
.anl-sug:hover{border-color:var(--accent)}
.anl-wordhead{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.anl-wordhead .anl-ct{font-size:28px}
.anl-lgroup{margin-top:14px;padding:14px 16px;border-radius:18px;border:1px solid var(--line);background:var(--paper,var(--bg2))}
.anl-lg{font-family:var(--display);font-size:17px;margin:0 0 8px;display:flex;align-items:center;gap:7px;color:var(--accent)}
.anl-lg span{font-size:12px;color:var(--muted);font-weight:700;margin-left:auto}
.anl-lrows{list-style:none;padding:0;margin:0;display:grid;gap:10px}
.anl-lrow{display:grid;gap:4px;padding-bottom:10px;border-bottom:1px dashed var(--line)}
.anl-lrow:last-child{border-bottom:0;padding-bottom:0}
.anl-pair.sm .anl-tile{font-size:clamp(16px,3.4vw,21px);padding:9px 8px;border-radius:14px}
.anl-tile.go{cursor:pointer;color:inherit;font:inherit;font-family:var(--display);font-weight:900}
.anl-tile.go:hover{border-color:var(--accent)}
.anl-tile.me{background:var(--accent);border-color:var(--accent);color:#FFFFFF}
.anl-lsay{margin:0;text-align:center;color:var(--muted);font-size:14px}
.anl-btn.sm{min-height:44px;font-size:14px;margin-top:10px}
.anl-askcard{border-color:var(--accent)}
.anl-lgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
@media (max-width:720px){.anl-lgrid{grid-template-columns:repeat(2,minmax(0,1fr))}}
.anl-lcard{text-align:left;display:grid;grid-template-columns:auto minmax(0,1fr);grid-template-rows:auto auto auto;column-gap:10px;row-gap:2px;padding:12px;border-radius:16px;border:1px solid var(--line);background:var(--paper,var(--bg2));color:inherit;min-height:88px}
.anl-lcard .anl-cic{grid-row:1/4;width:40px;height:40px;border-radius:12px}
.anl-lct{font-family:var(--display);font-weight:800;font-size:16px}.anl-lcx{font-size:14px;color:var(--muted)}.anl-lcn{font-size:12px;color:var(--muted)}
.anl-lcard:hover{border-color:var(--accent)}
`; document.head.appendChild(st); }

  /* ------------------------------------------------------------------ the door */
  const API = { open, openRoute, view, beeView, openBee, stop, route, act, beeAct, beeBest, toolView, openTool, toolRoute, toolAct, here: () => { const h = here(); return h ? { region: h.r.id, name: h.r.name } : null; },
    _question: question, _bridge: bridgeQ, _linkLine: linkLine, _safeIds: safeIds };
  W.SB_ANL = API;
  try { Object.assign(app, { anl: (a) => act(a), anlBee: (a) => beeAct(a), anlTool: (a) => toolAct(a), anlToolType: (v) => toolType(v), anlToolKey: (e) => toolKey(e) }); } catch (e) {}
  try { if (state.nav === 'analogy' || state.nav === 'anlbee' || state.nav === 'anltool') render(); } catch (e) {}
})();
