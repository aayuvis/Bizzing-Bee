"use strict";
/* app3-homework.js — MY HOMEWORK, the speller's screen, and the homework record every screen reads (window.SB_HW).
   Owner, 15 Oct 2026: "this then goes in a homework to do the student in a separate top nav left of the search bar which
   takes the speller to my homework section which has a similar look and feel as the app (tabs are the homework concepts,
   homework atlas concepts, homework wordlist, history) but only tracks homework … completion in homework applies as
   completion in main app … also captured in progress report". The grown-up's side is app3-teach.js (the Teacher's Corner).

   A lazy app3 screen file (boot-lazy REG `scrHw`, group carries the boot word tier, app3-shared.js, the Atlas's code and
   the miss-tip rulebook), on the idle queue right after the other screen files. CLAUDE.md "the app3 split" rules hold:
   it names app3.js's names, app3-shared.js's and its own; app3.js reaches it only through viewApp's guarded chain
   (nav `homework`) and the SCR_ACTS stubs; every other file reads it only through window.SB_HW, guarded.

   THE RECORD (per child, created on the first assignment — no store step): c.hw = { items:[…], seq, run?, keep? }
     item  {id, kind:'words'|'stop'|'concept', ref, t, at, due|null, done|null, res, by:'grown-up', …}
           words    ref null; words:[{w,d,s,p,y,h}] (cut by the Teacher's Corner through nextWords); got:[words spelled
                    right in homework]; src {k, p, n}; res {right, of}
           stop     ref = the unit id (or a checkpoint's '<act>:<n>' with chk:1); crs 'honey'|'exp'; lap; act (region)
           concept  ref = the chapter's index in the course; t = its title (an index can move when chapters are
                    appended; the title finds it again); adv (an Advanced Pack chapter); grant (assigned AHEAD of the
                    child's Atlas: app3 isConceptUnlocked opens it for this child — hwGrant)
     run   the word list being spelled now: {id, ws, i, st, typed, last, res, coins} — kept through the household save,
           so a list left half way resumes at its word (like Today's ten's c.today)
     keep  grants kept after their homework was removed, for chapters the child had started (nothing is taken away)
   COMPLETION IS DERIVED FROM THE MAIN APP'S RECORDS, so doing it here IS doing it in the app, and the other way round:
     stop     walked on its lap — trail-home.js's own passedNode (Practice at the gate, or the quiz), or the lap moved on;
     concept  read to its last card (app3 conceptReadMark → c.cRead) or its words mastered (conceptStat's rule, from the
              child's own c.mast);
     words    every word spelled right at least once in homework, through the SAME scoring path as Today's ten:
              logBand + markMastered + clearMiss + gainXp + addCoins('answer') for a right answer, addMiss for a miss.
   The day it is first seen done is written on the item (`done`), so History and the report card can say when, and
   whether it was on time. Nothing pays for finishing homework; nothing counts days in a row.
   Guards: tests/homework.cjs (this screen), tests/teacher-corner.cjs (the Corner). Notes: TEACHER-HOMEWORK.md. */

