"use strict";
/* app3-teach.js — THE TEACHER'S CORNER: the grown-up guiding the household's spellers sets homework.
   Owner, 15 Oct 2026: "build the teacher's corner … ensure this is for a teacher to guide the students … generate mock word
   lists and assign to the student … assign tasks to complete based on where they are … also assign concepts to complete";
   and the same day: "Concepts - teacher can assign concepts beyond the lock too." The speller's side is app3-homework.js
   (My Homework) and the record both read is its window.SB_HW (this file's group carries it).

   Behind the grown-up PIN: app3.js `openTeacher` (core — Settings → Grown-ups and the Parent Zone open it) passes a pass
   already made on screen, or asks; #/teacher goes through the same opener (family-shell DOOR); viewApp ends the pass
   (state.teachOk) the moment the screen is left, and this view draws nothing of the Corner without it.

   THE CLASS IS THE CHILDREN ON THIS DEVICE (the screen says so). For each: first name, age band, avatar — nothing new is
   collected — and where they are: the Atlas region and next stop (trail-home.js's own frontier), the "I can…" objectives
   of that region (SB_OBJ, evidence only), the words due again (homeDueWords), their word band (SB_BAND.child).
     A PRACTICE WORD LIST — nothing typed: a source (their Atlas region — the stops walked and the one they are at; a level;
     a theme; their slipped and missed words) and a size (10/15/20/25). Every word comes through the ONE word door,
     nextWords.pool (the door's preview entry: kid-safe for THIS child, their band window), never a corpus read
     (tests/word-door.cjs); the pick is DETERMINISTIC — the words ordered by a hash of the choices and a "New list"
     counter, never Math.random — so the same choices give the same list. Words in print here: it is the grown-up's screen.
     ATLAS STOPS — from the child's own frontier, only stops OPEN to them now (at or behind their furthest open stop, not
     walked): homework opens a stop through trailUnit / trailChk, the Atlas's own doors, so no lock is bypassed.
     CHAPTERS — every chapter of the course: the assigned and suggested stops' own chapters first, then by family. One the
     child has not reached on the Atlas (a LEARNING lock) is offered and marked "ahead"; assigning it records `grant` on the
     item, and app3's isConceptUnlocked opens it for that child only. A PLAN lock (the family plan, the Advanced Pack) is
     never lifted by homework: shown as needing the plan, not assignable — and no price, anywhere.
     A due date as a chip (today / 3 days / a week / none). Titles are generated ("Words: The Meadow, 15").
     RESOURCES — a print view (window.print) of a list with its answer key, the chapters' own text and each stop's line on
     the sourced grade map (grade-map-data.js). Nothing is downloaded or sent.
   Every control is a button (keyboard Enter/Space, a tap) and keeps the focus through its own redraw (tcKeep).
   Guard: tests/teacher-corner.cjs. Notes for the integrator: TEACHER-HOMEWORK.md. */

const TC_SIZES = [10, 15, 20, 25];
const TC_LEVELS = [['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard'], ['champ', 'Champ']];
const TC_SRCS = [['region', 'Their Atlas region', 'steps'], ['level', 'A level', 'target'], ['theme', 'A theme', 'globe'], ['slip', 'Slipped and missed', 'retry']];
const TC_DUES = [['today', 'Today'], ['3d', 'In 3 days'], ['1w', 'In a week'], ['none', 'No date']];
const TC_BAND_AGES = { 1: '8–9', 2: '10–11', 3: '12–13', 4: '14–15' };

/* ------------------------------------------------------------------ the draft (per screen visit, never saved) */
function tcS() { const S = state; if (!S.tc || typeof S.tc !== 'object') S.tc = {};
  const t = S.tc; if (!(t.k >= 0) || !(state.children || [])[t.k]) { t.k = state.activeIdx | 0; tcReset(t); }
  if (!t.src) t.src = 'region'; if (!t.lv) t.lv = 'medium'; if (!(TC_SIZES.indexOf(t.n) >= 0)) t.n = 15; if (!t.due) t.due = 'none';
  if (!(t.seq >= 0)) t.seq = 0; t.rm = t.rm || {}; t.stops = t.stops || {}; t.chs = t.chs || {}; return t; }
function tcReset(t) { t.rm = {}; t.stops = {}; t.chs = {}; t.fams = {}; t.seq = 0; t.print = null; }
function tcKid() { const t = tcS(); return (state.children || [])[t.k] || active(); }
/* a reading that asks active() — the concept lock, the Atlas's open rule, the plan — answered for THIS child: synchronous,
   nothing renders or saves inside, and the active child is put back */
function tcAs(c, fn) { const i = (state.children || []).indexOf(c), p = state.activeIdx; if (i < 0 || i === p) return fn();
  state.activeIdx = i; try { return fn(); } finally { state.activeIdx = p; } }
let _tcFront = null;
function tcFront() { if (!_tcFront && typeof window.SB_TRAIL_FRONT === 'function') _tcFront = window.SB_TRAIL_FRONT(() => window.SB_TRAIL || window.SB_TRAIL_HOME); return _tcFront; }
function tcCourse(crs, fn) { const p = state.trailCourse; state.trailCourse = crs === 'exp' ? 'exp' : 'honey'; try { return fn(); } finally { state.trailCourse = p; } }
const tcActTitle = (id, crs) => { const T = window.SB_TRAIL || window.SB_TRAIL_HOME; const A = (T && (crs === 'exp' ? T.expedition && T.expedition.expeds : T.honey && T.honey.acts)) || [];
  const a = A.find((x) => x.id === id); return a ? String(a.title || '').replace(/^(Act|Expedition) [IVX]+ · /, '') : ''; };
const tcShort = (t) => String(t || '').split(' — ')[0].trim();
function tcHash(s) { let h = 0x811c9dc5; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h >>> 0; }

/* ------------------------------------------------------------------ where the child is */
function tcRoad(c, crs) { const F = tcFront(); if (!F) return null;
  return tcCourse(crs, () => { const s = F.seq(c); if (!s.length) return null; const fr = F.frontier(c), rc = F.reach(c), lap = crs === 'exp' ? (F.tr(c).elap || 1) : (F.tr(c).lap || 1);
    return { s, fr, rc, lap, crs, passed: s.map((n) => !!F.passedNode(c, n)) }; }); }
