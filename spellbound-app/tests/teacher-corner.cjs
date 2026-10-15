/* THE TEACHER'S CORNER (owner, 15 Oct 2026: "build the teacher's corner … for a teacher to guide the students … generate mock
   word lists and assign to the student … assign tasks to complete based on where they are … also assign concepts to complete";
   the same day: "teacher can assign concepts beyond the lock too"). app3-teach.js; the record is app3-homework.js's SB_HW.
   Driven for real, in a household of two (Ahana, 8–10, at the Meadow's third stop; Ravi, 11–13, placed at the Meadow's sixth):
     PIN        the Corner shows nothing of itself without the grown-up PIN: typed as an address (#/teacher → the PIN dialog,
                no Corner), written straight into state.nav (a locked card, no Corner), a wrong PIN (still none), the right one
                (the Corner); by TAP through the lock → the PIN → the Parent Zone's door (no second PIN), and through Settings →
                Grown-ups; and the pass ENDS when the screen is left (state.nav written back: the locked card again)
     WORDS      a generated list comes ONLY from the word door — every word on it was handed back by nextWords.pool (spied);
                the same choices give the same list (size changed and back, source changed and back, the draft thrown away);
                "New list" gives another list, the same one every time it is pressed from the same place; removing a word by
                tap takes it off and the generated title counts what is left ("Words: The Meadow, 14")
     ASSIGN     a list, a stop and two chapters assigned to Ahana land on Ahana's record, in the household save — Ravi's record
                untouched; a due chip sets the due date
     STOPS      the suggestions start at the child's own frontier (trail-home.js's reading, for EACH child), offer only stops
                open to them and not walked, and never the stop past the furthest open one — not even by calling the action
     CHAPTERS   a chapter ahead of the child's Atlas is offered and marked "Ahead of …"; assigning it records a grant and opens
                it for THAT child — isConceptUnlocked, and the library's own opener (openConcept) — and NOT for the sibling; a
                plan-locked chapter (the Advanced Pack, not on this household) is shown as needing the plan, disabled, and cannot
                be assigned even by calling the actions
     PRINT      the print view of the generated list carries the answer key (word, respelling, meaning, sentence, one row a
                word); the whole homework prints the chapter's own text and the stop's grade-map line; Print calls
                window.print once; printed, the app's chrome is hidden
     INPUT      a keyboard-only run (Tab and Enter from Home: the lock, the PIN typed, the Parent Zone's door, Ravi, a level
                list, Set) and a touch-only run on a 390px phone (taps only: the lock, the keypad, the door, a stop, a chapter
                ahead of the Atlas inside its closed family) both assign
     LOOKS      axe (WCAG 2.1 A+AA) finds nothing on the Corner in light and dusk; no page errors
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/teacher-corner.cjs        (SB_ROOT=<a scratch root> to point it elsewhere)
   Proved by breaking (15 Oct 2026; each a scratch root of symlinks with ONE file replaced, SB_ROOT pointed at it, the tree never
   touched; every one watched to fail):
     app3.js openTeacher opening without the PIN → 3 fail (the address, the written nav, the wrong PIN)
     app3.js viewApp no longer ending the pass → 1 fails ("left for Home … locked again")
     app3-teach.js the list ranked by Math.random → 2 fail (same choices, New list)
     app3-teach.js the region list read from SB_DATA.nsf → 2 fail (nextWords.pool called 0×) — and word-door.cjs names tcPool
     app3-teach.js the reach check dropped from the stops → 3 fail (u4, meadow:4, u5… offered; the locked u4 set by the action)
     app3-teach.js a plan-locked chapter let through the assign action → 1 fails
     app3.js isConceptUnlocked ignoring the grant → 2 fail; the grant read off every child → 2 fail (Ravi opens it)
     app3.js the grant read before the Advanced Pack check → 1 fails (the forged grant opens the pack's chapter)
     app3-teach.js the answer key without meaning and sentence → 1 fails
     app3-teach.js a list written onto the active child, not the chosen one → 1 fails (the keyboard run: Ravi has nothing) */
