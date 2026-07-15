/* ===== Advanced Mode — National Spelling Bee prep =====
   Unlocks at Level 12, Bee Band 7–8, or by unlocking. Source: the full 128k library.
   Four segments: ① Ultra Champions Journey (2-year daily sprint), ② Mock Spelling Bee
   (benchmark rounds), ③ Advanced Tips & Tricks (memory / speed / roots / tactics),
   ④ Advanced Games (memory match, rapid dictation). Data: adv-tips-data.js. */
(function () {
  const esc4 = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const escA4 = (s) => esc4(s).replace(/"/g, '&quot;');
  const TIPS = () => (window.SB_ADV_TIPS || []);

  /* ---- unlock ---- */
  function advLevel() { try { return listStageIdx(active(), 'journey') + 1; } catch (e) { return 1; } }
  function advBand() { try { return beeBand(active()).band; } catch (e) { return 2; } }
  function advUnlocked() { const c = active();
    return state.devUnlock || state.premium || !!(c && c.advPaid) || advLevel() >= 12 || advBand() >= 7; }
  const ADV_COST = 600;

  /* ---- the hardest-word library, built once from the 128k corpus ---- */
  let _hard = null, _hardFull = false;
  function hardWord(w) { const L = (w.w || '').length; const rare = 100 - Math.min(100, w.bp || 0);
    return L * 3 + rare * 0.5 + (w.y || 3) * 4; }  // long + rare + high-tier = hardest
  function hardPool() { const haveFull = !!(window.SB_FULL && SB_FULL.length);
    if (_hard && _hardFull === haveFull) return _hard;   // rebuild once the 128k library loads in
    _hardFull = haveFull;
    const src = haveFull ? SB_FULL : ((window.SB_DATA && SB_DATA.nsf) || []);
    const seen = new Set(); const pool = [];
    for (const w of src) { if (!w || !w.w) continue; if (!/^[a-z]+$/i.test(w.w)) continue; if (w.w.length < 6) continue;
      if (!(w.d && w.d.length > 6)) continue; const k = nkey(w.w); if (seen.has(k)) continue; seen.add(k); pool.push(w); }
    pool.sort((a, b) => hardWord(b) - hardWord(a));         // hardest first
    _hard = pool; return pool; }
  function dayWords(day, size) { const pool = hardPool(); const start = ((day - 1) * size) % Math.max(1, pool.length);
    const slice = pool.slice(start, start + size); if (slice.length < size) return slice.concat(pool.slice(0, size - slice.length)); return slice; }
  function totalDays(size) { return Math.max(1, Math.floor(hardPool().length / size)); }

  function aStats(c) { return c.adv || (c.adv = { day: 1, size: 200, sprinted: 0, mastered: 0, srs: {}, mockBest: 0, tipsRead: {}, memBest: 0, dictBest: 0 }); }

  /* ---- speech ---- */
  function sayW(w, rate) { try { say(w, rate); } catch (e) {} }

  const ADV = {
    open() { if (!advUnlocked()) { set({ nav: 'adv', screen: 'app', advView: 'gate', conceptSel: null }); return; }
      set({ nav: 'adv', screen: 'app', advView: 'hub', conceptSel: null }); },
    buy() { const c = active(); if (state.premium || c.advPaid) { ADV.open(); return; }
      if (!window.confirm('Unlock Advanced Mode — National Bee prep — for ' + ADV_COST + ' coins?')) return;
      if ((c.coins || 0) < ADV_COST) { flash('Need ' + ADV_COST + ' 🪙 — or reach Level 12 / Bee Band 7 to unlock free'); return; }
      c.coins -= ADV_COST; c.advPaid = true; try { sfx('win'); burstConfetti(140); } catch (e) {}
      flash('🎓 Advanced Mode unlocked — welcome to the big leagues!'); save(); set({ advView: 'hub' });
      try { if (!window.SB_FULL && typeof loadFullLibrary === 'function') loadFullLibrary(function () { try { render(); } catch (e) {} }); } catch (e) {} },
    go(v) { set({ advView: v }); },
    back() { set({ advView: 'hub' }); },

    /* ============ ① ULTRA CHAMPIONS JOURNEY — the sprint method ============ */
    setSize(n) { const st = aStats(active()); st.size = +n; save(); render(); },
    setDay(n) { const st = aStats(active()); st.day = Math.max(1, Math.min(totalDays(st.size), +n)); save(); render(); },
    startSprint() { const c = active(); const st = aStats(c);
      const ws = dayWords(st.day, st.size);
      // Sprint batches of 25 — scan a batch, then drill only the gaps
      const batch = ws.slice(0, 25);
      state.adv = { mode: 'scan', words: batch, all: ws, bi: 0, i: 0, know: [], gaps: [], drillIdx: 0, right: 0 };
      set({ advView: 'sprint' });
      setTimeout(() => { const w = batch[0]; if (w) sayW(w.w); }, 300); },
    scanMark(known) { const g = state.adv; if (!g || g.mode !== 'scan') return; const w = g.words[g.i];
      if (known) { g.know.push(w); markMastered(nkey(w.w)); addCoins(1); } else g.gaps.push(w);
      g.i++; if (g.i >= g.words.length) { ADV._afterScan(); return; }
      render(); setTimeout(() => sayW(g.words[g.i].w), 150); },
    _afterScan() { const g = state.adv;
      if (g.gaps.length) { g.mode = 'drill'; g.drillIdx = 0; state.typed = ''; render(); setTimeout(() => sayW(g.gaps[0].w), 300); }
      else ADV._nextBatch(); },
    drillSubmit() { const g = state.adv; if (!g || g.mode !== 'drill') return; const w = g.gaps[g.drillIdx];
      const ans = (state.typed || '').trim().toLowerCase(); if (!ans) { flash('Type the word'); return; }
      const ok = ans === nkey(w.w); const c = active(); const st = aStats(c);
      if (ok) { markMastered(nkey(w.w)); addCoins(2); sfx('correct'); try { burstConfetti(24); } catch (e) {}
        st.srs[nkey(w.w)] = Math.min(5, (st.srs[nkey(w.w)] || 0) + 1); g.right++; }
      else { sfx('wrong'); addMiss(w); st.srs[nkey(w.w)] = 1; try { logBand(w, false); } catch (e) {} }
      g.lastOk = ok; g.lastWord = w.w; state.typed = ''; render();
      setTimeout(() => { const t = state.adv; if (!t) return; t.drillIdx++; if (t.drillIdx >= t.gaps.length) { ADV._nextBatch(); return; }
        t.lastOk = null; render(); sayW(t.gaps[t.drillIdx].w); }, ok ? 900 : 1900); },
    _nextBatch() { const g = state.adv; const st = aStats(active());
      st.sprinted += g.words.length; save();
      const nextStart = g.bi + 25;
      if (nextStart >= g.all.length) { ADV._sprintDone(); return; }
      const batch = g.all.slice(nextStart, nextStart + 25);
      state.adv = { mode: 'scan', words: batch, all: g.all, bi: nextStart, i: 0, know: [], gaps: [], drillIdx: 0, right: (g.right || 0) };
      render(); setTimeout(() => sayW(batch[0].w), 250); },
    _sprintDone() { const c = active(); const st = aStats(c); st.day = Math.min(totalDays(st.size), st.day + 1);
      state.adv = { mode: 'done', size: st.size }; try { sfx('win'); burstConfetti(120); logActivity('practice', 'Ultra Champions sprint', { done: st.size, right: 0 }, []); } catch (e) {}
      save(); render(); },
    sayCur() { const g = state.adv; if (!g) return; const w = g.mode === 'scan' ? g.words[g.i] : g.gaps[g.drillIdx]; if (w) sayW(w.w); },
    saySlow() { const g = state.adv; if (!g) return; const w = g.mode === 'scan' ? g.words[g.i] : g.gaps[g.drillIdx]; if (w) sayW(w.w, 0.6); },

    /* ============ ② MOCK SPELLING BEE ============ */
    mockPick(kind) { const c = active(); const pool = hardPool();
      if (kind === 'written') { const list = sample(pool.slice(0, 4000), 15);
        state.adv = { mode: 'mock', round: 'written', list, i: 0, right: 0, results: [] };
        set({ advView: 'mock' }); setTimeout(() => sayW(list[0].w), 350); return; }
      if (kind === 'vocab') { const words = sample(pool.slice(0, 4000).filter(w => w.d && w.d.length > 8), 12);
        const qs = words.map(w => { const others = sample(pool.filter(x => nkey(x.w) !== nkey(w.w) && x.d && x.d.length > 8), 3).map(x => x.d);
          return { w, prompt: w.w, answer: w.d, choices: sample([w.d, ...others]) }; });
        state.adv = { mode: 'mock', round: 'vocab', qs, i: 0, right: 0, picked: null }; set({ advView: 'mock' }); return; }
      if (kind === 'lightning') { const list = sample(pool.slice(0, 6000), 60);
        state.adv = { mode: 'mock', round: 'lightning', list, i: 0, right: 0, wrong: 0, timeLeft: 60 };
        const g = state.adv; g.timer = setInterval(() => { const t = state.adv; if (!t || t.round !== 'lightning' || t.done) { clearInterval(g.timer); return; }
          t.timeLeft--; const el = document.getElementById('adv-clock'); if (el) el.textContent = t.timeLeft + 's'; if (t.timeLeft <= 0) ADV.mockEnd(); }, 1000);
        set({ advView: 'mock' }); setTimeout(() => sayW(list[0].w), 300); return; } },
    mockSubmit() { const g = state.adv; if (!g || g.round === 'vocab') return; const w = g.list[g.i];
      const ans = (state.typed || '').trim().toLowerCase(); if (!ans && g.round === 'written') { flash('Type the word'); return; }
      const ok = ans === nkey(w.w); try { logBand(w, ok); } catch (e) {}
      if (ok) { addCoins(1); sfx('correct'); g.right++; } else { sfx('wrong'); if (g.round !== 'lightning') addMiss(w); }
      if (g.round === 'written') { g.results.push({ w: w.w, ok }); state.typed = ''; g.i++;
        if (g.i >= g.list.length) { ADV.mockEnd(); return; } render(); setTimeout(() => sayW(g.list[g.i].w), 250); return; }
      if (g.round === 'lightning') { if (!ok) g.wrong++; state.typed = ''; g.i = (g.i + 1) % g.list.length; render(); setTimeout(() => sayW(g.list[g.i].w), 120); } },
    mockPickVocab(idx) { const g = state.adv; if (!g || g.round !== 'vocab' || g.picked != null) return; const q = g.qs[g.i];
      g.picked = idx; const ok = q.choices[idx] === q.answer; if (ok) { g.right++; addCoins(1); sfx('correct'); } else sfx('wrong'); render();
      setTimeout(() => { const t = state.adv; if (!t) return; if (t.i + 1 < t.qs.length) { t.i++; t.picked = null; render(); } else ADV.mockEnd(); }, 1100); },
    mockEnd() { const g = state.adv; if (!g || g.done) return; g.done = true; if (g.timer) clearInterval(g.timer);
      const c = active(); const st = aStats(c); const total = g.round === 'lightning' ? (g.right + g.wrong) : (g.list ? g.list.length : g.qs.length);
      const pct = total ? Math.round(g.right / total * 100) : 0; g.pct = pct; g.total = total;
      const bonus = 3 + g.right; addCoins(bonus); g.bonus = bonus;
      if (g.round === 'lightning' && g.right > (st.mockBest || 0)) st.mockBest = g.right;
      try { logActivity('practice', 'Mock Bee — ' + g.round, { done: total, right: g.right, coins: bonus }, []); sfx(pct >= 70 ? 'win' : 'level'); if (pct >= 70) burstConfetti(110); } catch (e) {}
      save(); render(); },

    /* ============ ③ ADVANCED TIPS ============ */
    openTip(i) { const c = active(); (aStats(c).tipsRead = aStats(c).tipsRead || {})[i] = 1; save(); set({ advView: 'tip', advTip: +i }); },
    tipCat(cat) { set({ advTipCat: cat }); },

    /* ============ ④ ADVANCED GAMES ============ */
    memStart() { const pool = hardPool().slice(0, 3000); const words = sample(pool.filter(w => w.d && w.d.length > 8 && w.d.length < 90), 6);
      const cards = []; words.forEach((w, k) => { cards.push({ id: k, t: 'w', label: w.w }); cards.push({ id: k, t: 'd', label: trunc(w.d, 60) }); });
      state.adv = { mode: 'mem', cards: sample(cards), open: [], matched: [], moves: 0, done: false }; set({ advView: 'mem' }); },
    memFlip(idx) { const g = state.adv; if (!g || g.mode !== 'mem') return; idx = +idx;
      if (g.open.length >= 2 || g.open.includes(idx) || g.matched.includes(idx)) return;
      g.open.push(idx); if (g.open.length === 2) { g.moves++; const [a, b] = g.open;
        if (g.cards[a].id === g.cards[b].id && g.cards[a].t !== g.cards[b].t) { g.matched.push(a, b); g.open = []; addCoins(2); sfx('correct'); try { burstConfetti(20); } catch (e) {}
          if (g.matched.length >= g.cards.length) ADV._memDone(); }
        else { render(); setTimeout(() => { const t = state.adv; if (t) { t.open = []; render(); } }, 900); return; } }
      render(); },
    _memDone() { const c = active(); const st = aStats(c); g_bonus: { const g = state.adv; g.done = true;
      const score = Math.max(1, 30 - g.moves); if (score > (st.memBest || 0)) st.memBest = score;
      addCoins(6); try { sfx('win'); burstConfetti(130); } catch (e) {} save(); render(); } },
    dictStart() { const pool = hardPool().slice(0, 6000); const list = sample(pool, 80);
      state.adv = { mode: 'dict', list, i: 0, right: 0, timeLeft: 90, done: false };
      const g = state.adv; g.timer = setInterval(() => { const t = state.adv; if (!t || t.mode !== 'dict' || t.done) { clearInterval(g.timer); return; }
        t.timeLeft--; const el = document.getElementById('adv-clock'); if (el) el.textContent = t.timeLeft + 's'; if (t.timeLeft <= 0) ADV._dictDone(); }, 1000);
      set({ advView: 'dict' }); setTimeout(() => sayW(list[0].w), 300); },
    dictSubmit() { const g = state.adv; if (!g || g.mode !== 'dict') return; const w = g.list[g.i];
      const ans = (state.typed || '').trim().toLowerCase(); const ok = ans === nkey(w.w);
      if (ok) { g.right++; addCoins(1); sfx('correct'); try { logBand(w, true); } catch (e) {} } else { sfx('wrong'); }
      state.typed = ''; g.i = (g.i + 1) % g.list.length; render(); setTimeout(() => sayW(g.list[g.i].w), 120); },
    _dictDone() { const g = state.adv; if (g.done) return; g.done = true; if (g.timer) clearInterval(g.timer);
      const c = active(); const st = aStats(c); if (g.right > (st.dictBest || 0)) st.dictBest = g.right;
      addCoins(3 + Math.floor(g.right / 2)); try { sfx('win'); if (g.right >= 15) burstConfetti(110); logActivity('practice', 'Rapid dictation sprint', { done: g.i, right: g.right }, []); } catch (e) {} save(); render(); },
    exit() { const g = state.adv; if (g && g.timer) clearInterval(g.timer); state.adv = null; set({ advView: 'hub' }); },

    /* ============ VIEWS ============ */
    view() { const v = state.advView || (advUnlocked() ? 'hub' : 'gate');
      if (v === 'gate' || (!advUnlocked() && v !== 'gate')) return ADV._gate();
      if (v === 'sprint') return ADV._sprintView();
      if (v === 'mock') return ADV._mockView();
      if (v === 'ucj') return ADV._ucjView();
      if (v === 'tips') return ADV._tipsView();
      if (v === 'tip') return ADV._tipView();
      if (v === 'games') return ADV._gamesView();
      if (v === 'mem') return ADV._memView();
      if (v === 'dict') return ADV._dictView();
      return ADV._hub(); },

    _shell(inner, back) { return `<div style="max-width:720px;margin:0 auto">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><button data-act="${back || 'advBack'}" style="color:var(--muted);font-weight:700;font-size:13px">← ${back === 'advExit' ? 'Quit' : 'Advanced'}</button></div>${inner}</div>`; },

    _gate() { const lvl = advLevel(); const band = advBand();
      return `<div style="max-width:560px;margin:0 auto;text-align:center;animation:sb-rise .35s ease both">
        <div style="font-size:56px;margin-bottom:6px">🎓</div>
        <h2 style="font-family:var(--display);font-weight:800;font-size:26px;margin:0 0 6px">Advanced Mode</h2>
        <p style="color:var(--muted);font-size:15px;line-height:1.55;margin:0 0 20px">National Spelling Bee prep, drawn from the full <b>128,000-word</b> library. Master the very hardest words with a 2-year sprint plan, mock bees, champion techniques and advanced games.</p>
        <div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:20px;text-align:left;margin-bottom:16px">
          <div style="font-weight:800;font-size:13px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:12px">Unlock any one way</div>
          ${[['🏆', 'Reach Level 12 on the Journey', 'Level ' + lvl + ' / 12', lvl >= 12],
            ['📈', 'Prove Bee Band 7 or higher', 'Band ' + band + ' / 7', band >= 7],
            ['🪙', 'Unlock now for ' + ADV_COST + ' coins', (active().coins || 0) + ' coins', false]].map(([e, t, m, done]) =>
            `<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--line2,var(--line))">
              <span style="font-size:22px">${e}</span><span style="flex:1;font-weight:700;font-size:14px">${t}</span>
              <span style="font-size:12px;font-weight:800;color:${done ? 'var(--good,#1f9d57)' : 'var(--muted)'}">${done ? '✓ done' : m}</span></div>`).join('')}
        </div>
        <button data-act="advBuy" style="width:100%;padding:15px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">${(active().coins || 0) >= ADV_COST ? 'Unlock for ' + ADV_COST + ' 🪙' : 'Keep climbing to unlock'}</button>
      </div>`; },

    _hub() { const c = active(); const st = aStats(c);
      const seg = (v, e, col, title, sub, meta) => `<button data-act="advGo" data-arg="${v}" style="text-align:left;background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:18px;padding:0;overflow:hidden;box-shadow:var(--sh-rest);display:flex;flex-direction:column">
        <div style="height:6px;background:${col}"></div>
        <div style="padding:16px 18px;display:flex;align-items:center;gap:14px">
          <span style="width:52px;height:52px;border-radius:15px;flex-shrink:0;display:grid;place-items:center;font-size:27px;background:color-mix(in srgb,${col} 15%,transparent)">${e}</span>
          <span style="min-width:0;flex:1"><span style="display:block;font-family:var(--display);font-weight:800;font-size:17px;line-height:1.15">${title}</span>
            <span style="display:block;font-size:12.5px;color:var(--muted);font-weight:600;margin-top:2px;line-height:1.4">${sub}</span></span>
          <span style="flex-shrink:0;text-align:right"><span style="display:block;font-size:11px;font-weight:800;color:${col}">${meta}</span><span style="color:${col};font-weight:800">→</span></span>
        </div></button>`;
      return `<div style="max-width:720px;margin:0 auto;animation:sb-rise .35s ease both">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px"><button data-act="goHome" style="color:var(--muted);font-weight:700;font-size:13px">← Home</button></div>
        <div style="display:flex;align-items:center;gap:11px;margin:6px 0 4px"><span style="font-size:30px">🎓</span><h2 style="font-family:var(--display);font-weight:800;font-size:24px;margin:0">Advanced Mode</h2></div>
        <p style="color:var(--muted);font-size:13.5px;margin:0 0 18px">National-bee prep from the 128,000-word library. Master the hardest words.</p>
        <div style="display:grid;gap:12px">
          ${seg('ucj', '🚀', '#7C5CFF', 'Ultra Champions Journey', '2-year plan · 150–300 words a day, list after list, with the fast Sprint method.', 'Day ' + st.day)}
          ${seg('mock', '🏅', '#C8901B', 'Mock Spelling Bee', 'Practice rounds — written, vocabulary & lightning — with a readiness benchmark.', 'best ' + (st.mockBest || 0))}
          ${seg('tips', '🧠', '#13A892', 'Tips & Tricks', 'Memory, fast reading, etymology & bee-day tactics from champion methodology.', Object.keys(st.tipsRead || {}).length + ' read')}
          ${seg('games', '🎮', '#E8458C', 'Advanced Games', 'Memory match & rapid dictation — the drills a national-level speller needs.', 'play')}
        </div>
      </div>`; },

    _ucjView() { const c = active(); const st = aStats(c); const td = totalDays(st.size);
      const words = dayWords(st.day, st.size);
      const sizeBtn = (n) => `<button data-act="advSize" data-arg="${n}" style="flex:1;padding:10px;border-radius:11px;font-weight:800;font-size:13px;${st.size === n ? 'background:var(--accent);color:#fff;box-shadow:var(--edge)' : 'background:var(--surface2);color:var(--muted);border:1px solid var(--line)'}">${n}/day</button>`;
      const preview = words.slice(0, 30).map(w => `<span style="font-family:var(--mono);font-size:12px;font-weight:700;padding:4px 9px;border-radius:6px;background:var(--surface2)">${esc4(w.w)}</span>`).join('');
      return ADV._shell(`
        <div style="display:flex;align-items:center;gap:11px;margin-bottom:6px"><span style="font-size:26px">🚀</span><h2 style="font-family:var(--display);font-weight:800;font-size:21px;margin:0">Ultra Champions Journey</h2></div>
        <p style="color:var(--muted);font-size:13px;margin:0 0 16px">A two-year climb through the hardest ${fmtN(hardPool().length)} words. Each day is a fresh list — learn it fast with the Sprint method: <b>scan in bulk, drill only your gaps</b>, and let spaced repetition lock the rest.</p>
        <div style="background:var(--bg2);border:1px solid var(--line);border-radius:16px;padding:16px;margin-bottom:14px">
          <div style="font-size:12px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Words per day</div>
          <div style="display:flex;gap:8px;margin-bottom:6px">${sizeBtn(150)}${sizeBtn(200)}${sizeBtn(300)}</div>
          <div style="font-size:12px;color:var(--muted)">At ${st.size}/day that's about <b>${fmtN(td)} days</b> to cover them all — want more? Just start the next day when you finish.</div>
        </div>
        <div style="background:var(--bg2);border:1px solid var(--line);border-radius:16px;padding:16px;margin-bottom:16px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="font-family:var(--display);font-weight:800;font-size:16px">Day ${st.day}</span>
            <span style="font-size:12px;color:var(--muted);font-weight:700">of ${fmtN(td)} · ${st.size} words</span>
            <span style="margin-left:auto;display:flex;gap:6px"><button data-act="advDay" data-arg="${st.day - 1}" ${st.day <= 1 ? 'disabled' : ''} style="width:30px;height:30px;border-radius:8px;background:var(--surface2);font-weight:800;${st.day <= 1 ? 'opacity:.4' : ''}">‹</button><button data-act="advDay" data-arg="${st.day + 1}" style="width:30px;height:30px;border-radius:8px;background:var(--surface2);font-weight:800">›</button></span></div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;max-height:120px;overflow:hidden;position:relative">${preview}<div style="position:absolute;inset:auto 0 0 0;height:40px;background:linear-gradient(transparent,var(--bg2))"></div></div>
          <div style="font-size:11.5px;color:var(--muted);margin-top:8px">+${st.size - 30} more in today's list</div>
        </div>
        <button data-act="advStartSprint" style="width:100%;padding:16px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:16px;box-shadow:var(--edge)">Start Day ${st.day} Sprint →</button>
      `); },

    _sprintView() { const g = state.adv; if (!g) { set({ advView: 'ucj' }); return ''; }
      if (g.mode === 'done') return ADV._shell(`<div style="max-width:520px;margin:0 auto;text-align:center;background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:34px;box-shadow:var(--glow);animation:sb-pop .35s ease both">
        <div style="font-size:50px">🎉</div><h2 style="font-family:var(--display);font-weight:800;font-size:24px;margin:8px 0">Day complete!</h2>
        <p style="color:var(--muted);font-size:14px">You sprinted through today's list. Tomorrow's ${g.size} words are ready when you are.</p>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:18px"><button data-act="advGo" data-arg="ucj" style="padding:13px 22px;border-radius:13px;background:var(--accent);color:#fff;font-weight:800">Next day →</button></div></div>`, 'advExit');
      if (g.mode === 'scan') { const w = g.words[g.i]; const n = g.words.length;
        return ADV._shell(`
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px"><span style="font-family:var(--mono);font-size:12px;color:var(--muted);font-weight:700">SCAN ${g.i + 1}/${n}</span><span style="font-size:12px;color:var(--muted)">· tap what you already know</span><span style="margin-left:auto;font-family:var(--mono);font-size:12px;color:var(--good,#1f9d57)">✓ ${g.know.length} · gaps ${g.gaps.length}</span></div>
          <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:26px 22px;box-shadow:var(--glow);text-align:center;margin-bottom:14px">
            <div style="font-family:var(--display);font-weight:800;font-size:clamp(26px,7vw,40px);letter-spacing:.01em">${esc4(w.w)}</div>
            <div style="display:flex;gap:8px;justify-content:center;margin:10px 0"><button data-act="advSayCur" style="padding:8px 14px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:12.5px">${iconSVG('volume', 15)} Hear</button><button data-act="advSaySlow" style="padding:8px 14px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:12.5px">Slow</button></div>
            <div style="font-size:14px;color:var(--muted);line-height:1.5">${esc4(w.d)}</div>
            ${w.o ? `<div style="font-size:12px;color:var(--muted);margin-top:6px"><b>Origin:</b> ${esc4(w.o)}${w.r ? ' · ' + esc4(trunc(w.r, 70)) : ''}</div>` : ''}
          </div>
          <div style="display:flex;gap:11px"><button data-act="advScanMark" data-arg="0" style="flex:1;padding:15px;border-radius:14px;background:var(--fix-tint,#FBE9E7);color:var(--fix,#C4453C);font-weight:800;font-size:15px;border:1.5px solid var(--fix,#C4453C)">Need to learn ✗</button><button data-act="advScanMark" data-arg="1" style="flex:1;padding:15px;border-radius:14px;background:var(--mastered-tint,#E1F4E8);color:var(--good,#1f9d57);font-weight:800;font-size:15px;border:1.5px solid var(--good,#1f9d57)">I know it ✓</button></div>
          <p style="text-align:center;font-size:11.5px;color:var(--muted);margin-top:12px">Batch of 25 · scan fast, then you'll drill just the ✗ words</p>
        `, 'advExit'); }
      // drill
      const w = g.gaps[g.drillIdx]; const dn = g.gaps.length;
      const fb = g.lastOk != null ? (g.lastOk ? `<div style="color:var(--good,#1f9d57);font-weight:800;font-size:14px;margin-bottom:10px">✓ Locked in!</div>` : `<div style="background:var(--fix-tint,#FBE9E7);border:1.5px solid var(--fix,#C4453C);border-radius:12px;padding:11px;margin-bottom:12px"><div style="font-size:11px;font-weight:800;text-transform:uppercase;color:var(--fix,#C4453C)">The spelling</div><div style="font-family:var(--entry);font-weight:800;font-size:24px;letter-spacing:.14em">${esc4(g.lastWord)}</div></div>`) : '';
      return ADV._shell(`
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px"><span style="font-family:var(--mono);font-size:12px;color:var(--accent);font-weight:800">DRILL YOUR GAPS ${g.drillIdx + 1}/${dn}</span><span style="margin-left:auto;font-family:var(--mono);font-size:12px;color:var(--good,#1f9d57)">✓ ${g.right}</span></div>
        <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:24px;box-shadow:var(--glow);text-align:center">
          <p style="font-size:13px;color:var(--muted);font-weight:700;margin:0 0 12px">Hear it, then spell it</p>
          <button data-act="advSayCur" style="display:inline-flex;align-items:center;gap:9px;padding:12px 22px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge);margin-bottom:8px">${iconSVG('volume', 18)} Hear the word</button>
          <button data-act="advSaySlow" style="display:block;margin:0 auto 14px;padding:7px 14px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);font-weight:700;font-size:12.5px">Slower</button>
          ${w.d ? `<div style="font-size:13px;color:var(--muted);margin-bottom:12px;line-height:1.5">${esc4(w.d)}</div>` : ''}
          ${fb}
          <input data-inp="onType" data-key="advKey" data-fkey="typed" value="${escA4(state.typed || '')}" placeholder="type the word" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" style="width:100%;text-align:center;padding:16px;border-radius:14px;background:var(--surface);border:2px solid var(--line);color:var(--text);font-family:var(--entry);font-weight:700;font-size:clamp(20px,5vw,26px);letter-spacing:.12em;text-transform:lowercase;outline:none;margin-bottom:12px">
          <button data-act="advDrillSubmit" style="width:100%;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Enter →</button>
        </div>`, 'advExit'); },

    _mockView() { const g = state.adv;
      if (!g || g.mode !== 'mock') { // picker
        const st = aStats(active());
        const card = (kind, e, name, desc) => `<button data-act="advMockPick" data-arg="${kind}" style="text-align:left;background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:16px;padding:15px 16px;display:flex;align-items:center;gap:13px;box-shadow:var(--sh-rest)">
          <span style="width:46px;height:46px;border-radius:13px;flex-shrink:0;display:grid;place-items:center;font-size:23px;background:color-mix(in srgb,#C8901B 15%,transparent)">${e}</span>
          <span style="min-width:0;flex:1"><span style="display:block;font-family:var(--display);font-weight:800;font-size:15.5px">${name}</span><span style="display:block;font-size:12px;color:var(--muted);font-weight:600">${desc}</span></span>
          <span style="color:#C8901B;font-weight:800">→</span></button>`;
        return ADV._shell(`
          <div style="display:flex;align-items:center;gap:11px;margin-bottom:6px"><span style="font-size:26px">🏅</span><h2 style="font-family:var(--display);font-weight:800;font-size:21px;margin:0">Mock Spelling Bee</h2></div>
          <p style="color:var(--muted);font-size:13px;margin:0 0 16px">Simulate the real thing. Each round scores you against national-level words. ${st.mockBest ? '<b>Lightning best: ' + st.mockBest + '</b>' : ''}</p>
          <div style="display:grid;gap:11px">
            ${card('written', '✍️', 'Written Round', '15 dictated words — hear, then spell. Scored at the end.')}
            ${card('vocab', '📖', 'Vocabulary Round', '12 hard words — pick the correct meaning.')}
            ${card('lightning', '⚡', 'Lightning Round', '60 seconds — spell as many as you can.')}
          </div>`, 'advBack'); }
      if (g.done) { const verdict = g.pct >= 85 ? ['🏆', 'National-ready', 'var(--good,#1f9d57)'] : g.pct >= 65 ? ['🥇', 'State level', '#C8901B'] : g.pct >= 45 ? ['🥈', 'Regional level', '#3D7DF0'] : ['🥉', 'Keep drilling', 'var(--muted)'];
        return ADV._shell(`<div style="max-width:520px;margin:0 auto;text-align:center;background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:32px;box-shadow:var(--glow);animation:sb-pop .35s ease both">
          <div style="font-size:48px">${verdict[0]}</div>
          <h2 style="font-family:var(--display);font-weight:800;font-size:22px;margin:6px 0 2px">${g.round[0].toUpperCase() + g.round.slice(1)} round</h2>
          <div style="font-family:var(--display);font-weight:800;font-size:42px;color:var(--accent);line-height:1;margin-top:8px">${g.right}/${g.total}</div>
          <div style="font-size:13px;color:var(--muted);font-weight:700;margin-top:4px">${g.pct}% right</div>
          <div style="display:inline-block;margin-top:12px;padding:7px 16px;border-radius:999px;font-weight:800;font-size:14px;color:#fff;background:${verdict[2]}">${verdict[1]}</div>
          <div style="display:flex;gap:10px;justify-content:center;margin-top:20px"><button data-act="advGo" data-arg="mock" style="padding:13px 20px;border-radius:13px;background:var(--surface2);border:1px solid var(--line);font-weight:800">Another round</button><button data-act="advMockPick" data-arg="${g.round}" style="padding:13px 20px;border-radius:13px;background:var(--accent);color:#fff;font-weight:800">Retry →</button></div>
        </div>`, 'advExit'); }
      if (g.round === 'vocab') { const q = g.qs[g.i];
        const choices = q.choices.map((ch, idx) => { let bg = 'var(--surface2)', bd = 'var(--line)';
          if (g.picked != null) { if (ch === q.answer) { bg = 'color-mix(in srgb,#1f9d57 20%,var(--bg2))'; bd = '#1f9d57'; } else if (idx === g.picked) { bg = 'color-mix(in srgb,var(--bad) 18%,var(--bg2))'; bd = 'var(--bad)'; } }
          return `<button data-act="advMockVocab" data-arg="${idx}" ${g.picked != null ? 'disabled' : ''} style="text-align:left;padding:13px 15px;border-radius:12px;background:${bg};border:2px solid ${bd};font-weight:700;font-size:13.5px;line-height:1.4">${esc4(ch)}</button>`; }).join('');
        return ADV._shell(`<div style="font-family:var(--mono);font-size:12px;color:var(--muted);margin-bottom:10px">VOCABULARY ${g.i + 1}/${g.qs.length} · ✓ ${g.right}</div>
          <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:26px;box-shadow:var(--glow);text-align:center;margin-bottom:13px"><div style="font-size:11px;color:var(--muted);font-weight:800;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">What does it mean?</div><div style="font-family:var(--display);font-weight:800;font-size:clamp(22px,5.5vw,30px)">${esc4(q.prompt)}</div><button data-act="advSayW" data-arg="${escA4(q.w.w)}" style="margin-top:10px;padding:8px 15px;border-radius:999px;background:var(--surface2);font-weight:700;font-size:12.5px">${iconSVG('volume', 14)} Hear</button></div>
          <div style="display:grid;gap:9px">${choices}</div>`, 'advExit'); }
      // written / lightning
      const w = g.list[g.i];
      const head = g.round === 'lightning' ? `<span style="font-family:var(--display);font-weight:900;font-size:19px;color:${g.timeLeft <= 10 ? 'var(--bad)' : 'var(--accent)'}"><span id="adv-clock">${g.timeLeft}s</span></span><span style="font-family:var(--mono);font-size:13px;color:var(--muted);margin-left:10px">✓ ${g.right}</span>` : `<span style="font-family:var(--mono);font-size:13px;color:var(--muted)">WRITTEN ${g.i + 1}/${g.list.length} · ✓ ${g.right}</span>`;
      return ADV._shell(`<div style="margin-bottom:12px">${head}</div>
        <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:24px;box-shadow:var(--glow);text-align:center">
          <p style="font-size:13px;color:var(--muted);font-weight:700;margin:0 0 12px">Listen and spell</p>
          <button data-act="advSayCurList" style="display:inline-flex;align-items:center;gap:9px;padding:12px 22px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge);margin-bottom:8px">${iconSVG('volume', 18)} Hear the word</button>
          ${g.round === 'written' && w.d ? `<div style="font-size:12.5px;color:var(--muted);margin:8px 0 4px;line-height:1.45">${esc4(w.d)}</div>` : ''}
          <input data-inp="onType" data-key="advKey" data-fkey="typed" value="${escA4(state.typed || '')}" placeholder="spell it" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" style="width:100%;text-align:center;padding:15px;border-radius:14px;background:var(--surface);border:2px solid var(--line);color:var(--text);font-family:var(--entry);font-weight:700;font-size:clamp(19px,5vw,25px);letter-spacing:.12em;text-transform:lowercase;outline:none;margin:12px 0">
          <button data-act="advMockSubmit" style="width:100%;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Enter →</button>
        </div>`, 'advExit'); },

    _tipsView() { const cat = state.advTipCat || 'memory';
      const CATS = [['memory', '🧠', 'Memory'], ['speed', '⚡', 'Fast reading'], ['roots', '🌿', 'Etymology'], ['tactics', '🎯', 'Bee-day']];
      const tabs = CATS.map(([k, e, l]) => `<button data-act="advTipCat" data-arg="${k}" style="padding:9px 13px;border-radius:999px;font-weight:800;font-size:12.5px;${cat === k ? 'background:var(--accent);color:#fff;box-shadow:var(--edge)' : 'background:var(--surface2);color:var(--muted);border:1px solid var(--line)'}">${e} ${l}</button>`).join('');
      const tips = TIPS().map((t, i) => ({ t, i })).filter(x => x.t.cat === cat);
      const cards = tips.map(({ t, i }) => { const read = (aStats(active()).tipsRead || {})[i];
        return `<button data-act="advOpenTip" data-arg="${i}" style="text-align:left;background:var(--paper,var(--bg2));border:1px solid ${read ? 'var(--good,#1f9d57)' : 'var(--line)'};border-radius:15px;padding:14px 16px;display:flex;align-items:center;gap:13px;box-shadow:var(--sh-rest)">
          <span style="font-size:26px;flex-shrink:0">${t.ic}</span>
          <span style="min-width:0;flex:1"><span style="display:block;font-family:var(--display);font-weight:800;font-size:15px;line-height:1.2">${esc4(t.title)}</span><span style="display:block;font-size:12px;color:var(--muted);font-weight:600;margin-top:3px;line-height:1.4">${esc4(t.hook)}</span></span>
          <span style="color:var(--accent);font-weight:800;flex-shrink:0">${read ? '✓' : '→'}</span></button>`; }).join('');
      return ADV._shell(`
        <div style="display:flex;align-items:center;gap:11px;margin-bottom:12px"><span style="font-size:26px">🧠</span><h2 style="font-family:var(--display);font-weight:800;font-size:21px;margin:0">Tips &amp; Tricks</h2></div>
        <div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:16px">${tabs}</div>
        <div style="display:grid;gap:10px">${cards || '<p style="color:var(--muted)">Loading techniques…</p>'}</div>`, 'advBack'); },

    _tipView() { const t = TIPS()[state.advTip]; if (!t) { set({ advView: 'tips' }); return ''; }
      const steps = (t.steps || []).map((s, i) => `<div style="display:flex;gap:11px;align-items:flex-start;margin-bottom:10px"><span style="width:24px;height:24px;border-radius:50%;flex-shrink:0;background:var(--accent);color:#fff;display:grid;place-items:center;font-weight:800;font-size:12px">${i + 1}</span><span style="font-size:14px;line-height:1.5">${esc4(s)}</span></div>`).join('');
      return ADV._shell(`
        <div style="text-align:center;margin-bottom:16px"><div style="font-size:48px">${t.ic}</div><h2 style="font-family:var(--display);font-weight:800;font-size:23px;margin:6px 0 4px">${esc4(t.title)}</h2><p style="color:var(--muted);font-size:14px;margin:0;line-height:1.5">${esc4(t.hook)}</p></div>
        <div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:20px;margin-bottom:14px"><div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin-bottom:14px">How to do it</div>${steps}</div>
        ${t.example ? `<div style="background:var(--chip);border-radius:16px;padding:16px 18px;margin-bottom:14px"><div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--accent);margin-bottom:6px">Worked example</div><div style="font-size:14px;line-height:1.55;color:var(--text)">${esc4(t.example)}</div></div>` : ''}
        ${t.drill ? `<div style="display:flex;gap:10px;align-items:center;background:var(--treasure-tint,#FFF3D6);border-radius:14px;padding:13px 16px"><span style="font-size:20px">🎯</span><span style="font-size:13.5px;font-weight:700;color:var(--treasure-deep,#8A5B00)">${esc4(t.drill)}</span></div>` : ''}
        <button data-act="advGo" data-arg="tips" style="width:100%;margin-top:16px;padding:13px;border-radius:13px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:14px">← More techniques</button>
      `, 'advBack'); },

    _gamesView() { const st = aStats(active());
      const card = (act, e, name, desc, best) => `<button data-act="${act}" style="text-align:left;background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:16px;padding:15px 16px;display:flex;align-items:center;gap:13px;box-shadow:var(--sh-rest)">
        <span style="width:46px;height:46px;border-radius:13px;flex-shrink:0;display:grid;place-items:center;font-size:23px;background:color-mix(in srgb,#E8458C 15%,transparent)">${e}</span>
        <span style="min-width:0;flex:1"><span style="display:block;font-family:var(--display);font-weight:800;font-size:15.5px">${name}</span><span style="display:block;font-size:12px;color:var(--muted);font-weight:600">${desc}</span></span>
        <span style="text-align:right;flex-shrink:0"><span style="display:block;font-size:11px;font-weight:800;color:#E8458C">${best}</span><span style="color:#E8458C;font-weight:800">→</span></span></button>`;
      return ADV._shell(`
        <div style="display:flex;align-items:center;gap:11px;margin-bottom:12px"><span style="font-size:26px">🎮</span><h2 style="font-family:var(--display);font-weight:800;font-size:21px;margin:0">Advanced Games</h2></div>
        <p style="color:var(--muted);font-size:13px;margin:0 0 16px">Drills built for elite spellers — pattern memory and raw dictation speed.</p>
        <div style="display:grid;gap:11px">
          ${card('advMemStart', '🃏', 'Memory Match', 'Pair hard words with their meanings — trains recall.', 'best ' + (st.memBest || 0))}
          ${card('advDictStart', '⌨️', 'Rapid Dictation', '90 seconds — hear &amp; type as many as you can.', 'best ' + (st.dictBest || 0))}
        </div>`, 'advBack'); },

    _memView() { const g = state.adv; if (!g || g.mode !== 'mem') { set({ advView: 'games' }); return ''; }
      if (g.done) return ADV._shell(`<div style="max-width:460px;margin:0 auto;text-align:center;background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:32px;box-shadow:var(--glow);animation:sb-pop .35s ease both"><div style="font-size:48px">🃏</div><h2 style="font-family:var(--display);font-weight:800;font-size:22px;margin:8px 0 2px">All matched!</h2><p style="color:var(--muted);font-size:14px">Solved in ${g.moves} moves.</p><div style="display:flex;gap:10px;justify-content:center;margin-top:18px"><button data-act="advGo" data-arg="games" style="padding:12px 20px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);font-weight:800">Back</button><button data-act="advMemStart" style="padding:12px 20px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800">Again →</button></div></div>`, 'advExit');
      const cells = g.cards.map((c, i) => { const shown = g.open.includes(i) || g.matched.includes(i); const done = g.matched.includes(i);
        return `<button data-act="advMemFlip" data-arg="${i}" ${done ? 'disabled' : ''} style="aspect-ratio:1;border-radius:13px;display:grid;place-items:center;padding:8px;text-align:center;font-weight:700;font-size:${c.t === 'w' ? '13px' : '10.5px'};line-height:1.25;background:${shown ? (done ? 'color-mix(in srgb,#1f9d57 18%,var(--bg2))' : 'var(--paper,var(--bg2))') : 'linear-gradient(135deg,#E8458C,#B14FC4)'};border:1px solid ${done ? '#1f9d57' : 'var(--line)'};color:${shown ? 'var(--text)' : '#fff'};overflow:hidden">${shown ? esc4(c.label) : '🐝'}</button>`; }).join('');
      return ADV._shell(`<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px"><span style="font-family:var(--display);font-weight:800;font-size:17px">Memory Match</span><span style="font-size:12px;color:var(--muted);font-weight:700">match word ↔ meaning</span><span style="margin-left:auto;font-family:var(--mono);font-size:13px;color:var(--muted)">${g.moves} moves</span></div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:9px">${cells}</div>`, 'advExit'); },

    _dictView() { const g = state.adv; if (!g || g.mode !== 'dict') { set({ advView: 'games' }); return ''; }
      if (g.done) return ADV._shell(`<div style="max-width:460px;margin:0 auto;text-align:center;background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:32px;box-shadow:var(--glow);animation:sb-pop .35s ease both"><div style="font-size:48px">⌨️</div><h2 style="font-family:var(--display);font-weight:800;font-size:22px;margin:8px 0 2px">Time!</h2><div style="font-family:var(--display);font-weight:800;font-size:40px;color:var(--accent)">${g.right}</div><p style="color:var(--muted);font-size:13px">words in 90 seconds</p><div style="display:flex;gap:10px;justify-content:center;margin-top:18px"><button data-act="advGo" data-arg="games" style="padding:12px 20px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);font-weight:800">Back</button><button data-act="advDictStart" style="padding:12px 20px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800">Again →</button></div></div>`, 'advExit');
      return ADV._shell(`<div style="margin-bottom:12px"><span style="font-family:var(--display);font-weight:900;font-size:19px;color:${g.timeLeft <= 15 ? 'var(--bad)' : 'var(--accent)'}"><span id="adv-clock">${g.timeLeft}s</span></span><span style="font-family:var(--mono);font-size:13px;color:var(--muted);margin-left:10px">✓ ${g.right}</span></div>
        <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:24px;box-shadow:var(--glow);text-align:center">
          <p style="font-size:13px;color:var(--muted);font-weight:700;margin:0 0 12px">Hear it, type it, go!</p>
          <button data-act="advSayCurList" style="display:inline-flex;align-items:center;gap:9px;padding:12px 22px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge);margin-bottom:14px">${iconSVG('volume', 18)} Replay</button>
          <input data-inp="onType" data-key="advKey" data-fkey="typed" value="${escA4(state.typed || '')}" placeholder="spell it" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" style="width:100%;text-align:center;padding:15px;border-radius:14px;background:var(--surface);border:2px solid var(--line);color:var(--text);font-family:var(--entry);font-weight:700;font-size:clamp(19px,5vw,25px);letter-spacing:.12em;text-transform:lowercase;outline:none;margin-bottom:12px">
          <button data-act="advDictSubmit" style="width:100%;padding:13px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Next →</button>
        </div>`, 'advExit'); },
  };
  window.ADV = ADV;
})();