function tcNodeTitle(n) { return n.kind === 'unit' ? String(n.u.title || '') : 'Checkpoint'; }
function tcWhere(c) { const R = tcRoad(c, 'honey'); if (!R) return null; const s = R.s, i = Math.min(R.fr, s.length - 1), n = s[i], all = R.fr >= s.length;
  const inAct = s.map((x, k) => k).filter((k) => s[k].act === n.act);
  return { act: n.act, region: tcActTitle(n.act, 'honey'), title: all ? 'Every stop on this tier is walked' : tcShort(tcNodeTitle(n)), all, lap: R.lap,
    stop: inAct.indexOf(i) + 1, stops: inAct.length, walked: inAct.filter((k) => R.passed[k]).length }; }
/* the stops OPEN to this child and not yet walked — the frontier first, then any open behind it (a placed child's start
   line leaves those open). Never a stop past the furthest open one: trailUnit would refuse it, and so does this list. */
function tcOpenStops(c) { const out = [], crss = ['honey'].concat(tcAs(c, () => { try { return advModeOn(c); } catch (e) { return false; } }) ? ['exp'] : []);
  for (const crs of crss) { const R = tcRoad(c, crs); if (!R) continue; const order = [R.fr].concat(R.s.map((x, k) => k).filter((k) => k !== R.fr));
    for (const k of order) { if (k >= R.s.length || k > R.rc || R.passed[k]) continue; const n = R.s[k];
      out.push({ crs, lap: R.lap, k, chk: n.kind === 'chk', ref: n.kind === 'unit' ? n.u.id : n.id, gi: n.kind === 'unit' ? n.u.gi : null, act: n.act,
        title: tcNodeTitle(n), region: tcActTitle(n.act, crs), front: k === R.fr, key: crs + '|' + (n.kind === 'unit' ? n.u.id : 'chk:' + n.id) }); } }
  return out.slice(0, 6); }
function tcNextAfter(c) { const R = tcRoad(c, 'honey'); if (!R || R.rc + 1 >= R.s.length) return null; return tcShort(tcNodeTitle(R.s[R.rc + 1])); }

/* ------------------------------------------------------------------ the word list: through the one word door */
const tcPlain = (w) => /^[a-z]{3,}$/.test(String((w && w.w) || ''));
/* the words of the child's region: the stops walked there and the one they stand at (the stops' own word pools and their
   chapters' teaching words) — as KEYS, to narrow what the door hands back; null while the Atlas's word pools load */
function tcRegionKeys(c) { const M = window.SB_TRAIL_MAP; if (!M) { try { if (typeof window.SB_TRAIL_NEEDMAP === 'function') window.SB_TRAIL_NEEDMAP(() => { try { render(); } catch (e) {} }); } catch (e) {} return null; }
  const R = tcRoad(c, 'honey'); if (!R) return { keys: new Set(), act: '' }; const at = R.s[Math.min(R.fr, R.s.length - 1)], keys = new Set();
  R.s.forEach((n, k) => { if (n.kind !== 'unit' || n.act !== at.act || !(k === R.fr || R.passed[k])) return; const p = M[n.u.id] || {};
    ['1', '2', '3'].forEach((b) => (p[b] || []).forEach((w) => keys.add(nkey(w))));
    const ch = n.u.gi >= 0 ? (state.conceptData || [])[n.u.gi] : null; ((ch && ch.words) || []).forEach((x) => { if (x && x.w) keys.add(nkey(x.w)); }); });
  return { keys, act: at.act }; }
function tcThemes(c) { return tcAs(c, () => { try { return themeDefs(); } catch (e) { return []; } }); }
function tcSrcLabel(c, t) { if (t.src === 'region') { const W = tcWhere(c); return W ? W.region : 'their Atlas region'; }
  if (t.src === 'level') return (TC_LEVELS.find((x) => x[0] === t.lv) || [0, 'Medium'])[1];
  if (t.src === 'theme') { const th = tcThemes(c).find((x) => x.id === t.th); return th ? th.label : 'a theme'; }
  return 'slipped and missed'; }
/* the door's candidates for these choices — {pool} or {wait} */
function tcPool(c, t) { const base = { purpose: 'drill', needDef: true, filter: tcPlain };
  const P = (o) => { try { return nextWords.pool(c, o) || []; } catch (e) { return []; } };
  if (t.src === 'level') return { pool: P(Object.assign({}, base, { level: t.lv, lemmaOnly: true })) };
  if (t.src === 'theme') { const th = tcThemes(c); if (!t.th || !th.some((x) => x.id === t.th)) t.th = th[0] && th[0].id; return { pool: t.th ? P(Object.assign({}, base, { level: 'auto', theme: t.th })) : [] }; }
  if (t.src === 'slip') return { pool: P({ purpose: 'review', filter: tcPlain }) };
  const R = tcRegionKeys(c); if (!R) return { wait: 'Getting the Atlas’s word pools…' };
  const f = (w) => tcPlain(w) && R.keys.has(nkey(w.w));
  return { pool: P(Object.assign({}, base, { level: 'auto', filter: f })).concat(P(Object.assign({}, base, { level: 'hard', filter: f }))) }; }
/* THE PICK IS A FUNCTION OF THE CHOICES: each word ranked by a hash of (source, its setting, size, the New-list counter,
   the word) — the same choices, the same list; New list, the next list; never Math.random */
function tcDraw(c, t) { const P = tcPool(c, t); if (P.wait) return { wait: P.wait, words: [] };
  const seen = new Set(), pool = []; for (const w of P.pool) { const k = nkey(w.w); if (k && !seen.has(k)) { seen.add(k); pool.push(w); } }
  const seed = [t.src, t.src === 'level' ? t.lv : t.src === 'theme' ? t.th : '', t.n, t.seq].join('|');
  const ranked = pool.map((w) => ({ w, h: tcHash(seed + '|' + nkey(w.w)) })).sort((a, b) => a.h - b.h || (a.w.w < b.w.w ? -1 : 1)).slice(0, t.n).map((x) => x.w);
  return { words: ranked.filter((w) => !t.rm[nkey(w.w)]), drawn: ranked.length, pool: pool.length }; }
const tcSlim = (w) => ({ w: w.w, d: w.d || '', s: w.s || '', p: w.p || '', y: w.y || 3, h: w.h || '' });