'use strict';
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const { booted, until } = require('./lib/wait.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
const URL = 'file://' + ROOT + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; return b; };
const AXE = (() => { for (const p of [path.join(ROOT, 'node_modules', 'axe-core', 'axe.min.js'), path.join(__dirname, '..', 'node_modules', 'axe-core', 'axe.min.js')]) if (fs.existsSync(p)) return p;
  try { return require.resolve('axe-core/axe.min.js'); } catch (e) { return null; } })();
const D = 864e5, NOW = Date.now();
const KID = (name, extra) => Object.assign({ name, age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 30, lists: { journey: { xp: 20 } }, activeList: 'journey',
  trail: { lap: 1, done: { u1: { 1: 90 }, u2: { 1: 88 } }, chk: {}, seen: {}, st: { 'u1:1': { l: 1, w: 1, p: 90 }, 'u2:1': { l: 1, w: 1, p: 88 } }, elap: 1, edone: {}, echk: {} },
  missed: [{ w: 'island', ts: NOW - 3 * D, n: 1 }] }, extra || {});
const HOUSE = { theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [KID('Ahana'),
  KID('Ravi', { age: 12, ageBand: '11-13', avatar: 'koi', trail: { lap: 1, done: {}, chk: {}, seen: {}, st: {}, elap: 1, edone: {}, echk: {}, start: { u: 'u6', act: 'meadow', pick: 0, rec: 0, n: 12, ok: 8, at: '2026-10-01' } }, missed: [] })] };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  const open = async (vp, mode) => {
    const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: !!vp.m, hasTouch: !!vp.m, deviceScaleFactor: vp.m ? 2 : 1 });
    await ctx.addInitScript((h) => { try { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify(h)); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } } catch (e) {} }, Object.assign({}, HOUSE, { mode: mode || 'light' }));
    const pg = await ctx.newPage(); pg.on('pageerror', (e) => errs.push(e.message));
    await pg.goto(URL); ok(await booted(pg), `${vp.n}: the app boots`);
    await pg.evaluate(() => new Promise((r) => SB_LAZY.need(['atlas', 'scrTeach'], r)));
    await pg.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
    return { ctx, pg }; };
  const corner = (pg) => pg.evaluate(() => !!document.querySelector('.tc-page [data-tc-words]'));
  const settledList = (pg) => until(pg, () => state.nav === 'teacher' && !!document.querySelector('[data-tc-list]'), null, 60000);
  const listNow = (pg) => pg.evaluate(() => { const e = document.querySelector('[data-tc-list]'); return e ? e.dataset.tcList.split(',') : []; });
  const pin = async (pg, digits) => { for (const d of digits) await pg.evaluate((d) => app.pinKey(d), d); };

  /* ================= 1. the PIN, every way in ================= */
  const { ctx, pg } = await open({ n: 'desktop', w: 1280, h: 900 });
  {
    await pg.evaluate(() => { location.hash = '#/teacher'; });
    await until(pg, () => !!state.pinDlg, null, 15000);
    const a = await pg.evaluate(() => ({ dlg: !!state.pinDlg && !!document.querySelector('[data-pin-dlg]'), nav: state.nav, ok: !!state.teachOk }));
    ok(a.dlg && a.nav !== 'teacher' && !a.ok && !(await corner(pg)), `#/teacher typed as an address asks for the PIN and shows nothing of the Corner (nav ${a.nav})`);
    await pg.evaluate(() => app.pinCancel());
    await pg.evaluate(() => { state.nav = 'teacher'; state.screen = 'app'; render(); });
    await until(pg, () => !!document.querySelector('[data-tc-locked]') || !!document.querySelector('.tc-page [data-tc-words]'), null, 30000);
    const w = await pg.evaluate(() => ({ locked: !!document.querySelector('[data-tc-locked]'), btn: !!document.querySelector('[data-tc-locked] [data-act="openTeacher"]') }));
    ok(w.locked && w.btn && !(await corner(pg)), 'state.nav written straight to the Corner draws a locked card (its one button asks for the PIN) and nothing else');
    await pg.evaluate(() => app.goHome());
    await pg.evaluate(() => app.openTeacher()); await pin(pg, '9999');
    ok(!(await corner(pg)) && (await pg.evaluate(() => !!state.pinDlg)), 'a wrong PIN opens nothing');
    await pin(pg, '1234');
    ok(await settledList(pg), 'the right PIN opens the Corner (#/teacher, its list drawn)');
    ok((await pg.evaluate(() => location.hash)) === '#/teacher', 'the Corner has its own address, #/teacher');
    /* the pass ends when the screen is left */
    await pg.evaluate(() => app.goHome()); await until(pg, () => state.nav === 'home');
    await pg.evaluate(() => { state.nav = 'teacher'; render(); });
    ok(await until(pg, () => !!document.querySelector('[data-tc-locked]'), null, 10000) && !(await corner(pg)), 'left for Home, the pass is over: the Corner is locked again');
    /* by tap: the lock → the PIN → the Parent Zone → its door, no second PIN */
    await pg.evaluate(() => app.goHome()); await until(pg, () => state.nav === 'home');
    await pg.click('.sb-fam-lock'); await until(pg, () => !!state.pinDlg);
    for (const d of '1234') await pg.click(`[data-pin-dlg] [data-act="pinKey"][data-arg="${d}"]`);
    await until(pg, () => !!document.querySelector('[data-pz-teach] [data-act="openTeacher"]'), null, 30000);
    await pg.click('[data-pz-teach] [data-act="openTeacher"]');
    ok(await settledList(pg) && !(await pg.evaluate(() => !!state.pinDlg)), 'by tap: the lock, the PIN, the Parent Zone\'s Teacher\'s Corner door — the Corner opens without asking twice');
    /* Settings → Grown-ups → its row */
    await pg.evaluate(() => app.goHome()); await until(pg, () => state.nav === 'home');
    await pg.evaluate(() => app.openSettings()); await until(pg, () => !!document.querySelector('[data-act="setGrownOpen"]'));
    await pg.click('[data-act="setGrownOpen"]'); await pin(pg, '1234');
    await until(pg, () => !!document.querySelector('[data-sec="grownups"] [data-act="openTeacher"]'), null, 10000);
    await pg.click('[data-sec="grownups"] [data-act="openTeacher"]');
    ok(await settledList(pg) && !(await pg.evaluate(() => state.settingsOpen)), 'Settings → Grown-ups (behind the PIN) has a Teacher\'s Corner row, and it opens the Corner');
  }

  /* ================= 2. where Ahana is, and the list from the one word door ================= */
  {
    const W = await pg.evaluate(() => { const n = SB_TRAIL_NEXT(); return { region: document.querySelector('[data-tc-region]').textContent, band: document.querySelector('[data-tc-band]').dataset.tcBand,
      due: +document.querySelector('[data-tc-due]').dataset.tcDue, front: n.title, txt: document.querySelector('[data-tc-where]').innerText, wantBand: SB_BAND.child(active()).band, wantDue: homeDueWords(active()).length,
      objs: document.querySelectorAll('[data-tc-where] [data-tc-obj]').length }; });
    ok(/Meadow/.test(W.region) && W.txt.indexOf(W.front) >= 0 && +W.band === W.wantBand && W.due === W.wantDue && W.objs > 0,
      `where Ahana is: ${W.region}, next "${W.front}", band ${W.band}, ${W.due} word(s) due again, ${W.objs} "I can…" line(s) of her region`);
    /* the door, spied on: what the pool handed back, word by word */
    await pg.evaluate(() => { window.__pool = new Set(); window.__calls = 0; const f = window.nextWords, P = f.pool;
      const g = function () { return f.apply(this, arguments); }; g.pool = function () { window.__calls++; const out = P.apply(this, arguments); (out || []).forEach((w) => window.__pool.add(String(w.w).toLowerCase())); return out; }; window.nextWords = g; render(); });
    await settledList(pg);
    const L1 = await listNow(pg);
    const spy = await pg.evaluate(() => ({ calls: window.__calls, pool: [...window.__pool] }));
    ok(L1.length === 15 && spy.calls > 0 && L1.every((w) => spy.pool.includes(w)), `a 15-word list from Ahana's region, every word handed back by the word door (nextWords.pool called ${spy.calls}×): ${L1.slice(0, 6).join(' ')}…`);
    ok(await pg.evaluate(() => /^Words: The Meadow, 15$/.test(document.querySelector('[data-tc-title]').textContent)), 'its title is generated: "Words: The Meadow, 15"');
    await pg.click('[data-act="tcSize"][data-arg="10"]'); await settledList(pg);
    const L10 = await listNow(pg);
    await pg.click('[data-act="tcSize"][data-arg="15"]'); await settledList(pg);
    const L1b = await listNow(pg);
    await pg.click('[data-act="tcSrc"][data-arg="level"]'); await settledList(pg);
    const Llv = await listNow(pg);
    await pg.click('[data-act="tcSrc"][data-arg="region"]'); await settledList(pg);
    const L1c = await listNow(pg);
    await pg.evaluate(() => { state.tc = null; render(); }); await settledList(pg);
    const L1d = await listNow(pg);
    ok(L10.length === 10 && Llv.join() !== L1.join() && [L1b, L1c, L1d].every((L) => L.join() === L1.join()),
      'the same choices give the same list: size 10 and back, a level list and back, the draft thrown away — the 15 come back, word for word');
    await pg.click('[data-act="tcNew"]'); await settledList(pg);
    const L2 = await listNow(pg);
    await pg.click('[data-act="tcNew"]'); await settledList(pg);
    const L3 = await listNow(pg);
    await pg.evaluate(() => { state.tc = null; render(); }); await settledList(pg);
    await pg.click('[data-act="tcNew"]'); await settledList(pg);
    const L2b = await listNow(pg);
    ok(L2.length === 15 && L2.join() !== L1.join() && L3.join() !== L2.join() && L2b.join() === L2.join(), `"New list" gives another list (${L2.slice(0, 4).join(' ')}…), and the same one again from the same place — a counter, not chance`);
    ok(L2.every((w) => spy.pool.includes(w) || true) && (await pg.evaluate((L) => L.every((w) => window.__pool.has(w)), L2)), 'and its words came through the door too');
    const drop = L2[3];
    await pg.click(`[data-act="tcDrop"][data-arg="${drop}"]`); await settledList(pg);
    const L2r = await listNow(pg);
    const t14 = await pg.evaluate(() => document.querySelector('[data-tc-title]').textContent);
    ok(L2r.length === 14 && !L2r.includes(drop) && L2r.join() === L2.filter((w) => w !== drop).join() && t14 === 'Words: The Meadow, 14', `removing "${drop}" by tap takes it off the list; the title says 14 ("${t14}")`);
    /* assign it, due in three days */
    await pg.click('[data-act="tcDue"][data-arg="3d"]');
    await pg.click('[data-act="tcAssignWords"]');
    const A = await pg.evaluate(() => { const h = state.children[0].hw, it = h && h.items[0]; const saved = JSON.parse(localStorage.getItem('sb_saas_v2')); const d = new Date(); d.setDate(d.getDate() + 3);
      return { n: h ? h.items.length : 0, kind: it && it.kind, words: it ? it.words.map((w) => w.w) : [], t: it && it.t, due: it && it.due, want: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'),
        by: it && it.by, sib: state.children[1].hw, savedA: !!(saved.children[0].hw && saved.children[0].hw.items.length), savedB: saved.children[1].hw, rows: document.querySelectorAll('[data-tc-hw] [data-tc-item]').length }; });
    ok(A.n === 1 && A.kind === 'words' && A.words.join() === L2r.join() && A.t === 'Words: The Meadow, 14' && A.by === 'grown-up' && A.due === A.want,
      `assigned: Ahana's record holds the 14 words, its title, set by the grown-up, due ${A.due}`);
    ok(A.savedA && A.sib === undefined && A.savedB === undefined && A.rows === 1, 'it is in the household save, the Corner lists it under Ahana — and Ravi\'s record is untouched');
  }

  /* ================= 3. Atlas stops: from the frontier, only open ones ================= */
  {
    const S = await pg.evaluate(() => { const F = SB_TRAIL_FRONT(() => window.SB_TRAIL || window.SB_TRAIL_HOME);
      const read = () => { const c = state.children[state.tc.k]; const p = state.trailCourse; state.trailCourse = 'honey';
        try { const s = F.seq(c), rc = F.reach(c), fr = F.frontier(c); const idx = (ref) => s.findIndex((n) => n.kind === 'unit' ? n.u.id === ref : n.id === ref);
          const offered = [...document.querySelectorAll('[data-tc-stop]')].map((e) => e.dataset.tcStop);
          const next = s[rc + 1]; return { offered, idx: offered.map(idx), rc, fr, frRef: s[fr].kind === 'unit' ? s[fr].u.id : s[fr].id, passed: offered.map((r) => F.passedNode(c, s[idx(r)])), nextRef: next && (next.kind === 'unit' ? next.u.id : next.id) }; }
        finally { state.trailCourse = p; } };
      const a = read(); app.tcKid(1); const b2 = read(); app.tcKid(0); return { a, b: b2 }; });
    for (const [who, R] of [['Ahana', S.a], ['Ravi', S.b]]) {
      ok(R.offered.length >= 1 && R.offered[0] === R.frRef && R.idx.every((i) => i >= 0 && i <= R.rc) && !R.passed.some(Boolean) && !R.offered.includes(R.nextRef),
        `${who}: the stops start at their own frontier (${R.frRef}), every one open (index ≤ ${R.rc}) and not walked, never the next locked one (${R.nextRef}): ${R.offered.join(' ')}`);
    }
    ok(S.b.offered.length > 1, `Ravi, placed at the Meadow's sixth stop, is also offered the open stops behind his start line (${S.b.offered.length})`);
    /* a locked stop cannot be set even by calling the actions */
    const L = await pg.evaluate((next) => { app.tcStop('honey|' + next); app.tcAssignStops(); return state.children[0].hw.items.filter((x) => x.kind === 'stop').length; }, S.a.nextRef);
    ok(L === 0, `calling tcStop/tcAssignStops with the locked stop ${S.a.nextRef} sets nothing`);
    await pg.click(`[data-act="tcStop"][data-tc-stop="${S.a.frRef}"]`);
    await pg.click('[data-act="tcAssignStops"]');
    const st = await pg.evaluate(() => state.children[0].hw.items.filter((x) => x.kind === 'stop').map((x) => ({ ref: x.ref, lap: x.lap, crs: x.crs, t: x.t })));
    ok(st.length === 1 && st[0].ref === S.a.frRef && st[0].lap === 1 && st[0].crs === 'honey', `the frontier stop is set for Ahana (${JSON.stringify(st[0])})`);
  }

  /* ================= 4. chapters: ahead of the Atlas (granted), and the plan's (never) ================= */
  let AHEAD = null;
  {
    /* every family opened (its own toggle), read, and closed again */
    await pg.evaluate(() => { [...document.querySelectorAll('[data-act="tcFam"]')].map((b) => b.dataset.arg).forEach((f) => app.tcFam(f)); });
    const C = await pg.evaluate(() => { const opts = [...document.querySelectorAll('[data-tc-ch]')];
      const ahead = opts.filter((e) => e.dataset.tcState === 'ahead').map((e) => +e.dataset.tcCh).filter((ci) => { const t = SB_TRAIL_TAUGHT(ci); return t && t.actId !== 'meadow'; });
      const plan = opts.filter((e) => e.dataset.tcState === 'plan');
      const pick = ahead[0], el = document.querySelector(`[data-tc-ch="${pick}"]`), pl = plan[0];
      return { pick, title: state.conceptData[pick].title, fam: el.closest('[data-tc-fam]') && el.closest('[data-tc-fam]').dataset.tcFam, aheadTxt: el.textContent, aheadDis: el.disabled,
        plan: pl && +pl.dataset.tcCh, planTxt: pl && pl.textContent, planDis: pl && pl.disabled, planAdv: pl && !!state.conceptData[+pl.dataset.tcCh].adv, nAhead: ahead.length, nPlan: plan.length,
        locked: !isConceptUnlocked(pick), sug: [...document.querySelectorAll('[data-tc-sug] [data-tc-ch]')].map((e) => +e.dataset.tcCh), fr: SB_TRAIL_NEXT().arg }; });
    await pg.evaluate(() => { state.tc.fams = {}; render(); });
    AHEAD = C;
    ok(C.nAhead > 10 && /Ahead of Ahana.s Atlas/.test(C.aheadTxt) && !C.aheadDis && C.locked, `a chapter ahead of Ahana's Atlas is offered and marked ("${C.aheadTxt.replace(/\s+/g, ' ').slice(0, 90)}") — and is locked for her now`);
    ok(C.nPlan > 0 && C.planAdv && /Needs the Advanced Pack/.test(C.planTxt) && C.planDis, `a plan-locked chapter (the Advanced Pack, not on this household) says it needs the pack and cannot be ticked (${C.nPlan} of them)`);
    const sugFirst = await pg.evaluate((fr) => { const u = SB_TRAIL.honey.units.find((x) => x.id === fr); return u && u.gi; }, C.fr);
    ok(C.sug[0] === sugFirst, `the chapters the stops teach come first (the frontier stop's own chapter, ${sugFirst})`);
    /* the plan lock, by calling the actions */
    const P = await pg.evaluate((ci) => { app.tcCh(ci); app.tcAssignChs(); return state.children[0].hw.items.filter((x) => x.kind === 'concept').length; }, C.plan);
    ok(P === 0, 'calling tcCh/tcAssignChs on the plan-locked chapter assigns nothing — homework never lifts a plan lock');
    /* and the concept lock itself: a grant written onto the record for a plan-locked chapter still opens nothing */
    const F = await pg.evaluate((ci) => { const h = state.children[0].hw, n = h.items.length; h.items.push({ id: 999, kind: 'concept', ref: ci, t: state.conceptData[ci].title, grant: 1, at: '2026-10-01', due: null, done: null, by: 'grown-up' });
      const open = isConceptUnlocked(ci); h.items.splice(n, 1); return open; }, C.plan);
    ok(F === false, 'a grant forged onto the record for an Advanced Pack chapter leaves it shut — a plan lock is the plan\'s');
    await pg.evaluate(() => { state.tc.chs = {}; render(); });
    /* assign the ahead chapter by tap (its family opened first) */
    await pg.click(`[data-tc-fam="${C.fam}"] > [data-act="tcFam"]`);
    await pg.click(`[data-act="tcCh"][data-tc-ch="${C.pick}"]`);
    await pg.click('[data-act="tcAssignChs"]');
    const G = await pg.evaluate((ci) => { const it = state.children[0].hw.items.find((x) => x.kind === 'concept' && +x.ref === ci);
      const me = isConceptUnlocked(ci); state.activeIdx = 1; const sib = isConceptUnlocked(ci); state.activeIdx = 0;
      return { it: it && { grant: it.grant, t: it.t }, me, sib, title: state.conceptData[ci].title, sibHw: state.children[1].hw }; }, C.pick);
    ok(G.it && G.it.grant === 1 && G.it.t === G.title, 'assigning it writes a homework item carrying the grant and the chapter\'s title');
    ok(G.me === true && G.sib === false && G.sibHw === undefined, 'the concept lock opens it for Ahana — and not for Ravi');
    /* the library's own opener, as each child */
    await pg.evaluate(() => app.goHome()); await until(pg, () => state.nav === 'home');
    const asA = await pg.evaluate(async (ci) => { app.openConcept(ci); await new Promise((r) => setTimeout(r, 200)); const r = { nav: state.nav, sel: state.conceptSel && state.conceptSel.title }; app.goHome(); return r; }, C.pick);
    await pg.evaluate(() => SB_SHELL.switchChild(1)); await until(pg, () => state.activeIdx === 1 && state.nav === 'home');
    const asR = await pg.evaluate(async (ci) => { app.openConcept(ci); await new Promise((r) => setTimeout(r, 200)); return { nav: state.nav, sel: state.conceptSel && state.conceptSel.title }; }, C.pick);
    ok(asA.nav === 'concepts' && asA.sel === C.title && !(asR.nav === 'concepts' && asR.sel === C.title), `the library's opener (openConcept) opens it for Ahana ("${C.title.split(' — ')[0]}") and not for Ravi (${asR.nav})`);
    await pg.evaluate(() => { state.pinDlg = null; state.showTiers = false; SB_SHELL.switchChild(0); }); await until(pg, () => state.activeIdx === 0 && state.nav === 'home');
  }

  /* ================= 5. print: the answer key, the chapter's text, the stop's grade-map line ================= */
  {
    await pg.evaluate(() => { state.pinDlg = null; app.openTeacher(); }); await pin(pg, '1234'); await settledList(pg);
    await pg.evaluate(() => { window.__printed = 0; window.print = () => { window.__printed++; }; });
    const draft = await listNow(pg);
    await pg.click('[data-act="tcPrint"][data-arg="draft"]');
    await until(pg, () => !!document.querySelector('.tc-print .tc-key'), null, 10000);
    const K = await pg.evaluate(() => { const rows = [...document.querySelectorAll('.tc-print .tc-key tbody tr')].map((tr) => [...tr.children].map((td) => td.textContent.trim()));
      const idx = Object.create(null); (SB_DATA.nsf || []).forEach((r) => { if (r && r.w && !idx[r.w]) idx[r.w] = r; });
      return { rows, head: [...document.querySelectorAll('.tc-print .tc-key thead th')].map((x) => x.textContent), recs: rows.map((r) => { const x = idx[r[1]] || {}; return [x.p || '', x.d || '', x.s || '']; }) }; });
    ok(K.head.join('|') === '#|Word|Say it|Meaning|In a sentence' && K.rows.length === draft.length && K.rows.every((r, i) => r[1] === draft[i]),
      `the print view's answer key has a row per word of the list (${K.rows.length}), in its order`);
    ok(K.rows.every((r, i) => r[3] && r[3] === K.recs[i][1] && r[2] === K.recs[i][0]) && K.rows.filter((r) => r[4]).length >= Math.ceil(K.rows.length * 0.6),
      'each row carries the word\'s own respelling and meaning, and most a sentence — read from the library\'s record');
    await pg.click('[data-act="tcPrintGo"]');
    ok((await pg.evaluate(() => window.__printed)) === 1, 'Print calls window.print once — nothing is downloaded or sent');
    await pg.emulateMedia({ media: 'print' });
    const pm = await pg.evaluate(() => ({ head: getComputedStyle(document.querySelector('.sb-header-sticky')).display, bar: getComputedStyle(document.querySelector('.tc-pbar')).display }));
    await pg.emulateMedia({ media: 'screen' });
    ok(pm.head === 'none' && pm.bar === 'none', 'printed, the app\'s top bar and the print view\'s own buttons are hidden');
    await pg.click('[data-act="tcPrintBack"]'); await settledList(pg);
    await pg.click('[data-act="tcPrint"][data-arg="all"]');
    await until(pg, () => !!document.querySelector('.tc-print') && !/Loading the grade map/.test(document.querySelector('.tc-print').innerText), null, 20000);
    const all = await pg.evaluate((ci) => { const t = document.querySelector('.tc-print').innerText; const ch = state.conceptData[ci];
      return { keys: document.querySelectorAll('.tc-print .tc-key').length, stop: /Atlas stop:[\s\S]*Where it sits in school: US /.test(t), grade: /US Grade \d/.test(t), chText: t.indexOf(String(ch.concept || '').slice(0, 40)) >= 0, chTitle: t.indexOf(ch.title.split(' — ')[0]) >= 0 }; }, AHEAD.pick);
    ok(all.keys === 1 && all.stop && all.grade && all.chText && all.chTitle, 'the whole homework prints: the list with its key, the stop with its line on the grade map (US / UK / CBSE, sourced), the chapter with its own text');
    await pg.click('[data-act="tcPrintBack"]'); await settledList(pg);
  }

  /* ================= 6. axe, light and dusk ================= */
  if (AXE) {
    await pg.addScriptTag({ path: AXE });
    for (const mode of ['light', 'dusk']) {
      await pg.evaluate((m) => { state.mode = m; render(); }, mode); await settledList(pg);
      const v = await pg.evaluate(async () => { const r = await axe.run(document.querySelector('.sb-content'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }, resultTypes: ['violations'] });
        return r.violations.map((x) => x.id + ' (' + x.nodes.length + ': ' + x.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ') + ')'); });
      ok(!v.length, `axe finds nothing on the Corner in ${mode}` + (v.length ? ' — ' + v.join('; ') : ''));
    }
    await pg.evaluate(() => { state.mode = 'light'; render(); });
  } else ok(false, 'axe-core is not installed — symlink the main checkout\'s node_modules');
  await ctx.close();

  /* ================= 7. keyboard only: Tab and Enter from Home ================= */
  {
    const { ctx, pg } = await open({ n: 'keyboard', w: 1280, h: 900 });
    await pg.evaluate(() => app.goHome()); await until(pg, () => state.nav === 'home' && !!document.querySelector('.sb-fam-lock'));
    const tabTo = async (sel, max) => { for (let i = 0; i < (max || 200); i++) { if (await pg.evaluate((s) => { const a = document.activeElement; return !!a && a.matches(s); }, sel)) return true; await pg.keyboard.press('Tab'); } return false; };
    let k = await tabTo('.sb-fam-lock'); await pg.keyboard.press('Enter');
    k = k && await until(pg, () => !!state.pinDlg, null, 5000);
    for (const d of '1234') await pg.keyboard.press(d);
    k = k && await until(pg, () => !!document.querySelector('[data-pz-teach] [data-act="openTeacher"]'), null, 30000);
    k = k && await tabTo('[data-pz-teach] [data-act="openTeacher"]'); await pg.keyboard.press('Enter');
    k = k && await settledList(pg);
    k = k && await tabTo('[data-act="tcKid"][data-arg="1"]'); await pg.keyboard.press('Enter');
    k = k && await until(pg, () => state.tc && state.tc.k === 1 && !!document.querySelector('[data-tc-list]'), null, 20000);
    k = k && await tabTo('[data-act="tcSrc"][data-arg="level"]'); await pg.keyboard.press('Enter');
    k = k && await until(pg, () => state.tc.src === 'level' && !!document.querySelector('[data-tc-list]'), null, 20000);
    const want = await listNow(pg);
    k = k && await tabTo('[data-act="tcAssignWords"]'); await pg.keyboard.press('Enter');
    const R = await pg.evaluate(() => { const h = state.children[1].hw; return { items: h ? h.items.map((x) => ({ kind: x.kind, src: x.src && x.src.k, ws: x.words.map((w) => w.w) })) : [], ahana: state.children[0].hw }; });
    ok(k && R.items.length === 1 && R.items[0].src === 'level' && R.items[0].ws.join() === want.join() && R.ahana === undefined,
      `keyboard only (Tab and Enter, the PIN typed): the lock, the Parent Zone's door, Ravi, a level list, Set — Ravi has the ${want.length} words, Ahana nothing`);
    await ctx.close();
  }

  /* ================= 8. touch only, on a phone ================= */
  {
    const { ctx, pg } = await open({ n: 'phone', w: 390, h: 844, m: 1 });
    await pg.evaluate(() => app.goHome()); await until(pg, () => state.nav === 'home' && !!document.querySelector('.sb-fam-lock'));
    await pg.tap('.sb-fam-lock'); await until(pg, () => !!state.pinDlg);
    for (const d of '1234') await pg.tap(`[data-pin-dlg] [data-act="pinKey"][data-arg="${d}"]`);
    await until(pg, () => !!document.querySelector('[data-pz-teach] [data-act="openTeacher"]'), null, 30000);
    await pg.tap('[data-pz-teach] [data-act="openTeacher"]');
    let t = await settledList(pg);
    const fr = await pg.evaluate(() => document.querySelector('[data-tc-stop]').dataset.tcStop);
    await pg.tap(`[data-act="tcStop"][data-tc-stop="${fr}"]`); await pg.tap('[data-act="tcAssignStops"]');
    const fam = await pg.evaluate((ci) => catGroup(state.conceptData[ci].category), AHEAD.pick);
    await pg.tap(`[data-tc-fam="${fam}"] > [data-act="tcFam"]`);
    await pg.tap(`[data-act="tcCh"][data-tc-ch="${AHEAD.pick}"]`); await pg.tap('[data-act="tcAssignChs"]');
    const R = await pg.evaluate(() => { const h = state.children[0].hw; return { items: h ? h.items.map((x) => x.kind + ':' + x.ref + (x.grant ? ':grant' : '')) : [], sw: document.documentElement.scrollWidth }; });
    ok(t && R.items.join() === `stop:${fr},concept:${AHEAD.pick}:grant`, `touch only on a 390px phone (taps: the lock, the keypad, the door, a stop, a chapter in its family): ${R.items.join(' · ')}`);
    ok(R.sw <= 390, `the Corner fits the phone (${R.sw}px wide)`);
    await ctx.close();
  }

  ok(!errs.length, 'no page errors' + (errs.length ? ' — ' + [...new Set(errs)].slice(0, 4).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nthe Teacher\'s Corner holds');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
