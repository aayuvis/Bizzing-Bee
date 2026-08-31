/* ============================================================
   TRAIL.js — The Word Atlas engine (the Word Atlas tab).
   ONE concept-first guided journey over SB_TRAIL (trail-data.js):
   a single continuous map — nine base acts, then the Advanced
   Rounds (the five expeditions), which unlock with the Advanced
   Pack ($299/yr). Map screen (world-themed acts, winding node
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
  const GUIDE = { meadow: 'honeypot', library: 'waggle', forum: 'bumble', elements: 'star', engine: 'drone', strait: 'nectar', junkyard: 'propolis', vibe: 'jester', stage: 'diva', warfield: 'queenhive', greysea: 'blossom', grandtrunk: 'cobra' };
  const ACCENT = { meadow: ['#FFC23D', '#C8791B'], library: ['#6C4FE0', '#4A3AA0'], forum: ['#E06A3C', '#A8431F'], elements: ['#2E8FB8', '#1C6486'], engine: ['#C08A3E', '#8A5B00'], strait: ['#3E63D6', '#26409A'], junkyard: ['#F0A93C', '#B4711A'], vibe: ['#B14FC4', '#7A2F8C'], stage: ['#E8458C', '#A82563'], warfield: ['#D6353F', '#8E1D26'], greysea: ['#7E8AA0', '#4C566B'], grandtrunk: ['#E0A33C', '#93551A'] };

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
  /* Settings → Unlock everything is meant to open the whole app for testing. The Atlas
     gates on the frontier rather than on entitlement, so it needs to honour it too. */
  const devOn = () => { try { return !!state.devUnlock; } catch (e) { return false; } };
  /* app3's one back control (window.SB_BACK), in its dark variant — the Atlas draws its
     headers over artwork. Aliased rather than reimplemented so the Atlas can never drift
     from the pill every other screen uses. */
  const bpill = (act, label, arg) => { try { return window.SB_BACK ? SB_BACK(act, label, arg, true) : ''; } catch (e) { return ''; } };
  /* ENTRANCE ANIMATIONS PLAY ON ARRIVAL, NOT ON EVERY RENDER. The idle loader
     re-renders the app several times just after boot as data shards land, and a
     rise/pop that replays on each rebuild reads as the whole act board flashing
     (play-tested as exactly that, on Act I). TRAIL.view() compares a key of the
     current view identity against the last one it drew: same key, no animation. */
  let _vk = '', _fresh = true, _popK = '';
  const RISE = d => _fresh ? ('animation:sb-rise ' + (d || '.35s') + ' ease both;') : '';
  const unitsOf = tab => tab === 'exp' ? T().expedition.units : T().honey.units;
  const actsOf = tab => tab === 'exp' ? T().expedition.expeds : T().honey.acts;
  const unit = id => unitsOf(course()).find(u => u.id === id);
  /* Three sources, one shape. `sa` is the Grand Trunk Road: its chapters live in
     their own file because they are the book's, not the advanced course's, and
     appending them to SB_ADV_CONCEPTS would shift every narration index after them. */
  const EMPTY_CH = { title: '', concept: '', cards: [], words: [] };
  const chOf = u => u.neu ? u.chapter
    : u.sa != null ? ((window.SB_SOUTHASIA || [])[u.sa] || EMPTY_CH)
    : (u.ai != null ? (window.SB_ADV_CONCEPTS.chapters[u.ai]) : (window.SB_CONCEPTS.chapters[u.gi]));
  const lapOf = c => course() === 'exp' ? tr(c).elap : tr(c).lap;
  const doneMap = c => course() === 'exp' ? tr(c).edone : tr(c).done;
  const chkMap = c => course() === 'exp' ? tr(c).echk : tr(c).chk;
  const gate = () => course() === 'exp' ? (T().rules.expeditionGate || .9) : (T().rules.gate || .8);
  /* ---- stars: the stop always tells you how you are doing and what to do next ----
     Play-tested as "I completed all the words but I am not told what I need to do to
     qualify for the next round". The quiz used to be the ONLY gate and the only score.
     Now every part of a stop counts, PRACTICE is the gate, and the card names the next
     move at all times:
       ★ Practice at 70%+        — opens the next stop (the bare minimum)
       ★ Read the chapter        (Learn the idea)
       ★ Flip through every word (Meet the words)
       ★ Pass the Quiz           (the course gate, 80% / 90% Advanced)
       ★ Ace the Quiz            (90% / 95% Advanced)
     Per-child record: tr(c).st[unitId+':'+lap] = {l, w, p: best practice %, q: best
     quiz %}. Old saves carry only the quiz % in doneMap — starsOf reads both, so a
     stop passed last month keeps its quiz stars and its unlock. */
  const QSTAR = () => course() === 'exp' ? 95 : 90;
  const PGATE = 70;                       // practice % that opens the next stop
  const stKey = (u, lap) => u.id + ':' + lap;
  const stRec = (c, u, lap) => { const st = tr(c).st = tr(c).st || {}; return st[stKey(u, lap)] = st[stKey(u, lap)] || {}; };
  function starsOf(c, u, lap) {
    const r = (tr(c).st || {})[stKey(u, lap)] || {};
    const q = Math.max(r.q || 0, (doneMap(c)[u.id] || {})[lap] || 0);
    const p = Math.max(r.p || 0, q >= Math.round(gate() * 100) ? PGATE : 0);   // a passed quiz proves the words too
    const s = [p >= PGATE, !!r.l, !!r.w, q >= Math.round(gate() * 100), q >= QSTAR()];
    return { n: s.filter(Boolean).length, s, p, q };
  }
  /* the single next move, in priority order: unlock first, then the course gate,
     then the completionist stars */
  function nextStar(c, u, lap) {
    const { s, p, q } = starsOf(c, u, lap);
    if (!s[0]) return { act: 'trailPractice', cta: 'Train', txt: p > 0 ? `Practice again — your best is ${p}%, reach ${PGATE}% to open the next stop` : `Practice and get ${PGATE}% right to open the next stop` };
    if (!s[3]) return { act: 'trailQuiz', cta: 'Quiz', txt: `Pass the Quiz — ${Math.round(gate() * 100)}%${q ? ` (best so far ${q}%)` : ''} — for another star` };
    if (!s[1]) return { act: 'trailLesson', cta: 'Learn', txt: 'Read the chapter for another star' };
    if (!s[2]) return { act: 'trailWords', cta: 'Browse', txt: 'Flip through every word for another star' };
    if (!s[4]) return { act: 'trailQuiz', cta: 'Quiz', txt: `Ace the Quiz — ${QSTAR()}% or better — for the fifth star` };
    return null;
  }
  const starHTML = (n, size) => `<span style="font-size:${size || 13}px;letter-spacing:2px;color:#E8A81C;white-space:nowrap">${'★'.repeat(n)}<span style="opacity:.32">${'★'.repeat(5 - n)}</span></span>`;
  /* Practice reports back through here (app3's exitTrain calls it): best % sticks,
     and crossing the practice gate is announced, because that IS the unlock. */
  /* the recorded best for a stop, for app3's session summary — the banner there must
     reflect what was RECORDED, not the mini-round the child just finished */
  window.SB_TRAIL_BEST = function (uid) {
    try { const c = active(); const u = unitsOf(courseOfId(uid)).find(x => x.id === uid); if (!c || !u) return null;
      const r = (tr(c).st || {})[uid + ':' + lapOf(c)] || {};
      return { p: r.p || 0, gate: PGATE }; } catch (e) { return null; }
  };
  window.SB_TRAIL_PRACTICED = function (uid, right, done) {
    try {
      const c = active(); if (!c) return;
      /* an Ultra stop reports here too — DONE is earned at 70%+ in a real session,
         never stamped for tapping Train */
      if (/^ul\d+$/.test(String(uid))) {
        const need = Math.min(10, ULTRA_WORDS);
        if (!done || done < need) return;
        const pct = Math.round((right / done) * 100);
        const u2 = uP(c); if (pct > (u2.p[uid] || 0)) u2.p[uid] = pct;
        if (pct >= 70 && !u2.done[uid]) {
          u2.done[uid] = 1;
          try { sfx('win'); burstConfetti(70); } catch (e) {}
          flash('🏆 ' + pct + '% — champion stop cleared!');
          uCheckEmblem(c, 'u' + Math.floor((+uid.slice(2)) / ULTRA_STOPS));
        }
        save(); return;
      }
      const u = unitsOf(courseOfId(uid)).find(x => x.id === uid); if (!u) return;
      state.trailCourse = courseOfId(uid);
      const lap = lapOf(c);
      const need = Math.min(10, (lapWords(u, lap, 24) || []).length || 10);
      if (!done || done < need) return;                    // two words at 100% is not a session
      const pct = Math.round((right / done) * 100);
      const r = stRec(c, u, lap); const had = (r.p || 0) >= PGATE;
      if (pct > (r.p || 0)) r.p = pct;
      save();
      if (!had && r.p >= PGATE) { try { sfx('win'); burstConfetti(40); } catch (e) {} flash(`⭐ ${pct}% — the next stop is open!`); }
    } catch (e) {}
  };
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
  /* a UNIT opens the road behind it at Practice >= PGATE (or a legacy quiz pass);
     a CHECKPOINT is still its quiz — the every-4th-stop consolidation stays a quiz */
  const passedNode = (c, node) => node.kind === 'unit'
    ? (!!(doneMap(c)[node.u.id] || {})[lapOf(c)] || (((tr(c).st || {})[node.u.id + ':' + lapOf(c)] || {}).p || 0) >= PGATE)
    : !!chkMap(c)[lapOf(c) + ':' + node.id];
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
      /* The chapter's own text wins; anything it does not carry (the book chapters
         have no example sentences, some have no origin) is filled from the word
         library so a stop's cards are never half-empty. */
      const ws = (chOf(u).words || []).map(x => { const r = rec(nkey(x.w)) || {};
        return { w: x.w, d: x.def || r.d || '', s: x.ex || r.s || '', p: x.say || r.p || '',
          o: x.o || r.o || '', h: x.hook || r.h || '' }; });
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
    const out = shuffle(items).slice(0, 15);
    /* the Living Atlas: every 4th item is a KIT round — the same word, the
       country's own verb (catch / build / hop, reskinned per act) */
    if (LIV[u.act]) { let k = 0;
      for (let want = 3; want < out.length && k < 3; want += 4) {
        let j = want; while (j < out.length && (out[j].ty !== 'spell' || out[j].w.length < 3)) j++;
        if (j < out.length) out[j] = kitItem({ w: out[j].w, d: out[j].d }, KIT_OF[k++ % KIT_OF.length], u.act); } }
    return out;
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

  /* The Home screen shows the next stop on the Atlas, so the frontier has to be
     readable from outside this file. Everything is derived here rather than
     re-implemented in app3 — the lap filter in seq() is the only truth about
     which stop comes next. Returns null until trail-data.js lands. */
  window.SB_TRAIL_NEXT = function () {
    try {
      const c = active(); if (!c || !T()) return null;
      const s = seq(c); if (!s.length) return null;
      const i = frontier(c), atEnd = i >= s.length;
      const node = s[atEnd ? s.length - 1 : i];
      const act = (actsOf(course()) || []).find(a => a.id === node.act) || {};
      const raw = node.kind === 'unit' ? String(node.u.title || '') : 'Checkpoint';
      const cut = raw.indexOf(' — ');
      return {
        kind: node.kind,
        title: cut > 0 ? raw.slice(0, cut) : raw,
        sub: node.kind === 'chk' ? 'mixed quiz — no new words' : (cut > 0 ? raw.slice(cut + 3) : ''),
        act: act.title || '', world: act.world || 'meadow',
        done: Math.min(i, s.length), total: s.length, lap: lapOf(c), allDone: atEnd,
        go: node.kind === 'unit' ? 'trailUnit' : 'trailChk',
        arg: node.kind === 'unit' ? node.u.id : (course() + '|' + node.id),
      };
    } catch (e) { return null; }
  };

  /* Where is this concept taught? The reverse of SB_TRAIL_NEXT: given a concept
     index (the `gi` a unit points at), name the act and the stop that teaches it,
     so the Library can point back at the map instead of being a parallel world.
     Built once, from the curriculum itself. */
  let _taught = null;
  window.SB_TRAIL_TAUGHT = function (gi) {
    if (gi == null || gi < 0 || !T()) return null;
    if (!_taught) {
      _taught = Object.create(null);
      for (const crs of ['honey', 'exp']) {
        const acts = crs === 'exp' ? (T().expedition.expeds || []) : (T().honey.acts || []);
        const us = crs === 'exp' ? (T().expedition.units || []) : (T().honey.units || []);
        for (const act of acts) {
          let n = 0;
          for (const id of (act.units || [])) { n++;
            const u = us.find(x => x.id === id); if (!u || u.gi == null || u.gi < 0) continue;
            if (_taught[u.gi]) continue;
            _taught[u.gi] = { act: act.title || '', actId: act.id, world: act.world || 'meadow',
              stop: n, unit: u.id, course: crs };
          }
        }
      }
    }
    return _taught[gi] || null;
  };

  /* Which act and stop does this unit belong to? The Practice side of the two-way
     link: a session that came from the Atlas can say so and offer the way back. */
  window.SB_TRAIL_WHERE = function (unitId) {
    try {
      if (!unitId || !T()) return null;
      for (const crs of ['honey', 'exp']) {
        const acts = crs === 'exp' ? (T().expedition.expeds || []) : (T().honey.acts || []);
        for (const act of acts) {
          const i = (act.units || []).indexOf(unitId);
          if (i >= 0) return { act: act.title || '', actId: act.id, world: act.world || 'meadow',
            stop: i + 1, total: (act.units || []).length, course: crs, unit: unitId };
        }
      }
    } catch (e) {}
    return null;
  };

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
    if (crs === 'exp' && !advOn() && !devOn()) { app2.openAdvanced ? app2.openAdvanced() : flash('The Advanced Rounds come with the Advanced Pack'); return; }
    state.trailCourse = crs;
    const s = seq(c); const i = s.findIndex(n => n.kind === 'unit' && n.u.id === id);
    if (i > frontier(c) && !devOn()) { flash('Locked — clear the earlier stops first'); return; }
    /* nav is set here too: Home's "Next on your journey" card calls this from
       outside the Atlas, and a stop must open wherever it is opened from. */
    set({ nav: 'trail', screen: 'app', trailView: 'unit', trailUnit: id, tq: null }); };
  app2.trailChk = arg => { const c = active();
    /* checkpoint args carry their course: "honey|meadow:4" / "exp|proving:4" */
    const [crs, id] = String(arg).indexOf('|') >= 0 ? String(arg).split('|') : ['honey', String(arg)];
    if (crs === 'exp' && !advOn() && !devOn()) { app2.openAdvanced ? app2.openAdvanced() : flash('The Advanced Rounds come with the Advanced Pack'); return; }
    state.trailCourse = crs === 'exp' ? 'exp' : 'honey';
    const s = seq(c); const i = s.findIndex(n => n.kind === 'chk' && n.id === id);
    if (i > frontier(c) && !devOn()) { flash('Locked — clear the earlier stops first'); return; }
    const items = buildCheckpoint(c, { id });
    set({ nav: 'trail', screen: 'app', trailView: 'quiz', trailUnit: null, trailChk: id, tq: { items, i: 0, score: 0, picked: null, typed: '', missed: [], over: false } }); tqAutoSay(); };
  /* "Next stop →" from a cleared stop: the node AFTER this one on the route — a unit
     or a checkpoint. trailUnit/trailChk still enforce the frontier, so this can never
     jump a lock; at the end of the tier it says so and returns to the map. */
  app2.trailNextFrom = id => { const c = active(); const s = seq(c);
    const i = s.findIndex(n => n.kind === 'unit' && n.u.id === id);
    const nx = i >= 0 ? s[i + 1] : null;
    if (!nx) { flash('That was the last stop of this tier — the route returns tougher!'); app2.trailBack(); return; }
    if (nx.kind === 'unit') app2.trailUnit(nx.u.id); else app2.trailChk(course() + '|' + nx.id); };
  app2.trailPick = i => set({ trailStop: +i });
  /* tapping the open map (not a pin, not the card) folds the stop card away —
     the painting is the point; the card returns on the next pin tap */
  app2.trailShut = () => { if (state.trailStop === -9) return; set({ trailStop: -9 }); };
  /* Ultra is a map now, but its words are still the Ultra Champions Journey list —
     the map is the way in, the list is the training ground behind it. */
  app2.openUltra = (i) => { if (!advOn() && !devOn()) { app2.openAdvanced && app2.openAdvanced(); return; }
    try {
      /* a landmark IS a run of day-blocks: open the journey at the first day of that run */
      const stages = (typeof ultraStages === 'function') ? ultraStages() : [];
      const per = Math.max(1, Math.ceil((stages.length || 5) / 5));
      const want = Math.max(0, Math.min((stages.length || 1) - 1, (+i || 0) * per));
      const c = active(); if (c) { c.lists = c.lists || {}; c.lists.ultra = c.lists.ultra || { xp: 0 };
        if ((c.lists.ultra.stage || 0) < want) c.lists.ultra.stage = want; }
      app2.selectList('ultra');
    } catch (e) { set({ nav: 'coach', screen: 'app' }); } };
  /* The Atlas hands its words to Practice — the same records, the same XP, one tap. */
  app2.trailTrain = id => { const u = unit(id) || unit(state.trailUnit); if (!u) return;
    const c = active();
    needMap(() => { const ws = lapWords(u, lapOf(c), 24);
      if (!ws.length) { flash('No words here yet'); return; }
      state.trailReturn = u.id; state.trailCourse = courseOfId(u.id);
      state.sessionWords = ws.map(x => ({ w: x.w, d: x.d, s: x.s, p: x.p, o: '', r: x.h }));
      state.sessionLabel = String(u.title || '').split('—')[0].trim(); state.gi = 0;
      app2.startTrain(); }); };
  /* Back retraces the route: a stop returns to its region, and the region returns to the
     map. It used to stop at the region because trailAct was never cleared. */
  app2.trailBack = () => {
    if (state.trailView === 'act') { set({ trailView: 'map', trailAct: null, trailStop: null, tq: null }); return; }
    if (state.trailAct) { set({ trailView: 'act', trailUnit: null, tq: null }); return; }
    set({ trailView: 'map', trailUnit: null, tq: null }); };
  /* a region on the atlas: "honey|meadow" */
  app2.trailAct = arg => { state.trailStop = null; const [crs, id] = String(arg || '').split('|');
    if (crs === 'exp' && !advOn() && !devOn()) { app2.openAdvanced ? app2.openAdvanced() : flash('The Advanced Rounds come with the Advanced Pack'); return; }
    state.trailCourse = crs === 'exp' ? 'exp' : 'honey';
    try { window.scrollTo(0, 0); } catch (e) {}
    maybeAmbush(active(), id);
    set({ nav: 'trail', screen: 'app', trailView: 'act', trailAct: id, trailActCrs: crs, tq: null }); };
  app2.trailToMap = () => set({ nav: 'trail', screen: 'app', trailView: 'map', trailAct: null, trailStop: null, tq: null });
  app2.trailLesson = () => { const u = unit(state.trailUnit); const ch = chOf(u);
    try { stRec(active(), u, lapOf(active())).l = 1; save(); } catch (e) {}
    state.trailReturn = u.id;
    state.nav = 'concepts';
    if (u.gi >= 0) { try { loadConcepts(); } catch (e) {} app2.openConcept(u.gi); return; }
    try { clearAnimTimer(); } catch (e) {}
    state.conceptSel = ch; state.conceptStep = 0; state.conceptWordsOpen = false; state.animOn = false; render(); };
  app2.trailWords = () => { const u = unit(state.trailUnit);
    needMap(() => { const c = active(); const ws = lapWords(u, lapOf(c), 24);
      state.sessionWords = ws.map(x => ({ w: x.w, d: x.d, s: x.s, p: x.p, o: '', r: x.h }));
      if (ws.length <= 1) { try { stRec(c, u, lapOf(c)).w = 1; save(); } catch (e) {} }
      set({ trailView: 'words', trailWordIdx: 0 }); }); };
  app2.trailWordNav = d => { const n = (state.trailWordsN || 1);
    const step = d === 'next' ? 1 : d === 'prev' ? -1 : (+d || 0);
    const idx = Math.max(0, Math.min(n - 1, (state.trailWordIdx || 0) + step));
    /* the "met every word" star lands when the LAST card is reached, not on open */
    if (idx === n - 1 && n > 1) { try { const u = unit(state.trailUnit); const c = active();
      if (u && !stRec(c, u, lapOf(c)).w) { stRec(c, u, lapOf(c)).w = 1; save(); } } catch (e) {} }
    set({ trailWordIdx: idx }); };
  app2.trailPractice = () => { const u = unit(state.trailUnit); const c = active();
    needMap(() => { const ws = lapWords(u, lapOf(c), 24);
      if (!ws.length) { flash('No words here yet'); return; }
      tr(c).seen[u.id + ':' + lapOf(c)] = ((tr(c).seen[u.id + ':' + lapOf(c)] || 0) + ws.length) % 997; save();
      state.trailReturn = u.id;
      state.sessionWords = ws.map(x => ({ w: x.w, d: x.d, s: x.s, p: x.p, o: '', r: x.h }));
      state.sessionLabel = u.title.split('—')[0].trim(); state.gi = 0; app2.startTrain(); }); };
  app2.trailQuiz = () => { const u = unit(state.trailUnit); if (!u) return;
    needMap(() => { set({ trailView: 'quiz', trailChk: null, tq: { items: buildQuiz(u), i: 0, score: 0, picked: null, typed: '', missed: [], over: false } }); tqAutoSay(); }); };
  /* Play-tested (Amrita 8.25/8.26): a spell item must SAY its word on arrival, and an
     answered item must move on BY ITSELF — the child was pressing the speaker, then
     Enter twice. A wrong answer lingers longer so the correct spelling can be read;
     the Next button stays for anyone faster than the timer. */
  const tqAutoSay = () => setTimeout(() => { try { const q2 = state.tq;
    if (q2 && !q2.over && q2.picked == null) { const it = q2.items[q2.i]; if (it && it.ty === 'spell' && it.w) say(it.w); } } catch (e) {} }, 450);
  const tqAutoNext = ok2 => { const q2 = state.tq; const at = q2.i;
    setTimeout(() => { try { const n = state.tq;
      if (n === q2 && !n.over && n.picked != null && n.i === at) app2.tqNext(); } catch (e) {} }, ok2 ? 1100 : 3200); };
  app2.tqPick = i => { const q2 = state.tq; if (!q2 || q2.over || q2.picked != null) return; const it = q2.items[q2.i];
    q2.picked = +i; const ok2 = +i === it.ans; if (ok2) q2.score++; else q2.missed.push(it);
    render(); tqAutoNext(ok2); };
  app2.tqSpell = () => { const q2 = state.tq; if (!q2 || q2.over || q2.picked != null) return; const it = q2.items[q2.i];
    const ok = nkey(state.tqTyped || '') === nkey(it.w); q2.picked = ok ? 1 : 0; q2.right = ok;
    if (ok) q2.score++; else q2.missed.push(it);
    render(); tqAutoNext(ok); };
  app2.tqSay = () => { const it = state.tq && state.tq.items[state.tq.i]; if (it && it.w) say(it.w); };
  app2.tqNext = () => { const q2 = state.tq; if (!q2 || q2.picked == null) return;
    state.tqTyped = '';
    if (q2.i + 1 >= q2.items.length) { q2.over = true; finishQuiz(); } else { q2.i++; q2.picked = null; tqAutoSay(); }
    render(); };
  function finishQuiz() { const c = active(); const q2 = state.tq; const pct = q2.items.length ? q2.score / q2.items.length : 0;
    /* a HERO challenge is one word, the hero's way: win = +5 honey the first
       time each day; replays pay nothing. Touches nothing else. */
    if (q2.hero != null) { q2.pct = pct; q2.pass = pct >= 1;
      if (q2.pass) { const hr = mwP(c).hr = mwP(c).hr || {};
        if (hr[q2.hero] !== mwDay()) { hr[q2.hero] = mwDay(); addCoins(5); q2.heroPaid = true; }
        try { sfx('win'); burstConfetti(40); } catch (e) {} save(); }
      return; }
    /* a LANDMARK side round pays a honey trickle and touches nothing else:
       no stars, no doneMap, no lap — rank still comes from the road itself */
    if (q2.side != null) { q2.pct = pct; q2.pass = pct >= 0.5;
      if (q2.pass) { addCoins(12); (mwP(c).lm = mwP(c).lm || {})[q2.side] = mwDay(); try { sfx('win'); } catch (e) {} save(); }
      return; }
    q2.pct = pct; q2.pass = pct >= gate();
    /* the best full-quiz score sticks even on a fail — it feeds the quiz stars;
       a revise round is missed-items-only, so its score proves nothing */
    if (!state.trailChk && !q2.revising) { try { const u = unit(state.trailUnit);
      const r = stRec(c, u, lapOf(c)); r.q = Math.max(r.q || 0, Math.round(pct * 100)); save(); } catch (e) {} }
    if (q2.pass) { addCoins(15);
      /* today's bonus bloom: passing the bloomed stop pays double honey */
      try { if (state.trailUnit && state.trailUnit === state.mwBloomU) { addCoins(15); q2.bloom = true; } } catch (e) {}
      try { sfx('win'); burstConfetti(60); } catch (e) {}
      if (state.trailChk) chkMap(c)[lapOf(c) + ':' + state.trailChk] = Math.round(pct * 100);
      else { const u = unit(state.trailUnit); (doneMap(c)[u.id] = doneMap(c)[u.id] || {})[lapOf(c)] = Math.round(pct * 100);
        /* the Meadow fork: remember which spur was walked first; when the pair
           closes, the dared road (the dark mushroom knoll) pays its chest */
        try { if (u.act === 'meadow') { const ns = seq(c).map((n2, i2) => ({ n: n2, i: i2 })).filter(x => x.n.act === 'meadow');
          const pi = ns.findIndex(x => x.n.kind === 'unit' && x.n.u && x.n.u.id === u.id);
          if (pi === MW.pair[0] || pi === MW.pair[1]) { const p = mwP(c);
            const other = ns[pi === MW.pair[0] ? MW.pair[1] : MW.pair[0]];
            if (!p.fk) p.fk = pi === MW.pair[0] ? 'hi' : 'lo';
            if (other && passedNode(c, other.n) && !p.fkPaid) { p.fkPaid = 1;
              if (p.fk === 'hi') { addCoins(25); q2.chest = true; } } } } } catch (e) {} }
      // lap complete?
      const s = seq(c); if (s.every(n => passedNode(c, n))) { if (course() === 'exp') tr(c).elap = Math.min(3, tr(c).elap + 1); else tr(c).lap = Math.min(3, tr(c).lap + 1); q2.lapUp = true; try { burstConfetti(140); } catch (e) {} }
      save(); }
  }
  app2.tqRevise = () => { const q2 = state.tq; if (!q2) return;
    set({ tq: { items: shuffle(q2.missed.slice()), i: 0, score: 0, picked: null, typed: '', missed: [], over: false, revising: true } }); tqAutoSay(); };
  app2.tqInput = v => { state.tqTyped = String(v == null ? '' : v); };

  /* ---- views ---- */
  /* A stop on the map. Three states with three different silhouettes, so which
     one you can play is obvious at arm's length: a cleared stop is a gold hex
     with a star, the stop you are on is a lit hex with a halo and the speller's
     own avatar standing on it, and everything ahead is a flat unlit hex with a
     lock. The chrome is a world-tinted gradient with a top gloss and an inner
     rim, which is what stops it looking like a flat sticker. */
  /* ---- the route ----
     The map used to be hexagons zig-zagging down the page with their labels off to
     one side and a dotted line hopping between them. It read as a mobile-game level
     select, not as an atlas. This is a journey ledger instead: one continuous rail
     down the left, a small medallion on it per stop, and the stop itself as a proper
     row to the right of it. Nothing zig-zags, nothing hops, and the type sits on a
     single left margin the whole way down.

     Three states, three weights. A cleared stop is quiet — a gold ring, a normal-
     weight title, its score on the right. The stop you are on is the only card on the
     page: raised, tinted with its world's accent, carrying the chapter's own line and
     a Continue button, with your avatar standing on the rail beside it. Everything
     ahead is a hairline ring and muted type. */
  function medallion(kind, world, label, av) {
    const [a, d] = ACCENT[world] || ACCENT.meadow;
    const base = 'position:absolute;left:0;top:16px;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;flex-shrink:0;z-index:2;';
    if (kind === 'passed') return `<span style="${base}background:linear-gradient(160deg,#FFD24D,#E0922E);color:#4A2E00;box-shadow:0 2px 6px rgba(200,121,27,.34),inset 0 -1.5px 0 rgba(140,86,10,.3);font-family:var(--display);font-weight:800;font-size:15px">${label}</span>`;
    /* The speller stands ON the stop they are at: the avatar IS the medallion, rather
       than a second sprite floating beside it and colliding with the row above. */
    if (kind === 'cur') return `<span style="${base}background:linear-gradient(160deg,${a},${d});box-shadow:0 0 0 4px color-mix(in srgb,${a} 22%,transparent),0 3px 9px rgba(26,18,54,.28);color:#fff;font-family:var(--display);font-weight:800;font-size:14px;overflow:visible">${av
      ? `<span style="width:30px;height:30px;display:block;animation:sb-bee-bob 1.8s ease-in-out infinite">${av}</span>`
      : label}</span>`;
    return `<span style="${base}background:var(--bg2);border:1.5px solid var(--line);color:var(--muted);font-family:var(--display);font-weight:700;font-size:13px">${label}</span>`;
  }
  function nodeHTML(c, node, i, fr, world) {
    const passed = passedNode(c, node); const isCur = i === fr; const locked = i > fr;
    const kind = passed ? 'passed' : isCur ? 'cur' : 'locked';
    const [a, d] = ACCENT[world] || ACCENT.meadow;
    const chk = node.kind === 'chk';
    const u = chk ? null : node.u;
    const title = chk ? 'Checkpoint' : u.title.split('—')[0].trim();
    const tag = chk ? 'mixed quiz — no new words'
      : (u.kind === 'lesson' || course() === 'exp' ? 'lesson' : 'word family');
    /* a unit row wears its STARS; a checkpoint still wears its quiz score */
    const score = chk ? (passed ? (chkMap(c)[lapOf(c) + ':' + node.id] || 0) + '%' : '')
      : ((passed || starsOf(c, u, lapOf(c)).n) ? starHTML(starsOf(c, u, lapOf(c)).n, 12) : '');
    const act = chk ? `data-act="trailChk" data-arg="${escA(course() + '|' + node.id)}"` : `data-act="trailUnit" data-arg="${escA(u.id)}"`;
    const mark = passed ? '✓' : chk ? '◆' : String(i + 1);
    const av = isCur && window.SB_AVATAR ? SB_AVATAR(c.avatar || 'bizzy', 30) : '';
    /* the one-line promise of the stop, for the card you are standing on */
    let blurb = '';
    if (isCur && !chk) { try { const ch = chOf(u); blurb = String((ch && ch.concept) || '').split(/(?<=[.!?])\s/)[0] || ''; } catch (e) {} }
    if (isCur && chk) blurb = 'Six mixed questions from the stops you have cleared. Pass it and the route opens.';
    const rowPad = isCur ? '15px 16px 15px 54px' : '11px 12px 11px 54px';
    const shell = isCur
      ? `background:linear-gradient(150deg,color-mix(in srgb,${a} 12%,var(--bg2)),var(--bg2) 62%);border:1px solid color-mix(in srgb,${a} 42%,var(--line));box-shadow:0 6px 18px rgba(26,18,54,.13);border-radius:16px`
      : 'background:transparent;border:1px solid transparent;border-radius:14px';
    return `<button ${act} class="sb-lift" style="position:relative;display:block;width:100%;text-align:left;padding:${rowPad};margin-bottom:${isCur ? '10px' : '2px'};${shell}">
      ${medallion(kind, world, mark, av)}
      <span style="display:flex;align-items:center;gap:12px">
        <span style="min-width:0;flex:1">
          <span style="display:block;font-family:var(--display);font-weight:${isCur ? '800' : passed ? '700' : '600'};font-size:${isCur ? '16.5px' : '14.5px'};line-height:1.24;color:${locked ? 'var(--muted)' : 'var(--text)'}">${esc(title)}</span>
          <span style="display:block;font-size:12px;color:var(--muted);font-weight:600;margin-top:2px">${esc(tag)}</span>
          ${blurb ? `<span style="display:block;font-size:12.5px;color:var(--text);opacity:.82;line-height:1.5;margin-top:7px;max-width:44em">${esc(blurb)}</span>` : ''}
        </span>
        ${score ? `<span style="flex-shrink:0;font-family:var(--display);font-variant-numeric:tabular-nums;font-weight:800;font-size:12px;color:var(--good)">${score}</span>` : ''}
        ${locked ? `<span style="flex-shrink:0;color:var(--muted);opacity:.55">${iconSVG('lock', 15)}</span>` : ''}
      </span>
      ${isCur ? `<span style="display:inline-flex;align-items:center;gap:7px;margin-top:12px;padding:10px 18px;border-radius:11px;background:${d};color:#fff;font-weight:800;font-size:13.5px;box-shadow:var(--edge)">${passed ? 'Play again' : 'Continue'} &rarr;</span>` : ''}
    </button>`;
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
  /* One continuous rail behind the medallions, lit gold as far as the speller has
     walked and hairline beyond. It replaces the dashed curve that used to hop from
     hexagon to hexagon — a route on a map is a line, not a series of jumps. */
  function railHTML(nodes, c, fr, col) {
    const cleared = nodes.filter(o => passedNode(c, o.n)).length;
    const pct = nodes.length > 1 ? Math.min(100, Math.round((cleared / nodes.length) * 100)) : 0;
    return `<span aria-hidden="true" style="position:absolute;left:16px;top:26px;bottom:26px;width:2px;border-radius:2px;background:var(--line)">
      <span style="position:absolute;left:0;right:0;top:0;height:${pct}%;border-radius:2px;background:linear-gradient(180deg,#FFD24D,${col});box-shadow:0 0 8px color-mix(in srgb,${col} 45%,transparent)"></span></span>`;
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
        <div style="position:relative;padding:16px 14px 18px 14px">
          ${railHTML(nodes, c, fr, a)}
          ${nodes.map(x => nodeHTML(c, x.n, x.i, fr, world)).join('')}
        </div></section>`;
    }
    const total = s.length, done = s.filter(n => passedNode(c, n)).length;
    return { acts, total, done, lap: lapOf(c) };
  }
  /* The route is 102 stops long, and saying so to a child who has cleared none of them
     reads as a mountain rather than a map. The bar carries the same information without
     a total to be daunted by; the words beside it say where you are, not how far it is. */
  const tierWord = (done, total) => { const p = done / Math.max(1, total);
    return !done ? 'just setting off' : p >= 1 ? 'tier complete ✓' : p >= .75 ? 'nearly there'
      : p >= .4 ? 'well on the way' : 'on your way'; };
  const tierBar = (lap, done, total) => `<div style="display:flex;align-items:center;gap:12px;background:var(--bg2);border-radius:16px;padding:12px 16px;margin-bottom:16px;box-shadow:0 0 0 1px var(--line)">
        <span style="font-family:var(--display);font-weight:800;font-size:13px;background:var(--chip);color:var(--accent);border-radius:999px;padding:5px 13px">Tier ${lap} of 3</span>
        <div style="flex:1;height:9px;border-radius:999px;background:var(--surface2);overflow:hidden"><div style="height:100%;background:linear-gradient(90deg,var(--accent),var(--treasure));width:${Math.round(done / Math.max(1, total) * 100)}%"></div></div>
        <span style="font-size:12px;font-weight:800;color:var(--muted);white-space:nowrap">${tierWord(done, total)}</span></div>`;
  /* The revision pile and the weak-pattern trainer used to sit in a Library section
     of their own, which meant leaving the journey to reach the two things you want
     precisely while you are on it. They ride the Atlas header as pills, and the
     chapter shelf keeps its place beside them. */
  function atlasPills(c) {
    const miss = ((c.missed) || []).length;
    const pill = (act, arg, ic, label, count, tone) => `<button data-act="${act}"${arg ? ` data-arg="${escA(arg)}"` : ''} class="sb-lift" style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:999px;font-weight:800;font-size:12.5px;white-space:nowrap;
      ${tone ? `background:color-mix(in srgb,${tone} 13%,var(--bg2));border:1px solid color-mix(in srgb,${tone} 45%,var(--line));color:${tone}` : 'background:var(--surface2);border:1px solid var(--line);color:var(--text)'}">${iconSVG(ic, 14)} ${label}${count ? `<span style="font-family:var(--display);font-variant-numeric:tabular-nums;background:${tone || 'var(--accent)'};color:#fff;border-radius:999px;padding:1px 7px;font-size:11px">${count}</span>` : ''}</button>`;
    return `<span style="margin-left:auto;display:inline-flex;gap:7px;flex-wrap:wrap">
      ${pill('openRevisions', '', 'retry', 'Revise', miss, miss ? 'var(--tricky-deep,#C24545)' : '')}
      ${pill('openTraps', '', 'target', 'My traps', 0, '')}
    </span>`;
  }
  function viewMap() {
    const c = active();
    /* section 1 — the base route */
    state.trailCourse = 'honey';
    const h = actSections(c, 'honey');
    /* section 2 — the Advanced Rounds (the five expeditions), Advanced Pack territory */
    state.trailCourse = 'exp';
    const expOk = advOn() || devOn();
    const x = expOk ? actSections(c, 'exp') : null;
    state.trailCourse = 'honey';
    const price = (window.ADV && ADV.price) ? ADV.price() : 299;
    const advHead = `<div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin:26px 0 12px">
        <span style="font-family:var(--display);font-weight:800;font-size:19px">${esc(T().names.expedition)}</span>
        <span style="font-size:10.5px;font-weight:800;letter-spacing:.08em;color:#fff;background:linear-gradient(135deg,#37415B,#1F2A44);border-radius:999px;padding:4px 11px">90% GATES</span>
        <span style="font-size:12px;color:var(--muted);font-weight:600">national-level expeditions — same map, harder rules</span></div>`;
    const advPart = expOk
      ? advHead + tierBar(x.lap, x.done, x.total) + x.acts
      : advHead + `<button data-act="openAdvanced" style="width:100%;text-align:left;background:var(--bg2);border-radius:18px;padding:22px 24px;box-shadow:0 0 0 1px var(--line);display:flex;align-items:center;gap:16px;flex-wrap:wrap">
          <span style="display:inline-grid;place-items:center;width:52px;height:52px;border-radius:15px;background:linear-gradient(135deg,#37415B,#1F2A44);color:#fff;flex-shrink:0">${iconSVG('target', 26)}</span>
          <span style="min-width:0;flex:1"><span style="display:block;font-family:var(--display);font-weight:800;font-size:16px">Five expert expeditions</span>
          <span style="display:block;font-size:13px;color:var(--muted);margin-top:3px">The hardest chapters in the library — 90% gates, no mercy, national-level words. Unlocks with the Advanced Pack.</span></span>
          <span style="flex-shrink:0;padding:10px 17px;border-radius:11px;background:var(--accent);color:#fff;font-weight:800;font-size:13px;white-space:nowrap">Unlock · $${price}/yr →</span></button>`;
    return `<div style="${RISE()}max-width:660px;margin:0 auto">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px">
        <span style="font-family:var(--display);font-weight:800;font-size:22px">${esc(T().names.honey)}</span>
        ${atlasPills(c)}</div>
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
    const stars = starsOf(c, u, lap); const next = nextStar(c, u, lap);
    const gsvg = window.SB_AVATAR ? `<span style="width:64px;height:64px;flex-shrink:0;display:block">${SB_AVATAR(guide, 64)}</span>` : '';
    const stepCard = (n, title, sub, act2, done2, cta) => `<div style="display:flex;align-items:center;gap:13px;background:var(--bg2);border-radius:16px;padding:13px 15px;box-shadow:0 0 0 1px var(--line),var(--sh-rest)">
      <span style="width:38px;height:38px;flex-shrink:0;display:grid;place-items:center;border-radius:11px;background:${done2 ? 'var(--good)' : 'var(--chip)'};color:${done2 ? '#fff' : 'var(--accent)'};font-family:var(--display);font-weight:800">${done2 ? '✓' : n}</span>
      <span style="min-width:0;flex:1"><span style="display:block;font-family:var(--display);font-weight:800;font-size:14.5px">${title}</span>
      <span style="font-size:12px;color:var(--muted);font-weight:600">${sub}</span></span>
      <button data-act="${act2}" style="flex-shrink:0;padding:9px 16px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:12.5px">${cta}</button></div>`;
    return `<div style="${RISE()}max-width:640px;margin:0 auto">
      <div style="position:relative;border-radius:20px;overflow:hidden;margin-bottom:14px;height:112px">${banner(world, 112, course() === 'exp' ? 3 : 2)}${scrim()}
        <div style="position:absolute;left:14px;right:14px;top:10px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:10px">
          <span style="justify-self:start">${bpill('trailBack', 'Map')}</span>
          <span style="justify-self:center;min-width:0;font-family:var(--display);font-weight:800;font-size:18px;color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.45);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center">${esc(u.title)}</span>
          <span style="justify-self:end;flex-shrink:0;font-size:11px;font-weight:800;color:#fff;background:rgba(0,0,0,.34);border:1px solid rgba(255,255,255,.24);border-radius:999px;padding:4px 11px;white-space:nowrap;display:inline-flex;align-items:center;gap:7px">Tier ${lap} ${starHTML(stars.n, 12)}</span>
        </div></div>
      <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:14px">${gsvg}
        <div style="position:relative;background:var(--bg2);border:1px solid var(--line);border-radius:16px;padding:11px 14px;font-size:13.5px;line-height:1.5;box-shadow:var(--sh-rest)">${esc(String(ch.concept || '').split(/(?<=[.!?])\s/).slice(0, 2).join(' '))}</div></div>
      <div style="display:grid;gap:10px">
        ${stepCard(1, 'Learn the idea', 'The full chapter — cards, method' + (u.gi >= 0 ? ', narration' : '') + ' · ⭐', 'trailLesson', stars.s[1], 'Open')}
        ${stepCard(2, 'Meet the words', 'Flip through to the last card · ⭐', 'trailWords', stars.s[2], 'Browse')}
        ${stepCard(3, 'Practice', stars.p > 0 ? `Best ${stars.p}% · ${PGATE}%+ opens the next stop · ⭐` : `${PGATE}%+ opens the next stop · ⭐`, 'trailPractice', stars.s[0], 'Train')}
        ${stepCard(4, 'The Quiz', `Pass at ${Math.round(gate() * 100)}% ⭐ · ace at ${QSTAR()}% ⭐${stars.q ? ` · best ${stars.q}%` : ''}`, 'trailQuiz', stars.s[3], stars.s[3] ? 'Again' : 'Go!')}
      </div>
      ${stars.s[0]
        ? /* the practice gate is met: the stop offers its THREE ROADS, always —
             move on, chase the stars, or drill a fresh set of this stop's words */
          `<div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:12px">
            <button data-act="trailNextFrom" data-arg="${escA(u.id)}" style="flex:1.2;min-width:150px;padding:13px 16px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:14px;box-shadow:var(--edge)">Next stop →</button>
            ${next ? `<button data-act="${next.act}" style="flex:1;min-width:130px;padding:13px 16px;border-radius:14px;background:color-mix(in srgb,var(--treasure,#FFD24D) 30%,var(--bg2));border:1px solid color-mix(in srgb,var(--treasure,#FFD24D) 60%,var(--line));font-weight:800;font-size:14px">★ Gain stars</button>` : ''}
            <button data-act="trailPractice" style="flex:1;min-width:150px;padding:13px 16px;border-radius:14px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:14px">Practice more words</button>
          </div>
          ${next
            ? `<p style="font-size:12.5px;color:var(--muted);font-weight:700;margin-top:9px;text-align:center">👉 ${esc(next.txt)}</p>`
            : `<p style="font-size:13px;font-weight:800;color:var(--good);margin-top:9px;text-align:center">★★★★★ — this stop is completely yours.</p>`}`
        : (next
          ? `<button data-act="${next.act}" style="display:flex;width:100%;align-items:center;gap:11px;margin-top:12px;padding:13px 16px;border-radius:14px;background:color-mix(in srgb,var(--treasure,#FFD24D) 26%,var(--bg2));border:1px solid color-mix(in srgb,var(--treasure,#FFD24D) 55%,var(--line));text-align:left">
              <span style="font-size:17px">👉</span>
              <span style="flex:1;font-size:13px;font-weight:700;line-height:1.4">${esc(next.txt)}</span>
              <span style="flex-shrink:0;padding:8px 15px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:12.5px">${esc(next.cta)}</span></button>`
          : '')}
    </div>`;
  }
  function viewWords() {
    const c = active(); const u = unit(state.trailUnit); if (!u) return viewMap();
    const ws = lapWords(u, lapOf(c), 24).map(x => ({ w: x.w, d: x.d, s: x.s, p: x.p, o: x.o, h: x.h }));
    state.trailWordsN = ws.length;
    return `<div style="${RISE(".3s")}max-width:640px;margin:0 auto">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><button data-act="trailUnit" data-arg="${escA(u.id)}" style="color:var(--muted);font-weight:700;font-size:13px">← ${esc(u.title.split('—')[0].trim())}</button></div>
      ${wordFlash(ws, state.trailWordIdx || 0, 'trailWordNav', { selfMark: true })}
      <p style="text-align:center;font-size:12px;color:var(--muted);font-weight:600;margin-top:8px">✓ Complete marks it mastered · ⚑ sends it to your Revisions — same as Practice.</p>
    </div>`;
  }
  function viewQuiz() {
    const c = active(); const q2 = state.tq; if (!q2) return viewMap();
    const back = state.trailChk ? 'trailBack' : 'trailUnit';
    if (q2.over && q2.hero != null) {
      const h = lvCfg().heroes[q2.hero] || {};
      return `<div style="${RISE()}max-width:420px;margin:0 auto;text-align:center">
        <div style="background:var(--bg2);border-radius:20px;padding:26px;box-shadow:0 0 0 1px var(--line),var(--glow)">
          <span style="width:84px;height:84px;display:inline-block"><img src="app-art/${h.img}.svg" alt="" style="width:100%;height:100%;object-fit:contain"></span>
          <h2 style="font-family:var(--display);font-size:20px;margin:8px 0 4px">${q2.pass ? esc(h.name) + ' is delighted!' + (q2.heroPaid ? ' · +5 🪙' : '') : 'Almost — try again!'}</h2>
          <p style="font-size:13px;color:var(--muted);margin-bottom:14px">${q2.pass ? (q2.heroPaid ? 'First win of the day.' : 'Already thanked you today — but always happy to play.') : 'The word got away. The ' + esc(h.name.replace(/^the /, '')) + ' will wait.'}</p>
          <div style="display:flex;gap:9px;justify-content:center">
          ${!q2.pass ? `<button data-act="mwHero" data-arg="${q2.hero}" style="padding:12px 20px;border-radius:12px;background:var(--treasure);color:#3a2c00;font-weight:800;font-size:13.5px">Once more!</button>` : ''}
          <button data-act="trailBack" style="padding:12px 22px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:13.5px">Back to the road →</button></div>
        </div></div>`;
    }
    if (q2.over && q2.side != null) {
      const pct = Math.round((q2.pct || 0) * 100);
      const lm = lvCfg().lms[q2.side] || {};
      return `<div style="${RISE()}max-width:420px;margin:0 auto;text-align:center">
        <div style="background:var(--bg2);border-radius:20px;padding:26px;box-shadow:0 0 0 1px var(--line),var(--glow)">
          <span style="width:64px;height:70px;display:inline-block">${lmArt(lm)}</span>
          <h2 style="font-family:var(--display);font-size:20px;margin:8px 0 4px">${q2.pass ? esc(lm.name) + ' says thanks · +12 🪙' : 'The words wriggled away'}</h2>
          <p style="font-size:13px;color:var(--muted);margin-bottom:14px">${q2.pass ? 'Come back tomorrow — there will be more.' : 'No harm done (' + pct + '%). The road is right there.'}</p>
          <button data-act="trailBack" style="padding:12px 22px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:13.5px">Back to the road →</button>
        </div></div>`;
    }
    if (q2.over) {
      const pct = Math.round((q2.pct || 0) * 100);
      return `<div style="${RISE()}max-width:460px;margin:0 auto;text-align:center">
        <div style="background:var(--bg2);border-radius:20px;padding:28px;box-shadow:0 0 0 1px var(--line),var(--glow)">
          <div style="width:92px;height:92px;margin:0 auto 12px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(${q2.pass ? 'var(--good)' : 'var(--bad)'} ${pct}%,var(--surface2) 0)"><div style="width:72px;height:72px;border-radius:50%;background:var(--bg2);display:grid;place-items:center;font-family:var(--display);font-weight:800;font-size:21px">${pct}%</div></div>
          ${q2.lapUp ? `<h2 style="font-family:var(--display);font-size:21px;margin-bottom:6px">TIER ${lapOf(c)} UNLOCKED</h2><p style="font-size:13px;color:var(--muted);margin-bottom:14px">The whole route returns — tougher words, same ideas. That is how it sticks.</p>`
          : q2.pass ? `<h2 style="font-family:var(--display);font-size:21px;margin-bottom:6px">Stop cleared · +15 🪙${q2.bloom ? ' · 🌸 bloom ×2 +15' : ''}${q2.chest ? ' · 🎁 the dared road +25' : ''}</h2><p style="font-size:13px;color:var(--muted);margin-bottom:14px">${q2.chest ? 'You took the dark mushroom knoll first — the chest at the reunion is yours.' : q2.revising ? 'Revenge complete.' : 'The idea is yours. The route rolls on.'}</p>`
          : `<h2 style="font-family:var(--display);font-size:21px;margin-bottom:6px">${pct}% — so close</h2><p style="font-size:13px;color:var(--muted);margin-bottom:14px">You need ${Math.round(gate() * 100)}%. Win back the ${q2.missed.length} you missed, then take it again.</p>`}
          <div style="display:flex;gap:9px;justify-content:center;flex-wrap:wrap">
            ${!q2.pass && q2.missed.length ? `<button data-act="tqRevise" style="padding:12px 20px;border-radius:12px;background:var(--treasure);color:#3a2c00;font-weight:800;font-size:13.5px">⚑ Revise the missed ones</button>` : ''}
            ${!q2.pass ? `<button data-act="${state.trailChk ? 'trailChk' : 'trailQuiz'}" ${state.trailChk ? `data-arg="${escA(state.trailChk)}"` : ''} style="padding:12px 20px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:13.5px">Take it again</button>` : ''}
            <button data-act="trailBack" style="padding:12px 20px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:13.5px">${q2.pass ? 'Back to the Map →' : 'Back'}</button></div>
        </div></div>`;
    }
    const it = q2.items[q2.i]; const picked = q2.picked;
    let body = '';
    if (it.ty === 'kit') {
      body = kitBody(it, q2, picked);
    } else if (it.ty === 'spell') {
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
    return `<div style="${RISE(".3s")}max-width:560px;margin:0 auto">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <button data-act="trailBack" style="color:var(--muted);font-weight:700;font-size:13px">✕ Quit</button>
        <div style="flex:1;height:8px;border-radius:999px;background:var(--surface2);overflow:hidden"><div style="height:100%;background:var(--accent);width:${Math.round(q2.i / q2.items.length * 100)}%"></div></div>
        <span style="font-size:12px;font-weight:800;color:var(--muted)">${q2.i + 1}/${q2.items.length}</span></div>
      <div style="background:var(--bg2);border-radius:18px;padding:clamp(16px,4vw,24px);box-shadow:0 0 0 1px var(--line),var(--glow)">
        <div style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:700;margin-bottom:8px">${it.ty === 'kit' ? (it.kit === 'butterfly' ? '🦋 Butterfly catch' : it.kit === 'comb' ? '🍯 Comb builder' : '🌸 Petal trail') : it.ty === 'spell' ? '🔊 Spell it' : it.ty === 'mean' ? '📖 Meaning' : '💡 Concept'}${state.trailChk ? ' · checkpoint' : ''}${q2.sideName ? ' · ' + esc(q2.sideName) : ''}</div>
        ${q2.heroLine ? `<p style="font-size:13.5px;font-weight:700;color:var(--text);margin:0 0 12px;line-height:1.5">${esc(q2.heroLine)}</p>` : ''}
        ${body}
        ${picked != null ? `<div style="text-align:center;margin-top:14px"><button data-act="tqNext" style="padding:11px 26px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:13.5px">${q2.i + 1 >= q2.items.length ? 'Finish' : 'Next →'}</button></div>` : ''}
      </div>
      <p style="text-align:center;font-size:11.5px;color:var(--muted);font-weight:600;margin-top:8px">Keys: 1–4 answer · Enter check/next · R hear it</p>
    </div>`;
  }
/* ================= THE ATLAS MAP =================
     It is called an atlas, so it is one: a painted bird's-eye continent whose
     regions ARE the acts, with the route drawn between them and a pin you can tap.
     Tapping a region opens that act and its own chapter path.

     PIN coordinates are percentages measured against the painted art
     (app-art/atlas-map.jpg and atlas-adv.jpg, generated by
     voice/pipeline/atlas-art.py). They are hand-placed against what the painter
     actually drew — if the art is ever regenerated, these have to be re-measured. */
  const ATLAS_PINS = {
    honey: [
      ['meadow',   12.5, 70],   // the flower meadow, bottom-left
      ['library',  39,   70],   // the bookshelf canyon
      ['forum',    17,   34],   // the marble forum
      ['storm',    35,   19],   // the crystal storm
      ['roots',    53,   43],   // the engine room, centre
      ['strait',   70,   66],   // the lighthouse strait
      ['junkyard', 85,   53],   // the junkyard
      ['sprints',  62,   14],   // the paper mountains
      ['stage',    85,   13],   // the theatre in the cliff
    ],
    exp: [
      ['proving',  18, 72],     // the lantern-lit proving ground
      ['greysea',  27, 41],     // the fog sea and its red buoy
      ['liars',    54, 46],     // the junkyard, centre
      ['grandtrunk', 70, 37],   // ON the road east of the junkyard - it IS the road,
                                //  and it is the only spot whose chip clears all three
                                //  neighbours' chips (liars, farflung, factory)
      ['farflung', 64, 15],     // the far shore
      ['factory',  83, 18],     // the word factory
    ],
  };
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

  /* One region on the map: a medallion on the art, its name on a glass chip under
     it. Cleared regions are gold, the one you are in glows and carries your avatar,
     the rest are quiet glass. */
  function atlasPin(c, act, idx, x, y, stat, state2, crs) {
    const world = act.world;
    const [a, d] = ACCENT[world] || ACCENT.meadow;
    /* "Act IV · The Storm of Elements" -> "Storm of Elements": the numeral is already
       on the medallion and the article costs four characters of chip width. */
    const label = ((act.title || '').split('·').slice(1).join('·').trim() || act.title).replace(/^The\s+/i, '');
    const cur = state2 === 'cur', done = state2 === 'done', locked = state2 === 'locked';
    const ring = done ? 'linear-gradient(160deg,#FFD24D,#C8791B)' : cur ? `linear-gradient(160deg,${a},${d})` : 'rgba(22,15,44,.52)';
    const size = cur ? 52 : 44;
    const av = cur && window.SB_AVATAR ? SB_AVATAR(c.avatar || 'bizzy', 30) : '';
    /* Fog belongs to a region you have NOT reached. Play-testing asked for exactly this
       swap: bold art everywhere, and the mist kept for what is still ahead, so an unreached
       region recedes instead of the whole map fading. It is on the PIN, not the board — a
       board is never wholly locked, its stops are. */
    return `<button data-act="trailAct" data-arg="${escA(crs + '|' + act.id)}" class="atlas-pin${locked ? ' locked' : ''}${done ? ' done' : ''}"
        style="left:${x}%;top:${y}%;--pz:${cur ? 3 : 2}" title="${escA(label)}">
      <span class="atlas-dot" style="width:${size}px;height:${size}px;background:${ring};
        box-shadow:${cur ? `0 0 0 5px color-mix(in srgb,${a} 26%,transparent),0 6px 16px rgba(10,6,26,.5)` : '0 4px 12px rgba(10,6,26,.45)'};
        border:2px solid rgba(255,255,255,${locked ? '.42' : '.78'})">
        ${av || `<span style="font-family:var(--display);font-weight:800;font-size:${cur ? 15 : 13}px;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.5)">${done ? '★' : ROMAN[idx] || (idx + 1)}</span>`}
      </span>
      <span class="atlas-chip" style="${cur ? `border-color:color-mix(in srgb,${a} 60%,transparent)` : ''}">
        <b>${esc(label)}</b><i>${stat.total ? stat.done + '/' + stat.total + ' stops' : 'ahead'}</i></span>
    </button>`;
  }

  /* the dotted route between the pins, so the order is never in doubt */
  function atlasRoute(pins, upto) {
    if (pins.length < 2) return '';
    const d = pins.map((p, i) => (i ? 'L' : 'M') + p[1] + ' ' + p[2]).join(' ');
    const walked = pins.slice(0, Math.max(1, upto + 1)).map((p, i) => (i ? 'L' : 'M') + p[1] + ' ' + p[2]).join(' ');
    return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1">
      ${/* The strokes were white-on-dark, which was right while the painting behind
            them was at full strength. Over a map deliberately taken down to 42% they
            were the faintest marks on screen — and the route IS the journey. They read
            from CSS custom properties now, so light gets ink and dusk keeps its glow. */''}
      <path d="${d}" fill="none" stroke="var(--rt-guide,rgba(255,255,255,.5))" stroke-width=".8" stroke-dasharray="1.4 2.2" stroke-linecap="round" vector-effect="non-scaling-stroke"
        style="filter:drop-shadow(0 1px 2px var(--rt-sh,rgba(24,14,4,.5)))"/>
      ${upto >= 1 ? `<path d="${walked}" fill="none" stroke="var(--rt-walk,#FFD24D)" stroke-width="1.3" stroke-linecap="round" vector-effect="non-scaling-stroke"
        style="filter:drop-shadow(0 1px 3px var(--rt-sh,rgba(24,14,4,.55)))"/>` : ''}</svg>`;
  }

  function atlasBoard(c, crs) {
    const pins = ATLAS_PINS[crs] || [];
    const acts = actsOf(crs);
    const img = crs === 'exp' ? 'atlas-adv' : 'atlas-map';
    /* an act is done when every stop in it is passed; the current act is the first
       that is not — the same frontier the stops use */
    const s = seq(c); const fr = frontier(c);
    const statOf = id => { const ns = s.map((n, i) => ({ n, i })).filter(x => x.n.act === id);
      return { total: ns.length, done: ns.filter(x => passedNode(c, x.n)).length, here: ns.some(x => x.i === fr) }; };
    let curIdx = -1;
    const cells = pins.map(([id, x, y], i) => {
      const act = acts.find(a2 => a2.id === id); if (!act) return '';
      const st = statOf(id);
      const state2 = st.total && st.done >= st.total ? 'done' : st.here ? 'cur' : st.done ? 'cur' : 'locked';
      if (st.here) curIdx = i;
      return atlasPin(c, act, i, x, y, st, state2, crs);
    }).join('');
    return `<div class="atlas-board">
      <img src="app-art/${img}.jpg" alt="" loading="lazy" decoding="async">
      ${atlasRoute(pins, curIdx)}
      ${cells}</div>`;
  }
  /* ---------------------------------------------------------------
     The third continent. Honey (three tiers) → the Expedition → Ultra.
     The champions' journey was a word list sitting in Practice's catalogue,
     next to "Latin Legends", which made the crown of the product look like a
     word pile. It is a map now: five landmarks, one per block of the Ultra
     Champions Journey, each opening that journey at its own day-block.
     --------------------------------------------------------------- */
  const ULTRA_PINS = [
    ['The proving yard', 17, 70],
    ['The black library', 33, 32],
    ['The crucible',      57, 55],
    ['The observatory',   58, 16],
    ['The championship',  79, 16],
  ];
  function ultraBoard(c) {
    const on = advOn() || devOn();
    const pins = ULTRA_PINS.map(([label, x, y], i) => {
      const dnI = on ? uDnCount(c, i) : 0;
      const open = on && uOpen(c, i);
      const emb = on && !!uP(c).emb['u' + i];
      const isDone = on && dnI >= ULTRA_STOPS;
      const byPass = on && !!uP(c).gates[i] && !(i === 0 || uDnCount(c, i - 1) >= 3);
      const cur = open && !isDone;
      const ring = emb ? 'linear-gradient(160deg,#FFE9AE,#E8A81C)'
        : isDone ? 'linear-gradient(160deg,#FFD24D,#C8791B)'
        : cur ? 'linear-gradient(160deg,#FFE49B,#E8A81C)' : 'rgba(18,14,40,.58)';
      const size = cur ? 52 : 44;
      const sub = !on ? '' : emb ? '<i>🏅 fully mapped</i>'
        : isDone ? '<i>all four cleared</i>'
        : open ? `<i>${dnI}/4 stops${byPass ? ' · by the Hidden Pass' : ''}</i>`
        : '<i>🔒 3 stops behind it — or its Hidden Pass</i>';
      return `<button data-act="${on ? 'ultraAct' : 'openAdvanced'}" data-arg="${i}" class="atlas-pin${open || !on ? '' : ' locked'}"
          style="left:${x}%;top:${y}%;--pz:${cur ? 3 : 2}" title="${escA(label)}">
        <span class="atlas-dot" style="width:${size}px;height:${size}px;background:${ring};
          border:2px solid rgba(255,246,222,${cur || isDone ? '.9' : '.42'});color:${cur || isDone ? '#3B2A00' : 'rgba(255,246,222,.85)'};
          font-family:var(--display);font-weight:800;font-size:${cur ? 17 : 15}px;box-shadow:0 4px 12px rgba(6,4,18,.5)">${emb ? '🏅' : isDone ? '✓' : (i + 1)}</span>
        <span class="atlas-chip"><b>${esc(label)}</b>${sub}</span></button>`;
    }).join('');
    const line = 'Five landmarks, each hiding secrets. Clear 3 of 4 stops to move on — or find the Hidden Pass ⛩️ and skip ahead.';
    return `<div class="atlas-board">
      <img src="app-art/atlas-ultra.jpg" alt="" loading="lazy" decoding="async">
      ${pins}
      <span style="position:absolute;left:12px;bottom:11px;z-index:4;font-size:11.5px;font-weight:800;color:#fff;background:rgba(10,7,26,.56);border-radius:999px;padding:5px 12px;backdrop-filter:blur(3px)">${esc(line)}</span></div>`;
  }
  /* ---------------------------------------------------------------
     Ultra has its own curriculum now, not just five pins over a word pile.
     Five landmarks x four stops = twenty stops. Each stop teaches ONE
     champion technique (SB_ADV_TIPS, 36 authored) and drills its own block
     of the hardest words in the library, taken hardest-first so every stop
     is harder than the one before it. Progress lives at c.ultra.done.
     --------------------------------------------------------------- */
  /* one painted map per landmark, in ULTRA_PINS order */
  const ULTRA_SLUG = ['uproving', 'ulibrary', 'ucrucible', 'uobservatory', 'uchampionship'];
  const ULTRA_STOPS = 4;
  const ULTRA_WORDS = 24;
  const uTips = () => { try { return window.SB_ADV_TIPS || []; } catch (e) { return []; } };
  const uPool = () => { try { return (window.ADV && ADV.pool) ? ADV.pool() : []; } catch (e) { return []; } };
  const uProg = c => (c.ultra || (c.ultra = { done: {} }));
  function ultraStopsOf(ai) {
    const tips = uTips(), pool = uPool(), out = [];
    const total = ULTRA_PINS.length * ULTRA_STOPS;
    for (let k = 0; k < ULTRA_STOPS; k++) {
      const idx = ai * ULTRA_STOPS + k;
      const tip = tips[idx % Math.max(1, tips.length)] || null;
      /* The pool is hardest-first, so stop n owns the nth BAND of it — and the stop's
         words are sampled across that band rather than taken as a contiguous run. Deep
         in the pool the difficulty score flattens and a straight slice returns whatever
         happens to sit together alphabetically, which reads as dictionary dregs. */
      const per = Math.max(ULTRA_WORDS, Math.floor(pool.length / total) || ULTRA_WORDS);
      const band = pool.slice(idx * per, (idx + 1) * per);
      const step = Math.max(1, Math.floor(band.length / ULTRA_WORDS));
      const words = [];
      for (let j = 0; j < ULTRA_WORDS && j * step < band.length; j++) words.push(band[j * step]);
      out.push({ id: 'ul' + idx, idx, tip,
        title: tip ? tip.title : ('Champion block ' + (idx + 1)),
        cat: tip ? tip.cat : 'tactics',
        words: words.filter(Boolean) });
    }
    return out;
  }
  const ultraDone = (c, id) => !!(uProg(c).done || {})[id];
  /* ---------------------------------------------------------------
     THE CHAMPION'S EXPEDITION — the journey was linear: twenty stops
     in a fixed line and a stop marked done the moment Train was TAPPED.
     It briefly wore a fog-of-war veil; play-testing killed the fog
     ("why is the map so dark?" — Ahana, 8.25) while keeping the rest:
       SURPRISES    three secrets seeded PER CHILD sit VISIBLY on each
                    board: a word-wisp (a tap-gift of coins), a rival
                    champion (a best-of-3 spell-duel), and the HIDDEN
                    PASS — spell its 3-word chain and the NEXT landmark
                    opens early (the Cartographer's Gate pays coins on
                    the teaching road).
       NON-LINEAR   two spine stops open at once (pick your order);
                    3 of 4 opens the next landmark; a stop is done at
                    70%+ in a REAL session, not on tap; all four stops
                    plus all three secrets earn the landmark's emblem.
     No XP from any of it — rank still comes from spelling sessions.
     The mist may not return: the board must stay bright.
     --------------------------------------------------------------- */
  const U_SPOTS = [[18, 26], [34, 64], [50, 22], [64, 72], [78, 38], [86, 62], [26, 80], [70, 14], [44, 44], [58, 52]];
  const U_RIVALS = ['Sable the Moth-Knight', 'The Grey Archivist', 'Cinder, Forge-Champion', 'The Star-Reader', "Vex's Own Champion"];
  const uP = c => { const u = uProg(c); u.done = u.done || {}; u.p = u.p || {}; u.rev = u.rev || {};
    u.finds = u.finds || {}; u.gates = u.gates || {}; u.duel = u.duel || {}; u.emb = u.emb || {}; return u; };
  /* the secrets are SEEDED, not random: the same child always finds the same map,
     which reads as authored — and a sibling's map hides them somewhere else */
  /* one expedition layer for EVERY board: honey acts, expeditions and the five
     Ultra landmarks alike. A board is addressed by its KEY — the act id, or
     'u0'..'u4' for Ultra — and all fog, finds and gates hang off that key. */
  const uKey = () => state.trailView === 'ultra' ? ('u' + (state.ultraAct || 0)) : String(state.trailAct || 'meadow');
  function uRand(c, ai) { let h = 2166136261; const s = String((c && c.name) || 'bee') + '|' + ai;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () { h = Math.imul(h ^ (h >>> 15), h | 1); h ^= h + Math.imul(h ^ (h >>> 7), h | 61); return ((h ^ (h >>> 14)) >>> 0) / 4294967296; }; }
  function uSpots(c, ai) { const r = uRand(c, ai); const cand = U_SPOTS.slice();
    for (let i = cand.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = cand[i]; cand[i] = cand[j]; cand[j] = t; }
    return [{ k: 'gate', x: cand[0][0], y: cand[0][1] }, { k: 'duel', x: cand[1][0], y: cand[1][1] }, { k: 'wisp', x: cand[2][0], y: cand[2][1] }]; }
  const uAiOf = key => /^u\d$/.test(String(key)) ? +String(key).slice(1) : -1;
  const uDnCount = (c, ai) => { let n = 0; for (let k = 0; k < ULTRA_STOPS; k++) if (uP(c).done['ul' + (ai * ULTRA_STOPS + k)]) n++; return n; };
  /* a landmark opens by the ROAD (3 of 4 behind it) or by the HIDDEN PASS */
  const uOpen = (c, ai) => ai === 0 || uDnCount(c, ai - 1) >= 3 || !!uP(c).gates[ai];
  function uWordPick(key, n, longOk) {
    const out = []; try {
      const ai = uAiOf(key);
      const ws = (ai >= 0
        ? ultraStopsOf(ai).flatMap(s => s.words)
        : (actsOf(course()).find(a => a.id === key) || { units: [] }).units
            .flatMap(uid => { try { return lapWords(unit(uid), lapOf(active()), 24); } catch (e) { return []; } })
      ).filter(w => w && /^[a-z]+$/i.test(w.w) && w.w.length >= 4 && (longOk || w.w.length <= 12));
      for (let i = 0; i < n && ws.length; i++) out.push(ws.splice(Math.floor(Math.random() * ws.length), 1)[0]); } catch (e) {}
    while (out.length < n) out.push({ w: ['champion', 'courage', 'explore', 'mystery', 'legend'][out.length % 5], d: '' });
    return out; }
  function uCheckEmblem(c, key) { const u = uP(c);
    if (u.emb[key]) return;
    const f = u.finds[key] || {};
    if (!(f.gate && f.duel && f.wisp)) return;
    const ai = uAiOf(key);
    if (ai >= 0 && uDnCount(c, ai) < ULTRA_STOPS) return;   // Ultra also wants all four stops
    u.emb[key] = 1; save();
    try { sfx('win'); burstConfetti(160); } catch (e) {}
    const nm = ai >= 0 ? ULTRA_PINS[ai][0] : ((actsOf(course()).find(a => a.id === key) || {}).title || 'This region');
    flash('🏅 ' + nm + ' — fully mapped! Every secret found.'); }
  app2.ultraAct = i => { const c = active(); const ai = Math.max(0, Math.min(ULTRA_PINS.length - 1, +i || 0));
    if (!(advOn() || devOn())) { app2.openAdvanced && app2.openAdvanced(); return; }
    if (!uOpen(c, ai)) { flash('🔒 Clear 3 stops of the landmark before it — or find its Hidden Pass.'); return; }
    maybeAmbush(c, 'ultra' + ai);
    set({ nav: 'trail', screen: 'app', trailView: 'ultra', ultraAct: ai, ultraStop: null }); };
  app2.ultraPick = i => set({ ultraStop: +i });
  app2.ultraSteps = () => set({ ultraOpen: !state.ultraOpen });
  /* Train the block: the same hand-off the Honey stops use, so Ultra words land in
     Practice with the rest of the speller's record. DONE is no longer stamped here —
     the session reports back through SB_TRAIL_PRACTICED and 70%+ earns the stop. */
  app2.ultraTrain = id => { const c = active(); const ai = state.ultraAct || 0;
    const st = ultraStopsOf(ai).find(x => x.id === id); if (!st) return;
    if (!st.words.length) { flash('The 128k library is still loading — try again in a moment'); return; }
    state.sessionWords = st.words.map(x => ({ w: x.w, d: x.d, s: x.s, p: x.p, o: x.o || '', r: x.r || '' }));
    state.sessionLabel = 'Ultra · ' + st.title; state.gi = 0;
    state.trailReturn = st.id; app2.startTrain(); };

  /* ---- the secret quest cards ---- */
  app2.uqType = v => { if (state.uq) state.uq.typed = String(v == null ? '' : v); };
  app2.uqKey = e => { if (e.key === 'Enter') { e.preventDefault(); app2.uqGo(); } };
  app2.uqSay = () => { try { const q = state.uq; q && say(q.kind === 'duel' || q.kind === 'gate' ? q.words[q.i].w : q.w); } catch (e) {} };
  app2.uqClose = () => { state.uq = null; render(); };
  app2.uqGo = () => { const q = state.uq; if (!q) return; const c = active(); const key = uKey();
    const cur = q.words[q.i]; const okW = nkey(q.typed || '') === nkey(cur.w); q.typed = '';
    if (q.kind === 'duel') {
      if (okW) { q.me++; try { sfx('correct'); } catch (e) {} } else { q.riv++; try { sfx('wrong'); } catch (e) {} flash('It was “' + cur.w + '” — ' + q.rival + ' takes the point.'); }
      q.i++;
      if (q.me >= 2 || q.riv >= 2 || q.i >= q.words.length) {
        const won = q.me > q.riv; state.uq = null;
        const f = uP(c).finds[key] = uP(c).finds[key] || {}; f.duel = 1; uP(c).duel[key] = won ? 1 : -1; save();
        if (won) { addCoins(25); try { sfx('win'); burstConfetti(120); } catch (e) {} flash('🏆 ' + q.rival + ' bows — the duel is yours! +25 🪙'); }
        else flash('🎭 ' + q.rival + ' wins this one — champions come back.');
        uCheckEmblem(c, key);
      } else setTimeout(() => { try { state.uq && say(state.uq.words[state.uq.i].w); } catch (e) {} }, 400);
      render(); return;
    }
    if (q.kind === 'gate') {
      if (!okW) { q.i = 0; try { sfx('wrong'); } catch (e) {} flash('It was “' + cur.w + '” — the chain breaks. Start it again!'); setTimeout(() => { try { state.uq && say(state.uq.words[0].w); } catch (e) {} }, 500); render(); return; }
      q.i++; try { sfx('correct'); } catch (e) {}
      if (q.i >= q.words.length) {
        state.uq = null; const f = uP(c).finds[key] = uP(c).finds[key] || {}; f.gate = 1;
        const ai = uAiOf(key);
        if (ai >= 0 && ai < ULTRA_PINS.length - 1) { uP(c).gates[ai + 1] = 1; flash('⛩️ The Hidden Pass opens — ' + ULTRA_PINS[ai + 1][0] + ' is yours to enter!'); }
        else if (ai === ULTRA_PINS.length - 1) { addCoins(40); flash('👑 The last gate holds a crown relic — +40 coins!'); }
        else { /* the teaching road keeps its order — here the gate is the CARTOGRAPHER'S */
          addCoins(20);
          flash('🗺️ The Cartographer\'s Gate swings open — +20 coins!'); }
        try { sfx('win'); burstConfetti(140); } catch (e) {} save(); uCheckEmblem(c, key);
      } else setTimeout(() => { try { state.uq && say(state.uq.words[state.uq.i].w); } catch (e) {} }, 400);
      render(); return;
    } };
  app2.uDuel = () => { const key = uKey(); if (state.uq) return;
    const f = uP(active()).finds[key] || {}; if (f.duel) { flash('That duel is settled.'); return; }
    const ai = uAiOf(key);
    state.uq = { kind: 'duel', rival: (ai >= 0 ? U_RIVALS[ai] : U_RIVALS[Math.abs(String(key).length) % U_RIVALS.length]) || 'The Rival', words: uWordPick(key, 3), i: 0, me: 0, riv: 0, typed: '' };
    render(); setTimeout(() => { try { state.uq && say(state.uq.words[0].w); } catch (e) {} }, 400); };
  app2.uGate = () => { const key = uKey(); if (state.uq) return;
    const f = uP(active()).finds[key] || {}; if (f.gate) { flash('This pass already stands open.'); return; }
    state.uq = { kind: 'gate', words: uWordPick(key, 3, true), i: 0, typed: '' };
    render(); setTimeout(() => { try { state.uq && say(state.uq.words[0].w); } catch (e) {} }, 400); };
  app2.uWisp = () => { const key = uKey(); const c = active();
    const f = uP(c).finds[key] = uP(c).finds[key] || {}; if (f.wisp) return;
    f.wisp = 1; addCoins(8); save(); try { burstConfetti(50); } catch (e) {} flash('💫 A word-wisp — +8 coins!'); uCheckEmblem(c, key); render(); };
  /* the secrets layer: NO fog — the painting stays bright (that is a play-tested
     rule, see the block comment above). The three seeded secrets sit visibly on
     the board as tappable surprise markers; a claimed one leaves either nothing
     (wisp, duel) or the open gate. */
  function fogLayer(c, key) {
    const u = uP(c);
    if (u.emb[key]) return { fog: '', cells: '', marks: '' };
    const f = u.finds[key] || {};
    const mk = (act, x, y, g, tt) => `<button data-act="${act}" class="sb-lift atlas-secret" style="position:absolute;left:${x}%;top:${y}%;transform:translate(-50%,-50%);z-index:3;font-size:26px;line-height:1;background:none;filter:drop-shadow(0 2px 6px rgba(6,4,18,.6))" title="${tt}">${g}</button>`;
    const marks = uSpots(c, key).map(s => {
      if (s.k === 'wisp') return f.wisp ? '' : mk('uWisp', s.x, s.y, '💫', 'A word-wisp!');
      if (s.k === 'duel') return f.duel ? '' : mk('uDuel', s.x, s.y, '🎭', 'A rival waits…');
      return f.gate ? `<span style="position:absolute;left:${s.x}%;top:${s.y}%;transform:translate(-50%,-50%);z-index:3;font-size:26px;opacity:.75;filter:drop-shadow(0 2px 6px rgba(6,4,18,.6))" title="The pass stands open">⛩️</span>` : mk('uGate', s.x, s.y, '⛩️', 'The Hidden Pass');
    }).join('');
    return { fog: '', cells: '', marks };
  }
  function uQuestCard() {
    const q = state.uq; if (!q) return '';
    const input = `<input data-inp="uqType" data-key="uqKey" data-fkey="uqType" value="${escA(q.typed || '')}" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="spell it…" style="width:100%;max-width:300px;display:block;margin:0 auto 12px;padding:13px 15px;border-radius:12px;border:1.5px solid var(--line);background:var(--surface);font-size:17px;font-weight:800;text-align:center;letter-spacing:.08em;outline:none">`;
    const hear = `<button data-act="uqSay" style="display:inline-flex;align-items:center;gap:7px;padding:11px 20px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:13.5px;box-shadow:var(--edge);margin-bottom:12px">🔊 Hear the word</button>`;
    const frame = inner => `<div style="position:fixed;inset:0;z-index:120;display:grid;place-items:center;padding:18px;background:rgba(14,10,26,.62)">
      <div style="width:min(440px,94vw);background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:24px;text-align:center;box-shadow:0 18px 50px rgba(0,0,0,.45);animation:sb-rise .3s ease both">${inner}</div></div>`;
    if (q.kind === 'duel') return frame(`<div style="font-size:40px">🎭</div>
      <h3 style="font-family:var(--display);font-weight:800;font-size:19px;margin:8px 0 3px">${esc(q.rival)} challenges you!</h3>
      <p style="font-size:13px;color:var(--muted);margin:0 0 8px">Best of three words. Win two and the clearing is yours.</p>
      <div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:10px">You ${q.me} · ${q.riv} them <span style="color:var(--muted);font-weight:700">— word ${Math.min(q.i + 1, 3)} of 3</span></div>
      ${hear}${input}
      <button data-act="uqGo" style="padding:13px 22px;border-radius:14px;background:var(--good);color:#fff;font-weight:800;font-size:14.5px;box-shadow:var(--edge)">⚔️ Spell it!</button>`);
    // gate
    return frame(`<div style="font-size:40px">⛩️</div>
      <h3 style="font-family:var(--display);font-weight:800;font-size:19px;margin:8px 0 3px">The Hidden Pass</h3>
      <p style="font-size:13px;color:var(--muted);margin:0 0 8px;line-height:1.5">Three words, spelled in an unbroken chain, and the gate swings open — <b>on the Ultra road it unlocks the next landmark early; elsewhere it unveils the whole map</b>.</p>
      <div style="display:flex;gap:6px;justify-content:center;margin-bottom:10px">${q.words.map((_, ix) => `<span style="width:12px;height:12px;border-radius:50%;background:${ix < q.i ? 'var(--good)' : 'var(--surface2)'};border:1px solid var(--line)"></span>`).join('')}</div>
      ${hear}${input}
      <div style="display:flex;gap:9px;justify-content:center"><button data-act="uqGo" style="padding:13px 22px;border-radius:14px;background:var(--good);color:#fff;font-weight:800;font-size:14.5px;box-shadow:var(--edge)">⛓️ Forge the chain</button>
      <button data-act="uqClose" style="padding:13px 18px;border-radius:14px;background:var(--surface2);border:1px solid var(--line);color:var(--muted);font-weight:800;font-size:13.5px">Step back</button></div>`);
  }

  function viewUltraAct() {
    const c = active(); const ai = state.ultraAct || 0;
    const [name] = ULTRA_PINS[ai];
    const stops = ultraStopsOf(ai);
    const dn = stops.filter(x => ultraDone(c, x.id)).length;
    let sel = stops.findIndex(x => !ultraDone(c, x.id)); if (sel < 0) sel = stops.length - 1;
    if (state.ultraStop != null) sel = Math.max(0, Math.min(stops.length - 1, state.ultraStop));
    const cur = stops[sel], tip = cur.tip;
    const slug = ULTRA_SLUG[ai] || ULTRA_SLUG[0];
    const m = mapOf(slug);
    const pts = mapPoints(m.d, stops.length);
    /* NON-LINEAR SPINE: the next TWO undone stops are open at once — pick your order */
    const isOpen = i => !ultraDone(c, stops[i].id) && i <= dn + 1;
    const FL = fogLayer(c, 'u' + ai);
    const marks = pts.map((p, i) => {
      const done = ultraDone(c, stops[i].id), now = isOpen(i), on = i === sel;
      const size = now ? 42 : 34;
      const bg = done ? 'linear-gradient(160deg,#FFD24D,#C8791B)' : now ? 'linear-gradient(160deg,#FFFBEF,#FFE9AE)' : 'rgba(246,242,232,.90)';
      const ink = done ? '#4A3306' : now ? '#7A5300' : 'rgba(58,44,22,.78)';
      return `<button class="atlas-stop${now ? ' now' : ''}${on ? ' on' : ''}" data-act="ultraPick" data-arg="${i}"
          style="left:${p.x.toFixed(2)}%;top:${p.y.toFixed(2)}%;--pz:${on ? 5 : now ? 4 : 3}"
          title="Stop ${i + 1} of ${stops.length}" aria-label="Stop ${i + 1} of ${stops.length}">
        <span class="atlas-sd" style="width:${size}px;height:${size}px;background:${bg};color:${ink};
          box-shadow:${on ? '0 0 0 3px #F0B429,0 5px 14px rgba(6,4,18,.6)' : '0 4px 11px rgba(6,4,18,.55)'}">${done ? '✓' : (i + 1)}</span>
      </button>`;
    }).join('');
    const caches = (m.t || []).map((xy, i) => treMark(c, slug, i, xy[0], xy[1], dn, stops.length)).join('');
    const popNew = _popK !== ('u:' + slug + ':' + sel); if (popNew) _popK = 'u:' + slug + ':' + sel;
    if (popNew || _fresh) panTo(sel, pts);   // never yank a hand-scrolled board on a background render
    return `<div style="${RISE()}max-width:900px;margin:0 auto">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <button data-act="trailToMap" style="display:inline-flex;align-items:center;gap:6px;font-weight:800;font-size:13px;color:var(--muted)">← The map</button>
        <span style="margin-left:auto;display:inline-flex;align-items:center;gap:7px">
          ${musicPill()}<span style="font-size:12px;font-weight:800;color:var(--muted)">Ultra Champions</span>${ring(dn, stops.length, dn === stops.length ? 'var(--good)' : '#FFD24D', 34)}</span>
      </div>
      <div style="margin-bottom:10px">
        <span style="display:block;font-family:var(--display);font-weight:800;font-size:22px;line-height:1.1">${esc(name)}</span>
        <span style="display:block;font-size:12.5px;color:var(--muted);font-weight:700;margin-top:2px">Landmark ${ai + 1} of ${ULTRA_PINS.length} · ${dn} of ${stops.length} stops · ${Object.keys(uP(c).finds['u' + ai] || {}).length}/3 secrets · the hardest words in the library</span>
      </div>
      ${actBoard('map-' + slug, m, pts, Math.max(0, Math.min(stops.length - 1, dn)), FL.fog + marks + FL.cells + FL.marks, caches, true)}
      ${villainCard(c)}${treGiftCard()}${uQuestCard()}
      <div class="sb-card" style="margin-top:14px;padding:16px 18px 18px">
        <div style="font-size:11.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)">Stop ${sel + 1} of ${stops.length}${tip ? ' · ' + esc(tip.cat) : ''}${ultraDone(c, cur.id) ? ' · done' : ''}</div>
        <div style="font-family:var(--display);font-weight:800;font-size:20px;line-height:1.15;margin-top:4px">${tip && tip.ic ? tip.ic + ' ' : ''}${esc(cur.title)}</div>
        ${tip ? `<p style="margin:8px 0 0;font-size:14px;line-height:1.55;color:var(--muted)">${esc(tip.hook)}</p>` : ''}
        ${(tip && state.ultraOpen) ? `<div style="margin-top:12px;display:flex;flex-direction:column;gap:8px">
            ${tip.steps.map((x, i) => `<div style="display:flex;gap:9px;font-size:13.5px;line-height:1.5"><span style="font-family:var(--mono);font-weight:800;color:var(--accent);flex-shrink:0">${i + 1}</span><span>${esc(x)}</span></div>`).join('')}
            ${tip.example ? `<div style="margin-top:4px;padding:10px 12px;border-radius:10px;background:var(--surface2);font-size:13px;line-height:1.5"><b>Worked example.</b> ${esc(tip.example)}</div>` : ''}
          </div>` : ''}
        <div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:14px">
          ${tip ? `<button data-act="ultraSteps" style="display:inline-flex;align-items:center;gap:7px;padding:11px 17px;border-radius:var(--r-md,10px);background:${state.ultraOpen ? 'var(--surface2)' : 'var(--action,var(--accent))'};color:${state.ultraOpen ? 'var(--muted)' : 'var(--action-ink,#fff)'};font-weight:800;font-size:14px;${state.ultraOpen ? 'border:1px solid var(--line)' : 'box-shadow:var(--edge)'}">${iconSVG('bulb', 15)} ${state.ultraOpen ? 'Hide the technique' : 'Learn the technique'}</button>` : ''}
          <button data-act="ultraTrain" data-arg="${escA(cur.id)}" style="display:inline-flex;align-items:center;gap:7px;padding:11px 17px;border-radius:var(--r-md,10px);background:var(--paper,var(--bg2));border:1px solid var(--line);color:var(--ink,var(--text));font-weight:800;font-size:13.5px">${iconSVG('pencil', 15)} Train these ${cur.words.length || ULTRA_WORDS} words</button>
        </div>
        ${cur.words.length ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:13px">${cur.words.slice(0, 8).map(w => `<span style="font-family:var(--mono);font-size:12px;font-weight:700;padding:4px 9px;border-radius:999px;background:var(--surface2);color:var(--muted)">${esc(w.w)}</span>`).join('')}${cur.words.length > 8 ? `<span style="font-size:12px;color:var(--muted);font-weight:700;align-self:center">+${cur.words.length - 8} more</span>` : ''}</div>` : `<div class="sb-cn" style="margin-top:12px">The 128,000-word library loads on first use — open this stop again in a moment.</div>`}
      </div>
    </div>`;
  }
  function viewAtlas() {
    const c = active();
    state.trailCourse = 'honey';
    const h = actSections(c, 'honey');
    const board = atlasBoard(c, 'honey');
    state.trailCourse = 'exp';
    const expOk = advOn() || devOn();
    const x = expOk ? actSections(c, 'exp') : null;
    const advBoard = atlasBoard(c, 'exp');
    state.trailCourse = 'honey';
    const price = (window.ADV && ADV.price) ? ADV.price() : 299;
    return `<div style="${RISE()}max-width:980px;margin:0 auto">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px">
        <span style="font-family:var(--display);font-weight:800;font-size:22px">${esc(T().names.honey)}</span>
        ${atlasPills(c)}</div>
      ${tierBar(h.lap, h.done, h.total)}
      ${board}
      <p style="font-size:12.5px;color:var(--muted);font-weight:600;margin:10px 2px 22px">Tap a region to walk it. ${h.lap === 1 ? 'Tier 1 keeps every word at your level — the same continent returns tougher at Tier 2.' : 'Tier ' + h.lap + ' of 3 — the same continent, harder words.'}</p>
      <div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin:0 0 12px">
        <span style="font-family:var(--display);font-weight:800;font-size:19px">${esc(T().names.expedition)}</span>
        <span style="font-size:10.5px;font-weight:800;letter-spacing:.08em;color:#fff;background:linear-gradient(135deg,#37415B,#1F2A44);border-radius:999px;padding:4px 11px">90% GATES</span></div>
      ${expOk ? tierBar(x.lap, x.done, x.total) : ''}
      <!-- min-height only when LOCKED. The panel takes its height from the map's
           aspect ratio, so on a phone it is about 200px (184px at 360px wide) while
           the lock content — icon, heading, two-line paragraph, price button — is
           272px. The button fell out of the bottom of the panel and landed on the
           next section's heading. Desktop never showed it: there the map is 596px
           tall and the content has room to spare. -->
      <div style="position:relative${expOk ? '' : ';min-height:302px'}">
        ${advBoard}
        <!-- The scrim used to start at .34 opacity, which is nowhere near enough to
             cover what is under it: the expedition map's region labels are white
             pills on dark discs, and they punched straight through "Six expert
             expeditions" and its paragraph. It read as a broken screen rather than
             as a locked one. Stronger now, and blurred, so the map is still legibly
             THERE — you can see there is something to unlock — without any of its
             lettering competing with the lettering on top of it. -->
        ${expOk ? '' : `<button data-act="openAdvanced" style="position:absolute;inset:0;z-index:5;display:grid;place-items:center;border-radius:20px;background:linear-gradient(180deg,rgba(12,9,28,.66),rgba(12,9,28,.88));-webkit-backdrop-filter:blur(3.5px);backdrop-filter:blur(3.5px)">
          <span style="text-align:center;padding:22px;max-width:26em">
            <span style="display:inline-grid;place-items:center;width:52px;height:52px;border-radius:15px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.3);color:#fff;margin-bottom:12px">${iconSVG('lock', 24)}</span>
            <span style="display:block;font-family:var(--display);font-weight:800;font-size:19px;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.6)">Six expert expeditions</span>
            <span style="display:block;font-size:13px;line-height:1.5;color:rgba(255,255,255,.92);margin-top:6px">54 stops at national level, each on its own map, gated at 90%. Unlocks with the Advanced Pack.</span>
            <span style="display:inline-block;margin-top:14px;padding:11px 20px;border-radius:11px;background:#FFC23D;color:#241E33;font-weight:800;font-size:14px">Unlock &middot; $${price}/yr &rarr;</span></span></button>`}
      </div>
      <div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin:26px 0 12px">
        <span style="font-family:var(--display);font-weight:800;font-size:19px">Ultra Champions</span>
        <span style="font-size:10.5px;font-weight:800;letter-spacing:.08em;color:#241E33;background:linear-gradient(135deg,#FFE49B,#E8A81C);border-radius:999px;padding:4px 11px">THE LAST CONTINENT</span></div>
      <div style="position:relative">
        ${ultraBoard(c)}
        ${expOk ? '' : `<button data-act="openAdvanced" style="position:absolute;inset:0;z-index:5;display:grid;place-items:center;border-radius:20px;background:linear-gradient(180deg,rgba(10,8,26,.40),rgba(10,8,26,.80))">
          <span style="text-align:center;padding:22px;max-width:26em">
            <span style="display:inline-grid;place-items:center;width:52px;height:52px;border-radius:15px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.3);color:#fff;margin-bottom:12px">${iconSVG('crown', 24)}</span>
            <span style="display:block;font-family:var(--display);font-weight:800;font-size:19px;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.6)">The champions' journey</span>
            <span style="display:block;font-size:13px;line-height:1.5;color:rgba(255,255,255,.92);margin-top:6px">Every word in the library, hardest first, in day-sized blocks. The end of the road.</span>
            <span style="display:inline-block;margin-top:14px;padding:11px 20px;border-radius:11px;background:#FFC23D;color:#241E33;font-weight:800;font-size:14px">Unlock &middot; $${price}/yr &rarr;</span></span></button>`}
      </div>
      <p style="font-size:12.5px;color:var(--muted);font-weight:600;margin:10px 2px 4px">Three continents, one journey: the Honey continent three tiers deep, then the Expedition, then Ultra.</p>
    </div>`;
  }
  /* ---------------------------------------------------------------
     One act = one painted map of its own.

     A region used to open as the 880x244 scenery STRIP its world used for
     banners, which meant the two acts that share a world opened the same
     picture: the Root Kingdoms and the Word Factory are both the engine, the
     Trickster Junkyard and the Liars' Junkyard are both the junkyard. Every act
     and expedition has its own bird's-eye map now (app-art/map-<actId>.jpg,
     built by voice/pipeline/act-maps.py), and so does each of the five Ultra
     landmarks.

     ACT_MAP carries, per map, the ROUTE traced along the road the painter
     actually put in the picture, and the CACHES they left in its corners. Both
     are in the picture's own 0-100 space for x AND y, because the board is
     drawn with preserveAspectRatio="none" — so a coordinate is a percentage of
     the board either way and the same numbers work at 390px and 1240px. There
     is no way to derive these: a route the stops do not sit on is worse than no
     route at all, so each one is measured against its own painting.
     --------------------------------------------------------------- */
  const ACT_ROUTE_FALLBACK = 'M 4 88 C 20 93, 34 86, 48 83 S 74 78, 85 71 C 93 66, 93 57, 84 53 C 70 47, 50 52, 34 49 S 13 43, 9 34 C 6 26, 16 20, 30 17 S 58 12, 75 11 C 86 10, 93 8, 97 4';
  const ACT_MAP = {
    /* the nine acts of the Honey continent */
    meadow:     { d: 'M 1 73 C 12 82, 28 86, 44 84 C 58 82, 68 76, 76 66 C 83 56, 86 44, 88 32 C 89 22, 87 12, 85 4', t: [[5, 7], [89, 6], [73, 88]] },
    library:    { d: 'M 14 94 C 28 88, 44 84, 58 79 C 70 74, 79 66, 83 55 C 87 44, 85 32, 79 22 C 74 14, 70 8, 68 2', t: [[93, 18], [96, 62], [94, 80]] },
    forum:      { d: 'M 3 66 C 14 74, 32 78, 50 77 C 66 76, 78 70, 84 58 C 89 46, 88 32, 82 22 C 76 13, 76 8, 82 5 C 88 3, 93 3, 98 3', t: [[4, 8], [13, 84], [77, 80]] },
    storm:      { d: 'M 2 80 C 16 78, 30 74, 44 68 C 57 63, 66 56, 74 48 C 82 40, 88 30, 91 20 C 93 13, 95 8, 97 5', t: [[6, 70], [89, 7], [91, 74]] },
    roots:      { d: 'M 2 54 C 12 66, 26 73, 42 75 C 56 76, 66 70, 74 60 C 82 50, 86 38, 92 28 C 95 22, 96 16, 96 10', t: [[7, 60], [86, 52], [67, 73]] },
    strait:     { d: 'M 4 88 C 14 80, 20 68, 22 56 C 24 44, 20 32, 22 22 C 25 12, 36 8, 50 8 C 64 8, 78 8, 88 6 C 93 5, 96 4, 98 3', t: [[5, 80], [95, 28], [92, 88]] },
    junkyard:   { d: 'M 1 48 C 12 60, 26 70, 44 71 C 58 72, 70 66, 78 56 C 86 46, 90 34, 92 24 C 94 16, 96 10, 97 6', t: [[5, 12], [66, 14], [65, 86]] },
    sprints:    { d: 'M 2 16 C 16 14, 32 16, 42 24 C 52 32, 52 44, 44 52 C 36 60, 34 70, 44 75 C 58 81, 76 76, 87 66 C 93 60, 96 53, 97 46', t: [[6, 12], [67, 52], [92, 88]] },
    stage:      { d: 'M 4 84 C 18 82, 34 79, 50 75 C 62 72, 72 66, 77 55 C 82 44, 82 32, 76 22 C 71 14, 68 8, 68 3', t: [[5, 10], [89, 80], [86, 89]] },
    /* the six expeditions of the Advanced Rounds */
    proving:    { d: 'M 3 88 C 18 84, 32 76, 42 68 C 52 60, 54 50, 46 44 C 38 38, 24 40, 18 34 C 13 28, 20 21, 34 18 C 50 15, 70 17, 84 22 C 92 25, 96 30, 97 36', t: [[76, 50], [92, 87], [7, 55]] },
    greysea:    { d: 'M 6 82 C 18 78, 30 74, 40 68 C 48 62, 50 52, 48 44 C 47 38, 52 33, 62 33 C 74 33, 84 34, 92 30 C 96 28, 98 24, 98 20', t: [[4, 74], [47, 12], [46, 88]] },
    liars:      { d: 'M 2 80 C 14 76, 26 68, 40 63 C 52 59, 60 55, 70 57 C 80 59, 88 64, 94 60 C 97 58, 98 54, 98 50', t: [[28, 42], [88, 17], [91, 87]] },
    grandtrunk: { d: 'M 7 91 C 18 84, 30 76, 44 71 C 56 67, 66 63, 76 55 C 84 48, 87 38, 88 28 C 89 20, 90 16, 92 13', t: [[7, 74], [24, 54], [90, 88]] },
    farflung:   { d: 'M 4 90 C 10 82, 16 74, 24 68 C 32 62, 44 59, 58 59 C 70 59, 80 62, 88 60 C 93 59, 97 56, 98 52', t: [[7, 20], [92, 20], [92, 88]] },
    factory:    { d: 'M 4 84 C 8 74, 7 60, 8 46 C 9 34, 16 24, 28 19 C 42 13, 58 13, 71 18 C 81 22, 87 31, 89 43 C 90 52, 89 60, 86 68', t: [[4, 72], [12, 10], [92, 88]] },
    /* the five Ultra landmarks */
    uproving:      { d: 'M 5 84 C 16 76, 26 66, 30 54 C 33 44, 42 40, 54 41 C 66 42, 78 46, 86 52 C 92 57, 96 62, 97 68', t: [[5, 78], [92, 18], [92, 88]] },
    ulibrary:      { d: 'M 6 80 C 18 76, 32 70, 46 70 C 58 70, 70 66, 76 56 C 82 45, 80 32, 74 24 C 70 18, 68 12, 68 6', t: [[5, 73], [26, 42], [79, 88]] },
    ucrucible:     { d: 'M 6 80 C 20 76, 36 73, 52 74 C 66 75, 78 74, 86 66 C 92 59, 93 48, 88 38 C 84 30, 80 24, 78 18', t: [[6, 12], [16, 50], [86, 86]] },
    uobservatory:  { d: 'M 4 74 C 12 64, 18 54, 20 44 C 22 34, 30 26, 44 22 C 58 18, 70 20, 76 28 C 81 35, 82 44, 80 52', t: [[95, 12], [5, 82], [90, 88]] },
    uchampionship: { d: 'M 6 82 C 20 78, 36 75, 50 73 C 62 71, 72 66, 78 56 C 84 46, 84 34, 78 26 C 74 20, 72 14, 72 8', t: [[6, 12], [95, 88], [8, 60]] },
  };
  const mapOf = id => ACT_MAP[id] || { d: ACT_ROUTE_FALLBACK, t: [[10, 19], [91, 17], [85, 86]] };

  /* Arc-length placement along a route, done once per render. n stops spread
     evenly over the walkable middle of the path, so the same map holds two stops
     at Tier I and twenty-two at Tier III without anyone re-measuring anything.
     Falls back to a straight diagonal if the browser cannot measure the path
     (it always can, but the map must not depend on it). */
  /* The world is FROZEN once and reused.

     This walks a cubic by arc length, which means one createElementNS, one
     getTotalLength and n getPointAtLength calls — real SVG geometry work, in the DOM.
     It sat on the render path: the app re-renders from `state` on nearly every
     interaction, and a 22-stop act therefore re-solved the same 22 points, against the
     same unchanged curve, several times a second. Nothing about a road moves.

     It is a pure function of (d, n), so the cache is exact rather than a guess: same
     path and same stop count can only ever produce the same points. Keyed on both,
     because one act's road serves 2 stops at Tier I and 22 at Tier III. The returned
     arrays are frozen — a caller that mutated one would corrupt every later render,
     and that is the one way a cache like this goes wrong quietly. */
  const _ptCache = Object.create(null);
  function mapPoints(d, n) {
    const key = n + '|' + d;
    const hit = _ptCache[key];
    if (hit) return hit;
    const out = [];
    let path = null, L = 0;
    try {
      path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d); L = path.getTotalLength();
    } catch (e) { L = 0; }
    for (let i = 0; i < n; i++) {
      const f = n === 1 ? .5 : .045 + (i / (n - 1)) * .91;
      let x = 8 + f * 84, y = 88 - f * 78;
      if (L) { const pt = path.getPointAtLength(f * L); x = pt.x; y = pt.y; }
      /* the board clips, so no marker may sit on an edge — a route traced to the
         corner of its painting would put half a medallion outside the frame */
      x = Math.min(96, Math.max(4, x)); y = Math.min(93, Math.max(7, y));
      out.push(Object.freeze({ x, y, f }));
    }
    // getTotalLength returns 0 before the SVG machinery is ready; that fallback is a
    // straight diagonal, not the road, so it must never be the answer we keep.
    if (L) _ptCache[key] = Object.freeze(out);
    return out;
  }

  /* ================= THE LIVING MEADOW (Act I pilot) =================
     The Meadow is the pilot of the Living Atlas: a four-plate PANORAMA
     (app-art/map-meadow-pano.jpg) the camera unrolls leg by leg. The reveal law:
     the future is hidden by the CAMERA (scroll clamp — it lies off the canvas),
     never by fog; everything on screen is always fully painted and bright.
     Pieces: the unrolling camera + teased bend · a daily seed (bonus bloom,
     wanderer, cosmetic weather) · four landmarks with side kit-rounds · a
     half-blind fork pair · the child's own avatar riding the road · and three
     place-true KIT mechanics woven into the stop quizzes (Butterfly Catch,
     Comb Builder, Petal Trail). devUnlock (Testing tools) reveals everything. */
  const MW = {
    img: 'map-meadow-pano.jpg',
    aspect: 6.815,                    // pano is 5234x768
    // the route across the full pano (x 0-100 spans all four plates)
    d: 'M 1 62 C 5 74, 11 80, 17 76 C 22 72, 22 60, 26 56 C 30 52, 34 58, 38 62 C 42 66, 46 62, 48 54 C 50 46, 54 44, 58 50 C 62 56, 66 58, 70 52 C 74 46, 78 44, 82 48 C 86 52, 90 50, 93 42 C 95 36, 97 30, 98 24',
    t: [[4, 12], [46, 16], [95, 66]],   // the three cache spots on the pano
    legEdge: [26.5, 50.5, 75.5, 100],   // right edge of each leg, in pano %
    legName: ['the Meadow Gate', 'the Lollipop Grove', 'the Mushroom Hollow', 'the Hive Gates'],
    pair: [7, 8],                       // the half-blind fork: both open together
    pairPos: { 7: { y: -15, tag: 'the dark mushroom knoll' }, 8: { y: 13, tag: 'the petal bridge' } },
    wander: { g: '🐻', name: 'Barnaby' },
    /* a landmark is ANCHORED (anch:1) when the painter already put it in the
       plate — the hotspot + glint + label ride the PAINTED feature, no sprite
       duplicate. Sprites are only for features the painting does not have. */
    lms: [
      { x: 9,    y: 30, leg: 0, name: 'the Beehive',      kit: 'comb',      g: '🐝', art: 'mw-lm-beehive' },
      { x: 40,   y: 62, leg: 1, name: 'the Wishing Well', kit: 'petal',     g: '🪙', art: 'mw-lm-well', anch: 1 },
      { x: 63,   y: 47, leg: 2, name: 'the Blossom Arch', kit: 'butterfly', g: '🦋', art: 'mw-lm-arch', anch: 1 },
      { x: 88,   y: 74, leg: 3, name: 'the Old Oak Door', kit: 'comb',      g: '🚪', art: 'mw-lm-oak' },
    ],
    /* pokeable painted things — a tap makes them boing and shed sparkles; one
       seeded spot a day hides a petal shower and a little honey */
    pokes: [[7, 55], [13, 34], [19, 74], [30, 56], [36, 30], [44, 66],
      [55, 42], [62, 72], [70, 34], [80, 50], [88, 34], [94, 66]],
    /* the ambient LIFE LAYER this country supports (each key is a creature
       system that already knows how to move; a country only picks its cast) */
    amb: { butter: 1, petals: 1, birds: 1, seeds: 1, wisps: 1, bees: 1,
      water: [[30.5, 62], [31.5, 72], [33, 80], [35.5, 58], [37, 68]] },
    /* HERO set-pieces: one or two INTEGRATED living things per country — they
       belong to the painting and they MOVE (sway, breathe, flutter), and a tap
       answers with something (petals, spores, bees). Kids find them themselves. */
    heroes: [
      { x: 15,   y: 56, w: 170, img: 'mw-hero-tree',   anim: 'sway',    burst: '🌸', name: 'the whispering cherry',
        kit: 'petal',     line: 'The cherry whispers a word on the wind — hop its petals!' },
      { x: 46.5, y: 46, w: 120, img: 'mw-hero-lolly',  anim: 'sway2',   burst: '✨', name: 'the great lollipop',
        kit: 'butterfly', line: 'Three butterflies circle the lollipop — only one spells it sweetly!' },
      { x: 57,   y: 93, w: 130, img: 'mw-hero-shroom', anim: 'breathe', burst: '🟢', name: 'the grand toadstool',
        kit: 'comb',      line: 'The toadstool hums a word in pieces — build it back!' },
      { x: 90,   y: 44, w: 95,  img: 'mw-hero-flag',   anim: 'flutter', burst: '🐝', name: 'the hive banner',
        kit: 'spell',     line: 'A bee lands with a message — hear it and spell it true!' },
    ],
  };
  /* ============ THE LIVING ATLAS (every Honey act) ============
     Each act carries the same machinery the Meadow piloted — the unrolling
     camera, the daily seed, one landmark side-round, one hero set-piece, the
     wanderer, pokes, and the kit rounds RESKINNED in the country's own verbs
     ("do meadow things in the meadow, Roman things in the forum"). All eight
     panos share the Meadow's exact geometry (5234x768, legs at the same
     seams), so legEdge is common; only the fork pair stays Meadow-only. */
  const LEGS4 = [26.5, 50.5, 75.5, 100];
  /* two more route rhythms so neighbouring countries do not share a road */
  const RD_B = 'M 1 58 C 4 68, 9 76, 15 72 C 21 68, 24 56, 30 53 C 36 50, 40 60, 46 62 C 52 64, 56 54, 60 48 C 64 43, 70 45, 74 52 C 78 59, 84 61, 88 54 C 92 47, 95 37, 98 28';
  const RD_C = 'M 1 66 C 6 58, 12 51, 18 55 C 24 59, 26 70, 32 72 C 38 74, 44 66, 48 58 C 52 50, 58 48, 62 56 C 66 63, 72 65, 78 58 C 84 51, 88 45, 92 40 C 95 36, 97 31, 98 26';
  const PK_A = MW.pokes;
  const PK_B = [[6, 40], [14, 68], [22, 36], [31, 62], [38, 44], [47, 70],
    [54, 36], [61, 60], [71, 44], [79, 68], [87, 40], [94, 60]];
  const LIV = {
    meadow: MW,
    library: { img: 'map-library-pano.jpg', aspect: 6.815, d: RD_B, t: [[5, 12], [48, 14], [94, 82]],
      legEdge: LEGS4, legName: ['the Front Steps', 'the Reading Halls', 'the Ink Gardens', 'the Grand Archive'],
      wander: { g: '🦉', name: 'Sage the Owl' },
      lms: [{ x: 40, y: 64, leg: 1, name: 'the Card Catalogue', kit: 'comb', g: '🗂️', art: 'lv-lm-library' }],
      pokes: PK_B, amb: { seeds: 1, wisps: 1 },
      heroes: [{ x: 30, y: 55, w: 120, img: 'lv-hero-library', anim: 'sway2', burst: '📖', name: 'the wobbling book stack',
        kit: 'comb', line: 'The owl drops a word in pieces — shelve it back together!' }] },
    forum: { img: 'map-forum-pano.jpg', aspect: 6.815, d: RD_C, t: [[4, 10], [52, 12], [93, 80]],
      legEdge: LEGS4, legName: ['the Forum Gates', 'the Market', 'the Aqueduct', 'the Colosseum'],
      wander: { g: '🐢', name: 'Tullia the Tortoise' },
      lms: [{ x: 63, y: 62, leg: 2, name: 'the Oracle Fountain', kit: 'petal', g: '⛲', art: 'lv-lm-forum' }],
      pokes: PK_A, amb: { birds: 1, seeds: 1 },
      heroes: [{ x: 16, y: 52, w: 130, img: 'lv-hero-forum', anim: 'sway', burst: '🍃', name: 'the laurel tree',
        kit: 'petal', line: 'The laurel rustles a word — step its stones and spell it!' }] },
    storm: { img: 'map-storm-pano.jpg', aspect: 6.815, d: RD_B, t: [[6, 12], [45, 10], [94, 78]],
      legEdge: LEGS4, legName: ['the Windward Path', 'the Windward Cliffs', 'the Thunder Fields', 'the Eye of the Storm'],
      wander: { g: '🐏', name: 'Bolt the Ram' },
      lms: [{ x: 40, y: 42, leg: 1, name: 'the Lightning Rod', kit: 'butterfly', g: '⚡', art: 'lv-lm-storm' }],
      pokes: PK_B, amb: { wisps: 1, seeds: 1 },
      heroes: [{ x: 22, y: 50, w: 140, img: 'lv-hero-storm', anim: 'sway', burst: '⚡', name: 'the storm pine',
        kit: 'butterfly', line: 'The pine crackles a word — only one orb spells it true!' }] },
    roots: { img: 'map-roots-pano.jpg', aspect: 6.815, d: RD_C, t: [[5, 14], [49, 12], [92, 80]],
      legEdge: LEGS4, legName: ['the Overgrowth', 'the Root Halls', 'the Seed Vaults', 'the Root Throne'],
      wander: { g: '🦔', name: 'Hazel the Hedgehog' },
      lms: [{ x: 63, y: 60, leg: 2, name: 'the Seed Vault', kit: 'comb', g: '🌰', art: 'lv-lm-roots' }],
      pokes: PK_A, amb: { butter: 1, seeds: 1, wisps: 1 },
      heroes: [{ x: 28, y: 58, w: 130, img: 'lv-hero-roots', anim: 'breathe', burst: '✨', name: 'the great stump',
        kit: 'comb', line: 'The stump hums a word through its rings — grow it back!' }] },
    strait: { img: 'map-strait-pano.jpg', aspect: 6.815, d: RD_B, t: [[5, 10], [50, 12], [94, 80]],
      legEdge: LEGS4, legName: ['the Shore Road', 'the Harbour', 'the Buoy Line', 'the Far Shore'],
      wander: { g: '🦭', name: 'Salty the Seal' },
      lms: [{ x: 40, y: 70, leg: 1, name: 'the Message Buoy', kit: 'butterfly', g: '🛟', art: 'lv-lm-strait' }],
      pokes: PK_B, amb: { birds: 1, wisps: 1, water: [[30, 66], [35, 74], [41, 60], [52, 70], [60, 64], [66, 72], [80, 68]] },
      /* the painter already put a lighthouse on the buoy line — the hero is
         ANCHORED to it (halo + label on the painting, sprite only on the card) */
      heroes: [{ x: 66.5, y: 24, w: 110, anch: 1, img: 'lv-hero-strait', anim: 'breathe', burst: '🌊', name: 'the little lighthouse',
        kit: 'butterfly', line: 'The lighthouse signals a word — net the buoy that spells it!' }] },
    junkyard: { img: 'map-junkyard-pano.jpg', aspect: 6.815, d: RD_C, t: [[4, 12], [47, 10], [93, 82]],
      legEdge: LEGS4, legName: ['the Rust Road', 'Scrap Row', 'the Contraption Fields', 'the Trickster’s Gate'],
      wander: { g: '🦝', name: 'Ratchet the Raccoon' },
      lms: [{ x: 63, y: 66, leg: 2, name: 'the Tinker Bench', kit: 'comb', g: '🔧', art: 'lv-lm-junkyard' }],
      pokes: PK_A, amb: { seeds: 1, wisps: 1 },
      heroes: [{ x: 30, y: 50, w: 110, img: 'lv-hero-junkyard', anim: 'sway2', burst: '⚙️', name: 'the teetering scrap tower',
        kit: 'comb', line: 'The tower rattles a word apart — bolt it back together!' }] },
    sprints: { img: 'map-sprints-pano.jpg', aspect: 6.815, d: RD_B, t: [[5, 12], [46, 14], [92, 80]],
      legEdge: LEGS4, legName: ['the Starting Line', 'the Warm-Up Track', 'the Stadium Bend', 'the Finish Arch'],
      wander: { g: '🐇', name: 'Dash the Hare' },
      lms: [{ x: 40, y: 62, leg: 1, name: 'the Water Station', kit: 'petal', g: '🥤', art: 'lv-lm-sprints' }],
      pokes: PK_B, amb: { birds: 1, seeds: 1 },
      heroes: [{ x: 88, y: 52, w: 110, img: 'lv-hero-sprints', anim: 'flutter', burst: '🎉', name: 'the finish flags',
        kit: 'petal', line: 'The flags wave a word — hop the hurdles and spell it!' }] },
    stage: { img: 'map-stage-pano.jpg', aspect: 6.815, d: RD_C, t: [[5, 10], [51, 12], [93, 78]],
      legEdge: LEGS4, legName: ['the Stage Door', 'the Prop Loft', 'the Orchestra Pit', 'the Grand Marquee'],
      wander: { g: '🐈', name: 'Duchess the Cat' },
      lms: [{ x: 40, y: 68, leg: 1, name: 'the Costume Trunk', kit: 'comb', g: '🎭', art: 'lv-lm-stage' }],
      pokes: PK_A, amb: { wisps: 1, seeds: 1 },
      heroes: [{ x: 30, y: 52, w: 120, img: 'lv-hero-stage', anim: 'breathe', burst: '⭐', name: 'the velvet curtain',
        kit: 'spell', line: 'The curtain parts on a word — hear it and spell it true!' }] },
  };
  /* the config for wherever the child is standing right now */
  const lvCfg = () => LIV[state.trailAct] || MW;
  const lmArt = lm => lm && lm.art ? '<img src="app-art/' + lm.art + '.svg" alt="">' : '';
  const mwOn = () => !!LIV[state.trailAct] && state.trailCourse !== 'exp';
  /* per-act progress bucket: the Meadow keeps its historical tr(c).mw home;
     every other country lives under tr(c).lv[actId] — landmark days, hero
     days, the unroll beat and the fork must never collide across acts */
  const mwP = c => { const t2 = tr(c); const id = state.trailAct || 'meadow';
    if (id === 'meadow') return t2.mw = t2.mw || {};
    const lv = t2.lv = t2.lv || {}; return lv[id] = lv[id] || {}; };
  /* deterministic daily seed: child name + date + COUNTRY; three rolls per day
     (the act is part of the salt so each country rolls its own gifts) */
  function mwSeed(c, k) { const d2 = new Date(); const s2 = String(c.name || 'bee') + '|' + d2.getFullYear() + '-' + d2.getMonth() + '-' + d2.getDate() + '|' + (state.trailAct || '') + '|' + k;
    let h = 2166136261; for (let i = 0; i < s2.length; i++) { h ^= s2.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) / 4294967296; }
  const mwDay = () => { const d2 = new Date(); return d2.getFullYear() + '-' + d2.getMonth() + '-' + d2.getDate(); };
  const mwLegOfX = x => { const le = lvCfg().legEdge; for (let i = 0; i < le.length; i++) if (x <= le[i] + 0.01) return i; return 3; };
  /* how far the child has EARNED the camera: a SLIDING WINDOW — everything
     behind them forever, plus TWO stops ahead of the frontier, plus a little
     road into the bend. (Leg boundaries remain only as the unroll celebration.) */
  function mwEdge(c, pts, nodes, fr) {
    if (devOn()) return 100;
    let idx = nodes.findIndex(x => x.i === fr);
    if (idx < 0) idx = nodes.length - 1;
    const ahead = Math.min(nodes.length - 1, idx + 2);
    if (ahead >= nodes.length - 1) return 100;
    return Math.min(100, Math.max((pts[ahead] || { x: 20 }).x + 7, 24));
  }
  /* the camera clamp IS the reveal: #sb-pan can never scroll past the earned
     edge, so the future is simply off the canvas — no veil, no fog. The clamp
     is only trusted once the panorama has real layout: a not-yet-loaded image
     reports a tiny width, and clamping against THAT dragged every scroll back
     to the far left (the "snaps to level 1" bug). */
  let _mwMax = Infinity, _mwScroll = null;
  document.addEventListener('scroll', e => { try {
    const el = e.target; if (!el || el.id !== 'sb-pan') return;
    if (_mwMax !== Infinity && el.scrollLeft > _mwMax) el.scrollLeft = _mwMax;
    _mwScroll = el.scrollLeft;   // the camera position SURVIVES re-renders
  } catch (_) {} }, true);
  function mwClamp(edge, homeX) { setTimeout(() => { try {
    const el = document.getElementById('sb-pan'); if (!el) { _mwMax = Infinity; return; }
    const bd = el.firstElementChild, img = bd && bd.querySelector('img');
    const apply = () => { try {
      const el2 = document.getElementById('sb-pan'); if (!el2) return;
      const bd2 = el2.firstElementChild; if (!bd2) return;
      if (bd2.clientWidth < el2.clientWidth * 1.2) { _mwMax = Infinity; return; }  // no real layout yet
      _mwMax = Math.max(0, bd2.clientWidth * (edge / 100) - el2.clientWidth);
      /* open the camera AT the child's stop on a fresh view; on every OTHER
         render (a coin flash, a save, a toast) RESTORE where they were — a
         re-render must never send the camera back to the west end */
      if (homeX != null) _mwScroll = Math.max(0, Math.min(_mwMax, bd2.clientWidth * homeX / 100 - el2.clientWidth / 2));
      el2.scrollLeft = Math.max(0, Math.min(_mwMax, _mwScroll == null ? el2.scrollLeft : _mwScroll));
    } catch (_) {} };
    if (img && !img.complete) { _mwMax = Infinity; img.addEventListener('load', apply, { once: true }); }
    else apply();
  } catch (_) {} }, 0); }
  /* the unroll: when a new leg is earned, glide the camera to the new country */
  function mwUnroll(c, rv) { const p = mwP(c); const seen = p.rv || 0;
    if (rv <= seen || devOn()) return false;   // test mode peeks; it never spends the reveal
    p.rv = rv; save();
    setTimeout(() => { try {
      const el = document.getElementById('sb-pan'); if (!el) return;
      const rm = matchMedia('(prefers-reduced-motion: reduce)').matches || state.am === 1;
      const cfg = lvCfg();
      const to = Math.min(_mwMax, Math.max(0, el.firstElementChild.clientWidth * (cfg.legEdge[rv] / 100) - el.clientWidth * 0.9));
      if (rm) el.scrollLeft = to; else el.scrollTo({ left: to, behavior: 'smooth' });
      try { sfx('win'); } catch (_) {}
      flash('🌼 The road unrolls — ' + cfg.legName[rv] + ' opens!');
    } catch (_) {} }, 350);
    return true; }
  /* ---- the daily seed's gifts ---- */
  function mwBloomIdx(c, pts, nodes, edge) { // today's 2x-honey stop, always in earned country
    const open = pts.map((p, i) => i).filter(i => pts[i].x <= edge && !passedNode(c, nodes[i].n));
    if (!open.length) return -1;
    return open[Math.floor(mwSeed(c, 'bloom') * open.length) % open.length]; }
  const MW_VARS = ['rainbow', 'mist', 'gold'];
  const mwVariant = c => MW_VARS[Math.floor(mwSeed(c, 'wx') * MW_VARS.length) % MW_VARS.length];
  function mwWander(c, edge) { // where the wanderer stands today
    const f = mwSeed(c, 'wander');
    const x = 4 + f * (edge - 12), y = 24 + ((f * 7919) % 1) * 55;
    return { x, y, done: (mwP(c).wd || '') === mwDay() }; }
  app2.mwWander = () => { const c = active(); const p = mwP(c); if (p.wd === mwDay()) return;
    needMap(() => { try {
      const u = unit(state.trailUnit) || (seq(c).find(n => n.kind === 'unit' && !passedNode(c, n)) || {}).u || seq(c).find(n => n.kind === 'unit').u;
      const ws = lapWords(u, lapOf(c), 8); const w = ws[Math.floor(mwSeed(c, 'ww') * ws.length) % ws.length];
      if (w) say(w.w);
      p.wd = mwDay(); addCoins(8); save();
      const wn = lvCfg().wander || MW.wander;
      flash(wn.g + ' ' + wn.name + ': “' + (w ? w.w + '! A fine word. ' : '') + 'For your kindness — 8 honey.”'); render();
    } catch (e) {} }); };
  /* ---- pokes: tap a painted thing, it boings and sheds sparkles. One seeded
     spot per day hides the petal shower (+2 honey, once). Pure DOM — a poke
     must feel instant, so no full render unless the lucky one pays. ---- */
  app2.mwPoke = i => { try { const c = active(); i = +i;
    const el = document.querySelector('.mw-poke[data-arg="' + i + '"]'); if (!el) return;
    el.classList.remove('boing'); void el.offsetWidth; el.classList.add('boing');
    const burst = document.createElement('span'); burst.className = 'mw-burst';
    for (let k = 0; k < 6; k++) { const s2 = document.createElement('span');
      s2.textContent = k % 2 ? '✨' : '🌸'; s2.style.setProperty('--ba', (k * 60) + 'deg');
      s2.style.setProperty('--bd2', (0.5 + (k % 3) * 0.14) + 's'); burst.appendChild(s2); }
    el.appendChild(burst); setTimeout(() => { try { burst.remove(); } catch (_) {} }, 900);
    try { sfx('tick'); } catch (_) {}
    const lucky = Math.floor(mwSeed(c, 'poke') * lvCfg().pokes.length) % lvCfg().pokes.length;
    const p = mwP(c);
    if (i === lucky && p.pk !== mwDay()) { p.pk = mwDay(); addCoins(2); save();
      try { sfx('coin'); burstConfetti(40); } catch (_) {}
      flash('🌸 A petal shower! +2 honey'); render(); }
  } catch (e) {} };
  /* a HERO answers a tap in its own voice — a stir, a burst, and then a FUN
     CHALLENGE: one word, played the hero's own way (petal-hop for the cherry,
     butterfly catch at the lollipop, comb-build under the toadstool, a bee's
     message at the banner). +5 honey the first win each day; replays are free. */
  app2.mwHero = i => { try { const c = active(); const h = lvCfg().heroes[+i]; if (!h) return;
    const el = document.querySelector('.mw-hero[data-arg="' + i + '"]');
    if (el) { el.classList.remove('stir'); void el.offsetWidth; el.classList.add('stir');
      const burst = document.createElement('span'); burst.className = 'mw-burst';
      for (let k = 0; k < 8; k++) { const s2 = document.createElement('span');
        s2.textContent = h.burst === '🟢' ? (k % 2 ? '✨' : '💚') : (k % 3 === 2 ? '✨' : h.burst);
        s2.style.setProperty('--ba', (k * 45) + 'deg');
        s2.style.setProperty('--bd2', (0.55 + (k % 4) * 0.13) + 's'); burst.appendChild(s2); }
      el.appendChild(burst); setTimeout(() => { try { burst.remove(); } catch (_) {} }, 1100); }
    try { sfx('tick'); } catch (_) {}
    const hi = +i;
    setTimeout(() => { needMap(() => { try {
      const u = (seq(c).find(n => n.kind === 'unit' && !passedNode(c, n)) || seq(c).filter(n => n.kind === 'unit').slice(-1)[0]).u;
      const ws = shuffle(lapWords(u, lapOf(c), 20).slice()).filter(w => w.w.length >= 3);
      const w = ws[0]; if (!w) return;
      const item = h.kit === 'spell' ? { ty: 'spell', w: w.w, d: w.d } : kitItem(w, h.kit, state.trailAct);
      set({ trailView: 'quiz', trailChk: null, trailUnit: u.id,
        tq: { items: [item], i: 0, score: 0, picked: null, typed: '', missed: [], over: false,
          hero: hi, sideName: h.name, heroLine: h.line } });
      tqAutoSay();
    } catch (e) {} }); }, 650); } catch (e) {} };
  /* ---- landmarks: place-true side rounds, one honey trickle per day each ---- */
  const mwLmDone = (c, i) => ((mwP(c).lm || {})[i] || '') === mwDay();
  app2.mwLmk = i => { const c = active(); i = +i;
    const lm = lvCfg().lms[i]; if (!lm || mwLmDone(c, i)) return;
    needMap(() => { try {
      const u = (seq(c).find(n => n.kind === 'unit' && !passedNode(c, n)) || seq(c).filter(n => n.kind === 'unit').slice(-1)[0]).u;
      const ws = shuffle(lapWords(u, lapOf(c), 20).slice()).slice(0, 4);
      if (!ws.length) { flash('The words are still on their way…'); return; }
      const items = ws.map(w => kitItem(w, lm.kit, state.trailAct));
      set({ trailView: 'quiz', trailChk: null, trailUnit: u.id,
        tq: { items, i: 0, score: 0, picked: null, typed: '', missed: [], over: false, side: i, sideName: lm.name } });
      tqAutoSay();
    } catch (e) {} }); };
  /* ---- the fork pair: both spur stops open together; the dared one pays ---- */
  const mwPairOpen = (c, nodes, fr, i) => { if (!mwOn()) return false;
    const pr = lvCfg().pair; if (!pr) return false;   // the fork is Meadow-only
    const a2 = nodes[pr[0]], b2 = nodes[pr[1]]; if (!a2 || !b2) return false;
    return (i === pr[0] || i === pr[1]) && fr >= a2.i && fr <= b2.i; };
  /* ================= THE KIT ROUNDS =================
     Three meadow mechanics that RESKIN the drill, never replace it: the same
     words, the same score, a different verb. ~1 kit round per 4 classic items. */
  function misspells(w) { // two kid-plausible wrong spellings, deterministic
    const v = 'aeiou'; const out = []; const s2 = String(w);
    let h = 0; for (let i = 0; i < s2.length; i++) h = (h * 31 + s2.charCodeAt(i)) >>> 0;
    const swapAt = s2.length > 3 ? 1 + (h % (s2.length - 2)) : 0;
    if (s2.length > 3) out.push(s2.slice(0, swapAt) + s2[swapAt + 1] + s2[swapAt] + s2.slice(swapAt + 2));
    for (let i = 0; i < s2.length; i++) { const j = (i + (h >> 3)) % s2.length;
      if (v.includes(s2[j])) { const r = v[(v.indexOf(s2[j]) + 1 + (h % 3)) % 5];
        const m = s2.slice(0, j) + r + s2.slice(j + 1); if (m !== s2 && !out.includes(m)) { out.push(m); break; } } }
    if (out.length < 2) { const j = h % s2.length; out.push(s2.slice(0, j) + s2[j] + s2.slice(j)); }
    return out.filter(m => m !== s2).slice(0, 2); }
  function chunks(w) { // syllable-ish pieces for the comb: split after vowel groups
    const s2 = String(w); const out = []; let cur = '';
    for (let i = 0; i < s2.length; i++) { cur += s2[i];
      const isV = 'aeiouy'.includes(s2[i]), nx = s2[i + 1];
      if (isV && nx && !'aeiouy'.includes(nx) && s2[i + 2] && cur.length >= 2) { out.push(cur); cur = ''; } }
    if (cur) out.push(cur);
    while (out.length > 4) { const j = out.length - 2; out[j] += out.pop(); }
    if (out.length < 2 && s2.length > 3) { const m = Math.ceil(s2.length / 2); return [s2.slice(0, m), s2.slice(m)]; }
    return out; }
  function kitItem(w, kind, act2) {
    if (kind === 'butterfly') { const opts = [{ c: w.w, ok: true }].concat(misspells(w.w).map(m => ({ c: m, ok: false })));
      shuffle(opts); return { ty: 'kit', kit: 'butterfly', w: w.w, d: w.d, a: act2, opts, ans: opts.findIndex(o => o.ok) }; }
    if (kind === 'comb') { const ch = chunks(w.w); const tiles = shuffle(ch.map((t2, i) => ({ t: t2, i })));
      return { ty: 'kit', kit: 'comb', w: w.w, d: w.d, a: act2, ch, tiles }; }
    const need = w.w.split(''); const pool = shuffle(need.map((L, i) => ({ L, i })).concat(
      misspells(w.w).join('').split('').filter(L => !need.includes(L)).slice(0, 2).map((L, i) => ({ L, i: -1 - i }))));
    return { ty: 'kit', kit: 'petal', w: w.w, d: w.d, a: act2, pool }; }
  /* each country plays the same three mechanics in its OWN verbs — meadow
     things in the meadow, Roman things in the forum. fly/comb/petal carry
     [title, win, lose-prefix]; glyph fronts the catch cards off-meadow. */
  const KIT_SKIN = {
    meadow: { fly: ['One butterfly wears the TRUE spelling — net it!', 'Caught it! 🦋', 'It flew off'],
      comb: ['Build the word into the comb, piece by piece 🍯', 'The comb is full! 🍯'],
      petal: ['Hop the petals in order and spell it 🌸', 'Petal-perfect! 🌸', 'The breeze took it'] },
    library: { glyph: '📜', fly: ['One scroll bears the TRUE spelling — pick it!', 'Well read! 📜', 'That page crumbled'],
      comb: ['Shelve the word, volume by volume 📚', 'The shelf is full! 📚'],
      petal: ['Step the ink drops in order and spell it 🖋️', 'Ink-perfect! 🖋️', 'The ink smudged'] },
    forum: { glyph: '🏛️', fly: ['One tablet is carved with the TRUE spelling!', 'Carved in marble! 🏛️', 'That tablet cracked'],
      comb: ['Set the mosaic, tile by tile 🏺', 'The mosaic shines! 🏺'],
      petal: ['Step the paving stones in order and spell it 🪨', 'A triumph! 🏛️', 'A stone came loose'] },
    storm: { glyph: '⚡', fly: ['One storm orb glows with the TRUE spelling!', 'Caught the bolt! ⚡', 'It thundered off'],
      comb: ['Charge the word, spark by spark ⚡', 'Fully charged! ⚡'],
      petal: ['Hop the crystals in order and spell it 🔷', 'Crystal clear! 🔷', 'The wind took it'] },
    roots: { glyph: '🌰', fly: ['One seed pod holds the TRUE spelling!', 'It took root! 🌱', 'That pod was empty'],
      comb: ['Grow the word back, root by root 🌿', 'It blooms! 🌿'],
      petal: ['Hop the mushroom lamps in order and spell it 🍄', 'Deep-rooted! 🌳', 'It sank into the moss'] },
    strait: { glyph: '🛟', fly: ['One buoy flies the TRUE spelling!', 'Anchors aweigh! ⛵', 'It drifted off'],
      comb: ['Stow the word, crate by crate 📦', 'Cargo stowed! ⛵'],
      petal: ['Hop the stepping stones across the tide 🌊', 'Safe ashore! 🌊', 'The tide took it'] },
    junkyard: { glyph: '⚙️', fly: ['One gizmo is stamped with the TRUE spelling!', 'It works! ⚙️', 'That one was a dud'],
      comb: ['Bolt the word together, part by part 🔧', 'The contraption runs! 🔧'],
      petal: ['Hop the springs in order and spell it 🪤', 'Sproing — perfect! ⚙️', 'A spring popped'] },
    sprints: { glyph: '🏁', fly: ['One runner wears the TRUE spelling!', 'Photo finish! 🏁', 'False start'],
      comb: ['Run the relay, leg by leg 🏃', 'Baton home! 🏆'],
      petal: ['Hop the hurdles in order and spell it 🏃', 'Personal best! 🏅', 'Clipped a hurdle'] },
    stage: { glyph: '🎭', fly: ['One mask sings the TRUE spelling!', 'Bravo! 🎭', 'It missed its cue'],
      comb: ['Stage the word, scene by scene 🎬', 'Standing ovation! 👏'],
      petal: ['Step the spotlight marks in order and spell it 🎬', 'Encore! 🌟', 'The curtain fell'] },
  };
  const kitSkin = it => KIT_SKIN[it && it.a] || KIT_SKIN.meadow;
  const KIT_OF = ['butterfly', 'comb', 'petal'];
  /* butterfly tap resolves like a normal pick; comb + petal build then resolve */
  app2.kitPick = i => { const q2 = state.tq; if (!q2 || q2.over || q2.picked != null) return; const it = q2.items[q2.i];
    const ok = +i === it.ans; q2.picked = +i; q2.right = ok; if (ok) q2.score++; else q2.missed.push({ ty: 'spell', w: it.w, d: it.d });
    try { sfx(ok ? 'coin' : 'wrong'); } catch (e) {} render(); tqAutoNext(ok); };
  app2.kitTile = k => { const q2 = state.tq; if (!q2 || q2.over || q2.picked != null) return; const it = q2.items[q2.i];
    const buf = state.kitBuf = state.kitBuf || [];
    if (buf.includes(+k)) return;
    buf.push(+k);
    const want = it.kit === 'comb' ? it.ch.length : it.w.length;
    if (buf.length >= want) {
      const made = it.kit === 'comb' ? buf.map(j => it.tiles[j].t).join('') : buf.map(j => it.pool[j].L).join('');
      const ok = nkey(made) === nkey(it.w);
      q2.picked = 1; q2.right = ok; if (ok) q2.score++; else q2.missed.push({ ty: 'spell', w: it.w, d: it.d });
      state.kitBuf = null;
      try { sfx(ok ? 'coin' : 'wrong'); } catch (e) {} render(); tqAutoNext(ok); return; }
    render(); };
  app2.kitReset = () => { state.kitBuf = null; render(); };
  const BFLY = col => `<svg viewBox="0 0 60 44" width="100%" height="100%"><g class="kb-wl"><path d="M28 22 C 16 4, 2 4, 3 16 C 4 26, 16 28, 28 24z" fill="${col}" stroke="#5A3A50" stroke-width="2"/><path d="M28 24 C 18 40, 5 40, 6 31 C 7 25, 18 24, 28 26z" fill="${col}" opacity=".8" stroke="#5A3A50" stroke-width="2"/></g><g class="kb-wr"><path d="M32 22 C 44 4, 58 4, 57 16 C 56 26, 44 28, 32 24z" fill="${col}" stroke="#5A3A50" stroke-width="2"/><path d="M32 24 C 42 40, 55 40, 54 31 C 53 25, 42 24, 32 26z" fill="${col}" opacity=".8" stroke="#5A3A50" stroke-width="2"/></g><ellipse cx="30" cy="23" rx="3.4" ry="12" fill="#5A3A50"/><path d="M28 12 q-3 -7 -7 -9 M32 12 q3 -7 7 -9" stroke="#5A3A50" stroke-width="2" fill="none"/></svg>`;
  const BFLY_COLS = ['#F3B2C0', '#8FD0EC', '#FFD24D'];
  function kitBody(it, q2, picked) {
    const KS = kitSkin(it);
    if (it.kit === 'butterfly') {
      const S = KS.fly;
      const face = i => KS.glyph
        ? `<span style="display:grid;place-items:center;width:76px;height:56px;font-size:40px">${KS.glyph}</span>`
        : `<span style="width:76px;height:56px;display:block">${BFLY(BFLY_COLS[i % 3])}</span>`;
      return `<div style="text-align:center"><p style="font-size:13px;font-weight:700;color:var(--muted);margin-bottom:4px">${S[0]}</p>
        <p style="font-size:12.5px;color:var(--muted);margin-bottom:10px">${esc(maskTxt((it.d || '').slice(0, 110), it.w))}</p>
        <div style="display:flex;justify-content:center;gap:14px;flex-wrap:wrap;padding:6px 0 2px">
        ${it.opts.map((o, i) => { const st = picked == null ? '' : i === it.ans ? 'outline:3px solid var(--good);outline-offset:3px;border-radius:14px' : +picked === i ? 'opacity:.4;filter:grayscale(.6)' : 'opacity:.55';
          return `<button data-act="kitPick" data-arg="${i}" ${picked != null ? 'disabled' : ''} class="kit-fly" style="--kd:${(i * 0.7).toFixed(1)}s;${st}">
            ${face(i)}
            <span style="display:block;font-weight:800;font-size:15px;letter-spacing:.04em;margin-top:2px">${esc(o.c)}</span></button>`; }).join('')}</div>
        ${picked != null ? `<p style="margin-top:8px;font-weight:800;color:${q2.right ? 'var(--good)' : 'var(--bad)'}">${q2.right ? S[1] : S[2] + ' — it’s “' + esc(it.w) + '”'}</p>` : ''}</div>`;
    }
    const buf = state.kitBuf || [];
    if (it.kit === 'comb') {
      const S = KS.comb;
      const cells = it.ch.map((_, i) => { const j = buf[i];
        return `<span class="kit-cell${j != null ? ' full' : ''}">${j != null ? esc(it.tiles[j].t) : ''}</span>`; }).join('');
      return `<div style="text-align:center"><p style="font-size:13px;font-weight:700;color:var(--muted);margin-bottom:4px">${S[0]}</p>
        <p style="font-size:12.5px;color:var(--muted);margin-bottom:10px">${esc(maskTxt((it.d || '').slice(0, 110), it.w))} <button data-act="tqSay" style="font-weight:800;color:var(--accent)">🔊 hear it</button></p>
        <div style="display:flex;justify-content:center;gap:6px;margin-bottom:14px">${cells}</div>
        <div style="display:flex;justify-content:center;gap:9px;flex-wrap:wrap">
        ${it.tiles.map((t2, k) => `<button data-act="kitTile" data-arg="${k}" ${picked != null || buf.includes(k) ? 'disabled' : ''} class="kit-tile${buf.includes(k) ? ' used' : ''}">${esc(t2.t)}</button>`).join('')}</div>
        ${buf.length && picked == null ? `<div style="margin-top:10px"><button data-act="kitReset" style="font-size:12px;font-weight:800;color:var(--muted)">↺ start over</button></div>` : ''}
        ${picked != null ? `<p style="margin-top:10px;font-weight:800;color:${q2.right ? 'var(--good)' : 'var(--bad)'}">${q2.right ? S[1] : 'It’s “' + esc(it.w) + '”'}</p>` : ''}</div>`;
    }
    const S = KS.petal;
    const done2 = buf.map(j => it.pool[j].L).join('');
    return `<div style="text-align:center"><p style="font-size:13px;font-weight:700;color:var(--muted);margin-bottom:4px">${S[0]}</p>
      <p style="font-size:12.5px;color:var(--muted);margin-bottom:6px">${esc(maskTxt((it.d || '').slice(0, 110), it.w))} <button data-act="tqSay" style="font-weight:800;color:var(--accent)">🔊 hear it</button></p>
      <div style="min-height:30px;font-weight:800;font-size:19px;letter-spacing:.14em;margin-bottom:10px">${esc(done2)}<span style="opacity:.3">${'·'.repeat(Math.max(0, it.w.length - done2.length))}</span></div>
      <div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap">
      ${it.pool.map((p, k) => `<button data-act="kitTile" data-arg="${k}" ${picked != null || buf.includes(k) ? 'disabled' : ''} class="kit-petal${buf.includes(k) ? ' used' : ''}" style="--kd:${((k * 37) % 10) / 6}s">${esc(p.L)}</button>`).join('')}</div>
      ${buf.length && picked == null ? `<div style="margin-top:10px"><button data-act="kitReset" style="font-size:12px;font-weight:800;color:var(--muted)">↺ start over</button></div>` : ''}
      ${picked != null ? `<p style="margin-top:10px;font-weight:800;color:${q2.right ? 'var(--good)' : 'var(--bad)'}">${q2.right ? S[1] : S[2] + ' — it’s “' + esc(it.w) + '”'}</p>` : ''}</div>`;
  }

  /* ---- hidden caches ----
     Three per map, at the spots the painter tucked them into. They are shut
     while the stops ahead of them are, open the moment the speller reaches
     them, and pay once. Deliberately NOT worth xp: rank comes from spelling,
     and a chest that moved your level would be a way to skip the work. */
  const TRE_PAY = [20, 30, 50];
  const treMap = c => (tr(c).tre || (tr(c).tre = {}));
  const treGate = (n, i) => Math.max(1, Math.ceil(n * (i + 1) / 4));
  const treGot = (c, act, i) => !!(treMap(c)[act] || {})[i];
  /* ---- A CHEST IS A SURPRISE, NOT A COIN DISPENSER ----
     Play-tested ask: "treasure chests that lead to games or elements in the library
     or a random trivia appears". The coins still pay out (they are the reliable part),
     and then the chest opens onto ONE of three doors, picked at random:
       game   — the region's own arcade game, one tap from the chest
       lore   — the chapter this region teaches, opened where it lives
       trivia — one real question from the bank, answered right here for +10
     No XP from any of it: rank still comes from spelling. */
  const TRE_GAME = { meadow: 'honeycombRun', library: 'typeBlaster', forum: 'unscrambleStars',
    storm: 'keepFlying', roots: 'wordSnake', strait: 'keepFlying', junkyard: 'typeBlaster',
    sprints: 'beeGrandPrix', stage: 'spotlightSimon', greysea: 'spellScene',
    uproving: 'beeGrandPrix', ulibrary: 'typeBlaster', ucrucible: 'honeycombRun',
    uobservatory: 'unscrambleStars', uchampionship: 'beeGrandPrix' };
  const GAME_NAME = { beeGrandPrix: 'Bee Grand Prix', honeycombRun: 'Honeycomb Run', typeBlaster: 'Type Blaster',
    keepFlying: 'Keep Flying', wordSnake: 'Word Snake', unscrambleStars: 'Unscramble Stars',
    spotlightSimon: 'Spotlight Simon', spellScene: 'Spell Scene' };
  app2.trailTre = arg => { const c = active();
    const [act, si] = String(arg).split(':'); const i = +si || 0;
    const cell = treMap(c)[act] || (treMap(c)[act] = {});
    if (cell[i]) { flash('Already found'); return; }
    cell[i] = 1; save();
    addCoins(TRE_PAY[i] || 20);
    try { sfx('win'); burstConfetti(40); } catch (e) {}
    /* The message names WHAT you found and where you are, not "cache found" — the whole
       point of nine painted regions is that they are different places. */
    const k = treKit(act);
    flash(k.g + ' ' + k.n[0].toUpperCase() + k.n.slice(1) + ' — ' + k.l + ' +' + (TRE_PAY[i] || 20) + ' coins');
    const kinds = ['game', 'lore', 'trivia'];
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    const g = { kind, act, game: TRE_GAME[act] || 'honeycombRun' };
    if (kind === 'lore') { try { const a2 = actsOf(course()).find(x => x.id === act);
      g.uid = a2 && a2.units[0]; } catch (e) {}
      if (!g.uid) g.kind = 'game'; }
    if (g.kind === 'trivia') {
      g.q = null;
      const lv = (function () { try { return Math.max(1, Math.min(5, ttBand(c))); } catch (e) { return 2; } })();
      const pick = () => { try {
        const pool = (window.SB_TRIVIA.questions || []).filter(q => q.lv === lv && q.ty === 'mc');
        const q = pool[Math.floor(Math.random() * pool.length)];
        if (!q) { g.kind = 'game'; render(); return; }
        const opts = q.c.map((c2, ix) => ({ c: c2, ok: ix === 0 }));
        shuffle(opts);
        g.q = { q: q.q, f: q.f || '', opts, picked: null }; render();
      } catch (e) { g.kind = 'game'; render(); } };
      try { window.SB_TRIVIA.loaded(lv) ? pick() : SB_TRIVIA.need(lv, pick); }
      catch (e) { g.kind = 'game'; }
    }
    state.treG = g;
    render(); };
  app2.treClose = () => { state.treG = null; render(); };
  app2.treGame = () => { const g = state.treG; state.treG = null; render();
    try { app2.arcadeMenu(g.game); } catch (e) { try { app2.arcadePlay(g.game); } catch (_) {} } };
  app2.treLore = () => { const g = state.treG; state.treG = null;
    if (g && g.uid) { app2.trailUnit(g.uid); setTimeout(() => { try { app2.trailLesson(); } catch (e) {} }, 60); }
    else render(); };
  app2.treTrivAns = i => { const g = state.treG; if (!g || !g.q || g.q.picked != null) return;
    g.q.picked = +i;
    if (g.q.opts[+i] && g.q.opts[+i].ok) { addCoins(10); try { sfx('win'); burstConfetti(50); } catch (e) {} }
    else { try { sfx('wrong'); } catch (e) {} }
    render(); };
  function treGiftCard() {
    const g = state.treG; if (!g) return '';
    /* the card swallows its own clicks with an INERT data-act (popKeep) — the
       old stopPropagation also stopped them reaching the app's delegated click
       handler, which left every button in the card dead (the "can't pick a
       trivia answer" bug) */
    const shell = inner => `<div style="position:fixed;inset:0;z-index:120;display:grid;place-items:center;padding:18px;background:rgba(20,12,30,.5)" data-act="treClose">
      <div data-act="popKeep" style="width:min(430px,94vw);background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:22px;text-align:center;box-shadow:0 18px 50px rgba(0,0,0,.4);animation:sb-rise .3s ease both">
        ${inner}
        <button data-act="treClose" style="position:absolute;top:10px;right:12px;width:26px;height:26px;border-radius:8px;background:var(--surface2);color:var(--muted);font-weight:800">✕</button>
      </div></div>`;
    if (g.kind === 'game') return shell(`<div style="font-size:40px">🗝️</div>
      <h3 style="font-family:var(--display);font-weight:800;font-size:19px;margin:8px 0 4px">The chest hides a game!</h3>
      <p style="font-size:13px;color:var(--muted);margin:0 0 14px">A round of <b>${esc(GAME_NAME[g.game] || 'the arcade')}</b> — this region's own game.</p>
      <button data-act="treGame" style="padding:13px 22px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:14.5px;box-shadow:var(--edge)">🕹️ Play it →</button>
      <button data-act="treClose" style="margin-left:8px;padding:13px 18px;border-radius:14px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:14px">Later</button>`);
    if (g.kind === 'lore') return shell(`<div style="font-size:40px">📜</div>
      <h3 style="font-family:var(--display);font-weight:800;font-size:19px;margin:8px 0 4px">An old page from the Library!</h3>
      <p style="font-size:13px;color:var(--muted);margin:0 0 14px">It tells the story this region teaches — read it where it lives.</p>
      <button data-act="treLore" style="padding:13px 22px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:14.5px;box-shadow:var(--edge)">📖 Read the chapter →</button>
      <button data-act="treClose" style="margin-left:8px;padding:13px 18px;border-radius:14px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:14px">Later</button>`);
    // trivia
    if (!g.q) return shell(`<div style="font-size:40px">❓</div>
      <h3 style="font-family:var(--display);font-weight:800;font-size:19px;margin:8px 0 4px">The chest holds a riddle…</h3>
      <p style="font-size:13px;color:var(--muted)">unrolling the scroll…</p>`);
    const done = g.q.picked != null;
    return shell(`<div style="font-size:40px">❓</div>
      <h3 style="font-family:var(--display);font-weight:800;font-size:17px;margin:8px 0 12px;line-height:1.35">${esc(g.q.q)}</h3>
      <div style="display:grid;gap:8px">${g.q.opts.map((o, ix) => {
        const st = !done ? 'background:var(--surface2);border:1px solid var(--line)'
          : o.ok ? 'background:var(--good);color:#fff'
          : ix === g.q.picked ? 'background:var(--bad);color:#fff' : 'background:var(--surface2);border:1px solid var(--line);opacity:.6';
        return `<button data-act="treTrivAns" data-arg="${ix}" ${done ? 'disabled' : ''} style="padding:11px 14px;border-radius:12px;font-weight:700;font-size:13.5px;text-align:left;${st}">${esc(o.c)}</button>`;
      }).join('')}</div>
      ${done ? `<p style="font-size:12.5px;color:var(--muted);margin:12px 0 0;line-height:1.5">${g.q.opts[g.q.picked].ok ? '🎉 +10 coins! ' : ''}${esc(g.q.f)}</p>
        <button data-act="treClose" style="margin-top:12px;padding:12px 20px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:14px">Back to the map</button>` : ''}`);
  }

  /* ---- THE AMBUSH: a moth of the Unspelling snatches your buddy ----
     Rarely, on stepping onto a region, a villain grabs the avatar and only a
     SPELLED WORD cuts them free — the action is always spelling, never a chore.
     At most once per region per day; fleeing costs nothing but the rescue reward. */
  function ambushWord(c) {
    try { const s = seq(c); const fr = s[Math.min(frontier(c), s.length - 1)];
      const u = fr && fr.kind === 'unit' ? fr.u : (s.find(n => n.kind === 'unit') || {}).u;
      const ws = lapWords(u, lapOf(c), 24).filter(w => /^[a-z]+$/i.test(w.w) && w.w.length >= 3 && w.w.length <= 9);
      if (ws.length) return ws[Math.floor(Math.random() * ws.length)].w; } catch (e) {}
    return ['meadow', 'honey', 'friend', 'journey', 'bright'][Math.floor(Math.random() * 5)];
  }
  function maybeAmbush(c, key) {
    try { const day = Math.floor(Date.now() / 864e5);
      const am = tr(c).ambD = tr(c).ambD || {};
      if (state.villain || state.treG || am[key] === day || Math.random() >= 0.22) return;
      am[key] = day; save();
      state.villain = { w: ambushWord(c), typed: '', wrong: 0 };
      setTimeout(() => { try { if (state.villain) say(state.villain.w); } catch (e) {} }, 650);
    } catch (e) {}
  }
  app2.villType = v => { if (state.villain) state.villain.typed = String(v == null ? '' : v); };
  app2.villKey = e => { if (e.key === 'Enter') { e.preventDefault(); app2.villGo(); } };
  app2.villSay = () => { try { state.villain && say(state.villain.w); } catch (e) {} };
  app2.villFlee = () => { state.villain = null; flash('The moth keeps its prize… this time. 🦇'); render(); };
  app2.villGo = () => { const V = state.villain; if (!V) return;
    if (nkey(V.typed || '') === nkey(V.w)) {
      state.villain = null; addCoins(12);
      try { sfx('win'); burstConfetti(90); } catch (e) {}
      flash('✂️ ' + V.w + ' — the net bursts and the moth flees! +12 🪙');
    } else {
      V.wrong = (V.wrong || 0) + 1; V.typed = '';
      try { sfx('wrong'); } catch (e) {}
      flash('The net holds — listen again!'); try { say(V.w); } catch (e) {}
    }
    render(); };
  function villainCard(c) {
    const V = state.villain; if (!V) return '';
    const av = (function () { try { return SB_AVATAR(c.avatar || 'bizzy', 56) || ''; } catch (e) { return ''; } })();
    return `<div style="position:fixed;inset:0;z-index:120;display:grid;place-items:center;padding:18px;background:rgba(16,10,28,.6)">
      <div style="width:min(430px,94vw);background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:24px;text-align:center;box-shadow:0 18px 50px rgba(0,0,0,.45);animation:sb-rise .3s ease both">
        <div style="font-size:42px;line-height:1">🦇</div>
        <div style="position:relative;width:76px;height:76px;margin:8px auto 2px;display:grid;place-items:center">
          <span style="width:56px;height:56px;display:block;filter:saturate(.65) brightness(.92)">${av || '🐝'}</span>
          <span style="position:absolute;inset:0;border-radius:50%;border:3px dashed rgba(130,96,210,.85)"></span>
        </div>
        <h3 style="font-family:var(--display);font-weight:800;font-size:19px;margin:8px 0 3px">A moth of the Unspelling strikes!</h3>
        <p style="font-size:13px;color:var(--muted);margin:0 0 12px;line-height:1.5">It has your buddy in a net. <b>Spell the word you hear</b> to cut them free.</p>
        <button data-act="villSay" style="display:inline-flex;align-items:center;gap:7px;padding:11px 20px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:13.5px;box-shadow:var(--edge);margin-bottom:12px">🔊 Hear the word</button>
        <input data-inp="villType" data-key="villKey" data-fkey="villType" value="${escA(V.typed || '')}" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="spell it…" style="width:100%;max-width:300px;display:block;margin:0 auto 10px;padding:13px 15px;border-radius:12px;border:1.5px solid var(--line);background:var(--surface);font-size:17px;font-weight:800;text-align:center;letter-spacing:.08em;outline:none">
        ${V.wrong >= 2 ? `<p style="font-size:12.5px;font-weight:700;color:var(--muted);margin:0 0 10px">Hint: it starts with “${esc(V.w.slice(0, 2))}…” and has ${V.w.length} letters.</p>` : ''}
        <div style="display:flex;gap:9px;justify-content:center;flex-wrap:wrap">
          <button data-act="villGo" style="padding:13px 22px;border-radius:14px;background:var(--good);color:#fff;font-weight:800;font-size:14.5px;box-shadow:var(--edge)">✂️ Cut them free!</button>
          <button data-act="villFlee" style="padding:13px 18px;border-radius:14px;background:var(--surface2);border:1px solid var(--line);color:var(--muted);font-weight:800;font-size:13.5px">Run away</button>
        </div>
      </div></div>`;
  }

  /* ---- world music, one pill on every board ---- */
  /* the pill must never lie ("Music on off didnt work" — Amrita 8.25): turning music ON
     also lifts an app-level mute (asking for music IS asking for sound), and if something
     else still holds the tune back — Focus mode — the flash says so instead of 🎵. */
  app2.atlasMusic = () => { try {
    const on = SB_W4_MUSIC.toggle();
    if (on && state.sound === false) { state.sound = true; try { save(); } catch (e) {} }
    SB_W4_MUSIC.sync();
    const playing = (() => { try { return SB_W4_MUSIC.playing(); } catch (e) { return false; } })();
    flash(!on ? '🔇 Music off'
      : playing ? '🎵 Music on — every world hums its own tune'
      : (window.SB_W4_FOCUS && SB_W4_FOCUS.on()) ? '🎵 Music is set to play — turn Focus off to hear it'
      : '🎵 Music on');
  } catch (e) { flash('Music is still tuning up — one moment'); } render(); };
  function musicPill() {
    let on = false; try { on = !!(window.SB_W4_MUSIC && SB_W4_MUSIC.on()); } catch (e) {}
    return `<button data-act="atlasMusic" title="World music" aria-label="World music ${on ? 'off' : 'on'}" style="width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:${on ? 'var(--accent)' : 'var(--surface2)'};border:1px solid ${on ? 'var(--accent)' : 'var(--line)'};font-size:15px">${on ? '🎵' : '🔇'}</button>`;
  }

  /* One cache marker: a shut chest you cannot reach yet reads as a faint
     glimmer, so the map has something to walk towards without giving it away. */
  /* EACH REGION'S CACHE IS ITS OWN OBJECT.
     Three caches sit on every map and they were the same golden chest everywhere, on maps
     whose whole point is that the Roman Forum is not the Meadow. Same mechanic, same
     payout, same gating — but the thing you find belongs to the place, and says so when
     you open it. The glyph is drawn type, not an emoji, so it takes the region's ink and
     stays crisp at any board width.
     A region with no entry falls back to the chest: a wrong object is worse than a plain
     one. Keys are act ids (see ACT_MAP). */
  const TRE_KIT = {
    meadow:   { g:'✿', n:'a wild honeycomb',      l:'Tucked in the clover — still warm.' },
    library:  { g:'❦', n:'a pressed bookmark',    l:'Someone left their place in a very old book.' },
    forum:    { g:'⚱', n:'a buried amphora',      l:'Roman clay, Roman coins — sealed since the Forum stood.' },
    storm:    { g:'⚡', n:'a bottled charge',      l:'Caught mid-strike and corked. It still hums.' },
    roots:    { g:'❉', n:'a seed vault',          l:'Every word here grew from something older.' },
    strait:   { g:'⚓', n:'a message in a bottle', l:'Carried across on the current, sealed with wax.' },
    junkyard: { g:'⚙', n:'a tinker\'s tin',       l:'Odds, ends and a handful of coins nobody missed.' },
    sprints:  { g:'✦', n:'a runner\'s cache',      l:'Left at the trackside for whoever gets here next.' },
    stage:    { g:'★', n:'a dressing-room box',   l:'Left behind after the last curtain call.' },
    greysea:  { g:'⚓', n:'a salvage crate',       l:'Hauled up from the grey water.' },
    liars:    { g:'❋', n:'a conjurer\'s purse',    l:'It was empty a moment ago. Probably.' },
    farflung: { g:'☼', n:'a traveller\'s pouch',   l:'Coins from four countries and none of them here.' },
    factory:  { g:'⚙', n:'a spare-parts drawer',  l:'Stamped, sorted and forgotten.' },
    proving:  { g:'✦', n:'an examiner\'s tin',     l:'Left for whoever passes this way.' },
  };
  const treKit = (actId) => TRE_KIT[String(actId||'').replace(/^map-/,'')] || { g:'✦', n:'a cache', l:'Someone left this for whoever came next.' };
  function treMark(c, actId, i, x, y, cleared, n) {
    const open = treGot(c, actId, i), ready = cleared >= treGate(n, i);
    const pay = TRE_PAY[i] || 20;
    const kit = treKit(actId);
    if (!ready) return `<span class="atlas-tre glim" style="left:${x}%;top:${y}%" aria-hidden="true"></span>`;
    return `<button class="atlas-tre ${open ? 'got' : 'ready'}" data-act="${open ? '' : 'trailTre'}" data-arg="${escA(actId + ':' + i)}"
      style="left:${x}%;top:${y}%" title="${open ? kit.n[0].toUpperCase() + kit.n.slice(1) + ' — found · ' + pay + ' coins' : 'You spot ' + kit.n + '. Tap to open — ' + pay + ' coins'}"
      aria-label="${open ? 'Already found: ' + kit.n : 'Open ' + kit.n + ' for ' + pay + ' coins'}">
      <span>${open ? '⌣' : kit.g}</span></button>`;
  }
  /* If the board grew past its container, centre the stop the card is showing. */
  function panTo(sel, pts) {
    setTimeout(() => { try {
      const el = document.getElementById('sb-pan'); if (!el) return;
      const bd = el.firstElementChild; if (!bd || bd.scrollWidth <= el.clientWidth + 4) return;
      const p = pts[sel]; if (!p) return;
      el.scrollLeft = Math.max(0, bd.clientWidth * p.x / 100 - el.clientWidth / 2);
    } catch (e) {} }, 0);
  }
  const treFound = (c, actId) => { const cell = treMap(c)[actId] || {}; let k = 0; for (let i = 0; i < 3; i++) if (cell[i]) k++; return k; };

  /* The board every sub-map shares: the painting, the route drawn over it, the
     stop pins and the caches. The route is stroked twice — a dotted ghost for the
     whole way and a solid gold overlay clipped to how far the speller has walked
     (pathLength=100 turns the dash array into a percentage, so it works whatever
     the real path length is). */
  /* AMBIENT MOTION, ONE MOTIF PER REGION.
     The map read as a static picture with pins on it; a completed Meadow should look
     alive. Each region gets a small drifting layer keyed to what that place IS — bees over
     the Meadow, dust motes in the Library, embers in the Storm, sparks off the Junkyard —
     so the Roman Forum does not animate like a meadow. Pure CSS on one element, drawn
     BELOW the route and pins so it can never obscure the journey, and every one of them
     stops dead under Reduce motion (see .atlas-amb in index.html).
     Regions with no entry get nothing rather than a generic default: a wrong motif reads
     worse than none. */
  const ACT_AMB = {
    meadow:   ['bees',   '#F0B429'],   // bees working the flowers
    library:  ['motes',  '#E8D9A8'],   // dust in the reading-room light
    forum:    ['motes',  '#EAD9B0'],   // marble dust over the stones
    storm:    ['rain',   '#BFD8FF'],   // driven rain
    roots:    ['rise',   '#9FE0A8'],   // spores lifting off the root kingdom
    strait:   ['drift',  '#BFE9FF'],   // spray carried along the water
    junkyard: ['sparks', '#FFC46B'],   // sparks off the scrap
    sprints:  ['drift',  '#FFE08A'],   // heat shimmer along the track
    stage:    ['motes',  '#FFF0C2'],   // dust in the follow-spot
    greysea:  ['drift',  '#CFE6F2'],
    liars:    ['sparks', '#D9C0FF'],
    farflung: ['rise',   '#FFD9A8'],
    factory:  ['sparks', '#FFB86B'],
    proving:  ['motes',  '#F2E2C0'],
    /* the five Ultra landmarks — play-tested as "the worlds are static" on the
       Champion's Routine: their slugs never matched a key, so they alone had no life */
    uproving:      ['motes',  '#EAD9B0'],   // training-yard dust
    ulibrary:      ['motes',  '#C9B8E8'],   // violet dust of the black library
    ucrucible:     ['sparks', '#FFB86B'],   // the forge
    uobservatory:  ['rise',   '#BFD8FF'],   // starlight lifting
    uchampionship: ['sparks', '#FFD24D'],   // stadium flashbulbs
  };
  function ambLayer(slug){
    const key = String(slug || '').replace(/^map-/, '');
    const a = ACT_AMB[key]; if (!a) return '';
    return `<span class="atlas-amb amb-${a[0]}" style="--ac:${a[1]}" aria-hidden="true"></span>`;
  }
  function actBoard(slug, m, pts, walked, marks, caches, dark, opts) {
    const f = (pts[walked] ? pts[walked].f * 100 : 0).toFixed(1);
    /* 42px of board per stop is the least that keeps two markers apart. On a
       phone a long act therefore grows past the screen and the map pans, which
       is how a map should behave anyway; on a desktop the board is already wider
       than the floor so nothing moves. */
    const minW = Math.max(1, pts.length) * 42;
    const pano = opts && opts.pano;
    return `<div class="act-pan" id="sb-pan"><div class="atlas-board act-board${pano ? ' mw-board' : ''}" data-act="trailShut" style="${pano ? '' : `min-width:min(${minW}px,190vw)`}">
      <img src="app-art/${pano ? pano.img : slug + '.jpg'}" alt="" loading="lazy" decoding="async">
      ${ambLayer(slug)}${pano && pano.extra || ''}
      ${/* The advanced half reads darker on sight. That used to be a near-black wash,
            which was right when the painting underneath was at full strength; over a
            painting deliberately taken down to 42% it just makes mud. A violet tint at
            a third of the weight still says "this is the advanced road" and leaves the
            route and pins to carry the screen. */''}
      ${dark ? '<span style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(58,38,110,.10),rgba(58,38,110,.18));z-index:1;pointer-events:none"></span>' : ''}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;z-index:2;pointer-events:none">
        <path d="${m.d}" fill="none" stroke="var(--rt-guide,rgba(255,250,235,.72))" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 7" vector-effect="non-scaling-stroke"
          style="filter:drop-shadow(0 1px 2px var(--rt-sh,rgba(24,14,4,.5)))"/>
        <path d="${m.d}" fill="none" stroke="var(--rt-walk,rgba(255,206,88,.9))" stroke-width="5" stroke-linecap="round"
          pathLength="100" stroke-dasharray="${f} 100" vector-effect="non-scaling-stroke"
          style="filter:drop-shadow(0 1px 3px var(--rt-sh,rgba(24,14,4,.55)))"/>
      </svg>
      ${caches}${marks}</div></div>`;
  }
  function viewAct() {
    const c = active();
    const crs = state.trailActCrs === 'exp' ? 'exp' : 'honey';
    state.trailCourse = crs;
    const acts = actsOf(crs);
    const act = acts.find(a2 => a2.id === state.trailAct);
    if (!act) return viewAtlas();
    const s = seq(c); const fr = frontier(c);
    const nodes = s.map((n, i) => ({ n, i })).filter(x => x.n.act === act.id);
    if (!nodes.length) return viewAtlas();
    const world = act.world; const guide = GUIDE[world] || 'honeypot';
    const [a] = ACCENT[world] || ACCENT.meadow;
    const dn = nodes.filter(x => passedNode(c, x.n)).length;
    const n = nodes.length;
    /* every Honey act rides its own four-plate panorama now; expeditions and
       anything without a LIV entry keep their single painting */
    const LV = crs !== 'exp' ? LIV[act.id] : null;
    const isMW = !!LV;
    const m = isMW ? { d: LV.d, t: LV.t } : mapOf(act.id);
    let pts = mapPoints(m.d, n);
    if (isMW && LV.pairPos) pts = pts.map((p, i) => LV.pairPos[i]
      ? { x: p.x, y: Math.min(88, Math.max(10, p.y + LV.pairPos[i].y)), f: p.f } : p);
    /* which stop the card is showing: the speller's own frontier unless they tapped;
       a tap on the open map folds the card away entirely (trailStop === -9) */
    const shut = state.trailStop === -9;
    let sel = nodes.findIndex(x => x.i === fr);
    if (sel < 0) sel = dn >= n ? n - 1 : 0;
    const picked = shut ? -1 : nodes.findIndex(x => x.i === state.trailStop);
    if (picked >= 0) sel = picked;
    const walked = Math.min(dn, n - 1);
    const st = i => { const x = nodes[i]; return passedNode(c, x.n) ? 'done'
      : (x.i === fr || (isMW && mwPairOpen(c, nodes, fr, i))) ? 'now' : 'next'; };
    /* how much of the world the camera has earned (the sliding window: all of
       the past + two stops ahead), and today's seeded gifts. The unroll BEAT
       keys off the country the CHILD stands in — never the window's margin,
       which can peek over a plate boundary without anyone arriving there. */
    const edge = isMW ? mwEdge(c, pts, nodes, fr) : 100;
    let frIdx = isMW ? nodes.findIndex(x => x.i === fr) : 0;
    if (frIdx < 0) frIdx = nodes.length - 1;
    const rv = isMW ? mwLegOfX((pts[frIdx] || { x: 0 }).x) : 3;
    const bloomI = isMW ? mwBloomIdx(c, pts, nodes, edge) : -1;
    state.mwBloomU = (isMW && bloomI >= 0 && nodes[bloomI].n.kind === 'unit') ? nodes[bloomI].n.u.id : null;

    /* Stops are HTML pins over the painting, not SVG inside it: they keep a real
       size at every board width instead of scaling with the picture, and the
       guide avatar rides one without a foreignObject. */
    /* the secrets ride the board in the open — the painting stays bright */
    const FL = fogLayer(c, act.id);
    const marks = pts.map((p, i) => {
      /* the reveal law: a stop beyond the earned edge is OFF THE CANVAS — it is
         not rendered at all, never veiled */
      if (isMW && p.x > edge + 0.5) return '';
      const kind = st(i), on = i === sel, node = nodes[i].n;
      const size = kind === 'now' ? 42 : 34;
      const bg = kind === 'done' ? 'linear-gradient(160deg,#FFD24D,#C8791B)'
        : kind === 'now' ? 'linear-gradient(160deg,#FFFBEF,#FFE9AE)' : 'rgba(250,246,236,.90)';
      const ink = kind === 'done' ? '#4A3306' : kind === 'now' ? '#7A5300' : 'rgba(58,44,22,.78)';
      /* the child's OWN avatar walks the Living Meadow; other acts keep the guide */
      const rider = kind === 'now' && window.SB_AVATAR
        ? `<span class="atlas-rider">${SB_AVATAR(isMW ? (c.avatar || 'bizzy') : guide, 34, { dark: true })}</span>` : '';
      const bloom = isMW && i === bloomI ? '<span class="mw-bloom" title="Today’s bonus bloom — clear this stop for DOUBLE honey">🌸</span>' : '';
      const spur = isMW && LV.pairPos && LV.pairPos[i] && kind !== 'done' ? `<span class="mw-spurtag">${esc(LV.pairPos[i].tag)}</span>` : '';
      return `<button class="atlas-stop${kind === 'now' ? ' now' : ''}${on ? ' on' : ''}${node.kind === 'chk' ? ' chk' : ''}"
          data-act="trailPick" data-arg="${nodes[i].i}" style="left:${p.x.toFixed(2)}%;top:${p.y.toFixed(2)}%;--pz:${on ? 5 : kind === 'now' ? 4 : 3}"
          title="Stop ${i + 1} of ${n}" aria-label="Stop ${i + 1} of ${n}">
        ${rider}${bloom}${spur}
        <span class="atlas-sd" style="width:${size}px;height:${size}px;background:${bg};color:${ink};
          box-shadow:${on ? `0 0 0 3px ${a},0 5px 14px rgba(10,6,26,.5)` : '0 4px 11px rgba(10,6,26,.45)'}">${kind === 'done' ? '✓' : (i + 1)}</span>
      </button>`;
    }).join('');
    /* the Living Meadow's own layer: landmarks, the wanderer, the teased bend,
       and today's weather */
    let mwHTML = '', mwExtra = '';
    if (isMW) {
      const glowLm = Math.floor(mwSeed(c, 'lmglow') * LV.lms.length) % LV.lms.length;
      mwHTML += LV.lms.map((lm, i) => { if (lm.x > edge) return '';
        const done2 = mwLmDone(c, i);
        const body2 = lm.anch
          ? `<span class="mw-lm-halo"></span><span class="mw-lm-n">${esc(lm.name)}${done2 ? ' ✓' : ''}</span>`
          : `<span class="mw-lm-a">${lmArt(lm)}</span><span class="mw-lm-n">${esc(lm.name)}${done2 ? ' ✓' : ''}</span>`;
        return `<button class="mw-lm${lm.anch ? ' anch' : ''}${done2 ? ' done' : ''}${i === glowLm && !done2 ? ' glow' : ''}" data-act="mwLmk" data-arg="${i}"
          style="left:${lm.x}%;top:${lm.y}%" title="${escA(lm.name + (done2 ? ' — visited today' : ' — a side round of words, +12 honey'))}">
          ${body2}</button>`; }).join('');
      const wd = mwWander(c, edge), wdr = LV.wander || MW.wander;
      if (!wd.done) mwHTML += `<button class="mw-wander" data-act="mwWander" style="left:${wd.x.toFixed(1)}%;top:${wd.y.toFixed(1)}%"
        title="${escA(wdr.name + ' has a word for you — +8 honey')}">${wdr.g}<span class="mw-lm-n">${esc(wdr.name.split(' ')[0])}</span></button>`;
      if (edge < 99) { /* the sign teases what the bend hides: the rest of this
        country if most of it is still unseen, else the next one */
        const remaining = LV.legEdge[rv] - edge;
        const nl = Math.min(3, remaining > 10 ? rv : rv + 1);
        mwHTML += `<span class="mw-sign" style="left:${(edge - 1.2).toFixed(1)}%">
        <span>→ ${esc(LV.legName[nl])}</span><i>clear the road to open the way</i></span>`; }
      /* THE LIFE LAYER: each country fields its own cast (LV.amb) — the same
         creature systems, a different ecology per act */
      const AMB = LV.amb || {};
      const BCOL = ['#F3B2C0', '#8FD0EC', '#FFD24D', '#C8A2F0', '#A8E0B0'];
      if (AMB.butter) for (let bf2 = 0; bf2 < 5; bf2++) { const bx = (6 + bf2 * 19 + mwSeed(c, 'bf' + bf2) * 8) % Math.max(20, edge - 4);
        mwHTML += `<span class="mw-butter" style="left:${bx.toFixed(1)}%;top:${(14 + (bf2 * 29) % 52)}%;--bd:${(bf2 * 2.3).toFixed(1)}s">
          <span style="display:block;width:34px;height:26px">${BFLY(BCOL[bf2])}</span></span>`; }
      if (AMB.petals) for (let pf = 0; pf < 14; pf++) { const px2 = (pf * 7.3 + mwSeed(c, 'pf' + pf) * 5) % 98;
        if (px2 > edge) continue;
        mwHTML += `<span class="mw-petalfall" style="left:${px2.toFixed(1)}%;--pd:${((pf * 1.9) % 11).toFixed(1)}s;--pw:${(7 + pf % 5)}s"></span>`; }
      for (let tw = 0; tw < 9; tw++) { const tx2 = (4 + tw * 11.2) % 96; if (tx2 > edge) continue;
        mwHTML += `<span class="mw-twink" style="left:${tx2.toFixed(1)}%;top:${(20 + (tw * 31) % 62)}%;--td:${(tw * 0.9).toFixed(1)}s"></span>`; }
      LV.pokes.forEach((pk, i) => { if (pk[0] > edge) return;
        mwHTML += `<button class="mw-poke" data-act="mwPoke" data-arg="${i}" style="left:${pk[0]}%;top:${pk[1]}%;--td:${((i * 1.3) % 8).toFixed(1)}s" aria-label="something wiggles here"></button>`; });
      /* CREATURES WITH BEHAVIOUR — not decorations. Worker bees fly flower to
         flower and PAUSE to gather (keyframe holds); birds cross the whole sky;
         seeds and dust motes drift; mist wisps roll through; water sparkles. */
      const BEEIMG = '<img src="app-art/hive-bee-fly.svg" alt="" style="width:100%;height:100%;object-fit:contain">';
      if (AMB.bees) [[6, 60, '17s', '0s'], [33, 66, '21s', '-8s'], [58, 56, '19s', '-14s'], [84, 60, '23s', '-4s']]
      .forEach(bw => { if (bw[0] > edge) return;
        mwHTML += `<span class="mw-workbee" style="left:${bw[0]}%;top:${bw[1]}%;--wd:${bw[2]};--wdl:${bw[3]}"><span>${BEEIMG}</span></span>`; });
      const BIRD = '<svg viewBox="0 0 40 16" width="100%" height="100%"><path d="M2 12 q9 -10 18 0 q9 -10 18 0" fill="none" stroke="#6B4E42" stroke-width="2.6" stroke-linecap="round"/></svg>';
      if (AMB.birds) [['5%', '34s', '0s', 22], ['9%', '46s', '-20s', 17], ['13%', '40s', '-33s', 19]].forEach(bd2 => {
        mwHTML += `<span class="mw-bird" style="top:${bd2[0]};--fd2:${bd2[1]};--fdl:${bd2[2]};width:${bd2[3]}px">${BIRD}</span>`; });
      if (AMB.seeds) for (let sd = 0; sd < 8; sd++) { const sx = (3 + sd * 12.3) % 96; if (sx > edge) continue;
        mwHTML += `<span class="mw-seed" style="left:${sx.toFixed(1)}%;top:${(30 + (sd * 27) % 48)}%;--sd2:${((sd * 2.7) % 12).toFixed(1)}s"></span>`; }
      if (AMB.wisps) [[14, 62, '26s', '0s'], [42, 70, '32s', '-12s'], [68, 58, '28s', '-20s'], [88, 66, '30s', '-6s']]
      .forEach(mi => { if (mi[0] > edge) return;
        mwHTML += `<span class="mw-wisp" style="left:${mi[0]}%;top:${mi[1]}%;--md2:${mi[2]};--mdl:${mi[3]}"></span>`; });
      /* water glitters where the painter put it */
      (AMB.water || []).forEach((bk, i) => { if (bk[0] > edge) return;
        mwHTML += `<span class="mw-twink mw-water" style="left:${bk[0]}%;top:${bk[1]}%;--td:${(i * 0.7).toFixed(1)}s"></span>`; });
      /* the HERO set-pieces: integrated living things, anchored by their feet.
         An anch:1 hero rides a feature the painter already drew — halo + label
         on the painting itself, no sprite duplicate (the wishing-well law). */
      LV.heroes.forEach((h, i) => { if (h.x > edge) return;
        mwHTML += h.anch
          ? `<button class="mw-hero anch" data-act="mwHero" data-arg="${i}"
              style="left:${h.x}%;top:${h.y}%" title="${escA(h.name)}" aria-label="${escA(h.name)}">
              <span class="mw-lm-halo"></span><span class="mw-lm-n">${esc(h.name)}</span></button>`
          : `<button class="mw-hero mw-${h.anim}" data-act="mwHero" data-arg="${i}"
              style="left:${h.x}%;top:${h.y}%;width:${h.w}px" title="${escA(h.name)}" aria-label="${escA(h.name)}">
              <img src="app-art/${h.img}.svg" alt=""></button>`; });
      const wx = mwVariant(c);
      mwExtra = wx === 'rainbow' ? '<span class="mw-wx mw-rainbow" aria-hidden="true"></span>'
        : wx === 'mist' ? '<span class="mw-wx mw-mist" aria-hidden="true"></span>'
        : '<span class="mw-wx mw-gold" aria-hidden="true"></span>';
      mwUnroll(c, rv);
    } else _mwMax = Infinity;
    const caches = (m.t || []).map((xy, i) => treMark(c, act.id, i, xy[0], xy[1], dn, n)).join('');
    const popNew = _popK !== ('a:' + act.id + ':' + sel); if (popNew) _popK = 'a:' + act.id + ':' + sel;
    if ((popNew || _fresh) && !shut) panTo(sel, pts);   // never yank a hand-scrolled board on a background render — nor on a card dismiss
    /* the meadow's clamp waits for the panorama's real layout, then homes the
       camera on the child's stop — only on a fresh view or a new pick */
    if (isMW) mwClamp(edge, (popNew || _fresh) && !shut ? (pts[sel] || pts[0]).x : null);

    const cur = nodes[sel], node = cur.n,
      locked = cur.i > fr && !devOn() && !(isMW && mwPairOpen(c, nodes, fr, sel));
    const u = node.kind === 'unit' ? node.u : null;
    const raw = u ? String(u.title || '') : 'Checkpoint';
    const cut = raw.indexOf(' — ');
    const title = cut > 0 ? raw.slice(0, cut) : raw;
    const sub = node.kind === 'chk' ? 'A mixed quiz over everything so far — no new words.' : (cut > 0 ? raw.slice(cut + 3) : '');
    const score = node.kind === 'unit' ? ((doneMap(c)[u.id] || {})[lapOf(c)] || 0) : (chkMap(c)[lapOf(c) + ':' + node.id] || 0);
    const uStars = u ? starsOf(c, u, lapOf(c)) : null;
    const uNext = (u && !locked) ? nextStar(c, u, lapOf(c)) : null;
    const goAct = node.kind === 'unit' ? 'trailUnit' : 'trailChk';
    const goArg = node.kind === 'unit' ? u.id : (crs + '|' + node.id);

    /* Where the callout sits, worked out from the selected pin's own coordinates: below
       the pin in the top half so it cannot run off the top, and edge-anchored near the
       margins because the board clips (overflow:hidden). */
    const _P = pts[sel] || { x: 50, y: 50 };
    /* on the panorama the card must also duck the CAMERA CLAMP: a pin near the
       earned edge anchors its card leftward, or half of it lives off-canvas */
    const _edge = isMW ? edge : 100;
    const _cardW = isMW ? 15 : 27;   // the card's rough width in board %
    const _side = _P.x < (isMW ? 7 : 27) ? 'l' : _P.x > _edge - _cardW ? 'r' : 'c';
    const _below = _P.y < 44;
    const _tx = _side === 'l' ? '-16px' : _side === 'r' ? 'calc(-100% + 16px)' : '-50%';
    const _ty = _below ? '24px' : 'calc(-100% - 24px)';
    const _ax = _side === 'l' ? '24px' : _side === 'r' ? 'calc(100% - 24px)' : '50%';
    const stopPop = shut ? '' : `<div class="atlas-pop${_below ? ' below' : ''}" data-act="popKeep" style="left:${_P.x.toFixed(2)}%;top:${_P.y.toFixed(2)}%;--tx:${_tx};--ty:${_ty};--ax:${_ax};${(popNew || _fresh) ? '' : 'animation:none;'}">
      <div class="atlas-pop-in">
        <div style="display:flex;align-items:flex-start;gap:13px">
          <span style="width:40px;height:40px;flex-shrink:0;border-radius:14px;display:grid;place-items:center;font-family:var(--display);font-weight:800;font-size:15px;${st(sel) === 'done' ? 'background:linear-gradient(160deg,#FFE49B,#E8A81C);color:#4A3306' : st(sel) === 'now' ? 'background:#FFFBEF;border:2px solid #F0B429;color:#7A5300' : 'background:var(--surface2);color:var(--muted)'}">${st(sel) === 'done' ? '✓' : (sel + 1)}</span>
          <div style="min-width:0;flex:1">
            <div style="font-size:11.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);display:flex;align-items:center;gap:8px;flex-wrap:wrap">Stop ${sel + 1} of ${n}${node.kind === 'chk' ? ' · checkpoint' + (score ? ' · ' + score + '%' : '') : ''}${uStars ? ' ' + starHTML(uStars.n, 12) : ''}</div>
            <div style="font-family:var(--display);font-weight:800;font-size:19px;line-height:1.15;margin-top:3px">${esc(title)}</div>
            ${sub ? `<div style="font-size:13px;color:var(--muted);line-height:1.45;margin-top:4px">${esc(sub)}</div>` : ''}
            ${uNext ? `<div style="font-size:12.5px;font-weight:700;line-height:1.45;margin-top:6px;color:var(--text)">👉 ${esc(uNext.txt)}</div>`
              : (uStars && uStars.n >= 5) ? `<div style="font-size:12.5px;font-weight:800;margin-top:6px;color:var(--good)">Completely yours — five stars.</div>` : ''}
          </div>
        </div>
        <div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:13px">
          ${locked
            ? `<span style="display:inline-flex;align-items:center;gap:7px;padding:11px 16px;border-radius:var(--r-md,10px);background:var(--surface2);color:var(--muted);font-weight:800;font-size:14px">${iconSVG('lock', 15)} Clear the earlier stops first</span>`
            : `${(u && uStars && uStars.s[0]) ? `<button data-act="trailNextFrom" data-arg="${escA(u.id)}" style="display:inline-flex;align-items:center;gap:7px;padding:11px 18px;border-radius:var(--r-md,10px);background:var(--action,var(--accent));color:var(--action-ink,#fff);font-weight:800;font-size:14px;box-shadow:var(--edge)">Next stop →</button>` : ''}
              <button data-act="${goAct}" data-arg="${escA(goArg)}" style="display:inline-flex;align-items:center;gap:7px;padding:11px 18px;border-radius:var(--r-md,10px);${(u && uStars && uStars.s[0]) ? 'background:var(--paper,var(--bg2));border:1px solid var(--line);color:var(--ink,var(--text))' : 'background:var(--action,var(--accent));color:var(--action-ink,#fff);box-shadow:var(--edge)'};font-weight:800;font-size:14px">${iconSVG(node.kind === 'chk' ? 'target' : 'steps', 15)} ${node.kind === 'chk' ? (score ? 'Walk it again' : 'Take the checkpoint') : (uStars && uStars.n >= 5 ? 'Walk it again' : uStars && uStars.n > 0 ? '★ Gain stars' : 'Learn this stop')}</button>`}
          ${(!locked && u) ? `<button data-act="trailTrain" data-arg="${escA(u.id)}" style="display:inline-flex;align-items:center;gap:7px;padding:11px 16px;border-radius:var(--r-md,10px);background:var(--paper,var(--bg2));border:1px solid var(--line);color:var(--ink,var(--text));font-weight:800;font-size:13.5px">${iconSVG('pencil', 15)} Train these words</button>` : ''}
        </div>
      </div></div>`;

    return `<div style="${RISE()}max-width:980px;margin:0 auto">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <button data-act="trailBack" style="display:inline-flex;align-items:center;gap:6px;font-weight:800;font-size:13px;color:var(--muted)">← The map</button>
        <span style="margin-left:auto;display:inline-flex;align-items:center;gap:9px">
          ${musicPill()}
          <span style="font-size:12px;font-weight:800;color:var(--muted)">Tier ${lapOf(c)}</span>
          ${ring(dn, n, dn === n ? 'var(--good)' : '#FFD24D', 34)}</span>
      </div>
      <div style="display:flex;align-items:flex-end;gap:12px;margin-bottom:10px">
        <span style="width:46px;height:46px;flex-shrink:0">${window.SB_AVATAR ? SB_AVATAR(guide, 46) : ''}</span>
        <span style="min-width:0;flex:1">
          <span style="display:block;font-family:var(--display);font-weight:800;font-size:22px;line-height:1.1">${esc(act.title)}</span>
          <span style="display:block;font-size:12.5px;color:var(--muted);font-weight:700;margin-top:2px">${esc(WORLD_LINE[world] || 'the route continues')} · ${dn} of ${n} stops${treFound(c, act.id) ? ' · ' + treFound(c, act.id) + '/3 caches' : ''}</span></span>
      </div>
      ${/* The stop card used to be a sibling BELOW the board, and the board is as tall as
            the viewport — so the two buttons that are the whole point of the screen sat
            under the fold and a child had to scroll to find out what to do. The board and
            the card now share a positioned wrapper and the card floats over the foot of
            the map. `.act-stopcard` handles the rest: it is an overlay on a tall screen and
            reverts to a plain stacked card where there is not room for one. */''}
      ${/* The stop card is a CALLOUT on the pin you tapped, not a bar across the map. As a
            full-width bar pinned to the foot of the board it covered the first six stops of
            the road and left a wide empty stripe beside two small buttons. It goes in with
            `marks` so it lives inside the board and pans with the pins, anchored off the
            selected pin's own percentage coordinates. */''}
      ${actBoard('map-' + act.id, m, pts, walked, FL.fog + marks + mwHTML + FL.cells + FL.marks + stopPop, caches, crs === 'exp',
        isMW ? { pano: { img: LV.img, extra: mwExtra } } : null)}
      ${villainCard(c)}${treGiftCard()}${uQuestCard()}
    </div>`;
  }
  /* one line of flavour per world, so an act page says where you are */
  const WORLD_LINE = { meadow: 'first words, first wins', library: 'every rule English wrote down',
    forum: 'one column, one prefix', elements: 'Greek blows in like weather',
    engine: 'roots are machine parts', strait: 'words that came ashore',
    junkyard: 'everything ever made has a name', vibe: 'some words have moods',
    stage: 'endings decide everything', warfield: 'bee-day drilled until it holds',
    greysea: 'the schwa hides in the fog', origami: 'crease by crease, a word',
    grandtrunk: 'a word at every milestone' };

  /* headless-test accessors: where this child's secrets are seeded, and the record */
  window.SB_EXPED = { spots: key => uSpots(active(), key), prog: () => uP(active()), key: () => uKey() };
  window.TRAIL = { view: () => { if (!T()) return '<div style="padding:40px;text-align:center;color:var(--muted)">Opening the Word Atlas…</div>';
    const v = state.trailView || 'map';
    const k = v + '|' + (state.trailAct || '') + '|' + (state.trailUnit || '') + '|' + (state.trailChk || '') + '|' + (state.tq ? (state.tq.over ? 'qo' : 'q' + state.tq.i) : '');
    _fresh = k !== _vk; _vk = k;
    return v === 'unit' ? viewUnit() : v === 'words' ? viewWords() : v === 'quiz' ? viewQuiz()
      : v === 'ultra' ? viewUltraAct() : v === 'act' ? viewAct() : viewAtlas(); } };

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