/* ------------------------------------------------------------------ the chapters, as this child meets them */
function tcChapterState(c, ci, ch, set) {
  const done = window.SB_HW ? SB_HW.chapterDone(c, { ref: ci, t: ch.title }) : '';
  if (set.has(ci)) return { k: 'set', tag: 'Already set' };
  if (done) return { k: 'done', tag: done === 'mastered' ? 'Its words are mastered' : 'Already read' };
  const open = tcAs(c, () => { try { return isConceptUnlocked(ci); } catch (e) { return false; } });
  if (open) return { k: 'open', tag: '' };
  const L = tcAs(c, () => { try { return conceptLock(ci); } catch (e) { return { kind: 'plan' }; } });
  if (L.kind === 'learn') return { k: 'ahead', tag: 'Ahead of ' + (c.name || 'their') + '’s Atlas — assigning opens it for them' };
  return { k: 'plan', tag: ch.adv ? 'Needs the Advanced Pack' : 'Needs the family plan' }; }
function tcChapters(c) { const D = state.conceptData || []; if (!D.length) { try { loadConcepts(); } catch (e) {} return null; }
  const set = new Set((window.SB_HW ? SB_HW.items(c) : []).filter((x) => x.kind === 'concept' && !x.done).map((x) => { const R = SB_HW.chapter(x); return R ? R.ci : +x.ref; }));
  return D.map((ch, ci) => Object.assign({ ci, ch, fam: catGroup(ch.category) }, tcChapterState(c, ci, ch, set))); }
/* the chapters the stops teach: the child's open homework stops, the stops ticked above, and the one they stand at */
function tcSuggested(c, stops) { const t = tcS(), gi = [];
  const add = (g) => { if (g != null && g >= 0 && gi.indexOf(g) < 0) gi.push(g); };
  stops.filter((x) => x.front || t.stops[x.key]).forEach((x) => add(x.gi));
  const T = window.SB_TRAIL; const U = (T && T.honey && T.honey.units || []).concat(T && T.expedition && T.expedition.units || []);
  (window.SB_HW ? SB_HW.items(c) : []).filter((x) => x.kind === 'stop' && !x.chk && !x.done).forEach((x) => { const u = U.find((y) => y.id === x.ref); if (u) add(u.gi); });
  return gi; }

/* ------------------------------------------------------------------ assignments */
function tcDueDate(t) { const S = window.SB_HW; if (!S) return null; return t.due === 'today' ? S.today() : t.due === '3d' ? S.plusDays(3) : t.due === '1w' ? S.plusDays(7) : null; }
function tcDone(msg) { try { flash(msg); } catch (e) {} save(); render(); }

/* ------------------------------------------------------------------ print: a list's answer key, the chapters' own text, a stop's grade-map line */
function tcGradeLine(it) { const G = window.SB_GRADE_MAP; if (!G) { lazyNeed('gradeMap', () => { try { render(); } catch (e) {} }); return 'Loading the grade map…'; }
  let row = null; (G.regions || []).forEach((r) => (r.stops || []).forEach((s) => { if (s.unit === it.ref) row = s; }));
  if (!row) return 'Not mapped to a school level.';
  const lab = (v) => { v = String(v || ''); if (/^not mapped/i.test(v)) return 'not mapped'; const i = v.indexOf(':'); return (i > 0 ? v.slice(0, i) : v).trim(); };
  return 'US ' + lab(row.us) + ' · UK ' + lab(row.uk) + ' · CBSE ' + lab(row.cbse) + ((row.sources || []).length ? ' (sources: ' + row.sources.join(', ') + ')' : ''); }
function tcGuideHTML(ch) { if (!ch) return '<p>This chapter is still loading.</p>';
  return `<div class="tc-guide"><h4>${esc(conceptShort(ch.title))}</h4>${ch.concept ? `<p>${esc(ch.concept)}</p>` : ''}
    ${ch.method ? `<div class="tc-meth">${ch.method}</div>` : ''}
    ${(ch.cards || []).map((cc) => `<p><b>${esc(cc.title || '')}</b><br>${esc(cc.body || '')}</p>`).join('')}
    ${conceptWordsOf(ch).length ? `<p class="tc-ws"><b>Its words:</b> ${conceptWordsOf(ch).slice(0, 24).map((x) => esc(x.w)).join(', ')}</p>` : ''}</div>`; }
function tcListHTML(title, words) {
  return `<section class="tc-sheet"><h3>${esc(title)}</h3>
    <h4>Spelling sheet</h4><p class="tc-note">Read each word aloud, then its meaning; the speller writes it.</p>
    <ol class="tc-lines">${words.map((w) => `<li><span class="tc-blank"></span><span class="tc-mean">${esc(w.d ? maskTxt(w.d, w.w) : '')}</span></li>`).join('')}</ol>
    <h4>Answer key</h4><table class="tc-key"><thead><tr><th>#</th><th>Word</th><th>Say it</th><th>Meaning</th><th>In a sentence</th></tr></thead>
    <tbody>${words.map((w, i) => `<tr><td>${i + 1}</td><td><b>${esc(w.w)}</b></td><td>${esc(w.p || '')}</td><td>${esc(w.d || '')}</td><td>${esc(w.s || '')}</td></tr>`).join('')}</tbody></table></section>`; }
function tcPrintView(c) { const t = tcS(), P = t.print, S = window.SB_HW; let body = '', title = '';
  if (P === 'draft') { const D = tcDraw(c, t); title = tcTitleNow(c, t, D.words.length); body = tcListHTML(title, D.words); }
  else { const its = S ? S.items(c).filter((x) => P === 'all' ? !x.done : String(x.id) === String(P)) : [];
    title = P === 'all' ? 'Homework for ' + (c.name || 'your speller') : (its[0] ? S.title(its[0]) : 'Homework');
    body = its.map((it) => { if (it.kind === 'words') return tcListHTML(S.title(it), it.words || []);
      if (it.kind === 'concept') { const R = S.chapter(it); return `<section class="tc-sheet"><h3>Chapter: ${esc(S.title(it))}</h3>${tcGuideHTML(R && R.ch)}</section>`; }
      const T = window.SB_TRAIL, u = !it.chk && T && (T.honey.units.concat(T.expedition.units || [])).find((x) => x.id === it.ref), ch = u && u.gi >= 0 ? (state.conceptData || [])[u.gi] : null;
      return `<section class="tc-sheet"><h3>Atlas stop: ${esc(S.title(it))}</h3><p class="tc-note">${esc(it.act || '')}${it.act ? ' · ' : ''}Where it sits in school: ${esc(it.chk ? 'a checkpoint quiz (no new words)' : tcGradeLine(it))}</p>${ch ? tcGuideHTML(ch) : ''}</section>`; }).join('') || '<p>Nothing open to print.</p>'; }
  return `<div class="tc-print" data-tc-print="${esc(String(P))}">
    <div class="tc-noprint tc-pbar"><button class="tc-btn" data-act="tcPrintBack">${tcIc('arrowLeft', 16)} Back to the Corner</button><button class="tc-btn on" data-act="tcPrintGo">${tcIc('print', 16)} Print</button></div>
    <h2 class="tc-ph">${esc(title)}</h2><p class="tc-note">${esc((c.name || 'Speller') + ' · Ages ' + ageBandOf(c).n + ' · set in the Teacher’s Corner on this device')}</p>${body}</div>`; }

