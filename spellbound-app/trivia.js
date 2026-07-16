/* ===== Bee Trivia — 5,000 questions · 20 themes · 5 levels =====
   Three formats: Classic 10-question quiz, Trivia Squares (claim the 3×3 board,
   score the lines — the Magic Squares format), and Beat the Clock (60 seconds).
   Visual questions use emoji/SVG cues; aural questions play a Kokoro clip when
   present and fall back to the device voice. Data: trivia-data.js (SB_TRIVIA). */
(function(){
  const T = () => (window.SB_TRIVIA || { themes: [], questions: [] });
  const LV = [
    { n: 1, label: 'Rookie',   sub: 'age 6–7',  e: '🐣' },
    { n: 2, label: 'Explorer', sub: 'age 8–9',  e: '🧭' },
    { n: 3, label: 'Brainiac', sub: 'age 9–10', e: '🧠' },
    { n: 4, label: 'Whiz',     sub: 'age 11',   e: '⚡' },
    { n: 5, label: 'Champion', sub: 'age 12+',  e: '🏆' },
  ];
  const THC = { animals:'#4F9E6A', bugs:'#E0922E', ocean:'#3D7DF0', space:'#7B52E0', body:'#E8458C', plants:'#3C8455', food:'#F0703C', sports:'#2A63D6', music:'#B14FC4', myth:'#9B59D0', world:'#13A892', history:'#C8901B', science:'#0E8A78', numbers:'#6A47F5', weather:'#36A3D9', machines:'#4A6B8A', art:'#DC5B7E', fest:'#D6453A', story:'#7C5CFF', words:'#C8791B' };
  const esc3 = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const escA3 = (s) => esc3(s).replace(/"/g, '&quot;');
  const themeOf = (id) => T().themes.find(t => t.id === id) || { id, label: id, e: '🐝' };

  /* ---- kid-appropriate default level from age/band ---- */
  function autoLv() { try { const c = active(); const age = c.age || 9;
    return age <= 7 ? 1 : age <= 8 ? 2 : age <= 10 ? 3 : age <= 11 ? 4 : 5; } catch (e) { return 3; } }
  function tStats(c) { return c.trivia || (c.trivia = { right: 0, done: 0, rounds: 0, squares: 0, lines: 0, clockBest: 0, perfect: 0, themes: {} }); }

  /* ---- question picking with a no-repeat memory per child ---- */
  function qKey(q) { return (q.th + '|' + q.q).slice(0, 90); }
  function seenSet(c) { return new Set(c.trivSeen || []); }
  function markSeen(qs) { try { const c = active(); c.trivSeen = (c.trivSeen || []).concat(qs.map(qKey)); if (c.trivSeen.length > 900) c.trivSeen = c.trivSeen.slice(-700); } catch (e) {} }
  function poolFor(th, lv) { const all = T().questions;
    let p = all.filter(q => (th === 'mix' || q.th === th) && q.lv === lv);
    if (p.length < 24) p = all.filter(q => (th === 'mix' || q.th === th) && Math.abs(q.lv - lv) <= 1);
    if (p.length < 12) p = all.filter(q => th === 'mix' || q.th === th);
    return p; }
  function drawQs(th, lv, n) { const pool = poolFor(th, lv); const c = active(); const seen = seenSet(c);
    const fresh = pool.filter(q => !seen.has(qKey(q)));
    const base = (fresh.length >= n ? fresh : pool);
    const out = sample(base, Math.min(n, base.length));
    return out.map(q => ({ ...q, sh: sample(q.c.map((x, i) => i)) }));   // sh = shuffled choice order
  }

  /* ---- speech / clips for aural questions ---- */
  let _aud = null;
  function speakQ(q) { if (!q) return;
    if (q.clip) { try { if (_aud) { _aud.pause(); } _aud = new Audio('voice/' + q.clip); _aud.play().catch(() => { try { say(q.say || q.q); } catch (e) {} }); return; } catch (e) {} }
    if (q.say) { try { say(q.say); } catch (e) {} } }
  function stopAud() { try { if (_aud) { _aud.pause(); _aud = null; } } catch (e) {} }

  /* ---- scoring shared by all formats ---- */
  function grade(g, q, pickIdx) { const ok = q.sh[pickIdx] === 0;   // data keeps correct at c[0]
    const c = active(); const st = tStats(c); st.done++; if (ok) { st.right++; st.themes[q.th] = (st.themes[q.th] || 0) + 1; addCoins(1); sfx('correct'); try { burstConfetti(26); } catch (e) {} } else sfx('wrong');
    g.mood = ok ? 'party' : 'oops';
    g.right += ok ? 1 : 0; g.streak = ok ? (g.streak || 0) + 1 : 0;
    if (ok && g.streak > 0 && g.streak % 5 === 0) { addCoins(3); try { flash('🔥 ' + g.streak + ' in a row! +3 🪙'); } catch (e) {} }
    return ok; }

  const STV = {
    open() { stopAud(); state.trv = { view: 'hub', th: state.trv && state.trv.th || 'mix', lv: state.trv && state.trv.lv || autoLv() }; set({ nav: 'trivia', screen: 'app', conceptSel: null }); },
    setTh(id) { state.trv.th = id; render(); },
    setLv(n) { state.trv.lv = +n; render(); },

    /* ---------- format starts ---------- */
    startQuiz() { const v = state.trv; const qs = drawQs(v.th, v.lv, 10);
      if (qs.length < 5) { flash('Not enough questions here yet — try Mix'); return; }
      markSeen(qs); state.trv = { ...v, view: 'quiz', qs, i: 0, right: 0, picked: null, streak: 0, done: false };
      render(); setTimeout(() => speakQ(qs[0]), 350); },
    startSquare() { const v = state.trv; const ths = v.th === 'mix' ? sample(T().themes.map(t => t.id), 9) : Array(9).fill(v.th);
      const cells = ths.map(th => { const q = drawQs(th, v.lv, 1)[0]; return q ? { th, q, st: 0 } : null; }).filter(Boolean);
      if (cells.length < 9) { flash('Not enough questions — try Mix'); return; }
      markSeen(cells.map(x => x.q));
      state.trv = { ...v, view: 'square', cells, sel: null, picked: null, miss: 0, lines: 0, done: false, right: 0, streak: 0 };
      render(); },
    startClock() { const v = state.trv; const qs = drawQs(v.th, v.lv, 60);
      if (qs.length < 10) { flash('Not enough questions here yet — try Mix'); return; }
      markSeen(qs.slice(0, 25));
      state.trv = { ...v, view: 'clock', qs, i: 0, right: 0, wrong: 0, picked: null, streak: 0, timeLeft: 60, done: false };
      const g = state.trv;
      g.timer = setInterval(() => { const t = state.trv; if (!t || t.view !== 'clock' || t.done) { clearInterval(g.timer); return; }
        t.timeLeft--; const el = document.getElementById('trv-time'); if (el) el.textContent = t.timeLeft + 's';
        if (t.timeLeft <= 0) STV.clockEnd(); }, 1000);
      render(); setTimeout(() => speakQ(qs[0]), 300); },

    /* ---------- answers ---------- */
    pick(idx) { const g = state.trv; if (!g || g.picked != null) return; idx = +idx;
      if (g.view === 'quiz') { const q = g.qs[g.i]; g.picked = idx; const ok = grade(g, q, idx); stopAud(); render();
        // fun-fact dwell: longer after a miss so the right answer sinks in
        setTimeout(() => { const t = state.trv; if (!t || t.view !== 'quiz') return;
          if (t.i + 1 < t.qs.length) { t.i++; t.picked = null; render(); speakQ(t.qs[t.i]); } else STV.quizEnd(); }, ok ? 2100 : 3000); return; }
      if (g.view === 'clock') { const q = g.qs[g.i]; g.picked = idx; const ok = grade(g, q, idx); if (!ok) g.wrong++; stopAud(); render();
        setTimeout(() => { const t = state.trv; if (!t || t.view !== 'clock' || t.done) return;
          t.i = (t.i + 1) % t.qs.length; t.picked = null; render(); speakQ(t.qs[t.i]); }, ok ? 550 : 1500); return; }
      if (g.view === 'square' && g.sel != null) { const cell = g.cells[g.sel]; const q = cell.q; g.picked = idx; const ok = grade(g, q, idx); stopAud();
        cell.st = ok ? 1 : 2; if (!ok) g.miss++;
        render();
        setTimeout(() => { const t = state.trv; if (!t || t.view !== 'square') return; t.sel = null; t.picked = null;
          const L = STV._lines(t.cells); if (L > t.lines) { const gained = L - t.lines; t.lines = L; addCoins(gained * 5); sfx('win'); burstConfetti(70); flash('📐 Line complete! +' + (gained * 5) + ' 🪙'); }
          if (t.cells.every(x => x.st > 0)) STV.squareEnd(); else render(); }, ok ? 1900 : 2800); return; } },

    _lines(cells) { const W = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
      return W.filter(w => w.every(i => cells[i].st === 1)).length; },

    cell(i) { const g = state.trv; if (!g || g.view !== 'square' || g.picked != null) return; i = +i;
      if (g.cells[i].st > 0) return; g.sel = i; render(); setTimeout(() => speakQ(g.cells[i].q), 300); },

    hear() { const g = state.trv; if (!g) return;
      const q = g.view === 'square' ? (g.sel != null && g.cells[g.sel].q) : g.qs && g.qs[g.i]; if (q) speakQ(q); },

    quizEnd() { const g = state.trv; g.done = true; const bonus = 2 + g.right + (g.right >= 8 ? 3 : 0); addCoins(bonus); g.bonus = bonus;
      const st = tStats(active()); st.rounds++; if (g.right === g.qs.length) st.perfect = (st.perfect || 0) + 1;
      try { logActivity('trivia', 'Bee Trivia', { done: g.qs.length, right: g.right, coins: bonus }, []); } catch (e) {}
      if (g.right >= 8) { sfx('win'); burstConfetti(110); } else sfx('level'); save(); render(); },
    squareEnd() { const g = state.trv; g.done = true; const claimed = g.cells.filter(x => x.st === 1).length;
      const bonus = 2 + claimed + g.lines * 2; addCoins(bonus); g.bonus = bonus;
      const st = tStats(active()); st.squares++; st.lines += g.lines;
      try { logActivity('trivia', 'Trivia Squares', { done: 9, right: claimed, coins: bonus }, []); } catch (e) {}
      if (g.lines >= 3) { sfx('win'); burstConfetti(140); } else sfx('level'); save(); render(); },
    clockEnd() { const g = state.trv; if (g.done) return; g.done = true; clearInterval(g.timer);
      const bonus = 2 + Math.floor(g.right / 2); addCoins(bonus); g.bonus = bonus;
      const st = tStats(active()); const nb = g.right > (st.clockBest || 0); if (nb) st.clockBest = g.right;
      try { logActivity('trivia', 'Trivia — Beat the Clock', { done: g.right + g.wrong, right: g.right, coins: bonus }, []); } catch (e) {}
      sfx(nb ? 'win' : 'level'); if (nb) burstConfetti(110); save(); render(); },
    exit() { const g = state.trv; if (g && g.timer) clearInterval(g.timer); stopAud(); STV.open(); },

    /* ================= views ================= */
    view() { const g = state.trv; if (!g) { STV.open(); return ''; }
      if (g.view === 'quiz')   return g.done ? STV._done('Round complete!', g.right + '/' + g.qs.length, 'questions right') : STV._q(g.qs[g.i], 'Question ' + (g.i + 1) + ' of ' + g.qs.length);
      if (g.view === 'clock')  return g.done ? STV._done(g.right >= (tStats(active()).clockBest || 0) ? 'New best! ⏱' : 'Time!', String(g.right), 'answers in 60 seconds') : STV._q(g.qs[g.i], '<span id="trv-time">' + g.timeLeft + 's</span> · ✓ ' + g.right);
      if (g.view === 'square') return g.done ? STV._done(g.lines >= 3 ? 'Board master! 📐' : 'Board complete!', g.cells.filter(x => x.st === 1).length + '/9', g.lines + ' line' + (g.lines === 1 ? '' : 's') + ' scored') : STV._square();
      return STV._hub(); },

    _shell(inner, head) { return `<div style="max-width:720px;margin:0 auto">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
        <button data-act="trvExit" style="color:var(--muted);font-weight:700;font-size:13px">← Bee Trivia</button>
        <span style="margin-left:auto;font-family:var(--mono);font-size:13px;color:var(--muted)">${head || ''}</span></div>${inner}</div>`; },

    _visual(q) { if (q.svg) return `<div style="display:flex;justify-content:center;margin:6px 0 10px">${q.svg}</div>`;
      if (q.v) return `<div style="text-align:center;font-size:clamp(58px,14vw,84px);line-height:1.15;margin:2px 0 8px;${q.sil ? 'filter:brightness(0) opacity(.82);' : ''}">${q.v}</div>`; return ''; },

    _buddy(g) { try { const c = active();
      const av = (c.avatar && window.SB_AVATARS && SB_AVATARS.byId[c.avatar]) ? SB_AVATAR(c.avatar, 78) : mascotAcc(g.mood === 'party' ? 'love' : g.mood === 'oops' ? 'oops' : 'happy');
      const anim = g.picked == null ? 'sb-bee-bob 3.2s ease-in-out infinite' : (g.mood === 'party' ? 'sb-bee-talk .9s ease-in-out 2' : 'sb-m-shake 1.2s ease 1');
      const bubble = g.picked == null ? '' : (g.mood === 'party' ? sample(['Yes!! 🎉','Brilliant! ⭐','Bzzz-tastic!','You got it! 💛','Genius! 🧠'], 1)[0] : sample(['Ooh, so close!','Now we know! 💡','Tricky one!','On to the next!'], 1)[0]);
      return `<div style="position:relative;width:86px;flex-shrink:0;align-self:flex-end;text-align:center">
        ${bubble ? `<div style="position:absolute;top:-34px;left:50%;transform:translateX(-50%);white-space:nowrap;background:var(--paper,#fff);border:1.5px solid ${g.mood === 'party' ? 'var(--treasure,#F0B429)' : 'var(--line)'};border-radius:12px;padding:5px 11px;font-weight:800;font-size:12px;box-shadow:var(--sh-rest);animation:sb-pop .3s ease both">${bubble}</div>` : ''}
        <div style="width:80px;height:84px;margin:0 auto;animation:${anim}">${av}</div>
        ${(g.streak || 0) >= 2 ? `<div style="font-weight:900;font-size:12.5px;color:#FF7A1A;animation:sb-pop .3s ease both">🔥 ×${g.streak}</div>` : ''}
      </div>`; } catch (e) { return ''; } },
    _q(q, head) { const g = state.trv; const th = themeOf(q.th); const col = THC[q.th] || 'var(--accent)';
      const isAud = q.ty === 'aud';
      const choices = q.sh.map((ci, idx) => { let bg = 'var(--surface2)', bd = 'var(--line)';
        if (g.picked != null) { if (ci === 0) { bg = 'color-mix(in srgb,#1f9d57 20%,var(--bg2))'; bd = '#1f9d57'; } else if (idx === g.picked) { bg = 'color-mix(in srgb,var(--bad) 18%,var(--bg2))'; bd = 'var(--bad)'; } }
        return `<button data-act="trvPick" data-arg="${idx}" ${g.picked != null ? 'disabled' : ''} style="text-align:left;padding:14px 16px;border-radius:14px;background:${bg};border:2px solid ${bd};color:var(--text);font-family:var(--display);font-weight:800;font-size:15px;line-height:1.35">${esc3(q.c[ci])}</button>`; }).join('');
      const wrong = g.picked != null && q.sh[g.picked] !== 0;
      const fact = g.picked != null && q.f ? `<div style="background:var(--treasure-tint,#FFF3D6);border:1px solid var(--treasure,#F0B429);border-radius:12px;padding:11px 14px;margin-top:12px;font-size:13.5px;line-height:1.5;animation:sb-pop .3s ease both"><b style="color:var(--treasure-deep,#8A5B00)">💡 Did you know?</b> ${esc3(q.f)}</div>` : '';
      const wrongNote = wrong ? `<div style="background:var(--fix-tint,#FBE9E7);border:1.5px solid var(--fix,#C4453C);border-radius:12px;padding:10px 14px;margin-top:12px;font-weight:800;font-size:14px;animation:sb-pop .3s ease both">✗ The answer: <span style="color:var(--fix,#C4453C)">${esc3(q.c[0])}</span></div>` : '';
      return STV._shell(`
        <div style="display:flex;gap:12px;align-items:flex-end;margin-bottom:13px">
        ${STV._buddy(g)}
        <div style="flex:1;min-width:0;background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:clamp(18px,4.5vw,28px);box-shadow:var(--glow);text-align:center">
          <div style="display:inline-flex;align-items:center;gap:7px;padding:4px 13px;border-radius:999px;background:color-mix(in srgb,${col} 14%,transparent);color:${col};font-weight:800;font-size:12px;margin-bottom:10px">${th.e} ${esc3(th.label)} · L${q.lv}</div>
          ${STV._visual(q)}
          ${isAud ? `<div style="margin:4px 0 10px"><button data-act="trvHear" style="display:inline-flex;align-items:center;gap:9px;padding:13px 24px;border-radius:999px;background:${col};color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">${iconSVG('volume', 19)} Listen 🔊</button></div>` : ''}
          <div style="font-size:clamp(16px,3.6vw,20px);line-height:1.5;font-weight:700">${esc3(q.q)}</div>
          ${wrongNote}${fact}
        </div></div>
        <div style="display:grid;grid-template-columns:${q.ty === 'tf' ? '1fr 1fr' : 'repeat(auto-fit,minmax(200px,1fr))'};gap:10px">${choices}</div>`, head); },

    _square() { const g = state.trv;
      if (g.sel != null) return STV._q(g.cells[g.sel].q, 'Cell ' + (g.sel + 1) + ' · ' + g.lines + ' lines');
      const cells = g.cells.map((c2, i) => { const th = themeOf(c2.th); const col = THC[c2.th] || '#7C5CFF';
        const face = c2.st === 1 ? '<span style="display:inline-block;animation:sb-bee-pop .5s ease both">⭐</span>' : c2.st === 2 ? '❌' : `<span style="display:inline-block;animation:sb-art-float 3.4s ease-in-out infinite;animation-delay:${(i % 5) * 0.35}s">${th.e}</span>`;
        return `<button data-act="trvCell" data-arg="${i}" ${c2.st > 0 ? 'disabled' : ''} style="aspect-ratio:1;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;font-size:clamp(28px,8vw,40px);background:${c2.st === 1 ? 'color-mix(in srgb,#1f9d57 22%,var(--bg2))' : c2.st === 2 ? 'color-mix(in srgb,var(--bad) 14%,var(--bg2))' : 'var(--bg2)'};border:2px solid ${c2.st === 1 ? '#1f9d57' : c2.st === 2 ? 'var(--bad)' : 'var(--line)'};box-shadow:var(--sh-rest)">${face}
          <span style="font-size:10.5px;font-weight:800;color:${c2.st > 0 ? 'var(--muted)' : col}">${esc3(th.label.split(' ')[0])}</span></button>`; }).join('');
      return STV._shell(`
        <div style="text-align:center;margin-bottom:12px"><div style="font-family:var(--display);font-weight:800;font-size:20px">Trivia Squares</div>
        <div style="font-size:12.5px;color:var(--muted);font-weight:650">Answer to claim a cell ⭐ — finish rows, columns or diagonals for +5 🪙 a line.</div></div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:440px;margin:0 auto">${cells}</div>
        <div style="text-align:center;margin-top:12px;font-family:var(--mono);font-size:13px;color:var(--muted)">⭐ ${g.cells.filter(x => x.st === 1).length} · ❌ ${g.miss} · lines ${g.lines}</div>`,
        'lines ' + g.lines); },

    _done(title, big, sub) { const g = state.trv; const c = active();
      const hero = (c.avatar && window.SB_AVATARS && SB_AVATARS.byId[c.avatar]) ? SB_AVATAR(c.avatar, 92) : mascotSVG('love');
      return STV._shell(`<div style="max-width:520px;margin:0 auto;text-align:center;background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:30px;box-shadow:var(--glow);animation:sb-pop .35s ease both">
        <div style="display:flex;justify-content:center;align-items:flex-end;gap:4px;margin-bottom:8px">
          <span style="font-size:26px;animation:sb-m-swing 1.1s ease-in-out infinite">🎊</span>
          <div style="width:92px;height:98px;animation:sb-bee-talk 1.4s ease-in-out infinite">${hero}</div>
          <span style="font-size:26px;animation:sb-m-swing 1.1s ease-in-out infinite reverse">🎊</span>
        </div>
        <h2 style="font-family:var(--display);font-weight:800;font-size:21px;margin:0 0 8px">${title}</h2>
        <div style="font-family:var(--display);font-weight:800;font-size:42px;color:var(--accent);line-height:1">${big}</div>
        <p style="color:var(--muted);font-weight:700;margin-top:6px">${sub}</p>
        <div style="display:inline-flex;align-items:center;gap:7px;margin-top:12px;padding:8px 15px;border-radius:999px;background:linear-gradient(135deg,#FFD24D,#F0A93C);color:#5a3d00;font-weight:900;font-size:15px">${(window.coinIc?coinIc(15):iconSVG('coin',15))} +${g.bonus || 0} coins</div>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:18px">
          <button data-act="trvExit" style="padding:13px 18px;border-radius:14px;background:var(--surface2);font-weight:800;font-size:14px;border:1px solid var(--line)">All trivia</button>
          <button data-act="${g.view === 'square' ? 'trvSquare' : g.view === 'clock' ? 'trvClock' : 'trvQuiz'}" style="padding:13px 20px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:14px;box-shadow:var(--edge)">Play again →</button>
        </div></div>`, ''); },

    _hub() { const g = state.trv; const c = active(); const st = tStats(c);
      const themes = [{ id: 'mix', label: 'Mega Mix', e: '🎲' }].concat(T().themes).map(t => { const on = g.th === t.id; const col = t.id === 'mix' ? '#7C5CFF' : (THC[t.id] || '#7C5CFF');
        return `<button data-act="trvTh" data-arg="${t.id}" style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:11px 6px;border-radius:14px;background:${on ? 'color-mix(in srgb,' + col + ' 16%,var(--bg2))' : 'var(--bg2)'};border:2px solid ${on ? col : 'var(--line)'};min-width:0"><span style="font-size:26px;display:inline-block;${on ? 'animation:sb-bee-talk 1.3s ease-in-out infinite' : ''}">${t.e}</span><span style="font-size:10.5px;font-weight:800;line-height:1.15;text-align:center;color:${on ? col : 'var(--muted)'}">${esc3(t.label)}</span></button>`; }).join('');
      const lvs = LV.map(l => { const on = g.lv === l.n;
        return `<button data-act="trvLv" data-arg="${l.n}" style="flex:1;min-width:86px;display:flex;flex-direction:column;align-items:center;gap:2px;padding:9px 6px;border-radius:12px;font-weight:800;${on ? 'background:var(--accent);color:#fff;box-shadow:var(--edge)' : 'background:var(--surface2);color:var(--muted);border:1px solid var(--line)'}"><span style="font-size:13px">${l.e} ${l.label}</span><span style="font-size:10px;font-weight:700;opacity:.85">${l.sub}</span></button>`; }).join('');
      const fmt = (act, e2, name, desc, col) => `<button data-act="${act}" style="text-align:left;background:var(--bg2);border:1px solid var(--line);border-radius:16px;padding:15px 16px;display:flex;align-items:center;gap:13px;box-shadow:var(--sh-rest)">
          <span style="width:46px;height:46px;border-radius:13px;background:${col};display:grid;place-items:center;font-size:24px;flex-shrink:0">${e2}</span>
          <span style="min-width:0;flex:1"><span style="display:block;font-family:var(--display);font-weight:800;font-size:15.5px">${name}</span>
          <span style="display:block;font-size:12px;color:var(--muted);font-weight:650;line-height:1.35">${desc}</span></span>
          <span style="color:var(--accent);font-weight:800;font-size:13px;white-space:nowrap">Play →</span></button>`;
      const nQ = T().questions.length;
      return `<div style="max-width:860px;margin:0 auto">
        ${pageHead('Bee Trivia', fmtN(nQ) + ' questions · 20 themes', 'Pick a theme and your level, then choose how to play. Every right answer earns a coin — and a fun fact.',
          st.right ? `<span style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:12.5px">🧠 ${fmtN(st.right)} right · best clock ${st.clockBest || 0}</span>` : '')}
        <div style="margin-bottom:14px"><div style="font-size:12px;font-weight:800;color:var(--muted);letter-spacing:.05em;text-transform:uppercase;margin-bottom:8px">Your level</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">${lvs}</div></div>
        <div style="margin-bottom:16px"><div style="font-size:12px;font-weight:800;color:var(--muted);letter-spacing:.05em;text-transform:uppercase;margin-bottom:8px">Theme</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px">${themes}</div></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:11px">
          ${fmt('trvQuiz', '🎯', 'Classic Quiz', '10 questions, fun fact after every answer.', 'linear-gradient(135deg,#7C5CFF,#6A47F5)')}
          ${fmt('trvSquare', '📐', 'Trivia Squares', 'Claim the 3×3 board — score the lines, magic-square style.', 'linear-gradient(135deg,#13A892,#0E8A78)')}
          ${fmt('trvClock', '⏱', 'Beat the Clock', '60 seconds, as many as you can. Streaks pay bonus coins.', 'linear-gradient(135deg,#F0703C,#D85A29)')}
        </div>
      </div>`; },
  };
  window.STV = STV;
})();