const HW_TABS = ['concepts', 'atlas', 'words', 'history'];
const HW_TAB_OF = { concept: 'concepts', stop: 'atlas', words: 'words' };
const HW_DAYN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HW_MONN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ------------------------------------------------------------------ dates (local, YYYY-MM-DD) */
function hwYmd(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function hwToday() { try { return todayKey(); } catch (e) { return hwYmd(); } }
function hwPlusDays(n) { const d = new Date(); d.setDate(d.getDate() + n); return hwYmd(d); }
function hwDateTxt(ymd) { if (!ymd) return ''; const p = String(ymd).split('-').map(Number); const d = new Date(p[0], p[1] - 1, p[2]);
  return isNaN(d) ? String(ymd) : HW_DAYN[d.getDay()] + ' ' + d.getDate() + ' ' + HW_MONN[d.getMonth()]; }
function hwDueTxt(it) { if (!it.due) return 'No due date'; return it.due === hwToday() ? 'Due today' : 'Due ' + hwDateTxt(it.due); }
const hwPast = (it) => !!(it && !it.done && it.due && it.due < hwToday());

/* ------------------------------------------------------------------ the record */
function hwOf(c) { c = c || active(); const h = c && c.hw; return h && typeof h === 'object' && Array.isArray(h.items) ? h : null; }
function hwItems(c) { const h = hwOf(c); return h ? h.items.filter((x) => x && HW_TAB_OF[x.kind]) : []; }
function hwFind(c, id) { return hwItems(c).find((x) => String(x.id) === String(id)) || null; }
function hwMake(c) { if (!c.hw || typeof c.hw !== 'object' || !Array.isArray(c.hw.items)) c.hw = { items: [], seq: 0 };
  if (!(c.hw.seq >= 0)) c.hw.seq = c.hw.items.reduce((m, x) => Math.max(m, +(x && x.id) || 0), 0); return c.hw; }
/* one assignment, written on THIS child only (the Teacher's Corner calls it through SB_HW.add) */
function hwAdd(c, item) { const h = hwMake(c); h.seq = (h.seq | 0) + 1;
  const it = Object.assign({ id: h.seq, kind: item.kind, ref: item.ref == null ? null : item.ref, at: hwToday(), due: item.due || null, done: null, res: null, by: 'grown-up' }, item, { id: h.seq, by: 'grown-up', at: hwToday(), done: null });
  h.items.push(it); hwSync(c); return it; }
/* an open item taken away by the grown-up. A chapter granted ahead of the Atlas that the child already started stays open
   for them (c.hw.keep) — removing homework never takes a chapter back */
function hwRemove(c, id) { const h = hwOf(c); if (!h) return false; const i = h.items.findIndex((x) => x && String(x.id) === String(id)); if (i < 0) return false;
  const it = h.items[i]; if (it.done) return false;
  if (it.kind === 'concept' && it.grant && (it.op || hwChapterDone(c, it) || hwChapterStarted(c, it))) { h.keep = Array.isArray(h.keep) ? h.keep : []; h.keep.push({ ref: it.ref, t: it.t || '' }); }
  h.items.splice(i, 1); if (h.run && String(h.run.id) === String(id)) delete h.run; return true; }

/* ------------------------------------------------------------------ the Atlas's own record: walked, on the item's lap */
let _hwFront = null;
function hwFront() { if (!_hwFront && typeof window.SB_TRAIL_FRONT === 'function') _hwFront = window.SB_TRAIL_FRONT(() => window.SB_TRAIL || window.SB_TRAIL_HOME); return _hwFront; }
function hwCourse(crs, fn) { const p = state.trailCourse; state.trailCourse = crs === 'exp' ? 'exp' : 'honey'; try { return fn(); } finally { state.trailCourse = p; } }
function hwLapNow(c, crs) { const t = hwFront().tr(c); return crs === 'exp' ? (t.elap || 1) : (t.lap || 1); }
/* the child's trail read at another lap: passedNode reads lapOf(c), so a view whose lap is the item's answers for it */
function hwAtLap(c, crs, lap) { const t = hwFront().tr(c); const v = Object.create(t); if (crs === 'exp') v.elap = lap; else v.lap = lap; return { trail: v }; }
function hwStopNode(it) { return it.chk ? { kind: 'chk', id: it.ref } : { kind: 'unit', u: { id: it.ref } }; }
function hwStopWalked(c, it) { const F = hwFront(); if (!F) return false; const crs = it.crs === 'exp' ? 'exp' : 'honey', lap = +it.lap || 1;
  if (hwLapNow(c, crs) > lap) return true;   /* the lap moved on: every stop of it was walked */
  return hwCourse(crs, () => !!F.passedNode(hwAtLap(c, crs, lap), hwStopNode(it))); }
/* is the stop open to this child now (at or behind their furthest open stop) — the same rule trailUnit locks on */
function hwStopOpen(c, it) { const F = hwFront(); if (!F) return true; const crs = it.crs === 'exp' ? 'exp' : 'honey';
  return hwCourse(crs, () => { if (hwLapNow(c, crs) !== (+it.lap || 1)) return true; const s = F.seq(c);
    const i = s.findIndex((n) => (it.chk ? n.kind === 'chk' && n.id === it.ref : n.kind === 'unit' && n.u.id === it.ref)); return i >= 0 && i <= F.reachIn(c, s); }); }

/* ------------------------------------------------------------------ the concept course's own record */
function hwChapter(it) { const D = state.conceptData || []; let ci = +it.ref, ch = D[ci];
  if (it.t && (!ch || ch.title !== it.t)) { ci = D.findIndex((x) => x && x.title === it.t); ch = ci >= 0 ? D[ci] : null; }
  return ch ? { ci, ch } : null; }
/* 'read' — reached its last card (c.cRead, app3 conceptReadMark); 'mastered' — conceptStat's own rule (PATTERN_DONE_PCT of
   its words mastered) read from THIS child's evidence record, so it answers for a sibling too */
function hwChapterDone(c, it) { const R = hwChapter(it), ci = R ? R.ci : +it.ref, rd = (c && c.cRead) || {};
  if (rd[ci]) return 'read';
  if (R) { const ws = conceptWordsOf(R.ch); if (ws.length) { const M = (c && c.mast) || {}; const m = ws.filter((x) => mastIsMastered(M[nkey(x.w)])).length; if (m / ws.length >= PATTERN_DONE_PCT) return 'mastered'; } }
  return ''; }
function hwChapterStarted(c, it) { const R = hwChapter(it); if (!R) return false; const M = (c && c.mast) || {}; return conceptWordsOf(R.ch).some((x) => M[nkey(x.w)]); }

/* ------------------------------------------------------------------ the word list's own record */
function hwGotSet(it) { return new Set((it.got || []).map(nkey)); }
function hwWordsRight(it) { const g = hwGotSet(it); return (it.words || []).filter((w) => g.has(nkey(w.w))).length; }

/* ------------------------------------------------------------------ done, derived — and the day it was first seen */
function hwDerive(c, it) {
  if (it.kind === 'words') return (it.words || []).length > 0 && hwWordsRight(it) >= it.words.length;
  if (it.kind === 'stop') return hwStopWalked(c, it);
  if (it.kind === 'concept') return !!hwChapterDone(c, it);
  return false; }
let _hwSaveT = null;
function hwSaveSoon() { if (_hwSaveT) return; _hwSaveT = setTimeout(() => { _hwSaveT = null; try { save(); } catch (e) {} }, 0); }
function hwSync(c) { c = c || active(); const h = hwOf(c); if (!h) return false; let changed = false;
  for (const it of h.items) { if (!it || it.done || !HW_TAB_OF[it.kind]) continue; let d = false; try { d = hwDerive(c, it); } catch (e) {}
    if (d) { it.done = hwToday(); if (it.kind === 'words') it.res = { right: hwWordsRight(it), of: it.words.length }; changed = true; } }
  if (changed) hwSaveSoon(); return changed; }
function hwOpenItems(c) { hwSync(c); return hwItems(c).filter((x) => !x.done); }
function hwTitle(it) { if (it.kind === 'concept') return conceptShort(it.t || '') || 'A chapter'; if (it.kind === 'stop') return String(it.t || (it.chk ? 'Checkpoint' : 'A stop')).split(' — ')[0]; return it.t || 'A word list'; }
function hwResultTxt(c, it) {
  if (it.kind === 'words') { const n = hwWordsRight(it), of = (it.words || []).length; return n >= of && of ? 'Every word spelled right' : n + ' of ' + of + ' spelled right'; }
  if (it.kind === 'stop') return it.done ? (it.chk ? 'Checkpoint passed' : 'Stop walked') : 'Not walked yet';
  const d = hwChapterDone(c, it); return d === 'mastered' ? 'Its words mastered' : d === 'read' || it.done ? 'Read to the end' : 'Not read yet'; }

/* ------------------------------------------------------------------ the report card's numbers (app3-grownups.js reads them) */
function hwReport(c) { c = c || active(); hwSync(c); const its = hwItems(c), done = its.filter((x) => x.done);
  const words = its.filter((x) => x.kind === 'words'), stops = its.filter((x) => x.kind === 'stop'), chs = its.filter((x) => x.kind === 'concept');
  return { assigned: its.length, done: done.length, onTime: done.filter((x) => !x.due || x.done <= x.due).length,
    wordsRight: words.reduce((n, x) => n + hwWordsRight(x), 0), wordsOf: words.reduce((n, x) => n + (x.words || []).length, 0),
    stops: stops.length, stopsWalked: stops.filter((x) => x.done).length, chapters: chs.length, chaptersRead: chs.filter((x) => x.done).length,
    open: its.filter((x) => !x.done).map((x) => ({ id: x.id, kind: x.kind, title: hwTitle(x), due: x.due || null, dueTxt: hwDueTxt(x), late: hwPast(x), result: hwResultTxt(c, x) })) }; }

/* ------------------------------------------------------------------ the word list, spelled (Today's ten's scoring) */
function hwRun(c) { const h = hwOf(c || active()); const R = h && h.run; if (!R || !Array.isArray(R.ws)) return null; if (!hwFind(c || active(), R.id)) { delete h.run; return null; } return R; }
function hwRunWord(R) { return R && R.st !== 'done' ? R.ws[R.i] || null : null; }
function hwTabNow() { const t = state.hwTab; return HW_TABS.indexOf(t) >= 0 ? t : 'concepts'; }
function hwLive() { try { if (state.nav !== 'homework' || state.screen !== 'app' || hwTabNow() !== 'words') return false; const R = hwRun(); return !!(R && R.st === 'ask' && hwRunWord(R)); } catch (e) { return false; } }
const hwSlim = (w) => ({ w: w.w, d: w.d || '', s: w.s || '', p: w.p || '', y: w.y || 3, h: w.h || '' });
function hwHear(how) { const w = hwRunWord(hwRun()); if (!w) return;
  try { if (how === 'slow') say(w.w, 0.6); else if (how === 'sent' && w.s) saySentence(w.s, w.w); else say(w.w); } catch (e) {} }
function hwFocusIn() { setTimeout(() => { try { const el = document.querySelector('[data-fkey="hwTyped"]'); if (el && !el.disabled) el.focus(); } catch (e) {} }, 60); }
function hwArrive() { setTimeout(() => { if (hwLive()) hwHear(''); }, 320); hwFocusIn(); }
function hwStart(id) { const c = active(), it = hwFind(c, id); if (!it || it.kind !== 'words') return; const h = hwMake(c);
  const R0 = hwRun(c); if (R0 && String(R0.id) === String(it.id) && R0.st !== 'done') { state.hwTab = 'words'; render(); hwArrive(); return; }   /* resume at its word */
  const g = hwGotSet(it); let ws = (it.words || []).filter((w) => !g.has(nkey(w.w)));
  if (!ws.length) ws = (it.words || []).slice();   /* all right already: another round is practice, scored the same way */
  if (!ws.length) return;
  h.run = { id: it.id, ws: ws.map(hwSlim), i: 0, st: 'ask', typed: '', last: '', res: [], coins: 0 };
  state.hwTab = 'words'; state.hwStudy = null; save(); render(); hwArrive(); }
function hwCheck() { const c = active(), R = hwRun(c), w = hwRunWord(R); if (!w || R.st !== 'ask') return;
  const typed = String(R.typed || '').trim().toLowerCase();
  if (!typed) { try { flash('Type the word first'); } catch (e) {} hwFocusIn(); return; }
  const ok = typed === nkey(w.w), it = hwFind(c, R.id);
  try { logBand(w, ok); } catch (e) {}
  if (ok) {
    try { markMastered(nkey(w.w)); } catch (e) {} try { clearMiss(w.w); } catch (e) {} try { gainXp(); } catch (e) {}
    let n = 0; try { n = addCoins('answer'); } catch (e) {} R.coins = (R.coins || 0) + (n || 0);
    try { sfx('correct'); } catch (e) {}
    if (it) { it.got = Array.isArray(it.got) ? it.got : []; if (!hwGotSet(it).has(nkey(w.w))) it.got.push(w.w);
      it.res = { right: hwWordsRight(it), of: (it.words || []).length };
      if (!it.done && it.res.right >= it.res.of) it.done = hwToday(); }
  } else { try { addMiss(w); } catch (e) {} try { sfx('wrong'); } catch (e) {} }
  R.res.push({ w: w.w, ok: ok ? 1 : 0 }); R.st = ok ? 'right' : 'miss'; R.last = typed;
  save(); render();
  /* a right answer may move on by itself; a miss never does (FIX-BEE D3) — it holds on the shared miss panel until Next */
  if (ok) { const at = R.i; setTimeout(() => { const R2 = hwRun(); if (R2 && R2.i === at && R2.st === 'right' && state.nav === 'homework') hwNext(); }, 1000); }
  else setTimeout(() => { try { const b = document.querySelector('.hw-next'); if (b) b.focus(); } catch (e) {} }, 60); }
function hwNext() { const R = hwRun(); if (!R || R.st === 'ask' || R.st === 'done') return;
  R.i++; R.st = 'ask'; R.typed = ''; R.last = '';
  if (R.i >= R.ws.length) { hwFinish(R); return; }
  save(); render(); hwArrive(); }
/* the round ends — at its last word, or when the child stops for now; the words not yet right stay to spell next time */
function hwFinish(R) { R.st = 'done'; const c = active(), it = hwFind(c, R.id); const right = R.res.filter((x) => x.ok).length;
  try { logActivity('homework', 'Homework · ' + hwTitle(it || {}), { done: R.res.length, right, coins: R.coins || 0 }, R.res.filter((x) => !x.ok).map((x) => x.w)); } catch (e) {}
  save(); render();
  try { if (it && it.done) sfx('level'); } catch (e) {}
  setTimeout(() => { try { const b = document.querySelector('.hw-fin [data-act="hwLeave"]'); if (b) b.focus(); } catch (e) {} }, 60); }

/* keys: Enter checks or moves on, 1–3 the voice (no spelling holds a digit) — every one is also a button */
function hwOnKey(e) { try {
  if (state.nav !== 'homework' || state.screen !== 'app' || state.settingsOpen || state.drawerOpen || state.pinDlg || hwTabNow() !== 'words') return;
  if (e.ctrlKey || e.metaKey || e.altKey) return; const R = hwRun(); if (!R || R.st === 'done') return;
  if (e.key === 'Enter') { const t = e.target; if (t && t.tagName === 'BUTTON' && !t.classList.contains('hw-next')) return;   // a focused button's own Enter
    e.preventDefault(); if (R.st === 'ask') hwCheck(); else hwNext(); return; }
  if (R.st === 'ask' && /^[1-3]$/.test(e.key)) { e.preventDefault(); hwHear(e.key === '1' ? '' : e.key === '2' ? 'slow' : 'sent'); } } catch (err) {} }
if (!window._hwKeys) { window._hwKeys = 1; window.addEventListener('keydown', hwOnKey); }

/* ------------------------------------------------------------------ the screen */
function hwCss() { if (document.getElementById('hw-css')) return; const st = document.createElement('style'); st.id = 'hw-css'; st.textContent = `
.hw-page{max-width:760px;margin:0 auto}
.hw-page .bz-tabs{margin-bottom:12px}
.hw-sub{margin:-4px 0 14px;color:var(--muted);font-size:13.5px;line-height:1.5}
.hw-list{display:flex;flex-direction:column;gap:10px}
.hw-item{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:14px 16px}
.hw-ic{flex:none;width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:var(--chip);color:var(--accent)}
.hw-body{flex:1 1 220px;min-width:0}
.hw-t{display:block;font-family:var(--display);font-weight:800;font-size:16px;line-height:1.25;color:var(--ink,var(--text))}
.hw-m{display:block;margin-top:3px;font-size:13px;color:var(--muted);font-weight:650;line-height:1.45}
.hw-m b{color:var(--ink,var(--text))}
.hw-btns{display:flex;gap:8px;flex-wrap:wrap}
.hw-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:44px;padding:0 16px;border-radius:12px;border:2px solid var(--accent);background:var(--paper,var(--bg2));color:var(--ink,var(--text));font-weight:800;font-size:14px;cursor:pointer}
.hw-btn.quiet{border:1px solid var(--line);background:var(--surface2)}
.hw-btn kbd,.hw-tool kbd{font:700 11px/1 var(--mono,monospace);padding:3px 5px;border-radius:5px;border:1px solid currentColor;opacity:.75}
.hw-wait{font-size:13px;color:var(--muted);font-weight:700}
.hw-empty{padding:16px 18px}
.hw-deck{display:flex;flex-direction:column;gap:8px;margin-top:4px;padding:12px;border-radius:14px;background:var(--surface2);border:1px solid var(--line)}
.hw-dk{width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:44px;padding:8px 12px;border-radius:12px;border:1px solid var(--line);background:var(--paper,var(--bg2));color:var(--ink,var(--text));font-family:var(--display);font-weight:800;font-size:15px;text-align:left;cursor:pointer}
.hw-dkb{padding:4px 12px 10px;font-size:14px;line-height:1.55;color:var(--ink,var(--text))}
.hw-dkb p{margin:6px 0}
.hw-dkb .hw-say{color:var(--muted);font-weight:700}
.hw-pips{display:flex;gap:5px;margin:4px 0 12px}.hw-pips i{flex:1;height:8px;border-radius:99px;background:var(--surface2);border:1px solid var(--line)}
.hw-pips i.ok{background:var(--good);border-color:var(--good)}.hw-pips i.no{background:var(--bad);border-color:var(--bad)}.hw-pips i.now{background:var(--accent);border-color:var(--accent)}
.hw-card,.hw-fin{padding:16px 18px}
.hw-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;font-weight:800;font-size:13px;color:var(--muted);margin-bottom:10px}
.hw-tools{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:12px}
.hw-tool{display:inline-flex;align-items:center;gap:7px;min-height:44px;padding:0 14px;border-radius:12px;border:1px solid var(--line);background:var(--paper,var(--bg2));color:var(--ink,var(--text));font-weight:800;font-size:14px}
.hw-mean{margin:0 0 12px;font-size:14.5px;line-height:1.5;color:var(--ink,var(--text));text-align:center}
.hw-ask{display:flex;gap:8px;align-items:stretch}
.hw-in{flex:1;min-width:0;min-height:52px;text-align:center;padding:10px 12px;border-radius:14px;background:var(--surface);border:2px solid var(--line);color:var(--text);font-family:var(--entry);font-weight:700;font-size:clamp(20px,5vw,26px);letter-spacing:.12em;text-transform:lowercase;outline:none}
.hw-in:focus{border-color:var(--accent)}
.hw-check,.hw-next{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:52px;padding:0 18px;border-radius:14px;border:2px solid var(--accent);background:var(--paper,var(--bg2));color:var(--ink,var(--text));font-weight:800;font-size:15px}
.hw-check kbd,.hw-next kbd{font:700 11px/1 var(--mono,monospace);padding:3px 5px;border-radius:5px;border:1px solid currentColor;opacity:.75}
.hw-next{width:100%;margin-top:4px}
.hw-yes{display:flex;align-items:center;justify-content:center;gap:8px;min-height:52px;border-radius:14px;background:color-mix(in srgb,var(--good) 14%,transparent);color:var(--ink,var(--text));font-size:16px}
.hw-stop{display:flex;justify-content:flex-end;margin-top:12px}
.hw-fh{font-family:var(--display);font-size:22px;margin:0 0 4px}
.hw-fs{margin:0 0 10px;color:var(--muted);font-size:14px;line-height:1.5}
.hw-fl{display:flex;align-items:center;gap:6px;margin:12px 0 6px;font-size:14px}
.hw-chips{display:flex;flex-wrap:wrap;gap:6px}.hw-none{color:var(--muted);font-size:13.5px}
.hw-chip{display:inline-flex;align-items:center;gap:5px;min-height:44px;padding:0 12px;border-radius:999px;border:1px solid var(--line);background:var(--paper,var(--bg2));color:var(--ink,var(--text));font:800 14px/1 var(--mono,monospace)}
.hw-fbtns{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}
.hw-hist{display:grid;grid-template-columns:minmax(0,1fr);gap:8px}
.hw-hrow{display:flex;gap:12px;align-items:flex-start;padding:12px 14px}
.hw-hrow .hw-t{font-size:15px}
.hw-tag{display:inline-flex;align-items:center;gap:5px;padding:2px 9px;border-radius:999px;font-size:12px;font-weight:800;background:var(--surface2);color:var(--ink,var(--text));border:1px solid var(--line)}
.hw-tag.ok{background:color-mix(in srgb,var(--good) 16%,var(--paper,var(--bg2)))}
@media (max-width:480px){.hw-tool kbd,.hw-btn kbd{display:none}.hw-tool{padding:0 11px;font-size:13px;gap:5px}.hw-ask{flex-direction:column}.hw-check{width:100%}.hw-item{padding:12px}.hw-btns{width:100%}.hw-btns .hw-btn{flex:1}}
@media (prefers-reduced-motion:reduce){.hw-page *{transition:none!important;animation:none!important}}`;
  document.head.appendChild(st); }
const hwIc = (n, s) => { try { return iconSVG(n, s || 18, 2.2); } catch (e) { return ''; } };
const HW_KIND_IC = { concept: 'book', stop: 'steps', words: 'pencil' };

function hwConceptRows(c, its) {
  if (!its.length) return `<div class="sb-card hw-empty">${beeEmpty('happy', 'No chapters to read right now.')}</div>`;
  return `<div class="hw-list">${its.map((it) => `<div class="sb-card hw-item" data-hw-item="${it.id}">
      <span class="hw-ic" aria-hidden="true">${hwIc('book', 20)}</span>
      <span class="hw-body"><span class="hw-t">${esc(hwTitle(it))}</span>
        <span class="hw-m">Read it to the last card. ${esc(hwDueTxt(it))}.</span></span>
      <span class="hw-btns"><button class="hw-btn" data-act="hwConcept" data-arg="${it.id}">${hwIc('book', 16)} Open the chapter</button></span></div>`).join('')}</div>`; }
function hwStopRows(c, its) {
  if (!its.length) return `<div class="sb-card hw-empty">${beeEmpty('happy', 'No Atlas stops to walk right now.')}</div>`;
  return `<div class="hw-list">${its.map((it) => { const open = hwStopOpen(c, it);
    return `<div class="sb-card hw-item" data-hw-item="${it.id}">
      <span class="hw-ic" aria-hidden="true">${hwIc('steps', 20)}</span>
      <span class="hw-body"><span class="hw-t">${esc(hwTitle(it))}</span>
        <span class="hw-m">${it.act ? esc(it.act) + ' · ' : ''}${it.chk ? 'A checkpoint quiz.' : 'Learn, meet the words, practise, and take the quiz.'} ${esc(hwDueTxt(it))}.</span></span>
      <span class="hw-btns">${open ? `<button class="hw-btn" data-act="hwStop" data-arg="${it.id}">${hwIc('steps', 16)} Go to the stop</button>` : '<span class="hw-wait">Opens once the stop before it is walked</span>'}</span></div>`; }).join('')}</div>`; }
function hwDeck(it) { const op = (state.hwDeck || {});
  return `<div class="hw-deck" role="region" aria-label="${escA('Study the list: ' + hwTitle(it))}">${(it.words || []).map((w, i) => `<div>
      <button class="hw-dk" data-act="hwDeckTog" data-arg="${i}" aria-expanded="${op[i] ? 'true' : 'false'}"><span>${esc(w.w)}</span><span aria-hidden="true">${op[i] ? '−' : '+'}</span></button>
      ${op[i] ? `<div class="hw-dkb">${w.p ? `<p class="hw-say">say it: ${esc(w.p)}</p>` : ''}${w.d ? `<p><b>Meaning:</b> ${esc(w.d)}</p>` : ''}${w.s ? `<p><b>In a sentence:</b> ${esc(w.s)}</p>` : ''}
        <button class="hw-btn quiet" data-act="say" data-arg="${escA(w.w)}">${hwIc('volume', 16)} Hear it</button></div>` : ''}</div>`).join('')}</div>`; }
function hwWordRows(c, its) {
  if (!its.length) return `<div class="sb-card hw-empty">${beeEmpty('happy', 'No word lists to spell right now.')}</div>`;
  return `<div class="hw-list">${its.map((it) => { const n = hwWordsRight(it), of = (it.words || []).length, study = String(state.hwStudy) === String(it.id);
    return `<div class="sb-card hw-item" data-hw-item="${it.id}">
      <span class="hw-ic" aria-hidden="true">${hwIc('pencil', 20)}</span>
      <span class="hw-body"><span class="hw-t">${esc(hwTitle(it))}</span>
        <span class="hw-m" data-hw-got="${n}"><b>${n} of ${of}</b> spelled right. ${esc(hwDueTxt(it))}.</span></span>
      <span class="hw-btns"><button class="hw-btn quiet" data-act="hwStudy" data-arg="${it.id}" aria-expanded="${study ? 'true' : 'false'}">${hwIc('cards', 16)} ${study ? 'Close the list' : 'Study the list'}</button>
        <button class="hw-btn" data-act="hwSpell" data-arg="${it.id}">${hwIc('pencil', 16)} ${n ? 'Spell the rest' : 'Spell them'}</button></span>
      ${study ? `<div style="flex-basis:100%">${hwDeck(it)}</div>` : ''}</div>`; }).join('')}</div>`; }
function hwPipsHTML(R) { return `<div class="hw-pips" role="progressbar" aria-label="This round" aria-valuemin="0" aria-valuemax="${R.ws.length}" aria-valuenow="${R.res.length}">${R.ws.map((w, i) => {
    const r = R.res[i]; return `<i class="${r ? (r.ok ? 'ok' : 'no') : i === R.i && R.st !== 'done' ? 'now' : ''}"></i>`; }).join('')}</div>`; }
function hwDrillHTML(c, R, it) { const w = hwRunWord(R); if (!w) return '';
  const n = R.i + 1, of = R.ws.length, st = R.st, mean = w.d ? maskTxt(w.d, w.w) : '';
  const tools = `<div class="hw-tools">
      <button class="hw-tool" data-act="hwHear" aria-label="Hear the word">${hwIc('volume', 18)} <span>Hear it</span> <kbd>1</kbd></button>
      <button class="hw-tool" data-act="hwSlow" aria-label="Hear it slowly">${tortoiseSVG(18)} <span>Slowly</span> <kbd>2</kbd></button>
      ${w.s ? `<button class="hw-tool" data-act="hwSent" aria-label="Hear it in a sentence">${hwIc('quote', 17)} <span>In a sentence</span> <kbd>3</kbd></button>` : ''}</div>`;
  const ask = st === 'ask' ? `<div class="hw-ask">
      <input class="hw-in" data-inp="hwType" data-fkey="hwTyped" value="${escA(R.typed || '')}" placeholder="spell it" aria-label="Spell the word you hear" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false">
      <button class="hw-check" data-act="hwCheck">Check <kbd>Enter</kbd></button></div>` : '';
  const right = st === 'right' ? `<div class="hw-yes" role="status">${hwIc('check', 18)} <b>${esc(w.w)}</b> — right!</div>` : '';
  const miss = st === 'miss' ? missFeedbackHTML(w, R.last || '', { head: nearHead(R.last, w.w), foot: 'Saved for revision — it comes back on a later day.' })
    + `<button class="hw-next" data-act="hwNext">${n < of ? 'Next word' : 'See how it went'} <kbd>Enter</kbd></button>` : '';
  return `${hwPipsHTML(R)}<div class="sb-card hw-card" data-live-prompt="${escA('Word ' + n + ' of ' + of + '. Listen, then spell it.')}">
      <div class="hw-meta"><span>Word ${n} of ${of}</span><span>${esc(hwTitle(it))}</span></div>
      ${tools}${mean ? `<p class="hw-mean"><b>Meaning:</b> ${esc(mean)}</p>` : ''}${ask}${right}${miss}
      <div class="hw-stop"><button class="hw-btn quiet" data-act="hwLeave" data-arg="stop">Stop for now</button></div></div>`; }
function hwFinHTML(c, R, it) { const ok = R.res.filter((x) => x.ok), no = R.res.filter((x) => !x.ok);
  const all = (it.words || []).length, got = hwWordsRight(it), rest = all - got;
  const chip = (x) => `<button class="hw-chip" data-act="say" data-arg="${escA(x.w)}" aria-label="${escA('Hear ' + x.w)}">${x.ok ? hwIc('check', 13) : hwIc('retry', 13)} ${esc(x.w)}</button>`;
  return `<div class="sb-card hw-fin" role="region" aria-label="This round — how it went">
    <h3 class="hw-fh" data-hw-fin-got="${got}">${got} of ${all} spelled right</h3>
    <p class="hw-fs">${R.coins ? `${hwIc('coin', 15)} +${R.coins} coin${R.coins === 1 ? '' : 's'} for right answers. ` : ''}${rest ? `${rest} still to spell — they wait for next time.` : 'That is the whole list. Well spelled.'}</p>
    <h4 class="hw-fl">${hwIc('check', 15)} Right this round</h4>
    <div class="hw-chips">${ok.length ? ok.map(chip).join('') : '<span class="hw-none">None this round.</span>'}</div>
    ${no.length ? `<h4 class="hw-fl">${hwIc('retry', 15)} To practise</h4><div class="hw-chips">${no.map(chip).join('')}</div><p class="hw-fs">They are on your revision list too.</p>` : ''}
    <div class="hw-fbtns">${rest ? `<button class="hw-btn" data-act="hwSpell" data-arg="${it.id}">${hwIc('pencil', 16)} Spell the rest</button>` : ''}<button class="hw-btn quiet" data-act="hwLeave">Back to my homework</button></div></div>`; }
function hwHistory(c) {
  const its = hwItems(c).filter((x) => x.done || hwPast(x)).slice().sort((a, b) => String(b.done || b.due || '').localeCompare(String(a.done || a.due || '')) || (b.id - a.id));
  if (!its.length) return `<div class="sb-card hw-empty">${beeEmpty('think', 'Finished homework lands here, with the day it was set and the day it was done.')}</div>`;
  return `<div class="hw-hist">${its.map((it) => `<div class="sb-card hw-hrow" data-hw-hist="${it.id}" data-hw-done="${it.done ? 1 : 0}">
      <span class="hw-ic" aria-hidden="true">${hwIc(HW_KIND_IC[it.kind], 18)}</span>
      <span class="hw-body"><span class="hw-t">${esc(hwTitle(it))}</span>
        <span class="hw-m">Set ${esc(hwDateTxt(it.at))} · ${it.due ? 'due ' + esc(hwDateTxt(it.due)) : 'no due date'}${it.done ? ' · done ' + esc(hwDateTxt(it.done)) : ''}</span>
        <span class="hw-m"><span class="hw-tag${it.done ? ' ok' : ''}">${it.done ? hwIc('check', 12) + ' ' + esc(hwResultTxt(c, it)) : 'Not finished yet'}</span></span></span></div>`).join('')}</div>`; }
function hwTabsHTML(tab) { const T = (k, ic, l) => `<button role="tab" aria-selected="${tab === k ? 'true' : 'false'}" data-act="hwTab" data-arg="${k}" class="bz-tab${tab === k ? ' on' : ''}">${hwIc(ic, 16)} ${l}</button>`;
  return `<div class="bz-tabs" role="tablist" aria-label="My homework">${T('concepts', 'book', 'Concepts')}${T('atlas', 'steps', 'Atlas')}${T('words', 'pencil', 'Word list')}${T('history', 'history', 'History')}</div>`; }
function viewHomework() { hwCss(); const c = active(); hwSync(c);
  const open = hwItems(c).filter((x) => !x.done), R = hwRun(c);
  if (HW_TABS.indexOf(state.hwTab) < 0) state.hwTab = (R && R.st !== 'done') ? 'words' : (HW_TABS.find((t) => open.some((x) => HW_TAB_OF[x.kind] === t)) || (hwItems(c).length ? 'history' : 'concepts'));
  const tab = state.hwTab;
  const head = tabHead('My homework', { icon: hwIc('pencil', 20), sub: 'What a grown-up set for you. Doing it here counts everywhere in the app.' });
  let body;
  if (tab === 'concepts') body = hwConceptRows(c, open.filter((x) => x.kind === 'concept'));
  else if (tab === 'atlas') body = hwStopRows(c, open.filter((x) => x.kind === 'stop'));
  else if (tab === 'words') { const it = R && hwFind(c, R.id);
    body = R && it ? (R.st === 'done' ? hwFinHTML(c, R, it) : hwDrillHTML(c, R, it)) : hwWordRows(c, open.filter((x) => x.kind === 'words')); }
  else body = hwHistory(c);
  return `<div class="hw-page" data-hw-tab="${tab}">${head}${hwTabsHTML(tab)}<div role="tabpanel">${body}</div></div>`; }

/* ------------------------------------------------------------------ actions */
Object.assign(app, {
  hwTab: (t) => { if (HW_TABS.indexOf(t) < 0) return; state.hwStudy = null; set({ hwTab: t }); if (t === 'words' && hwLive()) hwArrive(); },
  /* a chapter opens through the app's own opener — its lock is the app's (a homework grant opens a learning lock) — and Back
     comes here (openConcept remembers where it was opened from) */
  hwConcept: (id) => { const c = active(), it = hwFind(c, id); if (!it || it.kind !== 'concept') return; if (!it.op) { it.op = hwToday(); save(); }
    lazyNeed(it.adv ? ['concepts', 'advConcepts'] : 'concepts', () => { if (state.nav !== 'homework') return; try { loadConcepts(); } catch (e) {}
      const R = hwChapter(it); if (!R) { try { flash('That chapter is still loading — one moment'); } catch (e) {} return; }
      state.trailReturn = null;   /* opened from homework, Back comes here — not to a stop whose drill was left earlier */
      app.openConcept(R.ci); }); },
  /* a stop opens through trailUnit / trailChk — the Atlas's own doors, so its lock holds */
  hwStop: (id) => { const c = active(), it = hwFind(c, id); if (!it || it.kind !== 'stop') return; if (!it.op) { it.op = hwToday(); save(); }
    if (it.chk) app.trailChk((it.crs === 'exp' ? 'exp' : 'honey') + '|' + it.ref); else app.trailUnit(it.ref); },
  hwStudy: (id) => { state.hwDeck = {}; set({ hwStudy: String(state.hwStudy) === String(id) ? null : id }); },
  hwDeckTog: (i) => { const d = state.hwDeck || (state.hwDeck = {}); d[i] = !d[i]; render(); },
  hwSpell: hwStart,
  hwType: (v) => { const R = hwRun(); if (R && R.st === 'ask') R.typed = String(v || ''); },
  hwCheck: hwCheck, hwNext: hwNext,
  hwHear: () => hwHear(''), hwSlow: () => hwHear('slow'), hwSent: () => hwHear('sent'),
  /* "Stop for now" ends the round where it stands (the words not yet right wait for next time); from the finish card it
     goes back to the list */
  hwLeave: (how) => { const c = active(), h = hwOf(c), R = hwRun(c); if (!R) { render(); return; }
    if (how === 'stop' && R.st !== 'done') { hwFinish(R); return; }
    delete h.run; save(); render(); }
});

window.SB_HW = { live: hwLive, sync: hwSync, items: hwItems, find: hwFind, add: hwAdd, remove: hwRemove, report: hwReport,
  openCount: (c) => hwOpenItems(c || active()).length, open: hwOpenItems, title: hwTitle, result: hwResultTxt, dueTxt: hwDueTxt, dateTxt: hwDateTxt,
  past: hwPast, today: hwToday, plusDays: hwPlusDays, stopWalked: hwStopWalked, stopOpen: hwStopOpen, chapterDone: hwChapterDone, chapter: hwChapter,
  wordsRight: hwWordsRight, run: hwRun, TABS: HW_TABS };