/* ------------------------------------------------------------------ the screen */
const tcIc = (n, s) => { try { return iconSVG(n, s || 18, 2.2); } catch (e) { return ''; } };
function tcTitleNow(c, t, n) { return 'Words: ' + tcSrcLabel(c, t) + ', ' + n; }
function tcCss() { if (document.getElementById('tc-css')) return; const st = document.createElement('style'); st.id = 'tc-css'; st.textContent = `
.tc-page{max-width:880px;margin:0 auto}
.tc-quiet{margin:-2px 0 14px;font-size:13px;color:var(--muted);line-height:1.5}
.tc-kids{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 14px}
.tc-kid{display:inline-flex;align-items:center;gap:9px;min-height:52px;padding:4px 14px 4px 6px;border-radius:999px;border:1px solid var(--line);background:var(--surface2);color:var(--ink,var(--text));font-weight:800;font-size:14.5px;cursor:pointer}
.tc-kid[aria-pressed="true"]{background:var(--paper,var(--bg2));border:2px solid var(--accent)}
.tc-kav{width:40px;height:40px;border-radius:50%;overflow:hidden;display:grid;place-items:center;background:var(--paper,var(--bg2));line-height:0}
.tc-kav>svg,.tc-kav>img{width:100%;height:100%;display:block}
.tc-ks{display:block;font-size:12px;font-weight:700;color:var(--muted)}
.tc-card{padding:16px 18px;margin:0 0 14px}
.tc-h{display:flex;align-items:center;gap:8px;margin:0 0 10px;font-family:var(--display);font-weight:800;font-size:17px;color:var(--ink,var(--text))}
.tc-h .tc-n{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:50%;background:var(--chip);color:var(--accent);font-size:13px}
.tc-where{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}
.tc-box{background:var(--surface2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;min-width:0}
.tc-bl{font-size:11.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.tc-bv{font-family:var(--display);font-weight:800;font-size:16px;margin:3px 0 2px;color:var(--ink,var(--text))}
.tc-bs{font-size:12.5px;color:var(--muted);line-height:1.45}
.tc-objs{margin:10px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:5px}
.tc-objs li{font-size:13px;line-height:1.45;color:var(--ink,var(--text))}
.tc-tag{display:inline-flex;align-items:center;gap:4px;padding:2px 9px;border-radius:999px;font-size:12px;font-weight:800;background:var(--surface);border:1px solid var(--line);color:var(--ink,var(--text))}
.tc-tag.ok{background:color-mix(in srgb,var(--good) 16%,var(--paper,var(--bg2)))}
.tc-tag.ahead{background:var(--chip);border-style:dashed;color:var(--ink,var(--text))}
.tc-tag.plan{background:var(--surface2);color:var(--ink,var(--text))}
.tc-wchip{display:inline-block;font-family:var(--mono,monospace);font-size:12.5px;font-weight:700;padding:3px 8px;border-radius:6px;background:var(--paper,var(--bg2));border:1px solid var(--line);margin:3px 4px 0 0;color:var(--ink,var(--text))}
.tc-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:0 0 10px}
.tc-rl{font-size:12.5px;font-weight:800;color:var(--muted);min-width:64px}
.tc-chip{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 14px;border-radius:999px;border:1px solid var(--line);background:var(--surface2);color:var(--ink,var(--text));font-weight:800;font-size:13.5px;cursor:pointer}
.tc-chip[aria-pressed="true"]{background:var(--paper,var(--bg2));border:2px solid var(--accent)}
.tc-sel{min-height:44px;padding:0 12px;border-radius:12px;border:1px solid var(--line);background:var(--paper,var(--bg2));color:var(--ink,var(--text));font-weight:700;font-size:14px;max-width:100%}
.tc-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:44px;padding:0 16px;border-radius:12px;border:1px solid var(--line);background:var(--surface2);color:var(--ink,var(--text));font-weight:800;font-size:14px;cursor:pointer}
.tc-btn.on{border:2px solid var(--accent);background:var(--paper,var(--bg2))}
.tc-btn[disabled]{opacity:.55;cursor:not-allowed}
.tc-words{display:flex;flex-direction:column;gap:6px;margin:6px 0 12px}
.tc-word{display:flex;align-items:center;gap:10px;padding:6px 6px 6px 12px;border-radius:12px;background:var(--surface2);border:1px solid var(--line)}
.tc-ww{flex:1;min-width:0;font-size:13.5px;line-height:1.4;color:var(--ink,var(--text))}
.tc-ww b{font-family:var(--mono,monospace);font-size:14px}
.tc-x{flex:none;width:44px;height:44px;border-radius:10px;display:grid;place-items:center;border:1px solid var(--line);background:var(--paper,var(--bg2));color:var(--ink,var(--text));cursor:pointer}
.tc-pick{display:flex;flex-direction:column;gap:6px;margin:4px 0 12px}
.tc-opt{display:flex;align-items:center;gap:10px;width:100%;min-height:48px;padding:6px 12px;border-radius:12px;border:1px solid var(--line);background:var(--surface2);color:var(--ink,var(--text));text-align:left;cursor:pointer;font-size:14px}
.tc-opt[aria-pressed="true"]{background:var(--paper,var(--bg2));border:2px solid var(--accent)}
.tc-opt[disabled]{cursor:default;opacity:.8}
.tc-box2{flex:none;width:22px;height:22px;border-radius:6px;border:2px solid var(--muted);display:grid;place-items:center}
.tc-opt[aria-pressed="true"] .tc-box2{border-color:var(--accent);background:var(--accent);color:var(--paper,#fff)}
.tc-ot{flex:1;min-width:0}.tc-ot b{display:block;font-weight:800}.tc-ot span{display:block;font-size:12.5px;color:var(--muted);margin-top:1px}
.tc-fam{border:1px solid var(--line);border-radius:12px;margin:0 0 8px;background:var(--surface)}
.tc-famb{width:100%;cursor:pointer;min-height:44px;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 12px;border:0;background:transparent;font-weight:800;font-size:14px;color:var(--ink,var(--text));text-align:left;border-radius:12px}
.tc-fam .tc-pick{padding:0 10px 10px}
.tc-hw{display:flex;flex-direction:column;gap:6px}
.tc-hwrow{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 10px;border-radius:12px;background:var(--surface2);border:1px solid var(--line)}
.tc-hwt{flex:1 1 200px;min-width:0;font-size:13.5px;line-height:1.4;color:var(--ink,var(--text))}
.tc-hwt span{display:block;font-size:12.5px;color:var(--muted)}
.tc-acts{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px}
.tc-print{max-width:900px;margin:0 auto;color:var(--ink,var(--text))}
.tc-pbar{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 14px}
.tc-ph{font-family:var(--display);font-size:24px;margin:0 0 2px}
.tc-note{font-size:13px;color:var(--muted);margin:0 0 10px;line-height:1.5}
.tc-sheet{border-top:2px solid var(--line);padding-top:12px;margin-top:16px}
.tc-sheet h3{font-family:var(--display);font-size:19px;margin:0 0 8px}.tc-sheet h4{font-size:14px;margin:12px 0 6px}
.tc-lines{margin:0;padding-left:26px}.tc-lines li{margin:0 0 12px;font-size:13.5px;line-height:1.5}
.tc-blank{display:inline-block;width:200px;max-width:45%;border-bottom:1.5px solid currentColor;margin-right:12px;height:1.2em;vertical-align:bottom}
.tc-key{width:100%;border-collapse:collapse;font-size:12.5px}.tc-key th,.tc-key td{border:1px solid var(--line);padding:5px 7px;text-align:left;vertical-align:top}
.tc-guide h4{font-size:15px;margin:6px 0}.tc-guide p,.tc-meth{font-size:13.5px;line-height:1.55;margin:0 0 8px}.tc-meth{white-space:pre-line}
@media (max-width:560px){.tc-card{padding:14px}.tc-rl{min-width:0;flex-basis:100%}.tc-key{font-size:11.5px}}
@media print{
  body:has(.tc-print) .sb-header-sticky,body:has(.tc-print) .sb-tabbar,body:has(.tc-print) .tc-noprint,body:has(.tc-print) .sb-demo-bar{display:none!important}
  body:has(.tc-print),body:has(.tc-print) #root{background:#fff!important;color:#000!important}
  body:has(.tc-print) .sb-content{max-width:none!important;padding:0!important}
  .tc-print,.tc-print *{color:#000!important;background:transparent!important;box-shadow:none!important}
  .tc-sheet{break-inside:auto}.tc-key tr{break-inside:avoid}
}`;
  document.head.appendChild(st); }

