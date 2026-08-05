/* ============================================================
   TRAIL.js — The Word Atlas engine (the Word Atlas tab).
   ONE concept-first guided journey over SB_TRAIL (trail-data.js):
   a single continuous map — nine base acts, then the Advanced
   Rounds (the five expeditions), which unlock with the Advanced
   Pack ($49.99/yr). Map screen (world-themed acts, winding node
   path) → unit loop (Learn → Words → Practice → Quiz gate) →
   checkpoints every 4th unit → laps (band-capped difficulty).
   Hard gate 80% (90% in the Advanced Rounds).
   Word pools come from trail-map-data.js (lazy-loaded).
   Uses app3 globals: state, active, save, set, render, esc, escA,
   say, addCoins, sfx, burstConfetti, flash, wordFlash, SB_AVATAR,
   iconSVG, nkey. Registers actions on `app` and renders via the
   nav hook in app3 (nav === 'trail').
   ============================================================ */
(function () {
  const T = () => window.SB_TRAIL;
  const GUIDE = { meadow: 'honeypot', library: 'waggle', forum: 'bumble', elements: 'star', engine: 'drone', strait: 'nectar', junkyard: 'propolis', vibe: 'jester', stage: 'diva', warfield: 'queenhive', greysea: 'blossom' };
  const ACCENT = { meadow: ['#FFC23D', '#C8791B'], library: ['#6C4FE0', '#4A3AA0'], forum: ['#E06A3C', '#A8431F'], elements: ['#2E8FB8', '#1C6486'], engine: ['#C08A3E', '#8A5B00'], strait: ['#3E63D6', '#26409A'], junkyard: ['#F0A93C', '#B4711A'], vibe: ['#B14FC4', '#7A2F8C'], stage: ['#E8458C', '#A82563'], warfield: ['#D6353F', '#8E1D26'], greysea: ['#7E8AA0', '#4C566B'] };

  /* ---- compact world strips (drawn scenery for act banners) ---- */
  function strip(world, W, H) {
    const g = H * .82, glow = 'rgba(255,255,255,.85)', far = 'rgba(255,255,255,.25)', dk = 'rgba(20,12,40,.28)';
    const ground = `<path d="M0 ${g} Q ${W * .25} ${g - 14} ${W * .5} ${g} T ${W} ${g} L ${W} ${H} L 0 ${H} Z" fill="${dk}"/>`;
    const sun = `<circle cx="${W * .85}" cy="${H * .3}" r="16" fill="#FFD66B" opacity=".9"/>`;
    const S = {
      meadow: () => sun + [.15, .38, .6, .8].map((f, i) => `<g transform="translate(${W * f} ${g - 2})"><line x1="0" y1="0" x2="0" y2="-13" stroke="${glow}" stroke-width="2"/><circle cy="-17" r="5" fill="${['#FF9EBB', '#FFD66B', '#B9A6FF', '#9FE7D6'][i]}"/></g>`).join(''),
      library: () => [0, 1, 2, 3, 4, 5].map(i => `<rect x="${W * (.06 + i * .16)}" y="${H * .22}" width="${W * .1}" height="${g - H * .22}" rx="3" fill="rgba(255,255,255,${.18 + (i % 3) * .07})"/>`).join(''),
      forum: () => sun + [.15, .35, .55, .75, .92].map(f => `<g transform="translate(${W * f} 0)"><rect x="-7" y="${H * .3}" width="14" height="${g - H * .3}" fill="${far}"/><rect x="-11" y="${H * .26}" width="22" height="6" rx="2" fill="${glow}" opacity=".5"/></g>`).join(''),
      elements: () => `<path d="M${W * .5} ${H * .1} L ${W * .45} ${H * .45} L ${W * .5} ${H * .45} L ${W * .42} ${H * .8}" stroke="#FFD66B" stroke-width="5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>` + [.2, .7, .85].map((f, i) => `<g transform="translate(${W * f} ${H * .4}) rotate(${i * 20})"><path d="M0 -12 L10 -6 L10 6 L0 12 L-10 6 L-10 -6 Z" fill="${far}"/></g>`).join(''),
      engine: () => [[.2, .4, 15], [.45, .55, 10], [.75, .35, 19]].map(([f, y, r]) => `<g transform="translate(${W * f} ${H * y})">${[0, 45, 90, 135].map(a => `<rect x="${-r - 4}" y="-3" width="${2 * r + 8}" height="6" rx="2" transform="rotate(${a})" fill="${far}"/>`).join('')}<circle r="${r}" fill="${far}"/><circle r="${r * .4}" fill="${dk}"/></g>`).join(''),
      strait: () => sun + `<g transform="translate(${W * .6} ${g - 22})"><path d="M0 18 L0 -16" stroke="${glow}" stroke-width="3"/><path d="M0 -16 L22 3 L0 3 Z" fill="${glow}"/><path d="M-11 18 Q 0 27 11 18 Z" fill="${dk}"/></g>` + `<path d="M0 ${g - 8} ${[0, 1, 2, 3, 4, 5].map(i => `Q ${W * (i + .5) / 6} ${g - 16} ${W * (i + 1) / 6} ${g - 8}`).join(' ')}" stroke="rgba(255,255,255,.4)" stroke-width="2.5" fill="none"/>`,
      junkyard: () => [[.2, .18, 60], [.55, .26, 90], [.85, .14, 46]].map(([f, h2, w2]) => `<path d="M${W * f - w2} ${g} Q ${W * f} ${g - h2 * H} ${W * f + w2} ${g} Z" fill="${far}"/>`).join('') + `<circle cx="${W * .22}" cy="${g - 16}" r="10" fill="none" stroke="${glow}" stroke-width="4"/>`,
      vibe: () => [[.25, .4], [.6, .5], [.85, .3]].map(([f, y], i) => `<g transform="translate(${W * f} ${H * y})">${[13, 8, 3].map(r => `<circle r="${r}" fill="none" stroke="rgba(255,255,255,${.3 + i * .08})" stroke-width="3"/>`).join('')}</g>`).join(''),
      stage: () => `<path d="M${W * .4} 0 L${W * .3} ${g} L${W * .5} ${g} Z" fill="rgba(255,246,214,.35)"/><path d="M${W * .6} 0 L${W * .5} ${g} L${W * .7} ${g} Z" fill="rgba(255,246,214,.35)"/>` + [[.2, .3], [.8, .25], [.68, .55]].map(([f, y]) => `<path transform="translate(${W * f} ${H * y}) scale(.7)" d="M0 -10 L2.8 -3 L10 -3 L4.4 1.6 L6.6 9 L0 4.6 L-6.6 9 L-4.4 1.6 L-10 -3 L-2.8 -3 Z" fill="#FFD66B"/>`).join(''),
      warfield: () => [.25, .55, .8].map((f, i) => `<g transform="translate(${W * f} ${g - 2})"><line y2="-${26 + i * 8}" stroke="${glow}" stroke-width="3"/><path d="M0 -${26 + i * 8} L20 -${20 + i * 8} L0 -${14 + i * 8} Z" fill="${i === 1 ? '#F0B429' : 'rgba(255,255,255,.55)'}"/></g>`).join(''),
      greysea: () => [.32, .5, .68].map((y, i) => `<ellipse cx="${W * .5}" cy="${H * y}" rx="${W * .55}" ry="10" fill="rgba(255,255,255,${.14 + i * .07})"/>`).join('') + `<text x="${W * .3}" y="${H * .5}" font-size="26" fill="rgba(255,255,255,.35)" font-style="italic" font-family="Georgia">ə</text>`,
    };
    return (S[world] || S.meadow)() + ground;
  }
  /* Painted scenery, cut from the book series' own world strips (app-art/w-<world>-r<reg>.jpg,
     built by voice/pipeline/app-banners.py). Register 2 is golden hour for the base
     acts, register 3 dusk for the Advanced Rounds — the same maturity dial the books
     use, so the advanced half of the map reads darker on sight. The drawn SVG strip
     stays underneath as the gradient bed and as the fallback if art is missing. */
  const PAINTED = { meadow:1, library:1, forum:1, elements:1, engine:1, strait:1, junkyard:1,
    vibe:1, stage:1, warfield:1, greysea:1, origami:1, grandtrunk:1 };
  const banner = (world, h, reg) => { const [a, d] = ACCENT[world] || ACCENT.meadow;
    const bed = `<svg viewBox="0 0 400 ${h}" preserveAspectRatio="xMidYMax slice" style="position:absolute;inset:0;width:100%;height:100%"><defs><linearGradient id="tg-${world}${reg || 2}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${d}"/></linearGradient></defs><rect width="400" height="${h}" fill="url(#tg-${world}${reg || 2})"/>${strip(world, 400, h)}</svg>`;
    if (!PAINTED[world]) return bed;
    return bed + `<img src="app-art/w-${world}-r${reg || 2}.jpg" alt="" loading="lazy" decoding="async"
      style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">`; };
  /* The banner has to dissolve into the card rather than sit in a box — the scrim
     carries the act title and fades to the card's own paper at the bottom edge. */
  const scrim = () => `<span style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,9,32,.42) 0%,rgba(14,9,32,.05) 34%,rgba(14,9,32,.22) 62%,var(--bg2) 100%)"></span>`;

  /* ---- state helpers ---- */
  const tr = c => c.trail || (c.trail = { lap: 1, done: {}, chk: {}, seen: {}, elap: 1, edone: {}, echk: {} });
  /* Both courses live on ONE map now; the active course follows the unit being
     worked (x-prefixed ids are Advanced Rounds), set by the unit/checkpoint actions. */
  const course = () => state.trailCourse === 'exp' ? 'exp' : 'honey';
  const courseOfId = id => (String(id || '')[0] === 'x') ? 'exp' : 'honey';
  const advOn = () => { try { return !!(window.ADV && ADV.active && ADV.active()); } catch (e) { return false; } };
  const unitsOf = tab => tab === 'exp' ? T().expedition.units : T().honey.units;
  const actsOf = tab => tab === 'exp' ? T().expedition.expeds : T().honey.acts;
  const unit = id => unitsOf(course()).find(u => u.id === id);
  const chOf = u => u.neu ? u.chapter : (u.ai != null ? (window.SB_ADV_CONCEPTS.chapters[u.ai]) : (window.SB_CONCEPTS.chapters[u.gi]));
  const lapOf = c => course() === 'exp' ? tr(c).elap : tr(c).lap;
  const doneMap = c => course() === 'exp' ? tr(c).edone : tr(c).done;
  const chkMap = c => course() === 'exp' ? tr(c).echk : tr(c).chk;
  const gate = () => course() === 'exp' ? (T().rules.expeditionGate || .9) : (T().rules.gate || .8);
  function availableIn(u, lap) { if (course() === 'exp') return lap === 1 || !!(doneMap(active())[u.id] || {})[lap - 1] === false ? lap === 1 : true; return (u.laps || [u.lap || 1]).includes(lap); }
  function seq(c) { // ordered nodes for the current lap: units + checkpoint markers every 4th
    const lap = lapOf(c); const out = [];
    for (const act of actsOf(course())) {
      let n = 0;
      for (const id of act.units) { const u = unit(id);
        if (course() === 'honey' && !(u.laps || [u.lap || 1]).includes(lap)) continue;
        out.push({ kind: 'unit', u, act: act.id }); n++;
        if (n % (T().rules.checkpointEvery || 4) === 0) out.push({ kind: 'chk', id: act.id + ':' + n, act: act.id });
      }
    }
    return out;
  }
  const passedNode = (c, node) => node.kind === 'unit' ? !!(doneMap(c)[node.u.id] || {})[lapOf(c)] : !!chkMap(c)[lapOf(c) + ':' + node.id];
  function frontier(c) { const s = seq(c); for (let i = 0; i < s.length; i++) if (!passedNode(c, s[i])) return i; return s.length; }

  /* ---- word pools ---- */
  let _idx = null;
  function widx() { if (_idx) return _idx; _idx = new Map();
    for (const w of ((window.SB_DATA && SB_DATA.nsf) || [])) if (w && w.w) _idx.set(nkey(w.w), w);
    return _idx; }
  function needMap(cb) { if (window.SB_TRAIL_MAP) { cb(); return; }
    if (needMap._p) { needMap._q.push(cb); return; }
    needMap._p = true; needMap._q = [cb];
    const s2 = document.createElement('script'); s2.src = 'trail-map-data.js?v=trail1';
    s2.onload = () => { needMap._q.forEach(f => { try { f(); } catch (e) {} }); needMap._p = false; };
    s2.onerror = () => { needMap._p = false; flash('Could not load the Word Atlas word pools'); };
    document.head.appendChild(s2); }
  function lapWords(u, lap, cap) { // records for this unit at this lap
    const rec = k => widx().get(k);
    if (course() === 'exp' || u.kind === 'lesson' || u.neu || !window.SB_TRAIL_MAP) {
      const ws = (chOf(u).words || []).map(x => ({ w: x.w, d: x.def || '', s: x.ex || '', p: x.say || '', o: '', h: x.hook || '' }));
      return cap ? ws.slice(0, cap) : ws;
    }
    const pool = (SB_TRAIL_MAP[u.id] || {})[lap] || [];
    const c = active(); const seenK = u.id + ':' + lap; const off = (tr(c).seen[seenK] || 0);
    const slice = []; for (let i = 0; i < pool.length && slice.length < (cap || 24); i++) {
      const r = rec(pool[(off + i) % pool.length]); if (r) slice.push({ w: r.w, d: r.d || '', s: r.s || '', p: r.p || '', o: r.o || '', h: r.h || '' }); }
    // always lead with the chapter's teaching words that sit in this band
    const teach = (chOf(u).words || []).map(x => ({ w: x.w, d: x.def || '', s: x.ex || '', p: x.say || '', o: '', h: x.hook || '' }));
    const seen2 = new Set(slice.map(x => nkey(x.w)));
    return teach.filter(x => !seen2.has(nkey(x.w))).slice(0, 6).concat(slice).slice(0, cap || 24);
  }

  /* ---- quiz assembly ---- */
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t2 = a[i]; a[i] = a[j]; a[j] = t2; } return a; };
  function buildQuiz(u) {
    const items = [];
    for (const q of (u.qs || []).slice(0, 4)) { const opts = q.c.map((c2, i) => ({ c: c2, ok: i === 0 })); shuffle(opts);
      items.push({ ty: 'mc', q: q.q, opts, ans: opts.findIndex(o => o.ok) }); }
    const ws = shuffle(lapWords(u, lapOf(active()), 40).slice());
    ws.slice(0, 8).forEach(w => items.push({ ty: 'spell', w: w.w, d: w.d }));
    const withDef = ws.filter(x => x.d && x.d.length > 8);
    withDef.slice(0, 3).forEach(w => { const dec = shuffle(withDef.filter(x => x.w !== w.w).slice()).slice(0, 3).map(x => (x.d || '').slice(0, 110));
      if (dec.length >= 2) { const opts = [{ c: (w.d || '').slice(0, 110), ok: true }].concat(dec.map(d2 => ({ c: d2, ok: false }))); shuffle(opts);
        items.push({ ty: 'mean', q: 'Which meaning fits “' + w.w + '”?', opts, ans: opts.findIndex(o => o.ok) }); } });
    return shuffle(items).slice(0, 15);
  }
  function buildCheckpoint(c, node) {
    const s = seq(c); const i = s.findIndex(n => n.kind === 'chk' && n.id === node.id);
    const prevU = s.slice(0, i).filter(n => n.kind === 'unit').slice(-3).map(n => n.u);
    const items = [];
    for (const u of prevU) { const ws = shuffle(lapWords(u, lapOf(c), 20).slice()).slice(0, 3);
      ws.forEach(w => items.push({ ty: 'spell', w: w.w, d: w.d }));
      const q = (u.qs || [])[0]; if (q) { const opts = q.c.map((c2, k) => ({ c: c2, ok: k === 0 })); shuffle(opts);
        items.push({ ty: 'mc', q: q.q, opts, ans: opts.findIndex(o => o.ok) }); } }
    return shuffle(items).slice(0, 12);
  }

  /* ---- actions ---- */
  const app2 = app;   /* app3's top-level const — global lexical scope, not window */
  /* trail-data.js is deferred until after first paint, so opening the Atlas early
     asks boot-lazy for it and lands on the map the moment it arrives. */
  app2.openTrail = () => {
    const go = () => set({ nav: 'trail', screen: 'app', trailView: 'map', trailCourse: 'honey', conceptSel: null, tq: null });
    if (T()) { go(); return; }
    if (window.SB_LAZY) { SB_LAZY.need('atlas', () => { if (T()) go(); else flash('Could not load the Word Atlas curriculum'); }); return; }
    flash('The Word Atlas data is still loading'); };
  app2.trailUnit = id => { const c = active();
    const crs = courseOfId(id);
    if (crs === 'exp' && !advOn()) { app2.openAdvanced ? app2.openAdvanced() : flash('The Advanced Rounds come with the Advanced Pack'); return; }
    state.trailCourse = crs;
    const s = seq(c); const i = s.findIndex(n => n.kind === 'unit' && n.u.id === id);
    if (i > frontier(c)) { flash('Locked — clear the earlier stops first'); return; }
    set({ trailView: 'unit', trailUnit: id, tq: null }); };
  app2.trailChk = arg => { const c = active();
    /* checkpoint args carry their course: "honey|meadow:4" / "exp|proving:4" */
    const [crs, id] = String(arg).indexOf('|') >= 0 ? String(arg).split('|') : ['honey', String(arg)];
    if (crs === 'exp' && !advOn()) { app2.openAdvanced ? app2.openAdvanced() : flash('The Advanced Rounds come with the Advanced Pack'); return; }
    state.trailCourse = crs === 'exp' ? 'exp' : 'honey';
    const s = seq(c); const i = s.findIndex(n => n.kind === 'chk' && n.id === id);
    if (i > frontier(c)) { flash('Locked — clear the earlier stops first'); return; }
    const items = buildCheckpoint(c, { id });
    set({ trailView: 'quiz', trailUnit: null, trailChk: id, tq: { items, i: 0, score: 0, picked: null, typed: '', missed: [], over: false } }); };
  app2.trailBack = () => set({ trailView: 'map', tq: null });
  app2.trailLesson = () => { const u = unit(state.trailUnit); const ch = chOf(u);
    state.trailReturn = u.id;
    state.nav = 'concepts';
    if (u.gi >= 0) { try { loadConcepts(); } catch (e) {} app2.openConcept(u.gi); return; }
    try { clearAnimTimer(); } catch (e) {}
    state.conceptSel = ch; state.conceptStep = 0; state.conceptWordsOpen = false; state.animOn = false; render(); };
  app2.trailWords = () => { const u = unit(state.trailUnit);
    needMap(() => { const c = active(); const ws = lapWords(u, lapOf(c), 24);
      state.sessionWords = ws.map(x => ({ w: x.w, d: x.d, s: x.s, p: x.p, o: '', r: x.h }));
      set({ trailView: 'words', trailWordIdx: 0 }); }); };
  app2.trailWordNav = d => { const n = (state.trailWordsN || 1);
    const step = d === 'next' ? 1 : d === 'prev' ? -1 : (+d || 0);
    set({ trailWordIdx: Math.max(0, Math.min(n - 1, (state.trailWordIdx || 0) + step)) }); };
  app2.trailPractice = () => { const u = unit(state.trailUnit); const c = active();
    needMap(() => { const ws = lapWords(u, lapOf(c), 24);
      if (!ws.length) { flash('No words here yet'); return; }
      tr(c).seen[u.id + ':' + lapOf(c)] = ((tr(c).seen[u.id + ':' + lapOf(c)] || 0) + ws.length) % 997; save();
      state.trailReturn = u.id;
      state.sessionWords = ws.map(x => ({ w: x.w, d: x.d, s: x.s, p: x.p, o: '', r: x.h }));
      state.sessionLabel = u.title.split('—')[0].trim(); state.gi = 0; app2.startTrain(); }); };
  app2.trailQuiz = () => { const u = unit(state.trailUnit);
    needMap(() => set({ trailView: 'quiz', trailChk: null, tq: { items: buildQuiz(u), i: 0, score: 0, picked: null, typed: '', missed: [], over: false } })); };
  app2.tqPick = i => { const q2 = state.tq; if (!q2 || q2.over || q2.picked != null) return; const it = q2.items[q2.i];
    q2.picked = +i; if (+i === it.ans) q2.score++; else q2.missed.push(it);
    render(); };
  app2.tqSpell = () => { const q2 = state.tq; if (!q2 || q2.over || q2.picked != null) return; const it = q2.items[q2.i];
    const ok = nkey(state.tqTyped || '') === nkey(it.w); q2.picked = ok ? 1 : 0; q2.right = ok;
    if (ok) q2.score++; else q2.missed.push(it);
    render(); };
  app2.tqSay = () => { const it = state.tq && state.tq.items[state.tq.i]; if (it && it.w) say(it.w); };
  app2.tqNext = () => { const q2 = state.tq; if (!q2 || q2.picked == null) return;
    state.tqTyped = '';
    if (q2.i + 1 >= q2.items.length) { q2.over = true; finishQuiz(); } else { q2.i++; q2.picked = null; }
    render(); };
  function finishQuiz() { const c = active(); const q2 = state.tq; const pct = q2.items.length ? q2.score / q2.items.length : 0;
    q2.pct = pct; q2.pass = pct >= gate();
    if (q2.pass) { addCoins(15); try { sfx('win'); burstConfetti(60); } catch (e) {}
      if (state.trailChk) chkMap(c)[lapOf(c) + ':' + state.trailChk] = Math.round(pct * 100);
      else { const u = unit(state.trailUnit); (doneMap(c)[u.id] = doneMap(c)[u.id] || {})[lapOf(c)] = Math.round(pct * 100); }
      // lap complete?
      const s = seq(c); if (s.every(n => passedNode(c, n))) { if (course() === 'exp') tr(c).elap = Math.min(3, tr(c).elap + 1); else tr(c).lap = Math.min(3, tr(c).lap + 1); q2.lapUp = true; try { burstConfetti(140); } catch (e) {} }
      save(); }
  }
  app2.tqRevise = () => { const q2 = state.tq; if (!q2) return;
    set({ tq: { items: shuffle(q2.missed.slice()), i: 0, score: 0, picked: null, typed: '', missed: [], over: false, revising: true } }); };
  app2.tqInput = v => { state.tqTyped = String(v == null ? '' : v); };

  /* ---- views ---- */
  /* A stop on the map. Three states with three different silhouettes, so which
     one you can play is obvious at arm's length: a cleared stop is a gold hex
     with a star, the stop you are on is a lit hex with a halo and the speller's
     own avatar standing on it, and everything ahead is a flat unlit hex with a
     lock. The chrome is a world-tinted gradient with a top gloss and an inner
     rim, which is what stops it looking like a flat sticker. */
  function hexChrome(world, i, kind, uid) {
    const [a, d] = ACCENT[world] || ACCENT.meadow;
    const S = 60, cx = S / 2;
    const path = 'M30 2.5 L55 16.5 L55 43.5 L30 57.5 L5 43.5 L5 16.5 Z';
    const fill = kind === 'passed' ? ['#FFD24D', '#C8791B']
      : kind === 'cur' ? [a, d]
      : ['var(--surface2)', 'var(--surface2)'];
    const g = 'hx' + uid;
    return `<svg viewBox="0 0 ${S} ${S}" style="position:absolute;inset:0;overflow:visible">
      <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${fill[0]}"/><stop offset="1" stop-color="${fill[1]}"/></linearGradient>
        <linearGradient id="${g}g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="rgba(255,255,255,.55)"/><stop offset=".55" stop-color="rgba(255,255,255,0)"/></linearGradient></defs>
      ${kind === 'cur' ? `<path d="${path}" fill="${a}" opacity=".28" transform="translate(${cx} ${cx}) scale(1.34) translate(${-cx} ${-cx})"/>` : ''}
      <path d="${path}" fill="url(#${g})"/>
      <path d="${path}" fill="url(#${g}g)"/>
      <path d="${path}" fill="none" stroke="${kind === 'locked' ? 'var(--line)' : 'rgba(255,255,255,.5)'}" stroke-width="1.6"/>
      ${kind === 'cur' ? `<path d="${path}" fill="none" stroke="var(--treasure,#FFD24D)" stroke-width="3" transform="translate(${cx} ${cx}) scale(1.1) translate(${-cx} ${-cx})"/>` : ''}
    </svg>`;
  }
  let _hx = 0;
  function nodeHTML(c, node, i, fr, world) {
    const passed = passedNode(c, node); const isCur = i === fr; const locked = i > fr;
    const left = i % 2 === 0;
    /* Every row is the same full-width strip so the scores line up in one column;
       only the hex slides left or right, which is what makes the route wind. */
    const base = `position:relative;display:flex;align-items:center;gap:13px;width:100%;margin:${i ? '13px' : '2px'} 0 0;z-index:2;`;
    const hexPad = left ? 'margin-left:2%' : 'margin-left:24%';
    const kind = passed ? 'passed' : isCur ? 'cur' : 'locked';
    const label = (t, sub, score) => `<span style="min-width:0;flex:1">
        <span style="display:block;font-family:var(--display);font-weight:800;font-size:14px;line-height:1.22;color:${locked ? 'var(--muted)' : 'var(--text)'}">${t}</span>
        <span style="display:block;font-size:11.5px;color:var(--muted);font-weight:600;margin-top:1px">${sub}</span></span>`
      + (score ? `<span style="flex-shrink:0;font-family:var(--display);font-variant-numeric:tabular-nums;font-weight:800;font-size:12px;padding:4px 11px;border-radius:999px;background:var(--chip);color:var(--good)">${score}</span>` : '')
      + (isCur ? `<span style="flex-shrink:0;font-family:var(--display);font-weight:800;font-size:12px;padding:5px 13px;border-radius:999px;background:var(--accent);color:#fff;white-space:nowrap">Play &rarr;</span>` : '');
    const rider = isCur
      ? `<span style="position:absolute;left:50%;bottom:calc(100% - 6px);transform:translateX(-50%);width:38px;height:38px;animation:sb-bee-bob 1.6s ease-in-out infinite;filter:drop-shadow(0 3px 5px rgba(20,14,44,.34))">${(window.SB_AVATAR ? SB_AVATAR(c.avatar || 'bizzy', 38) : '🐝')}</span>`
      : '';
    if (node.kind === 'chk') {
      const uid = 'k' + (_hx++);
      return `<button data-act="trailChk" data-arg="${escA(course() + '|' + node.id)}" class="sb-lift" style="${base}text-align:left">
        <span style="width:60px;height:60px;flex-shrink:0;position:relative;display:grid;place-items:center;${hexPad}">
          ${hexChrome(world, i, kind, uid)}
          <span style="position:relative;color:${locked ? 'var(--muted)' : '#fff'};display:grid;place-items:center">${passed ? '<span style="font-size:19px">✓</span>' : iconSVG('target', 22)}</span>
          ${rider}</span>
        ${label('Checkpoint', passed ? 'cleared' : locked ? 'locked' : 'mixed quiz — no new words', passed ? (chkMap(c)[lapOf(c) + ':' + node.id] || 0) + '%' : '')}</button>`;
    }
    const u = node.u; const stars = (doneMap(c)[u.id] || {});
    const short = u.title.split('—')[0].trim();
    const uid = 'u' + (_hx++);
    const tag = u.kind === 'lesson' || course() === 'exp' ? 'lesson' : 'word family';
    return `<button data-act="trailUnit" data-arg="${escA(u.id)}" class="sb-lift" style="${base}text-align:left">
      <span style="width:60px;height:60px;flex-shrink:0;position:relative;display:grid;place-items:center;${hexPad}">
        ${hexChrome(world, i, kind, uid)}
        <span style="position:relative;color:${locked ? 'var(--muted)' : '#fff'};font-family:var(--display);font-weight:800;font-size:${passed ? '19px' : '16px'};text-shadow:${locked ? 'none' : '0 1px 2px rgba(20,14,44,.35)'}">${passed ? '★' : locked ? iconSVG('lock', 17) : (i + 1)}</span>
        ${rider}</span>
      ${label(esc(short), tag, passed ? stars[lapOf(c)] + '%' : '')}</button>`;
  }
  /* A progress ring, because "0/13" tells a nine-year-old nothing at a glance. */
  function ring(done, total, col, size) {
    const R = (size - 6) / 2, C = 2 * Math.PI * R, pct = total ? done / total : 0;
    return `<span style="position:relative;display:inline-grid;place-items:center;width:${size}px;height:${size}px;flex-shrink:0">
      <svg viewBox="0 0 ${size} ${size}" style="position:absolute;inset:0;transform:rotate(-90deg)">
        <circle cx="${size / 2}" cy="${size / 2}" r="${R}" fill="rgba(10,6,26,.34)" stroke="rgba(255,255,255,.3)" stroke-width="3"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${R}" fill="none" stroke="${col}" stroke-width="3.4"
          stroke-linecap="round" stroke-dasharray="${(C * pct).toFixed(1)} ${C.toFixed(1)}"/></svg>
      <span style="position:relative;font-family:var(--display);font-variant-numeric:tabular-nums;font-weight:800;font-size:11px;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.6)">${done}/${total}</span></span>`;
  }

  /* The travelled route is drawn as one continuous track behind the stops: the
     part already walked is a solid lit line, the rest a faint dashed one. It is
     the difference between a map you are moving across and a list of buttons. */
  function trackSVG(nodes, c, fr, col) {
    const STEP = 86, x = k => (k % 2 === 0 ? 12 : 44), y = k => k * STEP + 30;
    /* Two explicit paths rather than one dashed at a fraction: a segment is lit
       only when both stops it joins are cleared, so the gold stops exactly where
       the speller stopped. */
    let walkedD = '', aheadD = '';
    for (let k = 1; k < nodes.length; k++) {
      const x0 = x(k - 1), y0 = y(k - 1), x1 = x(k), y1 = y(k);
      const seg = `M ${x0} ${y0} C ${x0 + (x1 - x0) * .1} ${y0 + STEP * .48}, ${x1 - (x1 - x0) * .1} ${y1 - STEP * .48}, ${x1} ${y1} `;
      if (passedNode(c, nodes[k].n) && passedNode(c, nodes[k - 1].n)) walkedD += seg; else aheadD += seg;
    }
    if (!walkedD && !aheadD) return '';
    const H = nodes.length * STEP;
    return `<svg style="position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none" preserveAspectRatio="none" viewBox="0 0 100 ${H}">
      ${aheadD ? `<path d="${aheadD}" stroke="var(--line)" stroke-width="2.6" stroke-dasharray="2 7" stroke-linecap="round" fill="none"/>` : ''}
      ${walkedD ? `<path d="${walkedD}" stroke="${col}" stroke-width="3.6" stroke-linecap="round" fill="none" opacity=".9"/>` : ''}</svg>`;
  }

  /* one course's run of act sections (assumes state.trailCourse === crs) */
  function actSections(c, crs) {
    const s = seq(c); const fr = frontier(c);
    const reg = crs === 'exp' ? 3 : 2;
    let acts = '';
    for (const act of actsOf(crs)) {
      const nodes = s.map((n, i) => ({ n, i })).filter(x => x.n.act === act.id);
      if (!nodes.length) continue;
      const world = act.world; const guide = GUIDE[world] || 'honeypot';
      const [a] = ACCENT[world] || ACCENT.meadow;
      const dn = nodes.filter(x => passedNode(c, x.n)).length;
      const here = nodes.some(x => x.i === fr);
      /* The banner dissolves into the body: no inner border, no second box —
         the act reads as one painted card with its own weather. */
      acts += `<section style="position:relative;border-radius:22px;overflow:hidden;margin-bottom:18px;background:var(--bg2);
          box-shadow:0 0 0 1px ${here ? `color-mix(in srgb,${a} 55%,var(--line))` : 'var(--line)'},var(--sh-rest)">
        <div style="position:relative;height:118px">
          ${banner(world, 118, reg)}${scrim()}
          <div style="position:absolute;left:15px;right:15px;bottom:11px;display:flex;align-items:flex-end;gap:11px">
            <span style="width:52px;height:52px;flex-shrink:0;filter:drop-shadow(0 3px 6px rgba(14,9,32,.45))">${window.SB_AVATAR ? SB_AVATAR(guide, 52, { dark: true }) : ''}</span>
            <span style="min-width:0;flex:1">
              <span style="display:block;font-family:var(--display);font-weight:800;font-size:17.5px;line-height:1.1;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.55)">${esc(act.title)}</span>
              <span style="display:block;font-size:11.5px;font-weight:700;color:rgba(255,255,255,.86);text-shadow:0 1px 4px rgba(0,0,0,.6);margin-top:2px">${here ? 'you are here' : dn === nodes.length ? 'cleared' : dn ? 'in progress' : 'ahead'}</span></span>
            ${ring(dn, nodes.length, dn === nodes.length ? 'var(--good)' : '#FFD24D', 44)}
          </div></div>
        <div style="position:relative;padding:10px 12px 16px">
          ${trackSVG(nodes, c, fr, a)}
          ${nodes.map(x => nodeHTML(c, x.n, x.i, fr, world)).join('')}
        </div></section>`;
    }
    const total = s.length, done = s.filter(n => passedNode(c, n)).length;
    return { acts, total, done, lap: lapOf(c) };
  }
  const tierBar = (lap, done, total) => `<div style="display:flex;align-items:center;gap:12px;background:var(--bg2);border-radius:16px;padding:12px 16px;margin-bottom:16px;box-shadow:0 0 0 1px var(--line)">
        <span style="font-family:var(--display);font-weight:800;font-size:13px;background:var(--chip);color:var(--accent);border-radius:999px;padding:5px 13px">Tier ${lap} of 3</span>
        <div style="flex:1;height:9px;border-radius:999px;background:var(--surface2);overflow:hidden"><div style="height:100%;background:linear-gradient(90deg,var(--accent),var(--treasure));width:${Math.round(done / Math.max(1, total) * 100)}%"></div></div>
        <span style="font-size:12px;font-weight:800;color:var(--muted)">${done}/${total} stops</span></div>`;
  function viewMap() {
    const c = active();
    /* section 1 — the base route */
    state.trailCourse = 'honey';
    const h = actSections(c, 'honey');
    /* section 2 — the Advanced Rounds (the five expeditions), Advanced Pack territory */
    state.trailCourse = 'exp';
    const expOk = advOn();
    const x = expOk ? actSections(c, 'exp') : null;
    state.trailCourse = 'honey';
    const price = (window.ADV && ADV.price) ? ADV.price() : 49.99;
    const advHead = `<div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin:26px 0 12px">
        <span style="font-family:var(--display);font-weight:800;font-size:19px">${esc(T().names.expedition)}</span>
        <span style="font-size:10.5px;font-weight:800;letter-spacing:.08em;color:#fff;background:linear-gradient(135deg,#37415B,#1F2A44);border-radius:999px;padding:4px 11px">90% GATES</span>
        <span style="font-size:12px;color:var(--muted);font-weight:600">national-level expeditions — same map, harder rules</span></div>`;
    const advPart = expOk
      ? advHead + tierBar(x.lap, x.done, x.total) + x.acts
      : advHead + `<button data-act="openAdvanced" style="width:100%;text-align:left;background:var(--bg2);border-radius:18px;padding:22px 24px;box-shadow:0 0 0 1px var(--line);display:flex;align-items:center;gap:16px;flex-wrap:wrap">
          <span style="display:inline-grid;place-items:center;width:52px;height:52px;border-radius:15px;background:linear-gradient(135deg,#37415B,#1F2A44);color:#fff;flex-shrink:0">${iconSVG('target', 26)}</span>
          <span style="min-width:0;flex:1"><span style="display:block;font-family:var(--display);font-weight:800;font-size:16px">43 expert stops across five expeditions</span>
          <span style="display:block;font-size:13px;color:var(--muted);margin-top:3px">The hardest chapters in the library — 90% gates, no mercy, national-level words. Unlocks with the Advanced Pack.</span></span>
          <span style="flex-shrink:0;padding:10px 17px;border-radius:11px;background:var(--accent);color:#fff;font-weight:800;font-size:13px;white-space:nowrap">Unlock · $${price}/yr →</span></button>`;
    return `<div style="animation:sb-rise .35s ease both;max-width:660px;margin:0 auto">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px">
        <span style="font-family:var(--display);font-weight:800;font-size:22px">${esc(T().names.honey)}</span>
        <button data-act="setNav" data-arg="concepts" style="margin-left:auto;display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:12.5px;color:var(--text)">${iconSVG('grid', 14)} Chapter shelf</button></div>
      ${tierBar(h.lap, h.done, h.total)}
      ${h.lap === 1 ? `<p style="font-size:12.5px;color:var(--muted);font-weight:600;margin:-6px 0 14px 4px">Tier 1 keeps every word at your level — the same route returns tougher at Tier 2. Concepts first; the words follow.</p>` : ''}
      ${h.acts}
      ${advPart}
    </div>`;
  }
  function viewUnit() {
    const c = active(); const u = unit(state.trailUnit); if (!u) return viewMap();
    const ch = chOf(u); const lap = lapOf(c);
    const act = actsOf(course()).find(a => a.id === u.act); const world = act ? act.world : 'meadow';
    const guide = GUIDE[world] || 'honeypot';
    const passed = (doneMap(c)[u.id] || {})[lap];
    const gsvg = window.SB_AVATAR ? `<span style="width:64px;height:64px;flex-shrink:0;display:block">${SB_AVATAR(guide, 64)}</span>` : '';
    const stepCard = (n, title, sub, act2, done2, cta) => `<div style="display:flex;align-items:center;gap:13px;background:var(--bg2);border-radius:16px;padding:13px 15px;box-shadow:0 0 0 1px var(--line),var(--sh-rest)">
      <span style="width:38px;height:38px;flex-shrink:0;display:grid;place-items:center;border-radius:11px;background:${done2 ? 'var(--good)' : 'var(--chip)'};color:${done2 ? '#fff' : 'var(--accent)'};font-family:var(--display);font-weight:800">${done2 ? '✓' : n}</span>
      <span style="min-width:0;flex:1"><span style="display:block;font-family:var(--display);font-weight:800;font-size:14.5px">${title}</span>
      <span style="font-size:12px;color:var(--muted);font-weight:600">${sub}</span></span>
      <button data-act="${act2}" style="flex-shrink:0;padding:9px 16px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:12.5px">${cta}</button></div>`;
    return `<div style="animation:sb-rise .35s ease both;max-width:640px;margin:0 auto">
      <div style="position:relative;border-radius:20px;overflow:hidden;margin-bottom:14px;height:112px">${banner(world, 112, course() === 'exp' ? 3 : 2)}${scrim()}
        <button data-act="trailBack" style="position:absolute;left:12px;top:10px;color:#fff;font-weight:800;font-size:12.5px;background:rgba(0,0,0,.3);border-radius:999px;padding:5px 12px">← Map</button>
        <div style="position:absolute;left:16px;bottom:10px;right:16px;display:flex;align-items:baseline;gap:10px">
          <span style="font-family:var(--display);font-weight:800;font-size:18px;color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.4);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(u.title)}</span>
          <span style="margin-left:auto;flex-shrink:0;font-size:11px;font-weight:800;color:#fff;background:rgba(0,0,0,.3);border-radius:999px;padding:3px 10px">Tier ${lap}${passed ? ' · ' + passed + '%' : ''}</span></div></div>
      <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:14px">${gsvg}
        <div style="position:relative;background:var(--bg2);border:1px solid var(--line);border-radius:16px;padding:11px 14px;font-size:13.5px;line-height:1.5;box-shadow:var(--sh-rest)">${esc(String(ch.concept || '').split(/(?<=[.!?])\s/).slice(0, 2).join(' '))}</div></div>
      <div style="display:grid;gap:10px">
        ${stepCard(1, 'Learn the idea', 'The full chapter — cards, method' + (u.gi >= 0 ? ', narration' : ''), 'trailLesson', false, 'Open')}
        ${stepCard(2, 'Meet the words', 'Flip through this stop’s words', 'trailWords', false, 'Browse')}
        ${stepCard(3, 'Practice', 'Say it, spell it out loud, type it', 'trailPractice', false, 'Train')}
        ${stepCard(4, 'The Quiz', 'Concept + spelling + meaning · ' + Math.round(gate() * 100) + '% wins the stop', 'trailQuiz', !!passed, passed ? 'Again' : 'Go!')}
      </div>
      <p style="font-size:12px;color:var(--muted);font-weight:600;margin-top:12px;text-align:center">The quiz is the gate — everything else is how you win it.</p>
    </div>`;
  }
  function viewWords() {
    const c = active(); const u = unit(state.trailUnit); if (!u) return viewMap();
    const ws = lapWords(u, lapOf(c), 24).map(x => ({ w: x.w, d: x.d, s: x.s, p: x.p, o: x.o, h: x.h }));
    state.trailWordsN = ws.length;
    return `<div style="animation:sb-rise .3s ease both;max-width:640px;margin:0 auto">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><button data-act="trailUnit" data-arg="${escA(u.id)}" style="color:var(--muted);font-weight:700;font-size:13px">← ${esc(u.title.split('—')[0].trim())}</button></div>
      ${wordFlash(ws, state.trailWordIdx || 0, 'trailWordNav', { selfMark: true })}
      <div style="display:flex;justify-content:center;gap:10px;margin-top:12px">
        <button data-act="trailWordNav" data-arg="-1" style="padding:11px 22px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);font-weight:800">← Back</button>
        <button data-act="trailWordNav" data-arg="1" style="padding:11px 22px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800">Next →</button></div>
      <p style="text-align:center;font-size:12px;color:var(--muted);font-weight:600;margin-top:8px">✓ Complete marks it mastered · ⚑ sends it to your Revisions — same as Practice.</p>
    </div>`;
  }
  function viewQuiz() {
    const c = active(); const q2 = state.tq; if (!q2) return viewMap();
    const back = state.trailChk ? 'trailBack' : 'trailUnit';
    if (q2.over) {
      const pct = Math.round((q2.pct || 0) * 100);
      return `<div style="animation:sb-rise .35s ease both;max-width:460px;margin:0 auto;text-align:center">
        <div style="background:var(--bg2);border-radius:20px;padding:28px;box-shadow:0 0 0 1px var(--line),var(--glow)">
          <div style="width:92px;height:92px;margin:0 auto 12px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(${q2.pass ? 'var(--good)' : 'var(--bad)'} ${pct}%,var(--surface2) 0)"><div style="width:72px;height:72px;border-radius:50%;background:var(--bg2);display:grid;place-items:center;font-family:var(--display);font-weight:800;font-size:21px">${pct}%</div></div>
          ${q2.lapUp ? `<h2 style="font-family:var(--display);font-size:21px;margin-bottom:6px">TIER ${lapOf(c)} UNLOCKED</h2><p style="font-size:13px;color:var(--muted);margin-bottom:14px">The whole route returns — tougher words, same ideas. That is how it sticks.</p>`
          : q2.pass ? `<h2 style="font-family:var(--display);font-size:21px;margin-bottom:6px">Stop cleared · +15 🪙</h2><p style="font-size:13px;color:var(--muted);margin-bottom:14px">${q2.revising ? 'Revenge complete.' : 'The idea is yours. The route rolls on.'}</p>`
          : `<h2 style="font-family:var(--display);font-size:21px;margin-bottom:6px">${pct}% — so close</h2><p style="font-size:13px;color:var(--muted);margin-bottom:14px">You need ${Math.round(gate() * 100)}%. Win back the ${q2.missed.length} you missed, then take it again.</p>`}
          <div style="display:flex;gap:9px;justify-content:center;flex-wrap:wrap">
            ${!q2.pass && q2.missed.length ? `<button data-act="tqRevise" style="padding:12px 20px;border-radius:12px;background:var(--treasure);color:#3a2c00;font-weight:800;font-size:13.5px">⚑ Revise the missed ones</button>` : ''}
            ${!q2.pass ? `<button data-act="${state.trailChk ? 'trailChk' : 'trailQuiz'}" ${state.trailChk ? `data-arg="${escA(state.trailChk)}"` : ''} style="padding:12px 20px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:13.5px">Take it again</button>` : ''}
            <button data-act="trailBack" style="padding:12px 20px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:13.5px">${q2.pass ? 'Back to the Map →' : 'Back'}</button></div>
        </div></div>`;
    }
    const it = q2.items[q2.i]; const picked = q2.picked;
    let body = '';
    if (it.ty === 'spell') {
      body = `<div style="text-align:center">
        <button data-act="tqSay" style="display:inline-flex;align-items:center;gap:8px;padding:13px 24px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">${iconSVG('volume', 20)} Hear the word</button>
        <p style="font-size:12.5px;color:var(--muted);font-weight:600;margin:10px 0 4px">${esc(maskTxt((it.d || '').slice(0, 120), it.w))}</p>
        <input data-inp="tqInput" data-fkey="tqInput" value="${escA(state.tqTyped || '')}" ${picked != null ? 'disabled' : ''} autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="type the spelling…" style="width:100%;max-width:330px;margin-top:8px;padding:13px 15px;border-radius:12px;border:1.5px solid ${picked == null ? 'var(--line)' : q2.right ? 'var(--good)' : 'var(--bad)'};background:var(--surface);font-size:17px;font-weight:800;text-align:center;letter-spacing:.06em;outline:none">
        ${picked == null ? `<div style="margin-top:10px"><button data-act="tqSpell" style="padding:11px 26px;border-radius:12px;background:var(--good);color:#fff;font-weight:800;font-size:14px">Check ✓</button></div>`
        : `<p style="margin-top:10px;font-weight:800;color:${q2.right ? 'var(--good)' : 'var(--bad)'}">${q2.right ? 'Nailed it!' : 'It’s “' + esc(it.w) + '”'}</p>`}</div>`;
    } else {
      body = `<p style="font-size:15px;font-weight:700;line-height:1.5;margin-bottom:12px">${esc(it.q)}</p>
        <div style="display:grid;gap:8px">${it.opts.map((o, i) => { const st = picked == null ? 'background:var(--surface2);border:1px solid var(--line)'
          : i === it.ans ? 'background:color-mix(in srgb,var(--good) 18%,transparent);border:1.5px solid var(--good)'
          : i === picked ? 'background:color-mix(in srgb,var(--bad) 14%,transparent);border:1.5px solid var(--bad)' : 'background:var(--surface2);border:1px solid var(--line);opacity:.55';
          return `<button data-act="tqPick" data-arg="${i}" ${picked != null ? 'disabled' : ''} style="display:flex;gap:10px;align-items:flex-start;text-align:left;padding:12px 14px;border-radius:12px;font-weight:700;font-size:13px;line-height:1.4;${st}"><span style="flex-shrink:0;width:22px;height:22px;border-radius:7px;background:var(--chip);color:var(--accent);display:grid;place-items:center;font-size:11.5px;font-weight:800">${i + 1}</span><span>${esc(String(o.c))}</span></button>`; }).join('')}</div>`;
    }
    return `<div style="animation:sb-rise .3s ease both;max-width:560px;margin:0 auto">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <button data-act="trailBack" style="color:var(--muted);font-weight:700;font-size:13px">✕ Quit</button>
        <div style="flex:1;height:8px;border-radius:999px;background:var(--surface2);overflow:hidden"><div style="height:100%;background:var(--accent);width:${Math.round(q2.i / q2.items.length * 100)}%"></div></div>
        <span style="font-size:12px;font-weight:800;color:var(--muted)">${q2.i + 1}/${q2.items.length}</span></div>
      <div style="background:var(--bg2);border-radius:18px;padding:clamp(16px,4vw,24px);box-shadow:0 0 0 1px var(--line),var(--glow)">
        <div style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:700;margin-bottom:8px">${it.ty === 'spell' ? '🔊 Spell it' : it.ty === 'mean' ? '📖 Meaning' : '💡 Concept'}${state.trailChk ? ' · checkpoint' : ''}</div>
        ${body}
        ${picked != null ? `<div style="text-align:center;margin-top:14px"><button data-act="tqNext" style="padding:11px 26px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:13.5px">${q2.i + 1 >= q2.items.length ? 'Finish' : 'Next →'}</button></div>` : ''}
      </div>
      <p style="text-align:center;font-size:11.5px;color:var(--muted);font-weight:600;margin-top:8px">Keys: 1–4 answer · Enter check/next · R hear it</p>
    </div>`;
  }
  window.TRAIL = { view: () => { if (!T()) return '<div style="padding:40px;text-align:center;color:var(--muted)">Opening the Word Atlas…</div>';
    const v = state.trailView || 'map';
    return v === 'unit' ? viewUnit() : v === 'words' ? viewWords() : v === 'quiz' ? viewQuiz() : viewMap(); } };

  /* keyboard: 1-4 answers, Enter advances/checks, R replays */
  window.addEventListener('keydown', e => { try {
    if (state.nav !== 'trail' || !state.tq || state.tq.over || state.pinDlg || state.settingsOpen) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t2 = e.target; const typing = t2 && (t2.tagName === 'INPUT' || t2.tagName === 'TEXTAREA');
    const q2 = state.tq; const it = q2.items[q2.i];
    if (e.key === 'Enter') { e.preventDefault(); if (q2.picked != null) app.tqNext(); else if (it.ty === 'spell') app.tqSpell(); return; }
    if (typing) return;
    if (e.key >= '1' && e.key <= '4' && it.ty !== 'spell' && q2.picked == null) { e.preventDefault(); app.tqPick(String(+e.key - 1)); }
    else if (e.key === 'r' || e.key === 'R') { e.preventDefault(); app.tqSay(); }
  } catch (_) {} });
})();
