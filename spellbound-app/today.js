/* today.js — TODAY'S TEN (road to 4.5, P1.16; rubric F1 "a short daily session").

   One short session a day, reachable from Home's "today" ribbon (app3 homeToday) and #/today: TEN words, about five
   minutes, the words DUE for revision first — the same "due" My Feed and Home's mistakes deck use (app3 homeDueWords:
   a word missed on an earlier day, or a mastery record that slipped and whose gap is over) — then words at the child's
   level. It ENDS: a finish card lists the words spelled right and the words to practise, and the day's ribbon says so.

   The rules it keeps, and why:
     · every word comes through the ONE word door, nextWords (purpose 'review' for the due words, 'drill' at the child's
       level for the rest) — kid-safe for this child, inside the 150-word window (tests/word-door.cjs);
     · a spelling is typed, one try a word; a right answer is EVIDENCE (logBand, markMastered, clearMiss, gainXp) and pays
       the standard `answer` coin, a miss is evidence the other way (addMiss) and HOLDS with the shared miss panel —
       the letters, and a tip matched to the mistake (P1.19) — until Next. Nothing is paid for finishing;
     · nothing on screen spells the word before the try: the meaning is masked (maskTxt), the sentence is only spoken,
       and the header search is off while a word is open (app3 drillLive);
     · the day's session is the child's own record, c.today {d, ws, i, res, coins, done, st, typed}, kept through the
       Store seam with the rest of the child: leave half way and Home says "Carry on", and it resumes at that word;
     · keyboard: Enter checks and moves on, 1 hears the word, 2 slowly, 3 in a sentence; touch: every one of those is a
       button. Lazy (boot-lazy group `today`) — none of this is on Home's first screen.
   Guard: tests/today-session.cjs. */