function tcLockedView() {
  return `<div class="tc-page">${pageHead('Teacher’s Corner', '', '', null, 'goHome', 'Home', null, tcIc('users', 20))}
    <div class="sb-card tc-card" data-tc-locked><p style="margin:0 0 12px">The Teacher’s Corner is for the grown-up who sets homework. It needs the grown-up PIN.</p>
    <button class="tc-btn on" data-act="openTeacher">${tcIc('lock', 16)} Enter the grown-up PIN</button></div></div>`; }
function tcKidsHTML(t) { const ks = state.children || [];
  return `<div class="tc-kids" role="group" aria-label="Choose a speller">${ks.map((k, i) => `<button class="tc-kid" data-act="tcKid" data-arg="${i}" aria-pressed="${i === t.k ? 'true' : 'false'}">
      <span class="tc-kav" aria-hidden="true">${(() => { try { return avatarSVG(k.avatar || 'bizzy', 40); } catch (e) { return ''; } })()}</span>
      <span>${esc(k.name || 'Speller')}<span class="tc-ks">Ages ${esc(ageBandOf(k).n)}</span></span></button>`).join('')}</div>`; }
function tcWhereHTML(c) { const W = tcWhere(c); const B = (() => { try { return SB_BAND.child(c); } catch (e) { return null; } })();
  const due = (() => { try { return homeDueWords(c); } catch (e) { return []; } })(); const lvl = (() => { try { return SB_ONE_LEVEL(c).label; } catch (e) { return ''; } })();
  let objs = '';
  try { if (W && window.SB_OBJ) { const L = SB_OBJ.list().filter((o) => o.act === W.act), ev = SB_OBJ.evFor(c);
    objs = L.length ? `<ul class="tc-objs" aria-label="What ${escA(c.name || 'they')} can do in this region">${L.map((o) => { const e = ev && ev[o.id];
      const tag = !e ? '<span class="tc-tag">evidence loading</span>' : e.status === 'secure' ? `<span class="tc-tag ok">${tcIc('check', 12)} Secure</span>` : e.status === 'started' ? '<span class="tc-tag">On the way</span>' : '<span class="tc-tag">Not started</span>';
      return `<li data-tc-obj="${escA(o.id)}">${tag} ${esc(o.can)}${e && e.mastered ? ` <span class="tc-bs">— ${e.mastered} mastered</span>` : ''}</li>`; }).join('')}</ul>` : ''; } } catch (e) {}
  return `<section class="sb-card tc-card" data-tc-where aria-label="Where ${escA(c.name || 'they')} is">
    <h3 class="tc-h">${tcIc('steps', 18)} Where ${esc(c.name || 'they')} is</h3>
    <div class="tc-where">
      <div class="tc-box"><div class="tc-bl">Word Atlas</div><div class="tc-bv" data-tc-region>${esc(W ? W.region : 'Not started')}</div>
        <div class="tc-bs">${W ? (W.all ? esc(W.title) + '.' : 'Next: <b>' + esc(W.title) + '</b> — stop ' + W.stop + ' of ' + W.stops + ' here, tier ' + W.lap + '.') : 'The Atlas is still loading.'}</div></div>
      <div class="tc-box"><div class="tc-bl">Word band</div><div class="tc-bv" data-tc-band="${B ? B.band : ''}">${B ? 'Band ' + B.band : '—'}</div>
        <div class="tc-bs">${B ? 'Words for ages ' + esc(TC_BAND_AGES[B.band] || '') + '. ' : ''}${lvl ? esc(lvl) + '.' : ''}</div></div>
      <div class="tc-box"><div class="tc-bl">Due again</div><div class="tc-bv" data-tc-due="${due.length}">${due.length ? due.length + ' word' + (due.length === 1 ? '' : 's') : 'None'}</div>
        <div class="tc-bs">${due.length ? 'Slipped or missed on an earlier day: ' + due.slice(0, 8).map((w) => `<span class="tc-wchip">${esc(w)}</span>`).join('') : 'Nothing slipped is waiting.'}</div></div>
    </div>${objs}</section>`; }
