/* team-night-walk.cjs — TEAM NIGHT, WALKED IN A REAL PAGE AGAINST THE REAL CIRCUIT (circuit/BEE-CIRCUIT.md §8.2, §13 tests
   6 and 7; BUILD-halls.md "Left": "a Team Night REAL walk in the browser").

   circuit-team.cjs plays 204 nights in a node VM against a recording stub of the Circuit, and circuit-mail plays Team
   Night's mail against a stubbed night. Nothing walked the real thing end to end: the real circuit.js deciding the night
   may open, the pin on the Big Stage board, the screens a child reads, the keys and the taps, and the night's report
   landing in the real Circuit. This does, once by touch on a phone and once by keyboard on a desktop.

   SEASON   The nine halls are played through the REAL Circuit's own API (onHallOpen, onHall), in story order. With eight
            of them, teamOpen() says no and the Big Stage board has no Team Night pin; with the ninth it says yes.
   PIN      The Team Night pin stands on the Big Stage board and opens the lobby — a tap on the phone, Tab-focus and Enter
            on the desktop — and the lobby's Start the same way.
   CALLS    Every call is made the child's way: on the phone a tap on the Pronouncer, a tap on a call and a tap on
            "Send it"; on the desktop a click on the Pronouncer, then the call's number key and Enter. The careful caller
            names the right call every time, and the graded call is the one sent.
   WORDS    The child's own words are spelt on the phone's letter keys (the kit keyboard: the input is read-only on a
            touch screen) and typed on the desktop's keyboard, Enter to send. On the phone the levelling word is missed
            first: the second try opens, a teammate's help is asked by a tap and shows on the card, and the word spelt
            then levels the score.
   LEAK     The word is nowhere on the stage while it is asked — on a call, on the child's own turn, on the second try
            (a teammate's help masks it) — until the answer stands on the card or the turn is over.
   44PX     On the phone, every control on a call and on the child's own turn is at least 44 × 44.
   OUTCOME  The Circuit wins (§13 t7), by at least one; the finish card says so.
   PAY      (§13 t6) the finish card's coins are the ledger's change (tests/lib/coins.cjs); the ledger holds an answer coin
            for each own word right first time and one contest event (the careful caller's merit is over 70%), nothing else.
   REPORT   The night reaches the REAL Circuit: halls.team is recorded, and the mail holds the bee file (bee.team.1), the
            stamp (stamp.team) and Team Night's beats — the levelling beat chosen by how the levelling word went:
            teamNight.beats.levellingMiss on the phone (missed first), teamNight.beats.levelling on the desktop.
   REPLAY   (desktop) "Play the second team", reached by Tab and Enter: the replay is won by at least one, with no drama
            word and no tiebreaker, and reports replay:true; the season's beats are not delivered twice.
   Its first full run found a real fault: the Mock Bee's letter keys (the halls' and Team Night's too) were 42.7px wide at
   390 — the bee's old 16px stage padding inside the kit's gutter; every other game's kit keys are 48. Fixed in index.html
   (`.sb-stage.mb-stage .mb-keys` takes the control row's gutter: 45.8px), and tests/touch-targets.cjs now measures a Mock
   Bee turn. (The first cut of 44PX measured bounding boxes and also flagged "← Leave", 75×35 with its 44px hit area; it
   now uses touch-targets' own measure — the 44px circle hit-tested at eight points.)
   Proved by breaking (15 Oct 2026; each a scratch root of symlinks with ONE file replaced, the test run with SB_ROOT on it,
   the tree untouched; ONLY= the walk that reaches the fault):
     · mockbee.js never telling the Circuit (`circTell(… onTeamNight(r))` taken out) → 2 fail (desktop REPORT: nothing
       recorded, no mail; REPLAY: no bee file);
     · trail.js drawing the Team Night pin whatever teamOpen() says (`const teamOk = true`) → 1 fails (SEASON: a pin at
       eight halls);
     · mockbee.js printing the word on a call ("Who takes this word? <word>") → 1 fails (LEAK, every call);
     · mockbee.js paying an answer coin for finishing → 1 fails (PAY: the ledger took 14, the card said 13);
     · circuit.js delivering the first-try levelling beat whatever happened (`deliver(o, base + 'levelling')`) → phone
       REPORT fails (levelling where levellingMiss was owed);
     · mockbee.js's call buttons 30px tall → phone 44PX fails (every call).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/team-night-walk.cjs                                          */
