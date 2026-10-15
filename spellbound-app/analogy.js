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
     · no definition is on screen while a question is open (it would give the link away).
   THE REASONING ROUNDS (the Bee Circuit §11, build step 9) are an OVERLAY on the four region boards: a hall pin on
   each board opens the Mock Analogy Bee at that region's level with the Circuit's cast seated (Theo headlines every
   hall, Rafi joins from Workshop Valley on), and Theo's notebook keeps a page a hall, quoted from the region's own
   lessons. Nothing in the tab reads a hall: the stops, checks, unlocks and mastery are what they were. See the
   section "THE REASONING ROUNDS" below, and tests/analogy-halls*.cjs. */
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
    if (s.v === 'note' && s.reg) return 'analogies/' + s.reg + '/notebook';
    return 'analogies' + (s.reg ? '/' + s.reg : ''); };
  function openRoute(parts) { open(parts[0] === 'clock' ? 'clock' : null); const s = S();
    if (parts[0] && regionById(parts[0])) { s.reg = parts[0]; if (parts[1] === 'notebook' && noteKept(parts[0])) { aimAt(parts[0]); s.v = 'note'; }
      /* #/analogies/<region>/hall: the hall's own door, for an address (the hall itself runs at #/anlbee — BUILD-reasoning.md) */
      if (parts[1] === 'hall' && HALLS[parts[0]]) { aimAt(parts[0]); openHall(parts[0]); if (state.nav === 'anlbee') return; } }
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
  /* THE WORD BANDS (the 4.5 brief, P1.2): the two analogy GAMES — Against the Clock (at Auto: up to the child's
     band) and the Mock Analogy Bee (at its own level: Easy is band 1) — ask only items whose every word (C, the
     answer, each wrong answer) is inside the child's window: SB_BAND.most(words) ≤ the window's top. The stops and
     level checks are the tab's course, like the Atlas's own stop lists, and are not banded. A window too narrow to
     hold eight items keeps the lowest-band items there are, never the higher ones first. */
  function itemBand(id) { const A0 = D(), it = A0 && A0.items[id]; return it && W.SB_BAND ? SB_BAND.most(itemWords(it)) : 1; }
  function bandIds(ids, level) {
    if (!W.SB_BAND || typeof SB_BAND.win !== 'function') return ids;
    const hi = SB_BAND.win(kid(), level || 'auto', 0).hi, inb = ids.filter((id) => itemBand(id) <= hi);
    if (inb.length >= 8) return inb;
    return ids.slice().sort((a, b) => itemBand(a) - itemBand(b)).slice(0, Math.max(8, inb.length));
  }

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
  /* a '~' before an id marks a COMEBACK on the clock (road to 4.5, P1.20) — one '~' a return: the item missed three
     questions ago, asked again with its options in a new order until it is right, three times at most — practice, never
     a first try (pick() neither counts nor pays it) */
  function prep(g) { const raw = String(g.ids[g.i % g.ids.length]), again = (raw.match(/^~*/) || [''])[0].length;
    g.q = question(raw.slice(again), g.opts, g.seed + '|' + g.i + (again ? '|again' : '')); if (g.q && again) g.q.again = again; g.picked = null; g.bpick = null;
    if (g.phase === 'bridge') g.bq = bridgeQ(g.q, g.seed + '|' + g.i);
    g.qAt = Date.now(); g.fx = null; }
  /* pay only above chance: nothing until a round holds 6 right, then every right (the clock: 60% and 15 asked) */
  /* the clock's 60% is of every answer given, comebacks included (as Word Lore's): a guesser cannot reach it on a few lucky first tries */
  function owed(g) { if (g.kind === 'clock') { const tries = g.asked + (g.log || []).filter((x) => x && x.again).length, acc = tries ? g.right / tries : 0; if (acc < 0.6) return 0; return (g.phase === 'done' ? g.right >= 6 : g.asked >= 15) ? g.right : 0; }
    return g.right >= 6 ? g.right : 0; }
  function settle(g) { let k = owed(g) - g.paid; while (k-- > 0) { g.paid++; try { payG(g); } catch (e) {} } }
  function pickBridge(i) { const g = (S().run); if (!g || g.phase !== 'bridge' || g.bpick != null) return; g.bpick = +i; g.fx = { t: Date.now() };
    ding('analogy', g.bpick === g.bq.ans);
    render(); if (g.bpick === g.bq.ans) after(g, 900, () => { g.phase = 'pick'; render(); }); }
  function pick(i) { const s = S(); const g = s.run; if (!g || g.picked != null || (g.phase !== 'pick')) return; i = +i; const q = g.q; if (!(i >= 0 && i < q.opts.length)) return;
    if (g.kind === 'clock' && g.held) return;
    /* THE CLOCK COUNTS FIRST-TRY RIGHTS ONLY (road to 4.5, P1.20; rubric W2): a comeback is neither asked nor right,
       and never pays; a miss costs 2 s and brings the item back three questions on, until it is right (three times at most) */
    const ok = i === q.ans; g.picked = i; if (!q.again) { g.asked++; if (ok) g.right++; }
    g.log.push({ c: q.c, d: q.d, rel: q.rel, ok, w: q.opts[i], again: q.again ? 1 : 0 }); rec().seen[q.id] = Date.now(); g.fx = { t: Date.now() };
    ding('analogy', ok);
    if (ok && !q.again) settle(g);
    if (g.kind === 'clock') { if (!ok) { clockAdd(-2000); g.held = true; if ((q.again | 0) < 3 && g.i + 4 < g.ids.length) g.ids.splice(g.i + 4, 0, '~'.repeat((q.again | 0) + 1) + q.id); } else after(g, 380, next); render(); return; }
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
    g.doneAt = Date.now(); fanfare('analogy', g.pass || g.newBest);
    try { if (g.pass || g.newBest) burstConfetti(g.masteredNow ? 120 : 70); } catch (e) {}
    store(); render(); }

  /* ------------------------------------------------------------------ the clock: real time, held while a miss is up */
  const CLOCK_MS = 60000;
  function startClock() { const s = S(); const h = here(); const r = h ? h.r : regions()[0]; if (!r) return;
    const lvHi = r.lv[1]; const pool = []; const A0 = D();
    regions().forEach((rg) => { if (rg.lv[0] <= lvHi) { rg.stops.forEach((st) => pool.push(...st.items)); } });
    (A0.games || []).forEach((id) => { const it = A0.items[id]; if (it && it[1] <= lvHi + 1) pool.push(id); });
    const safe = bandIds(safeIds(pool), 'auto'); const seed = day() + '|clock|' + (rec().n++); const ord = perm(seed, safe.length).map((i) => safe[i]);
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
  /* Painted maps (voice/pipeline/analogy-maps.py → app-art/anl-<region>.webp, 16:9 like the board). A region listed here
     shows its painting instead of the drawn scenery, and its road is the one TRACED ALONG THE PAINTED BAND, in the board's
     1600×900 space — measured by eye against the picture, exactly like the Atlas's ACT_MAP. Regenerate a map, re-trace it.
     tests/analogy-data.cjs holds every image named here to a file in app-art. */
  const ART = {
    ponds: { img: 'anl-ponds.webp', road: [[70, 870], [200, 720], [400, 652], [700, 645], [1000, 640], [1230, 628], [1360, 540], [1390, 420], [1330, 300], [1200, 238], [950, 235], [700, 238], [450, 245], [300, 272]] },
    orchard: { img: 'anl-orchard.webp', road: [[40, 800], [250, 748], [600, 738], [1000, 745], [1300, 712], [1410, 600], [1330, 492], [1100, 442], [750, 428], [400, 422], [220, 372], [180, 262], [300, 162], [650, 118], [1000, 112], [1300, 86], [1560, 40]] },
    workshop: { img: 'anl-workshop.webp', road: [[60, 860], [250, 732], [550, 702], [900, 702], [1150, 660], [1220, 560], [1120, 482], [880, 442], [620, 418], [430, 392], [310, 300], [350, 196], [600, 160], [850, 215], [1050, 288], [1300, 262], [1400, 150], [1330, 50]] },
    peaks: { img: 'anl-peaks.webp', road: [[230, 185], [130, 290], [90, 430], [150, 580], [330, 690], [600, 745], [870, 765], [1120, 722], [1330, 652], [1450, 520], [1450, 380], [1400, 230], [1380, 90]] },
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
    if (s.v === 'note') return noteView();
    return mapView(); }
  function head(title, sub, back, backLabel, icon) {
    try { return pageHead(title, '', sub || '', W.coinChip ? coinChip() : '', back || 'goHome', backLabel || 'Home', back === 'anl' ? 'map' : null, icon || ''); }
    catch (e) { return `<h1>${esc(title)}</h1>`; } }
  function mapView() { kickKit(); const s = S(); const R = regions(); const reg = regionById(s.reg) || R[0]; const ri = R.indexOf(reg); const c = kid();
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
      ${marks.join('')}${hallPin(reg, ri)}</div>${hallBar(reg, ri)}`;
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
  /* ------------------------------------------------------------------ THE GAMES STAND ON THE ENGINE KIT'S STAGE
     (road to 4.5, P3.1/P3.2 — the audit: "the Analogies games (bee, clock, practice) are flat white cards on the
     honeycomb"). Practice, the check, the level check, Against the Clock and the Mock Analogy Bee are drawn on
     SGUI.stage (saga2.js): a painted plate by name through SB_PLATE (the Library's 'lore' for the Atlas's rounds and the
     clock, the observatory's 'hive' for the bee), the paper grain on every panel, the HUD mirrored (the way back and a
     count on the left, a count on the right, the title on the centre line) and the answers in the controls row — on a
     phone, the thumb's bottom third. The map, Learn and Meet the words stay pages, like the Word Atlas's.
     The kit is lazy (saga2, on the idle queue and in every game's group): a run asks for it and draws the hive loader
     for the moment it takes. tests/analogy-stage.cjs holds the T14/T15 checks on every one of these screens. */
  const kit = () => !!(W.SGUI && typeof SGUI.stage === 'function');
  const PLATE = { run: 'lore', clock: 'lore', bee: 'hive' };
  function needKit(nav) { try { if (W.SB_LAZY) SB_LAZY.need('saga2', () => { if (state.nav === nav) render(); }); } catch (e) {}
    try { return W.hiveLoader ? hiveLoader('setting the stage…') : ''; } catch (e) { return ''; } }
  /* a round starts only once its stage can be drawn (the engine kit's rule turned round: the screen before the round),
     so its first question is never asked behind a loader; the map asks for the kit (a KICK) the moment it is drawn */
  function withKit(fn) { if (kit()) { fn(); return; }
    try { if (W.SB_LAZY) { SB_LAZY.need('saga2', () => { if (state.nav === 'analogy') fn(); }); return; } } catch (e) {} fn(); }
  const kickKit = () => { try { if (!kit() && W.SB_LAZY) SB_LAZY.need('saga2', null, 1); } catch (e) {} };
  /* after the draw: fit the stage to the shell (a stage drawn by render is refitted by the kit's watch too), and if a
     tall text size pushes the why past the play area, show the why — the play area scrolls inside the stage, never the page */
  function stageAnl(o, inRun) { setTimeout(() => { try { if (W.SGUI && SGUI.stageFit) SGUI.stageFit();
      const r = document.querySelector('.anl-kit .sg-st-region'), m = r && r.querySelector('.anl-miss,.anl-yes');
      if (m && r.scrollHeight > r.clientHeight + 1) r.scrollTop = r.scrollHeight; } catch (e) {} }, 0);
    return `<div class="anl-page anl-onstage${inRun ? ' anl-run' : ''}">${SGUI.stage({ plate: o.plate, name: 'anl-' + o.plate, cls: 'anl-kit' + (o.cls ? ' ' + o.cls : ''), label: o.label || 'Analogies',
      hud: o.hud, play: o.play, controls: o.controls || '' })}</div>`; }
  /* a HUD stat in the kit's shape (icon · number · label; the label is read, not drawn, on a phone) */
  const stat = (k, v, icn, id) => `<span class="sg-st-ic">${ic(icn || 'star', 16)}</span><span class="sg-st-n anl-sv${id === 'anl-time' ? ' anl-time' : ''}"${id ? ` id="${id}"` : ''}>${v}</span><span class="sg-st-t">${esc(k)}</span>`;
  /* the way back sits in the left stat (so the HUD stays mirrored); the right stat carries an equal blank */
  const backIn = (act, arg, label) => `<button type="button" class="anl-back" data-act="${act}"${arg ? ` data-arg="${escA(arg)}"` : ''} aria-label="${escA(label)}">${ic('arrowLeft', 18)}</button>`;
  const pad = '<span class="anl-pad" aria-hidden="true"></span>';
  const ttl = (t, short) => `<h1 class="sg-st-title anl-ttl"><span class="anl-tl">${esc(t)}</span>${short ? `<span class="anl-ts" aria-hidden="true">${esc(short)}</span>` : ''}</h1>`;
  /* JUICE (P3.14): the classes are put on only in the render straight after the moment they mark, so a later
     redraw (a lazy file landing, a resize) never plays them again. One answer is celebrated, never a run. */
  const fresh = (t, ms) => !!t && Date.now() - t < (ms || 600);
  const fxOpt = (g, i, ans, picked) => (picked == null || !g.fx || !fresh(g.fx.t)) ? '' : i === picked && picked === ans ? ' sg-fx-pop' : i === picked ? ' sg-fx-shake' : '';
  /* STINGS (P3.15): the game's own right-answer and round-done stings (SGUI.sting, composed in code); in Calm, or before
     the kit is in, the plain tone plays instead. The same sting for every right answer — never louder for a run. */
  function ding(game, ok) { try { if (ok && W.SGUI && SGUI.sting && SGUI.sting(game, 'right')) return; sfx(ok ? 'correct' : 'wrong'); } catch (e) {} }
  function fanfare(game, good) { try { if (good && W.SGUI && SGUI.sting && SGUI.sting(game, 'done')) return; sfx(good ? 'win' : 'level'); } catch (e) {} }

  const KIND_NAME = { practice: 'Practice', check: 'Check', level: 'Level check', clock: 'Against the Clock' };
  const KIND_SHORT = { level: 'Level', clock: 'Clock' };
  const KEYS = 'ABCDE';
  function clockIntro() { if (!kit()) return needKit('analogy');
    let best = '–'; try { const b = W.SB_BESTS && SB_BESTS.get('anl/clock'); if (b) best = String(b.right); } catch (e) {}
    return stageAnl({ plate: PLATE.clock, label: 'Against the Clock',
      hud: { left: backIn('anl', 'map', 'Back to the Analogy Atlas') + stat('best', best, 'trophy'), center: ttl('Against the Clock', 'Clock'), right: stat('seconds', '60', 'timer') + pad },
      play: `<div class="anl-card sg-panel anl-center anl-intro"><span class="anl-cic big" aria-hidden="true">${ic('timer', 30)}</span>
        <p class="anl-big">Sixty seconds. Name the link, pick the word. A wrong pick costs two seconds, and the clock waits while you read why.</p>
        <p class="anl-note">Questions come from the regions you have reached.</p></div>`,
      controls: `<div class="anl-btns center"><button class="anl-btn main" data-act="anl" data-arg="clockgo">${ic('timer', 16)} Start the clock <span class="anl-kb">Enter</span></button></div>` }); }
  function hudRun(g) {
    const left = backIn('anl', 'leave', g.kind === 'clock' ? 'Stop the clock' : 'Leave this round') +
      (g.kind === 'clock' ? stat('seconds left', Math.max(0, Math.ceil(g.left / 1000)) + 's', 'timer', 'anl-time') : stat('question', Math.min(g.n, g.i + 1) + '/' + g.n, 'target'));
    return { left, center: ttl(KIND_NAME[g.kind], KIND_SHORT[g.kind]), right: stat(g.kind === 'clock' ? 'right first try' : 'right', String(g.right), 'check') + pad }; }
  function runView(g) { if (!kit()) return needKit('analogy');
    const kindName = KIND_NAME[g.kind];
    if (g.phase === 'done') return doneView(g, kindName);
    const q = g.q; if (!q) return stageAnl({ plate: PLATE.run, hud: hudRun(g), play: `<div class="anl-card sg-panel">This round has no questions yet.</div>` }, true);
    const L = lesson(q.lesson);
    const tag = g.kind === 'practice' && L ? `<span class="anl-tag">${lic(L.id, 13)} ${esc(L.title)}</span>` : '';
    const hear = `<button type="button" class="anl-hear" data-act="anl" data-arg="hear" aria-label="Hear it">${ic('volume', 17)}<span class="anl-hlab">Hear it</span></button>`;
    const stem = `<div class="anl-q" data-live-prompt="${escA(q.a + ' is to ' + q.b + ' as ' + q.c + ' is to what?')}"><span>${esc(q.a.toUpperCase())}</span><i>:</i><span>${esc(q.b.toUpperCase())}</span>${g.phase === 'bridge' ? '' : `<i>::</i><span>${esc(q.c.toUpperCase())}</span><i>:</i><span class="anl-blank">${g.picked != null ? esc(q.d.toUpperCase()) : '?'}</span>`}</div>`;
    /* a held miss makes room for its why: the ask line steps aside (the stem already shows the answer in its blank) */
    const held = (g.phase === 'bridge' ? g.bpick != null && g.bpick !== (g.bq || {}).ans : g.picked != null && g.picked !== q.ans);
    const card = (ask, after) => `<div class="anl-card sg-panel anl-qcard${held ? ' anl-held' : ''}${fresh(g.qAt) ? ' sg-fx-in' : ''}">${tag}${q.again ? `<p class="anl-again">${ic('retry', 14)} Back again — practice, it does not score</p>` : ''}${stem}<div class="anl-askrow"><p class="anl-ask">${ask}</p>${hear}</div>${after}</div>`;
    if (g.phase === 'bridge') { const B = g.bq;
      const opts = B.lines.map((t, i) => { const st = g.bpick == null ? '' : i === B.ans ? ' ok' : i === g.bpick ? ' no' : ' dim';
        return `<button type="button" class="anl-opt line${st}${fxOpt(g, i, B.ans, g.bpick)}" data-act="anl" data-arg="bridge:${i}"${g.bpick != null ? ' disabled' : ''}><span class="anl-k">${i + 1}</span>${esc(t)}</button>`; }).join('');
      const miss = g.bpick != null && g.bpick !== B.ans ? `<div class="anl-miss"><p><b>The link:</b> ${esc(B.lines[B.ans])}</p><button class="anl-btn main" data-act="anl" data-arg="cont">Now the analogy <span class="anl-kb">Enter</span></button></div>` : '';
      return stageAnl({ plate: PLATE.run, label: kindName, hud: hudRun(g), play: card('Step 1 · How are these two linked?', miss),
        controls: `<div class="anl-opts lines" role="group" aria-label="Ways they could be linked">${opts}</div>` }, true); }
    const opts = q.opts.map((o, i) => { const st = g.picked == null ? '' : i === q.ans ? ' ok' : i === g.picked ? ' no' : ' dim';
      return `<button type="button" class="anl-opt${st}${fxOpt(g, i, q.ans, g.picked)}" data-act="anl" data-arg="pick:${i}"${g.picked != null ? ' disabled' : ''}><span class="anl-k">${KEYS[i]}</span><span class="anl-ow">${esc(o)}</span></button>`; }).join('');
    let after = '';
    if (g.picked != null) { const ok = g.picked === q.ans; const line = linkLine(q.rel, q.c, q.d);
      after = ok ? `<div class="anl-yes" role="status"><b>Yes.</b> ${esc(line)}</div>`
        : `<div class="anl-miss" role="status"><p><b>The answer is ${esc(q.d)}.</b> ${esc(line)}</p><p class="anl-why">${esc(tempted(q, q.opts[g.picked]))}</p><p class="anl-why">The first pair: ${esc(linkLine(q.rel, q.a, q.b))}</p>
          <button class="anl-btn main" data-act="anl" data-arg="cont">Continue <span class="anl-kb">Enter</span></button></div>`; }
    const tight = q.opts.length >= 5 && q.opts.every((o) => String(o).length <= 11) ? ' tight' : '';
    return stageAnl({ plate: g.kind === 'clock' ? PLATE.clock : PLATE.run, label: kindName, hud: hudRun(g),
      play: card((g.kind === 'practice' ? 'Step 2 · ' : '') + 'Which word completes the analogy?', after),
      controls: `<div class="anl-opts n${q.opts.length}${tight}" role="group" aria-label="Answers">${opts}</div>` }, true); }
  function doneView(g, kindName) {
    const words = g.log.map((x) => `<li class="${x.ok ? 'ok' : 'no'}">${x.ok ? ic('check', 13) : ic('close', 13)} ${esc(x.c)} → <b>${esc(x.d)}</b>${x.ok ? '' : ` <span class="anl-was">(you chose ${esc(x.w)})</span>`}${x.again ? ' <span class="anl-was">· back again, not scored</span>' : ''}</li>`).join('');
    const big = g.kind === 'clock' ? g.right + ' right first try' : g.right + ' of ' + g.asked;
    let line = '';
    if (g.kind === 'check') line = g.pass ? 'Passed — the next stop is open.' : 'Seven of eight passes. Practise, then check again.';
    if (g.kind === 'level') line = g.masteredNow ? 'Mastered! You passed this level on two different days.' : g.walkedNow ? 'Level passed — the next region is open.' : g.pass ? 'Passed again. Pass on another day to master it.' : 'Eight of ten passes. Practise the stops, then try again.';
    if (g.kind === 'practice') line = 'Practice keeps nothing back: check when you are ready.';
    if (g.kind === 'clock') line = g.newBest ? 'A new best!' : 'Every miss you read is a link you will see next time.';
    const head2 = g.newBest ? 'A new best' : g.pass ? 'Passed' : 'Round complete';
    return stageAnl({ plate: g.kind === 'clock' ? PLATE.clock : PLATE.run, label: kindName,
      hud: { left: backIn('anl', 'map', 'Back to the Analogy Atlas') + stat(g.kind === 'clock' ? 'right first try' : 'right', String(g.right), 'check'), center: ttl(kindName, KIND_SHORT[g.kind]),
        right: stat('coins', String(g.coins || 0), 'coin') + pad },
      play: `<div class="anl-card sg-panel anl-done${fresh(g.doneAt, 900) ? ' sg-fx-done' : ''}" data-live-prompt="${escA(kindName + ': ' + big + '. ' + line)}">
        <div class="anl-dh">${esc(head2)}</div><div class="anl-db">${esc(big)}</div><p class="anl-big">${esc(line)}</p>${g.coins ? `<p class="anl-note anl-pay">${ic('coin', 14)} +${g.coins} coins</p>` : ''}
        <ul class="anl-log">${words}</ul></div>`,
      controls: `<div class="anl-btns center"><button class="anl-btn" data-act="anl" data-arg="map">${ic('arrowLeft', 16)} Back to the map</button><button class="anl-btn main" data-act="anl" data-arg="cont">${ic('retry', 16)} ${g.kind === 'clock' ? 'Play again' : 'Go again'} <span class="anl-kb">Enter</span></button></div>` }, true); }
  /* ------------------------------------------------------------------ actions */
  function act(arg) { const s = S(); arg = String(arg || ''); const [k, v] = [arg.split(':')[0], arg.slice(arg.indexOf(':') + 1)];
    if (k === 'region') { const i = regions().findIndex((r) => r.id === v); if (i < 0 || !regionOpen(i)) { try { flash('Pass the level check before it to open ' + regions()[i].name); } catch (e) {} return; }
      s.reg = v; const r = regions()[i]; const j = r.stops.findIndex((st, x) => stopOpen(r, x) && !passed(st.id)); s.stop = j >= 0 ? r.stops[j].id : r.id + '-check'; s.v = 'map'; render(); return; }
    if (k === 'stop') { const hit = stopById(v); if (!hit) return; s.reg = hit.r.id; s.stop = v; s.v = 'map'; render();
      setTimeout(() => { try { const el = document.querySelector('.anl-card'); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {} }, 30); return; }
    if (k === 'hall') { openHall(v); return; }
    if (k === 'note') { openNote(v); return; }
    if (k === 'noteSay') { noteSay(v); return; }
    const hit = stopById(s.stop);
    if (k === 'learn') { if (hit && hit.s) { s.v = 'lesson'; s.ls = null; render(); try { window.scrollTo(0, 0); } catch (e) {} } return; }
    if (k === 'ls') { lessonAct(v); return; }
    if (k === 'words') { if (hit && hit.s) { s.v = 'words'; render(); try { window.scrollTo(0, 0); } catch (e) {} } return; }
    if (k === 'practice' || k === 'check') { if (hit && hit.s) withKit(() => startRun(k)); return; }
    if (k === 'level') { if (hit && !hit.s) withKit(() => startRun('level')); return; }
    if (k === 'clock') { s.v = 'clock'; s.run = null; render(); return; }
    if (k === 'clockgo') { withKit(startClock); return; }
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
    if (s.v === 'note') { if (k === 'ArrowRight' || k === 'ArrowLeft') { const kept = regions().filter((r) => noteKept(r.id)), i = kept.findIndex((r) => r.id === s.reg);
      const to = kept[i + (k === 'ArrowRight' ? 1 : -1)]; if (to) { e.preventDefault(); openNote(to.id); } } return; }
    if (s.v === 'lesson' && s.ls) { const hit = stopById(s.stop); if (!hit || !hit.s) return; const step = lessonSteps(lesson(hit.s.lesson)).steps[s.ls.i] || {};
      if (k === 'ArrowRight' || k === 'Enter') { e.preventDefault(); lessonAct('next'); return; }
      if (k === 'ArrowLeft') { e.preventDefault(); lessonAct('back'); return; }
      if (/^[1-3]$/.test(k) && (step.k === 'name' || step.k === 'try')) { e.preventDefault(); lessonAct((step.k === 'name' ? 'name:' : 'try:') + (+k - 1)); }
      return; }
    if (k === 'Escape' && g && s.v === 'run') { e.preventDefault(); act('leave'); return; }
    if (k === 'Enter') { if (s.v === 'run' && g && (g.phase === 'done' || g.picked != null || g.bpick != null)) { e.preventDefault(); cont(); } else if (s.v === 'clock' && !g) { e.preventDefault(); withKit(startClock); } return; }
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
  /* a hall asks the same pool at ITS region's level: the Mock Analogy Bee level whose first analogy level is the region's
     (Easy 1 = Twin Ponds, Medium 3 = Orchard Hill, Hard 5 = Workshop Valley, Champ 7 = Bridge Peaks) */
  function beePool(hall) { const A0 = D(); const ids = new Set(A0.games || []); regions().forEach((r) => { r.stops.forEach((st) => st.items.forEach((x) => ids.add(x))); r.check.forEach((x) => ids.add(x)); }); let L = 'auto'; try { L = W.SB_LEVEL ? SB_LEVEL.get('mockAnalogy') : 'auto'; } catch (e) {} if (hall) L = hallLevel(hall); return bandIds(safeIds([...ids]), L); }
  const B = () => state.anlBee;
  function openBee() { stopClock(); state.anlBee = { phase: 'lobby' }; state.nav = 'anlbee'; state.screen = 'app'; state.game = null; try { render(); } catch (e) {} }
  /* the seven seats: [face, name, chance, rival id] from Mock Bee's cast, for the child on screen ([] until mockbee.js is in) */
  function castFor(lo) { const c = kid(); const mine = (c && c.avatar) || 'bizzy';
    const all = (W.MOCKBEE && typeof MOCKBEE.rivals === 'function') ? MOCKBEE.rivals(mine).slice().sort((a, b) => a.lvl - b.lvl) : [];
    if (!all.length) return [];
    const from = Math.max(0, Math.min(all.length - SEATS, Math.round(((lo || beeLevel()) - 1) / 2)));
    return all.slice(from, from + SEATS).map((r) => [r.face, r.name, skillOf(r), r.id]); }
  function beeStart() { const hall = hallIdOf(B());
    if (!(hall ? hallSeats(hall) : castFor()).length) { try { if (W.SB_LAZY) SB_LAZY.need('mockbee', () => { if (state.nav === 'anlbee') beeStart(); }); } catch (e) {} return; }
    if (hall) { hallStart(hall); return; }
    const lo = beeLevel(); const seed = day() + '|bee|' + (rec().n++); const names = castFor(lo).map(([id, name, sk, rid]) => ({ id, rid, name, sk, out: 0 }));
    state.anlBee = { phase: 'turn', seed, lo, round: 1, field: names, me: { out: 0 }, used: {}, log: [], e0: (W.earnedSoFar ? earnedSoFar() : 0) };
    store(); beeAsk(); }
  function beeAsk() { const b = B(); const lv = Math.min(9, b.lo + Math.floor((b.round - 1) / 2)); const pool = beePool(b.hall);
    const A0 = D(); const fits = pool.filter((id) => { const it = A0.items[id]; return it && !b.used[id] && it[1] >= lv - 1 && it[1] <= lv + 1 && it.length >= 7; });
    const P = fits.length ? fits : pool.filter((id) => !b.used[id]); const id = P[hash(b.seed + '|' + b.round) % Math.max(1, P.length)];
    b.used[id] = 1; b.q = question(id, b.round >= 5 ? 5 : 4, b.seed + '|' + b.round); b.picked = null; b.phase = 'turn'; b.qAt = Date.now(); b.fx = null; render(); }
  function beePick(i) { const b = B(); if (!b || b.phase !== 'turn' || b.picked != null) return; i = +i; const q = b.q; if (!q || !(i >= 0 && i < q.opts.length)) return;
    b.picked = i; const ok = i === q.ans; b.log.push({ c: q.c, d: q.d, ok, w: q.opts[i] }); rec().seen[q.id] = Date.now(); b.fx = { t: Date.now() };
    ding('anlbee', ok);
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
    b.phase = 'done';
    if (b.hall) hallDone(b);   /* a hall keeps its own record (c.anl.halls); the Mock Analogy Bee's best finish is its own */
    else { const p = rec().bee; p.played = (p.played || 0) + 1; p.best = Math.min(p.best || 99, b.place); if (b.place === 1) p.wins = (p.wins || 0) + 1; }
    /* a podium is a pass mark: one contest coin for first, second or third */
    const podium = b.place <= 3;
    if (podium) { try { addCoins('contest'); } catch (e) {} }
    b.coins = (W.earnedSoFar ? earnedSoFar() : b.e0) - b.e0;
    try { if (W.logActivity) logActivity('anlbee', 'Mock Analogy Bee', { done: b.log.length, right: b.log.filter((x) => x.ok).length, coins: b.coins }, []); } catch (e) {}
    b.doneAt = Date.now(); fanfare('anlbee', podium);
    try { if (podium) burstConfetti(b.place === 1 ? 130 : 70); } catch (e) {}
    store(); render(); }
  /* THE BEE ON THE STAGE (P3.1): the lobby, every round and the finish stand on SGUI.stage over the observatory plate
     ('hive'). The field rides the play area (in one row of small faces while a round is on, so the question and the
     answers keep the room), the answers are the controls, and the way back to the Analogies tab sits in the HUD. */
  const ordOf = (n) => n + (n % 100 > 10 && n % 100 < 14 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' })[n % 10] || 'th');
  function beeView() { if (!D()) return ''; css(); const b = B() || (state.anlBee = { phase: 'lobby' }); const c = kid();
    if (!kit()) return needKit('anlbee');
    const me = c && W.SB_AVATAR ? SB_AVATAR(c.avatar || 'bizzy', 46) : '';
    const face = (id) => { try { return W.SB_AVATAR ? SB_AVATAR(id, 46) : ''; } catch (e) { return ''; } };
    /* a hall is this same bee, seated and titled for its region, its way back the region's board (THE REASONING ROUNDS) */
    const H = hallsOn() ? regionById(hallIdOf(b)) : null;
    const back = H ? backIn('openAnalogies', H.id, 'Back to ' + H.name) : backIn('openAnalogies', '', 'Back to Analogies');
    const title = H ? ttl(H.name + ' Hall', HALLS[H.id].short) : ttl('Mock Analogy Bee', 'Analogy Bee');
    const stage = (o) => stageAnl(Object.assign({ plate: PLATE.bee, label: H ? H.name + ' Hall' : 'Mock Analogy Bee', cls: 'anl-beest' + (H ? ' anl-hallst' : '') }, o), b.phase !== 'lobby');
    if (b.phase === 'lobby') { const seats = H ? hallSeats(H.id) : castFor();
      if (!seats.length) { try { if (W.SB_LAZY) SB_LAZY.need('mockbee', () => { if (state.nav === 'anlbee') render(); }); } catch (e) {} }
      const cast = seats.map(([id, name, sk, rid]) => (H && rid === THEO) ? `<li class="anl-rival head">${face(id)}<span>${esc(name)}</span><small class="anl-headl">Headliner</small></li>` : `<li class="anl-rival">${face(id)}<span>${esc(name)}</span></li>`).join('');
      const p = rec().bee, hp = H ? hallGet(H.id) : null;
      return stage({ hud: { left: back + stat('spellers', String(seats.length + 1), 'users'), center: title, right: stat('best finish', H ? (hp.best ? ordOf(hp.best) : '–') : p.played ? ordOf(p.best) : '–', 'trophy') + pad },
        play: `<div class="anl-card sg-panel anl-center anl-lobby"><ul class="anl-field">${cast}<li class="anl-rival me">${me}<span>You</span></li></ul>
        <p class="anl-big">Every speller gets one analogy a round. Round one is a warm-up: nobody sits down. After that, miss the link and you sit down. The last speller standing wins.</p>
        <p class="anl-note">The analogies climb a level every two rounds.${!H && p.played && p.wins ? ' ' + p.wins + ' won so far.' : ''}</p></div>`,
        controls: `<div class="anl-btns center">${!H && W.SB_LEVEL && SB_LEVEL.chip ? SB_LEVEL.chip('mockAnalogy', 'Mock Analogy Bee') : ''}<button class="anl-btn main" data-act="anlBee" data-arg="start">${ic('trophy', 16)} Take the stage <span class="anl-kb">Enter</span></button></div>` }); }
    const standing = b.field.filter((r) => !r.out || r.out >= b.round).length + (b.me.out && b.me.out < b.round ? 0 : 1);
    const field = `<ul class="anl-field run${b.phase === 'result' ? ' res' : ''}" aria-label="The field">${b.field.map((r) => { const call = (b.calls || []).find((x) => x.r === r); const st = r.out && r.out < b.round ? ' sat' : (b.phase === 'result' && call) ? (call.right ? ' right' : (b.round > 1 ? ' sat now' : ' miss')) : '';
      return `<li class="anl-rival${st}">${face(r.id)}<span>${esc(r.name)}</span></li>`; }).join('')}<li class="anl-rival me${b.me.out && b.me.out < b.round ? ' sat' : ''}">${me}<span>You</span></li></ul>`;
    if (b.phase === 'done') {
      const words = b.log.map((x) => `<li class="${x.ok ? 'ok' : 'no'}">${x.ok ? ic('check', 13) : ic('close', 13)} ${esc(x.c)} → <b>${esc(x.d)}</b>${x.ok ? '' : ` <span class="anl-was">(you chose ${esc(x.w)})</span>`}</li>`).join('');
      const big = b.place === 1 ? 'Champion!' : 'You finished ' + ordOf(b.place);
      const line = b.place === 1 ? 'Last speller standing.' : b.place <= 3 ? 'On the podium.' : 'Every link you missed is one you will see coming next time.';
      return stage({ hud: { left: back + stat('place', ordOf(b.place), 'trophy'), center: title, right: stat('coins', String(b.coins || 0), 'coin') + pad },
        play: `<div class="anl-card sg-panel anl-center anl-done${fresh(b.doneAt, 900) ? ' sg-fx-done' : ''}" data-live-prompt="${escA(big + ' ' + line)}">${field}<div class="anl-db">${esc(big)}</div><p class="anl-big">${esc(line)}</p>${b.coins ? `<p class="anl-note anl-pay">${ic('coin', 14)} +${b.coins} coins</p>` : ''}
        <ul class="anl-log">${words}</ul></div>`,
        controls: H ? `<div class="anl-btns center"><button class="anl-btn" data-act="anlBee" data-arg="start">${ic('retry', 16)} Again</button><button class="anl-btn main" data-act="anl" data-arg="note:${escA(H.id)}">${nbIcon(16)} Theo's notebook <span class="anl-kb">Enter</span></button></div>`
          : `<div class="anl-btns center"><button class="anl-btn" data-act="openAnalogies">${ic('arrowLeft', 16)} Analogies</button><button class="anl-btn main" data-act="anlBee" data-arg="start">${ic('retry', 16)} New bee <span class="anl-kb">Enter</span></button></div>` }); }
    const q = b.q; if (!q) return '';
    const opts = q.opts.map((o, i) => { const st = b.picked == null ? '' : i === q.ans ? ' ok' : i === b.picked ? ' no' : ' dim';
      return `<button type="button" class="anl-opt${st}${fxOpt(b, i, q.ans, b.picked)}" data-act="anlBee" data-arg="pick:${i}"${b.picked != null ? ' disabled' : ''}><span class="anl-k">${KEYS[i]}</span><span class="anl-ow">${esc(o)}</span></button>`; }).join('');
    let res = '';
    if (b.phase === 'result') { const ok = b.picked === q.ans; const sat = (b.calls || []).filter((x) => !x.right && b.round > 1).map((x) => x.r.name);
      res = `<div class="${ok ? 'anl-yes' : 'anl-miss'}" role="status"><p><b>${ok ? 'Right!' : 'The answer is ' + esc(q.d) + '.'}</b> ${esc(linkLine(q.rel, q.c, q.d))}</p>${ok ? '' : `<p class="anl-why">${esc(tempted(q, q.opts[b.picked]))}</p>`}
        <p class="anl-why">${b.again ? 'Everybody missed, so nobody sits down: the round runs again.' : b.round === 1 ? 'Warm-up round: nobody sits down.' : sat.length ? esc(sat.join(', ')) + (sat.length === 1 ? ' sits' : ' sit') + ' down.' : 'Every rival got theirs.'}</p>
        <button class="anl-btn main" data-act="anlBee" data-arg="next">${b.me.out ? 'See how it ends' : 'Next round'} <span class="anl-kb">Enter</span></button></div>`; }
    const tight = q.opts.length >= 5 && q.opts.every((o) => String(o).length <= 11) ? ' tight' : '';
    return stage({ hud: { left: back + stat('round', String(b.round), 'flag'), center: title, right: stat('standing', String(standing), 'users') + pad },
      play: `${field}<div class="anl-card sg-panel anl-qcard${b.phase === 'result' ? ' anl-held' : ''}${fresh(b.qAt) ? ' sg-fx-in' : ''}">
        <div class="anl-q" data-live-prompt="${escA('Round ' + b.round + '. ' + q.a + ' is to ' + q.b + ' as ' + q.c + ' is to what?')}"><span>${esc(q.a.toUpperCase())}</span><i>:</i><span>${esc(q.b.toUpperCase())}</span><i>::</i><span>${esc(q.c.toUpperCase())}</span><i>:</i><span class="anl-blank">${b.picked != null ? esc(q.d.toUpperCase()) : '?'}</span></div>
        <div class="anl-askrow"><p class="anl-ask">Your turn. Which word completes the analogy?</p><button type="button" class="anl-hear" data-act="anlBee" data-arg="hear" aria-label="Hear it">${ic('volume', 17)}<span class="anl-hlab">Hear it</span></button></div>${res}</div>`,
      controls: `<div class="anl-opts n${q.opts.length}${tight}" role="group" aria-label="Answers">${opts}</div>` }); }
  function beeAct(arg) { arg = String(arg || ''); const b = B();
    if (arg === 'start') { beeStart(); return; }
    if (arg.indexOf('pick:') === 0) { beePick(arg.slice(5)); return; }
    if (arg === 'next') { beeNext(); return; }
    if (arg === 'hear') { if (b && b.q) try { say(b.q.a + ' is to ' + b.q.b + ', as ' + b.q.c + ' is to what?'); } catch (e) {} return; } }
  function beeKey(e) { const b = B(); if (!b) return; const k = e.key;
    if (k === 'Enter') { if (b.phase === 'done' && b.hall && hallsOn()) { e.preventDefault(); openNote(b.hall); } else if (b.phase === 'lobby' || b.phase === 'done') { e.preventDefault(); beeStart(); } else if (b.phase === 'result') { e.preventDefault(); beeNext(); } return; }
    if (b.phase !== 'turn') return; const n = /^[1-5]$/.test(k) ? +k - 1 : /^[a-eA-E]$/.test(k) ? KEYS.indexOf(k.toUpperCase()) : -1; if (n < 0) return; e.preventDefault(); beePick(n); }
  const beeBest = () => { const p = rec().bee || {}; if (!p.played || !p.best) return ''; const n = p.best;
    return 'Best finish: ' + n + (n % 100 > 10 && n % 100 < 14 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' })[n % 10] || 'th') + (p.wins ? ' · ' + p.wins + ' won' : ''); };

  /* ================================================================== THE REASONING ROUNDS (the Bee Circuit §11) */
  /* circuit/BEE-CIRCUIT.md §11, build step 9: "Four Mock Analogy Bee halls: Twin Ponds, Orchard Hill, Workshop Valley and
     Bridge Peaks. Same cast. Theo headlines, and Rafi joins at Workshop Valley. Theo's notebook: one page per round on how
     he finds the bridge between two words. It doubles as the lesson recap. Opens only after the analogy content passes
     the three review rounds." What that is here, and the rules it keeps (tests/analogy-halls.cjs, analogy-halls-stage.cjs):
       · A HALL PIN on each region board (a lectern-and-bell medallion, drawn here, ≥ 44px, off the road and clear of every
         stop) and a hall bar under the board. OVERLAY ONLY (Circuit L1/L2): no stop, check, unlock or mastery reads a
         hall, and a child who never opens one has exactly the tab as it was. A hall opens with its region's board.
       · A HALL IS THE MOCK ANALOGY BEE (state.anlBee with `hall`): the same lobby, rounds, sit-downs, hash-decided rivals
         and finish, at the region's level (beePool/hallLevel), and it PAYS AS THE BEE PAYS — beeFinish's one podium
         `contest` coin, nothing for finishing, nothing per answer. Its record is the child's own `c.anl.halls[<region>]`
         = {n, done, best, last, at}, made lazily the first time a hall starts (no store step; ?demo keeps it in memory).
         Its seeds count on the hall's own `n`, so playing a hall never moves the tab's own seeds (rec().n).
       · THE CAST is Mock Bee's (MOCKBEE.rivals — names, and faces with the child's own face swapped for the speller's
         stand-in): the seven nearest the region's level, as the bee seats them, then Theo always seated (he headlines),
         Rafi seated from Workshop Valley on and not before ("joins"). A missing speller takes the seat at the edge of the
         window nearest him; a seat Rafi leaves goes to the next speller past the window.
       · THEO'S NOTEBOOK: a page a hall, kept once that hall has been played (the done screen's main button, Enter; then
         the board's "Theo's notebook"). A page is a FIXED FRAME — "Theo's notebook — <region>" and the four labels the
         Learn steps already use — around the region's own lessons QUOTED VERBATIM from analogy-data.js (the reviewed
         text): each lesson's title, idea, how to spot it and the trap, and its bridge sentence filled with the lesson's
         own first stem pair (the Learn step's "Say the link"). Nothing on a page is written for it. Read aloud on a tap,
         sentence by sentence, by the device voice — no recording.
       · THE GATE: everything here asks anlOpen() (app3, SB_ANL_OPEN) — the same gate as the tab. */
  /* `at` is the pin's place in the board's 1600×900 space, picked by eye on each painting (a cottage row, the bee-hives,
     the water-wheel, the rope bridge) and measured clear of every stop (tests/analogy-halls-stage.cjs: no overlap at 390
     or 1280, every control a 44px target) — repaint a map, re-place its hall */
  const HALLS = { ponds: { at: [530, 775], short: 'Ponds Hall' }, orchard: { at: [1360, 440], short: 'Orchard Hall' },
    workshop: { at: [1080, 400], short: 'Workshop Hall' }, peaks: { at: [800, 200], short: 'Peaks Hall' } };
  const THEO = 'scopey', RAFI = 'beaker', RAFI_FROM = 2;   /* Mock Bee's ids for Theo and Rafi; Rafi from the third region */
  const NOTE_LABELS = { idea: 'The idea', bridge: 'Say the link', spot: 'How to spot it', trap: 'Watch out' };
  const gateOpen = () => { try { return typeof W.SB_ANL_OPEN === 'function' ? !!W.SB_ANL_OPEN() : false; } catch (e) { return false; } };
  const hallsOn = () => W.SB_ANL_HALLS !== false && gateOpen();
  const hallIdOf = (b) => (b && b.hall && HALLS[b.hall] && regionById(b.hall) && hallsOn()) ? b.hall : null;
  function hallLevel(id) { const r = regionById(id); const lv = r ? r.lv[0] : 1; return Object.keys(LVL_LO).find((k) => LVL_LO[k] === lv) || 'auto'; }
  /* reads never create the record; only a hall that starts does */
  const hallGet = (id) => ((rec().halls || {})[id]) || {};
  function hallRec(id) { const r = rec(); const H = r.halls || (r.halls = {}); return H[id] || (H[id] = {}); }
  const noteKept = (id) => !!HALLS[id] && hallsOn() && !!hallGet(id).done;
  /* the seven seats of a hall: [face, name, chance, rival id], Theo first */
  function hallSeats(id) { const R = regions(), i = R.findIndex((r) => r.id === id); if (i < 0) return [];
    const c = kid(), mine = (c && c.avatar) || 'bizzy';
    const all = (W.MOCKBEE && typeof MOCKBEE.rivals === 'function') ? MOCKBEE.rivals(mine).slice().sort((a, b) => a.lvl - b.lvl) : [];
    if (!all.length) return [];
    const from = Math.max(0, Math.min(all.length - SEATS, Math.round((R[i].lv[0] - 1) / 2)));
    const need = i >= RAFI_FROM ? [THEO, RAFI] : [THEO], bar = i >= RAFI_FROM ? [] : [RAFI];
    const seats = all.slice(from, from + SEATS).filter((r) => bar.indexOf(r.id) < 0);
    need.forEach((nid) => { const r = all.find((x) => x.id === nid); if (!r || seats.indexOf(r) >= 0) return;
      if (seats.length >= SEATS) { const edge = (r.lvl < seats[0].lvl ? seats : seats.slice().reverse()).find((x) => need.indexOf(x.id) < 0); seats.splice(seats.indexOf(edge), 1); }
      seats.push(r); });
    for (let k = 1; seats.length < SEATS && k < all.length; k++) [all[from + SEATS - 1 + k], all[from - k]].forEach((r) => { if (r && seats.length < SEATS && bar.indexOf(r.id) < 0 && seats.indexOf(r) < 0) seats.push(r); });
    seats.sort((a, b) => (a.id === THEO ? -1 : b.id === THEO ? 1 : a.lvl - b.lvl));
    return seats.map((r) => [r.face, r.name, skillOf(r), r.id]); }
  function hallStart(id) { const R = regionById(id); const hr = hallRec(id); hr.n = (hr.n || 0) + 1;
    const field = hallSeats(id).map(([fid, name, sk, rid]) => ({ id: fid, rid, name, sk, out: 0 }));
    state.anlBee = { phase: 'turn', hall: id, seed: day() + '|hall|' + id + '|' + hr.n, lo: R.lv[0], round: 1, field, me: { out: 0 }, used: {}, log: [], e0: (W.earnedSoFar ? earnedSoFar() : 0) };
    store(); beeAsk(); }
  function hallDone(b) { const h = hallRec(b.hall); h.done = (h.done || 0) + 1; h.best = Math.min(h.best || 99, b.place); h.last = b.place; h.at = day(); }
  /* the board's door: the hall's lobby (the bee's lobby, seated for the region); a stale tap behind the gate lands on Home */
  function openHall(id) { if (!gateOpen()) { try { app.setNav('home'); } catch (e) {} return; }
    const R = regions(), i = R.findIndex((r) => r.id === id); if (i < 0 || !HALLS[id] || !hallsOn()) return;
    if (!regionOpen(i)) { try { flash('Pass the level check before it to open ' + R[i].name); } catch (e) {} return; }
    stopClock(); const s = state.anl; if (s) { if (s.run && s.run.phase !== 'done') s.run.phase = 'left'; s.run = null; s.v = 'map'; s.reg = id; }
    state.anlBee = { phase: 'lobby', hall: id }; state.nav = 'anlbee'; state.screen = 'app'; state.game = null;
    try { if (!W.MOCKBEE && W.SB_LAZY) SB_LAZY.need('mockbee', () => { if (state.nav === 'anlbee') render(); }); } catch (e) {}
    try { render(); window.scrollTo(0, 0); } catch (e) {} }
  /* the region on the board, with its first open stop not yet passed picked (what tapping its region tab does) */
  function aimAt(id) { const s = S(), R = regions(), i = R.findIndex((r) => r.id === id); if (i < 0) return; const r = R[i];
    const j = r.stops.findIndex((st, x) => stopOpen(r, x) && !passed(st.id)); s.reg = id; s.stop = j >= 0 ? r.stops[j].id : r.id + '-check'; }
  function openNote(id) { if (!noteKept(id)) return; stopClock();
    const s = S(); if (s.run && s.run.phase !== 'done') s.run.phase = 'left'; s.run = null; aimAt(id); s.v = 'note';
    state.nav = 'analogy'; state.screen = 'app'; state.game = null; try { render(); window.scrollTo(0, 0); } catch (e) {} }
  /* drawn here, no emoji: a bell over a lectern (the hall), a spiral notebook (Theo's) */
  const hallSVG = (size) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" focusable="false"><path d="M12 2.4c-2.3 0-3.7 1.7-3.7 3.9v2.5l-1.3 1.7h10l-1.3-1.7V6.3c0-2.2-1.4-3.9-3.7-3.9z" fill="currentColor"/><circle cx="12" cy="11.6" r="1.1" fill="currentColor"/><path d="M5 13.8h14l-2.2 3H7.2z" fill="currentColor"/><path d="M12 16.8v4.4M8.6 21.4h6.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  const nbIcon = (size) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="6" y="3" width="13" height="18" rx="2"/><path d="M4 7h3M4 12h3M4 17h3M10 8h6M10 12h6M10 16h4"/></svg>`;
  function hallPin(reg, i) { if (!HALLS[reg.id] || !hallsOn() || !regionOpen(i)) return ''; const [x, y] = HALLS[reg.id].at;
    return `<button class="anl-hall${hallGet(reg.id).done ? ' done' : ''}" style="left:${(x / 16).toFixed(2)}%;top:${(y / 9).toFixed(2)}%" data-act="anl" data-arg="hall:${escA(reg.id)}" aria-label="${escA(reg.name + ' Hall: Mock Analogy Bee')}">
      <span class="anl-hmed">${hallSVG(26)}</span><span class="anl-lab">Mock Analogy Bee</span></button>`; }
  function hallBar(reg, i) { if (!HALLS[reg.id] || !hallsOn() || !regionOpen(i)) return ''; const h = hallGet(reg.id);
    return `<div class="anl-hallbar"><button class="anl-hallgo" data-act="anl" data-arg="hall:${escA(reg.id)}"><span class="anl-hic">${hallSVG(20)}</span>
        <span class="anl-htx"><b>${esc(reg.name)} Hall</b><small>Mock Analogy Bee${h.best ? ' · Best finish: ' + ordOf(h.best) : ''}</small></span></button>
      ${noteKept(reg.id) ? `<button class="anl-btn anl-nbgo" data-act="anl" data-arg="note:${escA(reg.id)}">${nbIcon(18)} Theo's notebook</button>` : ''}</div>`; }
  /* ------------------------------------------------------------------ Theo's notebook: a fixed frame, the lessons' own words */
  function noteLessons(r) { const out = []; (r.stops || []).forEach((st) => { const L = lesson(st.lesson); if (L && out.indexOf(L) < 0) out.push(L); }); return out; }
  /* the lesson's bridge, filled with its own first stem pair — the sentence its Learn step says aloud */
  function noteLink(L) { const p = (L.stems || []).find((x) => x && x[0] && x[1]); return p ? bridge(L.bridge, p[0], p[1], relOf(L, p)) : ''; }
  const noteLines = (L) => [L.title, L.idea, noteLink(L), L.spot, L.trap].filter(Boolean);
  function theoFace() { try { if (!W.MOCKBEE || !W.SB_AVATAR) { if (W.SB_LAZY) SB_LAZY.need('mockbee', () => { if (state.nav === 'analogy' && S().v === 'note') render(); }); return ''; }
      const c = kid(), r = MOCKBEE.rivals((c && c.avatar) || 'bizzy').find((x) => x.id === THEO); return r ? `<span class="anl-nbface" aria-hidden="true">${SB_AVATAR(r.face, 40)}</span>` : ''; } catch (e) { return ''; } }
  function noteView() { const s = S(); const r = regionById(s.reg); if (!r || !noteKept(r.id)) { s.v = 'map'; return mapView(); }
    const kept = regions().filter((x) => noteKept(x.id));
    const tabs = kept.length > 1 ? `<div class="anl-nbtabs" role="group" aria-label="Pages">${kept.map((x) => `<button class="anl-rtab${x === r ? ' on' : ''}" data-act="anl" data-arg="note:${escA(x.id)}" aria-pressed="${x === r}"><span class="anl-rname">${esc(x.name)}</span></button>`).join('')}</div>` : '';
    const blocks = noteLessons(r).map((L) => { const p = (L.stems || []).find((x) => x && x[0] && x[1]);
      return `<section class="anl-nbl" data-lesson="${escA(L.id)}"><h3 class="anl-nbt"><span class="anl-cic">${lic(L.id, 20)}</span><span class="anl-nbtt">${esc(L.title)}</span>
          <button class="anl-say" data-act="anl" data-arg="noteSay:${escA(L.id)}" aria-label="Hear it">${ic('volume', 16)}</button></h3>
        ${p ? pairHTML(L, p) : ''}
        <dl class="anl-nbd"><dt>${NOTE_LABELS.idea}</dt><dd>${esc(L.idea)}</dd><dt>${NOTE_LABELS.bridge}</dt><dd>${esc(noteLink(L))}</dd>
          <dt>${NOTE_LABELS.spot}</dt><dd>${esc(L.spot)}</dd><dt>${NOTE_LABELS.trap}</dt><dd>${esc(L.trap)}</dd></dl></section>`; }).join('');
    return `<div class="anl-page">${head(esc("Theo's notebook — " + r.name), '', 'anl', r.name, theoFace() || nbIcon(22))}${tabs}
      <article class="anl-card anl-nb" aria-label="${escA("Theo's notebook — " + r.name)}">${blocks}</article></div>`; }
  /* read aloud on a tap, a sentence at a time (a long utterance is cut short by some device voices) */
  function noteSay(id) { const L = lesson(id); if (!L) return; const lines = [];
    noteLines(L).forEach((t) => String(t).split(/(?<=[.!?])\s+/).forEach((x) => { if (x.trim()) lines.push(x.trim()); }));
    try { const ss = W.speechSynthesis; if (ss && typeof W.utter === 'function') { ss.cancel(); const rt = 0.95 * ((state && state.voiceRate) || 1); lines.forEach((t) => ss.speak(utter(t, rt))); return; } } catch (e) {}
    try { say(lines.join(' ')); } catch (e) {} }

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
.anl-again{display:flex;align-items:center;justify-content:center;gap:6px;margin:0 0 8px;font-size:13px;font-weight:700}
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
/* ON THE ENGINE KIT'S STAGE (road to 4.5, P3.1/P3.2): the plate, the grain, the HUD and the bands are the kit's
   (saga2.css .sb-stage); these rules only seat the analogy parts on it. Panels stay translucent over the painting —
   a solid card would be the flat white the audit saw (T14). */
.anl-onstage{max-width:none}
.anl-kit .sg-st-region{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:safe center;gap:8px;overflow:auto;padding:2px}
.anl-kit .anl-card{width:min(760px,100%);margin:0;border-radius:20px;padding:clamp(12px,2.6vw,22px);color:var(--text);position:relative;flex:none}
.anl-kit .anl-card.sg-panel{background:var(--sg-grain),color-mix(in srgb,var(--paper,#fff) 84%,transparent)}
.anl-kit .anl-qcard,.anl-kit .anl-done,.anl-kit .anl-intro{text-align:center}
.anl-kit .anl-q{margin:2px 0}
.anl-askrow{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:4px}
.anl-kit .anl-ask{margin:0}
.anl-kit .anl-hear{margin:0;min-height:44px;min-width:44px;justify-content:center;background:color-mix(in srgb,var(--surface,#fff) 82%,transparent)}
.anl-tag{display:inline-flex;align-items:center;gap:5px;padding:3px 12px;border-radius:999px;background:color-mix(in srgb,var(--accent) 14%,transparent);color:var(--accent);font-weight:800;font-size:12px;margin-bottom:6px}
.anl-kit .anl-yes,.anl-kit .anl-miss{text-align:left;margin-top:10px}
.anl-kit .anl-held .anl-askrow,.anl-kit .anl-held .anl-tag{display:none}
.anl-kit .anl-held{padding-top:12px}
.anl-kit .sg-st-ctl>.anl-opts,.anl-kit .sg-st-ctl>.anl-btns{width:min(760px,100%)}
.anl-kit .anl-opt{background:color-mix(in srgb,var(--surface2,var(--surface,#fff)) 86%,transparent);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
.anl-kit .anl-opt.ok{background:color-mix(in srgb,#2E9E5B 22%,var(--surface,#fff))}.anl-kit .anl-opt.no{background:color-mix(in srgb,#D14343 18%,var(--surface,#fff))}
.anl-kit .anl-btns{margin-top:0;align-items:center}
.anl-kit .anl-btn:not(.main){background:color-mix(in srgb,var(--surface2,var(--surface,#fff)) 86%,transparent)}
.anl-kit .anl-log{text-align:left;max-width:560px;margin:10px auto 0}
.anl-kit .anl-intro .anl-cic{margin:0 auto 8px}
.anl-dh{font-family:var(--display);font-weight:800;font-size:18px}
.anl-db{font-family:var(--display);font-weight:900;font-size:clamp(28px,6vw,42px);color:var(--accent);line-height:1.1;margin:4px 0}
.anl-pay{justify-content:center;font-weight:800}
.anl-kit .anl-field{margin:0 0 8px}
.anl-kit .anl-field.run{margin:0;padding:6px 10px;border-radius:16px;background:color-mix(in srgb,var(--paper,#fff) 76%,transparent);flex:none}
.anl-kit .anl-field.run .anl-rival{width:54px;font-size:11px}
.anl-kit .anl-field.run .anl-rival svg,.anl-kit .anl-field.run .anl-rival img{width:36px;height:36px}
.anl-back{flex:none;position:relative;width:36px;height:36px;margin-right:2px;border-radius:50%;display:grid;place-items:center;background:var(--surface2,var(--surface,#fff));border:1px solid var(--line);color:var(--text)}
.anl-back::after{content:"";position:absolute;inset:-5px}
.anl-pad{display:none;flex:none;width:36px;height:1px}
.anl-ttl{display:inline-flex;align-items:center;gap:8px}.anl-ttl .anl-ts{display:none}
.anl-kit .anl-time.low{color:var(--bad,#D33)}
@media (max-width:640px){.anl-kit .sg-st-side .sg-st-stat{width:112px;min-width:0;justify-content:space-between}.anl-kit.anl-beest .sg-st-side .sg-st-stat{width:92px}.anl-kit .sg-st-side .sg-st-ic{display:none}.anl-pad{display:block}
  .anl-ttl:has(.anl-ts) .anl-tl{display:none}.anl-ttl .anl-ts{display:inline}.anl-hlab{display:none}.anl-kit .anl-hear{padding:0 10px}}
@media (max-width:560px){.anl-kit .anl-opts{gap:6px}.anl-kit .anl-opt{min-height:44px;padding:6px 12px;font-size:15px}.anl-kit .anl-opt.line{font-size:14px}
  .anl-kit .anl-opts.tight{grid-template-columns:repeat(2,minmax(0,1fr))}.anl-kit .anl-opts.tight .anl-opt:last-child{grid-column:1/-1}
  .anl-kit .anl-q{gap:5px}.anl-kit .anl-q span{padding:5px 10px}.anl-kit .anl-big{font-size:15px}
  .anl-kit .anl-held .anl-q{font-size:16px}.anl-kit .anl-held .anl-q span{padding:3px 8px}
  .anl-kit .anl-miss,.anl-kit .anl-yes{padding:9px 12px;font-size:14px}.anl-kit .anl-miss .anl-why{font-size:13px}.anl-kit .anl-miss .anl-btn{min-height:44px;margin-top:4px}
  .anl-kit .anl-field.run{flex-wrap:nowrap;gap:2px;padding:4px 6px}.anl-kit .anl-field.run .anl-rival{width:40px;font-size:10px}
  .anl-kit .anl-field.run .anl-rival span{max-width:40px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .anl-kit .anl-field.run .anl-rival svg,.anl-kit .anl-field.run .anl-rival img{width:30px;height:30px}
  .anl-kit .anl-field.run.res .anl-rival span{display:none}.anl-kit .anl-field.run.res .anl-rival svg,.anl-kit .anl-field.run.res .anl-rival img{width:28px;height:28px}
  .anl-kit .anl-lobby .anl-rival{width:56px}.anl-kit .anl-lobby .anl-rival svg,.anl-kit .anl-lobby .anl-rival img{width:40px;height:40px}}
/* THE REASONING ROUNDS: the hall pin on the board, the hall bar under it, the headliner's seat, Theo's notebook */
.anl-hall{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:3px;min-width:52px;min-height:52px;background:none;border:0;padding:0;cursor:pointer;z-index:2;color:inherit}
.anl-hmed{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;background:#2B2350;color:#FFD98A;border:3px solid #FFD98A;box-shadow:0 3px 10px rgba(0,0,0,.32)}
.anl-hall.done .anl-hmed{background:#5B3FB0}
.anl-hall:focus-visible .anl-hmed{outline:4px solid #3B6FE0;outline-offset:2px}
@container (max-width:560px){.anl-hmed{width:48px;height:48px}}
.anl-hallbar{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.anl-hallgo{flex:1 1 230px;min-height:52px;display:flex;align-items:center;gap:10px;padding:7px 14px 7px 8px;border-radius:16px;border:0;background:linear-gradient(140deg,#20385E,#16233F);color:#FFFFFF;text-align:left}
.anl-hallgo:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
.anl-hic{flex:none;width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:#2B2350;color:#FFD98A;border:2px solid #FFD98A}
.anl-htx{display:grid;gap:1px;min-width:0}.anl-htx b{font-family:var(--display);font-weight:900;font-size:16px;line-height:1.2}.anl-htx small{font-size:12px;color:#FFE7B0}
.anl-hallbar .anl-nbgo{min-height:52px;flex:0 1 auto}
@media (max-width:480px){.anl-hallbar .anl-nbgo{flex:1 1 100%;justify-content:center}}
.anl-rival.head span{color:var(--accent)}
.anl-headl{font-size:10px;font-weight:800;line-height:1;padding:2px 6px;border-radius:999px;background:#2B2350;color:#FFD98A}
.anl-nbtabs{display:flex;flex-wrap:wrap;gap:8px;margin:4px 0 4px}.anl-nbtabs .anl-rtab{min-height:44px;flex:1 1 140px}
.anl-nb{padding:6px 18px 14px 22px;border-left:5px solid color-mix(in srgb,#D14343 34%,var(--line));
  background:repeating-linear-gradient(to bottom,transparent 0 33px,color-mix(in srgb,#3B82F6 13%,transparent) 33px 34px),var(--paper,var(--bg2))}
.anl-nbface{display:inline-flex;width:40px;height:40px}.anl-nbface svg,.anl-nbface img{width:40px;height:40px}
.anl-nbl{display:grid;gap:10px;padding:14px 0 6px}.anl-nbl+.anl-nbl{border-top:1px dashed var(--line)}
.anl-nbt{display:flex;align-items:center;gap:10px;font-family:var(--display);font-size:19px;margin:0}
.anl-nbt .anl-cic{width:38px;height:38px;border-radius:12px}.anl-nbt .anl-say{margin-left:auto;flex:none}
.anl-nbd{margin:0;display:grid;gap:3px}
.anl-nbd dt{font-family:var(--display);font-size:13px;font-weight:800;color:var(--accent)}
.anl-nbd dd{margin:0 0 8px;font-size:16px;line-height:1.55;max-width:68ch}
@media (max-width:480px){.anl-nb{padding:4px 12px 10px 14px}.anl-nbd dd{font-size:15px}}
`; document.head.appendChild(st); }

  /* ------------------------------------------------------------------ the door */
  const API = { open, openRoute, view, beeView, openBee, stop, route, act, beeAct, beeBest, toolView, openTool, toolRoute, toolAct, here: () => { const h = here(); return h ? { region: h.r.id, name: h.r.name } : null; },
    _question: question, _bridge: bridgeQ, _linkLine: linkLine, _safeIds: safeIds, _bandIds: bandIds, _beePool: beePool, _itemBand: itemBand,
    _hallSeats: hallSeats, _halls: HALLS, _noteLines: noteLines };
  W.SB_ANL = API;
  try { Object.assign(app, { anl: (a) => act(a), anlBee: (a) => beeAct(a), anlTool: (a) => toolAct(a), anlToolType: (v) => toolType(v), anlToolKey: (e) => toolKey(e) }); } catch (e) {}
  try { if (state.nav === 'analogy' || state.nav === 'anlbee' || state.nav === 'anltool') render(); } catch (e) {}
})();