function tcWordsHTML(c, t) { const D = tcDraw(c, t), th = t.src === 'theme' ? tcThemes(c) : [];
  const chip = (act, arg, on, label, ic) => `<button class="tc-chip" data-act="${act}" data-arg="${escA(String(arg))}" aria-pressed="${on ? 'true' : 'false'}">${ic ? tcIc(ic, 15) : ''}${label}</button>`;
  const title = tcTitleNow(c, t, D.words.length);
  const prm = t.src === 'level' ? `<div class="tc-row" role="group" aria-label="Level"><span class="tc-rl">Level</span>${TC_LEVELS.map(([k, l]) => chip('tcLv', k, t.lv === k, l)).join('')}</div>`
    : t.src === 'theme' ? `<div class="tc-row"><label class="tc-rl" for="tc-theme">Theme</label><select id="tc-theme" class="tc-sel" data-chg="tcTheme">${th.map((x) => `<option value="${escA(x.id)}"${x.id === t.th ? ' selected' : ''}>${esc(x.label)}</option>`).join('')}</select></div>`
    : t.src === 'region' ? `<p class="tc-quiet" style="margin:0 0 10px">The words of ${esc(tcSrcLabel(c, t))}: the stops ${esc(c.name || 'they')} walked there and the one they are at.</p>`
    : `<p class="tc-quiet" style="margin:0 0 10px">Words ${esc(c.name || 'they')} missed, or spelled right once and then slipped.</p>`;
  const list = D.wait ? `<p class="tc-quiet" role="status">${esc(D.wait)}</p>`
    : D.words.length ? `<div class="tc-words" data-tc-list="${escA(D.words.map((w) => w.w).join(','))}">${D.words.map((w) => `<div class="tc-word"><span class="tc-ww"><b>${esc(w.w)}</b>${w.d ? ' — ' + trunc(w.d, 96) : ''}</span>
        <button class="tc-x" data-act="tcDrop" data-arg="${escA(w.w)}" aria-label="${escA('Remove ' + w.w + ' from the list')}">${tcIc('close', 16)}</button></div>`).join('')}</div>`
    : `<p class="tc-quiet" role="status">${t.src === 'slip' ? 'Nothing slipped or missed to practise — a good sign.' : 'No words fit these choices yet.'}</p>`;
  return `<section class="sb-card tc-card" data-tc-words aria-label="A practice word list">
    <h3 class="tc-h"><span class="tc-n">1</span> A practice word list</h3>
    <div class="tc-row" role="group" aria-label="Where the words come from"><span class="tc-rl">From</span>${TC_SRCS.map(([k, l, ic]) => chip('tcSrc', k, t.src === k, l, ic)).join('')}</div>
    ${prm}
    <div class="tc-row" role="group" aria-label="How many words"><span class="tc-rl">Words</span>${TC_SIZES.map((n) => chip('tcSize', n, t.n === n, String(n))).join('')}
      <button class="tc-chip" data-act="tcNew">${tcIc('retry', 15)} New list</button></div>
    <p class="tc-bs" style="margin:0 0 4px"><b data-tc-title>${esc(title)}</b>${D.pool != null ? ` · picked from ${D.pool} word${D.pool === 1 ? '' : 's'} that fit ${esc(c.name || 'them')}` : ''}</p>
    ${list}
    <div class="tc-acts"><button class="tc-btn on" data-act="tcAssignWords"${D.words.length ? '' : ' disabled'}>${tcIc('check', 16)} Set this list for ${esc(c.name || 'them')}</button>
      <button class="tc-btn" data-act="tcPrint" data-arg="draft"${D.words.length ? '' : ' disabled'}>${tcIc('print', 16)} Print it with the answer key</button></div></section>`; }
function tcStopsHTML(c, t, stops) { const S = window.SB_HW, set = new Set((S ? S.items(c) : []).filter((x) => x.kind === 'stop' && !x.done).map((x) => (x.crs || 'honey') + '|' + (x.chk ? 'chk:' : '') + x.ref));
  const nx = tcNextAfter(c), n = stops.filter((x) => t.stops[x.key] && !set.has(x.key)).length;
  return `<section class="sb-card tc-card" data-tc-stops aria-label="Atlas stops">
    <h3 class="tc-h"><span class="tc-n">2</span> Atlas stops</h3>
    <p class="tc-quiet" style="margin:0 0 8px">From where ${esc(c.name || 'they')} stands — only stops already open to them. ${nx ? 'The road opens one stop at a time: next comes ' + esc(nx) + ', once the stop before it is walked.' : ''}</p>
    ${stops.length ? `<div class="tc-pick">${stops.map((x) => { const on = !!t.stops[x.key], already = set.has(x.key);
      return `<button class="tc-opt" data-act="tcStop" data-arg="${escA(x.key)}" data-tc-stop="${escA(x.ref)}" aria-pressed="${on && !already ? 'true' : 'false'}"${already ? ' disabled' : ''}>
        <span class="tc-box2" aria-hidden="true">${on && !already ? tcIc('check', 13) : ''}</span>
        <span class="tc-ot"><b>${esc(tcShort(x.title))}</b><span>${esc(x.region)}${x.front ? ' · where ' + esc(c.name || 'they') + ' is now' : ' · open, not walked yet'}${x.chk ? ' · a checkpoint quiz' : ''}</span></span>
        ${already ? '<span class="tc-tag">Already set</span>' : ''}</button>`; }).join('')}</div>`
      : `<p class="tc-quiet" role="status">Every open stop is walked — the next one opens on the Atlas as ${esc(c.name || 'they')} goes.</p>`}
    <div class="tc-acts"><button class="tc-btn on" data-act="tcAssignStops"${n ? '' : ' disabled'}>${tcIc('check', 16)} Set ${n || ''} stop${n === 1 ? '' : 's'} for ${esc(c.name || 'them')}</button></div></section>`; }