'use strict';
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), vm = require('vm');
const { serve } = require('./lib/serve.cjs');
const { booted, until, frames, quietRender } = require('./lib/wait.cjs');
const coins = require('./lib/coins.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; return b; };
const some = (a) => a.length ? ' — ' + a.slice(0, 5).join(' | ') : '';

/* a child who has walked the Word Atlas to the Big Stage's last stop (the same road circuit-halls-board walks) */
const T = (() => { const c = { window: null }; c.window = c; vm.createContext(c);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'trail-data.js'), 'utf8'), c); vm.runInContext(fs.readFileSync(path.join(ROOT, 'trail-road.js'), 'utf8'), c); return c; })();
const NODES = T.SB_TRAIL_ROAD.nodes(T.SB_TRAIL, 'honey', 1);
function kidAt(upto) {
  const last = NODES.map(n => n.act).lastIndexOf(upto); const done = {}, chk = {};
  NODES.slice(0, last).forEach(n => { if (n.kind === 'unit') done[n.u.id] = { 1: 90 }; else chk['1:' + n.id] = 90; });
  return { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 0,
    lists: { journey: { xp: 12 } }, activeList: 'journey', missed: [], unlockedThemes: ['spellbound'],
    trail: { lap: 1, done, chk, seen: {}, st: {}, elap: 1, edone: {}, echk: {} } };
}

