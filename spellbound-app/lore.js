/* lore.js — WORD LORE and HIVE MIND, the two trivia hubs (games spec §4.3, §4.4, 4 Oct 2026).

   Owner decision 3: Bee Trivia splits in two, with distinct names and distinct art — word trivia
   (Word Lore) and general knowledge (Hive Mind). Bizzillionaire is Word Lore's Ladder; Word Quiz's
   meaning, origin and idiom rounds are Word Lore's Meanings, Origins and Idioms & Similes.

   Lazy: boot-lazy's `quizhubs` group (this file + saga2 for the shared stage kit), opened at the
   door by app.openLore / app.openHive (app3.js). Routes #/lore[/<mode>] and #/hive[/<mode>]
   (family-shell.js). Hub names come from SB_HUB_NAMES and are never typed into copy.

   The rules every mode keeps (spec §1.5–§1.7, §6):
     · ONE question shape (q.prompt, q.opts, q.ans, q.fact): keys 1–4 pick, Enter continues;
     · a miss HOLDS with the answer and its "Did you know?" (SGUI.missQ when the kit is in) until
       Continue — a clock is held while it is up;
     · pay is `answer` 1 per right, and only above chance: nothing until a round reaches 6 right
       (and 60% in a timed run), then every right counts; Origins pays per typed word; the
       Ladder per rung from the fourth. Two-option items never pay and never count;
     · SB_LEVEL.after(key, pct) once at the end of every round, key 'lore/<mode>' / 'hive/<mode>';
     · no run counts anywhere (Bee Trivia's streak flash is gone); the card shows a best, not a tally. */