function tcChOpt(c, t, x) { const can = x.k === 'open' || x.k === 'ahead', on = can && !!t.chs[x.ci];
  return `<button class="tc-opt" data-act="tcCh" data-arg="${x.ci}" data-tc-ch="${x.ci}" data-tc-state="${x.k}" aria-pressed="${on ? 'true' : 'false'}"${can ? '' : ' disabled'}>
    <span class="tc-box2" aria-hidden="true">${on ? tcIc('check', 13) : ''}</span>
    <span class="tc-ot"><b>${esc(conceptShort(x.ch.title))}</b><span>${esc(String(x.ch.category || '').split(' — ')[0])}</span></span>
    ${x.tag ? `<span class="tc-tag ${x.k === 'ahead' ? 'ahead' : x.k === 'plan' ? 'plan' : x.k === 'done' ? 'ok' : ''}">${x.k === 'plan' ? tcIc('lock', 12) : x.k === 'ahead' ? tcIc('steps', 12) : ''}${esc(x.tag)}</span>` : ''}</button>`; }
function tcChaptersHTML(c, t, stops) { const L = tcChapters(c);
  if (!L) return `<section class="sb-card tc-card" data-tc-chs><h3 class="tc-h"><span class="tc-n">3</span> Chapters</h3><p class="tc-quiet" role="status">Getting the chapters…</p></section>`;
  const sug = tcSuggested(c, stops), top = sug.map((g) => L[g]).filter(Boolean), fams = {};
  L.forEach((x) => { if (sug.indexOf(x.ci) < 0) (fams[x.fam] = fams[x.fam] || []).push(x); });
  const n = L.filter((x) => (x.k === 'open' || x.k === 'ahead') && t.chs[x.ci]).length;
  return `<section class="sb-card tc-card" data-tc-chs aria-label="Chapters">
    <h3 class="tc-h"><span class="tc-n">3</span> Chapters</h3>
    <p class="tc-quiet" style="margin:0 0 8px">The chapters the stops teach come first. A chapter ahead of ${esc(c.name || 'their')}’s Atlas can be set too — it opens for ${esc(c.name || 'them')} alone. A chapter that comes with a plan stays with the plan.</p>
    ${top.length ? `<div class="tc-pick" data-tc-sug>${top.map((x) => tcChOpt(c, t, x)).join('')}</div>` : ''}
    ${Object.keys(fams).map((f) => { const op = !!(t.fams && t.fams[f]); return `<div class="tc-fam" data-tc-fam="${escA(f)}"><button class="tc-famb" data-act="tcFam" data-arg="${escA(f)}" aria-expanded="${op ? 'true' : 'false'}"><span>${esc(f)} <span class="tc-bs" style="margin-left:6px">(${fams[f].length})</span></span><span aria-hidden="true">${op ? '−' : '+'}</span></button>${op ? `<div class="tc-pick">${fams[f].map((x) => tcChOpt(c, t, x)).join('')}</div>` : ''}</div>`; }).join('')}
    <div class="tc-acts"><button class="tc-btn on" data-act="tcAssignChs"${n ? '' : ' disabled'}>${tcIc('check', 16)} Set ${n || ''} chapter${n === 1 ? '' : 's'} for ${esc(c.name || 'them')}</button></div></section>`; }
function tcHomeworkHTML(c, t) { const S = window.SB_HW; if (!S) return ''; const its = S.items(c); S.sync(c);
  const open = its.filter((x) => !x.done), done = its.filter((x) => x.done);
  return `<section class="sb-card tc-card" data-tc-hw aria-label="${escA('Homework for ' + (c.name || 'them'))}">
    <h3 class="tc-h">${tcIc('pencil', 18)} Homework for ${esc(c.name || 'them')}</h3>
    <div class="tc-row" role="group" aria-label="When what you set next is due"><span class="tc-rl">Due</span>${TC_DUES.map(([k, l]) => `<button class="tc-chip" data-act="tcDue" data-arg="${k}" aria-pressed="${t.due === k ? 'true' : 'false'}">${l}</button>`).join('')}<span class="tc-bs">for what you set next</span></div>
    ${open.length ? `<div class="tc-hw">${open.map((it) => `<div class="tc-hwrow" data-tc-item="${it.id}" data-kind="${it.kind}"><span class="tc-hwt">${esc(S.title(it))}<span>${({ words: 'Word list', stop: it.chk ? 'Checkpoint' : 'Atlas stop', concept: 'Chapter' })[it.kind]} · ${esc(S.dueTxt(it))} · ${esc(S.result(c, it))}${it.grant ? ' · opened ahead of the Atlas' : ''}</span></span>
        ${it.kind === 'words' ? `<button class="tc-btn" data-act="tcPrint" data-arg="${it.id}" aria-label="${escA('Print ' + S.title(it) + ' with its answer key')}">${tcIc('print', 15)} Print</button>` : ''}
        <button class="tc-btn" data-act="tcRemove" data-arg="${it.id}" aria-label="${escA('Remove ' + S.title(it))}">${tcIc('close', 15)} Remove</button></div>`).join('')}</div>`
      : `<p class="tc-quiet" style="margin:0">Nothing open. Choose from the three below.</p>`}
    <div class="tc-acts">${open.length ? `<button class="tc-btn" data-act="tcPrint" data-arg="all">${tcIc('print', 15)} Print all of it</button>` : ''}
      ${done.length ? `<span class="tc-bs">${done.length} finished — the report card in the Parent Zone has the details.</span>` : ''}</div></section>`; }
function viewTeacher() { tcCss();
  if (!state.teachOk) return tcLockedView();
  const t = tcS(), c = tcKid();
  if (t.print) return tcPrintView(c);
  const stops = tcOpenStops(c);
  return `<div class="tc-page" data-tc-kid="${t.k}">${pageHead('Teacher’s Corner', '', 'For the grown-up guiding the spellers: set word lists, Atlas stops and chapters as homework.', null, 'teachBack', 'Parent zone', null, tcIc('users', 20))}
    <p class="tc-quiet">The class here is the spellers on this device. Setting homework on another device needs the cloud, which the app does not have yet.</p>
    ${tcKidsHTML(t)}${tcWhereHTML(c)}${tcHomeworkHTML(c, t)}${tcWordsHTML(c, t)}${tcStopsHTML(c, t, stops)}${tcChaptersHTML(c, t, stops)}</div>`; }