(async () => {
  const srv = await serve(ROOT, {});
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];

  async function open(phone) {
    const ctx = await b.newContext({ viewport: phone ? { width: 390, height: 844 } : { width: 1280, height: 800 }, isMobile: phone, hasTouch: phone, deviceScaleFactor: 1, serviceWorkers: 'block' });
    const seed = { theme: 'spellbound', mode: 'light', pin: '2468', activeIdx: 0, children: [kidAt('stage')] };
    await ctx.addInitScript((s) => {
      if (/storage-probe\.html$/.test(location.pathname)) return;
      if (!sessionStorage.getItem('t_tn')) { localStorage.clear(); localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_splash', '0'); sessionStorage.setItem('t_tn', '1'); }
      window.Audio = function () { return { play: () => Promise.resolve(), pause: () => {}, addEventListener: () => {} }; };
      try { speechSynthesis.speak = () => {}; speechSynthesis.cancel = () => {}; } catch (e) {}
    }, seed);
    const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push((phone ? 'phone: ' : 'desktop: ') + e.message.slice(0, 200)));
    await pg.goto(srv.url + 'index.html'); await booted(pg);
    await until(pg, () => { try { return SB_SHELL.nextStep().ready; } catch (e) { return false; } }, null, 30000);
    await pg.evaluate(() => new Promise(r => SB_LAZY.need(['words1', 'atlas', 'circuit'], r)));
    /* a record to level with: forty words mastered on evidence (box 2+), as circuit-team's careful child has */
    await pg.evaluate(() => { const c = active(); c.mast = c.mast || {};
      (SB_DATA.nsf || []).filter(w => w && w.w && /^[a-z]{4,9}$/.test(w.w) && (w.y || 3) <= 4 && w.d && w.d.length > 8).slice(300, 340)
        .forEach(w => { c.mast[w.w] = { b: 2, due: 0, ok: 3, n: 3, at: Date.now() - 3 * 864e5 }; }); save(); });
    return { ctx, pg };
  }
  /* the Big Stage's board, laid out and settled */
  async function board(pg) {
    await pg.evaluate(() => app.trailHere('honey|stage'));
    const laid = await until(pg, () => { if (state.nav !== 'trail' || state.trailAct !== 'stage') return false; const im = document.querySelector('#sb-pan .act-board img');
      return !!im && im.complete && im.naturalWidth > 0 && document.querySelectorAll('.act-board .atlas-stop').length > 0; }, null, 30000);
    if (laid) { await quietRender(pg); await frames(pg, 2); }
    await pg.evaluate(() => { state.trailStop = -9; render(); });   /* fold the stop card away, as a child does before tapping a pin it covers */
    await until(pg, () => !document.querySelector('.atlas-pop')); await quietRender(pg); await frames(pg, 2);
    return laid;
  }
  /* the season, through the real Circuit's own API: n halls in story order */
  const season = (pg, n) => pg.evaluate((n) => { const C = SB_CIRCUIT; const acts = SB_CIRCUIT_DATA.rounds.map(r => r.act).slice(0, n);
    acts.forEach((a) => { C.onHallOpen(a); C.onHall(a, { place: 2, of: 6, above: false,
      words: [{ w: 'rhythm', ok: true, asks: 1 }, { w: 'separate', ok: true, asks: 0 }, { w: 'knife', ok: false, asks: 2 }], missed: ['knife'] }); });
    return { acts: acts.length, open: !!C.teamOpen(active()) }; }, n);
  const mail = (pg, re) => pg.evaluate((src) => { const R = new RegExp(src); return SB_CIRCUIT.state(active()).mail.filter(m => R.test(m.key)).map(m => m.key); }, re);

  /* the Circuit's moment card ("New mail in the Hive Post") stands over the board after the halls' mail: the child closes
     it — Close by a tap on the phone, Esc on the desktop — before the pin under it can be tapped */
  async function closeMoments(pg, phone) {
    let n = 0;
    for (; n < 12; n++) {
      if (!(await until(pg, () => !!document.querySelector('.hp-moment'), null, 1500))) break;
      if (phone) await pg.tap('.hp-moment [data-hp="close"]'); else await pg.keyboard.press('Escape');
      await until(pg, () => !document.querySelector('.hp-moment') || document.querySelector('.hp-moment').dataset.n !== String(window.__mn), null, 3000);
      await quietRender(pg, 80); await frames(pg, 2);
    }
    return n;
  }
  /* press a control the child's way: a tap on the phone; Tab to it and Enter on the desktop */
  async function press(pg, phone, sel) {
    if (phone) { await pg.tap(sel); return; }
    if (!(await until(pg, (q) => !!document.querySelector(q), sel, 15000))) throw new Error('no ' + sel + ' on the page');
    await pg.evaluate(() => { const a = document.activeElement; if (a && a !== document.body) a.blur(); });
    let on = false;
    for (let t = 0; t < 120 && !on; t++) { await pg.keyboard.press('Tab'); on = await pg.evaluate((q) => { const a = document.activeElement; return !!a && !!a.matches && a.matches(q); }, sel); }
    if (!on) throw new Error('Tab never reached ' + sel + ' ' + JSON.stringify(await pg.evaluate(() => { const a = document.activeElement; return { a: a && (a.outerHTML || '').slice(0, 160), traps: [...document.querySelectorAll('[data-trap]')].map(e => e.className), moment: !!document.querySelector('.hp-moment'), view: state.mb && state.mb.view, phase: state.mb && state.mb.phase }; })));
    await pg.keyboard.press('Enter');
  }
  /* tests/touch-targets.cjs's measure (as tests/analogy-halls-stage.cjs carries it), on the stage's controls as they stand:
     the 44px circle round each control's centre, hit-tested at eight points, every one landing on the control — so an
     invisible 44px hit area (a11y.css) counts and a box that merely looks big enough does not. The first cut of this
     check measured bounding boxes and flagged "← Leave" (75×35, with its 44px ::before) and the kit's 43px-wide letter
     keys, both of which pass the project's own measure. */
  const small = async (pg) => { let r = null;
    for (let tries = 0; tries < 3; tries++) { await quietRender(pg, 300);
      r = await pg.evaluate(async () => {
        const SEL = 'button, a[href], [data-act], input, select, textarea, [role="button"], summary';
        const els = [...document.querySelectorAll('.sb-stage ' + SEL.split(', ').join(', .sb-stage '))].filter(e => !e.closest('[aria-hidden="true"]') && !(e.parentElement && e.parentElement.closest(SEL)) && !e.disabled
          && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).pointerEvents !== 'none');
        const out = []; let detached = 0;
        for (const e of els) {
          if (!e.isConnected) { detached++; continue; }
          e.scrollIntoView({ block: 'center', inline: 'center' }); await new Promise(r => requestAnimationFrame(r));
          if (!e.isConnected) { detached++; continue; }
          const q = e.getBoundingClientRect(), cx = (q.left + q.right) / 2, cy = (q.top + q.bottom) / 2;
          const label = (e.getAttribute('aria-label') || e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 18) + ' ' + Math.round(q.width) + '×' + Math.round(q.height);
          if (cx < 22 || cx > innerWidth - 22 || cy < 22 || cy > innerHeight - 22) { out.push(label + ' (too near the edge)'); continue; }
          const pts = [[-15, -15], [0, -21], [15, -15], [-21, 0], [21, 0], [-15, 15], [0, 21], [15, 15]];
          const miss = pts.map(([dx, dy]) => [dx, dy, document.elementFromPoint(cx + dx, cy + dy)]).filter(([, , h]) => !(h && (h === e || e.contains(h))));
          if (miss.length) { const [dx, dy, h] = miss[0]; out.push(label + ' (at ' + dx + ',' + dy + ': ' + (h ? h.tagName.toLowerCase() + '.' + String(h.className || '').split(' ').filter(Boolean).slice(0, 2).join('.') : 'nothing') + ')'); } }
        window.scrollTo(0, 0); return { out, detached }; });
      if (!r.detached) break; }
    return r.detached ? r.out.concat([r.detached + ' controls replaced while measured']) : r.out; };
  /* the word printed anywhere on the stage (case-insensitive, as a whole word) */
  const leaks = (pg) => pg.evaluate(() => { const g = state.mb, w = g && g.st && g.st.w && g.st.w.w; if (!w) return null;
    const t = (document.querySelector('.sb-stage') || {}).innerText || '';
    const esc = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); return new RegExp('(^|[^a-z])' + esc + '($|[^a-z])', 'i').test(t) ? w : null; });

  /* one night, played the careful way; `missLevel` misses the levelling word first (the phone) */
  async function play(pg, phone, o) {
    o = o || {};
    const out = { calls: 0, callsRight: 0, own: 0, leak: [], small: [], asked: 0, help: false, levelSecond: false, phases: new Set(), steps: 0 };
    const ACT = () => { const g = state.mb; if (!g) return true; if (g.view === 'result') return true;
      return g.phase === 'tCall' || g.phase === 'me' || (g.phase === 'meDone' && !!g.hold); };
    for (let k = 0; k < 120; k++) {
      if (!(await until(pg, ACT, null, 60000))) { out.stuck = await pg.evaluate(() => state.mb && [state.mb.view, state.mb.phase].join('/')); break; }
      await quietRender(pg, 80); await frames(pg, 2);
      const s = await pg.evaluate(() => { const g = state.mb; if (!g || g.view === 'result') return { end: true };
        const C = MOCKBEE.circuit.calls().filter(x => x[g.lect]);
        return { phase: g.phase, kind: g.st && g.st.kind, w: g.st && g.st.w && g.st.w.w, right: C.findIndex(x => x.call === g.st.cls),
          lev: g.tlev ? { second: g.tlev.second, shown: g.tlev.shown, misses: g.tlev.misses } : null, key: [g.i, g.phase, g.tlev && g.tlev.misses, g.tlev && g.tlev.second].join('|') }; });
      if (s.end) { out.done = true; break; }
      out.steps++; out.phases.add(s.phase);
      if (s.phase === 'tCall') {
        out.calls++;
        const lk = await leaks(pg); if (lk) out.leak.push('call: ' + lk);
        if (phone && out.calls === 1) { const sm = await small(pg); out.small.push(...sm.map(x => 'call: ' + x)); }
        /* ask the Pronouncer for the definition first, as a child is taught to */
        const ask = '.sb-stage [data-act="mbAsk"][data-arg="def"]';
        if (await pg.$(ask)) { if (phone) await pg.tap(ask); else await pg.click(ask); out.asked++;
          await until(pg, () => !!document.querySelector('.sb-stage .mb-answers'), null, 5000); await frames(pg, 1);
          const lk2 = await leaks(pg); if (lk2) out.leak.push('call, after the definition: ' + lk2); }
        if (phone) { await pg.tap(`.tn-callb[data-arg="${s.right}"]`); await pg.tap('[data-act="tnSend"]'); }
        else { await pg.evaluate(() => document.activeElement && document.activeElement.blur()); await pg.keyboard.press(String(s.right + 1)); await pg.keyboard.press('Enter'); }
        const sent = await until(pg, (n) => state.mb.calls.length >= n, out.calls, 10000);
        if (sent && await pg.evaluate(() => { const c = state.mb.calls[state.mb.calls.length - 1]; return c && c.right; })) out.callsRight++;
      } else if (s.phase === 'me') {
        if (s.lev && s.lev.shown) { await press(pg, phone, '[data-act="tnLevelOn"]'); }
        else {
          const lk = await leaks(pg); if (lk) out.leak.push((s.kind === 'level' ? (s.lev && s.lev.second ? 'second try' : 'levelling word') : 'own word') + ': ' + lk);
          if (phone && !out.small.some(x => /^own:/.test(x)) && !(s.lev && s.lev.second)) { const sm = await small(pg); out.small.push(...sm.map(x => 'own: ' + x)); }
          let typed = s.w;
          if (s.kind === 'level' && o.missLevel && !s.lev.second) typed = 'qzxqzx';                 /* miss it first */
          if (s.kind === 'level' && s.lev && s.lev.second) {                                         /* the second try: a teammate helps */
            out.levelSecond = true;
            const help = await pg.$('.sb-stage [data-act="tnHelp"]:not([disabled])');
            if (help) { const sel = '.sb-stage [data-act="tnHelp"]:not([disabled])'; if (phone) await pg.tap(sel); else await pg.click(sel);
              out.help = await until(pg, () => !!document.querySelector('.sb-stage .tn-help ~ .mb-answers, .sb-stage .mb-answers'), null, 5000);
              const lk3 = await leaks(pg); if (lk3) out.leak.push('second try, with a teammate\'s help: ' + lk3); }
          }
          if (s.kind !== 'level' || !(s.lev && s.lev.second) || true) {
            if (phone) {
              if (/^[a-z]+$/.test(typed)) { for (const ch of typed) await pg.tap(`.sg-keys .sg-key[data-k="${ch}"]`); await pg.tap('.sg-keys .sg-key.enter'); }
              else { await pg.evaluate((t) => { app.mbType(t); app.mbSpell(); }, typed); out.typedByApp = (out.typedByApp || 0) + 1; }
            } else { await pg.focus('#mb-in'); await pg.keyboard.type(typed); await pg.keyboard.press('Enter'); }
          }
          if (s.kind !== 'level' || !(o.missLevel && !s.lev.second)) out.own++;
        }
      } else if (s.phase === 'meDone') { await pg.evaluate(() => app.mbGoOn()); }
      await until(pg, (key) => { const g = state.mb; return !g || g.view === 'result' || [g.i, g.phase, g.tlev && g.tlev.misses, g.tlev && g.tlev.second].join('|') !== key; }, s.key, 30000);
    }
    return out;
  }

  const LOOKS = (process.env.ONLY || 'phone,desktop').split(',');   /* ONLY=desktop runs one */
  for (const phone of [true, false].filter(x => LOOKS.indexOf(x ? 'phone' : 'desktop') >= 0)) {
    const T0 = phone ? 'phone' : 'desktop';
    const { ctx, pg } = await open(phone);
    /* SEASON: eight halls do not open the night; the ninth does */
    const s8 = await season(pg, 8);
    await board(pg);
    const pin8 = await pg.evaluate(() => !!document.querySelector('.circ-team'));
    ok(s8.acts === 8 && !s8.open && !pin8, `${T0} SEASON: eight halls played through the real Circuit — teamOpen() says no, and the Big Stage board has no Team Night pin`);
    const s9 = await season(pg, 9);
    await pg.evaluate(() => render());
    const pin9 = await until(pg, () => !!document.querySelector('.circ-team'), null, 15000);
    ok(s9.open && pin9, `${T0} SEASON: with the ninth, teamOpen() says yes and the Team Night pin stands on the Big Stage board`);
    await board(pg);
    const moments = await closeMoments(pg, phone);
    /* PIN: the pin opens the lobby, Start starts the night */
    await press(pg, phone, '.circ-team');
    const lobby = await until(pg, () => state.mb && state.mb.mode === 'team' && !!document.querySelector('.sb-stage .tn-lobby'), null, 30000);
    await quietRender(pg); await frames(pg, 2);
    const m0 = await coins.mark(pg);
    await press(pg, phone, '[data-act="mbStart"]');
    const started = await until(pg, () => state.mb && state.mb.view === 'stage', null, 15000);
    ok(lobby && started, `${T0} PIN: the Team Night pin opens the lobby and Start starts the night (${phone ? 'taps' : 'Tab to it, then Enter'})`);
    const p = await play(pg, phone, { missLevel: phone });
    const g = await pg.evaluate(() => { const g = state.mb; return g && { won: g.won, margin: g.margin, score: g.score, view: g.view, merit: g.merit,
      own: g.mine.filter(m => m.kind === 'team').map(m => ({ w: m.w, ok: m.ok })), calls: g.calls.length, callsRight: g.calls.filter(x => x.right).length,
      tlog: (g.tlog || []).map(e => e.k), card: (document.querySelector('.sb-stage .mb-result') || {}).innerText || '' }; });
    ok(p.done && g && g.view === 'result', `${T0}: the night is played to its finish card (${p.steps} turns of the child's, ${p.calls} calls, ${p.own} own words)` + (p.stuck ? ' — stuck at ' + p.stuck : ''));
    ok(p.calls >= 3 && p.callsRight === p.calls && g.callsRight === g.calls, `${T0} CALLS: every call made the child's way — ${phone ? 'a tap on a call, a tap on Send it' : 'its number key, then Enter'} — ${p.callsRight} of ${p.calls} right, and the Pronouncer asked ${p.asked} times`);
    ok(!p.leak.length, `${T0} LEAK: the word is nowhere on the stage while it is asked (calls, own words${phone ? ', the second try and its help' : ''})` + some(p.leak));
    if (phone) {
      ok(!p.small.length, `${T0} 44PX: every control on a call and on the child's own turn is at least 44 × 44` + some(p.small));
      ok(p.levelSecond && p.help, `${T0} WORDS: the levelling word missed first opens the second try; a teammate's help, asked by a tap, shows on the card`);
      ok(!p.typedByApp, `${T0} WORDS: every own word was spelt on the phone's letter keys` + (p.typedByApp ? ` — ${p.typedByApp} had a letter the keys do not carry` : ''));
    }
    ok(g && g.won && g.margin >= 1 && /The Circuit wins/.test(g.card), `${T0} OUTCOME: the Circuit wins, ${g && g.score.c} to ${g && g.score.r}, and the card says so`);
    /* PAY */
    const r = await coins.since(pg, m0); const shown = await coins.cardCoins(pg, '.sb-stage .mb-pay');
    const firstRight = g.own.filter(x => x.ok).length;
    const want = Array(firstRight).fill('answer').concat(g.merit >= 0.7 ? ['contest'] : []);
    ok(shown === r.earned && r.earned === r.balance && JSON.stringify(r.events.slice().sort()) === JSON.stringify(want.slice().sort()),
      `${T0} PAY: the card's ${shown} coins are the ledger's change (${r.earned}: ${r.events.join(', ') || 'none'}) — an answer coin for each of ${firstRight} own words right first time, and the contest event once (merit ${Math.round((g.merit || 0) * 100)}%)`);
    /* REPORT: the real Circuit */
    const rec = await until(pg, () => { try { const t = SB_CIRCUIT.state(active()).halls.team; return !!(t && t.done); } catch (e) { return false; } }, null, 15000);
    const keys = await mail(pg, '^(bee\\.team|stamp\\.team|teamNight\\.beats\\.levelling)');
    const beat = phone ? 'teamNight.beats.levellingMiss' : 'teamNight.beats.levelling';
    const other = phone ? 'teamNight.beats.levelling' : 'teamNight.beats.levellingMiss';
    ok(rec && keys.indexOf('bee.team.1') >= 0 && keys.indexOf('stamp.team') >= 0 && keys.indexOf(beat) >= 0 && keys.indexOf(other) < 0,
      `${T0} REPORT: the night reaches the real Circuit — halls.team recorded; the mail holds ${keys.join(', ')} (the ${phone ? 'missed-first' : 'first-try'} levelling beat)`);
    if (!phone) {
      /* REPLAY, by Tab and Enter */
      const beats0 = (await mail(pg, '^teamNight\\.beats\\.')).length;
      await press(pg, false, '.sb-stage [data-act="mbAgain"]');
      /* "Play the second team" starts the replay at once (mockbee's mbAgain → teamStart): no second lobby */
      const rl = await until(pg, () => state.mb && state.mb.mode === 'team' && state.mb.replay === true && state.mb.view === 'stage', null, 30000);
      const p2 = await play(pg, false, {});
      const g2 = await pg.evaluate(() => { const g = state.mb; return g && { won: g.won, margin: g.margin, score: g.score, view: g.view, replay: g.replay, tlog: (g.tlog || []).map(e => e.k),
        report: MOCKBEE.circuit.report() }; });
      const beats1 = (await mail(pg, '^teamNight\\.beats\\.')).length;
      const bee2 = await mail(pg, '^bee\\.team\\.');
      ok(rl && p2.done && g2 && g2.replay && g2.won && g2.margin >= 1 && g2.tlog.indexOf('drama') < 0 && g2.tlog.indexOf('tiebreak') < 0,
        `REPLAY: "Play the second team" (Tab and Enter) is won, ${g2 && g2.score.c} to ${g2 && g2.score.r}, with no drama word and no tiebreaker`);
      ok(g2 && g2.report && g2.report.replay === true && beats1 === beats0 && bee2.indexOf('bee.team.2') >= 0,
        `REPLAY: it reports replay:true; the season's beats are not delivered again (${beats0} → ${beats1}); its bee file is ${bee2.join(', ')}`);
    }
    await ctx.close();
  }
  ok(!errs.length, 'no page errors' + some(errs));
  await b.close(); srv.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