(function () {
  'use strict';
  const W = window;
  /* the defaults the family names would have if SB_HUB_NAMES were missing — never shown when it is set */
  const DEF_NAME = { lore: 'Word Lore', hive: 'Hive Mind' };
  const hubName = (h) => (W.SB_HUB_NAMES && W.SB_HUB_NAMES[h]) || DEF_NAME[h];
  const T = () => (W.SB_TRIVIA || { themes: [], questions: [] });

  /* ------------------------------------------------------------------ the modes */
  const MODES = {
    lore: [
      { id: 'meanings', title: 'Meanings', ic: 'book', promise: () => 'Word to meaning, and back again.' },
      { id: 'roots', title: 'Roots', ic: 'sprout', promise: () => 'Roots, and the people in words.' },
      { id: 'origins', title: 'Origins', ic: 'compass', promise: () => 'Name its language, then spell it.' },
      { id: 'idioms', title: 'Idioms & Similes', ic: 'bulb', promise: () => { const n = cnt('idioms'); return (n ? n + ' sayings' : 'Sayings') + ' and similes.'; } },
      { id: 'ladder', title: 'Ladder', ic: 'steps', promise: () => 'Twelve rungs, three lifelines.' },
      { id: 'squares', title: 'Squares', ic: 'grid', promise: () => 'A 3×3 board of word themes.' },
      { id: 'clock', title: 'Against the Clock', ic: 'timer', promise: () => 'Sixty seconds of word questions.' }],
    hive: [
      { id: 'classic', title: 'Classic', art: 'space', promise: () => 'Ten questions, and a fact with every answer.' },
      { id: 'squares', title: 'Squares', art: 'animals', promise: () => 'Nine themes on a 3×3 board, line by line.' },
      { id: 'clock', title: 'Against the Clock', art: 'science', promise: () => 'Sixty seconds of general knowledge.' }] };
  const modeOf = (h, id) => (MODES[h] || []).find((m) => m.id === id) || null;
  const cnt = (k) => { try { return W.countTxt ? countTxt(k) : ''; } catch (e) { return ''; } };

  /* Bee Trivia's word themes are Word Lore's; every other theme is general knowledge (Hive Mind). */
  const WORD_TH = { words: 1, eponyms: 1, wroots: 1, wbreak: 1, wmeaning: 1, wstories: 1 };
  const ROOT_TH = ['wroots', 'wbreak', 'wstories', 'eponyms'];
  const generalThemes = () => T().themes.filter((t) => !WORD_TH[t.id]).map((t) => t.id);
  const themeLabel = (id) => { const t = T().themes.find((x) => x.id === id); return t ? t.label : id; };
  /* Word Lore's Squares and Clock draw from these word themes (meanings and sayings are built here) */
  const LORE_SQ = [['meanings', 'Meanings'], ['wroots', 'Roots'], ['wbreak', 'Word parts'], ['wstories', 'Word stories'],
    ['eponyms', 'Named after'], ['words', 'Word wizardry'], ['idioms', 'Idioms'], ['similes', 'Similes']];

  /* ------------------------------------------------------------------ per child */
  function rec(h) { const c = active(); const k = h === 'hive' ? 'qzHive' : 'qzLore';
    const r = c[k] || (c[k] = {}); r.best = r.best || {}; r.seen = r.seen || {}; return r; }
  function seenIds() { const c = active(); return new Set(c.qzSeen || []); }
  function markSeen(ids) { try { const c = active(); c.qzSeen = (c.qzSeen || []).concat(ids.filter(Boolean)); if (c.qzSeen.length > 1500) c.qzSeen = c.qzSeen.slice(-1100); } catch (e) {} }
  /* bests live in the household's SB_BESTS under the ledger's keys (lore/<mode>, hive/<mode>; store step
     v11 carried Bee Trivia's, Word Quiz's and the clock's there) — {right, of}; of is null on the clock */
  function bestOf(h, m) { try { if (W.SB_BESTS) { const b = SB_BESTS.get(lkey(h, m)); return b ? { r: b.right, n: b.of } : null; } } catch (e) {} const b = rec(h).best[m]; return b || null; }
  function bestTxt(h, m) { const b = bestOf(h, m); if (!b) return '';
    if (m === 'clock' || !b.n) return 'Best: ' + b.r + ' right';
    if (m === 'ladder') return 'Best: rung ' + b.r;
    return 'Best: ' + b.r + '/' + b.n; }
  /* The Play card's line: the hub's best MODE, never a run count ("Best: 8/10 · Roots"). */
  /* the Play card's line is app3's (playCardBest → SB_BESTS.top, names from SB_HUB_MODES) — the same record */
  const cardBest = (h) => { try { const t = W.SB_BESTS && SB_BESTS.top(h); if (!t) return ''; const m = modeOf(h, t.mode);
      return 'Best ' + (t.best.of ? t.best.right + '/' + t.best.of : t.best.right) + ' · ' + (m ? m.title : t.mode); } catch (e) { return ''; } };

  /* ------------------------------------------------------------------ levels (SB_LEVEL, g-found) */
  const LV = () => W.SB_LEVEL || null;
  const lkey = (h, m) => h + '/' + m;
  function levelOf(h, m) { try { return LV() ? LV().get(lkey(h, m)) : 'auto'; } catch (e) { return 'auto'; } }
  function chip(h, m) { try { return LV() && LV().chip ? LV().chip(lkey(h, m), m && modeOf(h, m) ? modeOf(h, m).title : '') : ''; } catch (e) { return ''; } }
  const LVL_NAME = { auto: 'Auto', easy: 'Easy', medium: 'Medium', hard: 'Hard', champ: 'Champ' };
  /* trivia shard level 1–5 for this mode's level: Auto is the trivia band (ttBand); the others step from it */
  function trivLv(h, m) { let b = 3; try { b = W.ttBand ? ttBand(active()) : 3; } catch (e) {}
    const L = levelOf(h, m);
    return L === 'easy' ? Math.max(1, b - 1) : L === 'hard' ? Math.min(5, b + 1) : L === 'champ' ? Math.min(5, b + 2) : b; }

  /* ------------------------------------------------------------------ words, through the one door */
  const kidOK = (w) => { try { return W.kidSafe ? !!kidSafe(w) : true; } catch (e) { return true; } };
  /* nextWords (g-found) is the only door to the corpus; until it lands, gameWordsD is the legacy door.
     The mode's own level drives the pick, the way the arcade copies its per-game level into gameDiff. */
  /* nextWords (purpose 'lore', the mode's level key) is the one door to the corpus. pool() reads the window
     without serving anything; draw() SERVES — it logs each word into the 150-word no-repeat window — so
     only the words a round actually asks go through it. gameWordsD is the legacy door if it is missing. */
  function legacy(h, m, f) { const c = active(); const keep = c.gameDiff; c.gameDiff = levelOf(h, m) || 'auto';
    try { return f(); } catch (e) { return []; } finally { c.gameDiff = keep; } }
  function pool(h, m, extra) { const o = Object.assign({ purpose: 'lore', key: lkey(h, m) }, extra || {});
    try { if (W.nextWords && nextWords.pool) return nextWords.pool(active(), o).filter((w) => w && w.w); } catch (e) {}
    return legacy(h, m, () => gameWordsD().filter((w) => w && w.w && w.o && w.d && kidOK(w) && (!o.filter || o.filter(w)))); }
  function draw(h, m, n, extra) { const o = Object.assign({ purpose: 'lore', key: lkey(h, m) }, extra || {});
    try { if (W.nextWords) return nextWords(active(), n, o).filter((w) => w && w.w); } catch (e) {}
    return legacy(h, m, () => { const p = pool(h, m, extra); return W.pickFresh ? pickFresh(p, n) : sample(p, n); }); }
  const words = (h, m) => pool(h, m);   // the whole window, unserved (distractors, the tests)
  let _cl = null;
  function clusterOf(id) { if (!_cl) { _cl = {}; (((W.SB_THEMES || {}).themes) || []).forEach((t) => { _cl[t.id] = t.cluster; }); } return _cl[id]; }
  /* a word's SUBJECT themes — its origin and eponym shelves are not a subject */
  const topical = (w) => (w.t || []).filter((id) => { const k = clusterOf(id); return k && k !== 'origins' && k !== 'named'; });
  const posOf = (w) => String(w.ps || '').replace(/^plural\s+/, '').trim();
  const clip = (s, n) => { s = String(s || '').trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; };
  const maskOf = (t, w) => { try { return W.maskTxt ? maskTxt(t, w) : t; } catch (e) { return t; } };

  /* Distractors for a meaning question: the SAME part of speech always, and the same subject theme
     wherever the pool has one — then the same cluster — never "rubber, tons, deck" for territory. */
  /* the window indexed by part of speech + subject theme, and part of speech + cluster */
  function peerIndex(P) { const ix = {}; const add = (k, w) => { (ix[k] = ix[k] || []).push(w); };
    P.forEach((w) => { const ps = posOf(w); if (!ps || !w.d || w.d.length <= 4) return; const T = topical(w);
      T.forEach((t) => add(ps + '|' + t, w)); new Set(T.map(clusterOf)).forEach((k) => add(ps + '|cl:' + k, w)); });
    return ix; }
  function meaningPeers(w, pool, n, ix) { const P = posOf(w); if (!P || !w.d) return null;
    const mine = new Set(topical(w)), myCl = new Set([...mine].map(clusterOf));
    if (ix) { const seen = new Set(); const near = [];
      [...mine].map((t) => P + '|' + t).concat([...myCl].map((k) => P + '|cl:' + k)).forEach((k) => (ix[k] || []).forEach((x) => { if (!seen.has(x)) { seen.add(x); near.push(x); } }));
      pool = near; }
    const syn = new Set((((W.SB_SYN || {})[w.w]) || []).map((s) => String(s).toLowerCase()));
    const tier = (x) => { const t = topical(x); return t.some((id) => mine.has(id)) ? 0 : t.some((id) => myCl.has(clusterOf(id))) ? 1 : 2; };
    const cands = pool.filter((x) => x && x.w && x !== w && nkey(x.w) !== nkey(w.w) && posOf(x) === P && x.d && x.d.length > 4
      && nkey(x.d) !== nkey(w.d) && !syn.has(nkey(x.w)) && !String(x.d).toLowerCase().includes(nkey(w.w)))
      .map((x) => ({ x, t: tier(x), dy: Math.abs((x.y || 3) - (w.y || 3)) }))
      .filter((o) => o.t < 2 || !mine.size);
    cands.sort((a, b) => a.t - b.t || a.dy - b.dy);
    const out = [], seenD = new Set([nkey(maskOf(w.d, w.w))]);
    for (const o of cands) { const k = nkey(maskOf(o.x.d, w.w)); if (seenD.has(k)) continue; seenD.add(k); out.push(o); if (out.length >= n) break; }
    return out.length >= n ? out : null; }
  function sentenceOf(w) { return (w && w.s && /[a-z]/i.test(w.s)) ? String(w.s) : ''; }
  function loreFact(w) { try { const L = W.SB_LORE && W.SB_LORE[w.w]; if (L && L[0]) return String(L[0]); } catch (e) {} return ''; }
  function meaningQ(w, peers, dir) {
    if (dir === 'm2w') { const opts = sample([w.w].concat(peers.map((o) => o.x.w)));
      const s = sentenceOf(w);
      return { kind: 'mc', th: 'meanings', label: 'Meanings', prompt: clip(maskOf(w.d, w.w), 170), sub: 'Which word means this?', opts, ans: opts.indexOf(w.w),
        fact: s ? 'In a sentence: ' + s : loreFact(w), word: w, peers: peers.map((o) => o.x), dir }; }
    const right = clip(maskOf(w.d, w.w), 120); const opts = sample([right].concat(peers.map((o) => clip(maskOf(o.x.d, w.w), 120))));
    const s = sentenceOf(w);
    return { kind: 'mc', th: 'meanings', label: 'Meanings', prompt: w.w, big: true, sub: 'What does it mean?', opts, ans: opts.indexOf(right),
      fact: s ? 'In a sentence: ' + s : loreFact(w), word: w, say: w.w, sent: s, peers: peers.map((o) => o.x), dir }; }
  function meaningRound(h, m, n, dirs, extra) { const P = pool(h, m, extra); const ix = peerIndex(P);
    /* a word can be asked only if three others share its part of speech AND a subject theme; the round
       draws its words from those, through the door, so only the words it asks are served */
    const ok = new Set(); Object.keys(ix).forEach((k) => { if (k.indexOf('|cl:') < 0 && ix[k].length >= 4) ix[k].forEach((w) => ok.add(nkey(w.w))); });
    let fresh = draw(h, m, n + 4, Object.assign({}, extra || {}, { filter: (w) => ok.has(nkey(w.w)) }));
    if (fresh.length < n) fresh = fresh.concat(sample(P.filter((w) => ok.has(nkey(w.w)) && fresh.indexOf(w) < 0), n - fresh.length));
    /* first the words whose three peers all share their subject; only then the ones that need the cluster */
    const picked = [], later = [];
    for (const w of fresh) { if (picked.length >= n) break; const peers = meaningPeers(w, P, 3, ix); if (!peers) continue;
      (peers.every((o) => o.t === 0) ? picked : later).push([w, peers]); }
    const out = picked.concat(later).slice(0, n).map(([w, peers], i) => meaningQ(w, peers, dirs ? dirs[i % dirs.length] : (i % 2 ? 'm2w' : 'w2m')));
    return sample(out); }

  /* ---- trivia items (Roots, Hive Mind, the board and the clock) ---- */
  const QUOTED = /[“"]([A-Za-z][A-Za-z' -]*)[”"]/g;
  function quotedWords(q) { const out = []; let m; QUOTED.lastIndex = 0; while ((m = QUOTED.exec(q.q || ''))) out.push(m[1]); return out; }
  function safeTriv(q) {
    /* the stigma scan over everything the question shows — prompt, options, fact (kid-safe.js; the bank is
       cleaned at rest by tools/stigma-fix.cjs, and this holds if a regenerated bank brings one back) */
    try { if (W.SB_KID_SAFE && SB_KID_SAFE.stigmaHit && SB_KID_SAFE.stigmaHit([q.q, q.f || ''].concat(q.c || []).join(' | '))) return false; } catch (e) {}
    if (!W.kidSafe) return true;
    const ws = quotedWords(q).concat((q.c || []).filter((o) => /^[a-z]+$/i.test(String(o))));
    return ws.every((x) => kidOK({ w: String(x).toLowerCase() })); }
  function trivDraw(ths, lv, n, two) { const all = T().questions || []; const has = new Set(ths);
    const ok = (q) => has.has(q.th) && Array.isArray(q.c) && (q.c.length >= 4 || (two && q.c.length === 2)) && q.c.length !== 3 && safeTriv(q);
    let p = all.filter((q) => ok(q) && q.lv === lv);
    if (p.length < n * 3) p = all.filter((q) => ok(q) && Math.abs((q.lv || 3) - lv) <= 1);
    if (p.length < n) p = all.filter(ok);
    const seen = seenIds(); const fresh = p.filter((q) => !seen.has(q.id));
    /* spread across the chosen themes, so one big theme does not crowd out the rest */
    const by = {}; (fresh.length >= n ? fresh : p).forEach((q) => { (by[q.th] = by[q.th] || []).push(q); });
    const keys = sample(Object.keys(by)); const out = []; let i = 0;
    const decks = {}; keys.forEach((k) => { decks[k] = sample(by[k]); });
    while (out.length < n && keys.some((k) => decks[k].length)) { const k = keys[i++ % keys.length]; if (decks[k].length) out.push(decks[k].pop()); }
    return out; }
  function fromTriv(q) { const order = sample(q.c.map((x, i) => i));
    return { kind: 'mc', src: 't', id: q.id, th: q.th, label: themeLabel(q.th), lv: q.lv, prompt: q.q, opts: order.map((i) => q.c[i]), ans: order.indexOf(0),
      fact: q.f || '', two: q.c.length < 4, vis: q.v || '', svg: q.svg || '', sil: !!q.sil, aud: q.ty === 'aud', clip: q.clip || '', say: q.say || '', quoted: quotedWords(q)[0] || '' }; }

  /* ---- Origins: the language is chosen FIRST, uniformly, and the wrong options come from the same
     set — so whatever a guesser always picks wins one time in four (25%), not 40% for "Latin". ---- */
  const LANG_MAP = { 'Old French': 'French', 'Anglo-Norman': 'French', 'Old Norse': 'Norse' };
  const LANGS = ['Old English', 'Latin', 'French', 'Norse', 'Greek', 'Dutch', 'German', 'Italian', 'Spanish', 'Arabic', 'Hebrew',
    'Hindi', 'Sanskrit', 'Japanese', 'Persian', 'Portuguese', 'Russian', 'Malay', 'Irish', 'Turkish', 'Welsh', 'Chinese'];
  const langOf = (w) => { const o = String((w && w.o) || '').trim(); return LANG_MAP[o] || o; };
  function originRound(pool, n, pick) { const by = {};
    pool.forEach((w) => { const L = langOf(w); if (LANGS.indexOf(L) >= 0 && /^[a-z]+$/.test(w.w)) (by[L] = by[L] || []).push(w); });
    /* The round's languages are fixed before the first question, and each holds enough words to be
       the answer every time the deck reaches it — a language that ran dry mid-round would leave the
       options exactly when it stopped being the answer, and "always pick Hindi" would beat chance. */
    const langs = Object.keys(by); let live = [];
    for (let L = langs.length; L >= 4; L--) { const need = Math.ceil(n / L); const E = langs.filter((x) => by[x].length >= need); if (E.length >= L) { live = E; break; } }
    if (live.length < 4) return [];
    const out = [], used = new Set(); let deck = [];
    for (let i = 0; i < n; i++) {
      if (!deck.length) deck = sample(live);
      const L = deck.pop();
      const cand = by[L].filter((w) => !used.has(w.w)); const w = (pick && pick(L, used)) || sample(cand, 1)[0]; used.add(w.w);
      const opts = sample([L].concat(sample(live.filter((x) => x !== L), 3)));
      out.push({ kind: 'origin', th: 'origins', label: 'Origins', word: w, lang: L, opts, ans: opts.indexOf(L), stage: 'pick', fact: loreFact(w) }); }
    return out; }

  /* ---- Idioms & Similes (figurative-data.js, the `fig` lazy group) ---- */
  function figByLevel(h, m) { const P = (W.figPool ? figPool() : []).filter((x) => x && x.kid !== false && x.p && x.m);
    const L = levelOf(h, m); let age = 9; try { age = active().age || 9; } catch (e) {}
    const allow = L === 'easy' ? { easy: 1 } : L === 'medium' ? { easy: 1, medium: 1 } : (L === 'hard' || L === 'champ') ? null : (age <= 8 ? { easy: 1 } : age <= 10 ? { easy: 1, medium: 1 } : null);
    const f = allow ? P.filter((x) => allow[x.diff || 'medium']) : P;
    return f.length >= 24 ? f : P; }
  function idiomQ(x, pool) { const others = mcd(x.m, sample(pool.filter((y) => y !== x && y.t !== 'simile' && y.m !== x.m)).map((y) => y.m), 3);
    if (others.length < 3) return null; const opts = sample([x.m].concat(others));
    return { kind: 'mc', th: 'idioms', label: 'Idioms', prompt: '“' + x.p + '”', sub: 'What does it mean?', opts, ans: opts.indexOf(x.m),
      fact: x.os || (x.ex ? 'For example: ' + x.ex : ''), say: x.p }; }
  function simileQ(x, sims) { const v = x.vehicle; const re = new RegExp(v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const others = mcd(v, sample(sims.filter((y) => y !== x && y.vehicle.toLowerCase() !== v.toLowerCase())).map((y) => y.vehicle), 3);
    if (others.length < 3) return null; const opts = sample([v].concat(others));
    return { kind: 'mc', th: 'similes', label: 'Similes', prompt: x.p.replace(re, '_____'), sub: 'Finish the simile', opts, ans: opts.indexOf(v),
      fact: (x.m ? 'It means: ' + x.m + '. ' : '') + (x.os || '') }; }
  function mcd(answer, cands, n) { if (W.mcDistinct) return mcDistinct(answer, cands, n);
    const seen = new Set([String(answer).toLowerCase()]), out = []; for (const c of cands) { const k = String(c).toLowerCase(); if (seen.has(k)) continue; seen.add(k); out.push(c); if (out.length >= n) break; } return out; }
  function figRound(h, m, n, kinds) { const P = figByLevel(h, m); const ids = P.filter((x) => x.t !== 'simile');
    const sims = P.filter((x) => x.t === 'simile' && x.vehicle && x.p.toLowerCase().includes(String(x.vehicle).toLowerCase()));
    const allIds = (W.figPool ? figPool() : []).filter((x) => x.t !== 'simile' && x.m);
    const out = []; const iq = sample(ids), sq = sample(sims); kinds = kinds || ['idiom', 'simile'];
    let k = 0, guard = 0;
    while (out.length < n && guard++ < n * 6) { const kind = kinds[k++ % kinds.length];
      const q = kind === 'simile' ? (sq.length ? simileQ(sq.pop(), sims) : null) : (iq.length ? idiomQ(iq.pop(), allIds) : null);
      if (q) out.push(q); else if (!iq.length && !sq.length) break; }
    return out; }

  /* ---- one word question of a given Lore theme (the board and the clock) ---- */
  function loreItem(h, m, th, lv, cache) {
    if (th === 'meanings') { cache.mean = cache.mean || meaningRound(h, m, 24); return cache.mean.pop() || null; }
    if (th === 'idioms' || th === 'similes') { const k = th === 'idioms' ? 'idi' : 'sim'; cache[k] = cache[k] || figRound(h, m, 16, [th === 'idioms' ? 'idiom' : 'simile']); return cache[k].pop() || null; }
    cache[th] = cache[th] || trivDraw([th], lv, 12).map(fromTriv); return cache[th].pop() || null; }

  /* ------------------------------------------------------------------ loading at the door */
  function needAll(list, cb) { let left = list.length; if (!left) { cb(); return; } list.forEach((f) => f(() => { if (--left === 0) cb(); })); }
  const needTriv = (lv) => (done) => { try { if (W.ttNeed) ttNeed(lv, () => done()); else done(); } catch (e) { done(); } };
  const needLazy = (g) => (done) => { try { if (W.lazyNeed) lazyNeed(g, () => done()); else done(); } catch (e) { done(); } };

  /* ------------------------------------------------------------------ state */
  /* state.qz = { hub, mode, phase: 'loading'|'intro'|'play'|'done'|'empty', … } — ONE live round */
  const G = () => state.qz;
  function stopClock(g) { try { if (g && g.loop) { g.loop.stop(); g.loop = null; } } catch (e) {} }
  function open(h, mode) { const o = G(); if (o) { o.phase = o.phase === 'play' ? 'left' : o.phase; dropMiss(o); dropKeys(o); } stopClock(o); stopAud();
    if (mode && !modeOf(h, mode)) mode = null;
    state.qz = { hub: h, mode: null, phase: 'hub' };
    try { (W.SB_HUB_OPEN = W.SB_HUB_OPEN || {})[h] = h === 'lore' ? (id) => app.openLore(id) : (id) => app.openHive(id); } catch (e) {}
    if (mode) { start(h, mode); return; }
    set({ nav: h, screen: 'app', conceptSel: null, game: null }); }

  function start(h, m) { const o = G(); if (o) { if (o.phase === 'play') o.phase = 'left'; dropMiss(o); dropKeys(o); } stopClock(o); stopAud();
    const g = state.qz = { hub: h, mode: m, phase: 'loading', i: 0, asked: 0, right: 0, two: 0, paid: 0, e0: (W.earnedSoFar ? earnedSoFar() : 0), log: [] };
    const r = rec(h); r.last = m; r.seen[m] = 1; try { save(); } catch (e) {}
    state.nav = h; state.screen = 'app'; state.game = null;
    try { render(); } catch (e) {}
    const lv = trivLv(h, m);
    const go = (fn) => () => { if (G() !== g) return; try { fn(); } catch (e) { try { console.error(e); } catch (_) {} g.phase = 'empty'; } if (G() === g) { render(); afterStart(g); } };
    if (h === 'hive') {
      if (m === 'squares') { needAll([needTriv(lv)], go(() => buildSquares(g, lv))); return; }
      g.phase = 'intro'; g.ths = (rec(h).ths || []).filter((id) => generalThemes().indexOf(id) >= 0);
      needAll([needTriv(lv)], go(() => {})); return; }
    if (m === 'meanings') { needAll([needLazy('sents')], go(() => setQs(g, meaningRound(h, m, 10)))); return; }
    if (m === 'roots') { needAll([needTriv(lv), needLazy('sents')], go(() => setQs(g, trivDraw(ROOT_TH, lv, 10, true).map(fromTriv)))); return; }
    if (m === 'origins') { needAll([needLazy('lore')], go(() => setQs(g, originRound(pool(h, m), 10,
      (L, used) => draw(h, m, 1, { filter: (w) => langOf(w) === L && !used.has(w.w) && /^[a-z]+$/.test(w.w) })[0])))); return; }
    if (m === 'idioms') { needAll([needLazy('fig')], go(() => setQs(g, figRound(h, m, 10)))); return; }
    if (m === 'ladder') { needAll([needTriv(Math.max(1, lv - 1)), needTriv(lv), needTriv(Math.min(5, lv + 1)), needLazy('sents')], go(() => buildLadder(g, lv))); return; }
    if (m === 'squares') { needAll([needTriv(lv), needLazy('fig')], go(() => buildSquares(g, lv))); return; }
    if (m === 'clock') { needAll([needTriv(lv), needLazy('fig')], go(() => buildClock(g, lv))); return; } }
  function setQs(g, qs) { g.qs = qs; g.n = qs.length; g.phase = qs.length >= 5 ? 'play' : 'empty';
    if (g.phase === 'play') { markSeen(qs.map((q) => q.id)); g.qs.length = Math.min(10, g.qs.length); g.n = g.qs.length; } }
  function afterStart(g) { if (g.phase !== 'play') return; if (g.mode === 'clock') runClock(g); setTimeout(() => { if (G() === g) speakCur(g); }, 320); }

  /* ---- the board ---- */
  function buildSquares(g, lv) { const h = g.hub, m = g.mode; const cache = {}; let cells = [];
    if (h === 'hive') { const ths = sample(generalThemes(), 9);
      cells = ths.map((th) => { const q = trivDraw([th], lv, 1)[0]; return q ? { th, label: themeLabel(th), q: fromTriv(q), st: 0 } : null; }).filter(Boolean); }
    else { const order = sample(LORE_SQ.concat([LORE_SQ[0]]));
      cells = order.map(([th, label]) => { const q = loreItem(h, m, th, lv, cache); return q ? { th, label, q, st: 0 } : null; }).filter(Boolean); }
    if (cells.length < 9) { g.phase = 'empty'; return; }
    markSeen(cells.map((x) => x.q.id)); g.cells = cells; g.sel = null; g.lines = 0; g.n = 9; g.phase = 'play'; }
  const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  const linesOf = (cells) => LINES.filter((L) => L.every((i) => cells[i].st === 1)).length;

  /* ---- the ladder: twelve rungs, the level ramping under them (a step below, the level, a step above) ---- */
  const RUNGS = 12;
  function buildLadder(g, lv) { const h = g.hub, m = g.mode; const qs = [];
    const bands = [Math.max(1, lv - 1), lv, Math.min(5, lv + 1)];
    const mean = [-1, 0, 1].map((t) => meaningRound(h, m, 4, ['w2m'], { tier: t }).filter((q) => q.sent)).reverse().reduce((a, b) => a.concat(b), []);
    const idx = (W.wordIndex ? wordIndex() : {});
    for (let r = 0; r < RUNGS; r++) { const band = bands[Math.floor(r / 4)];
      if (r % 2 === 0 && mean.length) { qs.push(mean.pop()); continue; }
      const pick = trivDraw(ROOT_TH, band, 8).map(fromTriv).filter((q) => !q.two);
      /* a rung prefers a question whose word is in the question and has a sentence — "Hear it in a
         sentence" then always has one to say, and saying it never names an option */
      const withS = pick.map((q) => { const w = q.quoted && idx[nkey(q.quoted)]; return Object.assign(q, { sent: w ? sentenceOf(w) : '' }); });
      const q = withS.find((q) => q.sent && qs.every((x) => x.id !== q.id)) || withS.find((q) => qs.every((x) => x.id !== q.id)) || mean.pop();
      if (q) qs.push(q); }
    if (qs.length < RUNGS) { g.phase = 'empty'; return; }
    markSeen(qs.map((q) => q.id)); g.qs = qs; g.n = RUNGS; g.rung = 0; g.life = { fifty: 1, sent: 1, rival: 1 }; g.hidden = []; g.hint = ''; g.phase = 'play'; }
  /* "Ask a rival": the rival is a fixed speller whose accuracy falls as the rungs rise; whether they are
     right is a hash of the question, never a roll (FAMILY-STANDARD: no chance in a reward path) */
  const RIVALS = ['neko', 'ninja', 'crystal', 'queenhive', 'bizzy'];
  function hash(s) { let x = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
  function rivalSays(g) { const q = g.qs[g.rung]; const hsh = hash(q.prompt + '|' + g.rung);
    const ids = RIVALS.filter((id) => W.SB_AVATARS && SB_AVATARS.byId && SB_AVATARS.byId[id]);
    const id = ids.length ? ids[hsh % ids.length] : null; const name = id ? (SB_AVATARS.byId[id].name || 'A rival') : 'A rival';
    const acc = 0.9 - 0.035 * g.rung; const right = (hsh % 1000) / 1000 < acc;
    let pick = q.ans; if (!right) { const wrong = [0, 1, 2, 3].filter((i) => i !== q.ans && g.hidden.indexOf(i) < 0); pick = wrong[hsh % wrong.length]; }
    return { id, name, pick, sure: acc >= 0.72 }; }

  /* ---- the clock: real time, a wrong pick costs 2 s, and the clock holds while a miss is up ---- */
  const CLOCK_MS = 60000;
  function buildClock(g, lv) { const h = g.hub; let qs = [];
    if (h === 'hive') qs = trivDraw(g.ths && g.ths.length ? g.ths : generalThemes(), lv, 60).map(fromTriv);
    else { const cache = {}; const ths = ['meanings', 'wroots', 'wbreak', 'wstories', 'eponyms', 'words', 'idioms', 'similes'];
      for (let i = 0; i < 48; i++) { const q = loreItem(h, g.mode, ths[i % ths.length], lv, cache); if (q) qs.push(q); } qs = sample(qs); }
    if (qs.length < 10) { g.phase = 'empty'; return; }
    markSeen(qs.slice(0, 30).map((q) => q.id)); g.qs = qs; g.left = CLOCK_MS; g.phase = 'play'; }
  function fmtT(ms) { return Math.max(0, Math.ceil(ms / 1000)) + 's'; }
  function runClock(g) { stopClock(g);
    const upd = (dt) => { if (G() !== g || g.phase !== 'play' || state.nav !== g.hub) { stopClock(g); return; } if (g.held || state.settingsOpen) return;
      g.left -= dt * 1000; if (g.left <= 0) { g.left = 0; stopClock(g); finish(g); } };
    const draw = () => { const el = document.getElementById('qz-time'); if (el) { const t = fmtT(g.left); if (el.textContent !== t) el.textContent = t; el.classList.toggle('low', g.left <= 10000); } };
    if (W.SGUI && SGUI.clock) {
      const c = SGUI.clock(g.left / 1000, { fmt: (sec) => sec + 's',
        onTick: (sec) => { if (G() !== g || g.phase !== 'play' || state.nav !== g.hub) { c.stop(); return; }
          const el = document.getElementById('qz-time'); if (el) { el.textContent = sec + 's'; el.classList.toggle('low', sec <= 10); } },
        onEnd: () => { if (G() === g && g.phase === 'play' && state.nav === g.hub) finish(g); } });
      g.clock = c; Object.defineProperty(g, 'left', { get: () => c.left() * 1000, set: () => {}, configurable: true });
      g.loop = { hold: (v) => c.hold(v), stop: () => c.stop() }; return; }
    if (W.sgLoop) { g.loop = sgLoop(upd, draw); return; }
    /* the kit's loop is not in yet (g-engine): the same contract in miniature — real time, paused when hidden */
    let last = performance.now(), raf = 0, on = true;
    const tick = (now) => { if (!on) return; raf = requestAnimationFrame(tick); if (document.hidden) { last = now; return; } upd(Math.min(0.25, (now - last) / 1000)); last = now; draw(); };
    raf = requestAnimationFrame(tick); g.loop = { hold() {}, stop() { on = false; cancelAnimationFrame(raf); } }; }
  function hold(g, v) { g.held = !!v; try { if (g.loop && g.loop.hold) g.loop.hold(!!v); } catch (e) {} }

  /* ------------------------------------------------------------------ answers */
  function curQ(g) { if (!g || !g.qs && !g.cells) return null;
    if (g.mode === 'squares') return g.sel != null ? g.cells[g.sel].q : null;
    if (g.mode === 'ladder') return g.qs[g.rung];
    if (g.mode === 'clock') return g.qs[g.i % g.qs.length];
    return g.qs[g.i]; }
  /* Pay only above chance, and as the answers come: nothing until the round holds 6 right (and 60% in a
     timed run), then the backlog at once and one per right after. The ledger change is what the result
     card prints, so the card can never promise a coin the wallet did not get (T6). */
  const hivePays = () => W.SB_HIVE_PAY !== false;
  function owed(g) { if (g.hub === 'hive' && !hivePays()) return 0;
    if (g.mode === 'origins') return g.spelled || 0;
    if (g.mode === 'ladder') return g.rung >= 4 ? g.rung : 0;
    /* the clock has no fixed length, so a lucky early run must not count: while it runs, coins wait for 15
       answers at 60%; when time is up, 6 right at 60% is enough (a slow reader is not a guesser) */
    if (g.mode === 'clock') { const acc = g.asked ? g.right / g.asked : 0; if (acc < 0.6) return 0;
      return (g.phase === 'done' ? g.right >= 6 : g.asked >= 15) ? g.right : 0; }
    return g.right >= 6 ? g.right : 0; }
  function settle(g) { let k = owed(g) - g.paid; while (k-- > 0) { g.paid++; try { payG(g); } catch (e) {} } }
  function grade(g, q, i) { const ok = i === q.ans; g.picked = i;
    if (!q.two) { g.asked++; if (ok) g.right++; } else { g.two++; }
    g.log.push({ th: q.th, ok, two: !!q.two });
    try { if (q.src === 't' && W.ttBandRecord) ttBandRecord(q.lv || 3, ok); } catch (e) {}
    try { sfx(ok ? 'correct' : 'wrong'); } catch (e) {}
    if (ok) settle(g); return ok; }

  function pick(i) { const g = G(); if (!g || g.phase !== 'play') return; i = +i; const q = curQ(g); if (!q || g.picked != null || g.held) return;
    if (!(i >= 0 && i < q.opts.length) || (g.hidden && g.hidden.indexOf(i) >= 0)) return;
    if (q.kind === 'origin') { if (q.stage !== 'pick') return; q.langOk = i === q.ans; q.picked = i; q.stage = 'type'; g.typed = '';
      try { sfx(q.langOk ? 'correct' : 'wrong'); } catch (e) {} render(); focusType(); setTimeout(() => { if (G() === g) say(q.word.w); }, 260); return; }
    stopAud();
    const ok = grade(g, q, i);
    if (g.mode === 'ladder') { if (ok) { g.rung++; settle(g); try { burstConfetti(30); } catch (e) {} if (g.rung >= RUNGS) { finish(g); return; } } else { g.held = true; g.missed = true; }
      render(); if (ok) after(g, 1200, () => { g.picked = null; g.hidden = []; g.hint = ''; g.sentShown = false; if (g.rung >= RUNGS) finish(g); else { render(); speakCur(g); } }); return; }
    if (g.mode === 'squares') { const cell = g.cells[g.sel]; cell.st = ok ? 1 : 2; if (!ok) g.held = true; render();
      if (ok) after(g, 1500, () => nextCell(g)); return; }
    if (g.mode === 'clock') { if (!ok) { if (g.clock) g.clock.add(-Math.min(2, g.clock.left())); else g.left = Math.max(0, g.left - 2000); hold(g, true); } render(); if (ok) after(g, 450, () => advance(g)); return; }
    if (!ok) g.held = true; render(); if (ok) after(g, 2100, () => advance(g)); }
  /* a right answer may move on by itself; a miss never does (FIX-BEE D3) */
  function after(g, ms, fn) { const tok = g.tok = (g.tok || 0) + 1; g.go = () => { if (G() !== g || g.tok !== tok) return; g.tok++; g.go = null; fn(); };
    setTimeout(() => { if (g.go && g.tok === tok) g.go(); }, ms); }
  function dropMiss(g) { if (g && g.missH) { const h = g.missH; g.missH = null; try { h.close(); } catch (e) {} } }
  function dropKeys(g) { if (g && g.keys) { try { g.keys.destroy(); } catch (e) {} g.keys = null; } }
  function cont() { const g = G(); if (!g) return; dropMiss(g);
    if (g.phase === 'done') { start(g.hub, g.mode); return; }
    if (g.phase === 'intro') { begin(); return; }
    if (g.phase !== 'play') return;
    const q = curQ(g);
    if (q && q.kind === 'origin' && q.stage === 'done') { g.held = false; advance(g); return; }
    if (q && q.kind === 'origin') return;
    if (g.go) { g.go(); return; }
    if (!g.held) return;
    g.held = false; g.go = null;
    if (g.mode === 'ladder') { finish(g); return; }
    if (g.mode === 'squares') { nextCell(g); return; }
    if (g.mode === 'clock') { hold(g, false); advance(g); return; }
    advance(g); }
  function advance(g) { if (G() !== g || g.phase !== 'play') return; g.picked = null; g.held = false; g.typed = '';
    g.i++; if (g.mode !== 'clock' && g.i >= g.n) { finish(g); return; }
    render(); speakCur(g); }
  function nextCell(g) { g.picked = null; g.held = false; g.sel = null;
    const L = linesOf(g.cells); if (L > g.lines) { g.lines = L; try { sfx('win'); burstConfetti(70); } catch (e) {} g.lineFlash = L; }
    if (g.cells.every((x) => x.st > 0)) { finish(g); return; } render(); }
  function cell(i) { const g = G(); if (!g || g.phase !== 'play' || g.mode !== 'squares' || g.sel != null) return; i = +i;
    if (!g.cells[i] || g.cells[i].st > 0) return; g.sel = i; g.lineFlash = 0; render(); setTimeout(() => { if (G() === g) speakCur(g); }, 300); }

  /* Origins: the typed word is real spelling evidence, exactly as a drill's is */
  function typeIn(v) { const g = G(); if (g) g.typed = String(v || ''); }
  function typeKey(e) { if (e && e.key === 'Enter') { try { e.preventDefault(); } catch (_) {} submitType(); } }
  function submitType() { const g = G(); if (!g || g.phase !== 'play') return; const q = curQ(g); if (!q || q.kind !== 'origin') return;
    if (q.stage === 'done') { advance(g); return; } if (q.stage !== 'type') return;
    const typed = String(g.typed || '').trim().toLowerCase(); if (!typed) return;
    const w = q.word; const ok = typed === nkey(w.w); q.typed = typed; q.ok = ok; q.stage = 'done';
    g.asked++; if (ok) { g.right++; g.spelled = (g.spelled || 0) + 1; } g.log.push({ th: 'origins', ok });
    try { if (W.logGameWord) logGameWord(nkey(w.w)); if (W.logBand) logBand(w, ok); } catch (e) {}
    try { if (ok) { if (W.markMastered) markMastered(nkey(w.w)); if (W.clearMiss) clearMiss(w.w); sfx('correct'); } else { if (W.addMiss) addMiss(w); sfx('wrong'); } } catch (e) {}
    if (ok) settle(g); else g.held = true;
    render(); if (ok) after(g, 1800, () => advance(g)); }
  function focusType() { setTimeout(() => { try { const el = document.querySelector('[data-fkey="qzTyped"]'); if (el) el.focus(); } catch (e) {} }, 40); }

  /* ---- lifelines ---- */
  function life(k) { const g = G(); if (!g || g.mode !== 'ladder' || g.phase !== 'play' || g.picked != null || g.held || !g.life[k]) return;
    const q = g.qs[g.rung];
    if (k === 'fifty') { const wrong = [0, 1, 2, 3].filter((i) => i !== q.ans); const h = hash(q.prompt);
      wrong.sort((a, b) => ((a * 7 + h) % 5) - ((b * 7 + h) % 5)); g.hidden = wrong.slice(0, 2); }
    else if (k === 'sent') { if (!q.sent) { flash('No sentence for this one — try another lifeline'); return; } g.sentShown = true; try { saySentence(q.sent, q.word && q.word.w); } catch (e) {} }
    else if (k === 'rival') { g.rival = rivalSays(g); }
    g.life[k] = 0; render(); }

  /* ---- the end of a round ---- */
  function finish(g) { if (!g || g.phase === 'done') return; stopClock(g); g.phase = 'done'; g.held = false; g.go = null;
    settle(g);
    const h = g.hub, m = g.mode; const r = rec(h);
    const score = m === 'ladder' ? g.rung : g.right; const of = m === 'ladder' ? RUNGS : m === 'clock' ? 0 : (g.n - g.two);
    const had = bestOf(h, m);
    if (W.SB_BESTS) { try { g.newBest = SB_BESTS.put(lkey(h, m), score, of || null) && !!had; } catch (e) {} }
    else if (!had || score > had.r) { r.best[m] = { r: score, n: of }; g.newBest = !!had; }
    /* the level is re-checked once, here: right first try ÷ asked, two-option items left out (§1.7) */
    const pct = g.asked ? g.right / g.asked : 0;   // right first try ÷ asked; a climb's miss is one asked, not right
    g.pct = pct;
    try { if (LV() && LV().after && g.asked > 0) g.lvl = LV().after(lkey(h, m), Math.round(pct * 100)); } catch (e) {}
    g.coins = (W.earnedSoFar ? earnedSoFar() : g.e0 + g.paid) - g.e0;
    try { logActivity(h === 'lore' ? 'lore' : 'hive', hubName(h) + ' · ' + modeOf(h, m).title, { done: g.asked, right: g.right, coins: g.coins }, []); } catch (e) {}
    try { if (score >= Math.max(1, of * 0.8)) { sfx('win'); burstConfetti(90); } else sfx('level'); } catch (e) {}
    try { save(); } catch (e) {}
    render(); }
  function leave() { const g = G(); stopClock(g); stopAud(); if (g && g.mode) { open(g.hub, null); return; } try { app.openGames(); } catch (e) { set({ nav: 'games' }); } }

  /* ---- Hive Mind's theme choice (Classic, Clock) ---- */
  function toggleTh(id) { const g = G(); if (!g || g.phase !== 'intro') return; g.ths = g.ths || [];
    if (id === 'all') g.ths = []; else { const i = g.ths.indexOf(id); if (i >= 0) g.ths.splice(i, 1); else g.ths.push(id); }
    rec(g.hub).ths = g.ths.slice(); render(); }
  function begin() { const g = G(); if (!g || g.phase !== 'intro') return; const lv = trivLv(g.hub, g.mode);
    try { if (W.ttLevelReady && !ttLevelReady(lv)) { if (!g.waiting) { g.waiting = 1; needTriv(lv)(() => { g.waiting = 0; if (G() === g) begin(); }); } return; } } catch (e) {}
    if (g.mode === 'clock') buildClock(g, lv);
    else setQs(g, trivDraw(g.ths && g.ths.length ? g.ths : generalThemes(), lv, 10).map(fromTriv));
    g.e0 = W.earnedSoFar ? earnedSoFar() : 0; render(); afterStart(g); }

  /* ---- sound: the word, the saying, or the question's own clip ---- */
  let _aud = null;
  function stopAud() { try { if (_aud) { _aud.pause(); _aud = null; } } catch (e) {} }
  function speakCur(g) { const q = curQ(g); if (!q) return;
    try { if (q.kind === 'origin') { if (q.stage !== 'done') say(q.word.w); return; }
      if (q.clip) { stopAud(); _aud = new Audio('voice/' + q.clip); _aud.play().catch(() => { try { say(q.say || q.prompt); } catch (e) {} }); return; }
      if (q.say) say(q.say); } catch (e) {} }

  /* ------------------------------------------------------------------ views */
  const ic = (n, s) => { try { return iconSVG(n, s || 18, 2.3); } catch (e) { return ''; } };
  function art(h, m, size) { try {
    if (h === 'hive') { const A = W.SB_TT_ICON_ART || {}; const a = A[m.art]; if (a) return '<span class="qz-art" aria-hidden="true">' + a.replace('<svg ', '<svg width="' + size + '" height="' + size + '" ') + '</span>'; }
    if (W.SB_ICON_ART && SB_ICON_ART[m.ic]) return '<span class="qz-art" aria-hidden="true">' + SB_ICON_ART(m.ic, { size }) + '</span>';
    return '<span class="qz-art" aria-hidden="true">' + ic(m.ic || 'star', size * 0.7) + '</span>'; } catch (e) { return ''; } }
  function plate(h) { try { return W.SB_PLATE ? SB_PLATE(h) : ''; } catch (e) { return ''; } }
  function coinsToday() { try { const c = active(); const L = (W.BZ_WALLET && W.walletWho) ? BZ_WALLET.ledger(walletWho(c)) : [];
      const d = new Date().toDateString(); return L.filter((x) => x.a === BEE_APP && x.n > 0 && x.why !== 'migrated' && new Date(x.t).toDateString() === d).reduce((a, x) => a + x.n, 0); } catch (e) { return 0; } }
  function goodDays() { try { return W.goodDaysThisWeek ? goodDaysThisWeek(active()) : 0; } catch (e) { return 0; } }
  const coin = (n) => (W.coinAmt ? coinAmt(n, 15) : n + ' coins');
  const kit = () => !!(W.SGUI && SGUI.stage && W.SB_HUB);
  function stage(h, o) {
    /* the shared stage (§5.0): the painted plate by name, so Light and Dusk each get their own painting */
    if (kit()) { try { return SGUI.stage({ plate: h, name: h, cls: 'qz-kit qz-' + h + (o.cls ? ' ' + o.cls : ''), label: hubName(h), hud: o.hud, play: o.play, controls: o.controls || '' }); } catch (e) {} }
    const p = plate(h);
    return `<div class="qz-stage qz-${h}${o.cls ? ' ' + o.cls : ''}"${p ? ` data-plate style="--qz-plate:url('${escA(p)}')"` : ''}>
      <div class="qz-hud"><div class="qz-hl">${o.hud.left || ''}</div><div class="qz-hc">${o.hud.center || ''}</div><div class="qz-hr">${o.hud.right || ''}</div></div>
      <div class="qz-play">${o.play}</div>${o.controls ? `<div class="qz-ctl">${o.controls}</div>` : ''}</div>`; }
  const top = (act, label) => kit() ? '' : `<div class="qz-top">${W.backPill ? backPill(act, label, null) : `<button data-act="${act}">← ${esc(label)}</button>`}</div>`;
  /* a HUD stat in the kit's shape (icon · number · label; the label hides on a phone) */
  const stat = (k, v, id, icn) => `<span class="sg-st-ic">${ic(icn || 'star', 16)}</span><span class="sg-st-n qz-sv"${id ? ` id="${id}"` : ''}>${v}</span><span class="sg-st-t">${k}</span>`;
  /* the way back to the hub sits in the left stat, so the mirrored HUD stays mirrored */
  const backIn = (h) => `<button class="qz-back" data-act="qzBack" aria-label="${escA('Back to ' + hubName(h))}">${ic('arrowLeft', 16)}</button>`;
  const pad = '<span class="qz-pad" aria-hidden="true"></span>';
  const title = (t, short, chipHtml) => `<h1 class="sg-st-title qz-ttl"><span class="qz-tl">${esc(t)}</span>${short ? `<span class="qz-ts">${esc(short)}</span>` : ''}${chipHtml || ''}</h1>`;

  function hubView(h) { const r = rec(h);
    const modes = MODES[h].map((m) => ({ id: m.id, title: m.title, promise: m.promise(), art: art(h, m, 64), best: bestTxt(h, m.id), isNew: !r.seen[m.id], last: r.last === m.id }));
    const hud = { left: stat('good days this week', goodDays(), '', 'sparkle'), right: stat('coins today', coinsToday(), '', 'star') };
    try { (W.SB_HUB_OPEN = W.SB_HUB_OPEN || {})[h] = h === 'lore' ? (id) => app.openLore(id) : (id) => app.openHive(id); } catch (e) {}
    /* the shared hub screen (§4.0): its own HUD — good days on the left, coins today on the right */
    if (kit()) { try { return SB_HUB({ key: h, title: hubName(h), plate: h, last: r.last || '', modes: modes.map((m) => Object.assign({}, m, { last: undefined })) }); } catch (e) {} }
    const tiles = modes.map((m) => `<div class="qz-tile${m.last ? ' last' : ''}">
        <button class="qz-tile-go" data-act="hubMode" data-arg="${h}/${m.id}" aria-label="${escA(m.title + '. ' + m.promise + (m.best ? ' ' + m.best : ''))}">
          ${m.isNew ? '<span class="qz-new" aria-hidden="true"></span>' : ''}${m.art}
          <span class="qz-tt">${esc(m.title)}</span><span class="qz-tp">${esc(m.promise)}</span>
          <span class="qz-tb">${m.best ? esc(m.best) : (m.last ? 'Last played' : '&nbsp;')}</span></button>
        <span class="qz-chip">${chip(h, m.id)}</span></div>`).join('');
    return top('openGames', 'Play') + stage(h, { hud: { left: hud.left, center: title(hubName(h)), right: hud.right },
      play: `<div class="qz-tiles qz-n${modes.length}">${tiles}</div>`, cls: 'qz-hubst' }); }

  const SHORT = { 'Idioms & Similes': 'Idioms', 'Against the Clock': 'Clock' };
  function hudFor(g) { const m = modeOf(g.hub, g.mode); const center = title(m.title, SHORT[m.title], chip(g.hub, g.mode)); const bk = backIn(g.hub);
    if (g.mode === 'clock') return { left: bk + stat('left', fmtT(g.left), 'qz-time', 'timer'), center, right: stat('right', String(g.right), '', 'check') + pad };
    if (g.mode === 'ladder') return { left: bk + stat('rung', Math.min(RUNGS, g.rung + 1) + '/' + RUNGS, '', 'steps'), center, right: stat('climbed', String(g.rung), '', 'check') + pad };
    if (g.mode === 'squares') return { left: bk + stat('claimed', g.cells.filter((x) => x.st === 1).length + '/9', '', 'grid'), center, right: stat('lines', String(g.lines), '', 'sparkle') + pad };
    return { left: bk + stat('question', Math.min(g.n, g.i + 1) + '/' + g.n, '', 'target'), center, right: stat('right', String(g.right), '', 'check') + pad }; }

  function visual(q) { if (q.svg) return `<div class="qz-vis">${q.svg}</div>`;
    if (q.vis) return `<div class="qz-vis qz-emo"${q.sil ? ' style="filter:brightness(0) opacity(.82)"' : ''}>${esc(q.vis)}</div>`; return ''; }
  function optsHTML(g, q, cls) { return `<div class="qz-opts${cls ? ' ' + cls : ''}" role="group" aria-label="Answers">${q.opts.map((o, i) => {
      const hid = g.hidden && g.hidden.indexOf(i) >= 0; const done = g.picked != null || (q.kind === 'origin' && q.stage !== 'pick');
      const picked = q.kind === 'origin' ? q.picked : g.picked;
      const st = done ? (i === q.ans ? ' right' : i === picked ? ' wrong' : ' dim') : '';
      const mark = done && i === q.ans ? ic('check', 16) : done && i === picked ? ic('close', 16) : '';
      return hid ? `<span class="qz-opt gone" aria-hidden="true"></span>` : `<button class="qz-opt${st}${String(o).length > 60 ? ' long' : ''}" data-act="qzPick" data-arg="${i}"${done ? ' disabled' : ''}><span class="qz-k" aria-hidden="true">${i + 1}</span><span class="qz-ot">${esc(o)}</span>${mark ? `<span class="qz-mk">${mark}</span>` : ''}</button>`; }).join('')}</div>`; }
  /* the miss card: the question, the right answer, and why — SGUI.missQ when the kit is in */
  function missHTML(g, q) {
    if (W.SGUI && SGUI.missQ) return optsHTML(g, q);   // the kit's card covers the window; the marked answers stay under it
    return `<div class="qz-miss" data-live-prompt="${escA('Not this time. The answer is ' + q.opts[q.ans] + '.')}">
      <div class="qz-mans">${ic('close', 16)} Not this time. The answer: <b>${esc(q.opts[q.ans])}</b></div>
      ${g.picked != null && q.opts[g.picked] != null ? `<div class="qz-mpick">You picked: ${esc(clip(q.opts[g.picked], 90))}</div>` : ''}
      ${q.fact ? `<div class="qz-fact"><b>${ic('bulb', 15)} Did you know?</b> ${esc(q.fact)}</div>` : ''}
      <button class="qz-go" data-act="qzGo">${g.mode === 'ladder' ? 'See my climb' : 'Continue'} <span class="qz-kb" aria-hidden="true">Enter</span></button></div>`; }
  function rightHTML(q) { return `<div class="qz-ok" role="status"><span class="qz-okh">${ic('check', 16)} Right!</span>${q.fact ? ` <span class="qz-okf">${esc(clip(q.fact, 150))}</span>` : ''}</div>`; }
  const isHeld = (g, q) => g.held && g.picked != null && g.picked !== q.ans;
  function qCard(g, q, extra) { const held = g.held && g.picked != null && g.picked !== q.ans; const right = g.picked != null && g.picked === q.ans;
    const num = g.mode === 'ladder' ? 'Rung ' + (g.rung + 1) + ' of ' + RUNGS + '. ' : g.mode === 'clock' || g.mode === 'squares' ? '' : 'Question ' + (g.i + 1) + ' of ' + g.n + '. ';
    return `<div class="qz-card sg-panel" data-live-prompt="${escA(num + (q.big ? q.prompt + '. ' + (q.sub || '') : (q.sub ? q.sub + ' ' : '') + q.prompt))}">
      <div class="qz-tag">${esc(q.label || '')}</div>${visual(q)}
      ${q.aud || q.say ? `<button class="qz-hear" data-act="qzHear" aria-label="Hear it">${ic('volume', 17)} <span class="qz-hlab">Hear it</span></button>` : ''}
      ${q.big ? `<div class="qz-big">${esc(q.prompt)}</div><div class="qz-sub">${esc(q.sub || '')}</div>` : `${q.sub ? `<div class="qz-sub">${esc(q.sub)}</div>` : ''}<div class="qz-q">${esc(q.prompt)}</div>`}
      ${q.two ? '<div class="qz-two">True or false — just for fun: this one never counts toward your level.</div>' : ''}
      ${extra || ''}${right ? rightHTML(q) : ''}</div>`; }

  function playView(g) { const h = g.hub, m = g.mode; const hud = hudFor(g);
    if (m === 'squares' && g.sel == null) {
      const cells = g.cells.map((c, i) => `<button class="qz-cell s${c.st}" data-act="qzCell" data-arg="${i}"${c.st ? ' disabled' : ''} aria-label="${escA(c.label + (c.st === 1 ? ', claimed' : c.st === 2 ? ', missed' : ''))}">
          <span class="qz-cn" aria-hidden="true">${i + 1}</span>${c.st === 1 ? ic('star', 26) : c.st === 2 ? ic('close', 24) : cellArt(c.th)}<span class="qz-cl">${esc(c.label)}</span></button>`).join('');
      const line = g.lineFlash ? `<div class="qz-line" role="status">${ic('sparkle', 16)} Line ${g.lineFlash}! ${g.lineFlash === 1 ? 'Your first line.' : 'Another line.'}</div>` : '';
      return stage(h, { hud, play: `<div class="qz-board">${cells}</div>${line}`, controls: `<div class="qz-hint">Pick a square — keys 1–9 or tap</div>` }); }
    const q = curQ(g); if (!q) return stage(h, { hud, play: W.hiveLoader ? hiveLoader('…') : '' });
    if (q.kind === 'origin') return stage(h, { hud, play: originCard(g, q), controls: q.stage === 'pick' ? optsHTML(g, q) : q.stage === 'type' && kbd() ? '<div id="qz-keys" class="qz-keys"></div>' : '' });
    let extra = '';
    if (m === 'ladder') { const rv = g.rival && g.picked == null ? `<div class="qz-rival">${g.rival.id && W.SB_AVATAR ? `<span class="qz-rav">${SB_AVATAR(g.rival.id, 34)}</span>` : ''}<span><b>${esc(g.rival.name)}:</b> ${g.rival.sure ? 'I’m fairly sure it’s' : 'I think it might be'} <b>${g.rival.pick + 1}</b>.</span></div>` : '';
      extra = (g.sentShown && q.sent ? `<div class="qz-sent">${ic('volume', 15)} ${esc(q.sent)}</div>` : '') + rv; }
    /* a held miss takes the answers' place: the question stays, the answer and why sit where the child was looking */
    const ctl = isHeld(g, q) ? missHTML(g, q) : optsHTML(g, q);
    const play = m === 'ladder' ? `<div class="qz-ladcol"><div class="qz-ladwrap">${qCard(g, q, extra)}${comb(g)}</div>${ladderCtl(g)}</div>` : qCard(g, q, extra);
    return stage(h, { hud, play, controls: ctl }); }
  const CELL_IC = { meanings: 'book', idioms: 'bulb', similes: 'sparkle' };
  function cellArt(th) { try { const A = (W.SB_TT_ICON_ART || {})[th];
      if (A) return '<span class="qz-cart" aria-hidden="true">' + A.replace('<svg ', '<svg width="44" height="44" ') + '</span>';
      const k = CELL_IC[th]; if (k && W.SB_ICON_ART && SB_ICON_ART[k]) return '<span class="qz-cart" aria-hidden="true">' + SB_ICON_ART(k, { size: 40 }) + '</span>'; } catch (e) {} return ''; }
  function ladderCtl(g) { const L = g.life; const b = (k, label, icn) => `<button class="qz-ll${L[k] ? '' : ' used'}" data-act="qzLife" data-arg="${k}"${L[k] && g.picked == null ? '' : ' disabled'}>${ic(icn, 15)} ${label}</button>`;
    return `<div class="qz-lls">${b('fifty', '50:50', 'grid')}${b('sent', '<span class="qz-long">Hear it in a sentence</span><span class="qz-short">Sentence</span>', 'volume')}${b('rival', '<span class="qz-long">Ask a rival</span><span class="qz-short">Rival</span>', 'users')}
      <button class="qz-ll qz-exit" data-act="qzStop"${g.picked != null ? ' disabled' : ''}>${ic('arrowLeft', 15)} <span class="qz-long">Stop climbing</span><span class="qz-short">Stop</span></button></div>`; }
  /* the ladder is a column of honeycomb cells — numbers only, no money */
  function comb(g) { let out = ''; for (let r = RUNGS - 1; r >= 0; r--) { const cls = r < g.rung ? ' done' : r === g.rung && g.phase === 'play' ? ' on' : '';
      out += `<span class="qz-rung${cls}${r % 4 === 3 ? ' mark' : ''}"><span>${r + 1}</span></span>`; }
    return `<div class="qz-comb" aria-label="Rung ${Math.min(RUNGS, g.rung + 1)} of ${RUNGS}">${out}</div>`; }
  function originCard(g, q) { const w = q.word;
    let body = `<div class="qz-sub">Listen. Where does this word come from?</div><button class="qz-hear big" data-act="qzHear">${ic('volume', 20)} Hear the word</button>`;
    if (q.stage !== 'pick') body += `<div class="qz-lang ${q.langOk ? 'ok' : 'no'}">${ic(q.langOk ? 'check' : 'close', 16)} ${q.langOk ? 'Yes — it came into English from' : 'It came into English from'} <b>${esc(q.lang)}</b>.</div>`;
    if (q.stage === 'type') body += `<div class="qz-sub">Now spell it.</div>
      <input class="qz-in" data-inp="qzType" data-key="qzKey" data-fkey="qzTyped"${kbd() ? ' readonly inputmode="none"' : ''} value="${escA(g.typed || '')}" placeholder="type the word" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" aria-label="Type the word you heard">
      <button class="qz-go" data-act="qzSubmit">Check <span class="qz-kb" aria-hidden="true">Enter</span></button>`;
    if (q.stage === 'done') { const note = [q.lang + (q.fact ? ' — ' + q.fact : '')];
      if (q.ok) body += `<div class="qz-ok" role="status">${ic('check', 16)} <b>${esc(w.w)}</b> — spelled right. <span class="qz-okf">${esc(note[0])}</span></div><button class="qz-go" data-act="qzGo">Next <span class="qz-kb" aria-hidden="true">Enter</span></button>`;
      else { body += (W.SGUI && SGUI.miss) ? `<div class="qz-lang no">${ic('close', 16)} Not this time.</div>` : ((W.missFeedbackHTML ? missFeedbackHTML(w, q.typed, { head: 'Here is the word, letter by letter' }) : `<div class="qz-mans">The word: <b>${esc(w.w)}</b></div>`)
          + `<div class="qz-fact"><b>${ic('bulb', 15)} Where it comes from</b> ${esc(note[0])}</div><button class="qz-go" data-act="qzGo">Continue <span class="qz-kb" aria-hidden="true">Enter</span></button>`); } }
    return `<div class="qz-card sg-panel" data-live-prompt="Listen, then pick the language the word came from.">${body}</div>`; }

  /* touch screens type on the kit's keyboard (§1.6: keys ≥ 40px, never under the tab bar); desktops on their own */
  function kbd() { try { return !!(W.SGUI && SGUI.keys && W.matchMedia && matchMedia('(pointer: coarse)').matches); } catch (e) { return false; } }
  function introView(g) { const ths = generalThemes(); const sel = g.ths || [];
    const chips = [['all', 'All themes']].concat(ths.map((id) => [id, themeLabel(id)])).map(([id, label]) => { const on = id === 'all' ? !sel.length : sel.indexOf(id) >= 0;
      const A = (W.SB_TT_ICON_ART || {})[id]; const pic = A ? `<span class="qz-thic" aria-hidden="true">${A.replace('<svg ', '<svg width="22" height="22" ')}</span>` : '';
      return `<button class="qz-th${on ? ' on' : ''}" data-act="qzTh" data-arg="${id}" aria-pressed="${on}">${pic}${esc(label)}</button>`; }).join('');
    const m = modeOf(g.hub, g.mode);
    return stage(g.hub, { hud: { left: backIn(g.hub) + stat('themes', sel.length ? String(sel.length) : 'All', '', 'grid'), center: title(m.title, SHORT[m.title], chip(g.hub, g.mode)), right: stat('best', esc(bestTxt(g.hub, g.mode).replace(/^Best: /, '') || '–'), '', 'trophy') + pad },
      /* the bank's ONE count (SB_COUNT, from the index — never "0 questions" before a shard lands) */
      play: `<div class="qz-card sg-panel qz-intro"><div class="qz-sub">${esc(m.promise())}</div><div class="qz-cnt">${esc([cnt('trivia') ? cnt('trivia') + ' questions' : '', ths.length + ' themes'].filter(Boolean).join(' · '))}</div><div class="qz-ths">${chips}</div></div>`,
      controls: `<button class="qz-go big" data-act="qzBegin">Start <span class="qz-kb" aria-hidden="true">Enter</span></button>` }); }

  function doneView(g) { const m = modeOf(g.hub, g.mode);
    const big = g.mode === 'ladder' ? 'Rung ' + g.rung + ' of ' + RUNGS : g.mode === 'clock' ? g.right + ' right' : g.right + ' / ' + (g.n - g.two);
    const sub = g.mode === 'ladder' ? (g.rung >= RUNGS ? 'The whole ladder — every rung.' : g.missed ? 'The climb ends on a miss — the answer is above it now.' : 'You stopped climbing.')
      : g.mode === 'clock' ? (g.asked ? g.asked + ' answered in 60 seconds' : 'No answers this time') : g.mode === 'squares' ? g.lines + (g.lines === 1 ? ' line' : ' lines') + ' scored' : 'right first try';
    const pay = g.coins > 0 ? `<div class="qz-pay">${ic('star', 15)} +${g.coins} coin${g.coins === 1 ? '' : 's'} into your wallet</div>`
      : `<div class="qz-nopay">${g.hub === 'hive' && !hivePays() ? 'Just for fun — no coins in this hub.' : g.mode === 'ladder' ? 'Climb four rungs and every rung pays a coin.' : g.mode === 'clock' ? 'Six right, at least six in ten, and every right answer pays a coin.' : 'Six right and every right answer pays a coin.'}</div>`;
    const L = g.lvl || {}; const names = LVL_NAME;
    const up = L.offerUp ? (LV() && LV().upButton ? LV().upButton(lkey(g.hub, g.mode), L) : `<button class="qz-up" data-act="qzUp">Ready for ${esc(names[L.offerUp] || names[nextUp(L.level)] || 'the next level')}?</button>`) : '';
    const lvl = L.dropped ? `<div class="qz-lvl">${esc(L.line || ('Let’s warm up on ' + (names[L.level] || L.level) + '. You can move back up any time.'))}</div>`
      : up ? `<div class="qz-lvl">${up}</div>` : '';
    const best = bestTxt(g.hub, g.mode);
    return stage(g.hub, { hud: { left: backIn(g.hub) + stat('right', g.mode === 'ladder' ? g.rung : g.right, '', 'check'), center: title(m.title, SHORT[m.title], chip(g.hub, g.mode)), right: stat('best', esc(best.replace(/^Best: /, '') || '–'), '', 'trophy') + pad },
      play: `<div class="qz-card sg-panel qz-done" data-live-prompt="${escA(big + '. ' + sub)}"><div class="qz-dh">${g.newBest ? 'A new best' : 'Round complete'}</div><div class="qz-db">${esc(big)}</div><div class="qz-sub">${esc(sub)}</div>${pay}${lvl}</div>`,
      controls: `<div class="qz-btns"><button class="qz-go alt" data-act="qzBack">${ic('grid', 15)} All modes</button><button class="qz-go" data-act="qzGo">Play again <span class="qz-kb" aria-hidden="true">Enter</span></button></div>` }); }
  const ORDER = ['easy', 'medium', 'hard', 'champ'];
  function nextUp(l) { const i = ORDER.indexOf(l); return ORDER[Math.min(ORDER.length - 1, i + 1)] || 'medium'; }
  function up() { const g = G(); if (!g || !g.lvl || !LV()) return; try { LV().set(lkey(g.hub, g.mode), g.lvl.offerUp || nextUp(g.lvl.level)); } catch (e) {} g.lvl = null; render(); }

  function view() { const h = state.nav === 'hive' ? 'hive' : 'lore'; let g = G(); css();
    if (!g || g.hub !== h) { g = state.qz = { hub: h, mode: null, phase: 'hub' }; }
    setTimeout(mount, 0);
    if (!g.mode) return hubView(h);
    const back = top('qzBack', hubName(h));
    const mt = modeOf(h, g.mode).title;
    if (g.phase === 'loading') return back + stage(h, { hud: { left: backIn(h) + stat('getting ready', '…', '', 'timer'), center: title(mt, SHORT[mt]), right: stat('best', esc(bestTxt(h, g.mode).replace(/^Best: /, '') || '–'), '', 'trophy') + pad }, play: (W.hiveLoader ? hiveLoader('getting the questions ready…') : 'Loading…') });
    if (g.phase === 'empty') return back + stage(h, { hud: { left: backIn(h) + stat('questions', '0', '', 'target'), center: title(mt, SHORT[mt], chip(h, g.mode)), right: stat('best', esc(bestTxt(h, g.mode).replace(/^Best: /, '') || '–'), '', 'trophy') + pad },
      play: `<div class="qz-card sg-panel"><div class="qz-q">There are not enough questions at this level yet.</div><div class="qz-sub">Try another level on the chip above, or another mode.</div></div>`,
      controls: `<button class="qz-go" data-act="qzBack">All modes</button>` });
    if (g.phase === 'intro') return back + introView(g);
    if (g.phase === 'done') return back + doneView(g);
    return back + playView(g); }
  /* after each paint: the shared miss cards (SGUI.missQ / SGUI.miss) go into their hosts */
  function fit() { try { const st = document.querySelector('#root .qz-stage'); if (!st) return;
      const r = st.getBoundingClientRect(); const z = st.offsetHeight ? r.height / st.offsetHeight : 1;
      const bar = document.querySelector('.sb-tabbar'); const br = bar && bar.getClientRects().length ? bar.getBoundingClientRect() : null;
      const bottom = (br && br.height && br.top < innerHeight) ? br.top : innerHeight;
      const top = r.top + (window.scrollY || 0);   // where it sits with the page at the top
      const h = Math.max(380, Math.floor((bottom - top - 10) / (z || 1)));
      if (st.classList.contains('qz-hubst')) { st.style.minHeight = h + 'px'; return; }
      st.style.height = h + 'px'; } catch (e) {} }
  if (!W._qzFit) { W._qzFit = 1; window.addEventListener('resize', () => { if (state && (state.nav === 'lore' || state.nav === 'hive')) fit(); }); }
  function mount() { if (!kit()) fit(); const g = G(); if (!g || g.phase !== 'play') { if (g) dropKeys(g); return; } const q = curQ(g); if (!q) return;
    if (!(q.kind === 'origin' && q.stage === 'type')) dropKeys(g);
    /* the shared miss cards go on <body>: an app re-render (a lazy file landing, a toast) cannot take them
       away mid-read, and SGUI.held keeps every clock still until Continue (Enter or a tap) */
    try { if (W.SGUI && SGUI.missQ && !g.missH && q.kind !== 'origin' && isHeld(g, q)) { let h = null;
        h = SGUI.missQ(document.body, { q: q.prompt, a: q.opts[q.ans], f: q.fact }, q.opts[g.picked],
          { head: g.mode === 'ladder' ? 'The climb ends here. Here is the answer.' : undefined, onContinue: () => { if (G() === g && g.missH === h) { g.missH = null; cont(); } } });
        g.missH = h; } } catch (e) {}
    try { if (W.SGUI && SGUI.miss && !g.missH && q.kind === 'origin' && q.stage === 'done' && !q.ok && g.held) { let h = null;
        h = SGUI.miss(document.body, q.word, q.typed, { note: 'It came into English from ' + q.lang + '.' + (q.fact ? ' ' + q.fact : ''),
          onContinue: () => { if (G() === g && g.missH === h) { g.missH = null; cont(); } } });
        g.missH = h; } } catch (e) {}
    try { const host = document.getElementById('qz-keys'); if (host && !host.childElementCount && q.kind === 'origin' && q.stage === 'type' && kbd()) {
        const box = () => document.querySelector('[data-fkey="qzTyped"]'); const put = () => { const b = box(); if (b) b.value = g.typed || ''; };
        dropKeys(g);
        g.keys = SGUI.keys(host, { touch: true, onKey: (ch) => { g.typed = (g.typed || '') + ch; put(); }, onBack: () => { g.typed = String(g.typed || '').slice(0, -1); put(); }, onEnter: () => submitType() }); } } catch (e) {}
    try { if (W.liveScan) liveScan(document.body); } catch (e) {} }   // body: the kit's card lives outside #root
  /* a route away (family-shell dropLayers) takes the card with it */
  function drop() { const g = G(); if (g) { dropMiss(g); dropKeys(g); } }   // the round itself stays; a render back onto it re-opens the card

  /* ---- keys: 1–4 pick (1–9 a square), Enter continues — never while a sheet or the PIN is up ---- */
  function onKey(e) { try {
    if (!state || (state.nav !== 'lore' && state.nav !== 'hive') || state.screen !== 'app') return;
    if (state.settingsOpen || state.pinDlg || state.drawerOpen || state.walletOpen) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const g = G(); if (!g || !g.mode) return;
    const t = e.target; const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    if (typing) return;   // the Origins box handles its own Enter
    if (e.key === 'Enter') { if (t && t.tagName === 'BUTTON' && !t.closest('.qz-stage')) return;
      e.preventDefault(); cont(); return; }
    if (/^[1-9]$/.test(e.key) && g.phase === 'play') { const n = +e.key - 1;
      if (g.mode === 'squares' && g.sel == null) { e.preventDefault(); cell(n); return; }
      if (n <= 3) { e.preventDefault(); pick(n); } } } catch (err) {} }
  if (!W._qzKeys) { W._qzKeys = 1; window.addEventListener('keydown', onKey); }

  /* ------------------------------------------------------------------ styles (tokens only: day and dusk) */
  function css() { if (document.getElementById('qz-css')) return; const s = document.createElement('style'); s.id = 'qz-css'; s.textContent = `
.qz-top{display:flex;align-items:center;margin:0 auto 10px;max-width:1100px}
.qz-stage{position:relative;max-width:1100px;margin:0 auto;display:grid;grid-template-rows:auto minmax(0,1fr) auto;grid-template-columns:minmax(0,1fr);min-height:380px;border-radius:22px;overflow:hidden;isolation:isolate;background:var(--qz-bg);box-shadow:var(--sh-rest)}
.qz-stage[data-plate]{background:var(--qz-plate) center/cover no-repeat,var(--qz-bg)}
.qz-lore{--qz-bg:radial-gradient(120% 80% at 50% 0%,color-mix(in srgb,var(--treasure,#F0B429) 30%,var(--bg2)),transparent 70%),linear-gradient(180deg,color-mix(in srgb,#8A5B2A 26%,var(--bg2)),color-mix(in srgb,#5A3A1E 34%,var(--bg2)))}
.qz-hive{--qz-bg:radial-gradient(120% 80% at 50% 0%,color-mix(in srgb,#6A8BFF 34%,var(--bg2)),transparent 70%),linear-gradient(180deg,color-mix(in srgb,#1E2A5A 40%,var(--bg2)),color-mix(in srgb,#141A3A 52%,var(--bg2)))}
.qz-hud{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:10px;padding:10px clamp(12px,2.4vw,20px);background:color-mix(in srgb,var(--bg2) 88%,transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
.qz-hl{justify-self:stretch;min-width:0;text-align:left}.qz-hr{justify-self:stretch;min-width:0;text-align:right}.qz-hr .qz-stat{align-items:flex-end}.qz-hc{display:flex;align-items:center;gap:8px;justify-content:center;min-width:0}
.qz-title{font-family:var(--display);font-weight:800;font-size:clamp(16px,2.4vw,20px);white-space:nowrap}
.qz-stat{display:inline-flex;flex-direction:column;line-height:1.15}.qz-sk{font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.qz-sv{font-family:var(--display);font-weight:800;font-size:15px;font-variant-numeric:tabular-nums;color:var(--text)}.qz-sv.low{color:var(--bad)}
.qz-play{display:flex;flex-direction:column;align-items:center;justify-content:safe center;gap:12px;padding:clamp(10px,2.4vw,24px);min-height:0;overflow:auto}
.qz-hubst .qz-play{overflow:visible}
.qz-stage:not(.qz-hubst) .qz-play{container-type:size}
.qz-ctl{display:flex;flex-direction:column;align-items:center;gap:10px;padding:0 clamp(12px,3vw,24px) 16px}
.qz-ctl .qz-miss{width:min(760px,100%);margin-top:0}
.qz-stage .qz-card{background:color-mix(in srgb,var(--bg2) 88%,transparent);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
.qz-card{width:min(720px,100%);border:1px solid var(--line);border-radius:20px;padding:clamp(16px,3.4vw,28px);text-align:center;box-shadow:var(--glow,var(--sh-rest));color:var(--text)}
.qz-tag{display:inline-block;padding:3px 12px;border-radius:999px;background:color-mix(in srgb,var(--accent) 14%,transparent);color:var(--accent);font-weight:800;font-size:12px;margin-bottom:8px}
.qz-big{font-family:var(--display);font-weight:800;font-size:clamp(28px,6vw,44px);line-height:1.1;margin:4px 0}
.qz-q{font-size:clamp(16px,2.6vw,20px);font-weight:700;line-height:1.45}.qz-sub{color:var(--muted);font-weight:700;font-size:14px;margin:4px 0}
.qz-two{font-size:12px;color:var(--muted);margin-top:6px}
.qz-vis{display:flex;justify-content:center;margin:4px 0 8px}.qz-emo{font-size:clamp(52px,12vw,76px);line-height:1.1}
.qz-hear{display:inline-flex;align-items:center;gap:8px;margin:4px 0 10px;padding:10px 18px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:14px;box-shadow:var(--edge)}
.qz-hear.big{padding:13px 24px;font-size:16px}
.qz-opts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;width:min(760px,100%)}
@media (max-width:560px){.qz-opts{grid-template-columns:1fr}}
.qz-opt{display:flex;align-items:center;gap:10px;text-align:left;min-height:52px;padding:11px 14px;border-radius:14px;background:color-mix(in srgb,var(--surface2) 92%,transparent);border:2px solid var(--line);color:var(--text);font-family:var(--display);font-weight:800;font-size:15px;line-height:1.3}
.qz-opt.gone{visibility:hidden}.qz-opt.dim{opacity:.55}
.qz-opt.right{border-color:#1f9d57;background:color-mix(in srgb,#1f9d57 20%,var(--bg2))}.qz-opt.wrong{border-color:var(--bad);background:color-mix(in srgb,var(--bad) 16%,var(--bg2))}
.qz-k{flex:none;width:26px;height:26px;border-radius:8px;display:grid;place-items:center;background:var(--accent);color:#fff;font-size:13px}
.qz-ot{flex:1;min-width:0;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.qz-opt.long{font-family:var(--ui,inherit);font-weight:700;font-size:13.5px}.qz-mk{flex:none;display:inline-flex}
.qz-miss,.qz-ok,.qz-lang,.qz-line,.qz-sent,.qz-rival{margin-top:12px;border-radius:14px;padding:11px 14px;text-align:left;font-size:14px;line-height:1.5}
.qz-miss{background:var(--fix-tint,#FBE9E7);border:1.5px solid var(--fix,#C4453C);color:var(--text)}
.qz-mans{font-weight:800;display:flex;gap:6px;align-items:center;flex-wrap:wrap}.qz-mpick{font-size:12.5px;color:var(--muted);font-weight:700;margin-top:3px}
.qz-fact{margin-top:9px;background:var(--treasure-tint,#FFF3D6);border:1px solid var(--treasure,#F0B429);border-radius:12px;padding:10px 13px;color:var(--text);text-align:left;font-size:13.5px}
.qz-fact b{color:var(--treasure-deep,#8A5B00);display:inline-flex;gap:5px;align-items:center}
.qz-ok{background:color-mix(in srgb,#1f9d57 14%,var(--bg2));border:1.5px solid #1f9d57;font-weight:700}.qz-okh{display:inline-flex;align-items:center;gap:6px}
.qz-lang{display:flex;align-items:center;gap:7px;flex-wrap:wrap;justify-content:center}.qz-okf{display:block;font-weight:600;color:var(--muted);margin-top:4px}
.qz-lang.ok{background:color-mix(in srgb,#1f9d57 14%,var(--bg2));border:1.5px solid #1f9d57}.qz-lang.no{background:var(--fix-tint,#FBE9E7);border:1.5px solid var(--fix,#C4453C)}
.qz-go{display:inline-flex;align-items:center;justify-content:center;gap:8px;margin-top:10px;min-height:46px;padding:11px 24px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)}
.qz-go.alt{background:var(--surface2);color:var(--text);border:1px solid var(--line);box-shadow:none}.qz-go.big{padding:14px 34px;font-size:16px}
.qz-kb{font-size:11px;font-weight:800;padding:2px 7px;border-radius:6px;background:rgba(255,255,255,.22)}.qz-go.alt .qz-kb{background:var(--line)}
.qz-btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.qz-in{display:block;width:min(420px,100%);margin:10px auto 0;text-align:center;padding:14px;border-radius:14px;background:var(--surface);border:2px solid var(--line);color:var(--text);font-family:var(--entry,inherit);font-weight:700;font-size:clamp(20px,4.6vw,26px);letter-spacing:.12em;text-transform:lowercase;outline:none}
.qz-tiles{display:flex;flex-wrap:wrap;justify-content:center;gap:14px;width:min(1000px,100%)}
.qz-tile{position:relative;flex:0 0 calc((100% - 28px)/3);display:flex}
.qz-n7 .qz-tile{flex-basis:calc((100% - 42px)/4)}
@media (max-width:980px){.qz-n7 .qz-tile{flex-basis:calc((100% - 28px)/3)}}
@media (max-width:760px){.qz-tile,.qz-n7 .qz-tile{flex-basis:calc((100% - 14px)/2)}}
.qz-tile-go{position:relative;flex:1;display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px;padding:14px 10px 40px;border-radius:18px;background:color-mix(in srgb,var(--bg2) 88%,transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid var(--line);box-shadow:var(--sh-rest);color:var(--text);min-height:168px}
.qz-tile.last .qz-tile-go{border:2px solid var(--accent)}
.qz-art{display:inline-flex;line-height:0}.qz-tt{font-family:var(--display);font-weight:800;font-size:16px}.qz-tp{font-size:12.5px;color:var(--muted);line-height:1.35}
.qz-tb{font-size:12px;font-weight:800;color:var(--accent);margin-top:auto}
.qz-new{position:absolute;top:10px;right:10px;width:10px;height:10px;border-radius:50%;background:var(--accent)}
.qz-chip{position:absolute;left:50%;bottom:8px;transform:translateX(-50%)}
.qz-board{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;width:min(460px,100cqw,calc(100cqh - 64px))}
.qz-cell{position:relative;aspect-ratio:1;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:color-mix(in srgb,var(--bg2) 90%,transparent);border:2px solid var(--line);color:var(--text);box-shadow:var(--sh-rest);font-weight:800}
.qz-cell.s1{border-color:#1f9d57;background:color-mix(in srgb,#1f9d57 22%,var(--bg2));color:#B07A00}.qz-cell.s2{border-color:var(--bad);background:color-mix(in srgb,var(--bad) 14%,var(--bg2));color:var(--bad)}
.qz-cl{font-size:12px;color:var(--text);padding:0 4px}.qz-cn{position:absolute;top:6px;left:8px;font-size:11px;color:var(--muted)}
.qz-line{background:var(--treasure-tint,#FFF3D6);border:1.5px solid var(--treasure,#F0B429);font-weight:800;color:var(--text);text-align:center}
.qz-hint{font-size:13px;color:var(--muted);font-weight:700}
.qz-ladwrap{display:flex;align-items:center;justify-content:center;gap:16px;width:min(900px,100%)}
.qz-ladwrap .qz-card{flex:1}
.qz-comb{display:flex;flex-direction:column;gap:3px;flex:none}
.qz-rung{width:46px;height:min(30px,calc((100cqh - 30px)/12 - 3px));display:grid;place-items:center;clip-path:polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%);background:color-mix(in srgb,var(--bg2) 80%,transparent);color:var(--muted);font-weight:800;font-size:12px}
.qz-rung.mark{background:color-mix(in srgb,var(--treasure,#F0B429) 22%,var(--bg2))}
.qz-rung.done{background:var(--treasure,#F0B429);color:#4a3200}.qz-rung.on{background:var(--accent);color:#fff}
@media (max-width:640px){.qz-ladwrap{flex-direction:column-reverse;gap:8px}.qz-comb{flex-direction:row-reverse;flex-wrap:nowrap;justify-content:center;gap:2px}.qz-rung{width:22px;height:18px;font-size:9px}}
.qz-lls{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.qz-ll{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:9px 14px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:13px}
.qz-ll.used,.qz-ll:disabled{opacity:.5}.qz-exit{background:var(--bg2)}
.qz-sent{background:var(--surface);border:1px solid var(--line)}.qz-rival{display:flex;gap:10px;align-items:center;background:var(--surface);border:1px solid var(--line)}
.qz-rav{width:34px;height:34px;flex:none;display:inline-flex}
.qz-ths{display:flex;flex-wrap:wrap;gap:7px;justify-content:center;margin-top:10px}
.qz-th{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:6px 12px;border-radius:999px;background:var(--surface2);border:1.5px solid var(--line);color:var(--text);font-weight:800;font-size:12.5px}
.qz-th.on{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 16%,var(--bg2))}.qz-thic{display:inline-flex;line-height:0}
.qz-done .qz-dh{font-family:var(--display);font-weight:800;font-size:20px}.qz-db{font-family:var(--display);font-weight:800;font-size:clamp(34px,7vw,48px);color:var(--accent);line-height:1.1;margin:6px 0}
.qz-pay{display:inline-flex;align-items:center;gap:6px;margin-top:10px;padding:8px 15px;border-radius:999px;background:linear-gradient(135deg,#FFD24D,#F0A93C);color:#5a3d00;font-weight:900}
.qz-cnt{font-size:12.5px;color:var(--muted);font-weight:800}
.qz-nopay,.qz-lvl{margin-top:10px;font-size:13px;color:var(--muted);font-weight:700}
.qz-up{padding:9px 16px;border-radius:999px;background:var(--surface2);border:1.5px solid var(--accent);color:var(--accent);font-weight:800}
.qz-short{display:none}
.qz-kit .sg-st-region{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:safe center;gap:10px;overflow:auto}
.qz-ladcol{display:flex;flex-direction:column;align-items:center;gap:10px;width:100%}
.qz-back{flex:none;position:relative;width:34px;height:34px;margin-right:2px;border-radius:50%;display:grid;place-items:center;background:var(--surface2);border:1px solid var(--line);color:var(--text)}
.qz-back::after{content:"";position:absolute;inset:-6px}
.qz-ttl{display:inline-flex;align-items:center;gap:8px}.qz-ttl .qz-ts{display:none}
.qz-keys{width:100%}
.qz-pad{display:none;flex:none;width:34px;height:1px}
@media (max-width:640px){.qz-kit .sg-st-side .sg-st-stat{min-width:106px;justify-content:space-between}.qz-kit .sg-st-side .sg-st-ic{display:none}.qz-pad{display:block}.qz-ttl:has(.qz-ts) .qz-tl{display:none}.qz-ttl .qz-ts{display:inline}}
@media (max-width:560px){.qz-opt{min-height:46px;padding:8px 11px;font-size:14px}.qz-opt.long{font-size:13px}.qz-card{padding:12px 14px}.qz-hear{margin:2px 0 6px;padding:8px 14px}
  .qz-tag{display:none}.qz-long{display:none}.qz-short{display:inline}.qz-ll{padding:8px 10px;font-size:12.5px;gap:4px}.qz-lls{flex-wrap:nowrap;gap:6px}
  .qz-ot{-webkit-line-clamp:2}.qz-opts{gap:7px}.qz-sub{margin:2px 0}.qz-hear{padding:6px 12px;font-size:13px;margin:0 0 4px}.qz-tile-go{min-height:150px}.qz-hud{padding:8px 12px}.qz-big{font-size:clamp(24px,8vw,34px)}}
.qz-cart{display:inline-flex;line-height:0}
/* the level chip (SB_LEVEL.chip) is 94% white; seven of them on a phone hub are 2.5% pure white (T14) — on
   these two hubs it takes a warm paper tone instead */
.sb-stage[data-sb-stage="lore"] .sb-lvchip,.sb-stage[data-sb-stage="hive"] .sb-lvchip{background:color-mix(in srgb,var(--paper,#fff) 86%,var(--treasure,#F0B429) 14%)}
@media (max-width:640px){.qz-hear,.qz-up,.qz-th{min-height:44px}
  .qz-card{position:relative}.qz-card>.qz-hear:not(.big){position:absolute;top:6px;right:6px;min-width:44px;justify-content:center;padding:0 10px;margin:0}.qz-hlab{display:none}}
@media (prefers-reduced-motion:reduce){.qz-stage *{animation:none!important;transition:none!important}}`;
    document.head.appendChild(s); }

  /* ------------------------------------------------------------------ the doors */
  const API = { open, view, best: cardBest, start, finish, drop, modes: MODES, hubName,
    /* for the tests: the generators and the pay rule, so a bot can play them without a screen */
    _meaningRound: meaningRound, _originRound: originRound, _figRound: figRound, _trivDraw: trivDraw, _owed: owed, _words: words, _topical: topical, _posOf: posOf, _rivalSays: rivalSays, _G: G, _cur: () => curQ(G()),
    _ladder: (lv) => { const g = { hub: 'lore', mode: 'ladder' }; buildLadder(g, lv); return g.qs || []; } };
  window.SB_QHUB = API;
  /* the Play card's best line, for g-found's card: SB_QHUB_BEST('lore') → "Best: 8/10 · Roots" */
  window.SB_QHUB_BEST = cardBest;
  try { (W.SB_HUB_OPEN = W.SB_HUB_OPEN || {}).lore = (id) => app.openLore(id); W.SB_HUB_OPEN.hive = (id) => app.openHive(id); } catch (e) {}
  try {
    Object.assign(app, {
      qzPick: (a) => pick(a), qzGo: () => cont(), qzCell: (a) => cell(a), qzLife: (a) => life(a), qzHear: () => { const g = G(); if (g) speakCur(g); },
      qzStop: () => { const g = G(); if (g && g.mode === 'ladder' && g.phase === 'play' && g.picked == null) finish(g); },
      qzBack: () => leave(), qzTh: (a) => toggleTh(a), qzBegin: () => begin(), qzUp: () => up(),
      qzType: (v) => typeIn(v), qzKey: (e) => typeKey(e), qzSubmit: () => submitType() });
    if (typeof app.hubMode !== 'function') app.hubMode = (arg) => { const p = String(arg || '').split('/'); const f = (W.SB_HUB_OPEN || {})[p[0]]; if (f) f(p[1] || null); };
  } catch (e) {}
})();