/* the focus stays on the control a key pressed (the drills' global Enter lives on other screens; this one has none) */
function tcKeep(fn) { return function (arg) { let k = null; try { const a = document.activeElement; if (a && a.closest && a.closest('.tc-page,.tc-print')) k = [a.getAttribute('data-act'), a.getAttribute('data-arg'), a.getAttribute('data-chg')]; } catch (e) {}
  const r = fn.apply(this, arguments);
  if (k) try { const q = k[2] ? `[data-chg="${k[2]}"]` : k[0] ? `[data-act="${k[0]}"]` + (k[1] != null ? `[data-arg="${CSS.escape(k[1])}"]` : '') : null;
    const el = q && (document.querySelector(q) || (k[0] ? document.querySelector(`.tc-page [data-act="${k[0]}"]:not([disabled])`) : null)); if (el) el.focus({ preventScroll: true }); } catch (e) {}
  return r; }; }
const tcGuard = () => state.nav === 'teacher' && state.teachOk;   /* every action refuses outside the PIN'd screen */
Object.assign(app, {
  teachBack: () => { state.tc = null; if (state.teachOk) { state.progTab = 'parent'; set({ nav: 'progress', screen: 'app' }); } else app.goHome(); },
  tcKid: tcKeep((i) => { if (!tcGuard()) return; const t = tcS(); i = +i; if (!(state.children || [])[i] || i === t.k) return; t.k = i; tcReset(t); render(); }),
  tcSrc: tcKeep((s) => { if (!tcGuard() || !TC_SRCS.some((x) => x[0] === s)) return; const t = tcS(); t.src = s; t.seq = 0; t.rm = {}; render(); }),
  tcLv: tcKeep((l) => { if (!tcGuard() || !TC_LEVELS.some((x) => x[0] === l)) return; const t = tcS(); t.lv = l; t.seq = 0; t.rm = {}; render(); }),
  tcTheme: tcKeep((id) => { if (!tcGuard()) return; const t = tcS(); if (!tcThemes(tcKid()).some((x) => x.id === id)) return; t.th = id; t.seq = 0; t.rm = {}; render(); }),
  tcSize: tcKeep((n) => { if (!tcGuard()) return; n = +n; if (TC_SIZES.indexOf(n) < 0) return; const t = tcS(); t.n = n; t.rm = {}; render(); }),
  tcNew: tcKeep(() => { if (!tcGuard()) return; const t = tcS(); t.seq = (t.seq | 0) + 1; t.rm = {}; render(); }),
  tcDrop: tcKeep((w) => { if (!tcGuard()) return; tcS().rm[nkey(w)] = 1; render(); }),
  tcDue: tcKeep((d) => { if (!tcGuard() || !TC_DUES.some((x) => x[0] === d)) return; tcS().due = d; render(); }),
  tcAssignWords: tcKeep(() => { if (!tcGuard() || !window.SB_HW) return; const t = tcS(), c = tcKid(), D = tcDraw(c, t); if (!D.words.length) return;
    SB_HW.add(c, { kind: 'words', ref: null, words: D.words.map(tcSlim), t: tcTitleNow(c, t, D.words.length), src: { k: t.src, p: t.src === 'level' ? t.lv : t.src === 'theme' ? t.th : '', n: t.n, seq: t.seq }, due: tcDueDate(t), res: { right: 0, of: D.words.length } });
    t.seq = (t.seq | 0) + 1; t.rm = {}; tcDone('Set for ' + (c.name || 'them') + ': ' + D.words.length + ' words'); }),
  tcStop: tcKeep((key) => { if (!tcGuard()) return; const t = tcS(); if (!tcOpenStops(tcKid()).some((x) => x.key === key)) return; t.stops[key] = !t.stops[key]; render(); }),
  tcAssignStops: tcKeep(() => { if (!tcGuard() || !window.SB_HW) return; const t = tcS(), c = tcKid(); let n = 0;
    /* only what is open to the child NOW is set — read again here, so a stale tick cannot set a locked stop */
    const set = new Set(SB_HW.items(c).filter((x) => x.kind === 'stop' && !x.done).map((x) => (x.crs || 'honey') + '|' + (x.chk ? 'chk:' : '') + x.ref));
    tcOpenStops(c).forEach((x) => { if (!t.stops[x.key] || set.has(x.key)) return; n++;
      SB_HW.add(c, { kind: 'stop', ref: x.ref, chk: x.chk ? 1 : 0, crs: x.crs, lap: x.lap, act: x.region, t: x.title, due: tcDueDate(t) }); });
    t.stops = {}; if (n) tcDone('Set for ' + (c.name || 'them') + ': ' + n + ' stop' + (n === 1 ? '' : 's')); else render(); }),
  tcFam: tcKeep((f) => { if (!tcGuard()) return; const t = tcS(); t.fams = t.fams || {}; t.fams[f] = !t.fams[f]; render(); }),
  tcCh: tcKeep((ci) => { if (!tcGuard()) return; const t = tcS(); ci = +ci; t.chs[ci] = !t.chs[ci]; render(); }),
  tcAssignChs: tcKeep(() => { if (!tcGuard() || !window.SB_HW) return; const t = tcS(), c = tcKid(), L = tcChapters(c) || []; let n = 0;
    /* a plan lock is never set as homework: the state is read again here, not trusted from the tick */
    L.forEach((x) => { if (!t.chs[x.ci] || !(x.k === 'open' || x.k === 'ahead')) return; n++;
      SB_HW.add(c, Object.assign({ kind: 'concept', ref: x.ci, t: x.ch.title, adv: x.ch.adv ? 1 : 0, due: tcDueDate(t) }, x.k === 'ahead' ? { grant: 1 } : {})); });
    t.chs = {}; if (n) tcDone('Set for ' + (c.name || 'them') + ': ' + n + ' chapter' + (n === 1 ? '' : 's')); else render(); }),
  tcRemove: tcKeep((id) => { if (!tcGuard() || !window.SB_HW) return; const c = tcKid(); if (SB_HW.remove(c, id)) tcDone('Removed'); }),
  tcPrint: (what) => { if (!tcGuard()) return; const t = tcS(); t.print = String(what || 'draft'); lazyNeed('gradeMap'); render(); try { window.scrollTo(0, 0); } catch (e) {}
    setTimeout(() => { try { const b = document.querySelector('[data-act="tcPrintGo"]'); if (b) b.focus({ preventScroll: true }); } catch (e) {} }, 30); },
  tcPrintGo: () => { if (!tcGuard()) return; try { window.print(); } catch (e) {} },
  tcPrintBack: () => { if (!tcGuard()) return; tcS().print = null; render(); setTimeout(() => { try { const b = document.querySelector('.tc-page [data-act="tcPrint"]'); if (b) b.focus({ preventScroll: true }); } catch (e) {} }, 30); }
});