(function () {
  'use strict';
  const W = window, N = 10;
  const ic = (n, s) => { try { return iconSVG(n, s || 18); } catch (e) { return ''; } };
  const E = (s) => (typeof esc === 'function' ? esc(s) : String(s == null ? '' : s));
  const K = (w) => String((w && w.w) || w || '').toLowerCase().trim();
  const kid = () => { try { return active(); } catch (e) { return null; } };
  const persist = () => { try { save(); } catch (e) {} };
  const day = () => { try { return todayKey(); } catch (e) { return ''; } };

  /* ------------------------------------------------------------------ the day's record */
  function rec(c) { c = c || kid(); const T = c && c.today; return T && typeof T === 'object' && T.d === day() && Array.isArray(T.ws) ? T : null; }
  const slim = (w, due) => ({ w: w.w, d: w.d || '', s: w.s || '', p: w.p || '', y: w.y || 3, h: w.h || '', due: due ? 1 : 0 });
  const plain = (w) => /^[a-z]{3,}$/.test(String(w && w.w || ''));
  function build(c) {
    const due = new Set((typeof homeDueWords === 'function' ? homeDueWords(c) : []).map(K));
    /* the due words first, through the door (its review pile, held to Home's and My Feed's "due") */
    const rev = due.size ? nextWords(c, N, { purpose: 'review', filter: (w) => due.has(K(w)) && plain(w) }) : [];
    const have = new Set(rev.map(K)), fresh = [];
    const add = (list) => list.forEach((w) => { if (fresh.length + rev.length < N && !have.has(K(w))) { have.add(K(w)); fresh.push(w); } });
    /* then words at the child's level: their band, a step either side ('medium' is the band ±1) */
    add(nextWords(c, N - rev.length, { purpose: 'drill', level: 'medium', needDef: true, lemmaOnly: true, filter: (w) => plain(w) && !have.has(K(w)) }));
    if (rev.length + fresh.length < N) add(nextWords(c, N - rev.length - fresh.length, { purpose: 'drill', level: 'auto', needDef: true, filter: (w) => plain(w) && !have.has(K(w)) }));
    c.today = { d: day(), ws: rev.map((w) => slim(w, 1)).concat(fresh.map((w) => slim(w, 0))).slice(0, N), i: 0, res: [], coins: 0, done: 0, st: 'ask', typed: '' };
    persist(); return c.today; }
  const cur = (T) => T && !T.done ? T.ws[T.i] || null : null;
  function live() { const T = rec(); return !!(T && !T.done && T.st === 'ask' && state.nav === 'today' && state.screen === 'app'); }

  /* ------------------------------------------------------------------ the voice */
  function hear(how) { const w = cur(rec()); if (!w) return;
    try { if (how === 'slow') say(w.w, 0.6); else if (how === 'sent' && w.s) saySentence(w.s, w.w); else say(w.w); } catch (e) {} }
  function focusIn() { setTimeout(() => { try { const el = document.querySelector('[data-fkey="tdTyped"]'); if (el && !el.disabled) el.focus(); } catch (e) {} }, 60); }
  function arrive() { setTimeout(() => { if (state.nav === 'today' && live()) hear(); }, 320); focusIn(); }

  /* ------------------------------------------------------------------ one try a word */
  function check() { const c = kid(), T = rec(c), w = cur(T); if (!w || T.st !== 'ask') return;
    const typed = String(T.typed || '').trim().toLowerCase();
    if (!typed) { try { flash('Type the word first'); } catch (e) {} focusIn(); return; }
    const ok = typed === K(w);
    try { logBand(w, ok); } catch (e) {}
    if (ok) {
      try { markMastered(K(w)); } catch (e) {} try { clearMiss(w.w); } catch (e) {} try { gainXp(); } catch (e) {}
      let n = 0; try { n = addCoins('answer'); } catch (e) {} T.coins = (T.coins || 0) + (n || 0);
      try { sfx('correct'); } catch (e) {}
    } else { try { addMiss(w); } catch (e) {} try { sfx('wrong'); } catch (e) {} }
    T.res.push({ w: w.w, ok: ok ? 1 : 0, t: typed, due: w.due ? 1 : 0 }); T.st = ok ? 'right' : 'miss'; T.last = typed;
    persist(); render();
    /* a right answer may move on by itself; a miss never does (FIX-BEE D3) */
    if (ok) { const at = T.i; setTimeout(() => { const T2 = rec(); if (T2 && T2.i === at && T2.st === 'right' && state.nav === 'today') next(); }, 1000); }
    else setTimeout(() => { try { const b = document.querySelector('.td-next'); if (b) b.focus(); } catch (e) {} }, 60); }
  function next() { const T = rec(); if (!T || T.done || T.st === 'ask') return;
    T.i++; T.st = 'ask'; T.typed = ''; T.last = '';
    if (T.i >= T.ws.length) { finish(T); return; }
    persist(); render(); arrive(); }
  function finish(T) { T.done = 1; T.st = 'done';
    const right = T.res.filter((x) => x.ok).length;
    try { logActivity('today', "Today's ten", { done: T.res.length, right, coins: T.coins || 0 }, T.res.filter((x) => !x.ok).map((x) => x.w)); } catch (e) {}
    persist(); render();
    try { if (right >= 8) { sfx('win'); burstConfetti(80); } else sfx('level'); } catch (e) {}
    setTimeout(() => { try { const b = document.querySelector('.td-fin [data-act="goHome"]'); if (b) b.focus(); } catch (e) {} }, 60); }

  /* ------------------------------------------------------------------ the screen */
  function pips(T) { return `<div class="td-pips" role="progressbar" aria-label="Today's ten" aria-valuemin="0" aria-valuemax="${T.ws.length}" aria-valuenow="${T.res.length}">${T.ws.map((w, i) => {
      const r = T.res[i]; return `<i class="${r ? (r.ok ? 'ok' : 'no') : i === T.i && !T.done ? 'now' : ''}"></i>`; }).join('')}</div>`; }
  function wordView(T) { const w = cur(T); if (!w) return '';
    const n = T.i + 1, of = T.ws.length, st = T.st;
    const mean = w.d ? maskTxt(w.d, w.w) : '';
    const tools = `<div class="td-tools">
        <button class="td-tool" data-act="tdHear" aria-label="Hear the word">${ic('volume', 18)} <span>Hear it</span> <kbd>1</kbd></button>
        <button class="td-tool" data-act="tdSlow" aria-label="Hear it slowly">${typeof tortoiseSVG === 'function' ? tortoiseSVG(18) : ''} <span>Slowly</span> <kbd>2</kbd></button>
        ${w.s ? `<button class="td-tool" data-act="tdSent" aria-label="Hear it in a sentence">${ic('quote', 17)} <span>In a sentence</span> <kbd>3</kbd></button>` : ''}</div>`;
    const ask = st === 'ask' ? `<div class="td-ask">
        <input class="td-in" data-inp="tdType" data-fkey="tdTyped" value="${typeof escA === 'function' ? escA(T.typed || '') : ''}" placeholder="spell it" aria-label="Spell the word you hear" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false">
        <button class="td-check" data-act="tdCheck">Check <kbd>Enter</kbd></button></div>` : '';
    const right = st === 'right' ? `<div class="td-yes" role="status">${ic('check', 18)} <b>${E(w.w)}</b> — right!</div>` : '';
    const miss = st === 'miss' ? (typeof missFeedbackHTML === 'function' ? missFeedbackHTML(w, T.last || '', { head: typeof nearHead === 'function' ? nearHead(T.last, w.w) : null, foot: 'Saved for revision — it comes back on a later day.' }) : '')
      + `<button class="td-next" data-act="tdNext">${n < of ? 'Next word' : 'See how it went'} <kbd>Enter</kbd></button>` : '';
    return `<div class="sb-card td-card" data-live-prompt="${typeof escA === 'function' ? escA('Word ' + n + ' of ' + of + '. Listen, then spell it.') : ''}">
      <div class="td-meta"><span>Word ${n} of ${of}</span>${w.due ? `<span class="td-due">${ic('retry', 13)} Back for revision</span>` : ''}</div>
      ${tools}
      ${mean ? `<p class="td-mean"><b>Meaning:</b> ${E(mean)}</p>` : ''}
      ${ask}${right}${miss}</div>`; }
  function finView(T) { const ok = T.res.filter((x) => x.ok), no = T.res.filter((x) => !x.ok);
    const chip = (x) => `<button class="td-chip ${x.ok ? 'ok' : 'no'}" data-act="say" data-arg="${typeof escA === 'function' ? escA(x.w) : ''}" aria-label="${typeof escA === 'function' ? escA('Hear ' + x.w) : ''}">${x.ok ? ic('check', 13) : ic('retry', 13)} ${E(x.w)}</button>`;
    return `<div class="sb-card td-fin" role="region" aria-label="Today's ten — the finish card">
      <h3 class="td-fh">${ok.length} of ${T.res.length} spelled right</h3>
      <p class="td-fs">${T.coins ? `<span class="td-coin">${ic('coin', 15)} +${T.coins} coin${T.coins === 1 ? '' : 's'}</span> for right answers. ` : ''}That is today's ten done — the next ten are ready tomorrow.</p>
      <h4 class="td-fl">${ic('check', 15)} Spelled right</h4>
      <div class="td-chips">${ok.length ? ok.map(chip).join('') : '<span class="td-none">None this time — tomorrow they come back.</span>'}</div>
      <h4 class="td-fl">${ic('retry', 15)} To practise</h4>
      <div class="td-chips">${no.length ? no.map(chip).join('') : '<span class="td-none">Nothing — every word right first try.</span>'}</div>
      ${no.length ? '<p class="td-fs">They are on your revision list, and they come back first on a later day.</p>' : ''}
      <div class="td-fbtns"><button class="bz-btn" data-act="goHome">Home</button>${no.length ? '<button class="bz-btn out" data-act="openRevisions">Revise these</button>' : ''}</div></div>`; }
  function view() { const c = kid(); if (!c) return ''; css();
    const T = rec(c) || build(c);
    if (!T.ws.length) return `<div class="td-page">${pageHead("Today's ten", '', '', null, 'goHome', 'Home', null, ic('sun', 20))}<div class="sb-card td-card"><p>Today's words are still arriving — try again in a moment.</p><button class="bz-btn out" data-act="goHome">Home</button></div></div>`;
    const sub = T.done ? 'Done for today.' : 'Ten words, about five minutes. Words due for revision come first.';
    return `<div class="td-page">${pageHead("Today's ten", '', sub, null, 'goHome', 'Home', null, ic('sun', 20))}${pips(T)}${T.done ? finView(T) : wordView(T)}</div>`; }
  function open() { const c = kid(); if (!c) return; if (!rec(c)) build(c); state.nav = 'today'; state.screen = 'app'; state.game = null; render(); if (live()) arrive(); }

  /* keys: Enter checks or moves on, 1–3 the voice (no spelling holds a digit) */
  function onKey(e) { try {
    if (state.nav !== 'today' || state.screen !== 'app' || state.settingsOpen || state.drawerOpen || state.pinDlg) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return; const T = rec(); if (!T || T.done) return;
    if (e.key === 'Enter') { const t = e.target; if (t && t.tagName === 'BUTTON' && !t.classList.contains('td-next')) return;   // a focused button's own Enter
      e.preventDefault(); if (T.st === 'ask') check(); else next(); return; }
    if (/^[1-3]$/.test(e.key)) { e.preventDefault(); hear(e.key === '1' ? '' : e.key === '2' ? 'slow' : 'sent'); } } catch (err) {} }
  if (!W._tdKeys) { W._tdKeys = 1; W.addEventListener('keydown', onKey); }

  function css() { if (document.getElementById('td-css')) return; const st = document.createElement('style'); st.id = 'td-css'; st.textContent = `
.td-page{max-width:640px;margin:0 auto}
.td-pips{display:flex;gap:6px;margin:4px 0 12px}.td-pips i{flex:1;height:8px;border-radius:99px;background:var(--surface2);border:1px solid var(--line)}
.td-pips i.ok{background:var(--good);border-color:var(--good)}.td-pips i.no{background:var(--bad);border-color:var(--bad)}.td-pips i.now{background:var(--accent);border-color:var(--accent)}
.td-card,.td-fin{padding:16px 18px}
.td-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;font-weight:800;font-size:13px;color:var(--muted);margin-bottom:10px}
.td-due{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:999px;background:var(--chip);color:var(--ink,var(--text))}
.td-tools{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:12px}
.td-tool{display:inline-flex;align-items:center;gap:7px;min-height:44px;padding:0 14px;border-radius:12px;border:1px solid var(--line);background:var(--paper,var(--bg2));color:var(--ink,var(--text));font-weight:800;font-size:14px}
.td-tool kbd,.td-check kbd,.td-next kbd{font:700 11px/1 var(--mono,monospace);padding:3px 5px;border-radius:5px;border:1px solid currentColor;opacity:.75}
.td-mean{margin:0 0 12px;font-size:14.5px;line-height:1.5;color:var(--ink,var(--text));text-align:center}
.td-ask{display:flex;gap:8px;align-items:stretch}
.td-in{flex:1;min-width:0;min-height:52px;text-align:center;padding:10px 12px;border-radius:14px;background:var(--surface);border:2px solid var(--line);color:var(--text);font-family:var(--entry);font-weight:700;font-size:clamp(20px,5vw,26px);letter-spacing:.12em;text-transform:lowercase;outline:none}
.td-in:focus{border-color:var(--accent)}
.td-check,.td-next{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:52px;padding:0 18px;border-radius:14px;border:2px solid var(--accent);background:var(--paper,var(--bg2));color:var(--ink,var(--text));font-weight:800;font-size:15px}
.td-next{width:100%;margin-top:4px}
.td-yes{display:flex;align-items:center;justify-content:center;gap:8px;min-height:52px;border-radius:14px;background:color-mix(in srgb,var(--good) 14%,transparent);color:var(--ink,var(--text));font-size:16px}
.td-fh{font-family:var(--display);font-size:24px;margin:0 0 4px}
.td-fs{margin:0 0 10px;color:var(--muted);font-size:14px;line-height:1.5}.td-coin{display:inline-flex;align-items:center;gap:4px;font-weight:800;color:var(--ink,var(--text))}.td-coin svg{display:inline-block}
.td-fl{display:flex;align-items:center;gap:6px;margin:12px 0 6px;font-size:14px}
.td-chips{display:flex;flex-wrap:wrap;gap:6px}.td-none{color:var(--muted);font-size:13.5px}
.td-chip{display:inline-flex;align-items:center;gap:5px;min-height:44px;padding:0 12px;border-radius:999px;border:1px solid var(--line);background:var(--paper,var(--bg2));color:var(--ink,var(--text));font:800 14px/1 var(--mono,monospace)}
.td-chip.ok{border-color:color-mix(in srgb,var(--good) 55%,var(--line))}.td-chip.no{border-color:color-mix(in srgb,var(--bad) 55%,var(--line))}
.td-fbtns{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}.td-fbtns .bz-btn{min-height:48px}
@media (max-width:480px){.td-tool kbd{display:none}.td-tool{padding:0 11px;font-size:13px;gap:5px}.td-ask{flex-direction:column}.td-check{width:100%}}`;
    document.head.appendChild(st); }

  try { Object.assign(app, { tdType: (v) => { const T = rec(); if (T) T.typed = String(v || ''); }, tdCheck: check, tdNext: next,
    tdHear: () => hear(''), tdSlow: () => hear('slow'), tdSent: () => hear('sent') }); } catch (e) {}
  W.SB_TODAY = { open, view, live, rec, build, check, next, N };
})();
